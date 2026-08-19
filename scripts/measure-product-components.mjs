import { execFileSync } from "node:child_process";
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";
import { atomicWriteBatch } from "./lib/atomic-output.mjs";

// **제품 컴포넌트를 실제로 렌더해서 잰다.**
//
// 그전까지 제품 값은 전부 소스 읽기였다 — screen-inventory.md가 스스로
// "브라우저 실측 렌더를 하지 않았다"고 적어 두었고, product.measured.json의 187축 중 기계가
// 대조하는 것은 12축뿐이었다. 나머지는 사람이 코드를 읽고 옮긴 값이다.
//
// 제품 서버는 띄우지 않는다(.env.local이 실제 서비스에 붙는다). 대신 제품의 **클래스 문자열**을
// 제품 자신의 Tailwind로 컴파일하고, 제품 CSS와 함께 브라우저에 올려 계산값을 읽는다.
// 마크업은 제품 소스에서 그대로 옮긴 것이며 그 출처를 각 항목에 적는다.
const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const outputPath = resolve(repoRoot, "migration/product.rendered-components.json");
const productRoot = process.env.KLIPSE_PRODUCT_REPO ?? "/Users/sejunki/klipse-web";
const productRef = process.env.KLIPSE_PRODUCT_REF ?? "origin/main";
const checkOnly = process.argv.includes("--check");

// 재는 대상. class는 제품 소스에서 그대로 옮긴다 — 지어내면 이 게이트가 무의미하다.
const PROBES = [
  {
    id: "button-md",
    source: "apps/web/components/ui/Button.tsx ROOT + SIZE_MD",
    html: `<button class="box-border relative inline-flex items-center justify-center rounded-[var(--button-radius)] whitespace-nowrap h-[var(--button-height)] py-0 px-[var(--button-padding-inline)] gap-4">저장</button>`,
    read: ["height", "paddingLeft", "paddingRight", "borderTopLeftRadius", "columnGap"],
  },
  {
    id: "button-sm",
    source: "apps/web/components/ui/Button.tsx ROOT + SIZE_SM",
    html: `<button class="box-border relative inline-flex items-center justify-center rounded-[var(--button-radius)] whitespace-nowrap h-[var(--button-height-sm)] min-w-[var(--button-min-width-sm)] py-0 px-[var(--button-padding-inline-sm)] gap-2">저장</button>`,
    read: ["height", "paddingLeft", "paddingRight", "borderTopLeftRadius", "columnGap", "minWidth"],
  },
  {
    id: "project-card",
    source: "apps/web/components/scenes/appHomeSceneStyles.ts archiveCard",
    html: `<div class="[position:relative] [display:grid] [gap:12px] [row-gap:8px] [padding:0] [min-width:0] [border-radius:16px]"></div>`,
    read: ["borderTopLeftRadius", "rowGap", "columnGap", "padding"],
  },
  {
    id: "project-card-overlay",
    source: "apps/web/components/scenes/appHomeSceneStyles.ts archivePreviewTitleOverlay",
    html: `<div class="[position:absolute] [height:30%] [padding:16px] [border-radius:0_0_16px_16px]"></div>`,
    read: ["padding", "borderBottomLeftRadius", "height"],
  },
  {
    id: "project-grid",
    source: "apps/web/components/scenes/appHomeSceneStyles.ts archiveGrid",
    html: `<div class="[display:grid] [grid-template-columns:repeat(2,_1fr)] [gap:12px] min-[1200px]:[grid-template-columns:repeat(4,_1fr)]"></div>`,
    read: ["columnGap", "rowGap", "gridTemplateColumns"],
  },
  {
    id: "button-secondary-border",
    source: "apps/web/components/ui/Button.tsx BORDER_SECONDARY",
    html: `<button class="box-border [border:1px_solid_rgb(var(--palette-gray-900-rgb)/12%)] rounded-[var(--button-radius)] h-[var(--button-height)]">저장</button>`,
    read: ["borderTopWidth", "borderTopColor"],
  },
];

if (!existsSync(resolve(productRoot, ".git"))) {
  console.log(
    "[product-components] " +
      (checkOnly ? "SKIPPED" : "제품 저장소가 없습니다") +
      " (" + productRoot + "). 렌더 실측은 로컬에서 확인해야 합니다.",
  );
  process.exit(0);
}

const require_ = createRequire(join(productRoot, "package.json"));
let compile;
try {
  const packagePath = require_.resolve("tailwindcss/package.json");
  ({ compile } = require_(join(dirname(packagePath), "dist", "lib.js")));
} catch (error) {
  console.log("[product-components] SKIPPED (제품 tailwindcss를 불러오지 못했습니다: " + error.message + ")");
  process.exit(0);
}

const git = (args) =>
  execFileSync("git", args, { cwd: productRoot, encoding: "utf8", maxBuffer: 64 * 1024 * 1024 });
const commit = git(["rev-parse", productRef]).trim();
const normalize = (source) =>
  source.replace(/@import\s+["'][^"']+["'][^;]*;/g, "").replace(/@theme\s+(?:inline\s+)?\{/g, ":root {");

const workspace = mkdtempSync(join(tmpdir(), "kds-product-components-"));
let rendered;
try {
  // 제품의 진입 CSS는 ./keyframes.css를 @import한다. 컴파일러가 찾을 수 있게 함께 꺼내 둔다.
  const tailwindEntry = git(["show", commit + ":apps/web/app/tailwind.css"]);
  writeFileSync(join(workspace, "entry.css"), tailwindEntry);
  writeFileSync(join(workspace, "keyframes.css"), git(["show", commit + ":apps/web/app/keyframes.css"]));

  const compiled = await compile(tailwindEntry, {
    base: workspace,
    loadStylesheet: async (id, base) => {
      const path = id.startsWith("tailwindcss") ? require_.resolve(id) : resolve(base, id);
      return { path, base: dirname(path), content: readFileSync(path, "utf8") };
    },
  });
  const classes = PROBES.flatMap((probe) => probe.html.match(/class="([^"]*)"/)[1].split(/\s+/));
  const utilities = compiled.build(classes);

  const productCss = [
    normalize(git(["show", commit + ":apps/web/app/tailwind.css"])),
    git(["show", commit + ":apps/web/app/globals.css"]),
    utilities,
  ].join("\n\n");

  const browser = await chromium.launch();
  try {
    const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, colorScheme: "dark" });
    const page = await context.newPage();
    await page.setContent(
      '<!doctype html><html data-theme="dark"><head><style>' +
        productCss.replace(/<\/style>/gi, "<\\/style>") +
        "</style></head><body>" +
        PROBES.map((probe, index) => `<div id="probe-${index}" style="position:relative;width:360px;height:360px">${probe.html}</div>`).join("") +
        "</body></html>",
      { waitUntil: "load" },
    );
    rendered = await page.evaluate((probes) => {
      const out = {};
      probes.forEach((probe, index) => {
        const element = document.querySelector(`#probe-${index} > *`);
        const style = getComputedStyle(element);
        const values = {};
        for (const property of probe.read) values[property] = style[property];
        out[probe.id] = values;
      });
      return out;
    }, PROBES.map((p) => ({ id: p.id, read: p.read })));
    await context.close();
  } finally {
    await browser.close();
  }
} finally {
  rmSync(workspace, { recursive: true, force: true });
}

const payload =
  JSON.stringify(
    {
      $comment:
        "생성물. scripts/measure-product-components.mjs가 제품 클래스를 제품 Tailwind로 컴파일해 실브라우저에서 잰다. 직접 수정하지 않는다.",
      $whyThisExists:
        "그전까지 제품 값은 전부 소스 읽기였다. product.measured.json의 187축 중 기계 대조는 12축뿐이고 나머지는 사람이 코드를 읽고 옮긴 값이다. 여기 값은 브라우저가 실제로 계산한 것이다.",
      $method:
        "제품 서버를 띄우지 않는다. 클래스 문자열을 제품 소스에서 그대로 옮겨 제품 Tailwind로 컴파일하고, 제품 CSS와 함께 빈 문서에 올려 계산값을 읽는다.",
      productRef,
      productCommit: commit,
      probes: PROBES.map(({ id, source, html }) => ({ id, source, html })),
      rendered,
    },
    null,
    2,
  ) + "\n";

// ── DS 값과 대조 ────────────────────────────────────────────────────────────
// **여기가 이 게이트의 요지다.** 그전까지 DS는 사람이 코드를 읽고 옮긴 값과만 맞춰 봤다.
// 이제 브라우저가 실제로 계산한 제품 값과 맞춘다.
const measured = JSON.parse(
  readFileSync(resolve(repoRoot, "figma/components.measured.json"), "utf8"),
).components;
const EXPECT = [
  ["button-md", "height", ["button", "sizes", "md", "height"]],
  ["button-md", "paddingLeft", ["button", "sizes", "md", "paddingInline"]],
  ["button-md", "borderTopLeftRadius", ["button", "sizes", "md", "radius"]],
  ["button-md", "columnGap", ["button", "sizes", "md", "gap"]],
  ["button-sm", "height", ["button", "sizes", "sm", "height"]],
  ["button-sm", "paddingLeft", ["button", "sizes", "sm", "paddingInline"]],
  ["button-sm", "columnGap", ["button", "sizes", "sm", "gap"]],
  ["button-sm", "minWidth", ["button", "sizes", "sm", "minWidth"]],
  ["project-card", "borderTopLeftRadius", ["project-card", "sizes", "base", "radius"]],
  ["project-card-overlay", "padding", ["project-card", "sizes", "base", "overlayPadding"]],
];
const mismatches = [];
const compared = [];
for (const [probeId, property, path] of EXPECT) {
  const actual = Number.parseFloat(rendered[probeId]?.[property]);
  let want = measured;
  for (const key of path) want = want?.[key];
  if (want === undefined) {
    mismatches.push(`${path.join(".")}가 figma/components.measured.json에 없습니다.`);
    continue;
  }
  if (!Number.isFinite(actual)) {
    mismatches.push(`${probeId}.${property}를 읽지 못했습니다.`);
    continue;
  }
  if (actual !== want) {
    mismatches.push(
      `${probeId}.${property}: 제품이 렌더한 값은 ${actual}인데 DS는 ${want}입니다 (${path.join(".")}). ` +
        `사람이 옮겨 적은 값이 실제와 다릅니다.`,
    );
    continue;
  }
  compared.push(`${probeId}.${property}`);
}
if (mismatches.length > 0) {
  for (const mismatch of mismatches) console.error("[product-components] " + mismatch);
  process.exit(1);
}

if (checkOnly) {
  let current = "";
  try {
    current = readFileSync(outputPath, "utf8");
  } catch {
    console.error("[product-components] 생성물이 없습니다: migration/product.rendered-components.json");
    process.exit(1);
  }
  if (current !== payload) {
    const before = JSON.parse(current);
    for (const [id, values] of Object.entries(rendered)) {
      for (const [property, value] of Object.entries(values)) {
        const was = before.rendered?.[id]?.[property];
        if (was !== value) console.error(`[product-components] ${id}.${property}: ${was} → ${value}`);
      }
    }
    console.error("[product-components] 제품 렌더 값이 기록과 다릅니다. 값을 다시 판정하고 갱신하세요.");
    process.exit(1);
  }
} else {
  atomicWriteBatch([{ absolute: outputPath, expected: payload }]);
}

console.log(
  "[product-components] " +
    (checkOnly ? "checked" : "built") +
    ": 탐침 " + PROBES.length + "종 @ " + commit.slice(0, 8) +
    " · **브라우저가 잰 제품 값과 DS를 " + compared.length + "축 대조**",
);
