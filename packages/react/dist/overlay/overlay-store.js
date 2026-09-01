import { createBranchRegistry } from "./branch-registry.js";
const LAYER_RANK = {
    popover: 1,
    modal: 2,
    critical: 3,
};
/** Escape를 한 번 양보받는 네이티브·복합 위젯의 표식. */
const ESCAPE_OWNER_SELECTOR = "[data-louis-escape-owner]";
function pathHasEscapeOwner(path) {
    for (const entry of path) {
        const candidate = entry;
        if (typeof candidate.matches === "function") {
            if (candidate.matches(ESCAPE_OWNER_SELECTOR))
                return true;
        }
    }
    return false;
}
export function createOverlayStore(host) {
    const branches = createBranchRegistry();
    const layers = new Set();
    const byBranch = new Map();
    let openSeqCounter = 0;
    let listening = false;
    function rootOpenSeq(record) {
        if (!branches.has(record.branchId))
            return record.openSeq;
        const rootId = branches.rootOf(record.branchId);
        return byBranch.get(rootId)?.openSeq ?? record.openSeq;
    }
    function branchDepth(record) {
        return branches.has(record.branchId) ? branches.depth(record.branchId) : 0;
    }
    function isAbove(a, b) {
        // 1. lineage가 가장 먼저다. 자손 branch는 rank·시각과 무관하게 항상 위다 —
        //    Dialog 안에서 연 Popover가 Dialog보다 위여야 F12/W-7이 성립한다.
        if (branches.has(a.branchId) && branches.has(b.branchId)) {
            if (a.branchId !== b.branchId) {
                if (branches.isDescendant(a.branchId, b.branchId))
                    return true;
                if (branches.isDescendant(b.branchId, a.branchId))
                    return false;
            }
        }
        // 2. layer rank. elevation과 무관하다.
        if (LAYER_RANK[a.layer] !== LAYER_RANK[b.layer]) {
            return LAYER_RANK[a.layer] > LAYER_RANK[b.layer];
        }
        // 3. 서로 다른 branch 트리라면 root가 늦게 열린 쪽.
        const rootA = rootOpenSeq(a);
        const rootB = rootOpenSeq(b);
        if (rootA !== rootB)
            return rootA > rootB;
        // 4. 같은 트리라면 더 깊은 쪽.
        const depthA = branchDepth(a);
        const depthB = branchDepth(b);
        if (depthA !== depthB)
            return depthA > depthB;
        // 5. 마지막으로 열린 순서.
        return a.openSeq > b.openSeq;
    }
    function pick(filter) {
        // Array.sort를 쓰지 않는다. isAbove는 전순서가 아니므로(1번 규칙이 lineage를 보기
        // 때문에 이행성이 보장되지 않는다) 정렬하면 비교 횟수에 따라 결과가 달라진다.
        let best = null;
        for (const record of layers) {
            if (!filter(record))
                continue;
            if (best === null || isAbove(record, best))
                best = record;
        }
        return best;
    }
    function topmost() {
        return pick(() => true);
    }
    function onKeyDown(event) {
        if (event.key !== "Escape")
            return;
        // IME 조합 중 Escape는 조합 취소다. overlay가 가로채면 입력이 사라진다.
        if (event.isComposing || event.keyCode === 229)
            return;
        if (pathHasEscapeOwner(event.composedPath()))
            return;
        const top = topmost();
        if (top === null)
            return;
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
    function syncListener() {
        const shouldListen = layers.size > 0;
        if (shouldListen === listening)
            return;
        if (shouldListen) {
            host.addEventListener("keydown", onKeyDown, { capture: true });
        }
        else {
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
//# sourceMappingURL=overlay-store.js.map