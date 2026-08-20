import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

// (A2) 반증 결과의 인용을 기계가 다시 확인한다.
//
// **왜 있는가.** 에이전트에게 "이 주장 맞아?"라고 물으면 대체로 그렇다고 한다. "꼼꼼히 보라"는
// 지시는 반증할 수 없어서 **훑은 것과 읽은 것이 출력에서 구분되지 않는다.** 그래서 확인 판정에
// 문장이 아니라 원문 인용을 받았고(`AGENTS.md`의 「A claim about the product needs a quotation」),
// 여기서 그 인용이 고정 커밋의 그 파일 그 줄에 **글자 그대로** 있는지 다시 연다.
//
// 판정:
//   OK       인용이 적힌 줄 번호에 그대로 있다
//   줄어긋남  파일 안에는 있는데 줄 번호가 다르다 — 인용은 진짜지만 좌표가 낡았다
//   무효     파일에 그 줄이 없다. **확인이 아니라 기각이다.**
//
// 인용을 지어내면 여기서 걸린다. 그것이 이 스크립트의 전부다.

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const resultPath = resolve(repoRoot, "migration/product-has-refutation.json");
const productRoot = process.env.KLIPSE_PRODUCT_REPO ?? "/Users/sejunki/klipse-web";

if (!existsSync(resultPath)) {
  console.error("[refutation-quotes] 반증 결과가 없습니다: migration/product-has-refutation.json");
  process.exit(1);
}

const result = JSON.parse(readFileSync(resultPath, "utf8"));
const commit = result.commit;
if (!commit || !/^[0-9a-f]{40}$/.test(commit)) {
  console.error("[refutation-quotes] 결과 파일에 고정 커밋(40자 SHA)이 없습니다: " + commit);
  process.exit(1);
}

const confirmed = (result.axes ?? []).filter((a) => a.survived);
if (confirmed.length === 0) {
  console.log("[refutation-quotes] 살아남은 확인이 없습니다. 대조할 인용이 없습니다.");
  process.exit(0);
}

if (!existsSync(resolve(productRoot, ".git"))) {
  console.log(
    "[refutation-quotes] SKIPPED (제품 저장소 없음: " + productRoot + "). 확인 " +
      confirmed.length + "건의 인용은 " + commit.slice(0, 8) + " 기준이며 로컬에서 확인해야 합니다.",
  );
  process.exit(0);
}

// 파일을 한 번만 읽어 재사용한다. 같은 파일에 여러 축이 걸린다.
const cache = new Map();
const readProductFile = (path) => {
  if (cache.has(path)) return cache.get(path);
  let lines = null;
  try {
    lines = execFileSync("git", ["show", commit + ":" + path], {
      cwd: productRoot,
      encoding: "utf8",
      maxBuffer: 64 * 1024 * 1024,
      // 없는 경로는 여기서 판정하므로 git의 fatal 메시지를 흘리지 않는다.
      stdio: ["ignore", "pipe", "ignore"],
    }).split("\n");
  } catch {
    lines = null;
  }
  cache.set(path, lines);
  return lines;
};

const dsCache = new Map();
const readDsFile = (path) => {
  if (dsCache.has(path)) return dsCache.get(path);
  const absolute = resolve(repoRoot, path);
  let lines = null;
  if (existsSync(absolute)) lines = readFileSync(absolute, "utf8").split("\n");
  dsCache.set(path, lines);
  return lines;
};

const norm = (value) => (value ?? "").replace(/\s+/g, " ").trim();

const check = (lines, line, quote) => {
  if (lines === null) return { status: "없는파일" };
  const wanted = norm(quote);
  if (wanted === "") return { status: "인용없음" };
  const at = norm(lines[line - 1]);
  if (at === wanted) return { status: "OK" };
  // 줄 번호가 어긋났는가, 아니면 아예 없는가.
  const found = lines.findIndex((raw) => norm(raw) === wanted);
  if (found >= 0) return { status: "줄어긋남", actualLine: found + 1 };
  // 한 줄이 길게 접혀 있을 수 있다 — 파일 전체에서 부분 문자열로도 찾아본다.
  const whole = norm(lines.join(" "));
  if (wanted.length >= 12 && whole.includes(wanted)) return { status: "줄어긋남", actualLine: 0 };
  return { status: "무효" };
};

const problems = [];
let ok = 0;
let drifted = 0;

for (const axis of confirmed) {
  const product = check(readProductFile(axis.productFile), axis.productLine, axis.quotedLine);
  if (product.status === "OK") ok += 1;
  else if (product.status === "줄어긋남") {
    drifted += 1;
    problems.push({
      severity: "경고",
      path: axis.path,
      detail:
        "제품 인용이 " + axis.productFile + ":" + axis.productLine + "에 없고 " +
        (product.actualLine ? product.actualLine + "줄에 있습니다" : "다른 자리에 있습니다") +
        " — 좌표가 낡았습니다",
    });
  } else {
    problems.push({
      severity: "무효",
      path: axis.path,
      detail:
        "제품 인용을 " + commit.slice(0, 8) + "의 " + (axis.productFile || "(파일 없음)") +
        "에서 찾지 못했습니다 (" + product.status + "): " + JSON.stringify(axis.quotedLine ?? ""),
    });
  }

  // DS 쪽 인용도 같은 기준으로 본다. 없으면 경고에 그친다 — 판정의 주어는 제품 쪽이다.
  if (axis.dsFile && axis.dsQuotedLine) {
    const ds = check(readDsFile(axis.dsFile), axis.dsLine, axis.dsQuotedLine);
    if (ds.status !== "OK") {
      problems.push({
        severity: ds.status === "무효" || ds.status === "없는파일" ? "무효" : "경고",
        path: axis.path,
        detail:
          "DS 인용을 " + axis.dsFile + ":" + axis.dsLine + "에서 확인하지 못했습니다 (" +
          ds.status + "): " + JSON.stringify(axis.dsQuotedLine),
      });
    }
  }
}

const voided = problems.filter((p) => p.severity === "무효");
const warnings = problems.filter((p) => p.severity === "경고");

for (const p of warnings) console.error("[refutation-quotes] 경고 · " + p.path + " — " + p.detail);
for (const p of voided) console.error("[refutation-quotes] 무효 · " + p.path + " — " + p.detail);

console.log(
  "[refutation-quotes] " + (voided.length > 0 ? "실패" : "OK") +
    ": 확인 " + confirmed.length + "건 @ " + commit.slice(0, 8) +
    " · 인용 일치 " + ok + " · 줄어긋남 " + drifted + " · **무효 " + voided.length + "**",
);

if (voided.length > 0) {
  console.error(
    "[refutation-quotes] 인용을 찾지 못한 확인은 확인이 아닙니다. 해당 축을 기각으로 되돌리세요.",
  );
  process.exit(1);
}
