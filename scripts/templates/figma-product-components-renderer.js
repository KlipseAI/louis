const P = PLAN.component;
const page =
  (await figma.getNodeByIdAsync(P.pageId)) ??
  figma.root.children.find((entry) => entry.name === P.pageName);
if (!page) throw new Error(`Missing target page ${P.pageName}`);
await figma.setCurrentPageAsync(page);

const collections = await figma.variables.getLocalVariableCollectionsAsync();
const collectionByName = new Map(collections.map((entry) => [entry.name, entry]));
const collectionById = new Map(collections.map((entry) => [entry.id, entry]));
const variables = await figma.variables.getLocalVariablesAsync();
const variableById = new Map(variables.map((entry) => [entry.id, entry]));
const variableByKey = new Map(
  variables.map((entry) => [
    `${collectionById.get(entry.variableCollectionId)?.name}\u0000${entry.name}`,
    entry,
  ]),
);
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
const B = P.bindings;
const V = Object.fromEntries(
  Object.entries(B)
    .filter(([, value]) => value && typeof value === "object" && "collection" in value)
    .map(([key, value]) => [key, getVariable(value)]),
);
const paletteMode = getMode(B.paletteCollection, B.paletteMode);
const ctaPaletteMode = getMode(B.paletteCollection, B.ctaPaletteMode);
const semanticMode = getMode(B.semanticCollection, B.semanticMode);

const allComponents = page.findAllWithCriteria({ types: ["COMPONENT"] });
const componentByName = new Map();
for (const component of allComponents) {
  if (Object.values(P.iconComponents).includes(component.name)) {
    if (componentByName.has(component.name)) throw new Error(`Duplicate master ${component.name}`);
    componentByName.set(component.name, component);
  }
}
for (const name of Object.values(P.iconComponents)) {
  if (!componentByName.has(name)) throw new Error(`Missing icon master ${name}`);
}

let section = page.children.find(
  (entry) => entry.type === "SECTION" && entry.name === P.sectionName,
);
const existingSet = section?.findOne(
  (entry) => entry.type === "COMPONENT_SET" && entry.name === P.componentSetName,
);

await Promise.all([
  figma.loadFontAsync({ family: "Pretendard", style: "Regular" }),
  figma.loadFontAsync({ family: "Pretendard", style: "Medium" }),
  figma.loadFontAsync({ family: "Pretendard", style: "SemiBold" }),
]);
const variableColor = (variable, seen = new Set()) => {
  if (seen.has(variable.id)) throw new Error(`Circular color variable ${variable.name}`);
  seen.add(variable.id);
  const modeId = variable.variableCollectionId === semanticMode.collectionId
    ? semanticMode.modeId
    : variable.variableCollectionId === paletteMode.collectionId
      ? paletteMode.modeId
      : Object.keys(variable.valuesByMode)[0];
  const value = variable.valuesByMode[modeId];
  if (value?.type === "VARIABLE_ALIAS") {
    const target = variableById.get(value.id);
    if (!target) throw new Error(`Missing color alias ${value.id}`);
    return variableColor(target, seen);
  }
  if (!value || typeof value !== "object" || !("r" in value)) throw new Error(`Missing color mode ${variable.name}`);
  return { r: value.r, g: value.g, b: value.b };
};
const setPaint = (variable, fallback = variableColor(variable)) =>
  figma.variables.setBoundVariableForPaint({ type: "SOLID", color: fallback }, "color", variable);
const bindCorners = (node, variable) => {
  for (const field of ["topLeftRadius", "topRightRadius", "bottomRightRadius", "bottomLeftRadius"]) {
    node.setBoundVariable(field, variable);
  }
};
const bindIconPaints = (instance, variable) => {
  for (const vector of instance.findAllWithCriteria({ types: ["VECTOR"] })) {
    if (Array.isArray(vector.fills)) {
      vector.fills = vector.fills.map((paint) =>
        paint.type === "SOLID" ? figma.variables.setBoundVariableForPaint({ ...paint, color: variableColor(variable) }, "color", variable) : paint,
      );
    }
    if (Array.isArray(vector.strokes)) {
      vector.strokes = vector.strokes.map((paint) =>
        paint.type === "SOLID" ? figma.variables.setBoundVariableForPaint({ ...paint, color: variableColor(variable) }, "color", variable) : paint,
      );
    }
  }
};
const weightStyle = { 400: "Regular", 500: "Medium", 600: "SemiBold" };
const makeText = (spec, variable) => {
  const text = figma.createText();
  text.name = "label";
  text.fontName = { family: "Pretendard", style: weightStyle[spec.fontWeight] ?? "Regular" };
  text.fontSize = spec.fontSize;
  text.lineHeight = { unit: "PIXELS", value: spec.lineHeight };
  text.letterSpacing = { unit: "PIXELS", value: spec.letterSpacing };
  text.characters = spec.text;
  text.textAutoResize = "WIDTH_AND_HEIGHT";
  text.fills = [setPaint(variable)];
  return text;
};
const makeIcon = (spec, variable, active = false) => {
  const masterName = P.iconComponents[spec.asset];
  const instance = componentByName.get(masterName).createInstance();
  instance.name = "icon";
  instance.resize(spec.rect.width, spec.rect.height);
  bindIconPaints(instance, variable);
  instance.opacity = active ? 1 : spec.opacity;
  return instance;
};
const applyMeasuredFrame = (frame, spec, gap) => {
  frame.layoutMode = "HORIZONTAL";
  frame.primaryAxisSizingMode = "FIXED";
  frame.counterAxisSizingMode = "FIXED";
  frame.resize(spec.rect.width, spec.rect.height);
  frame.counterAxisAlignItems = "CENTER";
  frame.paddingTop = spec.padding.top;
  frame.paddingRight = spec.padding.right;
  frame.paddingBottom = spec.padding.bottom;
  frame.paddingLeft = spec.padding.left;
  frame.itemSpacing = gap;
  frame.cornerRadius = spec.radius;
  frame.fills = [];
  if (gap === 4) frame.setBoundVariable("itemSpacing", V.spacing4);
  if (gap === 10) frame.setBoundVariable("itemSpacing", V.spacing10);
  if (spec.padding.left === 4) frame.setBoundVariable("paddingLeft", V.spacing4);
  if (spec.padding.right === 4) frame.setBoundVariable("paddingRight", V.spacing4);
  if (spec.radius === 10) bindCorners(frame, V.radius10);
};

if (!section) {
  const maxRight = Math.max(...page.children.map((entry) => entry.x + entry.width), 0);
  section = figma.createSection();
  section.name = P.sectionName;
  section.x = maxRight + 182;
  section.y = 0;
  section.resizeWithoutConstraints(1800, 980);
}
section.setExplicitVariableModeForCollection(paletteMode.collectionId, paletteMode.modeId);
section.fills = [setPaint(V.createButtonBackground, { r: 1, g: 1, b: 1 })];

let docs = section.findOne((entry) => entry.name === `${P.componentSetName} / Documentation`);
if (!docs) {
  docs = figma.createFrame();
  docs.name = `${P.componentSetName} / Documentation`;
  docs.x = 40;
  docs.y = 40;
  docs.layoutMode = "VERTICAL";
  docs.primaryAxisSizingMode = "AUTO";
  docs.counterAxisSizingMode = "FIXED";
  docs.resize(620, 100);
  docs.paddingTop = docs.paddingRight = docs.paddingBottom = docs.paddingLeft = 32;
  docs.itemSpacing = 12;
  docs.fills = [];
  section.appendChild(docs);
  const title = figma.createText();
  title.name = "title";
  title.fontName = { family: "Pretendard", style: "SemiBold" };
  title.fontSize = 28;
  title.characters = P.componentSetName;
  title.fills = [setPaint(V.inactive)];
  docs.appendChild(title);
  const note = figma.createText();
  note.name = "measurement-note";
  note.fontName = { family: "Pretendard", style: "Regular" };
  note.fontSize = 14;
  note.lineHeight = { unit: "PERCENT", value: 150 };
  note.characters = `${PLAN.productCommit.slice(0, 8)} · ${PLAN.context} · ${PLAN.sourceCandidate.nodeCount} nodes · ${PLAN.sourceCandidate.routeCount} routes · product-only candidate`;
  note.textAutoResize = "WIDTH_AND_HEIGHT";
  note.fills = [setPaint(V.muted)];
  docs.appendChild(note);
}

const makeEffects = (specs) =>
  specs.map((effect) => ({
    type: effect.type,
    color: { r: effect.color[0], g: effect.color[1], b: effect.color[2], a: effect.color[3] },
    offset: effect.offset,
    radius: effect.radius,
    spread: effect.spread,
    visible: true,
    blendMode: "NORMAL",
  }));
const C = P.upgradeCta;
let upgradeSet = section.findOne(
  (entry) => entry.type === "COMPONENT_SET" && entry.name === C.componentSetName,
);
if (!upgradeSet) {
  const makeUpgrade = (spec, fillVariable, textVariable) => {
    const component = figma.createComponent();
    component.name = `State=${spec.state}`;
    component.layoutMode = "HORIZONTAL";
    component.primaryAxisSizingMode = component.counterAxisSizingMode = "FIXED";
    component.resize(spec.rect.width, spec.rect.height);
    component.primaryAxisAlignItems = component.counterAxisAlignItems = "CENTER";
    component.itemSpacing = spec.gap;
    component.paddingTop = spec.padding.top;
    component.paddingRight = spec.padding.right;
    component.paddingBottom = spec.padding.bottom;
    component.paddingLeft = spec.padding.left;
    component.cornerRadius = spec.radius;
    component.setBoundVariable("itemSpacing", V.spacing8);
    component.setBoundVariable("paddingTop", V.spacing10);
    component.setBoundVariable("paddingBottom", V.spacing10);
    component.setBoundVariable("paddingLeft", V.spacing14);
    component.setBoundVariable("paddingRight", V.spacing14);
    bindCorners(component, V.radius12);
    component.fills = [setPaint(fillVariable)];
    component.effects = makeEffects(spec.effects);
    component.setExplicitVariableModeForCollection(paletteMode.collectionId, paletteMode.modeId);
    component.appendChild(makeText(spec.label, textVariable));
    component.description = `Measured ${spec.route} · ${PLAN.productCommit}`;
    return component;
  };
  const defaultSpec = C.variants.find((entry) => entry.state === "Default");
  const currentSpec = C.variants.find((entry) => entry.state === "Current");
  if (!defaultSpec || !currentSpec) throw new Error("Missing measured Upgrade CTA variants");
  const defaultCta = makeUpgrade(defaultSpec, V.surfaceStrong, V.surfaceInverse);
  const currentCta = makeUpgrade(currentSpec, V.surfaceInverse, V.active);
  section.appendChild(defaultCta);
  section.appendChild(currentCta);
  upgradeSet = figma.combineAsVariants([defaultCta, currentCta], section);
  upgradeSet.name = C.componentSetName;
  upgradeSet.description = `Measured Gnb CTA states · ${PLAN.productCommit}`;
  upgradeSet.fills = [];
  for (const [index, variant] of upgradeSet.children.entries()) {
    variant.x = 40 + index * (defaultSpec.rect.width + 40);
    variant.y = 40;
  }
  upgradeSet.resizeWithoutConstraints(defaultSpec.rect.width * C.variants.length + 120, defaultSpec.rect.height + 80);
  upgradeSet.x = 720;
  upgradeSet.y = 680;
}

const ensureShell = (menuSet, ctaSet) => {
  const S = P.shell;
  let shellSet = section.findOne(
    (entry) => entry.type === "COMPONENT_SET" && entry.name === S.componentSetName,
  );
  const menuByCurrent = new Map(menuSet.children.map((entry) => [entry.name.replace(/^Current=/, ""), entry]));
  const ctaByState = new Map(ctaSet.children.map((entry) => [entry.name.replace(/^State=/, ""), entry]));
  const logoMaster = componentByName.get(P.iconComponents[S.brand.image.darkAsset]);
  if (!logoMaster) throw new Error(`Missing Gnb dark brand master ${S.brand.image.darkAsset}`);
  if (!shellSet) {
    const variants = [];
    for (const spec of S.variants) {
      const menuMaster = menuByCurrent.get(spec.menuCurrent);
      const ctaMaster = ctaByState.get(spec.ctaState);
      if (!menuMaster || !ctaMaster) throw new Error(`Missing nested Gnb variant ${spec.current}`);
      const shell = figma.createComponent();
      shell.name = `Current=${spec.current}`;
      shell.resize(S.root.width, S.root.height);
      shell.fills = [];
      shell.setExplicitVariableModeForCollection(paletteMode.collectionId, paletteMode.modeId);
      shell.setExplicitVariableModeForCollection(semanticMode.collectionId, semanticMode.modeId);
      const brand = figma.createFrame();
      brand.name = "brand/Klipse";
      brand.resize(S.brand.rect.width, S.brand.rect.height);
      brand.layoutMode = "HORIZONTAL";
      brand.primaryAxisSizingMode = brand.counterAxisSizingMode = "FIXED";
      brand.counterAxisAlignItems = "CENTER";
      brand.paddingLeft = S.brand.paddingLeft;
      brand.itemSpacing = S.brand.gap;
      brand.setBoundVariable("paddingLeft", V.spacing4);
      brand.setBoundVariable("itemSpacing", V.spacing8);
      brand.fills = [];
      const logo = logoMaster.createInstance();
      logo.name = "logo/klipse-dark";
      logo.resize(S.brand.image.rect.width, S.brand.image.rect.height);
      brand.appendChild(logo);
      const menu = menuMaster.createInstance();
      menu.name = `menu · Current=${spec.menuCurrent}`;
      const top = figma.createFrame();
      top.name = "flow/brand-and-menu";
      top.fills = [];
      top.appendChild(brand);
      top.appendChild(menu);
      shell.appendChild(top);
      const cta = ctaMaster.createInstance();
      cta.name = `upgrade-cta · State=${spec.ctaState}`;
      cta.setExplicitVariableModeForCollection(ctaPaletteMode.collectionId, ctaPaletteMode.modeId);
      shell.appendChild(cta);
      shell.description = `Measured ${spec.route} Gnb · ${PLAN.productCommit}`;
      section.appendChild(shell);
      variants.push(shell);
    }
    shellSet = figma.combineAsVariants(variants, section);
    shellSet.name = S.componentSetName;
    shellSet.description = `Measured desktop Gnb composition · ${PLAN.productCommit}`;
    shellSet.fills = [];
    for (const [index, variant] of shellSet.children.entries()) {
      variant.x = 40 + index * (S.root.width + 40);
      variant.y = 40;
    }
    shellSet.resizeWithoutConstraints(S.root.width * S.variants.length + 200, S.root.height + 80);
    shellSet.x = 720;
    shellSet.y = 900;
  }
  const defaultShell = shellSet.children.find((entry) => entry.name === "Current=Default");
  if (!defaultShell) throw new Error("Missing default Gnb shell variant");
  for (const spec of S.variants) {
    if (shellSet.children.some((entry) => entry.name === `Current=${spec.current}`)) continue;
    const menuMaster = menuByCurrent.get(spec.menuCurrent);
    if (!menuMaster) throw new Error(`Missing nested Gnb menu ${spec.menuCurrent}`);
    const shell = defaultShell.clone();
    shell.name = `Current=${spec.current}`;
    const menu = shell.findOne(
      (entry) => entry.type === "INSTANCE" && entry.name.startsWith("menu ·"),
    );
    if (!menu) throw new Error(`Missing cloned Gnb menu ${spec.current}`);
    menu.swapComponent(menuMaster);
    menu.name = `menu · Current=${spec.menuCurrent}`;
    shellSet.appendChild(shell);
  }
  const specByName = new Map(S.variants.map((spec) => [`Current=${spec.current}`, spec]));
  for (const [index, shell] of shellSet.children.entries()) {
    const spec = specByName.get(shell.name);
    if (!spec) throw new Error(`Unexpected Gnb shell variant ${shell.name}`);
    const brand = shell.findOne((entry) => entry.type === "FRAME" && entry.name === "brand/Klipse");
    const logo = shell.findOne((entry) => entry.type === "INSTANCE" && entry.name.startsWith("logo/klipse-"));
    const menu = shell.findOne((entry) => entry.type === "INSTANCE" && entry.name.startsWith("menu ·"));
    const cta = shell.findOne((entry) => entry.type === "INSTANCE" && entry.name.startsWith("upgrade-cta ·"));
    if (!brand || !logo || !menu || !cta) throw new Error(`Missing measured Gnb children ${shell.name}`);
    if (logo.mainComponent?.id !== logoMaster.id) logo.swapComponent(logoMaster);
    logo.name = "logo/klipse-dark";
    logo.resize(S.brand.image.rect.width, S.brand.image.rect.height);
    let top = shell.children.find((entry) => entry.type === "FRAME" && entry.name === "flow/brand-and-menu");
    if (!top) {
      top = figma.createFrame();
      top.name = "flow/brand-and-menu";
      top.fills = [];
      shell.insertChild(0, top);
      top.appendChild(brand);
      top.appendChild(menu);
    }
    top.layoutMode = "VERTICAL";
    top.primaryAxisSizingMode = top.counterAxisSizingMode = "FIXED";
    top.resize(S.nav.width, S.brand.rect.height + (S.menu.y - (S.brand.rect.y + S.brand.rect.height)) + S.menu.height);
    top.itemSpacing = S.menu.y - (S.brand.rect.y + S.brand.rect.height);
    top.setBoundVariable("itemSpacing", V.spacing12);
    top.fills = [];
    brand.resize(S.brand.rect.width, S.brand.rect.height);
    menu.resize(S.menu.width, S.menu.height);
    cta.resize(S.upgradeCta.width, S.upgradeCta.height);
    const expectedMenuMaster = menuByCurrent.get(spec.menuCurrent);
    if (!expectedMenuMaster) throw new Error(`Missing measured menu state ${spec.menuCurrent}`);
    if (menu.mainComponent?.id !== expectedMenuMaster.id) menu.swapComponent(expectedMenuMaster);
    menu.name = `menu · Current=${spec.menuCurrent}`;
    const expectedCtaMaster = ctaByState.get(spec.ctaState);
    if (!expectedCtaMaster) throw new Error(`Missing measured CTA state ${spec.ctaState}`);
    if (cta.mainComponent?.id !== expectedCtaMaster.id) cta.swapComponent(expectedCtaMaster);
    cta.name = `upgrade-cta · State=${spec.ctaState}`;
    cta.setExplicitVariableModeForCollection(ctaPaletteMode.collectionId, ctaPaletteMode.modeId);
    shell.layoutMode = "VERTICAL";
    shell.setExplicitVariableModeForCollection(paletteMode.collectionId, paletteMode.modeId);
    shell.setExplicitVariableModeForCollection(semanticMode.collectionId, semanticMode.modeId);
    shell.primaryAxisSizingMode = shell.counterAxisSizingMode = "FIXED";
    shell.resize(S.root.width, S.root.height);
    shell.primaryAxisAlignItems = "SPACE_BETWEEN";
    shell.counterAxisAlignItems = "CENTER";
    shell.paddingTop = S.root.padding.top;
    shell.paddingRight = S.root.padding.right;
    shell.paddingBottom = S.root.padding.bottom;
    shell.paddingLeft = S.root.padding.left;
    shell.setBoundVariable("paddingTop", V.spacing12);
    shell.setBoundVariable("paddingRight", V.spacing12);
    shell.setBoundVariable("paddingBottom", V.spacing12);
    shell.setBoundVariable("paddingLeft", V.spacing12);
    shell.fills = [];
    shell.description = `Measured ${spec.route} Gnb Auto Layout · ${PLAN.productCommit}`;
    shell.x = 40 + index * (S.root.width + 40);
    shell.y = 40;
  }
  shellSet.resizeWithoutConstraints(S.root.width * S.variants.length + 200, S.root.height + 80);
  if (section.width < 2200 || section.height < 2100) section.resizeWithoutConstraints(2200, 2100);
  return shellSet;
};
const ensurePaymentResult = () => {
  const R = P.paymentResult;
  let resultSection = page.children.find(
    (entry) => entry.type === "SECTION" && entry.name === R.sectionName,
  );
  if (!resultSection) {
    resultSection = figma.createSection();
    resultSection.name = R.sectionName;
    resultSection.x = section.x;
    resultSection.y = section.y + section.height + 182;
    resultSection.resizeWithoutConstraints(1900, 900);
    resultSection.setExplicitVariableModeForCollection(paletteMode.collectionId, paletteMode.modeId);
    resultSection.setExplicitVariableModeForCollection(semanticMode.collectionId, semanticMode.modeId);
    resultSection.fills = [setPaint(V.surfaceInverse, { r: 1, g: 1, b: 1 })];
  }
  let resultSet = resultSection.findOne(
    (entry) => entry.type === "COMPONENT_SET" && entry.name === R.componentSetName,
  );
  const applyDetailLayout = (detail, spec) => {
    detail.layoutMode = spec.direction === "column" ? "VERTICAL" : "HORIZONTAL";
    detail.primaryAxisSizingMode = detail.counterAxisSizingMode = "FIXED";
    detail.resize(spec.rect.width, spec.rect.height);
    detail.primaryAxisAlignItems = "SPACE_BETWEEN";
    detail.counterAxisAlignItems = "CENTER";
    detail.itemSpacing = spec.gap;
    detail.paddingTop = spec.padding.top;
    detail.paddingRight = spec.padding.right;
    detail.paddingBottom = spec.padding.bottom;
    detail.paddingLeft = spec.padding.left;
    detail.setBoundVariable("itemSpacing", V.spacing16);
    detail.setBoundVariable("paddingTop", V.spacing12);
    detail.setBoundVariable("paddingBottom", V.spacing12);
    for (const text of detail.findAllWithCriteria({ types: ["TEXT"] })) {
      text.textAutoResize = "WIDTH_AND_HEIGHT";
    }
  };
  if (resultSet) {
    for (const spec of R.variants.filter((entry) => entry.detail)) {
      const variant = resultSet.children.find(
        (entry) => entry.name === `Outcome=${spec.outcome}, Viewport=${spec.viewport}`,
      );
      const detail = variant?.findOne((entry) => entry.type === "FRAME" && entry.name === "detail/error-code");
      if (!detail) throw new Error(`Missing result detail ${spec.outcome}/${spec.viewport}`);
      applyDetailLayout(detail, spec.detail);
    }
    return resultSet;
  }
  const makeFixedText = (spec, variable, name) => {
    const text = makeText(spec, variable);
    text.name = name;
    text.textAutoResize = "NONE";
    text.resize(spec.rect.width, spec.rect.height);
    text.x = spec.rect.x;
    text.y = spec.rect.y;
    text.textAlignHorizontal = spec.textAlign === "right" ? "RIGHT" : spec.textAlign === "center" ? "CENTER" : "LEFT";
    return text;
  };
  const variants = [];
  for (const spec of R.variants) {
    const component = figma.createComponent();
    component.name = `Outcome=${spec.outcome}, Viewport=${spec.viewport}`;
    component.resize(spec.rect.width, spec.rect.height);
    component.fills = [];
    component.setExplicitVariableModeForCollection(paletteMode.collectionId, paletteMode.modeId);
    component.setExplicitVariableModeForCollection(semanticMode.collectionId, semanticMode.modeId);
    component.appendChild(makeFixedText(spec.title, V.active, "title"));
    component.appendChild(makeFixedText(spec.body, V.textSecondary, "body"));
    if (spec.detail) {
      const detail = figma.createFrame();
      detail.name = "detail/error-code";
      detail.x = spec.detail.rect.x;
      detail.y = spec.detail.rect.y;
      detail.resize(spec.detail.rect.width, spec.detail.rect.height);
      detail.fills = [];
      const term = makeText(spec.detail.term, V.textTertiary);
      term.name = "term";
      const value = makeText(spec.detail.value, V.active);
      value.name = "value";
      detail.appendChild(term);
      detail.appendChild(value);
      applyDetailLayout(detail, spec.detail);
      component.appendChild(detail);
    }
    const action = figma.createFrame();
    action.name = "action/Go to My Page";
    action.x = spec.action.rect.x;
    action.y = spec.action.rect.y;
    action.resize(spec.action.rect.width, spec.action.rect.height);
    action.layoutMode = "HORIZONTAL";
    action.primaryAxisSizingMode = action.counterAxisSizingMode = "FIXED";
    action.primaryAxisAlignItems = action.counterAxisAlignItems = "CENTER";
    action.paddingRight = spec.action.padding.right;
    action.paddingLeft = spec.action.padding.left;
    action.setBoundVariable("paddingRight", V.spacing20);
    action.setBoundVariable("paddingLeft", V.spacing20);
    action.cornerRadius = spec.action.radius;
    bindCorners(action, V.radius12);
    action.fills = [setPaint(V.active)];
    const actionLabel = makeText(spec.action.label, V.surfaceInverse);
    actionLabel.name = "label";
    action.appendChild(actionLabel);
    component.appendChild(action);
    component.description = `Measured ${spec.route} ${spec.viewport} · ${PLAN.productCommit}`;
    resultSection.appendChild(component);
    variants.push(component);
  }
  resultSet = figma.combineAsVariants(variants, resultSection);
  resultSet.name = R.componentSetName;
  resultSet.description = `Measured result content · ${PLAN.productCommit}`;
  resultSet.fills = [];
  const outcomeOrder = new Map([["Failure", 0], ["PlanDelayed", 1], ["TopupDelayed", 2]]);
  for (const variant of resultSet.children) {
    const outcome = variant.name.match(/Outcome=([^,]+)/)?.[1];
    const viewport = variant.name.match(/Viewport=(.+)$/)?.[1];
    variant.x = 40 + (outcomeOrder.get(outcome) ?? 0) * 560;
    variant.y = viewport === "Desktop" ? 40 : 390;
  }
  resultSet.resizeWithoutConstraints(1720, 780);
  resultSet.x = 40;
  resultSet.y = 80;
  return resultSet;
};

const reconcileMenuVariants = (menuSet) => {
  const defaultVariant = menuSet.children.find((entry) => entry.name === "Current=Default");
  if (!defaultVariant) throw new Error("Missing default Gnb menu variant");
  for (const spec of P.variants) {
    if (menuSet.children.some((entry) => entry.name === `Current=${spec.current}`)) continue;
    const clone = defaultVariant.clone();
    clone.name = `Current=${spec.current}`;
    menuSet.appendChild(clone);
  }
  const specByName = new Map(P.variants.map((spec) => [`Current=${spec.current}`, spec]));
  for (const [index, variant] of menuSet.children.entries()) {
    const spec = specByName.get(variant.name);
    if (!spec) throw new Error(`Unexpected Gnb menu variant ${variant.name}`);
    variant.setExplicitVariableModeForCollection(paletteMode.collectionId, paletteMode.modeId);
    variant.setExplicitVariableModeForCollection(semanticMode.collectionId, semanticMode.modeId);
    for (const row of variant.children.filter((entry) => entry.type === "FRAME" && entry.name.startsWith("row/"))) {
      const active = spec.activeRow && row.name === `row/${spec.activeRow}`;
      row.fills = active ? [setPaint(V.activeIndicator)] : [];
      const label = row.findOne((entry) => entry.type === "TEXT" && entry.name === "label");
      const icon = row.findOne((entry) => entry.type === "INSTANCE" && entry.name === "icon");
      if (label) label.fills = [setPaint(active ? V.active : V.inactive)];
      if (icon) {
        bindIconPaints(icon, active ? V.active : V.inactive);
        icon.opacity = active ? (spec.activeIconOpacity ?? 1) : 0.92;
      }
    }
    variant.x = 40 + index * (P.root.width + 40);
    variant.y = 40;
  }
  menuSet.resizeWithoutConstraints(P.root.width * P.variants.length + 160, P.root.height + 80);
};

if (existingSet) {
  reconcileMenuVariants(existingSet);
  const shellSet = ensureShell(existingSet, upgradeSet);
  const resultSet = ensurePaymentResult();
  return {
    componentSetId: existingSet.id,
    variantIds: existingSet.children.map((entry) => entry.id),
    upgradeComponentSetId: upgradeSet.id,
    upgradeVariantIds: upgradeSet.children.map((entry) => entry.id),
    shellComponentSetId: shellSet.id,
    shellVariantIds: shellSet.children.map((entry) => entry.id),
    paymentResultComponentSetId: resultSet.id,
    paymentResultVariantIds: resultSet.children.map((entry) => entry.id),
    alreadyExisted: true,
  };
}

const root = figma.createComponent();
root.name = "Current=Default";
root.layoutMode = "VERTICAL";
root.primaryAxisSizingMode = "FIXED";
root.counterAxisSizingMode = "FIXED";
root.resize(P.root.width, P.root.height);
root.itemSpacing = P.root.gap;
root.setBoundVariable("itemSpacing", V.spacing4);
root.fills = [];
root.setExplicitVariableModeForCollection(paletteMode.collectionId, paletteMode.modeId);
root.setExplicitVariableModeForCollection(semanticMode.collectionId, semanticMode.modeId);

for (const spec of P.rows) {
  if (spec.kind === "section-label") {
    const row = figma.createFrame();
    row.name = `section/${spec.label.text}`;
    row.layoutMode = "HORIZONTAL";
    row.primaryAxisSizingMode = row.counterAxisSizingMode = "FIXED";
    row.resize(spec.rect.width, spec.rect.height);
    row.counterAxisAlignItems = "CENTER";
    row.paddingTop = spec.padding.top;
    row.paddingRight = spec.padding.right;
    row.paddingBottom = spec.padding.bottom;
    row.paddingLeft = spec.padding.left;
    row.setBoundVariable("paddingTop", V.spacing12);
    row.setBoundVariable("paddingBottom", V.spacing4);
    row.setBoundVariable("paddingLeft", V.spacing4);
    row.fills = [];
    row.appendChild(makeText(spec.label, V.muted));
    root.appendChild(row);
    continue;
  }
  const gap = spec.kind === "compound" ? spec.gap : spec.label.rect.x - spec.icon.rect.x - spec.icon.rect.width;
  const row = figma.createFrame();
  row.name = `row/${spec.label.text}`;
  applyMeasuredFrame(row, spec, gap);
  if (spec.kind === "compound") {
    const main = figma.createFrame();
    main.name = "main-action";
    main.layoutMode = "HORIZONTAL";
    main.primaryAxisSizingMode = main.counterAxisSizingMode = "FIXED";
    main.resize(spec.mainRect.width, spec.mainRect.height);
    main.counterAxisAlignItems = "CENTER";
    main.itemSpacing = spec.label.rect.x - spec.icon.rect.x - spec.icon.rect.width;
    main.setBoundVariable("itemSpacing", V.spacing10);
    main.fills = [];
    main.appendChild(makeIcon(spec.icon, V.inactive));
    main.appendChild(makeText(spec.label, V.inactive));
    const add = figma.createFrame();
    add.name = `add-action · ${spec.ariaLabel}`;
    add.layoutMode = "HORIZONTAL";
    add.primaryAxisSizingMode = add.counterAxisSizingMode = "FIXED";
    add.resize(spec.addRect.width, spec.addRect.height);
    add.primaryAxisAlignItems = add.counterAxisAlignItems = "CENTER";
    add.cornerRadius = spec.addRadius;
    bindCorners(add, V.radius6);
    add.fills = [setPaint(V.createButtonBackground, { r: 1, g: 1, b: 1 })];
    const plus = componentByName.get(P.iconComponents.plus).createInstance();
    plus.name = "icon/plus";
    plus.resize(20, 20);
    plus.fills = [];
    bindIconPaints(plus, V.inactive);
    add.appendChild(plus);
    row.appendChild(main);
    row.appendChild(add);
  } else {
    row.appendChild(makeIcon(spec.icon, V.inactive));
    row.appendChild(makeText(spec.label, V.inactive));
    if (spec.kind === "highlight") {
      const spacer = figma.createFrame();
      spacer.name = "spacer";
      spacer.resize(1, 1);
      spacer.fills = [];
      spacer.layoutGrow = 1;
      row.appendChild(spacer);
      const badge = figma.createFrame();
      badge.name = "badge/BETA";
      badge.layoutMode = "HORIZONTAL";
      badge.primaryAxisSizingMode = "FIXED";
      badge.counterAxisSizingMode = "FIXED";
      badge.resize(spec.beta.rect.width, spec.beta.rect.height);
      badge.primaryAxisAlignItems = badge.counterAxisAlignItems = "CENTER";
      badge.paddingLeft = spec.beta.padding.left;
      badge.paddingRight = spec.beta.padding.right;
      badge.setBoundVariable("paddingLeft", V.spacing8);
      badge.setBoundVariable("paddingRight", V.spacing8);
      badge.cornerRadius = spec.beta.radius;
      bindCorners(badge, V.radius6);
      badge.fills = [setPaint(V.betaBackground, { r: 1, g: 1, b: 1 })];
      badge.appendChild(makeText(spec.beta.label, V.muted));
      row.appendChild(badge);
    }
  }
  root.appendChild(row);
}
root.description = `Measured · ${PLAN.productCommit} · ${PLAN.sourceCandidate.id}`;
section.appendChild(root);

const activate = (variant, variantSpec) => {
  const row = variant.findOne((entry) => entry.name === `row/${variantSpec.activeRow}`);
  const text = row?.findOne((entry) => entry.type === "TEXT" && entry.name === "label");
  const icon = row?.findOne((entry) => entry.type === "INSTANCE" && entry.name === "icon");
  if (!row || !text || !icon) throw new Error(`Cannot activate ${variantSpec.activeRow}`);
  text.fills = [setPaint(V.active)];
  bindIconPaints(icon, V.active);
  icon.opacity = variantSpec.activeIconOpacity;
};
const variants = [root];
for (const spec of P.variants.slice(1)) {
  const clone = root.clone();
  clone.name = `Current=${spec.current}`;
  activate(clone, spec);
  variants.push(clone);
}
const componentSet = figma.combineAsVariants(variants, section);
componentSet.name = P.componentSetName;
componentSet.description = `Measured composite · ${PLAN.productCommit} · ${PLAN.sourceCandidate.id}`;
componentSet.fills = [];
for (const [index, variant] of componentSet.children.entries()) {
  variant.x = 40 + index * (P.root.width + 40);
  variant.y = 40;
}
componentSet.resizeWithoutConstraints(P.root.width * P.variants.length + 160, P.root.height + 80);
componentSet.x = 720;
componentSet.y = 270;
reconcileMenuVariants(componentSet);
const shellSet = ensureShell(componentSet, upgradeSet);
const resultSet = ensurePaymentResult();
return {
  sectionId: section.id,
  docFrameId: docs.id,
  componentSetId: componentSet.id,
  variantIds: componentSet.children.map((entry) => entry.id),
  upgradeComponentSetId: upgradeSet.id,
  upgradeVariantIds: upgradeSet.children.map((entry) => entry.id),
  shellComponentSetId: shellSet.id,
  shellVariantIds: shellSet.children.map((entry) => entry.id),
  paymentResultComponentSetId: resultSet.id,
  paymentResultVariantIds: resultSet.children.map((entry) => entry.id),
  alreadyExisted: false,
};
