#!/usr/bin/env node
// **살아 있는 Figma 화면 보드 ↔ 앱 화면 계획(`figma/app-screens.*`) 대조.**
//
// ## 왜 있는가
//
// 화면 보드를 지키는 게이트(`check-figma-app-screens` · `verify-figma-board-composition` ·
// `check-figma-board-composition`)는 전부 **계획 파일만** 읽는다. 러너가 생성물과 같은지, 원장이
// 러너와 같은지는 잠그지만 «라이브 보드가 러너를 적용한 결과인가»는 한 글자도 보지 않는다.
// 그래서 2026-09-13 조사에서 드러난 상태 — 36 보드 중 34 가 옛 커밋 9f8483a 의 계획으로 그려져 있고
// archive 두 보드는 어느 커밋과도 같지 않다 — 를 어떤 게이트도 말해 주지 않았다.
// `figma-live-check.mjs` 는 `DS · Components` 페이지만 보므로 이 공백을 메우지 못한다.
//
// ## 무엇을 대조하는가 (보드마다)
//
//   1. generated 서브트리의 DFS 「유형:이름」 FNV-1a 해시와 노드 수. 인스턴스 안으로는 내려가지 않는다.
//      기대값은 draw.js payload 를 조각 순서대로 이어 붙여 **렌더러와 같은 규칙으로** 이름을 지어 낸다
//      (`scripts/templates/figma-app-screens-renderer.js` 의 `buildNode` 이름 규칙).
//   2. 인스턴스 — 세트 · variant · TEXT 속성 값 · visible. 기대값은 payload 의 `i` 칸이다.
//   3. 보드 프레임의 직계 자식 — `generated/<route> <문맥>` 하나와 숨긴 `legacy/<route>` 그룹(있으면)
//      밖의 자식, 반쯤 적용된 `pending` 자리표시, 보이는 legacy 그룹.
//   `--sets` 는 계획이 쓰는 세트·variant·TEXT 속성이 파일에 있는지(적용 전 점검)를 본다.
//
// ## 쓰는 법 — CI 에 넣지 않는다(Figma 접근이 필요하다). verify 목록에도 넣지 않는다.
//
//   node scripts/figma-screens-live-check.mjs --emit [--page <PAGE_ID>] [--only <부분문자열>] [--detail]
//   node scripts/figma-screens-live-check.mjs --emit --sets --page <PAGE_ID>
//   node scripts/figma-screens-live-check.mjs --check <live.json> [<live2.json> …] [--ref <커밋>]
//
// `--emit` 이 낸 코드를 **읽기 전용** `use_figma` 로 실행하고, 돌려받은 JSON 을 파일로 저장해
// `--check` 에 준다. 탐침은 `setCurrentPageAsync` 를 **한 번만** 부른다(figma-use 규칙) — 보드는
// 페이지 둘에 흩어져 있으므로 `--page` 를 바꿔 두 번 뜨고, `--check` 에 결과 파일을 모두 준다.
// `--page` 가 없으면 첫 보드의 페이지를 쓰고, 다른 페이지의 보드는 `elsewhere` 로 돌려준다.
// `--only` 는 route·문맥·frameId 부분문자열로 보드를 좁혀 응답 크기를 줄인다. `--detail` 은 이름 목록을
// 통째로 돌려받아 `--check` 가 첫 차이 줄을 찍게 한다(보드 몇 장에만 쓴다 — 응답이 커진다).
// `--ref <커밋>` 은 기대값을 작업 트리 대신 그 커밋의 러너에서 계산한다 — 라이브가 어느 계획으로
// 그려졌는지 가려낼 때 쓴다.
//
// 어긋나면 보드 단위로 무엇이 다른지 찍고 종료 코드 1 을 낸다. **적용 전에는 다른 것이 정상이다** —
// 그때 출력은 「적용하면 무엇이 바뀌는가」의 목록이다. 적용 뒤에 다시 돌려 0 이 되어야 한다.
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const PLAN = "figma/app-screens.plan.json";
const args = process.argv.slice(2);
const option = (name) => {
  const at = args.indexOf(name);
  return at >= 0 && args[at + 1] && !args[at + 1].startsWith("--") ? args[at + 1] : null;
};
const ref = option("--ref");
const readRepo = (path) => (ref
  ? execFileSync("git", ["-C", repoRoot, "show", `${ref}:${path}`], { encoding: "utf8", maxBuffer: 1 << 28 })
  : readFileSync(resolve(repoRoot, path), "utf8"));
const fail = (message) => {
  process.stderr.write(`[figma-screens-live] ${message}\n`);
  process.exit(2);
};

const fnv = (text) => {
  let hash = 0x811c9dc5;
  for (let index = 0; index < text.length; index += 1) {
    hash ^= text.charCodeAt(index);
    hash = Math.imul(hash, 0x01000193) >>> 0;
  }
  return hash.toString(16).padStart(8, "0");
};

/** 라벨 칸(`i[2]`) → 레이어 이름 꼬리. 렌더러 `buildNode` 와 같은 규칙이다. */
const labelSuffix = (label) => {
  if (label == null) return "";
  if (typeof label === "object") return ` · ${Object.values(label).filter((value) => value != null).join(" / ")}`;
  return ` · ${label}`;
};

/** 계획 러너에서 보드별 기대값을 만든다. */
function expectedBoards() {
  const plan = JSON.parse(readRepo(PLAN));
  const boards = [];
  for (const runner of plan.runners ?? []) {
    const payloads = runner.files.map(({ file }) => {
      const line = readRepo(file).split("\n").find((entry) => entry.startsWith("const P="));
      if (!line) fail(`러너에 payload 가 없습니다: ${file}`);
      return JSON.parse(line.slice("const P=".length, -1));
    });
    const headPayload = payloads.find((payload) => payload.head) ?? fail(`조각 00 이 없습니다: ${runner.route} ${runner.context}`);
    const head = structuredClone(headPayload.head);
    // 조각은 파일 순서(조상 먼저)로 붙인다 — 렌더러를 번호 순서대로 돌린 결과와 같다.
    for (const payload of payloads.filter((entry) => !entry.head)) {
      let holder = head;
      for (const index of payload.path.slice(0, -1)) holder = holder.k[index];
      holder.k[payload.path.at(-1)] = payload.spec;
    }
    const generatedName = `generated/${runner.route} ${runner.context.split("-")[0]}`;
    const names = [];
    const instances = [];
    const walk = (spec, isRoot) => {
      const wantsSurface = Boolean(spec.f || spec.b || spec.d != null || spec.e);
      const textInSurface = Boolean(spec.x) && !spec.k && wantsSurface;
      const isText = Boolean(spec.x) && !spec.k && !wantsSurface;
      const type = isText ? "TEXT" : spec.i ? "INSTANCE" : "FRAME";
      const name = isRoot ? generatedName
        : spec.i ? `shell/${spec.i[0]} · ${spec.i[1]}${labelSuffix(spec.i[2])}`
          : (spec.w ? "pending " : "") + spec.t + (spec.v ? ` ${spec.v}` : "")
            + (spec.x ? ` ${String(spec.x).slice(0, 18)}` : "") + ` ${spec.s}`;
      names.push(`${type}:${name}`);
      if (type === "INSTANCE") {
        const label = spec.i[2];
        const text = label == null ? {}
          : typeof label === "object" ? Object.fromEntries(Object.entries(label).filter(([, value]) => value != null))
            : { "*": String(label) };
        // `textNames` 는 세트가 가져야 할 TEXT 속성 이름 전부다(이 variant 가 묶지 않는 것 포함).
        const textNames = label == null ? [] : typeof label === "object" ? Object.keys(label) : ["*"];
        instances.push({ set: spec.i[0], variant: spec.i[1], text, textNames });
      }
      if (textInSurface) names.push(`TEXT:text ${String(spec.x).slice(0, 18)}`);
      if (type === "INSTANCE") return;
      for (const child of spec.k ?? []) walk(child, false);
    };
    walk(head, true);
    boards.push({
      frameId: runner.frameId,
      route: runner.route,
      context: runner.context,
      generatedName,
      legacyName: `legacy/${runner.route}`,
      count: names.length,
      hash: fnv(names.join("\n")),
      names,
      instances,
    });
  }
  return boards;
}

const instanceKey = (entry) => `${entry.set} · ${entry.variant}`;
// 파이프로 받을 때 `process.exit` 가 쓰기를 자르지 않게, 쓰기가 끝난 뒤에 나간다.
const emitAndExit = (code) => process.stdout.write(code, () => process.exit(0));

if (args.includes("--emit")) {
  const boards = expectedBoards();
  const only = option("--only");
  const page = option("--page");
  if (args.includes("--sets")) {
    if (!page) fail("--sets 에는 --page <PAGE_ID> 가 필요합니다(세트는 90 · ASSETS 와 DS · Components 에 흩어져 있다).");
    const wanted = {};
    for (const board of boards) {
      for (const entry of board.instances) (wanted[entry.set] ??= new Set()).add(entry.variant);
    }
    const payload = Object.fromEntries(Object.entries(wanted).map(([set, variants]) => [set, [...variants].sort()]));
    emitAndExit(`const WANT=${JSON.stringify(payload)};
const page = await figma.getNodeByIdAsync(${JSON.stringify(page)});
if (!page || page.type !== "PAGE") throw new Error("페이지를 찾지 못했습니다: ${page}");
await figma.setCurrentPageAsync(page);
const sets = {};
for (const node of page.findAllWithCriteria({ types: ["COMPONENT_SET"] })) {
  if (!(node.name in WANT)) continue;
  const definitions = node.componentPropertyDefinitions || {};
  (sets[node.name] ??= []).push({
    id: node.id,
    variantCount: node.children.length,
    // 계획이 쓰는 variant 만 돌려준다 — Button 은 variant 가 수백 개라 응답이 불어난다.
    variants: node.children.map((child) => child.name).filter((name) => WANT[node.name].includes(name)),
    textProperties: Object.keys(definitions).filter((key) => definitions[key].type === "TEXT")
      .map((key) => key.includes("#") ? key.slice(0, key.indexOf("#")) : key),
  });
}
return { kind: "figma-screens-live-sets", page: { id: page.id, name: page.name }, sets };
`);
  } else {
    emitBoards(boards, only, page);
  }
}

function emitBoards(boards, only, page) {
  const selected = boards.filter((board) =>
    !only || board.route.includes(only) || board.context.includes(only) || board.frameId === only);
  if (selected.length === 0) fail(`--only ${only} 에 맞는 보드가 없습니다.`);
  const targets = selected.map((board) => ({ frameId: board.frameId, generated: board.generatedName, legacy: board.legacyName }));
  const code = (`const TARGETS=${JSON.stringify(targets)};
const DETAIL=${args.includes("--detail")};
const pageOf = (node) => { let at = node; while (at && at.type !== "PAGE") at = at.parent; return at; };
const first = await figma.getNodeByIdAsync(TARGETS[0].frameId);
const page = ${page ? `await figma.getNodeByIdAsync(${JSON.stringify(page)})` : "first ? pageOf(first) : null"};
if (!page || page.type !== "PAGE") throw new Error("페이지를 정하지 못했습니다");
await figma.setCurrentPageAsync(page);
const fnv = (text) => { let h = 0x811c9dc5; for (let i = 0; i < text.length; i += 1) { h ^= text.charCodeAt(i); h = Math.imul(h, 0x01000193) >>> 0; } return h.toString(16).padStart(8, "0"); };
const boards = {};
const elsewhere = {};
const missing = [];
for (const target of TARGETS) {
  const frame = await figma.getNodeByIdAsync(target.frameId);
  if (!frame) { missing.push(target.frameId); continue; }
  const home = pageOf(frame);
  if (!home || home.id !== page.id) { elsewhere[target.frameId] = home ? home.id : null; continue; }
  const direct = frame.children.map((child) => ({ id: child.id, type: child.type, name: child.name, visible: child.visible }));
  const generated = frame.children.find((child) => child.name === target.generated) || null;
  const legacy = frame.children.find((child) => child.name === target.legacy) || null;
  const record = {
    frameName: frame.name,
    size: [Math.round(frame.width), Math.round(frame.height)],
    direct,
    generatedCount: frame.children.filter((child) => child.name === target.generated).length,
    legacy: legacy ? { id: legacy.id, type: legacy.type, visible: legacy.visible } : null,
    generated: null,
  };
  if (generated) {
    const names = [];
    const instances = [];
    let pending = 0;
    const walk = async (node) => {
      names.push(node.type + ":" + node.name);
      if (node.name.startsWith("pending ")) pending += 1;
      if (node.type === "INSTANCE") {
        const main = await node.getMainComponentAsync();
        const set = main && main.parent && main.parent.type === "COMPONENT_SET" ? main.parent : null;
        const text = {};
        for (const [key, property] of Object.entries(node.componentProperties || {})) {
          if (property.type === "TEXT") text[key.includes("#") ? key.slice(0, key.indexOf("#")) : key] = property.value;
        }
        instances.push({ set: set ? set.name : (main ? main.name : null), variant: main ? main.name : null, text, visible: node.visible });
        return;
      }
      if ("children" in node) for (const child of node.children) await walk(child);
    };
    await walk(generated);
    record.generated = { id: generated.id, visible: generated.visible, count: names.length, hash: fnv(names.join("\\n")), pending, instances };
    if (DETAIL) record.generated.names = names;
  }
  boards[target.frameId] = record;
}
return { kind: "figma-screens-live", page: { id: page.id, name: page.name }, boards, elsewhere, missing };
`);
  if (!args.includes("--quiet")) {
    process.stderr.write(
      `\n[figma-screens-live] 보드 ${selected.length}장. 위 코드를 읽기 전용 use_figma 로 실행하고 결과를 파일로 저장한 뒤\n` +
        "                    node scripts/figma-screens-live-check.mjs --check <파일…> 을 돌리세요.\n",
    );
  }
  emitAndExit(code);
}

if (!args.includes("--emit")) runCheck();

function runCheck() {
  const checkAt = args.indexOf("--check");
  if (checkAt === -1) fail("--emit 또는 --check <파일…> 이 필요합니다.");
  const files = [];
  for (let index = checkAt + 1; index < args.length && !args[index].startsWith("--"); index += 1) files.push(args[index]);
  if (files.length === 0) fail("--check 에 결과 파일이 필요합니다.");

  const boardResults = new Map();
  const setResults = {};
  for (const file of files) {
    const raw = JSON.parse(readFileSync(resolve(process.cwd(), file), "utf8"));
    const result = raw.kind ? raw : (raw.result ?? raw);
    if (result.kind === "figma-screens-live-sets") {
      for (const [name, entries] of Object.entries(result.sets ?? {})) (setResults[name] ??= []).push(...entries);
      continue;
    }
    if (result.kind !== "figma-screens-live") fail(`탐침 결과가 아닙니다: ${file}`);
    for (const [frameId, record] of Object.entries(result.boards ?? {})) {
      if (boardResults.has(frameId)) fail(`같은 보드가 두 결과에 있습니다: ${frameId}`);
      boardResults.set(frameId, record);
    }
    for (const frameId of result.missing ?? []) boardResults.set(frameId, { missingFrame: true });
  }

  const boards = expectedBoards();
  const issues = [];
  let same = 0;
  let probed = 0;
  const setsProbed = Object.keys(setResults).length > 0;

  for (const board of boards) {
    const label = `${board.route} · ${board.context.split("-")[0]} (${board.frameId})`;
    const live = boardResults.get(board.frameId);
    if (!live) continue;
    probed += 1;
    const problems = [];
    if (live.missingFrame) {
      problems.push("대상 프레임이 파일에 없다");
    } else {
      const unmanaged = live.direct.filter((child) => child.name !== board.generatedName && child.name !== board.legacyName);
      if (unmanaged.length) {
        problems.push(`직계 자식에 generated·legacy 밖의 노드 ${unmanaged.length}개: ${unmanaged.map((child) => `${child.type} ${child.name} (${child.id})`).join(" | ")}`);
      }
      if (live.legacy && live.legacy.visible) problems.push(`legacy 그룹이 보인다: ${live.legacy.id}`);
      if (live.generatedCount > 1) problems.push(`generated 트리가 ${live.generatedCount}개다 — 렌더러는 첫 번째만 지운다`);
      if (!live.generated) {
        problems.push("generated 트리가 없다 — 조각 00 을 적용한 적이 없다");
      } else {
        const got = live.generated;
        if (got.pending) problems.push(`pending 자리표시 ${got.pending}개 — 조각 n 이 덜 돌았다`);
        if (got.hash !== board.hash || got.count !== board.count) {
          let where = "";
          if (Array.isArray(got.names)) {
            const at = board.names.findIndex((name, index) => got.names[index] !== name);
            const index = at === -1 ? Math.min(board.names.length, got.names.length) : at;
            where = ` — 첫 차이 #${index}: 계획 «${board.names[index] ?? "(끝)"}» · 라이브 «${got.names[index] ?? "(끝)"}»`;
          }
          problems.push(`구조가 다르다: 노드 ${got.count}/${board.count} · 해시 ${got.hash}/${board.hash} (라이브/계획)${where}`);
        }
        const liveKeys = got.instances.map(instanceKey).sort();
        const planKeys = board.instances.map(instanceKey).sort();
        const lost = planKeys.filter((key, index) => planKeys.indexOf(key) === index
          && planKeys.filter((entry) => entry === key).length > liveKeys.filter((entry) => entry === key).length);
        const gained = liveKeys.filter((key, index) => liveKeys.indexOf(key) === index
          && liveKeys.filter((entry) => entry === key).length > planKeys.filter((entry) => entry === key).length);
        if (lost.length) problems.push(`계획에만 있는 인스턴스: ${lost.join(" / ")}`);
        if (gained.length) problems.push(`라이브에만 있는 인스턴스: ${gained.join(" / ")}`);
        const hidden = got.instances.filter((entry) => entry.visible === false);
        if (hidden.length) problems.push(`숨은 인스턴스: ${hidden.map(instanceKey).join(" / ")}`);
        // TEXT 속성 값 — 같은 세트·variant 안에서 «값 묶음»의 다중집합으로 비교한다. 순서로 짝지으면
        // 구조가 다른 보드에서 엉뚱한 두 인스턴스를 맞대 헛된 차이를 찍는다.
        const textOf = (entry, names) => JSON.stringify(Object.fromEntries(names.map((name) => [name,
          name === "*" ? (Object.values(entry.text).length === 1 ? Object.values(entry.text)[0] : null) : entry.text[name] ?? null])));
        for (const key of new Set(planKeys)) {
          if (!liveKeys.includes(key)) continue;
          const planned = board.instances.filter((entry) => instanceKey(entry) === key);
          const names = [...new Set(planned.flatMap((entry) => Object.keys(entry.text)))].sort();
          if (names.length === 0) continue;
          const want = planned.map((entry) => textOf(entry, names)).sort();
          const have = got.instances.filter((entry) => instanceKey(entry) === key).map((entry) => textOf(entry, names)).sort();
          const onlyPlan = want.filter((value, index) => want.indexOf(value) === index
            && want.filter((item) => item === value).length > have.filter((item) => item === value).length);
          const onlyLive = have.filter((value, index) => have.indexOf(value) === index
            && have.filter((item) => item === value).length > want.filter((item) => item === value).length);
          if (onlyPlan.length || onlyLive.length) {
            const show = (list) => list.map((value) => value.replace(/"\*":/g, "")).join(" ") || "—";
            problems.push(`TEXT 속성이 다르다: ${key} — 계획에만 ${show(onlyPlan)} · 라이브에만 ${show(onlyLive)}`);
          }
        }
      }
    }
    if (problems.length === 0) same += 1;
    else issues.push({ label, problems });
  }

  if (setsProbed) {
    const wanted = {};
    const textWanted = {};
    for (const board of boards) {
      for (const entry of board.instances) {
        (wanted[entry.set] ??= new Set()).add(entry.variant);
        if (entry.textNames.length) (textWanted[entry.set] ??= new Set()).add(JSON.stringify(entry.textNames));
      }
    }
    const setProblems = [];
    for (const [set, variants] of Object.entries(wanted)) {
      const found = setResults[set] ?? [];
      if (found.length === 0) { setProblems.push(`세트가 탐침한 페이지에 없다: ${set}`); continue; }
      if (found.length > 1) setProblems.push(`같은 이름의 세트가 ${found.length}개다: ${set} — 렌더러는 페이지 순서상 첫 세트를 집는다`);
      const [entry] = found;
      for (const variant of variants) {
        if (!entry.variants.includes(variant)) setProblems.push(`variant 가 세트에 없다: ${set} · ${variant}`);
      }
      for (const encoded of textWanted[set] ?? []) {
        const names = JSON.parse(encoded);
        if (names[0] === "*") {
          if (entry.textProperties.length !== 1) setProblems.push(`${set} 의 TEXT 속성이 ${entry.textProperties.length}개다(라벨 하나를 넣을 자리가 모호하다)`);
        } else if (JSON.stringify([...names].sort()) !== JSON.stringify([...entry.textProperties].sort())) {
          setProblems.push(`${set} 의 TEXT 속성(${entry.textProperties.join("·") || "없음"})이 계획(${names.join("·")})과 다르다 — 앱 셸 러너를 먼저 돌려야 한다`);
        }
      }
    }
    if (setProblems.length) issues.push({ label: "세트·variant·TEXT 속성(적용 전 점검)", problems: setProblems });
  }

  const unprobed = boards.filter((board) => !boardResults.has(board.frameId));
  for (const issue of issues) {
    process.stderr.write(`[figma-screens-live] ${issue.label}\n`);
    for (const problem of issue.problems) process.stderr.write(`    - ${problem}\n`);
  }
  const summary =
    `[figma-screens-live] ${ref ? `기대값 @ ${ref} · ` : ""}탐침한 보드 ${probed}/${boards.length} · 계획과 같음 ${same} · 다름 ${probed - same}` +
    (unprobed.length ? ` · 탐침하지 않음 ${unprobed.length}(${unprobed.map((board) => board.frameId).join(", ")})` : "") +
    (setsProbed ? ` · 세트 점검 ${Object.keys(setResults).length}개` : "");
  if (issues.length > 0) {
    process.stderr.write(`${summary}\n[figma-screens-live] 적용 전이면 위 목록이 「적용하면 바뀌는 것」이다. 적용 뒤에는 0 이어야 한다.\n`);
    process.exit(1);
  }
  process.stdout.write(`${summary}\n`);
}
