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
export { createActivationGuard, type ActivationGuard } from "./activation-guard.js";
export { createBranchRegistry, type BranchRegistry } from "./branch-registry.js";
export { OverlayDismissRegion, type OverlayDismissRegionProps, } from "./dismiss-region.js";
export { OverlayFocusRegion, resolveInitialFocus, resolveReturnFocus, type OverlayFocusRegionProps, } from "./focus-region.js";
export { useOverlayIds, type OverlayIds } from "./ids.js";
export { createInertController, type InertController } from "./inert-controller.js";
export { createOverlayStore, type EscapeHost, type LayerRecord, type OverlayStore, } from "./overlay-store.js";
export { OverlayBranchProvider, OverlayProvider, useOverlayContext, useParentBranch, type OverlayBranchInfo, type OverlayBranchProviderProps, type OverlayContextValue, type OverlayProviderProps, } from "./overlay-provider.js";
export { OverlayPortal, type OverlayPortalProps } from "./overlay-portal.js";
export { DEFAULT_OVERLAY_METRICS, OverlayAnchor, OverlayPositioned, OverlayPositioner, measureOverlayMetrics, type OverlayAlign, type OverlayAnchorProps, type OverlayMetrics, type OverlayPositionedProps, type OverlayPositionerProps, type OverlaySide, } from "./positioner.js";
export { readExitDuration, useOverlayPresence, type OverlayPresence, type OverlayPresenceOptions, } from "./presence.js";
export { createScrollLock, type ScrollLock } from "./scroll-lock.js";
export type { OverlayDismissReason, OverlayHostKind, OverlayInitialFocus, OverlayLayer, OverlayMode, OverlayPresenceState, } from "./types.js";
export { useOverlay, type OverlaySurfaceComponent, type OverlaySurfaceProps, type UseOverlayOptions, type UseOverlayResult, } from "./use-overlay.js";
//# sourceMappingURL=index.d.ts.map