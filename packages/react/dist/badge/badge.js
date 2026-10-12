import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
function join(...values) {
    return values.filter(Boolean).join(" ");
}
/**
 * design/components/badge.md의 계약을 구현한다.
 *
 * **대화형이 아니다.** `<span>`이며 hover·focus·press 상태를 갖지 않고 44px hit target 규범의
 * 대상도 아니다. 누를 수 있는 배지가 필요하면 그것은 Button이거나 Chip이며 다른 컴포넌트다.
 *
 * **tone은 색만 바꾼다.** 색각 이상에서 tone이 전달되지 않으므로, 색이 유일한 신호가 되지 않도록
 * 라벨이 상태를 말해야 한다 — "완료"라고 쓰고 초록을 입히는 것이지 초록만으로 완료를 뜻하게
 * 하지 않는다. 그 책임은 호출부에 있고 문서가 그것을 요구한다.
 */
export function Badge({ tone = "neutral", surface = "page", icon, dot = false, className, children, ...rest }) {
    return (_jsxs("span", { ...rest, className: join("louis-badge", className), "data-tone": tone, "data-surface": surface === "media" ? "media" : undefined, children: [icon === undefined ? null : (
            // 아이콘은 라벨이 말하는 것을 반복하는 장식이다.
            _jsx("span", { className: "louis-badge__icon", "aria-hidden": "true", children: icon })), icon === undefined && dot ? _jsx("span", { className: "louis-badge__dot", "aria-hidden": "true" }) : null, children] }));
}
//# sourceMappingURL=badge.js.map