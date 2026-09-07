"use client";
import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, } from "react";
/** 동시에 보이는 최대 개수. 초과분은 자리가 날 때까지 기다린다. */
export const TOAST_VISIBLE_LIMIT = 3;
const DEFAULT_DURATION = 4000;
const ToastContext = createContext(null);
export function useToast() {
    const value = useContext(ToastContext);
    if (value === null) {
        throw new Error("useToast는 ToastProvider 안에서만 쓸 수 있습니다. 앱 최상단에 <ToastProvider>를 두십시오.");
    }
    return value;
}
/**
 * design/components/toast.md의 계약을 구현한다.
 *
 * live region 둘을 **처음부터** 렌더한다. 보조 기술은 region이 존재한 뒤의 변화만 감지하므로,
 * toast가 생길 때 region을 함께 만들면 그 첫 메시지가 읽히지 않는다.
 *
 * polite와 assertive를 **별도 region**에 둔다. 하나의 region에서 `aria-live`를 바꾸면 그 시점의
 * 변경이 유실된다.
 */
export function ToastProvider({ children, duration = DEFAULT_DURATION, }) {
    const [items, setItems] = useState([]);
    const sequence = useRef(0);
    const dismiss = useCallback((id) => {
        setItems((current) => current.filter((item) => item.id !== id));
    }, []);
    const toast = useCallback((input) => {
        const normalized = typeof input === "string" ? { message: input } : input;
        sequence.current += 1;
        const id = `louis-toast-${sequence.current}`;
        const derived = normalized.title !== undefined || normalized.action !== undefined
            ? "callout"
            : "base";
        const record = {
            id,
            message: normalized.message,
            tone: normalized.tone ?? "neutral",
            duration: normalized.duration ?? duration,
            layout: normalized.layout ?? derived,
            ...(normalized.title === undefined ? {} : { title: normalized.title }),
            ...(normalized.action === undefined ? {} : { action: normalized.action }),
        };
        // 최신이 뒤에 온다 — 시선이 마지막으로 머문 곳에 가장 새 소식이 온다.
        setItems((current) => [...current, record]);
        return () => dismiss(id);
    }, [dismiss, duration]);
    const dismissAll = useCallback(() => setItems([]), []);
    const value = useMemo(() => ({ toast, dismissAll }), [dismissAll, toast]);
    // 대기열의 앞에서부터 정해진 수만 렌더한다. 타이머는 렌더된 것만 돌기 때문에,
    // 대기 중인 toast는 자기 차례가 와야 소멸 시계가 시작된다.
    const visible = items.slice(0, TOAST_VISIBLE_LIMIT);
    const polite = visible.filter((item) => item.tone !== "danger");
    const assertive = visible.filter((item) => item.tone === "danger");
    return (_jsxs(ToastContext.Provider, { value: value, children: [children, _jsxs("div", { className: "louis-toast-viewport", "data-louis-toast-viewport": "", children: [_jsx(ToastRegion, { role: "status", items: polite, onDismiss: dismiss }), _jsx(ToastRegion, { role: "alert", items: assertive, onDismiss: dismiss })] })] }));
}
function ToastRegion({ role, items, onDismiss, }) {
    return (_jsx("div", { role: role, "aria-live": role === "alert" ? "assertive" : "polite", className: "louis-toast-region", children: items.map((item) => (_jsx(ToastItem, { record: item, onDismiss: onDismiss }, item.id))) }));
}
function ToastItem({ record, onDismiss, }) {
    const [paused, setPaused] = useState(false);
    // 남은 시간을 들고 있는다. 다시 흐를 때 처음부터 세면 읽는 동안 얹어 둔 것이 벌이 된다.
    const remaining = useRef(record.duration);
    const startedAt = useRef(null);
    const timer = useRef(null);
    useEffect(() => {
        if (record.duration <= 0)
            return undefined;
        if (paused)
            return undefined;
        startedAt.current = Date.now();
        timer.current = window.setTimeout(() => {
            timer.current = null;
            onDismiss(record.id);
        }, remaining.current);
        return () => {
            if (timer.current !== null) {
                window.clearTimeout(timer.current);
                timer.current = null;
            }
            if (startedAt.current !== null) {
                remaining.current = Math.max(0, remaining.current - (Date.now() - startedAt.current));
                startedAt.current = null;
            }
        };
    }, [onDismiss, paused, record.duration, record.id]);
    const action = record.action;
    return (_jsx("div", { className: "louis-toast", "data-tone": record.tone, "data-layout": record.layout, ...(paused ? { "data-louis-paused": "true" } : {}), 
        // 읽는 중에 사라지면 알림이 아니다. 포인터와 focus 둘 다 멈춤 신호다.
        onPointerEnter: () => setPaused(true), onPointerLeave: () => setPaused(false), onFocusCapture: () => setPaused(true), onBlurCapture: () => setPaused(false), children: record.layout === "callout" ? (_jsxs(_Fragment, { children: [_jsxs("div", { className: "louis-toast__content", children: [record.title === undefined ? null : (_jsx("p", { className: "louis-toast__title", children: record.title })), _jsx("p", { className: "louis-toast__body", children: record.message })] }), action === undefined ? null : (_jsx("button", { type: "button", className: "louis-toast__action", onClick: () => {
                        action.onAction();
                        // 기본은 닫는다. 온보딩 안내의 액션은 「봤다」이고, 누른 뒤에도 남아 있으면
                        // 그 뜻이 전달되지 않는다.
                        if (action.dismissOnAction !== false)
                            onDismiss(record.id);
                    }, children: action.label }))] })) : (record.message) }));
}
//# sourceMappingURL=toast.js.map