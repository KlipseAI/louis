const C = PLAN.component;
const page =
  (await figma.getNodeByIdAsync(C.pageId)) ??
  figma.root.children.find((entry) => entry.name === C.pageName);
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
const primitiveMode = getMode(B.primitiveCollection, B.primitiveMode);
const setModes = (node) => {
  node.setExplicitVariableModeForCollection(paletteMode.collectionId, paletteMode.modeId);
  node.setExplicitVariableModeForCollection(semanticMode.collectionId, semanticMode.modeId);
  node.setExplicitVariableModeForCollection(primitiveMode.collectionId, primitiveMode.modeId);
};
const setPaint = (variable, fallback = { r: 0, g: 0, b: 0 }) =>
  figma.variables.setBoundVariableForPaint({ type: "SOLID", color: fallback }, "color", variable);
const bindCorners = (node, variable) => {
  for (const field of ["topLeftRadius", "topRightRadius", "bottomRightRadius", "bottomLeftRadius"]) {
    node.setBoundVariable(field, variable);
  }
};

await Promise.all([
  figma.loadFontAsync({ family: "Pretendard", style: "Regular" }),
  figma.loadFontAsync({ family: "Pretendard", style: "Medium" }),
]);
const weightStyle = { 400: "Regular", 500: "Medium" };
const makeFixedText = (spec, variable, name, rect = spec.rect) => {
  const text = figma.createText();
  text.name = name;
  text.fontName = { family: "Pretendard", style: weightStyle[spec.fontWeight] ?? "Regular" };
  text.fontSize = spec.fontSize;
  text.lineHeight = { unit: "PIXELS", value: spec.lineHeight };
  text.letterSpacing = { unit: "PIXELS", value: spec.letterSpacing };
  text.characters = spec.text;
  text.textAutoResize = "NONE";
  text.resize(rect.width, rect.height);
  text.x = rect.x;
  text.y = rect.y;
  text.textAlignHorizontal = spec.textAlign === "right" ? "RIGHT" : spec.textAlign === "center" ? "CENTER" : "LEFT";
  text.fills = [setPaint(variable)];
  return text;
};

const dependencyNames = Object.values(C.dependencies).filter((value) => value.startsWith("Product/"));
const dependencySets = new Map();
for (const set of page.findAllWithCriteria({ types: ["COMPONENT_SET"] })) {
  if (!dependencyNames.includes(set.name)) continue;
  if (dependencySets.has(set.name)) throw new Error(`Duplicate dependency ${set.name}`);
  dependencySets.set(set.name, set);
}
const master = (setName, variantName) => {
  const set = dependencySets.get(setName);
  const value = set?.children.find((entry) => entry.name === variantName);
  if (!set || !value) throw new Error(`Missing dependency variant ${setName}/${variantName}`);
  return value;
};
const gnbMaster = master(C.dependencies.gnbSet, C.dependencies.gnbVariant);
const desktopTopBarMaster = master(C.dependencies.desktopTopBarSet, C.dependencies.desktopTopBarVariant);
const mobileTopBarMaster = master(C.dependencies.mobileTopBarSet, C.dependencies.mobileTopBarVariant);

let section = page.children.find((entry) => entry.type === "SECTION" && entry.name === C.sectionName);
if (!section) {
  section = figma.createSection();
  section.name = C.sectionName;
  section.x = Math.max(...page.children.filter((entry) => entry !== section).map((entry) => entry.x + entry.width), 0) + 182;
  section.y = 0;
  section.resizeWithoutConstraints(6100, 6000);
}
if (section.width < 6100 || section.height < 6000) section.resizeWithoutConstraints(6100, 6000);
setModes(section);
section.fills = [setPaint(V.appBackground)];

let docs = section.findOne((entry) => entry.name === `${C.contentSetName} / Documentation`);
if (!docs) {
  docs = figma.createFrame();
  docs.name = `${C.contentSetName} / Documentation`;
  docs.x = 40;
  docs.y = 40;
  docs.resize(900, 156);
  docs.layoutMode = "VERTICAL";
  docs.primaryAxisSizingMode = docs.counterAxisSizingMode = "FIXED";
  docs.paddingTop = docs.paddingRight = docs.paddingBottom = docs.paddingLeft = 32;
  docs.itemSpacing = 12;
  docs.fills = [];
  const title = figma.createText();
  title.fontName = { family: "Pretendard", style: "Medium" };
  title.fontSize = 28;
  title.characters = C.contentSetName;
  title.fills = [setPaint(V.current)];
  docs.appendChild(title);
  const note = figma.createText();
  note.fontName = { family: "Pretendard", style: "Regular" };
  note.fontSize = 14;
  note.lineHeight = { unit: "PERCENT", value: 150 };
  note.characters = `${PLAN.productCommit.slice(0, 8)} · 3 routes × desktop/mobile · every geometry and paint measured · product-only`;
  note.fills = [setPaint(V.secondary)];
  docs.appendChild(note);
  section.appendChild(docs);
}

const createAction = (action, rootRect) => {
  const frame = figma.createFrame();
  frame.name = `action/${action.text}`;
  frame.x = action.rect.x - rootRect.x;
  frame.y = action.rect.y - rootRect.y;
  frame.resize(action.rect.width, action.rect.height);
  frame.cornerRadius = action.radius;
  bindCorners(frame, V.radius12);
  const primary = action.fill[0] === 0 && action.fill[1] === 0 && action.fill[2] === 0 && action.fill[3] === 1;
  frame.fills = [setPaint(primary ? V.current : V.secondaryButton)];
  const labelSpec = { ...action.textStyle, textAlign: "center" };
  const label = makeFixedText(labelSpec, primary ? V.surface : V.current, "label", {
    x: 0, y: 0, width: action.rect.width, height: action.rect.height,
  });
  label.textAlignVertical = "CENTER";
  frame.appendChild(label);
  return frame;
};

let contentSet = section.findOne((entry) => entry.type === "COMPONENT_SET" && entry.name === C.contentSetName);
if (!contentSet) {
  const variants = [];
  for (const spec of C.variants) {
    const component = figma.createComponent();
    component.name = `Outcome=${spec.outcome}, Viewport=${spec.viewport}`;
    component.resize(spec.rect.width, spec.rect.height);
    component.fills = [];
    setModes(component);
    component.appendChild(makeFixedText(spec.title, V.current, "title"));
    component.appendChild(makeFixedText(spec.body, V.secondary, "body"));
    if (spec.alert) {
      const alert = figma.createFrame();
      alert.name = "alert/error";
      alert.x = spec.alert.rect.x;
      alert.y = spec.alert.rect.y;
      alert.resize(spec.alert.rect.width, spec.alert.rect.height);
      alert.cornerRadius = spec.alert.radius;
      bindCorners(alert, V.radius12);
      alert.strokeWeight = spec.alert.strokeWidth;
      alert.strokes = [setPaint(V.errorBorder)];
      alert.fills = [setPaint(V.errorSurface)];
      const alertTextSpec = { ...spec.alert.textStyle, text: spec.alert.text };
      const alertText = makeFixedText(alertTextSpec, V.error, "message", {
        x: spec.alert.textRect.x - spec.alert.rect.x,
        y: spec.alert.textRect.y - spec.alert.rect.y,
        width: spec.alert.textRect.width,
        height: spec.alert.textRect.height,
      });
      alert.appendChild(alertText);
      component.appendChild(alert);
    }
    if (spec.details) {
      const details = figma.createFrame();
      details.name = "details";
      details.x = spec.details.rect.x;
      details.y = spec.details.rect.y;
      details.resize(spec.details.rect.width, spec.details.rect.height);
      details.fills = [];
      for (const [index, rowSpec] of spec.details.rows.entries()) {
        const row = figma.createFrame();
        row.name = `row/${rowSpec.term.text}`;
        row.x = rowSpec.rect.x - spec.details.rect.x;
        row.y = rowSpec.rect.y - spec.details.rect.y;
        row.resize(rowSpec.rect.width, rowSpec.rect.height);
        row.fills = [];
        row.appendChild(makeFixedText(rowSpec.term, V.tertiary, "term", {
          x: rowSpec.term.rect.x - rowSpec.rect.x,
          y: rowSpec.term.rect.y - rowSpec.rect.y,
          width: rowSpec.term.rect.width,
          height: rowSpec.term.rect.height,
        }));
        row.appendChild(makeFixedText(rowSpec.value, V.current, "value", {
          x: rowSpec.value.rect.x - rowSpec.rect.x,
          y: rowSpec.value.rect.y - rowSpec.rect.y,
          width: rowSpec.value.rect.width,
          height: rowSpec.value.rect.height,
        }));
        details.appendChild(row);
      }
      component.appendChild(details);
    }
    const actions = figma.createFrame();
    actions.name = "actions";
    actions.x = spec.actionGroup.rect.x;
    actions.y = spec.actionGroup.rect.y;
    actions.resize(spec.actionGroup.rect.width, spec.actionGroup.rect.height);
    actions.fills = [];
    for (const action of spec.actionGroup.actions) actions.appendChild(createAction(action, spec.actionGroup.rect));
    component.appendChild(actions);
    component.description = `Measured ${spec.route} ${spec.viewport} checkout status · ${PLAN.productCommit} · product-only`;
    section.appendChild(component);
    variants.push(component);
  }
  contentSet = figma.combineAsVariants(variants, section);
  contentSet.name = C.contentSetName;
  contentSet.description = `Six measured checkout status variants. Desktop/mobile wrapping and detail orientation are preserved. ${PLAN.productCommit}. Not normative.`;
  contentSet.fills = [];
  const order = new Map([["BillingSuccess", 0], ["BillingFail", 1], ["CheckoutFail", 2]]);
  for (const variant of contentSet.children) {
    const outcome = variant.name.match(/Outcome=([^,]+)/)?.[1];
    const viewport = variant.name.match(/Viewport=(.+)$/)?.[1];
    variant.x = 40 + (order.get(outcome) ?? 0) * 560;
    variant.y = viewport === "Desktop" ? 40 : 520;
  }
  contentSet.resizeWithoutConstraints(1720, 1200);
  contentSet.x = 40;
  contentSet.y = 240;
}

const applyDetailGlyphLayout = (variant, spec) => {
  if (!spec.details) return;
  const details = variant.findOne((entry) => entry.type === "FRAME" && entry.name === "details");
  if (!details) throw new Error(`Missing details frame ${spec.outcome}/${spec.viewport}`);
  for (const rowSpec of spec.details.rows) {
    const row = details.findOne((entry) => entry.type === "FRAME" && entry.name === `row/${rowSpec.term.text}`);
    const term = row?.findOne((entry) => entry.type === "TEXT" && entry.name === "term");
    const value = row?.findOne((entry) => entry.type === "TEXT" && entry.name === "value");
    if (!row || !term || !value) throw new Error(`Missing detail glyphs ${spec.outcome}/${spec.viewport}/${rowSpec.term.text}`);
    const place = (text, textSpec, side) => {
      text.textAutoResize = "NONE";
      text.resize(textSpec.figmaWidth, textSpec.rect.height);
      text.y = textSpec.rect.y - rowSpec.rect.y;
      if (rowSpec.direction === "column") {
        text.x = (rowSpec.rect.width - textSpec.figmaWidth) / 2;
      } else if (side === "term") {
        text.x = textSpec.rect.x - rowSpec.rect.x;
      } else {
        const measuredRight = rowSpec.rect.x + rowSpec.rect.width - textSpec.rect.x - textSpec.rect.width;
        text.x = rowSpec.rect.width - measuredRight - textSpec.figmaWidth;
      }
    };
    place(term, rowSpec.term, "term");
    place(value, rowSpec.value, "value");
  }
};
for (const spec of C.variants.filter((entry) => entry.details)) {
  const variant = contentSet.children.find((entry) => entry.name === `Outcome=${spec.outcome}, Viewport=${spec.viewport}`);
  if (!variant) throw new Error(`Missing checkout content for glyph repair ${spec.outcome}/${spec.viewport}`);
  applyDetailGlyphLayout(variant, spec);
}

const contentMaster = (spec) => {
  const value = contentSet.children.find((entry) => entry.name === `Outcome=${spec.outcome}, Viewport=${spec.viewport}`);
  if (!value) throw new Error(`Missing checkout content ${spec.outcome}/${spec.viewport}`);
  return value;
};
const createMainSet = (viewport, setName, x, y) => {
  let set = section.findOne((entry) => entry.type === "COMPONENT_SET" && entry.name === setName);
  if (set) return set;
  const specs = C.scenes.filter((entry) => entry.viewport === viewport);
  const variants = [];
  for (const spec of specs) {
    const component = figma.createComponent();
    component.name = `Outcome=${spec.outcome}`;
    component.resize(spec.main.rect.width, spec.main.rect.height);
    component.cornerRadius = spec.main.radius;
    bindCorners(component, V.radius16);
    component.fills = [setPaint(V.surface)];
    component.clipsContent = true;
    setModes(component);
    const topBar = (viewport === "Desktop" ? desktopTopBarMaster : mobileTopBarMaster).createInstance();
    topBar.name = `top-bar/${viewport}`;
    topBar.x = spec.topBar.x;
    topBar.y = spec.topBar.y;
    component.appendChild(topBar);
    const content = contentMaster(spec).createInstance();
    content.name = `content/Outcome=${spec.outcome}`;
    content.x = spec.content.x;
    content.y = spec.content.y;
    component.appendChild(content);
    component.description = `Measured ${spec.route} ${viewport} main surface · ${PLAN.productCommit} · product-only`;
    section.appendChild(component);
    variants.push(component);
  }
  set = figma.combineAsVariants(variants, section);
  set.name = setName;
  set.description = `Measured ${viewport} checkout-status main surfaces using nested product components. ${PLAN.productCommit}. Not normative.`;
  set.fills = [];
  const width = specs[0].main.rect.width;
  const height = specs[0].main.rect.height;
  for (const [index, variant] of set.children.entries()) {
    variant.x = 40 + index * (width + 40);
    variant.y = 40;
  }
  set.resizeWithoutConstraints(width * variants.length + 160, height + 80);
  set.x = x;
  set.y = y;
  return set;
};
const desktopMainSet = createMainSet("Desktop", C.desktopMainSetName, 40, 1500);
const mobileMainSet = createMainSet("Mobile", C.mobileMainSetName, 40, 3900);

const createSceneSet = (viewport, setName, mainSet, x, y) => {
  let set = section.findOne((entry) => entry.type === "COMPONENT_SET" && entry.name === setName);
  if (set) return set;
  const specs = C.scenes.filter((entry) => entry.viewport === viewport);
  const variants = [];
  for (const spec of specs) {
    const mainMaster = mainSet.children.find((entry) => entry.name === `Outcome=${spec.outcome}`);
    if (!mainMaster) throw new Error(`Missing main surface ${spec.outcome}/${viewport}`);
    const component = figma.createComponent();
    component.name = `Outcome=${spec.outcome}`;
    component.resize(spec.page.rect.width, spec.page.rect.height);
    component.fills = [setPaint(V.appBackground)];
    setModes(component);
    if (viewport === "Desktop") {
      const gnb = gnbMaster.createInstance();
      gnb.name = "gnb/Current=Upgrade";
      gnb.x = 0;
      gnb.y = 0;
      component.appendChild(gnb);
    }
    const main = mainMaster.createInstance();
    main.name = `main/Outcome=${spec.outcome}`;
    main.x = spec.main.rect.x;
    main.y = spec.main.rect.y;
    component.appendChild(main);
    component.description = `Measured ${spec.route} ${spec.page.rect.width}×${spec.page.rect.height} scene · ${PLAN.productCommit} · product-only`;
    section.appendChild(component);
    variants.push(component);
  }
  set = figma.combineAsVariants(variants, section);
  set.name = setName;
  set.description = `Measured full ${viewport} checkout-status scenes composed from nested product components. ${PLAN.productCommit}. Not normative.`;
  set.fills = [];
  const width = specs[0].page.rect.width;
  const height = specs[0].page.rect.height;
  for (const [index, variant] of set.children.entries()) {
    variant.x = 40 + index * (width + 40);
    variant.y = 40;
  }
  set.resizeWithoutConstraints(width * variants.length + 160, height + 80);
  set.x = x;
  set.y = y;
  return set;
};
const desktopSceneSet = createSceneSet("Desktop", C.desktopSceneSetName, desktopMainSet, 40, 2600);
const mobileSceneSet = createSceneSet("Mobile", C.mobileSceneSetName, mobileMainSet, 2000, 3900);

const auditedRoots = [contentSet, desktopMainSet, desktopSceneSet, mobileMainSet, mobileSceneSet];
const paints = [];
for (const root of auditedRoots) {
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
        paints.push({ node: node.name, field, bound: Boolean(paint.boundVariables?.color), brandFixed });
      }
    }
  }
}
const unexpected = paints.filter((entry) => !entry.bound && !entry.brandFixed);
if (unexpected.length) throw new Error(`Unexpected unbound visible paints ${JSON.stringify(unexpected)}`);
return {
  sectionId: section.id,
  docFrameId: docs.id,
  contentComponentSetId: contentSet.id,
  contentVariantIds: contentSet.children.map((entry) => entry.id),
  desktopMainComponentSetId: desktopMainSet.id,
  desktopSceneComponentSetId: desktopSceneSet.id,
  mobileMainComponentSetId: mobileMainSet.id,
  mobileSceneComponentSetId: mobileSceneSet.id,
  visiblePaintCount: paints.length,
  boundVisiblePaintCount: paints.filter((entry) => entry.bound).length,
  allowedFixedBrandPaintCount: paints.filter((entry) => !entry.bound && entry.brandFixed).length,
};
