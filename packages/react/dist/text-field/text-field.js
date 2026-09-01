import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useId } from "react";
function join(...values) {
    return values.filter(Boolean).join(" ");
}
/**
 * design/components/text-field.md의 계약을 구현한다.
 *
 * **시각적 필드는 `<input>`이 아니라 감싸는 박스다.** 접두 아이콘과 접미 버튼을 필드 안에 두려면
 * `<input>` 하나로는 안 되고, 포커스 링도 박스가 `:focus-within`으로 받아야 슬롯까지 함께 둘린다.
 *
 * id는 컴포넌트가 발급한다. 호출부가 만들면 같은 화면에 필드가 여럿일 때 겹친다.
 */
export function TextField({ label, size = "lg", description, invalid = false, prefix, suffix, type = "text", className, id, disabled, ...rest }) {
    const generated = useId();
    const controlId = id ?? generated;
    const messageId = `${controlId}-message`;
    const describedBy = description === undefined
        ? rest["aria-describedby"]
        : join(rest["aria-describedby"], messageId);
    return (_jsxs("div", { className: join("louis-text-field", className), "data-size": size, "data-invalid": invalid ? "true" : undefined, children: [label === undefined ? null : (_jsx("label", { className: "louis-text-field__label", htmlFor: controlId, children: label })), _jsxs("div", { className: "louis-text-field__box", children: [prefix === undefined ? null : (_jsx("span", { className: "louis-text-field__adornment", children: prefix })), _jsx("input", { ...rest, id: controlId, type: type, disabled: disabled, className: "louis-text-field__control", "aria-invalid": invalid ? "true" : undefined, "aria-describedby": describedBy }), suffix === undefined ? null : (_jsx("span", { className: "louis-text-field__adornment", children: suffix }))] }), description === undefined ? null : (_jsx("p", { id: messageId, className: "louis-text-field__message", 
                // 오류는 뜨는 즉시 읽혀야 한다. 도움말은 그렇지 않다 — 포커스할 때 함께 읽힌다.
                role: invalid ? "alert" : undefined, children: description }))] }));
}
//# sourceMappingURL=text-field.js.map