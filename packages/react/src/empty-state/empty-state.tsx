import type { HTMLAttributes, JSX, ReactNode, Ref } from "react";

/** 제목이 될 heading 단계. 화면의 문서 구조가 정하므로 컴포넌트가 고정하지 않는다. */
export type EmptyStateHeadingLevel = 2 | 3 | 4 | 5 | 6;

/**
 * 빈 상태가 놓이는 자리의 모양.
 *
 * **강조 축이 아니라 자리 축이다.** 세 값은 "같은 것을 더/덜 강하게"가 아니라 서로 다른 자리에
 * 산다 — `base`는 페이지 본문, `compact`는 카드 안, `canvas`는 작업 표면 위다.
 *
 * - `base` 면 없는 텍스트 블록. 제품 정의 9벌이 유일하게 합의한 모양이다.
 * - `compact` 면·1px 테두리·12px 반경을 가진 좌측 정렬 패널. 대시보드 섹션이 그 자리다 —
 *   집계 9벌 밖의 열 번째 정의이고, 합의 **밖**이라는 사실 자체가 이 축의 근거다.
 * - `canvas` 그래픽 없이 큰 제목 한 줄과 행동 유도. 빈 캔버스 오버레이가 그 자리다.
 */
export type EmptyStateLayout = "base" | "compact" | "canvas";

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
  /**
   * 놓이는 자리의 모양. 기본은 `"base"`다.
   *
   * `compact`은 그림도 행동 유도도 그리지 않는 **2슬롯**으로 쓴다 — 제품의 그 자리에는 둘 다
   * 없고, 계약도 두 슬롯의 값을 갖지 않는다. `canvas`는 설명 없이 제목과 행동 유도만 쓴다.
   * 컴포넌트가 슬롯을 막지는 않는다: 막으면 같은 prop이 layout마다 다르게 동작하게 된다.
   */
  readonly layout?: EmptyStateLayout;
  readonly ref?: Ref<HTMLDivElement>;
}

function join(...values: readonly (string | undefined)[]): string {
  return values.filter(Boolean).join(" ");
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
export function EmptyState({
  title,
  description,
  graphic,
  action,
  headingLevel = 2,
  layout = "base",
  className,
  ...rest
}: EmptyStateProps): JSX.Element {
  const Heading = `h${headingLevel}` as const;

  return (
    <div
      {...rest}
      // `base`에도 속성을 그대로 남긴다. 값이 있을 때만 붙이면 "기본값이라 없다"와 "prop을
      // 못 받았다"가 DOM에서 구분되지 않고, 계약도 세 칸이 아니라 두 칸이 된다.
      data-layout={layout}
      className={join("louis-empty-state", className)}
    >
      {graphic === undefined ? null : (
        // 그래픽은 제목이 말하는 것을 반복할 뿐이라 보조기술에서 숨긴다.
        <div className="louis-empty-state__graphic" aria-hidden="true">
          {graphic}
        </div>
      )}
      <Heading className="louis-empty-state__title">{title}</Heading>
      {description === undefined ? null : (
        <p className="louis-empty-state__description">{description}</p>
      )}
      {action === undefined ? null : <div className="louis-empty-state__action">{action}</div>}
    </div>
  );
}
