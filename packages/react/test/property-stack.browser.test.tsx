// Property Stack(`.louis-property-stack`)의 레시피가 실제로 그 흐름을 만드는지 잰다(DS-D-0114).
//
// **React 표면이 아니라 클래스 마크업을 렌더한다.** 정본은 packages/css/src/component/property-stack.css 이고 마크업은
// design/components/property-stack.md 의 예시 그대로다. 바닥은 편집 패널 면(`bg-inset`)이다.
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

function Swatch({ label, testId }: { readonly label: string; readonly testId?: string }): JSX.Element {
  return (
    <label className="louis-color-swatch" data-layout="stack" data-testid={testId}>
      <span className="louis-color-swatch__label">{label}</span>
      <input type="color" className="louis-color-swatch__chip" defaultValue="#000000" />
    </label>
  );
}

function Stack({ width = 280 }: { readonly width?: number }): JSX.Element {
  return (
    <div style={{ inlineSize: width, background: "var(--louis-color-bg-inset)" }}>
      <div className="louis-property-stack" data-testid="stack">
        <p className="louis-property-stack__label" data-testid="label">
          자막 색상
        </p>
        <div className="louis-property-stack__group" role="group" aria-labelledby="g1" data-testid="group">
          <span className="louis-property-stack__group-label" id="g1" data-testid="group-label">
            제목
          </span>
          <div className="louis-property-stack__fields" data-testid="fields">
            <Swatch label="글자" testId="f1" />
            <Swatch label="배경" testId="f2" />
            <Swatch label="테두리" testId="f3" />
            <Swatch label="외곽선" testId="f4" />
          </div>
          <div className="louis-property-stack__slider-row" data-testid="row">
            <span className="louis-property-stack__slider-label" id="pad" data-testid="row-label">
              여백
            </span>
            <span className="louis-slider" data-size="md" data-testid="slider">
              <input className="louis-slider__control" type="range" min={0} max={48} step={2} defaultValue={12} aria-labelledby="pad" />
            </span>
            <span className="louis-property-stack__slider-value" data-testid="row-value">
              12
            </span>
          </div>
        </div>
        <div className="louis-property-stack__group" role="group" aria-label="자막" data-testid="group-2">
          <span className="louis-property-stack__group-label">자막</span>
        </div>
      </div>
    </div>
  );
}

test("안쪽 8 / 12 / 4 · 묶음 사이 12 · 요소 안 4 다", async () => {
  await page.viewport(1280, 800);
  await render(<Stack />);
  const stack = getComputedStyle(find("stack"));
  expect(px(stack.paddingTop)).toBe(8);
  expect(px(stack.paddingLeft)).toBe(12);
  expect(px(stack.paddingBottom)).toBe(4);
  expect(px(stack.rowGap)).toBe(12);
  expect(find("group-2").getBoundingClientRect().top - find("group").getBoundingClientRect().bottom).toBe(12);
  expect(px(getComputedStyle(find("group")).rowGap)).toBe(4);
});

test("칸 줄은 사이 12 · 좁으면 줄바꿈이고 칸은 Color Swatch stack(열 44)이다", async () => {
  await page.viewport(1280, 800);
  await render(<Stack />);
  expect(px(getComputedStyle(find("fields")).columnGap)).toBe(12);
  expect(find("f2").getBoundingClientRect().left - find("f1").getBoundingClientRect().right).toBe(12);
  expect(find("f1").getBoundingClientRect().width).toBe(44);
  await render(<Stack width={160} />);
  const tops = new Set(["f1", "f2", "f3", "f4"].map((id) => Math.round(document.querySelectorAll(`[data-testid="${id}"]`)[1]!.getBoundingClientRect().top)));
  expect(tops.size).toBeGreaterThan(1);
});

test("슬라이더 줄은 사이 8 · 라벨 28 이상 · 값 16 이상 · 슬라이더가 남은 폭을 채운다", async () => {
  await page.viewport(1280, 800);
  await render(<Stack />);
  const row = find("row").getBoundingClientRect();
  expect(px(getComputedStyle(find("row")).columnGap)).toBe(8);
  expect(find("row-label").getBoundingClientRect().width).toBeGreaterThanOrEqual(28);
  expect(find("row-value").getBoundingClientRect().width).toBeGreaterThanOrEqual(16);
  const used = find("row-label").getBoundingClientRect().width + find("slider").getBoundingClientRect().width + find("row-value").getBoundingClientRect().width + 16;
  expect(Math.abs(used - row.width)).toBeLessThan(1);
});

test("두 테마에서 묶음 라벨 · 요소 이름 · 값이 4.5:1 을 넘는다(bg-inset 위)", async () => {
  await page.viewport(1280, 800);
  const measured: Record<string, number> = {};
  for (const theme of ["light", "dark"] as const) {
    document.documentElement.setAttribute("data-theme", theme);
    const screen = await render(<Stack />);
    measured[`${theme}/label`] = textContrast(find("label"));
    measured[`${theme}/group`] = textContrast(find("group-label"));
    measured[`${theme}/value`] = textContrast(find("row-value"));
    measured[`${theme}/rowLabel`] = textContrast(find("row-label"));
    await screen.unmount();
  }
  for (const [key, value] of Object.entries(measured)) expect(value, key).toBeGreaterThanOrEqual(4.5);
  // 실측(2026-10-15): 묶음 라벨 · 슬라이더 라벨 5.68 · 5.75, 요소 이름 · 값 14.61 · 18.12(라이트 · 다크).
});
