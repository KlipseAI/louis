import { type AnchorHTMLAttributes, type ButtonHTMLAttributes, type JSX, type MouseEvent, type Ref } from "react";
/**
 * menu item.
 *
 * 활성화 경로는 **하나뿐이다** — 브라우저가 합성한 `click`이 `onClick`으로 오고 그것이
 * primitive의 `activate()`를 부른다. keydown으로 `.click()`을 흉내 내지 않는다. 그 둘은 서로
 * 다른 이벤트 객체라 중복 차단 WeakSet이 막지 못하고, 결과는 한 번의 Enter로 두 번 실행이다.
 * `<a href>`만 예외인데, `<a>`의 Space는 click을 합성하지 않고 페이지를 스크롤하기 때문이다.
 */
interface ActionMenuItemBase extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "type" | "role" | "onClick" | "disabled" | "aria-disabled" | "aria-checked" | "aria-busy" | "tabIndex" | "onSelect"> {
    readonly danger?: boolean;
    /** 표기 방식은 Root의 `disabledItems` 전략이 결정한다. item이 고르지 않는다. */
    readonly disabled?: boolean;
    /** announce 전략에서 읽히는 이유. */
    readonly disabledReason?: string;
    /** 중복 실행 차단 + `aria-busy`. **메뉴는 닫지 않는다.** */
    readonly busy?: boolean;
    readonly closeOnSelect?: boolean;
    readonly onSelect?: (event: MouseEvent<HTMLElement>) => void;
    readonly ref?: Ref<HTMLButtonElement>;
}
/**
 * role과 checked를 분리할 수 없게 묶는다. `menuitem` + `aria-checked`는 허용되지 않는 조합이라
 * 시각 체크 표시와 접근성 상태가 갈린다.
 */
export type ActionMenuItemProps = (ActionMenuItemBase & {
    readonly role?: "menuitem";
    readonly checked?: never;
}) | (ActionMenuItemBase & {
    readonly role: "menuitemcheckbox" | "menuitemradio";
    readonly checked: boolean;
});
export declare function ActionMenuItem({ danger, disabled, disabledReason, busy, closeOnSelect, onSelect, role, checked, className, children, ref, ...rest }: ActionMenuItemProps): JSX.Element;
export interface ActionMenuLinkItemProps extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "role" | "onClick" | "onKeyDown" | "onSelect" | "aria-disabled" | "tabIndex"> {
    readonly href: string;
    readonly danger?: boolean;
    readonly disabled?: boolean;
    readonly disabledReason?: string;
    readonly closeOnSelect?: boolean;
    readonly onSelect?: (event: MouseEvent<HTMLAnchorElement>) => void;
    readonly ref?: Ref<HTMLAnchorElement>;
}
export declare function ActionMenuLinkItem({ href, danger, disabled, disabledReason, closeOnSelect, onSelect, className, children, ref, ...rest }: ActionMenuLinkItemProps): JSX.Element;
export {};
//# sourceMappingURL=item.d.ts.map