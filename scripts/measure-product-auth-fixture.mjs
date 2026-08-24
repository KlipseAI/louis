#!/usr/bin/env node
import { execFileSync, spawn } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { createServer } from "node:net";
import { delimiter, dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";
import { atomicWriteBatch } from "./lib/atomic-output.mjs";
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
const nextCli = resolve(webRoot, "node_modules/next/dist/bin/next");
if (!existsSync(nextCli)) {
  unavailable("Next 개발 서버 실행 파일이 없습니다: " + nextCli);
}

const CONTEXTS = [
  { id: "desktop-1920x1080", width: 1920, height: 1080 },
  { id: "mobile-402x874", width: 402, height: 874 },
];

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
];

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

const routeFiles = ROUTES.map((route) => ({
  route,
  path: "apps/web/app" + route + "/page.tsx",
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
  const child = spawn(
    process.execPath,
    [nextCli, "dev", "-H", "127.0.0.1", "-p", String(port)],
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
    for (const route of ROUTES) {
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

        await page.goto(fixtureServer.url + route, {
          waitUntil: "domcontentloaded",
          timeout: 60_000,
        });
        if (new URL(page.url()).origin !== fixtureServer.url) {
          throw new Error(
            "[product-auth-fixture] fixture 서버 밖으로 이동했습니다: " + page.url(),
          );
        }
        await delay(3_000);
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
            return JSON.stringify({
              path: location.pathname,
              search: location.search,
              theme: document.documentElement.dataset.theme,
              locale: document.documentElement.lang,
              height: document.documentElement.scrollHeight,
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
          throw new Error("[product-auth-fixture] 화면이 안정화되지 않았습니다: " + route);
        }
        await page.evaluate(async () => { await document.fonts.ready; });

        const measured = await page.evaluate(({ styleAxes, pseudoStyleAxes }) => {
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
          const describe = (node, path, parentPath = null) => {
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
            const descendants = [...node.children].flatMap((child, index) =>
              describe(child, path + "." + index, visible ? path : parentPath));
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
          const rootTree = describe(rootCandidate.node, rootPath);
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

        const uniqueRecords = (records) => [...new Map(records
          .map((entry) => [JSON.stringify(entry), entry])).values()]
          .sort((left, right) => JSON.stringify(left).localeCompare(JSON.stringify(right)));
        screens[contextSpec.id][route] = {
          requestedRoute: route,
          ...measured,
          redirected:
            measured.finalPath !== route || measured.finalSearch !== "",
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
// 최초 등장 순서의 table에 한 번만 넣고 노드는 styleRef로 가리킨다. table과 ref를 합치면 원래
// 측정값을 byte-for-byte 복원할 수 있는 무손실 정규화다.
const computedStyles = [];
const computedStyleIds = new Map();
const internStyle = (entry) => {
  if (!entry.style) return;
  const serialized = JSON.stringify(entry.style);
  let styleRef = computedStyleIds.get(serialized);
  if (styleRef === undefined) {
    styleRef = "s" + computedStyles.length;
    computedStyleIds.set(serialized, styleRef);
    computedStyles.push({ id: styleRef, value: entry.style });
  }
  delete entry.style;
  entry.styleRef = styleRef;
};
for (const contextSpec of CONTEXTS) {
  for (const route of ROUTES) {
    const screen = screens[contextSpec.id][route];
    for (const heading of screen.headings) internStyle(heading);
    for (const node of screen.tree) internStyle(node);
    for (const overlay of screen.overlays) {
      for (const node of overlay.tree) internStyle(node);
    }
  }
}

const screenAliases = CONTEXTS.map((contextSpec) => ({
  context: contextSpec.id,
  aliases: ROUTES
    .map((route) => screens[contextSpec.id][route])
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
  for (const route of ROUTES) {
    const screen = screens[contextSpec.id][route];
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
        route,
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
    "fixture checkout의 clean HEAD가 productCommit인지 확인하고 NEXT_PUBLIC_DEV_AUTH_BYPASS=1인 Next development server를 임시 localhost 포트에 직접 띄운다. Supabase URL은 연결되지 않는 localhost endpoint로 고정한다. 각 route는 격리된 light/en-US 브라우저 문맥에서 열고 외부 요청을 차단한다. 3초 이상 기다린 뒤 path·theme·locale·height·root text·element/dialog count가 6회 연속 안정되면 app root와 외부 dialog 중 viewport와 교차하는 노드의 geometry·computed styles·SVG vector 속성, heading·landmark, localhost API status를 기록한다. 동일 computed-style 객체는 무손실 style table로 정규화한다. 이 fixture의 실패·빈 상태는 의도적으로 보존한다.",
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
      "redirect source는 screenAliases로 분리한다. canonical 최종 화면의 가시 tree에서 5노드 이상인 모든 subtree를 뽑고, root 기준 상대 geometry·tag/role/inputType·computed styleRef·DOM 경로가 viewport 안에서 완전히 같은 항목만 묶는다. 서로 다른 route 두 곳 이상에서 반복된 후보를 nodeCount×routeCount로 정렬해 viewport별 상위 60개를 기록한다.",
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
    sourceQuote("apps/web/components/auth/AuthProvider.tsx", 345),
    sourceQuote("apps/web/components/auth/AuthProvider.tsx", 346),
    sourceQuote("apps/web/components/auth/AuthProvider.tsx", 347),
    sourceQuote("apps/web/components/auth/AuthProvider.tsx", 348),
    sourceQuote("apps/web/components/auth/AuthProvider.tsx", 349),
    sourceQuote("apps/web/components/auth/AuthProvider.tsx", 350),
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
    ROUTES.length + " routes · " + CONTEXTS.length + "문맥 @ " + commit.slice(0, 8),
);
