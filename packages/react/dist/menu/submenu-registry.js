"use client";
import { createContext, useContext } from "react";
const SubmenuRegistryContext = createContext(null);
export const SubmenuRegistryProvider = SubmenuRegistryContext.Provider;
export function useSubmenuRegistry() {
    return useContext(SubmenuRegistryContext);
}
export function createSubmenuRegistry(pendingEntryRef) {
    const openers = new Map();
    return {
        register(id, open) {
            openers.set(id, open);
            return () => {
                openers.delete(id);
            };
        },
        open(id) {
            openers.get(id)?.();
        },
        notifyOpened(id) {
            if (pendingEntryRef.current === id)
                pendingEntryRef.current = null;
        },
    };
}
//# sourceMappingURL=submenu-registry.js.map