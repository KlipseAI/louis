import type {
  CSSProperties,
  InputHTMLAttributes,
  JSX,
  ReactNode,
  Ref,
} from "react";
import { useId, useState } from "react";

export type SliderSize = "md" | "sm";

/**
 * `thumb`은 얇은 레일 위의 손잡이, `track`은 굵은 막대를 채우는 형태다.
 *
 * 제품의 인스펙터 슬라이더 17벌이 후자인데, 썸을 지우고 채움 끝 표식을 따로 그린다. 여기서는
 * 그 표식이 곧 썸이므로 모양은 같고 포커스·키보드가 살아 있다.
 */
export type SliderVariant = "thumb" | "track";

export interface SliderProps
  extends Omit<
    InputHTMLAttributes<HTMLInputElement>,
    "size" | "type" | "value" | "defaultValue" | "onChange" | "min" | "max" | "step"
  > {
  /** 시각 라벨. 생략하면 `aria-label`을 반드시 주어야 한다. */
  readonly label?: ReactNode;
  /** 시각 크기. 컨트롤 높이는 TextField·Button과 같은 계단이다. */
  readonly size?: SliderSize;
  readonly variant?: SliderVariant;
  readonly min?: number;
  readonly max?: number;
  readonly step?: number;
  /** 제어 값. 주면 controlled가 된다. */
  readonly value?: number;
  /** 비제어 초기값. 생략하면 `min`에서 시작한다. */
  readonly defaultValue?: number;
  readonly onValueChange?: (value: number) => void;
  /**
   * 스크린 리더가 읽을 값의 표현. 숫자가 그 자체로 뜻을 갖지 않을 때만 준다 —
   * `0.5`가 아니라 `50%`, `1.5`가 아니라 `1.5배`.
   */
  readonly formatValue?: (value: number) => string;
  /** 바깥 stack에 붙는다. 라벨과 컨트롤을 담는 세로 stack이다. */
  readonly className?: string;
  readonly ref?: Ref<HTMLInputElement>;
}

function join(...values: readonly (string | undefined)[]): string {
  return values.filter(Boolean).join(" ");
}

function clampRatio(ratio: number): number {
  if (!Number.isFinite(ratio)) return 0;
  if (ratio < 0) return 0;
  if (ratio > 1) return 1;
  return ratio;
}

/**
 * design/components/slider.md의 계약을 구현한다.
 *
 * **네이티브 `<input type="range">`다.** 키보드(방향키·Home/End·PageUp/Down), `role="slider"`,
 * `aria-valuenow`/`aria-valuemin`/`aria-valuemax`, 터치, forced-colors, RTL이 전부 브라우저의
 * 것이다. Button이 활성화를 네이티브 `<button>`에 맡긴 것과 같은 이유로 여기도 직접 만들지
 * 않는다.
 *
 * 채움 비율을 `--louis-slider-fill`로 내려보내는 이유는 CSS에 있다 —
 * `::-webkit-slider-runnable-track`은 진행 구간을 따로 갖지 않아 그라디언트 정지점으로 그리고,
 * 그 비율은 값에서만 나온다. 그래서 비제어일 때도 컴포넌트가 값을 알아야 한다.
 */
export function Slider({
  label,
  size = "md",
  variant = "thumb",
  min = 0,
  max = 100,
  step = 1,
  value,
  defaultValue,
  onValueChange,
  formatValue,
  className,
  id,
  disabled,
  style,
  ...rest
}: SliderProps): JSX.Element {
  const generated = useId();
  const controlId = id ?? generated;
  const [uncontrolledValue, setUncontrolledValue] = useState<number>(
    defaultValue ?? min,
  );
  const currentValue = value ?? uncontrolledValue;
  const fillRatio = clampRatio((currentValue - min) / (max - min));

  return (
    <div
      className={join("louis-slider", className)}
      data-size={size}
      data-variant={variant}
    >
      {label === undefined ? null : (
        <label className="louis-slider__label" htmlFor={controlId}>
          {label}
        </label>
      )}
      <input
        {...rest}
        id={controlId}
        type="range"
        className="louis-slider__control"
        min={min}
        max={max}
        step={step}
        value={currentValue}
        disabled={disabled}
        // 숫자가 그 자체로 뜻을 갖지 않을 때만 붙인다. 늘 붙이면 aria-valuenow를 덮어
        // 스크린 리더가 원래 값을 잃는다.
        aria-valuetext={
          formatValue === undefined ? undefined : formatValue(currentValue)
        }
        style={
          {
            ...style,
            "--louis-slider-fill": `${fillRatio * 100}%`,
          } as CSSProperties
        }
        onChange={(event) => {
          const next = event.target.valueAsNumber;
          if (Number.isNaN(next)) return;
          // controlled여도 갱신한다. 호출부가 값을 되돌리면 다음 렌더가 덮으므로 해가 없고,
          // 비제어일 때는 이 상태가 채움 비율의 유일한 출처다.
          setUncontrolledValue(next);
          onValueChange?.(next);
        }}
      />
    </div>
  );
}
