import { DismissableLayer } from "@radix-ui/react-dismissable-layer";
import { type ComponentPropsWithoutRef, type JSX, type Ref } from "react";
import type { LayerRecord, OverlayStore } from "./overlay-store.js";
import type { OverlayDismissReason } from "./types.js";
/**
 * 바깥 상호작용을 감지해 **정책에만 위임**한다. 스스로 닫지 않는다.
 *
 * 하부 유틸에 `onDismiss`를 넘기지 않는 것이 이 파일의 핵심이다. 넘기면 그 유틸이 Escape를
 * 삼키고 자체 stack으로 라우팅하는데, 그 stack은 등록(=effect) 순서를 쓰므로 같은 commit
 * 중첩 마운트에서 부모가 최상위가 된다. `onDismiss` 없이 쓰면 Escape는 통과하고 우리 store가
 * 소유한다.
 *
 * 순서 계약(§menu-popover.md "선택이 닫힘보다 먼저"):
 *
 *   pointerdown(바깥) → 아무것도 닫지 않는다. DOM도 그대로 둔다.
 *   click(바깥)       → 여기서 commit하고, 그 click이 배경에 도달하기 전에 소비한다.
 *
 * pointerdown에서 닫으면 그 좌표의 hit-test 대상이 사라져 후속 click이 엉뚱한 곳으로 가고,
 * pointerdown에서 preventDefault하면 click 자체가 사라져 activation이 0회가 된다.
 * 두 실패 모두 규범이 금지한 "열리지만 선택되지 않음"이다.
 */
type DismissableLayerProps = ComponentPropsWithoutRef<typeof DismissableLayer>;
export interface OverlayDismissRegionProps extends Omit<DismissableLayerProps, "onDismiss" | "onPointerDownOutside" | "onFocusOutside" | "onInteractOutside"> {
    readonly store: OverlayStore;
    /**
     * 값이 아니라 getter다. record는 layout effect에서 만들어지므로 렌더 시점 값으로 넘기면
     * 마운트 직후 한 커밋 동안 null이 되고, 그 창에 들어온 바깥 클릭이 게이트를 그냥 통과한다.
     * 그러면 배경 액션이 실행되는데, 증상이 타이밍에 따라만 나타나 재현이 어렵다.
     */
    readonly getRecord: () => LayerRecord | null;
    readonly branchId: string;
    readonly requestClose: (reason: OverlayDismissReason) => void;
    /** 바깥 클릭을 배경으로 통과시킬지. 기본 false — 배경 액션을 실행하지 않는다. */
    readonly outsidePointerPassthrough?: boolean;
    /** pointer capture 중이면 바깥 판정을 하지 않는다. drag가 패널 밖으로 나가는 정상 경우다. */
    readonly pointerCaptureActive?: boolean;
    readonly ref?: Ref<HTMLDivElement>;
}
export declare function OverlayDismissRegion({ store, getRecord, branchId, requestClose, outsidePointerPassthrough, pointerCaptureActive, children, ...rest }: OverlayDismissRegionProps): JSX.Element;
export {};
//# sourceMappingURL=dismiss-region.d.ts.map