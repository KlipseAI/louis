import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * design/components/button.md의 계약을 구현한다.
 *
 * 활성화는 네이티브 `<button>`에 맡긴다. pointer click, Enter, Space가 각각 정확히 한 번
 * 실행되는 것은 브라우저가 보장하며, 여기서 keydown으로 클릭을 흉내 내면 중복 실행이 된다.
 *
 * `loading`은 네이티브 `disabled`를 쓰지 않는다. 네이티브 disabled는 현재 focus를 제거하는데
 * 규범이 이를 금지하기 때문이다. 대신 `aria-disabled`로 표시하고 activation을 명시적으로 막는다.
 */
export function Button({ variant = "primary", size = "md", loading = false, leftIcon, rightIcon, type = "button", className, children, disabled, onClick, ...rest }) {
    const ariaDisabled = rest["aria-disabled"];
    const blocked = loading === true || ariaDisabled === true || ariaDisabled === "true";
    const classes = ["louis-button", "louis-focus-ring", "louis-hit-target", className]
        .filter(Boolean)
        .join(" ");
    return (_jsxs("button", { ...rest, type: type, className: classes, disabled: disabled, "data-variant": variant, "data-size": size, "data-loading": loading ? "true" : undefined, "data-left-icon": leftIcon !== undefined && !loading ? "true" : undefined, "data-right-icon": rightIcon !== undefined ? "true" : undefined, "aria-busy": loading ? true : undefined, "aria-disabled": blocked ? true : undefined, onClick: (event) => {
            if (blocked) {
                // aria-disabled는 브라우저가 막아주지 않는다. click과 keyboard activation을
                // 모두 여기서 차단한다 — Enter/Space도 결국 click으로 도달한다.
                event.preventDefault();
                event.stopPropagation();
                return;
            }
            onClick?.(event);
        }, children: [loading ? _jsx("span", { className: "louis-button__spinner", "aria-hidden": "true" }) : null, leftIcon !== undefined && !loading ? (_jsx("span", { className: "louis-button__icon", "aria-hidden": "true", children: leftIcon })) : null, _jsx("span", { className: "louis-button__label", children: children }), rightIcon !== undefined ? (_jsx("span", { className: "louis-button__icon", "aria-hidden": "true", children: rightIcon })) : null] }));
}
//# sourceMappingURL=button.js.map