#!/usr/bin/env node
// figma/live-assets.json 을 FIGMA_ACCESS_TOKEN 없이 다시 뜨는 길(2026-10-08).
//
// 정본 생성기는 scripts/figma-sync.mjs 다 — REST `files/<key>?depth=3` 을 walk 해 페이지 · 섹션 · COMPONENT ·
// COMPONENT_SET 을 적는다. 토큰이 없을 때는 같은 walk 를 플러그인(use_figma, 읽기 전용)으로 페이지마다 돌리고,
// 그 응답을 세션 기록(jsonl)에서 꺼내 합친다. 응답을 손으로 옮기지 않는다 — 유니코드가 전송 중에 바뀐다.
//
//   1) 탐침 코드 출력:  node scripts/figma-live-assets-probe.mjs code <run> <pageId> [offset] [limit]
//      → 출력된 JS 를 use_figma(fileKey OlYKERKOkgbxBEEoXGZW2c)로 돌린다. 응답의 `next` 가 null 이 아니면
//        offset=next 로 다시 돈다(응답 하나를 20KB 아래로 — limit 기본 120).
//      페이지 목록은 `code <run> pages` 로 먼저 뜬다(같은 run 으로 합칠 때 페이지 순서 · 이름 · 파일 이름의 근거).
//   2) 병합:  node scripts/figma-live-assets-probe.mjs merge <run> <transcript.jsonl|dir>...
//      → 기록 속 `"probe":"figma-live-assets"` + 같은 run 의 응답만 모아 figma/live-assets.json 을 다시 쓴다.
//        페이지마다 조각이 0..total 을 빈틈없이 덮지 않으면 멈춘다.
//
// REST 와의 차이: `lastModified` · `version` 은 플러그인에서 얻을 수 없어 null 이다. `key` 는 REST 노드에 없어 예전
// 파일에는 빠져 있었지만 플러그인은 준다(COMPONENT 만). 깊이는 REST 의 depth=3 과 같게 자른다(문서=0, 페이지=1) —
// 그보다 깊은 컴포넌트 수는 `deeper` 로 따로 센다(파일에는 넣지 않는다).
import { readFileSync, writeFileSync, readdirSync, statSync } from "node:fs";
import { resolve, dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const FILE_KEY = "OlYKERKOkgbxBEEoXGZW2c";
const MARK = "figma-live-assets";
const MAX_DEPTH = 3; // figma-sync.mjs 의 `?depth=3`

function fail(message) {
  console.error(`[figma-live-assets-probe] ${message}`);
  process.exit(1);
}

function pagesCode(run) {
  return `return { probe: ${JSON.stringify(MARK)}, run: ${JSON.stringify(run)}, kind: "pages", fileName: figma.root.name,
  pages: figma.root.children.map((p) => ({ id: p.id, name: p.name })) };`;
}

// figma-sync.mjs 의 walk 를 그대로 옮긴다: SECTION 은 섹션 목록에 넣고 그 이름을 아래로 내린다. COMPONENT ·
// COMPONENT_SET 을 적고 그 아래로도 내려간다. REST depth=3 처럼 깊이 3 인 노드의 자식은 보지 않는다
// (그래서 깊이 3 의 세트는 variantsCount 0 — REST 가 자식을 싣지 않는 것과 같다).
function pageCode(run, pageId, offset, limit) {
  return `const MAX_DEPTH = ${MAX_DEPTH};
const page = await figma.getNodeByIdAsync(${JSON.stringify(pageId)});
if (!page || page.type !== "PAGE") throw new Error("page not found: ${pageId}");
await figma.setCurrentPageAsync(page);
const sections = [];
const entries = [];
let deeper = 0;
const deeperAssetNames = [];
function walk(node, depth, sectionIndex) {
  if (node.type === "SECTION") {
    sections.push([node.id, node.name]);
    const idx = sections.length - 1;
    if (depth < MAX_DEPTH) for (const child of node.children) walk(child, depth + 1, idx);
    else countDeeper(node);
    return;
  }
  if (node.type === "COMPONENT") {
    entries.push(["C", node.id, node.name, sectionIndex, node.key]);
  } else if (node.type === "COMPONENT_SET") {
    entries.push(["S", node.id, node.name, sectionIndex, depth < MAX_DEPTH ? node.children.length : 0]);
  }
  if ("children" in node) {
    if (depth < MAX_DEPTH) {
      for (const child of node.children) walk(child, depth + 1, sectionIndex);
    } else if (node.type !== "INSTANCE") {
      countDeeper(node);
    }
  }
}
function countDeeper(node) {
  for (const d of node.findAllWithCriteria({ types: ["COMPONENT", "COMPONENT_SET"] })) {
    deeper++;
    if (/^(logo|tile|icon|root|image|\\.glyph)\\//.test(d.name) && deeperAssetNames.length < 50) deeperAssetNames.push(d.id + " " + d.name);
  }
}
walk(page, 1, null);
const offset = ${offset}, limit = ${limit};
const slice = entries.slice(offset, offset + limit);
return { probe: ${JSON.stringify(MARK)}, run: ${JSON.stringify(run)}, kind: "page", page: { id: page.id, name: page.name },
  maxDepth: MAX_DEPTH, total: entries.length, offset, next: offset + limit < entries.length ? offset + limit : null,
  sections: offset === 0 ? sections : null, deeper: offset === 0 ? deeper : null, deeperAssetNames: offset === 0 ? deeperAssetNames : null,
  entries: slice };`;
}

function* jsonlFiles(paths) {
  for (const p of paths) {
    const st = statSync(p);
    if (st.isDirectory()) {
      for (const name of readdirSync(p)) if (name.endsWith(".jsonl")) yield join(p, name);
    } else yield p;
  }
}

// 기록의 어느 깊이에 있든 표식이 든 문자열을 찾아 JSON 으로 읽는다.
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
  // 응답 뒤에 다른 글이 붙어 있을 수 있어 끝에서부터 닫는 괄호를 줄여 가며 읽는다.
  for (let end = text.lastIndexOf("}"); end > start; end = text.lastIndexOf("}", end - 1)) {
    try {
      const obj = JSON.parse(text.slice(start, end + 1));
      if (obj && obj.probe === MARK) return obj;
    } catch {}
  }
  return null;
}

function merge(run, paths) {
  const found = [];
  for (const file of jsonlFiles(paths)) {
    for (const line of readFileSync(file, "utf8").split("\n")) {
      if (!line.includes(MARK) || !line.includes(run)) continue;
      let rec;
      try { rec = JSON.parse(line); } catch { continue; }
      // 탐침 코드(도구 호출 인자)가 아니라 응답(tool_result)만 본다.
      if (rec.type !== "user") continue;
      for (const s of markedStrings(rec.message ?? rec)) {
        const obj = parseProbe(s);
        if (obj && obj.run === run) found.push(obj);
      }
    }
  }
  const pagesProbe = found.filter((o) => o.kind === "pages").at(-1);
  if (!pagesProbe) fail(`run ${run} 의 pages 응답이 기록에 없습니다`);
  const byPage = new Map();
  for (const o of found.filter((o) => o.kind === "page")) {
    if (!byPage.has(o.page.id)) byPage.set(o.page.id, new Map());
    byPage.get(o.page.id).set(o.offset, o); // 같은 조각을 두 번 떴으면 나중 것
  }
  const manifest = {
    fileKey: FILE_KEY,
    name: pagesProbe.fileName,
    lastModified: null,
    version: null,
    source: "plugin probe (figma-sync.mjs walk 와 같은 모양)",
    fetchedAt: new Date().toISOString(),
    pages: [],
    components: {},
    componentSets: {},
  };
  const report = [];
  for (const { id, name } of pagesProbe.pages) {
    const chunks = byPage.get(id);
    if (!chunks || !chunks.has(0)) fail(`페이지 ${id} «${name}» 의 첫 조각(offset 0)이 없습니다`);
    const first = chunks.get(0);
    if (first.page.name !== name) fail(`페이지 ${id} 이름이 pages 응답과 다릅니다: «${first.page.name}» ≠ «${name}»`);
    const entries = [];
    for (let off = 0; off !== null; ) {
      const c = chunks.get(off);
      if (!c) fail(`페이지 ${id} «${name}» 의 조각 offset ${off} 가 없습니다`);
      if (c.total !== first.total) fail(`페이지 ${id} 조각들의 total 이 다릅니다(${c.total} ≠ ${first.total}) — 그 사이 파일이 바뀌었다, 다시 떠라`);
      entries.push(...c.entries);
      off = c.next;
    }
    if (entries.length !== first.total) fail(`페이지 ${id} 항목 ${entries.length} ≠ total ${first.total}`);
    const sections = first.sections.map(([sid, sname]) => ({ id: sid, name: sname, items: [] }));
    manifest.pages.push({ id, name, sections });
    for (const [type, nid, nname, si, extra] of entries) {
      const section = si === null ? null : first.sections[si][1];
      if (type === "C") manifest.components[nid] = { id: nid, name: nname, page: name, section, key: extra };
      else manifest.componentSets[nid] = { id: nid, name: nname, page: name, section, variantsCount: extra };
    }
    report.push(`${name}: 섹션 ${sections.length} · 항목 ${entries.length} · 깊이 ${first.maxDepth} 아래 ${first.deeper}`);
    for (const n of first.deeperAssetNames ?? []) report.push(`  (깊이 밖 자산 이름) ${n}`);
  }
  const outPath = resolve(repoRoot, "figma/live-assets.json");
  writeFileSync(outPath, JSON.stringify(manifest, null, 2) + "\n", "utf8");
  console.log(report.join("\n"));
  console.log(`[figma-live-assets-probe] components ${Object.keys(manifest.components).length} · componentSets ${Object.keys(manifest.componentSets).length} → figma/live-assets.json`);
}

const [cmd, run, ...rest] = process.argv.slice(2);
if (!cmd || !run) fail("사용법: code <run> pages | code <run> <pageId> [offset] [limit] | merge <run> <jsonl|dir>...");
if (cmd === "code") {
  const [pageId, offset = "0", limit = "120"] = rest;
  if (!pageId) fail("pageId 가 필요합니다(또는 pages)");
  process.stdout.write(pageId === "pages" ? pagesCode(run) : pageCode(run, pageId, Number(offset), Number(limit)));
  process.stdout.write("\n");
} else if (cmd === "merge") {
  if (!rest.length) fail("기록 파일이나 폴더를 주세요");
  merge(run, rest);
} else fail(`모르는 명령 ${cmd}`);
