"use client";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useCallback, useImperativeHandle, useLayoutEffect, useMemo, useRef, useState, } from "react";
import { useOverlay } from "../overlay/use-overlay.js";
import { resolveInitialFocus } from "../overlay/focus-region.js";
import { DialogContextProvider } from "./context.js";
import { resolveDialogPolicy } from "./policy.js";
import { toDialogCloseReason } from "./reason.js";
const DEFAULT_BLOCKED_MESSAGE = "지금은 이 창을 닫을 수 없습니다.";
export function Dialog({ open, onOpenChange, variant = "task", size, initialFocus, returnFocus, dismissible, closeOnBackdrop, busy = false, confirmVariant, onDismissBlocked, dismissBlockedMessage, children, ref, }) {
    const policy = resolveDialogPolicy(variant, {
        ...(initialFocus === undefined ? {} : { initialFocus }),
        ...(dismissible === undefined ? {} : { dismissible }),
        ...(closeOnBackdrop === undefined ? {} : { closeOnBackdrop }),
        ...(size === undefined ? {} : { size }),
        ...(confirmVariant === undefined ? {} : { confirmVariant }),
        busy,
    });
    const cardRef = useRef(null);
    const [blockedNotice, setBlockedNotice] = useState("");
    const [hasDescription, setHasDescription] = useState(false);
    // --- 호출 요소 캡처 ------------------------------------------------------
    // 이 훅은 useOverlay 호출보다 **반드시 위**에 선언한다. 같은 컴포넌트의 훅은 선언 순서대로
    // 실행되므로 presence의 open 전이 layout effect보다 먼저 돌고, 초기 focus는 그보다 더
    // 뒤인 passive effect에서 적용된다 — 캡처가 항상 앞선다.
    const capturedTriggerRef = useRef(null);
    const prevOpenRef = useRef(false);
    useLayoutEffect(() => {
        if (open && !prevOpenRef.current) {
            const active = document.activeElement;
            capturedTriggerRef.current =
                active instanceof HTMLElement && active !== document.body ? active : null;
        }
        prevOpenRef.current = open;
    }, [open]);
    // --- 초기 focus 게터 ref -------------------------------------------------
    // 값이 아니라 게터인 이유는 AnchoredRoot와 같다: 계산 시점을 렌더 순서에서 떼어낸다.
    // 해석 범위가 root(scrim)가 아니라 **card**인 것이 Dialog 고유의 차이다. 이것으로
    // (a) "surface"가 card를 가리키고 (b) 후보 없음 fallback이 scrim이 아닌 card가 되며
    // (c) first-field 탐색이 backdrop 영역을 보지 않는다.
    const policyRef = useRef(policy);
    policyRef.current = policy;
    const initialFocusRef = useMemo(() => ({
        get current() {
            const card = cardRef.current;
            if (card === null)
                return null;
            return resolveInitialFocus(card, policyRef.current.initialFocus);
        },
        set current(_value) {
            // primitive는 읽기만 한다.
        },
    }), []);
    // --- pending reason ------------------------------------------------------
    const pendingReasonRef = useRef(null);
    const onOpenChangeRef = useRef(onOpenChange);
    onOpenChangeRef.current = onOpenChange;
    const onDismissBlockedRef = useRef(onDismissBlocked);
    onDismissBlockedRef.current = onDismissBlocked;
    const overlay = useOverlay({
        open,
        mode: "modal",
        layer: "modal",
        closeOnEscape: policy.escapeCloses,
        dismissLocked: busy,
        initialFocus: { kind: "ref", target: initialFocusRef },
        ...(returnFocus === undefined ? {} : { returnFocus }),
        triggerRef: capturedTriggerRef,
        onDismissBlocked: (reason) => {
            if (reason !== "escape")
                return;
            announceBlockedRef.current("escape");
        },
        onOpenChange: (nextOpen, reason) => {
            // primitive는 open을 통지하지 않지만 계약을 명시적으로 고정한다.
            if (nextOpen)
                return;
            const pending = pendingReasonRef.current;
            pendingReasonRef.current = null;
            const resolved = pending ?? toDialogCloseReason(reason);
            onOpenChangeRef.current(false, resolved);
        },
    });
    // 재오픈("마음을 바꿈") 경로에서는 onOpenChange가 아예 호출되지 않는다. pending이 남으면
    // 다음 close가 그것을 잘못 소비한다.
    const stateRef = useRef(overlay.state);
    if (stateRef.current !== overlay.state) {
        if (overlay.state === "opening")
            pendingReasonRef.current = null;
        stateRef.current = overlay.state;
    }
    const announceBlockedRef = useRef(() => { });
    announceBlockedRef.current = (reason) => {
        // 규범: 안내는 Dialog의 의무다. 소비자 훅은 그 위의 추가 처리다.
        setBlockedNotice("");
        const message = dismissBlockedMessage ?? DEFAULT_BLOCKED_MESSAGE;
        // 같은 문구를 연속으로 쓰면 live region이 다시 읽지 않는다. 빈 문자열을 한 번 거친다.
        queueMicrotask(() => {
            setBlockedNotice(message);
        });
        onDismissBlockedRef.current?.(reason);
    };
    const closeWith = useCallback((reason) => {
        // 🔴 이 가드가 없으면: Escape로 이미 closing인 상태에서 confirm을 누르면
        // requestClose가 no-op이 되고 pending만 남아, 진행 중이던 escape close가
        // "confirm"으로 오보된다. 소비자는 사용자가 확인한 것으로 착각한다.
        const current = stateRef.current;
        if (current !== "open" && current !== "opening")
            return;
        if (reason === "confirm" || reason === "cancel") {
            pendingReasonRef.current = reason;
        }
        overlay.requestClose("programmatic");
    }, [overlay]);
    const requestBackdropDismiss = useCallback(() => {
        // primitive에 backdrop 경로가 없다. 정책 게이트가 recipe에 있는 이유가 이것이다.
        if (!policyRef.current.backdropCloses) {
            // 규범 Pointer: 정책상 닫지 않는 backdrop click은 조용히 무시하지 않고 안내한다.
            // 단 closeOnBackdrop이 처음부터 false인 variant(task/danger-confirm)는 "차단"이
            // 아니라 "해당 없음"이므로 안내하지 않는다. busy/dismissible로 막힌 경우만 알린다.
            const p = policyRef.current;
            if (p.closeOnBackdrop && (!p.dismissible || p.busy)) {
                announceBlockedRef.current("backdrop");
            }
            return;
        }
        if (stateRef.current !== "open")
            return;
        overlay.requestClose("backdrop");
    }, [overlay]);
    useImperativeHandle(ref, () => ({ close: closeWith }), [closeWith]);
    const registerDescription = useCallback((present) => {
        setHasDescription(present);
    }, []);
    const value = useMemo(() => ({
        overlay,
        policy,
        variant,
        cardRef,
        closeWith,
        requestBackdropDismiss,
        describedBy: hasDescription ? overlay.ids.description : undefined,
        registerDescription,
    }), [
        overlay,
        policy,
        variant,
        closeWith,
        requestBackdropDismiss,
        hasDescription,
        registerDescription,
    ]);
    return (_jsxs(DialogContextProvider, { value: value, children: [children, _jsx("span", { className: "louis-visually-hidden", role: "status", "aria-live": "polite", children: blockedNotice })] }));
}
//# sourceMappingURL=root.js.map