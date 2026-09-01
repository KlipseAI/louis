import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
function join(...values) {
    return values.filter(Boolean).join(" ");
}
/**
 * design/components/empty-state.md의 계약을 구현한다.
 *
 * **오류 상태가 아니다.** 제품의 프로젝트 피커는 "목록이 비었다"와 "불러오지 못했다"를 같은 빨간
 * 표현으로 합쳐 두었는데, 그 둘은 사용자가 취할 행동이 다르다 — 없으면 만들면 되고 실패했으면 다시
 * 시도해야 한다. 이 컴포넌트는 앞쪽만 다룬다.
 *
 * `aria-live`를 붙이지 않는다. 빈 상태는 목록이 로드된 **결과**이고, 로딩 중임을 알리는 것은 이미
 * 다른 요소의 일이다. 여기에 live region을 두면 화면을 옮길 때마다 다시 읽힌다. 대신 제목이
 * heading이라 랜드마크 탐색으로 닿는다.
 */
export function EmptyState({ title, description, graphic, action, headingLevel = 2, className, ...rest }) {
    const Heading = `h${headingLevel}`;
    return (_jsxs("div", { ...rest, className: join("louis-empty-state", className), children: [graphic === undefined ? null : (
            // 그래픽은 제목이 말하는 것을 반복할 뿐이라 보조기술에서 숨긴다.
            _jsx("div", { className: "louis-empty-state__graphic", "aria-hidden": "true", children: graphic })), _jsx(Heading, { className: "louis-empty-state__title", children: title }), description === undefined ? null : (_jsx("p", { className: "louis-empty-state__description", children: description })), action === undefined ? null : _jsx("div", { className: "louis-empty-state__action", children: action })] }));
}
//# sourceMappingURL=empty-state.js.map