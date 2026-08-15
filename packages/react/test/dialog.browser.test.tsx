import axe from "axe-core";
import { useState } from "react";
import { expect, test, vi } from "vitest";
import { userEvent } from "vitest/browser";
import { render } from "vitest-browser-react";

import {
  Dialog,
  DialogActions,
  DialogBody,
  DialogCancel,
  DialogClose,
  DialogConfirm,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogSurface,
  DialogTitle,
  OverlayProvider,
  type DialogCloseReason,
  type DialogVariant,
} from "@klipse-design/react";
import "@klipse-design/css/tokens.css";
import "@klipse-design/css/styles.css";

// design/components/dialog.md의 Migration acceptance tests.
// primitive의 modal 격리·scroll lock·중첩 stack은 overlay-stacking이 이미 덮는다.
// 여기서는 **public Dialog API**가 그 위에 얹은 계약만 본다.

interface HarnessProps {
  readonly variant?: DialogVariant;
  readonly dismissible?: boolean;
  readonly busy?: boolean;
  readonly closeOnBackdrop?: boolean;
  readonly withDescription?: boolean;
  readonly onOpenChange?: (open: boolean, reason: DialogCloseReason) => void;
  readonly onConfirm?: () => void;
  /** danger-confirm에서 footer 순서를 뒤집어 safe-action 표식의 효과를 본다. */
  readonly dangerFirst?: boolean;
}

function Harness({
  variant = "task",
  dismissible,
  busy,
  closeOnBackdrop,
  withDescription = true,
  onOpenChange,
  onConfirm,
  dangerFirst = false,
}: HarnessProps): React.JSX.Element {
  const [open, setOpen] = useState(false);
  const confirmButton = (
    <DialogConfirm key="confirm" data-testid="confirm" closeOnActivate onClick={onConfirm}>
      삭제
    </DialogConfirm>
  );
  const cancelButton = (
    <DialogCancel key="cancel" data-testid="cancel">
      취소
    </DialogCancel>
  );
  return (
    <OverlayProvider>
      <button type="button" data-testid="background">
        배경 액션
      </button>
      <button type="button" data-testid="trigger" onClick={() => setOpen(true)}>
        열기
      </button>
      <div data-testid="long-document" style={{ height: "2000px" }} />
      <Dialog
        open={open}
        variant={variant}
        {...(dismissible === undefined ? {} : { dismissible })}
        {...(busy === undefined ? {} : { busy })}
        {...(closeOnBackdrop === undefined ? {} : { closeOnBackdrop })}
        onOpenChange={(next, reason) => {
          setOpen(next);
          onOpenChange?.(next, reason);
        }}
      >
        <DialogSurface data-testid="dialog">
          <DialogHeader>
            <div className="kds-dialog__heading">
              <DialogTitle data-testid="title">프로젝트를 삭제할까요?</DialogTitle>
              {withDescription ? (
                <DialogDescription data-testid="description">
                  삭제하면 되돌릴 수 없습니다.
                </DialogDescription>
              ) : null}
            </div>
            <DialogClose label="닫기" data-testid="close" />
          </DialogHeader>
          <DialogBody data-testid="body">
            <input data-testid="field" aria-label="이름" />
          </DialogBody>
          <DialogFooter>
            <DialogActions data-testid="actions">
              {dangerFirst ? [confirmButton, cancelButton] : [cancelButton, confirmButton]}
            </DialogActions>
          </DialogFooter>
        </DialogSurface>
      </Dialog>
    </OverlayProvider>
  );
}

function dialogNode(): HTMLElement | null {
  return document.querySelector('[data-testid="dialog"]');
}

async function gone(): Promise<void> {
  await vi.waitFor(() => {
    expect(dialogNode()).toBeNull();
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

function activeId(): string | undefined {
  return (document.activeElement as HTMLElement | null)?.dataset["testid"];
}

test("role·aria-modal·이름·설명이 규범대로 배선된다", async () => {
  const screen = await render(<Harness />);
  await userEvent.click(screen.getByTestId("trigger"));
  await expect.element(screen.getByTestId("dialog")).toBeInTheDocument();

  const card = screen.getByTestId("dialog").element();
  expect(card.getAttribute("role")).toBe("dialog");
  expect(card.getAttribute("aria-modal")).toBe("true");
  expect(card.getAttribute("aria-labelledby")).toBe(
    screen.getByTestId("title").element().id,
  );
  expect(card.getAttribute("aria-describedby")).toBe(
    screen.getByTestId("description").element().id,
  );
});

test("설명이 없으면 aria-describedby를 붙이지 않는다", async () => {
  const screen = await render(<Harness withDescription={false} />);
  await userEvent.click(screen.getByTestId("trigger"));
  await expect.element(screen.getByTestId("dialog")).toBeInTheDocument();

  // 항상 붙이면 존재하지 않는 id를 가리킨다 — 화면상 아무 이상이 없는 접근성 회귀다.
  expect(screen.getByTestId("dialog").element().getAttribute("aria-describedby")).toBeNull();
});

test("task variant의 초기 focus는 첫 유효 필드다", async () => {
  const screen = await render(<Harness variant="task" />);
  await userEvent.click(screen.getByTestId("trigger"));
  await vi.waitFor(() => {
    expect(activeId()).toBe("field");
  });
});

test("danger-confirm의 초기 focus는 footer 순서와 무관하게 취소다", async () => {
  const screen = await render(<Harness variant="danger-confirm" dangerFirst />);
  await userEvent.click(screen.getByTestId("trigger"));
  // safe-action 표식이 없으면 primitive가 첫 focusable로 강등해 삭제 버튼을 고른다.
  await vi.waitFor(() => {
    expect(activeId()).toBe("cancel");
  });
});

test("media-workbench의 초기 focus는 dialog surface다", async () => {
  const screen = await render(<Harness variant="media-workbench" />);
  await userEvent.click(screen.getByTestId("trigger"));
  await vi.waitFor(() => {
    expect(document.activeElement).toBe(screen.getByTestId("dialog").element());
  });
  // surface가 focus를 가지면 스크린리더가 이름을 먼저 읽고 다음 Tab이 내용으로 들어간다.
  expect((screen.getByTestId("dialog").element() as HTMLElement).tabIndex).toBe(-1);
});

test("Escape는 dismissible Dialog를 닫고 호출 요소로 포커스를 돌린다", async () => {
  const onOpenChange = vi.fn();
  const screen = await render(<Harness onOpenChange={onOpenChange} />);
  const trigger = screen.getByTestId("trigger").element();

  await userEvent.click(screen.getByTestId("trigger"));
  await vi.waitFor(() => {
    expect(activeId()).toBe("field");
  });

  pressEscape();
  await gone();
  // 열기 직전 activeElement를 캡처했으므로 Trigger prop 없이도 돌아온다.
  expect(document.activeElement).toBe(trigger);
  expect(
    onOpenChange.mock.calls.filter(([open]) => open === false)[0]?.[1],
  ).toBe("escape");
});

test("dismissible=false면 Escape가 닫지 않고 안내가 읽힌다", async () => {
  const onOpenChange = vi.fn();
  const screen = await render(<Harness dismissible={false} onOpenChange={onOpenChange} />);
  await userEvent.click(screen.getByTestId("trigger"));
  await expect.element(screen.getByTestId("dialog")).toBeInTheDocument();

  pressEscape();

  await expect.element(screen.getByTestId("dialog")).toBeInTheDocument();
  expect(onOpenChange.mock.calls.filter(([open]) => open === false)).toHaveLength(0);
  // 차단이 무음이면 사용자는 Escape가 고장난 것으로 인지한다. 안내는 Dialog의 의무다.
  await vi.waitFor(() => {
    const status = document.querySelector('[role="status"]');
    expect(status?.textContent ?? "").not.toBe("");
  });
  // 닫기 버튼도 어포던스를 남기지 않는다.
  expect(document.querySelector('[data-testid="close"]')).toBeNull();
});

test("busy면 Escape와 confirm이 모두 차단된다", async () => {
  const onConfirm = vi.fn();
  const onOpenChange = vi.fn();
  const screen = await render(
    <Harness busy onConfirm={onConfirm} onOpenChange={onOpenChange} />,
  );
  await userEvent.click(screen.getByTestId("trigger"));
  await expect.element(screen.getByTestId("dialog")).toBeInTheDocument();

  pressEscape();
  await expect.element(screen.getByTestId("dialog")).toBeInTheDocument();

  const confirm = screen.getByTestId("confirm").element() as HTMLElement;
  expect(confirm.getAttribute("aria-busy")).toBe("true");
  // 네이티브 disabled를 쓰지 않는다 — 그러면 현재 focus가 사라져 trap이 무의미해진다.
  expect((confirm as HTMLButtonElement).disabled).toBe(false);
  confirm.click();
  expect(onConfirm).toHaveBeenCalledTimes(0);

  // 취소는 busy 중에도 살아 있어야 한다. Error 복구 경로가 그것을 요구한다.
  expect(screen.getByTestId("dialog").element().getAttribute("aria-busy")).toBe("true");
  expect(onOpenChange.mock.calls.filter(([open]) => open === false)).toHaveLength(0);
});

test("confirm과 cancel이 각자의 reason으로 닫는다", async () => {
  const onOpenChange = vi.fn();
  const screen = await render(<Harness onOpenChange={onOpenChange} />);

  await userEvent.click(screen.getByTestId("trigger"));
  await userEvent.click(screen.getByTestId("confirm"));
  await gone();
  expect(
    onOpenChange.mock.calls.filter(([open]) => open === false).at(-1)?.[1],
  ).toBe("confirm");

  onOpenChange.mockClear();
  await userEvent.click(screen.getByTestId("trigger"));
  await userEvent.click(screen.getByTestId("cancel"));
  await gone();
  expect(
    onOpenChange.mock.calls.filter(([open]) => open === false).at(-1)?.[1],
  ).toBe("cancel");
});

test("closeOnBackdrop이면 backdrop 클릭이 닫고 surface 클릭은 닫지 않는다", async () => {
  const onOpenChange = vi.fn();
  const screen = await render(
    <Harness variant="confirm" closeOnBackdrop onOpenChange={onOpenChange} />,
  );
  await userEvent.click(screen.getByTestId("trigger"));
  await expect.element(screen.getByTestId("dialog")).toBeInTheDocument();

  // surface 안 클릭은 dismiss가 아니다.
  await userEvent.click(screen.getByTestId("title"));
  await expect.element(screen.getByTestId("dialog")).toBeInTheDocument();

  const backdrop = document.querySelector(".kds-dialog__backdrop") as HTMLElement;
  backdrop.click();
  await gone();
  expect(
    onOpenChange.mock.calls.filter(([open]) => open === false)[0]?.[1],
  ).toBe("backdrop");
});

test("task는 backdrop 클릭으로 닫히지 않는다", async () => {
  const onOpenChange = vi.fn();
  const screen = await render(<Harness variant="task" onOpenChange={onOpenChange} />);
  await userEvent.click(screen.getByTestId("trigger"));
  await expect.element(screen.getByTestId("dialog")).toBeInTheDocument();

  (document.querySelector(".kds-dialog__backdrop") as HTMLElement).click();

  // 데이터 입력 중 오클릭이 입력을 지우면 안 된다.
  await expect.element(screen.getByTestId("dialog")).toBeInTheDocument();
  expect(onOpenChange.mock.calls.filter(([open]) => open === false)).toHaveLength(0);
  // 처음부터 그 어포던스를 두지 않기로 한 것이므로 "닫을 수 없다"고 낭독하지도 않는다.
  expect(document.querySelector('[role="status"]')?.textContent ?? "").toBe("");
});

test("전역 Enter가 danger action을 실행하지 않는다", async () => {
  const onConfirm = vi.fn();
  const onOpenChange = vi.fn();
  const screen = await render(
    <Harness variant="danger-confirm" onConfirm={onConfirm} onOpenChange={onOpenChange} />,
  );
  await userEvent.click(screen.getByTestId("trigger"));
  await vi.waitFor(() => {
    expect(activeId()).toBe("cancel");
  });

  // surface에 포커스를 옮겨 어떤 버튼도 focus되지 않은 상태를 만든다.
  (screen.getByTestId("dialog").element() as HTMLElement).focus();
  await userEvent.keyboard("{Enter}");

  // document capture에서 confirm을 추론하는 구현이었다면 여기서 삭제가 실행된다.
  expect(onConfirm).toHaveBeenCalledTimes(0);
  await expect.element(screen.getByTestId("dialog")).toBeInTheDocument();
});

test("Tab이 Dialog 안에서만 순환한다", async () => {
  const screen = await render(<Harness />);
  await userEvent.click(screen.getByTestId("trigger"));
  await vi.waitFor(() => {
    expect(activeId()).toBe("field");
  });

  const background = screen.getByTestId("background").element();
  for (let index = 0; index < 10; index += 1) {
    await userEvent.tab();
    expect(document.activeElement).not.toBe(background);
    expect(screen.getByTestId("dialog").element().contains(document.activeElement)).toBe(
      true,
    );
  }
});

test("body만 스크롤하고 header와 footer는 도달 가능하다", async () => {
  const screen = await render(<Harness />);
  await userEvent.click(screen.getByTestId("trigger"));
  await expect.element(screen.getByTestId("dialog")).toBeInTheDocument();

  const root = document.querySelector(".kds-dialog") as HTMLElement;
  const body = screen.getByTestId("body").element() as HTMLElement;
  // root가 scroll 컨테이너가 되면 중앙 정렬과 겹쳐 surface 상단이 도달 불가가 된다.
  expect(getComputedStyle(root).overflow).toBe("hidden");
  expect(getComputedStyle(body).overflow).toBe("auto");
});

test("접근성 검사에서 dialog 구조 오류가 없다", async () => {
  const screen = await render(<Harness />);
  await userEvent.click(screen.getByTestId("trigger"));
  await expect.element(screen.getByTestId("dialog")).toBeInTheDocument();

  const results = await axe.run(document.body, {
    runOnly: {
      type: "rule",
      values: [
        "aria-dialog-name",
        "aria-allowed-attr",
        "aria-valid-attr-value",
        "aria-required-attr",
        "aria-hidden-focus",
      ],
    },
  });
  expect(results.violations.map((violation) => violation.id)).toEqual([]);
});
