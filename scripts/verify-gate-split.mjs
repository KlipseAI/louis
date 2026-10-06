#!/usr/bin/env node
// `verify` 를 `verify:ci` 와 `verify:product` 로 가른 것을 지키는 게이트.
//
// 왜 있나: 2026-08-18T04:12 부터 08-22T06:55 까지 hosted CI 가 **46회 연속** 빨갰다
// (`gh run list` 로 셌다. 처음에 「8회」로 적은 것은 최근 목록만 보고 센 값이라 틀렸다).
// 원인은 `verify-citations.mjs:27`
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
import { execSync, spawnSync } from "node:child_process";
import { mkdirSync, mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { EXIT_UNAVAILABLE } from "./lib/gate-exit.mjs";
import { LIVE_PRODUCT_SCENE_IDS } from "./lib/product-scene-contract.mjs";

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

// 제품 장면 게이트는 로컬 전용이지만, 직접 호출됐을 때 전제조건이 없으면 반드시 빨개야 한다.
// `SKIPPED`+exit 0으로 돌아가면 verify:product가 실제 측정을 하지 않고도 초록이 된다.
const unavailableScene = spawnSync(
  process.execPath,
  ["scripts/measure-product-" + "scenes.mjs", "--check"],
  {
    cwd: repoRoot,
    env: {
      ...process.env,
      KLIPSE_PRODUCT_REPO: "/nonexistent-product-scenes-repo",
      KLIPSE_PRODUCT_BUILD_ROOT: "/nonexistent-product-scenes-build",
    },
    encoding: "utf8",
  },
);
const unavailableSceneOutput =
  String(unavailableScene.stdout ?? "") + String(unavailableScene.stderr ?? "");
if (unavailableScene.status === 0) {
  errors.push("verify-product-scenes가 제품/빌드 없이 exit 0 했습니다. 로컬 게이트는 조용히 꺼질 수 없습니다.");
}
if (/SKIP/i.test(unavailableSceneOutput)) {
  errors.push("verify-product-scenes가 제품/빌드 없이 SKIP을 출력했습니다. 검증 불가는 실패여야 합니다.");
}
if (!unavailableSceneOutput.includes("제품 저장소가 없습니다")) {
  errors.push(
    "verify-product-scenes의 전제조건 실패 진단을 확인하지 못했습니다: " +
      unavailableSceneOutput.trim().slice(0, 240),
  );
}

// **「잴 것이 없다」가 「통과」와 다른 코드로 끝나는지 직접 확인한다.**
//
// 위 검사는 *환경이 없을 때*를 본다. 이건 그 반대 — 환경은 갖췄는데 표본이 0개일 때다.
// 2026-09-01 까지 그 경로는 전용 문구를 찍고 `exit 0` 했고, `&&` 사슬과 아래 단계 계수는
// 종료코드만 보므로 **표본 0개·route 0개를 재고 초록**이었다(원장 `scenes-gate-measures-nothing`).
//
// 제품 저장소가 없는 러너에서도 이 경로를 때리려고, `.git` 만 있는 **가짜 제품 저장소**를
// 만들어 준다. 표본 검사는 어떤 git 명령보다 앞에 있으므로 이것으로 충분하다 —
// 반대로 말하면, 누군가 그 순서를 뒤집으면 여기서 잡힌다.
const fakeProductRoot = mkdtempSync(resolve(tmpdir(), "gate-split-fake-product-"));
mkdirSync(resolve(fakeProductRoot, ".git"));
let emptySampleScene;
try {
  emptySampleScene = spawnSync(
    process.execPath,
    ["scripts/measure-product-" + "scenes.mjs", "--check"],
    {
      cwd: repoRoot,
      env: {
        ...process.env,
        KLIPSE_PRODUCT_REPO: fakeProductRoot,
        KLIPSE_PRODUCT_BUILD_ROOT: "/nonexistent-product-scenes-build",
      },
      encoding: "utf8",
    },
  );
} finally {
  rmSync(fakeProductRoot, { recursive: true, force: true });
}
const emptySampleOutput =
  String(emptySampleScene.stdout ?? "") + String(emptySampleScene.stderr ?? "");
// ── 2026-09-10: 측정기가 축을 갈랐고 이 카나리아도 따라간다 ──────────────
// 예전에는 「표본 0 → NOT_MEASURED(2)」였다. 지금은 표본 0 이 **장면 축만** 끄고 route 축은
// 그대로 돌므로, 이 환경(빌드 루트 없음)에서는 표본 수와 **무관하게** 빌드 산출물이 없어
// UNAVAILABLE(1) 로 끝나는 것이 맞다. 「재지 않은 것은 통과가 아니다」는 사라진 것이 아니라
// route 축으로 옮겨졌다 — 그 판정은 아래 두 번째 카나리아가 지킨다.
if (emptySampleScene.status === 0) {
  errors.push(
    "verify-product-scenes가 빌드 산출물 없이 exit 0 했습니다. 로컬 게이트는 조용히 꺼질 수 없습니다.",
  );
}
if (emptySampleScene.status !== EXIT_UNAVAILABLE) {
  errors.push(
    "verify-product-scenes가 빌드 루트 없이 UNAVAILABLE(" + EXIT_UNAVAILABLE +
      ")로 끝나지 않았습니다(status=" + emptySampleScene.status + "). " +
      "축을 가른 뒤 이 경로의 실패 사유는 「환경이 없다」여야 합니다: " +
      emptySampleOutput.trim().slice(0, 240),
  );
}

// **두 번째 카나리아 — 「잰 것이 0건」이 여전히 2 로 끝나는가.**
// 축을 가른 뒤 그 판정은 route 축이 갖는다. 소스에 그 분기가 실제로 있는지 확인한다 —
// 환경 없이 그 경로를 실행할 수는 없지만, 분기가 지워지면 조용히 초록이 되므로 존재는 잰다.
{
  const scenesSource = readFileSync(
    resolve(repoRoot, "scripts/measure-product-" + "scenes.mjs"),
    "utf8",
  );
  if (!/measuredRoutes === 0 && measuredGuest === 0/.test(scenesSource)) {
    errors.push(
      "measure-product-scenes 에서 route 축 0건 판정이 사라졌습니다. 축을 가르면서 " +
        "「재지 않은 것은 통과가 아니다」를 route 축으로 옮겼는데, 그 분기가 없으면 " +
        "route 0건이 조용히 exit 0 이 됩니다(원장 scenes-gate-measures-nothing 의 재발).",
    );
  }
  if (LIVE_PRODUCT_SCENE_IDS.length === 0 && !/SCENE_AXIS_SKIP/.test(scenesSource)) {
    errors.push(
      "liveOnly 표본이 0개인데 measure-product-scenes 에 장면 축 스킵 경로가 없습니다. " +
        "표본 0 이 다시 측정기 전체를 멈추게 하면 route 축이 함께 죽습니다.",
    );
  }
}
if (/SKIP/i.test(emptySampleOutput)) {
  errors.push("verify-product-scenes가 SKIP을 출력했습니다. 검증 불가는 실패여야 합니다.");
}

const unavailableAuthFixture = spawnSync(
  process.execPath,
  ["scripts/measure-product-auth-" + "fixture.mjs", "--check"],
  {
    cwd: repoRoot,
    env: {
      ...process.env,
      KLIPSE_PRODUCT_REPO: "/nonexistent-product-auth-fixture-repo",
      KLIPSE_PRODUCT_FIXTURE_ROOT: "/nonexistent-product-auth-fixture-root",
    },
    encoding: "utf8",
  },
);
const unavailableAuthFixtureOutput =
  String(unavailableAuthFixture.stdout ?? "") + String(unavailableAuthFixture.stderr ?? "");
if (unavailableAuthFixture.status === 0) {
  errors.push(
    "verify-product-auth-fixture가 제품/fixture 없이 exit 0 했습니다. 로컬 게이트는 조용히 꺼질 수 없습니다.",
  );
}
if (/SKIP/i.test(unavailableAuthFixtureOutput)) {
  errors.push(
    "verify-product-auth-fixture가 제품/fixture 없이 SKIP을 출력했습니다. 검증 불가는 실패여야 합니다.",
  );
}
if (!unavailableAuthFixtureOutput.includes("제품 저장소가 없습니다")) {
  errors.push(
    "verify-product-auth-fixture의 전제조건 실패 진단을 확인하지 못했습니다: " +
      unavailableAuthFixtureOutput.trim().slice(0, 240),
  );
}

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
  // 앵커 커밋의 제품 트리를 열거해 「표면」 목록을 뽑는 열거기. 이 저장소 밖을 읽으므로
  // 로컬 전용이다 — 그 목록을 **읽기만** 하는 래칫(check-figma-surface-coverage)은 반대로
  // verify:ci 에 있다.
  "verify-product-surfaces",
  // 완성된 제품 페이지에서만 성립하는 liveOnly 합성 장면 측정기.
  "verify-product-scenes",
  // 제품이 명시한 development-only auth bypass로 보호 route의 실패/빈 기본 상태를 재는 측정기.
  "verify-product-auth-fixture",
  // 보호 route 실측에서 Figma product-only component plan/renderer를 생성하는 드리프트 게이트.
  "check-figma-product-components",
  // 같은 fixture에서 모바일 앱 셸 상단 바의 측정 variant plan/renderer를 생성하는 드리프트 게이트.
  "check-figma-product-app-shell",
  // 측정된 Gnb/top bar/result component를 전체 결제 결과 scene으로 합성하는 생성 드리프트 게이트.
  "check-figma-product-payment-scenes",
  // 결제 승인 지연·실패 3경로의 desktop/mobile content와 전체 scene을 측정값으로 생성하는 게이트.
  "check-figma-product-checkout-status",
  // upgrade 4개 plan card와 canonical/checkout-redirect desktop scene을 측정값으로 생성하는 게이트.
  "check-figma-product-upgrade-scene",
  // 제품 앵커의 인라인 <svg> 글리프를 옮겨 Product/… 글리프 세트 plan/renderer 를 생성하는 드리프트 게이트(DS-D-0071).
  "check-figma-product-glyphs",
  // 사이드바 확장/접힘 두 상태를 제품 fixture에서 재는 측정기.
  "verify-product-sidebar-states",
  // 그 측정값에서 사이드바 상태별 Figma plan/renderer를 생성하는 드리프트 게이트.
  "check-figma-product-sidebar-states",
  // `/highlight` 5열 카드 그리드의 Auto Layout reconcile renderer를 생성하는 드리프트 게이트.
  "check-figma-product-highlight-hub",
  // 제품이 `var()` 로 푸는 LOUIS 토큰 이름을 앵커에서 열거하는 열거기. 죽은 토큰을 세는
  // 래칫(check-coverage-targets)은 반대로 verify:ci 에 있다 — 원장이 제품 쪽 절반만 나르고
  // LOUIS 쪽 절반은 CI 가 매번 다시 계산하기 때문이다.
  "verify-louis-token-usage",
  // 사다리 칸과 값이 같은데 팔레트 이름으로 적힌 면을 세는 래칫. 제품 소스 전수를 읽으므로
  // 로컬 전용이다 — 판정 자체는 `scripts/lib/palette-ladder.mjs` 가 순수하게 갖고 있어서
  // 카나리아는 제품 없이 verify-gates 안에서 돈다.
  "check-palette-ladder-collision",
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
