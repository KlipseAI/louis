import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { atomicWriteBatch } from "./lib/atomic-output.mjs";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const fixturePath = resolve(repoRoot, "migration/product.auth-fixture.json");
const planPath = resolve(repoRoot, "figma/product-components.plan.json");
const drawPath = resolve(repoRoot, "figma/product-components.draw.js");
const checkOnly = process.argv.includes("--check");
const fixture = JSON.parse(readFileSync(fixturePath, "utf8"));
const productRoot = process.env.KLIPSE_PRODUCT_REPO ?? "/Users/sejunki/klipse-web";
const contextName = "desktop-1920x1080";
const screens = fixture.screens[contextName];
const styles = new Map(fixture.computedStyles.map((entry) => [entry.id, entry.value]));

const fail = (message) => {
  throw new Error(`[figma-product-components] ${message}`);
};
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
const screen = (route) => screens[route] ?? fail(`missing screen ${route}`);
const node = (route, path) =>
  screen(route).tree.find((entry) => entry.path === path) ?? fail(`missing node ${route} ${path}`);
const style = (entry) => styles.get(entry.styleRef) ?? fail(`missing style ${entry.styleRef}`);
const byText = (route, text) =>
  screen(route).tree.find((entry) => entry.ownText === text) ?? fail(`missing text ${route} ${text}`);
const byAria = (route, ariaLabel) =>
  screen(route).tree.find((entry) => entry.ariaLabel === ariaLabel) ??
  fail(`missing aria label ${route} ${ariaLabel}`);
const px = (value) => {
  const match = /^(-?[\d.]+)px$/.exec(value ?? "");
  return match ? Number(match[1]) : 0;
};
const rgba = (value) => {
  const match =
    /^rgba?\(\s*([\d.]+)[,\s]+([\d.]+)[,\s]+([\d.]+)(?:[,/\s]+([\d.]+))?\s*\)$/.exec(
      value ?? "",
    );
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
      color: rgba(match[1]),
      offset: { x: Number(match[2]), y: Number(match[3]) },
      radius: Number(match[4]),
      spread: Number(match[5]),
    });
  }
  if (result.length === 0) fail(`unsupported box shadow ${value}`);
  return result;
};
const relRect = (entry, rootRect) => ({
  x: entry.rect.x - rootRect.x,
  y: entry.rect.y - rootRect.y,
  width: entry.rect.width,
  height: entry.rect.height,
});
const textSpec = (route, text, rootRect) => {
  const entry = byText(route, text);
  const computed = style(entry);
  return {
    text,
    rect: relRect(entry, rootRect),
    fontFamily: computed.fontFamily,
    fontSize: px(computed.fontSize),
    fontWeight: Number(computed.fontWeight),
    lineHeight: px(computed.lineHeight),
    letterSpacing: computed.letterSpacing === "normal" ? 0 : px(computed.letterSpacing),
    color: rgba(computed.color),
  };
};

const routes = {
  default: { route: "/settings", menuPath: "body.1.0.0.0.0.1.0" },
  home: { route: "/archive", menuPath: "body.1.0.0.0.0.1.1" },
  youtube: { route: "/analytics/youtube", menuPath: "body.1.0.0.0.0.1.1" },
};
const defaultMenu = node(routes.default.route, routes.default.menuPath);
const rootRect = defaultMenu.rect;
const menuStyle = style(defaultMenu);
const rowNodes = screen(routes.default.route).tree.filter(
  (entry) => entry.parentPath === routes.default.menuPath,
);
if (rowNodes.length !== 7) fail(`expected 7 direct menu rows, got ${rowNodes.length}`);

const iconForText = (route, text) => {
  const label = byText(route, text);
  const parent = node(route, label.parentPath);
  const icon = screen(route).tree.find(
    (entry) => entry.parentPath === parent.path && entry.rect.width === 20 && entry.rect.height === 20,
  );
  if (!icon) fail(`missing 20px icon beside ${text}`);
  const computed = style(icon);
  return {
    rect: relRect(icon, rootRect),
    asset: computed.maskImage.replace(/^url\(["']?/, "").replace(/["']?\)$/, ""),
    color: rgba(computed.backgroundColor),
    opacity: Number(computed.opacity),
  };
};
const rowRect = (index) => relRect(rowNodes[index], rootRect);
const simpleRow = (key, index, text) => {
  const actionStyle = style(node(routes.default.route, `${routes.default.menuPath}.${index}.0.0`));
  return {
    kind: "simple",
    key,
    rect: rowRect(index),
    label: textSpec(routes.default.route, text, rootRect),
    icon: iconForText(routes.default.route, text),
    radius: px(actionStyle.borderTopLeftRadius),
    padding: {
      top: px(actionStyle.paddingTop),
      right: px(actionStyle.paddingRight),
      bottom: px(actionStyle.paddingBottom),
      left: px(actionStyle.paddingLeft),
    },
  };
};
const compoundRow = (key, index, text, ariaLabel) => {
  const label = byText(routes.default.route, text);
  const icon = iconForText(routes.default.route, text);
  const main = node(routes.default.route, label.parentPath.replace(/\.\d+$/, ""));
  const add = byAria(routes.default.route, ariaLabel);
  const addStyle = style(add);
  const outerStyle = style(node(routes.default.route, `${routes.default.menuPath}.${index}.0.0`));
  return {
    kind: "compound",
    key,
    rect: rowRect(index),
    label: textSpec(routes.default.route, text, rootRect),
    icon,
    mainRect: relRect(main, rootRect),
    addRect: relRect(add, rootRect),
    addRadius: px(addStyle.borderTopLeftRadius),
    addBackground: rgba(addStyle.backgroundColor),
    radius: px(outerStyle.borderTopLeftRadius),
    gap: px(outerStyle.gap),
    padding: {
      top: px(outerStyle.paddingTop),
      right: px(outerStyle.paddingRight),
      bottom: px(outerStyle.paddingBottom),
      left: px(outerStyle.paddingLeft),
    },
    ariaLabel,
  };
};

const betaNode = byText(routes.default.route, "BETA");
const betaStyle = style(betaNode);
const sectionNode = byText(routes.default.route, "Analytics");
const sectionStyle = style(sectionNode);
const sectionRowStyle = style(rowNodes[5]);
const candidate = fixture.componentCandidateAudit.repeatedSubtreesByContext[contextName].find(
  (entry) => entry.id === "subtree-7fba13f6a8a4",
);
if (!candidate || candidate.nodeCount !== 47 || candidate.routeCount !== 10) {
  fail("measured repeated sidebar candidate changed; inspect before regenerating Figma");
}

const headerCandidates = ["subtree-bf514c7b7b96", "subtree-e4dcecc90d80"].map((id) =>
  fixture.componentCandidateAudit.repeatedSubtreesByContext[contextName].find((entry) => entry.id === id),
);
if (
  !headerCandidates[0] ||
  headerCandidates[0].nodeCount !== 59 ||
  headerCandidates[0].routeCount !== 6 ||
  !headerCandidates[1] ||
  headerCandidates[1].nodeCount !== 59 ||
  headerCandidates[1].routeCount !== 4
) {
  fail("measured Gnb header variant candidates changed; inspect before regenerating Figma");
}
const headerPath = "body.1.0.0.0";
const headerNodes = (route) =>
  screen(route).tree.filter((entry) => entry.path === headerPath || entry.path.startsWith(`${headerPath}.`));
const headerDefault = headerNodes("/settings");
const headerCurrent = headerNodes("/mypage/upgrade");
if (headerDefault.length !== 59 || headerCurrent.length !== 59) fail("expected two 59-node Gnb headers");
const headerDiffs = [];
for (let index = 0; index < headerDefault.length; index += 1) {
  const left = headerDefault[index];
  const right = headerCurrent[index];
  const sameStructure =
    left.path === right.path &&
    left.tag === right.tag &&
    left.ownText === right.ownText &&
    JSON.stringify(left.rect) === JSON.stringify(right.rect);
  if (!sameStructure) fail(`Gnb header structure changed at node ${index}`);
  if (left.styleRef !== right.styleRef) headerDiffs.push(left.path.slice(headerPath.length));
}
if (JSON.stringify(headerDiffs) !== JSON.stringify([".0.2.0.0", ".0.2.0.0.0"])) {
  fail(`Gnb header variants differ outside measured Upgrade CTA: ${headerDiffs.join(", ")}`);
}
const upgradeButtonPath = `${headerPath}.0.2.0.0`;
const upgradeLabelPath = `${upgradeButtonPath}.0`;
const upgradeSpec = (route, state) => {
  const button = node(route, upgradeButtonPath);
  const label = node(route, upgradeLabelPath);
  const buttonStyle = style(button);
  const labelStyle = style(label);
  return {
    state,
    route,
    rect: { width: button.rect.width, height: button.rect.height },
    padding: {
      top: px(buttonStyle.paddingTop),
      right: px(buttonStyle.paddingRight),
      bottom: px(buttonStyle.paddingBottom),
      left: px(buttonStyle.paddingLeft),
    },
    gap: px(buttonStyle.gap),
    radius: px(buttonStyle.borderTopLeftRadius),
    fill: rgba(buttonStyle.backgroundColor),
    color: rgba(labelStyle.color),
    effects: shadows(buttonStyle.boxShadow),
    label: {
      text: label.ownText,
      rect: relRect(label, button.rect),
      fontFamily: labelStyle.fontFamily,
      fontSize: px(labelStyle.fontSize),
      fontWeight: Number(labelStyle.fontWeight),
      lineHeight: px(labelStyle.lineHeight),
      letterSpacing: px(labelStyle.letterSpacing),
    },
  };
};
const brandCandidate = fixture.componentCandidateAudit.repeatedSubtreesByContext[contextName].find(
  (entry) => entry.id === "subtree-08a5cfbcf527",
);
if (!brandCandidate || brandCandidate.nodeCount !== 6 || brandCandidate.routeCount !== 12) {
  fail("measured Gnb brand candidate changed; inspect before regenerating Figma");
}
const navNode = node("/settings", `${headerPath}.0`);
const brandNode = node("/settings", `${headerPath}.0.0`);
const brandImage = node("/settings", `${headerPath}.0.0.0.0.0.0.0`);
const headerNode = node("/settings", headerPath);
const headerStyle = style(headerNode);
const brandStyle = style(brandNode);
const shellSpec = {
  id: "product/gnb-desktop-shell",
  componentSetName: "Product/Gnb Desktop Shell",
  sourceCandidates: [brandCandidate, ...headerCandidates],
  root: {
    width: headerNode.rect.width,
    height: headerNode.rect.height,
    padding: {
      top: px(headerStyle.paddingTop),
      right: px(headerStyle.paddingRight),
      bottom: px(headerStyle.paddingBottom),
      left: px(headerStyle.paddingLeft),
    },
    background: rgba(headerStyle.backgroundColor),
  },
  nav: relRect(navNode, headerNode.rect),
  brand: {
    rect: relRect(brandNode, headerNode.rect),
    paddingLeft: px(brandStyle.paddingLeft),
    gap: px(brandStyle.gap),
    image: {
      rect: relRect(brandImage, headerNode.rect),
      asset: brandImage.src,
      darkAsset: "/klipse-dark.svg",
      darkAssetSource: sourceQuote(
        "apps/web/components/ui/BrandLogo.tsx",
        97,
        '        src="/klipse-dark.svg"',
      ),
    },
  },
  menu: relRect(defaultMenu, headerNode.rect),
  upgradeCta: relRect(node("/settings", upgradeButtonPath), headerNode.rect),
  variants: [
    { current: "Default", route: "/settings", menuCurrent: "Default", ctaState: "Current" },
    { current: "Home", route: "/archive", menuCurrent: "Home", ctaState: "Current" },
    { current: "NodeCanvas", route: "/nodecanvas", menuCurrent: "NodeCanvas", ctaState: "Current" },
    { current: "VideoEditor", route: "/videoeditor", menuCurrent: "VideoEditor", ctaState: "Current" },
    { current: "Highlight", route: "/highlight", menuCurrent: "Highlight", ctaState: "Current" },
    { current: "YouTube", route: "/analytics/youtube", menuCurrent: "YouTube", ctaState: "Current" },
    { current: "Upgrade", route: "/mypage/upgrade", menuCurrent: "Default", ctaState: "Current" },
  ],
};
const resultSectionPath = "body.1.0.0.1.1";
const contextScreens = fixture.screens;
const resultNode = (context, route, path) =>
  contextScreens[context]?.[route]?.tree.find((entry) => entry.path === path) ??
  fail(`missing result node ${context} ${route} ${path}`);
const resultText = (entry, rootRect) => {
  const computed = style(entry);
  return {
    text: entry.ownText,
    rect: relRect(entry, rootRect),
    fontFamily: computed.fontFamily,
    fontSize: px(computed.fontSize),
    fontWeight: Number(computed.fontWeight),
    lineHeight: px(computed.lineHeight),
    letterSpacing: computed.letterSpacing === "normal" ? 0 : px(computed.letterSpacing),
    color: rgba(computed.color),
    textAlign: computed.textAlign,
  };
};
const paymentResultSpec = (context, route, outcome, viewport) => {
  const root = resultNode(context, route, resultSectionPath);
  const rootStyle = style(root);
  const failure = outcome === "Failure";
  const buttonPath = `${resultSectionPath}.${failure ? 3 : 2}.0`;
  const button = resultNode(context, route, buttonPath);
  const buttonStyle = style(button);
  const spec = {
    outcome,
    viewport,
    route,
    rect: { width: root.rect.width, height: root.rect.height },
    gap: px(rootStyle.gap),
    background: rgba(rootStyle.backgroundColor),
    title: resultText(resultNode(context, route, `${resultSectionPath}.0`), root.rect),
    body: resultText(resultNode(context, route, `${resultSectionPath}.1`), root.rect),
    action: {
      rect: relRect(button, root.rect),
      radius: px(buttonStyle.borderTopLeftRadius),
      padding: {
        top: px(buttonStyle.paddingTop),
        right: px(buttonStyle.paddingRight),
        bottom: px(buttonStyle.paddingBottom),
        left: px(buttonStyle.paddingLeft),
      },
      fill: rgba(buttonStyle.backgroundColor),
      label: resultText(button, root.rect),
    },
  };
  if (failure) {
    const detail = resultNode(context, route, `${resultSectionPath}.2.0`);
    const detailStyle = style(detail);
    spec.detail = {
      rect: relRect(detail, root.rect),
      direction: detailStyle.flexDirection,
      alignItems: detailStyle.alignItems,
      justifyContent: detailStyle.justifyContent,
      gap: px(detailStyle.gap),
      padding: {
        top: px(detailStyle.paddingTop),
        right: px(detailStyle.paddingRight),
        bottom: px(detailStyle.paddingBottom),
        left: px(detailStyle.paddingLeft),
      },
      term: resultText(resultNode(context, route, `${resultSectionPath}.2.0.0`), root.rect),
      value: resultText(resultNode(context, route, `${resultSectionPath}.2.0.1`), root.rect),
    };
  }
  return spec;
};
const repeatedCandidates = fixture.componentCandidateAudit.repeatedSubtreesByContext;
const resultCandidateIds = ["subtree-eca01d4c1ecf", "subtree-6431e73e726b", "subtree-d1aea0da5d0f"];
const resultCandidates = resultCandidateIds.map(
  (id) =>
    repeatedCandidates[contextName].find((entry) => entry.id === id) ??
    repeatedCandidates["mobile-402x874"].find((entry) => entry.id === id),
);
if (
  !resultCandidates[0] ||
  resultCandidates[0].nodeCount !== 9 ||
  !resultCandidates[1] ||
  resultCandidates[1].nodeCount !== 9 ||
  !resultCandidates[2] ||
  resultCandidates[2].nodeCount !== 5
) {
  fail("measured payment-result candidates changed; inspect before regenerating Figma");
}
const paymentResult = {
  id: "product/payment-result-content",
  sectionName: "J · product/Payment result · measured component",
  componentSetName: "Product/Payment Result Content",
  sourceCandidates: resultCandidates,
  variants: [
    paymentResultSpec(contextName, "/mypage/upgrade/billing-change-fail", "Failure", "Desktop"),
    paymentResultSpec("mobile-402x874", "/mypage/upgrade/billing-change-fail", "Failure", "Mobile"),
    paymentResultSpec(contextName, "/mypage/upgrade/billing-change-success", "PlanDelayed", "Desktop"),
    paymentResultSpec("mobile-402x874", "/mypage/upgrade/billing-change-success", "PlanDelayed", "Mobile"),
    paymentResultSpec(contextName, "/mypage/topup/success", "TopupDelayed", "Desktop"),
    paymentResultSpec("mobile-402x874", "/mypage/topup/success", "TopupDelayed", "Mobile"),
  ],
};

const plan = {
  $comment: "Generated from migration/product.auth-fixture.json. Do not edit by hand.",
  $evidenceClass: "product-only measured Figma candidate; not a normative design-system contract",
  productCommit: fixture.productCommit,
  context: contextName,
  sourceCandidate: candidate,
  component: {
    id: "product/gnb-sidebar-menu",
    pageId: "240:3529",
    pageName: "90 · ASSETS — 출처별 (logo · tile · icon · root · .glyph · .authored)",
    sectionName: "I · product/Gnb sidebar · measured component",
    componentSetName: "Product/Gnb Sidebar Menu",
    root: {
      width: rootRect.width,
      height: rootRect.height,
      gap: px(menuStyle.gap),
      background: rgba(menuStyle.backgroundColor),
    },
    variants: [
      { current: "Default", route: routes.default.route, activeRow: null },
      {
        current: "Home",
        route: routes.home.route,
        activeRow: "Home",
        activeColor: rgba(style(byText(routes.home.route, "Home")).color),
        activeIconOpacity: iconForText(routes.home.route, "Home").opacity,
      },
      {
        current: "YouTube",
        route: routes.youtube.route,
        activeRow: "YouTube analytics",
        activeColor: rgba(style(byText(routes.youtube.route, "YouTube analytics")).color),
        activeIconOpacity: iconForText(routes.youtube.route, "YouTube analytics").opacity,
      },
      {
        current: "NodeCanvas",
        route: "/nodecanvas",
        activeRow: "NodeCanvas",
        activeColor: rgba(style(byText(routes.home.route, "Home")).color),
        activeIconOpacity: iconForText(routes.home.route, "Home").opacity,
        $note: "No new visual value: Gnb.tsx:4605-4606 applies the common isSidebarMenuHrefActive result and Gnb.tsx:513/519 supplies the shared inactive/active colours at pinned commit a3ed8e031214f67ac319c5ceaa7ad2808cf0d3a4.",
      },
      {
        current: "VideoEditor",
        route: "/videoeditor",
        activeRow: "VideoEditor",
        activeColor: rgba(style(byText(routes.home.route, "Home")).color),
        activeIconOpacity: iconForText(routes.home.route, "Home").opacity,
        $note: "No new visual value: Gnb.tsx:4605-4606 applies the common isSidebarMenuHrefActive result and Gnb.tsx:513/519 supplies the shared inactive/active colours at pinned commit a3ed8e031214f67ac319c5ceaa7ad2808cf0d3a4.",
      },
      {
        current: "Highlight",
        route: "/highlight",
        activeRow: "Highlight",
        activeColor: rgba(style(byText(routes.home.route, "Home")).color),
        activeIconOpacity: iconForText(routes.home.route, "Home").opacity,
        $note: "No new visual value: Gnb.tsx:4605-4606 applies the common isSidebarMenuHrefActive result and Gnb.tsx:513/519 supplies the shared inactive/active colours at pinned commit a3ed8e031214f67ac319c5ceaa7ad2808cf0d3a4.",
      },
    ],
    rows: [
      simpleRow("search", 0, "Search"),
      simpleRow("home", 1, "Home"),
      compoundRow("node-canvas", 2, "NodeCanvas", "New project (open canvas)"),
      compoundRow("video-editor", 3, "VideoEditor", "New project (video edit)"),
      {
        ...simpleRow("highlight", 4, "Highlight"),
        kind: "highlight",
        beta: {
          rect: relRect(betaNode, rootRect),
          label: {
            ...textSpec(routes.default.route, "BETA", rootRect),
            rect: {
              x: betaNode.rect.x - rootRect.x + px(betaStyle.paddingLeft),
              y: betaNode.rect.y - rootRect.y + px(betaStyle.paddingTop),
              width: betaNode.rect.width - px(betaStyle.paddingLeft) - px(betaStyle.paddingRight),
              height: betaNode.rect.height - px(betaStyle.paddingTop) - px(betaStyle.paddingBottom),
            },
          },
          radius: px(betaStyle.borderTopLeftRadius),
          background: rgba(betaStyle.backgroundColor),
          padding: {
            top: px(betaStyle.paddingTop),
            right: px(betaStyle.paddingRight),
            bottom: px(betaStyle.paddingBottom),
            left: px(betaStyle.paddingLeft),
          },
        },
      },
      {
        kind: "section-label",
        key: "analytics",
        rect: rowRect(5),
        label: textSpec(routes.default.route, "Analytics", rootRect),
        padding: {
          top: px(sectionRowStyle.paddingTop),
          right: px(sectionRowStyle.paddingRight),
          bottom: px(sectionRowStyle.paddingBottom),
          left: px(sectionStyle.paddingLeft),
        },
      },
      simpleRow("youtube", 6, "YouTube analytics"),
    ],
    bindings: {
      paletteCollection: "1 · Palette",
      paletteMode: "default",
      ctaPaletteMode: "sidebar",
      semanticCollection: "2 · Semantic",
      semanticMode: "dark",
      inactive: { collection: "2 · Semantic", name: "gray/300" },
      active: { collection: "2 · Semantic", name: "gray/000" },
      activeIndicator: { collection: "1 · Palette", name: "palette/gray-800" },
      createButtonBackground: { collection: "1 · Palette", name: "palette/gray-200" },
      betaBackground: { collection: "2 · Semantic", name: "app/nav-chip-tint" },
      muted: { collection: "1 · Palette", name: "palette/gray-600" },
      spacing4: { collection: "Klipse Primitive", name: "spacing/4" },
      spacing8: { collection: "Klipse Primitive", name: "spacing/8" },
      spacing10: { collection: "Klipse Primitive", name: "spacing/10" },
      spacing12: { collection: "Klipse Primitive", name: "spacing/12" },
      radius6: { collection: "Klipse Primitive", name: "radius/6" },
      radius10: { collection: "Klipse Primitive", name: "radius/10" },
      radius12: { collection: "Klipse Primitive", name: "radius/12" },
      spacing14: { collection: "Klipse Primitive", name: "spacing/14" },
      spacing16: { collection: "Klipse Primitive", name: "spacing/16" },
      spacing20: { collection: "Klipse Primitive", name: "spacing/20" },
      spacing24: { collection: "Klipse Primitive", name: "spacing/24" },
      surfaceStrong: { collection: "1 · Palette", name: "palette/gray-900" },
      surfaceInverse: { collection: "1 · Palette", name: "palette/gray-100" },
      textSecondary: { collection: "2 · Semantic", name: "gray/000 · a56" },
      textTertiary: { collection: "2 · Semantic", name: "gray/000 · a48" },
    },
    iconComponents: {
      "/icons/MagnifyingGlass.svg": "icon/MagnifyingGlass",
      "/icons/House.svg": "icon/House",
      "/icons/Graph.svg": "icon/Graph",
      "/icons/MagicWand.svg": "icon/MagicWand",
      "/highlight_symbol.svg": "root/highlight_symbol",
      "/icons/youtube.svg": "icon/youtube",
      "/klipse-light.svg": "logo/klipse-light (291×85 · 라이트 서피스용 · 워드마크 black)",
      "/klipse-dark.svg": "logo/klipse-dark (291×85 · 다크 서피스용 · 워드마크 white)",
      plus: ".glyph/NavPlusGlyph",
    },
    darkThemeSource: {
      inactive: sourceQuote(
        "apps/web/components/navigation/Gnb.tsx",
        513,
        '    "[.gnb-menuSidebar_.gnb-menuLink:not(&)]:[color:var(--gray-300)]",',
      ),
      active: sourceQuote(
        "apps/web/components/navigation/Gnb.tsx",
        519,
        '    "[color:var(--gray-000)]",',
      ),
      activeIndicator: sourceQuote(
        "apps/web/components/navigation/Gnb.tsx",
        523,
        '    "[html[data-theme=dark]_&]:[background-color:var(--palette-gray-800)]",',
      ),
    },
    upgradeCta: {
      id: "product/gnb-upgrade-cta",
      componentSetName: "Product/Gnb Upgrade CTA",
      sourceCandidates: headerCandidates,
      variants: [upgradeSpec("/settings", "Default"), upgradeSpec("/mypage/upgrade", "Current")],
    },
    shell: shellSpec,
    paymentResult,
  },
};

const candidateSummary = ({ id, nodeCount, routeCount, occurrenceCount, score }) => ({
  id,
  nodeCount,
  routeCount,
  occurrenceCount,
  score,
});
const runnerPlan = structuredClone(plan);
delete runnerPlan.$comment;
delete runnerPlan.$evidenceClass;
delete runnerPlan.component.darkThemeSource;
delete runnerPlan.component.shell.brand.image.darkAssetSource;
for (const variant of runnerPlan.component.variants) {
  delete variant.$note;
  delete variant.activeColor;
  delete variant.route;
}
runnerPlan.sourceCandidate = candidateSummary(plan.sourceCandidate);
delete runnerPlan.component.upgradeCta.sourceCandidates;
delete runnerPlan.component.shell.sourceCandidates;
delete runnerPlan.component.paymentResult.sourceCandidates;
const runnerSource = readFileSync(
  resolve(repoRoot, "scripts/templates/figma-product-components-renderer.js"),
  "utf8",
)
  .split("\n")
  .map((line) => line.trimStart())
  .filter((line) => line.length > 0)
  .join("\n");
const draw = `// Generated by scripts/build-figma-product-components.mjs. Do not edit by hand.\n` +
  `// Pass this file verbatim to use_figma. It creates only missing measured product components.\n` +
  `const PLAN=${JSON.stringify(runnerPlan)};\n` +
  runnerSource;
const payload = `${JSON.stringify(plan, null, 2)}\n`;
const expected = [
  { absolute: planPath, expected: payload },
  { absolute: drawPath, expected: draw },
];

if (checkOnly) {
  for (const entry of expected) {
    let current = "";
    try {
      current = readFileSync(entry.absolute, "utf8");
    } catch {
      fail(`missing generated output ${entry.absolute.slice(repoRoot.length + 1)}`);
    }
    if (current !== entry.expected) fail(`generated output drift: ${entry.absolute.slice(repoRoot.length + 1)}`);
  }
} else {
  atomicWriteBatch(expected);
}

console.log(
  `[figma-product-components] ${checkOnly ? "checked" : "built"} @ ${fixture.productCommit.slice(0, 8)}: ` +
    `${plan.component.variants.length + plan.component.upgradeCta.variants.length + plan.component.shell.variants.length + plan.component.paymentResult.variants.length} variants · ` +
    `${plan.component.rows.length} menu rows · ${candidate.nodeCount + 2 + brandCandidate.nodeCount} Gnb measured nodes · ` +
    `result candidates ${resultCandidates.map((entry) => entry.nodeCount).join("/")} nodes · ` +
    `${candidate.routeCount} sidebar routes + ${headerCandidates[0].routeCount}/${headerCandidates[1].routeCount} header routes`,
);
