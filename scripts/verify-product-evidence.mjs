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
const behind = countBehind(lock.productCommit, lock.productRef);
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

  // ── 앵커 이후 제품에 **새로 생긴** 파일 ──────────────────────────────────
  //
  // 위의 두 검사는 「lock 에 있는 파일」과 「인용된 파일」만 본다. 둘 다 이미 이름을 아는
  // 파일이라, 제품에 **새 파일이 생기는 것**에는 구조상 침묵한다. 2026-09-01 원장
  // `lock-anchor-hides-143-files` 가 그것을 셌다: 앵커 이후 바뀐 제품 `.tsx` 67개 중 43개가
  // 어떤 게이트에도 보이지 않고, 그중 새로 만들어진 것들은 lock 에 이름이 없으므로
  // **영원히** 보이지 않는다. 낡은 앵커가 낡았다는 사실 자체를 아무도 재지 않았다.
  //
  // 그래서 절대수 래칫을 둔다. 허용치는 0 이다 — baseline 을 두면 그 숫자만큼의 낙후가
  // 숨을 자리가 생기고, 이 저장소가 baseline 을 절대 위로 재생성하지 않는 이유와 같다.
  // 0 은 도달 불가능한 값이 아니다: `pnpm run build-product-evidence` 가 lock 을 다시 박는
  // 순간 앵커와 배포 ref 가 같아져 이 수는 정의상 0 이 된다(아래 두 번째 canary 가 그것을
  // 매 실행 증명한다).
  //
  // 세는 대상을 `.tsx`/`.css` 로 한정한 것은 의도다. 같은 구간의 신규 파일 전체는 API
  // 라우트·설정·스크립트를 포함해 훨씬 크고, 이 저장소가 재는 것은 화면의 모양이다.
  //
  // **지금 이 수를 0 으로 만들려고 앵커를 옮기지 말 것.** 재고정은 제품 워킹트리가 깨끗할 때
  // lock 갱신과 한 커밋으로 하는 별건이다 — 더러운 워킹트리에서 뜬 실측은 오염된다.
  const NEW_FILE_ALLOWANCE = 0;
  const anchorTree = readTree(lock.productCommit);
  if (anchorTree) {
    const watchable = (file) =>
      file.startsWith("apps/web/") && /\.(tsx|css)$/.test(file);
    const collectUnseen = (deployed, anchored) =>
      [...deployed.keys()]
        .filter((file) => watchable(file) && !anchored.has(file) && !locked.has(file))
        .sort();
    const describeUnseen = (unseen) => {
      if (unseen.length <= NEW_FILE_ALLOWANCE) return [];
      const shown = unseen.slice(0, 12);
      const rest = unseen.length - shown.length;
      return [
        "앵커 이후 제품에 새로 생긴 " +
          unseen.length +
          "개의 .tsx/.css 가 lock 밖에 있습니다(허용 " +
          NEW_FILE_ALLOWANCE +
          "개). 이 파일들은 이 저장소의 어떤 게이트에도 보이지 않습니다 — 이름이 없으므로 " +
          "blob 대조도 인용 대조도 닿지 않습니다: " +
          shown.join(", ") +
          (rest > 0 ? " 외 " + rest + "개" : "") +
          ". 앵커 " +
          lock.productCommit.slice(0, 8) +
          " 가 배포 ref `" +
          lock.productRef +
          "` 보다 " +
          (behind === null ? "여러" : behind) +
          "커밋 낡았다는 뜻입니다. `pnpm run build-product-evidence` 로 lock 을 다시 박으면 " +
          "이 수는 0 이 됩니다 — 다만 재고정은 제품 워킹트리가 깨끗할 때 하는 별건입니다.",
      ];
    };

    const unseen = collectUnseen(actual, anchorTree);
    const unseenFailures = describeUnseen(unseen);
    failures.push(...unseenFailures);

    // canary 둘. 하나는 검출력을, 하나는 **초록에 도달할 수 있음**을 증명한다.
    // 두 번째가 없으면 이 래칫은 구조상 영원히 빨간 게이트와 구별되지 않는다.
    const unseenBaseline = new Set(unseenFailures);
    const tampered = new Map(actual);
    tampered.set("apps/web/components/this-file-was-added-after-the-anchor.tsx", "0".repeat(40));
    const introduced = describeUnseen(collectUnseen(tampered, anchorTree)).filter(
      (item) => !unseenBaseline.has(item),
    );
    if (introduced.length === 0) {
      failures.push(
        unseenBaseline.size === 0
          ? "canary가 변조를 잡지 못했습니다: 앵커 이후 새로 생긴 파일"
          : "canary의 검출력을 증명하지 못했습니다 — 기존 실패에 가려집니다: 앵커 이후 새로 생긴 파일",
      );
    }
    if (collectUnseen(actual, actual).length !== 0) {
      failures.push(
        "재고정 직후에도 이 래칫이 0 이 되지 않습니다. 허용치 0 이 도달 불가능한 값이라면 " +
          "그것은 낙후가 아니라 계산이 틀린 것입니다.",
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
      const matches = value.match(/apps\/web\/[A-Za-z0-9_\-/.[\]()]+/g); // `()` — 통합 판(DS-D-0079)의 라우트 그룹 폴더 `app/(auth-brand)/…`
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

// 앵커가 배포 ref 보다 몇 커밋 뒤인지. 진단에만 쓰므로 실패하면 조용히 null 을 준다 —
// 여기서 게이트를 죽이면 정작 세려던 낙후를 못 보고 끝난다.
function countBehind(from, to) {
  try {
    return Number(
      execFileSync("git", ["rev-list", "--count", from + ".." + to], {
        cwd: productRoot,
        encoding: "utf8",
      }).trim(),
    );
  } catch {
    return null;
  }
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
