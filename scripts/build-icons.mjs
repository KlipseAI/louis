#!/usr/bin/env node
// 아이콘 정본에서 React 생성물·manifest·고지문을 만든다.
// 실행: node scripts/build-icons.mjs [--check|--write] [--require-tracked]
//
// build-tokens.mjs와 같은 두 단계 구조다 — 모든 검증을 마친 뒤에만 쓴다. 경로 안전 검사는
// scripts/lib/repo-paths.mjs를 공유한다.
import { mkdirSync, readFileSync, readdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import {
  ICON_LICENSE_DIRECTORY,
  ICON_OUTPUT_DIRECTORY,
  ICON_OUTPUT_PATHS,
  ICON_KEYWORDS_PATH,
  ICON_PROVENANCE_PATH,
  ICON_SOURCE_DIRECTORY,
  IconValidationError,
  compileIconSource,
  renderIconOutputs,
} from "./lib/icon-model.mjs";
import { atomicWriteBatch } from "./lib/atomic-output.mjs";
import { createRepoGuard } from "./lib/repo-paths.mjs";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const args = new Set(process.argv.slice(2));
const supportedArgs = new Set([
  "--check",
  "--write",
  "--require-tracked",
  "--help",
]);
const errors = [];

for (const arg of args) {
  if (!supportedArgs.has(arg)) errors.push(`알 수 없는 옵션: ${arg}`);
}
if (args.has("--help")) {
  console.log(
    "Usage: node scripts/build-icons.mjs [--check|--write] [--require-tracked]",
  );
  process.exit(0);
}
if (args.has("--check") && args.has("--write")) {
  errors.push("--check와 --write는 함께 사용할 수 없습니다.");
}

const checkOnly = args.has("--check");
const requireTracked =
  args.has("--require-tracked") || process.env.CI === "true";

const {
  absoluteRepoPath,
  lstatOrNull,
  validateExistingFile,
  validateDirectoryChain,
  requireTrackedFiles,
} = createRepoGuard(repoRoot, errors);

const sourceDirectory = absoluteRepoPath(ICON_SOURCE_DIRECTORY, "icon source");
const licenseDirectory = absoluteRepoPath(
  ICON_LICENSE_DIRECTORY,
  "icon license",
);
const provenanceAbsolute = absoluteRepoPath(
  ICON_PROVENANCE_PATH,
  "icon provenance",
);
const outputDirectory = absoluteRepoPath(
  ICON_OUTPUT_DIRECTORY,
  "generated directory",
);
const outputAbsolutes = new Map(
  ICON_OUTPUT_PATHS.map((path) => [
    path,
    absoluteRepoPath(path, "generated output"),
  ]),
);

/** 디렉터리 안의 파일을 읽되, 각 항목이 저장소 안의 진짜 파일인지 먼저 확인한다. */
function readDirectoryFiles(directory, relativeDirectory, extension, label) {
  if (!directory) return [];
  if (!validateDirectoryChain(directory, label, false)) return [];
  const entries = readdirSync(directory, { withFileTypes: true })
    .filter((entry) => entry.name.endsWith(extension))
    .map((entry) => entry.name)
    .sort();
  const files = [];
  for (const entry of entries) {
    const absolute = resolve(directory, entry);
    if (!validateExistingFile(absolute, label, true)) continue;
    files.push({
      entry,
      relativePath: `${relativeDirectory}/${entry}`,
      source: readFileSync(absolute, "utf8"),
    });
  }
  return files;
}

const svgFiles = readDirectoryFiles(
  sourceDirectory,
  ICON_SOURCE_DIRECTORY,
  ".svg",
  "icon source",
).map((file) => ({
  name: file.entry.slice(0, -4),
  source: file.source,
  relativePath: file.relativePath,
}));

const licenseFiles = readDirectoryFiles(
  licenseDirectory,
  ICON_LICENSE_DIRECTORY,
  ".txt",
  "icon license",
);
const licenses = new Map(
  licenseFiles.map((file) => [file.entry, file.source]),
);

let provenance = null;
if (
  provenanceAbsolute &&
  validateExistingFile(provenanceAbsolute, "icon provenance", true)
) {
  try {
    provenance = JSON.parse(readFileSync(provenanceAbsolute, "utf8"));
  } catch (error) {
    errors.push(`provenance를 읽을 수 없습니다: ${error.message}`);
  }
}

let keywords = null;
const keywordsAbsolute = absoluteRepoPath(ICON_KEYWORDS_PATH, "icon keywords");
if (keywordsAbsolute && validateExistingFile(keywordsAbsolute, "icon keywords", true)) {
  try {
    keywords = JSON.parse(readFileSync(keywordsAbsolute, "utf8")).keywords ?? {};
  } catch (error) {
    errors.push(`검색 키워드를 읽을 수 없습니다: ${error.message}`);
  }
}

let expectedOutputs = null;
if (errors.length === 0 && provenance && keywords) {
  try {
    expectedOutputs = renderIconOutputs(
      compileIconSource(svgFiles, provenance, licenses, keywords),
    );
    // 순수성 증명 — 같은 process에서 두 번 render해 byte 동일함을 확인한다. 생성이
    // 입력 외의 무엇(삽입 순서, 시각, 난수)에 의존하면 여기서 드러난다.
    const again = renderIconOutputs(
      compileIconSource(svgFiles, provenance, licenses, keywords),
    );
    for (const [path, value] of expectedOutputs) {
      if (again.get(path) !== value) {
        errors.push(`생성이 결정론적이지 않습니다: ${path}`);
      }
    }
  } catch (error) {
    if (error instanceof IconValidationError) errors.push(...error.issues);
    else errors.push(`아이콘 생성 실패: ${error.stack ?? error.message}`);
  }
}

if (expectedOutputs) {
  const expectedPaths = [...expectedOutputs.keys()].sort();
  const declaredPaths = [...ICON_OUTPUT_PATHS].sort();
  if (JSON.stringify(expectedPaths) !== JSON.stringify(declaredPaths)) {
    errors.push("generator output 목록과 선언된 output 목록이 일치하지 않습니다.");
  }
}

// 선언되지 않은 generated entry 금지 (build-tokens.mjs와 동일 규칙).
if (
  outputDirectory &&
  validateDirectoryChain(outputDirectory, "generated directory", true)
) {
  const directoryMetadata = lstatOrNull(outputDirectory);
  if (directoryMetadata?.isDirectory()) {
    const allowedNames = new Set(
      ICON_OUTPUT_PATHS.filter((path) =>
        path.startsWith(`${ICON_OUTPUT_DIRECTORY}/`),
      ).map((path) => path.slice(path.lastIndexOf("/") + 1)),
    );
    for (const entry of readdirSync(outputDirectory, { withFileTypes: true })) {
      if (!allowedNames.has(entry.name)) {
        errors.push(
          `선언되지 않은 generated entry가 있습니다: ${ICON_OUTPUT_DIRECTORY}/${entry.name}`,
        );
      }
    }
  }
}

const writePlan = [];
if (expectedOutputs) {
  for (const outputPath of ICON_OUTPUT_PATHS) {
    const absolute = outputAbsolutes.get(outputPath);
    if (!absolute) continue;
    if (!validateDirectoryChain(dirname(absolute), "generated output", true)) {
      continue;
    }
    const metadata = lstatOrNull(absolute);
    if (metadata && !validateExistingFile(absolute, "generated output", false)) {
      continue;
    }
    const expected = expectedOutputs.get(outputPath);
    const actual = metadata ? readFileSync(absolute, "utf8") : null;
    if (actual !== expected) {
      if (checkOnly) errors.push(`generated output drift: ${outputPath}`);
      else writePlan.push({ absolute, expected, outputPath });
    }
  }
}

if (requireTracked) {
  requireTrackedFiles([
    ICON_PROVENANCE_PATH,
    ...svgFiles.map((file) => file.relativePath),
    ...licenseFiles.map((file) => file.relativePath),
    ...ICON_OUTPUT_PATHS,
  ]);
}

if (errors.length > 0) {
  console.error(errors.map((error) => `- ${error}`).join("\n"));
  process.exit(1);
}

if (!checkOnly) {
  if (writePlan.length > 0 && outputDirectory) {
    mkdirSync(outputDirectory, { recursive: true });
  }
  atomicWriteBatch(writePlan);
}

console.log(
  checkOnly
    ? `Icon outputs OK (${svgFiles.length} glyphs, ${ICON_OUTPUT_PATHS.length} files).`
    : `Icon outputs updated (${writePlan.length}/${ICON_OUTPUT_PATHS.length} files).`,
);
