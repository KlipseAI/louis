"use client";
import { jsx as _jsx } from "react/jsx-runtime";
import { DismissableLayer } from "@radix-ui/react-dismissable-layer";
import { useCallback, useEffect, useRef, } from "react";
export function OverlayDismissRegion({ store, getRecord, branchId, requestClose, outsidePointerPassthrough = false, pointerCaptureActive = false, children, ...rest }) {
    const pending = useRef(null);
    const state = useRef({
        store,
        getRecord,
        branchId,
        requestClose,
        outsidePointerPassthrough,
        pointerCaptureActive,
    });
    state.current = {
        store,
        getRecord,
        branchId,
        requestClose,
        outsidePointerPassthrough,
        pointerCaptureActive,
    };
    /** 정책 1·2·3의 공통 게이트. 통과하면 true. */
    const shouldConsiderOutside = useCallback((path) => {
        const current = state.current;
        // 정책 1·3: 최상위 하나만 바깥 판정을 소유한다. 아래 layer가 함께 닫히면
        // 한 번의 클릭이 여러 단계를 지운다.
        const record = current.getRecord();
        if (record === null)
            return false;
        if (current.store.topmost() !== record)
            return false;
        // 정책 2: portal된 submenu, 별도 subtree의 Listbox, positioning 래퍼 여백을 전부
        // 내부로 본다. panel.contains() 단독 판정이 틀리는 세 경우가 이 한 줄에 흡수된다.
        if (current.store.branches.containsPath(current.branchId, path))
            return false;
        if (current.pointerCaptureActive)
            return false;
        return true;
    }, []);
    useEffect(() => {
        return () => {
            pending.current = null;
        };
    }, []);
    return (
    // onDismiss를 넘기지 않는다 — Omit으로 타입에서도 제거했다.
    // 넘기는 순간 하부 유틸이 Escape를 삼키고 자체 stack으로 라우팅한다.
    _jsx(DismissableLayer, { ...rest, onPointerDownOutside: (event) => {
            const path = event.detail.originalEvent.composedPath();
            if (!shouldConsiderOutside(path)) {
                event.preventDefault();
                return;
            }
            // 항상 취소한다. 하부 유틸이 자체 dismiss로 진행하지 못하게 하는 것이지
            // 닫지 않겠다는 뜻이 아니다 — commit은 후속 click에서 한다.
            event.preventDefault();
            pending.current = { reason: "outside" };
            const commit = (clickEvent) => {
                const current = state.current;
                if (pending.current === null)
                    return;
                // pointerdown과 click 사이에 레이아웃이 바뀌어 착지점이 내부가 됐을 수 있다.
                if (current.store.branches.containsPath(current.branchId, clickEvent.composedPath())) {
                    pending.current = null;
                    return;
                }
                if (!current.outsidePointerPassthrough) {
                    // 배경 액션을 실행하지 않는다. 이 표현은 click 단계에서만 가능하다 —
                    // pointerdown에는 "이 클릭을 소비한다"를 나타낼 수단이 없다.
                    clickEvent.preventDefault();
                    clickEvent.stopPropagation();
                }
                pending.current = null;
                current.requestClose("outside");
            };
            const abort = () => {
                // drag가 취소되면 닫지 않는다.
                pending.current = null;
            };
            document.addEventListener("click", commit, { capture: true, once: true });
            document.addEventListener("pointercancel", abort, { once: true });
        }, onFocusOutside: (event) => {
            const path = event.detail.originalEvent.composedPath();
            if (!shouldConsiderOutside(path)) {
                event.preventDefault();
                return;
            }
            event.preventDefault();
            // click 지연 대상이 아니다. non-modal에서 Tab으로 빠져나가는 경로가 여기로 들어오고,
            // DS-D-0011 결정 4에 따라 reason은 "outside"다 — 포커스를 되돌리지 않는 정책이 같다.
            state.current.requestClose("outside");
        }, children: children }));
}
//# sourceMappingURL=dismiss-region.js.map