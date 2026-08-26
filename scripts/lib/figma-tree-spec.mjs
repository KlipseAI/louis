// **측정 트리 → Figma 계층 spec.** 크기 출처 판정을 붙여 Auto Layout으로 조립할 수 있는 트리를 만든다.
//
// ## 왜 계층인가
//
// 기존 pricing 빌더는 측정 트리를 `shapes[]`/`texts[]`/`icons[]` 세 개의 **평탄한 리스트**로 바꾼다.
// 절대좌표로 그릴 때는 그래도 되지만, Auto Layout은 부모-자식 관계가 있어야 성립한다 —
// FILL은 "부모가 결정"이고 HUG는 "자식이 결정"이므로 계층 없이는 표현 자체가 불가능하다.
// 그래서 평탄화 대신 **계층을 보존한 spec**을 만든다.
//
// ## 무엇을 남기고 무엇을 버리는가
//
// - **남긴다**: 레이아웃에 기여하는 노드(자식이 있거나, 배경/테두리/그림자가 있거나, 텍스트/이미지인 것)
// - **버린다**: 보이지 않는 노드(`display:none`, 크기 0, `opacity:0`), 그리고 자식도 그림도 없는 빈 래퍼
//   — 이런 노드를 남기면 Auto Layout에 불필요한 중첩이 생겨 사람이 편집하기 나쁘다.
//
// rect는 **FIXED 축의 크기**와 **검증**에만 쓴다. FILL/HUG 축의 크기는 Figma가 계산하게 둔다.

import { matchTextStyle } from "./figma-louis-styles.mjs";
import { decideNode, toFigmaSizing, toLayoutMode, parseTracks, px } from "./sizing-provenance.mjs";

const TRANSPARENT = /^(transparent|rgba\(0,\s*0,\s*0,\s*0\))$/;

/** 이 노드가 눈에 보이는가. 보이지 않으면 Figma에 그리지 않는다. */
export function isVisible(node) {
  const style = node.style ?? {};
  if (style.display === "none") return false;
  if (style.visibility === "hidden") return false;
  if (Number(style.opacity ?? 1) === 0) return false;
  return node.rect.width > 0 && node.rect.height > 0;
}

/** 이 노드가 스스로 그릴 것을 가졌는가(면·테두리·그림자·텍스트·이미지). */
export function hasOwnPaint(node) {
  const style = node.style ?? {};
  if (node.ownText) return true;
  if (node.tag === "img" || node.tag === "svg") return true;
  if (style.backgroundColor && !TRANSPARENT.test(style.backgroundColor)) return true;
  if (style.backgroundImage && style.backgroundImage !== "none") return true;
  if (style.boxShadow && style.boxShadow !== "none") return true;
  for (const side of ["Top", "Right", "Bottom", "Left"]) {
    if (px(style[`border${side}Width`]) > 0) return true;
  }
  return false;
}

/**
 * auth-fixture 트리를 scenes 트리와 같은 모양으로 정규화한다.
 *
 * 두 측정기의 출력이 다르다:
 * - `product.scenes.json` — 노드에 `style` 객체가 통째로 들어 있다(축 97개).
 * - `product.auth-fixture.json` — 노드는 `styleRef`만 갖고 실제 값은 `computedStyles` 테이블(505개)에
 *   모여 있다. 같은 스타일을 쓰는 노드가 많아 이렇게 하면 파일이 훨씬 작다.
 *
 * 변환기는 `style`을 직접 읽으므로 여기서 참조를 풀어 준다. 원본을 건드리지 않고 새 객체를 만든다.
 */
export function normalizeAuthFixtureTree(tree, computedStyles) {
  const table = new Map(computedStyles.map((entry) => [entry.id, entry.value]));
  return tree.map((node) => {
    const style = table.get(node.styleRef);
    if (!style) throw new Error(`[figma-tree-spec] styleRef를 찾지 못했습니다: ${node.styleRef} (${node.path})`);
    return { ...node, style };
  });
}

/** 측정 트리(평탄 배열)를 path 기준 계층으로 되돌린다. */
export function buildHierarchy(tree, rootPath = "main") {
  const byPath = new Map(tree.map((node) => [node.path, node]));
  const childrenOf = new Map();
  for (const node of tree) {
    if (node.path === rootPath) continue;
    const parentPath = node.path.slice(0, node.path.lastIndexOf("."));
    if (!childrenOf.has(parentPath)) childrenOf.set(parentPath, []);
    childrenOf.get(parentPath).push(node);
  }
  // 경로의 마지막 인덱스로 정렬해 문서 순서를 지킨다(문자열 정렬은 10이 2보다 앞선다).
  for (const list of childrenOf.values()) {
    list.sort((a, b) => {
      const ai = Number(a.path.slice(a.path.lastIndexOf(".") + 1));
      const bi = Number(b.path.slice(b.path.lastIndexOf(".") + 1));
      return ai - bi;
    });
  }
  return { byPath, childrenOf };
}

/**
 * 측정 트리를 Figma 계층 spec으로 바꾼다.
 *
 * @param {object[]} tree 측정 노드 배열(각 노드에 `path`·`rect`·`style`·선택적 `declared`)
 * @param {{rootPath?: string, contextId?: string}} options
 * @returns {{spec: object, stats: object}}
 */
export function toFigmaTreeSpec(tree, options = {}) {
  const rootPath = options.rootPath ?? "main";
  const contextId = options.contextId ?? null;
  const { byPath, childrenOf } = buildHierarchy(tree, rootPath);
  const stats = { total: tree.length, kept: 0, droppedInvisible: 0, droppedEmpty: 0, unresolved: [] };

  const convert = (node, parent) => {
    if (!isVisible(node)) { stats.droppedInvisible += 1; return null; }

    const childIndex = node.path === rootPath
      ? null
      : Number(node.path.slice(node.path.lastIndexOf(".") + 1));
    const decision = decideNode({
      declared: node.declared ?? {},
      computed: node.style ?? {},
      parentComputed: parent?.style ?? null,
      parentDeclared: parent?.declared ?? null,
      childIndex,
      tag: node.tag,
      contextId,
    });
    const sizing = toFigmaSizing(decision);
    for (const reason of sizing.unresolved) {
      stats.unresolved.push({ path: node.path, tag: node.tag, reason });
    }

    const rawChildren = childrenOf.get(node.path) ?? [];
    const children = rawChildren.map((child) => convert(child, node)).filter(Boolean);

    // 자식도 없고 스스로 그릴 것도 없으면 버린다 — Auto Layout에 빈 껍데기를 남기지 않는다.
    if (children.length === 0 && !hasOwnPaint(node)) { stats.droppedEmpty += 1; return null; }

    const style = node.style ?? {};
    // 흐름 방향은 자식의 display가 결정한다(inline 형제는 가로로 흐른다).
    const layoutMode = toLayoutMode(style, rawChildren.map((child) => child.style ?? {}));
    stats.kept += 1;
    return {
      path: node.path,
      tag: node.tag,
      name: node.classAttr ? `${node.tag}.${node.path}` : node.path,
      text: node.ownText || null,
      textLines: node.ownTextLines?.length ? node.ownTextLines : null,
      // 스스로 그리는 것이 있는가(면·테두리·그림자·이미지). 래퍼 접기 판정과 색 이관에 쓴다.
      paints: hasOwnPaint(node),
      // rect는 FIXED 축 크기와 검증용이다. FILL/HUG 축은 Figma가 계산한다.
      rect: node.rect,
      sizing,
      // **색·테두리·radius·그림자·불투명도.** 측정에 없는 값은 담지 않는다.
      paint: paintOf(style),
      // **타이포.** 텍스트를 직접 가진 노드만. LOUIS 텍스트 스타일 이름으로 바꿔 싣는다.
      typography: (node.ownText || node.ownTextLines?.length) ? typographyOf(style) : null,
      // **절대 배치는 spec에 반드시 남긴다.** 안 남기면 Figma에서 일반 auto-layout 자식이 되어
      // 흐름에 끼어든다. 실측 사고: `/settings` 사이드바는 `position:fixed`라 흐름에서 빠지고 메인이
      // x=280부터 시작하는데, 이 정보를 잃자 부모가 column이라는 이유로 사이드바 아래에 메인이
      // 세로로 쌓였다(사이드바 y=0, 메인 y=540). 제품은 가로로 나란하다.
      positioning: decision.absolute ? "ABSOLUTE" : "AUTO",
      // **margin은 반드시 담는다.** Figma Auto Layout에는 margin이 없으므로 부모의 padding으로 옮겨야
      // 하는데, 그 값이 spec에 없으면 형제가 겹친다. 실측 사고: `/mypage/topup/fail`의 main은
      // `margin-left:280px`(= `var(--app-gnb-sidebar-width)`)로 사이드바 옆에 놓이는데, 이 값을 잃자
      // main이 x=0에서 1920 폭으로 그려져 **사이드바를 통째로 덮었다**.
      margin: {
        top: px(style.marginTop) ?? 0,
        right: px(style.marginRight) ?? 0,
        bottom: px(style.marginBottom) ?? 0,
        left: px(style.marginLeft) ?? 0,
      },
      // ABSOLUTE 노드는 부모 기준 좌표와 제약이 필요하다.
      offset: decision.absolute && parent
        ? { x: node.rect.x - parent.rect.x, y: node.rect.y - parent.rect.y }
        : null,
      constraints: decision.absolute ? constraintsFor(node.declared ?? {}) : null,
      why: { horizontal: decision.h, vertical: decision.v },
      layout: layoutMode === "NONE" ? null : {
        layoutMode,
        // itemSpacing은 **주축** 간격이다 — 세로 배치면 row-gap, 가로 배치면 column-gap.
        itemSpacing: (layoutMode === "VERTICAL"
          ? px(style.rowGap ?? style.gap)
          : px(style.columnGap ?? style.gap)) ?? 0,
        counterAxisSpacing: (layoutMode === "VERTICAL"
          ? px(style.columnGap)
          : px(style.rowGap)) ?? null,
        wrap: style.flexWrap === "wrap",
        padding: {
          top: px(style.paddingTop) ?? 0,
          right: px(style.paddingRight) ?? 0,
          bottom: px(style.paddingBottom) ?? 0,
          left: px(style.paddingLeft) ?? 0,
        },
        // **GRID는 열 개수를 함께 줘야 한다.** Figma는 `gridColumnCount`가 없으면 기본 2열로 깔아
        // 4열 카드가 2열로 접힌다. 열 수는 선언된 `grid-template-columns`를 펼쳐 센다(computed는
        // 이미 px로 풀려 `repeat()`을 복원할 수 없지만 트랙 개수는 그대로 살아 있다).
        columns: layoutMode === "GRID" ? gridColumns(node, style) : null,
        align: {
          counterAxis: liftChildAlign(cssAlignToFigma(style.alignItems), rawChildren, children),
          primaryAxis: cssJustifyToFigma(style.justifyContent),
        },
      },
      clipsContent: style.overflow === "hidden" || style.overflowX === "hidden",
      children,
    };
  };

  const root = byPath.get(rootPath);
  if (!root) throw new Error(`[figma-tree-spec] 루트 경로를 찾지 못했습니다: ${rootPath}`);
  const converted = convert(root, null);
  const collapsed = options.collapseWrappers === false ? converted : collapseWrappers(converted, stats);
  return { spec: collapsed, stats };
}

/**
 * **의미 없는 래퍼를 접는다.** 제품 DOM은 스타일 훅을 위해 빈 div를 겹겹이 쌓는데, 그대로 옮기면
 * Figma에서 13단계 중첩이 되어 디자이너가 편집하기 나쁘고 payload도 커진다.
 *
 * 접어도 안전한 조건(전부 만족해야 한다):
 *   - 자식이 정확히 하나
 *   - 스스로 그리는 것이 없다(면·테두리·그림자·텍스트)
 *   - padding·clip·min/max가 없다 — 있으면 레이아웃에 기여하므로 남긴다
 *   - 절대 배치가 아니다 — 좌표 기준점이므로 남긴다
 *   - margin이 없다 — 부모 padding으로 옮겨야 하므로 남긴다
 *   - **크기 판정이 자식과 같다** — 다르면 접는 순간 반응 방식이 바뀐다(가장 중요한 조건)
 */
export function collapseWrappers(node, stats = null) {
  const children = node.children.map((child) => collapseWrappers(child, stats));
  const isPassThrough = (candidate) => {
    if (candidate.children.length !== 1) return false;
    if (candidate.text) return false;
    // 스스로 그리는 것이 있으면(면·테두리·그림자) 접는 순간 그 그림이 사라진다.
    if (candidate.paints) return false;
    if (candidate.positioning === "ABSOLUTE") return false;
    if (candidate.clipsContent) return false;
    if (candidate.sizing.minWidth || candidate.sizing.maxWidth) return false;
    if (candidate.sizing.minHeight || candidate.sizing.maxHeight) return false;
    const m = candidate.margin;
    if (m && (m.top || m.right || m.bottom || m.left)) return false;
    const p = candidate.layout?.padding;
    if (p && (p.top || p.right || p.bottom || p.left)) return false;
    const only = candidate.children[0];
    if (only.positioning === "ABSOLUTE") return false;
    // 크기 판정이 다르면 접는 순간 리사이즈 반응이 달라진다.
    return candidate.sizing.layoutSizingHorizontal === only.sizing.layoutSizingHorizontal
      && candidate.sizing.layoutSizingVertical === only.sizing.layoutSizingVertical;
  };
  const self = { ...node, children };
  if (isPassThrough(self)) {
    if (stats) stats.collapsedWrappers = (stats.collapsedWrappers ?? 0) + 1;
    return self.children[0];
  }
  return self;
}

/**
 * 절대 배치 노드의 Figma 제약을 CSS `left/right/top/bottom` 선언에서 정한다.
 * 양쪽이 다 있으면 늘어나고(STRETCH), 한쪽만 있으면 그쪽에 붙는다.
 * 제품 사이드바처럼 `left`만 있는 fixed 요소는 MIN(왼쪽 고정)이 정답이다.
 */
export function constraintsFor(declared) {
  const has = (value) => value != null && value !== "auto" && value !== "";
  return {
    horizontal: has(declared.left) && has(declared.right) ? "STRETCH"
      : has(declared.right) ? "MAX" : "MIN",
    vertical: has(declared.top) && has(declared.bottom) ? "STRETCH"
      : has(declared.bottom) ? "MAX" : "MIN",
  };
}

/** CSS `align-items` → Figma `counterAxisAlignItems`. */
export function cssAlignToFigma(value) {
  switch (value) {
    case "center": return "CENTER";
    case "flex-end": case "end": return "MAX";
    case "baseline": return "BASELINE";
    case "flex-start": case "start": return "MIN";
    default: return null; // normal/stretch 는 Figma 기본(늘어남)과 같다
  }
}

/**
 * CSS 색 → `rrggbb` 또는 `rrggbbaa`(16진). 완전 투명이면 null.
 * 측정값은 전부 `rgb()`/`rgba()` 형태다(실측 확인).
 */
export function cssColorToHex(value) {
  const match = /^rgba?\(([^)]+)\)$/.exec(String(value ?? "").trim());
  if (!match) return null;
  const parts = match[1].split(",").map((part) => Number(part.trim()));
  const [r, g, b] = parts;
  if (![r, g, b].every(Number.isFinite)) return null;
  const alpha = parts.length > 3 && Number.isFinite(parts[3]) ? parts[3] : 1;
  if (alpha <= 0) return null;
  const to = (channel) => Math.round(channel).toString(16).padStart(2, "0");
  return `${to(r)}${to(g)}${to(b)}${alpha >= 0.999 ? "" : to(alpha * 255)}`;
}

/**
 * CSS `box-shadow` → Figma DROP_SHADOW/INNER_SHADOW 목록.
 * 제품이 쓰는 값은 3종뿐이며(실측) 형태는 `<color> x y blur spread [inset]` 이다.
 * 해석하지 못한 그림자는 **버린다** — 지어내지 않는다.
 */
export function parseBoxShadow(value) {
  if (!value || value === "none") return null;
  const shadows = [];
  for (const piece of String(value).split(/,(?![^(]*\))/)) {
    const raw = piece.trim();
    if (!raw) continue;
    const inset = /(^|\s)inset(\s|$)/.test(raw);
    const colorMatch = /rgba?\([^)]+\)/.exec(raw);
    const color = colorMatch ? cssColorToHex(colorMatch[0]) : null;
    if (!color) continue;
    const numbers = raw.replace(/rgba?\([^)]+\)/, "").replace(/inset/, "")
      .trim().split(/\s+/).map((token) => px(token)).filter((n) => n != null);
    if (numbers.length < 2) continue;
    const [x, y, blur = 0, spread = 0] = numbers;
    shadows.push({ inset, color, x, y, blur, spread });
  }
  return shadows.length ? shadows : null;
}

/** 면 관련 측정값을 spec 형태로. 그릴 게 하나도 없으면 null. */
function paintOf(style) {
  const fill = cssColorToHex(style.backgroundColor);
  const widths = ["borderTopWidth", "borderRightWidth", "borderBottomWidth", "borderLeftWidth"]
    .map((axis) => px(style[axis]) ?? 0);
  // 테두리 색은 지정이 없으면 `currentColor`로 떨어지므로 **두께가 0보다 클 때만** 의미가 있다.
  const strokeColor = widths.some((width) => width > 0) ? cssColorToHex(style.borderTopColor) : null;
  const stroke = strokeColor ? { color: strokeColor, widths } : null;
  const radii = ["borderTopLeftRadius", "borderTopRightRadius", "borderBottomRightRadius", "borderBottomLeftRadius"]
    .map((axis) => px(style[axis]) ?? 0);
  const radius = radii.some((value) => value > 0) ? radii : null;
  const shadow = parseBoxShadow(style.boxShadow);
  const rawOpacity = Number(style.opacity);
  const opacity = Number.isFinite(rawOpacity) && rawOpacity < 1 ? rawOpacity : null;
  if (!fill && !stroke && !radius && !shadow && opacity == null) return null;
  return { fill, stroke, radius, shadow, opacity };
}

/**
 * 타이포 측정값 → LOUIS 텍스트 스타일 이름 + 색.
 * 스타일이 안 맞으면 `style: null` 로 두고 숫자를 그대로 남긴다 — 렌더러가 직접 세운다.
 */
function typographyOf(style) {
  const size = px(style.fontSize);
  if (!size) return null;
  const weight = Number(style.fontWeight) || 400;
  const lineHeight = style.lineHeight === "normal" ? null : px(style.lineHeight);
  const letterSpacing = style.letterSpacing === "normal" ? 0 : (px(style.letterSpacing) ?? 0);
  return {
    style: matchTextStyle({ size, weight, lineHeight, letterSpacing }),
    size, weight, lineHeight, letterSpacing,
    color: cssColorToHex(style.color),
    align: /^(center|right|justify)$/.test(style.textAlign ?? "") ? style.textAlign : null,
  };
}

/** grid 컨테이너의 열 개수 — 선언을 먼저 보고, 없으면 computed의 px 트랙을 센다. */
function gridColumns(node, style) {
  const declared = parseTracks(node.declared?.["grid-template-columns"]);
  if (declared?.length) return declared.length;
  const computed = parseTracks(style.gridTemplateColumns);
  if (computed?.length && computed[0] !== "none") return computed.length;
  return null;
}

/**
 * 자식들의 `align-self`를 부모의 `counterAxisAlignItems`로 끌어올린다.
 *
 * **Figma에는 자식별 교차축 정렬이 없다.** Plugin API 문서가 못박고 있다 — `layoutAlign`의
 * `MIN`/`CENTER`/`MAX`는 폐기됐고 교차축 정렬은 프레임 하나에 걸려 모든 자식에 똑같이 적용된다.
 * 그래서 자식 하나만 `align-self:center`인 CSS를 그대로는 옮길 수 없다.
 *
 * 다만 **교차축이 FILL인 자식은 정렬 값과 무관하게 부모를 채우므로** 정렬 판정에서 빼도 된다.
 * 남은(=크기가 콘텐츠나 고정으로 정해지는) 자식들의 `align-self`가 하나로 모이면 그 값을 부모에
 * 올려도 결과가 같다. 실측 사례: `/mypage/topup/fail`의 `main`은 자식이 둘인데 상단 바는 FILL,
 * 상태 섹션만 `align-self:center`다. 부모를 CENTER로 두면 섹션은 가운데, 상단 바는 그대로 꽉 찬다.
 *
 * 값이 갈리면 올리지 않는다 — 틀린 정렬을 전부에 강제하느니 CSS 기본을 남긴다.
 */
function liftChildAlign(fallback, rawChildren, specChildren) {
  const wanted = new Set();
  for (let index = 0; index < rawChildren.length; index += 1) {
    const spec = specChildren[index];
    if (!spec || spec.positioning === "ABSOLUTE") continue;
    const style = rawChildren[index].style ?? {};
    const declared = rawChildren[index].declared?.["align-self"] ?? style.alignSelf;
    const figma = cssAlignToFigma(declared);
    if (!figma) continue;
    wanted.add(figma);
  }
  if (wanted.size !== 1) return fallback;
  return [...wanted][0];
}

/** CSS `justify-content` → Figma `primaryAxisAlignItems`. */
export function cssJustifyToFigma(value) {
  switch (value) {
    case "center": return "CENTER";
    case "flex-end": case "end": return "MAX";
    case "space-between": return "SPACE_BETWEEN";
    case "flex-start": case "start": return "MIN";
    default: return null;
  }
}
