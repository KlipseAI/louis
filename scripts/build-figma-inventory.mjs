import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { atomicWriteBatch } from "./lib/atomic-output.mjs";
import { resolveProductRef } from "./lib/product-ref.mjs";

// **Figma Product inventory를 그리는 계획을 생성한다.**
//
// 그전까지 이 변환 규칙은 대화 안에만 있었다. 그래서 다시 그릴 때마다 합의한 것이 사라졌다 —
// 모달의 여백 분할, 아바타의 선언 크기, 텍스트 자동 크기, 중첩 오토레이아웃이 매번 유실됐고
// owner가 매번 다시 잡아 줘야 했다. 규칙을 코드로 옮겨 그 고리를 끊는다.
//
// 이 파일이 소유하는 규칙:
//
//   ① 크기는 **제품이 선언한 것만** 고정한다.
//      `[width:32px]` · `w-22` · `w-[260px]` · `w-[min(...)]` → 고정
//      `w-[60%]` · `[height:30%]`(100% 가 아닌 퍼센트)        → 비율 선언 — 실측으로 고정하고 사유를 「비율」로
//      `w-full` · `[width:100%]`                              → 부모가 준다(FILL)
//      `w-max` · `w-fit` · `[height:fit-content]`             → 내용이 정한다고 선언했다(HUG)
//      선언 없음                                              → 문맥이 정한다(flex 행의 주축은 HUG, 교차축 · 블록은 FILL)
//      `min-w-*` · `max-w-*` · `min-h-*` · `max-h-*` 는 크기 선언이 아니고, 변형 접두가 붙은 토큰(`before:` · `hover:` ·
//      `[@media(…)]:` · `[.x_&]:`)은 다른 요소 · 상태 · 화면의 크기라 판정에서 뺀다(크기 굳힘 감사 묶음 7 — 전에는 이것들이
//      고정으로 읽혀 폭 선언고정이 83, 지금 39 다).
//      결과값(36.44 같은)을 고정하면 문구가 바뀔 때 깨진다.
//
//   ② 글자는 **언제나 자동**이다. 손으로 크기를 잡으면 글리프가 잘리고 리플로우가 죽는다.
//      block으로 잰 글자만 폭을 부모에게 받는다.
//
//   ③ 행간은 **비율**이다. 제품이 무단위 1.5/1.35로 선언하고 브레이크포인트에서 글자 크기만
//      바뀐다. px로 굳히면 그 계약이 끊긴다.
//
//   ④ 간격이 제각각이면 **중첩 오토레이아웃**으로 묶는다. spacer 프레임은 쓰지 않는다.
//
//   ⑤ 음수 마진으로 자식이 부모 안쪽보다 밖으로 나가면 **여백을 바깥·안쪽으로 나눈다.**
//      모달이 그렇다 — 카드 여백 16 + 액션 마진 -8을 카드 8 + 본문 묶음 8로 옮기면
//      결과가 같으면서 비대칭 여백도 오버플로도 없다.

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const productRoot = process.env.KLIPSE_PRODUCT_REPO ?? "/Users/sejunki/klipse-web";
const { ref } = resolveProductRef();
const outputPath = resolve(repoRoot, "figma/inventory-plan.json");
const checkOnly = process.argv.includes("--check");

const specimenFile = JSON.parse(readFileSync(resolve(repoRoot, "figma/product-specimens.json"), "utf8"));
const measured = JSON.parse(readFileSync(resolve(repoRoot, "migration/product.variants.json"), "utf8"));

if (!existsSync(resolve(productRoot, ".git"))) {
  console.log("[figma-inventory] SKIPPED (제품 저장소 없음: " + productRoot + ").");
  process.exit(0);
}
const git = (args) =>
  execFileSync("git", args, { cwd: productRoot, encoding: "utf8", maxBuffer: 128 * 1024 * 1024 });
const commit = git(["rev-parse", ref]).trim();

// ── 제품이 선언한 크기 의도를 소스에서 읽는다 ──────────────────────────────
const sourceCache = new Map();
const source = (path) => {
  if (!sourceCache.has(path)) sourceCache.set(path, git(["show", commit + ":" + path]));
  return sourceCache.get(path);
};
const declCache = new Map();
// 상수 본문을 읽되 **참조 합성을 푼다.** `MODAL_CANCEL = [MODAL_BUTTON_BASE, "..."]`처럼
// 다른 상수를 참조하면 그 안의 선언(`flex:1` 등)이 본문에 안 보인다 — 이걸 놓쳐
// 관리자 모달 버튼이 HUG으로 판정돼 364 대신 25로 그려졌다.
const bodyCache = new Map();
const constantBody = (file, part, seen) => {
  const key = file + "|" + part;
  if (bodyCache.has(key)) return bodyCache.get(key);
  if (seen.has(key)) return "";
  seen.add(key);
  const body = source(file);
  const found = new RegExp("^\\s*(?:const\\s+)?" + part + "\\s*[:=]\\s*(\\[[\\s\\S]*?\\]\\.join|\"[^\"]*\")", "m").exec(body);
  let text = found ? found[1] : "";
  // 배열 원소 중 식별자는 같은 파일의 상수를 가리킨다. 펼쳐서 이어 붙인다.
  for (const m of text.matchAll(/(?:^|[[,]\s*)([A-Z_][A-Z0-9_]*|[a-z][A-Za-z0-9]*)\s*(?=[,\]])/g)) {
    const ref = m[1];
    if (ref === part) continue;
    text += " " + constantBody(file, ref, seen);
  }
  bodyCache.set(key, text);
  return text;
};
// **요소 자신의 크기 판정에는 변형 접두가 없는 토큰만 쓴다(크기 굳힘 감사 묶음 7).**
// `before:[height:20%]` 는 의사 요소의 높이, `hover:w-10` 은 다른 상태, `[@media(max-width:959px)]:w-full` 은 다른
// 화면의 폭이다. 접두는 **괄호 밖의 콜론**이다 — `[width:32px]` · `[@media(…)]` 안의 콜론은 괄호 안이라 남는다.
const ownSizeTokens = (text) =>
  text
    .split(/[\s"'`]+/)
    .filter((token) => {
      let depth = 0;
      for (const char of token) {
        if (char === "[" || char === "(") depth += 1;
        else if (char === "]" || char === ")") depth -= 1;
        else if (char === ":" && depth === 0) return false;
      }
      return true;
    })
    .join(" ");
// 길이 단위가 붙은 값과 함수만 고정 선언이다. 전에는 `\d` 한 글자로 받아 `[width:100%]` 의 1 이 고정으로 읽혔다 —
// 퍼센트는 부모가 주는 크기다(`[width:100%]` 는 아래 채움, 그 밖의 퍼센트는 고정도 채움도 아니다).
const LENGTH = String.raw`(?:\d+(?:\.\d+)?(?:px|rem|em|ch)\b|min\(|max\(|clamp\(|calc\(|var\()`;
// 유틸리티 이름 앞에 글자나 `-` 가 붙으면 다른 유틸리티다 — `min-w-0` 은 `w-0` 이 아니고 `max-w-full` 은
// `w-full` 이 아니다(`\b` 는 `-` 와 글자 사이에서도 서서 둘 다 잘못 걸렸다).
const UTILITY = (name) => new RegExp(String.raw`(?<![\w-])${name}(?![\w-])`);
// 100% 가 아닌 퍼센트(`h-[30%]` · `[width:60%]`)는 부모에 대한 **비율 선언**이다. 채움도 내용도 아니므로 실측 크기로
// 고정하되 사유를 「비율」로 따로 적는다 — 내용 판정(HUG)으로 떨어뜨리면 띠 · 진행 막대가 내용 크기로 줄어든다.
const PARTIAL_PERCENT = String.raw`(?!100%)\d+(?:\.\d+)?%`;
const declFromText = (raw) => {
  const text = ownSizeTokens(raw);
  const has = (re) => re.test(text);
  return {
    wRatio:
      has(new RegExp(String.raw`\[width:\s*${PARTIAL_PERCENT}\]`)) || has(new RegExp(String.raw`(?<![\w-])w-\[${PARTIAL_PERCENT}\]`)),
    hRatio:
      has(new RegExp(String.raw`\[height:\s*${PARTIAL_PERCENT}\]`)) || has(new RegExp(String.raw`(?<![\w-])h-\[${PARTIAL_PERCENT}\]`)),
    // 내용 크기 선언(`w-max` · `w-fit` · `[height:fit-content]`) — 문맥(flex 열의 교차축 등)이 아니라 선언이 내용을 고른다.
    wHug: has(/(?<![\w-])w-(?:max|fit|min)(?![\w-])/) || has(/\[width:\s*(?:max|min|fit)-content\]/),
    hHug: has(/(?<![\w-])h-(?:max|fit|min)(?![\w-])/) || has(/\[height:\s*(?:max|min|fit)-content\]/),
    // 숫자 유틸리티(`w-22`)도 선언이다. 이 저장소는 spacing 1단위가 2px이라 w-22 = 44px이다.
    // 분수(`w-1/2`) · 퍼센트는 숫자 유틸리티가 아니다.
    wFixed:
      has(new RegExp(String.raw`\[width:\s*${LENGTH}`)) ||
      has(new RegExp(String.raw`(?<![\w-])w-\[${LENGTH}`)) ||
      has(/(?<![\w-])w-\d+(?![\w.%/-])/),
    // `[flex:1]`·`flex-1`·`grow`도 부모가 폭을 주는 선언이다 — 모달 버튼이 이렇게 행을
    // 나눠 갖는데 이걸 몰라 HUG로 판정했고, 버튼이 글자만 감싸는 알약으로 그려졌다. `grow-0` 은 늘이지 않는다.
    wFill:
      has(UTILITY("w-full")) || has(/\[width:\s*100%\]/) || has(/(?<![\w-])w-\[100%\]/) ||
      has(/\[flex:\s*1/) || has(UTILITY("flex-1")) || has(UTILITY("grow")),
    // `h-[var(--button-height)]`도 고정 선언이다. `var(`를 빠뜨려 공용 버튼이 전부
    // HUG으로 판정됐고 40px 버튼이 글자 높이 21로 그려졌다.
    hFixed:
      has(new RegExp(String.raw`\[height:\s*${LENGTH}`)) ||
      has(new RegExp(String.raw`(?<![\w-])h-\[${LENGTH}`)) ||
      has(/(?<![\w-])h-\d+(?![\w.%/-])/),
    hFill: has(UTILITY("h-full")) || has(/\[height:\s*100%\]/) || has(/(?<![\w-])h-\[100%\]/),
    maxW: Number((/\[max-width:\s*(\d+(?:\.\d+)?)px\]/.exec(text) || [])[1] || 0),
    minW: Number((/\[min-width:\s*(\d+(?:\.\d+)?)px\]/.exec(text) || [])[1] || 0),
  };
};
// 판정 카나리아 — 위 규칙이 무너지면 생성도 검사도 여기서 멈춘다. 왼쪽이 클래스 문자열, 오른쪽이 기대 판정이다.
// 위 다섯 줄이 감사가 잡은 오판(projectHeader `[width:100%]` · GEO_COUNTRY `min-w-0` · GEO_PCT `min-h-10` ·
// `max-w-full` · 의사 요소 `before:[height:20%]`)이고, 아래는 지키던 판정이 그대로인지 본다.
const DECLARATION_CANARIES = [
  ["[width:100%]", { wFixed: false, wFill: true }],
  ["min-w-0", { wFixed: false, wFill: false }],
  ["min-h-10", { hFixed: false, hFill: false }],
  ["max-w-full", { wFixed: false, wFill: false }],
  ["before:[height:20%]", { hFixed: false, hFill: false }],
  ["[@media(max-width:959px)]:w-full", { wFixed: false, wFill: false }],
  ["grow-0", { wFill: false }],
  ["w-1/2", { wFixed: false, wFill: false }],
  ["w-22", { wFixed: true }],
  ["w-[min(316px,46vw)]", { wFixed: true }],
  ["[width:32px]", { wFixed: true, wFill: false }],
  ["h-[var(--button-height)]", { hFixed: true }],
  ["flex-1", { wFill: true }],
  ["grow", { wFill: true }],
  ["h-full", { hFill: true, hFixed: false }],
  ["h-[30%]", { hRatio: true, hFixed: false, hFill: false }],
  ["[width:60%]", { wRatio: true, wFixed: false, wFill: false }],
  ["w-max", { wHug: true, wFixed: false }],
  ["[height:fit-content]", { hHug: true, hFixed: false }],
];
for (const [classes, expected] of DECLARATION_CANARIES) {
  const got = declFromText(`"${classes}"`);
  for (const [axis, value] of Object.entries(expected)) {
    if (got[axis] !== value) {
      console.error(`[figma-inventory] 선언 판정 카나리아 실패: "${classes}" 의 ${axis} 가 ${got[axis]}(기대 ${value}).`);
      process.exit(1);
    }
  }
}
const declarationOf = (file, part) => {
  const key = file + "|" + part;
  if (declCache.has(key)) return declCache.get(key);
  const decl = declFromText(constantBody(file, part, new Set()));
  declCache.set(key, decl);
  return decl;
};

// ── 측정값 읽기 ─────────────────────────────────────────────────────────
const px = (v) => {
  const m = /^(-?[\d.]+)px$/.exec(v ?? "");
  return m ? Math.round(parseFloat(m[1]) * 100) / 100 : 0;
};
const round3 = (n) => Math.round(n * 1000) / 1000;
// **표기가 두 가지 섞여 있다.** 브라우저는 `rgb()`/`rgba()` 로도, `color(srgb 0.980392 …)`
// (0~1 정규화 + 슬래시 알파)로도 돌려준다. 제품이 LOUIS 토큰으로 색을 단일화한 뒤 후자가
// 790곳에 나타났고, `rgb()` 만 읽던 이 파서는 그것을 통째로 null 로 떨궈 `fg`·`bc` 를 지웠다.
// 같은 결함과 같은 수정이 scripts/lib/figma-tree-spec.mjs(다른 브랜치)에도 있다.
const colorOf = (v) => {
  const raw = (v ?? "").trim();
  const m = /^rgba?\(\s*([\d.]+)[,\s]+([\d.]+)[,\s]+([\d.]+)(?:[,/\s]+([\d.]+))?\s*\)$/.exec(raw);
  if (m) {
    return [round3(+m[1] / 255), round3(+m[2] / 255), round3(+m[3] / 255), m[4] === undefined ? 1 : round3(+m[4])];
  }
  const srgb = /^color\(srgb\s+([\d.]+)\s+([\d.]+)\s+([\d.]+)(?:\s*\/\s*([\d.]+))?\s*\)$/.exec(raw);
  if (srgb) {
    return [round3(+srgb[1]), round3(+srgb[2]), round3(+srgb[3]), srgb[4] === undefined ? 1 : round3(+srgb[4])];
  }
  return null;
};
// **그라디언트는 `background-color`가 아니라 `background-image`에 있다.**
// 공용 Button의 primary가 그렇다 — backgroundColor는 rgba(0,0,0,0)으로 나와서
// 이걸 안 읽으면 채움 버튼이 투명한 테두리 조각으로 그려진다.
// CSS 각도(0deg=위, 시계방향)를 Figma gradientTransform으로 옮긴다.
const gradientOf = (v) => {
  if (!v || v === "none" || !v.startsWith("linear-gradient(")) return null;
  const body = v.slice("linear-gradient(".length, v.lastIndexOf(")"));
  const parts = body.split(/,(?![^(]*\))/).map((x) => x.trim());
  let angle = 180; // CSS 기본은 to bottom
  if (/^(-?[\d.]+)deg$/.test(parts[0])) angle = parseFloat(parts.shift());
  else if (/^to\s/.test(parts[0])) {
    const dir = parts.shift().replace(/^to\s+/, "");
    const map = { top: 0, right: 90, bottom: 180, left: 270 };
    angle = map[dir] ?? 180;
  }
  const stops = [];
  for (const part of parts) {
    // 정지점 색도 `color(srgb …)` 로 나온다 — `rgb()`/`#hex` 만 받으면 정지점이 둘 미만이 되어
    // **그라디언트가 통째로 null 이 된다.** insight-card 의 막대 채움 6곳이 그렇게 사라졌다.
    const m = /^(rgba?\([^)]*\)|color\(srgb[^)]*\)|#[0-9a-fA-F]{3,8})\s*([\d.]+)%?$/.exec(part);
    if (!m) continue;
    const c = colorOf(m[1]);
    if (!c) continue;
    stops.push([round3(parseFloat(m[2]) / 100), c]);
  }
  if (stops.length < 2) return null;
  // Figma는 항등 변환에서 왼→오른쪽으로 흐른다. CSS 90deg(to right)가 그 자리다.
  const rad = ((angle - 90) * Math.PI) / 180;
  const cos = Math.cos(rad), sin = Math.sin(rad);
  const t = [
    [round3(cos), round3(-sin), round3(0.5 - 0.5 * cos + 0.5 * sin)],
    [round3(sin), round3(cos), round3(0.5 - 0.5 * sin - 0.5 * cos)],
  ];
  return { t, s: stops };
};
const firstOuterShadow = (v) => {
  if (!v || v === "none") return null;
  const seg = v.split(/,(?![^(]*\))/).map((s) => s.trim()).find((s) => !s.includes("inset"));
  if (!seg) return null;
  const m = /rgba?\(([\d.]+),\s*([\d.]+),\s*([\d.]+)(?:,\s*([\d.]+))?\)\s+(-?[\d.]+)px\s+(-?[\d.]+)px\s+(-?[\d.]+)px/.exec(seg);
  if (!m) return null;
  return {
    color: [round3(+m[1] / 255), round3(+m[2] / 255), round3(+m[3] / 255), m[4] === undefined ? 1 : round3(+m[4])],
    x: +m[5], y: +m[6], blur: +m[7],
  };
};

const fileOfSpecimen = new Map(specimenFile.specimens.map((s) => [s.id, s.file]));

// 자식 위치를 실측 padding·margin·gap에서 계산한다. 추정하지 않는다.
// parentCtx: null(부모 없음) | {flex:true,row:true|false}
const layout = (node, file, specimenId, parentCtx) => {
  const V = node.values ?? {};
  const width = V.$width ?? 0;
  const height = V.$height ?? 0;
  const cssPad = [px(V.paddingTop), px(V.paddingRight), px(V.paddingBottom), px(V.paddingLeft)];
  const row = (V.display ?? "").includes("flex") && V.flexDirection === "row";
  const gap = V.rowGap && V.rowGap !== "normal" ? px(V.rowGap)
    : (V.columnGap && V.columnGap !== "normal" ? px(V.columnGap) : 0);
  const selfIsFlex = (V.display ?? "").includes("flex") || (V.display ?? "").includes("grid");
  const selfCtx = selfIsFlex ? { flex: true, row: V.flexDirection === "row" } : { flex: false, row: false };
  const innerW = round3(width - cssPad[1] - cssPad[3]);
  const innerH = round3(height - cssPad[0] - cssPad[2]);
  const children = (node.children ?? []).map((c) =>
    layout(c, file, specimenId, { ...selfCtx, innerW, innerH, boxW: width, boxH: height }));

  // absolute 자식은 flow에 없다 — 좌표는 측정에서 그대로 받고, 간격·여백 추론에서 뺀다.
  // 프로젝트 카드가 그렇다: 썸네일(inset:0)·타이틀 오버레이·메뉴 앵커·드롭다운 전부 absolute다.
  const flow = children.filter((c) => !c.abs);

  // 자식 좌표는 **실측**이다. 시뮬레이션하지 않는다 — 가운데 정렬·baseline·stretch를
  // 여백 계산으로 재현하려다 40px 버튼의 아래 여백이 19로 튀었다.
  flow.forEach((child) => {
    const raw = (node.children[children.indexOf(child)].values ?? {});
    child.x = raw.$x ?? 0;
    child.y = raw.$y ?? 0;
  });

  // ⑤ 음수 마진: 실제 바깥 여백은 첫 자식의 자리다. 나머지는 그만큼 안쪽으로 들어간다.
  const pad = [...cssPad];
  if (flow.length) {
    const leadCross = Math.min(...flow.map((c) => (row ? c.y : c.x)));
    const leadMain = Math.min(...flow.map((c) => (row ? c.x : c.y)));
    const crossIdx = row ? 0 : 3;
    const mainIdx = row ? 3 : 0;
    // **여백은 CSS 여백 + 마진이다. 정렬로 생긴 빈틈은 여백이 아니다.**
    // 실측 거리를 그대로 쓰면 가운데 정렬한 버튼의 좌우가 168로 굳어 — 글자가 바뀌어도
    // 안 따라온다. 가운데 맞춤은 여백이 아니라 **정렬**로 옮긴다(아래 primary/counter Align).
    // 마진만 여백에 더한다: 입력 상자의 `margin-top: 8px`(20 = 12+8),
    // 모달 액션 행의 `margin-bottom: -8px`(8 = 16-8).
    const marginOf = (child) => {
      const raw = (node.children[children.indexOf(child)].values ?? {});
      return [px(raw.marginTop), px(raw.marginRight), px(raw.marginBottom), px(raw.marginLeft)];
    };
    const first = marginOf(flow[0]);
    const last = marginOf(flow[flow.length - 1]);
    const crossMargins = flow.map(marginOf);
    pad[mainIdx] = Math.max(0, round3(cssPad[mainIdx] + first[mainIdx]));
    pad[row ? 1 : 2] = Math.max(0, round3(cssPad[row ? 1 : 2] + last[row ? 1 : 2]));
    pad[crossIdx] = Math.max(0, round3(cssPad[crossIdx] + Math.min(...crossMargins.map((m) => m[crossIdx]))));
    pad[row ? 2 : 1] = Math.max(0, round3(cssPad[row ? 2 : 1] + Math.min(...crossMargins.map((m) => m[row ? 2 : 1]))));
  }
  const inset = cssPad.map((c, i) => Math.max(0, round3(c - pad[i])));
  // 자식마다 교차축 들여쓰기가 다르다 — 제목(마진 0)은 pad보다 8 안쪽, 액션(마진 -8)은 pad 그대로.
  // 일괄 inset을 쓰면 액션 행까지 들여써진다. 자식별 ci를 렌더러가 쓴다.
  for (const c of flow) c.ci = Math.max(0, round3((row ? c.y : c.x) - pad[row ? 0 : 3]));

  // ④ 이웃 사이 빈틈. 모두 같으면 itemSpacing 하나, 아니면 큰 간격에서 잘라 중첩한다.
  const gaps = [];
  for (let i = 1; i < flow.length; i++) {
    const a = flow[i - 1], b = flow[i];
    gaps.push(round3(row ? b.x - (a.x + a.w) : b.y - (a.y + a.h)));
  }
  const uniform = gaps.length === 0 || gaps.every((g) => Math.abs(g - gaps[0]) < 0.02);

  // 렌더 시점 합성이면 **합친 목록 전체**에서 선언을 찾는다 — 공용 버튼의 높이는
  // VARIANT가 아니라 SIZE_MD(`h-[var(--button-height)]`)에 있다.
  const decl = (node.parts ?? [node.part])
    .map((name) => declarationOf(file, name))
    .reduce((a, b) => ({
      wFixed: a.wFixed || b.wFixed, wFill: a.wFill || b.wFill,
      hFixed: a.hFixed || b.hFixed, hFill: a.hFill || b.hFill,
      wRatio: a.wRatio || b.wRatio, hRatio: a.hRatio || b.hRatio,
      wHug: a.wHug || b.wHug, hHug: a.hHug || b.hHug,
      maxW: a.maxW || b.maxW, minW: a.minW || b.minW,
    }));
  const empty = flow.length === 0 && !node.text;
  const isAbs = V.position === "absolute" || V.position === "fixed";
  const lineHeight = px(V.lineHeight);
  const fontSize = px(V.fontSize);
  const plain = !colorOf(V.backgroundColor)?.[3] && px(V.borderTopWidth) === 0 && px(V.borderTopLeftRadius) === 0;

  // **빈 잎의 크기는 추측하지 않고 잰다.** 자식도 글자도 없으면 hug가 0이 되므로 FIX로
  // 굳히기 쉬운데, 그러면 조립할 때 부모를 늘려도 안 따라온다. 실제로 `INPUT`(372-32=340),
  // 카드 썸네일(inset:0), 진행 막대 채움이 전부 그렇게 굳어 있었다.
  // 판정 근거는 측정값이다 — 부모 안쪽 상자와 같으면 부모가 준 것이다.
  // 안쪽 상자와 같으면 부모가 준 것이고, **바깥 상자와 같으면** 음수 마진으로 걸친 것이다
  // (메뉴 구분선이 그렇다). 둘 다 부모가 폭을 정한다.
  const fillsParentW = empty && parentCtx &&
    (Math.abs(width - (parentCtx.innerW ?? -1)) < 0.5 || Math.abs(width - (parentCtx.boxW ?? -1)) < 0.5);
  const fillsParentH = empty && parentCtx &&
    (Math.abs(height - (parentCtx.innerH ?? -1)) < 0.5 || Math.abs(height - (parentCtx.boxH ?? -1)) < 0.5);
  // **0으로 잰 축은 내용 슬롯이다.** 아이콘·점·썸 같은 자리는 제품에서 SVG나 React 자식이
  // 채우는데 하네스에는 클래스만 있어 0이 된다. 0을 FIX로 굳히면 조립할 때 내용을 넣어도
  // 안 자란다 — hug로 두어 내용이 정하게 한다. 크기를 지어내지 않는다.
  const slotW = empty && width < 0.5;
  const slotH = empty && height < 0.5;
  const isAbs2 = V.position === "absolute" || V.position === "fixed";
  // absolute + inset:0(부모 상자를 그대로 덮음)은 두 축 모두 부모가 준다.
  const coversParent = isAbs2 && parentCtx &&
    Math.abs((V.$x ?? 1) - 0) < 0.5 && Math.abs((V.$y ?? 1) - 0) < 0.5 &&
    Math.abs(width - (parentCtx.boxW ?? -1)) < 0.5 && Math.abs(height - (parentCtx.boxH ?? -1)) < 0.5;

  return {
    part: node.part,
    slot: slotW || slotH,
    text: node.text ?? "",
    w: width, h: height,
    // absolute면 측정된 오프셋을 그대로 갖는다. flow면 위 커서 계산이 채운다.
    abs: isAbs, x: isAbs ? (V.$x ?? 0) : 0, y: isAbs ? (V.$y ?? 0) : 0,
    pad, inset,
    gap: uniform ? (gaps[0] ?? 0) : 0,
    gaps: uniform ? [] : gaps,
    dir: row ? "H" : "V",
    // 정렬을 실측한다. 가운데 맞춤·양끝 배치는 여백이 아니라 정렬로 재현해야
    // 조립할 때 내용이 바뀌어도 따라온다.
    justify: V.justifyContent ?? "flex-start",
    align: V.alignItems ?? "stretch",
    bg: colorOf(V.backgroundColor),
    gradient: gradientOf(V.backgroundImage),
    fg: colorOf(V.color),
    radius: px(V.borderTopLeftRadius) || (V.borderTopLeftRadius === "50%" ? -1 : 0),
    borderWidth: px(V.borderTopWidth),
    borderColor: colorOf(V.borderTopColor),
    shadow: firstOuterShadow(V.boxShadow),
    fontSize,
    // ③ 행간은 비율로 옮긴다.
    lineHeightPct: fontSize ? Math.round((lineHeight / fontSize) * 1000) / 10 : 150,
    weight: parseInt(V.fontWeight ?? "400", 10),
    letterSpacing: px(V.letterSpacing),
    // ② 글자는 언제나 자동. block으로 잰 글자만 폭을 부모에게 받는다.
    isText: Boolean(node.text) && children.length === 0 && plain,
    textFill: (V.display ?? "") === "block",
    // ① 크기는 선언된 것만 고정한다.
    // 폭을 누가 정하는가.
    //   선언이 있으면 그것이 정한다.
    //   **flex/grid 자식**은 blockify돼도 폭이 내용에서 나온다 → 내용이 정한다.
    //   일반 흐름의 block은 부모 폭을 채운다 → 부모가 준다.
    //   inline 계열도 내용이 정한다.
    // 이 구분을 놓쳐 빈 상태 패널이 372에서 225로 줄고, 배지가 반대로 늘어났었다.
    // 폭을 누가 정하는가. 부모의 축이 가른다.
    //   flex **행**의 자식 → 폭이 주축이라 내용이 정한다(HUG). 배지·칩이 그렇다.
    //   flex **열**의 자식 → 폭이 교차축이고 stretch가 기본이라 부모가 준다(FILL). 빈 상태가 그렇다.
    //   일반 흐름의 block → 부모 폭을 채운다(FILL).
    //   inline 계열 → 내용이 정한다(HUG).
    // 이 구분을 놓쳐 빈 상태 패널이 372에서 225로 줄고 배지가 반대로 늘어났었다.
    wx: decl.wFixed || decl.wRatio ? "FIX"
      : (decl.wFill || coversParent ? "FILL"
        : decl.wHug ? "HUG"
        : (empty ? (fillsParentW ? "FILL" : (slotW ? "HUG" : "FIX"))
          : ((parentCtx && parentCtx.flex && parentCtx.row) || (V.display ?? "").startsWith("inline") ? "HUG" : "FILL"))),
    // **왜 그 정책인가.** 선언에서 온 것과 폴백으로 굳은 것을 구분해야 조립할 때 믿을 수 있다.
    //   선언   제품이 명시했다 — 그대로 고정해도 된다
    //   빈칸   자식도 글자도 없어 hug가 0이 된다 — 실측으로 굳혔을 뿐, 선언이 아니다
    //   주축   flex 행의 자식이라 내용이 정한다
    //   교차축 flex 열/블록이라 부모가 준다
    wy: decl.wFixed ? "선언" : decl.wRatio ? "선언(비율)" : (decl.wFill ? "선언(채움)" : (coversParent ? "덮음" : decl.wHug ? "선언(내용)" : (empty ? (fillsParentW ? "부모폭" : (slotW ? "슬롯" : "빈칸")) :
      ((parentCtx && parentCtx.flex && parentCtx.row) || (V.display ?? "").startsWith("inline") ? "주축" : "교차축")))),
    hy: decl.hFixed ? "선언" : decl.hRatio ? "선언(비율)" : (decl.hFill ? "선언(채움)" : (coversParent ? "덮음" : decl.hHug ? "선언(내용)" : (empty ? (fillsParentH ? "부모높이" : (slotH ? "슬롯" : "빈칸")) : "내용"))),
    hx: decl.hFixed || decl.hRatio ? "FIX"
      : (decl.hFill || coversParent ? "FILL"
        : decl.hHug ? "HUG"
        : (empty ? (fillsParentH ? "FILL" : (slotH ? "HUG" : "FIX")) : "HUG")),
    minW: decl.minW || px(V.minWidth) || 0,
    minH: px(V.minHeight) || 0,
    maxW: decl.maxW || 0,
    children,
  };
};

const KIND_LABEL = {
  dialog: "모달", toast: "토스트", "icon-button": "아이콘 버튼", badge: "배지·칩",
  spinner: "스피너", avatar: "아바타", tooltip: "툴팁", "text-field": "텍스트 필드",
  slider: "슬라이더", "progress-bar": "진행 막대", checkbox: "체크박스",
  "empty-state": "빈 상태", "segmented-control": "세그먼트 컨트롤",
  "selectable-list-row": "선택 가능한 목록 행", skeleton: "스켈레톤",
  "menu-popover": "메뉴 팝오버", "project-card": "프로젝트 카드",
  button: "버튼", "input-form": "폼 입력(플로팅 라벨)", "gnb-sidebar": "GNB 사이드바",
  "banner-carousel": "배너 캐러셀", "top-bar": "상단 바", admin: "관리자 요소",
  "insight-card": "분석 카드", "canvas-node": "캔버스 노드",
  "skeleton-block": "스켈레톤 블록", "progress-ring": "프로필 링",
};

const byKind = new Map();
for (const spec of measured.specimens) {
  const file = fileOfSpecimen.get(spec.id);
  if (!file) continue;
  const meta0 = specimenFile.specimens.find((s) => s.id === spec.id);
  // 표본 루트의 부모는 host다. host를 선언했다면 그것은 크기를 바꾸는 부모이며
  // (scripts/verify-specimen-context.mjs가 그것만 host로 받는다) 사실상 flex다.
  const host = (meta0?.host ?? [])[0];
  // host가 flex 열이면 표본은 부모 폭으로 늘어난다. 행이면 내용이 폭을 정한다.
  let rootCtx = { flex: false, row: false };
  if (host) {
    const hostFile = typeof host === "string" ? file : host.file;
    const hostPart = typeof host === "string" ? host : host.part;
    const body = source(hostFile);
    const m = new RegExp("^\\s*(?:const\\s+)?" + hostPart + "\\s*[:=]\\s*(\\[[\\s\\S]*?\\]\\.join|\"[^\"]*\")", "m").exec(body);
    const text = m ? m[1] : "";
    const isCol = /\bflex-col\b/.test(text) || /flex-direction:\s*column/.test(text);
    rootCtx = { flex: true, row: !isCol };
  }
  const tree = layout(spec.tree, file, spec.id, rootCtx);
  // 표본 **루트**의 absolute/fixed는 페이지 기준 좌표라 판에 옮길 수 없다(토스트가
  // y:-18175로 나왔다). 루트는 flow로 그리고, absolute 처리는 자식에게만 적용한다.
  tree.abs = false; tree.x = 0; tree.y = 0;
  const meta = specimenFile.specimens.find((s) => s.id === spec.id);
  const entry = {
    id: spec.id,
    label: spec.label,
    jsx: (spec.jsx ?? "").replace(/^apps\/web\/.*\//, ""),
    hosted: (meta?.host ?? []).length > 0,
    hostNone: meta?.hostNone ?? "",
    tree,
  };
  if (!byKind.has(spec.kind)) byKind.set(spec.kind, []);
  byKind.get(spec.kind).push(entry);
}

const sections = [...byKind.entries()]
  .sort((a, b) => b[1].length - a[1].length || a[0].localeCompare(b[0]))
  .map(([kind, specimens]) => ({
    kind,
    label: KIND_LABEL[kind] ?? kind,
    count: specimens.length,
    specimens: specimens.sort((a, b) => a.id.localeCompare(b.id)),
  }));

const countNodes = (n) => 1 + n.children.reduce((s, c) => s + countNodes(c), 0);
const totalNodes = sections.reduce((s, sec) => s + sec.specimens.reduce((t, x) => t + countNodes(x.tree), 0), 0);


// ── Figma 실행 코드 ────────────────────────────────────────────────────────
// **렌더러도 여기서 만든다.** 계획만 코드로 옮기고 그리는 코드를 대화에 두었더니
// 배치마다 손으로 조정하다 또 어긋났다(세그먼트 컨트롤이 그랬다). 실행 코드까지 생성해
// 그대로 전달만 하게 한다.
const RENDERER = String.raw`
const page=figma.root.children.find(p=>p.name==="Product inventory");
await figma.setCurrentPageAsync(page);
let root=page.children.find(n=>n.name==="합치기 비교판 — 제품 경쟁 정의");
if(RESET){for(const s of [...root.children]) if(s.name!=="읽는 법") s.remove();}
const INK={r:0.98,g:0.98,b:0.98};
const stageFill=[{type:"SOLID",color:INK,opacity:0.03}];
const WT={400:"Regular",500:"Medium",600:"SemiBold",700:"Bold"};
const F=w=>({family:"Pretendard",style:WT[w]||"Regular"});
for(const w of Object.keys(WT)) await figma.loadFontAsync(F(+w));
const bold=F(700),reg=F(400);
const P=v=>Math.max(0,Number(v)||0);
const paint=c=>(!c||c[3]===0?[]:[{type:"SOLID",color:{r:c[0],g:c[1],b:c[2]},opacity:c[3]}]);
// 그라디언트는 background-image에서 온다. 이걸 안 쓰면 채움 버튼이 투명해진다.
const fillOf=n=>{
 if(n.gr) return [{type:"GRADIENT_LINEAR",gradientTransform:n.gr.t,
   gradientStops:n.gr.s.map(st=>({position:st[0],color:{r:st[1][0],g:st[1][1],b:st[1][2],a:st[1][3]}}))}];
 return paint(n.bg);};
const mkTxt=n=>{const t=figma.createText();t.name=n.p;t.fontName=F(n.fw);t.characters=n.t;t.fontSize=n.fs||14;
 t.lineHeight={unit:"PERCENT",value:n.lp||150};if(n.ls)t.letterSpacing={unit:"PIXELS",value:n.ls};
 t.fills=paint(n.fg);t.textAutoResize="WIDTH_AND_HEIGHT";
 t.textAlignHorizontal="CENTER";t.textAlignVertical="CENTER";return t;};
// FILL은 FILL로 남긴다. FILL이 성립하려면 부모가 폭을 가져야 하므로,
// hug 부모가 FILL 자식을 가지면 build()가 그 부모를 실측폭으로 고정한다.
const place=(parent,spec)=>{const node=build(spec);parent.appendChild(node);
 if(spec.abs){
  // 제품이 absolute로 띄우는 자식이다. flow 밖에 측정 좌표 그대로 놓는다.
  try{node.layoutPositioning="ABSOLUTE";}catch(e){}
  node.x=spec.x;node.y=spec.y;
  return node;}
 try{if(spec.wx==="FILL")node.layoutSizingHorizontal="FILL";}catch(e){}
 try{if(spec.hx==="FILL")node.layoutSizingVertical="FILL";}catch(e){}
 return node;};
// 간격이 제각각이면 큰 간격에서 잘라 중첩 오토레이아웃으로 묶는다. spacer는 쓰지 않는다.
// 음수 마진으로 바깥 여백이 깎였으면(ins) 묶음이 그만큼 안쪽 여백을 갖는다.
// 묶음의 안쪽 여백은 일괄값이 아니라 **그 묶음 첫 자식의 ci**다 — 음수 마진이 없는
// 자식(제목·설명)만 안쪽으로 들어가고, 음수 마진 자식(액션 행)은 pad 자리에서 시작한다.
const wrapSeg=(f,n,seg,inner)=>{
 const ci=P(seg[0]&&seg[0].ci);
 if(!ci&&seg.length===1){place(f,seg[0]);return;}
 const grp=figma.createAutoLayout(n.H?"HORIZONTAL":"VERTICAL",{name:"묶음",itemSpacing:seg.length>1?inner:0});
 grp.fills=[];
 if(n.H){grp.paddingTop=ci;grp.paddingBottom=ci;}else{grp.paddingLeft=ci;grp.paddingRight=ci;}
 f.appendChild(grp);for(const k of seg)place(grp,k);
 grp.layoutSizingHorizontal=n.H?"HUG":"FILL";grp.layoutSizingVertical=n.H?"FILL":"HUG";};
const addKids=(f,n)=>{const kids=n.c||[];
 if(!n.gs||!n.gs.length){
  if(kids.some(k=>P(k.ci))){wrapSeg(f,n,kids,P(n.gap));return;}
  for(const k of kids)place(f,k);return;}
 const big=Math.max.apply(null,n.gs);let inner=0;
 for(const g of n.gs){if(Math.abs(g-big)>=0.02){inner=g;break;}}
 f.itemSpacing=big;const segs=[[kids[0]]];
 n.gs.forEach((g,i)=>{if(Math.abs(g-big)<0.02)segs.push([kids[i+1]]);else segs[segs.length-1].push(kids[i+1]);});
 for(const seg of segs)wrapSeg(f,n,seg,inner);};
const build=n=>{
 if(n.T&&!(n.c||[]).length)return mkTxt(n);
 const f=figma.createAutoLayout(n.H?"HORIZONTAL":"VERTICAL",{name:n.p,itemSpacing:P(n.gap)});
 const pad=n.pad||[0,0,0,0];
 f.paddingTop=P(pad[0]);f.paddingRight=P(pad[1]);f.paddingBottom=P(pad[2]);f.paddingLeft=P(pad[3]);
 f.fills=fillOf(n);
 f.cornerRadius=n.r===-1?Math.max(1,Math.min(n.w,n.h))/2:Math.min(P(n.r),Math.max(1,Math.min(n.w,n.h))/2);
 if(n.bw>0&&n.bc){f.strokes=paint(n.bc);f.strokeWeight=n.bw;f.strokeAlign="INSIDE";}
 // 내용 슬롯: 제품에서 SVG·자식이 채우는 자리라 하네스가 0으로 쟀다. 크기를 지어내지 않고
 // 점선으로 자리만 보여 준다 — 조립할 때 여기에 아이콘을 넣으면 hug로 자란다.
 if(n.slot){f.name="슬롯: "+n.p;f.strokes=[{type:"SOLID",color:INK,opacity:0.25}];
  f.strokeWeight=1;f.strokeAlign="INSIDE";f.dashPattern=[3,3];f.minWidth=8;f.minHeight=8;}
 if(n.sh)f.effects=[{type:"DROP_SHADOW",visible:true,blendMode:"NORMAL",
   color:{r:n.sh[0][0],g:n.sh[0][1],b:n.sh[0][2],a:n.sh[0][3]},offset:{x:n.sh[1],y:n.sh[2]},radius:n.sh[3],spread:0}];
 // CSS 정렬을 그대로 옮긴다. 하드코딩한 CENTER는 양끝 배치·왼쪽 정렬을 뭉갠다.
 const JM={"center":"CENTER","flex-end":"MAX","space-between":"SPACE_BETWEEN","flex-start":"MIN","normal":"MIN"};
 const AM={"center":"CENTER","flex-end":"MAX","flex-start":"MIN","baseline":"BASELINE","stretch":"MIN","normal":"MIN"};
 f.primaryAxisAlignItems=JM[n.J||"flex-start"]||"MIN";
 f.counterAxisAlignItems=AM[n.A||"stretch"]||"MIN";
 f.clipsContent=false;
 if(n.t)f.appendChild(mkTxt(n));
 addKids(f,n);
 // hug 부모가 FILL 자식을 가지면 FILL이 성립하지 않는다. 그때 부모를 실측 크기로
 // 고정한다 — 자식의 FILL은 그대로 남아, 조립할 때 부모 고정만 풀면 된다.
 const kidsAll=n.c||[];
 const wxEff=(n.wx==="HUG"&&kidsAll.some(k=>k.wx==="FILL"))?"FIX":n.wx;
 const hxEff=(n.hx==="HUG"&&kidsAll.some(k=>k.hx==="FILL"))?"FIX":n.hx;
 if(wxEff==="FIX"){f.layoutSizingHorizontal="FIXED";f.resize(Math.max(1,n.w),f.height);}
 if(hxEff==="FIX"){f.layoutSizingVertical="FIXED";f.resize(f.width,Math.max(1,n.h));}
 if(n.mw)f.minWidth=n.mw;if(n.mh)f.minHeight=n.mh;if(n.xw)f.maxWidth=n.xw;
 return f;};
const T=(s,sz,w,a,wd)=>{const t=figma.createText();t.fontName=w==="b"?bold:reg;t.characters=s;t.fontSize=sz;
 t.fills=[{type:"SOLID",color:INK,opacity:a}];
 if(wd){t.textAutoResize="NONE";t.resize(wd,10);t.textAutoResize="HEIGHT";}return t;};
const created=[],check=[],skipped=[];
for(const sec of PLAN){
 // 같은 섹션이 이미 있으면 지우고 다시 그린다 — draw 파일 하나만 재실행해도 중복이 없다.
 const prev=root.children.find(x=>x.name==="sec:"+sec.k);
 if(prev)prev.remove();
 const s=figma.createAutoLayout("VERTICAL",{name:"sec:"+sec.k,itemSpacing:24});
 s.fills=[];root.appendChild(s);
 s.appendChild(T(sec.L+" — 제품 표본 "+sec.sp.length+"종",24,"b",1));
 const rows=figma.createAutoLayout("HORIZONTAL",{name:"실제 모습",itemSpacing:40});
 rows.fills=[];rows.layoutWrap="WRAP";rows.counterAxisSpacing=40;s.appendChild(rows);
 rows.layoutSizingHorizontal="FIXED";rows.resize(1700,rows.height);rows.layoutSizingVertical="HUG";
 for(const sp of sec.sp){
  const cardW=Math.max(360,Math.ceil(sp.t.w)+80);
  const card=figma.createAutoLayout("VERTICAL",{name:sp.i,itemSpacing:12});
  card.fills=[];rows.appendChild(card);
  card.layoutSizingHorizontal="FIXED";card.resize(cardW,card.height);card.layoutSizingVertical="HUG";
  const stage=figma.createAutoLayout("HORIZONTAL",{name:"stage",itemSpacing:0,paddingTop:28,paddingRight:28,paddingBottom:28,paddingLeft:28});
  stage.fills=stageFill;stage.cornerRadius=12;
  stage.primaryAxisAlignItems="CENTER";stage.counterAxisAlignItems="CENTER";stage.clipsContent=true;
  card.appendChild(stage);stage.layoutSizingHorizontal="FILL";stage.layoutSizingVertical="HUG";
  if(sp.t.h<1||sp.t.w<1){
   stage.appendChild(T("실측 "+sp.t.w+"×"+sp.t.h+" — 하네스에서 내용(썸네일·비디오)이 없어 접혔다. 아직 그릴 수 없다.",12,"r",0.55,cardW-96));
   skipped.push(sp.i);
  } else {
   // FILL은 FILL로 남긴다 — 나중에 조립할 때 그대로 쓰기 위해서다.
   // 대신 **무대를 실측폭+여백으로 고정**해 FILL이 정확히 실측폭을 받게 한다.
   if(sp.t.wx==="FILL"){stage.layoutSizingHorizontal="FIXED";stage.resize(Math.ceil(sp.t.w)+56,stage.height);}
   const built=place(stage,sp.t);
   check.push({i:sp.i,m:sp.t.w+"×"+sp.t.h,f:Math.round(built.width*100)/100+"×"+Math.round(built.height*100)/100});
  }
  const head=figma.createAutoLayout("VERTICAL",{name:"head",itemSpacing:3});
  head.fills=[];card.appendChild(head);head.layoutSizingHorizontal="FILL";
  head.appendChild(T(sp.l,14,"b",1,cardW-40));
  head.appendChild(T(sp.j,11,"r",0.42,cardW-40));
  // 크기 정책과 **그 근거**를 함께 적는다 — 조립할 때 무엇을 믿어도 되는지 알려면 필요하다.
  const SZ={FIX:"고정",FILL:"채움",HUG:"허그"};
  head.appendChild(T(sp.t.p+" · "+sp.t.w+"×"+sp.t.h,11,"r",0.62,cardW-40));
  head.appendChild(T("폭 "+SZ[sp.t.wx]+"("+sp.t.wy+")  ·  높이 "+SZ[sp.t.hx]+"("+sp.t.hy+")",11,"r",0.45,cardW-40));
  created.push(card.id);}}
const drift=check.filter(c=>c.m!==c.f);
return {count:created.length,어긋난것:drift.length,drift:drift.slice(0,12),그릴수없음:skipped};
`;

// 계획을 그리기 좋은 최소 형태로 줄인다.
const zero = (a) => a.every((x) => !x);
const compact = (n) => {
  // absolute는 부모 flow 밖이라 FILL이 성립하지 않는다 — 그 축만 측정 크기로 고정하고 좌표를 갖는다.
  // 선언 고정 · 내용(HUG) 판정은 그대로 둔다 — 전에는 absolute 면 두 축을 무조건 고정해 내용이 정하는
  // 배지 · 라벨까지 측정 크기로 굳었다(크기 굳힘 감사 묶음 7).
  // 부모를 그대로 덮는 absolute는 좌표가 아니라 **채움**으로 옮긴다 — 그래야 조립할 때
  // 부모를 늘리면 따라온다. 그 밖의 absolute만 측정 좌표를 갖는다.
  const covers = n.abs && n.wx === "FILL" && n.hx === "FILL";
  const floating = n.abs && !covers;
  const o = floating
    ? { p: n.part, w: n.w, h: n.h, wx: n.wx === "FILL" ? "FIX" : n.wx, hx: n.hx === "FILL" ? "FIX" : n.hx, abs: 1, x: n.x, y: n.y }
    : { p: n.part, w: n.w, h: n.h, wx: n.wx, hx: n.hx };
  if (n.ci) o.ci = n.ci;
  if (n.slot) o.slot = 1;
  o.wy = floating && n.wx === "FILL" ? "절대 배치라 채움 불가 → 실측" : n.wy;
  o.hy = floating && n.hx === "FILL" ? "절대 배치라 채움 불가 → 실측" : n.hy;
  if (!zero(n.pad)) o.pad = n.pad;
  if (!zero(n.inset)) o.ins = n.inset;
  if (n.gap) o.gap = n.gap;
  if (n.gaps.length) o.gs = n.gaps;
  if (n.dir === "H") o.H = 1;
  if (n.justify && n.justify !== "flex-start") o.J = n.justify;
  if (n.align && n.align !== "stretch") o.A = n.align;
  if (n.bg && n.bg[3]) o.bg = n.bg;
  if (n.gradient) o.gr = n.gradient;
  if (n.radius) o.r = n.radius;
  if (n.borderWidth > 0) { o.bw = n.borderWidth; o.bc = n.borderColor; }
  if (n.shadow && n.shadow.blur > 0) o.sh = [n.shadow.color, n.shadow.x, n.shadow.y, n.shadow.blur];
  if (n.text) { o.t = n.text; o.fg = n.fg; o.fs = n.fontSize; o.fw = n.weight; if (n.letterSpacing) o.ls = n.letterSpacing; o.lp = n.lineHeightPct; }
  if (n.isText) o.T = 1;
  if (n.minW) o.mw = n.minW;
  if (n.minH) o.mh = n.minH;
  if (n.maxW) o.xw = n.maxW;
  if (n.children.length) o.c = n.children.map(compact);
  // 내용이 정하는(HUG) 부모가 채움(FILL) 자식을 가지면 Figma 에서 채움이 성립하지 않아, 그리기 코드가 그 부모를
  // 실측 크기로 고정한다. 그 사실을 계획의 사유에도 남긴다 — 판정은 HUG 그대로다(조립할 때 부모 고정만 풀면 된다).
  const kids = o.c ?? [];
  if (o.wx === "HUG" && kids.some((k) => k.wx === "FILL")) o.wy += " · 채움 자식 → 그릴 때 실측 고정";
  if (o.hx === "HUG" && kids.some((k) => k.hx === "FILL")) o.hy += " · 채움 자식 → 그릴 때 실측 고정";
  return o;
};
const drawSections = sections.map((s) => ({
  k: s.kind, L: s.label,
  sp: s.specimens.map((x) => ({ i: x.id, l: x.label, j: x.jsx, t: compact(x.tree) })),
}));
const chunks = [];
let bucket = [], size = 0;
for (const s of drawSections) {
  const n = JSON.stringify(s).length;
  if (size + n > 13000 && bucket.length) { chunks.push(bucket); bucket = []; size = 0; }
  bucket.push(s); size += n;
}
if (bucket.length) chunks.push(bucket);
const drawFiles = chunks.map((chunk, i) => ({
  absolute: resolve(repoRoot, "figma/inventory-draw." + (i + 1) + ".js"),
  expected:
    "// 생성물. scripts/build-figma-inventory.mjs가 만든다. 직접 수정하지 않는다.\n" +
    "// use_figma에 이 파일 내용을 그대로 넘긴다. 손대면 계획과 어긋난다.\n" +
    "const RESET=" + (i === 0 ? "true" : "false") + ";\n" +
    "const PLAN=" + JSON.stringify(chunk) + ";\n" +
    RENDERER,
}));

const payload =
  JSON.stringify(
    {
      $comment:
        "생성물. scripts/build-figma-inventory.mjs가 실측에서 만든다. 직접 수정하지 않는다.",
      $whyThisExists:
        "Figma 변환 규칙이 대화 안에만 있어서 다시 그릴 때마다 합의한 것이 사라졌다 — 모달의 여백 분할, 아바타의 선언 크기, 텍스트 자동 크기, 중첩 오토레이아웃이 매번 유실됐다. 규칙을 코드로 옮겨 그 고리를 끊는다.",
      $rules: [
        "크기는 제품이 선언한 것만 고정한다. 결과값을 고정하면 내용이 바뀔 때 깨진다.",
        "글자는 언제나 자동이다. block으로 잰 글자만 폭을 부모에게 받는다.",
        "행간은 비율이다. 제품이 무단위로 선언하고 브레이크포인트에서 글자 크기만 바뀐다.",
        "간격이 제각각이면 중첩 오토레이아웃으로 묶는다. spacer 프레임은 쓰지 않는다.",
        "음수 마진은 여백을 바깥·안쪽으로 나눠 만든다.",
      ],
      productRef: ref,
      productCommit: commit,
      sections,
    },
    null,
    2,
  ) + "\n";

if (checkOnly) {
  let current = "";
  try {
    current = readFileSync(outputPath, "utf8");
  } catch {
    console.error("[figma-inventory] 생성물이 없습니다: figma/inventory-plan.json");
    process.exit(1);
  }
  if (current !== payload) {
    console.error("[figma-inventory] 계획이 실측과 다릅니다. `node scripts/build-figma-inventory.mjs`로 다시 만드세요.");
    process.exit(1);
  }
  for (const f of drawFiles) {
    let now = "";
    try { now = readFileSync(f.absolute, "utf8"); } catch { now = ""; }
    if (now !== f.expected) {
      console.error("[figma-inventory] 그리기 코드가 계획과 다릅니다: " + f.absolute.split("/").pop());
      process.exit(1);
    }
  }
} else {
  atomicWriteBatch([{ absolute: outputPath, expected: payload }, ...drawFiles]);
}

console.log(
  "[figma-inventory] " + (checkOnly ? "checked" : "built") + " @ " + commit.slice(0, 8) +
    ": 종류 " + sections.length + " · 표본 " + sections.reduce((s, x) => s + x.count, 0) +
    " · 노드 " + totalNodes +
    " · 폭 선언고정 " + [...declCache.values()].filter((d) => d.wFixed).length +
    " · 폭 부모지정 " + [...declCache.values()].filter((d) => d.wFill).length +
    " · 그리기 코드 " + drawFiles.length + "개",
);
