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
        // 제품 `UserCircleDefaultAvatar.tsx` 의 그림 그대로다 — 원을 채운 사람 실루엣(user-circle-fill).
        _jsx("svg", { className: "louis-avatar__fallback", viewBox: "0 0 20 20", xmlns: "http://www.w3.org/2000/svg", focusable: "false", "aria-hidden": true, children: _jsx("path", { fill: "currentColor", fillRule: "evenodd", clipRule: "evenodd", d: "M10 0C4.477 0 0 4.477 0 10C0 15.523 4.477 20 10 20C15.523 20 20 15.523 20 10C20 4.477 15.523 0 10 0ZM6.5 7.5C6.5 7.04037 6.59053 6.58525 6.76642 6.16061C6.94231 5.73597 7.20012 5.35013 7.52513 5.02513C7.85013 4.70012 8.23597 4.44231 8.66061 4.26642C9.08525 4.09053 9.54037 4 10 4C10.4596 4 10.9148 4.09053 11.3394 4.26642C11.764 4.44231 12.1499 4.70012 12.4749 5.02513C12.7999 5.35013 13.0577 5.73597 13.2336 6.16061C13.4095 6.58525 13.5 7.04037 13.5 7.5C13.5 8.42826 13.1313 9.3185 12.4749 9.97487C11.8185 10.6313 10.9283 11 10 11C9.07174 11 8.1815 10.6313 7.52513 9.97487C6.86875 9.3185 6.5 8.42826 6.5 7.5ZM16.258 14.984C15.5092 15.9253 14.5575 16.6855 13.4739 17.2077C12.3904 17.7299 11.2029 18.0008 10 18C8.79715 18.0008 7.60965 17.7299 6.52607 17.2077C5.44249 16.6855 4.49081 15.9253 3.742 14.984C5.363 13.821 7.575 13 10 13C12.425 13 14.637 13.821 16.258 14.984Z" }) })) : (
        // alt를 비운다 — 바깥 span이 role="img"과 이름을 갖는다. 둘 다 이름을 가지면 두 번 읽힌다.
        _jsx("img", { className: "louis-avatar__image", src: src, alt: "" })) }));
}
//# sourceMappingURL=avatar.js.map