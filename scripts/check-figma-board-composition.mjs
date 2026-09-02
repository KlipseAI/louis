#!/usr/bin/env node
// **화면 보드가 손으로 그린 도형으로 되돌아가는 것을 막는 래칫.**
//
// 왜 있나: `check-figma-app-screens` 는 런너 36개가 생성물과 byte-for-byte 같은지를 본다 —
// 보드가 «있는가»는 잠그지만 보드가 «무엇으로 만들어졌는가»는 한 글자도 보지 않는다.
// 그래서 인스턴스를 도형으로 바꿔치기해도, 새 화면을 전부 도형으로 그려 넣어도 초록이었다.
// 2026-09-02 실측: 인스턴스 43 · 원시 도형 933(95.6%). 「보드가 라우트 43/46 에 있다」는
// 커버리지가 아니라 «그림이 43장 있다»는 뜻이었고, 그 사실을 아무 게이트도 말해 주지 않았다.
//
// 이 게이트는 `migration/figma-board-composition.json` 을 읽는다. 그 원장을 뽑는 열거기와
// 짝이다 — 열거기(`--check`)는 「원장이 draw.js 의 현재 내용과 같은가」를, 이 게이트는
// 「원장의 모든 줄이 분류돼 있고 대체 가능이 늘지 않았는가」를 본다. 같은 원장의 앞뒤다.
//
// ── 왜 verify:ci 인가 ─────────────────────────────────────────────────────
// 원장의 재료(`figma/*.draw.js` · `figma/readback.json`)가 전부 이 저장소 안에 있다.
// 제품 저장소를 보지 않으므로 러너에서 실제로 돈다 — `verify-gate-split` 5번이 그 자립성을
// 문자열로 확인한다.
//
// ── 래칫의 방향 (판정마다 다르다) ─────────────────────────────────────────
//
//   replaceable   **양방향.** 목표는 0 이다. 늘면 손으로 그린 것이 늘어난 것이고, 줄면
//                 이득을 잠그라고 요구한다. 잠그지 않으면 그 자리는 다음에 조용히 되돌아온다.
//   unclassified  **양방향, 목표 0.** 규칙이 못 본 모양이 새로 생기면 그것부터 판정해야 한다.
//   instance      **바닥.** 떨어질 수 없다. 오르면 baseline 을 올려 이득을 잠근다.
//   candidates    **바닥.** 후보(instance+replaceable+blocked+missing)를 구조로 재분류해서
//                 분모를 줄이는 길을 막는 그물이다. 이것이 없으면 「대체 가능이 줄었다」를
//                 판정 규칙을 느슨하게 푸는 것만으로 만들어 낼 수 있다.
//   blocked·missing  **세기만 한다.** 늘어난 것은 후퇴가 아니라 발견이다 — 아직 안 본 모양을
//                 열어 보고 「이건 컴포넌트여야 한다」를 적은 결과이고, 그것을 실패로 만들면
//                 다음 사람은 열어 보지 않는 쪽을 고른다(`check-figma-surface-coverage` 의
//                 `needed` 와 같은 판단이다).
//
// ── 왜 비율을 둘 인쇄하는가 ───────────────────────────────────────────────
// 목표(인스턴스 비율 100%)의 분모는 **인스턴스 + 대체 가능**이다. 구조를 분모에 넣으면
// 컴포넌트가 될 생각이 없는 프레임을 못 된 것으로 세어 비율이 영원히 낮게 나온다.
// 그런데 그 수만 찍으면 blocked·missing 을 분모 밖에 두어 예쁘게 만들 수 있으므로,
// **후보 전체 대비**를 대조군으로 나란히 찍는다. 하나만 찍으면 둘 중 어느 쪽으로든 속인다.
//
// ── 두 원장을 합치지 못하게 한다 ──────────────────────────────────────────
// `migration/product.surfaces.json` 의 `needed` 161 과 이 원장의 `missing` 은 **다른 축**이다.
// 하나는 제품 소스(`apps/web/…#컴포넌트`), 하나는 보드 도형(`route@문맥#인덱스 체인`)이고
// draw payload 에는 제품 소스 경로가 한 글자도 없어 조인할 키가 아예 없다. 두 식별자 공간이
// 겹치지 않는 것을 여기서 확인한다 — 언젠가 누가 둘을 한 수로 합치면 같은 것을 두 번 세거나
// (합집합) 절반을 잃는다(교집합).
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const readJson = (relative) => JSON.parse(readFileSync(resolve(repoRoot, relative), "utf8"));

const LEDGER = "migration/figma-board-composition.json";
const SURFACES = "migration/product.surfaces.json";
const READBACK = "figma/readback.json";
const PLAN = "figma/app-screens.plan.json";

// 2026-09-02 실측(앵커 ae8fd627 의 보드 36장). 원시 933 중 후보 214 · 구조 667 ·
// 사유 없음 0. **새 위반을 받아들이려고 이 수를 올리지 마라** — 이 저장소의 baseline 규칙이다.
const REPLACEABLE_BASELINE = 97;
const UNCLASSIFIED_BASELINE = 0;
const INSTANCE_FLOOR = 43;
const CANDIDATE_FLOOR = 214;
const BOARD_FLOOR = 36;

// 판정 어휘. 여기 없는 낱말은 판정이 아니라 오타이고, 오타는 어느 래칫에도 잡히지 않는다.
const VERDICTS = new Set(["instance", "replaceable", "blocked", "missing", "structural", "unclassified"]);
// 후보 조항. 분모를 정하는 것이 이 넷이라, 여기 없는 낱말이 들어오면 분모가 흐려진다.
const CLAUSES = new Set(["a-interactive", "b-vector", "c-painted-mark", "d-control-group"]);
// 사유의 최소 길이. `check-figma-surface-coverage` 의 MINIMUM_REASON 과 같은 값이다 —
// 「없음」 같은 한 낱말이 사유로 통과하면 분류는 형식만 남는다.
const MINIMUM_REASON = 20;
// 규칙 문서가 파일 안에 살아 있어야 한다. 규칙이 사라지면 이 수들은 비율이 아니라 그냥 수다.
const REQUIRED_RULES = [
  ["$candidateRule", "무엇이 컴포넌트 후보인가 — 분모의 정의"],
  ["$verdictRule", "판정을 넷으로 가른 근거"],
  ["$denominatorRule", "비율의 분모에서 구조를 뺀 근거"],
  ["$pruningRule", "대체 가능 노드의 자손을 세지 않는 근거"],
  ["$overlapRule", "제품 표면 원장과 겹치지 않는 근거"],
  ["$geometrySource", "대응 판정의 기준값을 되읽기에서 읽는 근거"],
];

const errors = [];
const ledger = readJson(LEDGER);
const readback = readJson(READBACK);
const plan = readJson(PLAN);

for (const [key, what] of REQUIRED_RULES) {
  if (typeof ledger[key] !== "string" || ledger[key].length < 40) {
    errors.push(LEDGER + " 에 " + key + " 가 없습니다(" + what + "). 규칙 없는 수는 비율이 아닙니다.");
  }
}

// 원장이 그린 보드와 지금 런너가 그리는 보드가 같은 제품 앵커여야 한다. 어긋나면 원장은
// 어제의 화면을 세고 있는 것이고, 그 수로 오늘을 판정하게 된다.
if (ledger.productCommit !== plan.productCommit) {
  errors.push(
    LEDGER + " 의 productCommit(" + String(ledger.productCommit).slice(0, 8) + ") 이 " +
      PLAN + " 의 " + String(plan.productCommit).slice(0, 8) + " 와 다릅니다. " +
      "`pnpm run measure-figma-board-composition` 로 다시 뽑으세요.",
  );
}

// 대응 규칙이 가리키는 이름은 되읽기에 실재해야 한다. 없는 이름을 적는 것은 「LOUIS 에 있다」를
// 근거 없이 말하는 것이고, 그것이 원장을 낡게 만드는 방식 그 자체다.
const componentVocabulary = new Set(Object.keys(readback.components ?? {}));
if (componentVocabulary.size === 0) {
  errors.push(READBACK + " 에서 Figma 컴포넌트 이름을 하나도 읽지 못했습니다.");
}
const rules = Array.isArray(ledger.matchRules) ? ledger.matchRules : [];
if (rules.length === 0) errors.push(LEDGER + " 에 대응 규칙(matchRules)이 없습니다. 규칙이 없으면 대체 가능은 언제나 0 입니다.");
for (const rule of rules) {
  if (!componentVocabulary.has(rule.component)) {
    errors.push(
      LEDGER + "#matchRules." + String(rule.id) + ": 대응 규칙이 되읽기에 없는 컴포넌트를 " +
        "가리킵니다: " + String(rule.component),
    );
  }
  if (typeof rule.why !== "string" || rule.why.length < MINIMUM_REASON) {
    errors.push(LEDGER + "#matchRules." + String(rule.id) + ": why 가 " + MINIMUM_REASON + "자 미만입니다.");
  }
}

const nodes = ledger.nodes ?? {};
const ids = Object.keys(nodes);
if (ids.length === 0) errors.push(LEDGER + " 에 노드가 하나도 없습니다. 셀 것이 없으면 통과가 아닙니다.");

const recounted = { total: 0, instance: 0, replaceable: 0, blocked: 0, missing: 0, structural: 0, unclassified: 0 };
const unclassifiedIds = [];
const byComponent = {};

for (const id of ids) {
  const node = nodes[id];
  const at = LEDGER + "#" + id;
  // 식별자는 `<route>@<문맥>#<자식 인덱스 체인>` 이다. 모양이 무너지면 보드 도형 축이
  // 아니게 되고, 제품 표면 축과 겹치는지도 판정할 수 없다.
  if (!/^[^@]+@[^#]+#(root|\d+(\.\d+)*)$/.test(id)) {
    errors.push(at + ": 식별자가 `<route>@<문맥>#<자식 인덱스 체인>` 모양이 아닙니다.");
    continue;
  }
  if (!VERDICTS.has(node.verdict)) {
    errors.push(at + ": verdict 가 판정 어휘 밖입니다: " + String(node.verdict) + ". " +
      "어휘 밖의 낱말은 어느 래칫에도 잡히지 않습니다.");
    continue;
  }
  if (typeof node.reason !== "string" || node.reason.trim().length < MINIMUM_REASON) {
    errors.push(at + ": " + node.verdict + " 로 두려면 reason 에 " + MINIMUM_REASON + "자 이상의 사유가 필요합니다.");
  }
  // 후보 조항은 구조·사유없음을 뺀 판정에만 붙는다. 구조에 조항이 붙으면 분모가 흐려진다.
  const clause = node.candidateClause ?? null;
  if (node.verdict === "structural" || node.verdict === "unclassified") {
    if (clause !== null) errors.push(at + ": " + node.verdict + " 에 candidateClause 가 붙어 있습니다: " + String(clause));
  } else if (node.verdict !== "instance" && !CLAUSES.has(clause)) {
    errors.push(at + ": " + node.verdict + " 에는 후보 조항(candidateClause)이 " + [...CLAUSES].join("/") +
      " 중 하나로 필요합니다: " + String(clause));
  }
  if (node.verdict === "replaceable" || node.verdict === "instance") {
    if (typeof node.component !== "string" || node.component.length === 0) {
      errors.push(at + ": " + node.verdict + " 인데 어느 컴포넌트인지 적혀 있지 않습니다.");
    } else if (node.verdict === "replaceable") {
      if (!componentVocabulary.has(node.component)) {
        errors.push(at + ": 되읽기에 없는 컴포넌트를 대응으로 적었습니다: " + node.component);
      }
      byComponent[node.component + "/" + String(node.size)] = (byComponent[node.component + "/" + String(node.size)] ?? 0) + 1;
    }
  }
  if (node.verdict === "unclassified") unclassifiedIds.push(id);
  recounted[node.verdict] += 1;
  recounted.total += 1;
}

// 요약이 스스로를 속이지 못하게. 파일 안의 counts 는 다시 센 값과 같아야 한다.
const counts = ledger.counts ?? {};
for (const key of Object.keys(recounted)) {
  if (counts[key] !== recounted[key]) {
    errors.push(
      LEDGER + " 의 counts." + key + " (" + String(counts[key]) + ") 가 다시 센 값 " + recounted[key] +
        " 와 다릅니다. `pnpm run measure-figma-board-composition` 로 다시 뽑으세요.",
    );
  }
}
// 대응 집계도 다시 센다. 여기가 어긋나면 「무엇을 인스턴스로 바꿔야 하는가」의 목록이 틀린다.
for (const key of new Set([...Object.keys(byComponent), ...Object.keys(ledger.byComponent ?? {})])) {
  if ((ledger.byComponent ?? {})[key] !== byComponent[key]) {
    errors.push(
      LEDGER + " 의 byComponent." + key + " (" + String((ledger.byComponent ?? {})[key]) + ") 가 " +
        "다시 센 값 " + String(byComponent[key]) + " 와 다릅니다.",
    );
  }
}

// ── 두 원장은 다른 축이다 ─────────────────────────────────────────────────
// 식별자 공간이 겹치면 같은 것을 두 번 세거나 절반을 잃는다. 지금은 모양이 달라 겹칠 수
// 없으므로(보드는 `@` 를 갖고 표면은 `apps/web/` 으로 시작한다) 겹치는 날 멈춘다.
const surfaces = readJson(SURFACES).surfaces ?? {};
const shared = ids.filter((id) => Object.hasOwn(surfaces, id));
if (shared.length > 0) {
  errors.push(
    "보드 원장과 " + SURFACES + " 가 같은 식별자를 씁니다: " + shared.slice(0, 3).join(", ") +
      ". 두 원장은 다른 축(보드 도형 ↔ 제품 소스)이고 조인할 키가 없습니다 — 합치면 " +
      "같은 것을 두 번 세거나 절반을 잃습니다.",
  );
}
const surfaceShaped = ids.filter((id) => id.startsWith("apps/web/"));
if (surfaceShaped.length > 0) {
  errors.push(
    "보드 원장에 제품 소스 모양의 식별자가 들어왔습니다: " + surfaceShaped.slice(0, 3).join(", ") +
      ". 보드 축은 제품 소스 경로를 알지 못합니다(draw payload 에 그 정보가 없습니다).",
  );
}

// ── 래칫 ──────────────────────────────────────────────────────────────────
const candidates = recounted.instance + recounted.replaceable + recounted.blocked + recounted.missing;

if (recounted.replaceable > REPLACEABLE_BASELINE) {
  errors.push(
    "대체 가능한 도형이 " + (recounted.replaceable - REPLACEABLE_BASELINE) + "개 늘었습니다 " +
      "(" + REPLACEABLE_BASELINE + " → " + recounted.replaceable + "). LOUIS 에 이미 있는 " +
      "컴포넌트를 손으로 다시 그렸다는 뜻입니다 — 인스턴스로 놓으세요. 목표는 0 입니다.",
  );
} else if (recounted.replaceable < REPLACEABLE_BASELINE) {
  errors.push(
    "대체 가능한 도형이 " + (REPLACEABLE_BASELINE - recounted.replaceable) + "개 줄었습니다 " +
      "(" + REPLACEABLE_BASELINE + " → " + recounted.replaceable + "). 이득을 잠그세요 — " +
      "이 파일의 REPLACEABLE_BASELINE 을 " + recounted.replaceable + " 로 내립니다. " +
      "내리지 않으면 그 자리는 다음에 조용히 되돌아옵니다.",
  );
}

if (recounted.unclassified > UNCLASSIFIED_BASELINE) {
  errors.push(
    "규칙이 보지 못한 모양이 " + (recounted.unclassified - UNCLASSIFIED_BASELINE) + "개 늘었습니다 " +
      "(" + UNCLASSIFIED_BASELINE + " → " + recounted.unclassified + "). 후보 조항이나 구조 유형을 " +
      "넓혀 판정하세요. 사유 없이 넘기는 길은 없습니다.\n      새로 생긴 자리: " +
      unclassifiedIds.slice(0, 5).join(", "),
  );
} else if (recounted.unclassified < UNCLASSIFIED_BASELINE) {
  errors.push(
    "규칙이 보지 못한 모양이 " + (UNCLASSIFIED_BASELINE - recounted.unclassified) + "개 줄었습니다. " +
      "이 파일의 UNCLASSIFIED_BASELINE 을 " + recounted.unclassified + " 로 내려 이득을 잠그세요.",
  );
}

if (recounted.instance < INSTANCE_FLOOR) {
  errors.push(
    "보드의 인스턴스가 " + (INSTANCE_FLOOR - recounted.instance) + "개 줄었습니다 " +
      "(" + INSTANCE_FLOOR + " → " + recounted.instance + "). 인스턴스를 도형으로 되돌리는 것은 " +
      "후퇴입니다 — `check-figma-app-screens` 는 이 교환을 보지 못합니다.",
  );
} else if (recounted.instance > INSTANCE_FLOOR) {
  errors.push(
    "보드의 인스턴스가 " + (recounted.instance - INSTANCE_FLOOR) + "개 늘었습니다 " +
      "(" + INSTANCE_FLOOR + " → " + recounted.instance + "). 이 파일의 INSTANCE_FLOOR 를 " +
      recounted.instance + " 로 올려 이득을 잠그세요.",
  );
}

// **분모를 지워서 비율을 올리는 길을 막는 그물.** 후보를 구조로 재분류하면 대체 가능도 줄고
// 비율도 오른다 — 그림은 한 장도 안 바뀌었는데.
if (candidates < CANDIDATE_FLOOR) {
  errors.push(
    "컴포넌트 후보가 바닥 아래로 내려갔습니다 (" + CANDIDATE_FLOOR + " → " + candidates + "). " +
      "후보를 구조로 재분류해 분모를 줄이면 비율은 오르지만 보드는 한 장도 바뀌지 않습니다. " +
      "보드가 실제로 줄었다면 CANDIDATE_FLOOR 를 함께 내리고 무엇이 사라졌는지 적으세요.",
  );
}

const boardCount = Array.isArray(ledger.boards) ? ledger.boards.length : 0;
if (boardCount < BOARD_FLOOR) {
  errors.push(
    "보드 수가 바닥 아래로 내려갔습니다 (" + BOARD_FLOOR + " → " + boardCount + "). " +
      "보드를 지워서 수를 예쁘게 만드는 길을 막는 그물입니다.",
  );
}

if (errors.length > 0) {
  console.error("화면 보드 구성 게이트 실패:");
  for (const error of errors) console.error("  - " + error);
  process.exit(1);
}

const target = recounted.instance + recounted.replaceable;
const pct = (numerator, denominator) => (denominator > 0 ? ((numerator / denominator) * 100).toFixed(1) : "0.0");
console.log(
  "화면 보드 구성: 보드 " + boardCount + "장 · 인스턴스 " + recounted.instance +
    " / 대체가능 " + recounted.replaceable + " / 구조 " + recounted.structural +
    " / 미보유 " + recounted.missing + " / 막힘 " + recounted.blocked +
    " / 사유없음 " + recounted.unclassified +
    " · 인스턴스 비율 " + pct(recounted.instance, target) + "% (목표 100%, 분모 " + target +
    " = 인스턴스+대체가능) · 후보 전체 대비 " + pct(recounted.instance, candidates) +
    "% (분모 " + candidates + ").",
);
// **구조는 분모 밖이다** — 그 판단이 이 수 전체를 좌우하므로 이유를 매번 함께 찍는다.
console.log(
  "  구조 " + recounted.structural + "개는 분모에서 뺐다: 칠 없는 auto-layout 프레임 · 자기가 " +
    "감싸는 것을 칠하는 프레임 · TEXT 잎 · 이미지. Figma 의 FRAME·TEXT·IMAGE 가 그것들의 정본이고 " +
    "컴포넌트로 만들면 재사용 계약이 없는 껍데기가 된다(Linear 도 Issue Page 안에 frame 21 개를 " +
    "그대로 둔다). 후보 규칙은 " + LEDGER + " 의 $candidateRule 이 소유한다.",
);
console.log(
  "  대체가능 " + recounted.replaceable + "개가 지금 바꿀 수 있는 것이다: " +
    Object.entries(byComponent).sort((a, z) => z[1] - a[1]).map(([k, v]) => k + " " + v).join(" · ") +
    ". 미보유 " + recounted.missing + " · 막힘 " + recounted.blocked +
    "(대응은 있는데 payload 가 아이콘 정체를 버려 고를 수 없다)은 늘어도 실패하지 않는다 — " +
    "발견이지 후퇴가 아니다.",
);
