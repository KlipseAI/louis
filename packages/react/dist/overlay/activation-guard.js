/**
 * item activation — "정확히 한 번"의 구현.
 *
 * design/components/menu-popover.md는 "item click이 outside-dismiss보다 먼저 정확히 한 번
 * 실행되고, 열리지만 선택되지 않는 상태를 만들지 않는다"를 금지 계약으로 지정한다.
 * 실패는 양방향으로 일어난다.
 *
 * - 0회: 바깥 판정이 pointerdown에서 먼저 닫아 후속 click이 사라진다
 * - 2회: 같은 click이 item 핸들러와 panel 핸들러를 모두 탄다
 *
 * 그래서 seal(중복 차단)과 WeakSet(같은 이벤트 재진입 차단)이 둘 다 필요하다.
 * keydown 경로를 따로 만들지 않는 것도 같은 이유다 — 브라우저가 Enter/Space에서 click을
 * 합성하므로 keydown을 더하면 2회가 된다. Button이 keydown을 쓰지 않는 것과 같은 근거다.
 */
export function createActivationGuard() {
    const handled = new WeakSet();
    let sealed = false;
    return {
        seal() {
            sealed = true;
        },
        unseal() {
            sealed = false;
        },
        isSealed() {
            return sealed;
        },
        activate(event, run, closeOnSelect, close) {
            // 같은 click이 item과 panel 두 핸들러를 타도 한 번만 통과한다.
            if (handled.has(event))
                return false;
            handled.add(event);
            if (sealed) {
                event.preventDefault();
                return false;
            }
            run();
            if (closeOnSelect)
                close();
            return true;
        },
    };
}
//# sourceMappingURL=activation-guard.js.map