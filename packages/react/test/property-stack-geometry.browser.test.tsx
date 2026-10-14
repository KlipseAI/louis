// figma/components.measured.json 의 **property-stack · property-stack-group** 값을 코드가 여전히 만드는지 검증한다
// (DS-D-0035 (c), 2026-10-15 DS-D-0114). 기록의 필드를 클래스 마크업의 계산값과 맞댄다.
import { expect, test } from "vitest";
import { page } from "vitest/browser";
import { render } from "vitest-browser-react";
import measured from "../../../figma/components.measured.json" with { type: "json" };
import "@klipse-design/css/layers.css";
import "@klipse-design/css/tokens.css";
import "@klipse-design/css/styles.css";
import { find, px } from "./fixtures/contrast";

test("property-stack 의 두 기록이 레시피의 계산값과 같다", async () => {
  await page.viewport(1280, 800);
  await render(
    <div className="louis-property-stack" style={{ inlineSize: 280 }} data-testid="stack">
      <p className="louis-property-stack__label" data-testid="label">
        자막 색상
      </p>
      <div className="louis-property-stack__group" data-testid="group">
        <span className="louis-property-stack__group-label" data-testid="group-label">
          제목
        </span>
        <div className="louis-property-stack__fields" data-testid="fields" />
        <div className="louis-property-stack__slider-row" data-testid="row">
          <span className="louis-property-stack__slider-label" data-testid="row-label">
            여
          </span>
          <span className="louis-slider" data-size="md">
            <input className="louis-slider__control" type="range" aria-label="여백" />
          </span>
          <span className="louis-property-stack__slider-value" data-testid="row-value">
            1
          </span>
        </div>
      </div>
    </div>,
  );
  const stack = measured.components["property-stack"].sizes["base"] as Record<string, unknown>;
  const s = getComputedStyle(find("stack"));
  expect(px(s.paddingTop), "paddingTop").toBe(stack.paddingTop);
  expect(px(s.paddingBottom), "paddingBottom").toBe(stack.paddingBottom);
  expect(px(s.paddingLeft), "paddingInline").toBe(stack.paddingInline);
  expect(px(s.rowGap), "gap").toBe(stack.gap);
  expect(px(getComputedStyle(find("label")).fontSize), "labelFontSize").toBe(stack.labelFontSize);

  const group = measured.components["property-stack-group"].sizes["base"] as Record<string, unknown>;
  expect(px(getComputedStyle(find("group")).rowGap), "gap").toBe(group.gap);
  expect(px(getComputedStyle(find("group-label")).fontSize), "labelFontSize").toBe(group.labelFontSize);
  expect(px(getComputedStyle(find("fields")).columnGap), "fieldsGap").toBe(group.fieldsGap);
  expect(px(getComputedStyle(find("fields")).rowGap), "fieldsGap").toBe(group.fieldsGap);
  expect(px(getComputedStyle(find("row")).columnGap), "sliderRowGap").toBe(group.sliderRowGap);
  expect(px(getComputedStyle(find("row-label")).minWidth), "sliderLabelMin").toBe(group.sliderLabelMin);
  expect(px(getComputedStyle(find("row-value")).minWidth), "sliderValueMin").toBe(group.sliderValueMin);
});
