/**
 * overlay primitive 내부 배럴.
 *
 * DS-D-0011 결정 1: 이 배럴은 `packages/react/src/index.ts`에서 재export하지 않으며
 * `package.json`의 `exports`에도 서브패스를 만들지 않는다. 공개 표면은 Menu·Dialog
 * recipe이고 overlay는 그 구현 세부다.
 *
 * DS-D-0011 결정 2: 테스트는 `packages/react/test/**`에서 `../dist/overlay/index.js`로
 * 접근한다. `src`가 아니라 `dist`를 읽는 것이 예외의 조건이다 — 그래야
 * `tsc` + `isolatedDeclarations` 빌드 경로가 함께 검증된다.
 */
export { createActivationGuard } from "./activation-guard.js";
export { createBranchRegistry } from "./branch-registry.js";
export { OverlayDismissRegion, } from "./dismiss-region.js";
export { OverlayFocusRegion, resolveInitialFocus, resolveReturnFocus, } from "./focus-region.js";
export { useOverlayIds } from "./ids.js";
export { createInertController } from "./inert-controller.js";
export { createOverlayStore, } from "./overlay-store.js";
export { OverlayBranchProvider, OverlayProvider, useOverlayContext, useParentBranch, } from "./overlay-provider.js";
export { OverlayPortal } from "./overlay-portal.js";
export { DEFAULT_OVERLAY_METRICS, OverlayAnchor, OverlayPositioned, OverlayPositioner, measureOverlayMetrics, } from "./positioner.js";
export { readExitDuration, useOverlayPresence, } from "./presence.js";
export { createScrollLock } from "./scroll-lock.js";
export { useOverlay, } from "./use-overlay.js";
//# sourceMappingURL=index.js.map