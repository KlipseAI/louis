// figma/components.measured.json 의 **drill-picker** 값을 LOUIS 레시피가 여전히 만드는지 잰다(DS-D-0035 (c), DS-D-0105).
//
// 정본은 packages/css/src/component/drill-picker.css 이고 마크업은 design/components/drill-picker.md 의 Usage 그대로다. React 표면이 없어
// 클래스 마크업을 렌더한다. 피커는 메뉴 면(`bg-menu`) 안에 놓이는 본문이라 시험도 그 면 위에 세운다. 호버 잉크는 `:hover` 를 실제로 일으켜 잰다.
import { afterEach, expect, test } from "vitest";
import { userEvent } from "vitest/browser";
import { render } from "vitest-browser-react";
import measured from "../../../figma/components.measured.json" with { type: "json" };
import "@klipse-design/css/layers.css";
import "@klipse-design/css/tokens.css";
import "@klipse-design/css/styles.css";
import "../../css/src/component/drill-picker.css";
import { backdrop, contrastOn, find, px, textContrast, tokenColor } from "./fixtures/contrast";

afterEach(() => {
  document.documentElement.removeAttribute("data-theme");
});

const picker = measured.components["drill-picker"].sizes.picker;
const row = measured.components["drill-picker"].sizes.row;

function Picker() {
  return (
    <div style={{ inlineSize: 320, blockSize: 420, display: "flex", padding: 8, background: "var(--louis-color-bg-menu)" }} data-testid="surface">
      <div className="louis-drill-picker" data-testid="picker">
        <div className="louis-drill-picker__head" data-testid="head">
          <button type="button" className="louis-drill-picker__back" aria-label="프로젝트 목록으로" data-testid="back">
            <svg viewBox="0 0 24 24" data-testid="back-glyph">
              <path d="M15 18l-6-6 6-6" stroke="currentColor" fill="none" />
            </svg>
          </button>
          <span className="louis-drill-picker__title" data-testid="title">
            여름 캠페인
          </span>
        </div>
        <ul className="louis-drill-picker__list" data-testid="list">
          <li>
            <label className="louis-drill-picker__check-row" data-testid="row">
              <input type="checkbox" className="louis-checkbox__control" data-testid="check" />
              <span className="louis-drill-picker__thumb" data-testid="thumb" />
              <span className="louis-drill-picker__meta" data-testid="meta">
                <span className="louis-badge" data-tone="info" data-testid="badge">
                  편집본
                </span>
                <span className="louis-drill-picker__label" data-testid="label">
                  오프닝 컷 2
                </span>
              </span>
            </label>
          </li>
          <li>
            <label className="louis-drill-picker__check-row" data-testid="row-2">
              <input type="checkbox" className="louis-checkbox__control" />
              <span className="louis-drill-picker__thumb" />
              <span className="louis-drill-picker__meta">
                <span className="louis-drill-picker__label-row" data-testid="label-row">
                  <svg viewBox="0 0 16 16" data-testid="row-icon">
                    <rect x="2" y="4" width="12" height="8" fill="currentColor" />
                  </svg>
                  <span className="louis-drill-picker__label">제품 클로즈업</span>
                </span>
              </span>
            </label>
          </li>
        </ul>
        <p className="louis-drill-picker__message" data-testid="message">
          프로젝트를 불러오지 못했습니다.
        </p>
        <div className="louis-drill-picker__footer" data-testid="footer">
          <button type="button" className="louis-button" data-variant="primary" data-size="lg" data-testid="import">
            선택한 영상 가져오기
          </button>
        </div>
      </div>
    </div>
  );
}

test("drill-picker.picker: 루트 · 머리 · 뒤로 · 목록 · 발 기하가 기록과 같다", async () => {
  await render(<Picker />);
  const label = "drill-picker.picker";
  const root = getComputedStyle(find("picker"));
  expect(root.flexDirection).toBe("column");
  expect(px(root.rowGap), `${label} gap`).toBe(picker.gap);
  const head = find("head");
  expect(px(getComputedStyle(head).columnGap), `${label} headGap`).toBe(picker.headGap);
  expect(px(getComputedStyle(head).minHeight), `${label} headMinHeight`).toBe(picker.headMinHeight);
  const back = find("back");
  const backRect = back.getBoundingClientRect();
  expect([backRect.width, backRect.height], `${label} backSize`).toEqual([picker.backSize, picker.backSize]);
  expect(px(getComputedStyle(back).borderTopLeftRadius), `${label} backRadius`).toBe(picker.backRadius);
  const glyph = find("back-glyph").getBoundingClientRect();
  expect([glyph.width, glyph.height], `${label} glyphSize`).toEqual([picker.glyphSize, picker.glyphSize]);
  expect(px(getComputedStyle(find("title")).fontSize), `${label} titleFontSize`).toBe(picker.titleFontSize);
  const list = getComputedStyle(find("list"));
  expect(px(list.borderTopWidth), `${label} dividerHeight`).toBe(picker.dividerHeight);
  expect(px(list.paddingTop), `${label} listPaddingTop`).toBe(picker.listPaddingTop);
  expect(px(list.rowGap), `${label} listGap`).toBe(picker.listGap);
  const footer = getComputedStyle(find("footer"));
  expect(px(footer.paddingTop), `${label} footerPaddingTop`).toBe(picker.footerPaddingTop);
  expect(px(footer.paddingBottom), `${label} footerPaddingBottom`).toBe(picker.footerPaddingBottom);
  expect(px(footer.paddingLeft), `${label} footerPaddingInline`).toBe(picker.footerPaddingInline);
  expect(px(footer.paddingRight), `${label} footerPaddingInline`).toBe(picker.footerPaddingInline);
  expect(px(footer.borderTopWidth), `${label} 발 위 선`).toBe(picker.dividerHeight);
  // 가져오기 버튼은 발을 꽉 채운다.
  const footerBox = find("footer").getBoundingClientRect();
  expect(find("import").getBoundingClientRect().width).toBe(footerBox.width - picker.footerPaddingInline * 2);
});

test("drill-picker.row: 고르기 행 · 썸네일 · 글 묶음 기하가 기록과 같고 행을 누르면 체크박스가 토글된다", async () => {
  await render(<Picker />);
  const label = "drill-picker.row";
  const element = find("row");
  expect(element.tagName).toBe("LABEL");
  const style = getComputedStyle(element);
  expect(px(style.paddingTop), `${label} rowPaddingBlock`).toBe(row.rowPaddingBlock);
  expect(px(style.paddingBottom), `${label} rowPaddingBlock`).toBe(row.rowPaddingBlock);
  expect(px(style.paddingLeft), `${label} rowPaddingInline`).toBe(row.rowPaddingInline);
  expect(px(style.paddingRight), `${label} rowPaddingInline`).toBe(row.rowPaddingInline);
  expect(px(style.columnGap), `${label} rowGap`).toBe(row.rowGap);
  expect(px(style.borderTopLeftRadius), `${label} rowRadius`).toBe(row.rowRadius);
  const thumb = find("thumb");
  const thumbRect = thumb.getBoundingClientRect();
  expect(thumbRect.width, `${label} thumbWidth`).toBe(row.thumbWidth);
  expect(thumbRect.height, `${label} 16:9`).toBeCloseTo((row.thumbWidth * 9) / 16, 1);
  expect(px(getComputedStyle(thumb).borderTopLeftRadius), `${label} thumbRadius`).toBe(row.thumbRadius);
  expect(px(getComputedStyle(find("meta")).rowGap), `${label} metaGap`).toBe(row.metaGap);
  expect(px(getComputedStyle(find("label-row")).columnGap), `${label} labelRowGap`).toBe(row.labelRowGap);
  expect(px(getComputedStyle(find("label")).fontSize), `${label} labelFontSize`).toBe(row.labelFontSize);
  const check = find("check") as HTMLInputElement;
  expect(check.checked).toBe(false);
  await userEvent.click(find("label"));
  expect(check.checked, "행을 누르면 체크박스가 토글된다").toBe(true);
});

for (const theme of ["light", "dark"] as const) {
  test(`${theme} — 행 잉크 · 호버 잉크 · 배지 · 실패 글이 메뉴 면 위 4.5:1 을 넘는다`, async () => {
    document.documentElement.setAttribute("data-theme", theme);
    await render(<Picker />);
    const ground = backdrop(find("surface"));
    const rest = getComputedStyle(find("label")).color;
    expect(rest, "쉼 잉크").toBe(tokenColor("color-fg-secondary"));
    const message = getComputedStyle(find("message")).color;
    expect(message, "실패 글 잉크").toBe(tokenColor("color-fg-danger-on-surface"));
    const ratios: Record<string, number> = {
      rest: contrastOn(rest, ground),
      message: contrastOn(message, ground),
      badge: textContrast(find("badge")),
      title: contrastOn(getComputedStyle(find("title")).color, ground),
    };
    await userEvent.hover(find("row"));
    // 행은 면 · 잉크를 140ms 에 걸쳐 바꾼다 — 끝값을 기다린다.
    await expect.poll(() => getComputedStyle(find("row")).backgroundColor, { timeout: 2000 }).toBe(tokenColor("color-accent-ghost-hover", "backgroundColor"));
    await expect.poll(() => getComputedStyle(find("label")).color, { timeout: 2000 }).toBe(tokenColor("color-fg-primary"));
    const hoverInk = getComputedStyle(find("label")).color;
    ratios.hover = contrastOn(hoverInk, backdrop(find("row")));
    for (const [part, ratio] of Object.entries(ratios)) {
      expect(ratio, `${theme} ${part} ${ratio.toFixed(2)}`).toBeGreaterThanOrEqual(4.5);
    }
  });
}
