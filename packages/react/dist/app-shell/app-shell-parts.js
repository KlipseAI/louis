import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
function join(...values) {
    return values.filter(Boolean).join(" ");
}
/**
 * design/components/app-shell-parts.md의 계약을 구현한다.
 *
 * **목적지가 있으면 링크다.** 제품의 앱 셸 소비처 25곳이 전부 `onNavigate`를 넘겨 `<button>`
 * 분기를 타는데, 그 결과 새 탭·링크 복사·미들클릭이 전부 죽는다. 여기서는 `href`가 있으면
 * `<a>`이고, 라우터 가로채기는 호출부가 `onClick`에서 한다.
 */
export function SidebarNavItem(props) {
    const { icon, trailing, current = false, collapsed = false, className, children } = props;
    const shared = {
        className: join("louis-sidebar-nav-item", "louis-focus-ring", className),
        "aria-current": current ? "page" : undefined,
        "data-collapsed": collapsed ? "true" : undefined,
    };
    const body = (_jsxs(_Fragment, { children: [icon === undefined ? null : (
            // 라벨이 이름을 소유하므로 아이콘은 장식이다.
            _jsx("span", { className: "louis-sidebar-nav-item__icon", "aria-hidden": "true", children: icon })), _jsx("span", { className: "louis-sidebar-nav-item__label", children: children }), trailing === undefined ? null : (_jsx("span", { className: "louis-sidebar-nav-item__trailing", children: trailing }))] }));
    if (props.href !== undefined) {
        const { icon: _i, trailing: _t, current: _c, collapsed: _co, className: _cl, children: _ch, ...rest } = props;
        return (_jsx("a", { ...rest, ...shared, children: body }));
    }
    const { icon: _i, trailing: _t, current: _c, collapsed: _co, className: _cl, children: _ch, ...rest } = props;
    return (_jsx("button", { ...rest, ...shared, type: "button", children: body }));
}
/**
 * 내비 항목 하나와 보조 액션을 한 줄에 놓는다.
 *
 * 배포본에는 이 형태가 두 화면에 있다(하이라이트 허브 · 비디오에디터 허브). 행 전체가 하나의
 * 히트 영역인 보통 항목과 달리, 여기서는 **두 개의 목적지가 한 줄을 나눠 쓴다** — 왼쪽은
 * "그 화면으로", 오른쪽 「+」는 "새로 만들기"다.
 */
export function SidebarNavRow({ children, action, collapsed = false, className, ...rest }) {
    return (_jsxs("div", { ...rest, className: join("louis-sidebar-nav-row", className), "data-collapsed": collapsed ? "true" : undefined, children: [children, action === undefined || collapsed ? null : (_jsx("span", { className: "louis-sidebar-nav-row__action", children: action }))] }));
}
/**
 * 셸의 top chrome 한 줄.
 *
 * **레이아웃은 이 컴포넌트의 것이 아니다.** 어디에 붙는지, 스크롤 루트가 어디인지,
 * 본문과 좌우 inset을 어떻게 맞추는지는 design/patterns/app-shell.md가 소유한다.
 */
export function AppTopBar({ leading, title, trailing, divider = false, className, children, ...rest }) {
    return (_jsxs("div", { ...rest, className: join("louis-app-top-bar", className), "data-divider": divider ? "true" : undefined, children: [leading === undefined ? null : (_jsx("span", { className: "louis-app-top-bar__leading", children: leading })), title === undefined ? null : _jsx("span", { className: "louis-app-top-bar__title", children: title }), children, trailing === undefined ? null : (_jsx("span", { className: "louis-app-top-bar__trailing", children: trailing }))] }));
}
export function SidebarBrand({ mark, wordmark, collapsed = false, className, ref, ...rest }) {
    return (_jsxs("div", { ...rest, ref: ref, className: ["louis-sidebar-brand", className].filter(Boolean).join(" "), "data-collapsed": collapsed ? "true" : "false", children: [_jsx("span", { className: "louis-sidebar-brand__mark", "aria-hidden": "true", children: mark }), _jsx("span", { className: "louis-sidebar-brand__wordmark", children: wordmark })] }));
}
export function SidebarCta({ label, collapsed = false, current = false, onActivate, className, ref, ...rest }) {
    return (_jsx("div", { ...rest, ref: ref, className: ["louis-sidebar-cta", className].filter(Boolean).join(" "), "data-collapsed": collapsed ? "true" : "false", children: _jsx("button", { type: "button", className: "louis-sidebar-cta__button", "aria-current": current ? "page" : undefined, onClick: onActivate, children: _jsx("span", { className: "louis-sidebar-cta__label", children: label }) }) }));
}
//# sourceMappingURL=app-shell-parts.js.map