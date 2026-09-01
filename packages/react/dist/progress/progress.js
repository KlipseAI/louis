import { jsx as _jsx } from "react/jsx-runtime";
/**
 * 값을 0~100으로 조인다. 소비처가 범위를 벗어난 수를 주면 화면과 보조기술이 갈리므로 한 곳에서
 * 막는다 — 채움 폭은 CSS가 계산하고 `aria-valuenow`는 여기서 적기 때문이다.
 */
function clampPercent(value) {
    if (!Number.isFinite(value))
        return 0;
    return Math.min(100, Math.max(0, value));
}
/**
 * 이름이 없으면 개발 빌드에서 경고한다. DS-D-0022가 "이름은 컴포넌트가 만들지 않는다"로 정했고,
 * 그 결과 이름 없는 progressbar는 스크린 리더에서 "진행률"이라고만 읽힌다 — 무엇의 진행률인지
 * 말하지 않는 것은 이름이 없는 것과 같다.
 */
function warnMissingName(label, labelledBy) {
    if (label !== undefined || labelledBy !== undefined)
        return;
    console.warn("[louis] Progress에 접근 가능한 이름이 없습니다. aria-label 또는 aria-labelledby를 주세요 (DS-D-0022).");
}
export function ProgressBar({ value = 0, indeterminate = false, valueText, className, style, ref, "aria-label": label, "aria-labelledby": labelledBy, ...rest }) {
    warnMissingName(label, labelledBy);
    const percent = clampPercent(value);
    return (_jsx("div", { ...rest, ref: ref, 
        // **값을 갖는 것은 트랙이다.** 채움에 role을 걸면 폭이 0일 때 이름째 사라진다.
        role: "progressbar", "aria-label": label, "aria-labelledby": labelledBy, "aria-valuemin": indeterminate ? undefined : 0, "aria-valuemax": indeterminate ? undefined : 100, "aria-valuenow": indeterminate ? undefined : percent, "aria-valuetext": valueText, "data-indeterminate": indeterminate ? "true" : undefined, className: ["louis-progress-bar", className].filter(Boolean).join(" "), style: { ...style, "--louis-progress-value": percent }, children: _jsx("div", { className: "louis-progress-bar__fill", "aria-hidden": true }) }));
}
export function ProgressRing({ value = 0, indeterminate = false, valueText, children, className, style, ref, "aria-label": label, "aria-labelledby": labelledBy, ...rest }) {
    warnMissingName(label, labelledBy);
    const percent = clampPercent(value);
    return (_jsx("div", { ...rest, ref: ref, role: "progressbar", "aria-label": label, "aria-labelledby": labelledBy, "aria-valuemin": indeterminate ? undefined : 0, "aria-valuemax": indeterminate ? undefined : 100, "aria-valuenow": indeterminate ? undefined : percent, "aria-valuetext": valueText, "data-indeterminate": indeterminate ? "true" : undefined, className: ["louis-progress-ring", className].filter(Boolean).join(" "), style: { ...style, "--louis-progress-value": percent }, children: children }));
}
//# sourceMappingURL=progress.js.map