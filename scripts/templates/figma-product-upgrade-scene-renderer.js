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
// 실측 색 → 로컬 Figma 변수. **없으면 던지지 않고 실측 고정 페인트로 떨어진다.**
// 이 계획이 이미 아웃라인에 대해 쓰는 정책과 같다("No exact local Figma color variable
// exists, so this remains a measured product-only fixed paint"). 던지게 두면 제품이 색을
// 하나 바꿀 때마다 러너 전체가 Figma 안에서 죽고, 그걸 피하려면 존재하는지 확인도 못 한
// 변수 이름을 지어내야 한다 — 둘 다 이 저장소의 규칙(값을 지어내지 않는다)에 어긋난다.
// 여기 적힌 이름들은 형제 계획(product-checkout-status · product-payment-scenes ·
// product-components)이 같은 컬렉션에서 이미 쓰고 있는 것만 남긴다.
const colorPaint = (rgba) => {
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
    "227,228,232,1": V.gray200,
    "241,241,243,1": V.gray100,
    "248,248,249,1": V.surface,
    "250,250,250,1": V.cardSurface,
  };
  const variable = byColor[key];
  if (variable) return setPaint(variable);
  return { type: "SOLID", color: { r: rgba[0], g: rgba[1], b: rgba[2] }, opacity: rgba[3] };
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
}
setModes(section);
section.fills = [setPaint(V.appBackground)];
const gutter = 40;

let docs = section.findOne((entry) => entry.name === `${C.cardSetName} / Documentation`);
if (!docs) {
  docs = figma.createFrame();
  docs.name = `${C.cardSetName} / Documentation`;
  docs.x = gutter;
  docs.y = gutter;
  docs.layoutMode = "VERTICAL";
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
  note.characters = C.cardSetName;
  note.fills = [setPaint(V.gray600)];
  docs.appendChild(note);
  section.appendChild(docs);
}
const docTexts = docs.children.filter((entry) => entry.type === "TEXT");
if (docTexts.length !== 2) throw new Error(`Expected two documentation text nodes, got ${docTexts.length}`);
docTexts[0].characters = C.cardSetName;
docTexts[1].characters = `${PLAN.productCommit.slice(0, 8)} · ${C.cards.length} desktop cards + ${M.cards.length} viewport-observed mobile slices as Auto Layout · checkout redirect parity · product-only`;

// ── reconcile 공통 ───────────────────────────────────────────────────────
// **세트 · 메인 표면 · 장면을 매 실행 제자리에서 reconcile 한다(2026-09-14, 크기 굳힘 감사 묶음 3).** 옛 러너는 카드 세트가
// 없을 때만 지었고(글자 · 아이콘 · 버튼을 측정 x/y 에 박았다), 메인 표면 · 장면은 제품 커밋이 바뀌면 **지우고 다시 만들었다**
// — 그때마다 인스턴스 override 가 풀렸다. 이제 아무것도 지우지 않는다. 계획에 없는 노드는 숨겨 `retired/` 로 이름만 바꾸고,
// 옛 러너가 지은 노드(`text/<n> · …` · `feature-check/<n>` · `action/…`)는 같은 id 로 새 자리에 옮긴다.
const newFrame = (name) => {
  const frame = figma.createFrame();
  frame.name = name;
  frame.fills = [];
  return frame;
};
const newText = (name) => {
  const text = figma.createText();
  text.name = name;
  text.fontName = { family: "Pretendard", style: "Regular" };
  return text;
};
const insertAt = (parent, node, index) => {
  if (node.parent !== parent || parent.children.indexOf(node) !== index) parent.insertChild(index, node);
  node.visible = true;
  return node;
};
const retireOthers = (parent, keep) => {
  for (const child of parent.children) {
    if (keep.includes(child)) continue;
    if (!child.name.startsWith("retired/")) child.name = `retired/${child.name}`;
    child.visible = false;
  }
};
const bindSpacing = (node, field, value) => {
  node[field] = value;
  node.setBoundVariable(field, value && V[`spacing${value}`] ? V[`spacing${value}`] : null);
};
const bindPadding = (node, padding) => {
  for (const side of ["Top", "Right", "Bottom", "Left"]) bindSpacing(node, `padding${side}`, padding[side.toLowerCase()] ?? 0);
};
const flow = (frame, mode, { padding = {}, gap = 0, counter = "MIN", primary = "MIN" } = {}) => {
  frame.layoutMode = mode;
  frame.layoutWrap = "NO_WRAP";
  frame.primaryAxisAlignItems = primary;
  frame.counterAxisAlignItems = counter;
  bindPadding(frame, padding);
  bindSpacing(frame, "itemSpacing", gap);
};
const plain = (frame) => {
  frame.fills = [];
  frame.strokes = [];
  frame.effects = [];
  frame.clipsContent = false;
};
// 러너 계획은 글자 스타일을 표(`C.typeStyles`)로 모아 번호(`s`)만 싣는다 — 여기서 펼친다.
const expandText = (spec) => (spec && spec.s !== undefined ? { ...C.typeStyles[spec.s], ...spec } : spec);
const styleText = (text, raw, alignOverride) => {
  const spec = expandText(raw);
  const align = alignOverride ?? spec.textAlign;
  text.fontName = { family: "Pretendard", style: weightStyle[spec.fontWeight] ?? "Regular" };
  text.fontSize = spec.fontSize;
  text.lineHeight = { unit: "PIXELS", value: spec.lineHeight };
  text.letterSpacing = { unit: "PIXELS", value: spec.letterSpacing };
  if (text.characters !== spec.text) text.characters = spec.text;
  text.textAlignHorizontal = align === "center" ? "CENTER" : align === "right" ? "RIGHT" : "LEFT";
  text.textAlignVertical = "TOP";
  text.fills = [colorPaint(spec.color)];
};
// 글자 크기 축: FILL(부모 폭, 높이 자동) · HUG(자기 폭) · FIXED(`flex-shrink` 로 감긴 글자 — 측정 상자 폭, 높이 자동).
const sizeText = (text, spec) => {
  if (spec.sizing === "FILL") {
    text.layoutSizingHorizontal = "FILL";
    text.textAutoResize = "HEIGHT";
  } else if (spec.sizing === "FIXED") {
    text.resize(spec.box, text.height);
    text.textAutoResize = "HEIGHT";
  } else {
    text.textAutoResize = "WIDTH_AND_HEIGHT";
  }
  if (spec.maxWidth) text.maxWidth = spec.maxWidth;
};
const hasPadding = (padding) => Boolean(padding && (padding.top || padding.right || padding.bottom || padding.left));

// ── 요금제 카드 ─────────────────────────────────────────────────────────
// 카드 = 세로 Auto Layout(패딩은 계산값). 구획 묶음 `content` 와 버튼을 양끝 정렬해 버튼을 아래에 붙인다(`mt-auto`). 높이는
// HUG + 최소 높이(`min-h-[560px]`)라 짧은 카드도 560 까지 늘고 그 여유가 구획과 버튼 사이로 간다. 폭은 마스터 기본값만 측정
// 카드 폭이고 소비처(덱의 1fr 칸)가 FILL 로 늘린다. 보이는 조각(모바일)은 관측되지 않은 내용이 높이를 정했으므로 높이만
// 측정 상자로 고정하고 자른다(계획의 `evidenceBoundary`).
const reconcileCard = (card, spec, { slice }) => {
  const legacyTexts = card.children.filter((entry) => entry.type === "TEXT" && /^text\/\d+ · /.test(entry.name));
  const legacyIcons = card.children.filter((entry) => entry.type === "INSTANCE" && /^feature-check\/\d+$/.test(entry.name));
  const claimText = (scope, name) => scope.findOne((entry) => entry.type === "TEXT" && entry.name === name) ?? legacyTexts.shift() ?? newText(name);
  let iconIndex = 0;
  const claimIcon = (name) => {
    const found = card.findOne((entry) => entry.type === "INSTANCE" && entry.name === name) ?? legacyIcons.shift();
    iconIndex += 1;
    if (found) return found;
    const icon = checkMaster.createInstance();
    icon.name = name;
    return icon;
  };
  const claimFrame = (name) => card.findOne((entry) => entry.type === "FRAME" && entry.name === name) ?? newFrame(name);

  flow(card, "VERTICAL", { padding: spec.padding, primary: spec.action ? "SPACE_BETWEEN" : "MIN" });
  card.resize(card.width, slice ? spec.rect.height : card.height);
  card.counterAxisSizingMode = "FIXED";
  card.primaryAxisSizingMode = slice ? "FIXED" : "AUTO";
  card.minHeight = spec.minHeight || null;
  card.cornerRadius = spec.radius;
  bindCorners(card, V.radius12);
  card.fills = [setPaint(V.cardSurface)];
  card.effects = makeEffects(spec.effects);
  applyMeasuredOutline(card, spec);
  card.clipsContent = true;
  setModes(card);

  const content = insertAt(card, claimFrame("content"), 0);
  plain(content);
  flow(content, "VERTICAL");
  content.layoutSizingHorizontal = "FILL";
  content.layoutSizingVertical = "HUG";
  const sectionNodes = spec.sections.map((sectionSpec, sectionIndex) => {
    const key = sectionSpec.kind;
    const frame = insertAt(content, claimFrame(key), sectionIndex);
    plain(frame);
    const margin = { top: sectionSpec.margin.top, bottom: sectionSpec.margin.bottom };
    if (key === "price" || key === "credits") {
      // 흐름 자식의 margin 과 자기 padding 을 합쳐 감싸개 패딩으로 둔다(칠이 없어 보이는 결과가 같다).
      const padding = {
        top: margin.top + sectionSpec.padding.top, right: sectionSpec.padding.right,
        bottom: margin.bottom + sectionSpec.padding.bottom, left: sectionSpec.padding.left,
      };
      flow(frame, "HORIZONTAL", { padding, gap: sectionSpec.gap, counter: sectionSpec.alignItems === "flex-end" ? "MAX" : "MIN" });
      frame.layoutSizingHorizontal = "FILL";
      frame.layoutSizingVertical = "HUG";
      const parts = sectionSpec.texts.map((textSpec, index) => {
        const name = `${key}/${index}`;
        let holder = null;
        if (hasPadding(textSpec.padding)) {
          holder = insertAt(frame, claimFrame(`${name} box`), index);
          plain(holder);
          flow(holder, "VERTICAL", { padding: textSpec.padding });
          holder.layoutSizingHorizontal = "HUG";
          holder.layoutSizingVertical = "HUG";
        }
        const text = insertAt(holder ?? frame, claimText(card, name), holder ? 0 : index);
        text.name = name;
        styleText(text, textSpec);
        sizeText(text, textSpec);
        if (holder) retireOthers(holder, [text]);
        return holder ?? text;
      });
      retireOthers(frame, parts);
      return frame;
    }
    if (key === "features") {
      flow(frame, "VERTICAL", { padding: margin, gap: sectionSpec.gap });
      frame.layoutSizingHorizontal = "FILL";
      frame.layoutSizingVertical = "HUG";
      const rows = sectionSpec.items.map((item, index) => {
        const row = insertAt(frame, claimFrame(`feature/${index}`), index);
        plain(row);
        // `grid-template-columns: 18px 1fr` — 아이콘 트랙은 선언, 글자 트랙은 남는 폭. 아이콘이 뷰포트 밖이라 측정되지 않은
        // 줄은 그 트랙 폭만큼 들여 글자를 같은 자리에 둔다.
        flow(row, "HORIZONTAL", { gap: item.icon ? item.gap : 0, padding: item.icon ? {} : { left: item.iconTrack + item.gap } });
        row.layoutSizingHorizontal = "FILL";
        row.layoutSizingVertical = "HUG";
        const cells = [];
        if (item.icon) {
          const cell = insertAt(row, claimFrame(`feature/${index}/check`), 0);
          plain(cell);
          flow(cell, "VERTICAL", { padding: { top: item.icon.marginTop } });
          cell.layoutSizingHorizontal = "HUG";
          cell.layoutSizingVertical = "HUG";
          const icon = insertAt(cell, claimIcon(`feature-check/${index}`), 0);
          icon.name = `feature-check/${index}`;
          icon.resize(item.icon.size, item.icon.size);
          bindIconPaints(icon, V.mint500);
          retireOthers(cell, [icon]);
          cells.push(cell);
        }
        const text = insertAt(row, claimText(card, `feature/${index}/text`), cells.length);
        text.name = `feature/${index}/text`;
        styleText(text, item.text);
        sizeText(text, item.text);
        cells.push(text);
        retireOthers(row, cells);
        return row;
      });
      retireOthers(frame, rows);
      return frame;
    }
    // head · includes — 글자 하나를 감싸개 패딩(margin)으로 둔다.
    flow(frame, "VERTICAL", { padding: margin });
    frame.layoutSizingHorizontal = "FILL";
    frame.layoutSizingVertical = "HUG";
    const texts = sectionSpec.texts.map((textSpec, index) => {
      const text = insertAt(frame, claimText(card, `${key}/${index}`), index);
      text.name = `${key}/${index}`;
      styleText(text, textSpec);
      sizeText(text, textSpec);
      return text;
    });
    retireOthers(frame, texts);
    return frame;
  });
  retireOthers(content, sectionNodes);
  const keep = [content];
  if (spec.action) {
    const A = spec.action;
    const action = insertAt(card, card.findOne((entry) => entry.type === "FRAME" && entry.name === `action/${A.text}`) ?? newFrame(`action/${A.text}`), 1);
    flow(action, "HORIZONTAL", { padding: A.padding, counter: "CENTER", primary: "CENTER" });
    action.resize(action.width, A.height);
    action.layoutSizingHorizontal = "FILL";
    action.layoutSizingVertical = "FIXED";
    action.strokes = [];
    action.clipsContent = false;
    action.cornerRadius = A.radius;
    bindCorners(action, V.radius12);
    action.opacity = A.opacity;
    action.fills = [colorPaint(A.fill)];
    const label = insertAt(action, action.findOne((entry) => entry.type === "TEXT" && entry.name === "label") ?? newText("label"), 0);
    styleText(label, A.label, "center");
    label.textAutoResize = "WIDTH_AND_HEIGHT";
    retireOthers(action, [label]);
    keep.push(action);
  }
  retireOthers(card, keep);
};
// 세트: 계획의 variant 는 없으면 더하고 전부 reconcile 한다. **계획에 없는 옛 variant(요금제가 넷이던 때의 `Basic` · `Max`)는
// 지우지 않고 그대로 둔다** — 라이브 인스턴스(옛 보드 · 손 조립 보드)가 참조할 수 있어서다. 설명에 보존 사유만 적는다.
const ensureCardSet = (setName, specs, nameOf, options) => {
  let set = section.findOne((entry) => entry.type === "COMPONENT_SET" && entry.name === setName);
  const build = (spec) => {
    const card = figma.createComponent();
    card.name = nameOf(spec);
    return card;
  };
  if (!set) {
    const built = specs.map(build);
    for (const card of built) section.appendChild(card);
    set = figma.combineAsVariants(built, section);
    set.name = setName;
  } else {
    for (const spec of specs) if (!set.children.some((entry) => entry.name === nameOf(spec))) set.appendChild(build(spec));
  }
  const specByName = new Map(specs.map((spec) => [nameOf(spec), spec]));
  const preserved = [];
  for (const card of set.children) {
    const spec = specByName.get(card.name);
    if (!spec) {
      preserved.push(card);
      card.description = `Preserved legacy variant — not in ${PLAN.productCommit} (the product plans are ${specs.map((entry) => entry.plan).join(", ")}). Kept so live instances keep their main component; the plan does not reconcile it.`;
      continue;
    }
    card.resize(spec.rect.width, card.height);
    reconcileCard(card, spec, options);
    card.description = options.describe(spec);
  }
  set.fills = [];
  let cursor = gutter;
  let tallest = 0;
  for (const card of [...specs.map((spec) => set.children.find((entry) => entry.name === nameOf(spec))), ...preserved]) {
    card.x = cursor;
    card.y = gutter;
    cursor += card.width + gutter;
    tallest = Math.max(tallest, card.height);
  }
  set.resizeWithoutConstraints(cursor, tallest + gutter * 2);
  return set;
};
const cardName = (spec) => `Plan=${spec.plan}, Viewport=Desktop`;
const sliceName = (spec) => `Plan=${spec.plan}, Evidence=VisibleSlice`;
const cardSet = ensureCardSet(C.cardSetName, C.cards, cardName, {
  slice: false,
  describe: (spec) => `Measured upgrade ${spec.plan} plan card (measured box ${spec.rect.width}×${spec.rect.height}) — Auto Layout: min height declared, width fills the deck column · ${PLAN.productCommit} · product-only inventory`,
});
cardSet.description = `${C.cards.length} upgrade-plan inventory variants as Auto Layout. Content differences are product data, not a normalized DS contract. ${PLAN.productCommit}.`;
const mobileCardSet = ensureCardSet(C.mobileVisibleCardSetName, M.cards, sliceName, {
  slice: true,
  describe: (spec) => `Measured ${M.page.rect.width}×${M.page.rect.height} ${spec.plan} visible-slice card evidence — measured box ${spec.rect.width}×${spec.rect.height} kept and clipped · action not observed · ${PLAN.productCommit} · product-only`,
});
mobileCardSet.description = `${M.cards.length} viewport-observed mobile Upgrade card slices. Only nodes present in the ${M.page.rect.width}×${M.page.rect.height} fixture are included; this is not a complete mobile card contract. ${PLAN.productCommit}.`;

// ── 메인 표면 ────────────────────────────────────────────────────────────
// 가격 섹션(뷰포트 크롭) = 세로 Auto Layout. 크기는 마스터의 뷰포트 기본값(셸이 `h-[100dvh]` 이고 섹션이 `flex: 1 1 0%`)이고
// 넘치는 것은 자른다. 좌우 패딩은 스크롤 칸 패딩에서 상단 바 bleed 를 뺀 값이라 바는 FILL 로 끝까지 닿고, `body` 가 bleed 만큼
// 되돌려 컨테이너(`max-width: min(1300px, 100%)`, `margin-inline: auto`)를 가운데 둔다. 컨테이너 안은 헤더(`max-width: 820px`,
// 알림 알약 · 제목 · 본문 · 선물 구매 줄의 칠 없는 자리) → 덱(`repeat(N, minmax(0px, 1fr))`, 가장 긴 카드 하나만 HUG · 나머지 FILL) → 비교 제목이다.
const reconcileMain = (component, S, { topBarName, topBarMaster, cardSetForMain, cardNameOf, cardPrefix }) => {
  const L = S.main.layout;
  flow(component, "VERTICAL", { padding: L.main.padding, gap: L.main.barGap });
  component.resize(S.main.rect.width, S.main.rect.height);
  component.primaryAxisSizingMode = component.counterAxisSizingMode = "FIXED";
  component.cornerRadius = S.main.radius;
  bindCorners(component, V.radius16);
  component.fills = [setPaint(V.surface)];
  component.effects = makeEffects(S.main.effects);
  component.strokes = [];
  component.clipsContent = true;
  setModes(component);
  let topBar = component.findOne((entry) => entry.type === "INSTANCE" && entry.name === topBarName);
  if (!topBar) {
    topBar = topBarMaster.createInstance();
    topBar.name = topBarName;
  } else if (topBar.mainComponent?.id !== topBarMaster.id) topBar.swapComponent(topBarMaster);
  insertAt(component, topBar, 0);
  topBar.layoutSizingHorizontal = "FILL";
  if (topBar.layoutMode !== "NONE") topBar.layoutSizingVertical = "HUG";
  const body = insertAt(component, component.findOne((entry) => entry.type === "FRAME" && entry.name === "body") ?? newFrame("body"), 1);
  plain(body);
  flow(body, "VERTICAL", { padding: { left: L.main.bleed.left, right: L.main.bleed.right }, counter: "CENTER" });
  body.layoutSizingHorizontal = "FILL";
  body.layoutSizingVertical = "HUG";
  const find = (type, name) => component.findOne((entry) => entry.type === type && entry.name === name);
  const container = insertAt(body, find("FRAME", "container") ?? newFrame("container"), 0);
  plain(container);
  flow(container, "VERTICAL", { padding: { top: L.container.paddingTop } });
  if (L.container.width.mode === "FIXED") {
    container.resize(L.container.width.value, container.height);
    container.layoutSizingHorizontal = "FIXED";
  } else container.layoutSizingHorizontal = "FILL";
  container.layoutSizingVertical = "HUG";
  // 헤더
  const header = insertAt(container, find("FRAME", "header") ?? newFrame("header"), 0);
  plain(header);
  flow(header, "VERTICAL", { padding: { bottom: L.header.paddingBottom } });
  header.layoutSizingHorizontal = "FILL";
  header.layoutSizingVertical = "HUG";
  header.maxWidth = L.header.maxWidth;
  const noticeBox = insertAt(header, find("FRAME", "notice") ?? newFrame("notice"), 0);
  plain(noticeBox);
  flow(noticeBox, "VERTICAL", { padding: { bottom: L.header.notice.paddingBottom } });
  noticeBox.layoutSizingHorizontal = "HUG";
  noticeBox.layoutSizingVertical = "HUG";
  const pill = insertAt(noticeBox, find("FRAME", "notice/pill") ?? newFrame("notice/pill"), 0);
  plain(pill);
  flow(pill, "HORIZONTAL", { padding: L.header.notice.padding, counter: "CENTER" });
  pill.resize(pill.width, L.header.notice.height);
  pill.layoutSizingHorizontal = "HUG";
  pill.layoutSizingVertical = "FIXED";
  const noticeText = insertAt(pill, find("TEXT", "header/notice") ?? newText("header/notice"), 0);
  styleText(noticeText, S.main.headerNotice);
  noticeText.textAutoResize = "WIDTH_AND_HEIGHT";
  retireOthers(pill, [noticeText]);
  retireOthers(noticeBox, [pill]);
  const titleBox = insertAt(header, find("FRAME", "title") ?? newFrame("title"), 1);
  plain(titleBox);
  flow(titleBox, "VERTICAL", { padding: { bottom: L.header.titlePaddingBottom } });
  titleBox.layoutSizingHorizontal = "FILL";
  titleBox.layoutSizingVertical = "HUG";
  const titleText = insertAt(titleBox, find("TEXT", "header/title") ?? newText("header/title"), 0);
  styleText(titleText, S.main.headerTitle);
  sizeText(titleText, { sizing: "FILL" });
  retireOthers(titleBox, [titleText]);
  const bodyText = insertAt(header, find("TEXT", "header/body") ?? newText("header/body"), 2);
  styleText(bodyText, S.main.headerBody);
  sizeText(bodyText, { sizing: "FILL", maxWidth: S.main.headerBody.maxWidth });
  const headerKeep = [noticeBox, titleBox, bodyText];
  if (L.header.gift) {
    // 선물 구매 줄(KLI-264) — 버튼의 면 · 글자는 그리지 않고 **자리만** 둔다: 줄의 위 여백(칠 없는 감싸개 패딩) + Button md 높이.
    // 헤더가 흐름이라 이 줄을 빼면 덱 · 비교 제목이 그만큼 위로 서고, 모바일 조각은 관측되지 않은 영역을 드러낸다.
    const giftRow = insertAt(header, find("FRAME", "gift") ?? newFrame("gift"), 3);
    plain(giftRow);
    flow(giftRow, "VERTICAL", { padding: { top: L.header.gift.paddingTop } });
    giftRow.layoutSizingHorizontal = "FILL";
    giftRow.layoutSizingVertical = "HUG";
    const giftSlot = insertAt(giftRow, find("FRAME", "gift/button slot") ?? newFrame("gift/button slot"), 0);
    plain(giftSlot);
    giftSlot.layoutMode = "NONE";
    giftSlot.resize(giftSlot.width, L.header.gift.height);
    giftSlot.layoutSizingHorizontal = "FILL";
    giftSlot.layoutSizingVertical = "FIXED";
    retireOthers(giftSlot, []);
    retireOthers(giftRow, [giftSlot]);
    headerKeep.push(giftRow);
  }
  retireOthers(header, headerKeep);
  // 덱
  const deck = insertAt(container, find("FRAME", "deck") ?? newFrame("deck"), 1);
  plain(deck);
  flow(deck, "HORIZONTAL", { gap: L.deck.gap });
  deck.layoutSizingHorizontal = "FILL";
  deck.layoutSizingVertical = "HUG";
  const cards = cardSetForMain.specs.map((spec, index) => {
    const master = cardSetForMain.set.children.find((entry) => entry.name === cardNameOf(spec));
    if (!master) throw new Error(`Missing plan card master ${spec.plan}`);
    const name = `${cardPrefix}/${spec.plan}`;
    let card = component.findOne((entry) => entry.type === "INSTANCE" && entry.name === name);
    if (!card) {
      card = master.createInstance();
      card.name = name;
    } else if (card.mainComponent?.id !== master.id) card.swapComponent(master);
    insertAt(deck, card, index);
    card.layoutSizingHorizontal = "FILL";
    // 형제 모두 세로 FILL 이면 줄이 접힌다(조립 규칙 19번) — 가장 긴 카드만 HUG, 나머지는 그 높이로 FILL. 조각은 고정 높이다.
    card.layoutSizingVertical = spec.deckHeight === "HUG" ? "HUG" : spec.deckHeight === "FILL" ? "FILL" : "FIXED";
    return card;
  });
  retireOthers(deck, cards);
  const containerKeep = [header, deck];
  if (L.compare && S.main.compareTitle) {
    const compare = insertAt(container, find("FRAME", "compare") ?? newFrame("compare"), 2);
    plain(compare);
    flow(compare, "VERTICAL", { padding: { top: L.compare.paddingTop } });
    compare.layoutSizingHorizontal = "FILL";
    compare.layoutSizingVertical = "HUG";
    const compareText = insertAt(compare, find("TEXT", "compare/title") ?? newText("compare/title"), 0);
    styleText(compareText, S.main.compareTitle);
    sizeText(compareText, { sizing: "FILL" });
    retireOthers(compare, [compareText]);
    containerKeep.push(compare);
  }
  retireOthers(container, containerKeep);
  retireOthers(body, [container]);
  retireOthers(component, [topBar, body]);
};
const ensureComponent = (name) => {
  let component = section.findOne((entry) => entry.type === "COMPONENT" && entry.name === name);
  if (!component) {
    component = figma.createComponent();
    component.name = name;
    section.appendChild(component);
  }
  return component;
};
const mainComponent = ensureComponent(C.mainComponentName);
reconcileMain(mainComponent, C, {
  topBarName: "top-bar/Subscription trail back", topBarMaster,
  cardSetForMain: { set: cardSet, specs: C.cards }, cardNameOf: cardName, cardPrefix: "plan-card",
});
mainComponent.description = `Measured ${C.page.rect.width}×${C.page.rect.height} upgrade main surface (price section ${C.main.rect.width}×${C.main.rect.height}, viewport crop) — Auto Layout · ${PLAN.productCommit} · product-only scene`;
const mobileMainComponent = ensureComponent(C.mobileMainComponentName);
reconcileMain(mobileMainComponent, M, {
  topBarName: "top-bar/Subscription trail back mobile inset", topBarMaster: mobileTopBarMaster,
  cardSetForMain: { set: mobileCardSet, specs: M.cards }, cardNameOf: sliceName, cardPrefix: "plan-card-visible-slice",
});
mobileMainComponent.description = `Measured ${M.page.rect.width}×${M.page.rect.height} mobile upgrade main surface. Only viewport-observed Upgrade nodes are present. Auto Layout · ${PLAN.productCommit} · product-only`;

// ── 장면 ────────────────────────────────────────────────────────────────
// 가로 Auto Layout — 크기는 뷰포트(마스터 기본값), 패딩은 셸 패딩과 main 의 `ml-[var(--app-gnb-sidebar-width)]` ·
// `pr-[var(--app-gnb-main-inline-padding-end)]`, 메인은 폭 · 높이 FILL(`h-[100dvh]` 셸 안의 `flex: 1`). 사이드바는
// `position: fixed` 라 흐름 밖(절대 배치)이고 칠 순서를 위해 마지막 자식이다(조립 규칙 15번). 셸 토큰이라 간격 변수에 묶지 않는다.
const reconcileScene = (component, S, mainMaster, mainName, gnbName) => {
  component.layoutMode = "HORIZONTAL";
  component.layoutWrap = "NO_WRAP";
  component.primaryAxisAlignItems = component.counterAxisAlignItems = "MIN";
  component.resize(S.page.rect.width, S.page.rect.height);
  component.primaryAxisSizingMode = component.counterAxisSizingMode = "FIXED";
  for (const [side, value] of Object.entries(S.main.layout.page.padding)) {
    const field = `padding${side[0].toUpperCase()}${side.slice(1)}`;
    component[field] = value;
    component.setBoundVariable(field, null);
  }
  component.itemSpacing = 0;
  component.fills = [setPaint(V.appBackground)];
  component.clipsContent = true;
  setModes(component);
  let main = component.findOne((entry) => entry.type === "INSTANCE" && entry.name === mainName);
  if (!main) {
    main = mainMaster.createInstance();
    main.name = mainName;
  } else if (main.mainComponent?.id !== mainMaster.id) main.swapComponent(mainMaster);
  insertAt(component, main, 0);
  main.layoutSizingHorizontal = "FILL";
  main.layoutSizingVertical = "FILL";
  const keep = [main];
  if (gnbName) {
    let gnb = component.findOne((entry) => entry.type === "INSTANCE" && entry.name === gnbName);
    if (!gnb) {
      gnb = gnbMaster.createInstance();
      gnb.name = gnbName;
    } else if (gnb.mainComponent?.id !== gnbMaster.id) gnb.swapComponent(gnbMaster);
    insertAt(component, gnb, 1);
    gnb.layoutPositioning = "ABSOLUTE";
    gnb.x = 0;
    gnb.y = 0;
    gnb.constraints = { horizontal: "MIN", vertical: "STRETCH" };
    keep.push(gnb);
  }
  retireOthers(component, keep);
};
const sceneComponent = ensureComponent(C.sceneComponentName);
reconcileScene(sceneComponent, C, mainComponent, "main/Desktop Upgrade", "gnb/Current=Upgrade");
sceneComponent.description = `Measured ${C.page.rect.width}×${C.page.rect.height} upgrade scene; ${PLAN.redirectContracts[0].requestedRoute} without plan redirects here. ${PLAN.productCommit}.`;
const mobileSceneComponent = ensureComponent(C.mobileSceneComponentName);
reconcileScene(mobileSceneComponent, M, mobileMainComponent, "main/Mobile Upgrade Visible Slice", null);
mobileSceneComponent.description = `Measured ${M.page.rect.width}×${M.page.rect.height} upgrade scene; ${PLAN.redirectContracts[1].requestedRoute} without plan redirects here. Plus, Pro, Ultra, and actions are unobserved and intentionally absent. ${PLAN.productCommit}.`;

// 캔버스 배치 — 문서 아래로 카드 세트, 데스크톱 메인 · 장면, 모바일 조각 세트, 모바일 메인 · 장면을 줄마다 둔다(실제 크기로 잰다).
{
  let cursor = docs.y + docs.height + gutter;
  let right = 0;
  for (const row of [[cardSet], [mainComponent, sceneComponent], [mobileCardSet], [mobileMainComponent, mobileSceneComponent]]) {
    let x = gutter;
    let tallest = 0;
    for (const node of row) {
      node.x = x;
      node.y = cursor;
      x += node.width + gutter;
      tallest = Math.max(tallest, node.height);
    }
    right = Math.max(right, x);
    cursor += tallest + gutter;
  }
  section.resizeWithoutConstraints(Math.max(section.width, right), Math.max(section.height, cursor));
}

const paints = [];
// 허용 기준을 계획의 실측 아웃라인에서 읽는다. 손으로 박은 값(185/225/247 @0.42)은 제품이
// `--primary-200` 40% 로 옮긴 뒤로 어떤 획과도 안 맞아, 이 가드는 「모든 획을 거부」가 돼 있었다.
const CURRENT_PLAN_OUTLINE = C.cards.find((spec) => spec.outline)?.outline;
if (!CURRENT_PLAN_OUTLINE) throw new Error("No measured current-plan outline in the plan");
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
          field === "strokes" && measuredOutlineNames.has(node.name) &&
          node.strokeWeight === CURRENT_PLAN_OUTLINE.width && node.strokeAlign === "INSIDE" &&
          near(paint.color.r, CURRENT_PLAN_OUTLINE.color[0]) && near(paint.color.g, CURRENT_PLAN_OUTLINE.color[1]) &&
          near(paint.color.b, CURRENT_PLAN_OUTLINE.color[2]) && near(paint.opacity ?? 1, CURRENT_PLAN_OUTLINE.color[3]);
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
