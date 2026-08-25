import { expect, test, vi } from "vitest";
import { userEvent } from "vitest/browser";
import { render } from "vitest-browser-react";

import "@klipse-design/css/tokens.css";
import "@klipse-design/css/styles.css";

import { AnchoredOverlay } from "./fixtures/anchored-overlay.js";

// foundations/motion.md의 "exit 완료와 unmount가 같은 source에서 계산된다"를 실측한다.
// vitest.config.ts가 project별로 주입한다. reduced-motion project에서만 true다.
declare const __LOUIS_REDUCED_MOTION__: boolean;

function panelNode(): HTMLElement | null {
  return document.querySelector('[data-testid="panel"]');
}

test("exit 시간과 unmount 시점이 같은 CSS 선언에서 계산된다", async () => {
  const screen = await render(<AnchoredOverlay />);
  await userEvent.click(screen.getByTestId("trigger"));
  const panel = screen.getByTestId("panel").element() as HTMLElement;

  // JS에 토큰 이름을 하드코딩하지 않는다. timer가 읽는 값과 시각 transition의 값이 같은 선언이다.
  const declared = getComputedStyle(panel).transitionDuration;
  const expectedMs = declared.endsWith("ms")
    ? Number.parseFloat(declared)
    : Number.parseFloat(declared) * 1000;

  if (__LOUIS_REDUCED_MOTION__) expect(expectedMs).toBe(0);
  else expect(expectedMs).toBeGreaterThan(0);

  const started = performance.now();
  await userEvent.click(screen.getByTestId("item-run"));
  await vi.waitFor(() => {
    expect(panelNode()).toBeNull();
  });
  const elapsed = performance.now() - started;

  // 상한은 선언값이다. 하드코딩된 timer라면 이 범위를 벗어난다.
  // 하한을 두지 않는 이유는 transitionend가 timer보다 먼저 올 수 있기 때문이다 —
  // 둘 중 먼저 오는 쪽이 이기는 것이 계약이다.
  expect(elapsed).toBeLessThan(expectedMs + 1500);
  if (__LOUIS_REDUCED_MOTION__) {
    // duration이 0으로 붕괴하면 unmount도 함께 0이 된다. 두 값이 어긋날 수 없다.
    expect(expectedMs).toBe(0);
    expect(elapsed).toBeLessThan(400);
  }
});

test("closing 상태의 root는 item activation을 다시 받지 않는다", async () => {
  const onSelect = vi.fn();
  const screen = await render(<AnchoredOverlay onSelect={onSelect} />);

  await userEvent.click(screen.getByTestId("trigger"));
  const item = screen.getByTestId("item-run").element() as HTMLElement;

  item.click();
  expect(onSelect).toHaveBeenCalledTimes(1);

  // 이 시점부터 closing이다. 같은 item을 다시 눌러도 실행되지 않는다.
  if (panelNode() !== null) {
    item.click();
    item.click();
  }
  await vi.waitFor(() => {
    expect(panelNode()).toBeNull();
  });

  expect(onSelect).toHaveBeenCalledTimes(1);
});

test("전이 순서가 reduced-motion 여부와 무관하게 동일하다", async () => {
  const screen = await render(<AnchoredOverlay />);
  await userEvent.click(screen.getByTestId("trigger"));
  const panel = screen.getByTestId("panel").element() as HTMLElement;
  expect(panel.getAttribute("data-louis-state")).toBe("open");

  // 상태 값은 **직전 상태 값**과 비교해 중복을 제거한다. 직전 항목과 비교하면 안 된다 —
  // 우리가 속성을 명령형으로 한 번 쓰고 React가 같은 값을 다시 commit하므로, 그 사이에 focus
  // 표시가 끼면 같은 상태가 두 번 기록된다. 우리가 보려는 것은 상태 전이 순서와 focus의 상대 위치다.
  const sequence: string[] = [];
  let lastState: string | null = null;
  const observer = new MutationObserver((records) => {
    for (const record of records) {
      const value = (record.target as HTMLElement).getAttribute("data-louis-state");
      if (value === null || value === lastState) continue;
      lastState = value;
      sequence.push(value);
    }
  });
  observer.observe(panel, { attributes: true, attributeFilter: ["data-louis-state"] });

  // focus 복원 시점을 같은 배열에 끼워 넣는다. 순서가 계약이므로 순서를 기록한다.
  const originalFocus = HTMLElement.prototype.focus;
  HTMLElement.prototype.focus = function focusSpy(
    this: HTMLElement,
    ...args: Parameters<HTMLElement["focus"]>
  ) {
    if (this.dataset["testid"] === "trigger") sequence.push("focus:trigger");
    return originalFocus.apply(this, args);
  };

  try {
    document.activeElement?.dispatchEvent(
      new KeyboardEvent("keydown", {
        key: "Escape",
        bubbles: true,
        cancelable: true,
        composed: true,
      }),
    );
    await vi.waitFor(() => {
      expect(panelNode()).toBeNull();
    });
    observer.takeRecords();
  } finally {
    HTMLElement.prototype.focus = originalFocus;
    observer.disconnect();
  }

  // duration만 달라지고 순서는 같다. closing이 먼저 붙고, 그 뒤에 focus가 돌아간다.
  expect(sequence).toEqual(["closing", "focus:trigger"]);
});

test("closing 진입은 React commit을 기다리지 않는다", async () => {
  const screen = await render(<AnchoredOverlay />);
  await userEvent.click(screen.getByTestId("trigger"));
  const panel = screen.getByTestId("panel").element() as HTMLElement;

  let stateAtFocus: string | null = null;
  const originalFocus = HTMLElement.prototype.focus;
  HTMLElement.prototype.focus = function focusSpy(
    this: HTMLElement,
    ...args: Parameters<HTMLElement["focus"]>
  ) {
    if (this.dataset["testid"] === "trigger") {
      stateAtFocus = panel.getAttribute("data-louis-state");
    }
    return originalFocus.apply(this, args);
  };

  try {
    document.activeElement?.dispatchEvent(
      new KeyboardEvent("keydown", {
        key: "Escape",
        bubbles: true,
        cancelable: true,
        composed: true,
      }),
    );
    await vi.waitFor(() => {
      expect(panelNode()).toBeNull();
    });
  } finally {
    HTMLElement.prototype.focus = originalFocus;
  }

  // 속성이 이미 closing이어야 base.css가 pointer를 놓은 상태다.
  // commit을 기다렸다면 여기서 "open"이 잡히고, 그 한 프레임 동안 투명한 root가
  // 아래 control의 클릭을 가로챈다.
  expect(stateAtFocus).toBe("closing");
});

test("Trigger 재클릭은 outside가 아니라 trigger reason으로 닫는다", async () => {
  const onOpenChange = vi.fn();
  const screen = await render(<AnchoredOverlay onOpenChange={onOpenChange} />);

  await userEvent.click(screen.getByTestId("trigger"));
  await expect.element(screen.getByTestId("panel")).toBeInTheDocument();

  await userEvent.click(screen.getByTestId("trigger"));
  await vi.waitFor(() => {
    expect(panelNode()).toBeNull();
  });

  const reasons = onOpenChange.mock.calls
    .filter(([open]) => open === false)
    .map((call) => call[1]);
  // Trigger가 branch member이므로 바깥 판정에 걸리지 않는다. member가 아니었다면 outside가 된다.
  expect(reasons).toEqual(["trigger"]);
});

test("소비자가 open을 직접 내리면 programmatic reason으로 닫힌다", async () => {
  const onOpenChange = vi.fn();
  const screen = await render(<AnchoredOverlay onOpenChange={onOpenChange} />);

  await userEvent.click(screen.getByTestId("trigger"));
  await userEvent.click(screen.getByTestId("close-programmatic"));
  await vi.waitFor(() => {
    expect(panelNode()).toBeNull();
  });

  const reasons = onOpenChange.mock.calls
    .filter(([open]) => open === false)
    .map((call) => call[1]);
  // escape·outside·select·trigger와 구분된다. 소비자가 이유를 알 수 있어야 한다.
  expect(reasons).toContain("programmatic");
});

test("anchored panel이 --louis-overlay-* 를 실제로 해석한다", async () => {
  const screen = await render(<AnchoredOverlay />);
  await userEvent.click(screen.getByTestId("trigger"));
  const panel = screen.getByTestId("panel").element() as HTMLElement;

  // 하부 유틸 이름은 CSS의 한 블록에만 등장하고, 나머지는 --louis-* 만 본다.
  // 이 단언이 그 seam이 실제로 연결돼 있는지를 본다 — 이름이 바뀌면 여기서 빈 문자열이 된다.
  const style = getComputedStyle(panel);
  for (const name of [
    "--louis-overlay-available-width",
    "--louis-overlay-available-height",
    "--louis-overlay-anchor-width",
    "--louis-overlay-anchor-height",
    "--louis-overlay-transform-origin",
  ]) {
    expect(style.getPropertyValue(name).trim()).not.toBe("");
  }

  // 배치 결과가 속성으로 노출돼야 컴포넌트 CSS가 방향별 모션을 쓸 수 있다.
  expect(["top", "right", "bottom", "left"]).toContain(panel.getAttribute("data-side"));
  expect(["start", "center", "end"]).toContain(panel.getAttribute("data-align"));

  // anchor 폭이 실제 Trigger 폭에서 온다.
  const trigger = screen.getByTestId("trigger").element() as HTMLElement;
  const anchorWidth = Number.parseFloat(style.getPropertyValue("--louis-overlay-anchor-width"));
  expect(anchorWidth).toBeCloseTo(trigger.getBoundingClientRect().width, 0);
});

test("anchored panel은 위치가 확정된 뒤에만 보인다", async () => {
  const screen = await render(<AnchoredOverlay />);
  await userEvent.click(screen.getByTestId("trigger"));
  const panel = screen.getByTestId("panel").element() as HTMLElement;

  // onPlaced가 open으로 넘긴다. opening 동안은 base.css가 감춘다.
  expect(panel.getAttribute("data-louis-state")).toBe("open");
  expect(getComputedStyle(panel).visibility).toBe("visible");

  // 그리고 실제로 anchor 아래에 놓인다 — 미배치 상태의 (0,0)이 아니다.
  const triggerRect = (
    screen.getByTestId("trigger").element() as HTMLElement
  ).getBoundingClientRect();
  const panelRect = panel.getBoundingClientRect();
  expect(panelRect.top).toBeGreaterThan(triggerRect.top);
});

test("presence 전이가 패널 subtree를 재마운트하지 않는다", async () => {
  const screen = await render(<AnchoredOverlay />);

  // host에 붙고 떨어지는 패널 노드를 전부 센다. 전이마다 재마운트하면 2개 이상이 된다.
  const seen = new Set<Node>();
  let added = 0;
  const observer = new MutationObserver((records) => {
    for (const record of records) {
      for (const node of Array.from(record.addedNodes)) {
        if (!(node instanceof HTMLElement)) continue;
        const panel = node.matches('[data-testid="panel"]')
          ? node
          : node.querySelector('[data-testid="panel"]');
        if (panel !== null && !seen.has(panel)) {
          seen.add(panel);
          added += 1;
        }
      }
    }
  });
  observer.observe(document.body, { childList: true, subtree: true });

  try {
    await userEvent.click(screen.getByTestId("trigger"));
    await expect.element(screen.getByTestId("panel")).toBeInTheDocument();
    // opening → open 전이가 이미 끝난 시점이다.
    expect(panelNode()?.getAttribute("data-louis-state")).toBe("open");
  } finally {
    observer.disconnect();
  }

  // 하나여야 한다. 2개면 opening 프레임이 새 노드로 대체된 것이고,
  // 그 노드는 base.css의 visibility 가드를 거치지 않은 채 open으로 삽입된다.
  expect(added).toBe(1);
});

test("패널 안의 상태가 presence 전이를 넘어 유지된다", async () => {
  const screen = await render(<AnchoredOverlay />);
  await userEvent.click(screen.getByTestId("trigger"));

  const input = screen.getByTestId("panel-input").element() as HTMLInputElement;
  await userEvent.fill(screen.getByTestId("panel-input"), "타이핑 중");
  expect(input.value).toBe("타이핑 중");

  // 패널을 유지한 채 내부를 눌러 재렌더를 유발한다. aria-disabled item은 Playwright가
  // 클릭을 거부하므로 쓰지 않는다.
  await userEvent.click(screen.getByTestId("scroll-content"));

  // 같은 노드가 살아 있어야 값도 살아 있다. 재마운트되면 여기서 빈 문자열이 된다.
  expect((screen.getByTestId("panel-input").element() as HTMLInputElement).value).toBe(
    "타이핑 중",
  );
  expect(screen.getByTestId("panel-input").element()).toBe(input);
});

test("exit 중에 다시 열어달라는 요청이 유실되지 않는다", async () => {
  const screen = await render(<AnchoredOverlay initialFocus={{ kind: "none" }} />);
  await userEvent.click(screen.getByTestId("trigger"));
  await expect.element(screen.getByTestId("panel")).toBeInTheDocument();

  // 닫기를 시작하고 같은 tick의 microtask에서 다시 연다. presence는 그때 closing이다.
  await userEvent.click(screen.getByTestId("close-then-reopen"));

  // closing → closed까지 간 뒤 재오픈 요청을 집어 올려야 한다.
  // 유실되면 소비자는 open === true인데 패널이 영영 닫힌 채로 남는다.
  // closing 패널이 아직 붙어 있는 중간 상태를 통과로 세지 않는다.
  await vi.waitFor(() => {
    expect(panelNode()?.getAttribute("data-louis-state")).toBe("open");
  });
});
