import { type JSX, type ReactNode } from "react";
export type ToastTone = "neutral" | "danger";
/**
 * 표면에 담기는 것이 달라지는 축. 크기 사다리가 아니다.
 *
 * `base` 는 한 줄 메시지, `callout` 은 제목/본문 두 줄과 그 옆의 액션이다. 제품 정본은
 * 노드 캔버스 온보딩 힌트 두 벌(`CanvasConnectHint` · `CanvasNextStepHint`)이며, 표면 원장이
 * 뒤엣것을 「같은 CALLOUT 표면을 공유하고 문구만 다르다」로 이미 접어 두었다.
 */
export type ToastLayout = "base" | "callout";
/** callout 의 액션 슬롯. 라벨 하나와 그것을 누른 결과 하나다. */
export interface ToastAction {
    readonly label: string;
    readonly onAction: () => void;
    /** 누른 뒤 toast 를 닫는다. 온보딩 힌트의 「알겠어요」가 그렇다. */
    readonly dismissOnAction?: boolean;
}
export interface ToastInput {
    /** 한 줄. live region이 읽는 것이므로 문자열만 받는다. */
    readonly message: string;
    readonly tone?: ToastTone;
    /** 자동 소멸까지. 0이면 스스로 사라지지 않는다. */
    readonly duration?: number;
    /**
     * callout 의 제목. 있으면 `message` 가 본문이 된다.
     *
     * live region 이 읽는 순서가 DOM 순서이므로 제목이 먼저 읽힌다 — 두 줄을 따로 통지하지
     * 않는다.
     */
    readonly title?: string;
    /** callout 의 액션. */
    readonly action?: ToastAction;
    /**
     * 비우면 **내용에서 정한다** — 제목이나 액션이 있으면 `callout`, 없으면 `base`.
     *
     * 축을 명시로도 열어 두는 이유는 Figma 의 `Layout` variant 와 이름이 1:1로 맞아야 하기
     * 때문이다. 유추만 두면 계약이 대조할 타입이 없다.
     */
    readonly layout?: ToastLayout;
}
export interface ToastHandle {
    /** 이 toast를 지운다. 이미 사라졌으면 아무 일도 하지 않는다. */
    (): void;
}
export interface ToastContextValue {
    readonly toast: (input: ToastInput | string) => ToastHandle;
    /** 모두 지운다. 라우트 전환처럼 문맥이 바뀔 때 쓴다. */
    readonly dismissAll: () => void;
}
/** 동시에 보이는 최대 개수. 초과분은 자리가 날 때까지 기다린다. */
export declare const TOAST_VISIBLE_LIMIT = 3;
export declare function useToast(): ToastContextValue;
export interface ToastProviderProps {
    readonly children: ReactNode;
    /** 기본 자동 소멸 시간. 개별 toast가 덮어쓸 수 있다. */
    readonly duration?: number;
}
/**
 * design/components/toast.md의 계약을 구현한다.
 *
 * live region 둘을 **처음부터** 렌더한다. 보조 기술은 region이 존재한 뒤의 변화만 감지하므로,
 * toast가 생길 때 region을 함께 만들면 그 첫 메시지가 읽히지 않는다.
 *
 * polite와 assertive를 **별도 region**에 둔다. 하나의 region에서 `aria-live`를 바꾸면 그 시점의
 * 변경이 유실된다.
 */
export declare function ToastProvider({ children, duration, }: ToastProviderProps): JSX.Element;
//# sourceMappingURL=toast.d.ts.map