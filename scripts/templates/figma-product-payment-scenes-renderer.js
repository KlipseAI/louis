const C = PLAN.component;
const page =
  (await figma.getNodeByIdAsync(C.pageId)) ?? figma.root.children.find((entry) => entry.name === C.pageName);
if (!page) throw new Error(`Missing target page ${C.pageName}`);
await figma.setCurrentPageAsync(page);

// 변수 · 모드 · 칠은 공용 조각(`scripts/templates/lib/figma-live-variables.js`, 생성기가 앞에 붙인다)이 푼다. 면은 계획이
// 고른 역할 이름(`page.paint` · `main.paint`)으로만 칠한다.
const B = C.bindings;
const { V, pin, paint, bindCorners, audit, mode: colourMode } = await liveVariables(B);

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
}
pin(section);
section.fills = [paint("boardSurface")];

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
  title.fills = [paint("docsTitle")];
  docs.appendChild(title);
  const note = figma.createText();
  note.fontName = { family: "Pretendard", style: "Regular" };
  note.fontSize = 14;
  note.lineHeight = { unit: "PERCENT", value: 150 };
  note.characters = `${PLAN.productCommit.slice(0, 8)} · ${PLAN.context} · nested measured Gnb/top bar/result components · product-only composition`;
  note.fills = [paint("docsNote")];
  docs.appendChild(note);
  section.appendChild(docs);
}
// 문서 글자 잉크도 매 실행 주석 역할로 다시 건다 — 옛 문서 프레임은 은퇴한 컬렉션 변수에 묶여 있다.
{
  const texts = docs.findAllWithCriteria({ types: ["TEXT"] });
  if (texts[0]) texts[0].fills = [paint("docsTitle")];
  if (texts[1]) texts[1].fills = [paint("docsNote")];
}

// ── reconcile 공통 ───────────────────────────────────────────────────────
// **세트가 있어도 매 실행 제자리에서 reconcile 한다(2026-09-14, 크기 굳힘 감사 묶음 3).** 옛 러너는 세트가 없을 때만
// 지었고, 그때 셸 calc 결과(1628×1004 · 402×810 …)로 resize 하고 상단 바 · 본문을 측정 x/y 에 박았다. 이제 메인 표면은
// 세로 Auto Layout, 장면은 가로 Auto Layout 이고, 계획에 없는 자식은 **지우지 않고** 숨겨 `retired/` 로 이름만 바꾼다.
const placeFrame = (scope, parent, name, index) => {
  let node = scope.findOne((entry) => entry.type === "FRAME" && entry.name === name);
  if (!node) {
    node = figma.createFrame();
    node.name = name;
  }
  if (node.parent !== parent || parent.children.indexOf(node) !== index) parent.insertChild(index, node);
  node.visible = true;
  return node;
};
const placeInstance = (scope, parent, name, master, index) => {
  let node = scope.findOne((entry) => entry.type === "INSTANCE" && entry.name === name);
  if (!node) {
    node = master.createInstance();
    node.name = name;
  } else if (node.mainComponent?.id !== master.id) {
    node.swapComponent(master);
  }
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
const autoLayout = (frame, mode) => {
  frame.layoutMode = mode;
  frame.layoutWrap = "NO_WRAP";
  frame.primaryAxisAlignItems = "MIN";
  frame.counterAxisAlignItems = "MIN";
  frame.strokes = [];
};
const setModes = pin;
const gutter = 40;
const ensureSet = (setName, specs, build, reconcile) => {
  const nameOf = (spec) => `Outcome=${spec.outcome}`;
  let set = section.findOne((entry) => entry.type === "COMPONENT_SET" && entry.name === setName);
  if (!set) {
    const built = specs.map((spec) => {
      const component = build(spec);
      component.name = nameOf(spec);
      section.appendChild(component);
      return component;
    });
    set = figma.combineAsVariants(built, section);
    set.name = setName;
  } else {
    for (const spec of specs) {
      if (set.children.some((entry) => entry.name === nameOf(spec))) continue;
      const component = build(spec);
      component.name = nameOf(spec);
      set.appendChild(component);
    }
  }
  const specByName = new Map(specs.map((spec) => [nameOf(spec), spec]));
  for (const variant of set.children) {
    const spec = specByName.get(variant.name);
    if (!spec) throw new Error(`Unexpected ${setName} variant ${variant.name}`);
    reconcile(variant, spec);
  }
  set.fills = [];
  // 한 줄 배치 — 칸 크기는 reconcile 뒤의 실제 크기(높이 HUG)로 잰다.
  let cursor = gutter;
  let tallest = 0;
  for (const spec of specs) {
    const variant = set.children.find((entry) => entry.name === nameOf(spec));
    variant.x = cursor;
    variant.y = gutter;
    cursor += variant.width + gutter;
    tallest = Math.max(tallest, variant.height);
  }
  set.resizeWithoutConstraints(cursor, tallest + gutter * 2);
  return set;
};
// 메인 표면 — 세로 Auto Layout. 폭은 마스터 기본값만 측정 main 폭(장면이 FILL), 높이는 HUG + 최소 높이
// (`min-height: calc(100dvh − …)` 를 이 뷰포트에서 푼 값 — 마스터의 뷰포트 기본 높이). 좌우 패딩은 main 패딩에서 상단 바
// bleed 를 뺀 값이라 상단 바는 FILL 로 카드 끝까지 닿고, 본문 칸(`body`)이 bleed 만큼 되돌려 가운데 정렬(`self-center`)한다.
// 본문 칸의 위 패딩은 본문 `margin-top`(`clamp(56px, 10vh, 120px)` 을 이 뷰포트에서 푼 값)이다.
const reconcileMain = (component, spec, S, topBarMaster, topBarName, resultMaster) => {
  const L = S.layout.main;
  autoLayout(component, "VERTICAL");
  component.resize(S.main.rect.width, component.height);
  component.counterAxisSizingMode = "FIXED";
  component.primaryAxisSizingMode = "AUTO";
  component.minHeight = L.minHeight;
  bindSpacing(component, "paddingTop", L.padding.top);
  bindSpacing(component, "paddingRight", L.padding.right - L.bleed.right);
  bindSpacing(component, "paddingBottom", L.padding.bottom);
  bindSpacing(component, "paddingLeft", L.padding.left - L.bleed.left);
  bindSpacing(component, "itemSpacing", L.barGap);
  component.fills = [paint(S.main.paint)];
  component.cornerRadius = S.main.radius;
  bindCorners(component, V.radius16);
  component.clipsContent = true;
  setModes(component);
  const topBar = placeInstance(component, component, topBarName, topBarMaster, 0);
  topBar.layoutSizingHorizontal = "FILL";
  if (topBar.layoutMode !== "NONE") topBar.layoutSizingVertical = "HUG";
  const body = placeFrame(component, component, "body", 1);
  autoLayout(body, "VERTICAL");
  body.counterAxisAlignItems = "CENTER";
  body.fills = [];
  body.clipsContent = false;
  bindSpacing(body, "paddingTop", L.contentTop);
  bindSpacing(body, "paddingRight", L.bleed.right);
  bindSpacing(body, "paddingBottom", 0);
  bindSpacing(body, "paddingLeft", L.bleed.left);
  body.layoutSizingHorizontal = "FILL";
  body.layoutSizingVertical = "HUG";
  const result = placeInstance(component, body, `result/Outcome=${spec.outcome}`, resultMaster, 0);
  // 본문 폭 축은 결제 결과 세트의 계획이 정한다 — 데스크톱은 선언 상한 FIXED(마스터 폭 그대로), 모바일은 FILL.
  result.layoutSizingHorizontal = spec.contentWidth === "FIXED" ? "FIXED" : "FILL";
  result.layoutSizingVertical = "HUG";
  retireOthers(body, [result]);
  retireOthers(component, [topBar, body]);
  component.description =
    `Measured ${spec.route} main surface — measured box ${S.main.rect.width}×${S.main.rect.height}; Auto Layout with min height ` +
    `from calc(100dvh − …) at this viewport · ${PLAN.productCommit} · product-only composition`;
};
// 장면 — 가로 Auto Layout. 크기는 뷰포트(마스터의 뷰포트 기본값), 패딩은 셸 패딩과 main 의 좌우 margin
// (`ml-[var(--app-gnb-sidebar-width)]` · `mr-[var(--app-gnb-main-inline-padding-end)]`)이고 메인은 폭 FILL · 높이 HUG 다.
// 사이드바는 `position: fixed` 라 흐름 밖(절대 배치, 위아래로 늘어남)이고 칠 순서를 위해 마지막 자식이다(조립 규칙 15번).
// 셸 레이아웃 토큰이라 패딩은 간격 변수에 묶지 않는다.
const reconcileScene = (component, spec, S, mainSet, gnb) => {
  const mainMaster = mainSet.children.find((entry) => entry.name === `Outcome=${spec.outcome}`);
  if (!mainMaster) throw new Error(`Missing composed main variant ${spec.outcome}`);
  autoLayout(component, "HORIZONTAL");
  component.resize(S.page.rect.width, S.page.rect.height);
  component.primaryAxisSizingMode = component.counterAxisSizingMode = "FIXED";
  for (const [side, value] of Object.entries(S.layout.page.padding)) {
    const field = `padding${side[0].toUpperCase()}${side.slice(1)}`;
    component[field] = value;
    component.setBoundVariable(field, null);
  }
  component.itemSpacing = 0;
  component.fills = [paint(S.page.paint)];
  setModes(component);
  const main = placeInstance(component, component, `main/Outcome=${spec.outcome}`, mainMaster, 0);
  main.layoutSizingHorizontal = "FILL";
  main.layoutSizingVertical = "HUG";
  const keep = [main];
  if (gnb) {
    const shell = placeInstance(component, component, gnb.name, gnb.master, 1);
    shell.layoutPositioning = "ABSOLUTE";
    shell.x = 0;
    shell.y = 0;
    shell.constraints = { horizontal: "MIN", vertical: "STRETCH" };
    keep.push(shell);
  }
  retireOthers(component, keep);
  component.description = `Measured ${spec.route} ${S.page.rect.width}×${S.page.rect.height} scene · ${PLAN.productCommit} · product-only composition`;
};
const buildEmpty = () => figma.createComponent();

const mainSet = ensureSet(C.mainSetName, C.variants, buildEmpty, (component, spec) =>
  reconcileMain(component, spec, C, topBarMaster, "top-bar/Desktop App Top Bar", resultMasters.get(spec.outcome)));
mainSet.description = `Result main surface (measured ${C.main.rect.width}×${C.main.rect.height}) as Auto Layout around nested product-only components. ${PLAN.productCommit}. Not normative.`;
const sceneSet = ensureSet(C.sceneSetName, C.variants, buildEmpty, (component, spec) =>
  reconcileScene(component, spec, C, mainSet, { name: "gnb/Current=Default", master: gnbMaster }));
sceneSet.description = `Full desktop payment-result scenes composed from nested product components. ${PLAN.productCommit}. Not normative.`;
const M = C.mobile;
const mobileMainSet = ensureSet(M.mainSetName, M.variants, buildEmpty, (component, spec) =>
  reconcileMain(component, spec, M, mobileTopBarMaster, "top-bar/Mobile App Top Bar", mobileResultMasters.get(spec.outcome)));
mobileMainSet.description = `Mobile result main surface (measured ${M.main.rect.width}×${M.main.rect.height}) as Auto Layout around nested product-only components. ${PLAN.productCommit}. Not normative.`;
const mobileSceneSet = ensureSet(M.sceneSetName, M.variants, buildEmpty, (component, spec) =>
  reconcileScene(component, spec, M, mobileMainSet, null));
mobileSceneSet.description = `Full mobile payment-result scenes composed from nested product components. ${PLAN.productCommit}. Not normative.`;

// 세트는 문서 아래로 쌓는다(데스크톱 두 줄, 그 아래 모바일 두 줄) — 높이가 HUG 라 실제 크기로 잰다.
{
  let cursor = docs.y + docs.height + gutter;
  let right = 0;
  for (const set of [mainSet, sceneSet, mobileMainSet, mobileSceneSet]) {
    set.x = gutter;
    set.y = cursor;
    cursor += set.height + gutter;
    right = Math.max(right, set.x + set.width + gutter);
  }
  section.resizeWithoutConstraints(Math.max(section.width, right), Math.max(section.height, cursor));
}

// 보이는 페인트 감사 — 변수에 묶이지 않은 것은 계획의 고정 역할 색(`unboundColors`)이거나 브랜드 로고 자산이어야 한다.
// 사이드바 셸(컴포넌트 러너)은 제품 로고 SVG 를 인스턴스로 품는다 — 워드마크 잉크는 자산의 칠이다.
const paintAudit = audit([mainSet, sceneSet, mobileMainSet, mobileSceneSet], {
  allow: (node) => {
    for (let ancestor = node; ancestor && ancestor !== section; ancestor = ancestor.parent) {
      if (/^logo\/klipse-(light|dark)\b/.test(ancestor.name)) return "brandLogo";
    }
    return null;
  },
});
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
  colourMode,
  ...paintAudit,
};
