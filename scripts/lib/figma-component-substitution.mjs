/**
 * **측정 서브트리를 이미 있는 컴포넌트 인스턴스로 치환한다 (screen-application 계층).**
 *
 * 측정 트리를 그대로 그리면 셸과 본문 블록이 화면마다 **도형으로 다시 그려진다**. 그러면 로고·아이콘·
 * 색·타이포가 전부 빠진 회색 상자가 24화면에 24벌 생기고, 한 번 고쳐도 어디에도 전파되지 않는다.
 * 반복되는 것은 인스턴스여야 한다.
 *
 * **LOUIS에는 이미 완성된 컴포넌트가 있다.** 새로 만들지 않는다 — 있는 것에 붙인다.
 * 셸(사이드바·상단 바)뿐 아니라 결제 결과/체크아웃 상태 본문과 요금제 카드까지 이미 컴포넌트다.
 *
 * ## 판정은 측정값으로 한다 — 라우트 이름으로 찍지 않는다
 * - 셸: 구조와 선언(폭을 `var(--app-gnb-sidebar-width)` 로 선언한 절대 배치 header / 앞머리 버튼 · breadcrumb nav ·
 *   프로필 버튼을 직접 품은 행)으로 찾는다. 사이드바 폭 · 상단 바 높이 수는 판정에 쓰지 않는다(`SIDEBAR_WIDTH_DECLARATION` ·
 *   `isTopBarRow`).
 * - 본문 블록: **글자 서열 · 구조 서명(직계 자식별 글자 수) · 뷰포트가 모두 같을 때만** 치환한다(크기는 보지 않는다 —
 *   `CONTENT_COMPONENTS` 주석). 글자 하나만 달라도 다른 화면이므로 치환하지 않는다.
 *
 * ## 없는 variant는 만들지 않는다
 * 컴포넌트 세트에 없는 조합이 나오면 치환하지 않고 측정 도형을 남기고 `skipped`로 돌린다.
 * 억지로 비슷한 variant를 끼우면 제품과 다른 화면이 된다.
 */
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const readPlan = (relative) => JSON.parse(readFileSync(resolve(repoRoot, relative), "utf8"));

/** 라이브 컴포넌트 세트 이름. 렌더러가 이 이름으로 파일에서 찾는다. */
export const COMPONENT_SETS = Object.freeze({
  sidebar: "Product/Gnb Desktop Shell",
  desktopTopBar: "Product/Desktop App Top Bar",
  mobileTopBar: "Product/Mobile App Top Bar",
  paymentResult: "Product/Payment Result Content",
  checkoutStatus: "Product/Checkout Status Content",
  upgradePlanCard: "Product/Upgrade Plan Card",
  upgradePlanCardSlice: "Product/Upgrade Plan Card Visible Slice",
  pricingNotice: "Product/Pricing Notice",
});

/**
 * **셸 세트의 variant 목록은 그 세트를 짓는 생성기의 plan 에서 읽는다(2026-09-13).**
 *
 * 예전에는 여기 손 사본(2026-08-26 LOUIS 실측)이 있었다. 앱 셸 생성기가 조합을 넷 더하자 사본은
 * 그대로 낡았다 — 세트에는 생길 조합을 치환은 「세트에 없다」로 보류했을 것이다. 두 벌은 반드시
 * 어긋나므로 사본을 걷고 plan 을 읽는다:
 *   · 상단 바 둘 — `figma/product-app-shell.plan.json` 의 **측정** variant(`variants[].name`).
 *     `preservedVariants`(Divider=Off 둘)는 넣지 않는다. 라이브 legacy 인스턴스를 위해 세트에
 *     남겨 둔 것이지 제품 출처가 없어서, 화면이 그 조합으로 치환될 일은 없어야 한다.
 *   · 사이드바 — `figma/product-components.plan.json` 의 `component.shell.variants[].current`.
 * 여기 없는 조합은 치환하지 않는다. plan 이 라이브보다 앞서 있으면 렌더러가 적용 시점에 던진다
 * (앱 셸 러너를 먼저 돌려 세트에 조합을 더해야 한다 — 인계서의 적용 순서).
 */
const APP_SHELL_PLAN = readPlan("figma/product-app-shell.plan.json");
const COMPONENTS_PLAN = readPlan("figma/product-components.plan.json");
const TOP_BAR_PLANS = Object.freeze({
  [COMPONENT_SETS.mobileTopBar]: APP_SHELL_PLAN.component,
  [COMPONENT_SETS.desktopTopBar]: APP_SHELL_PLAN.component.desktopTopBar,
});
for (const [set, entry] of Object.entries(TOP_BAR_PLANS)) {
  if (entry?.componentSetName !== set || !Array.isArray(entry.variants) || !Array.isArray(entry.textProperties)) {
    throw new Error(`[figma-app-screens] figma/product-app-shell.plan.json 에 ${set} 의 variants·textProperties 가 없습니다.`);
  }
  for (const variant of entry.variants) {
    if (typeof variant.name !== "string") {
      throw new Error(`[figma-app-screens] ${set} 의 variant 에 name 이 없습니다 — build-figma-product-app-shell 을 다시 도세요.`);
    }
  }
}
if (COMPONENTS_PLAN.component?.shell?.componentSetName !== COMPONENT_SETS.sidebar) {
  throw new Error(`[figma-app-screens] figma/product-components.plan.json 의 shell 세트 이름이 ${COMPONENT_SETS.sidebar} 가 아닙니다.`);
}
const VARIANTS = Object.freeze({
  [COMPONENT_SETS.sidebar]: COMPONENTS_PLAN.component.shell.variants.map((variant) => `Current=${variant.current}`),
  [COMPONENT_SETS.desktopTopBar]: TOP_BAR_PLANS[COMPONENT_SETS.desktopTopBar].variants.map((variant) => variant.name),
  [COMPONENT_SETS.mobileTopBar]: TOP_BAR_PLANS[COMPONENT_SETS.mobileTopBar].variants.map((variant) => variant.name),
});

/**
 * **본문 블록 컴포넌트 색인 — 그 세트를 짓는 생성기의 plan 에서 읽는다(2026-09-14, 크기 굳힘 감사 묶음 2).**
 *
 * 결제 결과 · 체크아웃 상태 본문과 요금제 카드는 이미 컴포넌트다. 다시 그리지 않고 인스턴스를 심는다.
 *
 * 예전에는 여기 손 사본(2026-08-26 LOUIS 실측)이 있었다 — variant 마다 **크기**와 글자 목록을 적고, 측정 서브트리가
 * 「글자가 같고 rect 가 1px 이내」일 때만 치환했다. 크기는 제품이 선언한 값이 아니라 레이아웃이 계산한 값이라(본문
 * 높이는 줄 수가, 모바일 폭은 셸 인셋이 정한다) 앵커가 움직일 때마다 조용히 낡았고, 실패는 `skipped` 에도 남지 않았다.
 * 2026-09-14 감사 시점에 결과 · 체크아웃 보드 14장이 한 장도 인스턴스를 받지 못하고 날노드로 그려지고 있었다(모바일
 * 폭 370 → 390, 본문 높이 238 → 229.59 …). 요금제 카드 여섯 항목도 넷이던 때의 사본이라 한 자리도 물지 않았다.
 *
 * 그래서 사본을 걷고 세트를 짓는 plan 을 읽는다. 판정은 크기가 아니라 **글자 서열 + 구조 서명 + 뷰포트**다:
 *   · 글자 서열 — 서브트리의 글자를 문서 순서대로 모은 목록이 variant 의 목록과 글자 그대로 같다.
 *   · 구조 서명 — 직계 자식마다 품은 글자 수의 목록(글자 없는 자식은 뺀다). 제목 · 본문 · 목록 · 버튼 줄처럼 plan 의
 *     구획과 1:1 이라, 글자가 같아도 구획이 다르면(래퍼 · 조상 · 다른 배치) 치환하지 않는다. 한 자식짜리 래퍼가 접혀도
 *     글자 수는 그대로라 측정 트리의 접힘에 흔들리지 않는다.
 *   · 뷰포트 — 데스크톱 · 모바일 variant 는 글자가 같다. 화면 문맥이 고른다.
 * 글자는 같은데 구조나 뷰포트가 맞지 않고, 그 아래 어디에서도 같은 세트가 치환되지 않았으면 `skipped` 에 사유를 남긴다 —
 * 「조용히 날노드」가 다시 생기지 않게 한다.
 */
const PAYMENT_PLAN = COMPONENTS_PLAN.component.paymentResult;
const CHECKOUT_PLAN = readPlan("figma/product-checkout-status.plan.json");
const UPGRADE_PLAN = readPlan("figma/product-upgrade-scene.plan.json");
const cardTexts = (card) => card.sections.flatMap((section) => [
  ...(section.texts ?? []).map((text) => text.text),
  ...(section.items ?? []).map((item) => item.text.text),
]);
const cardStructure = (card) => [
  ...card.sections.map((section) => (section.texts ?? section.items).length),
  ...(card.action ? [1] : []),
];
export const CONTENT_COMPONENTS = Object.freeze([
  ...PAYMENT_PLAN.variants.map((variant) => ({
    set: PAYMENT_PLAN.componentSetName,
    variant: `Outcome=${variant.outcome}, Viewport=${variant.viewport}`,
    viewport: variant.viewport,
    texts: [variant.title.text, variant.body.text, ...(variant.detail ? [variant.detail.term.text, variant.detail.value.text] : []), variant.action.label.text],
    structure: [1, 1, ...(variant.detail ? [2] : []), 1],
  })),
  ...CHECKOUT_PLAN.component.variants.map((variant) => ({
    set: CHECKOUT_PLAN.component.contentSetName,
    variant: `Outcome=${variant.outcome}, Viewport=${variant.viewport}`,
    viewport: variant.viewport,
    texts: [
      variant.title.text, variant.body.text,
      ...(variant.alert ? [variant.alert.text] : variant.details.rows.flatMap((row) => [row.term.text, row.value.text])),
      ...variant.actionGroup.actions.map((action) => action.text),
    ],
    structure: [1, 1, variant.alert ? 1 : variant.details.rows.length * 2, variant.actionGroup.actions.length],
  })),
  ...UPGRADE_PLAN.component.cards.map((card) => ({
    set: UPGRADE_PLAN.component.cardSetName,
    variant: `Plan=${card.plan}, Viewport=Desktop`,
    viewport: "Desktop",
    texts: [...cardTexts(card), ...(card.action ? [card.action.label.text] : [])],
    structure: cardStructure(card),
  })),
  ...UPGRADE_PLAN.component.mobile.cards.map((card) => ({
    set: UPGRADE_PLAN.component.mobileVisibleCardSetName,
    variant: `Plan=${card.plan}, Evidence=VisibleSlice`,
    viewport: "Mobile",
    texts: [...cardTexts(card), ...(card.action ? [card.action.label.text] : [])],
    structure: cardStructure(card),
  })),
  // 「진행 중 이벤트 알약」(제품 `PricingNotice`) — 점(글자 없음) · 글자 하나라 구조 서명은 [1] 이다(2026-09-26).
  ...[["Desktop", UPGRADE_PLAN.component], ["Mobile", UPGRADE_PLAN.component.mobile]].map(([viewport, surface]) => ({
    set: COMPONENT_SETS.pricingNotice,
    variant: `Viewport=${viewport}`,
    viewport,
    texts: [surface.main.headerNotice.text],
    structure: [1],
  })),
].map((entry) => Object.freeze({ ...entry, texts: entry.texts.map((text) => String(text ?? "").trim()) })));
for (const plan of [COMPONENTS_PLAN, CHECKOUT_PLAN, UPGRADE_PLAN]) {
  if (plan.productCommit !== APP_SHELL_PLAN.productCommit) {
    throw new Error(`[figma-app-screens] 본문 세트 plan 의 앵커(${String(plan.productCommit).slice(0, 8)})가 앱 셸 plan 과 다릅니다 — 생성기를 같은 앵커에서 다시 도세요.`);
  }
}
if (COMPONENT_SETS.paymentResult !== PAYMENT_PLAN.componentSetName || COMPONENT_SETS.checkoutStatus !== CHECKOUT_PLAN.component.contentSetName ||
  COMPONENT_SETS.upgradePlanCard !== UPGRADE_PLAN.component.cardSetName || COMPONENT_SETS.upgradePlanCardSlice !== UPGRADE_PLAN.component.mobileVisibleCardSetName ||
  COMPONENT_SETS.pricingNotice !== UPGRADE_PLAN.component.noticeSetName) {
  throw new Error("[figma-app-screens] COMPONENT_SETS 의 본문 세트 이름이 생성기 plan 과 다릅니다.");
}

/**
 * breadcrumb 첫 라벨 → 데스크톱 상단 바의 `Content` 축. 앱 셸 plan 의 측정 variant 에서 읽는다 —
 * 그 생성기가 `Content` 값과 측정 첫 라벨이 같은지 이미 확인한다(`CONTENT_LABEL`). 손 사본에는
 * `Highlight` 가 없어 highlight 데스크톱 여섯이 「variant 축을 판정하지 못했다」로 날노드였다.
 */
const CONTENT_BY_LABEL = (() => {
  const table = {};
  for (const variant of TOP_BAR_PLANS[COMPONENT_SETS.desktopTopBar].variants) {
    const label = variant.text?.[0]?.text;
    if (!label || !variant.content) throw new Error(`[figma-app-screens] 데스크톱 상단 바 variant 에 첫 라벨·Content 가 없습니다: ${variant.name}`);
    if (table[label] && table[label] !== variant.content) {
      throw new Error(`[figma-app-screens] 라벨 ${label} 이 Content ${table[label]} 와 ${variant.content} 둘로 갈립니다.`);
    }
    table[label] = variant.content;
  }
  return Object.freeze(table);
})();

/**
 * **사이드바 활성 항목은 제품이 `<Gnb currentPath>` 로 정한다(앵커 6fbdac16).** 화면 route 가
 * 아니라 그 화면이 넘기는 `currentPath` 가 기준이라, route 이름만 보고 적은 옛 표는 두 번 틀렸다:
 *   · highlight `?__phase=` 여섯 — `HighlightProjectScene.tsx:2345` 이 `currentPath="/highlight"`
 *     를 넘기고, fixture 사이드바의 「Highlight」 버튼 글자색이 활성 잉크(`color(srgb 0 0 0)`,
 *     나머지 항목은 `0.254902 …`)다. 옛 표는 Default 였다.
 *   · `/mypage/upgrade/billing-success`·`billing-fail`·`fail` — 각 `page.tsx:423`·`:159`·`:161` 이
 *     `currentPath="/mypage/upgrade"` 를 넘겨 Upgrade CTA 가 활성(`Gnb.tsx:5074` 의
 *     `resolvedPath.startsWith("/mypage/upgrade")`)이다. fixture 의 사이드바 서브트리가
 *     `/mypage/upgrade` 와 styleRef 까지 같다. 옛 표는 Default 였다. 반면 `billing-change-*`·
 *     `topup/*` 는 `currentPath="/mypage"` 라 Default 가 맞다.
 * 값(`Current=…`)은 components plan 의 `shell.variants[].route` 로 currentPath 와 잇는다. 표가 또
 * 틀리는 것은 `build-figma-app-screens.mjs` 의 사이드바 서명 가드가 잡는다 — 서브트리가 같은
 * 보드는 같은 variant, variant 의 출처 route 가 측정돼 있으면 그 서브트리와 같아야 한다.
 */
const PRODUCT_CURRENT_PATH = Object.freeze({
  "/archive": "/archive", // AppHomeScene.tsx:855 currentPath={gnbCurrentPath}, :131 기본값 "/archive"
  "/settings": "/settings", // SettingsScene.tsx:967
  "/subscription": "/subscription", // SubscriptionScene.tsx:891
  "/analytics/youtube": "/analytics/youtube", // YoutubeAnalyticsScene.tsx:2235
  "/mypage/upgrade": "/mypage/upgrade", // app/mypage/upgrade/UpgradePlanPageClient.tsx:560
  "/mypage/upgrade/billing-success": "/mypage/upgrade", // billing-success/page.tsx:423
  "/mypage/upgrade/billing-fail": "/mypage/upgrade", // billing-fail/page.tsx:159
  "/mypage/upgrade/billing-change-success": "/mypage", // billing-change-success/page.tsx:274
  "/mypage/upgrade/billing-change-fail": "/mypage", // billing-change-fail/page.tsx:147
  "/mypage/upgrade/fail": "/mypage/upgrade", // fail/page.tsx:161
  "/mypage/topup/success": "/mypage", // topup/success/page.tsx:326
  "/mypage/topup/fail": "/mypage", // topup/fail/page.tsx:147
  "/mypage/upgrade/bulk-success": "/subscription", // bulk-success/page.tsx:231
  "/mypage/upgrade/bulk-fail": "/subscription", // bulk-fail/page.tsx:57
  "/subscription/coupons": "/subscription", // components/scenes/PurchasedCouponsScene.tsx:483
});
// 화면 키에 개발용 후크 쿼리(`?__phase=` · `?preview=`)가 붙어도 GNB 는 같은 페이지의 것이다 — 쿼리를 떼고 찾는다.
const currentPathOf = (route) => {
  const page = route.split("?")[0];
  return PRODUCT_CURRENT_PATH[page] ?? (page.startsWith("/highlight/") ? "/highlight" : null);
};

/** 사이드바 variant → 그 variant 를 잰 출처 route(components plan). 생성기의 서명 가드가 쓴다. */
export const SIDEBAR_VARIANT_SOURCES = Object.freeze(Object.fromEntries(
  COMPONENTS_PLAN.component.shell.variants.map((variant) => [`Current=${variant.current}`, variant.route]),
));

const round = (value) => Math.round((value ?? 0) * 100) / 100;

/**
 * **데스크톱 사이드바는 폭 수가 아니라 폭 선언으로 찾는다(2026-09-15).** 이 매처는 `rect.width === 280` 을 물고
 * 「선언: globals.css:179 `min(280px, …)`」 인용을 달고 있었다. 인용은 이 저장소의 어떤 게이트도 대조하지 않는다
 * (`check-derived-size-literals` 는 붙어 있는지만 본다). 제품 `bc3e6fa3` 가 그 선언을 `min(240px, …)` 로 옮기자
 * 데스크톱 보드 열여덟이 사이드바 인스턴스를 잃을 자리였다 — 상단 바 매처가 높이 53 을 물다 프로필 32 에 낡은
 * 것(2026-09-14)과 같은 모양이다. 제품 사이드바 `header` 는 폭을 `var(--app-gnb-sidebar-width)` 로 선언하고
 * (fixture 원장의 `declared.width`), 수는 그 변수가 정한다. 그래서 변수 이름을 문다 — 값이 옮겨도 판정이 서고,
 * 제품이 다른 선언으로 폭을 쥐면 인스턴스가 빠져 `SHELL_INSTANCES_BY_BOARD` 가 운다.
 */
const SIDEBAR_WIDTH_DECLARATION = "var(--app-gnb-sidebar-width)";

/** 노드가 품은 모든 텍스트를 순서대로 모은다. */
function textsOf(node, into = []) {
  if (node.text) into.push(node.text.trim());
  for (const child of node.children ?? []) textsOf(child, into);
  return into;
}

function findDescendant(node, predicate) {
  if (predicate(node)) return node;
  for (const child of node.children ?? []) {
    const hit = findDescendant(child, predicate);
    if (hit) return hit;
  }
  return null;
}

/** breadcrumb 라벨 — 구분자 `/`는 뺀다. */
function breadcrumbLabels(bar) {
  const nav = findDescendant(bar, (node) => node.tag === "nav");
  if (!nav) return [];
  return textsOf(nav).filter((text) => text && text !== "/");
}

/** 서브트리의 `<button>` 수. */
function buttonCount(node) {
  let count = node.tag === "button" ? 1 : 0;
  for (const child of node.children ?? []) count += buttonCount(child);
  return count;
}

/**
 * **상단 바는 기하가 아니라 구조로 알아본다(2026-09-14).**
 *
 * 제품 바(`mainChromeTopBar` + `mainChromeTopBarInPanel`, Gnb.tsx)는 높이를 선언하지 않는다 —
 * `[min-block-size:0]`(Gnb.tsx:460) 과 `[padding:8px_var(--mainchrome-pad-x)]`(:483) 뿐이라 높이는
 * 「패딩 + 가장 큰 자식 + 헤어라인」으로 **계산된다.** 옛 매처는 그 계산 결과 53 을 `=== 53` 으로 물었고,
 * 제품 `6f6282c1` 이 프로필 버튼을 36 → 32 로 줄이자 바가 49 가 되어 36 보드의 상단 바가 한꺼번에
 * 날노드로 떨어질 자리였다. 크기는 판정 입력이 아니다.
 *
 * 구조는 제품 JSX 가 정한다(Gnb.tsx 의 `mainChromeLeadingCluster` · `mainChromePageNav` ·
 * `mainChromeProfileCluster` 순서): **자식 가운데 `<nav>` 가 있고, 그 앞 형제들이 버튼(사이드바 토글 ·
 * 뒤로가기)을, 그 뒤 형제들이 버튼(프로필 트리거)을 품는 흐름 노드.** 이 조건은 가장 안쪽 행에서만
 * 선다 — nav 를 **직접** 자식으로 두는 노드는 바 자신뿐이라, 바를 감싼 margin 래퍼(f19cc41c → 38a7d5a4
 * 에서 `collapseWrappers` 가 접지 않게 된 모바일 390 · 데스크톱 1600/1608 폭 래퍼)가 먼저 걸려 폭 ·
 * 앞머리 버튼 수를 틀리게 판정하던 함정이 구조상 사라진다. 데스크톱 사이드바 `<header>` 의 nav 는
 * 앞뒤 형제가 없어 걸리지 않는다(그리고 사이드바 치환이 먼저 돈다).
 *
 * 앵커 두 벌(`6fbdac16` 의 53 · `6f6282c1` 의 49)에서 36 보드 모두 옛 매처와 같은 경로를 집는다.
 */
function isTopBarRow(node) {
  if (node.positioning === "ABSOLUTE") return false;
  const children = node.children ?? [];
  const navIndex = children.findIndex((child) => child.tag === "nav");
  if (navIndex <= 0 || navIndex === children.length - 1) return false;
  const before = children.slice(0, navIndex).reduce((sum, child) => sum + buttonCount(child), 0);
  const after = children.slice(navIndex + 1).reduce((sum, child) => sum + buttonCount(child), 0);
  return before >= 1 && after >= 1;
}

/** 상단 바 앞머리의 버튼 수 — 2개면 뒤로가기가 붙은 것이다(토글 + 뒤로). */
function leadingButtonCount(bar) {
  const first = bar.children?.[0];
  if (!first) return 0;
  let count = 0;
  const walk = (node) => {
    if (node.tag === "button") count += 1;
    for (const child of node.children ?? []) walk(child);
  };
  walk(first);
  return count;
}

/**
 * 사이드바 variant. 표에 없는 route 는 **던진다** — 조용히 Default 로 떨어뜨리면 새 화면이 활성
 * 항목을 잃어도 아무도 모른다(옛 표가 highlight 여섯을 그렇게 잃었다).
 */
function sidebarVariant(route) {
  const currentPath = currentPathOf(route);
  if (!currentPath) {
    throw new Error(
      `[figma-app-screens] ${route} 가 넘기는 <Gnb currentPath> 를 모릅니다 — ` +
      "제품 소스에서 인용해 figma-component-substitution.mjs 의 PRODUCT_CURRENT_PATH 에 적으세요.",
    );
  }
  const variant = COMPONENTS_PLAN.component.shell.variants.find((entry) => entry.route === currentPath);
  return `Current=${variant?.current ?? "Default"}`;
}

/**
 * **Divider 는 측정 border 로 판정한다.** 제품 6fbdac16 `useMainChromeHeaderScrollProgress.ts:10-14`
 * 가 헤어라인을 모든 화면에서 늘 켠다고 적고, fixture 의 측정 바는 전부 `border-bottom-width: 1px`
 * 다. 옛 코드는 `Content=Home` 을 `Divider=Off` 로 박아 `/archive` 데스크톱이 제품과 다른 조합을
 * 받았다. 계산 스타일이 없으면 판정하지 못한 것으로 둔다(지어내지 않는다).
 */
function dividerOf(style) {
  const width = Number.parseFloat(String(style?.borderBottomWidth ?? ""));
  if (!Number.isFinite(width)) return null;
  return width > 0 ? "On" : "Off";
}

function desktopTopBarVariant(bar, style) {
  const labels = breadcrumbLabels(bar);
  const content = CONTENT_BY_LABEL[labels[0]];
  const divider = dividerOf(style);
  if (!content || !divider) return null;
  const breadcrumb = labels.length > 1 ? "Trail" : "Single";
  const back = leadingButtonCount(bar) >= 2 ? "True" : "False";
  return `Content=${content}, Breadcrumb=${breadcrumb}, Back=${back}, Divider=${divider}`;
}

function mobileTopBarVariant(bar, viewportWidth, style) {
  const labels = breadcrumbLabels(bar);
  const divider = dividerOf(style);
  if (labels.length === 0 || !divider) return null;
  const width = Math.round(bar.rect.width) >= Math.round(viewportWidth) ? "Full" : "Inset";
  const breadcrumb = labels.length > 1 ? "Trail" : "Single";
  const back = leadingButtonCount(bar) >= 2 ? "True" : "False";
  return `Width=${width}, Breadcrumb=${breadcrumb}, Back=${back}, Divider=${divider}`;
}

/**
 * **상단 바 인스턴스의 breadcrumb 글자 → 세트의 TEXT 속성(2026-09-13).**
 *
 * 앱 셸 생성기가 두 상단 바 세트에 `Label`(Single) · `Parent`·`Current`(Trail) TEXT 속성을 열었다.
 * 세트 단위 속성은 기본값이 하나라, 채우지 않으면 모든 인스턴스가 기본 라벨을 보인다 — 라이브
 * `/archive`·`/subscription` 모바일이 이미 「Settings」 를 보이는 결함과 같은 모양이다.
 *
 * 어느 글자가 어느 속성인지는 **그 variant 의 plan `text[].property` 순서**가 정한다(측정 breadcrumb
 * 에서 구분자 「/」를 뺀 순서와 같다). 돌려주는 객체는 세트의 속성 이름 **전부**를 키로 갖는다 —
 * 이 variant 가 묶지 않은 속성은 null 이다. 렌더러는 키 집합이 세트의 TEXT 속성 집합과 다르면 던진다
 * (「속성 수가 계획과 다르면 조용히 넘어가지 않는다」).
 */
function topBarTextProperties(node, set, variant) {
  const entry = TOP_BAR_PLANS[set];
  if (!entry) return null;
  const spec = entry.variants.find((candidate) => candidate.name === variant);
  if (!spec) throw new Error(`[figma-app-screens] ${set} plan 에 ${variant} 가 없습니다.`);
  const bound = spec.text.filter((text) => text.property).map((text) => text.property);
  const labels = breadcrumbLabels(node);
  if (labels.length !== bound.length) {
    throw new Error(
      `[figma-app-screens] ${set} · ${variant} 는 TEXT 속성 ${bound.length}개(${bound.join("·")})를 묶는데 ` +
      `측정 breadcrumb 글자는 ${labels.length}개(${labels.join(" | ")})입니다: ${node.path}`,
    );
  }
  const names = entry.textProperties.map((property) => property.name);
  for (const name of bound) {
    if (!names.includes(name)) throw new Error(`[figma-app-screens] ${set} 의 textProperties 에 ${name} 이 없습니다.`);
  }
  return Object.fromEntries(names.map((name) => [name, bound.includes(name) ? labels[bound.indexOf(name)] : null]));
}


// ─────────────────────────────────────────────────────────────────────────────
// **정본 프리미티브 자리 — 「제품이 무는 클래스」가 판정한다, 기하가 아니다**
// ─────────────────────────────────────────────────────────────────────────────
//
// 위의 셸·본문 치환은 «화면 하나만큼 큰» 덩어리를 다룬다. 그 아래 낱개 컨트롤(버튼·아바타…)은
// 지금까지 전부 도형으로 그려졌다. 2026-09-02 실측: 보드 36장의 인스턴스 43 · 원시 도형 933.
//
// ## 왜 기하만으로는 고를 수 없는가 (실측으로 두 번 틀렸다)
//
// `measure-figma-board-composition.mjs` 는 「높이 32 + 반경 12 면 LOUIS Button」으로 대응을
// 판정한다. 그 규칙을 그대로 생성기에 쓰면 **제품이 정본을 물지 않는 자리까지 인스턴스로 바뀐다**:
//
//   · `/settings` 의 테마·언어 세그먼트 12칸은 높이 28 · 반경 8 로 SegmentedControlItem 과
//     기하가 같지만, 제품은 그 자리에서 `.louis-segmented-control` 을 물지 않는다 —
//     `migration/product.rendered-components.json` 의 probe `segmented-segment` 가
//     출처를 `myPageSceneStyles.ts settingsToggleBtn` 으로 적고 있다(제품 지역 스타일).
//   · `/settings` 의 「Delete account」는 높이 32 · 반경 12 로 Button 과 기하가 같지만
//     padding-inline 이 14 이고 column-gap 이 0 이다. `.louis-button[data-size=md]` 는
//     12 / 4 다 — 다른 레시피다.
//
// 제품이 기준이다(DS-D-0037 이 표면 축에서 세운 것과 같은 원칙). 제품이 bespoke 로 그리는 자리를
// Figma 에서만 정본으로 바꾸면 두 축이 어긋나고, 그 자리는 표면 원장의 `needed` 로 이미 잡혀 있다.
//
// ## 그래서 판정을 양쪽에서 읽는다 — 두 값 다 실행 시점에 읽고, 여기에 베끼지 않는다
//
//   제품 쪽 `migration/product.rendered-components.json`
//     probe 하나가 「제품 소스의 클래스 문자열을 제품 Tailwind 로 컴파일해 실브라우저에서 잰
//     상자」다. `rendered[probe]` 의 **모든** 축(높이·padding·gap·반경·최소폭)이 측정 노드의
//     계산 스타일과 문자열까지 같을 때만 「이 자리는 그 레시피다」라고 말한다. 축 이름이 양쪽
//     다 camelCase 라 단위 해석 없이 그대로 비교한다.
//   Figma 쪽 `figma/readback.json`
//     그 컴포넌트의 그 size 가 실재하고 기하가 맞는지, 그리고 variant 이름을 무엇으로 적어야
//     하는지를 준다. LOUIS 가 제품에서 멀어지면 여기서 어긋나 **치환을 포기한다** — 어긋난 채로
//     인스턴스를 심는 것이 가장 나쁘다(화면은 조용히 시스템과 다른 값을 그린다).
//
// ## variant 문자열을 손으로 적지 않는다
//
// 되읽기의 `properties` 에서 VARIANT 축만 **정의 순서대로** 뽑아 조립하고, 값이 그 축의
// options 에 없으면 던진다. 손으로 적으면 LOUIS 가 축을 하나 더 여는 날 조용히 낡는다.
// (`figma-readback-emit.mjs:348` 가 `componentPropertyDefinitions` 를 그 순서로 담는다.)

/**
 * **정본 프리미티브 자리 목록.**
 *
 * `probe` 는 제품 레시피 원장의 항목 id 다. `canonical` 이 아닌 probe 는 여기 없다 — 예를 들어
 * `icon-button`(출처 `Gnb.tsx iconButton`)은 제품 지역 스타일이라 대응을 만들지 않는다. `segmented-segment` 는
 * 2026-09-15 에 사정이 달라졌다 — 제품은 정본을 무는데 원장 probe 가 쓰이지 않는 상수를 재어 자리를 세울 상자가 없다
 * (아래 제외 목록의 blocked).
 * 그 자리들이 **정본이 되어야 하는가**는 Figma 축이 아니라 제품 축의 질문이고, 표면 원장이 센다.
 *
 * `element` 는 probe 의 html 이 실제로 쓰는 태그다. 기하만 보면 28×28 원형 자리에 사이드바의
 * 원형 «버튼»까지 걸린다(실측: 아바타 상자에 36자리가 걸리는데 그 중 다수가 `<button>` 이다).
 */
export const LOUIS_PRIMITIVE_SITES = Object.freeze([
  {
    id: "button-md",
    probe: "button-md",
    element: "button",
    component: "Button",
    size: "md",
    why: "제품이 Button.tsx 에서 `.louis-button[data-size=md]` 를 그대로 문다(DS-D-0027 의 기본값).",
  },
  {
    id: "button-lg",
    probe: "button-lg",
    element: "button",
    component: "Button",
    size: "lg",
    why: "제품이 Button.tsx 에서 `.louis-button[data-size=lg]` 를 문다 — 인증 제출 CTA 자리다.",
  },
  {
    id: "avatar",
    probe: "avatar",
    element: "span",
    component: "Avatar",
    size: "md",
    why: "제품이 `.louis-avatar` 를 그대로 문다. 크기를 소유하는 쪽이 그 클래스다.",
  },
]);

/**
 * **여기 없는 probe 를 자리로 쓰지 않는 이유.** 목록에 없다는 것이 「대응이 없다」는 뜻이 아니라
 * 「제품이 그 자리에서 정본을 물지 않는다」는 뜻이므로, 지우지 말고 사유와 함께 남긴다.
 *
 * ── 왜 `component`·`sizes`·`verdict` 를 함께 적는가 (2026-09-02) ─────────────
 *
 * 이 목록은 처음에 **생성기만** 읽었다. 생성기에게는 「이 probe 를 자리로 쓰지 않는다」만
 * 있으면 되므로 `probe` + `reason` 두 칸으로 충분했다. 그런데 보드 원장
 * (`measure-figma-board-composition.mjs`)이 같은 판정을 필요로 하면서 칸이 모자랐다 —
 * 원장은 도형을 «어느 LOUIS 컴포넌트의 어느 size 자리인가»로 부르고 probe 이름을 모른다.
 * 조인할 칸이 없으면 원장은 목록을 **다시 손으로** 적게 되고, 두 벌이 된 목록은 반드시 어긋난다.
 *
 * `verdict` 는 **제외 사유가 한 종류가 아니기 때문에** 필요하다. 처음에 넷은 「제품이 정본을 물지
 * 않는다」(지역 스타일)였고 `progress-bar-track` 하나는 「제품은 무는데 측정이 variant 축을
 * 고를 정보를 잃었다」였다. 둘을 같은 낱말로 적으면 읽는 사람이 틀린 일을 하러 간다 — 앞의 것은
 * 제품이 바뀌어야 열리고, 뒤의 것은 측정이 바뀌어야 열린다. (`blocked` 를 연 것과 같은 근거다.)
 * 2026-09-15 에 세그먼트 둘이 앞에서 뒤로 옮겼다 — 제품이 `SegmentedToggle` 로 정본을 물게 됐고 남은 막힘은 원장 probe 다.
 *
 * `sizes: "*"` 는 「그 컴포넌트의 어느 size 도 이 판정을 받는다」다. size 를 좁혀 적으면
 * 나머지 size 는 자리도 제외도 아닌 «판정 없는» 상태가 되고, 보드 원장은 그것을 만나면 던진다.
 */
export const LOUIS_PRIMITIVE_EXCLUSIONS = Object.freeze([
  {
    probe: "icon-button",
    component: "IconButton",
    sizes: "*",
    verdict: "bespoke",
    reason: "출처가 `Gnb.tsx iconButton` 이다 — 제품 지역 스타일이지 `.louis-icon-button` 이 아니다.",
  },
  {
    probe: "icon-button-card",
    component: "IconButton",
    sizes: "*",
    verdict: "bespoke",
    reason:
      "출처가 `appHomeSceneStyles.ts archiveMoreButton` 이다 — 카드 위 more 버튼의 지역 " +
      "스타일이다. 클래스 이름에 `louis-` 가 붙어 있지만(`.louis-project-card-more`) 그것은 " +
      "**ProjectCard 의 부품**이지 IconButton 프리미티브가 아니다 — 그래서 「probe 의 html 에 " +
      "`louis-` 가 있는가」 같은 문자열 시험으로는 이 목록을 대신할 수 없다.",
  },
  // **2026-09-15 다시 판정 — bespoke → blocked.** 옛 사유(「`/settings` 토글은 `.louis-segmented-control` 을 물지 않는다」)는
  // 앵커 6f6282c1 에서 사실이 아니다. 설정 두 토글 · 구독 크레딧 이력 필터가 쓰는 `SegmentedToggle` 이 정본 레시피를 문다
  // (`git -C "$KLIPSE_PRODUCT_REPO" show 6f6282c1:apps/web/components/scenes/SegmentedToggle.tsx` —
  //  :76 `const TOGGLE_TRACK = ["louis-segmented-control", SEGMENTED_THUMB_TRACK].join(` ·
  //  :102 `  "louis-segmented-control__segment louis-focus-ring",` · :137 `      data-size="settings"`).
  // 레시피 원장 probe 둘은 여전히 `myPageSceneStyles.ts` 의 `settingsToggleWrap`(:1250) · `settingsToggleBtn`(:1209)을 재는데,
  // `git grep -n "settingsToggleWrap\|settingsToggleBtn\b" 6f6282c1 -- apps/web` 에서 두 이름은 정의 줄과 주석 한 줄(:317)
  // 밖에 나오지 않는다 — 원장이 쓰이지 않는 상수를 잰다. 제품은 정본을 무는데 측정이 그 자리의 상자를 잴 probe 를 잃었으니
  // 「blocked(고칠 곳은 측정)」다. 열리는 조건: 레시피 원장 probe 를 `SegmentedToggle` 의 레시피 클래스 마크업으로 옮기고
  // `LOUIS_PRIMITIVE_SITES` 에 자리를 세운다.
  {
    probe: "segmented-track",
    component: "SegmentedControl",
    sizes: "*",
    verdict: "blocked",
    reason:
      "제품은 `SegmentedToggle.tsx`(:76 · :137)에서 `.louis-segmented-control[data-size=settings]` 를 무는데, 레시피 원장 probe " +
      "`segmented-track` 은 쓰이지 않는 `myPageSceneStyles.ts settingsToggleWrap`(:1250)을 잰다 — 측정이 정본 상자를 잴 probe 를 잃었다.",
  },
  {
    probe: "segmented-segment",
    component: "SegmentedControlItem",
    sizes: "*",
    verdict: "blocked",
    reason:
      "제품은 `SegmentedToggle.tsx`(:102)에서 `.louis-segmented-control__segment` 를 무는데, 레시피 원장 probe `segmented-segment` 는 " +
      "쓰이지 않는 `myPageSceneStyles.ts settingsToggleBtn`(:1209)을 잰다 — 같은 이유로 blocked 다.",
  },
  // **2026-09-26 — 설정 화면 프로필 사진 칸.** 제품은 `.louis-avatar` 를 물지만 크기 40(LOUIS `lg`)에 더해 면과 폴백 글리프
  // 크기를 덮는다. 제품 주석이 그 둘을 「제품이 눈에 보이게 다른 두 값」이라 적는다(`myPageSceneStyles.ts settingsAvatarFigure` ·
  // `settingsAvatarFigureDefault`). 인스턴스로 바꾸면 보드가 LOUIS 면(`bg-inset`)과 원을 가득 채운 글리프를 그려 제품과 달라진다.
  {
    probe: "avatar-settings",
    component: "Avatar",
    sizes: ["lg"],
    verdict: "bespoke",
    reason:
      "출처가 `myPageSceneStyles.ts settingsAvatarFigure` 다 — `.louis-avatar` 를 물고 크기는 LOUIS `lg`(40)와 같지만, 면을 " +
      "`gray-000` 12% 로, 폴백 글리프를 78% 로 덮는다. 둘 다 눈에 보이는 값이라 인스턴스로 바꾸면 화면이 제품과 달라진다.",
  },
  // **2026-09-26 — 하이라이트 업로드 면.** LOUIS DropZone 이 이 기하를 옮겼지만 제품은 지역 레시피(`highlightSceneStyles.ts
  // uploadDropZone`)를 쓰고, 그 면은 끌어다 놓기 · 포커스 링이 없고 면 색이 LOUIS 눌림 면 역할과 다르다. 제품이 DropZone 으로
  // 옮기면 이 항목을 걷고 정본 자리를 세운다.
  {
    probe: "drop-zone-upload",
    component: "DropZone",
    sizes: "*",
    verdict: "bespoke",
    reason:
      "출처가 `highlightSceneStyles.ts uploadDropZone` 이다 — 제품 지역 레시피이지 `.louis-drop-zone` 이 아니다. 기하는 같지만 " +
      "면 색(`palette-gray-100` · 호버 `-150`)이 LOUIS 눌림 면 역할과 다르고, 끌어다 놓기와 포커스 링이 없다.",
  },
  {
    probe: "progress-bar-track",
    component: "ProgressBar",
    sizes: "*",
    verdict: "blocked",
    reason:
      "제품은 `.louis-progress-bar` 를 그대로 물지만 LOUIS ProgressBar 의 VARIANT 축은 " +
      "State(determinate·indeterminate) 하나뿐이고 **측정에 그 축을 고를 정보가 없다** — " +
      "계산 스타일에는 aria-valuenow 가 없고, `__fill` 은 진행 0% 라 보이지 않아 트리에서 " +
      "지워졌다. 지어내면 화면이 제품과 다른 상태를 말하게 된다.",
  },
]);

/**
 * **축약(slim) payload 가 제품 레시피 상자의 어느 축을 볼 수 있는가.**
 *
 * 생성기는 실브라우저 계산 스타일 전체를 갖고 상자를 «문자열까지» 대조한다(DS-D-0043).
 * 보드 원장은 그럴 수 없다 — 원장이 읽는 것은 `figma/app-screens.*.draw.js` 의 축약 트리이고,
 * 그 트리에 남아 있는 상자 축은 아래 일곱뿐이다. 그래서 **원장의 상자 시험은 생성기의
 * 부분집합**이며, 그 사실을 여기 한 곳에 적어 둔다: 목록을 두 곳에 두면 어긋나고, 아예 안
 * 적으면 「전부 대조했다」로 읽힌다.
 *
 * 보이지 않는 축(`min-width`·면 색·그림자 …)은 **시험하지 않는다.** 「보이지 않으니 같다」로
 * 접으면 상자 시험이 조용히 통과 도장이 된다 — 그래서 원장은 어느 축을 실제로 댔는지 사유에
 * 함께 적는다.
 *
 * 슬림 키는 `build-figma-app-screens.mjs` 의 `slim()` 이 소유한다:
 *   r=[너비,높이] · d=반경(네 모서리 같을 때만 수) · l=[모드,간격,위,오른,아래,왼,…]
 */
export const SLIM_RECIPE_AXES = Object.freeze({
  height: (node) => node.r?.[1],
  borderTopLeftRadius: (node) => (typeof node.d === "number" ? node.d : undefined),
  paddingTop: (node) => node.l?.[2],
  paddingRight: (node) => node.l?.[3],
  paddingBottom: (node) => node.l?.[4],
  paddingLeft: (node) => node.l?.[5],
  // Figma 의 itemSpacing 은 주축 간격 하나다. 가로 배치면 column-gap, 세로면 row-gap 이다.
  columnGap: (node) => (node.l?.[0] === "H" ? node.l?.[1] : undefined),
  rowGap: (node) => (node.l?.[0] === "V" ? node.l?.[1] : undefined),
});

/**
 * **축약 노드를 제품 레시피 상자에 대본다.** 볼 수 있는 축만 댄다.
 * 돌려주는 것은 `{ checked, mismatch }` — `mismatch` 가 null 이면 «보이는 축은 모두 같다»이지
 * 「상자가 같다」가 아니다. 그 구분이 사라지면 원장이 근거보다 센 말을 하게 된다.
 */
export function slimRecipeBoxDiff(box, node) {
  const checked = [];
  let mismatch = null;
  for (const [axis, pick] of Object.entries(SLIM_RECIPE_AXES)) {
    const expected = box?.[axis];
    if (expected === undefined) continue;
    const actual = pick(node);
    if (actual === undefined) continue;
    const wanted = Number.parseFloat(String(expected));
    if (!Number.isFinite(wanted)) continue;
    checked.push(axis);
    if (mismatch === null && Math.abs(wanted - actual) > 0.5) {
      mismatch = { axis, expected: String(expected), actual };
    }
  }
  return { checked, mismatch };
}

const isTransparent = (color) => /^(transparent|rgba\(0,\s*0,\s*0,\s*0\))$/.test(String(color ?? "").trim());

/** 그림자에서 색을 걷어내고 기하만 남긴다. 헤어라인 색은 테마를 따라가지만 기하는 따라가지 않는다. */
const shadowGeometry = (value) => {
  if (!value || value === "none") return null;
  return String(value)
    .replace(/(rgba?|color)\([^)]*\)/g, "")
    .trim()
    .replace(/\s+/g, " ");
};

/**
 * **disabled 면을 재는 probe 두 벌.** inverse 와 달리 이쪽은 테마마다 다른 «값»이 아니라
 * 테마마다 다른 **같은 토큰**(`bg-inset`)이라 둘 다 있어야 한다.
 *
 * 이 이름을 원장에서 읽는 이유는 값을 여기 베끼지 않기 위해서다 — 베끼는 순간 제품이 램프를
 * 옮긴 날 조용히 낡는다(`slimRecipeBoxDiff` 가 상자를 원장에서 읽는 것과 같은 규칙).
 */
const DISABLED_BUTTON_PROBES = Object.freeze(["button-disabled", "button-disabled-light"]);
const INVERSE_BUTTON_PROBES = Object.freeze(["button-inverse", "button-inverse-light"]);
/** secondary 는 면이 테마를 따라간다 — 두 벌을 다 재야 라이트 화면이 빠지지 않는다. */
const SECONDARY_BUTTON_PROBES = Object.freeze(["button-secondary", "button-secondary-light"]);

/** 원장의 면 값 목록을 꺼낸다. 하나라도 비면 **던진다** — 없는 값을 「다르다」로 접으면 판정이 거짓이 된다. */
function facesOf(declared, probes, property) {
  return probes.map((probe) => {
    const value = declared[probe]?.[property];
    if (!value) {
      throw new Error(
        `[figma-app-screens] 제품 레시피 원장에 ${probe} 의 ${property} 가 없습니다. ` +
        "`pnpm run measure-product-components` 로 원장을 다시 뽑으세요.",
      );
    }
    return value;
  });
}

/**
 * **`:disabled` 는 Variant 축을 접는다.**
 *
 * `button.css:288-297` 이 primary·danger·danger-secondary·inverse **넷을 같은 `bg-inset` 면과
 * 같은 `fg-disabled` 글자로** 그린다. 그래서 disabled 버튼의 계산 스타일에는 어느 variant 인지가
 * 남아 있지 않다 — 측정 트리에도 `disabled`/`aria-disabled` 칸이 없다.
 *
 * 이 함수는 그 사실을 **근거 있게 말하기 위해** 있다. 값을 지어내 아무 variant 나 고르면 화면은
 * 조용히 시스템과 다른 정체를 주장하게 되고, 그냥 null 로 접으면 「아무도 안 봤다」와 구분되지
 * 않는다. 면과 글자 **둘 다** 맞을 때만 참이다 — 면만 보면 `bg-inset` 을 쓰는 평범한 회색
 * 컨트롤이 전부 걸린다.
 */
export function isDisabledButtonFace(style, declared) {
  const faces = facesOf(declared, DISABLED_BUTTON_PROBES, "background-color");
  const inks = facesOf(declared, DISABLED_BUTTON_PROBES, "color");
  return faces.some((face, index) => style.backgroundColor === face && style.color === inks[index]);
}

/**
 * **축약 노드의 면(`f`)이 disabled 면인가.** 보드 원장은 계산 스타일이 아니라 draw payload 를
 * 읽으므로 색이 `rrggbb` 16진이다. 변환을 여기 한 곳에 두는 이유는 조인의 임자가 원장 하나여야
 * 하기 때문이다 — 보드 쪽에 다시 적으면 두 벌이 되고, 두 벌은 반드시 어긋난다.
 */
export function isDisabledButtonFill(fill, declared) {
  const faces = facesOf(declared, DISABLED_BUTTON_PROBES, "background-color").map(cssColorToHex);
  return typeof fill === "string" && faces.includes(fill.toLowerCase());
}

/** `color(srgb r g b)` · `rgb(r, g, b)` → `rrggbb`. 해석하지 못하면 null 이다(빈 문자열이 아니다 — 조용히 맞아 버린다). */
function cssColorToHex(value) {
  const text = String(value ?? "").trim();
  const srgb = /^color\(srgb\s+([\d.]+)\s+([\d.]+)\s+([\d.]+)/.exec(text);
  if (srgb) {
    return srgb.slice(1, 4)
      .map((channel) => Math.round(Number.parseFloat(channel) * 255).toString(16).padStart(2, "0"))
      .join("");
  }
  const rgb = /^rgba?\(\s*(\d+)[,\s]+(\d+)[,\s]+(\d+)/.exec(text);
  if (rgb) {
    return rgb.slice(1, 4).map((channel) => Number(channel).toString(16).padStart(2, "0")).join("");
  }
  return null;
}

/**
 * **Button 의 `Variant` 축.** 제품 레시피 원장이 실제로 잰 세 벌(primary·secondary·inverse)에만
 * 답한다. 나머지(ghost·danger)는 원장에 probe 가 없어 «비교할 값이 없다» — 지어내지 않고
 * null 을 돌려 치환을 포기한다. 그 자리가 나오면 원장에 probe 를 더하는 것이 먼저다.
 *
 * primary 는 면 색을 문자열까지 대조한다(accent 는 테마를 따라가지 않는다). secondary 는 면이
 * 투명이고 헤어라인 inset 그림자를 갖는데, 그 **색은 테마를 따라가므로**(라이트 검정 8% ·
 * 다크 흰색 8%) 기하만 대조한다.
 *
 * **inverse 는 면이 테마를 따라간다** — 이름 그대로 페이지와 반전된 면이라 라이트에서 검정,
 * 다크에서 흰 면이다(`button.css:169-172`). 그래서 한 벌이 아니라 원장이 잰 **두 벌** 중
 * 어느 쪽과도 같으면 참이다. 화면의 테마를 여기서 다시 추론하지 않는 이유는, 추론할 재료가
 * 이 함수에 없고(계산 스타일 하나뿐) 두 값이 서로 충돌하지도 않기 때문이다 — 검정 면과 흰 면을
 * 동시에 갖는 버튼은 없다.
 */
function buttonVariantOf(style, declared) {
  const primary = declared["button-md"]?.["background-color"];
  const secondaryShadow = shadowGeometry(declared["button-secondary"]?.["box-shadow"]);
  if (!primary || !secondaryShadow) {
    throw new Error("[figma-app-screens] 제품 레시피 원장에 button-md/button-secondary 의 면 값이 없습니다.");
  }
  const inverse = facesOf(declared, INVERSE_BUTTON_PROBES, "background-color");
  // **secondary 를 「투명」으로 알아보지 않는다.** `5566ecd feat(color): secondary 에 8% 잉크
  // 면을 준다` 이후 이 variant 는 면을 갖고, 그 면이 테마를 따라 갈린다(라이트 잉크 8% ·
  // 다크 흰색 8%). 투명으로 알아보면 라이트 화면의 secondary 가 통째로 빠지므로 **실측한
  // 두 면**을 쓴다 — inverse 가 이미 같은 형태다. 헤어라인 기하는 함께 확인해 ghost 와 가른다
  // (ghost 는 면도 그림자도 없다).
  const secondaryFaces = facesOf(declared, SECONDARY_BUTTON_PROBES, "background-color");
  if (style.backgroundColor === primary) return "primary";
  if (
    shadowGeometry(style.boxShadow) === secondaryShadow &&
    (secondaryFaces.includes(style.backgroundColor) || isTransparent(style.backgroundColor))
  ) {
    return "secondary";
  }
  if (inverse.includes(style.backgroundColor)) return "inverse";
  // **ghost — 면도 헤어라인도 없다.** secondary 와 갈리는 자리가 정확히 그 헤어라인이라
  // 위 secondary 판정을 통과하지 못한 투명 면이 여기로 온다. 원장이 잰 값으로 대조한다 —
  // 리터럴 `transparent` 를 여기 적으면 레시피가 면을 주는 날 조용히 틀린다.
  const ghostFace = declared["button-ghost"]?.["background-color"];
  if (!ghostFace) {
    throw new Error("[figma-app-screens] 제품 레시피 원장에 button-ghost 의 면 값이 없습니다.");
  }
  if (
    style.backgroundColor === ghostFace &&
    shadowGeometry(style.boxShadow) === shadowGeometry(declared["button-ghost"]?.["box-shadow"])
  ) {
    return "ghost";
  }
  return null;
}

/** 노드(혹은 자손)에 벡터가 있는가 — Button 의 아이콘 슬롯 판정에 쓴다. */
function hasVector(node) {
  if (node.tag === "svg") return true;
  return (node.children ?? []).some(hasVector);
}

/** 되읽기에서 VARIANT 축만 정의 순서대로 뽑는다. Figma 가 variant 이름을 짓는 순서다. */
function variantAxesOf(readback, component) {
  const entry = readback.components?.[component];
  if (!entry) throw new Error(`[figma-app-screens] 되읽기에 컴포넌트가 없습니다: ${component}`);
  return Object.entries(entry.properties ?? {})
    .filter(([, definition]) => definition.type === "VARIANT")
    .map(([name, definition]) => [name, definition.options ?? []]);
}

/**
 * **인스턴스가 노출한 TEXT 슬롯.** 되읽기의 `properties` 에서 `type === "TEXT"` 인 것만 뽑는다.
 * 세트 이름을 여기 적지 않는 이유는 variant 축과 같다 — 손으로 적으면 LOUIS 가 슬롯을 하나 더
 * 여는 날 조용히 낡는다.
 *
 * 되읽기에 **없는** 세트(`Product/*` 장면 컴포넌트)는 `null` 이다. 「슬롯이 없다」와 「모른다」는
 * 다르지만 결과는 같아야 한다 — 본문 블록은 **텍스트가 글자 그대로 같을 때만** 치환하므로
 * (`CONTENT_COMPONENTS.texts`) 덮어쓸 차이가 정의상 0 이다. 상단 바 두 세트는 예외라 이 함수를
 * 거치지 않는다 — 속성을 앱 셸 plan 이 소유하므로 `topBarTextProperties` 가 그 plan 에서 읽는다
 * (2026-09-13 전에는 라벨을 variant 축이 나른다고 적었지만 모바일 세트에는 라벨 축이 없어
 * `/archive`·`/subscription` 모바일이 「Settings」 를 보였다).
 */
function textSlotsOf(readback, set) {
  const entry = readback.components?.[set];
  if (!entry) return null;
  return Object.entries(entry.properties ?? {})
    .filter(([, definition]) => definition.type === "TEXT")
    .map(([name]) => name);
}

/**
 * **치환하면서 자식 텍스트를 버리지 않는다.**
 *
 * 인스턴스로 판정한 노드는 `children` 을 비운다 — 컴포넌트가 제 속을 그리기 때문이다. 그런데
 * 버려지는 자식 안에 **컴포넌트가 알 수 없는 것**이 하나 있다: 그 자리의 라벨이다. 실측 사고
 * (2026-09-02): `/settings` 데스크톱의 Button 7개가 전부 마스터 기본 라벨 「버튼」으로 나왔고,
 * HUG 가 그 글자를 물어 폭이 113.3·136.95·156.55·184.3·48·138.67·75.27 에서 49 로 접혔다.
 * payload 에 라벨이 처음부터 없었으므로 렌더러는 고칠 수단이 없었다.
 *
 * 그래서 세트가 TEXT 슬롯을 «노출한» 경우에만 서브트리의 텍스트를 실어 보낸다. 슬롯이 없으면
 * 아무것도 싣지 않는다(지금과 같다).
 *
 * 슬롯이 둘 이상이거나 텍스트 수가 슬롯 수와 다르면 **던진다.** 어느 텍스트가 어느 슬롯인지는
 * 측정에 없는 정보이고, 짐작해서 채우면 화면이 제품과 다른 글자를 말한다. 조용히 넘기면
 * 마스터 기본 라벨로 되돌아가 이 결함이 그대로 재발한다.
 */
function instanceLabel(node, set, readback) {
  const slots = textSlotsOf(readback, set);
  if (!slots || slots.length === 0) return null;
  const texts = textsOf(node).filter(Boolean);
  if (texts.length === 0) return null;
  if (slots.length !== 1 || texts.length !== 1) {
    throw new Error(
      `[figma-app-screens] ${set} 의 TEXT 슬롯 ${slots.length}개(${slots.join("·")})와 ` +
      `측정 텍스트 ${texts.length}개(${texts.join(" | ")})를 짝지을 수 없습니다: ${node.path}. ` +
      "어느 글자가 어느 슬롯인지는 측정에 없습니다 — 짝을 정하는 규칙을 먼저 세우세요.",
    );
  }
  return texts[0];
}

/** 되읽기의 기하는 같은 size 에 여러 값을 들 수 있다(라벨 길이만큼 다른 너비). */
const geometryFits = (values, value) =>
  Array.isArray(values) && values.some((candidate) => Math.abs(candidate - value) <= 0.5);

/**
 * 자리 하나를 노드에 대본다. 맞으면 `{ set, variant, why }`, 아니면 `null` 또는 사유가 붙은 보류.
 * 제품 상자 → Figma 기하 → variant 축 순서로 좁힌다. 어느 단계든 어긋나면 도형으로 남긴다.
 */
function matchLouisPrimitive(site, node, style, evidence) {
  if (node.tag !== site.element) return null;
  const box = evidence.recipes.rendered?.[site.probe];
  // 제품 상자 — 원장이 잰 **모든** 축이 문자열까지 같아야 한다.
  for (const [axis, expected] of Object.entries(box)) {
    if (style[axis] !== expected) return null;
  }
  // Figma 기하 — 같은 size 가 실재하고 높이·반경이 맞아야 한다. 어긋나면 LOUIS 가 제품에서
  // 멀어진 것이고, 그때 인스턴스를 심으면 화면이 조용히 시스템과 다른 값을 그린다.
  const geometry = evidence.readback.components?.[site.component]?.geometry?.[site.size];
  if (!geometry) return { skip: `되읽기에 ${site.component}/${site.size} 의 기하가 없습니다.` };
  if (!geometryFits(geometry.height, Math.round(node.rect.height * 100) / 100)) {
    return { skip: `${site.component}/${site.size} 의 되읽기 높이(${geometry.height}) 가 측정 ${round(node.rect.height)} 와 다릅니다.` };
  }
  // **disabled 면은 Variant 축을 접는다 — 먼저 걸러 사유를 정확히 남긴다.** 축 루프에 맡기면
  // 「Variant 를 판정하지 못했다」로 뭉뚱그려지는데, 그 문장은 「원장에 probe 가 없다」와
  // 구분되지 않는다. 앞의 것은 측정이 축을 잃은 것이고 뒤의 것은 아직 재지 않은 것이라,
  // 고치러 갈 곳이 서로 다르다.
  if (site.component === "Button" && isDisabledButtonFace(style, evidence.recipes.declared ?? {})) {
    return {
      skip:
        "Button 이 disabled 면(`bg-inset` + `fg-disabled`)이라 Variant 축을 고를 수 없습니다 — " +
        "button.css 가 primary·danger·danger-secondary·inverse 넷을 같은 면·같은 글자로 접고, " +
        "측정 트리에 `disabled` 칸이 없습니다.",
    };
  }
  // variant 축을 하나씩 채운다. 채우지 못한 축이 하나라도 있으면 치환하지 않는다.
  const decided = {};
  for (const [axis, options] of variantAxesOf(evidence.readback, site.component)) {
    let value = null;
    if (axis === "Size") value = site.size;
    else if (axis === "State") value = "Default";
    else if (axis === "Icon") value = hasVector(node) ? null : "none";
    else if (axis === "Variant" && site.component === "Button") value = buttonVariantOf(style, evidence.recipes.declared ?? {});
    if (value === null) {
      return {
        skip:
          `${site.component} 의 ${axis} 축을 측정에서 판정하지 못했습니다` +
          (axis === "Icon" ? " — 아이콘이 붙은 레시피는 padding 이 2px 좁아 다른 상자다(probe `button-md-icon`)." : "."),
      };
    }
    if (!options.includes(value)) {
      return { skip: `${site.component} 의 ${axis} 에 ${value} 가 없습니다(있는 것: ${options.join("/")}).` };
    }
    decided[axis] = value;
  }
  const variant = Object.entries(decided).map(([axis, value]) => `${axis}=${value}`).join(", ");
  return {
    set: site.component,
    variant,
    why:
      `${site.why} 제품 레시피 probe \`${site.probe}\` 의 ${Object.keys(box).join("·")} 가 ` +
      `측정과 모두 같고, 되읽기 ${site.component}/${site.size} 의 기하가 맞는다.`,
  };
}

/**
 * 부품 세트의 글자 서열 · 구조 서명 — 보드 생성기가 측정 서브트리에서 뜬 부품(`PARTS`)을 본문 후보로 넘길 때 쓴다.
 * 매처(`matchContent`)가 보드 쪽에서 쓰는 것과 **같은 함수**라, 부품과 보드의 서명이 규칙 차이로 어긋날 수 없다.
 * 자식이 없는 부품(글자를 제 몸에 든 버튼)은 `leaf` 에 태그를 싣는다 — 매처는 잎을 잎 서명하고만, 태그까지 같을 때 맞춘다.
 */
export function contentSignatureOf(spec) {
  const texts = textsOf(spec).filter(Boolean);
  const structure = (spec.children ?? []).map((child) => textsOf(child).filter(Boolean).length).filter((count) => count > 0);
  return { texts, structure, ...(spec.children?.length ? {} : { leaf: spec.tag }) };
}

/**
 * 글자 속성 부품(`PARTS` 의 `label`)의 모양 서명 — 칠과 타이포. 글자마다 다른 반복 칩(쿠폰 코드)은 글자 서열로 묶을 수 없으므로
 * 잎 · 태그 · 이 모양 · 뷰포트가 같으면 같은 부품으로 보고, 글자는 인스턴스의 TEXT 속성으로 옮긴다.
 */
export function lookOf(spec) {
  return JSON.stringify([spec.paint ?? null, spec.typography ?? null]);
}

/** 셸 자리를 인스턴스로 바꾼다. spec을 제자리에서 수정하고 적용·보류 목록을 돌려준다. */

export function applyComponentInstances(spec, { route, context, viewport, styleOf, declaredOf, evidence, extraContent = [] }) {
  const desktop = context.startsWith("desktop");
  // **증거가 없으면 조용히 넘어가지 않는다.** 낱개 컨트롤 치환이 소리 없이 꺼지면 보드 36장이
  // 도형으로 되돌아가고, `check-figma-app-screens` 는 그 교환을 한 글자도 보지 못한다.
  if (typeof styleOf !== "function") throw new Error("[figma-app-screens] styleOf(path) 가 필요합니다.");
  if (typeof declaredOf !== "function") throw new Error("[figma-app-screens] declaredOf(path) 가 필요합니다 — 사이드바는 선언으로 찾는다.");
  if (!evidence?.recipes || !evidence?.readback) {
    throw new Error("[figma-app-screens] 제품 레시피 원장과 Figma 되읽기가 모두 필요합니다.");
  }
  // **없는 probe 를 가리키는 자리는 설정 오류이지 노드마다 판정할 일이 아니다.** 노드마다
  // 「probe 가 없다」를 보류로 쌓으면 실제 실패(치환이 통째로 꺼진 것)가 보류 수백 줄에 묻힌다.
  // 화면을 걷기 전에 한 번 확인하고 던진다.
  for (const site of LOUIS_PRIMITIVE_SITES) {
    const box = evidence.recipes.rendered?.[site.probe];
    if (!box || Object.keys(box).length === 0) {
      throw new Error(
        `[figma-app-screens] 정본 자리 ${site.id} 가 가리키는 제품 레시피 probe 가 원장에 ` +
        `없거나 비어 있습니다: ${site.probe}`,
      );
    }
  }
  const applied = [];
  const skipped = [];

  const substitute = (node, set, variant, why, labelOverride = null) => {
    if (!variant) { skipped.push({ path: node.path, set, reason: "variant 축을 판정하지 못했다" }); return false; }
    // 낱개 정본 프리미티브의 variant 는 **되읽기에서 조립한 것**이라 여기 목록에 없다 —
    // 축과 options 를 되읽기가 이미 확인했으므로 다시 확인할 목록이 없다(있으면 두 벌이 된다).
    const known = VARIANTS[set]
      ?? (LOUIS_PRIMITIVE_SITES.some((site) => site.component === set)
        ? [variant]
        : [...CONTENT_COMPONENTS, ...extraContent].filter((entry) => entry.set === set).map((entry) => entry.variant));
    if (!known.includes(variant)) {
      skipped.push({ path: node.path, set, variant, reason: "컴포넌트 세트에 없는 조합" });
      return false;
    }
    // **자식을 비우기 «전»에** 라벨을 건진다 — 비운 뒤에는 셀 텍스트가 없다.
    // 상단 바는 속성이 여럿이라 이름 → 글자 객체다(`topBarTextProperties`).
    const label = labelOverride != null ? labelOverride
      : TOP_BAR_PLANS[set]
        ? topBarTextProperties(node, set, variant)
        : instanceLabel(node, set, evidence.readback);
    node.instance = { set, variant, why, ...(label == null ? {} : { label }) };
    node.children = [];
    // **잎의 글자도 비운다.** 글자를 제 몸에 든 잎(잎 서명 · 글자 속성 부품)을 치환하면 payload 에 글자(`x`)가 남고, 렌더러는
    // 글자가 있고 자식이 없는 노드를 인스턴스보다 먼저 TEXT 로 만든다 — 유튜브 연결 버튼 · 결제 상태 알림 · 쿠폰 코드 칩이 칠 없는
    // 글자로 그려졌다(2026-09-26). 글자는 위에서 라벨로 이미 건졌다.
    node.text = null;
    node.textLines = null;
    node.typography = null;
    applied.push({ path: node.path, set, variant, ...(label == null ? {} : { label }) });
    return true;
  };

  // 본문 블록 — **글자 서열 + 구조 서명 + 뷰포트**가 모두 맞을 때만 이미 있는 컴포넌트로 바꾼다(위 CONTENT_COMPONENTS 주석).
  const viewportName = desktop ? "Desktop" : "Mobile";
  const structureOf = (node) => (node.children ?? []).map((child) => textsOf(child).filter(Boolean).length).filter((count) => count > 0);
  const matchContent = (node) => {
    // 잎(자식 없는 노드)은 잎 서명(`leaf` = 태그)을 가진 부품하고만 맞춘다. 본문 세트에는 잎 서명이 없어 잎을 보지 않는다(전과 같다).
    const leaf = !node.children?.length;
    const texts = textsOf(node).filter(Boolean);
    if (texts.length === 0) return null;
    // 글자 속성 부품은 글자가 아니라 모양(`lookOf`)으로 맞추고, 글자는 라벨로 넘긴다.
    if (leaf && texts.length === 1) {
      const look = lookOf(node);
      const labelled = extraContent.find((candidate) => candidate.label && candidate.leaf === node.tag
        && candidate.viewport === viewportName && candidate.look === look && new RegExp(candidate.labelPattern).test(texts[0]));
      if (labelled) return { hit: labelled, label: texts[0] };
    }
    const sameTexts = [...CONTENT_COMPONENTS, ...extraContent].filter((candidate) => !candidate.label
      && (leaf ? candidate.leaf === node.tag : !candidate.leaf)
      && candidate.texts.length === texts.length && candidate.texts.every((text, index) => text === texts[index]));
    if (sameTexts.length === 0) return null;
    const structure = structureOf(node);
    const hit = sameTexts.find((candidate) => candidate.viewport === viewportName
      && candidate.structure.length === structure.length && candidate.structure.every((count, index) => count === structure[index]));
    if (hit) return { hit };
    const inViewport = sameTexts.filter((candidate) => candidate.viewport === viewportName);
    return {
      miss: {
        set: sameTexts[0].set,
        reason: inViewport.length === 0
          ? `글자 서열은 ${sameTexts.map((candidate) => candidate.variant).join(" | ")} 와 같지만 ${viewportName} variant 가 세트에 없다`
          : `글자 서열은 ${inViewport[0].variant} 와 같지만 구조 서명이 다르다(측정 [${structure.join(",")}] · 세트 [${inViewport[0].structure.join(",")}])`,
      },
    };
  };
  // 글자는 같은데 이 노드에서는 맞지 않은 자리. 그 아래에서 같은 세트가 치환되면(래퍼 · 조상이었다) 버리고, 아니면 사유로 남긴다.
  const contentMisses = [];

  let barDone = false;
  const walk = (node) => {
    if (desktop && node.tag === "header" && node.positioning === "ABSOLUTE"
        && declaredOf(node.path)?.width === SIDEBAR_WIDTH_DECLARATION) {
      if (substitute(node, COMPONENT_SETS.sidebar, sidebarVariant(route),
        `position:fixed header · width: ${SIDEBAR_WIDTH_DECLARATION} (측정 ${round(node.rect.width)}×${round(node.rect.height)}) — 앱 데스크톱 사이드바`)) return;
    }
    if (!barDone && isTopBarRow(node)) {
      barDone = true;
      const set = desktop ? COMPONENT_SETS.desktopTopBar : COMPONENT_SETS.mobileTopBar;
      const barStyle = styleOf(node.path);
      const variant = desktop
        ? desktopTopBarVariant(node, barStyle)
        : mobileTopBarVariant(node, viewport.width, barStyle);
      if (substitute(node, set, variant, `앞머리 버튼 · breadcrumb nav · 뒷머리 버튼을 직접 품은 행 — 앱 상단 바 (${round(node.rect.width)}px)`)) return;
    }
    const content = matchContent(node);
    if (content?.hit) {
      const { hit } = content;
      const why = content.label != null
        ? `글자 속성 부품 — 잎 ${node.tag} · 칠과 타이포 · ${hit.viewport} 일치, 글자 「${content.label}」 는 TEXT 속성 ${hit.label} 로(측정 ${round(node.rect.width)}×${round(node.rect.height)})`
        : `글자 ${hit.texts.length}개 서열 · 구조 서명 [${hit.structure.join(",")}] · ${hit.viewport} 일치 — 기존 본문 컴포넌트(측정 ${round(node.rect.width)}×${round(node.rect.height)})`;
      if (substitute(node, hit.set, hit.variant, why, content.label)) return;
    } else if (content?.miss) {
      contentMisses.push({ path: node.path, ...content.miss });
    }
    // 낱개 정본 프리미티브. 셸·본문보다 **뒤에** 본다 — 셸 안의 버튼은 셸 컴포넌트가 이미
    // 소유하고 있어서, 먼저 보면 같은 픽셀을 두 겹으로 인스턴스화하게 된다.
    const style = styleOf(node.path);
    if (style) {
      for (const site of LOUIS_PRIMITIVE_SITES) {
        const hit = matchLouisPrimitive(site, node, style, evidence);
        if (!hit) continue;
        if (hit.skip) { skipped.push({ path: node.path, set: site.component, reason: hit.skip }); break; }
        if (substitute(node, hit.set, hit.variant, hit.why)) return;
        break;
      }
    }
    for (const child of node.children ?? []) walk(child);
  };
  walk(spec);
  // 가장 안쪽 자리 하나만 남긴다 — 그 아래에서 치환됐거나 더 안쪽에서 같은 이유로 못 맞춘 자리가 있으면 이 노드는 감싸개다.
  for (const miss of contentMisses) {
    const below = (entry) => entry !== miss && entry.set === miss.set && entry.path.startsWith(`${miss.path}.`);
    if (!applied.some(below) && !contentMisses.some(below)) skipped.push({ path: miss.path, set: miss.set, reason: miss.reason });
  }

  return { applied, skipped };
}
