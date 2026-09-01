import { type RefObject } from "react";
import type { OverlayDismissReason, OverlayPresenceState } from "./types.js";
/**
 * exit 시간을 **resolved recipe에서 읽는다.** 토큰 이름을 여기 하드코딩하지 않는 것이 핵심이다.
 *
 * 그래야 컴포넌트 CSS의 `@media (prefers-reduced-motion: reduce)`가 timer에 자동으로 반영되고,
 * 시각 transition과 unmount가 서로 어긋날 수 없다. 두 값이 다른 곳에서 오면 어긋나도 테스트가
 * 알 수 없다 — 각각을 확인할 뿐 **일치**를 확인하지 않기 때문이다. (DS-D-0011 결정 3)
 */
export declare function readExitDuration(node: Element): number;
export interface OverlayPresenceOptions {
    readonly open: boolean;
    readonly nodeRef: RefObject<HTMLElement | null>;
    readonly onOpenChange: (open: boolean, reason: OverlayDismissReason) => void;
    /** closing 진입과 **같은 tick**에 동기 실행된다. seal과 stack 반납이 여기 붙는다. */
    readonly onClosingSync: (reason: OverlayDismissReason) => void;
    /** unmount 직전, root가 아직 DOM에 있는 상태에서 paint 전에 실행된다. focus return이 여기다. */
    readonly onBeforeUnmount: (reason: OverlayDismissReason) => void;
    /** open이 false→true로 전이할 때. openSeq 채번과 unseal이 여기다. */
    readonly onOpening: () => void;
}
export interface OverlayPresence {
    readonly state: OverlayPresenceState;
    readonly mounted: boolean;
    readonly requestClose: (reason: OverlayDismissReason) => void;
    /** 위치가 확정되면 호출한다. 이 전까지 패널은 보이지도 hit-test되지도 않는다. */
    readonly markPlaced: () => void;
}
export declare function useOverlayPresence(options: OverlayPresenceOptions): OverlayPresence;
//# sourceMappingURL=presence.d.ts.map