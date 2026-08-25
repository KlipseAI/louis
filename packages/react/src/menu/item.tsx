"use client";

import {
  useId,
  type AnchorHTMLAttributes,
  type ButtonHTMLAttributes,
  type JSX,
  type MouseEvent,
  type ReactNode,
  type Ref,
} from "react";
import { useAnchoredContext } from "../anchored/context.js";

/**
 * menu item.
 *
 * 활성화 경로는 **하나뿐이다** — 브라우저가 합성한 `click`이 `onClick`으로 오고 그것이
 * primitive의 `activate()`를 부른다. keydown으로 `.click()`을 흉내 내지 않는다. 그 둘은 서로
 * 다른 이벤트 객체라 중복 차단 WeakSet이 막지 못하고, 결과는 한 번의 Enter로 두 번 실행이다.
 * `<a href>`만 예외인데, `<a>`의 Space는 click을 합성하지 않고 페이지를 스크롤하기 때문이다.
 */

interface ActionMenuItemBase
  extends Omit<
    ButtonHTMLAttributes<HTMLButtonElement>,
    | "type"
    | "role"
    | "onClick"
    | "disabled"
    | "aria-disabled"
    | "aria-checked"
    | "aria-busy"
    | "tabIndex"
    // DOM에도 onSelect가 있다. 이름이 겹치면 우리 계약이 텍스트 선택 이벤트로 오해된다.
    | "onSelect"
  > {
  readonly danger?: boolean;
  /** 표기 방식은 Root의 `disabledItems` 전략이 결정한다. item이 고르지 않는다. */
  readonly disabled?: boolean;
  /** announce 전략에서 읽히는 이유. */
  readonly disabledReason?: string;
  /** 중복 실행 차단 + `aria-busy`. **메뉴는 닫지 않는다.** */
  readonly busy?: boolean;
  readonly closeOnSelect?: boolean;
  readonly onSelect?: (event: MouseEvent<HTMLElement>) => void;
  readonly ref?: Ref<HTMLButtonElement>;
}

/**
 * role과 checked를 분리할 수 없게 묶는다. `menuitem` + `aria-checked`는 허용되지 않는 조합이라
 * 시각 체크 표시와 접근성 상태가 갈린다.
 */
export type ActionMenuItemProps =
  | (ActionMenuItemBase & { readonly role?: "menuitem"; readonly checked?: never })
  | (ActionMenuItemBase & {
      readonly role: "menuitemcheckbox" | "menuitemradio";
      readonly checked: boolean;
    });

interface SharedItemState {
  readonly blocked: boolean;
  readonly describedBy: string | undefined;
  readonly reasonNode: ReactNode;
  readonly skip: boolean;
  readonly announce: boolean;
}

function useItemState(
  disabled: boolean,
  busy: boolean,
  disabledReason: string | undefined,
): SharedItemState {
  const { disabledItems } = useAnchoredContext("ActionMenuItem");
  const reasonId = `louis-menu-reason-${useId()}`;
  const skip = disabled && disabledItems === "skip";
  const announce = disabled && disabledItems === "announce";
  const showReason = announce && disabledReason !== undefined;
  return {
    blocked: disabled || busy,
    describedBy: showReason ? reasonId : undefined,
    reasonNode: showReason ? (
      <span id={reasonId} className="louis-visually-hidden">
        {disabledReason}
      </span>
    ) : null,
    skip,
    announce,
  };
}

export function ActionMenuItem({
  danger = false,
  disabled = false,
  disabledReason,
  busy = false,
  closeOnSelect,
  onSelect,
  role = "menuitem",
  checked,
  className,
  children,
  ref,
  ...rest
}: ActionMenuItemProps): JSX.Element {
  const context = useAnchoredContext("ActionMenuItem");
  const state = useItemState(disabled, busy, disabledReason);
  const shouldClose = closeOnSelect ?? context.closeOnSelect;

  return (
    <button
      {...rest}
      ref={ref}
      type="button"
      role={role}
      data-louis-menu-item=""
      className={["louis-menu__item", "louis-focus-ring", className].filter(Boolean).join(" ")}
      {...(danger ? { "data-tone": "danger" } : {})}
      {...(state.skip ? { disabled: true } : {})}
      {...(state.announce || busy ? { "aria-disabled": true } : {})}
      {...(busy ? { "aria-busy": true } : {})}
      {...(checked === undefined ? {} : { "aria-checked": checked })}
      {...(state.describedBy === undefined
        ? {}
        : { "aria-describedby": state.describedBy })}
      onClick={(event) => {
        if (state.blocked) {
          // aria-disabled는 브라우저가 막아주지 않는다. 전파까지 멈춰야 상위 핸들러도 안 탄다.
          event.preventDefault();
          event.stopPropagation();
          return;
        }
        context.overlay.activate(
          event.nativeEvent,
          () => onSelect?.(event),
          shouldClose,
        );
      }}
    >
      {checked === undefined ? null : (
        <span className="louis-menu__item-indicator" aria-hidden="true">
          ✓
        </span>
      )}
      {busy ? <span className="louis-menu__spinner" aria-hidden="true" /> : null}
      <span className="louis-menu__item-label" data-louis-menu-item-label="">
        {children}
      </span>
      {state.reasonNode}
    </button>
  );
}

export interface ActionMenuLinkItemProps
  extends Omit<
    AnchorHTMLAttributes<HTMLAnchorElement>,
    "role" | "onClick" | "onKeyDown" | "onSelect" | "aria-disabled" | "tabIndex"
  > {
  readonly href: string;
  readonly danger?: boolean;
  readonly disabled?: boolean;
  readonly disabledReason?: string;
  readonly closeOnSelect?: boolean;
  readonly onSelect?: (event: MouseEvent<HTMLAnchorElement>) => void;
  readonly ref?: Ref<HTMLAnchorElement>;
}

export function ActionMenuLinkItem({
  href,
  danger = false,
  disabled = false,
  disabledReason,
  closeOnSelect,
  onSelect,
  className,
  children,
  ref,
  ...rest
}: ActionMenuLinkItemProps): JSX.Element {
  const context = useAnchoredContext("ActionMenuLinkItem");
  const state = useItemState(disabled, false, disabledReason);
  const shouldClose = closeOnSelect ?? context.closeOnSelect;

  // `<a>`에는 네이티브 disabled가 없다. skip 전략에서 탐색 제외를 표현할 수단이 data 속성뿐이다.
  const skipProps = state.skip
    ? { "data-louis-menu-skip": "", "aria-disabled": true as const }
    : {};

  return (
    <a
      {...rest}
      {...skipProps}
      ref={ref}
      role="menuitem"
      data-louis-menu-item=""
      className={["louis-menu__item", "louis-focus-ring", className].filter(Boolean).join(" ")}
      {...(state.skip ? {} : { href })}
      {...(danger ? { "data-tone": "danger" } : {})}
      {...(state.announce ? { "aria-disabled": true } : {})}
      {...(state.describedBy === undefined
        ? {}
        : { "aria-describedby": state.describedBy })}
      onClick={(event) => {
        if (state.blocked) {
          event.preventDefault();
          event.stopPropagation();
          return;
        }
        context.overlay.activate(
          event.nativeEvent,
          () => onSelect?.(event),
          shouldClose,
        );
      }}
      onKeyDown={(event) => {
        // `<a>`의 Space는 click을 합성하지 않고 페이지를 스크롤한다. menuitem은 양쪽 활성화를
        // 요구하므로 여기서만 keydown이 필요하다. click을 한 번 합성해 위 onClick으로 보낸다.
        if (event.key !== " " || event.repeat) return;
        event.preventDefault();
        if (state.blocked) return;
        event.currentTarget.click();
      }}
    >
      <span className="louis-menu__item-label" data-louis-menu-item-label="">
        {children}
      </span>
      {state.reasonNode}
    </a>
  );
}
