// figma/components.measured.json 의 **gnb-menu-item** 값을 LOUIS 레시피가 여전히 만드는지 검증한다(DS-D-0035 (c)).
//
// 기록의 값은 제품 클래스를 실브라우저에서 잰 것이고(scripts/measure-product-components.mjs), parity 게이트는 Figma 를 그
// 기록과 맞댄다. 이 파일은 반대 방향 — `packages/css/src/component/gnb-menu-item.css` 가 같은 수를 만드는지 — 를 잰다.
// React 표면이 없어 문서 Anatomy 의 클래스 마크업을 렌더한다. 여덟 칸의 기하가 같고 갈리는 것은 불투명도뿐이다 — 그 값도
// 함께 본다(parity 계약의 opacity 블록과 같은 표).
import type { JSX } from "react";
import { expect, test } from "vitest";
import { page } from "vitest/browser";
import { render } from "vitest-browser-react";
import measured from "../../../figma/components.measured.json" with { type: "json" };
import "@klipse-design/css/layers.css";
import "@klipse-design/css/tokens.css";
import "@klipse-design/css/styles.css";
import "../../css/src/component/gnb-menu-item.css";
import { find, px } from "./fixtures/contrast";

const SURFACES = ["light", "dark"] as const;
const STATES = ["Default", "Selected", "Disabled"] as const;

// Hover 는 포인터를 얹어야 서므로 기하만 Default 칸과 같다고 본다 — hover 는 불투명도만 바꾼다.
const OPACITY: Record<string, number> = {
  "light/Default": 0.65,
  "light/Selected": 1,
  "light/Disabled": 0.4,
  "dark/Default": 0.7,
  "dark/Selected": 1,
  "dark/Disabled": 0.4,
};

function num(spec: Record<string, unknown>, field: string, label: string): number {
  const value = spec[field];
  if (typeof value !== "number") throw new Error(`${label}.${field}가 수가 아닙니다`);
  return value;
}

function Items(): JSX.Element {
  return (
    <div style={{ display: "grid", gap: 16, padding: 16 }}>
      {SURFACES.flatMap((surface) =>
        STATES.map((state) => {
          const key = `${surface}/${state}`;
          return (
            <div key={key}>
              <a
                className="louis-gnb-menu-item"
                data-surface={surface}
                href="#gnb"
                aria-current={state === "Selected" ? "page" : undefined}
                aria-disabled={state === "Disabled" ? "true" : undefined}
                data-testid={`item-${key}`}
              >
                <span className="louis-gnb-menu-item__label" data-testid={`label-${key}`}>
                  요금제
                </span>
              </a>
            </div>
          );
        }),
      )}
    </div>
  );
}

test("gnb-menu-item: 높이 · 여백 · 반경 · 라벨 타이포 · 불투명도가 기록과 같다", async () => {
  // 1280 폭에서 잰다 — ≤959px 에서는 좌우 안쪽이 8 로 줄어 Figma 의 데스크톱 판과 갈린다.
  await page.viewport(1280, 800);
  expect(window.innerWidth).toBeGreaterThan(959);
  await render(<Items />);
  for (const surface of SURFACES) {
    for (const state of STATES) {
      const key = `${surface}/${state}`;
      const spec = measured.components["gnb-menu-item"].sizes[key as "light/Default"] as Record<string, unknown>;
      const label = `gnb-menu-item.${key}`;
      const element = find(`item-${key}`);
      const style = getComputedStyle(element);
      expect(element.getBoundingClientRect().height, label).toBe(num(spec, "height", label));
      expect(px(style.paddingTop), label).toBe(num(spec, "paddingBlock", label));
      expect(px(style.paddingBottom), label).toBe(num(spec, "paddingBlock", label));
      expect(px(style.paddingLeft), label).toBe(num(spec, "paddingInline", label));
      expect(px(style.paddingRight), label).toBe(num(spec, "paddingInline", label));
      expect(px(style.borderTopLeftRadius), label).toBe(num(spec, "radius", label));
      expect(px(style.borderTopWidth), label).toBe(0);
      expect(style.boxShadow, label).toBe("none");
      expect(style.backgroundColor, label).toBe("rgba(0, 0, 0, 0)");
      expect(Number(style.opacity), label).toBeCloseTo(OPACITY[key] ?? Number.NaN, 5);

      const labelElement = find(`label-${key}`);
      expect(px(getComputedStyle(labelElement).fontSize), label).toBe(num(spec, "labelFontSize", label));
      expect(labelElement.getBoundingClientRect().height, label).toBe(num(spec, "labelHeight", label));
    }
  }
});
