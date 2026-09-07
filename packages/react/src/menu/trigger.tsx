"use client";

import type { JSX, ReactNode } from "react";
import { AnchoredTrigger } from "../anchored/trigger.js";
import type { AnchoredTriggerProps } from "../anchored/types.js";

/**
 * MenuTrigger — 패널을 여는 컨트롤의 시각 정본.
 *
 * `ActionMenuTrigger` · `CompositePopoverTrigger` 는 aria 배선만 하는 headless 래퍼라 그리는
 * 것이 없다. 그래서 제품이 트리거를 자기 파일에서 다시 그렸고(랜딩 `LanguageSelector`), 옆에
 * 서는 `ThemeSelector` 가 「같은 크기·같은 두께여야 한다」며 그 상수를 import 해 간다. 소비처가
 * 둘인 그림이 정본 없이 서 있었던 자리다.
 *
 * **크기 축이 없다.** 높이는 32 하나이고 그것은 컨트롤 사다리의 `md` 칸이다(DS-D-0027).
 * **셰브론도 없다** — 앵커의 제품 트리거가 그리지 않는다. 근거는 `menu-popover.css` 의 같은
 * 블록 주석에 있다.
 */
/*
 * `value` 를 빼고 다시 정의한다. `<button value>` 는 폼 제출값이고 메뉴 트리거에는 뜻이 없다 —
 * 그 자리에 「지금 골라져 있는 값」이라는 다른 뜻을 얹는다.
 */
export interface MenuTriggerProps
  extends Omit<AnchoredTriggerProps, "children" | "asChild" | "value"> {
  /** 선행 글리프. 아이콘만으로 뜻이 서지 않으므로 `aria-label` 은 호출부가 준다. */
  readonly icon?: ReactNode;
  /** 지금 골라져 있는 값. 없으면 글리프만 남는다(제품의 compact 트리거가 그렇다). */
  readonly value?: ReactNode;
  /** 두 슬롯으로 담기지 않는 내용. 보통 비운다. */
  readonly children?: ReactNode;
}

export function MenuTrigger({
  icon,
  value,
  className,
  children,
  ...rest
}: MenuTriggerProps): JSX.Element {
  const classes = ["louis-menu-trigger", className].filter(Boolean).join(" ");
  return (
    <AnchoredTrigger {...rest} part="MenuTrigger" className={classes}>
      {icon === undefined ? null : (
        <span className="louis-menu-trigger__icon" aria-hidden="true">
          {icon}
        </span>
      )}
      {value === undefined ? null : (
        <span className="louis-menu-trigger__value">{value}</span>
      )}
      {children}
    </AnchoredTrigger>
  );
}
