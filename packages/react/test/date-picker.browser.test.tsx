// Date Picker(`.louis-date-picker`)의 레시피가 실제로 그 격자 · 칸 상태 · 세 열 시각 · 치수 · 대비를 만드는지 잰다(DS-D-0096).
//
// **React 표면이 아니라 클래스 마크업을 렌더한다.** 정본은 packages/css/src/component/date-picker.css 이고 마크업은
// design/components/date-picker.md 의 예시 그대로다. 부품은 면이 없어 composite 팝오버(캔버스 면) 안에 놓고 잰다 — 제품 유튜브 노드 예약과 같은 자리다.
// 대비는 토큰 값으로 손 계산하지 않고 계산 색을 실제 바탕에 합성해 잰다(fixtures/contrast).
import type { JSX } from "react";
import { afterEach, expect, test } from "vitest";
import { userEvent } from "vitest/browser";
import { render } from "vitest-browser-react";
import "@klipse-design/css/layers.css";
import "@klipse-design/css/tokens.css";
import "@klipse-design/css/styles.css";
import { contrastOn, find, over, parseColor, px, ratio, tokenColor } from "./fixtures/contrast";

afterEach(() => {
  document.documentElement.removeAttribute("data-theme");
  document.documentElement.removeAttribute("dir");
});

const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"] as const;

/** 한 달을 6주 42칸으로 편다 — 소비처의 달 계산(일요일 시작). */
function monthCells(year: number, month: number): (number | null)[] {
  const first = new Date(year, month - 1, 1).getDay();
  const days = new Date(year, month, 0).getDate();
  const cells: (number | null)[] = Array.from({ length: first }, () => null);
  for (let day = 1; day <= days; day += 1) cells.push(day);
  while (cells.length < 42) cells.push(null);
  return cells;
}

function Popover({ children, testId = "popover" }: { readonly children: JSX.Element; readonly testId?: string }): JSX.Element {
  return (
    <div style={{ padding: 24 }}>
      <div
        className="louis-popover"
        data-kind="composite-popover"
        data-louis-scope="canvas"
        role="dialog"
        aria-label="예약 날짜 선택"
        style={{ inlineSize: "max-content" }}
        data-testid={testId}
      >
        {children}
      </div>
    </div>
  );
}

function Calendar({
  year = 2026,
  month = 10,
  selected = 13,
  today = 13,
  disabledBefore = 13,
  footer = true,
  inline = false,
}: {
  readonly year?: number;
  readonly month?: number;
  readonly selected?: number;
  readonly today?: number;
  readonly disabledBefore?: number;
  readonly footer?: boolean;
  readonly inline?: boolean;
}): JSX.Element {
  const cells = monthCells(year, month);
  const rows = Array.from({ length: 6 }, (_, row) => cells.slice(row * 7, row * 7 + 7));
  return (
    <div className="louis-date-picker" data-mode="date" data-layout={inline ? "inline" : undefined} data-testid="picker">
      <div className="louis-date-picker__header" data-testid="header">
        <button type="button" className="louis-icon-button" data-variant="secondary" data-size="md" aria-label="이전 달" data-testid="prev" />
        <h2 className="louis-date-picker__title" id="dp-title" aria-live="polite" data-testid="title">
          {year}년 {month}월
        </h2>
        <button type="button" className="louis-icon-button" data-variant="secondary" data-size="md" aria-label="다음 달" data-testid="next" />
      </div>
      <table className="louis-date-picker__grid" role="grid" aria-labelledby="dp-title" data-testid="grid">
        <thead>
          <tr>
            {WEEKDAYS.map((name, index) => (
              <th key={name} className="louis-date-picker__weekday" scope="col" abbr={`${name}요일`} data-testid={`weekday-${index}`}>
                {name}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, rowIndex) => (
            <tr key={rowIndex} data-testid={`row-${rowIndex}`}>
              {row.map((day, column) =>
                day === null ? (
                  <td key={column} className="louis-date-picker__cell" data-testid={`cell-${rowIndex}-${column}`} />
                ) : (
                  <td
                    key={column}
                    className="louis-date-picker__cell"
                    aria-selected={day === selected}
                    data-testid={`cell-${rowIndex}-${column}`}
                  >
                    <button
                      type="button"
                      className="louis-date-picker__day"
                      tabIndex={day === selected ? 0 : -1}
                      aria-disabled={day < disabledBefore ? true : undefined}
                      aria-current={day === today ? "date" : undefined}
                      aria-label={`${year}년 ${month}월 ${day}일`}
                      data-testid={`day-${day}`}
                    >
                      {day}
                    </button>
                  </td>
                ),
              )}
            </tr>
          ))}
        </tbody>
      </table>
      {footer ? (
        <div className="louis-date-picker__footer" data-testid="footer">
          <button type="button" className="louis-button" data-variant="ghost" data-size="md" data-testid="today">
            오늘
          </button>
        </div>
      ) : null}
    </div>
  );
}

const two = (value: number): string => String(value).padStart(2, "0");

function Time(): JSX.Element {
  const hours = [12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
  const minutes = Array.from({ length: 60 }, (_, index) => index);
  return (
    <div className="louis-date-picker" data-mode="time" data-testid="picker">
      <div className="louis-date-picker__time" data-testid="time">
        <div className="louis-date-picker__column" data-testid="column-0">
          <span className="louis-date-picker__column-label" aria-hidden="true" data-testid="label-0" />
          <div className="louis-date-picker__listbox" role="listbox" tabIndex={0} aria-label="오전/오후" aria-activedescendant="t-am" data-testid="listbox-0">
            <div className="louis-date-picker__option" role="option" id="t-am" aria-selected="true" data-testid="option-am">
              오전
            </div>
            <div className="louis-date-picker__option" role="option" id="t-pm" aria-selected="false" data-highlighted="true" data-testid="option-pm">
              오후
            </div>
          </div>
        </div>
        <div className="louis-date-picker__column" data-testid="column-1">
          <span className="louis-date-picker__column-label" id="t-hour" data-testid="label-1">
            시
          </span>
          <div className="louis-date-picker__listbox" role="listbox" tabIndex={0} aria-labelledby="t-hour" data-testid="listbox-1">
            {hours.map((hour) => (
              <div key={hour} className="louis-date-picker__option" role="option" id={`t-h${two(hour)}`} aria-selected={hour === 3} data-testid={`hour-${hour}`}>
                {two(hour)}
              </div>
            ))}
          </div>
        </div>
        <div className="louis-date-picker__column" data-testid="column-2">
          <span className="louis-date-picker__column-label" id="t-minute" data-testid="label-2">
            분
          </span>
          <div className="louis-date-picker__listbox" role="listbox" tabIndex={0} aria-labelledby="t-minute" data-testid="listbox-2">
            {minutes.map((minute) => (
              <div
                key={minute}
                className="louis-date-picker__option"
                role="option"
                id={`t-m${two(minute)}`}
                aria-selected={minute === 30 || minute === 5}
                aria-disabled={minute < 10 ? true : undefined}
                data-testid={`minute-${minute}`}
              >
                {two(minute)}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

const style = (testId: string): CSSStyleDeclaration => getComputedStyle(find(testId));
const rect = (testId: string): DOMRect => find(testId).getBoundingClientRect();
const TRANSPARENT = "rgba(0, 0, 0, 0)";

test("날짜 팝오버 296 × 370 — 내용 280, 머리 32 · 머리 → 격자 12 · 요일 → 첫 줄 8 · 칸 36 · 사이 4 · 격자 → 바닥 16", async () => {
  await render(
    <Popover>
      <Calendar />
    </Popover>,
  );
  expect(rect("popover").width).toBeCloseTo(296, 1);
  expect(rect("popover").height).toBeCloseTo(370, 1);
  expect(rect("picker").width).toBeCloseTo(280, 1);
  expect(rect("header").height).toBeCloseTo(32, 1);
  expect(px(style("header").columnGap)).toBe(8);
  expect(rect("weekday-0").top - rect("header").bottom).toBeCloseTo(12, 1);
  // 요일 글자 줄 18 + 아래 4 = 22. 첫 줄은 그 아래 사이 4 — 글자 → 첫 줄 8.
  expect(rect("weekday-0").height).toBeCloseTo(22, 1);
  expect(rect("cell-0-0").top - (rect("weekday-0").top + 18)).toBeCloseTo(8, 1);
  expect(rect("cell-0-0").height).toBeCloseTo(36, 1);
  expect(rect("cell-0-1").left - rect("cell-0-0").right).toBeCloseTo(4, 1);
  expect(rect("cell-1-0").top - rect("cell-0-0").bottom).toBeCloseTo(4, 1);
  // 격자 바깥 가장자리 — 칸이 내용 폭 끝에 닿는다(border-spacing 을 음수 여백으로 되먹었다).
  expect(rect("cell-0-0").left).toBeCloseTo(rect("picker").left, 1);
  expect(rect("cell-0-6").right).toBeCloseTo(rect("picker").right, 1);
  expect(rect("footer").top - rect("cell-5-0").bottom).toBeCloseTo(16, 1);
  expect(rect("today").height).toBeCloseTo(32, 1);
  expect(rect("today").right).toBeCloseTo(rect("picker").right, 1);
  expect(rect("prev").width).toBeCloseTo(32, 1);
  // 날짜 칸 버튼이 칸을 채운다 — 36 · 곡률 10 · body-sm · tabular-nums.
  const day = style("day-20");
  expect(rect("day-20").height).toBeCloseTo(36, 1);
  expect(rect("day-20").width).toBeCloseTo(rect("cell-2-2").width, 1);
  expect(px(day.borderTopLeftRadius)).toBe(10);
  expect(px(day.fontSize)).toBe(14);
  expect(day.fontVariantNumeric).toBe("tabular-nums");
  expect(style("picker").zIndex).toBe("auto");
});

test("요일 머리와 날짜 칸이 같은 열이다 — 가로 중심이 같다", async () => {
  await render(
    <Popover>
      <Calendar />
    </Popover>,
  );
  for (let column = 0; column < 7; column += 1) {
    const head = rect(`weekday-${column}`);
    const cell = rect(`cell-3-${column}`);
    expect(head.left + head.width / 2, `열 ${column}`).toBeCloseTo(cell.left + cell.width / 2, 1);
  }
});

test("늘 6주 — 네 주짜리 달(2026-02)도 높이가 같다", async () => {
  await render(
    <Popover>
      <Calendar />
    </Popover>,
  );
  const october = rect("popover").height;
  document.body.replaceChildren();
  await render(
    <Popover>
      <Calendar month={2} selected={0} today={0} disabledBefore={0} />
    </Popover>,
  );
  expect(rect("popover").height).toBeCloseTo(october, 1);
  expect(rect("cell-5-6").height).toBeCloseTo(36, 1);
});

test("인라인 — 폭을 놓인 자리에 맡긴다", async () => {
  await render(
    <div style={{ inlineSize: 420 }}>
      <Calendar inline footer={false} />
    </div>,
  );
  expect(rect("picker").width).toBeCloseTo(420, 1);
  expect(rect("cell-0-6").right).toBeCloseTo(rect("picker").right, 1);
  expect(rect("cell-0-0").height).toBeCloseTo(36, 1);
});

test("칸 상태 — 선택 뒤집힘 · 막힘 fg-disabled · 선택 + 막힘은 선택 면", async () => {
  await render(
    <Popover>
      <Calendar selected={5} today={13} disabledBefore={13} />
    </Popover>,
  );
  const selected = style("day-5");
  expect(selected.backgroundColor).toBe(tokenColor("color-accent-inverse", "backgroundColor"));
  expect(selected.color).toBe(tokenColor("color-fg-on-accent-inverse"));
  expect(selected.cursor).toBe("not-allowed");
  const past = style("day-4");
  expect(past.backgroundColor).toBe(TRANSPARENT);
  expect(past.color).toBe(tokenColor("color-fg-disabled"));
  expect(past.cursor).toBe("not-allowed");
  const rest = style("day-20");
  expect(rest.backgroundColor).toBe(TRANSPARENT);
  expect(rest.color).toBe(style("popover").color);
  expect(rest.cursor).toBe("pointer");
});

test("호버 — 쉼 칸은 잉크 8%, 막힌 칸은 면이 없다, 선택 칸은 그대로", async () => {
  await render(
    <Popover>
      <Calendar selected={20} />
    </Popover>,
  );
  await userEvent.hover(find("day-21"));
  await expect.poll(() => style("day-21").backgroundColor).toBe(tokenColor("color-accent-ghost-hover", "backgroundColor"));
  await userEvent.hover(find("day-4"));
  await expect.poll(() => style("day-4").backgroundColor).toBe(TRANSPARENT);
  await userEvent.hover(find("day-20"));
  await expect.poll(() => style("day-20").backgroundColor).toBe(tokenColor("color-accent-inverse", "backgroundColor"));
  await userEvent.unhover(find("day-20"));
});

test("키보드 위치 — 날짜 칸 :focus-visible 은 호버 면", async () => {
  await render(
    <Popover>
      <Calendar selected={0} />
    </Popover>,
  );
  find("day-21").tabIndex = 0;
  await userEvent.tab();
  await userEvent.tab();
  await userEvent.tab();
  // 이전 달 → 다음 달 → 격자의 0 칸 순서다.
  await expect.poll(() => document.activeElement?.getAttribute("data-testid")).toBe("day-21");
  expect(style("day-21").backgroundColor).toBe(tokenColor("color-accent-ghost-hover", "backgroundColor"));
});

for (const dir of ["ltr", "rtl"] as const) {
  test(`오늘 점(${dir}) — 4 × 4 · 아래 4 · 칸 가운데 · 글자색`, async () => {
    document.documentElement.setAttribute("dir", dir);
    await render(
      <Popover>
        <Calendar selected={20} today={13} />
      </Popover>,
    );
    const day = find("day-13");
    const dot = getComputedStyle(day, "::after");
    expect(dot.content).toBe('""');
    expect(px(dot.width)).toBe(4);
    expect(px(dot.height)).toBe(4);
    expect(px(dot.bottom)).toBe(4);
    const free = day.getBoundingClientRect().width - 4;
    expect(px(dot.marginLeft)).toBeCloseTo(free / 2, 1);
    expect(px(dot.marginRight)).toBeCloseTo(free / 2, 1);
    expect(dot.backgroundColor).toBe(getComputedStyle(day).color);
    expect(getComputedStyle(find("day-14"), "::after").content).toBe("none");
  });
}

test("시각 팝오버 256 × 234 — 내용 240, 열 사이 8 · 머리 18 → 우물 4 · 우물 상한 196 · 안쪽 2 · 곡률 12, 항목 36 · 사이 4", async () => {
  await render(
    <Popover>
      <Time />
    </Popover>,
  );
  expect(rect("popover").width).toBeCloseTo(256, 1);
  expect(rect("popover").height).toBeCloseTo(234, 1);
  expect(rect("picker").width).toBeCloseTo(240, 1);
  expect(rect("column-1").left - rect("column-0").right).toBeCloseTo(8, 1);
  for (const index of [0, 1, 2]) {
    expect(rect(`label-${index}`).height, `머리 ${index}`).toBeCloseTo(18, 1);
    expect(rect(`listbox-${index}`).top - rect(`label-${index}`).bottom, `머리 → 우물 ${index}`).toBeCloseTo(4, 1);
  }
  // 오전/오후 머리가 비어도 세 우물의 위 끝이 같다.
  expect(rect("listbox-0").top).toBeCloseTo(rect("listbox-1").top, 1);
  expect(rect("listbox-0").top).toBeCloseTo(rect("listbox-2").top, 1);
  const well = style("listbox-2");
  expect(rect("listbox-2").height).toBeCloseTo(196, 1);
  expect(find("listbox-2").scrollHeight).toBeGreaterThan(find("listbox-2").clientHeight);
  expect(well.overflowY).toBe("auto");
  expect(px(well.paddingTop)).toBe(2);
  expect(px(well.borderTopLeftRadius)).toBe(12);
  expect(well.backgroundColor).toBe(tokenColor("color-accent-secondary", "backgroundColor"));
  // 오전/오후 우물은 두 항목만큼 — 36 × 2 + 4 + 2 × 2 = 80.
  expect(rect("listbox-0").height).toBeCloseTo(80, 1);
  expect(rect("minute-11").height).toBeCloseTo(36, 1);
  expect(rect("minute-12").top - rect("minute-11").bottom).toBeCloseTo(4, 1);
  expect(rect("minute-11").width).toBeCloseTo(rect("listbox-2").width - 4, 1);
});

test("시각 항목 상태 — 선택 뒤집힘 · 키보드 위치 · 막힘 · 막힌 항목 호버 없음 · 선택 + 막힘은 선택 면", async () => {
  await render(
    <Popover>
      <Time />
    </Popover>,
  );
  expect(style("option-am").backgroundColor).toBe(tokenColor("color-accent-inverse", "backgroundColor"));
  expect(style("option-am").color).toBe(tokenColor("color-fg-on-accent-inverse"));
  expect(style("option-pm").backgroundColor).toBe(tokenColor("color-accent-ghost-hover", "backgroundColor"));
  expect(style("minute-3").color).toBe(tokenColor("color-fg-disabled"));
  expect(style("minute-3").cursor).toBe("not-allowed");
  expect(style("minute-5").backgroundColor).toBe(tokenColor("color-accent-inverse", "backgroundColor"));
  await userEvent.hover(find("minute-3"));
  await expect.poll(() => style("minute-3").backgroundColor).toBe(TRANSPARENT);
  await userEvent.hover(find("hour-7"));
  await expect.poll(() => style("hour-7").backgroundColor).toBe(tokenColor("color-accent-ghost-hover", "backgroundColor"));
  await userEvent.unhover(find("hour-7"));
});

test("호버 규칙은 모두 @media (hover: hover) 안이다", () => {
  const offenders: string[] = [];
  const walk = (rules: CSSRuleList, guarded: boolean): void => {
    for (const rule of Array.from(rules)) {
      if (rule instanceof CSSMediaRule) walk(rule.cssRules, guarded || rule.conditionText.includes("hover: hover"));
      else if (rule instanceof CSSLayerBlockRule) walk(rule.cssRules, guarded);
      else if (rule instanceof CSSStyleRule && rule.selectorText.includes("louis-date-picker") && rule.selectorText.includes(":hover") && !guarded) {
        offenders.push(rule.selectorText);
      }
    }
  };
  for (const sheet of Array.from(document.styleSheets)) walk(sheet.cssRules, false);
  expect(offenders).toEqual([]);
});

for (const theme of ["light", "dark"] as const) {
  test(`대비(${theme}) — 선택 면 3 이상 · 선택 · 쉼 · 요일 · 달 이름 · 열 머리 · 우물 위 글자 4.5 이상(실측)`, async () => {
    document.documentElement.setAttribute("data-theme", theme);
    await render(
      <Popover>
        <Calendar selected={20} />
      </Popover>,
    );
    const surface = parseColor(style("popover").backgroundColor);
    expect(surface[3]).toBe(1);
    expect(style("popover").backgroundColor).toBe(tokenColor("color-canvas-menu-surface", "backgroundColor"));
    const selectedFill = over(parseColor(style("day-20").backgroundColor), surface);
    expect(ratio(selectedFill, surface), `${theme} 선택 면 대 쉼 면`).toBeGreaterThanOrEqual(3);
    expect(contrastOn(style("day-20").color, selectedFill), `${theme} 선택 글자`).toBeGreaterThanOrEqual(4.5);
    expect(contrastOn(style("day-21").color, surface), `${theme} 쉼 글자`).toBeGreaterThanOrEqual(4.5);
    const hover = over(parseColor(tokenColor("color-accent-ghost-hover", "backgroundColor")), surface);
    expect(contrastOn(style("day-21").color, hover), `${theme} 호버 위 글자`).toBeGreaterThanOrEqual(4.5);
    expect(contrastOn(style("weekday-0").color, surface), `${theme} 요일`).toBeGreaterThanOrEqual(4.5);
    expect(contrastOn(style("title").color, surface), `${theme} 달 이름`).toBeGreaterThanOrEqual(4.5);

    document.body.replaceChildren();
    await render(
      <Popover>
        <Time />
      </Popover>,
    );
    const ground = parseColor(style("popover").backgroundColor);
    expect(contrastOn(style("label-1").color, ground), `${theme} 열 머리`).toBeGreaterThanOrEqual(4.5);
    const well = over(parseColor(style("listbox-1").backgroundColor), ground);
    expect(contrastOn(style("hour-7").color, well), `${theme} 우물 위 글자`).toBeGreaterThanOrEqual(4.5);
    const chosen = over(parseColor(style("hour-3").backgroundColor), well);
    expect(ratio(chosen, well), `${theme} 우물 위 선택 면`).toBeGreaterThanOrEqual(3);
    expect(contrastOn(style("hour-3").color, chosen), `${theme} 우물 위 선택 글자`).toBeGreaterThanOrEqual(4.5);
  });
}
