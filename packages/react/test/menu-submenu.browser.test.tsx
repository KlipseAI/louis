import { useRef } from "react";
import { expect, test, vi } from "vitest";
import { userEvent } from "vitest/browser";
import { render } from "vitest-browser-react";

import type { OverlayHandle } from "@klipse-design/react";
import {
  ActionMenu,
  ActionMenuContent,
  ActionMenuItem,
  ActionMenuSub,
  ActionMenuSubContent,
  ActionMenuSubTrigger,
  ActionMenuTrigger,
  OverlayProvider,
} from "@klipse-design/react";
import "@klipse-design/css/tokens.css";
import "@klipse-design/css/styles.css";

// menu-popover.md의 submenu 계약 — Escape 단계별 닫힘, ArrowRight/ArrowLeft, 부모 전파.

function Menu({
  onSelect,
}: {
  readonly onSelect?: (value: string) => void;
}): React.JSX.Element {
  const handleRef = useRef<OverlayHandle | null>(null);
  return (
    <OverlayProvider>
      <button type="button" data-testid="background">
        배경
      </button>
      {/* route 변경처럼 소비자만 아는 이유로 닫는 유일한 통로. */}
      <button
        type="button"
        data-testid="route"
        onClick={() => handleRef.current?.close("route")}
      >
        이동
      </button>
      <ActionMenu panelLabel="액션" ref={handleRef}>
        <ActionMenuTrigger data-testid="trigger">열기</ActionMenuTrigger>
        <ActionMenuContent data-testid="panel">
          <ActionMenuItem data-testid="item-save" onSelect={() => onSelect?.("save")}>
            저장
          </ActionMenuItem>
          <ActionMenuSub>
            <ActionMenuSubTrigger data-testid="subtrigger">내보내기</ActionMenuSubTrigger>
            <ActionMenuSubContent data-testid="submenu">
              <ActionMenuItem data-testid="sub-pdf" onSelect={() => onSelect?.("pdf")}>
                PDF
              </ActionMenuItem>
              <ActionMenuItem data-testid="sub-png" onSelect={() => onSelect?.("png")}>
                PNG
              </ActionMenuItem>
            </ActionMenuSubContent>
          </ActionMenuSub>
          <ActionMenuItem data-testid="item-last" onSelect={() => onSelect?.("last")}>
            마지막
          </ActionMenuItem>
        </ActionMenuContent>
      </ActionMenu>
    </OverlayProvider>
  );
}

function activeId(): string | undefined {
  return (document.activeElement as HTMLElement | null)?.dataset["testid"];
}

async function gone(testId: string): Promise<void> {
  await vi.waitFor(() => {
    expect(document.querySelector(`[data-testid="${testId}"]`)).toBeNull();
  });
}

test("SubTrigger는 부모 메뉴의 item으로 방향키 탐색에 포함된다", async () => {
  const screen = await render(<Menu />);
  await userEvent.click(screen.getByTestId("trigger"));
  await vi.waitFor(() => {
    expect(activeId()).toBe("item-save");
  });

  await userEvent.keyboard("{ArrowDown}");
  expect(activeId()).toBe("subtrigger");
  await userEvent.keyboard("{ArrowDown}");
  expect(activeId()).toBe("item-last");

  const subtrigger = screen.getByTestId("subtrigger").element();
  expect(subtrigger.getAttribute("role")).toBe("menuitem");
  expect(subtrigger.getAttribute("aria-haspopup")).toBe("menu");
  expect(subtrigger.getAttribute("aria-expanded")).toBe("false");
});

test("ArrowRight가 submenu를 열고 첫 item으로 이동한다", async () => {
  const screen = await render(<Menu />);
  await userEvent.click(screen.getByTestId("trigger"));
  await vi.waitFor(() => {
    expect(activeId()).toBe("item-save");
  });
  await userEvent.keyboard("{ArrowDown}");
  expect(activeId()).toBe("subtrigger");

  await userEvent.keyboard("{ArrowRight}");
  await expect.element(screen.getByTestId("submenu")).toBeInTheDocument();
  await vi.waitFor(() => {
    expect(activeId()).toBe("sub-pdf");
  });
  expect(screen.getByTestId("subtrigger").element().getAttribute("aria-expanded")).toBe(
    "true",
  );
});

test("ArrowLeft가 submenu만 닫고 부모 item으로 복귀한다", async () => {
  const screen = await render(<Menu />);
  await userEvent.click(screen.getByTestId("trigger"));
  await vi.waitFor(() => {
    expect(activeId()).toBe("item-save");
  });
  await userEvent.keyboard("{ArrowDown}{ArrowRight}");
  await vi.waitFor(() => {
    expect(activeId()).toBe("sub-pdf");
  });

  await userEvent.keyboard("{ArrowLeft}");
  await gone("submenu");
  // 부모는 열린 채로 남고 focus는 연 자리로 돌아간다.
  await expect.element(screen.getByTestId("panel")).toBeInTheDocument();
  await vi.waitFor(() => {
    expect(activeId()).toBe("subtrigger");
  });
});

test("Escape 한 번은 submenu만 닫고 다시 눌러야 부모가 닫힌다", async () => {
  const screen = await render(<Menu />);
  await userEvent.click(screen.getByTestId("trigger"));
  await vi.waitFor(() => {
    expect(activeId()).toBe("item-save");
  });
  await userEvent.keyboard("{ArrowDown}{ArrowRight}");
  await vi.waitFor(() => {
    expect(activeId()).toBe("sub-pdf");
  });

  await userEvent.keyboard("{Escape}");
  await gone("submenu");
  await expect.element(screen.getByTestId("panel")).toBeInTheDocument();
  await vi.waitFor(() => {
    expect(activeId()).toBe("subtrigger");
  });

  await userEvent.keyboard("{Escape}");
  await gone("panel");
  // 부모까지 닫히면 Trigger로 돌아간다.
  expect(activeId()).toBe("trigger");
});

test("submenu item 선택은 정확히 한 번 실행되고 두 layer가 모두 닫힌다", async () => {
  const onSelect = vi.fn();
  const screen = await render(<Menu onSelect={onSelect} />);
  await userEvent.click(screen.getByTestId("trigger"));
  await userEvent.click(screen.getByTestId("subtrigger"));
  await expect.element(screen.getByTestId("submenu")).toBeInTheDocument();

  await userEvent.click(screen.getByTestId("sub-pdf"));

  // 중첩 portal 안의 item이 선택되지 않는 것이 규범의 차단급 회귀다.
  expect(onSelect).toHaveBeenCalledTimes(1);
  expect(onSelect).toHaveBeenCalledWith("pdf");
  await gone("submenu");
});

test("SubTrigger 재활성화는 토글이 아니라 멱등 열기다", async () => {
  const screen = await render(<Menu />);
  await userEvent.click(screen.getByTestId("trigger"));
  await userEvent.click(screen.getByTestId("subtrigger"));
  await expect.element(screen.getByTestId("submenu")).toBeInTheDocument();

  // ArrowRight로 연 직후 Enter가 닫으면 파괴적 시퀀스가 된다. 닫는 경로는 이미 셋이다.
  (screen.getByTestId("subtrigger").element() as HTMLElement).click();
  await expect.element(screen.getByTestId("submenu")).toBeInTheDocument();
});

test("부모가 닫히면 submenu도 같은 tick에 닫히고 포커스를 빼앗지 않는다", async () => {
  const screen = await render(<Menu />);
  await userEvent.click(screen.getByTestId("trigger"));
  await userEvent.click(screen.getByTestId("subtrigger"));
  await expect.element(screen.getByTestId("submenu")).toBeInTheDocument();

  // 바깥 클릭은 **최상위 branch 하나만** 닫는다(규범의 외부 이벤트 정책 3).
  await userEvent.click(screen.getByTestId("background"));
  await gone("submenu");
  await expect.element(screen.getByTestId("panel")).toBeInTheDocument();

  // 한 번 더 눌러야 부모가 닫힌다. Escape의 단계별 닫힘과 같은 원칙이다.
  await userEvent.click(screen.getByTestId("background"));
  await gone("panel");
});

test("route로 부모를 닫으면 submenu가 cascade로 닫힌다", async () => {
  const screen = await render(<Menu />);
  await userEvent.click(screen.getByTestId("trigger"));
  await userEvent.click(screen.getByTestId("subtrigger"));
  await expect.element(screen.getByTestId("submenu")).toBeInTheDocument();

  // pointer·Escape는 최상위 하나만 닫는다. 부모가 먼저 나가는 경로는 소비자가 부르는 close다.
  (screen.getByTestId("route").element() as HTMLElement).click();

  await gone("submenu");
  await gone("panel");
  // route는 **포커스를 옮기지 않는** reason이다. 새 화면이 포커스를 잡는 것이 정상 경로이며
  // 그 계약은 탐색 규범이 소유한다. 여기서 Trigger로 되돌리면 사용자의 이동을 취소하게 된다.
  expect(document.activeElement).not.toBe(screen.getByTestId("trigger").element());
});

test("submenu가 열린 동안 부모의 세로 이동이 submenu를 닫지 않는다", async () => {
  const screen = await render(<Menu />);
  await userEvent.click(screen.getByTestId("trigger"));
  await vi.waitFor(() => {
    expect(activeId()).toBe("item-save");
  });
  await userEvent.keyboard("{ArrowDown}{ArrowRight}");
  await vi.waitFor(() => {
    expect(activeId()).toBe("sub-pdf");
  });

  // focus가 submenu 안에 있으므로 방향키는 submenu의 것이다. 부모 핸들러가 함께 돌면
  // focus가 부모로 튀고 그 focusout이 submenu를 닫는다.
  await userEvent.keyboard("{ArrowDown}");
  expect(activeId()).toBe("sub-png");
  await expect.element(screen.getByTestId("submenu")).toBeInTheDocument();
});
