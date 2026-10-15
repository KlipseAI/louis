// 시험용 복제본, 끝에 지움 — 보드 반응 탐침(scripts/build-figma-resize-probe.mjs 가 쓴다). 원본 보드는 복제만 한다.
const RUN = "2026-10-16p2", PAGE_ID = "246:3447", OFFSET = 30, LIMIT = 10, SLOT = 3;
const RE = /^(desktop|mobile) \d+×\d+ — /;
const work = await figma.getNodeByIdAsync("699:2");
if (!work || work.type !== "PAGE") throw new Error("work page not found");
await figma.setCurrentPageAsync(work);
const page = await figma.getNodeByIdAsync(PAGE_ID);
if (!page || page.type !== "PAGE") throw new Error("page not found: " + PAGE_ID);
await page.loadAsync();
const boards = [];
const collect = (n, depth) => {
  if ((n.type === "FRAME" || n.type === "COMPONENT") && RE.test(n.name)) { boards.push(n); return; }
  if (depth < 3 && (n.type === "SECTION" || n.type === "GROUP" || n.type === "FRAME") && "children" in n) for (const c of n.children) collect(c, depth + 1);
};
for (const c of page.children) collect(c, 0);
const slice = boards.slice(OFFSET, OFFSET + LIMIT);
// 복제본을 작업 페이지로 옮기려면 글꼴이 실려 있어야 한다(appendChild 가 unloaded font 로 멈춘다).
const fonts = new Set();
for (const b of slice) for (const t of b.findAllWithCriteria({ types: ["TEXT"] })) for (const f of t.getRangeAllFontNames(0, t.characters.length)) fonts.add(JSON.stringify(f));
for (const f of fonts) await figma.loadFontAsync(JSON.parse(f));
const FRAMEISH = { FRAME: 1, COMPONENT: 1, INSTANCE: 1, COMPONENT_SET: 1 };
const r1 = (v) => Math.round(v * 10) / 10;
const r3 = (v) => Math.round(v * 1000) / 1000;
function measure(board, base, key) {
  const B = board.absoluteBoundingBox;
  const BL = B.x, BR = B.x + B.width;
  let outside = 0, roots = 0, parent = 0, parentNew = 0, text = 0, textNew = 0;
  const worst = [], pcs = [], tcs = [];
  const pset = new Set(), tset = new Set();
  const walk = (n, path, cl, cr, parentOut) => {
    if (!n.visible) return;
    const bb = n.absoluteBoundingBox;
    if (!bb) return;
    const vl = Math.max(bb.x, cl), vr = Math.min(bb.x + bb.width, cr);
    if (vr - vl <= 0 && bb.width > 0) return; // 조상 클립에 완전히 가려졌다
    const ov = Math.max(0, vr - BR, BL - vl);
    const out = ov > 0.5;
    if (out) {
      outside++;
      if (!parentOut) { roots++; worst.push([n.name.slice(0, 48), r1(ov), n.id]); }
    }
    const p = n.parent;
    if (p && p !== board.parent && FRAMEISH[p.type]) {
      const pb = p.absoluteBoundingBox;
      const dx = Math.max(bb.x + bb.width - (pb.x + pb.width), pb.x - bb.x);
      // 문서 뿌리(보드의 세로 HUG 자식)가 보드 아래로 길어진 것은 부모 밖이 아니다 — 제품 문서는 줄이 늘면 길어진다(DS-D-0098 의 문서 보드 예외).
      const documentRoot = p === board && n.layoutSizingVertical === "HUG";
      // 자르는 부모(스크롤 · overflow hidden 칸) 안의 흐름 HUG 자식이 아래로 길어진 것도 부모 밖이 아니다 — 제품도 그 칸이 자르거나 스크롤한다(2026-10-16).
      const clippedFlow = p.clipsContent && n.layoutSizingVertical === "HUG" && n.layoutPositioning !== "ABSOLUTE";
      const dy = Math.max(documentRoot || clippedFlow ? 0 : bb.y + bb.height - (pb.y + pb.height), pb.y - bb.y);
      if (dx > 0.5 || dy > 0.5) { parent++; pset.add(path); if (base && !base.pset.has(path)) { parentNew++; pcs.push([n.name.slice(0, 40), n.id, r1(Math.max(dx, dy))]); } }
      if (n.type === "TEXT" && n.textAutoResize !== "WIDTH_AND_HEIGHT" && bb.width > pb.width + 0.5) {
        text++; tset.add(path); if (base && !base.tset.has(path)) { textNew++; tcs.push([n.name.slice(0, 40), n.id, r1(bb.width - pb.width)]); }
      }
    }
    if (!("children" in n)) return;
    let ncl = cl, ncr = cr;
    if (n !== board && FRAMEISH[n.type] && n.clipsContent) { ncl = Math.max(cl, bb.x); ncr = Math.min(cr, bb.x + bb.width); }
    const kids = n.children;
    for (let i = 0; i < kids.length; i++) walk(kids[i], path + "." + i, ncl, ncr, out);
  };
  walk(board, "", -Infinity, Infinity, false);
  const vis = board.children.filter((k) => k.visible);
  const root = vis.find((k) => k.name.startsWith("generated/")) || vis.slice().sort((a, b) => b.width * b.height - a.width * a.height)[0];
  worst.sort((a, b) => b[1] - a[1]);
  pcs.sort((a, b) => b[2] - a[2]); tcs.sort((a, b) => b[2] - a[2]);
  const rw = root ? r3(root.width / board.width) : null, rh = root ? r3(root.height / board.height) : null;
  // 원인 이름(2026-10-15): 수만 남던 실패 유형마다 원인 노드를 이름 40자 · id · 넘친 px 로 상위 셋만 싣는다.
  //   pc = 새로 부모 밖으로 나간 자식(pn) · tc = 새로 부모보다 넓어진 고정 폭 글자(tn) · rc = 루트가 크기를 따라오지 않은 시험의 루트 [이름, id].
  const cause = {};
  if (pcs.length) cause.pc = pcs.slice(0, 3);
  if (tcs.length) cause.tc = tcs.slice(0, 3);
  if (root && ((key === "h130" && rh < 0.99) || (key && key !== "h130" && rw < 0.99))) cause.rc = [root.name.slice(0, 40), root.id];
  return {
    o: outside, or: roots, top: worst.slice(0, 5), p: parent, pn: parentNew, t: text, tn: textNew, rw, rh,
    ...cause, pset, tset,
  };
}
const strip = (m) => { const { pset, tset, ...rest } = m; return rest; };
let x0 = 100000;
for (const n of work.children) if (!n.name.startsWith("시험용 복제본")) x0 = Math.max(x0, n.x + n.width + 1000);
x0 += SLOT * 4000;
const created = [];
const t0 = Date.now();
const rows = [];
try {
  for (const board of slice) {
    const desktop = board.name.startsWith("desktop");
    const W = board.width, H = board.height;
    const sizes = desktop
      ? [["w1440", 1440, H], ["w2560", 2560, H], ["h130", W, Math.round(H * 1.3)]]
      : [["w360", 360, H], ["w430", 430, H], ["h130", W, Math.round(H * 1.3)]];
    const row = { name: board.name, id: board.id, w: r1(W), h: r1(H), base: null, v: {} };
    let base = null;
    for (const [key, vw, vh] of sizes) {
      const c = board.clone();
      const cid = c.id;
      created.push(cid);
      try {
        if (c.parent !== work) work.appendChild(c);
        c.name = "시험용 복제본, 끝에 지움 — " + board.name.slice(0, 60);
        c.x = x0; c.y = 0;
        if (!base) { base = measure(c, null, null); row.base = strip(base); }
        c.resize(vw, vh);
        row.v[key] = Object.assign({ w: r1(c.width), h: r1(c.height) }, strip(measure(c, base, key)));
      } finally {
        if (!c.removed) c.remove();
      }
    }
    rows.push(row);
  }
} finally {
  for (const id of created) { const n = await figma.getNodeByIdAsync(id); if (n && !n.removed) n.remove(); }
}
let leftover = 0;
for (const id of created) { const n = await figma.getNodeByIdAsync(id); if (n && !n.removed) leftover++; }
return { probe: "figma-resize", run: RUN, kind: "page", page: { id: page.id, name: page.name }, total: boards.length,
  offset: OFFSET, next: OFFSET + LIMIT < boards.length ? OFFSET + LIMIT : null, clones: created.length, leftover, ms: Date.now() - t0, boards: rows };
