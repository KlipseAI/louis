import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { atomicWriteBatch } from "./lib/atomic-output.mjs";
import { resolveProductRef } from "./lib/product-ref.mjs";

// 제품의 알파 값을 **사다리로 접었을 때 무엇이 어디서 바뀌는지**를 낸다.
//
// **왜 있는가.** 제품에 알파 스톱이 73단 있고, 실측해 보니 최다 사용값조차 전체의 9%다.
// 설계된 스케일이면 상위 5~6단이 80~90%를 덮는다. 그렇지 않다는 것은 값이 그때그때 눈대중으로
// 들어갔다는 뜻이다 — 0~86% 사이가 1~2%p 간격으로 빈틈없이 차 있어 군집이 갈리지도 않는다.
//
// 사다리를 정하는 것은 절반이고, **제품의 73개를 실제로 접는 것이 나머지 절반**이다. 접지 않으면
// DS만 11단이고 제품은 계속 73단이다. 그래서 이 스크립트는 매핑표와 함께 **사람이 봐야 할 자리**를
// 따로 낸다 — 1~2%p 이동은 눈에 안 보이므로 확인이 필요 없고, 5%p 이상만 확인 대상이다.
//
// `keep`에 등록한 값은 접지 않는다. 73개 중에 진짜 의도가 있는 값이 섞여 있을 수 있고, 구분 없이
// 일괄로 밀면 그것도 부서진다.

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const productRoot = process.env.KLIPSE_PRODUCT_REPO ?? "/Users/sejunki/klipse-web";
const { ref } = resolveProductRef();
const check = process.argv.includes("--check");
const git = (a) => execFileSync("git", ["-C", productRoot, ...a], { encoding: "utf8", maxBuffer: 1 << 28 });

// 사다리 — 저역 2단위(4~12) · 중역 4~5단위(16~30) · 고역 10단위(40~80).
//
// **규칙적인 사다리를 고르지 않은 이유.** 알파는 절대 차이가 아니라 **상대 차이**가 보인다 —
// 5%p가 8%에서는 25%지만 55%에서는 9%다. 그래서 저역을 촘촘히 해야 하고, 고역은 성글어도 된다.
// 균등 사다리(5·10·15…)는 상대 15% 이상 이동이 654회지만 이 사다리는 **79회**다.
//
// 「외우기 쉬운 사다리라야 다시 흘러내리지 않는다」고 볼 수도 있으나, 토큰의 요점은 목록에서
// 고르는 것이지 숫자를 외워 타이핑하는 것이 아니다. 값을 직접 쓰지 못하게 만들면 규칙성 없이도
// 드리프트는 막힌다. 그러면 규칙성이 아니라 **충실도**로 고르는 것이 맞다.
const LADDER = [4, 6, 8, 10, 12, 16, 20, 25, 30, 40, 50, 60, 70, 80];

// 사람이 확인할 자리를 고르는 기준도 상대값이다.
const VISIBLE_REL = 0.15;
const OPAQUE = 88; // 이 이상은 알파가 아니라 불투명 잉크다 (DS-D-0010 원칙 4)
const KEEP = []; // 의도가 확인돼 접지 않기로 한 값

const commit = git(["rev-parse", ref]).trim();
const files = git(["ls-tree", "-r", "--name-only", commit])
  .split("\n")
  .filter((f) => f.startsWith("apps/web/") && /\.(css|tsx|ts)$/.test(f) && !f.includes("(highlight-standalone)"));

const RX = [
  /rgba?\(\s*var\(\s*(--[a-z0-9-]+)\s*\)\s*\/\s*(\d+(?:\.\d+)?)%/g,
  /rgba?\(var\((--[a-z0-9-]+)\)_\/_(\d+(?:\.\d+)?)%/g,
];

const byStop = new Map();
for (const file of files) {
  const lines = git(["show", `${commit}:${file}`]).split("\n");
  lines.forEach((text, i) => {
    for (const rx of RX) {
      rx.lastIndex = 0;
      for (const m of text.matchAll(rx)) {
        const pct = Number(m[2]);
        const e = byStop.get(pct) ?? { uses: 0, sites: [] };
        e.uses += 1;
        e.sites.push({ file: file.replace(/^apps\/web\//, ""), line: i + 1, ink: m[1] });
        byStop.set(pct, e);
      }
    }
  });
}

const snap = (v) => LADDER.reduce((best, x) => (Math.abs(x - v) < Math.abs(best - v) ? x : best), LADDER[0]);
const mapping = [];
const review = [];
let movedUses = 0;
let visibleUses = 0;
let trueAlphaUses = 0;

for (const [from, e] of [...byStop.entries()].sort((a, b) => a[0] - b[0])) {
  if (from === 0) {
    mapping.push({ from, to: null, uses: e.uses, note: "완전 투명 — 알파 스톱이 아니다. 접지 않는다." });
    continue;
  }
  if (from >= OPAQUE) {
    mapping.push({ from, to: null, uses: e.uses, note: "불투명 잉크로 흡수 — solid role이 받는다." });
    continue;
  }
  trueAlphaUses += e.uses;
  if (KEEP.includes(from)) {
    mapping.push({ from, to: from, delta: 0, uses: e.uses, note: "의도 확인됨 — 접지 않는다." });
    continue;
  }
  const to = snap(from);
  const delta = Math.round(Math.abs(to - from) * 100) / 100;
  const relative = Math.round((delta / from) * 1000) / 1000;
  if (delta > 0) movedUses += e.uses;
  const visible = relative >= VISIBLE_REL;
  if (visible) {
    visibleUses += e.uses;
    review.push({ from, to, delta, relative, uses: e.uses, sites: e.sites });
  }
  mapping.push({ from, to, delta, relative, uses: e.uses, visible });
}

// 잉크 × 접힌 계단 교차표 — 단위 2가 **어느 램프에 어느 계단을 세워야 하는지**의 근거다.
// 램프마다 사다리 14단을 다 채우면 47개 신설이 되는데, 그것은 원칙 1(실사용을 승격)에 어긋난다.
const inkStops = new Map();
for (const [from, e] of byStop.entries()) {
  if (from === 0 || from >= OPAQUE) continue;
  const to = KEEP.includes(from) ? from : snap(from);
  for (const site of e.sites) {
    const key = site.ink;
    const m = inkStops.get(key) ?? new Map();
    m.set(to, (m.get(to) ?? 0) + 1);
    inkStops.set(key, m);
  }
}
const inkLadder = [...inkStops.entries()]
  .map(([ink, m]) => ({
    ink,
    uses: [...m.values()].reduce((a, b) => a + b, 0),
    stops: [...m.entries()].sort((a, b) => a[0] - b[0]).map(([stop, uses]) => ({ stop, uses })),
  }))
  .sort((a, b) => b.uses - a.uses);

const output = {
  $comment: "생성물. scripts/build-alpha-consolidation.mjs가 만든다. 직접 수정하지 않는다.",
  $whyThisExists:
    "제품에 알파 스톱이 73단 있고 최다 사용값조차 전체의 9%다. 설계된 스케일이 아니라 값이 그때그때 들어간 자국이다. 사다리를 정하는 것은 절반이고 제품을 실제로 접는 것이 나머지 절반이라, 여기에 매핑표와 **사람이 봐야 할 자리**를 함께 낸다.",
  $howToUse:
    "`review`의 자리만 눈으로 확인한다. 나머지는 **상대 이동**이 " + VISIBLE_REL * 100 + "% 미만이라 보이지 않는다. 접으면 안 되는 값을 찾으면 스크립트의 `KEEP`에 넣고 다시 생성한다 — 사유를 커밋 메시지에 남긴다.",
  ladder: LADDER,
  visibleThresholdRelative: VISIBLE_REL,
  keep: KEEP,
  productRef: ref,
  productCommit: commit,
  totals: {
    stops: byStop.size,
    trueAlphaStops: mapping.filter((m) => m.to !== null).length,
    trueAlphaUses,
    movedUses,
    visibleUses,
    reviewSites: review.reduce((n, r) => n + r.sites.length, 0),
  },
  inkLadder,
  mapping,
  review,
};

const path = resolve(repoRoot, "migration/alpha-consolidation.json");
const body = JSON.stringify(output, null, 2) + "\n";
if (check) {
  if (readFileSync(path, "utf8") !== body) {
    console.error("[alpha-consolidation] 기록이 배포본과 다릅니다. 다시 생성하세요.");
    process.exit(1);
  }
  console.log(`[alpha-consolidation] checked: ${LADDER.length}단 · 확인 대상 ${output.totals.reviewSites}자리 @ ${commit.slice(0, 8)}`);
} else {
  atomicWriteBatch([{ absolute: path, expected: body }]);
  console.log(
    `[alpha-consolidation] built: ${byStop.size}단 → ${LADDER.length}단 · 이동 ${movedUses}회 · ` +
      `**확인 필요 ${output.totals.reviewSites}자리** (${Math.round((visibleUses / trueAlphaUses) * 100)}%) @ ${commit.slice(0, 8)}`,
  );
}
