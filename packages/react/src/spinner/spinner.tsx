import type { HTMLAttributes, JSX, Ref } from "react";

export type SpinnerSize = "md" | "sm";

export interface SpinnerProps extends HTMLAttributes<HTMLSpanElement> {
  readonly size?: SpinnerSize;
  /**
   * 읽히는 이름. **있으면 알리고 없으면 숨는다.**
   *
   * 기본값을 두지 않는다. 제품에는 `aria-label="Loading"`이 하드코딩된 자리가 있는데, DS가
   * 기본 문자열을 배포하면 그 하드코딩을 시스템 전체로 퍼뜨리는 셈이 된다. 문구는 i18n을 가진
   * 호출부가 소유한다.
   *
   * 생략하면 `aria-hidden`이 되어 **장식**이 된다 — 라벨을 가진 부모(로딩 중인 버튼, "생성 중"
   * 문구가 붙은 행)가 이미 진행을 알리고 있을 때 쓴다. 그 자리에서 spinner가 또 알리면 스크린
   * 리더가 같은 사실을 두 번 읽는다.
   */
  readonly label?: string;
  readonly ref?: Ref<HTMLSpanElement>;
}

function join(...values: readonly (string | undefined)[]): string {
  return values.filter(Boolean).join(" ");
}

/**
 * design/components/spinner.md의 계약을 구현한다.
 *
 * **얼마나 남았는지 말하지 않는다.** 회전 주기는 진행률이 아니라 한 바퀴의 시간이며, 진행률을
 * 아는 작업에는 이것이 아니라 determinate 표시를 쓴다(motion.md의 Loop 절).
 *
 * reduced-motion에서 회전이 멈춘다. 그때도 진행 중이라는 의미는 `role="status"`와 `aria-busy`가
 * 유지한다 — 그것이 loop의 reduce 대체다.
 */
export function Spinner({
  size = "md",
  label,
  className,
  ...rest
}: SpinnerProps): JSX.Element {
  const announced = label !== undefined;

  return (
    <span
      {...rest}
      className={join("louis-spinner", className)}
      data-size={size}
      role={announced ? "status" : undefined}
      aria-live={announced ? "polite" : undefined}
      aria-busy={announced ? true : undefined}
      aria-label={label}
      aria-hidden={announced ? undefined : true}
    >
      {/* 링은 별도 요소다. root가 회전하면 그 안에 넣은 텍스트나 슬롯이 함께 돈다. */}
      <span className="louis-spinner__ring" />
    </span>
  );
}
