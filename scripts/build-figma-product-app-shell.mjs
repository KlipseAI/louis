import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { atomicWriteBatch } from "./lib/atomic-output.mjs";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const fixturePath = resolve(repoRoot, "migration/product.auth-fixture.json");
const planPath = resolve(repoRoot, "figma/product-app-shell.plan.json");
const drawPath = resolve(repoRoot, "figma/product-app-shell.draw.js");
const templatePath = resolve(repoRoot, "scripts/templates/figma-product-app-shell-renderer.js");
const checkOnly = process.argv.includes("--check");
const fixture = JSON.parse(readFileSync(fixturePath, "utf8"));
const productRoot = process.env.KLIPSE_PRODUCT_REPO ?? "/Users/sejunki/klipse-web";
const context = "mobile-402x874";
const screens = fixture.screens[context];
const styles = new Map(fixture.computedStyles.map((entry) => [entry.id, entry.value]));
// Measured in the target Figma file with Pretendard Medium 14px, 21px line height,
// -0.14px letter spacing. These bounds prevent Figma's glyph metrics from clipping the
// narrower browser DOM rectangles; they do not replace any product geometry.
const figmaGlyphBounds = {
  Home: { width: 38, height: 21 },
  Settings: { width: 52, height: 21 },
  Analytics: { width: 58, height: 21 },
  "/": { width: 5, height: 21 },
  "YouTube analytics": { width: 114, height: 21 },
  "My Page": { width: 55, height: 21 },
  Subscription: { width: 79, height: 21 },
  "Change plan": { width: 79, height: 21 },
};
const desktopFigmaGlyphBounds = {
  Home: { width: 43, height: 24 },
  Settings: { width: 60, height: 24 },
  Analytics: { width: 66, height: 24 },
  "/": { width: 6, height: 24 },
  "YouTube analytics": { width: 130, height: 24 },
  "My Page": { width: 63, height: 24 },
  Subscription: { width: 91, height: 24 },
  "Change plan": { width: 90, height: 24 },
};

const fail = (message) => {
  throw new Error(`[figma-product-app-shell] ${message}`);
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
const px = (value) => {
  const match = /^(-?[\d.]+)px$/.exec(value ?? "");
  return match ? Number(match[1]) : 0;
};
const color = (value) => {
  const rgb =
    /^rgba?\(\s*([\d.]+)[,\s]+([\d.]+)[,\s]+([\d.]+)(?:[,/\s]+([\d.]+%?))?\s*\)$/.exec(
      value ?? "",
    );
  if (rgb) {
    const alpha = rgb[4] === undefined
      ? 1
      : rgb[4].endsWith("%") ? Number(rgb[4].slice(0, -1)) / 100 : Number(rgb[4]);
    return [
      Number(rgb[1]) / 255,
      Number(rgb[2]) / 255,
      Number(rgb[3]) / 255,
      alpha,
    ];
  }
  const srgb =
    /^color\(srgb\s+([\d.]+)\s+([\d.]+)\s+([\d.]+)(?:\s*\/\s*([\d.]+%?))?\)$/.exec(
      value ?? "",
    );
  if (srgb) {
    const alpha = srgb[4] === undefined
      ? 1
      : srgb[4].endsWith("%") ? Number(srgb[4].slice(0, -1)) / 100 : Number(srgb[4]);
    return [
      Number(srgb[1]),
      Number(srgb[2]),
      Number(srgb[3]),
      alpha,
    ];
  }
  const hex = /^#([\da-f]{2})([\da-f]{2})([\da-f]{2})$/i.exec(value ?? "");
  if (hex) return [Number.parseInt(hex[1], 16) / 255, Number.parseInt(hex[2], 16) / 255, Number.parseInt(hex[3], 16) / 255, 1];
  fail(`unsupported color ${value}`);
};
const relRect = (entry, rootRect) => ({
  x: entry.rect.x - rootRect.x,
  y: entry.rect.y - rootRect.y,
  width: entry.rect.width,
  height: entry.rect.height,
});
const textSpec = (entry, rootRect, glyphBounds = figmaGlyphBounds) => {
  const computed = style(entry);
  const figmaBounds = glyphBounds[entry.ownText] ?? fail(`missing Figma glyph bounds ${entry.ownText}`);
  return {
    text: entry.ownText,
    rect: relRect(entry, rootRect),
    fontSize: px(computed.fontSize),
    fontWeight: Number(computed.fontWeight),
    lineHeight: px(computed.lineHeight),
    letterSpacing: computed.letterSpacing === "normal" ? 0 : px(computed.letterSpacing),
    color: color(computed.color),
    figmaBounds,
  };
};
const profileVisualSpec = (screenRecord, profileButton, rootRect) => {
  const glyphs = screenRecord.tree.filter(
    (entry) => entry.tag === "path" && entry.path.startsWith(`${profileButton.path}.`),
  );
  if (glyphs.length !== 1) fail(`expected one default-avatar glyph under ${profileButton.path}, got ${glyphs.length}`);
  const probe = screenRecord.pseudoElementProbes?.profileRing ?? fail(`missing profile-ring probe ${profileButton.path}`);
  if (JSON.stringify(probe.buttonRect) !== JSON.stringify(profileButton.rect) || !probe.avatarRect) {
    fail(`profile-ring probe no longer matches ${profileButton.path}`);
  }
  const ringRect = {
    x: probe.buttonRect.x - rootRect.x,
    y: probe.buttonRect.y - rootRect.y,
    width: px(probe.afterStyle.width),
    height: px(probe.afterStyle.height),
  };
  const avatarRect = {
    x: probe.avatarRect.x - rootRect.x,
    y: probe.avatarRect.y - rootRect.y,
    width: probe.avatarRect.width,
    height: probe.avatarRect.height,
  };
  return {
    avatar: {
      rect: avatarRect,
      color: color(style(glyphs[0]).fill),
      asset: ".glyph/UserCircleDefaultAvatar",
    },
    ring: {
      rect: ringRect,
      width: px(probe.customProperties["--profile-ring-width"]),
      gap: px(probe.customProperties["--profile-ring-gap"]),
      progress: Number.parseFloat(probe.customProperties["--profile-ring-progress"]),
      fill: color(probe.customProperties["--profile-ring-fill"]),
      track: color(probe.customProperties["--profile-ring-track"]),
      radius: px(probe.afterStyle.borderTopLeftRadius),
      backgroundImage: probe.afterStyle.backgroundImage,
      maskImage: probe.afterStyle.maskImage,
      figmaMapping: "0% conic ring as a 2px INSIDE ellipse stroke",
    },
  };
};
const assertProfileVisual = (spec) => {
  const visual = spec.profileVisual;
  const control = spec.controls.profile;
  if (
    control.width !== 36 || control.height !== 36 ||
    visual.avatar.rect.x - control.x !== 4 || visual.avatar.rect.y - control.y !== 4 ||
    visual.avatar.rect.width !== 28 || visual.avatar.rect.height !== 28 ||
    JSON.stringify(visual.avatar.color) !== JSON.stringify([213 / 255, 215 / 255, 221 / 255, 1]) ||
    visual.ring.rect.x !== control.x || visual.ring.rect.y !== control.y ||
    visual.ring.rect.width !== 36 || visual.ring.rect.height !== 36 ||
    visual.ring.width !== 2 || visual.ring.gap !== 2 || visual.ring.progress !== 0 ||
    JSON.stringify(visual.ring.fill) !== JSON.stringify([0, 198 / 255, 142 / 255, 1]) ||
    JSON.stringify(visual.ring.track) !== JSON.stringify([0, 0, 0, 0.2]) ||
    visual.ring.figmaMapping !== "0% conic ring as a 2px INSIDE ellipse stroke"
  ) fail(`profile visual drift ${spec.route}`);
};

const candidates = fixture.componentCandidateAudit.repeatedSubtreesByContext[context];
const candidateContracts = [
  ["subtree-80b5c31c3514", 5, 12],
  ["subtree-2c2025d948a9", 14, 4],
  ["subtree-9fb50e18369c", 13, 4],
].map(([id, nodeCount, routeCount]) => {
  const candidate = candidates.find((entry) => entry.id === id);
  if (!candidate || candidate.nodeCount !== nodeCount || candidate.routeCount !== routeCount) {
    fail(`measured mobile top-bar candidate ${id} changed; inspect before regenerating Figma`);
  }
  return candidate;
});

const variantInputs = [
  {
    width: "Full",
    breadcrumb: "Single",
    back: false,
    divider: false,
    route: "/archive",
    rootPath: "body.1.0.0.1.0.0.0.0",
  },
  {
    width: "Full",
    breadcrumb: "Single",
    back: false,
    divider: true,
    route: "/settings",
    rootPath: "body.1.0.0.1.0.0.0",
  },
  {
    width: "Full",
    breadcrumb: "Trail",
    back: false,
    divider: true,
    route: "/analytics/youtube",
    rootPath: "body.1.0.0.1.0.0.0.0",
  },
  {
    width: "Inset",
    breadcrumb: "Single",
    back: false,
    divider: true,
    route: "/mypage/topup/fail",
    rootPath: "body.1.0.0.1.0.0",
  },
  {
    width: "Inset",
    breadcrumb: "Trail",
    back: false,
    divider: true,
    route: "/mypage/upgrade/billing-success",
    rootPath: "body.1.0.0.1.0.0",
  },
  {
    width: "Inset",
    breadcrumb: "Trail",
    back: true,
    divider: true,
    route: "/mypage/upgrade",
    rootPath: "body.1.0.0.1.0.0.0.0",
  },
];

const topBarSpec = (input) => {
  const root = node(input.route, input.rootPath);
  const rootStyle = style(root);
  const direct = screen(input.route).tree.filter((entry) => entry.parentPath === input.rootPath);
  const nav = direct.find((entry) => entry.tag === "nav" && entry.ariaLabel === "Breadcrumb");
  const leading = direct.find((entry) => entry.tag === "div" && entry.rect.x < nav.rect.x);
  const profile = direct.find((entry) => entry.tag === "div" && entry.rect.x > nav.rect.x);
  if (!nav || !leading || !profile || direct.length !== 3) fail(`unexpected top-bar structure ${input.route}`);
  const menu = screen(input.route).tree.find(
    (entry) => entry.ariaLabel === "Open navigation menu" && entry.path.startsWith(`${leading.path}.`),
  );
  const profileButton = screen(input.route).tree.find(
    (entry) => entry.ariaLabel === "Open profile" && entry.path.startsWith(`${profile.path}.`),
  );
  const backButton = screen(input.route).tree.find(
    (entry) => entry.ariaLabel === "Back to subscription" && entry.path.startsWith(`${leading.path}.`),
  );
  if (!menu || !profileButton || Boolean(backButton) !== input.back) {
    fail(`unexpected top-bar controls ${input.route}`);
  }
  const textNodes = screen(input.route).tree.filter(
    (entry) => entry.ownText && entry.path.startsWith(`${nav.path}.`),
  );
  if (textNodes.length !== (input.breadcrumb === "Single" ? 1 : 3)) {
    fail(`unexpected breadcrumb ${input.route}`);
  }
  return {
    ...input,
    rect: { width: root.rect.width, height: root.rect.height },
    gap: px(rootStyle.gap),
    padding: {
      top: px(rootStyle.paddingTop),
      right: px(rootStyle.paddingRight),
      bottom: px(rootStyle.paddingBottom),
      left: px(rootStyle.paddingLeft),
    },
    fill: color(rootStyle.backgroundColor),
    dividerColor: color(rootStyle.borderBottomColor),
    leading: relRect(leading, root.rect),
    nav: relRect(nav, root.rect),
    profile: relRect(profile, root.rect),
    controls: {
      menu: relRect(menu, root.rect),
      back: backButton ? relRect(backButton, root.rect) : null,
      profile: relRect(profileButton, root.rect),
    },
    profileVisual: profileVisualSpec(screen(input.route), profileButton, root.rect),
    text: textNodes.map((entry) => textSpec(entry, root.rect)),
  };
};
const mobileSidebarProbe = screens["/settings"].vectorControlProbes?.navigationOpen;
if (
  !mobileSidebarProbe ||
  mobileSidebarProbe.svgRect.width !== 20 ||
  mobileSidebarProbe.groups?.[0]?.transform !== "matrix(1, 0, 0, 1, 0, 0)"
) {
  fail("measured mobile sidebar SVG transform changed; inspect before regenerating Figma");
}

const desktopCandidates = fixture.componentCandidateAudit.repeatedSubtreesByContext["desktop-1920x1080"];
const desktopCandidateContracts = [
  ["subtree-53fc052b1377", 5, 12],
  ["subtree-dadf2a2fbd77", 14, 4],
  ["subtree-66d7e03eea07", 13, 4],
  ["subtree-8a189a16b13a", 16, 3],
  ["subtree-36775db94d9d", 15, 3],
  ["subtree-5293ac01577e", 5, 3],
].map(([id, nodeCount, routeCount]) => {
  const candidate = desktopCandidates.find((entry) => entry.id === id);
  if (!candidate || candidate.nodeCount !== nodeCount || candidate.routeCount !== routeCount) {
    fail(`measured desktop top-bar candidate ${id} changed; inspect before regenerating Figma`);
  }
  return candidate;
});
const desktopVariantInputs = [
  { content: "Home", breadcrumb: "Single", back: false, divider: false, route: "/archive", rootPath: "body.1.0.0.1.0.0.0.0" },
  { content: "Settings", breadcrumb: "Single", back: false, divider: true, route: "/settings", rootPath: "body.1.0.0.1.0.0.0" },
  { content: "Analytics", breadcrumb: "Trail", back: false, divider: true, route: "/analytics/youtube", rootPath: "body.1.0.0.1.0.0.0.0" },
  { content: "MyPage", breadcrumb: "Single", back: false, divider: true, route: "/mypage/topup/fail", rootPath: "body.1.0.0.1.0.0" },
  { content: "Subscription", breadcrumb: "Trail", back: false, divider: true, route: "/mypage/upgrade/billing-fail", rootPath: "body.1.0.0.1.0.0" },
  { content: "Subscription", breadcrumb: "Trail", back: true, divider: true, route: "/mypage/upgrade", rootPath: "body.1.0.0.1.0.0.0.0" },
];
const desktopSidebarProbe = fixture.screens["desktop-1920x1080"]["/settings"]
  .vectorControlProbes?.sidebarCollapse;
if (
  !desktopSidebarProbe ||
  desktopSidebarProbe.svgRect.width !== 20 ||
  desktopSidebarProbe.groups?.[0]?.transform !== "matrix(1, 0, 0, 1, -2.5, 0)"
) {
  fail("measured desktop sidebar SVG transform changed; inspect before regenerating Figma");
}
const desktopTopBarSpec = (input) => {
  const desktopScreen = fixture.screens["desktop-1920x1080"][input.route];
  const root = desktopScreen.tree.find((entry) => entry.path === input.rootPath) ??
    fail(`missing desktop root ${input.route} ${input.rootPath}`);
  const rootStyle = style(root);
  const direct = desktopScreen.tree.filter((entry) => entry.parentPath === input.rootPath);
  const nav = direct.find((entry) => entry.tag === "nav" && entry.ariaLabel === "Breadcrumb");
  const leading = direct.find((entry) => entry.tag === "div" && entry.rect.x < nav.rect.x);
  const profile = direct.find((entry) => entry.tag === "div" && entry.rect.x > nav.rect.x);
  if (!nav || !leading || !profile || direct.length !== 3) fail(`unexpected desktop top-bar ${input.route}`);
  const menu = desktopScreen.tree.find(
    (entry) => entry.ariaLabel === "Collapse sidebar" && entry.path.startsWith(`${leading.path}.`),
  );
  const profileButton = desktopScreen.tree.find(
    (entry) => entry.ariaLabel === "Open profile" && entry.path.startsWith(`${profile.path}.`),
  );
  const backButton = desktopScreen.tree.find(
    (entry) => entry.ariaLabel === "Back to subscription" && entry.path.startsWith(`${leading.path}.`),
  );
  if (!menu || !profileButton || Boolean(backButton) !== input.back) fail(`unexpected desktop controls ${input.route}`);
  const textNodes = desktopScreen.tree.filter(
    (entry) => entry.ownText && entry.path.startsWith(`${nav.path}.`),
  );
  if (textNodes.length !== (input.breadcrumb === "Single" ? 1 : 3)) fail(`unexpected desktop breadcrumb ${input.route}`);
  return {
    ...input,
    rect: { width: root.rect.width, height: root.rect.height },
    gap: px(rootStyle.gap),
    padding: { top: px(rootStyle.paddingTop), right: px(rootStyle.paddingRight), bottom: px(rootStyle.paddingBottom), left: px(rootStyle.paddingLeft) },
    fill: color(rootStyle.backgroundColor),
    dividerColor: color(rootStyle.borderBottomColor),
    leading: relRect(leading, root.rect),
    nav: relRect(nav, root.rect),
    profile: relRect(profile, root.rect),
    controls: { menu: relRect(menu, root.rect), back: backButton ? relRect(backButton, root.rect) : null, profile: relRect(profileButton, root.rect) },
    profileVisual: profileVisualSpec(desktopScreen, profileButton, root.rect),
    text: textNodes.map((entry) => textSpec(entry, root.rect, desktopFigmaGlyphBounds)),
  };
};

const measuredMobileVariants = variantInputs.map(topBarSpec);
const measuredDesktopVariants = desktopVariantInputs.map(desktopTopBarSpec);
for (const spec of [...measuredMobileVariants, ...measuredDesktopVariants]) assertProfileVisual(spec);
const avatarSourcePath = "apps/web/components/navigation/UserCircleDefaultAvatar.tsx";
const ringSourcePath = "apps/web/components/navigation/Gnb.tsx";
const avatarSource = sourceQuote(avatarSourcePath, 13, '  "text-palette-gray-400",');
const ringSourceLines = [
  [1358, '    "[--profile-avatar-size:28px]",'],
  [1361, '    "[--profile-ring-track:rgb(var(--gray-000-rgb)_/_20%)]",'],
  [1362, '    "[--profile-ring-gap:2px]",'],
  [1363, '    "[--profile-ring-width:2px]",'],
  [1390, '    "[&::after]:[background:conic-gradient(_from_0deg,_var(--profile-ring-fill)_0_var(--profile-ring-progress),_var(--profile-ring-track)_var(--profile-ring-progress)_100%_)]",'],
  [1392, '    "[&::after]:[mask:radial-gradient(_farthest-side,_transparent_calc(100%_-_var(--profile-ring-width)),_#000_calc(100%_-_var(--profile-ring-width))_)]",'],
].map(([line, quote]) => sourceQuote(ringSourcePath, line, quote));

const plan = {
  $comment: "Generated from migration/product.auth-fixture.json. Do not edit by hand.",
  $evidenceClass: "product-only measured Figma candidate; not a normative design-system contract",
  $figmaGlyphMeasurement:
    "Measured 2026-08-24 in OlYKERKOkgbxBEEoXGZW2c with temporary Pretendard Medium 14/21/-0.14 and 16/24/-0.16 text nodes; nodes were removed after reading natural WIDTH_AND_HEIGHT bounds. Product rects remain authoritative for placement and containers.",
  productCommit: fixture.productCommit,
  profileVisualSource: {
    avatar: avatarSource,
    ring: ringSourceLines,
  },
  context,
  sourceCandidates: candidateContracts,
  component: {
    id: "product/mobile-app-top-bar",
    pageId: "240:3529",
    pageName: "90 · ASSETS — 출처별 (logo · tile · icon · root · .glyph · .authored)",
    sectionName: "K · product/Mobile app top bar · measured component",
    componentSetName: "Product/Mobile App Top Bar",
    iconComponents: {
      sidebar: ".glyph/SidebarToggle",
      back: ".glyph/ArrowLeftLong",
      profile: ".glyph/UserCircleDefaultAvatar",
    },
    bindings: {
      paletteCollection: "1 · Palette",
      paletteMode: "default",
      semanticCollection: "2 · Semantic",
      semanticMode: "dark",
      surface: { collection: "1 · Palette", name: "palette/gray-800" },
      $darkSurfaceSource: sourceQuote(
        "apps/web/components/navigation/Gnb.tsx",
        430,
        '    "[html[data-theme=dark]_&]:[background:var(--palette-gray-800)]",',
      ),
      divider: { collection: "2 · Semantic", name: "gray/000" },
      dividerOpacity: 0.08,
      profile: { collection: "2 · Semantic", name: "app/avatar-default-ink" },
      profileRingTrack: { collection: "2 · Semantic", name: "gray/000 · a20" },
      current: { collection: "2 · Semantic", name: "gray/000 · a78" },
      parent: { collection: "2 · Semantic", name: "gray/000 · a52" },
      control: { collection: "2 · Semantic", name: "gray/000 · a65" },
      separator: { collection: "2 · Semantic", name: "gray/000 · a36" },
      spacing4: { collection: "Klipse Primitive", name: "spacing/4" },
      spacing8: { collection: "Klipse Primitive", name: "spacing/8" },
      spacing16: { collection: "Klipse Primitive", name: "spacing/16" },
      radius12: { collection: "Klipse Primitive", name: "radius/12" },
    },
    variants: measuredMobileVariants,
    desktopTopBar: {
      id: "product/desktop-app-top-bar",
      sectionName: "L · product/Desktop app top bar · measured component",
      componentSetName: "Product/Desktop App Top Bar",
      sourceCandidates: desktopCandidateContracts,
      sidebarGlyph: {
        sourceRoute: "/settings",
        displaySize: desktopSidebarProbe.svgRect.width,
        lineShiftX: -2.5,
        measuredTransform: desktopSidebarProbe.groups[0].transform,
      },
      variants: measuredDesktopVariants,
    },
  },
};

const runnerPlan = structuredClone(plan);
delete runnerPlan.profileVisualSource;
delete runnerPlan.sourceCandidates;
delete runnerPlan.component.desktopTopBar.sourceCandidates;
const compactRunnerVariant = (spec) => {
  delete spec.rootPath;
  delete spec.fill;
  delete spec.dividerColor;
  delete spec.controls.menu;
  delete spec.controls.back;
  spec.profileVisual = {
    avatar: { rect: spec.profileVisual.avatar.rect },
    ring: { rect: spec.profileVisual.ring.rect, width: spec.profileVisual.ring.width },
  };
  for (const text of spec.text) delete text.color;
};
for (const spec of runnerPlan.component.variants) compactRunnerVariant(spec);
for (const spec of runnerPlan.component.desktopTopBar.variants) compactRunnerVariant(spec);
const draw =
  "// Generated by scripts/build-figma-product-app-shell.mjs. Do not edit by hand.\n" +
  "// Pass this file verbatim to use_figma. It creates or reconciles the measured mobile top bar.\n" +
  `const PLAN=${JSON.stringify(runnerPlan)};\n` +
  readFileSync(templatePath, "utf8");
if (draw.length > 50_000) fail(`Figma runner exceeds connector limit: ${draw.length}`);
const expected = [
  { absolute: planPath, expected: `${JSON.stringify(plan, null, 2)}\n` },
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
  `[figma-product-app-shell] ${checkOnly ? "checked" : "built"} @ ${fixture.productCommit.slice(0, 8)}: ` +
    `${plan.component.variants.length} mobile + ${plan.component.desktopTopBar.variants.length} desktop top-bar variants · mobile candidates ${candidateContracts
      .map((entry) => `${entry.nodeCount}/${entry.routeCount}`)
      .join(", ")} · desktop candidates ${desktopCandidateContracts.map((entry) => `${entry.nodeCount}/${entry.routeCount}`).join(", ")} nodes/routes`,
);
