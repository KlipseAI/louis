import { jsx as _jsx } from "react/jsx-runtime";
/**
 * design/components/icon-button.md의 계약을 구현한다.
 *
 * 크기를 padding이 아니라 한 변의 길이로 정한다. Button은 고정 높이가 없어 라벨 길이·번역·확대에
 * 따라 자라지만, 아이콘 전용 버튼은 정사각이 계약이므로 높이를 직접 소유한다. 실제로 Button을
 * 아이콘 전용으로 렌더하면 md가 54×38이 된다 — 빈 라벨과의 gap과 좌우 padding이 남기 때문이다.
 *
 * `pressed`가 `undefined`면 속성을 아예 붙이지 않는다. `false`를 늘 붙이면 토글이 아닌 버튼이
 * 보조 기술에 토글로 노출된다.
 */
export function IconButton({ label, variant = "ghost", size = "md", pressed, type = "button", className, children, ref, ...rest }) {
    const classes = ["louis-icon-button", "louis-hit-target", className]
        .filter(Boolean)
        .join(" ");
    return (_jsx("button", { ...rest, ...(ref === undefined ? {} : { ref }), type: type, className: classes, "data-variant": variant, "data-size": size, "aria-label": label, ...(pressed === undefined ? {} : { "aria-pressed": pressed }), children: _jsx("span", { className: "louis-icon-button__glyph", "aria-hidden": "true", children: children }) }));
}
//# sourceMappingURL=icon-button.js.map