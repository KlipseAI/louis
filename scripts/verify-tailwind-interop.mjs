import { createRequire } from "node:module";
import { existsSync, readFileSync, mkdtempSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, resolve, join } from "node:path";
import { fileURLToPath } from "node:url";

// 제품(klipse-web)은 Tailwind 4의 `@theme`에서 네 namespace를 통째로 지운다 —
// `--color-*` · `--radius-*` · `--text-*` · `--font-*`. DS의 theme.css도 그 네 namespace를 쓴다.
//
// 그래서 **불러오는 순서가 계약이다.** DS를 먼저 불러오면 제품의 reset이 DS 값을 지우는데,
// 오류가 나지 않는다 — 유틸리티가 **조용히 생성되지 않는다.** `bg-action-primary`가 아무것도
// 하지 않는 클래스가 된다. 가장 나쁜 실패 모양이라 게이트로 잡는다.
//
// Tailwind는 **제품 저장소의 것을 쓴다.** DS는 Tailwind에 의존하지 않는다(DS-D-0004·DS-D-0013).
// 그리고 interop을 재는 데는 제품이 실제로 쓰는 버전이 정본이다.
const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const productRoot = process.env.KLIPSE_PRODUCT_REPO ?? "/Users/sejunki/klipse-web";
const productRef = process.env.KLIPSE_PRODUCT_REF ?? "origin/main";
const themePath = resolve(repoRoot, "packages/css/generated/theme.css");

// 제품의 reset이 지우는 namespace에서 하나씩 뽑는다. 전부 DS theme.css가 발행하는 이름이다.
const PROBES = ["bg-action-primary", "text-foreground-primary", "rounded-card", "rounded-control"];
// reset과 무관한 대조군 — 순서를 바꿔도 살아 있어야 실험이 성립한다.
const CONTROLS = ["p-3", "gap-3"];

if (!existsSync(resolve(productRoot, ".git"))) {
  console.log(
    "[tailwind-interop] SKIPPED (제품 저장소 없음: " +
      productRoot +
      "). 불러오기 순서 계약은 로컬에서 확인해야 합니다.",
  );
  process.exit(0);
}

const require_ = createRequire(join(productRoot, "package.json"));
let compile;
try {
  // package exports가 dist를 가리지 않으므로 패키지 루트를 짚어 직접 부른다.
  const packagePath = require_.resolve("tailwindcss/package.json");
  const libraryPath = join(dirname(packagePath), "dist", "lib.js");
  ({ compile } = require_(libraryPath));
} catch (error) {
  console.log(
    "[tailwind-interop] SKIPPED (제품의 tailwindcss를 불러오지 못했습니다: " + error.message + ")",
  );
  process.exit(0);
}

const { execFileSync } = await import("node:child_process");
const productTheme = execFileSync("git", ["show", productRef + ":apps/web/app/tailwind.css"], {
  cwd: productRoot,
  encoding: "utf8",
  maxBuffer: 64 * 1024 * 1024,
}).replace(/@import\s+"\.\/keyframes\.css";/g, "");

const workspace = mkdtempSync(join(tmpdir(), "kds-tailwind-interop-"));
const failures = [];
try {
  writeFileSync(join(workspace, "product.css"), productTheme);
  writeFileSync(join(workspace, "ds.css"), readFileSync(themePath, "utf8"));
  writeFileSync(join(workspace, "ds-first.css"), '@import "./ds.css";\n@import "./product.css";\n');
  writeFileSync(join(workspace, "product-first.css"), '@import "./product.css";\n@import "./ds.css";\n');

  const dsFirst = await build("ds-first.css");
  const productFirst = await build("product-first.css");

  // 계약: 제품을 먼저 불러야 DS 값이 살아남는다.
  const missing = PROBES.filter((utility) => !dsFirst.has(utility) === false);
  for (const utility of PROBES) {
    if (!productFirst.has(utility))
      failures.push(
        "제품 → DS 순서인데도 `" +
          utility +
          "` 유틸리티가 생성되지 않았습니다. theme.css가 그 이름을 더 이상 발행하지 않거나 제품의 reset 범위가 넓어졌습니다.",
      );
  }
  for (const utility of CONTROLS) {
    if (!productFirst.has(utility) || !dsFirst.has(utility))
      failures.push(
        "대조군 `" + utility + "`이 사라졌습니다. 이 실험이 순서 문제를 재고 있지 않습니다.",
      );
  }

  // 내장 canary — 반대 순서가 **실제로 깨져야** 이 게이트가 무언가를 지킨다는 뜻이다.
  // 언젠가 Tailwind나 제품이 바뀌어 반대 순서도 통과하게 되면, 계약이 사라진 것이므로 알려야 한다.
  const survivedWrongOrder = PROBES.filter((utility) => dsFirst.has(utility));
  if (survivedWrongOrder.length === PROBES.length) {
    failures.push(
      "canary: DS → 제품 순서에서도 유틸리티가 전부 살아남았습니다. 순서 계약이 더 이상 필요 없어졌을 수 있으니 DS-D-0020을 다시 판정하세요.",
    );
  } else if (survivedWrongOrder.length > 0) {
    failures.push(
      "DS → 제품 순서에서 일부만 사라졌습니다(" +
        survivedWrongOrder.join(", ") +
        " 생존). 제품의 reset 범위가 바뀌었으니 계약을 다시 적으세요.",
    );
  }
  void missing;
} finally {
  rmSync(workspace, { recursive: true, force: true });
}

for (const failure of failures) console.error("[tailwind-interop] " + failure);
if (failures.length > 0) process.exit(1);
console.log(
  "[tailwind-interop] OK (불러오기 순서 계약: 제품 → DS. 탐침 " +
    PROBES.length +
    "종이 올바른 순서에서 생성되고 반대 순서에서 전부 사라짐, 대조군 " +
    CONTROLS.length +
    "종은 양쪽 생존)",
);

async function build(entry) {
  const source = readFileSync(join(workspace, entry), "utf8");
  const compiled = await compile(source, {
    base: workspace,
    loadStylesheet: async (id, base) => {
      // `tailwindcss/...`는 제품의 node_modules에서, 나머지는 작업 디렉터리에서 읽는다.
      const path = id.startsWith("tailwindcss")
        ? require_.resolve(id)
        : resolve(base, id);
      return { path, base: dirname(path), content: readFileSync(path, "utf8") };
    },
  });
  const css = compiled.build([...PROBES, ...CONTROLS]);
  const produced = new Set();
  for (const utility of [...PROBES, ...CONTROLS]) {
    if (css.includes("." + utility.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))) produced.add(utility);
  }
  return produced;
}
