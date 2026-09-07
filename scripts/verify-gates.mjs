import { execFileSync } from "node:child_process";
import {
  existsSync,
  linkSync,
  lstatSync,
  readFileSync,
  symlinkSync,
  unlinkSync,
  writeFileSync,
} from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

// **CI 에는 제품 저장소가 없다.** 카나리아 대부분은 이 저장소 안에서 끝나지만, 인용 좌표
// 카나리아 셋은 `verify-citations.mjs` 를 부르고 그 스크립트가 `git -C <제품 저장소>` 를 한다.
// 2026-08-18~08-22 사이 hosted CI 가 46회 연속 빨갰던 원인 중 하나가 이것이다 — 로컬은 제품 저장소가
// 있어 통과하고, 러너에서만 실패했다.
//
// `--no-product` 를 주면 그 셋만 건너뛴다. **건너뛴 것은 반드시 이름으로 찍는다** — 조용히
// 줄어든 카나리아 수는 「통과」로 읽히고, 그게 게이트를 가진 이유를 없앤다.
const PRODUCT_DEPENDENT_GATES = new Set(["scripts/verify-citations.mjs"]);
const skipProduct = process.argv.includes("--no-product");
const skippedCanaries = [];

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const errors = [];
let canaryCount = 0;
const cleanRuns = new Map();
const tick = String.fromCharCode(96);

runPass("check catalog", "scripts/build-design-docs.mjs", "--check");
runPass("check AI docs", "scripts/build-llms-docs.mjs", "--check");
validatePackageScaffolds();
validateFenceProjection();

withScaffoldCanary(
  "packages/css/package.json",
  (source) => {
    const value = JSON.parse(source);
    value.exports = { ".": "./dist/index.js" };
    return JSON.stringify(value, null, 2) + "\n";
  },
  "undeclared package export",
  "exports 서브패스가 선언과 다릅니다",
);

withScaffoldCanary(
  "packages/tokens/package.json",
  (source) => {
    const value = JSON.parse(source);
    delete value.sideEffects;
    return JSON.stringify(value, null, 2) + "\n";
  },
  "missing sideEffects on css-exporting package",
  "sideEffects는",
);

withCanary(
  "design/manifest.schema.json",
  (source) => {
    const schema = JSON.parse(source);
    schema.unknownGateCanary = true;
    return JSON.stringify(schema, null, 2) + "\n";
  },
  "schema unknown keyword",
  "scripts/build-design-docs.mjs",
  "Unsupported JSON Schema keyword",
  "--check",
);

withCanary(
  "design/manifest.json",
  (source) => {
    const manifest = JSON.parse(source);
    manifest.documents[1].id = manifest.documents[0].id;
    return JSON.stringify(manifest, null, 2) + "\n";
  },
  "duplicate document id",
  "scripts/build-design-docs.mjs",
  "documents.id 중복",
  "--check",
);

withCanary(
  "design/manifest.json",
  (source) => {
    const manifest = JSON.parse(source);
    manifest.schemaVersion = 2;
    return JSON.stringify(manifest, null, 2) + "\n";
  },
  "AI direct schema validation",
  "scripts/build-llms-docs.mjs",
  "manifest schema $.schemaVersion",
  "--check",
);

withCanary(
  "design/manifest.json",
  (source) => {
    const manifest = JSON.parse(source);
    manifest.components.find((item) => item.id === "button").maturity = "beta";
    return JSON.stringify(manifest, null, 2) + "\n";
  },
  "catalog item maturity mismatch",
  "scripts/build-design-docs.mjs",
  "maturity가 document와 다릅니다",
  "--check",
);

// ── 화면 보드 구성 래칫 카나리아 열 (2026-09-02) ─────────────────────────
// (같은 날 아이콘 정체 축이 열리며 셋이 더 붙었다 — ⑪⑫⑬ 은 커버리지 카나리아 바로 위에 있다.)
// `check-figma-app-screens` 는 런너가 생성물과 byte-for-byte 같은지만 본다 — 보드 «안»이
// 인스턴스인지 손으로 그린 도형인지는 한 글자도 보지 않는다. 그 바깥을 세는 게이트가 실제로
// 빨개지는지 열 방향에서 확인한다. 열 다 실패 모드가 「게이트가 조용히 통과한다」다.
//
// ⑦~⑩ 은 다섯째 판정 `bespoke` 를 연 걸음(DS-D-0046)이 함께 세운 것이다. 그 칸은 「제품이
// 이 자리에서 정본 클래스를 물지 않는다」를 뜻하고, 잘못 다루면 **바꾸면 안 되는 자리를
// 바꾸라고 시키거나**(⑦) **분모를 조용히 좁힌다**(⑧). ⑨⑩ 은 그 판정이 근거 없이 손으로
// 적히는 길을 막는다.

// ① 손으로 그린 것이 늘었다. 목표가 0 인 수라 오르는 것이 곧 후퇴다.
withCanary(
  "migration/figma-board-composition.json",
  (source) => {
    const ledger = JSON.parse(source);
    const id = Object.keys(ledger.nodes).find((key) => ledger.nodes[key].verdict === "structural");
    ledger.nodes[id] = {
      ...ledger.nodes[id],
      verdict: "replaceable",
      rule: "button",
      component: "Button",
      size: "md",
      candidateClause: "a-interactive",
      reason: "카나리아 — LOUIS Button 과 높이·반경이 맞는 라벨 컨트롤로 바꿔 놓았다.",
    };
    ledger.counts.structural -= 1;
    ledger.counts.replaceable += 1;
    ledger.byComponent["Button/md"] += 1;
    return JSON.stringify(ledger, null, 2) + "\n";
  },
  "board composition replaceable rose",
  "scripts/check-figma-board-composition.mjs",
  "대체 가능한 도형이",
);

// ② **인스턴스를 도형으로 바꿔치기했다.** 이것이 이 게이트가 없으면 완전히 조용한 교환이다 —
// 런너 파일은 여전히 생성물과 같고, 보드도 여전히 «있다».
withCanary(
  "migration/figma-board-composition.json",
  (source) => {
    const ledger = JSON.parse(source);
    const id = Object.keys(ledger.nodes).find((key) => ledger.nodes[key].verdict === "instance");
    ledger.nodes[id] = {
      board: ledger.nodes[id].board,
      tag: ledger.nodes[id].tag,
      rect: ledger.nodes[id].rect,
      verdict: "structural",
      rule: "surface",
      reason: "카나리아 — 인스턴스를 손으로 그린 면으로 되돌려 놓았다.",
    };
    ledger.counts.instance -= 1;
    ledger.counts.structural += 1;
    return JSON.stringify(ledger, null, 2) + "\n";
  },
  "board composition instance traded for a drawn shape",
  "scripts/check-figma-board-composition.mjs",
  "보드의 인스턴스가",
);

// ③ 후보를 구조로 재분류해 분모를 줄였다. 비율은 오르는데 그림은 한 장도 안 바뀐 경우다.
withCanary(
  "migration/figma-board-composition.json",
  (source) => {
    const ledger = JSON.parse(source);
    /* **옮기는 개수를 1 로 고정하지 않는다.** 이 그물은 후보 총수가 CANDIDATE_FLOOR «아래로»
       내려갈 때만 운다. 보드가 늘면 후보도 함께 늘어 바닥과의 사이에 여유가 생기는데(보드
       원장을 다시 뽑으면 흔히 벌어진다), 그 여유가 있는 동안 한 자리만 옮기면 그물은 울지
       않는다 — canary 가 자기 대상을 잃고 게이트 전체가 멈춘다. 위 인용·드리프트 canary 가
       같은 사고를 겪고 같은 처방을 적어 두었다: 재는 값을 canary 에 박지 말고 그때그때 읽어
       온다. 바닥의 임자는 checker 이므로 그 파일에서 읽어, **바닥을 실제로 넘길 만큼** 옮긴다.
       (여유 자체를 잠그는 것은 이 canary 가 할 일이 아니다 — 그 판단은 checker 의 래칫이
       하고, 여기서는 「내려가면 우는가」만 증명한다.) */
    const checker = readFileSync(
      resolve(repoRoot, "scripts/check-figma-board-composition.mjs"),
      "utf8",
    );
    const floorMatch = checker.match(/const CANDIDATE_FLOOR = (\d+);/);
    if (!floorMatch) {
      errors.push("board composition 후보 바닥 canary가 CANDIDATE_FLOOR 를 읽지 못했습니다.");
      return source;
    }
    const floor = Number(floorMatch[1]);
    const candidates = ledger.counts.instance + ledger.counts.replaceable + ledger.counts.bespoke
      + ledger.counts.blocked + ledger.counts.missing;
    const need = candidates - floor + 1;
    const ids = Object.keys(ledger.nodes)
      .filter((key) => ledger.nodes[key].verdict === "missing")
      .slice(0, Math.max(need, 0));
    if (need < 1 || ids.length < need) {
      errors.push(
        "board composition 후보 바닥 canary가 옮길 미보유 자리를 찾지 못했습니다: 바닥 " + floor +
          " · 후보 " + candidates + " · 필요 " + need + " · 미보유 " + ledger.counts.missing + ".",
      );
      return source;
    }
    for (const id of ids) {
      const node = { ...ledger.nodes[id], verdict: "structural", rule: "surface",
        reason: "카나리아 — 후보를 구조로 옮겨 분모를 줄여 놓았다." };
      delete node.candidateClause;
      ledger.nodes[id] = node;
    }
    ledger.counts.missing -= ids.length;
    ledger.counts.structural += ids.length;
    return JSON.stringify(ledger, null, 2) + "\n";
  },
  "board composition candidate reclassified as structural",
  "scripts/check-figma-board-composition.mjs",
  "컴포넌트 후보가 바닥 아래로",
);

// ④ 규칙이 못 본 모양이 새로 생겼다. 그것부터 판정하지 않으면 분모가 흐려진다.
withCanary(
  "migration/figma-board-composition.json",
  (source) => {
    const ledger = JSON.parse(source);
    const id = Object.keys(ledger.nodes).find((key) => ledger.nodes[key].verdict === "structural");
    const node = { ...ledger.nodes[id], verdict: "unclassified", rule: "none",
      reason: "카나리아 — 어느 후보 조항에도 어느 구조 유형에도 맞지 않는 자리로 두었다." };
    delete node.candidateClause;
    ledger.nodes[id] = node;
    ledger.counts.structural -= 1;
    ledger.counts.unclassified += 1;
    return JSON.stringify(ledger, null, 2) + "\n";
  },
  "board composition new unclassified shape",
  "scripts/check-figma-board-composition.mjs",
  "규칙이 보지 못한 모양이",
);

// ⑤ 분모의 정의가 파일에서 사라졌다. 규칙 없는 수는 비율이 아니다 — DS-D-0037 이 표면 축에서
// 겪은 실패가 그것이다.
withCanary(
  "migration/figma-board-composition.json",
  (source) => {
    const ledger = JSON.parse(source);
    delete ledger.$candidateRule;
    return JSON.stringify(ledger, null, 2) + "\n";
  },
  "board composition missing candidate rule",
  "scripts/check-figma-board-composition.mjs",
  "$candidateRule 가 없습니다",
);

// ⑥ 되읽기에 없는 이름을 대응으로 적었다. 「LOUIS 에 있다」가 아무 문자열이나 적어도 되는
// 자리가 되면 원장은 그날부터 낡는다.
withCanary(
  "migration/figma-board-composition.json",
  (source) => {
    const ledger = JSON.parse(source);
    // **matchRules 가 아니라 노드를 고른다.** 규칙 목록에도 같은 필드가 있어 문자열 치환으로
    // 바꾸면 규칙 검사가 먼저 걸리고, 노드 쪽 어휘 검사는 시험되지 않은 채 지나간다.
    // **`bespoke` 를 고른다** — 2026-09-02 에 `replaceable` 이 0 이 되면서 그 칸에는 고를
    // 노드가 없어졌다. 어휘 검사는 「LOUIS 컴포넌트 이름을 적는 판정」 셋 모두에 걸린다.
    const id = Object.keys(ledger.nodes).find((key) => ledger.nodes[key].verdict === "bespoke");
    ledger.nodes[id] = { ...ledger.nodes[id], component: "ComponentThatIsNotInLouis" };
    return JSON.stringify(ledger, null, 2) + "\n";
  },
  "board composition unknown component name",
  "scripts/check-figma-board-composition.mjs",
  "되읽기에 없는 컴포넌트를 대응으로 적었습니다",
);

// ⑦ **바꾸면 안 되는 자리를 「지금 바꿀 수 있는 것」으로 되돌려 놓았다.** 이 게이트가 없으면
//    원장이 다시 「대체가능 N개가 지금 바꿀 수 있는 것이다」를 인쇄하고, 그 말을 믿은 사람이
//    제품이 물지 않는 자리를 Figma 에서 인스턴스로 바꾼다 — 두 축이 어긋나는 바로 그 사고다.
withCanary(
  "migration/figma-board-composition.json",
  (source) => {
    const ledger = JSON.parse(source);
    // **컴포넌트 쪽 bespoke 를 고른다.** 이 칸에는 아이콘 쪽 bespoke 도 앉아 있는데(그쪽은
    // `component`·`size` 대신 `icon`·`glyph` 를 든다) 아래 집계 조작이 그것을 만나면
    // `undefined/undefined` 를 건드리게 되어 카나리아가 재려던 것을 못 잰다.
    const id = Object.keys(ledger.nodes).find(
      (key) => ledger.nodes[key].verdict === "bespoke" && ledger.nodes[key].component,
    );
    const node = ledger.nodes[id];
    ledger.nodes[id] = { ...node, verdict: "replaceable" };
    ledger.counts.bespoke -= 1;
    ledger.counts.replaceable += 1;
    const key = node.component + "/" + node.size;
    ledger.bespokeByComponent[key] -= 1;
    if (ledger.bespokeByComponent[key] === 0) delete ledger.bespokeByComponent[key];
    ledger.byComponent[key] = (ledger.byComponent[key] ?? 0) + 1;
    return JSON.stringify(ledger, null, 2) + "\n";
  },
  "board composition bespoke turned back into replaceable",
  "scripts/check-figma-board-composition.mjs",
  "대체 가능한 도형이",
);

// ⑧ bespoke 가 줄었는데 잠그지 않았다. 줄어드는 길은 둘이고(제품이 정본을 물기 시작했다 /
//    판정을 풀어 다른 칸으로 흘렸다) 둘은 완전히 다른 소식이라, 손으로 적지 않고 지나가면
//    안 된다. `missing` 으로 흘리는 것이 여기서 잡히는 대표적 경로다.
withCanary(
  "migration/figma-board-composition.json",
  (source) => {
    const ledger = JSON.parse(source);
    const id = Object.keys(ledger.nodes).find(
      (key) => ledger.nodes[key].verdict === "bespoke" && ledger.nodes[key].component,
    );
    const node = ledger.nodes[id];
    ledger.nodes[id] = {
      board: node.board,
      tag: node.tag,
      rect: node.rect,
      verdict: "missing",
      rule: "unmatched-a-interactive",
      candidateClause: node.candidateClause,
      reason: "카나리아 — 제품이 물지 않는 자리를 「LOUIS 에 없다」로 흘려 놓았다.",
    };
    ledger.counts.bespoke -= 1;
    ledger.counts.missing += 1;
    const key = node.component + "/" + node.size;
    ledger.bespokeByComponent[key] -= 1;
    if (ledger.bespokeByComponent[key] === 0) delete ledger.bespokeByComponent[key];
    return JSON.stringify(ledger, null, 2) + "\n";
  },
  "board composition bespoke fell without locking the gain",
  "scripts/check-figma-board-composition.mjs",
  "제품이 정본을 물지 않는 자리(bespoke)가",
);

// ⑨ bespoke 인데 근거가 없다. 「제품이 안 문다」가 사유 문장만으로 서면 다음 사람이 손으로
//    아무 자리나 이 칸에 넣을 수 있고, 그 순간 이 칸이 것들을 숨기는 자리가 된다.
withCanary(
  "migration/figma-board-composition.json",
  (source) => {
    const ledger = JSON.parse(source);
    const id = Object.keys(ledger.nodes).find(
      (key) => ledger.nodes[key].verdict === "bespoke" && ledger.nodes[key].component,
    );
    const node = { ...ledger.nodes[id] };
    delete node.site;
    delete node.probe;
    ledger.nodes[id] = node;
    return JSON.stringify(ledger, null, 2) + "\n";
  },
  "board composition bespoke without a joined site or probe",
  "scripts/check-figma-board-composition.mjs",
  "bespoke 인데 근거가 된 정본 자리",
);

// ⑩ **조인표에서 판정이 사라졌다.** 열거기는 정본 자리·제외 목록과 조인해 bespoke 를 낸다.
//    목록에서 한 항목이 빠지면 「판정 없는 자리」가 생기는데, 그때 조용히 replaceable 로
//    접히면 다시 바꾸면 안 되는 자리를 바꾸라고 시키게 된다 — 던지는지 확인한다.
withCanary(
  "figma/app-screens.plan.json",
  (source) => {
    const plan = JSON.parse(source);
    plan.louisPrimitiveExclusions = plan.louisPrimitiveExclusions.filter(
      (entry) => entry.component !== "IconButton",
    );
    return JSON.stringify(plan, null, 2) + "\n";
  },
  "board composition primitive site table lost a verdict",
  "scripts/measure-figma-board-composition.mjs",
  "정본 자리 목록에도 제외 목록에도 없습니다",
  "--check",
);

// ── 아이콘 정체 카나리아 셋 (2026-09-02) ─────────────────────────────────
// 아이콘 자리는 오랫동안 `blocked` 한 칸이었고 그 칸에는 잠글 것이 없었다 — 「모른다」가
// 판정이었기 때문이다. 이름이 붙자 그 자리도 bespoke·missing 으로 갈렸고, 갈린 순간부터
// **틀린 이름을 조용히 놓는 길**이 생긴다. 셋 다 실패 모드가 「게이트가 조용히 통과한다」다.

// ⑪ **아이콘 bespoke 인데 근거(glyph)가 없다.** 컴포넌트 쪽 ⑨와 같은 구멍의 아이콘 판이다.
//    근거 칸이 비면 「제품이 이 아이콘을 물지 않는다」가 사유 문장만으로 서게 된다.
withCanary(
  "migration/figma-board-composition.json",
  (source) => {
    const ledger = JSON.parse(source);
    const id = Object.keys(ledger.nodes).find(
      (key) => ledger.nodes[key].verdict === "bespoke" && ledger.nodes[key].icon,
    );
    const node = { ...ledger.nodes[id] };
    delete node.glyph;
    ledger.nodes[id] = node;
    return JSON.stringify(ledger, null, 2) + "\n";
  },
  "board composition icon bespoke without a joined glyph",
  "scripts/check-figma-board-composition.mjs",
  "아이콘 자리인데 어느 글리프인지",
);

// ⑫ **되읽기에 없는 아이콘 이름을 댔다.** 「LOUIS 에 이 아이콘이 있다」는 주장은 되읽기의
//    `icons` 사전으로만 설 수 있다. 사전을 안 보면 이름은 짐작이 되고, 짐작한 이름이 붙은
//    자리는 「지금 바꾸면 안 된다」가 아니라 「무엇을 세워야 하는가」를 잘못 가리킨다.
withCanary(
  "migration/figma-board-composition.json",
  (source) => {
    const ledger = JSON.parse(source);
    const id = Object.keys(ledger.nodes).find((key) => ledger.nodes[key].icon);
    const name = ledger.nodes[id].icon;
    ledger.nodes[id] = { ...ledger.nodes[id], icon: "icon/chevron-left" };
    ledger.bespokeByIcon["icon/chevron-left"] = ledger.bespokeByIcon[name];
    delete ledger.bespokeByIcon[name];
    return JSON.stringify(ledger, null, 2) + "\n";
  },
  "board composition icon name outside the readback dictionary",
  "scripts/check-figma-board-composition.mjs",
  "되읽기에 없는 아이콘을 대응으로 적었습니다",
);

// ⑬ **조인표에서 글리프가 사라졌다.** 생성기는 서명을 못 이으면 던지지만, 계획 파일 쪽
//    목록만 지워지면 열거기는 이름은 있는데 판정이 없는 자리를 만난다. 조용히 넘기면
//    아이콘 자리가 사유 없이 사라진다 — 던지는지 확인한다.
withCanary(
  "figma/app-screens.plan.json",
  (source) => {
    const plan = JSON.parse(source);
    /* **글리프 이름을 고정하지 않는다.** 예전에는 `chevron-left` 를 리터럴로 적었는데,
       보드가 움직여 그 글리프가 어느 보드에도 남지 않자(배너 화살표가 인스턴스가 되면서)
       조인표에서 그 항목을 지워도 열거기가 그것을 찾지 않았다 — 조인은 **쓰이는 이름**에만
       걸리므로 쓰이지 않는 항목을 지우는 것은 조용한 교환이고, canary 는 자기 대상을 잃은
       채 「checker 가 통과시켰습니다」로만 보였다. 위 인용·드리프트 canary 가 같은 사고를
       겪고 같은 처방을 적어 두었다: 재는 값을 canary 에 박지 말고 그때그때 읽어 온다.
       원장이 지금 실제로 세고 있는 글리프에서 고른다. */
    const ledger = JSON.parse(
      readFileSync(resolve(repoRoot, "migration/figma-board-composition.json"), "utf8"),
    );
    const used = new Set(
      Object.values(ledger.nodes ?? {}).map((node) => node.glyph).filter(Boolean),
    );
    const target = plan.productGlyphs.find((glyph) => used.has(glyph.id));
    if (!target) {
      errors.push(
        "board composition glyph join table canary가 보드에 실제로 쓰이는 글리프를 찾지 못했습니다. " +
          "원장에 아이콘 자리가 하나도 없다면 이 canary 는 잴 것이 없습니다.",
      );
      return source;
    }
    plan.productGlyphs = plan.productGlyphs.filter((glyph) => glyph.id !== target.id);
    return JSON.stringify(plan, null, 2) + "\n";
  },
  "board composition glyph join table lost an entry",
  "scripts/measure-figma-board-composition.mjs",
  "조인표에 없습니다",
  "--check",
);

// ── 커버리지 목표 래칫 카나리아 아홉 (2026-09-02) ────────────────────────
// `check-coverage-targets` 는 목표가 선언된 지표를 한 표에 모으고, **임자가 없던 넷**을
// 잠근다(needed · unclear · manifest done · 죽은 토큰). 그 넷은 여기서 카나리아를 심기 전까지
// 이 저장소에서 한 번도 잠긴 적이 없는 수라, 「게이트가 조용히 통과한다」가 기본값이었다.

// ① 세워야 할 표면이 줄었는데 잠그지 않았다. 어디로 갔는지(그렸다/미뤘다/범위 밖으로
//    옮겼다) 적지 않으면 그 자리는 조용히 되돌아온다.
withCanary(
  "migration/product.surfaces.json",
  (source) => {
    const ledger = JSON.parse(source);
    ledger.counts.needed -= 1;
    return JSON.stringify(ledger, null, 2) + "\n";
  },
  "coverage targets needed fell without locking",
  "scripts/check-coverage-targets.mjs",
  "세워야 할 표면이",
);

// ② **범위 밖 바구니가 총수와 무관하게 커졌다.** `needed` 를 줄이는 가장 쉬운 길이고,
//    이 그물이 없으면 아무것도 그리지 않고 「진척」을 만들 수 있다.
withCanary(
  "migration/product.surfaces.json",
  (source) => {
    const ledger = JSON.parse(source);
    ledger.counts.scoped += 1;
    ledger.counts.needed -= 1;
    return JSON.stringify(ledger, null, 2) + "\n";
  },
  "coverage targets needed reclassified as out of scope",
  "scripts/check-coverage-targets.mjs",
  "범위 밖(scoped)이",
);

// ③ 소유자만 줄일 수 있는 수가 줄었는데 잠그지 않았다.
withCanary(
  "migration/product.surfaces.json",
  (source) => {
    const ledger = JSON.parse(source);
    ledger.counts.unclear -= 1;
    return JSON.stringify(ledger, null, 2) + "\n";
  },
  "coverage targets unclear fell without locking",
  "scripts/check-coverage-targets.mjs",
  "판단 대기가",
);

// ④ **done → partial 강등.** `verify-figma-done` 은 done 인 항목만 검사하므로 강등하면
//    오히려 «조용해진다» — 이 게이트가 없으면 후퇴가 초록으로 보인다.
withCanary(
  "design/manifest.json",
  (source) => {
    const manifest = JSON.parse(source);
    manifest.components.find((item) => item.figma === "done").figma = "partial";
    return JSON.stringify(manifest, null, 2) + "\n";
  },
  "coverage targets figma done demoted to partial",
  "scripts/check-coverage-targets.mjs",
  "manifest 의 figma:done 이",
);

// ⑤ 아무도 쓰지 않는 토큰을 새로 만들었다. DS-D-0029 — 이름은 참이어야 한다.
withCanary(
  "packages/css/generated/tokens.css",
  (source) => source.replace(":root {\n", ":root {\n  --louis-canary-unused-token: 0px;\n"),
  "coverage targets dead token added",
  "scripts/check-coverage-targets.mjs",
  "죽은 토큰이 1개 늘었습니다",
);

// ⑥ 죽은 토큰이 줄었는데 잠그지 않았다. `--louis-color-stroke-strong` 은 앵커에서 LOUIS 도
//    제품도 `var()` 로 풀지 않는 이름이다 — 누군가 그것을 쓰기 시작하면 이 카나리아가
//    「예상 진단을 내지 않았습니다」로 시끄럽게 실패한다(조용히 통과하지 않는다).
//    **여기에 색 계단(`color-blue-350` 등)을 쓰면 안 된다.** DS-D-0047 이후 그 이름들은
//    `-rgb` 채널이 살아 있어 분모 밖이고, 살려도 수가 움직이지 않아 카나리아가 조용해진다.
withCanary(
  "migration/louis-token-usage.json",
  (source) => {
    const ledger = JSON.parse(source);
    ledger.productRefs = [...ledger.productRefs, "--louis-color-stroke-strong"].sort();
    return JSON.stringify(ledger, null, 2) + "\n";
  },
  "coverage targets dead token count fell without locking",
  "scripts/check-coverage-targets.mjs",
  "죽은 토큰이 1개 줄었습니다",
);

// ⑦ 제품이 LOUIS 에 없는 이름을 `var()` 로 문다. 브라우저에서는 조용히 빈 값이 된다.
withCanary(
  "migration/louis-token-usage.json",
  (source) => {
    const ledger = JSON.parse(source);
    ledger.productRefs = [...ledger.productRefs, "--louis-name-that-louis-does-not-have"].sort();
    return JSON.stringify(ledger, null, 2) + "\n";
  },
  "coverage targets dangling product token reference",
  "scripts/check-coverage-targets.mjs",
  "끊어진 참조",
);

// ⑧ 원장들이 서로 다른 제품 커밋을 잰다. 각 게이트는 자기 원장만 보므로 **전부 초록인 채**
//    한 표에 두 앵커의 수가 나란히 찍힐 수 있다.
withCanary(
  "migration/louis-token-usage.json",
  (source) => {
    const ledger = JSON.parse(source);
    ledger.productCommit = "0".repeat(40);
    return JSON.stringify(ledger, null, 2) + "\n";
  },
  "coverage targets ledgers on different anchors",
  "scripts/check-coverage-targets.mjs",
  "productCommit",
);

// ⑨ **빌려 쓰는 수의 임자가 verify:ci 에서 빠졌다.** 표는 그대로 인쇄되지만 그 수는 그때부터
//    아무에게도 잠기지 않는다 — 대시보드만 남고 게이트는 사라지는, 가장 조용한 실패다.
withCanary(
  "package.json",
  (source) => {
    const manifest = JSON.parse(source);
    manifest.scripts["verify:ci"] = manifest.scripts["verify:ci"]
      .replace(" && pnpm run check-figma-surface-coverage", "");
    return JSON.stringify(manifest, null, 2) + "\n";
  },
  "coverage targets owning gate dropped from verify:ci",
  "scripts/check-coverage-targets.mjs",
  "verify:ci 사슬에",
);

withCanary(
  "design/components/button.md",
  (source) => source.replace("status: experimental", "status: stable"),
  "frontmatter mismatch",
  "scripts/build-design-docs.mjs",
  "frontmatter status 불일치",
  "--check",
);

// DS-D-0035 의 `figma: done` 조건.
//
// **재료를 이름으로 박아 두지 않는다.** 여기에는 `alert` 이 박혀 있었고, 그 근거는 「alert 은
// 계약에 geometry 가 없어 조건 (c) 가 서지 않는 항목이라 승격 여부와 무관하게 항상 재료가
// 된다」였다. 그 근거가 2026-09-06 에 사라졌다 — alert 에 레이아웃 축을 열며 계약에 geometry 를
// 붙였고, 그 순간 이 canary 는 **입력을 바꾸지 못해** 실패했다(`canary가 입력을 변경하지
// 못했습니다`). 즉 **canary 의 재료가 고쳐지면 canary 자신이 깨진다.**
//
// 그래서 재료를 매 실행 고른다: manifest 에서 `figma !== "done"` 이면서 그 이름의 계약에
// `geometry:` 가 없는 첫 항목. 그런 항목이 하나도 없다면 조건 (c) 가 모든 항목에서 서 있다는
// 뜻이므로 그때는 이 canary 를 지우는 것이 맞고, 아래 throw 가 그 사실을 알린다.
withCanary(
  "design/manifest.json",
  (source) => {
    const manifest = JSON.parse(source);
    const parity = readFileSync(resolve(repoRoot, "scripts/verify-figma-parity.mjs"), "utf8");
    const withoutGeometry = (name) => {
      const at = parity.indexOf(`figmaName: "${name}"`);
      if (at < 0) return false;
      const next = parity.indexOf("\n  {", at);
      const entry = parity.slice(at, next < 0 ? parity.length : next);
      return !/^ {4}geometry:/m.test(entry);
    };
    const target = manifest.components.find(
      (item) =>
        item.figma !== "done" &&
        (item.figmaNames ?? (item.figmaName === undefined ? [] : [item.figmaName])).some(
          withoutGeometry,
        ),
    );
    if (target === undefined) {
      throw new Error(
        "figma done canary 의 재료가 없습니다 — geometry 가 없는 partial 항목이 하나도 " +
          "남지 않았습니다. 조건 (c) 가 전부 서 있다면 이 canary 를 지우십시오.",
      );
    }
    target.figma = "done";
    return JSON.stringify(manifest, null, 2) + "\n";
  },
  "figma done without two-way evidence",
  "scripts/verify-figma-done.mjs",
  "geometry 가 없습니다",
);

// **빈 목록으로 조용히 통과하는 경로**를 막는다. 계약 배열을 못 읽으면 검사할 것이 0개가 되어
// exit 0 이 되는데, 그것이 이 저장소가 가장 비싸게 배운 실패 방식이다.
withCanary(
  "scripts/verify-figma-parity.mjs",
  (source) =>
    source.replace(
      "const COMPONENT_CONTRACTS = [",
      "const COMPONENT_CONTRACTS_RENAMED = [",
    ),
  "figma done contract source missing",
  "scripts/verify-figma-done.mjs",
  "COMPONENT_CONTRACTS 를 읽지 못했습니다",
);

// **좁혀진 대조 범위.** geometry 가 붙어 있어도 계약이 size 키 일부만 고르면 나머지 칸은 Figma 가
// 무슨 값을 그리든 초록이다. Button 의 계약에 `sizeKeys` 를 심어 그 좁힘이 잡히는지 본다.
withCanary(
  "scripts/verify-figma-parity.mjs",
  (source) =>
    source.replace(
      '      measuredId: "button",',
      '      measuredId: "button",\n      sizeKeys: ["md"],',
    ),
  "figma done narrowed geometry coverage",
  "scripts/verify-figma-done.mjs",
  "계약의 대조 범위 밖입니다",
);

// ── 표면 커버리지 래칫 ────────────────────────────────────────────────────
// `verify-figma-parity` 는 계약 51 ↔ Figma 51 을 양방향으로 잠근 **닫힌 집합**이라 계약
// 밖의 제품 표면은 아무리 빠져 있어도 초록이다. 그 바깥을 세는 게이트가 실제로 빨개지는지
// 세 방향에서 확인한다 — 사유 없는 표면이 새로 생겼을 때 · Figma 에 없는 이름을 적었을 때 ·
// 사유가 낱말 하나일 때. 넷째 방향(사유를 붙이면 조용해진다)은 canary 로 쓸 수 없다.
// canary 는 실패만 단언하기 때문이다 — 그 방향은 결정 문서의 음성 시험 기록이 갖는다.
withCanary(
  "migration/product.surfaces.json",
  (source) => {
    const ledger = JSON.parse(source);
    ledger.surfaces["apps/web/components/scenes/CanaryScene.tsx#CanaryScene"] = {
      file: "apps/web/components/scenes/CanaryScene.tsx",
      binding: "named",
      louis: [],
      figma: null,
      reason: null,
    };
    // 열거기가 다시 뽑았을 때와 같은 상태로 만든다. counts 를 함께 옮기지 않으면
    // 요약 불일치가 먼저 잡혀 래칫 자체를 시험하지 못한다.
    ledger.counts.total += 1;
    ledger.counts.unclassified += 1;
    return JSON.stringify(ledger, null, 2) + "\n";
  },
  "figma surface coverage new unclassified surface",
  "scripts/check-figma-surface-coverage.mjs",
  "사유 없는 표면이",
);

withCanary(
  "migration/product.surfaces.json",
  (source) =>
    source.replace('"figma": "Button"', '"figma": "ButtonThatIsNotInFigma"'),
  "figma surface coverage unknown figma name",
  "scripts/check-figma-surface-coverage.mjs",
  "figma 이름이",
);

withCanary(
  "migration/product.surfaces.json",
  (source) => {
    const ledger = JSON.parse(source);
    const id = Object.keys(ledger.surfaces).find(
      (key) => ledger.surfaces[key].figma === null && ledger.surfaces[key].reason !== null,
    );
    ledger.surfaces[id].reason = "없음";
    return JSON.stringify(ledger, null, 2) + "\n";
  },
  "figma surface coverage one-word reason",
  "scripts/check-figma-surface-coverage.mjs",
  "자 이상의 사유가 필요합니다",
);

withCanary(
  "migration/product.surfaces.json",
  (source) => {
    const ledger = JSON.parse(source);
    ledger.counts.mapped += 1;
    return JSON.stringify(ledger, null, 2) + "\n";
  },
  "figma surface coverage self-reported counts",
  "scripts/check-figma-surface-coverage.mjs",
  "다시 센 값",
);

// ── verdict 축 카나리아 셋 (2026-09-01) ───────────────────────────────────
// 판정을 넷으로 가른 뒤에 새로 생긴 빠져나갈 구멍 셋을 막는다. 셋 다 「게이트가 조용히
// 통과한다」가 실패 모드다 — 빨개지는 것을 봐야 축이 실재한다.

// 어휘 밖의 낱말은 어느 버킷에도 안 들어가므로 아무 래칫에도 잡히지 않는다.
// counts.scoped 를 함께 내려서 요약 불일치가 먼저 잡히지 않게 한다 — 그래야 어휘 검사만
// 시험된다.
withCanary(
  "migration/product.surfaces.json",
  (source) => {
    const ledger = JSON.parse(source);
    const id = Object.keys(ledger.surfaces).find((key) => ledger.surfaces[key].verdict === "scoped");
    ledger.surfaces[id].verdict = "maybe";
    ledger.counts.scoped -= 1;
    return JSON.stringify(ledger, null, 2) + "\n";
  },
  "figma surface coverage verdict outside vocabulary",
  "scripts/check-figma-surface-coverage.mjs",
  "판정 어휘 밖입니다",
);

// 순서 없는 「필요」 목록은 400줄짜리 벽이라 무엇을 먼저 그릴지 답하지 못한다.
withCanary(
  "migration/product.surfaces.json",
  (source) => {
    const ledger = JSON.parse(source);
    const id = Object.keys(ledger.surfaces).find((key) => ledger.surfaces[key].verdict === "needed");
    ledger.surfaces[id].weight = null;
    return JSON.stringify(ledger, null, 2) + "\n";
  },
  "figma surface coverage needed without weight",
  "scripts/check-figma-surface-coverage.mjs",
  "weight 가 high/medium/low 중 하나로 필요합니다",
);

// 넷으로 가른 근거가 파일에서 사라지면 다음 사람은 needed 를 다시 scoped 에 섞는다 —
// 미등록이 사유로 둔갑하는 바로 그 자리로 되돌아간다.
withCanary(
  "migration/product.surfaces.json",
  (source) => {
    const ledger = JSON.parse(source);
    delete ledger.$verdictRule;
    return JSON.stringify(ledger, null, 2) + "\n";
  },
  "figma surface coverage missing verdict rule",
  "scripts/check-figma-surface-coverage.mjs",
  "판정 규칙($verdictRule)이 없습니다",
);

// ── 패턴 대응 카나리아 셋 (2026-09-01, DS-D-0039 · DS-D-0040) ─────────────
// 대응 어휘가 컴포넌트 51 에서 **컴포넌트 51 + 패턴 보드 9** 로 넓어졌고, 상태 축 규칙이
// 원장 안으로 들어왔다. 넓어진 문마다 빠져나갈 구멍이 하나씩 생긴다 — 셋을 막는다.

// 패턴 이름도 되읽기에 실재해야 한다. 컴포넌트 이름만 검증하고 패턴은 통과시키면
// 「패턴 보드에 있다」가 아무 문자열이나 적어도 되는 자리가 된다 — 원장이 낡는 바로 그 방식이다.
withCanary(
  "migration/product.surfaces.json",
  (source) =>
    source.replace('"figma": "app-shell"', '"figma": "app-shell-that-is-not-in-figma"'),
  "figma surface coverage unknown pattern name",
  "scripts/check-figma-surface-coverage.mjs",
  "figma 이름이",
);

// **합계는 그대로인데 후퇴한 경우.** 컴포넌트 대응 하나를 패턴 대응으로 바꾸면 `mapped` 는
// 18 에서 움직이지 않지만 집어다 쓸 인스턴스가 하나 사라진다. 합계 래칫만 있으면 조용하다.
withCanary(
  "migration/product.surfaces.json",
  (source) => source.replace('"figma": "Tooltip"', '"figma": "app-shell"'),
  "figma surface coverage component mapping swapped for pattern",
  "scripts/check-figma-surface-coverage.mjs",
  "컴포넌트 대응이",
);

// 상태 축 규칙이 파일에서 사라지면 「골격이 다르면 별 표면」의 시험이 사라진다 — 다음 사람은
// 합성 스켈레톤을 다시 부모의 Loading 축으로 접거나, 반대로 상태마다 컴포넌트를 세운다.
withCanary(
  "migration/product.surfaces.json",
  (source) => {
    const ledger = JSON.parse(source);
    delete ledger.$stateRule;
    return JSON.stringify(ledger, null, 2) + "\n";
  },
  "figma surface coverage missing state rule",
  "scripts/check-figma-surface-coverage.mjs",
  "상태 축 규칙($stateRule)이 없습니다",
);

withCanary(
  "design/components/button.md",
  (source) =>
    // manifest와 다른 값으로 바꾸기만 하면 된다. 현재 값이 무엇이든 done이 아니면 done으로,
    // done이면 not-ready로 뒤집는다.
    source.replace(
      /^\|\s*Web\s*\|\s*\x60([a-z-]+)\x60\s*\|/m,
      (_match, status) =>
        "| Web | " + tick + (status === "done" ? "not-ready" : "done") + tick + " |",
    ),
  "availability mismatch",
  "scripts/build-design-docs.mjs",
  "Availability Web 불일치",
  "--check",
);

withCanary(
  "design/patterns/loading.md",
  (source) => source.replace("## Acceptance tests", "## Verification examples"),
  "pattern docs completion",
  "scripts/build-design-docs.mjs",
  "docs=done 문서에 Acceptance tests 절이 없습니다",
  "--check",
);

withCanary(
  "design/content/README.md",
  (source) => source + "\nTemporary product path: apps/web/example.tsx\n",
  "product path isolation",
  "scripts/build-design-docs.mjs",
  "제품 저장소 전용 경로",
  "--check",
);

withCanary(
  "design/content/README.md",
  (source) => source + "\n[Temporary broken link](./gate-missing.md)\n",
  "broken normative link",
  "scripts/build-design-docs.mjs",
  "깨진 Markdown 링크",
  "--check",
);

withCanary(
  "design/manifest.json",
  (source) => {
    const manifest = JSON.parse(source);
    const content = manifest.documents.find(
      (document) => document.id === "content-overview",
    );
    content.section = "reference";
    return JSON.stringify(manifest, null, 2) + "\n";
  },
  "unsupported normative section",
  "scripts/build-llms-docs.mjs",
  "normative section을 AI 출력에 배정할 수 없습니다",
  "--check",
);

withCanary(
  "design/manifest.json",
  (source) => {
    const manifest = JSON.parse(source);
    const generated = manifest.documents.find(
      (document) => document.id === "llms-components",
    );
    generated.sources = generated.sources.filter(
      (path) => path !== "design/components/dialog.md",
    );
    return JSON.stringify(manifest, null, 2) + "\n";
  },
  "AI source omission",
  "scripts/build-llms-docs.mjs",
  "sources가 exhaustive 편입 순서와 다릅니다",
  "--check",
);

withCanary(
  "design/manifest.json",
  (source) => {
    const manifest = JSON.parse(source);
    manifest.documents.push({
      id: "llms-unexpected",
      path: "design/llms/unexpected.txt",
      title: "Unexpected generated document",
      section: "generated",
      authority: "generated",
      maturity: "experimental",
      generated: true,
      generator: "build-llms-docs",
      checker: "check-llms-docs",
      sourceCoverage: "exhaustive",
      sources: ["design/manifest.json"],
    });
    return JSON.stringify(manifest, null, 2) + "\n";
  },
  "unexpected generated entry",
  "scripts/build-llms-docs.mjs",
  "build-llms-docs가 소유하지 않는 generated entry",
  "--check",
);

withCreatedCanary(
  "design/foundations/gate-unregistered.md",
  [
    "---",
    "id: gate-unregistered",
    "status: experimental",
    "authority: normative",
    "---",
    "",
    "# Gate unregistered",
    "",
  ].join("\n"),
  "unregistered normative document",
  "scripts/build-design-docs.mjs",
  "design Markdown이 manifest에 등록되지 않았습니다",
  "--check",
);

withCanary(
  "design/llms/foundations.txt",
  (source) => source + "\ncanary drift\n",
  "generated drift",
  "scripts/build-llms-docs.mjs",
  "generated AI 문서가 최신이 아닙니다",
  "--check",
);

// 인용 좌표가 낡는 것은 조용하다 — 사실은 맞는데 줄만 밀린다. 이식번들에서 124건이 그랬다.
// 세 가지가 실제로 잡히는지 증명한다: 모호한 이름 · 파일 길이를 넘는 줄 · 락에 없는 파일.
withCanary(
  "design/patterns/app-shell.md",
  (source) => {
    /* **줄 번호를 고정하지 않는다.** 예전에는 `` `Gnb.tsx:2015` `` 를 리터럴로 적었는데,
       제품이 움직여 그 좌표를 재앵커링하는 순간(2026-08-30 재앵커링에서 2015 → 2077)
       canary 가 자기 대상을 잃고 **게이트 전체가 멈췄다.** 바로 아래 product-drift 표
       canary 가 같은 사고를 겪고 같은 처방을 적어 두었다 — canary 는 「손으로 고치면
       잡히는가」를 증명하는 장치지 좌표를 고정하는 장치가 아니다.
       이 문서에는 Gnb.tsx 인용이 여럿이므로 **첫 건**을 범위 밖으로 밀면 충분하다. */
    let hit = false;
    const next = source.replace(/`Gnb\.tsx:(\d+)`/, () => {
      hit = true;
      return "`Gnb.tsx:999999`";
    });
    if (!hit) {
      errors.push("citation line out of range canary가 Gnb.tsx 인용을 찾지 못했습니다.");
    }
    return next;
  },
  "citation line out of range",
  "scripts/verify-citations.mjs",
  "인용합니다",
);

withCanary(
  "migration/citation-aliases.json",
  (source) => source.replace(
    '"Gnb.tsx": "apps/web/components/navigation/Gnb.tsx"',
    '"Gnb.tsx": "apps/web/components/navigation/GnbGone.tsx"',
  ),
  "citation alias target missing",
  "scripts/verify-citations.mjs",
  "배포본",
);

withCanary(
  "migration/product-evidence.lock.json",
  (source) => source.replace(/\n\s*"apps\/web\/app\/tailwind\.css": "[0-9a-f]+",/, ""),
  "cited file not locked",
  "scripts/verify-citations.mjs",
  "evidence lock에 없습니다",
);

// 내비 라벨을 경로에서 유추해 네 곳이 틀렸다(2026-08-21 「보관함」 → 「홈」). 표를 생성물로
// 바꿨으니 손으로 고치면 잡혀야 한다.
withCanary(
  "design/components/app-shell-parts.md",
  (source) => {
    const next = source.replace(
      "| `/archive` | 홈 |",
      "| `/archive` | 보관함 |",
    );
    if (next === source) {
      errors.push("app-nav-labels 표 canary가 대상 행을 찾지 못했습니다.");
    }
    return next;
  },
  "generated app nav label table",
  "scripts/build-design-docs.mjs",
  "generated region이 최신이 아닙니다",
  "--check",
);

// 드리프트 분포표를 손으로 세다 두 번 틀렸다(2026-08-21 border-width·radius). 표를 생성물로
// 바꿨으니, **손으로 숫자를 고치면 반드시 잡혀야** 그 조치가 값을 한다. 그것을 여기서 증명한다.
withCanary(
  "design/governance/product-confirmations.md",
  (source) => {
    /* **단 수를 고정하지 않는다.** 예전에는 `8단` 을 리터럴로 적었는데, 드리프트를 다시 재면
       그 수가 움직여(2026-08-29 재측정에서 8 → 5) canary 가 자기 대상을 잃고 게이트 전체가
       멈췄다. canary 는 「손으로 고치면 잡히는가」를 증명하는 장치지 측정값을 고정하는 장치가
       아니다 — 행을 찾는 축은 지표 이름 하나로 충분하다. */
    const next = source.replace(
      /\| border-width \| (\d+)단 (\d+)회 \|/,
      (match, steps, uses) =>
        "| border-width | " + steps + "단 " + (Number(uses) - 1) + "회 |",
    );
    if (next === source) {
      errors.push("product-drift 표 canary가 대상 행을 찾지 못했습니다.");
    }
    return next;
  },
  "generated product drift table",
  "scripts/build-design-docs.mjs",
  "generated region이 최신이 아닙니다",
  "--check",
);

withDanglingSymlinkCanary(
  "design/llms/foundations.txt",
  "design/llms/gate-symlink-target.txt",
  "generated output symlink boundary",
  "scripts/build-llms-docs.mjs",
  "symbolic link일 수 없습니다",
);

withHardlinkCanary(
  "design/README.md",
  "design/gate-hardlink-target.txt",
  (source) =>
    source.replace(
      /\| Normative documents \| (\d+) \|/,
      (match, count) => "| Normative documents | " + (Number(count) - 1) + " |",
    ),
  "generated catalog hardlink boundary",
  "scripts/build-design-docs.mjs",
  "hard link일 수 없습니다",
);

withHardlinkCanary(
  "design/llms/foundations.txt",
  "design/llms/gate-hardlink-target.txt",
  (source) => source + "\nhardlink canary drift\n",
  "generated AI output hardlink boundary",
  "scripts/build-llms-docs.mjs",
  "hard link일 수 없습니다",
);

// **워크플로가 파싱 불가가 되면 잡혀야 한다.** 2026-08-22 에 주석을 고치다 `- name:` 줄을
// 같이 지웠고, GitHub 은 워크플로를 거부해 작업이 하나도 돌지 않았다(실패 로그도 없다).
// 단계 이름 한 줄을 지워 놓고 배분 게이트가 잡는지 본다.
withCanary(
  ".github/workflows/ci.yml",
  (source) => {
    const next = source.replace("      - name: Enable pnpm\n", "");
    if (next === source) {
      errors.push("workflow 구조 canary 가 대상 줄을 찾지 못했습니다.");
    }
    return next;
  },
  "CI workflow stays parseable",
  "scripts/verify-gate-split.mjs",
  "구조가 깨졌습니다",
);

// **제품 의존 게이트가 verify:ci 에 들어오면 잡혀야 한다.** 2026-08-22 에 정확히 그
// 상태였다 — 게이트 7개가 verify:ci 에 있으면서 러너에서 `SKIPPED` 를 찍고 exit 0 했다.
// 종료코드가 0 이라 아무도 못 봤고, 초록 CI 가 게이트 20개가 아니라 13개를 뜻했다.
// verify:ci 소속 스크립트에 제품 경로 표지를 심어 놓고 배분 게이트가 잡는지 본다.
withCanary(
  "scripts/verify-token-gates.mjs",
  // 표지를 이어 붙여 만든다. 한 줄로 쓰면 **이 파일 자신이** 표지를 갖게 되고,
  // 배분 게이트가 verify-gates 를 제품 의존으로 잡는다(실제로 그렇게 걸렸다).
  (source) => source + "\n// canary: 제품 저장소 /Users/sejunki/klipse" + "-web 를 아는 척한다.\n",
  "product-aware gate smuggled into verify:ci",
  "scripts/verify-gate-split.mjs",
  "제품 저장소를 압니다",
);

// verify-product-scenes를 이름만 선언하고 verify:product에서 빼면 실제 측정은 영원히 안 돈다.
// 제품 게이트의 소유 목록이 그 배선 누락을 잡는지 고정한다.
withCanary(
  "package.json",
  (source) => source.replace(" && pnpm run verify-product-scenes", ""),
  "product scene measurement remains wired",
  "scripts/verify-gate-split.mjs",
  "verify-product-scenes",
);

// development-only auth fixture도 CI에서는 돌지 않으므로 verify:product 배선이 유일한 실행 경로다.
withCanary(
  "package.json",
  (source) => source.replace(" && pnpm run verify-product-auth-fixture", ""),
  "development auth fixture measurement remains wired",
  "scripts/verify-gate-split.mjs",
  "verify-product-auth-fixture",
);

// 실측 fixture에서 생성한 Figma component plan/renderer도 제품 저장소가 있는 verify:product에서만
// 검증된다. 생성기 자체가 있어도 package 배선이 빠지면 바이트 드리프트가 영원히 통과하므로 고정한다.
withCanary(
  "package.json",
  (source) => source.replace(" && pnpm run check-figma-product-components", ""),
  "measured Figma product component generation remains wired",
  "scripts/verify-gate-split.mjs",
  "check-figma-product-components",
);

withCanary(
  "package.json",
  (source) => source.replace(" && pnpm run check-figma-product-app-shell", ""),
  "measured Figma product app-shell generation remains wired",
  "scripts/verify-gate-split.mjs",
  "check-figma-product-app-shell",
);

withCanary(
  "package.json",
  (source) => source.replace(" && pnpm run check-figma-product-payment-scenes", ""),
  "measured Figma product payment-scene composition remains wired",
  "scripts/verify-gate-split.mjs",
  "check-figma-product-payment-scenes",
);

withCanary(
  "package.json",
  (source) => source.replace(" && pnpm run check-figma-product-checkout-status", ""),
  "measured Figma product checkout-status generation remains wired",
  "scripts/verify-gate-split.mjs",
  "check-figma-product-checkout-status",
);

withCanary(
  "package.json",
  (source) => source.replace(" && pnpm run check-figma-product-upgrade-scene", ""),
  "measured Figma product upgrade-scene generation remains wired",
  "scripts/verify-gate-split.mjs",
  "check-figma-product-upgrade-scene",
);

withCanary(
  "package.json",
  (source) => source.replace(" && pnpm run check-figma-product-pricing-page", ""),
  "measured Figma product pricing-page generation remains wired",
  "scripts/verify-gate-split.mjs",
  "check-figma-product-pricing-page",
);

// variants는 liveOnly를 정적 하네스에서 제외한다. 새 liveOnly가 장면 측정기의 소유 목록에
// 등록되지 않은 채 추가되면 두 측정기 모두에서 사라지므로, 카탈로그 단계에서 실패해야 한다.
withCanary(
  "figma/product-specimens.json",
  (source) => {
    // **기존 liveOnly 표본을 본뜨지 않는다.** 그전에는 `scene/staticHighlightDemo` 를 복제했는데,
    // 그 표본이 은퇴하자(2026-08-30, 재던 랜딩 데모가 제품에서 삭제됨) 본뜰 것이 없어 카나리아가
    // 입력을 바꾸지 못했다 — **집합이 비면 검출력을 증명할 수 없는 카나리아**였다. 소유 목록에
    // 없는 id 를 새로 지어 넣으면 집합이 비어 있어도 커버리지가 반드시 어긋난다.
    const catalog = JSON.parse(source);
    catalog.specimens.push({
      id: "scene/unownedLiveOnlyCanary",
      kind: "scene",
      label: "unowned liveOnly canary",
      liveOnly: true,
    });
    return JSON.stringify(catalog, null, 2) + "\n";
  },
  "every liveOnly specimen has a scene measurer",
  "scripts/measure-product-" + "variants.mjs",
  "liveOnly 커버리지가 다릅니다",
  "--check",
);

// ── 레시피 ↔ 기록 카나리아 둘 (2026-09-07) ───────────────────────────────
// `verify-figma-parity` 는 Figma ↔ 기록만 본다 — 기록이 내부적으로 일관되기만 하면 레시피가
// 어긋나도 초록이다. 그 반대 방향을 `verify-recipe-record` 가 재는데, 그 게이트가 실제로
// 무는지는 여기서만 증명된다. 두 방향을 각각 연다: **수**가 갈리는 것과 **이름**이 갈리는 것.
//
// 대상은 `inline-size: 140px` 한 줄이다. **첫 일치 치환을 쓰지 않는다** — 기록 쪽에는
// `"height": 28,` 이 열 곳 넘게 있어 그 방향으로 오염하면 다른 컴포넌트를 건드리고 카나리아가
// 엉뚱한 사유로 초록이 된다. 레시피 파일에서 유일한 문자열을 고른다.
withCanary(
  "packages/css/src/component/inspector-row.css",
  (source) => {
    const next = source.replace("  inline-size: 140px;\n", "  inline-size: 141px;\n");
    if (next === source) {
      errors.push("recipe-record 기하 canary 가 레시피에서 대상 줄을 찾지 못했습니다.");
    }
    return next;
  },
  "recipe declaration matches the measured record",
  "scripts/verify-recipe-record.mjs",
  "레시피와 기록이 다릅니다",
);

// 면은 값이 아니라 **이름**이 계약인 자리다. 사다리 토큰을 같은 값의 팔레트 칸으로 바꾸면
// 다크에서는 픽셀이 똑같아 아무 게이트도 빨개지지 않고 라이트에서만 결정이 뒤집힌다.
withCanary(
  "packages/css/src/component/inspector-row.css",
  (source) => {
    const next = source.replace(
      "  background: var(--louis-color-bg-inset);\n",
      "  background: var(--louis-color-palette-gray-800);\n",
    );
    if (next === source) {
      errors.push("recipe-record 면 이름 canary 가 레시피에서 대상 줄을 찾지 못했습니다.");
    }
    return next;
  },
  "recipe surfaces stay on the semantic ladder",
  "scripts/verify-recipe-record.mjs",
  "이름**이 계약입니다",
);

// **배분 게이트 자신도 실패할 수 있어야 한다.** verify-gate-split 이 지키는 것 중 가장
// 되돌아가기 쉬운 것은 4번 — 워크플로가 다시 `pnpm verify` 를 부르는 것이다. 2026-08-19의
// 사고가 정확히 그 상태였다. 워크플로를 그 상태로 되돌려 놓고 게이트가 잡는지 본다.
// 이 카나리아는 제품 저장소를 타지 않으므로 CI 에서도 돈다.
withCanary(
  ".github/workflows/ci.yml",
  (source) => {
    const next = source.replace("run: pnpm verify:ci", "run: pnpm verify");
    if (next === source) {
      errors.push("verify-gate-split canary 가 워크플로에서 대상 줄을 찾지 못했습니다.");
    }
    return next;
  },
  "CI workflow runs the product-free gate split",
  "scripts/verify-gate-split.mjs",
  "아직 `pnpm verify` 를 돕니다",
);

runPass(
  "post-canary catalog check",
  "scripts/build-design-docs.mjs",
  "--check",
);
runPass("post-canary AI check", "scripts/build-llms-docs.mjs", "--check");

if (errors.length > 0) {
  for (const error of errors) console.error("[verify] " + error);
  process.exit(1);
}

// 건너뛴 카나리아는 **반드시** 이름으로 남긴다. 숫자만 줄어든 요약은 「전량 통과」로
// 읽히고, 그 오독이 게이트를 무력화한다.
if (skippedCanaries.length > 0) {
  console.log(
    "[verify] --no-product: 제품 저장소가 필요한 카나리아 " +
      skippedCanaries.length +
      "개를 건너뜁니다. 이 " +
      skippedCanaries.length +
      "개는 `pnpm verify:product` 에서만 증명됩니다:",
  );
  for (const label of skippedCanaries) console.log("[verify]   - " + label);
}

console.log(
  "[verify] passed: 4 positive checks, " +
    canaryCount +
    " failure canaries" +
    (skippedCanaries.length > 0
      ? " (+ 건너뛴 " + skippedCanaries.length + "개는 위에 열거)"
      : "") +
    ", byte-for-byte restoration",
);

// 진단 한 줄이 오염 «때문에» 달라졌는지 본다. 전체 출력 비교로는 부족하다 — 오염이 엉뚱한
// 다른 진단을 하나 더 내는 동안 기대하던 진단은 이미 빨갛던 사유에서 나올 수 있고, 그러면
// 출력은 달라지지만 canary 는 자기 오염을 잰 것이 아니다.
function diagnosticLines(output, expectedDiagnostic) {
  return output
    .split("\n")
    .filter((line) => line.includes(expectedDiagnostic))
    .join("\n");
}

function runClean(script, args) {
  const key = script + " " + args.join(" ");
  if (!cleanRuns.has(key)) {
    let output = "";
    try {
      execFileSync(process.execPath, [script, ...args], {
        cwd: repoRoot, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"],
      });
    } catch (error) {
      output = String(error.stdout ?? "") + String(error.stderr ?? "");
    }
    cleanRuns.set(key, output);
  }
  return cleanRuns.get(key);
}

function runPass(label, script, ...args) {
  try {
    execFileSync(process.execPath, [script, ...args], {
      cwd: repoRoot,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
    });
  } catch (error) {
    const output = String(error.stdout ?? "") + String(error.stderr ?? "");
    errors.push(label + "가 실패했습니다.\n" + output.trim());
  }
}

function withCanary(path, mutate, label, script, expectedDiagnostic, ...args) {
  if (skipProduct && PRODUCT_DEPENDENT_GATES.has(script)) {
    skippedCanaries.push(label + " (" + script + ")");
    return;
  }
  const absolute = resolve(repoRoot, path);
  const before = readFileSync(absolute, "utf8");
  const cleanOutput = runClean(script, args);
  const mutated = mutate(before);
  if (mutated === before) {
    errors.push(label + " canary가 입력을 변경하지 못했습니다: " + path);
    return;
  }

  writeFileSync(absolute, mutated);
  try {
    let failed = false;
    let output = "";
    try {
      execFileSync(process.execPath, [script, ...args], {
        cwd: repoRoot,
        encoding: "utf8",
        stdio: ["ignore", "pipe", "pipe"],
      });
    } catch (error) {
      failed = true;
      output = String(error.stdout ?? "") + String(error.stderr ?? "");
    }
    if (!failed) {
      errors.push(label + " canary를 checker가 통과시켰습니다.");
    } else if (!output.includes(expectedDiagnostic)) {
      errors.push(
        label +
          " canary가 예상 진단을 내지 않았습니다: " +
          expectedDiagnostic +
          "\n" +
          output.trim(),
      );
    } else if (diagnosticLines(output, expectedDiagnostic) === diagnosticLines(cleanOutput, expectedDiagnostic)) {
      errors.push(
        label + " canary의 진단이 오염과 무관합니다: 오염 «없이» 돌려도 checker 가 그 진단을 " +
          "글자 그대로 똑같이 냅니다. 이 canary 는 자기 오염이 아니라 이미 빨간 다른 사유를 " +
          "읽고 통과한 것입니다 — 대상을 잃었거나(원장이 움직였다) 그물에 여유가 생겼습니다.\n" +
          diagnosticLines(output, expectedDiagnostic).trim(),
      );
    } else {
      canaryCount += 1;
    }
  } finally {
    writeFileSync(absolute, before);
  }

  const restored = readFileSync(absolute, "utf8");
  if (restored !== before) {
    errors.push(label + " canary가 원본을 byte-for-byte 복원하지 못했습니다.");
  }
}

function withCreatedCanary(
  path,
  source,
  label,
  script,
  expectedDiagnostic,
  ...args
) {
  const absolute = resolve(repoRoot, path);
  if (existsSync(absolute)) {
    errors.push(label + " canary 경로가 이미 존재합니다: " + path);
    return;
  }
  writeFileSync(absolute, source);
  try {
    let failed = false;
    let output = "";
    try {
      execFileSync(process.execPath, [script, ...args], {
        cwd: repoRoot,
        encoding: "utf8",
        stdio: ["ignore", "pipe", "pipe"],
      });
    } catch (error) {
      failed = true;
      output = String(error.stdout ?? "") + String(error.stderr ?? "");
    }
    if (!failed) {
      errors.push(label + " canary를 checker가 통과시켰습니다.");
    } else if (!output.includes(expectedDiagnostic)) {
      errors.push(
        label +
          " canary가 예상 진단을 내지 않았습니다: " +
          expectedDiagnostic +
          "\n" +
          output.trim(),
      );
    } else {
      canaryCount += 1;
    }
  } finally {
    if (existsSync(absolute)) unlinkSync(absolute);
  }
  if (existsSync(absolute)) {
    errors.push(label + " canary 파일을 제거하지 못했습니다.");
  }
}

function withDanglingSymlinkCanary(
  path,
  targetPath,
  label,
  script,
  expectedDiagnostic,
  ...args
) {
  const absolute = resolve(repoRoot, path);
  const targetAbsolute = resolve(repoRoot, targetPath);
  const before = readFileSync(absolute, "utf8");
  if (pathEntryExists(targetAbsolute)) {
    errors.push(label + " canary target이 이미 존재합니다: " + targetPath);
    return;
  }

  unlinkSync(absolute);
  symlinkSync(targetAbsolute, absolute);
  try {
    let failed = false;
    let output = "";
    try {
      execFileSync(process.execPath, [script, ...args], {
        cwd: repoRoot,
        encoding: "utf8",
        stdio: ["ignore", "pipe", "pipe"],
      });
    } catch (error) {
      failed = true;
      output = String(error.stdout ?? "") + String(error.stderr ?? "");
    }
    if (!failed) {
      errors.push(label + " canary를 checker가 통과시켰습니다.");
    } else if (!output.includes(expectedDiagnostic)) {
      errors.push(
        label +
          " canary가 예상 진단을 내지 않았습니다: " +
          expectedDiagnostic +
          "\n" +
          output.trim(),
      );
    } else {
      canaryCount += 1;
    }
  } finally {
    if (pathEntryExists(absolute)) unlinkSync(absolute);
    if (pathEntryExists(targetAbsolute)) unlinkSync(targetAbsolute);
    writeFileSync(absolute, before);
  }

  const restored = readFileSync(absolute, "utf8");
  if (restored !== before || pathEntryExists(targetAbsolute)) {
    errors.push(label + " canary가 원본을 byte-for-byte 복원하지 못했습니다.");
  }
}

function pathEntryExists(path) {
  try {
    lstatSync(path);
    return true;
  } catch (error) {
    if (error && error.code === "ENOENT") return false;
    throw error;
  }
}

function withHardlinkCanary(
  path,
  targetPath,
  mutate,
  label,
  script,
  expectedDiagnostic,
  ...args
) {
  const absolute = resolve(repoRoot, path);
  const targetAbsolute = resolve(repoRoot, targetPath);
  const before = readFileSync(absolute, "utf8");
  const mutated = mutate(before);
  if (mutated === before) {
    errors.push(label + " canary가 입력을 변경하지 못했습니다: " + path);
    return;
  }
  if (pathEntryExists(targetAbsolute)) {
    errors.push(label + " canary target이 이미 존재합니다: " + targetPath);
    return;
  }

  writeFileSync(absolute, mutated);
  linkSync(absolute, targetAbsolute);
  try {
    let failed = false;
    let output = "";
    try {
      execFileSync(process.execPath, [script, ...args], {
        cwd: repoRoot,
        encoding: "utf8",
        stdio: ["ignore", "pipe", "pipe"],
      });
    } catch (error) {
      failed = true;
      output = String(error.stdout ?? "") + String(error.stderr ?? "");
    }
    if (!failed) {
      errors.push(label + " canary를 checker가 통과시켰습니다.");
    } else if (!output.includes(expectedDiagnostic)) {
      errors.push(
        label +
          " canary가 예상 진단을 내지 않았습니다: " +
          expectedDiagnostic +
          "\n" +
          output.trim(),
      );
    } else {
      canaryCount += 1;
    }
  } finally {
    if (pathEntryExists(targetAbsolute)) unlinkSync(targetAbsolute);
    writeFileSync(absolute, before);
  }

  const restored = readFileSync(absolute, "utf8");
  if (restored !== before || pathEntryExists(targetAbsolute)) {
    errors.push(label + " canary가 원본을 byte-for-byte 복원하지 못했습니다.");
  }
}

function validatePackageScaffolds() {
  // 선언된 public surface만 허용한다. 구현 전 가짜 exports도, 선언 없이 늘어난 exports도 막는다.
  // 서브패스는 추가가 minor이고 제거가 major이므로(DS-D-0006) 선언을 규범으로 둔다.
  const declaredPackageSurfaces = new Map([
    [
      "packages/tokens/package.json",
      {
        name: "@klipse-design/tokens",
        subpaths: [
          ".",
          "./css",
          "./json",
          "./figma",
          "./manifest",
          "./package.json",
        ],
        sideEffects: ["*.css"],
      },
    ],
    [
      "packages/css/package.json",
      {
        name: "@klipse-design/css",
        subpaths: [
          "./layers.css",
          "./tokens.css",
          "./reset.css",
          "./styles.css",
          "./styles.layer.css",
          // Tailwind 4 `@theme inline` 레이어 (DS-D-0013). 토큰만 발행하며 컴포넌트 CSS는
          // authored plain CSS로 남는다.
          "./theme.css",
          "./package.json",
        ],
        sideEffects: ["*.css"],
      },
    ],
    [
      "packages/react/package.json",
      {
        name: "@klipse-design/react",
        subpaths: [".", "./icons", "./icons/manifest.json", "./package.json"],
        sideEffects: false,
      },
    ],
    [
      "apps/docs/package.json",
      { name: "@klipse-design/docs", subpaths: [], sideEffects: null },
    ],
  ]);

  for (const [path, contract] of declaredPackageSurfaces) {
    let value;
    try {
      value = JSON.parse(readFileSync(resolve(repoRoot, path), "utf8"));
    } catch (error) {
      errors.push(path + "를 읽을 수 없습니다: " + error.message);
      continue;
    }
    if (value.name !== contract.name) {
      errors.push(path + " package name 불일치: " + String(value.name));
    }
    if (value.private !== true) {
      errors.push(path + "는 public release 전 private=true여야 합니다.");
    }
    const actualSubpaths = Object.hasOwn(value, "exports")
      ? Object.keys(value.exports).sort()
      : [];
    const declaredSubpaths = [...contract.subpaths].sort();
    if (JSON.stringify(actualSubpaths) !== JSON.stringify(declaredSubpaths)) {
      errors.push(
        path +
          "의 exports 서브패스가 선언과 다릅니다. 선언: [" +
          declaredSubpaths.join(", ") +
          "] 실제: [" +
          actualSubpaths.join(", ") +
          "]",
      );
    }
    const expectedSideEffects = contract.sideEffects;
    if (expectedSideEffects === null) {
      if (Object.hasOwn(value, "sideEffects")) {
        errors.push(path + "는 exports가 없으므로 sideEffects를 선언하지 않습니다.");
      }
    } else if (
      JSON.stringify(value.sideEffects) !== JSON.stringify(expectedSideEffects)
    ) {
      errors.push(
        path +
          ".sideEffects는 " +
          JSON.stringify(expectedSideEffects) +
          "여야 합니다. CSS 서브패스를 노출하면서 이 값을 비우면 프로덕션 빌드에서 조용히 제거됩니다.",
      );
    }
  }

  const tokenPackage = JSON.parse(
    readFileSync(resolve(repoRoot, "packages/tokens/package.json"), "utf8"),
  );
  const expectedTokenExports = {
    ".": {
      types: "./generated/index.d.ts",
      import: "./generated/index.js",
      default: "./generated/index.js",
    },
    "./css": "./generated/tokens.css",
    "./json": "./generated/tokens.json",
    "./figma": "./generated/figma.tokens.json",
    "./manifest": "./generated/manifest.json",
    "./package.json": "./package.json",
  };
  if (
    JSON.stringify(tokenPackage.exports) !==
    JSON.stringify(expectedTokenExports)
  ) {
    errors.push(
      "packages/tokens/package.json exports가 P2 public surface와 다릅니다.",
    );
  }
  if (JSON.stringify(tokenPackage.files) !== JSON.stringify(["generated"])) {
    errors.push(
      "packages/tokens/package.json files는 generated만 포함해야 합니다.",
    );
  }
}

// validatePackageScaffolds는 별도 프로세스가 아니라 이 프로세스에서 도므로 in-process canary를 쓴다.
function withScaffoldCanary(path, mutate, label, expectedDiagnostic) {
  const absolute = resolve(repoRoot, path);
  const before = readFileSync(absolute, "utf8");
  const mutated = mutate(before);
  if (mutated === before) {
    errors.push(label + " canary가 입력을 변경하지 못했습니다: " + path);
    return;
  }

  const baseline = errors.length;
  writeFileSync(absolute, mutated);
  try {
    validatePackageScaffolds();
  } finally {
    writeFileSync(absolute, before);
  }
  const produced = errors.splice(baseline);

  if (!produced.some((message) => message.includes(expectedDiagnostic))) {
    errors.push(
      label +
        " canary가 예상 진단을 내지 않았습니다: " +
        expectedDiagnostic +
        "\n" +
        produced.join("\n"),
    );
    return;
  }
  if (readFileSync(absolute, "utf8") !== before) {
    errors.push(label + " canary가 원본을 byte-for-byte 복원하지 못했습니다.");
    return;
  }
  canaryCount += 1;
}

function validateFenceProjection() {
  const decisionSource = readFileSync(
    resolve(repoRoot, "design/governance/decisions/README.md"),
    "utf8",
  );
  const template = /```md\n[\s\S]*?\n```/.exec(decisionSource)?.[0];
  const guidelines = readFileSync(
    resolve(repoRoot, "design/llms/guidelines.txt"),
    "utf8",
  );
  if (!template || !guidelines.includes(template)) {
    errors.push(
      "AI projection이 fenced Markdown template을 byte-identical하게 보존하지 않습니다.",
    );
  }
}
