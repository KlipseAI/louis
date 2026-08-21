import { execFileSync } from "node:child_process";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { atomicWriteBatch } from "./lib/atomic-output.mjs";
import { resolveProductRef } from "./lib/product-ref.mjs";

// 제품이 **실제로 쓰는** 알파 스톱을 센다.
//
// **왜 있는가.** DS-D-0010이 알파 축을 10단으로 정규화하기로 했는데, 그 10단이 실사용 빈도에서
// 나온 것인지 확인할 데이터가 저장소에 없었다. 원칙 1은 「정의가 아니라 실사용을 승격한다.
// 승격 근거에는 사용 화면과 빈도를 남긴다」인데 그 빈도가 없으면 원칙을 적용할 수 없다.
//
// 세는 것은 `rgb(var(--*-rgb) / N%)` 형태다 — 토큰 잉크에 알파를 씌우는 자리. Tailwind 임의
// 값(`_/_`)도 같은 것으로 센다. `rgba(r,g,b,a)` 리터럴은 토큰이 아니므로 따로 센다.
//
// `(highlight-standalone)`은 DS-D-0010 §5에 따라 범위 밖이다.

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const productRoot = process.env.KLIPSE_PRODUCT_REPO ?? "/Users/sejunki/klipse-web";
const { ref } = resolveProductRef();
const check = process.argv.includes("--check");
const git = (args) =>
  execFileSync("git", ["-C", productRoot, ...args], { encoding: "utf8", maxBuffer: 1 << 28 });

const commit = git(["rev-parse", ref]).trim();
const files = git(["ls-tree", "-r", "--name-only", commit])
  .split("\n")
  .filter(
    (f) =>
      f.startsWith("apps/web/") &&
      /\.(css|tsx|ts)$/.test(f) &&
      !f.includes("(highlight-standalone)"),
  );

const TOKEN_ALPHA = /rgba?\(\s*var\(\s*(--[a-z0-9-]+)\s*\)\s*\/\s*(\d+(?:\.\d+)?)%/g;
const TW_ALPHA = /rgba?\(var\((--[a-z0-9-]+)\)_\/_(\d+(?:\.\d+)?)%/g;
const LITERAL = /rgba\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*,\s*(0?\.\d+|1|0)\s*\)/g;

const stops = new Map();
const ink = new Map();
const literal = new Map();
const bump = (map, key, file) => {
  const e = map.get(key) ?? { uses: 0, files: new Set() };
  e.uses += 1;
  if (file) e.files.add(file);
  map.set(key, e);
};

for (const file of files) {
  const text = git(["show", `${commit}:${file}`]);
  for (const rx of [TOKEN_ALPHA, TW_ALPHA]) {
    rx.lastIndex = 0;
    for (const m of text.matchAll(rx)) {
      bump(stops, Number(m[2]), file);
      bump(ink, m[1], file);
    }
  }
  for (const m of text.matchAll(LITERAL)) {
    bump(literal, Math.round(Number(m[1]) * 1000) / 10, file);
  }
}

const shape = (map) =>
  [...map.entries()]
    .sort((a, b) => (typeof a[0] === "number" ? a[0] - b[0] : String(a[0]).localeCompare(String(b[0]))))
    .map(([key, e]) => ({ key, uses: e.uses, files: e.files.size }));

const tokenUses = [...stops.values()].reduce((n, e) => n + e.uses, 0);
const opaque = [...stops.entries()].filter(([k]) => k >= 88).reduce((n, [, e]) => n + e.uses, 0);

const output = {
  $comment:
    "생성물. scripts/measure-product-alpha.mjs가 배포본에서 센다. 직접 수정하지 않는다.",
  $whyThisExists:
    "DS-D-0010 원칙 1은 「정의가 아니라 실사용을 승격한다. 승격 근거에는 사용 화면과 빈도를 남긴다」인데, 알파 축을 10단으로 정규화하기로 한 그 10단이 실사용 빈도에서 나온 것인지 확인할 데이터가 없었다. 여기 수치가 그 근거다.",
  $method:
    "`rgb(var(--*-rgb) / N%)`과 Tailwind 임의 값 `_/_` 형태를 센다. rgba 리터럴은 토큰이 아니므로 따로 센다. (highlight-standalone)은 DS-D-0010 §5에 따라 제외한다.",
  productRef: ref,
  productCommit: commit,
  totals: {
    tokenAlphaUses: tokenUses,
    distinctStops: stops.size,
    opaqueOrNearOpaqueUses: opaque,
    literalUses: [...literal.values()].reduce((n, e) => n + e.uses, 0),
  },
  stops: shape(stops),
  ink: shape(ink).sort((a, b) => b.uses - a.uses),
  literalStops: shape(literal),
};

const path = resolve(repoRoot, "migration/product.alpha.json");
const body = JSON.stringify(output, null, 2) + "\n";
if (check) {
  const { readFileSync } = await import("node:fs");
  const current = readFileSync(path, "utf8");
  if (current !== body) {
    console.error("[product-alpha] 기록이 배포본과 다릅니다. 다시 세고 갱신하세요.");
    process.exit(1);
  }
  console.log(
    `[product-alpha] checked: 스톱 ${stops.size}단 · 토큰 알파 ${tokenUses}회 @ ${commit.slice(0, 8)}`,
  );
} else {
  atomicWriteBatch([{ absolute: path, expected: body }]);
  console.log(
    `[product-alpha] built: 스톱 ${stops.size}단 · 토큰 알파 ${tokenUses}회 · 리터럴 ${output.totals.literalUses}회 @ ${commit.slice(0, 8)}`,
  );
}
