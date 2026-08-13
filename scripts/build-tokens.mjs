import { execFileSync } from "node:child_process";
import {
  existsSync,
  lstatSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  realpathSync,
} from "node:fs";
import { dirname, isAbsolute, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";
import {
  TOKEN_OUTPUT_DIRECTORY,
  TOKEN_OUTPUT_PATHS,
  TOKEN_SOURCE_PATH,
  TokenValidationError,
  compileTokenSource,
  renderTokenOutputs,
} from "./lib/token-model.mjs";
import { atomicWriteBatch } from "./lib/atomic-output.mjs";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const realRepoRoot = realpathSync(repoRoot);
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
    "Usage: node scripts/build-tokens.mjs [--check|--write] [--require-tracked]",
  );
  process.exit(0);
}
if (args.has("--check") && args.has("--write")) {
  errors.push("--check와 --write는 함께 사용할 수 없습니다.");
}

const checkOnly = args.has("--check");
const requireTracked =
  args.has("--require-tracked") || process.env.CI === "true";

function repoPath(absolute) {
  return relative(repoRoot, absolute).split(sep).join("/");
}

function absoluteRepoPath(candidate, label) {
  if (
    typeof candidate !== "string" ||
    candidate.length === 0 ||
    isAbsolute(candidate) ||
    candidate.includes("\\")
  ) {
    errors.push(
      `${label}는 저장소 상대 POSIX 경로여야 합니다: ${String(candidate)}`,
    );
    return null;
  }
  const absolute = resolve(repoRoot, candidate);
  if (absolute === repoRoot || !absolute.startsWith(repoRoot + sep)) {
    errors.push(`${label}가 저장소 밖을 가리킵니다: ${candidate}`);
    return null;
  }
  return absolute;
}

function lstatOrNull(path) {
  try {
    return lstatSync(path);
  } catch (error) {
    if (error.code === "ENOENT") return null;
    errors.push(`${repoPath(path)} 상태를 읽을 수 없습니다: ${error.message}`);
    return null;
  }
}

function isInsideRealRepo(path) {
  const real = realpathSync(path);
  return real === realRepoRoot || real.startsWith(realRepoRoot + sep);
}

function validateExistingFile(absolute, label, required) {
  const metadata = lstatOrNull(absolute);
  if (!metadata) {
    if (required)
      errors.push(`${label} 파일이 없습니다: ${repoPath(absolute)}`);
    return false;
  }
  if (metadata.isSymbolicLink()) {
    errors.push(
      `${label} 파일은 symbolic link일 수 없습니다: ${repoPath(absolute)}`,
    );
    return false;
  }
  if (!metadata.isFile()) {
    errors.push(`${label} 경로가 파일이 아닙니다: ${repoPath(absolute)}`);
    return false;
  }
  if (metadata.nlink > 1) {
    errors.push(
      `${label} 파일은 hard link일 수 없습니다: ${repoPath(absolute)}`,
    );
    return false;
  }
  if (!isInsideRealRepo(absolute)) {
    errors.push(
      `${label} 파일이 저장소 밖으로 해석됩니다: ${repoPath(absolute)}`,
    );
    return false;
  }
  return true;
}

function validateDirectoryChain(absolute, label, allowMissing) {
  const parts = relative(repoRoot, absolute).split(sep).filter(Boolean);
  let current = repoRoot;
  for (const part of parts) {
    current = resolve(current, part);
    const metadata = lstatOrNull(current);
    if (!metadata) return allowMissing;
    if (metadata.isSymbolicLink()) {
      errors.push(
        `${label} 경로에 symbolic link directory가 있습니다: ${repoPath(current)}`,
      );
      return false;
    }
    if (!metadata.isDirectory()) {
      errors.push(
        `${label} parent가 directory가 아닙니다: ${repoPath(current)}`,
      );
      return false;
    }
    if (!isInsideRealRepo(current)) {
      errors.push(
        `${label} directory가 저장소 밖으로 해석됩니다: ${repoPath(current)}`,
      );
      return false;
    }
  }
  return true;
}

const sourceAbsolute = absoluteRepoPath(TOKEN_SOURCE_PATH, "token source");
const outputDirectory = absoluteRepoPath(
  TOKEN_OUTPUT_DIRECTORY,
  "generated directory",
);
const outputAbsolutes = new Map(
  TOKEN_OUTPUT_PATHS.map((path) => [
    path,
    absoluteRepoPath(path, "generated output"),
  ]),
);

let expectedOutputs = null;
if (
  sourceAbsolute &&
  validateExistingFile(sourceAbsolute, "token source", true)
) {
  try {
    const source = readFileSync(sourceAbsolute, "utf8");
    expectedOutputs = renderTokenOutputs(
      compileTokenSource(source, { sourcePath: TOKEN_SOURCE_PATH }),
    );
  } catch (error) {
    if (error instanceof TokenValidationError) errors.push(...error.issues);
    else errors.push(`token 생성 실패: ${error.stack ?? error.message}`);
  }
}

if (expectedOutputs) {
  const expectedPaths = [...expectedOutputs.keys()].sort();
  const declaredPaths = [...TOKEN_OUTPUT_PATHS].sort();
  if (JSON.stringify(expectedPaths) !== JSON.stringify(declaredPaths)) {
    errors.push(
      "generator output 목록과 선언된 output 목록이 일치하지 않습니다.",
    );
  }
}

if (
  outputDirectory &&
  validateDirectoryChain(outputDirectory, "generated directory", true)
) {
  const directoryMetadata = lstatOrNull(outputDirectory);
  if (directoryMetadata?.isDirectory()) {
    const allowedNames = new Set(
      TOKEN_OUTPUT_PATHS.map((path) => path.slice(path.lastIndexOf("/") + 1)),
    );
    for (const entry of readdirSync(outputDirectory, { withFileTypes: true })) {
      if (!allowedNames.has(entry.name)) {
        errors.push(
          `선언되지 않은 generated entry가 있습니다: ${TOKEN_OUTPUT_DIRECTORY}/${entry.name}`,
        );
      }
    }
  }
}

const writePlan = [];
if (expectedOutputs) {
  for (const outputPath of TOKEN_OUTPUT_PATHS) {
    const absolute = outputAbsolutes.get(outputPath);
    if (!absolute) continue;
    if (!validateDirectoryChain(dirname(absolute), "generated output", true))
      continue;
    const metadata = lstatOrNull(absolute);
    if (metadata && !validateExistingFile(absolute, "generated output", false))
      continue;
    const expected = expectedOutputs.get(outputPath);
    const actual = metadata ? readFileSync(absolute, "utf8") : null;
    if (actual !== expected) {
      if (checkOnly) errors.push(`generated output drift: ${outputPath}`);
      else writePlan.push({ absolute, expected, outputPath });
    }
  }
}

if (requireTracked) {
  let gitRoot = null;
  try {
    gitRoot = realpathSync(
      execFileSync("git", ["rev-parse", "--show-toplevel"], {
        cwd: repoRoot,
        encoding: "utf8",
        stdio: ["ignore", "pipe", "pipe"],
      }).trim(),
    );
  } catch (error) {
    errors.push(`Git 저장소를 확인할 수 없습니다: ${error.message}`);
  }
  if (gitRoot && gitRoot !== realRepoRoot) {
    errors.push(`Git root가 script repo root와 다릅니다: ${gitRoot}`);
  }
  for (const path of [TOKEN_SOURCE_PATH, ...TOKEN_OUTPUT_PATHS]) {
    try {
      execFileSync("git", ["ls-files", "--error-unmatch", "--", path], {
        cwd: repoRoot,
        stdio: "ignore",
      });
    } catch {
      errors.push(`Git에 추적되지 않은 token 파일: ${path}`);
    }
  }
}

if (errors.length > 0) {
  console.error(errors.map((error) => `- ${error}`).join("\n"));
  process.exit(1);
}

if (!checkOnly) {
  // 모든 source/output/parent를 검증한 뒤에만 쓰는 두 번째 단계입니다.
  if (writePlan.length > 0) mkdirSync(outputDirectory, { recursive: true });
  atomicWriteBatch(writePlan);
}

console.log(
  checkOnly
    ? `Token outputs OK (${TOKEN_OUTPUT_PATHS.length} files).`
    : `Token outputs updated (${writePlan.length}/${TOKEN_OUTPUT_PATHS.length} files).`,
);
