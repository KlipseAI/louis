import { createBranchRegistry, type BranchRegistry } from "./branch-registry.js";
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
  addEventListener(
    type: "keydown",
    listener: (event: KeyboardEvent) => void,
    options: { capture: true },
  ): void;
  removeEventListener(
    type: "keydown",
    listener: (event: KeyboardEvent) => void,
    options: { capture: true },
  ): void;
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

const LAYER_RANK: Record<OverlayLayer, number> = {
  popover: 1,
  modal: 2,
  critical: 3,
};

/** Escape를 한 번 양보받는 네이티브·복합 위젯의 표식. */
const ESCAPE_OWNER_SELECTOR = "[data-kds-escape-owner]";

interface MatchesLike {
  matches?: (selector: string) => boolean;
}

function pathHasEscapeOwner(path: readonly EventTarget[]): boolean {
  for (const entry of path) {
    const candidate = entry as MatchesLike;
    if (typeof candidate.matches === "function") {
      if (candidate.matches(ESCAPE_OWNER_SELECTOR)) return true;
    }
  }
  return false;
}

export function createOverlayStore(host: EscapeHost): OverlayStore {
  const branches = createBranchRegistry();
  const layers = new Set<LayerRecord>();
  const byBranch = new Map<string, LayerRecord>();
  let openSeqCounter = 0;
  let listening = false;

  function rootOpenSeq(record: LayerRecord): number {
    if (!branches.has(record.branchId)) return record.openSeq;
    const rootId = branches.rootOf(record.branchId);
    return byBranch.get(rootId)?.openSeq ?? record.openSeq;
  }

  function branchDepth(record: LayerRecord): number {
    return branches.has(record.branchId) ? branches.depth(record.branchId) : 0;
  }

  function isAbove(a: LayerRecord, b: LayerRecord): boolean {
    // 1. lineage가 가장 먼저다. 자손 branch는 rank·시각과 무관하게 항상 위다 —
    //    Dialog 안에서 연 Popover가 Dialog보다 위여야 F12/W-7이 성립한다.
    if (branches.has(a.branchId) && branches.has(b.branchId)) {
      if (a.branchId !== b.branchId) {
        if (branches.isDescendant(a.branchId, b.branchId)) return true;
        if (branches.isDescendant(b.branchId, a.branchId)) return false;
      }
    }
    // 2. layer rank. elevation과 무관하다.
    if (LAYER_RANK[a.layer] !== LAYER_RANK[b.layer]) {
      return LAYER_RANK[a.layer] > LAYER_RANK[b.layer];
    }
    // 3. 서로 다른 branch 트리라면 root가 늦게 열린 쪽.
    const rootA = rootOpenSeq(a);
    const rootB = rootOpenSeq(b);
    if (rootA !== rootB) return rootA > rootB;
    // 4. 같은 트리라면 더 깊은 쪽.
    const depthA = branchDepth(a);
    const depthB = branchDepth(b);
    if (depthA !== depthB) return depthA > depthB;
    // 5. 마지막으로 열린 순서.
    return a.openSeq > b.openSeq;
  }

  function pick(filter: (record: LayerRecord) => boolean): LayerRecord | null {
    // Array.sort를 쓰지 않는다. isAbove는 전순서가 아니므로(1번 규칙이 lineage를 보기
    // 때문에 이행성이 보장되지 않는다) 정렬하면 비교 횟수에 따라 결과가 달라진다.
    let best: LayerRecord | null = null;
    for (const record of layers) {
      if (!filter(record)) continue;
      if (best === null || isAbove(record, best)) best = record;
    }
    return best;
  }

  function topmost(): LayerRecord | null {
    return pick(() => true);
  }

  function onKeyDown(event: KeyboardEvent): void {
    if (event.key !== "Escape") return;
    // IME 조합 중 Escape는 조합 취소다. overlay가 가로채면 입력이 사라진다.
    if (event.isComposing || event.keyCode === 229) return;
    if (pathHasEscapeOwner(event.composedPath())) return;

    const top = topmost();
    if (top === null) return;

    event.preventDefault();
    // 아래 layer로 절대 내려가지 않는다. 한 번의 Escape는 한 단계만 닫는다.
    event.stopPropagation();

    if (!top.closeOnEscape || top.dismissLocked) {
      // 닫지 않되 아래 Dialog로 넘기지도 않는다. 소유권은 여전히 최상위에 있다.
      top.onDismissBlocked("escape");
      return;
    }
    top.requestClose("escape");
  }

  function syncListener(): void {
    const shouldListen = layers.size > 0;
    if (shouldListen === listening) return;
    if (shouldListen) {
      host.addEventListener("keydown", onKeyDown, { capture: true });
    } else {
      host.removeEventListener("keydown", onKeyDown, { capture: true });
    }
    listening = shouldListen;
  }

  return {
    branches,

    register(record) {
      layers.add(record);
      byBranch.set(record.branchId, record);
      syncListener();
      return () => {
        layers.delete(record);
        if (byBranch.get(record.branchId) === record) {
          byBranch.delete(record.branchId);
        }
        syncListener();
      };
    },

    topmost,

    topmostModal() {
      return pick((record) => record.mode === "modal");
    },

    isAbove,

    nextOpenSeq() {
      openSeqCounter += 1;
      return openSeqCounter;
    },

    registeredOrder() {
      return [...layers];
    },
  };
}
