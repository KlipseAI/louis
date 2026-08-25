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

import { decideNode, toFigmaSizing, toLayoutMode, px } from "./sizing-provenance.mjs";

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

    const children = (childrenOf.get(node.path) ?? [])
      .map((child) => convert(child, node))
      .filter(Boolean);

    // 자식도 없고 스스로 그릴 것도 없으면 버린다 — Auto Layout에 빈 껍데기를 남기지 않는다.
    if (children.length === 0 && !hasOwnPaint(node)) { stats.droppedEmpty += 1; return null; }

    const style = node.style ?? {};
    const layoutMode = toLayoutMode(style);
    stats.kept += 1;
    return {
      path: node.path,
      tag: node.tag,
      name: node.classAttr ? `${node.tag}.${node.path}` : node.path,
      text: node.ownText || null,
      textLines: node.ownTextLines?.length ? node.ownTextLines : null,
      // rect는 FIXED 축 크기와 검증용이다. FILL/HUG 축은 Figma가 계산한다.
      rect: node.rect,
      sizing,
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
        itemSpacing: px(style.columnGap ?? style.gap) ?? 0,
        counterAxisSpacing: px(style.rowGap) ?? null,
        wrap: style.flexWrap === "wrap",
        padding: {
          top: px(style.paddingTop) ?? 0,
          right: px(style.paddingRight) ?? 0,
          bottom: px(style.paddingBottom) ?? 0,
          left: px(style.paddingLeft) ?? 0,
        },
        align: {
          counterAxis: cssAlignToFigma(style.alignItems),
          primaryAxis: cssJustifyToFigma(style.justifyContent),
        },
      },
      clipsContent: style.overflow === "hidden" || style.overflowX === "hidden",
      children,
    };
  };

  const root = byPath.get(rootPath);
  if (!root) throw new Error(`[figma-tree-spec] 루트 경로를 찾지 못했습니다: ${rootPath}`);
  return { spec: convert(root, null), stats };
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
