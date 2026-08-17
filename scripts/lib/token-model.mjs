import { createHash } from "node:crypto";

export const KLIPSE_EXTENSION = "com.klipse-design";
export const TOKEN_FORMAT_VERSION = 1;
export const DTCG_SPECIFICATION = "DTCG 2025.10";
export const TOKEN_SOURCE_PATH = "packages/tokens/src/klipse.tokens.json";
export const TOKEN_BASELINE_PATH = "packages/tokens/baseline/manifest.json";
export const TOKEN_OUTPUT_DIRECTORY = "packages/tokens/generated";
export const TOKEN_OUTPUT_PATHS = Object.freeze([
  `${TOKEN_OUTPUT_DIRECTORY}/tokens.css`,
  `${TOKEN_OUTPUT_DIRECTORY}/index.js`,
  `${TOKEN_OUTPUT_DIRECTORY}/index.d.ts`,
  `${TOKEN_OUTPUT_DIRECTORY}/tokens.json`,
  `${TOKEN_OUTPUT_DIRECTORY}/figma.tokens.json`,
  `${TOKEN_OUTPUT_DIRECTORY}/manifest.json`,
]);

export const SUPPORTED_TOKEN_TYPES = Object.freeze([
  "color",
  "dimension",
  "fontFamily",
  "fontWeight",
  "duration",
  "cubicBezier",
  "number",
  "shadow",
  "typography",
  "transition",
]);

const supportedTypeSet = new Set(SUPPORTED_TOKEN_TYPES);
const motionTypeSet = new Set(["duration", "cubicBezier", "transition"]);
/**
 * lifecycle마다 허용되는 CSS property (DS-D-0016).
 *
 * loop에 `transform`이 아니라 `rotate`가 있는 이유 — 개별 속성 `rotate`는 `scale`·`translate`와
 * 합성되므로 회전 하나 때문에 transform 축을 통째로 잡지 않는다. 반대로 enter/exit은 위치와
 * 크기를 함께 움직이므로 `transform`이 맞다.
 */
const MOTION_LIFECYCLES = new Set(["enter", "exit", "loop"]);
const allowedMotionPropertiesByLifecycle = {
  enter: new Set(["opacity", "transform"]),
  exit: new Set(["opacity", "transform"]),
  loop: new Set(["opacity", "rotate"]),
};
const motionLifecycleOf = (entry) =>
  typeof entry?.lifecycle === "string" ? entry.lifecycle : "enter";
const groupReservedProperties = new Set([
  "$description",
  "$extensions",
  "$root",
  "$type",
]);
const rootReservedProperties = new Set([
  "$description",
  "$extensions",
  "$root",
  "$type",
]);
const tokenReservedProperties = new Set([
  "$deprecated",
  "$description",
  "$extensions",
  "$type",
  "$value",
]);
const genericFontFamilies = new Set([
  "cursive",
  "fantasy",
  "monospace",
  "sans-serif",
  "serif",
  "system-ui",
  "ui-monospace",
  "ui-rounded",
  "ui-sans-serif",
  "ui-serif",
]);
const fontWeightNames = new Map([
  ["thin", 100],
  ["hairline", 100],
  ["extra-light", 200],
  ["ultra-light", 200],
  ["light", 300],
  ["normal", 400],
  ["regular", 400],
  ["book", 400],
  ["medium", 500],
  ["semi-bold", 600],
  ["demi-bold", 600],
  ["bold", 700],
  ["extra-bold", 800],
  ["ultra-bold", 800],
  ["black", 900],
  ["heavy", 900],
  ["extra-black", 950],
  ["ultra-black", 950],
]);

export class TokenValidationError extends Error {
  constructor(issues, message = "Token source validation failed.") {
    super(message);
    this.name = "TokenValidationError";
    this.issues = [...issues];
  }
}

export function compileTokenSource(rawSource, options = {}) {
  const sourcePath = options.sourcePath ?? TOKEN_SOURCE_PATH;
  const issues = [];
  let document;
  try {
    document = JSON.parse(rawSource);
  } catch (error) {
    throw new TokenValidationError([
      `${sourcePath}: JSON을 읽을 수 없습니다: ${error.message}`,
    ]);
  }
  if (!isPlainObject(document)) {
    throw new TokenValidationError([
      `${sourcePath}: root는 object여야 합니다.`,
    ]);
  }

  const rootConfig = validateRoot(document, issues);
  const records = [];
  const tokenByPath = new Map();
  walkGroup(document, [], undefined, true, records, tokenByPath, issues);

  const tokenByIdMode = new Map();
  const tokensById = new Map();
  for (const token of records) {
    const key = tokenKey(token.id, token.mode);
    if (tokenByIdMode.has(key)) {
      issues.push(
        `${token.location}: id+mode가 중복됩니다: ${token.id}@${token.mode} ` +
          `(${tokenByIdMode.get(key).location})`,
      );
    } else {
      tokenByIdMode.set(key, token);
    }
    const variants = tokensById.get(token.id) ?? [];
    variants.push(token);
    tokensById.set(token.id, variants);
  }

  validateVariantContracts(tokensById, issues);
  resolveAllTokens(records, tokenByPath, issues);
  validateFoundationDomains(records, issues);
  validateCssNames(records, issues);
  validateContrastPairs(rootConfig, tokenByIdMode, issues);
  validateLayerOrder(rootConfig, tokenByIdMode, issues);
  validateReducedMotion(rootConfig, tokenByIdMode, issues);
  validateMotionProperties(rootConfig, tokenByIdMode, issues);
  validateResponsiveProfiles(rootConfig, tokenByIdMode, issues);

  if (records.length === 0)
    issues.push("token source에 token이 하나도 없습니다.");
  if (issues.length > 0) throw new TokenValidationError(issues);

  const allTokens = records.sort(compareTokenRecords).map((token) => ({
    id: token.id,
    mode: token.mode,
    tier: token.tier,
    type: token.type,
    sourcePath: token.path,
    description: token.description,
    deprecated: token.deprecated,
    rawValue: deepClone(token.rawValue),
    aliasTarget: token.target
      ? {
          id: token.target.id,
          mode: token.target.mode,
        }
      : null,
    resolvedValue: deepClone(token.resolvedValue),
    cssProperties:
      token.tier === "semantic"
        ? cssPropertiesForToken(token.id, token.type, token.resolvedValue)
        : {},
  }));
  const semanticTokens = allTokens.filter((token) => token.tier === "semantic");
  const primitiveTokens = allTokens.filter(
    (token) => token.tier === "primitive",
  );

  return {
    description: document.$description ?? null,
    figmaCollection: rootConfig.figmaCollection,
    formatVersion: rootConfig.formatVersion,
    themes: [...rootConfig.themes],
    contrastPairs: deepClone(rootConfig.contrastPairs),
    layerOrder: [...rootConfig.layerOrder],
    reducedMotionPairs: deepClone(rootConfig.reducedMotionPairs),
    motionProperties: deepClone(rootConfig.motionProperties),
    responsiveProfiles: deepClone(rootConfig.responsiveProfiles),
    sourcePath,
    sourceSha256: sha256(rawSource),
    allTokens,
    primitiveTokens,
    semanticTokens,
  };
}

export function renderTokenOutputs(model) {
  const publicModel = createPublicModel(model);
  const outputs = new Map();
  outputs.set(`${TOKEN_OUTPUT_DIRECTORY}/tokens.css`, renderCss(model));
  outputs.set(
    `${TOKEN_OUTPUT_DIRECTORY}/index.js`,
    renderJavaScript(publicModel),
  );
  outputs.set(`${TOKEN_OUTPUT_DIRECTORY}/index.d.ts`, renderTypes(model));
  outputs.set(
    `${TOKEN_OUTPUT_DIRECTORY}/tokens.json`,
    canonicalJson(publicModel),
  );
  outputs.set(
    `${TOKEN_OUTPUT_DIRECTORY}/figma.tokens.json`,
    canonicalJson(createFigmaProposal(model)),
  );

  const artifacts = [...outputs.entries()]
    .map(([path, source]) => ({ path, sha256: sha256(source) }))
    .sort((left, right) => compareStrings(left.path, right.path));
  const manifest = {
    contrastPairs: deepClone(model.contrastPairs),
    description: model.description,
    figmaCollection: model.figmaCollection,
    formatVersion: model.formatVersion,
    generator: "build-tokens",
    layerOrder: [...model.layerOrder],
    motionProperties: deepClone(model.motionProperties),
    reducedMotionPairs: deepClone(model.reducedMotionPairs),
    responsiveProfiles: deepClone(model.responsiveProfiles),
    source: {
      path: model.sourcePath,
      sha256: model.sourceSha256,
    },
    themes: [...model.themes],
    tokenCount: model.allTokens.length,
    tokens: model.allTokens.map((token) => ({
      id: token.id,
      mode: token.mode,
      tier: token.tier,
      type: token.type,
      sourcePath: token.sourcePath,
      description: token.description,
      deprecated: token.deprecated,
      rawValue: deepClone(token.rawValue),
      aliasTarget: deepClone(token.aliasTarget),
      resolvedValue: deepClone(token.resolvedValue),
      cssProperties: deepClone(token.cssProperties),
    })),
    artifacts,
  };
  outputs.set(
    `${TOKEN_OUTPUT_DIRECTORY}/manifest.json`,
    canonicalJson(manifest),
  );
  return outputs;
}

export function parseTokenManifest(rawSource, label = "token manifest") {
  let manifest;
  try {
    manifest = JSON.parse(rawSource);
  } catch (error) {
    throw new TokenValidationError([`${label}: JSON 오류: ${error.message}`]);
  }
  const issues = [];
  if (!isPlainObject(manifest)) {
    issues.push(`${label}: root는 object여야 합니다.`);
  } else {
    requireExactProperties(
      manifest,
      [
        "artifacts",
        "contrastPairs",
        "description",
        "figmaCollection",
        "formatVersion",
        "generator",
        "layerOrder",
        "motionProperties",
        "reducedMotionPairs",
        "responsiveProfiles",
        "source",
        "themes",
        "tokenCount",
        "tokens",
      ],
      label,
      issues,
    );
    if (manifest.formatVersion !== TOKEN_FORMAT_VERSION) {
      issues.push(
        `${label}.formatVersion은 ${TOKEN_FORMAT_VERSION}이어야 합니다.`,
      );
    }
    if (manifest.generator !== "build-tokens") {
      issues.push(`${label}.generator는 build-tokens여야 합니다.`);
    }
    if (
      manifest.description !== null &&
      (typeof manifest.description !== "string" ||
        manifest.description.length === 0)
    ) {
      issues.push(
        `${label}.description은 null 또는 non-empty string이어야 합니다.`,
      );
    }
    if (
      typeof manifest.figmaCollection !== "string" ||
      manifest.figmaCollection.trim() !== manifest.figmaCollection ||
      manifest.figmaCollection.length === 0
    ) {
      issues.push(`${label}.figmaCollection은 non-empty string이어야 합니다.`);
    }
    if (!jsonEqual(manifest.themes, ["light", "dark"])) {
      issues.push(`${label}.themes는 ["light", "dark"]여야 합니다.`);
    }
    if (!isPlainObject(manifest.source)) {
      issues.push(`${label}.source는 object여야 합니다.`);
    } else {
      requireExactProperties(
        manifest.source,
        ["path", "sha256"],
        `${label}.source`,
        issues,
      );
      if (manifest.source.path !== TOKEN_SOURCE_PATH) {
        issues.push(
          `${label}.source.path는 ${TOKEN_SOURCE_PATH}이어야 합니다.`,
        );
      }
      if (!isSha256(manifest.source.sha256))
        issues.push(`${label}.source.sha256이 잘못되었습니다.`);
    }
    const artifactPaths = TOKEN_OUTPUT_PATHS.filter(
      (path) => path !== `${TOKEN_OUTPUT_DIRECTORY}/manifest.json`,
    );
    if (!Array.isArray(manifest.artifacts)) {
      issues.push(`${label}.artifacts는 array여야 합니다.`);
    } else {
      const seenArtifacts = new Set();
      for (const [index, artifact] of manifest.artifacts.entries()) {
        const artifactLabel = `${label}.artifacts[${index}]`;
        if (!isPlainObject(artifact)) {
          issues.push(`${artifactLabel}은 object여야 합니다.`);
          continue;
        }
        requireExactProperties(
          artifact,
          ["path", "sha256"],
          artifactLabel,
          issues,
        );
        if (!artifactPaths.includes(artifact.path))
          issues.push(`${artifactLabel}.path가 잘못되었습니다.`);
        if (seenArtifacts.has(artifact.path))
          issues.push(`${artifactLabel}.path가 중복됩니다.`);
        seenArtifacts.add(artifact.path);
        if (!isSha256(artifact.sha256))
          issues.push(`${artifactLabel}.sha256이 잘못되었습니다.`);
      }
      for (const path of artifactPaths) {
        if (!seenArtifacts.has(path))
          issues.push(`${label}.artifacts에 ${path}가 없습니다.`);
      }
    }
    if (!Array.isArray(manifest.tokens)) {
      issues.push(`${label}.tokens는 array여야 합니다.`);
    } else {
      const seen = new Set();
      const tokensById = new Map();
      const tokenByIdMode = new Map();
      const tokenBySourcePath = new Map();
      for (const [index, token] of manifest.tokens.entries()) {
        const tokenLabel = `${label}.tokens[${index}]`;
        if (!isPlainObject(token)) {
          issues.push(`${tokenLabel}은 object여야 합니다.`);
          continue;
        }
        requireExactProperties(
          token,
          [
            "aliasTarget",
            "cssProperties",
            "deprecated",
            "description",
            "id",
            "mode",
            "rawValue",
            "resolvedValue",
            "sourcePath",
            "tier",
            "type",
          ],
          tokenLabel,
          issues,
        );
        const key = tokenKey(token.id, token.mode);
        if (seen.has(key)) issues.push(`${tokenLabel}: 중복 key ${key}`);
        seen.add(key);
        if (!isValidTokenId(token.id))
          issues.push(`${tokenLabel}.id가 잘못되었습니다.`);
        if (!supportedTypeSet.has(token.type))
          issues.push(`${tokenLabel}.type이 지원되지 않습니다.`);
        if (!["primitive", "semantic"].includes(token.tier))
          issues.push(`${tokenLabel}.tier가 잘못되었습니다.`);
        if (
          (token.tier === "primitive" && token.mode !== "base") ||
          (token.tier === "semantic" &&
            !["global", "light", "dark"].includes(token.mode))
        ) {
          issues.push(`${tokenLabel}.mode가 tier와 일치하지 않습니다.`);
        }
        if (
          token.description !== null &&
          (typeof token.description !== "string" ||
            token.description.length === 0)
        ) {
          issues.push(
            `${tokenLabel}.description은 null 또는 non-empty string이어야 합니다.`,
          );
        }
        if (
          token.deprecated !== null &&
          typeof token.deprecated !== "boolean" &&
          typeof token.deprecated !== "string"
        ) {
          issues.push(
            `${tokenLabel}.deprecated는 null, boolean 또는 string이어야 합니다.`,
          );
        }
        if (
          typeof token.sourcePath !== "string" ||
          token.sourcePath.length === 0
        ) {
          issues.push(`${tokenLabel}.sourcePath가 잘못되었습니다.`);
        } else if (tokenBySourcePath.has(token.sourcePath)) {
          issues.push(`${tokenLabel}.sourcePath가 중복됩니다.`);
        } else {
          tokenBySourcePath.set(token.sourcePath, token);
        }
        if (token.tier === "primitive" && token.aliasTarget !== null) {
          issues.push(
            `${tokenLabel}.primitive aliasTarget은 null이어야 합니다.`,
          );
        } else if (
          token.tier === "semantic" &&
          !isPlainObject(token.aliasTarget)
        ) {
          issues.push(
            `${tokenLabel}.semantic aliasTarget은 object여야 합니다.`,
          );
        } else if (isPlainObject(token.aliasTarget)) {
          requireExactProperties(
            token.aliasTarget,
            ["id", "mode"],
            `${tokenLabel}.aliasTarget`,
            issues,
          );
          if (!isValidTokenId(token.aliasTarget.id))
            issues.push(`${tokenLabel}.aliasTarget.id가 잘못되었습니다.`);
          if (
            !["base", "global", "light", "dark"].includes(
              token.aliasTarget.mode,
            )
          ) {
            issues.push(`${tokenLabel}.aliasTarget.mode가 잘못되었습니다.`);
          }
        }
        const normalizedValue = normalizeLiteral(
          token.type,
          token.resolvedValue,
          `${tokenLabel}.resolvedValue`,
          issues,
        );
        if (!isPlainObject(token.cssProperties)) {
          issues.push(`${tokenLabel}.cssProperties는 object여야 합니다.`);
        } else if (token.tier === "primitive") {
          if (Object.keys(token.cssProperties).length !== 0) {
            issues.push(
              `${tokenLabel}.primitive cssProperties는 비어 있어야 합니다.`,
            );
          }
        } else if (
          normalizedValue !== undefined &&
          supportedTypeSet.has(token.type)
        ) {
          try {
            const expectedCss = cssPropertiesForToken(
              token.id,
              token.type,
              normalizedValue,
            );
            if (!jsonEqual(token.cssProperties, expectedCss)) {
              issues.push(
                `${tokenLabel}.cssProperties가 resolvedValue와 일치하지 않습니다.`,
              );
            }
          } catch (error) {
            issues.push(
              `${tokenLabel}.cssProperties 변환 실패: ${error.message}`,
            );
          }
        }
        if (token.tier === "primitive") {
          const normalizedRawValue = normalizeLiteral(
            token.type,
            token.rawValue,
            `${tokenLabel}.rawValue`,
            issues,
          );
          if (
            normalizedRawValue !== undefined &&
            normalizedValue !== undefined &&
            !jsonEqual(normalizedRawValue, normalizedValue)
          ) {
            issues.push(
              `${tokenLabel}.primitive rawValue와 resolvedValue가 일치하지 않습니다.`,
            );
          }
        } else if (!wholeAliasPath(token.rawValue)) {
          issues.push(
            `${tokenLabel}.semantic rawValue는 whole-token alias여야 합니다.`,
          );
        }
        tokenByIdMode.set(key, { ...token, resolvedValue: normalizedValue });
        const variants = tokensById.get(token.id) ?? [];
        variants.push(token);
        tokensById.set(token.id, variants);
      }
      for (const token of manifest.tokens) {
        if (!isPlainObject(token) || token.tier !== "semantic") continue;
        const aliasPath = wholeAliasPath(token.rawValue);
        if (!aliasPath) continue;
        const target = tokenBySourcePath.get(aliasPath);
        if (!target) {
          issues.push(
            `${label}: ${token.id}@${token.mode} raw alias target이 없습니다: ${aliasPath}`,
          );
          continue;
        }
        if (
          !isPlainObject(token.aliasTarget) ||
          token.aliasTarget.id !== target.id ||
          token.aliasTarget.mode !== target.mode
        ) {
          issues.push(
            `${label}: ${token.id}@${token.mode} aliasTarget이 rawValue와 일치하지 않습니다.`,
          );
        }
        if (token.type !== target.type) {
          issues.push(
            `${label}: ${token.id}@${token.mode} alias type이 target과 일치하지 않습니다.`,
          );
        }
        if (!jsonEqual(token.resolvedValue, target.resolvedValue)) {
          issues.push(
            `${label}: ${token.id}@${token.mode} resolvedValue가 alias target과 일치하지 않습니다.`,
          );
        }
      }
      if (
        !Number.isInteger(manifest.tokenCount) ||
        manifest.tokenCount !== manifest.tokens.length
      ) {
        issues.push(`${label}.tokenCount가 tokens 길이와 일치하지 않습니다.`);
      }
      validateVariantContracts(tokensById, issues);
      validateManifestMetadata(manifest, tokenByIdMode, label, issues);
    }
  }
  if (issues.length > 0) throw new TokenValidationError(issues);
  return manifest;
}

export function diffTokenManifests(baseline, current) {
  const baseByKey = new Map(
    baseline.tokens.map((token) => [tokenKey(token.id, token.mode), token]),
  );
  const currentByKey = new Map(
    current.tokens.map((token) => [tokenKey(token.id, token.mode), token]),
  );
  const result = {
    additive: [],
    sourcePathMove: [],
    removal: [],
    type: [],
    rawValue: [],
    value: [],
    aliasTarget: [],
    mode: [],
    description: [],
    deprecation: [],
    layerOrder: [],
    figmaCollection: [],
    contrastPairs: [],
    motionProperties: [],
    reducedMotionPairs: [],
    responsiveProfiles: [],
  };

  for (const key of sortedSet(
    new Set([...baseByKey.keys(), ...currentByKey.keys()]),
  )) {
    const before = baseByKey.get(key);
    const after = currentByKey.get(key);
    if (!before) {
      result.additive.push(tokenSummary(after));
      continue;
    }
    if (!after) {
      result.removal.push(tokenSummary(before));
      continue;
    }
    if (before.sourcePath !== after.sourcePath) {
      result.sourcePathMove.push({
        id: after.id,
        mode: after.mode,
        before: before.sourcePath,
        after: after.sourcePath,
      });
    }
    if (before.type !== after.type) {
      result.type.push({
        id: after.id,
        mode: after.mode,
        before: before.type,
        after: after.type,
      });
    }
    if (!jsonEqual(before.rawValue, after.rawValue)) {
      result.rawValue.push({
        id: after.id,
        mode: after.mode,
        before: deepClone(before.rawValue),
        after: deepClone(after.rawValue),
      });
    }
    if (!jsonEqual(before.resolvedValue, after.resolvedValue)) {
      result.value.push({
        id: after.id,
        mode: after.mode,
        before: deepClone(before.resolvedValue),
        after: deepClone(after.resolvedValue),
      });
    }
    if (!jsonEqual(before.aliasTarget, after.aliasTarget)) {
      result.aliasTarget.push({
        id: after.id,
        mode: after.mode,
        before: deepClone(before.aliasTarget),
        after: deepClone(after.aliasTarget),
      });
    }
    if (before.description !== after.description) {
      result.description.push({
        id: after.id,
        mode: after.mode,
        before: before.description,
        after: after.description,
      });
    }
    if (!jsonEqual(before.deprecated, after.deprecated)) {
      result.deprecation.push({
        id: after.id,
        mode: after.mode,
        before: before.deprecated,
        after: after.deprecated,
      });
    }
  }

  const baselineIds = new Set(baseline.tokens.map((token) => token.id));
  const currentIds = new Set(current.tokens.map((token) => token.id));
  const sharedIds = new Set(
    [...baselineIds].filter((id) => currentIds.has(id)),
  );
  for (const id of sortedSet(sharedIds)) {
    const before = sortedSet(
      new Set(
        baseline.tokens
          .filter((token) => token.id === id)
          .map((token) => token.mode),
      ),
    );
    const after = sortedSet(
      new Set(
        current.tokens
          .filter((token) => token.id === id)
          .map((token) => token.mode),
      ),
    );
    if (!jsonEqual(before, after)) result.mode.push({ id, before, after });
  }
  if (!jsonEqual(baseline.layerOrder, current.layerOrder)) {
    result.layerOrder.push({
      before: deepClone(baseline.layerOrder),
      after: deepClone(current.layerOrder),
    });
  }
  if (baseline.figmaCollection !== current.figmaCollection) {
    result.figmaCollection.push({
      before: baseline.figmaCollection,
      after: current.figmaCollection,
    });
  }
  for (const category of [
    "contrastPairs",
    "motionProperties",
    "reducedMotionPairs",
    "responsiveProfiles",
  ]) {
    if (!jsonEqual(baseline[category], current[category])) {
      result[category].push({
        before: deepClone(baseline[category]),
        after: deepClone(current[category]),
      });
    }
  }

  result.summary = Object.fromEntries(
    Object.entries(result)
      .filter(([, value]) => Array.isArray(value))
      .map(([key, value]) => [key, value.length]),
  );
  return result;
}

export function breakingTokenDiffCount(diff) {
  const alwaysBreaking = [
    "removal",
    "type",
    "rawValue",
    "value",
    "aliasTarget",
    "mode",
    "layerOrder",
    "figmaCollection",
    "contrastPairs",
    "motionProperties",
    "reducedMotionPairs",
    "responsiveProfiles",
  ];
  const count = alwaysBreaking.reduce(
    (total, category) => total + (diff[category]?.length ?? 0),
    0,
  );
  const deprecationRemoval = (diff.deprecation ?? []).filter(
    (item) => item.before !== null && item.after === null,
  ).length;
  return count + deprecationRemoval;
}

export function canonicalJson(value) {
  return JSON.stringify(sortObjectKeys(value), null, 2) + "\n";
}

export function sha256(source) {
  return createHash("sha256").update(source, "utf8").digest("hex");
}

function validateRoot(document, issues) {
  validateGroupShape(document, "$", true, issues);
  const extension = ownExtension(document, "$", issues);
  const fallback = {
    figmaCollection: undefined,
    formatVersion: undefined,
    themes: [],
    contrastPairs: [],
    layerOrder: [],
    reducedMotionPairs: [],
    motionProperties: [],
    responsiveProfiles: {},
  };
  if (!extension) return fallback;
  requireExactProperties(
    extension,
    [
      "contrastPairs",
      "figmaCollection",
      "formatVersion",
      "layerOrder",
      "motionProperties",
      "reducedMotionPairs",
      "responsiveProfiles",
      "specification",
      "themes",
    ],
    `$.$extensions.${KLIPSE_EXTENSION}`,
    issues,
  );
  if (extension.formatVersion !== TOKEN_FORMAT_VERSION) {
    issues.push(
      `$.$extensions.${KLIPSE_EXTENSION}.formatVersion은 ` +
        `${TOKEN_FORMAT_VERSION}이어야 합니다.`,
    );
  }
  if (extension.specification !== DTCG_SPECIFICATION) {
    issues.push(
      `$.$extensions.${KLIPSE_EXTENSION}.specification은 ${DTCG_SPECIFICATION}이어야 합니다.`,
    );
  }
  if (
    typeof extension.figmaCollection !== "string" ||
    extension.figmaCollection.trim() !== extension.figmaCollection ||
    extension.figmaCollection.length === 0
  ) {
    issues.push(
      `$.$extensions.${KLIPSE_EXTENSION}.figmaCollection은 non-empty string이어야 합니다.`,
    );
  }
  if (!jsonEqual(extension.themes, ["light", "dark"])) {
    issues.push(
      `$.$extensions.${KLIPSE_EXTENSION}.themes는 ["light", "dark"]여야 합니다.`,
    );
  }
  validateContrastPairShape(extension.contrastPairs, issues);
  validateLayerOrderShape(extension.layerOrder, issues);
  validateReducedMotionPairShape(extension.reducedMotionPairs, issues);
  validateMotionPropertyShape(extension.motionProperties, issues);
  validateResponsiveProfileShape(extension.responsiveProfiles, issues);
  return {
    figmaCollection: extension.figmaCollection,
    formatVersion: extension.formatVersion,
    themes: Array.isArray(extension.themes) ? extension.themes : [],
    contrastPairs: Array.isArray(extension.contrastPairs)
      ? extension.contrastPairs
      : [],
    layerOrder: Array.isArray(extension.layerOrder) ? extension.layerOrder : [],
    reducedMotionPairs: Array.isArray(extension.reducedMotionPairs)
      ? extension.reducedMotionPairs
      : [],
    motionProperties: Array.isArray(extension.motionProperties)
      ? extension.motionProperties
      : [],
    responsiveProfiles: isPlainObject(extension.responsiveProfiles)
      ? deepClone(extension.responsiveProfiles)
      : {},
  };
}

function walkGroup(
  group,
  path,
  inheritedType,
  isRoot,
  records,
  tokenByPath,
  issues,
) {
  const location = path.length === 0 ? "$" : path.join(".");
  validateGroupShape(group, location, isRoot, issues);
  const groupType = group.$type ?? inheritedType;
  if (groupType !== undefined && !supportedTypeSet.has(groupType)) {
    issues.push(`${location}.$type이 지원되지 않습니다: ${String(groupType)}`);
  }
  if (!isRoot && Object.hasOwn(group, "$extensions")) {
    if (!isPlainObject(group.$extensions)) {
      issues.push(`${location}.$extensions는 object여야 합니다.`);
    } else if (Object.hasOwn(group.$extensions, KLIPSE_EXTENSION)) {
      issues.push(
        `${location}: ${KLIPSE_EXTENSION}은 root 또는 token에만 허용됩니다.`,
      );
    }
  }

  if (Object.hasOwn(group, "$root")) {
    parseToken(
      group.$root,
      path,
      groupType,
      `${location}.$root`,
      records,
      tokenByPath,
      issues,
    );
  }

  for (const name of Object.keys(group).sort(compareStrings)) {
    if (name.startsWith("$")) continue;
    if (!isValidDtcgName(name)) {
      issues.push(`${location}: 잘못된 DTCG name: ${name}`);
      continue;
    }
    const child = group[name];
    const childLocation = [...path, name].join(".");
    if (!isPlainObject(child)) {
      issues.push(`${childLocation}은 group 또는 token object여야 합니다.`);
      continue;
    }
    if (Object.hasOwn(child, "$value")) {
      parseToken(
        child,
        [...path, name],
        groupType,
        childLocation,
        records,
        tokenByPath,
        issues,
      );
    } else {
      walkGroup(
        child,
        [...path, name],
        groupType,
        false,
        records,
        tokenByPath,
        issues,
      );
    }
  }
}

function parseToken(
  node,
  path,
  inheritedType,
  location,
  records,
  tokenByPath,
  issues,
) {
  if (!isPlainObject(node)) {
    issues.push(`${location}은 token object여야 합니다.`);
    return;
  }
  validateReservedProperties(node, tokenReservedProperties, location, issues);
  validateDescriptionAndDeprecation(node, location, issues);
  if (!Object.hasOwn(node, "$value")) {
    issues.push(`${location}.$value가 필요합니다.`);
    return;
  }
  const type = node.$type ?? inheritedType;
  if (!supportedTypeSet.has(type)) {
    issues.push(`${location}.$type이 지원되지 않습니다: ${String(type)}`);
  }
  const extension = ownExtension(node, location, issues);
  if (!extension) return;
  const tier = extension.tier;
  requireExactProperties(
    extension,
    tier === "primitive" ? ["id", "tier"] : ["id", "mode", "tier"],
    `${location} extension`,
    issues,
  );
  const id = extension.id;
  const mode = tier === "primitive" ? "base" : extension.mode;
  if (!isValidTokenId(id))
    issues.push(`${location}: 잘못된 token id: ${String(id)}`);
  if (tier !== "primitive" && tier !== "semantic") {
    issues.push(`${location}: tier는 primitive 또는 semantic이어야 합니다.`);
  }
  if (tier === "semantic" && !["global", "light", "dark"].includes(mode)) {
    issues.push(`${location}: semantic mode가 잘못되었습니다: ${String(mode)}`);
  }

  let normalizedValue;
  let aliasPath = null;
  if (tier === "semantic") {
    aliasPath = wholeAliasPath(node.$value);
    if (!aliasPath) {
      issues.push(
        `${location}: semantic $value는 whole-token alias여야 합니다.`,
      );
    }
  } else if (tier === "primitive") {
    if (containsAliasSyntax(node.$value)) {
      issues.push(`${location}: primitive는 alias를 포함할 수 없습니다.`);
    }
    normalizedValue = normalizeLiteral(
      type,
      node.$value,
      `${location}.$value`,
      issues,
    );
  }

  const sourcePath = path.join(".");
  if (tokenByPath.has(sourcePath)) {
    issues.push(`${location}: DTCG path가 중복됩니다: ${sourcePath}`);
    return;
  }
  const record = {
    location,
    path: sourcePath,
    id,
    tier,
    mode,
    type,
    description: node.$description ?? null,
    deprecated: node.$deprecated ?? null,
    rawValue: deepClone(node.$value),
    normalizedValue,
    aliasPath,
    target: null,
    resolvedValue: undefined,
  };
  records.push(record);
  tokenByPath.set(sourcePath, record);
}

function validateVariantContracts(tokensById, issues) {
  for (const [id, variants] of [...tokensById.entries()].sort(
    ([left], [right]) => compareStrings(left, right),
  )) {
    const types = new Set(variants.map((token) => token.type));
    const tiers = new Set(variants.map((token) => token.tier));
    if (types.size !== 1)
      issues.push(`${id}: mode 간 type이 일치하지 않습니다.`);
    if (tiers.size !== 1)
      issues.push(`${id}: primitive/semantic tier를 섞을 수 없습니다.`);
    const tier = variants[0].tier;
    const modes = new Set(variants.map((token) => token.mode));
    if (tier === "primitive") {
      if (variants.length !== 1 || !modes.has("base")) {
        issues.push(`${id}: primitive는 base variant 하나만 가져야 합니다.`);
      }
      continue;
    }
    if (modes.has("global")) {
      if (variants.length !== 1) {
        issues.push(
          `${id}: global semantic token은 theme variant와 섞을 수 없습니다.`,
        );
      }
    } else {
      for (const theme of ["light", "dark"]) {
        if (!modes.has(theme))
          issues.push(`${id}: semantic ${theme} mode가 없습니다.`);
      }
    }
  }
}

function resolveAllTokens(records, tokenByPath, issues) {
  const state = new Map();
  function resolveToken(token, stack) {
    const currentState = state.get(token.path);
    if (currentState === "done") return token.resolvedValue;
    if (currentState === "visiting") {
      issues.push(`alias cycle: ${[...stack, token.path].join(" -> ")}`);
      return undefined;
    }
    state.set(token.path, "visiting");
    if (token.tier === "primitive") {
      token.resolvedValue = deepClone(token.normalizedValue);
      state.set(token.path, "done");
      return token.resolvedValue;
    }
    const target = tokenByPath.get(token.aliasPath);
    if (!target) {
      issues.push(
        `${token.location}: alias target이 없습니다: ${token.aliasPath}`,
      );
      state.set(token.path, "done");
      return undefined;
    }
    token.target = target;
    if (target.type !== token.type) {
      issues.push(
        `${token.location}: alias type 불일치 ${token.type} -> ${target.type} ` +
          `(${target.path})`,
      );
    }
    if (
      target.tier === "semantic" &&
      target.mode !== "global" &&
      target.mode !== token.mode
    ) {
      issues.push(
        `${token.location}: semantic alias는 같은 mode를 가리켜야 합니다: ` +
          `${token.mode} -> ${target.mode}`,
      );
    }
    token.resolvedValue = deepClone(
      resolveToken(target, [...stack, token.path]),
    );
    state.set(token.path, "done");
    return token.resolvedValue;
  }
  for (const token of [...records].sort(compareTokenRecords))
    resolveToken(token, []);
}

function validateFoundationDomains(records, issues) {
  for (const token of records) {
    if (
      token.tier === "primitive" &&
      token.type === "dimension" &&
      (token.id.startsWith("space-") || token.id.startsWith("radius-")) &&
      token.resolvedValue?.value < 0
    ) {
      issues.push(
        `${token.location}: spacing/radius 값은 0 이상이어야 합니다.`,
      );
    }
  }
}

function validateCssNames(records, issues) {
  const ownerByName = new Map();
  for (const token of records.filter((item) => item.tier === "semantic")) {
    if (token.resolvedValue === undefined) continue;
    let properties;
    try {
      properties = cssPropertiesForToken(
        token.id,
        token.type,
        token.resolvedValue,
      );
    } catch (error) {
      issues.push(`${token.location}: CSS 변환 실패: ${error.message}`);
      continue;
    }
    for (const name of Object.keys(properties)) {
      const owner = ownerByName.get(name);
      if (owner && owner !== token.id) {
        issues.push(`CSS variable 충돌: ${name} (${owner}, ${token.id})`);
      } else {
        ownerByName.set(name, token.id);
      }
    }
  }
}

/**
 * WCAG 2.2 AA의 일반 텍스트 대비 기준.
 *
 * 이 숫자 아래로 내리는 것은 접근성 기준을 포기하는 일이므로, 그때만 note를 요구한다.
 * 큰 텍스트(18.66px bold / 24px)와 비텍스트 UI 요소의 기준 3.0은 여기서 다루지 않는다 —
 * 컨트롤 라벨은 큰 텍스트가 아니다.
 */
const WCAG_AA_NORMAL_TEXT = 4.5;

function validateContrastPairShape(pairs, issues) {
  const label = `$.$extensions.${KLIPSE_EXTENSION}.contrastPairs`;
  if (!Array.isArray(pairs)) {
    issues.push(`${label}는 array여야 합니다.`);
    return;
  }
  for (const [index, pair] of pairs.entries()) {
    const itemLabel = `${label}[${index}]`;
    if (!isPlainObject(pair)) {
      issues.push(`${itemLabel}은 object여야 합니다.`);
      continue;
    }
    // note는 minimum이 WCAG AA(4.5) 아래일 때만 허용되고, 그때는 필수다.
    const relaxed = isFiniteNumber(pair.minimum) && pair.minimum < WCAG_AA_NORMAL_TEXT;
    requireExactProperties(
      pair,
      relaxed
        ? ["background", "foreground", "minimum", "note"]
        : ["background", "foreground", "minimum"],
      itemLabel,
      issues,
    );
    if (!isValidTokenId(pair.foreground))
      issues.push(`${itemLabel}.foreground id가 잘못되었습니다.`);
    if (!isValidTokenId(pair.background))
      issues.push(`${itemLabel}.background id가 잘못되었습니다.`);
    if (
      !isFiniteNumber(pair.minimum) ||
      pair.minimum < 1 ||
      pair.minimum > 21
    ) {
      issues.push(`${itemLabel}.minimum은 1..21 숫자여야 합니다.`);
    }
    // 기준을 낮추는 일이 조용히 일어나지 않게 한다. 낮추려면 왜 낮추는지를 소스에 남겨야 한다.
    if (relaxed) {
      if (typeof pair.note !== "string" || pair.note.trim().length < 20) {
        issues.push(
          `${itemLabel}.minimum이 ${WCAG_AA_NORMAL_TEXT} 미만이면 note에 20자 이상의 사유가 필요합니다. ` +
            "기준을 낮추는 변경은 근거 없이 통과하지 않습니다.",
        );
      }
    }
  }
}

function validateContrastPairs(config, tokenByIdMode, issues) {
  for (const [index, pair] of config.contrastPairs.entries()) {
    if (!isPlainObject(pair)) continue;
    for (const mode of config.themes) {
      const foreground = tokenByIdMode.get(tokenKey(pair.foreground, mode));
      const background = tokenByIdMode.get(tokenKey(pair.background, mode));
      const label = `contrastPairs[${index}] ${mode}`;
      if (!foreground || !background) {
        issues.push(`${label}: semantic color token이 없습니다.`);
        continue;
      }
      if (foreground.type !== "color" || background.type !== "color") {
        issues.push(`${label}: foreground/background는 color여야 합니다.`);
        continue;
      }
      const ratio = contrastRatio(
        foreground.resolvedValue,
        background.resolvedValue,
      );
      if (ratio === null) {
        issues.push(
          `${label}: contrast 검사는 opaque sRGB color만 지원합니다.`,
        );
      } else if (ratio + 1e-9 < pair.minimum) {
        issues.push(
          `${label}: contrast ${formatNumber(ratio)}가 minimum ${pair.minimum}보다 낮습니다.`,
        );
      }
    }
  }
}

function validateLayerOrderShape(layerOrder, issues) {
  const label = `$.$extensions.${KLIPSE_EXTENSION}.layerOrder`;
  if (!Array.isArray(layerOrder)) {
    issues.push(`${label}는 array여야 합니다.`);
    return;
  }
  const seen = new Set();
  for (const [index, id] of layerOrder.entries()) {
    if (!isValidTokenId(id))
      issues.push(`${label}[${index}] id가 잘못되었습니다.`);
    if (seen.has(id)) issues.push(`${label}: id 중복 ${id}`);
    seen.add(id);
  }
}

function validateLayerOrder(config, tokenByIdMode, issues) {
  for (const mode of ["global"]) {
    let previous = -Infinity;
    for (const id of config.layerOrder) {
      const token = tokenByIdMode.get(tokenKey(id, mode));
      if (!token) {
        issues.push(`layerOrder ${mode}: token이 없습니다: ${id}`);
        continue;
      }
      if (token.type !== "number" || !Number.isInteger(token.resolvedValue)) {
        issues.push(`layerOrder ${mode}: ${id}는 integer number여야 합니다.`);
        continue;
      }
      if (token.resolvedValue <= previous) {
        issues.push(
          `layerOrder ${mode}: 값이 strictly increasing이 아닙니다: ${id}`,
        );
      }
      previous = token.resolvedValue;
    }
  }
}

function validateReducedMotionPairShape(pairs, issues) {
  const label = `$.$extensions.${KLIPSE_EXTENSION}.reducedMotionPairs`;
  if (!Array.isArray(pairs)) {
    issues.push(`${label}는 array여야 합니다.`);
    return;
  }
  const seen = new Set();
  for (const [index, pair] of pairs.entries()) {
    const itemLabel = `${label}[${index}]`;
    if (!isPlainObject(pair)) {
      issues.push(`${itemLabel}은 object여야 합니다.`);
      continue;
    }
    requireExactProperties(pair, ["motion", "reduced"], itemLabel, issues);
    if (!isValidTokenId(pair.motion))
      issues.push(`${itemLabel}.motion id가 잘못되었습니다.`);
    if (!isValidTokenId(pair.reduced))
      issues.push(`${itemLabel}.reduced id가 잘못되었습니다.`);
    if (seen.has(pair.motion))
      issues.push(`${label}: motion 중복 ${pair.motion}`);
    seen.add(pair.motion);
  }
}

function validateReducedMotion(config, tokenByIdMode, issues) {
  const motions = new Set();
  const reducedTargets = new Set();
  for (const [index, pair] of config.reducedMotionPairs.entries()) {
    if (!isPlainObject(pair)) continue;
    motions.add(pair.motion);
    reducedTargets.add(pair.reduced);
    if (pair.motion === pair.reduced) {
      issues.push(
        `reducedMotionPairs[${index}]: motion과 reduced는 달라야 합니다.`,
      );
    }
    const motion = tokenByIdMode.get(tokenKey(pair.motion, "global"));
    const reduced = tokenByIdMode.get(tokenKey(pair.reduced, "global"));
    const label = `reducedMotionPairs[${index}]`;
    if (!motion || !reduced) {
      issues.push(`${label}: global semantic token이 없습니다.`);
      continue;
    }
    if (!motionTypeSet.has(motion.type) || motion.type !== reduced.type) {
      issues.push(
        `${label}: motion/reduced type이 일치하는 motion type이어야 합니다.`,
      );
      continue;
    }
    const duration =
      motion.type === "duration"
        ? durationMilliseconds
        : transitionMilliseconds;
    if (duration(reduced.resolvedValue) > duration(motion.resolvedValue)) {
      issues.push(`${label}: reduced motion이 원본보다 길 수 없습니다.`);
    }
  }
  // **loop는 reduce 짝을 갖지 않는다 (DS-D-0016).** reduced-motion에서 loop는 짧아지는 것이 아니라
  // 사라지며, `0ms`짜리 애니메이션을 무한 반복하는 것은 성립하지 않는다. 그 대체는 duration
  // 토큰이 아니라 component의 `animation-iteration-count: 1`과 aria-busy가 소유한다.
  const loopMotions = new Set(
    (config.motionProperties ?? [])
      .filter((entry) => isPlainObject(entry) && entry.lifecycle === "loop")
      .map((entry) => entry.motion),
  );
  for (const token of tokenByIdMode.values()) {
    if (
      token.tier === "semantic" &&
      token.mode === "global" &&
      token.type === "transition" &&
      !reducedTargets.has(token.id) &&
      !motions.has(token.id) &&
      !loopMotions.has(token.id)
    ) {
      issues.push(
        `reducedMotionPairs에 transition이 누락되었습니다: ${token.id}`,
      );
    }
  }
}

function validateMotionPropertyShape(entries, issues) {
  const label = `$.$extensions.${KLIPSE_EXTENSION}.motionProperties`;
  if (!Array.isArray(entries)) {
    issues.push(`${label}는 array여야 합니다.`);
    return;
  }
  const seenMotions = new Set();
  for (const [index, entry] of entries.entries()) {
    const itemLabel = `${label}[${index}]`;
    if (!isPlainObject(entry)) {
      issues.push(`${itemLabel}은 object여야 합니다.`);
      continue;
    }
    // `lifecycle`은 선택이다 — 없으면 enter/exit로 본다. 기존 항목이 그대로 통과한다.
    requireExactProperties(
      entry,
      entry.lifecycle === undefined
        ? ["motion", "properties"]
        : ["motion", "properties", "lifecycle"],
      itemLabel,
      issues,
    );
    if (entry.lifecycle !== undefined && !MOTION_LIFECYCLES.has(entry.lifecycle)) {
      issues.push(
        `${itemLabel}.lifecycle은 ${[...MOTION_LIFECYCLES].join("|")} 중 하나여야 합니다: ${String(entry.lifecycle)}`,
      );
    }
    if (!isValidTokenId(entry.motion))
      issues.push(`${itemLabel}.motion id가 잘못되었습니다.`);
    if (seenMotions.has(entry.motion))
      issues.push(`${label}: motion 중복 ${entry.motion}`);
    seenMotions.add(entry.motion);
    if (!Array.isArray(entry.properties) || entry.properties.length === 0) {
      issues.push(`${itemLabel}.properties는 non-empty array여야 합니다.`);
      continue;
    }
    const lifecycle = motionLifecycleOf(entry);
    const allowed =
      allowedMotionPropertiesByLifecycle[lifecycle] ??
      allowedMotionPropertiesByLifecycle.enter;
    const seenProperties = new Set();
    for (const [propertyIndex, property] of entry.properties.entries()) {
      if (!allowed.has(property)) {
        issues.push(
          `${itemLabel}.properties[${propertyIndex}] ${lifecycle} lifecycle에 허용되지 않은 property: ${String(property)}`,
        );
      }
      if (seenProperties.has(property))
        issues.push(`${itemLabel}.properties property 중복: ${property}`);
      seenProperties.add(property);
    }
  }
}

function validateMotionProperties(config, tokenByIdMode, issues) {
  const configured = new Set();
  for (const [index, entry] of config.motionProperties.entries()) {
    if (!isPlainObject(entry)) continue;
    configured.add(entry.motion);
    const token = tokenByIdMode.get(tokenKey(entry.motion, "global"));
    if (!token) {
      issues.push(
        `motionProperties[${index}]: global semantic token이 없습니다: ${entry.motion}`,
      );
    } else if (token.type !== "transition") {
      issues.push(
        `motionProperties[${index}]: ${entry.motion}은 transition이어야 합니다.`,
      );
    }
  }
  for (const token of tokenByIdMode.values()) {
    if (
      token.tier === "semantic" &&
      token.mode === "global" &&
      token.type === "transition"
    ) {
      if (!configured.has(token.id))
        issues.push(
          `motionProperties에 transition이 누락되었습니다: ${token.id}`,
        );
    }
  }
}

function validateResponsiveProfileShape(profiles, issues) {
  const label = `$.$extensions.${KLIPSE_EXTENSION}.responsiveProfiles`;
  if (!isPlainObject(profiles)) {
    issues.push(`${label}는 object여야 합니다.`);
    return;
  }
  requireExactProperties(profiles, ["projectGrid"], label, issues);
  const profile = profiles.projectGrid;
  if (!isPlainObject(profile)) {
    issues.push(`${label}.projectGrid는 object여야 합니다.`);
    return;
  }
  const profileLabel = `${label}.projectGrid`;
  requireExactProperties(
    profile,
    [
      "compatibilitySteps",
      "gap",
      "maximumColumns",
      "measurement",
      "minimumCard",
      "minimumColumns",
    ],
    profileLabel,
    issues,
  );
  if (profile.measurement !== "container") {
    issues.push(`${profileLabel}.measurement는 container여야 합니다.`);
  }
  if (!Number.isInteger(profile.minimumColumns) || profile.minimumColumns < 1) {
    issues.push(`${profileLabel}.minimumColumns는 1 이상 integer여야 합니다.`);
  }
  if (
    !Number.isInteger(profile.maximumColumns) ||
    profile.maximumColumns < profile.minimumColumns
  ) {
    issues.push(
      `${profileLabel}.maximumColumns는 minimumColumns 이상 integer여야 합니다.`,
    );
  }
  if (!isValidTokenId(profile.minimumCard))
    issues.push(`${profileLabel}.minimumCard id가 잘못되었습니다.`);
  if (!isValidTokenId(profile.gap))
    issues.push(`${profileLabel}.gap id가 잘못되었습니다.`);
  if (
    !Array.isArray(profile.compatibilitySteps) ||
    profile.compatibilitySteps.length === 0
  ) {
    issues.push(
      `${profileLabel}.compatibilitySteps는 non-empty array여야 합니다.`,
    );
    return;
  }
  let previousWidth = -Infinity;
  let previousColumns = -Infinity;
  for (const [index, step] of profile.compatibilitySteps.entries()) {
    const stepLabel = `${profileLabel}.compatibilitySteps[${index}]`;
    if (!isPlainObject(step)) {
      issues.push(`${stepLabel}은 object여야 합니다.`);
      continue;
    }
    requireExactProperties(
      step,
      ["minimumWidth", "preferredColumns"],
      stepLabel,
      issues,
    );
    const width = normalizeUnitValue(
      step.minimumWidth,
      `${stepLabel}.minimumWidth`,
      issues,
      new Set(["px"]),
      true,
    );
    if (width && width.value <= previousWidth)
      issues.push(
        `${stepLabel}.minimumWidth는 strictly ascending이어야 합니다.`,
      );
    if (index === 0 && width?.value !== 0)
      issues.push(`${stepLabel}.minimumWidth는 0px로 시작해야 합니다.`);
    if (width) previousWidth = width.value;
    if (
      !Number.isInteger(step.preferredColumns) ||
      step.preferredColumns < profile.minimumColumns ||
      step.preferredColumns > profile.maximumColumns
    ) {
      issues.push(`${stepLabel}.preferredColumns가 column bounds 밖입니다.`);
    }
    if (step.preferredColumns < previousColumns) {
      issues.push(
        `${stepLabel}.preferredColumns는 nondecreasing이어야 합니다.`,
      );
    }
    previousColumns = step.preferredColumns;
  }
}

function validateResponsiveProfiles(config, tokenByIdMode, issues) {
  const profile = config.responsiveProfiles.projectGrid;
  if (!isPlainObject(profile)) return;
  for (const field of ["minimumCard", "gap"]) {
    const token = tokenByIdMode.get(tokenKey(profile[field], "global"));
    if (!token)
      issues.push(
        `responsiveProfiles.projectGrid.${field}: global semantic token이 없습니다.`,
      );
    else if (token.type !== "dimension") {
      issues.push(
        `responsiveProfiles.projectGrid.${field}: ${profile[field]}은 dimension이어야 합니다.`,
      );
    }
  }
  const minimumCard = tokenByIdMode.get(
    tokenKey(profile.minimumCard, "global"),
  );
  const gap = tokenByIdMode.get(tokenKey(profile.gap, "global"));
  if (
    minimumCard?.type === "dimension" &&
    gap?.type === "dimension" &&
    minimumCard.resolvedValue?.unit === "px" &&
    gap.resolvedValue?.unit === "px"
  ) {
    for (const [index, step] of profile.compatibilitySteps.entries()) {
      if (step.minimumWidth.unit !== "px") continue;
      const available = step.minimumWidth.value;
      const requested = step.preferredColumns;
      const required =
        minimumCard.resolvedValue.value * requested +
        gap.resolvedValue.value * Math.max(0, requested - 1);
      const capacity = Math.max(
        profile.minimumColumns,
        Math.min(
          profile.maximumColumns,
          Math.floor(
            (available + gap.resolvedValue.value) /
              (minimumCard.resolvedValue.value + gap.resolvedValue.value),
          ),
        ),
      );
      const effective = Math.max(
        profile.minimumColumns,
        Math.min(requested, capacity),
      );
      if (
        !Number.isInteger(effective) ||
        effective < profile.minimumColumns ||
        effective > profile.maximumColumns ||
        (available >= required && effective !== requested)
      ) {
        issues.push(
          `responsiveProfiles.projectGrid.compatibilitySteps[${index}]: capacity fallback 계산이 잘못되었습니다.`,
        );
      }
    }
  }
}

function validateManifestMetadata(manifest, tokenByIdMode, label, issues) {
  validateContrastPairShape(manifest.contrastPairs, issues);
  validateLayerOrderShape(manifest.layerOrder, issues);
  validateReducedMotionPairShape(manifest.reducedMotionPairs, issues);
  validateMotionPropertyShape(manifest.motionProperties, issues);
  validateResponsiveProfileShape(manifest.responsiveProfiles, issues);
  const config = {
    themes: Array.isArray(manifest.themes) ? manifest.themes : [],
    contrastPairs: Array.isArray(manifest.contrastPairs)
      ? manifest.contrastPairs
      : [],
    layerOrder: Array.isArray(manifest.layerOrder) ? manifest.layerOrder : [],
    reducedMotionPairs: Array.isArray(manifest.reducedMotionPairs)
      ? manifest.reducedMotionPairs
      : [],
    motionProperties: Array.isArray(manifest.motionProperties)
      ? manifest.motionProperties
      : [],
    responsiveProfiles: isPlainObject(manifest.responsiveProfiles)
      ? manifest.responsiveProfiles
      : {},
  };
  validateContrastPairs(config, tokenByIdMode, issues);
  validateLayerOrder(config, tokenByIdMode, issues);
  validateReducedMotion(config, tokenByIdMode, issues);
  validateMotionProperties(config, tokenByIdMode, issues);
  validateResponsiveProfiles(config, tokenByIdMode, issues);
  if (!isPlainObject(manifest.responsiveProfiles)) {
    issues.push(`${label}.responsiveProfiles는 object여야 합니다.`);
  }
}

function normalizeLiteral(type, value, path, issues) {
  switch (type) {
    case "color":
      return normalizeColor(value, path, issues);
    case "dimension":
      return normalizeDimension(value, path, issues);
    case "fontFamily":
      return normalizeFontFamily(value, path, issues);
    case "fontWeight":
      return normalizeFontWeight(value, path, issues);
    case "duration":
      return normalizeDuration(value, path, issues);
    case "cubicBezier":
      return normalizeCubicBezier(value, path, issues);
    case "number":
      return normalizeNumber(value, path, issues);
    case "shadow":
      return normalizeShadow(value, path, issues);
    case "typography":
      return normalizeTypography(value, path, issues);
    case "transition":
      return normalizeTransition(value, path, issues);
    default:
      return undefined;
  }
}

function normalizeColor(value, path, issues) {
  if (!isPlainObject(value)) {
    issues.push(`${path}는 DTCG color object여야 합니다.`);
    return undefined;
  }
  requireAllowedAndRequiredProperties(
    value,
    ["alpha", "colorSpace", "components", "hex"],
    ["colorSpace", "components"],
    path,
    issues,
  );
  if (!["srgb", "display-p3"].includes(value.colorSpace)) {
    issues.push(`${path}.colorSpace는 srgb 또는 display-p3여야 합니다.`);
  }
  if (!Array.isArray(value.components) || value.components.length !== 3) {
    issues.push(`${path}.components는 길이 3 array여야 합니다.`);
  } else {
    for (const [index, component] of value.components.entries()) {
      if (
        component !== "none" &&
        (!isFiniteNumber(component) || component < 0 || component > 1)
      ) {
        issues.push(
          `${path}.components[${index}]는 0..1 또는 none이어야 합니다.`,
        );
      }
    }
  }
  if (
    Object.hasOwn(value, "alpha") &&
    (!isFiniteNumber(value.alpha) || value.alpha < 0 || value.alpha > 1)
  ) {
    issues.push(`${path}.alpha는 0..1이어야 합니다.`);
  }
  if (
    Object.hasOwn(value, "hex") &&
    (typeof value.hex !== "string" || !/^#[0-9a-f]{6}$/i.test(value.hex))
  ) {
    issues.push(`${path}.hex는 #RRGGBB여야 합니다.`);
  } else if (
    Object.hasOwn(value, "hex") &&
    value.colorSpace === "srgb" &&
    Array.isArray(value.components) &&
    value.components.length === 3 &&
    value.components.every(isFiniteNumber)
  ) {
    const expectedHex =
      "#" +
      value.components
        .map((component) =>
          Math.round(component * 255)
            .toString(16)
            .padStart(2, "0"),
        )
        .join("");
    if (value.hex.toLowerCase() !== expectedHex) {
      issues.push(
        `${path}.hex가 components와 일치하지 않습니다: ${value.hex} -> ${expectedHex}`,
      );
    }
  }
  return {
    colorSpace: value.colorSpace,
    components: Array.isArray(value.components)
      ? [...value.components]
      : value.components,
    alpha: Object.hasOwn(value, "alpha") ? value.alpha : 1,
  };
}

function normalizeDimension(value, path, issues) {
  return normalizeUnitValue(value, path, issues, new Set(["px", "rem"]), false);
}

function normalizeDuration(value, path, issues) {
  return normalizeUnitValue(value, path, issues, new Set(["ms", "s"]), true);
}

function normalizeUnitValue(value, path, issues, units, nonNegative) {
  if (!isPlainObject(value)) {
    issues.push(`${path}는 {value, unit} object여야 합니다.`);
    return undefined;
  }
  requireExactProperties(value, ["unit", "value"], path, issues);
  if (!isFiniteNumber(value.value) || Object.is(value.value, -0)) {
    issues.push(`${path}.value는 finite number여야 합니다.`);
  } else if (nonNegative && value.value < 0) {
    issues.push(`${path}.value는 0 이상이어야 합니다.`);
  }
  if (!units.has(value.unit))
    issues.push(`${path}.unit이 지원되지 않습니다: ${String(value.unit)}`);
  return deepClone(value);
}

function normalizeFontFamily(value, path, issues) {
  const families = typeof value === "string" ? [value] : value;
  if (!Array.isArray(families) || families.length === 0) {
    issues.push(`${path}는 non-empty string 또는 string array여야 합니다.`);
    return undefined;
  }
  for (const [index, family] of families.entries()) {
    if (
      typeof family !== "string" ||
      family.trim() !== family ||
      family.length === 0
    ) {
      issues.push(`${path}[${index}]는 trim된 non-empty string이어야 합니다.`);
    }
  }
  return typeof value === "string" ? value : [...families];
}

function normalizeFontWeight(value, path, issues) {
  if (typeof value === "number") {
    if (!Number.isInteger(value) || value < 1 || value > 1000) {
      issues.push(`${path}는 1..1000 integer여야 합니다.`);
    }
  } else if (typeof value !== "string" || !fontWeightNames.has(value)) {
    issues.push(`${path} fontWeight가 지원되지 않습니다: ${String(value)}`);
  }
  return value;
}

function normalizeCubicBezier(value, path, issues) {
  if (!Array.isArray(value) || value.length !== 4) {
    issues.push(`${path}는 길이 4 number array여야 합니다.`);
    return undefined;
  }
  value.forEach((component, index) => {
    if (!isFiniteNumber(component))
      issues.push(`${path}[${index}]는 finite number여야 합니다.`);
  });
  if (isFiniteNumber(value[0]) && (value[0] < 0 || value[0] > 1)) {
    issues.push(`${path}[0]은 0..1이어야 합니다.`);
  }
  if (isFiniteNumber(value[2]) && (value[2] < 0 || value[2] > 1)) {
    issues.push(`${path}[2]는 0..1이어야 합니다.`);
  }
  return [...value];
}

function normalizeNumber(value, path, issues) {
  if (!isFiniteNumber(value) || Object.is(value, -0)) {
    issues.push(`${path}는 finite number여야 합니다.`);
  }
  return value;
}

function normalizeShadow(value, path, issues) {
  const layers = Array.isArray(value) ? value : [value];
  if (layers.length === 0)
    issues.push(`${path} shadow array는 비어 있을 수 없습니다.`);
  const normalized = layers.map((layer, index) => {
    const layerPath = `${path}[${index}]`;
    if (!isPlainObject(layer)) {
      issues.push(`${layerPath}는 shadow object여야 합니다.`);
      return undefined;
    }
    // inset은 DTCG 2025.10 shadow의 선택 property다. 없으면 바깥 그림자다.
    requireExactProperties(
      layer,
      Object.hasOwn(layer, "inset")
        ? ["blur", "color", "inset", "offsetX", "offsetY", "spread"]
        : ["blur", "color", "offsetX", "offsetY", "spread"],
      layerPath,
      issues,
    );
    if (Object.hasOwn(layer, "inset") && typeof layer.inset !== "boolean") {
      issues.push(`${layerPath}.inset은 boolean이어야 합니다.`);
    }
    const blur = normalizeDimension(layer.blur, `${layerPath}.blur`, issues);
    if (blur && blur.value < 0)
      issues.push(`${layerPath}.blur는 0 이상이어야 합니다.`);
    return {
      color: normalizeColor(layer.color, `${layerPath}.color`, issues),
      offsetX: normalizeDimension(
        layer.offsetX,
        `${layerPath}.offsetX`,
        issues,
      ),
      offsetY: normalizeDimension(
        layer.offsetY,
        `${layerPath}.offsetY`,
        issues,
      ),
      blur,
      spread: normalizeDimension(layer.spread, `${layerPath}.spread`, issues),
      inset: layer.inset === true,
    };
  });
  return Array.isArray(value) ? normalized : normalized[0];
}

function normalizeTypography(value, path, issues) {
  if (!isPlainObject(value)) {
    issues.push(`${path}는 typography object여야 합니다.`);
    return undefined;
  }
  requireExactProperties(
    value,
    ["fontFamily", "fontSize", "fontWeight", "letterSpacing", "lineHeight"],
    path,
    issues,
  );
  return {
    fontFamily: normalizeFontFamily(
      value.fontFamily,
      `${path}.fontFamily`,
      issues,
    ),
    fontSize: normalizeDimension(value.fontSize, `${path}.fontSize`, issues),
    fontWeight: normalizeFontWeight(
      value.fontWeight,
      `${path}.fontWeight`,
      issues,
    ),
    letterSpacing: normalizeDimension(
      value.letterSpacing,
      `${path}.letterSpacing`,
      issues,
    ),
    lineHeight: normalizeNumber(value.lineHeight, `${path}.lineHeight`, issues),
  };
}

function normalizeTransition(value, path, issues) {
  if (!isPlainObject(value)) {
    issues.push(`${path}는 transition object여야 합니다.`);
    return undefined;
  }
  requireExactProperties(
    value,
    ["delay", "duration", "timingFunction"],
    path,
    issues,
  );
  return {
    duration: normalizeDuration(value.duration, `${path}.duration`, issues),
    delay: normalizeDuration(value.delay, `${path}.delay`, issues),
    timingFunction: normalizeCubicBezier(
      value.timingFunction,
      `${path}.timingFunction`,
      issues,
    ),
  };
}

function createPublicModel(model) {
  const modes = { global: {}, light: {}, dark: {} };
  const primitives = {};
  const publicToken = (token) => ({
    aliasTarget: deepClone(token.aliasTarget),
    cssProperties: deepClone(token.cssProperties),
    deprecated: token.deprecated,
    description: token.description,
    id: token.id,
    mode: token.mode,
    rawValue: deepClone(token.rawValue),
    sourcePath: token.sourcePath,
    tier: token.tier,
    type: token.type,
    value: deepClone(token.resolvedValue),
  });
  for (const token of model.primitiveTokens) {
    primitives[token.id] = publicToken(token);
  }
  for (const token of model.semanticTokens) {
    modes[token.mode][token.id] = publicToken(token);
  }
  return {
    formatVersion: model.formatVersion,
    metadata: {
      contrastPairs: deepClone(model.contrastPairs),
      description: model.description,
      figmaCollection: model.figmaCollection,
      layerOrder: [...model.layerOrder],
      motionProperties: deepClone(model.motionProperties),
      reducedMotionPairs: deepClone(model.reducedMotionPairs),
      responsiveProfiles: deepClone(model.responsiveProfiles),
    },
    themes: [...model.themes],
    primitives,
    modes,
  };
}

function renderCss(model) {
  const byMode = new Map([
    ["global", new Map()],
    ["light", new Map()],
    ["dark", new Map()],
  ]);
  for (const token of model.semanticTokens) {
    const properties = byMode.get(token.mode);
    for (const [name, value] of Object.entries(token.cssProperties))
      properties.set(name, value);
  }
  const lines = [
    "/* GENERATED FILE — edit packages/tokens/src/klipse.tokens.json. */",
    "",
  ];
  const lightProperties = new Map([
    ...byMode.get("global").entries(),
    ...byMode.get("light").entries(),
  ]);
  appendCssBlock(
    lines,
    [":root", '[data-theme="light"]'],
    lightProperties,
    "light",
  );
  lines.push("");
  appendCssBlock(lines, ['[data-theme="dark"]'], byMode.get("dark"), "dark");
  return lines.join("\n") + "\n";
}

function appendCssBlock(lines, selectors, properties, colorScheme) {
  selectors.forEach((selector, index) => {
    lines.push(selector + (index === selectors.length - 1 ? " {" : ","));
  });
  lines.push(`  color-scheme: ${colorScheme};`);
  for (const name of [...properties.keys()].sort(compareStrings)) {
    lines.push(`  ${name}: ${properties.get(name)};`);
  }
  lines.push("}");
}

function renderJavaScript(publicModel) {
  return [
    "// GENERATED FILE — edit packages/tokens/src/klipse.tokens.json.",
    `export const formatVersion = ${JSON.stringify(publicModel.formatVersion)};`,
    `export const themes = Object.freeze(${JSON.stringify(publicModel.themes)});`,
    "export const metadata = Object.freeze(" +
      JSON.stringify(publicModel.metadata, null, 2) +
      ");",
    "export const primitives = " +
      JSON.stringify(publicModel.primitives, null, 2) +
      ";",
    "export const tokens = " + JSON.stringify(publicModel.modes, null, 2) + ";",
    "",
  ].join("\n");
}

function renderTypes(model) {
  const types = SUPPORTED_TOKEN_TYPES.map((type) => JSON.stringify(type)).join(
    " | ",
  );
  const allIds = [...new Set(model.allTokens.map((token) => token.id))].sort(
    compareStrings,
  );
  const primitiveIds = model.primitiveTokens.map((token) => token.id);
  const semanticIds = [
    ...new Set(model.semanticTokens.map((token) => token.id)),
  ].sort(compareStrings);
  const idUnion = (ids) => ids.map(JSON.stringify).join(" | ") || "never";
  const typeById = new Map();
  for (const token of model.allTokens) typeById.set(token.id, token.type);
  const typeMapLines = allIds.map(
    (id) =>
      `  readonly ${JSON.stringify(id)}: ${JSON.stringify(typeById.get(id))};`,
  );
  const recordLine = (token) => {
    const alias = token.aliasTarget
      ? `{ readonly id: ${JSON.stringify(token.aliasTarget.id)}; readonly mode: ${JSON.stringify(token.aliasTarget.mode)} }`
      : "null";
    return (
      `  readonly ${JSON.stringify(token.id)}: TokenRecord<` +
      `${JSON.stringify(token.id)}, ${JSON.stringify(token.mode)}, ` +
      `${JSON.stringify(token.tier)}, ${alias}>;`
    );
  };
  const recordsForMode = (mode) =>
    model.semanticTokens.filter((token) => token.mode === mode).map(recordLine);
  return [
    "// GENERATED FILE — edit packages/tokens/src/klipse.tokens.json.",
    `export type TokenType = ${types};`,
    'export type TokenTheme = "light" | "dark";',
    'export type TokenMode = "base" | "global" | TokenTheme;',
    `export type TokenId = ${idUnion(allIds)};`,
    `export type PrimitiveTokenId = ${idUnion(primitiveIds)};`,
    `export type SemanticTokenId = ${idUnion(semanticIds)};`,
    "export interface TokenTypeById {",
    ...typeMapLines,
    "}",
    "export interface ColorValue {",
    '  readonly colorSpace: "srgb" | "display-p3";',
    '  readonly components: readonly (number | "none")[];',
    "  readonly alpha?: number;",
    "  readonly hex?: string;",
    "}",
    'export interface DimensionValue { readonly value: number; readonly unit: "px" | "rem"; }',
    'export interface DurationValue { readonly value: number; readonly unit: "ms" | "s"; }',
    "export type CubicBezierValue = readonly [number, number, number, number];",
    "export interface ShadowLayerValue {",
    "  readonly color: ColorValue;",
    "  readonly offsetX: DimensionValue;",
    "  readonly offsetY: DimensionValue;",
    "  readonly blur: DimensionValue;",
    "  readonly spread: DimensionValue;",
    "  readonly inset: boolean;",
    "}",
    "export interface TypographyValue {",
    "  readonly fontFamily: string | readonly string[];",
    "  readonly fontSize: DimensionValue;",
    "  readonly fontWeight: number | string;",
    "  readonly letterSpacing: DimensionValue;",
    "  readonly lineHeight: number;",
    "}",
    "export interface TransitionValue {",
    "  readonly delay: DurationValue;",
    "  readonly duration: DurationValue;",
    "  readonly timingFunction: CubicBezierValue;",
    "}",
    "export interface TokenValueByType {",
    "  readonly color: ColorValue;",
    "  readonly dimension: DimensionValue;",
    "  readonly fontFamily: string | readonly string[];",
    "  readonly fontWeight: number | string;",
    "  readonly duration: DurationValue;",
    "  readonly cubicBezier: CubicBezierValue;",
    "  readonly number: number;",
    "  readonly shadow: ShadowLayerValue | readonly ShadowLayerValue[];",
    "  readonly typography: TypographyValue;",
    "  readonly transition: TransitionValue;",
    "}",
    "export interface TokenAliasTarget { readonly id: TokenId; readonly mode: TokenMode; }",
    "export interface TokenRecord<",
    "  TId extends TokenId = TokenId,",
    "  TMode extends TokenMode = TokenMode,",
    '  TTier extends "primitive" | "semantic" = "primitive" | "semantic",',
    "  TAlias extends TokenAliasTarget | null = TokenAliasTarget | null,",
    "> {",
    "  readonly id: TId;",
    "  readonly mode: TMode;",
    "  readonly tier: TTier;",
    "  readonly type: TokenTypeById[TId];",
    '  readonly rawValue: TTier extends "semantic" ? string : TokenValueByType[TokenTypeById[TId]];',
    "  readonly value: TokenValueByType[TokenTypeById[TId]];",
    "  readonly aliasTarget: TAlias;",
    "  readonly sourcePath: string;",
    "  readonly description: string | null;",
    "  readonly deprecated: boolean | string | null;",
    "  readonly cssProperties: Readonly<Record<string, string>>;",
    "}",
    "export interface TokenMetadata {",
    "  readonly description: string | null;",
    "  readonly figmaCollection: string;",
    "  readonly contrastPairs: readonly Readonly<{ foreground: SemanticTokenId; background: SemanticTokenId; minimum: number }>[];",
    "  readonly layerOrder: readonly SemanticTokenId[];",
    "  readonly motionProperties: readonly unknown[];",
    "  readonly reducedMotionPairs: readonly unknown[];",
    "  readonly responsiveProfiles: Readonly<Record<string, unknown>>;",
    "}",
    `export declare const formatVersion: ${TOKEN_FORMAT_VERSION};`,
    "export declare const themes: readonly TokenTheme[];",
    "export declare const metadata: Readonly<TokenMetadata>;",
    "export declare const primitives: Readonly<{",
    ...model.primitiveTokens.map(recordLine),
    "}>;",
    "export declare const tokens: Readonly<{",
    "  readonly global: Readonly<{",
    ...recordsForMode("global"),
    "  }> ;",
    "  readonly light: Readonly<{",
    ...recordsForMode("light"),
    "  }> ;",
    "  readonly dark: Readonly<{",
    ...recordsForMode("dark"),
    "  }> ;",
    "}>;",
    "",
  ].join("\n");
}

const FIGMA_MODE_NAMES = {
  base: "Base",
  global: "Global",
  light: "Light",
  dark: "Dark",
};
// mode 순서는 알파벳이 아니라 source가 선언한 theme 순서를 따른다.
// Figma는 첫 mode를 default로 쓰므로, CSS의 `:root`가 light인 것과 어긋나면 안 된다.
const FIGMA_MODE_ORDER = ["Base", "Global", "Light", "Dark"];
const FIGMA_COMPOSITE_TYPES = new Set([
  "typography",
  "shadow",
  "transition",
  "cubicBezier",
]);

function figmaCollectionKindForToken(token) {
  if (token.tier === "primitive") return "primitive";
  if (token.mode === "global") return "semantic";
  return "semanticColor";
}

function figmaCollectionNames(prefix) {
  return {
    primitive: `${prefix} Primitive`,
    semantic: `${prefix} Semantic`,
    semanticColor: `${prefix} Semantic Color`,
  };
}

function figmaRepresentationForToken(token) {
  if (!FIGMA_COMPOSITE_TYPES.has(token.type)) return "variable";
  if (token.tier === "primitive") return "unrepresented";
  if (token.type === "typography") return "text-style";
  if (token.type === "shadow") return "effect-style";
  return "variable-documentation";
}

function figmaVariablePath(token) {
  const segments = token.sourcePath.split(".");
  return segments.slice(token.tier === "primitive" ? 1 : 2).join("/");
}

function figmaScopesForToken(token) {
  if (token.type === "color") {
    if (token.id.startsWith("color-background")) {
      return ["FRAME_FILL", "SHAPE_FILL"];
    }
    if (token.id.startsWith("color-foreground")) return ["TEXT_FILL"];
    if (token.id.startsWith("color-border")) return ["STROKE_COLOR"];
    return ["FRAME_FILL", "SHAPE_FILL", "STROKE_COLOR", "TEXT_FILL"];
  }
  if (token.type === "dimension") {
    if (token.id.startsWith("radius-")) return ["CORNER_RADIUS"];
    if (token.id.startsWith("space-")) return ["GAP", "WIDTH_HEIGHT"];
    return ["WIDTH_HEIGHT"];
  }
  if (token.type === "fontFamily") return ["FONT_FAMILY"];
  if (token.type === "fontWeight") return ["FONT_WEIGHT"];
  return [];
}

function createFigmaProposal(model) {
  const names = figmaCollectionNames(model.figmaCollection);
  const collections = {};
  for (const kind of ["primitive", "semantic", "semanticColor"]) {
    collections[names[kind]] = { kind, modes: [], variables: {} };
  }

  for (const token of model.allTokens) {
    const kind = figmaCollectionKindForToken(token);
    const collection = collections[names[kind]];
    const modeName = FIGMA_MODE_NAMES[token.mode];
    if (!collection.modes.includes(modeName)) collection.modes.push(modeName);

    const representation = figmaRepresentationForToken(token);
    const entry = (collection.variables[token.id] ??= {
      $type: token.type,
      figmaName: figmaVariablePath(token),
      nativeVariableType: figmaNativeTypeForToken(token.type, representation),
      representation,
      scopes: representation.startsWith("variable")
        ? figmaScopesForToken(token)
        : [],
      hiddenFromPublishing: token.tier === "primitive",
      losses: figmaLossesForToken(token.type, representation),
      fields: FIGMA_COMPOSITE_TYPES.has(token.type)
        ? figmaCompositeFields(token.resolvedValue)
        : [],
      valuesByMode: {},
    });
    const value = {
      $value: deepClone(token.rawValue),
      aliasTarget: deepClone(token.aliasTarget),
      resolvedValue: deepClone(token.resolvedValue),
      sourcePath: token.sourcePath,
    };
    if (token.description !== null) value.$description = token.description;
    if (token.deprecated !== null) value.$deprecated = token.deprecated;
    entry.valuesByMode[modeName] = value;
  }

  for (const collection of Object.values(collections)) {
    collection.modes.sort(
      (left, right) =>
        FIGMA_MODE_ORDER.indexOf(left) - FIGMA_MODE_ORDER.indexOf(right),
    );
    // Figma는 첫 mode를 default로 삼는다. 명시해 두면 적용 스크립트와 parity가 이를 검증할 수 있다.
    collection.defaultMode = collection.modes[0];
  }

  return {
    $description: model.description,
    $extensions: {
      [KLIPSE_EXTENSION]: {
        collectionNames: names,
        contrastPairs: deepClone(model.contrastPairs),
        figmaCollection: model.figmaCollection,
        formatVersion: model.formatVersion,
        layerOrder: [...model.layerOrder],
        motionProperties: deepClone(model.motionProperties),
        reducedMotionPairs: deepClone(model.reducedMotionPairs),
        responsiveProfiles: deepClone(model.responsiveProfiles),
        proposalNotice:
          "REVIEW PROPOSAL — validate in Figma before publishing variables or styles.",
        representationPolicy: "DS-D-0007",
        reviewOnly: true,
        themes: [...model.themes],
      },
    },
    collections,
  };
}

function figmaNativeTypeForToken(type, representation) {
  if (representation === "variable-documentation") return "STRING";
  if (representation !== "variable") return null;
  if (type === "color") return "COLOR";
  if (type === "fontFamily") return "STRING";
  return "FLOAT";
}

function figmaCompositeFields(value) {
  // 다층 shadow는 배열이다. 겹마다 같은 필드를 가지므로 합집합을 쓴다 — 빈 배열을 돌려주면
  // "style인데 fields가 없다"로 분류 계약이 깨진다.
  if (Array.isArray(value)) {
    const union = new Set();
    for (const layer of value) {
      if (!isPlainObject(layer)) continue;
      for (const key of Object.keys(layer)) union.add(key);
    }
    return [...union].sort(compareStrings);
  }
  return isPlainObject(value) ? Object.keys(value).sort(compareStrings) : [];
}

function figmaLossesForToken(type, representation) {
  if (representation === "unrepresented") {
    return [
      `primitive ${type}은 Figma에 만들지 않습니다. Figma에는 style→style alias가 없어 semantic→primitive tier 관계를 보존할 수 없습니다 (DS-D-0007).`,
    ];
  }
  if (representation === "text-style" || representation === "effect-style") {
    return [
      `DTCG ${type} composite는 단일 native variable로 표현되지 않아 ${representation}로 만들고 내부 속성을 변수에 바인딩합니다.`,
    ];
  }
  if (representation === "variable-documentation") {
    return [
      `DTCG ${type}은 Figma가 해석하지 않는 문서용 STRING 변수로 격하됩니다.`,
    ];
  }
  if (type === "fontFamily") {
    return ["Figma STRING은 font fallback 배열을 구조적으로 표현하지 못합니다."];
  }
  if (type === "dimension" || type === "duration" || type === "fontWeight") {
    return [
      "Figma FLOAT는 DTCG 단위 의미를 직접 보존하지 않으므로 source metadata를 함께 검토해야 합니다.",
    ];
  }
  return [];
}

function cssPropertiesForToken(id, type, value) {
  const base = `--kds-${id.replaceAll(".", "-")}`;
  if (type === "typography") {
    return {
      [`${base}-font-family`]: cssFontFamily(value.fontFamily),
      [`${base}-font-size`]: cssDimension(value.fontSize),
      [`${base}-font-weight`]: cssFontWeight(value.fontWeight),
      [`${base}-letter-spacing`]: cssDimension(value.letterSpacing),
      [`${base}-line-height`]: formatNumber(value.lineHeight),
    };
  }
  if (type === "transition") {
    return {
      [`${base}-duration`]: cssDuration(value.duration),
      [`${base}-delay`]: cssDuration(value.delay),
      [`${base}-timing-function`]: cssCubicBezier(value.timingFunction),
    };
  }
  return { [base]: cssLiteral(type, value) };
}

function cssLiteral(type, value) {
  switch (type) {
    case "color":
      return cssColor(value);
    case "dimension":
      return cssDimension(value);
    case "fontFamily":
      return cssFontFamily(value);
    case "fontWeight":
      return cssFontWeight(value);
    case "duration":
      return cssDuration(value);
    case "cubicBezier":
      return cssCubicBezier(value);
    case "number":
      return formatNumber(value);
    case "shadow":
      return cssShadow(value);
    default:
      throw new Error(`CSS scalar 변환을 지원하지 않습니다: ${type}`);
  }
}

function cssColor(value) {
  const components = value.components.map((item) =>
    item === "none" ? "none" : formatNumber(item),
  );
  return `color(${value.colorSpace} ${components.join(" ")} / ${formatNumber(value.alpha)})`;
}

function cssDimension(value) {
  return `${formatNumber(value.value)}${value.unit}`;
}

function cssDuration(value) {
  return `${formatNumber(value.value)}${value.unit}`;
}

function cssCubicBezier(value) {
  return `cubic-bezier(${value.map(formatNumber).join(", ")})`;
}

function cssFontFamily(value) {
  const families = Array.isArray(value) ? value : [value];
  return families
    .map((family) =>
      genericFontFamilies.has(family) ? family : JSON.stringify(family),
    )
    .join(", ");
}

function cssFontWeight(value) {
  return String(typeof value === "number" ? value : fontWeightNames.get(value));
}

function cssShadow(value) {
  const layers = Array.isArray(value) ? value : [value];
  return layers
    .map((layer) =>
      [
        // CSS는 inset을 값 앞이나 뒤 어디에 둬도 되지만 앞이 관례다.
        ...(layer.inset ? ["inset"] : []),
        cssDimension(layer.offsetX),
        cssDimension(layer.offsetY),
        cssDimension(layer.blur),
        cssDimension(layer.spread),
        cssColor(layer.color),
      ].join(" "),
    )
    .join(", ");
}

function contrastRatio(foreground, background) {
  if (
    !foreground ||
    !background ||
    foreground.colorSpace !== "srgb" ||
    background.colorSpace !== "srgb" ||
    foreground.alpha !== 1 ||
    background.alpha !== 1 ||
    !Array.isArray(foreground.components) ||
    foreground.components.length !== 3 ||
    !Array.isArray(background.components) ||
    background.components.length !== 3 ||
    foreground.components.some((value) => typeof value !== "number") ||
    background.components.some((value) => typeof value !== "number")
  ) {
    return null;
  }
  const lighter = Math.max(
    luminance(foreground.components),
    luminance(background.components),
  );
  const darker = Math.min(
    luminance(foreground.components),
    luminance(background.components),
  );
  return (lighter + 0.05) / (darker + 0.05);
}

function luminance(components) {
  const linear = components.map((value) =>
    value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4,
  );
  return linear[0] * 0.2126 + linear[1] * 0.7152 + linear[2] * 0.0722;
}

function durationMilliseconds(value) {
  if (!value) return Infinity;
  return value.unit === "s" ? value.value * 1000 : value.value;
}

function transitionMilliseconds(value) {
  if (!value) return Infinity;
  return (
    durationMilliseconds(value.duration) + durationMilliseconds(value.delay)
  );
}

function wholeAliasPath(value) {
  if (typeof value !== "string") return null;
  const match = /^\{([^{}\s]+)\}$/.exec(value);
  return match ? match[1] : null;
}

function containsAliasSyntax(value) {
  if (typeof value === "string") return /[{}]/.test(value);
  if (Array.isArray(value)) return value.some(containsAliasSyntax);
  if (isPlainObject(value))
    return Object.values(value).some(containsAliasSyntax);
  return false;
}

function ownExtension(node, location, issues) {
  if (!Object.hasOwn(node, "$extensions")) {
    issues.push(`${location}.$extensions.${KLIPSE_EXTENSION}이 필요합니다.`);
    return null;
  }
  if (!isPlainObject(node.$extensions)) {
    issues.push(`${location}.$extensions는 object여야 합니다.`);
    return null;
  }
  const extension = node.$extensions[KLIPSE_EXTENSION];
  if (!isPlainObject(extension)) {
    issues.push(
      `${location}.$extensions.${KLIPSE_EXTENSION}은 object여야 합니다.`,
    );
    return null;
  }
  return extension;
}

function validateGroupShape(node, location, isRoot, issues) {
  if (!isPlainObject(node)) {
    issues.push(`${location}은 group object여야 합니다.`);
    return;
  }
  validateReservedProperties(
    node,
    isRoot ? rootReservedProperties : groupReservedProperties,
    location,
    issues,
  );
  validateDescriptionAndDeprecation(node, location, issues);
  if (Object.hasOwn(node, "$root") && !isPlainObject(node.$root)) {
    issues.push(`${location}.$root는 token object여야 합니다.`);
  }
}

function validateReservedProperties(node, allowed, location, issues) {
  for (const key of Object.keys(node)) {
    if (key.startsWith("$") && !allowed.has(key)) {
      issues.push(`${location}: 알 수 없는 reserved property ${key}`);
    }
  }
}

function validateDescriptionAndDeprecation(node, location, issues) {
  if (
    Object.hasOwn(node, "$description") &&
    (typeof node.$description !== "string" || node.$description.length === 0)
  ) {
    issues.push(`${location}.$description은 non-empty string이어야 합니다.`);
  }
  if (
    Object.hasOwn(node, "$deprecated") &&
    typeof node.$deprecated !== "boolean" &&
    typeof node.$deprecated !== "string"
  ) {
    issues.push(`${location}.$deprecated는 boolean 또는 string이어야 합니다.`);
  }
}

function requireExactProperties(value, keys, label, issues) {
  if (!isPlainObject(value)) return;
  const expected = new Set(keys);
  for (const key of Object.keys(value)) {
    if (!expected.has(key)) issues.push(`${label}: 알 수 없는 property ${key}`);
  }
  for (const key of keys) {
    if (!Object.hasOwn(value, key))
      issues.push(`${label}.${key}가 필요합니다.`);
  }
}

function requireAllowedAndRequiredProperties(
  value,
  allowed,
  required,
  label,
  issues,
) {
  if (!isPlainObject(value)) return;
  const allowedSet = new Set(allowed);
  for (const key of Object.keys(value)) {
    if (!allowedSet.has(key))
      issues.push(`${label}: 알 수 없는 property ${key}`);
  }
  for (const key of required) {
    if (!Object.hasOwn(value, key))
      issues.push(`${label}.${key}가 필요합니다.`);
  }
}

function isValidDtcgName(name) {
  return (
    typeof name === "string" &&
    name.length > 0 &&
    !name.startsWith("$") &&
    !/[.{}]/.test(name)
  );
}

function isValidTokenId(id) {
  return typeof id === "string" && /^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/.test(id);
}

function formatNumber(value) {
  if (!isFiniteNumber(value) || Object.is(value, -0)) {
    throw new Error(`canonical number가 아닙니다: ${String(value)}`);
  }
  return Number(value.toFixed(8)).toString();
}

function compareTokenRecords(left, right) {
  return (
    compareStrings(left.id, right.id) ||
    compareMode(left.mode, right.mode) ||
    compareStrings(left.path, right.path)
  );
}

function compareMode(left, right) {
  const order = new Map([
    ["base", 0],
    ["global", 1],
    ["light", 2],
    ["dark", 3],
  ]);
  return (order.get(left) ?? 99) - (order.get(right) ?? 99);
}

function compareStrings(left, right) {
  return left < right ? -1 : left > right ? 1 : 0;
}

function tokenKey(id, mode) {
  return `${String(id)}@${String(mode)}`;
}

function tokenSummary(token) {
  return {
    id: token.id,
    mode: token.mode,
    type: token.type,
    sourcePath: token.sourcePath,
  };
}

function sortedSet(values) {
  return [...values].sort(compareStrings);
}

function sortObjectKeys(value) {
  if (Array.isArray(value)) return value.map(sortObjectKeys);
  if (!isPlainObject(value)) return value;
  return Object.fromEntries(
    Object.keys(value)
      .sort(compareStrings)
      .map((key) => [key, sortObjectKeys(value[key])]),
  );
}

function jsonEqual(left, right) {
  return (
    JSON.stringify(sortObjectKeys(left)) ===
    JSON.stringify(sortObjectKeys(right))
  );
}

function deepClone(value) {
  return value === undefined ? undefined : JSON.parse(JSON.stringify(value));
}

function isPlainObject(value) {
  if (value === null || typeof value !== "object" || Array.isArray(value))
    return false;
  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}

function isFiniteNumber(value) {
  return typeof value === "number" && Number.isFinite(value);
}

function isSha256(value) {
  return typeof value === "string" && /^[0-9a-f]{64}$/.test(value);
}
