import { activeItem, isNavigable, menuItems, pageStep, } from "./roving.js";
import { isTypeaheadKey } from "./typeahead.js";
export function handleMenuKeyDown(event, panel, context) {
    if (event.defaultPrevented)
        return;
    if (event.isComposing || event.keyCode === 229)
        return;
    // Shift는 통과시킨다 — 대문자 typeahead가 있다.
    if (event.ctrlKey || event.metaKey || event.altKey)
        return;
    const list = menuItems(panel).filter(isNavigable);
    const active = activeItem(panel);
    const index = active === null ? -1 : list.indexOf(active);
    const onSurface = index === -1;
    if (!onSurface)
        context.lastIndexRef.current = index;
    // submenu는 anchored라 배치가 끝나야 열린다. 그 창의 ArrowDown이 방금 연 submenu를 닫는다.
    if (context.pendingEntryRef.current !== null &&
        (event.key === "ArrowDown" || event.key === "ArrowUp")) {
        event.preventDefault();
        return;
    }
    const empty = list.length === 0;
    const move = (next) => {
        event.preventDefault();
        list[((next % list.length) + list.length) % list.length]?.focus();
    };
    const clamp = (next) => {
        event.preventDefault();
        list[Math.min(Math.max(next, 0), list.length - 1)]?.focus();
    };
    switch (event.key) {
        case "ArrowDown":
            // 이동할 곳이 없으면 브라우저 스크롤을 빼앗지 않는다.
            if (!empty)
                move(onSurface ? 0 : index + 1);
            return;
        case "ArrowUp":
            if (!empty)
                move(onSurface ? list.length - 1 : index - 1);
            return;
        case "Home":
            if (!empty)
                move(0);
            return;
        case "End":
            if (!empty)
                move(list.length - 1);
            return;
        case "PageDown":
            if (!empty)
                clamp((onSurface ? -1 : index) + pageStep(panel, list));
            return;
        case "PageUp":
            if (!empty)
                clamp(onSurface ? 0 : index - pageStep(panel, list));
            return;
        case "ArrowRight": {
            if (active === null || !active.hasAttribute("data-louis-menu-subtrigger"))
                return;
            if (active.getAttribute("aria-disabled") === "true")
                return;
            event.preventDefault();
            context.pendingEntryRef.current = active.id;
            context.openSubmenu(active.id);
            return;
        }
        case "ArrowLeft": {
            if (!context.isSubmenu)
                return;
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
            if (context.typeahead.isEmpty())
                return;
            // 버퍼가 살아 있으면 Space는 질의의 일부다.
            event.preventDefault();
            context.typeahead.push(" ", list, index)?.focus();
            return;
        }
        default: {
            if (!isTypeaheadKey(event))
                return;
            const target = context.typeahead.push(event.key, list, index);
            if (target === null)
                return;
            event.preventDefault();
            target.focus();
        }
    }
}
//# sourceMappingURL=keyboard.js.map