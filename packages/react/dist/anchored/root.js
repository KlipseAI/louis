"use client";
import { jsx as _jsx } from "react/jsx-runtime";
import { useCallback, useEffect, useId, useImperativeHandle, useMemo, useRef, useState, } from "react";
import { OverlayPositioner } from "../overlay/positioner.js";
import { useOverlay } from "../overlay/use-overlay.js";
import { AnchoredContextProvider, } from "./context.js";
function isCloseReason(reason) {
    return reason !== "backdrop";
}
export function AnchoredRoot({ kind, panelLabel, disabledItems = "announce", typeaheadLocale, resolveInitialFocus, open, defaultOpen = false, onOpenChange, placement = "bottom", align = "start", disabled = false, closeOnSelect, children, ref, }) {
    const isControlled = open !== undefined;
    if (isControlled && defaultOpen) {
        throw new Error("open과 defaultOpen을 함께 지정할 수 없습니다. 하나가 다른 하나를 조용히 무시하게 됩니다.");
    }
    const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen);
    const actualOpen = isControlled ? open : uncontrolledOpen;
    const panelRef = useRef(null);
    const triggerRef = useRef(null);
    const openIntentRef = useRef("first");
    const triggerId = `louis-anchored-${useId()}-trigger`;
    const onOpenChangeRef = useRef(onOpenChange);
    onOpenChangeRef.current = onOpenChange;
    const resolveInitialFocusRef = useRef(resolveInitialFocus);
    resolveInitialFocusRef.current = resolveInitialFocus;
    const setOpen = useCallback((next, reason) => {
        if (!isControlled)
            setUncontrolledOpen(next);
        onOpenChangeRef.current?.(next, reason);
    }, [isControlled]);
    /**
     * 초기 focus를 **게터 ref**로 넘긴다.
     *
     * 값으로 넘기면 "언제 계산하는가"가 렌더 순서에 묶인다 — 패널이 아직 없거나 item이 아직
     * 등록되지 않은 시점에 계산되면 null이 되고, 그 실패는 조용하다. 게터는 primitive가 실제로
     * focus를 보내는 순간에 계산되므로 순서 의존이 사라진다.
     */
    const initialFocusRef = useMemo(() => ({
        get current() {
            const panel = panelRef.current;
            if (panel === null)
                return null;
            return resolveInitialFocusRef.current(panel);
        },
        set current(_value) {
            // primitive는 읽기만 한다. 쓰기를 허용하면 정책이 조용히 덮인다.
        },
    }), []);
    const overlay = useOverlay({
        open: actualOpen,
        mode: "non-modal",
        layer: "popover",
        anchored: true,
        side: placement,
        align,
        closeOnEscape: true,
        outsidePointerPassthrough: false,
        triggerRef,
        initialFocus: { kind: "ref", target: initialFocusRef },
        onOpenChange: (nextOpen, reason) => {
            if (nextOpen)
                return;
            if (!isCloseReason(reason))
                return;
            setOpen(false, reason);
        },
    });
    useImperativeHandle(ref, () => ({
        close: (reason) => {
            overlay.requestClose(reason);
        },
    }), [overlay]);
    // trigger가 사라지면 닫는다. 규범이 "Trigger unmount 시 닫는다"를 요구하고, reason은
    // 포커스를 옮기지 않는 route다 — 돌아갈 trigger가 이미 없다.
    const requestCloseRef = useRef(overlay.requestClose);
    requestCloseRef.current = overlay.requestClose;
    useEffect(() => {
        return () => {
            requestCloseRef.current("route");
        };
    }, []);
    const contextValue = useMemo(() => ({
        kind,
        overlay,
        open: actualOpen,
        setOpen,
        disabled,
        closeOnSelect: closeOnSelect ?? kind === "action-menu",
        disabledItems,
        typeaheadLocale,
        panelLabel,
        panelRef,
        triggerRef,
        triggerId,
        openIntentRef,
    }), [
        kind,
        overlay,
        actualOpen,
        setOpen,
        disabled,
        closeOnSelect,
        disabledItems,
        typeaheadLocale,
        panelLabel,
        triggerId,
    ]);
    return (_jsx(AnchoredContextProvider, { value: contextValue, children: _jsx(OverlayPositioner, { children: children }) }));
}
//# sourceMappingURL=root.js.map