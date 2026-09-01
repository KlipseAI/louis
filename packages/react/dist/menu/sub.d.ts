import { type JSX, type ReactNode } from "react";
import type { OverlayOpenChangeHandler } from "../anchored/types.js";
import { type ActionMenuContentProps } from "./action-menu.js";
export interface ActionMenuSubProps {
    readonly open?: boolean;
    readonly defaultOpen?: boolean;
    readonly onOpenChange?: OverlayOpenChangeHandler;
    readonly disabled?: boolean;
    readonly children?: ReactNode;
}
export declare function ActionMenuSub({ open, defaultOpen, onOpenChange, disabled, children, }: ActionMenuSubProps): JSX.Element;
export interface ActionMenuSubTriggerProps {
    readonly children?: ReactNode;
    readonly danger?: boolean;
    readonly disabled?: boolean;
    readonly className?: string;
    readonly "data-testid"?: string;
}
export declare function ActionMenuSubTrigger({ children, danger, disabled, className, ...rest }: ActionMenuSubTriggerProps): JSX.Element;
export interface ActionMenuSubContentProps extends ActionMenuContentProps {
}
export declare function ActionMenuSubContent(props: ActionMenuSubContentProps): JSX.Element | null;
//# sourceMappingURL=sub.d.ts.map