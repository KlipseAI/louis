// Brand Bar(`.louis-brand-bar`)의 레시피가 실제로 그 픽셀을 만드는지 잰다(DS-D-0112).
//
// **React 표면이 아니라 클래스 마크업을 렌더한다.** 정본은 packages/css/src/component/brand-bar.css 이고 마크업은
// design/components/brand-bar.md 의 예시 그대로다. 바닥은 덱 화면의 `bg-canvas` 다. 락업 그림은 소비처 몫이라 96×28 상자로 대신한다.
import type { JSX } from "react";
import { afterEach, expect, test } from "vitest";
import { page, userEvent } from "vitest/browser";
import { render } from "vitest-browser-react";
import "@klipse-design/css/layers.css";
import "@klipse-design/css/tokens.css";
import "@klipse-design/css/styles.css";
import { find, px, textContrast } from "./fixtures/contrast";

afterEach(() => {
  document.documentElement.removeAttribute("data-theme");
});

function Bar(): JSX.Element {
  return (
    <div style={{ padding: 16, background: "var(--louis-color-bg-canvas)" }}>
      <header className="louis-brand-bar" data-testid="bar">
        <a className="louis-brand-bar__brand" href="#deck" aria-label="Klipse Deck" data-testid="brand">
          <span style={{ display: "block", inlineSize: 186, blockSize: 28 }} />
        </a>
        <nav className="louis-brand-bar__links" aria-label="덱 메뉴" data-testid="links">
          <a className="louis-text-link louis-brand-bar__link" data-underline="none" href="#manage" data-testid="link-1">
            교안 관리
          </a>
          <a className="louis-text-link louis-brand-bar__link" data-underline="none" href="#archive" data-testid="link-2">
            Klipse로 돌아가기
          </a>
        </nav>
      </header>
    </div>
  );
}

test("막대는 양끝 · 사이 16 이고 락업은 높이 28 · 반경 8 · 줄지 않는다", async () => {
  await page.viewport(1280, 800);
  await render(<Bar />);
  const bar = getComputedStyle(find("bar"));
  expect(bar.justifyContent).toBe("space-between");
  expect(px(bar.columnGap)).toBe(16);
  const brand = getComputedStyle(find("brand"));
  expect(px(brand.height)).toBe(28);
  expect(px(brand.borderTopLeftRadius)).toBe(8);
  expect(brand.flexShrink).toBe("0");
  const barBox = find("bar").getBoundingClientRect();
  expect(Math.abs(find("links").getBoundingClientRect().right - barBox.right)).toBeLessThan(1);
});

test("링크 묶음은 세로 8 · 가로 24 이고 링크는 14 medium · 한 줄이다", async () => {
  await page.viewport(1280, 800);
  await render(<Bar />);
  const links = getComputedStyle(find("links"));
  expect(px(links.rowGap)).toBe(8);
  expect(px(links.columnGap)).toBe(24);
  const a = find("link-1").getBoundingClientRect();
  const b = find("link-2").getBoundingClientRect();
  expect(b.left - a.right).toBe(24);
  const link = getComputedStyle(find("link-1"));
  expect(px(link.fontSize)).toBe(14);
  expect(link.fontWeight).toBe("500");
  expect(link.whiteSpace).toBe("nowrap");
});

test("좁은 폭에서 링크가 다음 줄로 넘어가 오른쪽에 붙고 락업은 줄지 않는다", async () => {
  await page.viewport(320, 800);
  await render(<Bar />);
  const a = find("link-1").getBoundingClientRect();
  const b = find("link-2").getBoundingClientRect();
  expect(b.top).toBeGreaterThanOrEqual(a.bottom + 8 - 0.5);
  expect(Math.abs(b.right - find("links").getBoundingClientRect().right)).toBeLessThan(1);
  expect(find("brand").getBoundingClientRect().width).toBe(186);
});

test("두 테마에서 링크 쉼 · 호버 대비가 4.5:1 을 넘는다(bg-canvas 위)", async () => {
  await page.viewport(1280, 800);
  const measured: Record<string, number> = {};
  for (const theme of ["light", "dark"] as const) {
    document.documentElement.setAttribute("data-theme", theme);
    const screen = await render(<Bar />);
    measured[`${theme}/rest`] = textContrast(find("link-1"));
    await userEvent.hover(find("link-1"));
    await expect.poll(() => getComputedStyle(find("link-1")).color).not.toBe("");
    await new Promise((resolve) => setTimeout(resolve, 300));
    measured[`${theme}/hover`] = textContrast(find("link-1"));
    for (const [key, value] of Object.entries(measured)) expect(value, key).toBeGreaterThanOrEqual(4.5);
    await userEvent.unhover(find("link-1"));
    await screen.unmount();
  }
  expect(measured["light/hover"]!).toBeGreaterThan(measured["light/rest"]!);
  // 실측(2026-10-15): 쉼 라이트 8.67 · 다크 7.93, 호버 라이트 15.55 · 다크 18.12.
});
