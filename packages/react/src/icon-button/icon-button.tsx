import type { ButtonHTMLAttributes, JSX, ReactNode, Ref } from "react";
/**
 * 컨트롤 크기 사다리(DS-D-0027 · DS-D-0032). `sm` 은 **편집 표면의 도구 줄 전용**이다 —
 * 폼·대화상자·본문 흐름에는 쓰지 않는다. 히트 영역은 세 칸 모두 44 다.
 */
export type IconButtonSize = "lg" | "md" | "sm";

/**
 * **Button 의 다섯 축이 아니라 넷이다.** `inverse` 는 아이콘 버튼에 없다 — icon-button.css 에
 * 그릴 규칙이 없고(primary·secondary·ghost·danger 넷뿐), 제품 타입도 넷이며, 규범 문서도 넷이다.
 * ButtonVariant 를 그대로 물려받으면 스타일 없이 렌더되는 조합을 타입이 통과시킨다.
 */
export type IconButtonVariant = "primary" | "secondary" | "ghost" | "danger";

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
  readonly variant?: IconButtonVariant;
  /**
   * 한 변의 길이. lg·md 32, sm 24. 히트 영역은 크기와 무관하게 44 이상이다 —
   * `.louis-hit-target` 이 시각 박스 밖으로 넓히므로 호출부가 따로 감싸지 않는다.
   */
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
  const classes = ["louis-icon-button", "louis-hit-target", className]
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
      <span className="louis-icon-button__glyph" aria-hidden="true">
        {children}
      </span>
    </button>
  );
}
