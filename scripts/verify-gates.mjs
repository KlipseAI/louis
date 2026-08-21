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

withScaffoldCanary(
  "packages/css/package.json",
  (source) => {
    const value = JSON.parse(source);
    value.exports = { ".": "./dist/index.js" };
    return JSON.stringify(value, null, 2) + "\n";
  },
  "undeclared package export",
  "exports 서브패스가 선언과 다릅니다",
);

withScaffoldCanary(
  "packages/tokens/package.json",
  (source) => {
    const value = JSON.parse(source);
    delete value.sideEffects;
    return JSON.stringify(value, null, 2) + "\n";
  },
  "missing sideEffects on css-exporting package",
  "sideEffects는",
);

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
    // manifest와 다른 값으로 바꾸기만 하면 된다. 현재 값이 무엇이든 done이 아니면 done으로,
    // done이면 not-ready로 뒤집는다.
    source.replace(
      /^\|\s*Web\s*\|\s*\x60([a-z-]+)\x60\s*\|/m,
      (_match, status) =>
        "| Web | " + tick + (status === "done" ? "not-ready" : "done") + tick + " |",
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

// 내비 라벨을 경로에서 유추해 네 곳이 틀렸다(2026-08-21 「보관함」 → 「홈」). 표를 생성물로
// 바꿨으니 손으로 고치면 잡혀야 한다.
withCanary(
  "design/components/app-shell-parts.md",
  (source) => {
    const next = source.replace(
      "| `/archive` | 홈 |",
      "| `/archive` | 보관함 |",
    );
    if (next === source) {
      errors.push("app-nav-labels 표 canary가 대상 행을 찾지 못했습니다.");
    }
    return next;
  },
  "generated app nav label table",
  "scripts/build-design-docs.mjs",
  "generated region이 최신이 아닙니다",
  "--check",
);

// 드리프트 분포표를 손으로 세다 두 번 틀렸다(2026-08-21 border-width·radius). 표를 생성물로
// 바꿨으니, **손으로 숫자를 고치면 반드시 잡혀야** 그 조치가 값을 한다. 그것을 여기서 증명한다.
withCanary(
  "design/governance/product-confirmations.md",
  (source) => {
    const next = source.replace(
      /\| border-width \| 8단 (\d+)회 \|/,
      (match, uses) => "| border-width | 8단 " + (Number(uses) - 1) + "회 |",
    );
    if (next === source) {
      errors.push("product-drift 표 canary가 대상 행을 찾지 못했습니다.");
    }
    return next;
  },
  "generated product drift table",
  "scripts/build-design-docs.mjs",
  "generated region이 최신이 아닙니다",
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
      /\| Normative documents \| (\d+) \|/,
      (match, count) => "| Normative documents | " + (Number(count) - 1) + " |",
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
  // 선언된 public surface만 허용한다. 구현 전 가짜 exports도, 선언 없이 늘어난 exports도 막는다.
  // 서브패스는 추가가 minor이고 제거가 major이므로(DS-D-0006) 선언을 규범으로 둔다.
  const declaredPackageSurfaces = new Map([
    [
      "packages/tokens/package.json",
      {
        name: "@klipse-design/tokens",
        subpaths: [
          ".",
          "./css",
          "./json",
          "./figma",
          "./manifest",
          "./package.json",
        ],
        sideEffects: ["*.css"],
      },
    ],
    [
      "packages/css/package.json",
      {
        name: "@klipse-design/css",
        subpaths: [
          "./layers.css",
          "./tokens.css",
          "./reset.css",
          "./styles.css",
          "./styles.layer.css",
          // Tailwind 4 `@theme inline` 레이어 (DS-D-0013). 토큰만 발행하며 컴포넌트 CSS는
          // authored plain CSS로 남는다.
          "./theme.css",
          "./package.json",
        ],
        sideEffects: ["*.css"],
      },
    ],
    [
      "packages/react/package.json",
      {
        name: "@klipse-design/react",
        subpaths: [".", "./icons", "./icons/manifest.json", "./package.json"],
        sideEffects: false,
      },
    ],
    [
      "apps/docs/package.json",
      { name: "@klipse-design/docs", subpaths: [], sideEffects: null },
    ],
  ]);

  for (const [path, contract] of declaredPackageSurfaces) {
    let value;
    try {
      value = JSON.parse(readFileSync(resolve(repoRoot, path), "utf8"));
    } catch (error) {
      errors.push(path + "를 읽을 수 없습니다: " + error.message);
      continue;
    }
    if (value.name !== contract.name) {
      errors.push(path + " package name 불일치: " + String(value.name));
    }
    if (value.private !== true) {
      errors.push(path + "는 public release 전 private=true여야 합니다.");
    }
    const actualSubpaths = Object.hasOwn(value, "exports")
      ? Object.keys(value.exports).sort()
      : [];
    const declaredSubpaths = [...contract.subpaths].sort();
    if (JSON.stringify(actualSubpaths) !== JSON.stringify(declaredSubpaths)) {
      errors.push(
        path +
          "의 exports 서브패스가 선언과 다릅니다. 선언: [" +
          declaredSubpaths.join(", ") +
          "] 실제: [" +
          actualSubpaths.join(", ") +
          "]",
      );
    }
    const expectedSideEffects = contract.sideEffects;
    if (expectedSideEffects === null) {
      if (Object.hasOwn(value, "sideEffects")) {
        errors.push(path + "는 exports가 없으므로 sideEffects를 선언하지 않습니다.");
      }
    } else if (
      JSON.stringify(value.sideEffects) !== JSON.stringify(expectedSideEffects)
    ) {
      errors.push(
        path +
          ".sideEffects는 " +
          JSON.stringify(expectedSideEffects) +
          "여야 합니다. CSS 서브패스를 노출하면서 이 값을 비우면 프로덕션 빌드에서 조용히 제거됩니다.",
      );
    }
  }

  const tokenPackage = JSON.parse(
    readFileSync(resolve(repoRoot, "packages/tokens/package.json"), "utf8"),
  );
  const expectedTokenExports = {
    ".": {
      types: "./generated/index.d.ts",
      import: "./generated/index.js",
      default: "./generated/index.js",
    },
    "./css": "./generated/tokens.css",
    "./json": "./generated/tokens.json",
    "./figma": "./generated/figma.tokens.json",
    "./manifest": "./generated/manifest.json",
    "./package.json": "./package.json",
  };
  if (
    JSON.stringify(tokenPackage.exports) !==
    JSON.stringify(expectedTokenExports)
  ) {
    errors.push(
      "packages/tokens/package.json exports가 P2 public surface와 다릅니다.",
    );
  }
  if (JSON.stringify(tokenPackage.files) !== JSON.stringify(["generated"])) {
    errors.push(
      "packages/tokens/package.json files는 generated만 포함해야 합니다.",
    );
  }
}

// validatePackageScaffolds는 별도 프로세스가 아니라 이 프로세스에서 도므로 in-process canary를 쓴다.
function withScaffoldCanary(path, mutate, label, expectedDiagnostic) {
  const absolute = resolve(repoRoot, path);
  const before = readFileSync(absolute, "utf8");
  const mutated = mutate(before);
  if (mutated === before) {
    errors.push(label + " canary가 입력을 변경하지 못했습니다: " + path);
    return;
  }

  const baseline = errors.length;
  writeFileSync(absolute, mutated);
  try {
    validatePackageScaffolds();
  } finally {
    writeFileSync(absolute, before);
  }
  const produced = errors.splice(baseline);

  if (!produced.some((message) => message.includes(expectedDiagnostic))) {
    errors.push(
      label +
        " canary가 예상 진단을 내지 않았습니다: " +
        expectedDiagnostic +
        "\n" +
        produced.join("\n"),
    );
    return;
  }
  if (readFileSync(absolute, "utf8") !== before) {
    errors.push(label + " canary가 원본을 byte-for-byte 복원하지 못했습니다.");
    return;
  }
  canaryCount += 1;
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
