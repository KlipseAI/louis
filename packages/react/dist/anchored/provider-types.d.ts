import type { ReactNode } from "react";
export interface OverlayProviderProps {
    readonly children: ReactNode;
    /** overlay host와 scroll owner를 담을 요소. 기본값은 `document.body`다. */
    readonly container?: HTMLElement | null;
}
//# sourceMappingURL=provider-types.d.ts.map