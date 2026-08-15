"use client";

import {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  type HTMLAttributes,
  type JSX,
  type ReactNode,
  type Ref,
  type RefObject,
} from "react";
import { createActivationGuard } from "./activation-guard.js";
import { OverlayDismissRegion } from "./dismiss-region.js";
import {
  OverlayFocusRegion,
  resolveInitialFocus,
  resolveReturnFocus,
} from "./focus-region.js";
import { useOverlayIds, type OverlayIds } from "./ids.js";
import {
  OverlayBranchProvider,
  useOverlayContext,
  useParentBranch,
} from "./overlay-provider.js";
import { OverlayPortal } from "./overlay-portal.js";
import {
  OverlayPositioned,
  type OverlayAlign,
  type OverlaySide,
} from "./positioner.js";
import type { LayerRecord, OverlayStore } from "./overlay-store.js";
import { useOverlayPresence } from "./presence.js";
import type {
  OverlayDismissReason,
  OverlayInitialFocus,
  OverlayLayer,
  OverlayMode,
  OverlayPresenceState,
} from "./types.js";

const LAYER_RANK: Record<OverlayLayer, number> = { popover: 1, modal: 2, critical: 3 };

/**
 * Surface가 렌더할 때 읽는 인스턴스 값. 매 렌더에서 갱신되고, Surface는 렌더 시점에 읽는다.
 *
 * props가 아니라 ref로 나르는 이유는 **컴포넌트 정체성** 때문이다. 아래 주석 참조.
 */
interface OverlaySurfaceInstance {
  readonly mounted: boolean;
  readonly state: OverlayPresenceState;
  readonly layer: OverlayLayer;
  readonly mode: OverlayMode;
  readonly branchId: string;
  readonly panelId: string;
  readonly store: OverlayStore;
  readonly getRecord: () => LayerRecord | null;
  readonly requestClose: (reason: OverlayDismissReason) => void;
  readonly outsidePointerPassthrough: boolean;
  readonly rootRef: (node: HTMLElement | null) => void;
  readonly anchored: boolean;
  readonly side: OverlaySide;
  readonly align: OverlayAlign;
  readonly offset: number;
  readonly collisionPadding: number;
  readonly markPlaced: () => void;
}

/**
 * Surface 컴포넌트를 **인스턴스당 정확히 한 번** 만든다.
 *
 * 이전 구현은 `useCallback`으로 Surface를 만들고 deps에 `state`를 넣었다. 그런데 호출부는
 * 이것을 `<Surface>`로 **element type**에 쓴다. React는 element type이 바뀌면 같은 위치라도
 * 이전 트리를 unmount하고 새로 mount하므로, presence 전이(`opening → open → closing`)마다
 * 패널 subtree 전체가 재마운트됐다. 결과는 세 가지였다.
 *
 * 1. `opening → open`에서 패널이 **새 노드로 삽입**되므로 base.css의
 *    `[data-kds-state="opening"] { visibility: hidden }` 가드를 거치지 않는다. 규범이 "임시
 *    위치를 한 프레임도 노출하지 않는다"고 금지한 상태가 그대로 만들어진다.
 * 2. enter transition의 시작 프레임이 사라져 open motion이 성립하지 않는다.
 * 3. 패널 안의 모든 상태(roving index, typeahead 버퍼, 입력값, 스크롤 위치)가 초기화된다.
 *
 * 그래서 정체성을 영구 고정한다. `useMemo`가 아니라 `useRef`를 쓰는 이유는, React가 `useMemo`를
 * 의미 보장이 아닌 최적화로 규정하기 때문이다 — 여기서 정체성은 **의미**다.
 */
function createOverlaySurface(
  instance: RefObject<OverlaySurfaceInstance>,
): OverlaySurfaceComponent {
  return function OverlaySurface({ children, className, ref: consumerRef, ...rest }) {
    const current = instance.current;
    if (!current.mounted) return null;
    const attachRoot = (node: HTMLDivElement | null): void => {
      current.rootRef(node);
      if (typeof consumerRef === "function") consumerRef(node);
      else if (consumerRef !== null && consumerRef !== undefined) consumerRef.current = node;
    };
    const classes = ["kds-overlay-panel", `kds-layer-${current.layer}`, className]
      .filter(Boolean)
      .join(" ");
    const surface = (
      <OverlayFocusRegion
        asChild
        trapped={current.mode === "modal" && current.state === "open"}
      >
        <OverlayDismissRegion
          {...rest}
          store={current.store}
          getRecord={current.getRecord}
          branchId={current.branchId}
          requestClose={current.requestClose}
          outsidePointerPassthrough={current.outsidePointerPassthrough}
          ref={attachRoot}
          id={current.panelId}
          className={classes}
          data-kds-state={current.state}
          data-kds-overlay-branch={current.branchId}
          data-kds-overlay-mode={current.mode}
        >
          {children}
        </OverlayDismissRegion>
      </OverlayFocusRegion>
    );

    return (
      <OverlayPortal kind={current.mode === "modal" ? "modal" : "non-modal"}>
        <OverlayBranchProvider branchId={current.branchId} layer={current.layer}>
          {current.anchored ? (
            <OverlayPositioned
              asChild
              side={current.side}
              align={current.align}
              sideOffset={current.offset}
              collisionPadding={current.collisionPadding}
              onPlaced={current.markPlaced}
            >
              {surface}
            </OverlayPositioned>
          ) : (
            surface
          )}
        </OverlayBranchProvider>
      </OverlayPortal>
    );
  };
}

/**
 * 위의 primitive 전부를 하나로 묶어 Menu·Dialog가 **정책만 주입**하게 한다.
 *
 * 순서 계약(§3.1)이 여기 한 곳에 있다. 컴포넌트가 순서를 다시 쓰지 못하게 하는 것이
 * DS-D-0003의 "순서와 정책은 Klipse가 소유한다"의 실제 구현이다.
 */

export interface UseOverlayOptions {
  readonly open: boolean;
  readonly mode: OverlayMode;
  readonly layer: OverlayLayer;
  readonly onOpenChange: (open: boolean, reason: OverlayDismissReason) => void;
  /** 기본 true. Dialog dismissible=false가 이것을 끈다. */
  readonly closeOnEscape?: boolean;
  /** busy 등으로 닫기를 잠근다. 닫지 않고 안내만 하며 아래 layer로 넘기지도 않는다. */
  readonly dismissLocked?: boolean;
  readonly initialFocus?: OverlayInitialFocus;
  readonly returnFocus?: RefObject<HTMLElement | null>;
  readonly triggerRef?: RefObject<HTMLElement | null>;
  /** 기본 false. 바깥 클릭이 배경 액션을 실행하지 않는다. */
  readonly outsidePointerPassthrough?: boolean;
  /** dismiss가 막혔을 때의 통지. Dialog가 안내 문구를 띄우는 지점이다. */
  readonly onDismissBlocked?: (reason: OverlayDismissReason) => void;
  /**
   * true면 위치 확정을 호출부가 알린다(`markPlaced`). positioning을 쓰는 경우다.
   * 기본값은 false이고, 마운트 직후 같은 layout pass에서 `open`으로 넘어간다.
   */
  readonly deferPlacement?: boolean;
  /**
   * anchor 기준으로 배치한다. 호출부가 `OverlayPositioner`로 Trigger와 Surface를 함께 감싸고
   * `OverlayAnchor`로 anchor를 지정해야 한다.
   */
  readonly anchored?: boolean;
  readonly side?: OverlaySide;
  readonly align?: OverlayAlign;
}

export interface OverlaySurfaceProps extends HTMLAttributes<HTMLDivElement> {
  readonly children?: ReactNode;
  /**
   * 패널 root 노드를 받는다. primitive가 자기 ref를 덮어쓰지 않고 **둘 다** 호출한다.
   * 이것이 없으면 recipe가 패널 노드를 잡을 방법이 id로 다시 질의하는 것뿐인데,
   * 그 질의는 상태 전이마다 다시 해야 하고 실패해도 조용하다.
   */
  readonly ref?: Ref<HTMLDivElement>;
}

export type OverlaySurfaceComponent = (props: OverlaySurfaceProps) => JSX.Element | null;

export interface UseOverlayResult {
  readonly branchId: string;
  readonly state: OverlayPresenceState;
  readonly mounted: boolean;
  readonly ids: OverlayIds;
  readonly requestClose: (reason: OverlayDismissReason) => void;
  readonly markPlaced: () => void;
  /**
   * item activation 전용. run()이 먼저, 그다음 select close. 둘 다 정확히 한 번.
   * closing 중에는 아무것도 실행되지 않는다.
   */
  readonly activate: (
    event: Pick<MouseEvent, "preventDefault">,
    run: () => void,
    closeOnSelect: boolean,
  ) => void;
  /** 3rd-party portal(앱이 만든 Listbox 등)을 이 branch의 내부로 등록한다. */
  readonly registerMember: (node: Element | null) => void;
  /** portal · focus · dismiss · root 속성을 순서대로 감싼 표면. */
  readonly Surface: OverlaySurfaceComponent;
}

export function useOverlay(options: UseOverlayOptions): UseOverlayResult {
  const {
    open,
    mode,
    layer,
    onOpenChange,
    closeOnEscape = true,
    dismissLocked = false,
    initialFocus = { kind: "first" },
    returnFocus,
    triggerRef,
    outsidePointerPassthrough = false,
    onDismissBlocked,
    deferPlacement = false,
    anchored = false,
    side = "bottom",
    align = "start",
  } = options;

  const context = useOverlayContext();
  const parentBranch = useParentBranch();
  const parentBranchId = parentBranch?.branchId ?? null;
  const instanceId = useId();
  const branchId = `kds-branch-${instanceId}`;
  const ids = useOverlayIds();

  // 자손 branch는 부모보다 위여야 한다. 그 규칙을 비교자에만 두면 z-index에서 뒤집혀
  // "보이지만 누를 수 없는" popover가 된다 — 규범이 차단급으로 지정한 실패와 같은 증상이다.
  const effectiveLayer: OverlayLayer =
    parentBranch !== null && LAYER_RANK[parentBranch.layer] > LAYER_RANK[layer]
      ? parentBranch.layer
      : layer;

  const rootRef = useRef<HTMLElement | null>(null);
  const guard = useMemo(() => createActivationGuard(), []);
  const openSeqRef = useRef(0);
  const recordRef = useRef<LayerRecord | null>(null);
  const getRecord = useCallback((): LayerRecord | null => recordRef.current, []);
  const unregisterRef = useRef<(() => void) | null>(null);
  const members = useRef(new Set<Element>());
  /**
   * modal 격리 해제. **focus를 돌려주기 전에** 호출해야 한다.
   *
   * inert 요소는 `focus()`를 조용히 무시한다. 배경이 inert인 상태에서 복원을 시도하면 아무 일도
   * 일어나지 않고 focus가 body로 떨어진다 — non-modal에서는 격리가 없어 드러나지 않는 경로다.
   * scroll lock은 여기서 풀지 않는다. exit 동안 배경이 스크롤되면 화면이 튄다.
   */
  const releaseIsolationRef = useRef<(() => void) | null>(null);

  const optionsRef = useRef({
    initialFocus,
    returnFocus,
    triggerRef,
    onDismissBlocked,
    mode,
  });
  optionsRef.current = { initialFocus, returnFocus, triggerRef, onDismissBlocked, mode };

  // presence가 closing에 진입할 때 같은 tick에 도는 것들.
  const onClosingSync = useCallback((): void => {
    // 1) 이후 activation을 전부 봉인한다.
    guard.seal();
    // 2) Escape·outside 소유권을 즉시 반납한다. 다음 layer가 바로 최상위가 된다.
    unregisterRef.current?.();
    unregisterRef.current = null;
    recordRef.current = null;
  }, [guard]);

  const onBeforeUnmount = useCallback(
    (reason: OverlayDismissReason): void => {
      const root = rootRef.current;
      const current = optionsRef.current;
      // ① 배경 격리를 먼저 푼다. inert 요소는 `focus()`를 조용히 무시하므로, 이걸 뒤로 미루면
      //    복원이 아무 일도 하지 않고 focus가 body로 떨어진다.
      releaseIsolationRef.current?.();
      releaseIsolationRef.current = null;

      // ② 닫히는 subtree를 inert로 만든다. **focus를 옮기기 전이어야 한다.**
      //    focus trap의 해제는 하부 유틸의 passive effect에서 일어나는데 이 코드는 layout
      //    effect다 — 여기서는 trap 리스너가 아직 살아 있다. 그 상태로 밖으로 focus를 옮기면
      //    trap이 곧바로 패널 안 마지막 요소로 되끌어오고, 그 요소는 잠시 뒤 unmount되어
      //    focus가 body로 떨어진다. 먼저 inert로 만들면 되끌기 대상이 사라져 무력화된다.
      //    부수 효과로 남은 focusable child가 Tab 순서에서 즉시 빠진다.
      if (root !== null) context.inert.markSubtree(root);

      // ③ root가 아직 DOM에 있는 동안 동기로 옮긴다.
      //    부모 branch의 패널은 DOM에서 찾는다 — branchId가 root에 속성으로 붙어 있다.
      const parentPanel =
        parentBranchId === null
          ? null
          : document.querySelector<HTMLElement>(
              `[data-kds-overlay-branch="${parentBranchId}"]`,
            );
      const target = resolveReturnFocus(
        reason,
        current.returnFocus,
        current.triggerRef,
        parentPanel,
        context.hostContainer,
      );
      if (target !== null) target.focus();
    },
    [context, parentBranchId],
  );

  const onOpening = useCallback((): void => {
    // openSeq는 effect가 아니라 상태 전이 시점에 채번한다. effect 순서(자식 → 부모)에
    // 의존하면 같은 commit 중첩 마운트에서 순서가 뒤집힌다.
    openSeqRef.current = context.store.nextOpenSeq();
    guard.unseal();
  }, [context.store, guard]);

  const presence = useOverlayPresence({
    open,
    nodeRef: rootRef,
    onOpenChange,
    onClosingSync,
    onBeforeUnmount,
    onOpening,
  });

  const { state, mounted, requestClose, markPlaced } = presence;

  // branch는 layout effect에서 연다. focusin 판정은 즉시 들어올 수 있으므로 paint 전이어야 한다.
  useLayoutEffect(() => {
    if (!mounted) return undefined;
    const branches = context.store.branches;
    const closeBranch = branches.open(branchId, parentBranchId);
    // ref callback과 소비자의 registerMember는 이 effect보다 **먼저** 실행될 수 있다.
    // ref는 layout effect 이전에 붙고, 소비자 effect는 자식이 먼저 돌기 때문이다.
    // 그때 모아둔 것을 여기서 흘려보내지 않으면 root panel 자신이 member로 등록되지 않고,
    // 그 상태는 하부 유틸의 React 트리 판정에 가려 조용히 통과한다.
    const releases = [...members.current].map((node) => branches.addMember(branchId, node));
    return () => {
      for (const release of releases) release();
      closeBranch();
    };
  }, [mounted, branchId, parentBranchId, context.store]);

  // layer stack 등록. record는 정책 값이 바뀌면 다시 만든다.
  useLayoutEffect(() => {
    if (!mounted) return undefined;
    const record: LayerRecord = {
      id: branchId,
      branchId,
      layer,
      mode,
      openSeq: openSeqRef.current,
      closeOnEscape,
      dismissLocked,
      requestClose,
      onDismissBlocked: (reason) => {
        optionsRef.current.onDismissBlocked?.(reason);
      },
    };
    recordRef.current = record;
    const release = context.store.register(record);
    unregisterRef.current = release;
    return () => {
      release();
      unregisterRef.current = null;
      recordRef.current = null;
    };
  }, [
    mounted,
    branchId,
    layer,
    mode,
    closeOnEscape,
    dismissLocked,
    requestClose,
    context.store,
  ]);

  // modal 격리와 scroll lock. 순서 계약 ④ — 위치 확정보다 먼저다.
  useLayoutEffect(() => {
    if (!mounted || mode !== "modal") return undefined;
    const container = context.hostContainer;
    const modalHost = context.hosts.modal;
    if (container === null || modalHost === null) return undefined;

    // non-modal host를 면제한다. Dialog 안에서 연 Popover가 거기 있으므로,
    // 면제하지 않으면 "열리지만 선택되지 않음"이 그대로 재현된다.
    const keep: Element[] = [modalHost];
    const nonModalHost = context.hosts["non-modal"];
    if (nonModalHost !== null) keep.push(nonModalHost);
    const releaseOutside = context.inert.isolate(container, keep);

    // modal host **안**의 형제도 격리한다. 중첩 Dialog는 같은 host에 나란히 들어가므로
    // host 단위 격리만으로는 아래 Dialog가 살아 있게 된다 — topmost 하나만 조작 가능해야 한다.
    // 이미 inert인 것은 건드리지 않으므로, 각 modal은 자기가 열릴 때 존재하던 것만 되돌린다.
    const ownRoot = Array.from(modalHost.children).find((child) =>
      rootRef.current === null ? false : child.contains(rootRef.current),
    );
    const releaseSiblings =
      ownRoot === undefined
        ? () => {}
        : context.inert.isolate(modalHost, [ownRoot]);

    const releaseScroll = context.scrollLock.acquire(container);
    // closing 진입 시 focus 복원보다 먼저 풀 수 있도록 통로를 남긴다. 두 번 불려도 안전하다.
    const releaseIsolation = (): void => {
      releaseSiblings();
      releaseOutside();
    };
    releaseIsolationRef.current = releaseIsolation;
    return () => {
      releaseIsolation();
      releaseIsolationRef.current = null;
      releaseScroll();
    };
  }, [mounted, mode, context]);

  // 위치 확정. anchored면 배치 콜백이 알리고, 아니면 같은 layout pass에서 open으로 넘어간다.
  // 그때까지 panel은 base.css에 의해 보이지도 hit-test되지도 않는다 —
  // 임시 위치를 한 프레임도 노출하지 않는 것이 계약이다.
  useLayoutEffect(() => {
    if (!mounted || deferPlacement || anchored) return;
    markPlaced();
  }, [mounted, deferPlacement, anchored, markPlaced]);

  // 초기 focus. 순서 계약 ⑥ — 위치가 확정된 뒤다.
  const focusedRef = useRef(false);
  useEffect(() => {
    if (state !== "open") {
      if (state === "closed") focusedRef.current = false;
      return;
    }
    if (focusedRef.current) return;
    const root = rootRef.current;
    if (root === null) return;
    // 이미 이 branch(또는 자손 branch) 안에 focus가 있으면 옮기지 않는다.
    // 부모와 자식이 같은 commit에 열리면 자식 effect가 먼저 돌아 자식 안으로 focus가 들어가는데,
    // 뒤이어 부모가 초기 focus를 적용하면 focus를 **자식에게서 빼앗는다**. 그 이동은 자식의
    // focus-outside 판정을 발화시켜 자식이 스스로 닫힌다 — 사용자가 아무것도 하지 않았는데.
    // 판정 기준은 **패널**이지 branch member 전체가 아니다. Trigger도 member이므로
    // member로 판정하면 pointer로 연 직후(focus가 Trigger에 있음) 초기 focus가 통째로 사라진다.
    const active = document.activeElement;
    const activeBranch =
      active instanceof Element
        ? (active.closest("[data-kds-overlay-branch]")?.getAttribute(
            "data-kds-overlay-branch",
          ) ?? null)
        : null;
    const insideOwnPanel = active !== null && root.contains(active);
    const insideDescendantPanel =
      activeBranch !== null &&
      activeBranch !== branchId &&
      context.store.branches.isDescendant(activeBranch, branchId);
    if (insideOwnPanel || insideDescendantPanel) {
      focusedRef.current = true;
      return;
    }
    focusedRef.current = true;
    const target = resolveInitialFocus(root, optionsRef.current.initialFocus);
    target?.focus();
  }, [state, branchId, context.store]);

  const registerMember = useCallback(
    (node: Element | null): void => {
      if (node === null) return;
      members.current.add(node);
      // 이미 열려 있으면 즉시 등록한다. 아직이면 branch open effect가 흘려보낸다.
      if (context.store.branches.has(branchId)) {
        context.store.branches.addMember(branchId, node);
      }
    },
    [branchId, context.store],
  );

  const rootRefCallback = useCallback(
    (node: HTMLElement | null): void => {
      rootRef.current = node;
      registerMember(node);
    },
    [registerMember],
  );

  const activate = useCallback(
    (
      event: Pick<MouseEvent, "preventDefault">,
      run: () => void,
      closeOnSelect: boolean,
    ): void => {
      guard.activate(event, run, closeOnSelect, () => {
        requestClose("select");
      });
    },
    [guard, requestClose],
  );

  // 매 렌더에서 최신 값을 채운다. Surface는 이 컴포넌트의 자식으로만 렌더되므로,
  // 부모 렌더 → 여기 대입 → 자식 렌더 순서가 보장된다.
  const surfaceInstance = useRef<OverlaySurfaceInstance>({
    mounted,
    state,
    layer: effectiveLayer,
    mode,
    branchId,
    panelId: ids.panel,
    store: context.store,
    getRecord,
    requestClose,
    outsidePointerPassthrough,
    rootRef: rootRefCallback,
    anchored,
    side,
    align,
    offset: context.metrics.offset,
    collisionPadding: context.metrics.collisionPadding,
    markPlaced,
  });
  surfaceInstance.current = {
    mounted,
    state,
    layer: effectiveLayer,
    mode,
    branchId,
    panelId: ids.panel,
    store: context.store,
    getRecord,
    requestClose,
    outsidePointerPassthrough,
    rootRef: rootRefCallback,
    anchored,
    side,
    align,
    offset: context.metrics.offset,
    collisionPadding: context.metrics.collisionPadding,
    markPlaced,
  };

  const surfaceRef = useRef<OverlaySurfaceComponent | null>(null);
  surfaceRef.current ??= createOverlaySurface(surfaceInstance);
  const Surface = surfaceRef.current;

  return {
    branchId,
    state,
    mounted,
    ids,
    requestClose,
    markPlaced,
    activate,
    registerMember,
    Surface,
  };
}
