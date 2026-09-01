"use client";
import { jsx as _jsx } from "react/jsx-runtime";
import { useCallback } from "react";
import { OverlayAnchor } from "../overlay/positioner.js";
import { Slot } from "../internal/slot.js";
import { useAnchoredContext } from "./context.js";
export function AnchoredTrigger({ part, asChild = false, onClick, onKeyDown, children, ref, ...rest }) {
    const context = useAnchoredContext(part);
    const { overlay, open, setOpen, disabled, kind, triggerRef, triggerId, openIntentRef } = context;
    const attachTrigger = useCallback((node) => {
        triggerRef.current = node;
        overlay.registerMember(node);
        if (typeof ref === "function")
            ref(node);
        else if (ref !== null && ref !== undefined)
            ref.current = node;
    }, [overlay, ref, triggerRef]);
    const openWith = useCallback((intent) => {
        openIntentRef.current = intent;
        setOpen(true, "trigger");
    }, [openIntentRef, setOpen]);
    const handleClick = useCallback((event) => {
        onClick?.(event);
        if (event.defaultPrevented || disabled)
            return;
        // Enter·Space도 브라우저가 click으로 합성해 이 경로로 온다. keydown을 따로 달면 두 번 실행된다.
        if (open)
            overlay.requestClose("trigger");
        else
            openWith("first");
    }, [disabled, onClick, open, overlay, openWith]);
    const handleKeyDown = useCallback((event) => {
        onKeyDown?.(event);
        if (event.defaultPrevented || disabled || open)
            return;
        if (event.key !== "ArrowDown" && event.key !== "ArrowUp")
            return;
        // 스크롤을 막고 연다. 어느 끝에서 시작할지는 이 키가 직접 알고 있다 —
        // pointer 여부를 heuristic으로 역추론하지 않는 이유가 이것이다.
        event.preventDefault();
        openWith(event.key === "ArrowDown" ? "first" : "last");
    }, [disabled, onKeyDown, open, openWith]);
    // 마운트돼 있고 closing이 아닐 때만 가리킨다. 사라졌거나 inert인 노드를 가리키면
    // 접근성 검사가 오류를 내고 "제어 대상으로 이동"이 아무 데도 가지 않는다.
    const controls = overlay.mounted && overlay.state !== "closing" ? overlay.ids.panel : undefined;
    const triggerProps = {
        ...rest,
        id: triggerId,
        ref: attachTrigger,
        "aria-haspopup": kind === "action-menu" ? "menu" : "dialog",
        "aria-expanded": open,
        ...(controls === undefined ? {} : { "aria-controls": controls }),
        "data-louis-anchored-trigger": kind,
        onClick: handleClick,
        onKeyDown: handleKeyDown,
    };
    if (asChild) {
        return (_jsx(OverlayAnchor, { asChild: true, children: _jsx(Slot, { ...triggerProps, ...(disabled ? { "aria-disabled": true } : {}), children: children }) }));
    }
    return (_jsx(OverlayAnchor, { asChild: true, children: _jsx("button", { type: "button", ...triggerProps, disabled: disabled, children: children }) }));
}
//# sourceMappingURL=trigger.js.map