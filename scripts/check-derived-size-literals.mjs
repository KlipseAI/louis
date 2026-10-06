#!/usr/bin/env node
// **Figma 생성기 · 렌더러의 인용 없는 크기 리터럴을 센다 — 계산된 크기를 숫자로 굳힌 자리의 부채 지표(2026-09-14).**
//
// ## 왜 있는가
//
// 제품 한 커밋(`6f6282c1`, 프로필 버튼 36 → 32)에 상단 바 52 · 53 · 뷰포트 1003 · 편집기 본문 996 이
// 한꺼번에 낡았다. 그 값들은 제품이 **고른** 값이 아니라 레이아웃이 **계산한** 값이었다 — 상단 바는
// 높이를 선언하지 않고(패딩 + 가장 큰 자식 + 헤어라인) 본문 칸은 1fr 이다. 그런데 생성기 · 매처 · 렌더러가
// 그 결과를 여러 꼴로 물고 있었고, 그중 절반은 리터럴끼리 비교해 **초록인 채** 틀렸다(크기 굳힘 감사
// 묶음 1, L-1).
//
// ## 첫 판은 그 사슬을 잡지 못했다
//
// 첫 판(같은 날)은 `<식>.width|height|x|y === / !== <수>` 한 꼴만, `build-figma-*.mjs` · `lib/figma-*.mjs` 에서만
// 셌다. 그 규칙을 **묶음 1 수정 전 트리(`3e56bec`)** 에 돌리면 사슬의 발단이 된 생성기가 0 이었고
// (`const headerHeight = 52` · `bodyWidth !== 1832` · `const mainCardWidth = 1628` · `viewport: { height: 1003, y: 53 }`),
// 렌더러(`fixed(leading, 68, 36)` · `avatar.resize(36, 36)`)는 범위 밖이었다 — 규칙을 그대로 대 봐도 0 이다.
// 셌던 것은 앱 셸의 `control.width !== 32` 꼴과 매처의 `=== 53` 뿐이다. 그래서 꼴과 범위를 넓혔고,
// 넓힌 규칙은 같은 `3e56bec` 트리에서 위 줄들을 모두 센다(사이드바 상태 생성기 7 · 하이라이트 허브 생성기 12 ·
// 사이드바 상태 렌더러 31). `verify-gates` 의 canary 가 꼴마다 하나씩 그것을 다시 증명한다.
//
// ## 무엇을 세는가
//
// 범위: `scripts/build-figma-*.mjs` · `scripts/lib/figma-*.mjs` · `scripts/templates/` 아래 `.js` 전부 ·
// `scripts/figma-screens-live-check.mjs`. 코드 줄만 보고(주석 줄과 줄 끝 `//` 뒤는 뺀다), 절댓값 2 미만의 수
// (0 · 1 · 반올림 허용치 0.5)는 세지 않는다. 한 줄에 여럿이면 수 리터럴 하나하나를 센다. 꼴은 다섯이다:
//
// - `[비교]` 크기 식과 수를 `===` · `!==` · `==` · `!=` · `<` · `<=` · `>` · `>=` 로 맞댄다(양쪽 순서 다).
//   크기 식은 멤버 `.width|height|x|y|top|bottom|left|right|size|side|inset`, 같은 이름의 식별자(x · y 제외),
//   그리고 `Width|Height|Size|Side|Inset|Padding|Top|Bottom|Left|Right|X|Y` 로 끝나는 이름(`bodyWidth`,
//   `rect.innerHeight`)이다. 괄호로 감싼 식(`Math.round(rect.height) === 53`)도 센다.
// - `[대입]` `const|let|var <크기 이름> = <수>`(`const headerHeight = 52`).
// - `[객체]` 키가 `width|height|size|side|inset|x|y` 이거나 `Width|Height|Size|Side|X|Y` 로 끝나는 속성의 수
//   (`{ height: 1003, y: 53 }`). `top|left` 류 키는 세지 않는다 — 회전 각 표(`{ top: 0, right: 90 }`)와 겹친다.
// - `[크기 호출]` `resize` · `resizeWithoutConstraints` · `fixed` · `setFixed` 의 인자 가운데 수 하나로만 된
//   인자(`fixed(leading, 68, 36)`, `profile.resize(profile.width, 36)`).
// - `[abs]` `Math.abs(…)` 안에 크기 식이 있을 때 그 안에서 더하고 빼는 수(`Math.abs(bar.height - 53) <= 1`).
// - `[설명 수치]` **렌더러 템플릿에서만** — 코드 줄의 `<수>×<수>`(노드 이름 · 설명문 문자열). 묶음 3 의 발단 하나가
//   이 꼴이었다: 결제 장면 러너가 매 실행 다시 짓는 노드의 설명에 「Measured 1628×1004」 · 「402×810」, 업그레이드 러너가
//   「1628×1056」을 박아 두어, 셸이 움직인 뒤에도 틀린 수를 「측정」이라고 주장했다. 수는 계획 rect 에서 조립한다
//   (`${spec.page.rect.width}×${spec.page.rect.height}`). 생성기 · 라이브러리는 세지 않는다 — 자산 이름
//   (`logo/klipse-dark (291×85 · …)`)과 블록 주석 안의 기록이 섞여 신호가 묻힌다.
//
// **이 수는 하한이다.** 세지 못하는 꼴: 크기 이름이 아닌 이름(`rows.upper !== 656`), 간접 비교
// (`expected.page[0]`), 계산식 인자(`resize(40 + i * 560, …)`), 노드 위치 대입(`node.x = 868` — 보드
// 배치가 대부분이라 신호가 묻힌다), 문자열로 조립한 수, 줄을 넘는 식.
//
// `scripts/measure-*.mjs` 는 범위 밖이다. 측정기의 크기 리터럴은 측정 맥락(브라우저 뷰포트 1920×1080)이거나,
// 재측정 때 스스로 빨갛게 되라고 둔 기대값(감사가 그대로 두라고 한 progress-ring 대조)이다.
//
// ## 허용되는 줄
//
// 제품이 그 수를 **선언**한 자리는 부채가 아니다. 같은 줄 끝에 `// 선언: <경로>:<줄>` 을 붙이면 세지 않는다
// (예: 사이드바 폭 280 은 `globals.css` 의 `--app-gnb-sidebar-width: min(280px, …)`). 인용이 맞는지는 이 게이트가
// 보지 않는다 — 제품 저장소를 읽지 않아야 CI(verify:ci)에서 돈다. 인용 대조는 생성기의 `sourceQuote` 몫이다.
//
// 그러므로 기준선의 수는 「파생값」의 수가 아니라 **「선언 인용이 붙지 않은 크기 리터럴」의 수**다. 아래
// `BASELINE` 주석이 무엇이 들어 있는지 나눠 적는다 — 보드 캔버스 배치값(섹션 · 문서 프레임 · 세트 크기)과
// Figma 글리프 실측표도 들어 있다. 그 수들도 제품 크기는 아니지만 콘텐츠에서 계산할 수 있는 수라서 0 을 향한다.
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

// 2026-09-14 — 묶음 1(상단 바 사슬) 뒤, 꼴을 넓혀 다시 잰 수. 줄면 여기를 같은 수로 내린다.
// 같은 날 묶음 2 · 3(결제 결과 · 체크아웃 본문과 메인 표면 · 장면, 요금제 카드) 뒤 다시 내렸다 — 결제 장면 생성기 8 → 0,
// 업그레이드 장면 생성기 27 → 0, 체크아웃 렌더러 10 → 0, 업그레이드 렌더러 12 → 0, 결제 장면 렌더러 8 → 2, 컴포넌트 렌더러
// 16 → 14. 0 이 된 파일은 기준선에서 뺐다(기준선에 없는 파일은 0 이어야 한다).
// 같은 날 컴포넌트 렌더러 14 → 12 — 계획이 더는 싣지 않는 compound 행(+ 버튼)을 짓던 가지와 그 `plus.resize(20, 20)` 을 걷었다.
// 키는 `scripts/` 아래 경로다. **`scripts/` 를 붙여 따옴표로 적지 않는다** — verify-gate-split 이 그 꼴의
// 문자열을 이 게이트가 부르는 스크립트로 읽고, 생성기에는 제품 저장소 표지가 있어 CI 배분이 거부된다.
const BASELINE = {
  // 컴포넌트 생성기의 글리프 20 가드, 요금제 장면(묶음 5)의 뷰포트 · 카드 크기 가드.
  "build-figma-product-components.mjs": 2,
  "build-figma-product-pricing-page.mjs": 4,
  // 앱 셸 생성기의 Figma 글리프 실측표(`figmaGlyphBounds` · `desktopFigmaGlyphBounds`, 라벨 열 개 × 폭 · 높이 ×
  // 두 뷰포트)와 `lineShiftX`. 제품 rect 가 아니라 Figma 글꼴 메트릭이지만 라벨 · 글꼴이 바뀌면 낡는 계산값이다.
  "build-figma-product-app-shell.mjs": 41,
  // 인벤토리 보드의 표 폭 1700 · 글자 상자 임시 높이 10, 변수 원천 측정의 뷰포트 1440×900.
  // 2026-10-06: DS 라이브러리 견본 생성기(13 — `pCard.resize(320, 320)` · 버튼 60×36 …)를 걷어 기준선에서 뺐다(크기 굳힘 감사 묶음 11).
  "build-figma-inventory.mjs": 2,
  "build-figma-variable-source.mjs": 2,
  // 렌더러 템플릿. 대부분 보드 캔버스 — 섹션(`resizeWithoutConstraints(1800, 980)` 류와 그 최소 크기 비교) ·
  // 문서 프레임 · 세트 크기 · 열 폭이다. 캔버스가 아닌 것: 사이드바 상태 렌더러의 접힌 레일 조각
  // (`fixed(top, 32, 264)` · `fixed(menu, 32, 212)` · `rail.resize(56, 1080)` · `fixed(video, 1920, 1080)` 등 18).
  // 결제 장면 렌더러의 둘은 문서 프레임(`docs.resize(840, 156)`)이다.
  // 2026-09-28: 컴포넌트 렌더러 12 → 10 — 패딩 4 → spacing4 바인딩 비교 둘을 걷었다. 간격 · 패딩은 이제 값이 같은 `spacing/<n>` 에
  // 한 함수(`bindSpacing`)로 묶는다(사이드바 셸 패딩을 넷 다 `spacing/12` 에 묶어 측정 8 · 0 을 덮어쓰던 것을 고치며).
  "templates/figma-product-app-shell-renderer.js": 3,
  "templates/figma-product-components-renderer.js": 10,
  "templates/figma-product-payment-scenes-renderer.js": 2,
  "templates/figma-product-pricing-renderer.js": 6,
  // 사이드바 상태 렌더러에는 [설명 수치] 둘도 들어 있다 — 노드 이름 「label clip · measured 12×18」 · 「96×28 clipped」(묶음 4).
  "templates/figma-product-sidebar-states-renderer.js": 20,
  // 2026-09-26: 글리프 렌더러의 보드 캔버스 — 섹션 안 첫 세트의 y 160(부품 섹션과 같은 배치). 새 섹션의 자리 채움 크기
  // (`resizeWithoutConstraints(2000, 1000)`, 끝에서 내용으로 다시 잰다)는 걷었다: 3 → 1.
  "templates/figma-product-glyphs-renderer.js": 1,
};

const NUMBER = String.raw`-?\d+(?:\.\d+)?`;
const NUM = String.raw`(${NUMBER})(?![\w.%])`;
const SUFFIXED = String.raw`[a-z_$][\w$]*[a-z0-9](?:Width|Height|Size|Side|Inset|Padding|Top|Bottom|Left|Right|X|Y)`;
const BARE = String.raw`width|height|size|side|inset|top|bottom|left|right`;
const SIZE_TAIL = String.raw`(?:\.(?:${BARE}|x|y|${SUFFIXED})|(?<![\w$.])(?:${BARE}|${SUFFIXED}))(?![\w$(])`;
const OBJECT_KEY = String.raw`width|height|size|side|inset|x|y|[a-z_$][\w$]*[a-z0-9](?:Width|Height|Size|Side|X|Y)`;
const OP = String.raw`(?:===|!==|==|!=|<=|>=|<|>)`;
// 앞선 꼴이 같은 수를 먼저 가져간다(한 수는 한 번만 센다).
const REGEX_FORMS = [
  ["비교", new RegExp(String.raw`${SIZE_TAIL}\)*\s*${OP}\s*${NUM}`, "gd")],
  ["비교", new RegExp(String.raw`(?<![\w$.])(${NUMBER})\s*${OP}\s*[\w$.[\]()?]*?${SIZE_TAIL}`, "gd")],
  ["대입", new RegExp(String.raw`\b(?:const|let|var)\s+(?:${BARE}|${SUFFIXED})\s*=\s*${NUM}\s*(?=[;,)]|$)`, "gd")],
  ["객체", new RegExp(String.raw`(?:(?<![\w$.[\-"'])(?:${OBJECT_KEY})|"(?:${OBJECT_KEY})"|'(?:${OBJECT_KEY})')\s*:\s*${NUM}`, "gd")],
];
const SIZING_CALL = /\b(?:resize|resizeWithoutConstraints|fixed|setFixed)\s*\(/g;
const ABS_CALL = /\bMath\.abs\s*\(/g;
const PURE_NUMBER = new RegExp(String.raw`^\s*${NUMBER}\s*$`);
const HAS_SIZE = new RegExp(SIZE_TAIL);
const ABS_TERM = new RegExp(String.raw`(?:[-+]\s*|(?<![\w$.])(?=${NUMBER}\s*[-+]))(${NUMBER})(?![\w.%])`, "gd");
const DECLARED = /\/\/\s*선언\s*[:：]\s*\S+:\d+/;
const COMMENT_LINE = /^\s*(\/\/|\*|\/\*)/;

/** `open` 위치의 여는 괄호부터 짝이 맞는 닫는 괄호까지, 맨 바깥 쉼표로 가른 인자 구간을 돌려준다. */
function callArguments(code, open) {
  let depth = 1;
  let start = open + 1;
  const args = [];
  for (let index = open + 1; index < code.length; index += 1) {
    const char = code[index];
    if (char === "(" || char === "[" || char === "{") depth += 1;
    else if (char === ")" || char === "]" || char === "}") {
      depth -= 1;
      if (depth === 0) {
        args.push([start, index]);
        return { args, end: index };
      }
    } else if (char === "," && depth === 1) {
      args.push([start, index]);
      start = index + 1;
    }
  }
  return null; // 줄 안에서 닫히지 않는 호출 — 세지 못한다(하한).
}

/** 코드 한 줄에서 크기 리터럴을 찾는다. 수의 열 위치로 겹침을 없앤다. */
function sizeLiterals(code) {
  const found = new Map();
  const add = (form, column, value) => {
    if (Math.abs(Number(value)) < 2 || found.has(column)) return;
    found.set(column, form);
  };
  for (const [form, pattern] of REGEX_FORMS) {
    for (const match of code.matchAll(pattern)) add(form, match.indices[1][0], match[1]);
  }
  for (const match of code.matchAll(SIZING_CALL)) {
    const call = callArguments(code, match.index + match[0].length - 1);
    if (!call) continue;
    for (const [start, end] of call.args) {
      const arg = code.slice(start, end);
      if (PURE_NUMBER.test(arg)) add("크기 호출", start + arg.search(/\S/), arg.trim());
    }
  }
  for (const match of code.matchAll(ABS_CALL)) {
    const call = callArguments(code, match.index + match[0].length - 1);
    if (!call) continue;
    const bodyStart = match.index + match[0].length;
    const body = code.slice(bodyStart, call.end);
    if (!HAS_SIZE.test(body)) continue;
    for (const term of body.matchAll(ABS_TERM)) add("abs", bodyStart + term.indices[1][0], term[1]);
  }
  return [...found.entries()].sort(([a], [b]) => a - b).map(([column, form]) => ({ column, form }));
}

const DESCRIBED_SIZE = /(?<![\w.])\d+(?:\.\d+)?\s*×\s*\d+(?:\.\d+)?/g;
/** 소스 한 벌에서 인용 없는 크기 리터럴을 센다. 줄 번호 · 꼴 · 줄을 함께 돌려준다. */
function countSizeLiterals(source, { template = false } = {}) {
  const hits = [];
  source.split("\n").forEach((line, index) => {
    if (COMMENT_LINE.test(line) || DECLARED.test(line)) return;
    const code = line.replace(/\/\/.*$/, "");
    for (const { form } of sizeLiterals(code)) hits.push({ line: index + 1, form, text: line.trim() });
    if (template) for (const _ of code.matchAll(DESCRIBED_SIZE)) hits.push({ line: index + 1, form: "설명 수치", text: line.trim() });
  });
  return hits;
}

const listed = (directory, pattern) => {
  try {
    return readdirSync(join(repoRoot, directory)).filter((name) => pattern.test(name)).map((name) => join(directory, name));
  } catch {
    return [];
  }
};
const targets = [
  ...listed("scripts", /^build-figma-.+\.mjs$/),
  ...listed("scripts", /^figma-screens-live-check\.mjs$/),
  ...listed(join("scripts", "lib"), /^figma-.+\.mjs$/),
  ...listed(join("scripts", "templates"), /\.js$/),
  ...listed(join("scripts", "templates", "lib"), /\.js$/),
].sort();
const templateCount = targets.filter((path) => path.startsWith(join("scripts", "templates"))).length;
if (targets.length === 0 || templateCount === 0) {
  console.error(
    `[derived-size-literals] 검사할 파일을 찾지 못했습니다(전체 ${targets.length} · 렌더러 템플릿 ${templateCount}) — ` +
      "잴 것이 없는 통과는 통과가 아닙니다.",
  );
  process.exit(1);
}

const errors = [];
let total = 0;
const counted = {};
for (const path of targets) {
  const hits = countSizeLiterals(readFileSync(join(repoRoot, path), "utf8"), { template: path.startsWith(join("scripts", "templates")) });
  const key = relative(join(repoRoot, "scripts"), join(repoRoot, path)).split("\\").join("/");
  const baseline = BASELINE[key] ?? 0;
  total += hits.length;
  if (hits.length) counted[key] = hits.length;
  if (hits.length > baseline) {
    errors.push(
      `${key}: 인용 없는 크기 리터럴이 ${hits.length}개(기준선 ${baseline}) — 늘었다. ` +
        "선언된 값이면 줄 끝에 `// 선언: <경로>:<줄>` 을 붙이고, 계산값이면 제품 식(패딩 + 자식 · 1fr)이 닫히는지나 " +
        "원장 · 형제 계획의 측정과 같은지로 바꾼다. 보드 캔버스 크기면 콘텐츠에서 계산한다:\n" +
        hits.map((hit) => `      ${key}:${hit.line} [${hit.form}] ${hit.text.slice(0, 140)}`).join("\n"),
    );
  } else if (hits.length < baseline) {
    errors.push(
      `${key}: 크기 리터럴이 ${hits.length}개로 기준선 ${baseline} 보다 줄었다 — scripts/check-derived-size-literals.mjs 의 ` +
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
  `[derived-size-literals] OK: 파일 ${targets.length}개(렌더러 템플릿 ${templateCount}) · 인용 없는 크기 리터럴 ${total}개` +
    `(기준선 ${Object.values(BASELINE).reduce((a, b) => a + b, 0)}) — ` +
    Object.entries(counted).map(([key, count]) => `${key} ${count}`).join(" · "),
);
