import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
function join(...values) {
    return values.filter(Boolean).join(" ");
}
/**
 * design/components/selectable-list-row.md의 계약을 구현한다.
 *
 * master-detail의 좌측 열에서 **하나를 고르는** 행이다. 선택은 `aria-current`가 소유하고,
 * 면과 함께 선행 표식을 그린다 — 다크에서 `background-inset`이 `surface`와 같은 색이라 면 하나에
 * 기대면 표면 위에 놓인 목록에서 선택이 사라진다.
 *
 * **여럿을 고르는 목록은 이 컴포넌트가 아니다.** 그 경우 선택은 행이 아니라 Checkbox가 갖고,
 * 행을 버튼으로 만들면서 안에 체크박스를 넣으면 컨트롤이 중첩된다.
 */
export function SelectableListRow({ selected = false, media, title, meta, trailing, className, ...rest }) {
    return (_jsxs("button", { ...rest, type: "button", className: join("louis-selectable-list-row", className), "aria-current": selected ? "true" : undefined, children: [media === undefined ? null : (_jsx("span", { className: "louis-selectable-list-row__media", children: media })), _jsxs("span", { className: "louis-selectable-list-row__text", children: [_jsx("span", { className: "louis-selectable-list-row__title", children: title }), meta === undefined ? null : (_jsx("span", { className: "louis-selectable-list-row__meta", children: meta }))] }), trailing === undefined ? null : (_jsx("span", { className: "louis-selectable-list-row__trailing", children: trailing }))] }));
}
//# sourceMappingURL=selectable-list-row.js.map