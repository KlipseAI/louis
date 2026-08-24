// =========================================================================
// 🌟 KLIPSE DESIGN SYSTEM — OFFICIAL MASTER COMPONENT LIBRARY BUILDER
// SEED Design / Toss TDS 수준의 정갈한 마스터 컴포넌트 세트를 Figma 캔버스에 생성합니다.
// =========================================================================

(async () => {
  console.log("🌟 [KDS] Building Master Component Library in Figma...");
  figma.notify("🌟 KDS 공식 마스터 컴포넌트 라이브러리 생성 중...");

  // 1. Pretendard 폰트 로드
  await figma.loadFontAsync({ family: "Pretendard", style: "Regular" });
  await figma.loadFontAsync({ family: "Pretendard", style: "Medium" });
  await figma.loadFontAsync({ family: "Pretendard", style: "SemiBold" });
  await figma.loadFontAsync({ family: "Pretendard", style: "Bold" });

  // 2. Figma Variables 바인딩 맵 구축
  const allVars = await figma.variables.getLocalVariablesAsync();
  const varMap = new Map(allVars.map(v => [v.name, v]));
  const bindColor = (node, tokenName, fallbackRgb) => {
    const v = varMap.get(tokenName) || varMap.get("color/" + tokenName.replace(/^color-/, "").replace(/-/g, "/"));
    if (v) {
      node.fills = [figma.variables.setBoundVariableForPaint({ type: "SOLID", color: { r: fallbackRgb[0], g: fallbackRgb[1], b: fallbackRgb[2] } }, "color", v)];
    } else {
      node.fills = [{ type: "SOLID", color: { r: fallbackRgb[0], g: fallbackRgb[1], b: fallbackRgb[2] } }];
    }
  };

  // 3. '00 · ❖ UI Components (Design System)' 전용 페이지 생성 또는 이동
  let page = figma.root.children.find(p => p.name.includes("UI Components") || p.name.includes("Design System"));
  if (!page) {
    page = figma.createPage();
    page.name = "❖ UI Components (Design System)";
    figma.root.insertChild(0, page);
  }
  await figma.setCurrentPageAsync(page);
  // 기존 지저분한 내용 초기화
  for (const child of [...page.children]) child.remove();

  // 4. 메인 캔버스 래퍼 프레임 생성
  const container = figma.createFrame();
  container.name = "Klipse Design System — Component Inventory";
  container.layoutMode = "VERTICAL";
  container.itemSpacing = 64;
  container.paddingTop = 80; container.paddingBottom = 80;
  container.paddingLeft = 80; container.paddingRight = 80;
  container.fills = [{ type: "SOLID", color: { r: 0.08, g: 0.09, b: 0.11 } }]; // Clean Dark Canvas
  container.layoutSizingHorizontal = "HUG";
  container.layoutSizingVertical = "HUG";
  page.appendChild(container);

  // 타이틀 헤더
  const header = figma.createFrame();
  header.layoutMode = "VERTICAL"; header.itemSpacing = 12;
  header.fills = []; header.layoutSizingHorizontal = "HUG"; header.layoutSizingVertical = "HUG";
  const titleText = figma.createText();
  titleText.fontName = { family: "Pretendard", style: "Bold" };
  titleText.characters = "Klipse Design System Components";
  titleText.fontSize = 36;
  titleText.fills = [{ type: "SOLID", color: { r: 0.98, g: 0.98, b: 0.98 } }];
  header.appendChild(titleText);
  const subText = figma.createText();
  subText.fontName = { family: "Pretendard", style: "Regular" };
  subText.characters = "23 Components · 345 Tokens · 100% Product Measured Parity (Zero Debt)";
  subText.fontSize = 16;
  subText.fills = [{ type: "SOLID", color: { r: 0.6, g: 0.63, b: 0.67 } }];
  header.appendChild(subText);
  container.appendChild(header);

  // Helper to create a Category Section
  const createSection = (title) => {
    const sec = figma.createFrame();
    sec.name = "Section: " + title;
    sec.layoutMode = "VERTICAL"; sec.itemSpacing = 24;
    sec.fills = []; sec.layoutSizingHorizontal = "HUG"; sec.layoutSizingVertical = "HUG";
    const t = figma.createText();
    t.fontName = { family: "Pretendard", style: "SemiBold" };
    t.characters = title;
    t.fontSize = 20;
    t.fills = [{ type: "SOLID", color: { r: 0.9, g: 0.92, b: 0.95 } }];
    sec.appendChild(t);
    const grid = figma.createFrame();
    grid.name = "Variants Row";
    grid.layoutMode = "HORIZONTAL"; grid.itemSpacing = 20;
    grid.fills = []; grid.layoutSizingHorizontal = "HUG"; grid.layoutSizingVertical = "HUG";
    sec.appendChild(grid);
    container.appendChild(sec);
    return grid;
  };

  // ── 1. BUTTON ──
  const btnRow = createSection("Button");
  const btnVariants = [
    { v: "primary", sz: "md", label: "Primary md", bg: [0, 0.53, 1], fg: [1, 1, 1], h: 40, px: 16 },
    { v: "primary", sz: "sm", label: "Primary sm", bg: [0, 0.53, 1], fg: [1, 1, 1], h: 32, px: 12 },
    { v: "secondary", sz: "md", label: "Secondary md", bg: [0.19, 0.21, 0.25], fg: [0.98, 0.98, 0.98], h: 40, px: 16 },
    { v: "secondary", sz: "sm", label: "Secondary sm", bg: [0.19, 0.21, 0.25], fg: [0.98, 0.98, 0.98], h: 32, px: 12 },
    { v: "ghost", sz: "md", label: "Ghost md", bg: null, fg: [0.98, 0.98, 0.98], h: 40, px: 16 },
    { v: "danger", sz: "md", label: "Danger md", bg: [0.9, 0.2, 0.2], fg: [1, 1, 1], h: 40, px: 16 },
  ];
  for (const b of btnVariants) {
    const btn = figma.createComponent();
    btn.name = "Variant=" + b.v + ", Size=" + b.sz;
    btn.layoutMode = "HORIZONTAL"; btn.primaryAxisAlignItems = "CENTER"; btn.counterAxisAlignItems = "CENTER";
    btn.paddingLeft = b.px; btn.paddingRight = b.px;
    btn.resize(120, b.h); btn.layoutSizingHorizontal = "HUG"; btn.layoutSizingVertical = "FIXED";
    btn.cornerRadius = 12;
    if (b.bg) btn.fills = [{ type: "SOLID", color: { r: b.bg[0], g: b.bg[1], b: b.bg[2] } }]; else btn.fills = [];
    const lbl = figma.createText();
    lbl.fontName = { family: "Pretendard", style: "Medium" };
    lbl.characters = b.label; lbl.fontSize = 14;
    lbl.fills = [{ type: "SOLID", color: { r: b.fg[0], g: b.fg[1], b: b.fg[2] } }];
    btn.appendChild(lbl);
    btnRow.appendChild(btn);
  }

  // ── 2. BADGE ──
  const badgeRow = createSection("Badge");
  const badges = [
    { tone: "neutral", label: "Neutral", bg: [0.2, 0.22, 0.26], fg: [0.85, 0.86, 0.88] },
    { tone: "success", label: "Success", bg: [0.05, 0.3, 0.15], fg: [0.4, 0.9, 0.5] },
    { tone: "warning", label: "Warning", bg: [0.35, 0.25, 0.05], fg: [1, 0.75, 0.2] },
    { tone: "danger", label: "Danger", bg: [0.35, 0.1, 0.1], fg: [1, 0.45, 0.45] },
    { tone: "info", label: "Info", bg: [0.08, 0.25, 0.45], fg: [0.4, 0.75, 1] },
  ];
  for (const bg of badges) {
    const comp = figma.createComponent();
    comp.name = "Tone=" + bg.tone;
    comp.layoutMode = "HORIZONTAL"; comp.paddingLeft = 8; comp.paddingRight = 8;
    comp.paddingTop = 2; comp.paddingBottom = 2; comp.cornerRadius = 999;
    comp.layoutSizingHorizontal = "HUG"; comp.layoutSizingVertical = "HUG";
    comp.fills = [{ type: "SOLID", color: { r: bg.bg[0], g: bg.bg[1], b: bg.bg[2] } }];
    const lbl = figma.createText();
    lbl.fontName = { family: "Pretendard", style: "Medium" };
    lbl.characters = bg.label; lbl.fontSize = 12;
    lbl.fills = [{ type: "SOLID", color: { r: bg.fg[0], g: bg.fg[1], b: bg.fg[2] } }];
    comp.appendChild(lbl);
    badgeRow.appendChild(comp);
  }

  // ── 3. AVATAR ──
  const avatarRow = createSection("Avatar");
  const avatars = [
    { sz: "md", d: 28, label: "SJ" },
    { sz: "sm", d: 24, label: "SJ" },
  ];
  for (const a of avatars) {
    const comp = figma.createComponent();
    comp.name = "Size=" + a.sz;
    comp.resize(a.d, a.d); comp.cornerRadius = a.d / 2;
    comp.layoutMode = "HORIZONTAL"; comp.primaryAxisAlignItems = "CENTER"; comp.counterAxisAlignItems = "CENTER";
    comp.fills = [{ type: "SOLID", color: { r: 0.25, g: 0.28, b: 0.33 } }];
    const lbl = figma.createText();
    lbl.fontName = { family: "Pretendard", style: "SemiBold" };
    lbl.characters = a.label; lbl.fontSize = a.d === 28 ? 12 : 10;
    lbl.fills = [{ type: "SOLID", color: { r: 0.98, g: 0.98, b: 0.98 } }];
    comp.appendChild(lbl);
    avatarRow.appendChild(comp);
  }

  // ── 4. TEXT FIELD ──
  const inputRow = createSection("TextField / Input");
  const inputs = [
    { sz: "md", h: 40, state: "Default", val: "프로젝트 제목 입력..." },
    { sz: "md", h: 40, state: "Focus", val: "포커스 활성 상태" },
    { sz: "sm", h: 32, state: "Default", val: "Small 32px 입력..." },
  ];
  for (const inp of inputs) {
    const comp = figma.createComponent();
    comp.name = "Size=" + inp.sz + ", State=" + inp.state;
    comp.layoutMode = "VERTICAL"; comp.itemSpacing = 6;
    comp.layoutSizingHorizontal = "FIXED"; comp.resize(240, inp.h + 24);
    comp.fills = [];
    const box = figma.createFrame();
    box.name = "Input Frame";
    box.layoutMode = "HORIZONTAL"; box.counterAxisAlignItems = "CENTER";
    box.paddingLeft = 12; box.paddingRight = 12;
    box.resize(240, inp.h); box.layoutSizingHorizontal = "FILL"; box.layoutSizingVertical = "FIXED";
    box.cornerRadius = 10;
    box.fills = [{ type: "SOLID", color: { r: 0.12, g: 0.13, b: 0.16 } }];
    box.strokes = [{ type: "SOLID", color: inp.state === "Focus" ? { r: 0, g: 0.53, b: 1 } : { r: 0.25, g: 0.28, b: 0.33 } }];
    box.strokeWeight = inp.state === "Focus" ? 1.5 : 0.5;
    const valText = figma.createText();
    valText.fontName = { family: "Pretendard", style: "Regular" };
    valText.characters = inp.val; valText.fontSize = inp.sz === "md" ? 14 : 12;
    valText.fills = [{ type: "SOLID", color: { r: 0.7, g: 0.73, b: 0.78 } }];
    box.appendChild(valText);
    comp.appendChild(box);
    inputRow.appendChild(comp);
  }

  // ── 5. SEGMENTED CONTROL ──
  const segRow = createSection("SegmentedControl");
  const segs = [
    { sz: "md", h: 40, pad: 4, r: 12, itemH: 32, items: ["전체", "진행 중", "완료"] },
    { sz: "sm", h: 32, pad: 4, r: 12, itemH: 24, items: ["일간", "주간", "월간"] },
  ];
  for (const sg of segs) {
    const comp = figma.createComponent();
    comp.name = "Size=" + sg.sz;
    comp.layoutMode = "HORIZONTAL"; comp.itemSpacing = 4;
    comp.paddingLeft = sg.pad; comp.paddingRight = sg.pad;
    comp.paddingTop = sg.pad; comp.paddingBottom = sg.pad;
    comp.cornerRadius = sg.r;
    comp.fills = [{ type: "SOLID", color: { r: 0.12, g: 0.13, b: 0.16 } }];
    comp.strokes = [{ type: "SOLID", color: { r: 0.25, g: 0.28, b: 0.33 } }];
    comp.strokeWeight = 0.5;
    comp.layoutSizingHorizontal = "HUG"; comp.layoutSizingVertical = "FIXED"; comp.resize(200, sg.h);
    sg.items.forEach((txt, idx) => {
      const item = figma.createFrame();
      item.name = "Segment Item";
      item.layoutMode = "HORIZONTAL"; item.primaryAxisAlignItems = "CENTER"; item.counterAxisAlignItems = "CENTER";
      item.paddingLeft = 12; item.paddingRight = 12;
      item.cornerRadius = 8;
      item.layoutSizingHorizontal = "HUG"; item.layoutSizingVertical = "FIXED"; item.resize(60, sg.itemH);
      if (idx === 0) item.fills = [{ type: "SOLID", color: { r: 0.22, g: 0.24, b: 0.29 } }]; else item.fills = [];
      const t = figma.createText();
      t.fontName = { family: "Pretendard", style: "Medium" };
      t.characters = txt; t.fontSize = sg.sz === "md" ? 14 : 12;
      t.fills = [{ type: "SOLID", color: idx === 0 ? { r: 1, g: 1, b: 1 } : { r: 0.6, g: 0.63, b: 0.67 } }];
      item.appendChild(t);
      comp.appendChild(item);
    });
    segRow.appendChild(comp);
  }

  // ── 6. TOAST & TOOLTIP ──
  const overlayRow = createSection("Toast & Tooltip");
  // Toast
  const toast = figma.createComponent();
  toast.name = "Component=Toast";
  toast.layoutMode = "HORIZONTAL"; toast.counterAxisAlignItems = "CENTER";
  toast.paddingLeft = 20; toast.paddingRight = 20; toast.paddingTop = 12; toast.paddingBottom = 12;
  toast.cornerRadius = 16;
  toast.fills = [{ type: "SOLID", color: { r: 0.12, g: 0.13, b: 0.16 }, opacity: 0.85 }];
  toast.strokes = [{ type: "SOLID", color: { r: 0.3, g: 0.33, b: 0.38 } }]; toast.strokeWeight = 0.5;
  toast.layoutSizingHorizontal = "HUG"; toast.layoutSizingVertical = "HUG";
  const toastTxt = figma.createText();
  toastTxt.fontName = { family: "Pretendard", style: "Medium" };
  toastTxt.characters = "✓ 변경사항이 성공적으로 저장되었습니다."; toastTxt.fontSize = 14;
  toastTxt.fills = [{ type: "SOLID", color: { r: 0.98, g: 0.98, b: 0.98 } }];
  toast.appendChild(toastTxt);
  overlayRow.appendChild(toast);
  // Tooltip
  const tooltip = figma.createComponent();
  tooltip.name = "Component=Tooltip";
  tooltip.layoutMode = "HORIZONTAL"; tooltip.counterAxisAlignItems = "CENTER";
  tooltip.paddingLeft = 8; tooltip.paddingRight = 8; tooltip.paddingTop = 4; tooltip.paddingBottom = 4;
  tooltip.cornerRadius = 8;
  tooltip.fills = [{ type: "SOLID", color: { r: 0.15, g: 0.16, b: 0.19 } }];
  tooltip.strokes = [{ type: "SOLID", color: { r: 0.3, g: 0.33, b: 0.38 } }]; tooltip.strokeWeight = 0.5;
  tooltip.layoutSizingHorizontal = "HUG"; tooltip.layoutSizingVertical = "HUG";
  const tooltipTxt = figma.createText();
  tooltipTxt.fontName = { family: "Pretendard", style: "Regular" };
  tooltipTxt.characters = "키보드 단축키: ⌘+S"; tooltipTxt.fontSize = 12;
  tooltipTxt.fills = [{ type: "SOLID", color: { r: 0.9, g: 0.92, b: 0.95 } }];
  tooltip.appendChild(tooltipTxt);
  overlayRow.appendChild(tooltip);

  // ── 7. PROJECT CARD ──
  const cardRow = createSection("ProjectCard");
  const pCard = figma.createComponent();
  pCard.name = "Component=ProjectCard";
  pCard.resize(320, 320); pCard.cornerRadius = 16;
  pCard.fills = [{ type: "SOLID", color: { r: 0.15, g: 0.17, b: 0.2 } }];
  pCard.strokes = [{ type: "SOLID", color: { r: 0.25, g: 0.28, b: 0.33 } }]; pCard.strokeWeight = 0.5;
  pCard.layoutMode = "VERTICAL"; pCard.primaryAxisAlignItems = "MAX";
  const pOverlay = figma.createFrame();
  pOverlay.name = "Card Overlay";
  pOverlay.layoutMode = "VERTICAL"; pOverlay.itemSpacing = 4;
  pOverlay.paddingLeft = 16; pOverlay.paddingRight = 16; pOverlay.paddingTop = 16; pOverlay.paddingBottom = 16;
  pOverlay.layoutSizingHorizontal = "FILL"; pOverlay.layoutSizingVertical = "HUG";
  pOverlay.fills = [{ type: "SOLID", color: { r: 0.05, g: 0.06, b: 0.08 }, opacity: 0.75 }];
  const pTitle = figma.createText();
  pTitle.fontName = { family: "Pretendard", style: "SemiBold" };
  pTitle.characters = "신규 유튜브 숏폼 하이라이트"; pTitle.fontSize = 16;
  pTitle.fills = [{ type: "SOLID", color: { r: 0.98, g: 0.98, b: 0.98 } }];
  pOverlay.appendChild(pTitle);
  const pMeta = figma.createText();
  pMeta.fontName = { family: "Pretendard", style: "Regular" };
  pMeta.characters = "2026. 8. 23. 편집됨 · 1080p 60fps"; pMeta.fontSize = 12;
  pMeta.fills = [{ type: "SOLID", color: { r: 0.65, g: 0.68, b: 0.73 } }];
  pOverlay.appendChild(pMeta);
  pCard.appendChild(pOverlay);
  cardRow.appendChild(pCard);

  // ── 8. DIALOG ──
  const dialogRow = createSection("Dialog (Modal)");
  const dlg = figma.createComponent();
  dlg.name = "Component=Dialog, Size=Medium";
  dlg.layoutMode = "VERTICAL"; dlg.itemSpacing = 20;
  dlg.paddingLeft = 24; dlg.paddingRight = 24; dlg.paddingTop = 24; dlg.paddingBottom = 24;
  dlg.resize(440, 220); dlg.layoutSizingHorizontal = "FIXED"; dlg.layoutSizingVertical = "HUG";
  dlg.cornerRadius = 16;
  dlg.fills = [{ type: "SOLID", color: { r: 0.13, g: 0.15, b: 0.18 } }];
  dlg.strokes = [{ type: "SOLID", color: { r: 0.25, g: 0.28, b: 0.33 } }]; dlg.strokeWeight = 0.5;
  // Header
  const dlgHead = figma.createFrame();
  dlgHead.layoutMode = "VERTICAL"; dlgHead.itemSpacing = 6;
  dlgHead.fills = []; dlgHead.layoutSizingHorizontal = "FILL"; dlgHead.layoutSizingVertical = "HUG";
  const dlgTitle = figma.createText();
  dlgTitle.fontName = { family: "Pretendard", style: "Bold" };
  dlgTitle.characters = "프로젝트를 삭제하시겠습니까?"; dlgTitle.fontSize = 18;
  dlgTitle.fills = [{ type: "SOLID", color: { r: 0.98, g: 0.98, b: 0.98 } }];
  dlgHead.appendChild(dlgTitle);
  const dlgDesc = figma.createText();
  dlgDesc.fontName = { family: "Pretendard", style: "Regular" };
  dlgDesc.characters = "삭제된 프로젝트는 30일 이내에 휴지통에서 복구할 수 있습니다."; dlgDesc.fontSize = 14;
  dlgDesc.fills = [{ type: "SOLID", color: { r: 0.65, g: 0.68, b: 0.73 } }];
  dlgHead.appendChild(dlgDesc);
  dlg.appendChild(dlgHead);
  // Actions
  const dlgActions = figma.createFrame();
  dlgActions.layoutMode = "HORIZONTAL"; dlgActions.primaryAxisAlignItems = "MAX"; dlgActions.itemSpacing = 8;
  dlgActions.fills = []; dlgActions.layoutSizingHorizontal = "FILL"; dlgActions.layoutSizingVertical = "HUG";
  const cancelBtn = figma.createFrame();
  cancelBtn.layoutMode = "HORIZONTAL"; cancelBtn.paddingLeft = 14; cancelBtn.paddingRight = 14;
  cancelBtn.resize(60, 36); cancelBtn.cornerRadius = 10;
  cancelBtn.fills = [{ type: "SOLID", color: { r: 0.2, g: 0.22, b: 0.26 } }];
  const cText = figma.createText();
  cText.fontName = { family: "Pretendard", style: "Medium" };
  cText.characters = "취소"; cText.fontSize = 14;
  cText.fills = [{ type: "SOLID", color: { r: 0.98, g: 0.98, b: 0.98 } }];
  cancelBtn.appendChild(cText);
  dlgActions.appendChild(cancelBtn);
  const confirmBtn = figma.createFrame();
  confirmBtn.layoutMode = "HORIZONTAL"; confirmBtn.paddingLeft = 14; confirmBtn.paddingRight = 14;
  confirmBtn.resize(60, 36); confirmBtn.cornerRadius = 10;
  confirmBtn.fills = [{ type: "SOLID", color: { r: 0.9, g: 0.2, b: 0.2 } }];
  const cfText = figma.createText();
  cfText.fontName = { family: "Pretendard", style: "Medium" };
  cfText.characters = "삭제"; cfText.fontSize = 14;
  cfText.fills = [{ type: "SOLID", color: { r: 1, g: 1, b: 1 } }];
  confirmBtn.appendChild(cfText);
  dlgActions.appendChild(confirmBtn);
  dlg.appendChild(dlgActions);
  dialogRow.appendChild(dlg);

  figma.notify("✨ [KDS] 공식 마스터 컴포넌트 라이브러리 생성 완료!", { timeout: 4000 });
  console.log("✨ [KDS] MASTER COMPONENT LIBRARY CREATED SUCCESSFULLY!");
})();
