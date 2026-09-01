import { type HTMLAttributes, type JSX, type Ref } from "react";
import type { AnchoredPanelLabel, AnchoredRootProps, AnchoredTriggerProps } from "../anchored/types.js";
/**
 * CompositePopover — `role="dialog"` recipe.
 *
 * action menu와 달리 roving을 쓰지 않는다. 자손이 자연 Tab 순서로 tabbable이고, 초기 focus는
 * panel root다. panel이 focus를 가지면 다음 Tab이 실제로 자손으로 들어가고 그때 패널 이름이
 * 먼저 읽힌다 — 비모달 dialog에서 패널 내용에 도달하는 가장 신뢰 가능한 경로다.
 */
export type CompositePopoverPanelLabel = AnchoredPanelLabel;
export interface CompositePopoverProps extends AnchoredRootProps {
    /** 기본값은 `{ from: "title" }`이며 Title을 사실상 필수로 만든다. */
    readonly panelLabel?: CompositePopoverPanelLabel;
}
export declare function CompositePopover({ panelLabel, ...rest }: CompositePopoverProps): JSX.Element;
export interface CompositePopoverTriggerProps extends AnchoredTriggerProps {
}
export declare function CompositePopoverTrigger(props: CompositePopoverTriggerProps): JSX.Element;
export interface CompositePopoverContentProps extends Omit<HTMLAttributes<HTMLDivElement>, "id" | "role" | "tabIndex" | "aria-label" | "aria-labelledby"> {
}
export declare function CompositePopoverContent({ className, children, ...rest }: CompositePopoverContentProps): JSX.Element | null;
export interface CompositePopoverTitleProps extends Omit<HTMLAttributes<HTMLElement>, "id"> {
    readonly as?: "h2" | "h3" | "h4";
    readonly ref?: Ref<HTMLHeadingElement>;
}
export declare function CompositePopoverTitle({ as: Tag, className, children, ref, ...rest }: CompositePopoverTitleProps): JSX.Element;
//# sourceMappingURL=composite-popover.d.ts.map