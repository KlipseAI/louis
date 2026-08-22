#!/usr/bin/env node
// **CI 러너를 로컬에서 그대로 재현한다.**
//
// 왜 있나: 2026-08-19~08-22 사이 hosted CI 가 9회 연속 빨갰다. 원인은 두 개였고 **둘 다
// 로컬에는 있고 러너에는 없는 것**이었다.
//
//   1. 제품 저장소 `klipse-web` — `verify-citations.mjs` 가 `git -C` 로 연다.
//   2. `node_modules/.bin/esbuild` — `verify-consumer.mjs` 가 「vitest 가 이미 가져온
//      의존성」이라며 전이 bin 에 기댔다. pnpm 은 전이 의존성 bin 을 호이스트하지 않는다.
//      내 노트북에서만 통과한 건 8/18 설치 때 남은 **낡은 심볼릭 링크** 때문이었다
//      (`node_modules/esbuild` 패키지는 애초에 없었다).
//
// 2번이 특히 나쁘다. 게이트를 고치고 푸시할 때마다 **다음 결손이 한 개씩** 드러나서,
// 러너 한 바퀴(1~2분)를 결손 개수만큼 돌아야 한다. 환경 차이는 축이 여럿인데 축을
// 하나씩 짐작해 막는 방식으로는 끝이 안 난다.
//
// 그래서 짐작을 그만두고 **환경 자체를 재현한다.** 커밋된 상태만 clone 하고(추적 안 되는
// 파일은 러너에도 없다), `--frozen-lockfile` 로 새로 설치하고, 제품 저장소를 없는 경로로
// 못 박고, 워크플로의 단계 순서를 그대로 돌린다.
//
// **한계 — 이것도 완전하지 않다.** 여기는 darwin/arm64 이고 러너는 ubuntu/x64 다.
// 대소문자 구분 파일시스템, GNU/BSD 도구 차이, UTC/KST 시간대는 여전히 안 잡힌다.
// 그건 러너만이 증명한다. 이 도구는 「푸시하기 전에 잡을 수 있는 것」의 범위를 넓힐 뿐이다.
//
// 쓰는 법:
//   node scripts/verify-clean-room.mjs            # 커밋된 HEAD 를 재현
//   node scripts/verify-clean-room.mjs --with-test  # pnpm test(실브라우저)까지
//   node scripts/verify-clean-room.mjs --keep       # 실패한 clone 을 남긴다
import { execFileSync, execSync } from "node:child_process";
import { mkdtempSync, rmSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const withTest = process.argv.includes("--with-test");
const keep = process.argv.includes("--keep");

const dirty = execSync("git status --porcelain", { cwd: repoRoot, encoding: "utf8" }).trim();
if (dirty) {
  console.error("[clean-room] 커밋되지 않은 변경이 있습니다. 러너는 커밋된 것만 봅니다:");
  console.error(dirty.split("\n").map((l) => "  " + l).join("\n"));
  console.error("[clean-room] 먼저 커밋하세요. 이 도구는 HEAD 를 재현합니다.");
  process.exit(1);
}

const head = execSync("git rev-parse HEAD", { cwd: repoRoot, encoding: "utf8" }).trim();
const work = mkdtempSync(join(tmpdir(), "kds-clean-room-"));
const clone = join(work, "louis");
const noProduct = join(work, "no-product-repo");

console.log(`[clean-room] HEAD ${head.slice(0, 8)} → ${clone}`);
execFileSync("git", ["clone", "--quiet", "--no-hardlinks", repoRoot, clone], { stdio: "inherit" });
execFileSync("git", ["-C", clone, "checkout", "--quiet", head], { stdio: "inherit" });

// **제품 저장소를 없는 경로로 못 박는다.** 기본값은 `/Users/sejunki/klipse-web` 이라 이
// 노트북에서는 실재한다 — 못 박지 않으면 러너 조건이 재현되지 않는다.
const env = { ...process.env, KLIPSE_PRODUCT_REPO: noProduct, CI: "true" };

// .github/workflows/ci.yml 의 단계 순서 그대로다. 순서가 어긋나면 재현이 아니다.
const steps = [
  ["의존성 설치 (frozen)", "pnpm", ["install", "--frozen-lockfile"]],
  ...(withTest
    ? [["브라우저 바이너리", "pnpm", ["exec", "playwright", "install", "--with-deps", "chromium"]]]
    : []),
  ["생성물 빌드", "pnpm", ["build"]],
  ["생성물 drift", "pnpm", ["check"]],
  ["게이트 (제품 없이)", "pnpm", ["verify:ci"]],
  ["추적 여부", "node", ["scripts/build-design-docs.mjs", "--check", "--require-tracked"]],
  ...(withTest ? [["브라우저 회귀", "pnpm", ["test"]]] : []),
];

let failedAt = null;
for (const [label, bin, args] of steps) {
  process.stdout.write(`[clean-room] ${label} … `);
  try {
    execFileSync(bin, args, { cwd: clone, env, encoding: "utf8", maxBuffer: 64 * 1024 * 1024 });
    console.log("통과");
  } catch (error) {
    console.log("실패");
    const out = String(error.stdout ?? "") + String(error.stderr ?? "");
    console.error("\n[clean-room] ── " + label + " 출력 마지막 40줄 ──");
    console.error(out.split("\n").slice(-40).join("\n"));
    failedAt = label;
    break;
  }
}

if (failedAt) {
  console.error(`\n[clean-room] **${failedAt}** 에서 실패했습니다. 러너에서도 여기서 빨갛습니다.`);
  console.error(`[clean-room] clone 을 남겼습니다: ${clone}`);
  process.exit(1);
}

if (!keep) rmSync(work, { recursive: true, force: true });
console.log(
  `\n[clean-room] 통과: ${steps.length}단계. 제품 저장소 없음(${noProduct}) · 새 설치 · 커밋된 파일만.` +
    (withTest ? "" : "\n[clean-room] `pnpm test`(실브라우저)는 안 돌렸습니다 — --with-test 로 포함하세요."),
);
if (existsSync(work) && keep) console.log(`[clean-room] 남긴 clone: ${clone}`);
