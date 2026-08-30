import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";
import { atomicWriteBatch } from "./lib/atomic-output.mjs";
import { resolveProductRef } from "./lib/product-ref.mjs";
import { PRODUCT_FILES } from "./lib/product-files.mjs";
import { productFontFace } from "./lib/product-font.mjs";
import { materializeDsPackage } from "./lib/ds-package-shim.mjs";

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
// 측정 대상은 근거 lock이 고정한 커밋이다 — `origin/main`을 따라가면 같은 명령이
// 어제와 다른 값을 낸다. scripts/lib/product-ref.mjs에 사유가 있다.
const { ref: productRef, source: productRefSource } = resolveProductRef();
const checkOnly = process.argv.includes("--check");

const FILES = PRODUCT_FILES;

// 재는 대상. `from`은 제품 소스의 상수를 가리키고, `html`은 제품에 공용 상수가 없어
// 클래스를 직접 적어야 하는 경우에만 쓴다(그 사유를 source에 적는다).
const PROBES = [
  // ── Button — **제품이 LOUIS 레시피로 넘어갔다** ────────────────────────────
  // `Button.tsx` 는 이제 클래스 상수를 하나도 갖지 않고 `.louis-button` + `data-variant` ·
  // `data-size` · `data-left-icon` 만 그린다 (Button.tsx:38-51). 그래서 `from` 으로 꺼낼 상수가
  // 없고 남은 것은 **후크 이름**뿐이다 — `.louis-spinner` · `.louis-progress-bar` 탐침과 같은 형태다.
  //
  // **그전 탐침은 아무것도 아닌 것을 재고 있었다.** `--button-height` · `--button-padding-inline` ·
  // `--button-height-sm` · `--button-min-width-sm` · `--button-padding-inline-sm` 을 읽었는데
  // 제품이 채택 정리에서 그 다섯을 지웠다. **정의되지 않은 var()는 선언을 무효로 만들 뿐 실패하지
  // 않아서** 탐침은 padding 0 · min-width 0 을 재면서도 조용히 돌았다. 지금 globals.css 에 남은
  // `--button-height` 는 이름과 달리 버튼이 쓰지 않는다 — 하이라이트 refinement 입력창 전용이라고
  // 제품 자신이 적어 두었다 (globals.css:65-68).
  //
  // 재는 대상은 제품이 핀으로 소비하는 그 LOUIS 판이다(ds-package-shim 이 제품 커밋에서 꺼낸다).
  // 제품이 핀을 되돌리거나 `.louis-button` 을 떠나면 여기가 어긋난다.
  {
    id: "button-lg",
    source: 'Button.tsx — size="lg". 제품이 .louis-button 을 그대로 소비한다 (인증 제출 CTA 6곳)',
    html: `<button class="louis-button" data-variant="primary" data-size="lg">저장</button>`,
    read: ["height", "paddingTop", "paddingLeft", "paddingRight", "borderTopLeftRadius", "columnGap", "minWidth"],
  },
  {
    id: "button-md",
    source: 'Button.tsx — size="md" 가 기본값이다 (DS-D-0027)',
    html: `<button class="louis-button" data-variant="primary" data-size="md">저장</button>`,
    read: ["height", "paddingTop", "paddingLeft", "paddingRight", "borderTopLeftRadius", "columnGap", "minWidth"],
  },
  // 아이콘이 붙은 쪽만 2px 좁다. `leftIcon` 이 있을 때만 `data-left-icon` 이 붙고 아이콘 span 이
  // 함께 그려지므로 (Button.tsx:46,53-57) 탐침도 그대로 그린다.
  {
    id: "button-lg-icon",
    source: 'Button.tsx — size="lg" + leftIcon. data-left-icon 이 붙은 쪽 여백만 좁아진다',
    html: `<button class="louis-button" data-variant="primary" data-size="lg" data-left-icon="true"><span class="louis-button__icon"></span><span class="louis-button__label">저장</span></button>`,
    read: ["paddingLeft"],
  },
  {
    id: "button-md-icon",
    source: 'Button.tsx — size="md" + leftIcon',
    html: `<button class="louis-button" data-variant="primary" data-size="md" data-left-icon="true"><span class="louis-button__icon"></span><span class="louis-button__label">저장</span></button>`,
    read: ["paddingLeft"],
  },
  // **secondary 의 헤어라인은 이제 테두리가 아니다.** 그전 탐침은 `[border:1px_solid_…]` 를 직접
  // 적어 두고 그 1px 을 다시 읽었다 — 제품이 아니라 **자기가 적은 리터럴을 재고 있었다.** 지금
  // 제품은 `border: 0` 인 `.louis-button[data-variant="secondary"]` 를 그리고 헤어라인은
  // `--louis-hairline-inset` (inset box-shadow) 이 그린다 (button.css:115-121).
  {
    id: "button-secondary",
    source: 'Button.tsx — variant="secondary". 헤어라인은 border 가 아니라 inset box-shadow 다',
    html: `<button class="louis-button" data-variant="secondary" data-size="md">저장</button>`,
    read: ["borderTopWidth", "borderTopLeftRadius", "height"],
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
  // **손으로 적은 리터럴을 되읽고 있었다.** 이 탐침의 html 은 `[border-radius:16px]` 를 자기가
  // 적어 두고 그 16 을 다시 읽었다 — 제품을 잰 적이 없다. 실제 `archiveCard` 는 반경을 선언하지
  // 않고 `.louis-project-card` 에서 받는다(appHomeSceneStyles.ts:18-19). 제품 상수를 그대로
  // 꺼내 쓴다. 2026-08-30 에 이 거짓 측정이 DS 반경 판정을 통째로 잘못된 방향으로 끌었다.
  {
    id: "project-card",
    source: "apps/web/components/scenes/appHomeSceneStyles.ts archiveCard (= .louis-project-card + 제품 유틸리티)",
    from: ["appHome", "archiveCard"],
    read: ["borderTopLeftRadius", "rowGap", "columnGap", "padding", "::before:borderTopLeftRadius"],
  },
  // 위와 같은 거짓 측정이었다 — html 에 `[padding:16px] [border-radius:0_0_16px_16px]` 를 적어
  // 두고 그 값을 되읽었다. 제품 상수는 `.louis-project-card-overlay` + `[height:30%]` 뿐이고
  // 여백과 반경을 스스로 선언하지 않는다(appHomeSceneStyles.ts:298-300).
  {
    id: "project-card-overlay",
    source: "appHomeSceneStyles.ts archivePreviewTitleOverlay (= .louis-project-card-overlay + height)",
    from: ["appHome", "archivePreviewTitleOverlay"],
    read: ["padding", "borderBottomLeftRadius", "height",
      "::before:borderTopLeftRadius", "::before:borderBottomLeftRadius"],
  },
  {
    id: "project-card-preview",
    source: "appHomeSceneStyles.ts archivePreview — 카드 미디어 면",
    from: ["appHome", "archivePreview"],
    read: ["borderTopLeftRadius"],
  },
  // 여기도 자기 html 의 `[gap:12px]` 을 되읽고 있었다. 제품 상수는 `gap-2` 이고
  // 제품의 `--spacing: 2px` 에서 그것은 **4px** 다 — 리터럴이 실제의 세 배를 말하고 있었다.
  {
    id: "project-grid",
    source: "apps/web/components/scenes/appHomeSceneStyles.ts archiveGrid",
    from: ["appHome", "archiveGrid"],
    read: ["columnGap", "rowGap", "gridTemplateColumns"],
  },
  // **제품 툴팁이 두 벌이다.** `.app-tooltip-chrome` 은 제품에서 사라졌고(0회) 그 자리를 LOUIS
  // `.louis-tooltip` 이 이어받았다 — 소비처 6곳(ChromeTooltip.tsx:85 · ComposerBar.tsx:60 ·
  // useAnalyticsBarTooltip.tsx:25 · analytics/shared.tsx:445 · YoutubeVideoAnalyticsView.tsx:870 ·
  // mypage/upgrade/page.tsx:605). 그런데 **제품이 소유한 두 번째 툴팁이 아직 살아 있다** —
  // `globals.css:1403` 의 `[data-tooltip]::after` 규칙이고 노드 핸들 다섯 파일이 쓴다.
  // 한 벌만 재고 "제품 툴팁은 이렇다"고 적으면 그 갈림이 게이트 밖에 남는다(경쟁 정의 원칙).
  {
    id: "tooltip",
    source: "ChromeTooltip.tsx:85 외 5곳이 소비하는 LOUIS 정본 .louis-tooltip",
    html: `<div class="louis-tooltip">저장</div>`,
    read: ["paddingTop", "paddingLeft", "borderTopLeftRadius", "fontSize", "lineHeight", "height"],
  },
  {
    // 테두리 축의 **소유자가 여기다.** `.louis-tooltip` 은 border 0 에 inset 헤어라인이고,
    // 제품이 소유한 이 규칙만 `border: 1px solid var(--app-tooltip-border)` 를 그린다
    // (globals.css:1411). 위 탐침에서 borderTopWidth 를 뺀 것은 축을 버린 것이 아니라
    // **실제 소유자에게 옮긴 것**이다.
    id: "tooltip-product",
    source: "globals.css:1403 [data-tooltip]::after — 노드 핸들 다섯 파일이 쓰는 제품 소유 툴팁",
    html: `<span data-tooltip="저장"></span>`,
    read: [
      "::after:paddingTop", "::after:paddingLeft", "::after:borderTopLeftRadius",
      "::after:borderTopWidth", "::after:fontSize", "::after:lineHeight",
    ],
  },
  {
    id: "toast",
    // **인라인 덮어쓰기가 사라졌다.** 그전에는 클래스가 blur(10px)인데 앱 홈이 인라인으로
    // blur(16px) saturate(130%)를 걸어 그쪽이 이겼고, 이 탐침은 그 인라인을
    // `AppHomeScene.tsx` 의 `floatingCtaBlurStyle` 에서 꺼내 함께 세웠다. 지금 제품에는 그
    // 상수가 없고(LOUIS `.louis-toast` 채택 정리에서 없어졌다) 클래스의 10px 이 곧 화면 값이다.
    // `inlineFrom` 을 지운 것은 단순화가 아니라 **제품이 그 겹을 없앴다는 기록**이다.
    source: "appHomeSceneStyles.ts toast (= .louis-toast + 제품 유틸리티)",
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
  // `--dropdown-radius` · `--dropdown-padding` · `--dropdown-surface-bg` 는 제품에서 0회다.
  // 폐기가 제품 자신에게 적혀 있다 — globals.css:59 「dropdown/menu/popover surface는 LOUIS
  // 정본을 직접 소비한다 (P#1)」. 그 값들은 LOUIS 가 흡수했고(menu-popover.css:12,14) 제품은
  // `.louis-popover` 를 직접 그린다. `creditHistorySortMenu` 를 고르는 이유는 얹는 것이
  // `min-width` 와 collision shim 뿐이라 레시피 값이 그대로 드러나기 때문이다.
  {
    id: "menu-panel",
    source: "myPageSceneStyles.ts creditHistorySortMenu (= .louis-popover + collision shim)",
    from: ["myPage", "creditHistorySortMenu"],
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
  // `dialog-action` 은 없어졌다. 제품이 `61ef0db1` 에서 대화상자의 확인 버튼을 LOUIS `Button`
  // 컴포넌트로 옮기면서 `modalConfirm` 클래스 상수 자체가 사라졌다 — 이제 그 자리를 재는 것은
  // 위의 `button-*` 탐침이다. 대조하던 EXPECT 행은 원래 없었다(높이·반경 둘 다 미대조였다).
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
  // **`AVATAR` 상수에는 이제 크기가 없다.** `UserCircleDefaultAvatar.tsx:13-14` 가 사유를 적는다
  // — 자기 루트에 달고 있던 28px 을 호출부 셋이 전부 `!` 로 되받아 쳐서 함께 걷어냈고, 남은 것은
  // `louis-avatar__fallback` + 색뿐이다. 그 상수를 재면 크기 선언이 없어 문서 폭(360)이 나온다 —
  // 아무것도 아닌 것을 재고 있었다. 크기를 소유하는 것은 `.louis-avatar`(avatar.css:27-28)다.
  {
    id: "avatar",
    source: "avatar.css .louis-avatar — 크기를 소유하는 쪽. AVATAR 상수는 폴백 글리프만 그린다",
    html: `<span class="louis-avatar"></span>`,
    read: ["width", "height"],
  },
  {
    id: "badge",
    source: "highlightSceneStyles.ts historyCardStatus — 제품 상태 배지",
    from: ["highlight", "historyCardStatus"],
    text: "완료",
    read: ["paddingTop", "paddingLeft", "borderTopLeftRadius", "borderTopWidth"],
  },
  // **제품 스피너가 LOUIS 로 넘어갔다.** `LoadingSpinner.tsx` 는 이제 클래스 상수를 하나도 갖지
  // 않고 `.louis-spinner` + `data-size` + 자식 `.louis-spinner__ring` 만 그린다. 그래서
  // `from` 으로 뽑을 상수가 없고, 남은 것은 **후크 이름**뿐이다 — 수치는 한 글자도 여기 없고
  // 전부 LOUIS CSS 에 있으므로 `.app-tooltip-chrome` · `.app-native-checkbox` 탐침과 같은
  // 형태로 적는다. 재는 대상은 제품이 핀으로 소비하는 그 LOUIS 판이다(ds-package-shim 이
  // 제품 커밋에서 꺼낸다) — 제품이 핀을 되돌리면 여기가 어긋난다.
  {
    id: "spinner-md",
    source: "LoadingSpinner.tsx — 제품이 .louis-spinner 를 그대로 소비한다(기본 크기 md)",
    html: `<span class="louis-spinner__ring"></span>`,
    wrapper: [{ class: "louis-spinner", attrs: { "data-size": "md" } }],
    read: ["width", "height", "::after:borderTopWidth"],
  },
  {
    id: "spinner-sm",
    source: 'LoadingSpinner.tsx — size="sm" 은 조상의 data-size 가 정한다',
    html: `<span class="louis-spinner__ring"></span>`,
    wrapper: [{ class: "louis-spinner", attrs: { "data-size": "sm" } }],
    read: ["width", "height", "::after:borderTopWidth"],
  },
  // `.app-native-checkbox` 는 **정의와 소비처가 같은 변경에서 함께** 사라졌다 — 매달린 후크가
  // 아니다(VideoEditProjectPicker.tsx:140-143 이 그 사실을 적어 둔다). 지금 제품이 그리는 것은
  // LOUIS `.louis-checkbox__control` 이고 소비처가 16곳 넘는다. 클래스 없는 `<input>` 을 재던
  // 그전 탐침은 브라우저 기본 13px 을 재고 있었다.
  {
    id: "checkbox",
    source: "VideoEditProjectPicker.tsx:493 외 다수가 소비하는 LOUIS 정본 .louis-checkbox__control",
    html: `<input type="checkbox" class="louis-checkbox__control" />`,
    read: ["width", "height", "borderTopLeftRadius"],
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
    wrapperFrom: [["gnb", "wrapperSidebar"]],
    read: ["minHeight", "columnGap", "paddingLeft"],
  },
  {
    id: "sidebar-header-row-collapsed",
    source: "Gnb.tsx sidebarHeaderRow (접힘)",
    from: ["gnb", "sidebarHeaderRow"],
    wrapperFrom: [["gnb", "wrapperSidebar"]],
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
    id: "sidebar-logo-rail-collapsed",
    // 접힘에서 sidebarLogoRail은 규칙 넷(width · justify-content · transform · overflow)을 새로
    // 받는다. 「펼침에서 잰 값이 접힘에서도 같다」는 추정이지 실측이 아니다.
    source: "Gnb.tsx sidebarLogoRail (접힘)",
    from: ["gnb", "sidebarLogoRail"],
    doc: "collapsed",
    read: ["minHeight"],
  },
  {
    id: "sidebar-cta",
    source: "Gnb.tsx sidebarUpgradeButton",
    from: ["gnb", "sidebarUpgradeButton"],
    wrapperFrom: [["gnb", "wrapperSidebar"]],
    tag: "button",
    text: "업그레이드",
    read: ["minHeight", "paddingTop", "paddingLeft", "columnGap", "borderTopLeftRadius", "backgroundColor", "color", "boxShadow"],
  },
  {
    id: "sidebar-cta-collapsed",
    source: "Gnb.tsx sidebarUpgradeButton (접힘)",
    from: ["gnb", "sidebarUpgradeButton"],
    wrapperFrom: [["gnb", "wrapperSidebar"]],
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
    id: "sidebar-cta-hover",
    // **Active 클래스를 붙이면 안 된다** — hover 색을 정하는 규칙이 형제 상수
    // sidebarUpgradeButtonActive 의 `:not(&):hover` 라, 붙이면 매칭되지 않고
    // sidebarUpgradeButton 자신의 mint `[&:hover]` 가 잡힌다.
    source: "Gnb.tsx sidebarUpgradeButton (hover, 다크)",
    from: ["gnb", "sidebarUpgradeButton"],
    tag: "button",
    doc: "hover",
    hover: true,
    text: "업그레이드",
    read: ["backgroundColor", "color"],
  },
  {
    id: "sidebar-cta-hover-light",
    // Default 가 sidebar-cta / sidebar-cta-light 두 벌인 것과 같은 이유로 Hover 도 두 벌이다.
    source: "Gnb.tsx sidebarUpgradeButton (hover, 라이트)",
    from: ["gnb", "sidebarUpgradeButton"],
    tag: "button",
    doc: "hover-light",
    hover: true,
    text: "업그레이드",
    read: ["backgroundColor", "color"],
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
  // 같은 표식을 **인스펙터 패널 안**에서도 잰다. 레일 높이는 맥락에 따라 20 · 28 로 갈리는데
  // (slider-track-root · slider-track-root-panel) 표식도 함께 갈리는지는 아무도 확인한 적이
  // 없었다 — DS 는 lg/track 과 md/track 에 같은 2×14 를 적어 두었고, 그 주장이 참인지 여기서
  // 기계가 본다. 갈라지면 이 행이 실패한다.
  {
    id: "slider-track-marker-panel",
    source: "VideoEditModal.tsx overlayRadixRange ::after (인스펙터 패널 안) — lg/track 맥락",
    from: ["vem", "overlayRadixRange"],
    wrapper: ["vem-propertiesPanel", "vem-overlay-radix-root-full"],
    read: ["::after:width", "::after:height"],
  },
  // **진행바도 LOUIS 로 넘어갔다.** `5261daea`(P#8)가 `highlightSceneStyles.ts` 의
  // `progressBarTrack` · `progressBarFill` 을 지우고 `HighlightProjectScene.tsx:2589,2601` 이
  // `.louis-progress-bar` / `.louis-progress-bar__fill` 을 직접 그린다. 스피너와 같은 형태로
  // 후크 이름만 적는다.
  {
    id: "progress-bar-track",
    source: "HighlightProjectScene.tsx — 제품이 .louis-progress-bar 를 그대로 소비한다",
    html: `<div class="louis-progress-bar"></div>`,
    read: ["height", "maxWidth", "borderTopLeftRadius"],
  },
  {
    id: "progress-bar-fill",
    source: "HighlightProjectScene.tsx — .louis-progress-bar__fill",
    html: `<div class="louis-progress-bar__fill"></div>`,
    wrapper: ["louis-progress-bar"],
    read: ["borderTopLeftRadius"],
  },
  {
    id: "progress-ring",
    source: "Gnb.tsx profileTrigger — 제품의 유일한 진행률 링",
    from: ["gnb", "profileTrigger"],
    tag: "button",
    read: ["width", "height", "--profile-ring-width", "--profile-ring-gap"],
  },
  // ── 배너 캐러셀 ───────────────────────────────────────────────────────────
  // **정본이 옮겨 갔다.** 제품이 `6602fd24` 에서 `components/banners/TabBannerCarousel.tsx`
  // 를 지웠고, 마크업은 `AppHomeScene.tsx` 로 클래스 상수는 `appHomeSceneStyles.ts` 의
  // `banner*` 로 갔다. 그래서 `from` 의 그룹이 `carousel` 에서 `appHome` 으로 바뀌었다.
  //
  // 그 이사 과정에서 값의 소유자도 바뀌었다. 컨트롤 알약·화살표·점 묶음·점은 제품이 이제
  // LOUIS 클래스(`.louis-banner-carousel__*`)를 그대로 소비하고, 제품 클래스는 `tw-ah-0xx`
  // 표식과 `z-index` 만 얹는다. 그래서 이 탐침들은 「제품이 DS 와 같은 값을 갖는가」가 아니라
  // **「제품이 그 소비를 유지하는가」**를 재는 것이 됐다 — 제품이 LOUIS 클래스를 떼거나 위에
  // 다른 값을 덮으면 여기가 어긋난다.
  {
    id: "carousel",
    source: "appHomeSceneStyles.ts updateBanner — 제품에 남은 유일한 배너 셸",
    from: ["appHome", "updateBanner"],
    hostWidth: 960,
    read: ["height", "borderTopLeftRadius"],
  },
  // `carousel-full-bleed` 는 없어졌다. 제품에 `[data-bleed="full"]` 을 거는 자리가 **한 곳도
  // 없다**(`git grep data-bleed` 0건) — 옛 `CAROUSEL_FULL_BLEED` 가 파일과 함께 사라졌다.
  // 셸을 우리 손으로 `data-bleed="full"` 로 세워 재면 그것은 제품 실측이 아니라 LOUIS 를
  // LOUIS 로 재는 것이므로 세우지 않는다. 그 결과 DS `banner-carousel.sizes.full.radius`(0) 는
  // **제품 근거를 잃었다** — 아래 EXPECT 에 그 사실을 적어 둔다.
  {
    id: "carousel-content",
    source: "appHomeSceneStyles.ts bannerContent",
    from: ["appHome", "bannerContent"],
    hostWidth: 960,
    read: ["width", "paddingTop", "paddingLeft"],
  },
  {
    id: "carousel-controls",
    source: "appHomeSceneStyles.ts bannerControls (= .louis-banner-carousel__controls + z-3)",
    from: ["appHome", "bannerControls"],
    hostWidth: 960,
    read: ["paddingTop", "columnGap", "right", "bottom", "borderTopLeftRadius"],
  },
  {
    id: "carousel-controls-filled",
    // `controlsHeight` 는 컨트롤 알약에 높이 선언이 **없는** 파생 축이다 — 패딩 위아래 +
    // 자식 최대 높이(화살표 28)로만 결정된다. 자식이 없는 `carousel-controls` 로는 낼 수 없어
    // 두 겹을 세운다. 그전에는 이 한 축만 클래스를 손으로 이어 붙인 `html` 이었고 주석이
    // 스스로 드리프트 위험을 적어 두었는데, `childFrom` 이 생겨 그 위험이 없어졌다.
    source: "appHomeSceneStyles.ts bannerControls + 자식 bannerArrowButton 하나 — 높이 합",
    from: ["appHome", "bannerControls"],
    childFrom: ["appHome", "bannerArrowButton"],
    childTag: "button",
    hostWidth: 960,
    read: ["height"],
  },
  {
    id: "carousel-arrow",
    source: "appHomeSceneStyles.ts bannerArrowButton (= .louis-banner-carousel__arrow)",
    from: ["appHome", "bannerArrowButton"],
    tag: "button",
    read: ["width", "height", "borderTopLeftRadius"],
  },
  {
    id: "carousel-dots",
    source: "appHomeSceneStyles.ts bannerDots (= .louis-banner-carousel__dots)",
    from: ["appHome", "bannerDots"],
    read: ["columnGap"],
  },
  {
    id: "carousel-dot-active",
    // **활성은 이제 클래스가 아니라 속성이다.** 옛 `DOT_ACTIVE` 상수가 사라지고 LOUIS 의
    // `.louis-banner-carousel__dot[aria-current="true"]` 가 20px 를 소유한다. 제품
    // `AppHomeScene.tsx:992` 가 그 훅을 마크업에 건다(주석까지 달려 있다).
    source: "appHomeSceneStyles.ts bannerDot + aria-current=\"true\"",
    from: ["appHome", "bannerDot"],
    attrs: { "aria-current": "true" },
    tag: "button",
    read: ["width", "height", "borderTopLeftRadius"],
  },
  {
    id: "carousel-dot-rest",
    source: "appHomeSceneStyles.ts bannerDot (속성 없음 = 비활성)",
    from: ["appHome", "bannerDot"],
    tag: "button",
    read: ["width", "height"],
  },

  // ── Figma 선행 여덟 — 랜딩 여섯 + ui 둘 ──────────────────────────────────
  // 계약(`verify-figma-parity.mjs`)이 이 여덟에 `geometry` 를 못 붙이고 있었다. 사유는 전부
  // 같았다 — 「`figma/components.measured.json` 에 항목이 없어 대조할 실측 정본이 없다」.
  // 이 여덟은 **제품이 정본**이라 LOUIS React 컴포넌트가 없고, 그래서
  // `component-geometry.browser.test.tsx` 가 잴 대상이 없다. 여기서 제품을 직접 잰다.
  //
  // **폭은 대부분 재지 않는다.** 카드 폭·행 폭은 바깥 격자가 정하고 라벨 폭은 폰트가 정한다 —
  // `components.measured.json` 의 `$whyNotTextWidth` 가 이미 정한 규칙이다. 격자가 정하는 폭은
  // 격자를 조상으로 세울 수 있을 때만 잰다(`news-card` 가 그 경우다).
  {
    id: "media-card",
    source: "MediaCard.tsx CARD + BOX.carousel",
    from: ["landingMediaCard", "CARD", "carousel"],
    read: ["width", "height", "borderTopLeftRadius", "paddingTop", "paddingLeft"],
  },
  {
    id: "media-card-badge",
    source: "MediaCard.tsx BADGE — 유리 배지 필",
    from: ["landingMediaCard", "BADGE"],
    tag: "span",
    text: "New",
    read: ["height", "paddingTop", "paddingLeft", "borderTopLeftRadius", "fontSize", "lineHeight"],
  },
  {
    id: "media-card-info",
    source: "MediaCard.tsx INFO — 흐린 정보 바",
    from: ["landingMediaCard", "INFO"],
    hostWidth: 316,
    read: ["paddingTop", "paddingBottom", "paddingLeft", "paddingRight"],
  },
  {
    id: "media-card-name-row",
    source: "MediaCard.tsx NAME_ROW",
    from: ["landingMediaCard", "NAME_ROW"],
    text: "Kling",
    read: ["columnGap", "height"],
  },
  {
    id: "media-card-name",
    source: "MediaCard.tsx NAME — type-body-20-medium",
    from: ["landingMediaCard", "NAME"],
    tag: "span",
    text: "Kling",
    read: ["fontSize", "lineHeight"],
  },
  {
    id: "media-card-sub",
    source: "MediaCard.tsx SUB — 정보 바의 두 줄 사이 간격은 이 요소의 margin-top 이다",
    from: ["landingMediaCard", "SUB"],
    tag: "p",
    text: "설명",
    read: ["marginTop", "fontSize", "lineHeight"],
  },
  {
    id: "carousel-arrow-landing",
    source: "CarouselArrows.tsx BUTTON — 랜딩 캐러셀 화살표 한 벌(쌍의 두 버튼이 같은 상수다)",
    from: ["landingCarouselArrows", "BUTTON"],
    tag: "button",
    read: ["width", "height", "borderTopLeftRadius", "paddingTop", "paddingLeft"],
  },
  {
    id: "step-tile",
    source: "StepTiles.tsx CARD — 타일 + 캡션을 세로로 쌓는 li",
    from: ["landingStepTiles", "CARD"],
    read: ["rowGap", "paddingTop", "paddingLeft"],
  },
  {
    id: "step-tile-face",
    source: "StepTiles.tsx TILE — 내용 없는 정사각 면",
    from: ["landingStepTiles", "TILE"],
    read: ["borderTopLeftRadius"],
  },
  {
    id: "step-tile-caption",
    source: "StepTiles.tsx CAPTION — type-body-20-medium",
    from: ["landingStepTiles", "CAPTION"],
    tag: "p",
    text: "업로드",
    read: ["fontSize", "lineHeight"],
  },
  {
    id: "faq-row",
    source: "FAQ.tsx ITEM_CLASS — 채워진 행 알약",
    from: ["landingFaq", "ITEM_CLASS"],
    hostWidth: 1400,
    read: ["borderTopLeftRadius", "paddingTop", "paddingLeft"],
  },
  {
    id: "faq-row-question",
    source: "FAQ.tsx QUESTION_CLASS + QUESTION_TEXT_CLASS 한 줄 — 닫힌 행의 높이는 이 버튼이 정한다",
    from: ["landingFaq", "QUESTION_CLASS"],
    tag: "button",
    childFrom: ["landingFaq", "QUESTION_TEXT_CLASS"],
    childTag: "span",
    // 글자가 있어야 줄 높이 30 이 서고 닫힌 행 높이 66(18+30+18)이 나온다.
    childText: "질문",
    hostWidth: 1400,
    read: ["paddingTop", "paddingLeft", "columnGap", "height"],
  },
  {
    id: "faq-row-icon",
    source: "FAQ.tsx ICON_CLASS — `+` 는 아이콘 인스턴스가 아니라 텍스트 노드다",
    from: ["landingFaq", "ICON_CLASS"],
    tag: "span",
    text: "+",
    read: ["fontSize", "lineHeight"],
  },
  {
    id: "gnb-menu-item-label",
    // 라벨 타이포는 `menuLinkClass()` 가 상수가 아니라 리터럴로 앞에 붙이는 전역 클래스다
    // (`type-body-14-medium`). 상수가 없으니 `from` 으로 꺼낼 자리가 없고, 남은 것은 **후크
    // 이름**뿐이다 — `.app-tooltip-chrome` 탐침과 같은 형태이며 수치는 globals.css 에 있다.
    source: "landing/navigation/Gnb.tsx menuLinkClass() 가 앞에 붙이는 type-body-14-medium",
    html: `<span class="type-body-14-medium">제품</span>`,
    read: ["fontSize", "lineHeight"],
  },
  {
    id: "segmented-code-char",
    source: "SegmentedCodeInput.tsx 가 칸과 구분자에 함께 붙이는 type-body-16-medium",
    html: `<span class="type-body-16-medium">A</span>`,
    read: ["fontSize", "lineHeight"],
  },
  {
    id: "faq-row-question-text",
    source: "FAQ.tsx QUESTION_TEXT_CLASS",
    from: ["landingFaq", "QUESTION_TEXT_CLASS"],
    tag: "span",
    text: "질문",
    read: ["fontSize", "lineHeight"],
  },
  {
    id: "news-card",
    // 폭 347 · 높이 160 은 카드가 아니라 **트랙**이 정한다(`grid-auto-columns` ·
    // `grid-template-rows`). 그래서 트랙을 조상으로 세우고 카드를 격자 칸에 앉힌다 —
    // 값을 옮겨 적지 않고 격자가 계산하게 둔다.
    source: "NewsCarousel.tsx CARD (조상 TRACK)",
    from: ["landingNews", "CARD"],
    wrapperFrom: [["landingNews", "TRACK"]],
    hostWidth: 1400,
    read: ["width", "height", "paddingTop", "paddingLeft", "borderTopLeftRadius"],
  },
  {
    id: "news-card-featured",
    // 피처드는 `col-span-2 row-span-2` 다. 698 = 347×2 + gap 4, 324 = 160×2 + 4 —
    // 이 산술도 격자가 하게 둔다.
    source: "NewsCarousel.tsx FEATURED_CARD (조상 TRACK)",
    from: ["landingNews", "FEATURED_CARD"],
    wrapperFrom: [["landingNews", "TRACK"]],
    hostWidth: 1400,
    read: ["width", "height", "paddingTop", "paddingLeft", "borderTopLeftRadius"],
  },
  {
    id: "news-card-body",
    source: "NewsCarousel.tsx BODY — 날짜 ↔ 제목 간격",
    from: ["landingNews", "BODY"],
    read: ["rowGap"],
  },
  {
    id: "news-card-headline",
    source: "NewsCarousel.tsx HEADLINE",
    from: ["landingNews", "HEADLINE"],
    tag: "p",
    text: "소식",
    read: ["fontSize", "lineHeight"],
  },
  {
    id: "news-card-date",
    source: "NewsCarousel.tsx DATE",
    from: ["landingNews", "DATE"],
    tag: "span",
    text: "Feb 18, 2026",
    read: ["fontSize"],
  },
  {
    id: "gnb-menu-item",
    source: "landing/navigation/Gnb.tsx MENU_LINK — menuLinkClass() 가 조립하는 알약",
    from: ["landingGnb", "MENU_LINK"],
    tag: "a",
    text: "제품",
    read: ["height", "paddingTop", "paddingLeft", "borderTopLeftRadius", "columnGap"],
  },
  {
    id: "inline-loading-slot-md",
    source: "InlineLoadingLabel.tsx SLOT_BASE + SLOT_MD + SLOT_ACTIVE_MD — 열림",
    from: ["inlineLoadingLabel", "SLOT_BASE", "SLOT_MD", "SLOT_ACTIVE_MD"],
    tag: "span",
    read: ["width", "height", "marginLeft"],
  },
  {
    id: "inline-loading-slot-sm",
    source: "InlineLoadingLabel.tsx SLOT_BASE + SLOT_SM + SLOT_ACTIVE_SM — 열림",
    from: ["inlineLoadingLabel", "SLOT_BASE", "SLOT_SM", "SLOT_ACTIVE_SM"],
    tag: "span",
    read: ["width", "height", "marginLeft"],
  },
  {
    id: "inline-loading-slot-idle",
    source: "InlineLoadingLabel.tsx SLOT_BASE + SLOT_MD + SLOT_IDLE — 닫힘(폭 0)",
    from: ["inlineLoadingLabel", "SLOT_BASE", "SLOT_MD", "SLOT_IDLE"],
    tag: "span",
    read: ["width", "marginLeft"],
  },
  {
    id: "inline-loading-root",
    source: "InlineLoadingLabel.tsx ROOT — 여백 없는 배치 요소다",
    from: ["inlineLoadingLabel", "ROOT"],
    tag: "span",
    text: "저장",
    read: ["paddingTop", "paddingLeft", "columnGap", "borderTopLeftRadius"],
  },
  {
    id: "segmented-code-cell",
    source: "SegmentedCodeInput.tsx BOX — 칸 하나. 묶음 폭은 소비처가 정한다",
    from: ["segmentedCodeInput", "BOX"],
    tag: "input",
    read: ["maxWidth", "height", "borderTopLeftRadius", "borderTopWidth"],
  },
];

// ── DS와 무엇을 어떻게 맞출지 ──────────────────────────────────────────────
// `same`은 두 값이 같아야 한다는 뜻이고, `deviates`는 **달라야 한다**는 뜻이다.
// 편차를 그냥 빼 두면 어느 날 제품이 DS 쪽으로 움직여도 아무도 모르고 사유만 낡는다.
// 여기서는 편차가 사라지는 것도 실패다 — 사유를 지우라는 신호다.
const EXPECT = [
  // **계단이 개명됐다(DS-D-0027).** 구 md(40) → lg · 구 sm(32) → md 다. 기록은 `ddc333a` 에서
  // 따라갔는데 여기 EXPECT 는 그대로 남아 없어진 `sizes.sm` 을 가리키고 있었다.
  ["button-lg", "height", ["button", "sizes", "lg", "height"], "same"],
  ["button-lg", "paddingTop", ["button", "sizes", "lg", "paddingBlock"], "same"],
  ["button-lg", "paddingLeft", ["button", "sizes", "lg", "paddingInline"], "same"],
  ["button-lg", "borderTopLeftRadius", ["button", "sizes", "lg", "radius"], "same"],
  ["button-lg", "columnGap", ["button", "sizes", "lg", "gap"], "same"],
  ["button-lg", "minWidth", ["button", "sizes", "lg", "minWidth"], "same"],
  ["button-lg-icon", "paddingLeft", ["button", "sizes", "lg", "paddingInlineWithIcon"], "same"],
  ["button-md", "height", ["button", "sizes", "md", "height"], "same"],
  ["button-md", "paddingLeft", ["button", "sizes", "md", "paddingInline"], "same"],
  ["button-md", "borderTopLeftRadius", ["button", "sizes", "md", "radius"], "same"],
  ["button-md", "columnGap", ["button", "sizes", "md", "gap"], "same"],
  ["button-md", "minWidth", ["button", "sizes", "md", "minWidth"], "same"],
  ["button-md-icon", "paddingLeft", ["button", "sizes", "md", "paddingInlineWithIcon"], "same"],
  ["button-secondary", "borderTopWidth", ["button", "sizes", "md", "borderWidth"], "deviates",
    "제품 0, DS 0.5. **편차의 뜻이 바뀌었다.** 그전에는 제품이 1px 테두리를 그려 두께가 갈렸는데, 지금 제품은 LOUIS 레시피를 그대로 소비하고 그 레시피는 border 0 에 inset box-shadow 로 헤어라인을 그린다(button.css:115-121). 0.5 는 그 그림자의 spread 이지 레이아웃 두께가 아니라서 계산값 border-width 로는 잡히지 않는다. 이 행은 **레시피가 진짜 테두리로 돌아가면 실패하라고** 남긴다."],

  ["icon-button", "width", ["icon-button", "sizes", "md", "width"], "same"],
  ["icon-button", "height", ["icon-button", "sizes", "md", "height"], "same"],
  ["icon-button", "borderTopLeftRadius", ["icon-button", "sizes", "md", "radius"], "same"],
  ["icon-button-card", "width", ["project-card", "sizes", "base", "moreSize"], "same"],

  ["project-card", "borderTopLeftRadius", ["project-card", "sizes", "base", "radius"], "same"],
  // 진짜 상수를 재기 시작하자 드러난 축들이다. `::before` 는 헤어라인·흐림을 칠하는 층이고
  // 카드의 반경을 그대로 따라야 모서리가 어긋나지 않는다.
  ["project-card", "::before:borderTopLeftRadius", ["project-card", "sizes", "base", "radius"], "same"],
  ["project-card-overlay", "::before:borderBottomLeftRadius", ["project-card", "sizes", "base", "radius"], "same"],
  ["project-card-overlay", "::before:borderTopLeftRadius", ["project-card", "sizes", "base", "overlayTopRadius"], "same"],
  // 미디어 면과 카드 틀은 **둘 다 12로 같다.** 한때 "틀 16 · 면 12" 로 적었는데 그 근거였던
  // `project-card` 탐침이 자기 html 에 리터럴 16 을 적어 두고 되읽던 거짓 측정이었다.
  ["project-card-preview", "borderTopLeftRadius", ["project-card", "sizes", "base", "radius"], "same"],
  ["project-card-overlay", "padding", ["project-card", "sizes", "base", "overlayPadding"], "same"],

  ["tooltip", "borderTopLeftRadius", ["tooltip", "sizes", "base", "radius"], "same"],
  ["tooltip", "paddingTop", ["tooltip", "sizes", "base", "paddingBlock"], "same"],
  ["tooltip", "paddingLeft", ["tooltip", "sizes", "base", "paddingInline"], "same"],
  ["tooltip", "fontSize", ["tooltip", "sizes", "base", "fontSize"], "same"],
  ["tooltip", "lineHeight", ["tooltip", "sizes", "base", "lineHeight"], "same"],
  ["tooltip", "height", ["tooltip", "sizes", "base", "height"], "same"],
  ["tooltip-product", "::after:borderTopWidth", ["tooltip", "sizes", "base", "borderWidth"], "deviates",
    "제품 1px, DS 0.5px. 위 button과 같은 hairline 결정이다. **재는 자리가 옮겨졌다** — LOUIS `.louis-tooltip` 은 border 0 에 inset 헤어라인이라 이 축을 갖지 않고, 진짜 1px 테두리는 제품이 아직 소유한 `[data-tooltip]::after`(globals.css:1411)가 그린다."],
  // 두 툴팁이 같은 면을 그리는지도 기계가 본다. 갈라지면 여기가 실패한다.
  ["tooltip-product", "::after:borderTopLeftRadius", ["tooltip", "sizes", "base", "radius"], "same"],
  ["tooltip-product", "::after:paddingTop", ["tooltip", "sizes", "base", "paddingBlock"], "same"],
  ["tooltip-product", "::after:paddingLeft", ["tooltip", "sizes", "base", "paddingInline"], "same"],
  ["tooltip-product", "::after:fontSize", ["tooltip", "sizes", "base", "fontSize"], "same"],
  ["tooltip-product", "::after:lineHeight", ["tooltip", "sizes", "base", "lineHeight"], "same"],

  ["toast", "paddingTop", ["toast", "sizes", "base", "paddingBlock"], "same"],
  ["toast", "paddingLeft", ["toast", "sizes", "base", "paddingInline"], "same"],
  ["toast", "borderTopLeftRadius", ["toast", "sizes", "base", "radius"], "same"],
  ["toast", "borderTopWidth", ["toast", "sizes", "base", "borderWidth"], "same"],
  ["toast", "backdropFilter", ["toast", "sizes", "base", "backdropBlur"], "deviates",
    "제품 10, DS 16. **재기준선에서 뒤집힌 축이다.** 그전에는 소비처가 인라인으로 blur(16)을 걸어 클래스의 10을 이겼고 DS는 그 16을 채택했다. 배포본 df414c24 에는 그 인라인이 없다 — 제품 소스가 「레시피는 16 인데 이 화면이 실제로 그리는 값은 10 이고, 외형을 바꾸지 않으려고 그대로 둔다」고 적어 두었다. 수렴 방향은 LOUIS 를 10 으로 내리는 쪽이며 그것은 CSS·기록·Figma 를 같이 움직이는 별도 변경이다."],
  // 제품이 LOUIS `.louis-toast` 를 채택하면서 타이포까지 레시피를 따르게 돼 높이가 45 로 같아졌다.
  ["toast", "height", ["toast", "sizes", "base", "height"], "same"],

  ["menu-panel", "borderTopLeftRadius", ["menu-popover", "sizes", "panel", "radius"], "same"],
  // 새 탐침이 드러낸 축이다. 그전 탐침은 손으로 적은 세 선언만 갖고 있어 간격·반경이 보이지 않았다.
  ["menu-panel", "rowGap", ["menu-popover", "sizes", "panel", "gap"], "same"],
  ["avatar", "borderTopLeftRadius", ["avatar", "sizes", "md", "radius"], "same"],
  ["checkbox", "borderTopLeftRadius", ["checkbox", "sizes", "base", "radius"], "same"],
  ["menu-panel", "paddingTop", ["menu-popover", "sizes", "panel", "paddingBlock"], "same"],
  ["menu-panel", "paddingLeft", ["menu-popover", "sizes", "panel", "paddingInline"], "same"],
  ["menu-item", "paddingTop", ["menu-popover", "sizes", "panel", "itemPaddingBlock"], "same"],
  ["menu-item", "paddingLeft", ["menu-popover", "sizes", "panel", "itemPaddingInline"], "same"],
  ["menu-item", "columnGap", ["menu-popover", "sizes", "panel", "itemGap"], "same"],
  ["menu-item", "borderTopLeftRadius", ["menu-popover", "sizes", "panel", "itemRadius"], "same"],
  ["menu-item", "height", ["menu-popover", "sizes", "panel", "itemHeight"], "same"],

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

  // **계단 개명 후 이 자리는 lg 다.** 제품의 최다 계열인 인증 입력이 좌우 16 을 두는데 그것이
  // 곧 `space-control-lg` 이고, 개명 전에는 그 단이 md 라 불렸다. md(12)와 대조하고 있어서
  // 실패하던 행이다.
  ["input-box", "paddingLeft", ["input", "sizes", "lg", "paddingInline"], "same"],
  ["input-box", "borderTopLeftRadius", ["input", "sizes", "lg", "radius"], "same"],
  ["input-box", "borderTopWidth", ["input", "sizes", "lg", "borderWidth"], "deviates",
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
  // 편차가 사라졌다. 제품 `LoadingSpinner.tsx` 가 클래스 상수를 버리고 LOUIS `.louis-spinner` 를
  // 그대로 소비하면서 sm 링이 `border-width-ring / 2` = 1px 로 서 있다 — Tailwind 정렬이 이기던
  // `after:border-2` 자체가 없어졌다.
  ["spinner-sm", "::after:borderTopWidth", ["spinner", "sizes", "sm", "ringWidth"], "same"],

  ["checkbox", "width", ["checkbox", "sizes", "base", "boxSize"], "same"],
  ["checkbox", "height", ["checkbox", "sizes", "base", "boxSize"], "same"],

  ["selectable-row", "paddingTop", ["selectable-list-row", "sizes", "base", "padding"], "deviates",
    "제품 6, DS 8. 제품 3벌이 전부 파일 로컬 상수이고 6·8·10으로 갈린다. DS는 space-control-sm 8로 사이드바 항목과 계단을 맞춘다."],
  ["selectable-row", "columnGap", ["selectable-list-row", "sizes", "base", "gap"], "deviates",
    "제품 10, DS 8. 위와 같은 사유다 — 10은 DS 간격 계단에 없는 값이다."],
  ["selectable-row", "borderTopLeftRadius", ["selectable-list-row", "sizes", "base", "radius"], "deviates",
    "제품 14, DS 10. radius-overlay-item 10을 쓴다 — 메뉴 항목·사이드바 항목과 같은 반경이어야 목록 행끼리 어긋나지 않는다."],

  // 여기도 lg 다 — 아래 사유가 이미 "트랙을 40에 맞추고"라고 적고 있는데, 40 인 단의 이름이
  // 개명으로 md 에서 lg 로 바뀌었다. 사유는 그대로 참이고 가리키는 곳만 틀려 있었다.
  ["segmented-track", "paddingTop", ["segmented-control", "sizes", "lg", "trackPadding"], "same"],
  ["segmented-track", "borderTopLeftRadius", ["segmented-control", "sizes", "lg", "trackRadius"], "same"],
  ["segmented-segment", "paddingLeft", ["segmented-control", "sizes", "lg", "segmentPaddingInline"], "same"],
  ["segmented-segment", "borderTopLeftRadius", ["segmented-control", "sizes", "lg", "segmentRadius"], "same"],
  ["segmented-thumb", "borderTopLeftRadius", ["segmented-control", "sizes", "lg", "segmentRadius"], "same"],
  ["segmented-thumb", "top", ["segmented-control", "sizes", "lg", "trackPadding"], "same"],
  ["segmented-segment", "height", ["segmented-control", "sizes", "lg", "segmentHeight"], "deviates",
    "제품 28, DS 32. 제품 트랙은 28+4+4 = 36으로 control 계단(40/32) 어디에도 없다. DS는 트랙을 40에 맞추고 padding 4를 빼 32를 얻는다 — 세그먼티드가 다른 control과 한 줄에 설 수 있어야 한다."],
  ["segmented-track", "columnGap", ["segmented-control", "sizes", "lg", "segmentGap"], "deviates",
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
  // **두 축이 한꺼번에 밀렸다.** 하나는 계단 개명(구 md → lg), 다른 하나는 제품의 두 맥락이다 —
  // 같은 상수 `overlayRadixRootFull` 이 인스펙터 패널 **안에서 28**, **밖에서 20** 으로 선다.
  // DS 는 그 둘을 lg/track(28) · md/track(20) 으로 나눠 적어 두었는데 EXPECT 는 패널 안쪽을
  // md 로, 바깥쪽을 없어진 sm 으로 가리키고 있었다.
  ["slider-thumb-rail", "height", ["slider", "sizes", "lg/thumb", "railHeight"], "same"],
  ["slider-thumb-handle", "width", ["slider", "sizes", "lg/thumb", "thumbInline"], "same"],
  ["slider-thumb-handle", "height", ["slider", "sizes", "lg/thumb", "thumbBlock"], "same"],
  ["slider-thumb-handle", "borderTopWidth", ["slider", "sizes", "lg/thumb", "thumbBorderWidth"], "same"],
  ["slider-track-root-panel", "height", ["slider", "sizes", "lg/track", "railHeight"], "same"],
  ["slider-track-root", "height", ["slider", "sizes", "md/track", "railHeight"], "same"],
  ["slider-track-marker", "::after:width", ["slider", "sizes", "md/track", "thumbInline"], "same"],
  ["slider-track-marker", "::after:height", ["slider", "sizes", "md/track", "thumbBlock"], "same"],
  ["slider-track-marker-panel", "::after:width", ["slider", "sizes", "lg/track", "thumbInline"], "same"],
  ["slider-track-marker-panel", "::after:height", ["slider", "sizes", "lg/track", "thumbBlock"], "same"],
  ["slider-thumb-root", "height", ["slider", "sizes", "lg/thumb", "height"], "deviates",
    "제품 24, DS 40. thumb형 세 벌이 16·24·28로 갈려 컨트롤 높이의 정본이 없다. DS는 control 계단(40/32)을 따라 슬라이더가 다른 컨트롤과 한 줄에 설 수 있게 한다."],
  ["slider-track-root-panel", "height", ["slider", "sizes", "lg/track", "height"], "deviates",
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

  // **이미 정해진 차이다.** DS-D-0024 가 알파 5계열을 `static-black-alpha` / `static-white-alpha`
  // 둘로 접으면서 알파 램프의 밑색을 **순수 #000/#fff** 로 못박았다. 그래서 DS ghost-hover 는
  // 255 다. 제품은 아직 자기 `palette-gray↔gray` 반전 램프(250)를 타는데, 같은 결정문 3항이
  // 그것을 **후속 Phase** 로 미뤄 두었다. 판정 대기가 아니라 이관 대기다.
  ["nav-item-hover", "backgroundColor", ["app-shell-parts", "states", "navItem", "Hover", "background"], "deviates",
    "제품 rgb(250 250 250 / 8%), DS rgb(255 255 255 / 8%). 제품은 자기 잉크 램프(palette-gray-000 = 250)를, DS 는 DS-D-0024 가 정한 static-white 알파 램프(255)를 탄다. 제품이 LOUIS 세만틱을 직접 소비하는 후속 Phase 에서 닫힌다 — 그 결정문 3항이 그 이관을 예고한다."],
  ["nav-item-hover-light", "backgroundColor", ["app-shell-parts", "states", "navItem", "Hover", "background"], "deviates",
    "라이트만 갈린다. 제품은 재매핑된 palette-gray-300을 50%로 덮고(rgb 228 229 233 / 0.5) DS는 ink 8%를 쓴다 — 면 계열에 매는 것과 잉크에 매는 것의 차이다. `action-ghost-hover`는 SelectableListRow와 공유하는 토큰이라 사이드바 하나 때문에 옮기지 않는다. 다크는 rgb(250 250 250 / 0.1)로 정확히 같다."],

  ["progress-bar-track", "height", ["progress-bar", "sizes", "base", "height"], "same"],
  ["progress-bar-track", "maxWidth", ["progress-bar", "sizes", "base", "maxInlineSize"], "same"],
  ["progress-ring", "width", ["progress-ring", "sizes", "base", "size"], "same"],
  ["progress-ring", "--profile-ring-width", ["progress-ring", "sizes", "base", "width"], "same"],
  ["progress-ring", "--profile-ring-gap", ["progress-ring", "sizes", "base", "gap"], "same"],
  // 편차가 사라졌다. `5261daea`(P#8)가 제품 진행바를 LOUIS `.louis-progress-bar` 로 옮기면서
  // 리터럴 3 이 `--louis-radius-pill` 로 바뀌었다 — DS 가 적어 두었던 「알약으로 적는다」를
  // 제품이 그대로 따라온 자리다.
  ["progress-bar-track", "borderTopLeftRadius", ["progress-bar", "sizes", "base", "radius"], "same"],

  ["nav-row", "columnGap", ["app-shell-parts", "sizes", "navRow", "gap"], "same"],

  // ── 열거가 드러낸 축 ──────────────────────────────────────────────────────
  // 아래는 "제품이 선언했는데 대조하지 않던" 축이다. 열거 게이트를 붙이기 전까지 이 자리들은
  // 게이트가 초록인 채로 비어 있었다.
  ["button-md", "paddingTop", ["button", "sizes", "md", "paddingBlock"], "same"],
  ["button-secondary", "borderTopLeftRadius", ["button", "sizes", "md", "radius"], "same"],
  ["button-secondary", "height", ["button", "sizes", "md", "height"], "same"],
  ["icon-button", "maxWidth", ["icon-button", "sizes", "md", "width"], "same"],
  ["icon-button-card", "height", ["project-card", "sizes", "base", "moreSize"], "same"],
  ["icon-button-card", "borderTopLeftRadius", ["project-card", "sizes", "base", "moreRadius"], "same"],
  ["project-card-overlay", "paddingTop", ["project-card", "sizes", "base", "overlayPadding"], "same"],
  ["project-card-overlay", "borderTopLeftRadius", ["project-card", "sizes", "base", "overlayTopRadius"], "same"],
  // 탐침이 자기 `[gap:12px]` 을 되읽는 동안 이 행은 12=12 로 초록이었다. 진짜 상수를 재니
  // 제품은 `gap-2`(4px)였고, 그것은 이관 사고가 아니라 `97d33c05`(2026-08-26)의 소유자
  // 결정이다 — 네 홈의 카드 그리드를 4 로 통일했다. 기록을 그 결정에 맞춘다.
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
  ["progress-bar-fill", "borderTopLeftRadius", ["progress-bar", "sizes", "base", "radius"], "same"],
  ["segmented-segment", "borderTopWidth", ["segmented-control", "sizes", "lg", "borderWidth"], "deviates",
    "제품 0, DS 0.5. **레시피도 진짜 테두리를 그리지 않는다.** segmented-control.css:41,49 는 border 0 에 `--louis-hairline-inset`(inset box-shadow) 으로 트랙 경계를 그린다 — border 를 쓰면 border-box 안쪽이 줄어 세그먼트 높이가 32 에서 밀리기 때문이다. 0.5 는 그 그림자의 spread 이고 계산값 border-width 로는 잡히지 않는다. 이 행은 레시피가 진짜 테두리로 돌아가면 실패하라고 남긴다."],
  ["slider-thumb-rail", "borderTopLeftRadius", ["slider", "sizes", "lg/thumb", "railRadius"], "same"],
  ["slider-thumb-handle", "borderTopLeftRadius", ["slider", "sizes", "lg/thumb", "thumbRadius"], "same"],
  ["slider-track-marker", "::after:borderTopLeftRadius", ["slider", "sizes", "md/track", "thumbRadius"], "same"],
  ["slider-track-marker-panel", "::after:borderTopLeftRadius", ["slider", "sizes", "lg/track", "thumbRadius"], "same"],
  ["segmented-thumb", "height", ["segmented-control", "sizes", "lg", "segmentHeight"], "deviates",
    "제품 28, DS 32. 세그먼트와 같은 사유다 — 제품 트랙 36은 control 계단에 없다."],

  // ── 배너 캐러셀 ───────────────────────────────────────────────────────────
  // **`full` 열의 근거가 줄었다.** 제품이 `6602fd24` 에서 캐러셀 파일을 지우면서
  // `CAROUSEL_FULL_BLEED` 도 함께 사라졌고, 지금 제품에는 `[data-bleed="full"]` 을 거는 자리가
  // 한 곳도 없다(`git grep data-bleed` 0건). 남은 셸은 `updateBanner` 하나뿐이다.
  //
  // 그래서 두 갈래로 갈린다.
  //   - bleed 로 갈리지 않는 축(높이·콘텐츠·컨트롤·화살표·점)은 **그 하나의 셸이 곧 두 열의
  //     요소**이므로 boxed 를 재던 탐침이 full 도 증명한다 — 옛 주석의 논리 그대로다.
  //   - bleed 로 **갈리는** 축은 `radius` 하나뿐인데(boxed 12 / full 0), 그 0 을 낼 제품
  //     소비처가 없어졌다. 셸에 우리 손으로 `data-bleed="full"` 을 걸어 재면 그것은 제품
  //     실측이 아니라 LOUIS 를 LOUIS 로 재는 것이다. **그래서 그 축만 대조를 잃었다.**
  //     되살리는 조건은 제품에 full-bleed 소비처가 다시 서는 것이다.
  ["carousel", "height", ["banner-carousel", "sizes", "boxed", "height"], "same"],
  ["carousel", "height", ["banner-carousel", "sizes", "full", "height"], "same"],
  ["carousel", "borderTopLeftRadius", ["banner-carousel", "sizes", "boxed", "radius"], "same"],
  ["carousel-content", "width", ["banner-carousel", "sizes", "boxed", "contentInline"], "same"],
  ["carousel-content", "width", ["banner-carousel", "sizes", "full", "contentInline"], "same"],
  // **이사 중에 갈라진 축이다.** 옛 `CONTENT` 는 `.louis-banner-carousel__content` 를 소비해
  // 위아래 24(`--louis-space-layout-section`) · 좌우 20(`--louis-space-media-inset`) 이었는데,
  // `AppHomeScene` 으로 옮겨 간 `bannerContent` 는 레시피를 떼고 `[padding:20px]` 한 줄로
  // 사방을 20 으로 만들었다. 좌우는 그대로이고 **위아래만 24 → 20 으로 내려갔다.**
  ["carousel-content", "paddingTop", ["banner-carousel", "sizes", "boxed", "contentBlockPadding"], "deviates",
    "제품 20, DS 24. 캐러셀이 AppHomeScene 으로 옮겨 가면서 콘텐츠가 LOUIS `__content` 레시피 소비를 그만두고 사방 20 을 직접 선언한다. 좌우 20 은 그대로다. 어느 쪽으로 수렴할지는 소유자 판정이다 — LOUIS 를 20 으로 내리든, 제품이 레시피를 다시 소비하든 CSS·기록·Figma 를 같이 움직여야 한다."],
  ["carousel-content", "paddingTop", ["banner-carousel", "sizes", "full", "contentBlockPadding"], "deviates",
    "boxed 와 같은 사유다 — 셸이 하나뿐이라 두 열이 같은 요소를 가리킨다."],
  ["carousel-content", "paddingLeft", ["banner-carousel", "sizes", "boxed", "contentInlinePadding"], "same"],
  ["carousel-content", "paddingLeft", ["banner-carousel", "sizes", "full", "contentInlinePadding"], "same"],
  ["carousel-controls", "paddingTop", ["banner-carousel", "sizes", "boxed", "controlsPadding"], "same"],
  ["carousel-controls", "paddingTop", ["banner-carousel", "sizes", "full", "controlsPadding"], "same"],
  ["carousel-controls", "columnGap", ["banner-carousel", "sizes", "boxed", "controlsGap"], "same"],
  ["carousel-controls", "columnGap", ["banner-carousel", "sizes", "full", "controlsGap"], "same"],
  ["carousel-controls", "borderTopLeftRadius", ["banner-carousel", "sizes", "full", "controlsRadius"], "same"],
  ["carousel-controls-filled", "height", ["banner-carousel", "sizes", "boxed", "controlsHeight"], "same"],
  ["carousel-controls-filled", "height", ["banner-carousel", "sizes", "full", "controlsHeight"], "same"],
  ["carousel-arrow", "width", ["banner-carousel", "sizes", "boxed", "arrowSize"], "same"],
  ["carousel-arrow", "width", ["banner-carousel", "sizes", "full", "arrowSize"], "same"],
  ["carousel-arrow", "height", ["banner-carousel", "sizes", "boxed", "arrowSize"], "same"],
  ["carousel-arrow", "height", ["banner-carousel", "sizes", "full", "arrowSize"], "same"],
  ["carousel-arrow", "borderTopLeftRadius", ["banner-carousel", "sizes", "full", "arrowRadius"], "same"],
  ["carousel-dots", "columnGap", ["banner-carousel", "sizes", "boxed", "dotsGap"], "same"],
  ["carousel-dots", "columnGap", ["banner-carousel", "sizes", "full", "dotsGap"], "same"],
  ["carousel-dot-active", "width", ["banner-carousel", "sizes", "boxed", "dotActiveWidth"], "same"],
  ["carousel-dot-active", "width", ["banner-carousel", "sizes", "full", "dotActiveWidth"], "same"],
  ["carousel-dot-active", "height", ["banner-carousel", "sizes", "full", "dotHeight"], "same"],
  ["carousel-dot-active", "borderTopLeftRadius", ["banner-carousel", "sizes", "full", "dotRadius"], "same"],
  ["carousel-dot-rest", "width", ["banner-carousel", "sizes", "boxed", "dotRestWidth"], "same"],
  ["carousel-dot-rest", "width", ["banner-carousel", "sizes", "full", "dotRestWidth"], "same"],
  ["carousel-dot-rest", "height", ["banner-carousel", "sizes", "boxed", "dotHeight"], "same"],
  ["carousel-dot-rest", "height", ["banner-carousel", "sizes", "full", "dotHeight"], "same"],

  // ── Figma 선행 여덟 ───────────────────────────────────────────────────────
  // 이 여덟의 기록은 **제품이 정본**이라 LOUIS 코드 테스트가 잴 대상이 없다. 그래서 대조 방향이
  // 다른 컴포넌트와 반대다 — 「DS 가 옳은가」가 아니라 **「기록이 제품 그대로인가」**를 본다.
  ["media-card", "width", ["media-card", "sizes", "base", "width"], "same"],
  ["media-card", "height", ["media-card", "sizes", "base", "height"], "same"],
  ["media-card", "borderTopLeftRadius", ["media-card", "sizes", "base", "radius"], "same"],
  ["media-card", "paddingTop", ["media-card", "sizes", "base", "paddingBlock"], "same"],
  ["media-card", "paddingLeft", ["media-card", "sizes", "base", "paddingInline"], "same"],
  ["media-card-badge", "height", ["media-card", "sizes", "base", "badgeHeight"], "same"],
  ["media-card-badge", "paddingTop", ["media-card", "sizes", "base", "badgePaddingBlock"], "same"],
  ["media-card-badge", "paddingLeft", ["media-card", "sizes", "base", "badgePaddingInline"], "same"],
  ["media-card-badge", "borderTopLeftRadius", ["media-card", "sizes", "base", "badgeRadius"], "same"],
  ["media-card-badge", "fontSize", ["media-card", "sizes", "base", "badgeFontSize"], "same"],
  ["media-card-badge", "lineHeight", ["media-card", "sizes", "base", "badgeLineHeight"], "same"],
  ["media-card-info", "paddingTop", ["media-card", "sizes", "base", "infoPaddingBlockStart"], "same"],
  ["media-card-info", "paddingBottom", ["media-card", "sizes", "base", "infoPaddingBlockEnd"], "same"],
  ["media-card-info", "paddingLeft", ["media-card", "sizes", "base", "infoPaddingInline"], "same"],
  ["media-card-sub", "marginTop", ["media-card", "sizes", "base", "infoGap"], "same"],
  ["media-card-sub", "fontSize", ["media-card", "sizes", "base", "descriptionFontSize"], "same"],
  ["media-card-sub", "lineHeight", ["media-card", "sizes", "base", "descriptionLineHeight"], "same"],
  ["media-card-name-row", "columnGap", ["media-card", "sizes", "base", "nameRowGap"], "same"],
  ["media-card-name", "fontSize", ["media-card", "sizes", "base", "titleFontSize"], "same"],
  ["media-card-name", "lineHeight", ["media-card", "sizes", "base", "titleLineHeight"], "same"],
  // Figma 의 TopBar(316×54, padding 16)는 제품에 없는 상자다. 그 16 은 배지가 카드 모서리에서
  // 떨어진 거리이고, 54 는 16 + 배지 22 + 16 이다 — 상자를 지어내는 대신 그 거리를 잰다.
  ["media-card-badge", "left", ["media-card", "sizes", "base", "badgeInset"], "same"],
  ["media-card-badge", "top", ["media-card", "sizes", "base", "badgeInset"], "same"],

  ["carousel-arrow-landing", "width", ["carousel-arrow", "sizes", "base", "width"], "same"],
  ["carousel-arrow-landing", "height", ["carousel-arrow", "sizes", "base", "height"], "same"],
  ["carousel-arrow-landing", "borderTopLeftRadius", ["carousel-arrow", "sizes", "base", "radius"], "same"],
  ["carousel-arrow-landing", "paddingTop", ["carousel-arrow", "sizes", "base", "paddingBlock"], "same"],
  ["carousel-arrow-landing", "paddingLeft", ["carousel-arrow", "sizes", "base", "paddingInline"], "same"],

  ["step-tile", "rowGap", ["step-tile", "sizes", "base", "gap"], "same"],
  ["step-tile", "borderTopLeftRadius", ["step-tile", "sizes", "base", "radius"], "same"],
  ["step-tile", "paddingTop", ["step-tile", "sizes", "base", "paddingBlock"], "same"],
  ["step-tile", "paddingLeft", ["step-tile", "sizes", "base", "paddingInline"], "same"],
  ["step-tile-face", "borderTopLeftRadius", ["step-tile", "sizes", "base", "tileRadius"], "same"],
  ["step-tile-caption", "fontSize", ["step-tile", "sizes", "base", "labelFontSize"], "same"],
  ["step-tile-caption", "lineHeight", ["step-tile", "sizes", "base", "labelLineHeight"], "same"],

  // FaqRow · NewsCard · GnbMenuItem · InlineLoadingLabel · SegmentedCodeInput 은 되읽기 키가
  // 여럿이라 기록도 키마다 한 벌이다. 같은 값을 손으로 여러 번 적지 않고 한 벌을 펼친다 —
  // 옮겨 적는 자리를 만들지 않는 것이 이 파일의 규범이다.
  ...["false", "true"].flatMap((expanded) => [
    ["faq-row", "borderTopLeftRadius", ["faq-row", "sizes", expanded, "radius"], "same"],
    ["faq-row", "paddingTop", ["faq-row", "sizes", expanded, "paddingBlock"], "same"],
    ["faq-row", "paddingLeft", ["faq-row", "sizes", expanded, "paddingInline"], "same"],
    ["faq-row-question", "height", ["faq-row", "sizes", expanded, "questionHeight"], "same"],
    ["faq-row-question", "paddingTop", ["faq-row", "sizes", expanded, "questionPaddingBlock"], "same"],
    ["faq-row-question", "paddingLeft", ["faq-row", "sizes", expanded, "questionPaddingInline"], "same"],
    ["faq-row-question", "columnGap", ["faq-row", "sizes", expanded, "questionGap"], "same"],
    ["faq-row-question-text", "fontSize", ["faq-row", "sizes", expanded, "questionFontSize"], "same"],
    ["faq-row-question-text", "lineHeight", ["faq-row", "sizes", expanded, "questionLineHeight"], "same"],
    ["faq-row-icon", "fontSize", ["faq-row", "sizes", expanded, "iconFontSize"], "same"],
    ["faq-row-icon", "lineHeight", ["faq-row", "sizes", expanded, "iconHeight"], "same"],
  ]),

  ...[["false", "news-card"], ["true", "news-card-featured"]].flatMap(([featured, probe]) => [
    [probe, "width", ["news-card", "sizes", featured, "width"], "same"],
    [probe, "height", ["news-card", "sizes", featured, "height"], "same"],
    [probe, "paddingTop", ["news-card", "sizes", featured, "paddingBlock"], "same"],
    [probe, "paddingLeft", ["news-card", "sizes", featured, "paddingInline"], "same"],
    [probe, "borderTopLeftRadius", ["news-card", "sizes", featured, "radius"], "same"],
    ["news-card-body", "rowGap", ["news-card", "sizes", featured, "bodyGap"], "same"],
    ["news-card-date", "fontSize", ["news-card", "sizes", featured, "dateFontSize"], "same"],
    ["news-card-headline", "fontSize", ["news-card", "sizes", featured, "headlineFontSize"], "same"],
    ["news-card-headline", "lineHeight", ["news-card", "sizes", featured, "headlineLineHeight"], "same"],
  ]),

  ...["light", "dark"].flatMap((surface) =>
    ["Default", "Hover", "Selected", "Disabled"].flatMap((state) => {
      const key = surface + "/" + state;
      return [
        ["gnb-menu-item", "height", ["gnb-menu-item", "sizes", key, "height"], "same"],
        ["gnb-menu-item", "paddingTop", ["gnb-menu-item", "sizes", key, "paddingBlock"], "same"],
        ["gnb-menu-item", "paddingLeft", ["gnb-menu-item", "sizes", key, "paddingInline"], "same"],
        ["gnb-menu-item", "borderTopLeftRadius", ["gnb-menu-item", "sizes", key, "radius"], "same"],
        ["gnb-menu-item-label", "fontSize", ["gnb-menu-item", "sizes", key, "labelFontSize"], "same"],
        ["gnb-menu-item-label", "lineHeight", ["gnb-menu-item", "sizes", key, "labelHeight"], "same"],
      ];
    }),
  ),

  ...[
    ["md/false", "inline-loading-slot-idle"],
    ["md/true", "inline-loading-slot-md"],
    ["sm/false", "inline-loading-slot-idle"],
    ["sm/true", "inline-loading-slot-sm"],
  ].flatMap(([key, slotProbe]) => [
    ["inline-loading-root", "paddingTop", ["inline-loading-label", "sizes", key, "paddingBlock"], "same"],
    ["inline-loading-root", "paddingLeft", ["inline-loading-label", "sizes", key, "paddingInline"], "same"],
    ["inline-loading-root", "borderTopLeftRadius", ["inline-loading-label", "sizes", key, "radius"], "same"],
    [slotProbe, "marginLeft", ["inline-loading-label", "sizes", key, "gap"], "same"],
    ...(key.endsWith("/true")
      ? [[slotProbe, "width", ["inline-loading-label", "sizes", key, "slot"], "same"],
         [slotProbe, "height", ["inline-loading-label", "sizes", key, "slot"], "same"]]
      : []),
  ]),

  ...["Default", "Focus", "Disabled"].flatMap((state) => [
    ["segmented-code-cell", "maxWidth", ["segmented-code-input", "sizes", state, "cellWidth"], "same"],
    ["segmented-code-cell", "height", ["segmented-code-input", "sizes", state, "cellHeight"], "same"],
    ["segmented-code-cell", "borderTopLeftRadius", ["segmented-code-input", "sizes", state, "cellRadius"], "same"],
    ["segmented-code-cell", "borderTopWidth", ["segmented-code-input", "sizes", state, "borderWidth"], "same"],
    ["segmented-code-char", "fontSize", ["segmented-code-input", "sizes", state, "charFontSize"], "same"],
    ["segmented-code-char", "lineHeight", ["segmented-code-input", "sizes", state, "charHeight"], "same"],
  ]),

  ["sidebar-header-row-collapsed", "minHeight", ["sidebar-brand", "sizes", "true", "height"], "same"],
  ["sidebar-logo-rail-collapsed", "minHeight", ["sidebar-brand", "sizes", "true", "markSize"], "same"],

  ["spinner-sm", "height", ["spinner", "sizes", "sm", "height"], "same"],
  ["sidebar-cta-hover", "backgroundColor", ["sidebar-cta", "states", "base", "Hover", "background"], "same"],
  ["sidebar-cta-hover", "color", ["sidebar-cta", "states", "base", "Hover", "foreground"], "same"],
  ["sidebar-cta-hover-light", "backgroundColor", ["sidebar-cta", "states", "base", "Hover", "background"], "same"],
  ["sidebar-cta-hover-light", "color", ["sidebar-cta", "states", "base", "Hover", "foreground"], "same"],
  // 폭 축은 레일이 서야 재진다 — `wrapperFrom` 이 제품 `wrapperSidebar` 를 조상으로 세운다.
  // 부품은 제품·DS 양쪽에서 폭을 선언하지 않고 100%로 받는다(제품 `[width:100%]`,
  // DS `inline-size: 100%`). 기록의 256/32 는 레일 폭에서 좌우 여백을 뺀 값이다.
  ["sidebar-header-row", "width", ["sidebar-brand", "sizes", "false", "width"], "same"],
  ["sidebar-header-row-collapsed", "width", ["sidebar-brand", "sizes", "true", "width"], "same"],
  ["sidebar-cta", "width", ["sidebar-cta", "sizes", "false", "width"], "same"],
  ["sidebar-cta-collapsed", "width", ["sidebar-cta", "sizes", "true", "width"], "same"],
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
// **주석을 먼저 지운다 — 안 지우면 아래 한 줄이 레이어 순서를 통째로 삼킨다.**
//
// 제품 `tailwind.css` 의 머리말은 `@import "tailwindcss"` 를 **설명하려고** 인용한다. 주석을 남긴
// 채 import 제거 정규식을 돌리면 그 인용에서 매칭이 시작되고 `[^;]*;` 가 다음 세미콜론까지
// 삼킨다 — 배포본 `df414c24` 에서는 그 세미콜론이 **`@layer theme, base, components;`** 의 것이라
// 순서 선언이 통째로 사라졌다. 그러면 문서에 남는 첫 선언이 `@layer utilities;` 가 되어
// **utilities 가 가장 낮은 레이어**가 되고, `globals.css` 의 `* { padding: 0 }` 리셋이 유틸리티를
// 이긴다. 빨개지지 않는다 — 패딩·마진 축이 조용히 전부 0 으로 잡힌다.
//
// 그전 배포본에서는 같은 삼킴이 순서 선언 **하나만** 지워 문서가 「선언 없음 = 등장 순서」로
// 떨어졌고, 그 순서가 우연히 옳았다. 그래서 이 버그는 제품이 파일을 재배치하는 날까지 잠복했다.
const normalize = (source) =>
  source
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/@import\s+["'][^;]*;/g, "")
    .replace(/@theme\s+(?:inline\s+)?\{/g, ":root {");

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

const workspace = mkdtempSync(join(tmpdir(), "louis-product-components-"));
let rendered;
let declaredByProbe;
let sources;
let dsPin = "HEAD";
try {
  // 제품의 진입 CSS는 ./keyframes.css를 @import한다. 컴파일러가 찾을 수 있게 함께 꺼내 둔다.
  const tailwindEntry = git(["show", commit + ":apps/web/app/tailwind.css"]);
  writeFileSync(join(workspace, "entry.css"), tailwindEntry);
  writeFileSync(join(workspace, "keyframes.css"), git(["show", commit + ":apps/web/app/keyframes.css"]));

  dsPin = materializeDsPackage({ workspace, git, commit, tag: "product-components" });

  sources = Object.fromEntries(
    Object.entries(FILES).map(([alias, path]) => [alias, git(["show", commit + ":" + path])]),
  );
  // **문서에 사이드바가 있다는 사실 자체가 색을 바꾼다.** 배포본의 `wrapperSidebar`는
  // `html[data-theme=light] body:has(&)`로 팔레트 단계를 통째로 재매핑한다 — 사이드바가 있는
  // 화면에서는 라이트 팔레트가 한 단계씩 밝아진다. 그 표식이 없으면 라이트 탐침이 제품에 없는
  // 색을 잰다. 화면에 그리지 않고 `:has()`만 만족시키면 된다.
  const bodyMarker = extractClassList(sources.gnb, "wrapperSidebar", FILES.gnb);

  // 소비처의 인라인 style 객체를 소스에서 꺼낸다. 값을 옮겨 적지 않는다.
  const inlineStyleOf = (alias, name) => {
    const source = sources[alias];
    const anchor = new RegExp("const\\s+" + name + "\\s*=\\s*\\{", "m").exec(source);
    if (!anchor) throw new Error(FILES[alias] + "에 " + name + " 인라인 style이 없습니다.");
    let depth = 0;
    let cursor = anchor.index + anchor[0].length - 1;
    for (; cursor < source.length; cursor += 1) {
      if (source[cursor] === "{") depth += 1;
      else if (source[cursor] === "}") {
        depth -= 1;
        if (depth === 0) break;
      }
    }
    const body = source.slice(anchor.index + anchor[0].length, cursor);
    return [...body.matchAll(/([A-Za-z][A-Za-z0-9]*)\s*:\s*"((?:[^"\\]|\\.)*)"/g)]
      .map((match) => match[1].replace(/[A-Z]/g, (c) => "-" + c.toLowerCase()) + ":" + JSON.parse('"' + match[2] + '"'))
      .join(";");
  };
  for (const probe of PROBES) {
    if (!probe.from) continue;
    const [alias, ...keys] = probe.from;
    probe.classes = keys
      .map((key) => extractClassList(sources[alias], key, FILES[alias]))
      .join(" ");
    const inline = probe.inlineFrom ? inlineStyleOf(probe.inlineFrom[0], probe.inlineFrom[1]) : "";
    // **조상도 제품 상수에서 가져온다.** `wrapper`는 클래스 이름을 문자열로 받는데, 그것으로는
    // 「조상 선택자를 만족시킨다」까지만 되고 **조상이 실제로 만드는 기하**(레일 폭 280px 등)는
    // 서지 않는다. 그래서 폭 축들이 host 폭을 재 왔다.
    //
    // 문자열로 옮겨 적는 것은 답이 아니다 — `wrapperSidebar`의 클래스는 4천 자가 넘고, 옮겨
    // 적는 순간 제품이 바뀌어도 초록으로 남는다. 여기서 `from`과 같은 경로로 뽑는다.
    if (probe.wrapperFrom) {
      probe.wrapper = probe.wrapperFrom.map(([alias, ...keys]) =>
        keys.map((key) => extractClassList(sources[alias], key, FILES[alias])).join(" "),
      );
    }
    const tag = probe.tag ?? "div";
    // **속성은 값이 아니라 구조다.** `aria-current="true"` 같은 상태 훅은 제품이 마크업에
    // 거는 것이고 클래스가 아니다 — LOUIS 가 `.louis-banner-carousel__dot[aria-current="true"]`
    // 로 활성 폭을 소유하게 된 뒤로, 활성 점을 재려면 클래스가 아니라 이 속성이 필요하다.
    // 여기 적는 것은 훅 이름이지 수치가 아니므로 「클래스 문자열을 옮겨 적지 않는다」에
    // 걸리지 않는다.
    const attrs = Object.entries(probe.attrs ?? {})
      .map(([name, value]) => " " + name + '="' + value + '"')
      .join("");
    // **자식도 제품 상수에서 세운다.** 자식 높이가 부모를 정하는 축(컨트롤 알약의 높이)은 한
    // 겹으로 낼 수 없다. 그전에는 그 한 축만 클래스를 손으로 이어 붙인 `html` 이었고, 주석이
    // 스스로 「제품이 상수를 인라인하면 값이 조용히 틀린다」고 적어 두었다. 여기서 뽑으면
    // 그 위험이 사라진다.
    const child = probe.childFrom
      ? (() => {
          const [childAlias, ...childKeys] = probe.childFrom;
          const childTag = probe.childTag ?? "div";
          const childClasses = childKeys
            .map((key) => extractClassList(sources[childAlias], key, FILES[childAlias]))
            .join(" ");
          return (
            "<" + childTag + ' class="' + childClasses + '">' + (probe.childText ?? "") +
            "</" + childTag + ">"
          );
        })()
      : "";
    probe.html =
      "<" + tag + ' class="' + probe.classes + '"' + attrs +
      (inline ? ' style="' + inline + '"' : "") + ">" +
      (probe.text ?? "") + child + "</" + tag + ">";
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
    for (const match of probe.html.matchAll(/class="([^"]*)"/g)) {
      for (const token of match[1].split(/\s+/)) if (token) candidates.add(token);
    }
    for (const entry of [probe.wrapper ?? []].flat()) {
      candidates.add(typeof entry === "string" ? entry : entry.class);
    }
  }
  for (const token of bodyMarker.split(/\s+/)) if (token) candidates.add(token);
  const utilities = compiled.build([...candidates]);
  if (process.env.LOUIS_DUMP_RULE) {
    for (const line of utilities.split("\n")) {
      if (line.includes("body:has")) console.log(line.slice(0, 200));
    }
    process.exit(0);
  }

  // **레이어 순서를 문서 맨 앞에 못 박는다.** 제품에서는 `tailwind.css` 가
  // theme → base → components → LOUIS → utilities 순으로 선언하는데, 그 순서의 LOUIS 구간은
  // `@import "@klipse-design/css/layers.css"` 가 갖고 있고 위 `normalize` 가 그 import 를 지운다.
  // 지우고 나면 LOUIS 레이어가 컴파일 시트에서 처음 등장하며 **utilities 뒤에** 붙어, 제품과
  // 반대로 LOUIS 가 호출부 유틸리티를 이기는 문서가 된다. 이름을 손으로 적지 않고 컴파일
  // 산출물이 실제로 선언한 LOUIS 순서를 꺼내 쓴다.
  const louisLayerOrder = /@layer\s+(louis\.[^;]*);/.exec(utilities)?.[1] ?? "";
  const layerOrder =
    "@layer theme, base, components" +
    (louisLayerOrder ? ", " + louisLayerOrder : "") +
    ", utilities;";

  const baseCss = [
    layerOrder,
    // 제품 글꼴을 싣지 않으면 브라우저 기본 글꼴로 떨어져
    // 글자가 폭을 정하는 축이 전부 틀린 값으로 잡힌다. scripts/lib/product-font.mjs에 사유가 있다.
    productFontFace(productRoot, commit),
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
          '</style><style id="louis-product-utilities">' +
          utilities.replace(/<\/style>/gi, "<\\/style>") +
          '</style></head><body><div hidden style="display:none" class="' + bodyMarker + '"></div>' +
          group
            .map((probe, index) => {
              // wrapper는 조상 선택자를 살리기 위한 것이다. 배열이면 바깥부터 순서대로 감싼다 —
              // `.a .b &` 처럼 조상이 둘인 규칙은 한 겹으로는 매칭되지 않는다.
              const wrappers = [probe.wrapper ?? []].flat();
              // 조상도 속성을 가질 수 있다 — `.louis-spinner[data-size="sm"] .louis-spinner__ring`
              // 처럼 크기를 조상의 data 속성이 정하는 자리가 있다. 문자열이면 클래스만,
              // 객체면 `{ class, attrs }` 로 받는다.
              const inner = wrappers.reduceRight((html, entry) => {
                const className = typeof entry === "string" ? entry : entry.class;
                const attributes =
                  typeof entry === "string"
                    ? ""
                    : Object.entries(entry.attrs ?? {})
                        .map(([name, value]) => " " + name + '="' + value + '"')
                        .join("");
                return '<div class="' + className + '"' + attributes + ">" + html + "</div>";
              }, probe.html);
              return (
                '<div id="probe-' + index + '" style="position:relative;width:' +
                (probe.hostWidth ?? 360) + 'px;height:360px">' + inner + "</div>"
              );
            })
            .join("") +
          "</body></html>",
        { waitUntil: "load" },
      );
      // **애니메이션 중간을 재지 않는다.** 그러지 않으면 이 게이트가 실행할 때마다 다른 값을
      // 낸다 — 토스트 셋은 등장 애니메이션 도중에(transform Y가 10 대신 9.8369), skeleton은 무한
      // 반짝임 도중에(::after transform X가 -360 대신 -359.944) 잡혔다. 값을 판정하는 것이
      // 브라우저인데 그 브라우저가 동전을 던지면, 빨간 게이트를 고치는 가장 쉬운 방법이 그때 본
      // 잡음을 기록에 붙여 넣는 것이 된다 — 이 저장소가 뒤집으려던 바로 그 방향이다.
      //
      // CSS로 세우지 **않는다.** `animation-play-state`도 `animation-duration`도 제품이 선언하는
      // property라(전자는 기록에 있고 후자는 `skeleton ::after`의 대조 축이다) `!important`로 덮으면
      // **계측 장치의 값이 제품 근거인 척 기록에 남는다.** 애니메이션 객체를 직접 세우면
      // 계산된 CSS 값은 제품이 선언한 그대로 읽히고 기하만 결정적이 된다.
      // 의사요소(`::after`)의 애니메이션도 `document.getAnimations()`에 들어온다.
      const group_ = await page.evaluate((probes) => {
        // **읽기 직전에 얼린다.** 별도 호출로 얼리면 CSS 애니메이션이 스타일 재계산 때
        // API로 건 pause를 되돌려 다시 흐른다(실측 확인: 300ms 뒤 -360 → -355.348).
        // 같은 evaluate 안에서 시각을 0으로 놓고 바로 읽으면 그 틈이 없고,
        // `animation-duration`과 `animation-play-state`는 제품 선언 그대로 남는다.
        for (const a of document.getAnimations()) {
          try { a.finish(); } catch { a.currentTime = 0; }
        }
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
              // **longhand 순회가 아니라 cssText 를 얹는다.**
              //
              // 그전까지 `for (const property of rule.style)` 로 longhand 를 하나씩 옮겼는데,
              // **`var()` 가 든 단축 속성은 그렇게 옮길 수 없다.** CSSOM 은 그런 단축을 pending
              // substitution 으로 두어 longhand 값이 빈 문자열로 나오고, 결국 아무것도 안 얹혀
              // 요소가 Default 를 그대로 유지한다.
              //
              // 2026-08-23 실측: 제품의 `html[data-theme=dark] .gnb-sidebarUpgradeButton:not(&):hover`
              // 는 `background: var(--palette-gray-200)` 라 이 경로로 통째로 사라졌다. 규칙은
              // 정확히 매칭됐는데도 측정값이 Default(gray-100)로 나왔고, **hover 축이 조용히
              // 틀린 상태를 재고 있었다.** `nav-item-hover` 가 멀쩡했던 것은 그쪽이
              // `background-color` longhand 였기 때문이지 장치가 옳아서가 아니다.
              //
              // cssText 를 이어 붙이면 단축이 단축인 채로 인라인에 들어가 var() 가 살아남는다.
              // 인라인은 어떤 스타일시트 규칙보다 세므로 순위는 여전히 rank 순서가 결정한다.
              clone.style.cssText += ";" + rule.style.cssText;
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
// **대조표는 렌더와 같은 판에서 온다.** 그전에는 `repoRoot` 의 생성물을 읽었는데, 렌더는
// `materializeDsPackage` 가 꺼낸 **제품이 고정한 핀** 판을 쓴다. 지금은 두 판이 바이트 같아
// 결과가 우연히 맞았지만, 갈리는 순간 조용히 틀린 대조를 한다 — 이 게이트가 잡으라고 만들어진
// 바로 그 병이다. 핀 판이 있으면 그쪽을, 없으면 워킹트리를 읽는다.
const pinnedTokensCss = join(workspace, "@klipse-design", "css", "tokens.css");
const tokensCss = readFileSync(
  existsSync(pinnedTokensCss) ? pinnedTokensCss : resolve(repoRoot, "packages/css/generated/tokens.css"),
  "utf8",
);
// **`:root` 를 문자열로 찾으면 안 된다.** tokens.css 의 첫 `:root` 블록은 **프리미티브 전용**
// 이고, 시맨틱 라이트는 그 뒤 `:root,\n[data-theme="light"] {` 블록에 있다. `indexOf(":root")`
// 는 첫 블록에서 멈추므로 light 맵에 시맨틱 토큰이 **한 개도 들어오지 않았다** — 라이트 탐침의
// 색 대조 6건이 전부 "토큰이 light 테마에 없습니다"로 죽어 있었고, 그것은 DS 결손이 아니라
// 여기 버그였다(2026-08-30 실측). 형제 스크립트 `verify-token-gates.mjs:366` 은 처음부터
// 올바른 정규식을 쓰고 있었다 — 규약을 어긴 것은 이 파일뿐이다.
//
// 프리미티브는 두 테마 모두에 깔린다(다크 블록은 시맨틱만 덮는다). 그래서 테마 맵은
// **프리미티브 ∪ 해당 테마 시맨틱**이다.
function readTokenBlock(source, pattern, label) {
  const body = pattern.exec(source)?.[1];
  if (body === undefined) throw new Error("tokens.css에서 " + label + " 블록을 찾지 못했습니다.");
  const map = new Map();
  for (const line of body.split("\n")) {
    const match = /^\s*(--louis-[a-z0-9-]+):\s*(.+);\s*$/.exec(line);
    if (match) map.set(match[1], match[2].trim());
  }
  return map;
}
const PRIMITIVE_TOKENS = readTokenBlock(tokensCss, /^:root \{$([\s\S]*?)^\}$/m, "프리미티브 :root");
const LIGHT_SEMANTIC = readTokenBlock(
  tokensCss,
  /^:root,\n\[data-theme="light"\] \{$([\s\S]*?)^\}$/m,
  '시맨틱 라이트 :root, [data-theme="light"]',
);
const DARK_SEMANTIC = readTokenBlock(
  tokensCss,
  /^\[data-theme="dark"\] \{$([\s\S]*?)^\}$/m,
  '시맨틱 다크 [data-theme="dark"]',
);
const THEME_TOKENS = {
  light: new Map([...PRIMITIVE_TOKENS, ...LIGHT_SEMANTIC]),
  dark: new Map([...PRIMITIVE_TOKENS, ...DARK_SEMANTIC]),
};
// **위 버그가 되살아나면 여기서 죽는다.** 다크 블록은 시맨틱만 **덮으므로**, 다크에 있는 키는
// 라이트에도 반드시 있어야 한다. 라이트를 프리미티브 블록에서 읽으면 이 불변식이 통째로 깨진다
// — 이름 하나를 손으로 적어 두는 것보다 구조를 확인하는 쪽이 이름이 바뀌어도 살아남는다.
const lightGaps = [...DARK_SEMANTIC.keys()].filter((key) => !LIGHT_SEMANTIC.has(key));
if (lightGaps.length > 0) {
  throw new Error(
    "다크에만 있고 라이트에 없는 시맨틱 토큰 " + lightGaps.length + "건입니다 — tokens.css 블록 " +
      "구조가 바뀌었거나 라이트 블록을 잘못 읽고 있습니다: " + lightGaps.slice(0, 5).join(", "),
  );
}
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

// ── 탐침이 자기가 적은 값을 되읽지 못하게 한다 ────────────────────────────
// **2026-08-30 에 세 곳에서 이 일이 벌어졌다.** `project-card` 는 html 에
// `[border-radius:16px]`, `project-card-overlay` 는 `[padding:16px] [border-radius:0_0_16px_16px]`,
// `project-grid` 는 `[gap:12px]` 를 적어 두고 **그 리터럴을 다시 읽어** DS와 대조했다. 제품을
// 잰 적이 없으므로 제품이 무엇을 그리든 초록이었고, 실제로 카드 반경은 12(기록 16), 그리드
// 간격은 4(기록 12)였다. 그 거짓 값 위에서 반경 판정을 내려 토큰·CSS·기록·Figma 를 전부 잘못된
// 방향으로 옮겼다가 되돌렸다.
//
// `html`은 제품에 공용 상수가 없을 때만 쓰는 탈출구다(클래스 후크 이름만 적는 용도). 그 html 이
// **대조하는 축의 값을 스스로 적고 있으면** 그것은 측정이 아니라 자기 확인이다.
const SELF_MEASURED = {
  borderTopLeftRadius: /border-radius|rounded/,
  borderBottomLeftRadius: /border-radius|rounded/,
  borderTopWidth: /\bborder\b/,
  padding: /\bpadding\b/,
  paddingTop: /\bpadding\b/,
  paddingLeft: /\bpadding\b/,
  height: /\bheight\b|\bh-\[/,
  width: /\bwidth\b|\bw-\[/,
  minWidth: /min-width|min-w-/,
  columnGap: /\bgap\b|\bgap-/,
  rowGap: /\bgap\b|\bgap-/,
  fontSize: /font-size|\btext-\[/,
  lineHeight: /line-height|leading-/,
  backdropFilter: /backdrop-filter/,
};
{
  const byId = new Map(PROBES.map((probe) => [probe.id, probe]));
  const selfMeasured = [];
  for (const [probeId, property, path] of EXPECT) {
    const probe = byId.get(probeId);
    if (!probe || !probe.html || probe.from) continue;
    const axis = property.replace(/^::[a-z-]+:/, "");
    const pattern = SELF_MEASURED[axis];
    if (pattern && pattern.test(probe.html)) {
      selfMeasured.push(
        probeId + "." + property + ": 탐침이 자기 html 에 이 축의 값을 적어 두고 그것을 되읽습니다 — " +
          "제품을 재지 않으므로 " + path.join(".") + " 대조가 아무것도 증명하지 않습니다.",
      );
    }
  }
  if (selfMeasured.length > 0) {
    console.error("[product-components] 자기가 적은 값을 되읽는 탐침 " + selfMeasured.length + "건입니다:");
    for (const item of selfMeasured) console.error("[product-components]   " + item);
    process.exit(1);
  }
}

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
      const tokenValue = THEME_TOKENS[theme].get("--louis-" + want);
      if (tokenValue === undefined) {
        failures.push(label + ": DS 토큰 --louis-" + want + "가 " + theme + " 테마에 없습니다.");
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
    // `blur(16px) saturate(1.3)`처럼 함수로 감싼 값은 앞의 수가 축이다.
    const numeric = Number.parseFloat(raw);
    const actual = (Number.isFinite(numeric) ? numeric : Number.parseFloat((/[\d.]+/.exec(raw ?? "") ?? ["NaN"])[0])) * scale;
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

// ── DS 기록이 제품을 확인하고 정해졌는가 ──────────────────────────────────
// **오늘 드러난 근본 원인이다.** Figma는 `components.measured.json`을 보고 그렸고, CSS 테스트도
// 같은 파일과 맞췄다. 그래서 Figma ↔ DS와 CSS ↔ DS는 초록인데 **셋 다 제품과 다를 수 있었다** —
// 실제로 모달 여백·반경·액션 여백이 그랬다. 게이트가 DS ↔ 제품을 본 적이 없었기 때문이다.
//
// 규칙: 기록의 모든 값은 ① 제품 렌더와 대조되거나 ② 왜 그 값인지 `$`주석을 갖거나 ③ 아직
// 못 한 빚으로 명부에 있어야 한다. 명부에 없는 새 값은 실패다 — **빚은 줄기만 하고 늘지 않는다.**
const debtPath = resolve(repoRoot, "figma/unverified-values.json");
const comparedPaths = new Set(EXPECT.map(([, , path]) => path.join(".")));
const unverified = [];
const walkMeasured = (node, path) => {
  if (node === null || typeof node !== "object" || Array.isArray(node)) return;
  for (const [key, value] of Object.entries(node)) {
    if (key.startsWith("$")) continue;
    const next = [...path, key];
    if (value !== null && typeof value === "object" && !Array.isArray(value)) {
      walkMeasured(value, next);
      continue;
    }
    if (comparedPaths.has(next.join("."))) continue;
    if (Object.hasOwn(node, "$" + key)) continue;
    unverified.push(next.join("."));
  }
};
for (const [name, spec] of Object.entries(measuredFile.components)) walkMeasured(spec, [name]);

// **네 갈래를 한 번에 낸다.** 그전에는 각 갈래가 스스로 `process.exit(1)`을 불렀고, 그래서
// 맨 앞 갈래가 걸리면 뒤의 세 갈래는 **한 줄도 찍히지 않았다.** 실제로 그 때문에 "미대조 22건"이
// 문제의 전부처럼 보였고 그 뒤에 가려져 있던 대조 실패 42건은 보이지 않았다. 갈래별로 끊으면
// 고칠 때마다 새 실패가 튀어나와 몇 번을 돌려야 전체를 알 수 있는지 알 수 없다.
// 이제 전부 찍고 마지막에 한 번만 나간다.
let failed = false;
const listLimit = process.env.LOUIS_LIST_ALL ? Number.POSITIVE_INFINITY : 20;

const debt = JSON.parse(readFileSync(debtPath, "utf8"));
const owed = new Set(debt.values);
const grown = unverified.filter((entry) => !owed.has(entry));
const settled = [...owed].filter((entry) => !unverified.includes(entry));
if (grown.length > 0) {
  console.error(
    "[product-components] 제품 대조도 사유도 없는 값이 새로 " + grown.length + "개 생겼습니다. " +
      "EXPECT에 대조 행을 넣거나 `$" + "키` 주석으로 왜 그 값인지 적으세요.",
  );
  for (const entry of grown.slice(0, listLimit)) console.error("[product-components]   " + entry);
  failed = true;
}
if (settled.length > 0) {
  console.error(
    "[product-components] 빚 " + settled.length + "건이 해소됐습니다. figma/unverified-values.json에서 지우세요:",
  );
  for (const entry of settled.slice(0, listLimit)) console.error("[product-components]   " + entry);
  failed = true;
}

if (unclassified.length > 0) {
  console.error(
    "[product-components] 제품이 선언했는데 분류되지 않은 축 " + unclassified.length + "건입니다. " +
      "EXPECT에 대조 행을 넣거나 figma/product-coverage.json에 사유와 함께 범위 밖으로 적으세요.",
  );
  const limit = process.env.LOUIS_LIST_ALL ? unclassified.length : 60;
  for (const item of unclassified.slice(0, limit)) console.error("[product-components]   " + item);
  if (unclassified.length > limit) console.error("[product-components]   … 외 " + (unclassified.length - limit) + "건");
  failed = true;
}

if (mismatches.length > 0) {
  console.error("[product-components] DS 기록과 제품 렌더가 어긋난 축 " + mismatches.length + "건입니다:");
  for (const mismatch of mismatches) console.error("[product-components] " + mismatch);
  failed = true;
}

if (failed) process.exit(1);

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
    ": 탐침 " + PROBES.length + "종 @ " + commit.slice(0, 8) + " · DS " + dsPin +
    " · **브라우저가 잰 제품 값과 DS를 " + compared.length + "축 대조** (일치 " +
    (compared.length - deviations.length) + " · 기록된 편차 " + deviations.length +
    ") · 컴포넌트 " + new Set(EXPECT.map(([, , path]) => path[0])).size + "/" +
    Object.keys(measuredFile.components).length + " 대조" +
    " · **제품 선언 " + Object.values(declaredByProbe).reduce((sum, map) => sum + Object.keys(map).length, 0) +
    "건이 빠짐없이 분류됨** · DS 기록 " +
    (Object.values(measuredFile.components).length > 0 ? unverified.length : 0) + "건이 아직 제품 미대조",
);
