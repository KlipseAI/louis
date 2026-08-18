import type { HTMLAttributes, JSX, Ref } from "react";

export type AvatarSize = "md" | "sm";

export interface AvatarProps extends Omit<HTMLAttributes<HTMLSpanElement>, "children"> {
  /** 이미지 주소. 없으면 폴백 글리프를 그린다. */
  readonly src?: string;
  /**
   * 사람 이름. 접근성 이름이 된다.
   *
   * **생략하면 장식으로 본다** — 옆에 이름이 이미 적혀 있는 자리(목록 행, 댓글 머리)가 그렇다.
   * 그때 아바타를 다시 읽으면 같은 이름이 두 번 들린다.
   */
  readonly name?: string;
  readonly size?: AvatarSize;
  readonly className?: string;
  readonly ref?: Ref<HTMLSpanElement>;
}

function join(...values: readonly (string | undefined)[]): string {
  return values.filter(Boolean).join(" ");
}

/**
 * design/components/avatar.md의 계약을 구현한다.
 *
 * **링을 소유하지 않는다.** 제품은 프로필 트리거에 진행률 링을 겹치지만 아바타는 신원 표식이고
 * 링은 사용량이다. 링은 인계서 (1c)가 풀린 뒤 아바타를 감싸는 별개 컴포넌트로 세운다.
 */
export function Avatar({
  src,
  name,
  size = "md",
  className,
  ref,
  ...rest
}: AvatarProps): JSX.Element {
  const decorative = name === undefined;
  return (
    <span
      {...rest}
      ref={ref}
      className={join("kds-avatar", className)}
      data-size={size}
      // 이름이 없으면 장식이다. 있으면 이미지가 없어도 이름은 남아야 한다.
      role={decorative ? undefined : "img"}
      aria-label={decorative ? undefined : name}
      aria-hidden={decorative ? true : undefined}
    >
      {src === undefined ? (
        // 폴백 글리프. 바깥이 접근성 이름을 소유하므로 여기는 항상 장식이다.
        <svg
          className="kds-avatar__fallback"
          viewBox="0 0 20 20"
          xmlns="http://www.w3.org/2000/svg"
          focusable="false"
          aria-hidden
        >
          <path
            fill="currentColor"
            d="M10 10a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm0 1.5c-2.8 0-5 1.6-5 3.6V16h10v-.9c0-2-2.2-3.6-5-3.6Z"
          />
        </svg>
      ) : (
        // alt를 비운다 — 바깥 span이 role="img"과 이름을 갖는다. 둘 다 이름을 가지면 두 번 읽힌다.
        <img className="kds-avatar__image" src={src} alt="" />
      )}
    </span>
  );
}
