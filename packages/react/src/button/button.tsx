import type { ButtonHTMLAttributes, JSX, ReactNode, Ref } from "react";

import { Spinner } from "../spinner/spinner.js";

/* inverse — 인증 플로우 제출 CTA. 페이지를 반전시킨 면이다. button.css 의 같은 이름 변형이
   소유하며 제품 apps/web/components/ui/Button.tsx 도 같은 집합을 쓴다. */
export type ButtonVariant =
  | "primary"
  | "secondary"
  | "ghost"
  | "danger"
  | "danger-secondary"
  | "inverse";
/* sm — 편집 표면의 도구 줄에서만 쓴다 (DS-D-0032). 24는 44px 최소 타깃에 미달하지만 Button은
   크기와 무관하게 .louis-hit-target을 달아 타깃을 별도로 지킨다. 폼·대화상자·본문 흐름에는
   md를 쓴다. */
export type ButtonSize = "lg" | "md" | "sm";

export interface ButtonProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "type"> {
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
export function Button({
  variant = "primary",
  size = "md",
  loading = false,
  leftIcon,
  rightIcon,
  type = "button",
  className,
  children,
  disabled,
  onClick,
  ...rest
}: ButtonProps): JSX.Element {
  const ariaDisabled = rest["aria-disabled"];
  const blocked =
    loading === true || ariaDisabled === true || ariaDisabled === "true";

  const classes = ["louis-button", "louis-focus-ring", "louis-hit-target", className]
    .filter(Boolean)
    .join(" ");

  return (
    <button
      {...rest}
      type={type}
      className={classes}
      disabled={disabled}
      data-variant={variant}
      data-size={size}
      data-loading={loading ? "true" : undefined}
      // 아이콘이 붙은 쪽만 padding을 줄여 광학 균형을 맞춘다 (제품 Button.tsx:73과 같은 보정).
      // CSS :has()가 아니라 속성으로 표현한다 — 상태와 변형은 data-*가 소유한다 (DS-D-0004).
      data-left-icon={leftIcon !== undefined && !loading ? "true" : undefined}
      data-right-icon={rightIcon !== undefined ? "true" : undefined}
      aria-busy={loading ? true : undefined}
      aria-disabled={blocked ? true : undefined}
      onClick={(event) => {
        if (blocked) {
          // aria-disabled는 브라우저가 막아주지 않는다. click과 keyboard activation을
          // 모두 여기서 차단한다 — Enter/Space도 결국 click으로 도달한다.
          event.preventDefault();
          event.stopPropagation();
          return;
        }
        onClick?.(event);
      }}
    >
      {/* **Button은 자기 링을 그리지 않는다.** 이전 구현(`.louis-button__spinner`)은 트랙 없이
          위쪽 테두리만 비우는 옛 DS 표현이었고, `spinner.css`가 그 표현을 「제품과 달랐고 편차로
          선언된 적도 없다」고 이미 적어 두었다 — Spinner만 고쳐지고 Button이 따라가지 않은 흔적이다.
          링의 정본은 Spinner 하나다. 제품 실측이 그것을 뒷받침한다: 앵커에 `louis-button__spinner`
          가 0건이고 제품이 그리는 링은 `.louis-spinner` 계열 11곳뿐이다.

          `size`는 md(16) 고정이다. 아이콘 슬롯이 lg·md·sm 세 칸 모두 16이므로(button.css의
          `.louis-button__icon`) 같은 자리에 같은 크기가 선다 — 스피너만 글자를 따라 줄어들 이유가 없다.
          `label`을 주지 않아 장식이 된다. 진행 중이라는 사실은 이 버튼의 `aria-busy`가 이미 알린다.

          **2026-09-03: origin/main 머지에서 이 자리가 옛 구현으로 되돌아갔다가 다시 적용됐다.**
          충돌 해결이 파일 단위로 origin/main 을 채택하면서 함께 쓸려 갔고, 테스트와
          `components.measured.json`(spinner 16)만 새 계약에 남아 어긋났다. */}
      {loading ? <Spinner size="md" /> : null}
      {leftIcon !== undefined && !loading ? (
        <span className="louis-button__icon" aria-hidden="true">
          {leftIcon}
        </span>
      ) : null}
      <span className="louis-button__label">{children}</span>
      {rightIcon !== undefined ? (
        <span className="louis-button__icon" aria-hidden="true">
          {rightIcon}
        </span>
      ) : null}
    </button>
  );
}
