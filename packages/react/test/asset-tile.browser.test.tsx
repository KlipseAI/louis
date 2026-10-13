// Asset Tile(`.louis-asset-tile`)과 예시 갤러리 칸(`media-slot[data-size="fill"][data-ratio="2:3"]`)의 레시피가 실제로 그 픽셀을 만드는지 잰다.
//
// **React 표면이 아니라 클래스 마크업을 렌더한다.** 정본은 packages/css/src/component/asset-tile.css 이고 마크업은
// design/components/asset-tile.md 의 예시 그대로다. 칸은 이미지 편집 모달 면(`bg-surface`) 위에 선다.
import type { JSX } from "react";
import { afterEach, expect, test } from "vitest";
import { userEvent } from "vitest/browser";
import { render } from "vitest-browser-react";
import "@klipse-design/css/layers.css";
import "@klipse-design/css/tokens.css";
import "@klipse-design/css/styles.css";
import "../../css/src/component/asset-tile.css";
import "../../css/src/component/media-slot.css";
import { backdrop, find, parseColor, px, ratio, textContrast, tokenColor } from "./fixtures/contrast";

afterEach(() => {
  document.documentElement.removeAttribute("data-theme");
});

// 흰 선만으로 된 스티커를 흉내 낸 그림 — 투명 바탕 위 흰 획.
const WHITE_ASSET =
  "data:image/svg+xml," +
  encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 10"><path d="M1 1h8v8H1z" fill="none" stroke="#fff"/></svg>');

function Palette({ width = 212 }: { readonly width?: number }): JSX.Element {
  return (
    <div style={{ inlineSize: width, background: "var(--louis-color-bg-surface)" }}>
      <div className="louis-asset-tile-grid" data-testid="grid">
        {["격자", "아주 긴 이름의 스티커 에셋 하나"].map((name, index) => (
          <button key={name} type="button" className="louis-asset-tile" title={name} data-testid={`tile-${index}`}>
            <span className="louis-asset-tile__well" data-testid={`well-${index}`}>
              <img className="louis-asset-tile__media" src={WHITE_ASSET} alt="" draggable={false} data-testid={`media-${index}`} />
            </span>
            <span className="louis-asset-tile__label" data-testid={`label-${index}`}>
              {name}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

test("칸의 안쪽 · 사이 · 테두리 · 반경이 제품 값이고 우물이 정사각 · 반경 4 다", async () => {
  await render(<Palette />);
  const tile = getComputedStyle(find("tile-0"));
  expect(px(tile.paddingTop)).toBe(4);
  expect(px(tile.paddingLeft)).toBe(4);
  expect(px(tile.rowGap)).toBe(4);
  expect(px(tile.borderTopWidth)).toBe(1);
  expect(tile.borderTopStyle).toBe("solid");
  expect(px(tile.borderTopLeftRadius)).toBe(8);
  expect(tile.flexDirection).toBe("column");

  const well = find("well-0").getBoundingClientRect();
  expect(well.width).toBeGreaterThan(0);
  expect(well.height).toBe(well.width);
  expect(px(getComputedStyle(find("well-0")).borderTopLeftRadius)).toBe(4);
  // 우물은 칸 안쪽 폭을 채운다(칸 폭 − 2 × (안쪽 4 + 테두리 1)).
  expect(well.width).toBe(find("tile-0").getBoundingClientRect().width - 2 * (4 + 1));

  const media = getComputedStyle(find("media-0"));
  expect(px(media.paddingTop)).toBe(2);
  expect(media.objectFit).toBe("contain");
  expect(media.pointerEvents).toBe("none");
});

test("격자는 같은 폭 두 열 · 사이 6 이고 열 수를 소비처가 덮는다", async () => {
  await render(<Palette />);
  const left = find("tile-0").getBoundingClientRect();
  const right = find("tile-1").getBoundingClientRect();
  expect(left.width).toBe(right.width);
  expect(right.left - left.right).toBe(6);
  expect(left.top).toBe(right.top);

  find("grid").style.setProperty("--louis-asset-tile-grid-columns", "1");
  const stacked = [find("tile-0").getBoundingClientRect(), find("tile-1").getBoundingClientRect()];
  expect(stacked[0]!.left).toBe(stacked[1]!.left);
  expect(stacked[1]!.top - stacked[0]!.bottom).toBe(6);
});

test("긴 라벨은 한 줄에서 말줄임으로 잘린다", async () => {
  await render(<Palette />);
  const label = find("label-1");
  const style = getComputedStyle(label);
  expect(style.whiteSpace).toBe("nowrap");
  expect(style.textOverflow).toBe("ellipsis");
  expect(label.scrollWidth).toBeGreaterThan(label.clientWidth);
  expect(label.getBoundingClientRect().height).toBe(px(style.lineHeight));
});

test("호버에서 면이 08 로, 선이 강조색 48% 로 바뀐다", async () => {
  await render(<Palette />);
  const tile = find("tile-0");
  const rest = getComputedStyle(tile).backgroundColor;
  expect(rest).toBe(tokenColor("color-gray-000-alpha-04", "backgroundColor"));
  await userEvent.hover(tile);
  await expect.poll(() => getComputedStyle(tile).backgroundColor).toBe(tokenColor("color-gray-000-alpha-08", "backgroundColor"));
  const accent = parseColor(tokenColor("color-accent-primary"));
  await expect.poll(() => parseColor(getComputedStyle(tile).borderTopColor)[3]).toBeCloseTo(0.48, 2);
  const border = parseColor(getComputedStyle(tile).borderTopColor);
  expect(border[0]).toBeCloseTo(accent[0], 0);
  expect(border[2]).toBeCloseTo(accent[2], 0);
  await userEvent.unhover(tile);
  // 누름 0.97 은 transition 에 scale 을 들고 있다.
  expect(getComputedStyle(tile).transitionProperty).toContain("scale");
});

for (const theme of ["light", "dark"] as const) {
  test(`${theme} — 라벨이 4.5:1 을 넘고 우물은 두 테마 같은 회색 40% 다`, async () => {
    document.documentElement.setAttribute("data-theme", theme);
    await render(<Palette />);
    const label = textContrast(find("label-0"));
    expect(label, "라벨").toBeGreaterThanOrEqual(4.5);
    expect(getComputedStyle(find("label-0")).color).toBe(tokenColor("color-fg-secondary"));

    const well = parseColor(getComputedStyle(find("well-0")).backgroundColor);
    const gray = parseColor(tokenColor("color-palette-gray-600"));
    expect(well[3]).toBeCloseTo(0.4, 2);
    expect(well[0]).toBeCloseTo(gray[0], 0);
    expect(well[1]).toBeCloseTo(gray[1], 0);
    // 흰 선 에셋 대 우물(칸 면 · 모달 면 위에 합성한 바탕). 우물의 이유가 다크에서 흰 선을 살리는 것이라 다크는 3:1 을 넘어야 하고,
    // 라이트는 문서 Known deviations 1 의 기록값(2.06)이다 — 그림은 장식이고 이름은 라벨이 말한다.
    const white = ratio([255, 255, 255, 1], backdrop(find("well-0")));
    if (theme === "dark") expect(white, "다크 흰 에셋").toBeGreaterThanOrEqual(3);
    else expect(white, "라이트 흰 에셋(기록)").toBeCloseTo(2.06, 1);
  });
}

/** 예시 갤러리 — 누를 수 없는 2:3 칸 셋이 3열 · 사이 8 격자에 선다(ExampleGallery). */
function Gallery(): JSX.Element {
  return (
    <div style={{ inlineSize: 212 }}>
      <div className="louis-media-slot-strip" data-layout="grid" data-testid="gallery">
        {[1, 2, 3].map((n) => (
          <div key={n} className="louis-media-slot" data-size="fill" data-ratio="2:3" data-testid={`cell-${n}`}>
            <img className="louis-media-slot__media" src={WHITE_ASSET} alt={`예시 ${n}`} />
          </div>
        ))}
      </div>
    </div>
  );
}

test("예시 갤러리 칸은 media-slot fill 2:3 — 열 폭 · 세로 1.5 배 · 3열 사이 8 이다", async () => {
  await render(<Gallery />);
  const cells = [1, 2, 3].map((n) => find(`cell-${n}`).getBoundingClientRect());
  for (const cell of cells) {
    expect(cell.height).toBeCloseTo((cell.width * 3) / 2, 0);
  }
  expect(cells[1]!.left - cells[0]!.right).toBe(8);
  expect(cells[0]!.width).toBeCloseTo(cells[2]!.width, 1);
  expect(px(getComputedStyle(find("cell-1")).borderTopLeftRadius)).toBe(12);
  // 비율 속성이 없는 fill 은 그대로 정사각이다.
  find("cell-1").removeAttribute("data-ratio");
  const square = find("cell-1").getBoundingClientRect();
  expect(square.height).toBe(square.width);
});
