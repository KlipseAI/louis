import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";
import { atomicWriteBatch } from "./lib/atomic-output.mjs";

// product.measured.json의 축들은 제품 소스의 **줄**을 인용한다. 줄 읽기는 cascade를 모른다 —
// 이 저장소는 이미 그 함정을 한 번 밟았다(제품의 `.app-native-checkbox`가 cascade layer 밖이라
// 소비처가 이길 수 없었고, 21벌 중 2벌만 그 정본을 썼다).
// 여기서는 배포본의 CSS를 **실제 브라우저에 올려** 인용된 변수를 브라우저가 풀게 한다.
// 제품 서버는 띄우지 않는다 — 정적 CSS만 읽으므로 제품의 런타임·DB·자격 증명에 닿지 않는다.
const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const measuredPath = resolve(repoRoot, "migration/product.measured.json");
const outputPath = resolve(repoRoot, "migration/product.rendered.json");
const productRoot = process.env.KLIPSE_PRODUCT_REPO ?? "/Users/sejunki/klipse-web";
const productRef = process.env.KLIPSE_PRODUCT_REF ?? "origin/main";
const STYLESHEETS = ["apps/web/app/globals.css", "apps/web/app/keyframes.css"];
const checkOnly = process.argv.includes("--check");

// 제품이 실제로 갈라지는 축들. 하나라도 빠지면 "한 값"으로 보이는 것이 사실은 여럿이다.
const CONTEXTS = [
  { id: "dark-desktop", theme: "dark", width: 1440, height: 900, reducedMotion: "no-preference" },
  { id: "light-desktop", theme: "light", width: 1440, height: 900, reducedMotion: "no-preference" },
  { id: "dark-mobile", theme: "dark", width: 375, height: 812, reducedMotion: "no-preference" },
  { id: "dark-reduced-motion", theme: "dark", width: 1440, height: 900, reducedMotion: "reduce" },
];

if (!existsSync(resolve(productRoot, ".git"))) {
  // hosted CI에는 제품 저장소가 없다. 건너뛰되 **건너뛰었다고 출력한다** — 조용한 통과는 통과가 아니다.
  const message =
    "[product-render] " +
    (checkOnly ? "SKIPPED" : "제품 저장소가 없습니다") +
    " (" + productRoot + ")";
  if (checkOnly) {
    console.log(message + ". 렌더 실측은 로컬에서 확인해야 합니다.");
    process.exit(0);
  }
  console.error(message);
  process.exit(1);
}

const measured = JSON.parse(readFileSync(measuredPath, "utf8"));
const variables = new Set();
const numericExpectations = [];
for (const [componentId, component] of Object.entries(measured.components)) {
  for (const [axisName, axis] of Object.entries(component.axes)) {
    const text = axis.product ?? "";
    const names = text.match(/--[a-z0-9-]+/g);
    if (!names) continue;
    for (const name of names) variables.add(name);
    // 변수가 **값을 직접 담을 때만** 대조한다. "40px (고정. --button-height)"는 담고,
    // "4px (gap-2 × --spacing:2px)"나 "calc(var(--button-radius) - 2px)"는 파생식이라 담지 않는다.
    const direct = text.match(/(\d+(?:\.\d+)?)px\s*(?:기본)?\((?:고정\.\s*)?(--[a-z0-9-]+)\)/);
    if (direct && typeof axis.productValue === "number" && Number.parseFloat(direct[1]) === axis.productValue) {
      numericExpectations.push({ componentId, axisName, variable: direct[2], expected: axis.productValue });
    }
  }
}

const commit = git(["rev-parse", productRef]).trim();
const css = STYLESHEETS.map((path) => git(["show", commit + ":" + path])).join("\n\n");

const names = [...variables].sort();
const browser = await chromium.launch();
const rendered = {};
try {
  for (const context of CONTEXTS) {
    const browserContext = await browser.newContext({
      viewport: { width: context.width, height: context.height },
      reducedMotion: context.reducedMotion,
      colorScheme: context.theme,
    });
    const page = await browserContext.newPage();
    await page.setContent(
      '<!doctype html><html data-theme="' +
        context.theme +
        '"><head><style>' +
        css.replace(/<\/style>/gi, "<\\/style>") +
        "</style></head><body></body></html>",
      { waitUntil: "load" },
    );
    rendered[context.id] = await page.evaluate((list) => {
      const style = getComputedStyle(document.documentElement);
      const out = {};
      for (const name of list) out[name] = style.getPropertyValue(name).trim();
      return out;
    }, names);
    await browserContext.close();
  }
} finally {
  await browser.close();
}

const payload =
  JSON.stringify(
    {
      $comment:
        "생성물. scripts/measure-product-render.mjs가 배포본 CSS를 실브라우저에 올려 뽑는다. 직접 수정하지 않는다.",
      $whyThisExists:
        "product.measured.json의 축들은 제품 소스의 줄을 인용한다. 줄 읽기는 cascade와 media query를 모른다. 여기 값은 브라우저가 실제로 푼 값이며, 문맥이 갈리면 문맥마다 다르게 기록된다.",
      $method:
        "제품 서버를 띄우지 않는다. 배포본의 정적 stylesheet만 git show로 읽어 빈 문서에 올리고 :root의 계산값을 읽는다.",
      productRef,
      productCommit: commit,
      stylesheets: STYLESHEETS,
      contexts: CONTEXTS,
      variables: names,
      rendered,
      numericExpectations,
    },
    null,
    2,
  ) + "\n";

if (checkOnly) {
  let current = "";
  try {
    current = readFileSync(outputPath, "utf8");
  } catch {
    console.error("[product-render] 생성물이 없습니다: migration/product.rendered.json");
    process.exit(1);
  }
  if (current !== payload) {
    const before = JSON.parse(current);
    const differences = [];
    for (const context of CONTEXTS) {
      for (const name of names) {
        const was = before.rendered?.[context.id]?.[name];
        const now = rendered[context.id][name];
        if (was !== now) differences.push(context.id + " " + name + ": " + was + " → " + now);
      }
    }
    console.error(
      "[product-render] 배포본의 렌더 값이 기록과 다릅니다" +
        (before.productCommit !== commit
          ? " (기록 " + String(before.productCommit).slice(0, 8) + " → 현재 " + commit.slice(0, 8) + ")"
          : ""),
    );
    for (const difference of differences.slice(0, 20)) console.error("  " + difference);
    if (differences.length === 0)
      console.error("  값은 같고 메타데이터만 다릅니다. `pnpm run measure-product-render`로 갱신하세요.");
    process.exit(1);
  }
} else {
  atomicWriteBatch([{ absolute: outputPath, expected: payload }]);
}

// 기록된 숫자와 브라우저가 푼 값이 어긋나면 실패한다. 줄 읽기로 적은 수를 브라우저가 반증하는
// 경로이며, 이 게이트의 존재 이유다.
const mismatches = [];
const scoped = [];
for (const expectation of numericExpectations) {
  const value = rendered["dark-desktop"][expectation.variable];
  if (!value) {
    // :root에 없다 = 전역 토큰이 아니라 특정 스코프가 소유한다. 실패가 아니라 사실이며,
    // 이 변수를 "제품 전역 정본"으로 인용하면 안 된다는 신호다.
    scoped.push(expectation.componentId + "/" + expectation.axisName + " (" + expectation.variable + ")");
    continue;
  }
  const parsed = Number.parseFloat(value);
  if (!Number.isFinite(parsed) || parsed !== expectation.expected) {
    mismatches.push(
      expectation.componentId +
        "/" +
        expectation.axisName +
        ": product.measured.json은 " +
        expectation.expected +
        "이라 적었는데 브라우저는 " +
        value +
        "을 풀었습니다 (" +
        expectation.variable +
        ")",
    );
  }
}
if (mismatches.length > 0) {
  for (const mismatch of mismatches) console.error("[product-render] " + mismatch);
  process.exit(1);
}

const varying = names.filter((name) => {
  const values = new Set(CONTEXTS.map((context) => rendered[context.id][name]));
  return values.size > 1;
});
console.log(
  "[product-render] " + (checkOnly ? "checked" : "built") + ": 변수 " +
    names.length +
    "개 × 문맥 " +
    CONTEXTS.length +
    " @ " +
    commit.slice(0, 8) +
    " · 기록된 수 " + (numericExpectations.length - scoped.length) + "건을 브라우저가 확인" +
    (scoped.length > 0 ? " · :root 밖 스코프 " + scoped.length + "건(" + scoped.join(", ") + ")" : "") +
    (varying.length > 0 ? " · 문맥에 따라 갈리는 변수 " + varying.length + "개: " + varying.join(" ") : ""),
);

function git(args) {
  return execFileSync("git", args, { cwd: productRoot, encoding: "utf8", maxBuffer: 64 * 1024 * 1024 });
}
