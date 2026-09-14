import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { transformSync } from "esbuild";
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
// **브라우저는 색을 두 표기로 직렬화한다.** 배경·글자는 `rgb()`/`rgba()`(0~255)로 나오지만
// 테두리와 일부 색은 `color(srgb 0.341176 0.364706 0.407843)`(0~1 정규화 + 슬래시 알파)로 나온다.
// 값 범위가 다르므로 255로 나누는 경로와 **분기**해야 한다 — 나누면 1/255 로 뭉개진다.
// 같은 처방을 scripts/build-figma-inventory.mjs 의 colorOf() 와
// scripts/lib/figma-tree-spec.mjs 의 cssColorToHex() 가 이미 쓴다.
const color = (value) => {
  const raw = String(value ?? "").trim();
  const legacy = /^rgba?\(\s*([\d.]+)[,\s]+([\d.]+)[,\s]+([\d.]+)(?:[,/\s]+([\d.]+))?\s*\)$/.exec(raw);
  if (legacy) {
    return [Number(legacy[1]) / 255, Number(legacy[2]) / 255, Number(legacy[3]) / 255, legacy[4] === undefined ? 1 : Number(legacy[4])];
  }
  const modern = /^color\(srgb\s+([\d.]+)\s+([\d.]+)\s+([\d.]+)(?:\s*\/\s*([\d.]+))?\s*\)$/.exec(raw);
  if (modern) {
    return [Number(modern[1]), Number(modern[2]), Number(modern[3]), modern[4] === undefined ? 1 : Number(modern[4])];
  }
  return fail(`unsupported color ${value}`);
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

/* **본문은 흐름이다 — 측정 rect 로 절대배치하지 않는다(2026-09-14, 크기 굳힘 감사 묶음 2 · 3).**
   옛 계획은 글자 · 행 · 버튼 · 알림의 측정 rect 와, Figma 글꼴이 브라우저보다 넓게 그리는 문자열을 위한
   「Figma 자연 폭」 표(`figmaGlyphMeasurements`, 2026-08-24 임시 TextNode 실측)를 실었고, 렌더러가
   `textAutoResize NONE` + x/y 로 박았다. 이제 variant 는 세로 Auto Layout 이고 글자는 자기 폭(HUG)이나 부모 폭
   (FILL + 높이 자동)을 따르므로 자연 폭 표가 필요 없다 — 그 표가 막던 「Figma 에서만 생기는 접힘」은 HUG 글자에서
   생기지 않는다. 계획은 **선언이 정한 축만 값으로** 싣는다: 본문 폭(`width: min(520px, 100%)`), 간격 · 패딩 ·
   테두리(계산 스타일), 버튼 높이(`height`). 선언은 측정 원장의 노드별 `declared` 칸에서 읽고, 없거나 꼴이 다르면
   던진다(값을 지어내지 않는다). rect 는 설명문 · 감사용 증거로만 남기고 러너에는 싣지 않는다. */
const declaredValue = (entry, property, pattern, where) => {
  const value = entry.declared?.[property];
  if (typeof value !== "string" || !pattern.test(value)) {
    fail(`${where} ${entry.path}: declared ${property} ${JSON.stringify(value)} does not match ${pattern}`);
  }
  return value;
};
// 폭 선언 `min(<상한>px, 100%)` — 부모가 상한보다 넓으면 상한(선택값)에 물려 FIXED, 좁으면 100% 라 소비처 FILL.
// 판정은 측정 폭과 선언 상한의 대조다. 마스터에는 부모가 없어 FILL 쪽 마스터의 기본 폭은 그 뷰포트의 측정 부모 폭이다.
const cappedWidth = (entry, where) => {
  const declared = declaredValue(entry, "width", /^min\(\d+(?:\.\d+)?px, 100%\)$/, where);
  const cap = Number(/^min\(([\d.]+)px/.exec(declared)[1]);
  return entry.rect.width === cap
    ? { mode: "FIXED", value: cap, declared }
    : { mode: "FILL", value: entry.rect.width, declared };
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
  const where = `${context} ${route}`;
  const root = node(context, route, contentPath);
  const rootStyle = style(root);
  const title = node(context, route, `${contentPath}.0`);
  const body = node(context, route, `${contentPath}.1`);
  const actionGroup = node(context, route, `${contentPath}.3`);
  const actionStyle = style(actionGroup);
  // 버튼 줄은 `flex-wrap` 인데 버튼마다 `width: 100%` 라 한 줄에 하나씩 선다 — 세로 쌓임과 같다(Figma 의
  // wrap 에서 FILL 자식은 줄을 나눠 가지므로 가로 wrap 으로 옮기면 제품과 다른 배치가 된다).
  declaredValue(actionGroup, "flex-wrap", /^wrap$/, where);
  const spec = {
    outcome,
    route,
    viewport,
    kind,
    rect: { width: root.rect.width, height: root.rect.height },
    width: cappedWidth(root, where),
    gap: px(rootStyle.rowGap),
    gapDeclared: declaredValue(root, "gap", /\S/, where),
    title: textSpec(title, root.rect),
    body: textSpec(body, root.rect),
    actionGroup: {
      rect: relRect(actionGroup, root.rect),
      direction: "VERTICAL",
      gap: px(actionStyle.rowGap),
      paddingTop: px(actionStyle.marginTop),
      declared: {
        flexWrap: declaredValue(actionGroup, "flex-wrap", /^wrap$/, where),
        gap: declaredValue(actionGroup, "gap", /\S/, where),
        marginTop: declaredValue(actionGroup, "margin-top", /\S/, where),
      },
      actions: children(context, route, actionGroup.path).map((entry) => {
        const computed = style(entry);
        declaredValue(entry, "width", /^100%$/, where);
        return {
          text: entry.ownText,
          rect: relRect(entry, root.rect),
          // 높이는 선언(`h-16` → `height: calc(32px)`)이라 FIXED, 폭은 `width: 100%` 라 FILL 이다.
          height: px(computed.height),
          heightDeclared: declaredValue(entry, "height", /px\)?$/, where),
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
    spec.alert = {
      text: alert.ownText,
      rect: relRect(alert, root.rect),
      padding: padding(computed),
      radius: px(computed.borderTopLeftRadius),
      strokeWidth: px(computed.borderTopWidth),
      stroke: color(computed.borderTopColor),
      fill: color(computed.backgroundColor),
      textStyle: textSpec(alert, root.rect),
    };
  } else {
    const list = node(context, route, `${contentPath}.2`);
    const listStyle = style(list);
    spec.details = {
      rect: relRect(list, root.rect),
      gap: px(listStyle.rowGap),
      rows: children(context, route, list.path).map((row) => {
        const computed = style(row);
        const rowChildren = children(context, route, row.path);
        if (rowChildren.length !== 2) fail(`expected term/value pair ${context} ${route} ${row.path}`);
        return {
          rect: relRect(row, root.rect),
          direction: computed.flexDirection,
          alignItems: computed.alignItems,
          justifyContent: computed.justifyContent,
          gap: px(computed.rowGap),
          padding: padding(computed),
          // `[&>div]:[border-bottom:1px_solid …]` + `[&>div:last-child]:[border-bottom:none]` — 마지막 행만 선이 없다.
          borderBottom: px(computed.borderBottomWidth) ? { width: px(computed.borderBottomWidth), color: color(computed.borderBottomColor) } : null,
          term: textSpec(rowChildren[0], root.rect),
          value: textSpec(rowChildren[1], root.rect),
        };
      }),
    };
  }
  return spec;
};

const variants = contexts.flatMap((context) => outcomeRoutes.map((route) => contentSpec(context, route)));
for (const spec of variants) {
  // 구조 가드 — 크기는 묻지 않는다(폭 · 높이는 위에서 선언으로 판정했다).
  if (spec.actionGroup.actions.length !== 2) fail(`checkout content action count changed ${spec.route} ${spec.viewport}`);
  if (spec.kind === "alert" && !spec.alert) fail(`missing measured alert ${spec.route} ${spec.viewport}`);
  if (spec.kind === "details" && ![2, 3].includes(spec.details?.rows.length)) fail(`detail row drift ${spec.route} ${spec.viewport}`);
}

/* **메인 표면과 장면도 흐름이다(2026-09-14, 크기 굳힘 감사 묶음 3).** 옛 계획은 page · main 의 측정 rect 를
   `=== 1920/1080 · 1632/1012 · 402/874 · 402/814` 로 물었고, 렌더러가 그 rect 로 resize 하고 상단 바 · 본문을 측정
   x/y 에 박았다 — 셸 토큰 한 칸(2026-09-09 링 12 → 8)이나 상단 바 높이(2026-09-14 프로필 36 → 32)가 움직일 때마다
   가드 숫자와 캔버스가 함께 낡았다. 이제 계획은 **선언이 정한 값**을 싣는다:
     · 장면: 셸 패딩(`pt-[var(--app-gnb-safe-top)] pb-[…rail-padding-bottom]` 계산값), main 의 좌우 margin
       (`ml-[var(--app-gnb-sidebar-width)]` · `mr-[var(--app-gnb-main-inline-padding-end)]` 계산값). 사이드바는
       `position: fixed` 라 흐름 밖(절대 배치)이다.
     · 메인 표면: 패딩(계산값), 최소 높이(`min-height: calc(100dvh − …)` — 뷰포트에서 푼 값이라 마스터의 뷰포트 기본
       높이로만 쓴다), 상단 바 bleed(`margin-left: calc(-1 * var(--mainchrome-bleed-left, …))` 계산값), 본문 위 여백
       (`margin-top: clamp(56px, 10vh, 120px)` · ≤900 `calc(56px)` 계산값 — 역시 뷰포트에서 푼 값).
   숫자 가드는 없다. 대신 rect 가 그 값들로 **닫히는지**(원장 대조)만 본다 — 닫히지 않으면 계산 스타일과 측정이 서로
   다른 트리를 본 것이다. */
const sceneSpec = ({ context, viewport }, { outcome, route }) => {
  const where = `${context} ${route}`;
  const page = node(context, route, "body.1");
  const shell = node(context, route, "body.1.0.0");
  const main = node(context, route, "body.1.0.0.1");
  const slot = node(context, route, "body.1.0.0.1.0");
  const topBar = node(context, route, "body.1.0.0.1.0.0");
  const content = node(context, route, contentPath);
  const pageStyle = style(page);
  const shellStyle = style(shell);
  const mainStyle = style(main);
  const barStyle = style(topBar);
  const contentStyle = style(content);
  const mainMinHeight = declaredValue(main, "min-height", /^calc\(100dvh - /, where);
  const contentMarginTop = declaredValue(content, "margin-top", /^(clamp|calc)\(/, where);
  declaredValue(main, "margin-left", /--app-gnb-sidebar-width/, where);
  declaredValue(topBar, "margin-left", /--mainchrome-bleed-left/, where);
  const layout = {
    page: { padding: { top: px(shellStyle.paddingTop), right: px(mainStyle.marginRight), bottom: px(shellStyle.paddingBottom), left: px(mainStyle.marginLeft) } },
    main: {
      padding: padding(mainStyle),
      minHeight: px(mainStyle.minHeight),
      bleed: { left: -px(barStyle.marginLeft), right: -px(barStyle.marginRight) },
      barGap: px(style(slot).marginBottom),
      contentTop: px(contentStyle.marginTop),
      declared: { minHeight: mainMinHeight, contentMarginTop },
    },
  };
  const closes =
    main.rect.x === page.rect.x + layout.page.padding.left &&
    main.rect.y === page.rect.y + layout.page.padding.top &&
    main.rect.width === page.rect.width - layout.page.padding.left - layout.page.padding.right &&
    main.rect.height === layout.main.minHeight &&
    topBar.rect.x === main.rect.x + layout.main.padding.left - layout.main.bleed.left &&
    content.rect.y === topBar.rect.y + topBar.rect.height + layout.main.barGap + layout.main.contentTop;
  if (!closes) fail(`${where}: measured scene rects no longer close over the declared shell values`);
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
    layout,
    topBar: relRect(topBar, main.rect),
    content: relRect(content, main.rect),
  };
};
const sceneVariants = contexts.flatMap((context) => outcomeRoutes.map((route) => sceneSpec(context, route)));

// **간격 · 패딩은 값이 같은 `Klipse Primitive/spacing/<n>` 에 묶는다** — 이름과 값을 되읽기(`figma/readback.json`)에서
// 확인한다(형제 생성기 build-figma-product-app-shell 과 같은 규칙). 토큰이 없는 값(본문 위 여백 같은 뷰포트 계산값)은
// 묶지 않는다 — 렌더러는 계획의 `spacing<n>` 이 있을 때만 묶는다.
const readback = JSON.parse(readFileSync(resolve(repoRoot, "figma/readback.json"), "utf8"));
const liveFloat = (collection, name) => {
  const row = readback.collections?.[collection]?.rows?.find((entry) => entry[0] === name);
  if (!row || row[1] !== "FLOAT") return null;
  const [[, alias, raw]] = row[3];
  return alias ? null : raw;
};
const spacingValues = new Set();
for (const spec of variants) {
  const alertPadding = spec.alert ? Object.values(spec.alert.padding) : [];
  const rowSpacing = (spec.details?.rows ?? []).flatMap((row) => [row.gap, ...Object.values(row.padding)]);
  const actionSpacing = spec.actionGroup.actions.flatMap((action) => Object.values(action.padding));
  for (const value of [spec.gap, spec.actionGroup.gap, spec.actionGroup.paddingTop, ...alertPadding, ...rowSpacing, ...actionSpacing]) {
    if (value > 0) spacingValues.add(value);
  }
  for (const radius of [spec.alert?.radius, ...spec.actionGroup.actions.map((action) => action.radius)].filter((value) => value !== undefined)) {
    if (radius !== liveFloat("Klipse Primitive", "radius/12")) fail(`${spec.route} ${spec.viewport}: radius ${radius} is not Klipse Primitive/radius/12`);
  }
}
for (const scene of sceneVariants) {
  const { padding: mainPadding, bleed } = scene.layout.main;
  for (const value of [mainPadding.left - bleed.left, mainPadding.right - bleed.right, mainPadding.bottom, bleed.left, bleed.right]) {
    if (value > 0) spacingValues.add(value);
  }
  if (scene.main.radius !== liveFloat("Klipse Primitive", "radius/16")) fail(`${scene.route} ${scene.viewport}: main radius is not Klipse Primitive/radius/16`);
}
const spacingBindings = Object.fromEntries([...spacingValues].sort((a, b) => a - b).flatMap((value) => {
  const name = `spacing/${value}`;
  return liveFloat("Klipse Primitive", name) === value ? [[`spacing${value}`, { collection: "Klipse Primitive", name }]] : [];
}));
for (const spec of variants) {
  const required = [spec.gap, spec.actionGroup.gap, spec.actionGroup.paddingTop];
  for (const value of required) if (value > 0 && !spacingBindings[`spacing${value}`]) fail(`${spec.route}: no Klipse Primitive/spacing/${value} to bind`);
}

const plan = {
  $comment: "Generated from migration/product.auth-fixture.json. Do not edit by hand.",
  $evidenceClass: "product-only measured Figma component and composition; not a normative design-system contract",
  productCommit: fixture.productCommit,
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
      // 본문 · 행 · 알림을 선이 있는 흐름으로 그리면서 행 구분선이 들어왔다 — 제품 `rgb(var(--gray-000-rgb)/8%)`.
      divider: { collection: "2 · Semantic", name: "palette/gray-000 · a8" },
      ...spacingBindings,
      radius12: { collection: "Klipse Primitive", name: "radius/12" },
      radius16: { collection: "Klipse Primitive", name: "radius/16" },
    },
  },
};

// 러너에는 렌더러가 읽는 값만 싣는다 — 글자 · 행 · 버튼 rect 와 선언 문자열은 계획(감사본)에만 남는다.
const runnerPlan = structuredClone(plan);
for (const variant of runnerPlan.component.variants) {
  for (const text of [variant.title, variant.body, variant.alert?.textStyle, ...variant.actionGroup.actions.map((action) => action.textStyle),
    ...(variant.details?.rows ?? []).flatMap((row) => [row.term, row.value])].filter(Boolean)) delete text.rect;
  for (const action of variant.actionGroup.actions) { delete action.rect; delete action.heightDeclared; }
  for (const row of variant.details?.rows ?? []) delete row.rect;
  if (variant.details) delete variant.details.rect;
  if (variant.alert) delete variant.alert.rect;
  delete variant.actionGroup.rect;
  delete variant.actionGroup.declared;
  delete variant.gapDeclared;
  delete variant.width.declared;
}
for (const scene of runnerPlan.component.scenes) {
  delete scene.layout.main.declared;
  delete scene.topBar;
  delete scene.content;
}
const readableDraw = `const PLAN=${JSON.stringify(runnerPlan)};\n` + readFileSync(templatePath, "utf8");
const wrapperPrefix = "async function __figmaRunner__(){";
const wrappedDraw = transformSync(`${wrapperPrefix}${readableDraw}}`, { minify: true, target: "es2022" }).code.trim();
if (!wrappedDraw.startsWith(wrapperPrefix) || !wrappedDraw.endsWith("}")) fail("unexpected esbuild wrapper output");
const draw =
  "// Generated and minified by scripts/build-figma-product-checkout-status.mjs. Do not edit by hand.\n" +
  "// Pass this file verbatim to use_figma. It creates or reconciles in place the measured checkout status content, main surfaces and scenes.\n" +
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
console.log(`[figma-product-checkout-status] ${checkOnly ? "checked" : "built"} @ ${fixture.productCommit.slice(0, 8)}: ${variants.length} content variants + ${sceneVariants.length} scenes`);
