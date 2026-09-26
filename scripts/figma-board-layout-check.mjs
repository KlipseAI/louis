#!/usr/bin/env node
// **화면 보드의 이름 · 배치 · 라우트 색인을 조립 규칙대로 센다(20조 · 23조).**
//
// ## 왜 있는가
//
// 조립 규칙 11절 표는 23조를 「프레임 이름을 파싱해 (a) 파싱 실패 0 (b) 이름의 W×H 와 실제 크기 불일치 0
// (c) 상태 판정 빈칸 0 을 센다」고 적었지만, 그것을 세는 스크립트가 없었다. 2026-09-26 에 다섯 화면 페이지를
// 떠 보니 보드 107 장 가운데 30 장이 어긋나 있었다 — 괄호 없는 이름 6 · 옛 캡처 높이를 단 hug 보드 9 ·
// 그린 상태가 아니라 라우트의 의도를 적은 결제 결과 14 · 반올림 1. 라우트 색인(START HERE 00.2)은 보드 이름을
// 옮겨 적은 사본이라 더 낡아 있었다 — 52 칸이 보드와 달랐다. 배치 산식(20조)도 세는 것이 없어 하이라이트
// 섹션이 자란 뒤 아래 섹션이 2580 겹친 채 남아 있었다.
//
// ## 무엇을 세는가
//
//   이름   `<viewport> <W>×<H> — <route> (<상태>)` 파싱 실패 · W×H ≠ 실제 크기(반올림) · 상태 빈칸
//   배치   허용 x 8 개 밖 · rowTop 산식 · 섹션 높이 산식 · 섹션 간격 800 · 섹션 밖 페이지 자식
//   색인   (선택) START HERE 라우트 색인의 행마다 W×H · 상태 · 등급 칸이 보드 이름 · 커버리지 JSON 과 같은가
//
// ## 쓰는 법 — CI 에 넣지 않는다(Figma 접근이 필요하다). verify 목록에도 넣지 않는다.
//
//   node scripts/figma-board-layout-check.mjs --emit <PAGE_ID>        # 읽기 전용 탐침 코드(페이지 하나)
//   node scripts/figma-board-layout-check.mjs --emit-index            # 라우트 색인 탐침 코드(두 조각)
//   node scripts/figma-board-layout-check.mjs --check <page.json …> [--index <index.json …>]
//
// 탐침은 `setCurrentPageAsync` 를 한 번만 부른다(figma-use 규칙) — 페이지마다 따로 돌리고 결과를 모두 준다.
// 반환은 `{__fnv, __len, result}` 모양이라 세션 기록에서 손대지 않고 꺼낼 수 있다(손으로 옮기지 않는다).
// `--check` 는 화면 페이지 다섯(01~05)이 **모두** 있어야 통과한다 — 일부만 주면 빠진 페이지를 대고 멈춘다.
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const SCREEN_PAGES = {
  "246:3447": "01", "246:3448": "02", "246:3449": "03", "246:3450": "04", "246:3451": "05",
};
const INDEX_FRAME = "266:2";
const ALLOWED_X = [160, 2160, 2960, 4960, 5760, 7760, 8560, 10560];
const ROW_TOP_0 = 240, ROW_GUT = 600, SEC_PAD_BOT = 200, SEC_GAP_Y = 800;
const ceil100 = (value) => Math.ceil(value / 100) * 100;
// 상태 보드 — 제품의 개발 전용 후크(`?__phase=` · `?preview=`)로 연 상태. 라우트 색인 항목이 아니라 검산식의 「상태 프레임」이다.
const STATE_BOARD = /개발용 \S+ 후크/;

const args = process.argv.slice(2);
const die = (message) => {
  process.stderr.write(`[figma-board-layout] ${message}\n`);
  process.exit(2);
};

const WRAP = `
const __text = JSON.stringify(result);
let __h = 0x811c9dc5;
for (let i = 0; i < __text.length; i += 1) { __h ^= __text.charCodeAt(i); __h = Math.imul(__h, 0x01000193) >>> 0; }
return { __fnv: __h.toString(16).padStart(8, "0"), __len: __text.length, result };`;

if (args[0] === "--emit") {
  const pageId = args[1];
  if (!SCREEN_PAGES[pageId]) die(`화면 페이지 id 가 아닙니다: ${pageId} (${Object.keys(SCREEN_PAGES).join(" · ")})`);
  process.stdout.write(`// 읽기 전용 — figma-board-layout-check 탐침(페이지 ${SCREEN_PAGES[pageId]})
const page = await figma.getNodeByIdAsync(${JSON.stringify(pageId)});
await figma.setCurrentPageAsync(page);
const result = { kind: "figma-board-layout", page: page.id, name: page.name, loose: [], sections: [] };
for (const s of page.children) {
  if (s.type !== "SECTION") { result.loose.push({ id: s.id, type: s.type, name: s.name }); continue; }
  result.sections.push({
    id: s.id, name: s.name, x: s.x, y: s.y, w: s.width, h: s.height,
    frames: s.children.filter((c) => c.type === "FRAME").map((c) => [c.id, c.name, Math.round(c.width), Math.round(c.height), c.x, c.y]),
  });
}${WRAP}
`);
  process.exit(0);
}
if (args[0] === "--emit-index") {
  // 색인은 글자가 많아 응답 상한(20KB)에 걸린다 — 두 조각으로 뜬다.
  for (const [from, to] of [[0, 31], [31, 1000]]) {
    process.stdout.write(`// ---- 조각 ${from}~ ----
// 읽기 전용 — figma-board-layout-check 색인 탐침
const idx = await figma.getNodeByIdAsync(${JSON.stringify(INDEX_FRAME)});
await figma.setCurrentPageAsync(idx.parent);
const rows = idx.children.slice(${from}, ${to}).map((row) => ({
  id: row.id, type: row.type, name: row.name,
  cells: row.type === "TEXT" ? [[row.id, row.characters]] : ("children" in row ? row.children.filter((c) => c.type === "TEXT").map((c) => [c.id, c.characters]) : []),
}));
const result = { kind: "figma-board-layout-index", id: idx.id, name: idx.name, total: idx.children.length, from: ${from}, rows };${WRAP}
`);
  }
  process.exit(0);
}
if (args[0] !== "--check") die("쓰는 법: --emit <PAGE_ID> | --emit-index | --check <page.json …> [--index <index.json …>]");

const pageFiles = [];
const indexFiles = [];
let into = pageFiles;
for (const arg of args.slice(1)) {
  if (arg === "--index") { into = indexFiles; continue; }
  if (arg.startsWith("--")) die(`알 수 없는 인자입니다: ${arg}`);
  into.push(arg);
}
const load = (file) => {
  const raw = JSON.parse(readFileSync(file, "utf8"));
  return raw.result && raw.__fnv ? raw.result : raw;
};
const pages = pageFiles.map(load);
for (const page of pages) if (page.kind !== "figma-board-layout" && !page.sections) die(`페이지 탐침 결과가 아닙니다: ${page.page ?? "?"}`);
const seen = new Set(pages.map((page) => page.page));
const missing = Object.keys(SCREEN_PAGES).filter((id) => !seen.has(id));
if (missing.length) die(`화면 페이지가 빠졌습니다: ${missing.map((id) => SCREEN_PAGES[id]).join(" · ")} — 다섯 페이지를 모두 줍니다.`);

const problems = [];
const report = (where, what) => problems.push(`${where} — ${what}`);
const NAME = /^(desktop|mobile) (\d+)×(\d+) — (\S+) \((.+)\)$/;
const boards = [];
for (const page of pages) {
  const tag = SCREEN_PAGES[page.page];
  for (const loose of page.loose ?? []) report(`${tag} ${loose.id}`, `섹션 밖 페이지 자식 ${loose.type} 「${loose.name}」`);
  const sections = page.sections.filter((s) => !s.loose).sort((a, b) => a.y - b.y);
  let expectedY = sections.length ? sections[0].y : 0;
  if (sections.length && sections[0].y !== 0) report(`${tag} ${sections[0].id}`, `첫 섹션 y ${sections[0].y} ≠ 0`);
  for (const section of sections) {
    const where = `${tag} ${section.id}`;
    if (section.y !== expectedY) report(where, `섹션 y ${section.y} ≠ 산식 ${expectedY}(앞 섹션 바닥 + ${SEC_GAP_Y})`);
    const frames = section.frames ?? [];
    const ys = [...new Set(frames.map((f) => f[5]))].sort((a, b) => a - b);
    let top = ROW_TOP_0, lastTop = ROW_TOP_0, lastMax = 0;
    for (const y of ys) {
      const row = frames.filter((f) => f[5] === y);
      if (y !== top) report(where, `행 y ${y} ≠ rowTop 산식 ${top} (${row.map((f) => f[0]).join(", ")})`);
      lastTop = y;
      lastMax = Math.max(...row.map((f) => f[3]));
      top = y + ceil100(lastMax) + ROW_GUT;
    }
    const expectedH = frames.length ? lastTop + ceil100(lastMax) + SEC_PAD_BOT : section.h;
    if (Math.abs(section.h - expectedH) > 0.01) report(where, `섹션 높이 ${section.h} ≠ 산식 ${expectedH}`);
    expectedY = section.y + section.h + SEC_GAP_Y;
    for (const [id, name, w, h, x] of frames) {
      if (!ALLOWED_X.includes(x)) report(`${tag} ${id}`, `허용 x 밖 ${x}`);
      const m = NAME.exec(name);
      if (!m) { report(`${tag} ${id}`, `이름 문법 밖 「${name}」`); continue; }
      if (Number(m[2]) !== w || Number(m[3]) !== h) report(`${tag} ${id}`, `이름 ${m[2]}×${m[3]} ≠ 실제 ${w}×${h}`);
      if (!m[5].trim()) report(`${tag} ${id}`, "상태 판정 빈칸");
      boards.push({ id, viewport: m[1], w, h, route: m[4], state: m[5] });
    }
  }
}

let indexRows = 0;
if (indexFiles.length) {
  const parts = indexFiles.map(load).sort((a, b) => a.from - b.from);
  const rows = parts.flatMap((part) => part.rows);
  if (!parts.length || rows.length !== parts[0].total) die(`색인 조각이 모자랍니다: ${rows.length}/${parts[0]?.total}`);
  const levels = JSON.parse(readFileSync(resolve(repoRoot, "migration/product-screens/route-coverage-levels.json"), "utf8")).routes;
  const levelOf = (route) => {
    const level = levels[route]?.level;
    return level === undefined ? "—" : `L${level}`;
  };
  const byRoute = new Map();
  for (const board of boards) {
    if (STATE_BOARD.test(board.state)) continue; // 상태 보드는 색인 항목이 아니다(검산식의 「상태 프레임」)
    const entry = byRoute.get(board.route) ?? {};
    if (entry[board.viewport]) report(`색인 ${board.route}`, `같은 라우트 · 뷰포트 보드가 둘 — ${entry[board.viewport].id} · ${board.id}`);
    entry[board.viewport] = board;
    byRoute.set(board.route, entry);
  }
  const listed = new Set();
  for (const row of rows) {
    if (!row.name.startsWith("행 · ")) continue;
    indexRows += 1;
    const cells = row.cells.map(([, text]) => text);
    const route = cells[0];
    listed.add(route);
    const entry = byRoute.get(route);
    if (!entry?.desktop) continue; // 화면 페이지 밖(99 보류의 /docs)
    const expected = [route, cells[1], levelOf(route), `${entry.desktop.w}×${entry.desktop.h}`,
      entry.mobile ? `${entry.mobile.w}×${entry.mobile.h}` : "—", entry.desktop.state, entry.mobile ? entry.mobile.state : "—"];
    const labels = ["라우트", "§10.N", "등급", "데스크톱", "모바일", "데스크톱 상태", "모바일 상태"];
    expected.forEach((text, i) => {
      if (cells[i] !== text) report(`색인 ${route}`, `${labels[i]} 「${cells[i]}」 ≠ 보드 「${text}」`);
    });
  }
  for (const route of byRoute.keys()) if (!listed.has(route)) report(`색인 ${route}`, "보드는 있는데 색인 행이 없다");
}

const summary = `보드 ${boards.length} · 페이지 ${pages.length}${indexFiles.length ? ` · 색인 행 ${indexRows}` : ""}`;
if (problems.length) {
  process.stdout.write(`[figma-board-layout] 실패 ${problems.length}건 (${summary})\n${problems.map((p) => `  ${p}`).join("\n")}\n`);
  process.exit(1);
}
process.stdout.write(`[figma-board-layout] 통과 — ${summary}\n`);
