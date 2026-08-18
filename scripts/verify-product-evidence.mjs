import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

// migration/product.measured.json의 187축은 제품 파일을 인용한다. 그 파일이 제품에서 바뀌어도
// 이 저장소는 알 방법이 없었다 — 모든 게이트가 초록인 채로 실측이 낡는다.
// 여기서 인용 파일의 blob 해시를 배포본과 대조한다. 제품 저장소가 없는 환경(hosted CI)에서는
// 건너뛰되 **건너뛰었다는 사실을 출력한다** — 조용한 통과는 통과가 아니다.
const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const lockPath = resolve(repoRoot, "migration/product-evidence.lock.json");
const productRoot = process.env.KLIPSE_PRODUCT_REPO ?? "/Users/sejunki/klipse-web";
const failures = [];

const lock = JSON.parse(readFileSync(lockPath, "utf8"));
const entries = Object.entries(lock.evidence);

if (entries.length === 0) failures.push("고정된 근거 파일이 없습니다.");

if (!existsSync(resolve(productRoot, ".git"))) {
  console.log(
    "[product-evidence] SKIPPED (제품 저장소 없음: " +
      productRoot +
      "). 근거 파일 " +
      entries.length +
      "개는 " +
      lock.productCommit.slice(0, 8) +
      " 기준으로 고정돼 있으며 로컬에서 확인해야 합니다.",
  );
  process.exit(failures.length > 0 ? 1 : 0);
}

const actual = readTree(lock.productRef);
if (actual) failures.push(...compare(actual));

// 변조 canary. 판정 기준은 "변조가 baseline에 없던 실패를 새로 만드는가"다 — 이미 실패가 있는
// 상태에서 canary가 가려지지 않게 한다.
const TAMPERS = [
  {
    label: "근거 파일의 내용이 바뀐 것",
    apply: (tree) => tree.set(entries[0][0], "0".repeat(40)),
  },
  {
    label: "근거 파일이 배포본에서 사라진 것",
    apply: (tree) => tree.delete(entries[entries.length - 1][0]),
  },
];

if (actual) {
  const baseline = new Set(failures);
  for (const tamper of TAMPERS) {
    const copy = new Map(actual);
    tamper.apply(copy);
    const introduced = compare(copy).filter((item) => !baseline.has(item));
    if (introduced.length === 0) {
      failures.push(
        baseline.size === 0
          ? "canary가 변조를 잡지 못했습니다: " + tamper.label
          : "canary의 검출력을 증명하지 못했습니다 — 기존 실패에 가려집니다: " + tamper.label,
      );
    }
  }
}

for (const failure of failures) console.error("[product-evidence] " + failure);
if (failures.length > 0) process.exit(1);
console.log(
  "[product-evidence] OK (근거 파일 " +
    entries.length +
    "개가 배포본 " +
    lock.productCommit.slice(0, 8) +
    "와 일치, 변조 canary " +
    TAMPERS.length +
    "종)",
);

function compare(tree) {
  const found = [];
  for (const [file, expected] of entries) {
    const actualBlob = tree.get(file);
    if (!actualBlob) found.push("배포본에 파일이 없습니다: " + file);
    else if (actualBlob !== expected)
      found.push(
        "근거 파일이 배포본에서 바뀌었습니다: " +
          file +
          " (고정 " +
          expected.slice(0, 8) +
          " ≠ 현재 " +
          actualBlob.slice(0, 8) +
          "). migration/product.measured.json의 해당 축을 다시 재고 lock을 갱신하세요.",
      );
  }
  return found;
}

function readTree(ref) {
  let output;
  try {
    output = execFileSync("git", ["ls-tree", "-r", ref], {
      cwd: productRoot,
      encoding: "utf8",
      maxBuffer: 64 * 1024 * 1024,
    });
  } catch (error) {
    failures.push("배포본 ref를 읽지 못했습니다: " + ref + " (" + error.message + ")");
    return undefined;
  }
  const tree = new Map();
  for (const line of output.split("\n")) {
    const match = line.match(/^\d+ blob ([0-9a-f]+)\t(.+)$/);
    if (match) tree.set(match[2], match[1]);
  }
  return tree;
}
