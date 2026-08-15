#!/usr/bin/env node
// @klipse-design/css의 배포 CSS를 저작 원본에서 생성한다 (DS-D-0004).
//
// 저작 원본: packages/css/src/{reset,base}.css 와 packages/css/src/component/*.css
// 생성물   : packages/css/generated/*
//
// 배포는 두 벌이다. 언레이어드(styles.css)와 레이어드(styles.layer.css).
// Tailwind를 쓰는 소비자는 레이어드를 써야 유틸리티가 라이브러리를 이길 수 있다.
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { atomicWriteBatch } from "./lib/atomic-output.mjs";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const args = new Set(process.argv.slice(2));
const supportedArgs = new Set(["--check", "--help"]);
const errors = [];

for (const arg of args) {
  if (!supportedArgs.has(arg)) errors.push(`알 수 없는 옵션: ${arg}`);
}
if (args.has("--help")) {
  console.log("Usage: node scripts/build-css.mjs [--check]");
  process.exit(0);
}
const checkOnly = args.has("--check");

const SOURCE_DIRECTORY = "packages/css/src";
const OUTPUT_DIRECTORY = "packages/css/generated";
const TOKEN_CSS = "packages/tokens/generated/tokens.css";

// layer 순서. 소비자 override가 항상 마지막에 오도록 kds.override를 끝에 둔다.
const LAYERS = ["kds.reset", "kds.tokens", "kds.base", "kds.component", "kds.override"];

const GENERATED_NOTICE = [
  "/* GENERATED FILE — packages/css/src의 저작 원본을 고치고 pnpm build:css를 실행한다. */",
  "",
].join("\n");

function read(relativePath) {
  return readFileSync(resolve(repoRoot, relativePath), "utf8");
}

function indent(source) {
  return source
    .split("\n")
    .map((line) => (line.length > 0 ? `  ${line}` : line))
    .join("\n");
}

function wrapInLayer(layer, source) {
  return `@layer ${layer} {\n${indent(source.trimEnd())}\n}\n`;
}

function componentSources() {
  const directory = resolve(repoRoot, SOURCE_DIRECTORY, "component");
  if (!existsSync(directory)) return [];
  return readdirSync(directory)
    .filter((name) => name.endsWith(".css"))
    .sort()
    .map((name) => ({
      name,
      path: `${SOURCE_DIRECTORY}/component/${name}`,
      source: read(`${SOURCE_DIRECTORY}/component/${name}`),
    }));
}

// --- 저작 규칙 검사 (DS-D-0004) -------------------------------------------------
// 인계서 DS-P3-003 완료 근거가 명시적으로 요구하는 검사다.
const FORBIDDEN = [
  {
    pattern: /!important/g,
    message:
      "!important는 금지된다. layer 우선순위가 역전돼 소비자가 라이브러리를 이길 수 없게 된다.",
  },
  {
    pattern: /(^|[\s,{])(html|body|\*)(?=[\s,:.[{])/gm,
    message:
      "전역 선택자(html/body/*)는 reset.css 안에서만 쓴다.",
    resetExempt: true,
  },
  {
    pattern: /z-index:\s*-?\d/g,
    message:
      "숫자 z-index는 금지된다. var(--kds-layer-*)만 쓴다 (elevation-layer.md).",
  },
  {
    pattern: /#[0-9a-fA-F]{3,8}\b|\brgba?\(|\bhsla?\(/g,
    message:
      "raw color 리터럴은 금지된다. semantic 토큰 var(--kds-color-*)만 쓴다.",
  },
];

// 주석 안의 문자열은 저작 규칙 대상이 아니다.
function stripComments(source) {
  return source.replace(/\/\*[\s\S]*?\*\//g, "");
}

function lintSource(label, rawSource, { isReset = false } = {}) {
  const source = stripComments(rawSource);
  for (const rule of FORBIDDEN) {
    if (isReset && rule.resetExempt) continue;
    const matches = source.match(rule.pattern);
    if (matches) {
      errors.push(`${label}: ${rule.message} (${matches.length}건: ${matches[0]})`);
    }
  }
  // primitive 직접 소비 금지 — DS-D-0001은 CSS에 semantic만 노출한다.
  const primitiveUse = source.match(
    /var\(--kds-(color-(neutral|blue|red|green|amber|black-alpha)-|space-\d|radius-\d|font-size-|font-weight-|line-height-|duration-)/g,
  );
  if (primitiveUse) {
    errors.push(
      `${label}: primitive를 직접 소비합니다 (${primitiveUse[0]}). semantic 토큰만 씁니다.`,
    );
  }
}

/**
 * 저작 CSS가 참조하는 `var(--kds-*)`가 실제로 선언돼 있는지 확인한다.
 *
 * 이 검사가 없으면 오타 하나가 조용히 통과한다 — CSS는 정의되지 않은 커스텀 속성을 오류로
 * 만들지 않고 그 선언만 무효로 만들기 때문에, 화면에서는 "그 규칙을 애초에 안 썼을 때"와
 * 구분되지 않는다. 토큰 이름이 바뀌는 순간 조용히 스타일이 빠지는 경로다.
 *
 * 선언 집합은 **파일을 가로질러** 모은다. 컴포넌트가 지역 변수를 선언하고 다른 컴포넌트가
 * 그것을 쓰는 형태(overlay가 선언하고 menu-popover가 소비)가 정상이기 때문이다.
 */
function lintTokenReferences(entries) {
  const declarationPattern = /^[ \t]*(--kds-[a-z0-9-]+)\s*:/gm;
  const declared = new Set();
  for (const match of read(TOKEN_CSS).matchAll(declarationPattern)) {
    declared.add(match[1]);
  }
  const stripped = entries.map((entry) => ({
    label: entry.label,
    source: stripComments(entry.source),
  }));
  for (const entry of stripped) {
    for (const match of entry.source.matchAll(declarationPattern)) {
      declared.add(match[1]);
    }
  }
  for (const entry of stripped) {
    const seen = new Set();
    for (const match of entry.source.matchAll(/var\(\s*(--kds-[a-z0-9-]+)/g)) {
      if (declared.has(match[1]) || seen.has(match[1])) continue;
      seen.add(match[1]);
      errors.push(
        `${entry.label}: 존재하지 않는 토큰을 참조합니다: ${match[1]}`,
      );
    }
  }
}

// --- 생성 ----------------------------------------------------------------------
const reset = read(`${SOURCE_DIRECTORY}/reset.css`);
const base = read(`${SOURCE_DIRECTORY}/base.css`);
const components = componentSources();

lintSource("reset.css", reset, { isReset: true });
lintSource("base.css", base);
for (const component of components) lintSource(component.path, component.source);
lintTokenReferences([
  { label: "reset.css", source: reset },
  { label: "base.css", source: base },
  ...components.map((component) => ({
    label: component.path,
    source: component.source,
  })),
]);

const layersCss = `${GENERATED_NOTICE}@layer ${LAYERS.join(", ")};\n`;

const unlayeredBody = [base, ...components.map((component) => component.source)]
  .map((source) => source.trimEnd())
  .join("\n\n");
const stylesCss = `${GENERATED_NOTICE}${unlayeredBody}\n`;

const layeredBody = [
  wrapInLayer("kds.base", base),
  ...components.map((component) => wrapInLayer("kds.component", component.source)),
].join("\n");
const stylesLayerCss = `${GENERATED_NOTICE}${layeredBody}`;

const resetCss = `${GENERATED_NOTICE}${wrapInLayer("kds.reset", reset)}`;

// token CSS는 다시 생성하지 않고 그대로 재export한다 (DS-D-0001).
const tokensCss = read(TOKEN_CSS);

const outputs = new Map([
  [`${OUTPUT_DIRECTORY}/layers.css`, layersCss],
  [`${OUTPUT_DIRECTORY}/tokens.css`, tokensCss],
  [`${OUTPUT_DIRECTORY}/reset.css`, resetCss],
  [`${OUTPUT_DIRECTORY}/styles.css`, stylesCss],
  [`${OUTPUT_DIRECTORY}/styles.layer.css`, stylesLayerCss],
]);

// 두 벌의 규칙 수가 같아야 한다. 하나만 갱신되는 사고를 막는다.
const countRules = (source) => (source.match(/\{/g) ?? []).length;
const layeredExtra = 1 + components.length; // @layer 래퍼 블록
if (countRules(stylesCss) !== countRules(stylesLayerCss) - layeredExtra) {
  errors.push(
    "styles.css와 styles.layer.css의 규칙 수가 다릅니다. 두 벌이 같은 저작 원본에서 나와야 합니다.",
  );
}

if (errors.length === 0) {
  const writePlan = [];
  for (const [path, expected] of outputs) {
    const absolute = resolve(repoRoot, path);
    const actual = existsSync(absolute) ? readFileSync(absolute, "utf8") : null;
    if (actual === expected) continue;
    if (checkOnly) errors.push(`generated CSS가 최신이 아닙니다: ${path}`);
    else writePlan.push({ absolute, expected });
  }
  if (errors.length === 0 && writePlan.length > 0) atomicWriteBatch(writePlan);
}

if (errors.length > 0) {
  for (const error of errors) console.error(`[css] ${error}`);
  process.exit(1);
}
console.log(
  `[css] ${checkOnly ? "checked" : "built"}: ${outputs.size} outputs, ${components.length} components`,
);
