// design/components/button.md의 Acceptance tests를 그대로 옮긴다.
// 문자열이나 목킹이 아니라 실제 브라우저의 입력·레이아웃·접근성 트리로 검증한다.
import axe from "axe-core";
import type { JSX } from "react";
import { useState } from "react";
import { expect, test, vi } from "vitest";
import { page, userEvent } from "vitest/browser";
import { render } from "vitest-browser-react";
import { Button } from "@klipse-design/react";
import "@klipse-design/css/tokens.css";
import "@klipse-design/css/styles.css";

function buttonIn(root: ParentNode = document): HTMLButtonElement {
  const found = root.querySelector("button.kds-button");
  if (found === null) throw new Error("kds-button을 찾지 못했습니다");
  return found as HTMLButtonElement;
}

test("type 기본값은 button이다 — 폼을 실수로 제출하지 않는다", async () => {
  await render(<Button>저장</Button>);
  expect(buttonIn().type).toBe("button");
});

test("pointer click, Enter, Space가 각각 정확히 한 번 실행된다", async () => {
  const onClick = vi.fn();
  await render(<Button onClick={onClick}>저장</Button>);

  await userEvent.click(page.getByRole("button", { name: "저장" }));
  expect(onClick).toHaveBeenCalledTimes(1);

  buttonIn().focus();
  await userEvent.keyboard("{Enter}");
  expect(onClick).toHaveBeenCalledTimes(2);

  await userEvent.keyboard(" ");
  expect(onClick).toHaveBeenCalledTimes(3);
});

test("disabled에서 모든 activation 경로가 차단된다", async () => {
  const onClick = vi.fn();
  await render(
    <Button disabled onClick={onClick}>
      저장
    </Button>,
  );

  const button = buttonIn();
  expect(button.disabled).toBe(true);
  // 네이티브 disabled는 pointer 이벤트를 받지 않는다 — actionability가 이를 검출한다.
  await expect(
    userEvent.click(page.getByRole("button", { name: "저장" }), { timeout: 1000 }),
  ).rejects.toThrow();
  button.focus();
  await userEvent.keyboard("{Enter}");
  await userEvent.keyboard(" ");
  expect(onClick).not.toHaveBeenCalled();
});

test("loading에서 activation이 차단되고 focus는 유지된다", async () => {
  const onClick = vi.fn();
  await render(
    <Button loading onClick={onClick}>
      저장
    </Button>,
  );

  const button = buttonIn();
  button.focus();
  expect(document.activeElement).toBe(button);

  // 1층: aria-disabled는 actionability에서 비활성으로 취급되어 실제 포인터가 도달하지 않는다.
  await expect(
    userEvent.click(page.getByRole("button", { name: "저장" }), { timeout: 1000 }),
  ).rejects.toThrow();

  // 2층: 그래도 프로그램적 click이나 keyboard가 들어오면 컴포넌트가 직접 막는다.
  button.click();
  button.focus();
  await userEvent.keyboard("{Enter}");
  await userEvent.keyboard(" ");
  expect(onClick).not.toHaveBeenCalled();

  // 규범: loading 중 현재 focus를 제거하지 않는다.
  expect(document.activeElement).toBe(button);
  expect(button.getAttribute("aria-busy")).toBe("true");
  expect(button.getAttribute("aria-disabled")).toBe("true");
});

test("loading 시작·완료 시 accessible name과 focus가 예측 가능하다", async () => {
  function Harness(): JSX.Element {
    const [loading, setLoading] = useState(false);
    return (
      <Button loading={loading} onClick={() => setLoading(true)}>
        업로드
      </Button>
    );
  }
  await render(<Harness />);

  await expect.element(page.getByRole("button")).toHaveAccessibleName("업로드");

  const button = buttonIn();
  button.focus();
  await userEvent.click(page.getByRole("button"));

  // spinner가 accessible name을 오염시키지 않는다.
  await expect.element(page.getByRole("button")).toHaveAccessibleName("업로드");
  expect(buttonIn().getAttribute("aria-busy")).toBe("true");
  expect(document.activeElement).toBe(buttonIn());
});

test("아이콘 전용 버튼은 accessible name을 유지한다", async () => {
  await render(
    <Button aria-label="닫기" leftIcon={<svg viewBox="0 0 16 16" />}>
      <span className="kds-visually-hidden">닫기</span>
    </Button>,
  );
  await expect.element(page.getByRole("button")).toHaveAccessibleName("닫기");
});

test("focus-visible은 키보드에서만 나타난다", async () => {
  await render(
    <>
      <button data-testid="before">before</button>
      <Button>저장</Button>
    </>,
  );
  const button = buttonIn();

  await userEvent.click(page.getByRole("button", { name: "저장" }));
  expect(button.matches(":focus-visible")).toBe(false);

  (document.querySelector('[data-testid="before"]') as HTMLElement).focus();
  await userEvent.tab();
  expect(button.matches(":focus-visible")).toBe(true);
  const style = getComputedStyle(button);
  expect(style.outlineStyle).toBe("solid");
  expect(Number.parseFloat(style.outlineWidth)).toBeGreaterThanOrEqual(2);
});

test("light와 dark 모두에서 focus 링 색이 테마를 따른다", async () => {
  await render(<Button>저장</Button>);
  const button = buttonIn();
  const seen: string[] = [];
  for (const theme of ["light", "dark"] as const) {
    document.documentElement.setAttribute("data-theme", theme);
    button.focus();
    seen.push(getComputedStyle(button).outlineColor);
  }
  document.documentElement.removeAttribute("data-theme");
  expect(seen[0]).not.toBe("");
  expect(seen[0]).not.toBe(seen[1]);
});

test("hit target이 44px 이상이다", async () => {
  await render(<Button size="sm">삭제</Button>);
  const button = buttonIn();
  expect(button.getBoundingClientRect().height).toBeGreaterThan(0);
  // ::after가 넓힌 실제 타깃을 확인한다. 시각 크기는 작아도 된다.
  const after = getComputedStyle(button, "::after");
  expect(Number.parseFloat(after.width)).toBeGreaterThanOrEqual(44);
  expect(Number.parseFloat(after.height)).toBeGreaterThanOrEqual(44);
});

test("320px 컨테이너에서 KO/EN/JA 긴 라벨이 잘리지 않는다", async () => {
  const labels = [
    "새 프로젝트를 만들고 하이라이트를 자동으로 생성합니다",
    "Create a new project and generate highlights automatically",
    "新しいプロジェクトを作成してハイライトを自動生成します",
  ];
  for (const label of labels) {
    const host = document.createElement("div");
    host.style.width = "320px";
    document.body.append(host);
    try {
      await render(<Button>{label}</Button>, { container: host });
      const button = buttonIn(host);
      // 가로로 넘치지 않고 줄바꿈으로 흡수해야 한다.
      expect(button.scrollWidth).toBeLessThanOrEqual(button.clientWidth + 1);
      expect(button.getBoundingClientRect().width).toBeLessThanOrEqual(320);
      expect(button.textContent).toContain(label.slice(0, 6));
    } finally {
      host.remove();
    }
  }
});

/**
 * variant별로 **허용된** 접근성 위반.
 *
 * 비워 두는 것이 기본이다. 여기 이름을 올린다는 것은 그 위반을 알고도 내보낸다는 뜻이므로
 * 사유를 반드시 남긴다. 목록을 쓰지 않고 테스트를 지우면 그 variant의 나머지 검출력까지 사라진다.
 *
 * **네 variant 전부 color-contrast에 걸린다.** owner가 제품의 공용 Button을 정본으로 채택했고,
 * 그 제품 Button이 네 variant 모두 WCAG 2.2 AA(4.5)에 미달하기 때문이다. axe 실측값이다.
 *
 * | variant | 전경 | 배경 | 대비 |
 * | --- | --- | --- | --- |
 * | primary | #fafafa | #0088ff | 3.37 |
 * | secondary | #777d89 | 흰 배경 | 4.13 |
 * | ghost | #777d89 | 흰 배경 | 4.13 |
 * | danger | #fafafa | #ff4b59 | 3.14 |
 *
 * 이 미달은 제품이 이미 갖고 있는 것이고 DS가 그것을 그대로 재현한다. 사유는 token source의
 * contrastPairs note와 design/components/button.md의 Known deviations에도 있다.
 *
 * primary/color-contrast — owner가 제품 브랜드 블루(blue.500 #0088ff)를 정본으로 채택했다.
 * 흰 글자 대비가 3.37로 WCAG 2.2 AA의 4.5에 미달한다. 4.5를 넘는 첫 단계 blue.700(6.12)은
 * 제품에서 두 번밖에 쓰이지 않아 브랜드가 아니다. 이 미달은 제품이 이미 갖고 있으며 DS가 그것을
 * 그대로 재현한다. 같은 사유가 packages/tokens/src/klipse.tokens.json의 contrastPairs note와
 * design/components/button.md의 Known deviations에 있다.
 */
const ALLOWED_VIOLATIONS: Readonly<Record<string, readonly string[]>> = {
  primary: ["color-contrast"],
  secondary: ["color-contrast"],
  ghost: ["color-contrast"],
  danger: ["color-contrast"],
};

test("variant마다 접근성 위반이 없다 (알려진 것 제외)", async () => {
  for (const variant of ["primary", "secondary", "ghost", "danger"] as const) {
    const host = document.createElement("div");
    document.body.append(host);
    try {
      await render(<Button variant={variant}>저장</Button>, { container: host });
      const results = await axe.run(host, {
        // target-size는 24px만 보므로 위 44px 단언이 별도로 담보한다.
        runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag22aa"] },
      });
      const found = results.violations.map((violation) => violation.id).sort();
      const allowed = [...(ALLOWED_VIOLATIONS[variant] ?? [])].sort();
      expect(found, `${variant}에서 새 접근성 위반이 있습니다`).toEqual(allowed);
    } finally {
      host.remove();
    }
  }
});

test("좁은 flex 컨테이너에서 라벨이 글자 단위로 쪼개지지 않는다", async () => {
  await render(
    <div style={{ display: "flex", gap: 8, width: 240 }}>
      <Button>primary</Button>
      <Button variant="secondary">secondary</Button>
      <Button variant="danger">danger</Button>
    </div>,
  );

  const buttons = Array.from(document.querySelectorAll<HTMLElement>("button.kds-button"));
  expect(buttons).toHaveLength(3);

  for (const button of buttons) {
    const label = button.querySelector<HTMLElement>(".kds-button__label");
    if (label === null) throw new Error("label을 찾지 못했습니다");
    const lineHeight = Number.parseFloat(getComputedStyle(label).lineHeight);
    const lines = Math.round(label.getBoundingClientRect().height / lineHeight);
    // 한 단어짜리 라벨은 아무리 좁아도 한 줄이어야 한다. overflow-wrap이 min-content를
    // 낮추면 flex가 버튼을 글자 폭까지 줄여 "pri/ma/ry"가 된다.
    expect(lines).toBe(1);
  }
});
