import { type JSX } from "react";
import { type AnchoredKind } from "./context.js";
import type { AnchoredPanelLabel, AnchoredRootProps, DisabledItemStrategy } from "./types.js";
/**
 * 두 recipe가 공유하는 Root.
 *
 * 소유하는 것: controlled/uncontrolled 정규화, `setOpen(next, reason)` 단일 통로,
 * **열림 통지**(primitive는 닫힘만 통지한다), `OverlayHandle`, 초기 focus 정책의 게터 ref.
 *
 * 소유하지 않는 것: 순서와 정책 전부. Escape 라우팅·바깥 판정·presence·focus 복원 시점은
 * primitive가 이미 소유하며 여기서 다시 쓰지 않는다.
 */
export interface AnchoredRootOwnProps extends AnchoredRootProps {
    readonly kind: AnchoredKind;
    readonly panelLabel: AnchoredPanelLabel;
    readonly disabledItems?: DisabledItemStrategy;
    readonly typeaheadLocale?: string;
    /**
     * 초기 focus 대상을 패널에서 계산한다. 호출 시점에 패널은 이미 열려 있다.
     * 후보가 없으면 패널 자신을 돌려주는 것이 §Focus의 "강등" 규칙이다.
     */
    readonly resolveInitialFocus: (panel: HTMLElement) => HTMLElement | null;
}
export declare function AnchoredRoot({ kind, panelLabel, disabledItems, typeaheadLocale, resolveInitialFocus, open, defaultOpen, onOpenChange, placement, align, disabled, closeOnSelect, children, ref, }: AnchoredRootOwnProps): JSX.Element;
//# sourceMappingURL=root.d.ts.map