import { execFileSync } from "node:child_process";
import {
  existsSync,
  linkSync,
  lstatSync,
  readFileSync,
  symlinkSync,
  unlinkSync,
  writeFileSync,
} from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const errors = [];
let canaryCount = 0;
const tick = String.fromCharCode(96);

runPass("check catalog", "scripts/build-design-docs.mjs", "--check");
runPass("check AI docs", "scripts/build-llms-docs.mjs", "--check");
validatePackageScaffolds();
validateFenceProjection();

withCanary(
  "design/manifest.schema.json",
  (source) => {
    const schema = JSON.parse(source);
    schema.unknownGateCanary = true;
    return JSON.stringify(schema, null, 2) + "\n";
  },
  "schema unknown keyword",
  "scripts/build-design-docs.mjs",
  "Unsupported JSON Schema keyword",
  "--check",
);

withCanary(
  "design/manifest.json",
  (source) => {
    const manifest = JSON.parse(source);
    manifest.documents[1].id = manifest.documents[0].id;
    return JSON.stringify(manifest, null, 2) + "\n";
  },
  "duplicate document id",
  "scripts/build-design-docs.mjs",
  "documents.id 중복",
  "--check",
);

withCanary(
  "design/manifest.json",
  (source) => {
    const manifest = JSON.parse(source);
    manifest.schemaVersion = 2;
    return JSON.stringify(manifest, null, 2) + "\n";
  },
  "AI direct schema validation",
  "scripts/build-llms-docs.mjs",
  "manifest schema $.schemaVersion",
  "--check",
);

withCanary(
  "design/manifest.json",
  (source) => {
    const manifest = JSON.parse(source);
    manifest.components.find((item) => item.id === "button").maturity = "beta";
    return JSON.stringify(manifest, null, 2) + "\n";
  },
  "catalog item maturity mismatch",
  "scripts/build-design-docs.mjs",
  "maturity가 document와 다릅니다",
  "--check",
);

withCanary(
  "design/components/button.md",
  (source) => source.replace("status: experimental", "status: stable"),
  "frontmatter mismatch",
  "scripts/build-design-docs.mjs",
  "frontmatter status 불일치",
  "--check",
);

withCanary(
  "design/components/button.md",
  (source) =>
    source.replace(
      /^\|\s*Web\s*\|\s*\x60not-ready\x60\s*\|/m,
      "| Web | " + tick + "done" + tick + " |",
    ),
  "availability mismatch",
  "scripts/build-design-docs.mjs",
  "Availability Web 불일치",
  "--check",
);

withCanary(
  "design/patterns/loading.md",
  (source) => source.replace("## Acceptance tests", "## Verification examples"),
  "pattern docs completion",
  "scripts/build-design-docs.mjs",
  "docs=done 문서에 Acceptance tests 절이 없습니다",
  "--check",
);

withCanary(
  "design/content/README.md",
  (source) => source + "\nTemporary product path: apps/web/example.tsx\n",
  "product path isolation",
  "scripts/build-design-docs.mjs",
  "제품 저장소 전용 경로",
  "--check",
);

withCanary(
  "design/content/README.md",
  (source) => source + "\n[Temporary broken link](./gate-missing.md)\n",
  "broken normative link",
  "scripts/build-design-docs.mjs",
  "깨진 Markdown 링크",
  "--check",
);

withCanary(
  "design/manifest.json",
  (source) => {
    const manifest = JSON.parse(source);
    const content = manifest.documents.find(
      (document) => document.id === "content-overview",
    );
    content.section = "reference";
    return JSON.stringify(manifest, null, 2) + "\n";
  },
  "unsupported normative section",
  "scripts/build-llms-docs.mjs",
  "normative section을 AI 출력에 배정할 수 없습니다",
  "--check",
);

withCanary(
  "design/manifest.json",
  (source) => {
    const manifest = JSON.parse(source);
    const generated = manifest.documents.find(
      (document) => document.id === "llms-components",
    );
    generated.sources = generated.sources.filter(
      (path) => path !== "design/components/dialog.md",
    );
    return JSON.stringify(manifest, null, 2) + "\n";
  },
  "AI source omission",
  "scripts/build-llms-docs.mjs",
  "sources가 exhaustive 편입 순서와 다릅니다",
  "--check",
);

withCanary(
  "design/manifest.json",
  (source) => {
    const manifest = JSON.parse(source);
    manifest.documents.push({
      id: "llms-unexpected",
      path: "design/llms/unexpected.txt",
      title: "Unexpected generated document",
      section: "generated",
      authority: "generated",
      maturity: "experimental",
      generated: true,
      generator: "build-llms-docs",
      checker: "check-llms-docs",
      sourceCoverage: "exhaustive",
      sources: ["design/manifest.json"],
    });
    return JSON.stringify(manifest, null, 2) + "\n";
  },
  "unexpected generated entry",
  "scripts/build-llms-docs.mjs",
  "build-llms-docs가 소유하지 않는 generated entry",
  "--check",
);

withCreatedCanary(
  "design/foundations/gate-unregistered.md",
  [
    "---",
    "id: gate-unregistered",
    "status: experimental",
    "authority: normative",
    "---",
    "",
    "# Gate unregistered",
    "",
  ].join("\n"),
  "unregistered normative document",
  "scripts/build-design-docs.mjs",
  "design Markdown이 manifest에 등록되지 않았습니다",
  "--check",
);

withCanary(
  "design/llms/foundations.txt",
  (source) => source + "\ncanary drift\n",
  "generated drift",
  "scripts/build-llms-docs.mjs",
  "generated AI 문서가 최신이 아닙니다",
  "--check",
);

withDanglingSymlinkCanary(
  "design/llms/foundations.txt",
  "design/llms/gate-symlink-target.txt",
  "generated output symlink boundary",
  "scripts/build-llms-docs.mjs",
  "symbolic link일 수 없습니다",
);

withHardlinkCanary(
  "design/README.md",
  "design/gate-hardlink-target.txt",
  (source) =>
    source.replace(
      "| Normative documents | 27 |",
      "| Normative documents | 26 |",
    ),
  "generated catalog hardlink boundary",
  "scripts/build-design-docs.mjs",
  "hard link일 수 없습니다",
);

withHardlinkCanary(
  "design/llms/foundations.txt",
  "design/llms/gate-hardlink-target.txt",
  (source) => source + "\nhardlink canary drift\n",
  "generated AI output hardlink boundary",
  "scripts/build-llms-docs.mjs",
  "hard link일 수 없습니다",
);

runPass(
  "post-canary catalog check",
  "scripts/build-design-docs.mjs",
  "--check",
);
runPass("post-canary AI check", "scripts/build-llms-docs.mjs", "--check");

if (errors.length > 0) {
  for (const error of errors) console.error("[verify] " + error);
  process.exit(1);
}

console.log(
  "[verify] passed: 4 positive checks, " +
    canaryCount +
    " failure canaries, byte-for-byte restoration",
);

function runPass(label, script, ...args) {
  try {
    execFileSync(process.execPath, [script, ...args], {
      cwd: repoRoot,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
    });
  } catch (error) {
    const output = String(error.stdout ?? "") + String(error.stderr ?? "");
    errors.push(label + "가 실패했습니다.\n" + output.trim());
  }
}

function withCanary(path, mutate, label, script, expectedDiagnostic, ...args) {
  const absolute = resolve(repoRoot, path);
  const before = readFileSync(absolute, "utf8");
  const mutated = mutate(before);
  if (mutated === before) {
    errors.push(label + " canary가 입력을 변경하지 못했습니다: " + path);
    return;
  }

  writeFileSync(absolute, mutated);
  try {
    let failed = false;
    let output = "";
    try {
      execFileSync(process.execPath, [script, ...args], {
        cwd: repoRoot,
        encoding: "utf8",
        stdio: ["ignore", "pipe", "pipe"],
      });
    } catch (error) {
      failed = true;
      output = String(error.stdout ?? "") + String(error.stderr ?? "");
    }
    if (!failed) {
      errors.push(label + " canary를 checker가 통과시켰습니다.");
    } else if (!output.includes(expectedDiagnostic)) {
      errors.push(
        label +
          " canary가 예상 진단을 내지 않았습니다: " +
          expectedDiagnostic +
          "\n" +
          output.trim(),
      );
    } else {
      canaryCount += 1;
    }
  } finally {
    writeFileSync(absolute, before);
  }

  const restored = readFileSync(absolute, "utf8");
  if (restored !== before) {
    errors.push(label + " canary가 원본을 byte-for-byte 복원하지 못했습니다.");
  }
}

function withCreatedCanary(
  path,
  source,
  label,
  script,
  expectedDiagnostic,
  ...args
) {
  const absolute = resolve(repoRoot, path);
  if (existsSync(absolute)) {
    errors.push(label + " canary 경로가 이미 존재합니다: " + path);
    return;
  }
  writeFileSync(absolute, source);
  try {
    let failed = false;
    let output = "";
    try {
      execFileSync(process.execPath, [script, ...args], {
        cwd: repoRoot,
        encoding: "utf8",
        stdio: ["ignore", "pipe", "pipe"],
      });
    } catch (error) {
      failed = true;
      output = String(error.stdout ?? "") + String(error.stderr ?? "");
    }
    if (!failed) {
      errors.push(label + " canary를 checker가 통과시켰습니다.");
    } else if (!output.includes(expectedDiagnostic)) {
      errors.push(
        label +
          " canary가 예상 진단을 내지 않았습니다: " +
          expectedDiagnostic +
          "\n" +
          output.trim(),
      );
    } else {
      canaryCount += 1;
    }
  } finally {
    if (existsSync(absolute)) unlinkSync(absolute);
  }
  if (existsSync(absolute)) {
    errors.push(label + " canary 파일을 제거하지 못했습니다.");
  }
}

function withDanglingSymlinkCanary(
  path,
  targetPath,
  label,
  script,
  expectedDiagnostic,
  ...args
) {
  const absolute = resolve(repoRoot, path);
  const targetAbsolute = resolve(repoRoot, targetPath);
  const before = readFileSync(absolute, "utf8");
  if (pathEntryExists(targetAbsolute)) {
    errors.push(label + " canary target이 이미 존재합니다: " + targetPath);
    return;
  }

  unlinkSync(absolute);
  symlinkSync(targetAbsolute, absolute);
  try {
    let failed = false;
    let output = "";
    try {
      execFileSync(process.execPath, [script, ...args], {
        cwd: repoRoot,
        encoding: "utf8",
        stdio: ["ignore", "pipe", "pipe"],
      });
    } catch (error) {
      failed = true;
      output = String(error.stdout ?? "") + String(error.stderr ?? "");
    }
    if (!failed) {
      errors.push(label + " canary를 checker가 통과시켰습니다.");
    } else if (!output.includes(expectedDiagnostic)) {
      errors.push(
        label +
          " canary가 예상 진단을 내지 않았습니다: " +
          expectedDiagnostic +
          "\n" +
          output.trim(),
      );
    } else {
      canaryCount += 1;
    }
  } finally {
    if (pathEntryExists(absolute)) unlinkSync(absolute);
    if (pathEntryExists(targetAbsolute)) unlinkSync(targetAbsolute);
    writeFileSync(absolute, before);
  }

  const restored = readFileSync(absolute, "utf8");
  if (restored !== before || pathEntryExists(targetAbsolute)) {
    errors.push(label + " canary가 원본을 byte-for-byte 복원하지 못했습니다.");
  }
}

function pathEntryExists(path) {
  try {
    lstatSync(path);
    return true;
  } catch (error) {
    if (error && error.code === "ENOENT") return false;
    throw error;
  }
}

function withHardlinkCanary(
  path,
  targetPath,
  mutate,
  label,
  script,
  expectedDiagnostic,
  ...args
) {
  const absolute = resolve(repoRoot, path);
  const targetAbsolute = resolve(repoRoot, targetPath);
  const before = readFileSync(absolute, "utf8");
  const mutated = mutate(before);
  if (mutated === before) {
    errors.push(label + " canary가 입력을 변경하지 못했습니다: " + path);
    return;
  }
  if (pathEntryExists(targetAbsolute)) {
    errors.push(label + " canary target이 이미 존재합니다: " + targetPath);
    return;
  }

  writeFileSync(absolute, mutated);
  linkSync(absolute, targetAbsolute);
  try {
    let failed = false;
    let output = "";
    try {
      execFileSync(process.execPath, [script, ...args], {
        cwd: repoRoot,
        encoding: "utf8",
        stdio: ["ignore", "pipe", "pipe"],
      });
    } catch (error) {
      failed = true;
      output = String(error.stdout ?? "") + String(error.stderr ?? "");
    }
    if (!failed) {
      errors.push(label + " canary를 checker가 통과시켰습니다.");
    } else if (!output.includes(expectedDiagnostic)) {
      errors.push(
        label +
          " canary가 예상 진단을 내지 않았습니다: " +
          expectedDiagnostic +
          "\n" +
          output.trim(),
      );
    } else {
      canaryCount += 1;
    }
  } finally {
    if (pathEntryExists(targetAbsolute)) unlinkSync(targetAbsolute);
    writeFileSync(absolute, before);
  }

  const restored = readFileSync(absolute, "utf8");
  if (restored !== before || pathEntryExists(targetAbsolute)) {
    errors.push(label + " canary가 원본을 byte-for-byte 복원하지 못했습니다.");
  }
}

function validatePackageScaffolds() {
  const expected = new Map([
    ["packages/tokens/package.json", "@klipse-design/tokens"],
    ["packages/css/package.json", "@klipse-design/css"],
    ["packages/react/package.json", "@klipse-design/react"],
    ["apps/docs/package.json", "@klipse-design/docs"],
  ]);

  for (const [path, name] of expected) {
    let value;
    try {
      value = JSON.parse(readFileSync(resolve(repoRoot, path), "utf8"));
    } catch (error) {
      errors.push(path + "를 읽을 수 없습니다: " + error.message);
      continue;
    }
    if (value.name !== name) {
      errors.push(path + " package name 불일치: " + String(value.name));
    }
    if (value.private !== true) {
      errors.push(path + "는 구현 전 private=true여야 합니다.");
    }
    if (Object.hasOwn(value, "exports")) {
      errors.push(path + "는 구현 전 가짜 exports를 제공하면 안 됩니다.");
    }
  }
}

function validateFenceProjection() {
  const decisionSource = readFileSync(
    resolve(repoRoot, "design/governance/decisions/README.md"),
    "utf8",
  );
  const template = /```md\n[\s\S]*?\n```/.exec(decisionSource)?.[0];
  const guidelines = readFileSync(
    resolve(repoRoot, "design/llms/guidelines.txt"),
    "utf8",
  );
  if (!template || !guidelines.includes(template)) {
    errors.push(
      "AI projection이 fenced Markdown template을 byte-identical하게 보존하지 않습니다.",
    );
  }
}
