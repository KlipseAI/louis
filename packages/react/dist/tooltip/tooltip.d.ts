import { type JSX, type ReactElement, type ReactNode } from "react";
import { type OverlayAlign, type OverlaySide } from "../overlay/positioner.js";
export interface TooltipProps {
    /** 설명. 상호작용 요소를 넣지 않는다 — tooltip 표면은 포인터를 받지 않는다. */
    readonly content: ReactNode;
    /** 선호 방향. 공간이 없으면 뒤집힌다. */
    readonly side?: OverlaySide;
    readonly align?: OverlayAlign;
    /** 포인터 진입 후 열리기까지. focus로 열 때는 지연하지 않는다. */
    readonly openDelay?: number;
    /** tooltip을 띄우지 않는다. trigger의 동작은 그대로다. */
    readonly disabled?: boolean;
    /** 상호작용 가능한 요소 하나. tooltip은 감싸지 않고 속성만 붙인다. */
    readonly children: ReactElement<Record<string, unknown>>;
}
/**
 * design/components/tooltip.md의 계약을 구현한다.
 *
 * overlay primitive에서 **위치 계산과 portal만** 쓴다. focus scope·inert·scroll lock·dismissable
 * layer는 쓰지 않는다 — tooltip은 focus를 가져가지 않고 바깥 클릭을 삼키지도 않으므로, 그것들을
 * 붙이면 없는 문제를 위해 배경을 잠그게 된다.
 *
 * trigger를 감싸지 않고 `cloneElement`로 속성만 붙인다. 래퍼를 두면 그 래퍼가 레이아웃에 끼어들어
 * 호출부의 flex/grid 계산이 조용히 달라진다.
 */
export declare function Tooltip({ content, side, align, openDelay, disabled, children, }: TooltipProps): JSX.Element;
//# sourceMappingURL=tooltip.d.ts.map