import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { atomicWriteBatch } from "./lib/atomic-output.mjs";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const fixture = JSON.parse(readFileSync(resolve(repoRoot, "migration/product.auth-fixture.json"), "utf8"));
const planPath = resolve(repoRoot, "figma/product-checkout-status.plan.json");
const drawPath = resolve(repoRoot, "figma/product-checkout-status.draw.js");
const templatePath = resolve(repoRoot, "scripts/templates/figma-product-checkout-status-renderer.js");
const checkOnly = process.argv.includes("--check");
const styles = new Map(fixture.computedStyles.map((entry) => [entry.id, entry.value]));
const fail = (message) => { throw new Error(`[figma-product-checkout-status] ${message}`); };
const px = (value) => Number(/^(-?[\d.]+)px$/.exec(value ?? "")?.[1] ?? 0);
const color = (value) => {
  const match = /^rgba?\(\s*([\d.]+)[,\s]+([\d.]+)[,\s]+([\d.]+)(?:[,/\s]+([\d.]+))?\s*\)$/.exec(value ?? "");
  if (!match) fail(`unsupported color ${value}`);
  return [Number(match[1]) / 255, Number(match[2]) / 255, Number(match[3]) / 255, match[4] === undefined ? 1 : Number(match[4])];
};
const screen = (context, route) => fixture.screens[context]?.[route] ?? fail(`missing screen ${context} ${route}`);
const node = (context, route, path) => screen(context, route).tree.find((entry) => entry.path === path) ?? fail(`missing node ${context} ${route} ${path}`);
const style = (entry) => styles.get(entry.styleRef) ?? fail(`missing style ${entry.styleRef}`);
const children = (context, route, parentPath) => screen(context, route).tree.filter((entry) => entry.parentPath === parentPath);
const relRect = (entry, rootRect) => ({
  x: entry.rect.x - rootRect.x,
  y: entry.rect.y - rootRect.y,
  width: entry.rect.width,
  height: entry.rect.height,
});
const textSpec = (entry, rootRect) => {
  const computed = style(entry);
  return {
    text: entry.ownText,
    rect: relRect(entry, rootRect),
    fontFamily: computed.fontFamily,
    fontSize: px(computed.fontSize),
    fontWeight: Number(computed.fontWeight),
    lineHeight: px(computed.lineHeight),
    letterSpacing: computed.letterSpacing === "normal" ? 0 : px(computed.letterSpacing),
    color: color(computed.color),
    textAlign: computed.textAlign,
  };
};
const padding = (computed) => ({
  top: px(computed.paddingTop),
  right: px(computed.paddingRight),
  bottom: px(computed.paddingBottom),
  left: px(computed.paddingLeft),
});

// 2026-08-24 use_figma에서 Pretendard Regular 14px/21px 임시 TextNode를
// WIDTH_AND_HEIGHT로 직접 측정한 뒤 모두 삭제했다. 브라우저 rect의 anchor는 보존하되
// Figma font engine의 자연 폭이 더 큰 문자열만 줄바꿈 없이 그리기 위한 Figma 측 측정값이다.
const figmaGlyphMeasurements = {
  $measurement: "use_figma temporary TextNode natural bounds; measured 2026-08-24 and nodes removed",
  "-0.16": { "Error code": 64, Message: 56, "Order ID": 52, UNKNOWN_ERROR: 120, "Payment request failed": 141, "-": 7 },
  "-0.14": { "Error code": 64, Message: 57, "Order ID": 52, UNKNOWN_ERROR: 121, "Payment request failed": 141, "-": 7 },
};
const detailTextSpec = (entry, rootRect) => {
  const spec = textSpec(entry, rootRect);
  const measured = figmaGlyphMeasurements[String(spec.letterSpacing)]?.[spec.text];
  if (!measured) fail(`missing Figma natural glyph measurement ${spec.text}/${spec.letterSpacing}`);
  return { ...spec, figmaWidth: measured };
};

const contentPath = "body.1.0.0.1.1";
const outcomeRoutes = [
  { outcome: "BillingSuccess", route: "/mypage/upgrade/billing-success", kind: "alert" },
  { outcome: "BillingFail", route: "/mypage/upgrade/billing-fail", kind: "details" },
  { outcome: "CheckoutFail", route: "/mypage/upgrade/fail", kind: "details" },
];
const contexts = [
  { context: "desktop-1920x1080", viewport: "Desktop" },
  { context: "mobile-402x874", viewport: "Mobile" },
];

const contentSpec = ({ context, viewport }, { outcome, route, kind }) => {
  const root = node(context, route, contentPath);
  const rootStyle = style(root);
  const title = node(context, route, `${contentPath}.0`);
  const body = node(context, route, `${contentPath}.1`);
  const actionGroup = node(context, route, `${contentPath}.3`);
  const actionStyle = style(actionGroup);
  const spec = {
    outcome,
    route,
    viewport,
    kind,
    rect: { width: root.rect.width, height: root.rect.height },
    gap: px(rootStyle.gap),
    title: textSpec(title, root.rect),
    body: textSpec(body, root.rect),
    actionGroup: {
      rect: relRect(actionGroup, root.rect),
      gap: px(actionStyle.gap),
      marginTop: px(actionStyle.marginTop),
      actions: children(context, route, actionGroup.path).map((entry) => {
        const computed = style(entry);
        return {
          text: entry.ownText,
          rect: relRect(entry, root.rect),
          radius: px(computed.borderTopLeftRadius),
          padding: padding(computed),
          fill: color(computed.backgroundColor),
          textStyle: textSpec(entry, root.rect),
        };
      }),
    },
  };
  if (kind === "alert") {
    const alert = node(context, route, `${contentPath}.2`);
    const computed = style(alert);
    const alertRect = relRect(alert, root.rect);
    const alertPadding = padding(computed);
    spec.alert = {
      text: alert.ownText,
      rect: alertRect,
      textRect: {
        x: alertRect.x + alertPadding.left,
        y: alertRect.y + alertPadding.top,
        width: alertRect.width - alertPadding.left - alertPadding.right,
        height: alertRect.height - alertPadding.top - alertPadding.bottom,
      },
      padding: alertPadding,
      radius: px(computed.borderTopLeftRadius),
      strokeWidth: px(computed.borderTopWidth),
      stroke: color(computed.borderTopColor),
      fill: color(computed.backgroundColor),
      textStyle: textSpec(alert, root.rect),
    };
  } else {
    const list = node(context, route, `${contentPath}.2`);
    spec.details = {
      rect: relRect(list, root.rect),
      rows: children(context, route, list.path).map((row) => {
        const computed = style(row);
        const rowChildren = children(context, route, row.path);
        if (rowChildren.length !== 2) fail(`expected term/value pair ${context} ${route} ${row.path}`);
        return {
          rect: relRect(row, root.rect),
          direction: computed.flexDirection,
          gap: px(computed.gap),
          padding: padding(computed),
          term: detailTextSpec(rowChildren[0], root.rect),
          value: detailTextSpec(rowChildren[1], root.rect),
        };
      }),
    };
  }
  return spec;
};

const variants = contexts.flatMap((context) => outcomeRoutes.map((route) => contentSpec(context, route)));
for (const spec of variants) {
  const expectedWidth = spec.viewport === "Desktop" ? 520 : 370;
  if (spec.rect.width !== expectedWidth || spec.actionGroup.actions.length !== 2) {
    fail(`checkout content geometry changed ${spec.route} ${spec.viewport}`);
  }
  if (spec.kind === "alert" && !spec.alert) fail(`missing measured alert ${spec.route} ${spec.viewport}`);
  if (spec.kind === "details" && ![2, 3].includes(spec.details?.rows.length)) fail(`detail row drift ${spec.route} ${spec.viewport}`);
}

const sceneSpec = ({ context, viewport }, { outcome, route }) => {
  const page = node(context, route, "body.1");
  const main = node(context, route, "body.1.0.0.1");
  const topBar = node(context, route, "body.1.0.0.1.0.0");
  const content = node(context, route, contentPath);
  const pageStyle = style(page);
  const mainStyle = style(main);
  const expected = viewport === "Desktop"
    ? { page: [1920, 1080], main: [1628, 1004] }
    : { page: [402, 874], main: [402, 810] };
  if (
    page.rect.width !== expected.page[0] || page.rect.height !== expected.page[1] ||
    main.rect.width !== expected.main[0] || main.rect.height !== expected.main[1]
  ) fail(`scene geometry changed ${context} ${route}`);
  return {
    outcome,
    route,
    viewport,
    page: { rect: { width: page.rect.width, height: page.rect.height }, background: color(pageStyle.backgroundColor) },
    main: {
      rect: relRect(main, page.rect),
      background: color(mainStyle.backgroundColor),
      radius: px(mainStyle.borderTopLeftRadius),
    },
    topBar: relRect(topBar, main.rect),
    content: relRect(content, main.rect),
  };
};
const sceneVariants = contexts.flatMap((context) => outcomeRoutes.map((route) => sceneSpec(context, route)));

const plan = {
  $comment: "Generated from migration/product.auth-fixture.json. Do not edit by hand.",
  $evidenceClass: "product-only measured Figma component and composition; not a normative design-system contract",
  productCommit: fixture.productCommit,
  figmaGlyphMeasurements,
  component: {
    id: "product/checkout-status-content-and-scenes",
    pageId: "240:3529",
    pageName: "90 · ASSETS — 출처별 (logo · tile · icon · root · .glyph · .authored)",
    sectionName: "N · product/Checkout status · measured component and scenes",
    contentSetName: "Product/Checkout Status Content",
    desktopMainSetName: "Product/Desktop Checkout Status Main Surface",
    desktopSceneSetName: "Product/Desktop Checkout Status Scene",
    mobileMainSetName: "Product/Mobile Checkout Status Main Surface",
    mobileSceneSetName: "Product/Mobile Checkout Status Scene",
    dependencies: {
      gnbSet: "Product/Gnb Desktop Shell",
      gnbVariant: "Current=Upgrade",
      desktopTopBarSet: "Product/Desktop App Top Bar",
      desktopTopBarVariant: "Content=Subscription, Breadcrumb=Trail, Back=False, Divider=On",
      mobileTopBarSet: "Product/Mobile App Top Bar",
      mobileTopBarVariant: "Width=Inset, Breadcrumb=Trail, Back=False, Divider=On",
    },
    variants,
    scenes: sceneVariants,
    bindings: {
      paletteCollection: "1 · Palette",
      paletteMode: "sidebar",
      semanticCollection: "2 · Semantic",
      semanticMode: "light-sidebar",
      primitiveCollection: "Klipse Primitive",
      primitiveMode: "Base",
      current: { collection: "1 · Palette", name: "palette/gray-1000" },
      surface: { collection: "1 · Palette", name: "palette/gray-100" },
      appBackground: { collection: "1 · Palette", name: "palette/gray-200" },
      secondary: { collection: "2 · Semantic", name: "gray/000 · a56" },
      tertiary: { collection: "2 · Semantic", name: "gray/000 · a48" },
      secondaryButton: { collection: "2 · Semantic", name: "palette/gray-000 · a8" },
      error: { collection: "1 · Palette", name: "accent/red/500" },
      errorSurface: { collection: "Klipse Primitive", name: "color/red-alpha/8" },
      errorBorder: { collection: "Klipse Primitive", name: "color/red-alpha/16" },
      spacing20: { collection: "Klipse Primitive", name: "spacing/20" },
      radius12: { collection: "Klipse Primitive", name: "radius/12" },
      radius16: { collection: "Klipse Primitive", name: "radius/16" },
    },
  },
};

const draw =
  "// Generated by scripts/build-figma-product-checkout-status.mjs. Do not edit by hand.\n" +
  "// Pass this file verbatim to use_figma. It creates only measured product components and scenes.\n" +
  `const PLAN=${JSON.stringify(plan)};\n` +
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
console.log(`[figma-product-checkout-status] ${checkOnly ? "checked" : "built"} @ ${fixture.productCommit.slice(0, 8)}: ${variants.length} content variants + ${sceneVariants.length} scenes`);
