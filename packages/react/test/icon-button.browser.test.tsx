// design/components/icon-button.md의 Acceptance tests를 실제 브라우저에서 검증한다.
import type { JSX } from "react";
import { expect, test, vi } from "vitest";
import { page, userEvent } from "vitest/browser";
import { render } from "vitest-browser-react";
import { Button, IconButton } from "@klipse-design/react";
import { IconTrashSimple, IconX } from "@klipse-design/react/icons";
import "@klipse-design/css/tokens.css";
import "@klipse-design/css/styles.css";

function iconButtonIn(root: ParentNode = document): HTMLButtonElement {
  const found = root.querySelector("button.kds-icon-button");
  if (found === null) throw new Error("kds-icon-button을 찾지 못했습니다");
  return found as HTMLButtonElement;
}

test("md가 40×40, sm이 32×32 정사각이다", async () => {
  await render(
    <div>
      <IconButton label="삭제" data-testid="md">
        <IconTrashSimple />
      </IconButton>
      <IconButton label="닫기" size="sm" data-testid="sm">
        <IconX />
      </IconButton>
    </div>,
  );
  for (const [testId, side] of [
    ["md", 40],
    ["sm", 32],
  ] as [string, number][]) {
    const node = document.querySelector(`[data-testid="${testId}"]`);
    if (node === null) throw new Error(`${testId}를 찾지 못했습니다`);
    const box = node.getBoundingClientRect();
    expect(box.width, `${testId} width`).toBe(side);
    expect(box.height, `${testId} height`).toBe(side);
  }
});

test("시각 크기와 무관하게 히트 영역이 44×44 이상이다", async () => {
  // .kds-hit-target이 중앙에 보이지 않는 의사 요소를 깐다. 시각 32px이어도 히트는 44px다.
  await render(
    <IconButton label="닫기" size="sm">
      <IconX />
    </IconButton>,
  );
  const button = iconButtonIn();
  const after = getComputedStyle(button, "::after");
  expect(Number.parseFloat(after.width)).toBeGreaterThanOrEqual(44);
  expect(Number.parseFloat(after.height)).toBeGreaterThanOrEqual(44);
  // 시각 크기는 그대로 32여야 한다 — 히트 영역이 레이아웃을 밀지 않는다.
  expect(button.getBoundingClientRect().width).toBe(32);
});

test("label이 accessible name으로 정확히 한 번 노출된다", async () => {
  await render(
    <IconButton label="항목 삭제">
      <IconTrashSimple />
    </IconButton>,
  );
  await expect.element(page.getByRole("button", { name: "항목 삭제" })).toBeVisible();
  expect(document.querySelectorAll('[aria-label="항목 삭제"]').length).toBe(1);
});

test("내부 아이콘이 accessibility tree에 노출되지 않는다", async () => {
  await render(
    <IconButton label="삭제">
      <IconTrashSimple />
    </IconButton>,
  );
  const glyph = iconButtonIn().querySelector(".kds-icon-button__glyph");
  expect(glyph?.getAttribute("aria-hidden")).toBe("true");
  const icon = iconButtonIn().querySelector("svg.kds-icon");
  expect(icon?.getAttribute("aria-label")).toBeNull();
  expect(icon?.getAttribute("role")).toBeNull();
});

test("pressed를 주지 않으면 aria-pressed 속성이 없다", async () => {
  await render(
    <IconButton label="삭제">
      <IconTrashSimple />
    </IconButton>,
  );
  // false를 늘 붙이면 토글이 아닌 버튼이 보조 기술에 토글로 노출된다.
  expect(iconButtonIn().hasAttribute("aria-pressed")).toBe(false);
});

test("pressed를 주면 aria-pressed가 그 값으로 붙는다", async () => {
  await render(
    <div>
      <IconButton label="음소거" pressed={false} data-testid="off">
        <IconX />
      </IconButton>
      <IconButton label="음소거 해제" pressed data-testid="on">
        <IconX />
      </IconButton>
    </div>,
  );
  expect(
    document.querySelector('[data-testid="off"]')?.getAttribute("aria-pressed"),
  ).toBe("false");
  expect(
    document.querySelector('[data-testid="on"]')?.getAttribute("aria-pressed"),
  ).toBe("true");
});

test("disabled면 클릭 핸들러가 실행되지 않는다", async () => {
  const onClick = vi.fn();
  await render(
    <IconButton label="삭제" disabled onClick={onClick}>
      <IconTrashSimple />
    </IconButton>,
  );
  const button = iconButtonIn();
  expect(button.disabled).toBe(true);
  button.click();
  expect(onClick).not.toHaveBeenCalled();
});

test("부모 color 변경이 글리프에 반영된다", async () => {
  await render(
    <div style={{ color: "rgb(0, 136, 255)" }}>
      <IconButton label="삭제" variant="ghost" style={{ color: "inherit" }}>
        <IconTrashSimple />
      </IconButton>
    </div>,
  );
  const path = iconButtonIn().querySelector("path");
  if (path === null) throw new Error("path를 찾지 못했습니다");
  expect(getComputedStyle(path).stroke).toBe("rgb(0, 136, 255)");
});

test("두 size의 글리프 계산 박스가 모두 20px다", async () => {
  await render(
    <div>
      <IconButton label="a" data-testid="md">
        <IconX />
      </IconButton>
      <IconButton label="b" size="sm" data-testid="sm">
        <IconX />
      </IconButton>
    </div>,
  );
  for (const testId of ["md", "sm"]) {
    const glyph = document
      .querySelector(`[data-testid="${testId}"]`)
      ?.querySelector(".kds-icon-button__glyph");
    if (!glyph) throw new Error(`${testId} 글리프를 찾지 못했습니다`);
    const box = glyph.getBoundingClientRect();
    expect(box.width, `${testId} glyph width`).toBe(20);
    expect(box.height, `${testId} glyph height`).toBe(20);
  }
});

test("Button을 아이콘 전용으로 쓰면 정사각이 되지 않는다 — 별도 컴포넌트인 근거", async () => {
  // 규범의 "왜 Button의 prop이 아닌가"가 근거로 삼은 실측이다. Button의 기하가 바뀌면
  // 이 테스트가 실패하고, 그때 규범의 근거를 다시 판정해야 한다.
  await render(
    <Button aria-label="삭제" variant="ghost" leftIcon={<IconTrashSimple />}>
      {null}
    </Button>,
  );
  const button = document.querySelector("button.kds-button");
  if (button === null) throw new Error("kds-button을 찾지 못했습니다");
  const box = button.getBoundingClientRect();
  expect(box.width).not.toBe(box.height);
  expect(box.width).toBeGreaterThan(box.height);
});

export type _EnsureTsx = JSX.Element;

test("토글이 켜진 상태를 hover가 덮지 않는다", async () => {
  // pressed는 지속 상태고 hover는 일시적 상태다. 일시적인 것이 지속적인 것을 지우면 사용자는
  // 포인터를 얹는 동안 토글이 꺼진 것으로 본다. 실제로 그렇게 돼 있었다.
  await render(
    <IconButton variant="primary" label="토글" pressed>
      <IconTrashSimple />
    </IconButton>,
  );
  const node = document.querySelector("button.kds-icon-button");
  if (node === null) throw new Error("IconButton을 찾지 못했습니다");
  const resting = getComputedStyle(node).backgroundColor;
  await userEvent.hover(node);
  expect(getComputedStyle(node).backgroundColor, "hover가 pressed 면을 바꿨습니다").toBe(resting);
  expect(node.getAttribute("aria-pressed")).toBe("true");
});
