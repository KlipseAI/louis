/**
 * **앱 셸을 컴포넌트 인스턴스로 바꾼다 (screen-application 계층).**
 *
 * 측정 트리를 그대로 그리면 사이드바·상단 바가 화면마다 **도형으로 다시 그려진다**. 그러면
 * 로고·아이콘·활성 상태·색이 전부 빠진 회색 상자가 24화면에 24벌 생기고, 셸을 한 번 고쳐도
 * 어느 화면에도 전파되지 않는다. 디자인 시스템에서 반복되는 셸은 **인스턴스**여야 한다.
 *
 * 그래서 셸에 해당하는 서브트리를 통째로 잘라내고 그 자리에 컴포넌트 variant 인스턴스를 심는다.
 * 자르는 자리와 variant는 **측정값으로 판정한다** — 라우트 이름으로 찍지 않는다.
 *
 * ## 판정 근거
 * - 데스크톱 사이드바: `position:fixed`인 `header`이면서 280×1080. 전 라우트에서 `body.1.0.0.0`.
 * - 상단 바: 높이 53이고 안에 `nav`(breadcrumb)를 가진 가장 바깥 노드.
 * - variant 축은 breadcrumb 텍스트(단일/트레일), 선행 버튼 개수(뒤로가기 유무), 바 폭(Full/Inset).
 *
 * ## 없는 variant는 만들지 않는다
 * 컴포넌트 세트에 없는 조합이 나오면 **치환하지 않고 측정 도형을 남긴다**. 억지로 비슷한 variant를
 * 끼우면 제품과 다른 화면이 된다. 대신 `skipped`로 돌려 컴포넌트 공백을 드러낸다.
 */

/** 라이브 컴포넌트 세트 이름. 렌더러가 이 이름으로 파일에서 찾는다. */
export const SHELL_SETS = Object.freeze({
  sidebar: "Product/Gnb Desktop Shell",
  desktopTopBar: "Product/Desktop App Top Bar",
  mobileTopBar: "Product/Mobile App Top Bar",
});

/**
 * 각 세트가 실제로 가진 variant 목록(2026-08-26 LOUIS 실측).
 * 여기 없는 조합은 치환하지 않는다. 라이브와 어긋나면 렌더러가 적용 시점에 던진다.
 */
const VARIANTS = Object.freeze({
  [SHELL_SETS.sidebar]: [
    "Current=Default", "Current=Home", "Current=YouTube", "Current=Upgrade",
    "Current=NodeCanvas", "Current=VideoEditor", "Current=Highlight",
  ],
  [SHELL_SETS.desktopTopBar]: [
    "Content=Home, Breadcrumb=Single, Back=False, Divider=Off",
    "Content=Settings, Breadcrumb=Single, Back=False, Divider=On",
    "Content=Analytics, Breadcrumb=Trail, Back=False, Divider=On",
    "Content=MyPage, Breadcrumb=Single, Back=False, Divider=On",
    "Content=Subscription, Breadcrumb=Trail, Back=False, Divider=On",
    "Content=Subscription, Breadcrumb=Trail, Back=True, Divider=On",
  ],
  [SHELL_SETS.mobileTopBar]: [
    "Width=Full, Breadcrumb=Single, Back=False, Divider=Off",
    "Width=Full, Breadcrumb=Single, Back=False, Divider=On",
    "Width=Full, Breadcrumb=Trail, Back=False, Divider=On",
    "Width=Inset, Breadcrumb=Single, Back=False, Divider=On",
    "Width=Inset, Breadcrumb=Trail, Back=False, Divider=On",
    "Width=Inset, Breadcrumb=Trail, Back=True, Divider=On",
  ],
});

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
export function applyShellInstances(spec, { route, context, viewport }) {
  const desktop = context.startsWith("desktop");
  const applied = [];
  const skipped = [];

  const substitute = (node, set, variant, why) => {
    if (!variant) { skipped.push({ path: node.path, set, reason: "variant 축을 판정하지 못했다" }); return false; }
    if (!VARIANTS[set].includes(variant)) {
      skipped.push({ path: node.path, set, variant, reason: "컴포넌트 세트에 없는 조합" });
      return false;
    }
    node.instance = { set, variant, why };
    node.children = [];
    applied.push({ path: node.path, set, variant });
    return true;
  };

  let barDone = false;
  const walk = (node) => {
    if (desktop && node.tag === "header" && node.positioning === "ABSOLUTE"
        && Math.round(node.rect.width) === 280) {
      if (substitute(node, SHELL_SETS.sidebar, sidebarVariant(route),
        "position:fixed 280×1080 header — 앱 데스크톱 사이드바")) return;
    }
    if (!barDone && Math.round(node.rect.height) === 53
        && findDescendant(node, (child) => child.tag === "nav")) {
      barDone = true;
      const set = desktop ? SHELL_SETS.desktopTopBar : SHELL_SETS.mobileTopBar;
      const variant = desktop ? desktopTopBarVariant(node) : mobileTopBarVariant(node, viewport.width);
      if (substitute(node, set, variant, `높이 53 + breadcrumb nav — 앱 상단 바 (${round(node.rect.width)}px)`)) return;
    }
    for (const child of node.children ?? []) walk(child);
  };
  walk(spec);

  return { applied, skipped };
}
