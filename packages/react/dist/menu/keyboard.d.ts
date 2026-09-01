import type { RefObject } from "react";
import { type MenuTypeahead } from "./typeahead.js";
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
export declare function handleMenuKeyDown(event: KeyboardEvent, panel: HTMLElement, context: MenuKeyContext): void;
//# sourceMappingURL=keyboard.d.ts.map