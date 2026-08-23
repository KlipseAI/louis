import { existsSync, readFileSync, readdirSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

// 문서가 인용한 **이 저장소 안의 경로**가 실재하는지 본다.
//
// **왜 있는가.** `verify-citations.mjs`는 제품 저장소 인용만 본다. 저장소 자신의 파일을 가리키는
// 인용은 아무도 보지 않았고, 그래서 2026-08-23 정리에서 다섯 커밋이 이것들을 그대로 통과시켰다.
//
//   figma/apply-variables.js      단수 파일은 없다. 실제는 apply-variables.1.js ~ .7.js
//   figma/inventory-draw.1~3.js   실제 8개. 그리고 .1.js가 RESET=true라 1~3만 넘기면
//                                 보드를 지우고 8분의 3만 복구한다 — 실행하면 데이터를 잃는다
//   test/fixtures/*.tsx           실제는 packages/react/test/fixtures/
//   scripts/route-coverage-levels.json  실제는 migration/product-screens/
//
// 없는 파일을 가리키는 지시는 「없는 것을 찾느라 시간을 버린다」로 끝나지 않는다. 위 두 번째처럼
// **따라 하면 파괴적인 것**이 섞인다.
//
// 판정: 백틱 안의 문자열이 이 저장소의 디렉터리 접두사로 시작하고 확장자나 `/`로 끝나면 경로로
// 보고 존재를 확인한다. glob(`*`)은 하나라도 맞으면 통과한다.
//
// 면제는 `migration/doc-path-exemptions.json`이 소유하며 **이유를 반드시 적는다.**
// 명부에 없는 새 미존재 경로도, 해소됐는데 명부에 남은 항목도 실패다 — 빚은 줄기만 한다.

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const exemptionPath = resolve(repoRoot, "migration/doc-path-exemptions.json");

// 이 저장소가 소유하는 최상위 디렉터리만 본다. `apps/web/**`는 제품 저장소 경로이므로
// verify-citations의 몫이다.
const PREFIX = /^(scripts|packages|figma|design|migration|test|\.github|\.claude)\//;

// 기록 성격이라 그 시점의 경로를 담는 것이 정상인 곳.
const SKIP_FILE = [
  /^design\/updates\//, // 사용자 영향 변경 로그 — 과거 항목은 고치지 않는다
  /^design\/llms\//, // 생성물. 원본을 고치면 따라온다
  /^migration\/figma-transfer\//, // 이관 번들 기록
  /^migration\/stale-doc-worklist\.md$/, // 낡음을 인용하는 것이 목적인 문서
  /^scripts\/verify-doc-paths\.mjs$/, // 이 파일 자신 — canary 문자열이 들어 있다
  /^node_modules\//,
  /generated\//,
  /\/dist\//,
];

const SCAN_DIRS = ["design", "migration", "packages", "scripts", "figma", ".claude", ".github"];
const SCAN_ROOT_FILES = ["AGENTS.md", "CLAUDE.md", "README.md"];
const SCAN_EXT = /\.(md|mjs|json|css|ts|tsx|yml)$/;

const files = [];
const walk = (rel) => {
  for (const entry of readdirSync(join(repoRoot, rel), { withFileTypes: true })) {
    const child = rel + "/" + entry.name;
    if (SKIP_FILE.some((r) => r.test(child))) continue;
    if (entry.isDirectory()) walk(child);
    else if (SCAN_EXT.test(entry.name)) files.push(child);
  }
};
for (const dir of SCAN_DIRS) if (existsSync(join(repoRoot, dir))) walk(dir);
for (const file of SCAN_ROOT_FILES) if (existsSync(join(repoRoot, file))) files.push(file);
files.sort();

const globMatches = (pattern) => {
  const star = pattern.indexOf("*");
  const cut = pattern.lastIndexOf("/", star);
  if (cut < 0) return false;
  const dir = pattern.slice(0, cut);
  if (!existsSync(resolve(repoRoot, dir))) return false;
  const rx = new RegExp(
    "^" + pattern.replace(/[.+^${}()|[\]\\]/g, "\\$&").replace(/\*/g, "[^/]*") + "$",
  );
  const found = [];
  const collect = (rel, depth) => {
    if (depth > 6) return;
    for (const entry of readdirSync(join(repoRoot, rel), { withFileTypes: true })) {
      const child = rel + "/" + entry.name;
      if (entry.isDirectory()) collect(child, depth + 1);
      else found.push(child);
    }
  };
  collect(dir, 0);
  return found.some((f) => rx.test(f));
};

// 백틱 안에서 경로 후보를 뽑는다. `path:12` · `path:12-34` 형태의 좌표 접미사는 떼고 본다.
const scan = (source) => {
  const missing = [];
  for (const file of files) {
    const text = source.get(file) ?? readFileSync(join(repoRoot, file), "utf8");
    text.split("\n").forEach((line, index) => {
      for (const match of line.matchAll(/`([^`\n]+)`/g)) {
        let candidate = match[1].trim().replace(/:\d+(-\d+)?$/, "").replace(/[.,)]$/, "");
        if (!PREFIX.test(candidate)) continue;
        if (candidate.includes(" ")) continue;
        if (/[{}<>~]/.test(candidate)) continue; // 자리표시 표기는 경로가 아니다
        if (!/\.[a-z0-9]{2,5}$/i.test(candidate) && !candidate.endsWith("/")) continue;
        const ok = candidate.includes("*")
          ? globMatches(candidate)
          : existsSync(resolve(repoRoot, candidate));
        if (!ok) missing.push({ path: candidate, at: `${file}:${index + 1}` });
      }
    });
  }
  return missing;
};

const exemptions = JSON.parse(readFileSync(exemptionPath, "utf8"));
const exemptPaths = new Map(exemptions.paths.map((e) => [e.path, e]));

const failures = [];
const missing = scan(new Map());

const seen = new Set();
for (const item of missing) {
  seen.add(item.path);
  if (exemptPaths.has(item.path)) continue;
  failures.push(
    `실재하지 않는 경로를 인용합니다: \`${item.path}\` (${item.at}). ` +
      `경로를 고치거나, 고칠 수 없는 이유를 migration/doc-path-exemptions.json 에 적으세요.`,
  );
}

for (const entry of exemptions.paths) {
  if (!seen.has(entry.path)) {
    failures.push(
      `면제 명부에 남아 있지만 더 이상 인용되지 않습니다: \`${entry.path}\`. 명부에서 지우세요.`,
    );
  }
}

// 변조 canary. 검출력을 증명하지 못하면 통과가 통과가 아니다.
const CANARY_FILE = "design/README.md";
const canaryAbsolute = resolve(repoRoot, CANARY_FILE);
const original = readFileSync(canaryAbsolute, "utf8");
const canaries = [
  {
    label: "없는 파일 경로 주입",
    inject: original + "\n<!-- canary --> `scripts/this-file-does-not-exist.mjs`\n",
  },
  {
    label: "맞는 것이 없는 glob 주입",
    inject: original + "\n<!-- canary --> `packages/nonexistent-pkg/src/*.ts`\n",
  },
];

const baseline = new Set(failures);
for (const canary of canaries) {
  const injected = scan(new Map([[CANARY_FILE, canary.inject]]));
  const introduced = injected
    .filter((item) => !exemptPaths.has(item.path))
    .filter((item) => !missing.some((m) => m.path === item.path && m.at === item.at));
  if (introduced.length === 0) {
    failures.push(`canary가 변조를 잡지 못했습니다: ${canary.label}`);
  }
}
// 파일은 읽기만 했으므로 복원할 것이 없다 — 주입은 메모리에서만 일어난다.
if (readFileSync(canaryAbsolute, "utf8") !== original) {
  failures.push("canary가 저장소 파일을 바꿨습니다. 이 게이트는 파일을 쓰지 않아야 합니다.");
}

if (failures.length > 0) {
  for (const failure of failures) console.error("[doc-paths] " + failure);
  console.error(
    "[doc-paths] 실패: " + failures.length + "건. 문서가 없는 파일을 가리키면 " +
      "다음 사람이 없는 것을 찾거나, 더 나쁘게는 틀린 것을 실행한다.",
  );
  process.exit(1);
}

console.log(
  "[doc-paths] OK (문서 " + files.length + "개에서 저장소 경로 인용을 확인 · 면제 " +
    exemptions.paths.length + "건 · 변조 canary " + canaries.length + "종)",
);
