#!/usr/bin/env node
// 테스트 harness가 실제로 실패를 전파하는지 증명한다.
// 빈 scaffold가 초록으로 보이는 것을 막는 것이 목적이다 (DS-P3-002 완료 근거).
//
// 절차: 각 project에 의도적으로 실패하는 테스트를 심고 → 러너가 non-zero로 끝나는지 확인 →
// 파일을 지우고 → 실제 suite가 통과하는지 확인한다.
import { execFileSync } from "node:child_process";
import { existsSync, unlinkSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const errors = [];
const positives = [];

const canaries = [
  {
    label: "node project failure propagation",
    path: "packages/tokens/test/__harness-canary.node.test.ts",
    project: "node",
    source: [
      "import { expect, test } from 'vitest';",
      "test('의도적 실패 canary', () => {",
      "  expect(1).toBe(2);",
      "});",
      "",
    ].join("\n"),
  },
  {
    label: "browser project failure propagation",
    path: "packages/tokens/test/__harness-canary.browser.test.ts",
    project: "browser*",
    source: [
      "import { expect, test } from 'vitest';",
      "test('의도적 실패 canary', () => {",
      "  expect(document.title).toBe('__never__');",
      "});",
      "",
    ].join("\n"),
  },
];

function runVitest(project) {
  return execFileSync(
    process.execPath,
    [
      resolve(repoRoot, "node_modules/vitest/vitest.mjs"),
      "run",
      "--project",
      project,
    ],
    { cwd: repoRoot, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] },
  );
}

for (const canary of canaries) {
  const absolute = resolve(repoRoot, canary.path);
  if (existsSync(absolute)) {
    errors.push(`${canary.label} canary 대상이 이미 존재합니다: ${canary.path}`);
    continue;
  }
  writeFileSync(absolute, canary.source);
  let failed = false;
  try {
    runVitest(canary.project);
  } catch {
    failed = true;
  } finally {
    unlinkSync(absolute);
  }
  if (!failed) {
    errors.push(
      `${canary.label} canary가 통과했습니다. 러너가 실패를 전파하지 않습니다.`,
    );
    continue;
  }
  if (existsSync(absolute)) {
    errors.push(`${canary.label} canary가 파일을 정리하지 못했습니다.`);
    continue;
  }
  positives.push(canary.label);
}

// canary 제거 후 실제 suite가 통과하는지 확인한다.
try {
  runVitest("node");
  runVitest("browser*");
  positives.push("post-canary suite");
} catch (error) {
  errors.push(
    `canary 제거 후 실제 suite가 실패했습니다:\n${String(error.stdout ?? "") + String(error.stderr ?? "")}`,
  );
}

if (errors.length > 0) {
  for (const error of errors) console.error(`[test-harness] ${error}`);
  process.exit(1);
}
console.log(
  `[test-harness] OK (실패 전파 canary ${canaries.length}종, ${positives.join(", ")})`,
);
