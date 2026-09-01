"use client";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useId, } from "react";
import { useAnchoredContext } from "../anchored/context.js";
function useItemState(disabled, busy, disabledReason) {
    const { disabledItems } = useAnchoredContext("ActionMenuItem");
    const reasonId = `louis-menu-reason-${useId()}`;
    const skip = disabled && disabledItems === "skip";
    const announce = disabled && disabledItems === "announce";
    const showReason = announce && disabledReason !== undefined;
    return {
        blocked: disabled || busy,
        describedBy: showReason ? reasonId : undefined,
        reasonNode: showReason ? (_jsx("span", { id: reasonId, className: "louis-visually-hidden", children: disabledReason })) : null,
        skip,
        announce,
    };
}
export function ActionMenuItem({ danger = false, disabled = false, disabledReason, busy = false, closeOnSelect, onSelect, role = "menuitem", checked, className, children, ref, ...rest }) {
    const context = useAnchoredContext("ActionMenuItem");
    const state = useItemState(disabled, busy, disabledReason);
    const shouldClose = closeOnSelect ?? context.closeOnSelect;
    return (_jsxs("button", { ...rest, ref: ref, type: "button", role: role, "data-louis-menu-item": "", className: ["louis-menu__item", "louis-focus-ring", className].filter(Boolean).join(" "), ...(danger ? { "data-tone": "danger" } : {}), ...(state.skip ? { disabled: true } : {}), ...(state.announce || busy ? { "aria-disabled": true } : {}), ...(busy ? { "aria-busy": true } : {}), ...(checked === undefined ? {} : { "aria-checked": checked }), ...(state.describedBy === undefined
            ? {}
            : { "aria-describedby": state.describedBy }), onClick: (event) => {
            if (state.blocked) {
                // aria-disabled는 브라우저가 막아주지 않는다. 전파까지 멈춰야 상위 핸들러도 안 탄다.
                event.preventDefault();
                event.stopPropagation();
                return;
            }
            context.overlay.activate(event.nativeEvent, () => onSelect?.(event), shouldClose);
        }, children: [checked === undefined ? null : (_jsx("span", { className: "louis-menu__item-indicator", "aria-hidden": "true", children: "\u2713" })), busy ? _jsx("span", { className: "louis-menu__spinner", "aria-hidden": "true" }) : null, _jsx("span", { className: "louis-menu__item-label", "data-louis-menu-item-label": "", children: children }), state.reasonNode] }));
}
export function ActionMenuLinkItem({ href, danger = false, disabled = false, disabledReason, closeOnSelect, onSelect, className, children, ref, ...rest }) {
    const context = useAnchoredContext("ActionMenuLinkItem");
    const state = useItemState(disabled, false, disabledReason);
    const shouldClose = closeOnSelect ?? context.closeOnSelect;
    // `<a>`에는 네이티브 disabled가 없다. skip 전략에서 탐색 제외를 표현할 수단이 data 속성뿐이다.
    const skipProps = state.skip
        ? { "data-louis-menu-skip": "", "aria-disabled": true }
        : {};
    return (_jsxs("a", { ...rest, ...skipProps, ref: ref, role: "menuitem", "data-louis-menu-item": "", className: ["louis-menu__item", "louis-focus-ring", className].filter(Boolean).join(" "), ...(state.skip ? {} : { href }), ...(danger ? { "data-tone": "danger" } : {}), ...(state.announce ? { "aria-disabled": true } : {}), ...(state.describedBy === undefined
            ? {}
            : { "aria-describedby": state.describedBy }), onClick: (event) => {
            if (state.blocked) {
                event.preventDefault();
                event.stopPropagation();
                return;
            }
            context.overlay.activate(event.nativeEvent, () => onSelect?.(event), shouldClose);
        }, onKeyDown: (event) => {
            // `<a>`의 Space는 click을 합성하지 않고 페이지를 스크롤한다. menuitem은 양쪽 활성화를
            // 요구하므로 여기서만 keydown이 필요하다. click을 한 번 합성해 위 onClick으로 보낸다.
            if (event.key !== " " || event.repeat)
                return;
            event.preventDefault();
            if (state.blocked)
                return;
            event.currentTarget.click();
        }, children: [_jsx("span", { className: "louis-menu__item-label", "data-louis-menu-item-label": "", children: children }), state.reasonNode] }));
}
//# sourceMappingURL=item.js.map