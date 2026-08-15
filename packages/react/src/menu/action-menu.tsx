"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  type HTMLAttributes,
  type JSX,
} from "react";
import { AnchoredRoot } from "../anchored/root.js";
import { AnchoredTrigger } from "../anchored/trigger.js";
import { useAnchoredContext } from "../anchored/context.js";
import { resolvePanelLabel } from "../anchored/label.js";
import type {
  AnchoredPanelLabel,
  AnchoredRootProps,
  AnchoredTriggerProps,
  DisabledItemStrategy,
} from "../anchored/types.js";
import { handleMenuKeyDown, type MenuKeyContext } from "./keyboard.js";
import {
  activeItem,
  isNavigable,
  menuItems,
  recoverFocus,
  resolveMenuInitialFocus,
  syncRoving,
} from "./roving.js";
import {
  createSubmenuRegistry,
  SubmenuRegistryProvider,
} from "./submenu-registry.js";
import { createTypeahead } from "./typeahead.js";

/**
 * ActionMenu — `role="menu"` recipe.
 *
 * 소유하는 것은 roving·방향키·typeahead·aria 배선뿐이다. Escape 라우팅, 바깥 판정,
 * activation exactly-once, presence, focus 복원 시점은 primitive가 이미 소유한다.
 */

export type ActionMenuPanelLabel = AnchoredPanelLabel;

export interface ActionMenuProps extends AnchoredRootProps {
  readonly panelLabel: ActionMenuPanelLabel;
  /** menu 단위 단일 전략. item이 개별로 고르지 않는다. */
  readonly disabledItems?: DisabledItemStrategy;
  readonly typeaheadLocale?: string;
}

export function ActionMenu({
  panelLabel,
  disabledItems = "announce",
  typeaheadLocale,
  ...rest
}: ActionMenuProps): JSX.Element {
  // 초기 focus 대상은 열림 의도(ArrowUp이면 마지막)를 읽어 계산한다.
  const intentRef = useRef<"first" | "last">("first");
  const resolveInitialFocus = useCallback(
    (panel: HTMLElement) => resolveMenuInitialFocus(panel, intentRef.current),
    [],
  );

  return (
    <AnchoredRoot
      {...rest}
      kind="action-menu"
      panelLabel={panelLabel}
      disabledItems={disabledItems}
      {...(typeaheadLocale === undefined ? {} : { typeaheadLocale })}
      resolveInitialFocus={resolveInitialFocus}
    >
      <IntentBridge intentRef={intentRef} />
      {rest.children}
    </AnchoredRoot>
  );
}

/** Root가 소유한 openIntent를 ActionMenu의 로컬 ref로 옮긴다. */
function IntentBridge({
  intentRef,
}: {
  readonly intentRef: { current: "first" | "last" };
}): null {
  const { openIntentRef, open } = useAnchoredContext("ActionMenu");
  if (open) intentRef.current = openIntentRef.current;
  return null;
}

export interface ActionMenuTriggerProps extends AnchoredTriggerProps {}

export function ActionMenuTrigger(props: ActionMenuTriggerProps): JSX.Element {
  return <AnchoredTrigger {...props} part="ActionMenuTrigger" />;
}

export interface ActionMenuContentProps
  extends Omit<
    HTMLAttributes<HTMLDivElement>,
    "id" | "role" | "tabIndex" | "aria-label" | "aria-labelledby" | "onKeyDown"
  > {}

interface ActionMenuContentInternalProps extends ActionMenuContentProps {
  /** submenu의 panel이면 ArrowLeft가 자기를 닫는다. 최상위 menu에서는 아무 일도 하지 않는다. */
  readonly isSubmenu?: boolean;
}

export function ActionMenuContent({
  className,
  children,
  isSubmenu = false,
  ...rest
}: ActionMenuContentInternalProps): JSX.Element | null {
  const context = useAnchoredContext("ActionMenuContent");
  const { overlay, panelRef, triggerId, panelLabel, typeaheadLocale } = context;
  const { Surface, state } = overlay;

  const typeahead = useMemo(() => createTypeahead(typeaheadLocale), [typeaheadLocale]);
  const lastIndexRef = useRef(0);
  const pendingEntryRef = useRef<string | null>(null);
  const promotedRef = useRef(false);
  const syncingRef = useRef(false);

  const sync = useCallback((): void => {
    const panel = panelRef.current;
    if (panel === null) return;
    syncingRef.current = true;
    syncRoving(panel);
    syncingRef.current = false;
  }, [panelRef]);

  const registry = useMemo(() => createSubmenuRegistry(pendingEntryRef), []);

  const keyContext = useMemo<MenuKeyContext>(
    () => ({
      typeahead,
      lastIndexRef,
      pendingEntryRef,
      isSubmenu,
      openSubmenu: (id) => registry.open(id),
      requestClose: (reason) => overlay.requestClose(reason),
    }),
    [typeahead, isSubmenu, registry, overlay],
  );

  // native 리스너를 쓴다. React 이벤트는 DOM이 아니라 React 트리로 전파되므로 submenu의
  // 방향키가 부모 핸들러까지 실행해 focus가 부모로 튀고, 그 focusout이 submenu를 닫는다.
  // panel들은 DOM에서 형제이므로 native 리스너에는 그 문제가 존재하지 않는다.
  useEffect(() => {
    const panel = panelRef.current;
    if (panel === null || state === "closed") return undefined;

    const onKeyDown = (event: KeyboardEvent): void => {
      handleMenuKeyDown(event, panel, keyContext);
    };
    const onFocusIn = (): void => sync();
    const onCompositionStart = (): void => typeahead.reset();
    const onCompositionEnd = (event: CompositionEvent): void => {
      if (event.data === "") return;
      const list = menuItems(panel).filter(isNavigable);
      const current = activeItem(panel);
      const from = current === null ? -1 : list.indexOf(current);
      typeahead.push(event.data, list, from)?.focus();
    };

    panel.addEventListener("keydown", onKeyDown);
    panel.addEventListener("focusin", onFocusIn);
    panel.addEventListener("compositionstart", onCompositionStart);
    panel.addEventListener("compositionend", onCompositionEnd);

    const observer = new MutationObserver(() => {
      if (syncingRef.current) return;
      recoverFocus(panel, lastIndexRef, promotedRef);
      sync();
    });
    observer.observe(panel, {
      childList: true,
      subtree: true,
      // style을 넣지 않는다 — positioner의 매 위치 갱신이 observer를 깨운다.
      attributeFilter: ["disabled", "aria-disabled", "hidden", "data-kds-menu-skip"],
    });

    // opening 동안 목록은 visibility:hidden 때문에 비어 있었다. open 진입에서 반드시 다시 돈다.
    sync();

    return () => {
      observer.disconnect();
      panel.removeEventListener("keydown", onKeyDown);
      panel.removeEventListener("focusin", onFocusIn);
      panel.removeEventListener("compositionstart", onCompositionStart);
      panel.removeEventListener("compositionend", onCompositionEnd);
    };
  }, [panelRef, state, sync, keyContext, typeahead]);

  useEffect(() => {
    if (state === "closed") promotedRef.current = false;
  }, [state]);

  if (!overlay.mounted) return null;

  const label = resolvePanelLabel(panelLabel, overlay.ids, triggerId);
  const classes = ["kds-popover", "kds-menu", className].filter(Boolean).join(" ");

  return (
    <Surface
      {...rest}
      {...label}
      ref={panelRef}
      role="menu"
      data-kind="action-menu"
      className={classes}
    >
      <SubmenuRegistryProvider value={registry}>{children}</SubmenuRegistryProvider>
    </Surface>
  );
}
