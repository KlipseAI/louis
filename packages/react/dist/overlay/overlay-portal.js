"use client";
import { jsx as _jsx } from "react/jsx-runtime";
import { Portal } from "@radix-ui/react-portal";
import { useOverlayContext } from "./overlay-provider.js";
export function OverlayPortal({ kind, children }) {
    const { hosts, hostContainer } = useOverlayContext();
    const host = hosts[kind];
    // host가 아직 문서에 붙지 않았다면 렌더하지 않는다. 붙기 전에 렌더하면 위치 계산이
    // 분리된 트리에서 일어나 전부 0이 된다.
    if (host === null || hostContainer === null)
        return null;
    return _jsx(Portal, { container: host, children: children });
}
//# sourceMappingURL=overlay-portal.js.map