import { type HTMLAttributes, type JSX, type ReactNode, type Ref, type RefObject } from "react";
import { type OverlayIds } from "./ids.js";
import { type OverlayAlign, type OverlaySide } from "./positioner.js";
import type { OverlayDismissReason, OverlayInitialFocus, OverlayLayer, OverlayMode, OverlayPresenceState } from "./types.js";
/**
 * 위의 primitive 전부를 하나로 묶어 Menu·Dialog가 **정책만 주입**하게 한다.
 *
 * 순서 계약(§3.1)이 여기 한 곳에 있다. 컴포넌트가 순서를 다시 쓰지 못하게 하는 것이
 * DS-D-0003의 "순서와 정책은 Klipse가 소유한다"의 실제 구현이다.
 */
export interface UseOverlayOptions {
    readonly open: boolean;
    readonly mode: OverlayMode;
    readonly layer: OverlayLayer;
    readonly onOpenChange: (open: boolean, reason: OverlayDismissReason) => void;
    /** 기본 true. Dialog dismissible=false가 이것을 끈다. */
    readonly closeOnEscape?: boolean;
    /** busy 등으로 닫기를 잠근다. 닫지 않고 안내만 하며 아래 layer로 넘기지도 않는다. */
    readonly dismissLocked?: boolean;
    readonly initialFocus?: OverlayInitialFocus;
    readonly returnFocus?: RefObject<HTMLElement | null>;
    readonly triggerRef?: RefObject<HTMLElement | null>;
    /** 기본 false. 바깥 클릭이 배경 액션을 실행하지 않는다. */
    readonly outsidePointerPassthrough?: boolean;
    /** dismiss가 막혔을 때의 통지. Dialog가 안내 문구를 띄우는 지점이다. */
    readonly onDismissBlocked?: (reason: OverlayDismissReason) => void;
    /**
     * true면 위치 확정을 호출부가 알린다(`markPlaced`). positioning을 쓰는 경우다.
     * 기본값은 false이고, 마운트 직후 같은 layout pass에서 `open`으로 넘어간다.
     */
    readonly deferPlacement?: boolean;
    /**
     * anchor 기준으로 배치한다. 호출부가 `OverlayPositioner`로 Trigger와 Surface를 함께 감싸고
     * `OverlayAnchor`로 anchor를 지정해야 한다.
     */
    readonly anchored?: boolean;
    readonly side?: OverlaySide;
    readonly align?: OverlayAlign;
}
export interface OverlaySurfaceProps extends HTMLAttributes<HTMLDivElement> {
    readonly children?: ReactNode;
    /**
     * 패널 root 노드를 받는다. primitive가 자기 ref를 덮어쓰지 않고 **둘 다** 호출한다.
     * 이것이 없으면 recipe가 패널 노드를 잡을 방법이 id로 다시 질의하는 것뿐인데,
     * 그 질의는 상태 전이마다 다시 해야 하고 실패해도 조용하다.
     */
    readonly ref?: Ref<HTMLDivElement>;
}
export type OverlaySurfaceComponent = (props: OverlaySurfaceProps) => JSX.Element | null;
export interface UseOverlayResult {
    readonly branchId: string;
    readonly state: OverlayPresenceState;
    readonly mounted: boolean;
    readonly ids: OverlayIds;
    readonly requestClose: (reason: OverlayDismissReason) => void;
    readonly markPlaced: () => void;
    /**
     * item activation 전용. run()이 먼저, 그다음 select close. 둘 다 정확히 한 번.
     * closing 중에는 아무것도 실행되지 않는다.
     */
    readonly activate: (event: Pick<MouseEvent, "preventDefault">, run: () => void, closeOnSelect: boolean) => void;
    /** 3rd-party portal(앱이 만든 Listbox 등)을 이 branch의 내부로 등록한다. */
    readonly registerMember: (node: Element | null) => void;
    /** portal · focus · dismiss · root 속성을 순서대로 감싼 표면. */
    readonly Surface: OverlaySurfaceComponent;
}
export declare function useOverlay(options: UseOverlayOptions): UseOverlayResult;
//# sourceMappingURL=use-overlay.d.ts.map