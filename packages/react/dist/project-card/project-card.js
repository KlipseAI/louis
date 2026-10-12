"use client";
import { jsx as _jsx } from "react/jsx-runtime";
import { createContext, useContext, useId } from "react";
function join(...values) {
    return values.filter(Boolean).join(" ");
}
/**
 * 카드 안에서 제목의 id를 나눠 갖는다.
 *
 * 클릭 타깃(`ProjectCardAction`)은 제목을 **자손으로 갖지 않으므로** 스스로 이름이 없다. id를
 * 호출부가 만들면 같은 화면에 카드가 여럿일 때 겹치므로 여기서 인스턴스마다 발급한다 —
 * overlay primitive의 panelLabel sentinel과 같은 판단이다.
 */
const ProjectCardContext = createContext(null);
/**
 * design/components/project-card.md의 계약을 구현한다.
 *
 * **root는 프레임이고 클릭 타깃은 그 자식이다.** 처음에는 root 자체를 `<a>`/`<button>`으로 두었는데,
 * 그러면 슬롯 안의 더보기 버튼이 `<a>` 안의 대화형 자손이 되어 HTML이 무효가 되고 보조기술에서
 * 동작이 정의되지 않는다. 규범 문서가 바로 그 사용을 예시로 들고 있었다.
 *
 * 그래서 링크를 카드 전체에 늘려 깔고 슬롯을 그 위에 형제로 둔다. 자식 순서가 계약이다 —
 * Media → Action → Adornment. 숫자 z-index를 쓰지 않으므로 칠 순서가 곧 DOM 순서다.
 */
export function ProjectCard({ className, children, enterIndex, style, ...rest }) {
    const titleId = useId();
    return (_jsx(ProjectCardContext.Provider, { value: titleId, children: _jsx("div", { ...rest, className: join("louis-project-card", className), "data-enter": enterIndex === undefined ? undefined : "true", style: enterIndex === undefined
                ? style
                : { ...style, "--louis-project-card-index": enterIndex }, children: children }) }));
}
/**
 * 카드 전체를 덮는 클릭 타깃. **Media 뒤, Adornment 앞에 둔다.**
 *
 * 이름은 `ProjectCardTitle`에서 가져온다. 호출부가 `aria-label`이나 `aria-labelledby`를 직접 주면
 * 그것이 이긴다 — 제목이 없는 카드(썸네일만 있는 카드)가 그 경우다.
 */
export function ProjectCardAction(props) {
    const titleId = useContext(ProjectCardContext);
    const labelled = props["aria-label"] === undefined && props["aria-labelledby"] === undefined && titleId !== null
        ? { "aria-labelledby": titleId }
        : {};
    if (props.href !== undefined) {
        const { className, ...rest } = props;
        return (_jsx("a", { ...rest, ...labelled, className: join("louis-project-card-action", className) }));
    }
    const { className, ...rest } = props;
    return (_jsx("button", { ...rest, ...labelled, type: "button", className: join("louis-project-card-action", className) }));
}
export function ProjectCardMedia({ aspectRatio, className, style, ...rest }) {
    const usable = typeof aspectRatio === "number" && Number.isFinite(aspectRatio) && aspectRatio > 0;
    return (_jsx("div", { ...rest, className: join("louis-project-card-media", className), style: usable
            ? { ...style, ["--louis-project-card-aspect-ratio"]: `${aspectRatio}` }
            : style }));
}
/** 썸네일이 아직 없거나 만들 수 없을 때 미디어 면을 채운다. */
export function ProjectCardPlaceholder({ className, ...rest }) {
    return _jsx("div", { ...rest, className: join("louis-project-card-placeholder", className) });
}
/**
 * 썸네일 자리. `<img>`나 `<video>`를 그대로 자식으로 둔다.
 *
 * CSS가 `.louis-project-card-media > img`를 직접 잡으면 Next.js `Image`처럼 **래퍼를 하나 더 만드는
 * 컴포넌트**를 넣는 순간 선택자가 빗나가 썸네일이 면을 못 채운다. 그 자리를 이 요소가 대신 잡는다.
 */
export function ProjectCardThumbnail({ className, ...rest }) {
    return _jsx("div", { ...rest, className: join("louis-project-card-thumbnail", className) });
}
/**
 * 미디어 하단의 제목 영역. 흐림 층과 텍스트 stack을 함께 소유한다.
 *
 * 흐림은 `::before`가 칠하므로 DOM 자식이 아니다. 텍스트는 별도 wrapper 안에 들어가야
 * `align-items: flex-end`와 stack의 `gap`이 서로 간섭하지 않는다.
 */
export function ProjectCardOverlay({ ink, className, children, ...rest }) {
    return (_jsx("div", { ...rest, className: join("louis-project-card-overlay", className), "data-ink": ink, children: _jsx("div", { className: "louis-project-card-overlay-content", children: children }) }));
}
/** 제목 위 한 줄 — 종류나 분류. 없어도 된다. */
export function ProjectCardEyebrow({ className, ...rest }) {
    return _jsx("span", { ...rest, className: join("louis-project-card-eyebrow", className) });
}
/** 제목. 클릭 타깃의 접근 가능한 이름이 여기서 온다. */
export function ProjectCardTitle({ className, id, ...rest }) {
    const titleId = useContext(ProjectCardContext);
    return (_jsx("span", { ...rest, id: id ?? titleId ?? undefined, className: join("louis-project-card-title", className) }));
}
/** 제목 아래 한 줄 — 마지막 편집 시각 같은 보조 정보. 없어도 된다. */
export function ProjectCardMeta({ className, ...rest }) {
    return _jsx("span", { ...rest, className: join("louis-project-card-meta", className) });
}
/**
 * 카드 모서리의 슬롯 — 상태 칩과 더보기 메뉴가 들어간다.
 *
 * **`ProjectCardAction` 뒤에 둔다.** 앞에 두면 클릭 타깃이 위에 깔려 이 안의 컨트롤이 눌리지 않는다.
 */
export function ProjectCardAdornment({ placement = "top-end", className, ...rest }) {
    return (_jsx("div", { ...rest, className: join("louis-project-card-adornment", className), "data-placement": placement }));
}
export function ProjectCardMore({ label, className, children, ref, ...rest }) {
    return (_jsx("button", { ...rest, ref: ref, type: "button", className: join("louis-project-card-more", className), "aria-label": label, children: children }));
}
export function ProjectCardRename({ label, className, ref, ...rest }) {
    return (_jsx("input", { ...rest, ref: ref, type: "text", className: join("louis-project-card-rename", className), "aria-label": label }));
}
//# sourceMappingURL=project-card.js.map