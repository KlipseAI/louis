import { expect, test, vi } from "vitest";
import { userEvent } from "vitest/browser";
import { render } from "vitest-browser-react";

import {
  ActionMenu,
  ActionMenuContent,
  ActionMenuItem,
  ActionMenuSeparator,
  ActionMenuTrigger,
  OverlayProvider,
} from "@klipse-design/react";
import "@klipse-design/css/tokens.css";
import "@klipse-design/css/styles.css";

// design/components/menu-popover.md의 Action menu keyboard 표와 §Focus 절.
// primitive 테스트와 달리 여기서는 **public API**만 쓴다.

interface MenuProps {
  readonly onSelect?: (value: string) => void;
  readonly disabledItems?: "skip" | "announce";
  readonly firstDisabled?: boolean;
  readonly empty?: boolean;
  /** 라틴 라벨. Playwright가 실제 keydown을 만들 수 있는 유일한 경로다. */
  readonly latin?: boolean;
}

function Menu({
  onSelect,
  disabledItems = "announce",
  firstDisabled = false,
  empty = false,
  latin = false,
}: MenuProps): React.JSX.Element {
  const labels = latin
    ? { save: "Save", share: "Share", remove: "Delete" }
    : { save: "저장", share: "공유", remove: "삭제" };
  return (
    <OverlayProvider>
      <button type="button" data-testid="before">
        앞
      </button>
      <ActionMenu panelLabel="액션" disabledItems={disabledItems}>
        <ActionMenuTrigger data-testid="trigger">열기</ActionMenuTrigger>
        <ActionMenuContent data-testid="panel">
          {empty ? null : (
            <>
              <ActionMenuItem
                data-testid="item-save"
                disabled={firstDisabled}
                disabledReason="권한이 없습니다"
                onSelect={() => onSelect?.("save")}
              >
                {labels.save}
              </ActionMenuItem>
              <ActionMenuSeparator data-testid="sep" />
              <ActionMenuItem data-testid="item-share" onSelect={() => onSelect?.("share")}>
                {labels.share}
              </ActionMenuItem>
              <ActionMenuItem
                data-testid="item-delete"
                danger
                onSelect={() => onSelect?.("delete")}
              >
                {labels.remove}
              </ActionMenuItem>
            </>
          )}
        </ActionMenuContent>
      </ActionMenu>
    </OverlayProvider>
  );
}

function activeId(): string | undefined {
  return (document.activeElement as HTMLElement | null)?.dataset["testid"];
}

test("Trigger 클릭으로 열면 첫 enabled item에 focus가 간다", async () => {
  const screen = await render(<Menu />);
  await userEvent.click(screen.getByTestId("trigger"));
  await expect.element(screen.getByTestId("panel")).toBeInTheDocument();
  await vi.waitFor(() => {
    expect(activeId()).toBe("item-save");
  });
});

test("첫 항목이 aria-disabled여도 초기 focus는 첫 enabled item이다", async () => {
  const screen = await render(<Menu firstDisabled />);
  await userEvent.click(screen.getByTestId("trigger"));
  // announce 전략이라 disabled 항목도 탐색에는 남지만 초기 focus는 건너뛴다.
  await vi.waitFor(() => {
    expect(activeId()).toBe("item-share");
  });
});

test("ArrowUp으로 열면 마지막 enabled item으로 간다", async () => {
  const screen = await render(<Menu />);
  (screen.getByTestId("trigger").element() as HTMLElement).focus();
  await userEvent.keyboard("{ArrowUp}");
  await expect.element(screen.getByTestId("panel")).toBeInTheDocument();
  await vi.waitFor(() => {
    expect(activeId()).toBe("item-delete");
  });
});

test("방향키가 enabled item 사이를 순환하고 Home/End가 양 끝으로 간다", async () => {
  const screen = await render(<Menu />);
  await userEvent.click(screen.getByTestId("trigger"));
  await vi.waitFor(() => {
    expect(activeId()).toBe("item-save");
  });

  await userEvent.keyboard("{ArrowDown}");
  expect(activeId()).toBe("item-share");
  await userEvent.keyboard("{ArrowDown}");
  expect(activeId()).toBe("item-delete");
  // 순환한다.
  await userEvent.keyboard("{ArrowDown}");
  expect(activeId()).toBe("item-save");
  await userEvent.keyboard("{ArrowUp}");
  expect(activeId()).toBe("item-delete");

  await userEvent.keyboard("{Home}");
  expect(activeId()).toBe("item-save");
  await userEvent.keyboard("{End}");
  expect(activeId()).toBe("item-delete");
});

test("separator와 group label은 방향키 탐색에 끼지 않는다", async () => {
  const screen = await render(<Menu />);
  await userEvent.click(screen.getByTestId("trigger"));
  await vi.waitFor(() => {
    expect(activeId()).toBe("item-save");
  });
  await userEvent.keyboard("{ArrowDown}");
  // separator가 사이에 있지만 건너뛴다.
  expect(activeId()).toBe("item-share");
});

test("panel 안의 Tab stop은 하나뿐이다", async () => {
  const screen = await render(<Menu />);
  await userEvent.click(screen.getByTestId("trigger"));
  await vi.waitFor(() => {
    expect(activeId()).toBe("item-save");
  });

  const panel = screen.getByTestId("panel").element();
  const items = Array.from(panel.querySelectorAll<HTMLElement>("[data-louis-menu-item]"));
  expect(items.length).toBeGreaterThan(1);
  expect(items.filter((item) => item.tabIndex === 0)).toHaveLength(1);
  // 활성 item이 그 하나여야 방향키 이동 뒤 Tab이 자연스럽다.
  expect(items.find((item) => item.tabIndex === 0)?.dataset["testid"]).toBe("item-save");

  await userEvent.keyboard("{ArrowDown}");
  const after = Array.from(panel.querySelectorAll<HTMLElement>("[data-louis-menu-item]"));
  expect(after.filter((item) => item.tabIndex === 0)).toHaveLength(1);
  expect(after.find((item) => item.tabIndex === 0)?.dataset["testid"]).toBe("item-share");
});

test("typeahead가 현재 위치 다음부터 접두로 이동한다", async () => {
  // 실제 키 입력으로 검증할 수 있는 것은 라틴 라벨뿐이다 — Playwright는 IME 없이 한글
  // keydown을 만들지 못한다. 한글 경로는 아래 조합 테스트가 합성 이벤트로 덮는다.
  const screen = await render(<Menu latin />);
  await userEvent.click(screen.getByTestId("trigger"));
  await vi.waitFor(() => {
    expect(activeId()).toBe("item-save");
  });

  await userEvent.keyboard("d");
  expect(activeId()).toBe("item-delete");
});

test("같은 문자를 반복하면 질의를 늘리지 않고 같은 머리글자를 순회한다", async () => {
  const screen = await render(<Menu latin />);
  await userEvent.click(screen.getByTestId("trigger"));
  await vi.waitFor(() => {
    expect(activeId()).toBe("item-save");
  });

  // Save에서 "s" → 다음 S 항목인 Share. 다시 "s" → 순환해서 Save.
  await userEvent.keyboard("s");
  expect(activeId()).toBe("item-share");
  await userEvent.keyboard("s");
  expect(activeId()).toBe("item-save");
});

test("버퍼가 살아 있는 동안 다음 문자는 질의를 좁힌다", async () => {
  const screen = await render(<Menu latin />);
  await userEvent.click(screen.getByTestId("trigger"));
  await vi.waitFor(() => {
    expect(activeId()).toBe("item-save");
  });

  // "d" 직후 "e"는 "de"가 되어 Delete에만 맞는다. 두 키가 독립이었다면 "e"로 아무 데도 못 간다.
  await userEvent.keyboard("de");
  expect(activeId()).toBe("item-delete");
});

test("IME 조합 중 문자 키는 typeahead를 오염시키지 않는다", async () => {
  const screen = await render(<Menu />);
  await userEvent.click(screen.getByTestId("trigger"));
  await vi.waitFor(() => {
    expect(activeId()).toBe("item-save");
  });
  const panel = screen.getByTestId("panel").element();

  // 낱자모는 완성형 라벨과 절대 일치할 수 없다. IME 없이도 이 가드를 검증할 수 있다.
  panel.dispatchEvent(
    new KeyboardEvent("keydown", { key: "ㅅ", bubbles: true, cancelable: true }),
  );
  expect(activeId()).toBe("item-save");

  // 조합 플래그가 켜진 완성형도 무시한다.
  panel.dispatchEvent(
    new KeyboardEvent("keydown", {
      key: "삭",
      isComposing: true,
      bubbles: true,
      cancelable: true,
    }),
  );
  expect(activeId()).toBe("item-save");

  // 검출력 — 같은 문자를 조합 플래그 없이 보내면 실제로 이동한다.
  panel.dispatchEvent(
    new KeyboardEvent("keydown", { key: "삭", bubbles: true, cancelable: true }),
  );
  expect(activeId()).toBe("item-delete");
});

test("Enter는 item을 정확히 한 번 실행하고 그다음 닫는다", async () => {
  const onSelect = vi.fn();
  const screen = await render(<Menu onSelect={onSelect} />);
  await userEvent.click(screen.getByTestId("trigger"));
  await vi.waitFor(() => {
    expect(activeId()).toBe("item-save");
  });

  await userEvent.keyboard("{Enter}");

  // keydown으로 click을 흉내 냈다면 여기서 2가 된다.
  expect(onSelect).toHaveBeenCalledTimes(1);
  expect(onSelect).toHaveBeenCalledWith("save");
  await vi.waitFor(() => {
    expect(document.querySelector('[data-testid="panel"]')).toBeNull();
  });
});

test("Space도 정확히 한 번 실행한다", async () => {
  const onSelect = vi.fn();
  const screen = await render(<Menu onSelect={onSelect} />);
  await userEvent.click(screen.getByTestId("trigger"));
  await vi.waitFor(() => {
    expect(activeId()).toBe("item-save");
  });

  await userEvent.keyboard(" ");
  expect(onSelect).toHaveBeenCalledTimes(1);
});

test("Escape는 메뉴를 닫고 Trigger로 포커스를 돌린다", async () => {
  const screen = await render(<Menu />);
  await userEvent.click(screen.getByTestId("trigger"));
  await vi.waitFor(() => {
    expect(activeId()).toBe("item-save");
  });

  await userEvent.keyboard("{Escape}");
  await vi.waitFor(() => {
    expect(document.querySelector('[data-testid="panel"]')).toBeNull();
  });
  expect(activeId()).toBe("trigger");
});

test("item이 없으면 panel root가 focus를 받고 방향키가 아무 일도 하지 않는다", async () => {
  const screen = await render(<Menu empty />);
  await userEvent.click(screen.getByTestId("trigger"));
  await expect.element(screen.getByTestId("panel")).toBeInTheDocument();

  await vi.waitFor(() => {
    expect(document.activeElement).toBe(screen.getByTestId("panel").element());
  });
  await userEvent.keyboard("{ArrowDown}");
  // 열려 있고 focus도 그대로다. 이동할 곳이 없다고 패널을 잃지 않는다.
  expect(document.activeElement).toBe(screen.getByTestId("panel").element());
  await expect.element(screen.getByTestId("panel")).toBeInTheDocument();
});
