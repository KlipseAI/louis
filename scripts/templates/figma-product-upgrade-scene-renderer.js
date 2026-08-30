const C = PLAN.component;
const M = C.mobile;
const page =
  (await figma.getNodeByIdAsync(C.pageId)) ??
  figma.root.children.find((entry) => entry.name === C.pageName);
if (!page) throw new Error(`Missing target page ${C.pageName}`);
await figma.setCurrentPageAsync(page);

const collections = await figma.variables.getLocalVariableCollectionsAsync();
const collectionById = new Map(collections.map((entry) => [entry.id, entry]));
const collectionByName = new Map(collections.map((entry) => [entry.name, entry]));
const variables = await figma.variables.getLocalVariablesAsync();
const variableByKey = new Map(variables.map((entry) => [`${collectionById.get(entry.variableCollectionId)?.name}\u0000${entry.name}`, entry]));
const getVariable = (binding) => {
  const value = variableByKey.get(`${binding.collection}\u0000${binding.name}`);
  if (!value) throw new Error(`Missing variable ${binding.collection}/${binding.name}`);
  return value;
};
const getMode = (collectionName, modeName) => {
  const collection = collectionByName.get(collectionName);
  const mode = collection?.modes.find((entry) => entry.name === modeName);
  if (!collection || !mode) throw new Error(`Missing mode ${collectionName}/${modeName}`);
  return { collectionId: collection.id, modeId: mode.modeId };
};
const B = C.bindings;
const V = Object.fromEntries(Object.entries(B).filter(([, value]) => value && typeof value === "object" && "collection" in value).map(([key, value]) => [key, getVariable(value)]));
const paletteMode = getMode(B.paletteCollection, B.paletteMode);
const semanticMode = getMode(B.semanticCollection, B.semanticMode);
const primitiveMode = getMode(B.primitiveCollection, B.primitiveMode);
const setModes = (node) => {
  node.setExplicitVariableModeForCollection(paletteMode.collectionId, paletteMode.modeId);
  node.setExplicitVariableModeForCollection(semanticMode.collectionId, semanticMode.modeId);
  node.setExplicitVariableModeForCollection(primitiveMode.collectionId, primitiveMode.modeId);
};
const setPaint = (variable, fallback = { r: 0, g: 0, b: 0 }) => figma.variables.setBoundVariableForPaint({ type: "SOLID", color: fallback }, "color", variable);
const bindCorners = (node, variable) => {
  for (const field of ["topLeftRadius", "topRightRadius", "bottomRightRadius", "bottomLeftRadius"]) node.setBoundVariable(field, variable);
};
const makeEffects = (specs) => specs.map((effect) => ({
  type: effect.type,
  color: { r: effect.color[0], g: effect.color[1], b: effect.color[2], a: effect.color[3] },
  offset: effect.offset,
  radius: effect.radius,
  spread: effect.spread,
  visible: true,
  blendMode: "NORMAL",
}));
const applyMeasuredOutline = (node, spec) => {
  if (!spec.outline) {
    node.strokes = [];
    return;
  }
  if (
    spec.outline.style !== "solid" ||
    spec.outline.offset !== -spec.outline.width ||
    spec.outline.figmaMapping !== `${spec.outline.width}px INSIDE stroke`
  ) throw new Error(`Unsupported measured outline mapping for ${spec.plan}`);
  node.strokeWeight = spec.outline.width;
  node.strokeAlign = "INSIDE";
  node.strokes = [{
    type: "SOLID",
    color: { r: spec.outline.color[0], g: spec.outline.color[1], b: spec.outline.color[2] },
    opacity: spec.outline.color[3],
  }];
};

await Promise.all([
  figma.loadFontAsync({ family: "Pretendard", style: "Regular" }),
  figma.loadFontAsync({ family: "Pretendard", style: "Medium" }),
  figma.loadFontAsync({ family: "Pretendard", style: "SemiBold" }),
]);
const weightStyle = { 400: "Regular", 500: "Medium", 600: "SemiBold" };
const colorVariable = (rgba) => {
  const key = `${Math.round(rgba[0] * 255)},${Math.round(rgba[1] * 255)},${Math.round(rgba[2] * 255)},${Math.round(rgba[3] * 1000) / 1000}`;
  const byColor = {
    "0,0,0,1": V.black,
    "0,0,0,0.72": V.blackA72,
    "0,198,142,1": V.mint500,
    "23,27,34,1": V.gray900,
    "49,54,64,1": V.gray800,
    "87,93,104,1": V.gray700,
    "154,160,171,1": V.gray600,
    "188,192,201,1": V.gray500,
    "188,192,201,0.9": V.gray500a90,
    "248,248,249,1": V.surface,
    "250,250,250,1": V.cardSurface,
  };
  const variable = byColor[key];
  if (!variable) throw new Error(`No measured variable binding for color ${key}`);
  return variable;
};
const makeFixedText = (spec, name, rect = spec.rect) => {
  const text = figma.createText();
  text.name = name;
  text.fontName = { family: "Pretendard", style: weightStyle[spec.fontWeight] ?? "Regular" };
  text.fontSize = spec.fontSize;
  text.lineHeight = { unit: "PIXELS", value: spec.lineHeight };
  text.letterSpacing = { unit: "PIXELS", value: spec.letterSpacing };
  text.characters = spec.text;
  text.textAutoResize = "NONE";
  text.resize(spec.figmaWidth ?? rect.width, rect.height);
  text.x = rect.x;
  text.y = rect.y;
  text.textAlignHorizontal = spec.textAlign === "center" ? "CENTER" : spec.textAlign === "right" ? "RIGHT" : "LEFT";
  text.fills = [setPaint(colorVariable(spec.color))];
  return text;
};
const bindIconPaints = (instance, variable) => {
  for (const vector of instance.findAllWithCriteria({ types: ["VECTOR"] })) {
    if (Array.isArray(vector.fills)) vector.fills = vector.fills.map((paint) => paint.type === "SOLID" ? figma.variables.setBoundVariableForPaint({ ...paint }, "color", variable) : paint);
    if (Array.isArray(vector.strokes)) vector.strokes = vector.strokes.map((paint) => paint.type === "SOLID" ? figma.variables.setBoundVariableForPaint({ ...paint }, "color", variable) : paint);
  }
};

const dependencySets = new Map();
for (const set of page.findAllWithCriteria({ types: ["COMPONENT_SET"] })) {
  if ([C.dependencies.gnbSet, C.dependencies.topBarSet, C.dependencies.mobileTopBarSet].includes(set.name)) dependencySets.set(set.name, set);
}
const variant = (setName, variantName) => {
  const value = dependencySets.get(setName)?.children.find((entry) => entry.name === variantName);
  if (!value) throw new Error(`Missing dependency ${setName}/${variantName}`);
  return value;
};
const gnbMaster = variant(C.dependencies.gnbSet, C.dependencies.gnbVariant);
const topBarMaster = variant(C.dependencies.topBarSet, C.dependencies.topBarVariant);
const mobileTopBarMaster = variant(C.dependencies.mobileTopBarSet, C.dependencies.mobileTopBarVariant);
const checkMasterMatches = page.findAllWithCriteria({ types: ["COMPONENT"] }).filter((entry) => entry.name === C.dependencies.checkIcon);
if (checkMasterMatches.length !== 1) throw new Error(`Expected one ${C.dependencies.checkIcon}, got ${checkMasterMatches.length}`);
const checkMaster = checkMasterMatches[0];

let section = page.children.find((entry) => entry.type === "SECTION" && entry.name === C.sectionName);
if (!section) {
  section = figma.createSection();
  section.name = C.sectionName;
  section.x = Math.max(...page.children.filter((entry) => entry !== section).map((entry) => entry.x + entry.width), 0) + 182;
  section.y = 0;
  section.resizeWithoutConstraints(6100, 2800);
}
if (section.width < 6100 || section.height < 2800) section.resizeWithoutConstraints(6100, 2800);
setModes(section);
section.fills = [setPaint(V.appBackground)];

let docs = section.findOne((entry) => entry.name === `${C.cardSetName} / Documentation`);
if (!docs) {
  docs = figma.createFrame();
  docs.name = `${C.cardSetName} / Documentation`;
  docs.x = 40;
  docs.y = 40;
  docs.resize(920, 156);
  docs.layoutMode = "VERTICAL";
  docs.primaryAxisSizingMode = docs.counterAxisSizingMode = "FIXED";
  docs.paddingTop = docs.paddingRight = docs.paddingBottom = docs.paddingLeft = 32;
  docs.itemSpacing = 12;
  docs.fills = [];
  const title = figma.createText();
  title.fontName = { family: "Pretendard", style: "Medium" };
  title.fontSize = 28;
  title.characters = C.cardSetName;
  title.fills = [setPaint(V.gray900)];
  docs.appendChild(title);
  const note = figma.createText();
  note.fontName = { family: "Pretendard", style: "Regular" };
  note.fontSize = 14;
  note.lineHeight = { unit: "PERCENT", value: 150 };
  note.characters = `${PLAN.productCommit.slice(0, 8)} · 4 measured 316×560 desktop cards · checkout without plan redirects to canonical upgrade · product-only`;
  note.fills = [setPaint(V.gray600)];
  docs.appendChild(note);
  section.appendChild(docs);
}
const docTexts = docs.children.filter((entry) => entry.type === "TEXT");
if (docTexts.length !== 2) throw new Error(`Expected two documentation text nodes, got ${docTexts.length}`);
docTexts[0].characters = C.cardSetName;
docTexts[1].characters = `${PLAN.productCommit.slice(0, 8)} · 4 full desktop cards + 2 viewport-observed mobile slices · checkout redirect parity · product-only`;

let cardSet = section.findOne((entry) => entry.type === "COMPONENT_SET" && entry.name === C.cardSetName);
if (!cardSet) {
  for (const child of [...section.children]) {
    if (child.type === "COMPONENT" && /^Plan=(Trial|Basic|Pro|Max), Viewport=Desktop$/.test(child.name)) child.remove();
  }
  const cards = [];
  for (const spec of C.cards) {
    const card = figma.createComponent();
    card.name = `Plan=${spec.plan}, Viewport=Desktop`;
    card.resize(spec.rect.width, spec.rect.height);
    card.cornerRadius = spec.radius;
    bindCorners(card, V.radius24);
    card.fills = [setPaint(V.cardSurface)];
    card.effects = makeEffects(spec.effects);
    applyMeasuredOutline(card, spec);
    card.clipsContent = true;
    setModes(card);
    for (const [index, textSpec] of spec.texts.entries()) card.appendChild(makeFixedText(textSpec, `text/${index} · ${textSpec.text}`));
    for (const [index, iconSpec] of spec.icons.entries()) {
      const icon = checkMaster.createInstance();
      icon.name = `feature-check/${index}`;
      icon.resize(iconSpec.rect.width, iconSpec.rect.height);
      icon.x = iconSpec.rect.x;
      icon.y = iconSpec.rect.y;
      bindIconPaints(icon, V.mint500);
      card.appendChild(icon);
    }
    const action = figma.createFrame();
    action.name = `action/${spec.action.text}`;
    action.x = spec.action.rect.x;
    action.y = spec.action.rect.y;
    action.resize(spec.action.rect.width, spec.action.rect.height);
    action.cornerRadius = spec.action.radius;
    bindCorners(action, V.radius12);
    action.opacity = spec.action.opacity;
    action.fills = [setPaint(colorVariable(spec.action.fill))];
    const labelSpec = { ...spec.action.label, textAlign: "center" };
    const label = makeFixedText(labelSpec, "label", { x: 0, y: 0, width: spec.action.rect.width, height: spec.action.rect.height });
    label.textAlignVertical = "CENTER";
    action.appendChild(label);
    card.appendChild(action);
    card.description = `Measured ${spec.route} ${spec.plan} plan card · ${PLAN.productCommit} · product-only inventory`;
    section.appendChild(card);
    cards.push(card);
  }
  cardSet = figma.combineAsVariants(cards, section);
  cardSet.name = C.cardSetName;
  cardSet.description = `Four measured desktop upgrade-plan inventory variants. Content differences are product data, not a normalized DS contract. ${PLAN.productCommit}.`;
  cardSet.fills = [];
  for (const [index, card] of cardSet.children.entries()) {
    card.x = 40 + index * 356;
    card.y = 40;
  }
  cardSet.resizeWithoutConstraints(1460, 640);
  cardSet.x = 40;
  cardSet.y = 240;
}

for (const spec of C.cards) {
  const card = cardSet.children.find((entry) => entry.name === `Plan=${spec.plan}, Viewport=Desktop`);
  if (!card) throw new Error(`Missing plan card for glyph repair ${spec.plan}`);
  applyMeasuredOutline(card, spec);
  const directTexts = card.children.filter((entry) => entry.type === "TEXT");
  if (directTexts.length !== spec.texts.length) throw new Error(`Plan card text count drift ${spec.plan}`);
  for (const [index, textSpec] of spec.texts.entries()) {
    if (!textSpec.figmaWidth) continue;
    const text = directTexts[index];
    text.textAutoResize = "NONE";
    text.resize(textSpec.figmaWidth, textSpec.rect.height);
    text.x = textSpec.rect.x;
    text.y = textSpec.rect.y;
  }
}

let mobileCardSet = section.findOne((entry) => entry.type === "COMPONENT_SET" && entry.name === C.mobileVisibleCardSetName);
if (!mobileCardSet) {
  const cards = [];
  for (const spec of M.cards) {
    const card = figma.createComponent();
    card.name = `Plan=${spec.plan}, Evidence=VisibleSlice`;
    card.resize(spec.rect.width, spec.rect.height);
    card.cornerRadius = spec.radius;
    bindCorners(card, V.radius16);
    card.fills = [setPaint(V.cardSurface)];
    card.effects = makeEffects(spec.effects);
    applyMeasuredOutline(card, spec);
    card.clipsContent = true;
    setModes(card);
    for (const [index, textSpec] of spec.texts.entries()) card.appendChild(makeFixedText(textSpec, `text/${index} · ${textSpec.text}`));
    for (const [index, iconSpec] of spec.icons.entries()) {
      const icon = checkMaster.createInstance();
      icon.name = `feature-check/${index}`;
      icon.resize(iconSpec.rect.width, iconSpec.rect.height);
      icon.x = iconSpec.rect.x;
      icon.y = iconSpec.rect.y;
      bindIconPaints(icon, V.mint500);
      card.appendChild(icon);
    }
    card.description = `Measured ${spec.route} ${spec.plan} 402×874 visible-slice card evidence · action not observed · ${PLAN.productCommit} · product-only`;
    section.appendChild(card);
    cards.push(card);
  }
  mobileCardSet = figma.combineAsVariants(cards, section);
  mobileCardSet.name = C.mobileVisibleCardSetName;
  mobileCardSet.description = `Two viewport-observed mobile Upgrade card slices. Only nodes present in the 402×874 fixture are included; this is not a complete mobile card contract. ${PLAN.productCommit}.`;
  mobileCardSet.fills = [];
  for (const [index, card] of mobileCardSet.children.entries()) {
    card.x = 40 + index * 219;
    card.y = 40;
  }
  mobileCardSet.resizeWithoutConstraints(478, 774);
  mobileCardSet.x = 40;
  mobileCardSet.y = 1000;
}
for (const spec of M.cards) {
  const card = mobileCardSet.children.find((entry) => entry.name === `Plan=${spec.plan}, Evidence=VisibleSlice`);
  if (!card) throw new Error(`Missing mobile visible-slice card ${spec.plan}`);
  applyMeasuredOutline(card, spec);
  const directTexts = card.children.filter((entry) => entry.type === "TEXT");
  if (directTexts.length !== spec.texts.length) throw new Error(`Mobile visible-slice text count drift ${spec.plan}`);
  for (const [index, textSpec] of spec.texts.entries()) {
    const text = directTexts[index];
    text.textAutoResize = "NONE";
    text.resize(textSpec.figmaWidth ?? textSpec.rect.width, textSpec.rect.height);
    text.x = textSpec.rect.x;
    text.y = textSpec.rect.y;
  }
}

let mainComponent = section.findOne((entry) => entry.type === "COMPONENT" && entry.name === C.mainComponentName);
if (mainComponent && (mainComponent.children.length !== 8 || !mainComponent.description.includes(PLAN.productCommit))) {
  mainComponent.remove();
  mainComponent = null;
}
if (!mainComponent) {
  mainComponent = figma.createComponent();
  mainComponent.name = C.mainComponentName;
  mainComponent.resize(C.main.width, C.main.height);
  mainComponent.cornerRadius = C.main.radius;
  bindCorners(mainComponent, V.radius16);
  mainComponent.fills = [setPaint(V.surface)];
  mainComponent.effects = makeEffects(C.main.effects);
  mainComponent.clipsContent = true;
  setModes(mainComponent);
  const topBar = topBarMaster.createInstance();
  topBar.name = "top-bar/Subscription trail back";
  topBar.x = C.main.topBar.x;
  topBar.y = C.main.topBar.y;
  mainComponent.appendChild(topBar);
  mainComponent.appendChild(makeFixedText(C.main.headerTitle, "header/title"));
  mainComponent.appendChild(makeFixedText(C.main.headerBody, "header/body"));
  for (const spec of C.cards) {
    const master = cardSet.children.find((entry) => entry.name === `Plan=${spec.plan}, Viewport=Desktop`);
    if (!master) throw new Error(`Missing plan card master ${spec.plan}`);
    const card = master.createInstance();
    card.name = `plan-card/${spec.plan}`;
    card.x = spec.position.x;
    card.y = spec.position.y;
    mainComponent.appendChild(card);
  }
  mainComponent.appendChild(makeFixedText(C.main.compareTitle, "compare/title"));
  mainComponent.description = `Measured ${C.cards[0].route} 1628×1056 main surface · ${PLAN.productCommit} · product-only scene`;
  section.appendChild(mainComponent);
  mainComponent.x = 1600;
  mainComponent.y = 240;
}

let sceneComponent = section.findOne((entry) => entry.type === "COMPONENT" && entry.name === C.sceneComponentName);
if (sceneComponent && (sceneComponent.children.length !== 2 || !sceneComponent.description.includes(PLAN.productCommit))) {
  sceneComponent.remove();
  sceneComponent = null;
}
if (!sceneComponent) {
  sceneComponent = figma.createComponent();
  sceneComponent.name = C.sceneComponentName;
  sceneComponent.resize(C.page.rect.width, C.page.rect.height);
  sceneComponent.fills = [setPaint(V.appBackground)];
  sceneComponent.clipsContent = true;
  setModes(sceneComponent);
  const gnb = gnbMaster.createInstance();
  gnb.name = "gnb/Current=Upgrade";
  gnb.x = 0;
  gnb.y = 0;
  sceneComponent.appendChild(gnb);
  const main = mainComponent.createInstance();
  main.name = "main/Desktop Upgrade";
  main.x = C.main.rect.x;
  main.y = C.main.rect.y;
  sceneComponent.appendChild(main);
  sceneComponent.description = `Measured ${C.cards[0].route} 1920×1080 scene; ${PLAN.redirectContracts[0].requestedRoute} without plan redirects here. ${PLAN.productCommit}.`;
  section.appendChild(sceneComponent);
  sceneComponent.x = 3300;
  sceneComponent.y = 240;
}
sceneComponent.clipsContent = true;

let mobileMainComponent = section.findOne((entry) => entry.type === "COMPONENT" && entry.name === C.mobileMainComponentName);
if (mobileMainComponent && (mobileMainComponent.children.length !== 5 || !mobileMainComponent.description.includes(PLAN.productCommit))) {
  mobileMainComponent.remove();
  mobileMainComponent = null;
}
if (!mobileMainComponent) {
  mobileMainComponent = figma.createComponent();
  mobileMainComponent.name = C.mobileMainComponentName;
  mobileMainComponent.resize(M.main.width, M.main.height);
  mobileMainComponent.cornerRadius = M.main.radius;
  bindCorners(mobileMainComponent, V.radius16);
  mobileMainComponent.fills = [setPaint(V.surface)];
  mobileMainComponent.effects = makeEffects(M.main.effects);
  mobileMainComponent.clipsContent = true;
  setModes(mobileMainComponent);
  const topBar = mobileTopBarMaster.createInstance();
  topBar.name = "top-bar/Subscription trail back mobile inset";
  topBar.x = M.main.topBar.x;
  topBar.y = M.main.topBar.y;
  mobileMainComponent.appendChild(topBar);
  mobileMainComponent.appendChild(makeFixedText(M.main.headerTitle, "header/title"));
  mobileMainComponent.appendChild(makeFixedText(M.main.headerBody, "header/body"));
  for (const spec of M.cards) {
    const master = mobileCardSet.children.find((entry) => entry.name === `Plan=${spec.plan}, Evidence=VisibleSlice`);
    if (!master) throw new Error(`Missing mobile visible-slice master ${spec.plan}`);
    const card = master.createInstance();
    card.name = `plan-card-visible-slice/${spec.plan}`;
    card.x = spec.position.x;
    card.y = spec.position.y;
    mobileMainComponent.appendChild(card);
  }
  mobileMainComponent.description = `Measured ${M.cards[0].route} 402×874 mobile main surface. Only viewport-observed Upgrade nodes are present. ${PLAN.productCommit} · product-only`;
  section.appendChild(mobileMainComponent);
  mobileMainComponent.x = 1600;
  mobileMainComponent.y = 1500;
}

let mobileSceneComponent = section.findOne((entry) => entry.type === "COMPONENT" && entry.name === C.mobileSceneComponentName);
if (mobileSceneComponent && (mobileSceneComponent.children.length !== 1 || !mobileSceneComponent.description.includes(PLAN.productCommit))) {
  mobileSceneComponent.remove();
  mobileSceneComponent = null;
}
if (!mobileSceneComponent) {
  mobileSceneComponent = figma.createComponent();
  mobileSceneComponent.name = C.mobileSceneComponentName;
  mobileSceneComponent.resize(M.page.rect.width, M.page.rect.height);
  mobileSceneComponent.fills = [setPaint(V.appBackground)];
  mobileSceneComponent.clipsContent = true;
  setModes(mobileSceneComponent);
  const main = mobileMainComponent.createInstance();
  main.name = "main/Mobile Upgrade Visible Slice";
  main.x = M.main.rect.x;
  main.y = M.main.rect.y;
  mobileSceneComponent.appendChild(main);
  mobileSceneComponent.description = `Measured ${M.cards[0].route} 402×874 scene; ${PLAN.redirectContracts[1].requestedRoute} without plan redirects here. Pro, Max, and actions are unobserved and intentionally absent. ${PLAN.productCommit}.`;
  section.appendChild(mobileSceneComponent);
  mobileSceneComponent.x = 2100;
  mobileSceneComponent.y = 1500;
}

const paints = [];
const measuredOutlineNames = new Set([
  "Plan=Trial, Viewport=Desktop",
  "Plan=Trial, Evidence=VisibleSlice",
  "plan-card/Trial",
  "plan-card-visible-slice/Trial",
]);
const near = (left, right) => Math.abs(left - right) < 0.000001;
for (const root of [cardSet, mainComponent, sceneComponent, mobileCardSet, mobileMainComponent, mobileSceneComponent]) {
  for (const node of [root, ...root.findAll(() => true)]) {
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
        const measuredOutlineFixed =
          field === "strokes" && measuredOutlineNames.has(node.name) && node.strokeWeight === 2 && node.strokeAlign === "INSIDE" &&
          near(paint.color.r, 185 / 255) && near(paint.color.g, 225 / 255) && near(paint.color.b, 247 / 255) && near(paint.opacity ?? 1, 0.42);
        paints.push({ node: node.name, field, bound: Boolean(paint.boundVariables?.color), brandFixed, measuredOutlineFixed });
      }
    }
  }
}
const unexpected = paints.filter((entry) => !entry.bound && !entry.brandFixed && !entry.measuredOutlineFixed);
if (unexpected.length) throw new Error(`Unexpected unbound visible paints ${JSON.stringify(unexpected)}`);
const auditedRoots = [section, docs, cardSet, mainComponent, sceneComponent, mobileCardSet, mobileMainComponent, mobileSceneComponent];
const mutatedNodeIds = [...new Set(auditedRoots.flatMap((root) => [root, ...root.findAll(() => true)].map((entry) => entry.id)))];
return {
  sectionId: section.id,
  docFrameId: docs.id,
  cardComponentSetId: cardSet.id,
  cardVariantIds: cardSet.children.map((entry) => entry.id),
  mainComponentId: mainComponent.id,
  sceneComponentId: sceneComponent.id,
  mobileVisibleCardComponentSetId: mobileCardSet.id,
  mobileVisibleCardVariantIds: mobileCardSet.children.map((entry) => entry.id),
  mobileMainComponentId: mobileMainComponent.id,
  mobileSceneComponentId: mobileSceneComponent.id,
  visiblePaintCount: paints.length,
  boundVisiblePaintCount: paints.filter((entry) => entry.bound).length,
  allowedFixedBrandPaintCount: paints.filter((entry) => !entry.bound && entry.brandFixed).length,
  allowedFixedMeasuredOutlinePaintCount: paints.filter((entry) => !entry.bound && entry.measuredOutlineFixed).length,
  mutatedNodeIds,
};
