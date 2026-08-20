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
//      `w-full` · `[width:100%]`                              → 부모가 준다(FILL)
//      선언 없음                                              → 내용이 정한다(HUG)
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
const declarationOf = (file, part) => {
  const key = file + "|" + part;
  if (declCache.has(key)) return declCache.get(key);
  const body = source(file);
  const found = new RegExp("^\\s*(?:const\\s+)?" + part + "\\s*[:=]\\s*(\\[[\\s\\S]*?\\]\\.join|\"[^\"]*\")", "m").exec(body);
  const text = found ? found[1] : "";
  const has = (re) => re.test(text);
  const decl = {
    // 숫자 유틸리티(`w-22`)도 선언이다. 이 저장소는 spacing 1단위가 2px이라 w-22 = 44px이다.
    wFixed: has(/\[width:\s*(?:\d|min\(|calc\(|var\()/) || has(/\bw-\[(?:\d|min\(|calc\()/) || has(/\bw-\d+\b/),
    wFill: has(/\bw-full\b/) || has(/\[width:\s*100%\]/),
    hFixed: has(/\[height:\s*(?:\d|min\(|calc\(|var\()/) || has(/\bh-\[(?:\d|min\(|calc\()/) || has(/\bh-\d+\b/),
    hFill: has(/\bh-full\b/) || has(/\[height:\s*100%\]/),
    maxW: Number((/\[max-width:\s*(\d+(?:\.\d+)?)px\]/.exec(text) || [])[1] || 0),
    minW: Number((/\[min-width:\s*(\d+(?:\.\d+)?)px\]/.exec(text) || [])[1] || 0),
  };
  declCache.set(key, decl);
  return decl;
};

// ── 측정값 읽기 ─────────────────────────────────────────────────────────
const px = (v) => {
  const m = /^(-?[\d.]+)px$/.exec(v ?? "");
  return m ? Math.round(parseFloat(m[1]) * 100) / 100 : 0;
};
const round3 = (n) => Math.round(n * 1000) / 1000;
const colorOf = (v) => {
  const m = /^rgba?\(\s*([\d.]+)[,\s]+([\d.]+)[,\s]+([\d.]+)(?:[,/\s]+([\d.]+))?\s*\)$/.exec((v ?? "").trim());
  if (!m) return null;
  return [round3(+m[1] / 255), round3(+m[2] / 255), round3(+m[3] / 255), m[4] === undefined ? 1 : round3(+m[4])];
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
const layout = (node, file, specimenId) => {
  const V = node.values ?? {};
  const width = V.$width ?? 0;
  const height = V.$height ?? 0;
  const cssPad = [px(V.paddingTop), px(V.paddingRight), px(V.paddingBottom), px(V.paddingLeft)];
  const row = (V.display ?? "").includes("flex") && V.flexDirection === "row";
  const gap = V.rowGap && V.rowGap !== "normal" ? px(V.rowGap)
    : (V.columnGap && V.columnGap !== "normal" ? px(V.columnGap) : 0);
  const children = (node.children ?? []).map((c) => layout(c, file, specimenId));

  // 자식 좌표: 여백 → 마진 → 크기 → 간격 순으로 쌓는다.
  let cursor = row ? cssPad[3] : cssPad[0];
  children.forEach((child, i) => {
    const raw = (node.children[i].values ?? {});
    const m = [px(raw.marginTop), px(raw.marginRight), px(raw.marginBottom), px(raw.marginLeft)];
    if (row) {
      cursor += m[3];
      child.x = round3(cursor); child.y = round3(cssPad[0] + m[0]);
      cursor += child.w + m[1] + (i < children.length - 1 ? gap : 0);
    } else {
      cursor += m[0];
      child.x = round3(cssPad[3] + m[3]); child.y = round3(cursor);
      cursor += child.h + m[2] + (i < children.length - 1 ? gap : 0);
    }
  });

  // ⑤ 음수 마진: 실제 바깥 여백은 첫 자식의 자리다. 나머지는 그만큼 안쪽으로 들어간다.
  const pad = [...cssPad];
  if (children.length) {
    const leadCross = Math.min(...children.map((c) => (row ? c.y : c.x)));
    const leadMain = Math.min(...children.map((c) => (row ? c.x : c.y)));
    const crossIdx = row ? 0 : 3;
    const mainIdx = row ? 3 : 0;
    if (leadCross < cssPad[crossIdx] - 0.02) pad[crossIdx] = Math.max(0, round3(leadCross));
    if (leadMain < cssPad[mainIdx] - 0.02) pad[mainIdx] = Math.max(0, round3(leadMain));
    const tailMain = (row ? width - Math.max(...children.map((c) => c.x + c.w)) : height - Math.max(...children.map((c) => c.y + c.h)));
    const tailIdx = row ? 1 : 2;
    if (tailMain < cssPad[tailIdx] - 0.02) pad[tailIdx] = Math.max(0, round3(tailMain));
  }
  const inset = cssPad.map((c, i) => Math.max(0, round3(c - pad[i])));

  // ④ 이웃 사이 빈틈. 모두 같으면 itemSpacing 하나, 아니면 큰 간격에서 잘라 중첩한다.
  const gaps = [];
  for (let i = 1; i < children.length; i++) {
    const a = children[i - 1], b = children[i];
    gaps.push(round3(row ? b.x - (a.x + a.w) : b.y - (a.y + a.h)));
  }
  const uniform = gaps.length === 0 || gaps.every((g) => Math.abs(g - gaps[0]) < 0.02);

  const decl = declarationOf(file, node.part);
  const empty = children.length === 0 && !node.text;
  const lineHeight = px(V.lineHeight);
  const fontSize = px(V.fontSize);
  const plain = !colorOf(V.backgroundColor)?.[3] && px(V.borderTopWidth) === 0 && px(V.borderTopLeftRadius) === 0;

  return {
    part: node.part,
    text: node.text ?? "",
    w: width, h: height, x: 0, y: 0,
    pad, inset,
    gap: uniform ? (gaps[0] ?? 0) : 0,
    gaps: uniform ? [] : gaps,
    dir: row ? "H" : "V",
    bg: colorOf(V.backgroundColor),
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
    wx: decl.wFixed ? "FIX" : (decl.wFill ? "FILL" : (empty ? "FIX" : "HUG")),
    hx: decl.hFixed ? "FIX" : (decl.hFill ? "FILL" : (empty ? "FIX" : "HUG")),
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
};

const byKind = new Map();
for (const spec of measured.specimens) {
  const file = fileOfSpecimen.get(spec.id);
  if (!file) continue;
  const tree = layout(spec.tree, file, spec.id);
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
} else {
  atomicWriteBatch([{ absolute: outputPath, expected: payload }]);
}

console.log(
  "[figma-inventory] " + (checkOnly ? "checked" : "built") + " @ " + commit.slice(0, 8) +
    ": 종류 " + sections.length + " · 표본 " + sections.reduce((s, x) => s + x.count, 0) +
    " · 노드 " + totalNodes +
    " · 폭 선언고정 " + [...declCache.values()].filter((d) => d.wFixed).length +
    " · 폭 부모지정 " + [...declCache.values()].filter((d) => d.wFill).length,
);
