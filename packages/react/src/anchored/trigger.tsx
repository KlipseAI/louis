"use client";

import { useCallback, type JSX, type KeyboardEvent, type MouseEvent } from "react";
import { OverlayAnchor } from "../overlay/positioner.js";
import { Slot } from "../internal/slot.js";
import { useAnchoredContext } from "./context.js";
import type { AnchoredTriggerProps } from "./types.js";

/**
 * 두 recipe 공통 Trigger 배선.
 *
 * 소유하는 것: aria 4종, 토글, `ArrowDown`/`ArrowUp` 열기와 그 intent, `disabled`,
 * anchor 등록, **branch member 등록**.
 *
 * branch member 등록이 중요한 이유: 등록하지 않으면 열린 상태에서 trigger를 다시 누르는 것이
 * "바깥 클릭"으로 판정돼 reason이 `outside`가 된다. 규범은 그 경로를 `trigger`로 정하고,
 * 두 reason은 focus 정책이 정반대다(`outside`는 포커스를 옮기지 않고 `trigger`는 되돌린다).
 */

export interface AnchoredTriggerOwnProps extends AnchoredTriggerProps {
  readonly part: string;
}

export function AnchoredTrigger({
  part,
  asChild = false,
  onClick,
  onKeyDown,
  children,
  ref,
  ...rest
}: AnchoredTriggerOwnProps): JSX.Element {
  const context = useAnchoredContext(part);
  const { overlay, open, setOpen, disabled, kind, triggerRef, triggerId, openIntentRef } =
    context;

  const attachTrigger = useCallback(
    (node: HTMLElement | null): void => {
      triggerRef.current = node;
      overlay.registerMember(node);
      if (typeof ref === "function") ref(node);
      else if (ref !== null && ref !== undefined) ref.current = node;
    },
    [overlay, ref, triggerRef],
  );

  const openWith = useCallback(
    (intent: "first" | "last"): void => {
      openIntentRef.current = intent;
      setOpen(true, "trigger");
    },
    [openIntentRef, setOpen],
  );

  const handleClick = useCallback(
    (event: MouseEvent<HTMLElement>): void => {
      onClick?.(event as MouseEvent<HTMLButtonElement>);
      if (event.defaultPrevented || disabled) return;
      // Enter·Space도 브라우저가 click으로 합성해 이 경로로 온다. keydown을 따로 달면 두 번 실행된다.
      if (open) overlay.requestClose("trigger");
      else openWith("first");
    },
    [disabled, onClick, open, overlay, openWith],
  );

  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLElement>): void => {
      onKeyDown?.(event as KeyboardEvent<HTMLButtonElement>);
      if (event.defaultPrevented || disabled || open) return;
      if (event.key !== "ArrowDown" && event.key !== "ArrowUp") return;
      // 스크롤을 막고 연다. 어느 끝에서 시작할지는 이 키가 직접 알고 있다 —
      // pointer 여부를 heuristic으로 역추론하지 않는 이유가 이것이다.
      event.preventDefault();
      openWith(event.key === "ArrowDown" ? "first" : "last");
    },
    [disabled, onKeyDown, open, openWith],
  );

  // 마운트돼 있고 closing이 아닐 때만 가리킨다. 사라졌거나 inert인 노드를 가리키면
  // 접근성 검사가 오류를 내고 "제어 대상으로 이동"이 아무 데도 가지 않는다.
  const controls =
    overlay.mounted && overlay.state !== "closing" ? overlay.ids.panel : undefined;

  const triggerProps = {
    ...rest,
    id: triggerId,
    ref: attachTrigger,
    "aria-haspopup": kind === "action-menu" ? ("menu" as const) : ("dialog" as const),
    "aria-expanded": open,
    ...(controls === undefined ? {} : { "aria-controls": controls }),
    "data-louis-anchored-trigger": kind,
    onClick: handleClick,
    onKeyDown: handleKeyDown,
  };

  if (asChild) {
    return (
      <OverlayAnchor asChild>
        <Slot {...triggerProps} {...(disabled ? { "aria-disabled": true } : {})}>
          {children}
        </Slot>
      </OverlayAnchor>
    );
  }

  return (
    <OverlayAnchor asChild>
      <button type="button" {...triggerProps} disabled={disabled}>
        {children}
      </button>
    </OverlayAnchor>
  );
}
