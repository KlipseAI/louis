"use client";
import { jsx as _jsx } from "react/jsx-runtime";
import { Popper, PopperAnchor, PopperContent, } from "@radix-ui/react-popper";
/** anchor와 panel을 같은 문맥에 둔다. Trigger와 Surface를 모두 감싼다. */
export function OverlayPositioner({ children }) {
    return _jsx(Popper, { children: children });
}
export function OverlayAnchor(props) {
    return _jsx(PopperAnchor, { ...props });
}
export function OverlayPositioned(props) {
    return _jsx(PopperContent, { ...props });
}
export const DEFAULT_OVERLAY_METRICS = {
    offset: 8,
    collisionPadding: 8,
};
/**
 * 배치 상수를 **CSS에서 읽는다.** JS 상수로 두지 않는 이유는 DS-P3-014가 semantic spacing
 * 토큰을 추가할 때 API 변경 없이 값만 갈아끼울 수 있어야 하기 때문이다. primitive 토큰
 * (`--louis-space-4`)을 CSS에서 직접 소비하면 저작 게이트에 걸린다.
 *
 * panel이 존재하기 전에 값이 필요하므로 같은 클래스를 가진 보이지 않는 probe로 1회 측정한다.
 */
export function measureOverlayMetrics(host) {
    const probe = document.createElement("div");
    probe.className = "louis-overlay-panel";
    probe.style.position = "absolute";
    probe.style.visibility = "hidden";
    probe.style.pointerEvents = "none";
    host.append(probe);
    const style = getComputedStyle(probe);
    const offset = Number.parseFloat(style.getPropertyValue("--louis-overlay-offset"));
    const collisionPadding = Number.parseFloat(style.getPropertyValue("--louis-overlay-collision-padding"));
    probe.remove();
    return {
        offset: Number.isNaN(offset) ? DEFAULT_OVERLAY_METRICS.offset : offset,
        collisionPadding: Number.isNaN(collisionPadding)
            ? DEFAULT_OVERLAY_METRICS.collisionPadding
            : collisionPadding,
    };
}
//# sourceMappingURL=positioner.js.map