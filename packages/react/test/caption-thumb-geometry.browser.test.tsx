// figma/components.measured.json 의 **caption-thumb** 값을 코드가 여전히 만드는지 검증한다(DS-D-0035 (c), 2026-10-15 DS-D-0115).
import { expect, test } from "vitest";
import { page } from "vitest/browser";
import { render } from "vitest-browser-react";
import measured from "../../../figma/components.measured.json" with { type: "json" };
import "@klipse-design/css/layers.css";
import "@klipse-design/css/tokens.css";
import "@klipse-design/css/styles.css";
import { find, px } from "./fixtures/contrast";

test("caption-thumb base — 기록이 레시피의 계산값과 같다", async () => {
  await page.viewport(1280, 800);
  await render(
    <span className="louis-caption-thumb" data-testid="thumb">
      <span className="louis-caption-thumb__line" data-role="title" data-testid="title" />
      <span className="louis-caption-thumb__line" data-role="subtitle" data-testid="subtitle" />
      <span className="louis-caption-thumb__line" data-role="caption" data-boxed="true" data-testid="boxed" />
    </span>,
  );
  const spec = measured.components["caption-thumb"].sizes["base"] as Record<string, unknown>;
  const box = find("thumb").getBoundingClientRect();
  expect(box.width, "width").toBe(spec.width);
  expect(box.height, "height").toBe(spec.height);
  expect(px(getComputedStyle(find("thumb")).borderTopLeftRadius), "radius").toBe(spec.radius);
  expect(find("title").getBoundingClientRect().height, "titleHeight").toBe(spec.titleHeight);
  expect(find("subtitle").getBoundingClientRect().height, "subtitleHeight").toBe(spec.subtitleHeight);
  expect(find("boxed").getBoundingClientRect().height, "boxedCaptionHeight").toBe(spec.boxedCaptionHeight);
  expect(px(getComputedStyle(find("title")).borderTopLeftRadius), "lineRadius").toBe(spec.lineRadius);
});
