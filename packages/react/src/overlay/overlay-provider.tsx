"use client";

import {
  createContext,
  useContext,
  useLayoutEffect,
  useMemo,
  useState,
  type JSX,
  type ReactNode,
} from "react";
import { createInertController, type InertController } from "./inert-controller.js";
import { createOverlayStore, type OverlayStore } from "./overlay-store.js";
import {
  DEFAULT_OVERLAY_METRICS,
  measureOverlayMetrics,
  type OverlayMetrics,
} from "./positioner.js";
import { createScrollLock, type ScrollLock } from "./scroll-lock.js";
import type { OverlayHostKind, OverlayLayer } from "./types.js";

/**
 * portal host와 scroll owner를 **앱이 한 번** 해석한다.
 *
 * dialog.md는 임의 div로의 portal을 금지하고 Dialog에 `portalContainer` prop을 두지 않는다.
 * menu-popover.md의 `portalHost`도 명시적 host id만 받는다. 즉 규범은 컴포넌트가 host를
 * 고르는 것을 막는다 — 그러면 그 컴포넌트가 어디에 있느냐에 따라 stacking과 inert 경계가
 * 달라지기 때문이다. 이 Provider가 그 선택지를 아예 없앤다.
 */

export interface OverlayContextValue {
  readonly store: OverlayStore;
  readonly scrollLock: ScrollLock;
  readonly inert: InertController;
  readonly hosts: Readonly<Record<OverlayHostKind, HTMLElement | null>>;
  readonly hostContainer: HTMLElement | null;
  readonly scrollOwner: HTMLElement | null;
  /** CSS에서 1회 측정한 배치 상수. panel이 존재하기 전에 필요하므로 여기서 소유한다. */
  readonly metrics: OverlayMetrics;
}

const OverlayContext = createContext<OverlayContextValue | null>(null);

/**
 * 현재 열려 있는 부모 overlay. 없으면 null. lineage의 유일한 출처다.
 *
 * `layer`를 함께 나르는 이유: 자손 branch는 항상 부모보다 위여야 하는데(F12/W-7),
 * 그것을 z-index로도 표현하려면 부모의 layer를 알아야 한다. Dialog 안에서 연 Popover가
 * `popover`(200) 그대로면 Dialog(300) 뒤에 깔려 **보이지만 누를 수 없는** 상태가 된다.
 */
export interface OverlayBranchInfo {
  readonly branchId: string;
  readonly layer: OverlayLayer;
}

const OverlayBranchContext = createContext<OverlayBranchInfo | null>(null);

export interface OverlayProviderProps {
  readonly children: ReactNode;
  /**
   * host와 scroll owner를 담을 요소. 기본값은 `document.body`다.
   * 테스트가 격리된 컨테이너를 쓰기 위해 열어 둔다.
   */
  readonly container?: HTMLElement | null;
}

function createHost(kind: OverlayHostKind): HTMLElement {
  const host = document.createElement("div");
  host.setAttribute("data-kds-overlay-root", kind);
  return host;
}

export function OverlayProvider({
  children,
  container,
}: OverlayProviderProps): JSX.Element {
  // 서버에서는 만들지 않는다. hosts가 null이면 portal은 아무것도 렌더하지 않는다.
  const [hosts] = useState<Readonly<Record<OverlayHostKind, HTMLElement | null>>>(() =>
    typeof document === "undefined"
      ? { modal: null, "non-modal": null }
      : { modal: createHost("modal"), "non-modal": createHost("non-modal") },
  );
  const [mountedIn, setMountedIn] = useState<HTMLElement | null>(null);
  const [metrics, setMetrics] = useState<OverlayMetrics>(DEFAULT_OVERLAY_METRICS);

  // 서버에서도 **값을 만든다.** 예전에는 여기서 null을 반환했고 그것이 context 값으로 흘러
  // `useOverlayContext`가 "Provider 밖"으로 오판해 throw했다 — Next.js App Router에서 닫힌
  // Dialog를 페이지에 놓아두기만 해도 프리렌더가 죽었다. 위 77행 주석이 적어 둔 원래 의도는
  // "hosts가 null이면 portal이 아무것도 렌더하지 않는다"였고, 그것으로 충분하다.
  //
  // Escape 리스너만 host가 필요하므로 서버에서는 아무것도 하지 않는 host를 준다. scrollLock과
  // inert는 만들 때 DOM을 건드리지 않고, 그 메서드는 effect 안에서만 불리므로 서버에서 실행되지
  // 않는다.
  const services = useMemo(() => {
    const escapeHost =
      typeof document === "undefined"
        ? { addEventListener: () => {}, removeEventListener: () => {} }
        : document;
    return {
      store: createOverlayStore(escapeHost),
      scrollLock: createScrollLock(),
      inert: createInertController(),
    };
  }, []);

  useLayoutEffect(() => {
    const parent = container ?? document.body;
    // modal host가 먼저다. z-index가 같을 때는 DOM 순서가 결정하므로, 뒤에 오는 non-modal
    // host가 이긴다 — Dialog 안에서 연 Popover가 부모 layer를 물려받았을 때 Dialog 위에
    // 오게 하는 것이 목적이다. 독립 popover는 layer 값 자체가 낮아 여전히 modal 아래다.
    const nonModal = hosts["non-modal"];
    const modal = hosts.modal;
    if (modal !== null) parent.append(modal);
    if (nonModal !== null) parent.append(nonModal);
    setMountedIn(parent);
    if (nonModal !== null) setMetrics(measureOverlayMetrics(nonModal));
    return () => {
      nonModal?.remove();
      modal?.remove();
      setMountedIn(null);
    };
  }, [container, hosts]);

  const value = useMemo<OverlayContextValue>(() => {
    return {
      store: services.store,
      scrollLock: services.scrollLock,
      inert: services.inert,
      hosts,
      hostContainer: mountedIn,
      scrollOwner: mountedIn,
      metrics,
    };
  }, [services, hosts, mountedIn, metrics]);

  return (
    <OverlayContext.Provider value={value}>
      <OverlayBranchContext.Provider value={null}>{children}</OverlayBranchContext.Provider>
    </OverlayContext.Provider>
  );
}

export function useOverlayContext(): OverlayContextValue {
  const value = useContext(OverlayContext);
  if (value === null) {
    throw new Error(
      "overlay: OverlayProvider 안에서만 사용할 수 있습니다. host를 컴포넌트가 고르지 않는 것이 계약입니다.",
    );
  }
  return value;
}

export function useParentBranch(): OverlayBranchInfo | null {
  return useContext(OverlayBranchContext);
}

export interface OverlayBranchProviderProps {
  readonly branchId: string;
  readonly layer: OverlayLayer;
  readonly children: ReactNode;
}

/**
 * 자기 subtree에게 "너희 부모 branch는 나"라고 알린다. portal을 건너도 React context는
 * 따라가므로, DOM 조상 관계가 끊겨도 lineage는 유지된다 — 이것이 branch registry가
 * `contains()` 단독 판정보다 정확한 이유다.
 */
export function OverlayBranchProvider({
  branchId,
  layer,
  children,
}: OverlayBranchProviderProps): JSX.Element {
  const value = useMemo<OverlayBranchInfo>(() => ({ branchId, layer }), [branchId, layer]);
  return <OverlayBranchContext.Provider value={value}>{children}</OverlayBranchContext.Provider>;
}
