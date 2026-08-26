#!/usr/bin/env node
// 살아 있는 Figma ↔ figma/readback.json 대조.
//
// ## 왜 있는가
//
// `verify-figma-parity` 는 **계약과 스냅숏**을 대조한다. 스냅숏(`readback.json`)은 사람이
// Figma 에서 떠 와야 하는 파일이라, **Figma 를 고치고 되읽기를 빠뜨리면 게이트가 초록인 채로
// 어긋난다.** 실제로 두 번 그랬다 — 컴포넌트를 세우고 문서·계약을 안 붙였고, 다음에는 스킨 축을
// 없애고 LOUIS 를 안 맞췄다. 둘 다 게이트는 통과했고, 사람이 물어봐서 드러났다.
//
// DS-D-0028(세 곳 동시 반영)은 **규칙**이고 이 스크립트는 그 규칙의 **관측 장치**다. 규칙만으로는
// 안 지켜진다는 것이 이미 증명됐다.
//
// ## 쓰는 법
//
//   node scripts/figma-live-check.mjs --emit          # Figma 에 붙여 넣을 코드를 뽑는다
//   node scripts/figma-live-check.mjs --check live.json  # 그 결과를 스냅숏과 대조한다
//
// `--emit` 이 뱉는 코드를 `use_figma` 로 실행해 나온 JSON 을 파일로 저장한 뒤 `--check` 에 준다.
// 어긋나면 **무엇이 어긋났는지 이름 단위로** 찍고 종료 코드 1 을 낸다.
//
// CI 에서는 돌 수 없다 — Figma 접근이 필요하다. **Figma 를 건드린 작업의 마지막 단계**로 돌린다.
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const READBACK = "figma/readback.json";

/** Figma 안에서 돌릴 코드. 응답이 작아야 하므로 **이름과 축만** 뜬다 — 기하·색은 되읽기의 일이다. */
const PROBE = `const page = figma.root.children.find(p => p.name === "DS · Components");
await figma.setCurrentPageAsync(page);
const out = {};
for (const n of page.children) {
  if (n.type !== "COMPONENT_SET" && n.type !== "COMPONENT") continue;
  const props = {};
  for (const [raw, def] of Object.entries(n.componentPropertyDefinitions || {})) {
    const key = raw.includes("#") ? raw.slice(0, raw.indexOf("#")) : raw;
    props[key] = def.type === "VARIANT" ? def.variantOptions.slice().sort() : def.type;
  }
  out[n.name] = {
    variantCount: n.type === "COMPONENT_SET" ? n.children.length : 1,
    hasDescription: (n.description || "").length > 0,
    props,
  };
}
return out;`;

const args = process.argv.slice(2);
const read = (p) => JSON.parse(readFileSync(resolve(repoRoot, p), "utf8"));

if (args.includes("--emit") || args.length === 0) {
  process.stdout.write(`${PROBE}\n`);
  if (args.length === 0) {
    process.stderr.write(
      "\n[figma-live] 위 코드를 use_figma 로 실행하고, 결과를 파일로 저장한 뒤\n" +
        "            node scripts/figma-live-check.mjs --check <파일> 을 돌리세요.\n",
    );
  }
  process.exit(0);
}

const idx = args.indexOf("--check");
if (idx === -1 || !args[idx + 1]) {
  process.stderr.write("[figma-live] --check <파일> 이 필요합니다.\n");
  process.exit(2);
}

const live = read(args[idx + 1]);
const snapshot = read(READBACK).components ?? {};
const issues = [];

const sortedKeys = (o) => Object.keys(o).sort();
for (const name of sortedKeys(live)) {
  const got = live[name];
  const want = snapshot[name];
  if (want === undefined) {
    issues.push(
      `Figma 에만 있습니다: ${name} (variant ${got.variantCount}) — 되읽기를 다시 뜨고 계약·문서를 붙이세요.`,
    );
    continue;
  }
  if (got.variantCount !== want.variantCount) {
    issues.push(
      `variant 수가 다릅니다: ${name} — 스냅숏 ${want.variantCount}, 실제 ${got.variantCount}`,
    );
  }
  if (got.hasDescription !== want.hasDescription) {
    issues.push(`description 유무가 다릅니다: ${name}`);
  }
  const wantProps = want.properties ?? {};
  for (const key of sortedKeys(got.props)) {
    const w = wantProps[key];
    if (w === undefined) {
      issues.push(`property 가 스냅숏에 없습니다: ${name}.${key}`);
      continue;
    }
    const wantValue = w.type === "VARIANT" ? [...(w.options ?? [])].sort() : w.type;
    const gotValue = got.props[key];
    if (JSON.stringify(wantValue) !== JSON.stringify(gotValue)) {
      issues.push(
        `property 가 다릅니다: ${name}.${key} — 스냅숏 ${JSON.stringify(wantValue)}, 실제 ${JSON.stringify(gotValue)}`,
      );
    }
  }
  for (const key of sortedKeys(wantProps)) {
    if (got.props[key] === undefined) {
      issues.push(`property 가 Figma 에서 사라졌습니다: ${name}.${key}`);
    }
  }
}
for (const name of sortedKeys(snapshot)) {
  if (live[name] === undefined) {
    issues.push(`스냅숏에만 있습니다: ${name} — Figma 에서 지웠다면 되읽기와 계약에서도 지우세요.`);
  }
}

if (issues.length > 0) {
  for (const issue of issues) process.stderr.write(`[figma-live] ${issue}\n`);
  process.stderr.write(
    `[figma-live] 어긋남 ${issues.length}건. **Figma 가 앞서 있습니다** — DS-D-0028 은 세 곳을 같은 작업에서 맞추라고 정합니다.\n`,
  );
  process.exit(1);
}

process.stdout.write(
  `[figma-live] OK (component ${Object.keys(live).length}개, 스냅숏과 이름·축·description 이 모두 같습니다)\n`,
);
