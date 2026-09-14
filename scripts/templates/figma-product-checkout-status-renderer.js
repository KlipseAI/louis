const C = PLAN.component;
const page =
  (await figma.getNodeByIdAsync(C.pageId)) ??
  figma.root.children.find((entry) => entry.name === C.pageName);
if (!page) throw new Error(`Missing target page ${C.pageName}`);
await figma.setCurrentPageAsync(page);

// 변수 · 모드 · 칠은 공용 조각(`scripts/templates/lib/figma-live-variables.js`, 생성기가 앞에 붙인다)이 푼다. 칠하는 자리는
// 계획이 고른 역할 이름(`paint` · `fillPaint` · `strokePaint`)만 읽는다 — 러너가 색을 추측하지 않는다.
const B = C.bindings;
const { V, pin, paint, bindCorners, audit, mode: colourMode } = await liveVariables(B);
const setModes = pin;

await Promise.all([
  figma.loadFontAsync({ family: "Pretendard", style: "Regular" }),
  figma.loadFontAsync({ family: "Pretendard", style: "Medium" }),
]);
const weightStyle = { 400: "Regular", 500: "Medium" };

// ── reconcile 공통 ───────────────────────────────────────────────────────
// **세트가 있어도 매 실행 제자리에서 reconcile 한다(2026-09-14, 크기 굳힘 감사 묶음 2 · 3).** 옛 러너는 세트가
// 없을 때만 지었고, 그때 측정 rect 로 resize 하고 글자 · 행 · 버튼 · 상단 바 · 본문을 측정 x/y 에 박았다. 셸 토큰이나
// 상단 바가 움직여도 라이브 세트는 그대로 낡았다. 이제 모든 노드는 Auto Layout 흐름이고, 계획에 없는 노드는 **지우지
// 않고** 숨겨 `retired/` 로 이름만 바꾼다 — 인스턴스가 그 노드에 건 override 를 끊지 않기 위해서다.
const newNode = (type, name) => {
  const node = type === "TEXT" ? figma.createText() : figma.createFrame();
  node.name = name;
  if (type === "TEXT") node.fontName = { family: "Pretendard", style: "Regular" };
  else node.fills = [];
  return node;
};
// 간격은 계획이 되읽기에서 확인한 `spacing<n>` 이 있을 때만 묶는다(뷰포트 계산값 같은 토큰 없는 값은 숫자로 둔다).
const bindSpacing = (node, field, value) => {
  node[field] = value;
  node.setBoundVariable(field, value && V[`spacing${value}`] ? V[`spacing${value}`] : null);
};
const bindPadding = (node, padding) => {
  for (const side of ["Top", "Right", "Bottom", "Left"]) bindSpacing(node, `padding${side}`, padding[side.toLowerCase()]);
};
const NONE = { top: 0, right: 0, bottom: 0, left: 0 };
// 같은 이름의 노드를 **scope 어디에서든** 찾아 새 부모의 제자리로 옮긴다(옛 구조와 새 구조의 부모가 다를 수 있다).
const place = (scope, parent, type, name, index) => {
  const node = scope.findOne((entry) => entry.type === type && entry.name === name) ?? newNode(type, name);
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
const autoLayout = (frame, mode) => {
  frame.layoutMode = mode;
  frame.layoutWrap = "NO_WRAP";
  frame.primaryAxisAlignItems = "MIN";
  frame.counterAxisAlignItems = "MIN";
  frame.fills = [];
  frame.strokes = [];
  frame.clipsContent = false;
};
const styleText = (text, spec, align = spec.textAlign) => {
  text.fontName = { family: "Pretendard", style: weightStyle[spec.fontWeight] ?? "Regular" };
  text.fontSize = spec.fontSize;
  text.lineHeight = { unit: "PIXELS", value: spec.lineHeight };
  text.letterSpacing = { unit: "PIXELS", value: spec.letterSpacing };
  if (text.characters !== spec.text) text.characters = spec.text;
  text.textAlignHorizontal = align === "right" ? "RIGHT" : align === "center" ? "CENTER" : "LEFT";
  text.textAlignVertical = "TOP";
  text.fills = [paint(spec.paint)];
};
const fillText = (text) => {
  text.layoutSizingHorizontal = "FILL";
  text.textAutoResize = "HEIGHT";
};
const hugText = (text) => {
  text.textAutoResize = "WIDTH_AND_HEIGHT";
};
// 아래쪽 한 변만 긋는 테두리(CSS border-box 처럼 레이아웃에 포함한다).
const bottomBorder = (frame, border) => {
  if (!border) {
    frame.strokes = [];
    return;
  }
  frame.strokes = [paint(border.paint)];
  frame.strokeAlign = "INSIDE";
  frame.strokeTopWeight = frame.strokeRightWeight = frame.strokeLeftWeight = 0;
  frame.strokeBottomWeight = border.width;
  frame.strokesIncludedInLayout = true;
};
// 캔버스 배치 — 열 · 행 키로 격자를 짓되 칸 크기는 reconcile 뒤의 **실제** 크기에서 잰다(높이가 HUG 라 러너가 미리 모른다).
const gutter = 40;
const arrange = (set, specs, nameOf, columnOf, rowOf) => {
  const columns = [...new Set(specs.map(columnOf))];
  const rows = [...new Set(specs.map(rowOf))];
  const cell = (spec) => set.children.find((entry) => entry.name === nameOf(spec));
  const columnSpan = columns.map((column) => Math.max(...specs.filter((spec) => columnOf(spec) === column).map((spec) => cell(spec).width)));
  const rowSpan = rows.map((row) => Math.max(...specs.filter((spec) => rowOf(spec) === row).map((spec) => cell(spec).height)));
  const offset = (spans, index) => gutter + spans.slice(0, index).reduce((sum, span) => sum + span + gutter, 0);
  for (const spec of specs) {
    const node = cell(spec);
    node.x = offset(columnSpan, columns.indexOf(columnOf(spec)));
    node.y = offset(rowSpan, rows.indexOf(rowOf(spec)));
  }
  set.resizeWithoutConstraints(offset(columnSpan, columns.length), offset(rowSpan, rows.length));
};
const ensureSet = (setName, specs, nameOf, build, reconcile) => {
  let set = section.findOne((entry) => entry.type === "COMPONENT_SET" && entry.name === setName);
  if (!set) {
    const built = specs.map(build);
    for (const component of built) section.appendChild(component);
    set = figma.combineAsVariants(built, section);
    set.name = setName;
  } else {
    for (const spec of specs) {
      if (!set.children.some((entry) => entry.name === nameOf(spec))) set.appendChild(build(spec));
    }
  }
  const specByName = new Map(specs.map((spec) => [nameOf(spec), spec]));
  for (const variant of set.children) {
    const spec = specByName.get(variant.name);
    if (!spec) throw new Error(`Unexpected ${setName} variant ${variant.name}`);
    reconcile(variant, spec);
  }
  set.fills = [];
  return set;
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
}
setModes(section);
section.fills = [paint("boardSurface")];

let docs = section.findOne((entry) => entry.name === `${C.contentSetName} / Documentation`);
if (!docs) {
  docs = figma.createFrame();
  docs.name = `${C.contentSetName} / Documentation`;
  docs.x = gutter;
  docs.y = gutter;
  docs.layoutMode = "VERTICAL";
  docs.paddingTop = docs.paddingRight = docs.paddingBottom = docs.paddingLeft = 32;
  docs.itemSpacing = 12;
  docs.fills = [];
  const title = figma.createText();
  title.fontName = { family: "Pretendard", style: "Medium" };
  title.fontSize = 28;
  title.characters = C.contentSetName;
  title.fills = [paint("docsTitle")];
  docs.appendChild(title);
  const note = figma.createText();
  note.fontName = { family: "Pretendard", style: "Regular" };
  note.fontSize = 14;
  note.lineHeight = { unit: "PERCENT", value: 150 };
  note.fills = [paint("docsNote")];
  docs.appendChild(note);
  section.appendChild(docs);
}
{
  const texts = docs.findAllWithCriteria({ types: ["TEXT"] });
  if (texts.length < 2) throw new Error(`Missing documentation note ${docs.name}`);
  // 문서 글자 잉크도 매 실행 주석 역할로 다시 건다 — 옛 문서 프레임은 은퇴한 컬렉션 변수에 묶여 있다.
  texts[0].fills = [paint("docsTitle")];
  texts[1].fills = [paint("docsNote")];
  const note = `${PLAN.productCommit.slice(0, 8)} · 3 routes × desktop/mobile · Auto Layout from declared widths, spacing and control heights; measured boxes only in descriptions · product-only`;
  if (texts[1].characters !== note) texts[1].characters = note;
}

// ── 본문 ────────────────────────────────────────────────────────────────
// variant 는 세로 Auto Layout — 높이 HUG, 폭은 계획의 `width`(데스크톱은 선언 상한 520 FIXED, 모바일은 `100%` 라 기본값만
// 측정 부모 폭이고 소비처가 FILL). 글자는 FILL + 높이 자동, 목록 행은 데스크톱 가로 양끝 정렬 · ≤900 세로 가운데 정렬,
// 버튼 줄은 세로 쌓임(`flex-wrap` + 버튼마다 `width: 100%`), 버튼은 폭 FILL · 높이 선언값 FIXED.
const contentName = (spec) => `Outcome=${spec.outcome}, Viewport=${spec.viewport}`;
const buildContent = (spec) => {
  const component = figma.createComponent();
  component.name = contentName(spec);
  component.appendChild(newNode("TEXT", "title"));
  component.appendChild(newNode("TEXT", "body"));
  if (spec.alert) {
    const alert = newNode("FRAME", "alert/error");
    alert.appendChild(newNode("TEXT", "message"));
    component.appendChild(alert);
  }
  if (spec.details) component.appendChild(newNode("FRAME", "details"));
  component.appendChild(newNode("FRAME", "actions"));
  return component;
};
const reconcileContent = (variant, spec) => {
  autoLayout(variant, "VERTICAL");
  variant.resize(spec.width.value, variant.height);
  variant.counterAxisSizingMode = "FIXED";
  variant.primaryAxisSizingMode = "AUTO";
  bindPadding(variant, NONE);
  bindSpacing(variant, "itemSpacing", spec.gap);
  setModes(variant);
  const keep = [];
  const title = place(variant, variant, "TEXT", "title", keep.length);
  keep.push(title);
  styleText(title, spec.title);
  fillText(title);
  const body = place(variant, variant, "TEXT", "body", keep.length);
  keep.push(body);
  styleText(body, spec.body);
  fillText(body);
  if (spec.alert) {
    const A = spec.alert;
    const alert = place(variant, variant, "FRAME", "alert/error", keep.length);
    keep.push(alert);
    autoLayout(alert, "VERTICAL");
    bindPadding(alert, A.padding);
    alert.layoutSizingHorizontal = "FILL";
    alert.layoutSizingVertical = "HUG";
    alert.cornerRadius = A.radius;
    bindCorners(alert, V.radius12);
    alert.fills = [paint(A.fillPaint)];
    alert.strokes = [paint(A.strokePaint)];
    alert.strokeAlign = "INSIDE";
    alert.strokeWeight = A.strokeWidth;
    alert.strokesIncludedInLayout = true;
    const message = place(alert, alert, "TEXT", "message", 0);
    styleText(message, { ...A.textStyle, text: A.text });
    fillText(message);
    retireOthers(alert, [message]);
  }
  if (spec.details) {
    const details = place(variant, variant, "FRAME", "details", keep.length);
    keep.push(details);
    autoLayout(details, "VERTICAL");
    bindPadding(details, NONE);
    bindSpacing(details, "itemSpacing", spec.details.gap);
    details.layoutSizingHorizontal = "FILL";
    details.layoutSizingVertical = "HUG";
    const rows = spec.details.rows.map((rowSpec, index) => {
      const row = place(details, details, "FRAME", `row/${rowSpec.term.text}`, index);
      const column = rowSpec.direction === "column";
      autoLayout(row, column ? "VERTICAL" : "HORIZONTAL");
      // Figma 의 SPACE_BETWEEN 은 itemSpacing 을 버린다 — 세로 행은 높이가 HUG 라 남는 자리가 없으므로 CSS `gap` 을
      // itemSpacing 으로 살리고, 폭을 채우는 가로 행만 양끝 정렬한다.
      row.primaryAxisAlignItems = rowSpec.justifyContent === "space-between" && !column ? "SPACE_BETWEEN" : "MIN";
      row.counterAxisAlignItems = rowSpec.alignItems === "center" ? "CENTER" : "MIN";
      bindPadding(row, rowSpec.padding);
      bindSpacing(row, "itemSpacing", rowSpec.gap);
      row.layoutSizingHorizontal = "FILL";
      row.layoutSizingVertical = "HUG";
      bottomBorder(row, rowSpec.borderBottom);
      const term = place(row, row, "TEXT", "term", 0);
      const value = place(row, row, "TEXT", "value", 1);
      styleText(term, rowSpec.term);
      styleText(value, rowSpec.value);
      hugText(term);
      hugText(value);
      retireOthers(row, [term, value]);
      return row;
    });
    retireOthers(details, rows);
  }
  const actions = place(variant, variant, "FRAME", "actions", keep.length);
  keep.push(actions);
  autoLayout(actions, spec.actionGroup.direction);
  bindPadding(actions, { ...NONE, top: spec.actionGroup.paddingTop });
  bindSpacing(actions, "itemSpacing", spec.actionGroup.gap);
  actions.layoutSizingHorizontal = "FILL";
  actions.layoutSizingVertical = "HUG";
  const buttons = spec.actionGroup.actions.map((actionSpec, index) => {
    const action = place(variant, actions, "FRAME", `action/${actionSpec.text}`, index);
    autoLayout(action, "HORIZONTAL");
    action.resize(action.width, actionSpec.height);
    action.layoutSizingHorizontal = "FILL";
    action.layoutSizingVertical = "FIXED";
    action.primaryAxisAlignItems = action.counterAxisAlignItems = "CENTER";
    bindPadding(action, actionSpec.padding);
    action.cornerRadius = actionSpec.radius;
    bindCorners(action, V.radius12);
    action.fills = [paint(actionSpec.fillPaint)];
    const label = place(action, action, "TEXT", "label", 0);
    styleText(label, actionSpec.textStyle, "center");
    hugText(label);
    retireOthers(action, [label]);
    return action;
  });
  retireOthers(actions, buttons);
  retireOthers(variant, keep);
  variant.description =
    `Measured ${spec.route} ${spec.viewport} checkout status — measured box ${spec.rect.width}×${spec.rect.height}; Auto Layout: ` +
    `width ${spec.width.mode === "FIXED" ? `declared cap ${spec.width.value}` : "fills the consumer"}, height hugs · ${PLAN.productCommit} · product-only`;
};
const contentSet = ensureSet(C.contentSetName, C.variants, contentName, buildContent, reconcileContent);
contentSet.description = `Six checkout status variants as Auto Layout: declared width, spacing and control height; text wraps with the width. ${PLAN.productCommit}. Not normative.`;
arrange(contentSet, C.variants, contentName, (spec) => spec.outcome, (spec) => spec.viewport);

// ── 메인 표면 ────────────────────────────────────────────────────────────
// 세로 Auto Layout — 폭은 마스터 기본값만 측정 main 폭(소비처 장면이 FILL), 높이는 HUG + 최소 높이
// (`min-height: calc(100dvh − …)` 를 이 뷰포트에서 푼 값 — 마스터의 뷰포트 기본 높이다). 좌우 패딩은 main 패딩에서
// 상단 바 bleed(`margin-left: calc(-1 * var(--mainchrome-bleed-left, …))`)를 뺀 값이라 상단 바는 FILL 로 카드 끝까지
// 닿는다. 본문 칸(`body`)은 bleed 만큼 좌우를 되돌리고, 위 패딩이 본문 `margin-top`(`clamp(56px, 10vh, 120px)` 을 이
// 뷰포트에서 푼 값)이며 가운데 정렬(`self-center`)이다.
const contentMaster = (spec) => {
  const value = contentSet.children.find((entry) => entry.name === contentName(spec));
  if (!value) throw new Error(`Missing checkout content ${spec.outcome}/${spec.viewport}`);
  return value;
};
const variantFor = (scene) => C.variants.find((spec) => spec.outcome === scene.outcome && spec.viewport === scene.viewport);
const mainName = (spec) => `Outcome=${spec.outcome}`;
const buildMain = (spec) => {
  const component = figma.createComponent();
  component.name = mainName(spec);
  return component;
};
const reconcileMain = (component, spec) => {
  const L = spec.layout.main;
  autoLayout(component, "VERTICAL");
  component.resize(spec.main.rect.width, component.height);
  component.counterAxisSizingMode = "FIXED";
  component.primaryAxisSizingMode = "AUTO";
  component.minHeight = L.minHeight;
  bindPadding(component, { top: L.padding.top, right: L.padding.right - L.bleed.right, bottom: L.padding.bottom, left: L.padding.left - L.bleed.left });
  bindSpacing(component, "itemSpacing", L.barGap);
  component.cornerRadius = spec.main.radius;
  bindCorners(component, V.radius16);
  component.fills = [paint(spec.main.paint)];
  component.clipsContent = true;
  setModes(component);
  const topBar = placeInstance(component, component, `top-bar/${spec.viewport}`, spec.viewport === "Desktop" ? desktopTopBarMaster : mobileTopBarMaster, 0);
  topBar.layoutSizingHorizontal = "FILL";
  if (topBar.layoutMode !== "NONE") topBar.layoutSizingVertical = "HUG";
  const body = place(component, component, "FRAME", "body", 1);
  autoLayout(body, "VERTICAL");
  body.counterAxisAlignItems = "CENTER";
  bindPadding(body, { top: L.contentTop, right: L.bleed.right, bottom: 0, left: L.bleed.left });
  body.layoutSizingHorizontal = "FILL";
  body.layoutSizingVertical = "HUG";
  const variant = variantFor(spec);
  const content = placeInstance(component, body, `content/Outcome=${spec.outcome}`, contentMaster(variant), 0);
  if (variant.width.mode === "FIXED") {
    content.resize(variant.width.value, content.height);
    content.layoutSizingHorizontal = "FIXED";
  } else {
    content.layoutSizingHorizontal = "FILL";
  }
  content.layoutSizingVertical = "HUG";
  retireOthers(body, [content]);
  retireOthers(component, [topBar, body]);
  component.description =
    `Measured ${spec.route} ${spec.viewport} main surface — measured box ${spec.main.rect.width}×${spec.main.rect.height}; ` +
    `Auto Layout with min height from calc(100dvh − …) at this viewport · ${PLAN.productCommit} · product-only`;
};
const mainSetFor = (viewport, setName) => {
  const specs = C.scenes.filter((entry) => entry.viewport === viewport);
  const set = ensureSet(setName, specs, mainName, buildMain, reconcileMain);
  set.description = `${viewport} checkout-status main surfaces as Auto Layout around nested product components. ${PLAN.productCommit}. Not normative.`;
  arrange(set, specs, mainName, (spec) => spec.outcome, () => 0);
  return set;
};
const desktopMainSet = mainSetFor("Desktop", C.desktopMainSetName);
const mobileMainSet = mainSetFor("Mobile", C.mobileMainSetName);

// ── 장면 ────────────────────────────────────────────────────────────────
// 가로 Auto Layout — 크기는 뷰포트(마스터의 뷰포트 기본값), 패딩은 셸 패딩(위 · 아래)과 main 의 좌우 margin
// (`ml-[var(--app-gnb-sidebar-width)]` · `mr-[var(--app-gnb-main-inline-padding-end)]`)이고, 메인은 폭 FILL · 높이 HUG 다.
// 사이드바는 `position: fixed` 라 흐름 밖(절대 배치, 위아래로 늘어남)이고 칠 순서를 위해 마지막 자식이다(조립 규칙 15번).
// 패딩은 셸 레이아웃 토큰이라 간격 변수에 묶지 않는다.
const sceneName = (spec) => `Outcome=${spec.outcome}`;
const buildScene = (spec) => {
  const component = figma.createComponent();
  component.name = sceneName(spec);
  return component;
};
const sceneSetFor = (viewport, setName, mainSet) => {
  const specs = C.scenes.filter((entry) => entry.viewport === viewport);
  const reconcileScene = (component, spec) => {
    const mainMaster = mainSet.children.find((entry) => entry.name === mainName(spec));
    if (!mainMaster) throw new Error(`Missing main surface ${spec.outcome}/${viewport}`);
    autoLayout(component, "HORIZONTAL");
    component.resize(spec.page.rect.width, spec.page.rect.height);
    component.primaryAxisSizingMode = component.counterAxisSizingMode = "FIXED";
    for (const [side, value] of Object.entries(spec.layout.page.padding)) {
      const field = `padding${side[0].toUpperCase()}${side.slice(1)}`;
      component[field] = value;
      component.setBoundVariable(field, null);
    }
    component.itemSpacing = 0;
    component.fills = [paint(spec.page.paint)];
    setModes(component);
    const main = placeInstance(component, component, `main/Outcome=${spec.outcome}`, mainMaster, 0);
    main.layoutSizingHorizontal = "FILL";
    main.layoutSizingVertical = "HUG";
    const keep = [main];
    if (viewport === "Desktop") {
      const gnb = placeInstance(component, component, "gnb/Current=Upgrade", gnbMaster, 1);
      gnb.layoutPositioning = "ABSOLUTE";
      gnb.x = 0;
      gnb.y = 0;
      gnb.constraints = { horizontal: "MIN", vertical: "STRETCH" };
      keep.push(gnb);
    }
    retireOthers(component, keep);
    component.description = `Measured ${spec.route} ${spec.page.rect.width}×${spec.page.rect.height} scene · ${PLAN.productCommit} · product-only`;
  };
  const set = ensureSet(setName, specs, sceneName, buildScene, reconcileScene);
  set.description = `Full ${viewport} checkout-status scenes as Auto Layout around nested product components. ${PLAN.productCommit}. Not normative.`;
  arrange(set, specs, sceneName, (spec) => spec.outcome, () => 0);
  return set;
};
const desktopSceneSet = sceneSetFor("Desktop", C.desktopSceneSetName, desktopMainSet);
const mobileSceneSet = sceneSetFor("Mobile", C.mobileSceneSetName, mobileMainSet);

// 세트는 문서 아래로 한 줄씩 쌓는다 — 높이가 HUG 라 겹치지 않게 실제 크기로 잰다.
{
  let cursor = docs.y + docs.height + gutter;
  let right = 0;
  for (const set of [contentSet, desktopMainSet, desktopSceneSet, mobileMainSet, mobileSceneSet]) {
    set.x = gutter;
    set.y = cursor;
    cursor += set.height + gutter;
    right = Math.max(right, set.x + set.width + gutter);
  }
  section.resizeWithoutConstraints(Math.max(section.width, right), Math.max(section.height, cursor));
}

// 보이는 페인트 감사 — 변수에 묶이지 않은 것은 계획의 고정 역할 색(`unboundColors`)이거나 브랜드 로고 자산이어야 한다.
// 사이드바 셸(컴포넌트 러너)은 제품 로고 SVG 를 인스턴스로 품는다 — 워드마크 잉크는 자산의 칠이다.
const paintAudit = audit([contentSet, desktopMainSet, desktopSceneSet, mobileMainSet, mobileSceneSet], {
  nested: C.nestedFixedPaints,
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
  contentComponentSetId: contentSet.id,
  contentVariantIds: contentSet.children.map((entry) => entry.id),
  desktopMainComponentSetId: desktopMainSet.id,
  desktopSceneComponentSetId: desktopSceneSet.id,
  mobileMainComponentSetId: mobileMainSet.id,
  mobileSceneComponentSetId: mobileSceneSet.id,
  colourMode,
  ...paintAudit,
};
