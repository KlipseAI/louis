// design/components/tooltip.md의 Acceptance tests를 실제 브라우저에서 검증한다.
import type { JSX } from "react";
import { expect, test, vi } from "vitest";
import { page, userEvent } from "vitest/browser";
import { render } from "vitest-browser-react";
import { IconButton, OverlayProvider, Tooltip } from "@klipse-design/react";
import { IconTrashSimple } from "@klipse-design/react/icons";
import "@klipse-design/css/layers.css";
import "@klipse-design/css/tokens.css";
import "@klipse-design/css/styles.css";

const DELAY = 60;

function Fixture({
  disabled = false,
  content = "삭제 (⌫)",
}: {
  disabled?: boolean;
  content?: string;
}): JSX.Element {
  return (
    <OverlayProvider>
      <Tooltip content={content} openDelay={DELAY} disabled={disabled}>
        <IconButton label="삭제">
          <IconTrashSimple />
        </IconButton>
      </Tooltip>
    </OverlayProvider>
  );
}

const triggerEl = (): HTMLButtonElement => {
  const found = document.querySelector("button.kds-icon-button");
  if (found === null) throw new Error("trigger를 찾지 못했습니다");
  return found as HTMLButtonElement;
};
const surface = (): HTMLElement | null => document.querySelector('[role="tooltip"]');

test("포인터 진입 후 지연이 지나면 열린다", async () => {
  await render(<Fixture />);
  expect(surface()).toBeNull();
  await userEvent.hover(triggerEl());
  await vi.waitFor(() => {
    expect(surface()).not.toBeNull();
  });
  expect(surface()?.textContent).toBe("삭제 (⌫)");
  // 포인터를 치운다. 얹은 채로 두면 뒤에 같은 좌표에 렌더되는 요소가 :hover를 받는다.
  await userEvent.unhover(triggerEl());
});

test("지연 전에 포인터가 떠나면 열리지 않는다", async () => {
  await render(<Fixture />);
  const trigger = triggerEl();
  await userEvent.hover(trigger);
  // 지연이 끝나기 전에 떠난다.
  await userEvent.unhover(trigger);
  await new Promise((resolve) => setTimeout(resolve, DELAY * 3));
  expect(surface()).toBeNull();
});

test("키보드 focus는 지연 없이 연다", async () => {
  await render(<Fixture />);
  triggerEl().focus();
  // 지연을 기다리지 않고 같은 tick에 이미 열려 있어야 한다.
  await vi.waitFor(() => {
    expect(surface()).not.toBeNull();
  });
});

test("포인터 이탈로 닫힌다", async () => {
  await render(<Fixture />);
  const trigger = triggerEl();
  await userEvent.hover(trigger);
  await vi.waitFor(() => {
    expect(surface()).not.toBeNull();
  });
  await userEvent.unhover(trigger);
  await vi.waitFor(() => {
    expect(surface()).toBeNull();
  });
});

test("Escape로 닫히고 focus는 trigger에 남는다", async () => {
  await render(<Fixture />);
  const trigger = triggerEl();
  trigger.focus();
  await vi.waitFor(() => {
    expect(surface()).not.toBeNull();
  });
  await userEvent.keyboard("{Escape}");
  await vi.waitFor(() => {
    expect(surface()).toBeNull();
  });
  // tooltip은 focus를 가져가지 않는다.
  expect(document.activeElement).toBe(trigger);
});

test("열려 있는 동안 aria-describedby가 표면 id를 가리키고, 닫히면 사라진다", async () => {
  await render(<Fixture />);
  const trigger = triggerEl();
  expect(trigger.getAttribute("aria-describedby")).toBeNull();

  trigger.focus();
  await vi.waitFor(() => {
    expect(surface()).not.toBeNull();
  });
  const describedBy = trigger.getAttribute("aria-describedby");
  expect(describedBy).not.toBeNull();
  expect(surface()?.id).toBe(describedBy);

  trigger.blur();
  await vi.waitFor(() => {
    expect(surface()).toBeNull();
  });
  expect(trigger.getAttribute("aria-describedby")).toBeNull();
});

test("표면의 role이 tooltip이고 포인터 이벤트를 받지 않는다", async () => {
  await render(<Fixture />);
  triggerEl().focus();
  await vi.waitFor(() => {
    expect(surface()).not.toBeNull();
  });
  const node = surface();
  if (node === null) throw new Error("표면이 없습니다");
  expect(node.getAttribute("role")).toBe("tooltip");
  // 표면이 포인터를 받으면 표면 위로 옮겨갔을 때 trigger가 이탈로 판정돼 깜빡인다.
  expect(getComputedStyle(node).pointerEvents).toBe("none");
});

test("disabled면 열리지 않는다", async () => {
  await render(<Fixture disabled />);
  const trigger = triggerEl();
  await userEvent.hover(trigger);
  trigger.focus();
  await new Promise((resolve) => setTimeout(resolve, DELAY * 3));
  expect(surface()).toBeNull();
  // trigger 자체는 그대로 동작한다.
  expect(trigger.disabled).toBe(false);
  await userEvent.unhover(trigger);
});

test("trigger의 accessible name이 tooltip 내용으로 바뀌지 않는다", async () => {
  await render(<Fixture content="영구 삭제됩니다" />);
  const trigger = triggerEl();
  trigger.focus();
  await vi.waitFor(() => {
    expect(surface()).not.toBeNull();
  });
  // 이름은 IconButton의 label 하나에서 온다. tooltip은 설명이지 이름이 아니다.
  expect(trigger.getAttribute("aria-label")).toBe("삭제");
  expect(trigger.getAttribute("aria-labelledby")).toBeNull();
  await expect.element(page.getByRole("button", { name: "삭제" })).toBeVisible();
});

test("trigger를 감싸지 않는다 — 래퍼 요소를 만들지 않는다", async () => {
  // 래퍼를 두면 호출부의 flex/grid 계산이 조용히 달라진다.
  await render(
    <OverlayProvider>
      <div data-testid="row" style={{ display: "flex" }}>
        <Tooltip content="설명" openDelay={DELAY}>
          <IconButton label="삭제">
            <IconTrashSimple />
          </IconButton>
        </Tooltip>
      </div>
    </OverlayProvider>,
  );
  const row = document.querySelector('[data-testid="row"]');
  if (row === null) throw new Error("row를 찾지 못했습니다");
  expect(row.children.length).toBe(1);
  expect(row.children[0]?.tagName).toBe("BUTTON");
});

test("호출부의 포인터 핸들러를 덮어쓰지 않는다", async () => {
  const onPointerEnter = vi.fn();
  await render(
    <OverlayProvider>
      <Tooltip content="설명" openDelay={DELAY}>
        <IconButton label="삭제" onPointerEnter={onPointerEnter}>
          <IconTrashSimple />
        </IconButton>
      </Tooltip>
    </OverlayProvider>,
  );
  await userEvent.hover(triggerEl());
  expect(onPointerEnter).toHaveBeenCalled();
  await vi.waitFor(() => {
    expect(surface()).not.toBeNull();
  });
  await userEvent.unhover(triggerEl());
});

test("anchor와의 간격이 overlay 표면 CSS 값과 같다", async () => {
  // 자체 숫자를 갖지 않는다. 여기서 다시 쓰면 Menu·Dialog와 간격이 갈린다.
  await render(<Fixture />);
  const trigger = triggerEl();
  trigger.focus();
  await vi.waitFor(() => {
    expect(surface()).not.toBeNull();
  });
  const node = surface();
  if (node === null) throw new Error("표면이 없습니다");
  // Provider가 재는 것과 같은 방식으로 읽는다 — 값은 .kds-overlay-panel이 소유한다.
  const probe = document.createElement("div");
  probe.className = "kds-overlay-panel";
  document.body.append(probe);
  const expected = Number.parseFloat(
    getComputedStyle(probe).getPropertyValue("--kds-overlay-offset"),
  );
  probe.remove();
  expect(expected).toBeGreaterThan(0);
  // 공간이 없으면 방향이 뒤집힌다. 어느 쪽에 붙었든 간격은 같아야 하므로 실제 방향을 읽는다.
  const positioner = node.closest(".kds-tooltip-positioner") as HTMLElement | null;
  const side = positioner?.getAttribute("data-side") ?? "top";
  const tip = node.getBoundingClientRect();
  const anchor = trigger.getBoundingClientRect();
  const gap =
    side === "top"
      ? anchor.top - tip.bottom
      : side === "bottom"
        ? tip.top - anchor.bottom
        : side === "left"
          ? anchor.left - tip.right
          : tip.left - anchor.right;
  expect(Math.round(gap), `side=${side}`).toBe(Math.round(expected));
});

export type _EnsureTsx = JSX.Element;
