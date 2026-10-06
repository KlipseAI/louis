"use client";
import { jsx as _jsx } from "react/jsx-runtime";
import { useEffect } from "react";
import { Button } from "../button/button.js";
import { useDialogContext } from "./context.js";
/**
 * Dialog의 구조 part들.
 *
 * 제목과 설명이 prop이 아니라 컴포넌트인 이유는 두 가지다. 제목은 호출부가 heading level을
 * 정해야 페이지 outline이 깨지지 않고, 설명은 선택이라 prop으로 받으면 렌더되지 않았을 때
 * `aria-describedby`가 존재하지 않는 id를 가리킨다 — 화면상 아무 이상이 없는 접근성 회귀다.
 */
export function DialogHeader({ className, children, ...rest }) {
    return (_jsx("div", { ...rest, className: ["louis-dialog__header", className].filter(Boolean).join(" "), children: children }));
}
export function DialogTitle({ as: Tag = "h2", className, children, ref, ...rest }) {
    const { overlay } = useDialogContext("DialogTitle");
    return (_jsx(Tag, { ...rest, ref: ref, id: overlay.ids.title, className: ["louis-dialog__title", className].filter(Boolean).join(" "), children: children }));
}
export function DialogDescription({ className, children, ref, ...rest }) {
    const { overlay, registerDescription } = useDialogContext("DialogDescription");
    // 존재를 알려야 surface가 `aria-describedby`를 **붙일지** 결정할 수 있다.
    useEffect(() => {
        registerDescription(true);
        return () => {
            registerDescription(false);
        };
    }, [registerDescription]);
    return (_jsx("p", { ...rest, ref: ref, id: overlay.ids.description, className: ["louis-dialog__description", className].filter(Boolean).join(" "), children: children }));
}
/** 스크롤은 이 요소 하나만 한다. 제목과 footer는 항상 도달 가능해야 한다. */
export function DialogBody({ className, children, ...rest }) {
    return (_jsx("div", { ...rest, className: ["louis-dialog__body", className].filter(Boolean).join(" "), children: children }));
}
export function DialogFooter({ className, children, ...rest }) {
    return (_jsx("div", { ...rest, className: ["louis-dialog__footer", className].filter(Boolean).join(" "), children: children }));
}
/** action 묶음. 좁은 폭에서 세로로 전환되는 경계를 이 요소가 소유한다. */
export function DialogActions({ className, children, ...rest }) {
    return (_jsx("div", { ...rest, className: ["louis-dialog__actions", className].filter(Boolean).join(" "), children: children }));
}
/**
 * icon-only 닫기. `dismissible=false`면 아예 렌더하지 않는다 — 눌러도 안 되는 어포던스를
 * 남기지 않는다.
 *
 * `data-louis-safe-action`을 **달지 않는다.** header에 있어 footer의 취소보다 DOM에서 앞서므로,
 * 달면 `danger-confirm`의 초기 포커스가 명시적인 "취소"가 아니라 아이콘 X로 간다. 취소 버튼이
 * 없는 `sheet`에서는 표식 없이도 첫 focusable로 자연히 선택된다.
 */
export function DialogClose({ label, className, children, onClick, ref, ...rest }) {
    const { policy, closeWith } = useDialogContext("DialogClose");
    if (!policy.closeButtonVisible)
        return null;
    const blocked = !policy.closeButtonEnabled;
    return (_jsx("button", { ...rest, ref: ref, type: "button", className: ["louis-dialog__close", className]
            .filter(Boolean)
            .join(" "), "aria-label": label, ...(blocked ? { "aria-disabled": true } : {}), onClick: (event) => {
            if (blocked) {
                event.preventDefault();
                event.stopPropagation();
                return;
            }
            onClick?.(event);
            if (event.defaultPrevented)
                return;
            closeWith("cancel");
        }, children: children ?? _jsx("span", { "aria-hidden": "true", children: "\u2715" }) }));
}
/**
 * 취소. `data-louis-safe-action`을 **자동으로** 찍는다.
 *
 * 소비자에게 맡기면 `danger-confirm`에서 footer 순서가 `[삭제][취소]`일 때 초기 포커스가
 * 조용히 삭제 버튼으로 간다 — primitive의 safe-action은 표식이 없으면 첫 focusable로 강등한다.
 */
export function DialogCancel({ closeOnActivate = true, onClick, children, ref, ...rest }) {
    const { closeWith } = useDialogContext("DialogCancel");
    return (_jsx(Button, { ...rest, ...(ref === undefined ? {} : { ref }), type: "button", variant: "secondary", "data-louis-safe-action": "true", onClick: (event) => {
            onClick?.(event);
            if (event.defaultPrevented || !closeOnActivate)
                return;
            closeWith("cancel");
        }, children: children }));
}
/**
 * 확인. `loading={busy}`를 자동 전달한다.
 *
 * Button의 loading은 네이티브 `disabled`를 쓰지 않아 현재 포커스를 잃지 않는다. busy 중 포커스가
 * body로 떨어지면 trap이 무의미해지므로 이 선택이 필수다.
 *
 * 기본값이 `closeOnActivate: false`인 이유는 async action이 기본이기 때문이다 — 저장이 끝나기
 * 전에 닫으면 오류를 보여줄 곳이 사라진다. 소비자가 완료 후 `close("confirm")`을 부른다.
 *
 * **톤이 Button variant로 내려가는 유일한 자리다**(DS-D-0041). `neutral`은 Button 어휘에 없는
 * 낱말이라 여기서 `primary`로 옮긴다 — 제품의 `GlassConfirmModal`이 하는 것과 같은 매핑이고
 * (`variant={confirmVariant === "danger" ? "danger" : "primary"}`, 앵커 `ae8fd627`),
 * 톤이 바꾸는 선언은 이 한 줄이 전부다.
 */
export function DialogConfirm({ closeOnActivate = false, onClick, children, ref, ...rest }) {
    const { policy, closeWith } = useDialogContext("DialogConfirm");
    return (_jsx(Button, { ...rest, ...(ref === undefined ? {} : { ref }), type: "button", variant: policy.tone === "danger" ? "danger" : "primary", loading: policy.busy, onClick: (event) => {
            onClick?.(event);
            if (event.defaultPrevented || !closeOnActivate)
                return;
            closeWith("confirm");
        }, children: children }));
}
//# sourceMappingURL=parts.js.map