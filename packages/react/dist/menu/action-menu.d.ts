import { type HTMLAttributes, type JSX } from "react";
import type { AnchoredPanelLabel, AnchoredRootProps, AnchoredTriggerProps, DisabledItemStrategy } from "../anchored/types.js";
/**
 * ActionMenu — `role="menu"` recipe.
 *
 * 소유하는 것은 roving·방향키·typeahead·aria 배선뿐이다. Escape 라우팅, 바깥 판정,
 * activation exactly-once, presence, focus 복원 시점은 primitive가 이미 소유한다.
 */
export type ActionMenuPanelLabel = AnchoredPanelLabel;
export interface ActionMenuProps extends AnchoredRootProps {
    readonly panelLabel: ActionMenuPanelLabel;
    /** menu 단위 단일 전략. item이 개별로 고르지 않는다. */
    readonly disabledItems?: DisabledItemStrategy;
    readonly typeaheadLocale?: string;
}
export declare function ActionMenu({ panelLabel, disabledItems, typeaheadLocale, ...rest }: ActionMenuProps): JSX.Element;
export interface ActionMenuTriggerProps extends AnchoredTriggerProps {
}
export declare function ActionMenuTrigger(props: ActionMenuTriggerProps): JSX.Element;
export interface ActionMenuContentProps extends Omit<HTMLAttributes<HTMLDivElement>, "id" | "role" | "tabIndex" | "aria-label" | "aria-labelledby" | "onKeyDown"> {
}
interface ActionMenuContentInternalProps extends ActionMenuContentProps {
    /** submenu의 panel이면 ArrowLeft가 자기를 닫는다. 최상위 menu에서는 아무 일도 하지 않는다. */
    readonly isSubmenu?: boolean;
}
export declare function ActionMenuContent({ className, children, isSubmenu, ...rest }: ActionMenuContentInternalProps): JSX.Element | null;
export {};
//# sourceMappingURL=action-menu.d.ts.map