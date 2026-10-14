// Section Shell(`.louis-section-shell`)의 레시피가 실제로 그 리듬을 만드는지 잰다(DS-D-0111).
//
// **React 표면이 아니라 클래스 마크업을 렌더한다.** 정본은 packages/css/src/component/section-shell.css 이고 마크업은
// design/components/section-shell.md 의 예시 그대로다. 면 · 글자가 없는 레이아웃 부품이라 대비를 재지 않는다 — 여백 · 폭만 잰다.
import type { JSX } from "react";
import { expect, test } from "vitest";
import { page } from "vitest/browser";
import { render } from "vitest-browser-react";
import "@klipse-design/css/layers.css";
import "@klipse-design/css/tokens.css";
import "@klipse-design/css/styles.css";
import { find, px } from "./fixtures/contrast";

function Shells(): JSX.Element {
  return (
    <div>
      <section className="louis-section-shell" data-testid="shell">
        <div className="louis-section-shell__content" data-testid="content">
          콘텐츠
        </div>
      </section>
      <section className="louis-section-shell" data-bleed="true" data-testid="bleed">
        <div className="louis-section-shell__inset" data-testid="inset">
          <div className="louis-section-shell__content">머리</div>
        </div>
        <div data-testid="track">트랙</div>
      </section>
    </div>
  );
}

const STEPS = [
  [1280, 120, 20],
  [959, 88, 20],
  [719, 88, 16],
  [640, 60, 16],
  [355, 60, 12],
] as const;

for (const [width, block, inline] of STEPS) {
  test(`${width} 폭에서 세로 ${block} · 좌우 ${inline} 이고 bleed 는 좌우 0 · 안쪽 상자가 ${inline}`, async () => {
    await page.viewport(width, 800);
    await render(<Shells />);
    const shell = getComputedStyle(find("shell"));
    expect(px(shell.paddingTop)).toBe(block);
    expect(px(shell.paddingBottom)).toBe(block);
    expect(px(shell.paddingLeft)).toBe(inline);
    expect(px(shell.paddingRight)).toBe(inline);
    const bleed = getComputedStyle(find("bleed"));
    expect(px(bleed.paddingTop)).toBe(block);
    expect(px(bleed.paddingLeft)).toBe(0);
    expect(px(getComputedStyle(find("inset")).paddingLeft)).toBe(inline);
    // bleed 트랙은 화면 끝까지 흐른다.
    expect(find("track").getBoundingClientRect().width).toBe(find("bleed").getBoundingClientRect().width);
  });
}

test("1600 폭에서 콘텐츠는 1400 을 넘지 않고 가운데에 선다", async () => {
  await page.viewport(1600, 800);
  await render(<Shells />);
  const content = find("content").getBoundingClientRect();
  expect(content.width).toBe(1400);
  expect(Math.abs(content.left - (1600 - content.right))).toBeLessThan(1);
  expect(px(getComputedStyle(find("content")).maxWidth)).toBe(1400);
});

test("좁은 폭에서 콘텐츠는 인셋 안을 꽉 채운다", async () => {
  await page.viewport(700, 800);
  await render(<Shells />);
  const shell = find("shell").getBoundingClientRect();
  expect(find("content").getBoundingClientRect().width).toBe(shell.width - 16 * 2);
});
