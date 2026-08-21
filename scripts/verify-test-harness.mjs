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
let browserOutput = "";
try {
  runVitest("node");
  browserOutput = runVitest("browser*");
  positives.push("post-canary suite");
} catch (error) {
  browserOutput = String(error.stdout ?? "") + String(error.stderr ?? "");
  errors.push(`canary 제거 후 실제 suite가 실패했습니다:\n${browserOutput}`);
}

// **초록인데 조용히 깨져 있던 자리다.** vitest.config.ts의 `optimizeDeps.include`가 맨 패키지
// 이름을 적고 있었는데 pnpm 배치상 저장소 루트에서 해석되지 않아, 매 실행이
// `Failed to resolve dependency: …, present in client 'optimizeDeps.include'`를 찍으면서
// **사전 번들링이 통째로 걸리지 않았다.** 그러면 Vite가 런타임에 의존성을 발견해 페이지를
// 리로드하고, 그 리로드가 진행 중이던 테스트를 엉뚱한 DOM 위에서 실패시킨다 — 브라우저
// 테스트가 약 5% 확률로 흔들린 원인이다. 로그 한 줄이라 아무도 읽지 않았으므로 게이트로 만든다.
const unresolved = [
  ...browserOutput.matchAll(/Failed to resolve dependency: ([^,]+), present in client/g),
].map((match) => match[1].trim());
if (unresolved.length > 0) {
  errors.push(
    "optimizeDeps.include가 해석되지 않습니다: " +
      [...new Set(unresolved)].join(", ") +
      "\n사전 번들링이 걸리지 않아 실행 중 페이지 리로드가 나고 테스트가 흔들립니다." +
      "\npnpm 배치에서는 부모 패키지를 앞에 적어야 합니다 — 예: `@klipse-design/react > @radix-ui/react-portal`.",
  );
} else {
  positives.push("optimizeDeps 해석");
}

if (errors.length > 0) {
  for (const error of errors) console.error(`[test-harness] ${error}`);
  process.exit(1);
}
console.log(
  `[test-harness] OK (실패 전파 canary ${canaries.length}종, ${positives.join(", ")})`,
);
