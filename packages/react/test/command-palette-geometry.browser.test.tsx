// figma/components.measured.json 의 **command-palette · command-palette-empty** 와 menu-popover 의 **inlineItem** 값을 코드가 여전히
// 만드는지 검증한다(DS-D-0035 (c), 2026-10-14 DS-D-0095).
//
// parity 게이트는 Figma 가 기록과 같은지만 본다. 이 파일이 없으면 CSS 가 조용히 바뀌어도 **Figma 와 기록은 서로 맞고 둘 다
// 코드와 틀린** 상태로 통과한다. 그래서 기록의 키(= Figma 되읽기의 축 키)마다 클래스 마크업을 렌더하고 기록의 필드를 계산값과 맞댄다.
// 셸 배치 · 수명 · 대비 · 호버는 command-palette.browser.test.tsx 가 소유한다.
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

beforeEach(async () => {
  await page.viewport(1440, 900);
});

function num(spec: Record<string, unknown>, field: string, label: string): number {
  const value = spec[field];
  if (typeof value !== "number") throw new Error(`${label}.${field}가 수가 아닙니다`);
  return value;
}

const style = (testId: string): CSSStyleDeclaration => getComputedStyle(find(testId));
const rect = (testId: string): DOMRect => find(testId).getBoundingClientRect();

function settle(): void {
  for (const animation of document.getAnimations()) animation.finish();
}

function Glyph({ testId, className = "louis-icon" }: { readonly testId?: string; readonly className?: string }): JSX.Element {
  return <svg className={className} data-size="sm" viewBox="0 0 24 24" aria-hidden="true" data-testid={testId} />;
}

function Palette({ empty = false }: { readonly empty?: boolean }): JSX.Element {
  return (
    <div className="louis-command-palette" role="dialog" aria-modal="true" aria-label="검색" data-louis-state="open">
      <div className="louis-command-palette__scrim" aria-hidden="true" />
      <div className="louis-command-palette__panel" data-testid="panel">
        <div className="louis-command-palette__search" data-testid="search">
          <Glyph className="louis-icon louis-command-palette__search-icon" testId="search-icon" />
          <input className="louis-command-palette__input" type="text" role="combobox" aria-label="검색" aria-expanded="true" />
          <button type="button" className="louis-icon-button" data-size="sm" data-variant="ghost" aria-label="닫기">
            <Glyph />
          </button>
        </div>
        <div className="louis-command-palette__body">
          {empty ? (
            <p className="louis-command-palette__empty" data-testid="empty">
              검색 결과가 없습니다
            </p>
          ) : (
            <div className="louis-command-palette__list" role="listbox" aria-label="검색 결과" data-testid="list">
              <div className="louis-command-palette__group" role="group" aria-labelledby="g1" data-testid="group-1">
                <div className="louis-menu__group-label" id="g1" data-testid="group-label">
                  캔버스
                </div>
                <div className="louis-menu__item" data-layout="inline" role="option" id="r1" data-testid="row-1">
                  <span className="louis-menu__item-label">캔버스</span>
                  <span className="louis-menu__item-description" data-testid="row-description">
                    노드로 이미지 · 영상 만들기
                  </span>
                </div>
                <div className="louis-menu__item" data-layout="inline" role="option" id="r2" data-testid="row-2">
                  <span className="louis-menu__item-label">새 캔버스</span>
                </div>
              </div>
              <div className="louis-command-palette__group" role="group" aria-labelledby="g2" data-testid="group-2">
                <div className="louis-menu__group-label" id="g2">
                  계정
                </div>
                <div className="louis-menu__item" data-layout="inline" data-tone="danger" role="option" id="r3">
                  <span className="louis-menu__item-label">로그아웃</span>
                </div>
              </div>
            </div>
          )}
        </div>
        <div className="louis-command-palette__footer" data-testid="footer">
          <span className="louis-command-palette__hint" data-testid="hint-1">
            <kbd className="louis-keycap" data-testid="key-1">
              <Glyph />
            </kbd>
            <kbd className="louis-keycap" data-testid="key-2">
              <Glyph />
            </kbd>
            <span data-testid="hint-1-label">이동</span>
          </span>
          <span className="louis-command-palette__hint" data-testid="hint-2">
            <kbd className="louis-keycap">Esc</kbd>
            <span>닫기</span>
          </span>
        </div>
      </div>
    </div>
  );
}

const palette = measured.components["command-palette"].sizes as Sizes;
const empty = measured.components["command-palette-empty"].sizes as Sizes;
const menu = measured.components["menu-popover"].sizes as Sizes;

for (const [key, spec] of Object.entries(palette)) {
  test(`command-palette ${key} — 패널 · 검색줄 · 목록 · 그룹 제목 · 발 · 안내`, async () => {
    await render(<Palette />);
    settle();
    const label = `command-palette.${key}`;
    expect(find("panel").offsetWidth, `${label}.width`).toBe(num(spec, "width", label));
    expect(px(style("panel").borderTopLeftRadius), `${label}.radius`).toBe(num(spec, "radius", label));
    const search = style("search");
    expect(find("search").offsetHeight, `${label}.searchHeight`).toBe(num(spec, "searchHeight", label));
    expect(px(search.paddingTop), `${label}.searchPaddingBlock`).toBe(num(spec, "searchPaddingBlock", label));
    expect(px(search.paddingBottom), `${label}.searchPaddingBlock`).toBe(num(spec, "searchPaddingBlock", label));
    expect(px(search.paddingLeft), `${label}.searchPaddingStart`).toBe(num(spec, "searchPaddingStart", label));
    expect(px(search.paddingRight), `${label}.searchPaddingEnd`).toBe(num(spec, "searchPaddingEnd", label));
    expect(px(search.columnGap), `${label}.searchGap`).toBe(num(spec, "searchGap", label));
    expect(rect("search-icon").width, `${label}.searchIcon`).toBe(num(spec, "searchIcon", label));
    expect(rect("search-icon").height, `${label}.searchIcon`).toBe(num(spec, "searchIcon", label));
    const list = style("list");
    expect(px(list.paddingTop), `${label}.listPadding`).toBe(num(spec, "listPadding", label));
    expect(px(list.paddingLeft), `${label}.listPadding`).toBe(num(spec, "listPadding", label));
    expect(rect("group-2").top - rect("group-1").bottom, `${label}.groupGap`).toBe(num(spec, "groupGap", label));
    expect(rect("row-2").top - rect("row-1").bottom, `${label}.rowGap`).toBe(num(spec, "rowGap", label));
    const groupLabel = style("group-label");
    expect(px(groupLabel.paddingTop), `${label}.groupLabelPaddingBlock`).toBe(num(spec, "groupLabelPaddingBlock", label));
    expect(px(groupLabel.paddingLeft), `${label}.groupLabelPaddingInline`).toBe(num(spec, "groupLabelPaddingInline", label));
    const footer = style("footer");
    expect(find("footer").offsetHeight, `${label}.footerHeight`).toBe(num(spec, "footerHeight", label));
    expect(px(footer.paddingTop), `${label}.footerPaddingBlock`).toBe(num(spec, "footerPaddingBlock", label));
    expect(px(footer.paddingLeft), `${label}.footerPaddingInline`).toBe(num(spec, "footerPaddingInline", label));
    expect(rect("hint-2").left - rect("hint-1").right, `${label}.footerGap`).toBe(num(spec, "footerGap", label));
    expect(rect("hint-1-label").left - rect("key-2").right, `${label}.hintGap`).toBe(num(spec, "hintGap", label));
    expect(rect("key-2").left - rect("key-1").right, `${label}.keyGap`).toBe(num(spec, "keyGap", label));
  });
}

for (const [key, spec] of Object.entries(empty)) {
  test(`command-palette-empty ${key} — 위아래 · 좌우 · 글`, async () => {
    await render(<Palette empty />);
    settle();
    const label = `command-palette-empty.${key}`;
    const node = style("empty");
    expect(px(node.paddingTop), `${label}.paddingBlock`).toBe(num(spec, "paddingBlock", label));
    expect(px(node.paddingBottom), `${label}.paddingBlock`).toBe(num(spec, "paddingBlock", label));
    expect(px(node.paddingLeft), `${label}.paddingInline`).toBe(num(spec, "paddingInline", label));
    expect(px(node.fontSize), `${label}.fontSize`).toBe(num(spec, "fontSize", label));
  });
}

test("menu-popover inlineItem — 한 줄 항목 높이 · 여백 · 간격 · 곡률 · 정렬 · 설명 글자", async () => {
  await render(<Palette />);
  settle();
  const spec = menu.inlineItem as Record<string, unknown>;
  const label = "menu-popover.inlineItem";
  const row = style("row-1");
  expect(find("row-1").offsetHeight, `${label}.itemHeight`).toBe(num(spec, "itemHeight", label));
  expect(px(row.paddingTop), `${label}.itemPaddingBlock`).toBe(num(spec, "itemPaddingBlock", label));
  expect(px(row.paddingLeft), `${label}.itemPaddingInline`).toBe(num(spec, "itemPaddingInline", label));
  expect(px(row.columnGap), `${label}.itemGap`).toBe(num(spec, "itemGap", label));
  expect(px(row.borderTopLeftRadius), `${label}.itemRadius`).toBe(num(spec, "itemRadius", label));
  expect(row.alignItems, `${label}.itemAlign`).toBe(spec.itemAlign);
  const description = style("row-description");
  expect(px(description.fontSize), `${label}.descriptionFontSize`).toBe(num(spec, "descriptionFontSize", label));
  expect(Math.round((px(description.lineHeight) / px(description.fontSize)) * 100), `${label}.descriptionLineHeightPercent`).toBe(
    num(spec, "descriptionLineHeightPercent", label),
  );
});
