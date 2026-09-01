"use client";
import { createContext, useContext } from "react";
const DialogContext = createContext(null);
export const DialogContextProvider = DialogContext.Provider;
export function useDialogContext(part) {
    const value = useContext(DialogContext);
    if (value === null) {
        throw new Error(`${part}은(는) Dialog 안에서만 사용할 수 있습니다.`);
    }
    return value;
}
/**
 * 소비자가 자기 footer를 직접 그릴 때의 유일한 confirm/cancel 발행 통로.
 *
 * `useOverlayBranch().close`처럼 `setOpen`과 `requestClose`를 둘 다 부르지 **않는다.**
 * 그러면 presence의 최종 통지와 합쳐 `onOpenChange(false, …)`가 두 번 나간다.
 */
export function useDialogClose() {
    return useDialogContext("useDialogClose").closeWith;
}
//# sourceMappingURL=context.js.map