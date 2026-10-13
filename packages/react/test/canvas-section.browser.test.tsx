// Canvas Section(`.louis-canvas-section`)의 레시피가 실제로 그 프레임 · 제목 머리 · 색 버튼 · 팔레트 · 변 띠 · 대비를 만드는지 잰다(DS-D-0093).
//
// **React 표면이 아니라 클래스 마크업을 렌더한다.** 정본은 packages/css/src/component/canvas-section.css 이고 마크업은
// design/components/canvas-section.md 의 예시 그대로다. 섹션은 캔버스 바닥(`bg-canvas`) 위에 선다 — 제목 머리는 프레임 바깥 위라
// 그 바탕은 섹션 면이 아니라 캔버스 바닥이다. 대비는 토큰 값으로 손 계산하지 않고 계산 색을 실제 바탕에 합성해 잰다(fixtures/contrast).
import type { CSSProperties, JSX } from "react";
import { afterEach, expect, test } from "vitest";
import { userEvent } from "vitest/browser";
import { render } from "vitest-browser-react";
import "@klipse-design/css/layers.css";
import "@klipse-design/css/tokens.css";
import "@klipse-design/css/styles.css";
import { contrastOn, find, over, parseColor, px, type Rgba, ratio, tokenColor } from "./fixtures/contrast";

afterEach(() => {
  document.documentElement.removeAttribute("data-theme");
});

const TINTS = ["red", "yellow", "green", "blue", "violet", "pink"] as const;
type Tint = (typeof TINTS)[number];

const FLOOR: CSSProperties = { background: "var(--louis-color-bg-canvas)", padding: "64px 40px 40px", inlineSize: 720, boxSizing: "border-box" };

function Section({
  tint,
  selected = false,
  name = "섹션 1",
  width = 480,
}: {
  readonly tint?: Tint;
  readonly selected?: boolean;
  readonly name?: string;
  readonly width?: number;
}): JSX.Element {
  return (
    <div style={FLOOR} data-testid="floor">
      <div
        className="louis-canvas-section"
        role="group"
        aria-label={name}
        data-tint={tint}
        data-selected={selected ? "true" : undefined}
        style={{ inlineSize: width, blockSize: 240 }}
        data-testid="section"
      >
        {selected ? (
          <>
            <span className="louis-canvas-section__edge" data-edge="top" aria-hidden="true" data-testid="edge-top" />
            <span className="louis-canvas-section__edge" data-edge="right" aria-hidden="true" data-testid="edge-right" />
            <span className="louis-canvas-section__edge" data-edge="bottom" aria-hidden="true" data-testid="edge-bottom" />
            <span className="louis-canvas-section__edge" data-edge="left" aria-hidden="true" data-testid="edge-left" />
            <div className="louis-transform-frame" aria-hidden="true" data-testid="frame">
              <span className="louis-transform-frame__handle" data-position="nw" data-testid="handle-nw" />
              <span className="louis-transform-frame__handle" data-position="ne" />
              <span className="louis-transform-frame__handle" data-position="se" />
              <span className="louis-transform-frame__handle" data-position="sw" />
            </div>
          </>
        ) : null}
        <div className="louis-canvas-section__header" data-testid="header">
          <div className="louis-canvas-section__title-bar" data-testid="bar">
            <button type="button" className="louis-canvas-section__title" title={name} data-testid="title">
              {name}
            </button>
            <button
              type="button"
              className="louis-canvas-section__color-button"
              aria-label="섹션 색"
              aria-expanded="false"
              aria-controls="palette"
              data-testid="color-button"
            >
              <span className="louis-canvas-section__color-swatch" aria-hidden="true" data-testid="swatch" />
            </button>
          </div>
          <div className="louis-canvas-section__actions" data-testid="actions">
            <button type="button" className="louis-node-chrome-button" aria-label="섹션 도움말" data-testid="help" />
            <button type="button" className="louis-node-chrome-button" data-tone="danger" aria-label="섹션 삭제" data-testid="delete" />
          </div>
        </div>
      </div>
    </div>
  );
}

const NAMES: Record<Tint | "none", string> = { red: "빨강", yellow: "노랑", green: "초록", blue: "파랑", violet: "보라", pink: "분홍", none: "색 없음" };

function Palette({ checked = "blue" }: { readonly checked?: Tint | "none" }): JSX.Element {
  return (
    <div style={{ background: "var(--louis-color-bg-canvas)", padding: 24 }}>
      <div className="louis-popover" data-louis-scope="canvas" id="palette" style={{ inlineSize: "max-content" }} data-testid="popover">
        <div className="louis-canvas-section__palette" role="radiogroup" aria-label="섹션 색" data-testid="palette">
          {[...TINTS, "none" as const].map((tint) => (
            <button
              key={tint}
              type="button"
              role="radio"
              className="louis-canvas-section__tint-option"
              data-tint={tint}
              aria-checked={tint === checked}
              aria-label={NAMES[tint]}
              tabIndex={tint === checked ? 0 : -1}
              data-testid={`option-${tint}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

const style = (testId: string): CSSStyleDeclaration => getComputedStyle(find(testId));
const rect = (testId: string): DOMRect => find(testId).getBoundingClientRect();

/** `box-shadow` 첫 겹의 색 · 두께 — 계산값은 「색 0px 0px 0px 두께 inset」 꼴이다. */
function shadow(value: string, layer = 0): { readonly color: string; readonly spread: number; readonly inset: boolean } {
  const layers = value.split(/,(?![^(]*\))/).map((part) => part.trim());
  const part = layers[layer] ?? "";
  const color = /^(color\([^)]*\)|rgba?\([^)]*\))/.exec(part)?.[1] ?? "";
  const lengths = part.slice(color.length).trim().split(/\s+/).filter((token) => token.endsWith("px"));
  return { color, spread: px(lengths[3] ?? "0"), inset: part.includes("inset") };
}

const canvasGround = (): Rgba => parseColor(style("floor").backgroundColor);

test("프레임 — 반경 16 · 면 전경 4% · 쉼 경계 안쪽 1px 40% · 커서 grab", async () => {
  await render(<Section />);
  const section = style("section");
  expect(px(section.borderTopLeftRadius)).toBe(16);
  expect(section.backgroundColor).toBe(tokenColor("color-gray-000-alpha-04", "backgroundColor"));
  const ring = shadow(section.boxShadow);
  expect(ring.inset).toBe(true);
  expect(ring.spread).toBe(1);
  expect(ring.color).toBe(tokenColor("color-gray-000-alpha-40"));
  expect(section.cursor).toBe("grab");
  expect(section.zIndex).toBe("auto");
});

test("선택 — 안쪽 2px 88%", async () => {
  await render(<Section selected />);
  const ring = shadow(style("section").boxShadow);
  expect(ring.inset).toBe(true);
  expect(ring.spread).toBe(2);
  expect(ring.color).toBe(tokenColor("color-gray-000-alpha-88"));
});

test("색조 — 면 · 견본이 그 시맨틱의 16%", async () => {
  for (const tint of TINTS) {
    document.body.replaceChildren();
    await render(<Section tint={tint} />);
    const base = parseColor(tokenColor(`color-canvas-section-tint-${tint}`));
    for (const testId of ["section", "swatch"]) {
      const fill = parseColor(style(testId).backgroundColor);
      expect(fill[3], `${tint} ${testId} 알파`).toBeCloseTo(0.16, 2);
      for (const channel of [0, 1, 2] as const) expect(fill[channel], `${tint} ${testId}`).toBeCloseTo(base[channel], 0);
    }
  }
});

test("제목 머리 — 프레임 윗변 위 6, 바 25 · 여백 2/6/2/8 · 반경 8 · 사이 6 · 면 8% · 글 72%", async () => {
  await render(<Section />);
  expect(rect("section").top - rect("header").bottom).toBeCloseTo(6, 1);
  expect(rect("section").top - rect("bar").bottom).toBeCloseTo(6, 1);
  expect(rect("section").top - rect("actions").bottom).toBeCloseTo(6, 1);
  const bar = style("bar");
  expect(rect("bar").height).toBeCloseTo(25, 1);
  expect([px(bar.paddingTop), px(bar.paddingRight), px(bar.paddingBottom), px(bar.paddingLeft)]).toEqual([2, 6, 2, 8]);
  expect(px(bar.borderTopLeftRadius)).toBe(8);
  expect(px(bar.columnGap)).toBe(6);
  expect(bar.backgroundColor).toBe(tokenColor("color-gray-000-alpha-08", "backgroundColor"));
  expect(bar.color).toBe(tokenColor("color-gray-000-alpha-72"));
  expect(px(bar.fontSize)).toBe(14);
  expect(bar.fontWeight).toBe("500");
  expect(rect("header").height).toBeCloseTo(32, 1);
  expect(style("header").pointerEvents).toBe("none");
  expect(bar.pointerEvents).toBe("auto");
});

test("긴 이름 — 액션 앞에서 말줄임되고 겹치지 않는다", async () => {
  await render(<Section name={"아주 긴 섹션 이름 ".repeat(12)} width={320} />);
  expect(rect("bar").right).toBeLessThanOrEqual(rect("actions").left + 0.5);
  expect(rect("actions").right).toBeCloseTo(rect("section").right, 1);
  const title = find("title");
  expect(getComputedStyle(title).textOverflow).toBe("ellipsis");
  expect(getComputedStyle(title).whiteSpace).toBe("nowrap");
  expect(title.scrollWidth).toBeGreaterThan(title.clientWidth);
  expect(rect("bar").height).toBeCloseTo(25, 1);
});

test("색 버튼 20 · 반경 6, 견본 12 · 반경 4 · 테두리 stroke-strong", async () => {
  await render(<Section />);
  expect(rect("color-button").width).toBeCloseTo(20, 1);
  expect(rect("color-button").height).toBeCloseTo(20, 1);
  expect(px(style("color-button").borderTopLeftRadius)).toBe(6);
  expect(style("color-button").backgroundColor).toBe("rgba(0, 0, 0, 0)");
  expect(rect("swatch").width).toBeCloseTo(12, 1);
  expect(rect("swatch").height).toBeCloseTo(12, 1);
  expect(px(style("swatch").borderTopLeftRadius)).toBe(4);
  const ring = shadow(style("swatch").boxShadow);
  expect(ring.inset).toBe(true);
  expect(ring.spread).toBe(1);
  expect(ring.color).toBe(tokenColor("color-stroke-strong"));
});

test("팔레트 — 7 × 20 · 사이 6, 칸 20 · 반경 6 · 테두리 stroke-strong, 고른 칸 2px 강조 고리, 없음은 빗금", async () => {
  await render(<Palette />);
  const grid = style("palette");
  expect(grid.gridTemplateColumns.split(" ")).toEqual(Array.from({ length: 7 }, () => "20px"));
  expect(px(grid.columnGap)).toBe(6);
  expect(rect("palette").width).toBeCloseTo(176, 1);
  expect(rect("palette").height).toBeCloseTo(20, 1);
  expect(rect("popover").width).toBeCloseTo(188, 1);
  expect(rect("popover").height).toBeCloseTo(32, 1);
  const option = style("option-red");
  expect(rect("option-red").width).toBeCloseTo(20, 1);
  expect(px(option.borderTopLeftRadius)).toBe(6);
  const rest = shadow(option.boxShadow);
  expect(rest.spread).toBe(1);
  expect(rest.color).toBe(tokenColor("color-stroke-strong"));
  const chosen = style("option-blue").boxShadow;
  expect(shadow(chosen, 0).color).toBe(tokenColor("color-canvas-menu-surface"));
  expect(shadow(chosen, 1).spread).toBe(2);
  expect(shadow(chosen, 1).inset).toBe(false);
  expect(shadow(chosen, 1).color).toBe(tokenColor("color-accent-primary"));
  expect(style("option-none").backgroundImage).toContain("linear-gradient");
  const fill = parseColor(style("option-green").backgroundColor);
  expect(fill[3]).toBeCloseTo(0.16, 2);
});

test("칸 호버 — 1.08 배", async () => {
  await render(<Palette />);
  const option = find("option-red");
  await userEvent.hover(option);
  await expect.poll(() => style("option-red").transform).toBe("matrix(1.08, 0, 0, 1.08, 0, 0)");
  await userEvent.unhover(option);
});

test("변 띠 16 이 변 가운데에 걸치고, Transform Frame 이 프레임을 채우며 몸통은 누름을 통과시킨다", async () => {
  await render(<Section selected />);
  const section = rect("section");
  expect(rect("edge-top").height).toBeCloseTo(16, 1);
  expect(rect("edge-top").top + 8).toBeCloseTo(section.top, 1);
  expect(rect("edge-top").width).toBeCloseTo(section.width, 1);
  expect(rect("edge-bottom").top + 8).toBeCloseTo(section.bottom, 1);
  expect(rect("edge-left").width).toBeCloseTo(16, 1);
  expect(rect("edge-left").left + 8).toBeCloseTo(section.left, 1);
  expect(rect("edge-right").left + 8).toBeCloseTo(section.right, 1);
  expect(style("edge-top").cursor).toBe("ns-resize");
  expect(style("edge-left").cursor).toBe("ew-resize");
  const frame = rect("frame");
  expect(frame.left).toBeCloseTo(section.left, 1);
  expect(frame.top).toBeCloseTo(section.top, 1);
  expect(frame.width).toBeCloseTo(section.width, 1);
  expect(frame.height).toBeCloseTo(section.height, 1);
  expect(style("frame").pointerEvents).toBe("none");
  expect(style("handle-nw").pointerEvents).toBe("auto");
  // 프레임 가운데를 누르면 섹션이 받는다(끌기).
  expect(document.elementFromPoint(section.left + section.width / 2, section.top + section.height / 2)).toBe(find("section"));
  // 윗변 위를 누르면 띠가 받는다.
  expect(document.elementFromPoint(section.left + section.width / 2, section.top + 4)).toBe(find("edge-top"));
});

test("호버 규칙은 모두 @media (hover: hover) 안이다", () => {
  const offenders: string[] = [];
  const walk = (rules: CSSRuleList, guarded: boolean): void => {
    for (const rule of Array.from(rules)) {
      if (rule instanceof CSSMediaRule) walk(rule.cssRules, guarded || rule.conditionText.includes("hover: hover"));
      else if (rule instanceof CSSLayerBlockRule) walk(rule.cssRules, guarded);
      else if (rule instanceof CSSStyleRule && rule.selectorText.includes("louis-canvas-section") && rule.selectorText.includes(":hover") && !guarded) {
        offenders.push(rule.selectorText);
      }
    }
  };
  for (const sheet of Array.from(document.styleSheets)) walk(sheet.cssRules, false);
  expect(offenders).toEqual([]);
});

for (const theme of ["light", "dark"] as const) {
  test(`대비(${theme}) — 제목 · 호버 4.5 이상, 쉼 경계(없음 · 여섯) · 견본 · 칸 테두리 3 이상(실측)`, async () => {
    document.documentElement.setAttribute("data-theme", theme);
    await render(<Section />);
    const floor = canvasGround();
    // 제목 머리는 프레임 바깥 위 — 바탕은 바 면(8%) over 캔버스 바닥이다.
    const bar = over(parseColor(style("bar").backgroundColor), floor);
    expect(contrastOn(style("title").color, bar), `${theme} 제목`).toBeGreaterThanOrEqual(4.5);
    const barHover = over(parseColor(tokenColor("color-gray-000-alpha-12", "backgroundColor")), floor);
    expect(contrastOn(tokenColor("color-fg-primary"), barHover), `${theme} 제목 호버`).toBeGreaterThanOrEqual(4.5);
    expect(contrastOn(style("help").color, floor), `${theme} 액션`).toBeGreaterThanOrEqual(4.5);
    // 견본 테두리 — 바 면 위.
    expect(contrastOn(shadow(style("swatch").boxShadow).color, bar), `${theme} 견본`).toBeGreaterThanOrEqual(3);

    // 쉼 경계 — 경계 픽셀(40% over 면 over 바닥) 대 바깥 바닥.
    const measure = (): number => {
      const fill = over(parseColor(style("section").backgroundColor), floor);
      const edge = over(parseColor(shadow(style("section").boxShadow).color), fill);
      return ratio(edge, floor);
    };
    expect(measure(), `${theme} 경계 · 없음`).toBeGreaterThanOrEqual(3);
    for (const tint of TINTS) {
      document.body.replaceChildren();
      await render(<Section tint={tint} />);
      expect(measure(), `${theme} 경계 · ${tint}`).toBeGreaterThanOrEqual(3);
    }

    // 칸 테두리 — 캔버스 메뉴 면 위.
    document.body.replaceChildren();
    await render(<Palette />);
    const surface = parseColor(style("popover").backgroundColor);
    expect(surface[3]).toBe(1);
    expect(style("popover").backgroundColor).toBe(tokenColor("color-canvas-menu-surface", "backgroundColor"));
    expect(contrastOn(shadow(style("option-red").boxShadow).color, surface), `${theme} 칸`).toBeGreaterThanOrEqual(3);
    // 고른 칸의 고리 — 면 위 3 이상.
    expect(contrastOn(tokenColor("color-accent-primary"), surface), `${theme} 고리`).toBeGreaterThanOrEqual(3);
  });
}
