#!/usr/bin/env node
// `verify` 를 `verify:ci` 와 `verify:product` 로 가른 것을 지키는 게이트.
//
// 왜 있나: 2026-08-19 부터 hosted CI 가 8회 연속 빨갰다. 원인은 `verify-citations.mjs:27`
// 의 `git -C <제품 저장소>` — 러너에는 제품 저장소가 없다. 로컬에서는 초록이라 8회를
// 지나도록 아무도 못 봤다. **로컬 초록과 CI 초록이 다른 것이 진짜 결함이었다.**
//
// 이 게이트는 배분의 배선과 **verify:ci 단계의 자립성**을 함께 지킨다.
//
// 자립성 판정을 한 번 뒤집었다. 2026-08-22 오전에 정적 표지 검사가 오탐 7건을 낸다고 보고
// 지웠는데, **그 7건이 오탐이 아니었다.** 그 스크립트들은 제품 저장소가 없으면 `SKIPPED` 를
// 찍고 `exit 0` 한다. 종료코드만 보던 실측이 「통과」로 셌을 뿐이다. 러너 로그로 확인했다 —
// 초록이던 CI 는 게이트 20개가 아니라 **13개**를 돌고 있었다.
//
// 조용한 exit 0 은 게이트가 죽는 가장 나쁜 방식이다. 빨간 것보다 나쁘다 — 아무도 안 본다.
import { execSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const read = (p) => readFileSync(resolve(repoRoot, p), "utf8");
const scripts = JSON.parse(read("package.json")).scripts;
const errors = [];

// verify-gates.mjs 가 스스로 선언한 「제품 필요 카나리아」 목록을 그대로 읽는다.
// 두 파일이 각자 목록을 갖게 두면 반드시 어긋난다.
const gatesSource = read("scripts/verify-gates.mjs");
const declared = gatesSource.match(
  /const PRODUCT_DEPENDENT_GATES = new Set\(\[([^\]]*)\]\)/,
);
if (!declared) {
  errors.push(
    "scripts/verify-gates.mjs 에서 PRODUCT_DEPENDENT_GATES 선언을 찾지 못했습니다. " +
      "이름을 바꿨다면 이 게이트도 같이 고쳐야 합니다.",
  );
}
// 아래 집합은 verify-gates 가 --no-product 로 건너뛰겠다고 선언한 목록이다.
// 이 게이트는 그것이 실제로 verify:product 안에서 다시 도는지를 5번에서 확인한다.
const skippableGates = new Set(
  (declared?.[1] ?? "").match(/"([^"]+)"/g)?.map((s) => s.slice(1, -1)) ?? [],
);

// ── 1. `verify` 는 두 갈래의 합이어야 한다 ────────────────────────────────
// 여기에 단계를 직접 붙이면 분류를 통째로 우회한다.
const EXPECTED_VERIFY = "pnpm run verify:ci && pnpm run verify:product";
if (scripts.verify !== EXPECTED_VERIFY) {
  errors.push(
    `verify 는 정확히 \`${EXPECTED_VERIFY}\` 여야 합니다. ` +
      `게이트를 늘리려면 verify:ci 나 verify:product 에 넣으세요. 현재: \`${scripts.verify}\``,
  );
}

// ── 2. 단계 이름을 잎까지 펼친다 ──────────────────────────────────────────
function leaves(name, seen = new Set()) {
  if (seen.has(name)) {
    errors.push(`스크립트 순환 참조: ${name}`);
    return [];
  }
  seen.add(name);
  const body = scripts[name];
  if (body === undefined) {
    errors.push(`package.json 에 없는 스크립트를 참조합니다: ${name}`);
    return [];
  }
  const refs = [...body.matchAll(/pnpm run ([\w:-]+)/g)].map((m) => m[1]);
  if (refs.length === 0) return [name];
  return refs.flatMap((r) => leaves(r, new Set(seen)));
}

const ciSteps = leaves("verify:ci");
const productSteps = leaves("verify:product");

// ── 3. 두 갈래는 겹치지 않는다 ────────────────────────────────────────────
// `verify-gates:ci`(--no-product) 와 `verify-gates`(전량) 는 **다른 단계로 센다.** 로컬
// `pnpm verify` 에서 verify-gates 가 두 번 도는 것은 알고 한 선택이다 — CI 경로와 전량
// 경로는 실제로 다른 코드 경로이고, 건너뛰기 로직 자체가 회귀할 수 있는 자리다.
const overlap = ciSteps.filter((s) => productSteps.includes(s));
if (overlap.length > 0) {
  errors.push(
    `verify:ci 와 verify:product 에 같은 단계가 들어 있습니다: ${overlap.join(", ")}. ` +
      "두 번 도는 것은 시간 낭비이고, 어느 쪽 분류가 맞는지도 흐려집니다.",
  );
}

// ── 4. CI 워크플로가 `verify` 가 아니라 `verify:ci` 를 돈다 ────────────────
// 분리해 놓고 워크플로가 옛 이름을 계속 부르면 아무것도 달라지지 않는다.
const workflow = read(".github/workflows/ci.yml");
if (/run:\s*pnpm verify\s*$/m.test(workflow)) {
  errors.push(
    ".github/workflows/ci.yml 이 아직 `pnpm verify` 를 돕니다. " +
      "러너에는 제품 저장소가 없으므로 `pnpm verify:ci` 여야 합니다.",
  );
}
if (!workflow.includes("pnpm verify:ci")) {
  errors.push(".github/workflows/ci.yml 에서 `pnpm verify:ci` 단계를 찾지 못했습니다.");
}

// **워크플로가 파싱되는지도 본다.** 2026-08-22 에 이 단계의 주석을 고치다 `- name:` 줄을
// 같이 지웠다. `run:` 만 남아 목록 항목이 아니게 됐고, GitHub 은 워크플로를 통째로 거부해
// **작업이 하나도 돌지 않았다**(jobs total_count 0). 빨간 것보다 나쁘다 — 실패 로그조차
// 없어서 무엇이 문제인지 보이지 않는다. 그때 이 게이트는 통과했다. 「`pnpm verify:ci`
// 라는 글자가 있는가」만 봤기 때문이다.
//
// 전체 YAML 파서를 들이지 않고, 그 사고를 잡는 최소 구조 검사를 한다: 단계 하나에는
// `run:` 이나 `uses:` 가 하나씩이다. 고아가 생기면 개수가 어긋난다.
const stepNames = workflow.match(/^ {6}- name:/gm)?.length ?? 0;
const stepBodies = workflow.match(/^ {8}(run|uses):/gm)?.length ?? 0;
if (stepNames === 0) {
  errors.push(".github/workflows/ci.yml 에서 단계(`- name:`)를 하나도 찾지 못했습니다.");
} else if (stepBodies !== stepNames) {
  errors.push(
    `.github/workflows/ci.yml 의 구조가 깨졌습니다 — 단계 ${stepNames}개인데 ` +
      `\`run:\`/\`uses:\` 는 ${stepBodies}개입니다. \`- name:\` 없이 남은 \`run:\` 이 있으면 ` +
      "GitHub 은 워크플로를 통째로 거부하고 **작업이 하나도 돌지 않습니다**(실패 로그도 없습니다).",
  );
}

// ── 5. **verify:ci 단계는 제품 저장소를 알지 못한다** ──────────────────────
// 이 검사의 판정이 실제 동작과 정확히 일치함을 확인했다(2026-08-22): 표지를 가진
// 스크립트 7개가 곧 러너에서 `SKIPPED` 를 찍던 7개였고, 표지가 없는 13개가 곧 실제로
// 검증을 수행하던 13개였다. 오탐 0 · 미탐 0.
//
// 단계가 실행하는 스크립트 자신과, 그 스크립트가 문자열로 부르는 다른 게이트 스크립트까지
// 본다 — verify-gates 는 표지가 없지만 카나리아가 verify-citations 를 자식 프로세스로 부른다.
const PRODUCT_MARKERS = ["klipse-web", "KLIPSE_PRODUCT_REPO"];
const scriptFileOf = (step) =>
  scripts[step]?.match(/\.\/(scripts\/[\w.-]+\.mjs)/)?.[1] ?? null;

for (const step of ciSteps) {
  const file = scriptFileOf(step);
  if (!file) {
    errors.push(`${step} 이 어떤 스크립트를 도는지 읽지 못했습니다: \`${scripts[step]}\``);
    continue;
  }
  const skipsProduct = scripts[step].includes("--no-product");
  const reachable = new Set([file]);
  for (const m of read(file).matchAll(/"(scripts\/[\w.-]+\.mjs)"/g)) {
    // --no-product 로 건너뛴다고 선언했고 그 사실을 이름으로 찍는 것은 허용한다.
    if (skipsProduct && skippableGates.has(m[1])) continue;
    reachable.add(m[1]);
  }
  // 이 파일 자신은 검사 대상에서 뺀다 — 표지 문자열을 **검사어로** 들고 있기 때문이다.
  // verify-gates 의 카나리아가 이 파일을 부르므로 전이 스캔에도 걸린다.
  reachable.delete("scripts/verify-gate-split.mjs");
  for (const target of reachable) {
    const hit = PRODUCT_MARKERS.filter((marker) => read(target).includes(marker));
    if (hit.length === 0) continue;
    errors.push(
      `verify:ci 단계 \`${step}\` 이 제품 저장소를 압니다 — ${target} 에 ${hit.join("·")} 이(가) 있습니다. ` +
        "러너에는 제품 저장소가 없습니다. 이 게이트는 거기서 실패하거나, 더 나쁘게는 " +
        "`SKIPPED` 를 찍고 조용히 통과합니다. verify:product 로 옮기세요.",
    );
  }
}

// ── 5b. 실측 모드(`--empirical`) ──────────────────────────────────────────
// **종료코드만 보면 안 된다.** 이 모드는 원래 exit 0 을 「통과」로 셌고, 그래서 자기를
// 끄는 게이트 7개를 「자립한다」고 보고했다. 이제 출력에 SKIP 이 있으면 실패로 센다.
if (process.argv.includes("--empirical")) {
  const bogus = "/nonexistent-product-repo";
  const problems = [];
  for (const step of ciSteps) {
    if (step === "verify-gate-split") continue; // 자기 자신
    let out = "";
    try {
      out = execSync("pnpm run " + step, {
        cwd: repoRoot,
        env: { ...process.env, KLIPSE_PRODUCT_REPO: bogus },
        encoding: "utf8",
        stdio: "pipe",
      });
    } catch (error) {
      problems.push(`${step} — 제품 저장소 없이 실패했습니다(러너에서도 빨갛습니다)`);
      continue;
    }
    // `verify-gates:ci` 는 건너뛴 카나리아를 이름으로 찍으므로 그 문구는 제외한다.
    const skipped = out
      .split("\n")
      .filter((l) => /SKIP/i.test(l) && !l.includes("건너뜁니다") && !l.includes("- citation"));
    if (skipped.length > 0) {
      problems.push(
        `${step} — 제품 저장소가 없자 조용히 자기를 껐습니다(exit 0): ${skipped[0].trim().slice(0, 90)}`,
      );
    }
  }
  if (problems.length > 0) {
    errors.push(
      "verify:ci 안에 러너에서 실제로는 검증하지 않는 단계가 있습니다:\n      " +
        problems.join("\n      "),
    );
  } else {
    console.log(
      `실측: verify:ci ${ciSteps.length - 1}단계가 제품 저장소 없이 **실제로 검증을 수행**했다.`,
    );
  }
}

// ── 6. 제품이 필요한 게이트가 verify:product 에서 빠지지 않았다 ───────────
// 5번은 「CI 에 잘못 든 것」을 잡고, 6번은 「분류하다 통째로 흘린 것」을 잡는다.
const KNOWN_PRODUCT_STEPS = [
  "verify-gates",
  "verify-citations",
  "verify-product-alpha",
  "verify-alpha-consolidation",
  "verify-product-drift",
  "verify-app-nav-labels",
  // 2026-08-22 에 옮긴 7개. 원래 verify:ci 에 있었고 러너에서 `SKIPPED` 를 찍으며
  // exit 0 했다 — CI 초록이 게이트 20개가 아니라 13개를 뜻하고 있었다.
  "verify-product-evidence",
  "verify-product-render",
  "verify-product-components",
  "verify-product-variants",
  "verify-specimen-context",
  "check-figma-inventory",
  "verify-tailwind-interop",
];
// verify-gates 가 --no-product 로 건너뛰겠다고 선언한 카나리아는, 제품이 있는 곳에서
// 반드시 다시 돌아야 한다. 선언만 하고 verify:product 에 전체 verify-gates 가 없으면
// 그 카나리아들은 어디서도 안 도는 셈이 된다.
if (skippableGates.size === 0) {
  errors.push(
    "verify-gates.mjs 의 PRODUCT_DEPENDENT_GATES 가 비어 있습니다. " +
      "--no-product 가 아무것도 건너뛰지 않는다면 플래그와 이 게이트 둘 다 지워야 합니다.",
  );
}

const missing = KNOWN_PRODUCT_STEPS.filter((s) => !productSteps.includes(s));
if (missing.length > 0) {
  errors.push(
    `제품이 필요한 게이트가 verify:product 에서 빠졌습니다: ${missing.join(", ")}. ` +
      "CI 에서 안 돌기 때문에, 여기서 빠지면 아무 데서도 안 돕니다.",
  );
}

if (errors.length > 0) {
  console.error("verify 분리 게이트 실패:");
  for (const e of errors) console.error("  - " + e);
  process.exit(1);
}

console.log(
  `verify 분리 확인: CI ${ciSteps.length}단계(제품 저장소를 알지 못함) · 로컬 전용 ${productSteps.length}단계(제품 필요).`,
);
