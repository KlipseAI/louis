const C = PLAN.component;
const page =
  (await figma.getNodeByIdAsync(C.pageId)) ?? figma.root.children.find((entry) => entry.name === C.pageName);
if (!page) throw new Error(`Missing target page ${C.pageName}`);
await figma.setCurrentPageAsync(page);

const collections = await figma.variables.getLocalVariableCollectionsAsync();
const collectionById = new Map(collections.map((entry) => [entry.id, entry]));
const collectionByName = new Map(collections.map((entry) => [entry.name, entry]));
const variables = await figma.variables.getLocalVariablesAsync();
const variableByKey = new Map(
  variables.map((entry) => [`${collectionById.get(entry.variableCollectionId)?.name}\u0000${entry.name}`, entry]),
);
const getVariable = (binding) => {
  const variable = variableByKey.get(`${binding.collection}\u0000${binding.name}`);
  if (!variable) throw new Error(`Missing variable ${binding.collection}/${binding.name}`);
  return variable;
};
const getMode = (collectionName, modeName) => {
  const collection = collectionByName.get(collectionName);
  const mode = collection?.modes.find((entry) => entry.name === modeName);
  if (!collection || !mode) throw new Error(`Missing mode ${collectionName}/${modeName}`);
  return { collectionId: collection.id, modeId: mode.modeId };
};
const B = C.bindings;
const V = Object.fromEntries(
  Object.entries(B)
    .filter(([, value]) => value && typeof value === "object" && "collection" in value)
    .map(([key, value]) => [key, getVariable(value)]),
);
const paletteMode = getMode(B.paletteCollection, B.paletteMode);
const semanticMode = getMode(B.semanticCollection, B.semanticMode);
const setPaint = (variable, fallback = { r: 0, g: 0, b: 0 }) =>
  figma.variables.setBoundVariableForPaint({ type: "SOLID", color: fallback }, "color", variable);
const bindCorners = (node, variable) => {
  for (const field of ["topLeftRadius", "topRightRadius", "bottomRightRadius", "bottomLeftRadius"]) {
    node.setBoundVariable(field, variable);
  }
};

const sets = new Map();
for (const set of page.findAllWithCriteria({ types: ["COMPONENT_SET"] })) {
  if ([C.dependencies.gnbSet, C.dependencies.topBarSet, C.dependencies.mobileTopBarSet, C.dependencies.resultSet].includes(set.name)) {
    if (sets.has(set.name)) throw new Error(`Duplicate dependency ${set.name}`);
    sets.set(set.name, set);
  }
}
for (const name of [C.dependencies.gnbSet, C.dependencies.topBarSet, C.dependencies.mobileTopBarSet, C.dependencies.resultSet]) {
  if (!sets.has(name)) throw new Error(`Missing dependency ${name}`);
}
const variant = (setName, variantName) => {
  const value = sets.get(setName).children.find((entry) => entry.name === variantName);
  if (!value) throw new Error(`Missing variant ${setName}/${variantName}`);
  return value;
};
const gnbMaster = variant(C.dependencies.gnbSet, C.dependencies.gnbVariant);
const topBarMaster = variant(C.dependencies.topBarSet, C.dependencies.topBarVariant);
const mobileTopBarMaster = variant(C.dependencies.mobileTopBarSet, C.dependencies.mobileTopBarVariant);
const resultMasters = new Map(
  C.variants.map((entry) => [
    entry.outcome,
    variant(C.dependencies.resultSet, `Outcome=${entry.outcome}, Viewport=Desktop`),
  ]),
);
const mobileResultMasters = new Map(
  C.mobile.variants.map((entry) => [
    entry.outcome,
    variant(C.dependencies.resultSet, `Outcome=${entry.outcome}, Viewport=Mobile`),
  ]),
);
await Promise.all([
  figma.loadFontAsync({ family: "Pretendard", style: "Regular" }),
  figma.loadFontAsync({ family: "Pretendard", style: "Medium" }),
]);

let section = page.children.find((entry) => entry.type === "SECTION" && entry.name === C.sectionName);
if (!section) {
  section = figma.createSection();
  section.name = C.sectionName;
  section.x = Math.max(...page.children.filter((entry) => entry !== section).map((entry) => entry.x + entry.width), 0) + 182;
  section.y = 0;
  section.resizeWithoutConstraints(6200, 2500);
}
if (section.width < 7000 || section.height < 2700) section.resizeWithoutConstraints(7000, 2700);
section.setExplicitVariableModeForCollection(paletteMode.collectionId, paletteMode.modeId);
section.setExplicitVariableModeForCollection(semanticMode.collectionId, semanticMode.modeId);
section.fills = [setPaint(V.appBackground)];

let docs = section.findOne((entry) => entry.name === `${C.sceneSetName} / Documentation`);
if (!docs) {
  docs = figma.createFrame();
  docs.name = `${C.sceneSetName} / Documentation`;
  docs.x = 40;
  docs.y = 40;
  docs.resize(840, 156);
  docs.layoutMode = "VERTICAL";
  docs.primaryAxisSizingMode = docs.counterAxisSizingMode = "FIXED";
  docs.paddingTop = docs.paddingRight = docs.paddingBottom = docs.paddingLeft = 32;
  docs.itemSpacing = 12;
  docs.fills = [];
  const title = figma.createText();
  title.fontName = { family: "Pretendard", style: "Medium" };
  title.fontSize = 28;
  title.characters = C.sceneSetName;
  title.fills = [setPaint(V.current)];
  docs.appendChild(title);
  const note = figma.createText();
  note.fontName = { family: "Pretendard", style: "Regular" };
  note.fontSize = 14;
  note.lineHeight = { unit: "PERCENT", value: 150 };
  note.characters = `${PLAN.productCommit.slice(0, 8)} · ${PLAN.context} · nested measured Gnb/top bar/result components · product-only composition`;
  note.fills = [setPaint(V.parent)];
  docs.appendChild(note);
  section.appendChild(docs);
}

let mainSet = section.findOne((entry) => entry.type === "COMPONENT_SET" && entry.name === C.mainSetName);
if (!mainSet) {
  const mainVariants = [];
  for (const spec of C.variants) {
    const component = figma.createComponent();
    component.name = `Outcome=${spec.outcome}`;
    component.resize(C.main.rect.width, C.main.rect.height);
    component.fills = [setPaint(V.surface)];
    component.cornerRadius = C.main.radius;
    bindCorners(component, V.radius16);
    component.clipsContent = true;
    component.setExplicitVariableModeForCollection(paletteMode.collectionId, paletteMode.modeId);
    component.setExplicitVariableModeForCollection(semanticMode.collectionId, semanticMode.modeId);
    const topBar = topBarMaster.createInstance();
    topBar.name = "top-bar/Desktop App Top Bar";
    topBar.x = spec.topBarRect.x;
    topBar.y = spec.topBarRect.y;
    component.appendChild(topBar);
    const result = resultMasters.get(spec.outcome).createInstance();
    result.name = `result/Outcome=${spec.outcome}`;
    result.x = spec.contentRect.x;
    result.y = spec.contentRect.y;
    component.appendChild(result);
    component.description = `Measured ${spec.route} main surface · ${PLAN.productCommit} · product-only composition`;
    section.appendChild(component);
    mainVariants.push(component);
  }
  mainSet = figma.combineAsVariants(mainVariants, section);
  mainSet.name = C.mainSetName;
  mainSet.description = `Measured 1628×1004 result main surface using nested product-only components. ${PLAN.productCommit}. Not normative.`;
  mainSet.fills = [];
  for (const [index, child] of mainSet.children.entries()) {
    child.x = 40 + index * (C.main.rect.width + 40);
    child.y = 40;
  }
  mainSet.resizeWithoutConstraints(C.main.rect.width * C.variants.length + 160, C.main.rect.height + 80);
  mainSet.x = 40;
  mainSet.y = 240;
}

let sceneSet = section.findOne((entry) => entry.type === "COMPONENT_SET" && entry.name === C.sceneSetName);
if (!sceneSet) {
  const sceneVariants = [];
  for (const spec of C.variants) {
    const mainMaster = mainSet.children.find((entry) => entry.name === `Outcome=${spec.outcome}`);
    if (!mainMaster) throw new Error(`Missing composed main variant ${spec.outcome}`);
    const component = figma.createComponent();
    component.name = `Outcome=${spec.outcome}`;
    component.resize(C.page.rect.width, C.page.rect.height);
    component.fills = [setPaint(V.appBackground)];
    component.setExplicitVariableModeForCollection(paletteMode.collectionId, paletteMode.modeId);
    component.setExplicitVariableModeForCollection(semanticMode.collectionId, semanticMode.modeId);
    const gnb = gnbMaster.createInstance();
    gnb.name = "gnb/Current=Default";
    gnb.x = 0;
    gnb.y = 0;
    component.appendChild(gnb);
    const main = mainMaster.createInstance();
    main.name = `main/Outcome=${spec.outcome}`;
    main.x = spec.mainRect.x;
    main.y = spec.mainRect.y;
    component.appendChild(main);
    component.description = `Measured ${spec.route} 1920×1080 scene · ${PLAN.productCommit} · product-only composition`;
    section.appendChild(component);
    sceneVariants.push(component);
  }
  sceneSet = figma.combineAsVariants(sceneVariants, section);
  sceneSet.name = C.sceneSetName;
  sceneSet.description = `Measured full desktop payment-result scenes composed from exact nested product components. ${PLAN.productCommit}. Not normative.`;
  sceneSet.fills = [];
  for (const [index, child] of sceneSet.children.entries()) {
    child.x = 40 + index * (C.page.rect.width + 40);
    child.y = 40;
  }
  sceneSet.resizeWithoutConstraints(C.page.rect.width * C.variants.length + 160, C.page.rect.height + 80);
  sceneSet.x = 40;
  sceneSet.y = 1400;
}

const M = C.mobile;
let mobileMainSet = section.findOne(
  (entry) => entry.type === "COMPONENT_SET" && entry.name === M.mainSetName,
);
if (!mobileMainSet) {
  const variants = [];
  for (const spec of M.variants) {
    const component = figma.createComponent();
    component.name = `Outcome=${spec.outcome}`;
    component.resize(M.main.rect.width, M.main.rect.height);
    component.fills = [setPaint(V.surface)];
    component.cornerRadius = M.main.radius;
    bindCorners(component, V.radius16);
    component.clipsContent = true;
    component.setExplicitVariableModeForCollection(paletteMode.collectionId, paletteMode.modeId);
    component.setExplicitVariableModeForCollection(semanticMode.collectionId, semanticMode.modeId);
    const topBar = mobileTopBarMaster.createInstance();
    topBar.name = "top-bar/Mobile App Top Bar";
    topBar.x = spec.topBarRect.x;
    topBar.y = spec.topBarRect.y;
    component.appendChild(topBar);
    const result = mobileResultMasters.get(spec.outcome).createInstance();
    result.name = `result/Outcome=${spec.outcome}`;
    result.x = spec.contentRect.x;
    result.y = spec.contentRect.y;
    component.appendChild(result);
    component.description = `Measured ${spec.route} mobile main surface · ${PLAN.productCommit} · product-only composition`;
    section.appendChild(component);
    variants.push(component);
  }
  mobileMainSet = figma.combineAsVariants(variants, section);
  mobileMainSet.name = M.mainSetName;
  mobileMainSet.description = `Measured 402×810 mobile result main surface using nested product-only components. ${PLAN.productCommit}. Not normative.`;
  mobileMainSet.fills = [];
  for (const [index, child] of mobileMainSet.children.entries()) {
    child.x = 40 + index * (M.main.rect.width + 40);
    child.y = 40;
  }
  mobileMainSet.resizeWithoutConstraints(M.main.rect.width * M.variants.length + 160, M.main.rect.height + 80);
  mobileMainSet.x = 5200;
  mobileMainSet.y = 240;
}

let mobileSceneSet = section.findOne(
  (entry) => entry.type === "COMPONENT_SET" && entry.name === M.sceneSetName,
);
if (!mobileSceneSet) {
  const variants = [];
  for (const spec of M.variants) {
    const mainMaster = mobileMainSet.children.find((entry) => entry.name === `Outcome=${spec.outcome}`);
    if (!mainMaster) throw new Error(`Missing composed mobile main variant ${spec.outcome}`);
    const component = figma.createComponent();
    component.name = `Outcome=${spec.outcome}`;
    component.resize(M.page.rect.width, M.page.rect.height);
    component.fills = [setPaint(V.appBackground)];
    component.setExplicitVariableModeForCollection(paletteMode.collectionId, paletteMode.modeId);
    component.setExplicitVariableModeForCollection(semanticMode.collectionId, semanticMode.modeId);
    const main = mainMaster.createInstance();
    main.name = `main/Outcome=${spec.outcome}`;
    main.x = spec.mainRect.x;
    main.y = spec.mainRect.y;
    component.appendChild(main);
    component.description = `Measured ${spec.route} 402×874 scene · ${PLAN.productCommit} · product-only composition`;
    section.appendChild(component);
    variants.push(component);
  }
  mobileSceneSet = figma.combineAsVariants(variants, section);
  mobileSceneSet.name = M.sceneSetName;
  mobileSceneSet.description = `Measured full mobile payment-result scenes composed from exact nested product components. ${PLAN.productCommit}. Not normative.`;
  mobileSceneSet.fills = [];
  for (const [index, child] of mobileSceneSet.children.entries()) {
    child.x = 40 + index * (M.page.rect.width + 40);
    child.y = 40;
  }
  mobileSceneSet.resizeWithoutConstraints(M.page.rect.width * M.variants.length + 160, M.page.rect.height + 80);
  mobileSceneSet.x = 5200;
  mobileSceneSet.y = 1400;
}

const paints = [];
for (const node of [
  mainSet, ...mainSet.findAll(() => true), sceneSet, ...sceneSet.findAll(() => true),
  mobileMainSet, ...mobileMainSet.findAll(() => true), mobileSceneSet, ...mobileSceneSet.findAll(() => true),
]) {
  for (const field of ["fills", "strokes"]) {
    if (!Array.isArray(node[field])) continue;
    for (const paint of node[field]) {
      if (paint.type !== "SOLID" || paint.visible === false || paint.opacity === 0) continue;
      let ancestor = node;
      let brandFixed = false;
      while (ancestor && ancestor !== section) {
        if (/logo\/klipse-light/.test(ancestor.name)) brandFixed = true;
        ancestor = ancestor.parent;
      }
      paints.push({ node: node.name, field, bound: Boolean(paint.boundVariables?.color), brandFixed });
    }
  }
}
const unexpected = paints.filter((entry) => !entry.bound && !entry.brandFixed);
if (unexpected.length) throw new Error(`Unexpected unbound visible paints ${JSON.stringify(unexpected)}`);
return {
  sectionId: section.id,
  docFrameId: docs.id,
  mainComponentSetId: mainSet.id,
  mainVariantIds: mainSet.children.map((entry) => entry.id),
  sceneComponentSetId: sceneSet.id,
  sceneVariantIds: sceneSet.children.map((entry) => entry.id),
  mobileMainComponentSetId: mobileMainSet.id,
  mobileMainVariantIds: mobileMainSet.children.map((entry) => entry.id),
  mobileSceneComponentSetId: mobileSceneSet.id,
  mobileSceneVariantIds: mobileSceneSet.children.map((entry) => entry.id),
  visiblePaintCount: paints.length,
  boundVisiblePaintCount: paints.filter((entry) => entry.bound).length,
  allowedFixedBrandPaintCount: paints.filter((entry) => !entry.bound && entry.brandFixed).length,
};
