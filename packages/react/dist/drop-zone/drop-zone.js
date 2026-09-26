"use client";
import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useRef, useState } from "react";
function join(...values) {
    return values.filter(Boolean).join(" ");
}
const hasFiles = (event) => Array.from(event.dataTransfer?.types ?? []).includes("Files");
/**
 * design/components/drop-zone.md 의 계약을 구현한다.
 *
 * **면은 버튼이다.** 누르거나 Enter · Space 로 숨긴 파일 입력을 연다 — 제품의 업로드 면도 그렇게 동작한다.
 * 끌어다 놓기는 제품에 없던 것을 이 컴포넌트가 더한다. 끌어다 놓기만으로는 키보드 사용자가 닿지 못하므로
 * 버튼이 늘 먼저다.
 *
 * `dragenter` · `dragleave` 는 자식 요소를 지날 때마다 짝을 이뤄 쏟아진다. 깊이를 세어 마지막으로 나갈 때만
 * 상태를 푼다 — 그렇지 않으면 안내 글자 위를 지나는 순간 면이 깜빡인다.
 */
export function DropZone({ prompt, caption, graphic, accept, multiple = false, onFiles, disabled, className, onClick, ref, ...rest }) {
    const input = useRef(null);
    const depth = useRef(0);
    const [dragOver, setDragOver] = useState(false);
    const receive = (list) => {
        const files = Array.from(list ?? []);
        if (files.length === 0)
            return;
        onFiles(multiple ? files : files.slice(0, 1));
    };
    return (_jsxs(_Fragment, { children: [_jsxs("button", { ...rest, ref: ref, type: "button", disabled: disabled, className: join("louis-drop-zone", "louis-focus-ring", className), "data-drag-over": dragOver ? "true" : "false", onClick: (event) => {
                    onClick?.(event);
                    if (!event.defaultPrevented)
                        input.current?.click();
                }, onDragEnter: (event) => {
                    if (disabled || !hasFiles(event))
                        return;
                    event.preventDefault();
                    depth.current += 1;
                    setDragOver(true);
                }, onDragOver: (event) => {
                    if (disabled || !hasFiles(event))
                        return;
                    // 기본 동작(브라우저가 파일을 열기)을 막아야 drop 이 이 요소로 온다.
                    event.preventDefault();
                    event.dataTransfer.dropEffect = "copy";
                }, onDragLeave: () => {
                    depth.current = Math.max(0, depth.current - 1);
                    if (depth.current === 0)
                        setDragOver(false);
                }, onDrop: (event) => {
                    depth.current = 0;
                    setDragOver(false);
                    if (disabled || !hasFiles(event))
                        return;
                    event.preventDefault();
                    receive(event.dataTransfer.files);
                }, children: [graphic === undefined ? null : (_jsx("span", { className: "louis-drop-zone__graphic", "aria-hidden": "true", children: graphic })), _jsx("span", { className: "louis-drop-zone__prompt", children: prompt }), caption === undefined ? null : _jsx("span", { className: "louis-drop-zone__caption", children: caption })] }), _jsx("input", { ref: input, className: "louis-drop-zone__input", type: "file", accept: accept, multiple: multiple, disabled: disabled, hidden: true, tabIndex: -1, "aria-hidden": "true", onChange: (event) => {
                    receive(event.currentTarget.files);
                    // 같은 파일을 다시 골라도 change 가 오도록 비운다.
                    event.currentTarget.value = "";
                } })] }));
}
//# sourceMappingURL=drop-zone.js.map