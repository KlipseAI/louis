"use client";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useId, useRef } from "react";
export function AppShell({ rail, chrome, variant = "page", collapsed = false, drawerOpen = false, onDrawerClose, className, children, ref, ...rest }) {
    const contentId = useId();
    const railRef = useRef(null);
    // drawer가 열린 동안 Escape로 닫고 focus를 안으로 옮긴다. 뒤 콘텐츠의 비활성화는
    // `inert`가 소유하며 아래 렌더에서 건다 — 두 곳에서 같은 일을 하지 않는다.
    useEffect(() => {
        if (!drawerOpen)
            return;
        const rail = railRef.current;
        rail?.focus({ preventScroll: true });
        const onKeyDown = (event) => {
            if (event.key === "Escape")
                onDrawerClose?.();
        };
        document.addEventListener("keydown", onKeyDown);
        return () => document.removeEventListener("keydown", onKeyDown);
    }, [drawerOpen, onDrawerClose]);
    return (_jsxs("div", { ...rest, ref: ref, className: ["louis-app-shell", className].filter(Boolean).join(" "), "data-variant": variant, "data-collapsed": collapsed ? "true" : "false", "data-drawer": drawerOpen ? "open" : "closed", children: [_jsx("a", { className: "louis-app-shell__skip", href: `#${contentId}`, children: "\uBCF8\uBB38\uC73C\uB85C \uAC74\uB108\uB6F0\uAE30" }), _jsx("nav", { ref: railRef, className: "louis-app-shell__rail", "aria-label": "\uC8FC \uBA54\uB274", tabIndex: -1, children: rail }), _jsx("div", { className: "louis-app-shell__scrim", onClick: onDrawerClose, "aria-hidden": "true", "data-testid": "louis-app-shell-scrim" }), _jsxs("div", { className: "louis-app-shell__main", 
                // drawer가 열리면 뒤 콘텐츠는 pointer와 focus 양쪽에서 비활성화된다.
                inert: drawerOpen ? true : undefined, children: [chrome === undefined ? null : (_jsx("div", { className: "louis-app-shell__chrome", children: chrome })), _jsx("main", { id: contentId, className: "louis-app-shell__content", children: children })] })] }));
}
//# sourceMappingURL=app-shell.js.map