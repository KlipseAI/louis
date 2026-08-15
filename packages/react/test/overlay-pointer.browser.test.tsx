import { expect, test, vi } from "vitest";
import { page, userEvent } from "vitest/browser";
import { render } from "vitest-browser-react";

import "@klipse-design/css/tokens.css";
import "@klipse-design/css/styles.css";

import { AnchoredOverlay } from "./fixtures/anchored-overlay.js";

// design/components/menu-popover.md의 pointer 계약을 실브라우저에서 검증한다.
// 각 계약에는 검출력 짝이 하나씩 있다 — 위반 상태를 만들면 실제로 실패한다.

test("item을 클릭하면 select가 정확히 한 번 실행되고 그다음 닫힌다", async () => {
  const onSelect = vi.fn();
  const onOpenChange = vi.fn();
  const screen = await render(<AnchoredOverlay onSelect={onSelect} onOpenChange={onOpenChange} />);

  await userEvent.click(screen.getByTestId("trigger"));
  await expect.element(screen.getByTestId("panel")).toBeInTheDocument();

  await userEvent.click(screen.getByTestId("item-run"));

  expect(onSelect).toHaveBeenCalledTimes(1);
  expect(onSelect).toHaveBeenCalledWith("run");
  // 닫힘은 exit motion이 끝난 뒤다. 선택은 이미 실행됐고 닫힘만 뒤따른다.
  await vi.waitFor(() => {
    expect(document.querySelector('[data-testid="panel"]')).toBeNull();
  });
  const closeCalls = onOpenChange.mock.calls.filter(([open]) => open === false);
  // reason은 outside가 아니라 select다. 정확히 한 번만 발화한다.
  expect(closeCalls).toHaveLength(1);
  expect(closeCalls[0]?.[1]).toBe("select");
});

test("검출력 — pointerdown에서 닫으면 같은 클릭의 select가 0회가 된다", async () => {
  const onSelect = vi.fn();
  const screen = await render(<AnchoredOverlay onSelect={onSelect} violate="pointerdown-close" />);

  await userEvent.click(screen.getByTestId("trigger"));
  await expect.element(screen.getByTestId("panel")).toBeInTheDocument();

  await userEvent.click(screen.getByTestId("item-run")).catch(() => {
    // pointerdown에서 패널이 사라지면 click 대상이 없어져 actionability에서 막힌다.
  });

  // "열리지만 선택되지 않음". 규범이 차단급으로 지정한 실패이며 위 테스트가 이것을 본다.
  expect(onSelect).toHaveBeenCalledTimes(0);
});

test("React 트리 밖 Listbox option을 눌러도 부모가 먼저 닫히지 않는다", async () => {
  const onSelect = vi.fn();
  const screen = await render(<AnchoredOverlay onSelect={onSelect} closeOnSelect={false} />);

  await userEvent.click(screen.getByTestId("trigger"));
  const panel = screen.getByTestId("panel").element();
  const option = screen.getByTestId("listbox-option").element();

  // DOM 조상 관계도 React 트리 관계도 없다. 이 노드에 "내부"를 표현할 수단은 branch member뿐이다.
  expect(panel.contains(option)).toBe(false);

  await userEvent.click(screen.getByTestId("listbox-option"));

  expect(onSelect).toHaveBeenCalledTimes(1);
  await expect.element(screen.getByTestId("panel")).toBeInTheDocument();
});

test("검출력 — member 등록을 빼면 같은 클릭이 바깥으로 판정돼 패널이 닫힌다", async () => {
  const screen = await render(<AnchoredOverlay closeOnSelect={false} violate="unregister-members" />);

  await userEvent.click(screen.getByTestId("trigger"));
  await expect.element(screen.getByTestId("panel")).toBeInTheDocument();

  await userEvent.click(screen.getByTestId("listbox-option"));

  await vi.waitFor(() => {
    expect(document.querySelector('[data-testid="panel"]')).toBeNull();
  });
});

test("closeOnSelect가 false면 패널이 유지된다", async () => {
  const onSelect = vi.fn();
  const screen = await render(<AnchoredOverlay onSelect={onSelect} closeOnSelect={false} />);

  await userEvent.click(screen.getByTestId("trigger"));
  await userEvent.click(screen.getByTestId("item-run"));

  expect(onSelect).toHaveBeenCalledTimes(1);
  await expect.element(screen.getByTestId("panel")).toBeInTheDocument();
});

test("disabled와 busy item은 실행되지도 닫히지도 않는다", async () => {
  const onSelect = vi.fn();
  const screen = await render(<AnchoredOverlay onSelect={onSelect} />);

  await userEvent.click(screen.getByTestId("trigger"));

  // Button과 같은 두 층 검증이다. 실제 포인터는 actionability에서 막히고,
  // 프로그램적 click은 컴포넌트가 막는다. 한 층만 보면 다른 층의 회귀를 놓친다.
  await expect(
    userEvent.click(screen.getByTestId("item-disabled"), { timeout: 700 }),
  ).rejects.toThrow();

  (screen.getByTestId("item-disabled").element() as HTMLElement).click();
  (screen.getByTestId("item-busy").element() as HTMLElement).click();

  expect(onSelect).toHaveBeenCalledTimes(0);
  // menu-popover.md: disabled item 클릭은 메뉴를 닫지 않는다.
  await expect.element(screen.getByTestId("panel")).toBeInTheDocument();
});

test("바깥 클릭은 패널만 닫고 배경 액션을 실행하지 않는다", async () => {
  const onBackground = vi.fn();
  const onOpenChange = vi.fn();
  const screen = await render(
    <AnchoredOverlay onBackground={onBackground} onOpenChange={onOpenChange} />,
  );

  await userEvent.click(screen.getByTestId("trigger"));
  await expect.element(screen.getByTestId("panel")).toBeInTheDocument();

  await userEvent.click(screen.getByTestId("background"));

  await vi.waitFor(() => {
    expect(document.querySelector('[data-testid="panel"]')).toBeNull();
  });
  // 그 클릭은 배경에 도달하기 전에 소비된다.
  expect(onBackground).toHaveBeenCalledTimes(0);
  const closeCalls = onOpenChange.mock.calls.filter(([open]) => open === false);
  expect(closeCalls[0]?.[1]).toBe("outside");
});

test("검출력 — passthrough를 켜면 같은 클릭이 배경 액션을 실행한다", async () => {
  const onBackground = vi.fn();
  const screen = await render(
    <AnchoredOverlay onBackground={onBackground} outsidePointerPassthrough />,
  );

  await userEvent.click(screen.getByTestId("trigger"));
  await userEvent.click(screen.getByTestId("background"));

  // 위 테스트의 0회 단언이 실제로 배경 실행을 보고 있다는 증거다.
  expect(onBackground).toHaveBeenCalledTimes(1);
});

test("패널 내부 스크롤 영역 클릭을 바깥으로 오판하지 않는다", async () => {
  const screen = await render(<AnchoredOverlay />);

  await userEvent.click(screen.getByTestId("trigger"));
  await userEvent.click(screen.getByTestId("scroll-content"));

  await expect.element(screen.getByTestId("panel")).toBeInTheDocument();
});

test("submenu의 바깥 클릭이 submenu만 닫고 부모 패널은 유지한다", async () => {
  const screen = await render(<AnchoredOverlay />);

  await userEvent.click(screen.getByTestId("trigger"));
  await userEvent.click(screen.getByTestId("open-submenu"));
  await expect.element(screen.getByTestId("submenu")).toBeInTheDocument();

  // 부모 패널 안이지만 submenu 밖이다. 최상위(submenu) 하나만 닫혀야 한다.
  await userEvent.click(screen.getByTestId("scroll-content"));

  await vi.waitFor(() => {
    expect(document.querySelector('[data-testid="submenu"]')).toBeNull();
  });
  await expect.element(screen.getByTestId("panel")).toBeInTheDocument();
});

test("closing 중인 패널은 그 좌표의 아래 control 클릭을 가로채지 않는다", async () => {
  const screen = await render(<AnchoredOverlay />);

  await userEvent.click(screen.getByTestId("trigger"));
  const panel = screen.getByTestId("panel").element() as HTMLElement;

  // closing 진입은 React commit을 기다리지 않는다. 속성이 즉시 붙고 CSS가 pointer를 놓는다.
  panel.setAttribute("data-kds-state", "closing");
  expect(getComputedStyle(panel).pointerEvents).toBe("none");
});

test("검출력 — closing 중에도 pointer를 붙들면 아래 control이 막힌다", async () => {
  const screen = await render(<AnchoredOverlay violate="closing-keeps-pointer" />);

  await userEvent.click(screen.getByTestId("trigger"));
  const panel = screen.getByTestId("panel").element() as HTMLElement;
  panel.setAttribute("data-kds-state", "closing");

  // 인라인 style이 CSS를 이긴다. 위 테스트의 단언이 실제로 계산값을 보고 있다는 증거다.
  expect(getComputedStyle(panel).pointerEvents).toBe("auto");
});

test("열린 Trigger를 다시 눌러 닫아도 Trigger가 pointer를 잃지 않는다", async () => {
  const screen = await render(<AnchoredOverlay />);

  await userEvent.click(screen.getByTestId("trigger"));
  await expect.element(screen.getByTestId("panel")).toBeInTheDocument();

  const trigger = screen.getByTestId("trigger").element() as HTMLElement;
  expect(getComputedStyle(trigger).pointerEvents).not.toBe("none");

  await userEvent.click(screen.getByTestId("trigger"));
  await vi.waitFor(() => {
    expect(document.querySelector('[data-testid="panel"]')).toBeNull();
  });
  expect(getComputedStyle(trigger).pointerEvents).not.toBe("none");
  // 닫은 뒤에도 다시 열 수 있어야 한다. Trigger가 죽으면 이 단언이 잡는다.
  await userEvent.click(screen.getByTestId("trigger"));
  await expect.element(screen.getByTestId("panel")).toBeInTheDocument();
});

test("overlay는 Provider가 만든 host 안에만 마운트된다", async () => {
  const screen = await render(<AnchoredOverlay />);
  await userEvent.click(screen.getByTestId("trigger"));

  const panel = screen.getByTestId("panel").element();
  const host = panel.closest("[data-kds-overlay-root]");
  expect(host).not.toBeNull();
  expect(host?.getAttribute("data-kds-overlay-root")).toBe("non-modal");
  // host를 벗어나면 inert 경계와 stacking 기준에서 동시에 벗어난다.
  // host가 falsy일 때 조용히 body로 폴백하는 경로를 여기서 막는다.
  expect(host?.parentElement).toBe(document.body);
  expect(panel.closest("body > [data-testid]")).toBeNull();
});

test("page 헬퍼가 실제 브라우저 컨텍스트를 쓰고 있다", () => {
  // jsdom·happy-dom이면 여기서부터 거짓 통과가 시작된다. DS-D-0005의 환경 계약이다.
  expect(page).toBeDefined();
  expect(window.navigator.userAgent).toMatch(/Chrome|Chromium|HeadlessChrome/);
});
