"use client";

import type { InputHTMLAttributes, JSX, ReactNode, Ref } from "react";
import { useEffect, useRef } from "react";

export interface CheckboxProps
  extends Omit<
    InputHTMLAttributes<HTMLInputElement>,
    "type" | "onChange" | "checked" | "defaultChecked"
  > {
  /** 상자 옆에 놓이는 라벨. 생략하면 `aria-label`이 필수다. */
  readonly label?: ReactNode;
  readonly checked?: boolean;
  readonly defaultChecked?: boolean;
  /**
   * 부분 선택. **DOM 속성이 아니라 프로퍼티라** React가 JSX로 넘길 수 없고 ref로 설정해야 한다.
   *
   * `checked`와 동시에 참일 수 있으며 그때 화면은 "일부"를 보여준다 — 부분 선택은 선택이 아니다.
   */
  readonly indeterminate?: boolean;
  readonly onCheckedChange?: (checked: boolean) => void;
  /** 바깥 `<label>`에 붙는다. 상자가 아니라 상자와 라벨을 담는 줄이다. */
  readonly className?: string;
  readonly ref?: Ref<HTMLInputElement>;
}

function join(...values: readonly (string | undefined)[]): string {
  return values.filter(Boolean).join(" ");
}

/**
 * design/components/checkbox.md의 계약을 구현한다.
 *
 * **`appearance: none`으로 입력 자신을 칠한다.** 입력을 숨기고 형제를 그리면 라벨 연결과 포커스가
 * 두 곳으로 갈라진다. 키보드(Space), `:indeterminate` 의사 클래스, 폼 제출은 네이티브의 것이다.
 *
 * 제품 정본 `.app-native-checkbox`의 20px은 채택하고 `accent-color`는 채택하지 않았다 — 그것은
 * 면 색 하나만 주고 체크 표시의 굵기·반경·포커스 링·indeterminate 막대를 전부 브라우저가 정한다.
 */
export function Checkbox({
  label,
  checked,
  defaultChecked,
  indeterminate = false,
  onCheckedChange,
  className,
  disabled,
  ref,
  ...rest
}: CheckboxProps): JSX.Element {
  const innerRef = useRef<HTMLInputElement | null>(null);

  // indeterminate는 콘텐츠 속성이 없어 JSX로 넘어가지 않는다. 매 렌더 뒤에 맞춘다 —
  // 값이 바뀌지 않아도 React가 DOM을 되돌릴 수 있기 때문이다.
  useEffect(() => {
    const node = innerRef.current;
    if (node !== null) node.indeterminate = indeterminate;
  });

  return (
    <label className={join("louis-checkbox", className)}>
      <input
        {...rest}
        ref={(node) => {
          innerRef.current = node;
          if (typeof ref === "function") ref(node);
          else if (ref !== null && ref !== undefined) ref.current = node;
        }}
        type="checkbox"
        className="louis-checkbox__control"
        checked={checked}
        defaultChecked={defaultChecked}
        disabled={disabled}
        // 부분 선택은 보조기술에도 "일부"로 전달돼야 한다. checked만으로는 표현되지 않는다.
        aria-checked={indeterminate ? "mixed" : undefined}
        onChange={(event) => {
          onCheckedChange?.(event.target.checked);
        }}
      />
      {label === undefined ? null : (
        <span className="louis-checkbox__label">{label}</span>
      )}
    </label>
  );
}
