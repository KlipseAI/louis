import { execFileSync } from "node:child_process";
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";
import { atomicWriteBatch } from "./lib/atomic-output.mjs";
import { materializeDsPackage } from "./lib/ds-package-shim.mjs";
import { resolveProductRef } from "./lib/product-ref.mjs";

// **Figma 변수의 원천을 브라우저에게 묻는다.**
//
// Figma에 제품 토큰을 세우려면 「이 토큰이 이 문맥에서 무슨 값인가」를 알아야 한다. 그것을
// CSS를 읽어서 알아내려 하면 반드시 틀린다 — 제품은 같은 토큰을 **여섯 갈래**로 다시 선언하고,
// 그중 둘은 Tailwind 임의 변형이라 소스에 그 규칙이 문자열로 존재하지도 않는다.
//
// | 문맥 | 셀렉터 | 무엇이 달라지나 |
// | --- | --- | --- |
// | app-dark | `html[data-theme="dark"]` | 기준 |
// | app-light | `html[data-theme="light"]` | 시맨틱 램프 반전 |
// | app-light-sidebar | `html[data-theme=light] body:has(.gnb-wrapperSidebar)` | `--palette-gray-*`를 통째로 한 칸 재매핑 |
// | landing | `[data-page-root]` | `--gray-*`를 팔레트로 **고정**(테마 토글을 무시한다) |
// | landing-light-surface | `[data-page-root]` + `LIGHT_SURFACE_CLASS` | 거기서 `--gray-000`만 `#000000` |
// | walkthrough-dark / -light | `[data-landing-walkthrough-*]` | 랜딩 워크스루 전용 |
//
// 라이트/다크 2모드로 Figma를 세우면 사이드바가 있는 화면(아카이브·설정·분석)과 랜딩 계열이
// 전부 틀린 색으로 나온다. 그래서 문맥을 모드로 잡고, 각 문맥의 DOM을 실제로 만들어 잰다.
//
// 측정 대상 커밋은 근거 lock이 고정한 것이다(`scripts/lib/product-ref.mjs`).

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const outputPath = resolve(repoRoot, "migration/product.variable-modes.json");
const productRoot = process.env.KLIPSE_PRODUCT_REPO ?? "/Users/sejunki/klipse-web";
const { ref: productRef, source: productRefSource } = resolveProductRef();
const checkOnly = process.argv.includes("--check");

const SOURCES = {
  gnb: "apps/web/components/navigation/Gnb.tsx",
  templateShell: "apps/web/components/templates/TemplateShell.tsx",
};

// 문맥 정의. `mount`는 브라우저에서 그 문맥을 만족시키는 DOM을 만들고, 값을 읽을 요소를 돌려준다.
const CONTEXTS = [
  { id: "app-dark", theme: "dark", note: "html[data-theme=dark] — 기준" },
  { id: "app-light", theme: "light", note: "html[data-theme=light]" },
  {
    id: "app-light-sidebar",
    theme: "light",
    marker: "sidebar",
    readFrom: "body",
    note: "html[data-theme=light] body:has(.gnb-wrapperSidebar) — 팔레트 램프가 한 칸 밝아진다",
  },
  { id: "landing", theme: "dark", attr: "data-page-root", note: "[data-page-root] — 램프가 팔레트로 고정된다(테마 무관)" },
  {
    id: "landing-light-surface",
    theme: "dark",
    attr: "data-page-root",
    classesFrom: ["templateShell", "LIGHT_SURFACE_CLASS"],
    note: "[data-page-root] + LIGHT_SURFACE_CLASS — --gray-000 이 #000000 이 된다",
  },
  { id: "walkthrough-dark", theme: "light", attr: "data-landing-walkthrough-dark", note: "랜딩 워크스루 다크 구간" },
  { id: "walkthrough-light", theme: "dark", attr: "data-landing-walkthrough-light", note: "랜딩 워크스루 라이트 구간" },
];

if (!existsSync(resolve(productRoot, ".git"))) {
  const message = "[figma-variable-source] " + (checkOnly ? "SKIPPED" : "제품 저장소가 없습니다") + " (" + productRoot + ")";
  if (checkOnly) {
    console.log(message + ". 변수 원천은 로컬에서 확인해야 합니다.");
    process.exit(0);
  }
  console.error(message);
  process.exit(1);
}

const require_ = createRequire(join(productRoot, "package.json"));
let compile;
try {
  const packagePath = require_.resolve("tailwindcss/package.json");
  ({ compile } = require_(join(dirname(packagePath), "dist", "lib.js")));
} catch (error) {
  console.log("[figma-variable-source] SKIPPED (제품 tailwindcss를 불러오지 못했습니다: " + error.message + ")");
  process.exit(0);
}

const git = (args) =>
  execFileSync("git", args, { cwd: productRoot, encoding: "utf8", maxBuffer: 64 * 1024 * 1024 });
const commit = git(["rev-parse", productRef]).trim();

// 소스에서 클래스 목록 상수를 꺼낸다. 문자열 안에도 대괄호가 들어가므로 따옴표 경계를 지킨다.
function extractClassList(source, key, where) {
  const anchor = new RegExp("(?:^|\\n)(?:\\s{2}|const\\s+)" + key + "\\s*[:=]\\s*", "m").exec(source);
  if (!anchor) throw new Error(where + "에서 " + key + "를 찾지 못했습니다.");
  let index = anchor.index + anchor[0].length;
  while (source[index] === "\n" || source[index] === " ") index += 1;
  if (source[index] !== "[") {
    const literal = /"((?:[^"\\]|\\.)*)"/.exec(source.slice(index));
    if (!literal) throw new Error(where + "의 " + key + "가 문자열도 배열도 아닙니다.");
    return JSON.parse('"' + literal[1] + '"');
  }
  let depth = 0;
  let cursor = index;
  for (; cursor < source.length; cursor += 1) {
    const ch = source[cursor];
    if (ch === '"') {
      cursor += 1;
      while (cursor < source.length && !(source[cursor] === '"' && source[cursor - 1] !== "\\")) cursor += 1;
      continue;
    }
    if (ch === "[") depth += 1;
    else if (ch === "]") {
      depth -= 1;
      if (depth === 0) break;
    }
  }
  const body = source.slice(index, cursor + 1);
  return (body.match(/"(?:[^"\\]|\\.)*"/g) ?? []).map((part) => JSON.parse(part)).join(" ");
}

const sources = Object.fromEntries(
  Object.entries(SOURCES).map(([alias, path]) => [alias, git(["show", commit + ":" + path])]),
);
const sidebarMarker = extractClassList(sources.gnb, "wrapperSidebar", SOURCES.gnb);
for (const context of CONTEXTS) {
  if (!context.classesFrom) continue;
  const [alias, key] = context.classesFrom;
  context.classes = extractClassList(sources[alias], key, SOURCES[alias]);
}

// 제품이 선언하는 커스텀 프로퍼티 전량. 이름을 손으로 적지 않는다 — 빠뜨리면 조용히 사라진다.
const rawCss = ["apps/web/app/tailwind.css", "apps/web/app/keyframes.css", "apps/web/app/globals.css"]
  .map((path) => git(["show", commit + ":" + path]))
  .join("\n");
const names = [...new Set([...rawCss.matchAll(/(--[a-zA-Z0-9-]+)\s*:/g)].map((m) => m[1]))].sort();

const workspace = mkdtempSync(join(tmpdir(), "louis-figma-variable-source-"));
let modes;
let dsPin = "HEAD";
try {
  const tailwindEntry = git(["show", commit + ":apps/web/app/tailwind.css"]);
  writeFileSync(join(workspace, "entry.css"), tailwindEntry);
  writeFileSync(join(workspace, "keyframes.css"), git(["show", commit + ":apps/web/app/keyframes.css"]));
  dsPin = materializeDsPackage({ workspace, git, commit, tag: "figma-variable-source" });

  const compiled = await compile(tailwindEntry, {
    base: workspace,
    loadStylesheet: async (id, base) => {
      const path = id.startsWith("tailwindcss") ? require_.resolve(id) : resolve(base, id);
      return { path, base: dirname(path), content: readFileSync(path, "utf8") };
    },
  });
  // 문맥을 만드는 클래스만 컴파일하면 된다 — 우리가 재는 것은 변수 값이지 컴포넌트가 아니다.
  const candidates = new Set();
  for (const token of sidebarMarker.split(/\s+/)) if (token) candidates.add(token);
  for (const context of CONTEXTS) {
    for (const token of (context.classes ?? "").split(/\s+/)) if (token) candidates.add(token);
  }
  const utilities = compiled.build([...candidates]);

  const baseCss = [utilities, git(["show", commit + ":apps/web/app/globals.css"])].join("\n\n");

  const browser = await chromium.launch();
  modes = {};
  try {
    for (const context of CONTEXTS) {
      const browserContext = await browser.newContext({
        viewport: { width: 1440, height: 900 },
        colorScheme: context.theme,
      });
      const page = await browserContext.newPage();
      const marker =
        context.marker === "sidebar"
          ? '<div hidden style="display:none" class="' + sidebarMarker + '"></div>'
          : "";
      const target = context.attr
        ? '<div id="__probe" ' + context.attr + (context.classes ? ' class="' + context.classes + '"' : "") + "></div>"
        : "";
      await page.setContent(
        '<!doctype html><html data-theme="' + context.theme + '"><head><style>' +
          baseCss.replace(/<\/style>/gi, "<\\/style>") +
          "</style></head><body>" + marker + target + "</body></html>",
        { waitUntil: "load" },
      );
      modes[context.id] = await page.evaluate(
        ({ list, readFrom }) => {
          const element =
            readFrom === "body"
              ? document.body
              : document.getElementById("__probe") ?? document.documentElement;
          const style = getComputedStyle(element);
          const out = {};
          for (const name of list) {
            const value = style.getPropertyValue(name).trim();
            if (value) out[name] = value;
          }
          return out;
        },
        { list: names, readFrom: context.attr ? "probe" : context.readFrom ?? "root" },
      );
      await page.close();
      await browserContext.close();
    }
  } finally {
    await browser.close();
  }
} finally {
  rmSync(workspace, { recursive: true, force: true });
}

// **문맥에 따라 갈리는 토큰만이 모드를 가질 이유가 있다.** 나머지는 단일 값이므로 Figma에서
// 모드 없는 컬렉션(Primitive)에 둔다. 그 분류를 여기서 미리 해 둔다 — Figma 조립자가 다시
// 판단하면 사람마다 다른 답이 나온다.
const varying = [];
const constant = [];
for (const name of names) {
  const values = CONTEXTS.map((context) => modes[context.id][name]).filter((v) => v !== undefined);
  if (values.length === 0) continue;
  const unique = new Set(values);
  if (unique.size === 1 && values.length === CONTEXTS.length) constant.push(name);
  else varying.push(name);
}

const payload = {
  $comment: "생성물. scripts/build-figma-variable-source.mjs가 배포본을 브라우저에 올려 뽑는다. 직접 수정하지 않는다.",
  $whyThisExists:
    "Figma 변수를 세울 때 「이 토큰이 이 문맥에서 무슨 값인가」를 CSS 읽기로 알아내면 틀린다 — 제품은 같은 토큰을 여섯 갈래로 다시 선언하고 그중 둘은 Tailwind 임의 변형이라 소스에 규칙이 문자열로 없다. 여기에 문맥별 해결값을 고정해 Figma 모드의 원천으로 쓴다.",
  productRef,
  productRefSource,
  productCommit: commit,
  dsPin,
  contexts: CONTEXTS.map(({ id, theme, note }) => ({ id, theme, note })),
  counts: {
    declared: names.length,
    varying: varying.length,
    constant: constant.length,
  },
  varying,
  constant,
  modes,
};

const serialized = JSON.stringify(payload, null, 2) + "\n";
if (checkOnly) {
  const current = existsSync(outputPath) ? readFileSync(outputPath, "utf8") : "";
  if (current !== serialized) {
    console.error("[figma-variable-source] 기록이 배포본과 다릅니다. `node scripts/build-figma-variable-source.mjs`로 다시 뽑으세요.");
    process.exit(1);
  }
  console.log(
    "[figma-variable-source] checked: 문맥 " + CONTEXTS.length + " · 토큰 " + names.length +
      " (문맥에 따라 갈리는 것 " + varying.length + ") @ " + commit.slice(0, 8) + " · DS " + dsPin,
  );
  process.exit(0);
}

atomicWriteBatch([{ absolute: outputPath, expected: serialized }]);
console.log(
  "[figma-variable-source] built: 문맥 " + CONTEXTS.length + " · 토큰 " + names.length +
    " (문맥에 따라 갈리는 것 **" + varying.length + "** · 어디서나 같은 것 " + constant.length + ") @ " +
    commit.slice(0, 8) + " · DS " + dsPin,
);
