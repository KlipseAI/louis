"use client";

import { createContext, useContext, type Provider, type RefObject } from "react";
import type { UseOverlayResult } from "../overlay/use-overlay.js";
import type { DialogEffectivePolicy } from "./policy.js";

export interface DialogContextValue {
  readonly overlay: UseOverlayResult;
  readonly policy: DialogEffectivePolicy;
  readonly variant: string;
  /** card 노드. 초기 focus 게터와 aria 배선이 이것을 기준으로 계산한다. */
  readonly cardRef: RefObject<HTMLDivElement | null>;
  /** confirm/cancel의 유일한 발행 통로. 내부에서 pending reason을 세팅한다. */
  readonly closeWith: (reason: "confirm" | "cancel" | "programmatic") => void;
  /** backdrop 전용. 정책 게이트와 차단 안내를 함께 처리한다. */
  readonly requestBackdropDismiss: () => void;
  readonly describedBy: string | undefined;
  readonly registerDescription: (present: boolean) => void;
}

const DialogContext = createContext<DialogContextValue | null>(null);

export const DialogContextProvider: Provider<DialogContextValue | null> =
  DialogContext.Provider;

export function useDialogContext(part: string): DialogContextValue {
  const value = useContext(DialogContext);
  if (value === null) {
    throw new Error(`${part}은(는) Dialog 안에서만 사용할 수 있습니다.`);
  }
  return value;
}

/**
 * 소비자가 자기 footer를 직접 그릴 때의 유일한 confirm/cancel 발행 통로.
 *
 * `useOverlayBranch().close`처럼 `setOpen`과 `requestClose`를 둘 다 부르지 **않는다.**
 * 그러면 presence의 최종 통지와 합쳐 `onOpenChange(false, …)`가 두 번 나간다.
 */
export function useDialogClose(): (reason: "confirm" | "cancel") => void {
  return useDialogContext("useDialogClose").closeWith;
}
