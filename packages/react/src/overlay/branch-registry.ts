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

interface BranchNode {
  readonly parentId: string | null;
  readonly members: Set<Element>;
  readonly children: Set<string>;
  /** close가 요청됐지만 자식이 남아 대기 중이다. lineage는 그동안 유지된다. */
  pendingClose: boolean;
}

/** DOM 전역 `Node`를 참조하지 않는 판정. node project에서도 그대로 돈다. */
function isNodeLike(entry: EventTarget): entry is Node {
  return typeof (entry as Partial<Node>).nodeType === "number";
}

export function createBranchRegistry(): BranchRegistry {
  const nodes = new Map<string, BranchNode>();

  function requireNode(branchId: string): BranchNode {
    const node = nodes.get(branchId);
    if (node === undefined) {
      throw new Error(`overlay: 열려 있지 않은 branch입니다 — ${branchId}`);
    }
    return node;
  }

  function isDescendant(candidate: string, ancestor: string): boolean {
    let current: string | null = candidate;
    while (current !== null) {
      if (current === ancestor) return true;
      current = nodes.get(current)?.parentId ?? null;
    }
    return false;
  }

  /**
   * 자식이 남아 있으면 **제거를 미룬다.**
   *
   * React는 언마운트 시 effect cleanup을 부모 → 자식 순으로 돌린다. 즉 중첩 overlay가 함께
   * 사라질 때 부모의 close가 자식보다 **먼저** 들어오는 것이 정상 경로다. 여기서 즉시
   * 제거하면 그 짧은 구간 동안 자식의 lineage가 끊겨, 마지막 정리 중에 들어온 pointer가
   * 자식 내부를 바깥으로 오판한다. 그래서 마지막 자식이 닫힐 때까지 노드를 남기고,
   * 그때 대기 중인 조상까지 연쇄로 정리한다.
   */
  function close(branchId: string): void {
    const node = nodes.get(branchId);
    if (node === undefined) return;
    node.pendingClose = true;
    if (node.children.size > 0) return;
    nodes.delete(branchId);
    const parentId = node.parentId;
    if (parentId === null) return;
    const parent = nodes.get(parentId);
    if (parent === undefined) return;
    parent.children.delete(branchId);
    if (parent.pendingClose && parent.children.size === 0) close(parentId);
  }

  return {
    open(branchId, parentBranchId) {
      if (nodes.has(branchId)) {
        throw new Error(`overlay: 이미 열려 있는 branch입니다 — ${branchId}`);
      }
      // 부모가 아직 열려 있지 않아도 받는다. React는 `useLayoutEffect`를 자식 → 부모 순으로
      // 돌리므로 같은 commit에서는 **자식이 먼저 등록된다**. 부모 선존재를 요구하면 정확히
      // 그 순서를 막게 되고, 그것은 이 계층이 방어하려는 현상 자체다.
      // lineage는 노드가 아니라 id로 표현되므로 지연 등록에도 판정이 흔들리지 않는다.
      nodes.set(branchId, {
        parentId: parentBranchId,
        members: new Set(),
        children: new Set(),
        pendingClose: false,
      });
      if (parentBranchId !== null) {
        nodes.get(parentBranchId)?.children.add(branchId);
      }
      for (const [id, node] of nodes) {
        if (id !== branchId && node.parentId === branchId) {
          requireNode(branchId).children.add(id);
        }
      }
      return () => {
        close(branchId);
      };
    },

    addMember(branchId, node) {
      const branch = requireNode(branchId);
      branch.members.add(node);
      return () => {
        branch.members.delete(node);
      };
    },

    isDescendant,

    containsPath(branchId, path) {
      if (!nodes.has(branchId)) return false;
      // composedPath()의 마지막 두 원소는 document와 window이고 Node가 아니다.
      // 걸러내지 않으면 contains()가 TypeError를 던지고, 그 예외는 하부 유틸의
      // 이벤트 dispatch 안에서 삼켜져 "판정이 조용히 실패"로 나타난다.
      const candidates = path.filter(isNodeLike);
      for (const [id, node] of nodes) {
        if (!isDescendant(id, branchId)) continue;
        for (const member of node.members) {
          for (const entry of candidates) {
            if (entry === member) return true;
            if (member.contains(entry)) return true;
          }
        }
      }
      return false;
    },

    depth(branchId) {
      let depth = 0;
      let current = requireNode(branchId).parentId;
      while (current !== null) {
        depth += 1;
        current = nodes.get(current)?.parentId ?? null;
      }
      return depth;
    },

    rootOf(branchId) {
      let current = branchId;
      let parent = requireNode(branchId).parentId;
      while (parent !== null) {
        current = parent;
        parent = nodes.get(parent)?.parentId ?? null;
      }
      return current;
    },

    has(branchId) {
      return nodes.has(branchId);
    },
  };
}
