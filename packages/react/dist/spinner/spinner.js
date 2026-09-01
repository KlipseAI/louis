import { jsx as _jsx } from "react/jsx-runtime";
function join(...values) {
    return values.filter(Boolean).join(" ");
}
/**
 * design/components/spinner.md의 계약을 구현한다.
 *
 * **얼마나 남았는지 말하지 않는다.** 회전 주기는 진행률이 아니라 한 바퀴의 시간이며, 진행률을
 * 아는 작업에는 이것이 아니라 determinate 표시를 쓴다(motion.md의 Loop 절).
 *
 * reduced-motion에서 회전이 멈춘다. 그때도 진행 중이라는 의미는 `role="status"`와 `aria-busy`가
 * 유지한다 — 그것이 loop의 reduce 대체다.
 */
export function Spinner({ size = "md", label, className, ...rest }) {
    const announced = label !== undefined;
    return (_jsx("span", { ...rest, className: join("louis-spinner", className), "data-size": size, role: announced ? "status" : undefined, "aria-live": announced ? "polite" : undefined, "aria-busy": announced ? true : undefined, "aria-label": label, "aria-hidden": announced ? undefined : true, children: _jsx("span", { className: "louis-spinner__ring" }) }));
}
//# sourceMappingURL=spinner.js.map