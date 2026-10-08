import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import ts from "typescript";
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
  sourceQuote("apps/web/app/globals.css", 157, "  --app-gnb-main-inline-padding: var(--louis-layout-app-shell-content-inset);"),
  sourceQuote(EDITOR, 164, '  "[padding:0]",'),
  sourceQuote(VEM, 1843, '    "[.vem-modal&]:[width:calc(100%_-_var(--app-gnb-main-inline-padding)_*_2)]",'),
  sourceQuote(VEM, 1846, '    "[.vem-modal&]:[height:calc(100%_-_var(--app-gnb-main-inline-padding)_*_2)]",'),
  sourceQuote(VEM, 1860, '    "[.vem-modal&]:[margin:var(--app-gnb-main-inline-padding)]",'),
];
// **네 줄은 값이 아니라 스코프가 바뀌었다.** 제품 8a90e3f6 「모바일에서 무너져 있던 격자를 한 열로
// 세운다」가 데스크톱 격자를 `[@media(min-width:720px)]:` 안으로 넣었다 — 같은 레이어·같은 특이도라
// Tailwind 정렬 순서로 승패가 갈려 375px 에서 5트랙 격자가 이기던 것을 상호배타 변형으로 가른 것이다.
const gridSources = [
  sourceQuote(VEM, 1637, '    "[@media(min-width:720px)]:[grid-template-columns:var(--video-edit-assets-width,_317px)_4px_minmax(0,_1fr)_4px_var(--video-edit-properties-width,_240px)]",'),
  sourceQuote(VEM, 1638, '    "[@media(min-width:720px)]:[grid-template-rows:minmax(0,_1fr)_4px_var(--video-edit-timeline-height,_332px)]",'),
  sourceQuote(VEM, 1640, '    "[@media(min-width:720px)]:[column-gap:2px]",'),
  sourceQuote(VEM, 1641, '    "[@media(min-width:720px)]:[row-gap:2px]",'),
];
const [assets, assetsDivider, propertiesDivider, properties] = declaredTrack(
  gridSources[0], /\(--video-edit-assets-width,_(\d+)px\)_(\d+)px_minmax\(0,_1fr\)_(\d+)px_var\(--video-edit-properties-width,_(\d+)px\)/, "grid columns");
const [timelineDivider, timeline] = declaredTrack(
  gridSources[1], /minmax\(0,_1fr\)_(\d+)px_var\(--video-edit-timeline-height,_(\d+)px\)/, "grid rows");
const [columnGap] = declaredTrack(gridSources[2], /\[column-gap:(\d+)px\]/, "column gap");
const [rowGap] = declaredTrack(gridSources[3], /\[row-gap:(\d+)px\]/, "row gap");
// **속성 판 안쪽은 제품 선언을 따른다(2026-09-22, S7 판정 결함 2).** S7 이 속성 트랙을 제품 값 240 으로 옮기자 판 안의 손 조립
// 내용(`propertiesPanelInner` 흉내 — 세로 Auto Layout, 옛 폭 324 · 패딩 16)이 324 자리 그대로 남아 값 열이 오른쪽에서 잘렸다
// (「1920 × 1080」 · 「크로스 디졸브」). 러너는 매 실행 그 안쪽 프레임을 판 폭에 맞추고(가로 STRETCH) 제품의 안쪽 여백과 행 가로
// 패딩을 건다 — 위치 · 폭 · 자동 배치 속성만이다. 행은 이미 이름 왼쪽 · 값 오른쪽(SPACE_BETWEEN)이라 정렬은 그대로 둔다.
//   판 안쪽 여백 8 · 간격 0 — `propertiesPanelInner`(vemClass.ts:3493 · :3500 · :3505, 「Figma 1087:2491 pad 8 → 행 폭 224」)
//   행 가로 패딩 8 · 양 끝 정렬 — `inspectorField` 의 속성 판 분기(vemClass.ts:1047 · :1073)
const propertiesPanelSources = [
  sourceQuote(VEM, 3488, '    "vem-propertiesPanel-inner",'),
  sourceQuote(VEM, 3495, '    "[padding:8px]",'),
  sourceQuote(VEM, 3500, '    "[gap:0]",'),
  sourceQuote(VEM, 1056, '    "[justify-content:space-between]",'),
  sourceQuote(VEM, 1082, '    "[.vem-propertiesPanel_&]:[padding:0_8px]",'),
];
const [propertiesInnerPadding] = declaredTrack(propertiesPanelSources[1], /^\s*"\[padding:(\d+)px\]",$/, "properties panel inner padding");
const [propertiesInnerGap] = declaredTrack(propertiesPanelSources[2], /^\s*"\[gap:(\d+)\]",$/, "properties panel inner gap");
const [propertiesRowPaddingInline] = declaredTrack(propertiesPanelSources[4], /\[padding:0_(\d+)px\]/, "properties row inline padding");
// **이 장면은 앵커에서 제품 상태가 아니다 — 기록한다.** 편집 화면은 이제 노드 캔버스처럼 풀화면이라
// `variant="create"` 가 사이드바를 끈다(EditorProjectWorkspace.tsx:1120–1124). 접힌 레일 + 편집기 조합은
// 옛 앵커의 장면이다. 격자 트랙과 셸 인셋은 그대로 제품 값이라 옮기지만, 장면 구성을 풀화면으로 다시 짓는
// 일은 이 생성기의 레일 측정(`/settings` 접힘)으로는 닿지 않는다 — 편집기 경로를 재는 측정이 먼저다.
const compositionSources = [
  sourceQuote(EDITOR, 1184, "        /* 프로젝트를 연 편집 화면은 노드 캔버스와 같이 **풀화면**이다. 사이드바가 차지하던"),
  sourceQuote(EDITOR, 1188, '        variant="create"'),
];
const editor = {
  $why:
    "Declared tracks only; the 1fr preview column, the 1fr upper row and the body size are FILL in Figma. " +
    "The shell inset is the measured --app-gnb-main-inline-padding on all four sides (vemClass modalShellDocked margin + calc(100% - inset * 2)). " +
    "The top bar hugs: padding and gap from the measured desktop bar, controls and profile at their declared sizes (app-shell plan). " +
    "The properties panel's hand-assembled inner frame follows the track width (STRETCH) with the product's inner padding and row inline padding (vemClass propertiesPanelInner · inspectorField).",
  shellInset: Number(shellInset),
  columns: { assets, assetsDivider, preview: "FILL", propertiesDivider, properties },
  rows: { upper: "FILL", timelineDivider, timeline },
  columnGap,
  rowGap,
  propertiesPanel: { innerPadding: propertiesInnerPadding, innerGap: propertiesInnerGap, rowPaddingInline: propertiesRowPaddingInline },
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
    gray300: { name: "color/gray/300", declared: [quote.product(GNB, 571, '    "[.gnb-menuSidebar_.gnb-menuLink:not(&)]:[color:var(--gray-300)]",')] },
    gray000: { name: "color/gray/000", declared: [quote.product(GNB, 577, '    "[color:var(--gray-000)]",')] },
    paletteGray100: { collection: "Klipse Primitive", name: "color/palette-gray/100", declared: [quote.product(GNB, 2000, '    "[html[data-theme=dark]_.gnb-sidebarUpgradeButton:not(&)]:[background:var(--palette-gray-100)]",')] },
    paletteGray900: { collection: "Klipse Primitive", name: "color/palette-gray/900", declared: [quote.product(GNB, 2001, '    "[html[data-theme=dark]_.gnb-sidebarUpgradeButton:not(&)]:[color:var(--palette-gray-900)]",')] },
    // 편집기 상단 바 아래 선은 제품이 **선언한** 칠이지만 이 측정(`desktop-1920x1080-dark` 사이드바 상태)이 재지 않는 자리다 —
    // 주석 잉크(문서 프레임)와 다른 종류라 선언 인용을 붙이고 `unmeasured` 로 둔다(측정 대조 없음, `exact: null`).
    topBarDivider: {
      name: "color/stroke-hairline",
      declared: [quote.product(GNB, 476, '    "[border-bottom:var(--louis-border-width-hairline)_solid_color-mix(_in_srgb,_var(--louis-color-stroke-hairline)_calc(var(--mainchrome-divider-progress,_1)_*_100%),_transparent_)]",')],
      unmeasured: "editor top bar bottom line — not measured by this fixture (creation-only path); the same token the app-shell plan binds",
    },
    // 측정 섹션의 바닥 — 형제 세트 러너(체크아웃 · 결제 장면 · 업그레이드 · 컴포넌트)와 같은 주석 역할. 섹션이 측정 모드(Dark)를
    // 가지므로 이 칠도 Dark 로 풀린다 — 마스터 미리보기가 측정 문맥과 같은 바닥 위에 놓인다.
    boardSurface: { name: "color/bg-canvas", annotation: "section fill behind the measured rail set · CTA · top bar (board canvas, not a product surface)" },
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

/* **편집 장면은 id 가 아니라 이름 · 구조로 찾는다(2026-09-15).** 옛 `install` 은 편집 장면의 노드 id 열다섯을 실었고, 그중
   옛 레일 · 옛 헤더 · breadcrumb · 액션 · 프로필 원본(39:4 · 39:11 · 39:12 · 39:13 · 75:525 · 39:14)은 2026-08-24 라이브 교체 뒤로
   파일에 없다. 러너는 그 id 를 세트 칠을 쓴 **뒤에** 찾다 던질 자리였다(부분 적용). 이제 계획은 보드 프레임 하나(`sceneFrameId`
   — 앱 화면 계획의 `frameId` 와 같은 종류의 닻)와 그 프레임의 이름 머리(측정 문맥 뷰포트 · 편집기 route)를 싣고, 러너가 그 아래를
   생성기가 지은 이름(`modalBody · product CSS grid` 등)과 자리로 찾는다. 편집기 판 셋은 이름이 손 조립 주석이라 자리(디바이더
   사이)로 찾는다.
   레일 · 상단 바 인스턴스 이름과 상단 바 컴포넌트 이름은 제품 개명(VideoEditor → Composition)을 따른다 — 개명은 레일 행의 측정
   aria(`Composition`)가 소유한다. 옛 인스턴스 이름은 같은 노드를 찾을 때만 쓰고, 찾으면 새 이름으로 바꾼다. */
const editorCurrent = byAria("collapsed", "Composition").ariaLabel;
const editorRoute = EDITOR.replace(/^apps\/web\/app/, "").replace(/\/[^/]+\.tsx$/, "");
const viewportName = measurement.context.id.split("-")[0];
const sceneFramePrefix = `${viewportName} ${measurement.context.viewport.width}×${measurement.context.viewport.height} — ${editorRoute} (`;
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
    ...propertiesPanelSources,
    ...compositionSources,
    // 제품이 `mainChromeLeadingCluster` 의 인라인 선언을 걷고 LOUIS 레시피로 넘겼다(e5d49507).
    // `[gap:4px]` 리터럴은 이제 제품에 없다 — 같은 4px 을
    // `.louis-app-top-bar__leading { gap: var(--louis-space-control-xs) }`(app-shell.css:154-156)이
    // 소유한다. 사라진 리터럴을 계속 인용하면 값이 아니라 **소유자**가 바뀐 사실이 지워진다.
    sourceQuote("apps/web/components/navigation/Gnb.tsx", 300, '    "louis-app-top-bar__leading",'),
    sourceQuote("apps/web/components/navigation/Gnb.tsx", 461, '    "[padding:8px_var(--mainchrome-pad-x)]",'),
    sourceQuote("apps/web/app/videoeditor/[projectId]/EditorProjectWorkspace.tsx", 1169, '        <path'),
    sourceQuote("apps/web/app/videoeditor/[projectId]/EditorProjectWorkspace.tsx", 1170, '          d="M19 12H5M5 12L11 6M5 12L11 18"'),
    sourceQuote("apps/web/components/navigation/Gnb.tsx", 1986, '    "[html[data-app-gnb-sidebar-collapsed=true]_&]:[height:32px]",'),
    sourceQuote("apps/web/components/navigation/Gnb.tsx", 1987, '    "[html[data-app-gnb-sidebar-collapsed=true]_&]:[padding:0_10px]",'),
    sourceQuote("apps/web/components/navigation/Gnb.tsx", 2026, '    "[html[data-app-gnb-sidebar-collapsed=true]_&]:[text-overflow:ellipsis]",'),
    sourceQuote("apps/web/components/navigation/Gnb.tsx", 2027, '    "[html[data-app-gnb-sidebar-collapsed=true]_&]:[font-size:var(--type-caption-12-size)]",'),
  ],
  figma: {
    pageId: "240:3529",
    componentSetName: "Product/Gnb Desktop Rail",
    collapsedUpgradeMasterName: "Product/Gnb Collapsed Upgrade CTA",
    topBarName: `Product/Desktop ${editorCurrent} Top Bar · Sidebar=Collapsed`,
    // **측정 모드는 이 섹션에 한 번만 건다(2026-09-22, S7 판정 결함 1).** 옛 러너는 레일 variant · 접힌 CTA 인스턴스 · 편집기 상단 바
    // 마스터에 `Klipse Semantic Color=Dark` 를 명시했다. 마스터에 건 모드는 인스턴스로 번지므로, 라이트 보드 `39:3` 안 상단 바
    // 인스턴스의 글자가 #fafafa 로 풀려 대비가 11.89 → 1.69:1 이 됐다(제품 어느 테마에도 없는 상태). 이제 러너는 이 섹션에만
    // 측정 모드를 걸고(세트 페이지의 마스터 미리보기 = 측정 문맥), 마스터 · variant · 인스턴스의 명시 모드는 걷어 놓인 자리의
    // 모드를 따르게 한다. 형제 세트의 섹션(I~P)도 섹션에 측정 모드를 걸지만, 앱 셸 · 컴포넌트 러너는 variant · 마스터에도 건다 —
    // 그쪽 소비처는 따로 세야 한다(Updates (152) 「남은 것」). 생성기는 아래에서 템플릿의 `pin` 이 이 섹션 밖을 가리키면 멈춘다.
    // 이름 머리는 **Q** 다 — 옛 계획의 「M · …」 섹션은 라이브에 한 번도 지어지지 않았고(러너가 이 이름을 읽지 않았다), 그 사이
    // 「M」은 결제 장면 섹션(`406:629`)이 가졌다. 세트 페이지 섹션은 A~P 가 쓰이고 있다(2026-09-22 읽기 전용 탐침).
    sectionName: "Q · product/Desktop collapsed shell · measured component",
    iconComponents: {
      Search: "icon/MagnifyingGlass",
      Home: "icon/House",
      // 통합 판(DS-D-0079)의 사이드바는 Canvas.svg · FilmSlate.svg 를 쓴다(2026-10-08 LOUIS 마스터 icon/Canvas · icon/FilmSlate 를 세움).
      Canvas: "icon/Canvas",
      Composition: "icon/FilmSlate",
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
      $why:
        "One board frame anchors the scene (checked by its name prefix); everything below it is found by the names this generator gives and by position. " +
        "The runner finds every target before its first write and throws if one is missing or ambiguous.",
      sceneFrameId: "39:3",
      sceneFramePrefix,
      editorCurrent,
      // 첫 이름이 지금 이름이다. 뒤는 같은 노드를 찾을 때만 쓰는 옛 이름(제품 개명 전)이다.
      railInstanceNames: [`gnb/Current=${editorCurrent} · measured collapsed`, "gnb/Current=VideoEditor · measured collapsed"],
      topBarInstanceNames: [`topbar/${editorCurrent} · Sidebar=Collapsed`, "topbar/VideoEditor · Sidebar=Collapsed"],
      bodyName: "modalBody · product CSS grid",
      upperRowName: "grid row / assets + preview + properties",
      assetsDividerName: "assets-divider · 4px column",
      propertiesDividerName: "properties-divider · 4px column",
      timelineDividerName: "timeline-divider · 4px row",
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
// **찾기 구간에는 쓰기가 없다(2026-09-15).** 렌더러는 「── 1. 찾기」에서 필요한 대상을 전부 찾고 「── 2. 쓰기」부터 쓴다.
// 그 앞에 노드 속성 대입 · 트리 변경 · 생성 호출이 섞이면, 대상이 없을 때 쓴 채로 던지는 옛 부분 적용이 소리 없이 돌아온다.
// 모의 Figma 로만 보던 것을 생성기가 템플릿 글자에서 기계로 본다(주석은 뺀다). 공용 조각(변수 풀이)은 템플릿 밖이다.
//
// **허용 목록이다(2026-09-21, 앵커 리뷰 minor).** 첫 판은 쓰기 꼴을 정규식으로 적은 금지 목록이라, 목록에 없는 쓰기
// (`setPluginData` · `setRangeFontSize` · 새 API)는 소리 없이 지나갔다. 이제 찾기 구간을 TypeScript 파서로 읽어
//   · 메서드 호출은 아래 읽기 이름만 — 로컬 `new Map()` 의 `set` 은 그 이름에 묶인 것만,
//   · 맨 이름 호출은 찾기 구간이 스스로 선언한 함수(본문도 이 검사를 받는다)와 변수 풀이 `liveVariables` 만 — 그 반환에서
//     꺼낸 `pin` · `paint` 같은 쓰기 도구는 선언이 함수 식이 아니라 막힌다,
//   · 속성 대입 · `delete` · 속성 증감은 전부 금지, 첨자 대입은 찾기 구간이 객체 · 배열 리터럴로 선언한 로컬에만,
//   · `new` 는 Map · Set · Error 만
// 허용한다. 읽기 이름이 하나 더 필요해지면 이 목록에 더하고 그 이름이 노드를 바꾸지 않는다는 근거를 옆에 적는다.
{
  const template = readFileSync(templatePath, "utf8");
  const findStart = template.indexOf("// ── 1. 찾기");
  const writeStart = template.indexOf("// ── 2. 쓰기");
  if (findStart < 0 || writeStart < findStart) fail("renderer template lost its 「── 1. 찾기」 · 「── 2. 쓰기」 sections");
  const findPhase = ts.createSourceFile("find-phase.mjs", template.slice(0, writeStart), ts.ScriptTarget.Latest, true, ts.ScriptKind.JS);
  if (findPhase.parseDiagnostics?.length) fail(`renderer find phase does not parse: ${findPhase.parseDiagnostics.map((entry) => ts.flattenDiagnosticMessageText(entry.messageText, " ")).join(" | ")}`);
  const READ_METHODS = new Set([
    // Figma — 문서를 바꾸지 않는다(`setCurrentPageAsync` 는 보는 페이지만 옮긴다).
    "getNodeByIdAsync", "setCurrentPageAsync", "loadFontAsync", "findAllWithCriteria", "findAll", "findOne", "findChild", "findChildren",
    "getStyledTextSegments",
    // 배열 · 문자열 · Map · Promise · JSON 읽기
    "filter", "find", "some", "every", "map", "flatMap", "forEach", "join", "includes", "startsWith", "endsWith", "indexOf", "slice",
    "has", "get", "values", "keys", "entries", "all", "stringify",
  ]);
  const READ_CALLEES = new Set(["liveVariables"]);
  const NEW_ALLOWED = new Set(["Map", "Set", "Error"]);
  const localMaps = new Set();
  const localLiterals = new Set();
  const localFunctions = new Set();
  const collect = (node) => {
    if (ts.isVariableDeclaration(node) && ts.isIdentifier(node.name) && node.initializer) {
      const init = node.initializer;
      if (ts.isNewExpression(init) && ts.isIdentifier(init.expression) && (init.expression.text === "Map" || init.expression.text === "Set")) localMaps.add(node.name.text);
      if (ts.isObjectLiteralExpression(init) || ts.isArrayLiteralExpression(init)) localLiterals.add(node.name.text);
      if (ts.isArrowFunction(init) || ts.isFunctionExpression(init)) localFunctions.add(node.name.text);
    }
    if (ts.isFunctionDeclaration(node) && node.name) localFunctions.add(node.name.text);
    ts.forEachChild(node, collect);
  };
  collect(findPhase);
  const rootName = (expression) => {
    let node = expression;
    while (ts.isPropertyAccessExpression(node) || ts.isElementAccessExpression(node) || ts.isParenthesizedExpression(node) || ts.isNonNullExpression?.(node)) node = node.expression;
    return ts.isIdentifier(node) ? node.text : null;
  };
  const isAssignment = (kind) => kind >= ts.SyntaxKind.FirstAssignment && kind <= ts.SyntaxKind.LastAssignment;
  const violations = [];
  const flag = (node, why) => violations.push(`${findPhase.getLineAndCharacterOfPosition(node.getStart(findPhase)).line + 1}: ${why} — ${node.getText(findPhase).replace(/\s+/g, " ").slice(0, 80)}`);
  const check = (node) => {
    if (ts.isCallExpression(node)) {
      const callee = node.expression;
      if (ts.isPropertyAccessExpression(callee)) {
        const name = callee.name.text;
        if (name === "set" || name === "add") {
          if (!localMaps.has(rootName(callee.expression)) || !ts.isIdentifier(callee.expression)) flag(node, `${name}() 는 찾기 구간의 로컬 Map · Set 에만`);
        } else if (!READ_METHODS.has(name)) flag(node, `허용 목록 밖 메서드 ${name}()`);
      } else if (ts.isIdentifier(callee)) {
        if (!READ_CALLEES.has(callee.text) && !localFunctions.has(callee.text)) flag(node, `허용 목록 밖 호출 ${callee.text}()`);
      } else if (!ts.isParenthesizedExpression(callee)) {
        flag(node, "이름으로 가릴 수 없는 호출");
      }
    } else if (ts.isNewExpression(node)) {
      if (!ts.isIdentifier(node.expression) || !NEW_ALLOWED.has(node.expression.text)) flag(node, "허용 목록 밖 new");
    } else if (ts.isBinaryExpression(node) && isAssignment(node.operatorToken.kind)) {
      const target = node.left;
      if (ts.isPropertyAccessExpression(target)) flag(node, "속성 대입");
      else if (ts.isElementAccessExpression(target) && !(ts.isIdentifier(target.expression) && localLiterals.has(target.expression.text))) flag(node, "로컬 리터럴이 아닌 첨자 대입");
    } else if (ts.isDeleteExpression(node)) {
      flag(node, "delete");
    } else if ((ts.isPrefixUnaryExpression(node) || ts.isPostfixUnaryExpression(node)) &&
      (node.operator === ts.SyntaxKind.PlusPlusToken || node.operator === ts.SyntaxKind.MinusMinusToken) && !ts.isIdentifier(node.operand)) {
      flag(node, "속성 증감");
    }
    ts.forEachChild(node, check);
  };
  check(findPhase);
  if (violations.length) fail(`renderer writes before its find phase ends (허용 목록 밖 · 템플릿 줄): ${violations.join(" | ").slice(0, 600)}`);
}
// **측정 모드는 측정 섹션에만 건다(2026-09-22, S7 판정 결함 1).** 마스터 · variant · 인스턴스에 명시 모드를 걸면 그 모드가
// 인스턴스로 번져, 놓인 자리(라이트 보드)의 모드를 이긴다 — S7 이 상단 바 마스터에 Dark 를 걸어 라이트 보드의 글자를 흰색으로
// 만든 자리다. 템플릿 전체를 TypeScript 파서로 읽어 다음만 허용한다:
//   · `pin(measuredSection)` — 공용 조각의 `pin` 을 섹션 하나에만 부른다(인자가 정확히 그 이름 하나),
//   · 구조 분해로 `pin` 을 받는 자리(`const { pin, … } = await liveVariables(…)`).
// 그 밖의 `pin` 참조(다른 인자 · 값으로 넘기기 · 별칭)와 `setExplicitVariableModeForCollection` 직접 호출은 전부 멈춘다.
// 모드를 걷는 `clearExplicitVariableModeForCollection` 은 막지 않는다 — 러너가 전에 걸었던 명시 모드를 걷는 길이다.
{
  const template = readFileSync(templatePath, "utf8");
  const whole = ts.createSourceFile("renderer.mjs", template, ts.ScriptTarget.Latest, true, ts.ScriptKind.JS);
  const SECTION = "measuredSection";
  const offenders = [];
  const flag = (node, why) => offenders.push(`${whole.getLineAndCharacterOfPosition(node.getStart(whole)).line + 1}: ${why} — ${node.getText(whole).replace(/\s+/g, " ").slice(0, 80)}`);
  const onlySection = (call) => call.arguments.length === 1 && ts.isIdentifier(call.arguments[0]) && call.arguments[0].text === SECTION;
  const visit = (node) => {
    // 멤버 이름 자리(`x.pin`)는 아래 속성 접근 갈래가 본다.
    if (ts.isIdentifier(node) && node.text === "pin" && !(ts.isPropertyAccessExpression(node.parent) && node.parent.name === node)) {
      const parent = node.parent;
      if (ts.isCallExpression(parent) && parent.expression === node) {
        if (!onlySection(parent)) flag(parent, `pin() 은 ${SECTION} 에만`);
      } else if (!(ts.isBindingElement(parent) && parent.name === node && ts.isObjectBindingPattern(parent.parent))) {
        flag(parent, "pin 을 호출 밖에서 참조(값으로 넘기기 · 별칭)");
      }
    }
    if (ts.isPropertyAccessExpression(node) && ts.isIdentifier(node.name)) {
      if (node.name.text === "setExplicitVariableModeForCollection") flag(node, "setExplicitVariableModeForCollection 직접 호출");
      if (node.name.text === "pin" && !(ts.isCallExpression(node.parent) && node.parent.expression === node && onlySection(node.parent))) flag(node, `.pin 은 ${SECTION} 에만`);
    }
    ts.forEachChild(node, visit);
  };
  visit(whole);
  if (!template.includes(`pin(${SECTION})`)) offenders.push(`0: pin(${SECTION}) 이 없다 — 측정 섹션이 측정 모드를 갖지 않으면 마스터 미리보기가 측정 문맥과 다르다`);
  if (offenders.length) fail(`renderer pins a variable mode outside the measured section (마스터 · variant · 인스턴스는 놓인 자리의 모드를 따른다 · 템플릿 줄): ${offenders.join(" | ").slice(0, 600)}`);
}
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
