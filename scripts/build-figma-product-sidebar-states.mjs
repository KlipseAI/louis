import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { atomicWriteBatch } from "./lib/atomic-output.mjs";
import { BINDING_POLICY, RENDERER_LIB, liveVariables, parseCssColor, sourceQuotes } from "./lib/figma-live-variables.mjs";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const measurementPath = resolve(repoRoot, "migration/product.sidebar-states.json");
const planPath = resolve(repoRoot, "figma/product-sidebar-states.plan.json");
const drawPath = resolve(repoRoot, "figma/product-sidebar-states.draw.js");
const templatePath = resolve(repoRoot, "scripts/templates/figma-product-sidebar-states-renderer.js");
const productRoot = process.env.KLIPSE_PRODUCT_REPO ?? "/Users/sejunki/klipse-web";
const checkOnly = process.argv.includes("--check");
const measurement = JSON.parse(readFileSync(measurementPath, "utf8"));
const fail = (message) => { throw new Error(`[figma-product-sidebar-states] ${message}`); };
const sourceQuote = (path, line, expected) => {
  // 근거 문자열에는 기계마다 다른 절대경로를 적지 않는다 — 적으면 check 가 KLIPSE_PRODUCT_REPO 철자에 따라 갈린다.
  const command = `git -C "$KLIPSE_PRODUCT_REPO" show ${measurement.productCommit}:${path}`;
  const source = execFileSync("git", ["-C", productRoot, "show", `${measurement.productCommit}:${path}`], {
    encoding: "utf8",
    maxBuffer: 32 * 1024 * 1024,
  });
  const quote = source.split("\n")[line - 1] ?? "";
  if (quote !== expected) fail(`source quote drift ${path}:${line}: ${JSON.stringify(quote)}`);
  return { command, path, line, quote };
};
const byAria = (state, label) =>
  measurement.states[state].tree.find((entry) => entry.ariaLabel === label) ??
  fail(`missing ${state} aria ${label}`);
const expandedUpgrade = measurement.states.expanded.tree.find(
  (entry) => entry.tag === "button" && entry.path.startsWith("sidebar.0.2"),
) ?? fail("missing expanded Upgrade button");
const collapsedUpgrade = byAria("collapsed", "Upgrade");
// collapsed CTA는 버튼 안에 라벨 span을 따로 갖는다(clip된 12px viewport). 렌더러가 expanded CTA를
// resize하지 않고 전용 master를 만들려면 이 라벨의 rect와 typography가 필요하다.
const collapsedUpgradeLabel = measurement.states.collapsed.tree.find(
  (entry) => entry.parentPath === collapsedUpgrade.path && entry.tag === "span" && entry.ownText === "Upgrade",
) ?? fail("missing collapsed Upgrade label span");
const menu = ["Search", "Home", "Canvas", "Composition", "Highlight", "YouTube analytics"].map(
  (label) => {
    const entry = byAria("collapsed", label);
    return {
      label,
      rect: entry.rect,
      radius: Number.parseFloat(entry.style.borderTopLeftRadius),
      color: entry.style.color,
    };
  },
);
const mainRect = measurement.states.collapsed.mainRect;
// **편집기 격자는 숫자로 굳히지 않는다(2026-09-14, 크기 굳힘 감사 G1).** 예전 이 자리는 상단 바 높이 52 ·
// 본문 1832×996 · 미리보기 1259 · 위 칸 656 을 리터럴과 파생식으로 들고 있었고, 가드는 **같은 파생식끼리**
// 비교해 절대 울리지 않았다(`bodyWidth !== 1832` 는 바로 위 식의 결과다). 게다가 식 자체가 이미 틀렸다 —
// 좌 16 / 우 8 / 아래 16 / 위 0 으로 뺐는데, 제품 편집기 셸은 `MAIN` 이 `[padding:0]` 이고
// (EditorProjectWorkspace.tsx:153) `modalShellDocked` 가 **사방** margin 과 `calc(100% − 인셋 × 2)` 를
// 준다(vemClass.ts:1836 · :1839 · :1853). 그래서 계획은 제품이 고른 값만 싣는다:
//   셸 인셋   — 측정(`--app-gnb-main-inline-padding` 의 계산값, measure-product-sidebar-states)
//   격자 트랙 — 선언 기본값 assets 317 · 디바이더 4 · 미리보기 1fr · 디바이더 4 · properties 240,
//               행 1fr · 4 · timeline 332, 간격 2 · 2 (vemClass.ts:1630–1634)
//   상단 바   — 앱 셸 계획의 선언 크기(컨트롤 · 프로필)와 측정 패딩 · gap. 높이는 HUG 다.
// 1fr 칸(미리보기 · 위 칸)과 본문 크기는 Figma 가 FILL 로 계산한다 — 여기서 빼지 않는다.
const appShell = JSON.parse(readFileSync(resolve(repoRoot, "figma/product-app-shell.plan.json"), "utf8"));
if (appShell.productCommit !== measurement.productCommit) {
  fail(`figma/product-app-shell.plan.json (${appShell.productCommit.slice(0, 8)}) is not at the sidebar measurement anchor — run build-figma-product-app-shell first`);
}
const shellInsetRaw = measurement.states.collapsed.customProperties?.["--app-gnb-main-inline-padding"];
const shellInset = /^(\d+(?:\.\d+)?)px$/.exec(shellInsetRaw ?? "")?.[1];
if (shellInset === undefined) fail(`measured --app-gnb-main-inline-padding is not a px length: ${JSON.stringify(shellInsetRaw)}`);
const declaredTrack = (quote, pattern, what) => {
  const match = pattern.exec(quote.quote);
  if (!match) fail(`declared ${what} not found in ${quote.path}:${quote.line}`);
  return match.slice(1).map(Number);
};
const [desktopTopBar] = appShell.component.desktopTopBar.variants;
const VEM = "apps/web/components/scenes/create/node-canvas-v2/nodes/videoEditParts/vemClass.ts";
const EDITOR = "apps/web/app/videoeditor/[projectId]/EditorProjectWorkspace.tsx";
// 셸 인셋이 사방이라는 선언 — margin 과 그 짝인 폭 · 높이 뺄셈. `MAIN` 은 여백을 내지 않는다.
const shellSources = [
  sourceQuote("apps/web/app/globals.css", 155, "  --app-gnb-main-inline-padding: var(--louis-layout-app-shell-content-inset);"),
  sourceQuote(EDITOR, 153, '  "[padding:0]",'),
  sourceQuote(VEM, 1836, '    "[.vem-modal&]:[width:calc(100%_-_var(--app-gnb-main-inline-padding)_*_2)]",'),
  sourceQuote(VEM, 1839, '    "[.vem-modal&]:[height:calc(100%_-_var(--app-gnb-main-inline-padding)_*_2)]",'),
  sourceQuote(VEM, 1853, '    "[.vem-modal&]:[margin:var(--app-gnb-main-inline-padding)]",'),
];
// **네 줄은 값이 아니라 스코프가 바뀌었다.** 제품 8a90e3f6 「모바일에서 무너져 있던 격자를 한 열로
// 세운다」가 데스크톱 격자를 `[@media(min-width:720px)]:` 안으로 넣었다 — 같은 레이어·같은 특이도라
// Tailwind 정렬 순서로 승패가 갈려 375px 에서 5트랙 격자가 이기던 것을 상호배타 변형으로 가른 것이다.
const gridSources = [
  sourceQuote(VEM, 1630, '    "[@media(min-width:720px)]:[grid-template-columns:var(--video-edit-assets-width,_317px)_4px_minmax(0,_1fr)_4px_var(--video-edit-properties-width,_240px)]",'),
  sourceQuote(VEM, 1631, '    "[@media(min-width:720px)]:[grid-template-rows:minmax(0,_1fr)_4px_var(--video-edit-timeline-height,_332px)]",'),
  sourceQuote(VEM, 1633, '    "[@media(min-width:720px)]:[column-gap:2px]",'),
  sourceQuote(VEM, 1634, '    "[@media(min-width:720px)]:[row-gap:2px]",'),
];
const [assets, assetsDivider, propertiesDivider, properties] = declaredTrack(
  gridSources[0], /\(--video-edit-assets-width,_(\d+)px\)_(\d+)px_minmax\(0,_1fr\)_(\d+)px_var\(--video-edit-properties-width,_(\d+)px\)/, "grid columns");
const [timelineDivider, timeline] = declaredTrack(
  gridSources[1], /minmax\(0,_1fr\)_(\d+)px_var\(--video-edit-timeline-height,_(\d+)px\)/, "grid rows");
const [columnGap] = declaredTrack(gridSources[2], /\[column-gap:(\d+)px\]/, "column gap");
const [rowGap] = declaredTrack(gridSources[3], /\[row-gap:(\d+)px\]/, "row gap");
// **이 장면은 앵커에서 제품 상태가 아니다 — 기록한다.** 편집 화면은 이제 노드 캔버스처럼 풀화면이라
// `variant="create"` 가 사이드바를 끈다(EditorProjectWorkspace.tsx:1120–1124). 접힌 레일 + 편집기 조합은
// 옛 앵커의 장면이다. 격자 트랙과 셸 인셋은 그대로 제품 값이라 옮기지만, 장면 구성을 풀화면으로 다시 짓는
// 일은 이 생성기의 레일 측정(`/settings` 접힘)으로는 닿지 않는다 — 편집기 경로를 재는 측정이 먼저다.
const compositionSources = [
  sourceQuote(EDITOR, 1120, "        /* 프로젝트를 연 편집 화면은 노드 캔버스와 같이 **풀화면**이다. 사이드바가 차지하던"),
  sourceQuote(EDITOR, 1124, '        variant="create"'),
];
const editor = {
  $why:
    "Declared tracks only; the 1fr preview column, the 1fr upper row and the body size are FILL in Figma. " +
    "The shell inset is the measured --app-gnb-main-inline-padding on all four sides (vemClass modalShellDocked margin + calc(100% - inset * 2)). " +
    "The top bar hugs: padding and gap from the measured desktop bar, controls and profile at their declared sizes (app-shell plan).",
  shellInset: Number(shellInset),
  columns: { assets, assetsDivider, preview: "FILL", propertiesDivider, properties },
  rows: { upper: "FILL", timelineDivider, timeline },
  columnGap,
  rowGap,
  topBar: {
    padding: desktopTopBar.padding,
    gap: desktopTopBar.gap,
    leadingGap: desktopTopBar.leadingGap,
    controlSize: appShell.component.controlSize,
    iconSize: appShell.component.iconSize,
    profileSize: appShell.component.profileVisual.controlSize,
  },
};
/* **색은 라이브 변수에 역할로 묶는다(2026-09-14, 컬렉션 이전).** 옛 계획은 은퇴한 `1 · Palette[default/sidebar]` ·
   `2 · Semantic[dark]` 이름을 실어 라이브에서 첫머리에 던졌고, 렌더러는 저장색을 옛 램프 값(#d5d7dd · #f1f1f3)으로 박았다.
   이 측정은 **다크 문맥**(`desktop-1920x1080-dark`)이라 `Klipse Semantic Color[Dark]` 로 푼다 — 사이드바 컴포넌트
   러너(light fixture)와 모드가 다른 것이 측정대로다. 칠하는 자리마다 측정 색과 값이 같은 역할을 고르고 대조표를
   `colorEvidence` 에 싣는다. 편집기 상단 바의 아래 선은 이 측정이 재지 않는 자리(세트가 없을 때만 짓는 경로)라 앱 셸
   계획과 같은 선언 토큰(`stroke-hairline`)을 주석 역할로 둔다. */
const live = liveVariables({ repoRoot, fail });
const quote = sourceQuotes({ repoRoot, productRoot, productCommit: measurement.productCommit, fail });
const GNB = "apps/web/components/navigation/Gnb.tsx";
const themes = [...new Set([measurement.states.collapsed.theme, measurement.states.expanded.theme])];
if (themes.length !== 1) fail(`sidebar states span themes ${themes.join(", ")}`);
const roles = live.colorRoles({
  theme: themes[0],
  where: "sidebar-states",
  roles: {
    gray300: { name: "color/gray/300", declared: [quote.product(GNB, 592, '    "[.gnb-menuSidebar_.gnb-menuLink:not(&)]:[color:var(--gray-300)]",')] },
    gray000: { name: "color/gray/000", declared: [quote.product(GNB, 598, '    "[color:var(--gray-000)]",')] },
    paletteGray100: { collection: "Klipse Primitive", name: "color/palette-gray/100", declared: [quote.product(GNB, 2000, '    "[html[data-theme=dark]_.gnb-sidebarUpgradeButton:not(&)]:[background:var(--palette-gray-100)]",')] },
    paletteGray900: { collection: "Klipse Primitive", name: "color/palette-gray/900", declared: [quote.product(GNB, 2001, '    "[html[data-theme=dark]_.gnb-sidebarUpgradeButton:not(&)]:[color:var(--palette-gray-900)]",')] },
    // 편집기 상단 바 아래 선은 제품이 **선언한** 칠이지만 이 측정(`desktop-1920x1080-dark` 사이드바 상태)이 재지 않는 자리다 —
    // 주석 잉크(문서 프레임)와 다른 종류라 선언 인용을 붙이고 `unmeasured` 로 둔다(측정 대조 없음, `exact: null`).
    topBarDivider: {
      name: "color/stroke-hairline",
      declared: [quote.product(GNB, 497, '    "[border-bottom:var(--louis-border-width-hairline)_solid_color-mix(_in_srgb,_var(--louis-color-stroke-hairline)_calc(var(--mainchrome-divider-progress,_1)_*_100%),_transparent_)]",')],
      unmeasured: "editor top bar bottom line — not measured by this fixture (creation-only path); the same token the app-shell plan binds",
    },
  },
});
const cssColor = (value) => parseCssColor(value, fail);
const menuPaints = menu.map((entry) => ({ ...entry, paint: roles.paintFor(["gray300", "gray000"], cssColor(entry.color), `collapsed menu ${entry.label}`) }));
const activeCollapsedHome = {
  ...measurement.states.activeCollapsedHome,
  paint: roles.paintFor(["gray000", "gray300"], cssColor(measurement.states.activeCollapsedHome.style.color), "collapsed active Home"),
};
const collapsedUpgradePaints = {
  fillPaint: roles.paintFor(["paletteGray100"], cssColor(collapsedUpgrade.style.backgroundColor), "collapsed Upgrade CTA"),
  labelPaint: roles.paintFor(["paletteGray900"], cssColor(collapsedUpgradeLabel.style.color), "collapsed Upgrade CTA label"),
};
if (new Set(menuPaints.map((entry) => entry.paint)).size !== 1) fail("collapsed rail rows disagree on the inactive paint");
const colors = roles.finish();

const plan = {
  $comment: "Generated by scripts/build-figma-product-sidebar-states.mjs. Do not edit by hand.",
  $evidenceClass: "product-only measured Figma component and scene repair",
  productCommit: measurement.productCommit,
  context: measurement.context,
  sourceEvidence: [
    ...measurement.sourceEvidence,
    // 편집기 셸의 사방 인셋(G1) · 격자 트랙 · 장면 구성의 근거. 값은 위 `editor` 가 인용에서 푼다.
    ...shellSources,
    ...gridSources,
    ...compositionSources,
    // 제품이 `mainChromeLeadingCluster` 의 인라인 선언을 걷고 LOUIS 레시피로 넘겼다(e5d49507).
    // `[gap:4px]` 리터럴은 이제 제품에 없다 — 같은 4px 을
    // `.louis-app-top-bar__leading { gap: var(--louis-space-control-xs) }`(app-shell.css:154-156)이
    // 소유한다. 사라진 리터럴을 계속 인용하면 값이 아니라 **소유자**가 바뀐 사실이 지워진다.
    sourceQuote("apps/web/components/navigation/Gnb.tsx", 319, '    "louis-app-top-bar__leading",'),
    sourceQuote("apps/web/components/navigation/Gnb.tsx", 483, '    "[padding:8px_var(--mainchrome-pad-x)]",'),
    sourceQuote("apps/web/app/videoeditor/[projectId]/EditorProjectWorkspace.tsx", 1105, '        <path'),
    sourceQuote("apps/web/app/videoeditor/[projectId]/EditorProjectWorkspace.tsx", 1106, '          d="M19 12H5M5 12L11 6M5 12L11 18"'),
    sourceQuote("apps/web/components/navigation/Gnb.tsx", 1986, '    "[html[data-app-gnb-sidebar-collapsed=true]_&]:[height:32px]",'),
    sourceQuote("apps/web/components/navigation/Gnb.tsx", 1987, '    "[html[data-app-gnb-sidebar-collapsed=true]_&]:[padding:0_10px]",'),
    sourceQuote("apps/web/components/navigation/Gnb.tsx", 2026, '    "[html[data-app-gnb-sidebar-collapsed=true]_&]:[text-overflow:ellipsis]",'),
    sourceQuote("apps/web/components/navigation/Gnb.tsx", 2027, '    "[html[data-app-gnb-sidebar-collapsed=true]_&]:[font-size:var(--type-caption-12-size)]",'),
  ],
  figma: {
    pageId: "240:3529",
    componentSetName: "Product/Gnb Desktop Rail",
    collapsedUpgradeMasterName: "Product/Gnb Collapsed Upgrade CTA",
    topBarName: "Product/Desktop Video Editor Top Bar · Sidebar=Collapsed",
    sectionName: "M · product/Desktop collapsed shell · measured component",
    iconComponents: {
      Search: "icon/MagnifyingGlass",
      Home: "icon/House",
      Canvas: "icon/Graph",
      Composition: "icon/MagicWand",
      Highlight: "root/highlight_symbol",
      YouTube: "icon/youtube",
      logo: "logo/klipse-dark (291×85 · 다크 서피스용 · 워드마크 white)",
      upgrade: "State=Current",
      expand: ".glyph/SidebarToggle",
    },
    $bindingPolicy: BINDING_POLICY,
    bindings: live.assertBindings(colors.bindings, "sidebar-states bindings"),
    // 레일 행 비활성 · 활성 잉크와 접힌 CTA 면 · 글자의 역할. 러너는 이름만 읽는다.
    paints: { inactive: menuPaints[0].paint, active: activeCollapsedHome.paint, ...collapsedUpgradePaints },
    install: {
      videoFrameId: "39:3",
      oldRailId: "39:4",
      mainId: "39:10",
      oldHeaderId: "39:11",
      backSourceId: "39:12",
      breadcrumbSourceId: "39:13",
      actionsSourceId: "75:525",
      profileSourceId: "39:14",
      assetsId: "39:15",
      assetsGripId: "39:29",
      previewId: "39:30",
      timelineGripId: "39:1385",
      propertiesGripId: "39:1360",
      propertiesId: "39:1361",
      timelineId: "39:1386",
    },
  },
  measurements: {
    expanded: { sidebar: measurement.states.expanded.sidebarRect, main: measurement.states.expanded.mainRect, toggle: measurement.states.expanded.toggle, upgrade: { rect: expandedUpgrade.rect, style: expandedUpgrade.style } },
    collapsed: { sidebar: measurement.states.collapsed.sidebarRect, main: mainRect, toggle: measurement.states.collapsed.toggle, upgrade: { rect: collapsedUpgrade.rect, style: collapsedUpgrade.style, label: { rect: collapsedUpgradeLabel.rect, style: collapsedUpgradeLabel.style, text: collapsedUpgradeLabel.ownText } }, menu: menuPaints },
    activeCollapsedHome,
    editor,
  },
  colorEvidence: colors.evidence,
};
const runnerPlan = structuredClone(plan);
runnerPlan.sourceEvidence = plan.sourceEvidence.map(({ path, line, quote }) => ({ path, line, quote }));
// 대조표 · 정책 산문은 계획에만 남긴다 — 러너는 역할 이름(`figma.paints`)과 변수 이름만 읽는다.
delete runnerPlan.colorEvidence;
delete runnerPlan.figma.$bindingPolicy;
const draw = `// Generated by scripts/build-figma-product-sidebar-states.mjs. Do not edit by hand.\nconst PLAN=${JSON.stringify(runnerPlan)};\n${readFileSync(resolve(repoRoot, RENDERER_LIB), "utf8")}${readFileSync(templatePath, "utf8")}`;
// `use_figma` 의 code 인자는 50,000자(String.length — 바이트가 아니다)가 상한이다(형제 생성기와 같은 벽).
if (draw.length > 50_000) fail(`Figma runner exceeds connector limit: ${draw.length}`);
const outputs = [
  { absolute: planPath, expected: `${JSON.stringify(plan, null, 2)}\n` },
  { absolute: drawPath, expected: draw },
];
if (checkOnly) {
  for (const output of outputs) {
    if (readFileSync(output.absolute, "utf8") !== output.expected) fail(`generated output drift: ${output.absolute.slice(repoRoot.length + 1)}`);
  }
} else {
  atomicWriteBatch(outputs);
}
console.log(`[figma-product-sidebar-states] ${checkOnly ? "checked" : "built"} @ ${plan.productCommit.slice(0, 8)}: 5 rail variants · editor grid ${assets}/${assetsDivider}/FILL/${propertiesDivider}/${properties} × FILL/${timelineDivider}/${timeline} · shell inset ${shellInset}`);
