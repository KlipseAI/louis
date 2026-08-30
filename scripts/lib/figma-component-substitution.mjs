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
 * - 셸: 구조(절대 배치 280×1080 header / 높이 53 + breadcrumb nav)로 찾는다.
 * - 본문 블록: **정렬된 텍스트 목록이 완전히 같고 rect가 1px 이내로 같을 때만** 치환한다.
 *   텍스트 하나만 달라도 다른 화면이므로 치환하지 않는다.
 *
 * ## 없는 variant는 만들지 않는다
 * 컴포넌트 세트에 없는 조합이 나오면 치환하지 않고 측정 도형을 남기고 `skipped`로 돌린다.
 * 억지로 비슷한 variant를 끼우면 제품과 다른 화면이 된다.
 */

/** 라이브 컴포넌트 세트 이름. 렌더러가 이 이름으로 파일에서 찾는다. */
export const COMPONENT_SETS = Object.freeze({
  sidebar: "Product/Gnb Desktop Shell",
  desktopTopBar: "Product/Desktop App Top Bar",
  mobileTopBar: "Product/Mobile App Top Bar",
  paymentResult: "Product/Payment Result Content",
  checkoutStatus: "Product/Checkout Status Content",
  upgradePlanCard: "Product/Upgrade Plan Card",
  upgradePlanCardSlice: "Product/Upgrade Plan Card Visible Slice",
});

/**
 * 각 세트가 실제로 가진 variant 목록(2026-08-26 LOUIS 실측).
 * 여기 없는 조합은 치환하지 않는다. 라이브와 어긋나면 렌더러가 적용 시점에 던진다.
 */
const VARIANTS = Object.freeze({
  [COMPONENT_SETS.sidebar]: [
    "Current=Default", "Current=Home", "Current=YouTube", "Current=Upgrade",
    "Current=NodeCanvas", "Current=VideoEditor", "Current=Highlight",
  ],
  [COMPONENT_SETS.desktopTopBar]: [
    "Content=Home, Breadcrumb=Single, Back=False, Divider=Off",
    "Content=Settings, Breadcrumb=Single, Back=False, Divider=On",
    "Content=Analytics, Breadcrumb=Trail, Back=False, Divider=On",
    "Content=MyPage, Breadcrumb=Single, Back=False, Divider=On",
    "Content=Subscription, Breadcrumb=Trail, Back=False, Divider=On",
    "Content=Subscription, Breadcrumb=Trail, Back=True, Divider=On",
  ],
  [COMPONENT_SETS.mobileTopBar]: [
    "Width=Full, Breadcrumb=Single, Back=False, Divider=Off",
    "Width=Full, Breadcrumb=Single, Back=False, Divider=On",
    "Width=Full, Breadcrumb=Trail, Back=False, Divider=On",
    "Width=Inset, Breadcrumb=Single, Back=False, Divider=On",
    "Width=Inset, Breadcrumb=Trail, Back=False, Divider=On",
    "Width=Inset, Breadcrumb=Trail, Back=True, Divider=On",
  ],
});

/**
 * **본문 블록 컴포넌트 색인 (2026-08-26 LOUIS 실측).**
 *
 * 결제 결과·체크아웃 상태 본문과 요금제 카드는 **이미 완성된 컴포넌트**다. 크기가 측정값과
 * 0.5px 이내로 일치하고 텍스트가 글자 그대로 같다 — 즉 이 컴포넌트들이 곧 실측 정본이다.
 * 다시 그리지 않고 인스턴스를 심는다.
 *
 * `texts`는 컴포넌트 안의 TEXT 노드를 **문서 순서대로** 모은 것이다. 측정 서브트리의 텍스트가
 * 이 목록과 완전히 같고 rect가 1px 이내일 때만 치환한다. 한 글자라도 다르면 다른 화면이다.
 */
const CONTENT_COMPONENTS = Object.freeze([
  { set: "Product/Payment Result Content", variant: "Outcome=Failure, Viewport=Desktop", size: [520, 238],
    texts: ["Payment was not completed.", "Payment request failed", "Error code", "UNKNOWN_ERROR", "Go to My Page"] },
  { set: "Product/Payment Result Content", variant: "Outcome=Failure, Viewport=Mobile", size: [370, 320],
    texts: ["Payment was not completed.", "Payment request failed", "Error code", "UNKNOWN_ERROR", "Go to My Page"] },
  { set: "Product/Payment Result Content", variant: "Outcome=PlanDelayed, Viewport=Desktop", size: [520, 217],
    texts: ["Payment confirmed, but plan update delayed", "Billing authorization information is missing from the success URL.", "Go to My Page"] },
  { set: "Product/Payment Result Content", variant: "Outcome=PlanDelayed, Viewport=Mobile", size: [370, 284],
    texts: ["Payment confirmed, but plan update delayed", "Billing authorization information is missing from the success URL.", "Go to My Page"] },
  { set: "Product/Payment Result Content", variant: "Outcome=TopupDelayed, Viewport=Desktop", size: [520, 217],
    texts: ["Payment confirmed, but credit top-up delayed", "Payment information is missing from the success URL.", "Go to My Page"] },
  { set: "Product/Payment Result Content", variant: "Outcome=TopupDelayed, Viewport=Mobile", size: [370, 263],
    texts: ["Payment confirmed, but credit top-up delayed", "Payment information is missing from the success URL.", "Go to My Page"] },

  { set: "Product/Checkout Status Content", variant: "Outcome=BillingSuccess, Viewport=Desktop", size: [520, 338],
    texts: ["Payment confirmed, but plan update delayed", "Billing authorization information is missing from the success URL.", "Billing authorization information is missing from the success URL.", "Back to plans", "Try again"] },
  { set: "Product/Checkout Status Content", variant: "Outcome=BillingSuccess, Viewport=Mobile", size: [370, 426],
    texts: ["Payment confirmed, but plan update delayed", "Billing authorization information is missing from the success URL.", "Billing authorization information is missing from the success URL.", "Back to plans", "Try again"] },
  { set: "Product/Checkout Status Content", variant: "Outcome=BillingFail, Viewport=Desktop", size: [520, 382],
    texts: ["Payment was not completed.", "The payment was cancelled or an error occurred during checkout. Your plan was not changed, and no subscription payment was completed.", "Error code", "UNKNOWN_ERROR", "Message", "Payment request failed", "Back to plans", "Go to archive"] },
  { set: "Product/Checkout Status Content", variant: "Outcome=BillingFail, Viewport=Mobile", size: [370, 516],
    texts: ["Payment was not completed.", "The payment was cancelled or an error occurred during checkout. Your plan was not changed, and no subscription payment was completed.", "Error code", "UNKNOWN_ERROR", "Message", "Payment request failed", "Back to plans", "Go to archive"] },
  { set: "Product/Checkout Status Content", variant: "Outcome=CheckoutFail, Viewport=Desktop", size: [520, 428],
    texts: ["Payment was not completed.", "The payment was cancelled or an error occurred during checkout. Your plan was not changed, and no subscription payment was completed.", "Error code", "UNKNOWN_ERROR", "Message", "Payment request failed", "Order ID", "-", "Back to plans", "Go to archive"] },
  { set: "Product/Checkout Status Content", variant: "Outcome=CheckoutFail, Viewport=Mobile", size: [370, 599],
    texts: ["Payment was not completed.", "The payment was cancelled or an error occurred during checkout. Your plan was not changed, and no subscription payment was completed.", "Error code", "UNKNOWN_ERROR", "Message", "Payment request failed", "Order ID", "-", "Back to plans", "Go to archive"] },

  { set: "Product/Upgrade Plan Card", variant: "Plan=Trial, Viewport=Desktop", size: [316, 560],
    texts: ["Trial", "Free", "200", "credits", "Core features for trying Klipse", "Up to 3 projects", "1 video editor upload, 2 imports", "AI video generation trial", "Basic video cut editing", "Highlight input videos up to 10 min", "Watermark included", "Current plan"] },
  { set: "Product/Upgrade Plan Card", variant: "Plan=Basic, Viewport=Desktop", size: [316, 560],
    texts: ["Basic", "35,900 KRW", "per month", "1,800", "credits", "Everything in Trial", "Up to 12 projects", "5 video editor uploads, 5 imports", "All AI models unlocked", "Text/image overlay, TTS", "YouTube/Instagram upload, schedule & analytics", "AI prompt & caption assist", "Highlight input videos up to 30 min", "Credit top-up available", "No watermark", "Choose Basic"] },
  { set: "Product/Upgrade Plan Card", variant: "Plan=Pro, Viewport=Desktop", size: [316, 560],
    texts: ["Pro", "59,900 KRW", "per month", "3,000", "credits", "Everything in Basic", "Up to 24 projects", "7 video editor uploads, 7 imports", "Highlight input videos up to 120 min", "3 concurrent jobs", "Priority queue processing", "Choose Pro"] },
  { set: "Product/Upgrade Plan Card", variant: "Plan=Max, Viewport=Desktop", size: [316, 560],
    texts: ["Max", "89,900 KRW", "per month", "4,500", "credits", "Everything in Pro", "Unlimited projects", "10 video editor uploads, 10 imports", "10 highlight clip selections", "Maximum monthly credits", "Choose Max"] },

  { set: "Product/Upgrade Plan Card Visible Slice", variant: "Plan=Trial, Evidence=VisibleSlice", size: [179, 693.59],
    texts: ["Trial", "Free", "200", "credits", "Core features for trying Klipse", "Up to 3 projects", "1 video editor upload, 2 imports", "AI video generation trial", "Basic video cut editing", "Highlight input videos up to 10 min", "Watermark included"] },
  { set: "Product/Upgrade Plan Card Visible Slice", variant: "Plan=Basic, Evidence=VisibleSlice", size: [179, 693.59],
    texts: ["Basic", "35,900 KRW", "per month", "1,800", "credits", "Everything in Trial", "Up to 12 projects", "5 video editor uploads, 5 imports", "All AI models unlocked", "Text/image overlay, TTS", "YouTube/Instagram upload, schedule & analytics", "AI prompt & caption assist"] },
]);

/** breadcrumb 첫 라벨 → 데스크톱 상단 바의 `Content` 축. */
const CONTENT_BY_LABEL = Object.freeze({
  "Home": "Home",
  "Settings": "Settings",
  "Analytics": "Analytics",
  "My Page": "MyPage",
  "Subscription": "Subscription",
});

/** 사이드바 활성 항목 — 제품 내비에 있는 라우트만. 나머지는 활성 항목이 없으므로 Default. */
const SIDEBAR_CURRENT = Object.freeze({
  "/archive": "Home",
  "/analytics/youtube": "YouTube",
  "/mypage/upgrade": "Upgrade",
});

const round = (value) => Math.round((value ?? 0) * 100) / 100;

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

function sidebarVariant(route) {
  return `Current=${SIDEBAR_CURRENT[route] ?? "Default"}`;
}

function desktopTopBarVariant(bar) {
  const labels = breadcrumbLabels(bar);
  const content = CONTENT_BY_LABEL[labels[0]];
  if (!content) return null;
  const breadcrumb = labels.length > 1 ? "Trail" : "Single";
  const back = leadingButtonCount(bar) >= 2 ? "True" : "False";
  const divider = content === "Home" ? "Off" : "On";
  return `Content=${content}, Breadcrumb=${breadcrumb}, Back=${back}, Divider=${divider}`;
}

function mobileTopBarVariant(bar, viewportWidth) {
  const labels = breadcrumbLabels(bar);
  if (labels.length === 0) return null;
  const width = Math.round(bar.rect.width) >= Math.round(viewportWidth) ? "Full" : "Inset";
  const breadcrumb = labels.length > 1 ? "Trail" : "Single";
  const back = leadingButtonCount(bar) >= 2 ? "True" : "False";
  return `Width=${width}, Breadcrumb=${breadcrumb}, Back=${back}, Divider=On`;
}

/** 셸 자리를 인스턴스로 바꾼다. spec을 제자리에서 수정하고 적용·보류 목록을 돌려준다. */
export function applyComponentInstances(spec, { route, context, viewport }) {
  const desktop = context.startsWith("desktop");
  const applied = [];
  const skipped = [];

  const substitute = (node, set, variant, why) => {
    if (!variant) { skipped.push({ path: node.path, set, reason: "variant 축을 판정하지 못했다" }); return false; }
    const known = VARIANTS[set] ?? CONTENT_COMPONENTS.filter((entry) => entry.set === set).map((entry) => entry.variant);
    if (!known.includes(variant)) {
      skipped.push({ path: node.path, set, variant, reason: "컴포넌트 세트에 없는 조합" });
      return false;
    }
    node.instance = { set, variant, why };
    node.children = [];
    applied.push({ path: node.path, set, variant });
    return true;
  };

  // 본문 블록 — **정렬된 텍스트가 완전히 같고 rect가 1px 이내**일 때만 이미 있는 컴포넌트로 바꾼다.
  const matchContent = (node) => {
    if (!node.children?.length) return null;
    const texts = textsOf(node).filter(Boolean);
    if (texts.length === 0) return null;
    return CONTENT_COMPONENTS.find((candidate) =>
      Math.abs(candidate.size[0] - node.rect.width) <= 1
      && Math.abs(candidate.size[1] - node.rect.height) <= 1
      && candidate.texts.length === texts.length
      && candidate.texts.every((text, index) => text === texts[index])) ?? null;
  };

  let barDone = false;
  const walk = (node) => {
    if (desktop && node.tag === "header" && node.positioning === "ABSOLUTE"
        && Math.round(node.rect.width) === 280) {
      if (substitute(node, COMPONENT_SETS.sidebar, sidebarVariant(route),
        "position:fixed 280×1080 header — 앱 데스크톱 사이드바")) return;
    }
    if (!barDone && Math.round(node.rect.height) === 53
        && findDescendant(node, (child) => child.tag === "nav")) {
      barDone = true;
      const set = desktop ? COMPONENT_SETS.desktopTopBar : COMPONENT_SETS.mobileTopBar;
      const variant = desktop ? desktopTopBarVariant(node) : mobileTopBarVariant(node, viewport.width);
      if (substitute(node, set, variant, `높이 53 + breadcrumb nav — 앱 상단 바 (${round(node.rect.width)}px)`)) return;
    }
    const content = matchContent(node);
    if (content) {
      if (substitute(node, content.set, content.variant,
        `텍스트 ${content.texts.length}개 일치 + rect ${round(node.rect.width)}×${round(node.rect.height)} — 기존 본문 컴포넌트`)) return;
    }
    for (const child of node.children ?? []) walk(child);
  };
  walk(spec);

  return { applied, skipped };
}
