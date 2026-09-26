// 제품 인라인 SVG 글리프 세트 러너 — build-figma-product-glyphs.mjs 가 `P`(계획의 러너 몫) 뒤에 붙여 draw.js 로 만든다.
//   · 90 ASSETS 의 섹션 하나(P.sectionName)에 세트를 세운다. 세트가 이미 있으면 variant 안의 도형만 갈아 끼운다 —
//     세트 · variant 노드 id 가 그대로라 인스턴스가 끊기지 않는다. 계획에 없는 variant 가 세트에 있으면 던진다.
//   · 칠은 잉크 변수(P.ink) 하나에 묶는다. 계획의 SVG 는 제품의 currentColor 를 검정으로 싣는다.
const page = await figma.getNodeByIdAsync(P.page);
if (!page || page.type !== "PAGE") throw new Error("자산 페이지를 찾지 못했습니다: " + P.page);
await figma.setCurrentPageAsync(page);

const collections = await figma.variables.getLocalVariableCollectionsAsync();
const inkCollection = collections.find((c) => c.name === P.ink.collection);
if (!inkCollection) throw new Error("잉크 컬렉션이 없습니다: " + P.ink.collection);
const colorVariables = await figma.variables.getLocalVariablesAsync("COLOR");
const ink = colorVariables.find((v) => v.variableCollectionId === inkCollection.id && v.name === P.ink.name);
if (!ink) throw new Error("잉크 변수가 없습니다: " + P.ink.name);
const variableById = new Map(colorVariables.map((v) => [v.id, v]));
const resolveColor = (variable, depth) => {
  const collection = collections.find((c) => c.id === variable.variableCollectionId);
  const value = variable.valuesByMode[collection.defaultModeId];
  if (value && value.type === "VARIABLE_ALIAS") {
    if (depth > 8) throw new Error("잉크 별칭이 너무 깊습니다");
    const target = variableById.get(value.id);
    if (!target) throw new Error("잉크 별칭 대상이 없습니다");
    return resolveColor(target, depth + 1);
  }
  return value;
};
const inkValue = resolveColor(ink, 0);
// 그라디언트 정지점 변수 — 계획이 정지점 순서대로 컬렉션 · 이름을 싣는다.
const variableByKey = (binding) => {
  const collection = collections.find((c) => c.name === binding.collection);
  const variable = collection && colorVariables.find((v) => v.variableCollectionId === collection.id && v.name === binding.name);
  if (!variable) throw new Error("정지점 변수가 없습니다: " + binding.collection + "/" + binding.name);
  return variable;
};
const inkPaint = (opacity) => figma.variables.setBoundVariableForPaint(
  { type: "SOLID", color: { r: inkValue.r, g: inkValue.g, b: inkValue.b }, opacity, visible: true, blendMode: "NORMAL" },
  "color", ink,
);

let section = page.children.find((n) => n.type === "SECTION" && n.name === P.sectionName);
if (!section) {
  section = figma.createSection();
  page.appendChild(section);
  section.name = P.sectionName;
  const others = page.children.filter((n) => n !== section);
  const bottom = others.length ? Math.max(...others.map((n) => n.y + n.height)) : 0;
  section.x = 0;
  section.y = Math.ceil((bottom + 800) / 100) * 100;
  section.resizeWithoutConstraints(2000, 1000);
}

// SVG 를 풀어 도형을 target(컴포넌트) 안으로 옮기고 칠을 잉크에 묶는다.
const fillFromSvg = (target, variant) => {
  for (const child of [...target.children]) child.remove();
  const imported = figma.createNodeFromSvg(variant.svg);
  if (Math.round(imported.width) !== variant.size[0] || Math.round(imported.height) !== variant.size[1]) {
    const got = [imported.width, imported.height];
    imported.remove();
    throw new Error("SVG 크기가 계획과 다릅니다: " + variant.name + " " + got.join("×"));
  }
  for (const child of [...imported.children]) target.appendChild(child);
  imported.remove();
  target.resizeWithoutConstraints(variant.size[0], variant.size[1]);
  target.fills = [];
  target.clipsContent = false;
  let bound = 0;
  for (const node of target.findAll(() => true)) {
    for (const key of ["fills", "strokes"]) {
      if (!(key in node) || node[key] === figma.mixed) continue;
      const paints = node[key];
      if (!paints.length) continue;
      node[key] = paints.map((paint) => {
        if (paint.type === "SOLID") {
          bound += 1;
          return inkPaint(paint.opacity === undefined ? 1 : paint.opacity);
        }
        if (paint.type === "GRADIENT_LINEAR" || paint.type === "GRADIENT_RADIAL") {
          if (!variant.stops || variant.stops.length !== paint.gradientStops.length) throw new Error("그라디언트 정지점 수가 계획과 다릅니다: " + variant.name);
          bound += paint.gradientStops.length;
          return {
            type: paint.type,
            gradientTransform: paint.gradientTransform,
            opacity: paint.opacity === undefined ? 1 : paint.opacity,
            visible: true,
            blendMode: paint.blendMode || "NORMAL",
            gradientStops: paint.gradientStops.map((stop, index) => {
              const variable = variableByKey(variant.stops[index]);
              const value = resolveColor(variable, 0);
              return { position: stop.position, color: { r: value.r, g: value.g, b: value.b, a: stop.color.a }, boundVariables: { color: figma.variables.createVariableAlias(variable) } };
            }),
          };
        }
        throw new Error("옮기지 않는 칠입니다(" + paint.type + "): " + variant.name);
      });
    }
  }
  if (bound === 0) throw new Error("칠이 하나도 없습니다(잉크 없는 마스터 — 조립 규칙 21조): " + variant.name);
  return bound;
};

const result = [];
let cursorY = 160;
let maxWidth = 0;
for (const set of P.sets) {
  let node = section.children.find((n) => n.type === "COMPONENT_SET" && n.name === set.setName);
  const variantIds = [];
  let bound = 0;
  if (node) {
    const wanted = new Set(set.variants.map((v) => v.name));
    const extra = node.children.filter((c) => !wanted.has(c.name)).map((c) => c.name);
    if (extra.length) throw new Error("계획에 없는 variant 가 세트에 있습니다: " + set.setName + " · " + extra.join(", "));
    for (const variant of set.variants) {
      let component = node.children.find((c) => c.name === variant.name);
      if (!component) { component = figma.createComponent(); node.appendChild(component); component.name = variant.name; }
      bound += fillFromSvg(component, variant);
      component.description = variant.description;
      variantIds.push(component.id);
    }
  } else {
    const components = set.variants.map((variant) => {
      const component = figma.createComponent();
      section.appendChild(component);
      component.name = variant.name;
      bound += fillFromSvg(component, variant);
      component.description = variant.description;
      return component;
    });
    node = figma.combineAsVariants(components, section);
    node.name = set.setName;
    for (const component of components) variantIds.push(component.id);
  }
  node.description = set.description;
  node.layoutMode = "HORIZONTAL";
  node.layoutWrap = "WRAP";
  node.primaryAxisSizingMode = "FIXED";
  node.counterAxisSizingMode = "AUTO";
  node.itemSpacing = 24;
  node.counterAxisSpacing = 24;
  node.paddingTop = node.paddingBottom = node.paddingLeft = node.paddingRight = 24;
  node.resize(Math.min(1600, 48 + set.variants.reduce((sum, v) => sum + v.size[0] + 24, 0)), node.height);
  node.x = 160;
  node.y = cursorY;
  cursorY += Math.ceil(node.height) + 120;
  maxWidth = Math.max(maxWidth, node.width);
  result.push({ set: set.setName, id: node.id, variants: variantIds.length, variantIds, bound });
}
section.resizeWithoutConstraints(Math.max(2000, Math.ceil(maxWidth + 320)), cursorY + 40);
return { section: section.id, sets: result };
