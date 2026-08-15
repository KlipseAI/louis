import type { RefObject } from "react";

/**
 * roving 모델 — item 집합 계산과 focus 복구.
 *
 * **목록을 캐시하지 않는다.** 매 keydown·focusin마다 DOM에서 다시 센다. 캐시하면 조건부 렌더,
 * 비동기 도착, 순서 변경이 전부 무효화 시점을 요구하는데 그 시점을 하나라도 놓치면 방향키가
 * 사라진 항목을 가리킨다. DOM이 이미 정답을 들고 있으므로 그것을 읽는다.
 */

const ITEM_SELECTOR = "[data-kds-menu-item]";

/**
 * `role="menu"`가 접근성 소유 경계다. group 중첩은 통과한다.
 *
 * submenu panel은 overlay host의 **형제**라 `panel.querySelectorAll`이 애초에 닿지 않는다 —
 * 이 술어는 그래서 주된 필터가 아니라 방어다.
 */
function ownsItem(panel: HTMLElement, element: HTMLElement): boolean {
  return element.closest('[role="menu"]') === panel;
}

/**
 * primitive의 focusable 판정과 최소한 같은 엄격함을 갖는다.
 *
 * 주의: `base.css`가 `[data-kds-state="opening"]`에 `visibility: hidden`을 주므로 **opening
 * 동안 이 함수는 항상 false다.** 그래서 목록은 opening에서 빈 배열이고, `open`에 진입할 때
 * 동기화를 반드시 다시 돌려야 한다.
 */
function isRendered(element: HTMLElement): boolean {
  if (typeof element.checkVisibility === "function") {
    return element.checkVisibility({
      contentVisibilityAuto: true,
      opacityProperty: false,
      visibilityProperty: true,
    });
  }
  return element.offsetParent !== null || element === document.activeElement;
}

export function menuItems(panel: HTMLElement): HTMLElement[] {
  return Array.from(panel.querySelectorAll<HTMLElement>(ITEM_SELECTOR)).filter(
    (element) => ownsItem(panel, element) && isRendered(element),
  );
}

/**
 * `skip` 전략은 탐색에서 뺀다.
 *
 * `data-kds-menu-skip`을 함께 보는 이유는 `<a>`에 네이티브 `disabled`가 없기 때문이다.
 * 속성 하나만 보면 링크 item의 `skip`이 조용히 무력화된다.
 */
export function isNavigable(element: HTMLElement): boolean {
  return (
    !element.hasAttribute("disabled") && !element.hasAttribute("data-kds-menu-skip")
  );
}

/** `announce` 전략은 탐색에 남고 활성화와 초기 focus에서만 빠진다. */
export function isEnabled(element: HTMLElement): boolean {
  return isNavigable(element) && element.getAttribute("aria-disabled") !== "true";
}

/**
 * typeahead가 비교할 라벨. `textContent`를 쓰지 않는 이유는 아이콘 글리프와 단축키가 섞이기
 * 때문이다 — 접근 가능한 이름과 같은 출처에서 읽는다.
 */
export function itemLabel(element: HTMLElement): string {
  const aria = element.getAttribute("aria-label");
  if (aria !== null && aria !== "") return aria.trim();
  const node = element.querySelector<HTMLElement>("[data-kds-menu-item-label]");
  return (node ?? element).textContent?.trim() ?? "";
}

/**
 * 활성 item. `list.indexOf(document.activeElement)`를 쓰지 않는 이유는 item 안에 focusable
 * 자손이 생기는 순간 `-1`이 되어 방향키가 매번 첫 항목으로 튀기 때문이다.
 */
export function activeItem(panel: HTMLElement): HTMLElement | null {
  const active = document.activeElement;
  if (!(active instanceof HTMLElement)) return null;
  const item = active.closest<HTMLElement>(ITEM_SELECTOR);
  return item !== null && ownsItem(panel, item) ? item : null;
}

/**
 * Arrow는 순환하고 Page는 클램프한다 — 네이티브 `<select>`의 비대칭을 따른다.
 *
 * Page를 미처리로 두면 브라우저가 scrollport만 굴려 focus와 스크롤이 갈린다. 비모달이라
 * scroll lock도 없어서 그 어긋남이 그대로 보인다.
 */
export function pageStep(panel: HTMLElement, list: readonly HTMLElement[]): number {
  const rowHeight = list[0]?.getBoundingClientRect().height ?? 0;
  if (rowHeight <= 0) return list.length;
  return Math.max(1, Math.floor(panel.clientHeight / rowHeight) - 1);
}

/**
 * focus 복구.
 *
 * 요소가 제거될 때 브라우저는 focus를 body로 옮기면서 `focus`/`focusin`을 발생시키지 않는다.
 * 바깥 판정은 document `focusin`에 걸려 있으므로 아무 일도 일어나지 않는다 — 메뉴는 열린 채,
 * focus는 body에, 방향키는 아무 데도 가지 않는다. 그 상태를 여기서 회수한다.
 */
export function recoverFocus(
  panel: HTMLElement,
  lastIndexRef: RefObject<number>,
  promotedRef: RefObject<boolean>,
): void {
  const list = menuItems(panel).filter(isNavigable);
  const active = document.activeElement;
  const inside = active !== null && active !== document.body && panel.contains(active);

  if (!inside) {
    if (list.length === 0) {
      panel.focus();
      return;
    }
    // 사라진 항목의 자리를 유지한다. 첫 항목으로 되돌리면 사용자가 있던 위치를 잃는다.
    const index = Math.min(Math.max(lastIndexRef.current, 0), list.length - 1);
    list[index]?.focus();
    return;
  }

  // 비동기로 항목이 도착했을 때의 1회 승격. 사용자가 이미 움직였으면 건드리지 않는다.
  if (promotedRef.current || document.activeElement !== panel) return;
  const first = list.filter(isEnabled)[0];
  if (first === undefined) return;
  promotedRef.current = true;
  first.focus();
}

/** §Focus의 초기 focus 대상. 후보가 없으면 패널 자신으로 강등한다. */
export function resolveMenuInitialFocus(
  panel: HTMLElement,
  intent: "first" | "last",
): HTMLElement | null {
  const enabled = menuItems(panel).filter(isNavigable).filter(isEnabled);
  if (enabled.length === 0) return panel;
  return (intent === "last" ? enabled[enabled.length - 1] : enabled[0]) ?? panel;
}

/**
 * roving `tabIndex` 동기화. panel 안의 Tab stop을 하나로 유지한다.
 *
 * `data-highlighted`를 함께 붙이는 이유: pointer로 열고 방향키로 이동하는 경로에서
 * `:focus-visible`은 브라우저 heuristic에 따라 켜지지 않을 수 있어 표시가 비는 프레임이 생긴다.
 * 시각 하이라이트는 우리가 소유하고, focus ring은 브라우저가 그린다.
 */
export function syncRoving(panel: HTMLElement): void {
  const all = menuItems(panel);
  const navigable = all.filter(isNavigable);
  const active = activeItem(panel);
  const stop = active ?? navigable.filter(isEnabled)[0] ?? navigable[0] ?? null;

  for (const item of all) {
    item.tabIndex = item === stop ? 0 : -1;
    if (item === active) item.setAttribute("data-highlighted", "true");
    else item.removeAttribute("data-highlighted");
  }
}
