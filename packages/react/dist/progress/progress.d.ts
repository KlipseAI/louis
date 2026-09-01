import type { HTMLAttributes, JSX, ReactNode, Ref } from "react";
interface ProgressCommonProps {
    /** 0~100. `indeterminate`면 무시된다. */
    readonly value?: number;
    /**
     * 얼마나 걸릴지 모르는 상태. **`aria-valuenow`를 넣지 않는다** — 0을 넣으면 "0% 완료"로 읽히고
     * 그것은 "모른다"와 다른 말이다.
     */
    readonly indeterminate?: boolean;
    /** 숫자만으로 뜻이 서지 않을 때 준다. "3분 남음", "12개 중 7개". */
    readonly valueText?: string;
}
export interface ProgressBarProps extends ProgressCommonProps, Omit<HTMLAttributes<HTMLDivElement>, "role" | "children"> {
    readonly ref?: Ref<HTMLDivElement>;
}
export declare function ProgressBar({ value, indeterminate, valueText, className, style, ref, "aria-label": label, "aria-labelledby": labelledBy, ...rest }: ProgressBarProps): JSX.Element;
export interface ProgressRingProps extends ProgressCommonProps, Omit<HTMLAttributes<HTMLDivElement>, "role"> {
    /** 링이 감싸는 것. 보통 Avatar다. 링은 지름을 내용에서 얻는다. */
    readonly children: ReactNode;
    readonly ref?: Ref<HTMLDivElement>;
}
export declare function ProgressRing({ value, indeterminate, valueText, children, className, style, ref, "aria-label": label, "aria-labelledby": labelledBy, ...rest }: ProgressRingProps): JSX.Element;
export {};
//# sourceMappingURL=progress.d.ts.map