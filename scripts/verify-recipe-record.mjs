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
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { notMeasured } from "./lib/gate-exit.mjs";

const TAG = "recipe-record";
const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const RECORD = "figma/components.measured.json";
const TOKENS_CSS = "packages/tokens/generated/tokens.css";

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
// 지금 열려 있는 것은 `inspector-row` 한 벌뿐이다 — 다른 레시피는 이 게이트가 재지 않는다.
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
const COMPARISON_FLOOR = 26;
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
    `${RECIPES.map((r) => r.component).join(", ")})`,
);
