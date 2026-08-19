import { execFileSync } from "node:child_process";
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";
import { atomicWriteBatch } from "./lib/atomic-output.mjs";

// **제품 컴포넌트를 실제로 렌더해서 잰다.**
//
// 그전까지 제품 값은 전부 소스 읽기였다 — screen-inventory.md가 스스로
// "브라우저 실측 렌더를 하지 않았다"고 적어 두었고, product.measured.json의 187축 중 기계가
// 대조하는 것은 12축뿐이었다. 나머지는 사람이 코드를 읽고 옮긴 값이다.
//
// 제품 서버는 띄우지 않는다(.env.local이 실제 서비스에 붙는다). 대신 제품의 **클래스 문자열**을
// 제품 자신의 Tailwind로 컴파일하고, 제품 CSS와 함께 브라우저에 올려 계산값을 읽는다.
//
// **클래스 문자열을 손으로 옮겨 적지 않는다.** 옮겨 적으면 그 순간부터 제품과 갈라지고,
// 갈라진 줄 모르는 채로 게이트가 초록으로 남는다. `from`이 제품 소스의 상수 이름을 가리키고
// 이 스크립트가 그 배열을 커밋에서 직접 꺼낸다 — 제품이 값을 바꾸면 여기 기록이 어긋난다.
const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const outputPath = resolve(repoRoot, "migration/product.rendered-components.json");
const productRoot = process.env.KLIPSE_PRODUCT_REPO ?? "/Users/sejunki/klipse-web";
const productRef = process.env.KLIPSE_PRODUCT_REF ?? "origin/main";
const checkOnly = process.argv.includes("--check");

const FILES = {
  gnb: "apps/web/components/navigation/Gnb.tsx",
  appHome: "apps/web/components/scenes/appHomeSceneStyles.ts",
  highlight: "apps/web/components/scenes/highlightSceneStyles.ts",
  myPage: "apps/web/components/scenes/myPageSceneStyles.ts",
  carousel: "apps/web/components/banners/TabBannerCarousel.tsx",
  avatar: "apps/web/components/navigation/UserCircleDefaultAvatar.tsx",
  spinner: "apps/web/components/ui/LoadingSpinner.tsx",
  canvasEmpty: "apps/web/components/scenes/create/node-canvas-v2/components/CanvasEmptyState.tsx",
  vem: "apps/web/components/scenes/create/node-canvas-v2/nodes/VideoEditModal.tsx",
  crop: "apps/web/components/scenes/create/node-canvas-v2/nodes/videoEditParts/ClipCropModal.tsx",
};

// 재는 대상. `from`은 제품 소스의 상수를 가리키고, `html`은 제품에 공용 상수가 없어
// 클래스를 직접 적어야 하는 경우에만 쓴다(그 사유를 source에 적는다).
const PROBES = [
  {
    id: "button-md",
    source: "apps/web/components/ui/Button.tsx ROOT + SIZE_MD",
    html: `<button class="box-border relative inline-flex items-center justify-center rounded-[var(--button-radius)] whitespace-nowrap h-[var(--button-height)] py-0 px-[var(--button-padding-inline)] gap-4">저장</button>`,
    read: ["height", "paddingLeft", "paddingRight", "borderTopLeftRadius", "columnGap"],
  },
  {
    id: "button-sm",
    source: "apps/web/components/ui/Button.tsx ROOT + SIZE_SM",
    html: `<button class="box-border relative inline-flex items-center justify-center rounded-[var(--button-radius)] whitespace-nowrap h-[var(--button-height-sm)] min-w-[var(--button-min-width-sm)] py-0 px-[var(--button-padding-inline-sm)] gap-2">저장</button>`,
    read: ["height", "paddingLeft", "paddingRight", "borderTopLeftRadius", "columnGap", "minWidth"],
  },
  {
    id: "button-secondary-border",
    source: "apps/web/components/ui/Button.tsx BORDER_SECONDARY",
    html: `<button class="box-border [border:1px_solid_rgb(var(--palette-gray-900-rgb)/12%)] rounded-[var(--button-radius)] h-[var(--button-height)]">저장</button>`,
    read: ["borderTopWidth", "borderTopColor"],
  },
  {
    id: "icon-button",
    source: "Gnb.tsx iconButton — 제품에 공용 IconButton은 없고 이것이 가장 많이 쓰인 벌이다",
    from: ["gnb", "iconButton"],
    tag: "button",
    read: ["width", "height", "borderTopLeftRadius"],
  },
  {
    id: "icon-button-card",
    source: "appHomeSceneStyles.ts archiveMoreButton — 카드 위 more 버튼",
    from: ["appHome", "archiveMoreButton"],
    tag: "button",
    read: ["width", "height", "borderTopLeftRadius"],
  },
  {
    id: "project-card",
    source: "apps/web/components/scenes/appHomeSceneStyles.ts archiveCard",
    html: `<div class="[position:relative] [display:grid] [gap:12px] [row-gap:8px] [padding:0] [min-width:0] [border-radius:16px]"></div>`,
    read: ["borderTopLeftRadius", "rowGap", "columnGap", "padding"],
  },
  {
    id: "project-card-overlay",
    source: "apps/web/components/scenes/appHomeSceneStyles.ts archivePreviewTitleOverlay",
    html: `<div class="[position:absolute] [height:30%] [padding:16px] [border-radius:0_0_16px_16px]"></div>`,
    read: ["padding", "borderBottomLeftRadius", "height"],
  },
  {
    id: "project-card-preview",
    source: "appHomeSceneStyles.ts archivePreview — 카드 미디어 면",
    from: ["appHome", "archivePreview"],
    read: ["borderTopLeftRadius"],
  },
  {
    id: "project-grid",
    source: "apps/web/components/scenes/appHomeSceneStyles.ts archiveGrid",
    html: `<div class="[display:grid] [grid-template-columns:repeat(2,_1fr)] [gap:12px] min-[1200px]:[grid-template-columns:repeat(4,_1fr)]"></div>`,
    read: ["columnGap", "rowGap", "gridTemplateColumns"],
  },
  {
    id: "tooltip",
    source: "globals.css .app-tooltip-chrome — 제품 툴팁 면·타이포 SSOT",
    html: `<div class="app-tooltip-chrome">저장</div>`,
    read: ["paddingTop", "paddingLeft", "borderTopLeftRadius", "borderTopWidth", "fontSize", "lineHeight", "height"],
  },
  {
    id: "toast",
    source: "appHomeSceneStyles.ts toast",
    from: ["appHome", "toast"],
    text: "저장했어요",
    read: ["paddingTop", "paddingLeft", "borderTopLeftRadius", "borderTopWidth", "backdropFilter", "height"],
  },
  // ── 경쟁 정의 ────────────────────────────────────────────────────────────
  // "제품에 정본이 없다"는 **주장이 아니라 증거여야 한다.** 한 벌만 재고 정본이 없다고 적으면
  // 그 판단을 아무도 검증할 수 없다. 갈리는 컴포넌트는 경쟁 정의도 함께 재서 **무엇이 얼마나
  // 갈리는지**를 게이트가 들고 있게 한다.
  {
    id: "toast-highlight",
    source: "highlightSceneStyles.ts toast — appHome 벌과 바이트 동일한 두 번째 정의",
    from: ["highlight", "toast"],
    text: "저장했어요",
    read: ["paddingTop", "paddingLeft", "borderTopLeftRadius", "backdropFilter"],
  },
  {
    id: "toast-mypage",
    source: "myPageSceneStyles.ts toast — 갈리는 세 번째 정의(알약 · 불투명 면 · 테두리)",
    from: ["myPage", "toast"],
    text: "저장했어요",
    read: ["paddingTop", "paddingLeft", "borderTopLeftRadius", "borderTopWidth"],
  },
  {
    id: "dialog-card-mypage",
    source: "myPageSceneStyles.ts modalCard — appHome 벌과 기하가 같은 두 번째 정의",
    from: ["myPage", "modalCard"],
    hostWidth: 1440,
    read: ["width", "paddingTop", "borderTopLeftRadius", "rowGap"],
  },
  {
    id: "menu-panel",
    source: "globals.css --dropdown-radius / --dropdown-padding — 제품 드롭다운 면 SSOT",
    html: `<div class="[border-radius:var(--dropdown-radius)] [padding:var(--dropdown-padding)] [background:var(--dropdown-surface-bg)]"></div>`,
    read: ["borderTopLeftRadius", "paddingTop", "paddingLeft"],
  },
  {
    id: "menu-item",
    source: "highlightSceneStyles.ts historyDropdownItem",
    from: ["highlight", "historyDropdownItem"],
    tag: "button",
    text: "이름 바꾸기",
    read: ["paddingTop", "paddingLeft", "columnGap", "borderTopLeftRadius", "height"],
  },
  {
    id: "dialog-card",
    source: "appHomeSceneStyles.ts modalCard",
    from: ["appHome", "modalCard"],
    hostWidth: 1440,
    read: ["width", "paddingTop", "paddingLeft", "borderTopLeftRadius", "borderTopWidth"],
  },
  {
    id: "dialog-overlay",
    source: "appHomeSceneStyles.ts modalOverlay",
    from: ["appHome", "modalOverlay"],
    read: ["backgroundColor", "zIndex"],
  },
  {
    id: "dialog-action",
    source: "appHomeSceneStyles.ts modalConfirm",
    from: ["appHome", "modalConfirm"],
    tag: "button",
    text: "삭제",
    read: ["height", "borderTopLeftRadius"],
  },
  {
    id: "input-box",
    source: "myPageSceneStyles.ts modalAuthInputBox + modalAuthInputBoxSingle",
    from: ["myPage", "modalAuthInputBox", "modalAuthInputBoxSingle"],
    read: ["paddingTop", "paddingLeft", "borderTopWidth", "borderTopLeftRadius"],
  },
  {
    id: "empty-state",
    source: "appHomeSceneStyles.ts emptyState",
    from: ["appHome", "emptyState"],
    read: ["paddingTop", "paddingLeft", "rowGap", "borderTopWidth", "borderTopLeftRadius"],
  },
  {
    id: "empty-state-actions",
    source: "CanvasEmptyState.tsx ACTIONS_CLASS — 제품에서 액션이 둘 이상인 빈 상태는 이 한 벌뿐이다",
    from: ["canvasEmpty", "ACTIONS_CLASS"],
    read: ["columnGap"],
  },
  {
    id: "avatar",
    source: "UserCircleDefaultAvatar.tsx AVATAR",
    from: ["avatar", "AVATAR"],
    read: ["width", "height"],
  },
  {
    id: "badge",
    source: "highlightSceneStyles.ts historyCardStatus — 제품 상태 배지",
    from: ["highlight", "historyCardStatus"],
    text: "완료",
    read: ["paddingTop", "paddingLeft", "borderTopLeftRadius", "borderTopWidth"],
  },
  {
    id: "spinner-md",
    source: "LoadingSpinner.tsx SPINNER_BASE + SPINNER_MD",
    from: ["spinner", "SPINNER_BASE", "SPINNER_MD"],
    read: ["width", "height", "::after:borderTopWidth"],
  },
  {
    id: "spinner-sm",
    source: "LoadingSpinner.tsx SPINNER_BASE + SPINNER_SM",
    from: ["spinner", "SPINNER_BASE", "SPINNER_SM"],
    read: ["width", "height", "::after:borderTopWidth"],
  },
  {
    id: "checkbox",
    source: "globals.css .app-native-checkbox — 제품 선택 목록 정본",
    html: `<input type="checkbox" class="app-native-checkbox" />`,
    read: ["width", "height"],
  },
  {
    id: "selectable-row",
    source: "highlightSceneStyles.ts clipDetailListItem",
    from: ["highlight", "clipDetailListItem"],
    tag: "button",
    text: "클립 1",
    read: ["paddingTop", "paddingLeft", "columnGap", "borderTopLeftRadius"],
  },
  {
    id: "segmented-track",
    source: "myPageSceneStyles.ts settingsToggleWrap",
    from: ["myPage", "settingsToggleWrap"],
    tag: "span",
    read: ["paddingTop", "paddingLeft", "columnGap", "borderTopLeftRadius"],
  },
  {
    id: "segmented-segment",
    source: "myPageSceneStyles.ts settingsToggleBtn",
    from: ["myPage", "settingsToggleBtn"],
    tag: "button",
    text: "시스템",
    read: ["height", "paddingLeft", "borderTopLeftRadius"],
  },
  {
    id: "segmented-thumb",
    source: "myPageSceneStyles.ts settingsToggleThumb",
    from: ["myPage", "settingsToggleThumb"],
    tag: "span",
    read: ["height", "borderTopLeftRadius", "top"],
  },
  {
    id: "skeleton",
    source: "myPageSceneStyles.ts skeletonBlock",
    from: ["myPage", "skeletonBlock"],
    read: ["borderTopLeftRadius", "::after:animationDuration"],
  },
  {
    id: "nav-item",
    source: "Gnb.tsx menuLink (사이드바 문맥)",
    from: ["gnb", "menuLink"],
    tag: "button",
    wrapper: "gnb-menu gnb-menuSidebar",
    text: "아카이브",
    read: ["height", "paddingLeft", "paddingRight", "borderTopLeftRadius", "fontSize"],
  },
  {
    id: "nav-item-collapsed",
    source: "Gnb.tsx menuLink (사이드바 접힘)",
    from: ["gnb", "menuLink"],
    tag: "button",
    wrapper: "gnb-menu gnb-menuSidebar",
    doc: "collapsed",
    text: "아카이브",
    read: ["width", "height", "paddingLeft", "paddingRight"],
  },
  {
    id: "nav-row",
    source: "Gnb.tsx menuSidebarCreateCompound — 내비 항목과 「+」가 한 줄을 나눠 쓰는 행",
    from: ["gnb", "menuLink", "menuSidebarCreateCompound"],
    wrapper: ["gnb-menu gnb-menuSidebar"],
    read: ["columnGap"],
  },
  {
    id: "nav-row-action",
    source: "Gnb.tsx menuSidebarCreateAddonInset — 행 안쪽 끝의 「+」",
    from: ["gnb", "menuSidebarCreateAddonInset"],
    tag: "button",
    read: ["width", "height", "borderTopLeftRadius"],
  },
  {
    id: "sidebar-header-row",
    source: "Gnb.tsx sidebarHeaderRow",
    from: ["gnb", "sidebarHeaderRow"],
    read: ["minHeight", "columnGap", "paddingLeft"],
  },
  {
    id: "sidebar-header-row-collapsed",
    source: "Gnb.tsx sidebarHeaderRow (접힘)",
    from: ["gnb", "sidebarHeaderRow"],
    doc: "collapsed",
    read: ["paddingLeft"],
  },
  {
    id: "sidebar-logo-rail",
    source: "Gnb.tsx sidebarLogoRail",
    from: ["gnb", "sidebarLogoRail"],
    read: ["minHeight"],
  },
  {
    id: "sidebar-cta",
    source: "Gnb.tsx sidebarUpgradeButton",
    from: ["gnb", "sidebarUpgradeButton"],
    tag: "button",
    text: "업그레이드",
    read: ["minHeight", "paddingTop", "paddingLeft", "columnGap", "borderTopLeftRadius", "backgroundColor", "color", "boxShadow"],
  },
  {
    id: "sidebar-cta-collapsed",
    source: "Gnb.tsx sidebarUpgradeButton (접힘)",
    from: ["gnb", "sidebarUpgradeButton"],
    tag: "button",
    doc: "collapsed",
    text: "업그레이드",
    read: ["minHeight", "height", "paddingTop", "paddingLeft", "columnGap"],
  },
  {
    id: "sidebar-cta-label-collapsed",
    source: "Gnb.tsx sidebarUpgradeLabel (접힘)",
    from: ["gnb", "sidebarUpgradeLabel"],
    tag: "span",
    doc: "collapsed",
    text: "업그레이드",
    read: ["maxWidth", "fontSize"],
  },
  {
    id: "nav-item-hover",
    source: "Gnb.tsx menuLink :hover (사이드바, 다크)",
    // Active 클래스는 요소에 붙이지 않는다 — hover 규칙이 `:not(.gnb-menuLinkActive)`라
    // 붙이면 규칙이 매칭되지 않는다. 규칙 자체는 파일 전체를 컴파일하므로 이미 스타일시트에 있다.
    from: ["gnb", "menuLink"],
    tag: "button",
    wrapper: ["gnb-menu gnb-menuSidebar"],
    doc: "hover",
    hover: true,
    text: "아카이브",
    read: ["backgroundColor", "color"],
  },
  {
    id: "nav-item-hover-light",
    source: "Gnb.tsx menuLink :hover (사이드바, 라이트)",
    from: ["gnb", "menuLink"],
    tag: "button",
    wrapper: ["gnb-menu gnb-menuSidebar"],
    doc: "hover-light",
    hover: true,
    text: "아카이브",
    read: ["backgroundColor", "--palette-gray-300-rgb"],
  },
  {
    id: "sidebar-cta-light",
    source: "Gnb.tsx sidebarUpgradeButton (라이트)",
    from: ["gnb", "sidebarUpgradeButton"],
    tag: "button",
    doc: "light",
    text: "업그레이드",
    read: ["backgroundColor", "color", "boxShadow"],
  },
  {
    id: "sidebar-cta-current",
    source: "Gnb.tsx sidebarUpgradeButton + sidebarUpgradeButtonActive (현재 위치)",
    from: ["gnb", "sidebarUpgradeButton", "sidebarUpgradeButtonActive"],
    tag: "button",
    text: "업그레이드",
    read: ["backgroundColor", "color"],
  },
  {
    id: "sidebar-cta-current-light",
    source: "Gnb.tsx sidebarUpgradeButton + sidebarUpgradeButtonActive (라이트)",
    from: ["gnb", "sidebarUpgradeButton", "sidebarUpgradeButtonActive"],
    tag: "button",
    doc: "light",
    text: "업그레이드",
    read: ["backgroundColor", "color"],
  },
  {
    id: "nav-item-inner",
    source: "Gnb.tsx menuLinkInner — 아이콘과 라벨 사이 간격을 갖는 것은 행이 아니라 이 안쪽 상자다",
    from: ["gnb", "menuLinkInner"],
    wrapper: ["gnb-menu gnb-menuSidebar"],
    text: "아카이브",
    read: ["columnGap"],
  },
  {
    id: "nav-item-inner-collapsed",
    source: "Gnb.tsx menuLinkInner (접힘)",
    from: ["gnb", "menuLinkInner"],
    wrapper: ["gnb-menu gnb-menuSidebar"],
    doc: "collapsed",
    text: "아카이브",
    read: ["columnGap"],
  },
  {
    id: "top-bar-title",
    source: "Gnb.tsx mainChromePageNavTitle",
    from: ["gnb", "mainChromePageNavTitle"],
    text: "홈",
    read: ["fontSize", "lineHeight", "fontWeight"],
  },
  {
    id: "top-bar-leading",
    source: "Gnb.tsx mainChromeLeadingCluster",
    from: ["gnb", "mainChromeLeadingCluster"],
    read: ["columnGap"],
  },
  {
    id: "top-bar",
    source: "Gnb.tsx mainChromeTopBar + mainChromeTopBarInPanel",
    from: ["gnb", "mainChromeTopBar", "mainChromeTopBarInPanel"],
    hostWidth: 1440,
    text: "홈",
    read: ["paddingTop", "paddingLeft", "columnGap", "height"],
  },
  // Slider — 제품에 공용 구현이 없고 37벌이 일곱 레시피로 갈린다. 그래서 "대조 불가"로 두었는데
  // 그것은 틀렸다. **가장 많이 쓰이는 벌과 DS 기하에 가장 가까운 벌은 고를 수 있고**, 고른 이유를
  // 적으면 그 자체가 판정이다. 아무것도 재지 않는 것보다 무엇을 골랐는지 적고 재는 것이 낫다.
  {
    id: "slider-thumb-root",
    source: "ClipCropModal.tsx CROP_SLIDER_ROOT — thumb형 중 DS 기하에 가장 가까운 벌",
    from: ["crop", "CROP_SLIDER_ROOT"],
    read: ["height"],
  },
  {
    id: "slider-thumb-rail",
    source: "ClipCropModal.tsx CROP_SLIDER_TRACK",
    from: ["crop", "CROP_SLIDER_TRACK"],
    read: ["height", "borderTopLeftRadius"],
  },
  {
    id: "slider-thumb-handle",
    source: "ClipCropModal.tsx CROP_SLIDER_THUMB",
    from: ["crop", "CROP_SLIDER_THUMB"],
    read: ["width", "height", "borderTopWidth"],
  },
  {
    id: "slider-track-root",
    source: "VideoEditModal.tsx overlayRadixRootFull — track형 중 최다 사용(8곳)",
    from: ["vem", "overlayRadixRootFull"],
    read: ["height"],
  },
  {
    id: "slider-track-root-panel",
    source: "VideoEditModal.tsx overlayRadixRootFull (인스펙터 패널 안)",
    from: ["vem", "overlayRadixRootFull"],
    wrapper: ["vem-propertiesPanel"],
    read: ["height"],
  },
  {
    id: "slider-track-marker",
    source: "VideoEditModal.tsx overlayRadixRange ::after — 채움 오른쪽 끝 표식",
    from: ["vem", "overlayRadixRange"],
    wrapper: ["vem-overlay-radix-root-full"],
    read: ["::after:width", "::after:height"],
  },
  {
    id: "progress-bar-track",
    source: "highlightSceneStyles.ts progressBarTrack — determinate 진행바 두 벌 중 하나",
    from: ["highlight", "progressBarTrack"],
    read: ["height", "maxWidth", "borderTopLeftRadius"],
  },
  {
    id: "progress-bar-fill",
    source: "highlightSceneStyles.ts progressBarFill",
    from: ["highlight", "progressBarFill"],
    read: ["borderTopLeftRadius"],
  },
  {
    id: "progress-ring",
    source: "Gnb.tsx profileTrigger — 제품의 유일한 진행률 링",
    from: ["gnb", "profileTrigger"],
    tag: "button",
    read: ["width", "height", "--profile-ring-width", "--profile-ring-gap"],
  },
  {
    id: "carousel",
    source: "TabBannerCarousel.tsx CAROUSEL + CAROUSEL_BOXED",
    from: ["carousel", "CAROUSEL", "CAROUSEL_BOXED"],
    hostWidth: 960,
    read: ["height", "borderTopLeftRadius"],
  },
  {
    id: "carousel-content",
    source: "TabBannerCarousel.tsx CONTENT",
    from: ["carousel", "CONTENT"],
    hostWidth: 960,
    read: ["width", "paddingTop", "paddingLeft"],
  },
  {
    id: "carousel-controls",
    source: "TabBannerCarousel.tsx CONTROLS",
    from: ["carousel", "CONTROLS"],
    hostWidth: 960,
    read: ["paddingTop", "columnGap", "right", "bottom"],
  },
  {
    id: "carousel-arrow",
    source: "TabBannerCarousel.tsx ARROW_BUTTON",
    from: ["carousel", "ARROW_BUTTON"],
    tag: "button",
    read: ["width", "height"],
  },
  {
    id: "carousel-dots",
    source: "TabBannerCarousel.tsx DOTS",
    from: ["carousel", "DOTS"],
    read: ["columnGap"],
  },
  {
    id: "carousel-dot-active",
    source: "TabBannerCarousel.tsx DOT + DOT_ACTIVE",
    from: ["carousel", "DOT", "DOT_ACTIVE"],
    tag: "button",
    read: ["width", "height"],
  },
  {
    id: "carousel-dot-rest",
    source: "TabBannerCarousel.tsx DOT + DOT_REST",
    from: ["carousel", "DOT", "DOT_REST"],
    tag: "button",
    read: ["width", "height"],
  },
];

// ── DS와 무엇을 어떻게 맞출지 ──────────────────────────────────────────────
// `same`은 두 값이 같아야 한다는 뜻이고, `deviates`는 **달라야 한다**는 뜻이다.
// 편차를 그냥 빼 두면 어느 날 제품이 DS 쪽으로 움직여도 아무도 모르고 사유만 낡는다.
// 여기서는 편차가 사라지는 것도 실패다 — 사유를 지우라는 신호다.
const EXPECT = [
  ["button-md", "height", ["button", "sizes", "md", "height"], "same"],
  ["button-md", "paddingLeft", ["button", "sizes", "md", "paddingInline"], "same"],
  ["button-md", "borderTopLeftRadius", ["button", "sizes", "md", "radius"], "same"],
  ["button-md", "columnGap", ["button", "sizes", "md", "gap"], "same"],
  ["button-sm", "height", ["button", "sizes", "sm", "height"], "same"],
  ["button-sm", "paddingLeft", ["button", "sizes", "sm", "paddingInline"], "same"],
  ["button-sm", "columnGap", ["button", "sizes", "sm", "gap"], "same"],
  ["button-sm", "minWidth", ["button", "sizes", "sm", "minWidth"], "same"],
  ["button-secondary-border", "borderTopWidth", ["button", "sizes", "md", "borderWidth"], "deviates",
    "제품 1px, DS 0.5px. hairline은 DS 전역 결정이고 브라우저는 DPR 1에서 사용값을 1px로 올린다 — 레티나에서만 갈린다."],

  ["icon-button", "width", ["icon-button", "sizes", "sm", "width"], "same"],
  ["icon-button", "height", ["icon-button", "sizes", "sm", "height"], "same"],
  ["icon-button", "borderTopLeftRadius", ["icon-button", "sizes", "sm", "radius"], "same"],
  ["icon-button-card", "width", ["project-card", "sizes", "base", "moreSize"], "same"],

  ["project-card", "borderTopLeftRadius", ["project-card", "sizes", "base", "radius"], "same"],
  ["project-card-preview", "borderTopLeftRadius", ["project-card", "sizes", "base", "radius"], "same"],
  ["project-card-overlay", "padding", ["project-card", "sizes", "base", "overlayPadding"], "same"],

  ["tooltip", "borderTopLeftRadius", ["tooltip", "sizes", "base", "radius"], "same"],
  ["tooltip", "paddingTop", ["tooltip", "sizes", "base", "paddingBlock"], "same"],
  ["tooltip", "paddingLeft", ["tooltip", "sizes", "base", "paddingInline"], "same"],
  ["tooltip", "fontSize", ["tooltip", "sizes", "base", "fontSize"], "same"],
  ["tooltip", "lineHeight", ["tooltip", "sizes", "base", "lineHeight"], "same"],
  ["tooltip", "height", ["tooltip", "sizes", "base", "height"], "same"],
  ["tooltip", "borderTopWidth", ["tooltip", "sizes", "base", "borderWidth"], "deviates",
    "제품 1px, DS 0.5px. 위 button과 같은 hairline 결정이다."],

  ["toast", "paddingTop", ["toast", "sizes", "base", "paddingBlock"], "same"],
  ["toast", "paddingLeft", ["toast", "sizes", "base", "paddingInline"], "same"],
  ["toast", "borderTopLeftRadius", ["toast", "sizes", "base", "radius"], "same"],
  ["toast", "borderTopWidth", ["toast", "sizes", "base", "borderWidth"], "same"],
  ["toast", "height", ["toast", "sizes", "base", "height"], "deviates",
    "제품 48, DS 45. 제품 토스트는 글자 크기를 지정하지 않아 문서 기본 16/24를 물려받고 DS는 body-sm 14/21을 쓴다. 여백은 12/20으로 같다 — 높이 차이는 전부 타이포다."],

  ["menu-panel", "borderTopLeftRadius", ["menu-popover", "sizes", "panel", "radius"], "same"],
  ["menu-panel", "paddingTop", ["menu-popover", "sizes", "panel", "paddingBlock"], "same"],
  ["menu-panel", "paddingLeft", ["menu-popover", "sizes", "panel", "paddingInline"], "same"],
  ["menu-item", "paddingTop", ["menu-popover", "sizes", "panel", "itemPaddingBlock"], "same"],
  ["menu-item", "paddingLeft", ["menu-popover", "sizes", "panel", "itemPaddingInline"], "same"],
  ["menu-item", "columnGap", ["menu-popover", "sizes", "panel", "itemGap"], "same"],
  ["menu-item", "borderTopLeftRadius", ["menu-popover", "sizes", "panel", "itemRadius"], "same"],
  ["menu-item", "height", ["menu-popover", "sizes", "panel", "itemHeight"], "deviates",
    "제품 40, DS 44. 여백 8/12는 같고 제품 항목이 문서 기본 16/24를, DS가 body-sm 14/21에 아이콘 슬롯 20을 담아 44가 된다."],

  ["dialog-card", "width", ["dialog", "sizes", "compact", "width"], "same"],
  ["dialog-card", "paddingTop", ["dialog", "sizes", "compact", "surfaceInset"], "same"],
  ["dialog-card", "borderTopLeftRadius", ["dialog", "sizes", "compact", "radius"], "same"],
  ["dialog-card-mypage", "width", ["dialog", "sizes", "compact", "width"], "same"],
  ["dialog-card-mypage", "paddingTop", ["dialog", "sizes", "compact", "surfaceInset"], "same"],
  ["dialog-card-mypage", "borderTopLeftRadius", ["dialog", "sizes", "compact", "radius"], "same"],
  ["toast-highlight", "paddingTop", ["toast", "sizes", "base", "paddingBlock"], "same"],
  ["toast-highlight", "paddingLeft", ["toast", "sizes", "base", "paddingInline"], "same"],
  ["toast-highlight", "borderTopLeftRadius", ["toast", "sizes", "base", "radius"], "same"],
  ["toast-mypage", "paddingTop", ["toast", "sizes", "base", "paddingBlock"], "same"],
  ["toast-mypage", "paddingLeft", ["toast", "sizes", "base", "paddingInline"], "deviates",
    "제품 24, DS 20. **세 벌 중 둘이 20이고 이 벌만 24다.** 앱 홈과 하이라이트의 정의는 바이트 동일하며 DS가 그 다수를 따른다."],
  ["toast-mypage", "borderTopLeftRadius", ["toast", "sizes", "base", "radius"], "deviates",
    "제품 999(알약), DS 16. 위와 같다 — 다른 두 벌은 16이다. 마이페이지 토스트만 알약이고 면도 불투명이다."],
  ["toast-mypage", "borderTopWidth", ["toast", "sizes", "base", "borderWidth"], "deviates",
    "제품 1px, DS 0. 이 벌만 테두리를 두른다. 다른 두 벌은 그림자와 흐림으로만 면을 띄운다."],
  ["dialog-card", "borderTopWidth", ["dialog", "sizes", "compact", "borderWidth"], "deviates",
    "제품 0, DS 0.5. 제품 모달은 그림자만으로 면을 띄우는데 DS는 라이트 테마에서 그림자가 약해 테두리를 남긴다."],

  ["input-box", "paddingLeft", ["input", "sizes", "md", "paddingInline"], "same"],
  ["input-box", "borderTopLeftRadius", ["input", "sizes", "md", "radius"], "same"],
  ["input-box", "borderTopWidth", ["input", "sizes", "md", "borderWidth"], "deviates",
    "제품 1px, DS 0.5px. hairline 결정이다."],

  ["empty-state", "paddingTop", ["empty-state", "sizes", "base", "paddingBlock"], "same"],
  ["empty-state", "rowGap", ["empty-state", "sizes", "base", "gap"], "same"],
  ["empty-state", "borderTopWidth", ["empty-state", "sizes", "base", "borderWidth"], "same"],
  ["empty-state", "borderTopLeftRadius", ["empty-state", "sizes", "base", "radius"], "same"],
  ["empty-state", "paddingLeft", ["empty-state", "sizes", "base", "paddingInline"], "deviates",
    "제품 0, DS 16. 제품의 빈 상태는 이미 좌우 여백이 있는 그리드 안에만 놓여 스스로 여백을 두지 않는다. DS 컴포넌트는 어디에 놓일지 모르므로 자기 여백을 갖는다."],

  ["avatar", "width", ["avatar", "sizes", "md", "size"], "same"],
  ["avatar", "height", ["avatar", "sizes", "md", "size"], "same"],

  ["badge", "paddingTop", ["badge", "sizes", "base", "paddingBlock"], "same"],
  ["badge", "paddingLeft", ["badge", "sizes", "base", "paddingInline"], "same"],
  ["badge", "borderTopLeftRadius", ["badge", "sizes", "base", "radius"], "same"],
  ["badge", "borderTopWidth", ["badge", "sizes", "base", "borderWidth"], "same"],

  ["spinner-md", "width", ["spinner", "sizes", "md", "width"], "same"],
  ["spinner-md", "height", ["spinner", "sizes", "md", "height"], "same"],
  ["spinner-md", "::after:borderTopWidth", ["spinner", "sizes", "md", "ringWidth"], "same"],
  ["spinner-sm", "width", ["spinner", "sizes", "sm", "width"], "same"],
  ["spinner-sm", "::after:borderTopWidth", ["spinner", "sizes", "sm", "ringWidth"], "deviates",
    "제품 2, DS 1. 제품 sm은 `after:border`(1px)를 적지만 같은 요소의 `after:border-2`가 Tailwind 정렬에서 이겨 실제로는 2px로 그려진다 — 12px 원에 2px 링이면 가운데가 거의 남지 않는다. DS는 의도한 1px을 그린다."],

  ["checkbox", "width", ["checkbox", "sizes", "base", "boxSize"], "same"],
  ["checkbox", "height", ["checkbox", "sizes", "base", "boxSize"], "same"],

  ["selectable-row", "paddingTop", ["selectable-list-row", "sizes", "base", "padding"], "deviates",
    "제품 6, DS 8. 제품 3벌이 전부 파일 로컬 상수이고 6·8·10으로 갈린다. DS는 space-control-sm 8로 사이드바 항목과 계단을 맞춘다."],
  ["selectable-row", "columnGap", ["selectable-list-row", "sizes", "base", "gap"], "deviates",
    "제품 10, DS 8. 위와 같은 사유다 — 10은 DS 간격 계단에 없는 값이다."],
  ["selectable-row", "borderTopLeftRadius", ["selectable-list-row", "sizes", "base", "radius"], "deviates",
    "제품 14, DS 10. radius-overlay-item 10을 쓴다 — 메뉴 항목·사이드바 항목과 같은 반경이어야 목록 행끼리 어긋나지 않는다."],

  ["segmented-track", "paddingTop", ["segmented-control", "sizes", "md", "trackPadding"], "same"],
  ["segmented-track", "borderTopLeftRadius", ["segmented-control", "sizes", "md", "trackRadius"], "same"],
  ["segmented-segment", "paddingLeft", ["segmented-control", "sizes", "md", "segmentPaddingInline"], "same"],
  ["segmented-segment", "borderTopLeftRadius", ["segmented-control", "sizes", "md", "segmentRadius"], "same"],
  ["segmented-thumb", "borderTopLeftRadius", ["segmented-control", "sizes", "md", "segmentRadius"], "same"],
  ["segmented-thumb", "top", ["segmented-control", "sizes", "md", "trackPadding"], "same"],
  ["segmented-segment", "height", ["segmented-control", "sizes", "md", "segmentHeight"], "deviates",
    "제품 28, DS 32. 제품 트랙은 28+4+4 = 36으로 control 계단(40/32) 어디에도 없다. DS는 트랙을 40에 맞추고 padding 4를 빼 32를 얻는다 — 세그먼티드가 다른 control과 한 줄에 설 수 있어야 한다."],
  ["segmented-track", "columnGap", ["segmented-control", "sizes", "md", "segmentGap"], "deviates",
    "제품 2, DS 8. 제품은 thumb가 세그먼트 폭을 그대로 덮으므로 간격이 거의 필요 없다. DS는 thumb가 세그먼트 안에 놓여 간격이 눌린 세그먼트의 경계를 만든다."],

  ["skeleton", "borderTopLeftRadius", ["skeleton", "sizes", "base", "radius"], "deviates",
    "제품 999(알약), DS 8. 제품의 그 벌은 한 줄 텍스트 자리 표시라 알약이 맞지만, 블록·원까지 덮는 컴포넌트는 shape 축이 반경을 정한다(text 8 · block 16 · circle 999)."],
  ["skeleton", "::after:animationDuration", ["skeleton", "motion", "duration"], "deviates", 1000,
    "제품 1300ms, DS 1600ms. 제품 shimmer 정의가 1.3s·1.5s·1.6s로 갈리고 DS는 motion-loop 계단의 1600을 쓴다."],

  ["nav-item", "height", ["app-shell-parts", "sizes", "navItem", "height"], "same"],
  ["nav-item", "borderTopLeftRadius", ["app-shell-parts", "sizes", "navItem", "radius"], "same"],
  ["nav-item", "paddingLeft", ["app-shell-parts", "sizes", "navItem", "paddingInline"], "same"],
  ["nav-item", "paddingRight", ["app-shell-parts", "sizes", "navItem", "paddingInline"], "same"],
  ["nav-item", "fontSize", ["app-shell-parts", "sizes", "navItem", "fontSize"], "same"],
  ["nav-item-collapsed", "width", ["app-shell-parts", "sizes", "navItemCollapsed", "height"], "same"],
  ["nav-item-collapsed", "paddingLeft", ["app-shell-parts", "sizes", "navItemCollapsed", "paddingInline"], "same"],
  ["sidebar-header-row", "columnGap", ["app-shell-parts", "sizes", "navItem", "gap"], "same"],
  ["sidebar-header-row", "minHeight", ["sidebar-brand", "sizes", "false", "height"], "same"],
  ["sidebar-logo-rail", "minHeight", ["sidebar-brand", "sizes", "false", "markSize"], "same"],
  ["top-bar", "columnGap", ["app-shell-parts", "sizes", "topBar", "gap"], "same"],
  ["top-bar", "paddingLeft", ["app-shell-parts", "sizes", "topBar", "paddingInline"], "deviates",
    "제품 8, DS 16. 제품 상단 바는 좌우로 --app-gnb-main-inline-padding(16)만큼 음수 마진으로 번져 나간 뒤 8을 다시 넣는다 — 항목이 본문 좌측선보다 8px 바깥에 선다. DS TopBar에는 그 bleed가 없어 본문과 같은 16을 쓴다."],

  ["sidebar-cta", "minHeight", ["sidebar-cta", "sizes", "false", "height"], "same"],
  ["sidebar-cta", "paddingTop", ["sidebar-cta", "sizes", "false", "paddingBlock"], "same"],
  ["sidebar-cta", "paddingLeft", ["sidebar-cta", "sizes", "false", "paddingInline"], "same"],
  ["sidebar-cta", "columnGap", ["sidebar-cta", "sizes", "false", "gap"], "same"],
  ["sidebar-cta", "borderTopLeftRadius", ["sidebar-cta", "sizes", "false", "radius"], "same"],
  ["sidebar-cta-collapsed", "height", ["sidebar-cta", "sizes", "true", "height"], "same"],
  ["sidebar-cta-collapsed", "paddingTop", ["sidebar-cta", "sizes", "true", "paddingBlock"], "same"],
  ["sidebar-cta-collapsed", "paddingLeft", ["sidebar-cta", "sizes", "true", "paddingInline"], "same"],
  ["sidebar-cta-collapsed", "columnGap", ["sidebar-cta", "sizes", "true", "gap"], "same"],

  // Slider — 제품에 정본이 없다는 것은 사실이지만 "그래서 아무것도 재지 않는다"는 틀렸다.
  // thumb형은 DS 기하에 가장 가까운 ClipCropModal 벌, track형은 최다 사용(8곳) VideoEditModal 벌을
  // 골랐다. 고른 이유가 곧 판정이고, 나머지 벌과 어긋나는 것은 제품 안의 불일치다.
  ["slider-thumb-rail", "height", ["slider", "sizes", "md/thumb", "railHeight"], "same"],
  ["slider-thumb-handle", "width", ["slider", "sizes", "md/thumb", "thumbInline"], "same"],
  ["slider-thumb-handle", "height", ["slider", "sizes", "md/thumb", "thumbBlock"], "same"],
  ["slider-thumb-handle", "borderTopWidth", ["slider", "sizes", "md/thumb", "thumbBorderWidth"], "same"],
  ["slider-track-root-panel", "height", ["slider", "sizes", "md/track", "railHeight"], "same"],
  ["slider-track-root", "height", ["slider", "sizes", "sm/track", "railHeight"], "same"],
  ["slider-track-marker", "::after:width", ["slider", "sizes", "md/track", "thumbInline"], "same"],
  ["slider-track-marker", "::after:height", ["slider", "sizes", "md/track", "thumbBlock"], "same"],
  ["slider-thumb-root", "height", ["slider", "sizes", "md/thumb", "height"], "deviates",
    "제품 24, DS 40. thumb형 세 벌이 16·24·28로 갈려 컨트롤 높이의 정본이 없다. DS는 control 계단(40/32)을 따라 슬라이더가 다른 컨트롤과 한 줄에 설 수 있게 한다."],
  ["slider-track-root-panel", "height", ["slider", "sizes", "md/track", "height"], "deviates",
    "제품 28, DS 40. 제품에서 28은 레일 높이인 동시에 컨트롤 높이다 — 레일이 컨트롤을 꽉 채운다. DS는 같은 28 레일을 40 컨트롤 안에 넣어 위아래 6px씩을 손잡이 여유로 남긴다."],

  ["sidebar-cta", "backgroundColor", ["sidebar-cta", "states", "base", "Default", "background"], "same"],
  ["sidebar-cta", "color", ["sidebar-cta", "states", "base", "Default", "foreground"], "same"],
  ["sidebar-cta-light", "backgroundColor", ["sidebar-cta", "states", "base", "Default", "background"], "same"],
  ["sidebar-cta-light", "color", ["sidebar-cta", "states", "base", "Default", "foreground"], "same"],
  ["sidebar-cta-current", "backgroundColor", ["sidebar-cta", "states", "base", "Current", "background"], "same"],
  ["sidebar-cta-current", "color", ["sidebar-cta", "states", "base", "Current", "foreground"], "same"],
  ["sidebar-cta-current-light", "backgroundColor", ["sidebar-cta", "states", "base", "Current", "background"], "same"],
  ["sidebar-cta-label-collapsed", "maxWidth", ["sidebar-cta", "sizes", "true", "labelMaxWidth"], "same"],
  ["sidebar-cta-label-collapsed", "fontSize", ["sidebar-cta", "sizes", "true", "labelFontSize"], "same"],
  ["nav-item-inner", "columnGap", ["app-shell-parts", "sizes", "navItem", "gap"], "deviates",
    "제품 10, DS 8. 배포본은 행이 아니라 안쪽 상자가 이 간격을 갖고 값이 10이다. 10은 DS 간격 계단(4·8·12·16)에 없어 SelectableListRow와 같은 판단을 한다 — 한 컴포넌트를 위해 계단을 늘리지 않는다."],
  ["nav-item-inner-collapsed", "columnGap", ["app-shell-parts", "sizes", "navItemCollapsed", "paddingInline"], "same"],
  ["top-bar-title", "fontSize", ["app-shell-parts", "sizes", "topBar", "titleFontSize"], "same"],
  ["top-bar-leading", "columnGap", ["app-shell-parts", "sizes", "topBar", "leadingGap"], "same"],

  ["sidebar-header-row", "paddingLeft", ["sidebar-brand", "sizes", "false", "paddingInlineStart"], "same"],
  ["sidebar-header-row-collapsed", "paddingLeft", ["sidebar-brand", "sizes", "true", "paddingInlineStart"], "same"],
  ["empty-state-actions", "columnGap", ["empty-state", "sizes", "base", "actionGap"], "same"],
  ["project-card-overlay", "borderBottomLeftRadius", ["project-card", "sizes", "base", "radius"], "same"],

  ["nav-item-hover", "backgroundColor", ["app-shell-parts", "states", "navItem", "Hover", "background"], "same"],
  ["nav-item-hover-light", "backgroundColor", ["app-shell-parts", "states", "navItem", "Hover", "background"], "deviates",
    "라이트만 갈린다. 제품은 재매핑된 palette-gray-300을 50%로 덮고(rgb 228 229 233 / 0.5) DS는 ink 8%를 쓴다 — 면 계열에 매는 것과 잉크에 매는 것의 차이다. `action-ghost-hover`는 SelectableListRow와 공유하는 토큰이라 사이드바 하나 때문에 옮기지 않는다. 다크는 rgb(250 250 250 / 0.1)로 정확히 같다."],

  ["progress-bar-track", "height", ["progress-bar", "sizes", "base", "height"], "same"],
  ["progress-bar-track", "maxWidth", ["progress-bar", "sizes", "base", "maxInlineSize"], "same"],
  ["progress-ring", "width", ["progress-ring", "sizes", "base", "size"], "same"],
  ["progress-ring", "--profile-ring-width", ["progress-ring", "sizes", "base", "width"], "same"],
  ["progress-ring", "--profile-ring-gap", ["progress-ring", "sizes", "base", "gap"], "same"],
  ["progress-bar-track", "borderTopLeftRadius", ["progress-bar", "sizes", "base", "radius"], "deviates",
    "제품 3, DS 999(알약). 높이가 6이라 브라우저가 그리는 곡률은 둘 다 3으로 조여져 **결과가 같다.** 리터럴 3은 높이를 바꾸는 날 따라오지 않으므로 알약으로 적는다."],

  ["nav-row", "columnGap", ["app-shell-parts", "sizes", "navRow", "gap"], "same"],

  // ── 열거가 드러낸 축 ──────────────────────────────────────────────────────
  // 아래는 "제품이 선언했는데 대조하지 않던" 축이다. 열거 게이트를 붙이기 전까지 이 자리들은
  // 게이트가 초록인 채로 비어 있었다.
  ["button-md", "paddingTop", ["button", "sizes", "md", "paddingBlock"], "same"],
  ["button-sm", "paddingTop", ["button", "sizes", "sm", "paddingBlock"], "same"],
  ["button-sm", "borderTopLeftRadius", ["button", "sizes", "sm", "radius"], "same"],
  ["button-secondary-border", "borderTopLeftRadius", ["button", "sizes", "md", "radius"], "same"],
  ["button-secondary-border", "height", ["button", "sizes", "md", "height"], "same"],
  ["icon-button", "maxWidth", ["icon-button", "sizes", "sm", "width"], "same"],
  ["icon-button-card", "height", ["project-card", "sizes", "base", "moreSize"], "same"],
  ["icon-button-card", "borderTopLeftRadius", ["project-card", "sizes", "base", "moreRadius"], "same"],
  ["project-card-overlay", "paddingTop", ["project-card", "sizes", "base", "overlayPadding"], "same"],
  ["project-card-overlay", "borderTopLeftRadius", ["project-card", "sizes", "base", "overlayTopRadius"], "same"],
  ["project-grid", "columnGap", ["project-card", "sizes", "base", "gridGap"], "same"],
  ["carousel-content", "height", ["banner-carousel", "sizes", "boxed", "height"], "same"],
  ["carousel-arrow", "borderTopLeftRadius", ["banner-carousel", "sizes", "boxed", "arrowRadius"], "same"],
  ["carousel-controls", "borderTopLeftRadius", ["banner-carousel", "sizes", "boxed", "controlsRadius"], "same"],
  ["carousel-dot-active", "borderTopLeftRadius", ["banner-carousel", "sizes", "boxed", "dotRadius"], "same"],
  ["carousel-dot-active", "height", ["banner-carousel", "sizes", "boxed", "dotHeight"], "same"],
  ["carousel-dot-rest", "borderTopLeftRadius", ["banner-carousel", "sizes", "boxed", "dotRadius"], "same"],
  ["menu-item", "borderTopWidth", ["menu-popover", "sizes", "panel", "borderWidth"], "same"],
  ["nav-item", "paddingTop", ["app-shell-parts", "sizes", "navItem", "paddingBlock"], "same"],
  ["nav-item-collapsed", "height", ["app-shell-parts", "sizes", "navItemCollapsed", "height"], "same"],
  ["nav-item-collapsed", "borderTopLeftRadius", ["app-shell-parts", "sizes", "navItemCollapsed", "radius"], "same"],
  ["nav-item-collapsed", "paddingTop", ["app-shell-parts", "sizes", "navItemCollapsed", "paddingBlock"], "same"],
  ["nav-item-hover", "height", ["app-shell-parts", "sizes", "navItem", "height"], "same"],
  ["nav-item-hover", "borderTopLeftRadius", ["app-shell-parts", "sizes", "navItem", "radius"], "same"],
  ["nav-item-hover", "paddingLeft", ["app-shell-parts", "sizes", "navItem", "paddingInline"], "same"],
  ["nav-item-hover", "paddingTop", ["app-shell-parts", "sizes", "navItem", "paddingBlock"], "same"],
  ["nav-item-hover-light", "height", ["app-shell-parts", "sizes", "navItem", "height"], "same"],
  ["nav-item-hover-light", "borderTopLeftRadius", ["app-shell-parts", "sizes", "navItem", "radius"], "same"],
  ["nav-item-hover-light", "paddingLeft", ["app-shell-parts", "sizes", "navItem", "paddingInline"], "same"],
  ["nav-item-hover-light", "paddingTop", ["app-shell-parts", "sizes", "navItem", "paddingBlock"], "same"],
  ["nav-row", "height", ["app-shell-parts", "sizes", "navRow", "height"], "same"],
  ["nav-row", "paddingTop", ["app-shell-parts", "sizes", "navRow", "paddingBlock"], "same"],
  ["nav-row", "borderTopLeftRadius", ["app-shell-parts", "sizes", "navRow", "radius"], "deviates",
    "제품 10, DS 0. 배포본은 복합 행이 곧 `menuLink`라 행이 선택 면과 반경을 갖는데, DS는 행이 껍데기이고 항목이 갖는다. 행에 두면 항목 하나를 다른 곳에 옮길 수 없다."],
  ["nav-row", "paddingLeft", ["app-shell-parts", "sizes", "navRow", "paddingInline"], "deviates",
    "제품 4, DS 0. 같은 이유다 — 좌우 여백도 항목이 갖는다. 행과 항목의 합은 두 쪽이 같다."],
  ["sidebar-header-row-collapsed", "gap", ["app-shell-parts", "sizes", "navItem", "gap"], "same"],
  ["sidebar-cta-current", "borderTopLeftRadius", ["sidebar-cta", "sizes", "false", "radius"], "same"],
  ["sidebar-cta-current", "paddingTop", ["sidebar-cta", "sizes", "false", "paddingBlock"], "same"],
  ["sidebar-cta-current", "paddingLeft", ["sidebar-cta", "sizes", "false", "paddingInline"], "same"],
  ["sidebar-cta-current", "columnGap", ["sidebar-cta", "sizes", "false", "gap"], "same"],
  ["sidebar-cta-current-light", "borderTopLeftRadius", ["sidebar-cta", "sizes", "false", "radius"], "same"],
  ["sidebar-cta-current-light", "paddingTop", ["sidebar-cta", "sizes", "false", "paddingBlock"], "same"],
  ["sidebar-cta-current-light", "paddingLeft", ["sidebar-cta", "sizes", "false", "paddingInline"], "same"],
  ["sidebar-cta-current-light", "columnGap", ["sidebar-cta", "sizes", "false", "gap"], "same"],
  ["sidebar-cta-light", "borderTopLeftRadius", ["sidebar-cta", "sizes", "false", "radius"], "same"],
  ["sidebar-cta-light", "paddingTop", ["sidebar-cta", "sizes", "false", "paddingBlock"], "same"],
  ["sidebar-cta-light", "paddingLeft", ["sidebar-cta", "sizes", "false", "paddingInline"], "same"],
  ["sidebar-cta-light", "columnGap", ["sidebar-cta", "sizes", "false", "gap"], "same"],
  ["sidebar-cta-collapsed", "borderTopLeftRadius", ["sidebar-cta", "sizes", "true", "radius"], "same"],
  ["progress-ring", "height", ["progress-ring", "sizes", "base", "size"], "same"],
  ["progress-bar-fill", "borderTopLeftRadius", ["progress-bar", "sizes", "base", "radius"], "deviates",
    "제품 3, DS 999(알약). 트랙과 같은 사유다 — 높이 6에서 결과가 같고 리터럴 3은 높이를 바꾸는 날 따라오지 않는다."],
  ["segmented-segment", "borderTopWidth", ["segmented-control", "sizes", "md", "borderWidth"], "deviates",
    "제품 0, DS 0.5. hairline은 DS 전역 결정이다 — 눌리지 않은 세그먼트의 경계를 아주 얇게 남긴다."],
  ["slider-thumb-rail", "borderTopLeftRadius", ["slider", "sizes", "md/thumb", "railRadius"], "same"],
  ["slider-thumb-handle", "borderTopLeftRadius", ["slider", "sizes", "md/thumb", "thumbRadius"], "same"],
  ["slider-track-marker", "::after:borderTopLeftRadius", ["slider", "sizes", "md/track", "thumbRadius"], "same"],
  ["segmented-thumb", "height", ["segmented-control", "sizes", "md", "segmentHeight"], "deviates",
    "제품 28, DS 32. 세그먼트와 같은 사유다 — 제품 트랙 36은 control 계단에 없다."],

  ["carousel", "height", ["banner-carousel", "sizes", "boxed", "height"], "same"],
  ["carousel", "borderTopLeftRadius", ["banner-carousel", "sizes", "boxed", "radius"], "same"],
  ["carousel-content", "width", ["banner-carousel", "sizes", "boxed", "contentInline"], "same"],
  ["carousel-content", "paddingTop", ["banner-carousel", "sizes", "boxed", "contentBlockPadding"], "same"],
  ["carousel-content", "paddingLeft", ["banner-carousel", "sizes", "boxed", "contentInlinePadding"], "same"],
  ["carousel-controls", "paddingTop", ["banner-carousel", "sizes", "boxed", "controlsPadding"], "same"],
  ["carousel-controls", "columnGap", ["banner-carousel", "sizes", "boxed", "controlsGap"], "same"],
  ["carousel-arrow", "width", ["banner-carousel", "sizes", "boxed", "arrowSize"], "same"],
  ["carousel-arrow", "height", ["banner-carousel", "sizes", "boxed", "arrowSize"], "same"],
  ["carousel-dots", "columnGap", ["banner-carousel", "sizes", "boxed", "dotsGap"], "same"],
  ["carousel-dot-active", "width", ["banner-carousel", "sizes", "boxed", "dotActiveWidth"], "same"],
  ["carousel-dot-rest", "width", ["banner-carousel", "sizes", "boxed", "dotRestWidth"], "same"],
  ["carousel-dot-rest", "height", ["banner-carousel", "sizes", "boxed", "dotHeight"], "same"],
];

// **대조하기로 한 축은 반드시 읽는다.** EXPECT에 행을 넣고 probe의 read에 넣는 것을 잊으면
// "읽지 못했습니다"로 죽는다 — 두 곳에 같은 것을 적게 하지 말고 한 곳에서 파생시킨다.
for (const [probeId, property] of EXPECT) {
  const probe = PROBES.find((candidate) => candidate.id === probeId);
  if (!probe) throw new Error("EXPECT가 없는 탐침을 가리킵니다: " + probeId);
  if (!probe.read.includes(property)) probe.read.push(property);
}

if (!existsSync(resolve(productRoot, ".git"))) {
  console.log(
    "[product-components] " +
      (checkOnly ? "SKIPPED" : "제품 저장소가 없습니다") +
      " (" + productRoot + "). 렌더 실측은 로컬에서 확인해야 합니다.",
  );
  process.exit(0);
}

const require_ = createRequire(join(productRoot, "package.json"));
let compile;
try {
  const packagePath = require_.resolve("tailwindcss/package.json");
  ({ compile } = require_(join(dirname(packagePath), "dist", "lib.js")));
} catch (error) {
  console.log("[product-components] SKIPPED (제품 tailwindcss를 불러오지 못했습니다: " + error.message + ")");
  process.exit(0);
}

const git = (args) =>
  execFileSync("git", args, { cwd: productRoot, encoding: "utf8", maxBuffer: 64 * 1024 * 1024 });
const commit = git(["rev-parse", productRef]).trim();
const normalize = (source) =>
  source.replace(/@import\s+["'][^"']+["'][^;]*;/g, "").replace(/@theme\s+(?:inline\s+)?\{/g, ":root {");

// 제품 소스에서 클래스 상수를 꺼낸다. `key: [...]`와 `const KEY = [...]` 둘 다 받는다.
// 문자열 안에도 대괄호가 들어가므로(임의값 유틸리티) 따옴표 경계를 지키며 스캔한다.
function extractClassList(source, key, where) {
  const anchor = new RegExp("(?:^|\\n)(?:\\s{2}|const\\s+)" + key + "\\s*[:=]\\s*", "m").exec(source);
  if (!anchor) throw new Error(where + "에서 " + key + "를 찾지 못했습니다.");
  let index = anchor.index + anchor[0].length;
  while (source[index] === "\n" || source[index] === " ") index += 1;
  if (source[index] === '"' || source[index] === "'") {
    const quote = source[index];
    const end = source.indexOf(quote, index + 1);
    return source.slice(index + 1, end);
  }
  if (source[index] !== "[") throw new Error(where + "의 " + key + "가 배열도 문자열도 아닙니다.");
  let depth = 0;
  let quote = null;
  let cursor = index;
  for (; cursor < source.length; cursor += 1) {
    const char = source[cursor];
    if (quote) {
      if (char === "\\") cursor += 1;
      else if (char === quote) quote = null;
      continue;
    }
    if (char === '"' || char === "'" || char === "`") quote = char;
    else if (char === "[") depth += 1;
    else if (char === "]") {
      depth -= 1;
      if (depth === 0) break;
    }
  }
  const body = source.slice(index, cursor + 1);
  const parts = body.match(/"(?:[^"\\]|\\.)*"/g) ?? [];
  return parts.map((part) => JSON.parse(part)).join(" ");
}

const workspace = mkdtempSync(join(tmpdir(), "kds-product-components-"));
let rendered;
let declaredByProbe;
let sources;
try {
  // 제품의 진입 CSS는 ./keyframes.css를 @import한다. 컴파일러가 찾을 수 있게 함께 꺼내 둔다.
  const tailwindEntry = git(["show", commit + ":apps/web/app/tailwind.css"]);
  writeFileSync(join(workspace, "entry.css"), tailwindEntry);
  writeFileSync(join(workspace, "keyframes.css"), git(["show", commit + ":apps/web/app/keyframes.css"]));

  sources = Object.fromEntries(
    Object.entries(FILES).map(([alias, path]) => [alias, git(["show", commit + ":" + path])]),
  );
  // **문서에 사이드바가 있다는 사실 자체가 색을 바꾼다.** 배포본의 `wrapperSidebar`는
  // `html[data-theme=light] body:has(&)`로 팔레트 단계를 통째로 재매핑한다 — 사이드바가 있는
  // 화면에서는 라이트 팔레트가 한 단계씩 밝아진다. 그 표식이 없으면 라이트 탐침이 제품에 없는
  // 색을 잰다. 화면에 그리지 않고 `:has()`만 만족시키면 된다.
  const bodyMarker = extractClassList(sources.gnb, "wrapperSidebar", FILES.gnb);

  for (const probe of PROBES) {
    if (!probe.from) continue;
    const [alias, ...keys] = probe.from;
    probe.classes = keys
      .map((key) => extractClassList(sources[alias], key, FILES[alias]))
      .join(" ");
    const tag = probe.tag ?? "div";
    probe.html =
      "<" + tag + ' class="' + probe.classes + '">' + (probe.text ?? "") + "</" + tag + ">";
  }

  const compiled = await compile(tailwindEntry, {
    base: workspace,
    loadStylesheet: async (id, base) => {
      const path = id.startsWith("tailwindcss") ? require_.resolve(id) : resolve(base, id);
      return { path, base: dirname(path), content: readFileSync(path, "utf8") };
    },
  });
  // **탐침이 쓴 클래스만 컴파일하면 안 된다.** 제품에는 형제 상수에 선언되어 이 요소를 겨누는
  // 규칙이 있다 — 예를 들어 `sidebarUpgradeButtonActive`가
  // `html[data-theme=dark] .gnb-sidebarUpgradeButton:not(&)`를 선언해 **비활성 버튼의 색을 덮는다.**
  // 그 상수를 컴파일하지 않으면 그 규칙이 스타일시트에 없고, 탐침은 제품에 존재하지 않는 모습을
  // 잰다. 실제로 그렇게 해서 업그레이드 버튼을 mint로 잘못 판정했다.
  // 제품 번들은 저장소 전체를 훑으므로, 우리도 탐침이 읽은 파일의 클래스 후보를 전부 넣는다.
  const candidates = new Set();
  for (const source of Object.values(sources)) {
    for (const literal of source.match(/"(?:[^"\\\n]|\\.)*"/g) ?? []) {
      for (const token of literal.slice(1, -1).split(/\s+/)) if (token) candidates.add(token);
    }
  }
  for (const probe of PROBES) {
    for (const token of probe.html.match(/class="([^"]*)"/)[1].split(/\s+/)) if (token) candidates.add(token);
    for (const className of [probe.wrapper ?? []].flat()) candidates.add(className);
  }
  for (const token of bodyMarker.split(/\s+/)) if (token) candidates.add(token);
  const utilities = compiled.build([...candidates]);
  if (process.env.KDS_DUMP_RULE) {
    for (const line of utilities.split("\n")) {
      if (line.includes("body:has")) console.log(line.slice(0, 200));
    }
    process.exit(0);
  }

  const baseCss = [
    normalize(git(["show", commit + ":apps/web/app/tailwind.css"])),
    git(["show", commit + ":apps/web/app/globals.css"]),
  ].join("\n\n");

  const docs = [...new Set(PROBES.map((probe) => probe.doc ?? "default"))];
  rendered = {};
  declaredByProbe = {};
  const browser = await chromium.launch();
  try {
    const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, colorScheme: "dark" });
    for (const doc of docs) {
      const group = PROBES.filter((probe) => (probe.doc ?? "default") === doc);
      const page = await context.newPage();
      // doc은 문서 수준 상태다. 제품 규칙 상당수가 `html[data-theme=...]`와
      // `html[data-app-gnb-sidebar-collapsed=true]`를 조상으로 요구하므로 문서를 나눠 렌더한다.
      const htmlAttributes =
        'data-theme="' + (doc.includes("light") ? "light" : "dark") + '"' +
        (doc.includes("collapsed") ? ' data-app-gnb-sidebar-collapsed="true"' : "");
      await page.setContent(
        "<!doctype html><html " + htmlAttributes + "><head><style>" +
          baseCss.replace(/<\/style>/gi, "<\\/style>") +
          '</style><style id="kds-product-utilities">' +
          utilities.replace(/<\/style>/gi, "<\\/style>") +
          '</style></head><body><div hidden style="display:none" class="' + bodyMarker + '"></div>' +
          group
            .map((probe, index) => {
              // wrapper는 조상 선택자를 살리기 위한 것이다. 배열이면 바깥부터 순서대로 감싼다 —
              // `.a .b &` 처럼 조상이 둘인 규칙은 한 겹으로는 매칭되지 않는다.
              const wrappers = [probe.wrapper ?? []].flat();
              const inner = wrappers.reduceRight(
                (html, className) => '<div class="' + className + '">' + html + "</div>",
                probe.html,
              );
              return (
                '<div id="probe-' + index + '" style="position:relative;width:' +
                (probe.hostWidth ?? 360) + 'px;height:360px">' + inner + "</div>"
              );
            })
            .join("") +
          "</body></html>",
        { waitUntil: "load" },
      );
      const group_ = await page.evaluate((probes) => {
        // **hover 전용 선언은 getComputedStyle로 읽히지 않는다.** 마우스를 움직이거나 CDP로
        // 상태를 강제하는 대신, 스타일시트에서 이 요소를 겨누는 `:hover` 규칙을 모아
        // 특이도·소스 순서대로 복제본에 얹고 계산값을 읽는다. 값이 시트에서 오므로
        // 사람이 옮겨 적을 자리가 없다.
        const specificity = (selector) => {
          const cleaned = selector.replace(/::[a-z-]+/g, "");
          const ids = (cleaned.match(/#[\w-]+/g) ?? []).length;
          const classes = (cleaned.match(/\.[\w\\[\]:.()=%-]+|\[[^\]]+\]|:[a-z-]+(\([^)]*\))?/g) ?? []).length;
          const elements = (cleaned.match(/(^|[\s>+~])[a-z][\w-]*/g) ?? []).length;
          return ids * 10000 + classes * 100 + elements;
        };
        const hoverDeclarations = (element) => {
          const matched = [];
          let order = 0;
          const walk = (rules) => {
            for (const rule of rules) {
              order += 1;
              if (rule.media) {
                if (window.matchMedia(rule.media.mediaText).matches) walk(rule.cssRules);
                continue;
              }
              if (rule.cssRules && !rule.selectorText) {
                walk(rule.cssRules);
                continue;
              }
              // **이스케이프된 클래스 이름 안의 `:hover`는 건드리지 않는다.** Tailwind가
              // `:not(&)`를 클래스 이름으로 펼치면 그 이름 안에 `\:hover\:`가 들어 있고,
              // 그것까지 지우면 선택자가 깨져 matches()가 던진다 — 그래서 한 건도 안 잡혔다.
              const HOVER = /(?<!\\):hover/g;
              if (!rule.selectorText || !HOVER.test(rule.selectorText)) continue;
              for (const part of rule.selectorText.split(/,(?![^(]*\))/)) {
                if (!/(?<!\\):hover/.test(part)) continue;
                const base = part.replace(/(?<!\\):hover/g, "");
                let hit = false;
                try {
                  hit = element.matches(base);
                } catch {
                  hit = false;
                }
                if (hit) matched.push({ rule, rank: specificity(part) * 100000 + order });
              }
            }
          };
          for (const sheet of document.styleSheets) {
            try {
              walk(sheet.cssRules);
            } catch {
              /* cross-origin 시트는 없다 — 인라인 <style> 하나뿐이다 */
            }
          }
          return matched.sort((a, b) => a.rank - b.rank);
        };
        // **제품이 이 요소에 대해 직접 선언한 property를 전부 센다.**
        //
        // 그전까지 게이트는 "내가 EXPECT에 넣기로 기억한 축"만 봤다. 그래서 배너 높이도, 브랜드
        // 행 높이도, 스크림 칠 순서도 게이트가 초록인 채로 틀려 있었다. 이제 방향을 뒤집는다 —
        // 제품 정본 클래스가 선언한 property를 기계가 열거하고, 분류되지 않은 것이 있으면 실패다.
        // "확인하는 걸 잊었나?"가 "확인 안 된 것을 게이트가 나열해 준다"로 바뀐다.
        const declaredProperties = (element) => {
          const found = new Map();
          // 이 요소가 실제로 지닌 클래스를 겨누는 규칙만 센다. Tailwind의 `*, ::before, ::after`
          // 리셋(`--tw-*` 41개)은 제품이 이 컴포넌트에 대해 declare한 것이 아니다.
          const own = [...element.classList].map((token) => "." + CSS.escape(token));
          const walk = (rules) => {
            for (const rule of rules) {
              if (rule.media) {
                if (window.matchMedia(rule.media.mediaText).matches) walk(rule.cssRules);
                continue;
              }
              if (rule.cssRules && !rule.selectorText) {
                walk(rule.cssRules);
                continue;
              }
              if (!rule.selectorText) continue;
              for (const part of rule.selectorText.split(/,(?![^(]*\))/)) {
                const pseudo = /(?<!\\)::(before|after)\b/.exec(part);
                const base = part
                  .replace(/(?<!\\)::(before|after)\b/g, "")
                  .replace(/(?<!\\):(hover|focus|focus-visible|active|disabled)\b/g, "");
                let hit = false;
                try {
                  hit = element.matches(base);
                } catch {
                  hit = false;
                }
                if (!hit) continue;
                if (!own.some((token) => part.includes(token))) continue;
                // 기본 · 상태 · 의사요소를 각각 센다. 셋 다 제품이 정한 것이고, 기본만 세면
                // hover 색과 흐림 층이 열거에서 통째로 빠진다.
                const bucket = pseudo ? "::" + pseudo[1] : base !== part ? ":state" : "base";
                for (const property of rule.style) {
                  const key = bucket === "base" ? property : bucket + " " + property;
                  if (!found.has(key)) found.set(key, bucket);
                }
              }
            }
          };
          // **globals.css도 센다.** `.app-tooltip-chrome`처럼 제품이 전역 클래스로 쓰는 자리가
          // 있고, 유틸리티 시트만 보면 그 컴포넌트는 "아무것도 선언하지 않은" 것으로 보인다 —
          // 실제로 툴팁과 체크박스가 그렇게 비어 있었다. 자기 클래스를 겨누는 규칙만 세므로
          // 전역 리셋이 섞여 들어오지 않는다.
          for (const sheet of document.styleSheets) {
            try {
              walk(sheet.cssRules);
            } catch {
              /* 인라인 시트뿐이라 접근이 막힐 일이 없다 */
            }
          }
          const read = (bucket, property) =>
            getComputedStyle(element, bucket.startsWith("::") ? bucket : null)
              .getPropertyValue(property)
              .trim();
          return Object.fromEntries(
            [...found.entries()]
              .map(([key, bucket]) => [key, read(bucket, bucket === "base" ? key : key.slice(bucket.length + 1))])
              .sort((a, b) => a[0].localeCompare(b[0])),
          );
        };

        const out = {};
        const declared = {};
        probes.forEach((probe, index) => {
          const host = document.querySelector("#probe-" + index);
          let element = host.firstElementChild;
          for (let depth = 0; depth < probe.wrapperDepth; depth += 1) element = element.firstElementChild;
          if (probe.hover) {
            const clone = element.cloneNode(true);
            element.parentElement.append(clone);
            for (const { rule } of hoverDeclarations(element)) {
              for (const property of rule.style) {
                clone.style.setProperty(
                  property,
                  rule.style.getPropertyValue(property),
                  rule.style.getPropertyPriority(property),
                );
              }
            }
            element = clone;
          }
          const values = {};
          for (const property of probe.read) {
            const pseudo = property.startsWith("::") ? property.slice(0, property.indexOf(":", 2)) : null;
            const name = pseudo ? property.slice(pseudo.length + 1) : property;
            const computed = getComputedStyle(element, pseudo);
            values[property] = name.startsWith("--") ? computed.getPropertyValue(name).trim() : computed[name];
          }
          out[probe.id] = values;
          declared[probe.id] = declaredProperties(element);
        });
        return { values: out, declared };
      }, group.map((probe) => ({
        id: probe.id,
        read: probe.read,
        hover: probe.hover ?? false,
        wrapperDepth: [probe.wrapper ?? []].flat().length,
      })));
      Object.assign(rendered, group_.values);
      Object.assign(declaredByProbe, group_.declared);
      await page.close();
    }
    await context.close();
  } finally {
    await browser.close();
  }
} finally {
  rmSync(workspace, { recursive: true, force: true });
}

// ── DS 값과 대조 ────────────────────────────────────────────────────────────
// **여기가 이 게이트의 요지다.** 그전까지 DS는 사람이 코드를 읽고 옮긴 값과만 맞춰 봤다.
// 이제 브라우저가 실제로 계산한 제품 값과 맞춘다.
const measuredFile = JSON.parse(readFileSync(resolve(repoRoot, "figma/components.measured.json"), "utf8"));

// ── 색 대조 ────────────────────────────────────────────────────────────────
// 기하만 맞추고 색을 넘기면 "제품과 같다"고 말할 수 없다. measured가 색을 **토큰 이름**으로 적으므로
// 생성된 tokens.css에서 그 이름의 값을 테마별로 꺼내 제품이 렌더한 색과 맞춘다.
const tokensCss = readFileSync(resolve(repoRoot, "packages/css/generated/tokens.css"), "utf8");
function readTokenBlock(source, marker) {
  const start = source.indexOf(marker);
  if (start < 0) throw new Error("tokens.css에서 " + marker + "를 찾지 못했습니다.");
  const open = source.indexOf("{", start);
  const close = source.indexOf("\n}", open);
  const map = new Map();
  for (const line of source.slice(open, close).split("\n")) {
    const match = /^\s*(--kds-[a-z0-9-]+):\s*(.+);\s*$/.exec(line);
    if (match) map.set(match[1], match[2].trim());
  }
  return map;
}
const THEME_TOKENS = {
  light: readTokenBlock(tokensCss, ":root"),
  dark: readTokenBlock(tokensCss, '[data-theme="dark"]'),
};
function parseColor(value) {
  if (!value) return null;
  const srgb = /^color\(srgb\s+([\d.]+)\s+([\d.]+)\s+([\d.]+)(?:\s*\/\s*([\d.]+))?\)$/.exec(value);
  if (srgb) return [+srgb[1], +srgb[2], +srgb[3], srgb[4] === undefined ? 1 : +srgb[4]];
  const rgb = /^rgba?\(\s*([\d.]+)[,\s]+([\d.]+)[,\s]+([\d.]+)(?:[,\s/]+([\d.]+))?\s*\)$/.exec(value);
  if (rgb) return [+rgb[1] / 255, +rgb[2] / 255, +rgb[3] / 255, rgb[4] === undefined ? 1 : +rgb[4]];
  const hex = /^#([0-9a-f]{6})$/i.exec(value);
  if (hex) {
    const n = Number.parseInt(hex[1], 16);
    return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255, 1];
  }
  if (value === "transparent") return [0, 0, 0, 0];
  return null;
}
const sameColor = (a, b) =>
  a !== null && b !== null && a.every((value, index) => Math.abs(value - b[index]) < 0.004);
const showColor = (parsed, raw) =>
  parsed ? "rgb(" + parsed.slice(0, 3).map((v) => Math.round(v * 255)).join(" ") + " / " + parsed[3] + ")" : String(raw);

const deviations = [];
const compared = [];

function compare(measured, expect, exempt, collect) {
  const failures = [];
  for (const [probeId, property, path, relation, a, b] of expect) {
    const scale = typeof a === "number" ? a : 1;
    const why = typeof a === "string" ? a : b;
    const raw = rendered[probeId]?.[property];
    let want = measured;
    for (const key of path) want = want?.[key];
    const label = probeId + "." + property;
    if (want === undefined) {
      failures.push(path.join(".") + "가 figma/components.measured.json에 없습니다.");
      continue;
    }
    // measured가 색이면 토큰 이름이다. 탐침이 어느 테마 문서에서 렌더됐는지를 따라 값을 푼다.
    if (typeof want === "string") {
      const probe = PROBES.find((p) => p.id === probeId);
      const theme = (probe?.doc ?? "").includes("light") ? "light" : "dark";
      const tokenValue = THEME_TOKENS[theme].get("--kds-" + want);
      if (tokenValue === undefined) {
        failures.push(label + ": DS 토큰 --kds-" + want + "가 " + theme + " 테마에 없습니다.");
        continue;
      }
      const productColor = parseColor(raw);
      const dsColor = parseColor(tokenValue);
      if (productColor === null || dsColor === null) {
        failures.push(label + ": 색을 해석하지 못했습니다 (제품 " + raw + " · DS " + tokenValue + ").");
        continue;
      }
      const equal = sameColor(productColor, dsColor);
      if (relation === "same" && !equal) {
        failures.push(
          label + ": 제품이 렌더한 색은 " + showColor(productColor, raw) + "인데 DS " + want + "는 " +
            showColor(dsColor, tokenValue) + "입니다 (" + theme + ").",
        );
        continue;
      }
      if (relation === "deviates") {
        if (!why) {
          failures.push(label + ": 편차인데 사유가 없습니다.");
          continue;
        }
        if (equal) {
          failures.push(label + ": 편차로 기록해 둔 색인데 같아졌습니다. 사유가 낡았으니 지우세요.");
          continue;
        }
        if (collect) {
          deviations.push({ axis: label, product: showColor(productColor, raw), ds: want, why });
          compared.push(label);
        }
        continue;
      }
      if (collect) compared.push(label);
      continue;
    }
    const actual = Number.parseFloat(raw) * scale;
    if (!Number.isFinite(actual)) {
      failures.push(label + "를 읽지 못했습니다 (" + raw + ").");
      continue;
    }
    if (relation === "same") {
      if (actual !== want) {
        failures.push(
          label + ": 제품이 렌더한 값은 " + actual + "인데 DS는 " + want + "입니다 (" + path.join(".") + "). " +
            "사람이 옮겨 적은 값이 실제와 다릅니다.",
        );
        continue;
      }
      if (collect) compared.push(label);
      continue;
    }
    if (!why) {
      failures.push(label + ": 편차인데 사유가 없습니다. 사유 없는 편차는 기록이 아니라 방치입니다.");
      continue;
    }
    if (actual === want) {
      failures.push(
        label + ": 편차로 기록해 둔 축인데 제품과 DS가 같아졌습니다 (" + actual + "). 사유가 낡았으니 지우세요.",
      );
      continue;
    }
    if (collect) {
      deviations.push({ axis: label, product: actual, ds: want, why });
      compared.push(label);
    }
  }

  // 대조하지 않은 컴포넌트를 침묵으로 넘기지 않는다. 대조가 없으면 "제품과 같다"고 말할 근거가 없다.
  const covered = new Set(expect.map(([, , path]) => path[0]));
  for (const name of Object.keys(measured)) {
    if (covered.has(name) || exempt[name]) continue;
    failures.push(
      name + "이 제품 렌더와 한 축도 대조되지 않았습니다. EXPECT에 넣거나 " +
        "figma/components.measured.json의 $noProductRender에 사유를 적으세요.",
    );
  }
  for (const name of Object.keys(exempt)) {
    if (covered.has(name)) {
      failures.push(name + "은 이제 대조되는데 $noProductRender에 면제 사유가 남아 있습니다.");
    } else if (!measured[name]) {
      failures.push(name + "은 components에 없는데 $noProductRender에 남아 있습니다.");
    }
  }
  return failures;
}

// ── 제품이 선언한 것을 빠짐없이 분류한다 ──────────────────────────────────
// **이 게이트의 두 번째 요지다.** 위 EXPECT는 "내가 보기로 한 축"이고, 여기는 "제품이 선언한
// 축 전부"다. 둘의 차이가 곧 내가 놓친 것이며, 그 차이를 사람이 아니라 기계가 센다.
const coverage = JSON.parse(readFileSync(resolve(repoRoot, "figma/product-coverage.json"), "utf8"));
const camel = (property) => property.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
// 논리 property와 물리 property는 LTR에서 같은 축이다. 한쪽을 대조하면 다른 쪽도 대조된 것이다.
const AXIS_ALIASES = {
  paddingInlineStart: "paddingLeft",
  paddingInlineEnd: "paddingRight",
  paddingBlockStart: "paddingTop",
  paddingBlockEnd: "paddingBottom",
  blockSize: "height",
  inlineSize: "width",
  minBlockSize: "minHeight",
  minInlineSize: "minWidth",
  borderStartStartRadius: "borderTopLeftRadius",
  borderEndStartRadius: "borderBottomLeftRadius",
  borderEndEndRadius: "borderBottomRightRadius",
  borderStartEndRadius: "borderTopRightRadius",
  columnGap: "columnGap",
  rowGap: "rowGap",
};
const axisOf = (property) => {
  const name = camel(property);
  return AXIS_ALIASES[name] ?? name;
};
const kebab = (property) => property.replace(/[A-Z]/g, (c) => "-" + c.toLowerCase());
const comparedAxes = new Map();
for (const [probeId, property] of EXPECT) {
  if (!comparedAxes.has(probeId)) comparedAxes.set(probeId, new Set());
  // `::after:borderTopWidth` 같은 행은 열거의 `::after border-top-width`와 같은 축이다.
  if (property.startsWith("::")) {
    const cut = property.indexOf(":", 2);
    comparedAxes.get(probeId).add(property.slice(0, cut) + " " + axisOf(kebab(property.slice(cut + 1))));
    continue;
  }
  comparedAxes.get(probeId).add(axisOf(property));
}
// 높이·최소높이처럼 한 축을 다른 이름으로 본 자리를 서로 인정한다.
const EQUIVALENT = [["height", "minHeight"], ["width", "minWidth"]];
// **대칭 묶음.** 모서리 넷·테두리 네 변·상하좌우 여백은 값이 같으면 한 축이다. 하나를 대조하면
// 나머지도 대조된 것이다 — 단 **값이 다르면 각자 분류해야 한다.** ProjectCard의 오버레이처럼
// 아래 두 모서리만 깎는 자리를 이 묶음이 덮어 버리면 안 된다.
const SYMMETRY = [
  ["border-top-left-radius", "border-top-right-radius", "border-bottom-left-radius", "border-bottom-right-radius"],
  ["border-top-width", "border-right-width", "border-bottom-width", "border-left-width"],
  ["border-top-color", "border-right-color", "border-bottom-color", "border-left-color"],
  ["border-top-style", "border-right-style", "border-bottom-style", "border-left-style"],
  ["padding-top", "padding-right", "padding-bottom", "padding-left",
   "padding-block-start", "padding-inline-end", "padding-block-end", "padding-inline-start"],
  ["row-gap", "column-gap"],
];
const groupOf = (property) => SYMMETRY.find((group) => group.includes(property));

function classify(cov) {
const unclassified = [];
for (const [probeId, properties] of Object.entries(declaredByProbe)) {
  const seen = comparedAxes.get(probeId) ?? new Set();
  for (const [key, value] of Object.entries(properties)) {
    // 버킷(:state · ::before · ::after)과 property를 나눈다. 전역 사유는 버킷을 가리지 않는다 —
    // `cursor`가 기본에서 범위 밖이면 hover에서도 그렇다. 버킷별로 다르게 판정해야 하는 자리는
    // 전체 키(`::after content`)로 적는다.
    const space = key.indexOf(" ");
    const bucket = space > 0 && (key.startsWith(":") || key.startsWith("::")) ? key.slice(0, space) : "";
    const property = bucket ? key.slice(space + 1) : key;
    const axis = bucket && bucket.startsWith("::") ? bucket + " " + axisOf(property) : axisOf(property);
    if (seen.has(axis)) continue;
    if (EQUIVALENT.some(([a, b]) => (axis === a && seen.has(b)) || (axis === b && seen.has(a)))) continue;
    const group = groupOf(property);
    if (
      group &&
      group.some((sibling) => {
        const siblingKey = bucket ? bucket + " " + sibling : sibling;
        const siblingAxis = bucket && bucket.startsWith("::") ? bucket + " " + axisOf(sibling) : axisOf(sibling);
        return (
          sibling !== property &&
          seen.has(siblingAxis) &&
          properties[siblingKey] !== undefined &&
          properties[siblingKey] === value
        );
      })
    ) {
      continue;
    }
    if (cov.probeScope?.[probeId]?.[key]) continue;
    if (cov.probeScope?.[probeId]?.[property]) continue;
    if (cov.scope?.[key]) continue;
    if (cov.scope?.[property]) continue;
    unclassified.push(probeId + " · " + key + " = " + value);
  }
}
// 낡은 사유도 실패다 — 제품이 더 이상 선언하지 않는 property에 사유가 남아 있으면 지운다.
const declaredSet = new Set(
  Object.entries(declaredByProbe).flatMap(([probeId, map]) =>
    Object.keys(map).flatMap((key) => {
      const space = key.indexOf(" ");
      const bare = space > 0 && key.startsWith(":") ? key.slice(space + 1) : key;
      return [probeId + " · " + key, probeId + " · " + bare];
    }),
  ),
);
const anyDeclared = new Set(
  Object.values(declaredByProbe).flatMap((map) =>
    Object.keys(map).flatMap((key) => {
      const space = key.indexOf(" ");
      return space > 0 && key.startsWith(":") ? [key, key.slice(space + 1)] : [key];
    }),
  ),
);
for (const property of Object.keys(cov.scope ?? {})) {
  if (property.startsWith("$")) continue;
  if (!anyDeclared.has(property)) unclassified.push("사유가 낡았습니다 — 제품이 선언하지 않는 property: " + property);
}
for (const [probeId, properties] of Object.entries(cov.probeScope ?? {})) {
  for (const property of Object.keys(properties)) {
    if (!declaredSet.has(probeId + " · " + property)) {
      unclassified.push("사유가 낡았습니다 — " + probeId + "이 " + property + "를 선언하지 않습니다");
    }
  }
}
return unclassified;
}

const unclassified = classify(coverage);

// **이 게이트가 무엇을 잡는지 스스로 증명한다.** 사유를 하나 지우면 그 축이 미분류로 떠야 한다.
if (!process.argv.includes("--no-canary")) {
  const baseline = new Set(unclassified);
  const TAMPER = [
    [
      "전역 사유 제거",
      (cov) => {
        const scope = { ...cov.scope };
        delete scope.cursor;
        return { ...cov, scope };
      },
    ],
    [
      "탐침 사유 제거",
      (cov) => {
        // 전역 사유가 함께 덮는 property를 지우면 아무 일도 일어나지 않는다 — 탐침 사유만
        // 갖는 자리를 골라야 검출력이 증명된다.
        const probeScope = { ...cov.probeScope };
        for (const [probeId, properties] of Object.entries(probeScope)) {
          const property = Object.keys(properties).find((name) => cov.scope?.[name] === undefined);
          if (property === undefined) continue;
          const { [property]: _removed, ...rest } = properties;
          return { ...cov, probeScope: { ...probeScope, [probeId]: rest } };
        }
        return cov;
      },
    ],
    [
      "쓰이지 않는 사유 추가",
      (cov) => ({ ...cov, scope: { ...cov.scope, "made-up-property": "사유" } }),
    ],
  ];
  for (const [label, mutate] of TAMPER) {
    const introduced = classify(mutate(coverage)).filter((item) => !baseline.has(item));
    if (introduced.length === 0) {
      unclassified.push(
        baseline.size === 0
          ? "canary가 변조를 잡지 못했습니다: " + label
          : "canary의 검출력을 증명하지 못했습니다 — 기존 실패에 가려집니다: " + label,
      );
    }
  }
}

const mismatches = compare(measuredFile.components, EXPECT, measuredFile.$noProductRender ?? {}, true);

// **이 게이트가 무엇을 잡는지 스스로 증명한다.** 변조가 baseline에 없던 실패를 새로 만들어야 한다.
const TAMPERS = [
  [
    "일치 축의 DS 값 변조",
    (measured, expect, exempt) => {
      const row = expect.find(([, , , relation]) => relation === "same");
      const clone = structuredClone(measured);
      let node = clone;
      for (const key of row[2].slice(0, -1)) node = node[key];
      node[row[2].at(-1)] += 1;
      return [clone, expect, exempt];
    },
  ],
  [
    "편차가 사라졌는데 사유가 남은 경우",
    (measured, expect, exempt) => {
      const index = expect.findIndex(([, , , relation]) => relation === "deviates");
      const row = expect[index];
      const scale = typeof row[4] === "number" ? row[4] : 1;
      const clone = structuredClone(measured);
      let node = clone;
      for (const key of row[2].slice(0, -1)) node = node[key];
      node[row[2].at(-1)] = Number.parseFloat(rendered[row[0]][row[1]]) * scale;
      return [clone, expect, exempt];
    },
  ],
  [
    "대조 없는 컴포넌트를 면제 없이 두는 경우",
    (measured, expect, exempt) => [
      { ...measured, "made-up-component": { sizes: {} } },
      expect,
      exempt,
    ],
  ],
  [
    "components에 없는 것을 면제에 남겨 둔 경우",
    (measured, expect, exempt) => [measured, expect, { ...exempt, "made-up-component": "사유" }],
  ],
  [
    "사유 없는 편차",
    (measured, expect, exempt) => {
      const index = expect.findIndex(([, , , relation]) => relation === "deviates");
      const clone = expect.map((row, i) => (i === index ? row.slice(0, 4) : row));
      return [measured, clone, exempt];
    },
  ],
];
if (!process.argv.includes("--no-canary")) {
  const baseline = new Set(mismatches);
  const exempt = measuredFile.$noProductRender ?? {};
  for (const [label, mutate] of TAMPERS) {
    const [measured, expect, nextExempt] = mutate(measuredFile.components, EXPECT, exempt);
    const cleaned = Object.fromEntries(Object.entries(nextExempt).filter(([, value]) => value));
    const introduced = compare(measured, expect, cleaned, false).filter((f) => !baseline.has(f));
    if (introduced.length === 0) {
      mismatches.push(
        baseline.size === 0
          ? "canary가 변조를 잡지 못했습니다: " + label
          : "canary의 검출력을 증명하지 못했습니다 — 기존 실패에 가려집니다: " + label,
      );
    }
  }
}

if (unclassified.length > 0) {
  console.error(
    "[product-components] 제품이 선언했는데 분류되지 않은 축 " + unclassified.length + "건입니다. " +
      "EXPECT에 대조 행을 넣거나 figma/product-coverage.json에 사유와 함께 범위 밖으로 적으세요.",
  );
  const limit = process.env.KDS_LIST_ALL ? unclassified.length : 60;
  for (const item of unclassified.slice(0, limit)) console.error("[product-components]   " + item);
  if (unclassified.length > limit) console.error("[product-components]   … 외 " + (unclassified.length - limit) + "건");
  process.exit(1);
}

if (mismatches.length > 0) {
  for (const mismatch of mismatches) console.error("[product-components] " + mismatch);
  process.exit(1);
}

const payload =
  JSON.stringify(
    {
      $comment:
        "생성물. scripts/measure-product-components.mjs가 제품 클래스를 제품 Tailwind로 컴파일해 실브라우저에서 잰다. 직접 수정하지 않는다.",
      $whyThisExists:
        "그전까지 제품 값은 전부 소스 읽기였다. product.measured.json의 187축 중 기계 대조는 12축뿐이고 나머지는 사람이 코드를 읽고 옮긴 값이다. 여기 값은 브라우저가 실제로 계산한 것이다.",
      $method:
        "제품 서버를 띄우지 않는다. 클래스 문자열은 손으로 옮기지 않고 제품 소스의 상수 이름을 가리켜 커밋에서 직접 꺼낸다. 그것을 제품 Tailwind로 컴파일하고 제품 CSS와 함께 빈 문서에 올려 계산값을 읽는다.",
      productRef,
      productCommit: commit,
      probes: PROBES.map(({ id, source, from, html, doc, wrapper, hover }) => ({
        id,
        source,
        hover: hover ?? false,
        from: from ? FILES[from[0]] + " → " + from.slice(1).join(" + ") : null,
        doc: doc ?? "default",
        wrapper: wrapper ?? null,
        html,
      })),
      rendered,
      declared: declaredByProbe,
      deviations,
    },
    null,
    2,
  ) + "\n";

if (checkOnly) {
  let current = "";
  try {
    current = readFileSync(outputPath, "utf8");
  } catch {
    console.error("[product-components] 생성물이 없습니다: migration/product.rendered-components.json");
    process.exit(1);
  }
  if (current !== payload) {
    const before = JSON.parse(current);
    for (const [id, values] of Object.entries(rendered)) {
      for (const [property, value] of Object.entries(values)) {
        const was = before.rendered?.[id]?.[property];
        if (was !== value) console.error("[product-components] " + id + "." + property + ": " + was + " → " + value);
      }
    }
    console.error("[product-components] 제품 렌더 값이 기록과 다릅니다. 값을 다시 판정하고 갱신하세요.");
    process.exit(1);
  }
} else {
  atomicWriteBatch([{ absolute: outputPath, expected: payload }]);
}

console.log(
  "[product-components] " +
    (checkOnly ? "checked" : "built") +
    ": 탐침 " + PROBES.length + "종 @ " + commit.slice(0, 8) +
    " · **브라우저가 잰 제품 값과 DS를 " + compared.length + "축 대조** (일치 " +
    (compared.length - deviations.length) + " · 기록된 편차 " + deviations.length +
    ") · 컴포넌트 " + new Set(EXPECT.map(([, , path]) => path[0])).size + "/" +
    Object.keys(measuredFile.components).length + " 대조" +
    " · **제품 선언 " + Object.values(declaredByProbe).reduce((sum, map) => sum + Object.keys(map).length, 0) +
    "건이 빠짐없이 분류됨**",
);
