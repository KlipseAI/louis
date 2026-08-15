import type { JSX, Ref, SVGProps } from "react";

/**
 * 아이콘 크기 토큰. 원시 px를 받지 않는다 — 4px 격자 밖 임의값이 생기는 지점이다.
 * `sm` 16 · `md` 20 · `lg` 24 (iconography.md Size model).
 */
export type IconSize = "sm" | "md" | "lg";

export interface IconProps
  extends Omit<
    SVGProps<SVGSVGElement>,
    | "children"
    | "viewBox"
    | "width"
    | "height"
    | "fill"
    | "stroke"
    | "color"
    | "role"
    | "aria-hidden"
    | "aria-label"
    | "dangerouslySetInnerHTML"
  > {
  /** 시각 크기. 기본값 `md`(20px). 히트 영역은 부모 컨트롤이 소유한다. */
  readonly size?: IconSize;
  /**
   * 아이콘이 화면에서 **유일한 정보 전달 수단일 때만** 준다.
   *
   * 주면 `role="img"` + `aria-label`, 주지 않으면 `aria-hidden="true"`가 된다.
   * 텍스트 라벨이 곁에 있으면 아이콘은 언제나 장식이므로 주지 않는다.
   *
   * **아이콘 전용 버튼에는 주지 않는다.** 버튼의 accessible name은 버튼이 `aria-label`로
   * 소유한다 (button.md Accessibility). 여기에도 주면 이름이 두 겹으로 읽힌다.
   */
  readonly label?: string;
  readonly ref?: Ref<SVGSVGElement>;
}

export type IconComponent = (props: IconProps) => JSX.Element;
