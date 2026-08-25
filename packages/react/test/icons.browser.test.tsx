// design/foundations/iconography.md의 Acceptance tests를 실제 브라우저에서 검증한다.
//
// 서브패스가 열린 뒤이므로 **공개 경로로** import한다. dist를 직접 읽으면 exports 지도가
// 깨져도 테스트가 통과해, 소비자가 겪는 실패를 여기서 잡지 못한다.
import type { JSX } from "react";
import { expect, test } from "vitest";
import { page } from "vitest/browser";
import { render } from "vitest-browser-react";
import { Button } from "@klipse-design/react";
import { IconCheckCircle, IconEye, IconText } from "@klipse-design/react/icons";
import "@klipse-design/css/tokens.css";
import "@klipse-design/css/styles.css";

function iconIn(root: ParentNode = document): SVGSVGElement {
  const found = root.querySelector("svg.louis-icon");
  if (found === null) throw new Error("louis-icon을 찾지 못했습니다");
  return found as SVGSVGElement;
}

test("크기 토큰의 계산 박스가 16 / 20 / 24 CSS px다", async () => {
  await render(
    <div>
      <IconCheckCircle size="sm" data-testid="sm" />
      <IconCheckCircle data-testid="md" />
      <IconCheckCircle size="lg" data-testid="lg" />
    </div>,
  );
  const expected: [string, number][] = [
    ["sm", 16],
    ["md", 20],
    ["lg", 24],
  ];
  for (const [testId, size] of expected) {
    const node = document.querySelector(`[data-testid="${testId}"]`);
    if (node === null) throw new Error(`${testId}를 찾지 못했습니다`);
    const box = node.getBoundingClientRect();
    expect(box.width, `${testId} width`).toBe(size);
    expect(box.height, `${testId} height`).toBe(size);
  }
});

test("label이 없으면 장식이다 — accessibility tree에 노출되지 않는다", async () => {
  await render(<IconEye />);
  const icon = iconIn();
  expect(icon.getAttribute("aria-hidden")).toBe("true");
  expect(icon.getAttribute("role")).toBeNull();
  expect(icon.getAttribute("aria-label")).toBeNull();
});

test("label이 있으면 role=img와 그 이름으로 정확히 한 번 노출된다", async () => {
  await render(<IconEye label="비밀번호 표시" />);
  const icon = iconIn();
  expect(icon.getAttribute("role")).toBe("img");
  expect(icon.getAttribute("aria-label")).toBe("비밀번호 표시");
  // 두 겹으로 노출되지 않아야 한다. aria-hidden이 함께 붙으면 이름이 있어도 읽히지 않는다.
  expect(icon.getAttribute("aria-hidden")).toBeNull();
  await expect
    .element(page.getByRole("img", { name: "비밀번호 표시" }))
    .toBeVisible();
});

test("아이콘 전용 버튼의 accessible name은 버튼의 것 하나다", async () => {
  await render(
    <Button aria-label="항목 삭제" leftIcon={<IconCheckCircle />}>
      {null}
    </Button>,
  );
  const button = document.querySelector("button.louis-button");
  if (button === null) throw new Error("louis-button을 찾지 못했습니다");
  expect(button.getAttribute("aria-label")).toBe("항목 삭제");
  // 아이콘이 스스로 이름을 내지 않아야 버튼 이름이 한 겹으로 유지된다.
  expect(iconIn(button).getAttribute("aria-label")).toBeNull();
  expect(document.querySelectorAll('[aria-label="항목 삭제"]').length).toBe(1);
});

test("부모의 color가 stroke에 그대로 반영된다", async () => {
  await render(
    <div style={{ color: "rgb(0, 136, 255)" }}>
      <IconText />
    </div>,
  );
  const path = iconIn().querySelector("path");
  if (path === null) throw new Error("path를 찾지 못했습니다");
  expect(getComputedStyle(path).stroke).toBe("rgb(0, 136, 255)");
});

test("같은 아이콘을 둘 렌더해도 id 충돌이 없다", async () => {
  await render(
    <div>
      <IconCheckCircle />
      <IconCheckCircle />
    </div>,
  );
  const icons = document.querySelectorAll("svg.louis-icon");
  expect(icons.length).toBe(2);
  // 정본에 id가 없으므로 인라인 SVG가 문서 전역에서 서로 먹지 않는다.
  for (const icon of icons) {
    expect(icon.querySelectorAll("[id]").length).toBe(0);
    expect(icon.hasAttribute("id")).toBe(false);
  }
});

test("소비자 className이 louis-icon을 대체하지 않고 더해진다", async () => {
  await render(<IconEye className="custom" />);
  const icon = iconIn();
  expect(icon.classList.contains("louis-icon")).toBe(true);
  expect(icon.classList.contains("custom")).toBe(true);
});

test("글리프마다 서로 다른 지오메트리를 그린다", async () => {
  // 같은 컴포넌트가 이름만 다르게 방출되는 회귀를 잡는다.
  await render(
    <div>
      <IconCheckCircle />
      <IconEye />
      <IconText />
    </div>,
  );
  const icons = [...document.querySelectorAll("svg.louis-icon")] as SVGSVGElement[];
  const names = icons.map((icon) => icon.getAttribute("data-louis-icon"));
  expect(names).toEqual(["check-circle", "eye", "text"]);
  const shapes = icons.map((icon) => icon.innerHTML);
  expect(new Set(shapes).size).toBe(3);
});

export type _EnsureTsx = JSX.Element;
