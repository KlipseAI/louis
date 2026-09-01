import type { JSX, ReactNode } from "react";
import type { OverlayHostKind } from "./types.js";
/**
 * 해석된 host로만 portal한다.
 *
 * 하부 portal 유틸은 `container`가 falsy면 조용히 `document.body`로 폴백한다. 그 폴백은
 * 여기서 반드시 막아야 한다 — body로 떨어진 overlay는 Provider가 만든 host 밖에 있으므로
 * inert 경계와 stacking 기준에서 동시에 벗어나고, 아무 에러도 나지 않는다.
 * host가 없으면 **아무것도 렌더하지 않는다.**
 */
export interface OverlayPortalProps {
    readonly kind: OverlayHostKind;
    readonly children: ReactNode;
}
export declare function OverlayPortal({ kind, children }: OverlayPortalProps): JSX.Element | null;
//# sourceMappingURL=overlay-portal.d.ts.map