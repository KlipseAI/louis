import type { InputHTMLAttributes, JSX, ReactNode, Ref } from "react";
import { useId } from "react";

/**
 * 컨트롤 높이 사다리의 세 칸 (DS-D-0027 · DS-D-0032). `lg` 40 · `md` 32 · `sm` 24.
 *
 * `sm`은 **편집 표면의 도구 줄 전용**이다 — 캔버스·타임라인·에셋 패널처럼 한 줄에 컨트롤이
 * 여럿 서고 화면의 주인공이 컨트롤이 아니라 편집 대상인 자리. 폼·대화상자·본문 흐름에서는
 * 쓰지 않는다.
 */
export type TextFieldSize = "lg" | "md" | "sm";

/**
 * 라벨이 어디 사는가 (DS-D-0049). **크기·유효성과 직교하는 별개의 축이다.**
 *
 * - `stacked` — 라벨이 박스 **위**의 형제이고 움직이지 않는다. 기본값이며 제품의 `/admin`
 *   여덟 화면이 이 형태를 쓴다(`louis-text-field__label` 을 그대로 붙인다).
 * - `floating` — 라벨이 박스 **안**에서 placeholder 노릇을 하다가, 값이 들어오거나 포커스가
 *   오면 떠오른다. 제품의 인증 일곱 벌이 이 형태이고 기하가 일곱 벌 모두 같다.
 *
 * 「떠 있는가 앉아 있는가」는 이 축이 아니다 — 값과 포커스가 정하는 **상태**이고 CSS 가
 * 판정한다. Figma 에서는 이미 있는 `State` 축이 그 자리를 갖는다(`Placeholder` 가 쉼).
 */
export type TextFieldLabelBehavior = "stacked" | "floating";

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
  /**
   * 시각 크기.
   *
   * **`sm`(24)에서는 글자 크기와 반경도 함께 내려간다** — lg·md는 둘 다 body-sm 14와
   * `radius-control`을 쓰지만, 24 안에서 14는 위아래 여유가 1.5px씩뿐이고 반경 12는 높이의
   * 절반이라 필드가 알약이 된다. 두 값 다 디자인 실측이며 사유는 text-field.css에 있다.
   *
   * **hit target은 크기를 따라가지 못한다.** Button·IconButton과 달리 이 컴포넌트는
   * `.louis-hit-target`을 쓸 수 없어(오버레이가 캐럿과 드래그 선택을 가로챈다) `sm`은 44px
   * 최소 타겟에 미달한다. 알려진 편차이며 design/components/text-field.md가 갖는다.
   */
  readonly size?: TextFieldSize;
  /**
   * 라벨의 자리. 기본값 `stacked`.
   *
   * **`floating` 에서는 `label` 이 사실상 필수다** — 라벨이 placeholder 의 자리를 대신하므로
   * 없으면 필드에 보이는 이름이 하나도 남지 않는다. 타입으로 강제하지 않는 이유는
   * `TextFieldProps` 가 인터페이스여서 판별 유니온으로 바꾸면 이 타입을 확장하는 바깥 코드가
   * 깨지기 때문이고, 그 계약은 design/components/text-field.md 와 브라우저 테스트가 갖는다.
   */
  readonly labelBehavior?: TextFieldLabelBehavior;
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
  labelBehavior = "stacked",
  description,
  invalid = false,
  prefix,
  suffix,
  type = "text",
  className,
  id,
  disabled,
  placeholder,
  ...rest
}: TextFieldProps): JSX.Element {
  const generated = useId();
  const controlId = id ?? generated;
  const messageId = `${controlId}-message`;
  const describedBy =
    description === undefined
      ? rest["aria-describedby"]
      : join(rest["aria-describedby"], messageId);

  const floating = labelBehavior === "floating";

  const labelNode =
    label === undefined ? null : (
      <label className="louis-text-field__label" htmlFor={controlId}>
        {label}
      </label>
    );

  // **floating 은 `:placeholder-shown` 으로 「값이 비었다」를 판정한다.** 그 의사 클래스는
  // placeholder 속성이 **있을 때만** 걸리므로, 호출부가 주지 않으면 공백 하나를 넣는다.
  // 화면에는 보이지 않는다 — CSS 가 floating 에서 placeholder 를 투명으로 두기 때문이고,
  // 보이는 이름은 라벨이 갖는다. `stacked` 에서는 손대지 않는다.
  const resolvedPlaceholder = floating && placeholder === undefined ? " " : placeholder;

  return (
    <div
      className={join("louis-text-field", className)}
      data-size={size}
      data-label-behavior={labelBehavior}
      data-invalid={invalid ? "true" : undefined}
    >
      {floating ? null : labelNode}

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
          placeholder={resolvedPlaceholder}
          className="louis-text-field__control"
          aria-invalid={invalid ? "true" : undefined}
          aria-describedby={describedBy}
        />
        {/* **input 뒤에 온다.** floating 의 떠오름 규칙이 `input ~ label` 이고 `~` 는 앞선
            형제를 볼 수 없다. 시각 위치는 절대배치가 정하므로 순서가 화면을 바꾸지 않는다. */}
        {floating ? labelNode : null}
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
