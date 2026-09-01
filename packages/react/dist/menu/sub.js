"use client";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { createContext, useCallback, useContext, useEffect, useId, useMemo, useRef, useState, } from "react";
import { OverlayAnchor } from "../overlay/positioner.js";
import { AnchoredRoot } from "../anchored/root.js";
import { useAnchoredContext } from "../anchored/context.js";
import { ActionMenuContent } from "./action-menu.js";
import { resolveMenuInitialFocus } from "./roving.js";
import { useSubmenuRegistry } from "./submenu-registry.js";
const SubContext = createContext(null);
function useSubContext(part) {
    const value = useContext(SubContext);
    if (value === null) {
        throw new Error(`${part}은(는) ActionMenuSub 안에서만 사용할 수 있습니다.`);
    }
    return value;
}
export function ActionMenuSub({ open, defaultOpen = false, onOpenChange, disabled = false, children, }) {
    const parent = useAnchoredContext("ActionMenuSub");
    const registry = useSubmenuRegistry();
    const subTriggerId = `louis-submenu-${useId()}`;
    const isControlled = open !== undefined;
    const [uncontrolled, setUncontrolled] = useState(defaultOpen);
    const actualOpen = isControlled ? open : uncontrolled;
    const handleRef = useRef(null);
    const intentRef = useRef("first");
    const setOpen = useCallback((next) => {
        if (!isControlled)
            setUncontrolled(next);
    }, [isControlled, setUncontrolled]);
    useEffect(() => {
        if (registry === null)
            return undefined;
        return registry.register(subTriggerId, () => setOpen(true));
    }, [registry, subTriggerId, setOpen]);
    /**
     * 부모가 닫히기 시작하면 자식도 닫는다. reason은 **`route`** 다.
     *
     * `trigger`나 `programmatic`이면 복원 대상이 SubTrigger가 되는데, 그 노드는 곧 inert가 될
     * 부모 패널 안에 있다. 부모는 이미 focus를 자기 trigger로 옳게 돌려놓은 뒤이므로 자식이
     * 그것을 도로 빼앗고, 브라우저가 곧 놓아 focus가 body로 떨어진다. `route`만 이것을 막는다.
     */
    const parentLeaving = parent.overlay.state === "closing" || parent.overlay.state === "closed";
    useEffect(() => {
        if (!parentLeaving)
            return;
        handleRef.current?.close("route");
    }, [parentLeaving]);
    const resolveInitialFocus = useCallback((panel) => resolveMenuInitialFocus(panel, intentRef.current), []);
    const subContext = useMemo(() => ({
        subTriggerId,
        setOpen,
        open: actualOpen,
        disabled,
        notifyOpened: () => registry?.notifyOpened(subTriggerId),
    }), [subTriggerId, setOpen, actualOpen, disabled, registry]);
    return (_jsx(SubContext.Provider, { value: subContext, children: _jsx(AnchoredRoot, { kind: "action-menu", panelLabel: { from: "trigger" }, placement: "right", align: "start", disabled: disabled, open: actualOpen, ref: handleRef, resolveInitialFocus: resolveInitialFocus, onOpenChange: (nextOpen, reason) => {
                if (!nextOpen)
                    setOpen(false);
                onOpenChange?.(nextOpen, reason);
            }, children: children }) }));
}
export function ActionMenuSubTrigger({ children, danger = false, disabled = false, className, ...rest }) {
    const sub = useSubContext("ActionMenuSubTrigger");
    // 이 문맥은 **submenu 자신의 것**이다. SubTrigger가 그 overlay의 trigger이기 때문이다.
    const overlayContext = useAnchoredContext("ActionMenuSubTrigger");
    const blocked = disabled || sub.disabled;
    return (
    // SubTrigger가 자기 submenu의 anchor다. 감싸지 않으면 positioner가 기준점을 못 찾아
    // 배치가 끝나지 않고, 패널은 opening에 머물러 **보이지도 않고 focus도 가지 않는다.**
    _jsx(OverlayAnchor, { asChild: true, children: _jsxs("button", { ...rest, type: "button", id: sub.subTriggerId, role: "menuitem", "data-louis-menu-item": "", "data-louis-menu-subtrigger": "", "aria-haspopup": "menu", "aria-expanded": sub.open, ...(blocked ? { "aria-disabled": true } : {}), ...(danger ? { "data-tone": "danger" } : {}), className: ["louis-menu__item", "louis-focus-ring", className].filter(Boolean).join(" "), ref: (node) => {
                // return focus 대상이다. 채우지 않으면 primitive가 부모 패널의 **첫 항목**으로
                // 되돌려, 사용자가 있던 자리(내보내기)가 아니라 엉뚱한 곳으로 focus가 간다.
                overlayContext.triggerRef.current = node;
                // 자기 branch의 member이기도 하다. 그래야 SubTrigger 클릭이 바깥으로 판정되지 않는다.
                overlayContext.overlay.registerMember(node);
            }, onClick: (event) => {
                event.preventDefault();
                if (blocked) {
                    event.stopPropagation();
                    return;
                }
                // 토글이 아니라 **멱등 열기**다. ArrowRight로 연 직후 Enter가 닫으면 파괴적이다.
                sub.setOpen(true);
            }, children: [_jsx("span", { className: "louis-menu__item-label", "data-louis-menu-item-label": "", children: children }), _jsx("span", { className: "louis-menu__item-trailing", "aria-hidden": "true", children: "\u203A" })] }) }));
}
export function ActionMenuSubContent(props) {
    const sub = useSubContext("ActionMenuSubContent");
    const context = useAnchoredContext("ActionMenuSubContent");
    const state = context.overlay.state;
    // 배치가 끝나 열렸음을 부모에게 알린다. 그전까지 부모는 세로 이동을 삼키고 있다.
    useEffect(() => {
        if (state === "open")
            sub.notifyOpened();
    }, [state, sub]);
    return _jsx(ActionMenuContent, { ...props, isSubmenu: true });
}
//# sourceMappingURL=sub.js.map