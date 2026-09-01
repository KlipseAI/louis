"use client";
import { jsx as _jsx } from "react/jsx-runtime";
import { useCallback, useEffect, } from "react";
import { AnchoredRoot } from "../anchored/root.js";
import { AnchoredTrigger } from "../anchored/trigger.js";
import { useAnchoredContext } from "../anchored/context.js";
import { resolvePanelLabel } from "../anchored/label.js";
export function CompositePopover({ panelLabel = { from: "title" }, ...rest }) {
    // §Focus: composite popover의 초기 focus는 panel root다.
    const resolveInitialFocus = useCallback((panel) => panel, []);
    return (_jsx(AnchoredRoot, { ...rest, kind: "composite-popover", panelLabel: panelLabel, resolveInitialFocus: resolveInitialFocus }));
}
export function CompositePopoverTrigger(props) {
    return _jsx(AnchoredTrigger, { ...props, part: "CompositePopoverTrigger" });
}
export function CompositePopoverContent({ className, children, ...rest }) {
    const context = useAnchoredContext("CompositePopoverContent");
    const { overlay, panelRef, triggerId, panelLabel } = context;
    const { Surface, ids, state } = overlay;
    // dangling aria-labelledby는 조용히 "이름 없는 dialog"가 된다. 스크린리더 사용자에게는
    // 패널이 무엇인지 알 방법이 사라지는데 화면상으로는 아무 이상이 없다.
    const labelsFromTitle = typeof panelLabel === "object" && "from" in panelLabel
        ? panelLabel.from === "title"
        : false;
    useEffect(() => {
        if (!labelsFromTitle || state !== "open")
            return;
        if (document.getElementById(ids.title) !== null)
            return;
        console.error(`CompositePopover: panelLabel이 title을 가리키는데 CompositePopoverTitle이 렌더되지 않았습니다. ` +
            `패널에 접근 가능한 이름이 없습니다 (aria-labelledby="${ids.title}").`);
    }, [labelsFromTitle, state, ids.title]);
    if (!overlay.mounted)
        return null;
    const label = resolvePanelLabel(panelLabel, ids, triggerId);
    const classes = ["louis-popover", className].filter(Boolean).join(" ");
    return (_jsx(Surface, { ...rest, ...label, ref: panelRef, role: "dialog", "data-kind": "composite-popover", className: classes, children: children }));
}
export function CompositePopoverTitle({ as: Tag = "h2", className, children, ref, ...rest }) {
    const { overlay } = useAnchoredContext("CompositePopoverTitle");
    return (_jsx(Tag, { ...rest, ref: ref, id: overlay.ids.title, className: ["louis-popover__title", className].filter(Boolean).join(" "), children: children }));
}
//# sourceMappingURL=composite-popover.js.map