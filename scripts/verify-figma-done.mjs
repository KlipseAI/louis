#!/usr/bin/env node
// `design/manifest.json` 이 `figma: "done"` 이라고 적은 항목마다 **DS-D-0035 의 세 조건을 다시
// 계산한다.**
//
// 왜 있나: 이 저장소는 2026-09-01 까지 `figma: done` 을 「published library key/version 이 있을 때」로
// 정의했고, 게시하지 않기로 한 이상 그 조건은 **아무도 재지 않는 요건**이었다. DS-D-0035 가 그
// 정의를 게시에서 대조로 옮겼는데, 새 정의도 문서에만 적어 두면 같은 종류의 미검사 요건이 된다.
// 특히 조건 (c) 의 뒷절(코드가 실측값을 여전히 만드는지 재는 브라우저 테스트)은 **테스트 파일에서
// 단언 한 줄을 지우면 조용히 사라진다** — 그때 `verify-figma-parity` 는 여전히 초록이다. Figma 와
// 기록이 서로 맞기만 하면 되기 때문이다.
//
// 조건(DS-D-0035):
//   (a) 소비 가능    component set 이 `figma/readback.json` 의 components 에 등재돼 있다.
//                    게시가 아니라 **같은 파일 안에서 인스턴스가 되는가**가 기준이다.
//   (b) parity       `verify-figma-parity.mjs` 의 COMPONENT_CONTRACTS 에 그 이름의 계약이 있다.
//                    그 계약 자체가 「선언되지 않은 Figma property 는 실패」를 강제한다.
//   (c) 두 방향      계약에 `geometry` 가 붙어 `figma/components.measured.json` 의 실측을 가리키고,
//                    **그 measuredId 를 되재는 브라우저 테스트가 있다.**
//
// 이 게이트는 `verify-figma-parity` 를 대신하지 않는다. 저쪽은 값이 맞는지를 보고, 이쪽은
// **그 값을 재는 축이 실제로 걸려 있는지**를 본다.
import { readFileSync, readdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const read = (p) => readFileSync(resolve(repoRoot, p), "utf8");
const readJson = (p) => JSON.parse(read(p));

const manifest = readJson("design/manifest.json");
const readback = readJson("figma/readback.json");
const measured = readJson("figma/components.measured.json");
const PARITY_SOURCE = "scripts/verify-figma-parity.mjs";
const TEST_DIR = "packages/react/test";

const errors = [];

/**
 * COMPONENT_CONTRACTS 를 **텍스트에서** 뜬다.
 *
 * `verify-figma-parity.mjs` 는 그 배열을 export 하지 않고, export 를 붙이려면 그 파일이 import
 * 시점에 하는 일(파일 읽기·검증)이 여기서도 돌아 두 게이트가 얽힌다. 배열 리터럴의 들여쓰기가
 * 계약이므로 — 항목은 두 칸 들여쓴 `{` 로 시작한다 — 그 모양으로 자른다.
 * 모양이 바뀌면 아래 canary 가 먼저 걸린다.
 */
function parseContracts(source) {
  const start = source.indexOf("const COMPONENT_CONTRACTS = [");
  if (start < 0) return null;
  const lines = source.slice(start).split("\n").slice(1);
  const entries = [];
  let current = null;
  for (const line of lines) {
    if (/^ {2}\{\s*$/.test(line)) {
      current = [];
      continue;
    }
    if (/^ {2}\},?\s*$/.test(line) && current) {
      entries.push(current.join("\n"));
      current = null;
      continue;
    }
    if (/^\];?\s*$/.test(line) && !current) break;
    if (current) current.push(line);
  }
  return entries.map((entry) => ({
    id: entry.match(/^ {4}id: "([^"]+)"/m)?.[1] ?? null,
    figmaName: entry.match(/^ {4}figmaName: "([^"]+)"/m)?.[1] ?? null,
    hasGeometry: /^ {4}geometry:/m.test(entry),
    measuredId: entry.match(/measuredId: "([^"]+)"/)?.[1] ?? null,
  }));
}

const contracts = parseContracts(read(PARITY_SOURCE));
if (contracts === null || contracts.length === 0) {
  console.error(
    `[figma-done] ${PARITY_SOURCE} 에서 COMPONENT_CONTRACTS 를 읽지 못했습니다. ` +
      "배열이 사라졌거나 들여쓰기가 바뀌었습니다 — 이 게이트가 조용히 빈 목록으로 통과하지 " +
      "않도록 여기서 멈춥니다.",
  );
  process.exit(1);
}

/**
 * measuredId → 그 실측값을 **코드에서 다시 재는** 브라우저 테스트 파일들.
 *
 * `measured.components.<id>.sizes` / `["<id>"].sizes` 를 읽는 파일만 센다. `states` 는 이미
 * `surface-states.browser.test.tsx` 의 「states 표를 코드가 빠짐없이 읽는다」가 전량 래칫으로
 * 지키지만 `sizes` 에는 그런 래칫이 없다 — 그래서 여기서 본다.
 */
function reverseTests() {
  const map = new Map();
  const files = readdirSync(resolve(repoRoot, TEST_DIR)).filter((n) =>
    n.endsWith(".browser.test.tsx"),
  );
  for (const file of files) {
    const source = read(`${TEST_DIR}/${file}`);
    for (const match of source.matchAll(
      /measured\.components(?:\.([A-Za-z][\w-]*)|\["([^"]+)"\])\.sizes/g,
    )) {
      const id = match[1] ?? match[2];
      if (!map.has(id)) map.set(id, []);
      if (!map.get(id).includes(file)) map.get(id).push(file);
    }
  }
  return map;
}

const reverse = reverseTests();
if (reverse.size === 0) {
  console.error(
    `[figma-done] ${TEST_DIR} 에서 실측 되재기 테스트를 하나도 찾지 못했습니다. ` +
      "조건 (c) 의 뒷절이 통째로 사라졌거나 이 게이트의 스캔이 낡았습니다.",
  );
  process.exit(1);
}

const DECISION = "DS-D-0035";
const namesOf = (item) => {
  const raw = item.figmaNames ?? item.figmaName;
  if (Array.isArray(raw)) return raw;
  return raw === undefined ? [] : [raw];
};

/** 컴포넌트 하나가 (a)(b)(c) 를 만족하는가. 만족하지 않으면 사유 목록을 돌려준다. */
function judge(item) {
  const reasons = [];
  const names = namesOf(item);
  if (names.length === 0) {
    reasons.push("manifest 에 figmaName/figmaNames 가 없어 대조할 Figma set 을 특정할 수 없습니다");
    return reasons;
  }
  for (const name of names) {
    if (readback.components?.[name] === undefined) {
      reasons.push(`(a) ${name} 이 figma/readback.json 의 components 에 없습니다`);
      continue;
    }
    const contract = contracts.find((c) => c.figmaName === name);
    if (contract === undefined) {
      reasons.push(`(b) ${name} 의 계약이 ${PARITY_SOURCE} 의 COMPONENT_CONTRACTS 에 없습니다`);
      continue;
    }
    if (contract.id !== item.id) {
      reasons.push(
        `(b) ${name} 의 계약 id 가 manifest 항목과 다릅니다 — 계약 ${contract.id}, manifest ${item.id}`,
      );
    }
    if (!contract.hasGeometry || contract.measuredId === null) {
      reasons.push(
        `(c) ${name} 의 계약에 geometry 가 없습니다 — Figma 치수가 코드 실측과 만나지 않습니다`,
      );
      continue;
    }
    if (measured.components?.[contract.measuredId] === undefined) {
      reasons.push(
        `(c) ${name} 의 geometry 가 figma/components.measured.json 에 없는 ` +
          `measuredId 를 가리킵니다: ${contract.measuredId}`,
      );
      continue;
    }
    if (!reverse.has(contract.measuredId)) {
      reasons.push(
        `(c) ${name}: ${contract.measuredId} 의 실측값을 코드가 여전히 만드는지 재는 ` +
          `브라우저 테스트가 없습니다. 한 방향만 걸려 있으면 기록과 Figma 를 같이 옮겨 ` +
          "초록을 유지할 수 있습니다",
      );
    }
  }
  return reasons;
}

const promotable = [];
let checked = 0;

for (const item of manifest.components) {
  if (item.figma === "done") {
    checked += 1;
    for (const reason of judge(item)) {
      errors.push(`${item.id} 가 figma: done 인데 ${DECISION} 조건을 만족하지 않습니다 — ${reason}`);
    }
  } else if (item.figma === "partial" && judge(item).length === 0) {
    promotable.push(item.id);
  }
}

// 패턴은 component 가 아니라 template 축으로 대조되고(`figma/templates.measured.json`), 그 값은
// 고정 커밋의 제품 실측이다. DS-D-0035 는 **컴포넌트 축만** 정의했으므로 패턴의 done 은 아직
// 정의가 없다. 정의 없는 승격을 통과시키지 않는다.
for (const item of manifest.patterns) {
  if (item.figma === "done") {
    errors.push(
      `pattern ${item.id} 가 figma: done 입니다. ${DECISION} 는 컴포넌트 축만 정의했습니다 — ` +
        "패턴의 대조 상대인 figma/templates.measured.json 은 고정 커밋의 제품 실측이라 " +
        "「지금 코드가 그 값을 만든다」가 서지 않습니다. 승격하려면 결정을 먼저 확장하세요.",
    );
  }
}

if (errors.length > 0) {
  console.error("[figma-done] " + DECISION + " 조건을 만족하지 않는 승격이 있습니다:");
  for (const error of errors) console.error("  - " + error);
  process.exit(1);
}

console.log(
  `[figma-done] figma: done ${checked}개가 ${DECISION} 의 (a)(b)(c) 를 만족합니다 ` +
    `(계약 ${contracts.length}개, 되재기 테스트가 있는 실측 ${reverse.size}종).` +
    (promotable.length > 0
      ? ` 조건은 서는데 partial 로 남은 항목: ${promotable.join(", ")}`
      : ""),
);
