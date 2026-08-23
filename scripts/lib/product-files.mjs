// 측정이 읽는 제품 파일의 정본.
//
// **왜 별도 모듈인가.** `measure-product-components.mjs`의 탐침은 `from: ["carousel", "CAROUSEL"]`
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
export const PRODUCT_FILES = {
  gnb: "apps/web/components/navigation/Gnb.tsx",
  appHome: "apps/web/components/scenes/appHomeSceneStyles.ts",
  appHomeScene: "apps/web/components/scenes/AppHomeScene.tsx",
  highlight: "apps/web/components/scenes/highlightSceneStyles.ts",
  myPage: "apps/web/components/scenes/myPageSceneStyles.ts",
  carousel: "apps/web/components/banners/TabBannerCarousel.tsx",
  avatar: "apps/web/components/navigation/UserCircleDefaultAvatar.tsx",
  spinner: "apps/web/components/ui/LoadingSpinner.tsx",
  canvasEmpty: "apps/web/components/scenes/create/node-canvas-v2/components/CanvasEmptyState.tsx",
  // 6337ad54 재기준선: VEM_CLASS가 VideoEditModal.tsx에서 분리됐다(66d48071 리팩토링).
  vem: "apps/web/components/scenes/create/node-canvas-v2/nodes/videoEditParts/vemClass.ts",
  crop: "apps/web/components/scenes/create/node-canvas-v2/nodes/videoEditParts/ClipCropModal.tsx",
};
