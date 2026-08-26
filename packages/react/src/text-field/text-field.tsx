import type { InputHTMLAttributes, JSX, ReactNode, Ref } from "react";
import { useId } from "react";

export type TextFieldSize = "lg" | "md";

export interface TextFieldProps
  // `prefix`는 HTML 전역 속성(RDFa)이라 이름이 겹친다. 필드 슬롯 쪽 뜻으로 덮어쓴다.
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "size" | "type" | "prefix"> {
  /**
   * 시각 라벨. 생략하면 `aria-label`을 반드시 주어야 한다.
   *
   * 제품의 대부분의 필드는 시각 라벨이 없고 placeholder가 그 역할을 대신한다. placeholder는
   * 입력을 시작하면 사라지므로 라벨이 될 수 없다 — 그 구조는 옮기지 않는다.
   */
  readonly label?: ReactNode;
  /** 시각 크기. hit target 계약은 크기와 무관하게 유지된다. */
  readonly size?: TextFieldSize;
  /** 필드 아래 한 줄. `invalid`일 때는 오류 문구가 되고 `aria-describedby`로 연결된다. */
  readonly description?: ReactNode;
  /** 오류 상태. **색만으로 알리지 않는다** — 이 값이 참이면 description이 오류 문구가 된다. */
  readonly invalid?: boolean;
  readonly prefix?: ReactNode;
  readonly suffix?: ReactNode;
  /** 텍스트 입력만 다룬다. checkbox·radio·file은 각자 다른 컴포넌트다. */
  readonly type?: "text" | "email" | "password" | "search" | "tel" | "url";
  /** 바깥 stack에 붙는다. 박스가 아니라 라벨·필드·메시지를 담는 세로 stack이다. */
  readonly className?: string;
  readonly ref?: Ref<HTMLInputElement>;
}

function join(...values: readonly (string | undefined)[]): string {
  return values.filter(Boolean).join(" ");
}

/**
 * design/components/text-field.md의 계약을 구현한다.
 *
 * **시각적 필드는 `<input>`이 아니라 감싸는 박스다.** 접두 아이콘과 접미 버튼을 필드 안에 두려면
 * `<input>` 하나로는 안 되고, 포커스 링도 박스가 `:focus-within`으로 받아야 슬롯까지 함께 둘린다.
 *
 * id는 컴포넌트가 발급한다. 호출부가 만들면 같은 화면에 필드가 여럿일 때 겹친다.
 */
export function TextField({
  label,
  size = "lg",
  description,
  invalid = false,
  prefix,
  suffix,
  type = "text",
  className,
  id,
  disabled,
  ...rest
}: TextFieldProps): JSX.Element {
  const generated = useId();
  const controlId = id ?? generated;
  const messageId = `${controlId}-message`;
  const describedBy =
    description === undefined
      ? rest["aria-describedby"]
      : join(rest["aria-describedby"], messageId);

  return (
    <div
      className={join("louis-text-field", className)}
      data-size={size}
      data-invalid={invalid ? "true" : undefined}
    >
      {label === undefined ? null : (
        <label className="louis-text-field__label" htmlFor={controlId}>
          {label}
        </label>
      )}

      {/* 박스를 눌러도 커서가 들어가야 한다. label이 아니라 div인 이유는 슬롯 안의 버튼이
          label 안에 들어가면 그 버튼을 눌러도 input이 포커스를 가져가기 때문이다. */}
      <div className="louis-text-field__box">
        {prefix === undefined ? null : (
          <span className="louis-text-field__adornment">{prefix}</span>
        )}
        <input
          {...rest}
          id={controlId}
          type={type}
          disabled={disabled}
          className="louis-text-field__control"
          aria-invalid={invalid ? "true" : undefined}
          aria-describedby={describedBy}
        />
        {suffix === undefined ? null : (
          <span className="louis-text-field__adornment">{suffix}</span>
        )}
      </div>

      {description === undefined ? null : (
        <p
          id={messageId}
          className="louis-text-field__message"
          // 오류는 뜨는 즉시 읽혀야 한다. 도움말은 그렇지 않다 — 포커스할 때 함께 읽힌다.
          role={invalid ? "alert" : undefined}
        >
          {description}
        </p>
      )}
    </div>
  );
}
