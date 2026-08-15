import { describe, expect, test, vi } from "vitest";

// DS-D-0011 결정 2: overlay primitive는 public 표면이 아니므로 dist를 상대 경로로 읽는다.
// src가 아니라 dist인 것이 예외의 조건이다 — tsc + isolatedDeclarations 경로가 함께 검증된다.
import {
  createBranchRegistry,
  createOverlayStore,
  type EscapeHost,
  type LayerRecord,
  type OverlayLayer,
  type OverlayMode,
  type OverlayStore,
} from "../dist/overlay/index.js";

// 이 파일은 node project에서 돈다. DOM이 없다는 것이 계약의 일부다 —
// store와 registry가 브라우저 없이 빌드·검증되는 순수 계층임을 증명한다.

interface FakeHost extends EscapeHost {
  readonly listeners: ReadonlyArray<(event: KeyboardEvent) => void>;
  dispatch(event: Partial<KeyboardEvent>): void;
}

function createFakeHost(): FakeHost {
  const listeners: Array<(event: KeyboardEvent) => void> = [];
  return {
    listeners,
    addEventListener(_type, listener) {
      listeners.push(listener);
    },
    removeEventListener(_type, listener) {
      const index = listeners.indexOf(listener);
      if (index >= 0) listeners.splice(index, 1);
    },
    dispatch(event) {
      const full = {
        key: "Escape",
        isComposing: false,
        keyCode: 27,
        composedPath: () => [],
        preventDefault: () => {},
        stopPropagation: () => {},
        ...event,
      } as KeyboardEvent;
      for (const listener of [...listeners]) listener(full);
    },
  };
}

interface RecordSpec {
  readonly id: string;
  readonly branchId: string;
  readonly layer?: OverlayLayer;
  readonly mode?: OverlayMode;
  readonly openSeq: number;
  readonly closeOnEscape?: boolean;
  readonly dismissLocked?: boolean;
}

function makeRecord(
  spec: RecordSpec,
): LayerRecord & { readonly closed: string[]; readonly blocked: string[] } {
  const closed: string[] = [];
  const blocked: string[] = [];
  return {
    id: spec.id,
    branchId: spec.branchId,
    layer: spec.layer ?? "popover",
    mode: spec.mode ?? "non-modal",
    openSeq: spec.openSeq,
    closeOnEscape: spec.closeOnEscape ?? true,
    dismissLocked: spec.dismissLocked ?? false,
    requestClose: (reason) => closed.push(reason),
    onDismissBlocked: (reason) => blocked.push(reason),
    closed,
    blocked,
  };
}

function storeWith(host: EscapeHost = createFakeHost()): OverlayStore {
  return createOverlayStore(host);
}

describe("topmost 비교자", () => {
  test("자손 branch는 등록 순서와 무관하게 항상 부모보다 위다", () => {
    const store = storeWith();
    store.branches.open("root", null);
    store.branches.open("child", "root");

    const parent = makeRecord({ id: "p", branchId: "root", openSeq: 1 });
    const child = makeRecord({ id: "c", branchId: "child", openSeq: 2 });

    // 부모를 먼저 등록해도
    const releaseParent = store.register(parent);
    const releaseChild = store.register(child);
    expect(store.topmost()?.id).toBe("c");
    releaseParent();
    releaseChild();

    // 자식을 먼저 등록해도 (React가 effect를 자식 → 부모로 돌리는 실제 순서)
    store.register(child);
    store.register(parent);
    expect(store.topmost()?.id).toBe("c");
  });

  test("같은 branch 트리에서 depth가 같으면 openSeq가 큰 쪽이 위다", () => {
    const store = storeWith();
    store.branches.open("root", null);
    store.branches.open("a", "root");
    store.branches.open("b", "root");

    const first = makeRecord({ id: "a", branchId: "a", openSeq: 5 });
    const second = makeRecord({ id: "b", branchId: "b", openSeq: 4 });
    store.register(first);
    store.register(second);

    expect(store.branches.depth("a")).toBe(store.branches.depth("b"));
    expect(store.topmost()?.id).toBe("a");
  });

  test("서로 다른 branch 트리는 root의 openSeq로 정렬된다", () => {
    const store = storeWith();
    store.branches.open("treeA", null);
    store.branches.open("treeA-child", "treeA");
    store.branches.open("treeB", null);

    // 자식이 전체에서 가장 늦게 열렸지만, 트리 비교는 root끼리 한다.
    const rootA = makeRecord({ id: "A", branchId: "treeA", openSeq: 1 });
    const childA = makeRecord({ id: "A/1", branchId: "treeA-child", openSeq: 9 });
    const rootB = makeRecord({ id: "B", branchId: "treeB", openSeq: 5 });

    store.register(rootA);
    store.register(childA);
    store.register(rootB);

    // rootB(5) > rootA(1)이므로 B 트리가 위다. A의 자식이 openSeq 9여도 트리를 넘지 못한다.
    expect(store.topmost()?.id).toBe("B");
    expect(store.isAbove(rootB, childA)).toBe(true);
  });

  test("layer rank는 lineage보다 뒤에 평가된다 — modal 안의 popover가 modal보다 위다", () => {
    const store = storeWith();
    store.branches.open("dialog", null);
    store.branches.open("dialog-popover", "dialog");

    const dialog = makeRecord({
      id: "dialog",
      branchId: "dialog",
      layer: "modal",
      mode: "modal",
      openSeq: 1,
    });
    const popover = makeRecord({
      id: "popover",
      branchId: "dialog-popover",
      layer: "popover",
      openSeq: 2,
    });
    store.register(dialog);
    store.register(popover);

    // rank만 봤다면 modal(2) > popover(1)이라 dialog가 topmost였을 것이다.
    expect(store.isAbove(dialog, popover)).toBe(false);
    expect(store.topmost()?.id).toBe("popover");
    // 그리고 modal 축은 여전히 dialog를 가리킨다 — inert 대상 계산이 이 값을 쓴다.
    expect(store.topmostModal()?.id).toBe("dialog");
  });

  test("topmost()는 정렬이 아니라 선형 스캔이라 부분순서에서도 배열을 오염시키지 않는다", () => {
    const store = storeWith();
    store.branches.open("p", null);
    store.branches.open("p-child", "p");
    store.branches.open("x", null);

    const parent = makeRecord({
      id: "parent",
      branchId: "p",
      layer: "critical",
      openSeq: 1,
    });
    const child = makeRecord({
      id: "child",
      branchId: "p-child",
      layer: "popover",
      openSeq: 2,
    });
    const other = makeRecord({
      id: "other",
      branchId: "x",
      layer: "modal",
      openSeq: 3,
    });
    store.register(parent);
    store.register(child);
    store.register(other);

    // 비교자는 전순서가 아니다. lineage가 rank를 이기므로 순환이 생긴다.
    expect(store.isAbove(child, parent)).toBe(true); // lineage
    expect(store.isAbove(parent, other)).toBe(true); // critical > modal
    expect(store.isAbove(other, child)).toBe(true); // modal > popover

    // Array.sort는 이런 비교자에서 결과가 구현 정의다. 선형 스캔은 입력을 건드리지 않는다.
    const before = store.registeredOrder();
    const picked = store.topmost();
    const after = store.registeredOrder();

    expect(picked).not.toBeNull();
    expect(after.map((record) => record.id)).toEqual(before.map((record) => record.id));
    expect(after.map((record) => record.id)).toEqual(["parent", "child", "other"]);
  });

  test('검출력 — "마지막 등록이 topmost" 규칙이었다면 같은 입력에서 부모가 선택된다', () => {
    const store = storeWith();
    store.branches.open("root", null);
    store.branches.open("child", "root");

    const child = makeRecord({ id: "child", branchId: "child", openSeq: 2 });
    const parent = makeRecord({ id: "parent", branchId: "root", openSeq: 1 });

    // React는 useLayoutEffect를 자식 → 부모 순으로 돌린다. 그래서 같은 commit에
    // 함께 마운트되면 **부모가 마지막에 등록된다**.
    store.register(child);
    store.register(parent);

    const registered = store.registeredOrder();
    const lastRegistered = registered[registered.length - 1];

    // 삽입 순서 규칙(하부 유틸이 쓰는 규칙)은 부모를 고른다 — DOM 중첩과 정반대다.
    expect(lastRegistered?.id).toBe("parent");
    // 우리 비교자는 자식을 고른다. 두 규칙이 같은 입력에서 갈리는 것이 이 계층의 존재 이유다.
    expect(store.topmost()?.id).toBe("child");
  });
});

describe("branch registry", () => {
  test("containsPath는 자손 branch의 member도 내부로 판정한다", () => {
    const registry = createBranchRegistry();
    registry.open("panel", null);
    registry.open("submenu", "panel");
    registry.open("unrelated", null);

    // DOM 없이 검증한다. 판정은 member 자신의 contains()와 nodeType에만 의존한다.
    // nodeType은 composedPath()의 window/document를 걸러내는 실제 조건이므로 fake에도 둔다.
    const panelNode = {
      nodeType: 1,
      contains: (node: unknown) => node === panelNode,
    } as unknown as Element;
    const submenuItem = { nodeType: 1 } as unknown as Element;
    const submenuNode = {
      nodeType: 1,
      contains: (node: unknown) => node === submenuNode || node === submenuItem,
    } as unknown as Element;
    const outsideNode = {
      nodeType: 1,
      contains: (node: unknown) => node === outsideNode,
    } as unknown as Element;

    registry.addMember("panel", panelNode);
    registry.addMember("submenu", submenuNode);
    registry.addMember("unrelated", outsideNode);

    // submenu는 panel의 DOM 자손이 아니다 — 별도 host로 portal된 상황을 그대로 모사한다.
    expect(panelNode.contains(submenuItem)).toBe(false);
    // 그럼에도 branch lineage 때문에 내부로 판정된다. 이것이 contains() 단독 판정과의 차이다.
    expect(registry.containsPath("panel", [submenuItem, submenuNode])).toBe(true);
    expect(registry.containsPath("submenu", [submenuItem])).toBe(true);
    // 반대 방향은 성립하지 않는다. 부모 member는 자식 branch의 내부가 아니다.
    expect(registry.containsPath("submenu", [panelNode])).toBe(false);
    expect(registry.containsPath("panel", [outsideNode])).toBe(false);
    // Node가 아닌 원소(window·document)는 판정에서 제외된다. 던지지 않는 것이 계약이다.
    const notANode = { addEventListener: () => {} } as unknown as EventTarget;
    expect(() => registry.containsPath("panel", [notANode])).not.toThrow();
    expect(registry.containsPath("panel", [notANode])).toBe(false);
  });

  test("부모를 자식보다 먼저 close하면 자식이 닫힐 때까지 lineage가 남는다", () => {
    const registry = createBranchRegistry();
    const closePanel = registry.open("panel", null);
    const closeSubmenu = registry.open("submenu", "panel");

    // React는 언마운트 시 effect cleanup을 부모 → 자식 순으로 돌린다. 이것이 정상 경로다.
    closePanel();

    // 부모를 즉시 지우면 이 구간에 들어온 pointer가 자식 내부를 바깥으로 오판한다.
    expect(registry.has("panel")).toBe(true);
    expect(registry.isDescendant("submenu", "panel")).toBe(true);

    closeSubmenu();

    // 마지막 자식이 닫히면 대기 중이던 조상까지 연쇄로 정리된다. 누수가 남지 않는다.
    expect(registry.has("submenu")).toBe(false);
    expect(registry.has("panel")).toBe(false);
  });

  test("자식이 먼저 닫히면 부모는 그대로 열려 있다", () => {
    const registry = createBranchRegistry();
    registry.open("panel", null);
    const closeSubmenu = registry.open("submenu", "panel");

    closeSubmenu();

    // 연쇄 정리는 pendingClose인 조상에만 적용된다. 살아 있는 부모를 끌고 가면 안 된다.
    expect(registry.has("submenu")).toBe(false);
    expect(registry.has("panel")).toBe(true);
  });

  test("자식이 부모보다 먼저 열려도 lineage가 성립한다", () => {
    const registry = createBranchRegistry();
    // React의 실제 effect 순서. 부모 선존재를 요구했다면 여기서 던졌을 것이다.
    registry.open("child", "root");
    registry.open("root", null);

    expect(registry.isDescendant("child", "root")).toBe(true);
    expect(registry.depth("child")).toBe(1);
    expect(registry.rootOf("child")).toBe("root");
  });
});

describe("Escape 라우팅", () => {
  test("리스너는 layer가 0→1일 때 한 번 붙고 1→0일 때 떨어진다", () => {
    const host = createFakeHost();
    const store = createOverlayStore(host);
    store.branches.open("a", null);
    store.branches.open("b", null);

    expect(host.listeners.length).toBe(0);
    const releaseA = store.register(makeRecord({ id: "a", branchId: "a", openSeq: 1 }));
    const releaseB = store.register(makeRecord({ id: "b", branchId: "b", openSeq: 2 }));
    // 각 layer가 리스너를 갖지 않는다. store 하나가 소유한다.
    expect(host.listeners.length).toBe(1);

    releaseB();
    expect(host.listeners.length).toBe(1);
    releaseA();
    expect(host.listeners.length).toBe(0);
  });

  test("Escape는 최상위 하나만 닫고 아래로 내려가지 않는다", () => {
    const host = createFakeHost();
    const store = createOverlayStore(host);
    store.branches.open("root", null);
    store.branches.open("child", "root");

    const parent = makeRecord({ id: "parent", branchId: "root", openSeq: 1 });
    const child = makeRecord({ id: "child", branchId: "child", openSeq: 2 });
    store.register(child);
    store.register(parent);

    const stopPropagation = vi.fn();
    const preventDefault = vi.fn();
    host.dispatch({ stopPropagation, preventDefault });

    expect(child.closed).toEqual(["escape"]);
    expect(parent.closed).toEqual([]);
    expect(stopPropagation).toHaveBeenCalledTimes(1);
    expect(preventDefault).toHaveBeenCalledTimes(1);
  });

  test("dismissLocked인 최상위는 닫히지도 않고 아래로 넘기지도 않는다", () => {
    const host = createFakeHost();
    const store = createOverlayStore(host);
    store.branches.open("under", null);
    store.branches.open("over", null);

    const under = makeRecord({ id: "under", branchId: "under", openSeq: 1 });
    const over = makeRecord({
      id: "over",
      branchId: "over",
      openSeq: 2,
      dismissLocked: true,
    });
    store.register(under);
    store.register(over);

    host.dispatch({});

    expect(over.closed).toEqual([]);
    expect(over.blocked).toEqual(["escape"]);
    // 아래 Dialog가 대신 닫히면 "취소할 수 없는 작업이 Escape 한 번에 사라지는" 결함이 된다.
    expect(under.closed).toEqual([]);
  });

  test("IME 조합 중 Escape와 escape-owner 안의 Escape는 통과시킨다", () => {
    const host = createFakeHost();
    const store = createOverlayStore(host);
    store.branches.open("panel", null);
    const panel = makeRecord({ id: "panel", branchId: "panel", openSeq: 1 });
    store.register(panel);

    host.dispatch({ isComposing: true });
    expect(panel.closed).toEqual([]);

    host.dispatch({ isComposing: false, keyCode: 229 });
    expect(panel.closed).toEqual([]);

    const owner = { matches: (selector: string) => selector === "[data-kds-escape-owner]" };
    host.dispatch({ composedPath: () => [owner] as unknown as EventTarget[] });
    expect(panel.closed).toEqual([]);

    // 검출력 — 같은 이벤트에서 조건만 빼면 실제로 닫힌다. 위 세 단언이 "아무 것도 안 함"을
    // 통과시키는 것이 아님을 보인다.
    host.dispatch({});
    expect(panel.closed).toEqual(["escape"]);
  });
});
