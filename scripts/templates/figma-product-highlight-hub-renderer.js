const F = PLAN.figma;
const L = PLAN.layout;

// **reconciler다.** install id로 프레임을 찾아 layout 속성만 다시 박는다. 노드를 새로 만들거나
// 지우지 않는다 — 이미 올바른 라이브에 돌리면 no-op이고, 재빌드로 구조가 흐트러졌을 때만 값이 바뀐다.
const need = async (id, expectName) => {
  const node = await figma.getNodeByIdAsync(id);
  if (!node) throw new Error(`Missing node ${id} (${expectName ?? "?"})`);
  if (expectName && node.name !== expectName) {
    throw new Error(`Node ${id} name drift: ${JSON.stringify(node.name)} != ${JSON.stringify(expectName)}`);
  }
  return node;
};
const setFixed = (node, width, height) => {
  if ("layoutMode" in node && node.layoutMode && node.layoutMode !== "NONE") {
    node.primaryAxisSizingMode = "FIXED";
    node.counterAxisSizingMode = "FIXED";
  }
  node.resize(width, height);
};

const screen = await need(F.screenId);
await figma.setCurrentPageAsync(screen.parent && screen.parent.type === "PAGE" ? screen.parent : figma.currentPage);

// ── viewport (VERTICAL Auto Layout) ─────────────────────────────────────────
const viewport = await need(F.viewportId, F.names.viewport);
viewport.layoutMode = L.viewport.mode;
viewport.layoutWrap = "NO_WRAP";
viewport.paddingTop = L.viewport.padding[0];
viewport.paddingRight = L.viewport.padding[1];
viewport.paddingBottom = L.viewport.padding[2];
viewport.paddingLeft = L.viewport.padding[3];
viewport.itemSpacing = L.viewport.gap;
setFixed(viewport, L.viewport.width, L.viewport.height);
if (viewport.parent && (!("layoutMode" in viewport.parent) || viewport.parent.layoutMode === "NONE")) {
  viewport.x = L.viewport.x;
  viewport.y = L.viewport.y;
}

// ── heading (HORIZONTAL Auto Layout) ────────────────────────────────────────
const heading = await need(F.headingId, F.names.heading);
heading.layoutMode = L.heading.mode;
heading.layoutWrap = "NO_WRAP";
heading.itemSpacing = L.heading.gap;
heading.primaryAxisSizingMode = "FIXED";
heading.counterAxisSizingMode = "AUTO";
heading.resize(L.heading.width, heading.height);

// ── grid (HORIZONTAL wrap Auto Layout) ──────────────────────────────────────
const grid = await need(F.gridId, F.names.grid);
grid.layoutMode = L.grid.mode;
grid.layoutWrap = L.grid.wrap ? "WRAP" : "NO_WRAP";
grid.itemSpacing = L.grid.gap;
grid.counterAxisSpacing = L.grid.crossGap;
grid.primaryAxisSizingMode = "FIXED";
grid.counterAxisSizingMode = "AUTO";
grid.resize(L.grid.width, grid.height);

// ── cards: 크기 고정 + grid 소속 보장 ───────────────────────────────────────
const gridChildIds = new Set(grid.children.map((child) => child.id));
const reparented = [];
for (const cardId of F.cardIds) {
  const card = await need(cardId);
  if (!gridChildIds.has(card.id)) {
    grid.appendChild(card);
    reparented.push(card.id);
  }
  card.layoutPositioning = "AUTO";
  setFixed(card, L.card.width, L.card.height);
}

// ── fixed upload card (main card의 ABSOLUTE child) ──────────────────────────
const upload = await need(F.uploadId);
upload.layoutPositioning = "ABSOLUTE";
upload.layoutMode = "VERTICAL";
upload.paddingTop = upload.paddingRight = upload.paddingBottom = upload.paddingLeft = L.upload.padding;
upload.itemSpacing = L.upload.gap;
upload.cornerRadius = L.upload.radius;
setFixed(upload, L.upload.width, L.upload.height);
upload.x = L.upload.x;
upload.y = L.upload.y;

return {
  reconciled: {
    viewport: [Math.round(viewport.width), Math.round(viewport.height)],
    heading: Math.round(heading.width),
    grid: Math.round(grid.width),
    cards: F.cardIds.length,
    reparented,
    upload: [Math.round(upload.width), Math.round(upload.height), Math.round(upload.x), Math.round(upload.y)],
  },
};
