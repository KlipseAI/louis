// 아이콘 정본의 파싱·정규화·렌더. 외부 의존 0 (DS-D-0001의 관행을 그대로 따른다).
//
// 정본은 사람이 쓰고 기계가 읽는다. 그래서 파서는 관대하지 않다 — 허용 목록 밖의 요소·속성·
// 색·두께는 전부 실패이고, 실패는 무엇을 어떻게 고쳐야 하는지 문장으로 말한다. Figma 내보내기를
// 그대로 커밋하면 여기서 걸린다.
import { createHash } from "node:crypto";

export const ICON_SOURCE_DIRECTORY = "packages/react/src/icons/svg";
export const ICON_OUTPUT_DIRECTORY = "packages/react/src/icons/generated";
export const ICON_PROVENANCE_PATH = "packages/react/src/icons/provenance.json";
/**
 * 아이콘 검색 키워드.
 *
 * 사람은 아이콘의 **이름을 모른 채** 찾는다 — "휴지통"을 떠올리지 `trash-simple`을 떠올리지 않는다.
 * 그래서 한국어와 영어 동의어를 함께 담고, Figma description과 문서 검색이 같은 원천을 쓴다.
 */
export const ICON_KEYWORDS_PATH = "packages/react/src/icons/keywords.json";
export const ICON_LICENSE_DIRECTORY = "packages/react/src/icons/licenses";
export const ICON_NOTICES_PATH = "packages/react/THIRD-PARTY-NOTICES.md";
export const ICON_OUTPUT_PATHS = [
  `${ICON_OUTPUT_DIRECTORY}/index.tsx`,
  `${ICON_OUTPUT_DIRECTORY}/manifest.json`,
  ICON_NOTICES_PATH,
];

export const ICON_VIEWBOX = "0 0 24 24";
export const ICON_STROKE_WIDTHS = new Set(["1.5"]);
export const ICON_NAME_PATTERN = /^[a-z][a-z0-9]*(-[a-z0-9]+)*$/;

const ALLOWED_ELEMENTS = new Set([
  "path",
  "circle",
  "rect",
  "ellipse",
  "line",
  "polyline",
  "polygon",
  "g",
]);

// 획도 채움도 없는 요소는 아무것도 그리지 않는다. `g`만 예외다 — 묶음 자체는 칠하지 않는다.
//
// 이 규칙이 잡는 실제 사고는 Phosphor의 배경 `<rect width="256" height="256" fill="none"/>`다.
// 그 자체로는 렌더에 기여하지 않아 무해해 보이지만(Chromium 래스터 바이트 비교로 확인), 정본
// 계약대로 요소마다 `stroke="currentColor" stroke-width="1.5"`를 채우는 순간 **아이콘 전체를
// 두르는 사각 테두리가 생긴다.** 눈에 띄지 않는 잔재가 계약을 만나 결함이 되는 형태라서,
// 이관 시점에 제거를 강제한다.
const PAINTLESS_ALLOWED = new Set(["g"]);

// SVG 속성 → JSX prop. allowlist 밖 속성은 실패다. 값은 변환하지 않는다.
const ATTRIBUTE_MAP = new Map([
  ["d", "d"],
  ["points", "points"],
  ["cx", "cx"],
  ["cy", "cy"],
  ["r", "r"],
  ["rx", "rx"],
  ["ry", "ry"],
  ["x", "x"],
  ["y", "y"],
  ["x1", "x1"],
  ["y1", "y1"],
  ["x2", "x2"],
  ["y2", "y2"],
  ["width", "width"],
  ["height", "height"],
  ["fill", "fill"],
  ["fill-rule", "fillRule"],
  ["clip-rule", "clipRule"],
  ["stroke", "stroke"],
  ["stroke-width", "strokeWidth"],
  ["stroke-linecap", "strokeLinecap"],
  ["stroke-linejoin", "strokeLinejoin"],
  // 요소 하나의 투명도 — 한 색(currentColor) 안의 농담. 값은 알파 16단(DS-D-0026)만 받는다(아래 ICON_OPACITIES).
  // 2026-10-14: 하이라이트 선 아이콘(아홉 칸이 가운데로 갈수록 진하다)이 첫 소비처다.
  ["opacity", "opacity"],
]);

// 요소 투명도의 허용 집합 — 알파 16단(DS-D-0026: 32 까지 4 씩, 그 위 8 씩). 1 은 적지 않는다(기본값).
export const ICON_OPACITIES = new Set([
  "0.04", "0.08", "0.12", "0.16", "0.2", "0.24", "0.28", "0.32",
  "0.4", "0.48", "0.56", "0.64", "0.72", "0.8", "0.88", "0.96",
]);

// 지오메트리 해시와 속성 방출의 결정론적 순서. Map 삽입 순서에 기대지 않는다.
const GEOMETRY_KEYS = [
  "d",
  "points",
  "cx",
  "cy",
  "r",
  "rx",
  "ry",
  "x",
  "y",
  "x1",
  "y1",
  "x2",
  "y2",
  "width",
  "height",
];
const PRESENTATION_KEYS = [
  "fill",
  "fillRule",
  "clipRule",
  "stroke",
  "strokeWidth",
  "strokeLinecap",
  "strokeLinejoin",
  "opacity",
];

// 색 슬롯에서 currentColor로 접히는 값. 그 외 색 리터럴은 실패다.
const NEUTRAL_COLORS = new Set([
  "black",
  "white",
  "#000",
  "#000000",
  "#fff",
  "#ffffff",
  "currentColor",
]);

const FORBIDDEN_SUBSTRINGS = [
  "<title",
  "<desc",
  "<metadata",
  "<!--",
  "<script",
  "xlink:",
];

// 생성물 최상위에 올 수 있는 형태. 화이트리스트인 이유는 결정 8의 요구가 "호출식이 없다"가
// 아니라 "부수효과가 없다"이기 때문이다. 금지 목록은 언제나 새 표현에 뚫린다.
const ALLOWED_TOP_LEVEL = [
  /^import\b/,
  /^export type\b/,
  /^export function\b/,
  /^export \{/,
  /^\/\//,
  /^\}/,
  /^\s*\|/,
];

export class IconValidationError extends Error {
  constructor(issues) {
    super(`아이콘 정본 검증 실패 (${issues.length}건)`);
    this.name = "IconValidationError";
    this.issues = issues;
  }
}

// 로케일 의존을 피한다. localeCompare는 CI와 로컬이 갈릴 수 있다.
const byCodePoint = (a, b) => (a === b ? 0 : a < b ? -1 : 1);

function pascalCase(name) {
  return name
    .split("-")
    .map((part) => part[0].toUpperCase() + part.slice(1))
    .join("");
}

// root <svg>가 가질 수 있는 속성. 나머지는 정본에 남을 수 없다.
const ALLOWED_ROOT_ATTRIBUTES = new Set(["xmlns", "viewBox"]);

/**
 * 정본 SVG를 요소 목록으로 읽는다.
 *
 * **파서가 인식하지 못한 것을 조용히 버리지 않는다.** 이것이 이 함수의 가장 중요한 성질이다.
 * 이전 판은 속성을 큰따옴표 형태로만 인식해서, 작은따옴표로 쓴 요소가 매칭에 실패하면 진단
 * 없이 사라졌다 — `<path id='x' stroke='#ff0000' stroke-width='9'/>`가 게이트를 통과하고
 * 동시에 생성물에서 없어지는, 두 방향으로 모두 나쁜 동작이었다. XML에서 두 따옴표는 완전히
 * 동등하므로 지금은 둘 다 받고, 그와 별개로 **본 태그 수와 처리한 태그 수가 일치하는지**
 * 검사한다. 앞으로 어떤 문법 변종이 나와도 "못 봤다"가 "통과"가 되지 않는다.
 */
function parseElements(source, name, issues) {
  const elements = [];
  const seen = [];
  // 속성은 개행으로도 나뉠 수 있고 따옴표는 " 와 ' 둘 다 합법이다.
  const attributeShape = String.raw`[^\s=/>]+\s*=\s*(?:"[^"]*"|'[^']*')`;
  const tagPattern = new RegExp(
    String.raw`<(/?)([a-zA-Z][\w:-]*)((?:\s+${attributeShape})*)\s*(/?)>`,
    "g",
  );
  const attributePattern = new RegExp(
    String.raw`([^\s=/>]+)\s*=\s*(?:"([^"]*)"|'([^']*)')`,
    "g",
  );

  let depth = 0;
  let openTagsSeen = 0;
  let match;
  while ((match = tagPattern.exec(source)) !== null) {
    const [, closing, tag, rawAttributes, selfClosing] = match;
    if (closing !== "/") openTagsSeen += 1;

    const attributes = new Map();
    const rawKeys = [];
    let attribute;
    attributePattern.lastIndex = 0;
    while ((attribute = attributePattern.exec(rawAttributes)) !== null) {
      rawKeys.push([attribute[1], attribute[2] ?? attribute[3]]);
    }

    if (tag === "svg") {
      if (selfClosing === "/") {
        issues.push(`${name}: <svg/>가 비어 있습니다.`);
        continue;
      }
      if (closing === "/") {
        depth -= 1;
        continue;
      }
      depth += 1;
      if (depth > 1) {
        issues.push(`${name}: 중첩된 <svg>는 정본에 남을 수 없습니다.`);
        continue;
      }
      for (const [key, value] of rawKeys) {
        if (!ALLOWED_ROOT_ATTRIBUTES.has(key)) {
          issues.push(
            `${name}: root <svg>의 허용되지 않은 속성 ${key}="${value}". ` +
              `허용: ${[...ALLOWED_ROOT_ATTRIBUTES].join(", ")}. 표현 속성은 요소마다 둔다.`,
          );
        }
      }
      continue;
    }
    if (closing === "/") continue;

    if (!ALLOWED_ELEMENTS.has(tag)) {
      issues.push(
        `${name}: 허용되지 않은 요소 <${tag}>. 허용: ${[...ALLOWED_ELEMENTS].join(", ")}`,
      );
      continue;
    }

    let rejected = false;
    for (const [key, value] of rawKeys) {
      if (key === "id" || key === "clip-path") {
        issues.push(
          `${name}: <${tag}>의 ${key}는 정본에 남을 수 없습니다. ` +
            `인라인 시 문서 전역에서 충돌합니다.`,
        );
        rejected = true;
        continue;
      }
      const prop = ATTRIBUTE_MAP.get(key);
      if (prop === undefined) {
        issues.push(`${name}: 허용되지 않은 속성 ${key}="${value}" (<${tag}>)`);
        rejected = true;
        continue;
      }
      attributes.set(prop, value);
    }
    if (selfClosing !== "/") {
      issues.push(`${name}: <${tag}>는 자체 종료 형태여야 합니다.`);
      rejected = true;
    }
    // 문제 있는 요소는 렌더 대상에서 뺀다. 잘못된 요소를 모델에 남기면 이후 단계의
    // 진단이 원인에서 멀어진다. 다만 **진단 대상에서는 빼지 않는다** — 한 번에 모든 문제를
    // 보고하지 않으면 소비자가 게이트를 여러 번 돌며 오류를 하나씩 만난다.
    const element = { tag, attributes };
    seen.push(element);
    if (!rejected) elements.push(element);
  }

  // 무음 누락 방지. 정규식이 못 읽은 여는 태그가 하나라도 있으면 실패다.
  const openTagsInSource = (source.match(/<[a-zA-Z]/g) ?? []).length;
  if (openTagsInSource !== openTagsSeen) {
    issues.push(
      `${name}: 파서가 읽지 못한 태그가 있습니다 (원문 ${openTagsInSource}개, 인식 ${openTagsSeen}개). ` +
        `정본은 파서가 전부 이해할 수 있는 형태여야 합니다 — 읽히지 않은 태그는 통과가 아니라 실패다.`,
    );
  }
  if (depth !== 0) issues.push(`${name}: <svg> 요소가 올바르게 닫히지 않았습니다.`);
  return { elements, seen };
}

function normalizeColors(element, name, issues) {
  let colorRejected = false;
  for (const slot of ["stroke", "fill"]) {
    const value = element.attributes.get(slot);
    if (value === undefined) continue;
    if (slot === "fill" && value === "none") continue;
    if (!NEUTRAL_COLORS.has(value)) {
      issues.push(
        `${name}: <${element.tag}> ${slot}="${value}"는 중립색이 아닙니다. ` +
          `다색 자산은 아이콘 세트가 아니라 브랜드 트랙입니다 (DS-D-0008 결정 5).`,
      );
      colorRejected = true;
      continue;
    }
    element.attributes.set(slot, "currentColor");
  }

  // 색이 이미 거부된 요소를 "아무것도 그리지 않는다"고 다시 말하지 않는다. 획이 있는데
  // 없다고 하는 진단은 소비자를 원인에서 멀어지게 한다.
  if (colorRejected) return;

  const stroke = element.attributes.get("stroke");
  const fill = element.attributes.get("fill");
  const painted = stroke === "currentColor" || (fill !== undefined && fill !== "none");
  if (!painted && !PAINTLESS_ALLOWED.has(element.tag)) {
    issues.push(
      `${name}: <${element.tag}>가 아무것도 그리지 않습니다 (stroke 없음, fill="none"). ` +
        `upstream의 배경 rect 같은 잔재는 정본에 남기지 않습니다.`,
    );
    return;
  }

  const opacity = element.attributes.get("opacity");
  if (opacity !== undefined && !ICON_OPACITIES.has(opacity)) {
    issues.push(
      `${name}: opacity="${opacity}"는 알파 16단(DS-D-0026) 밖입니다. 허용: ${[...ICON_OPACITIES].join(", ")}.`,
    );
  }

  if (stroke === "currentColor") {
    const strokeWidth = element.attributes.get("strokeWidth");
    if (strokeWidth === undefined) {
      issues.push(`${name}: <${element.tag}>에 stroke-width가 없습니다.`);
    } else if (!ICON_STROKE_WIDTHS.has(strokeWidth)) {
      issues.push(
        `${name}: stroke-width="${strokeWidth}"는 허용 집합 밖입니다. ` +
          `허용: ${[...ICON_STROKE_WIDTHS].join(", ")} (viewBox 24 기준).`,
      );
    }
  }
}

// 세트 정의가 반드시 갖는 필드 (DS-D-0078). 글리프마다 적던 취득일 · 수정 내역 · 글리프별 URL 은
// 없앴다 — 좌표 정규화는 전역 규칙이고, 세트 URL 하나가 출처를 가리킨다.
export const REQUIRED_SET_FIELDS = ["project", "license", "licenseFile", "url"];

// 글리프 항목의 모양: "세트:세트 안의 원래 파일 이름" 또는 직접 그린 "original".
const GLYPH_SOURCE_PATTERN = /^([a-z][a-z0-9]*(?:-[a-z0-9]+)*):([a-z0-9]+(?:-[a-z0-9]+)*)$/;

// 추정을 사실로 승격시키는 상투어. 대소문자를 가리지 않는다.
const PLACEHOLDER_VALUES = new Set([
  "unknown",
  "n/a",
  "na",
  "tbd",
  "todo",
  "unspecified",
  "미상",
]);

/**
 * provenance 문자열이 고지문의 구조를 위조하지 못하게 한다.
 *
 * 고지문은 이 값들을 Markdown에 그대로 보간한다. 개행이나 코드펜스가 들어오면 절 구조와
 * 라이선스 블록의 경계를 호출부가 마음대로 바꿀 수 있고, 그러면 "원문 그대로 동봉한다"는
 * 보증이 값 하나로 무너진다.
 */
function validateNoticeSafe(label, field, value, issues) {
  if (/[\n\r]/.test(value)) {
    issues.push(`${label}: provenance.${field}에 개행이 있습니다. 고지문 구조를 위조할 수 있습니다.`);
  }
  if (value.includes("```")) {
    issues.push(`${label}: provenance.${field}에 코드펜스가 있습니다. 고지문의 라이선스 블록 경계를 깹니다.`);
  }
}

function validateSet(setName, record, licenseFiles, issues) {
  const label = `세트 ${setName}`;
  if (!/^[a-z][a-z0-9]*(-[a-z0-9]+)*$/.test(setName)) {
    issues.push(`${label}: 세트 이름은 kebab-case여야 합니다.`);
  }
  if (record === null || typeof record !== "object" || Array.isArray(record)) {
    issues.push(`${label}: 세트 정의가 객체가 아닙니다.`);
    return;
  }
  for (const field of REQUIRED_SET_FIELDS) {
    const value = record[field];
    if (
      typeof value !== "string" ||
      value.trim().length === 0 ||
      PLACEHOLDER_VALUES.has(value.trim().toLowerCase())
    ) {
      issues.push(
        `${label}: 세트 정의가 불완전합니다 (${field}). ` +
          `추정 출처와 "unknown"은 허용되지 않습니다.`,
      );
      continue;
    }
    validateNoticeSafe(label, field, value, issues);
  }
  if (typeof record.url === "string") {
    // 접두사만 보면 "https://" 한 줄이 통과한다. 실제로 열어볼 수 있는 주소인지까지 본다.
    let parsed = null;
    try {
      parsed = new URL(record.url);
    } catch {
      parsed = null;
    }
    if (parsed === null || parsed.protocol !== "https:" || parsed.hostname.length === 0) {
      issues.push(`${label}: provenance.url이 https URL이 아닙니다: ${record.url}`);
    }
  }
  if (
    typeof record.licenseFile === "string" &&
    record.licenseFile.trim().length > 0 &&
    !licenseFiles.has(record.licenseFile)
  ) {
    issues.push(
      `${label}: 라이선스 원문이 없습니다: ${ICON_LICENSE_DIRECTORY}/${record.licenseFile}. ` +
        `upstream 글리프는 고지문 없이 배포할 수 없습니다 (DS-D-0008 결정 4).`,
    );
  }
}

/**
 * 글리프 항목 하나를 읽는다. 돌려주는 값이 manifest 로 투영되는 모양이다.
 * `null`이면 이미 진단을 냈다.
 */
function validateGlyphSource(name, value, sets, issues) {
  if (value === undefined || value === null) {
    issues.push(
      `${name}: provenance가 선언되지 않았습니다 (${ICON_PROVENANCE_PATH}).`,
    );
    return null;
  }
  if (value === "original") return { origin: "original" };
  const match = typeof value === "string" ? GLYPH_SOURCE_PATTERN.exec(value) : null;
  if (match === null) {
    issues.push(
      `${name}: provenance 형식이 "세트:원래 이름" 또는 "original"이 아닙니다: ` +
        `${JSON.stringify(value)}`,
    );
    return null;
  }
  const [, setName, icon] = match;
  if (!Object.hasOwn(sets, setName)) {
    issues.push(
      `${name}: 알 수 없는 세트 "${setName}"입니다. sets에 먼저 선언하십시오 ` +
        `(선언된 세트: ${Object.keys(sets).sort(byCodePoint).join(", ") || "없음"}).`,
    );
    return null;
  }
  return { origin: "upstream", set: setName, icon };
}

/**
 * @param {{name: string, source: string}[]} files 정본 SVG
 * @param {object} provenance provenance.json을 파싱한 객체
 * @param {Map<string, string>} licenses 파일명 → 라이선스 원문
 */
export function compileIconSource(files, provenance, licenses, keywords = {}) {
  const issues = [];
  const glyphs = [];
  const licenseFiles = new Set(licenses.keys());

  // 최상위는 $comment · sets · glyphs 셋뿐이다. `$`로 시작하는 키는 문서용 주석이다. 옛 형태(글리프
  // 이름을 최상위에 두는 것)가 남으면 "선언되지 않음"으로 흩어지지 않고 여기서 먼저 말한다.
  for (const key of Object.keys(provenance)) {
    if (!key.startsWith("$") && key !== "sets" && key !== "glyphs") {
      issues.push(`provenance 최상위에 알 수 없는 키 "${key}"가 있습니다. 허용: sets, glyphs.`);
    }
  }
  const isRecordObject = (value) =>
    value !== null && typeof value === "object" && !Array.isArray(value);
  if (!isRecordObject(provenance.sets)) issues.push("provenance.sets가 객체가 아닙니다.");
  if (!isRecordObject(provenance.glyphs)) issues.push("provenance.glyphs가 객체가 아닙니다.");
  const sets = isRecordObject(provenance.sets) ? provenance.sets : {};
  const glyphSources = isRecordObject(provenance.glyphs) ? provenance.glyphs : {};
  const declaredNames = Object.keys(glyphSources);
  for (const setName of Object.keys(sets).sort(byCodePoint)) {
    validateSet(setName, sets[setName], licenseFiles, issues);
  }

  const sorted = [...files].sort((a, b) => byCodePoint(a.name, b.name));
  for (const { name, source } of sorted) {
    if (!ICON_NAME_PATTERN.test(name)) {
      issues.push(`${name}: 아이콘 이름은 kebab-case여야 합니다.`);
      continue;
    }
    // 따옴표 두 종류를 모두 받는다. 요소 파서가 둘 다 받으면서 여기만 큰따옴표를 요구하면
    // 같은 문서가 규칙에 따라 다르게 읽힌다.
    const viewBoxMatch = /<svg\b[^>]*\bviewBox=(?:"([^"]*)"|'([^']*)')/.exec(source);
    const viewBox = viewBoxMatch?.[1] ?? viewBoxMatch?.[2];
    if (viewBox !== ICON_VIEWBOX) {
      issues.push(
        `${name}: viewBox가 "${viewBox ?? "없음"}"입니다. 정본은 "${ICON_VIEWBOX}"입니다.`,
      );
      continue;
    }
    if (/<svg\b[^>]*\s(width|height)=/.test(source)) {
      issues.push(`${name}: root width/height는 정본에 남을 수 없습니다.`);
    }
    for (const forbidden of FORBIDDEN_SUBSTRINGS) {
      if (source.includes(forbidden)) {
        issues.push(`${name}: 정본에 ${forbidden}가 남아 있습니다.`);
      }
    }

    const record = validateGlyphSource(name, glyphSources[name], sets, issues);

    const { elements, seen } = parseElements(source, name, issues);
    if (seen.length === 0) issues.push(`${name}: 그릴 요소가 없습니다.`);
    for (const element of seen) normalizeColors(element, name, issues);

    // 키워드가 없으면 그 글리프는 이름을 아는 사람만 찾을 수 있다. 그래서 빠뜨리면 실패다.
    const glyphKeywords = keywords[name];
    if (!Array.isArray(glyphKeywords) || glyphKeywords.length < 2) {
      issues.push(
        `${name}: 검색 키워드가 없거나 2개 미만입니다. ${ICON_KEYWORDS_PATH}에 한국어와 영어를 함께 넣으십시오.`,
      );
    } else if (!glyphKeywords.some((word) => /[가-힣]/.test(word))) {
      issues.push(`${name}: 검색 키워드에 한국어가 없습니다. 이름은 영어인데 찾는 사람은 한국어로 떠올립니다.`);
    }

    glyphs.push({
      name,
      elements,
      sourcePath: `${ICON_SOURCE_DIRECTORY}/${name}.svg`,
      keywords: Array.isArray(glyphKeywords) ? [...glyphKeywords] : [],
      provenance: record ?? null,
    });
  }

  for (const name of declaredNames.sort(byCodePoint)) {
    if (!sorted.some((file) => file.name === name)) {
      issues.push(`${name}: provenance는 있으나 정본 SVG가 없습니다.`);
    }
  }

  // 근거 없는 고지 항목이 실리지 않게 한다: 어떤 글리프도 쓰지 않는 세트, 어떤 세트도 가리키지
  // 않는 라이선스 원문은 둘 다 실패다.
  const usedSets = new Set(glyphs.map((glyph) => glyph.provenance?.set).filter(Boolean));
  for (const setName of Object.keys(sets).sort(byCodePoint)) {
    if (!usedSets.has(setName)) {
      issues.push(
        `세트 ${setName}: 어떤 글리프도 쓰지 않는 세트입니다. ` +
          `고지문에 근거 없는 항목이 실리지 않도록 제거하십시오.`,
      );
    }
  }
  for (const key of [...licenseFiles].sort(byCodePoint)) {
    const used = Object.values(sets).some((set) => set?.licenseFile === key);
    if (!used) {
      issues.push(
        `${key}: 어떤 세트도 참조하지 않는 라이선스 원문입니다. ` +
          `고지문에 근거 없는 항목이 실리지 않도록 제거하십시오.`,
      );
    }
  }

  // 이름이 다른 두 글리프가 같은 심볼로 방출되면 생성물의 뒤엣것이 앞엣것을 덮는다.
  // kebab-case에서도 `x-2`와 `x2`가 둘 다 IconX2가 되어 실제로 일어난다.
  const symbols = new Map();
  for (const glyph of glyphs) {
    const symbol = `Icon${pascalCase(glyph.name)}`;
    const owner = symbols.get(symbol);
    if (owner !== undefined) {
      issues.push(
        `${glyph.name}: ${owner}와 같은 심볼 ${symbol}로 방출됩니다. 이름을 구분하십시오.`,
      );
    } else {
      symbols.set(symbol, glyph.name);
    }
  }

  // 같은 그림이 두 이름으로 들어오는 경우. 한쪽을 upstream으로, 다른 쪽을 original로
  // 선언하면 고지 의무가 조용히 사라진다 — 저장소가 자기 출력만으로 판정할 수 있는 사고다.
  const byGeometry = new Map();
  for (const glyph of glyphs) {
    if (glyph.elements.length === 0) continue;
    const hash = geometryHash(glyph.elements);
    const owner = byGeometry.get(hash);
    if (owner !== undefined) {
      issues.push(
        `${glyph.name}: ${owner}와 지오메트리가 같습니다 (hash ${hash}). ` +
          `같은 그림을 두 이름으로 두면 한쪽의 provenance가 다른 쪽의 고지 의무를 가립니다.`,
      );
    } else {
      byGeometry.set(hash, glyph.name);
    }
  }

  if (issues.length > 0) throw new IconValidationError(issues);
  return { viewBox: ICON_VIEWBOX, glyphs, licenses, sets };
}

function renderAttributes(attributes) {
  return [...GEOMETRY_KEYS, ...PRESENTATION_KEYS]
    .filter((key) => attributes.has(key))
    .map((key) => `${key}="${attributes.get(key)}"`)
    .join(" ");
}

function geometryHash(elements) {
  const canonical = elements
    .map((element) => {
      const geometry = GEOMETRY_KEYS.filter((key) => element.attributes.has(key))
        .map((key) => `${key}=${element.attributes.get(key)}`)
        .join(";");
      return `${element.tag}|${geometry}`;
    })
    .join("\n");
  return createHash("sha256").update(canonical).digest("hex").slice(0, 16);
}

function renderIndex(model) {
  const lines = [
    "// GENERATED FILE — packages/react/src/icons/svg의 정본을 고치고 pnpm build:icons를 실행한다.",
    "",
    'import type { JSX } from "react";',
    'import { IconRoot } from "../icon-root.js";',
    'import type { IconProps } from "../types.js";',
    "",
    'export type { IconComponent, IconProps, IconSize } from "../types.js";',
    "",
    `export type IconName =\n${model.glyphs.map((g) => `  | "${g.name}"`).join("\n")};`,
    "",
  ];
  for (const glyph of model.glyphs) {
    const children = glyph.elements
      .map(
        (element) =>
          `      <${element.tag} ${renderAttributes(element.attributes)} />`,
      )
      .join("\n");
    // 모듈 스코프 호출을 만들지 않는다 (DS-D-0008 결정 8). 함수 선언은 번들러가 참조 없이
    // 그대로 제거한다 — tsc가 붙이지 않는 /*#__PURE__*/ 주석에 의존하지 않는다.
    lines.push(
      `export function Icon${pascalCase(glyph.name)}(props: IconProps): JSX.Element {`,
      `  return (`,
      `    <IconRoot {...props} name="${glyph.name}">`,
      children,
      `    </IconRoot>`,
      `  );`,
      `}`,
      "",
    );
  }
  return lines.join("\n");
}

function renderManifest(model) {
  return (
    JSON.stringify(
      {
        formatVersion: 2,
        viewBox: model.viewBox,
        strokeWidths: [...ICON_STROKE_WIDTHS].sort(byCodePoint),
        // 쓰이는 세트만. 글리프의 provenance.set 이 이 키를 가리킨다.
        sets: Object.fromEntries(
          [...usedSetNames(model)].sort(byCodePoint).map((setName) => {
            const { project, license, licenseFile, url } = model.sets[setName];
            return [setName, { project, license, licenseFile, url }];
          }),
        ),
        icons: model.glyphs.map((glyph) => ({
          name: glyph.name,
          symbol: `Icon${pascalCase(glyph.name)}`,
          figmaName: `icon/${glyph.name}`,
          source: glyph.sourcePath,
          geometryHash: geometryHash(glyph.elements),
          elementCount: glyph.elements.length,
          keywords: glyph.keywords,
          provenance: glyph.provenance,
        })),
      },
      null,
      2,
    ) + "\n"
  );
}

function usedSetNames(model) {
  return new Set(
    model.glyphs.map((glyph) => glyph.provenance?.set).filter(Boolean),
  );
}

function renderNotices(model) {
  const lines = [
    "<!-- GENERATED FILE — packages/react/src/icons/provenance.json을 고치고 pnpm build:icons를 실행한다. -->",
    "",
    "# Third-party notices",
    "",
    "`@klipse-design/react`의 아이콘 일부는 아래 프로젝트에서 유래한다. 각 라이선스가 요구하는",
    "저작권 고지와 허가 고지를 원문 그대로 포함한다. 좌표 정규화(24 격자 · 선 1.5 · 색 슬롯)와",
    "이름 변경 외의 수정은 하지 않는다(DS-D-0078).",
    "",
  ];
  const used = usedSetNames(model);
  // 세트마다 한 절이다. 라이선스 원문은 파일 전체를 싣는다 — Lucide 원문에는 ISC 본문과 Feather
  // 파생 목록, 그리고 그 목록에 대한 MIT 고지가 함께 들어 있어서 파일을 통째로 싣는 것이 곧 두
  // 라이선스를 모두 싣는 것이다. 절 제목의 license 표현도 세트 정의에서 그대로 온다.
  for (const setName of [...used].sort(byCodePoint)) {
    const set = model.sets[setName];
    const icons = model.glyphs
      .filter((glyph) => glyph.provenance?.set === setName)
      .map((glyph) => `${glyph.name} (upstream: ${glyph.provenance.icon})`);
    lines.push(
      `## ${set.project} — ${set.license}`,
      "",
      `- Source: ${set.url}`,
      `- Icons: ${icons.join(", ")}`,
      "",
      "```text",
      model.licenses.get(set.licenseFile).trimEnd(),
      "```",
      "",
    );
  }
  if (used.size === 0) {
    lines.push("현재 upstream에서 유래한 아이콘이 없다.", "");
  }
  return lines.join("\n");
}

export function renderIconOutputs(model) {
  const index = renderIndex(model);
  // 결정 8의 기계 검증. 최상위에 허용 형태 밖의 문장이 있으면 import 시 부수효과가 생겨
  // tree-shaking이 성립하지 않는다.
  for (const line of index.split("\n")) {
    if (line.length === 0 || /^\s/.test(line)) continue;
    if (!ALLOWED_TOP_LEVEL.some((pattern) => pattern.test(line))) {
      throw new IconValidationError([
        `생성물 최상위에 허용되지 않은 문장이 있습니다: ${line.trim()} (DS-D-0008 결정 8)`,
      ]);
    }
  }
  return new Map([
    [ICON_OUTPUT_PATHS[0], index],
    [ICON_OUTPUT_PATHS[1], renderManifest(model)],
    [ICON_OUTPUT_PATHS[2], renderNotices(model)],
  ]);
}
