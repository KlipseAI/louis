import type { CSSProperties, HTMLAttributes, JSX, ReactNode, Ref } from "react";

/**
 * 값을 0~100으로 조인다. 소비처가 범위를 벗어난 수를 주면 화면과 보조기술이 갈리므로 한 곳에서
 * 막는다 — 채움 폭은 CSS가 계산하고 `aria-valuenow`는 여기서 적기 때문이다.
 */
function clampPercent(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.min(100, Math.max(0, value));
}

/**
 * 이름이 없으면 개발 빌드에서 경고한다. DS-D-0022가 "이름은 컴포넌트가 만들지 않는다"로 정했고,
 * 그 결과 이름 없는 progressbar는 스크린 리더에서 "진행률"이라고만 읽힌다 — 무엇의 진행률인지
 * 말하지 않는 것은 이름이 없는 것과 같다.
 */
function warnMissingName(label: string | undefined, labelledBy: string | undefined): void {
  if (label !== undefined || labelledBy !== undefined) return;
  console.warn(
    "[kds] Progress에 접근 가능한 이름이 없습니다. aria-label 또는 aria-labelledby를 주세요 (DS-D-0022).",
  );
}

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

export interface ProgressBarProps
  extends ProgressCommonProps,
    Omit<HTMLAttributes<HTMLDivElement>, "role" | "children"> {
  readonly ref?: Ref<HTMLDivElement>;
}

export function ProgressBar({
  value = 0,
  indeterminate = false,
  valueText,
  className,
  style,
  ref,
  "aria-label": label,
  "aria-labelledby": labelledBy,
  ...rest
}: ProgressBarProps): JSX.Element {
  warnMissingName(label, labelledBy);
  const percent = clampPercent(value);
  return (
    <div
      {...rest}
      ref={ref}
      // **값을 갖는 것은 트랙이다.** 채움에 role을 걸면 폭이 0일 때 이름째 사라진다.
      role="progressbar"
      aria-label={label}
      aria-labelledby={labelledBy}
      aria-valuemin={indeterminate ? undefined : 0}
      aria-valuemax={indeterminate ? undefined : 100}
      aria-valuenow={indeterminate ? undefined : percent}
      aria-valuetext={valueText}
      data-indeterminate={indeterminate ? "true" : undefined}
      className={["kds-progress-bar", className].filter(Boolean).join(" ")}
      style={{ ...style, "--kds-progress-value": percent } as CSSProperties}
    >
      <div className="kds-progress-bar__fill" aria-hidden />
    </div>
  );
}

export interface ProgressRingProps
  extends ProgressCommonProps,
    Omit<HTMLAttributes<HTMLDivElement>, "role"> {
  /** 링이 감싸는 것. 보통 Avatar다. 링은 지름을 내용에서 얻는다. */
  readonly children: ReactNode;
  readonly ref?: Ref<HTMLDivElement>;
}

export function ProgressRing({
  value = 0,
  indeterminate = false,
  valueText,
  children,
  className,
  style,
  ref,
  "aria-label": label,
  "aria-labelledby": labelledBy,
  ...rest
}: ProgressRingProps): JSX.Element {
  warnMissingName(label, labelledBy);
  const percent = clampPercent(value);
  return (
    <div
      {...rest}
      ref={ref}
      role="progressbar"
      aria-label={label}
      aria-labelledby={labelledBy}
      aria-valuemin={indeterminate ? undefined : 0}
      aria-valuemax={indeterminate ? undefined : 100}
      aria-valuenow={indeterminate ? undefined : percent}
      aria-valuetext={valueText}
      data-indeterminate={indeterminate ? "true" : undefined}
      className={["kds-progress-ring", className].filter(Boolean).join(" ")}
      style={{ ...style, "--kds-progress-value": percent } as CSSProperties}
    >
      {children}
    </div>
  );
}
