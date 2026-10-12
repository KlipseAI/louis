import type { AnchorHTMLAttributes, InputHTMLAttributes, ButtonHTMLAttributes, HTMLAttributes, JSX, Ref } from "react";
export type ProjectCardAdornmentPlacement = "top-start" | "top-end";
export interface ProjectCardProps extends HTMLAttributes<HTMLDivElement> {
    /**
     * 목록 진입 stagger의 순서. 주지 않으면 애니메이션하지 않는다.
     *
     * 페이지를 다시 여는 것이 아니라 **처음 그려질 때만** 준다. 스크롤로 더 불러온 카드에 0부터
     * 다시 주면 이미 있던 카드가 함께 튄다.
     */
    readonly enterIndex?: number;
    readonly ref?: Ref<HTMLDivElement>;
}
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
export declare function ProjectCard({ className, children, enterIndex, style, ...rest }: ProjectCardProps): JSX.Element;
export interface ProjectCardActionButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "type"> {
    readonly href?: undefined;
    readonly ref?: Ref<HTMLButtonElement>;
}
export interface ProjectCardActionLinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
    /** 목적지가 있으면 링크다. 새 탭·복사·미들클릭이 브라우저 기본으로 동작한다. */
    readonly href: string;
    readonly ref?: Ref<HTMLAnchorElement>;
}
export type ProjectCardActionProps = ProjectCardActionButtonProps | ProjectCardActionLinkProps;
/**
 * 카드 전체를 덮는 클릭 타깃. **Media 뒤, Adornment 앞에 둔다.**
 *
 * 이름은 `ProjectCardTitle`에서 가져온다. 호출부가 `aria-label`이나 `aria-labelledby`를 직접 주면
 * 그것이 이긴다 — 제목이 없는 카드(썸네일만 있는 카드)가 그 경우다.
 */
export declare function ProjectCardAction(props: ProjectCardActionProps): JSX.Element;
export interface ProjectCardMediaProps extends HTMLAttributes<HTMLDivElement> {
    /**
     * 폭 대 높이. 기본은 1(정사각)이며 제품의 홈 그리드와 같다.
     *
     * **양수가 아니면 무시한다.** 0이나 음수를 그대로 넘기면 미디어 면의 높이가 0이 되어 카드가
     * 테두리만 남고, 그 안의 절대 위치 자식이 전부 사라진다. 계산 결과가 실수로 흘러드는 자리라
     * 여기서 막는다.
     */
    readonly aspectRatio?: number;
    readonly ref?: Ref<HTMLDivElement>;
}
export declare function ProjectCardMedia({ aspectRatio, className, style, ...rest }: ProjectCardMediaProps): JSX.Element;
export interface ProjectCardPlaceholderProps extends HTMLAttributes<HTMLDivElement> {
    readonly ref?: Ref<HTMLDivElement>;
}
/** 썸네일이 아직 없거나 만들 수 없을 때 미디어 면을 채운다. */
export declare function ProjectCardPlaceholder({ className, ...rest }: ProjectCardPlaceholderProps): JSX.Element;
export interface ProjectCardThumbnailProps extends HTMLAttributes<HTMLDivElement> {
    readonly ref?: Ref<HTMLDivElement>;
}
/**
 * 썸네일 자리. `<img>`나 `<video>`를 그대로 자식으로 둔다.
 *
 * CSS가 `.louis-project-card-media > img`를 직접 잡으면 Next.js `Image`처럼 **래퍼를 하나 더 만드는
 * 컴포넌트**를 넣는 순간 선택자가 빗나가 썸네일이 면을 못 채운다. 그 자리를 이 요소가 대신 잡는다.
 */
export declare function ProjectCardThumbnail({ className, ...rest }: ProjectCardThumbnailProps): JSX.Element;
/** 띠 글자의 잉크. 썸네일 밝기를 재는 일은 호출부의 것이고, 결과만 받는다(DS-D-0083). */
export type ProjectCardOverlayInk = "on-dark" | "on-bright";
export interface ProjectCardOverlayProps extends HTMLAttributes<HTMLDivElement> {
    /** 생략하면 테마를 따르는 기본 잉크(`fg-*`)다. */
    readonly ink?: ProjectCardOverlayInk;
    readonly ref?: Ref<HTMLDivElement>;
}
/**
 * 미디어 하단의 제목 영역. 흐림 층과 텍스트 stack을 함께 소유한다.
 *
 * 흐림은 `::before`가 칠하므로 DOM 자식이 아니다. 텍스트는 별도 wrapper 안에 들어가야
 * `align-items: flex-end`와 stack의 `gap`이 서로 간섭하지 않는다.
 */
export declare function ProjectCardOverlay({ ink, className, children, ...rest }: ProjectCardOverlayProps): JSX.Element;
export interface ProjectCardTextProps extends HTMLAttributes<HTMLSpanElement> {
    readonly ref?: Ref<HTMLSpanElement>;
}
/** 제목 위 한 줄 — 종류나 분류. 없어도 된다. */
export declare function ProjectCardEyebrow({ className, ...rest }: ProjectCardTextProps): JSX.Element;
/** 제목. 클릭 타깃의 접근 가능한 이름이 여기서 온다. */
export declare function ProjectCardTitle({ className, id, ...rest }: ProjectCardTextProps): JSX.Element;
/** 제목 아래 한 줄 — 마지막 편집 시각 같은 보조 정보. 없어도 된다. */
export declare function ProjectCardMeta({ className, ...rest }: ProjectCardTextProps): JSX.Element;
export interface ProjectCardAdornmentProps extends HTMLAttributes<HTMLDivElement> {
    /** 미디어 면의 어느 모서리에 붙는지. 상태 칩은 top-start, 더보기 메뉴는 top-end다. */
    readonly placement?: ProjectCardAdornmentPlacement;
    readonly ref?: Ref<HTMLDivElement>;
}
/**
 * 카드 모서리의 슬롯 — 상태 칩과 더보기 메뉴가 들어간다.
 *
 * **`ProjectCardAction` 뒤에 둔다.** 앞에 두면 클릭 타깃이 위에 깔려 이 안의 컨트롤이 눌리지 않는다.
 */
export declare function ProjectCardAdornment({ placement, className, ...rest }: ProjectCardAdornmentProps): JSX.Element;
/**
 * 썸네일 위에 놓이는 더보기 버튼.
 *
 * **면이 사진이라 media 색을 쓴다.** 테마 색이면 밝은 썸네일 위에서 흰 버튼이 사라진다.
 * 평소 숨어 있다가 hover나 초점에서 드러나며, **초점을 빼면 키보드로 닿을 수 없다.**
 */
export interface ProjectCardMoreProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    /** 접근 가능한 이름. 아이콘만 있으므로 **필수다.** */
    readonly label: string;
    readonly ref?: Ref<HTMLButtonElement>;
}
export declare function ProjectCardMore({ label, className, children, ref, ...rest }: ProjectCardMoreProps): JSX.Element;
/**
 * 제목 자리에서 그대로 이름을 바꾼다.
 *
 * 크롬이 없어야 자리가 흔들리지 않는다 — 테두리나 면이 생기면 글자가 밀려 "다른 곳으로 갔다"처럼
 * 보인다. 그래서 초점 표시만 남기고 전부 지운다.
 */
export interface ProjectCardRenameProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
    readonly label: string;
    readonly ref?: Ref<HTMLInputElement>;
}
export declare function ProjectCardRename({ label, className, ref, ...rest }: ProjectCardRenameProps): JSX.Element;
//# sourceMappingURL=project-card.d.ts.map