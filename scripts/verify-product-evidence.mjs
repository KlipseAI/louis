import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { collectDocCitations, resolveCitation } from "./lib/doc-citations.mjs";
import { PRODUCT_FILES } from "./lib/product-files.mjs";

// migration/product.measured.json의 187축은 제품 파일을 인용한다. 그 파일이 제품에서 바뀌어도
// 이 저장소는 알 방법이 없었다 — 모든 게이트가 초록인 채로 실측이 낡는다.
// 여기서 인용 파일의 blob 해시를 배포본과 대조한다. 제품 저장소가 없는 환경(hosted CI)에서는
// 건너뛰되 **건너뛰었다는 사실을 출력한다** — 조용한 통과는 통과가 아니다.
const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const lockPath = resolve(repoRoot, "migration/product-evidence.lock.json");
const productRoot = process.env.KLIPSE_PRODUCT_REPO ?? "/Users/sejunki/klipse-web";
const failures = [];

const lock = JSON.parse(readFileSync(lockPath, "utf8"));
const measured = JSON.parse(
  readFileSync(resolve(repoRoot, "migration/product.measured.json"), "utf8"),
);
const aliasFile = JSON.parse(
  readFileSync(resolve(repoRoot, "migration/citation-aliases.json"), "utf8"),
);
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

// **락이 인용 집합과 어긋나는지도 본다.**
//
// blob 대조만으로는 「지키지 않는 근거가 지켜지는 것처럼 보이는」 상태를 못 잡는다. 락은 사람이
// `build-product-evidence.mjs`를 돌릴 때만 갱신되는데 문서는 그 사이에도 바뀐다. 그래서 둘이 난다 —
// ① 아무도 인용하지 않는 항목이 남는다(무해하지만 낡음) ② **새로 인용된 파일이 락에 없다**(위험).
// ②가 위험한 이유는 그 파일이 제품에서 바뀌어도 이 게이트가 침묵하기 때문이다.
//
// 2026-08-23에 실제로 ①이 있었다 — 락이 `75018bf` 이후 재생성되지 않아 그 사이 문서 커밋 10개가
// 인용 집합을 바꾼 것을 반영하지 못했다. 아무도 그것을 잡지 않았다.
if (actual) {
  const cited = new Set();
  collectMeasuredCitations(measured.components, cited);
  for (const file of Object.values(PRODUCT_FILES)) cited.add(file);
  const treeNames = new Set(actual.keys());
  const aliases = new Map(Object.entries(aliasFile.aliases ?? {}));
  for (const citation of collectDocCitations(repoRoot)) {
    const alias = aliases.get(citation.file);
    const resolved = alias ? { path: alias } : resolveCitation(citation.file, treeNames);
    if (resolved.path) cited.add(resolved.path);
  }
  const compareFreshness = (locked) => {
    const found = [];
    const missing = [...cited].filter((file) => !locked.has(file)).sort();
    const stale = [...locked].filter((file) => !cited.has(file)).sort();
    if (missing.length > 0) {
      found.push(
        "인용됐지만 lock에 고정되지 않은 파일 " + missing.length + "개: " + missing.join(", ") +
          ". 제품이 그 파일을 바꿔도 이 게이트가 침묵합니다 — `pnpm build-product-evidence`로 갱신하세요.",
      );
    }
    if (stale.length > 0) {
      found.push(
        "아무도 인용하지 않는데 lock에 남아 있는 파일 " + stale.length + "개: " + stale.join(", ") +
          ". `pnpm build-product-evidence`로 갱신하세요.",
      );
    }
    return found;
  };

  const locked = new Set(entries.map(([file]) => file));
  const freshnessFailures = compareFreshness(locked);
  failures.push(...freshnessFailures);

  // 신선도 검사의 canary. 두 방향을 각각 증명한다.
  const FRESHNESS_TAMPERS = [
    {
      label: "인용된 파일이 lock에서 빠진 것",
      apply: (set) => {
        const victim = [...cited].find((file) => set.has(file));
        if (victim) set.delete(victim);
      },
    },
    {
      label: "아무도 인용하지 않는 파일이 lock에 남은 것",
      apply: (set) => set.add("apps/web/this-file-is-cited-by-nobody.tsx"),
    },
  ];
  const freshnessBaseline = new Set(freshnessFailures);
  for (const tamper of FRESHNESS_TAMPERS) {
    const copy = new Set(locked);
    tamper.apply(copy);
    const introduced = compareFreshness(copy).filter((item) => !freshnessBaseline.has(item));
    if (introduced.length === 0) {
      failures.push(
        freshnessBaseline.size === 0
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
    "와 일치, 인용 집합과도 일치, 변조 canary " +
    (TAMPERS.length + 2) +
    "종)",
);

function collectMeasuredCitations(node, out) {
  if (!node || typeof node !== "object") return;
  if (Array.isArray(node)) return node.forEach((item) => collectMeasuredCitations(item, out));
  for (const value of Object.values(node)) {
    if (typeof value === "string") {
      const matches = value.match(/apps\/web\/[A-Za-z0-9_\-/.[\]]+/g);
      if (matches) for (const match of matches) out.add(match);
    }
    collectMeasuredCitations(value, out);
  }
}

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
