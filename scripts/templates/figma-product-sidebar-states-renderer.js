const F = PLAN.figma;
const page = await figma.getNodeByIdAsync(F.pageId);
if (!page || page.type !== "PAGE") throw new Error("Missing product assets page");
await figma.setCurrentPageAsync(page);
// **찾기가 먼저, 쓰기는 그 뒤다(2026-09-15).** 옛 러너는 접힌 CTA 마스터 · 레일 세트의 칠을 먼저 쓰고 나서야 편집 장면의
// 옛 노드 id(옛 레일 · 옛 헤더 · breadcrumb · 액션 · 프로필 원본)를 찾았다. 그 노드들은 2026-08-24 라이브 교체 뒤로 파일에
// 없어, 적용하면 세트를 칠한 채 「Missing video editor scene targets」로 던질 자리였다(부분 적용). 이제 이 러너는
//   1. 쓰기 없이 필요한 대상을 **전부** 찾는다 — 편집 장면은 보드 프레임 하나(`install.sceneFrameId`, 이름으로 확인)에서
//      내려가며 이름과 구조로 찾고, 원본 id 는 싣지 않는다. 하나라도 없거나 둘이면 여기서 던진다.
//   2. 그 뒤에만 칠하고 짓고 옮긴다.
// 새로 짓는 경로가 남은 것은 세트 · variant · 마스터 · 인스턴스뿐이다(원본이 필요 없다). 편집기 상단 바 컴포넌트는 원본
// (옛 헤더의 breadcrumb · 액션 · 프로필)을 복제해 지었으므로 원본이 사라진 지금 새로 지을 수 없다 — 없으면 던진다.
//
// 변수 · 모드 · 칠은 공용 조각(`scripts/templates/lib/figma-live-variables.js`, 생성기가 앞에 붙인다)이 푼다. 이 측정은 다크
// 문맥이라 계획의 `bindings.mode` 가 `Dark` 다. 칠하는 자리는 역할 이름(`F.paints`)만 읽는다.
const { pin, paint } = await liveVariables(F.bindings);
const I = F.install;
const found = (list, label) => {
  if (list.length > 1) throw new Error(`Ambiguous ${label}: ${list.map((entry) => `${entry.id} ${entry.name}`).join(" · ")}`);
  return list[0] ?? null;
};
const need = (node, label) => {
  if (!node) throw new Error(`Missing ${label}`);
  return node;
};

// ── 1. 찾기(쓰기 없음) ───────────────────────────────────────────────────────────────
const componentByName = new Map();
for (const component of page.findAllWithCriteria({ types: ["COMPONENT"] })) {
  if (!componentByName.has(component.name)) componentByName.set(component.name, component);
}
const icons = {};
// 키는 계획의 `iconComponents` 이름이다 — 제품이 NodeCanvas · VideoEditor 를 Canvas · Composition 으로 개명한 뒤(2026-09-10
// 재고정) 렌더러가 옛 키를 찾아 첫머리에서 던지고 있었다.
for (const key of ["Search", "Home", "Canvas", "Composition", "Highlight", "YouTube", "logo", "expand"]) {
  icons[key] = need(componentByName.get(F.iconComponents[key]), `component ${F.iconComponents[key]}`);
}
const upgradeSet = page.findOne((entry) => entry.type === "COMPONENT_SET" && entry.name === "Product/Gnb Upgrade CTA");
need(upgradeSet?.children.find((entry) => entry.type === "COMPONENT" && entry.name === F.iconComponents.upgrade), "measured white Upgrade CTA");
await figma.loadFontAsync({ family: "Pretendard", style: "Medium" });
const existingCollapsedMaster = found(
  page.findAll((entry) => entry.type === "COMPONENT" && entry.name === F.collapsedUpgradeMasterName),
  `component ${F.collapsedUpgradeMasterName}`,
);
let railSet = found(page.findAll((entry) => entry.type === "COMPONENT_SET" && entry.name === F.componentSetName), `component set ${F.componentSetName}`);

// 편집 장면 — 보드 프레임에서 내려가며 이름 · 구조로 찾는다.
const video = await figma.getNodeByIdAsync(I.sceneFrameId);
if (!video || video.type !== "FRAME" || !video.name.startsWith(I.sceneFramePrefix)) {
  throw new Error(`Missing video editor scene frame ${I.sceneFrameId} named ${JSON.stringify(`${I.sceneFramePrefix}…`)}`);
}
const railInstance = found(
  video.children.filter((entry) => entry.type === "INSTANCE" && (I.railInstanceNames.includes(entry.name) ||
    (entry.mainComponent?.parent?.type === "COMPONENT_SET" && entry.mainComponent.parent.name === F.componentSetName))),
  `rail instance in ${video.name}`,
);
const main = need(
  found(video.children.filter((entry) => entry.type === "FRAME" && entry.children.some((child) => child.type === "FRAME" && child.name === I.bodyName)), `main card in ${video.name}`),
  `main card (FRAME holding ${I.bodyName}) in ${video.name}`,
);
const strays = (parent, known) => parent.children.filter((entry) => entry.visible && !known.some((node) => node && node.id === entry.id));
{
  const extra = strays(video, [railInstance, main]);
  if (extra.length) throw new Error(`Unexpected visible scene children in ${video.name}: ${extra.map((entry) => `${entry.id} ${entry.name}`).join(" · ")}`);
}
const topBar = need(
  found(page.findAll((entry) => entry.type === "COMPONENT" && entry.name === F.topBarName), `component ${F.topBarName}`),
  `component ${F.topBarName} — its breadcrumb · actions · profile sources are retired, so this runner does not build it`,
);
const child = (parent, predicate, label) => need(found(parent.children.filter(predicate), `${label} in ${parent.name}`), `${label} in ${parent.name}`);
const leadingCluster = child(topBar, (entry) => entry.type === "FRAME" && entry.name === "mainChromeLeadingCluster", "leading cluster");
const breadcrumbNode = child(topBar, (entry) => entry.name.startsWith("breadcrumb/"), "breadcrumb");
const profileCluster = child(topBar, (entry) => entry.type === "FRAME" && entry.name === "mainChromeProfileCluster", "profile cluster");
if (breadcrumbNode.type === "TEXT") {
  // 글자 크기 속성(textAutoResize · 말줄임)도 글꼴이 없으면 쓰지 못한다 — 쓰기 전에 그 노드의 현재 글꼴을 싣는다.
  const fonts = new Map(breadcrumbNode.getStyledTextSegments(["fontName"]).map((segment) => [`${segment.fontName.family} · ${segment.fontName.style}`, segment.fontName]));
  await Promise.all([...fonts.values()].map((font) => figma.loadFontAsync(font)));
}
const topBarInstances = main.children.filter((entry) => entry.type === "INSTANCE" && (entry.mainComponent?.id === topBar.id || I.topBarInstanceNames.includes(entry.name)));
const topBarInstance = found(topBarInstances, `top bar instance in ${main.name}`);
if (topBarInstance && topBarInstance.mainComponent?.id !== topBar.id) {
  throw new Error(`Top bar instance ${topBarInstance.id} points at ${topBarInstance.mainComponent?.name ?? "no component"}, not ${F.topBarName}`);
}
const body = child(main, (entry) => entry.type === "FRAME" && entry.name === I.bodyName, "editor body");
{
  const extra = strays(main, [topBarInstance, body]);
  if (extra.length) throw new Error(`Unexpected visible children in ${main.name}: ${extra.map((entry) => `${entry.id} ${entry.name}`).join(" · ")}`);
}
const upper = child(body, (entry) => entry.type === "FRAME" && entry.name === I.upperRowName, "upper grid row");
const timelineDivider = child(body, (entry) => entry.type === "FRAME" && entry.name === I.timelineDividerName, "timeline divider");
const timeline = need(
  found(body.children.filter((entry) => entry.visible && entry.id !== upper.id && entry.id !== timelineDivider.id), `timeline in ${body.name}`),
  `timeline in ${body.name}`,
);
const assetsDivider = child(upper, (entry) => entry.type === "FRAME" && entry.name === I.assetsDividerName, "assets divider");
const propertiesDivider = child(upper, (entry) => entry.type === "FRAME" && entry.name === I.propertiesDividerName, "properties divider");
// 위 줄의 판 셋은 이름이 아니라 **자리**로 찾는다 — 디바이더 둘을 뺀 보이는 자식이 정확히 셋이고, 에셋 · 디바이더 · 미리보기 ·
// 디바이더 · 속성 순서여야 한다(판 이름은 손 조립 주석이라 제품 문구가 바뀌면 흔들린다).
const [assets, preview, properties] = (() => {
  const panels = upper.children.filter((entry) => entry.visible && entry.id !== assetsDivider.id && entry.id !== propertiesDivider.id);
  const order = upper.children.map((entry) => entry.id);
  const at = (node) => order.indexOf(node.id);
  if (panels.length !== 3 || !(at(panels[0]) < at(assetsDivider) && at(assetsDivider) < at(panels[1]) && at(panels[1]) < at(propertiesDivider) && at(propertiesDivider) < at(panels[2]))) {
    throw new Error(`Unexpected editor columns in ${upper.name}: ${upper.children.map((entry) => entry.name).join(" · ")}`);
  }
  return panels;
})();
const gripOf = (divider) => need(found([...divider.children], `grip in ${divider.name}`), `grip in ${divider.name}`);
const nodes = { assets, preview, properties, timeline, assetsGrip: gripOf(assetsDivider), propertiesGrip: gripOf(propertiesDivider), timelineGrip: gripOf(timelineDivider) };

// ── 2. 쓰기 ──────────────────────────────────────────────────────────────────────────
const recolor = (node, role) => {
  for (const field of ["fills", "strokes"]) {
    if (field in node && Array.isArray(node[field])) {
      node[field] = node[field].map((entry) => (entry.type === "SOLID" ? { ...paint(role), visible: entry.visible !== false } : entry));
    }
  }
  if ("children" in node) for (const entry of node.children) recolor(entry, role);
};
const fixed = (node, width, height) => {
  node.resize(width, height);
  if ("primaryAxisSizingMode" in node) node.primaryAxisSizingMode = "FIXED";
  if ("counterAxisSizingMode" in node) node.counterAxisSizingMode = "FIXED";
};

// collapsed Upgrade CTA는 expanded CTA를 32×32로 resize하면 내부 text가 왜곡된다(라이브 QA에서
// rail 하단에 `pgra...`가 튀어나온 원인). 제품 실측대로 전용 32×32 master를 만들어 그 인스턴스를 쓴다.
// 라벨은 12px viewport로 clip되고 안의 text는 실제 폭(WIDTH_AND_HEIGHT)이라 ellipsis 없이 잘린다.
const collapsedUpgradeMaster = (() => {
  if (existingCollapsedMaster) {
    // 기하는 그대로 두고 칠만 역할로 다시 건다 — 옛 마스터는 은퇴한 컬렉션 변수에 묶여 있다.
    existingCollapsedMaster.fills = [paint(F.paints.fillPaint)];
    for (const text of existingCollapsedMaster.findAllWithCriteria({ types: ["TEXT"] })) text.fills = [paint(F.paints.labelPaint)];
    return existingCollapsedMaster;
  }
  const label = PLAN.measurements.collapsed.upgrade.label;
  const button = figma.createComponent();
  button.name = F.collapsedUpgradeMasterName;
  button.layoutMode = "HORIZONTAL";
  button.primaryAxisAlignItems = button.counterAxisAlignItems = "CENTER";
  button.paddingTop = button.paddingBottom = 0;
  button.paddingLeft = button.paddingRight = Number.parseFloat(PLAN.measurements.collapsed.upgrade.style.paddingLeft);
  button.cornerRadius = Number.parseFloat(PLAN.measurements.collapsed.upgrade.style.borderTopLeftRadius);
  button.clipsContent = false;
  fixed(button, PLAN.measurements.collapsed.upgrade.rect.width, PLAN.measurements.collapsed.upgrade.rect.height);
  button.fills = [paint(F.paints.fillPaint)];
  const clip = figma.createFrame();
  clip.name = "label clip · measured 12×18";
  clip.layoutMode = "NONE";
  clip.clipsContent = true;
  clip.fills = [];
  fixed(clip, label.rect.width, label.rect.height);
  const text = figma.createText();
  text.name = "label";
  text.fontName = { family: "Pretendard", style: "Medium" };
  text.characters = label.text;
  text.fontSize = Number.parseFloat(label.style.fontSize);
  text.lineHeight = { unit: "PIXELS", value: Number.parseFloat(label.style.lineHeight) };
  text.letterSpacing = { unit: "PIXELS", value: Number.parseFloat(label.style.letterSpacing) };
  text.textAutoResize = "WIDTH_AND_HEIGHT";
  text.textTruncation = "DISABLED";
  text.fills = [paint(F.paints.labelPaint)];
  clip.appendChild(text);
  text.x = 0;
  text.y = 0;
  button.appendChild(clip);
  page.appendChild(button);
  button.x = 2120;
  button.y = 900;
  return button;
})();

// 레일 variant 하나를 짓는다(세트가 없을 때, 또는 세트에 그 variant 가 없을 때 — 있는 variant 는 지우지도 다시 짓지도 않는다).
// 편집 화면 레일은 제품 개명대로 `Current=Composition` 이다(옛 러너는 라이브에 없는 `Current=VideoEditor` 를 찾았다).
const RAIL_CURRENTS = ["Default", "Home", "Composition", "YouTube", "Upgrade"];
const EDITOR_CURRENT = I.editorCurrent;
const menuItems = [
  ["Search", "Search"], ["Home", "Home"], ["Canvas", "Canvas"],
  ["Composition", "Composition"], ["Highlight", "Highlight"], ["YouTube analytics", "YouTube"],
];
const buildRailVariant = (current) => {
  const root = figma.createComponent();
  root.name = `Current=${current}`;
  root.layoutMode = "VERTICAL";
  root.primaryAxisAlignItems = "SPACE_BETWEEN";
  root.counterAxisAlignItems = "MIN";
  root.paddingTop = root.paddingRight = root.paddingBottom = root.paddingLeft = 12;
  root.fills = [];
  fixed(root, PLAN.measurements.collapsed.sidebar.width, PLAN.measurements.collapsed.sidebar.height);
  pin(root);
  const top = figma.createFrame();
  top.name = "flow/brand-and-menu";
  top.layoutMode = "VERTICAL";
  top.itemSpacing = 12;
  top.fills = [];
  fixed(top, 32, 264);
  const brand = figma.createFrame();
  brand.name = "brand/Klipse · collapsed crop";
  brand.layoutMode = "HORIZONTAL";
  brand.primaryAxisAlignItems = brand.counterAxisAlignItems = "CENTER";
  brand.fills = [];
  fixed(brand, 32, 40);
  const crop = figma.createFrame();
  crop.name = "crop/logo symbol · measured";
  crop.fills = [];
  crop.clipsContent = true;
  fixed(crop, 32, 28);
  const logo = icons.logo.createInstance();
  logo.name = "logo/klipse-dark · 96×28 clipped";
  logo.resize(96, 28);
  logo.x = 4.1406;
  crop.appendChild(logo);
  brand.appendChild(crop);
  const menu = figma.createFrame();
  menu.name = `menu · Current=${current}`;
  menu.layoutMode = "VERTICAL";
  menu.itemSpacing = 4;
  menu.fills = [];
  fixed(menu, 32, 212);
  for (const [label, key] of menuItems) {
    const measured = PLAN.measurements.collapsed.menu.find((entry) => entry.label === label);
    const row = figma.createFrame();
    row.name = `row/${label}`;
    row.layoutMode = "HORIZONTAL";
    row.primaryAxisAlignItems = row.counterAxisAlignItems = "CENTER";
    row.cornerRadius = measured.radius;
    row.fills = [];
    fixed(row, 32, 32);
    const icon = icons[key].createInstance();
    icon.name = `icon/${key}`;
    icon.resize(20, 20);
    const selected = current === key || (current === "YouTube" && key === "YouTube");
    recolor(icon, selected ? F.paints.active : F.paints.inactive);
    row.appendChild(icon);
    menu.appendChild(row);
  }
  top.appendChild(brand);
  top.appendChild(menu);
  root.appendChild(top);
  // expanded CTA를 resize하지 않는다. 제품 실측 32×32 collapsed master의 인스턴스를 놓는다.
  const cta = collapsedUpgradeMaster.createInstance();
  cta.name = "upgrade-cta · measured collapsed";
  pin(cta);
  root.appendChild(cta);
  page.appendChild(root);
  return root;
};
if (!railSet) {
  railSet = figma.combineAsVariants(RAIL_CURRENTS.map(buildRailVariant), page);
  railSet.name = F.componentSetName;
  railSet.description = `Measured collapsed desktop Gnb · ${PLAN.productCommit}`;
} else {
  for (const current of RAIL_CURRENTS) {
    const variant = railSet.children.find((entry) => entry.type === "COMPONENT" && entry.name === `Current=${current}`);
    if (!variant) {
      railSet.appendChild(buildRailVariant(current));
      continue;
    }
    // 있는 variant 는 기하를 두고 모드와 행 아이콘 잉크만 역할로 다시 건다(계획의 행 이름이 아닌 옛 행은 비활성 잉크).
    pin(variant);
    for (const row of variant.findAll((entry) => entry.type === "FRAME" && entry.name.startsWith("row/"))) {
      const key = menuItems.find(([label]) => row.name === `row/${label}`)?.[1];
      for (const icon of row.findAllWithCriteria({ types: ["INSTANCE"] })) recolor(icon, key === current ? F.paints.active : F.paints.inactive);
    }
  }
}

const railMaster = railSet.children.find((entry) => entry.type === "COMPONENT" && entry.name === `Current=${EDITOR_CURRENT}`);
// 옛 러너가 놓은 인스턴스(`gnb/Current=VideoEditor · …`)는 같은 노드를 새 variant 로 바꿔 쓰고 이름도 제품 개명대로 고친다 —
// 새로 하나 더 놓지 않는다.
let rail = railInstance;
if (!rail) {
  rail = railMaster.createInstance();
  video.insertChild(0, rail);
} else if (rail.mainComponent?.id !== railMaster.id) rail.swapComponent(railMaster);
rail.name = I.railInstanceNames[0];
rail.resize(56, 1080);
video.layoutMode = "HORIZONTAL";
video.itemSpacing = 0;
fixed(video, 1920, 1080);
main.layoutMode = "VERTICAL";
main.itemSpacing = 0;
main.counterAxisAlignItems = "CENTER";
fixed(main, PLAN.measurements.collapsed.main.width, PLAN.measurements.collapsed.main.height);

// ── 상단 바 · 편집기 본문: 계산된 크기를 굳히지 않는다(2026-09-14) ─────────────────────────
// 예전에는 바를 FIXED main 폭 × 52, 앞머리를 FIXED 68×36, 프로필을 36 으로, 본문 격자를 1832×996 · 미리보기 1259 ·
// 위 칸 656 으로 박았다. 제품 바는 높이를 선언하지 않고(패딩 + 가장 큰 자식), 격자의 1fr 칸은 남는 자리다.
// 그래서 바는 가로 Auto Layout HUG, 앞머리 · 프로필 묶음은 HUG 에 선언 크기 컨트롤, 본문은 main 을 채우고
// 셸 인셋(사방)을 패딩으로, 트랙은 선언 기본값만 FIXED 로 두고 1fr 칸은 FILL 이다. 매 실행 다시 박는다 —
// 없을 때만 짓던 옛 경로는 한 번 틀린 기하를 영영 고치지 못했다.
const E = PLAN.measurements.editor;
const T = E.topBar;
const hug = (node) => {
  node.primaryAxisSizingMode = "AUTO";
  node.counterAxisSizingMode = "AUTO";
};
// 아래 선은 매 실행 역할로 다시 건다(옛 획은 은퇴한 컬렉션 변수 + 페인트 불투명도 0.08 이었다).
topBar.strokes = [paint("topBarDivider")];
pin(topBar);
topBar.layoutMode = "HORIZONTAL";
topBar.resize(PLAN.measurements.collapsed.main.width, topBar.height);
topBar.primaryAxisSizingMode = "FIXED";
topBar.counterAxisSizingMode = "AUTO";
topBar.counterAxisAlignItems = "CENTER";
topBar.paddingTop = T.padding.top;
topBar.paddingRight = T.padding.right;
topBar.paddingBottom = T.padding.bottom;
topBar.paddingLeft = T.padding.left;
topBar.itemSpacing = T.gap;
topBar.strokesIncludedInLayout = true;
leadingCluster.layoutMode = "HORIZONTAL";
hug(leadingCluster);
leadingCluster.counterAxisAlignItems = "CENTER";
leadingCluster.itemSpacing = T.leadingGap;
for (const control of leadingCluster.children) {
  // 숨은 자식은 흐름에 자리가 없다 — 옛 뒤로가기 자리(원본 SVG 로 갈아 끼우며 숨겼다)는 건드리지 않는다.
  if (!control.visible) continue;
  // 앞머리 컨트롤 한 변은 선언 크기다(앱 셸 계획 `controlSize`). 뒤로가기 프레임은 글리프를 가운데 둔다.
  control.resize(T.controlSize, T.controlSize);
  if (control.type === "FRAME") {
    control.layoutMode = "HORIZONTAL";
    control.primaryAxisSizingMode = control.counterAxisSizingMode = "FIXED";
    control.primaryAxisAlignItems = control.counterAxisAlignItems = "CENTER";
    for (const glyph of control.children) glyph.resize(T.iconSize, T.iconSize);
  }
}
breadcrumbNode.layoutGrow = 1;
if (breadcrumbNode.type === "TEXT") {
  breadcrumbNode.textAutoResize = "HEIGHT";
  breadcrumbNode.textTruncation = "ENDING";
  breadcrumbNode.maxLines = 1;
}
profileCluster.layoutMode = "HORIZONTAL";
hug(profileCluster);
profileCluster.counterAxisAlignItems = "CENTER";
profileCluster.itemSpacing = T.gap;
for (const entry of profileCluster.children) {
  // 액션 슬롯은 제 내용으로 HUG 한다(측정이 없는 229 를 박지 않는다). 프로필은 선언 한 변이다.
  if (entry.name.startsWith("profile/Open profile") || entry === profileCluster.children[profileCluster.children.length - 1]) {
    entry.resize(T.profileSize, T.profileSize);
  } else if ("layoutMode" in entry && entry.layoutMode !== "NONE") {
    hug(entry);
  }
}
let barInstance = topBarInstance;
if (!barInstance) barInstance = topBar.createInstance();
barInstance.name = I.topBarInstanceNames[0];

main.insertChild(0, barInstance);
main.insertChild(1, body);
barInstance.layoutSizingHorizontal = "FILL";
barInstance.layoutSizingVertical = "HUG";
body.layoutMode = "VERTICAL";
body.clipsContent = true;
body.paddingTop = body.paddingRight = body.paddingBottom = body.paddingLeft = E.shellInset;
body.itemSpacing = E.rowGap;
body.layoutSizingHorizontal = "FILL";
body.layoutSizingVertical = "FILL";
upper.layoutMode = "HORIZONTAL";
upper.itemSpacing = E.columnGap;
for (const entry of [nodes.assets, assetsDivider, nodes.preview, propertiesDivider, nodes.properties]) upper.appendChild(entry);
for (const entry of [upper, timelineDivider, nodes.timeline]) body.appendChild(entry);
upper.layoutSizingHorizontal = "FILL";
upper.layoutSizingVertical = "FILL";
const track = (node, width) => {
  node.resize(width, node.height);
  node.layoutSizingHorizontal = "FIXED";
  node.layoutSizingVertical = "FILL";
};
track(nodes.assets, E.columns.assets);
track(assetsDivider, E.columns.assetsDivider);
nodes.preview.layoutSizingHorizontal = "FILL";
nodes.preview.layoutSizingVertical = "FILL";
track(propertiesDivider, E.columns.propertiesDivider);
track(nodes.properties, E.columns.properties);
timelineDivider.resize(timelineDivider.width, E.rows.timelineDivider);
timelineDivider.layoutSizingHorizontal = "FILL";
timelineDivider.layoutSizingVertical = "FIXED";
nodes.timeline.resize(nodes.timeline.width, E.rows.timeline);
nodes.timeline.layoutSizingHorizontal = "FILL";
nodes.timeline.layoutSizingVertical = "FIXED";
nodes.assetsGrip.x = 0;
nodes.assetsGrip.y = 260;
nodes.propertiesGrip.x = 0;
nodes.propertiesGrip.y = 260;
nodes.timelineGrip.x = 868;
nodes.timelineGrip.y = -0.5;
return {
  railSetId: railSet.id,
  railVariantIds: railSet.children.map((entry) => entry.id),
  collapsedUpgradeMasterId: collapsedUpgradeMaster.id,
  videoFrameId: video.id,
  railInstanceId: rail.id,
  mainId: main.id,
  topBarId: topBar.id,
  topBarInstanceId: barInstance.id,
  bodyId: body.id,
  editorNodeIds: Object.fromEntries(Object.entries(nodes).map(([key, node]) => [key, node.id])),
};
