import type { JSX, ReactNode } from "react";
import type { IconProps } from "./types.js";

export interface IconRootProps extends IconProps {
  /** 생성기가 넘기는 글리프 이름. 소비자 API가 아니다. */
  readonly name: string;
  readonly children: ReactNode;
}

/**
 * [Iconography](../../../../design/foundations/iconography.md)의 계약을 구현한다.
 *
 * 크기는 CSS 클래스와 `data-size`가 소유한다. `width`/`height` 속성을 직접 쓰면 속성이
 * 표현 선언보다 세서 소비자가 CSS로 이길 수 없다.
 *
 * 색은 언제나 `currentColor`다. 아이콘은 자기 색을 정하지 않고 부모의 `color`를 상속한다.
 * 상태 색은 부모가 semantic token으로 주며, "색 외의 신호를 함께 제공한다"(color-theme.md)는
 * 그대로 유지된다.
 *
 * hook도 상태도 없으므로 `"use client"`를 붙이지 않는다 — React Server Component에서 그대로
 * 렌더된다. 아이콘 하나 때문에 소비자 트리가 client boundary로 넘어가지 않는다.
 */
export function IconRoot({
  size = "md",
  label,
  className,
  name,
  children,
  ...rest
}: IconRootProps): JSX.Element {
  // 기본값은 장식이다. label이 없으면 accessibility tree에서 사라진다.
  const decorative = label === undefined;
  return (
    <svg
      {...rest}
      className={className === undefined ? "kds-icon" : `kds-icon ${className}`}
      viewBox="0 0 24 24"
      fill="none"
      data-kds-icon={name}
      data-size={size}
      {...(decorative ? { "aria-hidden": true } : { role: "img", "aria-label": label })}
    >
      {children}
    </svg>
  );
}
