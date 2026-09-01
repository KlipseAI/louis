"use client";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useDialogContext } from "./context.js";
/**
 * scrim root(primitive Surface) → backdrop → card.
 *
 * 세 노드가 **하나의 portal 자식 subtree** 안에 있어야 한다. backdrop을 별도 OverlayPortal로
 * 렌더하면 modal host의 두 번째 직속 자식이 되고, use-overlay의 형제 격리가 자기 자신의
 * backdrop에 inert를 건다 — backdrop 클릭이 조용히 죽는다.
 */
export function DialogSurface({ className, children, ...rest }) {
    const context = useDialogContext("DialogSurface");
    const { overlay, policy, variant, cardRef, requestBackdropDismiss, describedBy } = context;
    const { Surface, ids, mounted } = overlay;
    if (!mounted)
        return null;
    return (_jsxs(Surface, { className: ["louis-dialog", className].filter(Boolean).join(" "), "data-size": policy.size, "data-variant": variant, children: [_jsx("div", { className: "louis-dialog__backdrop", "aria-hidden": "true", onMouseDown: (event) => {
                    // 🔴 preventDefault를 pointerdown이 아니라 mousedown에 건다.
                    // pointerdown에서 걸면 브라우저가 compat 마우스 이벤트를 만들지 않아 click 자체가
                    // 사라지고 backdrop dismiss가 0회가 된다.
                    // 목적은 focus 이동 차단이다. root에는 FocusScope가 tabIndex="-1"을 찍으므로,
                    // 막지 않으면 backdrop 클릭이 포커스를 scrim으로 옮겨 card 밖으로 빠져나간다.
                    event.preventDefault();
                }, onClick: (event) => {
                    // 규범 Pointer 1의 문언을 그대로 유지한다. 현재 backdrop에 자식이 없어 항상 참이지만,
                    // sheet의 드래그 핸들처럼 자식이 생기는 순간 살아난다.
                    if (event.target !== event.currentTarget)
                        return;
                    requestBackdropDismiss();
                } }), _jsx("div", { ...rest, ref: cardRef, className: "louis-dialog__surface", role: "dialog", "aria-modal": "true", "aria-labelledby": ids.title, ...(describedBy === undefined ? {} : { "aria-describedby": describedBy }), ...(policy.busy ? { "aria-busy": true } : {}), 
                // resolveInitialFocus의 모든 fallback이 이 노드를 반환한다. tabIndex가 없으면
                // .focus()가 무효가 되고 포커스가 trap 밖 trigger에 남는다.
                tabIndex: -1, children: children })] }));
}
//# sourceMappingURL=surface.js.map