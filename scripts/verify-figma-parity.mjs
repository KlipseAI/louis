#!/usr/bin/env node
// Figma 라이브러리 snapshot과 generated proposal의 parity를 credential 없이 검증한다.
// 실행: node scripts/verify-figma-parity.mjs [--snapshot <path>] [--no-canary]
//
// snapshot은 Figma에서 읽어온 evidence이며 손으로 수정하지 않는다. Figma 접근 실패를
// 통과로 캐시하지 않기 위해, 이 스크립트는 snapshot이 없으면 실패한다.
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const argv = process.argv.slice(2);
const snapshotIndex = argv.indexOf("--snapshot");
const snapshotPath =
  snapshotIndex === -1 ? "figma/snapshot.json" : argv[snapshotIndex + 1];
const runCanary = !argv.includes("--no-canary");

const PROPOSAL_PATH = "packages/tokens/generated/figma.tokens.json";
const MANIFEST_PATH = "packages/tokens/generated/manifest.json";

function readJson(relative) {
  return JSON.parse(readFileSync(resolve(repoRoot, relative), "utf8"));
}

const proposal = readJson(PROPOSAL_PATH);
const manifest = readJson(MANIFEST_PATH);
const proposalSha = createHash("sha256")
  .update(readFileSync(resolve(repoRoot, PROPOSAL_PATH)))
  .digest("hex");

let snapshot;
try {
  snapshot = readJson(snapshotPath);
} catch (error) {
  console.error(
    `[figma-parity] snapshot을 읽을 수 없습니다: ${snapshotPath} (${error.message})`,
  );
  process.exit(1);
}

const COMPONENTS_MEASURED_PATH = "figma/components.measured.json";
const componentsMeasured = readJson(COMPONENTS_MEASURED_PATH);

/**
 * CSS mask의 정지점에서 Figma PROGRESSIVE 흐림의 기대 문자열을 **유도한다.**
 *
 * 두 매체가 같은 것을 다르게 적는다 — CSS는 아래에서부터의 정지점 다섯 개로 곡선을 그리고,
 * Figma는 두 점 사이의 선형 램프다. 계약에 offset을 손으로 옮겨 적으면 정본이 둘이 되어 CSS를
 * 고쳐도 게이트는 옛 값을 계속 통과시킨다. 그래서 measured의 정지점 하나에서 유도한다.
 *
 * 좌표계 변환: 정지점은 **아래에서부터의 %**이고 Figma offset은 **위에서부터의 비율**이다.
 *   - 흐림이 0인 지점(마지막 정지점, remaining 0) → startOffset
 *   - 흐림이 온전한 마지막 지점(remaining 1) → endOffset
 */
function progressiveBlurFrom(measuredId, sizeKey, blurVariable) {
  const spec = componentsMeasured.components?.[measuredId]?.sizes?.[sizeKey];
  const stops = spec?.overlayMaskStops;
  if (!Array.isArray(stops) || stops.length < 2) return null;
  const zero = [...stops].reverse().find(([, remaining]) => remaining === 0);
  const full = [...stops].reverse().find(([, remaining]) => remaining === 1);
  if (zero === undefined || full === undefined) return null;
  const round6 = (value) => Math.round(value * 1e6) / 1e6;
  const startY = round6(1 - zero[0] / 100);
  const endY = round6(1 - full[0] / 100);
  return (
    `BACKGROUND_BLUR:PROGRESSIVE:var(${blurVariable}):0:` +
    `0.5,${startY}:0.5,${endY}`
  );
}

// 코드 컴포넌트 ↔ Figma component set 계약 (DS-F-006).
// Figma에만 있는 property는 사유와 함께 선언해야 통과한다. 선언되지 않은 property는 실패다.
const COMPONENT_CONTRACTS = [
  {
    id: "button",
    strokes: {
      self: { weight: "borderWidth", align: "INSIDE" },
      Spinner: { weight: 2, align: "INSIDE" },
      "LeftIcon.glyph": { weight: "icon", align: "CENTER" },
      "RightIcon.glyph": { weight: "icon", align: "CENTER" },
    },
    // owner 결정: 이 버튼들에는 이너섀도우를 쓰지 않는다. 글래스 섀도우 개념 자체를 없앴다.
    effects: {},
    figmaName: "Button",
    declaration: "packages/react/dist/button/button.d.ts",
    // Figma variant property 이름 → 코드에서 같은 집합을 정의하는 타입 alias
    // 값은 타입 alias 이름이거나 { type, declaration } 이다. IconButton처럼 alias가 다른 파일에
    // 선언된 경우(ButtonVariant는 button.d.ts에 있다) 파일을 따로 지정한다.
    variantProperties: { Variant: "ButtonVariant", Size: "ButtonSize" },
    figmaOnlyProperties: {
      State: {
        options: ["Default", "Hover", "Active", "Disabled", "Loading"],
        reason:
          "Hover/Active는 코드에서 CSS 상태이고 Loading/Disabled는 boolean prop이다. Figma에는 CSS 상태가 없어 variant로 둔다. 이름의 뜻은 design/foundations/interaction-states.md가 소유한다 — Active는 :active(누르는 중)이며 Pressed(aria-pressed)는 Button에 없다.",
      },
    },
    // variant 축이 아니라 **존재 여부**로 코드 prop과 대응하는 property.
    // ReactNode prop은 문자열 union이 아니므로 옵션을 대조할 수 없다. 대신 선언에 그 prop이
    // 실제로 있는지를 본다. 이 칸이 없으면 Figma에만 있는 슬롯이 조용히 생긴다.
    propProperties: {
      LeftIcon: "leftIcon",
      RightIcon: "rightIcon",
      LeftIconGlyph: "leftIcon",
      RightIconGlyph: "rightIcon",
    },
    // 기하 계약. Figma padding = CSS padding + border이고 stroke는 INSIDE다.
    // 이렇게 접지 않으면 프레임 높이가 CSS보다 border 두께의 두 배만큼 작아진다 —
    // 실제로 md 39 대신 37, sm 28 대신 26으로 만들어져 있었고 아무 게이트도 잡지 못했다.
    geometry: {
      measuredId: "button",
      // readback 기하 필드 → 기대값. 문자열이면 measured의 키, 배열이면 그 키들의 합, 그 외는 리터럴.
      // Button은 폭이 라벨에 달려 있으므로 width를 보지 않는다.
      fields: {
        height: "height",
        paddingBlock: ["paddingBlock", "borderWidth"],
        paddingBlockEnd: ["paddingBlock", "borderWidth"],
        paddingInline: ["paddingInline", "borderWidth"],
        paddingInlineEnd: ["paddingInline", "borderWidth"],
        itemSpacing: "gap",
        cornerRadius: "radius",
        layoutMode: { literal: "HORIZONTAL" },
      },
      slots: { LeftIcon: "iconSlot", RightIcon: "iconSlot", Spinner: "spinner" },
      // 보이는 테두리 외에 허용되는 stroke 두께. spinner 링은 테두리가 아니다.
      extraStrokeWeights: [2],
    },
  },
  {
    id: "icon-button",
    strokes: {
      self: { weight: "borderWidth", align: "INSIDE" },
      "Glyph.glyph": { weight: "icon", align: "CENTER" },
    },
    effects: {},
    figmaName: "IconButton",
    declaration: "packages/react/dist/icon-button/icon-button.d.ts",
    variantProperties: {
      // Icon Button은 Button과 같은 강조 축을 쓴다. alias 선언은 button.d.ts에 있다.
      Variant: { type: "ButtonVariant", declaration: "packages/react/dist/button/button.d.ts" },
      Size: "IconButtonSize",
    },
    // 글리프는 코드에서 children이다. Button과 달리 슬롯이 하나뿐이라 boolean 가시성이 없다.
    propProperties: { Glyph: "children" },
    figmaOnlyProperties: {
      State: {
        options: ["Default", "Hover", "Active", "Pressed", "Disabled"],
        reason:
          "Hover/Active는 CSS 상태라 Figma에 variant로 둔다. Pressed는 코드에서 boolean prop이지만 aria-pressed로 표현되는 지속 상태이므로 같은 축에 둔다. 이름의 뜻은 design/foundations/interaction-states.md가 소유한다 — Active는 :active, Pressed는 aria-pressed다. Icon Button은 둘을 다 갖는 첫 컴포넌트다.",
      },
    },
    geometry: {
      measuredId: "icon-button",
      // 한 변의 길이가 계약이므로 폭도 본다. 라벨이 없어 폭이 콘텐츠에 흔들리지 않는다.
      fields: {
        height: "height",
        width: "width",
        cornerRadius: "radius",
        layoutMode: { literal: "HORIZONTAL" },
      },
      slots: { Glyph: "glyph" },
      extraStrokeWeights: [],
      // 글리프 instance가 보이므로 그 안의 vector stroke가 함께 읽힌다. 두께의 정본은 아이콘
      // manifest이며 여기에 숫자를 복사하지 않는다 — 복사하면 두 정본이 생긴다.
      allowGlyphStroke: true,
    },
  },
  {
    id: "tooltip",
    strokes: { self: { weight: "borderWidth", align: "INSIDE" } },
    effects: { self: "DROP_SHADOW:12:24:0" },
    figmaName: "Tooltip",
    declaration: "packages/react/dist/tooltip/tooltip.d.ts",
    variantProperties: {
      // 표면 시각은 네 방향이 같다. Side는 Figma에서 배치를 고르기 위한 축이며 코드의 side prop과
      // 같은 집합을 쓴다. alias는 overlay primitive가 소유한다.
      Side: { type: "OverlaySide", declaration: "packages/react/dist/overlay/positioner.d.ts" },
    },
    geometry: {
      measuredId: "tooltip",
      sizeKey: "base",
      fields: {
        height: "height",
        paddingBlock: ["paddingBlock", "borderWidth"],
        paddingBlockEnd: ["paddingBlock", "borderWidth"],
        paddingInline: ["paddingInline", "borderWidth"],
        paddingInlineEnd: ["paddingInline", "borderWidth"],
        cornerRadius: "radius",
        layoutMode: { literal: "HORIZONTAL" },
      },
      slots: {},
      extraStrokeWeights: [],
    },
  },
  {
    id: "toast",
    strokes: {},
    effects: {
      self: "DROP_SHADOW:8:20:0 + BACKGROUND_BLUR:NORMAL:var(blur/surface)",
    },
    figmaName: "Toast",
    declaration: "packages/react/dist/toast/toast.d.ts",
    variantProperties: { Tone: "ToastTone" },
    geometry: {
      measuredId: "toast",
      sizeKey: "base",
      fields: {
        height: "height",
        paddingBlock: "paddingBlock",
        paddingBlockEnd: "paddingBlock",
        paddingInline: "paddingInline",
        paddingInlineEnd: "paddingInline",
        cornerRadius: "radius",
        layoutMode: { literal: "HORIZONTAL" },
      },
      slots: {},
      extraStrokeWeights: [],
    },
  },
  {
    id: "menu-popover",
    strokes: {},
    effects: {},
    figmaName: "Menu",
    declaration: "packages/react/dist/menu/item.d.ts",
    // 이 set은 **메뉴 항목**이다. 항목 상태는 코드에서 CSS 상태와 prop이 섞여 있어 variant 축이
    // 코드 타입 alias와 1:1로 대응하지 않는다. 그래서 전부 Figma 전용 축으로 선언한다.
    variantProperties: {},
    figmaOnlyProperties: {
      State: {
        options: ["Default", "Hover", "Danger", "DangerHover", "Disabled"],
        reason:
          "Default/Hover는 CSS 상태이고 Danger는 tone prop, Disabled는 disabled prop이다. Figma에는 CSS 상태가 없어 한 축에 합친다. DangerHover가 따로 있는 이유는 danger 항목의 hover 면이 일반 항목과 다른 토큰을 쓰기 때문이다.",
      },
    },
    geometry: {
      measuredId: "menu-popover",
      sizeKey: "panel",
      fields: {
        height: "itemHeight",
        paddingBlock: "itemPaddingBlock",
        paddingBlockEnd: "itemPaddingBlock",
        paddingInline: "itemPaddingInline",
        paddingInlineEnd: "itemPaddingInline",
        itemSpacing: "itemGap",
        cornerRadius: "itemRadius",
        layoutMode: { literal: "HORIZONTAL" },
      },
      slots: {},
      extraStrokeWeights: [],
    },
  },
  {
    id: "dialog",
    strokes: { self: { weight: "borderWidth", align: "INSIDE" } },
    effects: { self: "DROP_SHADOW:16:48:-8" },
    figmaName: "Dialog",
    declaration: "packages/react/dist/dialog/types.d.ts",
    variantProperties: {},
    figmaOnlyProperties: {
      Size: {
        options: ["compact", "medium", "large"],
        reason:
          "코드의 DialogSize는 fullscreen을 포함해 넷이다. fullscreen은 표면이 뷰포트 자체이고 radius가 0이며 border가 없어 **고정 폭 variant로 그릴 수 없다** — Figma에서 그리면 어떤 폭을 골라도 거짓이 된다. 그래서 코드 축의 부분집합을 Figma 전용으로 선언한다.",
      },
    },
    geometry: {
      measuredId: "dialog",
      fields: {
        width: "width",
        paddingBlock: ["paddingBlock", "borderWidth"],
        paddingBlockEnd: ["paddingBlock", "borderWidth"],
        paddingInline: ["paddingInline", "borderWidth"],
        paddingInlineEnd: ["paddingInline", "borderWidth"],
        itemSpacing: "gap",
        cornerRadius: "radius",
        layoutMode: { literal: "VERTICAL" },
      },
      slots: {},
      extraStrokeWeights: [],
    },
  },
  {
    id: "menu-popover",
    figmaName: "MenuPanel",
    declaration: "packages/react/dist/menu/action-menu.d.ts",
    // 패널은 variant 축이 없다. 항목을 붙이고 빼서 조립하며 auto-layout이 크기를 정한다.
    variantProperties: {},
    strokes: {},
    effects: { self: "DROP_SHADOW:8:15:0 + DROP_SHADOW:0:0:0.5" },
    geometry: {
      measuredId: "menu-popover",
      sizeKey: "panel",
      fields: {
        paddingBlock: "paddingBlock",
        paddingBlockEnd: "paddingBlock",
        paddingInline: "paddingInline",
        paddingInlineEnd: "paddingInline",
        itemSpacing: "gap",
        cornerRadius: "radius",
        minWidth: "minWidth",
        layoutMode: { literal: "VERTICAL" },
      },
      slots: {},
      extraStrokeWeights: [],
    },
  },
  {
    id: "input",
    figmaName: "TextField",
    declaration: "packages/react/dist/text-field/text-field.d.ts",
    variantProperties: { Size: "TextFieldSize" },
    figmaOnlyProperties: {
      State: {
        options: ["Default", "Focus", "Invalid", "Disabled"],
        reason:
          "Focus는 코드에서 CSS 상태(:focus-within)이고 Invalid/Disabled는 boolean prop이다. Figma에는 CSS 상태가 없어 variant로 둔다. Hover 축은 없다 — 필드는 hover에서 아무것도 바꾸지 않는다.",
      },
    },
    // 보이는 테두리는 Box가 갖는다. root(component set)에는 stroke가 없다.
    strokes: { Box: { weight: "borderWidth", align: "INSIDE" } },
    effects: {},
    geometry: {
      measuredId: "input",
      // size가 두 개이므로 sizeKey를 두지 않는다 — measured의 md/sm을 그대로 돈다.
      fields: {},
      slots: {},
      // Focus 링의 2px. **테두리가 아니다** — CSS에서는 outline이고 Figma에 outline이 없어
      // 바깥으로 나가는 stroke로 그린다. 값은 border-width-ring과 같다.
      extraStrokeWeights: [2],
      parts: {
        Box: {
          fields: {
            height: "height",
            paddingInline: "paddingInline",
            paddingInlineEnd: "paddingInline",
            itemSpacing: "gap",
            cornerRadius: "radius",
            layoutMode: { literal: "HORIZONTAL" },
          },
        },
        Label: { fields: { fontSize: "labelFontSize" } },
        Value: { fields: { fontSize: "fontSize" } },
        Message: { fields: { fontSize: "messageFontSize" } },
      },
    },
  },
  {
    id: "app-shell-parts",
    figmaName: "SidebarNavItem",
    declaration: "packages/react/dist/app-shell/app-shell-parts.d.ts",
    // State는 CSS 상태(hover)와 prop(current)이 섞여 있고 Collapsed는 boolean prop이다.
    // 코드 타입 alias와 1:1로 대응하지 않으므로 Figma 전용 축으로 선언한다.
    variantProperties: {},
    figmaOnlyProperties: {
      State: {
        options: ["Default", "Hover", "Current"],
        reason:
          "Hover는 CSS 상태이고 Current는 boolean prop(aria-current)이다. Figma에 CSS 상태가 없어 variant로 둔다.",
      },
      Collapsed: {
        options: ["false", "true"],
        reason:
          "코드에서는 boolean prop이다. 접힘에서 라벨은 코드에서 clip으로 시각에서만 숨는데 Figma에 그 표현이 없어 노드를 뺐다 — 접근성 이름 유지는 코드 테스트가 본다.",
      },
    },
    strokes: {},
    effects: {},
    geometry: {
      measuredId: "app-shell-parts",
      sizeKey: "navItem",
      fields: {
        height: "height",
        itemSpacing: "gap",
        cornerRadius: "radius",
        layoutMode: { literal: "HORIZONTAL" },
      },
      slots: {},
      extraStrokeWeights: [],
      parts: {
        Icon: { fields: { width: "icon", height: "icon" } },
      },
    },
  },
  {
    id: "app-shell-parts",
    figmaName: "AppTopBar",
    declaration: "packages/react/dist/app-shell/app-shell-parts.d.ts",
    variantProperties: {},
    strokes: {},
    effects: {},
    geometry: {
      measuredId: "app-shell-parts",
      sizeKey: "topBar",
      fields: {
        height: "height",
        paddingInline: "paddingInline",
        paddingInlineEnd: "paddingInline",
        itemSpacing: "gap",
        layoutMode: { literal: "HORIZONTAL" },
      },
      slots: {},
      extraStrokeWeights: [],
      parts: {},
    },
  },
  {
    id: "spinner",
    figmaName: "Spinner",
    declaration: "packages/react/dist/spinner/spinner.d.ts",
    variantProperties: { Size: "SpinnerSize" },
    // 링을 stroke가 아니라 **채운 arc 밴드**로 그린다. stroke로 그리면 innerRadius 0인 파이
    // 조각의 외곽선(중심으로 가는 반지름 두 줄)이 함께 그려진다 — 실측으로 확인했다.
    strokes: {},
    effects: {},
    geometry: {
      measuredId: "spinner",
      fields: {},
      slots: {},
      extraStrokeWeights: [],
      parts: {
        Track: { fields: { width: "width", height: "height" } },
        Arc: { fields: { width: "width", height: "height" } },
      },
    },
  },
  {
    id: "badge",
    figmaName: "Badge",
    declaration: "packages/react/dist/badge/badge.d.ts",
    variantProperties: { Tone: "BadgeTone" },
    // **테두리를 쓰지 않는 것이 계약이다.** tone마다 border 토큰이 필요한데 danger에만 있다.
    strokes: {},
    effects: {},
    geometry: {
      measuredId: "badge",
      sizeKey: "base",
      fields: {
        height: "height",
        paddingBlock: "paddingBlock",
        paddingBlockEnd: "paddingBlock",
        paddingInline: "paddingInline",
        paddingInlineEnd: "paddingInline",
        itemSpacing: "gap",
        cornerRadius: "radius",
        layoutMode: { literal: "HORIZONTAL" },
      },
      slots: {},
      extraStrokeWeights: [],
      parts: {
        Label: { fields: { fontSize: "fontSize" } },
      },
    },
  },
  {
    id: "empty-state",
    figmaName: "EmptyState",
    declaration: "packages/react/dist/empty-state/empty-state.d.ts",
    // variant 축이 없다. 강조는 시각이 아니라 행동 유도의 유무가 만든다.
    variantProperties: {},
    // **면을 갖지 않는 것이 계약이다.** 제품 9벌이 유일하게 합의한 축이고, stroke를 하나라도
    // 선언하면 여기서 걸린다.
    strokes: {},
    effects: {},
    geometry: {
      measuredId: "empty-state",
      sizeKey: "base",
      fields: {
        paddingBlock: "paddingBlock",
        paddingBlockEnd: "paddingBlock",
        paddingInline: "paddingInline",
        paddingInlineEnd: "paddingInline",
        itemSpacing: "gap",
        cornerRadius: "radius",
        layoutMode: { literal: "VERTICAL" },
      },
      slots: {},
      extraStrokeWeights: [],
      parts: {
        Graphic: { fields: { width: "graphic", height: "graphic" } },
        Title: { fields: { fontSize: "titleFontSize" } },
        Description: { fields: { fontSize: "descriptionFontSize" } },
        // CSS는 액션에 `margin-block-start: 4px`를 더해 앞 요소와 16px 떨어진다. Figma
        // auto-layout에는 자식별 간격이 없어 같은 4px을 이 프레임의 위쪽 padding으로 만든다.
        Action: {
          fields: {
            paddingBlock: "actionMarginBlockStart",
            itemSpacing: "actionGap",
            layoutMode: { literal: "HORIZONTAL" },
          },
        },
      },
    },
  },
  {
    id: "project-card",
    figmaName: "ProjectCard",
    declaration: "packages/react/dist/project-card/project-card.d.ts",
    // variant 축이 없다. 카드의 강조는 카드가 아니라 썸네일이 만든다.
    variantProperties: {},
    strokes: { self: { weight: "borderWidth", align: "INSIDE" } },
    // Figma text style은 all-or-nothing이라 line-height만 덮으면 style 연결이 끊긴다(실측 확인).
    // 카드 오버레이는 세 줄이 30% 띠에 들어가야 해서 120%가 필요하고, 그 줄 간격을 가진 style이
    // 토큰 소스에 없다. 검사를 빼는 대신 아래 parts가 fontSize와 lineHeightPercent를 직접 대조한다.
    textStyleExempt: {
      reason:
        "Figma text style은 all-or-nothing이라 컴포넌트 고유의 줄 간격을 얹으면 연결이 끊긴다. 값을 직접 대조해 대체한다.",
      parts: ["Eyebrow", "Title", "Meta"],
    },
    // 흐림은 root가 아니라 제목 띠가 갖는다. offset은 계약에 옮겨 적지 않고 measured의 mask
    // 정지점에서 유도한다 — 옮겨 적으면 정본이 둘이 되어 CSS를 고쳐도 옛 값을 계속 통과시킨다.
    effects: { "Title overlay": progressiveBlurFrom("project-card", "base", "blur/surface") },
    geometry: {
      measuredId: "project-card",
      sizeKey: "base",
      fields: {
        width: "width",
        height: "height",
        cornerRadius: "radius",
      },
      slots: {},
      extraStrokeWeights: [],
      // **계약값이 자손에 있는 첫 컴포넌트다.** root만 보면 여백·간격·흐림이 하나도 검증되지 않는다.
      parts: {
        Media: {
          fields: { width: "mediaSide", height: "mediaSide" },
        },
        "Title overlay": {
          fields: {
            paddingBlock: "overlayPadding",
            paddingBlockEnd: "overlayPadding",
            paddingInline: "overlayPadding",
            paddingInlineEnd: "overlayPadding",
            itemSpacing: "overlayTextGap",
            layoutMode: { literal: "VERTICAL" },
          },
          // 띠 높이는 px이 아니라 미디어에 대한 비율이다.
          heightRatioOf: { part: "Media", measured: "overlayHeightRatio" },
        },
        // 세 줄의 타이포. **Figma text style은 all-or-nothing이라** line-height만 덮으면 style
        // 연결이 끊긴다(실측 확인). 그래서 style 바인딩을 요구하는 대신 값을 직접 대조한다 —
        // 바인딩 검사는 "값이 토큰에서 온다"의 대리 지표이고, 값 대조는 그 자체다.
        Eyebrow: {
          fields: {
            fontSize: "overlayMetaFontSize",
            lineHeightPercent: "overlayLineHeightPercent",
          },
        },
        Title: {
          fields: {
            fontSize: "overlayTitleFontSize",
            lineHeightPercent: "overlayLineHeightPercent",
          },
        },
        Meta: {
          fields: {
            fontSize: "overlayMetaFontSize",
            lineHeightPercent: "overlayLineHeightPercent",
          },
        },
        // 클릭 타깃과 슬롯은 **구조가 계약**이다. 크기보다 존재와 순서가 중요하다.
        Action: { fields: { width: "mediaSide", height: "mediaSide" } },
        Adornment: {},
        Thumbnail: {},
      },
      // 자식 순서가 계약이다 — 슬롯이 클릭 타깃 앞에 오면 슬롯 안의 컨트롤이 눌리지 않는다.
      childOrder: ["Media", "Action", "Adornment"],
    },
  },
];

// 아이콘 계약 (DS-D-0008). component set이 아니라 개별 component이므로 COMPONENT_CONTRACTS와
// 별도 경로다 — 아이콘 이름은 prop이 아니라 심볼 식별자라서 variant 대조 규칙이 의미가 없다.
//
// 지오메트리 좌표까지 대조하지 않는 이유는 Figma vector 왕복 손실을 아직 실측하지 않았기
// 때문이다. 대신 **요소 분해가 보존됐는지**(elementCount ↔ vectors)를 본다. 이것이 깨지면
// 도형이 병합되거나 사라진 것이고, 그건 좌표를 보지 않아도 알 수 있는 사고다.
const ICON_MANIFEST_PATH = "packages/react/src/icons/generated/manifest.json";
const ICON_CONTRACT = {
  namePrefix: "icon/",
  frame: { width: 24, height: 24 },
  strokeCap: "ROUND",
};
const iconManifest = readJson(ICON_MANIFEST_PATH);

// 재조립 template 계약. 값은 제품 저장소에서 실측해 figma/templates.measured.json에 근거와 함께
// 적어 두고, Figma에서 되읽은 값과 대조한다.
//
// 이 검사가 없던 동안 template의 카드 구조가 제품과 다르게 그려진 채 통과했다. 게이트가 없는 곳은
// 사람이 확인해야 하는데, 사람이 확인했다고 스스로 말하는 것은 증거가 아니다.
const TEMPLATE_MEASURED_PATH = "figma/templates.measured.json";
const templateMeasured = readJson(TEMPLATE_MEASURED_PATH);

const expectation = buildExpectation(proposal);

const failures = compare(snapshot, expectation);
const warnings = staleness(snapshot);

// 게이트가 실제로 실패할 수 있는지 보증한다.
//
// canary는 실패가 이미 있는 상태에서도 돌아야 한다. `failures.length === 0`으로 감싸면
// parity가 깨진 동안 검출력 증명이 통째로 멈추고, 그 사이 canary 자체가 망가져도 아무도
// 모른다 — 게이트가 가장 못 미더운 시점에 게이트의 보증이 사라지는 순서다.
//
// 그래서 판정 기준을 "변조 후 실패가 있는가"가 아니라 **"변조가 baseline에 없던 실패를
// 새로 만드는가"**로 바꾼다. baseline이 비어 있으면 두 기준은 정확히 같다.
const TAMPERS = [
  tamperValue,
  tamperAlias,
  tamperCollection,
  tamperModeOrder,
  tamperStyle,
  tamperComponentVariant,
  tamperComponentBinding,
  tamperComponentHeight,
  tamperComponentPadding,
  tamperComponentSlot,
  tamperComponentGeometryDrift,
  tamperComponentPropProperty,
  tamperComponentDescription,
  tamperComponentStrokeWeight,
  tamperComponentStrokeAlign,
  tamperComponentEffectType,
  tamperComponentBlurUnbound,
  tamperComponentExtraEffect,
  tamperComponentPartPadding,
  tamperComponentPartTypography,
  tamperComponentPartRatio,
  tamperComponentPartMissing,
  tamperComponentPartExtra,
  tamperComponentChildOrder,
  tamperComponentProgressiveOffset,
  tamperIconMissing,
  tamperIconKeywords,
  tamperIconFrame,
  tamperIconRawPaint,
  tamperIconElementCount,
  tamperTemplateField,
  tamperTemplateSquare,
  tamperTemplateMissing,
];

if (runCanary) {
  const baseline = new Set(failures);
  const canaryFailures = [];
  for (const mutate of TAMPERS) {
    const copy = JSON.parse(JSON.stringify(snapshot));
    const label = mutate(copy, expectation);
    if (!label) continue;
    const introduced = compare(copy, expectation).filter((f) => !baseline.has(f));
    if (introduced.length === 0) {
      canaryFailures.push(
        baseline.size === 0
          ? `canary가 변조를 잡지 못했습니다: ${label}`
          : `canary의 검출력을 증명하지 못했습니다 — 기존 실패에 가려집니다: ${label}`,
      );
    }
  }
  if (canaryFailures.length > 0) {
    for (const failure of canaryFailures) console.error(`[figma-parity] ${failure}`);
    process.exit(1);
  }
}

for (const warning of warnings) console.warn(`[figma-parity] 경고: ${warning}`);
if (failures.length > 0) {
  for (const failure of failures) console.error(`[figma-parity] ${failure}`);
  process.exit(1);
}
console.log(
  `[figma-parity] parity OK (변수 ${expectation.variables.size}개, collection ` +
    `${expectation.collections.size}개, style ${expectation.styles.size}개, ` +
    `component ${COMPONENT_CONTRACTS.length}개, ` +
    `미표현 ${expectation.nonVariableCount - expectation.styles.size}개 제외` +
    `${runCanary ? `, 변조 canary ${TAMPERS.length}종` : ""})`,
);

function buildExpectation(document) {
  const createdIds = new Set();
  let nonVariableCount = 0;
  for (const collection of Object.values(document.collections ?? {})) {
    for (const [id, variable] of Object.entries(collection.variables ?? {})) {
      if (variable.representation.startsWith("variable")) createdIds.add(id);
      else nonVariableCount += 1;
    }
  }

  const variables = new Map();
  const collections = new Map();
  const nonVariables = new Map();
  const styles = new Map();
  for (const [name, collection] of Object.entries(document.collections ?? {})) {
    let count = 0;
    for (const [id, variable] of Object.entries(collection.variables ?? {})) {
      if (!variable.representation.startsWith("variable")) {
        nonVariables.set(id, variable.representation);
        if (
          variable.representation === "text-style" ||
          variable.representation === "effect-style"
        ) {
          // **Figma style에는 mode가 없다.** 토큰이 테마마다 값이 다르면(elevation-tooltip,
          // elevation-menu) 하나의 style로 표현할 수 없으므로 collection의 기본 모드인 Light를
          // 정본으로 삼는다. 다크 값은 CSS만 갖는다 — 이 한계는 style 계약의 일부다.
          const modes = variable.valuesByMode;
          const source = modes.Light ?? Object.values(modes)[0];
          styles.set(id, {
            representation: variable.representation,
            figmaName: variable.figmaName,
            themeVarying: Object.keys(modes).length > 1,
            attributes: styleAttributes(variable.representation, source.resolvedValue),
          });
        }
        continue;
      }
      count += 1;
      const valuesByMode = {};
      // proposal의 valuesByMode 키는 이미 Figma mode 이름(Base/Global/Light/Dark)이다.
      for (const [modeName, value] of Object.entries(variable.valuesByMode)) {
        const alias = value.aliasTarget;
        valuesByMode[modeName] =
          alias && createdIds.has(alias.id)
            ? { alias: alias.id }
            : {
                value: resolvedToFigmaValue(
                  value.resolvedValue,
                  variable.nativeVariableType,
                ),
              };
      }
      variables.set(id, {
        collection: name,
        figmaName: variable.figmaName,
        resolvedType: variable.nativeVariableType,
        valuesByMode,
      });
    }
    collections.set(name, {
      modes: [...(collection.modes ?? [])],
      defaultMode: collection.defaultMode ?? collection.modes?.[0],
      variableCount: count,
    });
  }
  return { variables, collections, nonVariables, nonVariableCount, styles };
}

function styleAttributes(representation, resolved) {
  const fontStyleForWeight = { 400: "Regular", 500: "Medium", 600: "SemiBold" };
  if (representation === "text-style") {
    return {
      fontStyle: fontStyleForWeight[resolved.fontWeight] ?? null,
      fontSize: resolved.fontSize.value,
      lineHeightPercent: Math.round(resolved.lineHeight * 1000) / 10,
      letterSpacingPx: resolved.letterSpacing.value,
    };
  }
  // shadow는 한 겹일 수도 여러 겹일 수도 있다 (DTCG). Figma effect style도 effect 배열이므로
  // 겹 수와 순서를 그대로 비교한다 — 겹이 빠지면 시각이 달라진다.
  const round = (value) => Math.round(value * 1e6) / 1e6;
  const layer = (item) => {
    const [r, g, b] = item.color.components;
    return {
      offsetY: item.offsetY.value,
      blur: item.blur.value,
      spread: item.spread.value,
      inset: item.inset === true,
      color: [round(r), round(g), round(b), item.color.alpha ?? 1],
    };
  };
  if (Array.isArray(resolved)) return { layers: resolved.map(layer) };
  return layer(resolved);
}

function compare(document, expected) {
  const issues = [];
  const actualCollections = document.collections ?? {};
  const actualVariables = document.variables ?? {};

  for (const [name, want] of expected.collections) {
    const got = actualCollections[name];
    if (!got) {
      issues.push(`collection이 snapshot에 없습니다: ${name}`);
      continue;
    }
    // 순서를 정렬하지 않고 그대로 비교한다. Figma는 첫 mode를 default로 쓰므로
    // 순서가 CSS의 `:root`(light) 계약과 어긋나면 라이브러리 기본 표시가 틀린다.
    const gotModes = [...(got.modes ?? [])];
    if (JSON.stringify(gotModes) !== JSON.stringify(want.modes)) {
      issues.push(
        `collection mode 순서 불일치: ${name} — 기대 ${want.modes.join("/")}, 실제 ${gotModes.join("/")}`,
      );
    }
    if (got.defaultMode !== want.defaultMode) {
      issues.push(
        `collection default mode 불일치: ${name} — 기대 ${want.defaultMode}, 실제 ${got.defaultMode}`,
      );
    }
    if (got.variableCount !== want.variableCount) {
      issues.push(
        `collection 변수 수 불일치: ${name} — 기대 ${want.variableCount}, 실제 ${got.variableCount}`,
      );
    }
  }
  for (const name of Object.keys(actualCollections)) {
    if (!expected.collections.has(name)) {
      issues.push(`proposal이 선언하지 않은 collection이 있습니다: ${name}`);
    }
  }

  for (const [id, want] of expected.variables) {
    const got = actualVariables[id];
    if (!got) {
      issues.push(`변수가 snapshot에 없습니다: ${id}`);
      continue;
    }
    if (got.figmaName !== want.figmaName) {
      issues.push(
        `figmaName 불일치: ${id} — 기대 ${want.figmaName}, 실제 ${got.figmaName}`,
      );
    }
    if (got.resolvedType !== want.resolvedType) {
      issues.push(
        `type 불일치: ${id} — 기대 ${want.resolvedType}, 실제 ${got.resolvedType}`,
      );
    }
    const wantModes = Object.keys(want.valuesByMode).sort();
    const gotModes = Object.keys(got.valuesByMode ?? {}).sort();
    if (JSON.stringify(wantModes) !== JSON.stringify(gotModes)) {
      issues.push(
        `mode 집합 불일치: ${id} — 기대 ${wantModes.join("/")}, 실제 ${gotModes.join("/")}`,
      );
      continue;
    }
    for (const mode of wantModes) {
      const wantValue = want.valuesByMode[mode];
      const gotValue = got.valuesByMode[mode];
      if (wantValue.alias !== undefined) {
        if (gotValue.alias !== wantValue.alias) {
          issues.push(
            `alias 불일치: ${id}@${mode} — 기대 ${wantValue.alias}, 실제 ${gotValue.alias ?? JSON.stringify(gotValue)}`,
          );
        }
        continue;
      }
      if (gotValue.alias !== undefined) {
        issues.push(`값이어야 할 항목이 alias입니다: ${id}@${mode}`);
        continue;
      }
      if (!valueEqual(gotValue.value, wantValue.value)) {
        issues.push(
          `값 불일치: ${id}@${mode} — 기대 ${JSON.stringify(wantValue.value)}, 실제 ${JSON.stringify(gotValue.value)}`,
        );
      }
    }
  }
  for (const id of Object.keys(actualVariables)) {
    if (!expected.variables.has(id)) {
      issues.push(`proposal이 선언하지 않은 변수가 snapshot에 있습니다: ${id}`);
    }
  }

  // 미표현·style로 분류된 토큰이 변수로 새어 나오면 안 된다.
  for (const [id, representation] of expected.nonVariables) {
    if (actualVariables[id]) {
      issues.push(`${representation}로 분류된 토큰이 변수로 존재합니다: ${id}`);
    }
  }

  // style 비교 — text/effect
  const actualStyles = {
    "text-style": document.styles?.text ?? {},
    "effect-style": document.styles?.effect ?? {},
  };
  const seenStyleNames = { "text-style": new Set(), "effect-style": new Set() };
  for (const [id, want] of expected.styles) {
    const bucket = actualStyles[want.representation];
    const got = bucket?.[want.figmaName];
    seenStyleNames[want.representation].add(want.figmaName);
    if (!got) {
      issues.push(`${want.representation}이 snapshot에 없습니다: ${want.figmaName} (${id})`);
      continue;
    }
    if (got.tokenId !== id) {
      issues.push(
        `style tokenId 불일치: ${want.figmaName} — 기대 ${id}, 실제 ${got.tokenId}`,
      );
    }
    for (const [field, wantValue] of Object.entries(want.attributes)) {
      const gotValue = got[field];
      if (!valueEqual(gotValue, wantValue)) {
        issues.push(
          `style ${field} 불일치: ${want.figmaName} — 기대 ${JSON.stringify(wantValue)}, 실제 ${JSON.stringify(gotValue)}`,
        );
      }
    }
  }
  for (const [representation, bucket] of Object.entries(actualStyles)) {
    for (const name of Object.keys(bucket)) {
      if (!seenStyleNames[representation].has(name)) {
        issues.push(`proposal이 선언하지 않은 ${representation}이 있습니다: ${name}`);
      }
    }
  }

  issues.push(...compareComponents(document.components ?? {}));
  issues.push(...compareIcons(document.icons ?? {}));
  issues.push(...compareTemplates(document.templates ?? {}));
  return issues;
}

/** 제품 실측값(figma/templates.measured.json) ↔ Figma 재조립 template. */
function compareTemplates(actualTemplates) {
  const issues = [];
  const expected = templateMeasured.templates ?? {};
  for (const [name, fields] of Object.entries(expected)) {
    const got = actualTemplates[name];
    if (got === undefined) {
      issues.push(`재조립 template이 snapshot에 없습니다: ${name}`);
      continue;
    }
    for (const [field, spec] of Object.entries(fields)) {
      if (field.startsWith("$")) continue;
      const want = spec.value;
      const actual = got[field];
      // 행간처럼 여러 요소가 같은 값을 가져야 하는 항목은 배열로 되읽고 유일값을 본다.
      const normalized = Array.isArray(actual)
        ? actual.length === 1
          ? actual[0]
          : actual
        : actual;
      if (normalized === undefined) {
        issues.push(`${name}.${field}: snapshot에 없습니다 (기대 ${JSON.stringify(want)})`);
        continue;
      }
      if (JSON.stringify(normalized) !== JSON.stringify(want)) {
        issues.push(
          `${name}.${field}: 제품 실측과 다릅니다 — 기대 ${JSON.stringify(want)}, 실제 ` +
            `${JSON.stringify(normalized)}. 근거: ${spec.evidence}`,
        );
      }
    }
    // 정사각 계약은 두 값의 관계이므로 따로 본다.
    if (fields.cardSquare?.value === true && got.cardWidth !== got.cardHeight) {
      issues.push(
        `${name}: 카드가 정사각이 아닙니다 — ${got.cardWidth}x${got.cardHeight}. ` +
          `근거: ${fields.cardSquare.evidence}`,
      );
    }
  }
  for (const name of Object.keys(actualTemplates)) {
    if (expected[name] === undefined) {
      issues.push(`실측 계약이 없는 template이 있습니다: ${name}`);
    }
  }
  return issues;
}

/** 코드 아이콘 manifest ↔ Figma icon/* component. */
function compareIcons(actualIcons) {
  const issues = [];
  const allowedWeights = new Set(iconManifest.strokeWidths.map(Number));
  const seen = new Set();

  for (const icon of iconManifest.icons) {
    const got = actualIcons[icon.name];
    if (got === undefined) {
      issues.push(`아이콘 component가 snapshot에 없습니다: ${icon.figmaName}`);
      continue;
    }
    seen.add(icon.name);
    if (got.figmaName !== icon.figmaName) {
      issues.push(
        `${icon.name}: Figma 이름이 다릅니다 — 기대 ${icon.figmaName}, 실제 ${got.figmaName}`,
      );
    }
    if (got.width !== ICON_CONTRACT.frame.width || got.height !== ICON_CONTRACT.frame.height) {
      issues.push(
        `${icon.figmaName}: frame이 ${got.width}x${got.height}입니다. ` +
          `정본은 ${ICON_CONTRACT.frame.width}x${ICON_CONTRACT.frame.height} 하나이며 크기 variant를 두지 않습니다.`,
      );
    }
    // 요소 분해 보존. 병합되거나 사라진 도형은 좌표를 보지 않아도 여기서 드러난다.
    if (got.vectors !== icon.elementCount) {
      issues.push(
        `${icon.figmaName}: 요소 수가 다릅니다 — 코드 ${icon.elementCount}, Figma ${got.vectors}`,
      );
    }
    // raw 값 사용 0 (DS-F-006). Figma에는 currentColor가 없으므로 변수를 물어야 한다.
    for (const field of ["rawStrokes", "rawFills"]) {
      const count = got.binding?.[field] ?? 0;
      if (count !== 0) {
        issues.push(`${icon.figmaName}에 바인딩되지 않은 값이 있습니다: ${field}=${count}`);
      }
    }
    if ((got.binding?.boundStrokes ?? 0) + (got.binding?.boundFills ?? 0) === 0) {
      issues.push(`${icon.figmaName}: 바인딩된 paint가 하나도 없습니다.`);
    }
    for (const weight of got.strokeWeights ?? []) {
      if (!allowedWeights.has(weight)) {
        issues.push(
          `${icon.figmaName}: stroke 두께 ${weight}는 허용 집합 밖입니다 (${[...allowedWeights].join(", ")}).`,
        );
      }
    }
    for (const cap of got.strokeCaps ?? []) {
      if (cap !== ICON_CONTRACT.strokeCap) {
        issues.push(`${icon.figmaName}: stroke cap이 ${cap}입니다. 정본은 ${ICON_CONTRACT.strokeCap}입니다.`);
      }
    }
    if (got.hasDescription !== true) {
      issues.push(`${icon.figmaName}: description이 없습니다. 정본 경로를 적어 두어야 합니다.`);
    }
    // description은 설명문이자 **검색 채널**이다. 사람은 아이콘의 이름을 모른 채 찾는다 —
    // "휴지통"을 떠올리지 `trash-simple`을 떠올리지 않는다. 코드 manifest의 키워드가 그대로
    // Figma에 있어야 asset 패널 검색과 문서 검색이 같은 결과를 낸다.
    const wantKeywords = [...(icon.keywords ?? [])].sort();
    const gotKeywords = [...(got.keywords ?? [])].sort();
    if (wantKeywords.length === 0) {
      issues.push(`${icon.figmaName}: 코드 manifest에 검색 키워드가 없습니다.`);
    } else if (JSON.stringify(wantKeywords) !== JSON.stringify(gotKeywords)) {
      issues.push(
        `${icon.figmaName}: 검색 키워드가 다릅니다 — 코드 [${wantKeywords.join(", ")}], Figma [${gotKeywords.join(", ")}]`,
      );
    }
  }

  for (const name of Object.keys(actualIcons)) {
    if (!seen.has(name)) {
      issues.push(`코드 manifest에 없는 아이콘 component가 있습니다: ${ICON_CONTRACT.namePrefix}${name}`);
    }
  }
  return issues;
}

// 코드 타입 alias의 문자열 union 멤버를 뽑는다. tsc가 결정론적으로 생성하는 파일이다.
function unionMembers(declarationSource, typeName) {
  const pattern = new RegExp(
    `type\\s+${typeName}\\s*=\\s*([^;]+);`,
    "m",
  );
  const match = pattern.exec(declarationSource);
  if (match?.[1] === undefined) return null;
  return [...match[1].matchAll(/"([^"]+)"/g)].map((entry) => entry[1]);
}

/**
 * Figma component set의 기하를 **코드 실측값**과 대조한다.
 *
 * 코드 쪽 값이 여전히 참인지는 packages/react/test/component-geometry.browser.test.tsx가 잡는다.
 * 두 방향이 다 걸려야 "Figma와 measured는 서로 맞고 둘 다 코드와 틀린" 상태가 생기지 않는다.
 *
 * 총 폭은 보지 않는다. 라벨 폭은 폰트 렌더링에 달려 있어 브라우저와 Figma가 원래 다르고, 그
 * 차이를 실패로 읽으면 게이트를 끄게 된다. 라벨 폭을 뺀 나머지가 전부 여기 있으므로 폭이
 * 틀리면 이 중 하나가 틀린 것이다.
 */
function compareComponentGeometry(contract, got) {
  const issues = [];
  const plan = contract.geometry;
  if (plan === undefined) return issues;
  const measured = componentsMeasured.components?.[plan.measuredId]?.sizes;
  if (measured === undefined) {
    issues.push(
      `${COMPONENTS_MEASURED_PATH}에 실측값이 없습니다: ${plan.measuredId}`,
    );
    return issues;
  }
  const geometry = got.geometry ?? {};
  // size 축이 없는 컴포넌트는 measured에 단일 키(base)만 두고 readback도 그 이름으로 담는다.
  const entries = plan.sizeKey
    ? [[plan.sizeKey, measured[plan.sizeKey]]].filter(([, spec]) => spec !== undefined)
    : Object.entries(measured);
  if (plan.sizeKey && entries.length === 0) {
    issues.push(`${COMPONENTS_MEASURED_PATH}에 ${plan.measuredId}.${plan.sizeKey}가 없습니다.`);
  }
  for (const [size, spec] of entries) {
    const actual = geometry[size];
    if (actual === undefined) {
      issues.push(`${contract.figmaName}: size ${size}의 기하가 snapshot에 없습니다.`);
      continue;
    }
    // Figma padding은 CSS padding에 border를 접어 넣은 값이다. 그 접기를 계약이 선언한다.
    const border = spec.borderWidth;
    const expected = {};
    for (const [field, rule] of Object.entries(plan.fields ?? {})) {
      if (typeof rule === "string") {
        expected[field] = spec[rule];
      } else if (Array.isArray(rule)) {
        expected[field] = rule.reduce((total, key) => total + spec[key], 0);
      } else {
        expected[field] = rule.literal;
      }
      if (expected[field] === undefined || Number.isNaN(expected[field])) {
        issues.push(
          `${COMPONENTS_MEASURED_PATH}의 ${plan.measuredId}.${size}에 ${field}의 근거 값이 없습니다.`,
        );
        delete expected[field];
      }
    }
    for (const [field, want] of Object.entries(expected)) {
      const values = actual[field];
      if (!Array.isArray(values) || values.length === 0) {
        issues.push(`${contract.figmaName} ${size}: ${field}가 없습니다.`);
        continue;
      }
      if (values.length > 1) {
        issues.push(
          `${contract.figmaName} ${size}: variant마다 ${field}가 다릅니다 — [${values.join(", ")}]`,
        );
        continue;
      }
      if (values[0] !== want) {
        issues.push(
          `${contract.figmaName} ${size}: ${field}가 다릅니다 — 코드 실측 ${want}, Figma ${values[0]}`,
        );
      }
    }
    // 보이는 테두리는 CSS border 두께여야 한다. 컴포넌트가 선언한 예외(spinner 링 등)만 허용한다.
    const allowedWeights = new Set([
      border,
      ...(plan.extraStrokeWeights ?? []),
      ...(plan.allowGlyphStroke ? iconManifest.strokeWidths.map(Number) : []),
    ]);
    for (const weight of actual.strokeWeight ?? []) {
      if (!allowedWeights.has(weight)) {
        issues.push(
          `${contract.figmaName} ${size}: stroke 두께 ${weight}는 허용 집합 밖입니다 (${[...allowedWeights].join(", ")}).`,
        );
      }
    }
    for (const [slotName, measuredKey] of Object.entries(plan.slots ?? {})) {
      const side = spec[measuredKey];
      if (side === undefined) continue;
      const values = actual.slots?.[slotName];
      if (!Array.isArray(values) || values.length === 0) {
        issues.push(`${contract.figmaName} ${size}: 슬롯 ${slotName}이 없습니다.`);
        continue;
      }
      const want = `${side}x${side}`;
      const wrong = values.filter((value) => value !== want);
      if (wrong.length > 0) {
        issues.push(
          `${contract.figmaName} ${size}: 슬롯 ${slotName} 크기가 다릅니다 — 코드 실측 ${want}, Figma [${values.join(", ")}]`,
        );
      }
    }

    // **자손의 계약값.** slots는 자손을 이름으로 잡지만 `WxH` 한 축뿐이라, padding·gap·타이포처럼
    // 자손이 소유하는 값을 대조하지 못한다. ProjectCard가 그 경우다 — 계약값이 전부 `Title
    // overlay` 프레임에 있어서 root만 보면 아무것도 검증되지 않는다.
    //
    // 규칙은 root의 `fields`와 **같다**(문자열=measured 키, 배열=합, 객체=literal). 새 어휘를
    // 만들지 않아야 계약을 읽는 사람이 두 규칙을 외우지 않는다.
    for (const [partName, partPlan] of Object.entries(plan.parts ?? {})) {
      const part = actual.parts?.[partName];
      if (part === undefined) {
        issues.push(`${contract.figmaName} ${size}: 자손 ${partName}이 snapshot에 없습니다.`);
        continue;
      }
      for (const [field, rule] of Object.entries(partPlan.fields ?? {})) {
        let want;
        if (typeof rule === "string") want = spec[rule];
        else if (Array.isArray(rule)) want = rule.reduce((total, key) => total + spec[key], 0);
        else want = rule.literal;
        if (want === undefined || Number.isNaN(want)) {
          issues.push(
            `${COMPONENTS_MEASURED_PATH}의 ${plan.measuredId}.${size}에 ${partName}.${field}의 근거 값이 없습니다.`,
          );
          continue;
        }
        const values = part[field];
        if (!Array.isArray(values) || values.length === 0) {
          issues.push(`${contract.figmaName} ${size}: ${partName}.${field}가 없습니다.`);
          continue;
        }
        if (values.length > 1) {
          issues.push(
            `${contract.figmaName} ${size}: variant마다 ${partName}.${field}가 다릅니다 — [${values.join(", ")}]`,
          );
          continue;
        }
        // **float32 오차를 허용한다.** Figma는 숫자를 float32로 저장하므로 120%가
        // 120.00000476837158로 돌아온다. 실제 drift는 이 크기가 아니라 최소 0.5px 단위라
        // 1e-4는 검출력을 낮추지 않는다 — 변조 canary가 그것을 증명한다.
        const same =
          typeof want === "number" && typeof values[0] === "number"
            ? Math.abs(values[0] - want) <= 1e-4
            : values[0] === want;
        if (!same) {
          issues.push(
            `${contract.figmaName} ${size}: ${partName}.${field}가 다릅니다 — 코드 실측 ${want}, Figma ${values[0]}`,
          );
        }
      }
      // 자손의 높이가 다른 자손에 대한 **비율**로 정의되는 경우. 카드의 제목 띠가 그렇다.
      const ratio = partPlan.heightRatioOf;
      if (ratio !== undefined) {
        const want = spec[ratio.measured];
        const base = actual.parts?.[ratio.part]?.height?.[0];
        const own = part.height?.[0];
        if (want === undefined || base === undefined || own === undefined) {
          issues.push(
            `${contract.figmaName} ${size}: ${partName}의 높이 비율을 잴 근거가 없습니다 (${ratio.part}).`,
          );
        } else {
          const actualRatio = Math.round((own / base) * 1000) / 1000;
          if (actualRatio !== want) {
            issues.push(
              `${contract.figmaName} ${size}: ${partName} 높이 비율이 다릅니다 — 코드 실측 ${want}, Figma ${actualRatio}`,
            );
          }
        }
      }
    }

    // 계약이 선언하지 않은 자손이 snapshot에 있으면 실패다. 한쪽만 보면 Figma에 층이 하나 더
    // 생겨도 통과한다 — stroke 비교가 이미 양방향인 것과 같은 이유다.
    for (const partName of Object.keys(actual.parts ?? {})) {
      if (plan.parts?.[partName] === undefined) {
        issues.push(`${contract.figmaName} ${size}: 계약에 없는 자손이 있습니다 — ${partName}`);
      }
    }

    // **자식 순서.** 숫자 z-index를 쓰지 않는 컴포넌트는 칠 순서가 곧 DOM/자식 순서다. 카드에서
    // 슬롯이 클릭 타깃 앞에 오면 슬롯 안의 컨트롤이 눌리지 않는다 — 크기는 다 맞는데 못 쓰는
    // 상태이므로 값 비교로는 잡히지 않는다.
    if (Array.isArray(plan.childOrder)) {
      const order = actual.childOrder;
      if (!Array.isArray(order)) {
        issues.push(`${contract.figmaName} ${size}: 자식 순서가 snapshot에 없습니다.`);
      } else if (order.join(" → ") !== plan.childOrder.join(" → ")) {
        issues.push(
          `${contract.figmaName} ${size}: 자식 순서가 다릅니다 — 계약 [${plan.childOrder.join(", ")}], Figma [${order.join(", ")}]`,
        );
      }
    }
  }
  return issues;
}

/**
 * 역할별 stroke 두께와 정렬을 대조한다.
 *
 * 두께를 **집합**으로만 보면 버튼 테두리가 2px이 돼도 spinner의 2와 구분되지 않는다. 그래서
 * 어느 노드의 stroke인지까지 본다. strokeAlign을 함께 보는 이유는 CSS `border`가
 * `box-sizing: border-box`에서 INSIDE와 같고, CENTER/OUTSIDE로 바뀌면 같은 두께라도 시각 박스가
 * 달라지기 때문이다.
 */
function compareComponentStrokes(contract, got) {
  const issues = [];
  const plan = contract.strokes;
  if (plan === undefined) return issues;
  const measured = componentsMeasured.components?.[contract.geometry?.measuredId]?.sizes ?? {};
  const anySize = Object.values(measured)[0] ?? {};
  const actual = got.strokes ?? {};

  for (const [role, spec] of Object.entries(plan)) {
    let want;
    if (typeof spec.weight === "number") {
      want = spec.weight;
    } else if (spec.weight === "icon") {
      // 글리프 두께의 정본은 아이콘 manifest다. 여기에 숫자를 복사하지 않는다.
      const widths = [...new Set(iconManifest.strokeWidths.map(Number))];
      want = widths.length === 1 ? widths[0] : undefined;
      if (want === undefined) {
        issues.push(
          `${contract.figmaName}: 아이콘 정본 stroke 두께가 하나가 아닙니다 (${widths.join(", ")}).`,
        );
        continue;
      }
    } else {
      want = anySize[spec.weight];
    }
    if (want === undefined) {
      issues.push(
        `${contract.figmaName}: stroke 역할 ${role}의 기대 두께를 ${COMPONENTS_MEASURED_PATH}에서 찾지 못했습니다 (${spec.weight}).`,
      );
      continue;
    }
    const values = actual[role];
    if (!Array.isArray(values) || values.length === 0) {
      issues.push(`${contract.figmaName}: stroke 역할 ${role}이 Figma에 없습니다.`);
      continue;
    }
    const expected = `${want}|${spec.align}`;
    const wrong = values.filter((value) => value !== expected);
    if (wrong.length > 0) {
      issues.push(
        `${contract.figmaName}: ${role}의 stroke가 다릅니다 — 기대 ${expected}, 실제 [${values.join(", ")}]`,
      );
    }
  }
  for (const role of Object.keys(actual)) {
    if (plan[role] === undefined) {
      issues.push(
        `${contract.figmaName}: 계약에 없는 stroke가 있습니다 — ${role} [${actual[role].join(", ")}]`,
      );
    }
  }
  return issues;
}

/**
 * 역할별 effect를 **종류와 순서까지** 대조한다.
 *
 * 개수만 세면 INNER_SHADOW가 DROP_SHADOW로 바뀌어도 통과한다. blur는 radius가 변수에 묶였는지도
 * 본다 — 숫자를 직접 적으면 테마·해상도 변경이 따라오지 않는다.
 */
function compareComponentEffects(contract, got) {
  const issues = [];
  const plan = contract.effects;
  if (plan === undefined) return issues;
  const actual = got.effects ?? {};
  for (const [role, expected] of Object.entries(plan)) {
    const values = actual[role];
    if (!Array.isArray(values) || values.length === 0) {
      issues.push(`${contract.figmaName}: effect 역할 ${role}이 Figma에 없습니다 — 기대 ${expected}`);
      continue;
    }
    const wrong = values.filter((value) => value !== expected);
    if (wrong.length > 0) {
      issues.push(
        `${contract.figmaName}: ${role}의 effect가 다릅니다 — 기대 "${expected}", 실제 [${values.join(", ")}]`,
      );
    }
  }
  for (const role of Object.keys(actual)) {
    if (plan[role] === undefined) {
      issues.push(
        `${contract.figmaName}: 계약에 없는 effect가 있습니다 — ${role} [${actual[role].join(", ")}]`,
      );
    }
  }
  return issues;
}

function compareComponents(actualComponents) {
  const issues = [];
  const seen = new Set();

  for (const contract of COMPONENT_CONTRACTS) {
    seen.add(contract.figmaName);
    const got = actualComponents[contract.figmaName];
    if (!got) {
      issues.push(`component set이 snapshot에 없습니다: ${contract.figmaName}`);
      continue;
    }
    if (got.tokenId !== contract.id) {
      issues.push(
        `component id 불일치: ${contract.figmaName} — 기대 ${contract.id}, 실제 ${got.tokenId}`,
      );
    }

    let declarationSource;
    try {
      declarationSource = readFileSync(
        resolve(repoRoot, contract.declaration),
        "utf8",
      );
    } catch {
      issues.push(
        `코드 선언을 읽을 수 없습니다: ${contract.declaration} — 먼저 pnpm build:react를 실행합니다.`,
      );
      continue;
    }

    const properties = got.properties ?? {};
    for (const [figmaProperty, entry] of Object.entries(
      contract.variantProperties,
    )) {
      const codeType = typeof entry === "string" ? entry : entry.type;
      let source = declarationSource;
      if (typeof entry !== "string" && entry.declaration !== undefined) {
        try {
          source = readFileSync(resolve(repoRoot, entry.declaration), "utf8");
        } catch {
          issues.push(
            `코드 선언을 읽을 수 없습니다: ${entry.declaration} — 먼저 pnpm build:react를 실행합니다.`,
          );
          continue;
        }
      }
      const codeOptions = unionMembers(source, codeType);
      if (codeOptions === null) {
        issues.push(`코드 타입을 찾지 못했습니다: ${codeType}`);
        continue;
      }
      const figmaOptions = properties[figmaProperty]?.options;
      if (!Array.isArray(figmaOptions)) {
        issues.push(
          `Figma property가 없습니다: ${contract.figmaName}.${figmaProperty}`,
        );
        continue;
      }
      if (JSON.stringify([...figmaOptions].sort()) !== JSON.stringify([...codeOptions].sort())) {
        issues.push(
          `variant 옵션 불일치: ${contract.figmaName}.${figmaProperty} — 코드 ${codeType}=[${codeOptions.join(", ")}], Figma=[${figmaOptions.join(", ")}]`,
        );
      }
    }

    for (const [figmaProperty, declared] of Object.entries(
      contract.figmaOnlyProperties ?? {},
    )) {
      const figmaOptions = properties[figmaProperty]?.options;
      if (!Array.isArray(figmaOptions)) {
        issues.push(
          `선언된 Figma 전용 property가 없습니다: ${contract.figmaName}.${figmaProperty}`,
        );
        continue;
      }
      if (
        JSON.stringify([...figmaOptions].sort()) !==
        JSON.stringify([...declared.options].sort())
      ) {
        issues.push(
          `Figma 전용 property 옵션 불일치: ${contract.figmaName}.${figmaProperty} — 선언 [${declared.options.join(", ")}], 실제 [${figmaOptions.join(", ")}]`,
        );
      }
    }

    for (const [figmaProperty, codeProp] of Object.entries(
      contract.propProperties ?? {},
    )) {
      if (properties[figmaProperty] === undefined) {
        issues.push(
          `코드 prop에 대응하는 Figma property가 없습니다: ${contract.figmaName}.${figmaProperty} (코드 ${codeProp})`,
        );
        continue;
      }
      // 선언에서 `readonly leftIcon?:` 형태를 찾는다. tsc가 결정론적으로 내는 파일이다.
      const declared = new RegExp(`\\b${codeProp}\\??\\s*:`).test(declarationSource);
      if (!declared) {
        issues.push(
          `Figma property가 가리키는 코드 prop이 선언에 없습니다: ${contract.figmaName}.${figmaProperty} → ${codeProp}`,
        );
      }
    }

    issues.push(...compareComponentGeometry(contract, got));
    issues.push(...compareComponentStrokes(contract, got));
    issues.push(...compareComponentEffects(contract, got));

    const declaredProperties = new Set([
      ...Object.keys(contract.variantProperties),
      ...Object.keys(contract.figmaOnlyProperties ?? {}),
      ...Object.keys(contract.propProperties ?? {}),
    ]);
    for (const name of Object.keys(properties)) {
      if (!declaredProperties.has(name)) {
        issues.push(
          `선언되지 않은 Figma property가 있습니다: ${contract.figmaName}.${name}`,
        );
      }
    }

    // component set은 설명 없이 배포되면 쓸 수 없다. 코드 계약과 규범 경로를 적어 두어야 한다.
    if (got.hasDescription !== true) {
      issues.push(
        `${contract.figmaName}: description이 없습니다. 코드 계약과 규범 경로를 적어 두어야 합니다.`,
      );
    }

    // raw 값 사용 0 — 모든 시각 속성이 변수·style에 바인딩돼야 한다 (DS-F-006).
    //
    // **text style만 면제가 가능하다.** Figma text style은 all-or-nothing이라 line-height 하나만
    // 덮어도 style 연결이 끊긴다(실측 확인). 카드 오버레이처럼 컴포넌트 고유의 줄 간격이 필요한
    // 자리는 style을 붙일 방법이 없다. 면제하되 **검사를 빼지 않는다** — 바인딩 검사는 "값이
    // 토큰에서 온다"의 대리 지표이므로, 그 자리에서는 값을 직접 대조하도록 강제한다.
    const binding = got.binding ?? {};
    const exempt = contract.textStyleExempt;
    for (const field of ["rawFills", "rawStrokes", "textUnstyled"]) {
      if (field === "textUnstyled" && exempt !== undefined) continue;
      if ((binding[field] ?? 0) !== 0) {
        issues.push(
          `${contract.figmaName}에 바인딩되지 않은 값이 있습니다: ${field}=${binding[field]}`,
        );
      }
    }
    if (exempt !== undefined) {
      if (typeof exempt.reason !== "string" || exempt.reason.length < 20) {
        issues.push(`${contract.figmaName}: textStyleExempt에 20자 이상의 사유가 필요합니다.`);
      }
      if ((binding.textUnstyled ?? 0) !== exempt.parts.length) {
        issues.push(
          `${contract.figmaName}: style이 없는 텍스트 수가 면제 선언과 다릅니다 — 선언 ${exempt.parts.length}, Figma ${binding.textUnstyled}`,
        );
      }
      // 면제한 자리는 값을 직접 대조해야 한다. 대조하지 않으면 그냥 검사를 뺀 것이다.
      for (const partName of exempt.parts) {
        const fields = contract.geometry?.parts?.[partName]?.fields ?? {};
        for (const required of ["fontSize", "lineHeightPercent"]) {
          if (fields[required] === undefined) {
            issues.push(
              `${contract.figmaName}: ${partName}은 text style을 면제받았는데 ${required}를 대조하지 않습니다.`,
            );
          }
        }
      }
    }
  }

  for (const name of Object.keys(actualComponents)) {
    if (!seen.has(name)) {
      issues.push(`계약에 없는 component set이 있습니다: ${name}`);
    }
  }
  return issues;
}

function staleness(document) {
  const notes = [];
  if (document.provenance?.tokenSourceSha256 !== manifest.source?.sha256) {
    notes.push(
      "stale snapshot: token source가 snapshot 캡처 이후 바뀌었습니다. " +
        "Figma 라이브러리를 다시 적용하고 snapshot을 재덤프해야 합니다.",
    );
  }
  if (document.provenance?.proposalSha256 !== proposalSha) {
    notes.push(
      "stale snapshot: generated proposal이 snapshot 캡처 이후 바뀌었습니다.",
    );
  }
  return notes;
}

function tamperValue(document, expected) {
  for (const [id, want] of expected.variables) {
    for (const [mode, value] of Object.entries(want.valuesByMode)) {
      if (value.alias !== undefined) continue;
      const target = document.variables?.[id]?.valuesByMode?.[mode];
      if (!target || target.value === undefined) continue;
      target.value = Array.isArray(target.value)
        ? [0.123456, ...target.value.slice(1)]
        : typeof target.value === "number"
          ? target.value + 7
          : `${target.value}-tampered`;
      return `값 변조 ${id}@${mode}`;
    }
  }
  return null;
}

function tamperAlias(document, expected) {
  for (const [id, want] of expected.variables) {
    for (const [mode, value] of Object.entries(want.valuesByMode)) {
      if (value.alias === undefined) continue;
      const target = document.variables?.[id]?.valuesByMode?.[mode];
      if (!target) continue;
      target.alias = "color-tampered-target";
      return `alias 변조 ${id}@${mode}`;
    }
  }
  return null;
}

function tamperCollection(document, expected) {
  const [name] = [...expected.collections.keys()];
  if (!name || !document.collections?.[name]) return null;
  document.collections[name].variableCount += 1;
  return `collection 변수 수 변조 ${name}`;
}

function tamperModeOrder(document, expected) {
  for (const [name, want] of expected.collections) {
    if (want.modes.length < 2) continue;
    const target = document.collections?.[name];
    if (!target) continue;
    target.modes = [...target.modes].reverse();
    target.defaultMode = target.modes[0];
    return `mode 순서 변조 ${name}`;
  }
  return null;
}

function tamperStyle(document, expected) {
  for (const [, want] of expected.styles) {
    const bucket =
      want.representation === "text-style"
        ? document.styles?.text
        : document.styles?.effect;
    const target = bucket?.[want.figmaName];
    if (!target) continue;
    const [field, value] = Object.entries(want.attributes)[0];
    target[field] = typeof value === "number" ? value + 11 : `${value}-tampered`;
    return `style ${field} 변조 ${want.figmaName}`;
  }
  return null;
}

function tamperComponentVariant(document) {
  for (const contract of COMPONENT_CONTRACTS) {
    const target = document.components?.[contract.figmaName];
    const [property] = Object.keys(contract.variantProperties);
    const options = target?.properties?.[property]?.options;
    if (!Array.isArray(options)) continue;
    options.push("__tampered__");
    return `component variant 옵션 변조 ${contract.figmaName}.${property}`;
  }
  return null;
}

/**
 * 기하 변조 넷. "프레임 높이 2px 부족"이 실제로 일어났던 사고이므로 그것부터 넣는다.
 *
 * 각각이 독립적으로 실패를 만들어야 한다. 하나가 다른 것에 가려지면 그 검사는 없는 것과 같다.
 */
function tamperComponentHeight(document) {
  for (const contract of COMPONENT_CONTRACTS) {
    const geometry = document.components?.[contract.figmaName]?.geometry;
    const size = Object.keys(geometry ?? {})[0];
    if (size === undefined) continue;
    // border 두께의 두 배를 뺀다 — 실제로 났던 사고를 그대로 재현한다.
    geometry[size].height = [geometry[size].height[0] - 2];
    return `component 프레임 높이 변조 ${contract.figmaName}.${size}`;
  }
  return null;
}

/**
 * 자손 비교의 검출력을 고정한다.
 *
 * 계약값이 자손에 있는 컴포넌트는 root만 보면 전부 통과한다 — 그 상태가 정확히 이 게이트를
 * 확장하기 전의 상태였다. 아래 일곱은 그 확장이 실제로 무언가를 잡는지 증명한다.
 */
function firstPartContract() {
  return COMPONENT_CONTRACTS.find((contract) => contract.geometry?.parts !== undefined);
}

function firstPartGeometry(document) {
  const contract = firstPartContract();
  if (contract === undefined) return null;
  const geometry = document.components?.[contract.figmaName]?.geometry;
  const size = Object.keys(geometry ?? {})[0];
  if (size === undefined) return null;
  return { contract, geometry, size, parts: geometry[size].parts };
}

function tamperComponentPartPadding(document) {
  const found = firstPartGeometry(document);
  if (found === null) return null;
  for (const [name, plan] of Object.entries(found.contract.geometry.parts)) {
    if (plan.fields?.paddingBlock === undefined) continue;
    found.parts[name].paddingBlock = [found.parts[name].paddingBlock[0] + 4];
    return `자손 padding 변조 ${found.contract.figmaName}.${name}`;
  }
  return null;
}

function tamperComponentPartTypography(document) {
  const found = firstPartGeometry(document);
  if (found === null) return null;
  for (const [name, plan] of Object.entries(found.contract.geometry.parts)) {
    if (plan.fields?.lineHeightPercent === undefined) continue;
    // **1e-4 허용치보다 큰 값으로 흔든다.** float32 오차를 허용하면서도 실제 drift는 잡는지 본다.
    found.parts[name].lineHeightPercent = [found.parts[name].lineHeightPercent[0] + 30];
    return `자손 줄 간격 변조 ${found.contract.figmaName}.${name}`;
  }
  return null;
}

function tamperComponentPartRatio(document) {
  const found = firstPartGeometry(document);
  if (found === null) return null;
  for (const [name, plan] of Object.entries(found.contract.geometry.parts)) {
    if (plan.heightRatioOf === undefined) continue;
    found.parts[name].height = [found.parts[name].height[0] * 1.5];
    return `자손 높이 비율 변조 ${found.contract.figmaName}.${name}`;
  }
  return null;
}

function tamperComponentPartMissing(document) {
  const found = firstPartGeometry(document);
  if (found === null) return null;
  const name = Object.keys(found.contract.geometry.parts)[0];
  if (name === undefined || found.parts[name] === undefined) return null;
  delete found.parts[name];
  return `자손 삭제 ${found.contract.figmaName}.${name}`;
}

function tamperComponentPartExtra(document) {
  const found = firstPartGeometry(document);
  if (found === null) return null;
  found.parts["ZZZ 계약에 없는 층"] = { width: [10], height: [10] };
  return `계약에 없는 자손 추가 ${found.contract.figmaName}`;
}

function tamperComponentChildOrder(document) {
  const contract = COMPONENT_CONTRACTS.find((c) => Array.isArray(c.geometry?.childOrder));
  if (contract === undefined) return null;
  const geometry = document.components?.[contract.figmaName]?.geometry;
  const size = Object.keys(geometry ?? {})[0];
  if (size === undefined || !Array.isArray(geometry[size].childOrder)) return null;
  // 슬롯을 클릭 타깃 앞으로 옮긴다 — 크기는 다 맞는데 슬롯이 눌리지 않는 상태다.
  geometry[size].childOrder = [...geometry[size].childOrder].reverse();
  return `자식 순서 변조 ${contract.figmaName}.${size}`;
}

function tamperComponentProgressiveOffset(document) {
  for (const contract of COMPONENT_CONTRACTS) {
    for (const [role, expected] of Object.entries(contract.effects ?? {})) {
      if (typeof expected !== "string" || !expected.includes("PROGRESSIVE")) continue;
      const effects = document.components?.[contract.figmaName]?.effects;
      if (effects?.[role] === undefined) continue;
      // 램프의 끝점만 옮긴다 — 종류도 반경도 그대로라 type 검사로는 잡히지 않는다.
      effects[role] = [effects[role][0].replace(/0\.45$/, "0.9")];
      return `프로그레시브 램프 끝점 변조 ${contract.figmaName}.${role}`;
    }
  }
  return null;
}

function tamperComponentPadding(document) {
  for (const contract of COMPONENT_CONTRACTS) {
    const geometry = document.components?.[contract.figmaName]?.geometry;
    const size = Object.keys(geometry ?? {})[0];
    if (size === undefined) continue;
    geometry[size].paddingInline = [geometry[size].paddingInline[0] + 4];
    return `component padding 변조 ${contract.figmaName}.${size}`;
  }
  return null;
}

function tamperComponentSlot(document) {
  for (const contract of COMPONENT_CONTRACTS) {
    const geometry = document.components?.[contract.figmaName]?.geometry;
    const size = Object.keys(geometry ?? {})[0];
    const slots = geometry?.[size]?.slots;
    const slotName = Object.keys(contract.geometry?.slots ?? {}).find(
      (name) => Array.isArray(slots?.[name]),
    );
    if (slotName === undefined) continue;
    slots[slotName] = ["24x24"];
    return `component 아이콘 슬롯 크기 변조 ${contract.figmaName}.${size}.${slotName}`;
  }
  return null;
}

/** variant마다 값이 갈리는 경우. 대표값 하나만 봤다면 이것이 통과한다. */
function tamperComponentGeometryDrift(document) {
  for (const contract of COMPONENT_CONTRACTS) {
    const geometry = document.components?.[contract.figmaName]?.geometry;
    const size = Object.keys(geometry ?? {})[0];
    if (size === undefined) continue;
    geometry[size].cornerRadius = [geometry[size].cornerRadius[0], 999];
    return `component variant 간 기하 분기 변조 ${contract.figmaName}.${size}`;
  }
  return null;
}

/** 코드 prop에 대응하는 슬롯 property가 사라지는 경우. */
function tamperComponentPropProperty(document) {
  for (const contract of COMPONENT_CONTRACTS) {
    const properties = document.components?.[contract.figmaName]?.properties;
    const name = Object.keys(contract.propProperties ?? {}).find(
      (key) => properties?.[key] !== undefined,
    );
    if (name === undefined) continue;
    delete properties[name];
    return `코드 prop 대응 property 삭제 변조 ${contract.figmaName}.${name}`;
  }
  return null;
}

function tamperComponentDescription(document) {
  for (const contract of COMPONENT_CONTRACTS) {
    const target = document.components?.[contract.figmaName];
    if (target?.hasDescription !== true) continue;
    target.hasDescription = false;
    return `component description 삭제 변조 ${contract.figmaName}`;
  }
  return null;
}

/** stroke 두께 변조. 버튼 테두리를 spinner와 같은 2px로 바꿔도 잡혀야 한다. */
function tamperComponentStrokeWeight(document) {
  for (const contract of COMPONENT_CONTRACTS) {
    const strokes = document.components?.[contract.figmaName]?.strokes;
    const role = Object.keys(contract.strokes ?? {}).find((key) => Array.isArray(strokes?.[key]));
    if (role === undefined) continue;
    strokes[role] = ["2|INSIDE"];
    return `component stroke 두께 변조 ${contract.figmaName}.${role}`;
  }
  return null;
}

/** stroke 정렬 변조. 두께가 같아도 CENTER가 되면 시각 박스가 달라진다. */
function tamperComponentStrokeAlign(document) {
  for (const contract of COMPONENT_CONTRACTS) {
    const strokes = document.components?.[contract.figmaName]?.strokes;
    const role = Object.keys(contract.strokes ?? {}).find(
      (key) => Array.isArray(strokes?.[key]) && strokes[key][0]?.endsWith("|INSIDE"),
    );
    if (role === undefined) continue;
    strokes[role] = [strokes[role][0].replace("|INSIDE", "|CENTER")];
    return `component stroke 정렬 변조 ${contract.figmaName}.${role}`;
  }
  return null;
}

/** effect 종류 변조. INNER_SHADOW를 DROP_SHADOW로 바꿔도 잡혀야 한다. */
function tamperComponentEffectType(document) {
  for (const contract of COMPONENT_CONTRACTS) {
    const effects = document.components?.[contract.figmaName]?.effects;
    const role = Object.keys(contract.effects ?? {}).find((key) => Array.isArray(effects?.[key]));
    if (role === undefined) continue;
    // 종류를 문자열로 바꿔치기한다. 특정 종류에 의존하면 그 종류가 없는 컴포넌트에서 변조가
    // no-op이 되어 canary가 조용히 무력해진다 — 실제로 그렇게 됐다.
    const swap = { DROP_SHADOW: "INNER_SHADOW", INNER_SHADOW: "DROP_SHADOW", BACKGROUND_BLUR: "LAYER_BLUR", LAYER_BLUR: "BACKGROUND_BLUR" };
    const mutated = effects[role][0].replace(
      /DROP_SHADOW|INNER_SHADOW|BACKGROUND_BLUR|LAYER_BLUR/,
      (match) => swap[match],
    );
    if (mutated === effects[role][0]) continue;
    effects[role] = [mutated];
    return `component effect 종류 변조 ${contract.figmaName}.${role}`;
  }
  return null;
}

/** blur radius가 변수에서 풀려 숫자로 박히는 경우. */
function tamperComponentBlurUnbound(document) {
  for (const contract of COMPONENT_CONTRACTS) {
    const effects = document.components?.[contract.figmaName]?.effects;
    const role = Object.keys(effects ?? {}).find((key) =>
      effects[key].some((value) => value.includes("var(")),
    );
    if (role === undefined) continue;
    effects[role] = [effects[role][0].replace(/var\([^)]+\)/, "10")];
    return `component blur 변수 해제 변조 ${contract.figmaName}.${role}`;
  }
  return null;
}

/** 계약에 없는 effect가 새로 생기는 경우. */
function tamperComponentExtraEffect(document) {
  for (const contract of COMPONENT_CONTRACTS) {
    const target = document.components?.[contract.figmaName];
    if (!target || contract.effects === undefined) continue;
    target.effects = { ...target.effects, __extra__: ["LAYER_BLUR:NORMAL:4"] };
    return `계약에 없는 effect 추가 변조 ${contract.figmaName}`;
  }
  return null;
}

function tamperComponentBinding(document) {
  for (const contract of COMPONENT_CONTRACTS) {
    const target = document.components?.[contract.figmaName];
    if (!target?.binding) continue;
    target.binding.rawFills = 3;
    return `component raw 값 변조 ${contract.figmaName}`;
  }
  return null;
}

function resolvedToFigmaValue(resolved, nativeType) {
  if (nativeType === "COLOR") {
    const [r, g, b] = resolved.components;
    const round = (value) => Math.round(value * 1e6) / 1e6;
    return [round(r), round(g), round(b), resolved.alpha ?? 1];
  }
  if (nativeType === "FLOAT") {
    return typeof resolved === "object" ? resolved.value : resolved;
  }
  if (Array.isArray(resolved)) return resolved.join(", ");
  if (resolved && typeof resolved === "object" && resolved.timingFunction) {
    const timing = resolved.timingFunction.join(", ");
    return `${resolved.duration.value}ms cubic-bezier(${timing}) delay ${resolved.delay.value}ms`;
  }
  return String(resolved);
}

function valueEqual(left, right) {
  if (Array.isArray(left) && Array.isArray(right)) {
    return (
      left.length === right.length &&
      left.every((value, index) => valueEqual(value, right[index]))
    );
  }
  // 다층 shadow가 들어오면서 배열 원소가 숫자가 아니라 object가 됐다. 재귀하지 않으면
  // 값이 같아도 nearlyEqual(object, object)가 false를 돌려준다 — 실제로 그렇게 걸렸다.
  if (
    left !== null &&
    right !== null &&
    typeof left === "object" &&
    typeof right === "object"
  ) {
    const leftKeys = Object.keys(left).sort();
    const rightKeys = Object.keys(right).sort();
    return (
      leftKeys.length === rightKeys.length &&
      leftKeys.every((key, index) => key === rightKeys[index]) &&
      leftKeys.every((key) => valueEqual(left[key], right[key]))
    );
  }
  if (typeof left === "number" && typeof right === "number") {
    return nearlyEqual(left, right);
  }
  return left === right;
}

function nearlyEqual(left, right) {
  return Math.abs(Number(left) - Number(right)) <= 1e-5;
}

function firstIconName(document) {
  return Object.keys(document.icons ?? {}).sort()[0];
}

/** 아이콘 검색 키워드가 Figma에서 갈라지는 경우. */
function tamperIconKeywords(document) {
  for (const [name, icon] of Object.entries(document.icons ?? {})) {
    if (!Array.isArray(icon.keywords) || icon.keywords.length === 0) continue;
    icon.keywords = [icon.keywords[0]];
    return `아이콘 검색 키워드 변조 ${name}`;
  }
  return null;
}

function tamperIconMissing(document) {
  const name = firstIconName(document);
  if (name === undefined) return null;
  delete document.icons[name];
  return `아이콘 제거 ${name}`;
}

function tamperIconFrame(document) {
  const name = firstIconName(document);
  if (name === undefined) return null;
  document.icons[name].width = 32;
  document.icons[name].height = 32;
  return `아이콘 frame 변조 ${name}`;
}

function tamperIconRawPaint(document) {
  const name = firstIconName(document);
  if (name === undefined) return null;
  document.icons[name].binding.rawStrokes = 1;
  return `아이콘 raw paint ${name}`;
}

function tamperIconElementCount(document) {
  const name = firstIconName(document);
  if (name === undefined) return null;
  document.icons[name].vectors += 1;
  return `아이콘 요소 수 변조 ${name}`;
}

function firstTemplateName(document) {
  return Object.keys(document.templates ?? {}).sort()[0];
}

function tamperTemplateField(document) {
  const name = firstTemplateName(document);
  if (name === undefined) return null;
  document.templates[name].overlayHeightRatio = 0.5;
  return `template 오버레이 비율 변조 ${name}`;
}

function tamperTemplateSquare(document) {
  const name = firstTemplateName(document);
  if (name === undefined) return null;
  document.templates[name].cardHeight = document.templates[name].cardWidth + 40;
  return `template 카드 정사각 위반 ${name}`;
}

function tamperTemplateMissing(document) {
  const name = firstTemplateName(document);
  if (name === undefined) return null;
  delete document.templates[name];
  return `template 제거 ${name}`;
}
