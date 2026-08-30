// **Figma Auto Layout 조립 공용 템플릿.** 측정 픽셀을 박는 대신 크기 출처 판정(FILL/HUG/FIXED/ABSOLUTE)을
// 실제 Auto Layout 속성으로 세운다. 이 파일은 Figma 플러그인 샌드박스 **안에서** 실행된다(생성기가
// `PLAN` 상수와 함께 draw.js로 합쳐 넣는다).
//
// ## 왜 이 파일이 필요한가
//
// 기존 렌더러(`figma-product-pricing-renderer.js`)는 모든 노드를 `layoutMode:"NONE"` 프레임으로 만들고
// `resize(rect.width, rect.height)`로 측정 픽셀을 박았다 — auto-layout 사용 0회. 그래서 Figma에서 프레임을
// 리사이즈하면 제품처럼 반응하지 않는다. 이 템플릿이 그 전환의 핵심이다.
//
// ## 실측으로 확정한 API 순서 제약 (추측 아님, 라이브 probe 결과)
//
// | 시도 | 결과 |
// |---|---|
// | 부모 없이 `layoutSizingHorizontal="FILL"` | **거부** — "must be an auto-layout frame or a child of one" |
// | auto-layout 부모에 붙인 뒤 FILL | 성공 |
// | **FILL로 세운 뒤 `resize()` 호출** | **FILL → FIXED 로 덮임** |
// | 일반 프레임 자식에 `HUG` | **거부** — "HUG can only be set on auto-layout frames" |
// | auto-layout 프레임 자신에 HUG | 성공 |
// | FILL + `maxWidth` 공존 | 성공 (max=320이 실폭 250을 제한) |
// | `layoutMode="GRID"` + `gridColumnCount` | 성공 |
// | `layoutPositioning="ABSOLUTE"` + `constraints` | 성공 |
//
// **따라서 불변 순서는: ① 부모에 append → ② layoutMode 설정 → ③ resize(고정축) → ④ layoutSizing 설정.**
// resize를 sizing보다 **먼저** 해야 한다. 반대로 하면 FILL이 조용히 FIXED로 바뀐다.

/**
 * 노드를 auto-layout 부모에 붙이고 크기 출처대로 세운다.
 *
 * @param {SceneNode} node
 * @param {BaseNode & ChildrenMixin} parent
 * @param {object} sizing `toFigmaSizing()` 결과
 *   `{layoutSizingHorizontal, layoutSizingVertical, layoutPositioning, minWidth, maxWidth, minHeight, maxHeight}`
 * @param {{width?: number, height?: number}} [fallbackSize] FIXED 축에 쓸 측정 크기
 */
function applySizing(node, parent, sizing, fallbackSize = {}) {
  // ① 반드시 먼저 붙인다. 안 붙이면 FILL/HUG가 거부된다.
  if (parent && node.parent !== parent) parent.appendChild(node);

  const parentIsAutoLayout = parent && "layoutMode" in parent && parent.layoutMode && parent.layoutMode !== "NONE";

  // ② 절대 배치는 auto-layout 부모 안에서만 유효하다.
  if (sizing.layoutPositioning === "ABSOLUTE" && parentIsAutoLayout) {
    node.layoutPositioning = "ABSOLUTE";
  }

  // ③ FIXED 축은 resize로 크기를 준다. **sizing 설정보다 반드시 먼저.**
  const needsWidth = sizing.layoutSizingHorizontal === "FIXED" && typeof fallbackSize.width === "number";
  const needsHeight = sizing.layoutSizingVertical === "FIXED" && typeof fallbackSize.height === "number";
  if (needsWidth || needsHeight) {
    const width = needsWidth ? Math.max(0.01, fallbackSize.width) : node.width;
    const height = needsHeight ? Math.max(0.01, fallbackSize.height) : node.height;
    node.resize(width, height);
  }

  // ④ 이제 sizing을 건다. HUG는 자기 자신이 auto-layout일 때만 유효하다.
  const selfIsAutoLayout = "layoutMode" in node && node.layoutMode && node.layoutMode !== "NONE";
  const set = (axis, verdict) => {
    if (verdict === "FIXED") return;
    if (verdict === "HUG" && !selfIsAutoLayout) return; // 텍스트가 아니면 HUG 불가 → FIXED로 남긴다
    if (verdict === "FILL" && !parentIsAutoLayout) return;
    if (node.layoutPositioning === "ABSOLUTE") return; // 절대 배치는 sizing 축이 없다
    try { node[axis] = verdict; } catch (error) { /* 구조상 불가하면 측정 크기로 남긴다 */ }
  };
  set("layoutSizingHorizontal", sizing.layoutSizingHorizontal);
  set("layoutSizingVertical", sizing.layoutSizingVertical);

  // ⑤ min/max 는 FILL과 공존한다(실측 확인). 제품의 max-width 제한이 여기서 살아난다.
  for (const key of ["minWidth", "maxWidth", "minHeight", "maxHeight"]) {
    const value = sizing[key];
    if (typeof value === "number" && Number.isFinite(value)) {
      try { node[key] = value; } catch (error) { /* 지원 안 하는 노드 타입은 건너뛴다 */ }
    }
  }
  return node;
}

/**
 * 컨테이너의 Auto Layout을 제품 선언대로 세운다.
 * @param {FrameNode} frame
 * @param {object} spec `{layoutMode, itemSpacing, counterAxisSpacing, padding:{top,right,bottom,left}, wrap, gridColumnCount, gridRowCount, align}`
 */
function applyContainerLayout(frame, spec) {
  if (!spec || !spec.layoutMode || spec.layoutMode === "NONE") {
    frame.layoutMode = "NONE";
    return frame;
  }
  frame.layoutMode = spec.layoutMode; // HORIZONTAL | VERTICAL | GRID
  if (spec.layoutMode === "GRID") {
    if (typeof spec.gridColumnCount === "number") frame.gridColumnCount = Math.max(1, spec.gridColumnCount);
    if (typeof spec.gridRowCount === "number") frame.gridRowCount = Math.max(1, spec.gridRowCount);
  } else {
    frame.layoutWrap = spec.wrap ? "WRAP" : "NO_WRAP";
    if (typeof spec.itemSpacing === "number") frame.itemSpacing = spec.itemSpacing;
    // counterAxisSpacing 은 WRAP일 때만 의미가 있다.
    if (spec.wrap && typeof spec.counterAxisSpacing === "number") frame.counterAxisSpacing = spec.counterAxisSpacing;
    if (spec.align && spec.align.counterAxis) frame.counterAxisAlignItems = spec.align.counterAxis;
    if (spec.align && spec.align.primaryAxis) frame.primaryAxisAlignItems = spec.align.primaryAxis;
  }
  const padding = spec.padding || {};
  if (typeof padding.top === "number") frame.paddingTop = padding.top;
  if (typeof padding.right === "number") frame.paddingRight = padding.right;
  if (typeof padding.bottom === "number") frame.paddingBottom = padding.bottom;
  if (typeof padding.left === "number") frame.paddingLeft = padding.left;
  return frame;
}

/**
 * 절대 배치 노드의 제약(constraints)을 세운다. 부모 리사이즈 시 어떻게 따라갈지 결정한다.
 * CSS `left/right` 둘 다 있으면 가로 STRETCH, `right`만 있으면 MAX 식으로 옮긴다.
 */
function applyConstraints(node, declared) {
  if (node.layoutPositioning !== "ABSOLUTE" && !("constraints" in node)) return node;
  const has = (value) => value != null && value !== "auto" && value !== "";
  const horizontal = has(declared.left) && has(declared.right) ? "STRETCH"
    : has(declared.right) ? "MAX"
    : "MIN";
  const vertical = has(declared.top) && has(declared.bottom) ? "STRETCH"
    : has(declared.bottom) ? "MAX"
    : "MIN";
  try { node.constraints = { horizontal, vertical }; } catch (error) { /* 최상위 노드 등은 제약이 없다 */ }
  return node;
}

/**
 * 텍스트 노드는 auto-layout 프레임이 아니어도 HUG가 가능하다(`textAutoResize`).
 * 측정 rect로 폭을 고정하면 Figma의 글리프 메트릭 차이로 글자가 잘리므로, 판정에 따라 자동 크기를 준다.
 */
function applyTextSizing(textNode, sizing) {
  const horizontal = sizing.layoutSizingHorizontal;
  const vertical = sizing.layoutSizingVertical;
  if (horizontal === "HUG" && vertical === "HUG") textNode.textAutoResize = "WIDTH_AND_HEIGHT";
  else if (vertical === "HUG") textNode.textAutoResize = "HEIGHT";
  else textNode.textAutoResize = "NONE";
  return textNode;
}
