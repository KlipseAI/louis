#!/usr/bin/env node
// **보드를 늘리고 줄였을 때 제품처럼 반응하는지 재는 탐침 — 시험용 복제본을 만들고 끝에 지운다(2026-10-08).**
//
// 왜 있나: 기존 게이트는 측정 폭(1920 · 402)에서의 위치만 본다. 소유자가 「Figma 100%」에 «프레임을 늘리고
// 줄였을 때 제품처럼 반응»을 넣었고, 메인 세션이 손으로 시험했더니 요금 데스크톱 1440 에서 고정 상단 바가
// 1920 에 묶여 오른쪽이 잘리고(넘친 노드 26), /archive 를 높이 1400 으로 늘리면 보드 루트(세로 HUG)가
// 1080 에 묶여 아래가 빈 회색이었다. 그 손 시험을 기계로 만든 것이다.
//
// 러너가 하는 일(페이지 하나 · 보드 조각 하나 = use_figma 한 호출):
//   - 원본 페이지는 `getNodeByIdAsync` + `loadAsync` 로 읽기만 한다(`setCurrentPageAsync` 는 작업 페이지에 한 번).
//   - 보드(이름 `^(desktop|mobile) \d+×\d+ — `)를 시험 크기마다 하나씩 작업 페이지 「작업 · DS 정리 검토」의
//     먼 좌표(x ≥ 100000)에 복제하고, 크기를 바꾸고, 센 다음 **바로 지운다**(try/finally — 끝에서 한 번 더 쓸어 담는다).
//     원본 보드에는 `clone()` 말고 아무것도 부르지 않는다.
//   - 시험 크기: 데스크톱 폭 1440 · 2560 · 높이 +30%, 모바일 폭 360 · 430 · 높이 +30%.
//   - 센다: ① 보드 왼쪽 · 오른쪽 밖으로 나간 보이는 노드(조상 클립을 적용한 보이는 범위로) — 수 · 뿌리 수
//     (부모는 안 넘쳤는데 자기가 넘친 노드) · 최악 5개(이름 · 넘친 px), ② 부모 상자 밖으로 나간 자식 수와
//     그중 원래 크기에서는 안 나갔던 것(new), ③ 보드 루트(`generated/…`, 없으면 가장 큰 보이는 자식)의
//     폭 · 높이 / 보드 폭 · 높이, ④ 고정 폭 글자(textAutoResize ≠ WIDTH_AND_HEIGHT)가 부모보다 넓은 것과
//     그중 new. ②④ 의 new 는 같은 보드의 첫 복제본을 크기 바꾸기 전에 잰 집합(자식 순번 경로)과 맞댄다.
//
// 사용:
//   1) 러너 쓰기:  node scripts/build-figma-resize-probe.mjs code <run>
//      → figma/resize-probe.<페이지>.<offset>.draw.js 를 CHUNKS 대로 쓴다. 각 파일을 use_figma(fileKey
//        OlYKERKOkgbxBEEoXGZW2c)로 보낸다. 응답의 next 가 null 이 아닌데 다음 조각 파일이 없으면 CHUNKS 를 고친다.
//   2) 병합:  node scripts/build-figma-resize-probe.mjs merge <run> <transcript.jsonl|dir>...
//      → 기록 속 `"probe":"figma-resize"` + 같은 run 의 응답만 모아 figma/resize-check.json 을 다시 쓴다.
//        응답을 손으로 옮기지 않는다(유니코드가 전송 중 바뀐다 — figma-live-assets-probe 와 같은 길).
//        보낸 code 도 같은 기록에서 꺼내 러너 파일과 맞댄다(다르면 멈춘다).
//   3) 페이지만 다시 재기(2026-10-14):  code <run> --pages 01-public · merge <run> --pages 01-public <기록>...
//      → 그 페이지의 조각만 쓰고, merge 는 그 페이지만 새 응답으로 바꾸고 나머지 페이지는 원장에 있던 것을 그대로 둔다.
//        페이지마다 잰 run 은 `pageRuns` 에 남는다(원장의 `run` 은 마지막으로 merge 한 run). 다른 페이지를 건드리지 않고
//        고친 보드가 있는 페이지만 다시 잴 때 쓴다 — 동시에 다른 작업이 보낸 보드가 기준선에 섞여 들어오지 않게.
//   판정은 scripts/check-figma-resize.mjs 가 한다.
//
// **원인 노드 이름(2026-10-15).** 전에는 부모 밖(pn) · 글자 잘림(tn) · 루트 미추종이 수만 남아 원인을 찾으려면 Figma 를 다시 뒤져야 했다
// (넘침 o 만 `top` 에 [이름, px] 가 남았다). 이제 시험(`v.<키>`)마다 원인 노드를 원장에 함께 남긴다 — 모두 이름은 40자(top 은 48자)로 자른다.
//   top  넘침 최악 5개 [이름, 보드 밖으로 넘친 px, 노드 id]   (id 는 세 번째 칸에 덧붙었다 — 옛 [이름, px] 읽기는 그대로 된다)
//   pc   pn>0 일 때, 새로 부모 밖으로 나간 자식 중 넘침이 큰 순 상위 3개 [이름, 노드 id, 부모 밖으로 넘친 px]
//   tc   tn>0 일 때, 새로 부모보다 넓어진 고정 폭 글자 상위 3개 [이름, 노드 id, 부모보다 넓은 px]
//   rc   h130 에서 rh<0.99 · 폭 시험에서 rw<0.99 일 때 루트 [이름, 노드 id] (heightFollow · widthFollow 의 원인 — 보드당 하나라 노드는 하나)
// 칸이 없으면 «원인 없음»이 아니라 «옛 run 이라 기록 안 됨»이다 — 게이트의 실패 수는 pn · tn · rh · rw 로만 센다(칸을 읽지 않는다).
// 이름 없는 유형 중 clamped(보드 자체)와 noRoot(보이는 자식이 없다)는 보드 id 로 충분해 덧붙이지 않았다.
// **크기**: use_figma 한도는 50,000 문자(String.length)다 — 러너 코드는 5556 → 6,255 문자(실측, 한도의 13%)라 한도와 멀다. 늘어나는 것은 응답이다:
// 원장(212보드)의 실패 수로 어림하면 부모 밖 81시험 · 137원인, 글자 잘림 1시험, 루트 미추종 25시험, top 39칸에 id 가 붙어 응답 합계 약 +13KB(원장 103KB → 약 116KB).
// 가장 큰 조각(03-app offset 56)이 약 13.3KB → 약 15.6KB 이고, 시험이 실패하지 않으면 한 바이트도 늘지 않는다(칸을 빼고 쓴다).
//
// **문서 뿌리의 세로 길어짐은 부모 밖이 아니다(2026-10-14).** 보드의 세로 HUG 자식(문서 길이 보드의 뿌리)이 폭 시험에서 줄이 늘어
// 보드 아래로 길어지면 전에는 부모 밖(pn)으로 셌다 — 랜딩 모바일 360 에서 FAQ 답 · 푸터 링크가 한 줄씩 늘어 뿌리가 보드보다 32 길어졌다.
// 제품 문서도 그렇게 길어진다(DS-D-0098 의 문서 보드 예외와 같은 이유). 보드 바로 아래 HUG 자식은 아래쪽 넘침을 세지 않는다 — 위 · 옆은 그대로 센다.
import { createHash } from "node:crypto";
import { readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const FILE_KEY = "OlYKERKOkgbxBEEoXGZW2c";
const MARK = "figma-resize";
const WORK_PAGE_ID = "699:2"; // 작업 · DS 정리 검토
const LEDGER = "figma/resize-check.json";

// 페이지 · 조각. limit 은 한 호출이 무겁지 않게(응답 요약 · 실행 시간) 고른 보드 수다.
const PAGES = [
  { slug: "01-public", id: "246:3447", limit: 10 },
  { slug: "02-auth", id: "246:3448", limit: 18 },
  { slug: "03-app", id: "246:3449", limit: 28 },
  { slug: "04-billing", id: "246:3450", limit: 17 },
  { slug: "05-ops", id: "246:3451", limit: 14 },
];
// 페이지별 보드 수(2026-10-08 실측). 조각 파일을 이만큼 덮게 쓴다 — 응답의 total 이 다르면 merge 가 멈춘다.
// 2026-10-14: 01-public 20 → 24 — /models · /models/[slug] 보드 넷(데스크톱 · 모바일)이 섰다.
// 2026-10-15: 05-ops 14 → 48 — 다른 작업이 「/admin?view= · 어드민 탭」 레시피 측정 보드 서른넷(3521:225 ~ 258, 아직 빈 틀)을 세웠다.
// 2026-10-15: 03-app 56 → 88 — 분석 연결 상태 열여덟 · 편집기 · 캔버스 패널 상태 열넷(밤 작업 합본).
const BOARD_COUNT = { "246:3447": 24, "246:3448": 18, "246:3449": 88, "246:3450": 34, "246:3451": 48 };

function fail(message) {
  console.error(`[figma-resize-probe] ${message}`);
  process.exit(1);
}

// slot: 조각마다 다른 x 칸(나란히 보내도 복제본이 겹치지 않게). 한 칸 폭은 가장 넓은 시험 폭 2560 보다 넉넉히.
function runnerCode(run, pageId, offset, limit, slot) {
  return `// 시험용 복제본, 끝에 지움 — 보드 반응 탐침(scripts/build-figma-resize-probe.mjs 가 쓴다). 원본 보드는 복제만 한다.
const RUN = ${JSON.stringify(run)}, PAGE_ID = ${JSON.stringify(pageId)}, OFFSET = ${offset}, LIMIT = ${limit}, SLOT = ${slot};
const RE = /^(desktop|mobile) \\d+×\\d+ — /;
const work = await figma.getNodeByIdAsync(${JSON.stringify(WORK_PAGE_ID)});
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
      const dy = Math.max(documentRoot ? 0 : bb.y + bb.height - (pb.y + pb.height), pb.y - bb.y);
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
`;
}

function chunkFiles(only = null) {
  const files = [];
  for (const { slug, id, limit } of PAGES) {
    if (only && !only.includes(slug)) continue;
    for (let offset = 0; offset < BOARD_COUNT[id]; offset += limit) {
      files.push({ slug, id, offset, limit, slot: files.length, path: `figma/resize-probe.${slug}.${String(offset).padStart(2, "0")}.draw.js` });
    }
  }
  return files;
}

function* jsonlFiles(paths) {
  for (const p of paths) {
    const st = statSync(p);
    if (st.isDirectory()) {
      for (const name of readdirSync(p)) {
        const full = join(p, name);
        if (name.endsWith(".jsonl")) yield full;
        else if (statSync(full).isDirectory()) yield* jsonlFiles([full]);
      }
    } else yield p;
  }
}

function* markedStrings(value) {
  if (typeof value === "string") {
    if (value.includes(`"probe":"${MARK}"`)) yield value;
  } else if (Array.isArray(value)) {
    for (const v of value) yield* markedStrings(v);
  } else if (value && typeof value === "object") {
    for (const v of Object.values(value)) yield* markedStrings(v);
  }
}

function parseProbe(text) {
  const start = text.indexOf("{");
  if (start < 0) return null;
  for (let end = text.lastIndexOf("}"); end > start; end = text.lastIndexOf("}", end - 1)) {
    try {
      const obj = JSON.parse(text.slice(start, end + 1));
      if (obj && obj.probe === MARK) return obj;
    } catch {}
  }
  return null;
}

const sha = (s) => createHash("sha256").update(s).digest("hex");

function merge(run, paths, only = null) {
  const sent = new Map(); // tool_use id → code
  const found = []; // { obj, toolUseId }
  for (const file of jsonlFiles(paths)) {
    for (const line of readFileSync(file, "utf8").split("\n")) {
      if (!line.includes(run)) continue;
      let rec;
      try { rec = JSON.parse(line); } catch { continue; }
      const content = rec?.message?.content;
      if (!Array.isArray(content)) continue;
      for (const block of content) {
        if (block.type === "tool_use" && typeof block.input?.code === "string" && block.input.code.includes("보드 반응 탐침")) {
          sent.set(block.id, block.input.code);
        }
        if (block.type === "tool_result" && rec.type === "user") {
          for (const s of markedStrings(block.content)) {
            const obj = parseProbe(s);
            if (obj && obj.run === run) found.push({ obj, toolUseId: block.tool_use_id });
          }
        }
      }
    }
  }
  if (found.length === 0) fail(`run ${run} 의 응답이 기록에 없습니다`);
  const files = chunkFiles(only);
  const byKey = new Map();
  for (const f of found) byKey.set(`${f.obj.page.id}@${f.obj.offset}`, f); // 같은 조각을 두 번 떴으면 나중 것
  const previous = only ? JSON.parse(readFileSync(resolve(repoRoot, LEDGER), "utf8")) : null;
  const ledger = { fileKey: FILE_KEY, run, source: "scripts/build-figma-resize-probe.mjs (시험용 복제본, 끝에 지움)", mergedAt: new Date().toISOString(), sizes: { desktop: ["w1440", "w2560", "h130"], mobile: ["w360", "w430", "h130"] }, pageRuns: {}, pages: [] };
  const report = [];
  for (const { slug, id } of PAGES) {
    if (only && !only.includes(slug)) {
      const kept = previous.pages.find((page) => page.slug === slug);
      if (!kept) fail(`${slug}: 원장에 없는 페이지는 남길 수 없습니다 — --pages 에 넣어 잰다`);
      ledger.pages.push(kept);
      ledger.pageRuns[slug] = previous.pageRuns?.[slug] ?? previous.run;
      report.push(`${slug}: 그대로(${ledger.pageRuns[slug]})`);
      continue;
    }
    ledger.pageRuns[slug] = run;
    const chunks = files.filter((f) => f.id === id);
    const boards = [];
    let pageName = null;
    for (const chunk of chunks) {
      const hit = byKey.get(`${id}@${chunk.offset}`);
      if (!hit) fail(`${slug} offset ${chunk.offset} 응답이 없습니다 — ${chunk.path} 를 보낸다`);
      const code = sent.get(hit.toolUseId);
      if (code === undefined) fail(`${slug} offset ${chunk.offset}: 보낸 code 를 기록에서 찾지 못했습니다`);
      const file = readFileSync(resolve(repoRoot, chunk.path), "utf8");
      if (sha(code) !== sha(file) && sha(code.trimEnd()) !== sha(file.trimEnd())) fail(`${chunk.path}: 보낸 code 가 러너 파일과 다릅니다(sha 불일치) — 다시 쓰고 보낸다`);
      const o = hit.obj;
      if (o.total !== BOARD_COUNT[id]) fail(`${slug}: 보드 ${o.total} ≠ 기대 ${BOARD_COUNT[id]} — BOARD_COUNT 를 고치고 러너를 다시 쓴다`);
      if (o.leftover !== 0) fail(`${slug} offset ${chunk.offset}: 복제본 ${o.leftover}개가 남았다 — 작업 페이지에서 「시험용 복제본」 을 지운다`);
      pageName = o.page.name;
      boards.push(...o.boards);
    }
    if (boards.length !== BOARD_COUNT[id]) fail(`${slug}: 보드 ${boards.length} ≠ ${BOARD_COUNT[id]}`);
    ledger.pages.push({ slug, id, name: pageName, boards });
    // 원인 이름이 실제로 실려 왔는지 센다 — 옛 러너 응답이면 부모 밖 시험 중 이름이 있는 수가 0 으로 보인다(조용히 빈 채 병합되지 않게).
    let pnTests = 0, pnNamed = 0;
    for (const b of boards) for (const v of Object.values(b.v ?? {})) if (v.pn > 0) { pnTests++; if (Array.isArray(v.pc) && v.pc.length > 0) pnNamed++; }
    report.push(`${slug}: 보드 ${boards.length}${pnTests ? ` · 부모 밖 시험 ${pnTests} 중 원인 이름 ${pnNamed}` : ""}`);
  }
  // 보드 한 장 = 한 줄(diff 가 보드 단위로 읽히게).
  const text = JSON.stringify({ ...ledger, pages: "__PAGES__" }, null, 1).replace(
    '"__PAGES__"',
    "[\n" + ledger.pages.map((pg) => {
      const head = JSON.stringify({ slug: pg.slug, id: pg.id, name: pg.name });
      return ` ${head.slice(0, -1)}, "boards": [\n` + pg.boards.map((b) => `  ${JSON.stringify(b)}`).join(",\n") + "\n ]}";
    }).join(",\n") + "\n]",
  );
  JSON.parse(text);
  writeFileSync(resolve(repoRoot, LEDGER), text + "\n", "utf8");
  console.log(report.join(" · "));
  console.log(`[figma-resize-probe] → ${LEDGER}`);
}

const [cmd, run, ...args] = process.argv.slice(2);
const pagesAt = args.indexOf("--pages");
const only = pagesAt >= 0 ? String(args[pagesAt + 1] ?? "").split(",").filter(Boolean) : null;
const rest = pagesAt >= 0 ? args.filter((_, index) => index !== pagesAt && index !== pagesAt + 1) : args;
if (only) for (const slug of only) if (!PAGES.some((page) => page.slug === slug)) fail(`알 수 없는 페이지: ${slug}`);
if (!cmd || !run) fail("사용법: code <run> [--pages a,b] | merge <run> [--pages a,b] <jsonl|dir>...");
if (cmd === "code") {
  for (const f of chunkFiles(only)) {
    writeFileSync(resolve(repoRoot, f.path), runnerCode(run, f.id, f.offset, f.limit, f.slot), "utf8");
    console.log(`${f.path}  (${f.slug} offset ${f.offset} limit ${f.limit})`);
  }
} else if (cmd === "merge") {
  if (rest.length === 0) fail("merge 에는 기록 경로가 필요합니다");
  merge(run, rest, only);
} else fail(`알 수 없는 명령: ${cmd}`);
