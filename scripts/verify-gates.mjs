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
import {
  countByFile,
  dedupe,
  findingKey,
  partitionByExemption,
  ratchet,
  readExemptions,
  readLadder,
  readProductAliases,
  readTokenMaps,
  scanCss,
  scanScript,
} from "./lib/palette-ladder.mjs";

// **CI 에는 제품 저장소가 없다.** 카나리아 대부분은 이 저장소 안에서 끝나지만, 인용 좌표
// 카나리아 셋은 `verify-citations.mjs` 를 부르고 그 스크립트가 `git -C <제품 저장소>` 를 한다.
// 2026-08-18~08-22 사이 hosted CI 가 46회 연속 빨갰던 원인 중 하나가 이것이다 — 로컬은 제품 저장소가
// 있어 통과하고, 러너에서만 실패했다.
//
// `--no-product` 를 주면 그 셋만 건너뛴다. **건너뛴 것은 반드시 이름으로 찍는다** — 조용히
// 줄어든 카나리아 수는 「통과」로 읽히고, 그게 게이트를 가진 이유를 없앤다.
// 2026-09-15: sidebar-states 생성기가 더해졌다 — 찾기 구간 카나리아가 그 생성기를 부르고, 생성기는 근거 인용을
// `git -C <제품 저장소> show` 로 확인한다(`check-figma-product-sidebar-states` 가 verify:product 에 있는 이유와 같다).
const PRODUCT_DEPENDENT_GATES = new Set(["scripts/verify-citations.mjs", "scripts/build-figma-product-sidebar-states.mjs"]);
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

// ②′ **보드가 셸을 잃었는데 INSTANCE 합계는 그대로다(2026-09-13).** 2026-09-11 앵커 이동에서 실제로
// 일어난 모양 그대로다 — 상단 바 매처가 margin 을 가진 래퍼를 바로 착각해 다섯 보드가
// `Product/*App Top Bar` 를 잃었고, 잃은 바 안의 Avatar 가 따로 인스턴스로 세어져 합계가 84 로
// 남았다. ② 는 합계가 줄어 잡히지만 이 교환은 합계로는 영원히 안 보인다. 그래서 셸 하나를 면으로
// 되돌리면서 **같은 보드의 구조 노드 하나를 Avatar 인스턴스로 바꿔** 합계를 맞춘다.
withCanary(
  "migration/figma-board-composition.json",
  (source) => {
    const ledger = JSON.parse(source);
    const shell = Object.keys(ledger.nodes).find((key) =>
      ledger.nodes[key].verdict === "instance" && /App Top Bar$/.test(ledger.nodes[key].component ?? ""));
    const board = ledger.nodes[shell].board;
    const filler = Object.keys(ledger.nodes).find((key) =>
      key !== shell && ledger.nodes[key].board === board && ledger.nodes[key].verdict === "structural");
    ledger.nodes[shell] = {
      board,
      tag: ledger.nodes[shell].tag,
      rect: ledger.nodes[shell].rect,
      verdict: "structural",
      rule: "surface",
      reason: "카나리아 — 상단 바 인스턴스를 손으로 그린 면으로 되돌려 놓았다.",
    };
    ledger.nodes[filler] = {
      ...ledger.nodes[filler],
      verdict: "instance",
      rule: "instance",
      component: "Avatar",
      variant: "Size=md",
      reason: "카나리아 — 잃은 바 안의 부품이 따로 세어져 인스턴스 합계를 메운다.",
    };
    return JSON.stringify(ledger, null, 2) + "\n";
  },
  "board composition shell lost while instance total held",
  "scripts/check-figma-board-composition.mjs",
  "셸 인스턴스를 잃었습니다",
);

// ②″ **보드에 셸이 하나 더 붙었는데 합계는 그대로다(2026-09-13).** 같은 사고의 다른 절반이다 —
// highlight 모바일 여섯은 바 안의 Avatar 인스턴스가 있던 자리에 래퍼 기준으로 판정한 틀린
// `Width=Inset` 상단 바가 붙어 인스턴스 수가 변하지 않았다. ②′ 는 「잃음」만 시험하므로 이
// 「얻음」 쪽이 조용히 풀려도 모른다. **셸이 아닌 인스턴스 하나를 상단 바로 바꿔** 합계를 맞춘다.
//
// 대상 선택을 한 번 고쳤다(2026-09-13, 같은 날 뒤). 처음에는 「셸이 하나도 없는 보드의 Avatar」를
// 골랐는데, 앱 셸 세트가 highlight 모바일 조합을 얻어 **36 보드 모두 셸을 갖게 되자 대상이 0 이
// 됐다** — 그러면 `nodes["undefined"]` 에 판정 없는 줄이 생기고 checker 는 식별자 오류만 내 기대
// 진단을 잃는다. 「셸이 없는 보드」는 원장이 움직이면 사라지는 조건이라, 원장 어디에나 있는 모양으로
// 옮겼다: 셸이 **이미 있는** 보드라도 셸 목록이 하나 늘면 checker 는 「새로 얻었습니다」로 운다
// (다중집합 비교). Avatar 를 먼저 찾고(사고 그대로의 모양), 없으면 다른 비셸 인스턴스(Button)를 쓴다.
// 그래도 없으면 조용히 넘어가지 않고 이 canary 의 이름으로 실패한다.
withCanary(
  "migration/figma-board-composition.json",
  (source) => {
    const ledger = JSON.parse(source);
    const shellSet = /^Product\/(Gnb Desktop Shell|Desktop App Top Bar|Mobile App Top Bar)$/;
    const nonShell = (key) =>
      ledger.nodes[key].verdict === "instance" && !shellSet.test(ledger.nodes[key].component ?? "");
    const keys = Object.keys(ledger.nodes);
    const id = keys.find((key) => nonShell(key) && ledger.nodes[key].component === "Avatar")
      ?? keys.find(nonShell);
    if (!id) {
      errors.push(
        "board composition shell gained while instance total held canary 의 대상이 없습니다 — 원장에 " +
          "셸이 아닌 인스턴스가 0 입니다. 합계를 상쇄하며 셸을 얻는 모양을 만들 다른 재료를 고르세요.",
      );
      return source;
    }
    ledger.nodes[id] = {
      ...ledger.nodes[id],
      component: "Product/Mobile App Top Bar",
      variant: "Width=Inset, Breadcrumb=Trail, Back=True, Divider=On",
      reason: "카나리아 — 래퍼 기준으로 판정한 틀린 상단 바가 다른 인스턴스(Avatar 등) 자리에 붙었다.",
    };
    return JSON.stringify(ledger, null, 2) + "\n";
  },
  "board composition shell gained while instance total held",
  "scripts/check-figma-board-composition.mjs",
  "셸 인스턴스를 새로 얻었습니다",
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
//    **빼는 항목을 원장에서 고른다(2026-09-13).** 처음에는 `IconButton` 을 박아 두었는데, 앱 셸
//    세트가 조합을 얻어 highlight·subscription 상단 바 13개가 인스턴스가 되자 IconButton 자리
//    25개가 전부 바 안으로 가지치기되어 **원장에 IconButton 자리가 0** 이 됐다 — 항목을 빼도
//    판정할 자리가 없어 열거기는 초록이었고 canary 는 대상을 잃었다. 그래서 지금 원장에서
//    `primitive-site-excluded` 로 판정된 자리가 실제로 있는 컴포넌트를 골라 뺀다.
withCanary(
  "figma/app-screens.plan.json",
  (source) => {
    const plan = JSON.parse(source);
    const ledger = JSON.parse(readFileSync(resolve(repoRoot, "migration/figma-board-composition.json"), "utf8"));
    const excludedInUse = new Set(Object.values(ledger.nodes ?? {})
      .filter((node) => node.rule === "primitive-site-excluded")
      .map((node) => node.component));
    const target = plan.louisPrimitiveExclusions.find((entry) => excludedInUse.has(entry.component))?.component;
    if (!target) {
      errors.push(
        "board composition primitive site table lost a verdict canary 의 대상이 없습니다 — 원장에 " +
          "제외 목록으로 판정된 자리(`primitive-site-excluded`)가 0 입니다.",
      );
      return source;
    }
    plan.louisPrimitiveExclusions = plan.louisPrimitiveExclusions.filter(
      (entry) => entry.component !== target,
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
    // 대상이 없으면 `ledger.nodes[undefined]` 를 만들어 「식별자 모양이 아니다」로 죽는다 —
    // 증명하려던 것(근거 없는 아이콘 bespoke)과 다른 것이 잡힌다. 없으면 **세운다**:
    // bespoke 노드에 사전 «안»의 이름을 얹고 glyph 를 비운다(사전 밖 이름은 ⑫ 가 따로 잡는다).
    const ready = Object.keys(ledger.nodes).find(
      (key) => ledger.nodes[key].verdict === "bespoke" && ledger.nodes[key].icon,
    );
    const id = ready ?? Object.keys(ledger.nodes).find((key) => ledger.nodes[key].verdict === "bespoke");
    if (id === undefined) {
      throw new Error(
        "migration/figma-board-composition.json 에 bespoke 노드가 없어 이 canary 를 세울 수 없습니다.",
      );
    }
    // 검사는 `candidateClause === "b-vector"` 인 자리에서만 글리프 근거를 요구한다
    // (check-figma-board-composition.mjs:317). 합성 대상에 그 절도 함께 세운다.
    const node = {
      ...ledger.nodes[id],
      icon: ledger.nodes[id].icon ?? "icon/caret-down",
      candidateClause: "b-vector",
    };
    delete node.glyph;
    // **컴포넌트 이름은 걷는다.** 지금 bespoke 는 전부 컴포넌트 축이라, 거기에 아이콘 이름을
    // 얹으면 「한 자리가 두 사전을 댔다」가 먼저 잡혀 증명하려던 것(근거 없는 아이콘 bespoke)과
    // 다른 것이 걸린다. 아이콘 축 하나만 남긴 자리를 세운다.
    delete node.component;
    if (ledger.bespokeByComponent && ledger.nodes[id].component) {
      // 집계 키는 `컴포넌트/사이즈` 다(check-figma-board-composition.mjs:307).
      const key = ledger.nodes[id].component + "/" + String(ledger.nodes[id].size);
      const left = (ledger.bespokeByComponent[key] ?? 1) - 1;
      ledger.bespokeByComponent = { ...ledger.bespokeByComponent };
      if (left > 0) ledger.bespokeByComponent[key] = left;
      else delete ledger.bespokeByComponent[key];
    }
    ledger.nodes[id] = node;
    ledger.bespokeByIcon = { ...ledger.bespokeByIcon, [node.icon]: 1 };
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
    // **`bespoke` 노드에 얹는다.** 집계는 `verdict === "bespoke"` 인 노드만 세므로
    // (check-figma-board-composition.mjs:311) 다른 칸에 얹으면 다시 센 값이 `undefined` 가 되어
    // 이름 사전 검사가 아니라 집계 불일치로 죽는다 — 증명하려던 것과 다른 것이 잡힌다.
    // 기존 `icon` 을 «가진» 노드에 기대지도 않는다: 유일한 대상이던 `/subscription` 정렬 꺾쇠가
    // 제품 화면 개편으로 사라져 0 이 된 적이 있다. 이름은 어차피 합성이므로 얹어서 세운다.
    const withIcon = Object.keys(ledger.nodes).find((key) => ledger.nodes[key].icon);
    const id = withIcon ?? Object.keys(ledger.nodes).find((key) => ledger.nodes[key].verdict === "bespoke");
    if (id === undefined) {
      throw new Error(
        "migration/figma-board-composition.json 에 bespoke 노드가 없어 이 canary 를 세울 수 없습니다.",
      );
    }
    const name = ledger.nodes[id].icon;
    ledger.nodes[id] = { ...ledger.nodes[id], icon: "icon/chevron-left" };
    ledger.bespokeByIcon = { ...ledger.bespokeByIcon, "icon/chevron-left": 1 };
    if (name) delete ledger.bespokeByIcon[name];
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

// **다른 기록을 읽는 `from` 규칙이 없는 경로로 조용히 통과하지 않는다** (figma-screen-assembly.md 28번 Acceptance (d)).
// hug 슬롯의 높이는 담긴 컴포넌트 기록에서 읽는다 — 그 경로가 틀리면 기대값이 undefined 가 되는데, 그것이
// 「비교할 것 없음」으로 넘어가면 사본을 걷은 자리가 대조 밖으로 빠진다. AppTopBar 선행 슬롯의 경로를 기록에 없는
// size 키로 바꿔 「근거 값이 없습니다」가 그 자손 이름으로 나는지 본다. 이 게이트는 라이브 ProgressRing 낙후로 이미
// 빨갛지만 withCanary 가 진단 줄이 오염 때문에 생겼는지를 따로 본다.
withCanary(
  "scripts/verify-figma-parity.mjs",
  (source) =>
    source.replace(
      'Leading: { fields: { height: { from: ["icon-button", "md", "height"] } } },',
      'Leading: { fields: { height: { from: ["icon-button", "no-such-size", "height"] } } },',
    ),
  "figma parity from rule missing record path",
  "scripts/verify-figma-parity.mjs",
  "Leading.height의 근거 값이 없습니다",
);

// **채움 칸에 계산된 수가 다시 굳으면 문다(2026-09-15).** SidebarCta 의 펼친 폭은 레일 내용 폭을 채우는 계산값이라 기록에
// 수가 없고(`$width`), parity 는 그 size 에서 표본 폭을 대조하지 않는다(`fillIn`). 대조를 건너뛰는 규칙이므로, 기록이 사본을
// 되찾아도(옛 256 처럼) 조용히 넘어가면 사본이 다시 낡는다 — 그 칸에 수를 넣어 「채움 칸인데 수」가 나는지 본다.
withCanary(
  "figma/components.measured.json",
  (source) => {
    const measured = JSON.parse(source);
    measured.components["sidebar-cta"].sizes.false.width = 256;
    return JSON.stringify(measured, null, 2) + "\n";
  },
  "figma parity fill slot regained a number",
  "scripts/verify-figma-parity.mjs",
  "sidebar-cta.false.width 는 채움 칸인데 수",
);

// **채움 칸은 건너뛰지 않고 DS 토큰에서 계산한 폭과 맞댄다(2026-09-15).** 첫 판의 `fillIn` 은 그 size 의 Figma 표본을 출력
// 한 줄 없이 넘겨, 레일 폭 토큰이 움직여도 표본(`SidebarBrand` · `SidebarCta` 펼침, `SidebarNavRow`)을 옮길 자리를 아무
// 게이트도 말하지 않았다. 레일 폭 토큰을 40 줄이면 세 표본 모두에서 「DS 레일 내용 폭」 어긋남이 나야 한다 — 하나라도
// 조용하면 그 칸은 다시 건너뛰는 칸이다. 토큰 이름은 게이트가 레일 CSS 선언에서 읽는다(여기서는 변조 대상만 이름으로 댄다).
for (const sample of ["SidebarBrand false", "SidebarCta false", "SidebarNavRow navRow"]) {
  withCanary(
    "packages/tokens/generated/manifest.json",
    (source) => {
      const tokenManifest = JSON.parse(source);
      const token = tokenManifest.tokens.find((entry) => entry.id === "layout-app-shell-sidebar-width");
      token.resolvedValue.value -= 40;
      return JSON.stringify(tokenManifest, null, 2) + "\n";
    },
    "figma parity rail-content fill follows the sidebar width token (" + sample + ")",
    "scripts/verify-figma-parity.mjs",
    sample + ": width가 다릅니다 — DS 레일 내용 폭",
  );
}

// **template 규칙 칸(2026-09-15).** `figma/templates.measured.json` 의 본문 · 컨테이너 · 카드 폭은 레일 폭에서 산술로 나오는데
// 수로 적혀 있어, 제품이 레일을 280 → 240 으로 줄이자 기록과 Figma 가 같이 낡아 초록이었다. 규칙 칸에 수가 돌아오면 물어야 하고
// (사본이 다시 굳는다), 레일 폭 한 칸을 흔들면 두 template 을 건너 컨테이너 폭까지 기대값이 따라와야 한다.
withCanary(
  "figma/templates.measured.json",
  (source) => {
    const record = JSON.parse(source);
    record.templates["app-shell"].mainWidth.value = 1148;
    return JSON.stringify(record, null, 2) + "\n";
  },
  "figma parity template rule slot regained a number",
  "scripts/verify-figma-parity.mjs",
  "app-shell.mainWidth 는 규칙 칸",
);
withCanary(
  "figma/templates.measured.json",
  (source) => {
    const record = JSON.parse(source);
    record.templates["app-shell"].railWidth.value += 10;
    return JSON.stringify(record, null, 2) + "\n";
  },
  "figma parity template rule follows the rail width across templates",
  "scripts/verify-figma-parity.mjs",
  "project-grid.containerWidthWide: 제품 실측과 다릅니다",
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

// ── 종류 축 카나리아 셋 (2026-09-09) ─────────────────────────────────────
// `needed` 안에 `kind`(부품·화면·한자리·판단대기) 축을 열었다. 축을 하나 열면 빠져나갈
// 구멍이 하나씩 생긴다 — 셋을 막는다. 그중 둘째가 이 축의 «존재 이유»를 지키는 자리다.

// 어휘 밖의 낱말은 어느 칸에도 세어지지 않는다. neededKinds 를 함께 내려서 요약 불일치가
// 먼저 잡히지 않게 한다 — 그래야 어휘 검사만 시험된다.
withCanary(
  "migration/product.surfaces.json",
  (source) => {
    const ledger = JSON.parse(source);
    const id = Object.keys(ledger.surfaces).find(
      (key) => ledger.surfaces[key].verdict === "needed" && ledger.surfaces[key].kind === "screen",
    );
    ledger.surfaces[id].kind = "board";
    ledger.neededKinds.screen -= 1;
    return JSON.stringify(ledger, null, 2) + "\n";
  },
  "figma surface coverage kind outside vocabulary",
  "scripts/check-figma-surface-coverage.mjs",
  "종류 어휘 밖입니다",
);

// **분모를 옮기는 문.** `kind` 가 `scoped` 에도 붙을 수 있으면 「화면이라 범위 밖」이 한 줄로
// 가능해진다 — 일 하나 없이 대상 분모가 줄고 커버리지가 오른다. 이 저장소가 `needed` 축을
// 연 이유가 바로 그 둔갑을 막는 것이었고, 같은 둔갑이 종류 축에서 다시 열리는 자리다.
withCanary(
  "migration/product.surfaces.json",
  (source) => {
    const ledger = JSON.parse(source);
    const id = Object.keys(ledger.surfaces).find((key) => ledger.surfaces[key].verdict === "scoped");
    ledger.surfaces[id].kind = "screen";
    ledger.surfaces[id].kindReason = "화면이라 부품으로 세우지 않는다 — 이 줄이 통과하면 분모가 준다.";
    return JSON.stringify(ledger, null, 2) + "\n";
  },
  "figma surface coverage kind on non-needed verdict",
  "scripts/check-figma-surface-coverage.mjs",
  "kind 는 needed 판정에만 붙습니다",
);

// 분모를 옮기지 «않는» 근거가 파일에서 사라지면 다음 사람은 화면 59 를 분모에서 빼고
// 커버리지가 올랐다고 적는다. 그 상승은 발견이 아니라 후퇴다.
withCanary(
  "migration/product.surfaces.json",
  (source) => {
    const ledger = JSON.parse(source);
    delete ledger.$kindRule;
    return JSON.stringify(ledger, null, 2) + "\n";
  },
  "figma surface coverage missing kind rule",
  "scripts/check-figma-surface-coverage.mjs",
  "종류 규칙($kindRule)이 없습니다",
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

// 이름 없는 값도 게이트 안에 있는지 (2026-09-09). floating-shell 의 흐림 4 는 LOUIS 흐림
// 사다리(10 · 12 · 16)에 없어 토큰이 아니고, `backdrop-filter: blur(…)` 로는 게이트가 수로 풀지
// 못한다. 그래서 값을 지역 변수 `--louis-floating-shell-blur` 로 한 번 발행하고 그 **선언**을
// 기록과 대조하는데, 그것은 위 두 카나리아가 재는 것과 다른 형태다 — 앞의 둘은 실제 CSS
// property(`inline-size`)와 면 이름을 재고 이것은 커스텀 속성을 잰다.
//
// **셸이 아니라 트리거 쪽을 변조한다.** 이 선언은 파일에 **두 번** 나온다(트리거가 셸의 자손이
// 아니라 재료를 각자 적는다). 첫 일치로 치환하면 셸 규칙이 바뀌고, 그러면 카나리아는 빨개지긴
// 하지만 「의도한 그 규칙이 물렸다」를 증명하지 못한다. 규칙 머리를 앵커에 포함해 자리를 못박고,
// 진단문이 `pill-trigger` 를 부르는지까지 확인한다.
withCanary(
  "packages/css/src/component/floating-shell.css",
  (source) => {
    const target = ".louis-pill-trigger {\n  --louis-floating-shell-blur: 4px;";
    const next = source.replace(target, ".louis-pill-trigger {\n  --louis-floating-shell-blur: 6px;");
    if (next === source) {
      errors.push("recipe-record 흐림 canary 가 레시피에서 트리거의 흐림 선언을 찾지 못했습니다.");
    }
    return next;
  },
  "unnamed values stay bound to the record",
  "scripts/verify-recipe-record.mjs",
  "pill-trigger: 레시피와 기록이 다릅니다",
);

// ── 「레시피가 없다」가 판정인 자리 카나리아 둘 (2026-09-09, DS-D-0061) ──
// 위의 둘은 레시피가 **있는** 자리를 잰다. canvas-edge 는 반대쪽이다 — 쉬머의 페인트가
// 인스턴스 기하이고 주기가 SMIL 의 `dur` 이라 CSS 가 이 조형을 담지 못하고, 그래서 레시피를
// 세우지 않는 것이 결론이다. 그 판정은 두 길로 조용히 사라질 수 있다.
//
// ① 누가 상태를 「정리」하며 `not-planned` 를 `not-ready` 로 되돌린다. 그러면 다음 사람은
//    다시 「빠진 것」으로 읽고 같은 조사를 반복한다 — 이 회차가 없애려던 바로 그 낭비다.
// ② 사유만 지우고 `not-planned` 는 남긴다. 그러면 `not-planned` 는 상태가 아니라
//    **검사를 끄는 값**이 된다.
//
// 대상 문자열은 둘 다 파일에서 유일하다(`"web": "not-planned"` 는 manifest 에 한 건,
// `$noRecipe` 의 canvas-edge 항은 그 산문 머리로 유일하다). 첫 일치 치환이 다른 컴포넌트를
// 건드리는 사고를 피하려고 유일성을 치환 결과로 확인한다.
withCanary(
  "design/manifest.json",
  (source) => {
    const next = source.replace('"web": "not-planned"', '"web": "not-ready"');
    if (next === source) {
      errors.push("recipe-record 판정 canary 가 manifest 에서 not-planned 를 찾지 못했습니다.");
    }
    return next;
  },
  "recipe-less verdict stays not-planned",
  "scripts/verify-recipe-record.mjs",
  "레시피를 세우지 않기로 정한 자리는",
);

withCanary(
  "figma/components.measured.json",
  (source) => {
    // **지우지 않고 이름만 바꾼다.** 마지막 항이라 줄을 지우면 앞 항의 쉼표가 남아 JSON 이
    // 깨지고, 그러면 게이트는 「사유가 없다」가 아니라 「JSON 을 읽지 못했다」로 실패해
    // 카나리아가 엉뚱한 사유로 초록이 된다(실측으로 확인).
    const next = source.replace('"canvas-edge": "**정본은 CSS', '"canvas-edge-gone": "**정본은 CSS');
    if (next === source) {
      errors.push("recipe-record 사유 canary 가 기록에서 $noRecipe 의 canvas-edge 항을 찾지 못했습니다.");
    }
    return next;
  },
  "not-planned carries a written verdict",
  "scripts/verify-recipe-record.mjs",
  "사유 없는 `not-planned` 는 상태가 아니라",
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

// ── React client boundary 카나리아 (DS-D-0002 leaf `"use client"`) ─────────────
// 그 규칙은 2026-08-14 에 정해졌고 지키는 기계가 없는 동안 leaf 7개가 지시문 없이 들어왔다
// (Updates (129)). 판정 경로가 셋이라 카나리아도 경로마다 하나씩 둔다 — 하나만 두면 나머지
// 둘이 죽어도 초록이다. 대상은 **그 경로 하나로만 걸리는 모듈**을 골랐다.
//   (a) react-server 에 없는 API import — project-card 는 createContext 만 쓰고 핸들러가 없다
//   (b) JSX 인라인 함수 — button 은 클라이언트 전용 import 가 없고 onClick 화살표 하나뿐이다
//   (c) 이 모듈이 만든 함수를 props 로 — anchored/trigger 는 useCallback(서버 허용)만 쓴다
const dropUseClient = (label) => (source) => {
  const next = source.replace(/^"use client";\n\n?/, "");
  if (next === source) errors.push(label + " canary 가 대상 파일에서 \"use client\" 를 찾지 못했습니다.");
  return next;
};
withCanary(
  "packages/react/src/project-card/project-card.tsx",
  dropUseClient("client boundary (a)"),
  "client boundary: react-server 에 없는 API import",
  "scripts/check-react-client-boundary.mjs",
  "`createContext` import",
);
withCanary(
  "packages/react/src/button/button.tsx",
  dropUseClient("client boundary (b)"),
  "client boundary: JSX 인라인 함수",
  "scripts/check-react-client-boundary.mjs",
  "`onClick` 에 인라인 함수",
);
withCanary(
  "packages/react/src/anchored/trigger.tsx",
  dropUseClient("client boundary (c)"),
  "client boundary: 모듈이 만든 함수를 props 로",
  "scripts/check-react-client-boundary.mjs",
  "`onClick` 에 이 모듈의 함수 `handleClick`",
);
// 반대 방향 — 루트에 붙이면 서버 안전 export 까지 클라이언트 참조가 된다.
withCanary(
  "packages/react/src/index.ts",
  (source) => '"use client";\n\n' + source,
  "client boundary: 패키지 루트에 지시문",
  "scripts/check-react-client-boundary.mjs",
  "재export 만 하는 모듈(또는 패키지 루트)에",
);
// 빌드 도구가 지시문을 걷는 경우. check-react-dist 는 재빌드와 비교하므로 도구가 바뀌면 함께 초록이다.
withCanary(
  "packages/react/dist/project-card/project-card.js",
  dropUseClient("client boundary (dist)"),
  "client boundary: dist 가 지시문을 잃음",
  "scripts/check-react-client-boundary.mjs",
  "dist 의 \"use client\" 가 소스와 다릅니다",
);

// ── 계산된 크기를 숫자로 굳힌 리터럴 카나리아(2026-09-14) ───────────────────
// `check-derived-size-literals` 는 생성기 · Figma 라이브러리 · 렌더러 템플릿의 인용 없는 크기 리터럴을 센다.
// 두 방향을 다 물어야 래칫이다: (1) 굳힌 리터럴이 새로 생기면 울고, (2) 고친 뒤 기준선을 내리지 않으면 운다.
// 두 번째가 없으면 줄어든 여유만큼 다음 굳힘이 조용히 들어온다.
//
// (1) 은 **꼴마다 따로** 문다. 첫 판 게이트는 `rect.height !== 53` 한 꼴만 시험했고, 그래서 묶음 1 의 발단인
// `const headerHeight = 52` · `bodyWidth !== 1832` · `viewport: { height: 1003, y: 53 }` ·
// `fixed(leading, 68, 36)` 을 하나도 세지 못한다는 사실이 초록 뒤에 숨어 있었다. 오염 한 벌에 꼴 하나만 넣고,
// 기대 진단에 꼴 이름과 그 줄을 함께 적어 「다른 꼴이 대신 울었다」도 통과시키지 않는다. 마지막 하나는
// 렌더러 템플릿을 오염시켜 범위가 템플릿까지 닿는지를 문다. 라이브러리 오염 대상은 제품 저장소 표지가
// 없는 파일이다 — 생성기 파일을 따옴표로 적으면 verify-gate-split 이 그 파일을 이 게이트의 도달 범위로 읽는다.
for (const [label, line, diagnostic] of [
  ["멤버 비교", "if (probe.rect.height !== 53) throw new Error(\"canary\");", "[비교] if (probe.rect.height !== 53)"],
  ["부등호 비교", "if (probe.rect.height > 52) throw new Error(\"canary\");", "[비교] if (probe.rect.height > 52)"],
  ["크기 이름 식별자 비교", "if (bodyWidth !== 1832) throw new Error(\"canary\");", "[비교] if (bodyWidth !== 1832)"],
  ["리터럴 대입", "const headerHeight = 52;", "[대입] const headerHeight = 52;"],
  ["객체 리터럴", "const canaryLayout = { viewport: { height: 1003, y: 53 } };", "[객체] const canaryLayout"],
  ["Math.abs 허용치 비교", "if (Math.abs(probe.rect.height - 53) > 1) throw new Error(\"canary\");", "[abs] if (Math.abs(probe.rect.height - 53)"],
]) {
  withCanary(
    "scripts/lib/figma-glyph-identity.mjs",
    (source) => source + "\n" + line + "\n",
    "derived size literal: 새 굳힘 · " + label,
    "scripts/check-derived-size-literals.mjs",
    diagnostic,
  );
}
withCanary(
  "scripts/templates/figma-product-sidebar-states-renderer.js",
  (source) => source + "\nfixed(leading, 68, 36);\n",
  "derived size literal: 새 굳힘 · 렌더러 템플릿의 크기 호출",
  "scripts/check-derived-size-literals.mjs",
  "[크기 호출] fixed(leading, 68, 36);",
);
withCanary(
  "scripts/templates/figma-product-payment-scenes-renderer.js",
  (source) => source + "\nconst canaryDescription = `Measured 1628×1004 result main surface`;\n",
  "derived size literal: 새 굳힘 · 렌더러 설명문의 수치",
  "scripts/check-derived-size-literals.mjs",
  "[설명 수치] const canaryDescription",
);
withCanary(
  "scripts/check-derived-size-literals.mjs",
  (source) => source.replace(/(\n {2}"[^"\n]+\.mjs": )(\d+),/, (_, head, count) => head + (Number(count) + 1) + ","),
  "derived size literal: 내리지 않은 기준선",
  "scripts/check-derived-size-literals.mjs",
  "보다 줄었다",
);

// ── 본문 블록 치환 래칫 카나리아(2026-09-14) ───────────────────────────────
// 감사 시점에 결과 · 체크아웃 보드 14장의 본문이 인스턴스가 못 되고 날노드였는데 어떤 게이트도 말하지 않았다(치환 매처가
// 크기 손 사본을 1px 창으로 비교했고 실패는 `skipped` 에도 없었다). `check-figma-app-screens` 는 이제 본문 세트별 인스턴스
// 수를 양방향으로 잠근다. 매처의 구조 서명을 한 칸 틀리게 해 결제 결과 Failure 넷이 치환을 잃으면 그 래칫이 물어야 한다.
withCanary(
  "scripts/lib/figma-component-substitution.mjs",
  (source) => source.replace("structure: [1, 1, ...(variant.detail ? [2] : []), 1],", "structure: [1, 1, ...(variant.detail ? [1, 1] : []), 1],"),
  "content substitution: 본문 인스턴스를 잃은 매처",
  "scripts/build-figma-app-screens.mjs",
  "본문 세트 Product/Payment Result Content 의 인스턴스가",
  "--check",
);

// ── 사이드바 셸 매처 카나리아(2026-09-15) ──────────────────────────────────
// 데스크톱 사이드바 매처는 `rect.width === 280` 을 물다가 제품 `bc3e6fa3`(폭 선언 280 → 240)에 낡을 자리였다. 이제 폭 선언
// `var(--app-gnb-sidebar-width)` 를 문다. 그 판정이 보드 계획을 실제로 쥐고 있는지 — 선언 이름을 한 글자 틀리게 해 사이드바
// 열여덟이 인스턴스를 잃으면 생성물 대조가 물어야 한다(셸 수 잠금은 보드 구성 원장이 재측정된 뒤 `SHELL_INSTANCES_BY_BOARD` 가 한다).
withCanary(
  "scripts/lib/figma-component-substitution.mjs",
  (source) => source.replace('const SIDEBAR_WIDTH_DECLARATION = "var(--app-gnb-sidebar-width)";', 'const SIDEBAR_WIDTH_DECLARATION = "var(--app-gnb-sidebar-w)";'),
  "shell substitution: 사이드바 폭 선언을 놓친 매처",
  "scripts/build-figma-app-screens.mjs",
  "생성물이 다릅니다",
  "--check",
);

// ── 풀지 못한 HUG 부모 · FILL 자식 래칫 카나리아(2026-09-14) ─────────────────
// 보드 생성기의 크기 조합 풀이 첫 판은 측정이 내용과 다른 HUG 부모 · FILL 자식을 `continue` 로 조용히 넘겼다 — `/settings`
// 세그먼트 칸의 세로가 계획 · 게이트로는 초록인 채 라이브에서 트랙이 낮아지고 알약이 넘친다. 이제 그 자리를 계획에 싣고 부모 · 축마다
// 수를 잠근다. 생성기를 첫 판처럼 조용히 넘기게 되돌리면(자리를 싣지 않으면) 그 래칫이 물어야 한다.
withCanary(
  "scripts/build-figma-app-screens.mjs",
  (source) => source.replace("unresolvedFillInHug.push({", "void ({"),
  "sizing reconcile: 풀지 못한 HUG·FILL 을 조용히 넘기는 생성기",
  "scripts/build-figma-app-screens.mjs",
  "풀지 못한 HUG 부모 · FILL 자식이 기준과 다릅니다",
  "--check",
);

// ── 논리 크기 캐스케이드 카나리아(2026-09-15) ──────────────────────────────
// 측정기 선언 수집은 `block-size` · `inline-size` 를 짝 물리 칸으로 합쳐 캐스케이드한다(`/settings` 세그먼트 칸 · `/pricing` 컨트롤의
// `min-inline-size` 가 앞의 `min-width: 0px` 을 덮는 자리). 생성물 대조는 다음 재측정 전까지 이 축을 보지 못하므로 모듈이 읽힐 때 단위
// 확인을 돈다 — 합치기를 잃은 수집기(속성 이름 그대로 덮기)를 먹여 그 확인이 무는지 본다.
withCanary(
  "scripts/lib/declared-styles.mjs",
  (source) => source.replace("const slot = LOGICAL_SIZE_PROPERTIES[property.name] ?? property.name;", "const slot = property.name;"),
  "declared styles: 논리 크기를 물리 칸으로 합치지 않는 수집기",
  "scripts/lib/declared-styles.mjs",
  "논리 크기 캐스케이드 단위 확인 실패",
);

// ── grid 자동 배치 열 카나리아(2026-09-15) ──────────────────────────────────
// 판정기가 grid 자식의 트랙을 자식 순번으로 집으면 한 열 grid 의 둘째 · 셋째 자식이 트랙을 못 찾고 HUG 로 접힌다(`/subscription`
// 크레딧 이력 블록). 열 번호를 자동 배치로 푼 뒤 그 자리가 풀지 못한 HUG·FILL 래칫에서 빠졌다 — 순번으로 되돌리면 래칫이 무는지 본다.
withCanary(
  "scripts/lib/sizing-provenance.mjs",
  (source) => source.replace("return out ? null : cursor % trackCount;", "return out ? null : index;"),
  "sizing provenance: grid 열을 자식 순번으로 집는 판정기",
  "scripts/build-figma-app-screens.mjs",
  "풀지 못한 HUG 부모 · FILL 자식이 기준과 다릅니다",
  "--check",
);

// ── min()/clamp() 크기 한계 카나리아(2026-09-23) ─────────────────────────────
// computed 의 `maxWidth` 는 `min(1300px, 100%)` 처럼 퍼센트가 섞인 식을 풀지 않고 그대로 둔다. 판정기가 px 만 읽으면 그 상한이
// 사라져 `/mypage/upgrade` 데스크톱의 요금 카드 격자가 1300 대신 본문 1672 로 그려졌다 — 식을 px 로만 읽게 되돌리면 생성물 대조가 무는지 본다.
withCanary(
  "scripts/lib/sizing-provenance.mjs",
  (source) => source.replace('maxWidth: tighter("max", limitPx("max", computed.maxWidth), h.limit?.max),', 'maxWidth: tighter("max", px(computed.maxWidth), h.limit?.max),'),
  "sizing provenance: min()/clamp() max-width 를 px 로만 읽는 판정기",
  "scripts/build-figma-app-screens.mjs",
  "생성물이 다릅니다",
  "--check",
);

// ── auto 여백 가운데 정렬 카나리아(2026-09-23) ───────────────────────────────
// 렌더러는 형제가 있는 자식의 margin 을 버린다. `margin-inline: auto` 로 가운데 선 컨테이너(`/mypage/upgrade` · `/subscription`
// 데스크톱)는 그래서 본문 왼쪽에 붙었다 — 부모 교차축을 CENTER 로 옮기는 풀이를 지우면 생성물 대조가 무는지 본다.
withCanary(
  "scripts/build-figma-app-screens.mjs",
  (source) => source.replace('align: { ...node.layout.align, counterAxis: "CENTER" } };', 'align: { ...node.layout.align } };'),
  "figma app screens: auto 여백 가운데 정렬을 버리는 생성기",
  "scripts/build-figma-app-screens.mjs",
  "생성물이 다릅니다",
  "--check",
);

// ── sidebar-states 찾기 구간 카나리아(2026-09-15) ───────────────────────────
// sidebar-states 러너는 필요한 대상을 전부 찾은 뒤에만 쓴다. 옛 러너는 세트 칠을 쓰고 나서 라이브에 없는 id 를 찾다 던질
// 자리였다(부분 적용). 생성기가 템플릿의 「── 1. 찾기」 구간에 쓰기가 섞였는지 글자로 보는데, 그 확인이 실제로 무는지
// 찾기 구간 첫머리에 노드 속성 대입 한 줄을 넣어 본다.
withCanary(
  "scripts/templates/figma-product-sidebar-states-renderer.js",
  (source) => source.replace(/(\/\/ ── 1\. 찾기[^\n]*\n)/, "$1page.name = page.name;\n"),
  "sidebar-states: 찾기 구간에 쓰기가 섞인 렌더러",
  "scripts/build-figma-product-sidebar-states.mjs",
  "renderer writes before its find phase ends",
  "--check",
);
// 2026-09-21: 그 확인이 금지 목록(쓰기 꼴 정규식)이던 동안 목록에 없는 쓰기 메서드는 지나갔다 — 허용 목록으로 바꾼 뒤,
// 금지 목록이 몰랐던 꼴(`setPluginData`)을 찾기 구간에 넣어 그 이름으로 무는지 본다.
withCanary(
  "scripts/templates/figma-product-sidebar-states-renderer.js",
  (source) => source.replace(/(\/\/ ── 1\. 찾기[^\n]*\n)/, "$1page.setPluginData(\"canary\", \"1\");\n"),
  "sidebar-states: 찾기 구간에 금지 목록이 몰랐던 쓰기 메서드",
  "scripts/build-figma-product-sidebar-states.mjs",
  "허용 목록 밖 메서드 setPluginData()",
  "--check",
);
// 2026-09-22: S7 에서 러너가 상단 바 마스터에 측정 모드(Dark)를 명시해, 그 모드가 라이트 보드 `39:3` 안 인스턴스로 번졌다(글자
// #fafafa · 대비 1.69:1). 이제 측정 모드는 측정 섹션에만 걸고 마스터 · variant · 인스턴스는 놓인 자리의 모드를 따른다. 생성기가
// 템플릿 전체에서 `pin` 과 `setExplicitVariableModeForCollection` 을 보는데, 그 확인이 세 꼴(마스터에 다시 건 pin · 인스턴스에
// 직접 건 API · pin 별칭)에서 실제로 무는지 본다.
for (const [label, needle, injected, diagnostic] of [
  ["마스터에 다시 건 pin", "unpin(topBar);\n", "unpin(topBar);\npin(topBar);\n", "pin() 은 measuredSection 에만"],
  ["인스턴스에 직접 건 명시 모드", "unpin(barInstance);\n", "unpin(barInstance);\nbarInstance.setExplicitVariableModeForCollection(modeCollection, measuredMode.modeId);\n", "setExplicitVariableModeForCollection 직접 호출"],
  ["pin 별칭", "pin(measuredSection);\n", "pin(measuredSection);\nconst setModes = pin;\nsetModes(railSet);\n", "pin 을 호출 밖에서 참조"],
]) {
  withCanary(
    "scripts/templates/figma-product-sidebar-states-renderer.js",
    // 바늘이 템플릿에서 사라지면 replace 가 입력을 바꾸지 못하고, withCanary 가 그 사실을 오류로 찍는다.
    (source) => source.replace(needle, injected),
    "sidebar-states: 측정 섹션 밖의 명시 모드 · " + label,
    "scripts/build-figma-product-sidebar-states.mjs",
    diagnostic,
    "--check",
  );
}

// ── 색 파서 단위 확인 카나리아(2026-09-14) ─────────────────────────────────
// 제품 컴포넌트 러너 · 보드 생성기가 함께 쓰는 `parseCssColor` 는 모듈을 읽을 때 두 직렬화(`rgb()` · `color(srgb …)`)와 두 알파
// 표기(수 · 백분율)를 한 번씩 풀어 본다. fixture 에는 아직 백분율 알파가 없어 생성물 대조로는 이 축이 절대 울지 않는다 — 그래서
// 백분율을 잃은 파서(`/ 8%` 가 NaN 이 된다)를 먹여 그 확인이 실제로 무는지 본다.
withCanary(
  "scripts/lib/figma-live-variables.mjs",
  (source) => source.replace('raw.endsWith("%") ? Number(raw.slice(0, -1)) / 100 : Number(raw)', "Number(raw)"),
  "colour parser: 백분율 알파를 잃은 파서",
  "scripts/build-figma-app-screens.mjs",
  "parseCssColor 단위 확인",
  "--check",
);

// ── 팔레트/사다리 충돌 판정 카나리아 ──────────────────────────────────────
// **이 카나리아가 없으면 `check-palette-ladder-collision` 은 「초록이라 잘 도는 것 같다」로만
// 남는다.** 그 게이트는 2026-09-08~09 에 손으로 고친 넷을 잡으려고 세웠는데, 그 넷은 전부
// 다른 게이트 열 개를 통과했었다 — 「안 잡히는 것」이 이 영역의 기본값이다.
//
// 그래서 **그 넷의 되돌린 형태를 그대로 먹여 실제로 무는지** 본다. 판정기가 순수해서
// (`scripts/lib/palette-ladder.mjs`) 제품 저장소 없이 이 프로세스 안에서 돈다.
paletteLadderCanaries();

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

// 합성 입력으로 판정기를 시험한다. 값은 2026-09-09 시점의 실제 사다리와 같게 두되, 이 카나리아가
// LOUIS 토큰 파일을 읽지 않는 것은 의도다 — 사다리가 움직여도 **판정 로직**의 회귀는 그대로 잡혀야 한다.
function paletteLadderCanaries() {
  const louisCss = [
    ":root {",
    "  --louis-color-palette-gray-000: color(srgb 0.980392 0.980392 0.980392 / 1);",
    "  --louis-color-palette-gray-800: color(srgb 0.168627 0.184314 0.211765 / 1);",
    "  --louis-color-palette-gray-850: color(srgb 0.129412 0.145098 0.176471 / 1);",
    "  --louis-color-static-white: color(srgb 1 1 1 / 1);",
    "}",
    // 라이트는 `:root` 와 한 목록으로 선언된다 — 이 형태를 「라이트 전용」으로 읽으면
    // 프리미티브가 다크 지도에서 통째로 사라진다(themesFor 의 :root 규칙이 그것을 막는다).
    ':root, [data-theme="light"] {',
    "  --louis-color-bg-surface: color(srgb 0.980392 0.980392 0.980392 / 1);",
    "  --louis-color-bg-raised: color(srgb 1 1 1 / 1);",
    "}",
    '[data-theme="dark"] {',
    "  --louis-color-bg-surface: color(srgb 0.129412 0.145098 0.176471 / 1);",
    "  --louis-color-bg-raised: color(srgb 0.168627 0.184314 0.211765 / 1);",
    "}",
  ].join("\n");
  const globalsCss = [
    ":root {",
    "  --palette-gray-000: var(--louis-color-palette-gray-000);",
    "  --palette-gray-800: var(--louis-color-palette-gray-800);",
    "  --palette-gray-800-rgb: var(--louis-color-palette-gray-800);",
    "}",
  ].join("\n");
  const louis = readTokenMaps(louisCss);
  const context = { louis, ladder: readLadder(louis), aliases: readProductAliases(globalsCss) };

  const expect = (label, actual, wanted) => {
    if (actual === wanted) {
      canaryCount += 1;
      return;
    }
    errors.push(
      "palette-ladder canary 「" + label + "」 가 " + wanted + " 을(를) 기대했는데 " + actual + " 였습니다.",
    );
  };

  // (1) `.appMainCardChromeSurface` — 다크가 팔레트 직행이던 형태. 사다리 `bg-raised`(dark)와
  //     값이 같다. 되돌린 사본이 물리지 않으면 이 게이트는 존재 이유가 없다.
  expect(
    "reverted .appMainCardChromeSurface (dark)",
    scanCss(
      "canary.css",
      'html[data-theme="dark"] .appMainCardChromeSurface { background-color: var(--palette-gray-800); }',
      context,
    ).length,
    1,
  );

  // (2) `gnb-menuSidebarActiveIndicator` — `.tsx` 의 Tailwind 임의값이다. **CSS 파일만 보면
  //     오늘 고친 셋 중 둘을 통째로 놓친다.** 라이트 줄(pg-300)은 사다리에 그 톤의 칸이 없어
  //     위반이 아니다 — 팔레트를 무는 것 자체는 위반이 아니라는 규칙이 여기서 증명된다.
  const indicator = scanScript(
    "canary.tsx",
    [
      '"[html[data-theme=light]_&]:[background-color:var(--palette-gray-300)]",',
      '"[html[data-theme=dark]_&]:[background-color:var(--palette-gray-800)]",',
    ].join("\n"),
    context,
  );
  expect("reverted gnb-menuSidebarActiveIndicator (dark only)", indicator.length, 1);
  expect("indicator canary theme", indicator[0]?.theme ?? "(none)", "dark");

  // (3) **테마별 덮개 두 줄.** 같은 클래스 목록 안에 사다리 토큰 한 줄이 이미 있는데도 뒤에
  //     오는 두 줄이 그것을 이겼다 — 브라우저로 재기 전에는 「고쳤는데 값이 안 바뀐다」로만
  //     보이던 자리다. 같은 요소에 사다리 줄이 있다는 사실은 면제 사유가 아니다.
  const covers = scanScript(
    "canary.tsx",
    [
      '"[background:var(--louis-color-bg-surface)]",',
      '"[html[data-theme=light]_&]:[background:var(--palette-gray-000)]",',
      '"[html[data-theme=dark]_&]:[background:var(--palette-gray-800)]",',
    ].join("\n"),
    context,
  );
  expect("reverted gnb-mainChromeTopBarInPanel (both theme covers)", covers.length, 2);
  expect(
    "theme covers are one per theme",
    covers.map((f) => f.theme).sort().join(","),
    "dark,light",
  );

  // (4) **음성 대조.** 고친 형태는 물리지 않아야 한다. 이것이 없으면 「항상 무는 게이트」와
  //     구별되지 않는다.
  expect(
    "fixed form stays silent",
    scanScript("canary.tsx", '"[background:var(--louis-color-bg-surface)]",', context).length,
    0,
  );

  // (5) 알파 합성은 사다리 칸이 아니다 — 화면에 나오는 값이 아래 면과의 합성값이라
  //     「같은 값」이 성립하지 않는다. `/ 100%` 는 반대로 같은 색을 다르게 적은 것이다.
  expect(
    "alpha composite is not a rung",
    scanCss("canary.css", '[data-theme="dark"] .x { background: rgb(var(--palette-gray-800-rgb) / 24%); }', context)
      .length,
    0,
  );
  expect(
    "opaque rgb() channel form still bites",
    scanCss("canary.css", '[data-theme="dark"] .x { background: rgb(var(--palette-gray-800-rgb) / 100%); }', context)
      .length,
    1,
  );

  // (6) 면제: 사유가 있으면 통과시키고, **사유가 없으면 거부한다.**
  const one = scanCss(
    "canary.css",
    'html[data-theme="dark"] .x { background-color: var(--palette-gray-800); }',
    context,
  );
  const oneEvidence = one[0].evidence;
  const withWhy = readExemptions({
    exemptions: [
      {
        file: "canary.css",
        token: "--palette-gray-800",
        theme: "dark",
        evidence: oneEvidence,
        why: "카나리아 — 사유가 있는 면제는 받아들여야 한다",
      },
    ],
  });
  expect("exemption with a reason is accepted", withWhy.problems.length, 0);
  expect(
    "exemption with a reason removes the finding",
    partitionByExemption(one, withWhy.index).live.length,
    0,
  );
  const withoutWhy = readExemptions({
    exemptions: [
      { file: "canary.css", token: "--palette-gray-800", theme: "dark", evidence: oneEvidence },
    ],
  });
  expect("exemption without a reason is refused", withoutWhy.problems.length, 1);
  // 면제는 **그 자리의 모양**에 붙는다. `evidence` 없이 파일×토큰×테마로만 적으면 그 파일의
  // 같은 토큰 배경이 한꺼번에 열리고, 나중에 더해지는 같은 형태까지 조용히 통과한다.
  expect(
    "exemption without evidence is refused",
    readExemptions({
      exemptions: [
        {
          file: "canary.css",
          token: "--palette-gray-800",
          theme: "dark",
          why: "카나리아 — evidence 없는 면제는 파일 전체를 연다",
        },
      ],
    }).problems.length,
    1,
  );
  // 같은 파일·토큰·테마지만 **다른 모양**은 그 면제가 열지 않는다.
  expect(
    "an exemption does not open a different shape in the same file",
    partitionByExemption(
      scanCss(
        "canary.css",
        'html[data-theme="dark"] .y { background-color: var(--palette-gray-800); }',
        context,
      ),
      readExemptions({
        exemptions: [
          {
            file: "canary.css",
            token: "--palette-gray-800",
            theme: "dark",
            evidence: oneEvidence,
            why: "카나리아 — .x 한 자리에만 붙은 면제",
          },
        ],
      }).index,
    ).live.length,
    1,
  );
  // 아무 자리도 안 무는 면제는 남겨 두면 그 자리로 돌아오는 위반을 조용히 통과시킨다.
  // **새 index 로 잰다** — 위에서 이미 한 번 쓴 index 는 `used` 가 서 있어 절대 stale 이 아니다.
  expect(
    "stale exemption is refused",
    partitionByExemption(
      [],
      readExemptions({
        exemptions: [
          {
            file: "gone.css",
            token: "--palette-gray-800",
            theme: "dark",
            why: "카나리아 — 위반이 사라진 뒤 남은 면제",
          },
        ],
      }).index,
    ).stale.length,
    1,
  );

  // (7) 래칫은 **한 방향**이다. 늘면 실패하고, 줄면 실패하지 않는다(줄어든 것을 실패로
  //     만들면 앵커 갱신이 baseline 갱신을 강제하는 사슬이 되고, 다음 사람은 게이트를 끈다).
  //     그리고 **파일 단위**다 — A 에서 하나 고치고 B 에 하나 넣는 것은 통과하지 않는다.
  const moved = ratchet({ "a.tsx": 0, "b.tsx": 1 }, { "a.tsx": 1 });
  expect("per-file ratchet catches a moved violation", moved.grew.length, 1);
  expect("per-file ratchet reports the drop separately", moved.shrank.length, 1);
  expect(
    "counts fold by file",
    JSON.stringify(countByFile([{ file: "a.tsx" }, { file: "a.tsx" }, { file: "b.tsx" }])),
    JSON.stringify({ "a.tsx": 2, "b.tsx": 1 }),
  );
  // 줄 번호는 정체가 아니다 — 위가 한 줄 밀렸다고 새 위반이 되면 baseline 이 매일 깨진다.
  expect(
    "line number is not part of the identity",
    findingKey({ file: "a", theme: "dark", token: "t", prop: "background", evidence: "e", line: 1 }) ===
      findingKey({ file: "a", theme: "dark", token: "t", prop: "background", evidence: "e", line: 999 }),
    true,
  );

  // (8) **글자까지 같은 자리 둘이 하나로 접히지 않는다.** 처음 세운 게이트가 이 자리에서
  //     구멍이 났다 — 정체가 `file|theme|token|prop|evidence` 뿐이라 `.tsx` 의 클래스 문자열이
  //     같으면 새 위반이 기존 칸으로 접혀 파일의 수가 오르지 않았다. 그래서 사이드바
  //     인디케이터와 상단 띠의 다크 줄을 되돌려도 게이트가 초록이었다.
  //
  //     **`scan…` 을 직접 부르는 것으로는 이 결함이 안 잡힌다.** 접힘은 dedupe→countByFile→
  //     ratchet 경로에서 일어나므로 아래는 그 경로를 끝까지 지난다 — 앞선 카나리아 열다섯이
  //     전부 순수 `scan…` 호출이라 같은 사각지대를 공유했다.
  const twin =
    '"[html[data-theme=dark]_&]:[background:var(--palette-gray-800)]",\n' +
    '"[html[data-theme=dark]_&]:[background:var(--palette-gray-800)]",';
  const twinFindings = scanScript("twin.tsx", twin, context);
  expect("two identical class strings scan as two", twinFindings.length, 2);
  const twinUnique = dedupe(twinFindings);
  expect("dedupe keeps both — same shape, different places", twinUnique.length, 2);
  expect(
    "the file count rises for the second one",
    JSON.stringify(countByFile(twinUnique)),
    JSON.stringify({ "twin.tsx": 2 }),
  );
  //     그리고 그 오름이 실제로 래칫에 물린다.
  expect(
    "the ratchet catches the twin that used to fold away",
    ratchet(countByFile(twinUnique), { "twin.tsx": 1 }).grew.length,
    1,
  );
  //     한 자리가 두 번 세이지도 않는다 — 같은 줄을 두 번 넣어도 개수는 그 줄 수만큼이다.
  expect(
    "one place is still counted once per occurrence",
    dedupe(scanScript("solo.tsx", twin.split("\n")[0], context)).length,
    1,
  );
}
