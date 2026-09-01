import { type BranchRegistry } from "./branch-registry.js";
import type { OverlayDismissReason, OverlayLayer, OverlayMode } from "./types.js";
/**
 * layer stack · topmost 비교자 · Escape 단일 리스너.
 *
 * 하부 유틸을 쓰지 않는 이유가 여기 전부 있다. Radix의 layer stack은 `Set` 삽입 순서
 * (= effect 실행 순서)로 topmost를 정하는데, React는 effect를 자식 → 부모 순으로 돌린다.
 * 그래서 **부모와 자식 overlay가 같은 commit에 마운트되면 부모가 topmost가 된다** — DOM
 * 중첩과 정반대다. `overlay-store.node.test.ts`의 마지막 테스트가 같은 입력에서 두 규칙이
 * 서로 다른 답을 내는 것을 고정한다.
 *
 * React에 의존하지 않는다. Escape 리스너의 부착 대상도 `Document`가 아니라 구조적
 * 인터페이스라 node project에서 DOM 없이 검증된다.
 */
export interface EscapeHost {
    addEventListener(type: "keydown", listener: (event: KeyboardEvent) => void, options: {
        capture: true;
    }): void;
    removeEventListener(type: "keydown", listener: (event: KeyboardEvent) => void, options: {
        capture: true;
    }): void;
}
export interface LayerRecord {
    readonly id: string;
    readonly branchId: string;
    readonly layer: OverlayLayer;
    readonly mode: OverlayMode;
    /** `open`이 false→true가 되는 상태 전이 시점에 채번한다. effect 시점이 아니다. */
    readonly openSeq: number;
    readonly closeOnEscape: boolean;
    /** Dialog dismissible=false 또는 busy. 닫지 않고 안내만 한다. */
    readonly dismissLocked: boolean;
    readonly requestClose: (reason: OverlayDismissReason) => void;
    readonly onDismissBlocked: (reason: OverlayDismissReason) => void;
}
export interface OverlayStore {
    readonly branches: BranchRegistry;
    /** 등록한다. 반환된 함수가 해제다. */
    register(record: LayerRecord): () => void;
    topmost(): LayerRecord | null;
    topmostModal(): LayerRecord | null;
    isAbove(a: LayerRecord, b: LayerRecord): boolean;
    nextOpenSeq(): number;
    /**
     * 등록 순서 그대로. **정책에 쓰지 않는다** — "마지막 등록이 topmost"라는 틀린 규칙과
     * 우리 비교자가 같은 입력에서 갈리는 것을 테스트가 보이기 위해서만 노출한다.
     */
    registeredOrder(): readonly LayerRecord[];
}
export declare function createOverlayStore(host: EscapeHost): OverlayStore;
//# sourceMappingURL=overlay-store.d.ts.map