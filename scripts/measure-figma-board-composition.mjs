#!/usr/bin/env node
// **화면 보드가 «무엇으로» 만들어졌는지 세는 열거기.**
//
// 왜 있나: 지금까지 화면 보드의 커버리지는 「보드가 있는가」였다. `check-figma-app-screens` 는
// 런너 36개가 생성물과 byte-for-byte 같은지를 보고, `check-figma-surface-coverage` 는 제품
// 표면 400종이 분류돼 있는지를 본다. **어느 쪽도 보드 안이 무엇으로 그려졌는지는 보지 않는다.**
// 그래서 「화면 보드가 라우트 43/46 에 있다」가 커버리지처럼 읽혔다. 실제로는 그림이 43장
// 있다는 뜻이었다.
//
// 2026-09-02 에 `figma/app-screens.*.draw.js` 36조각의 `P` payload 를 훑어 실측했다:
//
//   인스턴스로 붙인 것   43 (4.4%)   ← 컴포넌트 4종뿐
//   원시 도형으로 그린 것 933 (95.6%)  ← `<button>` 만 98개
//
// 소유자가 참고로 지정한 Linear Design System(`IWohxdWtibbqKNKayhhkLN`)의 「화면」 section 은
// 정반대다 — `Issue Page` 는 symbol 78 + frame 21 이고 직속 자식이 `State=Default` 같은
// variant 다. 화면은 «부품의 집»이고, 우리 보드는 «그림»이다.
//
// ── 이 열거기가 답해야 하는 질문은 「몇 개인가」가 아니라 「분모가 무엇인가」다 ──────────
//
// raw 933 **전부**가 컴포넌트가 되어야 하는 것은 아니다. 레이아웃 컨테이너를 컴포넌트로 만들면
// Linear 도 하지 않는 일을 하게 된다 — Linear 도 `Issue Page` 안에 frame 21 개를 그대로 둔다.
// 그래서 분모를 먼저 정의한다. 정의 없이 센 수는 비율이 아니다(DS-D-0037 이 표면 축에서 겪은
// 것과 같은 실패다).
//
// **후보 규칙 — 원시 노드가 컴포넌트 후보인 것은 넷 중 하나일 때다.**
//
//   (a) 상호작용 요소(button·a·input·select·textarea·summary)
//       사람이 누르는 것은 반드시 상태 축(hover/pressed/disabled)을 갖는다. 도형에는 상태 축을
//       담을 자리가 없다 — variant 를 나르는 것은 컴포넌트뿐이다.
//   (b) 벡터 마크(svg)
//       LOUIS 에 아이콘 31종이 이미 컴포넌트로 서 있다. 지금 렌더러는 svg 를 빈 FRAME 으로
//       그린다(`figma-app-screens-renderer.js:256` — `x` 없는 노드는 TEXT 가 아니다).
//   (c) 칠해진 마크 — 채움·테두리·반경을 가졌고 «자식이 없거나» 담은 것이 내용이 아닌 노드
//       진행 막대 트랙·점·칩처럼 자식이 아예 없는 것과, 원형 아바타 자리처럼 자손이 벡터뿐인
//       것을 함께 잡는다. 감쌀 내용이 없는데 칠해진 것은 프레임이 아니라 그려진 원자다.
//       두 조건을 «또는»으로 묶는 이유는 둘 다 실측으로 필요했기 때문이다 —
//       「자식이 없는가」만 보면 28×28 아바타 자리 15개를 놓치고(구조가 span(반경 999) >
//       span > svg 로 두 겹이다), 「담은 것이 내용이 아닌가」만 보면 배경을 깔고 글자를 든
//       칩 6개를 놓친다(그것들은 Figma TEXT 가 될 수 없다 — TEXT 에는 배경·반경이 없어서
//       렌더러도 FRAME + 라벨로 만든다: figma-app-screens-renderer.js:251).
//   (d) 칠해진 컨트롤 묶음 — 칠해져 있고 상호작용 자식이 2개 이상
//       세그먼트·툴바처럼 묶음 자체가 컴포넌트다. 자식만 인스턴스로 바꾸면 묶음의 기하
//       (패딩·간격·선택 표시)는 여전히 손으로 그린 도형으로 남는다.
//
// **그 밖의 모든 것은 구조다.** 칠 없는 auto-layout 프레임 · 자기가 감싸는 것을 칠하는 프레임 ·
// TEXT 잎 · 이미지. Figma 의 FRAME·TEXT·IMAGE 가 그것들의 정본이고, 컴포넌트로 만들면 재사용
// 계약이 없는 껍데기가 된다. **구조는 분모 밖이다** — 그리고 그 사실이 이 파일의 가장 큰
// 판단이므로, 구조에도 유형별 사유를 붙여 세어 인쇄한다. 사유 없이 넘어가는 길은 없다.
//
// ── 판정이 왜 셋이 아니라 넷인가 ─────────────────────────────────────────
//
// 처음 설계는 셋이었다 — replaceable(대응이 있다) · structural(컴포넌트가 아닌 게 맞다) ·
// missing(컴포넌트여야 하는데 LOUIS 에 없다). **그 모델에는 svg 를 적을 자리가 없다.**
// LOUIS 에는 아이콘 31종이 «있다». 그런데 draw payload 는 축약할 때 아이콘의 정체(path·이름)를
// 버려서 어느 아이콘인지 기계가 고를 수 없다. 이것을 `replaceable` 로 세면 「지금 인스턴스로
// 바꾸면 된다」는 거짓말이 되고(무엇으로 바꿀지 모른다), `missing` 으로 세면 「LOUIS 에 없다」는
// 거짓말이 된다(31종이 있다). 어느 쪽으로 접든 읽는 사람이 틀린 일을 하게 된다.
//
//   replaceable  LOUIS 대응이 있고 **지금** 인스턴스로 놓을 수 있다. 이 수가 0 이 되는 것이 목표다.
//   blocked      대응은 있는데 **측정이 그것을 고를 정보를 잃었다.** 고칠 곳은 Figma 가 아니라
//                생성기다 — `build-figma-app-screens.mjs` 의 축약이 아이콘 정체를 실어야 한다.
//   missing      컴포넌트여야 하는데 LOUIS 에 그 축이 없다. 세워야 할 것의 목록이다.
//   structural   컴포넌트가 아닌 것이 맞다. 분모 밖이며, 유형별 사유를 갖는다.
//
// (`check-figma-surface-coverage` 가 축을 둘에서 넷으로 연 것과 같은 이유다 — 적을 자리가 없는
// 판정은 다른 판정으로 «둔갑»하고, 둔갑한 수는 커버리지를 올라간 것처럼 보이게 한다.)
//
// ── `needed` 161 과 겹치는가 (실제로 대조했다) ────────────────────────────
//
// 겹치지 않는다. **두 원장은 조인할 키가 없다.**
//   · `migration/product.surfaces.json` 의 식별자는 `apps/web/<경로>.tsx#<컴포넌트>` —
//     제품 «소스» 축이다. 한 항목이 화면에 0번 그려질 수도, 36번 그려질 수도 있다.
//   · 이 원장의 식별자는 `<route>@<context>#<자식 인덱스 체인>` — 보드 «도형» 축이다.
//     draw payload 에는 제품 소스 경로가 한 글자도 없다(`slim()` 이 싣는 것은 t·r·s·l·f·y…뿐).
// 그래서 같은 것을 두 번 세는 것이 아니라 **다른 축을 각각 한 번씩** 센다. 게이트가 두 식별자
// 공간의 모양이 서로 겹치지 않는 것을 확인해, 나중에 누가 둘을 합치는 것을 막는다.
//
// ── 왜 대체 가능 노드의 «자손»은 세지 않는가 ──────────────────────────────
//
// 인스턴스로 바뀌면 그 자손은 컴포넌트 안으로 사라진다. IconButton 안의 svg 를 따로 또 세면
// 같은 픽셀을 두 번 세는 것이고, 「후보를 줄였는데 후보 수가 그대로」인 원장이 된다.
// payload 가 인스턴스의 `k` 를 이미 비워 두는 것과 같은 이유다
// (`figma-component-substitution.mjs`: `node.children = []`).
// **`missing` 은 반대로 자손을 센다** — 컴포넌트를 세우는 설계가 아직 없어서 무엇이 안으로
// 들어갈지 정해지지 않았다. 미리 지우면 분모가 근거 없이 줄어든다.
//
// ── 기하는 되읽기에서 «실행 시점에» 읽는다 ────────────────────────────────
//
// 대응 판정의 기준값(높이·반경·너비)을 여기 상수로 베끼지 않는다. LOUIS 를 재조정하면 베낀 수는
// 조용히 낡고, 그 순간 이 원장은 「대응이 있다」를 근거 없이 말하게 된다. 규칙은 «어느 컴포넌트의
// 어느 size 인가»만 적고, 값은 `figma/readback.json` 의 geometry 에서 읽는다. 되읽기에 그 이름이
// 없으면 던진다 — 두 파일이 각자 목록을 갖게 두면 반드시 어긋난다.
//
// 실행: `node scripts/measure-figma-board-composition.mjs [--check]`

import { readFileSync, readdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { atomicWriteBatch } from "./lib/atomic-output.mjs";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const figmaDir = resolve(repoRoot, "figma");
const planPath = resolve(repoRoot, "figma/app-screens.plan.json");
const readbackPath = resolve(repoRoot, "figma/readback.json");
const OUT = "migration/figma-board-composition.json";
const outPath = resolve(repoRoot, OUT);
const checkOnly = process.argv.includes("--check");
const TAG = "[figma-board-composition]";
const fail = (message) => { throw new Error(`${TAG} ${message}`); };

const plan = JSON.parse(readFileSync(planPath, "utf8"));
const readback = JSON.parse(readFileSync(readbackPath, "utf8"));

// ── payload 스키마 ────────────────────────────────────────────────────────
// `build-figma-app-screens.mjs` 의 `slim()` 이 내는 축약 트리다. 여기서 쓰는 키만 적는다:
//   t  태그          k  자식        i  인스턴스 [세트 이름, variant]   x  텍스트
//   r  [너비, 높이]  y  텍스트 스타일   f  채움 hex   g  그라디언트   b  테두리 [색, …굵기]
//   d  반경(네 모서리가 같으면 숫자 하나, 다르면 배열)   e  그림자   l  auto-layout
//   w  조각 대기 자리표시(다른 조각이 채운다 — 여기서 세면 두 번 센다)
const readPayload = (name) => {
  const text = readFileSync(resolve(figmaDir, name), "utf8");
  const line = text.split("\n").find((l) => l.startsWith("const P="));
  if (!line) fail(`런너에서 payload 를 찾지 못했습니다: figma/${name}`);
  return JSON.parse(line.slice("const P=".length, -1));
};

const round = (value) => Math.round((value ?? 0) * 100) / 100;
const CONTROL_TAGS = new Set(["button", "a", "input", "select", "textarea", "summary"]);
const isControl = (node) => CONTROL_TAGS.has(node.t);
const isPainted = (node) => Boolean(node.f || node.g || node.b || node.d || node.e);
const childrenOf = (node) => node.k ?? [];
/** 반경은 네 모서리가 같을 때만 수 하나다. 배열이면 컨트롤 기하와 대조할 수 없다. */
const uniformRadius = (node) => (typeof node.d === "number" ? node.d : node.d === undefined ? 0 : null);
const hasText = (node) => {
  let found = false;
  const walk = (n) => { if (found) return; if (n.x) { found = true; return; } for (const c of childrenOf(n)) walk(c); };
  walk(node);
  return found;
};
/**
 * **칠해진 마크인가** — 칠해져 있고, 담은 것이 «내용»이 아닌 노드.
 * 판정: 자손에 글자가 하나도 없고, 자손 중 따로 칠해진 것도 없다. 즉 칠해진 서브트리의 가장
 * 바깥이면서 그 안에 벡터밖에 없다는 뜻이다. 원형 아바타 자리는 span(반경 999) > span > svg 로
 * «두 겹»이라 「자식이 svg 뿐인가」로 보면 15개를 통째로 놓친다(실측해서 고쳤다).
 */
const paintsNoContent = (node) => {
  if (hasText(node)) return false;
  let painted = false;
  const walk = (n) => {
    for (const c of childrenOf(n)) {
      if (isPainted(c)) { painted = true; return; }
      walk(c);
    }
  };
  walk(node);
  return !painted;
};

const countTag = (node, tag) => {
  let n = 0;
  const walk = (m) => { if (m.t === tag) n += 1; for (const c of childrenOf(m)) walk(c); };
  walk(node);
  return n;
};

// ── LOUIS 기하 조회 ───────────────────────────────────────────────────────
// 되읽기의 `geometry[size]` 는 실측 배열이다(같은 size 에 여러 값이 나올 수 있다 — Button 의
// 너비가 라벨 길이만큼 다르다). 그래서 `includes` 로 본다.
const geometryOf = (component, size) => {
  const entry = readback.components?.[component];
  if (!entry) fail(`되읽기에 컴포넌트가 없습니다: ${component}. 규칙이 LOUIS 어휘 밖을 가리킵니다.`);
  const geometry = entry.geometry?.[size];
  if (!geometry) fail(`되읽기에 ${component} 의 size 가 없습니다: ${size}`);
  return geometry;
};
const fits = (values, value) => Array.isArray(values) && values.some((v) => Math.abs(v - value) <= 0.5);

/**
 * **대응 규칙.** 각 규칙은 «어느 컴포넌트의 어느 size 인가»와 «무엇이 그 자리에 서야 하는가»만
 * 적는다. 기준값은 되읽기에서 읽으므로 LOUIS 가 움직이면 규칙도 따라 움직인다.
 *
 * `shape` 가 판정의 전부다 — 기하가 맞아도 shape 가 아니면 대응이 아니다. 실측 사고: 세그먼트
 * 컨트롤의 «움직이는 표시»(span 39×28 d8)는 SegmentedControlItem 과 기하가 정확히 같지만
 * 버튼이 아니다. 기하만 봤다면 장식 하나를 컨트롤로 세었을 것이다.
 */
const MATCH_RULES = [
  {
    id: "icon-button",
    component: "IconButton",
    sizes: ["sm", "md", "lg"],
    keys: ["height", "width", "cornerRadius"],
    why: "글자 없이 아이콘 하나만 든 정사각 버튼 — LOUIS IconButton 의 자리다.",
    shape: (node) =>
      node.t === "button" && !hasText(node) && countTag(node, "svg") >= 1
      && Math.abs(node.r[0] - node.r[1]) <= 1,
  },
  {
    id: "button",
    component: "Button",
    sizes: ["sm", "md", "lg"],
    // 너비는 보지 않는다. 라벨 길이만큼 달라지는 것이 Button 의 계약이다(되읽기의 width 도
    // size 하나에 다섯 값을 든다). 높이·반경이 size 사다리를 고정한다(DS-D-0027).
    keys: ["height", "cornerRadius"],
    why: "라벨을 든 상호작용 요소이고 높이·반경이 Button 사다리 위에 정확히 앉는다.",
    shape: (node) => isControl(node) && hasText(node),
  },
  {
    id: "segmented-control-item",
    component: "SegmentedControlItem",
    sizes: ["md", "xs", "lg"],
    keys: ["height", "cornerRadius"],
    why: "같은 기하의 형제 버튼이 둘 이상인 라벨 버튼 — 하나짜리는 세그먼트가 아니라 그냥 버튼이다.",
    shape: (node, context) =>
      node.t === "button" && hasText(node)
      && context.siblings.filter((s) => s.t === "button" && s.r?.[1] === node.r[1] && s.d === node.d).length >= 2,
  },
  {
    id: "segmented-control",
    component: "SegmentedControl",
    sizes: ["sm", "xs", "md", "lg"],
    keys: ["height", "cornerRadius"],
    why: "칠해진 컨트롤 묶음 — 묶음의 패딩·간격·선택 표시를 나르는 것은 묶음 컴포넌트다.",
    shape: (node) => !isControl(node) && isPainted(node)
      && childrenOf(node).filter(isControl).length >= 2,
  },
  {
    id: "avatar",
    component: "Avatar",
    sizes: ["sm", "md"],
    keys: ["height", "width", "cornerRadius"],
    why: "정사각 원형 자리 — 사람/채널의 얼굴은 LOUIS Avatar 다.",
    shape: (node) => !isControl(node) && Math.abs(node.r[0] - node.r[1]) <= 1 && uniformRadius(node) === 999,
  },
  {
    id: "progress-bar",
    component: "ProgressBar",
    sizes: ["base"],
    keys: ["height", "width", "cornerRadius"],
    why: "자식 없는 알약 트랙 — 진행 표시는 LOUIS ProgressBar 다.",
    shape: (node) => !isControl(node) && childrenOf(node).length === 0 && uniformRadius(node) === 999,
  },
];

/** 규칙 하나를 노드에 대본다. 맞으면 size 키를, 아니면 null 을 돌려준다. */
function applyRule(rule, node, context) {
  if (!rule.shape(node, context)) return null;
  const radius = uniformRadius(node);
  if (radius === null) return null; // 모서리마다 다른 반경은 컨트롤 기하가 아니다
  for (const size of rule.sizes) {
    const geometry = geometryOf(rule.component, size);
    const ok = rule.keys.every((key) => {
      if (key === "height") return fits(geometry.height, round(node.r[1]));
      if (key === "width") return fits(geometry.width, round(node.r[0]));
      if (key === "cornerRadius") return fits(geometry.cornerRadius ?? [0], radius);
      return false;
    });
    if (ok) return size;
  }
  return null;
}

/**
 * **구조 판정.** 후보가 아닌 노드에 유형별 사유를 붙인다. 유형이 하나도 맞지 않으면
 * `unclassified` 로 남긴다 — 「나머지는 전부 구조」라는 기본값을 두면 규칙이 못 보는 것이
 * 조용히 구조로 흘러들고, 그것이 곧 사유 없이 넘어가는 길이다.
 */
const STRUCTURAL_KINDS = [
  // **칠해진 글자 잎은 여기 오지 않는다.** Figma TEXT 에는 배경·반경·테두리가 없어서
  // 렌더러가 FRAME + 라벨로 만든다(figma-app-screens-renderer.js:251). 그래서 `!isPainted` 를
  // 붙여 두 유형이 겹치지 않게 한다 — 겹쳐 두면 후보 조항이 바뀔 때 칠해진 칩이 조용히
  // 「글자」로 흘러들고, 그것이 사유 없이 넘어가는 길이다. 여기 걸리지 않으면 unclassified 다.
  { id: "text", test: (n) => Boolean(n.y) && !isPainted(n) && childrenOf(n).length === 0,
    why: "Figma TEXT 노드가 정본이다. 글자는 컴포넌트가 아니라 레이어다." },
  { id: "image", test: (n) => n.t === "img",
    why: "이미지는 자산 축이 소유한다(DS-D-0038). 컴포넌트로 감싸도 나르는 계약이 없다." },
  { id: "frame", test: (n) => !isPainted(n),
    why: "칠 없는 auto-layout 프레임 — Linear 도 Issue Page 안에 frame 21 개를 그대로 둔다." },
  { id: "surface", test: (n) => isPainted(n) && childrenOf(n).length > 0,
    why: "자기가 감싸는 것을 칠하는 프레임. Figma FRAME 이 채움·반경·테두리를 이미 갖는다." },
];

const boards = [];
const nodes = {};
const counts = { total: 0, instance: 0, replaceable: 0, blocked: 0, missing: 0, structural: 0, unclassified: 0 };
const byComponent = {};
const byInstanceSet = {};
const structuralByKind = {};
const missingByReason = {};
let rawNodesBeforePruning = 0;

const files = readdirSync(figmaDir)
  .filter((name) => /^app-screens\..+\.\d\d\.draw\.js$/.test(name))
  .sort();
if (files.length === 0) fail("figma/app-screens.*.draw.js 런너를 하나도 찾지 못했습니다. 셀 것이 없습니다.");

for (const name of files) {
  const payload = readPayload(name);
  const root = payload.head ?? payload.spec;
  if (!root) fail(`런너에 트리가 없습니다: figma/${name}`);
  const board = {
    route: payload.route,
    context: payload.context,
    frameId: payload.frameId,
    file: `figma/${name}`,
    counts: { total: 0, instance: 0, replaceable: 0, blocked: 0, missing: 0, structural: 0, unclassified: 0 },
  };

  // 전수(가지치기 전). 소유자가 손으로 센 43/933 과 같은 축이라 원장에 함께 남긴다 —
  // 이 수가 흔들리면 아래 분류가 아니라 보드 자체가 바뀐 것이다.
  const countAll = (node) => {
    if (node.w) return;
    rawNodesBeforePruning += node.i ? 0 : 1;
    if (node.i) return;
    for (const child of childrenOf(node)) countAll(child);
  };
  countAll(root);

  const record = (path, node, verdict, entry) => {
    const id = `${payload.route}@${payload.context}#${path === "" ? "root" : path}`;
    if (nodes[id]) fail(`식별자가 중복됐습니다: ${id}`);
    nodes[id] = {
      board: board.file,
      tag: node.t,
      rect: [round(node.r?.[0] ?? 0), round(node.r?.[1] ?? 0)],
      verdict,
      ...entry,
    };
    counts[verdict] += 1;
    counts.total += 1;
    board.counts[verdict] += 1;
    board.counts.total += 1;
  };

  const walk = (node, path, siblings) => {
    // 조각 대기 자리표시. 실제 서브트리는 다른 조각이 들고 있으므로 여기서 세면 두 번 센다.
    if (node.w) return;

    if (node.i) {
      record(path, node, "instance", {
        rule: "instance",
        component: node.i[0],
        variant: node.i[1],
        reason: `이미 컴포넌트 인스턴스다 — ${node.i[0]}(${node.i[1]}).`,
      });
      byInstanceSet[node.i[0]] = (byInstanceSet[node.i[0]] ?? 0) + 1;
      return; // 인스턴스의 자손은 payload 에 없다
    }

    // ── 후보인가 ──
    const context = { siblings };
    const clause =
      isControl(node) ? "a-interactive"
      : node.t === "svg" ? "b-vector"
      : isPainted(node) && (childrenOf(node).length === 0 || paintsNoContent(node)) ? "c-painted-mark"
      : isPainted(node) && childrenOf(node).filter(isControl).length >= 2 ? "d-control-group"
      : null;

    if (clause !== null) {
      for (const rule of MATCH_RULES) {
        const size = applyRule(rule, node, context);
        if (size === null) continue;
        record(path, node, "replaceable", {
          rule: rule.id,
          component: rule.component,
          size,
          candidateClause: clause,
          reason: `${rule.why} 되읽기의 ${rule.component}/${size} 와 ${rule.keys.join("·")} 가 맞는다.`,
        });
        const key = `${rule.component}/${size}`;
        byComponent[key] = (byComponent[key] ?? 0) + 1;
        return; // 인스턴스로 바뀌면 자손은 컴포넌트 안으로 사라진다
      }

      if (clause === "b-vector") {
        record(path, node, "blocked", {
          rule: "icon-identity-lost",
          candidateClause: clause,
          reason:
            "LOUIS 아이콘 31종이 컴포넌트로 서 있는데, draw payload 의 축약(slim)이 아이콘의 " +
            "정체(path·이름)를 버려서 어느 것인지 고를 수 없다. 고칠 곳은 Figma 가 아니라 생성기다.",
        });
        return;
      }

      const reason =
        clause === "a-interactive"
          ? "상호작용 요소인데 높이·반경이 LOUIS 컨트롤 사다리(Button·IconButton·SegmentedControlItem) 어디에도 앉지 않는다. 세워야 할 것은 새 컴포넌트이거나 기존 컴포넌트의 새 size 축이다."
          : clause === "c-painted-mark"
            ? "담은 것이 내용이 아닌데 칠해진 마크 — 그려진 원자인데 대응 기하를 가진 LOUIS 컴포넌트가 없다."
            : "칠해진 컨트롤 묶음인데 묶음 기하가 LOUIS SegmentedControl 사다리에 없다. 자식만 인스턴스로 바꾸면 묶음의 패딩·간격·선택 표시는 손으로 그린 도형으로 남는다.";
      record(path, node, "missing", { rule: `unmatched-${clause}`, candidateClause: clause, reason });
      missingByReason[clause] = (missingByReason[clause] ?? 0) + 1;
      // **미보유는 자손을 센다.** 컴포넌트를 세우는 설계가 아직 없어서 무엇이 안으로 들어갈지
      // 정해지지 않았다 — 미리 지우면 분모가 근거 없이 줄어든다.
      const kids = childrenOf(node);
      for (const [index, child] of kids.entries()) walk(child, path === "" ? String(index) : `${path}.${index}`, kids);
      return;
    }

    // ── 후보가 아니다 → 구조. 유형이 없으면 unclassified 로 남긴다 ──
    const kind = STRUCTURAL_KINDS.find((k) => k.test(node));
    if (kind) {
      record(path, node, "structural", { rule: kind.id, reason: kind.why });
      structuralByKind[kind.id] = (structuralByKind[kind.id] ?? 0) + 1;
    } else {
      record(path, node, "unclassified", {
        rule: "none",
        reason: "어느 후보 조항에도 어느 구조 유형에도 맞지 않았다. 규칙이 이 모양을 아직 보지 못했다.",
      });
    }
    const kids = childrenOf(node);
    for (const [index, child] of kids.entries()) walk(child, path === "" ? String(index) : `${path}.${index}`, kids);
  };

  walk(root, "", []);
  boards.push(board);
}

// ── 비율 ──────────────────────────────────────────────────────────────────
// **분모에서 구조를 뺀다.** 구조까지 넣으면 「인스턴스 비율」은 영원히 낮은 수가 나온다 —
// 컴포넌트가 될 생각이 없는 프레임을 컴포넌트가 못 된 것으로 세기 때문이다.
// 목표(instance 비율 100%)의 분모는 **인스턴스 + 대체 가능**이다: 지금 바꿀 수 있는 것만 든다.
// 그 수만 찍으면 blocked·missing 을 분모 밖에 두어 예쁘게 만들 수 있으므로, **후보 전체 대비**를
// 대조군으로 나란히 찍는다. 하나만 찍으면 둘 중 어느 쪽으로든 속일 수 있다
// (`check-figma-surface-coverage` 가 「대상 대비 / 전체 대비」를 둘 다 찍는 것과 같은 이유다).
const target = counts.instance + counts.replaceable;
const candidates = counts.instance + counts.replaceable + counts.blocked + counts.missing;
const pct = (numerator, denominator) => (denominator > 0 ? Number(((numerator / denominator) * 100).toFixed(1)) : 0);

const output = {
  $comment: "Generated by scripts/measure-figma-board-composition.mjs. Do not edit by hand.",
  $why:
    "화면 보드의 커버리지는 지금까지 「보드가 있는가」였다. 이 원장은 「보드 안이 무엇으로 " +
    "만들어졌는가」를 센다 — 인스턴스인가, 손으로 그린 도형인가.",
  $candidateRule:
    "원시 노드가 컴포넌트 후보인 것은 넷 중 하나일 때다 — (a) 상호작용 요소(button·a·input·" +
    "select·textarea·summary): 누르는 것은 상태 축을 갖고 상태 축은 컴포넌트만 나른다 · " +
    "(b) 벡터 마크(svg): LOUIS 아이콘 31종이 이미 컴포넌트다 · (c) 칠해진 마크(채움·테두리·반경을 " +
    "가졌고 자식이 없거나 자손에 글자도 다른 칠도 없는 노드): 감쌀 내용이 없는데 칠해진 것은 그려진 원자다 · (d) 칠해진 컨트롤 " +
    "묶음(상호작용 자식 2개 이상): 묶음의 패딩·간격·선택 표시를 나르는 것은 묶음 컴포넌트다. " +
    "그 밖의 모든 것은 구조이며 분모 밖이다 — Figma 의 FRAME·TEXT·IMAGE 가 정본이고, 컴포넌트로 " +
    "만들면 재사용 계약이 없는 껍데기가 된다. Linear 의 Issue Page 도 frame 21 개를 그대로 둔다.",
  $verdictRule:
    "판정은 넷이다. replaceable(대응이 있고 지금 인스턴스로 놓을 수 있다) · blocked(대응은 " +
    "있는데 측정이 그것을 고를 정보를 잃었다) · missing(컴포넌트여야 하는데 LOUIS 에 그 축이 " +
    "없다) · structural(컴포넌트가 아닌 것이 맞다). 셋이 아니라 넷인 이유는 svg 를 적을 자리가 " +
    "없었기 때문이다 — LOUIS 에 아이콘 31종이 있으므로 missing 이 아니고, payload 가 정체를 " +
    "버려서 어느 것인지 고를 수 없으므로 replaceable 도 아니다. 어느 쪽으로 접든 읽는 사람이 " +
    "틀린 일을 하게 된다. blocked 가 고칠 곳은 Figma 가 아니라 생성기다.",
  $denominatorRule:
    "instance 비율의 분모는 instance + replaceable 이다. 구조를 분모에 넣으면 컴포넌트가 될 " +
    "생각이 없는 프레임을 못 된 것으로 세어 비율이 영원히 낮게 나온다. 그 분모만 찍으면 " +
    "blocked·missing 을 밖에 두어 수를 예쁘게 만들 수 있으므로, 후보 전체 대비를 대조군으로 " +
    "함께 찍는다.",
  $pruningRule:
    "replaceable 로 판정된 노드의 자손은 세지 않는다 — 인스턴스로 바뀌면 자손은 컴포넌트 안으로 " +
    "사라지고, 따로 세면 같은 픽셀을 두 번 센다(payload 가 인스턴스의 자식을 비워 두는 것과 같은 " +
    "이유다). missing 은 반대로 자손을 센다: 무엇이 안으로 들어갈지 아직 정해지지 않았으므로 " +
    "미리 지우면 분모가 근거 없이 줄어든다. 그래서 total 은 가지치기 전 전수보다 작다.",
  $overlapRule:
    "migration/product.surfaces.json 의 needed 161 과 겹치지 않는다. 그 원장의 식별자는 " +
    "`apps/web/<경로>#<컴포넌트>`(제품 소스 축)이고 이 원장의 식별자는 " +
    "`<route>@<context>#<자식 인덱스 체인>`(보드 도형 축)이다. draw payload 에는 제품 소스 " +
    "경로가 한 글자도 없어 두 원장을 조인할 키가 아예 없다 — 같은 것을 두 번 세는 것이 아니라 " +
    "다른 축을 각각 한 번씩 센다. 게이트가 두 식별자 공간이 겹치지 않는 것을 확인한다.",
  $geometrySource:
    "대응 판정의 기준값(높이·너비·반경)은 figma/readback.json 의 geometry 에서 실행 시점에 " +
    "읽는다. 여기 상수로 베끼면 LOUIS 를 재조정한 순간 이 원장이 근거 없이 「대응이 있다」를 " +
    "말하게 된다. 규칙은 어느 컴포넌트의 어느 size 인가만 적는다.",
  $upperBound:
    "이 수는 하한이다. 대응 규칙 6개가 보는 것은 LOUIS 51종 중 6종(Button·IconButton·" +
    "SegmentedControl·SegmentedControlItem·Avatar·ProgressBar)뿐이다 — 나머지 45종의 대응은 " +
    "아직 규칙이 없어서 missing 이나 structural 로 앉아 있을 수 있다. 규칙을 더하면 " +
    "replaceable 이 올라가고, 그때 게이트가 baseline 을 올리라고 요구한다.",
  productCommit: plan.productCommit,
  figmaFileKey: plan.figmaFileKey,
  boardCount: boards.length,
  rawNodesBeforePruning,
  counts,
  ratio: {
    instanceOverTarget: pct(counts.instance, target),
    instanceOverCandidates: pct(counts.instance, candidates),
    target,
    candidates,
  },
  byInstanceSet,
  byComponent,
  structuralByKind,
  missingByCandidateClause: missingByReason,
  matchRules: MATCH_RULES.map((rule) => ({
    id: rule.id, component: rule.component, sizes: rule.sizes, keys: rule.keys, why: rule.why,
  })),
  boards,
  nodes,
};

const body = JSON.stringify(output, null, 2) + "\n";
const line =
  `보드 ${boards.length} · 원시 전수 ${rawNodesBeforePruning} → 분류 ${counts.total}(가지치기 후 원시 ` +
  `${counts.total - counts.instance} + 인스턴스 ${counts.instance}) · ` +
  `대체가능 ${counts.replaceable} / 막힘 ${counts.blocked} / ` +
  `미보유 ${counts.missing} / 구조 ${counts.structural} / 사유없음 ${counts.unclassified} · ` +
  `인스턴스 비율 ${output.ratio.instanceOverTarget}% (목표 100%, 분모 ${target}) · ` +
  `후보 전체 대비 ${output.ratio.instanceOverCandidates}% (분모 ${candidates}) @ ${String(plan.productCommit).slice(0, 8)}`;

if (checkOnly) {
  let current = "";
  try { current = readFileSync(outPath, "utf8"); }
  catch { fail(`${OUT} 이 없습니다. 먼저 \`pnpm run measure-figma-board-composition\` 로 뽑으세요.`); }
  if (current !== body) {
    fail(
      `${OUT} 이 figma/app-screens.*.draw.js 의 현재 내용과 다릅니다. ` +
      "`pnpm run measure-figma-board-composition` 로 다시 뽑으세요.",
    );
  }
  console.log(`${TAG} checked: ${line}`);
} else {
  atomicWriteBatch([{ absolute: outPath, expected: body }]);
  console.log(`${TAG} built: ${line}`);
}
