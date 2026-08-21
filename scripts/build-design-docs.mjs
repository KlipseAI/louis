import { execFileSync } from "node:child_process";
import {
  existsSync,
  lstatSync,
  readFileSync,
  realpathSync,
  readdirSync,
} from "node:fs";
import { dirname, isAbsolute, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { validateJsonSchema } from "./lib/json-schema.mjs";
import { atomicWriteBatch } from "./lib/atomic-output.mjs";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const realRepoRoot = realpathSync(repoRoot);
const manifestPath = resolve(repoRoot, "design/manifest.json");
const schemaPath = resolve(repoRoot, "design/manifest.schema.json");
const args = new Set(process.argv.slice(2));
const supportedArgs = new Set([
  "--check",
  "--write",
  "--require-tracked",
  "--help",
]);
const errors = [];
const warnings = [];
const trackedCandidates = new Set([
  "design/manifest.json",
  "design/manifest.schema.json",
]);

for (const arg of args) {
  if (!supportedArgs.has(arg)) errors.push("알 수 없는 옵션: " + arg);
}

if (args.has("--help")) {
  console.log(
    [
      "Usage: node scripts/build-design-docs.mjs [--check|--write] [--require-tracked]",
      "",
      "기본 동작은 catalog를 검증하고 README 생성 구간을 갱신합니다.",
    ].join("\n"),
  );
  process.exit(0);
}

if (args.has("--check") && args.has("--write")) {
  errors.push("--check와 --write는 함께 사용할 수 없습니다.");
}

const checkOnly = args.has("--check");
const requireTracked =
  args.has("--require-tracked") || process.env.CI === "true";

function repoPath(path) {
  return relative(repoRoot, path).split(sep).join("/");
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
  if (absolute !== repoRoot && !absolute.startsWith(repoRoot + sep)) {
    errors.push(label + " 경로가 저장소 밖을 가리킵니다: " + path);
    return null;
  }
  return absolute;
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

function validateRealFile(absolute, label, displayPath) {
  if (!existsSync(absolute)) {
    errors.push(label + " 파일이 없습니다: " + displayPath);
    return false;
  }
  const metadata = lstatSync(absolute);
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
  const real = realpathSync(absolute);
  if (real !== realRepoRoot && !real.startsWith(realRepoRoot + sep)) {
    errors.push(label + " 파일이 저장소 밖으로 해석됩니다: " + displayPath);
    return false;
  }
  return true;
}

function requireFile(path, label, track = true) {
  const absolute = absoluteRepoPath(path, label);
  if (!absolute) return null;
  if (!validateRealFile(absolute, label, path)) return null;
  if (track) trackedCandidates.add(path);
  return absolute;
}

function uniqueField(items, field, label) {
  const seen = new Map();
  for (const [index, item] of items.entries()) {
    const value = item && item[field];
    if (typeof value !== "string" || value.trim() === "") {
      errors.push(label + "[" + index + "]." + field + "가 비어 있습니다.");
      continue;
    }
    if (seen.has(value)) {
      errors.push(
        label +
          "." +
          field +
          " 중복: " +
          value +
          " (" +
          seen.get(value) +
          ", " +
          index +
          ")",
      );
    } else {
      seen.set(value, index);
    }
  }
}

function readFrontmatter(path, label) {
  const absolute = requireFile(path, label);
  if (!absolute) return null;
  const source = readFileSync(absolute, "utf8");
  const match = /^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/.exec(source);
  if (!match) {
    errors.push(label + "에 YAML frontmatter가 없습니다: " + path);
    return null;
  }
  const values = new Map();
  for (const line of match[1].split(/\r?\n/)) {
    const field = /^([A-Za-z][A-Za-z0-9_-]*):\s*(.*?)\s*$/.exec(line);
    if (!field) continue;
    if (values.has(field[1])) {
      errors.push(
        label + " frontmatter 키 중복: " + field[1] + " (" + path + ")",
      );
    }
    values.set(field[1], field[2].replace(/^['"]|['"]$/g, ""));
  }
  return { source, values };
}

function validateLocalLinks(path, source) {
  const sourceDirectory = dirname(resolve(repoRoot, path));
  const expression = /]\(([^)]+)\)/g;
  for (const match of source.matchAll(expression)) {
    let target = match[1].trim();
    if (/^(?:https?:|mailto:|#)/i.test(target)) continue;
    if (target.startsWith("<") && target.endsWith(">")) {
      target = target.slice(1, -1);
    }
    const pathPart = target.split("#", 1)[0].split("?", 1)[0];
    if (!pathPart || /\s/.test(pathPart)) continue;
    const absolute = resolve(sourceDirectory, pathPart);
    if (absolute !== repoRoot && !absolute.startsWith(repoRoot + sep)) {
      errors.push(
        "Markdown 링크가 저장소 밖을 가리킵니다: " + path + " -> " + target,
      );
    } else if (!existsSync(absolute)) {
      const plannedDocument = documentByPath.get(repoPath(absolute));
      if (!plannedDocument || !plannedDocument.generated) {
        errors.push("깨진 Markdown 링크: " + path + " -> " + target);
      }
    } else {
      const real = realpathSync(absolute);
      if (real !== realRepoRoot && !real.startsWith(realRepoRoot + sep)) {
        errors.push(
          "Markdown 링크가 저장소 밖으로 해석됩니다: " + path + " -> " + target,
        );
      }
    }
  }
}

function listMarkdownFiles(directory = repoRoot) {
  const paths = [];
  const excludedDirectories = new Set([
    ".git",
    ".pnpm-store",
    ".turbo",
    "coverage",
    "dist",
    "node_modules",
  ]);
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    if (entry.isDirectory() && excludedDirectories.has(entry.name)) continue;
    const absolute = resolve(directory, entry.name);
    if (entry.isDirectory()) {
      paths.push(...listMarkdownFiles(absolute));
    } else if (entry.isFile() && entry.name.endsWith(".md")) {
      paths.push(repoPath(absolute));
    }
  }
  return paths;
}

function validateAvailability(path, item, label) {
  const absolute = requireFile(path, label);
  if (!absolute) return;
  const source = readFileSync(absolute, "utf8");
  const heading = /^## Availability\s*$/m.exec(source);
  if (!heading) {
    errors.push(label + "에 Availability 절이 없습니다: " + path);
    return;
  }
  const remainder = source.slice(heading.index + heading[0].length);
  const nextHeading = /^##\s+/m.exec(remainder);
  const section = remainder.slice(
    0,
    nextHeading ? nextHeading.index : undefined,
  );
  const rows = new Map();
  const rowPattern =
    /^\|\s*(Web|Figma|Documentation|Maturity)\s*\|\s*'([^']+)'\s*\|/gm;
  const tickPattern =
    /^\|\s*(Web|Figma|Documentation|Maturity)\s*\|\s*\x60([^\x60]+)\x60\s*\|/gm;
  for (const match of section.matchAll(rowPattern))
    rows.set(match[1], match[2]);
  for (const match of section.matchAll(tickPattern))
    rows.set(match[1], match[2]);
  const expected = new Map([
    ["Web", item.web],
    ["Figma", item.figma],
    ["Documentation", item.docs],
    ["Maturity", item.maturity],
  ]);
  for (const [surface, status] of expected) {
    if (!rows.has(surface)) {
      errors.push(
        label + " Availability에 " + surface + " 행이 없습니다: " + path,
      );
    } else if (rows.get(surface) !== status) {
      errors.push(
        label +
          " Availability " +
          surface +
          " 불일치: " +
          rows.get(surface) +
          " -> " +
          status,
      );
    }
  }
}

function validateDoneDocumentSections(path, label, kind) {
  const absolute = requireFile(path, label);
  if (!absolute) return;
  const source = readFileSync(absolute, "utf8");
  const required = [
    [/^## .*Accessibility\s*$/im, "Accessibility"],
    [/^## (?:Migration )?Acceptance tests\s*$/im, "Acceptance tests"],
  ];
  if (kind === "component") {
    required.push(
      [/^## (?:Properties|목표 API)\s*$/im, "public contract"],
      [/^## States\s*$/im, "States"],
      [/^## Content\s*$/im, "Content"],
    );
  }
  for (const [expression, section] of required) {
    if (!expression.test(source)) {
      errors.push(
        label + " docs=done 문서에 " + section + " 절이 없습니다: " + path,
      );
    }
  }
}

function escapeCell(value) {
  return String(value ?? "—")
    .replace(/\|/g, "\\|")
    .replace(/\r?\n/g, " ");
}

const tick = String.fromCharCode(96);

function itemLink(item, section) {
  if (!item.doc) return escapeCell(item.name);
  const prefix = "design/" + section + "/";
  const href = item.doc.startsWith(prefix)
    ? item.doc.slice(prefix.length)
    : item.doc;
  return "[" + escapeCell(item.name) + "](" + href + ")";
}

function renderProgress(items, section, noun) {
  const lines = [
    "| " + noun + " | Maturity | Figma | Web | Docs | Note |",
    "| --- | --- | --- | --- | --- | --- |",
  ];
  for (const item of items) {
    lines.push(
      "| " +
        itemLink(item, section) +
        " | " +
        tick +
        item.maturity +
        tick +
        " | " +
        tick +
        item.figma +
        tick +
        " | " +
        tick +
        item.web +
        tick +
        " | " +
        tick +
        item.docs +
        tick +
        " | " +
        escapeCell(item.note) +
        " |",
    );
  }
  return lines.join("\n");
}

function replaceGeneratedRegion(path, marker, body) {
  const absolute = requireFile(path, "generated region " + marker);
  if (!absolute) return null;
  const source = readFileSync(absolute, "utf8");
  const start = "<!-- GENERATED:" + marker + " START -->";
  const end = "<!-- GENERATED:" + marker + " END -->";
  const startIndex = source.indexOf(start);
  const endIndex = source.indexOf(end);
  if (
    startIndex < 0 ||
    endIndex < 0 ||
    endIndex < startIndex ||
    source.indexOf(start, startIndex + start.length) >= 0 ||
    source.indexOf(end, endIndex + end.length) >= 0
  ) {
    errors.push(path + "의 " + marker + " marker 쌍이 정확히 하나여야 합니다.");
    return null;
  }
  const before = source.slice(0, startIndex + start.length);
  const after = source.slice(endIndex);
  return before + "\n" + body.trimEnd() + "\n" + after;
}

const manifest = readJson(manifestPath, "design manifest");
const schema = readJson(schemaPath, "design manifest schema");

if (manifest && schema) {
  try {
    for (const issue of validateJsonSchema(schema, manifest)) {
      errors.push("manifest schema " + issue.path + ": " + issue.message);
    }
  } catch (error) {
    errors.push("manifest schema를 적용할 수 없습니다: " + error.message);
  }
}

if (!manifest || !schema || errors.length > 0) reportAndExit();

const documents = Array.isArray(manifest.documents) ? manifest.documents : [];
const tokenPackage = manifest.tokenPackage;
const components = Array.isArray(manifest.components)
  ? manifest.components
  : [];
const patterns = Array.isArray(manifest.patterns) ? manifest.patterns : [];
const referenceSurfaces = Array.isArray(manifest.referenceSurfaces)
  ? manifest.referenceSurfaces
  : [];

uniqueField(documents, "id", "documents");
uniqueField(documents, "path", "documents");
uniqueField(components, "id", "components");
uniqueField(patterns, "id", "patterns");
uniqueField(referenceSurfaces, "path", "referenceSurfaces");

const expectedTokenArtifacts = new Map([
  ["css", "packages/tokens/generated/tokens.css"],
  ["javascript", "packages/tokens/generated/index.js"],
  ["types", "packages/tokens/generated/index.d.ts"],
  ["json", "packages/tokens/generated/tokens.json"],
  ["figma-proposal", "packages/tokens/generated/figma.tokens.json"],
  ["manifest", "packages/tokens/generated/manifest.json"],
]);

if (tokenPackage) {
  if (tokenPackage.name !== "@klipse-design/tokens") {
    errors.push("tokenPackage.name이 @klipse-design/tokens가 아닙니다.");
  }
  if (tokenPackage.maturity !== "experimental") {
    errors.push("P2 tokenPackage.maturity는 experimental이어야 합니다.");
  }
  if (tokenPackage.source !== "packages/tokens/src/klipse.tokens.json") {
    errors.push(
      "tokenPackage.source는 packages/tokens/src/klipse.tokens.json이어야 합니다.",
    );
  }
  if (tokenPackage.sourceFormat !== "DTCG 2025.10") {
    errors.push("tokenPackage.sourceFormat은 DTCG 2025.10이어야 합니다.");
  }
  for (const [statusField, evidenceField] of [
    ["figmaLibrary", "figmaLibraryEvidence"],
    ["packageRelease", "packageReleaseEvidence"],
  ]) {
    const status = tokenPackage[statusField];
    const evidence = tokenPackage[evidenceField];
    if (status !== "not-ready" && typeof evidence !== "string") {
      errors.push(
        `tokenPackage.${statusField}가 not-ready가 아니면 ` +
          `${evidenceField}에 근거를 적어야 합니다.`,
      );
    }
    if (status === "not-ready" && evidence !== undefined) {
      errors.push(
        `tokenPackage.${statusField}가 not-ready인데 ` +
          `${evidenceField}가 있습니다.`,
      );
    }
  }
  requireFile(tokenPackage.source, "tokenPackage source");
  requireFile("scripts/lib/token-model.mjs", "tokenPackage validator");
  requireFile("scripts/lib/atomic-output.mjs", "tokenPackage atomic writer");
  requireFile("scripts/build-tokens.mjs", "tokenPackage generator");
  requireFile("scripts/diff-tokens.mjs", "tokenPackage diff checker");
  requireFile("scripts/verify-token-gates.mjs", "tokenPackage failure gates");
  requireFile(
    "packages/tokens/test/consumer.mjs",
    "tokenPackage consumer fixture",
  );
  requireFile(
    "packages/tokens/baseline/manifest.json",
    "tokenPackage baseline",
  );

  const artifacts = Array.isArray(tokenPackage.artifacts)
    ? tokenPackage.artifacts
    : [];
  uniqueField(artifacts, "id", "tokenPackage.artifacts");
  uniqueField(artifacts, "path", "tokenPackage.artifacts");
  const artifactById = new Map(
    artifacts.map((artifact) => [artifact.id, artifact]),
  );
  for (const [id, path] of expectedTokenArtifacts) {
    const artifact = artifactById.get(id);
    if (!artifact) {
      errors.push("tokenPackage artifact가 없습니다: " + id);
      continue;
    }
    if (artifact.path !== path) {
      errors.push(
        "tokenPackage artifact 경로 불일치: " +
          id +
          " (" +
          artifact.path +
          " -> " +
          path +
          ")",
      );
    }
    if (artifact.status !== "done") {
      errors.push(
        "tokenPackage artifact status는 done이어야 합니다: " +
          id +
          " (" +
          artifact.status +
          ")",
      );
    }
    requireFile(artifact.path, "tokenPackage artifact " + id);
  }
  for (const artifact of artifacts) {
    if (!expectedTokenArtifacts.has(artifact.id)) {
      errors.push("지원되지 않는 tokenPackage artifact id: " + artifact.id);
    }
  }
  if (tokenPackage.figmaLibrary !== "not-ready") {
    errors.push("P2 tokenPackage.figmaLibrary는 not-ready여야 합니다.");
  }
  if (tokenPackage.packageRelease !== "not-ready") {
    errors.push("P2 tokenPackage.packageRelease는 not-ready여야 합니다.");
  }
  if (tokenPackage.docs !== "done") {
    errors.push("tokenPackage.docs는 done이어야 합니다.");
  }
}

const documentByPath = new Map(
  documents.map((document) => [document.path, document]),
);
for (const path of listMarkdownFiles(resolve(repoRoot, "design"))) {
  if (!documentByPath.has(path)) {
    errors.push("design Markdown이 manifest에 등록되지 않았습니다: " + path);
  }
}
const itemByDoc = new Map();
for (const [kind, items] of [
  ["component", components],
  ["pattern", patterns],
]) {
  for (const item of items) {
    if (!item.doc) continue;
    if (itemByDoc.has(item.doc)) {
      errors.push("catalog doc가 여러 항목에 연결됩니다: " + item.doc);
    }
    itemByDoc.set(item.doc, { kind, item });
    const document = documentByPath.get(item.doc);
    const expectedSection = kind === "component" ? "components" : "patterns";
    if (!document || document.authority !== "normative") {
      errors.push(kind + " doc가 normative document가 아닙니다: " + item.doc);
    } else if (document.section !== expectedSection) {
      errors.push(kind + " doc section 불일치: " + item.doc);
    } else if (document.maturity !== item.maturity) {
      errors.push(
        kind +
          " maturity가 document와 다릅니다: " +
          item.id +
          " (" +
          item.maturity +
          " -> " +
          document.maturity +
          ")",
      );
    }
  }
}

const frontmatterIds = new Map();
const forbiddenNormativeReferences = [
  /apps\/web/,
  /DESIGN_SYSTEM\.md/,
  /design\/pages/,
  /pnpm\s+--filter\s+web/,
  /design\/tokens\.yaml/,
  /design\/figma/,
  /packages\/ui/,
];

for (const document of documents) {
  if (document.generated) {
    if (document.generator !== "build-llms-docs") {
      errors.push(
        "지원되지 않는 generated document generator: " + document.generator,
      );
    }
    if (document.sourceCoverage !== "exhaustive") {
      errors.push(
        "generated sourceCoverage는 exhaustive여야 합니다: " + document.id,
      );
    }
    for (const [index, source] of (document.sources ?? []).entries()) {
      requireFile(source, document.id + ".sources[" + index + "]");
    }
    if (checkOnly) {
      requireFile(document.path, "generated document " + document.id);
    }
    continue;
  }

  const absolute = requireFile(document.path, "document " + document.id);
  if (!absolute) continue;
  if (document.authority !== "normative" || !document.path.endsWith(".md"))
    continue;

  const frontmatter = readFrontmatter(
    document.path,
    "normative " + document.id,
  );
  if (!frontmatter) continue;
  const linkedItem = itemByDoc.get(document.path);
  const expectedId = linkedItem ? linkedItem.item.id : document.id;
  const expected = new Map([
    ["id", expectedId],
    ["status", document.maturity],
    ["authority", "normative"],
  ]);
  for (const [field, value] of expected) {
    if (frontmatter.values.get(field) !== value) {
      errors.push(
        document.path +
          " frontmatter " +
          field +
          " 불일치: " +
          String(frontmatter.values.get(field)) +
          " -> " +
          value,
      );
    }
  }
  const actualId = frontmatter.values.get("id");
  if (actualId) {
    if (frontmatterIds.has(actualId)) {
      errors.push(
        "normative frontmatter id 중복: " +
          actualId +
          " (" +
          frontmatterIds.get(actualId) +
          ", " +
          document.path +
          ")",
      );
    }
    frontmatterIds.set(actualId, document.path);
  }
  for (const expression of forbiddenNormativeReferences) {
    if (expression.test(frontmatter.source)) {
      errors.push(
        "normative 문서가 제품 저장소 전용 경로를 직접 참조합니다: " +
          document.path +
          " (" +
          expression.source +
          ")",
      );
    }
  }
}

for (const path of listMarkdownFiles()) {
  validateLocalLinks(path, readFileSync(resolve(repoRoot, path), "utf8"));
}

for (const [index, surface] of referenceSurfaces.entries()) {
  requireFile(surface.path, "referenceSurfaces[" + index + "]");
}

for (const [index, component] of components.entries()) {
  if (component.docs === "done") {
    if (!component.doc) {
      errors.push("components[" + index + "] docs=done이면 doc가 필요합니다.");
    } else {
      validateAvailability(
        component.doc,
        component,
        "component " + component.id,
      );
      validateDoneDocumentSections(
        component.doc,
        "component " + component.id,
        "component",
      );
    }
  }
}

for (const [index, pattern] of patterns.entries()) {
  if (pattern.docs === "done") {
    if (!pattern.doc) {
      errors.push("patterns[" + index + "] docs=done이면 doc가 필요합니다.");
    } else {
      validateDoneDocumentSections(
        pattern.doc,
        "pattern " + pattern.id,
        "pattern",
      );
    }
  }
}

const normativeCount = documents.filter(
  (document) => document.authority === "normative",
).length;
const generatedCount = documents.filter(
  (document) => document.generated,
).length;
const webDoneCount =
  components.filter((item) => item.web === "done").length +
  patterns.filter((item) => item.web === "done").length;
const catalogBody = [
  "| 항목 | 현재 값 |",
  "| --- | --- |",
  "| System maturity | " + tick + manifest.system.maturity + tick + " |",
  "| Normative documents | " + normativeCount + " |",
  "| Generated documents | " + generatedCount + " |",
  "| Components | " + components.length + " |",
  "| Patterns | " + patterns.length + " |",
  "| Web done | " + webDoneCount + " |",
  "| Token artifacts done | " +
    tokenPackage.artifacts.filter((artifact) => artifact.status === "done")
      .length +
    "/" +
    expectedTokenArtifacts.size +
    " |",
  "| Figma library | " + tick + tokenPackage.figmaLibrary + tick + " |",
  "| Package release | " + tick + tokenPackage.packageRelease + tick + " |",
].join("\n");

// 제품 자유값 축의 분포표. 손으로 세다 두 번 틀려서(2026-08-21 border-width·radius)
// 계기가 직접 표를 만들게 했다. 원천은 measure-product-drift.mjs가 배포본에서 잰 값이다.
function renderProductDrift() {
  const absolute = requireFile(
    "migration/product.drift.json",
    "product drift measurement",
  );
  if (!absolute) return "";
  const drift = readJson(absolute, "product drift measurement");
  const axes = drift && drift.axes;
  if (!Array.isArray(axes) || axes.length === 0) {
    errors.push("product.drift.json에 axes가 없습니다.");
    return "";
  }
  const lines = [];
  lines.push(
    "배포본 `" + String(drift.productCommit).slice(0, 8) + "` 기준. **이 표는 생성물이다** — " +
      "`scripts/measure-product-drift.mjs`가 매 `verify`마다 다시 잰다.",
    "",
    "| 축 | 제품 | DS가 덮는 비율 | 최다값 | 결손 최다 |",
    "| --- | ---: | ---: | --- | --- |",
  );
  for (const axis of axes) {
    const miss = (axis.missingTop || [])[0];
    lines.push(
      "| " + escapeCell(axis.id) +
        " | " + axis.productStops + "단 " + axis.uses + "회" +
        " | " + axis.coveragePct + "%" +
        " | `" + axis.topValue + axis.unit + "` " + axis.topUses + "회" +
        (axis.topHasToken === false ? " **토큰 없음**" : "") +
        " | " + (miss ? "`" + miss.value + axis.unit + "` " + miss.uses + "회 / " + miss.files + "파일" : "없음") +
        " |",
    );
  }
  for (const axis of axes) {
    const missing = axis.missingTop || [];
    if (missing.length === 0) continue;
    lines.push(
      "",
      "**" + escapeCell(axis.label) + " (`" + escapeCell(axis.id) + "`) — 토큰 없는 값 상위**",
      "",
      "| 값 | 사용 | 파일 |",
      "| --- | ---: | ---: |",
    );
    for (const row of missing) {
      lines.push(
        "| `" + row.value + axis.unit + "` | " + row.uses + " | " + row.files + " |",
      );
    }
  }
  return lines.join("\n");
}

function renderAppShellGeometry() {
  const absolute = requireFile(
    "packages/tokens/generated/tokens.json",
    "app shell geometry token json",
  );
  if (!absolute) return "";
  const tokens = readJson(absolute, "app shell geometry token json");
  const globalMode = tokens && tokens.modes && tokens.modes.global;
  if (!globalMode) {
    errors.push("token json에 modes.global이 없습니다.");
    return "";
  }
  const ids = Object.keys(globalMode)
    .filter(
      (id) =>
        id.startsWith("layout-app-shell-") || id === "motion-shell-collapse",
    )
    .sort();
  if (ids.length === 0) {
    errors.push("app shell geometry token을 찾을 수 없습니다.");
    return "";
  }
  const rows = [];
  for (const id of ids) {
    const cssProperties = (globalMode[id] || {}).cssProperties;
    const names = cssProperties ? Object.keys(cssProperties).sort() : [];
    if (names.length === 0) {
      errors.push(id + "에 cssProperties가 없어 치수를 적을 수 없습니다.");
      continue;
    }
    for (const name of names) {
      rows.push(
        "| `" + id + "` | `" + name + "` | `" + cssProperties[name] + "` |",
      );
    }
  }
  return ["| Token | CSS variable | 해결값 |", "| --- | --- | --- |", ...rows].join(
    "\n",
  );
}

const generatedUpdates = new Map([
  [
    "design/README.md",
    replaceGeneratedRegion("design/README.md", "catalog", catalogBody),
  ],
  [
    "design/components/README.md",
    replaceGeneratedRegion(
      "design/components/README.md",
      "component-progress",
      renderProgress(components, "components", "Component"),
    ),
  ],
  [
    "design/patterns/README.md",
    replaceGeneratedRegion(
      "design/patterns/README.md",
      "pattern-progress",
      renderProgress(patterns, "patterns", "Pattern"),
    ),
  ],
  [
    "design/governance/product-confirmations.md",
    replaceGeneratedRegion(
      "design/governance/product-confirmations.md",
      "product-drift",
      renderProductDrift(),
    ),
  ],
  [
    "design/patterns/app-shell.md",
    replaceGeneratedRegion(
      "design/patterns/app-shell.md",
      "app-shell-geometry",
      renderAppShellGeometry(),
    ),
  ],
]);

if (requireTracked) validateTrackedInputs();

if (errors.length === 0) {
  const writePlan = [];
  for (const [path, expected] of generatedUpdates) {
    if (expected === null) continue;
    const absolute = resolve(repoRoot, path);
    const actual = readFileSync(absolute, "utf8");
    if (actual === expected) continue;
    if (checkOnly) {
      errors.push("generated region이 최신이 아닙니다: " + path);
    } else {
      writePlan.push({ absolute, expected });
    }
  }
  if (errors.length === 0) atomicWriteBatch(writePlan);
}

reportAndExit();

function validateTrackedInputs() {
  let topLevel;
  try {
    topLevel = execFileSync("git", ["rev-parse", "--show-toplevel"], {
      cwd: repoRoot,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
    }).trim();
  } catch {
    errors.push("--require-tracked에는 Git 저장소가 필요합니다.");
    return;
  }
  if (resolve(topLevel) !== repoRoot) {
    errors.push(
      "--require-tracked는 독립 저장소 root에서 실행해야 합니다: " + topLevel,
    );
    return;
  }
  for (const path of [...trackedCandidates].sort()) {
    try {
      execFileSync("git", ["ls-files", "--error-unmatch", "--", path], {
        cwd: repoRoot,
        stdio: "ignore",
      });
    } catch {
      errors.push("catalog input이 Git에 추적되지 않습니다: " + path);
    }
  }
}

function reportAndExit() {
  for (const warning of warnings)
    console.warn("[design-docs] warning: " + warning);
  if (errors.length > 0) {
    for (const error of errors) console.error("[design-docs] " + error);
    process.exit(1);
  }
  const mode = checkOnly ? "checked" : "built";
  console.log(
    "[design-docs] " +
      mode +
      ": " +
      documents.length +
      " documents, " +
      components.length +
      " components, " +
      patterns.length +
      " patterns",
  );
}
