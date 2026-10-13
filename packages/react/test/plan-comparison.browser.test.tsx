// Plan Comparison(`.louis-plan-comparison`)의 레시피가 실제로 그 격자 · 열 · 머리 · 묶음 · 항목 · 값 표시 · 좁은 판 · 대비를 만드는지 잰다(DS-D-0092).
//
// **React 표면이 아니라 클래스 마크업을 렌더한다.** 정본은 packages/css/src/component/plan-comparison.css 이고 마크업은
// design/components/plan-comparison.md 의 예시 그대로다. 767 경계가 뷰포트 질의라 시험이 뷰포트를 스스로 정한다.
// 대비는 토큰 값으로 손 계산하지 않고 계산 색을 바닥(`bg-surface`) 위에서 잰다(fixtures/contrast).
import type { CSSProperties, JSX } from "react";
import { afterEach, beforeEach, expect, test } from "vitest";
import { page } from "vitest/browser";
import { render } from "vitest-browser-react";
import { IconCheck } from "@klipse-design/react/icons";
import "@klipse-design/css/layers.css";
import "@klipse-design/css/tokens.css";
import "@klipse-design/css/styles.css";
import { backdrop, find, parseColor, px, ratio, textContrast, tokenColor } from "./fixtures/contrast";

beforeEach(async () => {
  await page.viewport(1440, 900);
});

afterEach(async () => {
  document.documentElement.removeAttribute("data-theme");
  await page.viewport(1440, 900);
});

const PLANS = ["Trial", "Lite", "Plus", "Pro", "Ultra"] as const;

function Table({ width = 1300, columns = 5 }: { readonly width?: number; readonly columns?: number }): JSX.Element {
  const ground: CSSProperties = { background: "var(--louis-color-bg-surface)", inlineSize: width, maxInlineSize: "100%" };
  return (
    <div style={ground} data-testid="ground">
      <section className="louis-plan-comparison" aria-labelledby="pc-title" data-testid="root">
        <h3 className="louis-plan-comparison__title" id="pc-title" data-testid="title">
          플랜 비교
        </h3>
        <div className="louis-plan-comparison__scroll" data-testid="scroll">
          <div className="louis-plan-comparison__grid" style={{ "--louis-plan-comparison-columns": columns } as CSSProperties} data-testid="grid">
            {PLANS.slice(0, columns).map((plan, index) => {
              const first = index === 0;
              return (
                <div key={plan} className="louis-plan-comparison__column" role="group" aria-labelledby={`pc-${plan}`} data-testid={`column-${index}`}>
                  <div className="louis-plan-comparison__head" id={`pc-${plan}`} data-testid={first ? "head" : undefined}>
                    {plan}
                  </div>
                  <div className="louis-plan-comparison__body" data-testid={first ? "body" : undefined}>
                    <div className="louis-plan-comparison__group" data-testid={first ? "group" : undefined}>
                      <p className="louis-plan-comparison__group-name" id={`pc-${plan}-video`} data-testid={first ? "group-name" : undefined}>
                        AI 영상 생성
                      </p>
                      <ul className="louis-plan-comparison__list" aria-labelledby={`pc-${plan}-video`}>
                        <li className="louis-plan-comparison__item" data-testid={first ? "item-included" : undefined}>
                          <span className="louis-plan-comparison__feature" data-testid={first ? "feature" : undefined}>
                            Veo Lite
                          </span>
                          <span className="louis-plan-comparison__value" data-value="included" data-testid={first ? "value-included" : undefined}>
                            <IconCheck size="sm" className="louis-plan-comparison__mark" label="포함" data-testid={first ? "check" : undefined} />
                          </span>
                        </li>
                        <li className="louis-plan-comparison__item" data-testid={first ? "item-excluded" : undefined}>
                          <span className="louis-plan-comparison__feature">Veo Fast / Standard</span>
                          <span className="louis-plan-comparison__value" data-value="excluded" data-testid={first ? "value-excluded" : undefined}>
                            <span className="louis-plan-comparison__mark" role="img" aria-label="미포함" data-testid={first ? "dash" : undefined}>
                              –
                            </span>
                          </span>
                        </li>
                        <li className="louis-plan-comparison__item" data-testid={first ? "item-text" : undefined}>
                          <span className="louis-plan-comparison__feature">최대 해상도</span>
                          <span className="louis-plan-comparison__value" data-value="text" data-testid={first ? "value-text" : undefined}>
                            720p
                          </span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}

const style = (testId: string): CSSStyleDeclaration => getComputedStyle(find(testId));
const rect = (testId: string): DOMRect => find(testId).getBoundingClientRect();

test("격자 — 열 수 변수만큼 같은 폭 · 최소 760 · 바깥 1px 12% · 반경 16 · 자름 · 면 없음", async () => {
  await render(<Table />);
  const grid = style("grid");
  expect(grid.display).toBe("grid");
  expect(grid.gridTemplateColumns.split(" ")).toHaveLength(5);
  expect(px(grid.minWidth)).toBe(760);
  expect(px(grid.borderTopWidth)).toBe(1);
  expect(grid.borderTopColor).toBe(tokenColor("color-gray-000-alpha-12"));
  expect(px(grid.borderTopLeftRadius)).toBe(16);
  expect(grid.overflow).toBe("hidden");
  expect(parseColor(style("root").backgroundColor)[3]).toBe(0);
  expect(parseColor(grid.backgroundColor)[3]).toBe(0);
  const widths = [0, 1, 2, 3, 4].map((index) => rect(`column-${index}`).width);
  for (const width of widths) expect(width).toBeCloseTo(widths[0] ?? 0, 0);
});

test("열 수는 데이터다 — 변수 3 이면 세 열", async () => {
  await render(<Table columns={3} />);
  expect(style("grid").gridTemplateColumns.split(" ")).toHaveLength(3);
});

test("열 — 첫 열 선 없음, 둘째부터 1px 8%", async () => {
  await render(<Table />);
  expect(px(style("column-0").borderLeftWidth)).toBe(0);
  expect(px(style("column-1").borderLeftWidth)).toBe(1);
  expect(style("column-1").borderLeftColor).toBe(tokenColor("color-gray-000-alpha-08"));
});

test("제목 — heading-md semibold 36 · 가운데 · 아래 32 · fg-primary", async () => {
  await render(<Table />);
  const title = style("title");
  expect(px(title.fontSize)).toBe(36);
  expect(title.textAlign).toBe("center");
  expect(px(title.marginBottom)).toBe(32);
  expect(title.color).toBe(tokenColor("color-fg-primary"));
});

test("치수 — 머리 59 · 본문 위 4 아래 12 · 묶음 위아래 8 · 묶음 이름 32 · 한 줄 항목 35 · 표시 칸 16", async () => {
  await render(<Table />);
  expect(rect("head").height).toBeCloseTo(59, 0);
  expect(px(style("head").paddingTop)).toBe(18);
  expect(px(style("head").paddingLeft)).toBe(20);
  expect(px(style("head").paddingBottom)).toBe(16);
  expect(px(style("head").borderBottomWidth)).toBe(1);
  expect(px(style("body").paddingTop)).toBe(4);
  expect(px(style("body").paddingBottom)).toBe(12);
  expect(px(style("group").paddingTop)).toBe(8);
  expect(px(style("group").paddingBottom)).toBe(8);
  expect(rect("group-name").height).toBeCloseTo(32, 0);
  expect(px(style("group-name").paddingLeft)).toBe(20);
  for (const id of ["item-included", "item-excluded", "item-text"]) expect(rect(id).height, id).toBeCloseTo(35, 0);
  expect(px(style("item-included").paddingLeft)).toBe(20);
  expect(px(style("item-included").columnGap)).toBe(12);
  for (const id of ["check", "dash"]) {
    expect(rect(id).width, id).toBeCloseTo(16, 1);
    expect(rect(id).height, id).toBeCloseTo(16, 1);
  }
  // 값은 항목의 끝에 선다.
  expect(rect("item-included").right - rect("value-included").right).toBeCloseTo(20, 0);
});

test("값 셋 — 체크 stroke-strong · 대시 fg-secondary 16 · 텍스트 caption semibold fg-primary", async () => {
  await render(<Table />);
  expect(style("value-included").color).toBe(tokenColor("color-stroke-strong"));
  expect(style("check").color).toBe(tokenColor("color-stroke-strong"));
  expect(style("dash").color).toBe(tokenColor("color-fg-secondary"));
  expect(px(style("dash").fontSize)).toBe(16);
  expect(style("dash").textAlign).toBe("center");
  const text = style("value-text");
  expect(text.color).toBe(tokenColor("color-fg-primary"));
  expect(px(text.fontSize)).toBe(12);
  expect(text.fontWeight).toBe("600");
  expect(style("feature").color).toBe(tokenColor("color-fg-secondary"));
  expect(px(style("feature").fontSize)).toBe(14);
  expect(style("group-name").color).toBe(tokenColor("color-fg-secondary"));
  expect(style("head").color).toBe(tokenColor("color-fg-primary"));
});

test("좁은 판 — 767 에서 최소 640 · 안쪽 14 · 머리 14 · 14 · 12(51), 768 에서 760 · 20 · 59", async () => {
  await page.viewport(768, 900);
  await render(<Table width={760} />);
  expect(px(style("grid").minWidth)).toBe(760);
  expect(px(style("item-included").paddingLeft)).toBe(20);
  expect(rect("head").height).toBeCloseTo(59, 0);
  await page.viewport(767, 900);
  await expect.poll(() => px(style("grid").minWidth)).toBe(640);
  expect(px(style("item-included").paddingLeft)).toBe(14);
  expect(px(style("group-name").paddingLeft)).toBe(14);
  expect(px(style("head").paddingTop)).toBe(14);
  expect(px(style("head").paddingLeft)).toBe(14);
  expect(px(style("head").paddingBottom)).toBe(12);
  expect(rect("head").height).toBeCloseTo(51, 0);
});

test("좁은 자리에서 스크롤 칸이 구른다", async () => {
  await render(<Table width={500} />);
  const scroll = find("scroll");
  expect(getComputedStyle(scroll).overflowX).toBe("auto");
  expect(scroll.scrollWidth).toBeGreaterThan(scroll.clientWidth);
  expect(rect("grid").width).toBeCloseTo(760, 0);
});

test("접근 — 열은 group(머리 이름), 체크 · 대시는 이름 있는 그림", async () => {
  await render(<Table />);
  const column = find("column-0");
  expect(column.getAttribute("role")).toBe("group");
  expect(document.getElementById(column.getAttribute("aria-labelledby") ?? "")?.textContent).toBe("Trial");
  expect(find("check").getAttribute("role")).toBe("img");
  expect(find("check").getAttribute("aria-label")).toBe("포함");
  expect(find("dash").getAttribute("aria-label")).toBe("미포함");
});

test("호버 규칙이 없다 — 읽기 전용 비교다", () => {
  const offenders: string[] = [];
  const walk = (rules: CSSRuleList): void => {
    for (const rule of Array.from(rules)) {
      if (rule instanceof CSSMediaRule || rule instanceof CSSLayerBlockRule) walk(rule.cssRules);
      else if (rule instanceof CSSStyleRule && rule.selectorText.includes("louis-plan-comparison") && rule.selectorText.includes(":hover")) {
        offenders.push(rule.selectorText);
      }
    }
  };
  for (const sheet of Array.from(document.styleSheets)) walk(sheet.cssRules);
  expect(offenders).toEqual([]);
});

for (const theme of ["light", "dark"] as const) {
  test(`대비(${theme}) — 글자 4.5 이상, 체크 3 이상(실측, bg-surface 위)`, async () => {
    document.documentElement.setAttribute("data-theme", theme);
    await render(<Table />);
    const values = {
      title: textContrast(find("title")),
      head: textContrast(find("head")),
      groupName: textContrast(find("group-name")),
      feature: textContrast(find("feature")),
      dash: textContrast(find("dash")),
      text: textContrast(find("value-text")),
    };
    for (const [name, value] of Object.entries(values)) expect(value, `${theme} ${name}`).toBeGreaterThanOrEqual(4.5);
    const ground = backdrop(find("ground"));
    const check = ratio(parseColor(style("check").color), ground);
    expect(check, `${theme} check`).toBeGreaterThanOrEqual(3);
    expect(check, `${theme} check`).toBeCloseTo(theme === "light" ? 4.43 : 3.74, 1);
    expect(values.head, `${theme} head`).toBeCloseTo(16.54, 1);
    expect(values.feature, `${theme} feature`).toBeCloseTo(theme === "light" ? 9.23 : 7.24, 1);
  });
}
