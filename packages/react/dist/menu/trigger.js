"use client";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { AnchoredTrigger } from "../anchored/trigger.js";
export function MenuTrigger({ icon, value, className, children, ...rest }) {
    const classes = ["louis-menu-trigger", className].filter(Boolean).join(" ");
    return (_jsxs(AnchoredTrigger, { ...rest, part: "MenuTrigger", className: classes, children: [icon === undefined ? null : (_jsx("span", { className: "louis-menu-trigger__icon", "aria-hidden": "true", children: icon })), value === undefined ? null : (_jsx("span", { className: "louis-menu-trigger__value", children: value })), children] }));
}
//# sourceMappingURL=trigger.js.map