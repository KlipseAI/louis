// **앱 화면 조각 렌더러.** `P`(조각 하나)를 Figma Auto Layout으로 조립한다.
// Figma 플러그인 샌드박스 안에서 실행되며, 생성기가 `P`와 함께 draw.js로 합쳐 넣는다.
//
// ## 왜 조각인가
//
// `use_figma`는 인라인 payload가 크고 깊으면 `SyntaxError: expecting ']'`로 끊긴다. 그래서 화면 하나를
// 조각으로 나눠 넘긴다.
//   조각 0 — 프레임 껍데기 + 상단부. 떼어낸 자리에 `w:1`(대기) 표시가 남는다.
//   조각 n — `path`(자식 인덱스 체인)로 그 자리를 찾아 실제 서브트리로 교체한다.
//
// ## 불변 순서 (라이브 probe로 확정한 API 제약)
//
//   append → layoutMode → ABSOLUTE → resize(고정축) → layoutSizing → min/max → margin → 면
//
// - 부모 없이 `layoutSizingHorizontal="FILL"`은 **거부**된다.
// - **`resize()`는 `layoutSizing`을 FIXED로 덮는다** — resize를 sizing보다 먼저 한다.
// - `HUG`는 자기 자신이 auto-layout이거나 TEXT일 때만 유효하다.
// - `ABSOLUTE`는 부모가 auto-layout일 때만 유효하다.
//
// ## 색·타이포는 지어내지 않는다
//
// 측정된 색은 **LOUIS에 이미 있는 변수**에 붙인다(새 변수를 만들지 않는다). 값이 맞는 변수가 없으면
// 리터럴로 칠하고 `unboundColors`로 돌려 공백을 드러낸다. 텍스트는 **이미 있는 텍스트 스타일**을 건다.
// 인스턴스 노드에는 색·타이포를 걸지 않는다 — 컴포넌트가 제 색을 갖고 있고, 덮어쓰면 시스템 쪽 수정이
// 화면에 전파되지 않는다. **라벨은 예외가 아니라 다른 일이다** — 컴포넌트가 스스로 연 TEXT 속성을
// 채우는 것이라 전파를 끊지 않는다. 채우지 않으면 마스터 기본 라벨이 화면에 남는다.

const MODE = { V: "VERTICAL", H: "HORIZONTAL", G: "GRID" };
const SIZE = { F: "FILL", H: "HUG", A: "FIXED" };
const CONSTRAINT = { M: "MIN", A: "MAX", S: "STRETCH", C: "CENTER" };
const WEIGHT_STYLE = { 400: "Regular", 500: "Medium", 600: "SemiBold", 700: "Bold" };
const ALIGN = { center: "CENTER", right: "RIGHT", justify: "JUSTIFIED" };

// 제품이 쓰는 폰트는 Pretendard 하나뿐이고 굵기는 400·500·600이다(실측). 텍스트를 쓰기 전에 로드해야 한다.
for (const style of ["Regular", "Medium", "SemiBold", "Bold"]) {
  try { await figma.loadFontAsync({ family: "Pretendard", style }); } catch (error) { /* 없는 굵기는 건너뛴다 */ }
}

// ── 파일에 이미 있는 것 색인 ──────────────────────────────────────────────
// 색 변수는 **값(hex)** 으로 찾는다 — 이름 규칙을 짐작하지 않기 위해서다(측정 트리에는 역할 이름이 없다).
//
// **컬렉션과 모드는 계획이 정한다(`P.colour`, 2026-09-14).** 라이브 LOUIS(`OlYKERKOkgbxBEEoXGZW2c`)의 컬렉션은
// `Klipse Primitive[Base]` · `Klipse Semantic[Global]` · `Klipse Semantic Color[Light/Dark]` 셋이다. 이 렌더러는 전에
// 은퇴한 팔레트 · 시맨틱 컬렉션의 사이드바 모드를 먼저 찾았고, 없으니 던지지 않고 이름이 light 인 모드로 떨어졌으며
// 화면 루트에 모드를 하나도 고정하지 못했다(조립 규칙 27번 — 은퇴한 이름은 러너에 남기지 않는다). 이제 제품 컴포넌트 러너와 같은 공용 조각
// (`scripts/templates/lib/figma-live-variables.js`, 생성기가 앞에 붙인다)이 푼다 — 측정 테마의 모드(fixture 가 light 라
// `Klipse Semantic Color[Light]`)를 그 컬렉션에만 고정하고, 나머지는 기본 모드로 푼다. 컬렉션이나 모드가 없으면 던진다.
// 생성기는 되읽기에서 같은 규칙으로 풀어, 측정 색마다 값이 같은 라이브 변수를 계획 `colourBinding` 에 적는다.
//
// **값이 같은 변수가 없는 측정 색은 리터럴로 칠하고 `unboundColors` 로 돌려준다.** 사이드바가 있는 화면의 페이지 배경
// `#eeeef1` 이 그랬다(2026-08-31) — 제품은 사이드바 화면에서 회색 램프를 통째로 재매핑하는데(`product-reading-traps.md`
// 「라이트 회색 램프가 두 벌」) 라이브 변수에는 그 램프를 담을 모드가 없다. 모드 구조를 정하는 것은 이 렌더러의 몫이 아니다.
const live = await liveVariables(P.colour);
const channelHex = (channel) => Math.round(channel * 255).toString(16).padStart(2, "0");
const colorToHex = (color) => {
  if (!color || typeof color !== "object" || !("r" in color)) return null;
  const alpha = color.a === undefined || color.a >= 0.999 ? "" : channelHex(color.a);
  return `${channelHex(color.r)}${channelHex(color.g)}${channelHex(color.b)}${alpha}`;
};
const variableByHex = new Map();
// 획: color/stroke-hairline > color/stroke-* > 값이 같은 첫 변수 (사유: build-figma-app-screens.mjs 「헤어라인」)
const strokeVariableByHex = new Map();
const strokeRank = (name) => (name === "color/stroke-hairline" ? 0 : 1);
for (const name of P.colour.collections) {
  const collection = live.collections.find((entry) => entry.name === name);
  if (!collection) throw new Error(`변수 컬렉션을 찾지 못했습니다: ${name}`);
  for (const id of collection.variableIds) {
    const variable = live.variableById.get(id);
    if (!variable || variable.resolvedType !== "COLOR") continue;
    const hex = colorToHex(live.resolve(variable));
    if (hex && !variableByHex.has(hex)) variableByHex.set(hex, variable);
    if (hex && variable.name.startsWith("color/stroke-")) {
      const held = strokeVariableByHex.get(hex);
      if (!held || strokeRank(variable.name) < strokeRank(held.name)) strokeVariableByHex.set(hex, variable);
    }
  }
}

const textStyleByName = new Map((await figma.getLocalTextStylesAsync()).map((style) => [style.name, style]));

// ── 로캘 변수(DS-D-0081) ──────────────────────────────────────────────────
// `P.locale` 이 있을 때만 돈다 — 없으면 아래 갈래는 하나도 일하지 않고 러너는 전과 같다. 컬렉션 「Klipse Locale」의 변수를 이름으로
// 찾는다(로캘 러너 figma-locale-strings-renderer.js 가 먼저 세운다). 없는 변수는 조용히 리터럴로 두지 않고 그리기 전에 던진다.
const localeVarByName = new Map();
if (P.locale) {
  const collection = (await figma.variables.getLocalVariableCollectionsAsync()).find((entry) => entry.name === P.locale.collection);
  if (!collection) throw new Error(`로캘 컬렉션을 찾지 못했습니다: ${P.locale.collection} — 로캘 러너(figma/locale-strings.*.draw.js)를 먼저 돌리세요.`);
  for (const variable of await figma.variables.getLocalVariablesAsync()) {
    if (variable.variableCollectionId === collection.id) localeVarByName.set(variable.name, variable);
  }
  const wanted = new Set();
  const gather = (spec) => {
    if (spec.xv) wanted.add(spec.xv);
    if (spec.vv) wanted.add(spec.vv);
    if (spec.iv) for (const name of typeof spec.iv === "object" ? Object.values(spec.iv) : [spec.iv]) wanted.add(name);
    for (const child of (spec.k || [])) gather(child);
  };
  if (P.head) gather(P.head);
  for (const slot of (P.slots || [])) gather(slot.spec);
  const missingLocaleVars = [...wanted].filter((name) => !localeVarByName.has(name));
  if (missingLocaleVars.length) throw new Error(`로캘 변수 ${missingLocaleVars.length}개가 ${P.locale.collection} 에 없습니다: ${missingLocaleVars.slice(0, 8).join(" | ")}`);
}
// 글자 · 존재 바인딩은 텍스트 스타일 · 범위 서식을 건 뒤에 건다 — `characters` · `visible` 을 쓰면 바인딩이 조용히 풀린다(실측 10-08).
const pendingLocaleTexts = [];
const pendingLocaleVisible = [];
const localeCounts = { texts: 0, visible: 0, labels: 0 };

// ── 색 적용 ───────────────────────────────────────────────────────────────
const boundColors = new Set();
let gradientCount = 0;
const unboundColors = new Set();
const hexToPaint = (hex, role) => {
  const parse = (offset) => parseInt(hex.slice(offset, offset + 2), 16) / 255;
  const paint = {
    type: "SOLID",
    color: { r: parse(0), g: parse(2), b: parse(4) },
    opacity: hex.length >= 8 ? parse(6) : 1,
  };
  const variable = (role === "stroke" && strokeVariableByHex.get(hex)) || variableByHex.get(hex);
  if (!variable) { unboundColors.add(hex); return paint; }
  boundColors.add(variable.name);
  // `setBoundVariableForPaint`는 **새 paint를 돌려준다** — 반드시 받아서 써야 한다.
  return figma.variables.setBoundVariableForPaint(paint, "color", variable);
};

/**
 * CSS 각도(0deg = 위, 시계 방향) → Figma `gradientTransform`.
 * Figma의 그라디언트는 기본이 왼→오른쪽이므로 중심(0.5, 0.5)을 기준으로 회전시킨다.
 * 검증: 90deg(→오른쪽) → [[1,0,0],[0,1,0]] (기본값), 180deg(→아래) → [[0,1,0],[-1,0,1]].
 */
const gradientTransform = (angle) => {
  const radians = ((angle - 90) * Math.PI) / 180;
  const cos = Math.cos(radians);
  const sin = Math.sin(radians);
  return [[cos, sin, (1 - cos - sin) / 2], [-sin, cos, (1 + sin - cos) / 2]];
};
const applyPaint = (node, spec) => {
  // CSS는 background-image(그라디언트)를 background-color 위에 그린다 — 순서를 그대로 지킨다.
  const fills = [];
  if (spec.f) fills.push(hexToPaint(spec.f));
  if (spec.g) {
    const [angle, ...stops] = spec.g;
    fills.push({
      type: "GRADIENT_LINEAR",
      gradientTransform: gradientTransform(angle),
      gradientStops: stops.map(([hex, position]) => {
        const parse = (offset) => parseInt(hex.slice(offset, offset + 2), 16) / 255;
        return {
          position,
          color: { r: parse(0), g: parse(2), b: parse(4), a: hex.length >= 8 ? parse(6) : 1 },
        };
      }),
    });
    gradientCount += 1;
  }
  if (fills.length > 0) node.fills = fills;
  if (spec.b) {
    const [hex, top, right, bottom, left, hairline] = spec.b;
    node.strokes = [hexToPaint(hex, "stroke")];
    node.strokeAlign = hairline === 2 ? "OUTSIDE" : "INSIDE";

    if (top === right && right === bottom && bottom === left) {
      node.strokeWeight = Math.max(0, top);
    } else {
      try {
        node.strokeTopWeight = Math.max(0, top);
        node.strokeRightWeight = Math.max(0, right);
        node.strokeBottomWeight = Math.max(0, bottom);
        node.strokeLeftWeight = Math.max(0, left);
      } catch (error) { node.strokeWeight = Math.max(top, right, bottom, left); }
    }
  }
  if (spec.d != null) {
    if (Array.isArray(spec.d)) {
      const [topLeft, topRight, bottomRight, bottomLeft] = spec.d;
      node.topLeftRadius = topLeft; node.topRightRadius = topRight;
      node.bottomRightRadius = bottomRight; node.bottomLeftRadius = bottomLeft;
    } else {
      node.cornerRadius = spec.d;
    }
  }
  if (spec.e) {
    node.effects = spec.e.map(([inset, hex, x, y, blur, spread]) => {
      const parse = (offset) => parseInt(hex.slice(offset, offset + 2), 16) / 255;
      return {
        type: inset ? "INNER_SHADOW" : "DROP_SHADOW",
        color: { r: parse(0), g: parse(2), b: parse(4), a: hex.length >= 8 ? parse(6) : 1 },
        offset: { x, y }, radius: blur, spread, visible: true, blendMode: "NORMAL",
      };
    });
  }
  // **뒤 흐림(2026-10-12 오후).** CSS `blur(σ)` 의 σ 는 가우스 표준편차이고 Figma 배경 흐림은 반경을 받는다 — 반경 = 2σ 로 근사한다(정량 대조 전,
  // 근사 표기). 그림자와 함께 effects 에 더한다.
  if (spec.bb) node.effects = [...(node.effects || []), { type: "BACKGROUND_BLUR", radius: spec.bb * 2, visible: true }];
  if (spec.a != null) node.opacity = spec.a;
};

// ── 셸·본문 컴포넌트 ──────────────────────────────────────────────────────
// 세트나 variant가 없으면 조용히 도형으로 떨어지지 않고 던진다 — 조용한 실패는 24화면에 퍼진다.
const componentCache = new Map();
// **TEXT 속성 키는 파일이 소유한다.** Figma 는 이름 뒤에 인스턴스 id 를 붙여(`Label#123:4`)
// 키를 만들고, 그 꼬리는 파일마다·컴포넌트마다 다르다. 되읽기는 꼬리를 잘라 담으므로
// (`figma-readback-emit.mjs:351`) 생성기가 아는 것은 «이름»뿐이다. 실제 키는 여기서 읽는다.
const textPropKeysBySet = new Map();
const findVariant = async (setName, variantName) => {
  const key = `${setName}|${variantName}`;
  if (componentCache.has(key)) return componentCache.get(key);
  let set = null;
  for (const page of figma.root.children) {
    await page.loadAsync();
    set = page.findOne((node) => node.type === "COMPONENT_SET" && node.name === setName);
    if (set) break;
  }
  if (!set) throw new Error(`컴포넌트 세트를 찾지 못했습니다: ${setName}`);
  textPropKeysBySet.set(setName, Object.keys(set.componentPropertyDefinitions || {})
    .filter((raw) => set.componentPropertyDefinitions[raw].type === "TEXT"));
  // **이름은 축의 «순서»까지 맞아야 하는데, 생성기는 그 순서를 알 수 없다.**
  // 낱개 정본 프리미티브의 variant 이름은 되읽기의 `componentPropertyDefinitions` 순서로
  // 조립된다(`figma-component-substitution.mjs`). 그 순서가 파일의 실제 순서와 한 칸이라도
  // 다르면 문자열 비교는 실패하는데, 가리키는 variant 는 실재한다 — 없는 것과 못 찾은 것을
  // 같은 실패로 만들면 다음 사람이 없는 축을 만들러 간다. 그래서 축=값 «집합»으로 한 번 더 본다.
  const axesOf = (name) => {
    const pairs = String(name).split(",").map((part) => part.trim()).filter(Boolean);
    const bag = {};
    for (const pair of pairs) {
      const at = pair.indexOf("=");
      if (at < 0) return null;
      bag[pair.slice(0, at).trim()] = pair.slice(at + 1).trim();
    }
    return bag;
  };
  const sameAxes = (a, b) => {
    if (!a || !b) return false;
    const keys = Object.keys(a);
    if (keys.length !== Object.keys(b).length) return false;
    return keys.every((key) => b[key] === a[key]);
  };
  const wanted = axesOf(variantName);
  const variant = set.children.find((child) => child.name === variantName)
    ?? set.children.find((child) => sameAxes(wanted, axesOf(child.name)));
  if (!variant) {
    throw new Error(`variant를 찾지 못했습니다: ${setName} · ${variantName} (있는 것: ${set.children.map((child) => child.name).join(" | ")})`);
  }
  componentCache.set(key, variant);
  return variant;
};
// 인스턴스 생성은 비동기 조회가 필요하므로, 트리를 만들기 전에 쓸 variant를 미리 모아 둔다.
// 자산 이미지 `im` = [id, 이름](생성기 IMAGE_COMPONENTS) — 이름까지 같아야 쓴다.
const imageCache = new Map();
const preloadVariants = async (spec) => {
  if (spec.i) await findVariant(spec.i[0], spec.i[1]);
  if (spec.im && !imageCache.has(spec.im[0])) {
    const component = await figma.getNodeByIdAsync(spec.im[0]);
    if (!component || component.type !== "COMPONENT" || component.name !== spec.im[1]) {
      throw new Error(`자산 이미지 컴포넌트가 다릅니다: ${spec.im[0]} «${spec.im[1]}» (라이브: ${component ? `${component.type} «${component.name}»` : "없음"})`);
    }
    imageCache.set(spec.im[0], component);
  }
  for (const child of (spec.k || [])) await preloadVariants(child);
};

// 크기가 다른 grid 열을 걸지 못한 자리 — 결과로 돌려준다(조용히 균등 열로 남기지 않는다).
const gridTrackFailures = [];
// grid 칸 자리 · span 을 건다(조각이 자리를 다시 채운 뒤에도 부른다).
const placeGridChild = (node, spec) => {
  if (!spec.gp || !node.parent || node.parent.layoutMode !== "GRID") return;
  try {
    if (node.gridRowAnchorIndex !== spec.gp[0] || node.gridColumnAnchorIndex !== spec.gp[1]) node.setGridChildPosition(spec.gp[0], spec.gp[1]);
    if (spec.gp[2] > 1) node.gridRowSpan = spec.gp[2];
    if (spec.gp[3] > 1) node.gridColumnSpan = spec.gp[3];
  } catch (error) { gridTrackFailures.push(`${spec.t} span ${spec.gp.join(",")}: ${error.message || error}`); }
};

// **절대 배치는 트리를 다 지은 뒤 측정 크기 · 자리를 한 번 더 건다(2026-09-30).** 부모가 HUG 로 잠시 줄었다가 최소 높이로 돌아오는
// 동안 늘이기 제약(STRETCH)이 걸린 절대 자식의 크기가 틀어졌다 — 랜딩 후기 밴드의 배경 사진이 1920×800 대신 1920×106 으로 섰다.
const pendingAbsolute = [];
const settleAbsolute = () => {
  for (const [node, size, offset] of pendingAbsolute) {
    try { node.resize(Math.max(0.01, size[0]), Math.max(0.01, size[1])); } catch (error) {}
    if (offset) { try { node.x = offset[0]; node.y = offset[1]; } catch (error) {} }
  }
  pendingAbsolute.length = 0;
};
// 텍스트 스타일 적용은 비동기다. 트리를 다 만든 뒤 한 번에 건다.
const pendingTextStyles = [];
// 글자 안의 범위 서식(`xr`)은 텍스트 스타일을 건 **뒤에** 건다 — 스타일이 글자 전체의 글꼴을 다시 쓰기 때문이다.
const pendingRanges = [];
const missingTextStyles = new Set();

/** 텍스트 노드에 타이포를 건다. 스타일 이름이면 뒤에서 한 번에, 숫자면 즉시. */
const applyTypography = (node, spec) => {
  const literal = Array.isArray(spec.y) ? spec.y : null;
  node.fontName = { family: "Pretendard", style: literal ? (WEIGHT_STYLE[literal[1]] ?? "Regular") : "Regular" };
  if (literal) node.fontSize = literal[0];
  node.characters = String(spec.x);
  node.fills = spec.tc ? [hexToPaint(spec.tc)] : spec.tg ? [{
    type: "GRADIENT_LINEAR",
    gradientTransform: gradientTransform(spec.tg[0]),
    gradientStops: spec.tg.slice(1).map(([hex, position]) => {
      const parse = (offset) => parseInt(hex.slice(offset, offset + 2), 16) / 255;
      return { position, color: { r: parse(0), g: parse(2), b: parse(4), a: hex.length >= 8 ? parse(6) : 1 } };
    }),
  }] : [];
  if (spec.ta && ALIGN[spec.ta]) node.textAlignHorizontal = ALIGN[spec.ta];
  if (literal) {
    if (literal[2]) node.lineHeight = { value: literal[2], unit: "PIXELS" };
    node.letterSpacing = { value: literal[3] ?? 0, unit: "PIXELS" };
  } else if (typeof spec.y === "string") {
    pendingTextStyles.push([node, spec.y]);
  }
  if (spec.xr) pendingRanges.push([node, spec.xr, spec.r && spec.r[1]]);
  // 범위 서식 글자는 묶지 않는다(DS-D-0081 4항) — 생성기도 싣지 않지만 옛 조각을 돌려도 무너지지 않게 여기서도 막는다.
  if (P.locale && spec.xv && !spec.xr) pendingLocaleTexts.push([node, spec.xv]);
};

// **grid 행 크기는 측정 크기를 깐 뒤에 건다(2026-10-12).** CSS grid 는 행 템플릿을 선언하지 않으면 행이 auto(내용 높이)인데, Figma 는 새 행을
// FLEX(1fr)로 깔아 HUG 컨테이너의 높이를 행 수로 똑같이 나눈다(실측 사고: `/subscription` 모바일의 요금제 카드(456)가 281 짜리 행에 담겨 다음
// 행을 덮었다). 그래서 행을 HUG 로 두는데, **크기 모드가 AUTO 인 grid 를 `resize()` 하면 Figma 가 HUG 행을 FLEX 로 되돌린다**(작업 페이지 임시
// 프레임으로 확인 — 설정 → 부모에 붙임 → resize 에서 HUG,HUG → FLEX,FLEX). 예전에는 행을 레이아웃 설정 때 걸고 그 뒤에 측정 크기로 resize 해,
// 하이라이트 분석 중 · 업로드 중 모바일의 한 열 grid 가 반반(211 · 211)으로 나뉘어 빈 둘째 칸이 첫 칸의 안내 카드를 덮었다. 열은
// `repeat(N, 1fr)` 라 FLEX 그대로 둔다. 늘어난 행은 FIXED(figma-tree-spec gridStretchedRow).
// **열도 같다(2026-10-12 오후).** `resize()` 는 HUG 열도 FLEX 로 되돌린다(FIXED 는 남는다 — 작업 페이지 임시 프레임으로 확인). 크기가 다른 열
// (`auto 1fr auto` · `0.8fr 1.2fr` · `18px 1fr`, 계획의 12번째 칸)을 레이아웃 설정 때 걸어, 상단 바 `nav`(`auto 1fr auto`)가 셋으로 똑같이
// 나뉘어 제목이 x 480 · 버튼이 x 1300 에 섰다(편집기 · 하이라이트 상단 바 — 제품은 56 · 1729). 열도 여기서 건다. 못 건 열은 결과의
// `gridTrackFailures` 로 드러낸다.
const settleGridRows = (node, spec) => {
  if (node.type !== "FRAME" || node.layoutMode !== "GRID" || !spec.l || !spec.l[9]) return;
  if (Array.isArray(spec.l[11])) {
    spec.l[11].forEach(([type, value], index) => {
      const track = node.gridColumnSizes[index];
      try {
        if (!track) throw new Error("열이 없다");
        track.type = type === "X" ? "FIXED" : type === "H" ? "HUG" : "FLEX";
        if (type !== "H" && value != null) track.value = value;
      } catch (error) { gridTrackFailures.push(`${spec.t} 열 ${index} ${type}${value ?? ""}: ${error.message || error}`); }
    });
  }
  try { for (const track of node.gridRowSizes) track.type = "HUG"; } catch (error) {}
  if (Array.isArray(spec.l[10])) {
    spec.l[10].forEach((size, index) => {
      const track = node.gridRowSizes[index];
      if (!track) throw new Error(`grid 행 ${index} 가 없습니다: ${spec.t} (행 ${node.gridRowCount})`);
      track.type = "FIXED";
      track.value = size;
    });
  }
};

const buildNode = (spec, parent) => {
  let node;
  // **글자와 면을 같이 가진 노드는 TEXT로 만들면 안 된다.** Figma TEXT에는 배경·radius·그림자가 없다.
  // 제품의 버튼(`<button>검은 알약</button>`)이 그런 경우다 — 프레임 + 안쪽 텍스트로 만든다.
  // 실측 사고: `/analytics/youtube`의 `Connect Google Account` 검은 알약이 통째로 사라졌다.
  const wantsSurface = Boolean(spec.f || spec.b || spec.d != null || spec.e || spec.bb);
  const textInSurface = Boolean(spec.x) && !spec.k && wantsSurface;
  const isText = Boolean(spec.x) && !spec.k && !wantsSurface;
  if (isText) {
    node = figma.createText();
    applyTypography(node, spec);
  } else if (spec.i) {
    // 셸·본문 자리 — 도형 대신 컴포넌트 인스턴스. 크기·배치는 아래 공통 경로가 그대로 건다.
    node = componentCache.get(`${spec.i[0]}|${spec.i[1]}`).createInstance();
    // 라벨(컴포넌트가 연 TEXT 속성)은 크기·배치보다 먼저 채운다 — 뒤따르는 HUG 가 제 글자를 문다(instanceLabel 주석).
    if (spec.i[2] != null && typeof spec.i[2] === "object") {
      // **상단 바 — 속성이 여럿이라 이름으로 짝짓는다.** 계획은 세트의 TEXT 속성 이름 «전부»를 키로
      // 싣고, 이 variant 가 묶지 않은 속성은 null 이다. 파일의 TEXT 속성 이름 집합이 계획과 한 개라도
      // 다르면 던진다 — 속성이 없는 옛 세트에 조용히 넘어가면 마스터 기본 라벨이 화면에 남는다
      // (앱 셸 러너를 먼저 돌려 세트에 속성을 열어야 한다).
      const keys = textPropKeysBySet.get(spec.i[0]) || [];
      const nameOf = (raw) => (raw.includes("#") ? raw.slice(0, raw.indexOf("#")) : raw);
      const wanted = Object.keys(spec.i[2]);
      const fileNames = keys.map(nameOf);
      if (keys.length !== wanted.length || wanted.some((name) => fileNames.filter((own) => own === name).length !== 1)) {
        throw new Error(`${spec.i[0]} 의 TEXT 속성(${fileNames.join(" | ") || "없음"})이 계획(${wanted.join(" | ")})과 다릅니다 — 앱 셸 러너를 먼저 돌리세요.`);
      }
      const values = {};
      for (const name of wanted) {
        if (spec.i[2][name] == null) continue;
        // 로캘 변수가 있는 속성은 별칭으로 넣는다(모드를 따른다). 없으면 글자 그대로.
        const alias = P.locale && spec.iv && spec.iv[name];
        values[keys[fileNames.indexOf(name)]] = alias ? figma.variables.createVariableAlias(localeVarByName.get(alias)) : String(spec.i[2][name]);
        if (alias) localeCounts.labels += 1;
      }
      node.setProperties(values);
    } else if (spec.i[2] != null) {
      const keys = textPropKeysBySet.get(spec.i[0]) || [];
      if (keys.length !== 1) {
        throw new Error(`${spec.i[0]} 의 TEXT 속성이 ${keys.length}개입니다(${keys.join(" | ") || "없음"}) — 라벨 «${spec.i[2]}» 를 어디에 넣을지 정할 수 없습니다.`);
      }
      const alias = P.locale && typeof spec.iv === "string" ? spec.iv : null;
      node.setProperties({ [keys[0]]: alias ? figma.variables.createVariableAlias(localeVarByName.get(alias)) : String(spec.i[2]) });
      if (alias) localeCounts.labels += 1;
    }
  } else if (spec.im) {
    node = imageCache.get(spec.im[0]).createInstance();
    // 사진(`image/` — 이미지 채움 FILL = object-cover)은 측정 상자 그대로다. 로고 · 타일 · 아이콘은 비율을 지켜 폭으로 줄인다.
    if (spec.im[1].startsWith("image/")) {
      try { node.constrainProportions = false; } catch (error) {}
      node.resize(Math.max(0.01, spec.r[0]), Math.max(0.01, spec.r[1]));
    } else {
      node.rescale(Math.max(0.01, spec.r[0]) / node.width);
    }
    // mask 아이콘(`mt`) — 제품은 mask 로 모양을, 바탕색(`f`, currentColor)으로 색을 준다. 인스턴스 안의 보이는 면 · 획을 그 색으로 덮는다.
    if (spec.mt && spec.f) {
      for (const part of node.findAll((child) => "fills" in child)) {
        if (Array.isArray(part.fills) && part.fills.some((paint) => paint.visible !== false)) part.fills = [hexToPaint(spec.f)];
        if (Array.isArray(part.strokes) && part.strokes.some((paint) => paint.visible !== false)) part.strokes = [hexToPaint(spec.f, "stroke")];
      }
    }
  } else {
    node = figma.createFrame();
    node.fills = [];
    if (spec.l) {
      node.layoutMode = MODE[spec.l[0]];
      // GRID는 열 개수를 반드시 세워야 한다 — 없으면 Figma가 기본 2열로 깔아 4열 카드가 접힌다.
      // **행 개수도 같이 세운다.** 안 세우면 Figma가 기본 행 수(2)를 유지해, 항목 2개짜리 2열 그리드가
      // 2행으로 깔리고 각 칸이 절반 높이가 된다. 실측 사고: `/subscription` desktop 카드가 455 대신
      // 227로 그려져 본문(안내 문구·쿠폰 버튼)이 카드 밖으로 밀려났다(스크린샷으로 확인).
      if (node.layoutMode === "GRID" && spec.l[9]) {
        const columns = spec.l[9];
        const cells = (spec.k || []).filter((child) => !child.p).length;
        try { node.gridColumnCount = columns; } catch (error) {}
        // 열마다의 크기(`l[11]`)는 행처럼 측정 크기를 깐 뒤에 건다 — settleGridRows 주석.
        try { node.gridRowCount = spec.gr || Math.max(1, Math.ceil(cells / columns)); } catch (error) {}
        // 행 크기(HUG · 늘어난 행 FIXED)는 측정 크기를 깐 뒤에 건다 — settleGridRows 주석.
        // **간격도 격자의 것이다.** 아래 `itemSpacing` 은 GRID 에 뜻이 없어 건너뛰는데, 그 자리를 메우지 않아 격자 칸이 붙어
        // 그려졌다(`/subscription` 알림과 요금제 카드 사이 24 가 0). 계획의 간격 하나를 행 · 열 간격에 같이 건다(CSS `gap`).
        // 행 간격이 다르면(`row-gap` ≠ `column-gap`) 계획이 `cg` 로 따로 싣는다(2026-10-12 — 하이라이트 단계 안내 grid 6 ↔ 12).
        try { node.gridRowGap = (spec.cg != null ? spec.cg : spec.l[1]) || 0; node.gridColumnGap = spec.l[1] || 0; } catch (error) {}
      }
      if (node.layoutMode !== "GRID") {
        node.itemSpacing = spec.l[1];
        // `layoutWrap` 은 HORIZONTAL 에만 건다 — 세로 프레임에 WRAP 을 걸면 API 가 던져 러너가 멈춘다.
        // 생성기(figma-tree-spec `wrap`)도 가로에만 싣지만, 옛 조각을 돌려도 멈추지 않게 여기서도 막는다.
        if (node.layoutMode === "HORIZONTAL") node.layoutWrap = spec.l[8] ? "WRAP" : "NO_WRAP";
        // 감긴 줄 사이 간격(`row-gap`) — 걸지 않으면 줄이 붙는다.
        if (node.layoutMode === "HORIZONTAL" && spec.l[8] && spec.cg) node.counterAxisSpacing = spec.cg;
        if (spec.l[6]) node.counterAxisAlignItems = spec.l[6];
        if (spec.l[7]) node.primaryAxisAlignItems = spec.l[7];
      }
      node.paddingTop = spec.l[2]; node.paddingRight = spec.l[3];
      node.paddingBottom = spec.l[4]; node.paddingLeft = spec.l[5];
      node.primaryAxisSizingMode = "AUTO";
      node.counterAxisSizingMode = "AUTO";
    } else {
      node.layoutMode = "NONE";
    }
    // **자를 때만 자른다.** `createFrame()` 은 clipsContent 가 기본 true 라, 명시하지 않으면
    // 제품이 안 자르는 곳까지 잘린다. 실측 사고: `/archive` 의 사이드바는 부모 기준 x=-280 에
    // 절대 배치되는데(부모가 margin-left 280), 조상 프레임이 기본값으로 잘라 **통째로 사라졌다**.
    node.clipsContent = Boolean(spec.c);
  }
  node.name = spec.i
    ? `shell/${spec.i[0]} · ${spec.i[1]}` + (spec.i[2] == null ? ""
      : typeof spec.i[2] === "object" ? ` · ${Object.values(spec.i[2]).filter((value) => value != null).join(" / ")}`
      : ` · ${spec.i[2]}`)
    // **아이콘은 이름으로 부른다.** `v` 가 없던 동안 보드의 svg 자리는 전부 `svg AA` 라
    // 서로 구분되지 않았고, 어느 그림인지는 보드를 열어 눈으로 세는 수밖에 없었다.
    : (spec.w ? "pending " : "") + spec.t + (spec.v ? " " + spec.v : "") + (spec.im ? " " + spec.im[1].split(" (")[0] : "")
      + (spec.x ? " " + String(spec.x).slice(0, 18) : "") + " " + spec.s;

  if (parent && node.parent !== parent) {
    // grid 칸 자리와 span(`gp`) — 자리에 넣고 span 을 건다. 못 건 자리는 결과의 `gridTrackFailures` 로 드러낸다.
    if (spec.gp && parent.layoutMode === "GRID") {
      try { parent.appendChildAt(node, spec.gp[0], spec.gp[1]); } catch (error) { parent.appendChild(node); gridTrackFailures.push(`${spec.t} 자리 ${spec.gp.join(",")}: ${error.message || error}`); }
      placeGridChild(node, spec);
    } else parent.appendChild(node);
  }
  const parentAuto = parent && "layoutMode" in parent && parent.layoutMode && parent.layoutMode !== "NONE";

  const isAbsolute = Boolean(spec.p) && parentAuto;
  if (isAbsolute) node.layoutPositioning = "ABSOLUTE";
  // **자동 배치 없는 부모 안의 절대 자식도 제약을 건다(2026-10-08).** 절대 자식만 모인 부모(NONE)는 위 갈래를 타지 않아 제약이 기본(MIN)
  // 으로 남았다 — 공개 모바일 메뉴 판(`inset: 0` 안의 `inset: 0`)이 부모를 따라 줄지 않아 360 에서 42 넘쳤다(늘림 시험).
  if (isAbsolute || (!parentAuto && parent && spec.p)) {
    if (spec.n) {
      try { node.constraints = { horizontal: CONSTRAINT[spec.n[0]], vertical: CONSTRAINT[spec.n[1]] }; }
      catch (error) { /* 제약이 없는 노드 타입은 건너뛴다 */ }
    }
  }

  const h = SIZE[spec.s[0]];
  const v = SIZE[spec.s[1]];

  // **측정 크기를 먼저 깔고 그 위에 FILL/HUG를 얹는다.** Figma는 구조상 불가능한 FILL·HUG를 거부하는데,
  // 그때 아무것도 하지 않으면 새 프레임의 기본 100×100이 그대로 남는다.
  if (isText) {
    if (h !== "HUG") node.resize(Math.max(0.01, spec.r[0]), node.height);
  } else {
    node.resize(Math.max(0.01, spec.r[0]), Math.max(0.01, spec.r[1]));
  }
  if (isAbsolute && spec.o) { node.x = spec.o[0]; node.y = spec.o[1]; }
  // **자동 배치가 없는 부모 안의 자식도 측정 자리에 둔다(2026-09-30).** 절대 자식만 모인 부모는 자동 배치 없이(NONE) 서는데, 그 안의
  // 자식에 자리를 걸지 않아 모두 원점에 섰다 — 랜딩 노드 캔버스 목업의 월드(363.79, 24)가 부모 원점에 서서 목업 안 글자가 −370 옮겨졌다.
  if (!parentAuto && parent && spec.o) { node.x = spec.o[0]; node.y = spec.o[1]; }
  if ((isAbsolute || (!parentAuto && parent && spec.o)) && !isText) pendingAbsolute.push([node, spec.r, spec.o]);

  if (!isAbsolute) {
    const selfAuto = "layoutMode" in node && node.layoutMode && node.layoutMode !== "NONE";
    const apply = (axis, value) => {
      if (value === "FIXED") return;
      if (value === "HUG" && !selfAuto && !isText) return;
      if (value === "FILL" && !parentAuto) return;
      try { node[axis] = value; } catch (error) { /* 구조상 불가하면 측정 크기로 남는다 */ }
    };
    apply("layoutSizingHorizontal", h);
    apply("layoutSizingVertical", v);
    if (spec.ga && parent && parent.layoutMode === "GRID") {
      node.gridChildHorizontalAlign = spec.ga[0] || "AUTO";
      node.gridChildVerticalAlign = spec.ga[1] || "AUTO";
    }
    if (isText) node.textAutoResize = (h === "HUG" && v === "HUG") ? "WIDTH_AND_HEIGHT" : "HEIGHT";
    // 줄바꿈 없이 잘리는 글자(`white-space: nowrap` + `overflow: hidden`) — 한 줄에서 말줄임으로 자른다.
    if (isText && spec.tt && h !== "HUG") { try { node.textTruncation = "ENDING"; node.maxLines = 1; } catch (error) {} }
  }

  if (spec.mh) { try { node.minHeight = spec.mh; } catch (error) {} }
  if (spec.mw) { try { node.maxWidth = spec.mw; } catch (error) {} }
  if (spec.mn) { try { node.minWidth = spec.mn; } catch (error) {} }
  if (spec.xh) { try { node.maxHeight = spec.xh; } catch (error) {} }
  settleGridRows(node, spec);

  // margin — Figma Auto Layout에는 margin이 없다. 흐름 자식이 하나면 부모 padding으로 옮긴다.
  // **음수 margin은 0으로 막는다.** Figma는 음수 padding을 거부한다. CSS에서 음수 margin은 자식이
  // 부모 padding 밖으로 번지는(bleed) 동작인데, padding을 0까지 깎으면 같은 결과가 된다.
  if (spec.m && parent && parentAuto && !isAbsolute) {
    const flow = parent.children.filter((child) => child.layoutPositioning !== "ABSOLUTE");
    if (flow.length === 1) {
      const bleed = (side, delta) => { parent[side] = Math.max(0, (parent[side] || 0) + delta); };
      if (spec.m[3]) bleed("paddingLeft", spec.m[3]);
      if (spec.m[1]) bleed("paddingRight", spec.m[1]);
      if (spec.m[0]) bleed("paddingTop", spec.m[0]);
      if (spec.m[2]) bleed("paddingBottom", spec.m[2]);
    }
  }

  // 면은 크기·배치가 끝난 뒤에 건다. 인스턴스에는 걸지 않는다.
  if (!isText && !spec.i && !spec.im) applyPaint(node, spec);

  // 면을 가진 텍스트: 프레임 안에 실제 글자를 넣는다. 프레임의 padding/정렬이 그대로 배치를 잡는다.
  if (textInSurface) {
    const label = figma.createText();
    node.appendChild(label);
    applyTypography(label, spec);
    label.name = `text ${String(spec.x).slice(0, 18)}`;
    if (spec.l) {
      // 제품이 auto-layout(flex)으로 가운데 정렬한 버튼 — 부모 정렬을 그대로 쓴다.
      try { label.layoutSizingHorizontal = "HUG"; label.layoutSizingVertical = "HUG"; } catch (error) {}
    } else if (h === "HUG") {
      // **폭을 글자가 정하는 블록 버튼**(폭 선언 없음). 아래 갈래처럼 글자 상자를 측정 폭에 가두면, 글자 폭은
      // 브라우저와 Figma 가 달라 Figma 글꼴이 조금 넓게 그리는 순간 줄이 꺾인다(조립 규칙 28조). 실측 사고: 업로드
      // 보드의 Topic 칩이 「Spo / rts」 · 「Vlo / g」로 꺾였다. 면을 Auto Layout 으로 두고 글자를 hug 하며, 측정 크기는
      // 최소로 남기고(패딩이 측정 크기 안에 있다) `text-align` 을 주축 정렬로 옮긴다.
      node.layoutMode = "HORIZONTAL";
      node.itemSpacing = 0;
      node.primaryAxisAlignItems = spec.ta === "right" || spec.ta === "end" ? "MAX"
        : spec.ta === "left" || spec.ta === "start" ? "MIN" : "CENTER";
      node.counterAxisAlignItems = "CENTER";
      node.primaryAxisSizingMode = "AUTO";
      node.minWidth = Math.max(0.01, spec.r[0]);
      if (v === "HUG") { node.counterAxisSizingMode = "AUTO"; node.minHeight = Math.max(0.01, spec.r[1]); }
      else {
        node.counterAxisSizingMode = "FIXED";
        // **세로 FILL 이어도 측정 높이 밑으로 접히지 않는다(2026-09-30).** 내용 높이로 서는 줄(stretch) 안의 탭 버튼(패딩 6 · 테두리 1)은
        // 세로 FILL 인데, Figma 는 HUG 부모 안의 FILL 을 최소 크기로 접어 버튼이 글자 높이(21)로 눌렸다 — 부스 운영 보드의 탭 줄이
        // 35 → 23 이라 그 아래가 모두 12 올라갔다(보드 글자 자리 대조로 찾았다). 패딩이 측정 크기 안에 있으므로 측정 높이를 최소로 둔다.
        if (v === "FILL") node.minHeight = Math.max(0.01, spec.r[1]);
      }
      label.textAutoResize = "WIDTH_AND_HEIGHT";
    } else {
      // **flex가 아닌 블록 버튼**은 `text-align`으로만 글자를 가운데 놓는다. Figma에서 HUG로 두면
      // 글자가 (0,0)에 붙어 면 밖으로 삐져나온다. 실측 사고: `/subscription` 의 `Redeem a coupon`
      // 이 왼쪽으로 밀려 "edeem a coupon" 으로 잘렸다(스크린샷으로 확인).
      // 면을 가득 채우고 세로 가운데로 맞춰 블록 버튼과 같은 결과를 만든다.
      label.textAutoResize = "NONE";
      label.resize(Math.max(0.01, node.width), Math.max(0.01, node.height));
      label.textAlignVertical = "CENTER";
      try { label.constraints = { horizontal: "STRETCH", vertical: "STRETCH" }; } catch (error) {}
    }
  }

  // 헤어라인 b[5]: 박스 밖 선(레이아웃 뒤에만 걸린다)
  if (spec.b && node.layoutMode && node.layoutMode !== "NONE") node.strokesIncludedInLayout = !spec.b[5];

  for (const child of (spec.k || [])) buildNode(child, node);
  // **절대 자식이 늘린 grid 행을 걷는다(2026-10-08).** 절대 자식도 먼저 흐름 자식으로 붙어야 ABSOLUTE 가 걸리는데, `appendChild` 가 다음 빈 칸
  // 으로 새 행을 만들고 ABSOLUTE 뒤에도 그 행이 남는다 — 랜딩 푸터 트랙의 재생 막대(절대)가 여섯째 행(빈 HUG 100)을 남겨 부품이 100 길어졌고,
  // 그 인스턴스를 문 보드(`/inquiry` 1370 → 1470 · 홈 모바일)도 같이 길어졌다. 자식을 다 붙인 뒤 행 수를 계획 수로 되돌린다. 절대 자식이 그
  // 행을 붙들어 줄지 않으면 첫 칸으로 옮겨 다시 줄인다. 그래도 남으면 결과의 `gridTrackFailures` 로 드러낸다.
  if (node.type === "FRAME" && node.layoutMode === "GRID" && spec.l && spec.l[9] && spec.k) {
    const wantedRows = spec.gr || Math.max(1, Math.ceil(spec.k.filter((child) => !child.p).length / spec.l[9]));
    const trim = () => { if (node.gridRowCount > wantedRows) node.gridRowCount = wantedRows; return node.gridRowCount === wantedRows; };
    let trimmed = false;
    try { trimmed = trim(); } catch (error) {}
    if (!trimmed) {
      for (const kid of node.children) {
        if (kid.layoutPositioning === "ABSOLUTE" && kid.gridRowAnchorIndex >= wantedRows) { try { kid.setGridChildPosition(0, 0); } catch (error) {} }
      }
      try { trimmed = trim(); } catch (error) {}
      if (!trimmed) gridTrackFailures.push(`${spec.t} 행 수 ${node.gridRowCount} → ${wantedRows} 실패`);
    }
  }
  if (P.locale && spec.vv) pendingLocaleVisible.push([node, spec.vv]);

  // **아이콘은 측정한 도형으로 그린다(2026-09-30).** 생성기가 도형의 기하와 계산된 칠 · 획으로 조립한 SVG(`vs`)를 그리고, 칠 · 획은 값이
  // 같은 변수에 묶는다(다른 면과 같은 규칙 — 없으면 리터럴 + unboundColors). 그림은 측정 상자 크기라 흐름 자식으로 붙인다.
  if (spec.vs) {
    const glyph = figma.createNodeFromSvg(spec.vs);
    glyph.name = "glyph";
    glyph.fills = [];
    glyph.clipsContent = false;
    const channel = (value) => Math.round(value * 255).toString(16).padStart(2, "0");
    const rebind = (paints) => paints.map((paint) => (paint.type !== "SOLID" ? paint
      : hexToPaint(channel(paint.color.r) + channel(paint.color.g) + channel(paint.color.b) + ((paint.opacity ?? 1) < 1 ? channel(paint.opacity) : ""))));
    for (const shape of glyph.findAll((child) => "fills" in child)) {
      if (Array.isArray(shape.fills) && shape.fills.length) shape.fills = rebind(shape.fills);
      if (Array.isArray(shape.strokes) && shape.strokes.length) shape.strokes = rebind(shape.strokes);
    }
    node.appendChild(glyph);
  }

  // **HUG 행에서 칸이 전부 세로 FILL 이면 행이 접힌다.** CSS grid 는 칸 내용이 행 높이를 정하고 칸이 그 높이까지 늘어나는데
  // (stretch), Figma 의 HUG 행은 FILL 칸에 높이를 주지 못해 칸이 패딩만 남기고 접힌다. 칸 안에서 세로로 쌓는 부모의 FILL
  // 자식(flex-grow)도 같다 — 부모가 hug 하면 늘 자리가 없어 1px 로 접힌다. 실측 사고: `/subscription` 요금제 카드가 모바일
  // 64 · 데스크톱 48 로 접혀 내용이 잘렸다. 그래서 행마다 (1) 칸을 모두 HUG 로 두고 칸 안의 세로 FILL 사슬을 HUG 로 풀어
  // 내용 높이를 재고, (2) 가장 높은 칸만 HUG 로 남기고 나머지는 FILL 로 돌려 그 높이까지 늘인다 — 나란한 카드는 높은 쪽
  // HUG · 낮은 쪽 FILL. 가로로 쌓는 부모의 세로 FILL 은 늘이기(stretch)라 hug 부모 안에서도 성립하므로 두지 않는다.
  if (node.type === "FRAME" && node.layoutMode === "GRID" && spec.k && !Array.isArray(spec.l && spec.l[10])) {
    const columns = Math.max(1, (spec.l && spec.l[9]) || 1);
    const cells = spec.k.map((childSpec, index) => ({ childSpec, child: node.children[index] }))
      .filter(({ childSpec, child }) => child && !childSpec.p);
    const release = (parentNode) => {
      if (parentNode.type === "INSTANCE" || !("children" in parentNode)) return;
      const grows = parentNode.layoutMode === "VERTICAL" && parentNode.primaryAxisSizingMode === "AUTO";
      for (const kid of parentNode.children) {
        if (kid.layoutPositioning === "ABSOLUTE") continue;
        if (grows && kid.layoutSizingVertical === "FILL") {
          try { kid.layoutSizingVertical = "HUG"; } catch (error) { try { kid.layoutSizingVertical = "FIXED"; } catch (ignored) {} }
        }
        if (kid.layoutMode !== "GRID") release(kid);
      }
    };
    for (let start = 0; start < cells.length; start += columns) {
      const row = cells.slice(start, start + columns);
      if (!row.every(({ child }) => child.layoutSizingVertical === "FILL")) continue;
      for (const { childSpec, child } of row) {
        // 인스턴스 칸은 안쪽 배치를 컴포넌트가 정한다 — hug 로 풀지 않고 제품이 잰 칸 높이로 둔다.
        const measured = () => { child.layoutSizingVertical = "FIXED"; child.resize(child.width, Math.max(0.01, childSpec.r[1])); };
        if (child.type === "INSTANCE") { try { measured(); } catch (error) {} continue; }
        try { child.layoutSizingVertical = "HUG"; release(child); }
        catch (error) { try { measured(); } catch (ignored) {} }
      }
      const tallest = row.reduce((best, cell) => (cell.child.height > best.child.height ? cell : best));
      for (const cell of row) {
        if (cell !== tallest) { try { cell.child.layoutSizingVertical = "FILL"; } catch (error) {} }
      }
    }
  }
  return node;
};

/** 텍스트 스타일을 한 번에 건다 — 비동기라 트리를 다 만든 뒤에 돈다. */
const flushTextStyles = async () => {
  for (const [node, styleName] of pendingTextStyles) {
    const style = textStyleByName.get(styleName);
    if (!style) { missingTextStyles.add(styleName); continue; }
    try { await node.setTextStyleIdAsync(style.id); }
    catch (error) { missingTextStyles.add(`${styleName} (적용 실패)`); }
  }
  pendingTextStyles.length = 0;
  // **섞인 문단의 범위 서식(2026-09-30).** 문장 안의 굵은 글자 · 링크 색 · 밑줄 — 생성기가 문단을 글자 하나로 합치고 범위를 싣는다.
  for (const [node, ranges, measured] of pendingRanges) {
    for (const [start, end, weight, colour, underline, size, track] of ranges) {
      if (end <= start || end > node.characters.length) continue;
      if (weight) {
        let font = { family: "Pretendard", style: WEIGHT_STYLE[weight] ?? "Regular" };
        try { await figma.loadFontAsync(font); } catch (error) { font = { family: "Pretendard", style: "SemiBold" }; await figma.loadFontAsync(font); }
        node.setRangeFontName(start, end, font);
      }
      if (colour) node.setRangeFills(start, end, [hexToPaint(colour)]);
      if (underline) node.setRangeTextDecoration(start, end, "UNDERLINE");
      if (size) node.setRangeFontSize(start, end, size);
      // 요소 margin 을 옮긴 자간(생성기 richInlineText `track`) — 글자 스타일의 자간(px · %)을 px 로 풀어 더한다.
      if (track) {
        const held = node.getRangeLetterSpacing(start, end);
        const fontSize = node.getRangeFontSize(start, end);
        const base = held === figma.mixed ? 0 : held.unit === "PIXELS" ? held.value : held.value * (fontSize === figma.mixed ? 0 : fontSize) / 100;
        node.setRangeLetterSpacing(start, end, { unit: "PIXELS", value: base + track });
      }
    }
    // **첫 줄의 굵은 범위는 글자 상자를 1 키운다(2026-09-30).** Pretendard SemiBold 범위가 여러 줄 문단의 첫 줄에 있으면 Figma 의 높이 맞춤
    // 글자 상자가 줄 높이 합보다 1 높다(고정 px 줄 높이여도 같다 — 둘째 줄의 굵은 범위 · 한 줄 문단은 그대로, 복제본 실험). 개인정보 목록의
    // 「라벨: 설명」 항목이 하나마다 1 씩 키워 문서 끝이 100 내려갔다. 측정 높이보다 1 안쪽으로 높으면 측정 높이로 고정한다.
    // 폭 맞춤(WIDTH_AND_HEIGHT) 글자도 같다(2026-10-01) — 제품 줄을 옮긴 글자를 폭 맞춤으로 바꾸자 이 보정이 빠져 항목마다 다시 1 씩 커졌다.
    if (measured && (node.textAutoResize === "HEIGHT" || node.textAutoResize === "WIDTH_AND_HEIGHT") && node.height > measured + 0.5 && node.height <= measured + 1.5) {
      node.textAutoResize = "NONE";
      node.resize(node.width, measured);
    }
  }
  pendingRanges.length = 0;
  // 로캘 바인딩 — 글자 · 텍스트 스타일 · 범위 서식이 다 걸린 뒤.
  for (const [node, name] of pendingLocaleTexts) { node.setBoundVariable("characters", localeVarByName.get(name)); localeCounts.texts += 1; }
  pendingLocaleTexts.length = 0;
  for (const [node, name] of pendingLocaleVisible) { node.setBoundVariable("visible", localeVarByName.get(name)); localeCounts.visible += 1; }
  pendingLocaleVisible.length = 0;
};

const frame = await figma.getNodeByIdAsync(P.frameId);
if (!frame) throw new Error(`대상 프레임을 찾지 못했습니다: ${P.frameId} (${P.route})`);
await figma.setCurrentPageAsync(
  frame.parent && frame.parent.type === "PAGE" ? frame.parent
    : (frame.parent && frame.parent.parent && frame.parent.parent.type === "PAGE" ? frame.parent.parent : figma.currentPage),
);
const generatedName = `generated/${P.route} ${P.context.split("-")[0]}`;

let result;
if (P.head) {
  // 조각 0 — 옛 손수 내용은 지우지 않고 `legacy/…`로 묶어 숨긴다(되돌릴 근거 보존).
  const prior = frame.children.find((child) => child.name === generatedName);
  if (prior) prior.remove();
  const legacyName = `legacy/${P.route}`;
  let legacy = frame.children.find((child) => child.name === legacyName);
  if (!legacy) {
    const survivors = frame.children.filter((child) => child.name !== generatedName);
    if (survivors.length > 0) {
      legacy = figma.group(survivors, frame);
      legacy.name = legacyName;
      legacy.visible = false;
    }
  }
  frame.layoutMode = "VERTICAL";
  frame.primaryAxisSizingMode = "FIXED";
  frame.counterAxisSizingMode = "FIXED";
  frame.itemSpacing = 0;
  frame.paddingTop = frame.paddingRight = frame.paddingBottom = frame.paddingLeft = 0;
  frame.resize(P.frameSize[0], P.frameSize[1]);
  // **보드 틀의 크기 한계를 걷는다(2026-10-08, 조립 규칙 15조의 2).** 손 조립 시절의 틀(랜딩 · 약관 둘)에 최소 · 최대 폭(960 · 1920, 모바일
  // 402)이 남아 있어 보드를 2560 · 430 으로 넓혀도 틀이 1920 · 402 에 멈췄다(늘림 시험). 틀 크기는 이 러너가 정하고, 늘리고 줄이는 것은
  // 보는 사람의 몫이다.
  for (const key of ["minWidth", "maxWidth", "minHeight", "maxHeight"]) { try { frame[key] = null; } catch (error) {} }
  if (legacy) legacy.layoutPositioning = "ABSOLUTE";
  await preloadVariants(P.head);
  const root = buildNode(P.head, frame);
  root.name = generatedName;
  // 측정보다 내용이 길어지는 부품(`hugHeight`, 예시 부품의 감긴 각주 줄)은 틀 높이를 내용에 맞춘다 — 고정하면 아래가 넘친다.
  if (P.hugHeight) frame.primaryAxisSizingMode = "AUTO";
  // 측정 테마의 모드를 화면 루트에 고정한다 — 파일 기본 모드가 바뀌어도 보드가 측정과 같은 색으로 풀린다.
  // **Locale 컬렉션은 고정하지 않는다(DS-D-0081 3항).** 루트에 en 을 박으면 페이지 · 섹션에서 고른 언어가 보드에 닿지 않는다.
  live.pin(root);
  await flushTextStyles();
  settleAbsolute();
  // 글자 속성 부품: 세트에 TEXT 속성을 열고 글자 노드를 묶는다(빌더 PARTS 의 label).
  if (P.label) {
    const set = frame.parent, text = root.findOne((n) => n.type === "TEXT"), defs = set.componentPropertyDefinitions;
    const key = Object.keys(defs).find((k) => k.split("#")[0] === P.label && defs[k].type === "TEXT") || set.addComponentProperty(P.label, "TEXT", text.characters);
    text.componentPropertyReferences = { characters: key };
  }
  result = { chunk: 0, built: [Math.round(root.width), Math.round(root.height)], legacy: Boolean(legacy) };
} else {
  // 조각 n — path를 따라 대기 자리를 찾아 실제 서브트리로 바꾼다.
  // **대기 자리를 먼저 지운다.** margin→padding 이관은 "흐름 자식이 하나일 때"만 도는데,
  // 자리표시를 남긴 채 교체본을 만들면 흐름 자식이 둘로 보여 이관이 건너뛰어진다.
  const generatedRoot = frame.children.find((child) => child.name === generatedName);
  if (!generatedRoot) throw new Error(`조각 0을 먼저 돌려야 합니다: ${generatedName}`);
  // **한 조각이 자리 여럿을 채운다(2026-09-30).** 나누기가 떼어낸 형제를 한 조각에 묶어(`slots`, 조상 먼저) 조각 수를 줄인다 —
  // 약관처럼 문단이 많은 문서는 떼어낸 자리마다 조각 하나라 뷰포트마다 18 ~ 41 조각이었다. 옛 꼴(`path` · `spec`)도 읽는다.
  const slots = P.slots || [{ path: P.path, spec: P.spec }];
  const replaced = [];
  for (const slot of slots) {
    let target = generatedRoot;
    for (const index of slot.path) {
      if (!("children" in target) || !target.children[index]) {
        throw new Error(`대기 자리를 찾지 못했습니다: path=${slot.path.join(".")} (${P.route})`);
      }
      target = target.children[index];
    }
    const holder = target.parent;
    const at = holder.children.indexOf(target);
    await preloadVariants(slot.spec);
    target.remove();
    const built = buildNode(slot.spec, holder);
    holder.insertChild(at, built);
    placeGridChild(built, slot.spec);
    replaced.push(built.name);
  }
  await flushTextStyles();
  settleAbsolute();
  result = { chunk: slots.map((slot) => slot.path.join(".")).join(" "), replaced: replaced.join(" · ") };
}

return {
  ...result,
  boundColors: boundColors.size,
  gradients: gradientCount,
  unboundColors: [...unboundColors].sort(),
  missingTextStyles: [...missingTextStyles],
  ...(gridTrackFailures.length ? { gridTrackFailures } : {}),
  ...(P.locale ? { boundTexts: localeCounts.texts, boundVisible: localeCounts.visible, boundLabels: localeCounts.labels } : {}),
};
