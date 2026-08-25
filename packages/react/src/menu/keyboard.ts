import type { RefObject } from "react";
import {
  activeItem,
  isNavigable,
  menuItems,
  pageStep,
} from "./roving.js";
import { isTypeaheadKey, type MenuTypeahead } from "./typeahead.js";

/**
 * panel의 keydown 알고리즘.
 *
 * `Escape`는 여기 오지 않는다 — store가 document capture에서 처리하고 전파를 멈춘다.
 * `Tab`도 여기서 다루지 않는다 — 바깥 focus 판정이 primitive의 소유다.
 */

export interface MenuKeyContext {
  readonly typeahead: MenuTypeahead;
  readonly lastIndexRef: RefObject<number>;
  /** submenu 배치를 기다리는 동안의 subtrigger id. 그 창의 세로 이동을 삼킨다. */
  readonly pendingEntryRef: RefObject<string | null>;
  readonly isSubmenu: boolean;
  readonly openSubmenu: (subtriggerId: string) => void;
  readonly requestClose: (reason: "trigger") => void;
}

export function handleMenuKeyDown(
  event: KeyboardEvent,
  panel: HTMLElement,
  context: MenuKeyContext,
): void {
  if (event.defaultPrevented) return;
  if (event.isComposing || event.keyCode === 229) return;
  // Shift는 통과시킨다 — 대문자 typeahead가 있다.
  if (event.ctrlKey || event.metaKey || event.altKey) return;

  const list = menuItems(panel).filter(isNavigable);
  const active = activeItem(panel);
  const index = active === null ? -1 : list.indexOf(active);
  const onSurface = index === -1;
  if (!onSurface) context.lastIndexRef.current = index;

  // submenu는 anchored라 배치가 끝나야 열린다. 그 창의 ArrowDown이 방금 연 submenu를 닫는다.
  if (
    context.pendingEntryRef.current !== null &&
    (event.key === "ArrowDown" || event.key === "ArrowUp")
  ) {
    event.preventDefault();
    return;
  }

  const empty = list.length === 0;
  const move = (next: number): void => {
    event.preventDefault();
    list[((next % list.length) + list.length) % list.length]?.focus();
  };
  const clamp = (next: number): void => {
    event.preventDefault();
    list[Math.min(Math.max(next, 0), list.length - 1)]?.focus();
  };

  switch (event.key) {
    case "ArrowDown":
      // 이동할 곳이 없으면 브라우저 스크롤을 빼앗지 않는다.
      if (!empty) move(onSurface ? 0 : index + 1);
      return;
    case "ArrowUp":
      if (!empty) move(onSurface ? list.length - 1 : index - 1);
      return;
    case "Home":
      if (!empty) move(0);
      return;
    case "End":
      if (!empty) move(list.length - 1);
      return;
    case "PageDown":
      if (!empty) clamp((onSurface ? -1 : index) + pageStep(panel, list));
      return;
    case "PageUp":
      if (!empty) clamp(onSurface ? 0 : index - pageStep(panel, list));
      return;

    case "ArrowRight": {
      if (active === null || !active.hasAttribute("data-louis-menu-subtrigger")) return;
      if (active.getAttribute("aria-disabled") === "true") return;
      event.preventDefault();
      context.pendingEntryRef.current = active.id;
      context.openSubmenu(active.id);
      return;
    }
    case "ArrowLeft": {
      if (!context.isSubmenu) return;
      event.preventDefault();
      // 사용자 조작만 trigger다. 부모가 닫혀 연쇄로 닫히는 경우는 reason이 다르다.
      context.requestClose("trigger");
      return;
    }
    case "Tab":
      return;

    case " ": {
      // " ".length === 1이라 default로 보내면 typeahead가 삼킨다. 그리고 keydown에서
      // preventDefault()하면 <button>의 합성 click이 취소돼 활성화가 통째로 사라진다.
      if (context.typeahead.isEmpty()) return;
      // 버퍼가 살아 있으면 Space는 질의의 일부다.
      event.preventDefault();
      context.typeahead.push(" ", list, index)?.focus();
      return;
    }

    default: {
      if (!isTypeaheadKey(event)) return;
      const target = context.typeahead.push(event.key, list, index);
      if (target === null) return;
      event.preventDefault();
      target.focus();
    }
  }
}
