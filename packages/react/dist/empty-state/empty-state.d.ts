import type { HTMLAttributes, JSX, ReactNode, Ref } from "react";
/** 제목이 될 heading 단계. 화면의 문서 구조가 정하므로 컴포넌트가 고정하지 않는다. */
export type EmptyStateHeadingLevel = 2 | 3 | 4 | 5 | 6;
export interface EmptyStateProps extends Omit<HTMLAttributes<HTMLDivElement>, "title"> {
    /** 무엇이 없는지. 문장이 아니라 사실을 말한다 — "아직 프로젝트가 없습니다". */
    readonly title: ReactNode;
    /** 다음에 무엇을 하면 되는지. 없어도 된다. */
    readonly description?: ReactNode;
    /**
     * 64px 그래픽. **선택이다** — 제품의 페이지 빈 상태는 아이콘을 넣지 않고 캔버스 빈 상태만 넣는다.
     */
    readonly graphic?: ReactNode;
    /** 행동 유도. 보통 Button 하나다. */
    readonly action?: ReactNode;
    /**
     * 제목의 heading 단계. 기본은 `2`다.
     *
     * 컴포넌트가 고정하지 않는 이유는 빈 상태가 어디에 놓이는지에 따라 문서 구조가 달라지기
     * 때문이다. 섹션 안에 놓이면 h3여야 하고 페이지 본문이면 h2다.
     */
    readonly headingLevel?: EmptyStateHeadingLevel;
    readonly ref?: Ref<HTMLDivElement>;
}
/**
 * design/components/empty-state.md의 계약을 구현한다.
 *
 * **오류 상태가 아니다.** 제품의 프로젝트 피커는 "목록이 비었다"와 "불러오지 못했다"를 같은 빨간
 * 표현으로 합쳐 두었는데, 그 둘은 사용자가 취할 행동이 다르다 — 없으면 만들면 되고 실패했으면 다시
 * 시도해야 한다. 이 컴포넌트는 앞쪽만 다룬다.
 *
 * `aria-live`를 붙이지 않는다. 빈 상태는 목록이 로드된 **결과**이고, 로딩 중임을 알리는 것은 이미
 * 다른 요소의 일이다. 여기에 live region을 두면 화면을 옮길 때마다 다시 읽힌다. 대신 제목이
 * heading이라 랜드마크 탐색으로 닿는다.
 */
export declare function EmptyState({ title, description, graphic, action, headingLevel, className, ...rest }: EmptyStateProps): JSX.Element;
//# sourceMappingURL=empty-state.d.ts.map