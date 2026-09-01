"use client";
import { useId, useMemo } from "react";
export function useOverlayIds() {
    const id = useId();
    return useMemo(() => ({
        panel: `louis-overlay-${id}-panel`,
        title: `louis-overlay-${id}-title`,
        description: `louis-overlay-${id}-description`,
    }), [id]);
}
//# sourceMappingURL=ids.js.map