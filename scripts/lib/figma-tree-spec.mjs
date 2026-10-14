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
import { decideNode, gridAutoPlacementColumn, toFigmaSizing, toLayoutMode, parseTracks, px } from "./sizing-provenance.mjs";

const TRANSPARENT = /^(transparent|rgba\(0,\s*0,\s*0,\s*0\))$/;

/** 이 노드가 눈에 보이는가. 보이지 않으면 Figma에 그리지 않는다. */
export function isVisible(node) {
  const style = node.style ?? {};
  if (style.display === "none") return false;
  if (style.visibility === "hidden") return false;
  if (Number(style.opacity ?? 1) === 0) return false;
  // **화면에서 숨긴 스크린리더 전용 요소(2026-09-30).** `sr-only`(1×1 · overflow hidden · clip)는 보조 기술만 읽는다 — 옮기면 1px 폭
  // 글자 상자가 되어 한 글자씩 세로로 늘어섰다(랜딩 후기 밴드의 「“ Klipse reviews ”」).
  if (node.rect.width <= 1 && node.rect.height <= 1 && /hidden|clip/.test(`${style.overflow ?? ""} ${style.overflowX ?? ""}`)) return false;
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
    // **입력칸의 값은 그 칸의 글자다(2026-09-29).** 값은 글자 노드가 아니라 측정기가 `value` 로 따로 싣는다 — 쿠폰 수량
    // 입력칸의 「1」이 보드에서 비어 있었다. 제품이 그 칸에 그 글자를 그리므로 글자로 옮긴다.
    if (node.vector?.bbox && GLYPH_SHAPES.has(node.tag)) {
      // **svg 상자 밖으로 넘친 도형(2026-10-07).** 측정기가 React Flow 연결선처럼 제 상자 밖으로 넘치는 svg 안의 도형을 svg 없이 싣는다(`vector.bbox`).
      // 흐름에 끼지 않게 절대 배치로 두고, 변환기가 그 상자로 도형 하나짜리 svg 를 만든다(looseShapeMarkup).
      return { ...node, looseShape: true, style: { ...style, position: "absolute" } };
    }
    if (!node.value && !node.ownText && node.placeholderColor && node.placeholder?.trim()) {
      // **비어 있는 입력칸의 placeholder(2026-10-07).** 제품은 그 칸에 placeholder 를 `::placeholder` 색으로 그린다 — 색만 그 값으로 덮는다.
      return { ...node, ownText: node.placeholder, style: { ...style, color: node.placeholderColor } };
    }
    return { ...node, ...(node.value && !node.ownText ? { ownText: node.value } : {}), style };
  });
}

/**
 * 측정 트리(평탄 배열)를 계층으로 되돌린다.
 *
 * 부모는 측정기가 적은 `parentPath` 를 따른다. `display: contents` 요소는 상자가 없어 싣지 않고, 그 자식을
 * 가장 가까운 보이는 조상에 붙여 적는다 — 레이아웃에서도 그 자식은 조상의 흐름에 든다. 경로를 잘라 부모를
 * 구하면 그 자식들이 없는 부모에 매달려 통째로 사라진다. 실측 사고(2026-09-28): 로그아웃 fixture 의 인증
 * 화면 모바일 여덟 장이 측정 노드 23 중 3 만 남아 빈 보드가 됐다(인증 2열의 오른쪽 칸이 모바일에서
 * `display: contents`). `parentPath` 가 없는 측정만 경로를 자른다.
 *
 * 부모를 찾지 못한 노드가 하나라도 있으면 멈춘다 — 조용히 빠진 노드는 빈 보드로 보내진다.
 */
export function buildHierarchy(tree, rootPath = "main") {
  const byPath = new Map(tree.map((node) => [node.path, node]));
  const childrenOf = new Map();
  const orphans = [];
  for (const node of tree) {
    // 측정 루트(`parentPath: null`)는 부모가 없다. 부품처럼 화면 트리 전체를 넘기고 그 안의 가지를 루트로 삼을
    // 때도 화면 루트가 여기로 온다.
    if (node.path === rootPath || node.parentPath === null) continue;
    const parentPath = typeof node.parentPath === "string"
      ? node.parentPath
      : node.path.slice(0, node.path.lastIndexOf("."));
    if (!byPath.has(parentPath)) { orphans.push(`${node.path} → ${parentPath}`); continue; }
    if (!childrenOf.has(parentPath)) childrenOf.set(parentPath, []);
    childrenOf.get(parentPath).push(node);
  }
  if (orphans.length > 0) {
    throw new Error(
      `[figma-tree-spec] 부모를 트리에서 찾지 못한 노드 ${orphans.length}개 — 이대로면 그 가지가 보드에서 사라집니다: ` +
        orphans.slice(0, 5).join(", "),
    );
  }
  // 문서 순서로 정렬한다 — 경로를 마디마다 수로 비교한다. 문자열 정렬은 10 이 2 보다 앞서고, 끝 마디만 보면
  // `display: contents` 를 건너 올라온 손자가 형제 사이에서 제 자리를 잃는다.
  const documentOrder = (a, b) => {
    const left = a.path.split(".");
    const right = b.path.split(".");
    for (let i = 0; i < Math.min(left.length, right.length); i += 1) {
      if (left[i] === right[i]) continue;
      const l = Number(left[i]);
      const r = Number(right[i]);
      if (Number.isFinite(l) && Number.isFinite(r)) return l - r;
      return left[i] < right[i] ? -1 : 1;
    }
    return left.length - right.length;
  };
  for (const list of childrenOf.values()) list.sort(documentOrder);
  return { byPath, childrenOf };
}

/**
 * 측정 트리를 Figma 계층 spec으로 바꾼다.
 *
 * @param {object[]} tree 측정 노드 배열(각 노드에 `path`·`rect`·`style`·선택적 `declared`)
 * @param {{rootPath?: string, contextId?: string}} options
 * @returns {{spec: object, stats: object}}
 */
/**
 * 텍스트와 요소 자식을 **동시에** 가진 노드는 텍스트를 별도 자식으로 떼어낸다.
 *
 * Figma에는 "자식이 있으면서 자기 글자도 가진 프레임"이 없다. 떼어내지 않으면 렌더러가 그 노드를
 * 프레임으로 그리고 글자를 버린다. 실측 사고: `/settings` 테마 토글의 `System`·`Light`·`Dark`가
 * 각각 svg 아이콘 자식을 갖고 있어 **라벨이 통째로 사라지고 아이콘만 남았다**(스크린샷으로 확인).
 * 같은 화면의 `KOR`·`ENG`·`JPN`은 아이콘이 없어 멀쩡히 나와 대조가 됐다.
 *
 * 끼워 넣는 자리는 **측정된 글자 줄의 rect**로 정한다 — DOM 순서가 아니라 실제로 보이는 자리다.
 * 읽기 순서 기준으로 글자보다 뒤에 오는 첫 자식 앞에 넣는다.
 */
function splitOwnText(node, children) {
  if (!node.ownText || children.length === 0) return null;
  const style = node.style ?? {};
  const lines = node.ownTextLines ?? [];
  // 주축 방향 — 세로로 쌓이면 y로, 아니면 x로 자리를 판정한다.
  const vertical = /^column/.test(style.flexDirection ?? "") && /flex|grid/.test(style.display ?? "");
  const axis = vertical ? "y" : "x";
  const extent = vertical ? "height" : "width";
  const padStart = px(vertical ? style.paddingTop : style.paddingLeft) ?? 0;

  let at;
  let rect;
  if (lines.length > 0) {
    // 줄 rect가 있으면(scenes 측정) 실제 보이는 자리로 정확히 끼운다.
    const left = Math.min(...lines.map((line) => line.x));
    const top = Math.min(...lines.map((line) => line.y));
    const right = Math.max(...lines.map((line) => line.x + line.width));
    const bottom = Math.max(...lines.map((line) => line.y + line.height));
    rect = { x: left, y: top, width: right - left, height: bottom - top };
    const near = vertical ? bottom : right;
    const index = children.findIndex((child) => child.rect[axis] >= near - 0.5);
    at = index < 0 ? children.length : index;
  } else {
    // 줄 rect가 없으면(auth-fixture) **첫 자식이 콘텐츠 시작에 붙어 있는지**로 판정한다.
    // 붙어 있으면 글자는 자식들 뒤, 아니면 앞이다.
    // **DOM 순서가 있으면 그 순서로 끼운다(2026-10-01).** 위 판정은 flex 열이 아니면 가로로 재서, 블록 흐름의 `<li>글자<ul>…</ul></li>`
    // 에서 「목록이 왼쪽 시작에 붙어 있다 → 글자는 뒤」로 갔다 — 약관 · 개인정보의 「… in the following cases:」가 하위 목록 아래로
    // 내려가 목록이 61 위에 섰다(보드 끝은 같아 끝 대조로는 안 보이고 글자 대조로 찾았다). 측정기가 싣는 조각 순서(`inlineRuns` — 글자
    // 조각과 요소 자식 순번)에서 첫 글자 조각 뒤에 오는 첫 자식 앞에 넣고, 자식이 콘텐츠 폭을 채우는 블록 흐름이면 세로로 쌓인 것으로 본다.
    const runs = Array.isArray(node.inlineRuns) ? node.inlineRuns : null;
    const firstText = runs ? runs.findIndex((run) => typeof run === "string" && run.trim()) : -1;
    const contentWidth = node.rect.width - (px(style.paddingLeft) ?? 0) - (px(style.paddingRight) ?? 0)
      - (px(style.borderLeftWidth) ?? 0) - (px(style.borderRightWidth) ?? 0);
    const blockFlow = firstText >= 0 && !/flex|grid/.test(style.display ?? "")
      && children.every((child) => child.rect.width >= contentWidth - 1);
    const stacked = vertical || blockFlow;
    if (firstText >= 0) {
      const runOf = (child) => runs.indexOf(Number(child.path.slice(node.path.length + 1)));
      const index = children.findIndex((child) => runOf(child) > firstText);
      at = index < 0 ? children.length : index;
    } else {
      const first = children[0].rect[axis] - node.rect[axis];
      at = first <= padStart + 0.5 ? children.length : 0;
    }
    const span = children.reduce((sum, child) => sum + child.rect[stacked ? "height" : extent], 0);
    const top = blockFlow && at > 0 ? children[at - 1].rect.y + children[at - 1].rect.height : node.rect.y;
    rect = stacked
      ? { x: node.rect.x, y: top, width: node.rect.width, height: Math.max(0, node.rect.height - span) }
      : flexRowTextRect(node, style, children, at) ?? { x: node.rect.x, y: node.rect.y, width: Math.max(0, node.rect.width - span), height: node.rect.height };
  }

  const textChild = {
    path: `${node.path}.t`,
    tag: "span",
    name: `${node.path}.t`,
    text: node.ownText,
    textLines: lines.length > 0 ? lines : null,
    ...(node.wrapLines ? { wrapLines: node.wrapLines } : {}),
    paints: true,
    rect,
    sizing: {
      layoutSizingHorizontal: "HUG",
      layoutSizingVertical: "HUG",
      layoutPositioning: "AUTO",
      minWidth: null, maxWidth: null, minHeight: null, maxHeight: null,
      unresolved: [],
    },
    paint: null,
    typography: typographyOf(style),
    positioning: "AUTO",
    margin: { top: 0, right: 0, bottom: 0, left: 0 },
    offset: null,
    constraints: null,
    why: {
      horizontal: { verdict: "HUG", reason: "own-text-split" },
      vertical: { verdict: "HUG", reason: "own-text-split" },
    },
    layout: null,
    children: [],
  };
  return [...children.slice(0, at), textChild, ...children.slice(at)];
}

/**
 * **flex 행의 떼어낸 글자는 익명 flex 항목의 상자다(2026-10-08).** 줄 rect 가 없는 원장에서 가로로 놓인 글자 조각을 노드 상자 − 자식 폭으로
 * 잡자 패딩 · 간격이 글자 폭에 들고 높이는 노드 높이를 그대로 받았다 — 캔버스 줌 트리거(「82%」 + 캐럿 svg, 높이 36 · 줄 높이 14)의 글자가
 * 57 × 36, 「2.57 줄로 감긴 글자」로 읽혀 부품이 멈췄다. CSS 에서 flex 컨테이너 안의 글자 조각은 익명 flex 항목이다 — 폭은 이웃 항목 사이
 * (간격 `column-gap` 을 뺀다), 높이는 교차축 정렬이 stretch 면 콘텐츠 상자 높이, 아니면 줄 높이 × 측정 줄 수(`wrapLines`, 없으면 한 줄)다.
 * 이웃이 한쪽뿐이면 남는 공간이 없다고 보고(내용 폭 컨테이너) `justify-content: center` 만 양쪽 여백을 같게 둔다. 감기는 flex 행 · 절대 배치
 * 자식은 자리가 다르게 정해져 보지 않는다(종전 상자). 판정만 바뀐다 — 글자는 HUG 라 렌더러가 폭을 글자로 정한다.
 */
function flexRowTextRect(node, style, children, at) {
  if (!/flex/.test(style.display ?? "") || /^column/.test(style.flexDirection ?? "") || style.flexWrap === "wrap") return null;
  const edge = (side) => (px(style[`padding${side}`]) ?? 0) + (px(style[`border${side}Width`]) ?? 0);
  const inner = {
    left: node.rect.x + edge("Left"), right: node.rect.x + node.rect.width - edge("Right"),
    top: node.rect.y + edge("Top"), bottom: node.rect.y + node.rect.height - edge("Bottom"),
  };
  const inFlow = (child) => child.positioning !== "ABSOLUTE";
  const flow = children.filter(inFlow);
  const gap = px(style.columnGap) ?? 0;
  const outerLeft = (child) => child.rect.x - (child.margin?.left ?? 0);
  const outerRight = (child) => child.rect.x + child.rect.width + (child.margin?.right ?? 0);
  const prev = children.slice(0, at).filter(inFlow).at(-1);
  const next = children.slice(at).find(inFlow);
  const span = flow.reduce((sum, child) => sum + outerRight(child) - outerLeft(child), 0);
  const packed = Math.max(0, inner.right - inner.left - span - gap * flow.length);
  const centred = /^(center|safe center)$/.test(style.justifyContent ?? "");
  let left = prev ? outerRight(prev) + gap : null;
  let right = next ? outerLeft(next) - gap : null;
  if (left == null && right == null) { left = inner.left; right = inner.right; }
  if (left == null) left = centred ? inner.left + (inner.right - outerRight(flow.at(-1))) : Math.max(inner.left, right - packed);
  if (right == null) right = centred ? inner.right - (outerLeft(flow[0]) - inner.left) : Math.min(inner.right, left + packed);
  const contentHeight = Math.max(0, inner.bottom - inner.top);
  const align = style.alignItems ?? "normal";
  const lineHeight = px(style.lineHeight);
  const lines = Array.isArray(node.wrapLines) && node.wrapLines.length > 0 ? node.wrapLines.length : 1;
  const stretch = /^(normal|stretch)$/.test(align) || !lineHeight;
  const height = stretch ? contentHeight : Math.min(contentHeight, lineHeight * lines);
  const top = stretch || /^(flex-start|start|self-start|baseline|first baseline)$/.test(align) ? inner.top
    : /^(flex-end|end|self-end|last baseline)$/.test(align) ? inner.bottom - height
      : inner.top + (contentHeight - height) / 2;
  return { x: left, y: top, width: Math.max(0, right - left), height };
}

/**
 * **섞인 문단은 글자 하나로 합친다(2026-09-30).** 제 글자와 인라인 요소(`<strong>` · `<a>` · `<em>`)가 섞인 문단을 제 글자와 요소로 따로
 * 세우면 문장이 흩어진다 — 약관의 「… at least <strong>7 days</strong> prior …」가 문장에서 떨어져 오른쪽에 섰고, 제 글자는 요소를 빼고
 * 이어 붙어 순서도 잃었다(약관 문단 95곳, 보내서 캡처로 확인). 측정기가 싣는 조각 순서(`inlineRuns` — 글자 조각과 요소 자식 순번)로 글자를
 * 다시 짓고, 요소 몫은 범위 서식(굵기 · 색 · 밑줄 — 문단과 다를 때만)으로 싣는다. 요소가 글자뿐인 인라인 잎일 때만 합친다 — 면 · 테두리 ·
 * 패딩을 가진 칩이나 요소를 품은 요소가 하나라도 있으면 합치지 않는다(전과 같이 따로 선다).
 */
function richInlineText(node, childrenOf) {
  const runs = node.inlineRuns;
  if (!Array.isArray(runs) || !runs.some((run) => typeof run === "number")) return null;
  const kids = childrenOf.get(node.path) ?? [];
  const base = node.style ?? {};
  let text = "";
  const ranges = [];
  const childPieces = []; // [start, end, 측정 y] — 보이는 줄을 되살릴 때 줄 경계의 요소가 어느 줄인지 가른다
  for (const run of runs) {
    if (typeof run === "string") { text += run; continue; }
    let child = kids.find((kid) => kid.path === `${node.path}.${run}`);
    if (!child) continue; // 보이지 않는 요소 — 측정에 없고 글자도 없다
    // **한 겹 감싼 인라인 잎(2026-10-07).** 각주 번호(`<sup><a>1</a></sup>`)처럼 글자뿐인 인라인 요소를 또 하나의 인라인 요소가 감싼 경우도
    // 합친다 — 바깥(`sup`)의 글자 크기와 안쪽(`a`)의 색으로 범위를 싣는다. 합치지 않으면 문단이 글자와 요소로 갈려 감긴 글자가 Figma 에서
    // 한 줄로 늘어났다(LOUIS 문서 예시의 추이 카드 해석 문단). 기준선 위로 올리는 것(위첨자)은 Figma 글자 범위에 없어 옮기지 않는다.
    let outer = null;
    const grand = childrenOf.get(child.path) ?? [];
    if (grand.length === 1 && (childrenOf.get(grand[0].path) ?? []).length === 0 && !child.ownText
      && (child.style?.display ?? "") === "inline" && (grand[0].style?.display ?? "") === "inline") {
      outer = child;
      child = grand[0];
    }
    if ((childrenOf.get(child.path) ?? []).length > 0) return null;
    const style = child.style ?? {};
    if ((style.display ?? "") !== "inline") return null;
    const painted = (style.backgroundColor && !TRANSPARENT.test(style.backgroundColor)) || (style.backgroundImage && style.backgroundImage !== "none")
      || ["Top", "Right", "Bottom", "Left"].some((side) => ((style[`border${side}Style`] ?? "none") !== "none" && (px(style[`border${side}Width`]) ?? 0) > 0)
        || (px(style[`padding${side}`]) ?? 0) > 0);
    if (painted) return null;
    const piece = child.ownText ?? "";
    if (!piece) continue;
    const start = text.length;
    text += piece;
    childPieces.push([start, text.length, child.rect?.y ?? null]);
    const range = { start, end: text.length };
    if (style.fontWeight && Number(style.fontWeight) !== Number(base.fontWeight)) range.weight = Number(style.fontWeight);
    const colour = cssColorToHex(style.color);
    if (colour && colour !== cssColorToHex(base.color)) range.color = colour;
    if (/underline/.test(style.textDecorationLine ?? style.textDecoration ?? "") && !/underline/.test(base.textDecorationLine ?? base.textDecoration ?? "")) range.underline = true;
    const size = px((outer ?? child).style?.fontSize);
    if (outer && size && size !== px(base.fontSize)) range.size = size;
    if (range.weight || range.color || range.underline || range.size) ranges.push(range);
    // **요소의 가로 margin 은 이웃 글자의 자간이다(2026-10-08).** 합친 글자에는 요소 상자가 없어 `margin-right: 6px` 이 빠졌다 — 랜딩 푸터
    // 사업자 정보의 라벨과 값이 「CompanySFACSPACE Inc.」로 붙었다. 글자 하나의 자간은 그 글자 뒤에 붙는 간격이라, 오른쪽 margin 은 요소의
    // 마지막 글자, 왼쪽 margin 은 요소 앞 글자의 자간에 더한다(`track` — 렌더러가 글자 스타일의 자간에 더한다). 측정 폭 그대로다.
    const margin = (side) => [outer, child].reduce((sum, at) => sum + Math.max(0, px(at?.style?.[`margin${side}`]) ?? 0), 0);
    const after = margin("Right");
    const before = margin("Left");
    if (after > 0.5) ranges.push({ start: text.length - 1, end: text.length, track: after });
    if (before > 0.5 && start > 0 && !/\n/.test(text[start - 1])) ranges.push({ start: start - 1, end: start, track: before });
  }
  if (!text.trim()) return null;
  const wrapped = mergedWrapLines(node, text, childPieces, ranges);
  return wrapped ? { text, ranges: wrapped.ranges, wrapLines: wrapped.lines } : { text, ranges };
}

/**
 * **섞인 문단의 보이는 줄(2026-09-30).** 측정기의 `wrapLines` 는 제 글자만으로 줄을 세어 안쪽 요소의 글자(`<strong>7 days</strong>`)가
 * 빠진다 — 합친 글자와 맞지 않아 버리자 보드 글꼴로 줄이 다시 감겨 이용약관 문단이 세 줄 → 두 줄로 줄었다(그 아래가 24 올라갔다).
 * 제 글자 기준 줄 끝을 합친 글자로 옮기고, 경계에 걸린 요소는 측정 y 로 줄을 가린다. 범위 서식은 줄바꿈으로 이은 글자 기준으로 옮긴다.
 */
function mergedWrapLines(node, text, childPieces, ranges) {
  const own = Array.isArray(node.wrapLines) ? node.wrapLines : null;
  if (!own || own.length < 2) return null;
  const isChild = (index) => childPieces.some(([start, end]) => index >= start && index < end);
  const ownChars = [];
  for (let index = 0; index < text.length; index += 1) if (!/\s/.test(text[index]) && !isChild(index)) ownChars.push(index);
  const counts = own.map((line) => line.replace(/\s+/g, "").length);
  if (counts.reduce((sum, count) => sum + count, 0) !== ownChars.length) return null; // 제 글자가 맞지 않으면 되살리지 않는다
  const lineHeight = node.rect.height / own.length;
  const lineOf = (y) => (y == null ? null : Math.round((y - node.rect.y) / lineHeight));
  const breaks = []; // [줄 끝(배타), 다음 줄 시작]
  let consumed = 0;
  for (let line = 0; line < own.length - 1; line += 1) {
    consumed += counts[line];
    let end = ownChars[consumed - 1] + 1;
    for (;;) {
      let next = end;
      while (next < text.length && /\s/.test(text[next])) next += 1;
      const piece = childPieces.find(([start]) => start === next);
      if (piece && lineOf(piece[2]) != null && lineOf(piece[2]) <= line) { end = piece[1]; continue; }
      breaks.push([end, next]);
      break;
    }
  }
  let joined = "";
  const map = new Array(text.length + 1);
  let cursor = 0;
  for (const [end, next] of breaks) {
    for (let index = cursor; index < end; index += 1) { map[index] = joined.length; joined += text[index]; }
    for (let index = end; index < next; index += 1) map[index] = joined.length;
    joined += "\n";
    cursor = next;
  }
  for (let index = cursor; index < text.length; index += 1) { map[index] = joined.length; joined += text[index]; }
  map[text.length] = joined.length;
  return {
    lines: joined.split("\n"),
    ranges: ranges.map((range) => ({ ...range, start: map[range.start], end: map[range.end] })),
  };
}

/**
 * **패딩을 가진 칠 없는 글자 잎(2026-09-30).** Figma 글자 노드에는 패딩이 없어, 자식 없이 제 글자만 가진 상자의 CSS 패딩이 통째로
 * 빠졌다 — 템플릿 목록의 빈 상태 문구(「Templates are coming soon.」, 위아래 패딩 80)가 181 → 21 로 접혀 보드가 160 짧았다. 칠이 없으면
 * (면 · 테두리 · 그림자 — 칠이 있는 잎은 렌더러가 면 + 안쪽 글자로 그린다) 이 상자를 세로 자동 배치 + 패딩으로 두고, 글자는 콘텐츠 상자를
 * 채우는(가로 FILL) 자식으로 뗀다. 정렬은 글자의 `text-align` 이 한다.
 */
function padTextLeaf(node, children, sizing) {
  if (!node.ownText || children.length > 0) return null;
  const style = node.style ?? {};
  const pad = { top: px(style.paddingTop) ?? 0, right: px(style.paddingRight) ?? 0, bottom: px(style.paddingBottom) ?? 0, left: px(style.paddingLeft) ?? 0 };
  if (Object.values(pad).every((value) => value <= 0.5)) return null;
  const paint = paintOf(style);
  if (paint && (paint.fill || paint.gradient || paint.stroke || paint.shadow)) return null;
  const border = (side) => ((style[`border${side}Style`] ?? "none") === "none" ? 0 : (px(style[`border${side}Width`]) ?? 0));
  // 상자가 글자 폭(HUG — 폭 선언 없는 링크 · 인라인 버튼)이면 글자도 제 폭이다. 채우는 글자는 HUG 부모 안의 FILL 이 된다.
  const hugs = sizing?.layoutSizingHorizontal === "HUG";
  const rect = {
    x: node.rect.x + pad.left + border("Left"),
    y: node.rect.y + pad.top + border("Top"),
    width: Math.max(0, node.rect.width - pad.left - pad.right - border("Left") - border("Right")),
    height: Math.max(0, node.rect.height - pad.top - pad.bottom - border("Top") - border("Bottom")),
  };
  return [{
    path: `${node.path}.t`,
    tag: "span",
    name: `${node.path}.t`,
    text: node.ownText,
    textLines: node.ownTextLines?.length ? node.ownTextLines : null,
    ...(node.wrapLines ? { wrapLines: node.wrapLines } : {}),
    ...(node.textRanges?.length ? { textRanges: node.textRanges } : {}),
    paints: true,
    rect,
    sizing: {
      layoutSizingHorizontal: hugs ? "HUG" : "FILL",
      layoutSizingVertical: "HUG",
      layoutPositioning: "AUTO",
      minWidth: null, maxWidth: null, minHeight: null, maxHeight: null,
      unresolved: [],
    },
    paint: null,
    typography: typographyOf(style),
    positioning: "AUTO",
    margin: { top: 0, right: 0, bottom: 0, left: 0 },
    offset: null,
    constraints: null,
    why: {
      horizontal: hugs
        ? { verdict: "HUG", reason: "padded-text-leaf — 상자가 글자 폭(HUG)이라 글자도 제 폭" }
        : { verdict: "FILL", reason: "padded-text-leaf — 글자는 패딩 안 콘텐츠 상자를 채운다" },
      vertical: { verdict: "HUG", reason: "padded-text-leaf" },
    },
    layout: null,
    children: [],
  }];
}

/**
 * **아이콘을 측정한 도형으로 그린다(2026-09-30).** 보드의 `<svg>` 자리는 이름(`v`)만 붙은 빈 상자라 화면에 아이콘이 하나도 보이지 않았다 —
 * 테마 토글의 모니터 · 해 · 달, 언어 선택의 지구본, 프로필 자리의 사람 원이 전부 비어 있었다(라이브 보드에서 자식 0 · 칠 0 으로 확인).
 * 측정기가 싣는 도형의 기하 속성(`d` · `cx` · `r` …)과 계산된 칠 · 획(`fill` · `stroke` · 두께 · 끝모양 · 이음 · 점선 · 불투명도)으로 SVG 를
 * 조립하고, 렌더러가 `figma.createNodeFromSvg` 로 그린 뒤 칠 · 획을 값이 같은 변수에 묶는다. 크기는 측정 상자다(`viewBox` 는 원본 그대로).
 * 속성 값은 홑따옴표로 싣는다 — payload JSON 에 이스케이프가 생기지 않게.
 */
const GLYPH_SHAPES = new Set(["path", "circle", "ellipse", "rect", "line", "polyline", "polygon"]);
const GLYPH_GEOMETRY = ["d", "cx", "cy", "r", "rx", "ry", "x", "y", "width", "height", "x1", "y1", "x2", "y2", "points", "transform", "fill-rule", "clip-rule"];
function glyphColour(value) {
  const text = String(value ?? "").trim();
  if (!text || text === "none" || text === "transparent") return { colour: "none" };
  const srgb = /^color\(srgb\s+([\d.]+)\s+([\d.]+)\s+([\d.]+)(?:\s*\/\s*([\d.]+))?\)$/.exec(text);
  const rgb = /^rgba?\(\s*([\d.]+)[,\s]+([\d.]+)[,\s]+([\d.]+)(?:[,\s/]+([\d.]+))?\s*\)$/.exec(text);
  const channels = srgb ? srgb.slice(1, 4).map((c) => Number.parseFloat(c) * 255) : rgb ? rgb.slice(1, 4).map(Number) : null;
  if (!channels) return null;
  const alpha = Number.parseFloat((srgb ?? rgb)[4] ?? "1");
  if (alpha <= 0) return { colour: "none" };
  const hex = `#${channels.map((c) => Math.round(c).toString(16).padStart(2, "0")).join("")}`;
  return { colour: hex, alpha: alpha < 1 ? Math.round(alpha * 1000) / 1000 : null };
}
function glyphMarkup(node, childrenOf) {
  const viewBox = node.vector?.viewBox;
  if (!viewBox) return null;
  const quote = (value) => String(value).replace(/&/g, "&amp;").replace(/'/g, "&apos;").replace(/</g, "&lt;");
  const shapes = [];
  const walk = (parent) => {
    for (const child of childrenOf.get(parent.path) ?? []) {
      if (!GLYPH_SHAPES.has(child.tag)) { walk(child); continue; }
      const style = child.style ?? {};
      const attrs = GLYPH_GEOMETRY.filter((name) => child.vector?.[name] != null).map((name) => `${name}='${quote(child.vector[name])}'`);
      const fill = glyphColour(style.fill ?? "rgb(0, 0, 0)");
      const stroke = glyphColour(style.stroke ?? "none");
      if (!fill || !stroke) return null;
      attrs.push(`fill='${fill.colour}'`);
      if (fill.alpha != null) attrs.push(`fill-opacity='${fill.alpha}'`);
      attrs.push(`stroke='${stroke.colour}'`);
      if (stroke.colour !== "none") {
        if (stroke.alpha != null) attrs.push(`stroke-opacity='${stroke.alpha}'`);
        const width = px(style.strokeWidth);
        if (width != null) attrs.push(`stroke-width='${width}'`);
        if (style.strokeLinecap && style.strokeLinecap !== "butt") attrs.push(`stroke-linecap='${style.strokeLinecap}'`);
        if (style.strokeLinejoin && style.strokeLinejoin !== "miter") attrs.push(`stroke-linejoin='${style.strokeLinejoin}'`);
        if (style.strokeDasharray && style.strokeDasharray !== "none") attrs.push(`stroke-dasharray='${quote(style.strokeDasharray.replace(/px/g, ""))}'`);
      }
      const opacity = Number.parseFloat(style.opacity ?? "1");
      if (opacity < 1) attrs.push(`opacity='${opacity}'`);
      shapes.push(`<${child.tag} ${attrs.join(" ")}/>`);
    }
    return true;
  };
  if (walk(node) === null || shapes.length === 0) return null;
  const size = (value) => Math.round(value * 100) / 100;
  // **svg 자체의 CSS 변환(2026-10-07).** 편집기 뒤로 가기 아이콘은 오른쪽 화살표에 `transform: matrix(-1, 0, 0, -1, 0, 0)`(180도 회전)을
  // 걸어 왼쪽을 가리키는데, 마크업에는 변환이 없어 보드가 반대 방향을 그렸다(제품 캡처 대조). CSS 변환의 기준점은 상자 가운데(기본
  // transform-origin)이므로 viewBox 중심을 기준으로 도형을 감싼다. 이동 성분은 상자 자리가 이미 담으므로 옮기지 않는다.
  const matrix = /^matrix\(([^)]+)\)$/.exec(String(node.style?.transform ?? "").trim());
  let body = shapes.join("");
  if (matrix) {
    const [a, b, c, d] = matrix[1].split(",").map((value) => Number.parseFloat(value));
    const box = String(viewBox).trim().split(/[\s,]+/).map(Number);
    if ([a, b, c, d].every(Number.isFinite) && box.length === 4 && box.every(Number.isFinite) && !(a === 1 && b === 0 && c === 0 && d === 1)) {
      const cx = size(box[0] + box[2] / 2);
      const cy = size(box[1] + box[3] / 2);
      body = `<g transform='translate(${cx} ${cy}) matrix(${a} ${b} ${c} ${d} 0 0) translate(${-cx} ${-cy})'>${body}</g>`;
    }
  }
  return `<svg xmlns='http://www.w3.org/2000/svg' viewBox='${quote(viewBox)}' width='${size(node.rect.width)}' height='${size(node.rect.height)}' fill='none'>${body}</svg>`;
}

/**
 * **떠 있는 도형 하나짜리 svg(2026-10-07).** 제 상자 밖으로 넘치는 svg 안에 있던 도형(React Flow 연결선)은 사용자 좌표 상자(`vector.bbox`)와 화면 상자
 * (`rect`)를 갖는다. 획이 상자 밖으로 반 두께만큼 나가므로 viewBox 를 그만큼 넓히고, 화면 크기도 같은 배율로 넓힌다. 보이지 않는 도형
 * (획 · 칠이 모두 투명 — 연결선의 클릭 영역 path)은 null 이다. 아이콘이 아니므로 글리프 대응표를 거치지 않는다.
 */
function looseShapeMarkup(node) {
  const box = String(node.vector?.bbox ?? "").split(" ").map(Number);
  if (box.length !== 4 || !box.every(Number.isFinite)) return null;
  const style = node.style ?? {};
  const fill = glyphColour(style.fill ?? "none");
  const stroke = glyphColour(style.stroke ?? "none");
  if (!fill || !stroke) return null;
  const strokeOpacity = Number.parseFloat(style.strokeOpacity ?? "1");
  const fillOpacity = Number.parseFloat(style.fillOpacity ?? "1");
  const strokeVisible = stroke.colour !== "none" && strokeOpacity > 0 && (stroke.alpha ?? 1) > 0;
  const fillVisible = fill.colour !== "none" && fillOpacity > 0 && (fill.alpha ?? 1) > 0;
  if (!strokeVisible && !fillVisible) return null;
  const width = strokeVisible ? (px(style.strokeWidth) ?? 1) : 0;
  const pad = width / 2;
  const [bx, by, bw, bh] = box;
  const scale = bw > 0 ? node.rect.width / bw : bh > 0 ? node.rect.height / bh : 1;
  if (!Number.isFinite(scale) || scale <= 0) return null;
  const size = (value) => Math.round(value * 100) / 100;
  const quote = (value) => String(value).replace(/&/g, "&amp;").replace(/'/g, "&apos;").replace(/</g, "&lt;");
  const attrs = GLYPH_GEOMETRY.filter((name) => node.vector?.[name] != null).map((name) => `${name}='${quote(node.vector[name])}'`);
  attrs.push(`fill='${fillVisible ? fill.colour : "none"}'`);
  if (fillVisible && fill.alpha != null) attrs.push(`fill-opacity='${fill.alpha}'`);
  attrs.push(`stroke='${strokeVisible ? stroke.colour : "none"}'`);
  if (strokeVisible) {
    if (stroke.alpha != null || strokeOpacity < 1) attrs.push(`stroke-opacity='${size((stroke.alpha ?? 1) * strokeOpacity)}'`);
    attrs.push(`stroke-width='${width}'`);
    if (style.strokeLinecap && style.strokeLinecap !== "butt") attrs.push(`stroke-linecap='${style.strokeLinecap}'`);
    if (style.strokeLinejoin && style.strokeLinejoin !== "miter") attrs.push(`stroke-linejoin='${style.strokeLinejoin}'`);
    if (style.strokeDasharray && style.strokeDasharray !== "none") attrs.push(`stroke-dasharray='${quote(style.strokeDasharray.replace(/px/g, ""))}'`);
  }
  return {
    markup: `<svg xmlns='http://www.w3.org/2000/svg' viewBox='${size(bx - pad)} ${size(by - pad)} ${size(bw + width)} ${size(bh + width)}' width='${size((bw + width) * scale)}' height='${size((bh + width) * scale)}' fill='none'><${node.tag} ${attrs.join(" ")}/></svg>`,
    rect: { x: node.rect.x - pad * scale, y: node.rect.y - pad * scale, width: (bw + width) * scale, height: (bh + width) * scale },
  };
}

/**
 * **SVG 글리프의 정체 서명 — 측정값을 그대로 잇는다.**
 *
 * 측정기는 `<svg>` 의 `viewBox` 와 자손 도형의 기하 속성(`d`·`points`·`cx`…)을 담는다
 * (`measure-product-auth-fixture.mjs` 의 `vectorAttributes`). 그런데 아래 변환기는 그 자손을
 * 「스스로 그릴 것이 없는 노드」로 보아 버린다(`droppedEmpty`) — `<path>` 에는 배경도 테두리도
 * 글자도 없기 때문이다. 그래서 Figma 로 가는 spec 에 아이콘이 **크기만 있는 빈 상자**로 남았고,
 * 보드 원장은 어느 아이콘인지 고를 수 없어 그 자리를 `blocked` 로 세었다.
 *
 * 서명은 **측정값 그대로**다. 반올림도 좌표 정규화도 하지 않는다 — 서명이 같다는 것은 「비슷한
 * 그림」이 아니라 「같은 소스에서 나왔다」를 뜻해야 하고, 값을 뭉개면 서로 다른 글리프가 한 서명
 * 으로 접혀 거기 붙는 이름이 짐작이 된다. 이름을 붙이는 일은 여기가 아니라 손으로 읽은
 * 조인표(`scripts/lib/figma-glyph-identity.mjs`)가 한다.
 */
const VECTOR_GEOMETRY = Object.freeze([
  "d", "points", "x1", "y1", "x2", "y2", "cx", "cy", "r", "rx", "ry",
  "x", "y", "width", "height", "pathLength", "fill-rule", "clip-rule", "href",
]);

export function glyphSignature(node, childrenOf) {
  if (node.tag !== "svg") return null;
  const parts = [String(node.vector?.viewBox ?? "")];
  const walk = (current) => {
    for (const child of childrenOf.get(current.path) ?? []) {
      const geometry = VECTOR_GEOMETRY
        .filter((name) => child.vector?.[name] != null)
        .map((name) => `${name}=${child.vector[name]}`);
      parts.push(`${child.tag}(${geometry.join(" ")})`);
      walk(child);
    }
  };
  walk(node);
  return parts.join("|");
}

/**
 * **한 줄짜리 인라인 흐름의 줄 상자(2026-09-26).** 블록 컨테이너 안의 인라인 블록(칩 버튼 · 인라인 상자)은 줄 상자에 앉고, 줄 상자의
 * 높이는 컨테이너의 `line-height`(strut)가 받친다 — 하이라이트 업로드의 테마 칩 줄은 칩 18 인데 줄이 24(데스크톱 line-height)다.
 * Figma 의 가로 자동 배치에는 strut 이 없어 줄이 칩 높이로 접힌다. 측정한 칩 위치에서 위 · 아래 남는 폭을 재어 패딩으로 옮긴다.
 * **원자 인라인만 옮긴다** — 그냥 `inline` 글자가 섞이면 옮기지 않는다. Figma 글자는 제 줄 높이를 이미 가지고, 인라인 글자의 측정
 * 높이는 글꼴 상자라 줄 높이보다 작다(쿠폰 약관 링크 16 · 줄 21).
 * 한 줄일 때만(자식이 세로로 모두 겹친다) — 여러 줄이면 줄마다 strut 이 달라 패딩 하나로 옮길 수 없다.
 */
/**
 * **칠 없는 테두리는 패딩이다(2026-09-26).** 투명한 테두리(`border: 1.5px solid transparent` — 흔들림 경고 때만 색을 입는 결제 동의 상자)는
 * 그려지지 않아 획이 되지 않지만 CSS 에서는 자리를 차지한다. 획이 없으면 그 폭이 통째로 빠져 상자가 테두리만큼 작아지므로 패딩으로 옮긴다.
 */
function clearBorderPadding(style) {
  const out = { top: 0, right: 0, bottom: 0, left: 0 };
  for (const side of ["Top", "Right", "Bottom", "Left"]) {
    const width = (style[`border${side}Style`] ?? "none") === "none" ? 0 : (px(style[`border${side}Width`]) ?? 0);
    if (width > 0 && !cssColorToHex(style[`border${side}Color`])) out[side.toLowerCase()] = width;
  }
  return out;
}

/**
 * **줄마다 새로 시작하는 인라인 글자(2026-09-29).** 블록 컨테이너 안의 인라인 흐름은 가로로 싣는다(toLayoutMode). 그런데 글자 조각이
 * `<br>` 로 나뉘어 저마다 새 줄에서 시작하면 제품의 줄은 아래로 쌓인다 — 가로로 두면 조각이 한 줄에 늘어서 폭을 넘치고 문단이 줄 수만큼
 * 낮아졌다(`/aws/signup` 안내문 세 조각 — 모바일 문단 84 → 42, 가입 폼이 20 올라갔다). 흐름 자식이 모두 글자 잎이고 저마다 앞 조각의
 * 아래에서 시작할 때만 세로로 쌓는다. 한 줄에 둘 이상이 앉는 흐름(글 사이의 링크 · 칩)은 그대로 가로다.
 */
function stackedInlineText(style, children) {
  if (/flex|grid|table/.test(style.display ?? "")) return false;
  const flow = children.filter((child) => child.positioning !== "ABSOLUTE");
  if (flow.length < 2 || flow.some((child) => !child.text || child.children.length > 0)) return false;
  return flow.every((child, i) => i === 0 || child.rect.y >= flow[i - 1].rect.y + flow[i - 1].rect.height - 0.5);
}
const TEXT_ALIGN_COUNTER = { center: "CENTER", right: "MAX", end: "MAX" };

/** 흐름 자식이 두 줄 이상에 앉았는가 — 어느 자식의 위가 첫 자식의 아래 이상이다. */
function wrapsIntoRows(children) {
  const flow = children.filter((child) => child.positioning !== "ABSOLUTE");
  if (flow.length < 2) return false;
  const first = flow[0].rect;
  return flow.some((child) => child.rect.y >= first.y + first.height - 0.5);
}

/** 부모가 자식을 세로로 쌓거나(블록 · 세로 flex) grid 칸에 두는가 — 그 안의 가로 FILL 은 교차축 늘이기다. */
function stacksChildren(parentStyle) {
  const display = parentStyle.display ?? "";
  if (/grid/.test(display)) return true;
  if (/flex/.test(display)) return (parentStyle.flexDirection ?? "row").startsWith("column");
  return /^(block|flow-root|list-item)$/.test(display);
}

/**
 * **블록 흐름의 margin 겹침(2026-09-30).** CSS 블록 흐름에서 세로 margin 은 겹친다 — 패딩 · 테두리 없는 부모의 마지막 자식 `margin-bottom` 은
 * 부모를 뚫고 나가 부모의 margin 과 겹치고(첫 자식 `margin-top` 도 같다), 이웃 둘의 margin 사이는 합이 아니라 큰 쪽이다. Figma 에는 margin 이
 * 없어 생성기가 margin 을 감싸개 패딩으로 옮기는데, 겹침을 모르고 다 더했다 — 요금제 머리(`header`)의 마지막 h2 `margin-bottom: 18` 이 부모
 * 안에 더해져 카드 격자가 18 아래에 섰다(보드 글자 자리 대조로 찾았다). 규칙을 흉내 내지 않고 **측정 자리**로 판정한다: 첫 · 마지막 자식이
 * 부모 콘텐츠 가장자리에 붙어 있으면 그 margin 은 부모 밖으로 나간 것이라 0 으로, 이웃 사이가 두 margin 의 합이 아니라 큰 쪽과 같으면 작은
 * 쪽을 0 으로. 양수 margin 만 본다(음수는 겹침 규칙이 다르다). flex · grid 는 margin 이 겹치지 않아 보지 않는다.
 */
function collapsedBlockMargins(node, style, children) {
  const none = { count: 0, top: 0, bottom: 0 };
  if (/flex|grid|table/.test(style.display ?? "")) return none;
  const flow = children.filter((child) => child.positioning !== "ABSOLUTE");
  if (flow.length === 0) return none;
  const edge = (side) => (px(style[`padding${side}`]) ?? 0) + (px(style[`border${side}Width`]) ?? 0);
  let count = 0, top = 0, bottom = 0;
  // 뚫고 나간 margin 은 버리지 않는다 — 부모의 바깥 margin 이 된다(부모 자리를 그만큼 민다). 버리면 문서가 그만큼 짧아진다.
  const first = flow[0];
  if ((first.margin?.top ?? 0) > 0.5 && edge("Top") === 0 && Math.abs(first.rect.y - node.rect.y) <= 0.5) {
    top = first.margin.top;
    first.margin = { ...first.margin, top: 0 };
    count += 1;
  }
  const last = flow[flow.length - 1];
  if ((last.margin?.bottom ?? 0) > 0.5 && edge("Bottom") === 0
    && Math.abs(last.rect.y + last.rect.height - (node.rect.y + node.rect.height)) <= 0.5) {
    bottom = last.margin.bottom;
    last.margin = { ...last.margin, bottom: 0 };
    count += 1;
  }
  for (let index = 0; index + 1 < flow.length; index += 1) {
    const upper = flow[index], lower = flow[index + 1];
    const below = upper.margin?.bottom ?? 0, above = lower.margin?.top ?? 0;
    if (below <= 0.5 || above <= 0.5) continue;
    const gap = lower.rect.y - (upper.rect.y + upper.rect.height);
    if (Math.abs(gap - Math.max(below, above)) <= 0.5 && Math.abs(gap - (below + above)) > 0.5) {
      if (below >= above) lower.margin = { ...lower.margin, top: 0 };
      else upper.margin = { ...upper.margin, bottom: 0 };
      count += 1;
    }
  }
  return { count, top, bottom };
}

/**
 * **높이 0 형제가 남긴 간격(2026-09-29).** flex 의 `gap` 은 크기가 0 인 아이템 뒤에도 붙는다. 측정기는 넓이 없는 노드를 싣지 않으므로
 * 그런 형제가 있던 자리의 간격이 통째로 빠진다 — 하이라이트 상태 보드의 본문 래퍼(`gap: 24px`)는 첫 자식이 비어 있는 알림 자리라
 * section 이 24 아래에서 시작하는데, 보드는 래퍼 맨 위에 붙여 문구가 모두 24 올라갔다. 앞에서부터 채우는 한 줄 flex
 * (`justify-content` 가 normal · flex-start · start, 감기 · 역순 없음)에서 자식의 측정 위치가 기대 위치보다 간격의 정수배만큼
 * 뒤에 있으면, 그만큼을 그 자식의 앞 margin 으로 옮긴다(margin 은 생성기가 감싸는 프레임의 패딩이 된다).
 */
function hiddenGapMargins(node, style, children) {
  if (!/flex/.test(style.display ?? "") || style.flexWrap === "wrap") return [];
  if (!/^(normal|flex-start|start)$/.test(style.justifyContent ?? "normal")) return [];
  const direction = style.flexDirection ?? "row";
  if (direction.endsWith("reverse")) return [];
  const column = direction.startsWith("column");
  const gap = px(column ? (style.rowGap ?? style.gap) : (style.columnGap ?? style.gap)) ?? 0;
  if (gap <= 0) return [];
  const flow = children.filter((child) => child.positioning !== "ABSOLUTE");
  const found = [];
  const edge = (side) => (px(style[`padding${side}`]) ?? 0) + (px(style[`border${side}Width`]) ?? 0);
  let end = column ? node.rect.y + edge("Top") : node.rect.x + edge("Left");
  flow.forEach((child, index) => {
    const before = column ? "top" : "left";
    const after = column ? "bottom" : "right";
    const want = end + (index ? gap : 0) + (child.margin?.[before] ?? 0);
    const actual = column ? child.rect.y : child.rect.x;
    const extra = actual - want;
    const k = Math.round(extra / gap);
    if (extra > 0.5 && k >= 1 && Math.abs(extra - k * gap) <= 0.5) {
      child.margin = { ...(child.margin ?? { top: 0, right: 0, bottom: 0, left: 0 }), [before]: (child.margin?.[before] ?? 0) + k * gap };
      found.push({ path: child.path, gaps: k, gap });
    }
    end = actual + (column ? child.rect.height : child.rect.width) + (child.margin?.[after] ?? 0);
  });
  return found;
}

/**
 * **보이지 않는 자식이 남긴 세로 흐름의 여유(2026-09-30).** 측정기는 넓이 없는 노드를 싣지 않는다 — 값이 빈 `<span class="mt-1.5">`
 * 같은 높이 0 블록은 제 margin 만 남기고 빠지고, flex 세로 줄 끝의 크기 0 아이템은 `gap` 하나를 남기고 빠진다. 새 서식 맥락(flex
 * 아이템 · grid 칸 …)의 상자는 그 여유를 제 높이에 넣는데, 남은 자식만으로 HUG 하면 그만큼 낮아진다(설정 모바일 이메일 줄 24 → 21
 * 이라 그 아래가 모두 3 올라갔다). 내용 높이(HUG)로 서는 세로 흐름에서 측정 콘텐츠 상자와 흐름 자식의 끝 사이 여유를 패딩으로
 * 옮긴다 — 측정 자리가 정답이다. flex 는 주축 정렬이 시작일 때만 본다(가운데 · 끝 정렬은 여유가 정렬의 몫이다).
 */
function flowSlack(node, style, children, rawChildren, sizing, recordedBottom, parent = null, siblings = []) {
  if (/grid|table/.test(style.display ?? "")) return null;
  // 가운데 · 끝 정렬 flex 세로 줄 — 보이는 자식 묶음이 그 정렬대로 서 있지 않으면(가운데인데 위아래 여유가 다르다 · 끝인데 아래 여유가
  // 있다) 보이지 않는 자식이 자리를 차지한 것이다. 여유를 패딩으로 옮기고 주축 정렬을 시작으로 둔다(`realign`) — 구독 모바일의 사용 이력
  // 오류 칸(최소 높이 132 · 가운데)은 제목이 위에 붙고 아래 84 가 비어 153 인데, 보드는 제목을 가운데 세운 132 였다.
  let realign = false;
  if (/flex/.test(style.display ?? "")) {
    if (!(style.flexDirection ?? "row").startsWith("column") || style.flexDirection.endsWith("reverse")) return null;
    if (style.flexWrap === "wrap") return null;
    realign = !/^(normal|flex-start|start)$/.test(style.justifyContent ?? "normal");
    if (realign && !/^(center|flex-end|end)$/.test(style.justifyContent)) return null;
  }
  // grid 행의 높이를 제 내용으로 정하는 칸 자식(측정 높이 = 계산된 행 크기)은 FILL 이어도 내용 높이로 선 것이다 — 랜딩 모바일 후기의 인용
  // 슬라이드(108)는 보이지 않는 두 줄이 아래 54 를 차지하는데, 칸이 내용 높이 행이라 보드에서 54 로 접혀 인용문이 27 내려갔다.
  // 그 grid 의 유일한 흐름 자식일 때만 — 형제가 있으면 행을 정한 것이 이 자식인지 늘어난 것인지 가를 수 없다.
  const rowOwner = sizing.layoutSizingVertical === "FILL" && /grid/.test(parent?.style?.display ?? "")
    && (parseTracks(parent.style.gridTemplateRows)?.map(px) ?? []).some((row) => row != null && Math.abs(row - node.rect.height) <= 1)
    && siblings.filter((sibling) => isVisible(sibling) && !/^(absolute|fixed)$/.test(sibling.style?.position ?? "")).length === 1;
  if ((sizing.layoutSizingVertical !== "HUG" && !rowOwner) || (sizing.minHeight && !realign)) return null;
  const flow = children.filter((child) => child.positioning !== "ABSOLUTE");
  if (flow.length === 0) return null;
  // 블록 자식만 — 인라인 요소(`<strong>`)의 측정 상자는 줄 상자가 아니라 글꼴 상자라 여유가 거짓으로 잡힌다.
  const displayOf = new Map(rawChildren.map((child) => [child.path, child.style?.display ?? ""]));
  if (flow.some((child) => /^inline/.test(displayOf.get(child.path) ?? ""))) return null;
  const border = (side) => ((style[`border${side}Style`] ?? "none") === "none" ? 0 : (px(style[`border${side}Width`]) ?? 0));
  const contentTop = node.rect.y + border("Top") + (px(style.paddingTop) ?? 0);
  const contentBottom = node.rect.y + node.rect.height - border("Bottom") - (px(style.paddingBottom) ?? 0);
  // 뷰포트만 잰 원장은 뷰포트 밖에서 시작하는 노드를 싣지 않는다 — 그 아래 여유는 싣지 않은 자식이다. 정렬을 다시 세우는 칸은
  // 보이는 자식을 측정 자리에 두는 것이 목적이고 칸 크기도 측정 그대로라, 뷰포트를 넘어도 옮긴다(구독 모바일 이력 칸은 아래가 뷰포트 밖).
  if (!realign && recordedBottom != null && contentBottom > recordedBottom + 0.5) return null;
  const slackTop = Math.min(...flow.map((child) => child.rect.y - (child.margin?.top ?? 0))) - contentTop;
  const slackBottom = contentBottom - Math.max(...flow.map((child) => child.rect.y + child.rect.height + (child.margin?.bottom ?? 0)));
  // 반 픽셀 테두리를 링(그림자)으로 그린 칸은 테두리가 레이아웃에 들지 않아 여유가 −0.5 남짓으로 잡힌다 — 1px 까지 봐준다.
  if (slackTop < -1 || slackBottom < -1 || (slackTop <= 0.5 && slackBottom <= 0.5)) return null;
  // 정렬대로 선 묶음(가운데면 위아래 여유가 같고, 끝이면 아래 여유가 없다)은 보이지 않는 자식이 없다 — 정렬이 여유를 맡는다.
  if (realign && /center/.test(style.justifyContent) && Math.abs(slackTop - slackBottom) <= 1) return null;
  if (realign && /end/.test(style.justifyContent) && slackBottom <= 0.5) return null;
  const round2 = (value) => (value <= 0.5 ? 0 : Math.round(value * 100) / 100);
  return { top: round2(slackTop), bottom: round2(slackBottom), ...(realign ? { realign: true } : {}) };
}

function lineBoxSlack(node, style, children, rawChildren) {
  if (/flex|grid/.test(style.display ?? "")) return null;
  const flow = children.filter((child) => child.positioning !== "ABSOLUTE");
  // 원자 인라인(inline-block · inline-flex …)만 — 측정 상자가 곧 그 상자다. 그냥 `inline`(글자)은 측정 높이가 글꼴 상자라 줄 높이와 다르다.
  const displayOf = new Map(rawChildren.map((child) => [child.path, child.style?.display ?? ""]));
  if (flow.length === 0 || flow.some((child) => !/^inline-(block|flex|grid|table)$/.test(displayOf.get(child.path) ?? ""))) return null;
  const top = (child) => child.rect.y - (child.margin?.top ?? 0);
  const bottom = (child) => child.rect.y + child.rect.height + (child.margin?.bottom ?? 0);
  if (Math.max(...flow.map((child) => child.rect.y)) >= Math.min(...flow.map((child) => child.rect.y + child.rect.height))) return null;
  const border = (side) => ((style[`border${side}Style`] ?? "none") === "none" ? 0 : (px(style[`border${side}Width`]) ?? 0));
  const contentTop = node.rect.y + border("Top") + (px(style.paddingTop) ?? 0);
  const contentBottom = node.rect.y + node.rect.height - border("Bottom") - (px(style.paddingBottom) ?? 0);
  const slackTop = Math.min(...flow.map(top)) - contentTop;
  const slackBottom = contentBottom - Math.max(...flow.map(bottom));
  if (slackTop < -0.5 || slackBottom < -0.5 || (slackTop <= 0.5 && slackBottom <= 0.5)) return null;
  const round2 = (value) => Math.max(0, Math.round(value * 100) / 100);
  return { top: round2(slackTop), bottom: round2(slackBottom), lineHeight: style.lineHeight ?? null };
}

/**
 * **배율이 걸린 서브트리(2026-09-30).** CSS `transform: scale` 은 그림만 줄이고 계산값(글자 크기 · 패딩 · 간격 · 테두리 · 곡률 · 그림자)은
 * 줄기 전 값으로 둔다. 측정 상자(`rect`)는 줄어든 그림이라, 그대로 옮기면 상자는 작은데 글자와 여백은 커서 안이 넘친다 — 랜딩 개요의
 * 노드 캔버스 목업(`matrix(0.774, 0, 0, 0.774, …)`, 모바일 0.496)이 그 자리다. 고른 배율(`matrix(s, 0, 0, s, tx, ty)`)이 걸린 노드와
 * 그 자손의 계산값 · 선언의 px 값에 배율을 곱해 측정 상자와 한 척도로 맞춘다(겹친 배율은 곱한다). Figma `rescale()` 은 러너 조각이
 * 서브트리를 나누면 뒤 조각이 배율 밖에 서므로 쓰지 않는다.
 */
function scalePx(value, factor) {
  return typeof value === "string" && value.includes("px")
    ? value.replace(/(-?\d*\.?\d+(?:e-?\d+)?)px/g, (_, number) => `${Math.round(Number(number) * factor * 10000) / 10000}px`)
    : value;
}
function uniformScaleOf(style) {
  const match = /^matrix\(\s*([-\d.e]+),\s*([-\d.e]+),\s*([-\d.e]+),\s*([-\d.e]+),/.exec(style?.transform ?? "");
  if (!match) return null;
  const [a, b, c, d] = match.slice(1, 5).map(Number);
  if (Math.abs(b) > 1e-4 || Math.abs(c) > 1e-4 || Math.abs(a - d) > 1e-4 || Math.abs(a - 1) <= 1e-3 || a <= 0) return null;
  return a;
}
function applyTransformScale(tree) {
  const roots = tree.map((node) => ({ node, factor: uniformScaleOf(node.style) })).filter((entry) => entry.factor != null);
  if (roots.length === 0) return { tree, scaled: 0 };
  const factorOf = (path) => roots.reduce((product, { node, factor }) => (path === node.path || path.startsWith(`${node.path}.`) ? product * factor : product), 1);
  let scaled = 0;
  const next = tree.map((node) => {
    const factor = factorOf(node.path);
    if (factor === 1) return node;
    scaled += 1;
    const style = Object.fromEntries(Object.entries(node.style ?? {}).map(([key, value]) => [key, key === "transform" ? value : scalePx(value, factor)]));
    const declared = node.declared ? Object.fromEntries(Object.entries(node.declared).map(([key, value]) => [key, scalePx(value, factor)])) : node.declared;
    // 가상 요소 · 덮개 자식에서 올린 그림자도 같은 배율로 줄인다 — 빠뜨리면 캔버스 줌 0.815 에서 흐림 8 이 그대로 8 로 섰다.
    const pseudoShadows = node.pseudoShadows ? node.pseudoShadows.map((entry) => ({ ...entry, boxShadow: scalePx(entry.boxShadow, factor) })) : node.pseudoShadows;
    return { ...node, style, declared, ...(pseudoShadows ? { pseudoShadows } : {}) };
  });
  return { tree: next, scaled };
}

// **색 필터를 색에 굽는다(2026-10-12).** 제품은 라이트 비활성 연결점을 활성 색(채널 200 면 · 500 글리프)에
// `filter: brightness(0.78) saturate(0.95)` 를 걸어 어둡게 그린다(NodeSideButtons · VideoNode · EditNode). 측정은 필터 전
// 계산 색을 싣고 Figma 에는 같은 효과가 없어, 보드의 비활성 연결점이 활성처럼 밝은 파스텔로 섰다. 색만 바꾸는 필터 함수
// (brightness · saturate · contrast · grayscale)는 sRGB 채널의 선형 변환이고 알파를 건드리지 않으므로, 노드와 자손의
// 모든 색 리터럴에 미리 곱하면 필터를 건 그림과 같다 — 제품 `archiveThumbnail/theme.ts` 의 `toneDownLightInactive` 가
// 같은 방식이며 라이브 DOM 과 차이 0 을 실측했다. 흐림 · 그림자 · url() 이 섞인 필터는 건드리지 않는다. 겹친 필터는 안쪽부터.
const COLOR_FILTER_FN = /^(brightness|saturate|contrast|grayscale)\(\s*(-?\d*\.?\d+)(%?)\s*\)$/;
function colorFilterSteps(value) {
  const raw = String(value ?? "").trim();
  if (!raw || raw === "none") return null;
  const parts = raw.match(/[a-z-]+\([^)]*\)/g);
  if (!parts || parts.join(" ").replace(/\s+/g, "") !== raw.replace(/\s+/g, "")) return null;
  const steps = [];
  for (const part of parts) {
    const match = COLOR_FILTER_FN.exec(part);
    if (!match) return null;
    steps.push([match[1], Number(match[2]) / (match[3] ? 100 : 1)]);
  }
  return steps.length ? steps : null;
}
function filterChannels([r, g, b], steps) {
  for (const [fn, amount] of steps) {
    if (fn === "brightness") { r *= amount; g *= amount; b *= amount; continue; }
    if (fn === "contrast") { const f = (c) => (c - 127.5) * amount + 127.5; r = f(r); g = f(g); b = f(b); continue; }
    const s = fn === "grayscale" ? 1 - Math.min(1, amount) : amount;
    [r, g, b] = [
      (0.213 + 0.787 * s) * r + (0.715 - 0.715 * s) * g + (0.072 - 0.072 * s) * b,
      (0.213 - 0.213 * s) * r + (0.715 + 0.285 * s) * g + (0.072 - 0.072 * s) * b,
      (0.213 - 0.213 * s) * r + (0.715 - 0.715 * s) * g + (0.072 + 0.928 * s) * b,
    ];
  }
  return [r, g, b].map((c) => Math.round(Math.min(255, Math.max(0, c))));
}
const COLOR_LITERAL = /rgba?\([^)]*\)|color\(srgb[^)]*\)/g;
function filterColorLiterals(value, steps) {
  if (typeof value !== "string" || !/rgba?\(|color\(srgb/.test(value)) return value;
  return value.replace(COLOR_LITERAL, (literal) => {
    let channels;
    let alpha = 1;
    const legacy = /^rgba?\(([^)]+)\)$/.exec(literal);
    if (legacy) {
      const parts = legacy[1].split(/[,\s/]+/).filter(Boolean).map(Number);
      channels = parts.slice(0, 3);
      if (parts.length > 3) alpha = parts[3];
    } else {
      const parts = literal.slice("color(srgb".length, -1).split(/[\s/]+/).filter(Boolean).map(Number);
      channels = parts.slice(0, 3).map((part) => part * 255);
      if (parts.length > 3) alpha = parts[3];
    }
    if (channels.length < 3 || !channels.every(Number.isFinite)) return literal;
    const [r, g, b] = filterChannels(channels, steps);
    return alpha >= 1 ? `rgb(${r}, ${g}, ${b})` : `rgba(${r}, ${g}, ${b}, ${alpha})`;
  });
}
function applyColorFilters(tree) {
  const roots = tree
    .map((node) => ({ node, steps: colorFilterSteps(node.style?.filter) }))
    .filter((entry) => entry.steps != null)
    .sort((a, b) => b.node.path.split(".").length - a.node.path.split(".").length);
  if (roots.length === 0) return { tree, filtered: 0 };
  let filtered = 0;
  const next = tree.map((node) => {
    const chain = roots.filter(({ node: root }) => node.path === root.path || node.path.startsWith(`${root.path}.`));
    if (chain.length === 0) return node;
    filtered += 1;
    const style = Object.fromEntries(Object.entries(node.style ?? {}).map(([key, value]) => [
      key,
      key === "filter" ? value : chain.reduce((acc, { steps }) => filterColorLiterals(acc, steps), value),
    ]));
    return { ...node, style };
  });
  return { tree: next, filtered };
}

// **그림자만 칠하는 덮개 자식을 부모 그림자로 올린다(2026-10-12).** 노드 생성 버튼은 가상 요소가 아니라 진짜 `<span>`
// (`absolute inset-0 rounded-[inherit]`, 칠 · 글자 · 자식 없음)에 `inset 0 0 8px 흰색` 과 `mix-blend-mode: overlay` 를 건다
// (NodePromptGenerateButton `OVERLAY_STROKE`). Figma 는 칠이 없는 층의 이너 섀도를 그리지 않아 보드 버튼이 평평했다. 부모를
// 그대로 덮는 이런 자식은 가상 요소와 같은 처지라 `pseudoShadows` 항목으로 바꿔 부모에 싣고(withPseudoShadows 가 섞기 모드째
// 옮긴다) 자식은 뺀다. 칠 · 테두리 · 글자 · 자식 · 덮지 않는 자리 가운데 하나라도 있으면 건드리지 않는다.
function hoistShadowOverlays(tree) {
  const parents = new Set(tree.map((node) => node.parentPath).filter(Boolean));
  const byPath = new Map(tree.map((node) => [node.path, node]));
  const hoisted = new Map();
  const near = (a, b) => Math.abs((a ?? 0) - (b ?? 0)) <= 0.5;
  for (const node of tree) {
    const style = node.style ?? {};
    const parent = byPath.get(node.parentPath);
    if (!parent || parents.has(node.path) || node.ownText || node.vector) continue;
    if (style.position !== "absolute" || !style.boxShadow || style.boxShadow === "none") continue;
    if (cssColorToHex(style.backgroundColor) || (style.backgroundImage && style.backgroundImage !== "none")) continue;
    if (["Top", "Right", "Bottom", "Left"].some((side) => px(style[`border${side}Width`]) > 0 && style[`border${side}Style`] !== "none")) continue;
    const a = node.rect; const b = parent.rect;
    if (!a || !b || !near(a.x, b.x) || !near(a.y, b.y) || !near(a.width, b.width) || !near(a.height, b.height)) continue;
    const entry = { pseudo: "child", boxShadow: style.boxShadow, mixBlendMode: style.mixBlendMode ?? "normal", position: "absolute", inset: ["0px", "0px", "0px", "0px"] };
    hoisted.set(parent.path, [...(hoisted.get(parent.path) ?? []), entry]);
    hoisted.set(node.path, null);
  }
  if (hoisted.size === 0) return { tree, overlays: 0 };
  const next = tree.flatMap((node) => {
    if (hoisted.get(node.path) === null) return [];
    const extra = hoisted.get(node.path);
    return extra ? [{ ...node, pseudoShadows: [...(node.pseudoShadows ?? []), ...extra] }] : [node];
  });
  return { tree: next, overlays: [...hoisted.values()].filter((value) => value === null).length };
}

export function toFigmaTreeSpec(inputTree, options = {}) {
  const rootPath = options.rootPath ?? "main";
  const contextId = options.contextId ?? null;
  const { tree: liftedTree, overlays: shadowOverlays } = hoistShadowOverlays(inputTree);
  const { tree: filteredTree, filtered: colorFiltered } = applyColorFilters(liftedTree);
  const { tree, scaled: transformScaled } = applyTransformScale(filteredTree);
  const { byPath, childrenOf } = buildHierarchy(tree, rootPath);
  // `total` 은 원장의 측정 노드 수다 — 덮개 끌어올리기(hoistShadowOverlays)가 뺀 자식까지 센다. 로캘 생성기가 이 수로 보드와 원장을 맞댄다.
  const stats = { total: inputTree.length, kept: 0, droppedInvisible: 0, droppedEmpty: 0, textSplits: 0, unresolved: [], verticalWrap: [], lineBoxSlack: [], gridRows: [], ...(transformScaled ? { transformScaled } : {}), ...(colorFiltered ? { colorFiltered } : {}), ...(shadowOverlays ? { shadowOverlays } : {}) };

  // `inStretchedRow` — 이 노드가 늘어난 한 줄 grid 행의 칸이다(gridStretchedRow 주석). 늘어남은 위에서 아래로만 이어진다.
  const convert = (node, parent, inStretchedRow = false) => {
    if (!isVisible(node)) { stats.droppedInvisible += 1; return null; }
    // 떠 있는 도형(normalizeAuthFixtureTree 의 looseShape) — 보이는 도형만 도형 하나짜리 svg 로 싣는다. 상자는 획 여유만큼 넓힌다.
    if (node.looseShape) {
      const loose = looseShapeMarkup(node);
      if (!loose) { stats.droppedEmpty += 1; return null; }
      node = { ...node, rect: loose.rect, looseMarkup: loose.markup };
      stats.looseShapes = (stats.looseShapes ?? 0) + 1;
    }

    // grid 부모 안에서 이 자식이 놓인 열 — 자식 순번이 아니라 자동 배치로 푼다(형제 · 흐름 · 명시 배치를 본다).
    const gridColumn = parent && /grid/.test(parent.style?.display ?? "")
      ? gridAutoPlacementColumn({
        trackCount: parseTracks(parent.declared?.["grid-template-columns"])?.length ?? 0,
        parentComputed: parent.style ?? null,
        parentPath: parent.path,
        siblings: childrenOf.get(parent.path) ?? [],
        path: node.path,
      })
      : null;
    const decision = decideNode({
      declared: node.declared ?? {},
      computed: node.style ?? {},
      parentComputed: parent?.style ?? null,
      parentDeclared: parent?.declared ?? null,
      gridColumn,
      tag: node.tag,
      contextId,
    });
    const sizing = toFigmaSizing(decision);
    // **고정 폭 + `max-width: 100%` 의 FILL 은 측정 폭에서 같을 때만(2026-10-08, 조립 규칙 15조의 6).** 판정기는 FILL + maxWidth(그 폭)를
    // 내지만 Figma 의 FILL 은 부모의 남는 자리를 채운다 — 세로로 쌓는 부모(세로 flex · block)는 안쪽 폭, 가로 flex 부모는 안쪽 폭에서 흐름
    // 형제와 간격을 뺀 자리다. 그 자리와 그 폭 중 작은 쪽이 측정 폭과 1 안으로 같지 않으면(grid 칸 · 다른 부모 · 형제가 나눠 가짐) FIXED 로
    // 되돌린다 — 측정 폭의 그림은 바뀌지 않아야 한다.
    if (decision.h.cappedFixed != null) {
      const outer = parent?.style ?? {};
      const edge = (side) => (px(outer[`padding${side}`]) ?? 0) + (px(outer[`border${side}Width`]) ?? 0);
      const inner = parent?.rect ? parent.rect.width - edge("Left") - edge("Right") : null;
      const flex = /flex/.test(outer.display ?? "");
      const row = flex && (outer.flexDirection ?? "row").startsWith("row");
      const stacks = (flex && !row) || /^(block|flow-root|list-item)$/.test(outer.display ?? "");
      const flowSiblings = row ? (childrenOf.get(parent.path) ?? [])
        .filter((sibling) => sibling !== node && isVisible(sibling) && !["absolute", "fixed"].includes(sibling.style?.position)) : [];
      const room = inner == null || (!row && !stacks) ? null
        : inner - flowSiblings.reduce((sum, sibling) => sum + sibling.rect.width, 0) - flowSiblings.length * (px(outer.columnGap ?? outer.gap) ?? 0);
      if (room != null && Math.abs(Math.min(room, decision.h.cappedFixed) - node.rect.width) <= 1) {
        stats.cappedFixedFill = (stats.cappedFixedFill ?? 0) + 1;
        decision.h = Object.fromEntries(Object.entries(decision.h).filter(([key]) => key !== "cappedFixed" && key !== "fixedFallback"));
      } else {
        sizing.layoutSizingHorizontal = "FIXED";
        sizing.maxWidth = decision.minMax.maxWidth === decision.h.cappedFixed ? null : decision.minMax.maxWidth;
        decision.h = decision.h.fixedFallback;
      }
    }
    // **퍼센트 최소 높이(2026-09-29).** `min-height: 100%` 는 계산값에서도 %라 크기 판정(limitPx)이 풀지 못해 버렸다 — 구독 데스크톱
    // 본문 열(`min-height: 100%` = main 안쪽 1044)이 내용 높이(1009)로 서, 가운데 정렬 section 이 35 짧아지고 그 안의 안내가 9 위에
    // 섰다. 부모 안쪽 높이의 P% 가 측정 높이와 같으면(최소 높이가 걸려 있었다) 그 높이를 최소 높이로 싣는다.
    // **최소 높이가 일을 할 때만(2026-09-29).** 측정 높이가 부모 안쪽의 P% 와 우연히 같아도 내용이 그 높이를 정했으면 싣지 않는다 —
    // 구독 모바일 본문 칸(874)은 자식 합이 921.8 로 내용이 넘쳤는데 최소 높이를 싣자 section 이 FILL 로 바뀌어 본문이 8 올라갔다.
    // 자연 높이 = 늘어나지 않는 자식의 높이 + 늘어나는(grow) 자식의 제 내용 범위 + 간격 · 패딩(세로 flex), 그 밖은 자식 범위 + 패딩.
    const percentMin = /^(\d+(?:\.\d+)?)%$/.exec(String(node.style?.minHeight ?? "").trim());
    const naturalHeight = () => {
      const style = node.style ?? {};
      const own = (side) => (px(style[`padding${side}`]) ?? 0) + (px(style[`border${side}Width`]) ?? 0);
      const inFlow = (entry) => entry.rect && entry.rect.height > 0 && !["absolute", "fixed"].includes(entry.style?.position);
      const kids = (childrenOf.get(node.path) ?? []).filter(inFlow);
      if (kids.length === 0) return null;
      const extent = (entries) => Math.max(...entries.map((entry) => entry.rect.y + entry.rect.height)) - Math.min(...entries.map((entry) => entry.rect.y));
      if (/flex/.test(style.display ?? "") && /^column/.test(style.flexDirection ?? "")) {
        const heights = kids.map((kid) => {
          if (!(Number(kid.style?.flexGrow) > 0)) return kid.rect.height;
          const inner = (childrenOf.get(kid.path) ?? []).filter(inFlow);
          const kidEdge = (side) => (px(kid.style?.[`padding${side}`]) ?? 0) + (px(kid.style?.[`border${side}Width`]) ?? 0);
          return inner.length ? extent(inner) + kidEdge("Top") + kidEdge("Bottom") : 0;
        });
        return heights.reduce((sum, value) => sum + value, 0) + (kids.length - 1) * (px(style.rowGap) ?? 0) + own("Top") + own("Bottom");
      }
      return extent(kids) + own("Top") + own("Bottom");
    };
    if (percentMin && !sizing.minHeight && parent?.rect) {
      const edge = (side) => (px(parent.style?.[`padding${side}`]) ?? 0) + (px(parent.style?.[`border${side}Width`]) ?? 0);
      const inner = parent.rect.height - edge("Top") - edge("Bottom");
      const natural = naturalHeight();
      // 백분율 최소 높이가 부모 안쪽에서 푸는 크기(퍼센트 → 비율).
      const percentHeight = inner * (Number(percentMin[1]) / 100);
      if (Math.abs(percentHeight - node.rect.height) <= 0.5 && natural != null && natural < node.rect.height - 0.5) {
        sizing.minHeight = node.rect.height;
        stats.percentMinHeight = (stats.percentMinHeight ?? 0) + 1;
      }
    }
    for (const reason of sizing.unresolved) {
      stats.unresolved.push({ path: node.path, tag: node.tag, reason });
    }

    // 제 글자와 글자뿐인 인라인 요소가 섞인 문단은 글자 하나 + 범위 서식으로 합친다(richInlineText 주석).
    const rich = richInlineText(node, childrenOf);
    if (rich) {
      node = { ...node, ownText: rich.text, wrapLines: rich.wrapLines, textRanges: rich.ranges };
      stats.richInlineText = (stats.richInlineText ?? 0) + 1;
    }
    const rawChildren = rich ? [] : (childrenOf.get(node.path) ?? []);
    // 한 줄 grid 의 행이 바깥 높이로 늘어났는가 — 칸 안의 grid 에 알려야 하므로 자식보다 먼저 판정한다.
    const stretchedRow = gridStretchedRow(node, node.style ?? {}, sizing, rawChildren, inStretchedRow);
    let children = rawChildren.map((child) => convert(child, node, stretchedRow != null)).filter(Boolean);
    // 글자와 요소 자식을 함께 가진 노드는 글자를 자식으로 떼어낸다(splitOwnText 주석 참조).
    const split = splitOwnText(node, children);
    if (split) { children = split; stats.textSplits += 1; }
    // 패딩을 가진 칠 없는 글자 잎은 패딩 프레임 + 글자 자식으로 가른다(padTextLeaf 주석).
    const padded = split ? null : padTextLeaf(node, children, sizing);
    if (padded) { children = padded; stats.paddedTextLeaves = (stats.paddedTextLeaves ?? 0) + 1; }
    const textMoved = Boolean(split || padded);

    // 자식도 없고 스스로 그릴 것도 없으면 버린다 — Auto Layout에 빈 껍데기를 남기지 않는다.
    // **입력 요소는 빈 껍데기가 아니다(2026-09-28).** `<input>` 은 칠이 없어도 제 줄 높이로 칸을 받친다 — 버리자 입력칸(58)이 패딩
    // 높이로 눌려 가입 보드의 칸 넷이 무너지고 라벨이 칸 밖으로 나갔다(캡처로 확인). 측정 크기의 상자로 남긴다.
    const formControl = /^(input|textarea|select)$/.test(node.tag);
    // **흐름 안에서 자리를 차지하는 빈 상자도 빈 껍데기가 아니다(2026-09-29).** 칠 · 글자 · 자식이 없어도 흐름 안에서 넓이를 가진 상자는
    // 제품에서 자리를 차지한다 — 가상 요소로 그리는 스피너(`LoadingSpinner`: 몸은 칠 없는 16×16, 고리는 ::before · ::after)를 버리자
    // 하이라이트 업로드 중 · 추출 중 보드의 문구가 32(스피너 16 + 간격 16) 올라갔다. 측정 크기의 빈 상자(FIXED)로 남긴다.
    // SVG 안의 도형은 상자가 아니다 — 아이콘은 `<svg>` 의 서명으로 그린다(glyphSignature).
    const insideSvg = () => { for (let at = parent; at; at = byPath.get(at.parentPath)) if (at.tag === "svg") return true; return false; };
    // **grid 칸에 겹쳐 선 빈 상자는 자리를 차지하지 않는다(2026-09-30).** 크로스페이드 슬라이드는 한 칸(`grid-area: 1 / 1`)에 겹쳐
    // 서고 하나만 보인다 — 보이지 않는 슬라이드의 틀이 빈 상자로 남아 Figma grid 가 한 줄씩 늘어놓자 랜딩 후기의 저자 줄 열세 개가
    // 312 로 쌓여 밴드 안 내용이 143 위로 떴다. 보이는 형제와 절반 넘게 겹치는 빈 상자는 버린다.
    const stackedInGrid = () => {
      if (!/grid/.test(parent?.style?.display ?? "")) return false;
      const area = node.rect.width * node.rect.height;
      return (childrenOf.get(parent.path) ?? []).some((sibling) => {
        if (sibling === node || !isVisible(sibling)) return false;
        const w = Math.min(node.rect.x + node.rect.width, sibling.rect.x + sibling.rect.width) - Math.max(node.rect.x, sibling.rect.x);
        const h = Math.min(node.rect.y + node.rect.height, sibling.rect.y + sibling.rect.height) - Math.max(node.rect.y, sibling.rect.y);
        return w > 0 && h > 0 && w * h > area * 0.5;
      });
    };
    const placeholder = children.length === 0 && !hasOwnPaint(node) && !formControl
      && parent != null && !decision.absolute && node.rect.width > 0 && node.rect.height > 0 && !insideSvg() && !stackedInGrid();
    if (children.length === 0 && !hasOwnPaint(node) && !formControl && !placeholder && !node.looseMarkup) { stats.droppedEmpty += 1; return null; }
    if (placeholder) stats.placeholderBoxes = (stats.placeholderBoxes ?? 0) + 1;

    const style = node.style ?? {};
    // 흐름 방향은 자식의 display가 결정한다(inline 형제는 가로로 흐른다).
    let layoutMode = padded ? "VERTICAL" : toLayoutMode(style, rawChildren.map((child) => child.style ?? {}));
    // 줄마다 새로 시작하는 인라인 글자는 세로로 쌓는다(stackedInlineText 주석).
    const stackedText = layoutMode === "HORIZONTAL" && stackedInlineText(style, children);
    if (stackedText) { layoutMode = "VERTICAL"; stats.stackedInlineText = (stats.stackedInlineText ?? 0) + 1; }
    if (style.flexWrap === "wrap" && layoutMode !== "HORIZONTAL" && layoutMode !== "NONE") {
      stats.verticalWrap.push({ path: node.path, layoutMode });
    }
    // **부모를 채운 외동 절대 자식은 흐름 자식 FILL 이다(2026-10-14, 조립 규칙 15조의 9).** 절대 자식만 둔 부모는 자동 배치 없이(NONE)
    // 서고, `inset: 0` 자식은 두 축 STRETCH 제약으로 부모를 따라간다(15조의 2). 그런데 Figma 는 제약으로 크기가 바뀐 자동 배치 프레임의
    // FILL 자식을 다시 배치하지 않는다 — 공개 모바일 메뉴 판(`fixed inset-0` 안의 `absolute inset-0` 세로 flex)을 360 으로 줄이자 판은
    // 360 이 됐는데 그 안의 FILL grid 가 366 에 남아 판 밖으로 24 나갔다(늘림 시험 run 2026-10-12b, 공개 모바일 보드 전부의 넘침 2 ·
    // 부모 밖 1). FILL 을 다시 걸면 324 로 풀린다(라이브 탐침) — 판을 세로 자동 배치로 두고 자식을 흐름 FILL 로 두면 처음부터 풀린다.
    // 부모가 뷰포트 겹침(`position: fixed`)이고 · 자식이 하나이고 · 자동 배치를 가지며 · 두 축 STRETCH · 부모 상자와 자리 · 크기가 같고(0.5 안)
    // · 부모에 패딩이 없을 때만 — CSS 에서 그 자식은 부모의 안쪽 상자 전체이고, 흐름 FILL 도 같은 상자다. 측정 크기의 자리 · 크기는 바뀌지
    // 않는다. 흐름 안의 절대 부모(편집기 · 노드캔버스 · 랜딩 장면의 같은 모양)는 늘림 시험이 그 결함을 보이지 않아 넓히지 않았다.
    if (layoutMode === "NONE" && style.position === "fixed" && children.length === 1 && soleSpanningChild(node, style, children[0])) {
      const [only] = children;
      children = [{
        ...only,
        positioning: "AUTO",
        offset: null,
        constraints: null,
        sizing: { ...only.sizing, layoutSizingHorizontal: "FILL", layoutSizingVertical: "FILL", layoutPositioning: "AUTO" },
        why: {
          horizontal: { verdict: "FILL", reason: "부모를 채운 외동 절대 자식(inset 0) — 흐름 FILL 로 옮긴다(조립 규칙 15조의 9)", source: "inset:0", value: null },
          vertical: { verdict: "FILL", reason: "부모를 채운 외동 절대 자식(inset 0) — 흐름 FILL 로 옮긴다(조립 규칙 15조의 9)", source: "inset:0", value: null },
        },
      }];
      layoutMode = "VERTICAL";
      stats.soleSpanningChildren = (stats.soleSpanningChildren ?? 0) + 1;
    }
    // 늘어난 grid 행과 칸 안 정렬(gridStretchedRow · gridCellAlign 주석).
    const gridRow = layoutMode === "GRID"
      ? gridCellAlign(node, style, stretchedRow, children, (child) => byPath.get(child.path)?.declared ?? {})
      : null;
    if (gridRow) {
      children = gridRow.children;
      stats.gridRows.push({ path: node.path, rows: gridRow.rows, aligned: gridRow.aligned });
    }
    // **한 칸에 겹친 슬라이드(2026-09-30).** 크로스페이드는 슬라이드를 한 칸에 겹쳐 세우고 하나만 보인다 — 보이지 않는 슬라이드는 글자가
    // 빠진 뒤 자리 상자만 남은 틀이라, Figma grid 가 한 줄씩 늘어놓자 랜딩 후기의 저자 줄 열셋이 312 로 쌓였다. 겹친 형제 무리에서
    // 서브트리에 보이는 내용(글자 · 칠 · 아이콘 · 이미지)이 없는 자식을 버린다.
    if (layoutMode === "GRID") {
      const hasContent = (spec) => Boolean(spec.text || spec.paints || spec.glyphSvg || spec.glyph || spec.src || spec.instance)
        || (spec.children ?? []).some(hasContent);
      const overlaps = (a, b) => {
        const w = Math.min(a.rect.x + a.rect.width, b.rect.x + b.rect.width) - Math.max(a.rect.x, b.rect.x);
        const h = Math.min(a.rect.y + a.rect.height, b.rect.y + b.rect.height) - Math.max(a.rect.y, b.rect.y);
        return w > 0 && h > 0 && w * h > Math.min(a.rect.width * a.rect.height, b.rect.width * b.rect.height) * 0.5;
      };
      const flow = children.filter((child) => child.positioning !== "ABSOLUTE");
      const drop = new Set(flow.filter((child) => !hasContent(child) && flow.some((other) => other !== child && overlaps(child, other))));
      if (drop.size) {
        children = children.filter((child) => !drop.has(child));
        stats.stackedDropped = (stats.stackedDropped ?? 0) + drop.size;
      }
    }
    // grid 칸 자리와 span(gridPlacements 주석).
    const gridPlace = layoutMode === "GRID" ? gridPlacements(node, style, children) : null;
    if (gridPlace) {
      children = children.map((child) => (gridPlace.placements.has(child) ? { ...child, gridPlace: gridPlace.placements.get(child) } : child));
      stats.gridPlacements = (stats.gridPlacements ?? 0) + 1;
    }
    // 높이 0 형제가 남긴 간격을 margin 으로 옮긴다(hiddenGapMargins 주석).
    // 글자를 떼어낸 노드는 그 글자 조각의 자리가 추정이라 보지 않는다.
    if (!split) for (const hidden of hiddenGapMargins(node, style, children)) stats.hiddenGaps = [...(stats.hiddenGaps ?? []), hidden];
    // 블록 흐름의 margin 겹침(collapsedBlockMargins 주석). 부모를 뚫고 나간 margin 은 이 노드의 바깥 margin 이 된다(큰 쪽).
    // **글자를 떼어낸 노드도 본다(2026-10-01).** 떼어낸 글자 조각은 margin 이 없어 겹침 판정에 끼지 않고, 판정은 측정된 자식의 자리로만
    // 한다 — 글자 뒤의 하위 목록(`<li>글자<ul class="mb-4">`)은 마지막 자식이라 margin 이 항목 밖으로 나가는데, 건너뛰자 항목 안에 갇혀
    // 약관 5조 · 8조의 다음 항목이 4 씩 밀렸다. 글자가 마지막이면 마지막 자식이 글자라 전과 같이 겹치지 않는다(CSS 에서도 줄 상자가 막는다).
    let throughTop = 0, throughBottom = 0;
    if (layoutMode === "VERTICAL") {
      const collapsed = collapsedBlockMargins(node, style, children);
      if (collapsed.count) stats.collapsedMargins = (stats.collapsedMargins ?? 0) + collapsed.count;
      throughTop = collapsed.top;
      throughBottom = collapsed.bottom;
    }
    stats.kept += 1;
    // **떠 있는 한 줄 글자는 글자 폭이다(2026-09-28).** 절대 배치 글자(입력칸의 떠 있는 라벨)를 측정 폭 그대로 FIXED 로 두면 Figma
    // 글꼴이 조금 넓게 그리는 순간 줄이 꺾인다(`/recover` 「이메일」 → 「이메 / 일」, 조립 규칙 28조). 폭 선언이 없는 절대 배치 상자는
    // 브라우저에서도 글자 폭으로 줄어드는 상자라(`text-align` 은 그 안에서 뜻이 없다) 한 줄이면 HUG 로 둔다.
    const declaredWidth = node.declared?.width;
    const floatingLine = decision.absolute && node.ownText && children.length === 0
      && (!declaredWidth || declaredWidth === "auto")
      && (() => {
        const lineHeight = px(style.lineHeight);
        return !lineHeight || Math.round(node.rect.height / lineHeight) <= 1;
      })();
    // **여러 줄로 감긴 가로 흐름은 폭을 자리가 정했다(2026-09-30).** `flex-wrap: wrap` 줄의 폭이 내용 폭(fit-content)으로 판정돼도,
    // 한 줄 내용이 자리보다 넓어 감겼다면 CSS 폭은 자리 폭이다 — Figma 의 HUG 감기 자동 배치는 감기지 않고 한 줄로 늘어난다(공개 페이지
    // 푸터의 링크 묶음 넷이 모바일에서 2×2 로 감기는데 보드는 한 줄 732 로 늘어나 높이가 304 → 132). 측정 자식이 두 줄 이상에 앉고
    // 부모가 세로로 쌓거나 grid 칸이면 가로 FILL 로 둔다(가로 부모의 FILL 은 늘이기라 뜻이 다르다).
    const wrappedRows = layoutMode === "HORIZONTAL" && style.flexWrap === "wrap" && sizing.layoutSizingHorizontal === "HUG"
      && parent != null && !decision.absolute && wrapsIntoRows(children) && stacksChildren(parent.style ?? {});
    if (wrappedRows) stats.wrappedRows = (stats.wrappedRows ?? 0) + 1;
    // **빈 자리 상자의 가로 FILL 은 남긴다(2026-10-08, 조립 규칙 15조의 4).** 빈 상자는 HUG 로 두면 0 으로 접혀 측정 크기(FIXED)로
    // 남기는데, 가로까지 굳히자 랜딩의 스크롤 자리 상자(`height: 3040px` · 폭 선언 없는 block — 부모를 채운다)가 보드를 1920 → 1440 으로
    // 줄여도 1920 에 남아 480 넘쳤다(늘림 시험, 모바일 402 → 360 은 42 · 공개 모바일 메뉴 판의 grid 칸 366 도 같다). 판정이 FILL 이면
    // 가로는 FILL 로 둔다 — 측정 폭에서는 부모 안쪽 폭 = 측정 폭이라 자리 · 크기가 같다. 세로는 지금처럼 측정 높이(FIXED)다.
    const nodeSizing = floatingLine
      ? { ...sizing, layoutSizingHorizontal: "HUG", layoutSizingVertical: "HUG" }
      : placeholder
        ? { ...sizing, layoutSizingHorizontal: sizing.layoutSizingHorizontal === "FILL" ? "FILL" : "FIXED", layoutSizingVertical: "FIXED" }
        : wrappedRows
          ? { ...sizing, layoutSizingHorizontal: "FILL" }
          : sizing;
    if (floatingLine) stats.floatingLines = (stats.floatingLines ?? 0) + 1;
    const slack = layoutMode === "HORIZONTAL" ? lineBoxSlack(node, style, children, rawChildren)
      : layoutMode === "VERTICAL" && !split && !stackedText && !padded
        ? flowSlack(node, style, children, rawChildren, nodeSizing, options.recordedBottom ?? null, parent, parent ? (childrenOf.get(parent.path) ?? []) : []) : null;
    const clearBorder = clearBorderPadding(style);
    const paint = withPseudoShadows(paintOf(style), node);
    // 테두리에 합친 링의 두께 — 획이 레이아웃에 드므로 패딩에서 뺀다(paintOf 주석).
    const ringWithin = paint?.stroke?.ringWithin ?? [0, 0, 0, 0];
    if (slack && layoutMode === "HORIZONTAL") stats.lineBoxSlack.push({ path: node.path, ...slack });
    if (slack && layoutMode === "VERTICAL") stats.flowSlack = [...(stats.flowSlack ?? []), { path: node.path, ...slack }];
    const fixedRows = layoutMode === "GRID" ? (declaredFixedRows(node, style) ?? contentFreeRows(style, nodeSizing, children)) : null;
    return {
      path: node.path,
      tag: node.tag,
      name: node.classAttr ? `${node.tag}.${node.path}` : node.path,
      // 글자를 자식으로 떼어냈으면 이 노드는 더 이상 글자를 갖지 않는다(중복 렌더 방지).
      text: textMoved ? null : (node.ownText || null),
      textLines: textMoved ? null : (node.ownTextLines?.length ? node.ownTextLines : null),
      // 제품 글꼴로 보이는 줄(측정기 `wrapLines`, 감긴 자리가 `<br>` 보다 많을 때만). 서명 · 매칭은 `text` 를 보고, 러너만 이 줄로
      // 글자를 줄바꿈해 싣는다(measured-text.mjs).
      ...(!textMoved && node.wrapLines ? { wrapLines: node.wrapLines } : {}),
      // 글자 안의 범위 서식(굵기 · 색 · 밑줄) — 섞인 문단을 합친 자리(richInlineText).
      ...(!textMoved && node.textRanges?.length ? { textRanges: node.textRanges } : {}),
      // 스스로 그리는 것이 있는가(면·테두리·그림자·이미지). 래퍼 접기 판정과 색 이관에 쓴다.
      paints: hasOwnPaint(node),
      // rect는 FIXED 축 크기와 검증용이다. FILL/HUG 축은 Figma가 계산한다.
      rect: node.rect,
      // **아이콘의 정체.** `<svg>` 일 때만. 자손 도형은 바로 아래에서 버려지므로, 버리기 전에
      // 서명을 떠서 붙인다. 이것이 없으면 아이콘은 크기만 남은 빈 상자가 된다.
      glyph: glyphSignature(node, childrenOf),
      // **아이콘의 그림.** 측정한 도형(기하 속성 + 계산된 칠 · 획)을 SVG 로 조립한다 — 렌더러가 이것으로 아이콘을 그린다(glyphMarkup).
      ...(node.tag === "svg" ? (() => { const markup = glyphMarkup(node, childrenOf); return markup ? { glyphSvg: markup } : {}; })() : {}),
      ...(node.looseMarkup ? { glyphSvg: node.looseMarkup } : {}),
      // **이미지의 정체.** `<img>` 의 src — 생성기가 LOUIS 자산 컴포넌트와 잇는 열쇠다(IMAGE_COMPONENTS).
      ...(node.tag === "img" && node.src ? { src: node.src } : {}),
      sizing: nodeSizing,
      // **색·테두리·radius·그림자·불투명도.** 측정에 없는 값은 담지 않는다.
      paint,
      // **타이포.** 텍스트를 직접 가진 노드만. LOUIS 텍스트 스타일 이름으로 바꿔 싣는다.
      // 떠 있는 한 줄 라벨은 정렬을 싣지 않는다 — 글자 폭 상자라 제품에서 `text-align` 은 뜻이 없는데, Figma 의 폭 자동 글자는
      // 가운데 정렬이면 텍스트 스타일이 뒤늦게 걸릴 때 양쪽으로 자라 왼쪽 끝이 밀린다(로그인 모바일 「Password」 x 33 → 28, 캡처로 확인).
      typography: (!textMoved && (node.ownText || node.ownTextLines?.length))
        ? (() => {
          const typography = floatingLine ? { ...typographyOf(style), align: null } : typographyOf(style);
          const clipped = typography ? clippedTextPaint(style, node.rect) : null;
          const painted = clipped ? { ...typography, color: clipped.color ?? null, ...(clipped.gradient ? { gradient: clipped.gradient } : {}) } : typography;
          // 측정기가 본 실제 말줄임(`truncated`, 넘친 말줄임 글자) — 렌더러가 측정 폭을 최대 폭으로 걸고 끝을 자른다.
          const truncated = painted && painted.truncate && node.truncated ? { ...painted, truncated: true } : painted;
          const clamp = truncated && !truncated.truncate ? lineClampOf(style, node.rect, truncated) : null;
          return clamp ? { ...truncated, lineClamp: clamp } : truncated;
        })()
        : null,
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
        // 뚫고 나간 자식 margin 이 있을 때만 큰 쪽 — 음수 margin(테두리 겹침 −1 · 당김)은 그대로 둔다(형제 사이 음수 간격 묶음이 읽는다).
        top: throughTop > 0 ? Math.max(px(style.marginTop) ?? 0, throughTop) : (px(style.marginTop) ?? 0),
        right: px(style.marginRight) ?? 0,
        bottom: throughBottom > 0 ? Math.max(px(style.marginBottom) ?? 0, throughBottom) : (px(style.marginBottom) ?? 0),
        left: px(style.marginLeft) ?? 0,
      },
      // ABSOLUTE 노드는 부모 기준 좌표와 제약이 필요하다.
      offset: decision.absolute && parent
        ? { x: node.rect.x - parent.rect.x, y: node.rect.y - parent.rect.y }
        : null,
      constraints: decision.absolute
        ? constraintsFor(node.declared ?? {}, node.style ?? null, parent?.style ?? null, parent ? {
          viewport: viewportStage(parent, byPath),
          siblings: (childrenOf.get(parent.path) ?? []).filter((sibling) => sibling !== node),
        } : null, { text: Boolean(node.ownText) })
        : null,
      why: { horizontal: decision.h, vertical: decision.v },
      // **자동 배치 없는 글자 상자의 안쪽 여백(2026-10-12 오후).** 입력칸처럼 자식 없이 글자(placeholder)를 그리는 면은 layout 이 null 이라
      // padding 이 실리지 않아, 렌더러가 글자를 면 전체에 펼쳤다 — 노드캔버스 레이어 검색칸(pl 28)의 「Search layers」 가 x 0 에서 돋보기와 겹쳤다.
      ...(layoutMode === "NONE" && node.ownText
        && [style.paddingTop, style.paddingRight, style.paddingBottom, style.paddingLeft].some((value) => (px(value) ?? 0) > 0)
        ? { textInset: [px(style.paddingTop) ?? 0, px(style.paddingRight) ?? 0, px(style.paddingBottom) ?? 0, px(style.paddingLeft) ?? 0] } : {}),
      layout: layoutMode === "NONE" ? null : {
        layoutMode,
        // itemSpacing은 **주축** 간격이다 — 세로 배치면 row-gap, 가로 배치면 column-gap.
        itemSpacing: stackedText ? 0 : (layoutMode === "VERTICAL"
          ? px(style.rowGap ?? style.gap)
          : px(style.columnGap ?? style.gap)) ?? 0,
        counterAxisSpacing: stackedText ? null : (layoutMode === "VERTICAL"
          ? px(style.columnGap)
          : px(style.rowGap)) ?? null,
        // **wrap 은 가로 배치에만 싣는다.** Figma 의 `layoutWrap = "WRAP"` 은 HORIZONTAL 자동 배치에만
        // 걸리고, 세로 프레임에 걸면 플러그인 API 가 던져 보드 러너가 그 자리에서 멈춘다. 실측
        // (2026-09-14): `/subscription` 모바일 크레딧 카드의 promo 줄 `body.1.0.0.1.0.1.1.0.1.1.0.4` 가
        // `flex-direction: column; flex-wrap: wrap` 이라 VERTICAL + wrap 1 로 실려 있었다. 세로 flex 는
        // 높이가 정해져야 감기는데 그 줄은 높이 선언이 없고 자식이 하나라, 제품에서도 감기지 않는다 —
        // NO_WRAP 이 같은 그림이다. 표현하지 못한 자리는 `stats.verticalWrap` 에 남긴다.
        wrap: layoutMode === "HORIZONTAL" && style.flexWrap === "wrap",
        padding: {
          top: (px(style.paddingTop) ?? 0) + (slack?.top ?? 0) + clearBorder.top - ringWithin[0],
          right: (px(style.paddingRight) ?? 0) + clearBorder.right - ringWithin[1],
          bottom: (px(style.paddingBottom) ?? 0) + (slack?.bottom ?? 0) + clearBorder.bottom - ringWithin[2],
          left: (px(style.paddingLeft) ?? 0) + clearBorder.left - ringWithin[3],
        },
        // **GRID는 열 개수를 함께 줘야 한다.** Figma는 `gridColumnCount`가 없으면 기본 2열로 깔아
        // 4열 카드가 2열로 접힌다. 열 수는 선언된 `grid-template-columns`를 펼쳐 센다(computed는
        // 이미 px로 풀려 `repeat()`을 복원할 수 없지만 트랙 개수는 그대로 살아 있다).
        columns: layoutMode === "GRID" ? gridColumns(node, style) : null,
        // 열마다의 크기 — 크기가 다른 열만(gridColumnTracks 주석).
        columnTracks: layoutMode === "GRID" ? gridColumnTracks(node, style, nodeSizing) : null,
        // 한 줄짜리 grid 에서 내용보다 높게 늘어난 행 — 브라우저가 푼 트랙 높이(FIXED 로 깐다). 선언된 고정 행도 여기다. 없으면 null.
        // 내용이 정하지 않은 행(contentFreeRows)도 고정 행이다.
        rows: gridRow?.rows ?? fixedRows,
        // 칸 자리를 되짚은 grid 의 행 수(gridPlacements) · 선언된 고정 행 수 — 렌더러가 자식 수로 행을 세지 않고 이 수로 깐다.
        ...(gridPlace ? { rowCount: gridPlace.rowCount }
          : !gridRow?.rows && fixedRows ? { rowCount: fixedRows.length } : {}),
        align: {
          // 세로로 쌓은 줄 글자는 `text-align` 이 줄을 놓는다 — 조각이 글자 폭(HUG)이라 교차축 정렬이 곧 줄 정렬이다.
          counterAxis: stackedText
            ? (TEXT_ALIGN_COUNTER[style.textAlign] ?? "MIN")
            : liftChildAlign(cssAlignToFigma(style.alignItems), rawChildren, children),
          primaryAxis: slack?.realign ? null : cssJustifyToFigma(style.justifyContent),
        },
      },
      // 스크롤 칸(`overflow-x: auto · scroll`)은 자식이 실제로 넘칠 때만 자른다 — 스크롤 전 첫 화면이 그 칸 안만 보인다(요금제 비교표).
      // 세로 스크롤 칸(`overflow-y: auto · scroll`)도 같다(2026-10-12 오후) — 커맨드 팔레트 목록(최대 높이 520 패널 안)이 자르지 않아 뒤 그룹이
      // 아래 단축키 줄을 덮었다.
      clipsContent: style.overflow === "hidden" || style.overflowX === "hidden"
        || (/^(auto|scroll)$/.test(style.overflowX ?? "") && children.some((child) => child.positioning !== "ABSOLUTE"
          && child.rect.x + child.rect.width > node.rect.x + node.rect.width + 1))
        || (/^(auto|scroll)$/.test(style.overflowY ?? "") && children.some((child) => child.positioning !== "ABSOLUTE"
          && child.rect.y + child.rect.height > node.rect.y + node.rect.height + 1)),
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
    // **고정 크기가 자식과 다른 축은 자리를 차지한다(2026-10-08).** 판정이 둘 다 FIXED 여도 크기가 다르면 감싸개가 남는 자리를 만든다 —
    // 랜딩 스크롤 구간(`height: calc(… * 화면 수)` 4370 · 3924)이 제 안의 sticky 판(100vh, 874)과 둘 다 FIXED 라 접혀, 구간 높이가 판
    // 높이로 줄고 홈 모바일 보드가 6546 짧았다. 측정 크기가 반 픽셀 넘게 다른 FIXED 축이 있으면 접지 않는다.
    for (const [key, size] of [["layoutSizingHorizontal", "width"], ["layoutSizingVertical", "height"]]) {
      if (candidate.sizing[key] === "FIXED" && candidate.rect && only.rect && Math.abs(candidate.rect[size] - only.rect[size]) > 0.5) return false;
    }
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
 *
 * **뷰포트를 채우는 고정 레이어는 그 축에서 늘어난다(2026-10-08, 조립 규칙 15조의 2).** 공개 페이지 상단 바는 `left: 0;
 * width: 100%` 로 한쪽만 선언해 MIN 이 됐다 — 보드 폭을 1920 → 1440 으로 줄이자 바가 1920 그대로 남아 오른쪽 480(언어 · 테마 ·
 * Get started)이 잘렸다. `position: fixed` 의 포함 블록은 뷰포트라, 계산값(`getComputedStyle` 은 위치 지정 요소의 네 변을 쓰인
 * 값 px 로 푼다)에서 양쪽 변이 모두 0 이면 그 축을 뷰포트 끝에서 끝까지 채운 것이다(`width: 100%` · `inset-x-0` · `100vw` ·
 * `100dvh` 의 공통 결과). 그 축을 STRETCH 로 둔다. 측정 폭에서의 자리 · 크기는 바뀌지 않는다(제약은 부모가 커지거나 줄 때만
 * 일한다). 앱 사이드바(`top: 0; height: 100dvh`)는 세로만 늘어나고 가로는 왼쪽에 붙는다(계산값 right 1680). 겹침 뿌리(측정기
 * `overlays` — 팔레트 배경 · 연체 배너)는 선언이 비어도 계산값으로 같은 판정을 받는다.
 *
 * **포함 블록을 채우는 절대 배치도 그 축에서 늘어난다(2026-10-08, 15조의 2).** `position: absolute` 의 계산값 네 변도 쓰인 값 px 라,
 * 양쪽이 0 이면 포함 블록을 끝에서 끝까지 채운 것이다(`inset-0` · `inset-x-0` · `left: 0; width: 100%`). 팔레트 배경(겹침 뿌리 안의
 * `absolute` · 선언 없음)이 MIN 으로 서서 1440 에서 480, 랜딩 푸터의 페이드(`bottom: 100%` · 계산값 left · right 0)가 모바일 360 에서
 * 42 넘쳤다. 다만 그 축의 크기를 고정 길이로 선언했으면(`width: 400px` 이 마침 부모 폭과 같은 경우) 늘어나지 않으므로 뺀다.
 *
 * **가운데에 둔 절대 배치는 CENTER 다(2026-10-08, 15조의 2).** `left: 50%`(또는 `top: 50%`)는 자기 왼쪽 변을 포함 블록 가운데에 두고,
 * 흔히 `translate: -50%` 로 자기 가운데를 맞춘다. 어느 쪽이든 부모가 커지거나 줄 때 노드 가운데와 부모 가운데의 거리가 그대로다 — Figma
 * 의 CENTER 가 그 뜻이다. MIN 으로 두면 부모를 줄여도 왼쪽 거리가 측정 폭의 절반에 묶인다. 측정 폭의 자리는 바뀌지 않는다.
 *
 * **flex 교차축 가운데에 선 절대 배치도 CENTER 다(2026-10-08, 15조의 5).** 한 축의 두 변을 다 비운(`auto` · 선언 없음) 절대 배치는 그
 * 축에서 정적 자리에 선다 — flex 부모 안의 정적 자리는 그 요소가 유일한 flex 항목인 것처럼 정렬한 자리라, 교차축 정렬(`align-self`,
 * 없으면 부모 `align-items`)이 `center` 면 부모 교차축 가운데다. 연체 배너 닫기 단추(`position: absolute; right: 12px` · 배너는 가로
 * flex · `align-items: center`)가 MIN 으로 서면 배너 높이가 바뀔 때 위에 붙는다. 가로 flex 면 세로, 세로 flex 면 가로가 교차축이다.
 * 주축 정적 자리(`justify-content`)는 보지 않는다. 측정 폭의 자리는 바뀌지 않는다.
 *
 * **스크립트가 무대 크기로 자리를 쓰는 층은 SCALE 이다(2026-10-14, 조립 규칙 15조의 8).** 랜딩 하이라이트 · 끝 장면의 칸과 카드는
 * `absolute left-0 top-0` 위에 스크립트가 무대(`stage.clientWidth`)에서 계산한 `translate3d(x, y)` · 폭 · 높이를 프레임마다 쓴다
 * (`HighlightShowcase.tsx` · `highlightScene.ts` 의 `frame(scrolled, stage)`). 선언으로 보면 왼쪽 0 이라 MIN 이 되고, 측정 자리는
 * 변환(translate) 안에만 있다 — 보드를 1920 → 1440 으로 줄이자 칸이 1379 · 카드가 1240 에 남아 무대 밖으로 108 · 151 나갔다(늘림
 * 시험 run 2026-10-12b). 제품은 무대가 줄면 자리를 다시 계산해 무대 안에 둔다. 계산값의 변환이 이동만 있는 행렬이고 그 축의 이동이
 * 0 이 아니며, 그 축의 시작 변 선언이 없거나 0 이고 끝 변 선언이 없으면 — 자리를 변환이 정했다 — 그 축을 무대에 비례(SCALE)로 둔다.
 * 무대가 뷰포트 높이 단위로 선 상자일 때만(viewportStage) — 노드 캔버스의 React Flow 노드도 `translate` 로 서지만 창이 줄어도 캔버스 좌표에
 * 머문다.
 * `top: 50%` + `translateY(-50%)` 처럼 시작 변을 선언한 가운데 맞춤은 그 선언이 정한다(위 CENTER).
 *
 * **같은 무대의 같은 여백 상자는 STRETCH 다(2026-10-14, 15조의 8).** 그런 층을 형제로 둔 무대(`stageSiblings` 가운데 위 판정에 걸리는
 * 형제가 있다)는 스크립트가 배치한다 — 모바일 제목 칸(`left: 20px; width: 362px`)은 `titleColumn(stage)` 의 `{ left: 20, width:
 * stage.width - 40 }` 이다. 선언으로는 고정 폭이지만, 계산값의 양쪽 여백이 같으면(왼쪽 20 · 오른쪽 20) 무대 폭에서 여백을 뺀 폭이라
 * 그 축을 STRETCH 로 둔다. 데스크톱 제목(왼쪽 192 · 오른쪽 1128)은 여백이 달라 그대로 MIN 이다.
 */
export function constraintsFor(declared, computed = null, parentComputed = null, stage = null, self = {}) {
  const has = (value) => value != null && value !== "auto" && value !== "";
  const position = computed?.position;
  const zero = (value) => px(value) === 0;
  const placed = stage?.viewport ? transformPlacedAxes(declared, computed) : { horizontal: false, vertical: false };
  const scriptStage = Boolean(stage?.viewport) && position === "absolute" && (stage.siblings ?? [])
    .some((sibling) => { const axes = transformPlacedAxes(sibling.declared ?? {}, sibling.style ?? null); return axes.horizontal || axes.vertical; });
  const equalInsets = (start, end, size) => scriptStage && px(declared[start]) > 0 && lengthDeclaredPx(declared[size]) && !has(declared[end])
    && px(computed?.[start]) != null && Math.abs(px(computed[start]) - (px(computed?.[end]) ?? Number.NaN)) <= 0.5;
  const lengthDeclared = (value) => has(value) && px(String(value).replace(/\s*!\s*important\s*$/i, "")) != null;
  const spans = (start, end, size) => (position === "fixed" || (position === "absolute" && !lengthDeclared(declared[size])))
    && zero(computed[start]) && zero(computed[end]);
  const centred = (value) => /^(calc\(\s*50%\s*\)|50%)$/.test(String(value ?? "").replace(/\s*!\s*important\s*$/i, "").trim());
  // flex 교차축 정적 자리가 가운데인가 — 그 축의 두 변이 다 비었을 때만(위 주석).
  const flexRow = /flex/.test(parentComputed?.display ?? "") && (parentComputed?.flexDirection ?? "row").startsWith("row");
  const flexColumn = /flex/.test(parentComputed?.display ?? "") && (parentComputed?.flexDirection ?? "").startsWith("column");
  const ownAlign = String(declared["align-self"] ?? computed?.alignSelf ?? "auto").trim();
  const crossAlign = /^(auto|normal)$/.test(ownAlign) ? parentComputed?.alignItems : ownAlign;
  const staticCentre = (cross, start, end) => cross && position === "absolute" && !has(declared[start]) && !has(declared[end])
    && /^(safe\s+|unsafe\s+)?center$/.test(String(crossAlign ?? "").trim());
  // 백분율 시작 변(15조의 11) — 글자가 아니면 SCALE(자리가 부모에 비례한다), 글자는 SCALE 이 폭을 줄여 다시 감으므로(라이브 탐침:
  // 「1:30」 23 → 20.4 · 두 줄) 크기도 백분율이 아닌 한 비율 p 에 가장 가까운 닻(MIN · CENTER · MAX). 판정 밖이면 null.
  const percentAnchor = (start, end, size, borderStart, borderEnd) => {
    if (position !== "absolute" || !percentOf(declared[start]) || has(declared[end]) || centred(declared[start])) return null;
    const box = (px(parentComputed?.[size]) ?? 0) - (px(parentComputed?.[borderStart]) ?? 0) - (px(parentComputed?.[borderEnd]) ?? 0);
    const offset = px(computed?.[start]);
    if (!(box > 0) || offset == null) return null;
    const p = offset / box;
    // 부모 안에서 시작하는 것만 — `top: 100%` 아래로 펼친 메뉴 · `left: 0%` 는 비율 자리가 아니다(옛 판정 그대로).
    if (!(p > 0.001 && p < 0.999)) return null;
    if (percentOf(declared[size]) || !self.text) return "SCALE";
    return p <= 0.25 ? "MIN" : p >= 0.75 ? "MAX" : "CENTER";
  };
  const horizontalPercent = percentAnchor("left", "right", "width", "borderLeftWidth", "borderRightWidth");
  const verticalPercent = percentAnchor("top", "bottom", "height", "borderTopWidth", "borderBottomWidth");
  return {
    horizontal: (has(declared.left) && has(declared.right)) || spans("left", "right", "width") || equalInsets("left", "right", "width") ? "STRETCH"
      : centred(declared.left) || (centred(declared.right) && !has(declared.left)) || staticCentre(flexColumn, "left", "right") ? "CENTER"
        : placed.horizontal ? "SCALE"
          : horizontalPercent ? horizontalPercent
            : has(declared.right) ? "MAX" : "MIN",
    vertical: (has(declared.top) && has(declared.bottom)) || spans("top", "bottom", "height") || equalInsets("top", "bottom", "height") ? "STRETCH"
      : centred(declared.top) || (centred(declared.bottom) && !has(declared.top)) || staticCentre(flexRow, "top", "bottom") ? "CENTER"
        : placed.vertical ? "SCALE"
          : verticalPercent ? verticalPercent
            : has(declared.bottom) ? "MAX" : "MIN",
  };
}

/** 선언이 포함 블록의 백분율인가 — `5%` · `calc(var(--tick, 0) * 1%)` 처럼 `%` 를 품은 길이(15조의 11). `50%` 가운데 맞춤은 위 CENTER 가 먼저 받는다. */
function percentOf(value) {
  return /%/.test(String(value ?? "").replace(/\s*!\s*important\s*$/i, ""));
}

/**
 * 무대가 뷰포트 높이 단위로 선 상자인가(constraintsFor 의 SCALE 주석). 부모에서 시작해 `inset: 0`(네 변 0) 절대 상자를 건너 올라가
 * 처음 만나는 상자의 높이 선언이 `100lvh` · `100svh` · `100dvh` · `100vh` 처럼 뷰포트 높이 단위면 참이다 — 랜딩 장면 무대(sticky
 * `[height:100lvh]`)는 뷰포트 크기로 서고, 스크립트가 그 크기에서 층의 자리를 다시 계산한다. 노드 캔버스처럼 패널 안에서 이동 · 확대로
 * 자리를 쓰는 층(React Flow 의 `translate`)은 무대가 뷰포트 단위가 아니라 빠진다 — 그 층은 창이 줄어도 캔버스 좌표에 머문다.
 */
function viewportStage(parent, byPath) {
  const zero = (value) => /^0(px)?$/.test(String(value ?? "").trim());
  let at = parent;
  for (let hop = 0; at && hop < 4; hop++) {
    const declared = at.declared ?? {};
    const insetZero = at.style?.position === "absolute"
      && (zero(declared.inset) || ["top", "right", "bottom", "left"].every((side) => zero(declared[side])));
    if (!insetZero) return /^\d+(\.\d+)?(l|s|d)?vh$/.test(String(declared.height ?? "").trim());
    at = byPath.get(at.parentPath);
  }
  return false;
}

/** 부모를 채운 외동 절대 자식인가(convert 의 15조의 9 주석). */
function soleSpanningChild(node, style, child) {
  if (child?.positioning !== "ABSOLUTE" || !child.layout) return false;
  if (child.constraints?.horizontal !== "STRETCH" || child.constraints?.vertical !== "STRETCH") return false;
  if (["paddingTop", "paddingRight", "paddingBottom", "paddingLeft", "borderTopWidth", "borderRightWidth", "borderBottomWidth", "borderLeftWidth"]
    .some((key) => (px(style[key]) ?? 0) !== 0)) return false;
  const near = (a, b) => Math.abs(a - b) <= 0.5;
  return near(child.rect.x, node.rect.x) && near(child.rect.y, node.rect.y)
    && near(child.rect.width, node.rect.width) && near(child.rect.height, node.rect.height);
}

const lengthDeclaredPx = (value) => /^-?[\d.]+px$/.test(String(value ?? "").trim());

/**
 * 절대 배치의 자리를 변환이 정한 축(constraintsFor 의 SCALE 주석). 계산값 `transform` 이 이동만 있는 `matrix(1, 0, 0, 1, tx, ty)` 이고,
 * 그 축의 이동이 0 이 아니며, 시작 변 선언이 없거나 0px 이고 끝 변 선언이 없을 때 그 축이 참이다.
 */
function transformPlacedAxes(declared, computed) {
  const none = { horizontal: false, vertical: false };
  if (computed?.position !== "absolute") return none;
  const match = /^matrix\(\s*1,\s*0,\s*0,\s*1,\s*([-\d.e]+),\s*([-\d.e]+)\s*\)$/.exec(String(computed.transform ?? "").trim());
  if (!match) return none;
  const free = (start, end) => {
    const startValue = String(declared[start] ?? "").trim();
    const endValue = String(declared[end] ?? "").trim();
    return (startValue === "" || startValue === "auto" || px(startValue) === 0) && (endValue === "" || endValue === "auto");
  };
  const moved = (value) => Math.abs(Number(value)) > 0.5;
  return {
    horizontal: moved(match[1]) && free("left", "right") && !String(declared.inset ?? "").trim(),
    vertical: moved(match[2]) && free("top", "bottom") && !String(declared.inset ?? "").trim(),
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
 *
 * **표기가 두 가지 섞여 있다.** 배경은 `rgb()`/`rgba()`지만 테두리에는
 * `color(srgb 0.933333 0.933333 0.945098)` 형태가 나온다(0~1 정규화 + 슬래시 알파).
 * 실측 사고: `rgb()`만 읽었더니 제품에서 **가장 많이 쓰이는 구분선 색 `#eeeef1`(28 edge)** 을
 * 통째로 놓쳐 `/settings`·`/subscription` 행 사이 줄이 전부 사라졌다.
 */
export function cssColorToHex(value) {
  const raw = String(value ?? "").trim();
  let channels = null;
  const legacy = /^rgba?\(([^)]+)\)$/.exec(raw);
  if (legacy) {
    channels = legacy[1].split(/[,\s/]+/).filter(Boolean).map(Number);
  } else {
    const modern = /^color\(srgb\s+([^)]+)\)$/.exec(raw);
    if (!modern) return null;
    const parts = modern[1].split(/[\s/]+/).filter(Boolean).map(Number);
    if (parts.length < 3) return null;
    // `color(srgb …)` 는 0~1 정규화 값이다. 알파는 있으면 그대로 0~1.
    channels = [parts[0] * 255, parts[1] * 255, parts[2] * 255, parts.length > 3 ? parts[3] : 1];
  }
  const [r, g, b] = channels;
  if (![r, g, b].every(Number.isFinite)) return null;
  const alpha = channels.length > 3 && Number.isFinite(channels[3]) ? channels[3] : 1;
  if (alpha <= 0) return null;
  const to = (channel) => Math.round(Math.min(255, Math.max(0, channel))).toString(16).padStart(2, "0");
  return `${to(r)}${to(g)}${to(b)}${alpha >= 0.999 ? "" : to(alpha * 255)}`;
}

/**
 * CSS `box-shadow` → Figma DROP_SHADOW/INNER_SHADOW 목록.
 * 제품이 쓰는 값은 3종뿐이며(실측) 형태는 `<color> x y blur spread [inset]` 이다.
 * 해석하지 못한 그림자는 **버린다** — 지어내지 않는다.
 */
// 색 표기는 둘이다 — legacy `rgb()`/`rgba()` 와, LOUIS 별칭을 거친 계산값의 `color(srgb …)`(Chromium 직렬화).
// **2026-09-26 전에는 앞의 것만 읽었다.** LOUIS 헤어라인(`--louis-hairline-inset` = `color(srgb 0.09 0.106 0.133 / 0.12)
// 0 0 0 0.5px inset`)이 전부 뒤의 표기라, 보드 전체에서 카드 · 입력의 헤어라인이 통째로 빠져 있었다(그림자 2개만 남음).
const SHADOW_COLOR = /(?:rgba?|color)\([^)]*\)/;
export function parseBoxShadow(value) {
  if (!value || value === "none") return null;
  const shadows = [];
  for (const piece of String(value).split(/,(?![^(]*\))/)) {
    const raw = piece.trim();
    if (!raw) continue;
    const inset = /(^|\s)inset(\s|$)/.test(raw);
    const colorMatch = SHADOW_COLOR.exec(raw);
    const color = colorMatch ? cssColorToHex(colorMatch[0]) : null;
    if (!color) continue;
    const numbers = raw.replace(SHADOW_COLOR, "").replace(/inset/, "")
      .trim().split(/\s+/).map((token) => px(token)).filter((n) => n != null);
    if (numbers.length < 2) continue;
    const [x, y, blur = 0, spread = 0] = numbers;
    shadows.push({ inset, color, x, y, blur, spread });
  }
  return shadows.length ? shadows : null;
}

/** 면 관련 측정값을 spec 형태로. 그릴 게 하나도 없으면 null. */
/** 괄호를 세며 최상위 쉼표로만 자른다 — `rgb(0, 0, 0)` 안의 쉼표에 걸리지 않게. */
function splitTopLevel(value, separator = ",") {
  const parts = [];
  let depth = 0;
  let start = 0;
  for (let index = 0; index < value.length; index += 1) {
    const char = value[index];
    if (char === "(") depth += 1;
    else if (char === ")") depth -= 1;
    else if (char === separator && depth === 0) { parts.push(value.slice(start, index)); start = index + 1; }
  }
  parts.push(value.slice(start));
  return parts.map((part) => part.trim()).filter(Boolean);
}

/** CSS 방향 키워드 → deg(0deg = 위쪽, 시계 방향). */
const GRADIENT_KEYWORDS = Object.freeze({
  "to top": 0, "to right": 90, "to bottom": 180, "to left": 270,
  "to top right": 45, "to right top": 45, "to bottom right": 135, "to right bottom": 135,
  "to bottom left": 225, "to left bottom": 225, "to top left": 315, "to left top": 315,
});

/**
 * `linear-gradient(...)` 한 겹을 각도와 색 정지점으로 읽는다.
 *
 * **왜 필요한가:** `backgroundColor` 만 읽으면 그라디언트 면이 통째로 빠진다. 실측 사고:
 * `/archive` 의 `Start a new project` 버튼은 배경이 `linear-gradient(90deg, #1491ff …)` 이고
 * 글자는 `#fafafa` 라, 면을 잃자 **흰 글자만 남아 화면에서 사라졌다**(스크린샷으로 확인).
 *
 * 정지점 위치가 없으면 균등 배분한다(CSS 기본). `url()` 등 다른 겹은 여기서 다루지 않는다.
 */
function parseLinearGradient(layer) {
  const match = /^linear-gradient\((.*)\)$/s.exec(layer.trim());
  if (!match) return null;
  const parts = splitTopLevel(match[1]);
  if (parts.length < 2) return null;
  let angle = 180;
  let first = 0;
  const head = parts[0].toLowerCase();
  const deg = /^(-?[\d.]+)deg$/.exec(head);
  if (deg) { angle = Number(deg[1]); first = 1; }
  else if (head in GRADIENT_KEYWORDS) { angle = GRADIENT_KEYWORDS[head]; first = 1; }
  const stops = [];
  for (const part of parts.slice(first)) {
    const percent = /\s(-?[\d.]+)%$/.exec(part);
    const color = cssColorToHex(percent ? part.slice(0, percent.index) : part);
    if (!color) return null;
    stops.push({ color, position: percent ? Number(percent[1]) / 100 : null });
  }
  if (stops.length < 2) return null;
  // 위치가 없는 정지점은 CSS 기본대로 균등 배분한다.
  if (stops[0].position == null) stops[0].position = 0;
  if (stops[stops.length - 1].position == null) stops[stops.length - 1].position = 1;
  for (let index = 1; index < stops.length - 1; index += 1) {
    if (stops[index].position == null) stops[index].position = index / (stops.length - 1);
  }
  return { angle, stops };
}

/**
 * **글자 모양으로 오린 그라디언트(2026-09-30).** 글자색이 투명이고 배경이 그라디언트면 `background-clip: text` 다(측정기는 오림 축을 싣지
 * 않지만, 그렇지 않으면 글자가 보이지 않는 디자인이라 뜻이 없다) — 랜딩 후기 밴드의 인용문이 칠 없는 글자로 사라졌다. 배경 크기 ·
 * 자리(`300% 100%` · `19% 0px`)로 글자 상자에 보이는 구간을 계산해 정지점을 다시 매긴다. 보이는 구간이 한 색이면 그 색 하나다.
 * @returns {null | {color: string} | {gradient: {angle: number, stops: {color: string, position: number}[]}}}
 */
function clippedTextPaint(style, rect) {
  if (!/^(transparent|rgba\([^)]*,\s*0\)|color\([^)]*\/\s*0\))$/.test(String(style.color ?? "").trim())) return null;
  const layers = (style.backgroundImage && style.backgroundImage !== "none") ? splitTopLevel(style.backgroundImage) : [];
  const gradient = layers.map(parseLinearGradient).find(Boolean);
  if (!gradient) return null;
  let t0 = 0, t1 = 1;
  const horizontal = Math.abs(((gradient.angle % 360) + 360) % 180 - 90) < 0.5;
  if (horizontal && rect?.width > 0) {
    const [sizeX] = String(style.backgroundSize ?? "auto").split(/\s+/);
    const scale = /%$/.test(sizeX) ? Number.parseFloat(sizeX) / 100 : (px(sizeX) != null ? px(sizeX) / rect.width : 1);
    const [positionX] = String(style.backgroundPosition ?? "0% 0%").split(/\s+/);
    const bgWidth = rect.width * scale;
    const offset = /%$/.test(positionX) ? (rect.width - bgWidth) * (Number.parseFloat(positionX) / 100) : (px(positionX) ?? 0);
    t0 = -offset / bgWidth;
    t1 = (rect.width - offset) / bgWidth;
    if (((gradient.angle % 360) + 360) % 360 > 180) { const flip = [1 - t1, 1 - t0]; t0 = flip[0]; t1 = flip[1]; }
  }
  const colorAt = (t) => {
    const stops = gradient.stops;
    if (t <= stops[0].position) return stops[0].color;
    for (let index = 1; index < stops.length; index += 1) {
      if (t <= stops[index].position) {
        const [a, b] = [stops[index - 1], stops[index]];
        const k = b.position === a.position ? 0 : (t - a.position) / (b.position - a.position);
        const channel = (hex, offset) => parseInt(hex.slice(offset, offset + 2) || "ff", 16);
        return [0, 2, 4, 6].map((offset) => Math.round(channel(a.color, offset) + (channel(b.color, offset) - channel(a.color, offset)) * k).toString(16).padStart(2, "0")).join("").replace(/ff$/, "");
      }
    }
    return stops[stops.length - 1].color;
  };
  const inside = gradient.stops.filter((stop) => stop.position > t0 && stop.position < t1);
  const stops = [{ color: colorAt(t0), position: 0 }, ...inside.map((stop) => ({ color: stop.color, position: Math.round(((stop.position - t0) / (t1 - t0)) * 10000) / 10000 })), { color: colorAt(t1), position: 1 }];
  if (stops.every((stop) => stop.color === stops[0].color)) return { color: stops[0].color };
  return { gradient: { angle: gradient.angle, stops } };
}

/**
 * **가상 요소 그림자를 숙주 그림자에 더한다(2026-10-12 오후).** 측정기가 싣는 `pseudoShadows`(내용 · 그림자가 있는 `::before` · `::after`) 가운데
 * 숙주를 그대로 덮는 것(`position: absolute` · 네 변 0)만 숙주의 그림자로 옮긴다 — 노드캔버스 포트 원판의 `inset 0 0 8px 흰색 · overlay` 가
 * Figma 이너 섀도(Overlay 블렌드) 한 겹이 된다. 섞기 모드는 그림자에 싣는다(`blend`). 덮지 않는 가상 요소는 옮기지 않는다(자리가 다르다).
 */
function withPseudoShadows(paint, node) {
  const covering = (node.pseudoShadows ?? []).filter((entry) => entry.position === "absolute"
    && (entry.inset ?? []).every((value) => px(value) === 0));
  const extra = covering.flatMap((entry) => (parseBoxShadow(entry.boxShadow) ?? [])
    .map((shadow) => ({ ...shadow, ...(entry.mixBlendMode && entry.mixBlendMode !== "normal" ? { blend: entry.mixBlendMode } : {}) })));
  if (extra.length === 0) return paint;
  return { ...(paint ?? { fill: null, gradient: null, stroke: null, radius: null, shadow: null, opacity: null }), shadow: [...(paint?.shadow ?? []), ...extra] };
}

function paintOf(style) {
  const fill = cssColorToHex(style.backgroundColor);
  // 그라디언트 면. 겹이 여럿이면 **맨 앞(가장 위에 그려지는) 그라디언트**를 쓴다.
  const layers = (style.backgroundImage && style.backgroundImage !== "none")
    ? splitTopLevel(style.backgroundImage) : [];
  const gradient = layers.map(parseLinearGradient).find(Boolean) ?? null;
  // 테두리 색은 지정이 없으면 `currentColor`로 떨어진다. **두께 > 0 이고 style ≠ none 인 변만**
  // 실제로 그려진다 — 이 둘로 거르지 않으면 안 그려지는 변의 색을 잘못 가져온다.
  const SIDES = ["Top", "Right", "Bottom", "Left"];
  const widths = SIDES.map((side) =>
    (style[`border${side}Style`] ?? "none") === "none" ? 0 : (px(style[`border${side}Width`]) ?? 0));
  const drawn = SIDES.findIndex((side, index) => widths[index] > 0);
  const strokeColor = drawn >= 0 ? cssColorToHex(style[`border${SIDES[drawn]}Color`]) : null;
  let stroke = strokeColor ? { color: strokeColor, widths } : null;
  const radii = ["borderTopLeftRadius", "borderTopRightRadius", "borderBottomRightRadius", "borderBottomLeftRadius"]
    .map((axis) => px(style[axis]) ?? 0);
  const radius = radii.some((value) => value > 0) ? radii : null;
  let shadow = parseBoxShadow(style.boxShadow);
  // 링 그림자 하나가 변마다 보태는 두께 — top · right · bottom · left.
  const ringSides = (rings) => {
    const sides = [0, 0, 0, 0];
    for (const ring of rings) {
      if (ring.spread > 0) for (let index = 0; index < 4; index += 1) sides[index] += ring.spread;
      if (ring.y > 0) sides[0] += ring.y;
      if (ring.x < 0) sides[1] += -ring.x;
      if (ring.y < 0) sides[2] += -ring.y;
      if (ring.x > 0) sides[3] += ring.x;
    }
    return sides;
  };
  // **테두리 안쪽의 같은 색 링은 테두리에 합친다(2026-09-29).** CSS 의 `inset` 링은 테두리 안쪽(패딩 상자 가장자리)부터 그려지는데
  // Figma 의 안쪽 그림자는 프레임 가장자리부터 그려져, 테두리가 있는 자리에 링을 그림자로 두면 두 겹이 한 자리에 겹친다 — 로그인
  // 입력칸의 포커스(테두리 1 + 링 1, 둘 다 검정 40%)가 제품 2px 이 보드에서 짙은 1px 이 됐다(제품 캡처와 나란히 놓아 찾았다). 링 색이
  // 테두리 색과 같으면 변마다 두께를 더한 하나의 안쪽 획으로 싣고, 더한 두께를 `ringWithin` 으로 남겨 패딩에서 뺀다 — 테두리는 자리를
  // 차지하고 링은 차지하지 않으므로, 합친 획이 레이아웃에 들면 그만큼 내용이 밀린다. 패딩이 링보다 얇은 변이 있으면 합치지 않는다.
  if (stroke && shadow) {
    const rings = shadow.filter((entry) => entry.inset && entry.blur === 0);
    const add = ringSides(rings);
    const paddings = ["paddingTop", "paddingRight", "paddingBottom", "paddingLeft"].map((axis) => px(style[axis]) ?? 0);
    if (rings.length > 0 && rings.every((ring) => ring.color === stroke.color)
      && add.some((width) => width > 0) && add.every((width, index) => width <= paddings[index] + 0.01)) {
      stroke = { ...stroke, widths: stroke.widths.map((width, index) => width + add[index]), ringWithin: add };
      shadow = shadow.filter((entry) => !rings.includes(entry));
      if (shadow.length === 0) shadow = null;
    }
  }
  // **헤어라인은 안쪽 획이다.** 흐림 0 인 안쪽 링 그림자(`0 0 0 Npx inset` · 한 변만 `Npx 0 0 0 inset`)는 CSS 가 테두리 대신
  // 쓰는 선이다 — 박스 크기를 바꾸지 않는 안쪽 선이라 Figma 의 INSIDE 획과 같은 것이고, 획이어야 변수(`color/stroke-hairline`
  // · `border-width/hairline`)에 묶이고 변마다 두께를 가질 수 있다. CSS 테두리가 이미 있으면 겹치므로 그림자로 둔다.
  // 링 색이 여럿이면 하나의 획으로 합칠 수 없으니 옮기지 않는다(지어내지 않는다).
  if (!stroke && shadow) {
    const rings = shadow.filter((entry) => entry.inset && entry.blur === 0);
    if (rings.length > 0 && rings.every((ring) => ring.color === rings[0].color)) {
      const sides = ringSides(rings); // top · right · bottom · left
      if (sides.some((width) => width > 0)) {
        // `inset: true` — 박스 크기에 들어가지 않는 선이다(CSS box-shadow). 렌더러가 레이아웃에서 뺀다(`strokesIncludedInLayout = false`).
        stroke = { color: rings[0].color, widths: sides, inset: true };
        shadow = shadow.filter((entry) => !rings.includes(entry));
        if (shadow.length === 0) shadow = null;
      }
    }
  }
  // **바깥 링(`0 0 0 Npx`, 안쪽 아님)은 바깥 획이다.** 선택 표시 링이 이 모양이다(쿠폰 요금제 카드의 파랑 1.5). Figma 는 그림자
  // 퍼짐을 내용을 자르지 않는 프레임에서 그리지 않아, 그림자로 두면 링이 보이지 않는다 — OUTSIDE 획은 같은 선이고 레이아웃에 들지 않는다.
  if (!stroke && shadow) {
    const outer = shadow.filter((entry) => !entry.inset && entry.blur === 0 && entry.x === 0 && entry.y === 0 && entry.spread > 0);
    if (outer.length === 1) {
      stroke = { color: outer[0].color, widths: [outer[0].spread, outer[0].spread, outer[0].spread, outer[0].spread], outside: true };
      shadow = shadow.filter((entry) => entry !== outer[0]);
      if (shadow.length === 0) shadow = null;
    }
  }
  const rawOpacity = Number(style.opacity);
  const opacity = Number.isFinite(rawOpacity) && rawOpacity < 1 ? rawOpacity : null;
  // **뒤 흐림(`backdrop-filter: blur(Npx)`, 2026-10-12 오후).** 반투명 면 뒤를 흐리는 패널(커맨드 팔레트 72% · blur 4)이 보드에서 흐림 없이 그려져
  // 뒤의 빈 상태 글자가 그대로 비쳤다. Figma 의 배경 흐림(BACKGROUND_BLUR)으로 옮긴다 — 반경은 렌더러가 정한다.
  const backdropMatch = /blur\(\s*([\d.]+)px\s*\)/.exec(style.backdropFilter ?? "");
  const backdropBlur = backdropMatch ? Number(backdropMatch[1]) : null;
  if (!fill && !gradient && !stroke && !radius && !shadow && opacity == null && !backdropBlur) return null;
  return { fill, gradient, stroke, radius, shadow, opacity, ...(backdropBlur ? { backdropBlur } : {}) };
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
    // **줄바꿈 없이 잘리는 글자(2026-09-30).** `white-space: nowrap` + `overflow: hidden`(Tailwind `truncate`)은 한 줄에서 잘린다 —
    // Figma 에는 줄바꿈 금지가 없어 좁은 칸에서 꺾였다(부스 운영의 모델 선택 값 「nano-banana-2」 47 폭이 세 줄). 렌더러가 한 줄 자르기
    // (`textTruncation = "ENDING"` · `maxLines = 1`)를 건다.
    ...(/^(nowrap|pre)$/.test(style.whiteSpace ?? "") && /hidden|clip/.test(`${style.overflow ?? ""} ${style.overflowX ?? ""}`) ? { truncate: true } : {}),
  };
}

/**
 * **줄 수를 자르는 글자 상자(`-webkit-line-clamp`)의 보이는 줄 수(2026-10-14, 조립 규칙 15조의 10).** Tailwind `line-clamp-N` 은
 * `overflow: hidden; display: -webkit-box; -webkit-box-orient: vertical; -webkit-line-clamp: N` 이고, 크로미움(151)은 그 `display` 를
 * 계산값 `flow-root` 로 낸다(실측: 같은 h3 에 line-clamp 를 걸면 `flow-root` · 150 × 48, 걸지 않으면 `block` · 150 × 96). 원장의 축에는
 * `-webkit-line-clamp` 가 없어 계산값 `display: flow-root` + `overflow: hidden` 인 글자 상자를 그것으로 읽고, 줄 수 N 은 측정 높이 / 줄 높이다
 * (안쪽 높이가 줄 높이의 정수배일 때만 — 아니면 null). 이 상자는 블록 폭(포함 블록 · stretch 된 칸 폭)이지 글자 폭이 아니다.
 */
function lineClampOf(style, rect, typography) {
  if (style.display !== "flow-root" || !/hidden|clip/.test(`${style.overflow ?? ""} ${style.overflowY ?? ""}`)) return null;
  if (/^(nowrap|pre)$/.test(style.whiteSpace ?? "")) return null;
  const lineHeight = typography?.lineHeight;
  if (!lineHeight || !rect?.height) return null;
  const inner = rect.height - (px(style.paddingTop) ?? 0) - (px(style.paddingBottom) ?? 0)
    - (px(style.borderTopWidth) ?? 0) - (px(style.borderBottomWidth) ?? 0);
  const lines = Math.round(inner / lineHeight);
  return lines >= 1 && Math.abs(inner - lines * lineHeight) <= 0.5 ? lines : null;
}

/**
 * **한 줄짜리 grid 의 행이 바깥 높이로 늘어났는가(2026-09-28).** 늘어났으면 브라우저가 푼 트랙 높이, 아니면 null.
 *
 * CSS grid 는 행 템플릿이 없으면 행이 auto 인데, 컨테이너가 내용보다 높으면(`min-height` · 부모가 늘인 칸) 남는 높이를
 * auto 행에 나눠 주고(`align-content: normal`), 자식은 `align-items` · `justify-items`(`place-items`)로 그 칸 안에 선다.
 * 렌더러는 행을 늘 HUG(내용 높이)로 깔아서, 늘어난 행 가운데 서던 인증 카드가 위로 붙고 로그인 브랜드 패널(1040)이 내용
 * 높이(약 420)로 접혔다(캡처로 확인). Figma 는 HUG 컨테이너에 FLEX 행을 허락하지 않으므로 늘어난 행은 FIXED 로 깐다.
 *
 * **늘어남은 자식 높이로 판정하지 않는다.** `align-items: stretch` 인 자식은 측정에서 이미 행 높이로 늘어나 있어 「행이 자식보다
 * 높은가」는 늘어난 행을 놓친다. 늘어남의 출처는 `min-height` 를 가진 컨테이너 하나이고, 그 늘어난 행의 칸에서 세로 FILL 로 늘어난
 * grid 만 이어받는다(로그인 오른쪽 판). 세로 FILL 만으로는 늘어났다고 보지 않는다 — 내용 높이인 부모 안의 FILL 은 행도 내용
 * 높이다(요금제 카드 격자 · 구독 정보 dl 이 그렇다). 트랙은 내용 상자 높이와 같아야 한다(한 줄이 그 높이를 다 받았다).
 */
function gridStretchedRow(node, style, sizing, rawChildren, inStretchedRow) {
  if (!/grid/.test(style.display ?? "")) return null;
  const columns = parseTracks(style.gridTemplateColumns)?.map(px);
  const rows = parseTracks(style.gridTemplateRows)?.map(px);
  if (!columns?.length || columns.some((value) => value == null) || rows?.length !== 1 || rows[0] == null) return null;
  const flow = rawChildren.filter((child) => isVisible(child) && !/^(absolute|fixed)$/.test(child.style?.position ?? ""));
  if (flow.length === 0 || flow.length > columns.length) return null;
  const contentHeight = node.rect.height - (px(style.paddingTop) ?? 0) - (px(style.paddingBottom) ?? 0)
    - (px(style.borderTopWidth) ?? 0) - (px(style.borderBottomWidth) ?? 0);
  // 선언 높이(FIXED)도 밖에서 온 높이다.
  const fromOutside = Boolean(sizing.minHeight) || sizing.layoutSizingVertical === "FIXED" || (inStretchedRow && sizing.layoutSizingVertical === "FILL");
  // **행이 컨테이너보다 낮은 한 줄 grid(2026-09-30).** `align-content: center` 류는 내용 높이의 행을 컨테이너 안에 세운다(측정기는 이 축을
  // 싣지 않는다 — 늘이기였다면 행이 컨테이너를 채웠다). 행을 컨테이너 높이로 깔고 칸 안 세로 자리는 측정 좌표로 가린다(gridCellAlign) —
  // 랜딩 크리에이터 밴드(최소 높이 800, 행 285)의 내용이 가운데가 아니라 위에 붙어 135 떴다.
  if (rows[0] < contentHeight - 1) return fromOutside ? Math.round(contentHeight * 100) / 100 : null;
  if (Math.abs(rows[0] - contentHeight) > 1) return null;
  return fromOutside ? Math.round(rows[0] * 100) / 100 : null;
}

/**
 * **grid 칸 안 정렬.** 좌표로 판정한다 — `justify-items` 는 측정 축에 없고, 칸과 자식의 rect 가 결과 그 자체다. 칸을 되짚을 수
 * 있는 두 모양만 본다 — 한 줄(자식 수 ≤ 열 수, 행 하나)과 한 열(열 하나, 줄 수 무관). 여러 줄 · 여러 열은 자동 배치를 되짚어야 해
 * 건드리지 않는다. 칸을 채운 축(여유 1px 이하)은 정렬이 뜻이 없어 싣지 않는다. 세로 정렬은 늘어난 한 줄에서만 싣는다 — 늘지 않은
 * 행에서 낮은 칸은 stretch 이고 렌더러의 행 맞춤(높은 칸 HUG · 낮은 칸 FILL)이 맡는다. 그 축에 margin 이 있는 자식과 명시 배치는
 * 좌표만으로 칸을 되짚을 수 없어 건드리지 않는다.
 *
 * **여유를 남긴 FILL 자식은 늘어나지 않은 것이다.** 판정기는 grid 칸의 block 자식을 FILL(stretch)로 보는데, 측정 폭이 칸보다 좁으면
 * `justify-items: center` 같은 것이 늘이기를 이긴 것이다 — FILL 로 두면 정렬이 먹지 않아 인증 화면 모바일 로고가 왼쪽에 붙었다
 * (캡처로 확인). 그 축을 HUG 로 돌리되, HUG 가 내용 크기로 풀리는 자리만 돌린다(자식이 모두 그 축 FILL 이 아닌 auto-layout 프레임 ·
 * 가로는 한 줄 글자). 폭 상한(`max-width`)에 닿아 좁은 FILL 은 그대로 두고 정렬만 싣는다(오른쪽 판의 카드 `min(100%, 400px)`).
 * HUG 로 풀리지 않는 가로 FILL(그 축 FILL 자식을 품은 프레임 · 감긴 글자)은 측정 폭 FIXED 로 세우고 정렬을 싣는다 — FILL 로 두면
 * 칸을 채워, 가입 확인 메일 · 만료 · 인증 완료의 제목 묶음(340, 칸 400)이 늘어나며 안내 문단이 30(모바일 11) 왼쪽에 섰다.
 *
 * @returns {null | {rows: number[] | null, aligned: number, children: object[]}}
 */
/**
 * **grid 칸 자리와 span(2026-09-30).** 칸을 여럿 차지하는 아이템(`grid-column: span 2` · `grid-row: span 2`)이나 열 방향 흐름은 자식 순서로
 * 칸을 채우는 Figma 의 기본 자리와 다르다 — 랜딩 새소식의 대표 카드(2×2)가 한 칸에 서고 나머지가 한 줄로 흘러 둘째 줄이 첫 줄로 올라왔다.
 * 계산된 열 · 행 트랙(px)과 간격으로 칸 경계를 세우고, 자식의 측정 margin 상자가 걸친 칸으로 [행, 열, 행 span, 열 span] 을 되짚는다.
 * 자식 순서대로 한 칸씩이면 싣지 않는다. 트랙이 px 로 풀리지 않거나 칸에 들지 않는 자식이 있으면 되짚지 않는다.
 * @returns {null | {rowCount: number, placements: Map<object, number[]>}}
 */
function gridPlacements(node, style, children) {
  const flow = children.filter((child) => child.positioning !== "ABSOLUTE");
  const columns = parseTracks(style.gridTemplateColumns)?.map(px);
  const rows = parseTracks(style.gridTemplateRows)?.map(px);
  if (!flow.length || !columns?.length || columns.some((value) => value == null) || !rows?.length || rows.some((value) => value == null)) return null;
  const lines = (sizes, origin, gap) => { const out = []; let at = origin; for (const size of sizes) { out.push([at, at + size]); at += size + gap; } return out; };
  const columnLines = lines(columns, node.rect.x + (px(style.paddingLeft) ?? 0) + (px(style.borderLeftWidth) ?? 0), px(style.columnGap ?? style.gap) ?? 0);
  const rowLines = lines(rows, node.rect.y + (px(style.paddingTop) ?? 0) + (px(style.borderTopWidth) ?? 0), px(style.rowGap ?? style.gap) ?? 0);
  // 칸 안에 정확히 드는 쪽을 먼저 고른다 — 여유(±2)만 보면 간격이 2 보다 좁은 grid(쿠폰 인쇄 격자 · 간격 1)에서 둘째 칸의 시작이 첫 칸
  // 끝의 여유 안에 들어 첫 칸으로 잡히고, 칸이 겹친다고 보아 되짚기를 통째로 버렸다(2026-10-07 — 묶음 띠 `col-span-4` 가 한 칸에 섰다).
  const cellOf = (spans, value) => {
    const exact = spans.findIndex(([start, end]) => value >= start && value <= end);
    return exact >= 0 ? exact : spans.findIndex(([start, end]) => value >= start - 2 && value <= end + 2);
  };
  const placements = [];
  for (const child of flow) {
    const margin = child.margin ?? {};
    const x0 = child.rect.x - Math.max(0, margin.left ?? 0), x1 = child.rect.x + child.rect.width + Math.max(0, margin.right ?? 0) - 0.01;
    const y0 = child.rect.y - Math.max(0, margin.top ?? 0), y1 = child.rect.y + child.rect.height + Math.max(0, margin.bottom ?? 0) - 0.01;
    const [c0, c1, r0, r1] = [cellOf(columnLines, x0), cellOf(columnLines, x1), cellOf(rowLines, y0), cellOf(rowLines, y1)];
    if (c0 < 0 || c1 < c0 || r0 < 0 || r1 < r0) return null;
    placements.push([r0, c0, r1 - r0 + 1, c1 - c0 + 1]);
  }
  const taken = new Set();
  for (const [r, c, rs, cs] of placements) for (let i = r; i < r + rs; i += 1) for (let j = c; j < c + cs; j += 1) {
    if (taken.has(`${i}:${j}`)) return null; // 겹치는 자리는 되짚지 않는다
    taken.add(`${i}:${j}`);
  }
  if (placements.every(([r, c, rs, cs], index) => rs === 1 && cs === 1 && r === Math.floor(index / columns.length) && c === index % columns.length)) return null;
  return { rowCount: rows.length, placements: new Map(flow.map((child, index) => [child, placements[index]])) };
}

/**
 * **선언된 고정 행(2026-09-30).** `grid-template-rows: repeat(2, 160px)` 처럼 px 트랙만 선언된 grid 는 행이 내용이 아니라 선언 크기다 —
 * 렌더러는 행을 내용 높이(HUG)로 까는데, 랜딩 새소식의 대표 카드(2×2)가 내용 높이만큼만 두 행을 차지해 둘째 줄 카드가 24(모바일 285)
 * 올라왔다. 계산된 행 크기(넘치는 암시 행 포함)를 FIXED 로 싣는다.
 * @returns {null | number[]}
 */
function declaredFixedRows(node, style) {
  const declared = String(node.declared?.["grid-template-rows"] ?? "").replace(/!important/g, "").trim();
  if (!declared || !/^(repeat\(\s*\d+\s*,\s*[\d.]+px\s*\)|[\d.]+px)(\s+(repeat\(\s*\d+\s*,\s*[\d.]+px\s*\)|[\d.]+px))*$/.test(declared)) return null;
  const rows = parseTracks(style.gridTemplateRows)?.map(px);
  if (!rows?.length || rows.some((value) => value == null)) return null;
  return rows.map((value) => Math.round(value * 100) / 100);
}

/**
 * **내용이 정하지 않은 행(2026-10-08).** `grid-auto-rows: 160px` 은 측정기의 선언 축(declared-styles)에 없어 `declaredFixedRows` 가 보지
 * 못한다 — 랜딩 새소식 격자(제품이 `grid-template-rows` 선언을 `[grid-auto-rows:160px]` 로 바꿨다)의 행이 내용 높이(HUG)로 깔려 작은 카드가
 * 160 → 119, 대표 카드(2×2)가 326 → 40 으로 접혀 홈 모바일 보드가 344 짧았다. 계산된 행 트랙(px)은 선언이든 내용이든 같은 꼴이라 결과로
 * 가린다 — 내용 높이 행이면 그 행을 차지한 아이템 하나는 제 내용 높이가 칸 높이와 같다(행 크기 = 내용 기여의 최댓값). 바깥이 늘인 grid(최소
 * 높이 · 고정 높이 · FILL)는 행이 늘어난 것이라 보지 않는다(gridStretchedRow 의 몫). 흐름 아이템이 모두 세로로 늘어났고(FILL) 그 누구의 내용
 * 높이(흐름 자식의 측정 범위 + 패딩)도 제 칸 높이에 1 넘게 못 미치면, 행은 선언 크기다 — 계산된 행 크기를 FIXED 로 싣는다. 글자 · 고정 크기 ·
 * 자식 없는 아이템이 하나라도 있으면 내용 높이를 가늠할 수 없어 보지 않는다.
 * @returns {null | number[]}
 */
function contentFreeRows(style, sizing, children) {
  if (sizing.layoutSizingVertical !== "HUG" || sizing.minHeight || sizing.maxHeight) return null;
  const rows = parseTracks(style.gridTemplateRows)?.map(px);
  if (!rows?.length || rows.some((value) => value == null)) return null;
  const flow = children.filter((child) => child.positioning !== "ABSOLUTE");
  if (flow.length === 0) return null;
  for (const item of flow) {
    if (item.sizing?.layoutSizingVertical !== "FILL" || item.text || !item.layout || item.sizing.minHeight) return null;
    const inner = (item.children ?? []).filter((child) => child.positioning !== "ABSOLUTE");
    if (inner.length === 0) return null;
    const top = Math.min(...inner.map((child) => child.rect.y - Math.max(0, child.margin?.top ?? 0)));
    const bottom = Math.max(...inner.map((child) => child.rect.y + child.rect.height + Math.max(0, child.margin?.bottom ?? 0)));
    // 위쪽 자리(패딩 + 테두리)는 측정 자리로 재고, 패딩으로 설명되지 않는 위 테두리는 아래에도 있다고 본다 — 테두리 1 짜리 카드가 위아래 2 를
    // 못 세어 내용 높이 행인데도 걸렸다(공개 템플릿 시드 카드).
    const lead = top - item.rect.y;
    const content = lead + (bottom - top) + (item.layout.padding?.bottom ?? 0) + Math.max(0, lead - (item.layout.padding?.top ?? 0));
    if (content >= item.rect.height - 1) return null;
  }
  return rows.map((value) => Math.round(value * 100) / 100);
}

function gridCellAlign(node, style, stretchedRow, children, declaredOf) {
  const flow = children.filter((child) => child.positioning !== "ABSOLUTE");
  const columns = parseTracks(style.gridTemplateColumns)?.map(px);
  const rows = parseTracks(style.gridTemplateRows)?.map(px);
  if (flow.length === 0 || !columns?.length || columns.some((value) => value == null)) return null;
  const singleRow = flow.length <= columns.length && rows?.length === 1 && rows[0] != null;
  const singleColumn = columns.length === 1;
  if (!singleRow && !singleColumn) return null;
  const placed = (child) => {
    const declared = declaredOf(child);
    return Boolean(declared["grid-column"] || declared["grid-row"] || declared["grid-area"]);
  };
  if (flow.some(placed)) return null;
  const left = node.rect.x + (px(style.paddingLeft) ?? 0) + (px(style.borderLeftWidth) ?? 0);
  const top = node.rect.y + (px(style.paddingTop) ?? 0) + (px(style.borderTopWidth) ?? 0);
  const gap = px(style.columnGap ?? style.gap) ?? 0;
  const stretched = singleRow && stretchedRow != null;
  // 한 축의 자리 — 칸을 채웠으면(여유 1px 이하) null, 가운데 · 시작 · 끝이면 그 값, 셋 다 아니면 null(설명 못 한 여유).
  const place = (start, size, cellStart, cellSize) => {
    if (cellSize - size <= 1) return null;
    const before = start - cellStart;
    const after = cellStart + cellSize - (start + size);
    if (Math.abs(before - after) <= 1) return "CENTER";
    if (before <= 1) return "MIN";
    if (after <= 1) return "MAX";
    return null;
  };
  // 그 축을 HUG 로 돌려도 내용 크기로 풀리는가.
  const hugsTo = (child, axis) => {
    // 글자는 세로면 늘 HUG 로 풀리고, 가로는 한 줄일 때만 — 감긴 글자를 HUG 로 두면 Figma 가 한 줄로 편다. 줄 rect 가 없는
    // 측정(인증 · 로그아웃 원장)은 높이를 행간으로 나눠 센다.
    if (child.text) {
      const lineHeight = child.typography?.lineHeight;
      const lines = child.textLines?.length ?? (lineHeight ? Math.round(child.rect.height / lineHeight) : 1);
      return axis === "vertical" || lines <= 1;
    }
    if (!child.layout) return false;
    const key = axis === "horizontal" ? "layoutSizingHorizontal" : "layoutSizingVertical";
    return (child.children ?? []).every((kid) => kid.positioning === "ABSOLUTE" || kid.sizing?.[key] !== "FILL");
  };
  let aligned = 0;
  let cellLeft = left;
  const fixes = new Map();
  flow.forEach((child, index) => {
    const column = singleColumn ? 0 : index;
    const cellStart = singleColumn ? left : cellLeft;
    if (!singleColumn) cellLeft += columns[index] + gap;
    const margin = child.margin ?? {};
    let horizontal = margin.left || margin.right ? null : place(child.rect.x, child.rect.width, cellStart, columns[column]);
    let vertical = !stretched || margin.top || margin.bottom ? null : place(child.rect.y, child.rect.height, top, stretchedRow);
    const sizing = { ...child.sizing };
    if (horizontal && sizing.layoutSizingHorizontal === "FILL") {
      const capped = sizing.maxWidth && Math.abs(child.rect.width - sizing.maxWidth) <= 1;
      if (!capped) {
        if (hugsTo(child, "horizontal")) {
          sizing.layoutSizingHorizontal = "HUG";
          // 글자는 세로도 HUG 여야 렌더러가 폭을 자동(WIDTH_AND_HEIGHT)으로 둔다 — 세로 FILL 이 남으면 폭 고정(HEIGHT)이 되어
          // 새 글자 상자의 좁은 기본 폭에서 줄이 꺾였다(「Check / your / email」, 캡처로 확인).
          if (child.text) sizing.layoutSizingVertical = "HUG";
        } else sizing.layoutSizingHorizontal = "FIXED";
      }
    }
    if (vertical && sizing.layoutSizingVertical === "FILL") {
      if (hugsTo(child, "vertical")) sizing.layoutSizingVertical = "HUG";
      else vertical = null;
    }
    if (horizontal || vertical) {
      fixes.set(child, { gridAlign: { horizontal, vertical }, sizing });
      aligned += 1;
    }
  });
  if (!stretched && aligned === 0) return null;
  return {
    rows: stretched ? [stretchedRow] : null,
    aligned,
    children: children.map((child) => {
      const fix = fixes.get(child);
      return fix ? { ...child, gridAlign: fix.gridAlign, sizing: fix.sizing } : child;
    }),
  };
}

/** grid 컨테이너의 열 개수 — 선언을 먼저 보고, 없으면 computed의 px 트랙을 센다. */
function gridColumns(node, style) {
  // `repeat(auto-fill | auto-fit, …)` 은 선언에서 열 수를 셀 수 없다(반복 수가 뷰포트에서 정해진다) — 그 뷰포트에서 풀린
  // 트랙(computed)을 센다. 선언을 그대로 펼치면 한 열로 읽혀 bulk 성공 미리보기의 쿠폰 코드 격자(데스크톱 셋 열)가 한 줄로 섰다.
  // `!important` 는 트랙이 아니다(2026-09-30) — 공개 페이지 모바일 머리글 `1fr auto !important` 가 세 열로 세어졌다.
  // 반복 수가 변수인 선언(`repeat(var(--comparison-cols, 4), minmax(0, 1fr))`)도 셀 수 없다 — 한 열로 읽혀 요금제 비교표(모바일 다섯 열)가
  // 한 줄에 하나씩 쌓여 보드가 6450 → 12539 로 늘었다(2026-09-30, 라이브 탐침). 역시 풀린 트랙을 센다.
  const raw = node.declared?.["grid-template-columns"]?.replace(/!important/g, "").trim();
  const declared = /repeat\(\s*(?:auto-(?:fill|fit)\b|var\()/i.test(raw ?? "") ? null : parseTracks(raw);
  if (declared?.length) return declared.length;
  const computed = parseTracks(style.gridTemplateColumns);
  if (computed?.length && computed[0] !== "none") return computed.length;
  return null;
}

/**
 * **grid 열의 크기(2026-09-30).** 열 수만 싣자 Figma 가 모든 열을 같은 FLEX 로 깔아, 크기가 다른 열이 똑같이 나뉘었다 — 공개 페이지 머리글
 * (`1fr auto 1fr`)의 가운데 메뉴가 셋으로 나눈 가운데 칸 왼쪽에 붙어 135 왼쪽에 섰고, 문의 두 칸(`minmax(0, 0.8fr) minmax(0, 1.2fr)`)은 왼쪽
 * 글이 534 → 280 으로 좁아져 줄이 늘었다(보드 글자 자리 대조로 찾았다). 선언된 열을 트랙 크기로 옮긴다 — `Nfr` → FLEX N, `Npx` → FIXED,
 * `auto` · `max-content` · `min-content` · `fit-content()` → HUG, `minmax(a, b)` 는 b 를 따른다. 모든 열이 같은 FLEX 면 싣지 않는다(지금처럼
 * 균등 열). 내용 폭(HUG) grid 에는 FLEX 열이 설 수 없어(Figma) 브라우저가 푼 폭(FIXED)으로 둔다. 읽지 못하는 선언(`var()` · auto-fill)은 싣지 않는다.
 * 돌려주는 꼴은 `[["F", 비율] | ["X", px] | ["H"]]` 이다.
 */
function gridColumnTracks(node, style, sizing) {
  const raw = String(node.declared?.["grid-template-columns"] ?? "").replace(/!important/g, "").trim();
  // **내용 최소 폭이 밀어낸 암시 열(2026-09-30).** 열 선언이 없는 grid 의 암시 열은 내용의 최소 폭까지 자란다 — 개인정보 모바일은 본문 표가
  // 열을 483.6 으로 밀어 컨테이너(370)를 넘치는데(제품 페이지가 가로로 넘친다), 보드는 칸을 370 으로 채워 문단 줄이 두 배가 되고 보드가
  // 1342 길었다. 계산된 트랙 합이 콘텐츠 폭을 넘으면 계산된 px 트랙(FIXED)으로 싣는다.
  if (!raw || raw === "none") {
    const computed = parseTracks(style.gridTemplateColumns)?.map((token) => px(token));
    const room = node.rect.width - (px(style.paddingLeft) ?? 0) - (px(style.paddingRight) ?? 0)
      - (px(style.borderLeftWidth) ?? 0) - (px(style.borderRightWidth) ?? 0);
    const gap = px(style.columnGap ?? style.gap) ?? 0;
    if (computed?.length && computed.every((value) => value != null)
      && computed.reduce((sum, value) => sum + value, 0) + gap * (computed.length - 1) > room + 1) {
      return computed.map((value) => ["X", Math.round(value * 100) / 100]);
    }
  }
  if (!raw || raw === "none" || /repeat\(\s*auto-(?:fill|fit)\b/i.test(raw)) return null;
  const tokens = parseTracks(raw);
  if (!tokens?.length) return null;
  // **변수로 정한 열(2026-10-07).** 편집기 타임라인(`var(--vem-rail-width) minmax(0, var(--sequence-time-axis-width))`)과 편집기 본문
  // (`var(--video-edit-assets-width, 317px) 4px minmax(0, 1fr) …`)을 버리면 Figma 가 열을 균등하게 깔아 타임라인 클립 · 눈금 · 재생 헤드가
  // 오른쪽 절반(944)으로 밀렸다(제품 캡처 대조). 선언과 계산값의 열 수가 같고 `repeat()` 가 없으면, 변수가 든 열만 계산된 px 로 싣고
  // `fr` 열은 그대로 둔다. 수가 다르면(요금 비교표의 `repeat(var(--comparison-cols,4), …)`) 전처럼 싣지 않는다.
  let computedForVar = null;
  if (/var\(/.test(raw)) {
    const computed = parseTracks(style.gridTemplateColumns)?.map((token) => px(token));
    if (/repeat\(/i.test(raw) || !computed || computed.length !== tokens.length || computed.some((value) => value == null)) return null;
    computedForVar = computed;
  }
  const trackOf = (token) => {
    const text = token.trim();
    const fr = /^([\d.]+)fr$/.exec(text);
    if (fr) return ["F", Number(fr[1])];
    const fixed = /^([\d.]+)px$/.exec(text);
    if (fixed) return ["X", Number(fixed[1])];
    if (/^(auto|max-content|min-content)$/.test(text) || /^fit-content\(/.test(text)) return ["H"];
    const minmax = /^minmax\(\s*([^,]+),\s*(.+)\)$/.exec(text);
    return minmax ? trackOf(minmax[2]) : null;
  };
  const tracks = tokens.map((token, index) => (computedForVar && /var\(/.test(token)
    ? ["X", Math.round(computedForVar[index] * 100) / 100] : trackOf(token)));
  if (tracks.some((track) => track == null)) return null;
  if (tracks.every((track) => track[0] === "F" && track[1] === tracks[0][1])) return null;
  if (sizing?.layoutSizingHorizontal === "HUG" && tracks.some((track) => track[0] === "F")) {
    const computed = parseTracks(style.gridTemplateColumns)?.map((token) => px(token));
    if (!computed || computed.length !== tracks.length || computed.some((value) => value == null)) return null;
    return tracks.map((track, index) => (track[0] === "F" ? ["X", Math.round(computed[index] * 100) / 100] : track));
  }
  return tracks;
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
