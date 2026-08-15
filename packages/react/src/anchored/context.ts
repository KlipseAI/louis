"use client";

import { createContext, useContext, type Provider, type RefObject } from "react";
import type { UseOverlayResult } from "../overlay/use-overlay.js";
import type {
  AnchoredPanelLabel,
  DisabledItemStrategy,
  OverlayBranch,
  OverlayCloseReason,
} from "./types.js";

/**
 * Root가 Trigger·Content·Item에 넘기는 recipe 문맥.
 *
 * primitive의 overlay context와 **별개**다. 그쪽은 host·store·metrics 같은 앱 단위 자원을
 * 나르고, 이쪽은 이 인스턴스의 정책(kind, disabled 전략, label, open intent)을 나른다.
 */

export type AnchoredKind = "action-menu" | "composite-popover";

/** trigger가 어떤 키로 열었는지. §Focus의 "ArrowUp이면 마지막 item"이 이 값을 읽는다. */
export type AnchoredOpenIntent = "first" | "last";

export interface AnchoredContextValue {
  readonly kind: AnchoredKind;
  readonly overlay: UseOverlayResult;
  readonly open: boolean;
  /** 열림·닫힘 통지의 단일 통로. controlled/uncontrolled를 여기서 정규화한다. */
  readonly setOpen: (next: boolean, reason: OverlayCloseReason) => void;
  readonly disabled: boolean;
  readonly closeOnSelect: boolean;
  readonly disabledItems: DisabledItemStrategy;
  readonly typeaheadLocale: string | undefined;
  readonly panelLabel: AnchoredPanelLabel;
  readonly panelRef: RefObject<HTMLDivElement | null>;
  readonly triggerRef: RefObject<HTMLElement | null>;
  readonly triggerId: string;
  readonly openIntentRef: RefObject<AnchoredOpenIntent>;
}

const AnchoredContext = createContext<AnchoredContextValue | null>(null);

export const AnchoredContextProvider: Provider<AnchoredContextValue | null> =
  AnchoredContext.Provider;

export function useAnchoredContext(part: string): AnchoredContextValue {
  const value = useContext(AnchoredContext);
  if (value === null) {
    throw new Error(
      `${part}은(는) 대응하는 Root 안에서만 사용할 수 있습니다.`,
    );
  }
  return value;
}

/** 문맥이 없으면 null. Item이 잘못된 Root 안에 있는지 판별할 때 쓴다. */
export function useOptionalAnchoredContext(): AnchoredContextValue | null {
  return useContext(AnchoredContext);
}

/**
 * React 트리 밖에서 만든 nested overlay를 이 branch의 내부로 등록한다.
 *
 * 이것이 공개돼야 하는 이유: 앱이 명령형으로 만든 색 선택기나 서드파티 콤보박스는 React
 * 트리에 없으므로 하부 유틸의 자동 내부 판정에 걸리지 않는다. 등록하지 않으면 그 안을 클릭할 때
 * 부모 패널이 바깥으로 오판해 닫힌다.
 */
export function useOverlayBranch(): OverlayBranch {
  const context = useAnchoredContext("useOverlayBranch");
  const { overlay } = context;
  return {
    branchId: overlay.branchId,
    panelId: overlay.ids.panel,
    registerMember: overlay.registerMember,
    close: (reason) => {
      context.setOpen(false, reason);
      overlay.requestClose(reason);
    },
  };
}
