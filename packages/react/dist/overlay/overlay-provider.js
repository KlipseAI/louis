"use client";
import { jsx as _jsx } from "react/jsx-runtime";
import { createContext, useContext, useLayoutEffect, useMemo, useState, } from "react";
import { createInertController } from "./inert-controller.js";
import { createOverlayStore } from "./overlay-store.js";
import { DEFAULT_OVERLAY_METRICS, measureOverlayMetrics, } from "./positioner.js";
import { createScrollLock } from "./scroll-lock.js";
const OverlayContext = createContext(null);
const OverlayBranchContext = createContext(null);
function createHost(kind) {
    const host = document.createElement("div");
    host.setAttribute("data-louis-overlay-root", kind);
    return host;
}
export function OverlayProvider({ children, container, }) {
    // 서버에서는 만들지 않는다. hosts가 null이면 portal은 아무것도 렌더하지 않는다.
    const [hosts] = useState(() => typeof document === "undefined"
        ? { modal: null, "non-modal": null }
        : { modal: createHost("modal"), "non-modal": createHost("non-modal") });
    const [mountedIn, setMountedIn] = useState(null);
    const [metrics, setMetrics] = useState(DEFAULT_OVERLAY_METRICS);
    // 서버에서도 **값을 만든다.** 예전에는 여기서 null을 반환했고 그것이 context 값으로 흘러
    // `useOverlayContext`가 "Provider 밖"으로 오판해 throw했다 — Next.js App Router에서 닫힌
    // Dialog를 페이지에 놓아두기만 해도 프리렌더가 죽었다. 위 77행 주석이 적어 둔 원래 의도는
    // "hosts가 null이면 portal이 아무것도 렌더하지 않는다"였고, 그것으로 충분하다.
    //
    // Escape 리스너만 host가 필요하므로 서버에서는 아무것도 하지 않는 host를 준다. scrollLock과
    // inert는 만들 때 DOM을 건드리지 않고, 그 메서드는 effect 안에서만 불리므로 서버에서 실행되지
    // 않는다.
    const services = useMemo(() => {
        const escapeHost = typeof document === "undefined"
            ? { addEventListener: () => { }, removeEventListener: () => { } }
            : document;
        return {
            store: createOverlayStore(escapeHost),
            scrollLock: createScrollLock(),
            inert: createInertController(),
        };
    }, []);
    useLayoutEffect(() => {
        const parent = container ?? document.body;
        // modal host가 먼저다. z-index가 같을 때는 DOM 순서가 결정하므로, 뒤에 오는 non-modal
        // host가 이긴다 — Dialog 안에서 연 Popover가 부모 layer를 물려받았을 때 Dialog 위에
        // 오게 하는 것이 목적이다. 독립 popover는 layer 값 자체가 낮아 여전히 modal 아래다.
        const nonModal = hosts["non-modal"];
        const modal = hosts.modal;
        if (modal !== null)
            parent.append(modal);
        if (nonModal !== null)
            parent.append(nonModal);
        setMountedIn(parent);
        if (nonModal !== null)
            setMetrics(measureOverlayMetrics(nonModal));
        return () => {
            nonModal?.remove();
            modal?.remove();
            setMountedIn(null);
        };
    }, [container, hosts]);
    const value = useMemo(() => {
        return {
            store: services.store,
            scrollLock: services.scrollLock,
            inert: services.inert,
            hosts,
            hostContainer: mountedIn,
            scrollOwner: mountedIn,
            metrics,
        };
    }, [services, hosts, mountedIn, metrics]);
    return (_jsx(OverlayContext.Provider, { value: value, children: _jsx(OverlayBranchContext.Provider, { value: null, children: children }) }));
}
export function useOverlayContext() {
    const value = useContext(OverlayContext);
    if (value === null) {
        throw new Error("overlay: OverlayProvider 안에서만 사용할 수 있습니다. host를 컴포넌트가 고르지 않는 것이 계약입니다.");
    }
    return value;
}
export function useParentBranch() {
    return useContext(OverlayBranchContext);
}
/**
 * 자기 subtree에게 "너희 부모 branch는 나"라고 알린다. portal을 건너도 React context는
 * 따라가므로, DOM 조상 관계가 끊겨도 lineage는 유지된다 — 이것이 branch registry가
 * `contains()` 단독 판정보다 정확한 이유다.
 */
export function OverlayBranchProvider({ branchId, layer, children, }) {
    const value = useMemo(() => ({ branchId, layer }), [branchId, layer]);
    return _jsx(OverlayBranchContext.Provider, { value: value, children: children });
}
//# sourceMappingURL=overlay-provider.js.map