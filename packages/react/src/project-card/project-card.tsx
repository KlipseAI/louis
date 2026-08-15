import type {
  AnchorHTMLAttributes,
  ButtonHTMLAttributes,
  HTMLAttributes,
  JSX,
  Ref,
} from "react";

export type ProjectCardAdornmentPlacement = "top-start" | "top-end";

export interface ProjectCardButtonProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "type"> {
  readonly href?: undefined;
  readonly ref?: Ref<HTMLButtonElement>;
}

export interface ProjectCardLinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  /** 목적지가 있으면 링크로 렌더한다. 새 탭·복사·미들클릭이 브라우저 기본으로 동작한다. */
  readonly href: string;
  readonly ref?: Ref<HTMLAnchorElement>;
}

export type ProjectCardProps = ProjectCardButtonProps | ProjectCardLinkProps;

function join(...values: readonly (string | undefined)[]): string {
  return values.filter(Boolean).join(" ");
}

/**
 * design/components/project-card.md의 계약을 구현한다.
 *
 * **root는 네이티브 대화형 요소다.** 제품의 네 벌은 전부 `<article>`에 `onClick`을 걸어서
 * 키보드로 열 수 없고 스크린 리더에 버튼으로 읽히지도 않는다. 그 구조는 옮기지 않는다.
 * 목적지가 있으면 `<a>`, 없으면 `<button>`이다.
 *
 * 카드 안에 또 다른 컨트롤(더보기 메뉴 등)을 둘 때는 `<a>` 안에 `<button>`을 중첩할 수 없으므로
 * `ProjectCardAdornment`가 root 밖이 아니라 미디어 면 위에 절대 배치되며, 호출부는 그 컨트롤의
 * 이벤트 전파를 막는다.
 */
export function ProjectCard(props: ProjectCardProps): JSX.Element {
  const className = join("kds-project-card", "kds-focus-ring", props.className);

  if (props.href !== undefined) {
    const { className: _ignored, ...rest } = props;
    return <a {...rest} className={className} />;
  }

  const { className: _ignored, ...rest } = props;
  return <button {...rest} type="button" className={className} />;
}

export interface ProjectCardMediaProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * 폭 대 높이. 기본은 1(정사각)이며 제품의 홈 그리드와 같다.
   * 그리드마다 다를 수 있어 컴포넌트가 고정하지 않는다.
   */
  readonly aspectRatio?: number;
  readonly ref?: Ref<HTMLDivElement>;
}

export function ProjectCardMedia({
  aspectRatio,
  className,
  style,
  ...rest
}: ProjectCardMediaProps): JSX.Element {
  return (
    <div
      {...rest}
      className={join("kds-project-card-media", className)}
      style={
        aspectRatio === undefined
          ? style
          : { ...style, ["--kds-project-card-aspect-ratio" as string]: `${aspectRatio}` }
      }
    />
  );
}

export interface ProjectCardPlaceholderProps extends HTMLAttributes<HTMLDivElement> {
  readonly ref?: Ref<HTMLDivElement>;
}

/** 썸네일이 아직 없거나 만들 수 없을 때 미디어 면을 채운다. */
export function ProjectCardPlaceholder({
  className,
  ...rest
}: ProjectCardPlaceholderProps): JSX.Element {
  return <div {...rest} className={join("kds-project-card-placeholder", className)} />;
}

export interface ProjectCardOverlayProps extends HTMLAttributes<HTMLDivElement> {
  readonly ref?: Ref<HTMLDivElement>;
}

/**
 * 미디어 하단의 제목 영역. 흐림 층과 텍스트 stack을 함께 소유한다.
 *
 * 흐림은 `::before`가 칠하므로 DOM 자식이 아니다. 텍스트는 별도 wrapper 안에 들어가야
 * `align-items: flex-end`와 stack의 `gap`이 서로 간섭하지 않는다.
 */
export function ProjectCardOverlay({
  className,
  children,
  ...rest
}: ProjectCardOverlayProps): JSX.Element {
  return (
    <div {...rest} className={join("kds-project-card-overlay", className)}>
      <div className="kds-project-card-overlay-content">{children}</div>
    </div>
  );
}

export interface ProjectCardTextProps extends HTMLAttributes<HTMLSpanElement> {
  readonly ref?: Ref<HTMLSpanElement>;
}

/** 제목 위 한 줄 — 종류나 분류. 없어도 된다. */
export function ProjectCardEyebrow({
  className,
  ...rest
}: ProjectCardTextProps): JSX.Element {
  return <span {...rest} className={join("kds-project-card-eyebrow", className)} />;
}

export function ProjectCardTitle({
  className,
  ...rest
}: ProjectCardTextProps): JSX.Element {
  return <span {...rest} className={join("kds-project-card-title", className)} />;
}

/** 제목 아래 한 줄 — 마지막 편집 시각 같은 보조 정보. 없어도 된다. */
export function ProjectCardMeta({
  className,
  ...rest
}: ProjectCardTextProps): JSX.Element {
  return <span {...rest} className={join("kds-project-card-meta", className)} />;
}

export interface ProjectCardAdornmentProps extends HTMLAttributes<HTMLDivElement> {
  /** 미디어 면의 어느 모서리에 붙는지. 상태 칩은 top-start, 더보기 메뉴는 top-end다. */
  readonly placement?: ProjectCardAdornmentPlacement;
  readonly ref?: Ref<HTMLDivElement>;
}

export function ProjectCardAdornment({
  placement = "top-end",
  className,
  ...rest
}: ProjectCardAdornmentProps): JSX.Element {
  return (
    <div
      {...rest}
      className={join("kds-project-card-adornment", className)}
      data-placement={placement}
    />
  );
}
