"use client";

import { DismissableLayer } from "@radix-ui/react-dismissable-layer";
import {
  useCallback,
  useEffect,
  useRef,
  type ComponentPropsWithoutRef,
  type JSX,
  type Ref,
} from "react";
import type { LayerRecord, OverlayStore } from "./overlay-store.js";
import type { OverlayDismissReason } from "./types.js";

/**
 * 바깥 상호작용을 감지해 **정책에만 위임**한다. 스스로 닫지 않는다.
 *
 * 하부 유틸에 `onDismiss`를 넘기지 않는 것이 이 파일의 핵심이다. 넘기면 그 유틸이 Escape를
 * 삼키고 자체 stack으로 라우팅하는데, 그 stack은 등록(=effect) 순서를 쓰므로 같은 commit
 * 중첩 마운트에서 부모가 최상위가 된다. `onDismiss` 없이 쓰면 Escape는 통과하고 우리 store가
 * 소유한다.
 *
 * 순서 계약(§menu-popover.md "선택이 닫힘보다 먼저"):
 *
 *   pointerdown(바깥) → 아무것도 닫지 않는다. DOM도 그대로 둔다.
 *   click(바깥)       → 여기서 commit하고, 그 click이 배경에 도달하기 전에 소비한다.
 *
 * pointerdown에서 닫으면 그 좌표의 hit-test 대상이 사라져 후속 click이 엉뚱한 곳으로 가고,
 * pointerdown에서 preventDefault하면 click 자체가 사라져 activation이 0회가 된다.
 * 두 실패 모두 규범이 금지한 "열리지만 선택되지 않음"이다.
 */

type DismissableLayerProps = ComponentPropsWithoutRef<typeof DismissableLayer>;

export interface OverlayDismissRegionProps
  extends Omit<
    DismissableLayerProps,
    "onDismiss" | "onPointerDownOutside" | "onFocusOutside" | "onInteractOutside"
  > {
  readonly store: OverlayStore;
  /**
   * 값이 아니라 getter다. record는 layout effect에서 만들어지므로 렌더 시점 값으로 넘기면
   * 마운트 직후 한 커밋 동안 null이 되고, 그 창에 들어온 바깥 클릭이 게이트를 그냥 통과한다.
   * 그러면 배경 액션이 실행되는데, 증상이 타이밍에 따라만 나타나 재현이 어렵다.
   */
  readonly getRecord: () => LayerRecord | null;
  readonly branchId: string;
  readonly requestClose: (reason: OverlayDismissReason) => void;
  /** 바깥 클릭을 배경으로 통과시킬지. 기본 false — 배경 액션을 실행하지 않는다. */
  readonly outsidePointerPassthrough?: boolean;
  /** pointer capture 중이면 바깥 판정을 하지 않는다. drag가 패널 밖으로 나가는 정상 경우다. */
  readonly pointerCaptureActive?: boolean;
  readonly ref?: Ref<HTMLDivElement>;
}

interface PendingOutside {
  readonly reason: OverlayDismissReason;
}

export function OverlayDismissRegion({
  store,
  getRecord,
  branchId,
  requestClose,
  outsidePointerPassthrough = false,
  pointerCaptureActive = false,
  children,
  ...rest
}: OverlayDismissRegionProps): JSX.Element {
  const pending = useRef<PendingOutside | null>(null);
  const state = useRef({
    store,
    getRecord,
    branchId,
    requestClose,
    outsidePointerPassthrough,
    pointerCaptureActive,
  });
  state.current = {
    store,
    getRecord,
    branchId,
    requestClose,
    outsidePointerPassthrough,
    pointerCaptureActive,
  };

  /** 정책 1·2·3의 공통 게이트. 통과하면 true. */
  const shouldConsiderOutside = useCallback((path: readonly EventTarget[]): boolean => {
    const current = state.current;
    // 정책 1·3: 최상위 하나만 바깥 판정을 소유한다. 아래 layer가 함께 닫히면
    // 한 번의 클릭이 여러 단계를 지운다.
    const record = current.getRecord();
    if (record === null) return false;
    if (current.store.topmost() !== record) return false;
    // 정책 2: portal된 submenu, 별도 subtree의 Listbox, positioning 래퍼 여백을 전부
    // 내부로 본다. panel.contains() 단독 판정이 틀리는 세 경우가 이 한 줄에 흡수된다.
    if (current.store.branches.containsPath(current.branchId, path)) return false;
    if (current.pointerCaptureActive) return false;
    return true;
  }, []);

  useEffect(() => {
    return () => {
      pending.current = null;
    };
  }, []);

  return (
    // onDismiss를 넘기지 않는다 — Omit으로 타입에서도 제거했다.
    // 넘기는 순간 하부 유틸이 Escape를 삼키고 자체 stack으로 라우팅한다.
    <DismissableLayer
      {...rest}
      onPointerDownOutside={(event) => {
        const path = event.detail.originalEvent.composedPath();
        if (!shouldConsiderOutside(path)) {
          event.preventDefault();
          return;
        }
        // 항상 취소한다. 하부 유틸이 자체 dismiss로 진행하지 못하게 하는 것이지
        // 닫지 않겠다는 뜻이 아니다 — commit은 후속 click에서 한다.
        event.preventDefault();
        pending.current = { reason: "outside" };

        const commit = (clickEvent: MouseEvent): void => {
          const current = state.current;
          if (pending.current === null) return;
          // pointerdown과 click 사이에 레이아웃이 바뀌어 착지점이 내부가 됐을 수 있다.
          if (current.store.branches.containsPath(current.branchId, clickEvent.composedPath())) {
            pending.current = null;
            return;
          }
          if (!current.outsidePointerPassthrough) {
            // 배경 액션을 실행하지 않는다. 이 표현은 click 단계에서만 가능하다 —
            // pointerdown에는 "이 클릭을 소비한다"를 나타낼 수단이 없다.
            clickEvent.preventDefault();
            clickEvent.stopPropagation();
          }
          pending.current = null;
          current.requestClose("outside");
        };
        const abort = (): void => {
          // drag가 취소되면 닫지 않는다.
          pending.current = null;
        };
        document.addEventListener("click", commit, { capture: true, once: true });
        document.addEventListener("pointercancel", abort, { once: true });
      }}
      onFocusOutside={(event) => {
        const path = event.detail.originalEvent.composedPath();
        if (!shouldConsiderOutside(path)) {
          event.preventDefault();
          return;
        }
        event.preventDefault();
        // click 지연 대상이 아니다. non-modal에서 Tab으로 빠져나가는 경로가 여기로 들어오고,
        // DS-D-0011 결정 4에 따라 reason은 "outside"다 — 포커스를 되돌리지 않는 정책이 같다.
        state.current.requestClose("outside");
      }}
    >
      {children}
    </DismissableLayer>
  );
}
