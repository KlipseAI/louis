// figma/components.measured.json 의 **plan-comparison · plan-comparison-column · plan-comparison-item** 값을 코드가 여전히 만드는지 검증한다
// (DS-D-0035 (c), 2026-10-14 DS-D-0092).
//
// parity 게이트는 Figma 가 기록과 같은지만 본다. 이 파일이 없으면 CSS 가 조용히 바뀌어도 **Figma 와 기록은 서로 맞고 둘 다
// 코드와 틀린** 상태로 통과한다. 그래서 기록의 키(= Figma 되읽기의 축 키)마다 클래스 마크업을 렌더하고 기록의 필드를 계산값과 맞댄다.
// sm 은 767 이하 뷰포트다. 대비 · 스크롤 · 접근은 plan-comparison.browser.test.tsx 가 소유한다.
import type { CSSProperties, JSX } from "react";
import { beforeEach, expect, test } from "vitest";
import { page } from "vitest/browser";
import { render } from "vitest-browser-react";
import { IconCheck } from "@klipse-design/react/icons";
import measured from "../../../figma/components.measured.json" with { type: "json" };
import "@klipse-design/css/layers.css";
import "@klipse-design/css/tokens.css";
import "@klipse-design/css/styles.css";
import { find, px } from "./fixtures/contrast";

type Sizes = Record<string, Record<string, unknown>>;

function num(spec: Record<string, unknown>, field: string, label: string): number {
  const value = spec[field];
  if (typeof value !== "number") throw new Error(`${label}.${field}가 수가 아닙니다`);
  return value;
}

function Table(): JSX.Element {
  return (
    <div style={{ inlineSize: 1300, maxInlineSize: "100%" }}>
      <section className="louis-plan-comparison" aria-label="플랜 비교">
        <h3 className="louis-plan-comparison__title" data-testid="title">
          플랜 비교
        </h3>
        <div className="louis-plan-comparison__scroll">
          <div className="louis-plan-comparison__grid" style={{ "--louis-plan-comparison-columns": 2 } as CSSProperties} data-testid="grid">
            {["Trial", "Lite"].map((plan, index) => (
              <div key={plan} className="louis-plan-comparison__column" role="group" aria-label={plan} data-testid={`column-${index}`}>
                <div className="louis-plan-comparison__head" data-testid={index === 1 ? "head" : undefined}>
                  {plan}
                </div>
                <div className="louis-plan-comparison__body" data-testid={index === 1 ? "body" : undefined}>
                  <div className="louis-plan-comparison__group" data-testid={index === 1 ? "group" : undefined}>
                    <p className="louis-plan-comparison__group-name" data-testid={index === 1 ? "group-name" : undefined}>
                      AI 영상 생성
                    </p>
                    <ul className="louis-plan-comparison__list">
                      <li className="louis-plan-comparison__item" data-testid={index === 1 ? "item-included" : undefined}>
                        <span className="louis-plan-comparison__feature" data-testid={index === 1 ? "feature-included" : undefined}>
                          Veo Lite
                        </span>
                        <span className="louis-plan-comparison__value" data-value="included">
                          <IconCheck size="sm" className="louis-plan-comparison__mark" label="포함" data-testid={index === 1 ? "mark-included" : undefined} />
                        </span>
                      </li>
                      <li className="louis-plan-comparison__item" data-testid={index === 1 ? "item-excluded" : undefined}>
                        <span className="louis-plan-comparison__feature" data-testid={index === 1 ? "feature-excluded" : undefined}>
                          Veo Fast
                        </span>
                        <span className="louis-plan-comparison__value" data-value="excluded">
                          <span className="louis-plan-comparison__mark" role="img" aria-label="미포함" data-testid={index === 1 ? "mark-excluded" : undefined}>
                            –
                          </span>
                        </span>
                      </li>
                      <li className="louis-plan-comparison__item" data-testid={index === 1 ? "item-text" : undefined}>
                        <span className="louis-plan-comparison__feature" data-testid={index === 1 ? "feature-text" : undefined}>
                          최대 해상도
                        </span>
                        <span className="louis-plan-comparison__value" data-value="text">
                          720p
                        </span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

beforeEach(async () => {
  await page.viewport(1440, 900);
});

const style = (testId: string): CSSStyleDeclaration => getComputedStyle(find(testId));
const rect = (testId: string): DOMRect => find(testId).getBoundingClientRect();
const viewport = (size: string): Promise<void> => page.viewport(size === "sm" ? 767 : 1440, 900);
const table = measured.components["plan-comparison"].sizes as Sizes;
const column = measured.components["plan-comparison-column"].sizes as Sizes;
const item = measured.components["plan-comparison-item"].sizes as Sizes;

test("기록의 키가 Figma 의 축과 같다", () => {
  expect(Object.keys(table).sort()).toEqual(["md", "sm"]);
  expect(Object.keys(column).sort()).toEqual(["md", "sm"]);
  expect(Object.keys(item).sort()).toEqual(["excluded/md", "excluded/sm", "included/md", "included/sm", "text/md", "text/sm"]);
});

for (const [key, spec] of Object.entries(table)) {
  test(`plan-comparison ${key} — 기록의 기하를 코드가 만든다`, async () => {
    await viewport(key);
    await render(<Table />);
    const grid = style("grid");
    expect(px(grid.borderTopWidth), "borderWidth").toBe(num(spec, "borderWidth", key));
    expect(px(grid.paddingTop), "gridPadding").toBe(num(spec, "gridPadding", key));
    expect(px(grid.borderTopLeftRadius), "radius").toBe(num(spec, "radius", key));
    expect(px(grid.minWidth), "minInlineSize").toBe(num(spec, "minInlineSize", key));
    expect(px(style("title").marginBottom), "titleGap").toBe(num(spec, "titleGap", key));
    expect(px(style("title").fontSize), "titleSize").toBe(num(spec, "titleSize", key));
  });
}

for (const [key, spec] of Object.entries(column)) {
  test(`plan-comparison-column ${key} — 기록의 기하를 코드가 만든다`, async () => {
    await viewport(key);
    await render(<Table />);
    expect(px(style("column-1").borderLeftWidth), "borderWidth").toBe(num(spec, "borderWidth", key));
    expect(px(style("column-0").borderLeftWidth), "첫 열 선 없음").toBe(0);
    const head = style("head");
    expect(px(head.paddingTop), "headPaddingTop").toBe(num(spec, "headPaddingTop", key));
    expect(px(head.paddingBottom), "headPaddingBottom").toBe(num(spec, "headPaddingBottom", key));
    expect(px(head.paddingLeft), "inset").toBe(num(spec, "inset", key));
    expect(px(head.borderBottomWidth), "borderWidth").toBe(num(spec, "borderWidth", key));
    expect(px(head.fontSize), "planSize").toBe(num(spec, "planSize", key));
    expect(px(style("body").paddingTop), "bodyPaddingTop").toBe(num(spec, "bodyPaddingTop", key));
    expect(px(style("body").paddingBottom), "bodyPaddingBottom").toBe(num(spec, "bodyPaddingBottom", key));
    expect(px(style("group").paddingTop), "groupPadding").toBe(num(spec, "groupPadding", key));
    expect(px(style("group").paddingBottom), "groupPadding").toBe(num(spec, "groupPadding", key));
    const name = style("group-name");
    expect(px(name.paddingTop), "groupNamePaddingTop").toBe(num(spec, "groupNamePaddingTop", key));
    expect(px(name.paddingBottom), "groupNamePaddingBottom").toBe(num(spec, "groupNamePaddingBottom", key));
    expect(px(name.paddingLeft), "inset").toBe(num(spec, "inset", key));
    expect(px(name.fontSize), "groupNameSize").toBe(num(spec, "groupNameSize", key));
  });
}

for (const [key, spec] of Object.entries(item)) {
  test(`plan-comparison-item ${key} — 기록의 기하를 코드가 만든다`, async () => {
    const [layout, size] = key.split("/") as ["included" | "excluded" | "text", "md" | "sm"];
    await viewport(size);
    await render(<Table />);
    const row = style(`item-${layout}`);
    expect(px(row.paddingTop), "paddingBlock").toBe(num(spec, "paddingBlock", key));
    expect(px(row.paddingBottom), "paddingBlock").toBe(num(spec, "paddingBlock", key));
    expect(px(row.paddingLeft), "paddingInline").toBe(num(spec, "paddingInline", key));
    expect(px(row.columnGap), "gap").toBe(num(spec, "gap", key));
    expect(px(style(`feature-${layout}`).fontSize), "featureSize").toBe(num(spec, "featureSize", key));
    if (layout === "text") {
      expect(spec.markSize, "text 칸에는 표시 칸이 없다").toBeUndefined();
    } else {
      expect(rect(`mark-${layout}`).width, "markSize").toBeCloseTo(num(spec, "markSize", key), 1);
      expect(rect(`mark-${layout}`).height, "markSize").toBeCloseTo(num(spec, "markSize", key), 1);
    }
  });
}
