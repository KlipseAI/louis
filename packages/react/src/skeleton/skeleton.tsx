import type { HTMLAttributes, JSX, Ref } from "react";

export type SkeletonShape = "block" | "text" | "circle";

export interface SkeletonProps extends Omit<HTMLAttributes<HTMLSpanElement>, "children"> {
  readonly shape?: SkeletonShape;
  readonly className?: string;
  readonly ref?: Ref<HTMLSpanElement>;
}

function join(...values: readonly (string | undefined)[]): string {
  return values.filter(Boolean).join(" ");
}

/**
 * design/components/skeleton.md의 계약을 구현한다.
 *
 * **면 색을 고르지 않는다.** 놓이는 자리의 글자색을 낮은 알파로 깐다 — 제품이 그렇게 하고,
 * 그래서 테마별로 면을 고를 필요가 없다.
 *
 * 크기는 호출부가 정한다. 자리표시가 대신할 것의 크기는 그 자리마다 다르므로 컴포넌트가
 * 정할 수 없다.
 */
export function Skeleton({ shape = "block", className, ...rest }: SkeletonProps): JSX.Element {
  return (
    <span
      {...rest}
      className={join("louis-skeleton", className)}
      data-shape={shape}
      // 자리표시는 읽히지 않는다. 로딩을 알리는 것은 이 요소가 아니라 그것을 감싸는 영역의
      // aria-busy 또는 live region의 일이다 — 스켈레톤마다 읽히면 소음이 된다.
      aria-hidden
    />
  );
}
