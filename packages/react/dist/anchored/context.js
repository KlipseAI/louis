"use client";
import { createContext, useContext } from "react";
const AnchoredContext = createContext(null);
export const AnchoredContextProvider = AnchoredContext.Provider;
export function useAnchoredContext(part) {
    const value = useContext(AnchoredContext);
    if (value === null) {
        throw new Error(`${part}은(는) 대응하는 Root 안에서만 사용할 수 있습니다.`);
    }
    return value;
}
/** 문맥이 없으면 null. Item이 잘못된 Root 안에 있는지 판별할 때 쓴다. */
export function useOptionalAnchoredContext() {
    return useContext(AnchoredContext);
}
/**
 * React 트리 밖에서 만든 nested overlay를 이 branch의 내부로 등록한다.
 *
 * 이것이 공개돼야 하는 이유: 앱이 명령형으로 만든 색 선택기나 서드파티 콤보박스는 React
 * 트리에 없으므로 하부 유틸의 자동 내부 판정에 걸리지 않는다. 등록하지 않으면 그 안을 클릭할 때
 * 부모 패널이 바깥으로 오판해 닫힌다.
 */
export function useOverlayBranch() {
    const context = useAnchoredContext("useOverlayBranch");
    const { overlay } = context;
    return {
        branchId: overlay.branchId,
        panelId: overlay.ids.panel,
        registerMember: overlay.registerMember,
        close: (reason) => {
            context.setOpen(false, reason);
            overlay.requestClose(reason);
        },
    };
}
//# sourceMappingURL=context.js.map