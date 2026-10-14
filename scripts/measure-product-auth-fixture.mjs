#!/usr/bin/env node
import { execFileSync, spawn } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, rmdirSync, writeFileSync } from "node:fs";
import { createServer } from "node:net";
import { tmpdir } from "node:os";
import { delimiter, dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";
import { atomicWriteBatch } from "./lib/atomic-output.mjs";
import { overlayLouisCss } from "./lib/louis-css-overlay.mjs";
import { productFontFile } from "./lib/product-font.mjs";
import { captureDeclaredStylesForHandles } from "./lib/declared-styles.mjs";
import { resolveProductRef } from "./lib/product-ref.mjs";
import { productAriaLabels } from "./lib/product-aria-labels.mjs";
import { sessionCookie, startFakeSupabase } from "./lib/fixture-fake-supabase.mjs";
import { checkCites, createRecipeRouter, loadArea, readRecipeCss, recipeAssertProblems, recipeDigest, runRecipeSteps, specFromRecipe, supabaseOverlayOf, validateRecipes } from "./lib/state-recipes.mjs";
import { FIXTURE_CANVAS_PROJECT_ID, FIXTURE_COUPON_CAMPAIGN_ID, FIXTURE_EDITOR_PROJECT_ID, FIXTURE_HIGHLIGHT_PROJECT_ID, FIXTURE_HIGHLIGHT_SHORT_ID, FIXTURE_PUBLIC_SEEDS, FIXTURE_SEEDS } from "./lib/fixture-seeds.mjs";

// 이 측정기는 운영 인증을 재현하지 않는다. 제품이 소스에서 명시한 development-only bypass로
// 보호 route의 로그인 후 shell과 실패/빈 기본 상태를 렌더한다. API 401/500도 숨기지 않고 함께
// 기록하며, 운영 세션·실데이터 parity의 근거로 승격할 수 없도록 산출물의 evidenceClass를 고정한다.
const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
// **로그아웃 모드(`--anonymous`, 2026-09-28).** 인증 화면(로그인 · 가입 · 비밀번호)은 로그인된 사용자를 `/archive` 로 보낸다
// (앵커 `login/page.tsx:318-322` — `if (!loading && user) router.replace("/archive")`). 인증 우회 서버에서는 가짜 사용자가 있어
// 그 화면이 재지지 않는다. 이 모드는 **우회를 끈** 서버로 `ANONYMOUS_ROUTES` 만 재 별도 원장에 쓴다 — 측정 · 안정화 · 정규화 코드는
// 인증 fixture 와 한 벌이라 규칙이 갈라지지 않는다.
// **상태 레시피 모드(`--states=<영역>`, 2026-10-08 — 상태 레시피 설계서 2절).** `migration/measure-states/<영역>.json` 의 레시피를
// 화면으로 펴서, 영역 파일의 `mode` 가 정하는 서버 환경(아래 네 불리언)에서 잰다. 결과는 기존 원장이 아니라 영역 원장
// (`migration/product-states/<영역>.json`)에 쓴다 — 같은 원장에 넣으면 스타일 표 · 요청 목록 · 상위 60 후보가 바뀐다. 레시피 로직은
// `lib/state-recipes.mjs` 에 있고, 이 파일의 새 갈래는 모두 `statesArea` 나 `spec.recipe` 가 있을 때만 돈다.
const statesArg = process.argv.find((arg) => arg.startsWith("--states="));
const statesArea = statesArg ? loadArea(statesArg.slice("--states=".length)) : null;
const statesMode = statesArea?.mode ?? null;
// **`--dump-static=<파일>`(디버그, 2026-10-08).** 화면 명세(SCREEN_SPECS)와 측정에 기대지 않는 원장 머리를 JSON 으로 쏟고 끝낸다 —
// 개발 서버 · 브라우저 · LOUIS CSS 덮기를 하지 않는다. 상태 레시피 갈래를 더하기 전후로 각 모드의 결과가 같은지 보는 확인 1(설계서 2절)용.
const dumpStaticArg = process.argv.find((arg) => arg.startsWith("--dump-static="));
const dumpStatic = dumpStaticArg ? resolve(dumpStaticArg.slice("--dump-static=".length)) : null;
const anonymous = process.argv.includes("--anonymous") || statesMode === "anonymous";
// **세션 모드(`--session`, 2026-09-29).** 서버 컴포넌트가 `supabase.auth.getUser()` 로 사용자를 확인하는 화면(허브 셋)을 서버가 받는
// 가짜 세션으로 잰다 — 로컬 가짜 Supabase(`lib/fixture-fake-supabase.mjs`)가 인증에 고정 사용자로 답하고 데이터 조회에는 빈 목록으로
// 답한다. **공개 모드(`--public`, 2026-09-29).** 뷰포트보다 긴 공개 페이지를 로그아웃 상태로 문서 전체까지 잰다(`fullPage`). 둘 다
// 별도 원장에 쓴다 — 인증 · 로그아웃 원장과 환경이 달라 섞으면 기존 보드가 흔들린다.
const session = process.argv.includes("--session") || statesMode === "session";
// `--public-seeded`(2026-10-07): 공개 모드와 같은 로그아웃 서버에 가짜 Supabase(세션 쿠키 없음) + 공개 시드를 붙여 상세 화면을 잰다. 원장을 따로 쓴다.
const publicSeeded = process.argv.includes("--public-seeded") || statesMode === "public-seeded";
const publicMode = process.argv.includes("--public") || publicSeeded || statesMode === "public";
// **LOUIS 예시 모드(`--louis-examples`, 2026-10-07).** 제품 화면이 아니라 이 저장소의 정적 예시(`packages/css/examples/*.html`)를 같은
// 측정 · 안정화 · 정규화 코드로 잰다 — 문서 패턴 예시를 Figma 레이어로 생성하려고(소유자 「그냥 이미지를 갖다 넣어 놨네」). Next 서버 대신
// `packages/css` 를 정적으로 내고, 예시가 CDN 에서 읽는 Pretendard Variable 은 제품 글꼴 파일(`apps/web/app/fonts/PretendardVariable.woff2`)로
// 대 준다(바깥 요청은 끊는다). 제품 원장들과 같은 `productCommit` 을 적는다 — 글꼴의 출처이고 생성기가 원장끼리 같은 앵커인지 본다.
const louisExamples = process.argv.includes("--louis-examples");
if ([anonymous, session, publicMode, louisExamples].filter(Boolean).length > 1) throw new Error("[product-auth-fixture] --anonymous · --session · --public · --louis-examples 는 하나만 줍니다");
if (statesArea && ["--anonymous", "--session", "--public", "--public-seeded", "--louis-examples"].some((flag) => process.argv.includes(flag))) {
  throw new Error("[product-auth-fixture] --states 는 모드 인자와 함께 쓰지 않습니다 — 모드는 영역 파일의 mode 가 정합니다(" + statesArea.file + ": " + statesMode + ")");
}
const enOutputRelative = statesArea ? `migration/product-states/${statesArea.area}.json`
  : louisExamples ? "migration/louis.document-examples.json"
  : anonymous ? "migration/product.anonymous-fixture.json"
  : session ? "migration/product.session-fixture.json"
  : publicSeeded ? "migration/product.public-seeded-fixture.json"
  : publicMode ? "migration/product.public-fixture.json"
  : "migration/product.auth-fixture.json";
// **로캘 측정(`--locale=en|ko|ja`, 2026-10-08 · DS-D-0081).** 같은 화면을 그 언어로 열어 `migration/product-locale/<모드>.<로캘>.json` 에
// 따로 쓴다 — en 원장(위 경로)은 건드리지 않는다. Figma 보드의 「Klipse Locale」 변수 값은 이 원장의 같은 DOM 경로 글자에서 온다
// (scripts/build-figma-locale-strings.mjs). 제품은 공유 쿠키 `klipse-locale` → 호스트 쿠키 `facen-language` → Accept-Language → en
// 순서로 언어를 고르므로(apps/web/lib/serverLocale.ts) 셋을 모두 세운다. 인자가 없으면 전과 같다(en 원장 · 쿠키 · 헤더 그대로).
const localeArg = process.argv.find((arg) => arg.startsWith("--locale="));
const localeMode = Boolean(localeArg);
const LOCALE = localeMode ? localeArg.slice("--locale=".length) : "en";
const LOCALE_TAGS = { en: "en-US", ko: "ko-KR", ja: "ja-JP" };
if (!LOCALE_TAGS[LOCALE]) throw new Error("[product-auth-fixture] --locale 은 en · ko · ja 가운데 하나입니다: " + LOCALE);
if (localeMode && louisExamples) throw new Error("[product-auth-fixture] --locale 은 LOUIS 예시 모드에 쓰지 않습니다");
if (localeMode && statesArea) throw new Error("[product-auth-fixture] --locale 은 아직 상태 레시피(--states)와 함께 쓰지 않습니다");
const localeModeName = anonymous ? "anonymous" : session ? "session" : publicSeeded ? "public-seeded" : publicMode ? "public" : "auth";
const outputRelative = localeMode ? `migration/product-locale/${localeModeName}.${LOCALE}.json` : enOutputRelative;
const outputPath = resolve(repoRoot, outputRelative);
const productRoot = process.env.KLIPSE_PRODUCT_REPO ?? "/Users/sejunki/klipse-web";
const fixtureRoot =
  process.env.KLIPSE_PRODUCT_FIXTURE_ROOT ?? process.env.KLIPSE_PRODUCT_BUILD_ROOT;
const checkOnly = process.argv.includes("--check");
// **`--only=<화면 id>`(여러 번, 2026-10-07).** 그 화면만 다시 재고 나머지는 기록된 원장에서 그대로 싣는다 — 세션 측정 전체는 45분이
// 넘고(노드캔버스 · 편집기), 다시 재면 이미 보낸 보드의 값이 흔들릴 수 있다. 실린 화면은 스타일 표를 되풀어 측정 직후와 같은 모양으로
// 넣으므로, 뒤의 스타일 묶기 · 반복 서브트리 · 별칭은 전체 실행과 같은 길을 탄다. 가짜 Supabase 요청 목록은 기록과 이번 실행의 합이다.
// **`--shots=<폴더>`(2026-10-07).** 잰 직후의 페이지를 캡처로 남긴다 — 보드와 제품을 나란히 대조하는 용도다. 원장은 쓰지 않는다
// (캡처만 원하는 실행이 원장을 흔들지 않게). `--only` 와 함께 쓰면 그 화면만 연다.
const shotsArg = process.argv.find((arg) => arg.startsWith("--shots="));
const shotsDir = shotsArg ? resolve(shotsArg.slice("--shots=".length)) : null;
const onlyIds = new Set(process.argv.filter((arg) => arg.startsWith("--only=")).map((arg) => arg.slice("--only=".length)));
if (onlyIds.size > 0 && checkOnly) {
  console.error("[product-auth-fixture] --only 와 --check 는 함께 쓸 수 없습니다");
  process.exit(1);
}
const { ref: productRef, source: productRefSource } = resolveProductRef();

const unavailable = (reason) => {
  console.error("[product-auth-fixture] 측정 불가 (" + reason + ")");
  process.exit(1);
};

if (!existsSync(resolve(productRoot, ".git"))) {
  unavailable("제품 저장소가 없습니다: " + productRoot);
}
if (!fixtureRoot && !louisExamples) {
  unavailable("KLIPSE_PRODUCT_FIXTURE_ROOT 또는 KLIPSE_PRODUCT_BUILD_ROOT가 없습니다");
}
if (!louisExamples && !existsSync(resolve(fixtureRoot, ".git"))) {
  unavailable("fixture 저장소가 아닙니다: " + fixtureRoot);
}

const gitAt = (cwd, args, encoding = "utf8") =>
  execFileSync("git", args, { cwd, encoding, maxBuffer: 128 * 1024 * 1024 });
const commit = gitAt(productRoot, ["rev-parse", productRef]).trim();
// 로캘 원장은 en 원장과 같은 커밋에서만 잰다 — 경로로 짝짓는 두 원장이 다른 제품을 보면 짝이 조용히 어긋난다.
if (localeMode) {
  const enLedgerPath = resolve(repoRoot, enOutputRelative);
  if (!existsSync(enLedgerPath)) unavailable("--locale: en 원장이 없습니다 — 먼저 같은 모드의 en 원장을 잰다: " + enOutputRelative);
  const enCommit = JSON.parse(readFileSync(enLedgerPath, "utf8")).productCommit;
  if (enCommit !== commit) unavailable("--locale: en 원장의 커밋(" + String(enCommit).slice(0, 12) + ")이 지금 앵커(" + commit.slice(0, 12) + ")와 다릅니다 — en 원장을 같은 앵커에서 다시 잰다");
}
// 탐침은 단추를 접근 이름으로 찾는다. 제품이 그 이름을 번역하므로(10-14 사전 이관) 측정 커밋 사전의 ko · ja 값도 함께 받는다.
// 기록에는 영어 정본 이름을 남긴다 — 생성기(build-figma-product-app-shell.mjs)가 그 이름을 키로 쓴다.
const PROBE_LABELS = productAriaLabels(productRoot, commit, ["Collapse sidebar", "Expand sidebar", "Open navigation menu", "Back to subscription", "Open profile"]);
const fixtureCommit = louisExamples ? commit : gitAt(fixtureRoot, ["rev-parse", "HEAD"]).trim();
if (fixtureCommit !== commit) {
  unavailable(
    "fixture HEAD가 고정 커밋과 다릅니다: " +
      fixtureCommit.slice(0, 12) + " != " + commit.slice(0, 12),
  );
}

const assertCleanFixture = (stage) => {
  if (louisExamples) return;
  const status = gitAt(fixtureRoot, [
    "status",
    "--porcelain=v1",
    "--untracked-files=all",
  ]).trim();
  if (status) {
    unavailable(
      stage + " fixture가 dirty입니다: " + status.split("\n")[0],
    );
  }
};
assertCleanFixture("측정 전");

const webRoot = louisExamples ? null : resolve(fixtureRoot, "apps/web");
// 제품은 `.npmrc` 에 `node-linker=hoisted` 를 쓴다(첫 커밋부터). 그래서 `next` 는
// **workspace 가 아니라 저장소 루트** `node_modules` 에 실체화된다 —
// `apps/web/node_modules/next` 는 어느 시점에도 존재한 적이 없다. 한 자리만 보던 검사는
// fixture 를 제대로 갖춰도 「실행 파일이 없습니다」로 죽었고, 그래서 이 게이트는
// **한 번도 실제로 측정한 적이 없다.** 두 자리를 다 본다.
const nextCli = louisExamples ? "(louis-examples)" : [
  resolve(webRoot, "node_modules/next/dist/bin/next"),
  resolve(fixtureRoot, "node_modules/next/dist/bin/next"),
].find((candidate) => existsSync(candidate));
if (!nextCli) {
  unavailable(
    "Next 개발 서버 실행 파일이 없습니다: " +
      resolve(webRoot, "node_modules/next/dist/bin/next") +
      " 또는 " +
      resolve(fixtureRoot, "node_modules/next/dist/bin/next"),
  );
}

const CONTEXTS = [
  { id: "desktop-1920x1080", width: 1920, height: 1080 },
  { id: "mobile-402x874", width: 402, height: 874 },
];

// fixture 의 Supabase 는 `http://127.0.0.1:9` 로 막혀 있으므로 이 id 로 조회되는 프로젝트는 없다.
// 값 자체에 뜻이 없다는 것을 이름으로 적어 둔다 — 생성물의 `localApiResponses` 에
// `/api/highlight/project/fixture-no-such-project 401` 로 그대로 남아, 이 화면들이 실데이터가
// 아니라는 사실이 읽는 쪽에 드러난다.
const HIGHLIGHT_FIXTURE_PROJECT_ID = "fixture-no-such-project";

// 두 측정 패스가 같은 DOM 을 볼 때까지 다시 해 보는 횟수. 여기서 걸리는 변화는 상태 전이라
// 한 번 일어나면 끝이므로 두 번째 시도에서 붙는다. 셋째까지 못 붙으면 화면이 계속 움직이는
// 것이고, 그때는 조용히 넘기는 대신 실패시켜야 한다.
const MEASURE_ATTEMPTS = 3;

// **라우트가 아니라 「화면 상태」를 잰다.**
//
// 그전에는 항목이 라우트 문자열이라 **라우트당 한 상태**밖에 잴 수 없었다. 제품
// `/highlight/[projectId]` 는 phase 가 8개인데 그중 기본 진입 하나만 재고 나머지 일곱은
// 이 저장소에 존재조차 하지 않았다 — 재지 못한 것은 Figma 에도 그려지지 않고 게이트도 붙지 않는다.
//
// 그래서 항목은 **문자열 또는 객체**다.
//   문자열 — 종전 그대로. 화면 키·파일 패턴·열 URL 이 모두 그 문자열이다.
//   객체   — 그 셋을 갈라 적는다.
//     pattern  `apps/web/app<pattern>/page.tsx` 존재 확인에 쓴다. 동적 세그먼트를 **그대로** 둔다.
//     url      실제로 열 경로. 동적 세그먼트를 구체값으로 바꾸고 필요하면 쿼리를 붙인다.
//     id       생성물의 화면 키. 같은 라우트의 상태들을 구분한다.
const ROUTES = [
  "/archive",
  // **허브 셋(`/nodecanvas` · `/videoeditor` · `/highlight`)은 이 fixture 로 잴 수 없다(2026-09-28 실측).** 셋 다 서버 컴포넌트에서
  // `supabase.auth.getUser()` 로 사용자를 확인하고 없으면 `redirect("/")` 한다(앵커 `nodecanvas/page.tsx:22 · 26`,
  // `videoeditor/page.tsx:14 · 18`, `highlight/page.tsx:14 · 18`). 인증 우회(`NEXT_PUBLIC_DEV_AUTH_BYPASS`)는 브라우저 쪽이라 서버 확인을
  // 통과하지 못한다 — 더해서 재 보니 셋 다 `redirected: true` 로 랜딩이 재졌다. 잴 길은 서버가 받는 가짜 세션(Supabase 인증 응답을 흉내
  // 내는 로컬 서버)이다. 편집기 · 하이라이트 결과 화면도 같은 벽이다.
  "/settings",
  "/subscription",
  "/analytics/youtube",
  "/analytics/instagram",
  "/mypage",
  "/mypage/upgrade",
  "/mypage/upgrade/checkout",
  "/mypage/upgrade/billing-success",
  "/mypage/upgrade/billing-fail",
  "/mypage/upgrade/billing-change-success",
  "/mypage/upgrade/billing-change-fail",
  "/mypage/upgrade/fail",
  "/mypage/topup/success",
  "/mypage/topup/fail",
  // **2026-09-26 — 보드가 없던 화면 셋.** 대량 구매(쿠폰) 결과 둘과 구매한 쿠폰 목록이다. fixture 에는 주문 · 쿠폰 데이터가 없어
  // 결과 화면은 쿼리 없이 연 상태(제품이 그리는 오류 · 빈 상태)를 잰다 — 이 측정기의 다른 화면과 같은 규칙이다.
  "/mypage/upgrade/bulk-success",
  "/mypage/upgrade/bulk-fail",
  "/subscription/coupons",
  // **2026-09-26 — 결제 성공 화면 넷의 개발 전용 미리보기.** 제품이 `?preview=<상태>` 로 실결제 · 실 API 없이 각 상태를
  // 목 데이터로 그린다(`process.env.NODE_ENV !== "production"` 게이트 — 운영에서는 켜지지 않는다). 쿼리 없이 연 화면은
  // 「결제 정보 없음」 분기라 성공 화면의 본체가 보드에 한 번도 없었다. 오류 · 처리 중 미리보기는 재지 않는다 — 오류는
  // 쿼리 없이 연 화면과 같은 분기이고, 처리 중은 스피너 한 개다. 인용은 아래 sourceQuotes 에 있다.
  ...[
    ["/mypage/upgrade/billing-success", "success"],
    ["/mypage/upgrade/billing-success", "partial"],
    ["/mypage/upgrade/billing-change-success", "success"],
    ["/mypage/topup/success", "success"],
    ["/mypage/upgrade/bulk-success", "success"],
    ["/mypage/upgrade/bulk-success", "issue-error"],
  ].map(([pattern, preview]) => ({ pattern, url: pattern + "?preview=" + preview, id: pattern + "?preview=" + preview })),
  "/explore",
  // `/highlight/[projectId]` 의 phase 상태들. 제품이 `ae8fd627` 에서 넣은 개발 전용
  // `?__phase=<이름>` 후크로 연다(`HighlightProjectScene.tsx:128`, 게이트는 인증 바이패스와
  // 같은 `NEXT_PUBLIC_DEV_AUTH_BYPASS` — 이 스크립트가 이미 자식 서버에 넘긴다).
  //
  // **여덟 중 여섯만 채택했다.** 실제로 열어 재고 판정한 결과다(desktop 1920×1080, 가시 노드 수):
  //   셸만 그려진 상태 = 87노드. 그 위에 무엇이 얹히는지가 판정 기준이다.
  //     loading 90 · uploading 93 · upload 100 · analyzing 91 · extracting 91 · failed 94
  //   여섯은 그 단계의 내용이 **전부** 상태 크롬이라 데이터 없이도 제품과 같은 화면이 나온다.
  //
  // 채택하지 않은 둘:
  //   reviewed  101노드. 카드 머리(제목·「Start over」·「Extract clips」)는 나오지만 이 단계의
  //             본체인 **세그먼트 목록이 비어 있다** — 화면이 스스로 `Clips (0/0)` 이라고 적는다.
  //             `segments` 는 `/api/highlight/project/<id>` 응답에서 오는데 fixture 에서 401 이다.
  //   completed 87노드 = 셸만. 클립 그리드가 `clips` 를 도는데 비어서 **아무것도 그려지지 않는다**
  //             (`viewMode: "detail"` 쪽은 클립이 없으면 아예 `null` 을 낸다).
  //             `clips` 도 같은 401 응답에서 온다.
  //   둘 다 fixture 에 세그먼트·클립 시드가 생겨야 잴 수 있다. 빈 상태를 채택하면 Figma 에
  //   빈 화면이 정본으로 굳는다.
  //
  // `?__phase=upload` 는 쿼리 없이 연 것과 같은 화면이지만(둘 다 100노드·같은 텍스트) 그것은
  // 데이터가 없어 `upload` 로 떨어지기 때문이다. 데이터가 생기면 갈라지므로 **상태 이름으로**
  // 적는다 — 기본 진입은 상태가 아니라 데이터에 따라 달라지는 결과다.
  ...["loading", "uploading", "upload", "analyzing", "extracting", "failed"].map((phase) => ({
    pattern: "/highlight/[projectId]",
    url: "/highlight/" + HIGHLIGHT_FIXTURE_PROJECT_ID + "?__phase=" + phase,
    id: "/highlight/[projectId]?__phase=" + phase,
  })),
];

// **로그아웃 모드가 재는 화면(`--anonymous`).** 로그인하지 않은 사용자가 보는 공개 화면 가운데 **한 뷰포트 안에서 끝나는** 것만 싣는다 —
// 이 측정기는 뷰포트와 겹치는 노드만 재므로 긴 공개 페이지(랜딩 · 약관 · 요금 · 블로그 목록)는 전체 페이지 측정(장면 측정기)의 몫이다.
// 404 는 `page.tsx` 가 없다 — 없는 경로를 열고 `file` 로 `not-found.tsx` 를 확인한다.
const ANONYMOUS_ROUTES = [
  "/login",
  "/signup",
  // AWS Marketplace 가입은 쿼리 `token` 이 없으면 `/signup` 으로 보낸다(앵커 `aws/signup/page.tsx:272` `searchParams.get("token")` ·
  // `:316-317`). 토큰은 제출할 때만 쓰이므로 가짜 토큰으로 연 화면이 마켓플레이스에서 들어온 사용자가 보는 화면이다. 키는 라우트 그대로 둔다.
  { pattern: "/aws/signup", url: "/aws/signup?token=fixture-aws-marketplace-token", id: "/aws/signup" },
  "/signup/check-email",
  "/signup/expired",
  "/signup/verified",
  "/reset-password",
  "/reset-password/new",
  "/recover",
  "/data-deletion-status",
  { pattern: "/fixture-no-such-page", url: "/fixture-no-such-page", id: "404", file: "apps/web/app/not-found.tsx" },
  // **전체 오류 화면(`app/global-error.tsx`) — 2026-10-07.** 루트 레이아웃이 던져야 서는 화면이다. 루트의 `I18nProvider` effect 가
  // `window.localStorage.getItem` 을 try 없이 부르므로(`components/landing/system/I18nProvider.tsx` 43), 저장소가 막힌 브라우저
  // (사이트 데이터 차단 — 접근이 `SecurityError` 를 던진다)에서는 루트 경계가 선다. 측정 문맥에서 그 조건만 만든다(`blockStorage`).
  // 제품 코드는 건드리지 않는다. 어느 페이지든 같으므로 가장 가벼운 `/login` 을 연다.
  { pattern: "/login", id: "global-error", file: "apps/web/app/global-error.tsx", blockStorage: true, rootBody: true },
];

// **세션 모드가 재는 화면(`--session`).** 허브 셋 — 서버 확인을 통과하면 로그인한 사용자의 작업공간이 그려진다. 가짜 Supabase 는
// 데이터 조회에 빈 목록으로 답하므로 프로젝트가 없는 사용자의 화면이다(지어낸 데이터로 채우지 않는다).
const SESSION_ROUTES = [
  "/nodecanvas",
  "/videoeditor",
  "/highlight",
  // 어드민은 `ADMIN_EMAILS` 에 든 이메일만 연다(앵커 `app/lib/auth/admin.ts`) — 측정 서버에 가짜 사용자의 이메일을 준다.
  "/admin",
  // 부스 운영은 `?k=` 가 `CREATIVE_MEDIA_ADMIN_KEY` 와 같아야 연다(`app/lib/creative-media/adminAuth.ts`) — 측정 서버에 픽스처 키를 준다.
  { pattern: "/creative-media-admin", url: "/creative-media-admin?k=fixture-booth-key", id: "/creative-media-admin", fullPage: true },
  // 결제 진행은 `?plan=` 의 요금제로 연다(`mypage/upgrade/checkout/page.tsx:180-181`, 정적 요금제 표). 결제창(Toss)은 바깥 요청이라 막힌다.
  { pattern: "/mypage/upgrade/checkout", url: "/mypage/upgrade/checkout?plan=pro", id: "/mypage/upgrade/checkout" },
  // 부스 체험 — 공개 화면이지만 행사 설정을 DB 에서 읽는다. 공개 모드(Supabase 닿지 않음)에서는 「Something went wrong」만 그려져, 가짜 Supabase
  // (행사 없음 — 빈 목록)가 있는 세션 모드에서 잰다.
  { pattern: "/creative-media", fullPage: true },
  // 쿠폰 인쇄(2026-10-07) — 관리자 클라이언트로 캠페인 한 행과 코드 목록을 읽는다. 빈 목록이면 `notFound()` 라 가짜 Supabase 의
  // 자리표시 시드(`lib/fixture-seeds.mjs`, 캠페인 하나 · 코드 10장 · 묶음 둘)로 연다. 글자는 자리표시이고 크기 · 색 · 간격은 잰 값이다.
  { pattern: "/admin/coupons/[id]/print", url: `/admin/coupons/${FIXTURE_COUPON_CAMPAIGN_ID}/print`, id: "/admin/coupons/[id]/print" },
  // 노드캔버스 편집기(2026-10-07) — 프로젝트 한 행과 캔버스 문서(노드 셋 · 엣지 둘)를 시드로 연다(`lib/fixture-seeds.mjs`). 허브 목록은 그대로 빈 상태다.
  { pattern: "/nodecanvas", url: `/nodecanvas?project=${FIXTURE_CANVAS_PROJECT_ID}`, id: "/nodecanvas?project=" },
  // 편집기(2026-10-07) — 소스 둘 · 클립 둘의 편집 프로젝트를 시드로 연다. 미리보기 영상은 바깥 주소라 검은 면이다(크롭 비율은 소스 메타).
  { pattern: "/videoeditor/[projectId]", url: `/videoeditor/${FIXTURE_EDITOR_PROJECT_ID}`, id: "/videoeditor/[projectId]" },
  // 하이라이트 완료 격자(2026-10-07) — 클립 다섯의 추출 완료 작업을 시드로 연다. 카드 영상은 검은 면 · 비율은 CSS 기본값(4:3)이다.
  { pattern: "/highlight/[projectId]", url: `/highlight/${FIXTURE_HIGHLIGHT_PROJECT_ID}`, id: "/highlight/[projectId] completed", fullPage: true },
  // 쇼츠 렌더 완료 결과(2026-10-07) — `result_url` 이 있는 쇼츠 한 행을 시드로 연다. 편집 모달이 닫힌 결과 보기이고 영상은 검은 면이다.
  { pattern: "/highlight/[projectId]/shorts/[shortId]", url: `/highlight/${FIXTURE_HIGHLIGHT_PROJECT_ID}/shorts/${FIXTURE_HIGHLIGHT_SHORT_ID}`,
    id: "/highlight/[projectId]/shorts/[shortId]", fullPage: true },
];

// **공개 모드가 재는 화면(`--public`).** 뷰포트보다 긴 공개 페이지 — 문서 전체를 잰다(`fullPage`). 데이터 없이도 제품과 같은 화면이
// 나오는 것부터 싣는다. 템플릿 상세는 장면 측정기와 같은 `filter` 로 연다.
const PUBLIC_ROUTES = [
  // **랜딩(2026-09-30).** 로그아웃 상태의 문서 전체 — 템플릿 섹션은 DB(`creative_media_templates`)가 닿지 않아 빈 배열이 오고 제품
  // 코드대로 통째로 빠진다(`app/page.tsx` 로더 주석). 모델 캐러셀도 `/api/models` 가 500 이라 빠진다.
  // **동작 줄이기로 잰다.** 랜딩의 스크롤 리빌은 화면에 들어온 요소에만 `.is-visible` 을 붙이고 벗어나면 뗀다(래치가 아니다) — 훑고
  // 되감으면 히어로 아래 구획이 다시 `opacity: 0` 이 되어 FAQ · 마지막 CTA(데스크톱 1051)가 원장에서 빠졌다. 제품 CSS 는
  // `prefers-reduced-motion: reduce` 에서 출발 상태 규칙을 걸지 않아 도착 상태가 처음부터 보이고(globals.css 스크롤 리빌 주석), 제품의
  // 대비 · 렌더 하네스도 그 경로로 잰다. 동영상도 첫 프레임에 선다(`Hero.tsx`).
  { pattern: "/", file: "apps/web/app/page.tsx", fullPage: true, reducedMotion: true },
  { pattern: "/privacy", fullPage: true },
  { pattern: "/terms", fullPage: true },
  { pattern: "/inquiry", fullPage: true },
  { pattern: "/pricing", fullPage: true },
  { pattern: "/templates", fullPage: true },
  { pattern: "/templates/[slug]", url: "/templates/filter", id: "/templates/[slug]", fullPage: true },
  { pattern: "/blog", fullPage: true },
  // **루트 오류 경계(`app/error.tsx`) — 2026-09-30.** 부스 체험(`/creative-media`)은 행사 설정을 DB 에서 읽는데 공개 모드는 Supabase 에
  // 닿지 않아(`http://127.0.0.1:9`) 페이지가 던지고 루트 오류 경계가 선다(「Something went wrong」 · 다시 시도 · 홈으로). 그 화면을 `error`
  // 로 싣는다 — 오류 경계를 띄우려고 제품 코드를 바꿀 필요가 없다. 부스 체험 본 화면은 세션 모드(가짜 Supabase)가 잰다.
  { pattern: "/creative-media", id: "error", file: "apps/web/app/error.tsx", fullPage: true },
];

// **공개 시드 모드가 재는 화면(`--public-seeded`, 2026-10-07).** 발행된 한 행이 있어야 서는 공개 상세 — 가짜 Supabase 의 자리표시 시드
// (`lib/fixture-seeds.mjs` FIXTURE_PUBLIC_SEEDS)로 연다. 로그아웃 사용자 · 문서 전체. 글자는 자리표시, 크기 · 색 · 간격은 잰 값이다.
const PUBLIC_SEEDED_ROUTES = [
  { pattern: "/blog/[slug]", url: "/blog/fixture-post", id: "/blog/[slug]", fullPage: true },
  { pattern: "/templates/[slug]", url: "/templates/filter", id: "/templates/[slug]", fullPage: true },
];

// 문자열·객체 항목을 하나의 모양으로 편다. `expectedSearch` 는 redirect 판정에 쓴다 —
// 「의도한 search 로 끝났는가」를 물어야 하므로 빈 문자열을 못박을 수 없다.
// LOUIS 예시 — 문서 패턴의 부품 전수 예시와 소유자 승인 운영안(정본). 문서 전체를 잰다.
const LOUIS_EXAMPLE_ROUTES = [
  { pattern: "/examples/document-report.html", id: "document-report", file: "packages/css/examples/document-report.html", fullPage: true },
  { pattern: "/examples/document.html", id: "document", file: "packages/css/examples/document.html", fullPage: true },
];
const MODE_SCREEN_SPECS = (louisExamples ? LOUIS_EXAMPLE_ROUTES : anonymous ? ANONYMOUS_ROUTES : session ? SESSION_ROUTES : publicSeeded ? PUBLIC_SEEDED_ROUTES : publicMode ? PUBLIC_ROUTES : ROUTES).map((entry) => {
  const spec = typeof entry === "string" ? { pattern: entry } : entry;
  const url = spec.url ?? spec.pattern;
  const target = new URL(url, "http://fixture.invalid");
  return {
    id: spec.id ?? url,
    pattern: spec.pattern,
    url,
    ...(spec.file ? { file: spec.file } : {}),
    ...(spec.fullPage ? { fullPage: true } : {}),
    ...(spec.reducedMotion ? { reducedMotion: true } : {}),
    ...(spec.blockStorage ? { blockStorage: true } : {}),
    ...(spec.rootBody ? { rootBody: true } : {}),
    expectedPath: target.pathname,
    expectedSearch: target.search,
  };
});
// 상태 레시피 모드는 그 모드의 화면이 아니라 레시피를 잰다 — `base` 는 위 명세에서 pattern · url · file · fullPage · reducedMotion 을
// 물려받고, 명세에는 `recipe` 키가 하나 더 붙는다(lib/state-recipes.mjs specFromRecipe). 레시피가 없으면 명세는 종전과 같다.
// **로캘 원장은 화면을 모아 간다(2026-10-08).** 시범은 화면 하나(`--only=/inquiry`)부터 잰다 — 로캘 원장의 화면 목록은 `--only` 와 이미 기록된
// 화면의 합이다(기록된 화면은 en 처럼 기록에서 싣는다). 아직 재지 않은 화면을 en 실행처럼 「다시 재야 한다」로 멈추지 않는다.
// en(기본) 실행 · `--only` 없는 로캘 실행은 전과 같이 모드의 화면 전부다.
const localePartial = localeMode && onlyIds.size > 0;
const localeRecordedIds = localePartial && existsSync(outputPath)
  ? new Set(Object.values(JSON.parse(readFileSync(outputPath, "utf8")).screens ?? {}).flatMap((byId) => Object.keys(byId)))
  : new Set();
if (localePartial && [...onlyIds].some((id) => !MODE_SCREEN_SPECS.some((spec) => spec.id === id))) {
  throw new Error("[product-auth-fixture] --only 의 화면이 이 모드에 없습니다: " + [...onlyIds].filter((id) => !MODE_SCREEN_SPECS.some((spec) => spec.id === id)).join(", "));
}
const SCREEN_SPECS = statesArea ? statesArea.recipes.map((recipe) => specFromRecipe(recipe, MODE_SCREEN_SPECS))
  : localePartial ? MODE_SCREEN_SPECS.filter((spec) => onlyIds.has(spec.id) || localeRecordedIds.has(spec.id))
  : MODE_SCREEN_SPECS;
if (statesArea) {
  const problems = validateRecipes([statesArea]);
  for (const spec of SCREEN_SPECS) {
    if (spec.recipe.supabase.module || Object.keys(spec.recipe.supabase.tables).length || Object.keys(spec.recipe.supabase.rpc).length) {
      if (!session && !publicSeeded) problems.push(`${spec.id}: supabase 오버레이는 가짜 Supabase 가 있는 모드(session · public-seeded)에서만 — 지금 ${statesMode}`);
    }
    if ((spec.recipe.assert.css ?? []).some((entry) => entry.sameAsBase) && !spec.recipe.base) problems.push(`${spec.id}: assert.css sameAsBase 는 base 가 있는 레시피에서만`);
  }
  if (problems.length > 0) {
    console.error("[product-auth-fixture] 상태 레시피 검증 실패 " + problems.length + "건:\n  " + problems.join("\n  "));
    process.exit(1);
  }
}
// 키가 겹치면 뒤 항목이 앞 항목을 조용히 덮어써 화면 하나가 사라진다.
const duplicateId = SCREEN_SPECS.map((spec) => spec.id)
  .find((id, index, all) => all.indexOf(id) !== index);
if (duplicateId) unavailable("화면 키가 중복입니다: " + duplicateId);

const STYLE_AXES = [
  "display", "position", "top", "right", "bottom", "left", "zIndex",
  "boxSizing", "width", "height", "minWidth", "minHeight", "maxWidth", "maxHeight",
  "flexDirection", "flexWrap", "flexGrow", "flexShrink", "flexBasis",
  "alignSelf", "alignItems", "justifyContent",
  "gridTemplateColumns", "gridTemplateRows", "gridAutoFlow",
  "gap", "rowGap", "columnGap",
  "marginTop", "marginRight", "marginBottom", "marginLeft",
  "paddingTop", "paddingRight", "paddingBottom", "paddingLeft",
  "borderTopLeftRadius", "borderTopRightRadius", "borderBottomRightRadius",
  "borderBottomLeftRadius",
  "borderTopWidth", "borderRightWidth", "borderBottomWidth", "borderLeftWidth",
  "borderTopColor", "borderRightColor", "borderBottomColor", "borderLeftColor",
  "borderTopStyle", "borderRightStyle", "borderBottomStyle", "borderLeftStyle",
  "outlineWidth", "outlineStyle", "outlineColor", "outlineOffset",
  "backgroundColor", "backgroundImage", "backgroundRepeat", "backgroundSize",
  "backgroundPosition", "color", "opacity", "boxShadow", "filter", "backdropFilter", "mixBlendMode",
  "transform", "transformOrigin", "overflow", "overflowX", "overflowY",
  "aspectRatio", "objectFit", "objectPosition", "clipPath",
  "maskImage", "maskRepeat", "maskPosition", "maskSize",
  "fill", "stroke", "strokeWidth", "strokeLinecap", "strokeLinejoin",
  "strokeDasharray", "strokeDashoffset",
  "fontFamily", "fontSize", "fontWeight", "lineHeight", "letterSpacing", "textAlign",
  "textDecorationLine", "textTransform", "whiteSpace",
];
const PSEUDO_STYLE_AXES = [
  "content", "display", "position", "top", "right", "bottom", "left",
  "width", "height", "borderTopLeftRadius", "borderTopRightRadius",
  "borderBottomRightRadius", "borderBottomLeftRadius", "backgroundColor",
  "backgroundImage", "maskImage", "webkitMaskImage", "opacity", "pointerEvents",
];

const source = (path) => gitAt(productRoot, ["show", commit + ":" + path]);
const sourceLine = (path, line) => source(path).split("\n")[line - 1] ?? "";
const sourceQuote = (path, line) => ({
  command: "git show " + commit + ":" + path,
  path,
  line,
  quote: sourceLine(path, line),
});

// 파일 확인에는 **패턴**을 쓴다. 열 URL 은 동적 세그먼트가 구체값으로 바뀌어 있어 경로가 되지
// 않는다(`/highlight/fixture-no-such-project` 라는 디렉터리는 없다).
// **라우트 그룹(2026-10-08, DS-D-0079).** Next 의 `(그룹)` 폴더는 URL 에 나타나지 않는다 — 통합 판은 인증 화면을
// `app/(auth-brand)/…` 로 옮겼다. 패턴 경로에 파일이 없으면 그룹 폴더를 뺀 경로가 같은 파일을 찾는다. 하나일 때만 —
// 둘 이상이면 모호하므로 패턴 경로를 그대로 두어 아래 확인이 측정 불가로 멈추게 한다.
let committedAppFiles = null;
const routePagePath = (spec) => {
  if (spec.file) return spec.file;
  const plain = "apps/web/app" + spec.pattern + "/page.tsx";
  if (louisExamples) return plain;
  try {
    execFileSync("git", ["cat-file", "-e", commit + ":" + plain], { cwd: productRoot, stdio: "ignore" });
    return plain;
  } catch {
    committedAppFiles ??= String(gitAt(productRoot, ["ls-tree", "-r", "--name-only", commit, "apps/web/app"])).split("\n");
    const grouped = committedAppFiles.filter((path) => path.replace(/\/\([^/]+\)/g, "") === plain);
    return grouped.length === 1 ? grouped[0] : plain;
  }
};
const routeFiles = SCREEN_SPECS.map((spec) => ({
  route: spec.id,
  path: routePagePath(spec),
}));
for (const routeFile of routeFiles) {
  if (louisExamples) {
    if (!existsSync(resolve(repoRoot, routeFile.path))) unavailable("예시 파일이 없습니다: " + routeFile.path);
    continue;
  }
  try {
    gitAt(productRoot, ["cat-file", "-e", commit + ":" + routeFile.path]);
  } catch {
    unavailable("고정 커밋에 route page가 없습니다: " + routeFile.path);
  }
}
// 상태 레시피의 제품 줄 인용 · file · surfaces 를 고정 커밋에서 확인한다 — 아래 sourceQuotes 주석이 말하는 「인용이 밀리면 다른 코드를
// 근거로 굽는다」를 레시피에서는 기계로 막는다. 확인한 인용은 원장 sourceQuotes 에 싣는다.
const recipeQuotes = [];
if (statesArea) {
  const problems = [];
  for (const spec of SCREEN_SPECS) {
    const checked = checkCites(spec.recipe, productRoot, commit);
    problems.push(...checked.problems);
    recipeQuotes.push(...checked.quotes);
  }
  if (problems.length > 0) unavailable("상태 레시피 인용이 고정 커밋과 맞지 않습니다:\n  " + problems.join("\n  "));
}

const delay = (milliseconds) => new Promise((resolveDelay) => setTimeout(resolveDelay, milliseconds));
const reservePort = async () => {
  const reservation = createServer();
  await new Promise((resolveListen, rejectListen) => {
    reservation.once("error", rejectListen);
    reservation.listen(0, "127.0.0.1", resolveListen);
  });
  const address = reservation.address();
  const port = typeof address === "object" && address ? address.port : null;
  await new Promise((resolveClose, rejectClose) =>
    reservation.close((error) => error ? rejectClose(error) : resolveClose()),
  );
  if (!port) throw new Error("[product-auth-fixture] 로컬 포트를 예약하지 못했습니다.");
  return port;
};

// 예시 모드의 정적 서버 — `packages/css` 를 낸다(예시는 `../generated/*.css` 를 상대 경로로 읽는다).
const startStaticServer = async () => {
  const { createServer: createHttpServer } = await import("node:http");
  const { extname } = await import("node:path");
  const root = resolve(repoRoot, "packages/css");
  const TYPES = { ".html": "text/html; charset=utf-8", ".css": "text/css; charset=utf-8", ".js": "text/javascript", ".svg": "image/svg+xml", ".png": "image/png", ".jpg": "image/jpeg", ".webp": "image/webp", ".woff2": "font/woff2" };
  const server = createHttpServer((request, response) => {
    const path = resolve(root, "." + decodeURIComponent(new URL(request.url, "http://x").pathname));
    if (!path.startsWith(root) || !existsSync(path)) { response.writeHead(404); response.end(); return; }
    response.writeHead(200, { "content-type": TYPES[extname(path)] ?? "application/octet-stream" });
    response.end(readFileSync(path));
  });
  await new Promise((done) => server.listen(0, "127.0.0.1", done));
  return { url: `http://127.0.0.1:${server.address().port}`, stop: () => new Promise((done) => server.close(() => done())) };
};
const startFixtureServer = async () => {
  if (louisExamples) return startStaticServer();
  const port = await reservePort();
  const url = "http://127.0.0.1:" + port;
  // **`--webpack` 을 명시한다.** Next 16 부터 `next dev` 의 기본 번들러가 Turbopack 인데,
  // 제품은 배포를 `next build --webpack` 으로 만든다(apps/web/package.json). 번들러가 다르면
  // 재는 대상이 배포본과 달라지고, 실제로 이 fixture 에서 Turbopack 은 30분이 지나도 포트를
  // 열지 않아 측정이 통째로 멈췄다(2026-08-30). 형제 게이트
  // `measure-product-sidebar-states.mjs:53` 은 처음부터 `--webpack` 을 넘기고 있었다 —
  // 이 스크립트만 기본값이 바뀐 것을 따라가지 못했다.
  const child = spawn(
    process.execPath,
    [nextCli, "dev", "--webpack", "-H", "127.0.0.1", "-p", String(port)],
    {
      cwd: webRoot,
      env: {
        ...process.env,
        PATH: dirname(process.execPath) + delimiter + (process.env.PATH ?? ""),
        NODE_ENV: "development",
        // 로그아웃 모드는 빈 문자열로 **끈다** — 제품은 `=== "1"` 만 켠다(AuthProvider · middleware). 셸의 환경변수나 fixture 의
        // `.env.local` 에 켜 둔 값이 있어도 프로세스 환경이 이긴다.
        NEXT_PUBLIC_DEV_AUTH_BYPASS: anonymous || publicMode ? "" : "1",
        NEXT_PUBLIC_SUPABASE_URL: fakeSupabase ? fakeSupabase.url : "http://127.0.0.1:9",
        NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "fixture-anon-key",
        // 통합 판(76b6cf15)은 영상 · 이미지 주소를 `NEXT_PUBLIC_CDN_BASE_URL` 로 만들고, 값이 없으면 렌더 중에 던져 화면이 오류 경계로
        // 떨어졌다(랜딩 · 노드캔버스 · 편집기 · 쇼츠, 2026-10-08). 바깥 요청은 끊으므로 닿지 않는 측정용 주소면 된다.
        NEXT_PUBLIC_CDN_BASE_URL: "https://cdn.fixture.invalid",
        // 세션 모드의 게이트 둘 — 실제 비밀이 아니라 측정용 값이다(가짜 사용자 이메일 · 픽스처 키).
        // 관리자 Supabase 클라이언트(`app/lib/supabase/admin.ts`)는 `SUPABASE_SECRET_KEY` 가 없으면 던진다 — 어드민 유저 목록 · 부스 운영 ·
        // 결제수단 API 가 본문 없는 500 으로 끝나 화면에 「Failed to execute 'json'」 원문이 찍혔다. 가짜 Supabase 는 키를 보지 않는다.
        ...(session ? { ADMIN_EMAILS: "fixture@klipse.test", CREATIVE_MEDIA_ADMIN_KEY: "fixture-booth-key", SUPABASE_SECRET_KEY: "fixture-secret-key" } : {}),
      },
      stdio: ["ignore", "pipe", "pipe"],
    },
  );
  let output = "";
  let spawnError = null;
  const append = (chunk) => {
    output = (output + chunk.toString()).slice(-64 * 1024);
  };
  child.stdout.on("data", append);
  child.stderr.on("data", append);
  child.once("error", (error) => { spawnError = error; });
  const exited = new Promise((resolveExit) => child.once("exit", resolveExit));

  let ready = false;
  for (let attempt = 0; attempt < 240; attempt += 1) {
    if (spawnError || child.exitCode !== null) break;
    try {
      const response = await fetch(url + "/archive", { redirect: "manual" });
      if (response.status >= 200 && response.status < 500) {
        ready = true;
        break;
      }
    } catch {
      // listen 또는 첫 route compile 전 연결 거절은 준비 과정이다.
    }
    await delay(250);
  }
  if (!ready) {
    if (child.exitCode === null) child.kill("SIGTERM");
    await Promise.race([exited, delay(3_000)]);
    throw new Error(
      "[product-auth-fixture] 개발 서버가 준비되지 않았습니다." +
        (spawnError ? " " + spawnError.message : "") + "\n" + output.trim(),
    );
  }

  return {
    url,
    async stop() {
      if (child.exitCode !== null) return;
      child.kill("SIGTERM");
      await Promise.race([exited, delay(5_000)]);
      if (child.exitCode === null) {
        child.kill("SIGKILL");
        await exited;
      }
    },
  };
};

// 화면이 조용해질 때까지 기다린다. 지문은 경로·테마·로캘·높이(문서 + 실제 스크롤 컨테이너들)·
// root 텍스트·요소 수·dialog 수다.
// **두 번 쓰인다** — 처음 열었을 때 한 번, 애니메이션을 얼린 뒤 그 여파를 가라앉히려 한 번 더.
// **flex 열에서 가운데 선 자식의 좌우 여백은 좌표로 정한다(2026-09-29).** 설정 화면 본문(`flex column` · `align-items: stretch` 안의
// 폭 제한 1400 칸)은 좌표가 매번 x 380 · 폭 1400 인데, Chrome 이 돌려주는 계산 여백은 재측정마다 124 와 0 을 오갔다 — 인증 원장
// 대조 게이트가 한 번씩 빨갛던 이유다(인계서 4-1). 같은 모양의 `/mypage` 본문은 0 으로 기록돼 있었다. 부모 내용 상자 안에서 좌우
// 틈이 같게 선 자식은 여백이 그 틈이다 — 흔들리는 계산값 대신 흔들리지 않는 좌표로 적는다. 정렬 · 절대 배치로 선 자식은 건드리지 않는다.
const settleCentredMargins = (tree) => {
  const byPath = new Map(tree.map((node) => [node.path, node]));
  const length = (value) => {
    const number = Number.parseFloat(value);
    return Number.isFinite(number) ? number : 0;
  };
  let settled = 0;
  for (const node of tree) {
    const parent = byPath.get(node.parentPath);
    if (!parent?.style || !node.style) continue;
    const outer = parent.style;
    const own = node.style;
    if (!/flex/.test(outer.display ?? "") || !/column/.test(outer.flexDirection ?? "")) continue;
    if (!/^(stretch|normal|flex-start|start)$/.test(outer.alignItems ?? "")) continue;
    if (/^(center|flex-end|end)$/.test(own.alignSelf ?? "")) continue;
    if (/^(absolute|fixed)$/.test(own.position ?? "")) continue;
    const contentLeft = parent.rect.x + length(outer.paddingLeft) + length(outer.borderLeftWidth);
    const contentRight = parent.rect.x + parent.rect.width - length(outer.paddingRight) - length(outer.borderRightWidth);
    const left = node.rect.x - contentLeft;
    const right = contentRight - (node.rect.x + node.rect.width);
    if (contentRight - contentLeft - node.rect.width <= 1 || Math.abs(left - right) > 1 || left <= 1) continue;
    const value = `${Math.round(left * 1000) / 1000}px`;
    if (own.marginLeft !== value || own.marginRight !== value) settled += 1;
    own.marginLeft = value;
    own.marginRight = value;
  }
  return settled;
};

// **요청이 오가는 동안에는 안정으로 세지 않는다(2026-09-29).** 지문(경로 · 글자 · 요소 수 · 높이)만 보면 화면 코드가 아직 돌지 않은
// 빈 껍데기도 0.9초 가만히 있으면 안정이 된다. 실측: `?plan=` 없이 연 결제 화면(데스크톱)이 클라이언트 리다이렉트 전의 빈 셸(노드 2 ·
// API 호출 0)로 기록됐다 — 같은 실행의 모바일은 리다이렉트 뒤(노드 95)였다. 이 화면은 리다이렉트 여부에 따라 반복 부품 집계에서 빠졌다
// 들어갔다 하므로(`screen.redirected`), 알려진 흔들림(모바일 프로필 버튼 반복 27/26)도 같은 뿌리로 본다. `isQuiet` 는 부팅 · 이동에
// 걸리는 요청(문서 · 스크립트 · 스타일 · fetch · XHR · 이미지 · 글꼴)이 하나도 진행 중이 아닐 때 참이다. 한도는 횟수가 아니라 시간이다 —
// 개발 서버가 무거운 화면을 처음 컴파일하는 동안 스크립트 요청이 오래 열려 있을 수 있다. 값이 아니라 기다림의 한도다.
const STABILIZE_DEADLINE_MS = 180_000;
const stabilize = async (page, label, isQuiet = () => true) => {
  let previous = null;
  let stableCount = 0;
  const deadline = Date.now() + STABILIZE_DEADLINE_MS;
  while (stableCount < 6 && Date.now() < deadline) {
    const fingerprint = await page.evaluate(() => {
      const rootCandidates = [...document.body.children]
        .filter((node) => node instanceof HTMLElement)
        .map((node) => {
          const rect = node.getBoundingClientRect();
          return {
            node,
            score: Math.max(0, rect.width) * Math.max(0, rect.height),
          };
        })
        .sort((left, right) => right.score - left.score);
      const root = rootCandidates[0]?.node ?? document.body;
      // **문서 높이 하나로는 이 셸이 자라는 것을 못 본다.** 앱 셸은 `h-[100dvh] overflow-hidden`
      // 이라 `document.documentElement.scrollHeight` 가 뷰포트 높이로 못박혀 있고(모바일에서
      // 874), 실제로 자라는 것은 안쪽 스크롤 컨테이너다. 그래서 문서 높이 하나가 아니라
      // **실제로 스크롤되는 컨테이너들의 `scrollHeight`** 를 함께 적는다.
      //
      // **이 축은 검출이지 제거가 아니다.** `content-visibility: auto` 의 자리표시자 → 자연
      // 높이 전환은 `contain-intrinsic-size: auto ...` 의 래치라 한 번 일어나면 되돌아오지
      // 않는다 — 지문을 넓혀도 「기다리면 수렴」하지 않는다. 래치를 못박는 것은
      // `settleContentVisibility()` 이고, 이 축은 그 보조로만 쓴다: 훑기가 닿지 못한 자리가
      // 남아 있으면 여기서 안정화가 흔들려 조용히 넘어가지 않는다.
      const scrollHeights = [];
      for (const node of document.querySelectorAll("*")) {
        if (!(node instanceof HTMLElement)) continue;
        if (node.scrollHeight <= node.clientHeight + 1) continue;
        const overflowY = getComputedStyle(node).overflowY;
        if (overflowY !== "auto" && overflowY !== "scroll") continue;
        scrollHeights.push(node.scrollHeight);
      }
      return JSON.stringify({
        path: location.pathname,
        search: location.search,
        theme: document.documentElement.dataset.theme,
        locale: document.documentElement.lang,
        height: [document.documentElement.scrollHeight, ...scrollHeights],
        rootText: root.textContent?.replace(/\s+/g, " ").trim() ?? "",
        elementCount: root.querySelectorAll("*").length,
        dialogCount: [...document.querySelectorAll('[role="dialog"]')]
          .filter((node) => {
            const rect = node.getBoundingClientRect();
            return rect.width > 0 && rect.height > 0;
          }).length,
      });
    });
    if (fingerprint === previous && isQuiet()) stableCount += 1;
    else {
      previous = fingerprint;
      stableCount = 0;
    }
    await delay(150);
  }
  if (stableCount < 6) {
    throw new Error("[product-auth-fixture] 화면이 안정화되지 않았습니다: " + label);
  }
};

// **`content-visibility: auto` 를 렌더 이력이 아니라 그림이 정하게 만든다.**
//
// `/mypage/upgrade` 의 비교표 래퍼는 `[content-visibility:auto]
// [contain-intrinsic-size:auto_1200px]` 다(`PricingSection.tsx:336-340`). 화면 밖이면 레이아웃을
// 건너뛰고 높이가 자리표시자 **1200px** 로 잡힌다. 그런데 `contain-intrinsic-size` 의 `auto`
// 키워드는 「한 번이라도 레이아웃됐으면 그 크기를 기억한다」는 뜻이라, **한 번 재고 나면 맨 위로
// 되감아도 자리표시자로 돌아오지 않는다**(실측 확인).
//
// 그래서 아무것도 하지 않으면 값이 **「이 문맥에서 몇 번째로 열린 화면이냐」** 에 달린다 — 그림과
// 무관한 렌더 이력이다. 실측: 같은 화면이 canonical 5748.9531 · redirect 4632.3594 로 갈렸고,
// 차이 1116.5937 은 비교표의 2316.59 − 1200 과 정확히 같았다.
//
// 여기서 **모든 스크롤 컨테이너를 끝까지 훑어** 자리표시자로 접혀 있던 subtree 를 전부 한 번
// 레이아웃시킨 뒤 맨 위로 되감는다. 래치는 그대로 남으므로 모든 화면이 「전부 렌더된」 상태로
// **수렴**한다 — 순서에 상관없이 비교표는 항상 자연 높이다.
//
// **스크롤러는 `document.scrollingElement` 가 아니다.** 이 셸은 `h-[100dvh] overflow-hidden` 이라
// 문서는 아예 스크롤하지 않고 안쪽 컨테이너가 스크롤한다. 그래서 경로를 가정하지 않고 실제로
// 넘치는 요소를 찾아 훑는다.
//
// 접혀 있던 subtree 안에 또 스크롤 컨테이너가 있으면 첫 훑기 전에는 `clientHeight` 가 0 이라
// 보이지 않는다. 그래서 지문(요소 수 + 스크롤러 높이들)이 그대로일 때까지 몇 바퀴 돈다.
const settleContentVisibility = async (page) => {
  await page.evaluate(async () => {
    // 레이아웃 갱신과 content-visibility 관련성 판정은 프레임 경계에서 일어난다. 한 프레임은
    // 모자랄 수 있어 세 번 넘긴다.
    const nextFrames = (count) =>
      new Promise((resolve) => {
        let left = count;
        const tick = () => (left -= 1) <= 0 ? resolve() : requestAnimationFrame(tick);
        requestAnimationFrame(tick);
      });
    const scrollersOf = () => {
      const found = [];
      for (const node of document.querySelectorAll("*")) {
        if (!(node instanceof HTMLElement)) continue;
        if (node.scrollHeight <= node.clientHeight + 1) continue;
        const overflowY = getComputedStyle(node).overflowY;
        if (overflowY !== "auto" && overflowY !== "scroll") continue;
        found.push(node);
      }
      const root = document.scrollingElement;
      // 문서 자신이 스크롤하는 화면도 있다. 위 순회는 `html` 을 포함하지 않으므로 따로 본다.
      if (root instanceof HTMLElement && root.scrollHeight > root.clientHeight + 1 &&
        !found.includes(root)) found.push(root);
      return found;
    };
    const signature = () =>
      document.querySelectorAll("*").length + ":" +
      scrollersOf().map((node) => node.scrollHeight).join(",");

    const touched = new Set();
    for (let pass = 0; pass < 4; pass += 1) {
      const before = signature();
      for (const scroller of scrollersOf()) {
        touched.add(scroller);
        const step = Math.max(1, scroller.clientHeight);
        // 훑는 동안 자리표시자가 자연 높이로 펴져 `scrollHeight` 가 자란다. 그래서 상한을 미리
        // 굳히지 않고 매 회 다시 읽는다. 대신 무한 성장에 대비해 걸음 수를 막아 둔다.
        for (let top = 0, guard = 0; top <= scroller.scrollHeight && guard < 400;
          top += step, guard += 1) {
          // `scroll-behavior: smooth` 가 걸린 컨테이너에서 대입은 애니메이션이 된다 —
          // 프레임 몇 개로는 도착하지 못하므로 명시적으로 즉시 이동시킨다.
          scroller.scrollTo({ top, left: 0, behavior: "instant" });
          await nextFrames(3);
        }
      }
      if (signature() === before) break;
    }
    // **되감는다.** 래치는 남고 스크롤 위치만 원래대로 — 측정 기하는 항상 맨 위 기준이다.
    for (const scroller of touched) {
      scroller.scrollTo({ top: 0, left: 0, behavior: "instant" });
    }
    await nextFrames(3);
  });
};

const firstDifference = (recorded, measured, path = "$") => {
  if (Object.is(recorded, measured)) return null;
  if (
    recorded === null || measured === null ||
    typeof recorded !== "object" || typeof measured !== "object"
  ) {
    return { path, recorded, measured };
  }
  const keys = [...new Set([...Object.keys(recorded), ...Object.keys(measured)])].sort();
  for (const key of keys) {
    if (!Object.hasOwn(recorded, key) || !Object.hasOwn(measured, key)) {
      return { path: path + "." + key, recorded: recorded[key], measured: measured[key] };
    }
    const difference = firstDifference(recorded[key], measured[key], path + "." + key);
    if (difference) return difference;
  }
  return null;
};

// **서버를 띄우기 전에 본다(2026-10-08).** 서버를 띄운 뒤 여기서 측정 불가로 끝나면 `process.exit` 가 개발 서버를 남겨 두어
// 그 fixture 의 다음 측정이 `.next/dev/lock` 에 막혔다(앵커 54b62a8a 이동 중 로캘 원장이 옛 앵커여서).
// 로캘 원장을 처음 잴 때는 합칠 기록이 없다 — 화면 목록이 이미 `--only` 로 좁혀져 있다(SCREEN_SPECS 주석).
const recordedForOnly = onlyIds.size > 0 && (!localeMode || existsSync(outputPath)) ? JSON.parse(readFileSync(outputPath, "utf8")) : null;
if (recordedForOnly) {
  if (recordedForOnly.productCommit !== commit) unavailable(`--only 는 같은 앵커의 원장에만 합친다: 원장 ${recordedForOnly.productCommit} · 지금 ${commit}`);
  for (const id of onlyIds) if (!SCREEN_SPECS.some((spec) => spec.id === id)) unavailable("--only 의 화면이 이 모드에 없습니다: " + id);
}
// 세션 모드만 가짜 Supabase 를 띄운다 — 서버 기동 환경(`NEXT_PUBLIC_SUPABASE_URL`)이 이 주소를 쓴다.
const fakeSupabase = session ? await startFakeSupabase({ seeds: FIXTURE_SEEDS })
  : publicSeeded ? await startFakeSupabase({ seeds: FIXTURE_PUBLIC_SEEDS }) : null;
// **상태 레시피 측정은 직렬로 돈다(설계서 3절).** 모든 실행이 같은 fixture 의 `apps/web` 에서 `next dev` 를 띄워 `.next` 를 함께 쓴다 —
// 잠금 폴더가 잡혀 있으면 기다린다. 기존 모드 실행은 잠금을 잡지 않는다(그 실행과 겹치지 않게 돌리는 것은 사람의 몫이다).
const fixtureLock = statesArea && !dumpStatic ? resolve(tmpdir(), "kds-measure-fixture.lock") : null;
if (fixtureLock) {
  for (let waited = 0; ; waited += 1) {
    try { mkdirSync(fixtureLock); break; } catch (error) { if (error.code !== "EEXIST") throw error; }
    if (waited % 20 === 0) process.stderr.write(`[product-auth-fixture] 다른 상태 레시피 측정이 fixture 를 쓰는 중 — 기다린다(${fixtureLock}, 죽은 실행이 남긴 잠금이면 rmdir)\n`);
    await delay(3_000);
  }
  process.on("exit", () => { try { rmdirSync(fixtureLock); } catch { /* 이미 풀림 */ } });
}
// LOUIS CSS 는 제품 고정 판이 아니라 이 저장소 판으로 잰다(2026-10-07, 소유자 결정) — `lib/louis-css-overlay.mjs`.
const louisCss = louisExamples || dumpStatic ? null : overlayLouisCss({ repoRoot, fixtureRoot, fail: unavailable });
const fixtureServer = dumpStatic ? { url: "http://127.0.0.1:0", stop: async () => {} } : await startFixtureServer();
// 레시피 화면의 가짜 Supabase 오버레이가 늘리는 기본 시드 — 그 모드가 가짜 Supabase 에 준 시드와 같다.
const recipeBaseSeeds = session ? FIXTURE_SEEDS : publicSeeded ? FIXTURE_PUBLIC_SEEDS : null;
// 예시 모드의 글꼴 — 예시 CSS 가 쓰는 이름(`Pretendard Variable`)으로 제품 글꼴 파일을 싣는다.
const LOUIS_EXAMPLE_FONT_CSS = louisExamples
  ? '@font-face{font-family:"Pretendard Variable";src:url(data:font/woff2;base64,' + productFontFile(productRoot, commit).toString("base64") +
    ') format("woff2-variations");font-weight:45 920;font-style:normal;font-display:block}\n'
  : "";
const styleById = new Map((recordedForOnly?.computedStyles ?? []).map((entry) => [entry.id, entry.value]));
const rehydrate = (screen) => {
  const copy = structuredClone(screen);
  const unintern = (entry) => {
    if (!entry.styleRef) return;
    if (!styleById.has(entry.styleRef)) unavailable("기록된 원장에 없는 styleRef: " + entry.styleRef);
    const style = styleById.get(entry.styleRef);
    delete entry.styleRef;
    entry.style = style;
  };
  for (const heading of copy.headings ?? []) unintern(heading);
  for (const node of copy.tree ?? []) unintern(node);
  for (const overlay of copy.overlays ?? []) for (const node of overlay.tree ?? []) unintern(node);
  return copy;
};
let browser = null;
const screens = {};
const round = (value) => Math.round(value * 10_000) / 10_000;
try {
  browser = dumpStatic ? null : await chromium.launch({ headless: true });
  for (const contextSpec of CONTEXTS) {
    screens[contextSpec.id] = {};
    for (const spec of SCREEN_SPECS) {
      // 데스크톱 전용 같은 레시피(`contexts`)는 그 밖의 뷰포트에 화면을 두지 않는다 — 원장 머리의 집계는 빈 칸을 건너뛴다.
      if (spec.recipe?.contexts && !spec.recipe.contexts.includes(contextSpec.id)) continue;
      if (dumpStatic) {
        screens[contextSpec.id][spec.id] = { requestedRoute: spec.id, headings: [], tree: [], overlays: [], redirected: false };
        continue;
      }
      if (recordedForOnly && !onlyIds.has(spec.id)) {
        const recorded = recordedForOnly.screens?.[contextSpec.id]?.[spec.id];
        if (!recorded) unavailable(`--only: 기록된 원장에 ${spec.id} @ ${contextSpec.id} 가 없어 다시 재야 합니다`);
        screens[contextSpec.id][spec.id] = rehydrate(recorded);
        continue;
      }
      // 진행을 stderr 로 찍는다(2026-10-07) — 측정기는 끝날 때까지 아무것도 내지 않아, 한 화면이 안정화 한도(180초)를 몇 번씩 돌며 멈춰도
      // 어느 화면인지 보이지 않았다(시드 화면을 더한 세션 측정이 46분 동안 조용했다). 원장에는 영향이 없다.
      const startedAt = Date.now();
      process.stderr.write(`[product-auth-fixture] ${contextSpec.id} ${spec.id} …${spec.recipe ? ` (상태 레시피 단계 ${(spec.recipe.stepsByContext?.[contextSpec.id] ?? spec.recipe.steps).length})` : ""}\n`);
      const context = await browser.newContext({
        viewport: { width: contextSpec.width, height: contextSpec.height },
        colorScheme: "light",
        // 동작 줄이기로 재는 화면(PUBLIC_ROUTES 의 랜딩 주석) — 스크롤 리빌 · 자동 재생의 도착 상태.
        ...(spec.reducedMotion ? { reducedMotion: "reduce" } : {}),
        locale: LOCALE_TAGS[LOCALE],
        extraHTTPHeaders: { "Accept-Language": LOCALE_TAGS[LOCALE] + "," + LOCALE + ";q=0.9" },
        serviceWorkers: "block",
      });
      const localResponses = [];
      const localFailures = [];
      // 레시피 화면만 — 같은 출처 `/api/*` 가로채기(설계서 2절 7번)와 가짜 Supabase 오버레이(5번). 레시피가 없으면 둘 다 null 이다.
      const recipeRouter = spec.recipe ? createRecipeRouter(spec.recipe, { origin: fixtureServer.url }) : null;
      const recipeOverlay = spec.recipe ? await supabaseOverlayOf(spec.recipe, recipeBaseSeeds ?? {}) : null;
      let supabaseMark = null;
      try {
        // 브라우저의 `Date` 만 고정한다(타이머는 그대로 돈다) — 서버가 렌더하는 상대 시각은 시드의 절대 시각이 정한다(설계서 5절 2번).
        if (spec.recipe?.clock) await context.clock.setFixedTime(new Date(spec.recipe.clock));
        await context.addCookies([
          { name: "facen-language", value: LOCALE, url: fixtureServer.url },
          // 공유 쿠키가 호스트 쿠키보다 먼저 읽힌다(serverLocale.ts). 로캘 측정에서만 세운다 — 기본 실행의 문맥은 전과 같다.
          ...(localeMode ? [{ name: "klipse-locale", value: LOCALE, url: fixtureServer.url }] : []),
          { name: "klipse-theme", value: "light", url: fixtureServer.url },
          // 세션 쿠키는 세션 모드만 넣는다 — 공개 시드 모드는 로그아웃 사용자다.
          ...(session && fakeSupabase ? [sessionCookie(fakeSupabase.url, fixtureServer.url)] : []),
        ]);
        await context.addInitScript((locale) => {
          localStorage.setItem("facen-language", locale);
          localStorage.setItem("klipse-theme", "light");
        }, LOCALE);
        // 저장소가 막힌 브라우저 — `localStorage` 접근이 던진다(위의 언어 · 테마 기록 뒤에 건다). `global-error` 화면만 쓴다.
        if (spec.blockStorage) {
          await context.addInitScript(() => {
            Object.defineProperty(window, "localStorage", {
              configurable: true,
              get() { throw new DOMException("The operation is insecure.", "SecurityError"); },
            });
            // 개발 서버는 그 오류를 오버레이(`nextjs-portal`)로 띄워 전체 오류 화면을 덮는다 — 제품 화면이 아니므로 이 화면에서만 숨긴다.
            const hide = () => {
              const style = document.createElement("style");
              style.textContent = "nextjs-portal{display:none!important}";
              (document.head ?? document.documentElement).appendChild(style);
            };
            if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", hide); else hide();
            new MutationObserver(() => { if (!document.querySelector("style[data-fixture-hide-portal]")) { const style = document.createElement("style"); style.dataset.fixtureHidePortal = ""; style.textContent = "nextjs-portal{display:none!important}"; document.documentElement.appendChild(style); } })
              .observe(document, { childList: true, subtree: true });
          });
        }
        await context.route("**/*", async (intercepted) => {
          const target = new URL(intercepted.request().url());
          // 예시의 Pretendard Variable(CDN)은 제품 글꼴 파일로 대 준다 — 같은 가변 글꼴이고, 바깥 요청은 끊는다.
          if (louisExamples && /pretendard/i.test(target.href) && target.pathname.endsWith(".css")) {
            await intercepted.fulfill({ status: 200, contentType: "text/css", body: LOUIS_EXAMPLE_FONT_CSS });
            return;
          }
          // 레시피의 `api` 항목에 맞는 같은 출처 요청은 바깥 판정 **앞에서** 가로채 답한다(hold 면 답하지 않고 붙잡는다).
          if (recipeRouter && await recipeRouter.handle(intercepted)) return;
          if (target.origin === fixtureServer.url || target.origin === fakeSupabase?.url || target.protocol === "data:") {
            await intercepted.continue();
          } else {
            await intercepted.abort("blockedbyclient");
          }
        });
        const page = await context.newPage();
        // 진행 중인 요청 — `stabilize` 는 이것이 0 일 때만 안정으로 센다(위 주석). 끝나지 않는 연결(eventsource · websocket ·
        // media)은 세지 않는다 — 세면 그런 화면은 영영 안정되지 않는다. 막힌 외부 요청은 `requestfailed` 로 곧 빠진다.
        const COUNTED_REQUESTS = new Set(["document", "script", "stylesheet", "fetch", "xhr", "image", "font"]);
        const inflight = new Set();
        page.on("request", (request) => {
          if (COUNTED_REQUESTS.has(request.resourceType())) inflight.add(request);
        });
        page.on("requestfinished", (request) => inflight.delete(request));
        page.on("requestfailed", (request) => inflight.delete(request));
        // 레시피의 `hold` 요청(로딩 상태용)은 영영 끝나지 않으므로 진행 중으로 세지 않는다 — 레시피 화면만(설계서 1-5 4번).
        const isQuiet = recipeRouter ? () => [...inflight].every((request) => recipeRouter.isHeld(request)) : () => inflight.size === 0;
        page.on("response", (response) => {
          const target = new URL(response.url());
          if (target.origin === fixtureServer.url && target.pathname.startsWith("/api/")) {
            localResponses.push({
              method: response.request().method(),
              path: target.pathname,
              status: response.status(),
            });
          }
        });
        page.on("requestfailed", (request) => {
          const target = new URL(request.url());
          if (target.origin === fixtureServer.url && target.pathname.startsWith("/api/")) {
            localFailures.push({
              method: request.method(),
              path: target.pathname,
              error: request.failure()?.errorText ?? "unknown",
            });
          }
        });

        // 개발 서버는 화면을 처음 열 때 컴파일한다 — 무거운 화면(결제 · bulk)이 60초를 넘겨 측정이 통째로 멈춘 일이 두 번 있었다
        // (2026-09-28, 매번 다른 화면). 제한을 넉넉히 둔다. 값이 아니라 기다림의 한도라 원장은 바뀌지 않는다.
        // 레시피의 표 오버레이는 `goto` **전에** 건다 — 서버 렌더도 그 표를 읽는다. 표시 뒤의 요청이 이 화면의 가짜 Supabase 요청이다.
        if (spec.recipe) {
          fakeSupabase?.setOverlay(recipeOverlay);
          supabaseMark = fakeSupabase ? fakeSupabase.beginMark() : null;
        }
        await page.goto(fixtureServer.url + spec.url, {
          waitUntil: "domcontentloaded",
          timeout: 180_000,
        });
        if (new URL(page.url()).origin !== fixtureServer.url) {
          throw new Error(
            "[product-auth-fixture] fixture 서버 밖으로 이동했습니다: " + page.url(),
          );
        }
        await delay(3_000);
        await stabilize(page, spec.id, isQuiet);
        // 조용해진 **뒤에** 훑는다 — 훑기는 스크롤을 움직이므로 아직 마운트 중인 화면에서 하면
        // 엉뚱한 자리를 훑는다. 훑고 나면 접혀 있던 subtree 가 처음 레이아웃되면서 이미지 로드
        // 같은 여파가 따라오므로 한 번 더 가라앉힌다.
        await settleContentVisibility(page);
        await stabilize(page, spec.id + " (content-visibility 확정 후)", isQuiet);
        await page.evaluate(async () => { await document.fonts.ready; });
        // **레시피 단계는 기본 흐름 다음에 돈다(설계서 1-5).** 훑기가 스크롤을 움직여 호버 · 팝오버가 풀리지 않게. 단계가 끝나면 다시
        // 가라앉히고(필요하면 훑기를 한 번 더) 글꼴을 기다린다. 그 뒤는 아래 재시도 루프 그대로다.
        if (spec.recipe) {
          await runRecipeSteps(page, spec.recipe, contextSpec.id);
          await stabilize(page, spec.id + " (상태 레시피 후)", isQuiet);
          if (spec.recipe.settleAfter) {
            await settleContentVisibility(page);
            await stabilize(page, spec.id + " (상태 레시피 · content-visibility 확정 후)", isQuiet);
          }
          await page.evaluate(async () => { await document.fonts.ready; });
        }

        // 이 패스는 **여러 번 돌 수 있다**(아래 재시도 루프). 그래서 즉시 실행이 아니라 닫힘이다.
        const runMeasurePass = () => page.evaluate(({ styleAxes, pseudoStyleAxes, fullPage, rootBody, overlaySelector, probeLabels }) => {
          // **읽기 직전에 애니메이션을 얼린다.** 회전 중인 요소의 `getBoundingClientRect()` 는
          // 잰 순간의 각도를 담는다 — 16×16 스피너는 축 정렬 경계가 16×(|cos|+|sin|) 이라
          // 16 과 22.63 사이를 오간다. 실측: `?__phase=analyzing` 의 스피너가 한 번은
          // 22.4858, 다시 재니 22.6087 이었고 그래서 `--check` 가 실패했다.
          //
          // 안정화 지문(경로·텍스트·요소 수·scrollHeight)은 이것을 잡지 못한다. 소수점
          // 아래 기하만 흔들리기 때문이다.
          //
          // 끝나는 애니메이션은 끝으로, 끝나지 않는 것은 0s 로 세운다. `finish()` 가 무한
          // 애니메이션에서 던지는 것으로 둘을 가른다 — `measure-product-variants.mjs:470` ·
          // `measure-product-scenes.mjs:425` 가 같은 이유로 쓰는 방법이다. 그리고 **같은
          // evaluate 안에서** 해야 한다: 따로 호출해 얼리면 스타일 재계산이 그것을 되돌려
          // 다시 흐른다(변이 게이트가 실측으로 확인한 함정).
          for (const animation of document.getAnimations()) {
            try { animation.finish(); } catch { animation.currentTime = 0; }
          }
          const cleanText = (value) => (value ?? "").replace(/\s+/g, " ").trim();
          const roundInPage = (value) => Math.round(value * 10_000) / 10_000;
          const rectOf = (node) => {
            const rect = node.getBoundingClientRect();
            return {
              x: roundInPage(rect.x),
              y: roundInPage(rect.y),
              width: roundInPage(rect.width),
              height: roundInPage(rect.height),
            };
          };
          const styleOf = (node) => {
            const computed = getComputedStyle(node);
            return Object.fromEntries(styleAxes.map((axis) => [
              axis,
              computed[axis].replaceAll(location.origin, ""),
            ]));
          };
          const pseudoStyleOf = (node, pseudo) => {
            const computed = getComputedStyle(node, pseudo);
            return Object.fromEntries(pseudoStyleAxes.map((axis) => [
              axis,
              computed[axis].replaceAll(location.origin, ""),
            ]));
          };
          // **줄과 경계 공백을 살린다(2026-09-28).** 옛 추출은 글자 노드만 공백으로 이어 `trim` 해서 둘을 잃었다 — `<br />` 로 가른 두
          // 문장이 한 줄로 이어졌고(`/recover` 안내), 글자와 링크 사이의 공백(`{t.hasAccount}{" "}<Link>`)이 잘려 「account?Log in」이
          // 됐다. `<br>` 은 줄바꿈으로, 요소와 맞닿은 공백은 한 칸으로 남긴다. 글자 노드끼리는 옛 추출처럼 공백으로 잇고(원장이 흔들리지
          // 않게), 공백만 있는 글자는 옛처럼 없는 것으로 본다.
          const ownText = (node) => {
            // 글자 노드 안의 줄바꿈 문자는 CSS 처럼 공백으로 접히고, 줄은 `<br>` 만 가른다.
            const ELEMENT = "\u0001";
            const BREAK = "\u0002";
            let raw = "";
            let lastWasText = false;
            for (const child of node.childNodes) {
              if (child.nodeType === Node.TEXT_NODE) {
                raw += (lastWasText ? " " : "") + child.textContent;
                lastWasText = true;
              } else if (child.nodeType === Node.ELEMENT_NODE) {
                raw += child.nodeName === "BR" ? BREAK : ELEMENT;
                lastWasText = false;
              }
            }
            const lines = raw.replace(/\s+/g, " ").split(BREAK)
              .map((line) => line.trim().split(ELEMENT).join("").replace(/ {2,}/g, " "));
            while (lines.length && !lines[0].trim()) lines.shift();
            while (lines.length && !lines[lines.length - 1].trim()) lines.pop();
            const text = lines.join("\n");
            return text.trim() ? text : "";
          };
          // **인라인 조각의 순서(2026-09-30).** 제 글자와 인라인 요소가 섞인 문단(`… at least <strong>7 days</strong> prior …`)은
          // `ownText` 가 요소를 빼고 이어 붙여 순서를 잃는다 — 생성기가 제 글자와 요소를 따로 세워 약관 문단 95곳의 문장이 흩어졌다.
          // 자식 노드 순서대로 글자 조각(문자열)과 요소 자식의 순번(수 — 자식 경로의 끝 칸)을 싣는다. `<br>` 은 "\n" 이다.
          const inlineRunsOf = (node, text) => {
            if (!text) return null;
            const elements = [...node.children];
            if (!elements.some((child) => child.tagName !== "BR")) return null;
            const runs = [];
            const pushText = (piece) => {
              if (typeof runs[runs.length - 1] === "string") runs[runs.length - 1] += piece; else runs.push(piece);
            };
            for (const child of node.childNodes) {
              if (child.nodeType === Node.TEXT_NODE) pushText(child.textContent.replace(/\s+/g, " "));
              else if (child.nodeType === Node.ELEMENT_NODE) {
                if (child.tagName === "BR") pushText("\n");
                else runs.push(elements.indexOf(child));
              }
            }
            const cleaned = runs.map((run) => (typeof run === "string" ? run.replace(/ *\n */g, "\n") : run));
            if (typeof cleaned[0] === "string") cleaned[0] = cleaned[0].replace(/^\s+/, "");
            if (typeof cleaned[cleaned.length - 1] === "string") cleaned[cleaned.length - 1] = cleaned[cleaned.length - 1].replace(/\s+$/, "");
            return cleaned.filter((run) => run !== "");
          };
          // 도형이 제 상자 밖으로 4px 넘게 넘쳐 그려지는 `overflow: visible` svg — React Flow 연결선(svg 는 기본 300×150, 선은 그 밖).
          const zeroSizeOwner = (svg) => {
            if (!(svg instanceof SVGSVGElement) || getComputedStyle(svg).overflow !== "visible") return false;
            const box = svg.getBoundingClientRect();
            return [...svg.querySelectorAll("path, line, polyline, polygon, rect, circle, ellipse")].some((shape) => {
              const r = shape.getBoundingClientRect();
              return r.width + r.height > 0 && (r.left < box.left - 4 || r.top < box.top - 4 || r.right > box.right + 4 || r.bottom > box.bottom + 4);
            });
          };
          const vectorAttributes = (node) => {
            if (!(node instanceof SVGElement)) return null;
            const names = [
              "viewBox", "preserveAspectRatio", "d", "points",
              "x", "y", "x1", "y1", "x2", "y2",
              "cx", "cy", "r", "rx", "ry", "width", "height",
              "pathLength", "fill-rule", "clip-rule",
            ];
            const attributes = Object.fromEntries(names
              .map((name) => [name, node.getAttribute(name)])
              .filter((entry) => entry[1] !== null));
            const href = node.getAttribute("href") ?? node.getAttribute("xlink:href");
            if (href) attributes.href = href.replace(location.origin, "");
            // 크기 0 svg 안의 도형(위 passThrough) — 사용자 좌표 상자를 싣는다.
            const owner = node.ownerSVGElement;
            if (node instanceof SVGGeometryElement && owner && zeroSizeOwner(owner)) {
              const box = node.getBBox();
              attributes.bbox = [box.x, box.y, box.width, box.height].map((value) => Math.round(value * 1000) / 1000).join(" ");
            }
            return Object.keys(attributes).length > 0 ? attributes : null;
          };
          // **감긴 줄을 싣는다(2026-09-29).** 보드 글꼴은 제품 글꼴(`system-ui` = 맥 Chrome 의 SF Pro 등)과 너비가 달라 폭만 옮기면
          // 줄이 다른 자리에서 꺾인다 — 데이터 삭제 상태 첫 문단이 제품 두 줄 · 보드 한 줄이라 그 아래가 25.6 올라갔다. 직계 글자
          // 노드를 한 자씩 Range 로 재서 보이는 줄마다 글자를 모은다. `<br>` 로 가른 줄 수보다 많을 때(폭 때문에 감겼을 때)만 싣고,
          // 줄을 이은 글자가 `ownText` 와 다르면 싣지 않는다(생성기가 이 줄로 글자를 다시 짓는다).
          const wrapLinesOf = (node, text) => {
            if (!text) return null;
            const textNodes = [...node.childNodes].filter((child) =>
              child.nodeType === Node.TEXT_NODE && (child.textContent ?? "").trim());
            if (textNodes.length === 0) return null;
            const whole = document.createRange();
            whole.setStart(textNodes[0], 0);
            const last = textNodes[textNodes.length - 1];
            whole.setEnd(last, (last.textContent ?? "").length);
            const tops = new Set([...whole.getClientRects()]
              .filter((box) => box.width > 0 && box.height > 0)
              .map((box) => Math.round(box.top)));
            whole.detach();
            if (tops.size < 2) return null;
            const lines = [];
            let active = null;
            for (const textNode of textNodes) {
              const source = textNode.textContent ?? "";
              for (let index = 0; index < source.length; index += 1) {
                const range = document.createRange();
                range.setStart(textNode, index);
                range.setEnd(textNode, index + 1);
                const bounds = range.getBoundingClientRect();
                range.detach();
                if (!bounds.width && !bounds.height) {
                  if (active) active.text += source[index];
                  continue;
                }
                if (!active || Math.abs(active.top - bounds.top) > bounds.height / 2) {
                  active = { top: bounds.top, text: "" };
                  lines.push(active);
                }
                active.text += source[index];
              }
            }
            const out = lines.map((line) => line.text.replace(/\s+/g, " ").trim()).filter(Boolean);
            if (out.length <= text.split("\n").length) return null;
            const flat = (value) => value.replace(/\s+/g, "");
            return flat(out.join("")) === flat(text) ? out : null;
          };
          // **입력칸의 값(2026-09-29).** 값은 글자 노드가 아니라 `ownText` 에 없다 — 쿠폰 수량 입력칸(「1」)이 보드에서 비어 있었다.
          // 비밀번호는 싣지 않는다(점으로 그려진다).
          const valueOf = (node) => {
            if (node instanceof HTMLTextAreaElement) return node.value || null;
            if (!(node instanceof HTMLInputElement)) return null;
            if (!["text", "email", "number", "tel", "search", "url"].includes(node.type)) return null;
            return node.value || null;
          };
          // `sink` 에는 트리에 실린 노드가 **트리와 같은 순서로** 쌓인다. `current` 를 만든 뒤
          // 자식으로 내려가므로 push 순서가 곧 반환 배열의 전위(pre-order) 순서다. 이 배열이
          // 뒤따르는 CDP 패스의 조인 키가 된다 — 자세한 이유는 아래 CDP 호출 자리에 적었다.
          const describe = (node, path, parentPath = null, sink = null) => {
            const computed = getComputedStyle(node);
            const rect = node.getBoundingClientRect();
            // 전체 페이지(`fullPage`)는 세로로 문서 끝까지 — 가로는 여전히 뷰포트 안만.
            const intersectsViewport = fullPage
              ? rect.right > 0 && rect.bottom > 0 && rect.left < innerWidth
              : rect.right > 0 && rect.bottom > 0 && rect.left < innerWidth && rect.top < innerHeight;
            // **선 도형은 한 변이 0 이어도 보인다(2026-09-29).** 가로선 · 세로선 `<path>`(더하기 아이콘 `M3.75 12H20.25`)는 상자의 높이나
            // 폭이 0 이라 버려졌고, 그 svg 는 자식 없이 뷰박스만 남아 서명이 비었다(허브 「New Canvas」 · 요금 체크 표시 26곳).
            const hasArea = rect.width > 0 && rect.height > 0 ||
              (node instanceof SVGGeometryElement && (rect.width > 0 || rect.height > 0));
            const visible =
              computed.display !== "none" && computed.visibility !== "hidden" &&
              computed.opacity !== "0" && hasArea && intersectsViewport;
            // **제 상자 밖으로 넘치는 svg 안의 선(2026-10-07).** React Flow 는 연결선마다 크기를 정하지 않은(기본 300×150) `overflow: visible`
            // svg 를 크기 0 인 상자(`.react-flow__edges`)에 두고, 선은 그 svg 상자 밖에 그린다 — 크기 0 상자째 버려져 선이 원장에 오지 않았다
            // (노드캔버스 연결선, 제품 캡처 대조). 그런 svg 와, 그런 svg 만 담은 크기 0 상자는 `display: contents` 처럼 건너뛰고 안으로
            // 내려간다. 안의 도형에는 사용자 좌표 상자(`bbox`)를 함께 싣는다 — 생성기가 그 상자로 도형 하나짜리 svg 를 만든다.
            const passThrough = computed.display !== "none" && computed.visibility !== "hidden" && (zeroSizeOwner(node)
              || (!visible && rect.width === 0 && rect.height === 0 && node instanceof HTMLElement && node.children.length > 0 && [...node.children].every(zeroSizeOwner)));
            // 그 svg 안의 묶음(`g`)도 상자가 아니다 — 흐름 자식이 되어 배치를 흔들지 않게 건너뛴다.
            const passGroup = node instanceof SVGGElement && node.ownerSVGElement && zeroSizeOwner(node.ownerSVGElement);
            if (passGroup) {
              return [...node.children].flatMap((child, index) => describe(child, path + "." + index, parentPath, sink));
            }
            if (passThrough) {
              return [...node.children].flatMap((child, index) => describe(child, path + "." + index, parentPath, sink));
            }
            if (!visible && computed.display !== "contents") return [];
            const src = node instanceof HTMLImageElement && node.currentSrc
              ? (() => {
                  const parsed = new URL(node.currentSrc, location.href);
                  // **next/image 는 원본을 `url` 쿼리에 싣는다(2026-09-30).** 경로만 남기면 모든 최적화 이미지가 `/_next/image` 하나로
                  // 접혀 자산 조인표가 원본을 고를 수 없었다(`/aws/signup` 브랜드 패널의 `/symbol.png`).
                  if (parsed.origin === location.origin && parsed.pathname === "/_next/image" && parsed.searchParams.get("url")) {
                    const original = new URL(parsed.searchParams.get("url"), location.href);
                    return original.origin === location.origin ? original.pathname : original.origin + original.pathname;
                  }
                  return parsed.origin === location.origin ? parsed.pathname : parsed.origin + parsed.pathname;
                })()
              : null;
            // 글자 · 감긴 줄 · 값은 보이는 노드에서만 한 번씩 잰다(감긴 줄은 한 자씩 Range 를 만든다).
            const text = visible ? ownText(node) : "";
            const wraps = visible ? wrapLinesOf(node, text) : null;
            const value = visible ? valueOf(node) : null;
            const runs = visible ? inlineRunsOf(node, text) : null;
            const current = visible ? [{
              path,
              parentPath,
              tag: node.tagName.toLowerCase(),
              ...(node.id ? { id: node.id } : {}),
              ...(node.getAttribute("role") ? { role: node.getAttribute("role") } : {}),
              ...(node.getAttribute("aria-label")
                ? { ariaLabel: node.getAttribute("aria-label") }
                : {}),
              ...(node instanceof HTMLImageElement && node.alt ? { alt: node.alt } : {}),
              ...(src ? { src } : {}),
              ...(node instanceof HTMLInputElement && node.type ? { inputType: node.type } : {}),
              ...(node instanceof HTMLInputElement && node.placeholder
                ? { placeholder: node.placeholder }
                : {}),
              // **placeholder 글자의 색(2026-10-07).** 값이 비고 placeholder 가 글자를 가진 입력칸(textarea 포함)은 제품이 그 글자를
              // `::placeholder` 색으로 그린다 — 노드캔버스 「Search layers」 · 문의 입력칸이 보드에서 비어 있었다(제품 캡처 대조).
              // 공백뿐인 placeholder(떠 있는 라벨 방식)는 싣지 않는다 — 그 칸은 글자를 그리지 않는다.
              ...((node instanceof HTMLInputElement || node instanceof HTMLTextAreaElement) && !node.value && node.placeholder?.trim()
                ? { placeholderColor: getComputedStyle(node, "::placeholder").color,
                    ...(node instanceof HTMLTextAreaElement ? { placeholder: node.placeholder } : {}) }
                : {}),
              ...(vectorAttributes(node) ? { vector: vectorAttributes(node) } : {}),
              ...(text ? { ownText: text } : {}),
              ...(wraps ? { wrapLines: wraps } : {}),
              ...(value ? { value } : {}),
              ...(runs ? { inlineRuns: runs } : {}),
              rect: rectOf(node),
              style: styleOf(node),
              // **말줄임이 실제로 일어났는가(2026-10-12 오후).** `text-overflow: ellipsis` 글자는 상자 폭으로만 재지면 잘렸는지 알 수 없다 — 노드캔버스
              // 영상 노드 모델 칩 「Seedance 2.0 …」 이 보드에서 끝까지 나왔다. 넘친 경우만 싣는다.
              ...(computed.textOverflow === "ellipsis" && node.scrollWidth > node.clientWidth + 1 ? { truncated: true } : {}),
              // **가상 요소의 그림자(2026-10-12 오후).** 제품은 노드캔버스 포트 원판 · 옆 버튼 · 생성 버튼 · 하이라이트 장면 등에 Figma 이너
              // 섀도(blur 8 · 흰색 100% · Overlay)를 `::before { box-shadow: inset … ; mix-blend-mode: overlay }` 로 근사한다. 측정이 가상 요소를
              // 재지 않아 보드가 납작했다(소유자 지적). 내용이 있고 그림자가 있는 `::before` · `::after` 만 싣는다 — 없는 노드의 원장은 그대로다.
              ...(() => {
                const shadows = ["::before", "::after"].flatMap((pseudo) => {
                  const computed = getComputedStyle(node, pseudo);
                  if (!computed.content || computed.content === "none" || !computed.boxShadow || computed.boxShadow === "none") return [];
                  return [{ pseudo, boxShadow: computed.boxShadow, mixBlendMode: computed.mixBlendMode, position: computed.position,
                    inset: [computed.top, computed.right, computed.bottom, computed.left] }];
                });
                return shadows.length ? { pseudoShadows: shadows } : {};
              })(),
            }] : [];
            if (sink && current.length > 0) sink.push(node);
            const descendants = [...node.children].flatMap((child, index) =>
              describe(child, path + "." + index, visible ? path : parentPath, sink));
            return [...current, ...descendants];
          };

          const rootCandidates = [...document.body.children]
            .filter((node) => node instanceof HTMLElement)
            .map((node, bodyIndex) => {
              const rect = node.getBoundingClientRect();
              return {
                node,
                bodyIndex,
                score: Math.max(0, rect.width) * Math.max(0, rect.height),
              };
            })
            .sort((left, right) => right.score - left.score);
          // **`body` 가 곧 화면인 경우(`rootBody`, 2026-10-07).** 전체 오류 화면은 루트 레이아웃 대신 제 `<body>` 에 바탕 · 가운데 정렬을
          // 인라인으로 건다 — 가장 큰 자식(글 묶음 267×163)을 뿌리로 잡으면 바탕과 자리가 빠진다. 그 화면만 `body` 자체를 뿌리로 잰다.
          const rootCandidate = rootBody ? { node: document.body, bodyIndex: null, score: 1 } : rootCandidates[0];
          if (!rootCandidate || rootCandidate.score === 0) {
            throw new Error("가시적인 app root를 찾지 못했습니다");
          }
          const rootPath = rootBody ? "body" : "body." + rootCandidate.bodyIndex;
          // 잰 노드를 페이지에 남겨 둔다. 다음 CDP 패스가 **이 노드들 자체**를 조인 키로 쓴다.
          const measuredNodes = [];
          const rootTree = describe(rootCandidate.node, rootPath, null, measuredNodes);
          if (rootTree.length > (fullPage ? 12_000 : 2_000)) {
            throw new Error("app root 측정 노드가 상한을 넘었습니다: " + rootTree.length);
          }
          const rootSet = new Set(rootTree.map((entry) => entry.path));
          const overlayNodes = [];
          const overlays = [...document.querySelectorAll(overlaySelector)]
            .filter((node) => {
              const rect = node.getBoundingClientRect();
              return rect.width > 0 && rect.height > 0 &&
                rect.right > 0 && rect.bottom > 0 && rect.left < innerWidth && rect.top < innerHeight &&
                !rootCandidate.node.contains(node);
            })
            // 레시피의 `overlaySelectors` 를 합친 선택자는 서로 품은 요소를 함께 잡을 수 있다 — 바깥 것만 남긴다(기본 선택자는 종전 그대로).
            .filter((node, _, all) => overlaySelector === '[role="dialog"]' || !all.some((other) => other !== node && other.contains(node)))
            .map((node, index) => ({
              index,
              tree: describe(node, "overlay." + index, null, overlayNodes),
            }));
          // **겹침도 선언을 받는다(2026-10-08).** 겹침 노드는 조인 배열에 없어 계산값만 실렸다 — 연체 배너 닫기 단추(`right: 12px`)가
          // 오른쪽 붙음인지 가를 수 없어 MIN 으로, 팔레트 대화 상자(`w-[560px] max-w-full`)가 FIXED 로 풀렸다. 겹침 노드를 뿌리 트리 뒤에
          // 겹침 순서대로 잇는다 — 붙이는 쪽도 `[...tree, ...overlays[].tree]` 순번으로 읽는다. 겹침이 없으면 배열은 종전 그대로다.
          window.__louisAuthFixtureNodes = [...measuredNodes, ...overlayNodes];

          const landmarkSelector = "header,nav,main,aside,footer,section,[role=dialog]";
          const landmarks = [...document.querySelectorAll(landmarkSelector)]
            .filter((node) => {
              const rect = node.getBoundingClientRect();
              const computed = getComputedStyle(node);
              return rect.width > 0 && rect.height > 0 && computed.visibility !== "hidden" &&
                rect.right > 0 && rect.bottom > 0 && rect.left < innerWidth && rect.top < innerHeight;
            })
            .map((node) => ({
              tag: node.tagName.toLowerCase(),
              ...(node.getAttribute("role") ? { role: node.getAttribute("role") } : {}),
              ...(node.getAttribute("aria-label")
                ? { ariaLabel: node.getAttribute("aria-label") }
                : {}),
              rect: rectOf(node),
            }));
          const headings = [...document.querySelectorAll("h1,h2,h3")]
            .filter((node) => {
              const rect = node.getBoundingClientRect();
              return rect.width > 0 && rect.height > 0 &&
                rect.right > 0 && rect.bottom > 0 && rect.left < innerWidth && rect.top < innerHeight;
            })
            .map((node) => ({
              level: Number(node.tagName.slice(1)),
              text: cleanText(node.textContent),
              rect: rectOf(node),
              style: styleOf(node),
            }));
          const vectorControlProbe = (ariaLabel) => {
            const button = [...document.querySelectorAll("button")]
              .find((node) => probeLabels[ariaLabel].includes(node.getAttribute("aria-label")));
            if (!button || !rootCandidate.node.contains(button)) return null;
            const svg = button.querySelector("svg");
            if (!svg) return null;
            return {
              ariaLabel,
              buttonRect: rectOf(button),
              svgRect: rectOf(svg),
              svgStyle: styleOf(svg),
              groups: [...svg.querySelectorAll("g")].map((group, index) => ({
                index,
                rect: rectOf(group),
                transformAttribute: group.getAttribute("transform"),
                transform: getComputedStyle(group).transform,
                transformOrigin: getComputedStyle(group).transformOrigin,
              })),
              paths: [...svg.querySelectorAll("path")].map((path, index) => ({
                index,
                rect: rectOf(path),
                vector: vectorAttributes(path),
                transform: getComputedStyle(path).transform,
                stroke: getComputedStyle(path).stroke,
                strokeWidth: getComputedStyle(path).strokeWidth,
              })),
            };
          };
          const profileRingProbe = () => {
            const button = [...document.querySelectorAll("button")]
              .find((node) => probeLabels["Open profile"].includes(node.getAttribute("aria-label")));
            if (!button || !rootCandidate.node.contains(button)) return null;
            const avatar = button.querySelector("span, img");
            const computed = getComputedStyle(button);
            return {
              ariaLabel: "Open profile",
              buttonRect: rectOf(button),
              avatarRect: avatar ? rectOf(avatar) : null,
              customProperties: Object.fromEntries([
                "--profile-avatar-size",
                "--profile-ring-gap",
                "--profile-ring-width",
                "--profile-ring-size",
                "--profile-ring-progress",
                "--profile-ring-fill",
                "--profile-ring-track",
              ].map((name) => [name, computed.getPropertyValue(name).trim()])),
              afterStyle: pseudoStyleOf(button, "::after"),
            };
          };

          return {
            finalPath: location.pathname,
            finalSearch: location.search,
            locale: document.documentElement.lang,
            theme: document.documentElement.dataset.theme,
            viewport: { width: innerWidth, height: innerHeight },
            documentHeight: roundInPage(document.documentElement.scrollHeight),
            rootPath,
            rootRect: rectOf(rootCandidate.node),
            rootNodeCount: rootSet.size,
            landmarks,
            headings,
            vectorControlProbes: {
              sidebarCollapse: vectorControlProbe("Collapse sidebar"),
              sidebarExpand: vectorControlProbe("Expand sidebar"),
              navigationOpen: vectorControlProbe("Open navigation menu"),
              subscriptionBack: vectorControlProbe("Back to subscription"),
            },
            pseudoElementProbes: {
              profileRing: profileRingProbe(),
            },
            tree: rootTree,
            overlays,
          };
        }, { styleAxes: STYLE_AXES, pseudoStyleAxes: PSEUDO_STYLE_AXES, fullPage: Boolean(spec.fullPage), rootBody: Boolean(spec.rootBody), probeLabels: PROBE_LABELS,
          // 겹침창은 `role=dialog` 만 잡는다. 레시피가 포털 메뉴 · 팝오버의 선택자를 주면 그것도 함께 잡는다(설계서 2절 10번).
          overlaySelector: spec.recipe?.overlaySelectors.length ? ['[role="dialog"]', ...spec.recipe.overlaySelectors].join(",") : '[role="dialog"]' });

        // **두 패스는 서로 다른 시각의 DOM 을 본다.** 그 사이에 mount/unmount 가 일어나면
        // 조인이 성립하지 않는다. 그래서 한 번 얼려 여파를 끄집어내고, 가라앉히고, 재고,
        // 어긋나면 처음부터 다시 한다.
        let measured = null;
        for (let attempt = 1; attempt <= MEASURE_ATTEMPTS; attempt += 1) {
          // **애니메이션은 재기 전에, 별도 호출로 한 번 얼린다.**
          //
          // `finish()` 는 끝나는 애니메이션을 끝으로 보내면서 `transitionend` · `animationend` 를
          // 발화시킨다. 제품에는 그 이벤트에서 노드를 내리는 자리가 있다(예:
          // `AnalyticsAccountMoreMenu.tsx:282` 는 전이가 끝나면 `setMenuMounted(false)`). 그
          // 이벤트는 현재 task 가 끝난 **뒤에** 배달되므로, 얼리기와 트리 순회가 같은 evaluate 안에
          // 있으면 여파가 정확히 두 패스 사이에 떨어질 수 있다. 그래서 여기서 먼저 끄집어내고
          // 가라앉힌 다음에 잰다.
          //
          // **다만 이것이 지금 걸리는 실패의 원인은 아니다 — 재서 반증했다.** 실패한 화면
          // (`/analytics/instagram` mobile)에서 `document.getAnimations()` 는 측정 시점에
          // **빈 배열**이다(세 화면 · 반복 전부 `finished=0 infinite=0`). 얼리기를 아예 빼고 재도
          // 결과가 같았다. 그러니 이 순서 바꾸기는 원인 제거가 아니라 **하나의 원인 후보를 미리
          // 치우는 것**이고, 실제 원인에는 아래 조인 키와 재시도가 대응한다.
          //
          // 측정 패스(`runMeasurePass`) 안의 얼리기는 그대로 남는다 — 스타일 재계산이 되돌린 것을
          // 다시 세우는 역할이고(스피너가 있는 `?__phase=analyzing` 이 그 자리다), 그때는 끝나는
          // 애니메이션이 이미 끝나 있어 새 이벤트가 나오지 않는다.
          await page.evaluate(() => {
            for (const animation of document.getAnimations()) {
              try { animation.finish(); } catch { animation.currentTime = 0; }
            }
          });
          await stabilize(page, spec.id + " (애니메이션 정지 후)", isQuiet);

          measured = await runMeasurePass();

          // **선언된 CSS 원문을 CDP로 덧붙인다.** `getComputedStyle`은 해결된 값을 주므로 `width:100%`와
          // 고정 px가 구분되지 않는다 — Figma Auto Layout(FILL/HUG/FIXED)을 정하려면 선언 원문이 필요하다.
          //
          // ## 조인 키는 경로가 아니라 **노드 자체**다
          //
          // 종전에는 `루트 + 자식 인덱스` 체인으로 이었다. 그 키는 위치이므로 두 패스 사이에
          // 노드가 하나라도 mount/unmount 되면 뜻이 달라진다 — 사라진 노드의 자리로 뒤 형제가
          // 당겨 들어와 **엉뚱한 노드의 선언이 조용히 붙는다.** 체인이 짧아져 경로가 아예 없어질
          // 때만 「선언 스타일이 없는 측정 노드」로 걸렸으니, 그 하드 실패는 증상의 일부만 보던
          // 것이었다.
          //
          // 그리고 이 fixture 는 그 사이에 실제로 움직인다. 실측(앵커 `5a67d692`): mobile
          // `/analytics/instagram` 에서 트리 31노드 중 **23개**가 붙지 못했고, 살아남은 8개는
          // `body.1` 부터 `body.1.0.0.1.0.0.0.0` 까지의 조상 사슬뿐이었다 — 잎 하나가 아니라
          // 그 아래가 통째로 없어졌다. 화면 하나만 새로 열어서는 재현되지 않고(단독 실행은
          // 99/99 로 깨끗하다) 44화면을 이어 도는 긴 실행의 후반에서만 났다. 안정화 판정이
          // 6×150ms = 900ms 만 조용하면 통과하는데 제품에는 3초 주기 폴링
          // (`HighlightProjectScene.tsx:44` `POLL_INTERVAL_MS = 3000`)과 이 화면 자신의
          // 클라이언트 리다이렉트(`/analytics/instagram` → `/analytics/youtube`)가 있다.
          //
          // 그래서 측정 evaluate 가 남긴 노드 배열을 그대로 키로 쓴다. React 의 재렌더는 대개 같은
          // DOM 노드를 두고 속성만 바꾸므로 참조가 살아남고, 진짜 unmount 만 참조를 끊는다.
          // 끊긴 것은 `isConnected` 로 **정확히** 드러나고, 살아 있는 노드는 무슨 일이 있어도
          // 자기 선언만 받는다.
          const { declared } = await captureDeclaredStylesForHandles(
            context,
            page,
            "window.__louisAuthFixtureNodes",
          );
          // 두 패스 사이에 트리에서 빠져나간 노드를 **먼저** 센다. 이것이 실패의 진짜 이름이다.
          const detached = await page.evaluate(() =>
            (window.__louisAuthFixtureNodes ?? [])
              .map((node, index) => (node.isConnected ? null : index))
              .filter((index) => index !== null));

          let attached = 0;
          const unresolved = [];
          // 조인 배열과 같은 순번 — 뿌리 트리 다음에 겹침 트리들(측정 evaluate 의 `__louisAuthFixtureNodes`).
          const joined = [...measured.tree, ...measured.overlays.flatMap((overlay) => overlay.tree)];
          for (const [index, node] of joined.entries()) {
            const entry = declared.get(index);
            if (!entry) { unresolved.push(index); continue; }
            if (Object.keys(entry).length > 0) { node.declared = entry; attached += 1; }
          }
          if (detached.length > 0 || unresolved.length > 0) {
            const name = (index) => {
              const node = joined[index];
              return node ? node.path + "(" + node.tag + ")" : "#" + index;
            };
            const report =
              "트리에서 빠진 노드 " + detached.length + "개" +
              (detached.length ? " (" + detached.slice(0, 3).map(name).join(", ") + ")" : "") +
              " · 선언을 못 받은 노드 " + unresolved.length + "개" +
              (unresolved.length ? " (" + unresolved.slice(0, 3).map(name).join(", ") + ")" : "");
            // **움직였다는 사실을 삼키지 않는다.** 다시 가라앉히고 다시 잰다 — 여기서 걸리는
            // 변화는 상태 전이(폴링 실패 누적, 전이 종료 후 unmount)라 한 번 일어나면 끝이다.
            // 끝내 합의하지 않으면 그것은 **계속 움직이는 화면**이라는 뜻이므로 크게 실패한다.
            if (attempt === MEASURE_ATTEMPTS) {
              throw new Error(
                "[product-auth-fixture] 두 측정 패스 사이에 DOM 이 " + attempt +
                  "회 내내 움직였습니다: " + report + " (" + spec.id + ")",
              );
            }
            measured = null;
            continue;
          }
          if (attached === 0) {
            throw new Error("[product-auth-fixture] 선언 스타일이 하나도 붙지 않았습니다 (" + spec.id + ")");
          }
          settleCentredMargins(measured.tree);
          for (const overlay of measured.overlays) settleCentredMargins(overlay.tree);
          break;
        }
        if (!measured) throw new Error("[product-auth-fixture] 측정이 성립하지 않았습니다 (" + spec.id + ")");

        // 로캘 측정은 그 언어로 그려졌는지 단언한다 — 쿠키가 먹지 않으면 en 화면을 ko 원장에 쓰게 된다. 전체 오류 화면은 제 `<html lang="ko">` 로
        // 서므로(app/global-error.tsx) 단언에서 뺀다.
        if (localeMode && spec.id !== "global-error" && !String(measured.locale ?? "").toLowerCase().startsWith(LOCALE)) {
          throw new Error("[product-auth-fixture] --locale=" + LOCALE + " 인데 화면이 " + measured.locale + " 로 그려졌습니다 (" + spec.id + " @ " + contextSpec.id + ")");
        }
        const uniqueRecords = (records) => [...new Map(records
          .map((entry) => [JSON.stringify(entry), entry])).values()]
          .sort((left, right) => JSON.stringify(left).localeCompare(JSON.stringify(right)));
        screens[contextSpec.id][spec.id] = {
          requestedRoute: spec.id,
          // 화면 키가 라우트가 아니게 되면서 **무엇을 열었는지**가 키에서 복원되지 않는다.
          // 동적 세그먼트를 무엇으로 채웠는지는 여기에만 남으므로 다를 때만 함께 적는다.
          ...(spec.url === spec.id ? {} : { requestedUrl: spec.url }),
          // 문서 끝까지 잰 화면 — 보드는 뷰포트 창이 아니라 문서 높이로 선다(build-figma-app-screens frameSize).
          ...(spec.fullPage ? { fullPage: true } : {}),
          ...(spec.reducedMotion ? { reducedMotion: true } : {}),
          ...measured,
          // 「요청한 곳과 다른 데 도착했다」를 잡는 canary다. search 를 빈 문자열로 못박으면
          // 의도한 쿼리(`?__phase=…`)까지 redirect 로 잡히므로 **의도한 search 와** 견준다.
          // 의도와 다른 search 로 끝나면 여전히 redirect 다 — OAuth 리턴 쿼리를 비우는
          // `middleware.ts:190` 같은 이동이 조용히 통과하지 않는다.
          redirected:
            measured.finalPath !== spec.expectedPath ||
            measured.finalSearch !== spec.expectedSearch,
          localApiResponses: uniqueRecords(localResponses),
          localApiFailures: uniqueRecords(localFailures),
        };
        // **레시피 화면의 검증과 기록(설계서 2절 11번 · 5절 9번).** 검증이 하나라도 어긋나면 크게 실패한다 — 클릭이 빗나가 기본 화면이
        // 조용히 안정된 것을 그 상태로 잘못 적지 않게. 통과하면 무엇으로 그 상태를 세웠는지를 화면 기록에 덧붙인다.
        if (spec.recipe) {
          const problems = recipeAssertProblems(spec.recipe, measured, recipeRouter);
          const supabaseSeen = supabaseMark === null ? [] : fakeSupabase.requests.slice(supabaseMark);
          for (const request of supabaseSeen) {
            if (request.status === 400) problems.push(`가짜 Supabase 가 모르는 조회 모양(400): ${request.method} ${request.path}${request.search}`);
          }
          const cssEntries = spec.recipe.assert.css ?? [];
          if (cssEntries.length > 0) {
            const values = await readRecipeCss(page, cssEntries);
            let baseValues = null;
            if (cssEntries.some((entry) => entry.sameAsBase)) {
              // 기준 화면의 값 — 같은 문맥의 새 탭에서 기준 화면을 열어 같은 선택자를 읽는다(레시피의 가로채기 · 오버레이는 그대로 걸려 있다).
              const base = MODE_SCREEN_SPECS.find((entry) => entry.id === spec.recipe.base);
              const basePage = await context.newPage();
              try {
                await basePage.goto(fixtureServer.url + base.url, { waitUntil: "domcontentloaded", timeout: 180_000 });
                await delay(3_000);
                await stabilize(basePage, spec.id + " (sameAsBase 기준 화면 " + base.id + ")");
                baseValues = await readRecipeCss(basePage, cssEntries);
              } finally {
                await basePage.close();
              }
            }
            cssEntries.forEach((entry, index) => {
              const label = `assert.css ${entry.selector} ${entry.property}`;
              const got = values[index];
              const want = entry.sameAsBase ? baseValues[index] : { value: entry.equals };
              if (got.error || want.error) problems.push(`${label}: ${got.error ?? ""}${want.error ? " (기준 화면) " + want.error : ""}`);
              else if (got.value !== want.value) problems.push(`${label}: ${JSON.stringify(got.value)} ≠ ${entry.sameAsBase ? "기준 화면 " : ""}${JSON.stringify(want.value)}`);
            });
          }
          if (problems.length > 0) {
            throw new Error(`[product-auth-fixture] 상태 레시피 검증 실패 (${spec.id} @ ${contextSpec.id}):\n  ` + problems.join("\n  "));
          }
          Object.assign(screens[contextSpec.id][spec.id], {
            stateRecipe: { area: statesArea.area, base: spec.recipe.baseKey, sha256: recipeDigest(spec.recipe) },
            ...(spec.recipe.clock ? { clock: spec.recipe.clock } : {}),
            recipeApi: recipeRouter.summary(),
            ...(fakeSupabase ? { recipeSupabase: {
              tables: Object.fromEntries(Object.entries(recipeOverlay?.tables ?? {}).map(([table, entry]) => [table, (Array.isArray(entry) ? entry : entry.rows).length])),
              requests: [...new Set(supabaseSeen.map((request) => `${request.method} ${request.path} ${request.status}`))].sort(),
            } } : {}),
          });
        }
        if (shotsDir) {
          const file = resolve(shotsDir, `${contextSpec.id}__${spec.id.replace(/[^A-Za-z0-9가-힣]+/g, "-").replace(/^-|-$/g, "")}.png`);
          await page.screenshot({ path: file, fullPage: Boolean(spec.fullPage) });
          process.stderr.write(`[product-auth-fixture] 캡처 ${file}\n`);
        }
      } finally {
        if (spec.recipe) fakeSupabase?.setOverlay(null);
        await context.close();
        process.stderr.write(`[product-auth-fixture] ${contextSpec.id} ${spec.id} ${Math.round((Date.now() - startedAt) / 1000)}초\n`);
      }
    }
  }
} finally {
  if (browser) await browser.close();
  await fixtureServer.stop();
  await fakeSupabase?.close();
}
assertCleanFixture("측정 후");

// 노드마다 같은 computed-style 객체를 반복하면 생성물이 수십 MB로 불어난다. 값은 버리지 않고
// table에 한 번만 넣고 노드는 styleRef로 가리킨다. table과 ref를 합치면 원래 측정값을
// byte-for-byte 복원할 수 있는 무손실 정규화다.
//
// **이름은 자리번호가 아니라 내용이 정한다.** 종전에는 `"s" + computedStyles.length` — 첫 등장
// 순서의 자리번호 — 였다. 그 이름은 **자기 값이 그대로여도** 표에 항목이 하나 늘거나 줄면 밀린다.
// 그리고 componentCandidateAudit 의 후보 id 는 정규화 subtree 의 sha256 인데 그 재료에 `styleRef`
// 가 들어 있어(아래 `normalized`), 밀림이 그대로 후보 id 까지 갈아 버린다. 실측: 앵커를 옮기며
// 표가 586 → 580 으로 **줄자** 데스크톱 `subtree-3d697148af7a` 가 값 차이 0 인 채로
// `subtree-e4077e3527d7` 가 됐다. 대가는 사람이 낸다 — 앵커를 옮길 때마다 후보 67개를 전수
// 비교해 「무해함」을 증명해야 했고, 실제로 그 작업을 한 번 했다.
//
// 내용 해시로 바꾸면 그 소음이 사라진다. **거래는 이렇다: 이 전환에서 한 번은 모든 id 가 바뀐다.**
// 이름 체계 자체가 바뀌므로 피할 수 없는 일회성 이동이고, 그 뒤로는 **내용이 실제로 바뀐 자리에서만**
// id 가 움직인다. 한 번의 전수 비교로 앞으로의 전수 비교를 없애는 쪽을 택했다.
const computedStyles = [];
const computedStyleIds = new Map();
const styleSourceById = new Map();
const internStyle = (entry) => {
  if (!entry.style) return;
  const serialized = JSON.stringify(entry.style);
  let styleRef = computedStyleIds.get(serialized);
  if (styleRef === undefined) {
    styleRef = "s" + createHash("sha256").update(serialized).digest("hex").slice(0, 12);
    // 48비트만 남긴다. 서로 다른 스타일이 같은 이름을 받으면 표가 값 하나를 삼키고 노드가 남의
    // 스타일을 가리킨다 — 그건 조용히 틀린 산출물이다. 그래서 충돌은 크게 실패시킨다.
    const collided = styleSourceById.get(styleRef);
    if (collided !== undefined && collided !== serialized) {
      throw new Error("[product-auth-fixture] styleRef 해시가 충돌했습니다: " + styleRef);
    }
    styleSourceById.set(styleRef, serialized);
    computedStyleIds.set(serialized, styleRef);
    computedStyles.push({ id: styleRef, value: entry.style });
  }
  delete entry.style;
  entry.styleRef = styleRef;
};
for (const contextSpec of CONTEXTS) {
  for (const spec of SCREEN_SPECS) {
    const screen = screens[contextSpec.id][spec.id];
    if (!screen) continue; // 레시피의 contexts 밖 뷰포트
    for (const heading of screen.headings) internStyle(heading);
    for (const node of screen.tree) internStyle(node);
    for (const overlay of screen.overlays) {
      for (const node of overlay.tree) internStyle(node);
    }
  }
}
// **배열 순서도 내용이 정한다.** 이름을 내용 해시로 바꿔도 배열이 첫 등장 순서로 남으면, 화면
// 하나가 순서를 흔드는 것만으로 생성물의 이 블록이 통째로 재배치돼 diff 가 다시 못 읽게 된다.
// 해시 사전순으로 못박아 표 자체를 재현 가능하게 만든다.
computedStyles.sort((left, right) => left.id.localeCompare(right.id));

const screenAliases = CONTEXTS.map((contextSpec) => ({
  context: contextSpec.id,
  aliases: SCREEN_SPECS
    .map((spec) => screens[contextSpec.id][spec.id])
    .filter((screen) => screen?.redirected)
    .map((screen) => ({
      requestedRoute: screen.requestedRoute,
      finalPath: screen.finalPath,
      finalSearch: screen.finalSearch,
    })),
}));

const repeatedSubtreesByContext = {};
for (const contextSpec of CONTEXTS) {
  const groups = new Map();
  for (const spec of SCREEN_SPECS) {
    const screen = screens[contextSpec.id][spec.id];
    // redirect source를 함께 넣으면 archive/settings 등 화면 전체가 “반복 component”처럼 부풀려진다.
    // 실제 최종 route에서 한 번만 후보를 찾고 redirect는 screenAliases로 따로 기록한다.
    if (!screen || screen.redirected) continue;
    for (const root of screen.tree) {
      const prefix = root.path + ".";
      const subtree = screen.tree.filter((entry) =>
        entry.path === root.path || entry.path.startsWith(prefix));
      if (subtree.length < 5) continue;
      const normalized = subtree.map((entry) => ({
        path: entry.path.slice(root.path.length),
        parentPath: entry.parentPath?.startsWith(root.path)
          ? entry.parentPath.slice(root.path.length)
          : null,
        tag: entry.tag,
        ...(entry.role ? { role: entry.role } : {}),
        ...(entry.inputType ? { inputType: entry.inputType } : {}),
        rect: {
          x: round(entry.rect.x - root.rect.x),
          y: round(entry.rect.y - root.rect.y),
          width: entry.rect.width,
          height: entry.rect.height,
        },
        styleRef: entry.styleRef,
      }));
      const serialized = JSON.stringify(normalized);
      let group = groups.get(serialized);
      if (!group) {
        group = {
          id: "subtree-" + createHash("sha256").update(serialized).digest("hex").slice(0, 12),
          nodeCount: subtree.length,
          roots: [],
        };
        groups.set(serialized, group);
      }
      group.roots.push({
        route: spec.id,
        path: root.path,
        tag: root.tag,
        rect: root.rect,
      });
    }
  }
  repeatedSubtreesByContext[contextSpec.id] = [...groups.values()]
    .map((group) => ({
      ...group,
      routeCount: new Set(group.roots.map((root) => root.route)).size,
      occurrenceCount: group.roots.length,
    }))
    .filter((group) => group.routeCount >= 2)
    .map((group) => ({
      ...group,
      score: group.nodeCount * group.routeCount,
    }))
    .sort((left, right) =>
      right.score - left.score || right.nodeCount - left.nodeCount || left.id.localeCompare(right.id))
    .slice(0, 60);
}

const MEASURE_METHOD =
  "3초 이상 기다린 뒤 path·theme·locale·height·root text·element/dialog count가 6회 연속 안정되면 app root와 외부 dialog 중 viewport와 교차하는 노드의 geometry·computed styles·SVG vector 속성, heading·landmark, localhost API status를 기록한다. 동일 computed-style 객체는 무손실 style table로 정규화하고, 그 id 는 자리번호가 아니라 값의 sha256 앞 12자다(표는 id 사전순). 이 fixture의 실패·빈 상태는 의도적으로 보존한다. LOUIS CSS(`@klipse-design/css`)는 제품이 고정한 판이 아니라 이 저장소 `packages/css/generated` 판으로 덮어 잰다(`fixture.louisCss` 의 source · productPinned, scripts/lib/louis-css-overlay.mjs).";
// 상태 레시피 원장의 머리 — 모드의 문장 앞에 레시피 문장을 붙이고, 증거 등급을 따로 둔다(설계서 2절 12번).
const STATES_METHOD = statesArea
  ? `상태 레시피(${statesArea.file}, 모드 ${statesMode}): 각 화면은 그 모드의 기본 흐름(goto → 3초 → 안정화 → content-visibility 확정 → 안정화 → 글꼴)을 탄 뒤 레시피 단계(click · fill · press · waitFor …, park 를 뺀 마지막은 waitFor)를 돌고 다시 안정화한 다음 잰다. 레시피의 같은 출처 /api/* 항목은 브라우저에서 가로채 답하고(recipeApi 에 맞은 횟수), supabase 오버레이는 그 화면 동안만 가짜 Supabase 의 표 · RPC 를 바꾼다(recipeSupabase). clock 은 브라우저 Date 만 고정한다. 측정 뒤 assert(text · apiHit · css)가 어긋나거나, required api 가 한 번도 맞지 않거나, 가짜 Supabase 가 400 을 내면 실패한다. 레시피의 제품 줄 인용(cite)은 productCommit 에서 확인해 sourceQuotes 에 싣는다. `
  : "";
const payload = JSON.stringify({
  $comment: statesArea
    ? `생성물. scripts/measure-product-auth-fixture.mjs --states=${statesArea.area} 가 ${statesArea.file} 의 상태 레시피를 그 모드(${statesMode})의 clean Next dev server 에서 열고 레시피 단계 · 가로챈 /api 응답 · 가짜 Supabase 오버레이로 세운 상태를 직접 렌더한다. 기존 모드 원장과 따로 쓴다. 직접 수정하지 않는다.`
    : louisExamples
    ? "생성물. scripts/measure-product-auth-fixture.mjs --louis-examples 가 이 저장소의 LOUIS 문서 예시(packages/css/examples)를 정적 서버로 내 1920×1080 · 402×874 에서 문서 전체를 잰다. 글꼴은 제품 PretendardVariable.woff2. 직접 수정하지 않는다."
    : session
    ? "생성물. scripts/measure-product-auth-fixture.mjs --session 이 고정 커밋의 clean Next dev server를 로컬 가짜 Supabase(인증은 고정 사용자, 데이터 조회는 빈 목록)에 붙여 띄우고 세션 쿠키를 넣어, 서버가 로그인을 확인하는 화면의 기본 상태를 직접 렌더한다. 직접 수정하지 않는다."
    : publicMode
    ? "생성물. scripts/measure-product-auth-fixture.mjs --public 이 고정 커밋의 clean Next dev server를 인증 우회 없이(로그아웃) 띄워 뷰포트보다 긴 공개 페이지를 문서 전체까지 직접 렌더한다. 직접 수정하지 않는다."
    : anonymous
    ? "생성물. scripts/measure-product-auth-fixture.mjs --anonymous 가 고정 커밋의 clean Next dev server를 인증 우회 없이(로그아웃) 띄워 공개 화면의 기본 상태를 직접 렌더한다. 직접 수정하지 않는다."
    : "생성물. scripts/measure-product-auth-fixture.mjs가 고정 커밋의 development-only auth bypass를 켠 clean Next dev server에서 보호 route 기본 상태를 직접 렌더한다. 직접 수정하지 않는다.",
  $evidenceClass: statesArea ? "development-state-recipe-fixture" : louisExamples ? "louis-static-example" : session ? "development-session-fixture" : publicMode ? "development-public-fixture"
    : anonymous ? "development-anonymous-fixture" : "development-auth-fixture",
  $notEvidenceFor: statesArea ? [
    ...(anonymous || publicMode
      ? ["운영 인증 흐름(OAuth · 메일 발송) parity", "실사용자 데이터 parity", "API 성공 상태 parity"]
      : ["운영 인증 세션 parity", "실사용자·실결제·실프로젝트 데이터 parity", "API 성공 상태 parity", "인증 후 페이지 완료 판정"]),
    "가로챈 /api 응답 · 레시피 시드 행의 내용 — 글자 · 수치는 자리표시다(크기 · 색 · 간격은 측정값)",
    "운영에서 그 상태에 이르는 경로 — 레시피 단계로 세운 개발 fixture 상태다",
  ] : louisExamples
    ? ["제품 화면 parity", "문서 내용 — 예시 문장 · 수치는 패턴 시연용이다"]
    : anonymous || publicMode
    ? ["운영 인증 흐름(OAuth · 메일 발송) parity", "실사용자 데이터 parity", "API 성공 상태 parity"]
    : [
      "운영 인증 세션 parity",
      "실사용자·실결제·실프로젝트 데이터 parity",
      "API 성공 상태 parity",
      "인증 후 페이지 완료 판정",
    ],
  $method: STATES_METHOD + (louisExamples
    ? "packages/css 를 로컬 정적 서버로 내고 예시 문서를 연다. 예시가 CDN 에서 읽는 Pretendard Variable 은 제품 글꼴 파일로 대 주고 나머지 바깥 요청은 끊는다. fullPage 로 문서 끝까지의 노드를 잰다. " + MEASURE_METHOD
    : session
    ? "fixture checkout의 clean HEAD가 productCommit인지 확인하고 NEXT_PUBLIC_DEV_AUTH_BYPASS=1 과 로컬 가짜 Supabase URL로 Next development server를 임시 localhost 포트에 띄운다. 가짜 Supabase는 /auth/v1/user 에 고정 사용자로, /rest/v1/* 조회에 빈 목록으로 답하고 요청을 기록한다 — 예외는 fixture.seededTables 의 표뿐이다(자리표시 내용, eq · order 를 PostgREST 처럼 적용). 브라우저 문맥에는 @supabase/ssr 세션 쿠키를 넣는다 — 서버 컴포넌트의 supabase.auth.getUser() 가 사용자를 돌려받는다. 외부 요청은 fixture 서버와 가짜 Supabase 밖이면 차단한다. " + MEASURE_METHOD
    : publicSeeded
    ? "fixture checkout의 clean HEAD가 productCommit인지 확인하고 NEXT_PUBLIC_DEV_AUTH_BYPASS 를 끈(빈 문자열) Next development server를 임시 localhost 포트에 띄운다 — 로그인하지 않은 사용자의 화면이다(세션 쿠키 없음). Supabase URL은 로컬 가짜 Supabase 이고, /rest/v1/* 조회는 fixture.seededTables 의 표만 자리표시 행으로(eq · order 를 PostgREST 처럼 적용) 나머지는 빈 목록으로 답한다. 외부 요청은 차단한다. fullPage 화면은 문서 끝까지의 노드를 잰다. " + MEASURE_METHOD
    : publicMode
    ? "fixture checkout의 clean HEAD가 productCommit인지 확인하고 NEXT_PUBLIC_DEV_AUTH_BYPASS 를 끈(빈 문자열) Next development server를 임시 localhost 포트에 띄운다 — 로그인하지 않은 사용자의 화면이다. Supabase URL은 연결되지 않는 localhost endpoint로 고정하고 외부 요청을 차단한다. fullPage 화면은 뷰포트가 아니라 문서 끝까지의 노드를 잰다(가로는 뷰포트 안). " + MEASURE_METHOD
    : anonymous
    ? "fixture checkout의 clean HEAD가 productCommit인지 확인하고 NEXT_PUBLIC_DEV_AUTH_BYPASS 를 끈(빈 문자열) Next development server를 임시 localhost 포트에 직접 띄운다 — 로그인하지 않은 사용자의 화면이다. 인증 화면은 로그인된 사용자를 /archive 로 보내므로(sourceQuotes) 인증 우회 서버에서는 잴 수 없다. Supabase URL은 연결되지 않는 localhost endpoint로 고정한다. 각 화면은 격리된 light/en-US 브라우저 문맥에서 열고 외부 요청을 차단한다. 한 뷰포트 안에서 끝나는 공개 화면만 싣는다(긴 공개 페이지는 전체 페이지 측정의 몫). " + MEASURE_METHOD
    : "fixture checkout의 clean HEAD가 productCommit인지 확인하고 NEXT_PUBLIC_DEV_AUTH_BYPASS=1인 Next development server를 임시 localhost 포트에 직접 띄운다. Supabase URL은 연결되지 않는 localhost endpoint로 고정한다. 각 화면은 격리된 light/en-US 브라우저 문맥에서 열고 외부 요청을 차단한다. 측정 단위는 route가 아니라 **화면 상태**다 — 한 route의 여러 상태는 URL 쿼리로 구분해 각각 잰다. `/highlight/[projectId]`의 phase는 제품의 development-only 후크 `?__phase=<이름>`으로 연다(같은 NEXT_PUBLIC_DEV_AUTH_BYPASS 게이트). 데이터가 있어야 본문이 나오는 phase(reviewed·completed)는 fixture에 시드가 없어 빈 화면이 되므로 채택하지 않았다. " + MEASURE_METHOD),
  productRef,
  productRefSource,
  productCommit: commit,
  fixture: {
    nodeEnv: "development",
    devAuthBypass: !anonymous && !publicMode && !louisExamples,
    mockSupabase: louisExamples ? "none-static-example" : session ? "local-fake-auth-seeded-tables" : publicSeeded ? "local-fake-no-session-seeded-tables" : "unreachable-localhost",
    // 시드가 든 표 — 그 표에서 온 글자는 제품 문구가 아니라 자리표시다(`lib/fixture-seeds.mjs`).
    ...(fakeSupabase ? { seededTables: Object.fromEntries(Object.entries(publicSeeded ? FIXTURE_PUBLIC_SEEDS : FIXTURE_SEEDS).map(([table, rows]) => [table, (Array.isArray(rows) ? rows : rows.rows).length])) } : {}),
    ...(fakeSupabase ? { supabaseRequests: [...new Set([...(recordedForOnly?.fixture?.supabaseRequests ?? []),
      ...fakeSupabase.requests.map((request) => `${request.method} ${request.path} ${request.status}`)])].sort() } : {}),
    ...(louisCss ? { louisCss: louisCss.record } : {}),
    // 상태 레시피 원장 — 어느 영역 파일의 어느 판으로 쟀는지(화면마다 stateRecipe.sha256 은 그 레시피 하나의 해시).
    ...(statesArea ? { stateRecipes: { file: statesArea.file, sha256: statesArea.sha256, mode: statesMode, authoredAgainst: statesArea.authoredAgainst } } : {}),
    externalRequests: "blocked",
    locale: LOCALE,
    theme: "light",
  },
  contexts: CONTEXTS,
  routes: routeFiles,
  styleAxes: STYLE_AXES,
  computedStyles,
  componentCandidateAudit: {
    $status:
      "측정으로 반복이 확인된 후보일 뿐 Figma component 또는 디자인 시스템 계약 승인 기록이 아니다.",
    $method:
      "redirect source는 screenAliases로 분리한다. canonical 최종 화면의 가시 tree에서 5노드 이상인 모든 subtree를 뽑고, root 기준 상대 geometry·tag/role/inputType·computed styleRef·DOM 경로가 viewport 안에서 완전히 같은 항목만 묶는다. 서로 다른 route 두 곳 이상에서 반복된 후보를 nodeCount×routeCount로 정렬해 viewport별 상위 60개를 기록한다. **재는 값에 영향을 주는 두 단계가 트리 수집 앞에 있다.** (가) 측정 직전에 스크롤 컨테이너를 끝까지 훑고 맨 위로 되감는다(settleContentVisibility) — `content-visibility: auto` + `contain-intrinsic-size: auto ...` 노드는 한 번도 레이아웃되지 않으면 자리표시자 높이로 잡히고, `auto` 키워드 때문에 한 번 재면 영구히 기억한다. 훑지 않으면 같은 화면이 진입 경로와 로드 순서에 따라 다른 높이로 기록된다(실측: /mypage/upgrade 비교표 1200 ↔ 2316.59, 컨테이너 높이 차 1116.5937). **이 단계가 기록 기하를 실제로 움직인다** — 잡음 제거가 아니라 값을 바꾸는 단계이므로 여기 적는다. (나) 안정화 지문의 높이는 `document.documentElement.scrollHeight` 가 아니라 실제 스크롤 컨테이너들의 scrollHeight 배열이다 — 이 셸은 `h-[100dvh] overflow-hidden` 이라 문서 높이가 뷰포트 높이로 못박혀 안쪽이 1116px 움직여도 미동이 없었다. (나)는 검출이지 제거가 아니다.",
    screenAliases,
    repeatedSubtreesByContext,
  },
  sourceQuotes: [...(louisExamples ? [] : anonymous || publicMode ? [
    // 로그인된 사용자를 되돌려 보내는 줄 — 인증 화면을 인증 우회 서버에서 잴 수 없는 이유다.
    sourceQuote("apps/web/app/(auth-brand)/login/page.tsx", 235),
    sourceQuote("apps/web/app/(auth-brand)/login/page.tsx", 237),
    sourceQuote("apps/web/app/(auth-brand)/login/page.tsx", 238),
    sourceQuote("apps/web/app/(auth-brand)/login/page.tsx", 239),
    // 우회 플래그는 `=== "1"` 로만 켜진다 — 빈 문자열이 끈다.
    sourceQuote("apps/web/components/auth/AuthProvider.tsx", 44),
    sourceQuote("apps/web/components/auth/AuthProvider.tsx", 45),
    sourceQuote("apps/web/components/auth/AuthProvider.tsx", 46),
    sourceQuote("apps/web/middleware.ts", 35),
    sourceQuote("apps/web/middleware.ts", 36),
    sourceQuote("apps/web/middleware.ts", 37),
  ] : [
    sourceQuote("apps/web/middleware.ts", 31),
    sourceQuote("apps/web/middleware.ts", 32),
    sourceQuote("apps/web/middleware.ts", 33),
    sourceQuote("apps/web/middleware.ts", 35),
    sourceQuote("apps/web/middleware.ts", 36),
    sourceQuote("apps/web/middleware.ts", 37),
    sourceQuote("apps/web/middleware.ts", 240),
    sourceQuote("apps/web/components/auth/AuthProvider.tsx", 38),
    sourceQuote("apps/web/components/auth/AuthProvider.tsx", 39),
    sourceQuote("apps/web/components/auth/AuthProvider.tsx", 40),
    sourceQuote("apps/web/components/auth/AuthProvider.tsx", 44),
    sourceQuote("apps/web/components/auth/AuthProvider.tsx", 45),
    sourceQuote("apps/web/components/auth/AuthProvider.tsx", 46),
    sourceQuote("apps/web/components/auth/AuthProvider.tsx", 48),
    sourceQuote("apps/web/components/auth/AuthProvider.tsx", 49),
    // 앵커 91e5ea2a 기준. 이 여섯 줄은 5a67d692 에서 345~350 이었고 **내용 대조로** 옮겼다 —
    // `sourceQuote` 는 좌표를 검증하지 않고 그 줄을 그대로 굽는다. 인용이 밀리면 실패하지 않고
    // **다른 코드를 근거로 굽는다**(조용히 틀린 데이터). 앵커를 옮길 때는 이 파일의 좌표
    // 스물다섯을 내용으로 다시 찾아라 — 그 대조가 이 회차에서 다섯 개를 잡았다.
    sourceQuote("apps/web/components/auth/AuthProvider.tsx", 370),
    sourceQuote("apps/web/components/auth/AuthProvider.tsx", 371),
    sourceQuote("apps/web/components/auth/AuthProvider.tsx", 372),
    sourceQuote("apps/web/components/auth/AuthProvider.tsx", 373),
    sourceQuote("apps/web/components/auth/AuthProvider.tsx", 374),
    sourceQuote("apps/web/components/auth/AuthProvider.tsx", 375),
    // phase 강제 후크. 인증 바이패스와 **같은 플래그**를 쓴다는 것이 이 두 줄에 있다 —
    // 새 환경변수가 늘지 않았고, 운영에선 NODE_ENV 게이트로 켜지지 않는다.
    sourceQuote("apps/web/components/scenes/HighlightProjectScene.tsx", 126),
    sourceQuote("apps/web/components/scenes/HighlightProjectScene.tsx", 127),
    sourceQuote("apps/web/components/scenes/HighlightProjectScene.tsx", 128),
    sourceQuote("apps/web/components/scenes/HighlightProjectScene.tsx", 316),
    // 결제 성공 화면 넷의 `?preview=` 후크 — 받는 값(사용 줄)과 운영 게이트(NODE_ENV 줄).
    sourceQuote("apps/web/app/mypage/topup/success/page.tsx", 192),
    sourceQuote("apps/web/app/mypage/topup/success/page.tsx", 195),
    sourceQuote("apps/web/app/mypage/upgrade/billing-change-success/page.tsx", 184),
    sourceQuote("apps/web/app/mypage/upgrade/billing-change-success/page.tsx", 187),
    sourceQuote("apps/web/app/mypage/upgrade/billing-success/page.tsx", 233),
    sourceQuote("apps/web/app/mypage/upgrade/billing-success/page.tsx", 237),
    sourceQuote("apps/web/app/mypage/upgrade/bulk-success/page.tsx", 136),
    sourceQuote("apps/web/app/mypage/upgrade/bulk-success/page.tsx", 139),
  ]), ...recipeQuotes],
  screens,
}, null, 2) + "\n";

if (dumpStatic) {
  // 확인 1(설계서 2절) — 화면 명세와 측정에 기대지 않는 원장 머리. 레시피 객체는 키 · 해시로 줄인다.
  writeFileSync(dumpStatic, JSON.stringify({
    screenSpecs: SCREEN_SPECS.map(({ recipe, ...spec }) => (recipe ? { ...spec, recipe: { id: recipe.id, sha256: recipeDigest(recipe) } } : spec)),
    payload: JSON.parse(payload),
  }, null, 2) + "\n");
  console.error("[product-auth-fixture] --dump-static: " + dumpStatic);
  process.exit(0);
}
if (checkOnly) {
  if (!existsSync(outputPath)) {
    console.error("[product-auth-fixture] 생성물이 없습니다: " + outputRelative);
    process.exit(1);
  }
  const recordedPayload = readFileSync(outputPath, "utf8");
  if (recordedPayload !== payload) {
    // 새로 잰 결과를 통째로 남긴다 — 흔들림은 첫 차이 한 줄로는 어느 화면인지 모른다(2026-09-29, 모바일 프로필 버튼 반복 27/26).
    const measuredPath = resolve(tmpdir(), outputRelative.replace(/[\\/]/g, "_") + ".measured.json");
    writeFileSync(measuredPath, payload);
    console.error("[product-auth-fixture] 새로 잰 결과: " + measuredPath);
    const difference = firstDifference(JSON.parse(recordedPayload), JSON.parse(payload));
    console.error(
      "[product-auth-fixture] fixture 렌더가 기록과 다릅니다: " +
        (difference
          ? difference.path + " recorded=" + JSON.stringify(difference.recorded) +
            " measured=" + JSON.stringify(difference.measured)
          : "JSON 직렬화 차이"),
    );
    process.exit(1);
  }
} else if (shotsDir) {
  console.error("[product-auth-fixture] --shots: 캡처만 남기고 원장은 쓰지 않았다 — " + shotsDir);
} else {
  if (statesArea) mkdirSync(dirname(outputPath), { recursive: true });
  atomicWriteBatch([{ absolute: outputPath, expected: payload }]);
}

console.log(
  "[product-auth-fixture] " + (statesArea ? `(상태 레시피 ${statesArea.area} · ${statesMode}) ` : louisExamples ? "(LOUIS 예시 · 전체 페이지) " : anonymous ? "(로그아웃) " : session ? "(세션) " : publicSeeded ? "(공개 시드 · 전체 페이지) " : publicMode ? "(공개 · 전체 페이지) " : "") + (checkOnly ? "checked" : "built") + ": " +
    SCREEN_SPECS.length + " screens · " + CONTEXTS.length + "문맥 @ " + commit.slice(0, 8),
);
