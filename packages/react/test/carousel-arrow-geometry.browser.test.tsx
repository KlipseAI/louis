// figma/components.measured.json 의 **carousel-arrow** 값을 LOUIS 레시피가 여전히 만드는지 검증한다(DS-D-0035 (c)).
//
// 기록의 값은 제품 클래스를 실브라우저에서 잰 것이고(scripts/measure-product-components.mjs), parity 게이트는 Figma 를 그
// 기록과 맞댄다. 이 파일은 반대 방향 — `packages/css/src/component/carousel-arrow.css` 가 같은 수를 만드는지 — 를 잰다.
// React 표면이 없어 문서 Anatomy 의 클래스 마크업을 렌더한다. 기하는 상태와 무관해 기록 키가 `base` 하나다 — 그래서
// 기본 · 비활성 두 칸을 같은 값으로 잰다.
import type { JSX } from "react";
import { expect, test } from "vitest";
import { render } from "vitest-browser-react";
import measured from "../../../figma/components.measured.json" with { type: "json" };
import "@klipse-design/css/layers.css";
import "@klipse-design/css/tokens.css";
import "@klipse-design/css/styles.css";
import "../../css/src/component/carousel-arrow.css";
import { find, px } from "./fixtures/contrast";

function num(spec: Record<string, unknown>, field: string, label: string): number {
  const value = spec[field];
  if (typeof value !== "number") throw new Error(`${label}.${field}가 수가 아닙니다`);
  return value;
}

const CARET = (
  <svg className="louis-carousel-arrow__caret" viewBox="0 0 16 16" aria-hidden="true">
    <path d="M10 3 5 8l5 5" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

function Arrows(): JSX.Element {
  return (
    <div style={{ display: "flex", gap: 4, padding: 16 }}>
      <button type="button" className="louis-carousel-arrow" aria-label="이전" data-testid="arrow-default">
        {CARET}
      </button>
      <button type="button" className="louis-carousel-arrow" aria-label="다음" disabled data-testid="arrow-disabled">
        {CARET}
      </button>
    </div>
  );
}

test("carousel-arrow: 폭 · 높이 · 반경 · 여백이 기록과 같고 헤어라인은 상자를 바꾸지 않는다", async () => {
  await render(<Arrows />);
  const spec = measured.components["carousel-arrow"].sizes.base as Record<string, unknown>;
  for (const id of ["arrow-default", "arrow-disabled"]) {
    const label = `carousel-arrow.base(${id})`;
    const element = find(id);
    const style = getComputedStyle(element);
    const box = element.getBoundingClientRect();
    expect(box.width, label).toBe(num(spec, "width", label));
    expect(box.height, label).toBe(num(spec, "height", label));
    expect(px(style.borderTopLeftRadius), label).toBe(num(spec, "radius", label));
    expect(px(style.paddingTop), label).toBe(num(spec, "paddingBlock", label));
    expect(px(style.paddingBottom), label).toBe(num(spec, "paddingBlock", label));
    expect(px(style.paddingLeft), label).toBe(num(spec, "paddingInline", label));
    expect(px(style.paddingRight), label).toBe(num(spec, "paddingInline", label));
    // 헤어라인은 테두리가 아니라 inset 그림자다 — 테두리 0 이어야 32×32 가 그대로 남는다.
    expect(px(style.borderTopWidth), label).toBe(0);
    expect(style.boxShadow, label).toContain("inset");
    // 캐럿 16×16(인라인 SVG 의 상자) — 기록 밖이지만 레시피가 쥐는 값이다.
    const caret = element.querySelector("svg")!.getBoundingClientRect();
    expect(caret.width, label).toBe(16);
    expect(caret.height, label).toBe(16);
  }
});
