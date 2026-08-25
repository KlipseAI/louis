import type { JSX, ReactNode, Ref } from "react";
import { createContext, useContext, useId } from "react";

export type SegmentedControlSize = "md" | "sm";

interface SegmentedControlContextValue {
  readonly name: string;
  readonly value: string;
  readonly disabled: boolean;
  readonly onValueChange: (value: string) => void;
}

const SegmentedControlContext = createContext<SegmentedControlContextValue | null>(null);

function useSegmentedControl(part: string): SegmentedControlContextValue {
  const context = useContext(SegmentedControlContext);
  if (context === null) {
    throw new Error(`${part}은 SegmentedControl 안에서만 쓸 수 있습니다.`);
  }
  return context;
}

export interface SegmentedControlProps {
  /**
   * 그룹 이름. **필수다.**
   *
   * 시각적으로는 숨기고 `<legend>`로 남긴다 — "무엇을 고르는 중인가"가 없으면 스크린 리더에
   * "3 중 1"만 들리고 그 셋이 무엇인지 알 수 없다. 화면에 라벨을 보이려면 호출부가 따로 둔다.
   */
  readonly label: string;
  readonly value: string;
  readonly onValueChange: (value: string) => void;
  readonly size?: SegmentedControlSize;
  /** 그룹 전체를 비활성한다. 항목별 비활성은 항목의 `disabled`가 소유한다. */
  readonly disabled?: boolean;
  readonly className?: string;
  readonly children: ReactNode;
  readonly ref?: Ref<HTMLFieldSetElement>;
}

export interface SegmentedControlItemProps {
  readonly value: string;
  /** 이 항목만 비활성한다. 그룹 전체는 root의 `disabled`가 소유한다. */
  readonly disabled?: boolean;
  readonly className?: string;
  readonly children: ReactNode;
  readonly ref?: Ref<HTMLInputElement>;
}

function join(...values: readonly (string | undefined)[]): string {
  return values.filter(Boolean).join(" ");
}

/**
 * design/components/segmented-control.md의 계약을 구현한다.
 *
 * **네이티브 radio 그룹이다.** 방향키 roving, Home/End, "3 중 1" 그룹 안내, 폼 제출,
 * forced-colors가 전부 브라우저의 것이다. 제품은 선택을 `aria-pressed`·아무것도 없음·
 * `role="tab"` 셋으로 서로 다르게 전달하는데, 패널을 바꾸지 않고 값을 고르는 것은 radiogroup이다.
 *
 * `<fieldset>`인 이유는 `<legend>`가 그룹에 이름을 붙이는 유일한 네이티브 경로이기 때문이다.
 * `role="radiogroup"` + `aria-label`을 쓴 div는 안의 네이티브 radio와 역할이 겹친다.
 */
export function SegmentedControl({
  label,
  value,
  onValueChange,
  size = "md",
  disabled = false,
  className,
  children,
  ref,
}: SegmentedControlProps): JSX.Element {
  // 인스턴스마다 발급한다. 호출부가 만들면 같은 화면에 컨트롤이 둘일 때 radio 그룹이 합쳐져
  // 한쪽을 고르면 다른 쪽 선택이 풀린다.
  const name = useId();

  return (
    <fieldset
      ref={ref}
      className={join("louis-segmented-control", className)}
      data-size={size}
      disabled={disabled || undefined}
    >
      <legend className="louis-segmented-control__legend louis-visually-hidden">{label}</legend>
      <SegmentedControlContext.Provider value={{ name, value, disabled, onValueChange }}>
        {children}
      </SegmentedControlContext.Provider>
    </fieldset>
  );
}

/**
 * 항목 하나. `<label>`이 시각을 소유하고 그 안의 radio는 숨겨진다.
 *
 * 포커스 링을 라벨이 `:has(:focus-visible)`로 받는 이유는 숨긴 입력에 걸면 화면 밖에 그려지기
 * 때문이다.
 */
export function SegmentedControlItem({
  value,
  disabled = false,
  className,
  children,
  ref,
}: SegmentedControlItemProps): JSX.Element {
  const group = useSegmentedControl("SegmentedControlItem");
  const selected = group.value === value;

  return (
    <label
      className={join("louis-segmented-control__segment", className)}
      data-selected={selected ? "true" : "false"}
    >
      <input
        ref={ref}
        type="radio"
        className="louis-segmented-control__input louis-visually-hidden"
        name={group.name}
        value={value}
        checked={selected}
        disabled={disabled || undefined}
        onChange={() => {
          group.onValueChange(value);
        }}
      />
      <span className="louis-segmented-control__label">{children}</span>
    </label>
  );
}
