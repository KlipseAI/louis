"use client";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useId, useState } from "react";
function join(...values) {
    return values.filter(Boolean).join(" ");
}
function clampRatio(ratio) {
    if (!Number.isFinite(ratio))
        return 0;
    if (ratio < 0)
        return 0;
    if (ratio > 1)
        return 1;
    return ratio;
}
/**
 * design/components/slider.md의 계약을 구현한다.
 *
 * **네이티브 `<input type="range">`다.** 키보드(방향키·Home/End·PageUp/Down), `role="slider"`,
 * `aria-valuenow`/`aria-valuemin`/`aria-valuemax`, 터치, forced-colors, RTL이 전부 브라우저의
 * 것이다. Button이 활성화를 네이티브 `<button>`에 맡긴 것과 같은 이유로 여기도 직접 만들지
 * 않는다.
 *
 * 채움 비율을 `--louis-slider-fill`로 내려보내는 이유는 CSS에 있다 —
 * `::-webkit-slider-runnable-track`은 진행 구간을 따로 갖지 않아 그라디언트 정지점으로 그리고,
 * 그 비율은 값에서만 나온다. 그래서 비제어일 때도 컴포넌트가 값을 알아야 한다.
 */
export function Slider({ label, size = "lg", variant = "thumb", min = 0, max = 100, step = 1, value, defaultValue, onValueChange, formatValue, className, id, disabled, style, ...rest }) {
    const generated = useId();
    const controlId = id ?? generated;
    const [uncontrolledValue, setUncontrolledValue] = useState(defaultValue ?? min);
    const currentValue = value ?? uncontrolledValue;
    const fillRatio = clampRatio((currentValue - min) / (max - min));
    return (_jsxs("div", { className: join("louis-slider", className), "data-size": size, "data-variant": variant, children: [label === undefined ? null : (_jsx("label", { className: "louis-slider__label", htmlFor: controlId, children: label })), _jsx("input", { ...rest, id: controlId, type: "range", className: "louis-slider__control", min: min, max: max, step: step, value: currentValue, disabled: disabled, "aria-valuetext": formatValue === undefined ? undefined : formatValue(currentValue), style: {
                    ...style,
                    "--louis-slider-fill": `${fillRatio * 100}%`,
                }, onChange: (event) => {
                    const next = event.target.valueAsNumber;
                    if (Number.isNaN(next))
                        return;
                    // controlled여도 갱신한다. 호출부가 값을 되돌리면 다음 렌더가 덮으므로 해가 없고,
                    // 비제어일 때는 이 상태가 채움 비율의 유일한 출처다.
                    setUncontrolledValue(next);
                    onValueChange?.(next);
                } })] }));
}
//# sourceMappingURL=slider.js.map