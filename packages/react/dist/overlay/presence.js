"use client";
import { useCallback, useLayoutEffect, useRef, useState } from "react";
/**
 * Closed / Opening / Open / Closing 상태 기계와 unmount timer.
 *
 * 네 후보 유틸 어디에도 presence가 없다. 그리고 이 계층이 없으면 foundations/motion.md의
 * "exit 완료와 unmount가 같은 source에서 계산된다"를 만족시킬 방법이 없다.
 */
function maxTimeMs(durationList, delayList) {
    const durations = durationList.split(",");
    const delays = delayList.split(",");
    let max = 0;
    for (let index = 0; index < durations.length; index += 1) {
        const duration = parseSeconds(durations[index]);
        const delay = parseSeconds(delays[index % Math.max(delays.length, 1)]);
        max = Math.max(max, duration + delay);
    }
    return max;
}
function parseSeconds(value) {
    if (value === undefined)
        return 0;
    const trimmed = value.trim();
    if (trimmed === "")
        return 0;
    const numeric = Number.parseFloat(trimmed);
    if (Number.isNaN(numeric))
        return 0;
    return trimmed.endsWith("ms") ? numeric : numeric * 1000;
}
/**
 * exit 시간을 **resolved recipe에서 읽는다.** 토큰 이름을 여기 하드코딩하지 않는 것이 핵심이다.
 *
 * 그래야 컴포넌트 CSS의 `@media (prefers-reduced-motion: reduce)`가 timer에 자동으로 반영되고,
 * 시각 transition과 unmount가 서로 어긋날 수 없다. 두 값이 다른 곳에서 오면 어긋나도 테스트가
 * 알 수 없다 — 각각을 확인할 뿐 **일치**를 확인하지 않기 때문이다. (DS-D-0011 결정 3)
 */
export function readExitDuration(node) {
    const style = getComputedStyle(node);
    return Math.max(maxTimeMs(style.transitionDuration, style.transitionDelay), maxTimeMs(style.animationDuration, style.animationDelay));
}
export function useOverlayPresence(options) {
    const { open, nodeRef, onOpenChange, onClosingSync, onBeforeUnmount, onOpening } = options;
    const [state, setState] = useState("closed");
    const stateRef = useRef("closed");
    const reasonRef = useRef("programmatic");
    // 최신 open prop과, 이번 closing이 시작될 때의 값.
    // 둘을 비교해야 "소비자가 exit 도중 마음을 바꿨다"를 판별할 수 있다. 최신 값만 보면
    // Escape·outside처럼 **primitive가 닫는 정상 경로**에서도 open이 계속 true라 구분되지 않는다.
    const openRef = useRef(open);
    openRef.current = open;
    const openAtCloseStart = useRef(open);
    // 콜백은 ref로 읽는다. 소비자가 인라인 함수를 넘겨도 timer와 리스너가 재설치되지 않는다.
    const callbacks = useRef({ onOpenChange, onClosingSync, onBeforeUnmount, onOpening });
    callbacks.current = { onOpenChange, onClosingSync, onBeforeUnmount, onOpening };
    const move = useCallback((next) => {
        stateRef.current = next;
        setState(next);
    }, []);
    const requestClose = useCallback((reason) => {
        const current = stateRef.current;
        // opening → closing은 허용한다(열리는 중 route 변경). closing 중 재요청은 무시한다.
        if (current !== "open" && current !== "opening")
            return;
        reasonRef.current = reason;
        openAtCloseStart.current = openRef.current;
        // React commit을 기다리지 않고 즉시 표시한다. base.css가 이 속성에서 pointer를 놓으므로,
        // 투명해지는 root가 같은 tick에 그 좌표의 아래 control을 가로챌 수 없다.
        nodeRef.current?.setAttribute("data-louis-state", "closing");
        callbacks.current.onClosingSync(reason);
        move("closing");
    }, [move, nodeRef]);
    // open prop 전이. 소비자가 open을 직접 false로 내리면 programmatic close다.
    //
    // deps에 `state`가 있어야 한다. exit는 120ms를 쓰는데 그 창 안에서 `open`이 다시 true가 되면
    // 두 분기가 모두 걸리지 않고(`closing`은 어느 쪽도 아니다), `open`이 변하지 않으므로 effect가
    // 다시 돌지 않는다. 그러면 소비자는 `open === true`인데 패널이 영영 닫힌 채로 남는다.
    // `state`를 넣으면 `closed`에 도달한 뒤 이 effect가 한 번 더 돌아 재오픈을 집어 올린다.
    //
    // `closing → opening` 직행을 만드는 것이 아니다. `closed`를 거치는 정규 경로이며,
    // activation guard의 seal도 그때 `onOpening()`에서 정상적으로 풀린다.
    useLayoutEffect(() => {
        if (open && stateRef.current === "closed") {
            callbacks.current.onOpening();
            move("opening");
            return;
        }
        if (!open && (stateRef.current === "open" || stateRef.current === "opening")) {
            requestClose("programmatic");
        }
    }, [open, state, move, requestClose]);
    const markPlaced = useCallback(() => {
        if (stateRef.current !== "opening")
            return;
        move("open");
    }, [move]);
    // closing의 나머지 절차. 같은 commit의 layout effect이므로 paint 전에 끝난다.
    useLayoutEffect(() => {
        if (state !== "closing")
            return undefined;
        const node = nodeRef.current;
        const reason = reasonRef.current;
        // root가 아직 DOM에 있는 상태에서 focus를 돌려준다. unmount 뒤에 옮기면
        // 대상이 사라진 뒤라 focus가 body로 떨어진다.
        callbacks.current.onBeforeUnmount(reason);
        let finished = false;
        const finish = () => {
            if (finished)
                return;
            finished = true;
            // exit 도중 소비자가 **마음을 바꿔** 다시 열어달라고 했으면 `false`를 통지하지 않는다.
            // 통지하면 소비자가 자기 상태를 false로 되돌려 **자신의 요청을 스스로 취소**하고,
            // `open === true`인데 패널이 영영 닫힌 채로 남는다.
            // 침묵하면 아래 open 전이 effect가 `closed`에서 재오픈을 집어 올린다.
            const reopened = openRef.current && !openAtCloseStart.current;
            if (!reopened)
                callbacks.current.onOpenChange(false, reason);
            move("closed");
        };
        const duration = node === null ? 0 : readExitDuration(node);
        if (duration === 0) {
            // reduced-motion 경로. 같은 tick에 끝나지만 순서는 위와 동일하다.
            finish();
            return undefined;
        }
        const onTransitionEnd = (event) => {
            if (event.target !== node)
                return;
            finish();
        };
        node?.addEventListener("transitionend", onTransitionEnd);
        // timer는 상한이다. transitionend가 오지 않는 경우(속성이 실제로 바뀌지 않음,
        // display:none)를 위해 두고, 먼저 오는 쪽이 이긴다.
        const timer = window.setTimeout(finish, duration + 1);
        return () => {
            node?.removeEventListener("transitionend", onTransitionEnd);
            window.clearTimeout(timer);
        };
    }, [state, move, nodeRef]);
    return {
        state,
        mounted: state !== "closed",
        requestClose,
        markPlaced,
    };
}
//# sourceMappingURL=presence.js.map