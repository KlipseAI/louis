import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { transformSync } from "esbuild";
import { atomicWriteBatch } from "./lib/atomic-output.mjs";
import { loadProductSceneEvidence } from "./lib/product-scene-evidence.mjs";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const planPath = resolve(repoRoot, "figma/product-pricing-page.plan.json");
const templatePath = resolve(repoRoot, "scripts/templates/figma-product-pricing-renderer.js");
const checkOnly = process.argv.includes("--check");
// 생성물을 그냥 읽지 않는다 — **어느 제품 커밋의 증거인지 확인하고 읽는다.**
// scripts/lib/product-scene-evidence.mjs 에 사유가 있다.
const evidence = loadProductSceneEvidence("figma-product-pricing-page");
const template = readFileSync(templatePath, "utf8");
const fail = (message) => { throw new Error(`[figma-product-pricing-page] ${message}`); };
const px = (value) => Number(/^(-?[\d.]+)px$/.exec(value ?? "")?.[1] ?? 0);
const transparent = (value) => !value || value === "transparent" || value === "rgba(0, 0, 0, 0)";
const contexts = [
  { id: "desktop-1920x1080", viewport: "Desktop" },
  { id: "mobile-402x874", viewport: "Mobile" },
];
const colorBindings = {
  "rgb(250, 250, 250)": "gray000",
  "rgb(241, 241, 243)": "gray100",
  "rgb(227, 228, 232)": "gray200",
  "rgb(188, 192, 201)": "gray400",
  "rgb(154, 160, 171)": "gray500",
  "rgb(119, 125, 137)": "gray600",
  "rgb(87, 93, 104)": "gray700",
  "rgb(49, 54, 64)": "gray800",
  "rgb(23, 27, 34)": "gray900",
  "rgb(0, 0, 0)": "gray1000",
  "rgb(0, 198, 142)": "mint500",
  "rgba(154, 160, 171, 0.9)": "gray500a90",
  "rgba(0, 0, 0, 0.74)": "blackA74",
  "rgba(23, 27, 34, 0.12)": "gray900a12",
  "rgba(23, 27, 34, 0.1)": "gray900a10",
  "rgba(23, 27, 34, 0.08)": "gray900a08",
  "rgba(0, 0, 0, 0.05)": "blackA05",
  "rgba(0, 0, 0, 0.12)": "blackA12",
  "rgba(0, 0, 0, 0.45)": "blackA45",
  "rgba(154, 160, 171, 0.14)": "gray500a14",
  "rgb(0, 122, 255)": "$brandBlueFixed",
};
const colorKey = (value) => {
  if (transparent(value)) return null;
  return colorBindings[value] ?? fail(`unmapped measured color ${value}`);
};
const rel = (rect, root) => ({
  x: rect.x - root.x,
  y: rect.y - root.y,
  width: rect.width,
  height: rect.height,
});
const corners = (style) => [
  px(style.borderTopLeftRadius), px(style.borderTopRightRadius),
  px(style.borderBottomRightRadius), px(style.borderBottomLeftRadius),
];
const borderSpec = (style) => ["Top", "Right", "Bottom", "Left"].map((side) => ({
  width: px(style[`border${side}Width`]),
  color: px(style[`border${side}Width`]) ? colorKey(style[`border${side}Color`]) : null,
}));
const effectSpec = (value) => {
  if (!value || value === "none") return [];
  const matches = [...value.matchAll(/(rgba?\([^)]*\))\s+(-?[\d.]+)px\s+(-?[\d.]+)px\s+(-?[\d.]+)px\s+(-?[\d.]+)px(?:\s+(inset))?/g)];
  if (!matches.length) fail(`unsupported measured shadow ${value}`);
  return matches.map((match) => ({
    type: match[6] === "inset" ? "INNER_SHADOW" : "DROP_SHADOW",
    color: match[1],
    x: Number(match[2]), y: Number(match[3]), blur: Number(match[4]), spread: Number(match[5]),
  }));
};
const directChildren = (tree, rootPath) => tree.filter((entry) =>
  entry.path.startsWith(`${rootPath}.`) && entry.path.split(".").length === rootPath.split(".").length + 1);
const ancestorPaths = (path) => {
  const parts = path.split(".");
  return parts.map((_, index) => parts.slice(0, index + 1).join("."));
};

const makeContext = ({ id, viewport }) => {
  const page = evidence.pages[id]?.["/pricing"] ?? fail(`missing ${id} /pricing`);
  if (page.tree.length !== 883) fail(`${id} pricing tree must have 883 nodes, got ${page.tree.length}`);
  if ((viewport === "Desktop" && (page.main.width !== 1920 || page.main.height !== 4615.2969)) ||
      (viewport === "Mobile" && (page.main.width !== 402 || page.main.height !== 5097.9063))) {
    fail(`${id} pricing page geometry drift`);
  }
  const tree = page.tree;
  const byPath = new Map(tree.map((entry) => [entry.path, entry]));
  const isVisible = (entry) => ancestorPaths(entry.path).every((path) => {
    const ancestor = byPath.get(path);
    return !ancestor || (ancestor.style.display !== "none" && Number(ancestor.style.opacity) !== 0 && ancestor.rect.width > 0 && ancestor.rect.height > 0);
  });
  const hasSvgAncestor = (entry, rootPath) => ancestorPaths(entry.path)
    .filter((path) => path !== entry.path && path !== rootPath)
    .some((path) => byPath.get(path)?.tag === "svg");
  const iconKind = (entry) => {
    if (entry.style.maskImage?.includes("/icons/CheckCircle.svg")) return "featureCheck";
    if (entry.tag === "img" && entry.src === "/klipse-light.svg") return "headerLogo";
    if (entry.tag !== "svg") return null;
    const descendants = tree.filter((node) => node.path.startsWith(`${entry.path}.`));
    const paths = descendants.map((node) => node.vector?.d).filter(Boolean);
    if (descendants.some((node) => node.tag === "circle")) return "globe";
    if (paths.some((value) => value.startsWith("M213.85,125.46"))) return "bolt";
    if (paths.some((value) => value.startsWith("M5 12.5L10 17.5"))) return "tableCheck";
    if (paths.some((value) => value.startsWith("M176,32H80"))) return "instagram";
    if (paths.some((value) => value.startsWith("M23.498 6.186"))) return "youtube";
    if (entry.vector?.viewBox === "0 0 73 28") return "footerLogo";
    return fail(`unclassified measured SVG ${id} ${entry.path}`);
  };
  const textSpecs = (entries, root) => entries.filter((entry) => entry.ownText).flatMap((entry) => {
    const lineHeight = px(entry.style.lineHeight);
    const lines = entry.ownTextLines?.length ? entry.ownTextLines : [{ text: entry.ownText, ...entry.rect }];
    const parentPath = entry.path.split(".").slice(0, -1).join(".");
    const parent = byPath.get(parentPath);
    const align = entry.style.textAlign === "center" ? "CENTER" : entry.style.textAlign === "right" ? "RIGHT" : "LEFT";
    return lines.map((line, index) => ({
      name: `${entry.path} · line ${index + 1}`,
      text: line.text,
      rect: {
        x: (align === "LEFT" ? line.x : align === "RIGHT" && parent ? parent.rect.x : entry.rect.x) - root.rect.x,
        y: line.y - root.rect.y,
        width: align === "LEFT"
          ? Math.max(0, (parent?.rect.x ?? entry.rect.x) + (parent?.rect.width ?? entry.rect.width) - line.x)
          : align === "RIGHT" && parent
            ? entry.rect.x + entry.rect.width - parent.rect.x
            : entry.rect.width,
        height: lineHeight || line.height,
      },
      fontSize: px(entry.style.fontSize),
      fontWeight: Number(entry.style.fontWeight),
      lineHeight: lineHeight || line.height,
      letterSpacing: entry.style.letterSpacing === "normal" ? 0 : px(entry.style.letterSpacing),
      align,
      color: colorKey(entry.style.color),
    }));
  });
  const shapeSpecs = (entries, root) => entries.filter((entry) => {
    if (entry.path === root.path || entry.tag === "svg" || entry.tag === "img" || hasSvgAncestor(entry, root.path)) return false;
    const style = entry.style;
    return !transparent(style.backgroundColor) || borderSpec(style).some((side) => side.width) || style.boxShadow !== "none";
  }).map((entry) => ({
    name: entry.path,
    rect: rel(entry.rect, root.rect),
    fill: colorKey(entry.style.backgroundColor),
    corners: corners(entry.style),
    borders: borderSpec(entry.style),
    effects: effectSpec(entry.style.boxShadow),
  })).sort((a, b) => (b.rect.width * b.rect.height) - (a.rect.width * a.rect.height));
  const iconSpecs = (entries, root) => entries.filter((entry) =>
    isVisible(entry) && (entry.tag === "svg" || entry.tag === "img" || entry.style.maskImage?.includes("/icons/CheckCircle.svg")))
    .filter((entry) => !hasSvgAncestor(entry, root.path))
    .map((entry) => ({ name: entry.path, kind: iconKind(entry), rect: rel(entry.rect, root.rect) }));
  const flatten = (rootPath, setName, variantName) => {
    const root = byPath.get(rootPath) ?? fail(`missing ${id} root ${rootPath}`);
    if (!isVisible(root)) fail(`component root is not visible ${id} ${rootPath}`);
    const entries = tree.filter((entry) =>
      (entry.path === rootPath || entry.path.startsWith(`${rootPath}.`)) && isVisible(entry));
    return {
      setName, variantName, viewport, sourcePath: rootPath,
      rect: { width: root.rect.width, height: root.rect.height },
      root: {
        fill: colorKey(root.style.backgroundColor),
        corners: corners(root.style),
        borders: borderSpec(root.style),
        effects: effectSpec(root.style.boxShadow),
      },
      shapes: shapeSpecs(entries, root),
      texts: textSpecs(entries, root),
      icons: iconSpecs(entries, root),
    };
  };
  const planNames = ["Trial", "Basic", "Pro", "Max"];
  const packNames = ["Bronze", "Silver", "Gold"];
  const navRoots = ["main.1"];
  const planRoots = page.tierCards.map((card) => tree.find((entry) =>
    entry.tag === "article" && entry.rect.x === card.x && entry.rect.y === card.y)?.path ?? fail(`missing ${id} tier ${card.name}`));
  const packRoots = directChildren(tree, "main.2.0.0.3.1").map((entry) => entry.path);
  const comparisonRoots = directChildren(tree, "main.2.0.0.4.1.0").map((entry) => entry.path);
  const faqRoots = directChildren(tree, "main.2.1.0.0.1").map((entry) => entry.path);
  if (planRoots.length !== 4 || packRoots.length !== 3 || comparisonRoots.length !== 4 || faqRoots.length !== 7) {
    fail(`${id} repeated root count drift: plans=${planRoots.length} packs=${packRoots.length} compare=${comparisonRoots.length} faq=${faqRoots.length}`);
  }
  const groups = [
    ...navRoots.map((path) => flatten(path, "Product/Public Global Navigation", `Viewport=${viewport}`)),
    ...planRoots.map((path, index) => flatten(path, "Product/Pricing Plan Card", `Plan=${planNames[index]}, Viewport=${viewport}`)),
    ...packRoots.map((path, index) => flatten(path, "Product/Pricing Credit Pack", `Pack=${packNames[index]}, Viewport=${viewport}`)),
    ...comparisonRoots.map((path, index) => flatten(path, "Product/Pricing Compare Column", `Plan=${planNames[index]}, Viewport=${viewport}`)),
    ...faqRoots.map((path, index) => flatten(path, "Product/Pricing FAQ Item", `Item=${String(index + 1).padStart(2, "0")}, Viewport=${viewport}`)),
    flatten("main.3", "Product/Public Footer", `Viewport=${viewport}`),
  ];
  const groupedRoots = groups.map((group) => group.sourcePath);
  const insideGroup = (entry) => groupedRoots.some((path) => entry.path === path || entry.path.startsWith(`${path}.`));
  const sceneRoot = byPath.get("main");
  const directTexts = textSpecs(tree.filter((entry) => isVisible(entry) && !insideGroup(entry)), sceneRoot);
  const placements = groups.map((group) => {
    const root = byPath.get(group.sourcePath);
    return {
      setName: group.setName,
      variantName: group.variantName,
      x: root.rect.x,
      y: root.rect.y,
      width: root.rect.width,
      height: root.rect.height,
    };
  });
  return {
    id, viewport, width: page.main.width, height: page.main.height,
    fill: colorKey(sceneRoot.style.backgroundColor),
    groups, directTexts, placements,
  };
};

const builtContexts = contexts.map(makeContext);
const allGroups = builtContexts.flatMap((context) => context.groups);
const bindings = {
  paletteCollection: "1 · Palette", paletteMode: "default",
  semanticCollection: "2 · Semantic", semanticMode: "landing-light",
  primitiveCollection: "Klipse Primitive", primitiveMode: "Base",
  gray000: { collection: "1 · Palette", name: "palette/gray-000" },
  gray100: { collection: "1 · Palette", name: "palette/gray-100" },
  gray200: { collection: "1 · Palette", name: "palette/gray-200" },
  gray400: { collection: "1 · Palette", name: "palette/gray-400" },
  gray500: { collection: "1 · Palette", name: "palette/gray-500" },
  gray600: { collection: "1 · Palette", name: "palette/gray-600" },
  gray700: { collection: "1 · Palette", name: "palette/gray-700" },
  gray800: { collection: "1 · Palette", name: "palette/gray-800" },
  gray900: { collection: "1 · Palette", name: "palette/gray-900" },
  gray1000: { collection: "1 · Palette", name: "palette/gray-1000" },
  mint500: { collection: "1 · Palette", name: "accent/mint/500" },
  gray500a90: { collection: "2 · Semantic", name: "palette/gray-500 · a90" },
  blackA74: { collection: "2 · Semantic", name: "gray/000 · a74" },
  gray900a12: { collection: "2 · Semantic", name: "palette/gray-900 · a12" },
  gray900a10: { collection: "2 · Semantic", name: "gray/900 · a10" },
  gray900a08: { collection: "2 · Semantic", name: "gray/900 · a8" },
  blackA05: { collection: "2 · Semantic", name: "gray/000 · a5" },
  blackA12: { collection: "2 · Semantic", name: "gray/000 · a12" },
  blackA45: { collection: "2 · Semantic", name: "gray/000 · a45" },
  gray500a14: { collection: "2 · Semantic", name: "app/nav-chip-tint" },
};
const base = {
  schemaVersion: 1,
  productCommit: evidence.productCommit,
  evidence: "migration/product.scenes.json#/pages/*/~1pricing/tree",
  pageId: "240:3529",
  pageName: "90 · ASSETS — 출처별 (logo · tile · icon · root · .glyph · .authored)",
  sectionName: "P · product/Pricing · measured full-page components and scenes",
  bindings,
  dependencies: { featureCheckId: "61:388", headerLogoId: "57:10", footerLogoId: "208:1887" },
};
const phases = {
  shell: { ...base, phase: "components", groups: allGroups.filter((group) => ["Product/Public Global Navigation", "Product/Public Footer"].includes(group.setName)) },
  planDesktop: { ...base, phase: "components", groups: allGroups.filter((group) => group.setName === "Product/Pricing Plan Card" && group.viewport === "Desktop") },
  planMobile: { ...base, phase: "components", groups: allGroups.filter((group) => group.setName === "Product/Pricing Plan Card" && group.viewport === "Mobile") },
  credit: { ...base, phase: "components", groups: allGroups.filter((group) => group.setName === "Product/Pricing Credit Pack") },
  faq: { ...base, phase: "components", groups: allGroups.filter((group) => group.setName === "Product/Pricing FAQ Item") },
  comparisonDesktopA: { ...base, phase: "components", groups: allGroups.filter((group) => group.setName === "Product/Pricing Compare Column" && group.viewport === "Desktop").slice(0, 2) },
  comparisonDesktopB: { ...base, phase: "components", groups: allGroups.filter((group) => group.setName === "Product/Pricing Compare Column" && group.viewport === "Desktop").slice(2) },
  comparisonMobileA: { ...base, phase: "components", groups: allGroups.filter((group) => group.setName === "Product/Pricing Compare Column" && group.viewport === "Mobile").slice(0, 2) },
  comparisonMobileB: { ...base, phase: "components", groups: allGroups.filter((group) => group.setName === "Product/Pricing Compare Column" && group.viewport === "Mobile").slice(2) },
  scenes: {
    ...base, phase: "scenes", sceneSetName: "Product/Pricing Full Page",
    scenes: builtContexts.map(({ groups: _groups, ...scene }) => scene),
  },
};
const runner = (phase) => {
  const wrapped = transformSync(`async function __figmaRunner__(){const PLAN=${JSON.stringify(phases[phase])};\n${template}}`, {
    loader: "js", minify: true, legalComments: "none", target: "es2022",
  }).code.trim();
  const prefix = "async function __figmaRunner__(){";
  if (!wrapped.startsWith(prefix) || !wrapped.endsWith("}")) fail(`unexpected ${phase} runner wrapper`);
  return `// Generated by scripts/build-figma-product-pricing-page.mjs (${phase}). Do not edit by hand.\n${wrapped.slice(prefix.length, -1)}`;
};
const outputs = [
  { absolute: planPath, expected: `${JSON.stringify({ ...base, contexts: builtContexts }, null, 2)}\n` },
  { absolute: resolve(repoRoot, "figma/product-pricing-shell.draw.js"), expected: runner("shell") },
  { absolute: resolve(repoRoot, "figma/product-pricing-plan-desktop.draw.js"), expected: runner("planDesktop") },
  { absolute: resolve(repoRoot, "figma/product-pricing-plan-mobile.draw.js"), expected: runner("planMobile") },
  { absolute: resolve(repoRoot, "figma/product-pricing-credit.draw.js"), expected: runner("credit") },
  { absolute: resolve(repoRoot, "figma/product-pricing-faq.draw.js"), expected: runner("faq") },
  { absolute: resolve(repoRoot, "figma/product-pricing-comparison-desktop-a.draw.js"), expected: runner("comparisonDesktopA") },
  { absolute: resolve(repoRoot, "figma/product-pricing-comparison-desktop-b.draw.js"), expected: runner("comparisonDesktopB") },
  { absolute: resolve(repoRoot, "figma/product-pricing-comparison-mobile-a.draw.js"), expected: runner("comparisonMobileA") },
  { absolute: resolve(repoRoot, "figma/product-pricing-comparison-mobile-b.draw.js"), expected: runner("comparisonMobileB") },
  { absolute: resolve(repoRoot, "figma/product-pricing-scenes.draw.js"), expected: runner("scenes") },
];
for (const { absolute, expected } of outputs) {
  if (absolute.endsWith(".draw.js") && Buffer.byteLength(expected) > 50_000) {
    fail(`${absolute.split("/").at(-1)} exceeds 50,000 bytes: ${Buffer.byteLength(expected)}`);
  }
}
if (checkOnly) {
  for (const { absolute, expected } of outputs) {
    let current;
    try { current = readFileSync(absolute, "utf8"); } catch { fail(`missing generated output ${absolute}`); }
    if (current !== expected) fail(`generated output drift ${absolute}`);
  }
} else {
  atomicWriteBatch(outputs);
}
console.log(`[figma-product-pricing-page] ${checkOnly ? "checked" : "built"}: ${builtContexts.map((entry) => `${entry.viewport} ${entry.width}×${entry.height}`).join(" · ")}`);
