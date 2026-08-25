import { expect, test, vi } from "vitest";
import { userEvent } from "vitest/browser";
import { render } from "vitest-browser-react";

import "@klipse-design/css/tokens.css";
import "@klipse-design/css/styles.css";

import { AnchoredOverlay } from "./fixtures/anchored-overlay.js";

// design/components/menu-popover.md와 dialog.md의 keyboard·focus 계약.
// 두 project(기본 / reduced-motion)에서 자동으로 두 번 돈다 — 순서는 양쪽에서 같아야 한다.

function pressEscape(init: Partial<KeyboardEventInit> = {}): void {
  document.activeElement?.dispatchEvent(
    new KeyboardEvent("keydown", {
      key: "Escape",
      bubbles: true,
      cancelable: true,
      composed: true,
      ...init,
    }),
  );
}

async function gone(testId: string): Promise<void> {
  await vi.waitFor(() => {
    expect(document.querySelector(`[data-testid="${testId}"]`)).toBeNull();
  });
}

test("Escape 한 번은 submenu만 닫고 부모 패널은 남는다", async () => {
  const screen = await render(<AnchoredOverlay />);

  await userEvent.click(screen.getByTestId("trigger"));
  await userEvent.click(screen.getByTestId("open-submenu"));
  await expect.element(screen.getByTestId("submenu")).toBeInTheDocument();

  pressEscape();
  await gone("submenu");
  // 한 번의 Escape는 한 단계만 닫는다. 아래 layer로 내려가지 않는다.
  await expect.element(screen.getByTestId("panel")).toBeInTheDocument();

  pressEscape();
  await gone("panel");
});

test("부모와 자식이 같은 commit에 열려도 Escape는 자식을 닫는다", async () => {
  // React는 effect를 자식 → 부모 순으로 돌린다. 등록 순서로 최상위를 정하는 구현이라면
  // 여기서 **부모가** 최상위가 되어 패널이 먼저 닫힌다.
  const screen = await render(<AnchoredOverlay defaultOpen openSubmenuWithPanel />);

  await expect.element(screen.getByTestId("panel")).toBeInTheDocument();
  await expect.element(screen.getByTestId("submenu")).toBeInTheDocument();

  pressEscape();

  await gone("submenu");
  await expect.element(screen.getByTestId("panel")).toBeInTheDocument();
});

test("검출력 — fixture가 자체 Escape 리스너로 전부 닫으면 한 번에 둘 다 사라진다", async () => {
  const screen = await render(<AnchoredOverlay violate="escape-all" />);

  await userEvent.click(screen.getByTestId("trigger"));
  await userEvent.click(screen.getByTestId("open-submenu"));
  await expect.element(screen.getByTestId("submenu")).toBeInTheDocument();

  pressEscape();

  // 위 두 테스트의 "패널이 남는다"가 실제로 무언가를 보고 있다는 증거다.
  await gone("submenu");
  await gone("panel");
});

test("IME 조합 중 Escape는 overlay를 닫지 않는다", async () => {
  const screen = await render(<AnchoredOverlay />);
  await userEvent.click(screen.getByTestId("trigger"));
  await expect.element(screen.getByTestId("panel")).toBeInTheDocument();

  pressEscape({ isComposing: true });
  await expect.element(screen.getByTestId("panel")).toBeInTheDocument();

  pressEscape({ keyCode: 229 });
  await expect.element(screen.getByTestId("panel")).toBeInTheDocument();

  // 검출력 — 조합 플래그만 빼면 같은 이벤트가 닫는다.
  pressEscape();
  await gone("panel");
});

test("닫힐 때 root가 아직 DOM에 있는 상태에서 focus가 Trigger로 돌아간다", async () => {
  const screen = await render(<AnchoredOverlay />);
  await userEvent.click(screen.getByTestId("trigger"));
  await expect.element(screen.getByTestId("panel")).toBeInTheDocument();

  const trigger = screen.getByTestId("trigger").element() as HTMLElement;

  // focus 호출 시점의 DOM 상태를 직접 관측한다. MutationObserver는 microtask라
  // 이미 unmount된 뒤일 수 있어 "아직 붙어 있었는가"를 증명하지 못한다.
  const observed: Array<{ readonly target: string; readonly panelConnected: boolean }> = [];
  const originalFocus = HTMLElement.prototype.focus;
  HTMLElement.prototype.focus = function focusSpy(
    this: HTMLElement,
    ...args: Parameters<HTMLElement["focus"]>
  ) {
    observed.push({
      target: this.dataset["testid"] ?? this.tagName,
      panelConnected:
        document.querySelector('[data-testid="panel"]')?.isConnected === true,
    });
    return originalFocus.apply(this, args);
  };

  try {
    pressEscape();
    await gone("panel");
  } finally {
    HTMLElement.prototype.focus = originalFocus;
  }

  const returned = observed.find((entry) => entry.target === "trigger");
  expect(returned).toBeDefined();
  // root가 먼저 사라지면 복원 대상 계산과 focus가 모두 어긋난다. 순서가 계약이다.
  expect(returned?.panelConnected).toBe(true);
  expect(document.activeElement).toBe(trigger);
});

test("outside로 닫힐 때는 포커스를 되돌리지 않는다", async () => {
  const screen = await render(<AnchoredOverlay />);
  await userEvent.click(screen.getByTestId("trigger"));
  await expect.element(screen.getByTestId("panel")).toBeInTheDocument();

  await userEvent.click(screen.getByTestId("background"));
  await gone("panel");

  const trigger = screen.getByTestId("trigger").element();
  // 사용자가 이미 다른 곳을 눌렀다. 여기서 Trigger로 되돌리면 그 조작을 취소하는 것이 된다.
  expect(document.activeElement).not.toBe(trigger);
  expect(document.activeElement).not.toBe(document.body);
});

test("non-modal에서 Tab으로 이탈하면 닫히고 포커스는 문서의 다음 대상에 남는다", async () => {
  const onOpenChange = vi.fn();
  const screen = await render(<AnchoredOverlay onOpenChange={onOpenChange} />);

  await userEvent.click(screen.getByTestId("trigger"));
  await expect.element(screen.getByTestId("panel")).toBeInTheDocument();

  // non-modal은 trap하지 않는다. Tab이 패널 밖으로 나갈 수 있어야 한다.
  const trigger = screen.getByTestId("trigger").element();
  for (let index = 0; index < 12; index += 1) {
    if (document.querySelector('[data-testid="panel"]') === null) break;
    await userEvent.tab();
  }

  await gone("panel");
  const closeCalls = onOpenChange.mock.calls.filter(([open]) => open === false);
  // DS-D-0011 결정 4: 새 reason을 만들지 않고 outside로 매핑한다.
  expect(closeCalls[0]?.[1]).toBe("outside");
  // 포커스를 Trigger로 되돌리지 않는다. 되돌리면 사용자의 Tab을 취소하는 것이 된다.
  // Escape로 닫을 때는 정반대로 Trigger가 포커스를 받는다 — 같은 파일의 위 테스트가 그것을 고정한다.
  expect(document.activeElement).not.toBe(trigger);
});

test('initialFocus "first"는 첫 focusable로 포커스를 옮긴다', async () => {
  const screen = await render(<AnchoredOverlay initialFocus={{ kind: "first" }} />);
  await userEvent.click(screen.getByTestId("trigger"));
  await vi.waitFor(() => {
    expect((document.activeElement as HTMLElement | null)?.dataset["testid"]).toBe(
      "item-run",
    );
  });
});

test('검출력 — initialFocus "none"은 아무것도 옮기지 않는다', async () => {
  // 한 테스트에서 root를 두 번 렌더하지 않는다. act()가 겹쳐 이후 테스트까지 오염된다.
  const screen = await render(<AnchoredOverlay initialFocus={{ kind: "none" }} />);
  const trigger = screen.getByTestId("trigger").element() as HTMLElement;
  await userEvent.click(screen.getByTestId("trigger"));
  await expect.element(screen.getByTestId("panel")).toBeInTheDocument();
  // 위 테스트의 단언이 "브라우저 기본 동작"을 본 것이 아님을 보인다.
  expect(document.activeElement).toBe(trigger);
});

test("두 인스턴스를 함께 렌더해도 panel id가 겹치지 않는다", async () => {
  // initialFocus를 끈다. 켜두면 한쪽의 초기 focus가 다른 쪽에게는 focus-outside라
  // 그쪽이 즉시 닫힌다(non-modal의 정상 동작이며, 이 테스트의 주제가 아니다).
  await render(
    <div>
      <AnchoredOverlay defaultOpen initialFocus={{ kind: "none" }} />
      <AnchoredOverlay defaultOpen initialFocus={{ kind: "none" }} />
    </div>,
  );

  await vi.waitFor(() => {
    expect(document.querySelectorAll('[data-testid="panel"]')).toHaveLength(2);
  });
  const panels = Array.from(document.querySelectorAll('[data-testid="panel"]'));
  const ids = panels.map((panel) => panel.id);
  expect(ids.every((id) => id.length > 0)).toBe(true);
  expect(new Set(ids).size).toBe(2);
  // branch id도 분리돼야 stacking과 outside 판정이 인스턴스별로 성립한다.
  const branches = panels.map((panel) => panel.getAttribute("data-louis-overlay-branch"));
  expect(new Set(branches).size).toBe(2);
});

test("닫힌 panel의 자손은 Tab 순서와 문서에서 사라진다", async () => {
  const screen = await render(<AnchoredOverlay />);
  await userEvent.click(screen.getByTestId("trigger"));
  await expect.element(screen.getByTestId("item-run")).toBeInTheDocument();

  pressEscape();
  await gone("panel");

  // opacity:0 + aria-hidden으로 남겨두면 Tab으로 도달할 수 있다. 실제로 제거돼야 한다.
  expect(document.querySelector('[data-testid="item-run"]')).toBeNull();
  expect(document.querySelector('[data-testid="submenu-item"]')).toBeNull();
});

test("부모가 이미 열려 있는 자식 overlay에서 focus를 빼앗지 않는다", async () => {
  const onOpenChange = vi.fn();
  const screen = await render(
    <AnchoredOverlay defaultOpen openSubmenuWithPanel onOpenChange={onOpenChange} />,
  );

  await expect.element(screen.getByTestId("submenu")).toBeInTheDocument();

  // 부모와 자식이 같은 commit에 열리면 React는 자식 effect를 먼저 돌린다.
  // 뒤이어 부모가 초기 focus를 적용하면 focus를 자식에게서 빼앗고, 그 이동이 자식의
  // focus-outside 판정을 발화시켜 **사용자가 아무것도 하지 않았는데 자식이 닫힌다.**
  await vi.waitFor(() => {
    expect((document.activeElement as HTMLElement | null)?.dataset["testid"]).toBe(
      "submenu-item",
    );
  });

  // 잠깐 기다려도 자식이 스스로 닫히지 않아야 한다.
  await new Promise((resolve) => {
    setTimeout(resolve, 250);
  });
  await expect.element(screen.getByTestId("submenu")).toBeInTheDocument();
  await expect.element(screen.getByTestId("panel")).toBeInTheDocument();
});
