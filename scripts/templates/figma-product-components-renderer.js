// **선 아이콘의 획은 표시 크기를 따른다(2026-10-08).** `resize()` 는 기하만 줄이고 획을 그대로 둔다 — 32 마스터(획 2)를 20 자리에
// 놓자 사이드바 아이콘이 제품(1.25)보다 1.6 배 두꺼웠다(조립 규칙 4조 · 소유자 지적). 크기를 맞춘 뒤 마스터 획에 「표시 크기 / 마스터
// 크기」를 곱해 넣는다 — 재사용한 인스턴스도 마스터에서 다시 계산하므로 몇 번을 돌려도 같다.
const fitLineIcon = (instance, width, height = width) => {
  instance.resize(width, height);
  const master = instance.mainComponent;
  if (!master || !master.width) return instance;
  const factor = width / master.width;
  const masterParts = master.findAll((node) => "strokeWeight" in node);
  const parts = instance.findAll((node) => "strokeWeight" in node);
  parts.forEach((part, index) => {
    const source = masterParts[index];
    if (source && typeof source.strokeWeight === "number" && Array.isArray(source.strokes) && source.strokes.length > 0) {
      part.strokeWeight = source.strokeWeight * factor;
    }
  });
  return instance;
};
const P = PLAN.component;
const page =
  (await figma.getNodeByIdAsync(P.pageId)) ??
  figma.root.children.find((entry) => entry.name === P.pageName);
if (!page) throw new Error(`Missing target page ${P.pageName}`);
await figma.setCurrentPageAsync(page);

// 변수 · 모드 · 칠은 공용 조각(`scripts/templates/lib/figma-live-variables.js`, 생성기가 앞에 붙인다)이 푼다. 칠하는 자리는
// 계획이 고른 역할 이름(`paint` · `fillPaint` · `labelPaint` · `activePaint` · `menuRowPaint`)만 읽는다.
const B = P.bindings;
const { V, pin, paint, paintIcon, bindCorners, audit, resolve, mode: colourMode } = await liveVariables(B);

// **간격 · 패딩은 값이 같은 `spacing/<n>` 에 묶는다 — 값을 적는 자리와 묶는 자리를 한 함수로 둔다(2026-09-28).** 사이드바 셸이 네 패딩을
// 계획값(위 8 · 아래 0)으로 적은 뒤 넷 다 `spacing/12` 에 묶어, 라이브가 12 · 12 로 섰다 — 결합이 측정값을 덮어써 메뉴가 4 내려가고
// 업그레이드 버튼이 12 올라갔다. 결합한 변수가 측정값과 다른 수로 풀리면 던진다. 0 은 결합을 푼다.
const spacingVariable = (value) => {
  const variable = V[`spacing${value}`];
  if (!variable) throw new Error(`Missing spacing binding for ${value}`);
  if (resolve(variable) !== value) throw new Error(`${variable.name} resolves to ${resolve(variable)}, not the measured ${value}`);
  return variable;
};
const bindSpacing = (node, field, value) => {
  node[field] = value;
  node.setBoundVariable(field, value ? spacingVariable(value) : null);
};
const bindPadding = (node, padding) => {
  for (const side of ["Top", "Right", "Bottom", "Left"]) bindSpacing(node, `padding${side}`, padding[side.toLowerCase()]);
};

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
const weightStyle = { 400: "Regular", 500: "Medium", 600: "SemiBold" };
const makeText = (spec, role) => {
  const text = figma.createText();
  text.name = "label";
  text.fontName = { family: "Pretendard", style: weightStyle[spec.fontWeight] ?? "Regular" };
  text.fontSize = spec.fontSize;
  text.lineHeight = { unit: "PIXELS", value: spec.lineHeight };
  text.letterSpacing = { unit: "PIXELS", value: spec.letterSpacing };
  text.characters = spec.text;
  text.textAutoResize = "WIDTH_AND_HEIGHT";
  text.fills = [paint(role)];
  return text;
};
const makeIcon = (spec, role, active = false) => {
  const masterName = P.iconComponents[spec.asset];
  const instance = componentByName.get(masterName).createInstance();
  instance.name = "icon";
  fitLineIcon(instance, spec.rect.width, spec.rect.height);
  paintIcon(instance, role);
  instance.opacity = active ? 1 : spec.opacity;
  return instance;
};
const applyMeasuredFrame = (frame, spec, gap) => {
  frame.layoutMode = "HORIZONTAL";
  frame.primaryAxisSizingMode = "FIXED";
  frame.counterAxisSizingMode = "FIXED";
  frame.resize(spec.rect.width, spec.rect.height);
  frame.counterAxisAlignItems = "CENTER";
  bindPadding(frame, spec.padding);
  bindSpacing(frame, "itemSpacing", gap);
  frame.cornerRadius = spec.radius;
  frame.fills = [];
  if (spec.radius === 10) bindCorners(frame, V.radius10);
};
// **라벨 · 딱지 묶음.** 제품은 행 간격 10 에 딱지의 `margin-left: -2px` 를 걸어 딱지를 라벨 뒤 8 에 둔다(계획 `beta.gap`). Figma 는 자식마다
// 간격을 달리 둘 수 없으므로 둘을 그 간격의 가로 묶음으로 싼다 — 항목마다 간격이 다르면 스택을 중첩한다. 옛 러너는 딱지를 행 간격 10 에 두어
// 제품보다 2 넓었다.
const LABEL_GROUP = "flow/label-and-badge";
// **딱지는 양축 내용 크기다(크기 굳힘 감사 묶음 4).** 제품 딱지(`exploreSoonChip`)는 크기를 선언하지 않고 패딩과 글자로 선다
// (계획 `beta.padding` · `beta.label`). 위아래 패딩은 결합할 `spacing/<n>` 이 계획에 없어 값으로 둔다.
const hugBadge = (badge, beta) => {
  badge.layoutMode = "HORIZONTAL";
  badge.primaryAxisSizingMode = badge.counterAxisSizingMode = "AUTO";
  badge.paddingTop = beta.padding.top;
  badge.paddingBottom = beta.padding.bottom;
  bindSpacing(badge, "paddingLeft", beta.padding.left);
  bindSpacing(badge, "paddingRight", beta.padding.right);
};
const labelGroup = (group, gap) => {
  group.layoutMode = "HORIZONTAL";
  group.primaryAxisSizingMode = group.counterAxisSizingMode = "AUTO";
  group.counterAxisAlignItems = "CENTER";
  bindPadding(group, { top: 0, right: 0, bottom: 0, left: 0 });
  bindSpacing(group, "itemSpacing", gap);
  group.fills = [];
  group.clipsContent = false;
};

// **세트 크기는 variant 배치에서 도출한다(2026-09-15).** 세 세트 모두 variant 를 x = 여백 + 순번 × (폭 + 간격)에 놓는데,
// 세트 크기를 「폭 × 수 + 상수」로 따로 적어 두었다. 메뉴는 + 160, 셸은 + 200 이라 간격 (수 − 1) × 40 과 좌우 여백을 담지
// 못했다 — 라이브 메뉴 세트 `384:215`(variant 여섯)의 여섯째 variant 가 세트 오른쪽 밖으로 80 나가고 여백 40 이 없었고,
// 셸 세트 `392:611`(일곱)도 같았다. 세트는 놓인 variant 의 오른쪽 · 아래 끝에 같은 여백을 더한 크기다 — 식을 두 벌 두지 않는다.
const VARIANT_GUTTER = 40;
const placeVariantRow = (set, cellWidth) => {
  for (const [index, variant] of set.children.entries()) {
    variant.x = VARIANT_GUTTER + index * (cellWidth + VARIANT_GUTTER);
    variant.y = VARIANT_GUTTER;
  }
  fitSetToVariants(set);
};
const fitSetToVariants = (set) => {
  const right = Math.max(...set.children.map((variant) => variant.x + variant.width));
  const bottom = Math.max(...set.children.map((variant) => variant.y + variant.height));
  set.resizeWithoutConstraints(right + VARIANT_GUTTER, bottom + VARIANT_GUTTER);
};

if (!section) {
  const maxRight = Math.max(...page.children.map((entry) => entry.x + entry.width), 0);
  section = figma.createSection();
  section.name = P.sectionName;
  section.x = maxRight + 182;
  section.y = 0;
  section.resizeWithoutConstraints(1800, 980);
}
pin(section);
section.fills = [paint("boardSurface")];

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
  title.fills = [paint("docsTitle")];
  docs.appendChild(title);
  const note = figma.createText();
  note.name = "measurement-note";
  note.fontName = { family: "Pretendard", style: "Regular" };
  note.fontSize = 14;
  note.lineHeight = { unit: "PERCENT", value: 150 };
  note.characters = `${PLAN.productCommit.slice(0, 8)} · ${PLAN.context} · ${PLAN.sourceCandidate.nodeCount} nodes · ${PLAN.sourceCandidate.routeCount} routes · product-only candidate`;
  note.textAutoResize = "WIDTH_AND_HEIGHT";
  note.fills = [paint("docsNote")];
  docs.appendChild(note);
}
// 문서 글자 잉크도 매 실행 주석 역할로 다시 건다 — 옛 문서 프레임은 은퇴한 컬렉션 변수에 묶여 있다.
{
  const texts = docs.findAllWithCriteria({ types: ["TEXT"] });
  if (texts[0]) texts[0].fills = [paint("docsTitle")];
  if (texts[1]) texts[1].fills = [paint("docsNote")];
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
  const makeUpgrade = (spec) => {
    const component = figma.createComponent();
    component.name = `State=${spec.state}`;
    component.layoutMode = "HORIZONTAL";
    component.primaryAxisSizingMode = component.counterAxisSizingMode = "FIXED";
    component.resize(spec.rect.width, spec.rect.height);
    // 높이는 내용(패딩 + 라벨 줄)이 정한다 — 폭만 측정 rect 다(크기 굳힘 감사 묶음 4).
    component.counterAxisSizingMode = "AUTO";
    component.primaryAxisAlignItems = component.counterAxisAlignItems = "CENTER";
    bindSpacing(component, "itemSpacing", spec.gap);
    bindPadding(component, spec.padding);
    component.cornerRadius = spec.radius;
    bindCorners(component, V.radius12);
    component.fills = [paint(spec.fillPaint)];
    component.effects = makeEffects(spec.effects);
    pin(component);
    component.appendChild(makeText(spec.label, spec.labelPaint));
    component.description = `Measured ${spec.route} · ${PLAN.productCommit}`;
    return component;
  };
  const defaultSpec = C.variants.find((entry) => entry.state === "Default");
  const currentSpec = C.variants.find((entry) => entry.state === "Current");
  if (!defaultSpec || !currentSpec) throw new Error("Missing measured Upgrade CTA variants");
  const defaultCta = makeUpgrade(defaultSpec);
  const currentCta = makeUpgrade(currentSpec);
  section.appendChild(defaultCta);
  section.appendChild(currentCta);
  upgradeSet = figma.combineAsVariants([defaultCta, currentCta], section);
  upgradeSet.name = C.componentSetName;
  upgradeSet.description = `Measured Gnb CTA states · ${PLAN.productCommit}`;
  upgradeSet.fills = [];
  placeVariantRow(upgradeSet, defaultSpec.rect.width);
  upgradeSet.x = 720;
  upgradeSet.y = 680;
}
// CTA 면 · 글자는 세트가 있어도 매 실행 계획의 역할로 다시 칠한다 — 옛 세트는 은퇴한 컬렉션 변수에 묶여 있다.
// **크기도 계획에 맞춘다(2026-09-15).** CTA 는 레일 내용 폭을 채우는데(제품 `.louis-sidebar-cta__button` 의 `inline-size: 100%`)
// 옛 경로는 없을 때만 크기를 걸어, 제품 bc3e6fa3(레일 280 → 240) 뒤에도 라이브 variant 가 옛 폭으로 남을 자리였다. 크기가 다를 때만
// 쓰고(멱등) 배치와 세트 크기를 다시 도출한다. 계획에 없는 variant 는 칠도 크기도 손대지 않는다.
for (const variant of upgradeSet.children) {
  const spec = C.variants.find((entry) => variant.name === `State=${entry.state}`);
  if (!spec) continue;
  pin(variant);
  // **높이는 내용이 정한다(크기 굳힘 감사 묶음 4).** 제품 CTA 는 최소 높이만 두고 패딩 10 + 라벨 줄 21 + 10 으로 서므로 측정 rect 의
  // 높이를 굳히지 않는다 — 폭만 레일 내용 폭(측정 rect, 소비처에서는 채움)으로 쓴다.
  if (variant.width !== spec.rect.width) variant.resize(spec.rect.width, variant.height);
  variant.layoutMode = "HORIZONTAL";
  variant.primaryAxisSizingMode = "FIXED";
  variant.counterAxisSizingMode = "AUTO";
  // 패딩 · 간격도 매 실행 계획대로 건다(값이 같으면 결과가 같다) — 없을 때만 걸던 옛 경로는 측정이 옮겨도 라이브가 따라오지 않는다.
  bindPadding(variant, spec.padding);
  bindSpacing(variant, "itemSpacing", spec.gap);
  variant.fills = [paint(spec.fillPaint)];
  for (const text of variant.findAllWithCriteria({ types: ["TEXT"] })) text.fills = [paint(spec.labelPaint)];
}
placeVariantRow(upgradeSet, Math.max(...C.variants.map((spec) => spec.rect.width)));

const ensureShell = (menuSet, ctaSet) => {
  const S = P.shell;
  let shellSet = section.findOne(
    (entry) => entry.type === "COMPONENT_SET" && entry.name === S.componentSetName,
  );
  const menuByCurrent = new Map(menuSet.children.map((entry) => [entry.name.replace(/^Current=/, ""), entry]));
  const ctaByState = new Map(ctaSet.children.map((entry) => [entry.name.replace(/^State=/, ""), entry]));
  // 로고는 측정 테마의 자산이다(`logoAsset` — light fixture 는 `/klipse-light.svg`). 옛 러너는 다크 자산으로 고정했다.
  const logoMaster = componentByName.get(P.iconComponents[S.brand.image.logoAsset]);
  if (!logoMaster) throw new Error(`Missing Gnb brand master ${S.brand.image.logoAsset}`);
  const logoName = P.iconComponents[S.brand.image.logoAsset].split(" ")[0];
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
      pin(shell);
      const brand = figma.createFrame();
      brand.name = "brand/Klipse";
      brand.resize(S.brand.rect.width, S.brand.rect.height);
      brand.layoutMode = "HORIZONTAL";
      brand.primaryAxisSizingMode = brand.counterAxisSizingMode = "FIXED";
      brand.counterAxisAlignItems = "CENTER";
      bindSpacing(brand, "paddingLeft", S.brand.paddingLeft);
      bindSpacing(brand, "itemSpacing", S.brand.gap);
      brand.fills = [];
      const logo = logoMaster.createInstance();
      logo.name = logoName;
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
      pin(cta);
      shell.appendChild(cta);
      shell.description = `Measured ${spec.route} Gnb · ${PLAN.productCommit}`;
      section.appendChild(shell);
      variants.push(shell);
    }
    shellSet = figma.combineAsVariants(variants, section);
    shellSet.name = S.componentSetName;
    shellSet.description = `Measured desktop Gnb composition · ${PLAN.productCommit}`;
    shellSet.fills = [];
    placeVariantRow(shellSet, S.root.width);
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
    logo.name = logoName;
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
    // **묶음 · 브랜드 · 메뉴 · CTA 는 측정 rect 로 굳히지 않는다(크기 굳힘 감사 묶음 4).** 폭은 셸 내용 폭을 채우고(FILL), 높이는
    // 내용이 정한다(HUG) — 브랜드 행만 제품이 선언한 높이(측정 rect)다. 채움은 셸이 세로 오토레이아웃이 된 뒤 아래에서 건다.
    top.primaryAxisSizingMode = "AUTO";
    bindSpacing(top, "itemSpacing", S.menu.y - (S.brand.rect.y + S.brand.rect.height));
    top.fills = [];
    if (brand.height !== S.brand.rect.height) brand.resize(brand.width, S.brand.rect.height);
    bindSpacing(brand, "paddingLeft", S.brand.paddingLeft);
    bindSpacing(brand, "itemSpacing", S.brand.gap);
    const expectedMenuMaster = menuByCurrent.get(spec.menuCurrent);
    if (!expectedMenuMaster) throw new Error(`Missing measured menu state ${spec.menuCurrent}`);
    if (menu.mainComponent?.id !== expectedMenuMaster.id) menu.swapComponent(expectedMenuMaster);
    menu.name = `menu · Current=${spec.menuCurrent}`;
    const expectedCtaMaster = ctaByState.get(spec.ctaState);
    if (!expectedCtaMaster) throw new Error(`Missing measured CTA state ${spec.ctaState}`);
    if (cta.mainComponent?.id !== expectedCtaMaster.id) cta.swapComponent(expectedCtaMaster);
    cta.name = `upgrade-cta · State=${spec.ctaState}`;
    pin(cta);
    shell.layoutMode = "VERTICAL";
    pin(shell);
    shell.primaryAxisSizingMode = shell.counterAxisSizingMode = "FIXED";
    shell.resize(S.root.width, S.root.height);
    shell.primaryAxisAlignItems = "SPACE_BETWEEN";
    shell.counterAxisAlignItems = "CENTER";
    // 제품 헤더 패딩은 위 8(`--app-gnb-safe-top`) · 좌우 12 · 아래 0 이고 CTA 가 레일 끝에 닿는다(측정 y 1039 + 41 = 1080).
    bindPadding(shell, S.root.padding);
    top.layoutSizingHorizontal = "FILL";
    brand.layoutSizingHorizontal = "FILL";
    brand.layoutSizingVertical = "FIXED";
    menu.layoutSizingHorizontal = "FILL";
    menu.layoutSizingVertical = "HUG";
    cta.layoutSizingHorizontal = "FILL";
    cta.layoutSizingVertical = "HUG";
    shell.fills = [];
    shell.description = `Measured ${spec.route} Gnb Auto Layout · ${PLAN.productCommit}`;
    shell.x = VARIANT_GUTTER + index * (S.root.width + VARIANT_GUTTER);
    shell.y = VARIANT_GUTTER;
  }
  fitSetToVariants(shellSet);
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
  }
  pin(resultSection);
  resultSection.fills = [paint("boardSurface")];
  // **세트가 있어도 매 실행 제자리에서 reconcile 한다(2026-09-14, 크기 굳힘 감사 묶음 2).** 옛 러너는 세트가 있으면
  // 행 하나만 손보고 돌아가, 처음 지을 때 박은 절대배치(`textAutoResize NONE` + 측정 rect + x/y)가 영영 남았다.
  // 이제 variant 는 세로 Auto Layout 이다 — 높이 HUG, 폭은 계획의 `width`(데스크톱은 선언 상한 520 FIXED,
  // 모바일은 `100%` 라 기본값만 측정 부모 폭이고 소비처가 FILL), 글자는 FILL + 높이 자동, 버튼 줄은 세로 쌓임
  // (`flex-wrap` + 버튼마다 `width: 100%`), 버튼은 폭 FILL · 높이 선언값 FIXED. **지우지 않는다** — 옛 노드
  // (`title` · `body` · `detail/error-code` · `action/…` · `label`)를 같은 id 로 새 자리에 옮기고, 계획에 없는
  // 자식은 숨겨 `retired/` 로 이름만 바꾼다. 인스턴스가 그 노드에 건 override 가 끊기지 않게 하기 위해서다.
  const variantName = (spec) => `Outcome=${spec.outcome}, Viewport=${spec.viewport}`;
  const newNode = (type, name) => {
    const node = type === "TEXT" ? figma.createText() : figma.createFrame();
    node.name = name;
    if (type === "TEXT") node.fontName = { family: "Pretendard", style: "Regular" };
    else node.fills = [];
    return node;
  };
  const buildResult = (spec) => {
    const component = figma.createComponent();
    component.name = variantName(spec);
    component.appendChild(newNode("TEXT", "title"));
    component.appendChild(newNode("TEXT", "body"));
    if (spec.detail) {
      const detail = newNode("FRAME", "detail/error-code");
      detail.appendChild(newNode("TEXT", "term"));
      detail.appendChild(newNode("TEXT", "value"));
      component.appendChild(detail);
    }
    const actions = newNode("FRAME", "actions");
    const action = newNode("FRAME", `action/${spec.action.label.text}`);
    action.appendChild(newNode("TEXT", "label"));
    actions.appendChild(action);
    component.appendChild(actions);
    return component;
  };
  // 같은 이름의 노드를 **그 variant 어디에서든** 찾아(옛 구조에서는 버튼이 variant 직계였다) 새 부모의 제자리로 옮긴다.
  const place = (scope, parent, type, name, index) => {
    const node = scope.findOne((entry) => entry.type === type && entry.name === name) ?? newNode(type, name);
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
  const styleText = (text, spec) => {
    text.fontName = { family: "Pretendard", style: weightStyle[spec.fontWeight] ?? "Regular" };
    text.fontSize = spec.fontSize;
    text.lineHeight = { unit: "PIXELS", value: spec.lineHeight };
    text.letterSpacing = { unit: "PIXELS", value: spec.letterSpacing };
    if (text.characters !== spec.text) text.characters = spec.text;
    text.textAlignHorizontal = spec.textAlign === "right" ? "RIGHT" : spec.textAlign === "center" ? "CENTER" : "LEFT";
    text.fills = [paint(spec.paint)];
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
  const reconcileResult = (variant, spec) => {
    autoLayout(variant, "VERTICAL");
    variant.resize(spec.width.value, variant.height);
    variant.counterAxisSizingMode = "FIXED";
    variant.primaryAxisSizingMode = "AUTO";
    bindPadding(variant, { top: 0, right: 0, bottom: 0, left: 0 });
    bindSpacing(variant, "itemSpacing", spec.gap);
    pin(variant);
    const keep = [];
    const title = place(variant, variant, "TEXT", "title", keep.length);
    keep.push(title);
    styleText(title, spec.title);
    title.layoutSizingHorizontal = "FILL";
    title.textAutoResize = "HEIGHT";
    const body = place(variant, variant, "TEXT", "body", keep.length);
    keep.push(body);
    styleText(body, spec.body);
    body.layoutSizingHorizontal = "FILL";
    body.textAutoResize = "HEIGHT";
    if (spec.detail) {
      const D = spec.detail;
      const detail = place(variant, variant, "FRAME", "detail/error-code", keep.length);
      keep.push(detail);
      // 제품 행: 데스크톱 `flex justify-between items-center`, ≤900 은 `flex-col` 로 가운데 정렬한 두 줄.
      // Figma 의 SPACE_BETWEEN 은 itemSpacing 을 버린다(남는 자리가 없는 HUG 축에서는 간격이 0 이 된다). 세로 행은
      // 높이가 HUG 라 남는 자리가 없으므로 CSS `gap` 을 itemSpacing 으로 살리고, 폭을 채우는 가로 행만 양끝 정렬한다.
      autoLayout(detail, D.direction === "column" ? "VERTICAL" : "HORIZONTAL");
      detail.primaryAxisAlignItems = D.justifyContent === "space-between" && D.direction !== "column" ? "SPACE_BETWEEN" : "MIN";
      detail.counterAxisAlignItems = D.alignItems === "center" ? "CENTER" : "MIN";
      bindPadding(detail, D.padding);
      bindSpacing(detail, "itemSpacing", D.gap);
      detail.layoutSizingHorizontal = "FILL";
      detail.layoutSizingVertical = "HUG";
      const term = place(detail, detail, "TEXT", "term", 0);
      const value = place(detail, detail, "TEXT", "value", 1);
      styleText(term, D.term);
      styleText(value, D.value);
      for (const text of [term, value]) text.textAutoResize = "WIDTH_AND_HEIGHT";
      retireOthers(detail, [term, value]);
    }
    const actions = place(variant, variant, "FRAME", "actions", keep.length);
    keep.push(actions);
    autoLayout(actions, spec.actions.direction);
    bindPadding(actions, { top: spec.actions.paddingTop, right: 0, bottom: 0, left: 0 });
    bindSpacing(actions, "itemSpacing", spec.actions.gap);
    actions.layoutSizingHorizontal = "FILL";
    actions.layoutSizingVertical = "HUG";
    const action = place(variant, actions, "FRAME", `action/${spec.action.label.text}`, 0);
    autoLayout(action, "HORIZONTAL");
    action.resize(action.width, spec.action.height);
    action.layoutSizingHorizontal = "FILL";
    action.layoutSizingVertical = "FIXED";
    action.primaryAxisAlignItems = action.counterAxisAlignItems = "CENTER";
    bindPadding(action, spec.action.padding);
    action.cornerRadius = spec.action.radius;
    bindCorners(action, V.radius12);
    action.fills = [paint(spec.action.fillPaint)];
    const label = place(action, action, "TEXT", "label", 0);
    styleText(label, spec.action.label);
    label.textAutoResize = "WIDTH_AND_HEIGHT";
    retireOthers(action, [label]);
    retireOthers(actions, [action]);
    retireOthers(variant, keep);
    variant.description =
      `Measured ${spec.route} ${spec.viewport} result content — measured box ${spec.rect.width}×${spec.rect.height}; ` +
      `Auto Layout: width ${spec.width.mode === "FIXED" ? `declared cap ${spec.width.value}` : "fills the consumer"}, height hugs · ${PLAN.productCommit}`;
  };
  let resultSet = resultSection.findOne(
    (entry) => entry.type === "COMPONENT_SET" && entry.name === R.componentSetName,
  );
  if (!resultSet) {
    const built = R.variants.map(buildResult);
    for (const component of built) resultSection.appendChild(component);
    resultSet = figma.combineAsVariants(built, resultSection);
    resultSet.name = R.componentSetName;
  } else {
    for (const spec of R.variants) {
      if (!resultSet.children.some((entry) => entry.name === variantName(spec))) resultSet.appendChild(buildResult(spec));
    }
  }
  const specByName = new Map(R.variants.map((spec) => [variantName(spec), spec]));
  for (const variant of resultSet.children) {
    const spec = specByName.get(variant.name);
    if (!spec) throw new Error(`Unexpected payment result variant ${variant.name}`);
    reconcileResult(variant, spec);
  }
  resultSet.description = `Measured result content · Auto Layout (hug height) · ${PLAN.productCommit}`;
  resultSet.fills = [];
  // 캔버스 배치 — 열은 결과, 행은 뷰포트. 높이가 HUG 라 칸 크기는 reconcile 뒤의 실제 크기에서 잰다.
  const gutter = 40;
  const columns = [...new Set(R.variants.map((spec) => spec.outcome))];
  const rows = [...new Set(R.variants.map((spec) => spec.viewport))];
  const cell = (spec) => resultSet.children.find((entry) => entry.name === variantName(spec));
  const columnSpan = columns.map((column) => Math.max(...R.variants.filter((spec) => spec.outcome === column).map((spec) => cell(spec).width)));
  const rowSpan = rows.map((row) => Math.max(...R.variants.filter((spec) => spec.viewport === row).map((spec) => cell(spec).height)));
  const offset = (spans, index) => gutter + spans.slice(0, index).reduce((sum, span) => sum + span + gutter, 0);
  for (const spec of R.variants) {
    const variant = cell(spec);
    variant.x = offset(columnSpan, columns.indexOf(spec.outcome));
    variant.y = offset(rowSpan, rows.indexOf(spec.viewport));
  }
  resultSet.resizeWithoutConstraints(offset(columnSpan, columns.length), offset(rowSpan, rows.length));
  resultSet.x = gutter;
  resultSet.y = gutter * 2;
  if (resultSection.width < resultSet.x + resultSet.width + gutter || resultSection.height < resultSet.y + resultSet.height + gutter) {
    resultSection.resizeWithoutConstraints(
      Math.max(resultSection.width, resultSet.x + resultSet.width + gutter),
      Math.max(resultSection.height, resultSet.y + resultSet.height + gutter),
    );
  }
  return resultSet;
};

// **행 구조도 매 실행 계획에 맞춘다(2026-09-14, 조립 규칙 28번).** 제품 `658ece13` 이 Canvas · Composition 행의 + 버튼을
// 걷어 계획은 두 행을 simple(아이콘 · 라벨)로 싣는데, 그 전에 지은 라이브 세트의 두 행은 여전히
// `main-action`(아이콘 · 라벨 감싸개) + `add-action · …`(+ 버튼) 이다. 칠만 다시 걸면 제품에 없는 + 버튼이 variant 마다
// 둘씩 보인 채 남는다(칠이 묶여 있어 감사도 통과한다). 그래서 계획 행의 자식(아이콘 · 라벨 · 스페이서 · BETA 칩)을 같은 id 로
// 행의 직계 제자리에 옮기고, 계획에 없는 자식(`main-action` · `add-action · …`)과 계획에 없는 행은 **지우지 않고** 숨겨
// `retired/` 로 이름만 바꾼다 — 인스턴스의 override 가 그 노드 id 에 걸려 있다. 행의 패딩 · 아이콘–라벨 간격 · 크기는 매 실행
// 계획대로 건다(2026-09-28 — 전에는 감싸개에서 꺼낼 때만 간격을 걸어 옛 패딩이 남았다).
const menuRowName = (spec) => `row/${spec.label.text}`;
const retire = (node) => {
  if (!node.name.startsWith("retired/")) node.name = `retired/${node.name}`;
  node.visible = false;
};
// **행 라벨 글자도 계획에 맞춘다(2026-09-15).** 제품 개명(VideoEditor → Composition) 뒤 행 이름은 `row/Composition` 으로 바뀌었지만
// 이 경로는 라벨 노드를 옮기고 칠만 다시 걸어, 라이브 메뉴 세트 `384:215` 의 variant 여섯이 모두 「VideoEditor」를 보이고 있었다.
// 글자가 계획과 다를 때만 그 노드의 **현재** 글꼴을 싣고 바꾼다(같으면 쓰지 않는다 — 멱등). 바꾼 자리는 `menuLabelChanges` 로 돌려준다.
const menuLabelChanges = [];
const reconcileLabel = async (variant, row, text, want) => {
  if (text.characters === want) return;
  const segments = text.characters.length > 0 ? text.getStyledTextSegments(["fontName"]).map((segment) => segment.fontName) : [text.fontName];
  const fonts = new Map(segments.map((font) => [`${font.family} · ${font.style}`, font]));
  await Promise.all([...fonts.values()].map((font) => figma.loadFontAsync(font)));
  menuLabelChanges.push({ variant: variant.name, row: row.name, from: text.characters, to: want });
  text.characters = want;
};
const reconcileMenuRow = async (variant, row, spec) => {
  // 자식은 행 직계 · 옛 `main-action` 감싸개 · 라벨 묶음 어디에 있든 같은 id 로 찾아 제자리로 옮긴다.
  const holders = [row, ...row.children.filter((entry) => entry.type === "FRAME" && (entry.name === "main-action" || entry.name === LABEL_GROUP))];
  const find = (type, name) => {
    for (const holder of holders) {
      const node = holder.children.find((entry) => entry.type === type && entry.name === name);
      if (node) return node;
    }
    throw new Error(`Missing ${type} ${name} in Gnb menu ${row.name}`);
  };
  const place = (parent, node, index) => {
    if (node.parent?.id !== parent.id || parent.children.findIndex((entry) => entry.id === node.id) !== index) parent.insertChild(index, node);
    node.visible = true;
    return node;
  };
  const label = find("TEXT", "label");
  // **기존 행의 아이콘도 계획대로 맞춘다(2026-10-08).** 이 경로는 세트가 이미 있을 때 타는데, 예전에는 아이콘 인스턴스를 그대로 둬
  // 마스터 교체(캔버스 · 컴포지션 → icon/Canvas · icon/FilmSlate)와 획 맞춤(32 마스터 획 2 → 20 자리 1.25)이 닿지 않았다.
  // 색은 아래 reconcileMenuVariants 가 매 실행 다시 칠한다.
  const icon = find("INSTANCE", "icon");
  const iconMaster = componentByName.get(P.iconComponents[spec.icon.asset]);
  if (!iconMaster) throw new Error(`Missing icon master for ${spec.icon.asset} in Gnb menu ${row.name}`);
  if (icon.mainComponent?.id !== iconMaster.id) icon.swapComponent(iconMaster);
  // swapComponent 는 옛 아이콘 벡터의 칠 · 획 덮어쓰기를 같은 자리의 새 벡터에 옮긴다 — 옛 집 아이콘의 면 칠이 캔버스의 외곽 사각형을
  // 메워 검은 네모로 보였다(LOUIS 캡처, 2026-10-08). 칠 · 획의 «있고 없음»은 매 실행 마스터에서 다시 가져온다(색은 아래에서 다시 칠한다).
  const iconMasterParts = iconMaster.findAll((node) => "fills" in node && "strokes" in node);
  icon.findAll((node) => "fills" in node && "strokes" in node).forEach((part, index) => {
    const source = iconMasterParts[index];
    if (!source || !Array.isArray(source.fills) || !Array.isArray(source.strokes)) return;
    part.fills = source.fills.map((entry) => ({ ...entry }));
    part.strokes = source.strokes.map((entry) => ({ ...entry }));
  });
  fitLineIcon(icon, spec.icon.rect.width, spec.icon.rect.height);
  const keep = [place(row, icon, 0)];
  if (spec.kind === "highlight") {
    // 딱지는 라벨 바로 뒤 8 이다(제품 658ece13 · 계획 `beta.gap`) — 둘을 그 간격의 묶음으로 싼다. 옛 spacer 는 keep 에 없어 retired/ 로 숨는다.
    let group = row.children.find((entry) => entry.type === "FRAME" && entry.name === LABEL_GROUP);
    if (!group) {
      group = figma.createFrame();
      group.name = LABEL_GROUP;
    }
    place(row, group, 1);
    labelGroup(group, spec.beta.gap);
    place(group, label, 0);
    hugBadge(place(group, find("FRAME", "badge/BETA"), 1), spec.beta);
    keep.push(group);
  } else {
    keep.push(place(row, label, 1));
  }
  // **행 패딩 · 간격은 매 실행 계획대로 건다(2026-09-28).** 옛 경로는 감싸개에서 꺼낼 때만 간격을 걸고 패딩은 손대지 않아, 옛 행의 왼쪽
  // 패딩 4(`spacing/4`)가 제품 8 대신 남았다 — 데스크톱 보드 27장의 사이드바 글자가 제품보다 4 왼쪽에 섰다.
  bindPadding(row, spec.padding);
  bindSpacing(row, "itemSpacing", spec.label.rect.x - spec.icon.rect.x - spec.icon.rect.width);
  const keepIds = new Set(keep.map((node) => node.id));
  for (const child of [...row.children]) if (!keepIds.has(child.id)) retire(child);
  // **행 폭은 레일 내용 폭을 채운다(FILL, 크기 굳힘 감사 묶음 4).** 측정 rect 로 굳히면 레일이 바뀔 때(제품 bc3e6fa3, 280 → 240)
  // 생성기를 다시 돌려야 따라왔다. 높이는 제품이 선언한 행 높이라 측정 rect 그대로 둔다.
  if (row.height !== spec.rect.height) row.resize(row.width, spec.rect.height);
  row.layoutSizingHorizontal = "FILL";
  row.layoutSizingVertical = "FIXED";
  await reconcileLabel(variant, row, label, spec.label.text);
};

const reconcileMenuVariants = async (menuSet) => {
  const defaultVariant = menuSet.children.find((entry) => entry.name === "Current=Default");
  if (!defaultVariant) throw new Error("Missing default Gnb menu variant");
  for (const spec of P.variants) {
    if (menuSet.children.some((entry) => entry.name === `Current=${spec.current}`)) continue;
    const clone = defaultVariant.clone();
    clone.name = `Current=${spec.current}`;
    menuSet.appendChild(clone);
  }
  const specByName = new Map(P.variants.map((spec) => [`Current=${spec.current}`, spec]));
  const rowSpecByName = new Map(P.rows.map((spec) => [menuRowName(spec), spec]));
  for (const [index, variant] of menuSet.children.entries()) {
    const spec = specByName.get(variant.name);
    if (!spec) throw new Error(`Unexpected Gnb menu variant ${variant.name}`);
    pin(variant);
    for (const row of [...variant.children]) {
      if (row.name.startsWith("retired/")) continue;
      const rowSpec = row.type === "FRAME" ? rowSpecByName.get(row.name) : null;
      if (rowSpec) await reconcileMenuRow(variant, row, rowSpec);
      else retire(row);
    }
    // 행 · 칩 · 섹션 라벨은 매 실행 계획의 역할로 다시 칠한다. 제품 사이드바의 활성 행은 면이 없다(`menuRowPaint.activeSurface`).
    const R = P.menuRowPaint;
    for (const row of variant.children.filter((entry) => entry.type === "FRAME" && entry.name.startsWith("row/"))) {
      const active = spec.activeRow && row.name === `row/${spec.activeRow}`;
      row.fills = [];
      const label = row.findOne((entry) => entry.type === "TEXT" && entry.name === "label");
      const icon = row.findOne((entry) => entry.type === "INSTANCE" && entry.name === "icon");
      if (label) label.fills = [paint(active ? spec.activePaint : R.label)];
      if (icon) {
        paintIcon(icon, active ? spec.activePaint : R.icon);
        icon.opacity = active ? (spec.activeIconOpacity ?? 1) : R.iconOpacity;
      }
      const badge = row.findOne((entry) => entry.type === "FRAME" && entry.name.startsWith("badge/"));
      const beta = P.rows.find((entry) => entry.beta)?.beta;
      if (badge && beta) {
        badge.fills = [paint(beta.paint)];
        for (const text of badge.findAllWithCriteria({ types: ["TEXT"] })) text.fills = [paint(beta.label.paint)];
      }
    }
    // **variant 높이는 행이 정한다(HUG, 크기 굳힘 감사 묶음 4).** 행 수가 바뀌면(제품 2c6bdacf 가 「분석」 아이브로우 행을 걷었다)
    // 따라온다. 폭은 레일 내용 폭(측정 rect, 소비처에서는 채움)이다.
    if (variant.width !== P.root.width) variant.resize(P.root.width, variant.height);
    variant.primaryAxisSizingMode = "AUTO";
    variant.x = VARIANT_GUTTER + index * (P.root.width + VARIANT_GUTTER);
    variant.y = VARIANT_GUTTER;
  }
  fitSetToVariants(menuSet);
};

// 보이는 페인트 감사 — 네 세트의 칠은 전부 역할로 칠했다. 묶이지 않은 것은 계획의 고정 역할 색(`unboundColors`)이거나
// 브랜드 로고 자산(워드마크 잉크는 자산의 칠이다)이어야 한다.
const auditSets = (sets) => ({
  colourMode,
  ...audit(sets, {
    allow: (node) => {
      for (let ancestor = node; ancestor && ancestor.type !== "SECTION"; ancestor = ancestor.parent) {
        if (/^logo\/klipse-(light|dark)\b/.test(ancestor.name)) return "brandLogo";
      }
      return null;
    },
  }),
});
if (existingSet) {
  await reconcileMenuVariants(existingSet);
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
    menuLabelChanges,
    ...auditSets([existingSet, upgradeSet, shellSet, resultSet]),
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
pin(root);

for (const spec of P.rows) {
  // 섹션 라벨 행(「분석」 아이브로우)은 짓지 않는다 — 제품 `2c6bdacf` 가 걷어 계획이 싣지 않는다. 그 전에 지은 라이브 세트의
  // `section/Analytics` 행은 `reconcileMenuVariants` 가 계획에 없는 행으로 보고 `retired/` 로 숨긴다(지우지 않는다).
  // compound 행(+ 버튼 감싸개)은 짓지 않는다 — 제품 `658ece13` 이 + 버튼을 걷어 계획이 simple 로 싣는다. 그 전에 지은
  // 라이브 세트의 옛 compound 행은 `reconcileMenuRow` 가 같은 id 로 풀고 + 버튼을 `retired/` 로 숨긴다.
  if (spec.kind !== "simple" && spec.kind !== "highlight") throw new Error(`Unexpected Gnb menu row kind ${spec.kind}`);
  const gap = spec.label.rect.x - spec.icon.rect.x - spec.icon.rect.width;
  const row = figma.createFrame();
  row.name = `row/${spec.label.text}`;
  applyMeasuredFrame(row, spec, gap);
  row.appendChild(makeIcon(spec.icon, spec.icon.paint));
  const label = makeText(spec.label, spec.label.paint);
  if (spec.kind === "highlight") {
    // 딱지는 라벨 바로 뒤 8 이다(제품 658ece13 · 계획 `beta.gap`) — 라벨과 함께 그 간격의 묶음에 넣는다. 행 끝으로 밀던 spacer 는 짓지 않는다.
    const group = figma.createFrame();
    group.name = LABEL_GROUP;
    row.appendChild(group);
    labelGroup(group, spec.beta.gap);
    group.appendChild(label);
    const badge = figma.createFrame();
    badge.name = "badge/BETA";
    hugBadge(badge, spec.beta);
    badge.primaryAxisAlignItems = badge.counterAxisAlignItems = "CENTER";
    badge.cornerRadius = spec.beta.radius;
    bindCorners(badge, V.radius6);
    badge.fills = [paint(spec.beta.paint)];
    badge.appendChild(makeText(spec.beta.label, spec.beta.label.paint));
    group.appendChild(badge);
  } else {
    row.appendChild(label);
  }
  root.appendChild(row);
  row.layoutSizingHorizontal = "FILL";
}
root.primaryAxisSizingMode = "AUTO";
root.description = `Measured · ${PLAN.productCommit} · ${PLAN.sourceCandidate.id}`;
section.appendChild(root);

const activate = (variant, variantSpec) => {
  const row = variant.findOne((entry) => entry.name === `row/${variantSpec.activeRow}`);
  const text = row?.findOne((entry) => entry.type === "TEXT" && entry.name === "label");
  const icon = row?.findOne((entry) => entry.type === "INSTANCE" && entry.name === "icon");
  if (!row || !text || !icon) throw new Error(`Cannot activate ${variantSpec.activeRow}`);
  text.fills = [paint(variantSpec.activePaint)];
  paintIcon(icon, variantSpec.activePaint);
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
placeVariantRow(componentSet, P.root.width);
componentSet.x = 720;
componentSet.y = 270;
await reconcileMenuVariants(componentSet);
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
  menuLabelChanges,
  ...auditSets([componentSet, upgradeSet, shellSet, resultSet]),
};
