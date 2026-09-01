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
/**
 * design/components/avatar.md의 계약을 구현한다.
 *
 * **링을 소유하지 않는다.** 제품은 프로필 트리거에 진행률 링을 겹치지만 아바타는 신원 표식이고
 * 링은 사용량이다. 링은 인계서 (1c)가 풀린 뒤 아바타를 감싸는 별개 컴포넌트로 세운다.
 */
export declare function Avatar({ src, name, size, className, ref, ...rest }: AvatarProps): JSX.Element;
//# sourceMappingURL=avatar.d.ts.map