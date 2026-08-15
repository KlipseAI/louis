import axe from "axe-core";
import { expect, test, vi } from "vitest";
import { userEvent } from "vitest/browser";
import { render } from "vitest-browser-react";

import "@klipse-design/css/tokens.css";
import "@klipse-design/css/styles.css";

import { ModalOverlay } from "./fixtures/modal-overlay.js";

// design/components/dialog.md와 foundations/elevation-layer.md의 격리·stacking 계약.

function node(testId: string): HTMLElement | null {
  return document.querySelector(`[data-testid="${testId}"]`);
}

async function gone(testId: string): Promise<void> {
  await vi.waitFor(() => {
    expect(node(testId)).toBeNull();
  });
}

function pressEscape(): void {
  document.activeElement?.dispatchEvent(
    new KeyboardEvent("keydown", {
      key: "Escape",
      bubbles: true,
      cancelable: true,
      composed: true,
    }),
  );
}

test("modal이 열린 동안 배경은 pointer·keyboard·a11y tree에서 모두 차단된다", async () => {
  const onBackground = vi.fn();
  const screen = await render(<ModalOverlay onBackground={onBackground} />);
  const background = node("background") as HTMLElement;

  // 열기 **전** 기준선. 아래 단언들이 공허하지 않다는 것을 같은 요소·같은 방법으로 보인다.
  // trap과 inert가 둘 다 걸린 상태에서는 한쪽만 꺼서 비교할 수 없다 — focus scope가
  // 이탈 자체를 취소하므로 inert를 풀어도 focus가 배경에 닿지 않기 때문이다.
  // 그래서 대조군을 "닫힌 상태"로 잡는다.
  let reached = 0;
  const countFocus = (): void => {
    reached += 1;
  };
  background.addEventListener("focusin", countFocus);
  try {
    background.focus();
    expect(reached).toBe(1);
    await userEvent.click(screen.getByTestId("background"));
    expect(onBackground).toHaveBeenCalledTimes(1);
    expect(background.closest("[inert]")).toBeNull();

    await userEvent.click(screen.getByTestId("trigger"));
    await expect.element(screen.getByTestId("modal-1")).toBeInTheDocument();
    onBackground.mockClear();
    reached = 0;

    // 1층 — pointer.
    await expect(
      userEvent.click(screen.getByTestId("background"), { timeout: 700 }),
    ).rejects.toThrow();
    expect(onBackground).toHaveBeenCalledTimes(0);

    // 2층 — keyboard. Tab으로도, 직접 focus()로도 배경에 닿지 못한다.
    for (let index = 0; index < 8; index += 1) {
      await userEvent.tab();
      expect(document.activeElement).not.toBe(background);
    }
    background.focus();
    expect(reached).toBe(0);

    // 3층 — accessibility tree.
    const results = await axe.run(document.body, {
      runOnly: { type: "rule", values: ["aria-hidden-focus"] },
    });
    expect(results.violations).toEqual([]);
    // 차단 수단이 inert임을 고정한다. aria-hidden + pointer-events 조합으로 흉내 내면
    // 세 축 중 하나가 반드시 새고, 어느 축이 샜는지는 셋을 다 보지 않는 한 드러나지 않는다.
    expect(background.closest("[inert]")).not.toBeNull();

    // 닫히면 정확히 원래대로 돌아온다. 걸어둔 inert가 남으면 앱 전체가 죽는다.
    pressEscape();
    await gone("modal-1");
    expect(background.closest("[inert]")).toBeNull();
    background.focus();
    expect(reached).toBe(1);
    await userEvent.click(screen.getByTestId("background"));
    expect(onBackground).toHaveBeenCalledTimes(1);
  } finally {
    background.removeEventListener("focusin", countFocus);
  }
});

test("Dialog 안에서 연 Popover는 별도 host에 있어도 inert 되지 않는다", async () => {
  const onPopoverSelect = vi.fn();
  const screen = await render(<ModalOverlay onPopoverSelect={onPopoverSelect} />);

  await userEvent.click(screen.getByTestId("trigger"));
  await userEvent.click(screen.getByTestId("open-popover"));
  await expect.element(screen.getByTestId("inner-popover")).toBeInTheDocument();

  // popover는 non-modal host에 있다. modal host와 다른 subtree다.
  const popoverHost = (node("inner-popover") as HTMLElement).closest(
    "[data-kds-overlay-root]",
  );
  expect(popoverHost?.getAttribute("data-kds-overlay-root")).toBe("non-modal");
  expect(
    (node("modal-1") as HTMLElement).closest("[data-kds-overlay-root]"),
  ).not.toBe(popoverHost);

  await userEvent.click(screen.getByTestId("popover-item"));

  expect(onPopoverSelect).toHaveBeenCalledTimes(1);
  // popover만 닫히고 Dialog는 유지된다.
  await gone("inner-popover");
  await expect.element(screen.getByTestId("modal-1")).toBeInTheDocument();
});

test("검출력 — non-modal host 면제를 끄면 Dialog 안 Popover가 도달 불가가 된다", async () => {
  const onPopoverSelect = vi.fn();
  const screen = await render(
    <ModalOverlay onPopoverSelect={onPopoverSelect} violate="inert-all-roots" />,
  );

  await userEvent.click(screen.getByTestId("trigger"));
  await userEvent.click(screen.getByTestId("open-popover"));
  await expect.element(screen.getByTestId("inner-popover")).toBeInTheDocument();

  // "열리지만 선택되지 않음" — 규범이 차단급 회귀로 지정한 증상 그 자체다.
  await expect(
    userEvent.click(screen.getByTestId("popover-item"), { timeout: 700 }),
  ).rejects.toThrow();
  expect(onPopoverSelect).toHaveBeenCalledTimes(0);
});

test("Escape는 중첩 modal 중 최상위 하나만 닫는다", async () => {
  const screen = await render(<ModalOverlay />);

  await userEvent.click(screen.getByTestId("trigger"));
  await userEvent.click(screen.getByTestId("open-modal-2"));
  await expect.element(screen.getByTestId("modal-2")).toBeInTheDocument();

  pressEscape();
  await gone("modal-2");
  await expect.element(screen.getByTestId("modal-1")).toBeInTheDocument();

  pressEscape();
  await gone("modal-1");
});

test("아래 modal의 backdrop은 위 modal이 열려 있는 동안 dismiss를 받지 않는다", async () => {
  const onOpenChange = vi.fn();
  const screen = await render(<ModalOverlay onOpenChange={onOpenChange} />);

  await userEvent.click(screen.getByTestId("trigger"));
  await userEvent.click(screen.getByTestId("open-modal-2"));
  await expect.element(screen.getByTestId("modal-2")).toBeInTheDocument();

  // 중첩 Dialog는 같은 host에 나란히 들어간다. host 단위 격리만으로는 아래 Dialog가 살아 있다.
  const lowerAction = node("modal-1-action") as HTMLElement;
  expect(lowerAction.closest("[inert]")).not.toBeNull();
  expect(node("modal-2-action")?.closest("[inert]")).toBeNull();

  // 두 번째 modal의 backdrop을 누른다 — 자기 자신만 닫힌다.
  const secondRoot = node("modal-2-root") as HTMLElement;
  const rect = secondRoot.getBoundingClientRect();
  await userEvent.click(secondRoot, {
    position: { x: Math.round(rect.width / 2), y: 8 },
  });

  await gone("modal-2");
  await expect.element(screen.getByTestId("modal-1")).toBeInTheDocument();
  // 위가 닫히면 아래가 다시 조작 가능해진다. 격리가 남으면 앱이 잠긴다.
  expect(lowerAction.closest("[inert]")).toBeNull();
  // 아래 modal은 어떤 close 통지도 받지 않는다.
  expect(onOpenChange.mock.calls.filter(([open]) => open === false)).toEqual([]);
});

test("backdrop 클릭은 dismiss하지만 Surface 클릭은 dismiss하지 않는다", async () => {
  const screen = await render(<ModalOverlay />);
  await userEvent.click(screen.getByTestId("trigger"));
  await expect.element(screen.getByTestId("modal-1")).toBeInTheDocument();

  // Surface 안을 눌러도 닫히지 않는다.
  await userEvent.click(screen.getByTestId("modal-1-action"));
  await expect.element(screen.getByTestId("modal-1")).toBeInTheDocument();

  const root = node("modal-1-root") as HTMLElement;
  const rect = root.getBoundingClientRect();
  await userEvent.click(root, { position: { x: Math.round(rect.width / 2), y: 8 } });
  await gone("modal-1");
});

test("검출력 — target 검사를 빼면 Surface 클릭에도 닫힌다", async () => {
  const screen = await render(<ModalOverlay violate="backdrop-any-target" />);
  await userEvent.click(screen.getByTestId("trigger"));
  await expect.element(screen.getByTestId("modal-1")).toBeInTheDocument();

  await userEvent.click(screen.getByTestId("modal-1-action"));
  // 위 테스트의 "닫히지 않는다"가 실제로 무언가를 보고 있다는 증거다.
  await gone("modal-1");
});

test("dismissLocked인 Dialog는 Escape와 backdrop 어느 쪽으로도 닫히지 않는다", async () => {
  const screen = await render(<ModalOverlay dismissLocked closeOnEscape={false} />);
  await userEvent.click(screen.getByTestId("trigger"));
  await expect.element(screen.getByTestId("modal-1")).toBeInTheDocument();

  pressEscape();
  await expect.element(screen.getByTestId("modal-1")).toBeInTheDocument();

  // 검출력 — 잠금을 풀면 같은 Escape가 닫는다.
  screen.rerender(<ModalOverlay defaultOpen />);
  await expect.element(screen.getByTestId("modal-1")).toBeInTheDocument();
  pressEscape();
  await gone("modal-1");
});

test("modal panel의 z-index가 숫자가 아니라 layer 토큰으로 해석된다", async () => {
  const screen = await render(<ModalOverlay />);
  await userEvent.click(screen.getByTestId("trigger"));
  await userEvent.click(screen.getByTestId("open-popover"));
  await expect.element(screen.getByTestId("inner-popover")).toBeInTheDocument();

  const root = getComputedStyle(document.documentElement);
  const modalToken = root.getPropertyValue("--kds-layer-modal").trim();
  const popoverToken = root.getPropertyValue("--kds-layer-popover").trim();

  expect(getComputedStyle(node("modal-1-root") as HTMLElement).zIndex).toBe(modalToken);
  // 자손 branch는 부모 layer를 물려받는다. popover 값 그대로였다면 Dialog 뒤에 깔려
  // "보이지만 누를 수 없는" 상태가 된다 — 바로 위 테스트가 그 상태를 잡는다.
  expect(getComputedStyle(node("inner-popover") as HTMLElement).zIndex).toBe(modalToken);
  // elevation과 무관한 별도 축이다. 숫자를 직접 쓰면 두 축이 섞인다.
  expect(Number.parseFloat(modalToken)).toBeGreaterThan(Number.parseFloat(popoverToken));
});

test("scroll lock이 owner의 인라인 style을 원래대로 복원한다", async () => {
  const screen = await render(<ModalOverlay />);
  const owner = document.body;
  const before = owner.getAttribute("style");
  const hadStyle = owner.hasAttribute("style");

  await userEvent.click(screen.getByTestId("trigger"));
  await expect.element(screen.getByTestId("modal-1")).toBeInTheDocument();

  expect(owner.getAttribute("data-kds-scroll-locked")).toBe("true");
  expect(getComputedStyle(owner).overflow).toBe("hidden");

  pressEscape();
  await gone("modal-1");

  // "복원"이 값을 지우는 동작이 되면 안 된다. 속성 유무까지 원래대로여야 한다.
  expect(owner.hasAttribute("data-kds-scroll-locked")).toBe(false);
  expect(owner.hasAttribute("style")).toBe(hadStyle);
  expect(owner.getAttribute("style")).toBe(before);
});

test("중첩 modal에서 scroll lock은 refcount로 유지되고 마지막에만 풀린다", async () => {
  const screen = await render(<ModalOverlay />);
  const owner = document.body;

  await userEvent.click(screen.getByTestId("trigger"));
  await userEvent.click(screen.getByTestId("open-modal-2"));
  await expect.element(screen.getByTestId("modal-2")).toBeInTheDocument();
  expect(owner.getAttribute("data-kds-scroll-locked")).toBe("true");

  pressEscape();
  await gone("modal-2");
  // 위 modal이 닫혀도 아래 modal이 아직 잠그고 있다.
  expect(owner.getAttribute("data-kds-scroll-locked")).toBe("true");

  pressEscape();
  await gone("modal-1");
  expect(owner.hasAttribute("data-kds-scroll-locked")).toBe(false);
});

test("잠긴 동안 스크롤이 옮겨져도 닫으면 원래 위치로 돌아온다", async () => {
  const screen = await render(<ModalOverlay />);
  const scrolling = document.scrollingElement as HTMLElement;

  // 문서를 실제로 스크롤 가능하게 만든 뒤 위치를 잡는다.
  window.scrollTo(0, 240);
  const before = scrolling.scrollTop;
  expect(before).toBeGreaterThan(0);

  try {
    // Playwright의 클릭은 대상을 화면으로 스크롤한 뒤 누른다. 그러면 잠금 시점의 위치가
    // 바뀌어 이 테스트가 검증하려는 값 자체가 사라진다. 프로그램적 클릭을 쓴다.
    (screen.getByTestId("trigger").element() as HTMLElement).click();
    await expect.element(screen.getByTestId("modal-1")).toBeInTheDocument();

    // 잠긴 동안 코드가 스스로 스크롤을 옮기는 경우가 복원이 실제로 필요한 유일한 상황이다.
    // body를 owner로 읽고 쓰면 여기서 0을 저장했다가 0을 되돌려 아무 일도 하지 않는다.
    scrolling.scrollTop = 0;

    pressEscape();
    await gone("modal-1");

    expect(scrolling.scrollTop).toBe(before);
  } finally {
    window.scrollTo(0, 0);
  }
});
