#!/usr/bin/env node
import { execFileSync, spawn } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { createServer } from "node:net";
import { delimiter, dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";
import { atomicWriteBatch } from "./lib/atomic-output.mjs";
import { resolveProductRef } from "./lib/product-ref.mjs";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const outputPath = resolve(repoRoot, "migration/product.sidebar-states.json");
const productRoot = process.env.KLIPSE_PRODUCT_REPO ?? "/Users/sejunki/klipse-web";
const fixtureRoot = process.env.KLIPSE_PRODUCT_FIXTURE_ROOT ?? process.env.KLIPSE_PRODUCT_BUILD_ROOT;
const checkOnly = process.argv.includes("--check");
const externalUrl = process.env.KLIPSE_PRODUCT_MEASURE_URL;
const { ref: productRef } = resolveProductRef();
const fail = (message) => { throw new Error(`[product-sidebar-states] ${message}`); };
if (!fixtureRoot || !existsSync(resolve(fixtureRoot, ".git"))) fail("clean product fixture is required");
const git = (cwd, args) => execFileSync("git", args, { cwd, encoding: "utf8", maxBuffer: 32 * 1024 * 1024 });
const commit = git(productRoot, ["rev-parse", productRef]).trim();
if (git(fixtureRoot, ["rev-parse", "HEAD"]).trim() !== commit) fail("fixture HEAD differs from pinned product commit");
const assertClean = (stage) => {
  const status = git(fixtureRoot, ["status", "--porcelain=v1", "--untracked-files=all"]).trim();
  if (status) fail(`${stage} fixture is dirty: ${status.split("\n")[0]}`);
};
assertClean("before measurement");
const delay = (ms) => new Promise((resolveDelay) => setTimeout(resolveDelay, ms));
const reservePort = async () => {
  const server = createServer();
  await new Promise((resolveListen, rejectListen) => {
    server.once("error", rejectListen);
    server.listen(0, "127.0.0.1", resolveListen);
  });
  const address = server.address();
  const port = typeof address === "object" && address ? address.port : null;
  await new Promise((resolveClose) => server.close(resolveClose));
  if (!port) fail("could not reserve local port");
  return port;
};
const startServer = async () => {
  if (externalUrl) return { url: externalUrl, stop: async () => {} };
  const webRoot = resolve(fixtureRoot, "apps/web");
  // `.npmrc` 의 `node-linker=hoisted` 때문에 `next` 는 저장소 루트에 실체화된다.
  // `apps/web/node_modules/next` 만 보면 fixture 를 갖춰도 못 찾는다.
  const nextCli = [
    resolve(webRoot, "node_modules/next/dist/bin/next"),
    resolve(fixtureRoot, "node_modules/next/dist/bin/next"),
  ].find((candidate) => existsSync(candidate));
  if (!nextCli) fail(`missing Next CLI: ${resolve(webRoot, "node_modules/next/dist/bin/next")} 또는 ${resolve(fixtureRoot, "node_modules/next/dist/bin/next")}`);
  const port = await reservePort();
  const url = `http://127.0.0.1:${port}`;
  const child = spawn(process.execPath, [nextCli, "dev", "--webpack", "-H", "127.0.0.1", "-p", String(port)], {
    cwd: webRoot,
    env: {
      ...process.env,
      PATH: `${dirname(process.execPath)}${delimiter}${process.env.PATH ?? ""}`,
      NODE_ENV: "development",
      NEXT_PUBLIC_DEV_AUTH_BYPASS: "1",
      NEXT_PUBLIC_SUPABASE_URL: "http://127.0.0.1:9",
      NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "fixture-anon-key",
    },
    stdio: ["ignore", "pipe", "pipe"],
  });
  let output = "";
  const append = (chunk) => { output = (output + chunk.toString()).slice(-32 * 1024); };
  child.stdout.on("data", append);
  child.stderr.on("data", append);
  const exited = new Promise((resolveExit) => child.once("exit", resolveExit));
  let ready = false;
  for (let attempt = 0; attempt < 240; attempt += 1) {
    if (child.exitCode !== null) break;
    try {
      const response = await fetch(`${url}/settings`, { redirect: "manual" });
      if (response.status >= 200 && response.status < 500) { ready = true; break; }
    } catch {}
    await delay(250);
  }
  if (!ready) fail(`fixture server did not start\n${output}`);
  return {
    url,
    async stop() {
      if (child.exitCode !== null) return;
      child.kill("SIGTERM");
      await Promise.race([exited, delay(5_000)]);
      if (child.exitCode === null) child.kill("SIGKILL");
    },
  };
};

const server = await startServer();
let browser;
const styleAxes = [
  "display", "flexDirection", "alignItems", "justifyContent", "gap",
  "paddingTop", "paddingRight", "paddingBottom", "paddingLeft",
  "marginTop", "marginRight", "marginBottom", "marginLeft",
  "borderTopLeftRadius", "backgroundColor", "color", "opacity", "overflow", "transform",
  "fontFamily", "fontSize", "fontWeight", "lineHeight", "letterSpacing", "textOverflow", "whiteSpace",
];
const measure = async (page) => page.evaluate((axes) => {
  const clean = (value) => (value ?? "").replace(/\s+/g, " ").trim();
  const round = (value) => Math.round(value * 10_000) / 10_000;
  const rect = (node) => {
    const value = node.getBoundingClientRect();
    return { x: round(value.x), y: round(value.y), width: round(value.width), height: round(value.height) };
  };
  const navigation = document.querySelector('nav[aria-label="App navigation"]');
  const sidebar = navigation?.closest("header");
  const root = sidebar?.parentElement;
  const main = root ? [...root.children].find((node) => node !== sidebar && node instanceof HTMLElement) : null;
  if (!(root instanceof HTMLElement) || !(sidebar instanceof HTMLElement) || !(main instanceof HTMLElement)) {
    throw new Error("unexpected app shell");
  }
  const describe = (node, path, parentPath = null) => {
    const computed = getComputedStyle(node);
    const box = node.getBoundingClientRect();
    const visible = computed.display !== "none" && computed.visibility !== "hidden" && computed.opacity !== "0" && box.width > 0 && box.height > 0;
    if (!visible && computed.display !== "contents") return [];
    const src = node instanceof HTMLImageElement && node.currentSrc ? new URL(node.currentSrc, location.href).pathname : null;
    const current = visible ? [{
      path, parentPath, tag: node.tagName.toLowerCase(),
      ...(node.getAttribute("aria-label") ? { ariaLabel: node.getAttribute("aria-label") } : {}),
      ...(src ? { src } : {}),
      ...(clean([...node.childNodes].filter((child) => child.nodeType === Node.TEXT_NODE).map((child) => child.textContent).join(" "))
        ? { ownText: clean([...node.childNodes].filter((child) => child.nodeType === Node.TEXT_NODE).map((child) => child.textContent).join(" ")) }
        : {}),
      rect: rect(node),
      style: Object.fromEntries(axes.map((axis) => [axis, computed[axis]])),
    }] : [];
    return [...current, ...[...node.children].flatMap((child, index) => describe(child, `${path}.${index}`, visible ? path : parentPath))];
  };
  const toggle = document.querySelector('button[aria-label="Collapse sidebar"],button[aria-label="Expand sidebar"]');
  return {
    theme: document.documentElement.dataset.theme,
    collapsed: document.documentElement.dataset.appGnbSidebarCollapsed === "true",
    rootRect: rect(root), sidebarRect: rect(sidebar), mainRect: rect(main),
    toggle: toggle ? { ariaLabel: toggle.getAttribute("aria-label"), rect: rect(toggle) } : null,
    tree: describe(sidebar, "sidebar"),
  };
}, styleAxes);

const measureMenuButton = async (page, ariaLabel) => page.evaluate(({ ariaLabel, axes }) => {
  const round = (value) => Math.round(value * 10_000) / 10_000;
  const node = document.querySelector(`button[aria-label="${ariaLabel}"]`);
  if (!(node instanceof HTMLElement)) throw new Error(`missing menu button: ${ariaLabel}`);
  const box = node.getBoundingClientRect();
  const computed = getComputedStyle(node);
  return {
    ariaLabel,
    rect: { x: round(box.x), y: round(box.y), width: round(box.width), height: round(box.height) },
    style: Object.fromEntries(axes.map((axis) => [axis, computed[axis]])),
  };
}, { ariaLabel, axes: styleAxes });

try {
  browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1920, height: 1080 }, colorScheme: "dark", locale: "en-US", serviceWorkers: "block" });
  await context.addCookies([
    { name: "facen-language", value: "en", url: server.url },
    { name: "klipse-theme", value: "dark", url: server.url },
  ]);
  await context.addInitScript(() => {
    localStorage.setItem("facen-language", "en");
    localStorage.setItem("klipse-theme", "dark");
  });
  await context.route("**/*", async (route) => {
    const target = new URL(route.request().url());
    if (target.origin === server.url || target.protocol === "data:") await route.continue();
    else await route.abort("blockedbyclient");
  });
  const page = await context.newPage();
  await page.goto(`${server.url}/settings`, { waitUntil: "domcontentloaded", timeout: 60_000 });
  await delay(3_000);
  await page.evaluate(async () => { await document.fonts.ready; });
  const expanded = await measure(page);
  await page.getByRole("button", { name: "Collapse sidebar" }).click();
  await page.waitForFunction(() => document.documentElement.dataset.appGnbSidebarCollapsed === "true");
  await delay(500);
  const collapsed = await measure(page);
  await page.goto(`${server.url}/archive`, { waitUntil: "domcontentloaded", timeout: 60_000 });
  await delay(3_000);
  await page.evaluate(async () => { await document.fonts.ready; });
  const activeCollapsedHome = await measureMenuButton(page, "Home");
  const sourcePath = "apps/web/components/navigation/Gnb.tsx";
  const source = git(productRoot, ["show", `${commit}:${sourcePath}`]).split("\n");
  const quote = (line, expected) => {
    const actual = source[line - 1] ?? "";
    if (actual !== expected) fail(`source quote drift ${sourcePath}:${line}`);
    return { command: `git show ${commit}:${sourcePath}`, path: sourcePath, line, quote: actual };
  };
  const output = {
    $comment: "Generated by scripts/measure-product-sidebar-states.mjs. Do not edit by hand.",
    $evidenceClass: "product-only measured Figma candidate; dark desktop app shell interaction state",
    productCommit: commit,
    context: { id: "desktop-1920x1080-dark", viewport: { width: 1920, height: 1080 }, route: "/settings" },
    // **줄 번호는 앵커를 따라 옮긴다 — 인용문 자체는 그대로다.**
    // 2026-09-03 재고정(`ae8fd627` → `5a67d692`)에서 `Gnb.tsx` 가 5639 → 5562 줄로 줄면서
    // 여섯 인용의 위치만 밀렸다. 2026-09-10 재고정(`5a67d692` → `91e5ea2a`)에서 다시
    // 5563 → 5706 줄로 늘며 밀렸다 — 로고 블록 +55(1844→1899 · 1918→1973 · 1920→1975),
    // 메뉴 블록 +24(564→588 · 570→594 · 580→604).
    //
    // 570 만 문자열이 유일하지 않다(`"[color:var(--gray-000)]",` 는 새 커밋에 14번 나온다).
    // 그래서 문자열 검색이 아니라 **형제로** 고정했다: 588 · 594 · 604 는 한 선언 배열 안의
    // 같은 블록이고 옛 564 · 570 · 580 과 **간격이 같다**(+6 · +16). 그 일치가 이 셋이 같은
    // 블록임을 증명한다 — 문자열만 보고 다른 자리를 집으면 다른 컴포넌트의 색을 근거로 삼는다.
    //
    // **이 `quote()` 는 대조한다**(위 :188). 그래서 이번 재고정에서 여섯 중 여섯이 드러났다 —
    // 대조하지 않는 `measure-product-auth-fixture` 의 `sourceQuote` 와 다른 점이고, 그쪽은
    // 같은 회차에 손으로 찾아야 했다. 인용을 굽는 자리는 대조를 함께 굽는 것이 맞다.
    sourceEvidence: [
      quote(1898, '    "[html[data-app-gnb-sidebar-collapsed=true]_&]:[width:var(--app-gnb-sidebar-logo-cube-px)]",'),
      quote(1972, '    "[html[data-app-gnb-sidebar-collapsed=true]_&]:[width:var(--app-gnb-sidebar-logo-symbol-w)]",'),
      quote(1974, '    "[html[data-app-gnb-sidebar-collapsed=true]_&]:[transform:translateX(_calc(_(_var(--app-gnb-sidebar-menu-hit-w)_-_var(--app-gnb-sidebar-logo-symbol-w)_)_/_2_)_)]",'),
      quote(587, '    "[.gnb-menuSidebar_.gnb-menuLink:not(&)]:[color:var(--gray-300)]",'),
      quote(593, '    "[color:var(--gray-000)]",'),
      quote(603, '    "[html[data-theme=dark]_.gnb-menuSidebar_&]:[background-color:transparent]",'),
    ],
    states: { expanded, collapsed, activeCollapsedHome },
  };
  const serialized = `${JSON.stringify(output, null, 2)}\n`;
  if (checkOnly) {
    if (!existsSync(outputPath) || readFileSync(outputPath, "utf8") !== serialized) fail("generated output drift");
  } else {
    atomicWriteBatch([{ absolute: outputPath, expected: serialized }]);
  }
  console.log(`[product-sidebar-states] ${checkOnly ? "checked" : "measured"}: expanded ${expanded.sidebarRect.width}px → collapsed ${collapsed.sidebarRect.width}px @ ${commit.slice(0, 8)}`);
} finally {
  if (browser) await browser.close();
  await server.stop();
}
assertClean("after measurement");
