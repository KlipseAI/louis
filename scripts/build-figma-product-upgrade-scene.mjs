import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { transformSync } from "esbuild";
import { atomicWriteBatch } from "./lib/atomic-output.mjs";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const fixture = JSON.parse(readFileSync(resolve(repoRoot, "migration/product.auth-fixture.json"), "utf8"));
const planPath = resolve(repoRoot, "figma/product-upgrade-scene.plan.json");
const drawPath = resolve(repoRoot, "figma/product-upgrade-scene.draw.js");
const templatePath = resolve(repoRoot, "scripts/templates/figma-product-upgrade-scene-renderer.js");
const checkOnly = process.argv.includes("--check");
const productRoot = process.env.KLIPSE_PRODUCT_REPO ?? "/Users/sejunki/klipse-web";
const context = "desktop-1920x1080";
const mobileContext = "mobile-402x874";
const route = "/mypage/upgrade";
const redirectedRoute = "/mypage/upgrade/checkout";
const styles = new Map(fixture.computedStyles.map((entry) => [entry.id, entry.value]));
const fail = (message) => { throw new Error(`[figma-product-upgrade-scene] ${message}`); };
const sourceQuote = (path, line, expected) => {
  const command = `git -C ${productRoot} show ${fixture.productCommit}:${path}`;
  const source = execFileSync("git", ["-C", productRoot, "show", `${fixture.productCommit}:${path}`], {
    encoding: "utf8",
    maxBuffer: 16 * 1024 * 1024,
  });
  const quote = source.split("\n")[line - 1] ?? "";
  if (quote !== expected) fail(`source quote drift ${path}:${line}: ${JSON.stringify(quote)}`);
  return { command, path, line, quote };
};
const screen = fixture.screens[context]?.[route] ?? fail(`missing ${context} ${route}`);
const redirected = fixture.screens[context]?.[redirectedRoute] ?? fail(`missing ${context} ${redirectedRoute}`);
const mobileScreen = fixture.screens[mobileContext]?.[route] ?? fail(`missing ${mobileContext} ${route}`);
const mobileRedirected = fixture.screens[mobileContext]?.[redirectedRoute] ?? fail(`missing ${mobileContext} ${redirectedRoute}`);
const node = (path) => screen.tree.find((entry) => entry.path === path) ?? fail(`missing node ${path}`);
const mobileNode = (path) => mobileScreen.tree.find((entry) => entry.path === path) ?? fail(`missing mobile node ${path}`);
const style = (entry) => styles.get(entry.styleRef) ?? fail(`missing style ${entry.styleRef}`);
const px = (value) => Number(/^(-?[\d.]+)px$/.exec(value ?? "")?.[1] ?? 0);
const color = (value) => {
  const match = /^rgba?\(\s*([\d.]+)[,\s]+([\d.]+)[,\s]+([\d.]+)(?:[,/\s]+([\d.]+))?\s*\)$/.exec(value ?? "");
  if (!match) fail(`unsupported color ${value}`);
  return [Number(match[1]) / 255, Number(match[2]) / 255, Number(match[3]) / 255, match[4] === undefined ? 1 : Number(match[4])];
};
const shadows = (value) => {
  if (!value || value === "none") return [];
  const result = [];
  const pattern = /(rgba?\([^)]*\))\s+(-?[\d.]+)px\s+(-?[\d.]+)px\s+(-?[\d.]+)px\s+(-?[\d.]+)px(?:\s+(inset))?/g;
  for (const match of value.matchAll(pattern)) {
    result.push({
      type: match[6] === "inset" ? "INNER_SHADOW" : "DROP_SHADOW",
      color: color(match[1]),
      offset: { x: Number(match[2]), y: Number(match[3]) },
      radius: Number(match[4]),
      spread: Number(match[5]),
    });
  }
  if (!result.length) fail(`unsupported shadow ${value}`);
  return result;
};
const outline = (computed) => {
  if (!computed.outlineStyle || computed.outlineStyle === "none") return null;
  const width = px(computed.outlineWidth);
  const offset = px(computed.outlineOffset);
  if (!width || computed.outlineStyle !== "solid") fail(`unsupported outline ${JSON.stringify({
    width: computed.outlineWidth,
    style: computed.outlineStyle,
    color: computed.outlineColor,
    offset: computed.outlineOffset,
  })}`);
  if (offset !== -width) fail(`outline cannot map losslessly to an inside stroke: ${width}px / ${offset}px`);
  return {
    width,
    style: computed.outlineStyle,
    color: color(computed.outlineColor),
    offset,
    figmaMapping: `${width}px INSIDE stroke`,
  };
};
const relRect = (entry, rootRect) => ({ x: entry.rect.x - rootRect.x, y: entry.rect.y - rootRect.y, width: entry.rect.width, height: entry.rect.height });
const textSpec = (entry, rootRect) => {
  const computed = style(entry);
  return {
    text: entry.ownText,
    rect: relRect(entry, rootRect),
    fontSize: px(computed.fontSize),
    fontWeight: Number(computed.fontWeight),
    lineHeight: px(computed.lineHeight),
    letterSpacing: computed.letterSpacing === "normal" ? 0 : px(computed.letterSpacing),
    textAlign: computed.textAlign,
    color: color(computed.color),
  };
};
// 2026-08-24 use_figma에서 각 실제 Pretendard font/style/size/line-height/letter-spacing으로
// WIDTH_AND_HEIGHT 임시 TextNode를 측정하고 모두 삭제했다. 브라우저의 left anchor를 보존하면서
// Figma font engine에서만 생기는 가격·credit 줄바꿈을 막는 Figma 측 자연 폭이다.
const desktopFigmaGlyphMeasurements = {
  Free: 71,
  "35,900 KRW": 201,
  "59,900 KRW": 201,
  "89,900 KRW": 202,
  "per month": 73,
  "200": 37,
  "1,800": 50,
  "3,000": 54,
  "4,500": 54,
  credits: 62,
};
const mobileFigmaGlyphMeasurements = {
  Free: 55,
  "35,900": 91,
  KRW: 61,
  per: 21,
  month: 40,
};
const figmaGlyphMeasurements = {
  $measurement: "use_figma temporary TextNode natural bounds; exact per-string typography; measured 2026-08-24 and nodes removed",
  desktop: desktopFigmaGlyphMeasurements,
  mobile: mobileFigmaGlyphMeasurements,
};

if (redirected.finalPath !== route || !redirected.redirected || JSON.stringify(redirected.tree) !== JSON.stringify(screen.tree)) {
  fail(`${redirectedRoute} no-query redirect no longer matches ${route}`);
}
if (
  mobileRedirected.finalPath !== route || !mobileRedirected.redirected ||
  JSON.stringify(mobileRedirected.tree) !== JSON.stringify(mobileScreen.tree)
) fail(`${mobileContext} ${redirectedRoute} no-query redirect no longer matches ${route}`);
const pageRoot = node("body.1");
const mainOuter = node("body.1.0.0.1");
const main = node("body.1.0.0.1.0");
const topBar = node("body.1.0.0.1.0.0.0.0");
const content = node("body.1.0.0.1.0.0.1");
const cardGrid = node("body.1.0.0.1.0.0.1.1");
const mainStyle = style(main);
if (
  pageRoot.rect.width !== 1920 || pageRoot.rect.height !== 1080 ||
  mainOuter.rect.width !== 1640 || main.rect.width !== 1628 || main.rect.height !== 1056 ||
  cardGrid.rect.width !== 1300 || cardGrid.rect.height !== 560
) fail("desktop upgrade scene geometry changed");

const cardRoots = screen.tree.filter((entry) => entry.parentPath === cardGrid.path && entry.tag === "article");
if (cardRoots.length !== 4) fail(`expected four measured plan cards, got ${cardRoots.length}`);
const cardSpecs = cardRoots.map((root) => {
  const rootStyle = style(root);
  const descendants = screen.tree.filter((entry) => entry.path.startsWith(`${root.path}.`));
  const button = descendants.find((entry) => entry.tag === "button" && entry.ownText) ?? fail(`missing card button ${root.path}`);
  const buttonStyle = style(button);
  const texts = descendants
    .filter((entry) => entry.ownText && entry.path !== button.path)
    .map((entry) => {
      const spec = textSpec(entry, root.rect);
      return desktopFigmaGlyphMeasurements[spec.text] ? { ...spec, figmaWidth: desktopFigmaGlyphMeasurements[spec.text] } : spec;
    });
  const icons = descendants
    .filter((entry) => style(entry).maskImage.includes("/icons/CheckCircle.svg"))
    .map((entry) => ({ rect: relRect(entry, root.rect), color: color(style(entry).backgroundColor), asset: "/icons/CheckCircle.svg" }));
  const title = texts.find((entry) => ["Trial", "Basic", "Pro", "Max"].includes(entry.text))?.text ?? fail(`missing plan title ${root.path}`);
  return {
    plan: title,
    route,
    rect: { width: root.rect.width, height: root.rect.height },
    position: relRect(root, main.rect),
    padding: { top: px(rootStyle.paddingTop), right: px(rootStyle.paddingRight), bottom: px(rootStyle.paddingBottom), left: px(rootStyle.paddingLeft) },
    radius: px(rootStyle.borderTopLeftRadius),
    background: color(rootStyle.backgroundColor),
    effects: shadows(rootStyle.boxShadow),
    outline: outline(rootStyle),
    texts,
    icons,
    action: {
      text: button.ownText,
      rect: relRect(button, root.rect),
      radius: px(buttonStyle.borderTopLeftRadius),
      fill: color(buttonStyle.backgroundColor),
      opacity: Number(buttonStyle.opacity),
      label: textSpec(button, root.rect),
    },
  };
});
if (cardSpecs.some((entry) => entry.rect.width !== 316 || entry.rect.height !== 560)) fail("plan card size drift");
const expectedCurrentPlanOutline = {
  width: 2,
  style: "solid",
  color: [185 / 255, 225 / 255, 247 / 255, 0.42],
  offset: -2,
  figmaMapping: "2px INSIDE stroke",
};
if (
  JSON.stringify(cardSpecs[0].outline) !== JSON.stringify(expectedCurrentPlanOutline) ||
  cardSpecs.slice(1).some((entry) => entry.outline !== null)
) fail("desktop current-plan outline drift");

const headerTitle = textSpec(node("body.1.0.0.1.0.0.1.0.0"), main.rect);
const headerBody = textSpec(node("body.1.0.0.1.0.0.1.0.1"), main.rect);
const compareTitle = textSpec(node("body.1.0.0.1.0.0.1.2.0.0"), main.rect);

const mobilePageRoot = mobileNode("body.1");
const mobileMainOuter = mobileNode("body.1.0.0.1");
const mobileMain = mobileNode("body.1.0.0.1.0");
const mobileTopBar = mobileNode("body.1.0.0.1.0.0.0.0");
const mobileContent = mobileNode("body.1.0.0.1.0.0.1");
const mobileCardGrid = mobileNode("body.1.0.0.1.0.0.1.1");
const mobileMainStyle = style(mobileMain);
if (
  mobilePageRoot.rect.width !== 402 || mobilePageRoot.rect.height !== 874 ||
  mobileMainOuter.rect.width !== 402 || mobileMain.rect.width !== 402 || mobileMain.rect.height !== 874 ||
  mobileTopBar.rect.x !== 16 || mobileTopBar.rect.width !== 370 || mobileTopBar.rect.height !== 53 ||
  mobileContent.rect.x !== 16 || mobileContent.rect.y !== 53 || mobileContent.rect.width !== 370 || mobileContent.rect.height !== 3297.375 ||
  mobileCardGrid.rect.x !== 16 || mobileCardGrid.rect.y !== 401.3906 || mobileCardGrid.rect.width !== 370 || mobileCardGrid.rect.height !== 1194.1875
) fail("mobile upgrade visible-scene geometry changed");

const mobileCardRoots = mobileScreen.tree.filter((entry) => entry.parentPath === mobileCardGrid.path && entry.tag === "article");
if (mobileCardRoots.length !== 2) fail(`expected exactly two viewport-observed mobile plan cards, got ${mobileCardRoots.length}`);
const mobileCardSpecs = mobileCardRoots.map((root) => {
  const rootStyle = style(root);
  const descendants = mobileScreen.tree.filter((entry) => entry.path.startsWith(`${root.path}.`));
  if (descendants.some((entry) => entry.tag === "button")) fail(`mobile fixture unexpectedly contains an action ${root.path}`);
  const texts = descendants.filter((entry) => entry.ownText).map((entry) => {
    const spec = textSpec(entry, root.rect);
    if (spec.text === "Free") return { ...spec, figmaWidth: mobileFigmaGlyphMeasurements.Free };
    if (["200", "1,800", "credits"].includes(spec.text)) {
      return { ...spec, figmaWidth: desktopFigmaGlyphMeasurements[spec.text] };
    }
    if (spec.text === "35,900 KRW") {
      return {
        ...spec,
        $lineNaturalWidths: { "35,900": mobileFigmaGlyphMeasurements["35,900"], KRW: mobileFigmaGlyphMeasurements.KRW },
      };
    }
    if (spec.text === "per month") {
      return {
        ...spec,
        $lineNaturalWidths: { per: mobileFigmaGlyphMeasurements.per, month: mobileFigmaGlyphMeasurements.month },
      };
    }
    return spec;
  });
  const icons = descendants
    .filter((entry) => style(entry).maskImage.includes("/icons/CheckCircle.svg"))
    .map((entry) => ({ rect: relRect(entry, root.rect), color: color(style(entry).backgroundColor), asset: "/icons/CheckCircle.svg" }));
  const title = texts.find((entry) => ["Trial", "Basic"].includes(entry.text))?.text ?? fail(`missing mobile plan title ${root.path}`);
  return {
    plan: title,
    route,
    viewport: "MobileVisibleSlice",
    rect: { width: root.rect.width, height: root.rect.height },
    position: relRect(root, mobileMain.rect),
    visibleIntersection: {
      top: Math.max(0, mobilePageRoot.rect.y - root.rect.y),
      bottom: Math.min(root.rect.height, mobilePageRoot.rect.y + mobilePageRoot.rect.height - root.rect.y),
    },
    padding: { top: px(rootStyle.paddingTop), right: px(rootStyle.paddingRight), bottom: px(rootStyle.paddingBottom), left: px(rootStyle.paddingLeft) },
    radius: px(rootStyle.borderTopLeftRadius),
    background: color(rootStyle.backgroundColor),
    effects: shadows(rootStyle.boxShadow),
    outline: outline(rootStyle),
    texts,
    icons,
    actionMeasured: false,
  };
});
if (
  mobileCardSpecs.map((entry) => entry.plan).join(",") !== "Trial,Basic" ||
  mobileCardSpecs.some((entry) => entry.rect.width !== 179 || entry.rect.height !== 693.5938 || entry.padding.left !== 12) ||
  JSON.stringify(mobileCardSpecs[0].outline) !== JSON.stringify(expectedCurrentPlanOutline) ||
  mobileCardSpecs[1].outline !== null
) fail("mobile upgrade card visible-slice drift");

const mobileHeaderTitle = textSpec(mobileNode("body.1.0.0.1.0.0.1.0.0"), mobileMain.rect);
const mobileHeaderBody = textSpec(mobileNode("body.1.0.0.1.0.0.1.0.1"), mobileMain.rect);
const upgradeSourcePath = "apps/web/app/mypage/upgrade/page.tsx";
const currentPlanOutlineSource = [
  sourceQuote(upgradeSourcePath, 210, '  "[outline:2px_solid_rgb(var(--accent-ultra-400-rgb)/42%)]",'),
  sourceQuote(upgradeSourcePath, 211, '  "[outline-offset:-2px]",'),
];
const plan = {
  $comment: "Generated from migration/product.auth-fixture.json. Do not edit by hand.",
  $evidenceClass: "product-only measured upgrade card inventory plus desktop scene and mobile visible slice; not a normative design-system contract",
  productCommit: fixture.productCommit,
  currentPlanOutlineSource: {
    lines: currentPlanOutlineSource,
    figmaMapping: "The measured 2px solid outline with -2px offset is represented losslessly as a 2px INSIDE stroke. No exact local Figma color variable exists, so this remains a measured product-only fixed paint.",
  },
  figmaGlyphMeasurements,
  contexts: [context, mobileContext],
  redirectContracts: [
    { context, requestedRoute: redirectedRoute, finalPath: redirected.finalPath, redirected: redirected.redirected, treeEqualsCanonical: true },
    { context: mobileContext, requestedRoute: redirectedRoute, finalPath: mobileRedirected.finalPath, redirected: mobileRedirected.redirected, treeEqualsCanonical: true },
  ],
  component: {
    id: "product/upgrade-scene",
    pageId: "240:3529",
    pageName: "90 · ASSETS — 출처별 (logo · tile · icon · root · .glyph · .authored)",
    sectionName: "O · product/Upgrade plans · measured desktop scene",
    cardSetName: "Product/Upgrade Plan Card",
    mobileVisibleCardSetName: "Product/Upgrade Plan Card Visible Slice",
    mainComponentName: "Product/Desktop Upgrade Main Surface",
    sceneComponentName: "Product/Desktop Upgrade Scene",
    mobileMainComponentName: "Product/Mobile Upgrade Main Surface",
    mobileSceneComponentName: "Product/Mobile Upgrade Scene",
    dependencies: {
      gnbSet: "Product/Gnb Desktop Shell",
      gnbVariant: "Current=Upgrade",
      topBarSet: "Product/Desktop App Top Bar",
      topBarVariant: "Content=Subscription, Breadcrumb=Trail, Back=True, Divider=On",
      mobileTopBarSet: "Product/Mobile App Top Bar",
      mobileTopBarVariant: "Width=Inset, Breadcrumb=Trail, Back=True, Divider=On",
      checkIcon: "icon/CheckCircle",
    },
    page: { rect: { width: pageRoot.rect.width, height: pageRoot.rect.height }, background: color(style(pageRoot).backgroundColor) },
    main: {
      rect: relRect(main, pageRoot.rect),
      width: main.rect.width,
      height: main.rect.height,
      background: color(mainStyle.backgroundColor),
      radius: px(mainStyle.borderTopLeftRadius),
      effects: shadows(mainStyle.boxShadow),
      topBar: relRect(topBar, main.rect),
      content: relRect(content, main.rect),
      headerTitle,
      headerBody,
      compareTitle,
    },
    cardGrid: relRect(cardGrid, main.rect),
    cards: cardSpecs,
    mobile: {
      page: { rect: { width: mobilePageRoot.rect.width, height: mobilePageRoot.rect.height }, background: color(style(mobilePageRoot).backgroundColor) },
      main: {
        rect: relRect(mobileMain, mobilePageRoot.rect),
        width: mobileMain.rect.width,
        height: mobileMain.rect.height,
        background: color(mobileMainStyle.backgroundColor),
        radius: px(mobileMainStyle.borderTopLeftRadius),
        effects: shadows(mobileMainStyle.boxShadow),
        topBar: relRect(mobileTopBar, mobileMain.rect),
        content: relRect(mobileContent, mobileMain.rect),
        headerTitle: mobileHeaderTitle,
        headerBody: mobileHeaderBody,
      },
      cardGrid: relRect(mobileCardGrid, mobileMain.rect),
      cards: mobileCardSpecs,
      evidenceBoundary: "Only nodes present in the 402x874 fixture are drawn. Pro, Max, and card actions were outside the measured viewport and are absent.",
    },
    bindings: {
      paletteCollection: "1 · Palette",
      paletteMode: "sidebar",
      semanticCollection: "2 · Semantic",
      semanticMode: "light-sidebar",
      primitiveCollection: "Klipse Primitive",
      primitiveMode: "Base",
      appBackground: { collection: "1 · Palette", name: "palette/gray-200" },
      surface: { collection: "1 · Palette", name: "palette/gray-50" },
      cardSurface: { collection: "1 · Palette", name: "palette/gray-000" },
      black: { collection: "1 · Palette", name: "palette/gray-1000" },
      gray900: { collection: "1 · Palette", name: "palette/gray-900" },
      gray800: { collection: "1 · Palette", name: "palette/gray-800" },
      gray700: { collection: "1 · Palette", name: "palette/gray-700" },
      gray600: { collection: "1 · Palette", name: "palette/gray-600" },
      gray500: { collection: "1 · Palette", name: "palette/gray-500" },
      gray500a90: { collection: "2 · Semantic", name: "palette/gray-500 · a90" },
      blackA72: { collection: "2 · Semantic", name: "gray/000 · a72" },
      mint500: { collection: "1 · Palette", name: "accent/mint/500" },
      radius12: { collection: "Klipse Primitive", name: "radius/12" },
      radius16: { collection: "Klipse Primitive", name: "radius/16" },
      radius24: { collection: "Klipse Primitive", name: "radius/24" },
    },
  },
};
const readableDraw =
  "// Generated by scripts/build-figma-product-upgrade-scene.mjs. Do not edit by hand.\n" +
  "// Pass this file verbatim to use_figma. It creates only the measured desktop upgrade inventory/scene and mobile visible slice.\n" +
  `const PLAN=${JSON.stringify(plan)};\n` +
  readFileSync(templatePath, "utf8");
const wrappedDraw = transformSync(`async function __figmaRunner__(){${readableDraw}}`, {
  minify: true,
  target: "es2022",
}).code.trim();
const wrapperPrefix = "async function __figmaRunner__(){";
if (!wrappedDraw.startsWith(wrapperPrefix) || !wrappedDraw.endsWith("}")) fail("unexpected esbuild wrapper output");
const draw =
  "// Generated and minified by scripts/build-figma-product-upgrade-scene.mjs. Do not edit by hand.\n" +
  wrappedDraw.slice(wrapperPrefix.length, -1);
if (draw.length > 50_000) fail(`Figma runner exceeds connector limit: ${draw.length}`);
const expected = [
  { absolute: planPath, expected: `${JSON.stringify(plan, null, 2)}\n` },
  { absolute: drawPath, expected: draw },
];
if (checkOnly) {
  for (const entry of expected) {
    let current = "";
    try { current = readFileSync(entry.absolute, "utf8"); } catch { fail(`missing generated output ${entry.absolute.slice(repoRoot.length + 1)}`); }
    if (current !== entry.expected) fail(`generated output drift: ${entry.absolute.slice(repoRoot.length + 1)}`);
  }
} else atomicWriteBatch(expected);
console.log(`[figma-product-upgrade-scene] ${checkOnly ? "checked" : "built"} @ ${fixture.productCommit.slice(0, 8)}: ${cardSpecs.length} desktop cards + ${mobileCardSpecs.length} mobile visible slices + desktop/mobile scenes · checkout redirects asserted`);
