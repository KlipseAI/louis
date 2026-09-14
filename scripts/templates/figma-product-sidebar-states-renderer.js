const F = PLAN.figma;
const page = await figma.getNodeByIdAsync(F.pageId);
if (!page || page.type !== "PAGE") throw new Error("Missing product assets page");
await figma.setCurrentPageAsync(page);
const collections = await figma.variables.getLocalVariableCollectionsAsync();
const variables = await figma.variables.getLocalVariablesAsync();
const collectionByName = new Map(collections.map((entry) => [entry.name, entry]));
const collectionById = new Map(collections.map((entry) => [entry.id, entry]));
const variableByKey = new Map(variables.map((entry) => [`${collectionById.get(entry.variableCollectionId)?.name}\0${entry.name}`, entry]));
const mode = (collection, name) => {
  const target = collectionByName.get(collection);
  const match = target?.modes.find((entry) => entry.name === name);
  if (!target || !match) throw new Error(`Missing mode ${collection}/${name}`);
  return { collectionId: target.id, modeId: match.modeId };
};
const variable = (binding) => {
  const result = variableByKey.get(`${binding.collection}\0${binding.name}`);
  if (!result) throw new Error(`Missing variable ${binding.collection}/${binding.name}`);
  return result;
};
const paletteMode = mode(F.bindings.paletteCollection, F.bindings.paletteMode);
const ctaPaletteMode = mode(F.bindings.paletteCollection, F.bindings.ctaPaletteMode);
const semanticMode = mode(F.bindings.semanticCollection, F.bindings.semanticMode);
const inactive = variable(F.bindings.inactive);
const active = variable(F.bindings.active);
const inactiveFallback = { r: 213 / 255, g: 215 / 255, b: 221 / 255 };
const activeFallback = { r: 250 / 255, g: 250 / 255, b: 250 / 255 };
const bound = (paint, target, fallback) =>
  figma.variables.setBoundVariableForPaint({ ...paint, color: fallback }, "color", target);
const recolor = (node, target, fallback) => {
  if ("fills" in node && Array.isArray(node.fills)) {
    node.fills = node.fills.map((paint) => paint.type === "SOLID" ? bound(paint, target, fallback) : paint);
  }
  if ("strokes" in node && Array.isArray(node.strokes)) {
    node.strokes = node.strokes.map((paint) => paint.type === "SOLID" ? bound(paint, target, fallback) : paint);
  }
  if ("children" in node) for (const child of node.children) recolor(child, target, fallback);
};
const fixed = (node, width, height) => {
  node.resize(width, height);
  if ("primaryAxisSizingMode" in node) node.primaryAxisSizingMode = "FIXED";
  if ("counterAxisSizingMode" in node) node.counterAxisSizingMode = "FIXED";
};
const componentByName = new Map();
for (const component of page.findAllWithCriteria({ types: ["COMPONENT"] })) {
  if (!componentByName.has(component.name)) componentByName.set(component.name, component);
}
const icons = {};
for (const key of ["Search", "Home", "NodeCanvas", "VideoEditor", "Highlight", "YouTube", "logo", "expand"]) {
  icons[key] = componentByName.get(F.iconComponents[key]);
  if (!icons[key]) throw new Error(`Missing component ${F.iconComponents[key]}`);
}
const upgradeSet = page.findOne((entry) => entry.type === "COMPONENT_SET" && entry.name === "Product/Gnb Upgrade CTA");
const upgrade = upgradeSet?.children.find((entry) => entry.type === "COMPONENT" && entry.name === F.iconComponents.upgrade);
if (!upgrade) throw new Error("Missing measured white Upgrade CTA");

// collapsed Upgrade CTA는 expanded CTA를 32×32로 resize하면 내부 text가 왜곡된다(라이브 QA에서
// rail 하단에 `pgra...`가 튀어나온 원인). 제품 실측대로 전용 32×32 master를 만들어 그 인스턴스를 쓴다.
// 라벨은 12px viewport로 clip되고 안의 text는 실제 폭(WIDTH_AND_HEIGHT)이라 ellipsis 없이 잘린다.
const ctaSurface = variable(F.bindings.ctaSurface);
const ctaLabel = variable(F.bindings.ctaLabel);
await figma.loadFontAsync({ family: "Pretendard", style: "Medium" });
const collapsedUpgradeMaster = await (async () => {
  const existing = page.findOne((entry) => entry.type === "COMPONENT" && entry.name === F.collapsedUpgradeMasterName);
  if (existing) return existing;
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
  button.fills = [figma.variables.setBoundVariableForPaint({ type: "SOLID", color: { r: 241 / 255, g: 241 / 255, b: 243 / 255 } }, "color", ctaSurface)];
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
  text.fills = [figma.variables.setBoundVariableForPaint({ type: "SOLID", color: { r: 23 / 255, g: 27 / 255, b: 34 / 255 } }, "color", ctaLabel)];
  clip.appendChild(text);
  text.x = 0;
  text.y = 0;
  button.appendChild(clip);
  page.appendChild(button);
  button.x = 2120;
  button.y = 900;
  return button;
})();

let railSet = page.findOne((entry) => entry.type === "COMPONENT_SET" && entry.name === F.componentSetName);
if (!railSet) {
  const components = [];
  const menuItems = [
    ["Search", "Search"], ["Home", "Home"], ["NodeCanvas", "NodeCanvas"],
    ["VideoEditor", "VideoEditor"], ["Highlight", "Highlight"], ["YouTube analytics", "YouTube"],
  ];
  for (const current of ["Default", "Home", "VideoEditor", "YouTube", "Upgrade"]) {
    const root = figma.createComponent();
    root.name = `Current=${current}`;
    root.layoutMode = "VERTICAL";
    root.primaryAxisAlignItems = "SPACE_BETWEEN";
    root.counterAxisAlignItems = "MIN";
    root.paddingTop = root.paddingRight = root.paddingBottom = root.paddingLeft = 12;
    root.fills = [];
    fixed(root, PLAN.measurements.collapsed.sidebar.width, PLAN.measurements.collapsed.sidebar.height);
    root.setExplicitVariableModeForCollection(paletteMode.collectionId, paletteMode.modeId);
    root.setExplicitVariableModeForCollection(semanticMode.collectionId, semanticMode.modeId);
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
      recolor(icon, selected ? active : inactive, selected ? activeFallback : inactiveFallback);
      row.appendChild(icon);
      menu.appendChild(row);
    }
    top.appendChild(brand);
    top.appendChild(menu);
    root.appendChild(top);
    // expanded CTA를 resize하지 않는다. 제품 실측 32×32 collapsed master의 인스턴스를 놓는다.
    const cta = collapsedUpgradeMaster.createInstance();
    cta.name = "upgrade-cta · measured collapsed";
    cta.setExplicitVariableModeForCollection(ctaPaletteMode.collectionId, ctaPaletteMode.modeId);
    root.appendChild(cta);
    page.appendChild(root);
    components.push(root);
  }
  railSet = figma.combineAsVariants(components, page);
  railSet.name = F.componentSetName;
  railSet.description = `Measured collapsed desktop Gnb · ${PLAN.productCommit}`;
}

const I = F.install;
const video = await figma.getNodeByIdAsync(I.videoFrameId);
const oldRail = await figma.getNodeByIdAsync(I.oldRailId);
const main = await figma.getNodeByIdAsync(I.mainId);
const oldHeader = await figma.getNodeByIdAsync(I.oldHeaderId);
if (!video || video.type !== "FRAME" || !main || main.type !== "FRAME" || !oldRail || !oldHeader || oldHeader.type !== "FRAME") {
  throw new Error("Missing video editor scene targets");
}
oldRail.visible = false;
const railMaster = railSet.children.find((entry) => entry.type === "COMPONENT" && entry.name === "Current=VideoEditor");
let rail = video.findOne((entry) => entry.type === "INSTANCE" && entry.name === "gnb/Current=VideoEditor · measured collapsed");
if (!rail) {
  rail = railMaster.createInstance();
  rail.name = "gnb/Current=VideoEditor · measured collapsed";
  video.insertChild(0, rail);
}
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
let topBar = page.findOne((entry) => entry.type === "COMPONENT" && entry.name === F.topBarName);
if (!topBar) {
  topBar = figma.createComponent();
  topBar.name = F.topBarName;
  topBar.fills = Array.isArray(oldHeader.fills) ? oldHeader.fills : [];
  topBar.strokes = [bound({ type: "SOLID", color: activeFallback, opacity: 0.08 }, active, activeFallback)];
  topBar.strokeTopWeight = topBar.strokeLeftWeight = topBar.strokeRightWeight = 0;
  topBar.strokeBottomWeight = 1;
  topBar.setExplicitVariableModeForCollection(paletteMode.collectionId, paletteMode.modeId);
  topBar.setExplicitVariableModeForCollection(semanticMode.collectionId, semanticMode.modeId);
  const leading = figma.createFrame();
  leading.name = "mainChromeLeadingCluster";
  leading.fills = [];
  const expand = icons.expand.createInstance();
  expand.name = "navigation/Expand sidebar";
  leading.appendChild(expand);
  const back = figma.createFrame();
  back.name = "navigation/Back to video list · source SVG";
  back.fills = [];
  const arrow = figma.createNodeFromSvg('<svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M19 12H5M5 12L11 6M5 12L11 18" stroke="#FAFAFA" stroke-opacity="0.7" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>');
  arrow.name = "glyph/arrow";
  back.appendChild(arrow);
  leading.appendChild(back);
  const breadcrumbSource = await figma.getNodeByIdAsync(I.breadcrumbSourceId);
  const actionsSource = await figma.getNodeByIdAsync(I.actionsSourceId);
  const profileSource = await figma.getNodeByIdAsync(I.profileSourceId);
  if (!breadcrumbSource || breadcrumbSource.type !== "TEXT" || !actionsSource || !profileSource) throw new Error("Missing top-bar sources");
  const breadcrumb = breadcrumbSource.clone();
  breadcrumb.name = "breadcrumb/Video Editor / project";
  const profile = figma.createFrame();
  profile.name = "mainChromeProfileCluster";
  profile.fills = [];
  const actions = actionsSource.clone();
  actions.name = "mainChromeProfileActionsSlot";
  const avatar = profileSource.clone();
  avatar.name = "profile/Open profile";
  profile.appendChild(actions);
  profile.appendChild(avatar);
  topBar.appendChild(leading);
  topBar.appendChild(breadcrumb);
  topBar.appendChild(profile);
  page.appendChild(topBar);
}
const child = (parent, predicate, label) => {
  const found = parent.children.find(predicate);
  if (!found) throw new Error(`Missing ${label} in ${parent.name}`);
  return found;
};
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
const leadingCluster = child(topBar, (entry) => entry.type === "FRAME" && entry.name === "mainChromeLeadingCluster", "leading cluster");
leadingCluster.layoutMode = "HORIZONTAL";
hug(leadingCluster);
leadingCluster.counterAxisAlignItems = "CENTER";
leadingCluster.itemSpacing = T.leadingGap;
for (const control of leadingCluster.children) {
  // 앞머리 컨트롤 한 변은 선언 크기다(앱 셸 계획 `controlSize`). 뒤로가기 프레임은 글리프를 가운데 둔다.
  control.resize(T.controlSize, T.controlSize);
  if (control.type === "FRAME") {
    control.layoutMode = "HORIZONTAL";
    control.primaryAxisSizingMode = control.counterAxisSizingMode = "FIXED";
    control.primaryAxisAlignItems = control.counterAxisAlignItems = "CENTER";
    for (const glyph of control.children) glyph.resize(T.iconSize, T.iconSize);
  }
}
const breadcrumbNode = child(topBar, (entry) => entry.name.startsWith("breadcrumb/"), "breadcrumb");
breadcrumbNode.layoutGrow = 1;
if (breadcrumbNode.type === "TEXT") {
  breadcrumbNode.textAutoResize = "HEIGHT";
  breadcrumbNode.textTruncation = "ENDING";
  breadcrumbNode.maxLines = 1;
}
const profileCluster = child(topBar, (entry) => entry.type === "FRAME" && entry.name === "mainChromeProfileCluster", "profile cluster");
profileCluster.layoutMode = "HORIZONTAL";
hug(profileCluster);
profileCluster.counterAxisAlignItems = "CENTER";
profileCluster.itemSpacing = T.gap;
for (const entry of profileCluster.children) {
  // 액션 슬롯은 제 내용으로 HUG 한다(측정이 없는 229 를 박지 않는다). 프로필은 선언 한 변이다.
  if (entry.name === "profile/Open profile" || entry === profileCluster.children[profileCluster.children.length - 1]) {
    entry.resize(T.profileSize, T.profileSize);
  } else if ("layoutMode" in entry && entry.layoutMode !== "NONE") {
    hug(entry);
  }
}
oldHeader.visible = false;
let topBarInstance = main.findOne((entry) => entry.type === "INSTANCE" && entry.name === "topbar/VideoEditor · Sidebar=Collapsed");
if (!topBarInstance) {
  topBarInstance = topBar.createInstance();
  topBarInstance.name = "topbar/VideoEditor · Sidebar=Collapsed";
}

const nodes = {};
for (const [key, id] of Object.entries({ assets: I.assetsId, assetsGrip: I.assetsGripId, preview: I.previewId, timelineGrip: I.timelineGripId, propertiesGrip: I.propertiesGripId, properties: I.propertiesId, timeline: I.timelineId })) {
  nodes[key] = await figma.getNodeByIdAsync(id);
  if (!nodes[key]) throw new Error(`Missing editor node ${key}`);
}
const ensureFrame = (parent, name) => {
  let frame = parent.children.find((entry) => entry.type === "FRAME" && entry.name === name);
  if (!frame) {
    frame = figma.createFrame();
    frame.name = name;
    frame.fills = [];
    parent.appendChild(frame);
  }
  return frame;
};
let body = main.findOne((entry) => entry.type === "FRAME" && entry.name === "modalBody · product CSS grid");
if (!body) {
  body = figma.createFrame();
  body.name = "modalBody · product CSS grid";
  body.fills = [];
  main.appendChild(body);
}
main.insertChild(0, topBarInstance);
main.insertChild(1, body);
topBarInstance.layoutSizingHorizontal = "FILL";
topBarInstance.layoutSizingVertical = "HUG";
body.layoutMode = "VERTICAL";
body.clipsContent = true;
body.paddingTop = body.paddingRight = body.paddingBottom = body.paddingLeft = E.shellInset;
body.itemSpacing = E.rowGap;
body.layoutSizingHorizontal = "FILL";
body.layoutSizingVertical = "FILL";
const upper = ensureFrame(body, "grid row / assets + preview + properties");
const assetsDivider = ensureFrame(upper, "assets-divider · 4px column");
const propertiesDivider = ensureFrame(upper, "properties-divider · 4px column");
const timelineDivider = ensureFrame(body, "timeline-divider · 4px row");
upper.layoutMode = "HORIZONTAL";
upper.itemSpacing = E.columnGap;
for (const entry of [nodes.assets, assetsDivider, nodes.preview, propertiesDivider, nodes.properties]) upper.appendChild(entry);
assetsDivider.appendChild(nodes.assetsGrip);
propertiesDivider.appendChild(nodes.propertiesGrip);
timelineDivider.appendChild(nodes.timelineGrip);
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
return { railSetId: railSet.id, railVariantIds: railSet.children.map((entry) => entry.id), topBarId: topBar.id, bodyId: body.id, videoFrameId: video.id };
