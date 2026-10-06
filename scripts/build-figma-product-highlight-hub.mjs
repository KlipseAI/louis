import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { atomicWriteBatch } from "./lib/atomic-output.mjs";

// Highlight hub(`/highlight` 앱 화면)의 5열 카드 그리드 Auto Layout 구조를 생성물로 고정한다.
// 이 구조는 라이브(정본 파일)에서 한 번 손으로 복구됐지만 생성기가 없어 재빌드 시 재현되지 않았다.
// 여기서 만드는 renderer는 install node id로 프레임을 찾아 layout 속성만 멱등적으로 다시 박는다
// (파괴적 재생성이 아니라 reconcile) — 이미 올바른 라이브에 돌려도 no-op이다.
//
// **계산된 크기는 굳히지 않는다(2026-09-14).** 예전 이 생성기는 main 카드 1628 · 뷰포트 1003 · y 53 · 업로드
// y 908 을 리터럴로 들고, 가드는 리터럴끼리(`bodyWidth !== 1596` · `cardSide !== 314.4`) 비교해 초록인 채
// 틀렸다 — 앵커 `094c336b` 에서 main 카드가 1632×1064 가 됐고, 우 패딩은 16 이 아니라
// `--app-gnb-main-inline-padding-end`(8) 이며, `6f6282c1` 에서 상단 바가 낮아졌는데 한 곳도 울리지 않았다.
// 이제 계획은 제품이 고른 값(선언 인용)과 원장의 측정만 싣고, 렌더러는 격자 폭 · 카드 한 변 · 뷰포트 높이를
// **라이브 프레임에서** 계산한다:
//   main 카드 · 사이드바 폭 · 본문 좌/우 인셋 — `migration/product.sidebar-states.json`(펼침 상태 측정)
//   상단 바                                    — HUG 인스턴스. 뷰포트는 그 바로 아래를 채운다
//   격자 열 수 · 간격 · 섹션 여백              — 선언 인용(아래 sourceEvidence)
//   업로드 카드 400×140 · bottom 20 · 가운데   — 선언 인용. 좌표는 원장 main 카드와 뷰포트에서 푼다
//
// 인용 좌표는 `migration/product-evidence.lock.json` 의 `productCommit` 기준이다. 형제 생성기
// 일곱은 각자의 측정 생성물(`product.auth-fixture.json` 등)에서 커밋을 읽는데, 그쪽이 맞다 —
// 그 생성기들은 측정된 rect 와 인용을 짝지으므로 커밋을 올리려면 재측정이 먼저다. 이 생성기는
// 측정이 없고 **소스에서만** 파생하므로 짝지을 측정이 없고, 따라서 저장소가 아는 최신 제품
// 커밋(lock)을 따라가는 것이 맞다. 그래서 제품이 값을 바꾸면 여기만 빨개진다 — 의도한 동작이다.
const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const lockPath = resolve(repoRoot, "migration/product-evidence.lock.json");
const planPath = resolve(repoRoot, "figma/product-highlight-hub.plan.json");
const drawPath = resolve(repoRoot, "figma/product-highlight-hub.draw.js");
const templatePath = resolve(repoRoot, "scripts/templates/figma-product-highlight-hub-renderer.js");
const productRoot = process.env.KLIPSE_PRODUCT_REPO ?? "/Users/sejunki/klipse-web";
const checkOnly = process.argv.includes("--check");
const fail = (message) => { throw new Error(`[figma-product-highlight-hub] ${message}`); };
const commit = JSON.parse(readFileSync(lockPath, "utf8")).productCommit;
const ledger = JSON.parse(readFileSync(resolve(repoRoot, "migration/product.sidebar-states.json"), "utf8"));
if (ledger.productCommit !== commit) fail(`migration/product.sidebar-states.json (${ledger.productCommit.slice(0, 8)}) is not at the lock anchor`);
const appShell = JSON.parse(readFileSync(resolve(repoRoot, "figma/product-app-shell.plan.json"), "utf8"));
if (appShell.productCommit !== commit) fail("figma/product-app-shell.plan.json is not at the lock anchor — run build-figma-product-app-shell first");

const sourceQuote = (path, line, expected) => {
  // 근거 문자열에는 기계마다 다른 절대경로를 적지 않는다 — 적으면 check 가 KLIPSE_PRODUCT_REPO 철자에 따라 갈린다.
  const command = `git -C "$KLIPSE_PRODUCT_REPO" show ${commit}:${path}`;
  const source = execFileSync("git", ["-C", productRoot, "show", `${commit}:${path}`], {
    encoding: "utf8",
    maxBuffer: 32 * 1024 * 1024,
  });
  const quote = source.split("\n")[line - 1] ?? "";
  if (quote !== expected) fail(`source quote drift ${path}:${line}: ${JSON.stringify(quote)}`);
  return { command, path, line, quote };
};

const HIGHLIGHT = "apps/web/components/scenes/highlightSceneStyles.ts";

const expanded = ledger.states.expanded;
const measuredPx = (name) => {
  const match = /^(\d+(?:\.\d+)?)px$/.exec(expanded.customProperties?.[name] ?? "");
  if (!match) fail(`measured ${name} is not a px length: ${JSON.stringify(expanded.customProperties?.[name])}`);
  return Number(match[1]);
};
const declared = (quote, pattern, what) => {
  const match = pattern.exec(quote.quote);
  if (!match) fail(`declared ${what} not found in ${quote.path}:${quote.line}`);
  return Number(match[1]);
};
// `historyGrid` 의 `"gap-layout-project-grid-gap"` = `--louis-layout-project-grid-gap` = 6px.
// **2026-09-03 재고정에서 4 → 6 으로 바뀌었다.** 제품이 `"gap-2"`(= `--spacing: 2px` × 2 = 4px)
// 리터럴을 버리고 LOUIS 이름을 물었다 — 앱의 프로젝트 격자 넷이 같은 이름을 참조한다
// (`NodeCanvasHomeScene.tsx:232` · `VideoEditScene.tsx:219` · `appHomeSceneStyles.ts:102` ·
// 여기). 값이 커진 것이 아니라 **소유자가 옮겨 가며 6 으로 통일됐다.**
// **리터럴로 둔다.** 이 저장소는 생성기 안에서 Tailwind 를 재구현하지 않기로 이미 정했다 —
// 유틸리티 정렬 순서·`@layer`·`--spacing` 같은 테마 변수·임의값 이스케이프를 전부 흉내내야 하고
// 제품이 클래스를 바꾸면 조용히 틀린다(`scripts/lib/declared-styles.mjs` ·
// `scripts/lib/sizing-provenance.mjs` 의 판정). 클래스→px 해석이 필요한 축은 CDP 실측으로 가고,
// 여기처럼 값 하나면 아래 sourceEvidence 의 클래스 인용이 드리프트를 잡는다 — 실제로 그렇게 잡혔다.
const gridGap = 6;
const sourceEvidence = [
  // historyGrid(`styles.historyGrid`, 763~771행) — 같은 문자열이 clipGrid(241~254행)에도 있어
  // 블록 시작(`historyGrid: [`)에서 센 오프셋으로 자리를 판정했다.
  sourceQuote(HIGHLIGHT, 765, '    \"[display:grid]\",'),
  sourceQuote(HIGHLIGHT, 767, '    \"gap-layout-project-grid-gap\",'),
  sourceQuote(HIGHLIGHT, 770, '    \"min-[1800px]:[grid-template-columns:repeat(5,_1fr)]\",'),
  // historySection(980~986행) — `"[width:100%]"` 는 파일에 26번 나오지만, 바로 뒤 두 줄
  // (`margin:40px_auto_0` · `padding-bottom:200px`)이 이 블록에만 있어 셋이 한 덩어리다.
  sourceQuote(HIGHLIGHT, 982, '    \"[width:100%]\",'),
  sourceQuote(HIGHLIGHT, 984, '    \"[margin:40px_auto_0]\",'),
  sourceQuote(HIGHLIGHT, 985, '    \"[padding-bottom:200px]\",'),
  // historySectionEyebrow(988~994행) — viewport Auto Layout 의 itemSpacing 근거.
  sourceQuote(HIGHLIGHT, 990, '    \"[margin:0_0_12px]\",'),
  // historySectionEyebrowCount(996~1000행) — clipCountValue(63~67행)에도 같은 줄이 있으나
  // 이쪽만 historySectionEyebrow 바로 다음 블록이다.
  sourceQuote(HIGHLIGHT, 999, '    \"[margin-left:6px]\",'),
  // uploadCardCompact(2071~2088행).
  sourceQuote(HIGHLIGHT, 2078, '    \"[&:not(.tw-hs-188)]:[width:400px]!\",'),
  sourceQuote(HIGHLIGHT, 2080, '    \"[&:not(.tw-hs-188)]:[height:140px]!\",'),
  sourceQuote(HIGHLIGHT, 2082, '    \"[padding:8px]!\",'),
  sourceQuote(HIGHLIGHT, 2083, '    \"[gap:8px]!\",'),
  // 제품이 이 값을 LOUIS 로 넘겼다(`ae8fd627`) — 20px 은 그대로이고 소유자만 바뀌었다.
  // `--louis-radius-card-lg: 20px`(tokens.css:568). 리터럴을 계속 인용하면 채택 사실이 지워진다.
  sourceQuote(HIGHLIGHT, 2084, '    \"[border-radius:var(--louis-radius-card-lg)]!\",'),
  ];
// 허브 스크롤 영역(`main`)의 좌/우 패딩 — 좌 인셋과 우 `-end` 가 다른 토큰이다(값은 원장이 잰다).
const MAIN_PADDING = [
  sourceQuote(HIGHLIGHT, 1027, '    "[padding-left:var(--app-gnb-main-inline-padding)]",'),
  sourceQuote(HIGHLIGHT, 1028, '    "[padding-right:var(--app-gnb-main-inline-padding-end)]",'),
];
// 업로드 카드는 뷰포트에 고정된다 — 사이드바 오른쪽 영역의 가운데, 바닥에서 20.
const UPLOAD_POSITION = [
  sourceQuote(HIGHLIGHT, 2071, "  uploadCardCompact: ["),
  sourceQuote(HIGHLIGHT, 2073, '    "[&:not(.tw-hs-188)]:[position:fixed]!",'),
  sourceQuote(HIGHLIGHT, 2074, '    "[bottom:20px]",'),
  sourceQuote(HIGHLIGHT, 2075, '    "[left:var(--app-gnb-sidebar-width,_0px)]",'),
  sourceQuote(HIGHLIGHT, 2076, '    "[right:0]",'),
  sourceQuote(HIGHLIGHT, 2077, '    "[margin:0_auto]",'),
];
const at = (line) => sourceEvidence.find((entry) => entry.line === line) ?? fail(`missing quote ${HIGHLIGHT}:${line}`);
const columns = declared(at(770), /repeat\((\d+),_1fr\)/, "grid columns");
const sectionTop = declared(at(984), /\[margin:(\d+)px_auto_0\]/, "section margin-top");
const sectionBottom = declared(at(985), /\[padding-bottom:(\d+)px\]/, "section padding-bottom");
const headingGap = declared(at(990), /\[margin:0_0_(\d+)px\]/, "eyebrow margin-bottom");
const headingCountGap = declared(at(999), /\[margin-left:(\d+)px\]/, "eyebrow count margin-left");
const uploadWidth = declared(at(2078), /\[width:(\d+)px\]/, "upload width");
const uploadHeight = declared(at(2080), /\[height:(\d+)px\]/, "upload height");
const uploadPadding = declared(at(2082), /\[padding:(\d+)px\]/, "upload padding");
const uploadGap = declared(at(2083), /\[gap:(\d+)px\]/, "upload gap");
const uploadBottom = declared(UPLOAD_POSITION[2], /\[bottom:(\d+)px\]/, "upload bottom");
// 5열은 `min-[1800px]` 에서다 — 원장 뷰포트가 그 폭 이상이어야 이 열 수를 쓸 수 있다.
const breakpoint = declared(at(770), /min-\[(\d+)px\]/, "grid breakpoint");
if (ledger.context.viewport.width < breakpoint) fail(`ledger viewport ${ledger.context.viewport.width} is below the ${breakpoint}px ${columns}-column breakpoint`);
const mainCard = expanded.mainRect;
const inlineStart = measuredPx("--app-gnb-main-inline-padding");
const inlineEnd = measuredPx("--app-gnb-main-inline-padding-end");
const [desktopTopBar] = appShell.component.desktopTopBar.variants;
// 계획에 참고로만 싣는 파생값 — 렌더러는 이 수로 크기를 박지 않는다(라이브 프레임에서 다시 계산한다).
const derived = {
  $why: "Reference only. The runner reads the live main card, top bar instance and grid width; these are what the ledger formula gives at the measured viewport.",
  viewport: { width: mainCard.width, height: mainCard.height - desktopTopBar.rect.height },
  gridWidth: mainCard.width - inlineStart - inlineEnd,
  cardSide: (mainCard.width - inlineStart - inlineEnd - gridGap * (columns - 1)) / columns,
};
// 업로드 카드 좌표 — 뷰포트 기준(사이드바 오른쪽 영역 가운데 · 바닥 20)을 main 카드 기준으로 옮긴다.
const upload = {
  width: uploadWidth,
  height: uploadHeight,
  x: expanded.sidebarRect.width + (ledger.context.viewport.width - expanded.sidebarRect.width - uploadWidth) / 2 - mainCard.x,
  y: ledger.context.viewport.height - uploadBottom - uploadHeight - mainCard.y,
  constraints: { horizontal: "CENTER", vertical: "MAX" },
  // `--louis-radius-card-lg` 20(인용 :2071 — 값은 LOUIS tokens.css 가 갖는다). 크기 축이 아니다.
  radius: 20,
  padding: uploadPadding,
  gap: uploadGap,
};
const plan = {
  $comment: "Generated by scripts/build-figma-product-highlight-hub.mjs. Do not edit by hand.",
  $evidenceClass: "product-only measured Figma scene repair; /highlight desktop hub 5-column card grid",
  productCommit: commit,
  context: { id: ledger.context.id, route: "/highlight", viewport: ledger.context.viewport },
  sourceEvidence,
  figma: {
    // 정본 파일 OlYKERKOkgbxBEEoXGZW2c. install id로 찾아 reconcile한다.
    screenId: "29:3",
    viewportId: "498:36",
    headingId: "498:37",
    gridId: "498:38",
    cardIds: ["29:19", "29:24", "29:29", "29:34", "29:39"],
    uploadId: "134:588",
    names: {
      viewport: "history viewport · product Auto Layout",
      heading: "history heading · Auto Layout",
      grid: "history grid · 5 columns · Auto Layout wrap",
    },
  },
  mainPaddingEvidence: MAIN_PADDING,
  uploadPositionEvidence: UPLOAD_POSITION,
  layout: {
    viewport: { mode: "VERTICAL", padding: [sectionTop, inlineEnd, sectionBottom, inlineStart], gap: headingGap, sizing: "FILL main card below the top bar" },
    heading: { mode: "HORIZONTAL", gap: headingCountGap, sizing: "FILL width · HUG height" },
    grid: { mode: "HORIZONTAL", wrap: true, gap: gridGap, crossGap: gridGap, columns, sizing: "FILL width · HUG height" },
    card: { sizing: "square side = (grid width - gap * (columns - 1)) / columns, from the live grid" },
    upload,
  },
  derived,
};

const runnerPlan = structuredClone(plan);
for (const key of ["sourceEvidence", "mainPaddingEvidence", "uploadPositionEvidence"]) {
  runnerPlan[key] = plan[key].map(({ path, line, quote }) => ({ path, line, quote }));
}
const draw = `// Generated by scripts/build-figma-product-highlight-hub.mjs. Do not edit by hand.\nconst PLAN=${JSON.stringify(runnerPlan)};\n${readFileSync(templatePath, "utf8")}`;
const outputs = [
  { absolute: planPath, expected: `${JSON.stringify(plan, null, 2)}\n` },
  { absolute: drawPath, expected: draw },
];
if (checkOnly) {
  for (const output of outputs) {
    if (readFileSync(output.absolute, "utf8") !== output.expected) fail(`generated output drift: ${output.absolute.slice(repoRoot.length + 1)}`);
  }
} else {
  atomicWriteBatch(outputs);
}
console.log(`[figma-product-highlight-hub] ${checkOnly ? "checked" : "built"} @ ${commit.slice(0, 8)}: ${columns}-column grid · card ${derived.cardSide} · grid ${derived.gridWidth} (derived at the ledger viewport; the runner re-derives from live frames)`);
