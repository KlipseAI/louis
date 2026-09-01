import type { RefObject } from "react";
export declare function menuItems(panel: HTMLElement): HTMLElement[];
/**
 * `skip` 전략은 탐색에서 뺀다.
 *
 * `data-louis-menu-skip`을 함께 보는 이유는 `<a>`에 네이티브 `disabled`가 없기 때문이다.
 * 속성 하나만 보면 링크 item의 `skip`이 조용히 무력화된다.
 */
export declare function isNavigable(element: HTMLElement): boolean;
/** `announce` 전략은 탐색에 남고 활성화와 초기 focus에서만 빠진다. */
export declare function isEnabled(element: HTMLElement): boolean;
/**
 * typeahead가 비교할 라벨. `textContent`를 쓰지 않는 이유는 아이콘 글리프와 단축키가 섞이기
 * 때문이다 — 접근 가능한 이름과 같은 출처에서 읽는다.
 */
export declare function itemLabel(element: HTMLElement): string;
/**
 * 활성 item. `list.indexOf(document.activeElement)`를 쓰지 않는 이유는 item 안에 focusable
 * 자손이 생기는 순간 `-1`이 되어 방향키가 매번 첫 항목으로 튀기 때문이다.
 */
export declare function activeItem(panel: HTMLElement): HTMLElement | null;
/**
 * Arrow는 순환하고 Page는 클램프한다 — 네이티브 `<select>`의 비대칭을 따른다.
 *
 * Page를 미처리로 두면 브라우저가 scrollport만 굴려 focus와 스크롤이 갈린다. 비모달이라
 * scroll lock도 없어서 그 어긋남이 그대로 보인다.
 */
export declare function pageStep(panel: HTMLElement, list: readonly HTMLElement[]): number;
/**
 * focus 복구.
 *
 * 요소가 제거될 때 브라우저는 focus를 body로 옮기면서 `focus`/`focusin`을 발생시키지 않는다.
 * 바깥 판정은 document `focusin`에 걸려 있으므로 아무 일도 일어나지 않는다 — 메뉴는 열린 채,
 * focus는 body에, 방향키는 아무 데도 가지 않는다. 그 상태를 여기서 회수한다.
 */
export declare function recoverFocus(panel: HTMLElement, lastIndexRef: RefObject<number>, promotedRef: RefObject<boolean>): void;
/** §Focus의 초기 focus 대상. 후보가 없으면 패널 자신으로 강등한다. */
export declare function resolveMenuInitialFocus(panel: HTMLElement, intent: "first" | "last"): HTMLElement | null;
/**
 * roving `tabIndex` 동기화. panel 안의 Tab stop을 하나로 유지한다.
 *
 * `data-highlighted`를 함께 붙이는 이유: pointer로 열고 방향키로 이동하는 경로에서
 * `:focus-visible`은 브라우저 heuristic에 따라 켜지지 않을 수 있어 표시가 비는 프레임이 생긴다.
 * 시각 하이라이트는 우리가 소유하고, focus ring은 브라우저가 그린다.
 */
export declare function syncRoving(panel: HTMLElement): void;
//# sourceMappingURL=roving.d.ts.map