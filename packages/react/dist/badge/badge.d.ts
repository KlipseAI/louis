import type { HTMLAttributes, JSX, ReactNode, Ref } from "react";
/**
 * 배지의 의미 축.
 *
 * 제품은 상태 어휘가 최소 17벌이고 화면마다 다르다. 그 어휘를 그대로 옮기면 DS가 제품의 도메인을
 * 떠안는다. 대신 **네 상태 + 중립**으로 접고, 어느 도메인 값이 어느 tone인지는 호출부가 정한다.
 */
export type BadgeTone = "neutral" | "success" | "warning" | "danger" | "info";
export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
    readonly tone?: BadgeTone;
    /** 라벨 앞 아이콘. 크기는 글자를 따라간다(`1em`). */
    readonly icon?: ReactNode;
    /**
     * 라벨 앞 점. 아이콘보다 약한 신호다.
     *
     * `icon`과 함께 쓰지 않는다 — 둘 다 두면 같은 자리에서 두 신호가 경쟁한다.
     */
    readonly dot?: boolean;
    readonly ref?: Ref<HTMLSpanElement>;
}
/**
 * design/components/badge.md의 계약을 구현한다.
 *
 * **대화형이 아니다.** `<span>`이며 hover·focus·press 상태를 갖지 않고 44px hit target 규범의
 * 대상도 아니다. 누를 수 있는 배지가 필요하면 그것은 Button이거나 Chip이며 다른 컴포넌트다.
 *
 * **tone은 색만 바꾼다.** 색각 이상에서 tone이 전달되지 않으므로, 색이 유일한 신호가 되지 않도록
 * 라벨이 상태를 말해야 한다 — "완료"라고 쓰고 초록을 입히는 것이지 초록만으로 완료를 뜻하게
 * 하지 않는다. 그 책임은 호출부에 있고 문서가 그것을 요구한다.
 */
export declare function Badge({ tone, icon, dot, className, children, ...rest }: BadgeProps): JSX.Element;
//# sourceMappingURL=badge.d.ts.map