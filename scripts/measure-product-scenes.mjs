#!/usr/bin/env node
import { execFileSync, spawn } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { createServer } from "node:net";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";
import { atomicWriteBatch } from "./lib/atomic-output.mjs";
import { captureDeclaredStyles } from "./lib/declared-styles.mjs";
import { notMeasured, unavailable } from "./lib/gate-exit.mjs";
import { assertLiveProductSceneCoverage } from "./lib/product-scene-contract.mjs";
import { resolveProductRef } from "./lib/product-ref.mjs";

// 제품 랜딩의 합성 장면은 클래스 문자열 하나만 떼어 정적 하네스에 올리면 재현되지 않는다.
// Next Image의 intrinsic ratio, viewport 기반 패드 높이, 중첩 컴포넌트, scene-scale이 함께
// 계산되기 때문이다. 이 측정기는 고정 커밋으로 이미 빌드된 프로덕션 서버를 실제 viewport에서
// 열고, figma/product-specimens.json의 liveOnly 구조에 대응하는 모든 노드를 직접 잰다.
const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const specimenPath = resolve(repoRoot, "figma/product-specimens.json");
const outputPath = resolve(repoRoot, "migration/product.scenes.json");
const productRoot = process.env.KLIPSE_PRODUCT_REPO ?? "/Users/sejunki/klipse-web";
const productBuildRoot = process.env.KLIPSE_PRODUCT_BUILD_ROOT;
const checkOnly = process.argv.includes("--check");
const { ref: productRef } = resolveProductRef();

const cannotMeasure = (reason) => unavailable("product-scenes", reason);

if (!existsSync(resolve(productRoot, ".git"))) {
  cannotMeasure("제품 저장소가 없습니다: " + productRoot);
}

const CONTEXTS = [
  { id: "desktop-1920x1080", width: 1920, height: 1080 },
  { id: "mobile-402x874", width: 402, height: 874 },
];
const PAGE_ROUTES = ["/", "/pricing", "/privacy", "/terms"];
const GENERIC_PAGE_ROUTES = [
  /* `/docs` 넷은 걷어냈다. 제품 `ca56540c feat(web): /docs 를 제품에서 제거한다` 로 트리째
     사라져 잴 것이 없다. 개명 회차가 이 줄의 `/docs/nodecanvas` 를 `/docs/canvas` 로 옮겼는데
     그건 **이미 죽은 주소를 옮긴 것**이었다. 문서는 이제 klipse-docs 가 따로 낸다. */
  "/blog", "/templates", "/templates/filter", "/inquiry", "/data-deletion-status",
  "/login", "/signup", "/signup/check-email", "/signup/expired", "/signup/verified",
  "/recover", "/reset-password", "/reset-password/new", "/aws/signup",
];
const MEASURED_ROUTES = [...PAGE_ROUTES, ...GENERIC_PAGE_ROUTES];

// **잴 것이 있는지, 빌드를 요구하기 전에 본다.** 살아 있는 표본이 없는데 빌드 루트가 없다고
// 실패하면 원인이 "환경이 없다"로 보이지만 사실은 "잴 것이 없다"다 — 유일한 표본이 가리키던
// 랜딩 데모가 제품 `8802565e` 에서 지워졌는데 표본은 남아 있었고, 게이트는 환경 탓을 하며
// 영구 빨강이었다(2026-08-30). 두 사정을 종료코드로도 가른다 — 1 = UNAVAILABLE(환경이 없다),
// 2 = NOT_MEASURED(환경은 있는데 잴 것이 없다). scripts/lib/gate-exit.mjs 참조.
//
// **제품 저장소 확인보다 뒤에 둔다.** `verify-gate-split` 이 「제품/빌드 없이 exit 0 하면
// 로컬 게이트가 조용히 꺼진 것」이라고 판정하고, 그 진단 문구를 직접 확인한다. 순서를 바꾸면
// 그 메타 게이트가 깨진다 — 실제로 한 번 그렇게 만들었다가 잡혔다.
// ── 2026-09-10: 축을 갈랐다 ──────────────────────────────────────────────
// 여기서 통째로 멈추던 것을 **장면 축만** 멈추게 바꾼다. 아래 주석이 그 이유를 이미 적고
// 있었다 — 「이 return 뒤에는 concrete route 측정이 통째로 있다. 표본이 비면 그것까지 같이
// 죽고, 그동안 migration/product.scenes.json 은 갱신되지 않은 채
// scripts/build-figma-product-pricing-page.mjs 의 증거로 계속 소비된다.」
// 실제로 그렇게 됐다: 앵커가 286커밋 움직이는 동안 요금제 보드는 옛 제품 문구를 그렸다.
//
// **「재지 않은 것은 통과가 아니다」는 그대로 지킨다.** 판정을 축마다로 옮겼을 뿐이다 —
// route 축이 0건이면 아래에서 NOT_MEASURED(2) 로 끝난다. 장면 축이 0건인 것은 payload 의
// `scenes.notMeasured` 에 사유와 함께 적히고, 그 값이 LIVE_PRODUCT_SCENE_IDS 와 어긋나면
// assertLiveProductSceneCoverage 가 던진다. 즉 조용히 꺼지는 경로는 새로 생기지 않는다.
const SCENE_AXIS_SKIP = (() => {
  const specimens = JSON.parse(readFileSync(specimenPath, "utf8")).specimens;
  assertLiveProductSceneCoverage(specimens);
  if (specimens.filter((entry) => entry.liveOnly).length === 0) {
    return (
    // **`exit 0` 이 아니다.** 예전에는 여기서 전용 문구를 찍고 통과했다. 문구는 사람이 읽으라고
    // 있었지만 `package.json` 의 `&&` 사슬도 `verify-gate-split` 의 단계 계수도 **종료코드만**
    // 본다 — 그래서 `verify-product-scenes` 는 표본 0개·route 0개를 재고 초록이었다
    // (2026-09-01 원장 `scenes-gate-measures-nothing`). 재지 않은 것은 통과가 아니다.
    //
    // **잃는 것은 합성 장면 하나가 아니다.** 이 return 뒤에는 concrete route 측정이 통째로
    // 있다. 표본이 비면 그것까지 같이 죽고, 그동안 migration/product.scenes.json 은 갱신되지
    // 않은 채 scripts/build-figma-product-pricing-page.mjs 의 증거로 계속 소비된다. 그래서
    // 무엇을 못 쟀는지 숫자로 적는다 — 「랜딩 데모가 지워졌다」로 읽고 넘어가지 않게 한다.
      "liveOnly 표본이 0개입니다. 합성 장면 " + CONTEXTS.length + "문맥을 재지 않습니다. " +
        "랜딩에 합성 장면이 다시 서면 scripts/lib/product-scene-contract.mjs 의 " +
        "LIVE_PRODUCT_SCENE_IDS 에 id 를 넣어 되살립니다. route 축은 이와 무관하게 잽니다."
    );
  }
  return null;
})();

if (!productBuildRoot) cannotMeasure("KLIPSE_PRODUCT_BUILD_ROOT가 없습니다");
if (!existsSync(resolve(productBuildRoot, ".git"))) {
  cannotMeasure("빌드 저장소가 아닙니다: " + productBuildRoot);
}

const gitAt = (cwd, args, encoding = "utf8") =>
  execFileSync("git", args, { cwd, encoding, maxBuffer: 128 * 1024 * 1024 });
const commit = gitAt(productRoot, ["rev-parse", productRef]).trim();
const buildCommit = gitAt(productBuildRoot, ["rev-parse", "HEAD"]).trim();
if (buildCommit !== commit) {
  console.error(
    "[product-scenes] 빌드 커밋이 고정 커밋과 다릅니다: " +
      buildCommit.slice(0, 12) + " != " + commit.slice(0, 12),
  );
  process.exit(1);
}

const buildStatus = gitAt(productBuildRoot, [
  "status",
  "--porcelain=v1",
  "--untracked-files=all",
]).trim();
if (buildStatus) {
  cannotMeasure(
    "빌드 저장소가 dirty입니다. 고정 커밋의 clean checkout에서 다시 빌드하세요: " +
      buildStatus.split("\n")[0],
  );
}

const specimenFile = JSON.parse(readFileSync(specimenPath, "utf8"));
const liveSpecimens = assertLiveProductSceneCoverage(specimenFile.specimens);
// **표본이 없으면 undefined 다.** 위 SCENE_AXIS_SKIP 가 그 사정을 문자열로 들고 있고,
// 아래 장면 축은 그것이 null 일 때만 돈다. 이 자리에서 죽지 않는 것이 축 분리의 요점이다.
const specimen = liveSpecimens.find((entry) => entry.id === "scene/staticHighlightDemo");
if (!SCENE_AXIS_SKIP && !specimen) {
  console.error(
    "[product-scenes] liveOnly 표본은 있는데 `scene/staticHighlightDemo` 가 없습니다. " +
      "장면 측정 본문이 그 id 를 하드코딩하므로(아래 #highlight DOM 모양) 다른 id 를 " +
      "LIVE_PRODUCT_SCENE_IDS 에 넣는 것만으로는 되살아나지 않습니다 — 본문을 함께 고치세요.",
  );
  process.exit(1);
}

const declaredNodes = [];
const visit = (node, parent = null) => {
  declaredNodes.push({
    part: node.part,
    parent,
    tag: node.tag,
    ...(Object.hasOwn(node, "text") ? { text: node.text } : {}),
  });
  for (const child of node.children ?? []) visit(child, node.part);
};
if (specimen) visit(specimen.node);
const declaredParts = declaredNodes.map((node) => node.part);
if (new Set(declaredParts).size !== declaredParts.length) {
  console.error("[product-scenes] liveOnly 표본의 part 이름은 측정 키로 쓰므로 중복될 수 없습니다.");
  process.exit(1);
}

const pageInventoryCommand =
  "git ls-tree -r --name-only " + commit + " -- apps/web/app";
const productPageFiles = gitAt(productRoot, [
  "ls-tree", "-r", "--name-only", commit, "--", "apps/web/app",
])
  .split("\n")
  .filter((path) => path.endsWith("/page.tsx"));
const routePatternFromPageFile = (path) => {
  const segments = path
    .replace(/^apps\/web\/app\/?/, "")
    .replace(/(?:^|\/)page\.tsx$/, "")
    .split("/")
    .filter((segment) => segment && !(segment.startsWith("(") && segment.endsWith(")")));
  return "/" + segments.join("/");
};
const routePatternRegExp = (pattern) => new RegExp(
  "^" + pattern
    .replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
    .replace(/\\\[\\\.\\\.\\\.[^\\\]]+\\\]/g, ".+")
    .replace(/\\\[[^\\\]]+\\\]/g, "[^/]+") + "$",
);
const routeInventory = productPageFiles.map((path) => {
  const routePattern = routePatternFromPageFile(path);
  const concreteMeasurements = MEASURED_ROUTES.filter((route) =>
    routePatternRegExp(routePattern).test(route));
  return {
    path,
    routePattern,
    dynamic: routePattern.includes("["),
    concreteMeasurements,
    measuredContexts: concreteMeasurements.length > 0 ? CONTEXTS.map((context) => context.id) : [],
  };
});
const GUEST_OUTCOME_ROUTES = routeInventory
  .filter((page) => !page.dynamic && page.concreteMeasurements.length === 0)
  .map((page) => page.routePattern);
const STYLE_AXES = [
  "display", "position", "top", "right", "bottom", "left", "zIndex",
  "boxSizing", "width", "height", "minWidth", "minHeight", "maxWidth", "maxHeight",
  "flexDirection", "flexGrow", "flexShrink", "flexBasis", "alignSelf",
  "alignItems", "justifyContent",
  "gap", "rowGap", "columnGap",
  "marginTop", "marginRight", "marginBottom", "marginLeft",
  "paddingTop", "paddingRight", "paddingBottom", "paddingLeft",
  "borderTopLeftRadius", "borderTopRightRadius", "borderBottomRightRadius",
  "borderBottomLeftRadius",
  "borderTopWidth", "borderRightWidth", "borderBottomWidth", "borderLeftWidth",
  "borderTopColor", "borderRightColor", "borderBottomColor", "borderLeftColor",
  "borderTopStyle", "borderRightStyle", "borderBottomStyle", "borderLeftStyle",
  "backgroundColor", "backgroundImage", "backgroundRepeat", "backgroundSize",
  "backgroundPosition", "color", "opacity", "boxShadow", "filter", "backdropFilter",
  "transform", "transformOrigin", "mixBlendMode", "isolation",
  "overflow", "overflowX", "overflowY", "aspectRatio", "objectFit", "objectPosition",
  "maskImage", "maskRepeat", "maskPosition", "maskSize", "clipPath",
  "fill", "stroke", "strokeWidth", "strokeLinecap", "strokeLinejoin",
  "fontFamily", "fontSize", "fontWeight", "lineHeight", "letterSpacing", "textAlign",
  "whiteSpace",
];
const PRICING_STYLE_AXES = [...new Set([
  ...STYLE_AXES,
  "flexWrap", "gridTemplateColumns", "gridTemplateRows", "gridAutoFlow",
  "outlineWidth", "outlineStyle", "outlineColor", "outlineOffset",
  "strokeDasharray", "strokeDashoffset", "textDecorationLine", "textTransform",
])];
const source = (path) => gitAt(productRoot, ["show", commit + ":" + path]);
const sourceLine = (path, line) => source(path).split("\n")[line - 1] ?? "";
const hashProductAsset = (path) => {
  const bytes = gitAt(productRoot, ["show", commit + ":" + path], null);
  return {
    path,
    sha256: createHash("sha256").update(bytes).digest("hex"),
    command: "git show " + commit + ":" + path,
  };
};

const nextRoot = resolve(productBuildRoot, "apps/web/.next");
const standaloneRoot = resolve(nextRoot, "standalone/apps/web");
const serverPath = resolve(standaloneRoot, "server.js");
const requiredFilesPath = resolve(nextRoot, "required-server-files.json");
const standaloneRequiredFilesPath = resolve(standaloneRoot, ".next/required-server-files.json");
const buildIdPath = resolve(nextRoot, "BUILD_ID");
const standaloneBuildIdPath = resolve(standaloneRoot, ".next/BUILD_ID");
for (const required of [
  serverPath,
  requiredFilesPath,
  standaloneRequiredFilesPath,
  buildIdPath,
  standaloneBuildIdPath,
  resolve(standaloneRoot, ".next/static"),
  resolve(standaloneRoot, "public"),
]) {
  if (!existsSync(required)) cannotMeasure("standalone 제품 빌드 산출물이 없습니다: " + required);
}

const requiredFilesBytes = readFileSync(requiredFilesPath);
const standaloneRequiredFilesBytes = readFileSync(standaloneRequiredFilesPath);
const requiredFiles = JSON.parse(requiredFilesBytes.toString("utf8"));
const standaloneRequiredFiles = JSON.parse(standaloneRequiredFilesBytes.toString("utf8"));
const buildRelease = requiredFiles.config?.env?._sentryRelease;
const standaloneRelease = standaloneRequiredFiles.config?.env?._sentryRelease;
if (buildRelease !== commit || standaloneRelease !== commit) {
  cannotMeasure(
    "빌드 영수증의 release commit이 고정 커밋과 다릅니다: build=" + buildRelease +
      " standalone=" + standaloneRelease + " expected=" + commit,
  );
}
const buildId = readFileSync(buildIdPath, "utf8").trim();
const standaloneBuildId = readFileSync(standaloneBuildIdPath, "utf8").trim();
if (!buildId || buildId !== standaloneBuildId) {
  cannotMeasure("원본과 standalone의 BUILD_ID가 다릅니다: " + buildId + " != " + standaloneBuildId);
}

// clean 상태는 측정 시점의 checkout만 증명한다. 오래되거나 다른 작업 트리에서 복사한 .next도
// 막으려면, 장면을 구성하는 소스가 build sourcemap에 고정 커밋의 원문 그대로 들어갔는지 본다.
// **데모 스냅숏 둘은 제품에 없다.** `EmptyProjectDemoPad` · `StaticHighlightDemo` 는 제품
// `8802565e`(랜딩 개편)에서 삭제됐고, 그것이 장면 축이 잴 것을 잃은 원인이다. 지문은
// 「이 .next 가 이 커밋의 소스로 구워졌나」를 보는 것이라 **살아 있는 파일이면 목적을
// 달성한다** — 죽은 둘을 걷고 셋으로 줄인다. `node-canvas-v2` 경로는 캔버스 개명을 따라간다.
const BUILD_SOURCE_PATHS = [
  "apps/web/app/HomePageClient.tsx",
  "apps/web/components/scenes/highlightSceneStyles.ts",
  "apps/web/components/scenes/create/node-canvas-v2/components/NodePromptGenerateButton.tsx",
];
const buildSourceBySuffix = new Map(
  BUILD_SOURCE_PATHS.map((path) => ["./" + path.slice("apps/web/".length), {
    path,
    expected: source(path),
    matched: false,
  }]),
);
const sourceMapPaths = [];
const collectSourceMaps = (directory) => {
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const absolute = resolve(directory, entry.name);
    if (entry.isDirectory()) collectSourceMaps(absolute);
    else if (entry.isFile() && entry.name.endsWith(".map")) sourceMapPaths.push(absolute);
  }
};
collectSourceMaps(resolve(nextRoot, "server"));
for (const mapPath of sourceMapPaths) {
  let map;
  try {
    map = JSON.parse(readFileSync(mapPath, "utf8"));
  } catch {
    continue;
  }
  for (let index = 0; index < (map.sources ?? []).length; index += 1) {
    const match = [...buildSourceBySuffix.entries()].find(([suffix]) => map.sources[index].endsWith(suffix));
    if (!match || typeof map.sourcesContent?.[index] !== "string") continue;
    const proof = match[1];
    if (map.sourcesContent[index] !== proof.expected) {
      cannotMeasure("빌드 sourcemap의 소스가 고정 커밋과 다릅니다: " + proof.path);
    }
    proof.matched = true;
  }
}
// **지문의 전제가 제품에서 죽었다(2026-09-10).** 이 검사는 「이 .next 가 다른 트리에서
// 복사된 것이 아님」을 sourcemap 원문으로 봤다. 그런데 제품 `61be8649`(소스맵 업로드를 배포
// 빌드로 한정)이후 로컬 빌드는 **페이지 sourcemap 을 아예 내지 않는다** — 실측: 앵커
// 91e5ea2a 의 `next build --webpack` 산출에서 `.next/server/**/*.map` 은 3개(edge·middleware)
// 뿐이고 `.next/static/**/*.map` 은 0개다. 그러면 이 검사는 어떤 빌드로도 만족될 수 없고,
// 「환경이 없다」로 영구 UNAVAILABLE 이 된다 — 이 저장소가 이미 두 번 겪은 「영구 빨강」이다.
//
// **그래서 두 경우를 가른다.**
//   맵이 있는데 원문이 다르다  → 그대로 하드 실패(위 루프). 이것이 진짜 낡음이다.
//   맵 자체가 없다            → 지문을 못 뜬다고 기록하고 넘어간다. 대신 같은 주장을
//                              **더 강한 근거**가 이미 하고 있다 — 위에서 확인한
//                              `required-server-files.config.env._sentryRelease === productCommit`.
//                              그 값은 빌드 시점의 git 이 박은 것이라 복사한 .next 로는
//                              고정 커밋을 사칭할 수 없다.
// 맵이 다시 나오면(배포 빌드·`productionBrowserSourceMaps`) 지문은 저절로 되살아난다.
const pageSourceMapCount = sourceMapPaths.filter(
  (mapPath) => !/\/(edge-|middleware)/.test(mapPath),
).length;
const unmatched = [...buildSourceBySuffix.values()].filter((proof) => !proof.matched);
if (unmatched.length > 0 && pageSourceMapCount > 0) {
  cannotMeasure("빌드 sourcemap에서 고정 소스 근거를 찾지 못했습니다: " + unmatched[0].path);
}
const fingerprintTaken = unmatched.length === 0;
if (!fingerprintTaken) {
  console.log(
    "[product-scenes] sourcemap 지문 없음 — 이 빌드는 페이지 sourcemap 을 내지 않는다" +
      "(제품 61be8649). 대신 _sentryRelease === " + buildRelease.slice(0, 8) + " 로 커밋을 고정했다.",
  );
}

const buildEvidence = {
  releaseCommit: buildRelease,
  sourcemapFingerprint: fingerprintTaken ? "taken" : "unavailable(no page sourcemaps)",
  $verified:
    "clean checkout HEAD와 두 required-server-files release가 productCommit이고, 원본·standalone BUILD_ID가 같음을 실행 시 확인했다. 장면 구성 소스의 sourcemap 원문 대조는 페이지 sourcemap 이 있을 때만 수행한다 — 없으면 `sourcemapFingerprint` 가 unavailable 이고, 커밋 고정은 _sentryRelease 가 진다. BUILD_ID와 빌드 파일 해시는 빌드 경로·실행마다 달라질 수 있어 생성물에는 넣지 않는다.",
  sourceInputs: [...buildSourceBySuffix.values()].map((proof) => ({
    path: proof.path,
    sha256: createHash("sha256").update(proof.expected).digest("hex"),
  })),
};

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
  if (!port) throw new Error("[product-scenes] 로컬 서버 포트를 예약하지 못했습니다.");
  return port;
};

const startPinnedProductServer = async () => {
  const port = await reservePort();
  const url = "http://127.0.0.1:" + port;
  const child = spawn(process.execPath, [serverPath], {
    cwd: standaloneRoot,
    env: {
      ...process.env,
      HOSTNAME: "127.0.0.1",
      PORT: String(port),
    },
    stdio: ["ignore", "pipe", "pipe"],
  });
  let output = "";
  let spawnError = null;
  const append = (chunk) => {
    output = (output + chunk.toString()).slice(-32 * 1024);
  };
  child.stdout.on("data", append);
  child.stderr.on("data", append);
  child.once("error", (error) => { spawnError = error; });
  const exited = new Promise((resolveExit) => child.once("exit", resolveExit));

  let ready = false;
  for (let attempt = 0; attempt < 160; attempt += 1) {
    if (spawnError || child.exitCode !== null) break;
    try {
      const response = await fetch(url, { redirect: "manual" });
      if (response.status >= 200 && response.status < 500) {
        ready = true;
        break;
      }
    } catch {
      // 서버가 listen하기 전의 연결 거절은 정상적인 준비 과정이다.
    }
    await delay(250);
  }
  if (!ready) {
    if (child.exitCode === null) child.kill("SIGTERM");
    await Promise.race([exited, delay(3_000)]);
    throw new Error(
      "[product-scenes] 고정 standalone 서버가 준비되지 않았습니다." +
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

const pinnedServer = await startPinnedProductServer();
let browser = null;
const rendered = {};
let landingNotMeasured = null;
const pageScreens = {};
const guestOutcomes = {};
try {
  browser = await chromium.launch({ headless: true });
  // 장면 축 — 살아 있는 표본이 있을 때만 돈다. 없으면 `rendered` 가 비고 payload 의
  // `scenes.notMeasured` 가 사유를 든다. route 축은 아래에서 무조건 돈다.
  for (const contextSpec of (SCENE_AXIS_SKIP ? [] : CONTEXTS)) {
    const context = await browser.newContext({
      viewport: { width: contextSpec.width, height: contextSpec.height },
      colorScheme: "dark",
      locale: "ko-KR",
      extraHTTPHeaders: { "Accept-Language": "ko-KR,ko;q=0.9" },
    });
    try {
      const page = await context.newPage();
      await page.goto(pinnedServer.url, { waitUntil: "domcontentloaded" });
      if (new URL(page.url()).origin !== pinnedServer.url) {
        throw new Error("[product-scenes] 고정 standalone 서버 밖으로 리다이렉트됐습니다: " + page.url());
      }
      await page.waitForFunction(() =>
        document.documentElement.dataset.theme === "dark" &&
        document.documentElement.lang.toLowerCase().startsWith("ko"),
      );
      await page.evaluate(() => new Promise((resolveFrame) =>
        requestAnimationFrame(() => requestAnimationFrame(resolveFrame)),
      ));
      await page.waitForSelector('#highlight section[aria-label="하이라이트"]');
      await page.evaluate(() => {
        let node = document.querySelector('#highlight section[aria-label="하이라이트"]');
        for (let depth = 0; depth < 6; depth += 1) node = node?.parentElement ?? null;
        node?.scrollIntoView({ block: "center" });
      });
      await delay(100);
      await page.waitForFunction(() => {
        const card = document.querySelector('#highlight section[aria-label="하이라이트"]');
        let shell = card;
        for (let depth = 0; depth < 6; depth += 1) shell = shell?.parentElement ?? null;
        return card?.children.length >= 2 && document.querySelector("#highlight")?.contains(shell);
      }, undefined, { timeout: 15_000 });
      await page.evaluate(async () => {
        await document.fonts.ready;
        const images = [...document.querySelectorAll("#highlight img")];
        await Promise.all(images.map(async (image) => {
          if (!image.complete) {
            await new Promise((resolveImage) => {
              const timeout = window.setTimeout(resolveImage, 5_000);
              const done = () => {
                window.clearTimeout(timeout);
                resolveImage();
              };
              image.addEventListener("load", done, { once: true });
              image.addEventListener("error", done, { once: true });
            });
          }
          if (typeof image.decode === "function") {
            await Promise.race([
              image.decode().catch(() => {}),
              new Promise((resolveDecode) => window.setTimeout(resolveDecode, 5_000)),
            ]);
          }
        }));
      });
      await page.waitForSelector('#highlight section[aria-label="하이라이트"]');
      const result = await page.evaluate(
        ({ declared, axes }) => {
        for (const animation of document.getAnimations()) {
          try { animation.finish(); } catch { animation.currentTime = 0; }
        }

        const highlightSection = document.querySelector("#highlight");
        const card = highlightSection?.querySelector('section[aria-label="하이라이트"]');
        if (!card) throw new Error("하이라이트 업로드 카드를 찾지 못했습니다.");
        const stage = card.parentElement;
        const sceneFit = stage?.parentElement;
        const sceneHost = sceneFit?.parentElement;
        const windowBody = sceneHost?.parentElement;
        const windowFrame = windowBody?.parentElement;
        const pad = windowFrame?.parentElement;
        if (!stage || !sceneFit || !sceneHost || !windowBody || !windowFrame || !pad) {
          throw new Error("StaticHighlightDemo 외부 셸을 찾지 못했습니다.");
        }
        if (!highlightSection.contains(pad)) {
          throw new Error("StaticHighlightDemo 패드가 #highlight 밖에 있습니다.");
        }
        const titlebar = windowFrame.children[0];
        const dots = titlebar?.children[0];
        const hero = stage.children[0];
        const drop = card.children[0];
        const actions = card.children[1];
        const themeRow = actions.children[0];
        const themeTrigger = themeRow.firstElementChild;
        const generateCol = actions.children[1];
        const generateRoot = generateCol.querySelector("button");
        const generateContent = generateRoot?.children[1];
        const registry = {
          PAD: pad,
          SR_ONLY: pad.children[0],
          WINDOW: windowFrame,
          TITLEBAR: titlebar,
          DOTS: dots,
          TITLEBAR_DOT_1: dots?.children[0],
          TITLEBAR_DOT_2: dots?.children[1],
          TITLEBAR_DOT_3: dots?.children[2],
          WINDOW_TITLE: titlebar.children[1],
          WINDOW_BODY: windowBody,
          SCENE_HOST: sceneHost,
          SCENE_FIT: sceneFit,
          STAGE: stage,
          emptyHero: hero,
          emptyHeroWordmark: hero.querySelector("img"),
          emptyHeroTagline: hero.querySelector("p"),
          uploadCard: card,
          uploadDropZone: drop,
          uploadGlyphMask: drop.children[0],
          uploadPrompt: drop.children[1],
          uploadCardActions: actions,
          themeRow,
          themeDropdownTrigger: themeTrigger,
          themeDropdownLabel: themeTrigger?.children[0],
          themeDropdownChevron: themeTrigger?.children[1],
          themeDropdownChevronPath: themeTrigger?.children[1]?.querySelector("path"),
          generateCol,
          ROOT: generateRoot,
          OVERLAY_STROKE: generateRoot?.children[0],
          CONTENT: generateContent,
          ICON: generateContent?.children[0],
          ICON_PATH: generateContent?.children[0]?.querySelector("path"),
        };

        const actual = Object.keys(registry).sort();
        const expected = declared.map((node) => node.part).sort();
        if (JSON.stringify(actual) !== JSON.stringify(expected)) {
          throw new Error(
            "표본과 런타임 part가 다릅니다. expected=" + expected.join(",") +
              " actual=" + actual.join(","),
          );
        }
        for (const [part, element] of Object.entries(registry)) {
          if (!(element instanceof Element)) throw new Error(part + " 노드가 없습니다.");
        }
        if (new Set(Object.values(registry)).size !== actual.length) {
          throw new Error("둘 이상의 part가 같은 런타임 노드를 가리킵니다.");
        }

        const normalizedText = (element) => {
          const raw = element instanceof HTMLElement ? element.innerText : (element.textContent ?? "");
          return raw.replace(/\r\n?/g, "\n").split("\n").map((line) => line.trim()).join("\n").trim();
        };
        for (const declaration of declared) {
          const element = registry[declaration.part];
          const actualTag = element.tagName.toLowerCase();
          if (actualTag !== declaration.tag) {
            throw new Error(
              declaration.part + " tag 불일치: " + actualTag + " != " + declaration.tag,
            );
          }
          if (declaration.parent && element.parentElement !== registry[declaration.parent]) {
            throw new Error(
              declaration.part + " 부모 불일치: expected=" + declaration.parent,
            );
          }
          if (Object.hasOwn(declaration, "text")) {
            const actualText = normalizedText(element);
            if (actualText !== declaration.text) {
              throw new Error(
                declaration.part + " text 불일치: " + JSON.stringify(actualText) +
                  " != " + JSON.stringify(declaration.text),
              );
            }
          }
        }

        const stageRect = stage.getBoundingClientRect();
        const sceneScale = Number.parseFloat(getComputedStyle(sceneFit).getPropertyValue("--scene-scale"));
        if (!Number.isFinite(sceneScale) || sceneScale <= 0) throw new Error("scene-scale을 읽지 못했습니다.");
        const nodes = {};
        const declarationByPart = Object.fromEntries(declared.map((node) => [node.part, node]));
        for (const [part, element] of Object.entries(registry)) {
          const rect = element.getBoundingClientRect();
          const parentRect = element.parentElement?.getBoundingClientRect();
          const style = getComputedStyle(element);
          const values = {};
          for (const axis of axes) {
            let value = style[axis];
            if (typeof value === "string") value = value.replaceAll(location.origin, "");
            values[axis] = value;
          }
          for (const side of ["Top", "Right", "Bottom", "Left"]) {
            if (values["border" + side + "Width"] === "0px" || values["border" + side + "Style"] === "none") {
              values["border" + side + "Color"] = "rgba(0, 0, 0, 0)";
            }
          }
          if (element instanceof HTMLImageElement) {
            values.color = "rgba(0, 0, 0, 0)";
          }
          const inScene = element === stage || stage.contains(element);
          nodes[part] = {
            tag: element.tagName.toLowerCase(),
            parentPart: declarationByPart[part].parent,
            text: normalizedText(element),
            parentRect: parentRect
              ? {
                  x: Math.round((rect.x - parentRect.x) * 10000) / 10000,
                  y: Math.round((rect.y - parentRect.y) * 10000) / 10000,
                  width: Math.round(rect.width * 10000) / 10000,
                  height: Math.round(rect.height * 10000) / 10000,
                }
              : null,
            nativeSceneRect: inScene
              ? {
                  x: Math.round(((rect.x - stageRect.x) / sceneScale) * 10000) / 10000,
                  y: Math.round(((rect.y - stageRect.y) / sceneScale) * 10000) / 10000,
                  width: Math.round((rect.width / sceneScale) * 10000) / 10000,
                  height: Math.round((rect.height / sceneScale) * 10000) / 10000,
                }
              : null,
            values,
          };
        }
        const inlineSvg = {};
        for (const part of ["themeDropdownChevron", "ICON"]) {
          const svg = registry[part];
          if (!(svg instanceof SVGSVGElement)) throw new Error(part + "가 SVG가 아닙니다.");
          const geometry = [...svg.querySelectorAll("path,circle,ellipse,line,polyline,polygon,rect")]
            .map((element) => ({
              tag: element.tagName.toLowerCase(),
              attributes: Object.fromEntries(
                element.getAttributeNames().sort().map((name) => [name, element.getAttribute(name)]),
              ),
            }));
          if (geometry.length === 0) throw new Error(part + "의 라이브 SVG geometry가 없습니다.");
          inlineSvg[part] = {
            viewBox: svg.getAttribute("viewBox"),
            width: svg.getAttribute("width"),
            height: svg.getAttribute("height"),
            geometry,
          };
        }
        return {
          viewport: { width: innerWidth, height: innerHeight },
          locale: document.documentElement.lang,
          theme: document.documentElement.dataset.theme,
          sceneScale: Math.round(sceneScale * 10000) / 10000,
          causalNativeCanvas: {
            width:
              Math.round((sceneHost.getBoundingClientRect().width / sceneScale) * 10000) / 10000,
            height:
              Math.round((sceneHost.getBoundingClientRect().height / sceneScale) * 10000) / 10000,
          },
          inlineSvg,
          nodes,
        };
      },
        { declared: declaredNodes, axes: STYLE_AXES },
      );
      if (result.theme !== "dark" || !result.locale.toLowerCase().startsWith("ko")) {
        throw new Error(
          "[product-scenes] 렌더 문맥이 dark/ko가 아닙니다: theme=" + result.theme +
            " locale=" + result.locale,
        );
      }
      rendered[contextSpec.id] = result;
    } finally {
      // Chromium 1234의 headless shell은 모든 네트워크 요청이 끝난 뒤에도
      // BrowserContext.close()가 멈추는 경우가 있다. 이 측정기는 context를 두 개만 만들고
      // 바깥 finally에서 browser.close()로 한 번에 회수하므로 여기서 개별 close를 기다리지 않는다.
      // 개별 close hang이 제품 게이트 전체를 영원히 붙잡는 것보다 browser 수명에 맡기는 편이
      // 결정적이며, 두 context 사이에는 상태 공유도 없다.
    }
  }

  for (const contextSpec of CONTEXTS) {
    const context = await browser.newContext({
      viewport: { width: contextSpec.width, height: contextSpec.height },
      colorScheme: "light",
      locale: "en-US",
      extraHTTPHeaders: { "Accept-Language": "en-US,en;q=0.9" },
    });
    const page = await context.newPage();
    pageScreens[contextSpec.id] = {};
    guestOutcomes[contextSpec.id] = {};

    const openPinnedRoute = async (route) => {
      await page.goto(pinnedServer.url + route, { waitUntil: "domcontentloaded" });
      if (new URL(page.url()).origin !== pinnedServer.url) {
        throw new Error(
          "[product-scenes] 고정 standalone 서버 밖으로 리다이렉트됐습니다: " + page.url(),
        );
      }
      await page.waitForFunction(() =>
        document.documentElement.dataset.theme === "light" &&
        document.documentElement.lang.toLowerCase().startsWith("en"),
      );
      await page.evaluate(() => new Promise((resolveFrame) =>
        requestAnimationFrame(() => requestAnimationFrame(resolveFrame)),
      ));
      await page.evaluate(async () => {
        await document.fonts.ready;
      });
    };

    const measureLanding = async () => {
      await openPinnedRoute("/");
      await page.waitForSelector("#capabilities article");
      if (contextSpec.width >= 720) {
        await page.evaluate(() => {
          const article = document.querySelector("#capabilities article");
          if (!article) throw new Error("NodeCanvas article이 없습니다.");
          const rect = article.getBoundingClientRect();
          window.scrollTo(0, rect.top + window.scrollY - 92);
        });
        await page.waitForFunction(() => {
          const article = document.querySelector("#capabilities article");
          return article && article.querySelectorAll("*").length > 100 &&
            article.getBoundingClientRect().height > 700;
        }, undefined, { timeout: 15_000 });
      }

      let stableHeight = null;
      let stableCount = 0;
      for (let attempt = 0; attempt < 24 && stableCount < 3; attempt += 1) {
        const nextHeight = await page.evaluate(() => document.documentElement.scrollHeight);
        if (nextHeight === stableHeight) stableCount += 1;
        else {
          stableHeight = nextHeight;
          stableCount = 0;
        }
        await delay(100);
      }
      if (stableCount < 3) {
        throw new Error("[product-scenes] 랜딩 페이지 높이가 안정화되지 않았습니다.");
      }

      return page.evaluate(() => {
        const round = (value) => Math.round(value * 10000) / 10000;
        const rect = (element, relativeTo = null) => {
          if (!(element instanceof Element)) throw new Error("측정할 랜딩 노드가 없습니다.");
          const bounds = element.getBoundingClientRect();
          const base = relativeTo?.getBoundingClientRect();
          return {
            x: round(bounds.x - (base?.x ?? 0)),
            y: round(bounds.y - (base?.y ?? 0) + (base ? 0 : window.scrollY)),
            width: round(bounds.width),
            height: round(bounds.height),
          };
        };
        const main = document.querySelector("main[data-page-root]");
        if (!(main instanceof HTMLElement)) throw new Error("랜딩 main이 없습니다.");
        const content = [...main.children].find((element) =>
          element instanceof HTMLDivElement && element.classList.contains("z-2"));
        if (!(content instanceof HTMLDivElement)) throw new Error("랜딩 content layer가 없습니다.");
        const sections = [...content.children];
        if (sections.length !== 8) {
          throw new Error("랜딩 상위 섹션 수가 8이 아닙니다: " + sections.length);
        }
        const wordmarkLabel = [...main.querySelectorAll("span")].find((element) =>
          element.textContent === "Klipse" && element.getBoundingClientRect().width === 1);
        const wordmark = wordmarkLabel?.parentElement;
        const wordmarkSurface = wordmark?.firstElementChild;
        const nodeCanvasArticle = main.querySelector("#capabilities article");
        const footer = main.querySelector(":scope > footer");
        if (!wordmark || !wordmarkSurface || !nodeCanvasArticle || !footer) {
          throw new Error("랜딩 핵심 노드가 없습니다.");
        }
        const surfaceStyle = getComputedStyle(wordmarkSurface);
        return {
          route: "/",
          viewport: { width: innerWidth, height: innerHeight },
          locale: document.documentElement.lang,
          theme: document.documentElement.dataset.theme,
          documentHeight: round(document.documentElement.scrollHeight),
          main: rect(main),
          content: rect(content),
          sections: sections.map((section, index) => ({
            index,
            id: section.id || null,
            ...rect(section, content),
          })),
          heroWordmark: {
            ...rect(wordmark),
            maskImage: surfaceStyle.maskImage.replaceAll(location.origin, ""),
            webkitMaskImage: surfaceStyle.webkitMaskImage.replaceAll(location.origin, ""),
            backgroundColor: surfaceStyle.backgroundColor,
          },
          nodeCanvasArticle: {
            ...rect(nodeCanvasArticle),
          },
          footer: rect(footer),
        };
      });
    };

    const measureLegal = async (route) => {
      await openPinnedRoute(route);
      await page.waitForSelector("h1");
      return page.evaluate((measuredRoute) => {
        const round = (value) => Math.round(value * 10000) / 10000;
        const rect = (element, relativeTo = null) => {
          if (!(element instanceof Element)) throw new Error("측정할 법적고지 노드가 없습니다.");
          const bounds = element.getBoundingClientRect();
          const base = relativeTo?.getBoundingClientRect();
          return {
            x: round(bounds.x - (base?.x ?? 0)),
            y: round(bounds.y - (base?.y ?? 0) + (base ? 0 : window.scrollY)),
            width: round(bounds.width),
            height: round(bounds.height),
          };
        };
        const heading = document.querySelector("h1");
        const inner = heading?.parentElement;
        const root = inner?.parentElement;
        const backButton = inner?.querySelector("button");
        const logo = inner?.querySelector('a[href="/"]');
        if (!heading || !inner || !root || !backButton || !logo) {
          throw new Error("법적고지 핵심 노드가 없습니다: " + measuredRoute);
        }
        return {
          route: measuredRoute,
          viewport: { width: innerWidth, height: innerHeight },
          locale: document.documentElement.lang,
          theme: document.documentElement.dataset.theme,
          documentHeight: round(document.documentElement.scrollHeight),
          root: rect(root),
          inner: rect(inner, root),
          backButton: rect(backButton, root),
          logo: rect(logo, root),
          heading: { text: heading.textContent, ...rect(heading, root) },
        };
      }, route);
    };

    const measurePricing = async () => {
      await openPinnedRoute("/pricing");
      await page.waitForSelector("#pricing article");
      await page.waitForSelector('nav[aria-label="Global navigation"]');
      await page.waitForSelector("#pricing-faq");
      await page.waitForSelector("footer");
      await page.locator("footer").scrollIntoViewIfNeeded();
      let stableHeight = null;
      let stableCount = 0;
      for (let attempt = 0; attempt < 24 && stableCount < 3; attempt += 1) {
        const nextHeight = await page.evaluate(() => document.documentElement.scrollHeight);
        if (nextHeight === stableHeight) stableCount += 1;
        else {
          stableHeight = nextHeight;
          stableCount = 0;
        }
        await delay(100);
      }
      if (stableCount < 3) {
        throw new Error("[product-scenes] 가격 페이지 높이가 안정화되지 않았습니다.");
      }
      await page.evaluate(() => window.scrollTo(0, 0));
      await page.evaluate(() => new Promise((resolveFrame) =>
        requestAnimationFrame(() => requestAnimationFrame(resolveFrame)),
      ));

      const measured = await page.evaluate((axes) => {
        const round = (value) => Math.round(value * 10000) / 10000;
        const rect = (element, relativeTo = null) => {
          if (!(element instanceof Element)) throw new Error("측정할 가격 페이지 노드가 없습니다.");
          const bounds = element.getBoundingClientRect();
          const base = relativeTo?.getBoundingClientRect();
          return {
            x: round(bounds.x - (base?.x ?? 0)),
            y: round(bounds.y - (base?.y ?? 0) + (base ? 0 : window.scrollY)),
            width: round(bounds.width),
            height: round(bounds.height),
          };
        };
        const ownText = (element) => [...element.childNodes]
          .filter((node) => node.nodeType === Node.TEXT_NODE)
          .map((node) => node.textContent ?? "")
          .join(" ")
          .replace(/\s+/g, " ")
          .trim();
        const normalizeAssetUrl = (value) => {
          if (!value) return null;
          try {
            const url = new URL(value, location.origin);
            return url.origin === location.origin ? url.pathname + url.search : url.href;
          } catch {
            return value;
          }
        };
        const vectorAttributes = (element) => {
          if (!(element instanceof SVGElement)) return null;
          const attributes = {};
          for (const name of [
            "viewBox", "d", "points", "x", "y", "x1", "y1", "x2", "y2",
            "cx", "cy", "r", "rx", "ry", "fill", "stroke", "stroke-width",
            "stroke-linecap", "stroke-linejoin", "transform",
          ]) {
            const value = element.getAttribute(name);
            if (value !== null) attributes[name] = value;
          }
          return Object.keys(attributes).length > 0 ? attributes : null;
        };
        const ownTextLines = (element) => {
          const lines = [];
          const textNodes = [...element.childNodes].filter((node) =>
            node.nodeType === Node.TEXT_NODE && (node.textContent ?? "").trim());
          for (const textNode of textNodes) {
            const source = textNode.textContent ?? "";
            let active = null;
            for (let index = 0; index < source.length; index += 1) {
              const range = document.createRange();
              range.setStart(textNode, index);
              range.setEnd(textNode, index + 1);
              const bounds = range.getBoundingClientRect();
              range.detach();
              if (!bounds.width && !bounds.height) continue;
              const top = round(bounds.top + window.scrollY);
              const bottom = round(bounds.bottom + window.scrollY);
              if (!active || Math.abs(active.top - top) > 0.5) {
                active = {
                  text: source[index],
                  x: round(bounds.left + window.scrollX),
                  y: top,
                  width: round(bounds.width),
                  height: round(bounds.height),
                  top,
                  right: round(bounds.right + window.scrollX),
                  bottom,
                };
                lines.push(active);
              } else {
                active.text += source[index];
                active.x = Math.min(active.x, round(bounds.left + window.scrollX));
                active.right = Math.max(active.right, round(bounds.right + window.scrollX));
                active.bottom = Math.max(active.bottom, bottom);
                active.width = round(active.right - active.x);
                active.height = round(active.bottom - active.y);
              }
            }
          }
          return lines.map(({ top: _top, right: _right, bottom: _bottom, ...line }) => ({
            ...line,
            text: line.text.replace(/\s+/g, " ").trim(),
          })).filter((line) => line.text);
        };
        const snapshot = (element, path) => {
          const computed = getComputedStyle(element);
          const style = {};
          for (const axis of axes) {
            let value = computed[axis];
            if (typeof value === "string") value = value.replaceAll(location.origin, "");
            style[axis] = value;
          }
          if (style.transformOrigin) {
            style.transformOrigin = style.transformOrigin.replace(/\s+/g, " ").trim();
          }
          for (const side of ["Top", "Right", "Bottom", "Left"]) {
            if (style["border" + side + "Width"] === "0px" || style["border" + side + "Style"] === "none") {
              style["border" + side + "Color"] = "rgba(0, 0, 0, 0)";
            }
          }
          if (element instanceof HTMLImageElement) style.color = "rgba(0, 0, 0, 0)";
          return {
            path,
            tag: element.tagName.toLowerCase(),
            id: element.id || null,
            role: element.getAttribute("role"),
            ariaLabel: element.getAttribute("aria-label"),
            // 크기 출처 판정의 보조 신호이자 사람이 읽을 근거. SVG는 className이 SVGAnimatedString이라
            // JSON에서 `{}`가 되므로 반드시 getAttribute를 쓴다.
            classAttr: element.getAttribute("class"),
            ownText: ownText(element),
            ownTextLines: ownTextLines(element),
            href: element instanceof HTMLAnchorElement ? normalizeAssetUrl(element.href) : null,
            src: element instanceof HTMLImageElement ? normalizeAssetUrl(element.src) : null,
            alt: element instanceof HTMLImageElement ? element.alt : null,
            vector: vectorAttributes(element),
            rect: rect(element),
            style,
          };
        };
        const subtreeSnapshots = (root) => {
          const nodes = [];
          const visit = (element, path) => {
            nodes.push(snapshot(element, path));
            [...element.children].forEach((child, index) => visit(child, path + "." + index));
          };
          visit(root, "main");
          return nodes;
        };
        const main = document.querySelector("main[data-page-root]");
        const navigation = document.querySelector('nav[aria-label="Global navigation"]');
        const pricing = main?.querySelector("#pricing");
        const faq = main?.querySelector("#pricing-faq");
        const surface = pricing?.parentElement;
        const heading = pricing?.querySelector("h2");
        const footer = main?.querySelector(":scope > footer");
        const tierCards = pricing ? [...pricing.querySelectorAll("article")] : [];
        if (!main || !navigation || !surface || !pricing || !faq || !heading || !footer) {
          throw new Error(
            "가격 페이지 핵심 노드가 없습니다: " +
              JSON.stringify({
                main: Boolean(main), navigation: Boolean(navigation), surface: Boolean(surface),
                pricing: Boolean(pricing), faq: Boolean(faq), heading: Boolean(heading),
                footer: Boolean(footer),
              }),
          );
        }
        // **넷이 아니라 다섯이다(2026-09-10 실측).** 제품의 요금제가 Trial·Basic·Pro·Max 에서
        // **Trial·Lite·Plus·Pro·Ultra** 로 바뀌었다 — 장이 하나 늘고 이름 셋이 갈렸다.
        // 이 수를 하드코딩한 채 앵커가 286커밋 움직이는 동안 측정기는 던졌고, 그래서
        // migration/product.scenes.json 이 갱신되지 않았으며, 그것을 읽는
        // build-figma-product-pricing-page 는 **옛 요금제를 그린 Figma 보드를 계속 정본으로
        // 들고 있었다.** 수를 여기 다시 박는 대신 「제품이 말하는 수」와 대조한다면 더 좋겠지만,
        // 그 목록은 i18n 안이라 이 브라우저 문맥에서 읽을 방법이 없다 — 그래서 수는 남기고
        // **틀렸을 때 무엇을 고쳐야 하는지**를 진단문에 적는다.
        if (tierCards.length !== 5) {
          throw new Error(
            "가격 페이지 요금제 카드 수가 5가 아닙니다: " + tierCards.length +
              ". 제품이 플랜을 늘리거나 줄였다면 이 수와 " +
              "scripts/build-figma-product-pricing-page.mjs 의 planNames 를 함께 옮기세요 — " +
              "둘이 어긋나면 Figma 보드의 variant 이름이 엉뚱한 카드에 붙습니다.",
          );
        }
        const tree = subtreeSnapshots(main);
        if (tree.length > 2_000) throw new Error("가격 페이지 측정 노드가 2,000개를 넘었습니다: " + tree.length);
        return {
          route: "/pricing",
          viewport: { width: innerWidth, height: innerHeight },
          locale: document.documentElement.lang,
          theme: document.documentElement.dataset.theme,
          documentHeight: round(document.documentElement.scrollHeight),
          main: rect(main),
          navigation: rect(navigation, main),
          surface: rect(surface, main),
          pricing: rect(pricing, main),
          faq: rect(faq, main),
          heading: { text: heading.textContent, ...rect(heading, main) },
          tierCards: tierCards.map((card) => ({
            name: card.querySelector("h3")?.textContent ?? null,
            ...rect(card, main),
          })),
          footer: rect(footer, main),
          tree,
        };
      }, PRICING_STYLE_AXES);

      // **선언된 CSS 원문을 CDP로 덧붙인다.** `getComputedStyle`은 해결된 값을 주므로 `width:100%`와
      // `width:1920px`가 둘 다 `"1920px"`로 보인다 — 즉 "왜 그 크기인가"가 소실된다. Figma Auto Layout
      // (FILL/HUG/FIXED)을 정하려면 선언 원문이 필요하다. 트리 순회와 **같은 경로 스킴**을 쓰므로
      // path로 그대로 붙는다(스킴이 어긋나면 엉뚱한 노드에 붙으므로 개수를 검사한다).
      const { declared, nodeCount } = await captureDeclaredStyles(
        context,
        page,
        (node, attributes) => node.localName === "main" && attributes["data-page-root"] !== undefined,
        { rootPath: "main" },
      );
      if (nodeCount !== measured.tree.length) {
        throw new Error(
          "[product-scenes] 선언 스타일 노드 수가 측정 트리와 다릅니다: " +
            nodeCount + " != " + measured.tree.length,
        );
      }
      for (const node of measured.tree) {
        const entry = declared.get(node.path);
        // 선언이 하나도 없는 노드는 키를 만들지 않는다 — 생성물 크기를 아낀다.
        if (entry && Object.keys(entry).length > 0) node.declared = entry;
      }
      return measured;
    };

    const measureGenericPage = async (route) => {
      await openPinnedRoute(route);
      await page.waitForSelector("body");
      await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
      let stableHeight = null;
      let stableCount = 0;
      for (let attempt = 0; attempt < 24 && stableCount < 3; attempt += 1) {
        const nextHeight = await page.evaluate(() => document.documentElement.scrollHeight);
        if (nextHeight === stableHeight) stableCount += 1;
        else {
          stableHeight = nextHeight;
          stableCount = 0;
        }
        await delay(100);
      }
      if (stableCount < 3) {
        throw new Error("[product-scenes] 페이지 높이가 안정화되지 않았습니다: " + route);
      }
      await page.evaluate(() => window.scrollTo(0, 0));
      await page.evaluate(() => new Promise((resolveFrame) =>
        requestAnimationFrame(() => requestAnimationFrame(resolveFrame)),
      ));

      return page.evaluate(({ requestedRoute, axes }) => {
        const round = (value) => Math.round(value * 10000) / 10000;
        const rect = (element) => {
          if (!(element instanceof Element)) return null;
          const bounds = element.getBoundingClientRect();
          return {
            x: round(bounds.x + window.scrollX),
            y: round(bounds.y + window.scrollY),
            width: round(bounds.width),
            height: round(bounds.height),
          };
        };
        const visibleBodyChildren = [...document.body.children].filter((element) => {
          const bounds = element.getBoundingClientRect();
          return bounds.width >= innerWidth * 0.5 && bounds.height > 0;
        });
        const main = document.querySelector("main");
        const root = main ?? visibleBodyChildren[0] ?? null;
        const landmark = (selector) => [...document.querySelectorAll(selector)].map((element) => ({
          tag: element.tagName.toLowerCase(),
          ariaLabel: element.getAttribute("aria-label"),
          ...rect(element),
        }));
        const normalizeAssetUrl = (value) => {
          try {
            const url = new URL(value, location.origin);
            return url.origin === location.origin ? url.pathname + url.search : url.href;
          } catch {
            return value;
          }
        };
        const ownText = (element) => [...element.childNodes]
          .filter((node) => node.nodeType === Node.TEXT_NODE)
          .map((node) => node.textContent ?? "")
          .join(" ")
          .replace(/\s+/g, " ")
          .trim();
        const snapshot = (element) => {
          if (!(element instanceof Element)) return null;
          const computed = getComputedStyle(element);
          const style = {};
          for (const axis of axes) {
            let value = computed[axis];
            if (typeof value === "string") value = value.replaceAll(location.origin, "");
            style[axis] = value;
          }
          for (const side of ["Top", "Right", "Bottom", "Left"]) {
            if (style["border" + side + "Width"] === "0px" || style["border" + side + "Style"] === "none") {
              style["border" + side + "Color"] = "rgba(0, 0, 0, 0)";
            }
          }
          if (element instanceof HTMLImageElement) style.color = "rgba(0, 0, 0, 0)";
          return {
            tag: element.tagName.toLowerCase(),
            ownText: ownText(element),
            ariaLabel: element.getAttribute("aria-label"),
            rect: rect(element),
            style,
          };
        };
        const snapshots = (elements) => [...elements].map(snapshot).filter(Boolean);
        const subtreeSnapshots = (subtreeRoot) => {
          if (!(subtreeRoot instanceof Element)) return [];
          const pathFromRoot = (element) => {
            if (element === subtreeRoot) return ".";
            const path = [];
            let current = element;
            while (current && current !== subtreeRoot) {
              const parent = current.parentElement;
              if (!parent) break;
              path.unshift(String([...parent.children].indexOf(current)));
              current = parent;
            }
            return path.join(".");
          };
          return [subtreeRoot, ...subtreeRoot.querySelectorAll("*")].map((element) => ({
            path: pathFromRoot(element),
            ...snapshot(element),
          }));
        };
        const directChildContaining = (element, selector) => [...(element?.children ?? [])]
          .find((child) => child.matches(selector) || child.querySelector(selector));
        const docsRoot = requestedRoute.startsWith("/docs")
          ? document.querySelector("main[data-page-root]")
          : null;
        const docsShell = docsRoot
          ? [...docsRoot.children].find((child) =>
              getComputedStyle(child).display === "grid" && child.querySelector("aside") && child.querySelector("h1"))
          : null;
        const docsSidebar = docsShell?.querySelector(":scope > aside") ?? null;
        const docsContent = directChildContaining(docsShell, "article,h1");
        const docsArticle = docsContent?.querySelector("article") ?? null;
        const docsArticleMain = docsArticle?.querySelector(":scope > div") ?? null;
        const docsArticleAside = docsArticle?.querySelector(":scope > aside") ?? null;

        const authStatusRoutes = new Set([
          "/signup/check-email", "/signup/expired", "/signup/verified",
          "/reset-password", "/reset-password/new",
        ]);
        const findTwoPanelRoot = (anchor) => {
          let candidate = anchor?.parentElement ?? null;
          while (candidate && candidate !== document.body) {
            if (candidate.querySelector(":scope > aside") && directChildContaining(candidate, "h1")) {
              return candidate;
            }
            candidate = candidate.parentElement;
          }
          return null;
        };
        const authStatusRoot = authStatusRoutes.has(requestedRoute)
          ? findTwoPanelRoot(document.querySelector("h1"))
          : null;
        const authBrandPanel = authStatusRoot?.querySelector(":scope > aside") ?? null;
        const authFormPanel = authStatusRoot ? directChildContaining(authStatusRoot, "h1") : null;
        const authCard = authFormPanel ? directChildContaining(authFormPanel, "h1") : null;

        const authFormRoutes = new Set(["/login", "/signup", "/aws/signup"]);
        const authFormRoot = authFormRoutes.has(requestedRoute)
          ? findTwoPanelRoot(document.querySelector("h1"))
          : null;
        const authFormBrandPanel = authFormRoot?.querySelector(":scope > aside") ?? null;
        const authFormPagePanel = authFormRoot ? directChildContaining(authFormRoot, "h1") : null;
        const authFormCard = authFormPagePanel ? directChildContaining(authFormPagePanel, "h1") : null;

        let recoverRoot = null;
        const recoverForm = requestedRoute === "/recover" ? document.querySelector("form") : null;
        if (requestedRoute === "/recover") {
          let candidate = recoverForm?.parentElement ?? null;
          while (candidate?.parentElement && candidate.parentElement !== document.body) {
            candidate = candidate.parentElement;
          }
          recoverRoot = candidate;
        }
        const deletionRoot = requestedRoute === "/data-deletion-status"
          ? document.querySelector("main")
          : null;

        const marketingRoot = ["/blog", "/templates", "/templates/filter", "/inquiry"]
          .includes(requestedRoute)
          ? document.querySelector("main[data-page-root]")
          : null;
        const marketingSurface = marketingRoot
          ? [...marketingRoot.children].find((child) => child.querySelector("h1") && child.tagName !== "FOOTER")
          : null;

        const componentProbe = docsRoot
          ? {
              kind: "docs-shell",
              root: snapshot(docsRoot),
              shell: snapshot(docsShell),
              sidebar: snapshot(docsSidebar),
              content: snapshot(docsContent),
              article: snapshot(docsArticle),
              articleMain: snapshot(docsArticleMain),
              articleAside: snapshot(docsArticleAside),
              sidebarGroups: docsSidebar ? snapshots(docsSidebar.querySelectorAll(":scope nav > div")) : [],
              sidebarLinks: docsSidebar ? snapshots(docsSidebar.querySelectorAll("a")) : [],
              summary: snapshot(docsArticleMain?.querySelector('section[aria-label]')),
              summaryCards: docsArticleMain
                ? snapshots(docsArticleMain.querySelectorAll('section[aria-label] > div'))
                : [],
              articleSections: docsArticleMain
                ? snapshots(docsArticleMain.querySelectorAll(":scope > section"))
                : [],
              controls: docsRoot ? snapshots(docsRoot.querySelectorAll("a,button,input,summary")) : [],
            }
          : authStatusRoot
            ? {
                kind: "auth-status-card",
                root: snapshot(authStatusRoot),
                brandPanel: snapshot(authBrandPanel),
                formPanel: snapshot(authFormPanel),
                card: snapshot(authCard),
                heading: snapshot(authCard?.querySelector("h1")),
                form: snapshot(authCard?.querySelector("form")),
                controls: authCard ? snapshots(authCard.querySelectorAll("a,button,input")) : [],
                tree: subtreeSnapshots(authStatusRoot),
              }
            : authFormRoot
              ? {
                  kind: "auth-form-page",
                  root: snapshot(authFormRoot),
                  brandPanel: snapshot(authFormBrandPanel),
                  formPanel: snapshot(authFormPagePanel),
                  card: snapshot(authFormCard),
                  heading: snapshot(authFormCard?.querySelector("h1")),
                  form: snapshot(authFormCard?.querySelector("form")),
                  controls: authFormCard
                    ? snapshots(authFormCard.querySelectorAll("a,button,input,label"))
                    : [],
                  tree: subtreeSnapshots(authFormRoot),
                }
              : recoverRoot
                ? {
                    kind: "recover-form-page",
                    root: snapshot(recoverRoot),
                    card: snapshot(recoverForm?.parentElement),
                    form: snapshot(recoverForm),
                    controls: snapshots(recoverRoot.querySelectorAll("a,button,input,label")),
                    tree: subtreeSnapshots(recoverForm?.parentElement),
                  }
                : deletionRoot
                  ? {
                      kind: "data-deletion-status",
                      root: snapshot(deletionRoot),
                      heading: snapshot(deletionRoot.querySelector("h1")),
                      paragraphs: snapshots(deletionRoot.querySelectorAll("p")),
                      terms: snapshots(deletionRoot.querySelectorAll("dt,dd")),
                      tree: subtreeSnapshots(deletionRoot),
                    }
            : marketingRoot
              ? {
                  kind: "marketing-shell",
                  root: snapshot(marketingRoot),
                  surface: snapshot(marketingSurface),
                  footer: snapshot(marketingRoot.querySelector(":scope > footer")),
                  controls: snapshots(marketingRoot.querySelectorAll("a,button,input,textarea")),
                }
              : null;
        return {
          route: requestedRoute,
          finalPath: location.pathname,
          redirected: location.pathname !== requestedRoute,
          viewport: { width: innerWidth, height: innerHeight },
          locale: document.documentElement.lang,
          theme: document.documentElement.dataset.theme,
          documentHeight: round(document.documentElement.scrollHeight),
          body: rect(document.body),
          root: rect(root),
          landmarks: {
            header: landmark("header"),
            navigation: landmark("nav"),
            main: landmark("main"),
            aside: landmark("aside"),
            form: landmark("form"),
            footer: landmark("footer"),
          },
          headings: [...document.querySelectorAll("h1,h2")].map((heading) => ({
            level: Number(heading.tagName.slice(1)),
            text: heading.textContent?.trim() ?? "",
            ...rect(heading),
          })),
          images: [...document.querySelectorAll("img")].map((image) => ({
            src: normalizeAssetUrl(image.currentSrc || image.src),
            alt: image.alt,
            ...rect(image),
          })),
          componentProbe,
        };
      }, { requestedRoute: route, axes: STYLE_AXES });
    };

    const measureGuestOutcome = async (route) => {
      await page.goto(pinnedServer.url + route, { waitUntil: "domcontentloaded" });
      if (new URL(page.url()).origin !== pinnedServer.url) {
        throw new Error(
          "[product-scenes] guest route가 고정 standalone 서버 밖으로 이동했습니다: " + page.url(),
        );
      }
      await delay(1_500);
      let previous = null;
      let stableCount = 0;
      for (let attempt = 0; attempt < 30 && stableCount < 5; attempt += 1) {
        const fingerprint = await page.evaluate(() => JSON.stringify({
          path: location.pathname,
          locale: document.documentElement.lang,
          theme: document.documentElement.dataset.theme,
          height: document.documentElement.scrollHeight,
          textLength: document.body.textContent?.length ?? 0,
        }));
        if (fingerprint === previous) stableCount += 1;
        else {
          previous = fingerprint;
          stableCount = 0;
        }
        await delay(100);
      }
      if (stableCount < 5) {
        throw new Error("[product-scenes] guest route 결과가 안정화되지 않았습니다: " + route);
      }
      await page.evaluate(async () => {
        await document.fonts.ready;
      });
      return page.evaluate((requestedRoute) => ({
        route: requestedRoute,
        finalPath: location.pathname,
        redirected: location.pathname !== requestedRoute,
        viewport: { width: innerWidth, height: innerHeight },
        locale: document.documentElement.lang,
        theme: document.documentElement.dataset.theme,
        documentHeight: Math.round(document.documentElement.scrollHeight * 10000) / 10000,
        headings: [...document.querySelectorAll("h1,h2")].map((heading) => ({
          level: Number(heading.tagName.slice(1)),
          text: heading.textContent?.trim() ?? "",
        })),
      }), route);
    };

    // **랜딩 축은 자기 몫만 잃는다.** `measureLanding` 은 `#capabilities article` 과
    // 「상위 섹션 정확히 8개」를 하드코딩하는데, 그 섹션은 제품 `8802565e`(랜딩 개편)에서
    // 삭제됐다 — 장면 축이 잴 것을 잃은 것과 **같은 개편**이다. 그대로 두면 던져서
    // `/pricing` 을 포함한 나머지 21개 route 가 함께 죽고, 그러면 요금제 보드가 옛 제품
    // 문구를 계속 그린다(이 회차가 고치려던 바로 그 증상).
    //
    // 그래서 장면 축과 같은 규칙을 쓴다 — **죽은 자리는 사유를 남기고 비켜난다.**
    // 랜딩 측정을 되살리려면 지금 랜딩(Hero · OverviewSection · StepTiles · ModelCarousel ·
    // TemplateGrid · Testimonials · CreatorProgram · FAQ)의 모양으로 본문을 다시 써야 하고,
    // 그것은 「무엇을 증거로 삼을 것인가」라는 판정이라 이 회차의 몫이 아니다.
    try {
      pageScreens[contextSpec.id]["/"] = await measureLanding();
    } catch (error) {
      landingNotMeasured =
        "랜딩 측정 본문이 지금 랜딩과 맞지 않습니다(" + String(error?.message ?? error).slice(0, 120) +
        "). `#capabilities` 는 제품 8802565e 에서 삭제됐습니다 — 본문을 지금 랜딩의 모양으로 " +
        "다시 써야 되살아납니다. 나머지 route 는 그대로 쟀습니다.";
      console.log("[product-scenes] 랜딩 축 NOT_MEASURED — " + landingNotMeasured);
    }
    pageScreens[contextSpec.id]["/pricing"] = await measurePricing();
    for (const route of PAGE_ROUTES.slice(2)) {
      pageScreens[contextSpec.id][route] = await measureLegal(route);
    }
    for (const route of GENERIC_PAGE_ROUTES) {
      pageScreens[contextSpec.id][route] = await measureGenericPage(route);
    }
    for (const route of GUEST_OUTCOME_ROUTES) {
      guestOutcomes[contextSpec.id][route] = await measureGuestOutcome(route);
    }
    for (const route of MEASURED_ROUTES) {
      const result = pageScreens[contextSpec.id][route];
      // 비켜난 축의 route 는 결과가 없다(위 landingNotMeasured). 문맥 검사는 **잰 것**에만
      // 건다 — 없는 결과를 읽으면 「축이 비었다」가 TypeError 로 둔갑해 원인이 가려진다.
      if (!result) continue;
      if (result.theme !== "light" || !result.locale.toLowerCase().startsWith("en")) {
        throw new Error(
          "[product-scenes] 페이지 렌더 문맥이 light/en이 아닙니다: route=" + route +
            " theme=" + result.theme + " locale=" + result.locale,
        );
      }
    }
  }
} finally {
  if (browser) await browser.close();
  await pinnedServer.stop();
}

// 장면 축이 잰 라이브 SVG 근거. 축이 비면 `null` 이고, 아래 assets 는 그때
// `$measuredFrom` 만 남기고 값을 싣지 않는다 — 없는 것을 편 채로 두면 빈 객체가 되어
// 「쟀는데 비었다」로 읽힌다.
let inlineSvgEvidence = null;
if (!SCENE_AXIS_SKIP) {
  inlineSvgEvidence = rendered[CONTEXTS[0].id].inlineSvg;
  for (const contextSpec of CONTEXTS.slice(1)) {
    if (JSON.stringify(rendered[contextSpec.id].inlineSvg) !== JSON.stringify(inlineSvgEvidence)) {
      throw new Error("[product-scenes] viewport마다 라이브 SVG geometry가 다릅니다: " + contextSpec.id);
    }
  }
  for (const contextSpec of CONTEXTS) delete rendered[contextSpec.id].inlineSvg;
}

// **판정을 축으로 옮긴 자리.** 예전에는 표본 0 이 곧 NOT_MEASURED 였다. 이제는 route 축이
// 0건일 때가 그것이다 — 「전제조건은 갖췄는데 잰 것이 0건」이라는 코드 2 의 뜻 그대로다.
// 장면 축 0건은 payload 에 사유로 남고 LIVE_PRODUCT_SCENE_IDS 가 그것을 잠근다.
{
  const measuredRoutes = Object.keys(pageScreens).length;
  const measuredGuest = Object.keys(guestOutcomes).length;
  if (measuredRoutes === 0 && measuredGuest === 0) {
    notMeasured(
      "product-scenes",
      "concrete route " + MEASURED_ROUTES.length + "개와 guest outcome route 를 재려 했는데 " +
        "한 건도 남지 않았습니다. 장면 축(" + (SCENE_AXIS_SKIP ? "표본 0" : "표본 있음") +
        ")과 무관하게 route 축이 비었다는 뜻이라 원인이 다릅니다 — 렌더 실패인지 목록이 비었는지 " +
        "보세요.",
    );
  }
}

const payload =
  JSON.stringify(
    {
      $comment:
        "생성물. scripts/measure-product-scenes.mjs가 고정 커밋의 49개 page.tsx route pattern을 전수 inventory하고, 프로덕션 빌드를 1920×1080·402×874에서 직접 렌더해 합성 장면과 공개·문서·법무·인증 22개 concrete route를 잰다. 직접 수정하지 않는다.",
      $whyThisExists:
        "합성 랜딩 장면과 완성 페이지는 클래스 하나만 정적 하네스에 올리면 Next Image intrinsic ratio, viewport 높이, 지연 hydration, 중첩 컴포넌트, scene-scale, content-visibility 활성화 결과를 잃는다. Figma는 이 파일에 없는 수치나 색을 그릴 수 없다.",
      $method:
        "KLIPSE_PRODUCT_BUILD_ROOT가 clean checkout이고 HEAD·standalone release 영수증·BUILD_ID가 productCommit의 빌드임을 확인한다. 측정기가 그 standalone server를 임시 localhost 포트에 직접 띄운 뒤 Playwright로 장면은 dark/ko-KR, 페이지는 light/en-US 문맥에서 연다. fonts·이미지·지연 hydration을 기다리고 일반 페이지는 끝까지 스크롤해 content-visibility 구간과 문서 높이가 안정된 뒤 노드를 측정한다. 아직 정밀 측정하지 않은 static route는 guest 문맥의 최종 path·redirect·theme·locale·heading·height가 안정될 때까지 기다려 별도 guestOutcomes에 기록한다.",
      productRef,
      productCommit: commit,
      buildEvidence,
      specimen: specimen ? specimen.id : null,
      structure: declaredNodes,
      contexts: CONTEXTS,
      routeInventory: {
        command: pageInventoryCommand,
        pageFileCount: routeInventory.length,
        measuredConcreteRouteCount: MEASURED_ROUTES.length,
        guestOutcomeRouteCount: GUEST_OUTCOME_ROUTES.length,
        pendingDynamicPatternCount: routeInventory.filter((page) =>
          page.dynamic && page.concreteMeasurements.length === 0).length,
        pages: routeInventory,
      },
      guestOutcomes,
      styleAxes: STYLE_AXES,
      pricingStyleAxes: PRICING_STYLE_AXES,
      assets: {
        heroWordmark: hashProductAsset("apps/web/public/klipse-wordmark-text-dark.svg"),
        demoBackground: hashProductAsset("apps/web/public/images/hero/demo-bg-01.jpg"),
        highlightWordmark: hashProductAsset("apps/web/public/highlight-wordmark.svg"),
        monitorArrowUp: hashProductAsset("apps/web/public/icons/MonitorArrowUp.svg"),
        themeDropdownChevron: inlineSvgEvidence
          ? {
              $measuredFrom: "두 viewport의 라이브 themeDropdownChevron SVG가 byte-for-byte 같음을 확인",
              ...inlineSvgEvidence.themeDropdownChevron,
            }
          : { $notMeasured: SCENE_AXIS_SKIP },
        sparkleFill: inlineSvgEvidence
          ? {
              $measuredFrom: "두 viewport의 라이브 ICON SVG가 byte-for-byte 같음을 확인",
              ...inlineSvgEvidence.ICON,
            }
          : { $notMeasured: SCENE_AXIS_SKIP },
      },
      sourceQuotes: [
        {
          command:
            "git show " + commit +
            ":apps/web/components/landing/sections/Hero.tsx",
          path: "apps/web/components/landing/sections/Hero.tsx",
          line: 54,
          quote: sourceLine("apps/web/components/landing/sections/Hero.tsx", 54),
        },
        // 데모 스냅숏 둘(StaticHighlightDemo · EmptyProjectDemoPad)의 인용은 걷었다 —
        // 제품 8802565e 에서 삭제된 파일이라 `git show` 가 실패한다. 장면 축과 함께 죽은 자리다.
        {
          command:
            "git show " + commit +
            ":apps/web/components/scenes/create/node-canvas-v2/components/NodePromptGenerateButton.tsx",
          path:
            "apps/web/components/scenes/create/node-canvas-v2/components/NodePromptGenerateButton.tsx",
          line: 96,
          quote: sourceLine(
            "apps/web/components/scenes/create/node-canvas-v2/components/NodePromptGenerateButton.tsx",
            96,
          ),
        },
      ],
      scenes: {
        // 장면 축이 재지 않았으면 사유를 여기 남긴다 — 빈 객체만 두면 다음 사람이
        // 「측정했는데 결과가 비었다」로 읽는다. 그 혼동이 이 파일의 원래 사고였다.
        ...(SCENE_AXIS_SKIP ? { notMeasured: SCENE_AXIS_SKIP } : {}),
        StaticHighlightDemo: rendered,
      },
      ...(landingNotMeasured ? { landingNotMeasured } : {}),
      pages: pageScreens,
    },
    null,
    2,
  ) + "\n";

if (checkOnly) {
  if (!existsSync(outputPath)) {
    console.error("[product-scenes] 생성물이 없습니다: migration/product.scenes.json");
    process.exit(1);
  }
  const recordedPayload = readFileSync(outputPath, "utf8");
  if (recordedPayload !== payload) {
    const findFirstDifference = (recorded, measured, path = "$") => {
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
        const difference = findFirstDifference(recorded[key], measured[key], path + "." + key);
        if (difference) return difference;
      }
      return null;
    };
    const difference = findFirstDifference(JSON.parse(recordedPayload), JSON.parse(payload));
    console.error(
      "[product-scenes] 제품 장면 렌더가 기록과 다릅니다: " +
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
  "[product-scenes] " + (checkOnly ? "checked" : "built") + ": " +
    (SCENE_AXIS_SKIP
      ? "장면 축 재지 않음(표본 0)"
      : specimen.id + " · " + CONTEXTS.length + "문맥 · " + declaredParts.length + "노드") +
    " · route " + Object.keys(pageScreens).length +
    " · guest " + Object.keys(guestOutcomes).length +
    " @ " + commit.slice(0, 8),
);
if (SCENE_AXIS_SKIP) {
  // 종료코드는 0 이다 — route 축을 실제로 쟀기 때문이다. 그러나 축 하나가 비었다는 사실은
  // 눈에 보여야 한다. 이 문구가 사라지면 장면 축이 조용히 죽은 것이다.
  console.log("[product-scenes] 장면 축 NOT_MEASURED — " + SCENE_AXIS_SKIP);
}
