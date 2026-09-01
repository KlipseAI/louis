"use client";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useCallback, useEffect, useMemo, useRef, } from "react";
import { AnchoredRoot } from "../anchored/root.js";
import { AnchoredTrigger } from "../anchored/trigger.js";
import { useAnchoredContext } from "../anchored/context.js";
import { resolvePanelLabel } from "../anchored/label.js";
import { handleMenuKeyDown } from "./keyboard.js";
import { activeItem, isNavigable, menuItems, recoverFocus, resolveMenuInitialFocus, syncRoving, } from "./roving.js";
import { createSubmenuRegistry, SubmenuRegistryProvider, } from "./submenu-registry.js";
import { createTypeahead } from "./typeahead.js";
export function ActionMenu({ panelLabel, disabledItems = "announce", typeaheadLocale, ...rest }) {
    // 초기 focus 대상은 열림 의도(ArrowUp이면 마지막)를 읽어 계산한다.
    const intentRef = useRef("first");
    const resolveInitialFocus = useCallback((panel) => resolveMenuInitialFocus(panel, intentRef.current), []);
    return (_jsxs(AnchoredRoot, { ...rest, kind: "action-menu", panelLabel: panelLabel, disabledItems: disabledItems, ...(typeaheadLocale === undefined ? {} : { typeaheadLocale }), resolveInitialFocus: resolveInitialFocus, children: [_jsx(IntentBridge, { intentRef: intentRef }), rest.children] }));
}
/** Root가 소유한 openIntent를 ActionMenu의 로컬 ref로 옮긴다. */
function IntentBridge({ intentRef, }) {
    const { openIntentRef, open } = useAnchoredContext("ActionMenu");
    if (open)
        intentRef.current = openIntentRef.current;
    return null;
}
export function ActionMenuTrigger(props) {
    return _jsx(AnchoredTrigger, { ...props, part: "ActionMenuTrigger" });
}
export function ActionMenuContent({ className, children, isSubmenu = false, ...rest }) {
    const context = useAnchoredContext("ActionMenuContent");
    const { overlay, panelRef, triggerId, panelLabel, typeaheadLocale } = context;
    const { Surface, state } = overlay;
    const typeahead = useMemo(() => createTypeahead(typeaheadLocale), [typeaheadLocale]);
    const lastIndexRef = useRef(0);
    const pendingEntryRef = useRef(null);
    const promotedRef = useRef(false);
    const syncingRef = useRef(false);
    const sync = useCallback(() => {
        const panel = panelRef.current;
        if (panel === null)
            return;
        syncingRef.current = true;
        syncRoving(panel);
        syncingRef.current = false;
    }, [panelRef]);
    const registry = useMemo(() => createSubmenuRegistry(pendingEntryRef), []);
    const keyContext = useMemo(() => ({
        typeahead,
        lastIndexRef,
        pendingEntryRef,
        isSubmenu,
        openSubmenu: (id) => registry.open(id),
        requestClose: (reason) => overlay.requestClose(reason),
    }), [typeahead, isSubmenu, registry, overlay]);
    // native 리스너를 쓴다. React 이벤트는 DOM이 아니라 React 트리로 전파되므로 submenu의
    // 방향키가 부모 핸들러까지 실행해 focus가 부모로 튀고, 그 focusout이 submenu를 닫는다.
    // panel들은 DOM에서 형제이므로 native 리스너에는 그 문제가 존재하지 않는다.
    useEffect(() => {
        const panel = panelRef.current;
        if (panel === null || state === "closed")
            return undefined;
        const onKeyDown = (event) => {
            handleMenuKeyDown(event, panel, keyContext);
        };
        const onFocusIn = () => sync();
        const onCompositionStart = () => typeahead.reset();
        const onCompositionEnd = (event) => {
            if (event.data === "")
                return;
            const list = menuItems(panel).filter(isNavigable);
            const current = activeItem(panel);
            const from = current === null ? -1 : list.indexOf(current);
            typeahead.push(event.data, list, from)?.focus();
        };
        panel.addEventListener("keydown", onKeyDown);
        panel.addEventListener("focusin", onFocusIn);
        panel.addEventListener("compositionstart", onCompositionStart);
        panel.addEventListener("compositionend", onCompositionEnd);
        const observer = new MutationObserver(() => {
            if (syncingRef.current)
                return;
            recoverFocus(panel, lastIndexRef, promotedRef);
            sync();
        });
        observer.observe(panel, {
            childList: true,
            subtree: true,
            // style을 넣지 않는다 — positioner의 매 위치 갱신이 observer를 깨운다.
            attributeFilter: ["disabled", "aria-disabled", "hidden", "data-louis-menu-skip"],
        });
        // opening 동안 목록은 visibility:hidden 때문에 비어 있었다. open 진입에서 반드시 다시 돈다.
        sync();
        return () => {
            observer.disconnect();
            panel.removeEventListener("keydown", onKeyDown);
            panel.removeEventListener("focusin", onFocusIn);
            panel.removeEventListener("compositionstart", onCompositionStart);
            panel.removeEventListener("compositionend", onCompositionEnd);
        };
    }, [panelRef, state, sync, keyContext, typeahead]);
    useEffect(() => {
        if (state === "closed")
            promotedRef.current = false;
    }, [state]);
    if (!overlay.mounted)
        return null;
    const label = resolvePanelLabel(panelLabel, overlay.ids, triggerId);
    const classes = ["louis-popover", "louis-menu", className].filter(Boolean).join(" ");
    return (_jsx(Surface, { ...rest, ...label, ref: panelRef, role: "menu", "data-kind": "action-menu", className: classes, children: _jsx(SubmenuRegistryProvider, { value: registry, children: children }) }));
}
//# sourceMappingURL=action-menu.js.map