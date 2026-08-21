import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { atomicWriteBatch } from "./lib/atomic-output.mjs";
import { resolveProductRef } from "./lib/product-ref.mjs";

// **값을 직접 쓸 수 있는 축마다 드리프트가 번진다.** 한 축씩 발견하지 말고 전 축을 한 번에 잰다.
//
// 2026-08-21에 네 축에서 같은 자국이 나왔다 — 알파 73단(필요 14), radius 홀수 5단 45회,
// border-width 최다값 1px에 토큰 없음, duration 58단(DS 4단이 24%만 덮음). 넷 다 「스케일이 아니라
// 그때그때 넣은 값」이고, 넷 다 **따로따로** 발견됐다. 다섯 번째 축은 놓치지 않는다.
//
// 판정은 둘이다.
//   coverage   DS 토큰이 실사용의 몇 %를 덮는가. 낮으면 스케일이 좁거나 제품이 흩어졌다.
//   topMissing 최다 사용값에 토큰이 없는가. 있으면 **가장 흔한 값을 못 쓰고 있다는 뜻**이다.
//
// 이 스크립트는 고치지 않는다. 재고 드러낸다. 접는 것은 제품 변경이라 사람이 정한다.

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const productRoot = process.env.KLIPSE_PRODUCT_REPO ?? "/Users/sejunki/klipse-web";
const { ref } = resolveProductRef();
const check = process.argv.includes("--check");
const git = (a) => execFileSync("git", ["-C", productRoot, ...a], { encoding: "utf8", maxBuffer: 1 << 28 });
const commit = git(["rev-parse", ref]).trim();

const tokens = JSON.parse(readFileSync(resolve(repoRoot, "packages/tokens/generated/tokens.json"), "utf8"));
const all = { ...tokens.primitives, ...tokens.modes.global };
const numeric = (prefix) =>
  new Set(
    Object.entries(all)
      .filter(([id]) => id.startsWith(prefix))
      .map(([, e]) => (typeof e.value === "object" ? e.value?.value : e.value))
      .filter((v) => typeof v === "number"),
  );

// 축 — 제품에서 자유값이 들어갈 수 있는 자리. 정규식은 **선언된 값**을 집는다.
const AXES = [
  { id: "alpha", label: "투명도 %", unit: "%",
    rx: [/rgba?\(\s*var\(\s*--[a-z0-9-]+\s*\)\s*\/\s*(\d+(?:\.\d+)?)%/g,
         /rgba?\(var\(--[a-z0-9-]+\)_\/_(\d+(?:\.\d+)?)%/g],
    dsStops: () => new Set([4, 6, 8, 10, 12, 16, 20, 25, 30, 40, 50, 60, 70, 80]) },
  { id: "radius", label: "모서리 반경", unit: "px",
    rx: [/border-radius:\s*(\d+(?:\.\d+)?)px/g, /rounded-\[(\d+(?:\.\d+)?)px\]/g,
         /\[border-radius:(\d+(?:\.\d+)?)px\]/g],
    dsStops: () => numeric("radius-") },
  { id: "border-width", label: "테두리 두께", unit: "px",
    rx: [/border(?:-width)?:\s*(\d+(?:\.\d+)?)px/g, /border-\[(\d+(?:\.\d+)?)px\]/g,
         /\[border-width:(\d+(?:\.\d+)?)px\]/g],
    dsStops: () => numeric("border-width-") },
  { id: "spacing", label: "간격", unit: "px",
    rx: [/(?:gap|padding|margin)(?:-(?:inline|block|top|right|bottom|left|x|y))?:\s*(\d+(?:\.\d+)?)px/g,
         /\[(?:gap|padding|margin)[a-z-]*:(\d+(?:\.\d+)?)px\]/g,
         /(?:p|m|gap)[xytrbl]?-\[(\d+(?:\.\d+)?)px\]/g],
    dsStops: () => numeric("space-") },
  { id: "duration", label: "모션 길이", unit: "ms",
    rx: [/(?<![0-9.])(\d{1,4})ms/g],
    dsStops: () => {
      const s = numeric("duration-");
      for (const [id, e] of Object.entries(all))
        if (id.startsWith("motion-") && e.value?.duration?.value !== undefined)
          s.add(e.value.duration.value);
      return s;
    } },
];

const files = git(["ls-tree", "-r", "--name-only", commit])
  .split("\n")
  .filter((f) => f.startsWith("apps/web/") && /\.(css|tsx|ts)$/.test(f) && !f.includes("(highlight-standalone)"));

const counts = new Map(AXES.map((a) => [a.id, new Map()]));
for (const file of files) {
  const text = git(["show", `${commit}:${file}`]);
  for (const axis of AXES) {
    const m = counts.get(axis.id);
    for (const rx of axis.rx) {
      rx.lastIndex = 0;
      for (const hit of text.matchAll(rx)) {
        const v = Number(hit[1]);
        const e = m.get(v) ?? { uses: 0, files: new Set() };
        e.uses += 1;
        e.files.add(file);
        m.set(v, e);
      }
    }
  }
}

const axes = AXES.map((axis) => {
  const ds = axis.dsStops();
  const rows = [...counts.get(axis.id).entries()].sort((a, b) => b[1].uses - a[1].uses);
  const total = rows.reduce((n, [, e]) => n + e.uses, 0);
  const covered = rows.filter(([v]) => ds.has(v)).reduce((n, [, e]) => n + e.uses, 0);
  const top = rows[0];
  return {
    id: axis.id, label: axis.label, unit: axis.unit,
    productStops: rows.length, dsStops: ds.size, uses: total,
    coveragePct: total === 0 ? null : Math.round((covered / total) * 1000) / 10,
    topValue: top?.[0] ?? null, topUses: top?.[1].uses ?? 0,
    topHasToken: top ? ds.has(top[0]) : null,
    missingTop: rows.filter(([v]) => !ds.has(v)).slice(0, 8)
      .map(([v, e]) => ({ value: v, uses: e.uses, files: e.files.size })),
  };
});

const output = {
  $comment: "생성물. scripts/measure-product-drift.mjs가 배포본에서 잰다. 직접 수정하지 않는다.",
  $whyThisExists:
    "값을 직접 쓸 수 있는 축마다 드리프트가 번진다. 2026-08-21에 네 축에서 같은 자국이 **따로따로** 발견됐다 — 알파·radius·border-width·duration. 한 축씩 발견하는 방식으로는 다섯 번째를 놓친다. 전 축을 한 번에 재서 드러낸다.",
  $howToRead:
    "coverage가 낮으면 DS 스케일이 좁거나 제품이 흩어진 것이다. topHasToken이 false면 **가장 흔한 값을 토큰으로 쓸 수 없다는 뜻**이며, 그 자체로 결함이다.",
  productRef: ref, productCommit: commit,
  axes,
};
const path = resolve(repoRoot, "migration/product.drift.json");
const body = JSON.stringify(output, null, 2) + "\n";
const line = axes
  .map((a) => `${a.id} ${a.productStops}단/${a.coveragePct}%${a.topHasToken === false ? "★" : ""}`)
  .join(" · ");
if (check) {
  if (readFileSync(path, "utf8") !== body) {
    console.error("[product-drift] 기록이 배포본과 다릅니다. 다시 재고 갱신하세요.");
    process.exit(1);
  }
  console.log(`[product-drift] checked: ${line} @ ${commit.slice(0, 8)}`);
} else {
  atomicWriteBatch([{ absolute: path, expected: body }]);
  console.log(`[product-drift] built: ${line} @ ${commit.slice(0, 8)}  (★ = 최다값에 토큰 없음)`);
}
