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
 * **기대값이 계산에서 나온 칸의 계산 과정.** 채움 칸(`fillIn`)과 template 규칙 칸(`rule`)은 기록에 수가 없어,
 * 대조가 초록이어도 무엇과 맞댔는지 출력에 남기지 않으면 건너뛴 것과 구별되지 않는다(2026-09-15 — 채움 칸이 출력
 * 한 줄 없이 `continue` 하던 병). 대조할 때마다 라벨 → 계산 한 줄을 담고, 판정과 무관하게 끝에 인쇄한다.
 * 변조 canary 가 같은 대조를 다시 돌려도 라벨이 같아 한 번만 남는다.
 */
const derivationNotes = new Map();

// ── DS 레일 내용 폭 — 사이드바 부품의 펼친 폭(채움 칸)이 따라야 하는 값 ──────────────────────────────
// 부품(`SidebarBrand` · `SidebarCta` 펼침, `SidebarNavRow`)은 레일 내용 폭을 100% 로 받는다(app-shell.css
// `.louis-sidebar-brand` · `.louis-sidebar-cta__button` · `.louis-sidebar-nav-row` 의 `inline-size: 100%`). 그 폭은
// 레일 `.louis-app-shell__rail` 의 `inline-size` 토큰 − 좌우 `padding` 토큰 × 2 다. **토큰 이름을 여기 적지 않고 레일
// 선언에서 읽는다** — 레일이 다른 토큰을 물면 기대값이 따라가고, 선언 꼴이 바뀌어 읽지 못하면 조용히 넘기지 않고 실패한다.
// 값은 생성된 토큰 manifest 에서 읽는다. 2026-09-15 전에는 이 칸들이 Figma 표본 폭(256)을 대조하지 않고 넘어가
// 토큰이 움직여도(`layout-app-shell-sidebar-width` 280 → 240) 표본을 옮길 자리를 아무 게이트도 말하지 않았다.
const RAIL_CSS_PATH = "packages/css/src/component/app-shell.css";
let railContentFillCache;
function railContentFill() {
  if (railContentFillCache !== undefined) return railContentFillCache;
  const css = readFileSync(resolve(repoRoot, RAIL_CSS_PATH), "utf8");
  const block = css.match(/^\.louis-app-shell__rail\s*\{([^}]*)\}/m)?.[1];
  const widthVar = block?.match(/^\s*inline-size:\s*var\((--louis-[a-z0-9-]+)\);/m)?.[1];
  const paddingVar = block?.match(/^\s*padding:\s*var\((--louis-[a-z0-9-]+)\);/m)?.[1];
  const tokenFor = (cssVar) => (manifest.tokens ?? []).find((token) => Object.hasOwn(token.cssProperties ?? {}, cssVar));
  const width = widthVar && tokenFor(widthVar);
  const padding = paddingVar && tokenFor(paddingVar);
  const px = (token) => (token?.resolvedValue?.unit === "px" && Number.isFinite(token.resolvedValue.value) ? token.resolvedValue.value : undefined);
  if (block === undefined) {
    railContentFillCache = { error: `${RAIL_CSS_PATH} 에 \`.louis-app-shell__rail\` 선언 블록이 없습니다` };
  } else if (widthVar === undefined || paddingVar === undefined) {
    railContentFillCache = {
      error: `${RAIL_CSS_PATH} \`.louis-app-shell__rail\` 에서 \`inline-size: var(--louis-…)\` · \`padding: var(--louis-…)\` 한 줄씩을 읽지 못했습니다 (inline-size ${widthVar ?? "없음"}, padding ${paddingVar ?? "없음"})`,
    };
  } else if (px(width) === undefined || px(padding) === undefined) {
    railContentFillCache = {
      error: `${MANIFEST_PATH} 에서 ${widthVar} · ${paddingVar} 의 px 값을 찾지 못했습니다 (${width?.id ?? "토큰 없음"} ${px(width)} · ${padding?.id ?? "토큰 없음"} ${px(padding)})`,
    };
  } else {
    railContentFillCache = {
      value: px(width) - 2 * px(padding),
      formula: `${width.id} ${px(width)} − 2 × ${padding.id} ${px(padding)}`,
    };
  }
  return railContentFillCache;
}
const FILL_SOURCES = { "rail-content": railContentFill };

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
    // **Button에는 stroke가 하나도 없는 것이 계약이다.** 여기에는 `self: { weight: "borderWidth" }`가
    // 있었고 그것이 게이트를 빨갛게 만들고 있었다 — 라이브 전 변형(2026-09-01 당시 300, danger-secondary 가 열린 뒤 360) 중 stroke를 가진 노드가 없기
    // 때문이다. **틀린 쪽은 Figma가 아니라 이 계약이었다.** `button.css:18`이 `border: 0`이고
    // secondary의 헤어라인은 레이아웃을 건드리지 않는 inset box-shadow인데(DS-D-0023),
    // `design/governance/figma-component-authoring.md`의 「헤어라인은 stroke가 아니라 INNER_SHADOW로
    // 그린다」가 그 기법을 규범으로 못 박아 두었다. 빈 객체로 두면 역할 대조는 사라져도
    // compareComponentStrokes의 역방향 검사(`계약에 없는 stroke`)는 그대로 돌아, stroke가 하나라도
    // 생기면 잡힌다.
    //
    // **Spinner 역할도 없다.** 여기에는 `Spinner: { weight: 2 }`가 있었고, 그것은 폐지된
    // `.louis-button__spinner`의 `border: 2px`를 가리키고 있었다. 지금 링은 Spinner 컴포넌트가
    // 그리고, Figma에서도 코드에서도 **테두리가 아니라 채워진 호(arc)**다 — 두께는 안쪽
    // 반지름이 정한다(16 지름에 innerRadius 0.75 → 벽 2px). 잴 stroke 자체가 없다.
    //
    // **글리프 획도 여기서 재지 않는다.** `LeftIcon.glyph`·`RightIcon.glyph`가 있었는데 그 역할은
    // 되읽기가 만들 수 없다 — 채취 규칙 2가 역할 이름을 **노드 이름**으로 정의해 점이 든 경로가
    // 어떤 노드와도 맞지 않고, 규칙 1이 INSTANCE에서 멈춰 아이콘 인스턴스 안의 벡터에 닿지도
    // 않는다(`scripts/figma-readback-emit.mjs` 머리말). 획의 정본은 아이콘 manifest이고
    // compareIcons가 아이콘 component 31개에서 1.5를 직접 잰다 — 여기에 두면 정본이 둘이 된다.
    strokes: {},
    // secondary 60변형의 헤어라인. CSS는 `box-shadow: var(--louis-hairline-inset)` =
    // `inset 0 0 0 0.5px stroke-hairline`이고(`base.css:29-30`), 규범이 요구하는 Figma 대응물이
    // spread 0.5의 inner shadow다. 라이브 실측이 그렇게 서 있는데 채취 명세에 담는 자리가 없어
    // 계약 밖이었다 — 이너섀도우를 안 쓴다고 적어 둔 옛 `effects: {}`는 폐지된 글래스 섀도우를
    // 가리킨 문장이지 헤어라인을 가리킨 것이 아니다. offsetY 0 · blur 0 · spread 0.5.
    //
    // 2026-09-21 DS-D-0066 — primary 활성 36변형(Default · Hover · Active)에 위아래 빛 두 겹이 선다.
    // Y ±1 · blur 1 · spread −0.5, 둘 다 blendMode OVERLAY. 되읽기 문자열은 블렌드를 적지 않으므로
    // 오버레이 여부와 「어느 변형에 서는가」는 `packages/react/test/button.browser.test.tsx` 가 잰다.
    effects: { self: ["INNER_SHADOW:0:0:0.5", "INNER_SHADOW:1:1:-0.5 + INNER_SHADOW:-1:1:-0.5"] },
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
          "코드에서 leftIcon/rightIcon은 ReactNode prop이고 있으면 그린다. Figma에서 불리언으로 두면 아이콘이 붙은 쪽 padding 보정(-2px, button.css:78-91)을 표현할 수 없다 — 불리언은 가시성만 바꾼다. 그래서 variant 축으로 쪼갰고 6×3×5×4 = 360이다(danger-secondary 가 열리기 전에는 5×…=300이었다, DS-D-0045).",
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
        // **최소 폭은 세 size 공통 계약이다** — `button.css` 의 lg·md·sm 세 블록이 전부
        // `min-inline-size: var(--louis-layout-control-minimum-width-md)`(48)를 건다. 칸별
        // 최소 폭이라는 축은 이 시스템에 없다(DS-D-0032).
        //
        // **폭을 보지 않는 이 계약에서 `minWidth` 만은 본다.** 위 주석이 총 폭을 뺀 이유는
        // 라벨 폭이 글꼴 렌더링에 달려 브라우저와 Figma 가 원래 다르기 때문인데, 최소 폭은
        // 라벨이 아니라 **DS 가 정한 바닥**이라 그 사유가 걸리지 않는다.
        //
        // 2026-09-02 에 열었다. 그전까지 되읽기에 이 축이 없어(DEFAULT_FIELDS 에 `minWidth` 가
        // 없다) Figma 마스터의 lg·md 240칸이 `minWidth: null` 인 채로 게이트가 초록이었다.
        // 드러난 것은 게이트가 아니라 화면 보드다 — `/settings` 의 「Go」가 제품 48 · Figma 42 였다.
        // 라벨이 짧아 HUG 가 바닥에 닿는 자리가 그것뿐이라, 마스터를 고치지 않으면 다음에 짧은
        // 라벨이 하나 더 생길 때 같은 자리에서 다시 어긋난다.
        minWidth: "minWidth",
        layoutMode: { literal: "HORIZONTAL" },
      },
      slots: { LeftIcon: "iconSlot", RightIcon: "iconSlot", Spinner: "spinner" },
      // 보이는 테두리 외에 허용되는 stroke 두께. spinner 링은 테두리가 아니다.
      extraStrokeWeights: [2],
      // **자식 순서가 계약이다.** `button.tsx`가 spinner를 맨 앞에 그린다(leftIcon·label보다
      // 먼저). loading이면 leftIcon은 렌더되지 않으므로 그 자리를 spinner가 대신한다.
      //
      // 2026-09-01 감사에서 Loading 60칸의 spinner가 **맨 뒤에** 서 있었는데 게이트는 초록이었다 —
      // 되읽기가 자식 순서를 담지 않아 라이브 전수 순회로만 드러났다. 기능(`childOrder`)은 이미
      // 있었고 Button에서 꺼져 있었을 뿐이다. 켜면서 300칸의 순서를 하나로 통일했다.
      // **숨은 Spinner도 맨 앞에 둔다** — 「그려진다면 설 자리」에 두어야 한 size 키에 한 값이
      // 담기고, 그래야 이 배열 하나로 300칸을 묶을 수 있다.
      childOrder: ["Spinner", "LeftIcon", "Label", "RightIcon"],
    },
  },
  {
    id: "icon-button",
    // `Glyph.glyph`를 뺐다 — Button과 같은 이유다. 되읽기가 만들 수 없는 역할이고(채취 규칙 1·2),
    // 글리프 획의 정본은 아이콘 manifest이며 compareIcons가 그것을 직접 잰다.
    //
    // **`self`는 남긴다.** 라이브가 실제로 0.5|INSIDE stroke를 변수에 물려 갖고 있다. 다만 이것은
    // Button과 같은 CSS(`icon-button.css:23` `border: 0` + secondary의 inset box-shadow)를 **다른
    // 기법으로** 그린 것이고, 규범은 헤어라인을 INNER_SHADOW로 그리라고 정한다. 기법을 어느 쪽으로
    // 통일할지는 소유자 판정이므로 여기서는 실재를 계약으로 적어 둔다.
    strokes: {
      self: { weight: "borderWidth", align: "INSIDE" },
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
      // `allowGlyphStroke: true`가 있었다. 「글리프 instance가 보이므로 그 안의 vector stroke가
      // 함께 읽힌다」는 전제였는데 **읽히지 않는다** — 되읽기는 VECTOR의 stroke를 두께 집합에서
      // 빼고(채취 규칙 3) INSTANCE 내부로 들어가지도 않는다(규칙 1). 실측이 그것을 확인해 준다:
      // 세 size 모두 `strokeWeight: [0.5]`로, 아이콘 1.5는 애초에 들어온 적이 없다. 남겨 두면
      // 허용 집합만 넓히고 아무것도 설명하지 않는다.
      extraStrokeWeights: [],
    },
  },
  {
    id: "tooltip",
    // **한 역할이 두 두께를 갖는 것이 계약이다.** base 의 경계는 generic 헤어라인 0.5(DS-D-0023)이고
    // coachmark 의 경계는 강조색 1px 테두리다 — 「여기를 보라」를 말하는 것이 그 테두리라 헤어라인으로
    // 바꾸면 layout 축이 아무것도 바꾸지 않게 된다. 두 값은 각각 measured 의 base.borderWidth 와
    // coachmark.borderWidth 이며, 그 둘을 여기에 목록으로 적는다.
    strokes: {
      self: {
        weight: [0.5, 1],
        align: "INSIDE",
        reason:
          "base 는 헤어라인 0.5(components.measured.json 의 tooltip.sizes.base.borderWidth), coachmark 는 강조색 테두리 1(같은 파일 tooltip.sizes.coachmark.borderWidth)이다. layout 축이 경계의 뜻을 바꾸므로 두께가 하나일 수 없다.",
      },
    },
    // **두 layout 이 같은 effect 를 쓴다.** component set 의 effect 는 변형이 아니라 역할(`self`)
    // 하나가 갖는 값이고 이 게이트가 그것을 문자열 하나로 잡는다(compareComponentEffects) — layout
    // 축이 자기 그림자를 가지려면 컴포넌트를 둘로 쪼개야 하는데 둘은 같은 앵커 표면이다.
    // 제품 coachmark 의 `0 8px 24px 16%` + `blur(panel)` 은 그래서 채택되지 않았고, 그 편차는
    // tooltip.css 의 coachmark 블록 주석과 제품 절차서가 갖는다.
    effects: { self: "DROP_SHADOW:12:24:0" },
    figmaName: "Tooltip",
    propProperties: { Content: "content" },
    declaration: "packages/react/dist/tooltip/tooltip.d.ts",
    variantProperties: {
      // Side는 화살표의 방향을 바꾼다. **표면 시각이 네 방향 같다고 적어 두었던 것이 잘못이었다** —
      // 그래서 화살표 없이 네 variant가 전부 같은 그림이었고, 축이 아무것도 바꾸지 않으면
      // 그 축은 거짓말이다(2026-08-18).
      Side: { type: "OverlaySide", declaration: "packages/react/dist/overlay/positioner.d.ts" },
      // Layout 은 표면에 **담기는 것**을 바꾼다. 크기 사다리가 아니다 — base 는 한 줄 설명,
      // coachmark 는 대상에 붙어 함께 팬·줌되는 제목/본문 두 줄이다.
      Layout: "TooltipLayout",
    },
    figmaOnlyProperties: {
      Title: {
        type: "TEXT",
        reason:
          "코드에서 `title`은 ReactNode prop 이라 타입 선언에 문자열 항목으로 나타나지 않는다(React 가 준다). coachmark 변형에서만 자리를 갖는다.",
      },
    },
    geometry: {
      measuredId: "tooltip",
      sizeKeys: ["base", "coachmark"],
      fields: {
        height: "height",
        // **「패딩 + 테두리」 접기는 coachmark 에만 건다(2026-10-06).** base 의 경계는 테두리가 아니라 inset 헤어라인
        // (`box-shadow: … var(--louis-hairline-inset)`)이라 박스에 자리가 없다 — Figma 도 레이아웃 밖 INSIDE 획이고 패딩은
        // CSS 그대로 4/8 이다(figma-component-authoring.md 「border 가 없는데 padding 에 border 를 더하지 마라」). coachmark 는
        // 진짜 1px 테두리라 접는다. 전에는 둘 다 접어 base 가 4.5/8.5 · 높이 FIXED 26 으로 굳어 있었다.
        paddingBlock: { bySize: { base: "paddingBlock", coachmark: ["paddingBlock", "borderWidth"] } },
        paddingBlockEnd: { bySize: { base: "paddingBlock", coachmark: ["paddingBlock", "borderWidth"] } },
        paddingInline: { bySize: { base: "paddingInline", coachmark: ["paddingInline", "borderWidth"] } },
        paddingInlineEnd: { bySize: { base: "paddingInline", coachmark: ["paddingInline", "borderWidth"] } },
        itemSpacing: "gap",
        cornerRadius: "radius",
        layoutMode: { literal: "HORIZONTAL" },
      },
      slots: {},
      extraStrokeWeights: [],
      // **폭은 보지 않는다.** coachmark 는 상한 320(`min(320px, 가용 폭)`)이 폭을 정하지만 base 의 폭은 라벨 렌더링이 정하는
      // 값이라 measured 에 근거가 없다. 한 계약의 fields 는 모든 size 키에 함께 걸리므로
      // 여기에 width 를 넣으면 base 에 「근거 값이 없습니다」가 난다. coachmark 320 은
      // surface-geometry.browser.test.tsx 가 코드 쪽에서 잰다.
      parts: {
        // Side 축이 바꾸는 유일한 것. 없으면 네 variant가 같은 그림이 된다.
        Arrow: { fields: { width: "arrowWidth", height: "arrowHeight" }, optional: true },
        // coachmark 의 꼬리 — 45° 돌린 정사각형이라 base 의 삼각형과 다른 도형이다.
        Tail: { fields: { width: "tailSize", height: "tailSize" }, optional: true },
        // 제목/본문 덩어리. Figma 에는 자식별 간격이 없어 이 프레임의 itemSpacing 이
        // CSS 의 본문 margin-block-start 와 같은 값을 낸다.
        Stack: { fields: { itemSpacing: "contentGap" }, optional: true },
        // **코치마크의 닫기 자리(2026-10-07).** 사용자가 치울 수 있어야 해서 표면 안 오른쪽 위 모서리에 44×42 칸이 절대
        // 배치로 선다 — 흐름에 끼지 않으므로 표면 높이(64)를 바꾸지 않는다. 글리프는 칸 오른쪽 끝에서 8 안쪽, 세로 가운데에
        // 놓여 제목 줄과 나란하다. 제목은 오른쪽 20 을 비워 글리프와 겹치지 않는다 — Figma 글자 노드에는 padding 이 없어
        // 제목을 `TitleRow` 프레임에 싸고 그 프레임의 오른쪽 padding 으로 같은 20 을 만든다. base 에는 닫기가 없다.
        TitleRow: { fields: { paddingInlineEnd: "closeTitleInset" }, optional: true },
        Close: {
          fields: { width: "closeWidth", height: "closeHeight", paddingInlineEnd: "closeGlyphInset" },
          optional: true,
        },
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
    propProperties: { Message: "message", Title: "title" },
    declaration: "packages/react/dist/toast/toast.d.ts",
    variantProperties: {
      Tone: "ToastTone",
      // Layout 은 표면에 **담기는 것**을 바꾼다 — base 는 한 줄 메시지, callout 은 제목/본문
      // 두 줄과 액션 슬롯이다. 표면·그림자·흐림은 두 layout 이 같다.
      Layout: "ToastLayout",
    },
    figmaOnlyProperties: {
      ActionLabel: {
        type: "TEXT",
        reason:
          "코드에서 액션은 `action: { label, onAction }` 객체라 라벨이 최상위 prop 이 아니다. Figma 에는 함수를 담을 자리가 없으므로 그릴 수 있는 것(라벨)만 property 로 세운다.",
      },
    },
    geometry: {
      measuredId: "toast",
      sizeKeys: ["base", "callout"],
      fields: {
        height: "height",
        paddingBlock: "paddingBlock",
        paddingBlockEnd: "paddingBlock",
        paddingInline: "paddingInline",
        // **끝 변을 따로 잰다.** callout 의 좌우가 16/12 로 갈린다 — 액션이 자기 padding 을
        // 갖고 있어 오른쪽을 4 줄여야 시각 여백이 좌우로 같아 보인다(광학 보정).
        paddingInlineEnd: "paddingInlineEnd",
        itemSpacing: "gap",
        cornerRadius: "radius",
        layoutMode: { literal: "HORIZONTAL" },
      },
      slots: {},
      extraStrokeWeights: [],
      parts: {
        // 제목/본문 덩어리. Figma 에는 자식별 간격이 없어 이 프레임의 itemSpacing 이
        // CSS 의 `.louis-toast__content` gap 과 같은 값을 낸다.
        Content: { fields: { itemSpacing: "contentGap" }, optional: true },
        // 액션 슬롯. **높이를 선언하지 않고 내용에서 나오게 둔 값이라** 여기서 재는 26 은
        // 「caption 18 + padding 4+4」의 결과다 — 제품의 리터럴 28 이 아니다(측정 파일의
        // $actionHeight 가 사유를 갖는다).
        Action: {
          fields: {
            height: "actionHeight",
            cornerRadius: "actionRadius",
            paddingBlock: "actionPaddingBlock",
            paddingBlockEnd: "actionPaddingBlock",
            paddingInline: "actionPaddingInline",
            paddingInlineEnd: "actionPaddingInline",
          },
          optional: true,
        },
        // **행동 묶음과 닫기(2026-10-07).** 사라지지 않는 callout 은 사용자가 치울 길이 필요해 닫기를 갖고, 행동 단추와
        // 닫기는 한 줄로 붙는다 — 본문과 행동 사이(16)보다 가까운 4 다. base 는 자동으로 사라지므로 닫기가 없고, 그래서
        // 두 자손 모두 optional 이며 base 칸에는 근거 값도 없다. 닫기의 쉬는 불투명도 72% 는 되읽기가 자손 값을 소수
        // 한 자리에서 접어 대조하지 못한다 — 그 값은 CSS 레시피와 문서가 소유한다.
        Actions: {
          fields: { itemSpacing: "actionsGap", layoutMode: { literal: "HORIZONTAL" } },
          optional: true,
        },
        Close: { fields: { width: "closeSize", height: "closeSize" }, optional: true },
      },
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
        options: ["Default", "Hover", "Danger", "DangerHover", "Disabled", "Busy", "Selected"],
        reason:
          "Default/Hover는 CSS 상태이고 Danger는 tone prop, Disabled는 disabled prop이다. Figma에는 CSS 상태가 없어 한 축에 합친다. DangerHover가 따로 있는 이유는 danger 항목의 hover 면이 일반 항목과 다른 토큰을 쓰기 때문이다. Busy는 항목이 스스로 작업을 도는 동안이다 — 후행 자리에 스피너가 서고 항목이 비활성처럼 보이지만 disabled와 달리 취소가 열려 있다. Selected는 role=listbox의 값 목록에서 「지금 값」이다(aria-selected) — 면이 hover(4%) 위 한 칸인 12%이고, Checked(aria-checked)와 다른 것을 말한다: 저쪽은 행동 목록에서 켜고 끄는 축이라 글리프가 표현하고, 이쪽은 값 목록이라 늘 하나가 선택돼 있어 글리프 칸을 세우면 모든 행이 빈 칸을 들고 선다.",
      },
      Layout: {
        options: ["base", "description"],
        reason:
          "항목에 **담기는 것**이 갈린다(2026-10-08 Figma 에 세움) — base 는 이름 한 줄, description 은 이름 아래 결과 한 줄(`.louis-menu__item-description`)을 더한 두 줄 항목이다. Toast · Tooltip · EmptyState 의 Layout 과 같은 종류다. BOOLEAN 이 아닌 이유는 프레임이 자기 정렬을 다시 쓰기 때문이다(figma-component-authoring.md §2 시험 2) — CSS 는 설명 슬롯이 있는 항목만 `align-items: flex-start` 로 아이콘을 첫 줄에 붙이고, 설명을 감추기만 하면 아이콘이 두 줄 한가운데에 남는다. 코드에서는 속성이 아니라 `:has(.louis-menu__item-description)` 구조라 prop 도 data 속성도 없다. 아이콘 타일(`data-shape=\"tile\"`)은 이 축에 넣지 않았다 — 타일 면이 소유자 판정 대기다(menu-popover.md Known deviations 「아이콘 타일 면」).",
      },
    },
    geometry: {
      measuredId: "menu-popover",
      // **두 칸을 다 돈다(2026-10-08).** base 는 지금까지의 `panel` 이고(되읽기가 `map` 으로 같은 키를 낸다) description 은
      // `descriptionItem` 이다. 항목 필드 이름을 두 칸이 같이 쓰므로 한 규칙으로 둘을 대조한다 — 갈리는 것은 높이(37 ↔ 57)와
      // 정렬(CENTER ↔ MIN) 둘이다.
      sizeKeys: ["panel", "descriptionItem"],
      fields: {
        height: "itemHeight",
        paddingBlock: "itemPaddingBlock",
        paddingBlockEnd: "itemPaddingBlock",
        paddingInline: "itemPaddingInline",
        paddingInlineEnd: "itemPaddingInline",
        itemSpacing: "itemGap",
        cornerRadius: "itemRadius",
        counterAxisAlignItems: { enum: "itemAlign", table: { center: "CENTER", "flex-start": "MIN" } },
        layoutMode: { literal: "HORIZONTAL" },
      },
      slots: {},
      parts: {
        // 이름과 설명을 담는 열(`.louis-menu__item-text`). Figma 글자 노드에는 형제 간격이 없어 열 프레임의 itemSpacing 이
        // CSS 의 gap 2 를 낸다. base 에는 열이 없다 — 이름이 항목에 바로 선다. `optional` 은 근거 값(panel 에 descriptionGap 없음)이
        // 함께 없을 때만 통과한다.
        Text: { fields: { itemSpacing: "descriptionGap", layoutMode: { literal: "VERTICAL" } }, optional: true },
        Description: {
          fields: { fontSize: "descriptionFontSize", lineHeightPercent: "descriptionLineHeightPercent" },
          optional: true,
        },
      },
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
    // **확인 대화상자는 Dialog 의 한 톤이다 — ConfirmDialog 를 따로 세우지 않는다**(DS-D-0041).
    // 제품의 확인 모달 두 벌이 이미 `confirmVariant?: "primary" | "danger"` 로 「같은 Dialog 의
    // 톤 차이」를 모델링하고 있었고(앵커 ae8fd627 의 `ConfirmModal.tsx:31` ·
    // `node-canvas-v2/components/GlassConfirmModal.tsx:34`), 코드가 정본이므로(DS-D-0025)
    // projection 인 Figma 가 그것을 둘로 가를 수 없다.
    //
    // **축이지 중첩 인스턴스가 아니다.** 푸터 Button 인스턴스에서 `Variant` 를 danger 로 고르게
    // 하는 길이 있지만, 이 게이트가 읽는 것은 component set 의 property 목록이고 중첩 노출은 그
    // 목록에 없다 — 계약이 되지 못하는 표현은 대조되지 않는 표현이다(DS-D-0035).
    variantProperties: { Tone: "DialogTone" },
    figmaOnlyProperties: {
      HasClose: { type: "BOOLEAN", reason: "닫기 버튼이 없는 대화상자가 있다 — 결정을 강제하는 확인 창이다. 코드에서는 onClose의 유무다." },
      Size: {
        options: ["compact", "medium", "large", "sheet"],
        reason:
          "코드의 DialogSize는 fullscreen을 포함해 넷이다. fullscreen은 표면이 뷰포트 자체이고 radius가 0이며 border가 없어 **고정 폭 variant로 그릴 수 없다** — Figma에서 그리면 어떤 폭을 골라도 거짓이 된다. 그래서 코드 축의 부분집합을 Figma 전용으로 선언한다. sheet는 반대 방향의 추가다 — 좁은 화면에서 아래에서 올라오는 시트가 제품에 실재하는데 코드 축에 이름이 없어, 디자이너가 그것을 그릴 자리가 없었다.",
      },
      Layout: {
        options: ["base", "grabber"],
        reason:
          "표면에 **담기는 것**이 갈린다(2026-10-08 Figma 에 세움) — grabber 는 surface 첫 자식 `.louis-dialog__grabber`(위 가장자리의 닫기 띠 + 36×4 막대)가 들어온 시트다. Toast · Tooltip · EmptyState · Menu 의 Layout 과 같은 종류다. BOOLEAN 이 아닌 이유는 프레임이 자기 위 패딩을 다시 쓰기 때문이다(figma-component-authoring.md §2 시험 2) — 띠는 절대 배치라 흐름에 끼지 않고 CSS `:has(> .louis-dialog__grabber)` 가 surface 위 패딩을 띠 높이 32 만큼 둔다. 띠를 감추기만 하면 헤더 위에 빈 32 가 남거나 띠가 헤더를 덮는다. 손잡이는 sheet 전용 부품이라 grabber 는 `Size=sheet` 하나에만 선다(set 이 희소하다 — Tone=danger 가 compact 에만 있는 것과 같다). 코드에는 prop 이 없다 — React `Dialog` 에 손잡이 part 가 아직 없어 소비자가 마크업을 직접 쓴다(dialog.md 「Sheet 손잡이」).",
      },
    },
    geometry: {
      measuredId: "dialog",
      fields: {
        width: "width",
        // **손잡이 시트만 위 패딩에 띠 높이를 더한다(2026-10-08).** 띠가 절대 배치라 흐름에 끼지 않고, CSS 가 손잡이 있는
        // surface 의 위 패딩을 띠 높이만큼 둔다 — 헤더는 그 아래에서 제 여백 24 를 그대로 갖는다. 아래 패딩은 그대로다.
        paddingBlock: {
          bySize: {
            compact: ["surfaceInset", "borderWidth"],
            medium: ["surfaceInset", "borderWidth"],
            large: ["surfaceInset", "borderWidth"],
            sheet: ["surfaceInset", "borderWidth"],
            "sheet/grabber": ["grabberBlockSize", "surfaceInset", "borderWidth"],
          },
        },
        paddingBlockEnd: ["surfaceInset", "borderWidth"],
        paddingInline: ["surfaceInset", "borderWidth"],
        paddingInlineEnd: ["surfaceInset", "borderWidth"],
        itemSpacing: "gap",
        // **모서리를 둘로 나눠 본다.** sheet 는 뷰포트 바닥에 붙어 아래 두 모서리가 0 이라
        // 네 모서리가 갈리고, 그러면 Figma 의 `cornerRadius` 가 `mixed` 가 되어 되읽기에
        // 빈 배열로 떨어진다 — 그 칸의 곡률이 **아무것과도 대조되지 않는다.** 좌우는
        // 대칭이므로 왼쪽 두 모서리만 건다.
        topLeftRadius: "radius",
        bottomLeftRadius: "radiusBottom",
        layoutMode: { literal: "VERTICAL" },
      },
      slots: {},
      parts: {
        // **시트 손잡이(2026-10-08, `Layout=grabber`).** 띠(`Grabber`)는 위 가장자리에 절대 배치된 폭 × 32 칸이고 막대(`Bar`)는
        // 그 가운데의 36 × 4 알약이다. 손잡이가 없는 칸에는 두 자손도 근거 값(grabberBlockSize · grabberBarWidth)도 없어
        // optional 로 통과한다. 위 패딩 56.5 는 root 의 paddingBlock 이 bySize 로 대조한다.
        Grabber: { fields: { height: "grabberBlockSize", width: "width" }, optional: true },
        Bar: {
          fields: { width: "grabberBarWidth", height: "grabberBarHeight", cornerRadius: "grabberBarRadius" },
          optional: true,
        },
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
      Layout: {
        options: ["block", "inline", "banner"],
        reason:
          "**놓이는 자리가 기하를 통째로 바꾼다.** CSS 에서 `data-layout` 이고 속성이 없을 때가 block 이다 — block 을 이름으로 적어 두는 것이 계약이라, `danger` 처럼 「써도 되지만 계약에 없는 값」을 만들지 않는다(alert.md Known deviations 3 이 그 함정을 소유한다). inline 은 면·테두리·반경이 전부 0 이고 글자가 caption 12 로 내려가며 톤을 갖지 않는다(무테에서 색이 유일한 신호가 되면 WCAG 1.4.1 을 스스로 깬다). banner 는 전폭 띠라 반경이 0 이고 면이 알파 틴트가 아니라 불투명 톤 컨테이너(`color/bg-{tone}`)다. **값이 소문자인 것은 CSS 속성값과 같은 철자를 쓰기 위해서다** — `Tone=danger` 와 같은 규칙이다.",
      },
      Tone: {
        options: ["danger", "info", "success", "warning"],
        reason:
          "tone 하나가 면·테두리·글자 셋을 함께 바꾼다. CSS 에서 data-tone 속성 선택자이고 기본값이 danger 다 — 제품에서 실제로 가장 많이 쓰는 자리가 결제 실패 배너다. **inline 에서는 네 톤이 같은 값이다** — 그것이 결손이 아니라 계약이며 `components.measured.json` 의 `states.inline` 이 네 칸을 접지 않고 다 적어 그 사실을 고정한다.",
      },
      HasIcon: { type: "BOOLEAN", reason: "아이콘 없는 경고가 있다. CSS 에서는 __icon 자식의 유무다." },
      HasTitle: { type: "BOOLEAN", reason: "제목 없이 한 줄만 있는 경고가 있다. CSS 에서는 __title 자식의 유무다." },
      Dismissible: {
        type: "BOOLEAN",
        reason:
          "닫기 슬롯(`.louis-alert__dismiss`)의 유무. **기본이 꺼짐이다** — 오늘 제품에서 닫을 수 있는 알림은 루트 배너 하나뿐이고 나머지 다섯 자리는 조건부 렌더링으로 사라진다. 슬롯 안은 IconButton 이고 알림이 버튼을 그리지 않는다: 크기·톤 축을 둘로 가르지 않기 위해서다.",
      },
      Title: { type: "TEXT", reason: "제목 문구. 코드에서는 자식 요소라 prop 이 아니다." },
      Body: { type: "TEXT", reason: "본문 문구. 코드에서는 __content 안의 텍스트다." },
      Glyph: { type: "INSTANCE_SWAP", reason: "tone 마다 어울리는 글리프가 달라 고를 수 있어야 한다." },
    },
    // 경고는 헤어라인이 아니라 **보이는 테두리**를 갖는다 — 면과 글자가 tone 색이라
    // 표면 위에서 경계가 필요하고, border-width-default(1) 를 쓴다.
    // **테두리를 갖는 것은 block 뿐이다.** inline 은 무테가 정의이고 banner 는 불투명 면
    // 자신이 경계라 stroke 가 없다 — 그래서 이 역할은 block 네 변형에서만 걸린다.
    strokes: { self: { weight: 1, align: "INSIDE" } },
    effects: {},
    // **2026-09-06 에 처음 붙은 기하 계약이다.** 그전에는 `geometry` 키가 없어
    // compareComponentGeometry() 가 즉시 빠져나갔고, Figma 의 패딩 12/18 · 간격 8 · 반경 20 을
    // 아무도 코드와 맞춰 보지 않았다(alert.md Known deviations 11).
    geometry: {
      measuredId: "alert",
      fields: {
        paddingBlock: "paddingBlock",
        paddingBlockEnd: "paddingBlock",
        paddingInline: "paddingInline",
        paddingInlineEnd: "paddingInline",
        itemSpacing: "gap",
        cornerRadius: "radius",
        layoutMode: { literal: "HORIZONTAL" },
      },
      // **높이와 폭은 보지 않는다.** Figma 표본은 제목과 본문을 둘 다 켠 두 줄짜리이고 계약의
      // `height` 는 한 줄 높이다 — 같은 것을 재지 않는 두 수를 대조하면 게이트를 끄게 된다.
      // 폭은 컨테이너가 정한다(`inline-size: 100%`).
      //
      // Icon 은 `width` 만 대조한다. 높이는 block 이 21, inline·banner 가 16 인데 CSS 는 셋 다
      // 16 정사각이다 — 같은 목표(글리프를 첫 줄 가운데에 세우기)를 두 표면이 다른 방법으로
      // 얻은 자리이고, 그 어긋남은 alert.md Known deviations 10 이 소유한다.
      parts: {
        Icon: { fields: { width: "icon" } },
      },
    },
  },
  // **Select 는 트리거 하나만 세운다.** 패널(`MenuPanel`)·항목(`Menu`)·「지금 값」 표시
  // (`Menu` 의 `State=Selected`)가 이미 서 있고, 값 목록의 패널은 명령 메뉴의 패널과 같은
  // 표면이다. 검색이 붙는 목록의 검색 필드도 이미 있다 — `TextField` 의 `HasLabel` 축 사유가
  // 「라벨 없는 필드가 실재한다 — 검색창이 그것이다」다. 같은 표면을 두 번 그리지 않는다.
  //
  // `MenuTrigger` 와 갈리는 것은 셋이고, 그 셋이 이 set 이 서는 이유다.
  //   (1) 면이 있다 — 저쪽은 투명이다. 값 목록은 「지금 무엇이 골라져 있는가」를 늘 보여야
  //       하므로 눌러야 나타나는 컨트롤이 아니다.
  //   (2) 캐럿이 있다 — `menu-popover.css` 의 트리거 블록이 「셰브론이 있는 트리거는
  //       Select 계열의 몫이며 그것은 다른 벌이다」라고 자기 몫이 아님을 적어 두었다.
  //   (3) 크기 축이 둘이다 — 저쪽은 32 하나뿐이라 축을 열지 않았다.
  {
    id: "select",
    figmaName: "SelectTrigger",
    figmaAhead: "React 표면 없음 — packages/css/src/component/select.css 가 정본이다.",
    variantProperties: {},
    figmaOnlyProperties: {
      Size: {
        options: ["md", "sm"],
        reason:
          "CSS 에서 `data-size` 이고 **속성이 없을 때가 md 다** — Alert 의 `Layout=block` 과 같은 규칙이라 md 를 이름으로 적어 두는 것이 계약이다. 두 칸 다 DS-D-0027 의 컨트롤 사다리 칸이고 각각 제품 실측 자리를 갖는다(md 32 = Gnb 프로필 언어·ComposerBar 모델, sm 24 = VideoEditModal 프리뷰 줌 칩). 갈리는 것은 높이만이 아니다 — 곡률(12 ↔ 8) · 좌우 여백(12·12 ↔ 8·6) · 간격(6 ↔ 4) · 글리프(20 ↔ 16)가 함께 움직인다. 사다리 밖의 28 을 세 번째 칸으로 열지 않은 이유는 `components.measured.json` 의 select `$note` 가 갖는다.",
      },
      State: {
        options: ["Default", "Hover", "Open", "Disabled"],
        reason:
          "Hover 는 코드에서 CSS 상태이고 Open 은 `aria-expanded=\"true\"` 가 만드는 지속 상태다(prop 이 아니라 패널이 열려 있다는 사실이다). Disabled 는 `disabled` 속성이고 실재한다 — 제품 OverlayInspector 가 글꼴 적용 중과 획이 하나뿐인 패밀리에서 이 트리거를 끈다. **Hover 와 Open 의 면은 같고 뜻이 다르다**: 포인터가 패널로 넘어가면 트리거가 hover 를 잃는데 그때 면이 돌아가면 「무엇이 열려 있는지」가 화면에서 사라진다. 둘을 가르는 것은 면이 아니라 캐럿 회전이다. 접기 시험(figma-component-authoring.md)을 통과한다 — Disabled 위에서 Hover·Open 이 서지 않으므로 곱할 것이 없다.",
      },
      Value: {
        type: "TEXT",
        reason: "지금 골라져 있는 값. 코드에서는 트리거의 자식 텍스트라 prop 이 아니다 — MenuTrigger 의 같은 슬롯과 같은 처리다.",
      },
      Placeholder: {
        options: ["false", "true"],
        reason:
          "값이 아직 없는 상태(2026-10-08 Figma 에 세움). CSS 에서 값 요소의 `data-placeholder` 이고 잉크만 `fg-tertiary` 로 내린다 — 면 · 기하는 그대로라 되읽기 키(Size)도 갈리지 않는다. **BOOLEAN 이 아닌 이유는 계속 보이는 레이어(Value)의 색이 바뀌기 때문이다**(figma-component-authoring.md §2 시험 1). **State 값으로 접지 않은 이유는 접기 시험이다** — placeholder 인 채로 Hover · Open 은 면이 바뀌고 Disabled 는 잉크가 fg-disabled 로 간다(select.css 의 상태 가드). 셋이 각각 다르게 보이므로 독립 조건 축이고, 그래서 16 변형(Size 2 × State 4 × Placeholder 2)이다. TextField 는 같은 뜻을 `State=Placeholder` 로 접었는데, 그 필드는 hover 에서 아무것도 바꾸지 않아 곱할 Hover 칸이 없다 — Select 는 면이 hover · 열림에서 움직인다.",
      },
    },
    // **보이는 테두리가 없다.** 경계는 border 가 아니라 inset 헤어라인이고(DS-D-0023),
    // 그것은 stroke 가 아니라 INNER_SHADOW 로 그린다 — Button secondary·MenuPanel 과 같은
    // 레시피이며 여덟 변형이 전부 갖는다.
    strokes: {},
    effects: { self: "INNER_SHADOW:0:0:0.5" },
    geometry: {
      measuredId: "select",
      // sizeKey 를 두지 않는다 — 되읽기 키(`md`·`sm`)와 실측 키가 같은 축이라 둘을 다 돈다.
      fields: {
        height: "height",
        paddingBlock: "paddingBlock",
        paddingBlockEnd: "paddingBlock",
        paddingInline: "paddingInline",
        paddingInlineEnd: "paddingInlineEnd",
        itemSpacing: "gap",
        cornerRadius: "radius",
        layoutMode: { literal: "HORIZONTAL" },
      },
      // **폭은 보지 않는다.** 트리거의 폭은 호출부가 정한다 — 제품에서 Gnb 는 88, 인스펙터는
      // 140 이고 ComposerBar 는 남는 폭을 먹는다. Figma 표본이 그중 하나를 고정폭으로 그린
      // 것은 표본이지 계약이 아니다(MenuTrigger 도 같은 이유로 width 를 대조하지 않는다).
      //
      // **좌우 여백은 시작과 끝을 따로 본다.** sm 에서 갈리기 때문이다(8 · 6) — 한 칸으로
      // 접으면 그 비대칭이 어느 쪽으로 무너져도 초록이다.
      parts: {
        // 선행 글리프 슬롯. MenuTrigger 의 `Glyph` 와 같은 기법이다 — 빈 프레임이 슬롯이고
        // 원시 fill 이 없다.
        Glyph: { fields: { width: "iconSize", height: "iconSize" } },
        // 캐럿. 12 정사각 안에 icon/caret-down 인스턴스가 앉는다. 획 두께는 여기서 재지
        // 않는다 — 채취가 INSTANCE 에서 멈추고, 글리프 획의 정본은 아이콘 manifest 이며
        // compareIcons 가 아이콘 component 에서 직접 잰다.
        Caret: { fields: { width: "caretSize", height: "caretSize" } },
      },
      extraStrokeWeights: [],
    },
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
    // 트랙은 탭 개수 축이 없다. TabItem 인스턴스를 붙이고 빼서 조립하며 auto-layout 이 폭을 정한다.
    variantProperties: {},
    figmaOnlyProperties: {
      Variant: {
        options: ["default", "underline"],
        reason:
          "CSS 의 `data-variant` 이고 속성이 없을 때가 default 다(2026-10-08 Figma 에 세움). underline 은 분석 화면의 밑선 탭 줄 — 간격이 4 에서 0 으로 줄고 아래 한 변에 헤어라인이 선다. 기하(간격)가 갈리므로 BOOLEAN 이 아니라 축이다. 값을 소문자로 적은 것은 CSS 속성값과 같은 철자를 쓰기 위해서다. 480px 이하 규칙(wrap · 탭 좌우 8 · 첫 탭 시작 0)은 뷰포트 조건이라 Figma 변형이 없다.",
      },
    },
    // **밑선은 아래 한 변의 INSIDE 획 0.5 다(underline 만).** CSS 는 `box-shadow: var(--louis-hairline-inset-block-end)`
    // 인데 Figma 의 INNER_SHADOW 는 면(fill)이 있는 자리에만 그려지고 탭 줄은 면이 없다 — 그림자로 두면 선이 보이지 않는다
    // (2026-10-08 실측). 그래서 화면 조립 30조와 TableCell 의 행 구분선처럼 한 변 획(`border-width/hairline` ·
    // `color/stroke-hairline`, 레이아웃 밖)으로 그린다. default 는 획이 없어 되읽기에 값을 보태지 않는다.
    strokes: { self: { weight: 0.5, align: "INSIDE" } },
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
    figmaAhead: "React 없음 — CSS 레시피 packages/css/src/component/keycap.css(2026-10-07)가 정본이다.",
    variantProperties: {},
    // **제품과 줄 높이·자간이 다르다.** 정본(CommandPalette.tsx:288)은 leading-[1] 이고 글자
    // 키캡은 tracking-[0.02em] 을 더 준다. Figma 에서는 스케일 스타일(typography/caption-*)을
    // 그대로 쓴다 — 칩이 20×20 고정이고 글자가 가운데 정렬이라 줄 높이가 보이는 크기를 바꾸지
    // 않는다(적용 전후 칩 20×20 동일 확인). 스타일 연결을 끊어 가며 지킬 값이 아니다.
    // **선이 없다(2026-10-07).** 레시피가 두 소비처(커맨드 팔레트 20 · 알파 면 + 안쪽 선, 캔버스 도움말 22 · `bg-inset`)를
    // 도움말 쪽으로 닫았다 — 최소 22×22 · 좌우 6 · `radius-overlay-item` · 불투명 `bg-inset` 면이라 안쪽 선이 필요 없다.
    strokes: {},
    effects: {},
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
    // **행에 stroke 가 한 줄도 없다.** 경계는 아래 inner shadow 헤어라인이 만든다. 질문 버튼은 `[border:0]` 이다
    // — `border-0`(폭만 0, style 은 solid)과 다르다.
    strokes: {},
    // **헤어라인을 두른다(2026-10-07, 소유자).** 면이 올린 면(`bg-raised`)으로 바뀌며 선이 함께 다닌다 —
    // CSS `box-shadow: var(--louis-hairline-inset)`, Figma 대응물은 carousel-arrow · node-chip 과 같은
    // INNER_SHADOW:0:0:0.5 다. `md` 두 변형은 면의 주인이 질문 버튼이라 선이 없다 — 되읽기가 효과를 가진
    // 변형만 모으므로 문자열 하나로 적는다(faq-row.md 2번).
    effects: { self: "INNER_SHADOW:0:0:0.5" },
    // `+` 는 아이콘 인스턴스가 아니라 **텍스트 노드**다(되읽기의 Glyph fontSize 20). 그래서
    // INSTANCE_SWAP 슬롯이 없고 iconSlots 도 없다. 열림에서 45° 도는 것도 아이콘 교체가 아니라
    // 같은 글리프의 transform 이다.
    figmaOnlyProperties: {
      Size: {
        options: ["lg", "md"],
        reason:
          "같은 아코디언 행이 두 밀도로 선다 — 랜딩 섹션(폭 1400 · 질문 66 · body-20)과 가이드 모달 탭(폭 1032 · 질문 48 · body-16)이다. LOUIS recipe 가 없어 대조할 코드 union 이 없으므로 Figma 전용이다. **쓰임새 이름(`landing`·`modal`)이 아니라 사다리 어휘를 쓴다** — figma-component-authoring.md 의 「사다리 밖 값은 쓰임새로 부른다」는 사다리로 표현되지 않을 때만 여는 예외이고, 여기 두 값은 순서 있는 두 밀도라 사다리가 그대로 표현한다. 반경도 12 → 8 로 함께 내려가는데, 48 높이에 12 를 두면 곡률이 높이의 1/4 이라 알약으로 읽히기 때문이다(Button 의 sm 이 같은 판단을 했다).",
      },
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
          "코드에서는 item.image 의 유무다. §3 은 있고 없고를 BOOLEAN 으로 두라고 하지만 **BOOLEAN 은 가시성만 바꾼다** — 이 축은 카드를 346×160 에서 698×326 으로 키우고(셸프에서 두 열 두 행을 차지하며 그 사이 간격 4 를 자기 몸으로 덮는다) 전경 색 계열을 테마 추종(landing/panel-strong · gray/000 · landing/text-muted)에서 고정 팔레트(media-foreground-dark · palette-gray/500)로 통째로 바꾼다. 제목 줄 수도 2 에서 1 로 갈린다. Button 의 Icon 축이 padding 보정 때문에 불리언이 될 수 없었던 것과 같은 사유다. **figma-component-authoring.md §2 개정이 Featured 를 조건 축 명부에 올렸다** — 프레임 자신의 고정 크기가 다시 쓰이므로 시험 2 에 걸린다.",
      },
      Title: { type: "TEXT", reason: "제목 한 줄. 코드에서는 item.title 이다." },
      Meta: {
        type: "TEXT",
        reason:
          "날짜 표기. 코드에서는 dateLabel prop 이고 값은 i18n 문자열이 아니라 셸프가 소유한 로케일 포맷터가 만든다. 기계용 ISO 값(item.date)은 Figma 에 대응 슬롯이 없다 — dateTime 같은 의미 속성이 없기 때문이며 그 값의 정본은 코드에만 있다.",
      },
    },
    // **기하가 붙었다 — 폭·높이까지 잰다.** 346 · 160 · 698 · 326 은 카드가 아니라 **트랙 격자**가
    // 정하는 값이라(`grid-auto-columns: 346px` · `grid-template-rows: repeat(2,160px)` · gap 6, 960 이상)
    // 카드만 세워서는 낼 수 없다. 탐침이 트랙을 조상으로 세우고 카드를 칸에 앉혀 격자가 직접
    // 계산하게 한다 — 698 = 346×2 + 6, 326 = 160×2 + 6 이라는 산술도 우리가 적지 않는다.
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
    id: "loading-word",
    figmaName: "LoadingWord",
    figmaAhead:
      "React 표면 없음 — packages/css/src/component/loading-word.css 의 .louis-loading-word 가 정본이다(2026-10-07). 제품 작업 브랜치의 LoadingWord.tsx 가 출처다.",
    variantProperties: {},
    // **면도 선도 그림자도 없다.** 글자 하나가 전부인 표시라 칠하는 것은 글자뿐이다 — 흐름의 0프레임은 글자 칠의
    // 그라디언트, reduced 는 글자 칠의 단색이다. 그라디언트 정지점은 되읽기가 stop 단위로 세어 바인딩 검사(raw 0)를 받는다.
    strokes: {},
    effects: {},
    // **기하 계약이 없다(2026-10-08).** 크기와 글꼴은 호출부가 정하고(블록 로딩은 타이포 클래스, 버튼 안은 버튼의 글자),
    // 레시피에 여백 · 반경 · 간격이 하나도 없다 — 표본 글자 「분석 중」의 40×21 은 문구가 정한 값이라 계약이 아니다.
    // 그래서 이 계약이 고정하는 것은 축과 바인딩뿐이고, manifest 의 Figma 상태는 DS-D-0035 (c) 를 채우지 못해 partial 이다.
    figmaOnlyProperties: {
      Label: { type: "TEXT", reason: "흐르는 문구. 코드에서는 span 의 텍스트이고 호출부가 말줄임표 없는 진행 문구를 넘긴다." },
      Motion: {
        options: ["flow", "reduced"],
        reason:
          "**코드의 축이 아니다 — Figma 가 흐름(background-position 이동)을 그리지 못해 연 정지 상태 둘이다.** flow 는 흐름의 0프레임(`0% 50%`)으로 200% 폭 그라디언트의 앞 절반이 글자 상자에 보인다. reduced 는 `prefers-reduced-motion` 의 모양으로 그라디언트 없이 잉크 88% 단색이다. 두 모양은 CSS 가 실제로 그리는 두 상태라 디자이너가 둘 다 놓을 수 있어야 한다. forced-colors(`CanvasText`)는 시스템 색이라 Figma 변형을 두지 않는다(loading-word.md Known deviations 7).",
      },
    },
  },
  {
    id: "choice-card",
    figmaName: "ChoiceCard",
    figmaAhead:
      "React 표면 없음 — packages/css/src/component/choice-card.css 의 .louis-choice-group · .louis-choice-card 가 정본이다(2026-10-07). 제품 작업 브랜치 두 곳(앰배서더 지원서 Choice · 지표 온보딩 OPTION)이 출처다.",
    variantProperties: {},
    // **선이 없다.** 헤어라인 · 고른 링 · 오류 링이 전부 CSS `box-shadow: inset` 이라 Figma 도 inner shadow 로 그린다
    // (DS-D-0023, figma-component-authoring.md 「헤어라인은 stroke 가 아니라 INNER_SHADOW 로」). 체크는 VECTOR 의 획이라 역할로 세지 않는다.
    strokes: {},
    // 레시피가 상태마다 box-shadow 를 **한 줄만** 붙이므로(choice-card.md Implementation) 변형마다 inner shadow 가 한 겹이다 —
    // 쉼 · 호버 · 비활성 · 행의 고름은 헤어라인 0.5, 카드의 고름(accent-primary)과 오류(fg-danger-on-surface)는 ring 두께 2.
    // 되읽기 문자열에 색이 없어 2 의 두 색은 여기서 갈리지 않는다 — 색은 변수 바인딩이 나른다. 표식은 쉴 때만 헤어라인을
    // 갖고(고른 표식은 주색 면에 효과가 없어 되읽기에 담기지 않는다), 행형에는 표식이 없다.
    effects: {
      self: ["INNER_SHADOW:0:0:0.5", "INNER_SHADOW:0:0:2"],
      Marker: "INNER_SHADOW:0:0:0.5",
    },
    figmaOnlyProperties: {
      Variant: {
        options: ["card", "row"],
        reason:
          "CSS `data-variant` 를 그대로 옮긴 축(figma-component-authoring.md §2 Variant 예외). 고른 면을 말하는 방식이 갈린다 — card 는 accent-secondary-selected 면 + 2px accent-primary 링 + 표식, row 는 accent-inverse 면 뒤집기(소유자 결정 2026-10-07). 패딩 · 반경 · 이름 타이포도 함께 갈린다.",
      },
      Size: {
        options: ["md", "sm"],
        reason:
          "CSS `data-size`. sm 은 한 줄 이름만 있는 compact 카드(패딩 20 · 24, 반경 12, 표식 20, 이름 16/500)다. 행형에는 sm 칸이 없다 — 레시피가 행의 패딩 · 반경 · 간격을 행 값으로 덮어 다른 기하가 나오지 않기 때문이다.",
      },
      Role: {
        options: ["radio", "checkbox"],
        reason:
          "항목의 ARIA role 을 철자 그대로 옮긴 축. 하나만 고르는 묶음(radiogroup)과 여럿 고르는 묶음(group)을 가르고, 시각으로는 표식의 모양만 바꾼다(원 · 반경 6 사각, CSS `[role=\"checkbox\"] .louis-choice-card__marker`). 행형은 표식이 없어 두 값의 그림이 같다 — 그래도 축을 두는 것은 묶음의 역할이 마크업 계약이기 때문이다.",
      },
      Checked: {
        options: ["false", "true"],
        reason:
          "코드에서 `aria-checked` 가 선택을 소유한다. 조건 축 명부의 `Checked` 다 — 면 · 링 · 표식 체크가 바뀐다(시험 1). 접기 시험: 고른 칸은 호버를 흡수하지만 비활성(0.4)에서는 달라져 State 로 접지 않는다. 그래서 Checked=true 에는 Hover 칸이 없다.",
      },
      Invalid: {
        options: ["false", "true"],
        reason:
          "코드에서 항목 또는 묶음의 `data-invalid`(있으면 오류, `\"false\"` 만 예외 — DS-D-0075). 조건 축 명부의 `Invalid` 다 — ring 두께의 fg-danger-on-surface 링이 선다. **고르지 않은 항목에만** 걸리므로(고른 항목은 자기 링을 지킨다) Checked=true 와 곱하지 않는다.",
      },
      State: {
        options: ["Default", "Hover", "Disabled"],
        reason:
          "상호작용 상태. Hover 는 accent-secondary-hover 면이고 `@media (hover: hover)` 안에서만 걸린다(DS-D-0077). Disabled 는 항목 전체 불투명도 0.4 다 — 되읽기가 불투명도를 담지 않아(같은 키에 1 과 섞인다) 그 값은 레시피 · 문서가 소유한다. Focus 는 그리지 않는다(DS-D-0074).",
      },
      Label: { type: "TEXT", reason: "선택지 이름. 코드에서는 `.louis-choice-card__label` 의 텍스트다." },
      Description: { type: "TEXT", reason: "선택지 설명. 코드에서는 `.louis-choice-card__description` 의 텍스트다." },
      HasDescription: {
        type: "BOOLEAN",
        reason: "설명 줄의 유무. 설명 없는 선택지가 실재한다(compact 카드 · 행형 설문). 표본은 card/md 에만 설명 줄을 둔다.",
      },
    },
    geometry: {
      // **세 칸을 전부 건다.** 기하를 다시 쓰는 축은 Variant · Size 둘이라 되읽기 키가 그 둘의 곱(행형은 md 하나)이다.
      // 기록의 값은 브라우저 실측이 아니라 레시피 선언이고 verify-recipe-record 가 레시피 ↔ 기록을 맞댄다 — React 표면이
      // 없어 component-geometry 브라우저 시험이 이 칸을 되재지 않으므로 DS-D-0035 (c) 를 채우지 못한다(manifest Figma `partial`).
      measuredId: "choice-card",
      sizeKeys: ["card/md", "card/sm", "row/md"],
      fields: {
        // 레시피의 `min-block-size: layout-control-hit-target-minimum` — 높이는 문구가 정하므로 하한만 계약이다.
        minHeight: "minHeight",
        paddingBlock: "paddingBlock",
        paddingBlockEnd: "paddingBlock",
        paddingInline: "paddingInline",
        paddingInlineEnd: "paddingInline",
        itemSpacing: "gap",
        cornerRadius: "radius",
        counterAxisAlignItems: { literal: "CENTER" },
        layoutMode: { literal: "HORIZONTAL" },
      },
      slots: {},
      extraStrokeWeights: [],
      parts: {
        Text: { fields: { itemSpacing: "textGap", layoutMode: { literal: "VERTICAL" } } },
        Label: { fields: { fontSize: "labelFontSize", lineHeightPercent: "labelLineHeight" } },
        Description: { fields: { fontSize: "descriptionFontSize", lineHeightPercent: "descriptionLineHeight" }, optional: true },
        // 표식의 반경은 Role 이 바꾼다(원 999 · 사각 6). 되읽기가 같은 키의 두 Role 을 한 배열에 모으므로 집합으로 맞댄다.
        Marker: {
          fields: { width: "markerSize", height: "markerSize", cornerRadius: { set: ["markerRadiusRadio", "markerRadiusCheckbox"] } },
          optional: true,
        },
        Check: { fields: { width: "checkInline", height: "checkBlock" }, optional: true },
      },
    },
  },
  {
    id: "record-card",
    figmaName: "RecordCard",
    figmaAhead:
      "React 표면 없음 — packages/css/src/component/record-card.css 의 .louis-record-card 가 정본이다(2026-10-07). 제품 작업 브랜치 feat/ambassador-links 의 어드민 세 파일(지원서 검토 · 문의 관리 · 청약철회)이 출처다.",
    variantProperties: {},
    // **선이 없다.** 줄의 아래 헤어라인 · 면 카드의 사방 헤어라인 · 상세 위 헤어라인이 전부 CSS `box-shadow: inset` 이라
    // Figma 도 inner shadow 로 그린다(DS-D-0023). 셰브런은 아이콘 인스턴스라 그 획은 icon 게이트가 본다.
    strokes: {},
    // `self` — 줄(base)은 hairline-inset-block-end(아래 -0.5), 면 카드(raised)는 hairline-inset(사방 0.5)이다. `Detail` — 상세 위
    // hairline-inset-block-start(+0.5). 채움이 없는 프레임에서는 Figma 가 inner shadow 를 그리지 않아 루트(base)와 Detail 에
    // 불투명도 0 의 운반 fill 이 있다 — 되읽기가 그 fill 을 세지 않으므로(색이 아니다) 바인딩 수에 들어가지 않는다.
    // 목록 첫 줄의 위 헤어라인(CSS `:first-child` 의 두 겹)은 변형으로 그리지 않는다 — 목록 위치는 화면이 정한다.
    effects: {
      self: ["INNER_SHADOW:-0.5:0:0", "INNER_SHADOW:0:0:0.5"],
      Detail: "INNER_SHADOW:0.5:0:0",
    },
    figmaOnlyProperties: {
      Layout: {
        options: ["base", "raised"],
        reason:
          "CSS `data-surface` 를 옮긴 축(figma-component-authoring.md §2 Layout — CSS 속성값을 그대로 옮기는 자리는 그 철자). 없음 = 면 없는 줄(문의 · 청약철회)이라 기본 갈래 이름 `base` 로, `raised` = bg-raised 면 + 사방 헤어라인 + 반경 radius-overlay 카드(지원서 검토)다. `Surface` 축이 아닌 이유 — 그 축은 아래 깔린 면의 밝기(light · dark)를 말하고, 이 갈래는 카드가 자기 면을 갖느냐다. 두 모양을 하나로 합칠지는 소유자 판정이 남아 있다(record-card.md Known deviations).",
      },
      Expanded: {
        options: ["false", "true"],
        reason:
          "코드에서 머리 버튼의 `aria-expanded`(또는 `details[open]`)가 펼침을 소유한다. 조건 축 명부의 `Expanded` 다 — FaqRow 와 같이 그 컴포넌트 자신이 자란다(80 → 상세만큼). 셰브런이 180° 돌고(계속 보이는 레이어의 회전 — 시험 1) 위 헤어라인 아래 Detail 이 선다.",
      },
      State: {
        options: ["Default", "Hover"],
        reason:
          "상호작용 상태. Hover 는 머리만 accent-ghost-hover 면이고 `@media (hover: hover)` 안에서만 걸린다(DS-D-0077). 카드에는 Disabled 선언이 없고 Focus 는 그리지 않는다(DS-D-0074). Expanded 와 곱한다 — 펼친 카드의 머리에도 호버 면이 선다.",
      },
      Title: { type: "TEXT", reason: "기록 이름. 코드에서는 `.louis-record-card__title` 의 텍스트다(말줄임)." },
      Note: { type: "TEXT", reason: "이름 옆 유형 · 구분. 코드에서는 `.louis-record-card__note` 의 텍스트다." },
    },
    geometry: {
      // **두 칸을 다 건다.** 루트의 기하를 다시 쓰는 축은 Layout 하나라 되읽기 키가 그 값이다. 기록의 값은 브라우저 실측이
      // 아니라 레시피 선언이고 verify-recipe-record 가 레시피 ↔ 기록을 맞댄다 — React 표면이 없어 component-geometry 브라우저
      // 시험이 이 칸을 되재지 않으므로 DS-D-0035 (c) 를 채우지 못한다(manifest Figma `partial`).
      measuredId: "record-card",
      sizeKeys: ["base", "raised"],
      fields: {
        // 카드 루트는 여백 · 간격이 없다 — 머리와 상세가 자기 여백을 갖는다.
        paddingBlock: { literal: 0 },
        paddingInline: { literal: 0 },
        itemSpacing: { literal: 0 },
        cornerRadius: "radius",
        layoutMode: { literal: "VERTICAL" },
      },
      slots: {},
      extraStrokeWeights: [],
      parts: {
        Head: {
          fields: {
            paddingBlock: "headPaddingBlock",
            paddingBlockEnd: "headPaddingBlock",
            paddingInline: "headPaddingInline",
            paddingInlineEnd: "headPaddingInline",
            itemSpacing: "headGap",
            layoutMode: { literal: "VERTICAL" },
          },
        },
        Top: { fields: { itemSpacing: "topGap" } },
        Meta: { fields: { itemSpacing: "metaGap" } },
        Title: { fields: { fontSize: "titleFontSize" } },
        Note: { fields: { fontSize: "noteFontSize" } },
        Chevron: { fields: { width: "chevronSize", height: "chevronSize" } },
        Sub: { fields: { itemSpacing: "subColumnGap", counterAxisSpacing: "subRowGap" } },
        SubItem: { fields: { fontSize: "subItemFontSize" } },
        // 상세 이하는 Expanded=true 칸에만 있다.
        Detail: {
          fields: {
            paddingBlock: "detailPaddingBlockStart",
            paddingBlockEnd: "detailPaddingBlockEnd",
            paddingInline: "detailPaddingInline",
            paddingInlineEnd: "detailPaddingInline",
            itemSpacing: "detailGap",
          },
          optional: true,
        },
        Grid: { fields: { gridColumnGap: "gridColumnGap", gridRowGap: "gridRowGap", layoutMode: { literal: "GRID" } }, optional: true },
        Label: { fields: { fontSize: "labelFontSize" }, optional: true },
        Value: { fields: { fontSize: "valueFontSize" }, optional: true },
        Actions: {
          fields: { itemSpacing: "actionsGap", paddingBlock: "actionsPaddingBlockStart", primaryAxisAlignItems: { literal: "MAX" } },
          optional: true,
        },
      },
    },
  },
  {
    id: "text-link",
    figmaName: "TextLink",
    figmaAhead:
      "React 표면 없음 — packages/css/src/component/text-link.css 의 .louis-text-link 가 정본이다(2026-10-07). 제품 작업 브랜치 feat/admin-ops-review 의 USER_LINK · RECEIPT 와 feat/deck 의 BACK_LINK 가 출처다.",
    variantProperties: {},
    // **선도 효과도 없다.** 글자 링크는 면 · 테두리 · 여백이 없는 한 줄의 글자다(레시피 `border: 0` · `background: transparent`).
    // 밑줄은 테두리가 아니라 글자 꾸밈이라 `Label` 의 textDecoration 으로 잰다(아래 기하).
    strokes: {},
    effects: {},
    figmaOnlyProperties: {
      Tone: {
        options: ["default", "inherit"],
        reason:
          "CSS `data-tone` 을 옮긴 축(figma-component-authoring.md §2 Tone — CSS 속성값을 그대로 옮기는 자리는 그 철자). 없음 = fg-secondary → 호버 fg-primary 라 기본 갈래 이름 `default` 로, `inherit` = 주변 잉크를 물려받아 호버에 밑줄만 선다(USER_LINK). Figma 는 상속을 그릴 수 없어 표 몸 칸의 잉크 fg-primary 로 대신 그린다 — 다른 자리에서는 인스턴스의 글자 색을 그 자리 잉크로 바꾼다.",
      },
      Underline: {
        options: ["hover", "none"],
        reason:
          "CSS `data-underline` 을 옮긴 축(figma-component-authoring.md §2 Underline). 없음 = 호버에 밑줄이 서서 `hover`, `none` = 밑줄 없이 색만 바뀌는 이동 링크(BACK_LINK)다. 계속 보이는 글자의 꾸밈이 바뀌므로 BOOLEAN 이 아니다(시험 1). `inherit × none` 은 호버가 아무것도 바꾸지 않아(색도 밑줄도 그대로) 세우지 않았다 — set 이 희소하다. `none` 을 남길지는 소유자 판정이다(text-link.md Known deviations).",
      },
      State: {
        options: ["Default", "Hover"],
        reason:
          "상호작용 상태. Hover 는 `@media (hover: hover)` 안에서만 걸린다(DS-D-0077). 레시피에 Disabled 선언이 없고 Focus 는 그리지 않는다(DS-D-0074).",
      },
    },
    // **TEXT 속성이 없다.** 글자는 인스턴스에서 Label 레이어를 바로 고친다 — TEXT 속성을 걸면 Figma 가 글자 꾸밈(밑줄)을
    // 속성 값과 함께 전 변형에 맞춰 Hover 만의 밑줄을 그릴 수 없었다(2026-10-08 실측: 한 변형에 밑줄을 걸자 여섯이 다 섰고,
    // 속성을 다시 걸자 다 지워졌다).
    geometry: {
      // **네 칸을 다 건다.** 기록의 값은 레시피 선언이고 verify-recipe-record 가 맞댄다 — React 표면이 없어 브라우저 시험이
      // 되재지 않으므로 DS-D-0035 (c) 를 채우지 못한다(manifest Figma `partial`).
      measuredId: "text-link",
      sizeKeys: ["hover/Default", "hover/Hover", "none/Default", "none/Hover"],
      fields: {
        paddingBlock: "paddingBlock",
        paddingBlockEnd: "paddingBlock",
        paddingInline: "paddingInline",
        paddingInlineEnd: "paddingInline",
        itemSpacing: { literal: 0 },
        layoutMode: { literal: "HORIZONTAL" },
      },
      slots: {},
      extraStrokeWeights: [],
      parts: {
        // 밑줄의 유무와 간격. 글자 크기는 재지 않는다 — 레시피가 글꼴을 쥐지 않는다.
        Label: { fields: { textDecoration: "textDecoration" } },
      },
    },
  },
  {
    id: "bare-button",
    figmaName: "BareButton",
    figmaAhead:
      "React 표면 없음 — packages/css/src/component/bare-button.css 의 .louis-bare-button · .louis-row-title 이 정본이다(2026-10-07). 제품 작업 브랜치 feat/admin-ops-review 의 ROW_TITLE(어드민 네 파일 복제)이 출처다.",
    variantProperties: {},
    // **선도 효과도 면도 없다.** 초기화 클래스가 하는 일이 UA 면(배경 · 테두리 · 여백)을 지우는 것이다(레시피 `border: 0` ·
    // `background: transparent` · `padding: 0`). 반경 4 는 강제 색에서 되살아나는 링의 모양이라 평소에는 보이지 않는다.
    strokes: {},
    effects: {},
    figmaOnlyProperties: {
      Layout: {
        options: ["base", "row-title"],
        reason:
          "CSS 클래스 둘을 옮긴 축(figma-component-authoring.md §2 Layout — CSS 이름을 그대로 옮기는 자리는 그 철자). `base` = `.louis-bare-button`(여백 0 · 테두리 0 · 투명 면 · 시작 정렬만 갖고 글꼴과 색은 소비처가 정한다 — Figma 는 body-sm-regular · fg-primary 로 대신 그린다), `row-title` = `.louis-row-title`(그 위에 반경 4 · body-sm-medium · fg-primary 를 이 클래스 자신이 갖는다, 코드에서는 display:block 이라 행 폭을 채운다). 같은 부품이 반경과 글자를 다시 쓰는 갈래라 Layout 이다 — 강조 단계가 아니어서 Variant 가 아니고, 크기 사다리가 아니어서 Size 가 아니다. 상태 축은 없다 — 레시피에 호버 · 비활성 선언이 없고(disabled 의 커서도 pointer) Focus 는 그리지 않는다(DS-D-0074).",
      },
      Label: { type: "TEXT", reason: "버튼 글자. 코드에서는 `<button class=\"louis-row-title\">` 의 텍스트다." },
    },
    geometry: {
      // **두 칸을 다 건다.** 루트의 기하를 다시 쓰는 축은 Layout 하나라 되읽기 키가 그 값이다. 기록의 값은 브라우저 실측이
      // 아니라 레시피 선언이고 verify-recipe-record 가 레시피 ↔ 기록을 맞댄다(row-title 의 반경 · 글자 크기) — React 표면이
      // 없어 브라우저 시험이 되재지 않으므로 DS-D-0035 (c) 를 채우지 못한다(manifest Figma `partial`).
      measuredId: "bare-button",
      sizeKeys: ["base", "row-title"],
      fields: {
        paddingBlock: "paddingBlock",
        paddingBlockEnd: "paddingBlock",
        paddingInline: "paddingInline",
        paddingInlineEnd: "paddingInline",
        itemSpacing: { literal: 0 },
        cornerRadius: "radius",
        layoutMode: { literal: "HORIZONTAL" },
      },
      slots: {},
      extraStrokeWeights: [],
      parts: {
        // 글자 크기. row-title 의 14 는 레시피 선언(body-sm-medium)이고, base 의 14 는 레시피가 쥐지 않는 대표값이다 —
        // 소비처의 type 클래스대로 인스턴스의 텍스트 스타일을 바꾼다.
        Label: { fields: { fontSize: "labelFontSize" } },
      },
    },
  },
  {
    id: "start-card",
    figmaName: "StartCard",
    figmaAhead:
      "React 표면 없음 — packages/css/src/component/start-card.css 의 .louis-start-card 가 정본이다(2026-10-07). 제품 작업 브랜치 chore/landing-dead-walkthrough 의 CanvasEmptyState.tsx CARD · CARD_BLUR · CARD_LABEL(CanvasEmptyState.tsx@d564ed435:138)이 출처다.",
    variantProperties: {},
    // **헤어라인은 루트의 INSIDE 획 0.5 다.** CSS 는 `::after` 의 `box-shadow: var(--louis-hairline-inset)` 이고 그 층이
    // **미디어 위에** 칠해진다(미디어가 카드 box-shadow 를 덮기 때문). Figma 의 INNER_SHADOW 는 프레임 면 위 · 자식 아래에
    // 그려져 Media 슬롯이 채워지면 가려지고, 프레임의 획은 자식 위에 그려진다 — 그래서 규범의 INNER_SHADOW 대신 획
    // (`border-width/hairline` · `color/stroke-hairline`)이다(start-card.md Figma 절).
    strokes: { self: { weight: 0.5, align: "INSIDE" } },
    // **위쪽 점진 흐림.** `--louis-progressive-blur`(blur-surface 10) + `--louis-progressive-blur-mask-block-start` — 위
    // 가장자리 0~55% 온전, 100% 에서 0. Figma 좌표는 위가 0 이라 흐림이 0 인 점(start)이 y=1, 온전해지는 점(end)이
    // y=0.55 다. 카드 정보 바(`--louis-progressive-blur-mask`, to top)의 대칭이다. 띠에 바탕색 · 틴트를 깔지 않는다 —
    // Figma 의 완전 투명 fill 하나는 배경 흐림이 렌더되려고 있는 것이고 되읽기가 색으로 세지 않는다.
    effects: {
      Blur: "BACKGROUND_BLUR:PROGRESSIVE:var(blur/surface):0:0.5,1:0.5,0.55",
    },
    figmaOnlyProperties: {
      Size: {
        options: ["sm", "md"],
        reason:
          "카드 폭의 컨테이너 질의(`@container louis-start-card (min-width: 240px)`)를 옮긴 축. sm = 폭 240 미만(이름 여백 14 · body-sm-semibold 14), md = 240 이상(여백 18 · body-md-semibold 16). 사다리 값과 순서가 같아(sm 이 작다) 쓰임새 이름을 열지 않았다. Figma 에 컨테이너 질의가 없어 폭에 따라 이름이 저절로 바뀌지 않으므로 축으로 둔다 — 대표 폭은 190(빈 캔버스 칸) · 320(제품 기준)이고 비율 320/403 이다. 반경 16 → 20(조상 컨테이너 600 이상)은 카드가 아니라 놓인 칸의 값이라 축이 아니다. 상태 축은 없다 — 호버에서 움직이는 것은 슬롯 안 미디어(제품 몫)와 `data-media-motion=\"zoom\"` 의 확대뿐이고 면 · 이름은 그대로다. Focus 는 그리지 않는다(DS-D-0074).",
      },
      Label: { type: "TEXT", reason: "카드 이름 한 줄(「이미지 생성」 · 「비디오 생성」). 코드에서는 `.louis-start-card__label` 의 텍스트이고 카드의 접근성 이름이다." },
    },
    geometry: {
      // **두 칸을 다 건다.** 기록의 값은 브라우저 실측이 아니라 레시피 선언이다 — React 표면이 없어 브라우저 시험이
      // 되재지 않으므로 DS-D-0035 (c) 를 채우지 못한다(manifest Figma `partial`). 폭 · 높이 · 블러 띠 높이는 담지 않는다 —
      // 폭은 칸이 정하고 띠는 폭의 26% 로 따라간다.
      measuredId: "start-card",
      sizeKeys: ["sm", "md"],
      fields: {
        cornerRadius: "radius",
        // 루트는 auto-layout 이 아니다 — 슬롯 셋이 모두 절대 배치(CSS `position: absolute`)이고 칠 순서가 트리 순서다.
        layoutMode: { literal: "NONE" },
      },
      slots: {},
      // 헤어라인 획 0.5(`border-width/hairline`). 기록에 borderWidth 칸이 없다 — CSS 는 border 가 아니라 `::after` 의
      // inset box-shadow 이고, 그 두께가 토큰 하나라 여기 예외로 적는다(위 `strokes.self` 의 사유).
      extraStrokeWeights: [0.5],
      parts: {
        // `.louis-start-card__label` 의 여백. Figma 는 Label 프레임(auto-layout)의 padding 으로 갖는다.
        Label: {
          fields: {
            paddingBlock: "labelPadding",
            paddingBlockEnd: "labelPadding",
            paddingInline: "labelPadding",
            paddingInlineEnd: "labelPadding",
            itemSpacing: { literal: 0 },
            layoutMode: { literal: "HORIZONTAL" },
          },
        },
        Name: { fields: { fontSize: "labelFontSize", lineHeightPercent: { literal: 150 } } },
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
    // **두 번 틀렸던 문장이다(2026-09-01 정정).** 「1px」도 「코드 선언이 없다」도 사실이 아니다 —
    // `menu-popover.css:240-250` 이 `block-size: var(--louis-border-width-hairline)`(0.5px)로 두께를,
    // `box-shadow: var(--louis-hairline-inset-block-start)` 로 선을 나눠 낸다(DS-D-0023). 1 은 제품이
    // `a3ed8e0` 에서 쓰던 값이고 `components.measured.json` 에도 그 값이 코드 실측 자리에 들어와
    // 있었다(같은 커밋에서 0.5 로 고쳤다).
    figmaAhead:
      "menu-popover.css:240-250 이 정본이다. 두께 0.5(border-width-hairline) + 방향성 inset 헤어라인 한 겹이라 " +
      "variant 축이 없다. 라이브 Figma 도 같은 커밋에서 높이 0.5 · fill color/stroke-hairline 으로 옮겼고 " +
      "되읽기가 그 값을 담는다 — DS-D-0023 §7 의 「실측 두께 토큰은 0.5 로 유지한다」와 맞는다. " +
      "아래 geometry 가 그 축을 게이트로 잡는다.",
    variantProperties: {},
    figmaOnlyProperties: {},
    // **두께를 계약에 붙인다(2026-09-01).** 이 계약은 그동안 geometry 가 없어 Figma 가 1 을
    // 그리든 0.5 를 그리든 초록이었다 — 실제로 1 이었고 넷 중 어느 게이트도 잡지 못했다.
    // 폭 200 은 담지 않는다. CSS 에 inline-size 선언이 없고(패널이 폭을 정한다) Figma 의 200 은
    // 정지 상태를 그리려고 세운 표본 치수다 — `unverified-value-map.json` 의
    // `skeleton.sizes.text.width` 가 같은 이유로 `product-none` 이다.
    geometry: {
      measuredId: "menu-popover",
      sizeKey: "panel",
      fields: {
        height: "separatorWidth",
        layoutMode: { literal: "NONE" },
      },
      slots: {},
      extraStrokeWeights: [],
    },
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
    // 포커스 링은 그리지 않는다(DS-D-0074, 2026-10-06). Focus 변형과 그 바깥 stroke(FocusRing)가
    // Figma 에서 없어졌으므로 이 세트에는 stroke 역할이 없다.
    strokes: {},
    effects: {},
    figmaAhead: "세그먼트 하나를 Figma 에서 별도 set 으로 뽑았다 — 상호작용과 프로토타입을 받는 단위다. 코드에서는 SegmentedControl 안의 label 이라 독립 선언이 없다.",
    variantProperties: {},
    // **기하를 붙인다(2026-09-01).** SegmentedControl 계약이 「기하 대조는 세그먼트 쪽이 갖는다」고
    // 위임하고 있었는데 **받는 쪽이 비어 있었다** — 두 계약 다 geometry 가 없어 lg·md·sm·xs 네 칸이
    // 통째로 대조 밖이었다. 위임 문장을 참으로 만든다.
    //
    // 여기서 대조하는 것은 **lg·md 둘뿐이고, 그 둘은 이미 맞는다**(measured segmentHeight/Radius/
    // PaddingInline = 32/8/12 · 24/8/8, Figma 도 같다). 나머지 둘은 값 판정이 선행한다:
    //   · `sm` — measured 에 있고(20/6/8) CSS·React·브라우저 테스트도 판다. **Figma Item 에만 없다**
    //     (18변형 = lg·md·xs × 6상태). 여기 넣으면 「기하가 snapshot 에 없습니다」가 되므로 뺐다 —
    //     Figma 에 sm 여섯 변형을 세우는 것이 닫는 방법이다.
    //   · `xs` — measured 에 아예 없다(인스펙터 전용 지역 예외라 계약을 세운 적이 없다). 게다가
    //     세 곳이 갈린다: 제품 정본(`migration/product-screens/10.10.md:823-824`)이 세그먼트 22/r8/
    //     padding 0 10, CSS 가 22/r7(트랙 10 − padding 3 파생식)/padding-inline 8, Figma Item 이
    //     **28**/r8/8 이다. Figma 의 28 은 트랙 높이를 그대로 쓴 것이라 padding 3 과 양립하지 않는다.
    //     값을 고르는 것은 DS-D-0032 가 미결로 남긴 판정에 딸린 일이라 여기서 열지 않는다.
    // **`settings` 를 붙인다(2026-09-03).** 소유자가 「제품의 36 이 정본」이라고 판정해
    // DS-D-0048 의 미결이 닫혔고, CSS·React·measured 에 그 칸이 섰다. 여기 넣는 이유는
    // 하나다 — 넣지 않으면 새 칸이 **게이트 밖에서** 산다. 위 sm 의 사연이 그것을 보여 준다:
    // 값은 CSS·React·브라우저 테스트에 다 있는데 Figma Item 에만 없어 계약에서 뺐고, 그
    // 상태가 계속 부채로 남았다. `settings` 는 Figma 변형을 함께 세워 그 길을 피한다.
    geometry: {
      measuredId: "segmented-control",
      sizeKeys: ["lg", "md", "settings"],
      fields: {
        height: "segmentHeight",
        cornerRadius: "segmentRadius",
        paddingInline: "segmentPaddingInline",
        paddingInlineEnd: "segmentPaddingInline",
        paddingBlock: { literal: 0 },
        paddingBlockEnd: { literal: 0 },
        layoutMode: { literal: "HORIZONTAL" },
      },
      slots: {},
      parts: {
        // 라벨 **폭은 담지 않는다** — 글꼴 렌더링에 달려 있어 브라우저와 Figma 가 원래 다르다
        // (`components.measured.json` 의 `$whyNotTextWidth` 와 같은 이유).
        Label: { fields: { height: "lineHeight", fontSize: "fontSize" } },
      },
      // 포커스 링의 2px 를 여기 적어 두던 자리다. DS-D-0074 로 링이 없어져 두께도 없다.
      extraStrokeWeights: [],
    },
    figmaOnlyProperties: {
      Label: { type: "TEXT", reason: "세그먼트 라벨." },
      Size: {
        options: ["lg", "md", "xs", "settings"],
        reason:
          "컨트롤의 size 를 세그먼트가 물려받는다. `sm` 은 여전히 빠져 있다 — 코드에는 있고 " +
          "Figma Item 에만 없는 부채이고, 위 geometry 주석이 그 사연을 갖는다.",
      },
      State: {
        options: ["Default", "Hover", "Selected", "Disabled", "SelectedDisabled"],
        reason: "segmented-control.css. hover 는 글자색만, selected 는 면+글자, disabled 는 글자만 흐리게. Focus 는 없다 — 포커스 링을 그리지 않아 Default 와 같다(DS-D-0074).",
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
    id: "menu-popover",
    figmaName: "MenuTrigger",
    declaration: "packages/react/dist/menu/trigger.d.ts",
    // **패널을 여는 컨트롤의 시각 정본.** 이 저장소에는 표면(MenuPanel·CompositePopover)과
    // 항목(Menu)만 있고 그것을 여는 자리가 없었다 — `AnchoredTrigger` 는 aria 배선만 하는
    // headless 래퍼라 그릴 것이 없다. 제품 랜딩 `LanguageSelector` 가 그 빈자리를 자기 파일에서
    // 다시 그리고 있었고 옆의 `ThemeSelector` 가 그 상수를 import 해 간다(소비처 둘).
    //
    // **크기 축이 없다.** 높이가 32 하나이고 그것은 이미 컨트롤 사다리의 md 칸이다(DS-D-0027).
    // **셰브론도 없다** — 앵커(제품 5a67d692)의 트리거가 그리지 않는다. 옛 모듈 CSS 의
    // `.chevron` 은 「이 TSX 가 참조하지 않는 미사용 클래스」라고 그 파일의 이관 주석이 적는다.
    variantProperties: {},
    propProperties: { Value: "value" },
    figmaOnlyProperties: {
      State: {
        options: ["Default", "Hover", "Open"],
        reason:
          "Hover 는 코드에서 CSS 상태이고 Open 은 `aria-expanded=\"true\"` 가 만드는 지속 상태다(prop 이 아니라 패널이 열려 있다는 사실이다). Figma 에는 둘 다 없으므로 한 축으로 둔다. 면은 둘 다 ghost 8% 로 같고 뜻이 다르다 — 열려 있는 동안 면을 유지하지 않으면 포인터가 패널로 넘어간 순간 「무엇이 열려 있는지」가 화면에서 사라진다.",
      },
    },
    strokes: {},
    effects: {},
    geometry: {
      measuredId: "menu-popover",
      sizeKey: "trigger",
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
        // 글리프 자리. Menu 항목의 `Icon` 과 같은 기법이다 — 빈 프레임이 슬롯이고 원시 fill 이
        // 없다. 제품 compact 트리거의 20px 이 그 크기다.
        Glyph: { fields: { width: "iconSize", height: "iconSize" } },
      },
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
    // **LabelBehavior 는 figmaOnlyProperties 가 아니라 여기 있다.** 코드에 `TextFieldLabelBehavior`
    // 유니온이 실재하므로 게이트가 옵션 집합을 글자 그대로 대조할 수 있고, figmaOnly 로 빼는 것은
    // 「코드에 대응이 없는 축」의 자리라 사실을 왜곡한다 — DS-D-0041 이 Dialog 의 Tone 에서 같은
    // 판정을 내렸다 (DS-D-0049).
    // `Join` 도 같은 자리다 — 코드에 `TextFieldJoin` 유니온이 실재하므로 옵션 집합을 글자
    // 그대로 대조한다. `none` 이 유니온에 있는 이유는 그것이 **기본값이라는 사실 자체가
    // 계약**이기 때문이다 — 없으면 Figma 의 「결합하지 않음」 칸이 코드에 대응 없는 축이 된다
    // (DS-D-0052).
    variantProperties: {
      Size: "TextFieldSize",
      LabelBehavior: "TextFieldLabelBehavior",
      Join: "TextFieldJoin",
    },
    figmaOnlyProperties: {
      HasLabel: { type: "BOOLEAN", reason: "라벨 없는 필드가 실재한다 — 검색창이 그것이다." },
      HasMessage: { type: "BOOLEAN", reason: "도움말·오류 문구의 유무. 있고 없고에 따라 아래 여백이 달라진다." },
      Value: { type: "TEXT", reason: "코드에서 children이라 타입 선언에 항목으로 나타나지 않는다(React가 준다)." },
      State: {
        options: ["Default", "Invalid", "Disabled", "Placeholder"],
        reason:
          "Invalid/Disabled는 boolean prop이다. Focus 는 없다 — 포커스 링을 그리지 않아 Default 와 같다(DS-D-0074). Figma에는 CSS 상태가 없어 variant로 둔다. Hover 축은 없다 — 필드는 hover에서 아무것도 바꾸지 않는다. Placeholder는 값이 비어 있는 쉼 상태다 — 코드에서는 :placeholder-shown 이라 prop이 아니고, 디자이너가 「빈 필드」를 그리려면 Figma에 자리가 있어야 한다.",
      },
    },
    // 보이는 테두리는 Box가 갖는다. root(component set)에는 stroke가 없다.
    // **굵기가 둘이다(2026-10-07, DS-D-0075).** 기본 · 잠김 · 빈 칸은 헤어라인 0.5, 오류 칸은 ring 두께 2 의
    // `fg-danger-on-surface` 다. 배열은 「변형마다 이 중 하나」라 어느 칸이 2 인지는 브라우저 시험이 잰다.
    strokes: { Box: { weight: [0.5, 2], align: "INSIDE", reason: "기본 · 잠김 · 빈 칸은 헤어라인 0.5, 오류 칸은 DS-D-0075 의 ring 두께 2 위험색 링이다." } },
    effects: {},
    geometry: {
      measuredId: "input",
      // sizeKey를 두지 않는다 — measured의 키를 그대로 돈다. 그 키는 이제 `{Size}/{LabelBehavior}`
      // 복합이고(`lg/stacked` · `md/stacked` · `sm/stacked` · `lg/floating`), 되읽기도 같은
      // 축으로 담는다(figma-readback-emit.mjs 의 key.by). floating 이 lg 에만 있으므로 격자는
      // 넷이다 — 조합을 전수로 채우지 않는다 (DS-D-0049).
      //
      // **결합 축은 키에 칸을 하나 더 붙인다 — `Join=none` 일 때만 빼고.**
      // `lg/floating/start` · `/middle` · `/end` 셋이 그것이고, 결합하지 않은 네 키는 글자
      // 그대로 그대로다. 축을 통째로 키에 넣었다면 네 키가 전부 개명돼 계약·브라우저
      // 테스트·제품 대조 핀(measure-product-components.mjs)까지 따라 움직였을 것이다.
      // 되읽기 쪽의 같은 규칙은 `key.omit` 이다 (DS-D-0052).
      fields: {
        // **프레임 폭이 계약에 들어온다.** measured 가 328 을 `$frameWidth` 사유(focus 링 4px이
        // 잘리지 않게 프레임을 넓힌다)와 함께 갖고 있었는데 **어느 게이트도 재지 않았다** —
        // 링을 안으로 당기는 회귀가 조용히 통과했을 자리다.
        width: "frameWidth",
      },
      slots: {},
      // Focus 링의 2px 를 적어 두던 자리다. DS-D-0074 로 Focus 변형과 링이 없어졌고, DS-D-0075 로 오류 칸의
      // 2px 위험색 링이 같은 굵기로 돌아왔다.
      extraStrokeWeights: [2],
      parts: {
        Box: {
          fields: {
            height: "height",
            // **프레임이 박스보다 좌우 4씩 넓다 — focus 링이 잘리지 않게.** 이 줄은 원래 바로
            // 위에 `Box: { fields: { width: "boxWidth" } }` 로 따로 서 있었는데, 같은 객체에
            // `Box` 키가 둘이라 **먼저 쓴 쪽이 조용히 버려지고 있었다.** measured 는 세 칸
            // 모두 `boxWidth` 320 을 `$boxWidth` 사유와 함께 갖는데 그 값이 어디서도 대조되지
            // 않았다. 한 키로 합쳐 되살린다 (DS-D-0049).
            width: "boxWidth",
            // Figma 에는 자식 margin 이 없다. CSS 는 위 여백 12 + control 의 margin 8 로
            // 라벨 행을 만드는데, Figma 는 그 둘을 Box 의 paddingTop 하나에 접어 20 으로
            // 그린다. 그 접기를 계약이 선언한다 — stacked 은 두 항이 다 0 이라 0 이다.
            paddingBlock: ["paddingBlock", "labelRow"],
            paddingBlockEnd: "paddingBlock",
            paddingInline: "paddingInline",
            paddingInlineEnd: "paddingInline",
            itemSpacing: "gap",
            // **모서리를 둘로 나눠 본다.** 결합 칸은 맞닿는 변의 곡률을 펴므로 네 모서리가
            // 갈리고, 그러면 Figma 의 `cornerRadius` 가 `mixed` 가 되어 되읽기에 빈 값으로
            // 떨어진다 — 그 칸의 곡률이 아무것과도 대조되지 않는다. Dialog 가 sheet 때문에
            // 같은 모양을 먼저 세웠다. 좌우는 대칭이므로 왼쪽 두 모서리만 건다 (DS-D-0052).
            topLeftRadius: "radius",
            bottomLeftRadius: "radiusBottom",
            layoutMode: { literal: "HORIZONTAL" },
          },
        },
        // **한 축이 이 필드를 바꾸는 것이 계약이다.** floating 에서 라벨은 쉴 때 14, 떠오르면
        // 12 이고 되읽기는 size 별로 값을 모으므로 한 칸에 둘이 함께 담긴다. stacked 은 두
        // 근거가 같은 값이라 집합이 {14} 하나로 접힌다.
        Label: { fields: { fontSize: { set: ["labelFontSize", "labelFloatedFontSize"] } } },
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
      // 접힘이 축이다 — 되읽기도 map 으로 이 두 이름에 맞춰 담는다.
      sizeKeys: ["navItem", "navItemCollapsed"],
      fields: {
        height: "height",
        itemSpacing: "gap",
        cornerRadius: "radius",
        // 좌우가 갈렸다 — 배포본이 시작 8 · 끝 4 를 쓴다(app-shell.css 의 사유 참조).
        paddingInline: "paddingInlineStart",
        paddingInlineEnd: "paddingInlineEnd",
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
        // 두 슬롯 모두 높이를 선언하지 않고 담은 것을 hug 한다(app-shell.css 의 같은 규칙). 선행은 사이드바 토글 —
        // IconButton md 칸이라 그 기록에서 읽는다(components.measured.json 의 app-shell-parts.sizes.topBar.$leadingSlot).
        Leading: { fields: { height: { from: ["icon-button", "md", "height"] } } },
        // 후행 슬롯은 높이를 선언하지 않고 담은 ProgressRing 을 hug 한다 — 수를 이 기록에 사본으로 두지 않고
        // ProgressRing 기록에서 읽는다(components.measured.json 의 app-shell-parts.sizes.topBar.$trailingSlot).
        Trailing: { fields: { height: { from: ["progress-ring", "base", "size"] } } },
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
    //
    // **이 위임은 2026-09-01 까지 받는 쪽이 비어 있었다.** SegmentedControlItem 계약에도 geometry 가
    // 없어 두 계약을 합쳐도 대조되는 칸이 0 이었다. 지금은 Item 이 lg·md 를 대조한다(그 주석에
    // sm·xs 를 왜 못 넣는지 적었다). 트랙 자신의 축(trackHeight·trackPadding·trackRadius)은 여전히
    // 어느 계약도 보지 않는다 — 라이브 xs 트랙이 padding 4 · radius 12(= md 값)라 CSS 의 3 · 10 과
    // 어긋나 있고, 그것을 게이트로 올리려면 measured 에 xs 단을 세우는 판정이 먼저다.
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
          "코드에서 selected는 boolean prop이고 disabled는 <button>의 네이티브 속성이다. Figma에는 boolean 상태의 시각 표현이 없어 variant로 둔다. Default와 Selected를 가르는 것은 면과 전경이다 — 선행 표식은 없다(DS-D-0070).",
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
        // 선행 표식(Marker)은 걷었다(DS-D-0070). 선택은 면이 갖고, 그 값은 states 가 대조한다.
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
        options: ["Disabled", "Default"],
        reason:
          "Disabled는 prop이다. Hover 축은 없다 — 트랙은 hover에서 바뀌지 않는다. Focus 는 없다 — 포커스 링을 그리지 않아 Default 와 같다(DS-D-0074).",
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
        //
        // **`md/track`에서만 레일이 컨트롤보다 두껍다** — railHeight 20 > height 16. 두 값 다
        // 계약이고(막대는 제품 인스펙터 실측, 컨트롤 16은 slider.md가 미결로 갖는 리터럴) 어느
        // 쪽도 여기서 못 바꾼다. 그 결과 Figma에서 막대가 프레임 밖으로 (20 − 16) / 2 = 2px
        // 아래로 나갔고, 컨트롤 프레임이 `clipsContent`라 실제로 잘려 보였다(2026-09-01 실측:
        // 세 State 전부). 라이브를 고쳤다 — 컨트롤의 클립을 끄고 변형 프레임에 아래 padding 2를
        // 줘서 막대의 삐져나온 만큼을 프레임이 품는다. 그래서 `md/track`만 높이가 41이 아니라
        // 43이다. 이 계약은 프레임 높이도 padding도 보지 않으므로 여기서 걸리지 않는다.
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
        // 행은 레일 내용 폭을 채운다(app-shell.css `.louis-sidebar-nav-row` `inline-size: 100%`). 기록의 256 은 브랜드 · CTA 와
        // 같은 계산값 사본이라 수를 지웠다(2026-09-15) — 표본 폭은 DS 레일 내용 폭과 맞댄다.
        width: { field: "width", fillIn: ["navRow"], fill: "rail-content" },
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
        // 펼친 폭은 레일 내용 폭을 채우는 계산값이라 기록에 수가 없다(`$width`). Figma 펼친 variant 의 폭은 DS 레일 내용 폭
        // (레일 폭 토큰 − 레일 패딩 토큰 × 2)과 맞댄다 — 토큰이 움직이면 표본도 옮길 자리로 빨개진다.
        width: { field: "width", fillIn: ["false"], fill: "rail-content" }, height: "height", cornerRadius: "radius",
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
        options: ["Hover", "Current", "Default"],
        reason:
          "CSS 상태(hover)와 현재 위치(current)를 한 축에 합쳤다. Figma에는 CSS 상태가 없다. Focus 는 없다 — 포커스 링을 그리지 않아 Default 와 같다(DS-D-0074).",
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
        // 펼친 폭은 레일 내용 폭을 채우는 계산값이라 기록에 수가 없다(`$width`) — Figma 표본은 DS 레일 내용 폭과 맞댄다.
        // 접힌 32 는 제품 선언이라 기록의 수와 대조한다.
        // **높이는 하한이다(2026-10-06, 크기 굳힘 감사 묶음 8).** 기록의 `height` 는 측정기가 `min-height` 를 읽은 값이고
        // (`$height` 「최소 높이다 — 실효 높이가 아니다」), 펼친 버튼의 실효 높이는 패딩 10 + 줄 높이 21 + 패딩 10 = 41 이다.
        // Figma 펼친 variant 가 높이를 FIXED 40 · 라벨 TRUNCATE 로 굳혀 두 칸이 같은 수로 맞던 것을 HUG + minHeight 40 으로
        // 풀었으므로, 대조도 「최소값 이상」으로 바꾼다. 패딩 · 라벨 폭은 따로 맞대므로 높이가 떠다니지 않는다.
        width: { field: "width", fillIn: ["false"], fill: "rail-content" }, height: { atLeast: "height" }, cornerRadius: "radius",
        paddingInline: "paddingInline", paddingInlineEnd: "paddingInline",
        paddingBlock: "paddingBlock", paddingBlockEnd: "paddingBlock",
        itemSpacing: "gap",
        layoutMode: { literal: "HORIZONTAL" },
      },
      slots: {},
      // Focus variant 의 링 2px 를 적어 두던 자리다. DS-D-0074 로 Focus 변형과 링이 없어졌다.
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
    // **layout 축이 열렸다(2026-09-06).** 강조 축은 여전히 없다 — 세 값은 "더/덜 강한 것"이
    // 아니라 **서로 다른 자리**다(페이지 본문 · 카드 안 · 작업 표면 위). 근거는 계약의
    // `$note`가 이미 갖고 있던 문장이다: 아홉 벌이 합의하는 것은 "면을 갖지 않는다" 하나뿐이고,
    // 그 합의는 **집계 안에서만** 참이다. 집계 밖 두 정의(AnalyticsStatePanel · CanvasEmptyState)는
    // base로 그릴 수 없다.
    variantProperties: { Layout: "EmptyStateLayout" },
    // **면은 compact에서만 생긴다.** base는 제품 9벌이 합의한 대로 stroke가 없고 canvas도 없다 —
    // 되읽기가 stroke를 담는 자리에 compact 한 칸만 나타나는 것이 계약이다. 두께를 measured
    // 키가 아니라 숫자로 적는 이유는 compareComponentStrokes가 기호 참조를 **첫 size**
    // (여기서는 base, borderWidth 0)로만 푸는데 그 값은 이 역할의 근거가 아니기 때문이다.
    // 값 1의 정본은 `sizes.compact.borderWidth`이고, 그 칸이 바뀌면 아래 geometry의
    // allowedWeights가 Figma의 1을 거부해 게이트가 문다.
    strokes: { self: { weight: 1, align: "INSIDE" } },
    effects: {},
    geometry: {
      measuredId: "empty-state",
      // 세 칸을 전부 건다. `sizeKey` 하나로 두면 새로 연 두 칸은 Figma가 무슨 값을 그리든
      // 초록이고, verify-figma-done의 "대조 범위 밖" 검사가 그 상태를 잡는다.
      sizeKeys: ["base", "compact", "canvas"],
      fields: {
        // Figma padding = CSS padding + borderWidth (이 파일 `$borderWidthNote`). base·canvas는
        // 테두리가 0이라 합이 항등이고, compact만 20 + 1 = 21이 된다.
        paddingBlock: ["paddingBlock", "borderWidth"],
        paddingBlockEnd: ["paddingBlock", "borderWidth"],
        paddingInline: ["paddingInline", "borderWidth"],
        paddingInlineEnd: ["paddingInline", "borderWidth"],
        itemSpacing: "gap",
        cornerRadius: "radius",
        // 정렬이 이 축에서 가장 눈에 띄는 값이다 — compact만 왼쪽에서 시작한다.
        counterAxisAlignItems: {
          enum: "align",
          table: { center: "CENTER", "flex-start": "MIN" },
        },
        layoutMode: { literal: "VERTICAL" },
      },
      slots: {},
      // canvas 의 카드 줄에 선 StartCard 인스턴스 둘의 헤어라인 획 0.5(2026-10-08). 되읽기는 instance 노드 자신의 획을
      // 세고 안으로는 들어가지 않으므로 이 값이 canvas 칸에 잡힌다 — 그 값은 StartCard 계약이 소유한다.
      extraStrokeWeights: [0.5],
      parts: {
        // **자손 셋이 layout마다 사라진다.** compact은 제목·본문 2슬롯이고(제품의 그 자리에
        // 그림도 버튼도 없다) canvas는 설명이 없다. `optional`은 **근거 값이 함께 없을 때만**
        // 통과하므로, 값을 남겨 둔 채 Figma에서 자손만 지우는 길은 없다.
        Graphic: { optional: true, fields: { width: "graphic", height: "graphic" } },
        Title: { fields: { fontSize: "titleFontSize" } },
        Description: { optional: true, fields: { fontSize: "descriptionFontSize" } },
        // CSS는 액션에 `margin-block-start: 4px`를 더해 앞 요소와 16px 떨어진다. Figma
        // auto-layout에는 자식별 간격이 없어 같은 4px을 이 프레임의 위쪽 padding으로 만든다.
        // canvas는 그 추가 간격이 0이다 — 제품이 제목과 버튼을 같은 gap으로 둔다.
        // **canvas 에는 `Action` 이 둘 선다(2026-10-07).** 생성 카드 줄과 글자 단추 줄이 둘 다 같은 `__action` 슬롯이라
        // 이름이 같고, 되읽기가 두 프레임의 값을 한 칸에 모으므로 두 줄이 같은 간격·추가 간격을 가져야 초록이다.
        // 카드 줄 안의 격자(칸 사이 4)는 소비처 몫이라 이 계약 밖이며, Figma 의 카드 둘은 StartCard `Size=sm` 인스턴스다
        // (2026-10-08 — 자리표시 프레임을 바꿨다). 카드 값은 StartCard 계약이 소유한다.
        Action: {
          optional: true,
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
    // **DropZone(2026-09-26 신설).** 제품에 공용 구현이 없고(하이라이트 지역 레시피) 기하만 옮겼다 — design/components/drop-zone.md.
    figmaOnlyProperties: {
      State: {
        options: ["Default", "Hover", "DragOver", "Disabled"],
        reason:
          "Hover 는 CSS 상태, DragOver 는 끌어다 놓는 동안의 `data-drag-over`, Disabled 는 prop 이다. Figma 에는 CSS 상태가 없어 " +
          "Button 의 State 와 같은 이유로 variant 로 둔다. Focus 는 전역 링(`louis-focus-ring`)이 소유해 Button 처럼 variant 로 두지 않는다.",
      },
      HasGraphic: { type: "BOOLEAN", reason: "글리프 없는 업로드 면이 있다 — 제품의 프로젝트 상세 업로드 대기는 글리프를 넣지 않는다." },
      HasCaption: { type: "BOOLEAN", reason: "조건을 적을 것이 없는 업로드 면에는 보조 문구를 두지 않는다." },
    },
    id: "drop-zone",
    figmaName: "DropZone",
    iconSlots: ["Glyph"],
    propProperties: { Glyph: "graphic", Prompt: "prompt", Caption: "caption" },
    declaration: "packages/react/dist/drop-zone/drop-zone.d.ts",
    variantProperties: {},
    // **획은 DragOver 한 칸에만 있다.** CSS 는 안쪽 그림자(`inset 0 0 0 border-width-ring stroke-focus`)로 레이아웃을
    // 흔들지 않고, Figma 는 같은 뜻을 INSIDE 획 2 로 옮기고 `strokesIncludedInLayout = false` 로 둔다. 두께의 정본은
    // 토큰 `border-width-ring` 이고 measured `states.base.DragOver.ring` 이 그 역할을 적는다.
    strokes: { self: { weight: 2, align: "INSIDE" } },
    effects: {},
    geometry: {
      measuredId: "drop-zone",
      sizeKey: "base",
      fields: {
        paddingBlock: "paddingBlock",
        paddingBlockEnd: "paddingBlock",
        paddingInline: "paddingInline",
        paddingInlineEnd: "paddingInline",
        itemSpacing: "gap",
        cornerRadius: "radius",
        counterAxisAlignItems: { literal: "CENTER" },
        layoutMode: { literal: "VERTICAL" },
      },
      slots: {},
      // DragOver 의 안쪽 링(`border-width-ring` 2) — 테두리(borderWidth 0)가 아니라 상태 표시라 허용 집합에 따로 둔다.
      extraStrokeWeights: [2],
      parts: {
        Graphic: { fields: { width: "graphic", height: "graphic" } },
        Prompt: { fields: { fontSize: "promptFontSize" } },
        Caption: { fields: { fontSize: "captionFontSize" } },
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
        options: ["Default", "Hover", "Renaming"],
        reason:
          "더보기 버튼이 **호버에서만 드러난다** — `.louis-project-card-more`는 `opacity: 0`이고 " +
          "`.louis-project-card:hover`와 `:focus-within`이 1로 올린다(project-card.css:322·331·342). " +
          "Figma에는 CSS 상태가 없으므로 Button의 State와 같은 이유로 variant로 둔다. " +
          "축이 없으면 기본 변형 하나만 남는데, 그러면 **더보기 버튼이 있다는 사실 자체를 볼 수 없다** — " +
          "항상 보이게 그리면 반대로 거짓이 된다. 2026-08-26 소유자 지적으로 추가했다. " +
          "`Renaming`은 2026-09-03에 붙였다(DS-D-0050) — `ProjectCardRename`이 CSS와 React에는 " +
          "있는데 Figma에는 **부품 자체가 없었고**, 그래서 시안에서는 카드에 이름을 바꾸는 자리가 " +
          "있다는 사실을 볼 수 없었다. 코드에 `ProjectCardRename`이 실재하지만 그것은 **부품이지 " +
          "variant prop이 아니다** — 카드의 타입 alias에서 읽어 낼 축이 없으므로 여기 " +
          "figmaOnly로 둔다(DS-D-0041 Consequences).",
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
        // **`State=Renaming`에만 있는 자손이다.** 되읽기는 값을 배열로 모으므로 한 변형에만
        // 있어도 길이 1이 되고, 세 변형이 같은 `base` 키에 담기므로 여기 한 줄로 대조된다.
        //
        // 2026-09-03 소유자 판정으로 **밑줄형이 정본이 됐다**(DS-D-0051). 그래서 대조가 반경
        // 하나에서 셋으로 는다 — 반경 0, 글자와 선 사이 여유 2(auto-layout의 itemSpacing),
        // 그리고 선 자체의 두께 1(아래 `Underline`).
        //
        // **선을 stroke가 아니라 면으로 그리는 이유**는 되읽기에 있다. Figma에서 한 변만
        // stroke를 두면 `node.strokeWeight`가 `figma.mixed`가 되고, emitter가
        // `typeof node.strokeWeight === "number"`로 거른다(figma-readback-emit.mjs:447).
        // 그러면 선이 그려져 있어도 스냅숏에 아무 값도 남지 않아 **어느 게이트도 그것을 보지
        // 못한다.** 높이 1의 면은 `parts`로 그대로 잡히고 root의 헤어라인 계약
        // (`strokeWeight: [0.5]`)도 건드리지 않는다 — DS-D-0050이 초점 링을 stroke로 그리지
        // 않기로 한 것과 같은 자리다.
        Rename: {
          fields: {
            cornerRadius: "renameRadius",
            itemSpacing: "renameUnderlineGap",
          },
        },
        Underline: { fields: { height: "renameUnderlineWidth" } },
        Thumbnail: {},
      },
      // 자식 순서가 계약이다 — 슬롯이 클릭 타깃 앞에 오면 슬롯 안의 컨트롤이 눌리지 않는다.
      childOrder: ["Media", "Action", "Adornment"],
    },
  },
  {
    id: "canvas-edge",
    figmaName: "CanvasEdge",
    figmaAhead:
      "LOUIS recipe 없음 — 제품 apps/web/components/scenes/create/node-canvas-v2/edges/V2EdgeLayers.tsx 가 정본이고, 톤 어휘의 실행 가능한 SSOT 는 같은 폴더의 lib/edgeTone.ts 다. 손으로 복제된 사본이 일곱 벌이라 정본을 세우는 것이 이 컴포넌트의 내용이다.",
    variantProperties: {},
    // **엣지의 획은 테두리가 아니라 그림이다.** 그래서 되읽기의 strokeWeight 집합은 비어 있고
    // (채취 규칙 3 이 VECTOR 를 뺀다) 두께는 역할로만 담긴다. align 이 CENTER 인 것도 같은
    // 이유다 — SVG stroke 는 경로 위에 가운데 정렬되며 CarouselArrow 의 캐럿과 같은 자리다.
    strokes: { Line: { weight: "strokeWidth", align: "CENTER" } },
    // **glow 를 담지 않는다.** 제품은 쉬머에 톤별로 다른 반경의 drop-shadow 를 건다
    // (components.measured.json 의 canvas-edge.$glowNote). 되읽기의 effect 역할은 자손 이름
    // 하나에 값 하나이고 변형마다 다른 값을 담을 자리가 없어, 한 값으로 적으면 일곱 톤 중
    // 여섯을 거짓으로 고정한다. 그래서 Figma 에 glow 를 두지 않았고 계약도 비운다.
    effects: {},
    figmaOnlyProperties: {
      Tone: {
        options: ["default", "image", "text", "youtube", "instagram", "edit", "audio"],
        reason:
          "코드에서 V2EdgeTone 문자열 union 이지만 그 선언이 LOUIS 가 아니라 제품에 있어 variantProperties 로 대조할 수 없다. 톤은 그 핸들에 꽂히는 **엣지의 채널**이지 노드 타입이 아니다 — 그래서 video 칸이 없다(비디오는 매체이고, edit 입력에 도착하면 edit 채널, publish 노드로 나가면 youtube/instagram 채널이다). instagram 은 지금 youtube 와 같은 색으로 끝나지만 채널 토큰이 둘이라 칸을 접지 않는다.",
      },
      State: {
        options: ["Default", "Hover"],
        reason:
          "Hover 는 코드에서 CSS 상태가 아니라 DeletableEdge 의 hovered state 이고 Figma 에 상태가 없어 축으로 둔다. **일곱 톤 중 넷만 색이 바뀐다** — default·image·text 는 제품이 hover 에 획 색을 바꾸지 않아 두 칸의 값이 같고, 그것이 결손이 아니라 실측이라는 것을 components.measured.json 의 states 가 null 로 적어 고정한다(Alert 의 inline 네 톤과 같은 문법).",
      },
    },
    // **기하 계약이 시편 치수인 것은 이 컴포넌트의 성질이다.** 엣지의 좌표는 두 핸들이 정하는
    // 데이터라 계약이 될 수 없고, 계약이 되는 것은 획 두께와 톤 어휘다. 시편 치수를 그래도
    // 대조하는 이유는 프레임이 흔들리면 Line 이 프레임 밖으로 새고(overflowingParts) 인스턴스가
    // 잘려 보이기 때문이다 — 좌우 8 여백이 그 방지선이다.
    geometry: {
      measuredId: "canvas-edge",
      sizeKey: "base",
      fields: {
        width: "specimenWidth",
        height: "specimenHeight",
        layoutMode: { literal: "NONE" },
      },
      slots: {},
      extraStrokeWeights: [],
      parts: {
        Line: { fields: { width: "specimenSpanX", height: "specimenSpanY" } },
      },
    },
  },
  // ── 인스펙터 «행 문법» 두 벌 (계획서 8위) ────────────────────────────────
  //
  // **다섯을 따로 세우지 않았다.** 제품이 절 머리 · 라벨-값 행 · 알약 · 숫자 칸 · 색 값 다섯을
  // 갖고 있지만 그중 «자기 기하를 소유하는 것»은 절 머리와 행 둘뿐이고, 나머지 셋은 행의 값
  // 자리에 서는 형태다. 그래서 component set 도 둘이고 값 형태는 `Value` 축으로 접힌다.
  // 다섯을 따로 세우면 문법이 아니라 부품 다섯이 된다.
  {
    id: "inspector-row",
    figmaName: "InspectorRow",
    figmaAhead:
      "React 표면 없음 — packages/css/src/component/inspector-row.css 가 정본이다. 제품 쪽 구현은 videoEditParts/inspectorPrimitives.tsx 의 InspectorMetric·InspectorPill·NumberInput 셋으로 흩어져 있고 export 되는 공용 타입이 없어 대조할 .d.ts 가 없다.",
    variantProperties: {},
    // 알약의 테두리만 stroke 다. **이 시스템에서 진짜 border 를 쓰는 둘째 자리이며**
    // (첫째는 SegmentedCodeInput), DS-D-0023 이 정한 0.5 inset 헤어라인이 아니다. 알약의 면은
    // 패널 바닥과 같은 값이라 경계가 사라지면 알약이 사라지고, 기법을 바꾸면 20 높이 박스의
    // 바깥 치수도 함께 움직인다 — 앵커 값을 그대로 두고 기법 통일은 소유자 판정으로 남겼다.
    strokes: { Pill: { weight: 1, align: "INSIDE" } },
    // 그림자가 없다. 행도 숫자 칸도 면과 반경으로만 서고 제품 선언에 box-shadow 가 없다
    // (`[box-shadow:none]` 을 명시적으로 끈다).
    effects: {},
    figmaOnlyProperties: {
      Value: {
        options: ["Text", "Number", "Color", "Pill"],
        reason:
          "값 자리의 **구조**가 갈리는 축이다. 불리언 넷으로 그릴 수 없다 — Figma 의 불리언은 가시성만 바꾸는데 네 형태는 서로 다른 노드를 갖고(글자 하나 / 140 폭 컨트롤 / 8 점+글자 / 1px 테두리 알약) 한 변형에서 슬롯을 숨기면 set 전체에서 사라진다. 코드에서는 이것이 한 축이 아니라 세 컴포넌트(InspectorMetric 의 value·colorDot, InspectorPill, NumberInput)로 흩어져 있어 대조할 union 타입이 없다. **Text 와 Color 의 차이는 점 하나뿐**이지만 그 점이 노드라서 구조 축에 든다.",
      },
      Label: {
        type: "TEXT",
        reason:
          "행의 라벨. 코드에서는 InspectorMetric 의 label prop 이며 string 이다. 폭은 이 컴포넌트가 정하지 않는다 — 라벨이 남는 자리를 먹고 값이 오른쪽 끝에 붙는다.",
      },
      ValueText: {
        type: "TEXT",
        reason:
          "값 글자. 코드에서는 value prop 이고 타입이 ReactNode 라 문자열 슬롯으로 완전히 대응하지 않는다 — 소비처가 숫자·단위를 붙인 조각을 넘기는 자리가 있다. Number 변형에서는 이 자리가 숫자 칸 안의 글자이며 같은 프로퍼티가 그 텍스트를 준다(TEXT prop 은 set 단위라 변형마다 다른 이름을 줄 수 없다).",
      },
    },
    geometry: {
      measuredId: "inspector-row",
      // 실측에 키가 둘(row · head)이고 이 set 은 row 만 그린다. sizeKey 를 두지 않으면
      // head 까지 이 set 의 기하로 요구해 거짓 실패가 난다.
      sizeKey: "row",
      fields: {
        height: "height",
        paddingBlock: { literal: 0 },
        paddingBlockEnd: { literal: 0 },
        paddingInline: "paddingInline",
        paddingInlineEnd: "paddingInline",
        itemSpacing: "gap",
        cornerRadius: "radius",
        layoutMode: { literal: "HORIZONTAL" },
      },
      slots: {},
      // 알약의 1px. root 의 borderWidth 는 0 이라 허용 집합에 이 값을 따로 연다.
      extraStrokeWeights: [1],
      parts: {
        Label: { fields: { fontSize: "labelFontSize" } },
        Value: { fields: { itemSpacing: "valueGap" } },
        ValueText: { fields: { fontSize: "valueFontSize" } },
        // 점·알약·숫자 칸은 각각 한 변형에만 있다. 되읽기가 키 하나에 전 변형을 모으므로
        // 배열에 값이 하나씩 담긴다 — `optional` 이 아니라 **있는 것**이다.
        Dot: { fields: { width: "dotSize", height: "dotSize" } },
        Pill: {
          fields: {
            height: "pillHeight",
            cornerRadius: "pillRadius",
            itemSpacing: "pillGap",
            paddingInline: "pillPaddingInline",
            paddingInlineEnd: "pillPaddingInline",
            paddingBlock: { literal: 0 },
            paddingBlockEnd: { literal: 0 },
          },
        },
        Number: {
          fields: {
            width: "numberWidth",
            height: "numberHeight",
            cornerRadius: "numberRadius",
            paddingInline: "numberPaddingInline",
            paddingInlineEnd: "numberPaddingInline",
            paddingBlock: { literal: 0 },
            paddingBlockEnd: { literal: 0 },
          },
        },
      },
    },
  },
  {
    id: "inspector-section-head",
    figmaName: "InspectorSectionHead",
    figmaAhead:
      "React 표면 없음 — packages/css/src/component/inspector-row.css 의 .louis-inspector-section-head 가 정본이다. 제품 쪽 구현(videoEditParts/inspectorPrimitives.tsx 의 InspectorSectionHead)은 export 되지만 타입이 인라인이라 대조할 union alias 가 없다.",
    variantProperties: {},
    strokes: {},
    // **밑줄이 없는 것이 계약이다.** 제품 주석이 통합 근거로 「효과 절만 14px 제목에 밑줄이라
    // 혼자 달라 보였다」를 적고 있고, 한 벌로 모으며 그 밑줄을 없앴다. stroke 도 effect 도 0 인
    // 상태가 그 결정의 증거이며, 누가 밑줄을 되살리면 「계약에 없는 것」으로 잡힌다.
    effects: {},
    figmaOnlyProperties: {
      Action: {
        options: ["None", "Icon"],
        reason:
          "오른쪽 조작 아이콘의 유무. **불리언이 아니라 축인 이유는 노드가 있고 없고이기 때문이다** — 불리언으로 두면 가시성만 꺼져 24 폭이 그대로 남고, Figma 의 불리언은 set 단위라 한 변형에서 끄면 다른 변형에서도 사라진다. 코드에서는 action prop 이 ReactNode 이고 있으면 그린다.",
      },
      Title: {
        type: "TEXT",
        reason:
          "절 제목. 코드에서는 title prop 이며 타입이 ReactNode 다 — 소비처가 「효과 (3)」처럼 개수를 붙인 조각을 넘기는 자리가 있어 문자열 슬롯과 완전히 대응하지 않는다.",
      },
      Meta: {
        type: "TEXT",
        reason:
          "제목 오른쪽의 값 힌트. 코드에서는 meta prop 이고 없을 수 있는데 **Figma 에서 그 없음을 그리지 않았다** — 없음을 축으로 열면 Action 과 곱해져 넷이 되고, 힌트가 빠진 머리는 오른쪽 묶음의 기하를 바꾸지 않는다(묶음이 HUG 라 폭만 줄어든다). 그 폭은 이 게이트가 대조하지 않는다.",
      },
      ActionGlyph: {
        type: "INSTANCE_SWAP",
        reason:
          "조작 아이콘의 글리프. 절마다 다른 글리프가 온다(눈 · 스피커 · 더하기) — 박아 두면 소비처가 바꿔 끼울 수 없고 화면을 조립할 때 전부 같은 글리프가 된다.",
      },
    },
    iconSlots: ["ActionGlyph"],
    geometry: {
      measuredId: "inspector-row",
      sizeKey: "head",
      fields: {
        paddingBlock: { literal: 0 },
        paddingBlockEnd: "paddingBlockEnd",
        paddingInline: { literal: 0 },
        paddingInlineEnd: { literal: 0 },
        itemSpacing: "rowGap",
        cornerRadius: { literal: 0 },
        // 머리는 가로 한 줄이다. 제품이 감싸는 세로 묶음을 두지만 자식이 언제나 하나라
        // 그 묶음의 사이 간격은 아무 것도 벌리지 않는다 — 그리지 않는 값은 계약에 없다.
        layoutMode: { literal: "HORIZONTAL" },
      },
      slots: {},
      extraStrokeWeights: [],
      parts: {
        Title: { fields: { fontSize: "titleFontSize" } },
        Tail: { fields: { itemSpacing: "tailGap" } },
        Meta: { fields: { fontSize: "metaFontSize" } },
        // Action 은 Action=Icon 한 변형에만 있다. 없는 변형에서는 노드를 지웠고(가시성이
        // 아니다) 되읽기가 그 변형을 건너뛴다 — 배열에 값이 하나 담긴다.
        Action: {
          fields: {
            width: "actionSize",
            height: "actionSize",
            cornerRadius: "actionRadius",
          },
        },
        ActionGlyph: { fields: { width: "glyphSize", height: "glyphSize" } },
      },
    },
  },
  {
    id: "section-header",
    figmaName: "SectionHeader",
    // React 표면이 없다 — 정본은 CSS 파일이고, 그 실측 출처는 제품 `app/admin/AdminSection.tsx`
    // 의 `AdminSectionHeader` 다(어드민 11 파일 17 자리). alert · switch · tabs 와 같은 형태다.
    figmaAhead:
      "React 표면 없음 — packages/css/src/component/section-header.css 가 정본이고, 실측 출처는 제품 app/admin/AdminSection.tsx 의 AdminSectionHeader(11 파일 17 자리)와 components/ui/PageHeader(앱 허브 4곳)다.",
    // 코드 타입 alias 에서 읽는 축이 없다 — React 표면이 없으므로 union 을 뜰 declaration 이
    // 없다. `Level` 은 아래 figmaOnlyProperties 가 값까지 고정한다.
    variantProperties: {},
    figmaOnlyProperties: {
      Level: {
        options: ["page", "section", "label"],
        reason:
          "제목 사다리 세 단. **`Size` 가 아니라 `Level` 이다** — 값이 밀도가 아니라 문서 위계다. page 는 화면 제목(36 SemiBold), section 은 카드 안 묶음의 제목(20 SemiBold), label 은 패널 아이브로우(12 Medium)이고, 셋은 「같은 것을 더/덜 크게」가 아니라 서로 다른 자리에 산다 — 아래 여백을 page 만 지는 것이 그 증거다. 값이 사다리 어휘(sm·md·lg)가 아닌 이유도 같다: 사다리 어휘를 빌리면 순서를 주장하게 되는데 이 셋의 관계는 순서가 아니라 포함이다. 값은 제품 prop 의 값 그대로다(AdminSectionLevel = page | section | label). 축 이름은 figma-component-authoring.md §2 의 표에 2026-09-07 에 열렸다. **BOOLEAN 이 아닌 이유**: 계속 보이는 제목의 타이포와 잉크가 달라지고(시험 1) 프레임이 자기 아래 padding 을 다시 쓴다(시험 2).",
      },
      Title: {
        type: "TEXT",
        reason:
          "제목 문구. 코드에서는 `title: ReactNode` 이고 세 level 이 모두 갖는 유일한 슬롯이다.",
      },
      Description: {
        type: "TEXT",
        reason:
          "제목 아래 한 줄 설명(16 Medium). 제품 17 자리 중 둘이 넘긴다(AdminClient.tsx:1077 일괄 지급 · JobMonitor.tsx:307). page 변형에만 노드가 있다.",
      },
      Meta: {
        type: "TEXT",
        reason:
          "개수·기간처럼 짧은 보조 정보(12 Regular · tabular-nums). 제품 17 자리 중 여덟이 넘긴다. page·section 두 변형에 노드가 있다.",
      },
      HasDescription: {
        type: "BOOLEAN",
        reason:
          "설명 없는 화면 머리가 실재한다 — 제품 page 열한 자리 중 아홉이 설명을 넘기지 않는다. 켜고 끌 때 바뀌는 것이 그 줄의 가시성뿐이라 §2 의 네 시험을 모두 통과한다.",
      },
      HasMeta: {
        type: "BOOLEAN",
        reason:
          "메타 없는 머리가 실재한다(CouponManagement.tsx:591 · UsageByModelDashboard.tsx:215 등). 같은 이유로 BOOLEAN 이다.",
      },
      HasActions: {
        type: "BOOLEAN",
        reason:
          "액션 없는 머리가 실재한다 — 제품 17 자리 중 일곱이 액션을 넘기지 않는다. 액션 **개수**는 소비처가 정하므로 축이 아니다(제품은 0·1·2 를 쓴다). label 변형에는 노드 자체가 없다.",
      },
    },
    // **선이 한 줄도 없다.** 제품 HEADER_ROW 에 border·box-shadow 선언이 하나도 없다 — 머리는
    // 상자가 아니라 부모 표면 위에 얹히는 텍스트 줄이다. 빈 칸을 비워 두는 것이 아니라 없다는
    // 사실을 적는 것이고, 나중에 누가 Figma 에서 테두리를 두르면 게이트가 잡는다.
    strokes: {},
    effects: {},
    geometry: {
      measuredId: "section-header",
      // 세 칸을 전부 건다. 하나로 좁히면 나머지 둘은 Figma 가 무슨 값을 그리든 초록이고,
      // verify-figma-done 의 「대조 범위 밖」 검사가 그 상태를 잡는다.
      sizeKeys: ["page", "section", "label"],
      fields: {
        itemSpacing: "rowGap",
        // CSS 의 `margin-block-end` 를 Figma 의 아래 padding 으로 그린다 — Figma auto-layout 에
        // 자식 바깥 여백이 없어서다. empty-state 의 Action 이 쓰는 것과 같은 대치이고,
        // 결과(다음 블록과의 거리)는 같고 표현이 다르다.
        paddingBlockEnd: "marginBlockEnd",
        // 나머지 세 방향은 0 이다. **계약 값이 아니라 literal 인 이유**: 제품 헤더에 padding
        // 선언 자체가 없고(페이지 컨테이너가 인셋을 이미 준다) 0 은 잴 값이 아니라 없다는
        // 사실이다. measured 에 0 을 세 칸 적으면 사유 셋이 같은 말을 반복한다.
        paddingBlock: { literal: 0 },
        paddingInline: { literal: 0 },
        paddingInlineEnd: { literal: 0 },
        // 면이 없으니 곡률도 없다. 위 strokes 와 짝이다.
        cornerRadius: { literal: 0 },
        // 정렬이 이 컴포넌트에서 가장 눈에 띄는 값이다 — 제목 36 옆에 버튼 32 가 설 때
        // 가운데 정렬이면 버튼이 제목 위로 떠오른다. `stretch` 는 719px 아래의 값인데
        // Figma 에 그 변형이 없으므로 표에만 있고 지금은 어느 칸도 쓰지 않는다
        // (contract 의 `$foldRule` 이 그 사실을 소유한다).
        counterAxisAlignItems: {
          enum: "align",
          table: { "flex-end": "MAX", stretch: "STRETCH" },
        },
        layoutMode: { literal: "HORIZONTAL" },
      },
      slots: {},
      extraStrokeWeights: [],
      parts: {
        // 제목 블록. 자식이 하나뿐인 label 에서도 gap 은 선언돼 있다 — 보이지 않는 값이지
        // 그리지 않는 값이 아니다. 그래서 `optional` 이 아니다.
        Text: { fields: { itemSpacing: "textGap", layoutMode: { literal: "VERTICAL" } } },
        Title: { fields: { fontSize: "titleFontSize" } },
        // **자손 셋이 level 마다 사라진다.** section 에는 설명이 없고 label 에는 셋 다 없다.
        // `optional` 은 **근거 값이 함께 없을 때만** 통과하므로, 값을 남겨 둔 채 Figma 에서
        // 자손만 지우는 길은 없다.
        Description: { optional: true, fields: { fontSize: "descriptionFontSize" } },
        Meta: { optional: true, fields: { fontSize: "metaFontSize" } },
        Actions: {
          optional: true,
          fields: { itemSpacing: "actionsGap", layoutMode: { literal: "HORIZONTAL" } },
        },
      },
    },
  },
  // ── 캔버스 노드 크롬 셋 ────────────────────────────────────────────────────
  // 계획서 6위(노드 셸 + 크롬)에서 올라온 셋이다. 이제 **CSS recipe 는 있고 React 표면이
  // 없다** — Alert·Switch·NodeChip 과 같은 `figmaAhead` 형태이고, 대조할 `.d.ts` 가 없으므로
  // declaration 을 읽지 않는다. 값의 출처는 제품 앵커 `5a67d692` 의 소스이고, 레시피가 그
  // 값을 여전히 만드는지는 verify-recipe-record 와
  // packages/react/test/node-chrome.browser.test.tsx 가 잰다.
  {
    id: "node-chrome-button",
    figmaName: "NodeChromeButton",
    figmaAhead:
      "React 표면 없음 — packages/css/src/component/node-chrome-button.css 가 정본이다. 값의 출처는 제품 `NodeHeaderActions.tsx` 의 BUTTON/BUTTON_NEUTRAL/BUTTON_DANGER 이고 SectionNode 까지 9종이 그 쌍을 쓴다.",
    variantProperties: {},
    // **테두리가 없는 것이 계약이다.** `border-0` 이고 면은 투명이며 호버에서만 틴트가 뜬다.
    // 빈 객체로 두면 역방향 검사(`계약에 없는 stroke`)는 그대로 돌아 stroke 가 생기면 잡힌다.
    strokes: {},
    iconSlots: ["Glyph"],
    figmaOnlyProperties: {
      Glyph: {
        type: "INSTANCE_SWAP",
        reason:
          "코드에서 글리프는 호출부가 넘기는 자식이다(다운로드는 ToolbarIconDownload, 삭제는 ToolbarIconTrashSimple). 버튼 자신은 어떤 글리프인지 모르므로 축이 아니라 슬롯이다.",
      },
      Tone: {
        options: ["neutral", "danger"],
        reason:
          "호버 틴트가 갈린다 — 중립은 잉크 색을 그대로 두고 면만 얹지만 삭제는 잉크까지 붉게 간다. 코드에서는 클래스 두 벌(BUTTON_NEUTRAL·BUTTON_DANGER)이고 prop 이 아니라 호출부가 어느 쪽을 붙일지 고른다.",
      },
      State: {
        options: ["Default", "Hover", "Disabled"],
        reason:
          "Hover 는 CSS 상태이고 Disabled 는 DOM 속성이다. Figma 에는 CSS 상태가 없어 variant 로 둔다. Active(`transform: scale(0.94)`)와 Success(복사→체크)는 열지 않았고 사유는 measured 의 `$whyNoActive`·`$whyNoSuccess` 가 갖는다.",
      },
    },
    // 비활성이 **면이 아니라 불투명도로만** 갈린다. 되읽기에 opacity 가 있으므로 여섯 칸을
    // 전부 선언해야 한다 — 하나라도 빠지면 「되읽기에 불투명도가 있는데 계약에 없습니다」다.
    opacity: {
      "neutral/Default": 1,
      "neutral/Hover": 1,
      "neutral/Disabled": 0.35,
      "danger/Default": 1,
      "danger/Hover": 1,
      "danger/Disabled": 0.35,
    },
    geometry: {
      measuredId: "node-chrome-button",
      fields: {
        height: "height",
        width: "width",
        cornerRadius: "radius",
        paddingBlock: "paddingBlock",
        paddingBlockEnd: "paddingBlock",
        paddingInline: "paddingInline",
        paddingInlineEnd: "paddingInline",
        itemSpacing: "gap",
      },
      slots: { Glyph: "glyphSize" },
      parts: { Glyph: { fields: { width: "glyphSize", height: "glyphSize" } } },
    },
  },
  {
    id: "node-shell",
    figmaName: "NodeShell",
    figmaAhead:
      "React 표면 없음 — packages/css/src/component/node-shell.css 가 정본이다. 값의 출처는 제품 `nodes/*Node.tsx` 여덟과 `node-canvas-v2/index.tsx` 의 CANVAS_SHELL_BASE 다.",
    variantProperties: {},
    // 카드의 2px 테두리는 **실제 stroke** 다. Button·IconButton 의 헤어라인과 달리 레이아웃을
    // 접는 inset 그림자가 아니라 제품이 `border: 2px solid` 로 그리는 선이므로 stroke 로 옮긴다.
    strokes: { Card: { weight: "borderWidth", align: "INSIDE" } },
    iconSlots: ["TypeGlyph"],
    figmaOnlyProperties: {
      TypeGlyph: {
        type: "INSTANCE_SWAP",
        reason:
          "타입 글리프는 노드마다 다른 컴포넌트이고 셸은 그것을 모른다. **아홉 중 넷(video-camera·youtube·instagram·magic-wand)이 아직 아이콘 세트에 없어** 변형별 기본값을 채우면 넷이 거짓 글리프를 갖게 된다 — 그래서 기본값 하나(`icon/image`)만 두고 갈아 끼우게 한다.",
      },
      Label: {
        type: "TEXT",
        reason:
          "노드 이름이다. 코드에서 사용자가 고쳐 쓰는 값이거나(NodeTitleEditableLabel) i18n 문자열이라 타입 선언의 항목으로 나타나지 않는다.",
      },
      Accent: {
        options: ["video", "image", "text", "youtube", "instagram", "audio", "edit"],
        reason:
          "제품 `globals.css` 가 `[data-node-accent]` 로 선언하는 일곱 값 그대로다. 선택 테두리 색만 바꾸므로 기하는 일곱이 같고, youtube 와 instagram 은 같은 red-500 을 가리켜 색까지 같다 — 제품의 어휘를 옮기려고 두 칸을 남겼다는 사실을 measured 의 `$whyAccentNotType` 가 갖는다.",
      },
      Selected: {
        options: ["false", "true"],
        reason:
          "선택 테두리 색이 바뀐다(시험 1). `figma-component-authoring.md` §2 의 조건 축 일곱 중 `Selected` 가 이미 열려 있고, 캔버스 노드도 「선택 가능한 항목」이라 같은 이름을 쓴다.",
      },
      HelpButton: {
        type: "BOOLEAN",
        reason:
          "헤더 액션 맨 앞의 도움말 단추(2026-10-08 Figma 에 세움) — 제품 `NodeHelpAction` 은 캔버스가 도움말을 열 수 있고 그 노드에 도움말 쪽이 있을 때만 그려지는 조건부 칸이라 코드에서는 prop 이 아니라 렌더 조건이다. 네 시험을 다 통과한다 — 켜고 꺼도 계속 보이는 레이어의 스타일이 그대로이고 Actions 는 간격 0 의 hug 라 자기 값을 다시 쓰지 않는다(자식이 빠져 줄어드는 것은 BOOLEAN 의 정상 결과다). 기본은 꺼짐이다 — 앵커 제품과 그것을 잰 보드가 아직 둘만 그린다.",
      },
    },
    geometry: {
      measuredId: "node-shell",
      fields: {
        width: "cardWidth",
        // 바깥 프레임은 헤더와 카드를 세로로 담는다. 높이는 그 셋의 합이고, 합으로 적어야
        // 어느 조각이 움직였는지가 실패 메시지에 남는다.
        height: ["headerHeight", "headerToCardGap", "cardHeight"],
        itemSpacing: "headerToCardGap",
        paddingBlock: "paddingBlock",
        paddingBlockEnd: "paddingBlock",
        paddingInline: "paddingInline",
        paddingInlineEnd: "paddingInline",
        cornerRadius: "rootRadius",
      },
      slots: { TypeGlyph: "glyphSize" },
      parts: {
        HeaderRow: {
          fields: {
            width: "cardWidth",
            height: "headerHeight",
            paddingInline: "headerPaddingInline",
            paddingInlineEnd: "headerPaddingInline",
            itemSpacing: "headerGap",
          },
        },
        // 제목 묶음의 **폭은 담지 않는다** — 라벨 폭은 글꼴 렌더링이 정하고 이 파일의
        // `$whyNotTextWidth` 가 그것을 이미 계약 밖으로 두었다. 높이는 글리프가 정한다.
        Title: { fields: { height: "glyphSize", itemSpacing: "titleGap" } },
        TypeGlyph: { fields: { width: "glyphSize", height: "glyphSize" } },
        Label: {
          fields: {
            height: "labelHeight",
            fontSize: "labelFontSize",
            lineHeightPercent: "labelLineHeightPercent",
          },
        },
        // 액션 묶음은 폭·자식 수까지 담는다. 「붙어 있다」가 계약이라 간격 0 과 자식 수가
        // 함께 있어야 한 쪽만 바뀌는 것을 잡는다. **자식은 셋(2026-10-08)** — 도움말 · 다운로드 · 삭제.
        // 도움말은 `HelpButton`(기본 꺼짐)에 가시성이 물린 칸이라 폭은 감춘 채의 64 이고, 감춘 레이어도
        // 자식으로 세어지므로 자식 수는 렌더된 단추 수(`actionsCount` 2, 브라우저 시험)가 아니라 자리 수
        // `actionsSlots` 와 대조한다. 감춘 칸의 치수는 되읽기가 보지 않는다 — 그 값은 NodeChromeButton 원본이 갖는다.
        Actions: {
          fields: {
            width: "actionsWidth",
            height: "headerHeight",
            itemSpacing: "actionsGap",
            children: "actionsSlots",
          },
        },
        Card: { fields: { width: "cardWidth", height: "cardHeight", cornerRadius: "cardRadius" } },
        Body: { fields: { width: "cardWidth", height: "cardHeight" } },
      },
    },
  },
  {
    // **id 가 `node-shell` 이다.** 입력판은 Node Shell 의 하위 부품이라 manifest 항목과 규범 문서가 하나다
    // (`figmaNames` 셋 — FloatingShell · PillTrigger 와 같은 형태). 기록 칸은 따로(`node-composer`) 둔다.
    id: "node-shell",
    figmaName: "NodeComposer",
    figmaAhead:
      "React 표면 없음 — packages/css/src/component/node-shell.css 의 .louis-node-shell__composer 이하 일곱 클래스가 정본이다(2026-10-07). 값의 출처는 제품 origin/dev 의 VideoNode.tsx PROMPT_* 상수(ImageNode · TextNode · Model3dNode 가 복제)다.",
    variantProperties: {},
    // 테두리가 없다. 면의 경계는 border 가 아니라 안쪽 헤어라인 한 겹이다(`box-shadow: var(--louis-hairline-inset)`).
    strokes: {},
    effects: { Field: "INNER_SHADOW:0:0:0.5" },
    figmaOnlyProperties: {
      HasLead: {
        type: "BOOLEAN",
        reason:
          "면 첫 줄(글 입력칸 · 참조 미디어 · 연결 칩)이 있는가. 코드에서는 prop 이 아니라 마크업의 형제 유무이고, 레시피가 「앞에 무엇이 있으면 푸터를 위로 8 띄운다」를 형제 선택자로 갖는다. Figma 는 그 8 을 Field 의 itemSpacing 으로 옮겨 Lead 를 감추면 간격도 사라진다 — 계속 보이는 레이어의 스타일이 그대로이고 Field 는 hug 라 자기 값을 다시 쓰지 않아 네 시험을 다 통과한다. 기본 켜짐(프롬프트 노드는 첫 줄이 있다). Lead 의 높이 48 은 자리표시다 — 첫 줄은 이 부품이 소유하지 않는다.",
      },
      HasError: {
        type: "BOOLEAN",
        reason:
          "푸터 아래 오류 배너(NodeComposerError 인스턴스)가 있는가. 코드에서는 오류가 있을 때만 호출부가 `.louis-node-shell__error` 를 그리는 렌더 조건이다. 배너가 감춰져 Footer 가 줄어드는 것은 BOOLEAN 의 정상 결과이고 남는 레이어의 스타일은 그대로다. 기본 꺼짐.",
      },
    },
    geometry: {
      measuredId: "node-composer",
      sizeKeys: ["composer"],
      // **폭 · 높이는 담지 않는다.** 폭은 카드(400)를 채우는 값이고 높이는 내용의 합이다(Lead 자리표시 48 이 들어간다).
      fields: {
        paddingBlock: "padding",
        paddingBlockEnd: "padding",
        paddingInline: "padding",
        paddingInlineEnd: "padding",
        itemSpacing: "gap",
        // 영역은 투명한 흐름 상자다 — 곡률을 갖지 않는다(레시피가 제품의 아래 모서리 곡률을 옮기지 않은 사유는 CSS 주석).
        cornerRadius: { literal: 0 },
        layoutMode: { literal: "VERTICAL" },
      },
      slots: {},
      extraStrokeWeights: [],
      parts: {
        Field: {
          fields: {
            paddingBlock: "fieldPadding",
            paddingBlockEnd: "fieldPadding",
            paddingInline: "fieldPadding",
            paddingInlineEnd: "fieldPadding",
            // CSS 는 푸터의 `margin-block-start`(앞 형제가 있을 때만)다. Figma 는 자식별 여백이 없어 Field 의 간격으로 옮긴다.
            itemSpacing: "footerOffset",
            cornerRadius: "fieldRadius",
            layoutMode: { literal: "VERTICAL" },
          },
        },
        Footer: { fields: { itemSpacing: "footerGap", layoutMode: { literal: "VERTICAL" } } },
        // 생성 버튼 자리의 왼쪽 8(`__generate { margin-inline-start }`)을 FooterControls 의 간격으로 옮긴다.
        FooterControls: {
          fields: { height: "controlsHeight", itemSpacing: "generateOffset", layoutMode: { literal: "HORIZONTAL" } },
        },
        Meta: { fields: { height: "controlsHeight", itemSpacing: "metaGap", layoutMode: { literal: "HORIZONTAL" } } },
      },
    },
  },
  {
    id: "node-shell",
    figmaName: "NodeComposerError",
    figmaAhead:
      "React 표면 없음 — packages/css/src/component/node-shell.css 의 .louis-node-shell__error · __error-text 가 정본이다(2026-10-07). 제품 origin/dev 의 VideoNode.tsx PROMPT_ERROR_BANNER 가 출처다.",
    variantProperties: {},
    strokes: {},
    effects: { self: "INNER_SHADOW:0:0:0.5" },
    figmaOnlyProperties: {
      Message: {
        type: "TEXT",
        reason: "오류 문구다. 코드에서는 `.louis-node-shell__error-text` 의 텍스트이고 최대 3줄에서 말줄임된다(전문은 호출부가 title 로 낸다).",
      },
    },
    geometry: {
      measuredId: "node-composer",
      sizeKeys: ["error"],
      // 높이는 담지 않는다 — 글자가 정한다. 최소 높이 28 을 Figma 의 minHeight 로 맞댄다.
      fields: {
        minHeight: "minHeight",
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
      parts: {},
    },
  },
  {
    id: "node-side-handle",
    figmaName: "NodeSideHandle",
    figmaAhead:
      "React 표면 없음 — packages/css/src/component/node-side-handle.css 가 정본이다. 값의 출처는 제품 `NodeSideButtons.tsx` 의 TargetButton 이다.",
    variantProperties: {},
    // 셸에도 디스크에도 테두리가 없다(`[border:none]`). 경계는 곡률과 면이 만든다.
    strokes: {},
    // 디스크 안쪽의 광. 제품은 `::before` 에 `inset 0 0 8px` 흰 그림자를 `mix-blend-mode:
    // overlay` 로 얹는다 — Figma 는 INNER_SHADOW 의 blendMode 로 같은 것을 그린다.
    effects: { Facet: "INNER_SHADOW:0:8:0" },
    iconSlots: ["Glyph"],
    figmaOnlyProperties: {
      Glyph: {
        type: "INSTANCE_SWAP",
        reason:
          "채널 글리프는 호출부가 넘기는 자식이다(`icon={<ImageIcon …/>}`). 같은 채널 안에서도 자리마다 다르다 — image 채널이 시작 프레임에서는 align-left, 끝 프레임에서는 align-right 를 쓴다.",
      },
      Channel: {
        options: ["image", "text", "edit"],
        reason:
          "제품 `NodeSideButtons.tsx:518` 의 `type SideTone = \"image\" | \"text\" | \"edit\"` 이 정본이다. `Tone` 을 쓰지 않은 이유는 그 어휘가 의미 톤(neutral·info·success·warning·danger)만 담기 때문이고, 이 셋은 의미가 아니라 **이음새로 흐르는 것의 종류**다 — globals.css 가 같은 것을 「채널」이라 부른다.",
      },
    },
    geometry: {
      measuredId: "node-side-handle",
      fields: {
        height: "height",
        width: "width",
        cornerRadius: "radius",
        paddingBlock: "paddingBlock",
        paddingBlockEnd: "paddingBlock",
        paddingInline: "paddingInline",
        paddingInlineEnd: "paddingInline",
        itemSpacing: "gap",
      },
      slots: { Glyph: "glyphSize" },
      parts: {
        Facet: { fields: { width: "facetSize", height: "facetSize", cornerRadius: "facetRadius" } },
        Glyph: { fields: { width: "glyphSize", height: "glyphSize" } },
      },
    },
  },
  {
    id: "floating-shell",
    figmaName: "FloatingShell",
    figmaAhead:
      "LOUIS recipe 없음 — 제품 `node-canvas-v2/components/Toolbar.tsx` 와 `node-canvas-v2/index.tsx` 의 TOOLBAR_WRAP 이 정본이고 캔버스·홈·영상편집·커맨드팔레트가 같은 재료를 쓴다.",
    variantProperties: {},
    // **테두리가 없는 것이 계약이다.** `[border:none]` 이고 경계는 안쪽 헤어라인 그림자 한 겹이
    // 만든다. 빈 객체라 역방향 검사는 그대로 돌아 stroke 가 생기면 잡힌다.
    strokes: {},
    // 유리 두 겹 — 헤어라인 inset(0.5 spread)과 배경 흐림 4. 흐림 반경이 `var(...)` 가 아닌
    // 것은 LOUIS 흐림 사다리(10·12·16)에 4 가 없기 때문이고, 그 사실은 measured 의
    // `$blurRadius` 가 갖는다.
    effects: { self: "INNER_SHADOW:0:0:0.5 + BACKGROUND_BLUR:NORMAL:4" },
    // 변형 축이 하나도 없다(MenuPanel·MenuSeparator 와 같은 단일 COMPONENT). 계획서가 제안한
    // Orientation·Divider 두 축을 열지 않은 사유는 measured 의 `$whyNoOrientationAxis`·
    // `$whyNoDividerAxis` 가 갖는다.
    figmaOnlyProperties: {},
    geometry: {
      measuredId: "floating-shell",
      // **폭은 담지 않는다.** 안에 몇 조각이 서느냐가 정하는 값이라 셸의 선언이 아니다 —
      // 이 파일의 `$whyNotTextWidth` 가 라벨 폭을 계약 밖에 둔 것과 같은 종류다.
      fields: {
        height: "height",
        paddingBlock: "paddingBlock",
        paddingBlockEnd: "paddingBlock",
        paddingInline: "paddingInline",
        paddingInlineEnd: "paddingInline",
        itemSpacing: "gap",
        cornerRadius: "radius",
      },
      slots: { "Item 1": "itemSize", "Item 2": "itemSize", "Item 3": "itemSize" },
      // 조각의 곡률까지 담는다 — 32 정사각에 반경 12 가 한 쌍이고, 한쪽만 바뀌면 셸 안의
      // 리듬이 깨진다.
      parts: {
        "Item 1": { fields: { cornerRadius: "itemRadius" } },
        "Item 2": { fields: { cornerRadius: "itemRadius" } },
        "Item 3": { fields: { cornerRadius: "itemRadius" } },
      },
    },
  },
  {
    // **id 가 `floating-shell` 이다.** 카탈로그 항목이 하나이기 때문이다 — FloatingShell 과
    // PillTrigger 는 같은 재료의 두 조각이라 manifest 의 한 항목(`figmaNames` 둘)과 한 규범
    // 문서를 쓴다(Progress·VideoPlayer 와 같은 형태). `verify-figma-done` 의 (b) 가 계약 id 를
    // manifest 항목 id 와 대조하므로 여기서 갈리면 승격 조건이 서지 않는다. `measuredId` 는
    // 실측 칸의 키라서 `pill-trigger` 그대로다 — 두 조각의 기하는 따로 잰다.
    id: "floating-shell",
    figmaName: "PillTrigger",
    figmaAhead:
      "LOUIS recipe 없음 — 제품 `node-canvas-v2/components/CanvasZoomControl.tsx` 의 ZOOM_LABEL_BUTTON 이 정본이다. 셸과 같은 재료를 트리거 하나에 입힌 것이다.",
    variantProperties: {},
    strokes: {},
    effects: { self: "INNER_SHADOW:0:0:0.5 + BACKGROUND_BLUR:NORMAL:4" },
    // **`iconSlots` 를 선언하지 않는다.** 캐럿은 소비처가 바꿔 끼우는 글리프가 아니라 「메뉴가
    // 어느 쪽으로 열리는가」를 말하는 고정 크롬이다 — MenuTrigger 가 같은 이유로 슬롯을 두지
    // 않았다(위 그 계약의 주석).
    figmaOnlyProperties: {
      Label: {
        type: "TEXT",
        reason:
          "배율 문구다. 코드에서 `${Math.round(zoom * 100)}%` 로 계산돼 들어오는 값이라 prop 도 축도 아니다 — 축으로 열면 라이브러리가 카피를 소유하게 된다(저작 규범 §2 의 「문구가 값인 축은 TEXT 로 내린다」).",
      },
      State: {
        options: ["Default", "Hover", "Open"],
        reason:
          "Hover 는 CSS 상태이고 Open 은 `aria-expanded=\"true\"` 다. Figma 에는 둘 다 없어 variant 로 둔다. Open 은 2026-09-07 에 축 어휘 표에 오른 값이고 MenuTrigger·SelectTrigger 가 이미 쓴다. Disabled 는 제품에 선언이 없어 열지 않았다 — 사유는 measured 의 `$whyNoDisabled` 가 갖는다.",
      },
    },
    geometry: {
      measuredId: "pill-trigger",
      // 세 칸의 기하가 같다. 폭은 담지 않는다 — 배율 문구가 정하는 값이다.
      fields: {
        height: "height",
        paddingBlock: "paddingBlock",
        paddingBlockEnd: "paddingBlock",
        paddingInline: "paddingInline",
        paddingInlineEnd: "paddingInline",
        itemSpacing: "gap",
        cornerRadius: "radius",
      },
      parts: {
        // 라벨은 `fontSize` 만 담는다. 폭은 문구가, 높이는 leading-1 텍스트 스타일이 정하고
        // 알약 높이는 고정 36 이라 라벨이 기하를 만들지 않는다.
        Label: { fields: { fontSize: "labelFontSize" } },
        Caret: {
          fields: { width: "caretSize", height: "caretSize", opacity: "caretOpacity" },
        },
      },
    },
  },
  {
    id: "stat-tile",
    figmaName: "StatTile",
    figmaAhead:
      "LOUIS recipe 는 있고 React 표면이 없다 — packages/css/src/component/stat-tile.css 가 정본이고 제품 app/admin/AdminSection.tsx 의 AdminStatTile 이 그 값의 출처다. 대조할 .d.ts 가 없으므로 declaration 을 읽지 않는다(Alert 와 같은 상태).",
    variantProperties: {},
    // **테두리가 없다.** 경계는 generic 10% inset 헤어라인 하나다(DS-D-0023). 빈 객체가 그
    // 사실을 계약으로 고정한다 — 나중에 Figma 에 stroke 가 생기면 「계약에 없는 stroke」로 잡힌다.
    strokes: {},
    effects: { self: "INNER_SHADOW:0:0:0.5" },
    figmaOnlyProperties: {
      Size: {
        options: ["lg", "md"],
        reason:
          "값의 글자 크기와 행간만 바꾼다(28/135 ↔ 20/150). 여백·간격·반경은 두 칸이 같다 — 두 종류의 타일이 한 격자에 섞여 서므로 액자가 갈리면 행이 어긋난다. **값이 소문자인 것은 CSS 속성값과 같은 철자를 쓰기 위해서다**(Alert 의 Layout 과 같은 규칙). 코드에서는 `data-size` 이고 기본이 md 다 — 보조 타일이 주요 지표보다 많다.",
      },
      Delta: {
        options: ["up", "down", "flat", "none"],
        reason:
          "증감 알약의 톤이고 `none` 은 알약 자체가 없는 칸이다. **불리언으로 열 수 없다** — BOOLEAN 은 가시성만 바꾸는데 이 축은 면과 잉크 두 겹을 함께 갈아 끼우고, `none` 은 노드를 지우는 구조 축이다(가시성으로 숨기면 component set 단위로 합쳐져 다른 변형의 알약까지 사라진다). 코드에서는 알약의 `data-tone` 과 알약을 그리는지 여부 둘이 한 축으로 접힌 것이다.",
      },
      Label: { type: "TEXT", reason: "지표 이름. 코드에서는 소비처가 넘기는 문구이고 컴포넌트 prop 이 아니다." },
      Value: { type: "TEXT", reason: "서식이 끝난 수치 문자열. 축약·통화·단위는 소비처가 정한다." },
      Hint: {
        type: "BOOLEAN",
        reason:
          "분모·기간 한 줄의 유무. 정본이 `hint` 를 받지 않으면 그 span 자체를 그리지 않는다 — 빈 것을 남기면 간격만 붙는다. 여덟 변형 전부에 이 자손이 있으므로 set 단위로 합쳐져도 사실이 어긋나지 않는다.",
      },
      HintLabel: {
        type: "TEXT",
        reason:
          "힌트 문구. Hint(BOOLEAN) 과 짝으로 낸다 — 이 BOOLEAN + {Name}Label TEXT 형태의 근거는 figma-component-authoring.md §2 개정표의 MediaCard 선례(Badge + BadgeLabel)다.",
      },
      DeltaLabel: { type: "TEXT", reason: "알약 문구. 부호를 포함한다 — 색으로만 방향을 말하면 WCAG 1.4.1 을 스스로 깬다." },
    },
    geometry: {
      measuredId: "stat-tile",
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
        Label: { fields: { fontSize: "labelFontSize", lineHeightPercent: { literal: 150 } } },
        // **행간이 크기 축에서 갈리는 유일한 자손이다** — heading 계열은 1.35, body 계열은 1.5 다.
        // 리터럴로 적으면 그 사실이 계약에서 사라진다.
        Value: { fields: { fontSize: "valueFontSize", lineHeightPercent: "valueLineHeightPercent" } },
        Hint: { fields: { fontSize: "hintFontSize", lineHeightPercent: { literal: 150 } } },
        Delta: {
          fields: {
            paddingBlock: "deltaPaddingBlock",
            paddingBlockEnd: "deltaPaddingBlock",
            paddingInline: "deltaPaddingInline",
            paddingInlineEnd: "deltaPaddingInline",
            cornerRadius: "deltaRadius",
          },
        },
        DeltaLabel: { fields: { fontSize: "deltaFontSize" } },
      },
    },
  },
  {
    id: "chart-card",
    figmaName: "ChartCard",
    figmaAhead:
      "LOUIS recipe 는 있고 React 표면이 없다 — packages/css/src/component/chart-card.css 가 액자와 슬롯을 소유하고 곡선 자체는 소비처의 SVG 다. 값의 출처는 제품 analytics/OverviewTab.tsx · InstagramAnalyticsScene.tsx 다.",
    variantProperties: {},
    strokes: {},
    // 면이 둘이라 헤어라인도 둘이다. **안쪽 면까지 계약에 적는다** — 이 카드에서 두 겹이라는
    // 사실 자체가 정보이고, 안쪽 헤어라인이 사라지면 카드가 한 겹으로 읽힌다.
    effects: { self: "INNER_SHADOW:0:0:0.5", Panel: "INNER_SHADOW:0:0:0.5" },
    figmaOnlyProperties: {
      Chart: {
        options: ["area", "spark"],
        reason:
          "차트가 붙는 자리다. area 는 수치 아래 전폭, spark 는 수치 옆 미니 곡선이고 그 축이 안쪽 면의 방향(세로·가로) · 여백(12/14 · 14/16) · 최소 높이(0 · 92) · 헤더 간격(10 · 0)을 통째로 가른다. 크기 축이 아니라 배치 축이라는 점에서 Alert 의 Layout 과 같다. 코드에서는 `data-chart` 이고 기본이 area 다.",
      },
      State: {
        options: ["default", "insufficient", "loading"],
        reason:
          "슬롯에 무엇이 들어가는가. **액자의 값은 하나도 바꾸지 않아서 기하 키에 넣지 않았다** — 넣으면 같은 값이 세 번 담기고 한 칸만 어긋나도 그 사실이 배열 길이가 아니라 키 이름에 숨는다. 여섯 칸 전부 제품에 그림이 있다: insufficient 의 spark 는 곡선을 아예 그리지 않고(정본이 `hasSpark ? … : null`), loading 은 ReportKpiRowSkeleton 과 ChartSkeleton 이다. 계획서가 적은 3×3 중 셋은 제품에 그림이 없어 만들지 않았다 — 없는 칸을 그리면 그 칸이 규범이 된다.",
      },
      Label: { type: "TEXT", reason: "지표 이름. 코드에서는 소비처가 넘기는 문구다." },
      Meta: {
        type: "TEXT",
        reason:
          "기간 표기. **area 변형에만 노드가 있다** — spark 카드의 헤더에는 제목 하나뿐이고, 불리언으로 숨기면 component set 단위로 합쳐져 area 의 기간까지 사라진다. 그래서 가시성이 아니라 구조로 갈랐다.",
      },
      Value: { type: "TEXT", reason: "서식이 끝난 수치 문자열." },
      DeltaLabel: { type: "TEXT", reason: "증감 알약 문구. 알약 자체는 stat-tile 이 소유하는 조형이고 두 세트가 같은 기하를 각각 그린다 — 별도 component 로 올리면 계약과 채취 명세가 하나 더 느는데 그 값은 이미 두 세트의 Delta 자손으로 대조된다." },
    },
    geometry: {
      measuredId: "chart-card",
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
        Header: {
          fields: {
            paddingBlock: "headerPaddingBlock",
            paddingBlockEnd: "headerPaddingBlockEnd",
            paddingInline: "headerPaddingInline",
            paddingInlineEnd: "headerPaddingInline",
            itemSpacing: "headerGap",
          },
        },
        Label: { fields: { fontSize: "labelFontSize" } },
        // 기간은 area 에만 있다. `optional` 은 **근거 값이 함께 없을 때만** 통과하므로
        // spark 의 기록에 metaFontSize 를 남겨 둔 채 Figma 에서 노드만 지우는 길은 없다.
        Meta: { optional: true, fields: { fontSize: "metaFontSize" } },
        Panel: {
          fields: {
            paddingBlock: "panelPaddingBlock",
            paddingBlockEnd: "panelPaddingBlock",
            paddingInline: "panelPaddingInline",
            paddingInlineEnd: "panelPaddingInline",
            itemSpacing: "panelGap",
            cornerRadius: "panelRadius",
            // 같은 사실을 두 매체가 다른 어휘로 적는 축이다 — CSS 는 flex-direction 으로
            // column/row 라 쓰고 Figma 는 layoutMode 로 VERTICAL/HORIZONTAL 이라 쓴다.
            // 기록에는 코드 값만 두고 변환은 계약이 진다.
            layoutMode: { enum: "panelLayout", table: { column: "VERTICAL", row: "HORIZONTAL" } },
            // **최소 높이는 계약 밖이다.** Figma 는 minHeight 에 0 을 넣지 못하고(플러그인 API 가
            // 거부한다) null 로 두면 되읽기에서 통째로 빠진다. 그래서 area 쪽에 「하한 없음」을
            // 적을 자리가 없고, spark 의 92 만 걸면 area 는 아무 값이나 가져도 통과한다.
            // 한 방향만 재느니 축을 통째로 빼고 코드 쪽에서 두 칸을 다 잰다
            // (chart-card.browser.test.tsx). 기록의 spark.panelMinHeight 가 그 사실을 소유한다.
          },
        },
        Value: { fields: { fontSize: "valueFontSize" } },
        Delta: {
          fields: {
            paddingBlock: "deltaPaddingBlock",
            paddingBlockEnd: "deltaPaddingBlock",
            paddingInline: "deltaPaddingInline",
            paddingInlineEnd: "deltaPaddingInline",
            cornerRadius: "deltaRadius",
          },
        },
        // 넓은 곡선 슬롯. area 의 default 변형에만 있고, 담는 값은 **비율이 만드는 높이의
        // 하한**이다 — 비율(4:1)은 Figma 가 표현하지 못한다.
        Chart: { optional: true, fields: { height: "chartMinHeight" } },
        Spark: { optional: true, fields: { height: "sparkHeight", width: "sparkWidth" } },
      },
    },
  },
  // ── 변형 프레임 — 크롭 창과 선택 상자가 한 벌이다 ─────────────────────────
  // 제품에 같은 조형이 **넷** 있고 셋이 서로 다른 규범이었다(DS-D-0060). 값의 출처와 어느
  // 실측을 왜 버렸는지는 `figma/components.measured.json` 의 transform-frame 이 칸마다 적는다.
  {
    id: "transform-frame",
    figmaName: "TransformFrame",
    figmaAhead:
      "React 표면 없음 — packages/css/src/component/transform-frame.css 가 정본이다.",
    variantProperties: {},
    figmaOnlyProperties: {
      Handles: {
        options: ["corners", "corners-and-edges"],
        reason:
          "**내놓는 손잡이 벌이 갈린다.** 여덟 자리(nw·n·ne·e·se·s·sw·w)는 축이 아니라 이름표이고, 갈리는 것은 변 넷을 함께 내놓느냐 하나뿐이다. 비율이 잠기면 변 손잡이가 사라진다 — 변을 혼자 끌면 비율을 지키느라 반대 축도 움직여 「한쪽만 줄인 게 아니다」가 되기 때문이고, 제품 두 구현이 이미 그 규칙을 갖고 있다. 그래서 Ratio 를 따로 열지 않는다: 두 축을 다 열면 실현되지 않는 칸이 둘 생긴다. **값이 소문자에 하이픈인 것은 CSS 속성값과 같은 철자를 쓰기 위해서다** — Alert 의 `Layout=block` 과 같은 규칙이다.",
      },
      Grid: {
        type: "BOOLEAN",
        reason:
          "삼분할 안내선의 유무. 크롭 창은 그것을 늘 그리고(ClipCropModal) 선택 상자는 그리지 않는다(PreviewOverlayLayer) — 같은 프레임의 슬롯이지 기하를 바꾸는 축이 아니라 §3 대로 BOOLEAN 이다. **두 변형 모두에 노드가 있고 마스터에서 켜져 있다**: 한 변형에서만 숨기면 불리언이 세트 단위라 다른 변형의 그 슬롯까지 사라진다.",
      },
    },
    // 프레임과 손잡이가 **같은 두께**를 쓰는 것이 계약이다. 그래서 실측에 두께 키가 하나뿐이고
    // 네 역할이 같은 키를 가리킨다 — 손잡이만 굵어지면 여덟 자리가 창보다 무거워진다.
    strokes: {
      self: { weight: "borderWidth", align: "INSIDE" },
      HandleCorner: { weight: "borderWidth", align: "INSIDE" },
      HandleEdgeH: { weight: "borderWidth", align: "INSIDE" },
      HandleEdgeV: { weight: "borderWidth", align: "INSIDE" },
    },
    // 그림자도 흐림도 없다. 창 안쪽은 매체가 그대로 보여야 하고, 손잡이는 자기 면과 링만으로
    // 어떤 사진 위에서도 선다 — 그림자로 대비를 벌면 그 사실이 흐려진다.
    effects: {},
    geometry: {
      measuredId: "transform-frame",
      // **폭과 높이를 보지 않는다.** 이 프레임의 크기는 사용자가 끄는 크롭 창의 크기다.
      // 표본의 240×160 을 계약에 넣으면 다음 사람이 그것을 규격으로 읽는다.
      fields: {
        cornerRadius: "radius",
        // 손잡이가 변의 바깥으로 절반 나가므로 흐름 배치가 성립하지 않는다.
        layoutMode: { literal: "NONE" },
      },
      slots: {},
      extraStrokeWeights: [],
      parts: {
        // 안내선 묶음은 값을 비운다 — 크기가 곧 창의 크기라 계약이 아니다. 자손 자체는
        // 선언해야 「계약에 없는 자손」으로 걸리지 않는다(StepTile 의 Caption 과 같다).
        Grid: { fields: {} },
        GridLineV: { fields: { width: "gridLineWidth" } },
        GridLineH: { fields: { height: "gridLineWidth" } },
        HandleCorner: {
          fields: {
            width: "handleSize",
            height: "handleSize",
            cornerRadius: "handleRadius",
          },
        },
        // **필드 순서가 계약이다.** `optional` 은 `Object.values(fields)[0]` 이 가리키는 실측
        // 키가 그 size 에 없을 때만 자손의 부재를 통과시킨다. `handleSize` 를 앞에 두면 그
        // 키는 corners 에도 있어서 「없어야 하는데 값이 남았다」와 구분되지 않는다 — 두
        // 항목 모두 `edgeHandleSize` 를 첫 칸에 둔다. 그 키가 `handleSize` 와 **같은 값을
        // 갖는데도** 따로 있는 이유가 이것이다(DS-D-0062).
        HandleEdgeH: {
          optional: true,
          fields: {
            width: "edgeHandleSize",
            height: "handleSize",
            cornerRadius: "handleRadius",
          },
        },
        HandleEdgeV: {
          optional: true,
          fields: {
            height: "edgeHandleSize",
            width: "handleSize",
            cornerRadius: "handleRadius",
          },
        },
      },
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

// 하한 칸(`{ atLeast }`)의 검출력. 사이드바 CTA 펼친 variant 의 높이를 기록의 최소값보다 1 낮춘다 — 「최소값 이상」
// 대조가 조용히 아무것도 안 보게 되면(예: `continue` 가 비교 전에 걸리면) 여기서 문다.
function tamperComponentAtLeast(snapshot) {
  const geometry = snapshot.components?.SidebarCta?.geometry;
  const heights = geometry?.false?.height;
  if (!Array.isArray(heights) || heights.length === 0) return null;
  geometry.false.height = [39];
  return "SidebarCta false 의 높이를 기록의 최소값(40)보다 낮은 39 로 바꿈";
}

// 크기별 칸(`{ bySize }`)의 검출력. Tooltip base 의 위 패딩을 옛 접기 값 4.5(패딩 4 + 헤어라인 0.5)로 되돌린다 —
// 크기별 규칙이 coachmark 의 접기를 base 에도 건네게 망가지면 여기서 문다.
function tamperComponentBySize(snapshot) {
  const base = snapshot.components?.Tooltip?.geometry?.base;
  if (!Array.isArray(base?.paddingBlock) || base.paddingBlock[0] === 4.5) return null;
  base.paddingBlock = [4.5];
  return "Tooltip base 의 위 패딩을 옛 접기 값 4.5 로 바꿈";
}

const TAMPERS = [
  tamperComponentBySize,
  tamperComponentAtLeast,
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

// 계산에서 나온 기대값은 판정과 무관하게 인쇄한다 — 초록일 때도 무엇과 맞댔는지가 남아야 건너뛴 칸과 구별된다.
for (const [label, note] of derivationNotes) console.log(`[figma-parity] ${label}: ${note}`);
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

/**
 * template 규칙 칸의 식을 계산한다. 문법은 사칙연산 · 괄호 · 수 · `round2(식)` · 칸 참조다 — 칸 참조는 같은 template 의
 * 칸 이름(`railWidth`)이거나 `<template>.<칸>`(`app-shell.mainWidth`)이다. template 이름에 `-` 가 들어가므로 **뺄셈은
 * 앞뒤를 띄운다.** 참조한 칸이 또 규칙이면 따라가고, 순환 · 없는 칸 · 수가 아닌 칸은 오류로 돌려준다(조용히 0 이 되지 않는다).
 * `round2` 는 build-figma-snapshot 이 비율 칸을 접는 자리수와 같다.
 */
function evaluateTemplateRule(name, field, stack = []) {
  const key = `${name}.${field}`;
  if (stack.includes(key)) return { error: `규칙이 순환합니다 (${[...stack, key].join(" → ")})` };
  const spec = templateMeasured.templates?.[name]?.[field];
  if (spec === undefined) return { error: `${key} 칸이 없습니다` };
  if (spec.rule === undefined) {
    return Number.isFinite(spec.value) ? { value: spec.value, expanded: String(spec.value) } : { error: `${key} 가 수가 아닙니다 (${JSON.stringify(spec.value)})` };
  }
  const source = String(spec.rule);
  const tokens = source.match(/\s*(round2|[a-z][a-z0-9]*(?:-[a-z0-9]+)*\.[A-Za-z][A-Za-z0-9]*|[A-Za-z][A-Za-z0-9]*|\d+(?:\.\d+)?|[-+*/()])/gy);
  if (tokens === null || tokens.join("").replace(/\s/g, "") !== source.replace(/\s/g, "")) return { error: `${key} 규칙을 읽지 못했습니다 (${source})` };
  const list = tokens.map((token) => token.trim());
  let index = 0;
  const peek = () => list[index];
  const fail = (message) => { throw new Error(message); };
  const factor = () => {
    const token = list[index++];
    if (token === undefined) fail(`${key} 규칙이 중간에 끝납니다 (${source})`);
    if (token === "(") { const inner = expression(); if (list[index++] !== ")") fail(`${key} 규칙의 괄호가 닫히지 않습니다 (${source})`); return { value: inner.value, expanded: `(${inner.expanded})` }; }
    if (token === "round2") {
      if (list[index++] !== "(") fail(`${key} 규칙의 round2 뒤에 괄호가 없습니다 (${source})`);
      const inner = expression();
      if (list[index++] !== ")") fail(`${key} 규칙의 괄호가 닫히지 않습니다 (${source})`);
      return { value: Math.round(inner.value * 100) / 100, expanded: `round2(${inner.expanded})` };
    }
    if (/^\d/.test(token)) return { value: Number(token), expanded: token };
    if (/^[A-Za-z]/.test(token)) {
      const [refName, refField] = token.includes(".") ? token.split(".") : [name, token];
      const resolved = evaluateTemplateRule(refName, refField, [...stack, key]);
      if (resolved.error !== undefined) fail(resolved.error);
      return { value: resolved.value, expanded: String(resolved.value) };
    }
    return fail(`${key} 규칙에 뜻밖의 기호 ${token} (${source})`);
  };
  const term = () => {
    let left = factor();
    while (peek() === "*" || peek() === "/") {
      const op = list[index++];
      const right = factor();
      left = { value: op === "*" ? left.value * right.value : left.value / right.value, expanded: `${left.expanded} ${op === "*" ? "×" : "/"} ${right.expanded}` };
    }
    return left;
  };
  const expression = () => {
    let left = term();
    while (peek() === "+" || peek() === "-") {
      const op = list[index++];
      const right = term();
      left = { value: op === "+" ? left.value + right.value : left.value - right.value, expanded: `${left.expanded} ${op === "+" ? "+" : "−"} ${right.expanded}` };
    }
    return left;
  };
  try {
    const result = expression();
    if (index !== list.length) return { error: `${key} 규칙 끝에 남은 기호가 있습니다 (${list.slice(index).join(" ")})` };
    if (!Number.isFinite(result.value)) return { error: `${key} 규칙이 수를 내지 않습니다 (${source})` };
    return result;
  } catch (error) {
    return { error: error.message };
  }
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
      let want = spec.value;
      if (spec.rule !== undefined) {
        // **규칙 칸(2026-09-15).** 다른 칸에서 계산되는 크기는 수가 아니라 식으로 적는다 — 레일 폭 하나가 움직이면
        // 본문 폭 · 컨테이너 폭 · 카드 폭이 따라와야 하는데, 수로 적힌 사본은 같이 낡아 초록이었다(앵커 2c6bdacf).
        if (Object.hasOwn(spec, "value")) {
          issues.push(
            `${TEMPLATE_MEASURED_PATH}의 ${name}.${field} 는 규칙 칸(${spec.rule})인데 수(${JSON.stringify(spec.value)})가 있습니다 — 계산된 크기를 기록에 굳혔습니다.`,
          );
          continue;
        }
        const derived = evaluateTemplateRule(name, field);
        if (derived.error !== undefined) {
          issues.push(`${TEMPLATE_MEASURED_PATH}의 ${name}.${field} 규칙을 계산하지 못했습니다 — ${derived.error}`);
          continue;
        }
        want = derived.value;
        derivationNotes.set(
          `규칙 ${name}.${field}`,
          `${spec.rule} = ${derived.expanded === String(want) ? "" : `${derived.expanded} = `}${want} · Figma ${JSON.stringify(got[field] ?? null)}`,
        );
      }
      if (typeof spec.$pending === "string") {
        // **옮기지 않은 제품 변화.** 제품이 움직였는데 판정(소유자 · DS 토큰)이 남아 기록을 옮기지 않은 칸이다. 조용히 두면
        // 사본이 같이 낡은 초록과 구별되지 않으므로 매 실행 인쇄한다.
        derivationNotes.set(`대기 ${name}.${field}`, `기록 ${JSON.stringify(want)} · ${spec.$pending.split(" — ")[0]} (사유: ${TEMPLATE_MEASURED_PATH} 의 \$pending)`);
      }
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
// **다른 컴포넌트 기록의 값을 읽는 규칙 `{ from: [컴포넌트, size, 필드] }`.** 스스로 크기를 선언하지 않는 자손
// (hug 슬롯)은 담은 컴포넌트의 크기를 따른다. 그 수를 담는 쪽 기록에 한 번 더 적으면 담긴 컴포넌트가 움직일 때
// 사본만 낡는다 — 실측(2026-09-14): AppTopBar 의 `trailingSlotHeight` 36 이, 제품 앵커 6f6282c1 에서 ProgressRing
// 기록이 32 로 옮긴 뒤에도 남아 있었다. 같은 날 선행 슬롯의 `leadingSlotHeight` 사본도 IconButton 기록으로 옮겼다.
// 없는 경로는 undefined 가 되어 아래 「근거 값이 없습니다」로 걸린다 — verify-gates 의 canary 가 그 길을 문다.
function fromMeasured([componentId, sizeKey, field]) {
  return componentsMeasured.components?.[componentId]?.sizes?.[sizeKey]?.[field];
}

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
    // 기록 칸이 아니라 계산에서 나온 기대값의 출처(채움 칸). 어긋남 문구가 「코드 실측」이라 거짓말하지 않게 한다.
    const derivedFrom = {};
    for (const [field, rule] of Object.entries(plan.fields ?? {})) {
      if (typeof rule === "string") {
        expected[field] = spec[rule];
      } else if (Array.isArray(rule)) {
        expected[field] = rule.reduce((total, key) => total + spec[key], 0);
      } else if (typeof rule?.enum === "string") {
        // **같은 사실을 두 매체가 다른 어휘로 적는 축.** 정렬이 그렇다 — CSS 는 `align-items`
        // 로 `center`/`flex-start` 라 쓰고 Figma 는 `counterAxisAlignItems` 로 `CENTER`/`MIN`
        // 이라 쓴다. measured 에는 **코드 값**만 둔다(이 파일 `$states` 규약: "여기에 Figma
        // 이름을 적으면 정본이 둘이 된다"). 그래서 매체 간 변환은 계약이 진다. 표에 없는
        // 코드 값은 undefined 가 되어 아래 "근거 값이 없습니다" 로 걸린다 — 조용히 통과하는
        // 길이 없다.
        expected[field] = rule.table[spec[rule.enum]];
      } else if (Array.isArray(rule?.from)) {
        expected[field] = fromMeasured(rule.from);
      } else if (typeof rule?.field === "string" && Array.isArray(rule.fillIn)) {
        // **채움 칸 `{ field, fillIn: [size…], fill: <원천> }`(2026-09-15).** 부모를 채우는 크기는 계산값이라 기록에 수를
        // 두지 않고 `$<field>` 에 규칙을 적는다(figma-screen-assembly.md 28번). 기록이 수를 되찾으면(사본이 다시 굳으면)
        // 실패한다. 실측 사고: SidebarBrand · SidebarCta 의 펼친 폭 256 이 레일 280 − 패딩 24 의 결과였고 제품
        // bc3e6fa3(레일 240)에 함께 낡았다. **그 size 의 Figma 표본은 건너뛰지 않는다** — 기대값을 `fill` 원천(DS 토큰)
        // 에서 계산해 맞대고, 계산 과정을 출력에 남긴다. 첫 판(같은 날)은 여기서 대조 없이 넘어가, 토큰이 움직여도
        // 표본 폭을 옮길 자리를 아무도 말하지 않았다. 나머지 size 는 평소처럼 `field` 를 읽는다.
        if (rule.fillIn.includes(size)) {
          if (typeof spec[rule.field] === "number") {
            issues.push(
              `${COMPONENTS_MEASURED_PATH}의 ${plan.measuredId}.${size}.${rule.field} 는 채움 칸인데 수(${spec[rule.field]})가 있습니다 — 계산된 크기를 기록에 굳혔습니다.`,
            );
          } else if (typeof spec["$" + rule.field] !== "string") {
            issues.push(`${COMPONENTS_MEASURED_PATH}의 ${plan.measuredId}.${size}에 채움 칸 ${rule.field} 의 규칙(\$${rule.field})이 없습니다.`);
          }
          const source = FILL_SOURCES[rule.fill];
          const fill = source === undefined ? { error: `알 수 없는 채움 원천 ${JSON.stringify(rule.fill)}` } : source();
          if (fill.error !== undefined) {
            issues.push(`${contract.figmaName} ${size}: 채움 칸 ${field} 의 기대값을 계산하지 못했습니다 — ${fill.error}`);
            continue;
          }
          expected[field] = fill.value;
          derivedFrom[field] = `DS 레일 내용 폭 ${fill.value} (${fill.formula})`;
          derivationNotes.set(
            `채움 칸 ${contract.figmaName} ${size}.${field}`,
            `기대 ${fill.value} (${fill.formula}) · Figma ${JSON.stringify(geometry[size]?.[field] ?? null)}`,
          );
          continue;
        }
        expected[field] = spec[rule.field];
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
      } else if (rule?.bySize && typeof rule.bySize === "object") {
        // **크기마다 다른 규칙 `{ bySize: { <size>: <키 | 키 목록> } }`(2026-10-06).** 한 계약 안에서 크기에 따라 출처가
        // 갈리는 칸 — Tooltip 의 패딩이 그렇다(base 는 inset 헤어라인, coachmark 는 진짜 테두리). 목록이면 더한다.
        // 규칙에 없는 크기는 undefined 가 되어 아래 「근거 값이 없습니다」로 걸린다.
        const pick = rule.bySize[size];
        expected[field] = typeof pick === "string"
          ? spec[pick]
          : Array.isArray(pick) ? pick.reduce((total, key) => total + spec[key], 0) : undefined;
      } else if (typeof rule?.atLeast === "string") {
        // **하한 칸 `{ atLeast: <기록 키> }`(2026-10-06).** 기록이 CSS `min-*` 를 잰 칸이면 Figma 는 그 이상이면 된다 —
        // 내용이 정하는 크기(HUG)를 최소값과 같은 수로 굳히지 않게 한다(figma-screen-assembly.md 28번).
        expected[field] = spec[rule.atLeast] === undefined ? undefined : { atLeast: spec[rule.atLeast] };
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
      if (want !== null && typeof want === "object" && typeof want.atLeast === "number") {
        const below = values.filter((value) => value < want.atLeast);
        if (below.length > 0) {
          issues.push(
            `${contract.figmaName} ${size}: ${field}가 코드의 최소값 ${want.atLeast} 보다 작습니다 — Figma [${values.join(", ")}]`,
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
          `${contract.figmaName} ${size}: ${field}가 다릅니다 — ${derivedFrom[field] ?? `코드 실측 ${want}`}, Figma ${values[0]}`,
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
    // 규칙은 root의 `fields`와 **같다**(문자열=measured 키, 배열=합, `enum`·`set`·`from`, 그 밖의 객체=literal).
    // 새 어휘를 만들지 않아야 계약을 읽는 사람이 두 규칙을 외우지 않는다 — `from` 을 더할 때도 두 자리에 함께 넣었다.
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
        else if (typeof rule?.enum === "string") {
          // **root 의 같은 `enum` 규칙.** 위 주석이 「규칙은 root 의 fields 와 같다」고 적는데
          // 실제로는 여기에 `enum` 이 없었다 — root 에만 있었고 이 자리는 따라오지 않았다.
          // 그래서 「자손의 방향이 축에서 갈린다」를 계약으로 적을 수 없었고, 적으면
          // "근거 값이 없습니다" 로 떨어졌다. `set` 이 DS-D-0049 에서 같은 이유로 따라온
          // 선례가 있다. 표에 없는 코드 값은 undefined 가 되어 아래에서 걸린다 —
          // 조용히 통과하는 길이 없다.
          want = rule.table[spec[rule.enum]];
        } else if (Array.isArray(rule?.from)) {
          want = fromMeasured(rule.from);
        } else if (Array.isArray(rule?.set)) {
          // **root와 같은 `set` 규칙.** 위 주석이 「규칙은 root의 fields와 같다」고 적는데
          // 실제로는 여기에 `set`이 없었다 — root에만 나중에 붙었고 이 자리는 따라오지
          // 않았다. 그래서 「한 축이 이 자손의 필드를 바꾼다」를 계약으로 적을 수 없었고,
          // 적으면 "근거 값이 없습니다"로 떨어졌다. 주석이 참이 되도록 맞춘다 (DS-D-0049).
          const members = rule.set.map((key) => spec[key]);
          want = members.some((value) => value === undefined || Number.isNaN(value))
            ? undefined
            : { set: members };
        } else want = rule.literal;
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
        if (want !== null && typeof want === "object" && Array.isArray(want.set)) {
          // 대조는 **집합 상등**이다. 어느 변형이 어느 값을 갖는지는 보지 않는다 — 되읽기가
          // size별로 값을 모으기 때문이고, root의 같은 규칙이 이미 그 한계를 적어 두었다.
          const sort = (list) => [...new Set(list)].sort((a, b) => a - b);
          const gotSet = sort(values);
          const wantSet = sort(want.set);
          if (
            gotSet.length !== wantSet.length ||
            gotSet.some((value, index) => value !== wantSet[index])
          ) {
            issues.push(
              `${contract.figmaName} ${size}: ${partName}.${field}의 값 집합이 다릅니다 — 코드 실측 {${wantSet.join(", ")}}, Figma {${gotSet.join(", ")}}`,
            );
          }
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
    // 문자열은 「모든 변형이 이 효과다」, 배열은 「변형마다 이 중 하나이고, 목록의 효과는 전부 어딘가에
    // 선다」다. 되읽기가 역할별로 변형을 모아 적으므로(`figma-readback-emit` 의 push) 어느 변형이 어느
    // 효과인지는 여기서 가를 수 없다 — 그 대응은 브라우저 테스트가 맡는다. 뒤 조건이 없으면 계약한
    // 효과가 Figma 에서 통째로 사라져도 남은 값이 전부 허용이라 초록이 된다.
    const allowed = Array.isArray(expected) ? expected : [expected];
    const wrong = values.filter((value) => !allowed.includes(value));
    if (wrong.length > 0) {
      const shown = Array.isArray(expected) ? `[${expected.join(", ")}] 중 하나` : `"${expected}"`;
      issues.push(
        `${contract.figmaName}: ${role}의 effect가 다릅니다 — 기대 ${shown}, 실제 [${values.join(", ")}]`,
      );
    }
    if (Array.isArray(expected)) {
      const absent = allowed.filter((value) => !values.includes(value));
      if (absent.length > 0) {
        issues.push(`${contract.figmaName}: ${role}에 계약한 effect가 Figma 에 없습니다 — ${absent.join(", ")}`);
      }
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
    // **높이를 담지 않는 컴포넌트가 있다.** TransformFrame 의 프레임 크기는 사용자가 끄는
    // 영역의 크기라 계약이 아니고, 그래서 되읽기가 height 를 담지 않는다. 그 항목이 배열
    // 앞쪽에 오면 이 카나리아가 `undefined[0]` 으로 **터졌다** — 게이트가 실패가 아니라
    // 크래시를 낸다. 담는 첫 컴포넌트로 넘어간다: 검출력은 그대로다(어느 하나만 잡으면 된다).
    if (!Array.isArray(geometry[size].height) || geometry[size].height.length === 0) continue;
    // **높이를 담지 않는 계약이 있다.** 채취 명세가 `fields` 를 좁혀 `height` 를 빼면 이 자리의
    // 배열이 undefined 라 `[0]` 이 던진다 — 2026-09-07 에 목록 맨 앞의 계약이 그래서 게이트가
    // 진단 대신 스택트레이스를 냈다. 그런 계약은 **건너뛰고 다음 것을 변조한다.** 검출력을
    // 낮추는 것이 아니다: 이 canary 가 증명하려는 것은 「높이가 어긋나면 잡힌다」이고, 높이를
    // 재지 않는 계약에서는 증명할 것 자체가 없다.
    if (!Array.isArray(geometry[size].height) || geometry[size].height.length === 0) continue;
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
    // 위 tamperComponentHeight 와 같은 이유다 — 좌우 여백을 담지 않는 계약은 건너뛴다.
    if (!Array.isArray(geometry[size].paddingInline) || geometry[size].paddingInline.length === 0) continue;
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

/** stroke 두께 변조. 헤어라인 테두리를 2px로 바꿔도 잡혀야 한다.
 * 첫 후보는 stroke 역할이 남아 있는 계약이며 지금은 IconButton이다 — Button은 stroke가
 * 하나도 없는 것이 계약이라(위 button 항목) 이 카나리아가 집을 역할이 없다. */
function tamperComponentStrokeWeight(document) {
  for (const contract of COMPONENT_CONTRACTS) {
    const strokes = document.components?.[contract.figmaName]?.strokes;
    const role = Object.keys(contract.strokes ?? {}).find((key) => Array.isArray(strokes?.[key]));
    if (role === undefined) continue;
    // **고정값 `"2|INSIDE"` 를 쓰면 안 된다.** 계약의 테두리가 마침 2 인 컴포넌트가 목록 앞에
    // 오면 변조가 no-op 이 되어 canary 가 「잡지 못했다」로 스스로 실패한다 — 2026-09-07 에
    // 목록 맨 앞의 계약이 그랬다. 실제 값에서 **2 를 더해** 언제나 달라지게 만든다.
    strokes[role] = strokes[role].map((value) =>
      value.replace(/^[\d.]+/, (weight) => String(Number(weight) + 2)),
    );
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
