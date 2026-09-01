import { type HTMLAttributes, type JSX, type ReactNode, type Ref } from "react";
/** 장식 행을 `menuitem`으로 만들지 않는다. group label은 이름이지 항목이 아니다. */
export interface ActionMenuGroupProps extends Omit<HTMLAttributes<HTMLDivElement>, "role"> {
    readonly label?: ReactNode;
    readonly ref?: Ref<HTMLDivElement>;
}
export declare function ActionMenuGroup({ label, children, ref, ...rest }: ActionMenuGroupProps): JSX.Element;
export interface ActionMenuSeparatorProps extends Omit<HTMLAttributes<HTMLDivElement>, "role"> {
    readonly ref?: Ref<HTMLDivElement>;
}
export declare function ActionMenuSeparator({ className, ref, ...rest }: ActionMenuSeparatorProps): JSX.Element;
//# sourceMappingURL=group.d.ts.map