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
//   node scripts/figma-screens-live-check.mjs --check <live.json> [<live2.json> …] [<sets.json> …]
//        [--ref <커밋>] [--only <부분문자열>] [--expect-differ <frameId>[,<frameId>…]] [--allow-partial]
//   node scripts/figma-screens-live-check.mjs --check <sets.json> [<sets2.json> …] --sets-only
//
// `--emit` 이 낸 코드를 **읽기 전용** `use_figma` 로 실행하고, 돌려받은 JSON 을 파일로 저장해
// `--check` 에 준다(파일은 `--check` 바로 뒤에 둔다). 탐침은 `setCurrentPageAsync` 를 **한 번만**
// 부른다(figma-use 규칙) — 보드는 페이지 둘에 흩어져 있으므로 `--page` 를 바꿔 두 번 뜨고, `--check` 에
// 결과 파일을 모두 준다. `--page` 가 없으면 첫 보드의 페이지를 쓰고, 다른 페이지의 보드는 `elsewhere` 로
// 돌려준다. `--only` 는 route·문맥·frameId 부분문자열로 보드를 좁혀 응답 크기를 줄인다. `--detail` 은
// 이름 목록을 통째로 돌려받아 `--check` 가 첫 차이 줄을 찍게 한다(보드 몇 장에만 쓴다 — 응답이 커진다).
// `--ref <커밋>` 은 기대값을 작업 트리 대신 그 커밋의 러너에서 계산한다 — 라이브가 어느 계획으로
// 그려졌는지 가려낼 때 쓴다.
//
// ## 합격은 공허하게 나지 않는다
//
// `--check` 는 **계획 보드 전부**가 결과 파일에 들어 있어야 통과한다. 페이지 결과 하나를 빠뜨리거나
// `elsewhere` 만 담긴 결과를 주면, 탐침하지 않은 보드를 이름으로 대고 종료 코드 1 을 낸다(2026-09-13
// 리뷰: 보드 0/36 을 주고도 초록이 났다). 범위를 줄이는 길은 명시 플래그뿐이다.
//
//   - `--only <부분문자열>` — 기대 보드를 그 부분문자열로 좁힌다. 좁힌 범위 안에서는 전부 탐침해야 한다.
//   - `--allow-partial` — 일부만 떴다는 뜻이다. 탐침한 보드만 판정하고 요약에 「부분」과 빠진 보드를 적는다.
//     탐침한 보드가 0 이면 이 플래그로도 통과하지 않는다.
//   - `--expect-differ <frameId,…>` — 차이를 **예상한** 보드(예: 첫 적용에서 뺀 `/mypage/upgrade`
//     데스크톱). 그 보드의 차이는 따로 찍고 실패로 세지 않는다. 대신 그 보드가 계획과 **같으면** 실패한다 —
//     예상 목록이 낡았다는 뜻이다.
//   - `--sets-only` — 세트 결과만 본다. 보드 결과를 함께 주면 거부한다. 요약은 보드를 대조하지 않았다고 적는다.
//
// 결과 파일에 계획 밖 보드가 있거나 알 수 없는 인자가 있어도 멈춘다.
//
// 어긋나면 보드 단위로 무엇이 다른지 찍고 종료 코드 1 을 낸다. **적용 전에는 다른 것이 정상이다** —
// 그때 출력은 「적용하면 무엇이 바뀌는가」의 목록이다. 적용 뒤에 다시 돌려 0 이 되어야 한다.
//
// ## 상단 바 세트의 소비처 — `--consumers`
//
//   node scripts/figma-screens-live-check.mjs --emit --consumers [--page <PAGE_ID>]
//   node scripts/figma-screens-live-check.mjs --consumers <before.json>                  # 기준선 목록
//   node scripts/figma-screens-live-check.mjs --consumers <before.json> <after.json> [--expect-change <id,…>]
//
// 앱 셸 러너(`figma/product-app-shell.draw.js`)는 두 상단 바 세트(이름은 앱 셸 plan)의 **마스터**를 고친다 —
// TEXT 속성 결합 · 크기 · 면. 그 결과는 세트의 모든 인스턴스에 번진다. 그런데 `--check` 는 generated 트리
// 안만 보고, generated 밖에서 그 세트를 쓰는 곳 — 손으로 조립한 허브 보드, 숨긴 legacy 그룹, 결제 장면
// 컴포넌트 — 은 다시 채우는 생성기도 대조하는 도구도 없었다(2026-09-13 리뷰: 허브 보드의 **보이는** 바 7개가
// 적용 범위 기술에서 빠졌다). `--emit --consumers` 는 세트의 variant 마다 `getInstancesAsync` 로 소비처를
// 모두 뽑는다. 다른 인스턴스 안의 하위 레이어(id 가 `I` 로 시작)는 버리고 **호스트 컴포넌트를 따라 올라가**
// 그 장면이 캔버스 어디에 놓였는지 적는다 — `getInstancesAsync` 가 하위 레이어를 돌려주는지는 페이지 적재
// 상태에 따라 달라서(2026-09-13 실측: 모바일 세트가 첫 호출 25, 장면 인스턴스 속을 읽은 뒤 32 — 늘어난 7 은 전부
// `I…`), 거기에 기대면 열거가 실행마다 바뀐다.
//
// 인스턴스마다 `where`(generated · legacy · hand = generated/legacy 밖 보드 · component = 컴포넌트 안),
// 실효 visible, 보드, 보이는 글자, TEXT 속성 값, 크기, 면 색, override 필드를 적는다. 파일 하나를 주면 기준선
// 목록을 찍는다(대조가 아니다). 적용 전·후 두 파일을 주면 generated 밖 소비처를 id 로 짝지어 variant ·
// where · visible · 보이는 글자 · 크기 · 면 색이 달라진 것을 찍고, 보이는 소비처의 변화가 하나라도 있으면
// 종료 코드 1 이다. 받아들인 변화는 `--expect-change <id,…>` 로 이름을 댄다 — 댄 id 가 변하지 않았으면
// 목록이 낡았다고 실패한다. generated 트리 안은 보드 러너가 다시 짓고 `--check` 가 보므로 수만 센다.
// 숨은 소비처(legacy)의 변화는 따로 찍되 실패로 세지 않는다.
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const PLAN = "figma/app-screens.plan.json";
const SHELL_PLAN = "figma/product-app-shell.plan.json";
const args = process.argv.slice(2);
const fail = (message) => {
  process.stderr.write(`[figma-screens-live] ${message}\n`);
  process.exit(2);
};
// 인자를 먼저 전부 검사한다 — 흘린 결과 파일이 조용히 무시되면 부분 탐침이 전량처럼 보인다.
const VALUE_FLAGS = new Set(["--ref", "--only", "--page", "--expect-differ", "--expect-change"]);
const BOOLEAN_FLAGS = new Set(["--emit", "--sets", "--consumers", "--detail", "--quiet", "--check", "--allow-partial", "--sets-only"]);
const emitting = args.includes("--emit");
const checkFiles = [];
const consumerFiles = [];
for (let index = 0; index < args.length; index += 1) {
  const arg = args[index];
  if (VALUE_FLAGS.has(arg)) {
    if (!args[index + 1] || args[index + 1].startsWith("--")) fail(`${arg} 에 값이 필요합니다.`);
    index += 1;
  } else if (!emitting && (arg === "--check" || arg === "--consumers")) {
    const list = arg === "--check" ? checkFiles : consumerFiles;
    while (args[index + 1] && !args[index + 1].startsWith("--")) list.push(args[(index += 1)]);
  } else if (!BOOLEAN_FLAGS.has(arg)) {
    fail(`알 수 없는 인자입니다: ${arg} — 결과 파일은 --check · --consumers 바로 뒤에 둡니다.`);
  }
}
if (!emitting && args.includes("--check") && args.includes("--consumers")) fail("--check 와 --consumers 는 따로 돌립니다.");
const option = (name) => {
  const at = args.indexOf(name);
  return at >= 0 ? args[at + 1] : null;
};
/** 여러 번 주거나 쉼표로 이은 값을 모은다. */
const optionList = (name) => args.flatMap((arg, index) => (arg === name ? args[index + 1].split(",") : []))
  .map((value) => value.trim()).filter(Boolean);
const ref = option("--ref");
const readRepo = (path) => (ref
  ? execFileSync("git", ["-C", repoRoot, "show", `${ref}:${path}`], { encoding: "utf8", maxBuffer: 1 << 28 })
  : readFileSync(resolve(repoRoot, path), "utf8"));
const matchesOnly = (board, only) =>
  !only || board.route.includes(only) || board.context.includes(only) || board.frameId === only;

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

if (emitting && args.includes("--consumers")) {
  emitConsumers();
} else if (emitting) {
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
  const selected = boards.filter((board) => matchesOnly(board, only));
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
        `                    node scripts/figma-screens-live-check.mjs --check <파일…>${only ? ` --only ${only}` : ""} 을 돌리세요.\n` +
        "                    다른 페이지의 보드는 elsewhere 로 돌아오니, 페이지마다 떠서 결과를 모두 줍니다.\n",
    );
  }
  emitAndExit(code);
}

/** 앱 셸 plan 이 소유하는 상단 바 세트 이름과 그 페이지. */
function shellSets() {
  const shell = JSON.parse(readRepo(SHELL_PLAN));
  const names = [shell.component?.componentSetName, shell.component?.desktopTopBar?.componentSetName];
  if (names.some((name) => typeof name !== "string")) fail(`${SHELL_PLAN} 에서 상단 바 세트 이름을 찾지 못했습니다.`);
  return { names, pageId: shell.component.pageId };
}

function emitConsumers() {
  const { names, pageId } = shellSets();
  const page = option("--page") ?? pageId;
  emitAndExit(`const NAMES=${JSON.stringify(names)};
// 적용 영향을 가르는 override 만 싣는다 — 루트 면·획·크기와 글자 내용·색. 나머지까지 실으면 응답이 한도를 넘는다.
const KEEP=["self:fills","self:strokes","self:width","self:height","TEXT:characters","TEXT:fills","FRAME:fills"];
const LIMIT=19000;
const page = await figma.getNodeByIdAsync(${JSON.stringify(page)});
if (!page || page.type !== "PAGE") throw new Error("페이지를 찾지 못했습니다: ${page}");
await figma.setCurrentPageAsync(page);
const round = (value) => Math.round(value * 100) / 100;
const hex = (paints) => { const paint = Array.isArray(paints) ? paints.find((entry) => entry.type === "SOLID" && entry.visible !== false) : null; return paint ? "#" + [paint.color.r, paint.color.g, paint.color.b].map((v) => Math.round(v * 255).toString(16).padStart(2, "0")).join("") : null; };
const boards = {};
const boardOf = (node) => { let at = node; while (at.parent && at.parent.type !== "SECTION" && at.parent.type !== "PAGE") at = at.parent; boards[at.id] = at.name.slice(0, 48); return at.id; };
// 가장 가까운 컴포넌트까지 올라가며 실효 visible 과 generated/legacy 소속을 잰다. 컴포넌트를 만나면 멈춘다.
const locate = (node) => {
  let at = node.parent; let visible = node.visible; let where = null; let host = null;
  while (at && at.type !== "PAGE") {
    if (at.type === "COMPONENT") { host = at; break; }
    if (at.visible === false) visible = false;
    if (!where && at.name.startsWith("generated/")) where = "generated";
    else if (!where && at.name.startsWith("legacy/")) where = "legacy";
    at = at.parent;
  }
  return { visible, where: host ? "component" : (where || "hand"), host };
};
// 호스트 컴포넌트가 캔버스 어디에 놓였는지(「where@board」). 하위 레이어 인스턴스(id "I…")는 세지 않는다.
const placementsOf = async (component, depth) => {
  if (depth > 6) return ["truncated"];
  const out = [];
  for (const instance of await component.getInstancesAsync()) {
    if (instance.id.startsWith("I")) continue;
    const spot = locate(instance);
    if (spot.host) out.push(...await placementsOf(spot.host, depth + 1));
    else out.push(spot.where + (spot.visible ? "" : "(숨김)") + "@" + boardOf(instance));
  }
  if (out.length === 0) out.push("component-root" + (locate(component).visible ? "" : "(숨김)") + "@" + boardOf(component));
  return out;
};
const sets = {};
const generated = {};
const consumers = [];
for (const name of NAMES) {
  const found = page.findAllWithCriteria({ types: ["COMPONENT_SET"] }).filter((node) => node.name === name);
  if (found.length !== 1) throw new Error("세트가 " + found.length + "개입니다: " + name);
  const [set] = found;
  const definitions = set.componentPropertyDefinitions || {};
  sets[name] = { id: set.id, variants: set.children.map((child) => child.name),
    textProperties: Object.keys(definitions).filter((key) => definitions[key].type === "TEXT").map((key) => key.split("#")[0]) };
  generated[name] = 0;
  for (const [v, variant] of set.children.entries()) {
    for (const instance of await variant.getInstancesAsync()) {
      if (instance.id.startsWith("I")) continue;
      const spot = locate(instance);
      // generated 트리 안은 보드 러너가 다시 짓고 --check 가 본다 — 수만 센다.
      if (spot.where === "generated") { generated[name] += 1; continue; }
      const props = {};
      for (const [key, property] of Object.entries(instance.componentProperties || {})) {
        if (property.type === "TEXT") props[key.split("#")[0]] = property.value;
      }
      const overrides = new Set();
      for (const entry of instance.overrides || []) {
        const node = entry.id === instance.id ? null : await figma.getNodeByIdAsync(entry.id);
        for (const field of entry.overriddenFields) {
          const key = (node ? node.type : "self") + ":" + field;
          if (KEEP.includes(key)) overrides.add(key);
        }
      }
      consumers.push({
        id: instance.id, set: name, v, where: spot.where, visible: spot.visible, board: boardOf(spot.host || instance),
        host: spot.host ? { id: spot.host.id, name: spot.host.name.slice(0, 40), placements: await placementsOf(spot.host, 1) } : null,
        texts: instance.findAllWithCriteria({ types: ["TEXT"] }).filter((text) => text.visible).map((text) => text.characters).join(" "),
        props, size: round(instance.width) + "×" + round(instance.height), fill: hex(instance.fills),
        sizing: instance.layoutSizingHorizontal, overrides: [...overrides].sort(),
      });
    }
  }
}
const result = { kind: "figma-screens-live-consumers", page: { id: page.id, name: page.name }, sets, generated, boards, consumers };
// 한도는 UTF-8 바이트다 — 보드 이름의 한글은 3 바이트씩 센다.
const bytes = [...JSON.stringify(result)].reduce((sum, ch) => sum + (ch.codePointAt(0) > 0xffff ? 4 : ch.codePointAt(0) > 0x7ff ? 3 : ch.codePointAt(0) > 0x7f ? 2 : 1), 0);
if (bytes > LIMIT) throw new Error("응답이 " + bytes + " 바이트다 — use_figma 응답 한도에 잘려 기준선이 불완전해진다. 소비처가 늘었으면 이 탐침을 세트별로 나눠야 한다.");
return result;
`);
}

function loadConsumers(file, names) {
  const raw = JSON.parse(readFileSync(resolve(process.cwd(), file), "utf8"));
  const result = raw.kind ? raw : (raw.result ?? raw);
  if (result.kind !== "figma-screens-live-consumers") fail(`소비처 탐침 결과가 아닙니다: ${file}`);
  const got = Object.keys(result.sets ?? {}).sort();
  if (JSON.stringify(got) !== JSON.stringify([...names].sort())) {
    fail(`${file} 의 세트(${got.join(" · ") || "없음"})가 앱 셸 plan 의 세트(${names.join(" · ")})와 다릅니다.`);
  }
  if (!Array.isArray(result.consumers)) fail(`${file} 에 consumers 가 없습니다 — 잘린 응답일 수 있다.`);
  const total = result.consumers.length + Object.values(result.generated ?? {}).reduce((sum, count) => sum + count, 0);
  if (total === 0) fail(`${file} 에 소비처가 0 개입니다 — 탐침이 세트를 제대로 읽지 못했다.`);
  const byId = new Map();
  for (const entry of result.consumers) {
    if (byId.has(entry.id)) fail(`${file} 에 같은 인스턴스가 두 번 있습니다: ${entry.id}`);
    const variant = result.sets[entry.set]?.variants?.[entry.v];
    if (variant == null) fail(`${file} 의 ${entry.id} variant 번호 ${entry.v} 가 세트 목록에 없습니다.`);
    byId.set(entry.id, { ...entry, variant, boardName: result.boards?.[entry.board] ?? "" });
  }
  return { byId, generated: result.generated ?? {}, sets: result.sets };
}

const shortVariant = (variant) => variant.replace(/(Width|Content|Breadcrumb|Back|Divider)=/g, "");
const describeConsumer = (entry) => {
  const place = entry.host
    ? `${entry.host.id} ${entry.host.name} → ${entry.host.placements.join(" · ")}`
    : `${entry.board} ${entry.boardName}`;
  // 적용 영향을 가르는 override — 루트 면, 글자 내용, 크기.
  const marks = [["self:fills", "면"], ["TEXT:characters", "글자"], ["self:width", "폭"]]
    .filter(([key]) => entry.overrides.includes(key)).map(([, label]) => label);
  const props = Object.keys(entry.props).length ? ` · 속성 ${JSON.stringify(entry.props)}` : "";
  return `${entry.id} · ${shortVariant(entry.variant)} · «${entry.texts}»${props} · ${entry.size} ${entry.sizing ?? ""}` +
    ` · ${entry.fill ?? "면 없음"} · override ${marks.join("·") || "—"} · ${place}`;
};

function runConsumers() {
  if (consumerFiles.length < 1 || consumerFiles.length > 2) fail("--consumers 바로 뒤에 기준선 파일 하나, 또는 적용 전·후 파일 둘을 줍니다.");
  const { names } = shellSets();
  const [before, after] = consumerFiles.map((file) => loadConsumers(file, names));
  const tally = (probe) => names.map((name) => {
    const rows = [...probe.byId.values()].filter((entry) => entry.set === name);
    const count = (where) => rows.filter((entry) => entry.where === where).length;
    const hidden = rows.filter((entry) => !entry.visible).length;
    return `${name} = generated ${probe.generated[name] ?? 0} · legacy ${count("legacy")} · hand ${count("hand")} · component ${count("component")} (generated 밖 숨김 ${hidden})`;
  });
  if (!after) {
    if (args.includes("--expect-change")) fail("--expect-change 는 적용 전·후 두 파일을 줄 때만 씁니다.");
    const write = (line) => process.stdout.write(`${line}\n`);
    write("[figma-screens-live] 상단 바 소비처 기준선 — 대조가 아니다(적용 뒤 결과와 함께 다시 주면 대조한다)");
    for (const line of tally(before)) write(`    ${line}`);
    for (const [where, title] of [
      ["hand", "손 조립 보드(generated·legacy 밖 — 다시 채우는 생성기 없음, --check 밖)"],
      ["component", "컴포넌트 안(장면) — 그 장면 러너가 다시 채운다"],
      ["legacy", "legacy 그룹"],
    ]) {
      const rows = [...before.byId.values()].filter((entry) => entry.where === where);
      if (rows.length === 0) continue;
      write(`  ${title} ${rows.length}`);
      for (const entry of rows) write(`    ${entry.visible ? "" : "(숨김) "}${describeConsumer(entry)}`);
    }
    return;
  }

  const expected = new Set(optionList("--expect-change"));
  for (const id of expected) {
    if (!before.byId.has(id) && !after.byId.has(id)) fail(`--expect-change ${id} 가 두 결과의 generated 밖 소비처 어디에도 없습니다.`);
  }
  // 보이는 것만 비교한다. TEXT 속성 값은 적용 뒤 모든 인스턴스에 새로 생기므로 차이 판정에 넣지 않는다 — 보이는 글자가 판정한다.
  const FIELDS = [
    ["variant", (entry) => entry.variant],
    ["where", (entry) => entry.where],
    ["visible", (entry) => entry.visible],
    ["글자", (entry) => entry.texts],
    ["크기", (entry) => entry.size],
    ["면", (entry) => entry.fill],
  ];
  const changed = [];
  const accepted = [];
  const hiddenChanges = [];
  const stale = [];
  for (const id of new Set([...before.byId.keys(), ...after.byId.keys()])) {
    const was = before.byId.get(id);
    const now = after.byId.get(id);
    const changes = !now ? ["사라졌다(또는 generated 안으로 옮겨졌다)"] : !was ? ["새로 생겼다"]
      : FIELDS.filter(([, read]) => read(was) !== read(now)).map(([field, read]) => `${field} ${JSON.stringify(read(was))} → ${JSON.stringify(read(now))}`);
    if (changes.length === 0) {
      if (expected.has(id)) stale.push(id);
      continue;
    }
    const line = `${describeConsumer(now ?? was)} — ${changes.join(" · ")}`;
    if (expected.has(id)) accepted.push(line);
    else if (!(was?.visible ?? false) && !(now?.visible ?? false)) hiddenChanges.push(line);
    else changed.push(line);
  }
  const section = (title, lines) => {
    if (lines.length === 0) return;
    process.stderr.write(`[figma-screens-live] ${title} ${lines.length}\n`);
    for (const line of lines) process.stderr.write(`    ${line}\n`);
  };
  section("받아들인 변화(--expect-change)", accepted);
  section("숨은 소비처의 변화(실패로 세지 않는다)", hiddenChanges);
  section("보이는 소비처의 변화", changed);
  if (stale.length) process.stderr.write(`[figma-screens-live] --expect-change 로 댔지만 변하지 않았다 — 목록에서 뺀다: ${stale.join(", ")}\n`);
  process.stderr.write(`    적용 전: ${tally(before).join(" | ")}\n    적용 뒤: ${tally(after).join(" | ")}\n`);
  const summary = `[figma-screens-live] 상단 바 소비처 대조 · generated 밖 적용 전 ${before.byId.size} · 적용 뒤 ${after.byId.size}` +
    ` · 보이는 변화 ${changed.length} · 받아들인 변화 ${accepted.length} · 숨은 변화 ${hiddenChanges.length}`;
  if (changed.length || stale.length) {
    process.stderr.write(`${summary}\n`);
    process.exit(1);
  }
  process.stdout.write(`${summary}\n`);
}

if (!emitting && args.includes("--consumers")) runConsumers();
else if (!emitting) runCheck();

function runCheck() {
  if (!args.includes("--check")) fail("--emit 또는 --check <파일…> 이 필요합니다.");
  const files = checkFiles;
  if (files.length === 0) fail("--check 바로 뒤에 결과 파일이 필요합니다.");
  const setsOnly = args.includes("--sets-only");
  const allowPartial = args.includes("--allow-partial");
  const only = option("--only");

  const boardResults = new Map();
  const elsewhere = new Map();
  const setResults = {};
  let boardFiles = 0;
  let setFiles = 0;
  const claim = (frameId, record) => {
    if (boardResults.has(frameId)) fail(`같은 보드가 두 결과에 있습니다: ${frameId}`);
    boardResults.set(frameId, record);
  };
  for (const file of files) {
    const raw = JSON.parse(readFileSync(resolve(process.cwd(), file), "utf8"));
    const result = raw.kind ? raw : (raw.result ?? raw);
    if (result.kind === "figma-screens-live-sets") {
      setFiles += 1;
      for (const [name, entries] of Object.entries(result.sets ?? {})) (setResults[name] ??= []).push(...entries);
      continue;
    }
    if (result.kind !== "figma-screens-live") fail(`탐침 결과가 아닙니다: ${file}`);
    boardFiles += 1;
    for (const [frameId, record] of Object.entries(result.boards ?? {})) claim(frameId, record);
    for (const frameId of result.missing ?? []) claim(frameId, { missingFrame: true });
    for (const [frameId, pageId] of Object.entries(result.elsewhere ?? {})) elsewhere.set(frameId, pageId);
  }
  if (setsOnly && boardFiles > 0) fail("--sets-only 에는 보드 결과를 주지 않습니다 — 보드까지 보려면 플래그를 뺍니다.");
  if (setsOnly && setFiles === 0) fail("--sets-only 에 세트 결과(--emit --sets)가 없습니다.");
  if (!setsOnly && boardFiles === 0) fail("보드 결과(--emit)가 없습니다 — 세트만 보려면 --sets-only 를 붙입니다.");

  const allBoards = expectedBoards();
  const planIds = new Set(allBoards.map((board) => board.frameId));
  const boards = setsOnly ? [] : allBoards.filter((board) => matchesOnly(board, only));
  if (!setsOnly && boards.length === 0) fail(`--only ${only} 에 맞는 보드가 없습니다.`);
  const expectDiffer = new Set(optionList("--expect-differ"));
  for (const frameId of expectDiffer) {
    if (!boards.some((board) => board.frameId === frameId)) fail(`--expect-differ ${frameId} 가 대조 범위의 보드가 아닙니다.`);
  }
  const issues = [];
  const expectedDiffs = [];
  let same = 0;
  let probed = 0;
  const setsProbed = Object.keys(setResults).length > 0;
  const outsidePlan = [...boardResults.keys()].filter((frameId) => !planIds.has(frameId));
  if (outsidePlan.length) {
    issues.push({ label: "결과 파일", problems: [`계획에 없는 보드 ${outsidePlan.length}개: ${outsidePlan.join(", ")} — 기대값(--ref)과 탐침 시점의 계획이 다르다`] });
  }

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
    if (expectDiffer.has(board.frameId)) {
      if (problems.length) {
        expectedDiffs.push({ label, frameId: board.frameId, problems });
      } else {
        same += 1;
        issues.push({ label, problems: ["--expect-differ 로 차이를 예상했지만 계획과 같다 — 예상 목록에서 뺀다"] });
      }
    } else if (problems.length === 0) {
      same += 1;
    } else {
      issues.push({ label, problems });
    }
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
  const unprobedText = unprobed.map((board) => board.frameId + (elsewhere.has(board.frameId) ? `@${elsewhere.get(board.frameId)}` : "")).join(", ");
  if (!setsOnly && probed === 0) {
    issues.push({ label: "탐침 범위", problems: [`탐침한 보드가 0 이다 — 결과가 elsewhere 뿐이면 그 페이지(--page)로 다시 뜬다. ${unprobedText}`] });
  } else if (unprobed.length && !allowPartial) {
    issues.push({
      label: "탐침 범위",
      problems: [
        `탐침하지 않은 보드 ${unprobed.length}개(frameId@다른 페이지): ${unprobedText}`,
        "페이지마다 --emit 결과를 모두 주거나, 범위를 --only 로 좁히거나, 일부만 본다는 뜻으로 --allow-partial 을 붙인다.",
      ],
    });
  }
  for (const entry of expectedDiffs) {
    process.stderr.write(`[figma-screens-live] (예상한 차이 · --expect-differ) ${entry.label}\n`);
    for (const problem of entry.problems) process.stderr.write(`    · ${problem}\n`);
  }
  for (const issue of issues) {
    process.stderr.write(`[figma-screens-live] ${issue.label}\n`);
    for (const problem of issue.problems) process.stderr.write(`    - ${problem}\n`);
  }
  const summary = setsOnly
    ? `[figma-screens-live] ${ref ? `기대값 @ ${ref} · ` : ""}세트 점검만 ${Object.keys(setResults).length}개 — 보드는 대조하지 않았다(--sets-only)`
    : `[figma-screens-live] ${ref ? `기대값 @ ${ref} · ` : ""}탐침한 보드 ${probed}/${boards.length}` +
      (only ? `(--only ${only} · 계획 ${allBoards.length})` : "") +
      ` · 계획과 같음 ${same} · 다름 ${probed - same - expectedDiffs.length}` +
      (expectedDiffs.length ? ` · 예상한 차이 ${expectedDiffs.length}(${expectedDiffs.map((entry) => entry.frameId).join(", ")})` : "") +
      (unprobed.length ? ` · 탐침하지 않음 ${unprobed.length}${allowPartial ? " — 부분 대조(--allow-partial)" : ""}` : "") +
      (setsProbed ? ` · 세트 점검 ${Object.keys(setResults).length}개` : "");
  if (issues.length > 0) {
    process.stderr.write(`${summary}\n[figma-screens-live] 적용 전이면 위 목록이 「적용하면 바뀌는 것」이다. 적용 뒤에는 0 이어야 한다.\n`);
    process.exit(1);
  }
  process.stdout.write(`${summary}\n`);
}
