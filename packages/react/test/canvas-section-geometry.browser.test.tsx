// figma/components.measured.json 의 **canvas-section · canvas-section-title-bar · canvas-section-color-button · canvas-section-tint-option ·
// canvas-section-palette** 값을 코드가 여전히 만드는지 검증한다(DS-D-0035 (c), 2026-10-14 DS-D-0093).
//
// parity 게이트는 Figma 가 기록과 같은지만 본다. 이 파일이 없으면 CSS 가 조용히 바뀌어도 **Figma 와 기록은 서로 맞고 둘 다
// 코드와 틀린** 상태로 통과한다. 그래서 기록의 키(= Figma 되읽기의 축 키)마다 클래스 마크업을 렌더하고 기록의 필드를 계산값과 맞댄다.
// 대비 · 말줄임 · 변 띠 · 호버 가드는 canvas-section.browser.test.tsx 가 소유한다.
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

/** 안쪽 그림자 두께 — 계산값 「색 0px 0px 0px 두께 inset」의 넷째 길이. */
function insetSpread(value: string, layer = 0): number {
  const part = value.split(/,(?![^(]*\))/)[layer]?.trim() ?? "";
  const lengths = part.replace(/^(color\([^)]*\)|rgba?\([^)]*\))/, "").trim().split(/\s+/).filter((token) => token.endsWith("px"));
  return px(lengths[3] ?? "0");
}

function Section({ selected, tint }: { readonly selected: boolean; readonly tint?: string | undefined }): JSX.Element {
  return (
    <div style={{ padding: "60px 24px 24px", background: "var(--louis-color-bg-canvas)" }}>
      <div
        className="louis-canvas-section"
        role="group"
        aria-label="섹션 1"
        data-selected={selected ? "true" : undefined}
        data-tint={tint}
        style={{ inlineSize: 480, blockSize: 240 }}
        data-testid="section"
      >
        <div className="louis-canvas-section__header" data-testid="header">
          <div className="louis-canvas-section__title-bar" data-testid="bar">
            <button type="button" className="louis-canvas-section__title" data-testid="title">
              섹션 1
            </button>
            <button type="button" className="louis-canvas-section__color-button" aria-label="섹션 색" aria-expanded="false" data-testid="color-button">
              <span className="louis-canvas-section__color-swatch" aria-hidden="true" data-testid="swatch" />
            </button>
          </div>
          <div className="louis-canvas-section__actions" data-testid="actions">
            <button type="button" className="louis-node-chrome-button" aria-label="섹션 도움말" />
            <button type="button" className="louis-node-chrome-button" data-tone="danger" aria-label="섹션 삭제" />
          </div>
        </div>
      </div>
    </div>
  );
}

function Palette(): JSX.Element {
  return (
    <div className="louis-popover" data-louis-scope="canvas" style={{ inlineSize: "max-content" }} data-testid="popover">
      <div className="louis-canvas-section__palette" role="radiogroup" aria-label="섹션 색" data-testid="palette">
        {["red", "yellow", "green", "blue", "violet", "pink", "none"].map((tint) => (
          <button
            key={tint}
            type="button"
            role="radio"
            className="louis-canvas-section__tint-option"
            data-tint={tint}
            aria-checked={tint === "blue"}
            aria-label={tint}
            data-testid={`option-${tint}`}
          />
        ))}
      </div>
    </div>
  );
}

const section = measured.components["canvas-section"].sizes as Sizes;
const bar = measured.components["canvas-section-title-bar"].sizes as Sizes;
const button = measured.components["canvas-section-color-button"].sizes as Sizes;
const option = measured.components["canvas-section-tint-option"].sizes as Sizes;
const palette = measured.components["canvas-section-palette"].sizes as Sizes;

for (const key of ["false", "true"] as const) {
  test(`canvas-section ${key} — 반경 · 경계 두께 · 머리 사이 · 머리 높이 · 액션 사이`, async () => {
    const spec = section[key];
    if (spec === undefined) throw new Error(`기록 canvas-section.${key}가 없습니다`);
    await render(<Section selected={key === "true"} />);
    const root = style("section");
    expect(px(root.borderTopLeftRadius)).toBe(num(spec, "radius", key));
    expect(insetSpread(root.boxShadow)).toBe(num(spec, "borderWidth", key));
    expect(rect("section").top - rect("header").bottom).toBeCloseTo(num(spec, "headerGap", key), 1);
    expect(rect("header").height).toBeCloseTo(num(spec, "headerHeight", key), 1);
    expect(px(style("actions").columnGap.replace("normal", "0px"))).toBe(num(spec, "actionsGap", key));
  });
}

for (const key of ["Default", "Hover"] as const) {
  test(`canvas-section-title-bar ${key} — 높이 · 여백 · 사이 · 반경 · 글자`, async () => {
    const spec = bar[key];
    if (spec === undefined) throw new Error(`기록 canvas-section-title-bar.${key}가 없습니다`);
    await render(<Section selected={false} />);
    const s = style("bar");
    expect(rect("bar").height).toBeCloseTo(num(spec, "height", key), 1);
    expect(px(s.paddingTop)).toBe(num(spec, "paddingBlock", key));
    expect(px(s.paddingBottom)).toBe(num(spec, "paddingBlock", key));
    expect(px(s.paddingLeft)).toBe(num(spec, "paddingInlineStart", key));
    expect(px(s.paddingRight)).toBe(num(spec, "paddingInlineEnd", key));
    expect(px(s.columnGap)).toBe(num(spec, "gap", key));
    expect(px(s.borderTopLeftRadius)).toBe(num(spec, "radius", key));
    expect(px(style("title").fontSize)).toBe(num(spec, "fontSize", key));
  });
}

for (const key of ["Default/false", "Default/true", "Hover/false", "Hover/true"] as const) {
  test(`canvas-section-color-button ${key} — 버튼 · 견본 크기 · 반경 · 견본 테두리`, async () => {
    const spec = button[key];
    if (spec === undefined) throw new Error(`기록 canvas-section-color-button.${key}가 없습니다`);
    await render(<Section selected={false} tint={key.endsWith("true") ? undefined : "blue"} />);
    expect(rect("color-button").width).toBeCloseTo(num(spec, "size", key), 1);
    expect(rect("color-button").height).toBeCloseTo(num(spec, "size", key), 1);
    expect(px(style("color-button").borderTopLeftRadius)).toBe(num(spec, "radius", key));
    expect(rect("swatch").width).toBeCloseTo(num(spec, "swatchSize", key), 1);
    expect(rect("swatch").height).toBeCloseTo(num(spec, "swatchSize", key), 1);
    expect(px(style("swatch").borderTopLeftRadius)).toBe(num(spec, "swatchRadius", key));
    expect(insetSpread(style("swatch").boxShadow)).toBe(num(spec, "swatchBorder", key));
  });
}

for (const key of ["false", "true"] as const) {
  test(`canvas-section-tint-option ${key} — 칸 크기 · 반경`, async () => {
    const spec = option[key];
    if (spec === undefined) throw new Error(`기록 canvas-section-tint-option.${key}가 없습니다`);
    await render(<Palette />);
    const id = key === "true" ? "option-blue" : "option-red";
    expect(rect(id).width).toBeCloseTo(num(spec, "size", key), 1);
    expect(rect(id).height).toBeCloseTo(num(spec, "size", key), 1);
    expect(px(style(id).borderTopLeftRadius)).toBe(num(spec, "radius", key));
  });
}

test("canvas-section-palette base — 안쪽 · 반경 · 격자 사이 · 열 수", async () => {
  const spec = palette.base;
  if (spec === undefined) throw new Error("기록 canvas-section-palette.base가 없습니다");
  await render(<Palette />);
  const pop = style("popover");
  expect(px(pop.paddingTop)).toBe(num(spec, "inset", "base"));
  expect(px(pop.paddingLeft)).toBe(num(spec, "inset", "base"));
  expect(px(pop.borderTopLeftRadius)).toBe(num(spec, "radius", "base"));
  expect(px(style("palette").columnGap)).toBe(num(spec, "gap", "base"));
  expect(style("palette").gridTemplateColumns.split(" ")).toHaveLength(num(spec, "columns", "base"));
});
