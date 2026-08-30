const page = (await figma.getNodeByIdAsync(PLAN.pageId)) ?? figma.root.children.find((entry) => entry.name === PLAN.pageName);
if (!page) throw new Error(`Missing target page ${PLAN.pageName}`);
await figma.setCurrentPageAsync(page);

const collections = await figma.variables.getLocalVariableCollectionsAsync();
const collectionById = new Map(collections.map((entry) => [entry.id, entry]));
const collectionByName = new Map(collections.map((entry) => [entry.name, entry]));
const variables = await figma.variables.getLocalVariablesAsync();
const variableByKey = new Map(variables.map((entry) => [`${collectionById.get(entry.variableCollectionId)?.name}\u0000${entry.name}`, entry]));
const getVariable = (binding) => {
  const variable = variableByKey.get(`${binding.collection}\u0000${binding.name}`);
  if (!variable) throw new Error(`Missing variable ${binding.collection}/${binding.name}`);
  return variable;
};
const mode = (collectionName, modeName) => {
  const collection = collectionByName.get(collectionName);
  const value = collection?.modes.find((entry) => entry.name === modeName);
  if (!collection || !value) throw new Error(`Missing mode ${collectionName}/${modeName}`);
  return { collectionId: collection.id, modeId: value.modeId };
};
const B = PLAN.bindings;
const V = Object.fromEntries(Object.entries(B).filter(([, value]) => value && typeof value === "object" && "collection" in value).map(([key, value]) => [key, getVariable(value)]));
const modes = [mode(B.paletteCollection, B.paletteMode), mode(B.semanticCollection, B.semanticMode), mode(B.primitiveCollection, B.primitiveMode)];
const setModes = (node) => modes.forEach((entry) => node.setExplicitVariableModeForCollection(entry.collectionId, entry.modeId));
const boundPaint = (key) => {
  if (!key) return null;
  if (key === "$brandBlueFixed") return { type: "SOLID", color: { r: 0, g: 122 / 255, b: 1 } };
  const variable = V[key];
  if (!variable) throw new Error(`Missing color binding ${key}`);
  return figma.variables.setBoundVariableForPaint({ type: "SOLID", color: { r: 0, g: 0, b: 0 } }, "color", variable);
};
const rgba = (value) => {
  const match = /^rgba?\(\s*([\d.]+)[,\s]+([\d.]+)[,\s]+([\d.]+)(?:[,/\s]+([\d.]+))?\s*\)$/.exec(value ?? "");
  if (!match) throw new Error(`Unsupported color ${value}`);
  return { r: Number(match[1]) / 255, g: Number(match[2]) / 255, b: Number(match[3]) / 255, a: match[4] === undefined ? 1 : Number(match[4]) };
};
const effects = (specs) => specs.map((entry) => ({
  type: entry.type,
  color: rgba(entry.color),
  offset: { x: entry.x, y: entry.y },
  radius: entry.blur,
  spread: entry.spread,
  visible: true,
  blendMode: "NORMAL",
}));
const applyCorners = (node, values) => {
  [node.topLeftRadius, node.topRightRadius, node.bottomRightRadius, node.bottomLeftRadius] = values;
};
const addBorders = (parent, borders, width, height, prefix = "border") => {
  const [top, right, bottom, left] = borders;
  const add = (side, spec, x, y, w, h) => {
    if (!spec.width) return;
    const line = figma.createRectangle();
    line.name = `${prefix}/${side}`;
    line.x = x; line.y = y; line.resize(w, h);
    line.fills = [boundPaint(spec.color)];
    parent.appendChild(line);
  };
  add("top", top, 0, 0, width, top.width);
  add("right", right, width - right.width, 0, right.width, height);
  add("bottom", bottom, 0, height - bottom.width, width, bottom.width);
  add("left", left, 0, 0, left.width, height);
};
const makeShape = (spec) => {
  const frame = figma.createFrame();
  frame.name = `shape/${spec.name}`;
  frame.x = spec.rect.x; frame.y = spec.rect.y;
  frame.resize(spec.rect.width, spec.rect.height);
  frame.layoutMode = "NONE";
  frame.clipsContent = false;
  frame.fills = spec.fill ? [boundPaint(spec.fill)] : [];
  applyCorners(frame, spec.corners);
  frame.effects = effects(spec.effects);
  addBorders(frame, spec.borders, spec.rect.width, spec.rect.height);
  return frame;
};
await Promise.all([
  figma.loadFontAsync({ family: "Pretendard", style: "Regular" }),
  figma.loadFontAsync({ family: "Pretendard", style: "Medium" }),
  figma.loadFontAsync({ family: "Pretendard", style: "SemiBold" }),
]);
const fontStyle = { 400: "Regular", 500: "Medium", 600: "SemiBold" };
const makeText = (spec) => {
  const node = figma.createText();
  node.name = `text/${spec.name} · ${spec.text}`;
  node.fontName = { family: "Pretendard", style: fontStyle[spec.fontWeight] ?? "Regular" };
  node.fontSize = spec.fontSize;
  node.lineHeight = { unit: "PIXELS", value: spec.lineHeight };
  node.letterSpacing = { unit: "PIXELS", value: spec.letterSpacing };
  node.characters = spec.text;
  node.textAutoResize = "NONE";
  node.resize(spec.rect.width, spec.rect.height);
  node.x = spec.rect.x; node.y = spec.rect.y;
  node.textAlignHorizontal = spec.align;
  node.fills = [boundPaint(spec.color)];
  return node;
};
const svgByKind = {
  globe: '<svg viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke="#171B22" stroke-width="1.5"/><path d="M3 12h18" stroke="#171B22" stroke-width="1.5" stroke-linecap="round"/><ellipse cx="12" cy="12" rx="3.5" ry="9" stroke="#171B22" stroke-width="1.5"/></svg>',
  bolt: '<svg viewBox="0 0 256 256"><path d="M213.85,125.46l-112,120a8,8,0,0,1-13.69-7l14.66-73.33L45.19,143.49a8,8,0,0,1-3-13l112-120a8,8,0,0,1,13.69,7L153.18,90.9l57.63,21.61a8,8,0,0,1,3,12.95Z" fill="#9AA0AB"/></svg>',
  tableCheck: '<svg viewBox="0 0 24 24" fill="none"><path d="M5 12.5L10 17.5L19 7" stroke="#9AA0AB" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  instagram: '<svg viewBox="0 0 256 256"><path d="M176,32H80A48.05,48.05,0,0,0,32,80v96a48.05,48.05,0,0,0,48,48h96a48.05,48.05,0,0,0,48-48V80A48.05,48.05,0,0,0,176,32ZM128,168a40,40,0,1,1,40-40A40,40,0,0,1,128,168Zm56-96a12,12,0,1,1,12-12A12,12,0,0,1,184,72Zm-32,56a24,24,0,1,1-24-24A24,24,0,0,1,152,128Z" fill="#9AA0AB"/></svg>',
  youtube: '<svg viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.546 15.568V8.432L15.818 12l-6.272 3.568z" fill="#9AA0AB"/></svg>',
};
const dependency = async (id, label) => {
  const node = await figma.getNodeByIdAsync(id);
  if (!node || node.type !== "COMPONENT") throw new Error(`Missing dependency ${label} ${id}`);
  return node;
};
const featureCheck = await dependency(PLAN.dependencies.featureCheckId, "feature check");
const headerLogo = await dependency(PLAN.dependencies.headerLogoId, "header logo");
const footerLogo = await dependency(PLAN.dependencies.footerLogoId, "footer logo");
const iconColor = { globe: "gray900", bolt: "gray500", tableCheck: "gray500", instagram: "gray500", youtube: "gray500", footerLogo: "gray000", featureCheck: "mint500" };
const bindIconPaints = (node, key) => {
  const variable = V[key];
  if (!variable) throw new Error(`Missing icon variable ${key}`);
  const paintableTypes = new Set(["VECTOR", "BOOLEAN_OPERATION", "ELLIPSE", "LINE", "POLYGON", "STAR"]);
  const insideClipDefinition = (child) => {
    let current = child.parent;
    while (current && current !== node) {
      if (/^clip\d*_/i.test(current.name)) return true;
      current = current.parent;
    }
    return false;
  };
  const nodes = "findAll" in node ? node.findAll((child) => paintableTypes.has(child.type) && !insideClipDefinition(child)) : [];
  for (const child of nodes) {
    if ("fills" in child && Array.isArray(child.fills)) child.fills = child.fills.map((paint) => paint.type === "SOLID" ? figma.variables.setBoundVariableForPaint({ ...paint }, "color", variable) : paint);
    if ("strokes" in child && Array.isArray(child.strokes)) child.strokes = child.strokes.map((paint) => paint.type === "SOLID" ? figma.variables.setBoundVariableForPaint({ ...paint }, "color", variable) : paint);
  }
};
const makeIcon = (spec) => {
  let node;
  if (spec.kind === "featureCheck") node = featureCheck.createInstance();
  else if (spec.kind === "headerLogo") node = headerLogo.createInstance();
  else if (spec.kind === "footerLogo") node = footerLogo.createInstance();
  else node = figma.createNodeFromSvg(svgByKind[spec.kind] ?? (() => { throw new Error(`Missing SVG ${spec.kind}`); })());
  node.name = `icon/${spec.kind} · ${spec.name}`;
  node.resize(spec.rect.width, spec.rect.height);
  node.x = spec.rect.x; node.y = spec.rect.y;
  if (spec.kind !== "headerLogo") bindIconPaints(node, iconColor[spec.kind]);
  return node;
};
const buildComponent = (spec, section) => {
  const component = figma.createComponent();
  component.name = spec.variantName;
  component.resize(spec.rect.width, spec.rect.height);
  component.layoutMode = "NONE";
  component.clipsContent = spec.setName.includes("Navigation");
  component.fills = spec.root.fill ? [boundPaint(spec.root.fill)] : [];
  applyCorners(component, spec.root.corners);
  component.effects = effects(spec.root.effects);
  setModes(component);
  for (const shape of spec.shapes) component.appendChild(makeShape(shape));
  addBorders(component, spec.root.borders, spec.rect.width, spec.rect.height, "root-border");
  for (const text of spec.texts) component.appendChild(makeText(text));
  for (const icon of spec.icons) component.appendChild(makeIcon(icon));
  component.description = `${spec.setName} · measured ${spec.viewport} ${spec.sourcePath} · ${PLAN.productCommit}`;
  section.appendChild(component);
  return component;
};
let section = page.children.find((entry) => entry.type === "SECTION" && entry.name === PLAN.sectionName);
if (!section) {
  section = figma.createSection();
  section.name = PLAN.sectionName;
  section.x = Math.max(0, ...page.children.map((entry) => entry.x + entry.width)) + 182;
  section.y = 0;
  section.resizeWithoutConstraints(12000, 16000);
}
if (section.width < 12000 || section.height < 16000) section.resizeWithoutConstraints(12000, 16000);
setModes(section);
section.fills = [boundPaint("gray100")];

const setsByName = new Map(page.findAllWithCriteria({ types: ["COMPONENT_SET"] }).map((entry) => [entry.name, entry]));
if (PLAN.phase === "components") {
  const grouped = new Map();
  for (const spec of PLAN.groups) {
    const values = grouped.get(spec.setName) ?? [];
    values.push(spec); grouped.set(spec.setName, values);
  }
  let row = section.findAllWithCriteria({ types: ["COMPONENT_SET"] }).length;
  const result = [];
  for (const [setName, specs] of grouped) {
    let set = setsByName.get(setName);
    if (set) {
      const actual = new Set(set.children.map((entry) => entry.name));
      for (const spec of specs.filter((entry) => !actual.has(entry.variantName))) {
        const component = buildComponent(spec, section);
        set.appendChild(component);
      }
    } else {
      const components = specs.map((spec) => buildComponent(spec, section));
      set = figma.combineAsVariants(components, section);
      set.name = setName;
      set.description = `Measured /pricing component set · ${PLAN.productCommit} · product-only`;
      set.x = 80 + (row % 2) * 5400;
      set.y = 240 + Math.floor(row / 2) * 3000;
      setsByName.set(setName, set);
    }
    result.push({ name: setName, id: set.id, variants: set.children.length });
    row += 1;
  }
  return { phase: PLAN.phase, section: { id: section.id, name: section.name }, sets: result };
}

if (PLAN.phase !== "scenes") throw new Error(`Unknown phase ${PLAN.phase}`);
let sceneSet = setsByName.get(PLAN.sceneSetName);
if (!sceneSet) {
  const sceneComponents = [];
  for (const spec of PLAN.scenes) {
    const scene = figma.createComponent();
    scene.name = `Viewport=${spec.viewport}`;
    scene.resize(spec.width, spec.height);
    scene.layoutMode = "NONE";
    scene.clipsContent = true;
    scene.fills = [boundPaint(spec.fill)];
    setModes(scene);
    for (const placement of spec.placements) {
      const set = setsByName.get(placement.setName);
      const master = set?.children.find((entry) => entry.name === placement.variantName);
      if (!master || master.type !== "COMPONENT") throw new Error(`Missing placement ${placement.setName}/${placement.variantName}`);
      const instance = master.createInstance();
      instance.name = `${placement.setName} · ${placement.variantName}`;
      instance.x = placement.x; instance.y = placement.y;
      instance.resize(placement.width, placement.height);
      scene.appendChild(instance);
    }
    for (const text of spec.directTexts) scene.appendChild(makeText(text));
    scene.description = `Full measured /pricing ${spec.viewport} page · ${PLAN.productCommit} · ${spec.width}×${spec.height}`;
    section.appendChild(scene);
    sceneComponents.push(scene);
  }
  sceneSet = figma.combineAsVariants(sceneComponents, section);
  sceneSet.name = PLAN.sceneSetName;
  sceneSet.description = `Measured full-page /pricing scenes · ${PLAN.productCommit} · product-only`;
  sceneSet.x = 80;
  sceneSet.y = 10500;
}
const generated = [sceneSet, ...sceneSet.children];
let solids = 0, bound = 0, allowedBrand = 0, unbound = [];
for (const root of generated) {
  const nodes = [root, ...root.findAll(() => true)];
  for (const node of nodes) {
    for (const field of ["fills", "strokes"]) {
      if (!(field in node) || !Array.isArray(node[field])) continue;
      for (const paint of node[field]) {
        if (paint.type !== "SOLID" || paint.visible === false) continue;
        solids += 1;
        if (paint.boundVariables?.color) bound += 1;
        else if (Math.round(paint.color.r * 255) === 0 && Math.round(paint.color.g * 255) === 122 && Math.round(paint.color.b * 255) === 255) allowedBrand += 1;
        else if (node.type !== "INSTANCE" && node.parent?.type !== "INSTANCE") unbound.push(`${node.id}:${field}`);
      }
    }
  }
}
return {
  phase: PLAN.phase,
  section: { id: section.id, name: section.name },
  sceneSet: { id: sceneSet.id, variants: sceneSet.children.map((entry) => ({ id: entry.id, name: entry.name, width: entry.width, height: entry.height })) },
  paintAudit: { solids, bound, allowedBrand, unbound: [...new Set(unbound)].slice(0, 100) },
};
