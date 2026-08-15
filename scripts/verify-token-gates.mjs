import { execFileSync } from "node:child_process";
import {
  existsSync,
  linkSync,
  lstatSync,
  mkdtempSync,
  readFileSync,
  readdirSync,
  rmSync,
  symlinkSync,
  unlinkSync,
  writeFileSync,
} from "node:fs";
import { dirname, resolve } from "node:path";
import { tmpdir } from "node:os";
import { fileURLToPath, pathToFileURL } from "node:url";
import {
  KLIPSE_EXTENSION,
  TOKEN_OUTPUT_PATHS,
  TOKEN_SOURCE_PATH,
  TokenValidationError,
  breakingTokenDiffCount,
  canonicalJson,
  compileTokenSource,
  diffTokenManifests,
  parseTokenManifest,
  renderTokenOutputs,
  sha256,
} from "./lib/token-model.mjs";
import { atomicWriteBatch } from "./lib/atomic-output.mjs";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const buildScript = resolve(repoRoot, "scripts/build-tokens.mjs");
const consumerFixture = resolve(repoRoot, "packages/tokens/test/consumer.mjs");
const sourceAbsolute = resolve(repoRoot, TOKEN_SOURCE_PATH);
const positives = [];
const canaries = [];
const failures = [];

function runBuild(args = ["--check"]) {
  return execFileSync(process.execPath, [buildScript, ...args], {
    cwd: repoRoot,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  });
}

function expectBuildFailure(label, args = ["--check"]) {
  try {
    runBuild(args);
    failures.push(`${label}: build가 성공해 canary를 탐지하지 못했습니다.`);
  } catch {
    canaries.push(label);
  }
}

function expectModelFailure(label, mutate) {
  const document = JSON.parse(sourceRaw);
  mutate(document);
  try {
    compileTokenSource(JSON.stringify(document), {
      sourcePath: `${label}.tokens.json`,
    });
    failures.push(`${label}: invalid source가 통과했습니다.`);
  } catch (error) {
    if (error instanceof TokenValidationError) canaries.push(label);
    else
      failures.push(
        `${label}: 예상하지 못한 오류: ${error.stack ?? error.message}`,
      );
  }
}

function collectTokens(node, path = [], result = []) {
  if (!node || typeof node !== "object" || Array.isArray(node)) return result;
  for (const [name, child] of Object.entries(node)) {
    if (
      name.startsWith("$") ||
      !child ||
      typeof child !== "object" ||
      Array.isArray(child)
    )
      continue;
    if (Object.hasOwn(child, "$value")) {
      result.push({
        node: child,
        parent: node,
        name,
        path: [...path, name].join("."),
        extension: child.$extensions?.[KLIPSE_EXTENSION],
        type: child.$type ?? node.$type,
      });
    } else collectTokens(child, [...path, name], result);
  }
  return result;
}

function restoreOutput(absolute, source) {
  try {
    const metadata = lstatSync(absolute);
    if (metadata.isSymbolicLink() || metadata.nlink > 1) unlinkSync(absolute);
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
  }
  writeFileSync(absolute, source, "utf8");
}

function publicTokenFor(publicModel, token) {
  return token.tier === "primitive"
    ? publicModel.primitives[token.id]
    : publicModel.modes[token.mode]?.[token.id];
}

function projectionEqual(left, right) {
  return canonicalJson(left) === canonicalJson(right);
}

function assertTokenProjection(model, outputs) {
  const publicModel = JSON.parse(
    outputs.get("packages/tokens/generated/tokens.json"),
  );
  const manifest = JSON.parse(
    outputs.get("packages/tokens/generated/manifest.json"),
  );
  const figma = JSON.parse(
    outputs.get("packages/tokens/generated/figma.tokens.json"),
  );
  const manifestByKey = new Map(
    manifest.tokens.map((token) => [`${token.id}@${token.mode}`, token]),
  );
  const figmaModeNames = {
    base: "Base",
    global: "Global",
    light: "Light",
    dark: "Dark",
  };
  const figmaVariableById = new Map();
  for (const collection of Object.values(figma.collections ?? {})) {
    for (const [id, variable] of Object.entries(collection.variables ?? {})) {
      figmaVariableById.set(id, variable);
    }
  }
  for (const token of model.allTokens) {
    const key = `${token.id}@${token.mode}`;
    const runtime = publicTokenFor(publicModel, token);
    const manifestToken = manifestByKey.get(key);
    const figmaVariable = figmaVariableById.get(token.id);
    const figmaValue =
      figmaVariable?.valuesByMode?.[figmaModeNames[token.mode]];
    const figmaToken = figmaValue
      ? {
          $value: figmaValue.$value,
          $description: figmaValue.$description,
          $deprecated: figmaValue.$deprecated,
          $extensions: {
            [KLIPSE_EXTENSION]: {
              aliasTarget: figmaValue.aliasTarget,
              resolvedValue: figmaValue.resolvedValue,
            },
          },
        }
      : undefined;
    const expectedCommon = {
      aliasTarget: token.aliasTarget,
      deprecated: token.deprecated,
      description: token.description,
      id: token.id,
      mode: token.mode,
      rawValue: token.rawValue,
      sourcePath: token.sourcePath,
      tier: token.tier,
      type: token.type,
    };
    if (
      !runtime ||
      !manifestToken ||
      !figmaToken ||
      !projectionEqual(
        {
          aliasTarget: runtime.aliasTarget,
          deprecated: runtime.deprecated,
          description: runtime.description,
          id: runtime.id,
          mode: runtime.mode,
          rawValue: runtime.rawValue,
          sourcePath: runtime.sourcePath,
          tier: runtime.tier,
          type: runtime.type,
        },
        expectedCommon,
      ) ||
      !projectionEqual(runtime.value, token.resolvedValue) ||
      !projectionEqual(manifestToken.aliasTarget, token.aliasTarget) ||
      !projectionEqual(manifestToken.rawValue, token.rawValue) ||
      !projectionEqual(figmaToken.$value, token.rawValue) ||
      !projectionEqual(
        figmaToken.$extensions?.[KLIPSE_EXTENSION]?.aliasTarget,
        token.aliasTarget,
      ) ||
      !projectionEqual(
        figmaToken.$extensions?.[KLIPSE_EXTENSION]?.resolvedValue,
        token.resolvedValue,
      ) ||
      (figmaToken.$description ?? null) !== token.description ||
      (figmaToken.$deprecated ?? null) !== token.deprecated
    ) {
      failures.push(`cross-artifact token projection 불일치: ${key}`);
    }
  }
  for (const token of model.allTokens) {
    const variable = figmaVariableById.get(token.id);
    const value = variable?.valuesByMode?.[figmaModeNames[token.mode]];
    if (!value || value.sourcePath !== token.sourcePath) {
      failures.push(
        `Figma proposal sourcePath 불일치: ${token.id}@${token.mode}`,
      );
    }
  }
  const collectionNames =
    figma.$extensions?.[KLIPSE_EXTENSION]?.collectionNames ?? {};
  const expectedCollectionNames = {
    primitive: `${model.figmaCollection} Primitive`,
    semantic: `${model.figmaCollection} Semantic`,
    semanticColor: `${model.figmaCollection} Semantic Color`,
  };
  if (
    publicModel.metadata.figmaCollection !== model.figmaCollection ||
    manifest.figmaCollection !== model.figmaCollection ||
    figma.$extensions?.[KLIPSE_EXTENSION]?.figmaCollection !==
      model.figmaCollection ||
    JSON.stringify(collectionNames) !==
      JSON.stringify(expectedCollectionNames) ||
    manifest.tokenCount !== model.allTokens.length
  ) {
    failures.push("cross-artifact root metadata projection 불일치");
  }
}

let sourceRaw;
try {
  sourceRaw = readFileSync(sourceAbsolute, "utf8");
  runBuild(["--check"]);
  positives.push("build --check");

  const firstModel = compileTokenSource(sourceRaw, {
    sourcePath: TOKEN_SOURCE_PATH,
  });
  const secondModel = compileTokenSource(sourceRaw, {
    sourcePath: TOKEN_SOURCE_PATH,
  });
  const firstOutputs = renderTokenOutputs(firstModel);
  const secondOutputs = renderTokenOutputs(secondModel);
  if (
    JSON.stringify([...firstOutputs]) !== JSON.stringify([...secondOutputs])
  ) {
    failures.push("determinism: 같은 source의 두 render가 다릅니다.");
  } else positives.push("deterministic render");

  for (const [path, expected] of firstOutputs) {
    const actual = readFileSync(resolve(repoRoot, path), "utf8");
    if (actual !== expected)
      failures.push(`parity: ${path}가 render 결과와 다릅니다.`);
  }
  const manifest = JSON.parse(
    firstOutputs.get("packages/tokens/generated/manifest.json"),
  );
  for (const artifact of manifest.artifacts) {
    if (sha256(firstOutputs.get(artifact.path)) !== artifact.sha256) {
      failures.push(`manifest parity: ${artifact.path} hash 불일치`);
    }
  }
  if (
    !failures.some(
      (failure) =>
        failure.startsWith("parity") || failure.startsWith("manifest parity"),
    )
  ) {
    positives.push("output/manifest parity");
  }
  const projectionFailureCount = failures.length;
  assertTokenProjection(firstModel, firstOutputs);
  if (failures.length === projectionFailureCount) {
    positives.push("primitive/semantic metadata projection parity");
  }

  const figmaProposal = JSON.parse(
    firstOutputs.get("packages/tokens/generated/figma.tokens.json"),
  );
  const figmaCollectionEntries = Object.entries(
    figmaProposal.collections ?? {},
  );
  const figmaVariables = figmaCollectionEntries.flatMap(([name, collection]) =>
    Object.entries(collection.variables ?? {}).map(([id, variable]) => ({
      collection: name,
      kind: collection.kind,
      modes: collection.modes ?? [],
      id,
      ...variable,
    })),
  );
  const uniqueSourceIds = new Set(firstModel.allTokens.map((t) => t.id));
  const valueRecordCount = figmaVariables.reduce(
    (sum, variable) => sum + Object.keys(variable.valuesByMode ?? {}).length,
    0,
  );
  const byRepresentation = {};
  for (const variable of figmaVariables) {
    byRepresentation[variable.representation] =
      (byRepresentation[variable.representation] ?? 0) + 1;
  }
  const classificationBroken = figmaVariables.some((variable) => {
    const isVariable = variable.representation === "variable";
    const isDoc = variable.representation === "variable-documentation";
    const isStyle =
      variable.representation === "text-style" ||
      variable.representation === "effect-style";
    const unrepresented = variable.representation === "unrepresented";
    if (!isVariable && !isDoc && !isStyle && !unrepresented) return true;
    if ((isVariable || isDoc) && variable.nativeVariableType === null)
      return true;
    if ((isStyle || unrepresented) && variable.nativeVariableType !== null)
      return true;
    if (isDoc && variable.nativeVariableType !== "STRING") return true;
    if ((isStyle || unrepresented) && variable.losses.length === 0) return true;
    if (isStyle && variable.fields.length === 0) return true;
    if (typeof variable.figmaName !== "string" || variable.figmaName.length === 0)
      return true;
    const expectedKind =
      variable.kind === "primitive"
        ? "primitive"
        : variable.modes.includes("Global")
          ? "semantic"
          : "semanticColor";
    if (variable.kind !== expectedKind) return true;
    if (variable.kind === "semanticColor" && variable.modes.length !== 2)
      return true;
    if (variable.kind !== "semanticColor" && variable.modes.length !== 1)
      return true;
    return false;
  });
  const nameCollision = figmaCollectionEntries.some(([, collection]) => {
    const paths = Object.values(collection.variables ?? {}).map(
      (variable) => variable.figmaName,
    );
    return new Set(paths).size !== paths.length;
  });
  if (
    figmaCollectionEntries.length !== 3 ||
    figmaVariables.length !== uniqueSourceIds.size ||
    valueRecordCount !== firstModel.allTokens.length ||
    !byRepresentation["text-style"] ||
    !byRepresentation["effect-style"] ||
    !byRepresentation.unrepresented ||
    !byRepresentation["variable-documentation"] ||
    classificationBroken ||
    nameCollision
  ) {
    failures.push(
      "Figma proposal collection/representation contract가 불완전합니다.",
    );
  } else {
    positives.push("Figma proposal collection/representation classification");
  }

  const css = firstOutputs.get("packages/tokens/generated/tokens.css");
  const lightBlock = /:root,\n\[data-theme="light"\] \{([\s\S]*?)\n\}/.exec(
    css,
  )?.[1];
  const darkBlock = /\[data-theme="dark"\] \{([\s\S]*?)\n\}/.exec(css)?.[1];
  if (!lightBlock || !darkBlock) {
    failures.push("CSS theme selectors: :root/light/dark block이 없습니다.");
  } else {
    if (
      !lightBlock.includes("  color-scheme: light;") ||
      !darkBlock.includes("  color-scheme: dark;")
    ) {
      failures.push("CSS theme selectors: color-scheme 선언이 없습니다.");
    }
    for (const token of firstModel.semanticTokens) {
      const block = token.mode === "dark" ? darkBlock : lightBlock;
      for (const [name, value] of Object.entries(token.cssProperties)) {
        if (!block.includes(`  ${name}: ${value};`)) {
          failures.push(
            `CSS theme selectors: ${token.id}@${token.mode} ${name} 누락`,
          );
        }
      }
    }
    if (
      !failures.some((failure) => failure.startsWith("CSS theme selectors"))
    ) {
      positives.push("CSS selector/theme parity");
    }
  }

  const generatedModule = await import(
    `${pathToFileURL(resolve(repoRoot, "packages/tokens/generated/index.js")).href}?verify=${Date.now()}`
  );
  const expectedExports = [
    "formatVersion",
    "metadata",
    "primitives",
    "themes",
    "tokens",
  ];
  const jsExports = Object.keys(generatedModule).sort();
  const declarations = [
    ...firstOutputs
      .get("packages/tokens/generated/index.d.ts")
      .matchAll(/^export declare const ([A-Za-z_$][\w$]*):/gm),
  ]
    .map((match) => match[1])
    .sort();
  if (JSON.stringify(jsExports) !== JSON.stringify(expectedExports)) {
    failures.push(
      `generated JS import exports 불일치: ${jsExports.join(", ")}`,
    );
  } else positives.push("generated JS import");
  if (JSON.stringify(declarations) !== JSON.stringify(expectedExports)) {
    failures.push(`d.ts/JS export parity 불일치: ${declarations.join(", ")}`);
  } else positives.push("d.ts/JS export parity");
  const declarationSource = firstOutputs.get(
    "packages/tokens/generated/index.d.ts",
  );
  if (
    generatedModule.formatVersion !== firstModel.formatVersion ||
    typeof generatedModule.formatVersion !== "number" ||
    JSON.stringify(generatedModule.themes) !==
      JSON.stringify(firstModel.themes) ||
    generatedModule.metadata?.figmaCollection !== firstModel.figmaCollection ||
    Object.keys(generatedModule.primitives ?? {}).length !==
      firstModel.primitiveTokens.length ||
    !generatedModule.tokens ||
    typeof generatedModule.tokens !== "object" ||
    !declarationSource.includes(
      `export declare const formatVersion: ${firstModel.formatVersion};`,
    ) ||
    !declarationSource.includes(
      `readonly ${JSON.stringify(firstModel.allTokens[0].id)}: ${JSON.stringify(firstModel.allTokens[0].type)};`,
    ) ||
    !declarationSource.includes(
      `readonly ${JSON.stringify(firstModel.allTokens[0].id)}: TokenRecord<${JSON.stringify(firstModel.allTokens[0].id)}, ${JSON.stringify(firstModel.allTokens[0].mode)},`,
    )
  ) {
    failures.push(
      "generated runtime/d.ts token ID/type/mode contract가 일치하지 않습니다.",
    );
  } else positives.push("generated runtime/d.ts token graph contract");

  try {
    execFileSync(process.execPath, [consumerFixture], {
      cwd: repoRoot,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
    });
    positives.push("package self-reference consumer fixture");
  } catch (error) {
    failures.push(
      `package consumer fixture 실패: ${error.stderr?.toString() || error.message}`,
    );
  }

  const originalTokens = collectTokens(JSON.parse(sourceRaw));
  const primitives = originalTokens.filter(
    (item) => item.extension?.tier === "primitive",
  );
  const semantics = originalTokens.filter(
    (item) => item.extension?.tier === "semantic",
  );

  const metadataFixture = JSON.parse(sourceRaw);
  const describedToken = collectTokens(metadataFixture).find(
    (item) => item.extension?.tier === "semantic",
  );
  describedToken.node.$description = "Projection fixture description";
  describedToken.node.$deprecated = "Use the replacement token.";
  const metadataFixtureModel = compileTokenSource(
    JSON.stringify(metadataFixture),
    { sourcePath: TOKEN_SOURCE_PATH },
  );
  const metadataFixtureOutputs = renderTokenOutputs(metadataFixtureModel);
  const projectedToken = metadataFixtureModel.allTokens.find(
    (token) =>
      token.id === describedToken.extension.id &&
      token.mode === describedToken.extension.mode,
  );
  const projectedFigmaProposal = JSON.parse(
    metadataFixtureOutputs.get("packages/tokens/generated/figma.tokens.json"),
  );
  const projectedFigmaModeName = {
    base: "Base",
    global: "Global",
    light: "Light",
    dark: "Dark",
  }[projectedToken.mode];
  const projectedFigma = Object.values(projectedFigmaProposal.collections)
    .map((collection) => collection.variables[projectedToken.id])
    .find(Boolean)?.valuesByMode[projectedFigmaModeName];
  const projectedManifest = JSON.parse(
    metadataFixtureOutputs.get("packages/tokens/generated/manifest.json"),
  ).tokens.find(
    (token) =>
      token.id === projectedToken.id && token.mode === projectedToken.mode,
  );
  if (
    projectedFigma.$description !== describedToken.node.$description ||
    projectedFigma.$deprecated !== describedToken.node.$deprecated ||
    projectedManifest.description !== describedToken.node.$description ||
    projectedManifest.deprecated !== describedToken.node.$deprecated
  ) {
    failures.push("description/deprecation fixture projection 불일치");
  } else positives.push("description/deprecation projection fixture");

  expectModelFailure("reserved-property", (document) => {
    document.$schema = "https://example.invalid/schema.json";
  });
  expectModelFailure("strict-schema", (document) => {
    document.$extensions[KLIPSE_EXTENSION].unexpectedContract = true;
  });
  expectModelFailure("unsupported-dtcg-ref", (document) => {
    const token = collectTokens(document).find(
      (item) => item.extension?.tier === "primitive",
    );
    token.node.$ref = "#/primitive/color/neutral/0";
  });
  expectModelFailure("invalid-group-name", (document) => {
    document["bad.group"] = {};
  });
  expectModelFailure("unsupported-type", (document) => {
    const token = collectTokens(document).find(
      (item) => item.extension?.tier === "primitive",
    );
    token.node.$type = "gradient";
  });
  expectModelFailure("invalid-value", (document) => {
    const token = collectTokens(document).find(
      (item) =>
        item.extension?.tier === "primitive" && item.type === "dimension",
    );
    token.node.$value.unit = "vh";
  });
  expectModelFailure("negative-spacing-radius", (document) => {
    const token = collectTokens(document).find(
      (item) =>
        item.extension?.tier === "primitive" &&
        item.type === "dimension" &&
        (item.extension.id.startsWith("space-") ||
          item.extension.id.startsWith("radius-")),
    );
    token.node.$value.value = -1;
  });
  expectModelFailure("primitive-alias", (document) => {
    const tokens = collectTokens(document).filter(
      (item) =>
        item.extension?.tier === "primitive" && item.type === "dimension",
    );
    tokens[0].node.$value = `{${tokens[1].path}}`;
  });
  expectModelFailure("dangling-alias", (document) => {
    const token = collectTokens(document).find(
      (item) => item.extension?.tier === "semantic",
    );
    token.node.$value = "{missing.token.path}";
  });
  expectModelFailure("alias-type", (document) => {
    const token = collectTokens(document).find(
      (item) => item.extension?.tier === "semantic" && item.type === "color",
    );
    token.node.$type = "dimension";
  });
  expectModelFailure("alias-cycle", (document) => {
    document.semantic.global.gateCycle = {
      $type: "number",
      a: {
        $value: "{semantic.global.gateCycle.b}",
        $extensions: {
          [KLIPSE_EXTENSION]: {
            id: "gate-cycle-a",
            tier: "semantic",
            mode: "global",
          },
        },
      },
      b: {
        $value: "{semantic.global.gateCycle.a}",
        $extensions: {
          [KLIPSE_EXTENSION]: {
            id: "gate-cycle-b",
            tier: "semantic",
            mode: "global",
          },
        },
      },
    };
  });
  expectModelFailure("id-mode-uniqueness", (document) => {
    const tokens = collectTokens(document).filter(
      (item) =>
        item.extension?.tier === "semantic" && item.extension.mode === "light",
    );
    tokens[1].extension.id = tokens[0].extension.id;
  });
  expectModelFailure("theme-mode-completeness", (document) => {
    const tokens = collectTokens(document);
    const light = tokens.find(
      (item) =>
        item.extension?.tier === "semantic" && item.extension.mode === "light",
    );
    const dark = tokens.find(
      (item) =>
        item.extension?.id === light.extension.id &&
        item.extension.mode === "dark",
    );
    delete dark.parent[dark.name];
  });
  expectModelFailure("motion-property-contract", (document) => {
    document.$extensions[KLIPSE_EXTENSION].motionProperties[0].properties.push(
      "left",
    );
  });
  expectModelFailure("responsive-profile-contract", (document) => {
    document.$extensions[
      KLIPSE_EXTENSION
    ].responsiveProfiles.projectGrid.compatibilitySteps[1].minimumWidth.value =
      0;
  });
  expectModelFailure("responsive-profile-capacity", (document) => {
    document.$extensions[
      KLIPSE_EXTENSION
    ].responsiveProfiles.projectGrid.minimumColumns = 6;
  });

  if (primitives.length === 0 || semantics.length === 0) {
    failures.push(
      "fixture discovery: primitive/semantic token을 찾지 못했습니다.",
    );
  }

  const currentManifest = parseTokenManifest(
    firstOutputs.get("packages/tokens/generated/manifest.json"),
    "generated manifest fixture",
  );
  const cloneManifest = () => structuredClone(currentManifest);
  const expectDiffClassification = (
    label,
    baselineMutate,
    currentMutate,
    predicate,
  ) => {
    const baseline = cloneManifest();
    const current = cloneManifest();
    baselineMutate?.(baseline);
    currentMutate?.(current);
    const diff = diffTokenManifests(baseline, current);
    if (predicate(diff, breakingTokenDiffCount(diff))) canaries.push(label);
    else failures.push(`${label}: token diff classification 불일치`);
  };
  const firstPrimitive = currentManifest.tokens.find(
    (token) => token.tier === "primitive",
  );
  const dimensionPrimitive = currentManifest.tokens.find(
    (token) => token.tier === "primitive" && token.type === "dimension",
  );
  const firstSemantic = currentManifest.tokens.find(
    (token) => token.tier === "semantic",
  );
  expectDiffClassification(
    "diff-additive-nonbreaking",
    null,
    (manifestValue) => {
      const added = structuredClone(firstPrimitive);
      added.id = "gate-additive-token";
      added.sourcePath = "gate.additive.token";
      manifestValue.tokens.push(added);
    },
    (diff, breaking) =>
      diff.additive.length === 1 && diff.mode.length === 0 && breaking === 0,
  );
  expectDiffClassification(
    "diff-removal-breaking",
    null,
    (manifestValue) => {
      manifestValue.tokens = manifestValue.tokens.filter(
        (token) =>
          token.id !== firstPrimitive.id || token.mode !== firstPrimitive.mode,
      );
    },
    (diff, breaking) => diff.removal.length === 1 && breaking > 0,
  );
  expectDiffClassification(
    "diff-type-breaking",
    null,
    (manifestValue) => {
      manifestValue.tokens.find(
        (token) =>
          token.id === firstPrimitive.id && token.mode === firstPrimitive.mode,
      ).type = "number";
    },
    (diff, breaking) => diff.type.length === 1 && breaking > 0,
  );
  expectDiffClassification(
    "diff-raw-unit-value-breaking",
    null,
    (manifestValue) => {
      const token = manifestValue.tokens.find(
        (item) =>
          item.id === dimensionPrimitive.id &&
          item.mode === dimensionPrimitive.mode,
      );
      token.rawValue = { value: token.rawValue.value + 1, unit: "rem" };
    },
    (diff, breaking) => diff.rawValue.length === 1 && breaking > 0,
  );
  expectDiffClassification(
    "diff-resolved-value-breaking",
    null,
    (manifestValue) => {
      manifestValue.tokens.find(
        (token) =>
          token.id === firstPrimitive.id && token.mode === firstPrimitive.mode,
      ).resolvedValue = 999;
    },
    (diff, breaking) => diff.value.length === 1 && breaking > 0,
  );
  expectDiffClassification(
    "diff-alias-target-breaking",
    null,
    (manifestValue) => {
      manifestValue.tokens.find(
        (token) =>
          token.id === firstSemantic.id && token.mode === firstSemantic.mode,
      ).aliasTarget = { id: firstPrimitive.id, mode: "base" };
    },
    (diff, breaking) => diff.aliasTarget.length === 1 && breaking > 0,
  );
  expectDiffClassification(
    "diff-mode-breaking",
    null,
    (manifestValue) => {
      manifestValue.tokens.find(
        (token) =>
          token.id === firstSemantic.id && token.mode === firstSemantic.mode,
      ).mode = "gate-mode";
    },
    (diff, breaking) => diff.mode.length === 1 && breaking > 0,
  );
  expectDiffClassification(
    "diff-layer-order-breaking",
    null,
    (manifestValue) => manifestValue.layerOrder.reverse(),
    (diff, breaking) => diff.layerOrder.length === 1 && breaking > 0,
  );
  expectDiffClassification(
    "diff-source-path-move-nonbreaking",
    null,
    (manifestValue) => {
      manifestValue.tokens.find(
        (token) =>
          token.id === firstPrimitive.id && token.mode === firstPrimitive.mode,
      ).sourcePath = "primitive.moved.path";
    },
    (diff, breaking) => diff.sourcePathMove.length === 1 && breaking === 0,
  );
  expectDiffClassification(
    "diff-description-nonbreaking",
    null,
    (manifestValue) => {
      manifestValue.tokens.find(
        (token) =>
          token.id === firstPrimitive.id && token.mode === firstPrimitive.mode,
      ).description = "Updated description";
    },
    (diff, breaking) => diff.description.length === 1 && breaking === 0,
  );
  expectDiffClassification(
    "diff-deprecation-removal-breaking",
    (manifestValue) => {
      manifestValue.tokens.find(
        (token) =>
          token.id === firstPrimitive.id && token.mode === firstPrimitive.mode,
      ).deprecated = "Use replacement";
    },
    null,
    (diff, breaking) => diff.deprecation.length === 1 && breaking > 0,
  );
  expectDiffClassification(
    "diff-figma-collection-breaking",
    null,
    (manifestValue) => {
      manifestValue.figmaCollection = "Renamed Collection";
    },
    (diff, breaking) => diff.figmaCollection.length === 1 && breaking > 0,
  );
  for (const category of [
    "contrastPairs",
    "motionProperties",
    "reducedMotionPairs",
    "responsiveProfiles",
  ]) {
    expectDiffClassification(
      `diff-${category}-breaking`,
      null,
      (manifestValue) => {
        if (Array.isArray(manifestValue[category])) {
          manifestValue[category] = [
            ...manifestValue[category],
            { gateMutation: category },
          ];
        } else {
          manifestValue[category] = {
            ...manifestValue[category],
            gateMutation: category,
          };
        }
      },
      (diff, breaking) => diff[category].length === 1 && breaking > 0,
    );
  }
  positives.push("token diff policy mutations");

  const driftPath = resolve(repoRoot, TOKEN_OUTPUT_PATHS[0]);
  const driftRaw = readFileSync(driftPath, "utf8");
  try {
    writeFileSync(driftPath, `${driftRaw}\n/* gate drift */\n`, "utf8");
    expectBuildFailure("generated-drift");
  } finally {
    restoreOutput(driftPath, driftRaw);
  }

  const tempRoot = mkdtempSync(resolve(tmpdir(), "klipse-token-gates-"));
  try {
    const atomicFirst = resolve(tempRoot, "atomic-first.txt");
    const atomicSecond = resolve(tempRoot, "atomic-second.txt");
    writeFileSync(atomicFirst, "before-first", "utf8");
    writeFileSync(atomicSecond, "before-second", "utf8");
    try {
      atomicWriteBatch(
        [
          { absolute: atomicFirst, expected: "after-first" },
          { absolute: atomicSecond, expected: "after-second" },
        ],
        { failAfterCommit: 1 },
      );
      failures.push("atomic-write-rollback: injected failure가 성공했습니다.");
    } catch {
      if (
        readFileSync(atomicFirst, "utf8") === "before-first" &&
        readFileSync(atomicSecond, "utf8") === "before-second" &&
        readdirSync(tempRoot).every(
          (name) => !name.startsWith(".generated-output-"),
        )
      ) {
        canaries.push("atomic-write-rollback");
      } else {
        failures.push(
          "atomic-write-rollback: outputs 또는 temp entry를 원복하지 못했습니다.",
        );
      }
    }

    const symlinkPath = resolve(repoRoot, TOKEN_OUTPUT_PATHS[1]);
    const symlinkRaw = readFileSync(symlinkPath, "utf8");
    const outsideTarget = resolve(tempRoot, "outside-write.txt");
    try {
      unlinkSync(symlinkPath);
      symlinkSync(outsideTarget, symlinkPath);
      expectBuildFailure("dangling-symlink-output", ["--write"]);
      if (existsSync(outsideTarget))
        failures.push("dangling-symlink-output: 저장소 밖에 썼습니다.");
    } finally {
      restoreOutput(symlinkPath, symlinkRaw);
    }

    const hardlinkPath = resolve(repoRoot, TOKEN_OUTPUT_PATHS[2]);
    const hardlinkRaw = readFileSync(hardlinkPath, "utf8");
    const hardlinkPeer = resolve(tempRoot, "hardlink-peer.txt");
    try {
      writeFileSync(hardlinkPeer, hardlinkRaw, "utf8");
      unlinkSync(hardlinkPath);
      linkSync(hardlinkPeer, hardlinkPath);
      expectBuildFailure("hardlink-output", ["--write"]);
    } finally {
      restoreOutput(hardlinkPath, hardlinkRaw);
    }

    const firstPath = resolve(repoRoot, TOKEN_OUTPUT_PATHS[0]);
    const lastPath = resolve(repoRoot, TOKEN_OUTPUT_PATHS.at(-1));
    const firstRaw = readFileSync(firstPath, "utf8");
    const lastRaw = readFileSync(lastPath, "utf8");
    const stale = `${firstRaw}\n/* must remain stale */\n`;
    const partialTarget = resolve(tempRoot, "partial-outside.txt");
    try {
      writeFileSync(firstPath, stale, "utf8");
      unlinkSync(lastPath);
      symlinkSync(partialTarget, lastPath);
      expectBuildFailure("partial-write-preflight", ["--write"]);
      if (readFileSync(firstPath, "utf8") !== stale) {
        failures.push(
          "partial-write-preflight: 앞선 output을 일부 갱신했습니다.",
        );
      }
      if (existsSync(partialTarget))
        failures.push("partial-write-preflight: 저장소 밖에 썼습니다.");
    } finally {
      restoreOutput(firstPath, firstRaw);
      restoreOutput(lastPath, lastRaw);
    }
  } finally {
    rmSync(tempRoot, { recursive: true, force: true });
  }

  runBuild(["--check"]);
  positives.push("post-canary clean check");
} catch (error) {
  failures.push(error.stderr?.toString() || error.stack || error.message);
}

if (failures.length > 0) {
  console.error(failures.map((failure) => `- ${failure}`).join("\n"));
  process.exit(1);
}
console.log(
  `Token gates OK (${positives.length} positive, ${canaries.length} canaries).`,
);
console.log(`Positive: ${positives.join(", ")}`);
console.log(`Canaries: ${canaries.join(", ")}`);
