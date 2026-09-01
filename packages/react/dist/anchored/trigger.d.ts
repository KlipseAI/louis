import { type JSX } from "react";
import type { AnchoredTriggerProps } from "./types.js";
/**
 * 두 recipe 공통 Trigger 배선.
 *
 * 소유하는 것: aria 4종, 토글, `ArrowDown`/`ArrowUp` 열기와 그 intent, `disabled`,
 * anchor 등록, **branch member 등록**.
 *
 * branch member 등록이 중요한 이유: 등록하지 않으면 열린 상태에서 trigger를 다시 누르는 것이
 * "바깥 클릭"으로 판정돼 reason이 `outside`가 된다. 규범은 그 경로를 `trigger`로 정하고,
 * 두 reason은 focus 정책이 정반대다(`outside`는 포커스를 옮기지 않고 `trigger`는 되돌린다).
 */
export interface AnchoredTriggerOwnProps extends AnchoredTriggerProps {
    readonly part: string;
}
export declare function AnchoredTrigger({ part, asChild, onClick, onKeyDown, children, ref, ...rest }: AnchoredTriggerOwnProps): JSX.Element;
//# sourceMappingURL=trigger.d.ts.map