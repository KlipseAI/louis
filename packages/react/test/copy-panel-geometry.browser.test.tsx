// figma/components.measured.json 의 **copy-panel** 값을 코드가 여전히 만드는지 검증한다(DS-D-0035 (c), 2026-10-15 DS-D-0110).
//
// parity 게이트는 Figma 가 기록과 같은지만 본다. 이 파일이 없으면 CSS 가 조용히 바뀌어도 Figma 와 기록은 서로 맞고 둘 다
// 코드와 틀린 상태로 통과한다. 그래서 기록의 키(= Figma 되읽기의 축 키)마다 클래스 마크업을 렌더하고 기록의 필드를 계산값과 맞댄다.
// compact 는 719 이하 뷰포트다.
import { expect, test } from "vitest";
import { page } from "vitest/browser";
import { render } from "vitest-browser-react";
import measured from "../../../figma/components.measured.json" with { type: "json" };
import "@klipse-design/css/layers.css";
import "@klipse-design/css/tokens.css";
import "@klipse-design/css/styles.css";
import { find, px } from "./fixtures/contrast";

for (const [key, viewport] of [
  ["base", 1280],
  ["compact", 375],
] as const) {
  test(`copy-panel ${key} — 기록이 레시피의 계산값과 같다`, async () => {
    await page.viewport(viewport, 800);
    await render(
      <section className="louis-copy-panel" data-testid="panel">
        <div className="louis-copy-panel__head" data-testid="head">
          <h2 className="louis-copy-panel__title" data-testid="title">
            프롬프트
          </h2>
          <button className="louis-button louis-copy-panel__action" data-variant="secondary" data-size="md" type="button">
            프롬프트 복사
          </button>
        </div>
        <p className="louis-copy-panel__body" data-testid="body">
          원문
        </p>
      </section>,
    );
    const spec = measured.components["copy-panel"].sizes[key] as Record<string, unknown>;
    const panel = getComputedStyle(find("panel"));
    expect(px(panel.paddingTop), "padding").toBe(spec.padding);
    expect(px(panel.paddingLeft), "padding").toBe(spec.padding);
    expect(px(panel.borderTopWidth), "borderWidth").toBe(spec.borderWidth);
    expect(px(panel.rowGap), "gap").toBe(spec.gap);
    expect(px(panel.borderTopLeftRadius), "radius").toBe(spec.radius);
    const head = getComputedStyle(find("head"));
    expect(px(head.columnGap), "headGap").toBe(spec.headGap);
    expect(head.flexDirection === "row" ? "HORIZONTAL" : "VERTICAL", "headDirection").toBe(spec.headDirection);
    expect(px(getComputedStyle(find("title")).fontSize), "titleFontSize").toBe(spec.titleFontSize);
    expect(px(getComputedStyle(find("body")).fontSize), "bodyFontSize").toBe(spec.bodyFontSize);
  });
}
