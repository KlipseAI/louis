#!/usr/bin/env node
import { execFileSync, spawn } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { createServer } from "node:net";
import { delimiter, dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";
import { atomicWriteBatch } from "./lib/atomic-output.mjs";
import { captureDeclaredStylesForHandles } from "./lib/declared-styles.mjs";
import { resolveProductRef } from "./lib/product-ref.mjs";

// 이 측정기는 운영 인증을 재현하지 않는다. 제품이 소스에서 명시한 development-only bypass로
// 보호 route의 로그인 후 shell과 실패/빈 기본 상태를 렌더한다. API 401/500도 숨기지 않고 함께
// 기록하며, 운영 세션·실데이터 parity의 근거로 승격할 수 없도록 산출물의 evidenceClass를 고정한다.
const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const outputPath = resolve(repoRoot, "migration/product.auth-fixture.json");
const productRoot = process.env.KLIPSE_PRODUCT_REPO ?? "/Users/sejunki/klipse-web";
const fixtureRoot =
  process.env.KLIPSE_PRODUCT_FIXTURE_ROOT ?? process.env.KLIPSE_PRODUCT_BUILD_ROOT;
const checkOnly = process.argv.includes("--check");
const { ref: productRef, source: productRefSource } = resolveProductRef();

const unavailable = (reason) => {
  console.error("[product-auth-fixture] 측정 불가 (" + reason + ")");
  process.exit(1);
};

if (!existsSync(resolve(productRoot, ".git"))) {
  unavailable("제품 저장소가 없습니다: " + productRoot);
}
if (!fixtureRoot) {
  unavailable("KLIPSE_PRODUCT_FIXTURE_ROOT 또는 KLIPSE_PRODUCT_BUILD_ROOT가 없습니다");
}
if (!existsSync(resolve(fixtureRoot, ".git"))) {
  unavailable("fixture 저장소가 아닙니다: " + fixtureRoot);
}

const gitAt = (cwd, args, encoding = "utf8") =>
  execFileSync("git", args, { cwd, encoding, maxBuffer: 128 * 1024 * 1024 });
const commit = gitAt(productRoot, ["rev-parse", productRef]).trim();
const fixtureCommit = gitAt(fixtureRoot, ["rev-parse", "HEAD"]).trim();
if (fixtureCommit !== commit) {
  unavailable(
    "fixture HEAD가 고정 커밋과 다릅니다: " +
      fixtureCommit.slice(0, 12) + " != " + commit.slice(0, 12),
  );
}

const assertCleanFixture = (stage) => {
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

const webRoot = resolve(fixtureRoot, "apps/web");
// 제품은 `.npmrc` 에 `node-linker=hoisted` 를 쓴다(첫 커밋부터). 그래서 `next` 는
// **workspace 가 아니라 저장소 루트** `node_modules` 에 실체화된다 —
// `apps/web/node_modules/next` 는 어느 시점에도 존재한 적이 없다. 한 자리만 보던 검사는
// fixture 를 제대로 갖춰도 「실행 파일이 없습니다」로 죽었고, 그래서 이 게이트는
// **한 번도 실제로 측정한 적이 없다.** 두 자리를 다 본다.
const nextCli = [
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

// 문자열·객체 항목을 하나의 모양으로 편다. `expectedSearch` 는 redirect 판정에 쓴다 —
// 「의도한 search 로 끝났는가」를 물어야 하므로 빈 문자열을 못박을 수 없다.
const SCREEN_SPECS = ROUTES.map((entry) => {
  const spec = typeof entry === "string" ? { pattern: entry } : entry;
  const url = spec.url ?? spec.pattern;
  const target = new URL(url, "http://fixture.invalid");
  return {
    id: spec.id ?? url,
    pattern: spec.pattern,
    url,
    expectedPath: target.pathname,
    expectedSearch: target.search,
  };
});
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
  "backgroundPosition", "color", "opacity", "boxShadow", "filter", "backdropFilter",
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
const routeFiles = SCREEN_SPECS.map((spec) => ({
  route: spec.id,
  path: "apps/web/app" + spec.pattern + "/page.tsx",
}));
for (const routeFile of routeFiles) {
  try {
    gitAt(productRoot, ["cat-file", "-e", commit + ":" + routeFile.path]);
  } catch {
    unavailable("고정 커밋에 route page가 없습니다: " + routeFile.path);
  }
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

const startFixtureServer = async () => {
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
        NEXT_PUBLIC_DEV_AUTH_BYPASS: "1",
        NEXT_PUBLIC_SUPABASE_URL: "http://127.0.0.1:9",
        NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "fixture-anon-key",
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
const stabilize = async (page, label) => {
  let previous = null;
  let stableCount = 0;
  for (let attempt = 0; attempt < 80 && stableCount < 6; attempt += 1) {
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
    if (fingerprint === previous) stableCount += 1;
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

const fixtureServer = await startFixtureServer();
let browser = null;
const screens = {};
const round = (value) => Math.round(value * 10_000) / 10_000;
try {
  browser = await chromium.launch({ headless: true });
  for (const contextSpec of CONTEXTS) {
    screens[contextSpec.id] = {};
    for (const spec of SCREEN_SPECS) {
      const context = await browser.newContext({
        viewport: { width: contextSpec.width, height: contextSpec.height },
        colorScheme: "light",
        locale: "en-US",
        extraHTTPHeaders: { "Accept-Language": "en-US,en;q=0.9" },
        serviceWorkers: "block",
      });
      const localResponses = [];
      const localFailures = [];
      try {
        await context.addCookies([
          { name: "facen-language", value: "en", url: fixtureServer.url },
          { name: "klipse-theme", value: "light", url: fixtureServer.url },
        ]);
        await context.addInitScript(() => {
          localStorage.setItem("facen-language", "en");
          localStorage.setItem("klipse-theme", "light");
        });
        await context.route("**/*", async (intercepted) => {
          const target = new URL(intercepted.request().url());
          if (target.origin === fixtureServer.url || target.protocol === "data:") {
            await intercepted.continue();
          } else {
            await intercepted.abort("blockedbyclient");
          }
        });
        const page = await context.newPage();
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

        await page.goto(fixtureServer.url + spec.url, {
          waitUntil: "domcontentloaded",
          timeout: 60_000,
        });
        if (new URL(page.url()).origin !== fixtureServer.url) {
          throw new Error(
            "[product-auth-fixture] fixture 서버 밖으로 이동했습니다: " + page.url(),
          );
        }
        await delay(3_000);
        await stabilize(page, spec.id);
        // 조용해진 **뒤에** 훑는다 — 훑기는 스크롤을 움직이므로 아직 마운트 중인 화면에서 하면
        // 엉뚱한 자리를 훑는다. 훑고 나면 접혀 있던 subtree 가 처음 레이아웃되면서 이미지 로드
        // 같은 여파가 따라오므로 한 번 더 가라앉힌다.
        await settleContentVisibility(page);
        await stabilize(page, spec.id + " (content-visibility 확정 후)");
        await page.evaluate(async () => { await document.fonts.ready; });

        // 이 패스는 **여러 번 돌 수 있다**(아래 재시도 루프). 그래서 즉시 실행이 아니라 닫힘이다.
        const runMeasurePass = () => page.evaluate(({ styleAxes, pseudoStyleAxes }) => {
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
          const ownText = (node) => cleanText(
            [...node.childNodes]
              .filter((child) => child.nodeType === Node.TEXT_NODE)
              .map((child) => child.textContent)
              .join(" "),
          );
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
            return Object.keys(attributes).length > 0 ? attributes : null;
          };
          // `sink` 에는 트리에 실린 노드가 **트리와 같은 순서로** 쌓인다. `current` 를 만든 뒤
          // 자식으로 내려가므로 push 순서가 곧 반환 배열의 전위(pre-order) 순서다. 이 배열이
          // 뒤따르는 CDP 패스의 조인 키가 된다 — 자세한 이유는 아래 CDP 호출 자리에 적었다.
          const describe = (node, path, parentPath = null, sink = null) => {
            const computed = getComputedStyle(node);
            const rect = node.getBoundingClientRect();
            const intersectsViewport =
              rect.right > 0 && rect.bottom > 0 && rect.left < innerWidth && rect.top < innerHeight;
            const visible =
              computed.display !== "none" && computed.visibility !== "hidden" &&
              computed.opacity !== "0" && rect.width > 0 && rect.height > 0 && intersectsViewport;
            if (!visible && computed.display !== "contents") return [];
            const src = node instanceof HTMLImageElement && node.currentSrc
              ? (() => {
                  const parsed = new URL(node.currentSrc, location.href);
                  return parsed.origin === location.origin ? parsed.pathname : parsed.origin + parsed.pathname;
                })()
              : null;
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
              ...(vectorAttributes(node) ? { vector: vectorAttributes(node) } : {}),
              ...(ownText(node) ? { ownText: ownText(node) } : {}),
              rect: rectOf(node),
              style: styleOf(node),
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
          const rootCandidate = rootCandidates[0];
          if (!rootCandidate || rootCandidate.score === 0) {
            throw new Error("가시적인 app root를 찾지 못했습니다");
          }
          const rootPath = "body." + rootCandidate.bodyIndex;
          // 잰 노드를 페이지에 남겨 둔다. 다음 CDP 패스가 **이 노드들 자체**를 조인 키로 쓴다.
          const measuredNodes = [];
          const rootTree = describe(rootCandidate.node, rootPath, null, measuredNodes);
          window.__louisAuthFixtureNodes = measuredNodes;
          if (rootTree.length > 2_000) {
            throw new Error("app root 측정 노드가 2,000개를 넘었습니다: " + rootTree.length);
          }
          const rootSet = new Set(rootTree.map((entry) => entry.path));
          const overlays = [...document.querySelectorAll('[role="dialog"]')]
            .filter((node) => {
              const rect = node.getBoundingClientRect();
              return rect.width > 0 && rect.height > 0 &&
                rect.right > 0 && rect.bottom > 0 && rect.left < innerWidth && rect.top < innerHeight &&
                !rootCandidate.node.contains(node);
            })
            .map((node, index) => ({
              index,
              tree: describe(node, "overlay." + index),
            }));

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
              .find((node) => node.getAttribute("aria-label") === ariaLabel);
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
              .find((node) => node.getAttribute("aria-label") === "Open profile");
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
        }, { styleAxes: STYLE_AXES, pseudoStyleAxes: PSEUDO_STYLE_AXES });

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
          await stabilize(page, spec.id + " (애니메이션 정지 후)");

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
          for (const [index, node] of measured.tree.entries()) {
            const entry = declared.get(index);
            if (!entry) { unresolved.push(index); continue; }
            if (Object.keys(entry).length > 0) { node.declared = entry; attached += 1; }
          }
          if (detached.length > 0 || unresolved.length > 0) {
            const name = (index) => {
              const node = measured.tree[index];
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
          break;
        }
        if (!measured) throw new Error("[product-auth-fixture] 측정이 성립하지 않았습니다 (" + spec.id + ")");

        const uniqueRecords = (records) => [...new Map(records
          .map((entry) => [JSON.stringify(entry), entry])).values()]
          .sort((left, right) => JSON.stringify(left).localeCompare(JSON.stringify(right)));
        screens[contextSpec.id][spec.id] = {
          requestedRoute: spec.id,
          // 화면 키가 라우트가 아니게 되면서 **무엇을 열었는지**가 키에서 복원되지 않는다.
          // 동적 세그먼트를 무엇으로 채웠는지는 여기에만 남으므로 다를 때만 함께 적는다.
          ...(spec.url === spec.id ? {} : { requestedUrl: spec.url }),
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
      } finally {
        await context.close();
      }
    }
  }
} finally {
  if (browser) await browser.close();
  await fixtureServer.stop();
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
    .filter((screen) => screen.redirected)
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
    if (screen.redirected) continue;
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

const payload = JSON.stringify({
  $comment:
    "생성물. scripts/measure-product-auth-fixture.mjs가 고정 커밋의 development-only auth bypass를 켠 clean Next dev server에서 보호 route 기본 상태를 직접 렌더한다. 직접 수정하지 않는다.",
  $evidenceClass: "development-auth-fixture",
  $notEvidenceFor: [
    "운영 인증 세션 parity",
    "실사용자·실결제·실프로젝트 데이터 parity",
    "API 성공 상태 parity",
    "인증 후 페이지 완료 판정",
  ],
  $method:
    "fixture checkout의 clean HEAD가 productCommit인지 확인하고 NEXT_PUBLIC_DEV_AUTH_BYPASS=1인 Next development server를 임시 localhost 포트에 직접 띄운다. Supabase URL은 연결되지 않는 localhost endpoint로 고정한다. 각 화면은 격리된 light/en-US 브라우저 문맥에서 열고 외부 요청을 차단한다. 측정 단위는 route가 아니라 **화면 상태**다 — 한 route의 여러 상태는 URL 쿼리로 구분해 각각 잰다. `/highlight/[projectId]`의 phase는 제품의 development-only 후크 `?__phase=<이름>`으로 연다(같은 NEXT_PUBLIC_DEV_AUTH_BYPASS 게이트). 데이터가 있어야 본문이 나오는 phase(reviewed·completed)는 fixture에 시드가 없어 빈 화면이 되므로 채택하지 않았다. 3초 이상 기다린 뒤 path·theme·locale·height·root text·element/dialog count가 6회 연속 안정되면 app root와 외부 dialog 중 viewport와 교차하는 노드의 geometry·computed styles·SVG vector 속성, heading·landmark, localhost API status를 기록한다. 동일 computed-style 객체는 무손실 style table로 정규화하고, 그 id 는 자리번호가 아니라 값의 sha256 앞 12자다(표는 id 사전순). 이 fixture의 실패·빈 상태는 의도적으로 보존한다.",
  productRef,
  productRefSource,
  productCommit: commit,
  fixture: {
    nodeEnv: "development",
    devAuthBypass: true,
    mockSupabase: "unreachable-localhost",
    externalRequests: "blocked",
    locale: "en",
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
  sourceQuotes: [
    sourceQuote("apps/web/middleware.ts", 31),
    sourceQuote("apps/web/middleware.ts", 32),
    sourceQuote("apps/web/middleware.ts", 33),
    sourceQuote("apps/web/middleware.ts", 35),
    sourceQuote("apps/web/middleware.ts", 36),
    sourceQuote("apps/web/middleware.ts", 37),
    sourceQuote("apps/web/middleware.ts", 215),
    sourceQuote("apps/web/components/auth/AuthProvider.tsx", 30),
    sourceQuote("apps/web/components/auth/AuthProvider.tsx", 31),
    sourceQuote("apps/web/components/auth/AuthProvider.tsx", 32),
    sourceQuote("apps/web/components/auth/AuthProvider.tsx", 36),
    sourceQuote("apps/web/components/auth/AuthProvider.tsx", 37),
    sourceQuote("apps/web/components/auth/AuthProvider.tsx", 38),
    sourceQuote("apps/web/components/auth/AuthProvider.tsx", 40),
    sourceQuote("apps/web/components/auth/AuthProvider.tsx", 41),
    // 앵커 27984014 기준. 이 여섯 줄은 5a67d692 에서 345~350 이었고 **내용 대조로** 옮겼다 —
    // `sourceQuote` 는 좌표를 검증하지 않고 그 줄을 그대로 굽는다. 인용이 밀리면 실패하지 않고
    // **다른 코드를 근거로 굽는다**(조용히 틀린 데이터). 앵커를 옮길 때는 이 파일의 좌표
    // 스물다섯을 내용으로 다시 찾아라 — 그 대조가 이 회차에서 다섯 개를 잡았다.
    sourceQuote("apps/web/components/auth/AuthProvider.tsx", 352),
    sourceQuote("apps/web/components/auth/AuthProvider.tsx", 353),
    sourceQuote("apps/web/components/auth/AuthProvider.tsx", 354),
    sourceQuote("apps/web/components/auth/AuthProvider.tsx", 355),
    sourceQuote("apps/web/components/auth/AuthProvider.tsx", 356),
    sourceQuote("apps/web/components/auth/AuthProvider.tsx", 357),
    // phase 강제 후크. 인증 바이패스와 **같은 플래그**를 쓴다는 것이 이 두 줄에 있다 —
    // 새 환경변수가 늘지 않았고, 운영에선 NODE_ENV 게이트로 켜지지 않는다.
    sourceQuote("apps/web/components/scenes/HighlightProjectScene.tsx", 128),
    sourceQuote("apps/web/components/scenes/HighlightProjectScene.tsx", 129),
    sourceQuote("apps/web/components/scenes/HighlightProjectScene.tsx", 130),
    sourceQuote("apps/web/components/scenes/HighlightProjectScene.tsx", 878),
  ],
  screens,
}, null, 2) + "\n";

if (checkOnly) {
  if (!existsSync(outputPath)) {
    console.error("[product-auth-fixture] 생성물이 없습니다: migration/product.auth-fixture.json");
    process.exit(1);
  }
  const recordedPayload = readFileSync(outputPath, "utf8");
  if (recordedPayload !== payload) {
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
} else {
  atomicWriteBatch([{ absolute: outputPath, expected: payload }]);
}

console.log(
  "[product-auth-fixture] " + (checkOnly ? "checked" : "built") + ": " +
    SCREEN_SPECS.length + " screens · " + CONTEXTS.length + "문맥 @ " + commit.slice(0, 8),
);
