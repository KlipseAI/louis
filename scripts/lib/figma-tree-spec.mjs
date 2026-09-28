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
    const first = children[0].rect[axis] - node.rect[axis];
    at = first <= padStart + 0.5 ? children.length : 0;
    const span = children.reduce((sum, child) => sum + child.rect[extent], 0);
    rect = vertical
      ? { x: node.rect.x, y: node.rect.y, width: node.rect.width, height: Math.max(0, node.rect.height - span) }
      : { x: node.rect.x, y: node.rect.y, width: Math.max(0, node.rect.width - span), height: node.rect.height };
  }

  const textChild = {
    path: `${node.path}.t`,
    tag: "span",
    name: `${node.path}.t`,
    text: node.ownText,
    textLines: lines.length > 0 ? lines : null,
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

export function toFigmaTreeSpec(tree, options = {}) {
  const rootPath = options.rootPath ?? "main";
  const contextId = options.contextId ?? null;
  const { byPath, childrenOf } = buildHierarchy(tree, rootPath);
  const stats = { total: tree.length, kept: 0, droppedInvisible: 0, droppedEmpty: 0, textSplits: 0, unresolved: [], verticalWrap: [], lineBoxSlack: [], gridRows: [] };

  // `inStretchedRow` — 이 노드가 늘어난 한 줄 grid 행의 칸이다(gridStretchedRow 주석). 늘어남은 위에서 아래로만 이어진다.
  const convert = (node, parent, inStretchedRow = false) => {
    if (!isVisible(node)) { stats.droppedInvisible += 1; return null; }

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
    for (const reason of sizing.unresolved) {
      stats.unresolved.push({ path: node.path, tag: node.tag, reason });
    }

    const rawChildren = childrenOf.get(node.path) ?? [];
    // 한 줄 grid 의 행이 바깥 높이로 늘어났는가 — 칸 안의 grid 에 알려야 하므로 자식보다 먼저 판정한다.
    const stretchedRow = gridStretchedRow(node, node.style ?? {}, sizing, rawChildren, inStretchedRow);
    let children = rawChildren.map((child) => convert(child, node, stretchedRow != null)).filter(Boolean);
    // 글자와 요소 자식을 함께 가진 노드는 글자를 자식으로 떼어낸다(splitOwnText 주석 참조).
    const split = splitOwnText(node, children);
    if (split) { children = split; stats.textSplits += 1; }

    // 자식도 없고 스스로 그릴 것도 없으면 버린다 — Auto Layout에 빈 껍데기를 남기지 않는다.
    if (children.length === 0 && !hasOwnPaint(node)) { stats.droppedEmpty += 1; return null; }

    const style = node.style ?? {};
    // 흐름 방향은 자식의 display가 결정한다(inline 형제는 가로로 흐른다).
    const layoutMode = toLayoutMode(style, rawChildren.map((child) => child.style ?? {}));
    if (style.flexWrap === "wrap" && layoutMode !== "HORIZONTAL" && layoutMode !== "NONE") {
      stats.verticalWrap.push({ path: node.path, layoutMode });
    }
    // 한 줄짜리 grid 의 늘어난 행과 칸 안 정렬(gridSingleRow 주석).
    const gridRow = layoutMode === "GRID"
      ? gridSingleRow(node, style, stretchedRow, children, (child) => byPath.get(child.path)?.declared ?? {})
      : null;
    if (gridRow) {
      children = gridRow.children;
      stats.gridRows.push({ path: node.path, rows: gridRow.rows, aligned: gridRow.aligned });
    }
    stats.kept += 1;
    const slack = layoutMode === "HORIZONTAL" ? lineBoxSlack(node, style, children, rawChildren) : null;
    const clearBorder = clearBorderPadding(style);
    if (slack) stats.lineBoxSlack.push({ path: node.path, ...slack });
    return {
      path: node.path,
      tag: node.tag,
      name: node.classAttr ? `${node.tag}.${node.path}` : node.path,
      // 글자를 자식으로 떼어냈으면 이 노드는 더 이상 글자를 갖지 않는다(중복 렌더 방지).
      text: split ? null : (node.ownText || null),
      textLines: split ? null : (node.ownTextLines?.length ? node.ownTextLines : null),
      // 스스로 그리는 것이 있는가(면·테두리·그림자·이미지). 래퍼 접기 판정과 색 이관에 쓴다.
      paints: hasOwnPaint(node),
      // rect는 FIXED 축 크기와 검증용이다. FILL/HUG 축은 Figma가 계산한다.
      rect: node.rect,
      // **아이콘의 정체.** `<svg>` 일 때만. 자손 도형은 바로 아래에서 버려지므로, 버리기 전에
      // 서명을 떠서 붙인다. 이것이 없으면 아이콘은 크기만 남은 빈 상자가 된다.
      glyph: glyphSignature(node, childrenOf),
      // **이미지의 정체.** `<img>` 의 src — 생성기가 LOUIS 자산 컴포넌트와 잇는 열쇠다(IMAGE_COMPONENTS).
      ...(node.tag === "img" && node.src ? { src: node.src } : {}),
      sizing,
      // **색·테두리·radius·그림자·불투명도.** 측정에 없는 값은 담지 않는다.
      paint: paintOf(style),
      // **타이포.** 텍스트를 직접 가진 노드만. LOUIS 텍스트 스타일 이름으로 바꿔 싣는다.
      typography: (!split && (node.ownText || node.ownTextLines?.length)) ? typographyOf(style) : null,
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
        // **wrap 은 가로 배치에만 싣는다.** Figma 의 `layoutWrap = "WRAP"` 은 HORIZONTAL 자동 배치에만
        // 걸리고, 세로 프레임에 걸면 플러그인 API 가 던져 보드 러너가 그 자리에서 멈춘다. 실측
        // (2026-09-14): `/subscription` 모바일 크레딧 카드의 promo 줄 `body.1.0.0.1.0.1.1.0.1.1.0.4` 가
        // `flex-direction: column; flex-wrap: wrap` 이라 VERTICAL + wrap 1 로 실려 있었다. 세로 flex 는
        // 높이가 정해져야 감기는데 그 줄은 높이 선언이 없고 자식이 하나라, 제품에서도 감기지 않는다 —
        // NO_WRAP 이 같은 그림이다. 표현하지 못한 자리는 `stats.verticalWrap` 에 남긴다.
        wrap: layoutMode === "HORIZONTAL" && style.flexWrap === "wrap",
        padding: {
          top: (px(style.paddingTop) ?? 0) + (slack?.top ?? 0) + clearBorder.top,
          right: (px(style.paddingRight) ?? 0) + clearBorder.right,
          bottom: (px(style.paddingBottom) ?? 0) + (slack?.bottom ?? 0) + clearBorder.bottom,
          left: (px(style.paddingLeft) ?? 0) + clearBorder.left,
        },
        // **GRID는 열 개수를 함께 줘야 한다.** Figma는 `gridColumnCount`가 없으면 기본 2열로 깔아
        // 4열 카드가 2열로 접힌다. 열 수는 선언된 `grid-template-columns`를 펼쳐 센다(computed는
        // 이미 px로 풀려 `repeat()`을 복원할 수 없지만 트랙 개수는 그대로 살아 있다).
        columns: layoutMode === "GRID" ? gridColumns(node, style) : null,
        // 한 줄짜리 grid 에서 내용보다 높게 늘어난 행 — 브라우저가 푼 트랙 높이(FIXED 로 깐다). 없으면 null.
        rows: gridRow?.rows ?? null,
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
  // **헤어라인은 안쪽 획이다.** 흐림 0 인 안쪽 링 그림자(`0 0 0 Npx inset` · 한 변만 `Npx 0 0 0 inset`)는 CSS 가 테두리 대신
  // 쓰는 선이다 — 박스 크기를 바꾸지 않는 안쪽 선이라 Figma 의 INSIDE 획과 같은 것이고, 획이어야 변수(`color/stroke-hairline`
  // · `border-width/hairline`)에 묶이고 변마다 두께를 가질 수 있다. CSS 테두리가 이미 있으면 겹치므로 그림자로 둔다.
  // 링 색이 여럿이면 하나의 획으로 합칠 수 없으니 옮기지 않는다(지어내지 않는다).
  if (!stroke && shadow) {
    const rings = shadow.filter((entry) => entry.inset && entry.blur === 0);
    if (rings.length > 0 && rings.every((ring) => ring.color === rings[0].color)) {
      const sides = [0, 0, 0, 0]; // top · right · bottom · left
      for (const ring of rings) {
        if (ring.spread > 0) for (let index = 0; index < 4; index += 1) sides[index] += ring.spread;
        if (ring.y > 0) sides[0] += ring.y;
        if (ring.x < 0) sides[1] += -ring.x;
        if (ring.y < 0) sides[2] += -ring.y;
        if (ring.x > 0) sides[3] += ring.x;
      }
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
  if (!fill && !gradient && !stroke && !radius && !shadow && opacity == null) return null;
  return { fill, gradient, stroke, radius, shadow, opacity };
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
  if (Math.abs(rows[0] - contentHeight) > 1) return null;
  const fromOutside = Boolean(sizing.minHeight) || (inStretchedRow && sizing.layoutSizingVertical === "FILL");
  return fromOutside ? Math.round(rows[0] * 100) / 100 : null;
}

/**
 * **한 줄짜리 grid 의 칸 안 정렬.** 좌표로 판정한다 — `justify-items` 는 측정 축에 없고, 칸과 자식의 rect 가 결과 그 자체다.
 * 칸을 채운 축(여유 1px 이하)은 정렬이 뜻이 없어 싣지 않는다. 세로 정렬은 행이 늘어났을 때만 싣는다 — 늘지 않은 행에서 낮은
 * 칸은 stretch 이고 렌더러의 행 맞춤(높은 칸 HUG · 낮은 칸 FILL)이 맡는다. 여러 줄 grid · 명시 배치 · margin 있는 자식은
 * 좌표만으로 칸을 되짚을 수 없어 건드리지 않는다.
 *
 * @returns {null | {rows: number[] | null, aligned: number, children: object[]}}
 */
function gridSingleRow(node, style, stretchedRow, children, declaredOf) {
  const flow = children.filter((child) => child.positioning !== "ABSOLUTE");
  const columns = parseTracks(style.gridTemplateColumns)?.map(px);
  const rows = parseTracks(style.gridTemplateRows)?.map(px);
  if (flow.length === 0 || !columns?.length || columns.some((value) => value == null)) return null;
  if (flow.length > columns.length || rows?.length !== 1 || rows[0] == null) return null;
  const placed = (child) => {
    const declared = declaredOf(child);
    return Boolean(declared["grid-column"] || declared["grid-row"] || declared["grid-area"]);
  };
  const margined = (child) => child.margin && (child.margin.top || child.margin.right || child.margin.bottom || child.margin.left);
  if (flow.some((child) => placed(child) || margined(child))) return null;
  const left = node.rect.x + (px(style.paddingLeft) ?? 0) + (px(style.borderLeftWidth) ?? 0);
  const top = node.rect.y + (px(style.paddingTop) ?? 0) + (px(style.borderTopWidth) ?? 0);
  const gap = px(style.columnGap ?? style.gap) ?? 0;
  const stretched = stretchedRow != null;
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
  let aligned = 0;
  let cellLeft = left;
  const byChild = new Map();
  flow.forEach((child, index) => {
    const horizontal = place(child.rect.x, child.rect.width, cellLeft, columns[index]);
    const vertical = stretched ? place(child.rect.y, child.rect.height, top, rows[0]) : null;
    cellLeft += columns[index] + gap;
    if (horizontal || vertical) {
      byChild.set(child, { horizontal, vertical });
      aligned += 1;
    }
  });
  if (!stretched && aligned === 0) return null;
  return {
    rows: stretched ? [stretchedRow] : null,
    aligned,
    children: children.map((child) => {
      const gridAlign = byChild.get(child);
      if (!gridAlign) return child;
      // 늘어난 행 안에서 여유를 남긴 자식은 늘어나지 않았다 — 세로 FILL 이면 정렬이 먹지 않으므로 HUG 로 둔다.
      const hugs = gridAlign.vertical && child.sizing.layoutSizingVertical === "FILL" && (child.layout || child.text);
      return {
        ...child,
        gridAlign,
        ...(hugs ? { sizing: { ...child.sizing, layoutSizingVertical: "HUG" } } : {}),
      };
    }),
  };
}

/** grid 컨테이너의 열 개수 — 선언을 먼저 보고, 없으면 computed의 px 트랙을 센다. */
function gridColumns(node, style) {
  // `repeat(auto-fill | auto-fit, …)` 은 선언에서 열 수를 셀 수 없다(반복 수가 뷰포트에서 정해진다) — 그 뷰포트에서 풀린
  // 트랙(computed)을 센다. 선언을 그대로 펼치면 한 열로 읽혀 bulk 성공 미리보기의 쿠폰 코드 격자(데스크톱 셋 열)가 한 줄로 섰다.
  const raw = node.declared?.["grid-template-columns"];
  const declared = /repeat\(\s*auto-(?:fill|fit)\b/i.test(raw ?? "") ? null : parseTracks(raw);
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
