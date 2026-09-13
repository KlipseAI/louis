"use client";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useRef } from "react";
function join(...values) {
    return values.filter(Boolean).join(" ");
}
/**
 * design/components/checkbox.md의 계약을 구현한다.
 *
 * **`appearance: none`으로 입력 자신을 칠한다.** 입력을 숨기고 형제를 그리면 라벨 연결과 포커스가
 * 두 곳으로 갈라진다. 키보드(Space), `:indeterminate` 의사 클래스, 폼 제출은 네이티브의 것이다.
 *
 * 제품 정본 `.app-native-checkbox`의 20px은 채택하고 `accent-color`는 채택하지 않았다 — 그것은
 * 면 색 하나만 주고 체크 표시의 굵기·반경·포커스 링·indeterminate 막대를 전부 브라우저가 정한다.
 */
export function Checkbox({ label, checked, defaultChecked, indeterminate = false, onCheckedChange, className, disabled, ref, ...rest }) {
    const innerRef = useRef(null);
    // indeterminate는 콘텐츠 속성이 없어 JSX로 넘어가지 않는다. 매 렌더 뒤에 맞춘다 —
    // 값이 바뀌지 않아도 React가 DOM을 되돌릴 수 있기 때문이다.
    useEffect(() => {
        const node = innerRef.current;
        if (node !== null)
            node.indeterminate = indeterminate;
    });
    return (_jsxs("label", { className: join("louis-checkbox", className), children: [_jsx("input", { ...rest, ref: (node) => {
                    innerRef.current = node;
                    if (typeof ref === "function")
                        ref(node);
                    else if (ref !== null && ref !== undefined)
                        ref.current = node;
                }, type: "checkbox", className: "louis-checkbox__control", checked: checked, defaultChecked: defaultChecked, disabled: disabled, "aria-checked": indeterminate ? "mixed" : undefined, onChange: (event) => {
                    onCheckedChange?.(event.target.checked);
                } }), label === undefined ? null : (_jsx("span", { className: "louis-checkbox__label", children: label }))] }));
}
//# sourceMappingURL=checkbox.js.map