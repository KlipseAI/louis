#!/usr/bin/env node
// **Figma 생성기의 rect 수치 가드를 센다 — 계산된 크기를 숫자로 굳힌 자리의 부채 지표(2026-09-14).**
//
// ## 왜 있는가
//
// 제품 한 커밋(`6f6282c1`, 프로필 버튼 36 → 32)에 상단 바 52 · 53 · 뷰포트 1003 · 편집기 본문 996 이
// 한꺼번에 낡았다. 그 값들은 제품이 **고른** 값이 아니라 레이아웃이 **계산한** 값이었다 — 상단 바는
// 높이를 선언하지 않고(패딩 + 가장 큰 자식 + 헤어라인) 본문 칸은 1fr 이다. 그런데 생성기 · 매처가 그
// 결과를 `rect.height !== 53` · `Math.round(rect.height) === 53` 으로 물고 있었고, 그중 절반은 가드가
// 리터럴끼리 비교해 **초록인 채** 틀렸다(크기 굳힘 감사 묶음 1, L-1).
//
// ## 무엇을 세는가
//
// `scripts/build-figma-*.mjs` 와 `scripts/lib/figma-*.mjs` 의 코드 줄에서 `…width|height|x|y`(괄호 하나까지)와
// 0 이 아닌 수 리터럴을 `===` · `!==` 로 맞대는 비교 하나하나. 주석 줄은 세지 않는다. 한 줄에 둘이면 둘이다.
// 간접 비교(`expected.page[0]`)는 잡지 못한다 — 이 수는 **하한**이다.
//
// ## 허용되는 줄
//
// 제품이 그 수를 **선언**한 자리는 부채가 아니다. 같은 줄 끝에 `// 선언: <경로>:<줄>` 을 붙이면 세지 않는다
// (예: 사이드바 폭 280 은 `globals.css` 의 `--app-gnb-sidebar-width: min(280px, …)`). 인용이 맞는지는 이 게이트가
// 보지 않는다 — 제품 저장소를 읽지 않아야 CI(verify:ci)에서 돈다. 인용 대조는 생성기의 `sourceQuote` 몫이다.
//
// ## 기준선은 줄어들기만 한다
//
// 파일별 수가 `BASELINE` 보다 크면 실패한다(새 굳힘). **작아도 실패한다** — 고친 만큼 기준선을 내려 잠그라는
// 뜻이다. 한쪽만 잠그면 줄어든 여유만큼 다음 굳힘이 조용히 들어온다(regen-figma-at-anchor.sh 머리말의
// 2026-09-10 · 09-11 사고와 같은 모양). 기준선에 없는 파일은 0 이어야 한다.
import { readdirSync, readFileSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");

// 2026-09-14 — 묶음 1(상단 바 사슬) 뒤에 남은 수. 넷 다 결제 · 업그레이드 · 요금제 장면의 뷰포트 ·
// 메인 카드 · 카드 크기 가드이고 묶음 2 · 3 · 5 가 옮긴다. 줄면 여기를 같은 수로 내린다.
// 키는 `scripts/` 아래 경로다. **`scripts/` 를 붙여 따옴표로 적지 않는다** — verify-gate-split 이 그 꼴의
// 문자열을 이 게이트가 부르는 스크립트로 읽고, 생성기에는 제품 저장소 표지가 있어 CI 배분이 거부된다.
const BASELINE = {
  "build-figma-product-components.mjs": 2,
  "build-figma-product-payment-scenes.mjs": 8,
  "build-figma-product-pricing-page.mjs": 4,
  "build-figma-product-upgrade-scene.mjs": 25,
};

const GUARD = /(?:\.(?:width|height|x|y)\)?\s*[!=]==\s*(-?\d+(?:\.\d+)?)(?![\w.])|(?<![\w.])(-?\d+(?:\.\d+)?)\s*[!=]==\s*[\w$.[\]()?]*\.(?:width|height|x|y)\b)/g;
const DECLARED = /\/\/\s*선언\s*[:：]\s*\S+:\d+/;
const COMMENT_LINE = /^\s*(\/\/|\*|\/\*)/;

/** 소스 한 벌에서 굳힌 가드를 센다. 줄 번호와 줄을 함께 돌려준다. */
function countDerivedSizeGuards(source) {
  const hits = [];
  source.split("\n").forEach((line, index) => {
    if (COMMENT_LINE.test(line) || DECLARED.test(line)) return;
    const code = line.replace(/\/\/.*$/, "");
    for (const match of code.matchAll(GUARD)) {
      if (Number(match[1] ?? match[2]) === 0) continue;
      hits.push({ line: index + 1, text: line.trim() });
    }
  });
  return hits;
}

const targets = [
  ...readdirSync(join(repoRoot, "scripts")).filter((name) => /^build-figma-.+\.mjs$/.test(name)).map((name) => join("scripts", name)),
  ...readdirSync(join(repoRoot, "scripts", "lib")).filter((name) => /^figma-.+\.mjs$/.test(name)).map((name) => join("scripts", "lib", name)),
].sort();
if (targets.length === 0) {
  console.error("[derived-size-literals] 검사할 생성기를 하나도 찾지 못했습니다 — 잴 것이 없는 통과는 통과가 아닙니다.");
  process.exit(1);
}

const errors = [];
let total = 0;
const counted = {};
for (const path of targets) {
  const hits = countDerivedSizeGuards(readFileSync(join(repoRoot, path), "utf8"));
  const key = relative(join(repoRoot, "scripts"), join(repoRoot, path)).split("\\").join("/");
  const baseline = BASELINE[key] ?? 0;
  total += hits.length;
  if (hits.length) counted[key] = hits.length;
  if (hits.length > baseline) {
    errors.push(
      `${key}: 계산된 크기를 숫자로 비교하는 가드가 ${hits.length}개(기준선 ${baseline}) — 늘었다. ` +
        "선언된 값이면 줄 끝에 `// 선언: <경로>:<줄>` 을 붙이고, 계산값이면 제품 식(패딩 + 자식 · 1fr)이 닫히는지나 " +
        "원장 · 형제 계획의 측정과 같은지로 바꾼다:\n" +
        hits.map((hit) => `      ${key}:${hit.line}  ${hit.text.slice(0, 140)}`).join("\n"),
    );
  } else if (hits.length < baseline) {
    errors.push(
      `${key}: 가드가 ${hits.length}개로 기준선 ${baseline} 보다 줄었다 — scripts/check-derived-size-literals.mjs 의 ` +
        `BASELINE 을 ${hits.length} 로 내려 잠근다(줄어든 여유는 다음 굳힘이 조용히 들어오는 자리다).`,
    );
  }
}
for (const key of Object.keys(BASELINE)) {
  if (!targets.includes(join("scripts", key))) errors.push(`${key}: 기준선에 있는데 파일이 없다 — BASELINE 에서 뺀다.`);
}

if (errors.length) {
  for (const error of errors) console.error(`[derived-size-literals] ${error}`);
  process.exit(1);
}
console.log(
  `[derived-size-literals] OK: 생성기 ${targets.length}개 · 굳힌 rect 가드 ${total}개(기준선 ${Object.values(BASELINE).reduce((a, b) => a + b, 0)}) — ` +
    Object.entries(counted).map(([key, count]) => `${key} ${count}`).join(" · "),
);
