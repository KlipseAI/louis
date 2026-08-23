import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { atomicWriteBatch } from "./lib/atomic-output.mjs";
import { collectDocCitations, resolveCitation } from "./lib/doc-citations.mjs";
import { PRODUCT_FILES } from "./lib/product-files.mjs";

// product.measured.json이 인용한 제품 파일의 blob 해시를 배포본에서 뽑아 고정한다.
// 대조는 scripts/verify-product-evidence.mjs가 한다.
const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const measuredPath = resolve(repoRoot, "migration/product.measured.json");
const outputPath = resolve(repoRoot, "migration/product-evidence.lock.json");
const productRoot = process.env.KLIPSE_PRODUCT_REPO ?? "/Users/sejunki/klipse-web";
// 정본은 `design` 브랜치다. `origin/main`이 아니다 — 2026-08-21 확정.
// `origin/main`에는 이미 폐지된 개념(글래스 섀도우 5겹)이 남아 있어 그것을 읽으면
// 문서가 죽은 토큰을 가르친다. 저장소 기본 브랜치도 `main`이 아니라 `dev`다.
const productRef = process.env.KLIPSE_PRODUCT_REF ?? "design";

if (!existsSync(resolve(productRoot, ".git"))) {
  console.error("[product-evidence] 제품 저장소가 없습니다: " + productRoot);
  process.exit(1);
}

const measured = JSON.parse(readFileSync(measuredPath, "utf8"));
const cited = new Set();
collect(measured.components);

const commit = git(["rev-parse", productRef]);

// **원격에 없는 커밋은 기준선이 될 수 없다.** 2026-08-22까지 이 락은 `a3ed8e03`을 고정하고
// 있었는데 그 커밋은 원저자 맥의 로컬 `design` 브랜치에만 있었다 — 원격 어디에도 없다.
// 다른 맥에서 제품을 clone 하면 `git show <commit>:<path>`가 전부 실패하므로 근거 83건이
// 통째로 검증 불가가 되고 `verify:product` 13게이트가 죽는다. 그런데 hosted CI도
// `pnpm clean-room`도 제품 저장소를 읽지 않으므로 **이 결함에 대해서는 영원히 초록이다.**
// 사람이 눈치챌 자리가 없으므로 기준선을 박는 이 자리에서 막는다.
if (git(["branch", "-r", "--contains", commit]) === "") {
  console.error(
    "[product-evidence] 원격에 없는 커밋을 기준선으로 박을 수 없습니다: " +
      commit.slice(0, 8) +
      " (" +
      productRef +
      ")",
  );
  console.error(
    "[product-evidence] 이 커밋은 " +
      productRoot +
      " 에만 있습니다. 다른 맥에서는 근거 대조가 불가능합니다.",
  );
  console.error(
    "[product-evidence] 먼저 push 하거나, KLIPSE_PRODUCT_REF=origin/<branch> 로 원격 커밋을 기준선으로 쓰세요.",
  );
  process.exit(1);
}

// **산문이 인용한 파일도 고정한다.** 2026-08-21까지 이 락은 `product.measured.json`이 인용한
// 파일만 봤고, design 문서가 본문에서 인용한 제품 파일은 **아무도 지키지 않았다** — 제품이
// 그 파일을 바꾸면 문서의 좌표가 조용히 낡는다. 이식번들의 인용 124건이 그렇게 낡았다.
const treeSet = new Set(
  git(["ls-tree", "-r", "--name-only", commit]).split("\n").filter(Boolean),
);
const aliasFile = JSON.parse(
  readFileSync(resolve(repoRoot, "migration/citation-aliases.json"), "utf8"),
);
const aliases = new Map(Object.entries(aliasFile.aliases ?? {}));
for (const citation of collectDocCitations(repoRoot)) {
  const alias = aliases.get(citation.file);
  const resolved = alias ? { path: alias } : resolveCitation(citation.file, treeSet);
  // 해결 못 하는 인용은 여기서 조용히 넘긴다 — 그것을 실패로 만드는 것은 verify-citations의 일이다.
  if (resolved.path) cited.add(resolved.path);
}
// **탐침이 읽는 파일도 고정한다.** 그전까지 lock은 `product.measured.json`과 문서가 인용한
// 파일만 걷었다. 탐침은 `from` 그룹으로 제품 상수를 참조하므로 그 경로가 인용문에 나타나지
// 않고, 그래서 캐러셀·스피너·캔버스 빈 상태 셋이 lock 밖에 있었다 — 17축을 매달아 두고
// 제품이 그 파일을 바꿔도 아무도 알려 주지 않는 상태였다.
for (const file of Object.values(PRODUCT_FILES)) cited.add(file);

const evidence = {};
for (const file of [...cited].sort()) {
  const line = git(["ls-tree", commit, "--", file]);
  if (!line) {
    console.error("[product-evidence] 배포본에 없는 파일을 인용합니다: " + file);
    process.exit(1);
  }
  evidence[file] = line.split(/\s+/)[2];
}

const payload =
  JSON.stringify(
    {
      $comment:
        "생성물. scripts/build-product-evidence.mjs가 배포본에서 뽑는다. 직접 수정하지 않는다.",
      $whyThisExists:
        "migration/product.measured.json의 축들은 제품 파일을 인용한다. 그 파일이 제품에서 바뀌어도 이 저장소는 알 방법이 없었다 — 모든 게이트가 초록인 채로 실측이 낡는다. 여기에 인용 파일의 blob 해시를 고정해, 제품 저장소가 있을 때 어긋남을 실패로 만든다.",
      productRemote: git(["remote", "get-url", "origin"]),
      productRef,
      productCommit: commit,
      evidence,
    },
    null,
    2,
  ) + "\n";

atomicWriteBatch([{ absolute: outputPath, expected: payload }]);
console.log(
  "[product-evidence] built: 근거 파일 " +
    Object.keys(evidence).length +
    "개 @ " +
    commit.slice(0, 8),
);

function collect(node) {
  if (!node || typeof node !== "object") return;
  if (Array.isArray(node)) return node.forEach(collect);
  for (const value of Object.values(node)) {
    if (typeof value === "string") {
      const matches = value.match(/apps\/web\/[A-Za-z0-9_\-/.[\]]+/g);
      if (matches) for (const match of matches) cited.add(match);
    }
    collect(value);
  }
}

function git(args) {
  return execFileSync("git", args, {
    cwd: productRoot,
    encoding: "utf8",
    maxBuffer: 64 * 1024 * 1024,
  }).trim();
}
