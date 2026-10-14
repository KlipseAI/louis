// 제품 접근 이름의 모든 언어 값을 제품 사전에서 읽는다.
//
// 측정기는 제품의 몇몇 요소를 접근 이름(aria-label)으로 찾는다 — 「Open profile」(프로필 단추) · 「Collapse sidebar」(접기 단추) 등.
// 2026-10-14 제품이 사용자 문구를 사전(`components/landing/system/messages/`)으로 옮기면서(klipse-web 「User-Facing Copy」) 이 이름이
// 로캘마다 번역된다. 영어 문자열 하나로 찾으면 ko · ja 로캘 측정(`--locale=`)에서 요소를 놓치고, 탐침이 조용히 null 이 된다.
// 그래서 측정하는 제품 커밋의 사전에서 영어 값이 같은 **키 경로**(예 `gnb.sidebarCollapse`)를 찾고, ko · ja 사전에서 같은 경로의 값을
// 모은다. 키 이름만으로 모으면 안 된다 — `openMenu` · `back` 같은 이름은 사전의 여러 절에 다른 뜻으로 있다.
// 기록에는 지금처럼 영어 정본 이름을 남긴다(원장 · 생성기가 그 이름을 키로 쓴다).
// 사전에 그 값이 없는 옛 커밋(측정 앵커가 사전 이전이면)은 영어 정본 하나로 돌아간다.
import { execFileSync } from "node:child_process";

const MESSAGES_DIR = "apps/web/components/landing/system/messages";
const EN_FILE = `${MESSAGES_DIR}/en.ts`;
// ja 는 en 위에 덮어쓰는 조각들이다(ja.ts 의 deepMerge). 어느 조각에 있든 모두 후보로 모은다.
const LOCALE_FILES = [`${MESSAGES_DIR}/ko.ts`, `${MESSAGES_DIR}/ja-overrides-landing.ts`, `${MESSAGES_DIR}/ja-overrides-surface.ts`, `${MESSAGES_DIR}/ja-overrides-create.ts`];

const STRING = String.raw`"((?:[^"\\]|\\.)*)"`;
const OPEN = /^\s*([A-Za-z_$][\w$]*)\s*:\s*\{\s*$/;
const CLOSE = /^\s*\}[,;]?\s*$/;
const LEAF = new RegExp(String.raw`^\s*([A-Za-z_$][\w$]*)\s*:\s*${STRING},?\s*$`);
const LEAF_KEY_ONLY = /^\s*([A-Za-z_$][\w$]*)\s*:\s*$/;
const LEAF_VALUE_ONLY = new RegExp(String.raw`^\s*${STRING},?\s*$`);

// prettier 가 정리한 객체 리터럴 파일을 줄 단위로 읽어 「키 경로 → 문자열 값」을 낸다. 첫 `= {` 줄이 뿌리다.
// 함수 값(`(x) => { … }`) 안의 중괄호는 이름 없는 칸으로 쌓아 경로를 지키고, 그 안의 잎은 버린다.
// 템플릿 문자열 · 한 줄 객체 · 배열 원소도 버린다 — 접근 이름은 평범한 문자열 잎이다.
const bracesOf = (line) => {
  const code = line.replace(/"(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|`(?:[^`\\]|\\.)*`/g, "").replace(/\/\/.*$/, "");
  return { opens: (code.match(/\{/g) ?? []).length, closes: (code.match(/\}/g) ?? []).length };
};

export function messageLeaves(source) {
  const leaves = new Map();
  const lines = source.split("\n");
  const stack = [];
  let started = false;
  const record = (key, raw) => {
    if (!stack.includes(null)) leaves.set([...stack, key].join("."), JSON.parse(`"${raw}"`));
  };
  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];
    if (!started) {
      if (/=\s*\{\s*$/.test(line)) started = true;
      continue;
    }
    if (stack.length === 0 && CLOSE.test(line)) break;
    let match = line.match(OPEN);
    if (match) { stack.push(match[1]); continue; }
    if (CLOSE.test(line)) { stack.pop(); continue; }
    match = line.match(LEAF);
    if (match) { record(match[1], match[2]); continue; }
    match = line.match(LEAF_KEY_ONLY);
    const next = match ? lines[index + 1]?.match(LEAF_VALUE_ONLY) : null;
    if (next) { record(match[1], next[1]); index += 1; continue; }
    const { opens, closes } = bracesOf(line);
    // 한 줄에서 열고 닫는 것(`{ ko: "한국어", en: "English" }`)은 경로를 바꾸지 않는다 — 차이만 쌓거나 덜어 낸다.
    for (let step = 0; step < closes - opens; step += 1) stack.pop();
    for (let step = 0; step < opens - closes; step += 1) stack.push(null);
  }
  return leaves;
}

const showAt = (productRoot, commit, file) => {
  try {
    return execFileSync("git", ["show", `${commit}:${file}`], {
      cwd: productRoot, encoding: "utf8", maxBuffer: 64 * 1024 * 1024, stdio: ["ignore", "pipe", "ignore"],
    });
  } catch {
    return null;
  }
};

// 영어 정본 이름들 → { 정본: [정본, 번역들…] }. 정본이 늘 첫째다.
export function productAriaLabels(productRoot, commit, canonicals) {
  const result = Object.fromEntries(canonicals.map((canonical) => [canonical, new Set([canonical])]));
  const enSource = showAt(productRoot, commit, EN_FILE);
  if (enSource) {
    const pathsOf = new Map(canonicals.map((canonical) => [canonical, []]));
    for (const [path, value] of messageLeaves(enSource)) pathsOf.get(value)?.push(path);
    const localeLeaves = LOCALE_FILES.map((file) => showAt(productRoot, commit, file)).filter(Boolean).map(messageLeaves);
    for (const [canonical, paths] of pathsOf) {
      for (const path of paths) {
        for (const leaves of localeLeaves) {
          const value = leaves.get(path);
          if (value) result[canonical].add(value);
        }
      }
    }
  }
  return Object.fromEntries(Object.entries(result).map(([canonical, labels]) => [canonical, [...labels]]));
}
