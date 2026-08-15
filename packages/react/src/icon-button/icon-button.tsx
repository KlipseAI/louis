import type { ButtonHTMLAttributes, JSX, ReactNode, Ref } from "react";
import type { ButtonVariant } from "../button/button.js";

export type IconButtonSize = "md" | "sm";

export interface IconButtonProps
  extends Omit<
    ButtonHTMLAttributes<HTMLButtonElement>,
    "type" | "children" | "aria-label" | "aria-pressed"
  > {
  /**
   * accessible name. **필수다.**
   *
   * Button은 이름이 children에서 오므로 라벨을 필수로 만들 수 없지만, 아이콘 전용 버튼은
   * 이것이 없으면 이름이 아예 없는 버튼이 된다. "children이 비었을 때만 필수"는 타입으로
   * 표현할 수 없어서 별도 컴포넌트로 나눴다.
   */
  readonly label: string;
  /** 강조와 의미. Button과 같은 축을 쓴다. */
  readonly variant?: ButtonVariant;
  /** 한 변의 길이. md 40, sm 32. 히트 영역은 크기와 무관하게 44 이상이다. */
  readonly size?: IconButtonSize;
  /** 토글일 때만 준다. 주지 않으면 `aria-pressed` 속성 자체가 붙지 않는다. */
  readonly pressed?: boolean;
  /** 기본값은 button이다. 폼 제출은 호출부가 submit을 명시한다. */
  readonly type?: "button" | "submit" | "reset";
  /** 아이콘 하나. 텍스트를 넣지 않는다. */
  readonly children: ReactNode;
  readonly ref?: Ref<HTMLButtonElement>;
}

/**
 * design/components/icon-button.md의 계약을 구현한다.
 *
 * 크기를 padding이 아니라 한 변의 길이로 정한다. Button은 고정 높이가 없어 라벨 길이·번역·확대에
 * 따라 자라지만, 아이콘 전용 버튼은 정사각이 계약이므로 높이를 직접 소유한다. 실제로 Button을
 * 아이콘 전용으로 렌더하면 md가 54×38이 된다 — 빈 라벨과의 gap과 좌우 padding이 남기 때문이다.
 *
 * `pressed`가 `undefined`면 속성을 아예 붙이지 않는다. `false`를 늘 붙이면 토글이 아닌 버튼이
 * 보조 기술에 토글로 노출된다.
 */
export function IconButton({
  label,
  variant = "ghost",
  size = "md",
  pressed,
  type = "button",
  className,
  children,
  ref,
  ...rest
}: IconButtonProps): JSX.Element {
  const classes = ["kds-icon-button", "kds-focus-ring", "kds-hit-target", className]
    .filter(Boolean)
    .join(" ");
  return (
    <button
      {...rest}
      {...(ref === undefined ? {} : { ref })}
      type={type}
      className={classes}
      data-variant={variant}
      data-size={size}
      aria-label={label}
      {...(pressed === undefined ? {} : { "aria-pressed": pressed })}
    >
      <span className="kds-icon-button__glyph" aria-hidden="true">
        {children}
      </span>
    </button>
  );
}
