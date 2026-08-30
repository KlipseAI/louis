#!/usr/bin/env node
// **제품의 경쟁 정의를 전부 재서 묶는다.**
//
// "제품에 정본이 없다"는 지금까지 산문이었다 — 한 벌만 재고 나머지는 세지 않은 채 그렇게 적었고,
// 그 판단을 아무도 검증할 수 없었다. 여기서는 이름 패턴으로 후보를 **전부** 찾아 실제로 렌더하고,
// 값이 같은 것끼리 묶는다. 그러면 "몇 벌이 몇 묶음으로 갈리는가"가 주장이 아니라 수가 된다.
//
// 결과는 migration/product.variants.json이고, Figma의 Inventory 페이지가 그것을 그린다.
// 정본을 고르는 일은 **눈으로 비교하는 일**이지 남의 산문을 믿는 일이 아니어야 한다.
import { execFileSync } from "node:child_process";
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";
import { atomicWriteBatch } from "./lib/atomic-output.mjs";
import { resolveProductRef } from "./lib/product-ref.mjs";
import { productFontFace } from "./lib/product-font.mjs";
import { materializeDsPackage } from "./lib/ds-package-shim.mjs";
import { assertLiveProductSceneCoverage } from "./lib/product-scene-contract.mjs";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const outputPath = resolve(repoRoot, "migration/product.variants.json");
const specimenPath = resolve(repoRoot, "figma/product-specimens.json");
const productRoot = process.env.KLIPSE_PRODUCT_REPO ?? "/Users/sejunki/klipse-web";
// 측정 대상은 근거 lock이 고정한 커밋이다 — `origin/main`을 따라가면 같은 명령이
// 어제와 다른 값을 낸다. scripts/lib/product-ref.mjs에 사유가 있다.
const { ref: productRef, source: productRefSource } = resolveProductRef();
const checkOnly = process.argv.includes("--check");
const specimenFile = JSON.parse(readFileSync(specimenPath, "utf8"));

// 제품 저장소가 없는 CI에서도 구조 카탈로그의 liveOnly 표본이 측정기에서 빠지는 것은 잡는다.
// 제품 렌더 자체는 verify:product의 measure-product-scenes.mjs가 담당한다.
assertLiveProductSceneCoverage(specimenFile.specimens);


// 컴포넌트마다 **이름 패턴**으로 후보를 찾는다. 패턴을 함께 적는 이유는 놓친 것이 있으면
// 그것이 보이게 하기 위해서다 — 목록이 아니라 규칙을 감사할 수 있어야 한다.
const KINDS = [
  { id: "toast", pattern: /^toast$|Toast$/, tag: "div", text: "저장했어요" },
  { id: "dialog", pattern: /^modalCard$|ModalCard$|DialogCard$/, tag: "div", text: "" },
  { id: "icon-button", pattern: /iconButton$|MoreButton$|CloseButton$|ArrowButton$|ToggleButton$/i, tag: "button", text: "" },
  { id: "text-field", pattern: /Input$|InputBox$|inputBox$|SearchInput$/, tag: "div", text: "" },
  { id: "slider", pattern: /(SLIDER|Slider)(_?(ROOT|Root|TRACK|Track|RANGE|Range|THUMB|Thumb))?$|overlayRadix(RootFull|Range|Thumb)$|timelineZoomRadix(Root|Range|Thumb)$/, tag: "div", text: "" },
  { id: "selectable-list-row", pattern: /ListItem$|listItem$|SelectRow$|OptionRow$|DropdownItem$|MenuItem$/, tag: "button", text: "항목" },
  { id: "badge", pattern: /Badge$|Chip$|Pill$/, tag: "span", text: "완료" },
];

// 재는 축. 컴포넌트를 가리지 않는 공통 집합이라 묶음 비교가 성립한다.
const AXES = [
  "height", "minHeight", "width", "minWidth", "maxWidth",
  "paddingTop", "paddingRight", "paddingBottom", "paddingLeft",
  "borderTopLeftRadius", "borderTopWidth", "borderTopColor", "borderTopStyle",
  "backgroundColor", "backgroundImage", "color", "boxShadow", "backdropFilter",
  "columnGap", "fontSize", "fontWeight", "lineHeight", "opacity",
  // 자간과 글꼴을 빼고 재고 있었다. 제품은 타입 클래스마다 letter-spacing을 선언하고
  // (globals.css:352-376, heading -0.02em / body·caption -0.01em) 그것이 글자 폭을 바꾼다.
  // 안 재면 표본을 다시 그릴 때 폭이 어긋나고, 그 어긋남이 어디서 왔는지 알 길이 없다.
  "letterSpacing", "fontFamily",
];

if (!existsSync(resolve(productRoot, ".git"))) {
  console.log(
    "[product-variants] " + (checkOnly ? "SKIPPED" : "제품 저장소가 없습니다") +
      " (" + productRoot + "). 인벤토리는 로컬에서 만든다.",
  );
  process.exit(0);
}

const require_ = createRequire(join(productRoot, "package.json"));
let compile;
try {
  const packagePath = require_.resolve("tailwindcss/package.json");
  ({ compile } = require_(join(dirname(packagePath), "dist", "lib.js")));
} catch (error) {
  console.log("[product-variants] SKIPPED (제품 tailwindcss를 불러오지 못했습니다: " + error.message + ")");
  process.exit(0);
}

const productRefForList = productRef;
const git = (args) =>
  execFileSync("git", args, { cwd: productRoot, encoding: "utf8", maxBuffer: 128 * 1024 * 1024 });
const commit = git(["rev-parse", productRef]).trim();
// 제품 `tailwind.css` 의 머리말은 `@import "tailwindcss"` 를 **설명하려고** 인용한다. 주석을 남긴
// 채 import 제거 정규식을 돌리면 그 인용에서 매칭이 시작되고 `[^;]*;` 가 다음 세미콜론까지
// 삼킨다 — `74a7303b` 에서는 그 세미콜론이 **`@layer theme, base, components;`** 의 것이라
// 순서 선언이 통째로 사라졌다. 그러면 문서에 남는 첫 선언이 `@layer utilities;` 가 되어
// **utilities 가 가장 낮은 레이어**가 되고, `globals.css` 의 `* { padding: 0 }` 리셋이 유틸리티를
// 이긴다. 빨개지지 않는다 — 이 게이트는 같은 하네스로 다시 재서 같은 답을 얻으므로 초록인 채로
// 여백 축이 조용히 전부 0 으로 잡혔다(2026-08-30, 표본 139개 → 30개).
//
// 그전 진입 CSS(`a3ed8e03`)에서는 같은 삼킴이 순서 선언 **하나만** 지워 문서가
// 「선언 없음 = 등장 순서」로 떨어졌고, 그 순서가 우연히 옳았다. 그래서 이 버그는 제품이
// `@layer utilities;` 를 따로 선언하는 날까지 잠복했다.
// 같은 사유가 scripts/measure-product-components.mjs 의 normalize 에도 적혀 있다.
const normalize = (source) =>
  source
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/@import\s+["'][^;]*;/g, "")
    .replace(/@theme\s+(?:inline\s+)?\{/g, ":root {");

/**
 * **주석을 같은 길이의 공백으로 바꾼다.** 지우지 않고 덮어쓰는 이유는 인덱스와 줄 번호를
 * 그대로 두기 위해서다 — 아래 추출기는 `source` 위의 위치로 상수 본문을 자르고 `line` 을 센다.
 *
 * 제품은 LOUIS 채택을 배열 원소 앞 블록 주석으로 적는다. 그 주석에는 `,` 도 `[` 도 들어간다:
 * 실제로 `NodeCanvasHomeScene.tsx` 의 `ARCHIVE_PREVIEW_TITLE_OVERLAY` 가 그렇다 — 주석 안의
 * 「… 아래 두 모서리 16 반경, 그리고 …」의 쉼표가 원소를 가른다.
 * 주석을 남긴 채 원소를 쉼표로 쪼개면 그 쉼표가 원소를 갈라 **뒤따르는 클래스 리터럴이 조각
 * 안에 묻히고**, 조각은 문자열로도 식별자로도 안 보여 통째로 버려진다. 그러면 그 부품은
 * 클래스 없이 렌더되어 **브라우저 기본값**으로 측정된다 — 배너 화살표·점의 면이 UA
 * `buttonface` rgb(107, 107, 107)로, 컨트롤 알약과 카드 제목 띠의 여백이 0으로 잡혔다.
 * 2026-08-30 기준 이렇게 버려지던 원소가 259개다. 어느 게이트도 빨개지지 않는다 —
 * 같은 하네스가 다시 재서 같은 답을 낸다.
 */
function blankComments(text) {
  let out = "";
  let quote = null;
  for (let i = 0; i < text.length; i += 1) {
    const ch = text[i];
    if (quote) {
      out += ch;
      if (ch === "\\") { out += text[i + 1] ?? ""; i += 1; }
      else if (ch === quote) quote = null;
      continue;
    }
    if (ch === '"' || ch === "'" || ch === "`") { quote = ch; out += ch; continue; }
    if (ch === "/" && text[i + 1] === "*") {
      const end = text.indexOf("*/", i + 2);
      const stop = end === -1 ? text.length : end + 2;
      for (let j = i; j < stop; j += 1) out += text[j] === "\n" ? "\n" : " ";
      i = stop - 1;
      continue;
    }
    if (ch === "/" && text[i + 1] === "/") {
      let j = i;
      while (j < text.length && text[j] !== "\n") { out += " "; j += 1; }
      i = j - 1;
      continue;
    }
    out += ch;
  }
  return out;
}

/** `key: [...].join(" ")` 와 `const KEY = [...].join(" ")` 를 모두 읽는다. */
function extractAll(rawSource) {
  const source = blankComments(rawSource);
  const found = [];
  const pattern = /(?:^|\n)(?:\s{2}|const\s+)([A-Za-z_][A-Za-z0-9_]*)\s*[:=]\s*(?=\[|")/g;
  let match;
  while ((match = pattern.exec(source)) !== null) {
    const name = match[1];
    let index = pattern.lastIndex;
    while (source[index] === "\n" || source[index] === " ") index += 1;
    if (source[index] === '"') {
      const end = source.indexOf('"', index + 1);
      const line = source.slice(0, index).split("\n").length;
      found.push({ name, line, classes: source.slice(index + 1, end) });
      continue;
    }
    if (source[index] !== "[") continue;
    let depth = 0;
    let quote = null;
    let cursor = index;
    for (; cursor < source.length; cursor += 1) {
      const char = source[cursor];
      if (quote) {
        if (char === "\\") cursor += 1;
        else if (char === quote) quote = null;
        continue;
      }
      if (char === '"' || char === "'" || char === "`") quote = char;
      else if (char === "[") depth += 1;
      else if (char === "]") {
        depth -= 1;
        if (depth === 0) break;
      }
    }
    const body = source.slice(index, cursor + 1);
    if (!/\]\s*\.join\(/.test(source.slice(cursor, cursor + 40))) continue;
    // 배열 원소를 순서대로 읽는다. 문자열 리터럴과 **식별자 참조** 둘 다다.
    // 그전에는 리터럴만 뽑아 `PERIOD_BTN_COMMON` 같은 합성 참조의 클래스(안쪽 여백 포함)를
    // 통째로 버렸다 — 세그먼트 버튼이 여백 0으로 측정된 원인이다.
    const elements = [];
    {
      let d = 0, q = null, start = index + 1;
      for (let i = index; i <= cursor; i += 1) {
        const ch = body[i - index];
        if (q) { if (ch === "\\") i += 1; else if (ch === q) q = null; continue; }
        if (ch === '"' || ch === "'" || ch === "`") q = ch;
        else if (ch === "[") d += 1;
        else if (ch === "]") { d -= 1; if (d === 0) { elements.push(source.slice(start, i).trim()); break; } }
        else if (ch === "," && d === 1) { elements.push(source.slice(start, i).trim()); start = i + 1; }
      }
    }
    const parts = [];
    for (const el of elements) {
      if (/^"(?:[^"\\]|\\.)*"$/.test(el)) parts.push({ literal: JSON.parse(el) });
      else if (/^[A-Za-z_][A-Za-z0-9_]*$/.test(el)) parts.push({ ref: el });
      // 그 밖(조건식·템플릿)은 정적으로 풀 수 없어 버린다 — 값이 아니라 구조만 잃는다.
    }
    if (parts.length === 0) continue;
    const line = source.slice(0, index).split("\n").length;
    found.push({ name, line, parts });
  }
  // 참조를 해석한다. 같은 파일 안의 상수만 본다. 순환은 끊고 못 찾은 참조는 버린다.
  const byName = new Map(found.map((e) => [e.name, e]));
  const resolve = (entry, seen) => {
    if (entry.classes !== undefined) return entry.classes;
    if (seen.has(entry.name)) return "";
    seen.add(entry.name);
    const out = [];
    for (const part of entry.parts) {
      if (part.literal !== undefined) out.push(part.literal);
      else if (byName.has(part.ref)) out.push(resolve(byName.get(part.ref), seen));
    }
    entry.classes = out.filter(Boolean).join(" ");
    return entry.classes;
  };
  for (const entry of found) resolve(entry, new Set());
  return found;
}

// **파일 목록을 손으로 적지 않는다.** 적으면 빠뜨린 파일이 보이지 않고, "제품에 몇 벌 있다"는
// 수가 다시 주장이 된다. 모서리를 그리는 선언이 하나라도 있는 파일을 제품에서 직접 찾는다.
const FILES = Object.fromEntries(
  execFileSync(
    "git",
    ["grep", "-l", "-E", "\\[border-radius:|rounded-\\[|rounded-[0-9]", productRefForList, "--", "apps/web"],
    { cwd: productRoot, encoding: "utf8", maxBuffer: 64 * 1024 * 1024 },
  )
    .split("\n")
    .filter(Boolean)
    .map((line) => line.replace(/^[^:]*:/, ""))
    .filter((path) => /\.tsx?$/.test(path))
    .map((path) => [path, path]),
);

const sources = Object.fromEntries(
  Object.entries(FILES).map(([alias, path]) => [alias, git(["show", commit + ":" + path])]),
);
// **상수 이름으로 센다.** 클래스 토큰으로 세면 짧은 마커가 다른 문자열에 섞여 수가 터진다.
// 정의 자신을 빼고 남는 수가 곧 "몇 곳에서 쓰는가"다.
const usageCount = (name) => {
  const pattern = new RegExp("\\b" + name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "\\b", "g");
  let total = 0;
  for (const source of Object.values(sources)) {
    total += (source.match(pattern) ?? []).length;
  }
  return Math.max(0, total - 1);
};

const candidates = [];
for (const [alias, source] of Object.entries(sources)) {
  for (const entry of extractAll(source)) {
    for (const kind of KINDS) {
      if (!kind.pattern.test(entry.name)) continue;
      candidates.push({
        kind: kind.id,
        id: kind.id + "/" + alias + "." + entry.name,
        file: FILES[alias],
        line: entry.line,
        name: entry.name,
        tag: kind.tag,
        text: kind.text,
        classes: entry.classes,
        uses: usageCount(entry.name),
      });
      break;
    }
  }
}

// ── 표본: 구조는 사람이 적고 값은 브라우저가 잰다 ──────────────────────────
// **상상해서 그리지 않기 위한 장치다.** 인벤토리를 처음 그릴 때 모달의 카드만 재고 제목·설명·
// 액션은 상상해서 그렸다. 실제 제품은 액션 행이 `margin: -8px`로 카드 밖으로 삐져나와 버튼 쪽
// 여백이 8이고 글자 쪽이 16인데 그림은 둘 다 16이었다. 잰 것 옆에 안 잰 것을 그려 넣으면
// 그림 전체가 거짓말이 된다.
//
// 그래서 표본 파일에는 **구조만** 적는다 — 어떤 상수가 어떤 상수를 감싸는가. 여백·크기·색은
// 한 줄도 없다. 여기서 그 트리를 그대로 렌더하고 **모든 노드를 잰다.**
const constantsByFile = {};
const classesOf = (file, part) => {
  if (!constantsByFile[file]) {
    const source = sources[file] ?? git(["show", commit + ":" + file]);
    sources[file] = source;
    constantsByFile[file] = Object.fromEntries(extractAll(source).map((entry) => [entry.name, entry]));
  }
  const found = constantsByFile[file][part];
  if (!found) throw new Error(file + "에 " + part + " 상수가 없습니다.");
  return found;
};
let specimenSeq = 0;
const specimenNodes = [];
/** 소비처가 인라인으로 얹는 style 객체를 소스에서 꺼낸다. **클래스를 이기는 선언이 여기 숨는다.** */
const inlineStyleOf = (file, name) => {
  const source = sources[file] ?? git(["show", commit + ":" + file]);
  sources[file] = source;
  const anchor = new RegExp("const\\s+" + name + "\\s*=\\s*\\{", "m").exec(source);
  if (!anchor) throw new Error(file + "에 " + name + " 인라인 style이 없습니다.");
  let depth = 0;
  let cursor = anchor.index + anchor[0].length - 1;
  for (; cursor < source.length; cursor += 1) {
    if (source[cursor] === "{") depth += 1;
    else if (source[cursor] === "}") {
      depth -= 1;
      if (depth === 0) break;
    }
  }
  const body = source.slice(anchor.index + anchor[0].length, cursor);
  const declarations = [];
  for (const match of body.matchAll(/([A-Za-z][A-Za-z0-9]*)\s*:\s*"((?:[^"\\]|\\.)*)"/g)) {
    const property = match[1].replace(/[A-Z]/g, (c) => "-" + c.toLowerCase());
    declarations.push(property + ":" + JSON.parse('"' + match[2] + '"'));
  }
  return declarations.join(";");
};

// 소비처가 JSX에 **리터럴로** 얹는 인라인 style이다. 상수가 아니라 `inlineFrom`으로 가리킬 수
// 없고, 값을 표본에 적으면 창작이 된다. 그래서 고정 커밋의 그 줄에서 읽는다 — 프로젝트 카드의
// 높이가 이렇게 온다(AppHomeScene.tsx:1094 `aspectRatio: "1 / 1"`). 줄이 옮겨져 선언을 읽지
// 못하면 조용히 넘기지 않고 실패한다.
const inlineAtOf = (ref) => {
  const at = ref.lastIndexOf(":");
  const file = ref.slice(0, at);
  const line = Number(ref.slice(at + 1));
  const src = sources[file] ?? git(["show", commit + ":" + file]);
  sources[file] = src;
  const text = src.split("\n")[line - 1] ?? "";
  const decls = [];
  for (const m of text.matchAll(/([A-Za-z][A-Za-z0-9]*)\s*:\s*"((?:[^"\\]|\\.)*)"/g)) {
    decls.push(m[1].replace(/[A-Z]/g, (c) => "-" + c.toLowerCase()) + ":" + JSON.parse('"' + m[2] + '"'));
  }
  if (decls.length === 0) throw new Error(ref + " 에서 인라인 선언을 읽지 못했습니다. 줄이 옮겨졌는지 확인하세요.");
  return decls.join(";");
};
const buildSpecimen = (specimen, node, path) => {
  const constant = classesOf(specimen.file, node.part);
  const index = specimenSeq;
  specimenSeq += 1;
  const record = {
    index,
    specimen: specimen.id,
    path,
    part: node.part,
    // 소비처가 렌더 시점에 합친 상수 목록. 크기 선언이 이 안에 흩어져 있다.
    parts: node.parts ?? null,
    tag: node.tag,
    line: constant.line,
    text: node.text ?? "",
    // 소비처가 **렌더 시점에** 여러 상수를 합성하면 그 목록을 그대로 적는다(`parts`).
    // 공용 Button이 그렇다 — `[ROOT, SIZE_MD, BORDER_NONE, PRIMARY].join(" ")`.
    // 한 상수만 가리키면 높이·여백·배경이 통째로 빠져 25px짜리 테두리 조각이 된다.
    classes: [
      node.typography,
      ...(node.parts ?? [node.part]).map((name) => classesOf(specimen.file, name).classes),
    ].filter(Boolean).join(" "),
    inline: node.inlineFrom
      ? inlineStyleOf(node.inlineFrom.file, node.inlineFrom.name)
      : (node.inlineAt ? inlineAtOf(node.inlineAt) : ""),
    children: (node.children ?? []).map((child, order) =>
      buildSpecimen(specimen, child, path + "/" + child.part + (order > 0 ? "#" + order : "")),
    ),
  };
  specimenNodes.push(record);
  return record;
};
// `liveOnly` 표본은 완성된 제품 페이지의 React/Next 런타임에서만 성립한다. 정적 클래스
// 하네스에 억지로 옮기면 Image의 intrinsic ratio, 중첩 컴포넌트, viewport 계산을 잃는다.
// 이 파일은 정적 표본만 재고, liveOnly 표본은 measure-product-scenes.mjs가 고정 커밋의
// 프로덕션 빌드에서 직접 잰다. 둘은 같은 구조 카탈로그를 읽되 측정 방법만 다르다.
const specimenTrees = specimenFile.specimens.filter((specimen) => !specimen.liveOnly).map((specimen) => ({
  ...specimen,
  tree: buildSpecimen(specimen, specimen.node, specimen.node.part),
}));
// **표본을 부모 문맥 안에서 잰다.**
//
// 그전에는 표본을 빈 block div에 홀로 담아 쟀다. 그런데 제품에서 이 부품들은 flex 행 안에
// 들어 있고, flex 자식이 되면 inline 요소가 blockify되어 높이가 `여백 + 인라인상자`에서
// `여백 + 행간상자`로 바뀐다. 문맥 없이 재면 그만큼 작게 나온다 —
// 2026-08-20에 owner가 제품에서 직접 재서 잡았다. 배지가 22인데 18로, 칩이 24인데 20으로
// 기록돼 있었고, 나는 그 값을 "실측"이라고 불렀다. 재지 않은 것을 잰 것처럼 말한 셈이다.
//
// `host`에 제품의 실제 부모 클래스를 바깥부터 적으면 그 문맥 안에서 잰다.
const hostOpen = (specimen) => (specimen.host ?? [])
  .map((h) => {
    // 부모가 다른 파일에 정의돼 있을 수 있다. {file, part}로 적으면 그 파일에서 읽는다.
    const file = typeof h === "string" ? specimen.file : h.file;
    const part = typeof h === "string" ? h : h.part;
    return '<div class="' + classesOf(file, part).classes.replace(/"/g, "&quot;") + '">';
  })
  .join("");
const hostClose = (specimen) => (specimen.host ?? []).map(() => "</div>").join("");
const renderSpecimen = (node) =>
  "<" + node.tag + ' data-sp="' + node.index + '" class="' + node.classes.replace(/"/g, "&quot;") + '"' +
  (node.inline ? ' style="' + node.inline.replace(/"/g, "&quot;") + '"' : "") + ">" +
  (node.children.length > 0 ? node.children.map(renderSpecimen).join("") : node.text) +
  "</" + node.tag + ">";

const workspace = mkdtempSync(join(tmpdir(), "louis-product-variants-"));
let dsPin = "HEAD";
let rendered;
let specimenMeasured;
try {
  const tailwindEntry = git(["show", commit + ":apps/web/app/tailwind.css"]);
  writeFileSync(join(workspace, "entry.css"), tailwindEntry);
  writeFileSync(join(workspace, "keyframes.css"), git(["show", commit + ":apps/web/app/keyframes.css"]));
  dsPin = materializeDsPackage({ workspace, git, commit, tag: "product-variants" });
  const compiled = await compile(tailwindEntry, {
    base: workspace,
    loadStylesheet: async (id, base) => {
      const path = id.startsWith("tailwindcss") ? require_.resolve(id) : resolve(base, id);
      return { path, base: dirname(path), content: readFileSync(path, "utf8") };
    },
  });
  const tokens = new Set();
  for (const source of Object.values(sources)) {
    for (const literal of source.match(/"(?:[^"\\\n]|\\.)*"/g) ?? []) {
      for (const token of literal.slice(1, -1).split(/\s+/)) if (token) tokens.add(token);
    }
  }
  const utilities = compiled.build([...tokens]);
  // **레이어 순서를 문서 맨 앞에 못 박는다.** 제품에서는 `tailwind.css` 가
  // theme → base → components → LOUIS → utilities 순으로 선언하는데, 그 순서의 LOUIS 구간은
  // `@import "@klipse-design/css/layers.css"` 가 갖고 있고 위 `normalize` 가 그 import 를 지운다.
  // 지우고 나면 LOUIS 레이어가 컴파일 시트에서 처음 등장하며 **utilities 뒤에** 붙어, 제품과
  // 반대로 LOUIS 가 호출부 유틸리티를 이기는 문서가 된다. 이름을 손으로 적지 않고 컴파일
  // 산출물이 실제로 선언한 LOUIS 순서를 꺼내 쓴다.
  const louisLayerOrder = /@layer\s+(louis\.[^;]*);/.exec(utilities)?.[1] ?? "";
  const productCss = [
    "@layer theme, base, components" + (louisLayerOrder ? ", " + louisLayerOrder : "") + ", utilities;",
    productFontFace(productRoot, commit),
    normalize(tailwindEntry),
    git(["show", commit + ":apps/web/app/globals.css"]),
    utilities,
  ].join("\n\n");

  const browser = await chromium.launch();
  try {
    const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, colorScheme: "dark" });
    const page = await context.newPage();
    await page.setContent(
      '<!doctype html><html data-theme="dark"><head><style>' +
        productCss.replace(/<\/style>/gi, "<\\/style>") +
        // **진입 애니메이션을 끝으로 보낸다.** 마이페이지 모달은 `myPageScaleIn`으로 커지며
        // 들어오는데, 그 중간에 재면 폭이 345.97처럼 나온다 — 0.961배다. 우리가 그릴 것은
        // 쉬는 상태이므로 애니메이션을 1ms로 줄여 끝난 뒤를 잰다.
        "*, *::before, *::after { animation-duration: 1ms !important; animation-delay: 0s !important; }" +
        "</style></head><body>" +
        candidates
          .map(
            (candidate, index) =>
              '<div id="v-' + index + '" style="position:relative;width:360px;height:200px">' +
              "<" + candidate.tag + ' class="' + candidate.classes.replace(/"/g, "&quot;") + '">' +
              candidate.text + "</" + candidate.tag + "></div>",
          )
          .join("") +
        specimenTrees
          .map(
            (specimen) =>
              '<div class="louis-specimen-host" style="position:relative;width:420px;padding:24px">' +
              hostOpen(specimen) + renderSpecimen(specimen.tree) + hostClose(specimen) + "</div>",
          )
          .join("") +
        "</body></html>",
      { waitUntil: "load" },
    );
    // 위의 1ms는 **끝나는 애니메이션**만 끝으로 보낸다. 무한 loop에는 끝이 없어서 1ms 주기
    // 안의 아무 지점이나 잡히고, 그래서 이 게이트가 실행마다 흔들렸다(3회 중 1회, 4회 중 2회 실패).
    // `finish()`는 무한 애니메이션에서 던지므로 그것으로 두 경우를 가른다 — 끝나는 것은 끝으로,
    // 끝나지 않는 것은 0s에 세운다. 어느 쪽이든 결정적이다.
    rendered = await page.evaluate(
      ({ count, axes }) => {
        // **읽기 직전에 얼린다.** 별도 호출로 얼리면 CSS 애니메이션이 스타일 재계산 때
        // API로 건 pause를 되돌려 다시 흐른다(실측 확인: 300ms 뒤 -360 → -355.348).
        // 같은 evaluate 안에서 시각을 0으로 놓고 바로 읽으면 그 틈이 없고,
        // `animation-duration`과 `animation-play-state`는 제품 선언 그대로 남는다.
        for (const a of document.getAnimations()) {
          try { a.finish(); } catch { a.currentTime = 0; }
        }
        const out = [];
        for (let index = 0; index < count; index += 1) {
          const element = document.querySelector("#v-" + index)?.firstElementChild;
          if (!element) {
            out.push(null);
            continue;
          }
          const style = getComputedStyle(element);
          const values = {};
          for (const axis of axes) values[axis] = style[axis];
          out.push(values);
        }
        return out;
      },
      { count: candidates.length, axes: AXES },
    );
    await page.waitForTimeout(80);
    specimenMeasured = await page.evaluate((axes) => {
      // 표본도 읽기 직전에 얼린다. 위 evaluate에서 얼린 것은 스타일 재계산 때 되돌아온다.
      for (const a of document.getAnimations()) {
        try { a.finish(); } catch { a.currentTime = 0; }
      }
      const out = {};
      for (const element of document.querySelectorAll("[data-sp]")) {
        const style = getComputedStyle(element);
        const values = {};
        for (const axis of axes) values[axis] = style[axis];
        for (const axis of ["marginTop", "marginRight", "marginBottom", "marginLeft", "rowGap", "textAlign", "justifyContent", "flexDirection", "display", "position"]) {
          values[axis] = style[axis];
        }
        const rect = element.getBoundingClientRect();
        values.$width = Math.round(rect.width * 100) / 100;
        values.$height = Math.round(rect.height * 100) / 100;
        // **모든 자식의 좌표를 부모 기준으로 잰다.** 그전에는 absolute만 재고 flow 자식은
        // 여백·마진·간격으로 위치를 시뮬레이션했는데, 가운데 정렬을 못 봐서 40px 버튼의
        // 아래 여백이 19로 튀었다. 재는 편이 언제나 맞다.
        const host = (values.position === "absolute" || values.position === "fixed")
          ? (element.offsetParent ?? element.parentElement)
          : element.parentElement;
        if (host) {
          const hostRect = host.getBoundingClientRect();
          values.$x = Math.round((rect.left - hostRect.left) * 100) / 100;
          values.$y = Math.round((rect.top - hostRect.top) * 100) / 100;
        }
        out[element.dataset.sp] = values;
      }
      return out;
    }, AXES);
    await context.close();
  } finally {
    await browser.close();
  }
} finally {
  rmSync(workspace, { recursive: true, force: true });
}

// 값이 같은 것끼리 묶는다. **묶음 수가 곧 "몇 갈래로 갈리는가"다.**
const kinds = {};
for (const kind of KINDS) {
  const members = candidates
    .map((candidate, index) => ({ ...candidate, values: rendered[index] }))
    .filter((candidate) => candidate.kind === kind.id && candidate.values);
  const groups = new Map();
  for (const member of members) {
    const fingerprint = JSON.stringify(member.values);
    if (!groups.has(fingerprint)) groups.set(fingerprint, { values: member.values, members: [] });
    groups.get(fingerprint).members.push({
      id: member.id,
      file: member.file,
      line: member.line,
      name: member.name,
      uses: member.uses,
    });
  }
  const ordered = [...groups.values()].sort(
    (a, b) =>
      b.members.reduce((sum, m) => sum + m.uses, 0) - a.members.reduce((sum, m) => sum + m.uses, 0) ||
      b.members.length - a.members.length,
  );
  kinds[kind.id] = {
    pattern: String(kind.pattern),
    definitions: members.length,
    groups: ordered.map((group, index) => ({
      rank: index + 1,
      members: group.members.length,
      uses: group.members.reduce((sum, m) => sum + m.uses, 0),
      values: group.values,
      sources: group.members,
    })),
  };
}

const payload =
  JSON.stringify(
    {
      $comment:
        "생성물. scripts/measure-product-variants.mjs가 제품의 경쟁 정의를 이름 패턴으로 찾아 실제로 렌더하고 값이 같은 것끼리 묶는다. 직접 수정하지 않는다.",
      $whyThisExists:
        "\"제품에 정본이 없다\"가 산문이었다 — 한 벌만 재고 나머지는 세지 않은 채 그렇게 적었다. 여기서는 몇 벌이 몇 묶음으로 갈리는지가 수로 남고, Figma의 Inventory 페이지가 그것을 나란히 그린다. 정본을 고르는 일은 눈으로 비교하는 일이어야 한다.",
      $howToRead:
        "groups는 사용 횟수가 많은 순이다. rank 1이 가장 널리 쓰이는 벌이며 정본 후보다. members가 여럿이면 그 벌들이 값까지 동일하다는 뜻이다.",
      productRef,
      productCommit: commit,
      axes: AXES,
      $specimenNote:
        "구조는 figma/product-specimens.json이 적고 값은 여기서 브라우저가 잰다. Figma 인벤토리는 이 트리만으로 그린다 — 여기 없는 값은 그릴 수 없다.",
      $inlineNote:
        "소비처가 인라인 style로 얹어 클래스를 이기는 선언이 있다. 앱 홈 토스트가 그렇다 — 클래스는 blur(10px)인데 인라인이 blur(16px) saturate(130%)로 덮는다. 구조 파일이 그 상수 이름을 가리키고 여기서 소스에서 꺼내 함께 렌더한다.",
      specimens: specimenTrees.map((specimen) => ({
        id: specimen.id,
        kind: specimen.kind,
        label: specimen.label,
        jsx: specimen.jsx,
        file: specimen.file,
        tree: (function attach(node) {
          return {
            part: node.part,
            parts: node.parts ?? null,
            tag: node.tag,
            line: node.line,
            text: node.text,
            values: specimenMeasured[String(node.index)],
            children: node.children.map(attach),
          };
        })(specimen.tree),
      })),
      kinds,
    },
    null,
    2,
  ) + "\n";

if (checkOnly) {
  let current = "";
  try {
    current = readFileSync(outputPath, "utf8");
  } catch {
    console.error("[product-variants] 생성물이 없습니다: migration/product.variants.json");
    process.exit(1);
  }
  if (current !== payload) {
    console.error("[product-variants] 제품 정의가 기록과 다릅니다. 다시 만들고 인벤토리를 갱신하세요.");
    process.exit(1);
  }
} else {
  atomicWriteBatch([{ absolute: outputPath, expected: payload }]);
}

console.log(
  "[product-variants] " + (checkOnly ? "checked" : "built") + ": @ " + commit.slice(0, 8) + " · " +
    Object.entries(kinds)
      .map(([id, kind]) => id + " " + kind.definitions + "벌→" + kind.groups.length + "묶음")
      .join(" · ") + " · 표본 " + specimenTrees.length + "종 노드 " + specimenNodes.length + "개 실측",
);
