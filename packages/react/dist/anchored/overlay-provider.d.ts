import type { JSX } from "react";
import type { OverlayProviderProps } from "./provider-types.js";
/**
 * 공개 진입점 (DS-D-0011 결정 5).
 *
 * primitive Provider를 그대로 재export하지 않는 이유는, 그러면 primitive 모듈이 공개 표면이
 * 되어 결정 1이 무너지기 때문이다. 여기서 이름과 props를 recipe 계층이 소유하고, 내부 구현은
 * 계속 비공개로 남는다.
 *
 * 이 컴포넌트가 필요한 이유 자체는 계약이다 — host와 scroll owner를 **앱이 한 번** 해석해야
 * 하며 컴포넌트가 고르면 인스턴스마다 stacking과 inert 경계가 달라진다.
 */
export declare function OverlayProvider(props: OverlayProviderProps): JSX.Element;
//# sourceMappingURL=overlay-provider.d.ts.map