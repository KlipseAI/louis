import { type JSX, type ReactNode } from "react";
/**
 * `asChild` 합성.
 *
 * 새 의존성을 들이지 않고 직접 쓰는 이유는, 필요한 것이 "단일 자식에 props를 합쳐 복제한다"
 * 하나뿐이고 그 규칙(어느 쪽 handler가 먼저인가, className을 잇는가 덮는가, ref를 합치는가)이
 * **우리 계약**이기 때문이다. 라이브러리를 쓰면 그 규칙이 구현 세부에 위임된다.
 *
 * 합성 규칙은 셋이다.
 *
 * 1. `on*` handler는 **자식 것을 먼저** 부르고, 자식이 `defaultPrevented`를 세우면 우리 것을 건너뛴다.
 *    호출부가 자기 동작을 우선할 수 있어야 asChild가 escape hatch로 기능한다.
 * 2. `className`은 잇고 `style`은 병합한다. 어느 쪽도 덮지 않는다.
 * 3. `ref`는 둘 다 호출한다.
 *
 * 그 외 props는 slot이 이긴다 — role·aria·id는 계약이지 기본값이 아니다.
 */
type UnknownProps = Record<string, unknown>;
export interface SlotProps {
    readonly children?: ReactNode;
}
export declare function mergeSlotProps(slotProps: UnknownProps, childProps: UnknownProps): UnknownProps;
/**
 * 단일 자식에 props를 합쳐 복제한다. 자식이 정확히 하나의 element가 아니면 던진다 —
 * 조용히 첫 자식만 쓰면 나머지가 사라진 것을 아무도 모른다.
 */
export declare function Slot({ children, ...slotProps }: SlotProps & UnknownProps): JSX.Element;
export {};
//# sourceMappingURL=slot.d.ts.map