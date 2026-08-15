"use client";

import { FocusScope } from "@radix-ui/react-focus-scope";
import type { ComponentPropsWithoutRef, JSX, RefObject } from "react";
import type { OverlayDismissReason, OverlayInitialFocus } from "./types.js";

/**
 * focus의 **시점과 대상은 전부 우리가 정한다.** 하부 유틸에서는 trap의 3중 방어와 tabbable
 * 탐색만 가져온다.
 *
 * mount/unmount autofocus를 둘 다 `preventDefault()`하는 이유:
 *
 * - mount: 유틸의 초기 focus 대상 선정이 우리 정책(7종)과 다르고, `<a>`를 제외한다.
 * - unmount: 유틸의 복원이 `setTimeout(0)`로 **비동기**다. 그 사이에 root가 unmount되면
 *   복원 대상이 사라져 focus가 body로 떨어진다 — dialog.md가 명시적으로 금지한 실패다.
 *   우리는 §presence의 `onBeforeUnmount`에서 **root가 아직 DOM에 있는 동안** 동기로 옮긴다.
 *
 * FocusScope는 사용자 `onKeyDown`을 조용히 버리므로 키 처리를 여기 붙이지 않는다.
 */

type FocusScopeProps = ComponentPropsWithoutRef<typeof FocusScope>;

export interface OverlayFocusRegionProps
  extends Omit<FocusScopeProps, "onMountAutoFocus" | "onUnmountAutoFocus"> {
  readonly trapped: boolean;
}

export function OverlayFocusRegion({
  trapped,
  children,
  ...rest
}: OverlayFocusRegionProps): JSX.Element {
  return (
    <FocusScope
      {...rest}
      trapped={trapped}
      loop={trapped}
      onMountAutoFocus={(event) => {
        event.preventDefault();
      }}
      onUnmountAutoFocus={(event) => {
        event.preventDefault();
      }}
    >
      {children}
    </FocusScope>
  );
}

const FOCUSABLE_SELECTOR = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled]):not([type='hidden'])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  "[tabindex]:not([tabindex='-1'])",
].join(",");

function focusableWithin(root: HTMLElement): readonly HTMLElement[] {
  return Array.from(root.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)).filter(
    (element) => element.offsetParent !== null || element === document.activeElement,
  );
}

/** 초기 focus 정책 7종의 해석. 어느 variant가 무엇을 받는지는 컴포넌트 규범이 소유한다. */
export function resolveInitialFocus(
  root: HTMLElement,
  policy: OverlayInitialFocus,
): HTMLElement | null {
  if (policy.kind === "none") return null;
  if (policy.kind === "ref") return policy.target.current;
  if (policy.kind === "surface") return root;

  const candidates = focusableWithin(root);
  if (candidates.length === 0) return root;
  if (policy.kind === "first") return candidates[0] ?? root;
  if (policy.kind === "last") return candidates[candidates.length - 1] ?? root;
  if (policy.kind === "first-field") {
    return (
      candidates.find((element) =>
        ["INPUT", "SELECT", "TEXTAREA"].includes(element.tagName),
      ) ??
      candidates[0] ??
      root
    );
  }
  // safe-action — 파괴적이지 않은 액션. 호출부가 data 속성으로 지목한다.
  return (
    candidates.find((element) => element.dataset["kdsSafeAction"] === "true") ??
    candidates[0] ??
    root
  );
}

/**
 * 닫힐 때 포커스를 어디로 돌릴지.
 *
 * `outside`와 `route`는 **옮기지 않는다.** 사용자가 이미 다른 곳을 눌렀거나 화면을 떠난
 * 상태이고, 여기서 trigger로 되돌리면 그 조작을 취소하는 것이 된다.
 * DS-D-0011 결정 4에 따라 non-modal Tab 이탈도 이 경로다.
 */
export function resolveReturnFocus(
  reason: OverlayDismissReason,
  returnFocus: RefObject<HTMLElement | null> | undefined,
  trigger: RefObject<HTMLElement | null> | undefined,
  parentPanel: HTMLElement | null,
  fallbackHost: HTMLElement | null,
): HTMLElement | null {
  if (reason === "outside" || reason === "route") return null;

  const explicit = returnFocus?.current ?? null;
  if (explicit !== null && explicit.isConnected) return explicit;

  const triggerNode = trigger?.current ?? null;
  if (triggerNode !== null && triggerNode.isConnected) return triggerNode;

  // 중첩 overlay는 **부모 패널 안**으로 돌아간다. 이 단계가 없으면 아래 host 폴백이
  // 문서의 첫 focusable(대개 배경 control)을 고르고, 그 focus 이동이 부모의 focus-outside
  // 판정을 발화시켜 **한 번의 Escape가 두 단계를 닫는다.** 규범은 한 단계만 닫으라고 한다.
  if (parentPanel !== null && parentPanel.isConnected) {
    return focusableWithin(parentPanel)[0] ?? parentPanel;
  }

  // trigger가 사라진 경우. body로 떨어뜨리지 않고 논리적 다음 owner를 찾는다.
  if (fallbackHost !== null) {
    const next = focusableWithin(fallbackHost)[0];
    if (next !== undefined) return next;
  }
  return null;
}
