"use client";

import { useId, type HTMLAttributes, type JSX, type ReactNode, type Ref } from "react";

/** 장식 행을 `menuitem`으로 만들지 않는다. group label은 이름이지 항목이 아니다. */
export interface ActionMenuGroupProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "role"> {
  readonly label?: ReactNode;
  readonly ref?: Ref<HTMLDivElement>;
}

export function ActionMenuGroup({
  label,
  children,
  ref,
  ...rest
}: ActionMenuGroupProps): JSX.Element {
  const labelId = `louis-menu-group-${useId()}`;
  const hasLabel = label !== undefined && label !== null;
  return (
    <div
      {...rest}
      ref={ref}
      role="group"
      {...(hasLabel ? { "aria-labelledby": labelId } : {})}
    >
      {hasLabel ? (
        <div id={labelId} className="louis-menu__group-label">
          {label}
        </div>
      ) : null}
      {children}
    </div>
  );
}

export interface ActionMenuSeparatorProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "role"> {
  readonly ref?: Ref<HTMLDivElement>;
}

export function ActionMenuSeparator({
  className,
  ref,
  ...rest
}: ActionMenuSeparatorProps): JSX.Element {
  return (
    <div
      {...rest}
      ref={ref}
      role="separator"
      aria-orientation="horizontal"
      className={["louis-menu__separator", className].filter(Boolean).join(" ")}
    />
  );
}
