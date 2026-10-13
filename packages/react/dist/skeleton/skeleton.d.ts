import type { HTMLAttributes, JSX, Ref } from "react";
export type SkeletonShape = "block" | "text" | "circle" | "line";
export interface SkeletonProps extends Omit<HTMLAttributes<HTMLSpanElement>, "children"> {
    readonly shape?: SkeletonShape;
    readonly className?: string;
    readonly ref?: Ref<HTMLSpanElement>;
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
export declare function Skeleton({ shape, className, ...rest }: SkeletonProps): JSX.Element;
//# sourceMappingURL=skeleton.d.ts.map