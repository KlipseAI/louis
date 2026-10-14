// Copy Panel(`.louis-copy-panel`)의 레시피가 실제로 그 픽셀을 만드는지 잰다(DS-D-0110).
//
// **React 표면이 아니라 클래스 마크업을 렌더한다.** 정본은 packages/css/src/component/copy-panel.css 이고 마크업은
// design/components/copy-panel.md 의 예시 그대로다. 바닥은 랜딩 면(`landing-page-bg`)이다 — 제품 템플릿 상세의 바닥.
import type { JSX } from "react";
import { afterEach, expect, test } from "vitest";
import { page } from "vitest/browser";
import { render } from "vitest-browser-react";
import "@klipse-design/css/layers.css";
import "@klipse-design/css/tokens.css";
import "@klipse-design/css/styles.css";
import { find, px, textContrast } from "./fixtures/contrast";

afterEach(() => {
  document.documentElement.removeAttribute("data-theme");
});

function Panel(): JSX.Element {
  return (
    <div style={{ padding: 16, background: "var(--louis-color-landing-page-bg)" }}>
      <section className="louis-copy-panel" aria-labelledby="t" data-testid="panel">
        <div className="louis-copy-panel__head" data-testid="head">
          <h2 className="louis-copy-panel__title" id="t" data-testid="title">
            프롬프트
          </h2>
          <button className="louis-button louis-copy-panel__action" data-variant="secondary" data-size="md" type="button" data-testid="action">
            프롬프트 복사
          </button>
        </div>
        <p className="louis-copy-panel__body" data-testid="body">
          {"첫 줄\n  들여 쓴 둘째 줄 아주긴낱말아주긴낱말아주긴낱말아주긴낱말아주긴낱말아주긴낱말아주긴낱말아주긴낱말아주긴낱말아주긴낱말"}
        </p>
      </section>
    </div>
  );
}

test("면은 안쪽 20 · 반경 16 · 선 1 이고 머리와 원문 사이 12 다", async () => {
  await page.viewport(1280, 800);
  await render(<Panel />);
  const style = getComputedStyle(find("panel"));
  expect(px(style.paddingTop)).toBe(20);
  expect(px(style.paddingLeft)).toBe(20);
  expect(px(style.borderTopLeftRadius)).toBe(16);
  expect(px(style.borderTopWidth)).toBe(1);
  expect(px(style.rowGap)).toBe(12);
  const head = find("head").getBoundingClientRect();
  const body = find("body").getBoundingClientRect();
  expect(body.top - head.bottom).toBe(12);
});

test("제목 20/30 semibold · 원문 16/24 이고 원문은 줄바꿈 · 공백을 그대로 보인다", async () => {
  await page.viewport(1280, 800);
  await render(<Panel />);
  const title = getComputedStyle(find("title"));
  expect(px(title.fontSize)).toBe(20);
  expect(px(title.lineHeight)).toBe(30);
  expect(title.fontWeight).toBe("600");
  const body = getComputedStyle(find("body"));
  expect(px(body.fontSize)).toBe(16);
  expect(px(body.lineHeight)).toBe(24);
  expect(body.whiteSpace).toBe("pre-wrap");
  // 긴 낱말이 칸을 넘치지 않는다.
  expect(find("body").scrollWidth).toBeLessThanOrEqual(find("body").clientWidth);
});

test("1280 에서 머리는 양끝 가로 줄이고 동작은 32 높이로 줄지 않는다", async () => {
  await page.viewport(1280, 800);
  await render(<Panel />);
  const head = find("head").getBoundingClientRect();
  const title = find("title").getBoundingClientRect();
  const action = find("action").getBoundingClientRect();
  expect(Math.abs(title.left - head.left)).toBeLessThan(1);
  expect(Math.abs(action.right - head.right)).toBeLessThan(1);
  expect(action.height).toBe(32);
  expect(getComputedStyle(find("action")).flexShrink).toBe("0");
});

test("375 에서 머리가 위아래로 쌓이고 왼쪽에 붙는다", async () => {
  await page.viewport(375, 800);
  await render(<Panel />);
  const title = find("title").getBoundingClientRect();
  const action = find("action").getBoundingClientRect();
  expect(action.top).toBeGreaterThanOrEqual(title.bottom + 12 - 0.5);
  expect(Math.abs(action.left - title.left)).toBeLessThan(1);
});

test("두 테마에서 원문 · 제목이 4.5:1 을 넘는다(랜딩 바닥 위 4% 면)", async () => {
  await page.viewport(1280, 800);
  const measured: Record<string, number> = {};
  for (const theme of ["light", "dark"] as const) {
    document.documentElement.setAttribute("data-theme", theme);
    const screen = await render(<Panel />);
    measured[`${theme}/body`] = textContrast(find("body"));
    measured[`${theme}/title`] = textContrast(find("title"));
    expect(measured[`${theme}/body`], `${theme} body`).toBeGreaterThanOrEqual(4.5);
    expect(measured[`${theme}/title`], `${theme} title`).toBeGreaterThanOrEqual(4.5);
    await screen.unmount();
  }
  // 실측(2026-10-15): 원문 라이트 6.43 · 다크 9.85, 제목 라이트 15.30 · 다크 18.97.
});
