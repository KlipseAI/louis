#!/usr/bin/env node
// **제품이 `var()` 로 실제로 푸는 LOUIS 토큰 이름을 앵커에서 열거한다.**
//
// 왜 있나: 「죽은 토큰」은 이 저장소가 목표를 선언한 지표 중 **아무 게이트도 세지 않던
// 유일한 수**였다. 토큰이 늘어도, 마지막 소비자가 사라져도 전부 초록이었다 —
// `verify-token-gates` 는 토큰 «파일»이 원천과 같은지를 보고, `check-token-diff` 는
// 이름이 사라졌는지를 본다. 어느 쪽도 「이 이름을 누가 쓰는가」를 묻지 않는다.
//
// 그 질문의 답 절반은 이 저장소 밖에 있다. 그래서 열거기와 게이트를 가른다 —
// 이쪽(로컬 전용, verify:product)은 **제품 쪽 절반만** 원장에 적고, 게이트
// (`check-coverage-targets`, verify:ci)는 LOUIS 쪽 절반을 매번 다시 계산한다.
// CI 가 볼 수 없는 것만 원장이 나른다. 그래야 원장이 낡아도 낡은 범위가 최소가 된다.
//
// ── 「살아 있다」의 정의: `var()` 로 푸는 것 (comment 는 아니다) ───────────
// 제품 트리에서 `--louis-*` 라는 **글자**를 세면 182종이 나오고 `var(--louis-*)` 로
// 세면 155종이 나온다. 차이 27종은 거의 전부 **주석**인데, 그 주석들이 하는 말이
// 정확히 반대다:
//
//   apps/web/app/globals.css:65
//     「이름과 달리 버튼이 쓰지 않는다 — LOUIS Button 은 자기
//      `--louis-layout-control-height-md` …」
//   apps/web/app/videoeditor/[projectId]/EditorProjectWorkspace.tsx:155
//     「LOUIS 이름을 붙이지 않는다. … `--louis-blur-toast` 는 …」
//
// **토큰을 쓰지 않겠다고 적은 문장을 「쓴다」로 세면**, 죽은 토큰 수가 제품이 그
// 사실을 문서화한 자리에서 «내려간다». 게이트가 정직함을 벌하는 모양이 된다.
// 그래서 판정은 하나다 — **무언가가 그 이름을 실제로 푸는가(`var(`)**.
//
// 제품이 `[--louis-dialog-surface-radius:…]` 처럼 LOUIS 손잡이를 **덮어쓰는** 자리는
// 이 규칙에서 빠지지만, 그 손잡이는 LOUIS CSS 가 자기 안에서 `var()` 로 풀기 때문에
// 어차피 살아 있다. 덮어쓰기가 유일한 근거인 토큰은 없다.
//
// ── 왜 워킹트리가 아니라 앵커에서 읽는가 ─────────────────────────────────
// 소유자가 제품 저장소에서 지금도 작업 중이다. 워킹트리에서 읽으면 같은 명령이 어제와
// 다른 값을 낸다 — `scripts/lib/product-ref.mjs` 가 그 사고를 겪고 적어 둔 규칙을 따른다.
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { atomicWriteBatch } from "./lib/atomic-output.mjs";
import { resolveProductRef } from "./lib/product-ref.mjs";
import { notMeasured, unavailable } from "./lib/gate-exit.mjs";

const TAG = "louis-token-usage";
const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const productRoot = process.env.KLIPSE_PRODUCT_REPO ?? "/Users/sejunki/klipse-web";
const { ref, source: refSource } = resolveProductRef();
const check = process.argv.includes("--check");
const OUT = "migration/louis-token-usage.json";
const outPath = resolve(repoRoot, OUT);

// 제품이 LOUIS 를 무는 두 트리. `apps/web` 이 화면이고 `packages` 가 그 공용 부품이다.
const TREES = ["apps/web", "packages"];

if (!existsSync(resolve(productRoot, ".git"))) {
  unavailable(
    TAG,
    "제품 저장소가 없습니다: " + productRoot +
      "\n  이 열거기는 제품 저장소를 읽습니다. verify:product 레인에서만 돕니다.",
  );
}

const git = (args) =>
  execFileSync("git", ["-C", productRoot, ...args], { encoding: "utf8", maxBuffer: 1 << 28 });

let commit;
try {
  commit = git(["rev-parse", ref]).trim();
} catch (error) {
  unavailable(
    TAG,
    "앵커 커밋을 제품 저장소에서 찾지 못했습니다: " + ref + "\n  " + String(error.message).trim(),
  );
}

// `git grep` 는 일치가 0건이면 종료코드 1 이다. 그 경우를 **빈 결과가 아니라 아래의
// 표본 0건 판정**으로 넘긴다 — 조용한 빈 목록은 「토큰이 전부 죽었다」로 읽힌다.
const grep = (args) => {
  try {
    return git(["grep", ...args]);
  } catch (error) {
    if (error.status === 1) return "";
    throw error;
  }
};

// POSIX 문자 클래스로 쓴다 — `\s` 는 git 의 기본 정규식 엔진에서 이식성이 없다.
const PATTERN = "var\\([[:space:]]*--louis-[a-z0-9-]+";
const hits = grep(["-h", "-o", "-E", "-e", PATTERN, commit, "--", ...TREES]);
const files = grep(["-l", "-E", "-e", PATTERN, commit, "--", ...TREES])
  .split("\n")
  .filter(Boolean);

const productRefs = new Set();
for (const match of hits.matchAll(/var\(\s*(--louis-[a-z0-9-]+)/g)) productRefs.add(match[1]);

if (productRefs.size === 0) {
  notMeasured(
    TAG,
    "앵커 " + commit.slice(0, 8) + " 의 " + TREES.join("·") +
      " 에서 `var(--louis-*)` 를 한 건도 찾지 못했습니다. 제품이 LOUIS 를 " +
      "통째로 떼어 냈거나 이 열거기의 검색이 낡았습니다 — 둘 다 조용히 지나가면 안 됩니다.",
  );
}

const sorted = [...productRefs].sort();

const output = {
  $aliveRule:
    "토큰이 살아 있다는 것은 **무언가가 그 이름을 `var()` 로 푼다**는 뜻이다. 제품 트리에서 " +
    "`--louis-*` 를 글자로 세면 182종, `var(--louis-*)` 로 세면 155종이고 차이 27종은 거의 " +
    "전부 주석이다. 그 주석들은 「이 토큰을 쓰지 않는다」를 적은 문장이라, 글자로 세면 제품이 " +
    "그 사실을 문서화한 자리에서 죽은 토큰 수가 내려간다 — 게이트가 정직함을 벌하게 된다.",
  $whyNotThemeCss:
    "`packages/css/generated/theme.css` 는 소비자가 아니다. 같은 토큰 원천에서 생성되어 " +
    "토큰이 존재한다는 이유만으로 371종을 기계적으로 참조한다 — 그것을 소비로 세면 죽은 토큰이 " +
    "318 에서 160 으로 «내려가지만» 아무도 그 토큰을 고르지 않았다. 같은 하네스로 재서 초록을 " +
    "만드는 함정이고, 이 저장소가 이미 겪은 실패다.",
  $ledgerScopeRule:
    "이 원장은 **제품 쪽 절반만** 나른다. LOUIS 쪽 참조와 선언은 CI 에서 볼 수 있으므로 " +
    "`check-coverage-targets` 가 매번 다시 계산한다. CI 가 볼 수 없는 것만 원장에 적는 것이 " +
    "원장이 낡을 수 있는 범위를 최소로 만든다.",
  productRef: ref,
  productRefSource: refSource,
  productCommit: commit,
  trees: TREES,
  filesScanned: files.length,
  counts: { productRefs: sorted.length },
  productRefs: sorted,
};

const body = JSON.stringify(output, null, 2) + "\n";
const line =
  "제품이 `var()` 로 푸는 LOUIS 토큰 " + sorted.length + "종 · 파일 " + files.length +
  " @ " + commit.slice(0, 8);

if (check) {
  if (!existsSync(outPath)) {
    console.error("[" + TAG + "] " + OUT + " 이 없습니다. `pnpm run measure-louis-token-usage` 로 먼저 뽑으세요.");
    process.exit(1);
  }
  if (readFileSync(outPath, "utf8") !== body) {
    console.error(
      "[" + TAG + "] 기록이 앵커의 제품 트리와 다릅니다. " +
        "`pnpm run measure-louis-token-usage` 로 다시 뽑으세요.",
    );
    process.exit(1);
  }
  console.log("[" + TAG + "] checked: " + line);
} else {
  atomicWriteBatch([{ absolute: outPath, expected: body }]);
  console.log("[" + TAG + "] built: " + line);
}
