#!/usr/bin/env node
// **기록이 자기 자신의 근거가 되지 않게 한다.**
//
// `figma/components.measured.json` 은 Figma 를 그리는 정본이자 parity 게이트가 대조하는 값이다.
// 그래서 Figma ↔ 기록은 기록이 내부적으로 일관되기만 하면 언제나 초록이다 — 기록이 레시피와
// 어긋나도 그 사실을 아무도 보지 않는다. AGENTS.md 가 「기록은 자기 자신의 근거가 아니다」로
// 적어 둔 상태가 정확히 그것이다.
//
// 이 게이트가 반대 방향을 잰다: **레시피의 선언 → (토큰이면) 토큰 값 → 기록의 값.** 브라우저
// 계산값이 아니라 저작 원본의 글자를 읽으므로 캐스케이드가 만드는 문제는 잡지 못한다. 잡는
// 것은 하나뿐이고 그것이 실제로 일어나는 사고다 — 한쪽만 고치고 다른 쪽을 두고 가는 것.
//
// **이웃 게이트와 겹치지 않는다.**
//   verify-figma-parity      Figma ↔ 기록. 레시피를 보지 않는다.
//   verify-record-citations  기록의 `$` 사유 산문 ↔ 토큰 값. 레시피를 보지 않는다.
//   이 게이트                레시피 선언 ↔ 기록 값. 셋 중 유일하게 CSS 저작 원본을 읽는다.
//
// **왜 vitest 가 아니라 게이트인가.** 이 검사는 원래 `packages/css/test/` 아래의
// inspector-row.node.test.ts 였고 이 회차에서 지웠다. 파일을 읽어 검증하는 일이라 `node:fs` 를
// 물었는데, 루트 tsconfig 의 `types` 는 `["vitest/globals"]` 뿐이고 `@types/node` 는 설치되어
// 있지 않다 — 넣으면 라이브러리 코드가 node 내장을 쓰는 것을 타입 검사가 더는 막지 못한다.
// `packages/` 안에서 `node:fs` 를 물던 `.ts` 는 그 파일 하나뿐이었고, 반대로 파일을 읽어
// 검증하는 `scripts/*.mjs` 게이트는 60 개가 넘는다. 검사를 줄이지 않고 자리만 옮겼다.
import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { notMeasured } from "./lib/gate-exit.mjs";

const TAG = "recipe-record";
const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const RECORD = "figma/components.measured.json";
const TOKENS_CSS = "packages/tokens/generated/tokens.css";
const MANIFEST = "design/manifest.json";
const RECIPE_DIR = "packages/css/src/component";

// ── 무엇을 재는가 ─────────────────────────────────────────────────────────
//
// **한 컴포넌트에 매이지 않게 표로 연다.** 아래 한 항목이 「레시피 하나 ↔ 기록의 한 컴포넌트」다.
// 다음 사람이 재고 싶은 레시피가 생기면 항목을 하나 더 적으면 되고, 그 안의 `geometry` 는
// 줄 하나가 대조 하나다.
//
//   geometry  [선택자, CSS property, 기록의 sizes 키, 그 안의 값 이름]
//             레시피의 선언을 수로 푼다 — `var(--louis-*)` 는 토큰 표에서 찾고 `12px` 는 그대로
//             읽는다. 그 수가 기록의 값과 같아야 한다.
//   surfaces  [선택자, 규칙 본문에 반드시 들어 있어야 하는 글자]
//             수가 아니라 **이름**을 고정한다. 값이 같아도 이름이 다르면 결정이 뒤집히는 자리다.
//   forbidden 레시피 전체에 나타나면 안 되는 글자.
//
// 표에 없는 레시피는 이 게이트가 재지 않는다 — 새 recipe 를 세우면 항목을 함께 적어야 하고,
// 적지 않으면 그 레시피는 기록과 어긋나도 여기서 조용히 지나간다.
const RECIPES = [
  {
    component: "inspector-row",
    recipe: "packages/css/src/component/inspector-row.css",
    geometry: [
      // 행
      [".louis-inspector-row", "min-block-size", "row", "height"],
      [".louis-inspector-row", "padding-inline", "row", "paddingInline"],
      [".louis-inspector-row", "gap", "row", "gap"],
      [".louis-inspector-row", "border-radius", "row", "radius"],
      // 값 묶음과 색 점
      [".louis-inspector-row__value", "gap", "row", "valueGap"],
      [".louis-inspector-row__dot", "inline-size", "row", "dotSize"],
      [".louis-inspector-row__dot", "block-size", "row", "dotSize"],
      // 알약
      [".louis-inspector-row__pill", "min-block-size", "row", "pillHeight"],
      [".louis-inspector-row__pill", "padding-inline", "row", "pillPaddingInline"],
      [".louis-inspector-row__pill", "gap", "row", "pillGap"],
      [".louis-inspector-row__pill", "border-radius", "row", "pillRadius"],
      // 숫자 칸
      [".louis-inspector-row__number", "inline-size", "row", "numberWidth"],
      [".louis-inspector-row__number", "block-size", "row", "numberHeight"],
      [".louis-inspector-row__number", "padding-inline", "row", "numberPaddingInline"],
      [".louis-inspector-row__number", "border-radius", "row", "numberRadius"],
      // 절 머리
      [".louis-inspector-section-head", "gap", "head", "rowGap"],
      [".louis-inspector-section-head", "padding-block-end", "head", "paddingBlockEnd"],
      [".louis-inspector-section-head__tail", "gap", "head", "tailGap"],
      [".louis-inspector-section-head__action", "inline-size", "head", "actionSize"],
      [".louis-inspector-section-head__action", "block-size", "head", "actionSize"],
      [".louis-inspector-section-head__action", "border-radius", "head", "actionRadius"],
      [".louis-inspector-section-head__glyph", "inline-size", "head", "glyphSize"],
    ],
    // 행의 면은 사다리 토큰이고 팔레트 원시값이 아니다. 라이트에서 정본과 갈리는 자리라
    // 갈리는 것 자체가 결정이고, 누가 팔레트 칸을 직접 적어 「고쳐 두면」 그 결정이 조용히
    // 뒤집힌다. 이름을 고정해 그 되돌림을 막는다.
    surfaces: [
      [".louis-inspector-row", "var(--louis-color-bg-inset)"],
      [".louis-inspector-row__number", "var(--louis-color-bg-raised)"],
      [".louis-inspector-row__pill", "var(--louis-color-bg-canvas)"],
    ],
    forbidden: ["--louis-color-palette-gray"],
  },
  // ── 캔버스 위에 뜨는 크롬 ────────────────────────────────────────────────
  //
  // **한 레시피 파일에 두 항목이다.** 기록도 Figma 도 둘로 서고(FloatingShell · PillTrigger)
  // 문서와 CSS 파일만 하나다 — 재료가 하나이기 때문이다. 그래서 여기서도 두 줄로 연다: 접으면
  // 「셸의 4」와 「트리거의 12」가 각자 어느 기록 칸에서 왔는지가 사라진다.
  //
  // 흐림 4 를 **지역 변수 선언으로** 잰다. LOUIS 흐림 사다리(10 · 12 · 16)에 4 가 없어 이름을
  // 줄 수 없고, `backdrop-filter: blur(…)` 는 이 게이트가 수로 풀 수 있는 형태가 아니다. 값을
  // `--louis-floating-shell-blur` 로 한 번 발행하고 그 선언을 기록의 `blurRadius` 와 대조하면,
  // 이름 없는 값이 게이트 밖에 남지 않는다.
  {
    component: "floating-shell",
    recipe: "packages/css/src/component/floating-shell.css",
    geometry: [
      // 셸 — 높이 40 은 여기에 없다. 계약이 그것을 「선언 없는 파생값(4 + 32 + 4)」이라 적고
      // 레시피도 선언하지 않으므로 대조할 선언이 없다. 40 이 실제로 나오는지는
      // packages/react/test/floating-shell.browser.test.tsx 가 렌더해서 잰다.
      [".louis-floating-shell", "--louis-floating-shell-blur", "shell", "blurRadius"],
      [".louis-floating-shell", "padding-block", "shell", "paddingBlock"],
      [".louis-floating-shell", "padding-inline", "shell", "paddingInline"],
      [".louis-floating-shell", "gap", "shell", "gap"],
      [".louis-floating-shell", "border-radius", "shell", "radius"],
      // 조각의 자리 — 안에 무엇이 서는지는 계약이 아니고 겉 크기와 곡률만 계약이다.
      [".louis-floating-shell__item", "inline-size", "shell", "itemSize"],
      [".louis-floating-shell__item", "block-size", "shell", "itemSize"],
      [".louis-floating-shell__item", "border-radius", "shell", "itemRadius"],
    ],
    // 면은 값이 아니라 **이름**이 계약이다. 라이트 palette-gray 050 · 다크 palette-gray 800 은
    // `color-bg-menu` 와 바이트로 같아서, 누가 팔레트 칸을 직접 적어도 두 테마 모두 픽셀이
    // 같다 — 사다리가 움직이는 날에만 조용히 갈린다. 헤어라인도 같은 이유로 이름을 고정한다:
    // 컴포넌트마다 shadow 문자열을 베끼지 않는다는 것이 DS-D-0023 의 계약이다.
    surfaces: [
      [".louis-floating-shell", "var(--louis-color-bg-menu)"],
      [".louis-floating-shell", "var(--louis-hairline-inset)"],
    ],
    forbidden: ["--louis-color-palette-gray"],
  },
  {
    component: "pill-trigger",
    recipe: "packages/css/src/component/floating-shell.css",
    geometry: [
      // 기록은 세 상태(Default · Hover · Open)를 다 적지만 **기하가 셋 다 같다** — 갈리는 것은
      // 면의 알파와 캐럿의 향뿐이다. 레시피의 선언도 하나뿐이므로 `Default` 한 칸과 대조한다.
      // 갈리는 그 둘(알파 0.72 → 0.88 · 캐럿 180°)은 여기서 재지 않는다 — 이 게이트는 px 만
      // 수로 푼다. 재는 곳은 packages/react/test/floating-shell.browser.test.tsx 이고, 거기서는
      // 합성된 면을 실브라우저에서 읽으므로 알파가 기록대로인지가 직접 대조된다.
      [".louis-pill-trigger", "--louis-floating-shell-blur", "Default", "blurRadius"],
      [".louis-pill-trigger", "block-size", "Default", "height"],
      [".louis-pill-trigger", "padding-inline", "Default", "paddingInline"],
      [".louis-pill-trigger", "gap", "Default", "gap"],
      [".louis-pill-trigger", "border-radius", "Default", "radius"],
      // 라벨의 14 는 스케일 토큰을 거쳐 들어온다 — 게이트가 토큰 표에서 풀어 기록과 맞춘다.
      [".louis-pill-trigger", "font-size", "Default", "labelFontSize"],
      // 캐럿 10 — 아이콘 사다리(16 · 20 · 24) 밖의 값이라 리터럴이고, 그래서 더더욱 기록에
      // 묶여 있어야 한다.
      [".louis-pill-trigger__caret", "inline-size", "Default", "caretSize"],
      [".louis-pill-trigger__caret", "block-size", "Default", "caretSize"],
    ],
    surfaces: [
      [".louis-pill-trigger", "var(--louis-color-bg-menu)"],
      [".louis-pill-trigger", "var(--louis-color-fg-primary)"],
      [".louis-pill-trigger", "var(--louis-hairline-inset)"],
    ],
    forbidden: ["--louis-color-palette-gray"],
  },
  // ── 캔버스 노드 크롬 셋 ──────────────────────────────────────────────────
  // 한 벌의 세 조각이라 표에도 나란히 둔다. 셋 다 기록의 `sizes` 키가 **복합 축**인데
  // 열넷(NodeShell) · 여섯(NodeChromeButton) · 셋(NodeSideHandle) 의 기하가 각각 전부 같다 —
  // 갈리는 것은 색뿐이다. 그래서 대표 한 칸과 대조하고, 그 「전부 같다」는 사실은 기록의
  // `$sizesNote` 와 Figma parity 가 각자 지킨다(parity 는 변형 전수를 되읽기와 맞춘다).
  //
  // **0 인 칸은 표에 없다.** 이 게이트는 `<수>px` 만 수로 푸는데 레시피의 여백 0 은 `0` 이고
  // `0px` 이 아니다. 0 을 재려고 저작 CSS 에 `0px` 을 적게 만드는 것은 게이트가 코드의 철자를
  // 바꾸는 일이라 하지 않는다 — 그 칸들(paddingBlock · paddingInline · gap · borderWidth 0)은
  // Figma 되읽기와 대조하는 parity 게이트가 이미 갖는다.
  {
    component: "node-shell",
    recipe: "packages/css/src/component/node-shell.css",
    geometry: [
      // 바깥 프레임 — 폭과 헤더↔카드 간격.
      [".louis-node-shell", "inline-size", "video/false", "cardWidth"],
      [".louis-node-shell", "gap", "video/false", "headerToCardGap"],
      // 헤더 한 줄. **높이는 크롬 버튼 토큰을 읽는다** — 행이 32 인 것은 제목이 아니라 액션
      // 버튼 때문이고, 그 인과를 레시피가 토큰으로 적었으므로 게이트도 그 자리를 잰다.
      [".louis-node-shell__header", "block-size", "video/false", "headerHeight"],
      [".louis-node-shell__header", "gap", "video/false", "headerGap"],
      [".louis-node-shell__header", "padding-inline", "video/false", "headerPaddingInline"],
      // 제목 묶음 — 격자 밖의 5 라서 더더욱 기록에 묶여 있어야 한다.
      [".louis-node-shell__title", "gap", "video/false", "titleGap"],
      [".louis-node-shell__glyph", "inline-size", "video/false", "glyphSize"],
      [".louis-node-shell__glyph", "block-size", "video/false", "glyphSize"],
      // 라벨의 14 는 스케일 토큰을 거쳐 들어온다. 줄 높이 1 은 여기서 재지 않는다 — 수가
      // 아니라 비율이고, 그 결과값(labelHeight 14)은 Figma 되읽기가 갖는다.
      [".louis-node-shell__label", "font-size", "video/false", "labelFontSize"],
      // 카드 — 곡률과 테두리 두께. 높이는 셸이 소유하지 않으므로 표에 없다.
      [".louis-node-shell__card", "border-radius", "video/false", "cardRadius"],
      [".louis-node-shell__card", "border-width", "video/false", "borderWidth"],
    ],
    // 라이트에서 정본과 갈리는 자리라 **갈리는 것 자체가 결정**이다. 누가 팔레트 칸
    // (palette-gray 100/000)을 직접 적어 「고쳐 두면」 그 결정이 조용히 뒤집힌다.
    surfaces: [
      [".louis-node-shell__card", "var(--louis-color-bg-surface)"],
      [".louis-node-shell__card", "var(--louis-color-stroke-default)"],
      [".louis-node-shell__title", "var(--louis-color-fg-secondary)"],
    ],
    forbidden: ["--louis-color-palette-gray"],
  },
  {
    component: "node-chrome-button",
    recipe: "packages/css/src/component/node-chrome-button.css",
    geometry: [
      [".louis-node-chrome-button", "inline-size", "neutral/Default", "width"],
      [".louis-node-chrome-button", "block-size", "neutral/Default", "height"],
      [".louis-node-chrome-button", "border-radius", "neutral/Default", "radius"],
      [".louis-node-chrome-button__glyph", "inline-size", "neutral/Default", "glyphSize"],
      [".louis-node-chrome-button__glyph", "block-size", "neutral/Default", "glyphSize"],
    ],
    // **면이 없는 것이 이 버튼의 정체다.** 기본에 면을 하나 얹으면 IconButton 의 ghost 와
    // 구분이 사라지고, 그 순간 노드 크롬 축을 따로 두는 이유도 사라진다.
    surfaces: [
      [".louis-node-chrome-button", "background: transparent"],
      [".louis-node-chrome-button", "var(--louis-color-fg-secondary)"],
    ],
    forbidden: ["--louis-color-palette-gray"],
  },
  {
    component: "node-side-handle",
    recipe: "packages/css/src/component/node-side-handle.css",
    geometry: [
      [".louis-node-side-handle", "inline-size", "image", "width"],
      [".louis-node-side-handle", "block-size", "image", "height"],
      [".louis-node-side-handle", "border-radius", "image", "radius"],
      // 디스크의 28 · 8 은 표에 없다 — 레시피가 그것을 수로 적지 않고 `100%` 와 `inherit` 로
      // 적기 때문이다. **관계가 계약이고 수는 그 결과**라서, 수로 바꿔 적게 만들면 셸이
      // 움직였을 때 디스크만 남는 사고가 오히려 열린다.
      [".louis-node-side-handle__glyph", "inline-size", "image", "glyphSize"],
      [".louis-node-side-handle__glyph", "block-size", "image", "glyphSize"],
    ],
    // 셸은 투명하고 채색은 디스크가 갖는다. 셸에 면이 붙으면 호버 스케일이 클릭 영역을
    // 흔든다 — 제품이 셸과 디스크를 나눈 이유가 그것이다.
    surfaces: [
      [".louis-node-side-handle", "background: transparent"],
      [".louis-node-side-handle__facet", "var(--louis-node-side-handle-face)"],
    ],
    forbidden: ["--louis-color-palette-gray"],
  },
  {
    component: "faq-row",
    recipe: "packages/css/src/component/faq-row.css",
    // 키가 `{Expanded}/{Size}` 복합이다. **닫힌 칸만 본다** — 계약의 `true/*` 는 같은 열한 값을
    // 글자까지 똑같이 갖고(여닫이가 기하를 바꾸지 않는 것이 acceptance test 6 이다) 여기서 네
    // 칸을 다 걸면 같은 선언을 두 번 세는 대조 수만 부풀린다. 두 칸이 서로 같은지는
    // packages/react/test/faq-row.browser.test.tsx 가 브라우저에서 재잰다.
    geometry: [
      // 행 — 반경뿐이다. 여백 0 은 선언이 아니라 부재라 여기서 대조할 글자가 없고,
      // 브라우저 시험이 계산값으로 잡는다.
      [".louis-faq-row", "border-radius", "false/lg", "radius"],
      // 질문 줄
      [".louis-faq-row__question", "padding-block", "false/lg", "questionPaddingBlock"],
      [".louis-faq-row__question", "padding-inline", "false/lg", "questionPaddingInline"],
      [".louis-faq-row__question", "gap", "false/lg", "questionGap"],
      [".louis-faq-row__question", "font-size", "false/lg", "questionFontSize"],
      // 글리프
      [".louis-faq-row__icon", "font-size", "false/lg", "iconFontSize"],
      // `md` — 밀도가 갈리는 여섯 값. 여기가 비면 크기 축이 이름만 남는다.
      ['.louis-faq-row[data-size="md"]', "border-radius", "false/md", "radius"],
      [
        '.louis-faq-row[data-size="md"] .louis-faq-row__question',
        "padding-block",
        "false/md",
        "questionPaddingBlock",
      ],
      [
        '.louis-faq-row[data-size="md"] .louis-faq-row__question',
        "padding-inline",
        "false/md",
        "questionPaddingInline",
      ],
      [
        '.louis-faq-row[data-size="md"] .louis-faq-row__question',
        "gap",
        "false/md",
        "questionGap",
      ],
      [
        '.louis-faq-row[data-size="md"] .louis-faq-row__question',
        "font-size",
        "false/md",
        "questionFontSize",
      ],
      [
        '.louis-faq-row[data-size="md"] .louis-faq-row__icon',
        "font-size",
        "false/md",
        "iconFontSize",
      ],
    ],
    // **이 셋은 값이 아니라 이름이 결정이다.** `landing-panel-strong` 을 같은 값의 사다리 칸으로
    // 「고쳐 두면」 라이트에서 행 면이 랜딩 바닥과 같아져 컴포넌트가 사라진다 — 정본이 `gray-900`
    // 을 버린 이유가 그것이고 문서 Known deviations 1 이 소유한다. `md` 의 행이 면을 갖지 않는
    // 것(주인이 질문 버튼으로 옮겨 가는 것)도 같은 종류의 결정이다.
    surfaces: [
      [".louis-faq-row", "var(--louis-color-landing-panel-strong)"],
      [".louis-faq-row__icon", "var(--louis-color-landing-text-muted)"],
      ['.louis-faq-row[data-size="md"]', "background: transparent"],
      [
        '.louis-faq-row[data-size="md"] .louis-faq-row__question',
        "var(--louis-color-landing-panel)",
      ],
    ],
    // `forbidden` 은 두지 않는다. 막고 싶은 것은 「면을 사다리 칸으로 되돌리는 것」인데 이
    // 게이트의 forbidden 실패 문구는 반대 방향("사다리 토큰으로 쓰세요")으로 고정돼 있어, 걸리는
    // 순간 다음 사람에게 정확히 틀린 지시를 준다. 같은 되돌림은 위 `surfaces` 가 이름을 양성으로
    // 고정해 이미 막는다 — 사다리로 바꾸면 그 needle 이 사라져 실패한다.
  },
];

const errors = [];
let comparisons = 0;

function read(relative) {
  try {
    return readFileSync(resolve(repoRoot, relative), "utf8");
  } catch (error) {
    errors.push(`${relative} 를 읽지 못했습니다: ${error.message}`);
    return null;
  }
}

// ── 토큰 표 ───────────────────────────────────────────────────────────────
// 토큰 이름 → 수. 기하 토큰은 테마를 타지 않으므로 첫 선언을 쓴다.
const tokensCss = read(TOKENS_CSS);
const TOKENS = new Map();
if (tokensCss !== null) {
  for (const match of tokensCss.matchAll(
    /^\s*(--louis-[a-z0-9-]+):\s*(-?\d+(?:\.\d+)?)px;\s*$/gm,
  )) {
    if (!TOKENS.has(match[1])) TOKENS.set(match[1], Number(match[2]));
  }
  if (TOKENS.size === 0) {
    errors.push(
      `${TOKENS_CSS} 에서 px 토큰을 한 개도 읽지 못했습니다. ` +
        "생성물이 비었거나 선언 형태가 바뀌었습니다 — `pnpm run build-tokens` 를 돌려 보세요.",
    );
  }
}

const recordSource = read(RECORD);
let record = null;
if (recordSource !== null) {
  try {
    record = JSON.parse(recordSource);
  } catch (error) {
    errors.push(`${RECORD} 을 JSON 으로 읽지 못했습니다: ${error.message}`);
  }
}

/** 주석을 지운 규칙 본문. 주석 안의 수는 사유이지 선언이 아니다. */
function ruleBody(recipeSource, recipePath, selector) {
  const stripped = recipeSource.replace(/\/\*[\s\S]*?\*\//g, "");
  const pattern = new RegExp(
    `(?:^|\\n)${selector.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\s*\\{([^}]*)\\}`,
  );
  const match = pattern.exec(stripped);
  if (!match) {
    errors.push(
      `${recipePath} 에 최상위 규칙 \`${selector}\` 이 없습니다. ` +
        "이름을 바꿨다면 이 게이트의 RECIPES 표도 같이 옮기세요 — 표가 대상을 잃으면 " +
        "검사는 사라지는데 게이트는 초록으로 남습니다.",
    );
    return null;
  }
  return match[1];
}

/** 선언 하나를 수로 푼다. `var(--louis-*)` 는 토큰 표에서 찾고 `12px` 는 그대로 읽는다. */
function px(recipeSource, recipePath, selector, property) {
  const body = ruleBody(recipeSource, recipePath, selector);
  if (body === null) return null;
  const declaration = new RegExp(`(?:^|;|\\n)\\s*${property}:\\s*([^;]+);`).exec(body);
  if (!declaration) {
    errors.push(
      `${recipePath} 의 \`${selector}\` 에 \`${property}\` 선언이 없습니다. ` +
        "기록이 그 값을 갖고 있으므로 레시피가 그것을 선언하거나, 기록에서 그 값을 빼야 합니다.",
    );
    return null;
  }
  const value = declaration[1].trim();
  const variable = /^var\((--louis-[a-z0-9-]+)\)$/.exec(value);
  if (variable) {
    const resolved = TOKENS.get(variable[1]);
    if (resolved === undefined) {
      errors.push(
        `${recipePath} 의 \`${selector} { ${property} }\` 가 \`${variable[1]}\` 을 읽는데 ` +
          `${TOKENS_CSS} 에 그 px 토큰이 없습니다. 이름이 틀렸거나(개명된 계단의 옛 칸을 ` +
          "가리키는 것이 흔하다) 토큰이 px 가 아닙니다.",
      );
      return null;
    }
    return resolved;
  }
  const literal = /^(-?\d+(?:\.\d+)?)px$/.exec(value);
  if (literal) return Number(literal[1]);
  errors.push(
    `${recipePath} 의 \`${selector} { ${property} }\` 를 수로 풀 수 없습니다: \`${value}\`. ` +
      "이 게이트는 `var(--louis-*)` 하나 또는 `<수>px` 하나만 읽습니다 — 계산식이나 " +
      "여러 값을 쓰려면 기록 쪽 축을 나누고 표의 줄도 나누세요.",
  );
  return null;
}

for (const entry of RECIPES) {
  const recipeSource = read(entry.recipe);
  if (recipeSource === null || record === null) continue;

  const measured = record.components?.[entry.component];
  if (!measured) {
    errors.push(
      `${RECORD} 에 \`components.${entry.component}\` 이 없습니다. ` +
        "기록에서 지웠다면 이 게이트의 RECIPES 표에서도 빼세요.",
    );
    continue;
  }

  for (const [selector, property, sizeKey, valueKey] of entry.geometry) {
    const size = measured.sizes?.[sizeKey];
    if (!size) {
      errors.push(
        `${RECORD} 의 \`${entry.component}.sizes.${sizeKey}\` 이 없습니다. ` +
          "기록의 size 키를 개명했다면 표의 셋째 칸도 같이 옮기세요.",
      );
      continue;
    }
    const recorded = size[valueKey];
    if (typeof recorded !== "number") {
      errors.push(
        `${RECORD} 의 \`${entry.component}.sizes.${sizeKey}.${valueKey}\` 이 수가 아닙니다` +
          `(${JSON.stringify(recorded)}). 표는 이 값을 레시피와 대조합니다 — 기록에서 뺐다면 ` +
          "표의 줄도 빼세요.",
      );
      continue;
    }
    const declared = px(recipeSource, entry.recipe, selector, property);
    if (declared === null) continue;
    comparisons += 1;
    if (declared !== recorded) {
      errors.push(
        `${entry.component}: 레시피와 기록이 다릅니다 — ` +
          `\`${selector} { ${property} }\` 는 ${declared}, ` +
          `\`${entry.component}.sizes.${sizeKey}.${valueKey}\` 는 ${recorded} 입니다. ` +
          `어느 쪽이 정본인지는 기록의 \`$${valueKey}\` 사유가 말합니다. 한쪽만 고치지 말고 ` +
          "레시피 · 기록 · Figma 를 같은 회차에서 함께 옮기세요.",
      );
    }
  }

  for (const [selector, needle] of entry.surfaces ?? []) {
    const body = ruleBody(recipeSource, entry.recipe, selector);
    if (body === null) continue;
    comparisons += 1;
    if (!body.includes(needle)) {
      errors.push(
        `${entry.component}: \`${selector}\` 이 \`${needle}\` 를 선언하지 않습니다. ` +
          "이 자리는 값이 아니라 **이름**이 계약입니다 — 사다리 토큰을 같은 값의 팔레트 칸으로 " +
          "바꾸면 두 테마 중 한쪽에서 결정이 조용히 뒤집힙니다. 이름을 되돌리거나, 바꾸는 것이 " +
          "결정이라면 문서 · 기록 · 이 표를 함께 옮기세요.",
      );
    }
  }

  for (const needle of entry.forbidden ?? []) {
    comparisons += 1;
    if (recipeSource.includes(needle)) {
      errors.push(
        `${entry.component}: 레시피가 \`${needle}\` 를 씁니다(${entry.recipe}). ` +
          "면은 팔레트 원시값이 아니라 사다리 토큰(`--louis-color-bg-*`)으로 씁니다 — " +
          "팔레트 칸은 테마를 따라 뒤집히지 않아 한쪽 테마에서만 맞습니다.",
      );
    }
  }
}

// ── 「레시피가 없다」가 결함인가 판정인가 ────────────────────────────────
//
// **이 게이트의 두 번째 요지다.** 위의 표는 레시피가 **있는** 것을 기록과 맞춘다. 그런데 이
// 저장소에서 더 자주 열어 보게 되는 것은 반대쪽이다 — 생성 CSS 에 `louis-<키>` 가 0 건인
// 컴포넌트를 보고 「빠졌다」고 읽는 것. 대개는 정말 「아직」이고(manifest 의 `not-ready`),
// **가끔은 그것이 결론이다.**
//
// 둘을 눈으로 구분할 수 없으면 다음 사람은 매번 같은 조사를 다시 한다. canvas-edge 가 그
// 자리였다: 쉬머의 페인트가 인스턴스 기하이고 주기가 SMIL 의 `dur` 이라 CSS 로 옮겨갈 수
// 없는데, 기록 어디에도 「그래서 세우지 않는다」가 없어 `not-ready` 로만 보였다.
//
// 그래서 **판정을 명부로 만들고 세 방향을 다 문다.** 형태는 같은 파일의 `$noProductRender`
// 를 따랐다 — 면제는 검사를 빼는 것이 아니라 다른 근거로 옮기는 것이고, 그 근거가 사라지면
// 실패해야 한다.
//
//   ① 명부의 이름은 manifest 의 `web` 이 `not-planned` 여야 한다.
//      (`not-ready` 는 「아직 제공하지 않는다」이고 `not-planned` 는 「제공할 필요가 없다」다.
//       어휘가 이미 둘을 갈라 두었다 — design/components/README.md 의 상태 의미.)
//   ② 명부의 이름으로 레시피 파일이 **생기면 실패한다.** 판정을 뒤집는 일이므로 조용히
//      일어나서는 안 된다.
//   ③ 거꾸로 `web` 이 `not-planned` 인데 명부에 사유가 없으면 실패한다. 사유 없이 상태만
//      내려 두는 길을 막는다 — 그 길이 열려 있으면 `not-planned` 는 「검사를 끄는 값」이 된다.
const manifestSource = read(MANIFEST);
let manifest = null;
if (manifestSource !== null) {
  try {
    manifest = JSON.parse(manifestSource);
  } catch (error) {
    errors.push(`${MANIFEST} 을 JSON 으로 읽지 못했습니다: ${error.message}`);
  }
}

let verdicts = 0;
if (record !== null && manifest !== null) {
  const noRecipe = record.$noRecipe ?? {};
  const webOf = new Map(
    [...(manifest.components ?? []), ...(manifest.patterns ?? [])].map((item) => [item.id, item.web]),
  );

  for (const [id, reason] of Object.entries(noRecipe)) {
    if (id.startsWith("$")) continue;
    verdicts += 1;

    if (typeof reason !== "string" || reason.trim().length < 80) {
      errors.push(
        `${RECORD} 의 \`$noRecipe.${id}\` 에 사유가 없거나 너무 짧습니다. ` +
          "이 명부는 「레시피가 없다」를 **판정**으로 바꾸는 자리입니다 — 왜 CSS 가 이 조형을 " +
          "담지 못하는지 적히지 않으면 다음 사람은 그 판정을 신뢰할 수 없고, 결국 다시 조사합니다.",
      );
    }

    if (!record.components?.[id]) {
      errors.push(
        `${RECORD} 의 \`$noRecipe.${id}\` 이 \`components\` 에 없는 이름입니다. ` +
          "기록에서 컴포넌트를 지웠다면 이 명부에서도 빼세요.",
      );
    }

    const web = webOf.get(id);
    if (web === undefined) {
      errors.push(
        `${MANIFEST} 에 \`${id}\` 이 없습니다 — \`$noRecipe\` 이 그 이름을 부릅니다. ` +
          "manifest 에서 지웠다면 명부에서도 빼세요.",
      );
    } else if (web !== "not-planned") {
      errors.push(
        `${id}: \`$noRecipe\` 에 판정이 적혀 있는데 ${MANIFEST} 의 \`web\` 은 \`${web}\` 입니다. ` +
          "레시피를 세우지 않기로 정한 자리는 `not-planned`(제공할 필요가 없다)이지 " +
          "`not-ready`(아직 제공하지 않는다)가 아닙니다 — 둘을 섞으면 「아직」과 「안 한다」를 " +
          "구분할 수 없어 다음 사람이 같은 조사를 다시 합니다.",
      );
    }

    const recipePath = `${RECIPE_DIR}/${id}.css`;
    if (existsSync(resolve(repoRoot, recipePath))) {
      errors.push(
        `${id}: \`$noRecipe\` 이 「레시피를 세우지 않는다」고 적는데 ${recipePath} 가 있습니다. ` +
          "판정이 뒤집힌 것이라면 조용히 뒤집지 마세요 — Decision · 문서의 Availability · " +
          `${MANIFEST} 의 web · 이 명부를 같은 회차에서 함께 옮기고, 레시피는 위 RECIPES 표에 ` +
          "등록해 기록과 대조되게 하세요.",
      );
    }
  }

  // ③ 반대 방향. `not-planned` 는 사유를 가진 판정일 때만 정당하다.
  for (const [id, web] of webOf) {
    if (web !== "not-planned") continue;
    if (noRecipe[id] === undefined) {
      errors.push(
        `${id}: ${MANIFEST} 의 \`web\` 이 \`not-planned\` 인데 ${RECORD} 의 \`$noRecipe\` 에 ` +
          "사유가 없습니다. 사유 없는 `not-planned` 는 상태가 아니라 검사를 끄는 값입니다 — " +
          "왜 이 플랫폼에 제공할 필요가 없는지 적으세요.",
      );
    }
  }
}

if (errors.length > 0) {
  for (const error of errors) console.error(`[${TAG}] ${error}`);
  process.exit(1);
}

if (comparisons === 0) {
  notMeasured(
    TAG,
    "RECIPES 표가 비었거나 모든 줄이 대상을 잃었습니다. 레시피 ↔ 기록을 한 건도 대조하지 " +
      "않았습니다 — 그것은 통과가 아닙니다.",
  );
}

// **개수 래칫 — 「0 이 아니다」로는 부족하다.** 위의 NOT_MEASURED 는 표가 통째로 비었을 때만
// 문다. 22 줄 중 20 줄을 지워도 comparisons 는 6 이라 조용히 통과한다(반증에서 실측으로 확인).
// 그래서 **줄어드는 것 자체**를 잡는다. 늘리는 것은 자유이고, 늘렸으면 이 수를 함께 올린다 —
// 그것이 이 저장소의 이득 잠금 방식이다(lint·typography·css-modules 베이스라인과 같은 형태).
// 26 → 49: floating-shell · pill-trigger 레시피가 서면서 두 벌 23 건이 늘었다(2026-09-09).
const COMPARISON_FLOOR = 96;
if (comparisons < COMPARISON_FLOOR) {
  console.error(
    `[${TAG}] 대조가 ${COMPARISON_FLOOR} 건에서 ${comparisons} 건으로 줄었습니다. ` +
      "레시피나 기록에서 축을 지웠다면 그 사실이 옳은지 먼저 판정하고, 옳다면 이 파일의 " +
      "COMPARISON_FLOOR 를 함께 내리세요 — 줄어든 자리를 비워 두면 다음 사람이 그 자리를 " +
      "재지 않는 것을 알아채지 못합니다.",
  );
  process.exit(1);
}

console.log(
  `[${TAG}] OK (레시피 ${RECIPES.length}종 · 레시피↔기록 대조 ${comparisons}건: ` +
    `${RECIPES.map((r) => r.component).join(", ")} · ` +
    `레시피 없음 판정 ${verdicts}건)`,
);
