import { type JSX, type ReactNode } from "react";
import { type InertController } from "./inert-controller.js";
import { type OverlayStore } from "./overlay-store.js";
import { type OverlayMetrics } from "./positioner.js";
import { type ScrollLock } from "./scroll-lock.js";
import type { OverlayHostKind, OverlayLayer } from "./types.js";
/**
 * portal host와 scroll owner를 **앱이 한 번** 해석한다.
 *
 * dialog.md는 임의 div로의 portal을 금지하고 Dialog에 `portalContainer` prop을 두지 않는다.
 * menu-popover.md의 `portalHost`도 명시적 host id만 받는다. 즉 규범은 컴포넌트가 host를
 * 고르는 것을 막는다 — 그러면 그 컴포넌트가 어디에 있느냐에 따라 stacking과 inert 경계가
 * 달라지기 때문이다. 이 Provider가 그 선택지를 아예 없앤다.
 */
export interface OverlayContextValue {
    readonly store: OverlayStore;
    readonly scrollLock: ScrollLock;
    readonly inert: InertController;
    readonly hosts: Readonly<Record<OverlayHostKind, HTMLElement | null>>;
    readonly hostContainer: HTMLElement | null;
    readonly scrollOwner: HTMLElement | null;
    /** CSS에서 1회 측정한 배치 상수. panel이 존재하기 전에 필요하므로 여기서 소유한다. */
    readonly metrics: OverlayMetrics;
}
/**
 * 현재 열려 있는 부모 overlay. 없으면 null. lineage의 유일한 출처다.
 *
 * `layer`를 함께 나르는 이유: 자손 branch는 항상 부모보다 위여야 하는데(F12/W-7),
 * 그것을 z-index로도 표현하려면 부모의 layer를 알아야 한다. Dialog 안에서 연 Popover가
 * `popover`(200) 그대로면 Dialog(300) 뒤에 깔려 **보이지만 누를 수 없는** 상태가 된다.
 */
export interface OverlayBranchInfo {
    readonly branchId: string;
    readonly layer: OverlayLayer;
}
export interface OverlayProviderProps {
    readonly children: ReactNode;
    /**
     * host와 scroll owner를 담을 요소. 기본값은 `document.body`다.
     * 테스트가 격리된 컨테이너를 쓰기 위해 열어 둔다.
     */
    readonly container?: HTMLElement | null;
}
export declare function OverlayProvider({ children, container, }: OverlayProviderProps): JSX.Element;
export declare function useOverlayContext(): OverlayContextValue;
export declare function useParentBranch(): OverlayBranchInfo | null;
export interface OverlayBranchProviderProps {
    readonly branchId: string;
    readonly layer: OverlayLayer;
    readonly children: ReactNode;
}
/**
 * 자기 subtree에게 "너희 부모 branch는 나"라고 알린다. portal을 건너도 React context는
 * 따라가므로, DOM 조상 관계가 끊겨도 lineage는 유지된다 — 이것이 branch registry가
 * `contains()` 단독 판정보다 정확한 이유다.
 */
export declare function OverlayBranchProvider({ branchId, layer, children, }: OverlayBranchProviderProps): JSX.Element;
//# sourceMappingURL=overlay-provider.d.ts.map