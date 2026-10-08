const F = PLAN.figma;
const page = await figma.getNodeByIdAsync(F.pageId);
if (!page || page.type !== "PAGE") throw new Error("Missing product assets page");
await figma.setCurrentPageAsync(page);
// **찾기가 먼저, 쓰기는 그 뒤다(2026-09-15).** 옛 러너는 접힌 CTA 마스터 · 레일 세트의 칠을 먼저 쓰고 나서야 편집 장면의
// 옛 노드 id(옛 레일 · 옛 헤더 · breadcrumb · 액션 · 프로필 원본)를 찾았다. 그 노드들은 2026-08-24 라이브 교체 뒤로 파일에
// 없어, 적용하면 세트를 칠한 채 「Missing video editor scene targets」로 던질 자리였다(부분 적용). 이제 이 러너는
//   1. 쓰기 없이 필요한 대상을 **전부** 찾는다. 하나라도 없거나 둘이면 여기서 던진다.
//   2. 그 뒤에만 칠하고 짓고 옮긴다.
// **편집 장면(보드 `39:3`)은 이 러너가 고치지 않는다(2026-10-08).** 앱 화면 생성기(`build-figma-app-screens` →
// `figma/app-screens.videoeditor--projectId-.desktop.00.draw.js`, 계획 runners 의 frameId `39:3`)가 그 보드를 측정으로 다시
// 그리며 손 조립 장면을 숨긴 `legacy//videoeditor/[projectId]` 묶음으로 넣었다. 이 러너가 그 보드에서 메인 카드 · 격자를 찾자
// 찾기 단계에서 던져 세트(레일 획 맞춤 포함)가 영영 갱신되지 않았다. 이제 이 러너는 세트 · 마스터만 짓고 고친다 — 보드는 앱 화면
// 생성기가 소유한다.
// 새로 짓는 경로가 남은 것은 세트 · variant · 마스터 · 인스턴스뿐이다(원본이 필요 없다). 편집기 상단 바 컴포넌트는 원본
// (옛 헤더의 breadcrumb · 액션 · 프로필)을 복제해 지었으므로 원본이 사라진 지금 새로 지을 수 없다 — 없으면 던진다.
//
// 변수 · 모드 · 칠은 공용 조각(`scripts/templates/lib/figma-live-variables.js`, 생성기가 앞에 붙인다)이 푼다. 이 측정은 다크
// 문맥이라 계획의 `bindings.mode` 가 `Dark` 다. 칠하는 자리는 역할 이름(`F.paints`)만 읽는다.
// **그 모드는 측정 섹션(`F.sectionName`)에만 건다(2026-09-22).** 마스터 · variant · 인스턴스에 건 명시 모드는 인스턴스로 번져
// 놓인 자리의 모드를 이긴다 — 옛 러너가 상단 바 마스터에 Dark 를 걸자 라이트 보드 `39:3` 안 인스턴스의 글자가 흰색이 됐다.
// 이제 러너는 전에 자기가 걸었던 명시 모드를 걷고(`unpin` — 이 컬렉션만, 다른 override 는 건드리지 않는다), 마스터는 섹션의
// 모드로 미리보기되고 인스턴스는 놓인 보드의 모드를 따른다. 생성기가 `pin` 이 섹션 밖을 가리키면 멈춘다.
const { pin, paint, collections } = await liveVariables(F.bindings);
const found = (list, label) => {
  if (list.length > 1) throw new Error(`Ambiguous ${label}: ${list.map((entry) => `${entry.id} ${entry.name}`).join(" · ")}`);
  return list[0] ?? null;
};
const need = (node, label) => {
  if (!node) throw new Error(`Missing ${label}`);
  return node;
};

// ── 1. 찾기(쓰기 없음) ───────────────────────────────────────────────────────────────
const componentByName = new Map();
for (const component of page.findAllWithCriteria({ types: ["COMPONENT"] })) {
  if (!componentByName.has(component.name)) componentByName.set(component.name, component);
}
const icons = {};
// 키는 계획의 `iconComponents` 이름이다 — 제품이 NodeCanvas · VideoEditor 를 Canvas · Composition 으로 개명한 뒤(2026-09-10
// 재고정) 렌더러가 옛 키를 찾아 첫머리에서 던지고 있었다.
for (const key of ["Search", "Home", "Canvas", "Composition", "Highlight", "YouTube", "logo", "expand"]) {
  icons[key] = need(componentByName.get(F.iconComponents[key]), `component ${F.iconComponents[key]}`);
}
const upgradeSet = page.findOne((entry) => entry.type === "COMPONENT_SET" && entry.name === "Product/Gnb Upgrade CTA");
need(upgradeSet?.children.find((entry) => entry.type === "COMPONENT" && entry.name === F.iconComponents.upgrade), "measured white Upgrade CTA");
await figma.loadFontAsync({ family: "Pretendard", style: "Medium" });
const existingCollapsedMaster = found(
  page.findAll((entry) => entry.type === "COMPONENT" && entry.name === F.collapsedUpgradeMasterName),
  `component ${F.collapsedUpgradeMasterName}`,
);
let railSet = found(page.findAll((entry) => entry.type === "COMPONENT_SET" && entry.name === F.componentSetName), `component set ${F.componentSetName}`);
// 측정 섹션 — 페이지 직속. 이미 있으면 측정 모드 밖의 명시 모드(다른 컬렉션 · 다른 모드)가 없어야 한다. 있으면 누가 건 것인지
// 모르므로 덮지 않고 던진다.
const modeCollection = need(collections.find((entry) => entry.name === F.bindings.modeCollection), `collection ${F.bindings.modeCollection}`);
const measuredMode = need(modeCollection.modes.find((entry) => entry.name === F.bindings.mode), `mode ${F.bindings.modeCollection}/${F.bindings.mode}`);
const existingSection = found(page.children.filter((entry) => entry.type === "SECTION" && entry.name === F.sectionName), `section ${F.sectionName}`);
if (existingSection) {
  const foreign = Object.entries(existingSection.explicitVariableModes).filter(([collectionId, modeId]) => collectionId !== modeCollection.id || modeId !== measuredMode.modeId);
  if (foreign.length) throw new Error(`Section ${existingSection.id} ${F.sectionName} already carries another explicit mode: ${foreign.map((entry) => entry.join("=")).join(" · ")}`);
}

const topBar = need(
  found(page.findAll((entry) => entry.type === "COMPONENT" && entry.name === F.topBarName), `component ${F.topBarName}`),
  `component ${F.topBarName} — its breadcrumb · actions · profile sources are retired, so this runner does not build it`,
);
const child = (parent, predicate, label) => need(found(parent.children.filter(predicate), `${label} in ${parent.name}`), `${label} in ${parent.name}`);
const leadingCluster = child(topBar, (entry) => entry.type === "FRAME" && entry.name === "mainChromeLeadingCluster", "leading cluster");
const breadcrumbNode = child(topBar, (entry) => entry.name.startsWith("breadcrumb/"), "breadcrumb");
const profileCluster = child(topBar, (entry) => entry.type === "FRAME" && entry.name === "mainChromeProfileCluster", "profile cluster");
if (breadcrumbNode.type === "TEXT") {
  // 글자 크기 속성(textAutoResize · 말줄임)도 글꼴이 없으면 쓰지 못한다 — 쓰기 전에 그 노드의 현재 글꼴을 싣는다.
  const fonts = new Map(breadcrumbNode.getStyledTextSegments(["fontName"]).map((segment) => [`${segment.fontName.family} · ${segment.fontName.style}`, segment.fontName]));
  await Promise.all([...fonts.values()].map((font) => figma.loadFontAsync(font)));
}

// ── 2. 쓰기 ──────────────────────────────────────────────────────────────────────────
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
const recolor = (node, role) => {
  for (const field of ["fills", "strokes"]) {
    if (field in node && Array.isArray(node[field])) {
      node[field] = node[field].map((entry) => (entry.type === "SOLID" ? { ...paint(role), visible: entry.visible !== false } : entry));
    }
  }
  if ("children" in node) for (const entry of node.children) recolor(entry, role);
};
const fixed = (node, width, height) => {
  node.resize(width, height);
  if ("primaryAxisSizingMode" in node) node.primaryAxisSizingMode = "FIXED";
  if ("counterAxisSizingMode" in node) node.counterAxisSizingMode = "FIXED";
};
// 러너가 전에 건 명시 모드를 걷는다 — 이 컬렉션의 것만, 걸려 있을 때만(resetOverrides 가 아니다 — 다른 override 는 그대로다).
const unpin = (node) => {
  if (node.explicitVariableModes[modeCollection.id] !== undefined) node.clearExplicitVariableModeForCollection(modeCollection);
};
// 측정 섹션을 찾거나 짓는다 — 자리 규칙은 형제 세트 러너(체크아웃 · 결제 장면 · 업그레이드)와 같다: 페이지 맨 오른쪽 끝 + 182, 위 0.
// 측정 모드는 여기에만 건다. 칠은 주석 역할(board canvas)이라 섹션의 모드로 풀린다.
let measuredSection = existingSection;
if (!measuredSection) {
  measuredSection = figma.createSection();
  measuredSection.name = F.sectionName;
  measuredSection.x = Math.max(...page.children.filter((entry) => entry !== measuredSection).map((entry) => entry.x + entry.width), 0) + 182;
  measuredSection.y = 0;
}
pin(measuredSection);
measuredSection.fills = [paint("boardSurface")];

// collapsed Upgrade CTA는 expanded CTA를 32×32로 resize하면 내부 text가 왜곡된다(라이브 QA에서
// rail 하단에 `pgra...`가 튀어나온 원인). 제품 실측대로 전용 32×32 master를 만들어 그 인스턴스를 쓴다.
// 라벨은 12px viewport로 clip되고 안의 text는 실제 폭(WIDTH_AND_HEIGHT)이라 ellipsis 없이 잘린다.
const collapsedUpgradeMaster = (() => {
  if (existingCollapsedMaster) {
    // 기하는 그대로 두고 칠만 역할로 다시 건다 — 옛 마스터는 은퇴한 컬렉션 변수에 묶여 있다.
    existingCollapsedMaster.fills = [paint(F.paints.fillPaint)];
    for (const text of existingCollapsedMaster.findAllWithCriteria({ types: ["TEXT"] })) text.fills = [paint(F.paints.labelPaint)];
    return existingCollapsedMaster;
  }
  const label = PLAN.measurements.collapsed.upgrade.label;
  const button = figma.createComponent();
  button.name = F.collapsedUpgradeMasterName;
  button.layoutMode = "HORIZONTAL";
  button.primaryAxisAlignItems = button.counterAxisAlignItems = "CENTER";
  button.paddingTop = button.paddingBottom = 0;
  button.paddingLeft = button.paddingRight = Number.parseFloat(PLAN.measurements.collapsed.upgrade.style.paddingLeft);
  button.cornerRadius = Number.parseFloat(PLAN.measurements.collapsed.upgrade.style.borderTopLeftRadius);
  button.clipsContent = false;
  fixed(button, PLAN.measurements.collapsed.upgrade.rect.width, PLAN.measurements.collapsed.upgrade.rect.height);
  button.fills = [paint(F.paints.fillPaint)];
  const clip = figma.createFrame();
  clip.name = "label clip · measured 12×18";
  clip.layoutMode = "NONE";
  clip.clipsContent = true;
  clip.fills = [];
  fixed(clip, label.rect.width, label.rect.height);
  const text = figma.createText();
  text.name = "label";
  text.fontName = { family: "Pretendard", style: "Medium" };
  text.characters = label.text;
  text.fontSize = Number.parseFloat(label.style.fontSize);
  text.lineHeight = { unit: "PIXELS", value: Number.parseFloat(label.style.lineHeight) };
  text.letterSpacing = { unit: "PIXELS", value: Number.parseFloat(label.style.letterSpacing) };
  text.textAutoResize = "WIDTH_AND_HEIGHT";
  text.textTruncation = "DISABLED";
  text.fills = [paint(F.paints.labelPaint)];
  clip.appendChild(text);
  text.x = 0;
  text.y = 0;
  button.appendChild(clip);
  measuredSection.appendChild(button);
  return button;
})();

// 레일 variant 하나를 짓는다(세트가 없을 때, 또는 세트에 그 variant 가 없을 때 — 있는 variant 는 지우지도 다시 짓지도 않는다).
// 편집 화면 레일은 제품 개명대로 `Current=Composition` 이다(옛 러너는 라이브에 없는 `Current=VideoEditor` 를 찾았다).
const RAIL_CURRENTS = ["Default", "Home", "Composition", "YouTube", "Upgrade"];
const menuItems = [
  ["Search", "Search"], ["Home", "Home"], ["Canvas", "Canvas"],
  ["Composition", "Composition"], ["Highlight", "Highlight"], ["YouTube analytics", "YouTube"],
];
const buildRailVariant = (current) => {
  const root = figma.createComponent();
  root.name = `Current=${current}`;
  root.layoutMode = "VERTICAL";
  root.primaryAxisAlignItems = "SPACE_BETWEEN";
  root.counterAxisAlignItems = "MIN";
  root.paddingTop = root.paddingRight = root.paddingBottom = root.paddingLeft = 12;
  root.fills = [];
  fixed(root, PLAN.measurements.collapsed.sidebar.width, PLAN.measurements.collapsed.sidebar.height);
  const top = figma.createFrame();
  top.name = "flow/brand-and-menu";
  top.layoutMode = "VERTICAL";
  top.itemSpacing = 12;
  top.fills = [];
  // 묶음 · 메뉴는 자식이 정한다(HUG) — 브랜드 40 + 간격 12 + 메뉴(행 여섯 · 간격 넷)가 264 · 212 를 낸다. 전에는 그 합을 수로
  // 굳혀 행 수가 바뀌어도 따라오지 않았다(크기 굳힘 감사 묶음 4).
  top.primaryAxisSizingMode = top.counterAxisSizingMode = "AUTO";
  const brand = figma.createFrame();
  brand.name = "brand/Klipse · collapsed crop";
  brand.layoutMode = "HORIZONTAL";
  brand.primaryAxisAlignItems = brand.counterAxisAlignItems = "CENTER";
  brand.fills = [];
  fixed(brand, 32, 40);
  const crop = figma.createFrame();
  crop.name = "crop/logo symbol · measured";
  crop.fills = [];
  crop.clipsContent = true;
  fixed(crop, 32, 28);
  const logo = icons.logo.createInstance();
  logo.name = "logo/klipse-dark · 96×28 clipped";
  logo.resize(96, 28);
  logo.x = 4.1406;
  crop.appendChild(logo);
  brand.appendChild(crop);
  const menu = figma.createFrame();
  menu.name = `menu · Current=${current}`;
  menu.layoutMode = "VERTICAL";
  menu.itemSpacing = 4;
  menu.fills = [];
  menu.primaryAxisSizingMode = menu.counterAxisSizingMode = "AUTO";
  for (const [label, key] of menuItems) {
    const measured = PLAN.measurements.collapsed.menu.find((entry) => entry.label === label);
    const row = figma.createFrame();
    row.name = `row/${label}`;
    row.layoutMode = "HORIZONTAL";
    row.primaryAxisAlignItems = row.counterAxisAlignItems = "CENTER";
    row.cornerRadius = measured.radius;
    row.fills = [];
    fixed(row, 32, 32);
    const icon = icons[key].createInstance();
    icon.name = `icon/${key}`;
    fitLineIcon(icon, 20);
    const selected = current === key || (current === "YouTube" && key === "YouTube");
    recolor(icon, selected ? F.paints.active : F.paints.inactive);
    row.appendChild(icon);
    menu.appendChild(row);
  }
  top.appendChild(brand);
  top.appendChild(menu);
  root.appendChild(top);
  // expanded CTA를 resize하지 않는다. 제품 실측 32×32 collapsed master의 인스턴스를 놓는다.
  const cta = collapsedUpgradeMaster.createInstance();
  cta.name = "upgrade-cta · measured collapsed";
  root.appendChild(cta);
  measuredSection.appendChild(root);
  return root;
};
if (!railSet) {
  railSet = figma.combineAsVariants(RAIL_CURRENTS.map(buildRailVariant), measuredSection);
  railSet.name = F.componentSetName;
  railSet.description = `Measured collapsed desktop Gnb · ${PLAN.productCommit}`;
} else {
  for (const current of RAIL_CURRENTS) {
    const variant = railSet.children.find((entry) => entry.type === "COMPONENT" && entry.name === `Current=${current}`);
    if (!variant) {
      railSet.appendChild(buildRailVariant(current));
      continue;
    }
    // 있는 variant 는 기하를 두고 행 아이콘 잉크만 역할로 다시 건다(계획의 행 이름이 아닌 옛 행은 비활성 잉크). 옛 러너가 variant 와
    // 그 안 접힌 CTA 인스턴스에 건 명시 모드는 걷는다 — 세트 페이지에서는 섹션의 측정 모드로, 보드에서는 놓인 자리의 모드로 풀린다.
    // **행 아이콘도 계획대로 맞춘다(2026-10-08).** 예전에는 잉크만 다시 걸어, 새로 지을 때만 타는 `fitLineIcon`(32 마스터 획 2 →
    // 20 자리 1.25)과 캔버스 · 컴포지션 행의 새 마스터(icon/Canvas · icon/FilmSlate)가 라이브 세트에 닿지 않았다 — 라이브 세트의
    // 행 아이콘 30개가 획 2, 캔버스 · 컴포지션 행은 icon/Graph · icon/MagicWand 그대로였다(LOUIS 읽기 탐침). 계획의 행이면 마스터가
    // 다를 때 바꾸고 이름 · 크기 · 획을 새로 지을 때와 같게 맞춘다. 행의 직계 인스턴스만 본다(아이콘 안쪽 인스턴스는 건드리지 않는다).
    unpin(variant);
    for (const cta of variant.findAll((entry) => entry.type === "INSTANCE" && entry.mainComponent?.id === collapsedUpgradeMaster.id)) unpin(cta);
    for (const row of variant.findAll((entry) => entry.type === "FRAME" && entry.name.startsWith("row/"))) {
      const key = menuItems.find(([label]) => row.name === `row/${label}`)?.[1];
      for (const icon of row.children.filter((entry) => entry.type === "INSTANCE")) {
        if (key) {
          if (icon.mainComponent?.id !== icons[key].id) icon.swapComponent(icons[key]);
          // swapComponent 는 옛 아이콘 벡터의 칠 · 획 덮어쓰기를 같은 자리의 새 벡터에 옮긴다 — 부품 렌더러에서 옛 집 아이콘의 면 칠이
          // icon/Canvas 외곽 사각형을 검게 메웠다(cba0b470). 칠 · 획의 «있고 없음»은 매 실행 마스터에서 다시 가져온다(색은 아래 recolor).
          const masterParts = icons[key].findAll((node) => "fills" in node && "strokes" in node);
          icon.findAll((node) => "fills" in node && "strokes" in node).forEach((part, index) => {
            const source = masterParts[index];
            if (!source || !Array.isArray(source.fills) || !Array.isArray(source.strokes)) return;
            part.fills = source.fills.map((entry) => ({ ...entry }));
            part.strokes = source.strokes.map((entry) => ({ ...entry }));
          });
          icon.name = `icon/${key}`;
          fitLineIcon(icon, 20);
        }
        recolor(icon, key === current ? F.paints.active : F.paints.inactive);
      }
    }
  }
}

// ── 상단 바 마스터: 계산된 크기를 굳히지 않는다(2026-09-14) ─────────────────────────
// 예전에는 바를 FIXED main 폭 × 52, 앞머리를 FIXED 68×36, 프로필을 36 으로 박았다. 제품 바는 높이를 선언하지 않는다(패딩 +
// 가장 큰 자식). 그래서 바는 가로 Auto Layout HUG, 앞머리 · 프로필 묶음은 HUG 에 선언 크기 컨트롤이다. 매 실행 다시 박는다 —
// 없을 때만 짓던 옛 경로는 한 번 틀린 기하를 영영 고치지 못했다. 편집 장면의 본문 격자는 앱 화면 생성기의 보드가 소유한다.
const E = PLAN.measurements.editor;
const T = E.topBar;
const hug = (node) => {
  node.primaryAxisSizingMode = "AUTO";
  node.counterAxisSizingMode = "AUTO";
};
// 아래 선은 매 실행 역할로 다시 건다(옛 획은 은퇴한 컬렉션 변수 + 페인트 불투명도 0.08 이었다). 마스터의 명시 모드는 걷는다 —
// 인스턴스는 놓인 자리의 모드를 따라야 한다.
topBar.strokes = [paint("topBarDivider")];
unpin(topBar);
topBar.layoutMode = "HORIZONTAL";
topBar.resize(PLAN.measurements.collapsed.main.width, topBar.height);
topBar.primaryAxisSizingMode = "FIXED";
topBar.counterAxisSizingMode = "AUTO";
topBar.counterAxisAlignItems = "CENTER";
topBar.paddingTop = T.padding.top;
topBar.paddingRight = T.padding.right;
topBar.paddingBottom = T.padding.bottom;
topBar.paddingLeft = T.padding.left;
topBar.itemSpacing = T.gap;
topBar.strokesIncludedInLayout = true;
leadingCluster.layoutMode = "HORIZONTAL";
hug(leadingCluster);
leadingCluster.counterAxisAlignItems = "CENTER";
leadingCluster.itemSpacing = T.leadingGap;
for (const control of leadingCluster.children) {
  // 숨은 자식은 흐름에 자리가 없다 — 옛 뒤로가기 자리(원본 SVG 로 갈아 끼우며 숨겼다)는 건드리지 않는다.
  if (!control.visible) continue;
  // 앞머리 컨트롤 한 변은 선언 크기다(앱 셸 계획 `controlSize`). 뒤로가기 프레임은 글리프를 가운데 둔다.
  control.resize(T.controlSize, T.controlSize);
  if (control.type === "FRAME") {
    control.layoutMode = "HORIZONTAL";
    control.primaryAxisSizingMode = control.counterAxisSizingMode = "FIXED";
    control.primaryAxisAlignItems = control.counterAxisAlignItems = "CENTER";
    for (const glyph of control.children) {
      if (glyph.type === "INSTANCE") fitLineIcon(glyph, T.iconSize);
      else glyph.resize(T.iconSize, T.iconSize);
    }
  }
}
breadcrumbNode.layoutGrow = 1;
if (breadcrumbNode.type === "TEXT") {
  breadcrumbNode.textAutoResize = "HEIGHT";
  breadcrumbNode.textTruncation = "ENDING";
  breadcrumbNode.maxLines = 1;
}
profileCluster.layoutMode = "HORIZONTAL";
hug(profileCluster);
profileCluster.counterAxisAlignItems = "CENTER";
profileCluster.itemSpacing = T.gap;
for (const entry of profileCluster.children) {
  // 액션 슬롯은 제 내용으로 HUG 한다(측정이 없는 229 를 박지 않는다). 프로필은 선언 한 변이다.
  if (entry.name.startsWith("profile/Open profile") || entry === profileCluster.children[profileCluster.children.length - 1]) {
    entry.resize(T.profileSize, T.profileSize);
  } else if ("layoutMode" in entry && entry.layoutMode !== "NONE") {
    hug(entry);
  }
}
// 세트 · 마스터를 측정 섹션 안에 한 줄씩 쌓는다(형제 러너와 같은 여백, 높이는 실제 크기로 잰다). 섹션 밖에 있으면 들인다 —
// 옮기는 것은 부모와 자리뿐이고 id · 인스턴스 연결은 그대로다.
{
  const gutter = 40;
  let cursor = gutter;
  let right = 0;
  for (const node of [railSet, collapsedUpgradeMaster, topBar]) {
    if (node.parent?.id !== measuredSection.id) measuredSection.appendChild(node);
    node.x = gutter;
    node.y = cursor;
    cursor += node.height + gutter;
    right = Math.max(right, node.x + node.width + gutter);
  }
  measuredSection.resizeWithoutConstraints(Math.max(measuredSection.width, right), Math.max(measuredSection.height, cursor));
}
// 되읽기 — 명시 모드(이 컬렉션)와 행 아이콘 획. 명시 모드는 비어 있어야 한다(섹션만 측정 모드).
const modeName = (node) => {
  const modeId = node.explicitVariableModes[modeCollection.id];
  return modeId === undefined ? null : modeCollection.modes.find((entry) => entry.modeId === modeId)?.name ?? modeId;
};
const pinned = [measuredSection, railSet, ...railSet.children, ...railSet.findAll((entry) => entry.type === "INSTANCE" && entry.mainComponent?.id === collapsedUpgradeMaster.id), collapsedUpgradeMaster, topBar]
  .map((node) => [node.id, modeName(node)])
  .filter(([, mode]) => mode !== null);
// 행 아이콘 — 마스터 이름과 획 두께(획이 있는 자손의 서로 다른 값). 32 마스터 획 2 가 20 자리에서 1.25 여야 한다.
const rowIcons = railSet.children.flatMap((variant) => variant.findAll((entry) => entry.type === "FRAME" && entry.name.startsWith("row/")).flatMap((row) =>
  row.children.filter((entry) => entry.type === "INSTANCE").map((icon) => [
    `${variant.name} ${row.name}`,
    `${icon.mainComponent?.name ?? "no component"} · ${[...new Set(icon.findAll((node) => "strokeWeight" in node && Array.isArray(node.strokes) && node.strokes.length > 0).map((node) => node.strokeWeight))].join("/") || "no stroke"}`,
  ])));
return {
  railSetId: railSet.id,
  railVariantIds: railSet.children.map((entry) => entry.id),
  collapsedUpgradeMasterId: collapsedUpgradeMaster.id,
  topBarId: topBar.id,
  sectionId: measuredSection.id,
  explicitModes: Object.fromEntries(pinned),
  rowIcons: Object.fromEntries(rowIcons),
};
