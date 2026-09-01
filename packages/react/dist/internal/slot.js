"use client";
import { Children, cloneElement, isValidElement, } from "react";
function composeRefs(ours, theirs) {
    return (node) => {
        for (const candidate of [ours, theirs]) {
            if (typeof candidate === "function") {
                candidate(node);
            }
            else if (candidate !== null && candidate !== undefined) {
                candidate.current = node;
            }
        }
    };
}
function isEventHandlerName(name) {
    return name.startsWith("on") && name.length > 2 && name[2] === name[2]?.toUpperCase();
}
export function mergeSlotProps(slotProps, childProps) {
    const merged = { ...childProps };
    for (const [key, slotValue] of Object.entries(slotProps)) {
        const childValue = childProps[key];
        if (key === "children")
            continue;
        if (isEventHandlerName(key)) {
            if (typeof childValue === "function" && typeof slotValue === "function") {
                merged[key] = (...args) => {
                    childValue(...args);
                    const first = args[0];
                    if (first?.defaultPrevented === true)
                        return;
                    slotValue(...args);
                };
            }
            else {
                merged[key] = slotValue ?? childValue;
            }
            continue;
        }
        if (key === "className") {
            merged[key] = [childValue, slotValue].filter(Boolean).join(" ");
            continue;
        }
        if (key === "style") {
            merged[key] = {
                ...childValue,
                ...slotValue,
            };
            continue;
        }
        if (key === "ref") {
            merged[key] = composeRefs(slotValue, childValue);
            continue;
        }
        merged[key] = slotValue;
    }
    return merged;
}
/**
 * 단일 자식에 props를 합쳐 복제한다. 자식이 정확히 하나의 element가 아니면 던진다 —
 * 조용히 첫 자식만 쓰면 나머지가 사라진 것을 아무도 모른다.
 */
export function Slot({ children, ...slotProps }) {
    const only = Children.toArray(children).filter((node) => isValidElement(node));
    if (only.length !== 1) {
        throw new Error(`asChild는 단일 element 자식을 요구합니다 — ${String(only.length)}개를 받았습니다.`);
    }
    const child = only[0];
    return cloneElement(child, mergeSlotProps(slotProps, child.props));
}
//# sourceMappingURL=slot.js.map