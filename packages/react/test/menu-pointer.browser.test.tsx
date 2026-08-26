import axe from "axe-core";
import { expect, test, vi } from "vitest";
import { userEvent } from "vitest/browser";
import { render } from "vitest-browser-react";

import { Button } from "@klipse-design/react";
import {
  ActionMenu,
  ActionMenuContent,
  ActionMenuGroup,
  ActionMenuItem,
  ActionMenuLinkItem,
  ActionMenuTrigger,
  CompositePopover,
  CompositePopoverContent,
  CompositePopoverTitle,
  CompositePopoverTrigger,
  OverlayProvider,
  type OverlayCloseReason,
} from "@klipse-design/react";
import "@klipse-design/css/tokens.css";
import "@klipse-design/css/styles.css";

// menu-popover.md의 Pointer regression과 Accessibility 절. public API만 쓴다.

function gone(testId: string): Promise<void> {
  return vi.waitFor(() => {
    expect(document.querySelector(`[data-testid="${testId}"]`)).toBeNull();
  });
}

interface MenuProps {
  readonly onSelect?: (value: string) => void;
  readonly onBackground?: () => void;
  readonly onOpenChange?: (open: boolean, reason: OverlayCloseReason) => void;
  readonly disabledItems?: "skip" | "announce";
  readonly busy?: boolean;
  readonly checked?: boolean;
}

function Menu({
  onSelect,
  onBackground,
  onOpenChange,
  disabledItems = "announce",
  busy = false,
  checked,
}: MenuProps): React.JSX.Element {
  return (
    <OverlayProvider>
      <button type="button" data-testid="background" onClick={() => onBackground?.()}>
        배경 액션
      </button>
      <ActionMenu
        panelLabel="액션"
        disabledItems={disabledItems}
        {...(onOpenChange === undefined ? {} : { onOpenChange })}
      >
        <ActionMenuTrigger data-testid="trigger">열기</ActionMenuTrigger>
        <ActionMenuContent data-testid="panel">
          <ActionMenuGroup label="파일" data-testid="group">
            <ActionMenuItem data-testid="item-save" onSelect={() => onSelect?.("save")}>
              저장
            </ActionMenuItem>
            <ActionMenuLinkItem
              data-testid="item-link"
              href="#docs"
              onSelect={() => onSelect?.("link")}
            >
              문서 열기
            </ActionMenuLinkItem>
          </ActionMenuGroup>
          <ActionMenuItem
            data-testid="item-theme"
            role="menuitemcheckbox"
            checked={checked ?? false}
            closeOnSelect={false}
            onSelect={() => onSelect?.("theme")}
          >
            다크 테마
          </ActionMenuItem>
          <ActionMenuItem
            data-testid="item-disabled"
            disabled
            disabledReason="권한이 없습니다"
            onSelect={() => onSelect?.("disabled")}
          >
            비활성
          </ActionMenuItem>
          <ActionMenuItem
            data-testid="item-busy"
            busy={busy}
            onSelect={() => onSelect?.("busy")}
          >
            진행 중
          </ActionMenuItem>
        </ActionMenuContent>
      </ActionMenu>
    </OverlayProvider>
  );
}

test("item 클릭이 콜백을 정확히 한 번 실행하고 그다음 닫는다", async () => {
  const onSelect = vi.fn();
  const onOpenChange = vi.fn();
  const screen = await render(<Menu onSelect={onSelect} onOpenChange={onOpenChange} />);

  await userEvent.click(screen.getByTestId("trigger"));
  await expect.element(screen.getByTestId("panel")).toBeInTheDocument();
  await userEvent.click(screen.getByTestId("item-save"));

  expect(onSelect).toHaveBeenCalledTimes(1);
  await gone("panel");
  const closes = onOpenChange.mock.calls.filter(([open]) => open === false);
  expect(closes).toHaveLength(1);
  expect(closes[0]?.[1]).toBe("select");
});

test("링크 item도 pointer에서 한 번만 실행된다", async () => {
  const onSelect = vi.fn();
  const screen = await render(<Menu onSelect={onSelect} />);
  await userEvent.click(screen.getByTestId("trigger"));

  const link = screen.getByTestId("item-link").element() as HTMLAnchorElement;
  // 링크는 button으로 흉내 내지 않는다 — 새 탭 열기와 주소 복사가 유지돼야 한다.
  expect(link.tagName).toBe("A");
  expect(link.getAttribute("href")).toBe("#docs");

  await userEvent.click(screen.getByTestId("item-link"));
  expect(onSelect).toHaveBeenCalledTimes(1);
});

test("checkbox item은 패널을 유지하고 선택 상태만 바꾼다", async () => {
  const onSelect = vi.fn();
  const screen = await render(<Menu onSelect={onSelect} />);
  await userEvent.click(screen.getByTestId("trigger"));

  const item = screen.getByTestId("item-theme").element();
  expect(item.getAttribute("role")).toBe("menuitemcheckbox");
  expect(item.getAttribute("aria-checked")).toBe("false");

  await userEvent.click(screen.getByTestId("item-theme"));
  expect(onSelect).toHaveBeenCalledTimes(1);
  // closeOnSelect=false — 테마 세그먼트처럼 계속 조정하는 항목이다.
  await expect.element(screen.getByTestId("panel")).toBeInTheDocument();
});

test("disabled item은 실행되지도 닫히지도 않고 이유가 읽힌다", async () => {
  const onSelect = vi.fn();
  const screen = await render(<Menu onSelect={onSelect} />);
  await userEvent.click(screen.getByTestId("trigger"));

  const item = screen.getByTestId("item-disabled").element() as HTMLElement;
  expect(item.getAttribute("aria-disabled")).toBe("true");
  const describedBy = item.getAttribute("aria-describedby");
  expect(describedBy).not.toBeNull();
  expect(document.getElementById(describedBy ?? "")?.textContent).toBe("권한이 없습니다");

  // Button과 같은 두 층 검증. 실제 포인터는 actionability에서 막힌다.
  await expect(
    userEvent.click(screen.getByTestId("item-disabled"), { timeout: 700 }),
  ).rejects.toThrow();
  item.click();

  expect(onSelect).toHaveBeenCalledTimes(0);
  await expect.element(screen.getByTestId("panel")).toBeInTheDocument();
});

test("busy item은 중복 실행이 차단되고 메뉴를 닫지 않는다", async () => {
  const onSelect = vi.fn();
  const screen = await render(<Menu onSelect={onSelect} busy />);
  await userEvent.click(screen.getByTestId("trigger"));

  const item = screen.getByTestId("item-busy").element() as HTMLElement;
  expect(item.getAttribute("aria-busy")).toBe("true");
  item.click();
  item.click();

  expect(onSelect).toHaveBeenCalledTimes(0);
  await expect.element(screen.getByTestId("panel")).toBeInTheDocument();
});

test("바깥 클릭은 메뉴만 닫고 배경 액션을 실행하지 않는다", async () => {
  const onBackground = vi.fn();
  const onOpenChange = vi.fn();
  const screen = await render(
    <Menu onBackground={onBackground} onOpenChange={onOpenChange} />,
  );

  await userEvent.click(screen.getByTestId("trigger"));
  await expect.element(screen.getByTestId("panel")).toBeInTheDocument();
  await userEvent.click(screen.getByTestId("background"));

  await gone("panel");
  expect(onBackground).toHaveBeenCalledTimes(0);
  expect(
    onOpenChange.mock.calls.filter(([open]) => open === false)[0]?.[1],
  ).toBe("outside");
});

test("열린 Trigger를 다시 누르면 trigger reason으로 닫힌다", async () => {
  const onOpenChange = vi.fn();
  const screen = await render(<Menu onOpenChange={onOpenChange} />);

  await userEvent.click(screen.getByTestId("trigger"));
  await expect.element(screen.getByTestId("panel")).toBeInTheDocument();
  await userEvent.click(screen.getByTestId("trigger"));
  await gone("panel");

  // Trigger가 branch member라 바깥으로 판정되지 않는다.
  expect(
    onOpenChange.mock.calls.filter(([open]) => open === false)[0]?.[1],
  ).toBe("trigger");
  // 열림도 통지된다 — primitive는 닫힘만 통지하므로 recipe가 발행해야 한다.
  expect(onOpenChange.mock.calls.filter(([open]) => open === true)[0]?.[1]).toBe("trigger");
});

test("aria 배선이 규범대로이고 닫히면 aria-controls가 사라진다", async () => {
  const screen = await render(<Menu />);
  const trigger = screen.getByTestId("trigger").element();

  expect(trigger.getAttribute("aria-haspopup")).toBe("menu");
  expect(trigger.getAttribute("aria-expanded")).toBe("false");
  expect(trigger.getAttribute("aria-controls")).toBeNull();

  await userEvent.click(screen.getByTestId("trigger"));
  await expect.element(screen.getByTestId("panel")).toBeInTheDocument();

  const panel = screen.getByTestId("panel").element();
  expect(trigger.getAttribute("aria-expanded")).toBe("true");
  expect(trigger.getAttribute("aria-controls")).toBe(panel.id);
  expect(panel.getAttribute("role")).toBe("menu");
  expect(panel.getAttribute("aria-label")).toBe("액션");
  // FocusScope가 panel root에 tabIndex="-1"을 준다. 초기 focus 정책이 여기 의존한다.
  expect((panel as HTMLElement).tabIndex).toBe(-1);

  await userEvent.click(screen.getByTestId("background"));
  await gone("panel");
  expect(trigger.getAttribute("aria-expanded")).toBe("false");
  expect(trigger.getAttribute("aria-controls")).toBeNull();
});

test("접근성 검사에서 role 구조와 이름 오류가 없다", async () => {
  const screen = await render(<Menu />);
  await userEvent.click(screen.getByTestId("trigger"));
  await expect.element(screen.getByTestId("panel")).toBeInTheDocument();

  const results = await axe.run(document.body, {
    runOnly: {
      type: "rule",
      values: [
        "aria-allowed-attr",
        "aria-required-children",
        "aria-required-parent",
        "aria-valid-attr-value",
        "aria-command-name",
        "aria-allowed-role",
      ],
    },
  });
  expect(results.violations.map((violation) => violation.id)).toEqual([]);

  // 자동 검사가 role="menu"의 accessible name 누락은 잡지 못한다. 그래서 직접 고정한다.
  const panel = screen.getByTestId("panel").element();
  expect(panel.getAttribute("aria-label") ?? panel.getAttribute("aria-labelledby")).not.toBeNull();
});

function Popover({
  withTitle = true,
}: {
  readonly withTitle?: boolean;
}): React.JSX.Element {
  return (
    <OverlayProvider>
      <button type="button" data-testid="background">
        배경
      </button>
      <CompositePopover>
        <CompositePopoverTrigger data-testid="trigger">프로필</CompositePopoverTrigger>
        <CompositePopoverContent data-testid="panel">
          {withTitle ? (
            <CompositePopoverTitle data-testid="title">내 계정</CompositePopoverTitle>
          ) : null}
          <a href="#help" data-testid="help">
            도움말
          </a>
          {/* 실제 Button을 **마지막 자식으로** 둔다. `.louis-hit-target`이 44px 타겟을 시각 박스
              밖으로 확장하므로, 마지막 자식일 때 그 초과분이 패널의 아래 padding을 넘어
              스크롤 가능한 overflow가 된다. 가운데에 두면 gap이 흡수해 재현되지 않는다. */}
          <Button variant="secondary" size="md" data-testid="settings">
            설정
          </Button>
        </CompositePopoverContent>
      </CompositePopover>
    </OverlayProvider>
  );
}

test("composite popover는 dialog 역할이고 초기 focus가 panel root다", async () => {
  const screen = await render(<Popover />);
  await userEvent.click(screen.getByTestId("trigger"));
  await expect.element(screen.getByTestId("panel")).toBeInTheDocument();

  const panel = screen.getByTestId("panel").element();
  const trigger = screen.getByTestId("trigger").element();
  expect(panel.getAttribute("role")).toBe("dialog");
  expect(trigger.getAttribute("aria-haspopup")).toBe("dialog");
  // 이름은 Title에서 온다. 프로필 패널에 role="menu"를 붙이지 않는 것이 규범이다.
  expect(panel.getAttribute("aria-labelledby")).toBe(
    screen.getByTestId("title").element().id,
  );

  await vi.waitFor(() => {
    expect(document.activeElement).toBe(panel);
  });

  // panel에 focus가 있으면 다음 Tab이 자손으로 들어간다 — DOM 순서상 첫 tabbable이다.
  await userEvent.tab();
  expect(document.activeElement).toBe(screen.getByTestId("help").element());
});

test("Title 없이 title을 가리키면 이름 없는 dialog가 되는 것을 알린다", async () => {
  const error = vi.spyOn(console, "error").mockImplementation(() => {});
  try {
    const screen = await render(<Popover withTitle={false} />);
    await userEvent.click(screen.getByTestId("trigger"));
    await vi.waitFor(() => {
      expect(
        error.mock.calls.some((call) => String(call[0]).includes("접근 가능한 이름이 없습니다")),
      ).toBe(true);
    });
  } finally {
    error.mockRestore();
  }
});

test("composite popover 안에서는 방향키가 항목을 옮기지 않는다", async () => {
  const screen = await render(<Popover />);
  await userEvent.click(screen.getByTestId("trigger"));
  const panel = screen.getByTestId("panel").element();
  await vi.waitFor(() => {
    expect(document.activeElement).toBe(panel);
  });

  // roving은 action menu의 것이다. dialog는 자연 Tab 순서를 쓴다.
  await userEvent.keyboard("{ArrowDown}");
  expect(document.activeElement).toBe(panel);
});

test("내용이 다 보이는 popover에 유령 스크롤바가 생기지 않는다", async () => {
  const screen = await render(<Popover />);
  await userEvent.click(screen.getByTestId("trigger"));
  await expect.element(screen.getByTestId("panel")).toBeInTheDocument();

  const panel = screen.getByTestId("panel").element() as HTMLElement;
  // 패널은 스크롤 컨테이너다. hit target이 시각 박스 밖으로 확장하면 내용이 다 보이는데도
  // 스크롤 가능한 overflow가 생겨 스크롤바가 나타난다.
  expect(panel.scrollHeight).toBeLessThanOrEqual(panel.clientHeight);
  expect(panel.scrollWidth).toBeLessThanOrEqual(panel.clientWidth);
});
