"use client";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useId } from "react";
export function ActionMenuGroup({ label, children, ref, ...rest }) {
    const labelId = `louis-menu-group-${useId()}`;
    const hasLabel = label !== undefined && label !== null;
    return (_jsxs("div", { ...rest, ref: ref, role: "group", ...(hasLabel ? { "aria-labelledby": labelId } : {}), children: [hasLabel ? (_jsx("div", { id: labelId, className: "louis-menu__group-label", children: label })) : null, children] }));
}
export function ActionMenuSeparator({ className, ref, ...rest }) {
    return (_jsx("div", { ...rest, ref: ref, role: "separator", "aria-orientation": "horizontal", className: ["louis-menu__separator", className].filter(Boolean).join(" ") }));
}
//# sourceMappingURL=group.js.map