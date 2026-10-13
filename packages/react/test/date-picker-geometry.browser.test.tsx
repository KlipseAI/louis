// figma/components.measured.json 의 **date-picker-cell · date-picker-calendar · date-picker-time** 값을 코드가 여전히 만드는지 검증한다
// (DS-D-0035 (c), 2026-10-14 DS-D-0096).
//
// parity 게이트는 Figma 가 기록과 같은지만 본다. 이 파일이 없으면 CSS 가 조용히 바뀌어도 **Figma 와 기록은 서로 맞고 둘 다
// 코드와 틀린** 상태로 통과한다. 그래서 기록의 키(= Figma 되읽기의 축 키)마다 클래스 마크업을 렌더하고 기록의 필드를 계산값과 맞댄다.
// 대비 · 상태 색 · 오늘 점 · 호버 가드는 date-picker.browser.test.tsx 가 소유한다.
import type { JSX } from "react";
import { expect, test } from "vitest";
import { render } from "vitest-browser-react";
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

const style = (testId: string): CSSStyleDeclaration => getComputedStyle(find(testId));
const rect = (testId: string): DOMRect => find(testId).getBoundingClientRect();

function Cell({ selected, state }: { readonly selected: boolean; readonly state: string }): JSX.Element {
  return (
    <div className="louis-popover" data-kind="composite-popover" data-louis-scope="canvas" style={{ inlineSize: "max-content" }}>
      <div className="louis-date-picker" data-mode="date">
        <table className="louis-date-picker__grid" role="grid" aria-label="달력">
          <tbody>
            <tr>
              <td className="louis-date-picker__cell" aria-selected={selected}>
                <button
                  type="button"
                  className="louis-date-picker__day"
                  aria-disabled={state === "Disabled" ? true : undefined}
                  data-testid="day"
                >
                  13
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div className="louis-date-picker" data-mode="time">
        <div className="louis-date-picker__listbox" role="listbox" aria-label="분">
          <div
            className="louis-date-picker__option"
            role="option"
            aria-selected={selected}
            aria-disabled={state === "Disabled" ? true : undefined}
            data-testid="option"
          >
            30
          </div>
        </div>
      </div>
    </div>
  );
}

function Calendar({ inline }: { readonly inline: boolean }): JSX.Element {
  const days = Array.from({ length: 14 }, (_, index) => index + 1);
  return (
    <div style={{ inlineSize: 420 }}>
      <div className="louis-date-picker" data-mode="date" data-layout={inline ? "inline" : undefined} data-testid="picker">
        <div className="louis-date-picker__header" data-testid="header">
          <button type="button" className="louis-icon-button" data-variant="secondary" data-size="md" aria-label="이전 달" />
          <h2 className="louis-date-picker__title">2026년 10월</h2>
          <button type="button" className="louis-icon-button" data-variant="secondary" data-size="md" aria-label="다음 달" />
        </div>
        <table className="louis-date-picker__grid" role="grid" aria-label="2026년 10월">
          <thead>
            <tr>
              {["일", "월", "화", "수", "목", "금", "토"].map((name, index) => (
                <th key={name} className="louis-date-picker__weekday" scope="col" data-testid={`weekday-${index}`}>
                  {name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[0, 1].map((row) => (
              <tr key={row}>
                {days.slice(row * 7, row * 7 + 7).map((day) => (
                  <td key={day} className="louis-date-picker__cell" aria-selected={false} data-testid={`cell-${day}`}>
                    <button type="button" className="louis-date-picker__day">
                      {day}
                    </button>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        <div className="louis-date-picker__footer" data-testid="footer">
          <button type="button" className="louis-button" data-variant="ghost" data-size="md">
            오늘
          </button>
        </div>
      </div>
    </div>
  );
}

function Time(): JSX.Element {
  return (
    <div className="louis-date-picker" data-mode="time" data-testid="picker">
      <div className="louis-date-picker__time" data-testid="time">
        {["", "시", "분"].map((label, column) => (
          <div key={column} className="louis-date-picker__column" data-testid={`column-${column}`}>
            <span className="louis-date-picker__column-label" data-testid={`label-${column}`}>
              {label}
            </span>
            <div className="louis-date-picker__listbox" role="listbox" aria-label={label || "오전/오후"} data-testid={`listbox-${column}`}>
              {Array.from({ length: column === 0 ? 2 : 12 }, (_, index) => (
                <div key={index} className="louis-date-picker__option" role="option" aria-selected={false} data-testid={`option-${column}-${index}`}>
                  {String(index).padStart(2, "0")}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const cellSizes = measured.components["date-picker-cell"].sizes as Sizes;
for (const key of Object.keys(cellSizes)) {
  test(`기록 date-picker-cell ${key} — 날짜 칸과 시각 항목이 같은 값을 만든다`, async () => {
    const spec = cellSizes[key] ?? {};
    const label = `date-picker-cell.${key}`;
    const [selected, state] = key.split("/") as [string, string];
    await render(<Cell selected={selected === "true"} state={state} />);
    for (const testId of ["day", "option"]) {
      expect(rect(testId).height, `${testId} 높이`).toBeCloseTo(num(spec, "height", label), 1);
      const own = style(testId);
      expect(px(own.paddingLeft), `${testId} 좌`).toBe(num(spec, "paddingInline", label));
      expect(px(own.paddingRight), `${testId} 우`).toBe(num(spec, "paddingInline", label));
      expect(px(own.borderTopLeftRadius), `${testId} 반경`).toBe(num(spec, "radius", label));
      expect(px(own.fontSize), `${testId} 글자`).toBe(num(spec, "fontSize", label));
    }
  });
}

const calendarSizes = measured.components["date-picker-calendar"].sizes as Sizes;
for (const key of Object.keys(calendarSizes)) {
  test(`기록 date-picker-calendar ${key} — 머리 · 격자 · 바닥 간격`, async () => {
    const spec = calendarSizes[key] ?? {};
    const label = `date-picker-calendar.${key}`;
    await render(<Calendar inline={key === "inline"} />);
    expect(rect("picker").width).toBeCloseTo(key === "inline" ? 420 : 280, 1);
    expect(rect("header").height).toBeCloseTo(num(spec, "headerHeight", label), 1);
    expect(px(style("header").columnGap)).toBe(num(spec, "headerGap", label));
    expect(rect("weekday-0").top - rect("header").bottom).toBeCloseTo(num(spec, "headerToGrid", label), 1);
    expect(px(style("weekday-0").paddingBottom)).toBe(num(spec, "weekdayBelow", label));
    const gap = num(spec, "cellGap", label);
    expect(rect("cell-1").top - rect("weekday-0").bottom).toBeCloseTo(gap, 1);
    expect(rect("cell-2").left - rect("cell-1").right).toBeCloseTo(gap, 1);
    expect(rect("weekday-1").left - rect("weekday-0").right).toBeCloseTo(gap, 1);
    expect(rect("cell-8").top - rect("cell-1").bottom).toBeCloseTo(gap, 1);
    expect(rect("footer").top - rect("cell-8").bottom).toBeCloseTo(num(spec, "footerGap", label), 1);
  });
}

const timeSizes = measured.components["date-picker-time"].sizes as Sizes;
for (const key of Object.keys(timeSizes)) {
  test(`기록 date-picker-time ${key} — 폭 · 열 · 우물`, async () => {
    const spec = timeSizes[key] ?? {};
    const label = `date-picker-time.${key}`;
    await render(<Time />);
    expect(rect("picker").width).toBeCloseTo(num(spec, "width", label), 1);
    expect(px(style("time").columnGap)).toBe(num(spec, "columnGap", label));
    expect(px(style("column-1").rowGap)).toBe(num(spec, "columnStack", label));
    for (const column of [0, 1, 2]) expect(rect(`label-${column}`).height, `머리 ${column}`).toBeCloseTo(num(spec, "labelHeight", label), 1);
    expect(rect("column-1").height).toBeCloseTo(num(spec, "columnHeight", label), 1);
    const well = style("listbox-1");
    expect(px(well.paddingTop)).toBe(num(spec, "wellPadding", label));
    expect(px(well.paddingLeft)).toBe(num(spec, "wellPadding", label));
    expect(px(well.rowGap)).toBe(num(spec, "wellGap", label));
    expect(px(well.borderTopLeftRadius)).toBe(num(spec, "wellRadius", label));
  });
}
