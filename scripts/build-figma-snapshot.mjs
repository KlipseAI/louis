#!/usr/bin/env node
// Figma 되읽기 원본(figma/readback.json)을 parity 게이트가 읽는 snapshot으로 projection한다.
// 실행: node scripts/build-figma-snapshot.mjs [--check]
//
// 왜 두 파일인가. `readback.json`은 Figma Plugin API가 돌려준 그대로의 evidence이고,
// `snapshot.json`은 그것을 게이트가 비교하기 좋은 tokenId 공간으로 옮긴 projection이다.
// 손으로 쓰지 않는다는 규칙을 지키려면 "손으로 쓰지 않는 경로"가 실제로 존재해야 한다 —
// 이 스크립트가 그 경로다. 이전까지 snapshot은 재현 절차 없이 만들어져 있었다.
//
// readback.json 재생성 절차 (Figma MCP `use_figma`, fileKey는 readback.json의 figmaFileKey):
// 세 번 나눠 호출한다. 한 응답이 20KB를 넘으면 잘리기 때문이다.
//
//   (1) 변수 — 컬렉션마다:
//       const cs = await figma.variables.getLocalVariableCollectionsAsync();
//       const all = await figma.variables.getLocalVariablesAsync();
//       const byId = new Map(all.map((v) => [v.id, v]));
//       const collById = new Map(cs.map((c) => [c.id, c.name]));
//       const r6 = (n) => Math.round(n * 1e6) / 1e6;
//       const c = cs.find((x) => x.name === COLLECTION_NAME);
//       const modeName = new Map(c.modes.map((m) => [m.modeId, m.name]));
//       const rows = [];
//       for (const v of all.filter((x) => x.variableCollectionId === c.id)
//                          .sort((a, b) => (a.name < b.name ? -1 : 1))) {
//         const modes = [];
//         for (const [modeId, raw] of Object.entries(v.valuesByMode)) {
//           const name = modeName.get(modeId);
//           if (name === undefined) continue;
//           if (raw?.type === "VARIABLE_ALIAS") {
//             const t = byId.get(raw.id);
//             modes.push([name, `${collById.get(t.variableCollectionId)}::${t.name}`, null]);
//           } else if (raw && typeof raw === "object" && "r" in raw) {
//             modes.push([name, null, [r6(raw.r), r6(raw.g), r6(raw.b), r6(raw.a)]]);
//           } else modes.push([name, null, raw]);
//         }
//         rows.push([v.name, v.resolvedType, v.scopes.join(","), modes]);
//       }
//       return { modes: c.modes.map((m) => m.name),
//                defaultMode: c.modes.find((m) => m.modeId === c.defaultModeId).name, rows };
//
//   (2) style — `getLocalTextStylesAsync` / `getLocalEffectStylesAsync`를 이름순으로 덤프한다.
//       lineHeightPercent와 letterSpacingPx는 r6으로 반올림한다.
//
//   (3) component — `figma.currentPage`는 매 호출 첫 페이지로 초기화되므로 component가 있는
//       페이지로 `await figma.setCurrentPageAsync(page)`를 먼저 한다. 이 절차 없이 첫 페이지에서
//       세면 component가 조용히 0개로 나온다.
//
//       **`COMPONENT_SET`만 세지 않는다.** variant 축이 없는 컴포넌트(ProjectCard)는 단일
//       `COMPONENT`이고, 그것만 빠뜨리면 계약을 추가해도 "snapshot에 없습니다"로 막힌다.
//       아이콘은 `icon/` 접두사로 이미 분리되므로 그 접두사를 제외한 COMPONENT를 함께 센다.
//
//       컴포넌트마다 다음을 담는다. 값이 전부 **배열**인 이유는 같은 size의 variant가 서로 다르면
//       배열이 길어져 "40개 중 하나만 어긋난" 경우가 보이기 때문이다.
//
//         variantCount / hasDescription / properties / binding / geometry / strokes / effects
//
//       **geometry의 키 규약.** 기본은 Size variant의 값(`md`/`sm`)이고, size 축이 없는
//       컴포넌트는 `base` 하나다(Badge·EmptyState·Checkbox·SelectableListRow). 예외가 하나 있다 —
//       **Size 말고 다른 variant 축이 기하를 바꾸면 `{size}/{variant}` 복합 키로 묶는다**
//       (Slider의 `md/thumb`·`md/track`·`sm/thumb`·`sm/track`). Variant가 레일 두께 4↔28과
//       썸 16↔2×14를 바꾸는데 size 하나로 묶으면 두 값이 한 배열에 섞여 어느 쪽이 어느 변형의
//       것인지 사라지기 때문이다.
//
//       이 규약이 성립하는 이유는 키를 **아무도 해석하지 않기** 때문이다. 이 스크립트는
//       `sortByKey(component.geometry)`로 되읽기가 준 키를 그대로 옮기고,
//       verify-figma-parity는 `Object.entries(measured)`로 measured의 키를 그대로 순회한다.
//       그래서 되읽기와 measured가 같은 키를 쓰기만 하면 비교 코드를 바꾸지 않고 variant별
//       기하가 대조되고, 한 그룹 안에서 값은 여전히 배열이라 "넷 중 하나만 어긋난" 것이 보인다.
//       색만 바뀌고 기하가 같은 축(SegmentedControl의 선택/비선택)은 복합 키로 나누지 않는다.
//
//       geometry[size]에는 root의 값과 함께 **자손**을 담는다. 계약값이 자손에 있는 컴포넌트가
//       있어서(카드의 제목 띠) root만 담으면 게이트가 아무것도 검증하지 못한다.
//
//         parts: { [자손이름]: { width, height, padding*, itemSpacing, layoutMode,
//                               fontSize, fontStyle, lineHeightPercent } }
//         childOrder: card.children.map((c) => c.name)   // 칠 순서가 계약인 컴포넌트용
//
//       effect 직렬화 문법(문자열 완전 일치로 비교되므로 형식을 지킨다):
//         DROP_SHADOW|INNER_SHADOW → `{TYPE}:{offsetY}:{radius}:{spread}`
//         BACKGROUND_BLUR|LAYER_BLUR (NORMAL) → `{TYPE}:{blurType}:{radius|var(figmaName)}`
//         BACKGROUND_BLUR (PROGRESSIVE) →
//           `{TYPE}:PROGRESSIVE:{radius|var(...)}:{startRadius}:{sx},{sy}:{ex},{ey}`
//       여러 겹은 ` + `로 잇는다. 좌표는 r6으로 반올림한다 — Figma는 float32라 0.45가
//       0.44999998807907104로 돌아온다.
//
//       binding은 set 자신의 노드만 센다. 완전히 투명한 fill(opacity 0)은 색이 아니므로 rawFills에
//       세지 않는다 — Figma 배경 흐림이 렌더되려면 그 층에 fill이 있어야 하기 때문에 생기는 것이다.
import { readFileSync, writeFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const checkOnly = process.argv.slice(2).includes("--check");

const READBACK_PATH = "figma/readback.json";
const SNAPSHOT_PATH = "figma/snapshot.json";
const PROPOSAL_PATH = "packages/tokens/generated/figma.tokens.json";
const TOKEN_MANIFEST_PATH = "packages/tokens/generated/manifest.json";
const DESIGN_MANIFEST_PATH = "design/manifest.json";

// Figma에 만들지 않기로 한 tier를 snapshot이 설명하도록 남기는 주석. DS-D-0007이 근거다.
const STYLE_NOTE =
  "semantic tier 이름으로만 생성한다. primitive type-style-*/shadow-*는 Figma 미표현(DS-D-0007).";

const read = (relative) =>
  JSON.parse(readFileSync(resolve(repoRoot, relative), "utf8"));

const readback = read(READBACK_PATH);
const proposal = read(PROPOSAL_PATH);
const tokenManifest = read(TOKEN_MANIFEST_PATH);
const designManifest = read(DESIGN_MANIFEST_PATH);

const proposalSha = createHash("sha256")
  .update(readFileSync(resolve(repoRoot, PROPOSAL_PATH)))
  .digest("hex");

// figmaName은 컬렉션 안에서만 고유하다. `layer/content`는 primitive와 semantic 양쪽에 있다.
// 그래서 조회 키에 컬렉션을 반드시 포함한다 — 빠뜨리면 alias가 엉뚱한 tier를 가리킨다.
const tokenIdByFigmaName = new Map();
const styleTokenIdByFigmaName = new Map();
for (const [collectionName, collection] of Object.entries(
  proposal.collections ?? {},
)) {
  for (const [tokenId, variable] of Object.entries(collection.variables ?? {})) {
    if (variable.representation.startsWith("variable")) {
      tokenIdByFigmaName.set(`${collectionName}::${variable.figmaName}`, tokenId);
    } else if (
      variable.representation === "text-style" ||
      variable.representation === "effect-style"
    ) {
      styleTokenIdByFigmaName.set(variable.figmaName, tokenId);
    }
  }
}

const componentTokenIdByName = new Map(
  // manifest의 name은 사람이 읽는 표시 이름이다("Dialog / Confirm Modal"). Figma 이름으로 쓸 수 없다 —
  // 슬래시가 Figma에서 폴더 구분자가 되어 component set 이름이 쪼개진다. 그래서 figmaName을 따로 둔다.
  // 한 컴포넌트가 Figma에서 여럿으로 나뉠 수 있다 — Menu는 항목과 패널이 별개다.
  (designManifest.components ?? []).flatMap((c) =>
    (c.figmaNames ?? [c.figmaName ?? c.name]).map((figmaName) => [figmaName, c.id]),
  ),
);

const failures = [];
const variables = {};
const collectionsOut = {};
const canonicalLines = [];

for (const [collectionName, collection] of Object.entries(
  readback.collections ?? {},
)) {
  collectionsOut[collectionName] = {
    modes: [...collection.modes],
    defaultMode: collection.defaultMode,
    variableCount: collection.rows.length,
  };

  for (const [figmaName, resolvedType, , modeRows] of collection.rows) {
    const tokenId = tokenIdByFigmaName.get(`${collectionName}::${figmaName}`);
    if (tokenId === undefined) {
      failures.push(
        `proposal에 없는 Figma 변수입니다: ${collectionName}::${figmaName}`,
      );
      continue;
    }

    const valuesByMode = {};
    const canonicalModes = [];
    for (const [modeName, aliasRef, rawValue] of modeRows) {
      if (aliasRef !== null) {
        const aliasTokenId = tokenIdByFigmaName.get(aliasRef);
        if (aliasTokenId === undefined) {
          failures.push(`alias 대상이 proposal에 없습니다: ${aliasRef}`);
          continue;
        }
        valuesByMode[modeName] = { alias: aliasTokenId };
        canonicalModes.push(`${modeName}=A:${aliasRef}`);
      } else {
        // Figma FLOAT는 float32라 1.35가 1.350000023841858로 돌아온다. 6자리에서 접어야
        // proposal의 십진 원본과 같은 값이 된다.
        const value = typeof rawValue === "number" ? round6(rawValue) : rawValue;
        valuesByMode[modeName] = { value };
        canonicalModes.push(`${modeName}=V:${JSON.stringify(value)}`);
      }
    }

    variables[tokenId] = { figmaName, resolvedType, valuesByMode };
    canonicalLines.push(
      `${collectionName}|${figmaName}|${resolvedType}|${canonicalModes.join(";")}`,
    );
  }
}

const stylesOut = { text: {}, effect: {}, note: STYLE_NOTE };
for (const [figmaName, style] of Object.entries(readback.styles?.text ?? {})) {
  const tokenId = styleTokenIdByFigmaName.get(figmaName);
  if (tokenId === undefined) {
    failures.push(`proposal에 없는 text style입니다: ${figmaName}`);
    continue;
  }
  stylesOut.text[figmaName] = {
    tokenId,
    fontFamily: style.fontFamily,
    fontStyle: style.fontStyle,
    fontSize: style.fontSize,
    // parity 기대값은 `Math.round(lineHeight * 1000) / 10`이라 소수 한 자리다. float32
    // 왕복으로 붙은 135.000002를 여기서 접지 않으면 매 덤프마다 무의미한 diff가 생긴다.
    lineHeightPercent: Math.round(style.lineHeightPercent * 10) / 10,
    letterSpacingPx: round6(style.letterSpacingPx),
    boundVariables: [...style.boundVariables].sort(),
  };
}
for (const [figmaName, style] of Object.entries(readback.styles?.effect ?? {})) {
  const tokenId = styleTokenIdByFigmaName.get(figmaName);
  if (tokenId === undefined) {
    failures.push(`proposal에 없는 effect style입니다: ${figmaName}`);
    continue;
  }
  // effect style은 한 겹일 수도 여러 겹일 수도 있다. 여러 겹이면 readback이 layers 배열로 담고
  // parity도 겹 수와 순서를 그대로 비교한다 — 겹이 빠지면 시각이 달라진다.
  const layer = (item) => ({
    offsetY: item.offsetY,
    blur: item.blur,
    spread: item.spread,
    // inset이 없는 예전 행은 바깥 그림자다.
    inset: item.inset === true,
    color: item.color.map(round6),
  });
  stylesOut.effect[figmaName] = Array.isArray(style.layers)
    ? { tokenId, layers: style.layers.map(layer) }
    : { tokenId, type: style.type, ...layer(style) };
}

const componentsOut = {};
let variantTotal = 0;
for (const [figmaName, component] of Object.entries(readback.components ?? {})) {
  const tokenId = componentTokenIdByName.get(figmaName);
  if (tokenId === undefined) {
    failures.push(`design manifest에 없는 component set입니다: ${figmaName}`);
    continue;
  }
  variantTotal += component.variantCount;
  const properties = {};
  for (const [name, definition] of Object.entries(component.properties)) {
    properties[name] = { type: definition.type, options: definition.options };
  }
  componentsOut[figmaName] = {
    tokenId,
    variantCount: component.variantCount,
    hasDescription: component.hasDescription === true,
    properties,
    // binding은 **set 자신의 노드만** 센다. instance 내부는 이 API 표면에서 노출되지 않아
    // (INSTANCE.children이 비어 있다) 여기서 셀 수 없다. 아이콘 instance의 raw 값은 icon 게이트가
    // 각 아이콘 component에서 따로 잡는다.
    binding: { ...component.binding },
    // 크기별 기하. 값마다 배열인 이유는 **같은 size의 variant가 서로 다르면 배열이 길어지기**
    // 때문이다. 대표값 하나만 담으면 40개 중 하나만 어긋난 경우가 보이지 않는다.
    geometry: sortByKey(component.geometry ?? {}),
    // 역할별 stroke와 effect. 두께를 집합으로만 보면 버튼 테두리가 2px이 돼도 spinner의 2와
    // 구분되지 않는다. strokeAlign까지 담는 이유는 CSS border(box-sizing: border-box)가 INSIDE와
    // 같고 CENTER/OUTSIDE로 바뀌면 시각 박스가 달라지기 때문이다.
    strokes: sortByKey(component.strokes ?? {}),
    // effect는 **종류와 순서**까지 담는다. 개수만 보면 INNER_SHADOW가 DROP_SHADOW로 바뀌어도
    // 통과한다. blur는 radius가 변수에 묶였는지도 담는다.
    effects: sortByKey(component.effects ?? {}),
  };
}

// 아이콘은 component set이 아니라 개별 component다. 이름은 `icon/{kebab}` 하나이고 variant가
// 없으므로(iconography.md Figma mapping) components와 다른 절에 둔다.
const ICON_PREFIX = "icon/";
const iconsOut = {};
for (const [figmaName, icon] of Object.entries(readback.icons ?? {})) {
  if (!figmaName.startsWith(ICON_PREFIX)) {
    failures.push(`icon 접두사가 아닌 항목이 icons 절에 있습니다: ${figmaName}`);
    continue;
  }
  iconsOut[figmaName.slice(ICON_PREFIX.length)] = {
    figmaName,
    width: icon.width,
    height: icon.height,
    vectors: icon.vectors,
    strokeWeights: [...icon.strokeWeights].sort((a, b) => a - b),
    strokeCaps: [...icon.strokeCaps].sort(),
    binding: { ...icon.binding },
    hasDescription: icon.hasDescription,
    // description은 설명문이자 검색 채널이다. KEYWORDS: 블록을 파싱해 담는다.
    keywords: [...(icon.keywords ?? [])].sort(),
  };
}

// 재조립 template. 제품 실측값과 대조하기 위한 최소 집합만 담는다 — 좌표를 전부 담으면
// 사람이 프레임을 옮기기만 해도 게이트가 깨져 아무도 안 믿게 된다.
const templatesOut = {};
for (const [name, template] of Object.entries(readback.templates ?? {})) {
  const lineHeights = [...new Set((template.overlayLineHeightPercent ?? []).map(round2))];
  templatesOut[name] = {
    ...template,
    overlayHeightRatio: round2(template.overlayHeightRatio),
    overlayLineHeightPercent: lineHeights.sort((a, b) => a - b),
  };
}

if (failures.length > 0) {
  for (const failure of failures) console.error(`[figma-snapshot] ${failure}`);
  process.exit(1);
}

const canonical = canonicalLines.sort().join("\n");
const snapshot = {
  $comment:
    "GENERATED EVIDENCE — Figma 라이브러리 파일에서 읽어온 상태. 손으로 수정하지 않는다. " +
    "figma/readback.json에서 scripts/build-figma-snapshot.mjs가 생성한다.",
  provenance: {
    figmaFileKey: readback.figmaFileKey,
    figmaFileName: readback.figmaFileName,
    capturedAt: readback.capturedAt,
    capturedBy: readback.capturedBy,
    published: readback.published,
    tokenSourceSha256: tokenManifest.source?.sha256 ?? null,
    proposalSha256: proposalSha,
    readback: {
      tokens: Object.keys(variables).length,
      canonicalLength: canonical.length,
      fnv1a32: fnv1a32(canonical),
      note:
        "변수는 readback.json의 되읽기 행을 tokenId 공간으로 옮긴 것이고, style과 component는 " +
        "같은 되읽기의 style/component 절이다. canonical 해시는 컬렉션·이름·타입·mode 값을 " +
        "정렬해 이은 문자열의 FNV-1a다.",
      styles: {
        text: Object.keys(stylesOut.text).length,
        effect: Object.keys(stylesOut.effect).length,
      },
      components: {
        sets: Object.keys(componentsOut).length,
        variants: variantTotal,
      },
      icons: Object.keys(iconsOut).length,
      templates: Object.keys(templatesOut).length,
    },
  },
  collections: collectionsOut,
  variables: sortByKey(variables),
  styles: {
    text: sortByKey(stylesOut.text),
    effect: sortByKey(stylesOut.effect),
    note: STYLE_NOTE,
  },
  components: sortByKey(componentsOut),
  icons: sortByKey(iconsOut),
  templates: sortByKey(templatesOut),
};

const serialized = `${JSON.stringify(snapshot, null, 2)}\n`;
const snapshotFile = resolve(repoRoot, SNAPSHOT_PATH);

if (checkOnly) {
  let current = null;
  try {
    current = readFileSync(snapshotFile, "utf8");
  } catch {
    console.error(`[figma-snapshot] snapshot이 없습니다: ${SNAPSHOT_PATH}`);
    process.exit(1);
  }
  if (current !== serialized) {
    console.error(
      `[figma-snapshot] drift: ${SNAPSHOT_PATH}가 readback에서 생성한 결과와 다릅니다. ` +
        "`node scripts/build-figma-snapshot.mjs`로 재생성하십시오.",
    );
    process.exit(1);
  }
  console.log(
    `[figma-snapshot] check OK (변수 ${Object.keys(variables).length}개, ` +
      `style ${Object.keys(stylesOut.text).length + Object.keys(stylesOut.effect).length}개, ` +
      `component ${Object.keys(componentsOut).length}개, icon ${Object.keys(iconsOut).length}개)`,
  );
} else {
  writeFileSync(snapshotFile, serialized);
  console.log(
    `[figma-snapshot] built: 변수 ${Object.keys(variables).length}개, ` +
      `style ${Object.keys(stylesOut.text).length + Object.keys(stylesOut.effect).length}개, ` +
      `component ${Object.keys(componentsOut).length}개, icon ${Object.keys(iconsOut).length}개, template ${Object.keys(templatesOut).length}개`,
  );
}

function round2(value) {
  return Math.round(value * 100) / 100;
}

function round6(value) {
  return Math.round(value * 1e6) / 1e6;
}

function sortByKey(object) {
  const out = {};
  for (const key of Object.keys(object).sort()) out[key] = object[key];
  return out;
}

function fnv1a32(text) {
  let hash = 0x811c9dc5;
  for (let i = 0; i < text.length; i += 1) {
    hash ^= text.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193) >>> 0;
  }
  return hash.toString(16).padStart(8, "0");
}
