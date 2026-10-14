// figma/components.measured.json 의 **table-header-cell · table-cell · table** 기하를 코드가 여전히 만드는지 잰다
// (DS-D-0035 (c)). 표는 React 표면이 없는 CSS 레시피(packages/css/src/component/table.css)라 문서(design/components/table.md)의
// `<table class="louis-table">` 마크업을 렌더한다. 키는 Figma 의 Align 축(start · center · end)이고 `data-align` 으로 만든다.
import type { JSX } from "react";
import { beforeEach, expect, test } from "vitest";
import { page } from "vitest/browser";
import { render } from "vitest-browser-react";
import measured from "../../../figma/components.measured.json" with { type: "json" };
import "@klipse-design/css/layers.css";
import "@klipse-design/css/tokens.css";
import "@klipse-design/css/styles.css";
import { find, px } from "./fixtures/contrast";

type Sizes = Record<string, Record<string, unknown>>;

/** `sizes` 한 칸의 수 필드. `$…` 사유와 한 객체에 섞여 있어 타입이 열려 있다 — 수가 아니면 던진다. */
function num(spec: Record<string, unknown>, field: string, label: string): number {
  const value = spec[field];
  if (typeof value !== "number") throw new Error(`${label}.${field}가 수가 아닙니다`);
  return value;
}

const headerSizes = measured.components["table-header-cell"].sizes as unknown as Sizes;
const cellSizes = measured.components["table-cell"].sizes as unknown as Sizes;
const tableSizes = measured.components["table"].sizes as unknown as Sizes;

beforeEach(async () => {
  await page.viewport(1440, 900);
});

/** 문서 마크업 — 머리 한 행 · 본문 세 행. 한 열의 정렬을 `align` 으로 바꾼다. */
function Table({ align }: { align: string | undefined }): JSX.Element {
  return (
    <table className="louis-table" style={{ inlineSize: 480 }} data-testid="table">
      <thead>
        <tr data-testid="head-row">
          <th scope="col" data-align={align} data-testid="th">
            항목
          </th>
          <th scope="col">값</th>
        </tr>
      </thead>
      <tbody>
        {[1, 2, 3].map((row) => (
          <tr key={row} data-testid={`row-${row}`}>
            <td data-align={align} data-testid={`td-${row}`}>
              <span data-testid={`label-${row}`}>값 {row}</span>
            </td>
            <td>{row}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

const alignOf = (key: string): string | undefined => (key === "start" ? undefined : key);

for (const [key, spec] of Object.entries(headerSizes)) {
  test(`table-header-cell ${key} — 높이(파생) · 여백 · 라벨 크기 · 행 높이가 기록과 같다`, async () => {
    const label = `table-header-cell.${key}`;
    await render(<Table align={alignOf(key)} />);
    const th = find("th");
    const style = getComputedStyle(th);
    expect(th.getBoundingClientRect().height, `${label} height`).toBe(num(spec, "height", label));
    expect(px(style.paddingTop), `${label} paddingBlock 위`).toBe(num(spec, "paddingBlock", label));
    expect(px(style.paddingBottom), `${label} paddingBlock 아래`).toBe(num(spec, "paddingBlock", label));
    expect(px(style.paddingLeft), `${label} paddingInline 왼`).toBe(num(spec, "paddingInline", label));
    expect(px(style.paddingRight), `${label} paddingInline 오른`).toBe(num(spec, "paddingInline", label));
    expect(px(style.fontSize), `${label} labelFontSize`).toBe(num(spec, "labelFontSize", label));
    expect(px(style.lineHeight), `${label} labelLineHeight`).toBe(num(spec, "labelLineHeight", label));
    expect(style.textAlign, `${label} 정렬`).toBe(key === "start" ? "start" : key);
  });
}

for (const [key, spec] of Object.entries(cellSizes)) {
  test(`table-cell ${key} — 여백 · 라벨 크기 · 구분선 · 행 높이(파생)가 기록과 같다`, async () => {
    const label = `table-cell.${key}`;
    await render(<Table align={alignOf(key)} />);
    const td = find("td-1");
    const style = getComputedStyle(td);
    expect(px(style.paddingTop), `${label} paddingBlock 위`).toBe(num(spec, "paddingBlock", label));
    expect(px(style.paddingBottom), `${label} paddingBlock 아래`).toBe(num(spec, "paddingBlock", label));
    expect(px(style.paddingLeft), `${label} paddingInline 왼`).toBe(num(spec, "paddingInline", label));
    expect(px(style.paddingRight), `${label} paddingInline 오른`).toBe(num(spec, "paddingInline", label));
    expect(px(style.fontSize), `${label} labelFontSize`).toBe(num(spec, "labelFontSize", label));
    expect(px(style.lineHeight), `${label} labelLineHeight`).toBe(num(spec, "labelLineHeight", label));
    expect(px(style.borderBottomWidth), `${label} borderWidth`).toBe(num(spec, "borderWidth", label));
    // 행 높이는 파생이다 — 구분선 1 이 상자에 들어가 38, 마지막 행은 37.
    expect(td.getBoundingClientRect().height, `${label} height`).toBe(num(spec, "height", label));
    expect(find("td-3").getBoundingClientRect().height, `${label} lastRowHeight`).toBe(num(spec, "lastRowHeight", label));
  });
}

test("table base — 머리 행 높이 · 행 사이 0 · 본문 행 높이가 기록과 같다", async () => {
  const spec = tableSizes["base"];
  if (spec === undefined) throw new Error("table.sizes.base 가 없습니다");
  const label = "table.base";
  await render(<Table align={undefined} />);
  expect(find("head-row").getBoundingClientRect().height, `${label} headerRowHeight`).toBe(num(spec, "headerRowHeight", label));
  expect(px(getComputedStyle(find("table")).borderSpacing), `${label} rowGap`).toBe(num(spec, "rowGap", label));
  expect(find("row-2").getBoundingClientRect().top - find("row-1").getBoundingClientRect().bottom, `${label} 행 사이`).toBe(
    num(spec, "rowGap", label),
  );
  expect(find("row-1").getBoundingClientRect().height, `${label} rowHeight`).toBe(num(spec, "rowHeight", label));
  expect(find("row-3").getBoundingClientRect().height, `${label} lastRowHeight`).toBe(num(spec, "lastRowHeight", label));
});
