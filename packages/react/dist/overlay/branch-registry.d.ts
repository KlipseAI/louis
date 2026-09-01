/**
 * branch registry — `branchId → {parentId, members}` 트리.
 *
 * design/components/menu-popover.md는 "구현은 `composedPath()`와 branch registry를 우선
 * 사용한다"고 규정한다. `panel.contains(target)` 단독 판정은 세 경우에 틀린다.
 *
 * 1. 다른 host로 portal된 submenu — DOM 조상이 아니다
 * 2. body로 portal된 Listbox — 별도 subtree다
 * 3. positioning 래퍼의 여백 — panel 바깥이지만 overlay의 일부다
 *
 * 이 한 파일이 세 경우를 전부 흡수한다. DOM 전역(`Node`, `Element`)을 런타임에 참조하지
 * 않으므로 node project에서 비교자와 함께 단위 검증할 수 있다 — 판정은 member 자신의
 * `contains()`에만 의존한다.
 */
export interface BranchRegistry {
    /** branch를 연다. 반환된 함수가 close다. */
    open(branchId: string, parentBranchId: string | null): () => void;
    /** DOM subtree 루트를 이 branch의 member로 등록한다. 반환된 함수가 해제다. */
    addMember(branchId: string, node: Element): () => void;
    /** candidate가 ancestor 자신이거나 그 자손 branch인가. */
    isDescendant(candidate: string, ancestor: string): boolean;
    /** path 원소 중 하나라도 이 branch 또는 자손 branch의 member 안에 있는가. */
    containsPath(branchId: string, path: readonly EventTarget[]): boolean;
    /** root에서의 깊이. root 자신은 0이다. */
    depth(branchId: string): number;
    /** 이 branch가 속한 트리의 root branchId. */
    rootOf(branchId: string): string;
    /** 열려 있는가. */
    has(branchId: string): boolean;
}
export declare function createBranchRegistry(): BranchRegistry;
//# sourceMappingURL=branch-registry.d.ts.map