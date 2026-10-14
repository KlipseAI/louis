// Color Picker(`.louis-color-picker`)의 레시피가 실제로 그 판 · 면 · 띠 · 입력 줄 · 격자 · 대비를 만드는지 잰다(DS-D-0097).
//
// **React 표면이 아니라 클래스 마크업을 렌더한다.** 정본은 packages/css/src/component/color-picker.css 이고 마크업은
// design/components/color-picker.md 의 예시 그대로다. 판은 `.louis-popover` 면 안에 선다. 대비는 토큰 값으로 손 계산하지 않고
// 계산 색을 실제 바탕에 합성해 잰다(fixtures/contrast). 색 공간(면 모서리 · 색조 띠)은 요소 캡처의 픽셀로 잰다.
import type { CSSProperties, JSX } from "react";
import { afterEach, expect, test } from "vitest";
import { page, userEvent } from "vitest/browser";
import { render } from "vitest-browser-react";
import "@klipse-design/css/layers.css";
import "@klipse-design/css/tokens.css";
import "@klipse-design/css/styles.css";
import { backdrop, contrastOn, find, over, parseColor, px, type Rgba, textContrast, tokenColor } from "./fixtures/contrast";

declare const __LOUIS_REDUCED_MOTION__: boolean;

afterEach(() => {
  document.documentElement.removeAttribute("data-theme");
});

const style = (testId: string): CSSStyleDeclaration => getComputedStyle(find(testId));
const rect = (testId: string): DOMRect => find(testId).getBoundingClientRect();

const PAGE_COLORS = ["#ffffff", "#000000", "rgba(215, 38, 30, 0.6)", "#0088ff", "#22cc66", "#ffcc00", "rgba(0, 0, 0, 0.3)"] as const;

function Picker({
  vars,
  scope,
  hue = 4,
}: {
  readonly vars?: Record<string, string>;
  readonly scope?: "canvas";
  readonly hue?: number;
}): JSX.Element {
  const rootVars = {
    "--louis-color-picker-hue": "rgb(255, 17, 0)",
    "--louis-color-picker-color": "rgb(215, 38, 30)",
    "--louis-color-picker-saturation": "0.86",
    "--louis-color-picker-brightness": "0.84",
    "--louis-color-picker-alpha": "0.6",
    ...vars,
  } as CSSProperties;
  return (
    <div style={{ padding: 24, background: "var(--louis-color-bg-surface)" }} data-louis-scope={scope}>
      <div className="louis-popover" role="dialog" aria-label="글자 색" tabIndex={-1} style={{ inlineSize: "max-content" }} data-testid="popover">
        <div className="louis-color-picker" style={rootVars} data-testid="picker">
          <div className="louis-color-picker__head" data-testid="head">
            <button type="button" className="louis-icon-button" data-size="sm" data-variant="ghost" aria-label="닫기" data-testid="close">
              <svg className="louis-icon-button__glyph" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M5 5l14 14M19 5L5 19" stroke="currentColor" />
              </svg>
            </button>
          </div>
          <div
            className="louis-color-picker__area"
            role="slider"
            tabIndex={0}
            aria-label="채도와 밝기"
            aria-roledescription="2차원 슬라이더"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={86}
            aria-valuetext="채도 86%, 밝기 84%"
            data-testid="area"
          >
            <span className="louis-color-picker__area-thumb" aria-hidden="true" data-testid="area-thumb" />
          </div>
          <div className="louis-color-picker__channels" data-testid="channels">
            <input
              type="range"
              className="louis-color-picker__channel"
              data-channel="hue"
              min={0}
              max={360}
              step={1}
              defaultValue={hue}
              aria-label="색조"
              data-testid="hue"
            />
            <input
              type="range"
              className="louis-color-picker__channel"
              data-channel="alpha"
              min={0}
              max={100}
              step={1}
              defaultValue={60}
              aria-label="불투명도"
              data-testid="alpha"
            />
          </div>
          <div className="louis-color-picker__fields" data-testid="fields">
            <button type="button" className="louis-color-picker__tool" aria-label="화면에서 색 집기" data-testid="tool">
              <svg viewBox="0 0 24 24" aria-hidden="true" data-testid="tool-glyph">
                <path d="M4 20l10-10" stroke="currentColor" />
              </svg>
            </button>
            <label className="louis-color-picker__field" data-field="hex" data-testid="hex">
              <input className="louis-color-picker__input" defaultValue="d7261e" maxLength={6} aria-label="헥스" data-testid="hex-input" />
            </label>
            <label className="louis-color-picker__field" data-field="alpha" data-testid="alpha-field">
              <input className="louis-color-picker__input" type="number" min={0} max={100} defaultValue={60} aria-label="불투명도 퍼센트" data-testid="alpha-input" />
              <span className="louis-color-picker__suffix" aria-hidden="true" data-testid="suffix">
                %
              </span>
            </label>
          </div>
          <p className="louis-color-picker__label" id="cp-page" data-testid="label">
            이 페이지에서
          </p>
          <div className="louis-color-picker__swatches" role="group" aria-labelledby="cp-page" data-testid="swatches">
            {PAGE_COLORS.map((value, index) => (
              <button
                key={value}
                type="button"
                className="louis-color-picker__option"
                aria-label={value}
                aria-pressed={index === 2 ? true : undefined}
                style={{ ["--louis-color-picker-option-value" as string]: value }}
                data-testid={`option-${index}`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/** `box-shadow` 한 겹의 색 · 퍼짐. 계산값은 「색 x y blur spread」 꼴이다. */
function shadow(value: string, layer = 0): { readonly color: string; readonly spread: number } {
  const layers = value.split(/,(?![^(]*\))/).map((part) => part.trim());
  const part = layers[layer] ?? "";
  const color = /^(color\([^)]*\)|rgba?\([^)]*\))/.exec(part)?.[1] ?? "";
  const lengths = part.slice(color.length).trim().split(/\s+/).filter((token) => token.endsWith("px"));
  return { color, spread: px(lengths[3] ?? "0") };
}

/** 요소를 캡처해 CSS 픽셀 (x, y) 의 색을 읽는다(요소 왼쪽 위 기준). */
async function sampler(testId: string): Promise<(x: number, y: number) => Rgba> {
  const element = find(testId);
  const box = element.getBoundingClientRect();
  const shot = await page.screenshot({ element, base64: true, save: false });
  // save:false 면 base64 문자열 하나가 돌아온다.
  const base64: string = shot;
  const bytes = Uint8Array.from(atob(base64), (char) => char.charCodeAt(0));
  const bitmap = await createImageBitmap(new Blob([bytes], { type: "image/png" }));
  const canvas = new OffscreenCanvas(bitmap.width, bitmap.height);
  const context = canvas.getContext("2d");
  if (context === null) throw new Error("캔버스 없음");
  context.drawImage(bitmap, 0, 0);
  const scale = bitmap.width / box.width;
  return (x, y) => {
    const data = context.getImageData(Math.round(x * scale), Math.round(y * scale), 1, 1).data;
    return [data[0] ?? 0, data[1] ?? 0, data[2] ?? 0, 1];
  };
}

const near = (actual: Rgba, expected: readonly [number, number, number], tolerance = 10): boolean =>
  Math.abs(actual[0] - expected[0]) <= tolerance && Math.abs(actual[1] - expected[1]) <= tolerance && Math.abs(actual[2] - expected[2]) <= tolerance;

test("치수 — 판 256 · 면 256 × 220 · 반경 10 · 띠 14 / 12 · 입력 28 · 알파 64 · 칸 28 · 사이 12 / 8 / 6, 면 바깥 268", async () => {
  await render(<Picker />);
  expect(rect("picker").width).toBe(256);
  expect(rect("popover").width).toBe(268);
  expect(px(style("picker").rowGap)).toBe(12);
  expect(rect("head").height).toBe(24);
  expect(rect("close").right).toBeCloseTo(rect("picker").right, 1);
  expect(rect("area").width).toBe(256);
  expect(rect("area").height).toBe(220);
  expect(px(style("area").borderTopLeftRadius)).toBe(10);
  expect(rect("area-thumb").width).toBe(14);
  expect(px(style("area-thumb").borderTopWidth)).toBe(2);
  expect(rect("hue").height).toBe(14);
  expect(rect("hue").width).toBe(256);
  expect(rect("alpha").top - rect("hue").bottom).toBe(8);
  for (const id of ["tool", "hex", "alpha-field"]) expect(rect(id).height).toBe(28);
  expect(rect("tool").width).toBe(28);
  expect(rect("tool-glyph").width).toBe(16);
  expect(rect("alpha-field").width).toBe(64);
  expect(rect("hex").left - rect("tool").right).toBe(6);
  expect(rect("alpha-field").left - rect("hex").right).toBe(6);
  expect(rect("alpha-field").right).toBeCloseTo(rect("picker").right, 1);
  expect(px(style("hex").paddingLeft)).toBe(10);
  expect(px(style("alpha-field").paddingLeft)).toBe(8);
  expect(px(style("alpha-field").paddingRight)).toBe(8);
  expect(rect("alpha-field").right - rect("suffix").right).toBe(8);
  expect(style("hex-input").textTransform).toBe("uppercase");
  expect(rect("option-0").width).toBe(28);
  expect(px(style("option-0").borderTopLeftRadius)).toBe(4);
  expect(rect("option-6").top - rect("option-0").bottom).toBe(6);
});

test("표식 — saturation 0.25 · brightness 0.75 에서 중심이 면 (25%, 25%)", async () => {
  await render(<Picker vars={{ "--louis-color-picker-saturation": "0.25", "--louis-color-picker-brightness": "0.75" }} />);
  const area = rect("area");
  const thumb = rect("area-thumb");
  expect(thumb.left + thumb.width / 2 - area.left).toBeCloseTo(area.width * 0.25, 1);
  expect(thumb.top + thumb.height / 2 - area.top).toBeCloseTo(area.height * 0.25, 1);
  // 면이 표식을 자르지 않는다(제품 overflow-hidden 고침).
  expect(style("area").overflow).toBe("visible");
});

test("색 공간 — 면 네 모서리가 흰 · 색조 · 검정 · 검정이고, 색조 띠는 손잡이 반지름만큼 당긴 정지점 위 sRGB 보간이다", async () => {
  await render(<Picker vars={{ "--louis-color-picker-hue": "rgb(0, 0, 255)", "--louis-color-picker-saturation": "0.5", "--louis-color-picker-brightness": "0.5" }} hue={0} />);
  const area = await sampler("area");
  const { width, height } = rect("area");
  // HSV — (x, y) 에서 채도 x/폭, 밝기 1 − y/높이. 지금 색조는 파랑. 반경 10 이 모서리를 깎으므로 모서리에서 대각선 안쪽 6 을 잰다.
  const hsv = (x: number, y: number): [number, number, number] => {
    const s = x / width;
    const v = 1 - y / height;
    return [255 * v * (1 - s), 255 * v * (1 - s), 255 * v];
  };
  for (const [x, y, name] of [
    [6, 6, "왼쪽 위 — 흰"],
    [width - 6, 6, "오른쪽 위 — 색조"],
    [6, height - 6, "왼쪽 아래 — 검정"],
    [width - 6, height - 6, "오른쪽 아래 — 검정"],
    [width / 2, height / 4, "가운데 위"],
  ] as const) {
    expect(near(area(x, y), hsv(x, y), 6), `${name} ${JSON.stringify(area(x, y))}`).toBe(true);
  }

  const hue = await sampler("hue");
  const track = rect("hue").width - 14;
  const at = (fraction: number): Rgba => hue(7 + track * fraction, 7);
  expect(near(at(1 / 3), [0, 255, 0], 14), "120° 초록").toBe(true);
  expect(near(at(1 / 2), [0, 255, 255], 14), "180° 청록").toBe(true);
  expect(near(at(2 / 3), [0, 0, 255], 14), "240° 파랑").toBe(true);
  // 30° — sRGB 선형 보간이면 (255, 128, 0). oklab 이면 초록 채널이 크게 다르다.
  expect(near(at(1 / 12), [255, 128, 0], 14), "30° 주황(in srgb)").toBe(true);
});

for (const theme of ["light", "dark"] as const) {
  test(`대비(${theme}) — 라벨 · % 4.5 이상, 칸 경계 3 이상, 표식 헤어라인 흰 바닥 3 이상(실측)`, async () => {
    document.documentElement.setAttribute("data-theme", theme);
    await render(<Picker />);
    expect(textContrast(find("label")), `${theme} 라벨`).toBeGreaterThanOrEqual(4.5);
    expect(textContrast(find("suffix")), `${theme} %`).toBeGreaterThanOrEqual(4.5);
    expect(textContrast(find("hex-input")), `${theme} 헥스`).toBeGreaterThanOrEqual(4.5);
    const ground = backdrop(find("swatches"));
    expect(contrastOn(style("option-0").borderTopColor, ground), `${theme} 칸 경계`).toBeGreaterThanOrEqual(3);
    expect(contrastOn(style("tool").color, over(parseColor(style("tool").backgroundColor), ground)), `${theme} 스포이드`).toBeGreaterThanOrEqual(3);
    const halo = shadow(style("area-thumb").boxShadow, 0);
    expect(halo.spread).toBe(1);
    expect(contrastOn(halo.color, [255, 255, 255, 1]), `${theme} 표식 헤어라인`).toBeGreaterThanOrEqual(3);
  });
}

test("지금 값 칸 링 — 틈 1 은 놓인 면, 링 2 는 주색. 캔버스 범위면 틈이 canvas-menu-surface", async () => {
  const screen = await render(<Picker />);
  const ring = style("option-2").boxShadow;
  expect(shadow(ring, 0).color).toBe(tokenColor("color-bg-menu"));
  expect(shadow(ring, 0).spread).toBe(1);
  expect(shadow(ring, 1).spread).toBe(3);
  expect(shadow(ring, 1).color).toBe(tokenColor("color-accent-primary"));
  expect(style("option-0").boxShadow).toBe("none");
  await screen.unmount();
  await render(<Picker scope="canvas" />);
  expect(shadow(style("option-2").boxShadow, 0).color).toBe(tokenColor("color-canvas-menu-surface"));
});

test("칸 — 값 아래 체크무늬, 여섯 열 양 끝 정렬", async () => {
  await render(<Picker />);
  expect(style("option-2").backgroundImage).toContain("repeating-conic-gradient");
  const picker = rect("picker");
  expect(rect("option-0").left).toBeCloseTo(picker.left, 1);
  expect(rect("option-5").right).toBeCloseTo(picker.right, 1);
  expect(rect("option-6").left).toBeCloseTo(picker.left, 1);
  expect(rect("option-1").left - rect("option-0").right).toBeCloseTo((256 - 28 * 6) / 5, 1);
});

test("상태 — 입력 중 면 8%, 스포이드 · 칸 호버(호버 기기만)", async () => {
  await render(<Picker />);
  expect(style("hex").backgroundColor).toBe(tokenColor("color-gray-000-alpha-04", "backgroundColor"));
  find("hex-input").focus();
  await expect.poll(() => style("hex").backgroundColor).toBe(tokenColor("color-gray-000-alpha-08", "backgroundColor"));
  await userEvent.hover(find("tool"));
  await expect.poll(() => style("tool").color).toBe(tokenColor("color-fg-primary"));
  await userEvent.hover(find("option-1"));
  await expect.poll(() => style("option-1").scale).toBe(__LOUIS_REDUCED_MOTION__ ? "none" : "1.08");
  await userEvent.unhover(find("tool"));
  await userEvent.unhover(find("option-1"));
});

test("줄인 모션 · 강제 색 — 칸 전환 0(줄인 모션), 데이터 색은 forced-color-adjust none", async () => {
  await render(<Picker />);
  if (__LOUIS_REDUCED_MOTION__) expect(px(style("option-0").transitionDuration)).toBe(0);
  for (const id of ["area", "hue", "alpha", "option-0"]) expect(style(id).forcedColorAdjust).toBe("none");
});

test("호버 규칙은 모두 @media (hover: hover) 안이고, 레시피는 z-index 를 선언하지 않는다", () => {
  const unguarded: string[] = [];
  const stacked: string[] = [];
  const walk = (rules: CSSRuleList, guarded: boolean): void => {
    for (const rule of Array.from(rules)) {
      if (rule instanceof CSSMediaRule) walk(rule.cssRules, guarded || rule.conditionText.includes("hover: hover"));
      else if (rule instanceof CSSLayerBlockRule) walk(rule.cssRules, guarded);
      else if (rule instanceof CSSStyleRule && /louis-color-(picker|swatch)/.test(rule.selectorText)) {
        if (rule.selectorText.includes(":hover") && !guarded) unguarded.push(rule.selectorText);
        if (rule.selectorText.includes("louis-color-picker") && rule.style.zIndex !== "") stacked.push(rule.selectorText);
      }
    }
  };
  for (const sheet of Array.from(document.styleSheets)) walk(sheet.cssRules, false);
  expect(unguarded).toEqual([]);
  expect(stacked).toEqual([]);
});

/** 트리거 — Color Swatch sm `<button>` 칩(DS-D-0097 결정 4). */
function Trigger(): JSX.Element {
  return (
    <div style={{ padding: 24, background: "var(--louis-color-bg-surface)" }}>
      <span className="louis-color-swatch" data-size="sm">
        <button
          type="button"
          className="louis-color-swatch__chip"
          aria-label="글자 색"
          aria-haspopup="dialog"
          aria-expanded="false"
          style={{ ["--louis-color-swatch-value" as string]: "rgba(215, 38, 30, 0.6)" }}
          data-testid="chip"
        />
        D7261E 60%
      </span>
    </div>
  );
}

test("트리거 칩 — sm 16 · 반경 4 · 체크무늬 · 호버 테두리 fg-tertiary · 누름 0.96", async () => {
  await render(<Trigger />);
  expect(rect("chip").width).toBe(16);
  expect(px(style("chip").borderTopLeftRadius)).toBe(4);
  expect(style("chip").backgroundImage).toContain("repeating-conic-gradient");
  await userEvent.hover(find("chip"));
  await expect.poll(() => style("chip").borderTopColor).toBe(tokenColor("color-fg-tertiary"));
  await userEvent.unhover(find("chip"));
  const active = Array.from(document.styleSheets)
    .flatMap((sheet) => {
      const out: CSSStyleRule[] = [];
      const walk = (rules: CSSRuleList): void => {
        for (const rule of Array.from(rules)) {
          if (rule instanceof CSSStyleRule) out.push(rule);
          else if (rule instanceof CSSGroupingRule) walk(rule.cssRules);
        }
      };
      walk(sheet.cssRules);
      return out;
    })
    .filter((rule) => rule.selectorText.includes("louis-color-swatch__chip") && rule.selectorText.includes(":active"));
  expect(active.map((rule) => rule.style.scale)).toContain("0.96");
});
