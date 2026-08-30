import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { atomicWriteBatch } from "./lib/atomic-output.mjs";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const fixture = JSON.parse(readFileSync(resolve(repoRoot, "migration/product.auth-fixture.json"), "utf8"));
const planPath = resolve(repoRoot, "figma/product-payment-scenes.plan.json");
const drawPath = resolve(repoRoot, "figma/product-payment-scenes.draw.js");
const templatePath = resolve(repoRoot, "scripts/templates/figma-product-payment-scenes-renderer.js");
const checkOnly = process.argv.includes("--check");
const context = "desktop-1920x1080";
const screens = fixture.screens[context];
const styles = new Map(fixture.computedStyles.map((entry) => [entry.id, entry.value]));
const fail = (message) => { throw new Error(`[figma-product-payment-scenes] ${message}`); };
const screen = (route) => screens[route] ?? fail(`missing screen ${route}`);
const node = (route, path) => screen(route).tree.find((entry) => entry.path === path) ?? fail(`missing node ${route} ${path}`);
const style = (entry) => styles.get(entry.styleRef) ?? fail(`missing style ${entry.styleRef}`);
const px = (value) => Number(/^(-?[\d.]+)px$/.exec(value ?? "")?.[1] ?? 0);
const color = (value) => {
  const match = /^rgba?\(\s*([\d.]+)[,\s]+([\d.]+)[,\s]+([\d.]+)(?:[,/\s]+([\d.]+))?\s*\)$/.exec(value ?? "");
  if (!match) fail(`unsupported color ${value}`);
  return [Number(match[1]) / 255, Number(match[2]) / 255, Number(match[3]) / 255, match[4] === undefined ? 1 : Number(match[4])];
};
const relRect = (entry, rootRect) => ({
  x: entry.rect.x - rootRect.x,
  y: entry.rect.y - rootRect.y,
  width: entry.rect.width,
  height: entry.rect.height,
});
const candidates = fixture.componentCandidateAudit.repeatedSubtreesByContext[context];
const candidateContracts = [
  ["subtree-52d9ec85500e", 86, 2],
  ["subtree-5aa2dd10161d", 82, 2],
  ["subtree-201c9e9375a9", 24, 2],
  ["subtree-7bba430c44a0", 20, 2],
].map(([id, nodeCount, routeCount]) => {
  const candidate = candidates.find((entry) => entry.id === id);
  if (!candidate || candidate.nodeCount !== nodeCount || candidate.routeCount !== routeCount) {
    fail(`measured payment scene candidate ${id} changed; inspect before regenerating Figma`);
  }
  return candidate;
});
const mobileCandidates = fixture.componentCandidateAudit.repeatedSubtreesByContext["mobile-402x874"];
const mobileCandidateContracts = [
  ["subtree-73a30a28794e", 27, 2],
  ["subtree-d79fa46213b4", 26, 2],
  ["subtree-70ba76fddd21", 25, 2],
  ["subtree-9be5ba2fce8c", 24, 2],
].map(([id, nodeCount, routeCount]) => {
  const candidate = mobileCandidates.find((entry) => entry.id === id);
  if (!candidate || candidate.nodeCount !== nodeCount || candidate.routeCount !== routeCount) {
    fail(`measured mobile payment scene candidate ${id} changed; inspect before regenerating Figma`);
  }
  return candidate;
});

const representativeRoute = "/mypage/upgrade/billing-change-fail";
const pageRoot = node(representativeRoute, "body.1");
const main = node(representativeRoute, "body.1.0.0.1");
const topBar = node(representativeRoute, "body.1.0.0.1.0.0");
const content = node(representativeRoute, "body.1.0.0.1.1");
const pageStyle = style(pageRoot);
const mainStyle = style(main);
if (
  pageRoot.rect.width !== 1920 || pageRoot.rect.height !== 1080 ||
  main.rect.width !== 1628 || main.rect.height !== 1004 ||
  px(mainStyle.borderTopLeftRadius) !== 16
) fail("measured payment scene geometry changed; inspect before regenerating Figma");

const variants = [
  { outcome: "Failure", route: "/mypage/upgrade/billing-change-fail" },
  { outcome: "PlanDelayed", route: "/mypage/upgrade/billing-change-success" },
  { outcome: "TopupDelayed", route: "/mypage/topup/success" },
].map((entry) => {
  const routeMain = node(entry.route, "body.1.0.0.1");
  const routeTopBar = node(entry.route, "body.1.0.0.1.0.0");
  const routeContent = node(entry.route, "body.1.0.0.1.1");
  if (JSON.stringify(routeMain.rect) !== JSON.stringify(main.rect)) fail(`main rect drift ${entry.route}`);
  return {
    ...entry,
    mainRect: relRect(routeMain, pageRoot.rect),
    topBarRect: relRect(routeTopBar, routeMain.rect),
    contentRect: relRect(routeContent, routeMain.rect),
  };
});
const mobileRoot = fixture.screens["mobile-402x874"][representativeRoute].tree.find((entry) => entry.path === "body.1") ??
  fail("missing mobile payment page root");
const mobileMain = fixture.screens["mobile-402x874"][representativeRoute].tree.find((entry) => entry.path === "body.1.0.0.1") ??
  fail("missing mobile payment main");
const mobileMainStyle = style(mobileMain);
if (mobileRoot.rect.width !== 402 || mobileRoot.rect.height !== 874 || mobileMain.rect.width !== 402 || mobileMain.rect.height !== 810) {
  fail("measured mobile payment scene geometry changed; inspect before regenerating Figma");
}
const mobileVariants = [
  { outcome: "Failure", route: "/mypage/upgrade/billing-change-fail" },
  { outcome: "PlanDelayed", route: "/mypage/upgrade/billing-change-success" },
  { outcome: "TopupDelayed", route: "/mypage/topup/success" },
].map((entry) => {
  const mobileScreen = fixture.screens["mobile-402x874"][entry.route];
  const routeMain = mobileScreen.tree.find((node) => node.path === "body.1.0.0.1") ?? fail(`missing mobile main ${entry.route}`);
  const routeTopBar = mobileScreen.tree.find((node) => node.path === "body.1.0.0.1.0.0") ?? fail(`missing mobile top bar ${entry.route}`);
  const routeContent = mobileScreen.tree.find((node) => node.path === "body.1.0.0.1.1") ?? fail(`missing mobile content ${entry.route}`);
  if (JSON.stringify(routeMain.rect) !== JSON.stringify(mobileMain.rect)) fail(`mobile main rect drift ${entry.route}`);
  return {
    ...entry,
    mainRect: relRect(routeMain, mobileRoot.rect),
    topBarRect: relRect(routeTopBar, routeMain.rect),
    contentRect: relRect(routeContent, routeMain.rect),
  };
});

const plan = {
  $comment: "Generated from migration/product.auth-fixture.json. Do not edit by hand.",
  $evidenceClass: "product-only measured Figma composition; not a normative design-system contract",
  productCommit: fixture.productCommit,
  context,
  sourceCandidates: candidateContracts,
  component: {
    id: "product/desktop-payment-result-scenes",
    pageId: "240:3529",
    pageName: "90 · ASSETS — 출처별 (logo · tile · icon · root · .glyph · .authored)",
    sectionName: "M · product/Desktop payment result scenes · measured composition",
    mainSetName: "Product/Desktop Payment Result Main Surface",
    sceneSetName: "Product/Desktop Payment Result Scene",
    dependencies: {
      gnbSet: "Product/Gnb Desktop Shell",
      gnbVariant: "Current=Default",
      topBarSet: "Product/Desktop App Top Bar",
      topBarVariant: "Content=MyPage, Breadcrumb=Single, Back=False, Divider=On",
      mobileTopBarSet: "Product/Mobile App Top Bar",
      mobileTopBarVariant: "Width=Inset, Breadcrumb=Single, Back=False, Divider=On",
      resultSet: "Product/Payment Result Content",
    },
    page: {
      rect: { width: pageRoot.rect.width, height: pageRoot.rect.height },
      background: color(pageStyle.backgroundColor),
    },
    main: {
      rect: { width: main.rect.width, height: main.rect.height },
      background: color(mainStyle.backgroundColor),
      radius: px(mainStyle.borderTopLeftRadius),
      padding: {
        top: px(mainStyle.paddingTop), right: px(mainStyle.paddingRight),
        bottom: px(mainStyle.paddingBottom), left: px(mainStyle.paddingLeft),
      },
    },
    variants,
    mobile: {
      mainSetName: "Product/Mobile Payment Result Main Surface",
      sceneSetName: "Product/Mobile Payment Result Scene",
      sourceCandidates: mobileCandidateContracts,
      page: {
        rect: { width: mobileRoot.rect.width, height: mobileRoot.rect.height },
        background: color(style(mobileRoot).backgroundColor),
      },
      main: {
        rect: { width: mobileMain.rect.width, height: mobileMain.rect.height },
        background: color(mobileMainStyle.backgroundColor),
        radius: px(mobileMainStyle.borderTopLeftRadius),
        padding: {
          top: px(mobileMainStyle.paddingTop), right: px(mobileMainStyle.paddingRight),
          bottom: px(mobileMainStyle.paddingBottom), left: px(mobileMainStyle.paddingLeft),
        },
      },
      variants: mobileVariants,
    },
    bindings: {
      paletteCollection: "1 · Palette",
      paletteMode: "sidebar",
      semanticCollection: "2 · Semantic",
      semanticMode: "light-sidebar",
      appBackground: { collection: "1 · Palette", name: "palette/gray-200" },
      surface: { collection: "1 · Palette", name: "palette/gray-100" },
      current: { collection: "2 · Semantic", name: "gray/000 · a78" },
      parent: { collection: "2 · Semantic", name: "gray/000 · a52" },
      radius16: { collection: "Klipse Primitive", name: "radius/16" },
    },
  },
};
const summary = ({ id, nodeCount, routeCount, occurrenceCount, score }) => ({ id, nodeCount, routeCount, occurrenceCount, score });
const runnerPlan = structuredClone(plan);
runnerPlan.sourceCandidates = plan.sourceCandidates.map(summary);
runnerPlan.component.mobile.sourceCandidates = plan.component.mobile.sourceCandidates.map(summary);
const draw =
  "// Generated by scripts/build-figma-product-payment-scenes.mjs. Do not edit by hand.\n" +
  "// Pass this file verbatim to use_figma. It composes only measured existing product components.\n" +
  `const PLAN=${JSON.stringify(runnerPlan)};\n` +
  readFileSync(templatePath, "utf8");
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
console.log(`[figma-product-payment-scenes] ${checkOnly ? "checked" : "built"} @ ${fixture.productCommit.slice(0, 8)}: ${variants.length} desktop + ${mobileVariants.length} mobile outcomes · desktop candidates ${candidateContracts.map((entry) => `${entry.nodeCount}/${entry.routeCount}`).join(", ")} · mobile candidates ${mobileCandidateContracts.map((entry) => `${entry.nodeCount}/${entry.routeCount}`).join(", ")} nodes/routes`);
