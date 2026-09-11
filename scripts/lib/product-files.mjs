// 측정이 읽는 제품 파일의 정본.
//
// **왜 별도 모듈인가.** `measure-product-components.mjs`의 탐침은 `from: ["appHome", "updateBanner"]`
// 처럼 그룹 이름으로 제품 상수를 참조하고, 그 그룹이 어느 파일인지는 이 맵이 정한다.
// 그런데 `build-product-evidence.mjs`는 **`product.measured.json`과 문서가 인용한 파일만** 걷고
// 있었다. 그래서 탐침이 읽는데 lock이 고정하지 않는 파일이 생겼다 —
// 2026-08-23 기준 `TabBannerCarousel.tsx` · `LoadingSpinner.tsx` · `CanvasEmptyState.tsx` 셋이다.
//
// 그 상태가 위험한 이유는 조용하기 때문이다. 캐러셀에 17축을 매달아 두고 제품이 그 파일을
// 바꿔도 `verify-product-evidence`가 아무 말도 하지 않는다 — 측정값만 조용히 낡는다.
//
// 두 스크립트가 같은 목록을 보게 해서 그 구멍을 막는다. 탐침을 새 파일에 붙이면 여기에
// 한 줄 더하는 것으로 lock까지 따라온다.
//
// **`carousel` 항목은 2026-08-27 에 사라졌다.** 제품이 `6602fd24` 에서
// `components/banners/TabBannerCarousel.tsx` 를 지웠고(290줄), 배너 캐러셀 마크업은
// `components/scenes/AppHomeScene.tsx` 로, 클래스 상수는 `appHomeSceneStyles.ts` 의
// `updateBanner` · `bannerContent` · `bannerControls` · `bannerArrowButton` · `bannerDots` ·
// `bannerDot` 으로 옮겨 갔다. 그 파일은 이미 `appHome` 으로 여기 있으므로 별도 별칭을 두지
// 않는다 — 캐러셀 탐침의 `from` 이 `appHome` 을 가리킨다.
//
// 이 결함을 **락 게이트가 잡았다.** 재기준선을 뜨려는 순간 「배포본에 없는 파일을 인용합니다」로
// 멈췄다. 위 주석이 걱정하던 「조용히 낡는다」의 반대편이 실제로 작동한 자리다.
export const PRODUCT_FILES = {
  gnb: "apps/web/components/navigation/Gnb.tsx",
  appHome: "apps/web/components/scenes/appHomeSceneStyles.ts",
  appHomeScene: "apps/web/components/scenes/AppHomeScene.tsx",
  highlight: "apps/web/components/scenes/highlightSceneStyles.ts",
  myPage: "apps/web/components/scenes/myPageSceneStyles.ts",
  avatar: "apps/web/components/navigation/UserCircleDefaultAvatar.tsx",
  spinner: "apps/web/components/ui/LoadingSpinner.tsx",
  canvasEmpty: "apps/web/components/scenes/create/node-canvas-v2/components/CanvasEmptyState.tsx",
  // 6337ad54 재기준선: VEM_CLASS가 VideoEditModal.tsx에서 분리됐다(66d48071 리팩토링).
  vem: "apps/web/components/scenes/create/node-canvas-v2/nodes/videoEditParts/vemClass.ts",
  crop: "apps/web/components/scenes/create/node-canvas-v2/nodes/videoEditParts/ClipCropModal.tsx",
  // ── 랜딩 여섯 + ui 둘 ─────────────────────────────────────────────────────
  // Figma 가 먼저 서고 LOUIS recipe 가 아직 없는 여덟이다. 계약에 `geometry` 를 붙이려면
  // `figma/components.measured.json` 에 실측 정본이 있어야 하는데, 이 여덟은 LOUIS 컴포넌트가
  // 아니라 **제품이 정본**이라 vitest 브라우저 테스트가 잴 대상이 없다. 그래서 여기 탐침으로 잰다.
  landingMediaCard: "apps/web/components/landing/system/MediaCard.tsx",
  landingCarouselArrows: "apps/web/components/landing/system/CarouselArrows.tsx",
  landingStepTiles: "apps/web/components/landing/sections/StepTiles.tsx",
  landingFaq: "apps/web/components/landing/sections/FAQ.tsx",
  landingNews: "apps/web/components/landing/sections/NewsCarousel.tsx",
  landingGnb: "apps/web/components/landing/navigation/Gnb.tsx",
  inlineLoadingLabel: "apps/web/components/ui/InlineLoadingLabel.tsx",
  segmentedCodeInput: "apps/web/components/ui/SegmentedCodeInput.tsx",
  // ── 결제 결과 화면(status-result) ─────────────────────────────────────────
  // `design/patterns/status-result.md` 가 계약하는 콘텐츠 컬럼인데 **실측 하네스가 이 계열을
  // 한 축도 재지 않았다.** 그래서 Figma 에 `Pattern · StatusResult` 를 세웠을 때 제품과
  // 갈린 축들이 게이트를 통과했다 — 재지 않는 자리는 갈라져도 조용하다.
  //
  // 일곱 화면(업그레이드 성공·실패 · 정기결제 성공·실패 · 결제수단 변경 성공·실패 · 충전
  // 성공·실패)이 같은 이름의 상수를 각자 복제해 들고 있고, 그중 이 파일이 가장 많이 가진
  // 벌이다 — 붉은 배너(`STATUS_ALERT_ERROR`)가 **실재하는 라우트가 여기 하나뿐**이라
  // (status-result.md 의 2026-08-30 정정) 다른 화면을 골랐다면 그 부품을 잴 수 없다.
  statusResult: "apps/web/app/mypage/upgrade/billing-success/page.tsx",
  // ── 인증 두 패널(auth-two-panel) ─────────────────────────────────────────
  // `design/patterns/auth-two-panel.md` 가 로그인 전 여덟 화면의 껍데기를 계약하는데 **실측
  // 하네스가 이 계열도 한 축도 재지 않았다.** status-result 와 같은 침묵이다 — Figma 에
  // `Pattern · AuthTwoPanel` 을 세웠을 때 제품과 갈린 축들이 게이트를 통과했다.
  //
  // 여덟 화면 중 다섯(`/reset-password` · `/reset-password/new` · `/signup/check-email` ·
  // `/signup/expired` · `/signup/verified`)이 이 공용 벌을 쓰고, 셋(`/login` · `/signup` ·
  // `/aws/signup`)은 같은 셸을 자기 파일에 복제해 두었다. **정본은 공용 벌이다** — 복제 셋은
  // 문서가 「복제 부채이지 이 패턴의 계약이 아니다」라고 이미 판정했고, 갈린 값은 탐침 사유와
  // figma/product-coverage.json 에 적는다. 복제 셋 세 파일은 문서 인용으로 이미 lock 에 있다.
  authStatusCard: "apps/web/components/auth/AuthStatusCard.tsx",
  // ── 라우트 경계(route-boundary) ───────────────────────────────────────────
  // `design/patterns/route-boundary.md` 가 404 · 오류 · 최후 경계 셋을 계약하는데 **실측 하네스가
  // 이 계열도 한 축도 재지 않았다.** status-result · auth-two-panel 과 같은 침묵이다.
  //
  // 두 파일을 **둘 다** 건다. 404 와 오류는 공용 컴포넌트가 아니라 복제이고(`ROOT` · `CONTENT` ·
  // `TITLE` · `DESCRIPTION` · `PAGE_CTA` 다섯 상수를 각자 자기 파일에 적는다), 한 벌만 걸면
  // 한쪽만 고친 날 게이트가 침묵한다.
  //
  // 셋째인 `apps/web/app/global-error.tsx` 는 여기 없다. 그 화면은 클래스를 하나도 갖지 않아
  // 이 하네스가 꺼낼 상수가 없다 — 사유는 measure-product-components.mjs 의 탐침 머리말에 있다.
  notFoundBoundary: "apps/web/app/not-found-content.tsx",
  errorBoundary: "apps/web/app/error.tsx",
  // ── Alert · SectionHeader 담지자 ────────────────────────────────────────
  // `ALERT` 는 클래스가 `"louis-alert"` 한 낱말이라 **레시피를 한 축도 덮지 않는다**
  // (AdminSection.tsx). `AdminAlert` 가 danger·success·warning·info 넷을 `data-tone` 으로
  // 실제로 내므로 톤 축 열둘을 이 한 벌로 잰다. 같은 파일이 `HEADER` 로 section-header 도
  // 담지한다 — 어드민 열한 화면의 제목 사다리를 이 파일이 단독으로 소유한다.
  admin: "apps/web/app/admin/AdminSection.tsx",
};
