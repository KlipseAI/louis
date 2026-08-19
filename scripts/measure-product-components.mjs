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
    id: "sidebar-header-row",
    source: "Gnb.tsx sidebarHeaderRow",
    from: ["gnb", "sidebarHeaderRow"],
    read: ["minHeight", "columnGap"],
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
    read: ["minHeight", "paddingTop", "paddingLeft", "columnGap", "borderTopLeftRadius", "backgroundColor", "color"],
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
    id: "top-bar",
    source: "Gnb.tsx mainChromeTopBar + mainChromeTopBarInPanel",
    from: ["gnb", "mainChromeTopBar", "mainChromeTopBarInPanel"],
    hostWidth: 1440,
    text: "홈",
    read: ["paddingTop", "paddingLeft", "columnGap", "height"],
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
  ["dialog-card", "paddingTop", ["dialog", "sizes", "compact", "paddingBlock"], "deviates",
    "제품 16, DS 20. 제품 모달은 공용 구현 없이 화면별 14벌이고 여백이 12·16·20·24로 갈린다. DS는 dialog.md가 고른 20을 쓴다."],
  ["dialog-card", "borderTopLeftRadius", ["dialog", "sizes", "compact", "radius"], "deviates",
    "제품 24, DS 20. radius-card-lg 20은 DS-D-0014가 소유한다 — 제품 14벌의 반경도 16·20·24로 갈려 정본이 없다."],
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
let sources;
try {
  // 제품의 진입 CSS는 ./keyframes.css를 @import한다. 컴파일러가 찾을 수 있게 함께 꺼내 둔다.
  const tailwindEntry = git(["show", commit + ":apps/web/app/tailwind.css"]);
  writeFileSync(join(workspace, "entry.css"), tailwindEntry);
  writeFileSync(join(workspace, "keyframes.css"), git(["show", commit + ":apps/web/app/keyframes.css"]));

  sources = Object.fromEntries(
    Object.entries(FILES).map(([alias, path]) => [alias, git(["show", commit + ":" + path])]),
  );
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
  const classes = PROBES.flatMap((probe) =>
    [probe.html.match(/class="([^"]*)"/)[1], probe.wrapper ?? ""].join(" ").split(/\s+/),
  ).filter(Boolean);
  const utilities = compiled.build(classes);

  const productCss = [
    normalize(git(["show", commit + ":apps/web/app/tailwind.css"])),
    git(["show", commit + ":apps/web/app/globals.css"]),
    utilities,
  ].join("\n\n");

  const docs = [...new Set(PROBES.map((probe) => probe.doc ?? "default"))];
  rendered = {};
  const browser = await chromium.launch();
  try {
    const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, colorScheme: "dark" });
    for (const doc of docs) {
      const group = PROBES.filter((probe) => (probe.doc ?? "default") === doc);
      const page = await context.newPage();
      const htmlAttributes =
        'data-theme="dark"' + (doc === "collapsed" ? ' data-app-gnb-sidebar-collapsed="true"' : "");
      await page.setContent(
        "<!doctype html><html " + htmlAttributes + "><head><style>" +
          productCss.replace(/<\/style>/gi, "<\\/style>") +
          "</style></head><body>" +
          group
            .map((probe, index) => {
              const inner = probe.wrapper
                ? '<div class="' + probe.wrapper + '">' + probe.html + "</div>"
                : probe.html;
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
        const out = {};
        probes.forEach((probe, index) => {
          const host = document.querySelector("#probe-" + index);
          const element = probe.wrapper ? host.firstElementChild.firstElementChild : host.firstElementChild;
          const values = {};
          for (const property of probe.read) {
            const pseudo = property.startsWith("::") ? property.slice(0, property.indexOf(":", 2)) : null;
            const name = pseudo ? property.slice(pseudo.length + 1) : property;
            values[property] = getComputedStyle(element, pseudo)[name];
          }
          out[probe.id] = values;
        });
        return out;
      }, group.map((probe) => ({ id: probe.id, read: probe.read, wrapper: probe.wrapper ?? null })));
      Object.assign(rendered, group_);
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

const deviations = [];
const compared = [];

function compare(measured, expect, exempt, collect) {
  const failures = [];
  for (const [probeId, property, path, relation, a, b] of expect) {
    const scale = typeof a === "number" ? a : 1;
    const why = typeof a === "string" ? a : b;
    const raw = rendered[probeId]?.[property];
    const actual = Number.parseFloat(raw) * scale;
    let want = measured;
    for (const key of path) want = want?.[key];
    const label = probeId + "." + property;
    if (want === undefined) {
      failures.push(path.join(".") + "가 figma/components.measured.json에 없습니다.");
      continue;
    }
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
    (measured, expect, exempt) => [measured, expect, { ...exempt, slider: undefined }],
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
      probes: PROBES.map(({ id, source, from, html, doc, wrapper }) => ({
        id,
        source,
        from: from ? FILES[from[0]] + " → " + from.slice(1).join(" + ") : null,
        doc: doc ?? "default",
        wrapper: wrapper ?? null,
        html,
      })),
      rendered,
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
    Object.keys(measuredFile.components).length + " 대조",
);
