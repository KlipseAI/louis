#!/usr/bin/env node
// DS 기록의 `$` 주석이 **인용한 토큰이 실재하고 값이 맞는지** 확인한다.
//
// 기록의 값은 셋 중 하나로 정당화된다 — ① 제품 렌더와 대조되거나 ② `$키` 주석이 왜 그 값인지
// 적거나 ③ 빚 명부에 있거나. `measure-product-components.mjs`가 그 셋 중 하나임을 강제한다.
// **그런데 ②의 내용이 참인지는 아무도 보지 않았다.** 주석은 산문이라 무엇을 적어도 통과했다.
//
// 2026-08-30 감사에서 그 구멍이 드러났다. `ddc333a`가 컨트롤 계단을 개명하면서(구 md → lg ·
// 구 sm → md) **값은 옮겼는데 사유 문장은 그대로 두었다.** 그 결과:
//
//   input.sizes.lg.$height        "layout-control-height-md 40"   ← 40은 이제 -lg 다
//   icon-button.sizes.md.$height  "layout-control-height-sm 32"   ← 그런 토큰은 없다
//   input.sizes.md.$paddingInline "space-control-sm 12"           ← space-control-sm 은 8 이다
//   avatar.sizes.md.$radius       "radius-full 999"               ← 이름은 radius-pill 이다
//
// 24건이 이런 상태였다. 값이 기계 대조를 받지 않는 축일수록 주석이 유일한 근거인데, 그 근거가
// 존재하지 않는 이름을 가리키고 있었다. **읽는 사람이 확인할 수 없는 근거는 근거가 아니다.**
//
// 두 가지를 실패로 만든다.
//   없는 이름  토큰처럼 생긴 이름을 인용했는데 그런 토큰이 없다. 계단 이름 무리(`-lg`/`-md`)의
//              한 칸을 가리키는 것도 여기 걸린다.
//   틀린 값    `"<토큰> <숫자>"` 꼴로 적었는데 그 토큰의 실제 값이 그 숫자가 아니다.
//
// 산문이 계열 이름만 부르는 것(`typography-body-sm`처럼 실제 토큰들의 접두사)은 통과시킨다 —
// 그건 오기가 아니라 무리를 가리키는 정상적인 말이다.
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const tokensCss = readFileSync(resolve(repoRoot, "packages/tokens/generated/tokens.css"), "utf8");

// 토큰 이름 → 값. 같은 이름이 테마별로 여러 번 나오면 처음 것을 쓴다 — 기하 토큰은 테마를 타지
// 않고, 색은 아래 FAMILIES가 보지 않는다.
const TOKENS = new Map();
for (const match of tokensCss.matchAll(/^\s*--louis-([a-z0-9-]+):\s*(.+);\s*$/gm)) {
  if (!TOKENS.has(match[1])) TOKENS.set(match[1], match[2].trim());
}
if (TOKENS.size === 0) {
  console.error("[record-citations] tokens.css에서 토큰을 한 개도 읽지 못했습니다.");
  process.exit(1);
}

// 볼 계열. 색과 타이포 값은 각자 다른 게이트가 보고, 여기서는 **기하·모션**만 본다 —
// 계단 개명이 실제로 망가뜨린 곳이 거기다.
const FAMILIES = ["layout", "space", "radius", "border-width", "icon-size", "motion", "elevation", "blur"];
const NAME = new RegExp(String.raw`\b((?:${FAMILIES.join("|")})-[a-z0-9-]+)\b`, "g");

// 그 이름이 정말 토큰인가, 아니면 토큰 무리를 부르는 계열 이름인가.
const isFamilyPrefix = (name) => {
  for (const key of TOKENS.keys()) if (key.startsWith(name + "-")) return true;
  return false;
};

const numberOf = (value) => {
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) ? parsed : null;
};

export function auditRecord(components) {
  const failures = [];
  const checked = [];

  const walk = (node, path) => {
    if (node === null || typeof node !== "object" || Array.isArray(node)) return;
    for (const [key, value] of Object.entries(node)) {
      if (value !== null && typeof value === "object" && !Array.isArray(value)) {
        walk(value, [...path, key]);
        continue;
      }
      if (!key.startsWith("$") || typeof value !== "string") continue;
      const where = [...path, key].join(".");
      const sibling = node[key.slice(1)];

      for (const match of value.matchAll(NAME)) {
        const name = match[1].replace(/[.,)]+$/, "");
        if (!TOKENS.has(name)) {
          if (isFamilyPrefix(name)) continue; // 계열 이름이다 — 오기가 아니다
          failures.push(
            where + ': 존재하지 않는 토큰 "' + name + '"을 인용합니다. ' +
              "사유의 근거가 확인할 수 없는 이름을 가리킵니다.",
          );
          continue;
        }
        checked.push(where + " → " + name);
      }

      // `"<토큰> <숫자>"` 로 시작하는 주석은 그 숫자가 토큰의 값이어야 한다.
      const leading = /^([a-z0-9-]+)\s+(-?[\d.]+)\b/.exec(value);
      if (!leading) continue;
      const [, name, stated] = leading;
      if (!TOKENS.has(name)) continue; // 위에서 이미 잡혔거나 계열 이름이다
      const tokenValue = numberOf(TOKENS.get(name));
      const statedValue = numberOf(stated);
      if (tokenValue === null || statedValue === null) continue;
      if (tokenValue !== statedValue) {
        failures.push(
          where + ': "' + name + " " + stated + '"라고 적었는데 그 토큰의 값은 ' +
            TOKENS.get(name) + " 입니다.",
        );
        continue;
      }
      // 주석이 값을 옳게 적었으면, 그 값이 기록된 실제 값과도 같아야 한다.
      const siblingValue = typeof sibling === "number" ? sibling : null;
      if (siblingValue !== null && siblingValue !== statedValue) {
        failures.push(
          where + ': 사유는 "' + name + " " + stated + '"인데 기록된 값은 ' + siblingValue + " 입니다.",
        );
      }
    }
  };

  for (const [name, spec] of Object.entries(components)) walk(spec, [name]);
  return { failures, checked };
}

const recordPath = resolve(repoRoot, "figma/components.measured.json");
const record = JSON.parse(readFileSync(recordPath, "utf8"));
const { failures, checked } = auditRecord(record.components);

// **이 게이트가 무엇을 잡는지 스스로 증명한다.** 변조가 없던 실패를 새로 만들어야 한다.
if (!process.argv.includes("--no-canary")) {
  const baseline = new Set(failures);
  const TAMPERS = [
    [
      "없는 토큰 이름으로 바꾸기",
      (components) => {
        const clone = structuredClone(components);
        clone.button.sizes.md.$radius = "radius-control-xl 12";
        return clone;
      },
    ],
    [
      "토큰은 맞는데 값을 틀리게 적기",
      (components) => {
        const clone = structuredClone(components);
        clone.button.sizes.md.$radius = "radius-control 999";
        return clone;
      },
    ],
  ];
  for (const [label, mutate] of TAMPERS) {
    const introduced = auditRecord(mutate(record.components)).failures.filter((f) => !baseline.has(f));
    if (introduced.length === 0) {
      failures.push(
        baseline.size === 0
          ? "canary가 변조를 잡지 못했습니다: " + label
          : "canary의 검출력을 증명하지 못했습니다 — 기존 실패에 가려집니다: " + label,
      );
    }
  }
}

if (failures.length > 0) {
  console.error("[record-citations] 사유가 인용한 토큰이 틀린 곳 " + failures.length + "건입니다:");
  for (const failure of failures) console.error("[record-citations]   " + failure);
  process.exit(1);
}

console.log(
  "[record-citations] figma/components.measured.json의 `$` 사유가 인용한 기하·모션 토큰 " +
    checked.length + "건이 **실재하고 값이 맞습니다** (canary 2종 통과).",
);
