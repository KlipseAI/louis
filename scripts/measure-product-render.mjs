import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";
import { atomicWriteBatch } from "./lib/atomic-output.mjs";
import { notMeasured, unavailable } from "./lib/gate-exit.mjs";
import { resolveProductRef } from "./lib/product-ref.mjs";

// product.measured.json의 축들은 제품 소스의 **줄**을 인용한다. 줄 읽기는 cascade를 모른다 —
// 이 저장소는 이미 그 함정을 한 번 밟았다(제품의 `.app-native-checkbox`가 cascade layer 밖이라
// 소비처가 이길 수 없었고, 21벌 중 2벌만 그 정본을 썼다).
// 여기서는 배포본의 CSS를 **실제 브라우저에 올려** 인용된 변수를 브라우저가 풀게 한다.
// 제품 서버는 띄우지 않는다 — 정적 CSS만 읽으므로 제품의 런타임·DB·자격 증명에 닿지 않는다.
const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const measuredPath = resolve(repoRoot, "migration/product.measured.json");
const outputPath = resolve(repoRoot, "migration/product.rendered.json");
const productRoot = process.env.KLIPSE_PRODUCT_REPO ?? "/Users/sejunki/klipse-web";
// 측정 대상은 근거 lock이 고정한 커밋이다 — `origin/main`을 따라가면 같은 명령이
// 어제와 다른 값을 낸다. scripts/lib/product-ref.mjs에 사유가 있다.
const { ref: productRef, source: productRefSource } = resolveProductRef();
// 제품 app/layout.tsx가 싣는 **진입점 두 개**다(`import "./tailwind.css"` → `import
// "./globals.css"`). keyframes.css와 LOUIS CSS는 tailwind.css의 `@import`로 들어오므로 여기
// 적지 않는다 — 아래 inlineImports가 선언된 자리 그대로 이어 붙인다. 순서를 바꾸면 cascade가
// 달라진다.
const STYLESHEETS = ["apps/web/app/tailwind.css", "apps/web/app/globals.css"];
const LOUIS_PACKAGE = "@klipse-design/css";
const checkOnly = process.argv.includes("--check");

// 제품이 실제로 갈라지는 축들. 하나라도 빠지면 "한 값"으로 보이는 것이 사실은 여럿이다.
const CONTEXTS = [
  { id: "dark-desktop", theme: "dark", width: 1440, height: 900, reducedMotion: "no-preference" },
  { id: "light-desktop", theme: "light", width: 1440, height: 900, reducedMotion: "no-preference" },
  { id: "dark-mobile", theme: "dark", width: 375, height: 812, reducedMotion: "no-preference" },
  { id: "dark-reduced-motion", theme: "dark", width: 1440, height: 900, reducedMotion: "reduce" },
];

if (!existsSync(resolve(productRoot, ".git"))) {
  // **`--check`에서도 exit 0 하지 않는다.** 예전에는 여기서 `SKIPPED`를 찍고 통과했다. 이
  // 게이트는 `verify:product`에만 있어 hosted CI에서는 아예 돌지 않으므로 "러너 배려"가 필요
  // 없었고, 남은 효과는 제품 저장소가 없는 로컬에서 **조용히 초록**이 되는 것뿐이었다.
  unavailable("product-render", "제품 저장소가 없습니다: " + productRoot);
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
    //
    // **변수명 뒤에서 괄호가 바로 닫히기를 요구하지 않는다.** 예전 정규식은 `(--이름\)` 이라
    // 적어서, 이 저장소가 즐겨 쓰는 「값 + 근거」 주석이 통째로 탈락했다 —
    // "32px (고정. --button-height — md 40 폐지, 32 단일)" 과
    // "12px (--button-padding-inline — 16 폐지, sm 과 동일 사양)" 두 축이 그랬고, 그중
    // `--button-height` 는 브라우저가 실제로 `32px` 로 푼다. 즉 **대조할 수 있는 것을 스스로
    // 버리고 있었다**(2026-09-01 원장 `product-render-zero-comparisons`).
    // 이제 변수명 뒤에 `)` 또는 근거를 여는 `—` 가 오면 받는다. `·`(값이 여럿) 이나
    // `,`(나열)로 이어지는 것은 여전히 받지 않는다 — 한 값이 아니기 때문이다.
    const direct = text.match(/(\d+(?:\.\d+)?)px\s*(?:기본)?\(\s*(?:고정\.\s*)?(--[a-z0-9-]+)\s*[—)]/);
    if (direct && typeof axis.productValue === "number" && Number.parseFloat(direct[1]) === axis.productValue) {
      numericExpectations.push({ componentId, axisName, variable: direct[2], expected: axis.productValue });
    }
  }
}

const commit = git(["rev-parse", productRef]).trim();

// **제품이 `@import` 로 부르는 것을 실제로 이어 붙인다.**
//
// 예전에는 `@import` 를 전부 지웠다. 그 결과 이 하네스는 제품 팔레트를 **하나도 갖지 못했다** —
// `--palette-gray-000: var(--louis-color-palette-gray-000)` 처럼 제품의 시맨틱 토큰은 거의 전부
// LOUIS 토큰을 가리키는데, 그 정의는 `@klipse-design/css/tokens.css` 안에 있기 때문이다.
// 2026-09-01 실측: 인용된 변수 33개 중 브라우저가 값을 준 것은 **2개**(`--button-height`,
// `--spacing`, 둘 다 리터럴)뿐이었고 나머지 31개는 빈 문자열이었다. 그런데 게이트는 그 31개를
// ":root 밖 스코프" 라고 **사실인 양** 인쇄했다. 재지 못한 것을 사실로 적는 것이 이 게이트가
// 가진 가장 나쁜 성질이었다.
//
// LOUIS 커밋은 추측하지 않는다 — 제품 `apps/web/package.json` 이 SHA 로 고정해 받으므로 그
// SHA 를 읽어 **이 저장소의 같은 커밋**에서 파일을 꺼낸다. 제품이 실제로 설치한 바이트와 같고,
// 재현도 보장된다(`node_modules` 를 읽으면 기계마다 달라진다).
const louisCommit = resolveLouisPin();
const includeOrder = [];
const unresolvedImports = [];
const css = translateTheme(
  STYLESHEETS.map((path) => inlineImports(stripComments(git(["show", commit + ":" + path])), path))
    .join("\n\n"),
);

function stripComments(source) {
  return source.replace(/\/\*[\s\S]*?\*\//g, "");
}

// 브라우저는 Tailwind의 at-rule을 모른다. Tailwind v4가 `@theme`의 선언을 `:root`로 내보내므로
// 같게 번역한다. 번역하지 않으면 `--spacing: 2px` 같은 값이 통째로 사라져 **없는 것처럼 보인다** —
// 실제로 첫 판이 그랬고, 제품이 2px 격자를 쓴다는 사실이 게이트에서 지워져 있었다.
function translateTheme(source) {
  return source.replace(/@theme\s+(?:inline\s+)?\{/g, ":root {");
}

function resolveLouisPin() {
  const manifest = JSON.parse(git(["show", commit + ":apps/web/package.json"]));
  const spec =
    manifest.dependencies?.[LOUIS_PACKAGE] ?? manifest.devDependencies?.[LOUIS_PACKAGE];
  if (!spec) {
    unavailable("product-render", "제품 apps/web/package.json 에 " + LOUIS_PACKAGE + " 의존성이 없습니다.");
  }
  const sha = /#([0-9a-f]{40})/.exec(spec)?.[1];
  if (!sha) {
    unavailable(
      "product-render",
      "제품이 고정한 LOUIS SHA 를 읽지 못했습니다: " + spec +
        " (github:KlipseAI/louis#<40자 SHA>&path:/packages/css 형식을 기대합니다)",
    );
  }
  try {
    execFileSync("git", ["cat-file", "-e", sha + "^{commit}"], { cwd: repoRoot, stdio: "ignore" });
  } catch {
    unavailable(
      "product-render",
      "제품이 고정한 LOUIS 커밋이 이 저장소에 없습니다: " + sha + " — `git fetch origin` 후 다시 실행하세요.",
    );
  }
  return sha;
}

// `function` 선언이라야 한다. 아래 세 헬퍼는 파일 위쪽의 top-level `const css = ...` 에서
// 불리므로, `const` 화살표로 적으면 TDZ 로 죽는다.
function louisSource(file) {
  return stripComments(execFileSync("git", ["show", louisCommit + ":packages/css/generated/" + file], {
    cwd: repoRoot,
    encoding: "utf8",
    maxBuffer: 64 * 1024 * 1024,
  }));
}

// **주석을 먼저 지운 뒤 부른다.** 제품 머리말은 `@import "tailwindcss"` 를 설명하려고 인용하는데,
// 주석을 남긴 채 이 정규식을 돌리면 그 인용에서 매칭이 시작된다. scripts/measure-product-variants.mjs
// 에서는 같은 삼킴이 실제로 여백 축을 전부 0 으로 만들었다.
// 정규식을 **함수 안에 리터럴로** 둔다. 이 함수는 자기를 재귀 호출하는데, `/g` 정규식 객체를
// 공유하면 안쪽 replace 가 바깥쪽 순회의 lastIndex 를 건드려 import 를 건너뛴다. 리터럴은
// 평가할 때마다 새 객체가 되므로 재귀가 안전하다.
function inlineImports(source, originPath, seen = new Set()) {
  return source.replace(/@import\s+(?:"([^"]+)"|'([^']+)')\s*(?:layer\(([^)]*)\))?\s*;/g, (_whole, doubleQuoted, singleQuoted, layerName) => {
    const spec = doubleQuoted ?? singleQuoted;
    let key = null;
    let body = null;
    if (spec.startsWith("./")) {
      const path = originPath.slice(0, originPath.lastIndexOf("/")) + "/" + spec.slice(2);
      key = path;
      if (seen.has(key)) return "/* 이미 포함됨: " + spec + " */";
      seen.add(key);
      body = inlineImports(stripComments(git(["show", commit + ":" + path])), path, seen);
    } else if (spec.startsWith(LOUIS_PACKAGE + "/")) {
      const file = spec.slice(LOUIS_PACKAGE.length + 1);
      key = LOUIS_PACKAGE + "/" + file + "@" + louisCommit.slice(0, 8);
      if (seen.has(key)) return "/* 이미 포함됨: " + spec + " */";
      seen.add(key);
      body = louisSource(file);
    } else if (spec === "tailwindcss" || spec.startsWith("tailwindcss/")) {
      // Tailwind 자신의 배포 CSS는 이 저장소에 없다. 인용된 변수는 전부 제품이나 LOUIS의
      // 선언이므로 빼도 값은 바뀌지 않는다 — 다만 **뺐다는 사실을 생성물에 적는다.**
      if (!unresolvedImports.includes(spec)) unresolvedImports.push(spec);
      return "/* 해석하지 않음: " + spec + " */";
    } else {
      // 새 `@import` 가 조용히 사라지지 않게 한다. 값이 통째로 비는 사고가 바로 그렇게 났다.
      throw new Error(
        "[product-render] 알 수 없는 @import 입니다: " + spec + " (" + originPath + "). " +
          "해석 규칙을 scripts/measure-product-render.mjs 의 inlineImports 에 추가하세요.",
      );
    }
    includeOrder.push(key);
    return layerName ? "@layer " + layerName + " {\n" + body + "\n}\n" : body;
  });
}

const names = [...variables].sort();
const browser = await chromium.launch();
const rendered = {};
const rootMetrics = {};
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
    // **rem 환산 기준은 브라우저에게 물어야 한다.** 두 저장소가 네 곳에서 `1rem = 10px`라고
    // 적고 있었는데 배포본의 `html`은 `font-size: var(--type-caption-12-size)` = 12px다
    // (globals.css의 「html 10px」 주석 자체가 제품에서 낡았다). 그 결과 `4.5rem`을 45px로
    // 환산했지만 실제는 54px다 — 접힌 사이드바 라벨 폭이 20% 어긋난다.
    rootMetrics[context.id] = await page.evaluate(() => {
      const probe = document.createElement("div");
      probe.style.width = "4.5rem";
      probe.style.position = "absolute";
      document.body.appendChild(probe);
      const remPx = probe.getBoundingClientRect().width / 4.5;
      probe.remove();
      return {
        rootFontSize: getComputedStyle(document.documentElement).fontSize,
        remPx,
        "4.5rem": remPx * 4.5,
      };
    });
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
        "제품 서버를 띄우지 않는다. 배포본의 정적 stylesheet만 git show로 읽어 빈 문서에 올리고 :root의 계산값을 읽는다. 제품이 @import로 부르는 keyframes.css와 LOUIS CSS는 선언된 자리에 그대로 이어 붙인다 — LOUIS는 제품 apps/web/package.json이 SHA로 고정한 커밋에서 꺼낸다.",
      productRef,
      productCommit: commit,
      stylesheets: STYLESHEETS,
      louisCommit,
      $includeOrderNote:
        "제품 진입점 두 개에서 시작해 @import를 실제로 이어 붙인 순서. 이 목록이 비면 하네스는 제품 팔레트를 갖지 못하고, 인용된 변수는 값이 아니라 빈 문자열로 돌아온다.",
      includeOrder,
      unresolvedImports,
      contexts: CONTEXTS,
      variables: names,
      rendered,
      $rootMetricsNote:
        "rem 환산 기준. 두 저장소가 네 곳에서 `1rem = 10px`라고 적고 있었으나 배포본의 html은 12px다. 브라우저가 실제 폭을 재서 확정한다.",
      rootMetrics,
      numericExpectations,
    },
    null,
    2,
  ) + "\n";

// 기록된 숫자와 브라우저가 푼 값이 어긋나면 실패한다. 줄 읽기로 적은 수를 브라우저가 반증하는
// 경로이며, 이 게이트의 존재 이유다.
//
// **생성물 대조보다 먼저 둔다.** 순서를 뒤집으면 「아무것도 대조하지 못했다」는 판정이
// 생성물이 낡았다는 판정 뒤에 숨는다 — 재지 못한 게이트가 "값이 다릅니다"라고 말하게 되고,
// 갱신하면 조용히 초록이 된다. 잰 것이 있는지가 먼저다.
const mismatches = [];
const scoped = [];
for (const expectation of numericExpectations) {
  const value = rendered["dark-desktop"][expectation.variable];
  if (!value) {
    // :root에서 풀리지 않았다 = 전역 토큰이 아니다. 요소 스코프가 소유하거나(예:
    // `--profile-avatar-size` 는 Gnb.tsx 가 클래스로 세운다) 제품에서 아예 사라졌다는 뜻이며,
    // 어느 쪽이든 이 변수를 "제품 전역 정본"으로 인용하면 안 된다는 신호다. 하네스가 이 둘을
    // 가르지는 못하므로 "스코프가 소유한다"고 단정하지 않는다.
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

// **대조가 0건이면 초록일 수 없다.** 이 게이트는 스스로 "기록된 숫자를 브라우저가 반증하는
// 경로이며, 이 게이트의 존재 이유"라고 적어 놓고, 2026-09-01 실측에서는 그 대조를 **0건**
// 수행하면서 exit 0 했다(원장 `product-render-zero-comparisons`). 인용을 하나도 대조하지
// 못했다면 재지 않은 것이므로 NOT_MEASURED 다 — 통과가 아니다.
const comparedCount = numericExpectations.length - scoped.length;
if (comparedCount === 0) {
  notMeasured(
    "product-render",
    "브라우저가 대조한 인용이 0건입니다(추출 " + numericExpectations.length + "건 중 " +
      scoped.length + "건이 :root 에서 풀리지 않았습니다). " +
      "product.measured.json 의 인용 형식이 바뀌었거나(추출 정규식), 제품 CSS 를 잇는 " +
      "@import 해석이 깨졌습니다(includeOrder 가 비었는지 보세요).",
  );
}


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

// rem 환산 기준이 문맥마다 갈리면 「4.5rem = N px」라고 한 줄로 적을 수 없다. 갈리면 실패시킨다.
const remBases = new Set(CONTEXTS.map((context) => rootMetrics[context.id].remPx));
if (remBases.size !== 1) {
  console.error(
    "[product-render] rem 환산 기준이 문맥마다 다릅니다: " +
      CONTEXTS.map((c) => c.id + "=" + rootMetrics[c.id].remPx + "px").join(", "),
  );
  process.exit(1);
}
const remPx = [...remBases][0];

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
    " · 이어 붙인 stylesheet " + includeOrder.length + "개(LOUIS @" + louisCommit.slice(0, 8) + ")" +
    " · 기록된 수 " + comparedCount + "건을 브라우저가 확인" +
    " · **1rem = " + remPx + "px** (4.5rem = " + remPx * 4.5 + "px)" +
    (scoped.length > 0 ? " · :root 밖 스코프 " + scoped.length + "건(" + scoped.join(", ") + ")" : "") +
    (varying.length > 0 ? " · 문맥에 따라 갈리는 변수 " + varying.length + "개: " + varying.join(" ") : ""),
);

function git(args) {
  return execFileSync("git", args, { cwd: productRoot, encoding: "utf8", maxBuffer: 64 * 1024 * 1024 });
}
