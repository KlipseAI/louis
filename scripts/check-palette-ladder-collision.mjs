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

// ── 소유자가 받아들인 상승 = 제품 쪽 정리 후보 ─────────────────────────────
// 래칫은 한 방향이다. 그런데 측정 앵커를 a4125565 → 작업 브랜치 통합 판 76b6cf15 로 옮기자
// (DS-D-0079) 아래 7 자리가 새로 잡혔다 — 이 저장소가 아니라 **제품 코드에서** 늘어난 것이다.
// 소유자 결정(2026-10-08): 기준선에 기록해 래칫을 그 수에서 다시 잠그고, 토큰으로 바꾸는 일은
// 제품 PR 몫으로 남긴다. 그래서 기준선 `files` 는 이 수를 담고, 생성기는 이 목록을
// `productCleanupCandidates` 로 함께 적어 「왜 올랐는가」가 기준선 파일에서 사라지지 않게 한다.
// 이 목록은 면제(`palette-ladder-exemptions.json`)가 아니다 — 고정색이 의도라는 판정이 없고,
// 사다리 이름으로 바꿔야 할 자리라는 판정이다. 제품에서 고쳐 수가 `was` 로 돌아오면 지운다.
// `line` 은 76b6cf15 기준이고 제품이 움직이면 낡는다 — 정체는 파일과 수다.
const PRODUCT_CLEANUP_CANDIDATES = {
  decidedAt: "2026-10-08",
  decidedBy: "owner",
  decision: "design/governance/decisions/DS-D-0079-measure-the-work-branch-integration.md",
  measuredAt: "76b6cf154ab2295d6c4a5c95c29927105a3715e4",
  previousAnchor: "a4125565e15367aee8212dafbdf758964261a201",
  why:
    "앵커 이동으로 드러난 제품 코드의 팔레트 리터럴. 사다리 칸과 값이 같으므로 사다리 이름" +
    "(`var(--louis-color-bg-*)` · `bg-bg-*`)으로 바꿀 후보다. 바꾸는 일은 제품 PR 몫이다.",
  entries: [
    {
      // 2026-10-16 앵커를 운영 main 97d4950e 로 옮기며(DS-D-0117) 새로 잡혔다. 소유자 지시로 근본 수정을 제품 PR 로 냈다 —
      // KlipseAI/klipse-web#379(추천 목록을 LOUIS 메뉴 정본 `.louis-popover` 로). 그 PR 이 배포되고 앵커가 따라가면 0 으로 돌아온다.
      file: "apps/web/app/admin/AdminEmailSuggestInput.tsx",
      was: 0,
      now: 1,
      sites: ["12 [light] bg-palette-gray-050 (SUGGEST_LIST) = bg-inset — klipse-web#379"],
    },
    {
      file: "apps/web/app/admin/ModelManagement.tsx",
      was: 0,
      now: 1,
      sites: ["80 [dark] bg-palette-gray-900 (LOGO_TILE) = bg-surface/bg-raised/bg-menu/bg-overlay"],
    },
    {
      file: "apps/web/components/navigation/Gnb.tsx",
      was: 9,
      now: 10,
      sites: [
        "1095 [light] background: --palette-gray-050 = bg-inset (2026-09-22 소유자 판정으로 pg-100 → pg-050 이 되며 사다리 칸과 겹쳤다)",
      ],
    },
    {
      file: "apps/web/components/scenes/create/node-canvas-v2/nodes/BgmNode.tsx",
      was: 0,
      now: 1,
      sites: ["185 [light] background: --palette-gray-025 (MODE_SEGMENT_TRACK_LIGHT) = bg-canvas/bg-menu"],
    },
    {
      file: "apps/web/components/scenes/create/node-canvas-v2/nodes/VideoModelMenu.tsx",
      was: 0,
      now: 1,
      sites: ["168 [light] hover:bg-palette-gray-025 (ROW_HOVER) = bg-canvas/bg-menu"],
    },
    {
      file: "apps/web/components/scenes/create/node-canvas-v2/nodes/VideoNode.tsx",
      was: 0,
      now: 2,
      sites: [
        "809 [light] background: rgb(--palette-gray-025-rgb / 100%) = bg-canvas/bg-menu",
        "850 [light] background: --palette-gray-025 (세그먼트 트랙) = bg-canvas/bg-menu",
      ],
    },
    {
      file: "apps/web/components/scenes/create/node-canvas-v2/nodes/YoutubeNode.tsx",
      was: 0,
      now: 1,
      sites: ["500 [light] background: --palette-gray-025 = bg-canvas/bg-menu"],
    },
  ],
};

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
      "새 위반을 받아들이려고 재생성하지 마라 — 수는 한쪽으로만 움직인다. 예외는 소유자 결정뿐이고, " +
      "그것은 아래 productCleanupCandidates 에 사유와 함께 남는다.",
    $whyPerFile:
      "합계 하나로 잠그면 A 에서 하나 고치고 B 에 하나 넣는 것이 통과한다. 제품 저장소의 " +
      "`lint-baseline.json` 이 per file 로 얼린 것과 같은 이유다.",
    measuredAt: { productCommit: commit, refSource },
    files: Object.fromEntries(Object.entries(counts).sort(([a], [b]) => a.localeCompare(b))),
    // 손으로 적지 않는다 — 위 `PRODUCT_CLEANUP_CANDIDATES` 를 옮기고 지금 수(`countNow`)를 붙인다.
    productCleanupCandidates: {
      $comment:
        "소유자가 기준선에 받아들인 상승(제품 쪽 정리 후보). 면제가 아니다. 정본은 " +
        "scripts/check-palette-ladder-collision.mjs 의 PRODUCT_CLEANUP_CANDIDATES 다.",
      ...PRODUCT_CLEANUP_CANDIDATES,
      entries: PRODUCT_CLEANUP_CANDIDATES.entries.map((e) => ({ ...e, countNow: counts[e.file] ?? 0 })),
    },
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
// 정리 후보는 실패가 아니다(소유자 결정). 다만 조용히 묻히지 않게 남은 수를 매번 찍는다.
const pending = PRODUCT_CLEANUP_CANDIDATES.entries.filter((e) => (counts[e.file] ?? 0) > e.was);
console.log(
  "  제품 쪽 정리 후보 " + pending.length + "/" + PRODUCT_CLEANUP_CANDIDATES.entries.length +
    " 파일 남음(" + PRODUCT_CLEANUP_CANDIDATES.decidedAt + " 소유자 결정 · " +
    "PRODUCT_CLEANUP_CANDIDATES). 고쳐져 수가 was 로 돌아온 항목은 목록에서 지우세요.",
);
