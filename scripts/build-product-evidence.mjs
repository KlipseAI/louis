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
// **앵커는 운영에 배포된 `main` 의 커밋이다(DS-D-0117, 2026-10-15).** 운영(prd)은 GitHub
// `KlipseAI/klipse-web` 의 `main` push 로 배포된다(제품 저장소의 배포 워크플로 deploy.yml — 이 저장소 경로가 아니다). 그래서
// KLIPSE_PRODUCT_REPO 는 운영 커밋의 읽기 전용 체크아웃이고 기준선은 그 체크아웃의 `HEAD` 다.
// (그전 정본은 `design` 브랜치(2026-08-21) → 작업 브랜치 통합 판(DS-D-0079)이었다.)
const productRef = process.env.KLIPSE_PRODUCT_REF ?? "HEAD";
// 배포가 일어나는 원격과 브랜치. lock 의 `productRemote` 는 이 값이다 — 체크아웃의 `origin` 은
// 원저자 맥의 로컬 클론(/Users/sejunki/klipse-web)일 수 있어 다른 맥에서 뜻이 없다.
const PUBLISHED_REMOTE =
  process.env.KLIPSE_PRODUCT_PUBLISHED_REMOTE ?? "https://github.com/KlipseAI/klipse-web.git";
const PUBLISHED_BRANCH = "main";

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
//
// **「원격에 있다」는 배포 원격의 `main` 에 있다는 뜻이다(DS-D-0117).** 그전에는 체크아웃의 원격 추적
// 브랜치(`git branch -r --contains`) 아무 데나 있으면 받았다. 그런데 운영 체크아웃의 `origin` 은 원저자 맥의
// 로컬 클론이라 그 원격 추적 브랜치는 GitHub 에 없는 로컬 브랜치까지 담고, 거꾸로 GitHub 의 `main` 은
// 원격 설정 없는 ref 로만 들어와 있을 수 있다. 어느 쪽도 「배포됐다」를 말하지 않는다. 그래서 배포 원격에
// 직접 묻는다 — `git ls-remote` 로 `main` 의 끝을 받아 기준선이 그 첫 부모 사슬 위에 있는지 본다. 첫 부모
// 사슬의 커밋은 하나하나가 `main` 이 가리켰던 커밋, 곧 push 로 운영에 배포됐던 커밋이다.
// 기준선을 옮기는 것은 일부러 하는 일이므로 여기서는 네트워크를 요구한다. 대조 게이트
// (verify-product-evidence)는 원격에 묻지 않는다.
//
// **예외 하나 — 작업 브랜치 통합 판(DS-D-0079, DS-D-0117 이 대신함).** 통합 판은 제품 저장소에 없는 병합
// 커밋이다. `integration.json` 의 `result` 와 같은 커밋만 받는다 — DS-D-0117 의 Rollback 이 이 길을 쓴다.
const integrationResult = (() => {
  try { return JSON.parse(readFileSync(resolve(repoRoot, "migration/product-integration/integration.json"), "utf8")).result ?? null; } catch { return null; }
})();
if (commit !== integrationResult) {
  let publishedTip;
  try {
    const line = git(["ls-remote", PUBLISHED_REMOTE, "refs/heads/" + PUBLISHED_BRANCH]);
    publishedTip = /^([0-9a-f]{40})\s/.exec(line)?.[1];
  } catch (error) {
    console.error(
      "[product-evidence] 배포 원격에 묻지 못했습니다: " + PUBLISHED_REMOTE + " (" + String(error.message).split("\n")[0] + ")",
    );
    console.error(
      "[product-evidence] 기준선 이동은 배포 원격의 `" + PUBLISHED_BRANCH + "` 을 확인해야 합니다 — 네트워크를 연결하고 다시 돌리세요.",
    );
    process.exit(1);
  }
  if (!publishedTip) {
    console.error("[product-evidence] 배포 원격에 `" + PUBLISHED_BRANCH + "` 이 없습니다: " + PUBLISHED_REMOTE);
    process.exit(1);
  }
  let hasTip = true;
  try {
    git(["cat-file", "-e", publishedTip + "^{commit}"]);
  } catch {
    hasTip = false;
  }
  if (!hasTip) {
    console.error(
      "[product-evidence] 배포 원격 `" + PUBLISHED_BRANCH + "` 의 끝 " + publishedTip.slice(0, 8) + " 이 " + productRoot +
        " 에 없습니다 — 먼저 fetch 하세요.",
    );
    process.exit(1);
  }
  const deployed = new Set(git(["rev-list", "--first-parent", publishedTip]).split("\n"));
  if (!deployed.has(commit)) {
    console.error(
      "[product-evidence] 운영에 배포된 커밋이 아닙니다: " + commit.slice(0, 8) + " (" + productRef + ") — " +
        PUBLISHED_REMOTE + " `" + PUBLISHED_BRANCH + "`(" + publishedTip.slice(0, 8) + ") 의 첫 부모 사슬에 없습니다.",
    );
    console.error(
      "[product-evidence] 앵커는 운영 배포를 따라간다(DS-D-0117). KLIPSE_PRODUCT_REPO 를 운영 커밋의 체크아웃으로 두세요.",
    );
    process.exit(1);
  }
  if (commit !== publishedTip) {
    console.log(
      "[product-evidence] 참고: 배포 원격 `" + PUBLISHED_BRANCH + "` 의 끝은 " + publishedTip.slice(0, 8) +
        " 이다 — 기준선 " + commit.slice(0, 8) + " 은 그보다 앞선 배포다.",
    );
  }
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
      productRemote: commit === integrationResult ? git(["remote", "get-url", "origin"]) : PUBLISHED_REMOTE,
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
      const matches = value.match(/apps\/web\/[A-Za-z0-9_\-/.[\]()]+/g); // `()` — 통합 판(DS-D-0079)의 라우트 그룹 폴더 `app/(auth-brand)/…`
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
