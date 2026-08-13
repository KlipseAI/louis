import {
  existsSync,
  lstatSync,
  mkdirSync,
  readFileSync,
  realpathSync,
  writeFileSync,
} from "node:fs";
import { dirname, isAbsolute, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { validateJsonSchema } from "./lib/json-schema.mjs";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const realRepoRoot = realpathSync(repoRoot);
const manifestPath = resolve(repoRoot, "design/manifest.json");
const schemaPath = resolve(repoRoot, "design/manifest.schema.json");
const outputDirectory = resolve(repoRoot, "design/llms");
const args = new Set(process.argv.slice(2));
const supportedArgs = new Set(["--check", "--write", "--help"]);
const errors = [];

for (const arg of args) {
  if (!supportedArgs.has(arg)) errors.push("알 수 없는 옵션: " + arg);
}

if (args.has("--help")) {
  console.log("Usage: node scripts/build-llms-docs.mjs [--check|--write]");
  process.exit(0);
}

if (args.has("--check") && args.has("--write")) {
  errors.push("--check와 --write는 함께 사용할 수 없습니다.");
}

const checkOnly = args.has("--check");
const manifest = readJson(manifestPath, "design manifest");
if (!manifest) reportAndExit();
const schema = readJson(schemaPath, "design manifest schema");
if (!schema) reportAndExit();
try {
  for (const issue of validateJsonSchema(schema, manifest)) {
    errors.push("manifest schema " + issue.path + ": " + issue.message);
  }
} catch (error) {
  errors.push("manifest schema를 검증할 수 없습니다: " + error.message);
}
if (errors.length > 0) reportAndExit();

const documents = Array.isArray(manifest.documents) ? manifest.documents : [];
const normative = documents.filter(
  (document) => document.authority === "normative",
);
const exclusions = new Map([
  ["manifest-catalog", "machine-readable catalog"],
  ["manifest-schema", "machine-readable schema"],
  ["component-template", "authoring scaffold"],
]);
const targetBySection = new Map([
  ["foundations", "foundations"],
  ["components", "components"],
  ["patterns", "patterns"],
  ["get-started", "guidelines"],
  ["develop", "guidelines"],
  ["content", "guidelines"],
  ["governance", "guidelines"],
  ["updates", "guidelines"],
]);
const targetMeta = {
  foundations: {
    id: "llms-foundations",
    title: "Klipse Design Foundations",
    description: "토큰, 접근성, 반응형 기반 계약",
  },
  components: {
    id: "llms-components",
    title: "Klipse Design Components",
    description: "컴포넌트 사용·상태·접근성 계약",
  },
  patterns: {
    id: "llms-patterns",
    title: "Klipse Design Patterns",
    description: "반복되는 제품 composition 계약",
  },
  guidelines: {
    id: "llms-guidelines",
    title: "Klipse Design Guidelines",
    description: "개발, 콘텐츠, 거버넌스와 adoption 계약",
  },
};
const entriesByTarget = {
  foundations: [],
  components: [],
  patterns: [],
  guidelines: [],
};

for (const [id, reason] of exclusions) {
  if (!normative.some((document) => document.id === id)) {
    errors.push("stale normative exclusion: " + id + " (" + reason + ")");
  }
}

for (const document of normative) {
  if (exclusions.has(document.id)) continue;
  const target = targetBySection.get(document.section);
  if (!target) {
    errors.push(
      "normative section을 AI 출력에 배정할 수 없습니다: " +
        document.id +
        " (" +
        document.section +
        ")",
    );
    continue;
  }
  if (!document.path.endsWith(".md")) {
    errors.push(
      "Markdown이 아닌 normative 문서는 명시적 제외가 필요합니다: " +
        document.id,
    );
    continue;
  }
  entriesByTarget[target].push(document);
}

const guidelineSectionOrder = new Map([
  ["get-started", 0],
  ["develop", 1],
  ["content", 2],
  ["governance", 3],
  ["updates", 4],
]);
const manifestOrder = new Map(
  documents.map((document, index) => [document.id, index]),
);
entriesByTarget.guidelines.sort((left, right) => {
  const sectionDifference =
    guidelineSectionOrder.get(left.section) -
    guidelineSectionOrder.get(right.section);
  return (
    sectionDifference ||
    manifestOrder.get(left.id) - manifestOrder.get(right.id)
  );
});

const generatedById = new Map(
  documents
    .filter((document) => document.generated)
    .map((document) => [document.id, document]),
);
const expectedGeneratedIds = new Set([
  "llms-index",
  ...Object.values(targetMeta).map((meta) => meta.id),
]);
for (const id of generatedById.keys()) {
  if (!expectedGeneratedIds.has(id)) {
    errors.push("build-llms-docs가 소유하지 않는 generated entry: " + id);
  }
}
for (const id of expectedGeneratedIds) {
  if (!generatedById.has(id)) {
    errors.push("generated catalog entry가 없습니다: " + id);
  }
}

for (const [target, meta] of Object.entries(targetMeta)) {
  const generated = generatedById.get(meta.id);
  if (!generated) {
    errors.push("generated catalog entry가 없습니다: " + meta.id);
    continue;
  }
  const expectedSources = [
    "design/manifest.json",
    ...entriesByTarget[target].map((document) => document.path),
  ];
  validateGeneratedContract(generated, expectedSources);
}

const indexEntry = generatedById.get("llms-index");
if (!indexEntry) {
  errors.push("generated catalog entry가 없습니다: llms-index");
} else {
  validateGeneratedContract(indexEntry, ["design/manifest.json"]);
}

if (errors.length > 0) reportAndExit();

const outputs = new Map();
for (const [target, meta] of Object.entries(targetMeta)) {
  const generated = generatedById.get(meta.id);
  const entries = entriesByTarget[target];
  const sections = entries.map((entry) => renderDocument(entry)).join("\n\n");
  const header = [
    "# " + meta.title,
    "",
    "> GENERATED FILE — edit the normative Markdown sources, then run pnpm build:llms.",
    "",
    "- System maturity: " + manifest.system.maturity,
    "- Coverage: exhaustive",
    "- Documents: " + entries.length,
    "- Purpose: " + meta.description,
    "",
    "## Sources",
    "",
    ...generated.sources.map((source) => "- " + source),
    "",
    "---",
    "",
  ].join("\n");
  outputs.set(generated.path, header + sections.trimEnd() + "\n");
}

outputs.set(indexEntry.path, renderIndex());
validateGeneratedLinks(outputs);

const outputLocations = new Map();
if (errors.length === 0) {
  if (prepareOutputDirectory()) {
    for (const path of outputs.keys()) {
      const absolute = validateOutputPath(path);
      if (!absolute) continue;
      try {
        const actual = existsSync(absolute)
          ? readFileSync(absolute, "utf8")
          : null;
        outputLocations.set(path, { absolute, actual });
      } catch (error) {
        errors.push(
          "generated output을 읽을 수 없습니다: " +
            path +
            " (" +
            error.message +
            ")",
        );
      }
    }
  }
}

if (errors.length === 0) {
  for (const [path, expected] of outputs) {
    const location = outputLocations.get(path);
    if (!location) {
      errors.push("generated output 경로가 검증되지 않았습니다: " + path);
      continue;
    }
    const { absolute, actual } = location;
    if (actual === expected) continue;
    if (checkOnly) {
      errors.push("generated AI 문서가 최신이 아닙니다: " + path);
    } else {
      writeFileSync(absolute, expected);
    }
  }
}

reportAndExit();

function validateGeneratedContract(document, expectedSources) {
  if (document.generator !== "build-llms-docs") {
    errors.push(document.id + ".generator는 build-llms-docs여야 합니다.");
  }
  if (document.checker !== "check-llms-docs") {
    errors.push(document.id + ".checker는 check-llms-docs여야 합니다.");
  }
  if (document.sourceCoverage !== "exhaustive") {
    errors.push(document.id + ".sourceCoverage는 exhaustive여야 합니다.");
  }
  if (!Array.isArray(document.sources)) {
    errors.push(document.id + ".sources가 배열이 아닙니다.");
    return;
  }
  const actual = JSON.stringify(document.sources);
  const expected = JSON.stringify(expectedSources);
  if (actual !== expected) {
    const missing = expectedSources.filter(
      (source) => !document.sources.includes(source),
    );
    const extra = document.sources.filter(
      (source) => !expectedSources.includes(source),
    );
    errors.push(
      [
        document.id + ".sources가 exhaustive 편입 순서와 다릅니다.",
        missing.length ? "누락: " + missing.join(", ") : "",
        extra.length ? "초과: " + extra.join(", ") : "",
      ]
        .filter(Boolean)
        .join(" "),
    );
  }
}

function renderDocument(entry) {
  const absolute = validateInputPath(entry.path, "normative source");
  if (!absolute) return "";
  const raw = readFileSync(absolute, "utf8");
  const withoutFrontmatter = raw.replace(
    /^---\r?\n[\s\S]*?\r?\n---(?:\r?\n|$)/,
    "",
  );
  const rebased = transformOutsideFences(withoutFrontmatter, (line) => {
    const shifted = line.replace(/^(#{1,6})(?=\s)/, (heading) =>
      "#".repeat(Math.min(heading.length + 2, 6)),
    );
    return rebaseMarkdownLinks(shifted, entry.path);
  });
  return [
    "## " + entry.title,
    "",
    "- Source: " + entry.path,
    "- Maturity: " + entry.maturity,
    "",
    rebased.trim(),
  ].join("\n");
}

function rebaseMarkdownLinks(markdown, sourcePath) {
  return markdown.replace(/]\(([^)]+)\)/g, (whole, rawTarget) => {
    let target = rawTarget.trim();
    if (/^(?:https?:|mailto:|#)/i.test(target)) return whole;
    const wrapped = target.startsWith("<") && target.endsWith(">");
    if (wrapped) target = target.slice(1, -1);
    const hashIndex = target.indexOf("#");
    const pathPart = hashIndex >= 0 ? target.slice(0, hashIndex) : target;
    const fragment = hashIndex >= 0 ? target.slice(hashIndex) : "";
    if (!pathPart || /\s/.test(pathPart)) return whole;
    const absolute = resolve(repoRoot, dirname(sourcePath), pathPart);
    if (!isInsideRepo(absolute)) {
      errors.push(
        "normative 링크가 저장소 밖을 가리킵니다: " +
          sourcePath +
          " -> " +
          target,
      );
      return whole;
    }
    if (existsSync(absolute) && !realPathIsInsideRepo(absolute)) {
      errors.push(
        "normative 링크가 저장소 밖으로 해석됩니다: " +
          sourcePath +
          " -> " +
          target,
      );
      return whole;
    }
    const rebased = relative(outputDirectory, absolute).split(sep).join("/");
    return "](" + rebased + fragment + ")";
  });
}

function transformOutsideFences(markdown, transform) {
  let fence = null;
  return markdown
    .split(/\r?\n/)
    .map((line) => {
      const marker = /^\s*(`{3,}|~{3,})/.exec(line);
      if (marker) {
        const candidate = {
          character: marker[1][0],
          length: marker[1].length,
        };
        if (!fence) {
          fence = candidate;
        } else if (
          candidate.character === fence.character &&
          candidate.length >= fence.length
        ) {
          fence = null;
        }
        return line;
      }
      return fence ? line : transform(line);
    })
    .join("\n");
}

function renderIndex() {
  const lines = [
    "# Klipse Design AI documentation",
    "",
    "> GENERATED FILE — stable entry point for AI clients.",
    "",
    "- System: " + manifest.system.name,
    "- Maturity: " + manifest.system.maturity,
    "- Catalog: ../manifest.json",
    "- Source of truth: normative Markdown and package contracts",
    "",
    "## Documents",
    "",
    "| Document | Purpose | Maturity |",
    "| --- | --- | --- |",
  ];
  for (const [target, meta] of Object.entries(targetMeta)) {
    const generated = generatedById.get(meta.id);
    lines.push(
      "| [" +
        meta.title +
        "](" +
        generated.path.slice("design/llms/".length) +
        ") | " +
        meta.description +
        " | " +
        generated.maturity +
        " |",
    );
  }
  lines.push(
    "",
    "Machine-readable status: [design/manifest.json](../manifest.json)",
    "",
    "Generated outputs never override the manifest or normative source documents.",
    "",
  );
  return lines.join("\n");
}

function validateGeneratedLinks(outputs) {
  const planned = new Set();
  for (const path of outputs.keys()) {
    const absolute = absoluteRepoPath(path, "generated output");
    if (absolute) planned.add(absolute);
  }
  for (const [path, source] of outputs) {
    const sourceAbsolute = absoluteRepoPath(path, "generated output");
    if (!sourceAbsolute) continue;
    const sourceDirectory = dirname(sourceAbsolute);
    transformOutsideFences(source, (line) => {
      for (const match of line.matchAll(/]\(([^)]+)\)/g)) {
        const target = match[1].trim();
        if (/^(?:https?:|mailto:|#)/i.test(target)) continue;
        const pathPart = target.split("#", 1)[0].split("?", 1)[0];
        if (!pathPart || /\s/.test(pathPart)) continue;
        const absolute = resolve(sourceDirectory, pathPart);
        if (!isInsideRepo(absolute)) {
          errors.push(
            "generated 문서의 링크가 저장소 밖을 가리킵니다: " +
              path +
              " -> " +
              target,
          );
        } else if (existsSync(absolute) && !realPathIsInsideRepo(absolute)) {
          errors.push(
            "generated 문서의 링크가 저장소 밖으로 해석됩니다: " +
              path +
              " -> " +
              target,
          );
        } else if (!existsSync(absolute) && !planned.has(absolute)) {
          errors.push(
            "generated 문서의 링크가 깨졌습니다: " + path + " -> " + target,
          );
        }
      }
      return line;
    });
  }
}

function readJson(path, label) {
  if (!validateRealFile(path, label, repoPath(path))) return null;
  try {
    return JSON.parse(readFileSync(path, "utf8"));
  } catch (error) {
    errors.push(label + " JSON을 읽을 수 없습니다: " + error.message);
    return null;
  }
}

function repoPath(path) {
  return relative(repoRoot, path).split(sep).join("/");
}

function isInsideRepo(absolute) {
  return absolute === repoRoot || absolute.startsWith(repoRoot + sep);
}

function realPathIsInsideRepo(absolute) {
  try {
    const real = realpathSync(absolute);
    return real === realRepoRoot || real.startsWith(realRepoRoot + sep);
  } catch {
    return false;
  }
}

function absoluteRepoPath(path, label) {
  if (typeof path !== "string" || path.trim() === "") {
    errors.push(label + " 경로가 비어 있습니다.");
    return null;
  }
  if (isAbsolute(path) || path.includes("\\")) {
    errors.push(label + " 경로는 저장소 상대 POSIX 경로여야 합니다: " + path);
    return null;
  }
  const absolute = resolve(repoRoot, path);
  if (!isInsideRepo(absolute)) {
    errors.push(label + " 경로가 저장소 밖을 가리킵니다: " + path);
    return null;
  }
  return absolute;
}

function validateRealFile(absolute, label, displayPath) {
  const metadata = lstatOrNull(absolute, label, displayPath);
  if (metadata === undefined) return false;
  if (metadata === null) {
    errors.push(label + " 파일이 없습니다: " + displayPath);
    return false;
  }
  if (metadata.isSymbolicLink()) {
    errors.push(label + " 파일은 symbolic link일 수 없습니다: " + displayPath);
    return false;
  }
  if (metadata.nlink > 1) {
    errors.push(label + " 파일은 hard link일 수 없습니다: " + displayPath);
    return false;
  }
  if (!metadata.isFile()) {
    errors.push(label + " 경로가 파일이 아닙니다: " + displayPath);
    return false;
  }
  if (!realPathIsInsideRepo(absolute)) {
    errors.push(label + " 파일이 저장소 밖으로 해석됩니다: " + displayPath);
    return false;
  }
  return true;
}

function validateRealDirectory(absolute, label, displayPath) {
  const metadata = lstatOrNull(absolute, label, displayPath);
  if (metadata === undefined) return false;
  if (metadata === null) {
    errors.push(label + " 디렉터리가 없습니다: " + displayPath);
    return false;
  }
  if (metadata.isSymbolicLink()) {
    errors.push(
      label + " 디렉터리는 symbolic link일 수 없습니다: " + displayPath,
    );
    return false;
  }
  if (!metadata.isDirectory()) {
    errors.push(label + " 경로가 디렉터리가 아닙니다: " + displayPath);
    return false;
  }
  if (!realPathIsInsideRepo(absolute)) {
    errors.push(label + " 디렉터리가 저장소 밖으로 해석됩니다: " + displayPath);
    return false;
  }
  return true;
}

function validateInputPath(path, label) {
  const absolute = absoluteRepoPath(path, label);
  if (!absolute) return null;
  return validateRealFile(absolute, label, path) ? absolute : null;
}

function validateOutputPath(path) {
  const absolute = absoluteRepoPath(path, "generated output");
  if (!absolute) return null;
  const parent = dirname(absolute);
  if (!validateRealDirectory(parent, "generated output", repoPath(parent))) {
    return null;
  }
  const metadata = lstatOrNull(absolute, "generated output", path);
  if (metadata === undefined) return null;
  if (
    metadata !== null &&
    !validateRealFile(absolute, "generated output", path)
  ) {
    return null;
  }
  return absolute;
}

function prepareOutputDirectory() {
  const parent = dirname(outputDirectory);
  if (!validateRealDirectory(parent, "AI output", repoPath(parent))) {
    return false;
  }
  const metadata = lstatOrNull(
    outputDirectory,
    "AI output",
    repoPath(outputDirectory),
  );
  if (metadata === undefined) return false;
  if (metadata === null) {
    try {
      mkdirSync(outputDirectory);
    } catch (error) {
      errors.push("AI output 디렉터리를 만들 수 없습니다: " + error.message);
      return false;
    }
  }
  return validateRealDirectory(
    outputDirectory,
    "AI output",
    repoPath(outputDirectory),
  );
}

function lstatOrNull(absolute, label, displayPath) {
  try {
    return lstatSync(absolute);
  } catch (error) {
    if (error && error.code === "ENOENT") return null;
    errors.push(
      label +
        " 경로를 검사할 수 없습니다: " +
        displayPath +
        " (" +
        error.message +
        ")",
    );
    return undefined;
  }
}

function reportAndExit() {
  if (errors.length > 0) {
    for (const error of errors) console.error("[llms] " + error);
    process.exit(1);
  }
  const mode = checkOnly ? "checked" : "built";
  const sourceCount = Object.values(entriesByTarget).reduce(
    (total, entries) => total + entries.length,
    0,
  );
  console.log(
    "[llms] " +
      mode +
      ": " +
      outputs.size +
      " outputs, " +
      sourceCount +
      " normative sources",
  );
}
