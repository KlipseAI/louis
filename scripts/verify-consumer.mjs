// 패키지가 **저장소 밖에서 실제로 소비되는가**를 증명한다 (DS-P3-008).
//
// 지금까지의 게이트는 전부 저장소 안을 봤다 — 생성물 drift, 토큰 graph, CSS 저작 규칙, Figma
// parity. 그 전부가 초록이어도 "소비자가 `import { Button } from "@klipse-design/react"`를
// 쓸 수 있는가"는 한 번도 확인된 적이 없다. 이 스크립트가 그 자리다.
//
// 검사하는 것.
//   1. 선언된 export 서브패스가 전부 실제로 resolve된다 (react 3, css 7, tokens 6)
//   2. 공개 이름으로 import한 컴포넌트가 **Node에서 SSR 렌더된다** — import 시점이나 렌더
//      시점에 브라우저 전용 API를 만지면 여기서 죽는다
//   3. 타입 선언이 `.d.ts`로 함께 나온다
//   4. **tree-shaking이 실제로 동작한다** — Button만 쓴 번들에 Dialog가 들어 있으면 안 된다
//
// 4번에는 canary가 붙는다. "Dialog 문자열이 없다"만 보면 탐지 자체가 죽어도 통과하므로,
// Dialog를 실제로 쓰는 번들에서는 그 문자열이 **있어야** 한다는 반대 방향을 함께 증명한다.
import { execFileSync } from "node:child_process";
import { mkdtempSync, rmSync, writeFileSync, existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const failures = [];
const positives = [];

const REACT_SUBPATHS = [".", "./icons", "./icons/manifest.json", "./package.json"];
const CSS_SUBPATHS = [
  "./layers.css", "./tokens.css", "./reset.css",
  "./styles.css", "./styles.layer.css", "./theme.css", "./package.json",
];
const TOKENS_SUBPATHS = [".", "./css", "./json", "./figma", "./manifest", "./package.json"];

// **ESM resolver를 쓴다.** `require.resolve`는 `require` 조건을 찾는데 이 패키지들은
// DS-D-0002에 따라 **ESM 전용**이라 그 조건이 없다 — CJS로 재면 "No exports main defined"가
// 나오고, 그것은 패키지 결함이 아니라 재는 쪽이 틀린 것이다. 소비자도 import로 쓴다.
function resolveAll(pkg, subpaths) {
  for (const sub of subpaths) {
    const spec = sub === "." ? pkg : `${pkg}/${sub.replace(/^\.\//, "")}`;
    try {
      import.meta.resolve(spec);
    } catch (error) {
      failures.push(`${spec}를 resolve하지 못했습니다: ${error.message}`);
    }
  }
}
resolveAll("@klipse-design/react", REACT_SUBPATHS);
resolveAll("@klipse-design/css", CSS_SUBPATHS);
resolveAll("@klipse-design/tokens", TOKENS_SUBPATHS);
positives.push(
  `선언된 서브패스 ${REACT_SUBPATHS.length + CSS_SUBPATHS.length + TOKENS_SUBPATHS.length}개가 전부 resolve됨`,
);

// 타입 선언이 함께 나오는지. 소비자가 TypeScript면 이것이 없으면 any로 떨어진다.
for (const rel of ["packages/react/dist/index.d.ts", "packages/react/dist/icons/generated/index.d.ts"]) {
  if (!existsSync(rel)) failures.push(`타입 선언이 없습니다: ${rel}`);
}
positives.push("공개 진입점의 타입 선언이 존재함");

// **저장소 안에 만든다.** 밖에 두면 Node가 위로 올라가며 node_modules를 찾지 못해
// react-dom과 패키지 자신이 resolve되지 않는다 — 소비자 관점을 재현하려던 것이 오히려
// 아무것도 재현하지 못하게 된다.
const work = mkdtempSync(join(process.cwd(), ".louis-consumer-"));
try {
  // **import 순서 안내가 완전한지 본다.**
  // styles.css는 토큰을 정의하지 않고 생성물끼리 @import하지도 않는다. 그래서 tokens.css를
  // 빼면 오류 없이 색·간격·반경이 전부 무효값이 된다 — 실패가 조용해서 사람이 못 잡는다.
  // 규범이 styles.css import를 안내하면서 tokens.css를 빼먹은 적이 있다(2026-08-18).
  {
    const stylesCss = readFileSync(join(process.cwd(), "packages/css/generated/styles.css"), "utf8");
    // styles.css는 토큰을 정의하지 않는다. 유일한 예외는 base.css의 헤어라인 recipe
    // (--louis-hairline-*)이며, 이는 토큰이 아니라 토큰을 조합하는 foundation custom property다
    // (DS-D-0023). :root 블록이 있으면 그 안의 --louis-* 선언이 recipe allowlist에 드는지 본다 —
    // 색·간격·반경 같은 토큰이 새어들면 tokens.css 없이 styles.css만 import한 소비자에게 조용히
    // 무효가 되므로 실패시킨다.
    const ROOT_RECIPE_ALLOW = /^--louis-hairline-inset(-block-(start|end))?$/;
    for (const block of stylesCss.match(/:root\s*\{[^}]*\}/g) ?? []) {
      const leaked = [...block.matchAll(/(--louis-[a-z0-9-]+)\s*:/g)]
        .map((match) => match[1])
        .filter((name) => !ROOT_RECIPE_ALLOW.test(name));
      if (leaked.length > 0) {
        failures.push(
          `styles.css :root에 토큰이 정의됐습니다: ${leaked.join(", ")}. 토큰은 tokens.css에만 두고 :root에는 헤어라인 recipe(--louis-hairline-*)만 허용된다.`,
        );
      }
    }
    const guides = [
      "packages/css/README.md",
      "packages/react/README.md",
      "design/components/button.md",
      "design/governance/decisions/DS-D-0004-css-authoring.md",
    ];
    for (const guide of guides) {
      let text;
      try {
        text = readFileSync(join(process.cwd(), guide), "utf8");
      } catch {
        continue;
      }
      const mentionsStyles = /styles(\.layer)?\.css/.test(text);
      const mentionsTokens = /tokens\.css/.test(text);
      if (mentionsStyles && !mentionsTokens) {
        failures.push(
          `${guide}: styles.css import를 안내하면서 tokens.css를 빠뜨렸습니다. 그대로 따르면 토큰이 하나도 정의되지 않습니다.`,
        );
      }
    }
    positives.push("CSS import 안내 " + guides.length + "곳이 tokens.css를 함께 적음");
  }

  // SSR. Node에는 window가 없으므로 import/렌더 시점에 브라우저 API를 만지면 여기서 죽는다.
  const ssrEntry = join(work, "ssr.mjs");
  writeFileSync(
    ssrEntry,
    `import { renderToStaticMarkup } from "react-dom/server";
import { createElement as h } from "react";
import { Button, OverlayProvider, Tooltip, Dialog, DialogSurface, DialogTitle, ActionMenu, ActionMenuTrigger, ActionMenuContent } from "@klipse-design/react";

const html = renderToStaticMarkup(h(Button, null, "저장"));
if (!html.includes("louis-button")) throw new Error("Button이 SSR에서 렌더되지 않았습니다");

// **overlay는 심볼 확인으로 충분하지 않다.** 예전에는 OverlayProvider가 서버에서 context를
// null로 넘겨 useOverlayContext가 "Provider 밖"으로 오판해 throw했고, 닫힌 Dialog를 페이지에
// 놓아두기만 해도 Next.js 프리렌더가 죽었다. 그 경로를 실제로 렌더해서 지킨다.
const overlayCases = [
  ["Tooltip", () => h(OverlayProvider, null, h(Tooltip, { content: "설명" }, h("button", null, "열기")))],
  ["Dialog(closed)", () => h(OverlayProvider, null, h(Dialog, { open: false, onOpenChange: () => {} }, h(DialogSurface, null, h(DialogTitle, null, "제목"))))],
  ["Dialog(open)", () => h(OverlayProvider, null, h(Dialog, { open: true, onOpenChange: () => {} }, h(DialogSurface, null, h(DialogTitle, null, "제목"))))],
  ["ActionMenu(closed)", () => h(OverlayProvider, null, h(ActionMenu, { open: false, onOpenChange: () => {} }, h(ActionMenuTrigger, null, "메뉴"), h(ActionMenuContent, null)))],
];
for (const [name, make] of overlayCases) {
  try {
    renderToStaticMarkup(make());
  } catch (error) {
    throw new Error(name + "이 SSR에서 예외를 던졌습니다: " + String(error.message).slice(0, 120));
  }
}

// 반대 방향도 계약이다 — Provider 밖에서는 던져야 한다. 안 던지면 host를 컴포넌트가 고르게 된다.
let threwOutsideProvider = false;
try {
  renderToStaticMarkup(h(Tooltip, { content: "설명" }, h("button", null, "열기")));
} catch {
  threwOutsideProvider = true;
}
if (!threwOutsideProvider) throw new Error("OverlayProvider 밖에서 Tooltip이 던지지 않았습니다");

process.stdout.write(html);
`,
  );
  try {
    const out = execFileSync(process.execPath, [ssrEntry], { cwd: process.cwd(), encoding: "utf8" });
    if (!out.includes("louis-button")) failures.push("SSR 출력에 Button 클래스가 없습니다.");
    positives.push("Node SSR: Button · Tooltip · Dialog(열림/닫힘) · ActionMenu가 렌더되고, Provider 밖에서는 던진다");
  } catch (error) {
    failures.push(`SSR 소비가 실패했습니다: ${String(error.stderr ?? error.message).slice(0, 400)}`);
  }

  // tree-shaking. **esbuild는 명시적 devDependency다.**
  // 원래는 「vitest가 이미 가져온 의존성이니 새로 넣지 않는다」였다. 틀렸다 — pnpm은 전이
  // 의존성의 bin을 루트 `.bin`으로 호이스트하지 않는다. 내 노트북에서 통과한 건 8/18 설치
  // 때 남은 낡은 심볼릭 링크 때문이었고(`node_modules/esbuild` 패키지는 없었다), clean
  // checkout인 CI에서는 2026-08-22에 여기서 죽었다. 의존성 한 줄을 아끼는 대신 재현성을
  // 잃은 거래였다.
  const esbuild = join(process.cwd(), "node_modules", ".bin", "esbuild");
  if (!existsSync(esbuild)) {
    failures.push("esbuild bin을 찾지 못했습니다. tree-shaking 검사를 건너뛰지 않고 실패로 둔다.");
    throw new Error("esbuild 없음");
  }
  const bundle = (source, name) => {
    const entry = join(work, `${name}.mjs`);
    writeFileSync(entry, source);
    return execFileSync(
      esbuild,
      [entry, "--bundle", "--format=esm", "--minify", "--platform=browser",
       "--external:react", "--external:react-dom", "--external:react/jsx-runtime"],
      { cwd: process.cwd(), encoding: "utf8", maxBuffer: 32 * 1024 * 1024 },
    );
  };
  const MARKER = "louis-dialog__surface";
  const onlyButton = bundle(
    `import { Button } from "@klipse-design/react";\nconsole.log(Button);\n`, "only-button");
  const withDialog = bundle(
    `import { Button, DialogSurface } from "@klipse-design/react";\nconsole.log(Button, DialogSurface);\n`, "with-dialog");

  if (onlyButton.includes(MARKER)) {
    failures.push(`tree-shaking이 동작하지 않습니다 — Button만 쓴 번들에 ${MARKER}가 있습니다.`);
  }
  // canary. 탐지가 죽어 있으면 이쪽도 통과해 버리므로 반대 방향을 함께 증명한다.
  if (!withDialog.includes(MARKER)) {
    failures.push(
      `tree-shaking canary가 검출력을 증명하지 못했습니다 — Dialog를 쓴 번들에도 ${MARKER}가 없습니다.`,
    );
  }
  positives.push(
    `production 번들에서 tree-shaking 동작 (Button만: ${Math.round(onlyButton.length / 1024)}KB, Dialog 포함: ${Math.round(withDialog.length / 1024)}KB)`,
  );
} finally {
  rmSync(work, { recursive: true, force: true });
}


// ── release dry-run ─────────────────────────────────────────────────────────
// 실제로 publish하지 않고 **무엇이 담기는지**만 본다. `files` 필드가 틀리면 dist가 빠진 채
// 올라가거나 source·test가 함께 올라간다 — 둘 다 publish 뒤에야 드러나는 종류다.
const PACK_CONTRACT = {
  "packages/tokens": { must: ["generated/tokens.css", "generated/index.js", "generated/index.d.ts"], mustNot: ["src/", "test/", "baseline/"] },
  "packages/css": { must: ["generated/styles.css", "generated/tokens.css", "generated/layers.css"], mustNot: ["src/", "test/"] },
  "packages/react": { must: ["dist/index.js", "dist/index.d.ts", "THIRD-PARTY-NOTICES.md"], mustNot: ["src/", "test/", "tsconfig"] },
};
for (const [dir, contract] of Object.entries(PACK_CONTRACT)) {
  let listed;
  try {
    const raw = execFileSync("npm", ["pack", "--dry-run", "--json"], { cwd: dir, encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] });
    listed = JSON.parse(raw)[0].files.map((f) => f.path);
  } catch (error) {
    failures.push(`${dir}: pack dry-run이 실패했습니다: ${String(error.message).slice(0, 200)}`);
    continue;
  }
  for (const need of contract.must) {
    if (!listed.some((f) => f === need || f.startsWith(need))) {
      failures.push(`${dir}: 배포물에 ${need}가 없습니다.`);
    }
  }
  for (const banned of contract.mustNot) {
    const hit = listed.find((f) => f.startsWith(banned));
    if (hit !== undefined) failures.push(`${dir}: 배포물에 들어가면 안 되는 ${hit}가 있습니다.`);
  }
}
positives.push("release dry-run 3패키지 (담길 것 확인, 금지 경로 없음)");

// ── 공개 API 표면 ───────────────────────────────────────────────────────────
// 심볼이 사라지거나 이름이 바뀌면 breaking이다. 토큰 baseline과 같은 규율로 고정한다 —
// 이 파일을 갱신하는 변경 단위에는 Updates의 migration note가 함께 있어야 한다.
{
  const dts = readFileSync("packages/react/dist/index.d.ts", "utf8");
  const values = new Set(), types = new Set();
  for (const m of dts.matchAll(/export\s+(type\s+)?\{([^}]*)\}/gs)) {
    for (const raw of m[2].split(",")) {
      const name = raw.trim().split(" as ").pop().trim();
      if (name) (m[1] ? types : values).add(name);
    }
  }
  const base = JSON.parse(readFileSync("packages/react/api-surface.json", "utf8"));
  const diff = (actual, declared, label) => {
    const removed = declared.filter((x) => !actual.has(x));
    const added = [...actual].filter((x) => !declared.includes(x));
    if (removed.length > 0) failures.push(`공개 ${label}이 사라졌습니다(breaking): ${removed.join(", ")}`);
    if (added.length > 0) failures.push(`공개 ${label}이 baseline에 없습니다(additive): ${added.join(", ")} \u2014 api-surface.json을 Updates와 같은 변경 단위에서 갱신한다.`);
  };
  diff(values, base.values, "심볼");
  diff(types, base.types, "타입");
  positives.push(`공개 API 표면 대조 (심볼 ${base.values.length} \u00b7 타입 ${base.types.length})`);
}

for (const failure of failures) console.error(`[consumer] ${failure}`);
if (failures.length > 0) {
  console.error(`[consumer] 실패 ${failures.length}건`);
  process.exit(1);
}
console.log(`[consumer] OK (${positives.join(", ")})`);
