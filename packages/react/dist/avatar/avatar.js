import { jsx as _jsx } from "react/jsx-runtime";
function join(...values) {
    return values.filter(Boolean).join(" ");
}
/**
 * design/components/avatar.md의 계약을 구현한다.
 *
 * **링을 소유하지 않는다.** 제품은 프로필 트리거에 진행률 링을 겹치지만 아바타는 신원 표식이고
 * 링은 사용량이다. 링은 인계서 (1c)가 풀린 뒤 아바타를 감싸는 별개 컴포넌트로 세운다.
 */
export function Avatar({ src, name, size = "md", className, ref, ...rest }) {
    const decorative = name === undefined;
    return (_jsx("span", { ...rest, ref: ref, className: join("louis-avatar", className), "data-size": size, 
        // 이름이 없으면 장식이다. 있으면 이미지가 없어도 이름은 남아야 한다.
        role: decorative ? undefined : "img", "aria-label": decorative ? undefined : name, "aria-hidden": decorative ? true : undefined, children: src === undefined ? (
        // 폴백 글리프. 바깥이 접근성 이름을 소유하므로 여기는 항상 장식이다.
        _jsx("svg", { className: "louis-avatar__fallback", viewBox: "0 0 20 20", xmlns: "http://www.w3.org/2000/svg", focusable: "false", "aria-hidden": true, children: _jsx("path", { fill: "currentColor", d: "M10 10a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm0 1.5c-2.8 0-5 1.6-5 3.6V16h10v-.9c0-2-2.2-3.6-5-3.6Z" }) })) : (
        // alt를 비운다 — 바깥 span이 role="img"과 이름을 갖는다. 둘 다 이름을 가지면 두 번 읽힌다.
        _jsx("img", { className: "louis-avatar__image", src: src, alt: "" })) }));
}
//# sourceMappingURL=avatar.js.map