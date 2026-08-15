#!/usr/bin/env node
// Figma 라이브러리 snapshot과 generated proposal의 parity를 credential 없이 검증한다.
// 실행: node scripts/verify-figma-parity.mjs [--snapshot <path>] [--no-canary]
//
// snapshot은 Figma에서 읽어온 evidence이며 손으로 수정하지 않는다. Figma 접근 실패를
// 통과로 캐시하지 않기 위해, 이 스크립트는 snapshot이 없으면 실패한다.
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const argv = process.argv.slice(2);
const snapshotIndex = argv.indexOf("--snapshot");
const snapshotPath =
  snapshotIndex === -1 ? "figma/snapshot.json" : argv[snapshotIndex + 1];
const runCanary = !argv.includes("--no-canary");

const PROPOSAL_PATH = "packages/tokens/generated/figma.tokens.json";
const MANIFEST_PATH = "packages/tokens/generated/manifest.json";

function readJson(relative) {
  return JSON.parse(readFileSync(resolve(repoRoot, relative), "utf8"));
}

const proposal = readJson(PROPOSAL_PATH);
const manifest = readJson(MANIFEST_PATH);
const proposalSha = createHash("sha256")
  .update(readFileSync(resolve(repoRoot, PROPOSAL_PATH)))
  .digest("hex");

let snapshot;
try {
  snapshot = readJson(snapshotPath);
} catch (error) {
  console.error(
    `[figma-parity] snapshot을 읽을 수 없습니다: ${snapshotPath} (${error.message})`,
  );
  process.exit(1);
}

// 코드 컴포넌트 ↔ Figma component set 계약 (DS-F-006).
// Figma에만 있는 property는 사유와 함께 선언해야 통과한다. 선언되지 않은 property는 실패다.
const COMPONENT_CONTRACTS = [
  {
    id: "button",
    figmaName: "Button",
    declaration: "packages/react/dist/button/button.d.ts",
    // Figma variant property 이름 → 코드에서 같은 집합을 정의하는 타입 alias
    variantProperties: { Variant: "ButtonVariant", Size: "ButtonSize" },
    figmaOnlyProperties: {
      State: {
        options: ["Default", "Hover", "Pressed", "Disabled", "Loading"],
        reason:
          "Hover/Pressed는 코드에서 CSS 상태이고 Loading/Disabled는 boolean prop이다. Figma에는 CSS 상태가 없어 variant로 둔다.",
      },
    },
  },
];

const expectation = buildExpectation(proposal);

const failures = compare(snapshot, expectation);
const warnings = staleness(snapshot);

// 게이트가 실제로 실패할 수 있는지 보증한다.
//
// canary는 실패가 이미 있는 상태에서도 돌아야 한다. `failures.length === 0`으로 감싸면
// parity가 깨진 동안 검출력 증명이 통째로 멈추고, 그 사이 canary 자체가 망가져도 아무도
// 모른다 — 게이트가 가장 못 미더운 시점에 게이트의 보증이 사라지는 순서다.
//
// 그래서 판정 기준을 "변조 후 실패가 있는가"가 아니라 **"변조가 baseline에 없던 실패를
// 새로 만드는가"**로 바꾼다. baseline이 비어 있으면 두 기준은 정확히 같다.
if (runCanary) {
  const baseline = new Set(failures);
  const canaryFailures = [];
  for (const mutate of [
    tamperValue,
    tamperAlias,
    tamperCollection,
    tamperModeOrder,
    tamperStyle,
    tamperComponentVariant,
    tamperComponentBinding,
  ]) {
    const copy = JSON.parse(JSON.stringify(snapshot));
    const label = mutate(copy, expectation);
    if (!label) continue;
    const introduced = compare(copy, expectation).filter((f) => !baseline.has(f));
    if (introduced.length === 0) {
      canaryFailures.push(
        baseline.size === 0
          ? `canary가 변조를 잡지 못했습니다: ${label}`
          : `canary의 검출력을 증명하지 못했습니다 — 기존 실패에 가려집니다: ${label}`,
      );
    }
  }
  if (canaryFailures.length > 0) {
    for (const failure of canaryFailures) console.error(`[figma-parity] ${failure}`);
    process.exit(1);
  }
}

for (const warning of warnings) console.warn(`[figma-parity] 경고: ${warning}`);
if (failures.length > 0) {
  for (const failure of failures) console.error(`[figma-parity] ${failure}`);
  process.exit(1);
}
console.log(
  `[figma-parity] parity OK (변수 ${expectation.variables.size}개, collection ` +
    `${expectation.collections.size}개, style ${expectation.styles.size}개, ` +
    `component ${COMPONENT_CONTRACTS.length}개, ` +
    `미표현 ${expectation.nonVariableCount - expectation.styles.size}개 제외` +
    `${runCanary ? ", 변조 canary 7종" : ""})`,
);

function buildExpectation(document) {
  const createdIds = new Set();
  let nonVariableCount = 0;
  for (const collection of Object.values(document.collections ?? {})) {
    for (const [id, variable] of Object.entries(collection.variables ?? {})) {
      if (variable.representation.startsWith("variable")) createdIds.add(id);
      else nonVariableCount += 1;
    }
  }

  const variables = new Map();
  const collections = new Map();
  const nonVariables = new Map();
  const styles = new Map();
  for (const [name, collection] of Object.entries(document.collections ?? {})) {
    let count = 0;
    for (const [id, variable] of Object.entries(collection.variables ?? {})) {
      if (!variable.representation.startsWith("variable")) {
        nonVariables.set(id, variable.representation);
        if (
          variable.representation === "text-style" ||
          variable.representation === "effect-style"
        ) {
          styles.set(id, {
            representation: variable.representation,
            figmaName: variable.figmaName,
            attributes: styleAttributes(
              variable.representation,
              Object.values(variable.valuesByMode)[0].resolvedValue,
            ),
          });
        }
        continue;
      }
      count += 1;
      const valuesByMode = {};
      // proposal의 valuesByMode 키는 이미 Figma mode 이름(Base/Global/Light/Dark)이다.
      for (const [modeName, value] of Object.entries(variable.valuesByMode)) {
        const alias = value.aliasTarget;
        valuesByMode[modeName] =
          alias && createdIds.has(alias.id)
            ? { alias: alias.id }
            : {
                value: resolvedToFigmaValue(
                  value.resolvedValue,
                  variable.nativeVariableType,
                ),
              };
      }
      variables.set(id, {
        collection: name,
        figmaName: variable.figmaName,
        resolvedType: variable.nativeVariableType,
        valuesByMode,
      });
    }
    collections.set(name, {
      modes: [...(collection.modes ?? [])],
      defaultMode: collection.defaultMode ?? collection.modes?.[0],
      variableCount: count,
    });
  }
  return { variables, collections, nonVariables, nonVariableCount, styles };
}

function styleAttributes(representation, resolved) {
  const fontStyleForWeight = { 400: "Regular", 500: "Medium", 600: "SemiBold" };
  if (representation === "text-style") {
    return {
      fontStyle: fontStyleForWeight[resolved.fontWeight] ?? null,
      fontSize: resolved.fontSize.value,
      lineHeightPercent: Math.round(resolved.lineHeight * 1000) / 10,
      letterSpacingPx: resolved.letterSpacing.value,
    };
  }
  const [r, g, b] = resolved.color.components;
  const round = (value) => Math.round(value * 1e6) / 1e6;
  return {
    offsetY: resolved.offsetY.value,
    blur: resolved.blur.value,
    spread: resolved.spread.value,
    color: [round(r), round(g), round(b), resolved.color.alpha ?? 1],
  };
}

function compare(document, expected) {
  const issues = [];
  const actualCollections = document.collections ?? {};
  const actualVariables = document.variables ?? {};

  for (const [name, want] of expected.collections) {
    const got = actualCollections[name];
    if (!got) {
      issues.push(`collection이 snapshot에 없습니다: ${name}`);
      continue;
    }
    // 순서를 정렬하지 않고 그대로 비교한다. Figma는 첫 mode를 default로 쓰므로
    // 순서가 CSS의 `:root`(light) 계약과 어긋나면 라이브러리 기본 표시가 틀린다.
    const gotModes = [...(got.modes ?? [])];
    if (JSON.stringify(gotModes) !== JSON.stringify(want.modes)) {
      issues.push(
        `collection mode 순서 불일치: ${name} — 기대 ${want.modes.join("/")}, 실제 ${gotModes.join("/")}`,
      );
    }
    if (got.defaultMode !== want.defaultMode) {
      issues.push(
        `collection default mode 불일치: ${name} — 기대 ${want.defaultMode}, 실제 ${got.defaultMode}`,
      );
    }
    if (got.variableCount !== want.variableCount) {
      issues.push(
        `collection 변수 수 불일치: ${name} — 기대 ${want.variableCount}, 실제 ${got.variableCount}`,
      );
    }
  }
  for (const name of Object.keys(actualCollections)) {
    if (!expected.collections.has(name)) {
      issues.push(`proposal이 선언하지 않은 collection이 있습니다: ${name}`);
    }
  }

  for (const [id, want] of expected.variables) {
    const got = actualVariables[id];
    if (!got) {
      issues.push(`변수가 snapshot에 없습니다: ${id}`);
      continue;
    }
    if (got.figmaName !== want.figmaName) {
      issues.push(
        `figmaName 불일치: ${id} — 기대 ${want.figmaName}, 실제 ${got.figmaName}`,
      );
    }
    if (got.resolvedType !== want.resolvedType) {
      issues.push(
        `type 불일치: ${id} — 기대 ${want.resolvedType}, 실제 ${got.resolvedType}`,
      );
    }
    const wantModes = Object.keys(want.valuesByMode).sort();
    const gotModes = Object.keys(got.valuesByMode ?? {}).sort();
    if (JSON.stringify(wantModes) !== JSON.stringify(gotModes)) {
      issues.push(
        `mode 집합 불일치: ${id} — 기대 ${wantModes.join("/")}, 실제 ${gotModes.join("/")}`,
      );
      continue;
    }
    for (const mode of wantModes) {
      const wantValue = want.valuesByMode[mode];
      const gotValue = got.valuesByMode[mode];
      if (wantValue.alias !== undefined) {
        if (gotValue.alias !== wantValue.alias) {
          issues.push(
            `alias 불일치: ${id}@${mode} — 기대 ${wantValue.alias}, 실제 ${gotValue.alias ?? JSON.stringify(gotValue)}`,
          );
        }
        continue;
      }
      if (gotValue.alias !== undefined) {
        issues.push(`값이어야 할 항목이 alias입니다: ${id}@${mode}`);
        continue;
      }
      if (!valueEqual(gotValue.value, wantValue.value)) {
        issues.push(
          `값 불일치: ${id}@${mode} — 기대 ${JSON.stringify(wantValue.value)}, 실제 ${JSON.stringify(gotValue.value)}`,
        );
      }
    }
  }
  for (const id of Object.keys(actualVariables)) {
    if (!expected.variables.has(id)) {
      issues.push(`proposal이 선언하지 않은 변수가 snapshot에 있습니다: ${id}`);
    }
  }

  // 미표현·style로 분류된 토큰이 변수로 새어 나오면 안 된다.
  for (const [id, representation] of expected.nonVariables) {
    if (actualVariables[id]) {
      issues.push(`${representation}로 분류된 토큰이 변수로 존재합니다: ${id}`);
    }
  }

  // style 비교 — text/effect
  const actualStyles = {
    "text-style": document.styles?.text ?? {},
    "effect-style": document.styles?.effect ?? {},
  };
  const seenStyleNames = { "text-style": new Set(), "effect-style": new Set() };
  for (const [id, want] of expected.styles) {
    const bucket = actualStyles[want.representation];
    const got = bucket?.[want.figmaName];
    seenStyleNames[want.representation].add(want.figmaName);
    if (!got) {
      issues.push(`${want.representation}이 snapshot에 없습니다: ${want.figmaName} (${id})`);
      continue;
    }
    if (got.tokenId !== id) {
      issues.push(
        `style tokenId 불일치: ${want.figmaName} — 기대 ${id}, 실제 ${got.tokenId}`,
      );
    }
    for (const [field, wantValue] of Object.entries(want.attributes)) {
      const gotValue = got[field];
      if (!valueEqual(gotValue, wantValue)) {
        issues.push(
          `style ${field} 불일치: ${want.figmaName} — 기대 ${JSON.stringify(wantValue)}, 실제 ${JSON.stringify(gotValue)}`,
        );
      }
    }
  }
  for (const [representation, bucket] of Object.entries(actualStyles)) {
    for (const name of Object.keys(bucket)) {
      if (!seenStyleNames[representation].has(name)) {
        issues.push(`proposal이 선언하지 않은 ${representation}이 있습니다: ${name}`);
      }
    }
  }

  issues.push(...compareComponents(document.components ?? {}));
  return issues;
}

// 코드 타입 alias의 문자열 union 멤버를 뽑는다. tsc가 결정론적으로 생성하는 파일이다.
function unionMembers(declarationSource, typeName) {
  const pattern = new RegExp(
    `type\\s+${typeName}\\s*=\\s*([^;]+);`,
    "m",
  );
  const match = pattern.exec(declarationSource);
  if (match?.[1] === undefined) return null;
  return [...match[1].matchAll(/"([^"]+)"/g)].map((entry) => entry[1]);
}

function compareComponents(actualComponents) {
  const issues = [];
  const seen = new Set();

  for (const contract of COMPONENT_CONTRACTS) {
    seen.add(contract.figmaName);
    const got = actualComponents[contract.figmaName];
    if (!got) {
      issues.push(`component set이 snapshot에 없습니다: ${contract.figmaName}`);
      continue;
    }
    if (got.tokenId !== contract.id) {
      issues.push(
        `component id 불일치: ${contract.figmaName} — 기대 ${contract.id}, 실제 ${got.tokenId}`,
      );
    }

    let declarationSource;
    try {
      declarationSource = readFileSync(
        resolve(repoRoot, contract.declaration),
        "utf8",
      );
    } catch {
      issues.push(
        `코드 선언을 읽을 수 없습니다: ${contract.declaration} — 먼저 pnpm build:react를 실행합니다.`,
      );
      continue;
    }

    const properties = got.properties ?? {};
    for (const [figmaProperty, codeType] of Object.entries(
      contract.variantProperties,
    )) {
      const codeOptions = unionMembers(declarationSource, codeType);
      if (codeOptions === null) {
        issues.push(`코드 타입을 찾지 못했습니다: ${codeType}`);
        continue;
      }
      const figmaOptions = properties[figmaProperty]?.options;
      if (!Array.isArray(figmaOptions)) {
        issues.push(
          `Figma property가 없습니다: ${contract.figmaName}.${figmaProperty}`,
        );
        continue;
      }
      if (JSON.stringify([...figmaOptions].sort()) !== JSON.stringify([...codeOptions].sort())) {
        issues.push(
          `variant 옵션 불일치: ${contract.figmaName}.${figmaProperty} — 코드 ${codeType}=[${codeOptions.join(", ")}], Figma=[${figmaOptions.join(", ")}]`,
        );
      }
    }

    for (const [figmaProperty, declared] of Object.entries(
      contract.figmaOnlyProperties ?? {},
    )) {
      const figmaOptions = properties[figmaProperty]?.options;
      if (!Array.isArray(figmaOptions)) {
        issues.push(
          `선언된 Figma 전용 property가 없습니다: ${contract.figmaName}.${figmaProperty}`,
        );
        continue;
      }
      if (
        JSON.stringify([...figmaOptions].sort()) !==
        JSON.stringify([...declared.options].sort())
      ) {
        issues.push(
          `Figma 전용 property 옵션 불일치: ${contract.figmaName}.${figmaProperty} — 선언 [${declared.options.join(", ")}], 실제 [${figmaOptions.join(", ")}]`,
        );
      }
    }

    const declaredProperties = new Set([
      ...Object.keys(contract.variantProperties),
      ...Object.keys(contract.figmaOnlyProperties ?? {}),
    ]);
    for (const name of Object.keys(properties)) {
      if (!declaredProperties.has(name)) {
        issues.push(
          `선언되지 않은 Figma property가 있습니다: ${contract.figmaName}.${name}`,
        );
      }
    }

    // raw 값 사용 0 — 모든 시각 속성이 변수·style에 바인딩돼야 한다 (DS-F-006).
    const binding = got.binding ?? {};
    for (const field of ["rawFills", "rawStrokes", "textUnstyled"]) {
      if ((binding[field] ?? 0) !== 0) {
        issues.push(
          `${contract.figmaName}에 바인딩되지 않은 값이 있습니다: ${field}=${binding[field]}`,
        );
      }
    }
  }

  for (const name of Object.keys(actualComponents)) {
    if (!seen.has(name)) {
      issues.push(`계약에 없는 component set이 있습니다: ${name}`);
    }
  }
  return issues;
}

function staleness(document) {
  const notes = [];
  if (document.provenance?.tokenSourceSha256 !== manifest.source?.sha256) {
    notes.push(
      "stale snapshot: token source가 snapshot 캡처 이후 바뀌었습니다. " +
        "Figma 라이브러리를 다시 적용하고 snapshot을 재덤프해야 합니다.",
    );
  }
  if (document.provenance?.proposalSha256 !== proposalSha) {
    notes.push(
      "stale snapshot: generated proposal이 snapshot 캡처 이후 바뀌었습니다.",
    );
  }
  return notes;
}

function tamperValue(document, expected) {
  for (const [id, want] of expected.variables) {
    for (const [mode, value] of Object.entries(want.valuesByMode)) {
      if (value.alias !== undefined) continue;
      const target = document.variables?.[id]?.valuesByMode?.[mode];
      if (!target || target.value === undefined) continue;
      target.value = Array.isArray(target.value)
        ? [0.123456, ...target.value.slice(1)]
        : typeof target.value === "number"
          ? target.value + 7
          : `${target.value}-tampered`;
      return `값 변조 ${id}@${mode}`;
    }
  }
  return null;
}

function tamperAlias(document, expected) {
  for (const [id, want] of expected.variables) {
    for (const [mode, value] of Object.entries(want.valuesByMode)) {
      if (value.alias === undefined) continue;
      const target = document.variables?.[id]?.valuesByMode?.[mode];
      if (!target) continue;
      target.alias = "color-tampered-target";
      return `alias 변조 ${id}@${mode}`;
    }
  }
  return null;
}

function tamperCollection(document, expected) {
  const [name] = [...expected.collections.keys()];
  if (!name || !document.collections?.[name]) return null;
  document.collections[name].variableCount += 1;
  return `collection 변수 수 변조 ${name}`;
}

function tamperModeOrder(document, expected) {
  for (const [name, want] of expected.collections) {
    if (want.modes.length < 2) continue;
    const target = document.collections?.[name];
    if (!target) continue;
    target.modes = [...target.modes].reverse();
    target.defaultMode = target.modes[0];
    return `mode 순서 변조 ${name}`;
  }
  return null;
}

function tamperStyle(document, expected) {
  for (const [, want] of expected.styles) {
    const bucket =
      want.representation === "text-style"
        ? document.styles?.text
        : document.styles?.effect;
    const target = bucket?.[want.figmaName];
    if (!target) continue;
    const [field, value] = Object.entries(want.attributes)[0];
    target[field] = typeof value === "number" ? value + 11 : `${value}-tampered`;
    return `style ${field} 변조 ${want.figmaName}`;
  }
  return null;
}

function tamperComponentVariant(document) {
  for (const contract of COMPONENT_CONTRACTS) {
    const target = document.components?.[contract.figmaName];
    const [property] = Object.keys(contract.variantProperties);
    const options = target?.properties?.[property]?.options;
    if (!Array.isArray(options)) continue;
    options.push("__tampered__");
    return `component variant 옵션 변조 ${contract.figmaName}.${property}`;
  }
  return null;
}

function tamperComponentBinding(document) {
  for (const contract of COMPONENT_CONTRACTS) {
    const target = document.components?.[contract.figmaName];
    if (!target?.binding) continue;
    target.binding.rawFills = 3;
    return `component raw 값 변조 ${contract.figmaName}`;
  }
  return null;
}

function resolvedToFigmaValue(resolved, nativeType) {
  if (nativeType === "COLOR") {
    const [r, g, b] = resolved.components;
    const round = (value) => Math.round(value * 1e6) / 1e6;
    return [round(r), round(g), round(b), resolved.alpha ?? 1];
  }
  if (nativeType === "FLOAT") {
    return typeof resolved === "object" ? resolved.value : resolved;
  }
  if (Array.isArray(resolved)) return resolved.join(", ");
  if (resolved && typeof resolved === "object" && resolved.timingFunction) {
    const timing = resolved.timingFunction.join(", ");
    return `${resolved.duration.value}ms cubic-bezier(${timing}) delay ${resolved.delay.value}ms`;
  }
  return String(resolved);
}

function valueEqual(left, right) {
  if (Array.isArray(left) && Array.isArray(right)) {
    return (
      left.length === right.length &&
      left.every((value, index) => nearlyEqual(value, right[index]))
    );
  }
  if (typeof left === "number" && typeof right === "number") {
    return nearlyEqual(left, right);
  }
  return left === right;
}

function nearlyEqual(left, right) {
  return Math.abs(Number(left) - Number(right)) <= 1e-5;
}
