// Color Swatch(`.louis-color-swatch`)의 레시피가 실제로 그 픽셀을 만드는지 잰다.
//
// **React 표면이 아니라 클래스 마크업을 렌더한다.** 정본은 packages/css/src/component/color-swatch.css 이고 마크업은
// design/components/color-swatch.md 의 예시 그대로다. 칩은 모달 · 패널 면(`bg-surface`) 위에 선다.
//
// **경계 대비가 이 부품의 이유다.** 흰 값 · 검정 값 칩이 면 위에서 사라지지 않으려면 테두리가 값과 무관하게 3:1 을 넘어야 한다 —
// 두 테마에서 테두리 계산 색을 면 위에 합성해 잰다.
import type { JSX } from "react";
import { afterEach, expect, test } from "vitest";
import { render } from "vitest-browser-react";
import "@klipse-design/css/layers.css";
import "@klipse-design/css/tokens.css";
import "@klipse-design/css/styles.css";
import "../../css/src/component/text-field.css";
import "../../css/src/component/color-swatch.css";
import { backdrop, contrastOn, find, parseColor, px, textContrast, tokenColor } from "./fixtures/contrast";

afterEach(() => {
  document.documentElement.removeAttribute("data-theme");
});

const X = (
  <svg viewBox="0 0 10 10" aria-hidden="true">
    <path d="M2 2l6 6M8 2l-6 6" stroke="currentColor" />
  </svg>
);

const PLUS = (
  <svg viewBox="0 0 16 16" aria-hidden="true" data-testid="plus">
    <path d="M8 3v10M3 8h10" stroke="currentColor" />
  </svg>
);

/** 어드민 판 — 필드 옆 칩 + 헥스 필드, 표 칸 읽기 전용 칩. */
function Rows(): JSX.Element {
  return (
    <div style={{ inlineSize: 320, padding: 16, background: "var(--louis-color-bg-surface)" }} data-testid="surface">
      <div className="louis-color-swatch" data-testid="row">
        <input type="color" className="louis-color-swatch__chip" defaultValue="#ffffff" aria-label="배경" data-testid="row-chip" />
        <div className="louis-text-field" data-size="md">
          <div className="louis-text-field__box" data-testid="row-box">
            <input className="louis-text-field__control" defaultValue="#FFFFFF" aria-label="배경 헥스" />
          </div>
        </div>
      </div>
      <span className="louis-color-swatch" data-size="sm" data-testid="sm">
        <span
          className="louis-color-swatch__chip"
          style={{ ["--louis-color-swatch-value" as string]: "#000000" }}
          data-testid="sm-chip"
        />
        #000000
      </span>
    </div>
  );
}

/** 편집 패널 판 — 라벨 위 칩(지우기 있음) · 빈 칸. */
function Panel(): JSX.Element {
  return (
    <div style={{ display: "flex", gap: 12, padding: 24, background: "var(--louis-color-bg-surface)" }}>
      <label className="louis-color-swatch" data-layout="stack" data-testid="stack">
        <span className="louis-color-swatch__label" data-testid="stack-label">
          배경
        </span>
        <span className="louis-color-swatch__frame" data-testid="frame">
          <input type="color" className="louis-color-swatch__chip" defaultValue="#000000" data-testid="stack-chip" />
          <button type="button" className="louis-color-swatch__clear" aria-label="배경 색 지우기" data-testid="clear">
            {X}
          </button>
        </span>
      </label>
      <div className="louis-color-swatch" data-layout="stack" data-testid="empty-root">
        <span className="louis-color-swatch__label">테두리</span>
        <button type="button" className="louis-color-swatch__chip" data-empty="true" aria-label="테두리 색 더하기" data-testid="empty">
          {PLUS}
        </button>
      </div>
    </div>
  );
}

test("md 칩은 32 · 반경 8 · 테두리 1 이고 헥스 필드와 높이가 같다, 사이 6", async () => {
  await render(<Rows />);
  const chip = find("row-chip");
  const rect = chip.getBoundingClientRect();
  expect(rect.width).toBe(32);
  expect(rect.height).toBe(32);
  const style = getComputedStyle(chip);
  expect(px(style.borderTopLeftRadius)).toBe(8);
  expect(px(style.borderTopWidth)).toBe(1);
  expect(style.borderTopStyle).toBe("solid");
  expect(px(style.paddingTop)).toBe(0);
  expect(find("row-box").getBoundingClientRect().height).toBe(32);
  expect(find("row-box").getBoundingClientRect().left - rect.right).toBe(6);
  expect(find("row-box").getBoundingClientRect().top).toBe(rect.top);
});

test("sm 칩은 16 · 반경 4 이고 칠은 소비처 값이다", async () => {
  await render(<Rows />);
  const chip = find("sm-chip");
  const rect = chip.getBoundingClientRect();
  expect(rect.width).toBe(16);
  expect(rect.height).toBe(16);
  const style = getComputedStyle(chip);
  expect(px(style.borderTopLeftRadius)).toBe(4);
  expect(parseColor(style.backgroundColor).slice(0, 3)).toEqual([0, 0, 0]);
  expect(px(getComputedStyle(find("sm")).columnGap)).toBe(6);
});

test("stack 은 라벨 위 칩 · 사이 4 · 최소 폭 44 이고, 지우기는 16 원이 모서리 밖 6 에 걸리며 누르는 자리는 24 다", async () => {
  await render(<Panel />);
  const root = find("stack");
  expect(getComputedStyle(root).flexDirection).toBe("column");
  expect(root.getBoundingClientRect().width).toBeGreaterThanOrEqual(44);
  const label = find("stack-label").getBoundingClientRect();
  const chip = find("stack-chip").getBoundingClientRect();
  expect(chip.top - label.bottom).toBe(4);
  expect(chip.width).toBe(32);

  const clear = find("clear").getBoundingClientRect();
  expect(clear.width).toBe(16);
  expect(clear.height).toBe(16);
  expect(px(getComputedStyle(find("clear")).borderTopLeftRadius)).toBeGreaterThanOrEqual(8);
  expect(clear.right - chip.right).toBe(6);
  expect(chip.top - clear.top).toBe(6);

  // 히트 24 — 보이는 원 밖 3px 지점도 지우기가 받는다. 5px 밖은 받지 않는다.
  const midY = clear.top + clear.height / 2;
  expect(document.elementFromPoint(clear.right + 3, midY)?.closest("[data-testid='clear']")).not.toBeNull();
  expect(document.elementFromPoint(clear.left + clear.width / 2, clear.top - 3)?.closest("[data-testid='clear']")).not.toBeNull();
  expect(document.elementFromPoint(clear.right + 5, midY)?.closest("[data-testid='clear']") ?? null).toBeNull();
});

test("빈 칸은 점선 · 투명 면 · 더하기 16 이다", async () => {
  await render(<Panel />);
  const empty = find("empty");
  const style = getComputedStyle(empty);
  expect(style.borderTopStyle).toBe("dashed");
  expect(parseColor(style.backgroundColor)[3]).toBe(0);
  expect(empty.getBoundingClientRect().width).toBe(32);
  const plus = find("plus").getBoundingClientRect();
  expect(plus.width).toBe(16);
  expect(plus.height).toBe(16);
});

for (const theme of ["light", "dark"] as const) {
  test(`${theme} — 칩 경계가 면 위 3:1, 라벨 · 지우기 글리프가 4.5:1 을 넘는다`, async () => {
    document.documentElement.setAttribute("data-theme", theme);
    await render(<Panel />);
    const chip = find("stack-chip");
    expect(getComputedStyle(chip).borderTopColor).toBe(tokenColor("color-stroke-strong"));
    const ground = backdrop(chip.parentElement);
    const edge = contrastOn(getComputedStyle(chip).borderTopColor, ground);
    expect(edge, "칩 경계").toBeGreaterThanOrEqual(3);

    const label = textContrast(find("stack-label"));
    expect(label, "라벨").toBeGreaterThanOrEqual(4.5);

    const glyph = textContrast(find("clear"));
    expect(glyph, "지우기 글리프").toBeGreaterThanOrEqual(4.5);

    const dashed = contrastOn(getComputedStyle(find("empty")).borderTopColor, backdrop(find("empty")));
    expect(dashed, "빈 칸 점선").toBeGreaterThanOrEqual(3);
  });
}
