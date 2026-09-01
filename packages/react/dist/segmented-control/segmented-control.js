import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { createContext, useContext, useId } from "react";
const SegmentedControlContext = createContext(null);
function useSegmentedControl(part) {
    const context = useContext(SegmentedControlContext);
    if (context === null) {
        throw new Error(`${part}은 SegmentedControl 안에서만 쓸 수 있습니다.`);
    }
    return context;
}
function join(...values) {
    return values.filter(Boolean).join(" ");
}
/**
 * design/components/segmented-control.md의 계약을 구현한다.
 *
 * **네이티브 radio 그룹이다.** 방향키 roving, Home/End, "3 중 1" 그룹 안내, 폼 제출,
 * forced-colors가 전부 브라우저의 것이다. 제품은 선택을 `aria-pressed`·아무것도 없음·
 * `role="tab"` 셋으로 서로 다르게 전달하는데, 패널을 바꾸지 않고 값을 고르는 것은 radiogroup이다.
 *
 * `<fieldset>`인 이유는 `<legend>`가 그룹에 이름을 붙이는 유일한 네이티브 경로이기 때문이다.
 * `role="radiogroup"` + `aria-label`을 쓴 div는 안의 네이티브 radio와 역할이 겹친다.
 */
export function SegmentedControl({ label, value, onValueChange, size = "lg", disabled = false, className, children, ref, }) {
    // 인스턴스마다 발급한다. 호출부가 만들면 같은 화면에 컨트롤이 둘일 때 radio 그룹이 합쳐져
    // 한쪽을 고르면 다른 쪽 선택이 풀린다.
    const name = useId();
    return (_jsxs("fieldset", { ref: ref, className: join("louis-segmented-control", className), "data-size": size, disabled: disabled || undefined, children: [_jsx("legend", { className: "louis-segmented-control__legend louis-visually-hidden", children: label }), _jsx(SegmentedControlContext.Provider, { value: { name, value, disabled, onValueChange }, children: children })] }));
}
/**
 * 항목 하나. `<label>`이 시각을 소유하고 그 안의 radio는 숨겨진다.
 *
 * 포커스 링을 라벨이 `:has(:focus-visible)`로 받는 이유는 숨긴 입력에 걸면 화면 밖에 그려지기
 * 때문이다.
 */
export function SegmentedControlItem({ value, disabled = false, className, children, ref, }) {
    const group = useSegmentedControl("SegmentedControlItem");
    const selected = group.value === value;
    return (_jsxs("label", { className: join("louis-segmented-control__segment", className), "data-selected": selected ? "true" : "false", children: [_jsx("input", { ref: ref, type: "radio", className: "louis-segmented-control__input louis-visually-hidden", name: group.name, value: value, checked: selected, disabled: disabled || undefined, onChange: () => {
                    group.onValueChange(value);
                } }), _jsx("span", { className: "louis-segmented-control__label", children: children })] }));
}
//# sourceMappingURL=segmented-control.js.map