import { readFileSync, realpathSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { atomicWriteBatch } from "./lib/atomic-output.mjs";

// Figma의 컴포넌트 라벨은 규범 문서의 목적문을 그대로 싣는다. 손으로 옮기면 문서가 바뀌어도
// Figma가 따라오지 않으므로, 여기서 뽑아 고정하고 --check로 어긋남을 실패로 만든다.
const repoRoot = realpathSync(
  resolve(dirname(fileURLToPath(import.meta.url)), ".."),
);
const manifestPath = resolve(repoRoot, "design/manifest.json");
const outputPath = resolve(repoRoot, "figma/component-summaries.json");
const args = new Set(process.argv.slice(2));
const supportedArgs = new Set(["--check", "--write", "--help"]);
const errors = [];

for (const arg of args) if (!supportedArgs.has(arg)) errors.push("알 수 없는 옵션: " + arg);
if (args.has("--help")) {
  console.log("Usage: node scripts/build-figma-summaries.mjs [--check|--write]");
  process.exit(0);
}
if (args.has("--check") && args.has("--write"))
  errors.push("--check와 --write는 함께 사용할 수 없습니다.");
const checkOnly = args.has("--check");

const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
const summaries = {};

// 이름 해석은 build-figma-snapshot.mjs와 같은 규칙을 쓴다 — 한 문서가 Figma에서 여러
// component로 나뉘면 목적문도 그 수만큼 실린다.
for (const component of manifest.components) {
  const names = component.figmaNames ?? (component.figmaName ? [component.figmaName] : []);
  if (names.length === 0) continue;
  const purpose = purposeSentence(component);
  if (purpose) for (const name of names) summaries[name] = purpose;
}

const payload = JSON.stringify(
  {
    $comment:
      "생성물. scripts/build-figma-summaries.mjs가 규범 문서의 첫 문단에서 뽑는다. 직접 수정하지 않는다.",
    summaries,
  },
  null,
  2,
) + "\n";

if (checkOnly) {
  let current = "";
  try {
    current = readFileSync(outputPath, "utf8");
  } catch {
    errors.push("생성물이 없습니다: figma/component-summaries.json");
  }
  if (!errors.length && current !== payload)
    errors.push(
      "figma/component-summaries.json이 규범 문서와 다릅니다. `pnpm run build-figma-summaries`를 실행하고 Figma 라벨도 함께 갱신하세요.",
    );
} else {
  atomicWriteBatch([{ absolute: outputPath, expected: payload }]);
}

reportAndExit();

// H1 다음 첫 문단의 첫 문장. 목록·표·인용은 문단이 아니므로 건너뛴다.
function purposeSentence(entry) {
  let source;
  try {
    source = readFileSync(resolve(repoRoot, entry.doc), "utf8");
  } catch {
    errors.push("규범 문서를 읽을 수 없습니다: " + entry.doc);
    return undefined;
  }
  const body = source.replace(/^---\n[\s\S]*?\n---\n/, "");
  const heading = body.indexOf("\n# ");
  const afterHeading = body.slice(
    heading === -1 ? 0 : body.indexOf("\n", heading + 1),
  );
  for (const block of afterHeading.split(/\n\s*\n/)) {
    const text = block.trim();
    if (!text || /^[#|>\-*\d]/.test(text)) continue;
    const flat = text.replace(/\s*\n\s*/g, " ").replace(/\*\*/g, "");
    const stop = flat.search(/[.。](\s|$)/);
    const sentence = stop === -1 ? flat : flat.slice(0, stop + 1);
    if (sentence.length >= 8) return sentence.trim();
  }
  errors.push("목적문을 찾지 못했습니다: " + entry.doc);
  return undefined;
}

function reportAndExit() {
  if (errors.length > 0) {
    for (const error of errors) console.error("[figma-summaries] " + error);
    process.exit(1);
  }
  console.log(
    "[figma-summaries] " +
      (checkOnly ? "checked" : "built") +
      ": 목적문 " +
      Object.keys(summaries).length +
      "개",
  );
}
