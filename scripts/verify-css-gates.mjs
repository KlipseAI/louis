#!/usr/bin/env node
// CSS 저작 규칙 게이트가 실제로 위반을 잡는지 증명한다 (DS-D-0004).
// 저작 원본을 일시적으로 변조하고 build-css가 실패하는지 확인한 뒤 byte-for-byte 복원한다.
import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const errors = [];
const canaries = [];

function runScript(script, ...args) {
  return execFileSync(process.execPath, [resolve(repoRoot, script), ...args], {
    cwd: repoRoot,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  });
}

function runBuild(...args) {
  return runScript("scripts/build-css.mjs", ...args);
}

/**
 * Tailwind theme 생성기(DS-D-0013)의 검출력을 증명한다.
 *
 * 생성물 drift와 **매핑되지 않은 토큰 접두사** 둘을 본다. 후자가 중요한 이유는, 새 토큰 범주가
 * 생겼는데 매핑을 빠뜨리면 유틸리티가 조용히 안 나오기 때문이다 — 실패하지 않으면 아무도 모른다.
 */
function withThemeCanary(path, mutate, label, expectedDiagnostic) {
  const absolute = resolve(repoRoot, path);
  const before = readFileSync(absolute, "utf8");
  const mutated = mutate(before);
  if (mutated === before) {
    errors.push(`${label} canary가 입력을 변경하지 못했습니다: ${path}`);
    return;
  }
  writeFileSync(absolute, mutated);
  let failed = false;
  let output = "";
  try {
    runScript("scripts/build-tailwind-theme.mjs", "--check");
  } catch (error) {
    failed = true;
    output = String(error.stdout ?? "") + String(error.stderr ?? "");
  } finally {
    writeFileSync(absolute, before);
  }
  if (!failed) {
    errors.push(`${label} canary가 통과했습니다. 게이트가 위반을 잡지 못합니다.`);
    return;
  }
  if (!output.includes(expectedDiagnostic)) {
    errors.push(`${label} canary가 예상 진단을 내지 않았습니다: ${expectedDiagnostic}\n${output.trim()}`);
    return;
  }
  if (readFileSync(absolute, "utf8") !== before) {
    errors.push(`${label} canary가 원본을 복원하지 못했습니다.`);
    return;
  }
  canaries.push(label);
}

function withCanary(path, mutate, label, expectedDiagnostic) {
  const absolute = resolve(repoRoot, path);
  const before = readFileSync(absolute, "utf8");
  const mutated = mutate(before);
  if (mutated === before) {
    errors.push(`${label} canary가 입력을 변경하지 못했습니다: ${path}`);
    return;
  }

  writeFileSync(absolute, mutated);
  let failed = false;
  let output = "";
  try {
    runBuild("--check");
  } catch (error) {
    failed = true;
    output = String(error.stdout ?? "") + String(error.stderr ?? "");
  } finally {
    writeFileSync(absolute, before);
  }

  if (!failed) {
    errors.push(`${label} canary가 통과했습니다. 게이트가 위반을 잡지 못합니다.`);
    return;
  }
  if (!output.includes(expectedDiagnostic)) {
    errors.push(
      `${label} canary가 예상 진단을 내지 않았습니다: ${expectedDiagnostic}\n${output.trim()}`,
    );
    return;
  }
  if (readFileSync(absolute, "utf8") !== before) {
    errors.push(`${label} canary가 원본을 복원하지 못했습니다.`);
    return;
  }
  canaries.push(label);
}

// 정상 상태에서 통과해야 한다.
try {
  runBuild("--check");
} catch (error) {
  errors.push(
    `사전 check가 실패했습니다:\n${String(error.stdout ?? "") + String(error.stderr ?? "")}`,
  );
}

const BASE = "packages/css/src/base.css";

withCanary(
  BASE,
  (source) => `${source}\n.kds-canary { color: var(--kds-color-foreground-primary) !important; }\n`,
  "important",
  "!important는 금지된다",
);

withCanary(
  BASE,
  (source) => `${source}\n.kds-canary { z-index: 9999; }\n`,
  "numeric z-index",
  "숫자 z-index는 금지된다",
);

withCanary(
  BASE,
  (source) => `${source}\n.kds-canary { color: #ff0000; }\n`,
  "raw color literal",
  "raw color 리터럴은 금지된다",
);

withCanary(
  BASE,
  (source) => `${source}\nbody .kds-canary { display: block; }\n`,
  "global selector outside reset",
  "전역 선택자(html/body/*)는 reset.css 안에서만 쓴다",
);

withCanary(
  BASE,
  (source) => `${source}\n.kds-canary { padding: var(--kds-space-4); }\n`,
  "primitive consumption",
  "primitive를 직접 소비합니다",
);

withCanary(
  BASE,
  (source) => `${source}\n.kds-canary { color: var(--kds-color-does-not-exist); }\n`,
  "unknown token reference",
  "존재하지 않는 토큰을 참조합니다",
);

withCanary(
  "packages/css/generated/styles.css",
  (source) => `${source}\n.kds-drift { color: red; }\n`,
  "generated drift",
  "generated CSS가 최신이 아닙니다",
);

withThemeCanary(
  "packages/css/generated/theme.css",
  (source) => `${source}\n/* drift */\n`,
  "tailwind theme drift",
  "generated CSS가 최신이 아닙니다",
);

withThemeCanary(
  "packages/tokens/generated/manifest.json",
  (source) =>
    source.replace('"id": "color-action-primary"', '"id": "brandnew-action-primary"'),
  "tailwind theme 미매핑 접두사",
  "매핑되지 않은 토큰 접두사입니다",
);

// canary 이후에도 정상 상태여야 한다.
try {
  runBuild("--check");
} catch (error) {
  errors.push(
    `canary 이후 check가 실패했습니다:\n${String(error.stdout ?? "") + String(error.stderr ?? "")}`,
  );
}

if (errors.length > 0) {
  for (const error of errors) console.error(`[css-gates] ${error}`);
  process.exit(1);
}
console.log(
  `[css-gates] OK (저작 규칙 canary ${canaries.length}종: ${canaries.join(", ")})`,
);
