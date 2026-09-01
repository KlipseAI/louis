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
    iconSlots: ["LeftIconGlyph", "RightIconGlyph"],
    declaration: "packages/react/dist/button/button.d.ts",
    // Figma variant property 이름 → 코드에서 같은 집합을 정의하는 타입 alias
    // 값은 타입 alias 이름이거나 { type, declaration } 이다. IconButton처럼 alias가 다른 파일에
    // 선언된 경우(ButtonVariant는 button.d.ts에 있다) 파일을 따로 지정한다.
    variantProperties: { Variant: "ButtonVariant", Size: "ButtonSize" },
    figmaOnlyProperties: {
      Label: { type: "TEXT", reason: "코드에서 children이라 타입 선언에 항목으로 나타나지 않는다(React가 준다)." },
      Icon: {
        options: ["left", "right", "both", "none"],
        reason:
          "코드에서 leftIcon/rightIcon은 ReactNode prop이고 있으면 그린다. Figma에서 불리언으로 두면 아이콘이 붙은 쪽 padding 보정(-2px, button.css:78-91)을 표현할 수 없다 — 불리언은 가시성만 바꾼다. 그래서 variant 축으로 쪼갰고 5×2×5×4 = 200이다.",
      },
      State: {
        options: ["Default", "Hover", "Active", "Disabled", "Loading"],
        reason:
          "Hover/Active는 코드에서 CSS 상태이고 Loading/Disabled는 boolean prop이다. Figma에는 CSS 상태가 없어 variant로 둔다. 이름의 뜻은 design/foundations/interaction-states.md가 소유한다 — Active는 :active(누르는 중)이며 Pressed(aria-pressed)는 Button에 없다.",
      },
    },
    // variant 축이 아니라 **존재 여부**로 코드 prop과 대응하는 property.
    // ReactNode prop은 문자열 union이 아니므로 옵션을 대조할 수 없다. 대신 선언에 그 prop이
    // 실제로 있는지를 본다. 이 칸이 없으면 Figma에만 있는 슬롯이 조용히 생긴다.
    // 아이콘은 **불리언이 아니라 Icon variant 축**이다 — 아이콘이 붙은 쪽 padding이 2px 줄기
    // 때문이다(button.css:78-91). 불리언은 가시성만 바꾸고 padding은 못 바꾼다.
    propProperties: { LeftIconGlyph: "leftIcon",
      RightIconGlyph: "rightIcon", },
    // 기하 계약. **Button은 border가 0이다** — `button.css:18`이 `border: 0`이고 secondary의
    // 헤어라인은 레이아웃을 건드리지 않는 inset box-shadow다(DS-D-0023). Figma의 INSIDE stroke도
    // auto-layout padding을 먹지 않는다. 그래서 padding에 border를 더하지 않는다 —
    // 더했더니 디자이너 눈에 `14.5 / 16.5 / 0.5` 같은 값이 보였고, 그건 CSS 어디에도 없는 수다.
    // (border가 실재하는 컴포넌트에서는 접는 것이 맞다. 그 계약은 각자 갖는다.)
    geometry: {
      measuredId: "button",
      // readback 기하 필드 → 기대값. 문자열이면 measured의 키, 배열이면 그 키들의 합,
      // `{ set: [키…] }`이면 한 size 안에 그 값들이 **모두** 나타나는 것이 계약이고, 그 외는 리터럴.
      // Button은 폭이 라벨에 달려 있으므로 width를 보지 않는다.
      //
      // **padding이 `set`인 이유는 `Icon` 축이 그것을 바꾸는 것이 설계이기 때문이다.** 아이콘이
      // 붙은 쪽만 2px 줄어 광학 균형을 맞춘다(button.css:128-152, button.md의 Properties 주석).
      // 그래서 한 size 안에 16과 14가 정상적으로 공존하고, 그것을 「variant마다 다릅니다」로
      // 잡으면 게이트가 자기 규범(figma-component-authoring.md §2의 조건 축)을 위반으로 읽는다.
      fields: {
        height: "height",
        paddingBlock: "paddingBlock",
        paddingBlockEnd: "paddingBlock",
        paddingInline: { set: ["paddingInline", "paddingInlineWithIcon"] },
        paddingInlineEnd: { set: ["paddingInline", "paddingInlineWithIcon"] },
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
    iconSlots: ["Glyph"],
    declaration: "packages/react/dist/icon-button/icon-button.d.ts",
    variantProperties: {
      // Icon Button은 Button과 같은 강조 축을 쓴다. alias 선언은 button.d.ts에 있다.
      // Button의 다섯 축이 아니라 넷이다 — icon-button.css에 inverse를 그릴 규칙이 없다.
      Variant: "IconButtonVariant",
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
    propProperties: { Content: "content" },
    declaration: "packages/react/dist/tooltip/tooltip.d.ts",
    variantProperties: {
      // Side는 화살표의 방향을 바꾼다. **표면 시각이 네 방향 같다고 적어 두었던 것이 잘못이었다** —
      // 그래서 화살표 없이 네 variant가 전부 같은 그림이었고, 축이 아무것도 바꾸지 않으면
      // 그 축은 거짓말이다(2026-08-18).
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
      parts: {
        // Side 축이 바꾸는 유일한 것. 없으면 네 variant가 같은 그림이 된다.
        Arrow: { fields: { width: "arrowWidth", height: "arrowHeight" } },
      },
    },
  },
  {
    id: "toast",
    strokes: {},
    effects: {
      self: "DROP_SHADOW:8:20:0 + BACKGROUND_BLUR:NORMAL:var(blur/toast)",
    },
    figmaName: "Toast",
    propProperties: { Message: "message" },
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
      HasIcon: { type: "BOOLEAN", reason: "선행 글리프의 유무. 한 메뉴 안에서 항목마다 갈리므로 축이 아니라 슬롯이다." },
      HasTrailing: { type: "BOOLEAN", reason: "후행 자리(단축키·화살표)의 유무." },
      Checked: { type: "BOOLEAN", reason: "선택 표시. 코드에서는 role=menuitemradio/checkbox의 aria-checked다 — tone·상태와 직교하므로 State 축에 접지 않는다." },
      State: {
        options: ["Default", "Hover", "Danger", "DangerHover", "Disabled", "Busy"],
        reason:
          "Default/Hover는 CSS 상태이고 Danger는 tone prop, Disabled는 disabled prop이다. Figma에는 CSS 상태가 없어 한 축에 합친다. DangerHover가 따로 있는 이유는 danger 항목의 hover 면이 일반 항목과 다른 토큰을 쓰기 때문이다. Busy는 항목이 스스로 작업을 도는 동안이다 — 후행 자리에 스피너가 서고 항목이 비활성처럼 보이지만 disabled와 달리 취소가 열려 있다.",
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
    propProperties: { Title: "children", Description: "children" },
    declaration: "packages/react/dist/dialog/types.d.ts",
    variantProperties: {},
    figmaOnlyProperties: {
      HasClose: { type: "BOOLEAN", reason: "닫기 버튼이 없는 대화상자가 있다 — 결정을 강제하는 확인 창이다. 코드에서는 onClose의 유무다." },
      Size: {
        options: ["compact", "medium", "large", "sheet"],
        reason:
          "코드의 DialogSize는 fullscreen을 포함해 넷이다. fullscreen은 표면이 뷰포트 자체이고 radius가 0이며 border가 없어 **고정 폭 variant로 그릴 수 없다** — Figma에서 그리면 어떤 폭을 골라도 거짓이 된다. 그래서 코드 축의 부분집합을 Figma 전용으로 선언한다. sheet는 반대 방향의 추가다 — 좁은 화면에서 아래에서 올라오는 시트가 제품에 실재하는데 코드 축에 이름이 없어, 디자이너가 그것을 그릴 자리가 없었다.",
      },
    },
    geometry: {
      measuredId: "dialog",
      fields: {
        width: "width",
        paddingBlock: ["surfaceInset", "borderWidth"],
        paddingBlockEnd: ["surfaceInset", "borderWidth"],
        paddingInline: ["surfaceInset", "borderWidth"],
        paddingInlineEnd: ["surfaceInset", "borderWidth"],
        itemSpacing: "gap",
        cornerRadius: "radius",
        layoutMode: { literal: "VERTICAL" },
      },
      slots: {},
      parts: {
        // 확인 대화상자가 성립하려면 Footer와 액션 둘이 있어야 한다. 없으면 디자이너가
        // 확인 대화상자를 Figma로 만들 수 없다(2026-08-18 실무 감사).
        Footer: { fields: { paddingTop: "footerPaddingTop", paddingInline: "footerInset", children: "footerChildren" } },
        Actions: { fields: { itemSpacing: "actionsGap", children: "actionCount" } },
      },
      extraStrokeWeights: [],
    },
  },
  // ── 코드가 정본이고 LOUIS recipe 가 아직 없는 것 ──────────────────────────
  // 제품 구현이 이미 있고 소비처도 여덟인데 DS 에는 없던 자리다. Figma 를 먼저 세워
  // 「무엇을 만들어야 하는지」를 고정한다. 대조할 `.d.ts` 가 없으므로 declaration 을 읽지 않는다.
  {
    id: "video-player",
    figmaName: "MediaScrubber",
    figmaAhead: "LOUIS recipe 없음 — apps/web/components/ui/VideoPlayer.tsx 의 진행 바가 정본이다.",
    variantProperties: {},
    figmaOnlyProperties: {
      State: {
        options: ["Default", "Hover"],
        reason:
          "hover 에서 트랙이 3→5 로 두꺼워지고 썸이 scale(0)→scale(1) 로 나타난다. **포인터 이벤트를 바깥 wrapper 하나가 소유**하므로(VideoPlayer.tsx:846-853) 프로토타입도 여기 걸린다. 드래그 전용 상태는 코드에 없다 — dragging state 가 CSS 에 반영되지 않는다.",
      },
    },
    strokes: {},
    effects: {},
  },
  {
    id: "video-player",
    figmaName: "VideoPlayer",
    figmaAhead: "LOUIS recipe 없음 — 제품 VideoPlayer.tsx 가 정본이고 소비처가 8곳이다.",
    variantProperties: {},
    // **스킨 축이 없다.** 제품에 두 벌이 있었고 그중 한 벌만 여덟 자리 중 일곱에서 쓰였다 —
    // 나머지 한 자리(PublishFlow)도 같은 조형으로 통합해 지금은 플레이어가 하나다.
    figmaOnlyProperties: {
      Chrome: {
        options: ["Shown", "Hidden"],
        reason: "컨트롤의 opacity 와 pointer-events. 유리 알약의 blur 반경(0↔2px)까지 함께 바뀌어 색 축이 아니다.",
      },
      Tone: {
        options: ["dark", "bright"],
        reason:
          "**유리 틴트는 두 톤 모두 검정 계열이고 글자·아이콘 색만 뒤집힌다**(VideoPlayer.tsx:72-78). 알약이 밝아 보이는 것은 뒤의 밝은 영상이 검정 틴트를 통과한 합성 결과다 — 틴트를 흰색으로 만들면 원본과 달라진다.",
      },
      SkipButtons: { type: "BOOLEAN", reason: "스킵 버튼 두 개의 유무. **기본이 꺼짐이다** — 소비처 8곳 중 켜는 곳이 둘뿐이다." },
      ExpandButton: { type: "BOOLEAN", reason: "확대 버튼의 유무. 8곳 중 3곳만 쓴다." },
      DownloadButton: { type: "BOOLEAN", reason: "다운로드 버튼의 유무. PublishFlow 하나만 쓴다 — 기본은 꺼짐이다." },
      PlayGlyph: { type: "INSTANCE_SWAP", reason: "재생·일시정지 글리프를 바꿔 끼운다." },
    },
    // 스킵·확대 글리프는 라이브러리에 없어 벡터로 그렸다. 두께는 아이콘 정본을 따른다.
    strokes: { Vector: { weight: "icon", align: "CENTER" } },
    // 유리 알약 다섯이 같은 헤어라인을 쓴다 — Button secondary 와 같은 레시피다.
    effects: {
      "Skip back 10s": "INNER_SHADOW:0:0:0.5",
      Play: "INNER_SHADOW:0:0:0.5",
      "Skip forward 10s": "INNER_SHADOW:0:0:0.5",
      "Progress pill": "INNER_SHADOW:0:0:0.5",
      Expand: "INNER_SHADOW:0:0:0.5",
    },
  },
  // ── CSS 레시피는 있고 React 표면이 없는 것들 ────────────────────────────────
  // LOUIS 가 CSS 로 정의해 두고 **Figma 에도 문서에도 없던** 다섯이다(2026-08-26 확인).
  // 시스템이 정의한 것을 디자이너가 볼 수 없으면 정의하지 않은 것과 같아서, Figma 를 먼저
  // 세우고 문서를 붙였다. 대조할 `.d.ts` 가 없으므로 declaration 을 읽지 않는다 —
  // 정본은 CSS 파일이고, 그 사실을 figmaAhead 에 적는다.
  {
    id: "alert",
    figmaName: "Alert",
    figmaAhead: "React 표면 없음 — packages/css/src/component/alert.css 가 정본이다.",
    variantProperties: {},
    figmaOnlyProperties: {
      Tone: {
        options: ["danger", "info", "success", "warning"],
        reason:
          "tone 하나가 면·테두리·글자 셋을 함께 바꾼다. CSS 에서 data-tone 속성 선택자이고 기본값이 danger 다 — 제품에서 실제로 가장 많이 쓰는 자리가 결제 실패 배너다.",
      },
      HasIcon: { type: "BOOLEAN", reason: "아이콘 없는 경고가 있다. CSS 에서는 __icon 자식의 유무다." },
      HasTitle: { type: "BOOLEAN", reason: "제목 없이 한 줄만 있는 경고가 있다. CSS 에서는 __title 자식의 유무다." },
      Title: { type: "TEXT", reason: "제목 문구. 코드에서는 자식 요소라 prop 이 아니다." },
      Body: { type: "TEXT", reason: "본문 문구. 코드에서는 __content 안의 텍스트다." },
      Glyph: { type: "INSTANCE_SWAP", reason: "tone 마다 어울리는 글리프가 달라 고를 수 있어야 한다." },
    },
    // 경고는 헤어라인이 아니라 **보이는 테두리**를 갖는다 — 면과 글자가 tone 색이라
    // 표면 위에서 경계가 필요하고, border-width-default(1) 를 쓴다.
    strokes: { self: { weight: 1, align: "INSIDE" } },
    effects: {},
  },
  {
    id: "switch",
    figmaName: "Switch",
    figmaAhead: "React 표면 없음 — packages/css/src/component/switch.css 가 정본이다.",
    variantProperties: {},
    figmaOnlyProperties: {
      Checked: {
        options: ["false", "true"],
        reason: "코드에서는 aria-checked 다. Figma 에 상태가 없어 축으로 둔다 — 켜짐은 트랙 색과 썸 위치를 함께 바꾼다.",
      },
      Disabled: {
        options: ["false", "true"],
        reason: "opacity 0.45 하나만 바꾼다. Checked 와 직교하므로 한 축에 접지 않는다 — 켜진 채 비활성인 스위치가 실재한다.",
      },
    },
    strokes: {},
    // 썸의 그림자는 elevation/switch-thumb 다. 트랙에는 그림자가 없다.
    effects: { Thumb: "DROP_SHADOW:1:3:0" },
  },
  {
    id: "node-chip",
    figmaName: "NodeChip",
    figmaAhead: "React 표면 없음 — packages/css/src/component/node-chip.css 가 정본이다.",
    variantProperties: {},
    figmaOnlyProperties: {
      Shape: {
        options: ["default", "square"],
        reason: "square 는 폭과 좌우 패딩을 함께 바꾼다(32 고정 · 패딩 0). 기하가 갈리므로 boolean 슬롯이 아니라 축이다.",
      },
      State: {
        options: ["Default", "Hover", "Disabled"],
        reason: "Hover 는 CSS 상태이고 Disabled 는 prop 이다. Figma 에 CSS 상태가 없어 한 축에 합친다. disabled 는 면이 아니라 글자색만 바꾼다 — 칩 전용 fg 토큰이 그것 때문에 생겼다.",
      },
      Label: { type: "TEXT", reason: "칩 글자. square 에는 없다." },
      HasGlyph: { type: "BOOLEAN", reason: "글리프 없는 글자 전용 칩이 있다." },
      Glyph: { type: "INSTANCE_SWAP", reason: "노드 종류마다 글리프가 다르다." },
    },
    strokes: {},
    // 헤어라인은 테두리가 아니라 inset 그림자다 — 레이아웃을 건드리지 않는다.
    effects: { self: "INNER_SHADOW:0:0:0.5" },
  },
  {
    id: "pane-divider",
    figmaName: "PaneDivider",
    figmaAhead:
      "React 표면 없음 — packages/css/src/component/pane-divider.css 가 정본이다.",
    variantProperties: {},
    figmaOnlyProperties: {
      Orientation: {
        options: ["vertical", "horizontal"],
        reason:
          "축이 바뀌면 프레임 자신의 고정 크기가 전치되고(4×160 ↔ 160×4) 커서와 그립이 자라는 축도 함께 갈린다. BOOLEAN 으로는 어느 쪽도 못 그린다 — 근거는 figma-component-authoring.md 「2026-08-29 개정의 근거」.",
      },
      State: {
        options: ["Default", "Hover"],
        reason:
          "CSS 상태라 코드에 prop 이 없다. active(`data-louis-state`)는 Hover 와 같은 모양이라 변형을 따로 두지 않는다 — 곱할 것이 없는 축은 열지 않는다.",
      },
    },
    strokes: {},
    // 그림자가 없다. 구분자는 면이 아니라 선이고, 그립은 배경색 하나로 선다.
    effects: {},
    /* **이 컴포넌트의 계약은 불투명도다.** 쉴 때 그립이 아예 보이지 않고(0) 얹으면 나타난다(1).
       기하는 `components.measured.json` 에 항목이 없어 대조되지 않으므로, 계약이 실제로 잡는
       것은 여기뿐이다. 값은 자손(`Grip`)에 있으므로 `part` 를 함께 적는다 — 루트만 읽던
       비교기를 그 때문에 넓혔다. */
    opacity: {
      "vertical/Default": { part: "Grip", value: 0 },
      "vertical/Hover": { part: "Grip", value: 1 },
      "horizontal/Default": { part: "Grip", value: 0 },
      "horizontal/Hover": { part: "Grip", value: 1 },
    },
  },
  {
    id: "tabs",
    figmaName: "TabItem",
    figmaAhead: "React 표면 없음 — packages/css/src/component/tabs.css 의 .louis-tabs__tab 이 정본이다.",
    variantProperties: {},
    figmaOnlyProperties: {
      State: {
        options: ["Default", "Hover", "Selected", "Disabled"],
        reason:
          "네 상태가 **전부 opacity 로만 갈린다** — 0.48 · 0.9 · 1 · 0.32. 면도 글자색도 바뀌지 않는다. 상호작용을 받는 것이 탭 하나이므로 트랙이 아니라 여기가 소유하고, 프로토타입(ON_HOVER · ON_CLICK)도 여기 걸린다.",
      },
      Label: { type: "TEXT", reason: "탭 글자." },
    },
    strokes: {},
    effects: {},
  },
  {
    id: "tabs",
    figmaName: "Tabs",
    figmaAhead: "React 표면 없음 — packages/css/src/component/tabs.css 의 .louis-tabs 가 정본이다.",
    // 트랙은 축이 없다. TabItem 인스턴스를 붙이고 빼서 조립하며 auto-layout 이 폭을 정한다.
    variantProperties: {},
    figmaOnlyProperties: {},
    strokes: {},
    effects: {},
  },
  {
    id: "table",
    figmaName: "TableHeaderCell",
    figmaAhead: "React 표면 없음 — packages/css/src/component/table.css 의 thead th 가 정본이다.",
    variantProperties: {},
    figmaOnlyProperties: {
      Align: {
        options: ["start", "center", "end"],
        reason: "CSS 의 data-align 이다. end 는 tabular-nums 도 함께 켜는데 Figma 에 대응이 없어 정렬만 표현한다.",
      },
      Label: { type: "TEXT", reason: "머리글 문구." },
    },
    strokes: {},
    effects: {},
  },
  {
    id: "table",
    figmaName: "TableCell",
    figmaAhead: "React 표면 없음 — packages/css/src/component/table.css 의 tbody td 가 정본이다.",
    variantProperties: {},
    figmaOnlyProperties: {
      Align: { options: ["start", "center", "end"], reason: "머리 칸과 같은 축이다." },
      State: {
        options: ["Default", "Hover"],
        reason: "hover 는 행이 받지만 면은 칸이 칠한다(CSS 도 tr:hover > td 다). 그래서 칸의 축이다.",
      },
      Label: { type: "TEXT", reason: "값 문구." },
    },
    // 행 구분선은 칸의 **아래 한 변**이다. 마지막 행은 이 변을 0 으로 두므로 Table 조립본에는
    // 1 과 0 이 함께 나타난다.
    strokes: { self: { weight: 1, align: "INSIDE" } },
    effects: {},
  },
  {
    id: "table",
    figmaName: "Table",
    figmaAhead: "React 표면 없음 — packages/css/src/component/table.css 가 정본이다.",
    variantProperties: {},
    figmaOnlyProperties: {},
    // 머리 **행**이 반경과 헤어라인을 갖는다(CSS 의 thead > tr). 칸은 면만 칠하고, 행이
    // clipsContent 로 그 면을 반경에 맞춰 깎는다 — isolation:isolate 가 하던 일이다.
    strokes: {
      TableCell: {
        weight: [1, 0],
        align: "INSIDE",
        reason:
          "행 구분선은 칸의 아래 한 변인데 마지막 행만 0 이다 — CSS의 `tbody > tr:last-child > td { border-block-end: 0 }`. 조립본에는 두 값이 함께 나타나는 것이 맞다.",
      },
    },
    effects: { HeaderRow: "INNER_SHADOW:0:0:0.5" },
  },
  // ── Figma 선행 컴포넌트 ──────────────────────────────────────────────────
  // 제품 전수 인벤토리(2026-08-26)에서 「재사용되는데 DS 에 없다」로 확인된 것들을 Figma 에
  // 먼저 세웠다. LOUIS recipe 가 아직 없으므로 declaration 을 대조할 수 없다 — 코드가 생기면
  // variantProperties·geometry 를 채운다. 계약에서 빼 두면 게이트가 「계약에 없는 set」으로
  // 잡아 매번 걸리므로, **아직 코드가 없다는 사실을 계약으로 적는다.**
  {
    id: "keycap",
    figmaName: "Keycap",
    figmaAhead: "LOUIS recipe 없음 — CommandPalette.tsx:281-296 이 정본이다.",
    variantProperties: {},
    // **제품과 줄 높이·자간이 다르다.** 정본(CommandPalette.tsx:288)은 leading-[1] 이고 글자
    // 키캡은 tracking-[0.02em] 을 더 준다. Figma 에서는 스케일 스타일(typography/caption-*)을
    // 그대로 쓴다 — 칩이 20×20 고정이고 글자가 가운데 정렬이라 줄 높이가 보이는 크기를 바꾸지
    // 않는다(적용 전후 칩 20×20 동일 확인). 스타일 연결을 끊어 가며 지킬 값이 아니다.
    // 칩 테두리는 border 가 아니라 inset 그림자다(정본의 box-shadow: inset 0 0 0 1px).
    strokes: {},
    effects: { self: "INNER_SHADOW:0:0:1" },
    figmaOnlyProperties: {
      Label: { type: "TEXT", reason: "키캡 글자. 코드에서는 children 이다." },
      Kind: { options: ["glyph", "text"], reason: "글리프 키캡과 글자 키캡은 자간·굵기만 다르다(KEY vs KEY_TEXT)." },
    },
  },
  // ── 랜딩에서 올라온 여섯 ──────────────────────────────────────────────────
  // 제품 랜딩이 이미 쓰고 있는데 DS 에 이름이 없던 자리다. **여기서는 코드가 Figma 보다
  // 앞서 있다** — Keycap 계열과 방향이 반대이므로 계약값은 전부 제품 소스에서 끌어왔다.
  // Figma 값을 그대로 옮기면 게이트가 Figma 로 Figma 를 검증하는 셈이 된다.
  //
  // 여섯이 요구한 축(Badge · Direction · Expanded · Featured · Surface · State=Selected)의
  // 판정은 design/governance/figma-component-authoring.md §2 가 소유한다. 아래 사유 문구는
  // 그 판정을 가리키고, 판정과 Figma 파일이 아직 갈린 자리는 결손으로 적는다.
  {
    id: "media-card",
    figmaName: "MediaCard",
    figmaAhead: "LOUIS recipe 없음 — 제품 MediaCard.tsx 가 정본이고 소비처가 세 자리다.",
    variantProperties: {},
    // 카드 자신에는 테두리가 없다. 사진이 면이고 경계는 radius 로만 만든다.
    strokes: {},
    // **두 겹의 배경 흐림이 이 컴포넌트의 조형이다.** 값의 출처는 제품 클래스다 —
    // 배지가 `backdrop-filter: blur(10px)`, 정보 바가 **ProjectCard 제목 띠와 같은 점진 블러**다.
    //
    // 정보 바는 전에 균일 `blur(20)` 이었고 20 은 토큰이 없어 리터럴로 남아 있었다. 소유자가
    // 「점진 블러가 의도였다」를 확인해 정본을 하나로 합쳤다 — 반경과 마스크 곡선을 LOUIS
    // base.css 의 `--louis-progressive-blur` / `--louis-progressive-blur-mask` 가 소유하고
    // 두 카드가 그것을 참조한다. 그래서 반경이 `blur/surface`(10) 로 내려오고 리터럴 20 이
    // 사라진다.
    //
    // **램프를 project-card 의 정지점 표에서 유도한다.** media-card 쪽에 표를 복사하면 정본이
    // 둘이 되어 CSS 를 고쳐도 한쪽만 따라온다 — 레시피가 한 벌이므로 표도 한 벌이다.
    effects: {
      Badge: "BACKGROUND_BLUR:NORMAL:var(blur/surface)",
      InfoBar: progressiveBlurFrom("project-card", "base", "blur/surface"),
    },
    // 브랜드 글리프는 소비처마다 다르다. 슬롯이 없으면 아홉 장이 전부 같은 글리프가 된다.
    iconSlots: ["Glyph"],
    figmaOnlyProperties: {
      Badge: {
        options: ["New", "Top", "none"],
        reason:
          "코드에서 badge 는 optional 문구 prop 이라 축이 아니다. Figma 에 「값이 없으면 안 그린다」가 없어 축으로 뒀고, 값에 문구까지 들어가 있다. **figma-component-authoring.md §2 개정이 이 축을 폐기 판정했다** — 값이 내용이라 시험 4 에 걸리고, 배지를 감춰도 카드가 316×316 고정이라 나머지 세 시험은 통과한다. 갈 곳은 Badge BOOLEAN + BadgeLabel TEXT(변형 3 → 1)다. **Figma 재작업이 아직 안 됐다** — 그래서 이 계약은 현상(3값 VARIANT)을 그대로 적는다. 파일을 다시 세우면 여기도 같이 고친다.",
      },
      Title: { type: "TEXT", reason: "이름 한 줄. 코드에서는 name prop 이다." },
      Icon: { type: "BOOLEAN", reason: "브랜드 글리프의 유무. 코드에서는 icon prop 이 ReactNode 라 있으면 그린다." },
      Glyph: { type: "INSTANCE_SWAP", reason: "그 글리프가 무엇인지. Icon 과 짝으로 낸다(§3)." },
      Description: { type: "BOOLEAN", reason: "설명 줄의 유무. 코드에서는 sub prop 의 유무다." },
      DescriptionLabel: { type: "TEXT", reason: "설명 문구. 코드에서는 sub 의 값이다." },
    },
    // **기하 정본이 생겼다.** 이 여덟은 LOUIS recipe 가 없어 `component-geometry.browser.test.tsx`
    // 가 잴 코드가 없었고, 그래서 `figma/components.measured.json` 에 항목이 없어 계약이
    // `geometry` 를 비워 두고 있었다. 이제 `scripts/measure-product-components.mjs` 가 제품
    // 클래스를 제품 Tailwind 로 컴파일해 실브라우저에서 잰다 — 대조 방향이 반대다. 「DS 가
    // 옳은가」가 아니라 **「Figma 가 제품 그대로인가」**를 본다.
    //
    // **TopBar 는 넣지 않는다.** 되읽기에 316×54 프레임이 있지만 제품에는 그런 상자가 없다 —
    // 배지가 카드에 직접 absolute 로 앉는다(`left-8 top-8`). Figma 가 auto-layout 을 세우려고
    // 만든 상자이므로 제품에서 잴 대상이 없다.
    // **Glyph 슬롯(16×16)도 넣지 않는다.** 글리프는 소비처가 넘기는 ReactNode 이고 카드가
    // 크기를 선언하지 않는다 — 제품에 슬롯 크기 계약 자체가 없다.
    geometry: {
      measuredId: "media-card",
      sizeKey: "base",
      fields: {
        width: "width",
        height: "height",
        cornerRadius: "radius",
        paddingBlock: "paddingBlock",
        paddingBlockEnd: "paddingBlock",
        paddingInline: "paddingInline",
        paddingInlineEnd: "paddingInline",
        // 카드는 flex 도 grid 도 아니라 gap 선언이 없다. Figma 는 auto-layout 프레임이라 0 을
        // 갖는다 — 잴 선언이 없는 자리는 리터럴로 적는다.
        itemSpacing: { literal: 0 },
        layoutMode: { literal: "VERTICAL" },
      },
      slots: {},
      extraStrokeWeights: [],
      parts: {
        // **제품에 없는 상자다.** Figma 가 배지를 auto-layout 으로 앉히려고 만든 프레임이고
        // 제품은 배지를 카드에 직접 absolute 로 붙인다(`left-8 top-8`). 그래도 값은 실재한다 —
        // padding 16 은 그 인셋이고 높이 54 는 16 + 배지 22 + 16 이다. 상자를 지어내는 대신
        // 인셋을 재고 합으로 적는다.
        TopBar: {
          fields: {
            width: "width",
            height: ["badgeInset", "badgeHeight", "badgeInset"],
            paddingBlock: "badgeInset",
            paddingBlockEnd: "badgeInset",
            paddingInline: "badgeInset",
            paddingInlineEnd: "badgeInset",
          },
        },
        Badge: {
          fields: {
            height: "badgeHeight",
            paddingBlock: "badgePaddingBlock",
            paddingBlockEnd: "badgePaddingBlock",
            paddingInline: "badgePaddingInline",
            paddingInlineEnd: "badgePaddingInline",
            cornerRadius: "badgeRadius",
          },
        },
        // 줄 높이는 Figma 가 %로 갖고 제품은 px 로 갖는다. 150 은 제품 타입 스케일이 전부 1.5
        // 라는 사실이고, 그 곱은 fontSize·lineHeight 두 축을 함께 재는 EXPECT 가 지킨다.
        BadgeLabel: { fields: { fontSize: "badgeFontSize", lineHeightPercent: { literal: 150 } } },
        InfoBar: {
          fields: {
            paddingBlock: "infoPaddingBlockStart",
            paddingBlockEnd: "infoPaddingBlockEnd",
            paddingInline: "infoPaddingInline",
            paddingInlineEnd: "infoPaddingInline",
            itemSpacing: "infoGap",
            layoutMode: { literal: "VERTICAL" },
          },
        },
        NameRow: { fields: { itemSpacing: "nameRowGap" } },
        Title: { fields: { fontSize: "titleFontSize", lineHeightPercent: { literal: 150 } } },
        Description: { fields: { fontSize: "descriptionFontSize", lineHeightPercent: { literal: 150 } } },
      },
    },
  },
  {
    id: "carousel-arrow",
    figmaName: "CarouselArrow",
    figmaAhead: "LOUIS recipe 없음 — 제품 CarouselArrows.tsx 가 정본이고 소비처가 다섯 자리다.",
    variantProperties: {},
    // 캐럿은 인라인 SVG 다. 제품이 strokeWidth="1" 을 주고 SVG stroke 는 경로 위에 가운데
    // 정렬되므로 CENTER 다. **아이콘 정본 두께(1.5)와 다르다** — 라이브러리에 없는 글리프라
    // 제품 값을 그대로 옮겼고, 그래서 `weight: "icon"` 이 아니라 숫자를 적는다.
    strokes: { glyph: { weight: 1, align: "CENTER" } },
    // 헤어라인이 **테두리가 아니다.** 제품이 box-shadow: var(--louis-hairline-inset) 을 쓰고
    // 그 토큰은 `inset 0 0 0 border-width-hairline(0.5)` 이다(base.css). inset 그림자는
    // 레이아웃 박스를 건드리지 않아 32×32 가 그대로 남는다 — stroke 로 그리면 INSIDE 여도
    // 시각 박스가 달라진다.
    effects: { self: "INNER_SHADOW:0:0:0.5" },
    figmaOnlyProperties: {
      Direction: {
        options: ["prev", "next"],
        reason:
          "코드는 버튼 **쌍**을 하나로 내보내고 방향은 두 개의 button 이라 prop 이 아니다. Figma 는 상호작용을 받는 단위가 버튼 하나라 set 을 하나로 뽑았고 방향이 축이 됐다. **figma-component-authoring.md §2 개정이 Direction 을 축 표에 열었다** — 값 prev·next 는 트랙의 진행 방향이지 화살표가 가리키는 쪽(left/right)이 아니다. 글리프를 INSTANCE_SWAP 으로 내려 축을 없애는 길은 두 캐럿이 인라인 벡터라 스왑 후보를 채울 수 없어 성립하지 않는다.",
      },
      State: {
        options: ["Default", "Hover", "Disabled"],
        reason:
          "Hover 는 코드에서 CSS 상태이고 Disabled 는 prevDisabled/nextDisabled prop 이 만드는 네이티브 disabled 다. Figma 에 CSS 상태가 없어 한 축에 묶는다. **Focus 가 없는 것은 의도가 아니라 결손이다** — 제품 버튼 클래스에 :focus-visible 선언이 없다(carousel-arrow.md Accessibility).",
      },
    },
    // **기하 정본이 생겼다.** 이 여덟은 LOUIS recipe 가 없어 `component-geometry.browser.test.tsx`
    // 가 잴 코드가 없었고, 그래서 `figma/components.measured.json` 에 항목이 없어 계약이
    // `geometry` 를 비워 두고 있었다. 이제 `scripts/measure-product-components.mjs` 가 제품
    // 클래스를 제품 Tailwind 로 컴파일해 실브라우저에서 잰다 — 대조 방향이 반대다. 「DS 가
    // 옳은가」가 아니라 **「Figma 가 제품 그대로인가」**를 본다.
    //
    // **Caret · glyph 파트는 넣지 않는다.** 캐럿 16×16 은 클래스가 아니라 인라인 SVG 의
    // `width`/`height` **속성**이고, glyph 5×10 은 `path` 의 바운딩 박스다. 둘 다 클래스
    // 문자열을 컴파일해 재는 이 하네스가 닿지 않는 값이라 억지로 적지 않는다.
    geometry: {
      measuredId: "carousel-arrow",
      sizeKey: "base",
      fields: {
        width: "width",
        height: "height",
        cornerRadius: "radius",
        paddingBlock: "paddingBlock",
        paddingBlockEnd: "paddingBlock",
        paddingInline: "paddingInline",
        paddingInlineEnd: "paddingInline",
        itemSpacing: { literal: 0 },
        layoutMode: { literal: "HORIZONTAL" },
      },
      slots: {},
      // 헤어라인이 stroke 가 아니라 inset 그림자다(위 effects). 되읽기의 strokeWeight 도 비어 있다.
      extraStrokeWeights: [],
      parts: {
        // **둘 다 잴 대상이 없어 계약을 비운다.** 계약이 자손을 선언하지 않으면 게이트가
        // 「계약에 없는 자손」으로 걸므로, **없다고 적는 대신 값이 없다고 적는다.**
        //   · Caret 16×16 은 인라인 SVG 의 `width`/`height` **속성**이다 — 클래스가 아니라
        //     이 하네스가 컴파일할 것이 없다.
        //   · glyph 5×10 은 `path` 의 바운딩 박스다. DOM 에 그 수를 만드는 선언이 없다.
        Caret: { fields: {} },
        glyph: { fields: {} },
      },
    },
  },
  {
    id: "step-tile",
    figmaName: "StepTile",
    figmaAhead:
      "LOUIS recipe 없음 — 제품 StepTiles.tsx 가 정본이고 랜딩 3-스텝 섹션 한 자리에서 쓴다.",
    // 변형 축이 하나도 없다. variantCount 가 1 이고, 폭은 바깥 3열 격자가 정하므로 Size 축도
    // 만들지 않았다 — 어떤 폭을 고정해도 거짓이 된다(MediaCard 의 layout 축을 비운 것과 같다).
    variantProperties: {},
    // **테두리가 없다.** 제품 타일은 border 도 inset 그림자도 없는 순수한 면이다 — 이 시스템의
    // 면 대부분이 갖는 헤어라인이 여기엔 없다. 빈 객체가 그 사실을 계약으로 고정한다:
    // 나중에 Figma 에 stroke 가 생기면 「계약에 없는 stroke」로 잡힌다.
    strokes: {},
    // 그림자도 배경 흐림도 없다. 같은 이유로 비워 둔다 — MediaCard 와 달리 이 타일에는
    // 얹히는 층이 없어서 흐릴 대상 자체가 없다.
    effects: {},
    // 제품은 **타일 하나를 컴포넌트로 내보내지 않는다** — StepTiles.tsx 가 섹션 전체를 그리고
    // 타일은 그 안의 li 다. 그래서 대조할 prop 선언이 없고 세 슬롯이 전부 Figma 전용이다.
    // 타입은 figma-component-authoring.md §3 대로다(있고 없고=BOOLEAN, 문구=TEXT) — 닫힌 축
    // 표를 벗어나는 축이 없다. **이름은 §3 명부를 그대로 따르지 않는다**: Description 은 §3 의
    // TEXT 명부에 있는 이름이고 BOOLEAN 명부에는 없다. 이 짝의 근거는 §2 개정표의 MediaCard
    // 선례(Badge BOOLEAN + BadgeLabel TEXT)다(step-tile.md Known deviations 10).
    figmaOnlyProperties: {
      Label: {
        type: "TEXT",
        reason:
          "캡션의 첫 덩어리이자 이 타일에서 유일한 필수 글자. 코드에서는 항목의 label 문구이고 컴포넌트 prop 이 아니다.",
      },
      Description: {
        type: "BOOLEAN",
        reason:
          "설명 덩어리의 유무. 코드에서는 description 이 빈 문자열이면 그 span 자체를 그리지 않는다 — 빈 것을 남기면 공백만 붙기 때문이다. 세 번째 항목이 실제로 빈 문자열이다.",
      },
      DescriptionLabel: {
        type: "TEXT",
        reason:
          "설명 문구. 코드에서는 description 의 값이다. Description(BOOLEAN) 과 짝으로 낸다 — §3 이 짝으로 규정한 것은 BOOLEAN + INSTANCE_SWAP 뿐이고, 이 BOOLEAN + {Name}Label TEXT 형태의 근거는 §2 개정표의 MediaCard 선례(Badge + BadgeLabel)다.",
      },
    },
    geometry: {
      measuredId: "step-tile",
      sizeKey: "base",
      fields: {
        cornerRadius: "radius",
        paddingBlock: "paddingBlock",
        paddingBlockEnd: "paddingBlock",
        paddingInline: "paddingInline",
        paddingInlineEnd: "paddingInline",
        itemSpacing: "gap",
        layoutMode: { literal: "VERTICAL" },
      },
      slots: {},
      extraStrokeWeights: [],
      parts: {
        // 캡션 프레임은 값을 비운다. itemSpacing 4 는 제품에 없는 gap 이고(정본이 flex 를
        // 버리고 인라인 흐름 + 진짜 공백을 쓴다), 폭·높이는 격자와 줄 수가 정한다.
        // 자손 자체는 선언해야 「계약에 없는 자손」으로 걸리지 않는다.
        Caption: { fields: {} },
        Tile: { fields: { cornerRadius: "tileRadius" } },
        Label: { fields: { fontSize: "labelFontSize", lineHeightPercent: { literal: 150 } } },
        Description: { fields: { fontSize: "labelFontSize", lineHeightPercent: { literal: 150 } } },
      },
    },
    // **기하가 붙었다 — 다만 넷 중 둘만이다.** 실측 probe 가 섰지만 나머지 둘은 잴 대상이 없다.
    //   · 폭·높이(462.7 · 534.7) — 바깥 3열 격자가 정한다. 어떤 폭을 고정해도 거짓이 된다는
    //     variantProperties 주석의 판정이 기하에도 그대로 적용된다.
    //   · Caption 의 itemSpacing 4 — **제품에 그런 gap 이 없다.** 정본이 flex 를 일부러 버리고
    //     인라인 흐름 + 진짜 공백 문자를 쓴다(복사했을 때 라벨과 설명이 붙지 않게). 실측 공백
    //     폭이 4.69px 라 시안 4 와 0.69 차이인데, 그것은 gap 선언이 아니라 Pretendard 20px
    //     공백의 폭이다. gap 으로 적으면 없는 계약을 있는 것처럼 보여 준다.
  },
  {
    id: "faq-row",
    figmaName: "FaqRow",
    figmaAhead:
      "LOUIS recipe 없음 — 제품 FAQ.tsx 가 정본이고 소비처가 두 자리다(랜딩 faq · 가격 pricing-faq).",
    variantProperties: {},
    // **행에 선이 한 줄도 없다.** 제품 행 클래스는 `rounded-12 bg-[var(--panel-strong)]
    // overflow-hidden` 셋뿐이고 질문 버튼은 `[border:0]` 이다 — `border-0`(폭만 0, style 은
    // solid)과 다르다. 경계는 잉크 8% 오버레이 한 겹이 혼자 만든다.
    strokes: {},
    // **헤어라인도 없다.** carousel-arrow · node-chip 은 같은 랜딩 면에 INNER_SHADOW:0:0:0.5 를
    // 두르는데 이 행은 두르지 않는다 — 제품에 box-shadow 선언이 없다. 빈 칸을 비워 두는 것이
    // 아니라 **없다는 사실을 적는 것**이다. 나중에 누가 Figma 에서 헤어라인을 얹으면 게이트가
    // 잡는다. 행 면과 페이지 바닥의 대비가 1.2:1 뿐이라 얹고 싶어지는 자리다(faq-row.md 2번).
    effects: {},
    // `+` 는 아이콘 인스턴스가 아니라 **텍스트 노드**다(되읽기의 Glyph fontSize 20). 그래서
    // INSTANCE_SWAP 슬롯이 없고 iconSlots 도 없다. 열림에서 45° 도는 것도 아이콘 교체가 아니라
    // 같은 글리프의 transform 이다.
    figmaOnlyProperties: {
      Expanded: {
        options: ["false", "true"],
        reason:
          "코드에서 열림은 행의 prop 이 아니라 섹션이 가진 openIndex 하나다 — 한 번에 한 행만 열린다. Figma 에 그 state 가 없어 행의 축으로 둔다. 답변의 유무와 + 글리프의 45° 회전을 함께 바꾸고 면·반경·좌우 여백은 건드리지 않는다. **figma-component-authoring.md §2 개정이 Expanded 를 조건 축 명부에 올렸다** — 글리프가 계속 보이는 채로 도는 것이 시험 1, 여닫이에 걸 전이가 시험 3 에 걸려 BOOLEAN 이 아니다. 값이 false·true 인 것도 그 절이 정한 형태다.",
      },
      Title: {
        type: "TEXT",
        reason:
          "질문 문구. 코드에서는 items[].q 이며 **React key 이기도 하다** — 목록 안에서 유일하지 않으면 펼침 상태가 엉킨다.",
      },
      Description: {
        type: "TEXT",
        reason:
          "답변 문구. 코드에서는 items[].a 이고 문자열 하나다(목록·링크를 담는 구조가 없다). 가시성은 Expanded 축이 이미 소유하므로 §3 의 BOOLEAN 짝을 따로 두지 않는다 — 두면 「닫혔는데 답변 있음」 같은 거짓 조합이 생긴다.",
      },
    },
    // State 축을 일부러 두지 않았다. 제품 행에 hover · active · disabled 선언이 하나도 없고
    // 포커스도 컴포넌트가 그리지 않는다(전역 리셋이 :focus:not(:focus-visible) 만 끄므로
    // 브라우저 기본 링만 남는다). 없는 것을 Figma 에 그리면 없는 계약을 있는 것처럼 보여 준다.
    //
    // **기하가 붙었다.** 실측 probe 가 1440 폭에서 재므로 닫힌 행 66(18 + 30 + 18)이 성립한다 —
    // 그 값이 **1024 이상에서만 참**이라는 사실은 그대로다(질문 타입이 20 → 18 → 16 으로
    // 내려간다). 좁은 화면 프레임은 Figma 에도 없으므로 계약에 넣을 자리가 없다.
    //
    // **행 자신의 높이(66 · 132)와 폭 1400 은 넣지 않는다.** 폭은 페이지 컨테이너가 정하고,
    // 열린 행의 132 는 답변 글자가 몇 줄로 접히느냐에 달려 있어 컴포넌트의 계약이 아니다.
    // 대신 그 66 을 실제로 만드는 질문 버튼을 파트로 잡는다.
    geometry: {
      measuredId: "faq-row",
      fields: {
        cornerRadius: "radius",
        paddingBlock: "paddingBlock",
        paddingBlockEnd: "paddingBlock",
        paddingInline: "paddingInline",
        paddingInlineEnd: "paddingInline",
        // 행은 plain div 라 gap 선언이 없다. Figma auto-layout 의 0 과 같은 뜻이다.
        itemSpacing: { literal: 0 },
        layoutMode: { literal: "VERTICAL" },
      },
      slots: {},
      extraStrokeWeights: [],
      parts: {
        Question: {
          fields: {
            height: "questionHeight",
            paddingBlock: "questionPaddingBlock",
            paddingBlockEnd: "questionPaddingBlock",
            paddingInline: "questionPaddingInline",
            paddingInlineEnd: "questionPaddingInline",
            itemSpacing: "questionGap",
          },
        },
        QuestionText: { fields: { fontSize: "questionFontSize", lineHeightPercent: { literal: 150 } } },
        // `+` 는 아이콘 인스턴스가 아니라 텍스트 노드다(되읽기의 Glyph fontSize 20). 높이 30 은
        // 그 글자의 줄 높이이고, 폭 13 은 글자 폭이라 재지 않는다($whyNotTextWidth).
        Icon: { fields: { height: "iconHeight" } },
        Glyph: { fields: { fontSize: "iconFontSize" } },
      },
    },
  },
  {
    id: "news-card",
    figmaName: "NewsCard",
    figmaAhead:
      "LOUIS recipe 없음 — 제품 NewsCarousel.tsx 안의 NewsCard 가 정본이다. export 되지 않는 파일 내부 함수라 대조할 .d.ts 자체가 없다.",
    variantProperties: {},
    // 카드에 테두리가 없다. 시안도 stroke 를 주지 않고 제품 클래스에도 border 선언이 없다 —
    // 보통 카드의 경계는 면(잉크 8%)이 만들고 피처드는 사진 자신이 만든다. 빈 객체로 적어
    // 두어야 나중에 누가 stroke 를 얹었을 때 「계약에 없는 stroke」로 잡힌다.
    strokes: {},
    // **그림자도 배경 흐림도 없다.** MediaCard 와 갈라지는 지점이다 — 그쪽은 유리 정보 바가
    // backdrop-filter 로 사진을 흐리고, 이쪽은 그라디언트 스크림이 사진을 눌러 글자를 세운다.
    // 스크림은 effect 가 아니라 fill 이라 이 칸에 오지 않는다.
    effects: {},
    figmaOnlyProperties: {
      Featured: {
        options: ["false", "true"],
        reason:
          "코드에서는 item.image 의 유무다. §3 은 있고 없고를 BOOLEAN 으로 두라고 하지만 **BOOLEAN 은 가시성만 바꾼다** — 이 축은 카드를 347×160 에서 698×324 로 키우고(셸프에서 두 열 두 행을 차지하며 그 사이 간격 4 를 자기 몸으로 덮는다) 전경 색 계열을 테마 추종(landing/panel-strong · gray/000 · landing/text-muted)에서 고정 팔레트(media-foreground-dark · palette-gray/500)로 통째로 바꾼다. 제목 줄 수도 2 에서 1 로 갈린다. Button 의 Icon 축이 padding 보정 때문에 불리언이 될 수 없었던 것과 같은 사유다. **figma-component-authoring.md §2 개정이 Featured 를 조건 축 명부에 올렸다** — 프레임 자신의 고정 크기가 다시 쓰이므로 시험 2 에 걸린다.",
      },
      Title: { type: "TEXT", reason: "제목 한 줄. 코드에서는 item.title 이다." },
      Meta: {
        type: "TEXT",
        reason:
          "날짜 표기. 코드에서는 dateLabel prop 이고 값은 i18n 문자열이 아니라 셸프가 소유한 로케일 포맷터가 만든다. 기계용 ISO 값(item.date)은 Figma 에 대응 슬롯이 없다 — dateTime 같은 의미 속성이 없기 때문이며 그 값의 정본은 코드에만 있다.",
      },
    },
    // **기하가 붙었다 — 폭·높이까지 잰다.** 347 · 160 · 698 · 324 는 카드가 아니라 **트랙 격자**가
    // 정하는 값이라(`grid-auto-columns: 347px` · `grid-template-rows: repeat(2,160px)` · gap 4)
    // 카드만 세워서는 낼 수 없다. 탐침이 트랙을 조상으로 세우고 카드를 칸에 앉혀 격자가 직접
    // 계산하게 한다 — 698 = 347×2 + 4, 324 = 160×2 + 4 라는 산술도 우리가 적지 않는다.
    //
    // Body 94 · 64 는 넣지 않는다. 제목이 두 줄이냐 한 줄이냐가 정하는 높이라 컴포넌트가
    // 소유하는 값이 아니다 — 대신 그 두 값을 만드는 itemSpacing 10 과 타이포를 잡는다.
    geometry: {
      measuredId: "news-card",
      fields: {
        width: "width",
        height: "height",
        paddingBlock: "paddingBlock",
        paddingBlockEnd: "paddingBlock",
        paddingInline: "paddingInline",
        paddingInlineEnd: "paddingInline",
        cornerRadius: "radius",
        // 카드에 gap 선언이 없다 — 안쪽 간격은 Body 가 갖는다.
        itemSpacing: { literal: 0 },
        layoutMode: { literal: "VERTICAL" },
      },
      slots: {},
      extraStrokeWeights: [],
      parts: {
        Body: { fields: { itemSpacing: "bodyGap" } },
        Date: { fields: { fontSize: "dateFontSize" } },
        Headline: { fields: { fontSize: "headlineFontSize", lineHeightPercent: { literal: 150 } } },
      },
    },
  },
  {
    id: "gnb-menu-item",
    figmaName: "GnbMenuItem",
    figmaAhead:
      "LOUIS recipe 없음 — 제품 landing/navigation/Gnb.tsx 의 menuLinkClass() 가 정본이다. 제품은 이것을 컴포넌트가 아니라 클래스 조립 함수로 갖고 있고 항목은 네 요소(a · Link · button · span)로 렌더된다 — 대조할 .d.ts 가 없다.",
    variantProperties: {},
    // **이 컴포넌트의 계약은 불투명도다.** 여덟 변형의 기하가 완전히 같아서(28 · 72 · 12 · 999)
    // 기하만 보면 게이트가 아무것도 검증하지 않는다. 값은 제품 `Gnb.tsx` 의
    // `MENU_LINK_OPACITY_ACTIVE`(1.00) · `MENU_LINK_OPACITY_LIGHT`(0.70 → hover 0.90, 어두운 면)
    // · `MENU_LINK_OPACITY_BLACK`(0.65 → hover 0.80, 밝은 면) 과 `MENU_LINK_COMING_SOON`(0.40) 이다.
    //
    // 밝은 면 기본값이 0.65 인 것은 접근성 판정이다 — 0.50 이면 `palette-gray-900` 이 랜딩
    // 바닥과 3.23:1 로 AA(4.5) 미달이고, 누를 수 있는 링크라 비활성 면제 대상이 아니다.
    // **이 계약이 생기기 전에는 Figma 가 0.50 인 채로도 게이트가 초록이었다.**
    opacity: {
      "light/Default": 0.65,
      "light/Hover": 0.8,
      "light/Selected": 1,
      "light/Disabled": 0.4,
      "dark/Default": 0.7,
      "dark/Hover": 0.9,
      "dark/Selected": 1,
      "dark/Disabled": 0.4,
    },
    // **면도 테두리도 그림자도 없다.** 알약이 `bg-transparent` 이고 헤어라인이 없는 것이 이
    // 컴포넌트가 시스템의 다른 알약과 갈리는 지점이다 — 상태를 면이 아니라 **잉크 불투명도**로
    // 만든다. 빈 계약이 그 사실을 고정한다: Figma 에 stroke 나 effect 가 하나라도 생기면
    // 「계약에 없는 것」으로 걸린다. 되읽기의 strokeWeight 가 비어 있는 것이 정상이다.
    strokes: {},
    effects: {},
    figmaOnlyProperties: {
      Label: {
        type: "TEXT",
        reason:
          "메뉴 항목의 글자. 코드에서는 요소의 children 이고 문구는 전부 i18n(messages.nav.*)에서 온다. 폭이 라벨을 따라가므로 로케일이 바뀌면 항목 폭도 메뉴 폭도 달라진다.",
      },
      Surface: {
        options: ["light", "dark"],
        reason:
          "밑에 깔린 면이 밝은가 어두운가. 코드에서는 navBlack boolean 이고 **테마가 아니라 면이 정한다** — 라이트 테마의 랜딩 안에도 어두운 사진 밴드가 있어 거기서 뒤집히고(data-nav-tone=\"dark\"), 랜딩 밖의 밝은 페이지는 테마와 무관하게 고정한다(lightSurface). 그래서 semantic 의 Light/Dark 모드로는 표현할 수 없고, 제품도 시맨틱 gray-* 램프가 아니라 고정 palette-gray-* 를 쓴다. **figma-component-authoring.md §2 개정이 Surface 를 축 표에 열었다** — 판정 규칙은 「제품이 그 자리를 시맨틱 램프로 받으면 모드, 고정 팔레트로 받으면 Surface」이고 이 자리는 후자다. **이름이 교차한다**: Surface=light(밝은 면)는 제품의 MENU_LINK_TONE_BLACK(검은 잉크)에 대응한다. 두 변형이 실제로 그 방향으로 묶여 있는지는 되읽기가 변형별 색 바인딩을 내지 않아 이 게이트로 확인할 수 없다 — 소유자 확인이 남은 결손이다(같은 절의 「이 개정이 남긴 결손」 1번).",
      },
      State: {
        options: ["Default", "Hover", "Selected", "Disabled"],
        reason:
          "Hover 는 코드에서 CSS 상태([&:hover]: 임의 변형이라 @media (hover: hover) 밖이다), Selected 는 menuLinkClass 의 isActive, Disabled 는 MENU_LINK_COMING_SOON 덧붙임이다. Figma 에 CSS 상태가 없어 한 축에 묶는다. **Selected 가 여기 남는 것은 §2 개정의 판정이다** — 접기 시험(활성 링크는 hover 로 아무것도 바뀌지 않고 갈 곳 없는 항목과 활성이 같이 서지 않는다)을 통과하므로 곱할 조합이 없고, 앞선 판의 「Selected 는 BOOLEAN 으로 빼라」쪽이 오류였다. 네 값이 바꾸는 것은 기하가 아니라 잉크 불투명도 하나뿐이고(Selected 1.00 / Hover 0.90·0.80 / Default 0.70·0.65 / Disabled 0.40), **되읽기가 opacity 를 담지 않아 이 게이트는 그 값을 대조하지 못한다** — Figma 가 아직 밝은 면 Default 를 0.50 으로 그리고 있는 어긋남이 여기로 잡히지 않는다(design/components/gnb-menu-item.md Known deviations 1). Focus 가 없는 것은 의도가 아니라 결손이다 — 제품 클래스에 :focus-visible 선언이 없다.",
      },
    },
    // **기하가 붙었다.** 여덟 변형의 기하가 완전히 같아 기록도 여덟 벌이 같은 값이고, 되읽기
    // 키도 여덟이다(`light|dark` × `Default|Hover|Selected|Disabled`) — 「되읽기 키도 base
    // 하나다」라고 적어 두었던 것은 틀렸다.
    //
    // **폭 72 는 넣지 않는다.** 라벨이 정하는 값이고 로케일에 따라 달라진다
    // (components.measured.json 의 `$whyNotTextWidth`). 라벨 폭을 뺀 나머지가 전부 여기 있으므로
    // 폭이 틀리면 이 중 하나가 틀린 것이다.
    geometry: {
      measuredId: "gnb-menu-item",
      fields: {
        height: "height",
        paddingBlock: "paddingBlock",
        paddingBlockEnd: "paddingBlock",
        paddingInline: "paddingInline",
        paddingInlineEnd: "paddingInline",
        // 알약 안에 자식이 하나뿐이라 제품이 gap 을 선언하지 않는다.
        itemSpacing: { literal: 0 },
        cornerRadius: "radius",
        layoutMode: { literal: "HORIZONTAL" },
      },
      slots: {},
      extraStrokeWeights: [],
      parts: {
        // 폭 48 은 로케일이 정하므로 빼고, 타이포와 줄 높이만 잡는다.
        Label: {
          fields: { height: "labelHeight", fontSize: "labelFontSize", lineHeightPercent: { literal: 150 } },
        },
      },
    },
  },
  {
    id: "inline-loading-label",
    figmaName: "InlineLoadingLabel",
    figmaAhead:
      "LOUIS recipe 없음 — 제품 InlineLoadingLabel.tsx 가 정본이고 소비처가 13개 파일 · 20개 호출부다. 링만은 LOUIS 의 .louis-spinner 레시피를 그대로 소비하고, 제품 게이트(check-tailwind-theme.mjs 의 louisPrimitiveContract)가 그 소비를 클래스 문자열로 고정한다.",
    variantProperties: {},
    // 선도 그림자도 없다. 되읽기의 strokeWeight 가 네 변형 모두 비어 있다 — 이 컴포넌트는 면을
    // 그리지 않고 라벨과 슬롯을 배치하기만 한다.
    strokes: {},
    effects: {},
    figmaOnlyProperties: {
      Label: {
        type: "TEXT",
        reason:
          "평소 문구. 코드에서는 idleLabel prop 이고 타입이 ReactNode 라 문자열 슬롯으로 완전히 대응하지 않는다. **다만 20개 호출부는 지금 전부 문자열을 넘긴다** — 카운트다운을 이어 붙인 템플릿 리터럴까지가 전부이고 요소를 넘기는 자리는 하나도 없다. 어긋남은 타입에 있지 화면에 있지 않다.",
      },
      LoadingLabel: {
        type: "TEXT",
        reason:
          "로딩 문구. 코드에서는 loadingLabel prop 이며 string 이다. **제품은 화면에 넣기 직전 꼬리 말줄임표(... 와 …)를 앞뒤 공백까지 떼어내는데 Figma 에는 그 규칙을 표현할 자리가 없다** — 예시 문구를 이미 깎인 형태로 적어 두는 것이 전부다(inline-loading-label.md Known deviations 2).",
      },
      Size: {
        options: ["md", "sm"],
        reason:
          "코드의 size prop 과 같은 축이지만 LOUIS 에 타입 선언이 없어 variantProperties 로 대조할 수 없다. 바꾸는 것은 슬롯 지름(16 · 12)과 열림의 왼쪽 여백(6 · 4)뿐이고 라벨 타이포는 건드리지 않는다 — 네 변형 모두 14 / 150% 다.",
      },
      Loading: {
        options: ["false", "true"],
        reason:
          "코드의 loading prop. BOOLEAN 으로 그릴 수 없어 조건 축이다 — 프레임이 자기 itemSpacing 을 0 ↔ 6·4 로 다시 쓰고(시험 2), 닫힘과 열림 사이에 Smart Animate 를 걸어야 하며(시험 3), 두 조건에서 보이는 텍스트 프로퍼티가 Label ↔ LoadingLabel 로 갈린다(반대 가시성을 Figma 가 표현하지 못한다). **figma-component-authoring.md §2 개정이 Loading 을 조건 축 명부에 올렸다** — 이 컴포넌트의 되읽기(itemSpacing 0 ↔ 6·4)가 그 판정의 근거이고 명부가 여섯에서 일곱이 됐다. 이름이 열린 것은 어휘가 열린 것이지 「Loading 은 늘 축」이라는 뜻이 아니다 — Button 의 Loading 은 아직 네 시험을 받지 않았다(같은 절 「이 개정이 남긴 결손」 3). 또한 Figma 는 닫힌 변형에서 슬롯 레이어를 숨겨 폭 0 을 표현하므로 되읽기의 md/false·sm/false 에 slots 가 비어 있다(제품은 폭 0 + overflow-hidden) — **닫힘 폭 0 은 이 게이트가 대조하지 않는다.**",
      },
    },
    // **기하가 붙었다.** 16 · 12 · 6 · 4 가 이제 브라우저 실측이다.
    //
    // **Figma 의 itemSpacing 이 제품에서는 슬롯의 margin-left 다.** 제품 루트에 gap 선언이 없고
    // 열림 슬롯이 `ml-3`(6) · `ml-2`(4)를 갖는다 — 같은 자리를 두 시스템이 다른 프로퍼티로
    // 표현한 것이라 값으로 맞물린다. 닫힘은 `ml-0` 이라 0 이고, 그 0 도 실측이다.
    //
    // **닫힘 폭 0 과 scale 0.85 는 넣지 않는다.** 되읽기가 닫힘 변형에서 슬롯 레이어를 아예
    // 감춰 파트가 없고(제품은 폭 0 + overflow-hidden), 0.85 는 기하가 아니라 transform 이다.
    // 루트 높이 21 도 넣지 않는다 — 라벨 타이포가 만드는 값이지 이 컴포넌트의 선언이 아니다.
    geometry: {
      measuredId: "inline-loading-label",
      fields: {
        paddingBlock: "paddingBlock",
        paddingBlockEnd: "paddingBlock",
        paddingInline: "paddingInline",
        paddingInlineEnd: "paddingInline",
        cornerRadius: "radius",
        itemSpacing: "gap",
        layoutMode: { literal: "HORIZONTAL" },
      },
      // 닫힘 두 벌에는 `slot` 키가 없어 이 검사가 건너뛴다 — 되읽기에도 슬롯이 없다.
      slots: { Slot: "slot" },
      extraStrokeWeights: [],
      parts: {
        // **라벨 타이포는 이 컴포넌트가 소유하지 않는다.** 정본의 `LABEL` 은 `flex-none min-w-0`
        // 둘뿐이고 14/21 은 호출부가 건다 — 되읽기의 fontSize 14 를 이 계약이 주장하면 없는
        // 소유권을 적는 것이 된다. 자손은 선언하되 값은 비운다.
        Label: { fields: {} },
        Slot: { optional: true, fields: { width: "slot", height: "slot" } },
      },
    },
  },
  {
    id: "segmented-code-input",
    figmaName: "SegmentedCodeInput",
    figmaAhead:
      "LOUIS recipe 없음 — 제품 components/ui/SegmentedCodeInput.tsx 가 정본이고 소비처는 components/scenes/SubscriptionScene.tsx 의 쿠폰 등록 모달 한 자리다. 대조할 .d.ts 가 없다.",
    variantProperties: {},
    // **칸이 아니라 묶음이 컴포넌트다.** 칸은 제품에서 이름 없는 input 이고 export 되지 않는다 —
    // 파일이 내보내는 것은 묶음 하나뿐이다. 설계가 걸린 곳도 묶음이다: 칸이
    // `flex-1 min-w-0 max-w-14` 라 컨테이너에 맞춰 줄고(주석: 12칸을 고정폭으로 두면 360px 모달에서
    // 넘친다), 칸 사이 2 와 네 칸마다 오는 구분자를 칸 하나짜리 컴포넌트는 소유할 수 없다.
    // 그래서 Figma 도 프레임 폭 386 만 고정했다 — 386 은 칸이 상한 28 에 닿는 폭이고
    // 12*28 + 2*12 + 13*2 = 386 으로 떨어진다. **칸이 채움인지 고정인지는 확인되지 않는다** —
    // 되읽기가 sizing mode 를 담지 않는다.
    //
    // **칸 수 12 와 묶음 4 는 이 컴포넌트의 값이 아니다.** length / groupSize prop 으로 들어오고
    // 정본은 app/lib/payments/coupon-code.ts 의 COUPON_CODE_LENGTH ·
    // COUPON_CODE_GROUP_SIZE 다. Figma 의 12칸 · 구분자 2 는 그 한 소비처의 표본이다.
    //
    // **경계가 헤어라인이 아니라 진짜 1px 테두리다.** DS-D-0023 이후 이 저장소의 기본은
    // inset 0 0 0 0.5px 그림자이고 LOUIS TextField 도 그 방식인데, 이 컴포넌트만 border 1 을 쓴다.
    // **왜 그런지는 코드 주석에도 제품 커밋에도 결정 기록에도 없다 — 소유자 확인이 필요하다.**
    // 되읽기에 strokeWeight 1 과 Cell 1: 1|INSIDE 가 있는 것이 정상이고, effects 가 비어 있는
    // 것도 정상이다.
    strokes: { "Cell 1": { weight: 1, align: "INSIDE" } },
    effects: {},
    figmaOnlyProperties: {
      State: {
        options: ["Default", "Focus", "Disabled"],
        reason:
          "Focus 는 코드에서 CSS 상태([&:focus]) 이고 Disabled 는 disabled prop 이 만드는 네이티브 disabled 다. Figma 에 CSS 상태가 없어 한 축에 묶는다. **Hover 가 없는 것은 결손이 아니라 사실이다** — 정본 칸 클래스에 :hover 선언이 하나도 없다(CarouselArrow · GnbMenuItem 과 정반대다: 그쪽은 Hover 가 있고 Focus 가 없다). **입력됨/빈칸과 오류도 축이 아니다** — 채워짐을 가르는 규칙이 CSS 에 없고(상태 선택자가 :focus 와 :disabled 둘뿐이다), 오류는 칸이 아니라 형제 p role=alert 가 지는데, 제품에 FormMessage 컴포넌트는 없고 그 p 는 인라인 마크업이라 form-message.md 가 정본으로 지목하는 로그인 화면과 색 단계·여백·role 이 다르다(같은 문서 Known deviations 11). **Focus 는 칸 하나의 상태인데 축이 묶음에 있다** — 제품에서 :focus 는 열두 칸 중 하나에만 서는데, 되읽기가 파트별 fill 분해를 주지 않아(세 변형의 boundFills 가 26 으로 같다) Figma 가 몇 칸을 포커스로 그렸는지 이 게이트로는 확인할 수 없다(design/components/segmented-code-input.md Known deviations 4). **포커스 색이 셋 다 다르다** — 제품은 primary-400(#38a4ff) 72% 를 두 테마 모두 쓰고, color/stroke-focus 는 모드마다 갈리며(#0088ff / #38a4ff), 그래서 모드 불변인 color/accent-primary @72% 에 묶었는데 그 값은 #0088ff 다. 바인딩 검사는 「묶였는가」만 보므로 이 어긋남을 잡지 못한다(같은 문서 Known deviations 1).",
      },
    },
    // **기하가 붙었다 — 다섯 중 셋만이다.** 28 · 36 · 8 은 정본 칸 클래스(`BOX`)에서 실측했고,
    // 나머지 둘은 잴 대상이 없다.
    //   · 묶음 폭 386 — 칸이 상한 28 에 닿는 폭에서 나온 산술이다(12×28 + 2×12 + 13×2). Figma
    //     프레임 하나의 값이고 제품에는 그 폭을 정하는 선언이 없다 — 칸이 `flex-1` 로 컨테이너에
    //     맞춰 줄어든다.
    //   · 칸 사이 2 — 소비처 래퍼의 **인라인 className**(`gap-1`)이다. 이 하네스는 제품 소스의
    //     상수를 커밋에서 꺼내 재는데, 상수로 존재하지 않으므로 꺼낼 자리가 없다. 클래스를 손으로
    //     옮겨 적으면 그 순간 제품과 갈라져도 초록으로 남는다.
    //
    // **프레임 높이 36 은 칸 높이가 정한다.** 칸이 가장 큰 자식이고 행이 `items-center` 라 묶음의
    // 높이가 곧 칸의 높이다. 그래서 root `height` 를 `cellHeight` 로 받는다.
    geometry: {
      measuredId: "segmented-code-input",
      fields: {
        height: "cellHeight",
        paddingBlock: { literal: 0 },
        paddingBlockEnd: { literal: 0 },
        paddingInline: { literal: 0 },
        paddingInlineEnd: { literal: 0 },
        cornerRadius: { literal: 0 },
        layoutMode: { literal: "HORIZONTAL" },
      },
      slots: {},
      // 되읽기의 strokeWeight 1 은 칸의 진짜 1px 테두리다 — 이 시스템에서 헤어라인 대신 border
      // 를 쓰는 유일한 자리이고, 왜 그런지는 위 주석이 소유자 확인 대상으로 남겨 두었다.
      extraStrokeWeights: [],
      parts: {
        "Cell 1": {
          fields: { width: "cellWidth", height: "cellHeight", cornerRadius: "cellRadius" },
        },
        // 글자와 구분자는 같은 전역 클래스(`type-body-16-medium`)를 받는다 — 16/24 가 그 값이다.
        // 구분자 폭 12 는 `-` 글자 폭 + 좌우 2 라 글자에 달려 있어 재지 않는다.
        Char: { fields: { height: "charHeight", fontSize: "charFontSize" } },
        Separator: { fields: { height: "charHeight" } },
        Dash: { fields: { fontSize: "charFontSize" } },
      },
    },
  },
  {
    id: "menu-popover",
    figmaName: "MenuSeparator",
    figmaAhead: "menu-popover.css:239-251 이 정본이다. 1px 선 하나라 코드 선언이 없다.",
    variantProperties: {},
    figmaOnlyProperties: {},
  },
  {
    id: "form-message",
    figmaName: "FormMessage",
    figmaAhead: "LOUIS recipe 없음 — app/login/page.tsx:199,537 이 정본이다.",
    variantProperties: {},
    figmaOnlyProperties: {
      Message: { type: "TEXT", reason: "메시지 문구. 코드에서는 children 이다." },
      Tone: { options: ["error", "neutral"], reason: "제품은 error 만 쓰지만 neutral 도인 자리가 있다(도움말)." },
    },
  },
  {
    id: "breadcrumb",
    figmaName: "Breadcrumb",
    figmaAhead: "LOUIS recipe 없음 — Gnb.tsx:5335-5352 이 정본이다.",
    variantProperties: {},
    figmaOnlyProperties: {
      Current: { type: "TEXT", reason: "현재 페이지 이름." },
      Parent: { type: "TEXT", reason: "부모 이름. nested 에서만 보인다." },
      Kind: { options: ["single", "nested"], reason: "코드의 mainChromePageNav.kind 와 같은 축이다." },
    },
  },
  {
    id: "segmented-control-item",
    figmaName: "SegmentedControlItem",
    // 포커스 링은 CSS 에서 outline 이고 Figma 에 outline 이 없어 **바깥으로 나가는 stroke** 로
    // 그린다. 그래서 링이 세그먼트 바깥으로 넘치는 것이 정상이다.
    strokes: { FocusRing: { weight: 2, align: "OUTSIDE" } },
    effects: {},
    figmaAhead: "세그먼트 하나를 Figma 에서 별도 set 으로 뽑았다 — 상호작용과 프로토타입을 받는 단위다. 코드에서는 SegmentedControl 안의 label 이라 독립 선언이 없다.",
    variantProperties: {},
    figmaOnlyProperties: {
      Label: { type: "TEXT", reason: "세그먼트 라벨." },
      Size: { options: ["lg", "md", "xs"], reason: "컨트롤의 size 를 세그먼트가 물려받는다." },
      State: {
        options: ["Default", "Hover", "Selected", "Focus", "Disabled", "SelectedDisabled"],
        reason: "segmented-control.css:124·130·136·158·163. hover 는 글자색만, selected 는 면+글자, focus 는 outline, disabled 는 글자만 흐리게.",
      },
    },
  },
  {
    id: "menu-popover",
    figmaName: "MenuPanel",
    declaration: "packages/react/dist/menu/action-menu.d.ts",
    // 패널은 variant 축이 없다. 항목을 붙이고 빼서 조립하며 auto-layout이 크기를 정한다.
    variantProperties: {},
    strokes: {},
    // 헤어라인이 바깥 프레임(DROP_SHADOW)에서 inset(INNER_SHADOW)으로 옮겨졌다 (DS-D-0023).
    // elevation-menu 토큰은 이제 ambient drop shadow만 소유하고, 헤어라인은 패널이 조합하는
    // inset이다 — ambient와 프레임 책임이 분리돼 두 겹 frame이 없다.
    effects: { self: "DROP_SHADOW:8:15:0 + INNER_SHADOW:0:0:0.5" },
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
    id: "menu-popover",
    figmaName: "CompositePopover",
    declaration: "packages/react/dist/popover/composite-popover.d.ts",
    // MenuPanel과 같은 표면이고 variant 축도 없다. 갈리는 것은 두 값뿐이다 — inset 8(MenuPanel 6)
    // 과 행 간격 8(MenuPanel 2). 이유는 hit-target이며 menu-popover.css의 해당 블록 주석과 Figma
    // 컴포넌트 설명에 근거가 적혀 있다.
    variantProperties: {},
    strokes: {},
    // 표면 effect는 MenuPanel과 **같다** — 두 kind는 같은 `.louis-popover`를 쓰고, ambient
    // drop shadow 뒤에 generic inset 헤어라인을 조합한다 (DS-D-0023).
    effects: { self: "DROP_SHADOW:8:15:0 + INNER_SHADOW:0:0:0.5" },
    geometry: {
      measuredId: "menu-popover",
      sizeKey: "composite-popover",
      fields: {
        paddingBlock: "paddingBlock",
        paddingBlockEnd: "paddingBlock",
        paddingInline: "paddingInline",
        paddingInlineEnd: "paddingInline",
        itemSpacing: "gap",
        cornerRadius: "radius",
        // **MenuPanel과 달리 minWidth가 아니라 width를 본다.** Figma의 CompositePopover는
        // minWidth가 `null`이고 240을 고정폭 프레임으로 그렸다(2026-08-30 되읽기). CSS의 240은
        // min-inline-size의 하한이라 내용이 그보다 좁으면 렌더 폭이 정확히 그 하한이고, 그것이
        // Figma가 그린 폭이다. 채취 명세가 minWidth를 담지 않는 이유는 같은 사실이다 —
        // 빈 배열을 담으면 여기서 「값이 없습니다」가 된다(figma-readback-emit.mjs의 CAPTURE 주석).
        width: "minWidth",
        layoutMode: { literal: "VERTICAL" },
      },
      slots: {},
      extraStrokeWeights: [],
    },
  },
  {
    id: "input",
    figmaName: "TextField",
    propProperties: {
      // 코드에 prefix·suffix prop이 있는데 Figma에 자리가 없어 검색 필드와 지우기 버튼을 그릴 수
      // 없었다(2026-08-18 실무 감사). Boolean으로 켜고 INSTANCE_SWAP으로 글리프를 고른다.
      Prefix: "prefix", Suffix: "suffix", PrefixGlyph: "prefix", SuffixGlyph: "suffix", Label: "label", Message: "description" },
    declaration: "packages/react/dist/text-field/text-field.d.ts",
    variantProperties: { Size: "TextFieldSize" },
    figmaOnlyProperties: {
      HasLabel: { type: "BOOLEAN", reason: "라벨 없는 필드가 실재한다 — 검색창이 그것이다." },
      HasMessage: { type: "BOOLEAN", reason: "도움말·오류 문구의 유무. 있고 없고에 따라 아래 여백이 달라진다." },
      Value: { type: "TEXT", reason: "코드에서 children이라 타입 선언에 항목으로 나타나지 않는다(React가 준다)." },
      State: {
        options: ["Default", "Focus", "Invalid", "Disabled", "Placeholder"],
        reason:
          "Focus는 코드에서 CSS 상태(:focus-within)이고 Invalid/Disabled는 boolean prop이다. Figma에는 CSS 상태가 없어 variant로 둔다. Hover 축은 없다 — 필드는 hover에서 아무것도 바꾸지 않는다. Placeholder는 값이 비어 있는 쉼 상태다 — 코드에서는 :placeholder-shown 이라 prop이 아니고, 디자이너가 「빈 필드」를 그리려면 Figma에 자리가 있어야 한다.",
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
        // 프레임이 박스보다 좌우 4씩 넓다 — focus 링이 잘리지 않게.
        Box: { fields: { width: "boxWidth" } },
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
    iconSlots: ["Glyph"],
    // 아이콘은 코드에서 `icon` prop이다. 슬롯 없이 박혀 있으면 사이드바 네 행이 전부 같은
    // 글리프가 된다 — 실제로 그렇게 만든 홈 템플릿을 내렸다(2026-08-18).
    propProperties: { Glyph: "icon", },
    declaration: "packages/react/dist/app-shell/app-shell-parts.d.ts",
    // State는 CSS 상태(hover)와 prop(current)이 섞여 있고 Collapsed는 boolean prop이다.
    // 코드 타입 alias와 1:1로 대응하지 않으므로 Figma 전용 축으로 선언한다.
    variantProperties: {},
    figmaOnlyProperties: {
      HasTrailing: { type: "BOOLEAN", reason: "후행 배지·개수의 유무. 항목마다 갈리므로 슬롯이다." },
      Label: { type: "TEXT", reason: "코드에서 children이라 타입 선언에 항목으로 나타나지 않는다(React가 준다)." },
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
        paddingInline: "paddingInline",
        paddingInlineEnd: "paddingInline",
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
    figmaOnlyProperties: {
      Leading: { type: "BOOLEAN", reason: "선행 슬롯을 켜고 끈다. LeadingSlot(무엇을)과 짝이다 — 코드에서는 leading prop이 undefined인 것과 같다." },
      Trailing: { type: "BOOLEAN", reason: "후행 슬롯을 켜고 끈다. TrailingSlot과 짝이다. 코드 API에는 처음부터 있었는데 Figma에 자리가 없어 조립하면 상단바가 제목만 남았다." },
    },
    id: "app-shell-parts",
    figmaName: "AppTopBar",
    // 슬롯이 없으면 조립할 때 화면이 비어 보인다. 코드 API에는 처음부터 있었다.
    iconSlots: [],
    propProperties: { Title: "title", LeadingSlot: "leading", TrailingSlot: "trailing" },
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
      slots: { LeadingSlot: true, TrailingSlot: true },
      extraStrokeWeights: [],
      parts: {
        Leading: { fields: { height: "leadingSlotHeight" } },
        Trailing: { fields: { height: "trailingSlotHeight" } },
      },
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
    figmaOnlyProperties: {
      Segment3: { type: "BOOLEAN", reason: "세그먼트가 둘인 컨트롤과 셋인 컨트롤이 둘 다 실재한다. 셋째만 켜고 끈다 — 넷 이상은 제품에 없다." },
      State: {
        options: ["Hover", "Focus", "Disabled", "Default"],
        reason:
          "트랙 수준의 상태다. **어느 세그먼트가 그 상태인지는 SegmentedControlItem이 소유한다** — 여기 있는 것은 컨트롤 전체가 받는 focus 링과 disabled 뿐이다.",
      },
    },
    id: "segmented-control",
    figmaName: "SegmentedControl",
    declaration: "packages/react/dist/segmented-control/segmented-control.d.ts",
    variantProperties: { Size: "SegmentedControlSize" },
    // **트랙은 세그먼트를 조립한다.** 예전에는 트랙 하나에 라벨 셋과 상태 축을 직접 달았는데,
    // 그러면 「어느 세그먼트가 hover 인가」를 고를 수 없어 뜻 없는 변형이 생겼다(2026-08-26).
    // 상호작용은 SegmentedControlItem 이 소유하고 트랙은 그 인스턴스를 담기만 한다.
    figmaOnlyProperties: {
      Segment3: {
        type: "BOOLEAN",
        reason: "세그먼트가 둘인 컨트롤과 셋인 컨트롤이 둘 다 실재한다. 셋째만 켜고 끈다 — 넷 이상은 제품에 없다.",
      },
      Disabled: {
        options: ["false", "true"],
        reason: "컨트롤 전체가 받는 비활성이다. CSS 에서 `:has(input:disabled)` 라 세그먼트가 아니라 트랙의 상태다.",
      },
    },
    // **헤어라인은 INNER_SHADOW effect다 (DS-D-0023).** CSS가 inset box-shadow로 그리므로 Figma
    // 등가물은 inner shadow다. stroke로 두지 않는 이유는 둘이다 — inset은 개념상 inner shadow이고,
    // INSIDE stroke는 안쪽 콘텐츠 박스를 줄여 세그먼트 높이가 32에서 31이 되어 parts가 실패한다.
    strokes: {},
    effects: { self: "INNER_SHADOW:0:0:0.5" },
    // 기하 대조는 **세그먼트 쪽(SegmentedControlItem)** 이 갖는다. 트랙은 인스턴스를 담기만 하고
    // measured 에 xs 단이 없어(제품 인스펙터 전용) 여기서 대조하면 그 단이 통째로 빠진다.
  },
  {
    id: "selectable-list-row",
    figmaName: "SelectableListRow",
    propProperties: { Title: "title", Meta: "meta", Trailing: "trailing" },
    declaration: "packages/react/dist/selectable-list-row/selectable-list-row.d.ts",
    // 코드에 union 축이 없다. 선택은 boolean prop이고 Figma에는 그 표현이 없어 variant로 둔다.
    variantProperties: {},
    figmaOnlyProperties: {
      Media: { type: "BOOLEAN", reason: "왼쪽 섬네일의 유무. 미디어 없는 목록 행이 실재한다." },
      State: {
        options: ["Default", "Selected", "Disabled"],
        reason:
          "코드에서 selected는 boolean prop이고 disabled는 <button>의 네이티브 속성이다. Figma에는 boolean 상태의 시각 표현이 없어 variant로 둔다. Default와 Selected를 가르는 것은 면과 선행 표식이며 그 계약은 아래 parts의 Marker가 갖는다.",
      },
    },
    strokes: {},
    effects: {},
    geometry: {
      measuredId: "selectable-list-row",
      sizeKey: "base",
      fields: {
        paddingBlock: "padding",
        paddingBlockEnd: "padding",
        paddingInline: "padding",
        paddingInlineEnd: "padding",
        itemSpacing: "gap",
        cornerRadius: "radius",
        layoutMode: { literal: "HORIZONTAL" },
      },
      slots: {},
      extraStrokeWeights: [],
      parts: {
        // **선택 표식이 계약이다.** 다크에서 background-inset이 surface와 같은 색이라 면 하나에
        // 기대면 표면 위 목록에서 선택이 사라진다. 폭이 0이 되거나 사라지면 여기서 걸린다.
        Marker: { fields: { width: "markerInline" } },
        Text: { fields: { itemSpacing: "textGap" } },
        Title: { fields: { fontSize: "titleFontSize" } },
        Meta: { fields: { fontSize: "metaFontSize" } },
        // 선행 슬롯과 후행 슬롯의 크기는 호출부가 정한다. 존재만 계약이다.
        Media: { fields: {} },
        Trailing: { fields: {} },
      },
    },
  },
  {
    id: "checkbox",
    figmaName: "Checkbox",
    propProperties: { Label: "label" },
    declaration: "packages/react/dist/checkbox/checkbox.d.ts",
    // 코드에 union 축이 없다. checked·indeterminate·disabled가 전부 boolean이다.
    variantProperties: {},
    figmaOnlyProperties: {
      HasLabel: { type: "BOOLEAN", reason: "라벨 없는 체크박스가 실재한다 — 표 머리의 전체 선택이 그것이다. 코드에서는 children의 유무다." },
      State: {
        options: ["Default", "Checked", "Indeterminate", "Disabled"],
        reason:
          "코드에서 셋 다 boolean prop이고 Figma에는 boolean 상태의 시각 표현이 없어 variant로 둔다. Indeterminate가 Checked와 동시에 참일 수 있다는 사실은 variant로 표현하지 않는다 — 그때 화면이 무엇을 보여야 하는지는 규범과 브라우저 테스트가 소유한다.",
      },
    },
    // 상자 테두리는 CSS border이고, 체크 표시의 2px은 border가 아니라 획이다.
    strokes: { Box: { weight: "borderWidth", align: "INSIDE" }, Check: { weight: "checkStroke", align: "INSIDE" } },
    effects: {},
    geometry: {
      measuredId: "checkbox",
      sizeKey: "base",
      fields: {
        itemSpacing: "gap",
        layoutMode: { literal: "HORIZONTAL" },
      },
      slots: {},
      // 체크 표시의 획. 상자 테두리(0.5)와 같은 집합에 들어가야 통과한다.
      extraStrokeWeights: [2],
      parts: {
        Box: { fields: { width: "boxSize", height: "boxSize", cornerRadius: "radius" } },
        // **표시를 이름으로 나눈다.** 하나로 두면 5×9와 10×2가 한 배열에 섞여
        // "variant마다 다릅니다"로 걸린다. 둘은 서로 다른 부품이며 각각 한 variant에만 있다.
        Check: { fields: { width: "checkInline", height: "checkBlock" } },
        Dash: { fields: { width: "indeterminateInline", height: "indeterminateBlock" } },
        Label: { fields: { fontSize: "fontSize" } },
      },
    },
  },
  {
    figmaOnlyProperties: {
      HasLabel: { type: "BOOLEAN", reason: "라벨 없는 슬라이더가 실재한다 — 인스펙터의 조밀한 속성 행이 그것이다." },
      State: {
        options: ["Focus", "Disabled", "Default"],
        reason:
          "Focus는 CSS 상태(:focus-visible)이고 Disabled는 prop이다. Hover 축은 없다 — 트랙은 hover에서 바뀌지 않는다.",
      },
    },
    id: "slider",
    figmaName: "Slider",
    propProperties: { Label: "label" },
    declaration: "packages/react/dist/slider/slider.d.ts",
    variantProperties: { Size: "SliderSize", Variant: "SliderVariant" },
    // 썸의 링은 CSS border다. track 변형의 표식에는 테두리가 없어 이 역할이 thumb 변형에만 있다.
    strokes: { Thumb: { weight: 2, align: "INSIDE" } },
    effects: {},
    geometry: {
      // **복합 키를 쓰는 유일한 컴포넌트다.** Variant 축이 레일 두께 4↔28과 썸 16↔2×14를
      // 바꾸므로 size 하나로 묶으면 두 값이 한 배열에 섞여 어느 쪽이 어느 변형의 것인지
      // 사라진다. 키는 아무도 해석하지 않는다 — 되읽기와 measured가 같은 이름을 쓰면 된다.
      measuredId: "slider",
      fields: {
        itemSpacing: "stackGap",
        layoutMode: { literal: "VERTICAL" },
      },
      slots: {},
      // 썸의 링(border-width-ring 2). 레일에는 테두리가 없다.
      extraStrokeWeights: [2],
      parts: {
        Label: { fields: { fontSize: "labelFontSize" } },
        Control: { fields: { height: "height" } },
        // 굵은 막대는 레일이고 얇은 표식은 썸이다 — 두 변형이 **같은 부품의 다른 값**을 갖는다.
        Rail: { fields: { height: "railHeight" } },
        Fill: { fields: { height: "railHeight" } },
        Thumb: { fields: { width: "thumbInline", height: "thumbBlock" } },
      },
    },
  },
  {
    figmaOnlyProperties: {
      HasImage: { type: "BOOLEAN", reason: "이미지가 없으면 이니셜 폴백이 뜬다. 코드에서는 src의 유무이므로 축이 아니라 슬롯이다." },
    },
    id: "avatar",
    figmaName: "Avatar",
    declaration: "packages/react/dist/avatar/avatar.d.ts",
    variantProperties: { Size: "AvatarSize" },
    // **테두리도 그림자도 없는 것이 계약이다.** 제품은 프로필 트리거에 진행률 링을 겹치는데,
    // 그것이 이 컴포넌트로 새어 들어오면 여기서 걸린다. 코드 쪽은 브라우저 테스트가 같은 것을
    // 확인한다(테두리·그림자·::after 층 0).
    strokes: {},
    effects: {},
    geometry: {
      measuredId: "avatar",
      fields: {
        width: "size",
        height: "size",
        cornerRadius: "radius",
        // 자식이 하나뿐이고 절대 위치다. auto-layout을 쓰면 폴백이 원을 못 채운다.
        layoutMode: { literal: "NONE" },
      },
      slots: {},
      extraStrokeWeights: [],
      parts: {
        // 폴백은 원을 가득 채운다. 자기 크기를 가지면 24px 아바타 안에서 28px 글리프가 넘친다 —
        // 제품의 UserCircleDefaultAvatar가 정확히 그 구조라 크기가 한 값에 묶여 있었다.
        Fallback: { fields: { width: "size", height: "size" } },
      },
    },
  },
  {
    figmaOnlyProperties: {
      HasWordmark: { type: "BOOLEAN", reason: "브랜드 워드마크를 얹는 배너와 그렇지 않은 배너가 둘 다 실재한다. 코드에서는 자식 유무다." },
      HasCta: { type: "BOOLEAN", reason: "행동 유도 버튼 없이 알림만 나르는 배너가 있다. 코드에서는 cta prop의 유무다." },
    },
    id: "banner-carousel",
    figmaName: "BannerCarousel",
    propProperties: { Title: "slides", Description: "slides" },
    declaration: "packages/react/dist/banner-carousel/banner-carousel.d.ts",
    // Tone은 사진의 밝기이지 테마가 아니다. 두 축 모두 코드의 타입 선언과 대조된다.
    variantProperties: { Tone: "BannerTone", Bleed: "BannerCarouselBleed" },
    // **테두리도 그림자도 없는 것이 계약이다.** 배너의 경계는 사진 자체이고, 컨트롤은 면과
    // 흐림으로만 떠 있다. 여기에 테두리가 생기면 사진 위에 선이 그어진다.
    strokes: {},
    effects: {},
    geometry: {
      measuredId: "banner-carousel",
      fields: {
        width: "width",
        height: "height",
        cornerRadius: "radius",
        // 슬라이드가 겹쳐 쌓이므로 흐름 배치가 성립하지 않는다.
        layoutMode: { literal: "NONE" },
      },
      slots: {},
      extraStrokeWeights: [],
      parts: {
        Content: {
          fields: {
            width: "contentInline",
            height: "height",
            paddingLeft: "contentInlinePadding",
            paddingTop: "contentBlockPadding",
          },
        },
        // 알약이 `controls="pill"` 변형으로 내려가면서 **반경과 패딩 축이 사라졌다** — 기본 배치의
        // 컨트롤은 면도 반경도 패딩도 없다. 남는 것은 묶음의 크기와 간격뿐이다. Figma 는 기본
        // 배치만 모델링한다(변형 축을 열면 variant 가 4에서 8로 늘어난다 — 아직 열지 않았다).
        Controls: {
          fields: {
            width: "controlsWidth",
            height: "controlsHeight",
            itemSpacing: "controlsGap",
          },
        },
        // 제품에 없는 부품이다. 자동으로 움직이는 것은 멈출 수 있어야 한다(WCAG 2.2.2).
        // 화살표 둘은 `pill` 변형에만 남아 기본 배치의 계약에서 빠졌다.
        PlaybackToggle: { fields: { width: "arrowSize", height: "arrowSize", cornerRadius: "arrowRadius", children: "controlGlyphCount" } },
        // **밝기가 상태다**(DS-D-0033). 폭이 상태이던 시절에는 활성과 비활성의 폭이 달라 이름을
        // 갈라 두 값을 대조했다. 지금은 폭이 같으므로 같은 키를 본다 — 두 부품이 서로 다른 자리에
        // 동시에 존재한다는 사실은 그대로라 이름은 갈라 둔다.
        DotActive: { fields: { width: "dotWidth", height: "dotHeight", cornerRadius: "dotRadius" } },
        DotRest1: { fields: { width: "dotWidth", height: "dotHeight", cornerRadius: "dotRadius" } },
      },
    },
  },
  {
    id: "progress",
    figmaName: "ProgressBar",
    declaration: "packages/react/dist/progress/progress.d.ts",
    variantProperties: {},
    // 코드에서는 `indeterminate` boolean prop이다. Figma에 boolean 상태를 그릴 방법이 variant뿐이다.
    figmaOnlyProperties: {
      State: {
        options: ["determinate", "indeterminate"],
        reason:
          "코드에서는 `indeterminate` boolean prop이다. 두 상태의 채움이 다르게 그려지므로 Figma에서는 축이 된다.",
      },
    },
    strokes: {},
    effects: {},
    geometry: {
      measuredId: "progress-bar",
      fields: {
        width: "width",
        height: "height",
        cornerRadius: "radius",
        layoutMode: { literal: "HORIZONTAL" },
      },
      slots: {},
      extraStrokeWeights: [],
      // 채움의 폭은 값이므로 계약이 아니다. 높이만 트랙과 같아야 한다.
      parts: { Fill: { fields: { height: "fillHeight" } } },
    },
  },
  {
    figmaOnlyProperties: {
      Content: { type: "INSTANCE_SWAP", reason: "링 가운데에 들어가는 것. 퍼센트 글자일 수도 글리프일 수도 있어 코드에서는 children이다." },
    },
    id: "progress",
    figmaName: "ProgressRing",
    declaration: "packages/react/dist/progress/progress.d.ts",
    variantProperties: {},
    strokes: {},
    effects: {},
    geometry: {
      measuredId: "progress-ring",
      fields: {
        width: "size",
        height: "size",
        cornerRadius: "radius",
        paddingInline: "gap-plus-width",
        paddingInlineEnd: "gap-plus-width",
        paddingBlock: "gap-plus-width",
        paddingBlockEnd: "gap-plus-width",
        layoutMode: { literal: "HORIZONTAL" },
      },
      slots: {},
      extraStrokeWeights: [],
      parts: {
        // 트랙은 링 전체를 덮고 내용은 그 안에 놓인다. 지름이 내용에서 나온다는 것이 이 둘의 관계다.
        Track: { fields: { width: "size", height: "size" } },
        Content: { fields: { width: "contentSize", height: "contentSize" } },
      },
    },
  },
  {
    figmaOnlyProperties: {
      Action: { type: "BOOLEAN", reason: "행 끝의 액션 버튼 유무. 호버해야 나타나는 자리라 없는 상태가 기본이다." },
    },
    id: "app-shell-parts",
    figmaName: "SidebarNavRow",
    declaration: "packages/react/dist/app-shell/app-shell-parts.d.ts",
    variantProperties: {},
    strokes: {},
    effects: {},
    geometry: {
      measuredId: "app-shell-parts",
      sizeKeys: ["navRow"],
      fields: {
        width: "width",
        height: "height",
        cornerRadius: "radius",
        itemSpacing: "gap",
        layoutMode: { literal: "HORIZONTAL" },
      },
      slots: {},
      extraStrokeWeights: [],
      parts: {
        // 항목이 남는 자리를 먹으므로 폭은 계약이 아니다. 높이만 항목과 같아야 한다.
        Item: { fields: { height: "height" } },
        Action: { fields: { width: "actionSize", height: "actionSize" } },
      },
    },
  },
  {
    id: "app-shell-parts",
    figmaName: "SidebarBrand",
    declaration: "packages/react/dist/app-shell/app-shell-parts.d.ts",
    variantProperties: {},
    // 접힘은 코드에서 boolean prop이라 타입 alias가 없다. Figma에서만 축이 된다.
    figmaOnlyProperties: {
      Collapsed: {
        options: ["false", "true"],
        reason:
          "코드에서는 `collapsed` boolean prop이다. Figma에 boolean 상태를 그릴 방법이 variant뿐이라 축으로 둔다.",
      },
    },
    // 브랜드 행은 면도 테두리도 없다. 사이드바 자신의 면 위에 놓인다.
    strokes: {},
    effects: {},
    geometry: {
      measuredId: "sidebar-brand",
      fields: {
        width: "width", height: "height", cornerRadius: "radius",
        paddingInline: "paddingInlineStart", paddingInlineEnd: { literal: 0 },
        layoutMode: { literal: "HORIZONTAL" },
      },
      slots: {},
      extraStrokeWeights: [],
      // 접히면 워드마크가 사라진다 — variant마다 자손이 다른 것이 계약이다.
      parts: {
        // 마크 레일은 접혀도 남는다 — 접힘 상태에서 화면에 남는 유일한 부품이다.
        Mark: { fields: { width: "markSize", height: "markSize" } },
        Wordmark: { fields: { width: "wordmarkWidth" }, optional: true },
      },
    },
  },
  {
    id: "app-shell-parts",
    figmaName: "SidebarCta",
    declaration: "packages/react/dist/app-shell/app-shell-parts.d.ts",
    variantProperties: {},
    figmaOnlyProperties: {
      State: {
        options: ["Hover", "Focus", "Current", "Default"],
        reason:
          "CSS 상태(hover·focus)와 현재 위치(current)를 한 축에 합쳤다. Figma에는 CSS 상태가 없다.",
      },
      Collapsed: {
        options: ["false", "true"],
        reason: "코드에서는 `collapsed` boolean prop이다.",
      },
    },
    strokes: {},
    // 반전 pill이 사이드바 면에서 떨어져 보이게 하는 안쪽 1px 링과 얕은 드롭이다.
    effects: { self: "INNER_SHADOW:0:0:1 + DROP_SHADOW:1:2:0" },
    geometry: {
      measuredId: "sidebar-cta",
      fields: {
        width: "width", height: "height", cornerRadius: "radius",
        paddingInline: "paddingInline", paddingInlineEnd: "paddingInline",
        paddingBlock: "paddingBlock", paddingBlockEnd: "paddingBlock",
        itemSpacing: "gap",
        layoutMode: { literal: "HORIZONTAL" },
      },
      slots: {},
      extraStrokeWeights: [],
      parts: { Label: { fields: { width: "labelWidth" }, optional: true } },
    },
  },
  {
    id: "skeleton",
    figmaName: "Skeleton",
    declaration: "packages/react/dist/skeleton/skeleton.d.ts",
    variantProperties: { Shape: "SkeletonShape" },
    // **면 색을 고르지 않는 것이 계약이다.** 놓이는 자리의 글자색을 낮은 알파로 문다.
    // 테두리도 그림자도 없다 — 생기면 자리표시자가 아니라 카드로 읽힌다.
    strokes: {},
    effects: {},
    geometry: {
      measuredId: "skeleton",
      // `base`는 색 계약(알파)만 갖고 기하가 없다. Figma의 shape 세 벌만 기하를 대조한다.
      sizeKeys: ["text", "block", "circle"],
      fields: { width: "width", height: "height", cornerRadius: "radius", layoutMode: { literal: "NONE" } },
      slots: {},
      extraStrokeWeights: [],
      parts: {},
    },
  },
  {
    id: "badge",
    figmaName: "Badge",
    // 라벨은 코드에서 children이고 badge.d.ts에 선언 항목으로 나타나지 않는다(React가 준다).
    propProperties: { Icon: "icon", IconGlyph: "icon", Dot: "dot" },
    figmaOnlyProperties: { Label: { type: "TEXT", reason: "코드에서 children. 타입 선언에 항목으로 없다." } },
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
    figmaOnlyProperties: {
      HasGraphic: { type: "BOOLEAN", reason: "그림 없는 빈 상태가 있다 — 좁은 패널 안에서는 글만 남긴다." },
      HasDescription: { type: "BOOLEAN", reason: "제목 한 줄로 끝나는 빈 상태가 있다." },
      HasAction: { type: "BOOLEAN", reason: "할 수 있는 일이 없는 빈 상태(권한 없음)에는 버튼을 두지 않는다." },
    },
    id: "empty-state",
    figmaName: "EmptyState",
    iconSlots: ["Glyph"],
    propProperties: { Glyph: "graphic", Title: "title", Description: "description" },
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
    // 합성 컴포넌트라 텍스트가 루트 prop이 아니라 하위 부품(Eyebrow·Title·Meta)의 children이다.
    // 코드 prop 대조 대상이 아니므로 Figma 전용 슬롯으로 선언한다.
    figmaOnlyProperties: {
      Eyebrow: { type: "TEXT", reason: "ProjectCardEyebrow의 children. 루트 prop이 아니다." },
      Title: { type: "TEXT", reason: "ProjectCardTitle의 children." },
      Meta: { type: "TEXT", reason: "ProjectCardMeta의 children." },
      State: {
        options: ["Default", "Hover"],
        reason:
          "더보기 버튼이 **호버에서만 드러난다** — `.louis-project-card-more`는 `opacity: 0`이고 " +
          "`.louis-project-card:hover`와 `:focus-within`이 1로 올린다(project-card.css:322·331·342). " +
          "Figma에는 CSS 상태가 없으므로 Button의 State와 같은 이유로 variant로 둔다. " +
          "축이 없으면 기본 변형 하나만 남는데, 그러면 **더보기 버튼이 있다는 사실 자체를 볼 수 없다** — " +
          "항상 보이게 그리면 반대로 거짓이 된다. 2026-08-26 소유자 지적으로 추가했다.",
      },
    },
    declaration: "packages/react/dist/project-card/project-card.d.ts",
    // 코드 타입 alias에서 읽는 variant 축은 없다. 카드의 강조는 카드가 아니라 썸네일이 만든다.
    // CSS 상태(호버)는 위 figmaOnlyProperties.State가 담는다.
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
        // 썸네일 위 더보기. 면이 사진이라 media 색을 쓴다.
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
        // **슬롯이 곧 더보기 버튼이다.** Figma 에 레이어는 하나이고, 문서·React API·이 계약이
        // 모두 `Adornment` 라고 부른다. 한동안 Figma 만 `More` 로 어긋나 있었고 되읽기가 그
        // 이름을 담고 있어 계약이 두 이름을 따로 셌다 — 2026-08-30 에 Figma 를 공개 API 이름으로
        // 되돌리고 크기 대조를 이 한 줄로 합쳤다.
        Adornment: { fields: { width: "moreSize", height: "moreSize" } },
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

/**
 * **한 variant의 기하만 어긋났을 때를 잡는다.**
 *
 * Slider는 `{size}/{variant}` 복합 키를 쓰는 유일한 컴포넌트다. Variant 축이 레일 두께 4↔28을
 * 바꾸므로, 키가 size 하나였다면 두 값이 같은 배열에 섞여 **어느 쪽이 어느 변형의 것인지 사라진다.**
 * 이 canary는 `md/track`의 레일 높이를 `md/thumb`의 값으로 바꿔 넣는다 — 복합 키가 없으면
 * 그 변조가 "배열에 4가 하나 더 있다" 정도로 묻히고, 있으면 그 그룹의 기대값과 어긋나 실패한다.
 */
function tamperCompositeKeyGeometry(document) {
  const contract = COMPONENT_CONTRACTS.find(
    (c) => Object.keys(componentsMeasured.components?.[c.geometry?.measuredId]?.sizes ?? {})
      .some((key) => key.includes("/")),
  );
  if (contract === undefined) return null;
  const geometry = document.components?.[contract.figmaName]?.geometry;
  if (geometry === undefined) return null;
  const keys = Object.keys(geometry).filter((k) => k.includes("/"));
  const donor = keys.find((k) => k.endsWith("/thumb"));
  const target = keys.find((k) => k.endsWith("/track"));
  if (donor === undefined || target === undefined) return null;
  const from = geometry[donor]?.parts?.Rail?.height?.[0];
  const to = geometry[target]?.parts?.Rail;
  if (from === undefined || to === undefined || to.height?.[0] === from) return null;
  to.height = [from];
  return `${contract.figmaName} ${target}의 Rail 높이를 ${donor}의 값으로 바꿈`;
}

const TAMPERS = [
  tamperValue,
  tamperAlias,
  tamperCollection,
  tamperModeOrder,
  tamperStyle,
  tamperComponentVariant,
  tamperComponentBinding,
  tamperComponentHeight,
  tamperComponentOpacity,
  tamperComponentPartOpacity,
  tamperComponentPadding,
  tamperComponentSlot,
  tamperComponentGeometryDrift,
  tamperCompositeKeyGeometry,
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
  issues.push(...compareOverflow(document.components));
  issues.push(...compareOpticalCentering(document.components));
  issues.push(...compareIconInstances(document.iconInstances));
  issues.push(...compareFoundations(document.foundations));
  issues.push(...compareTemplates(document.templates ?? {}));
  return issues;
}

/**
 * 정사각 슬롯 안의 표식이 **눈으로** 중앙에 있는지.
 *
 * 레이아웃 상자를 가운데 두어도 도형이 자기 상자 안에서 치우쳐 있으면 쏠려 보인다 — 체크 표식은
 * 회전한 사각형이라 5×9 상자를 가운데 두었을 때 실제로는 **4.9px 왼쪽**에 있었다(2026-08-18).
 * 그래서 상자가 아니라 회전을 반영한 실제 차지 영역으로 잰다.
 */
function compareOpticalCentering(components) {
  const issues = [];
  for (const [figmaName, component] of Object.entries(components ?? {})) {
    for (const [size, geometry] of Object.entries(component.geometry ?? {})) {
      for (const entry of geometry.offCenterMarks ?? []) {
        issues.push(
          `${figmaName} ${size}: ${entry}가 슬롯 중앙에서 벗어나 있습니다. 상자가 아니라 실제 차지 영역으로 맞추세요.`,
        );
      }
    }
  }
  return issues;
}

/**
 * 보이는 자손이 variant 프레임 밖으로 나가는지.
 *
 * 나가면 썸네일과 인스턴스에서 **잘려 보인다.** TextField의 focus 링이 그랬다 — 링이 박스 바깥
 * 4px에 있는데 프레임이 그만큼 넓지 않아 offset이 0으로 보였다(2026-08-18).
 * 화살표처럼 **일부러 밖에 붙는 것**은 measured에 `outsideParts`로 선언한다.
 */
function compareOverflow(components) {
  const issues = [];
  for (const [figmaName, component] of Object.entries(components ?? {})) {
    const outside = new Set(component.outsideParts ?? []);
    for (const [size, geometry] of Object.entries(component.geometry ?? {})) {
      for (const name of geometry.overflowingParts ?? []) {
        if (outside.has(name)) continue;
        issues.push(
          `${figmaName} ${size}: 자손 ${name}이 프레임 밖으로 나갑니다. 인스턴스에서 잘려 보입니다.`,
        );
      }
    }
  }
  return issues;
}

/**
 * 아이콘 인스턴스의 획이 크기를 따라갔는지.
 *
 * 코드는 SVG viewBox라 `1.5 × size / 24`로 줄어든다. Figma는 **어떻게 줄이느냐**에 따라 갈리는데,
 * 일반 크기 조절(`resize`)은 획을 1.5로 남기고 Scale 도구(`rescale`)만 비례시킨다.
 * 파일의 인스턴스 146개가 전부 전자로 놓여 있었다(2026-08-18). DS-D-0021.
 */
function compareIconInstances(actual) {
  if (actual === null || actual === undefined) {
    return ["아이콘 인스턴스 되읽기가 snapshot에 없습니다."];
  }
  const issues = [];
  // fill 글리프(dots-three-vertical · info)는 소비처가 stroke만 override하면 색이 안 바뀐다.
  // 지금은 어긋난 인스턴스가 0이며, 생기면 여기서 잡는다.
  if ((actual.colorMismatched ?? 0) > 0) {
    issues.push(
      `아이콘 인스턴스 ${actual.colorMismatched}개에서 stroke와 fill이 다른 색 변수를 가리킵니다. fill 글리프는 stroke override만으로 색이 바뀌지 않습니다.`,
    );
  }
  const allowed = new Set([16, 20, 24, 64]);
  for (const [size, weights] of Object.entries(actual.strokeBySize ?? {})) {
    const px = Number(size);
    if (!allowed.has(px)) {
      issues.push(`아이콘이 허용되지 않은 크기로 놓여 있습니다: ${px}px (허용 16·20·24·64, icon-size-* 토큰)`);
      continue;
    }
    const expected = Math.round((1.5 * px) / 24 * 1000) / 1000;
    for (const weight of weights) {
      if (weight !== expected) {
        issues.push(
          `${px}px 아이콘의 획이 ${weight}입니다. 코드는 ${expected}입니다 — 크기 조절 핸들이 아니라 Scale 도구(rescale)로 놓으세요.`,
        );
      }
    }
  }
  return issues;
}

/**
 * Foundations 페이지가 캔버스에 적어 둔 토큰 이름이 파일에 실재하는지.
 *
 * 문서는 게이트가 안 보는 자리라 조용히 낡는다 — `color-status-*` 8개와
 * `action-primary-pressed`를 rename한 날, Color 절이 없는 이름 9개를 그대로 적고 있었고
 * 새로 선 media 색 9종은 아예 빠져 있었다(2026-08-18).
 */
function compareFoundations(foundations) {
  if (foundations === undefined) {
    return ["Foundations 되읽기가 snapshot에 없습니다. 페이지를 다시 읽어 readback에 넣으세요."];
  }
  const issues = [];
  const stale = foundations.staleNames ?? [];
  if (stale.length > 0) {
    issues.push(
      `Foundations가 파일에 없는 이름을 적어 두었습니다(${stale.length}개): ${stale.slice(0, 8).join(", ")}`,
    );
  }
  const expected = ["Color", "Typography", "Spacing & Radius", "Elevation"];
  const actual = foundations.sections ?? [];
  for (const name of expected) {
    if (!actual.includes(name)) issues.push(`Foundations에 ${name} 절이 없습니다.`);
  }
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
  // `sizeKeys`는 measured에 기하 없는 키가 섞여 있을 때 쓴다 — Skeleton의 `base`는 색 계약(알파)만
  // 갖고 기하가 없으며, Figma는 흐름을 못 그려 정지 shape 세 벌만 있다.
  const entries = plan.sizeKeys
    ? plan.sizeKeys.map((key) => [key, measured[key]]).filter(([, spec]) => spec !== undefined)
    : plan.sizeKey
      ? [[plan.sizeKey, measured[plan.sizeKey]]].filter(([, spec]) => spec !== undefined)
      : Object.entries(measured);
  if (plan.sizeKeys && entries.length !== plan.sizeKeys.length) {
    issues.push(
      `${COMPONENTS_MEASURED_PATH}에 ${plan.measuredId}의 선언된 size 키가 빠졌습니다: ${plan.sizeKeys.join(", ")}`,
    );
  }
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
      } else if (Array.isArray(rule?.set)) {
        // 한 축이 이 필드를 바꾸는 것이 계약인 경우. 대조는 **집합 상등**이다 — 선언한 값이
        // 전부 나타나야 하고 그 밖의 값은 없어야 한다. **어느 칸이 어느 값을 갖는지는 보지
        // 않는다** — snapshot이 size별로 값을 모아 두기 때문이고, 칸별 대조는 되읽기가 칸을
        // 보존해야 가능하다. 그래서 두 값이 서로 뒤바뀐 칸은 이 게이트가 잡지 못한다.
        const members = rule.set.map((key) => spec[key]);
        expected[field] = members.some(
          (value) => value === undefined || Number.isNaN(value),
        )
          ? undefined
          : { set: members };
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
      if (want !== null && typeof want === "object" && Array.isArray(want.set)) {
        const sort = (list) => [...new Set(list)].sort((a, b) => a - b);
        const got = sort(values);
        const wantSet = sort(want.set);
        if (
          got.length !== wantSet.length ||
          got.some((value, index) => value !== wantSet[index])
        ) {
          issues.push(
            `${contract.figmaName} ${size}: ${field}의 값 집합이 다릅니다 — 코드 실측 {${wantSet.join(", ")}}, Figma {${got.join(", ")}}`,
          );
        }
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
        // variant에 따라 사라지는 자손이 있다 — 사이드바가 접히면 워드마크와 라벨이 없어진다.
        // 그 경우 `optional: true`를 선언하고, **그 크기의 근거 값도 없어야** 통과한다.
        // 선언만 해 두고 값이 남아 있으면 "있어야 하는데 빠진 것"과 구분되지 않는다.
        if (partPlan.optional === true && spec[Object.values(partPlan.fields ?? {})[0]] === undefined) {
          continue;
        }
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
 * variant 별 **불투명도**를 대조한다.
 *
 * 기하가 아니라 불투명도가 계약인 컴포넌트가 있다 — GnbMenuItem 은 여덟 변형의 기하가 완전히
 * 같고(28 · 72 · 12 · 999) 면도 테두리도 없이 **잉크 한 색의 불투명도만** 바뀐다. 그래서
 * 기하만 대조하면 이 컴포넌트에 대해 게이트가 사실상 아무것도 검증하지 않는다.
 *
 * 실제로 그 구멍으로 어긋남이 하나 지나갔다. 제품은 접근성 때문에 밝은 면 기본값을 0.50 →
 * 0.65 로 올렸는데(3.23:1 → 5.11:1), 되읽기에 불투명도 축이 없어 **Figma 가 0.50 인 채로도
 * 게이트가 초록이었다.** 사람이 두 곳을 눈으로 비교해서야 드러났다.
 *
 * 기대값은 `components.measured.json` 이 아니라 **계약에 리터럴로 적는다** — 불투명도는 제품
 * 렌더 실측 대상이 아니라 소스에 적힌 상수이고(`MENU_LINK_OPACITY_*`), 그 상수를 옮겨 적는
 * 것이 이 계약의 일이다.
 */
function compareComponentOpacity(contract, got) {
  const issues = [];
  const plan = contract.opacity;
  if (plan === undefined) return issues;
  const geometry = got.geometry ?? {};

  /* **불투명도가 변형 루트에만 있는 것이 아니다.** GnbMenuItem 은 변형 자체의 불투명도가
   * 계약이라 `fields` 로 뜨지만, PaneDivider 는 **자손 하나**(그립)의 불투명도가 계약이고
   * 채취 명세가 그것을 `parts.Grip.opacity` 로 담는다. 루트만 읽으면 그 계약은 어디서도
   * 대조되지 않는다 — 이 함수가 막으려던 바로 그 상태다.
   * 그래서 계약 값을 숫자 또는 `{ part, value }` 둘 다 받는다. */
  const normalize = (want) =>
    want !== null && typeof want === "object" ? want : { part: null, value: want };
  const readAt = (bag, part) =>
    part === null ? bag.opacity : bag.parts?.[part]?.opacity;

  const claimed = new Set();
  for (const [key, rawWant] of Object.entries(plan)) {
    const { part, value: want } = normalize(rawWant);
    const bag = geometry[key];
    if (bag === undefined) {
      issues.push(`${contract.figmaName}: 불투명도 계약의 키가 snapshot 에 없습니다 — ${key}`);
      continue;
    }
    claimed.add(`${key}\u0000${part ?? ""}`);
    const where = part === null ? key : `${key} · ${part}`;
    const values = readAt(bag, part);
    if (!Array.isArray(values) || values.length === 0) {
      issues.push(`${contract.figmaName} ${where}: 불투명도가 되읽기에 없습니다. 채취 명세에 opacity 를 넣으세요.`);
      continue;
    }
    if (values.length > 1) {
      issues.push(`${contract.figmaName} ${where}: variant 마다 불투명도가 다릅니다 — [${values.join(", ")}]`);
      continue;
    }
    if (Math.abs(values[0] - want) > 1e-4) {
      issues.push(`${contract.figmaName} ${where}: 불투명도가 다릅니다 — 계약 ${want}, Figma ${values[0]}`);
    }
  }

  // 되읽기에 있는데 계약이 안 집은 불투명도는 전부 드러낸다 — 루트든 자손이든.
  for (const [key, bag] of Object.entries(geometry)) {
    const spots = [[null, bag.opacity]];
    for (const [part, fields] of Object.entries(bag.parts ?? {})) spots.push([part, fields.opacity]);
    for (const [part, values] of spots) {
      if (!Array.isArray(values) || values.length === 0) continue;
      if (claimed.has(`${key}\u0000${part ?? ""}`)) continue;
      const where = part === null ? key : `${key} · ${part}`;
      issues.push(`${contract.figmaName}: 되읽기에 불투명도가 있는데 계약에 없습니다 — ${where}`);
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
    // **한 역할이 여러 두께를 갖는 것이 계약인 자리가 있다.** 표의 행 구분선은 칸의 아래 한
    // 변인데 마지막 행만 0 이다(`tbody > tr:last-child > td`). 하나만 적으면 조립본이 영원히
    // 실패하고, 역할을 빼면 「계약에 없는 stroke」로 잡힌다 — 둘 다 사실을 못 적는다.
    // 목록을 허용하되 **왜 여럿인지 사유를 요구한다.** 사유 없이 목록으로 넓히는 길은 없다.
    if (Array.isArray(spec.weight)) {
      if (typeof spec.reason !== "string" || spec.reason.length < 20) {
        issues.push(
          `${contract.figmaName}: stroke 역할 ${role}이 두께를 여럿 선언하려면 20자 이상의 사유가 필요합니다.`,
        );
        continue;
      }
      const allowed = spec.weight.map((w) => `${w}|${spec.align}`);
      const values = actual[role];
      if (!Array.isArray(values) || values.length === 0) {
        issues.push(`${contract.figmaName}: stroke 역할 ${role}이 Figma에 없습니다.`);
        continue;
      }
      const wrong = values.filter((value) => !allowed.includes(value));
      if (wrong.length > 0) {
        issues.push(
          `${contract.figmaName}: ${role}의 stroke가 다릅니다 — 허용 [${allowed.join(", ")}], 실제 [${values.join(", ")}]`,
        );
      }
      continue;
    }
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

    // figmaAhead 계약은 **코드가 아직 없다는 사실 자체가 계약**이다. 대조할 선언이 없으므로
    // 읽지 않는다 — 없는 파일을 읽으려다 실패하는 것과 「아직 안 만들었다」는 다른 상태다.
    let declarationSource = "";
    try {
      if (contract.figmaAhead === undefined) {
        declarationSource = readFileSync(
          resolve(repoRoot, contract.declaration),
          "utf8",
        );
      }
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
      // VARIANT가 아닌 축(TEXT·INSTANCE_SWAP)은 옵션이 없다. 합성 컴포넌트의 텍스트처럼
      // 코드에서 루트 prop이 아닌 슬롯이 여기 온다 — 옵션 대신 type만 대조한다.
      if (declared.options === undefined) {
        const actualType = properties[figmaProperty]?.type;
        if (actualType === undefined) {
          issues.push(
            `선언된 Figma 전용 property가 실제로 없습니다: ${contract.figmaName}.${figmaProperty}`,
          );
        } else if (declared.type !== undefined && declared.type !== actualType) {
          issues.push(
            `Figma 전용 property type 불일치: ${contract.figmaName}.${figmaProperty} — 선언 ${declared.type}, 실제 ${actualType}`,
          );
        }
        continue;
      }
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
    issues.push(...compareComponentOpacity(contract, got));
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

    // **아이콘을 품는 컴포넌트는 교체 슬롯을 가져야 한다.**
    // 슬롯 없이 아이콘 인스턴스가 박혀 있으면 소비처가 바꿔 끼울 수 없고, 화면을 조립할 때
    // 전부 같은 글리프가 된다. 실제로 그렇게 만든 홈 템플릿을 내린 적이 있다(2026-08-18).
    if (contract.iconSlots !== undefined) {
      for (const slot of contract.iconSlots) {
        const declared = Object.entries(properties).find(
          ([name, definition]) => name === slot && definition.type === "INSTANCE_SWAP",
        );
        if (declared === undefined) {
          issues.push(
            `${contract.figmaName}: 아이콘 교체 슬롯 \`${slot}\`이 없습니다. 아이콘이 박혀 있으면 소비처가 바꿔 끼울 수 없습니다.`,
          );
        }
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
      // 면제한 자리는 **변형마다 하나씩** 있다. variant 축이 있는 컴포넌트에서 parts.length 만
      // 기대하면 축을 늘리는 순간 거짓 실패가 난다 — ProjectCard 에 State(Default·Hover)를
      // 더하자 선언 3 · 실제 6 이 됐다(2026-08-26). 곱해서 본다.
      const variants = Math.max(got.variantCount ?? 1, 1);
      const expectedUnstyled = exempt.parts.length * variants;
      if ((binding.textUnstyled ?? 0) !== expectedUnstyled) {
        issues.push(
          `${contract.figmaName}: style이 없는 텍스트 수가 면제 선언과 다릅니다 — 선언 ${exempt.parts.length}×${variants}=${expectedUnstyled}, Figma ${binding.textUnstyled}`,
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
/** 불투명도 하나를 시안 값으로 되돌린다 — 실제로 게이트를 빠져나갔던 어긋남 그대로다. */
function tamperComponentOpacity(document) {
  for (const contract of COMPONENT_CONTRACTS) {
    if (contract.opacity === undefined) continue;
    const geometry = document.components?.[contract.figmaName]?.geometry;
    const key = Object.keys(contract.opacity).find((k) => Array.isArray(geometry?.[k]?.opacity));
    if (key === undefined) continue;
    geometry[key].opacity = [0.5];
    return `component 불투명도 변조 ${contract.figmaName}.${key}`;
  }
  return null;
}

/**
 * 자손 불투명도의 검출력을 고정한다.
 *
 * 위 `tamperComponentOpacity` 는 **루트에 불투명도가 있는 계약만** 고른다. 계약값이 자손에
 * 있는 컴포넌트(PaneDivider 의 그립)는 그 canary 가 통째로 건너뛰므로, 자손 경로가 아무것도
 * 잡지 못해도 canary 수는 그대로다 — 실제로 확장 직전 상태에서 35종이 전부 통과했다.
 * 「테스트의 테스트」가 비면 확장은 있으나 마나다.
 */
function tamperComponentPartOpacity(document) {
  for (const contract of COMPONENT_CONTRACTS) {
    if (contract.opacity === undefined) continue;
    const geometry = document.components?.[contract.figmaName]?.geometry;
    for (const [key, want] of Object.entries(contract.opacity)) {
      const part = want !== null && typeof want === "object" ? want.part : null;
      if (part === null) continue;
      const values = geometry?.[key]?.parts?.[part]?.opacity;
      if (!Array.isArray(values)) continue;
      geometry[key].parts[part].opacity = [values[0] === 0.5 ? 0.25 : 0.5];
      return `자손 불투명도 변조 ${contract.figmaName}.${key}.${part}`;
    }
  }
  return null;
}

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

/**
 * template 수치 축 하나를 흔들어 compareTemplates의 값 대조가 살아 있는지 증명한다.
 *
 * 이전 판은 `overlayHeightRatio`를 **이름으로 박아** 두었다. 그 필드는 `home`에만 있어서,
 * 그 필드가 없는 template이 알파벳 앞에 서는 순간(2026-08-31 `app-shell`) 변조가 아무것도
 * 바꾸지 않는 no-op이 됐다 — canary가 조용히 무력해지는 바로 그 실패다. 이름 대신
 * **계약에 실제로 있는 첫 수치 축**을 고른다. template이 늘어도 따라온다.
 */
function tamperTemplateField(document) {
  const name = firstTemplateName(document);
  if (name === undefined) return null;
  const template = document.templates[name];
  const contract = templateMeasured.templates?.[name] ?? {};
  const field = Object.keys(contract).find(
    (key) => !key.startsWith("$") && Number.isFinite(template[key]),
  );
  if (field === undefined) return null;
  template[field] += 1;
  return `template 수치 변조 ${name}.${field}`;
}

/**
 * 정사각 관계는 그것을 **선언한** template에만 있다. 첫 template을 무턱대고 집으면
 * `cardWidth`가 없는 패턴에서 `undefined + 40`이 되어 변조가 사라진다.
 */
function tamperTemplateSquare(document) {
  const name = Object.keys(document.templates ?? {})
    .sort()
    .find((key) => templateMeasured.templates?.[key]?.cardSquare?.value === true);
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
