"use client";

import {
  useCallback,
  useEffect,
  useId,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
  type JSX,
  type RefObject,
} from "react";
import { OverlayPositioner } from "../overlay/positioner.js";
import { useOverlay } from "../overlay/use-overlay.js";
import type { OverlayDismissReason } from "../overlay/types.js";
import {
  AnchoredContextProvider,
  type AnchoredContextValue,
  type AnchoredKind,
  type AnchoredOpenIntent,
} from "./context.js";
import type {
  AnchoredPanelLabel,
  AnchoredRootProps,
  DisabledItemStrategy,
  OverlayCloseReason,
  OverlayHandle,
} from "./types.js";

/**
 * 두 recipe가 공유하는 Root.
 *
 * 소유하는 것: controlled/uncontrolled 정규화, `setOpen(next, reason)` 단일 통로,
 * **열림 통지**(primitive는 닫힘만 통지한다), `OverlayHandle`, 초기 focus 정책의 게터 ref.
 *
 * 소유하지 않는 것: 순서와 정책 전부. Escape 라우팅·바깥 판정·presence·focus 복원 시점은
 * primitive가 이미 소유하며 여기서 다시 쓰지 않는다.
 */

export interface AnchoredRootOwnProps extends AnchoredRootProps {
  readonly kind: AnchoredKind;
  readonly panelLabel: AnchoredPanelLabel;
  readonly disabledItems?: DisabledItemStrategy;
  readonly typeaheadLocale?: string;
  /**
   * 초기 focus 대상을 패널에서 계산한다. 호출 시점에 패널은 이미 열려 있다.
   * 후보가 없으면 패널 자신을 돌려주는 것이 §Focus의 "강등" 규칙이다.
   */
  readonly resolveInitialFocus: (panel: HTMLElement) => HTMLElement | null;
}

function isCloseReason(reason: OverlayDismissReason): reason is OverlayCloseReason {
  return reason !== "backdrop";
}

export function AnchoredRoot({
  kind,
  panelLabel,
  disabledItems = "announce",
  typeaheadLocale,
  resolveInitialFocus,
  open,
  defaultOpen = false,
  onOpenChange,
  placement = "bottom",
  align = "start",
  disabled = false,
  closeOnSelect,
  children,
  ref,
}: AnchoredRootOwnProps): JSX.Element {
  const isControlled = open !== undefined;
  if (isControlled && defaultOpen) {
    throw new Error(
      "open과 defaultOpen을 함께 지정할 수 없습니다. 하나가 다른 하나를 조용히 무시하게 됩니다.",
    );
  }

  const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen);
  const actualOpen = isControlled ? open : uncontrolledOpen;

  const panelRef = useRef<HTMLDivElement | null>(null);
  const triggerRef = useRef<HTMLElement | null>(null);
  const openIntentRef = useRef<AnchoredOpenIntent>("first");
  const triggerId = `kds-anchored-${useId()}-trigger`;

  const onOpenChangeRef = useRef(onOpenChange);
  onOpenChangeRef.current = onOpenChange;
  const resolveInitialFocusRef = useRef(resolveInitialFocus);
  resolveInitialFocusRef.current = resolveInitialFocus;

  const setOpen = useCallback(
    (next: boolean, reason: OverlayCloseReason): void => {
      if (!isControlled) setUncontrolledOpen(next);
      onOpenChangeRef.current?.(next, reason);
    },
    [isControlled],
  );

  /**
   * 초기 focus를 **게터 ref**로 넘긴다.
   *
   * 값으로 넘기면 "언제 계산하는가"가 렌더 순서에 묶인다 — 패널이 아직 없거나 item이 아직
   * 등록되지 않은 시점에 계산되면 null이 되고, 그 실패는 조용하다. 게터는 primitive가 실제로
   * focus를 보내는 순간에 계산되므로 순서 의존이 사라진다.
   */
  const initialFocusRef = useMemo<RefObject<HTMLElement | null>>(
    () => ({
      get current(): HTMLElement | null {
        const panel = panelRef.current;
        if (panel === null) return null;
        return resolveInitialFocusRef.current(panel);
      },
      set current(_value: HTMLElement | null) {
        // primitive는 읽기만 한다. 쓰기를 허용하면 정책이 조용히 덮인다.
      },
    }),
    [],
  );

  const overlay = useOverlay({
    open: actualOpen,
    mode: "non-modal",
    layer: "popover",
    anchored: true,
    side: placement,
    align,
    closeOnEscape: true,
    outsidePointerPassthrough: false,
    triggerRef,
    initialFocus: { kind: "ref", target: initialFocusRef },
    onOpenChange: (nextOpen, reason) => {
      if (nextOpen) return;
      if (!isCloseReason(reason)) return;
      setOpen(false, reason);
    },
  });

  useImperativeHandle(
    ref,
    (): OverlayHandle => ({
      close: (reason) => {
        overlay.requestClose(reason);
      },
    }),
    [overlay],
  );

  // trigger가 사라지면 닫는다. 규범이 "Trigger unmount 시 닫는다"를 요구하고, reason은
  // 포커스를 옮기지 않는 route다 — 돌아갈 trigger가 이미 없다.
  const requestCloseRef = useRef(overlay.requestClose);
  requestCloseRef.current = overlay.requestClose;
  useEffect(() => {
    return () => {
      requestCloseRef.current("route");
    };
  }, []);

  const contextValue = useMemo<AnchoredContextValue>(
    () => ({
      kind,
      overlay,
      open: actualOpen,
      setOpen,
      disabled,
      closeOnSelect: closeOnSelect ?? kind === "action-menu",
      disabledItems,
      typeaheadLocale,
      panelLabel,
      panelRef,
      triggerRef,
      triggerId,
      openIntentRef,
    }),
    [
      kind,
      overlay,
      actualOpen,
      setOpen,
      disabled,
      closeOnSelect,
      disabledItems,
      typeaheadLocale,
      panelLabel,
      triggerId,
    ],
  );

  return (
    <AnchoredContextProvider value={contextValue}>
      <OverlayPositioner>{children}</OverlayPositioner>
    </AnchoredContextProvider>
  );
}
