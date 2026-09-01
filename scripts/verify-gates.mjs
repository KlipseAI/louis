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

withCanary(
  "design/components/button.md",
  (source) => source.replace("status: experimental", "status: stable"),
  "frontmatter mismatch",
  "scripts/build-design-docs.mjs",
  "frontmatter status 불일치",
  "--check",
);

// DS-D-0035 의 `figma: done` 조건. `alert` 은 계약에 geometry 가 없어 조건 (c) 가 서지 않는
// 항목이라, 승격 여부와 무관하게 항상 이 canary 의 재료가 된다.
withCanary(
  "design/manifest.json",
  (source) => {
    const manifest = JSON.parse(source);
    manifest.components.find((item) => item.id === "alert").figma = "done";
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
