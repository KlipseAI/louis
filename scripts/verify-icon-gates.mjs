#!/usr/bin/env node
// 아이콘 정본 규칙과 provenance·고지 요구가 실제로 위반을 잡는지 증명한다 (DS-D-0008).
// 정본을 일시적으로 변조하고 build-icons가 실패하는지 확인한 뒤 byte-for-byte 복원한다.
//
// 6~9번이 이 게이트의 핵심이다. "출처를 모르는 글리프"와 "고지문 없는 글리프"가 조용히
// 들어오는 경로를 규범상 존재하지 않게 만드는 것이 목적이며, 그 보증은 canary가 실제로
// 실패를 만들어낼 때만 성립한다.
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { REQUIRED_SET_FIELDS } from "./lib/icon-model.mjs";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const errors = [];
const canaries = [];

const GLYPH = "packages/react/src/icons/svg/check-circle.svg";
const PROVENANCE = "packages/react/src/icons/provenance.json";
const KEYWORDS = "packages/react/src/icons/keywords.json";
const GENERATED = "packages/react/src/icons/generated/index.tsx";

function runBuild(...args) {
  return execFileSync(
    process.execPath,
    [resolve(repoRoot, "scripts/build-icons.mjs"), ...args],
    { cwd: repoRoot, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] },
  );
}

function withCanary(path, mutate, label, expectedDiagnostic) {
  const absolute = resolve(repoRoot, path);
  const before = readFileSync(absolute, "utf8");
  let mutated;
  try {
    mutated = mutate(before);
  } catch (error) {
    errors.push(`${label} canary 변조가 예외를 냈습니다: ${error.message}`);
    return;
  }
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

/** provenance.json을 JSON으로 다루되 파일 표기(2칸 들여쓰기 + 개행)를 유지한다. */
function editProvenance(source, edit) {
  const document = JSON.parse(source);
  edit(document);
  return `${JSON.stringify(document, null, 2)}\n`;
}

/**
 * 글리프를 **새로 추가**해야 성립하는 canary. 심볼 충돌과 지오메트리 중복은 단일 파일 변조로는
 * 만들 수 없다 — 두 글리프가 동시에 있어야 하는 사고이기 때문이다.
 */
function withAddedGlyphs(entries, label, expectedDiagnostic) {
  const provenanceAbsolute = resolve(repoRoot, PROVENANCE);
  const provenanceBefore = readFileSync(provenanceAbsolute, "utf8");
  const paths = entries.map((entry) =>
    resolve(repoRoot, `packages/react/src/icons/svg/${entry.name}.svg`),
  );

  for (const [index, path] of paths.entries()) {
    if (existsSync(path)) {
      errors.push(`${label} canary가 기존 파일을 덮어쓸 뻔했습니다: ${entries[index].name}.svg`);
      return;
    }
  }

  for (const [index, path] of paths.entries()) {
    writeFileSync(path, entries[index].svg);
  }
  writeFileSync(
    provenanceAbsolute,
    editProvenance(provenanceBefore, (document) => {
      for (const entry of entries) document.glyphs[entry.name] = entry.record;
    }),
  );

  let failed = false;
  let output = "";
  try {
    runBuild("--check");
  } catch (error) {
    failed = true;
    output = String(error.stdout ?? "") + String(error.stderr ?? "");
  } finally {
    for (const path of paths) rmSync(path, { force: true });
    writeFileSync(provenanceAbsolute, provenanceBefore);
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
  if (paths.some((path) => existsSync(path))) {
    errors.push(`${label} canary가 임시 글리프를 지우지 못했습니다.`);
    return;
  }
  if (readFileSync(provenanceAbsolute, "utf8") !== provenanceBefore) {
    errors.push(`${label} canary가 provenance를 복원하지 못했습니다.`);
    return;
  }
  canaries.push(label);
}

/** 참조되지 않는 라이선스 원문을 **추가**해 고아 검사를 증명한다. */
function withAddedLicense(fileName, text, label, expectedDiagnostic) {
  const path = resolve(repoRoot, `packages/react/src/icons/licenses/${fileName}`);
  if (existsSync(path)) {
    errors.push(`${label} canary가 기존 파일을 덮어쓸 뻔했습니다: ${fileName}`);
    return;
  }
  writeFileSync(path, text);
  let failed = false;
  let output = "";
  try {
    runBuild("--check");
  } catch (error) {
    failed = true;
    output = String(error.stdout ?? "") + String(error.stderr ?? "");
  } finally {
    rmSync(path, { force: true });
  }
  if (!failed) {
    errors.push(`${label} canary가 통과했습니다. 게이트가 위반을 잡지 못합니다.`);
    return;
  }
  if (!output.includes(expectedDiagnostic)) {
    errors.push(`${label} canary가 예상 진단을 내지 않았습니다: ${expectedDiagnostic}\n${output.trim()}`);
    return;
  }
  if (existsSync(path)) {
    errors.push(`${label} canary가 임시 파일을 지우지 못했습니다.`);
    return;
  }
  canaries.push(label);
}

const VALID_GLYPH = [
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">',
  '  <path d="M4 4h16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>',
  "</svg>",
  "",
].join("\n");

const ORIGINAL_RECORD = "original";

// 정상 상태에서 통과해야 한다. 이것이 없으면 canary의 실패가 canary 덕분인지
// 원래 깨져 있었기 때문인지 구분할 수 없다.
try {
  runBuild("--check");
} catch (error) {
  errors.push(
    `사전 check가 실패했습니다:\n${String(error.stdout ?? "") + String(error.stderr ?? "")}`,
  );
}

// --- positive 검사 --------------------------------------------------------------
// canary는 "정본을 망가뜨리면 빌드가 실패한다"를 증명한다. 아래는 정본이 정상일 때 성립해야
// 하는 성질이라 변조로는 드러나지 않는다 — 부수효과 없음과 고지문의 실제 내용이 그것이다.
const positives = [];

function positive(label, check) {
  try {
    const failure = check();
    if (failure) errors.push(`${label}: ${failure}`);
    else positives.push(label);
  } catch (error) {
    errors.push(`${label}: 검사가 예외를 냈습니다: ${error.message}`);
  }
}

function read(relativePath) {
  return readFileSync(resolve(repoRoot, relativePath), "utf8");
}

const manifest = JSON.parse(
  read("packages/react/src/icons/generated/manifest.json"),
);

positive("생성 소스에 최상위 부수효과 없음", () => {
  // tsc의 JSX 변환은 /*#__PURE__*/를 붙이지 않는다. 팩토리 호출 형태로 방출하면
  // sideEffects: false가 있어도 번들러가 미사용 글리프를 제거하지 못한다 (결정 8).
  const allowed = [
    /^import\b/,
    /^export type\b/,
    /^export function\b/,
    /^export \{/,
    /^\/\//,
    /^\}/,
    /^\s*\|/,
  ];
  const offenders = read(GENERATED)
    .split("\n")
    .filter((line) => line.length > 0 && !/^\s/.test(line))
    .filter((line) => !allowed.some((pattern) => pattern.test(line)));
  return offenders.length === 0
    ? null
    : `허용되지 않은 최상위 문장: ${offenders.join(" / ")}`;
});

positive("빌드된 JS에도 최상위 호출식 없음", () => {
  // 위 검사는 생성 소스를, 이것은 tsc가 실제로 방출한 결과를 본다. 둘이 갈리는 지점이
  // tree-shaking이 조용히 깨지는 곳이다. dist가 없으면 아직 빌드 전이므로 건너뛴다.
  const built = "packages/react/dist/icons/generated/index.js";
  if (!existsSync(resolve(repoRoot, built))) return null;
  const offenders = read(built)
    .split("\n")
    .filter((line) => line.length > 0 && !/^\s/.test(line))
    .filter((line) => !/^(import|export function|export \{|\}|\/\/)/.test(line));
  return offenders.length === 0
    ? null
    : `허용되지 않은 최상위 문장: ${offenders.join(" / ")}`;
});

positive("모든 글리프의 provenance가 완전함", () => {
  if (manifest.icons.length === 0) return "글리프가 하나도 없습니다";
  for (const icon of manifest.icons) {
    const record = icon.provenance;
    if (!record) return `${icon.name}: provenance가 없습니다`;
    if (record.origin === "original") continue;
    if (record.origin !== "upstream") return `${icon.name}: origin이 ${record.origin}입니다`;
    if (typeof record.icon !== "string" || record.icon.trim().length === 0) {
      return `${icon.name}: provenance.icon이 비었습니다`;
    }
    const set = manifest.sets?.[record.set];
    if (!set) return `${icon.name}: 알 수 없는 세트 ${record.set}`;
    // 목록을 복제하지 않는다. 두 벌이 되면 한쪽에 필드를 더할 때 다른 쪽이 조용히 뒤처진다.
    for (const field of REQUIRED_SET_FIELDS) {
      const value = set[field];
      if (typeof value !== "string" || value.trim().length === 0) {
        return `${record.set}: 세트의 ${field}가 비었거나 추정입니다`;
      }
    }
    if (!set.url.startsWith("https://")) {
      return `${record.set}: 세트 url이 https가 아닙니다`;
    }
  }
  return null;
});

const usedSetEntries = () =>
  [...new Set(
    manifest.icons
      .map((icon) => icon.provenance)
      .filter((record) => record && record.origin === "upstream")
      .map((record) => record.set),
  )].map((name) => [name, manifest.sets[name]]);

positive("고지문이 라이선스 원문의 저작권 줄을 담음", () => {
  // iconography.md Acceptance test 10. 파일을 참조만 하고 내용을 싣지 않으면 MIT/ISC의
  // "copies에 고지를 포함한다"를 만족하지 못한다.
  const notices = read("packages/react/THIRD-PARTY-NOTICES.md");
  const used = usedSetEntries();
  if (used.length === 0) return "upstream 글리프가 없어 고지 대상이 없습니다";
  for (const [, set] of used) {
    const file = set.licenseFile;
    const text = read(`packages/react/src/icons/licenses/${file}`);
    const copyright = text
      .split("\n")
      .filter((line) => line.startsWith("Copyright"));
    if (copyright.length === 0) return `${file}: 저작권 줄이 없습니다`;
    for (const line of copyright) {
      if (!notices.includes(line)) {
        return `고지문에 ${file}의 "${line}"이 없습니다`;
      }
    }
  }
  return null;
});

positive("고지문이 혼합 라이선스를 모두 드러냄", () => {
  // 한 세트의 원문에 라이선스가 둘 이상 들어 있을 수 있다. Lucide 원문은 ISC 본문과 Feather
  // 파생 목록의 MIT 고지를 함께 담는다. 세트 정의의 license 표현을 "AND"로 나눈 조각마다 고지문에
  // 그 이름이 있어야 하고, 원문 파일이 그 조각을 실제로 말해야 한다 — 표현만 적고 원문이 빠지면
  // 고지문이 실제보다 좁은 의무만 선언한 문서가 된다.
  const notices = read("packages/react/THIRD-PARTY-NOTICES.md");
  for (const [setName, set] of usedSetEntries()) {
    const text = read(`packages/react/src/icons/licenses/${set.licenseFile}`);
    for (const part of set.license.split(/\s+AND\s+/)) {
      if (!notices.includes(part)) {
        return `고지문에 ${setName}의 license 조각 "${part}"이 없습니다`;
      }
      if (!text.includes(part)) {
        return `${set.licenseFile} 원문이 "${part}"을 말하지 않습니다`;
      }
    }
    if (!notices.includes(text.trimEnd())) {
      return `고지문이 ${set.licenseFile} 원문 전체를 싣지 않았습니다`;
    }
  }
  return null;
});

positive("manifest의 기하 계약이 규범과 일치함", () => {
  if (manifest.viewBox !== "0 0 24 24") return `viewBox가 ${manifest.viewBox}입니다`;
  if (JSON.stringify(manifest.strokeWidths) !== JSON.stringify(["1.5"])) {
    return `strokeWidths가 ${JSON.stringify(manifest.strokeWidths)}입니다`;
  }
  for (const icon of manifest.icons) {
    if (icon.figmaName !== `icon/${icon.name}`) {
      return `${icon.name}: figmaName이 ${icon.figmaName}입니다`;
    }
    if (!/^[0-9a-f]{16}$/.test(icon.geometryHash)) {
      return `${icon.name}: geometryHash 형식이 다릅니다`;
    }
    if (icon.elementCount < 1) return `${icon.name}: 그릴 요소가 없습니다`;
  }
  return null;
});

withCanary(
  GLYPH,
  (source) => source.replace('viewBox="0 0 24 24"', 'viewBox="0 0 32 32"'),
  "viewBox 이탈",
  "정본은",
);

withCanary(
  GLYPH,
  (source) => source.replace('stroke="currentColor"', 'stroke="#00C68E"'),
  "raw 색 주입",
  "중립색이 아닙니다",
);

withCanary(
  GLYPH,
  (source) => source.replace('stroke-width="1.5"', 'stroke-width="2.4"'),
  "stroke 두께 이탈",
  "허용 집합 밖입니다",
);

withCanary(
  GLYPH,
  (source) => source.replace("<polyline ", '<polyline opacity="0.45" '),
  "opacity 알파 사다리 이탈",
  "알파 16단(DS-D-0026) 밖입니다",
);

withCanary(
  GLYPH,
  (source) => source.replace("<polyline ", '<polyline id="clip0_234_1854" '),
  "id 잔재",
  "문서 전역에서 충돌",
);

withCanary(
  GLYPH,
  (source) => source.replace("</svg>", '  <text x="0" y="0"/>\n</svg>'),
  "허용 밖 요소",
  "허용되지 않은 요소",
);

withCanary(
  GLYPH,
  (source) =>
    source.replace(
      "</svg>",
      '  <rect x="0" y="0" width="24" height="24" fill="none"/>\n</svg>',
    ),
  "그리지 않는 요소",
  "아무것도 그리지 않습니다",
);

withCanary(
  PROVENANCE,
  (source) =>
    editProvenance(source, (document) => {
      delete document.glyphs["check-circle"];
    }),
  "provenance 삭제",
  "provenance가 선언되지 않았습니다",
);

// 키워드가 없으면 그 아이콘은 **이름을 아는 사람만** 찾을 수 있다. 조용히 빠지면 아무도 모른다.
withCanary(
  KEYWORDS,
  (source) => {
    const document = JSON.parse(source);
    delete document.keywords["check-circle"];
    return `${JSON.stringify(document, null, 2)}\n`;
  },
  "검색 키워드 삭제",
  "검색 키워드가 없거나",
);

// 영어만 넣으면 "휴지통"으로 찾는 사람이 못 찾는다.
withCanary(
  KEYWORDS,
  (source) => {
    const document = JSON.parse(source);
    document.keywords["check-circle"] = ["check", "success", "done"];
    return `${JSON.stringify(document, null, 2)}\n`;
  },
  "검색 키워드 한국어 누락",
  "검색 키워드에 한국어가 없습니다",
);

withCanary(
  PROVENANCE,
  (source) =>
    editProvenance(source, (document) => {
      document.sets.phosphor.license = "unknown";
    }),
  "provenance 추정",
  "세트 정의가 불완전합니다",
);

withCanary(
  PROVENANCE,
  (source) =>
    editProvenance(source, (document) => {
      document.sets.phosphor.licenseFile = "does-not-exist.txt";
    }),
  "라이선스 원문 미참조",
  "고지문 없이 배포할 수 없습니다",
);

withCanary(
  PROVENANCE,
  (source) =>
    editProvenance(source, (document) => {
      delete document.sets.phosphor.licenseFile;
    }),
  "licenseFile 누락",
  "세트 정의가 불완전합니다 (licenseFile)",
);

withCanary(
  PROVENANCE,
  (source) =>
    editProvenance(source, (document) => {
      document.glyphs["check-circle"] = "no-such-set:check-circle";
    }),
  "알 수 없는 세트",
  "알 수 없는 세트",
);

withCanary(
  PROVENANCE,
  (source) =>
    editProvenance(source, (document) => {
      document.glyphs["check-circle"] = "phosphor";
    }),
  "글리프 항목 형식 이탈",
  '"세트:원래 이름" 또는 "original"이 아닙니다',
);

withCanary(
  PROVENANCE,
  (source) =>
    editProvenance(source, (document) => {
      document.sets.extra = {
        project: "Extra",
        license: "MIT",
        licenseFile: "phosphor.txt",
        url: "https://example.com/extra",
      };
    }),
  "쓰이지 않는 세트",
  "어떤 글리프도 쓰지 않는 세트",
);

withAddedLicense(
  // 아무도 참조하지 않는 라이선스 원문. 근거 없는 고지 항목이 실리는 경로다.
  "orphan.txt",
  "MIT License\n\nCopyright (c) 2026 Nobody\n",
  "고아 라이선스 원문",
  "어떤 세트도 참조하지 않는",
);

withCanary(
  GLYPH,
  // XML에서 작은따옴표는 큰따옴표와 완전히 동등하다. 이전 파서는 이 형태를 못 읽고 요소를
  // 조용히 버려서, 계약 위반 셋을 담은 경로가 통과하면서 동시에 생성물에서 사라졌다.
  (source) =>
    source.replace(
      "</svg>",
      "  <path id='clip0_234' d='M2 2h20' fill='none' stroke='#ff0000' stroke-width='9'/>\n</svg>",
    ),
  "작은따옴표 우회",
  "정본에 남을 수 없습니다",
);

withCanary(
  GLYPH,
  (source) => source.replace("<svg ", '<svg stroke="currentColor" '),
  "root svg 속성 주입",
  "root <svg>의 허용되지 않은 속성",
);

withCanary(
  GLYPH,
  // 파서가 못 읽는 형태. 무음 누락이 아니라 실패여야 한다.
  (source) => source.replace("</svg>", '  <path d=M4h16 />\n</svg>'),
  "파서 무음 누락",
  "파서가 읽지 못한 태그가 있습니다",
);

withCanary(
  PROVENANCE,
  (source) =>
    editProvenance(source, (document) => {
      document.sets.phosphor.license = "Unknown";
    }),
  "상투어 대소문자 우회",
  "세트 정의가 불완전합니다",
);

withCanary(
  PROVENANCE,
  (source) =>
    editProvenance(source, (document) => {
      document.sets.phosphor.project = "Phosphor\n```\n## 위조된 절\n```text\n아무 문장";
    }),
  "고지문 위조",
  "고지문 구조를 위조",
);

withCanary(
  PROVENANCE,
  (source) =>
    editProvenance(source, (document) => {
      document.sets.phosphor.url = "https://";
    }),
  "세트 url 형태 우회",
  "https URL이 아닙니다",
);

withAddedGlyphs(
  // 둘 다 pascalCase에서 IconX2가 된다. 이름이 다른데 심볼이 같으면 뒤엣것이 앞엣것을 덮는다.
  [
    { name: "x-2", svg: VALID_GLYPH, record: ORIGINAL_RECORD },
    { name: "x2", svg: VALID_GLYPH.replace("M4 4h16", "M5 5h14"), record: ORIGINAL_RECORD },
  ],
  "심볼 충돌",
  "같은 심볼",
);

withAddedGlyphs(
  // 같은 그림을 original로 다시 선언하면 upstream 쪽 고지 의무가 가려진다.
  [
    {
      name: "check-circle-copy",
      svg: readFileSync(resolve(repoRoot, GLYPH), "utf8"),
      record: ORIGINAL_RECORD,
    },
  ],
  "지오메트리 중복",
  "지오메트리가 같습니다",
);

withCanary(
  GENERATED,
  (source) => `${source}\n// canary drift\n`,
  "generated drift",
  "generated output drift",
);

// canary가 정본을 되돌렸는지 마지막으로 한 번 더 전체를 확인한다.
try {
  runBuild("--check");
} catch (error) {
  errors.push(
    `canary 이후 check가 실패했습니다. 복원이 완전하지 않습니다:\n` +
      `${String(error.stdout ?? "") + String(error.stderr ?? "")}`,
  );
}

if (errors.length > 0) {
  console.error(errors.map((error) => `- ${error}`).join("\n"));
  process.exit(1);
}

console.log(
  `Icon gates OK (positive ${positives.length}, 변조 canary ${canaries.length}종)\n` +
    `Positive: ${positives.join(", ")}\n` +
    `Canaries: ${canaries.join(", ")}`,
);
