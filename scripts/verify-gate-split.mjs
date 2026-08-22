#!/usr/bin/env node
// `verify` 를 `verify:ci` 와 `verify:product` 로 가른 것을 지키는 게이트.
//
// 왜 있나: 2026-08-19 부터 hosted CI 가 8회 연속 빨갰다. 원인은 `verify-citations.mjs:27`
// 의 `git -C <제품 저장소>` — 러너에는 제품 저장소가 없다. 로컬에서는 초록이라 8회를
// 지나도록 아무도 못 봤다. **로컬 초록과 CI 초록이 다른 것이 진짜 결함이었다.**
//
// 그래서 이 게이트는 **배분의 배선**을 지킨다 — verify 가 두 갈래의 합인지, 두 갈래가
// 겹치지 않는지, 워크플로가 옳은 쪽을 부르는지, 제품 게이트가 흘러 사라지지 않았는지.
// 「자립하는가」 자체는 여기서 정적으로 판정하지 않는다 — 4b 에 이유가 있다.
// 그 최종 증명은 제품 저장소가 아예 없는 러너에서 CI 가 초록인 것이다.
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

// ── 4b. 실측 모드(`--empirical`) ──────────────────────────────────────────
// **표지 문자열로는 자립 여부를 못 가린다.** 실제로 확인했다: verify-tailwind-interop
// 등 7개 스크립트는 `KLIPSE_PRODUCT_REPO` 를 선언만 하고 `--check` 경로에서는 커밋된
// 측정 JSON 만 읽는다. 반대로 verify-gates 는 표지가 하나도 없는데 카나리아가
// verify-citations 를 불러 제품을 탄다. grep 은 양쪽으로 다 틀린다.
//
// 그래서 판정은 **돌려보는 것**으로만 한다. 상시 증명은 hosted CI 자신이다 —
// 러너에 제품 저장소가 아예 없으니, 자립하지 않는 단계가 verify:ci 에 들어오면
// 그 푸시가 빨갛게 된다. 로컬에서 미리 보고 싶으면 이 모드를 쓴다.
if (process.argv.includes("--empirical")) {
  const bogus = "/nonexistent-product-repo";
  const dependent = [];
  for (const step of ciSteps) {
    const command = scripts[step];
    if (step === "verify-gate-split") continue; // 자기 자신
    try {
      execSync("pnpm run " + step, {
        cwd: repoRoot,
        env: { ...process.env, KLIPSE_PRODUCT_REPO: bogus },
        stdio: "pipe",
      });
    } catch {
      dependent.push(step + "  (" + command + ")");
    }
  }
  if (dependent.length > 0) {
    errors.push(
      "제품 저장소 없이 실패한 verify:ci 단계가 있습니다 — CI 에서도 빨갛게 됩니다:\n      " +
        dependent.join("\n      "),
    );
  } else {
    console.log(`실측: verify:ci ${ciSteps.length - 1}단계 모두 제품 저장소 없이 통과.`);
  }
}

// ── 5. 제품이 필요한 게이트가 verify:product 에서 빠지지 않았다 ───────────
// 4번은 「CI 에 잘못 든 것」을 잡고, 5번은 「분류하다 통째로 흘린 것」을 잡는다.
const KNOWN_PRODUCT_STEPS = [
  "verify-gates",
  "verify-citations",
  "verify-product-alpha",
  "verify-alpha-consolidation",
  "verify-product-drift",
  "verify-app-nav-labels",
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
  `verify 분리 확인: CI ${ciSteps.length}단계(제품 없이 돎) · 로컬 전용 ${productSteps.length}단계(제품 필요).`,
);
