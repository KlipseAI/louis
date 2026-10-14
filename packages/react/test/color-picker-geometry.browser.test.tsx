// figma/components.measured.json 의 **color-picker · color-picker-option** 값을 코드가 여전히 만드는지 검증한다
// (DS-D-0035 (c), 2026-10-14 DS-D-0097).
//
// parity 게이트는 Figma 가 기록과 같은지만 본다. 이 파일이 없으면 CSS 가 조용히 바뀌어도 **Figma 와 기록은 서로 맞고 둘 다
// 코드와 틀린** 상태로 통과한다. 그래서 기록의 키(= Figma 되읽기의 축 키)마다 클래스 마크업을 렌더하고 기록의 필드를 계산값과 맞댄다.
// 대비 · 상태 색 · 색 공간 · 호버 가드는 color-picker.browser.test.tsx 가 소유한다.
import type { CSSProperties, JSX } from "react";
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

function Picker({ pressed = false }: { readonly pressed?: boolean }): JSX.Element {
  return (
    <div className="louis-popover" role="dialog" aria-label="글자 색" data-louis-state="open" style={{ inlineSize: "max-content" }}>
      <div className="louis-color-picker" data-testid="picker">
        <div className="louis-color-picker__head" data-testid="head">
          <button type="button" className="louis-icon-button" data-size="sm" data-variant="ghost" aria-label="닫기" />
        </div>
        <div
          className="louis-color-picker__area"
          role="slider"
          tabIndex={0}
          aria-label="채도와 밝기"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={100}
          aria-valuetext="채도 100%, 밝기 100%"
          data-testid="area"
        >
          <span className="louis-color-picker__area-thumb" aria-hidden="true" data-testid="area-thumb" />
        </div>
        <div className="louis-color-picker__channels" data-testid="channels">
          <input type="range" className="louis-color-picker__channel" data-channel="hue" min={0} max={360} defaultValue={0} aria-label="색조" data-testid="hue" />
          <input type="range" className="louis-color-picker__channel" data-channel="alpha" min={0} max={100} defaultValue={60} aria-label="불투명도" data-testid="alpha" />
        </div>
        <div className="louis-color-picker__fields" data-testid="fields">
          <button type="button" className="louis-color-picker__tool" aria-label="화면에서 색 집기" data-testid="tool" />
          <label className="louis-color-picker__field" data-field="hex" data-testid="hex">
            <input className="louis-color-picker__input" defaultValue="FF0000" maxLength={6} aria-label="헥스" />
          </label>
          <label className="louis-color-picker__field" data-field="alpha" data-testid="alpha-field">
            <input className="louis-color-picker__input" type="number" min={0} max={100} defaultValue={60} aria-label="불투명도 퍼센트" />
            <span className="louis-color-picker__suffix" aria-hidden="true">
              %
            </span>
          </label>
        </div>
        <p className="louis-color-picker__label" id="cpg-page" data-testid="label">
          이 페이지에서
        </p>
        <div className="louis-color-picker__swatches" role="group" aria-labelledby="cpg-page" data-testid="swatches">
          {["#ffffff", "rgba(255, 0, 0, 0.6)", "#ffff00", "#00ff00", "#00ffff", "#0000ff"].map((value, index) => (
            <button
              key={value}
              type="button"
              className="louis-color-picker__option"
              aria-label={value}
              aria-pressed={index === 1 ? pressed : undefined}
              style={{ "--louis-color-picker-option-value": value } as CSSProperties}
              data-testid={`option-${index}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

const pickerSizes = measured.components["color-picker"].sizes as Sizes;
for (const key of Object.keys(pickerSizes)) {
  test(`기록 color-picker ${key} — 판 · 면 · 띠 · 입력 줄 · 격자`, async () => {
    const spec = pickerSizes[key] ?? {};
    const label = `color-picker.${key}`;
    await render(<Picker />);
    expect(rect("picker").width).toBeCloseTo(num(spec, "width", label), 1);
    expect(px(style("picker").rowGap)).toBe(num(spec, "gap", label));
    expect(rect("area").height).toBeCloseTo(num(spec, "areaHeight", label), 1);
    expect(rect("area").width).toBeCloseTo(num(spec, "width", label), 1);
    expect(px(style("area").borderTopLeftRadius)).toBe(num(spec, "areaRadius", label));
    expect(rect("area-thumb").width).toBeCloseTo(num(spec, "thumbSize", label), 1);
    expect(px(style("channels").rowGap)).toBe(num(spec, "channelGap", label));
    for (const channel of ["hue", "alpha"]) expect(rect(channel).height, `${channel} 요소`).toBeCloseTo(num(spec, "channelHeight", label), 1);
    expect(px(getComputedStyle(find("hue")).getPropertyValue("--louis-color-picker-track-size"))).toBe(num(spec, "trackHeight", label));
    expect(px(style("fields").columnGap)).toBe(num(spec, "fieldGap", label));
    for (const field of ["tool", "hex", "alpha-field"]) expect(rect(field).height, `${field} 높이`).toBeCloseTo(num(spec, "controlHeight", label), 1);
    expect(rect("tool").width).toBeCloseTo(num(spec, "controlHeight", label), 1);
    expect(px(style("hex").paddingLeft)).toBe(num(spec, "hexPaddingInline", label));
    expect(px(style("hex").paddingRight)).toBe(num(spec, "hexPaddingInline", label));
    expect(rect("alpha-field").width).toBeCloseTo(num(spec, "alphaWidth", label), 1);
    expect(px(style("alpha-field").paddingLeft)).toBe(num(spec, "alphaPaddingInline", label));
    expect(px(style("alpha-field").paddingRight)).toBe(num(spec, "alphaPaddingInline", label));
    expect(rect("swatches").top - rect("label").bottom).toBeCloseTo(num(spec, "swatchesGap", label), 1);
  });
}

const optionSizes = measured.components["color-picker-option"].sizes as Sizes;
for (const key of Object.keys(optionSizes)) {
  test(`기록 color-picker-option ${key} — 칸 28 · 반경 4, 고른 칸도 기하가 같다`, async () => {
    const spec = optionSizes[key] ?? {};
    const label = `color-picker-option.${key}`;
    await render(<Picker pressed={key === "true"} />);
    expect(rect("option-1").width).toBeCloseTo(num(spec, "width", label), 1);
    expect(rect("option-1").height).toBeCloseTo(num(spec, "height", label), 1);
    expect(px(style("option-1").borderTopLeftRadius)).toBe(num(spec, "radius", label));
  });
}
