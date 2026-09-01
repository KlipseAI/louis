import type { ButtonHTMLAttributes, JSX, ReactNode, Ref } from "react";
export type ButtonVariant = "primary" | "secondary" | "ghost" | "danger" | "inverse";
export type ButtonSize = "lg" | "md" | "sm";
export interface ButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "type"> {
    /** 강조와 의미. 한 영역에 경쟁하는 primary를 여러 개 두지 않는다. */
    readonly variant?: ButtonVariant;
    /** 시각 크기. hit area 계약은 크기와 무관하게 유지된다. */
    readonly size?: ButtonSize;
    /** 중복 실행을 차단하고 aria-busy와 progress indicator를 제공한다. focus는 유지된다. */
    readonly loading?: boolean;
    readonly leftIcon?: ReactNode;
    readonly rightIcon?: ReactNode;
    /** 기본값은 button이다. 폼 제출은 호출부가 submit을 명시한다. */
    readonly type?: "button" | "submit" | "reset";
    readonly ref?: Ref<HTMLButtonElement>;
}
/**
 * design/components/button.md의 계약을 구현한다.
 *
 * 활성화는 네이티브 `<button>`에 맡긴다. pointer click, Enter, Space가 각각 정확히 한 번
 * 실행되는 것은 브라우저가 보장하며, 여기서 keydown으로 클릭을 흉내 내면 중복 실행이 된다.
 *
 * `loading`은 네이티브 `disabled`를 쓰지 않는다. 네이티브 disabled는 현재 focus를 제거하는데
 * 규범이 이를 금지하기 때문이다. 대신 `aria-disabled`로 표시하고 activation을 명시적으로 막는다.
 */
export declare function Button({ variant, size, loading, leftIcon, rightIcon, type, className, children, disabled, onClick, ...rest }: ButtonProps): JSX.Element;
//# sourceMappingURL=button.d.ts.map