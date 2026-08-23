#!/usr/bin/env node
import { execFileSync, spawn } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { createServer } from "node:net";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";
import { atomicWriteBatch } from "./lib/atomic-output.mjs";
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

const unavailable = (reason) => {
  console.error("[product-scenes] 측정 불가 (" + reason + ")");
  process.exit(1);
};

if (!existsSync(resolve(productRoot, ".git"))) unavailable("제품 저장소가 없습니다: " + productRoot);
if (!productBuildRoot) unavailable("KLIPSE_PRODUCT_BUILD_ROOT가 없습니다");
if (!existsSync(resolve(productBuildRoot, ".git"))) {
  unavailable("빌드 저장소가 아닙니다: " + productBuildRoot);
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
  unavailable(
    "빌드 저장소가 dirty입니다. 고정 커밋의 clean checkout에서 다시 빌드하세요: " +
      buildStatus.split("\n")[0],
  );
}

const specimenFile = JSON.parse(readFileSync(specimenPath, "utf8"));
const liveSpecimens = assertLiveProductSceneCoverage(specimenFile.specimens);
const specimen = liveSpecimens.find((entry) => entry.id === "scene/staticHighlightDemo");

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
visit(specimen.node);
const declaredParts = declaredNodes.map((node) => node.part);
if (new Set(declaredParts).size !== declaredParts.length) {
  console.error("[product-scenes] liveOnly 표본의 part 이름은 측정 키로 쓰므로 중복될 수 없습니다.");
  process.exit(1);
}

const CONTEXTS = [
  { id: "desktop-1920x1080", width: 1920, height: 1080 },
  { id: "mobile-402x874", width: 402, height: 874 },
];
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
  if (!existsSync(required)) unavailable("standalone 제품 빌드 산출물이 없습니다: " + required);
}

const requiredFilesBytes = readFileSync(requiredFilesPath);
const standaloneRequiredFilesBytes = readFileSync(standaloneRequiredFilesPath);
const requiredFiles = JSON.parse(requiredFilesBytes.toString("utf8"));
const standaloneRequiredFiles = JSON.parse(standaloneRequiredFilesBytes.toString("utf8"));
const buildRelease = requiredFiles.config?.env?._sentryRelease;
const standaloneRelease = standaloneRequiredFiles.config?.env?._sentryRelease;
if (buildRelease !== commit || standaloneRelease !== commit) {
  unavailable(
    "빌드 영수증의 release commit이 고정 커밋과 다릅니다: build=" + buildRelease +
      " standalone=" + standaloneRelease + " expected=" + commit,
  );
}
const buildId = readFileSync(buildIdPath, "utf8").trim();
const standaloneBuildId = readFileSync(standaloneBuildIdPath, "utf8").trim();
if (!buildId || buildId !== standaloneBuildId) {
  unavailable("원본과 standalone의 BUILD_ID가 다릅니다: " + buildId + " != " + standaloneBuildId);
}

// clean 상태는 측정 시점의 checkout만 증명한다. 오래되거나 다른 작업 트리에서 복사한 .next도
// 막으려면, 장면을 구성하는 소스가 build sourcemap에 고정 커밋의 원문 그대로 들어갔는지 본다.
const BUILD_SOURCE_PATHS = [
  "apps/web/app/HomePageClient.tsx",
  "apps/web/components/landing/demo-snapshots/EmptyProjectDemoPad.tsx",
  "apps/web/components/landing/demo-snapshots/StaticHighlightDemo.tsx",
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
      unavailable("빌드 sourcemap의 소스가 고정 커밋과 다릅니다: " + proof.path);
    }
    proof.matched = true;
  }
}
for (const proof of buildSourceBySuffix.values()) {
  if (!proof.matched) unavailable("빌드 sourcemap에서 고정 소스 근거를 찾지 못했습니다: " + proof.path);
}

const buildEvidence = {
  releaseCommit: buildRelease,
  $verified:
    "clean checkout HEAD와 두 required-server-files release가 productCommit이고, 원본·standalone BUILD_ID가 같으며 장면 구성 소스가 build sourcemap에 고정 원문 그대로 있음을 실행 시 확인했다. BUILD_ID와 빌드 파일 해시는 빌드 경로·실행마다 달라질 수 있어 생성물에는 넣지 않는다.",
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
try {
  browser = await chromium.launch({ headless: true });
  for (const contextSpec of CONTEXTS) {
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
      await page.waitForSelector('#highlight section[aria-label="하이라이트"]');
      await page.evaluate(async () => {
        await document.fonts.ready;
        const images = [...document.querySelectorAll("#highlight img")];
        await Promise.all(images.map(async (image) => {
          if (!image.complete) {
            await new Promise((resolveImage) => {
              image.addEventListener("load", resolveImage, { once: true });
              image.addEventListener("error", resolveImage, { once: true });
            });
          }
          if (typeof image.decode === "function") await image.decode().catch(() => {});
        }));
      });
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
          const inScene = element === stage || stage.contains(element);
          nodes[part] = {
            tag: element.tagName.toLowerCase(),
            parentPart: declarationByPart[part].parent,
            text: normalizedText(element),
            viewportRect: {
              x: Math.round(rect.x * 10000) / 10000,
              y: Math.round(rect.y * 10000) / 10000,
              width: Math.round(rect.width * 10000) / 10000,
              height: Math.round(rect.height * 10000) / 10000,
            },
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
          pageHeight: document.documentElement.scrollHeight,
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
} finally {
  if (browser) await browser.close();
  await pinnedServer.stop();
}

const inlineSvgEvidence = rendered[CONTEXTS[0].id].inlineSvg;
for (const contextSpec of CONTEXTS.slice(1)) {
  if (JSON.stringify(rendered[contextSpec.id].inlineSvg) !== JSON.stringify(inlineSvgEvidence)) {
    throw new Error("[product-scenes] viewport마다 라이브 SVG geometry가 다릅니다: " + contextSpec.id);
  }
}
for (const contextSpec of CONTEXTS) delete rendered[contextSpec.id].inlineSvg;

const payload =
  JSON.stringify(
    {
      $comment:
        "생성물. scripts/measure-product-scenes.mjs가 고정 커밋의 프로덕션 빌드를 1920×1080·402×874에서 직접 렌더해 잰다. 직접 수정하지 않는다.",
      $whyThisExists:
        "합성 랜딩 장면은 클래스 하나만 정적 하네스에 올리면 Next Image intrinsic ratio, viewport 높이, 중첩 컴포넌트, scene-scale을 잃는다. Figma는 이 파일에 없는 수치나 색을 그릴 수 없다.",
      $method:
        "KLIPSE_PRODUCT_BUILD_ROOT가 clean checkout이고 HEAD·standalone release 영수증·BUILD_ID가 productCommit의 빌드임을 확인한다. 측정기가 그 standalone server를 임시 localhost 포트에 직접 띄운 뒤 Playwright dark/ko-KR context에서 열고, fonts·이미지 준비와 애니메이션 정지 뒤 liveOnly 구조의 모든 노드를 측정한다.",
      productRef,
      productCommit: commit,
      buildEvidence,
      specimen: specimen.id,
      structure: declaredNodes,
      contexts: CONTEXTS,
      styleAxes: STYLE_AXES,
      assets: {
        demoBackground: hashProductAsset("apps/web/public/images/hero/demo-bg-01.jpg"),
        highlightWordmark: hashProductAsset("apps/web/public/highlight-wordmark.svg"),
        monitorArrowUp: hashProductAsset("apps/web/public/icons/MonitorArrowUp.svg"),
        themeDropdownChevron: {
          $measuredFrom: "두 viewport의 라이브 themeDropdownChevron SVG가 byte-for-byte 같음을 확인",
          ...inlineSvgEvidence.themeDropdownChevron,
        },
        sparkleFill: {
          $measuredFrom: "두 viewport의 라이브 ICON SVG가 byte-for-byte 같음을 확인",
          ...inlineSvgEvidence.ICON,
        },
      },
      sourceQuotes: [
        {
          command:
            "git show " + commit +
            ":apps/web/components/landing/demo-snapshots/StaticHighlightDemo.tsx",
          path: "apps/web/components/landing/demo-snapshots/StaticHighlightDemo.tsx",
          line: 12,
          quote: sourceLine(
            "apps/web/components/landing/demo-snapshots/StaticHighlightDemo.tsx",
            12,
          ),
        },
        {
          command:
            "git show " + commit +
            ":apps/web/components/landing/demo-snapshots/EmptyProjectDemoPad.tsx",
          path: "apps/web/components/landing/demo-snapshots/EmptyProjectDemoPad.tsx",
          line: 21,
          quote: sourceLine(
            "apps/web/components/landing/demo-snapshots/EmptyProjectDemoPad.tsx",
            21,
          ),
        },
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
        StaticHighlightDemo: rendered,
      },
    },
    null,
    2,
  ) + "\n";

if (checkOnly) {
  if (!existsSync(outputPath)) {
    console.error("[product-scenes] 생성물이 없습니다: migration/product.scenes.json");
    process.exit(1);
  }
  if (readFileSync(outputPath, "utf8") !== payload) {
    console.error("[product-scenes] 제품 장면 렌더가 기록과 다릅니다. 다시 측정하세요.");
    process.exit(1);
  }
} else {
  atomicWriteBatch([{ absolute: outputPath, expected: payload }]);
}

console.log(
  "[product-scenes] " + (checkOnly ? "checked" : "built") + ": " +
    specimen.id + " · " + CONTEXTS.length + "문맥 · " + declaredParts.length +
    "노드 @ " + commit.slice(0, 8),
);
