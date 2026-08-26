#!/usr/bin/env node
// semantic token을 Tailwind 4의 `@theme inline` 블록으로 projection한다.
// 실행: node scripts/build-tailwind-theme.mjs [--check]
//
// ## 왜 컴포넌트가 아니라 토큰만인가
//
// 소비 제품은 Tailwind 4를 쓰고, 이미 `@theme inline` 블록을 **생성기로** 만들고 있다. 그 생성기는
// 제품의 `globals.css`를 긁어 쓰는데, 그러면 DS 토큰이 정본이 아니라 제품 CSS가 정본이 된다.
// 이 파일이 그 상류가 된다 — DS token source 하나에서 CSS 변수와 Tailwind 유틸리티가 함께 나온다.
//
// 컴포넌트 CSS는 authored plain CSS로 남긴다 (DS-D-0004). 유틸리티를 package로 내보내면 소비하는
// 쪽이 Tailwind를 **반드시** 갖춰야 하고, 같은 클래스가 소비자 설정에 따라 다른 결과를 내며,
// cascade layer가 주는 예측 가능한 override 계약이 사라진다.
//
// ## `inline`인 이유
//
// semantic 색은 `:root`와 `[data-theme="dark"]`에서 각각 정의되어 **런타임에 바뀐다**. `inline`이
// 아니면 Tailwind가 빌드 시점 값을 구워 넣어 테마 전환을 따라가지 않는다.
//
// ## 매핑되지 않은 접두사는 실패다
//
// 새 토큰 범주가 생겼는데 매핑을 안 하면 조용히 빠진다. 그래서 모르는 접두사를 만나면 실패한다.
import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { atomicWriteBatch } from "./lib/atomic-output.mjs";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const checkOnly = process.argv.includes("--check");
const OUTPUT_PATH = "packages/css/generated/theme.css";
const MANIFEST_PATH = "packages/tokens/generated/manifest.json";

/**
 * DS 토큰 접두사 → Tailwind 4 theme namespace.
 *
 * `null`은 "Tailwind에 대응 namespace가 없다"는 뜻이다. 그 토큰도 변수로는 내보내되 유틸리티는
 * 생기지 않는다 — `[z-index:var(--louis-layer-modal)]` 같은 임의값으로 쓴다. 빼지 않는 이유는
 * 소비하는 쪽이 DS 변수를 한 곳에서 찾을 수 있어야 하기 때문이다.
 */
const NAMESPACE = {
  color: { prefix: "--color-", strip: "color-" },
  space: { prefix: "--spacing-", strip: "space-" },
  layout: { prefix: "--spacing-", strip: "" },
  icon: { prefix: "--spacing-", strip: "" },
  radius: { prefix: "--radius-", strip: "radius-" },
  elevation: { prefix: "--shadow-", strip: "elevation-" },
  blur: { prefix: "--blur-", strip: "blur-" },
  typography: { prefix: "--text-", strip: "typography-" },
  // 제품 티어 토큰(DS-D-0029). Tailwind namespace 로 내보내지 않고 변수로만 둔다 —
  // 이들은 특정 화면의 측정값이라 유틸리티가 되면 아무 데나 쓰이게 된다.
  app: null,
  button: null,
  dropdown: null,
  footer: null,
  misc: null,
  node: null,
  type: null,
  scale: null,
  // Tailwind 4에 대응 namespace가 없다. 변수로만 내보낸다.
  layer: null,
  border: null,
  motion: null,
};

const manifest = JSON.parse(readFileSync(resolve(repoRoot, MANIFEST_PATH), "utf8"));

/** manifest를 훑어 semantic token id 목록을 만든다. mode가 여럿이면 하나로 접는다. */
function collectSemanticIds(node, found = new Map()) {
  if (Array.isArray(node)) {
    for (const item of node) collectSemanticIds(item, found);
    return found;
  }
  if (node === null || typeof node !== "object") return found;
  if (typeof node.id === "string" && node.tier === "semantic" && typeof node.type === "string") {
    found.set(node.id, node.type);
  }
  for (const value of Object.values(node)) collectSemanticIds(value, found);
  return found;
}

const semantic = [...collectSemanticIds(manifest)].sort(([a], [b]) => (a < b ? -1 : 1));
if (semantic.length === 0) {
  console.error("[tailwind-theme] semantic token을 찾지 못했습니다.");
  process.exit(1);
}

const failures = [];
const lines = [];
const unmapped = [];
const grouped = new Map();

for (const [id, type] of semantic) {
  const prefix = id.startsWith("border-width-") ? "border" : id.split("-")[0];
  if (!(prefix in NAMESPACE)) {
    failures.push(
      `매핑되지 않은 토큰 접두사입니다: ${prefix} (${id}). scripts/build-tailwind-theme.mjs의 NAMESPACE에 추가하십시오.`,
    );
    continue;
  }
  const mapping = NAMESPACE[prefix];
  if (mapping === null) {
    unmapped.push([id, type]);
    continue;
  }
  const name = mapping.strip.length > 0 ? id.slice(mapping.strip.length) : id;
  const list = grouped.get(mapping.prefix) ?? [];
  list.push([`${mapping.prefix}${name}`, id, type]);
  grouped.set(mapping.prefix, list);
}

const HEADING = {
  "--color-": "색 — bg-*, text-*, border-* 유틸리티가 된다",
  "--spacing-": "치수 — p-*, m-*, gap-*, w-*, h-* 유틸리티가 된다",
  "--radius-": "곡률 — rounded-* 유틸리티가 된다",
  "--shadow-": "그림자 — shadow-* 유틸리티가 된다",
  "--blur-": "흐림 — blur-*, backdrop-blur-* 유틸리티가 된다",
  "--text-": "타이포 — text-* 유틸리티가 된다. 크기·행간·자간·굵기가 함께 붙는다",
};

lines.push("@theme inline {");
for (const [prefix, entries] of [...grouped].sort(([a], [b]) => (a < b ? -1 : 1))) {
  lines.push(`  /* ${HEADING[prefix] ?? prefix} */`);
  for (const [themeName, id, type] of entries) {
    if (prefix === "--text-" && type === "typography") {
      // Tailwind 4는 `--text-<name>--line-height` 형태의 보조 키를 함께 읽는다.
      lines.push(`  ${themeName}: var(--louis-${id}-font-size);`);
      lines.push(`  ${themeName}--line-height: var(--louis-${id}-line-height);`);
      lines.push(`  ${themeName}--letter-spacing: var(--louis-${id}-letter-spacing);`);
      lines.push(`  ${themeName}--font-weight: var(--louis-${id}-font-weight);`);
      continue;
    }
    lines.push(`  ${themeName}: var(--louis-${id});`);
  }
  lines.push("");
}
if (unmapped.length > 0) {
  lines.push("  /* Tailwind 4에 대응 namespace가 없다. 변수로만 내보내며 유틸리티는 생기지 않는다 —");
  lines.push("   * `[z-index:var(--louis-layer-modal)]` 같은 임의값으로 쓴다. */");
  for (const [id] of unmapped) lines.push(`  --louis-${id}: var(--louis-${id});`);
  lines.push("");
}
while (lines.at(-1) === "") lines.pop();
lines.push("}");

const header = [
  "/* GENERATED — 손으로 수정하지 않는다.",
  " *",
  " * 생성: node scripts/build-tailwind-theme.mjs",
  " * 원천: packages/tokens/src/klipse.tokens.json",
  " * 결정: design/governance/decisions/DS-D-0013-tailwind-interop.md",
  " *",
  " * 이 파일만 import해도 유틸리티는 동작하지 않는다. 값이 `var(--louis-*)`를 가리키므로",
  " * `@klipse-design/css/tokens.css`를 함께 불러야 한다.",
  " *",
  " * `inline`인 이유: semantic 색이 `:root`와 `[data-theme=\"dark\"]`에서 각각 정의되어 런타임에",
  " * 바뀐다. inline이 아니면 Tailwind가 빌드 시점 값을 구워 넣어 테마 전환을 따라가지 않는다.",
  " */",
  "",
].join("\n");

const contents = `${header}${lines.join("\n")}\n`;

if (failures.length > 0) {
  for (const failure of failures) console.error(`[tailwind-theme] ${failure}`);
  process.exit(1);
}

const absolute = resolve(repoRoot, OUTPUT_PATH);
const actual = existsSync(absolute) ? readFileSync(absolute, "utf8") : null;
const drifted = actual !== contents;
if (drifted) {
  if (checkOnly) {
    console.error(`[tailwind-theme] generated CSS가 최신이 아닙니다: ${OUTPUT_PATH}`);
    process.exit(1);
  }
  atomicWriteBatch([{ absolute, expected: contents }]);
}
const utilityCount = [...grouped.values()].reduce((total, list) => total + list.length, 0);
console.log(
  `[tailwind-theme] ${checkOnly ? "checked" : "built"}: 유틸리티 토큰 ${utilityCount}개, ` +
    `변수 전용 ${unmapped.length}개`,
);
