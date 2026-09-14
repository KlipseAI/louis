const F = PLAN.figma;
const L = PLAN.layout;

// **reconciler다.** install id로 프레임을 찾아 layout 속성만 다시 박는다. 노드를 새로 만들거나
// 지우지 않는다 — 이미 올바른 라이브에 돌리면 no-op이고, 재빌드로 구조가 흐트러졌을 때만 값이 바뀐다.
//
// **계산된 크기는 박지 않는다(2026-09-14).** 뷰포트 · 제목 줄 · 격자는 main 카드를 채우고(FILL), 카드 한 변은
// 라이브 격자 폭에서 계산한다. 고정하는 것은 제품이 고른 값뿐이다 — 업로드 카드 400×140, 여백 · 간격.
const need = async (id, expectName) => {
  const node = await figma.getNodeByIdAsync(id);
  if (!node) throw new Error(`Missing node ${id} (${expectName ?? "?"})`);
  if (expectName && node.name !== expectName) {
    throw new Error(`Node ${id} name drift: ${JSON.stringify(node.name)} != ${JSON.stringify(expectName)}`);
  }
  return node;
};
const isAuto = (node) => Boolean(node && "layoutMode" in node && node.layoutMode && node.layoutMode !== "NONE");

const screen = await need(F.screenId);
await figma.setCurrentPageAsync(screen.parent && screen.parent.type === "PAGE" ? screen.parent : figma.currentPage);

// ── viewport (VERTICAL Auto Layout, main 카드의 상단 바 아래를 채운다) ─────────────
const viewport = await need(F.viewportId, F.names.viewport);
viewport.layoutMode = L.viewport.mode;
viewport.layoutWrap = "NO_WRAP";
viewport.paddingTop = L.viewport.padding[0];
viewport.paddingRight = L.viewport.padding[1];
viewport.paddingBottom = L.viewport.padding[2];
viewport.paddingLeft = L.viewport.padding[3];
viewport.itemSpacing = L.viewport.gap;
const card = viewport.parent;
if (isAuto(card)) {
  viewport.layoutSizingHorizontal = "FILL";
  viewport.layoutSizingVertical = "FILL";
} else if (card && "children" in card) {
  // 절대배치 main 카드 — 상단 바 인스턴스(HUG) 바로 아래에서 카드 끝까지 늘어나게 제약으로 둔다.
  // 바 높이는 계획에 숫자로 두지 않고 라이브 인스턴스에서 읽는다.
  const bar = card.children.find((entry) => entry !== viewport && entry.type === "INSTANCE" && /Top Bar/.test(entry.name));
  const top = bar ? bar.y + bar.height : 0;
  viewport.x = 0;
  viewport.y = top;
  viewport.resize(card.width, Math.max(1, card.height - top));
  viewport.constraints = { horizontal: "STRETCH", vertical: "STRETCH" };
}

// ── heading (HORIZONTAL Auto Layout) ────────────────────────────────────────
const heading = await need(F.headingId, F.names.heading);
heading.layoutMode = L.heading.mode;
heading.layoutWrap = "NO_WRAP";
heading.itemSpacing = L.heading.gap;
heading.layoutSizingHorizontal = "FILL";
heading.layoutSizingVertical = "HUG";

// ── grid (HORIZONTAL wrap Auto Layout) ──────────────────────────────────────
const grid = await need(F.gridId, F.names.grid);
grid.layoutMode = L.grid.mode;
grid.layoutWrap = L.grid.wrap ? "WRAP" : "NO_WRAP";
grid.itemSpacing = L.grid.gap;
grid.counterAxisSpacing = L.grid.crossGap;
grid.layoutSizingHorizontal = "FILL";
grid.layoutSizingVertical = "HUG";

// ── cards: 격자 폭에서 한 변을 계산 + grid 소속 보장 ─────────────────────────
// 제품은 `repeat(5, 1fr)` 에 간격 6 이다 — Figma wrap 에는 1fr 이 없어 라이브 격자 폭을 열 수로 나눈다.
const side = (grid.width - L.grid.gap * (L.grid.columns - 1)) / L.grid.columns;
const gridChildIds = new Set(grid.children.map((child) => child.id));
const reparented = [];
for (const cardId of F.cardIds) {
  const tile = await need(cardId);
  if (!gridChildIds.has(tile.id)) {
    grid.appendChild(tile);
    reparented.push(tile.id);
  }
  tile.layoutPositioning = "AUTO";
  if (isAuto(tile)) {
    tile.primaryAxisSizingMode = "FIXED";
    tile.counterAxisSizingMode = "FIXED";
  }
  tile.resize(side, side);
}

// ── fixed upload card (main 카드의 ABSOLUTE child) ──────────────────────────
// 400×140 은 선언이다. 자리는 제품의 `position:fixed; bottom:20; left:sidebar; right:0; margin:0 auto` —
// 뷰포트에서 푼 좌표를 처음 한 번 놓고, 카드 크기가 바뀌어도 가운데 · 아래에 붙게 제약을 건다.
const upload = await need(F.uploadId);
if (isAuto(upload.parent)) upload.layoutPositioning = "ABSOLUTE";
upload.layoutMode = "VERTICAL";
upload.paddingTop = upload.paddingRight = upload.paddingBottom = upload.paddingLeft = L.upload.padding;
upload.itemSpacing = L.upload.gap;
upload.cornerRadius = L.upload.radius;
upload.primaryAxisSizingMode = "FIXED";
upload.counterAxisSizingMode = "FIXED";
upload.resize(L.upload.width, L.upload.height);
upload.x = L.upload.x;
upload.y = L.upload.y;
upload.constraints = L.upload.constraints;

return {
  reconciled: {
    viewport: [Math.round(viewport.width), Math.round(viewport.height)],
    heading: Math.round(heading.width),
    grid: Math.round(grid.width),
    cardSide: side,
    cards: F.cardIds.length,
    reparented,
    upload: [Math.round(upload.width), Math.round(upload.height), Math.round(upload.x), Math.round(upload.y)],
  },
};
