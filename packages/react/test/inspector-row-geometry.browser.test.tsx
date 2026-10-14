// figma/components.measured.json 의 **inspector-row** 값을 코드가 여전히 만드는지 검증한다(DS-D-0035 (c)).
//
// 한 기록에 키가 둘이다 — `row` 는 InspectorRow 의 계약이 읽고(sizeKey row), `head` 는 InspectorSectionHead 의 계약이
// 읽는다(sizeKey head, measuredId 가 같은 inspector-row). 그래서 이 파일 하나가 두 set 의 (c) 를 함께 닫는다.
// React 표면이 없어 packages/css/src/component/inspector-row.css 의 클래스 마크업을 렌더한다.
//
// 행은 값 형태 넷(Text · Number · Color · Pill)을 다 세운다. Figma 되읽기가 네 변형을 한 키로 모으는 것은 «값 형태가 행의
// 기하를 바꾸지 않는다»는 계약이라, 행 상자의 칸은 네 행 모두에서 같아야 한다. 패널 폭 224 는 디자인 원본의 표본이다.
import type { JSX } from "react";
import { afterEach, expect, test } from "vitest";
import { page } from "vitest/browser";
import { render } from "vitest-browser-react";
import measured from "../../../figma/components.measured.json" with { type: "json" };
import "@klipse-design/css/layers.css";
import "@klipse-design/css/tokens.css";
import "@klipse-design/css/styles.css";
import { find, px } from "./fixtures/contrast";

type Spec = Record<string, unknown>;

afterEach(async () => {
  await page.viewport(1440, 900);
});

const sizes = measured.components["inspector-row"].sizes as Record<string, Spec>;

function spec(key: string): Spec {
  const value = sizes[key];
  if (value === undefined) throw new Error(`inspector-row 기록에 ${key} 키가 없습니다`);
  return value;
}

function num(record: Spec, field: string, label: string): number {
  const value = record[field];
  if (typeof value !== "number") throw new Error(`${label}.${field}가 수가 아닙니다`);
  return value;
}

/** 기록의 수치 칸(사유 `$…` 제외) 목록. */
const fieldsOf = (record: Spec): string[] => Object.keys(record).filter((field) => !field.startsWith("$")).sort();

const VALUE_FORMS = ["text", "number", "color", "pill"] as const;

function Rows(): JSX.Element {
  return (
    <div style={{ inlineSize: 224, display: "flex", flexDirection: "column", gap: 4 }}>
      <div className="louis-inspector-row" data-testid="row-text">
        <span className="louis-inspector-row__label" data-testid="label">
          길이
        </span>
        <span className="louis-inspector-row__value" data-testid="value-text">
          <span className="louis-inspector-row__text" data-testid="value-text-glyphs">
            00:12
          </span>
        </span>
      </div>
      <div className="louis-inspector-row" data-testid="row-number">
        <span className="louis-inspector-row__label">X</span>
        <span className="louis-inspector-row__value">
          <input className="louis-inspector-row__number" defaultValue="120" aria-label="X" data-testid="number" />
        </span>
      </div>
      <div className="louis-inspector-row" data-testid="row-color">
        <span className="louis-inspector-row__label">색</span>
        <span className="louis-inspector-row__value" data-testid="value-color">
          <span className="louis-inspector-row__dot" style={{ background: "#ff5500" }} data-testid="dot" />
          <span className="louis-inspector-row__text">#FF5500</span>
        </span>
      </div>
      <div className="louis-inspector-row" data-testid="row-pill">
        <span className="louis-inspector-row__label">전환</span>
        <span className="louis-inspector-row__value">
          <span className="louis-inspector-row__pill" data-testid="pill">
            <span className="louis-inspector-row__dot" style={{ background: "#888888" }} />
            자동
          </span>
        </span>
      </div>
    </div>
  );
}

function Head(): JSX.Element {
  return (
    <div style={{ inlineSize: 224 }}>
      <div className="louis-inspector-section-head" data-testid="head">
        <h3 className="louis-inspector-section-head__title" data-testid="title">
          효과
        </h3>
        <div className="louis-inspector-section-head__tail" data-testid="tail">
          <span className="louis-inspector-section-head__meta" data-testid="meta">
            3개
          </span>
          <button type="button" className="louis-inspector-section-head__action" aria-label="효과 추가" data-testid="action">
            <svg className="louis-inspector-section-head__glyph" viewBox="0 0 16 16" aria-hidden="true" data-testid="glyph">
              <path d="M8 3v10M3 8h10" stroke="currentColor" fill="none" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

/** row 키의 칸 → 그 칸을 재는 방법. 기록에 칸이 늘었는데 여기 없으면 아래 시험이 실패한다. */
const ROW_FIELDS = [
  "height",
  "mobileHeight",
  "paddingBlock",
  "paddingInline",
  "gap",
  "radius",
  "borderWidth",
  "labelFontSize",
  "valueFontSize",
  "valueGap",
  "dotSize",
  "pillHeight",
  "pillPaddingInline",
  "pillGap",
  "pillRadius",
  "pillBorderWidth",
  "numberWidth",
  "numberHeight",
  "numberPaddingInline",
  "numberRadius",
  "numberFontSize",
];

test("inspector-row.row: 행 상자가 네 값 형태 모두에서 기록과 같다", async () => {
  const record = spec("row");
  const label = "inspector-row.row";
  expect(fieldsOf(record), `${label} 기록의 칸이 이 시험이 재는 칸과 같다`).toEqual([...ROW_FIELDS].sort());
  await page.viewport(1440, 900);
  await render(<Rows />);
  for (const form of VALUE_FORMS) {
    const at = `${label}[${form}]`;
    const node = find(`row-${form}`);
    const style = getComputedStyle(node);
    expect(node.getBoundingClientRect().height, `${at}.height`).toBeCloseTo(num(record, "height", label), 1);
    expect(px(style.paddingTop), `${at}.paddingBlock`).toBe(num(record, "paddingBlock", label));
    expect(px(style.paddingBottom), `${at}.paddingBlock(end)`).toBe(num(record, "paddingBlock", label));
    expect(px(style.paddingLeft), `${at}.paddingInline`).toBe(num(record, "paddingInline", label));
    expect(px(style.paddingRight), `${at}.paddingInline(end)`).toBe(num(record, "paddingInline", label));
    expect(px(style.columnGap), `${at}.gap`).toBe(num(record, "gap", label));
    expect(px(style.borderTopLeftRadius), `${at}.radius`).toBe(num(record, "radius", label));
    expect(px(style.borderBottomRightRadius), `${at}.radius`).toBe(num(record, "radius", label));
    expect(px(style.borderTopWidth), `${at}.borderWidth`).toBe(num(record, "borderWidth", label));
    expect(px(style.borderLeftWidth), `${at}.borderWidth`).toBe(num(record, "borderWidth", label));
    expect(style.flexDirection, `${at}.layoutMode`).toBe("row");
  }
});

test("inspector-row.row: 라벨 · 값 자리 · 점 · 알약 · 숫자 칸이 기록과 같다", async () => {
  const record = spec("row");
  const label = "inspector-row.row";
  await page.viewport(1440, 900);
  await render(<Rows />);
  expect(px(getComputedStyle(find("label")).fontSize), `${label}.labelFontSize`).toBe(num(record, "labelFontSize", label));
  expect(px(getComputedStyle(find("value-text-glyphs")).fontSize), `${label}.valueFontSize`).toBe(
    num(record, "valueFontSize", label),
  );
  expect(px(getComputedStyle(find("value-color")).columnGap), `${label}.valueGap`).toBe(num(record, "valueGap", label));

  const dot = find("dot").getBoundingClientRect();
  expect(dot.width, `${label}.dotSize`).toBe(num(record, "dotSize", label));
  expect(dot.height, `${label}.dotSize`).toBe(num(record, "dotSize", label));

  const pill = find("pill");
  const pillStyle = getComputedStyle(pill);
  expect(pill.getBoundingClientRect().height, `${label}.pillHeight`).toBeCloseTo(num(record, "pillHeight", label), 1);
  expect(px(pillStyle.paddingLeft), `${label}.pillPaddingInline`).toBe(num(record, "pillPaddingInline", label));
  expect(px(pillStyle.paddingRight), `${label}.pillPaddingInline(end)`).toBe(num(record, "pillPaddingInline", label));
  expect(px(pillStyle.paddingTop), `${label}.pill paddingBlock`).toBe(0);
  expect(px(pillStyle.paddingBottom), `${label}.pill paddingBlock(end)`).toBe(0);
  expect(px(pillStyle.columnGap), `${label}.pillGap`).toBe(num(record, "pillGap", label));
  expect(px(pillStyle.borderTopLeftRadius), `${label}.pillRadius`).toBe(num(record, "pillRadius", label));
  expect(px(pillStyle.borderTopWidth), `${label}.pillBorderWidth`).toBe(num(record, "pillBorderWidth", label));
  expect(px(pillStyle.borderLeftWidth), `${label}.pillBorderWidth`).toBe(num(record, "pillBorderWidth", label));

  const number = find("number");
  const numberStyle = getComputedStyle(number);
  const numberBox = number.getBoundingClientRect();
  expect(numberBox.width, `${label}.numberWidth`).toBe(num(record, "numberWidth", label));
  expect(numberBox.height, `${label}.numberHeight`).toBe(num(record, "numberHeight", label));
  expect(px(numberStyle.paddingLeft), `${label}.numberPaddingInline`).toBe(num(record, "numberPaddingInline", label));
  expect(px(numberStyle.paddingRight), `${label}.numberPaddingInline(end)`).toBe(num(record, "numberPaddingInline", label));
  expect(px(numberStyle.paddingTop), `${label}.number paddingBlock`).toBe(0);
  expect(px(numberStyle.paddingBottom), `${label}.number paddingBlock(end)`).toBe(0);
  expect(px(numberStyle.borderTopLeftRadius), `${label}.numberRadius`).toBe(num(record, "numberRadius", label));
  expect(px(numberStyle.fontSize), `${label}.numberFontSize`).toBe(num(record, "numberFontSize", label));
});

test("inspector-row.row: 손가락 폭(719 이하)에서 행이 mobileHeight 로 자란다", async () => {
  const record = spec("row");
  const label = "inspector-row.row";
  await page.viewport(375, 812);
  await render(<Rows />);
  for (const form of VALUE_FORMS) {
    expect(find(`row-${form}`).getBoundingClientRect().height, `${label}[${form}].mobileHeight`).toBeCloseTo(
      num(record, "mobileHeight", label),
      1,
    );
  }
});

const HEAD_FIELDS = [
  "paddingBlock",
  "paddingBlockEnd",
  "paddingInline",
  "radius",
  "borderWidth",
  "rowGap",
  "tailGap",
  "titleFontSize",
  "metaFontSize",
  "actionSize",
  "actionRadius",
  "glyphSize",
];

test("inspector-row.head: 절 머리 · 꼬리 · 조작 · 글리프가 기록과 같다", async () => {
  const record = spec("head");
  const label = "inspector-row.head";
  expect(fieldsOf(record), `${label} 기록의 칸이 이 시험이 재는 칸과 같다`).toEqual([...HEAD_FIELDS].sort());
  await page.viewport(1440, 900);
  await render(<Head />);
  const head = getComputedStyle(find("head"));
  expect(px(head.paddingTop), `${label}.paddingBlock`).toBe(num(record, "paddingBlock", label));
  expect(px(head.paddingBottom), `${label}.paddingBlockEnd`).toBe(num(record, "paddingBlockEnd", label));
  expect(px(head.paddingLeft), `${label}.paddingInline`).toBe(num(record, "paddingInline", label));
  expect(px(head.paddingRight), `${label}.paddingInline(end)`).toBe(num(record, "paddingInline", label));
  expect(px(head.borderTopLeftRadius), `${label}.radius`).toBe(num(record, "radius", label));
  // 밑줄이 없는 것이 계약이다 — 테두리 어느 변에도 두께가 없다.
  for (const side of ["borderTopWidth", "borderRightWidth", "borderBottomWidth", "borderLeftWidth"] as const) {
    expect(px(head[side]), `${label}.borderWidth(${side})`).toBe(num(record, "borderWidth", label));
  }
  expect(px(head.columnGap), `${label}.rowGap`).toBe(num(record, "rowGap", label));
  expect(head.flexDirection, `${label}.layoutMode`).toBe("row");
  expect(px(getComputedStyle(find("tail")).columnGap), `${label}.tailGap`).toBe(num(record, "tailGap", label));
  expect(px(getComputedStyle(find("title")).fontSize), `${label}.titleFontSize`).toBe(num(record, "titleFontSize", label));
  expect(px(getComputedStyle(find("meta")).fontSize), `${label}.metaFontSize`).toBe(num(record, "metaFontSize", label));

  const action = find("action");
  const actionBox = action.getBoundingClientRect();
  expect(actionBox.width, `${label}.actionSize`).toBe(num(record, "actionSize", label));
  expect(actionBox.height, `${label}.actionSize`).toBe(num(record, "actionSize", label));
  expect(px(getComputedStyle(action).borderTopLeftRadius), `${label}.actionRadius`).toBe(num(record, "actionRadius", label));
  const glyph = find("glyph").getBoundingClientRect();
  expect(glyph.width, `${label}.glyphSize`).toBe(num(record, "glyphSize", label));
  expect(glyph.height, `${label}.glyphSize`).toBe(num(record, "glyphSize", label));
});
