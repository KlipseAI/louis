import type { JSX } from "react";
import type { DialogSurfaceProps } from "./types.js";
/**
 * scrim root(primitive Surface) → backdrop → card.
 *
 * 세 노드가 **하나의 portal 자식 subtree** 안에 있어야 한다. backdrop을 별도 OverlayPortal로
 * 렌더하면 modal host의 두 번째 직속 자식이 되고, use-overlay의 형제 격리가 자기 자신의
 * backdrop에 inert를 건다 — backdrop 클릭이 조용히 죽는다.
 */
export declare function DialogSurface({ className, children, ...rest }: DialogSurfaceProps): JSX.Element | null;
//# sourceMappingURL=surface.d.ts.map