// figma/components.measured.json 의 **gallery-panel** 값을 LOUIS 레시피가 여전히 만드는지 잰다(DS-D-0035 (c), DS-D-0104).
//
// 정본은 packages/css/src/component/gallery-panel.css 이고 마크업은 design/components/gallery-panel.md 의 Usage 그대로다. React 표면이 없어
// 클래스 마크업을 렌더한다. 패널은 모달 내용 상자(여기서는 position: relative 상자) 안을 덮는다.
import { afterEach, expect, test } from "vitest";
import { render } from "vitest-browser-react";
import measured from "../../../figma/components.measured.json" with { type: "json" };
import "@klipse-design/css/layers.css";
import "@klipse-design/css/tokens.css";
import "@klipse-design/css/styles.css";
import "../../css/src/component/gallery-panel.css";
import { contrastOn, find, parseColor, px, tokenColor } from "./fixtures/contrast";

afterEach(() => {
  document.documentElement.removeAttribute("data-theme");
});

const spec = measured.components["gallery-panel"].sizes.panel;

function Host() {
  return (
    <div style={{ position: "relative", inlineSize: 400, blockSize: 520, background: "var(--louis-color-bg-overlay)" }} data-testid="host">
      <p style={{ margin: 0 }}>편집 모달 내용</p>
      <div className="louis-gallery-panel" role="dialog" aria-modal="true" aria-labelledby="t" data-testid="panel">
        <div className="louis-gallery-panel__head" data-testid="head">
          <span className="louis-gallery-panel__title" id="t" data-testid="title">
            예시 보기
          </span>
          <button type="button" className="louis-gallery-panel__close" aria-label="예시 닫기" data-testid="close">
            <svg viewBox="0 0 16 16" data-testid="glyph">
              <path d="M3 3l10 10M13 3L3 13" stroke="currentColor" />
            </svg>
          </button>
        </div>
        <div className="louis-gallery-panel__body" data-testid="body">
          <span className="louis-gallery-panel__hint" data-testid="hint">
            예시 그림을 참고해 스티커를 붙여 보세요.
          </span>
          <div className="louis-gallery-panel__grid" data-testid="grid">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div key={n} className="louis-gallery-panel__cell" data-testid={`cell-${n}`} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

test("gallery-panel: 머리 · 닫기 · 본문 · 격자 · 칸 기하가 기록과 같고 패널이 모달 상자를 덮는다", async () => {
  await render(<Host />);
  const label = "gallery-panel.panel";
  const panel = find("panel");
  const panelStyle = getComputedStyle(panel);
  expect(panelStyle.flexDirection, `${label} 세로`).toBe("column");
  expect(px(panelStyle.rowGap) || 0, `${label} itemSpacing`).toBe(0);
  expect(px(panelStyle.borderTopLeftRadius), `${label} radius`).toBe(0);
  expect(panelStyle.zIndex, `${label} 숫자 z-index 없음`).toBe("auto");
  const host = find("host").getBoundingClientRect();
  const box = panel.getBoundingClientRect();
  expect([box.left, box.top, box.width, box.height]).toEqual([host.left, host.top, host.width, host.height]);
  // 덮개가 위에 선다 — 문서 순서가 칠 순서다.
  expect(document.elementFromPoint(host.left + 200, host.top + 200)?.closest('[data-testid="panel"]')).toBe(panel);

  const head = getComputedStyle(find("head"));
  expect(px(head.paddingTop), `${label} headPaddingTop`).toBe(spec.headPaddingTop);
  expect(px(head.paddingBottom), `${label} headPaddingBottom`).toBe(spec.headPaddingBottom);
  expect(px(head.paddingLeft), `${label} headPaddingInline`).toBe(spec.headPaddingInline);
  expect(px(head.paddingRight), `${label} headPaddingInline`).toBe(spec.headPaddingInline);
  expect(px(head.columnGap), `${label} headGap`).toBe(spec.headGap);
  expect(px(head.borderBottomWidth), `${label} dividerHeight`).toBe(spec.dividerHeight);
  expect(px(getComputedStyle(find("title")).fontSize), `${label} titleFontSize`).toBe(spec.titleFontSize);
  const close = find("close");
  const closeRect = close.getBoundingClientRect();
  expect(closeRect.width, `${label} closeSize`).toBe(spec.closeSize);
  expect(closeRect.height, `${label} closeSize`).toBe(spec.closeSize);
  expect(px(getComputedStyle(close).borderTopLeftRadius), `${label} closeRadius`).toBe(spec.closeRadius);
  const glyph = find("glyph").getBoundingClientRect();
  expect([glyph.width, glyph.height], `${label} glyphSize`).toEqual([spec.glyphSize, spec.glyphSize]);

  const body = getComputedStyle(find("body"));
  expect(px(body.paddingTop), `${label} bodyPadding`).toBe(spec.bodyPadding);
  expect(px(body.paddingLeft), `${label} bodyPadding`).toBe(spec.bodyPadding);
  expect(px(body.rowGap), `${label} bodyGap`).toBe(spec.bodyGap);
  expect(px(getComputedStyle(find("hint")).fontSize), `${label} hintFontSize`).toBe(spec.hintFontSize);
  const grid = getComputedStyle(find("grid"));
  expect(px(grid.columnGap), `${label} gridGap`).toBe(spec.gridGap);
  expect(px(grid.rowGap), `${label} gridGap`).toBe(spec.gridGap);
  expect(grid.gridTemplateColumns.split(" ")).toHaveLength(3);
  const cell = find("cell-1");
  expect(px(getComputedStyle(cell).borderTopLeftRadius), `${label} cellRadius`).toBe(spec.cellRadius);
  const cellRect = cell.getBoundingClientRect();
  expect(cellRect.height / cellRect.width, `${label} 칸 2:3`).toBeCloseTo(1.5, 2);
});

for (const theme of ["light", "dark"] as const) {
  test(`${theme} — 면이 bg-overlay 이고 제목 · 닫기 · 안내가 그 면 위 4.5:1 을 넘는다`, async () => {
    document.documentElement.setAttribute("data-theme", theme);
    await render(<Host />);
    const panelBg = getComputedStyle(find("panel")).backgroundColor;
    expect(panelBg).toBe(tokenColor("color-bg-overlay", "backgroundColor"));
    const ground = parseColor(panelBg);
    const inks = {
      title: [getComputedStyle(find("title")).color, "color-fg-primary"],
      close: [getComputedStyle(find("close")).color, "color-fg-secondary"],
      hint: [getComputedStyle(find("hint")).color, "color-fg-tertiary"],
    } as const;
    for (const [part, [ink, token]] of Object.entries(inks)) {
      expect(ink, `${part} 잉크`).toBe(tokenColor(token));
      const ratio = contrastOn(ink, ground);
      expect(ratio, `${theme} ${part} ${ratio.toFixed(2)}`).toBeGreaterThanOrEqual(4.5);
    }
  });
}
