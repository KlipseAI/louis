#!/usr/bin/env node
// **사다리 칸과 값이 같은데 팔레트 이름으로 적힌 자리를 센다.**
//
// 왜 있나: 2026-09-08~09 에 같은 형태를 넷 고쳤고 **게이트 열 개가 전부 초록이었다.**
// 계산 스타일이 유효하고 대비도 멀쩡했기 때문이다 — 잰 적이 없는 것은 아무도 못 잡는다.
// 판정 규칙과 그 넷의 목록은 `scripts/lib/palette-ladder.mjs` 머리말에 있다.
//
// ── 어느 레인인가 ─────────────────────────────────────────────────────────
// 이 게이트는 **제품 저장소를 읽는다.** `scripts/verify-gate-split.mjs` 5번이 verify:ci 단계에
// 제품 표지(`klipse-web` · `KLIPSE_PRODUCT_REPO`)가 있으면 실패시키므로, 여기는 `verify:product`
// 다. 러너에는 제품 저장소가 없어서 CI 에 두면 실패하거나 — 더 나쁘게 — 조용히 꺼진다.
//
// ── 왜 워킹트리가 아니라 앵커에서 읽는가 ─────────────────────────────────
// `scripts/lib/product-ref.mjs` 의 규칙을 따른다. 소유자가 제품 저장소에서 지금도 작업 중이라
// 워킹트리에서 읽으면 같은 명령이 어제와 다른 값을 낸다. 앵커가 낡았다는 사실은
// `verify-product-evidence` 가 이미 큰 소리로 말한다 — 이 게이트가 그것을 또 말할 필요는 없다.
// 후보 커밋으로 시험 측정하려면 `KLIPSE_PRODUCT_REF` 를 준다.
//
// ── 왜 **한 방향 · 파일 단위** 래칫인가 ──────────────────────────────────
// 0 을 요구하면 아무도 못 쓴다. 그렇다고 전체 합계 하나로 잠그면 A 파일에서 하나 고치고
// B 파일에 하나 넣는 것이 통과한다 — 제품 저장소의 `lint-baseline.json` 이 「per file 로
// 얼려서 하나를 고친 것이 다른 자리를 열어 주지 않게」 한 것과 같은 이유로, 여기도 **파일마다**
// 잠근다. 파일의 수는 자유롭게 내려갈 수 있고 절대 오를 수 없다. baseline 에 없는 파일은 0 이다.
//
// 내려간 것을 실패로 만들지 않는 이유: 이 게이트가 세는 대상은 이 저장소 밖에 있고, 앵커를
// 다시 박는 것은 별건의 작업이다. 내려간 수를 매번 실패로 만들면 앵커 갱신이 baseline 갱신을
// 강제하는 사슬이 되어, 다음 사람은 게이트를 끄는 쪽을 고른다. 대신 내려갔다는 사실과
// 「`--update-baseline` 로 잠가라」를 **출력에 크게 찍는다.**
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { notMeasured, unavailable } from "./lib/gate-exit.mjs";
import { resolveProductRef } from "./lib/product-ref.mjs";
import {
  countByFile,
  dedupe,
  partitionByExemption,
  ratchet,
  readExemptions,
  readLadder,
  readProductAliases,
  readTokenMaps,
  scanCss,
  scanScript,
} from "./lib/palette-ladder.mjs";

const TAG = "palette-ladder";
const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const productRoot = process.env.KLIPSE_PRODUCT_REPO ?? "/Users/sejunki/klipse-web";
const { ref, source: refSource } = resolveProductRef();
const updateBaseline = process.argv.includes("--update-baseline");

const LOUIS_TOKENS = "packages/css/generated/tokens.css";
const PRODUCT_GLOBALS = "apps/web/app/globals.css";
const BASELINE = "migration/palette-ladder-baseline.json";
const EXEMPTIONS = "migration/palette-ladder-exemptions.json";
// 제품이 LOUIS 를 무는 두 트리. `measure-louis-token-usage.mjs` 와 같은 범위다.
const TREES = ["apps/web", "packages"];

const read = (relative) => readFileSync(resolve(repoRoot, relative), "utf8");

if (!existsSync(resolve(productRoot, ".git"))) {
  unavailable(
    TAG,
    "제품 저장소가 없습니다: " + productRoot +
      "\n  이 게이트는 제품 소스를 읽습니다. verify:product 레인에서만 돕니다.",
  );
}

const git = (args) =>
  execFileSync("git", ["-C", productRoot, ...args], { encoding: "utf8", maxBuffer: 1 << 28 });

let commit;
try {
  commit = git(["rev-parse", ref + "^{commit}"]).trim();
} catch (error) {
  unavailable(
    TAG,
    "앵커 커밋을 제품 저장소에서 찾지 못했습니다: " + ref + "\n  " + String(error.message).trim(),
  );
}

// ── 1. 사다리 칸의 해결값 ────────────────────────────────────────────────
const louis = readTokenMaps(read(LOUIS_TOKENS));
const ladder = readLadder(louis);
if (ladder.light.size === 0 || ladder.dark.size === 0) {
  notMeasured(
    TAG,
    LOUIS_TOKENS + " 에서 `--louis-color-bg-*` 사다리 칸을 한 테마라도 읽지 못했습니다" +
      "(라이트 " + ladder.light.size + " · 다크 " + ladder.dark.size + "). " +
      "잴 기준이 없으면 위반은 언제나 0 입니다 — 그 0 은 통과가 아닙니다.",
  );
}

// ── 2. 제품 별칭 지도 ────────────────────────────────────────────────────
let globalsCss;
try {
  globalsCss = git(["show", commit + ":" + PRODUCT_GLOBALS]);
} catch (error) {
  unavailable(
    TAG,
    "앵커 " + commit.slice(0, 8) + " 에서 " + PRODUCT_GLOBALS + " 를 읽지 못했습니다.\n  " +
      String(error.message).trim(),
  );
}
const aliases = readProductAliases(globalsCss);
if (aliases.light.size === 0 || aliases.dark.size === 0) {
  notMeasured(
    TAG,
    PRODUCT_GLOBALS + " 에서 `--palette-gray-*` / `--gray-*` 정의를 한 테마라도 찾지 못했습니다" +
      "(라이트 " + aliases.light.size + " · 다크 " + aliases.dark.size + "). " +
      "별칭을 못 풀면 어떤 사용처도 사다리 칸과 같아 보이지 않습니다.",
  );
}
const context = { aliases, louis, ladder };

// ── 3. 제품 소스 전수 ────────────────────────────────────────────────────
const tracked = git(["ls-tree", "-r", "--name-only", commit, "--", ...TREES])
  .split("\n")
  .filter(Boolean);
const cssFiles = tracked.filter((f) => f.endsWith(".css"));
const scriptFiles = tracked.filter((f) => /\.(?:ts|tsx)$/.test(f));
if (cssFiles.length === 0 || scriptFiles.length === 0) {
  notMeasured(
    TAG,
    "앵커 " + commit.slice(0, 8) + " 의 " + TREES.join("·") + " 에서 잴 파일을 찾지 못했습니다" +
      "(css " + cssFiles.length + " · ts/tsx " + scriptFiles.length + "). " +
      "검색 범위가 낡았거나 트리 이름이 바뀌었습니다.",
  );
}

const findings = [];
for (const file of cssFiles) findings.push(...scanCss(file, git(["show", commit + ":" + file]), context));
for (const file of scriptFiles)
  findings.push(...scanScript(file, git(["show", commit + ":" + file]), context));

// 같은 **자리**가 두 번 세이지 않게 접되, 모양이 같을 뿐인 **다른 자리**는 접지 않는다.
// 판정은 `palette-ladder.mjs` 의 `dedupe` 가 갖는다 — 카나리아가 제품 없이 그 경로를
// 그대로 지나야 하기 때문이다(접힘 결함을 처음 놓친 이유가 그것이었다).
const unique = dedupe(findings);

// ── 4. 면제 ──────────────────────────────────────────────────────────────
// 규칙과 사유는 `scripts/lib/palette-ladder.mjs` 가 갖는다(그래야 카나리아가 제품 저장소
// 없이 이 판정을 그대로 시험할 수 있다).
const { problems, index: exemptionIndex } = readExemptions(JSON.parse(read(EXEMPTIONS)), EXEMPTIONS);
const { live, exempted, stale } = partitionByExemption(unique, exemptionIndex, EXEMPTIONS);
problems.push(...stale);

// ── 5. 파일 단위 한 방향 래칫 ────────────────────────────────────────────
const counts = countByFile(live);

if (updateBaseline) {
  const next = {
    $comment:
      "생성물. `node ./scripts/check-palette-ladder-collision.mjs --update-baseline` 이 만든다. " +
      "손으로 고치지 않는다. 파일마다 **사다리 칸과 값이 같은데 팔레트 이름으로 적힌 면**의 수다.",
    $rule:
      "한 방향이다. 파일의 수는 내려갈 수 있고 절대 오를 수 없으며, 여기 없는 파일은 0 이다. " +
      "새 위반을 받아들이려고 재생성하지 마라 — 수는 한쪽으로만 움직인다.",
    $whyPerFile:
      "합계 하나로 잠그면 A 에서 하나 고치고 B 에 하나 넣는 것이 통과한다. 제품 저장소의 " +
      "`lint-baseline.json` 이 per file 로 얼린 것과 같은 이유다.",
    measuredAt: { productCommit: commit, refSource },
    files: Object.fromEntries(Object.entries(counts).sort(([a], [b]) => a.localeCompare(b))),
  };
  writeFileSync(resolve(repoRoot, BASELINE), JSON.stringify(next, null, 2) + "\n");
  console.log(
    "[" + TAG + "] baseline 을 다시 적었습니다: 파일 " + Object.keys(counts).length +
      " · 위반 " + live.length + " (면제 " + exempted.length + ").",
  );
  process.exit(problems.length > 0 ? 1 : 0);
}

const baseline = JSON.parse(read(BASELINE)).files ?? {};
const { grew, shrank } = ratchet(counts, baseline);

for (const { file, was, now } of grew) {
  problems.push(
    // **어느 것이 새것인지는 말할 수 없다.** 정체가 「그 파일 안 같은 모양의 몇 번째」라
    // 줄을 옮기거나 순서를 바꾸면 번호가 따라 움직인다 — 「n 번이 새것」은 거짓말이 된다.
    // 그래서 이 파일의 자리를 전부 보이고, 늘어난 수만 정확히 말한다.
    file + " 의 팔레트 직행이 " + was + " → " + now + " 로 " + (now - was) +
      " 만큼 늘었습니다. 이 파일의 자리 " + now + " 곳입니다(어느 것이 새것인지는 " +
      "정체가 자리 번호라 가릴 수 없습니다 — 늘어난 " + (now - was) + " 을 찾으세요):\n" +
      live
        .filter((f) => f.file === file)
        .map(
          (f) =>
            "      " + f.file + ":" + f.line + " [" + f.theme + "] " + f.prop + " = " + f.token +
            " — 사다리 " + f.rungs.map((r) => "bg-" + r).join("/") + " 과 값이 같습니다\n" +
            "        " + f.evidence,
        )
        .join("\n"),
  );
}

const total = live.length;
const baselineTotal = Object.values(baseline).reduce((a, b) => a + b, 0);

if (problems.length > 0) {
  console.error("팔레트/사다리 충돌 게이트 실패:");
  for (const p of problems) console.error("  - " + p);
  console.error(
    "\n  고치는 법: 그 선언이 실제로 그 면을 뜻한다면 사다리 이름(`var(--louis-color-bg-*)` · " +
      "`bg-bg-*`)으로 바꾸세요. 고정색이 의도라면 " + EXEMPTIONS + " 에 **사유와 함께** 넣으세요.",
  );
  process.exit(1);
}

console.log(
  "[" + TAG + "] 앵커 " + commit.slice(0, 8) + "(" + refSource + ") · css " + cssFiles.length +
    " + ts/tsx " + scriptFiles.length + " 파일 · 사다리 " + ladder.light.size + "칸 대조: " +
    "팔레트 직행 " + total + "건(baseline " + baselineTotal + ") · 면제 " + exempted.length + "건.",
);
if (shrank.length > 0) {
  console.log(
    "  줄어든 파일 " + shrank.length + "개 — `--update-baseline` 로 잠그세요(잠그지 않으면 그 자리로 돌아올 수 있습니다):",
  );
  for (const { file, was, now } of shrank) console.log("    " + file + " " + was + " → " + now);
}
