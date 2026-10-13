// Logo Tile(`.louis-logo-tile`)의 레시피가 실제로 그 픽셀을 만드는지 잰다.
//
// **React 표면이 아니라 클래스 마크업을 렌더한다.** 정본은 packages/css/src/component/logo-tile.css 이고 마크업은
// design/components/logo-tile.md 의 예시 그대로다. 로고는 흰 실루엣 그림을 마스크로만 쓰고 글자색으로 칠한다.
import type { JSX } from "react";
import { afterEach, expect, test } from "vitest";
import { page } from "vitest/browser";
import { render } from "vitest-browser-react";
import "@klipse-design/css/layers.css";
import "@klipse-design/css/tokens.css";
import "@klipse-design/css/styles.css";
import "../../css/src/component/logo-tile.css";
import { find, px, textContrast, tokenColor } from "./fixtures/contrast";

afterEach(() => {
  document.documentElement.removeAttribute("data-theme");
});

// 흰 실루엣 로고를 흉내 낸 그림 — 마스크는 알파만 읽는다.
const LOGO = `url("data:image/svg+xml,${encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 10"><circle cx="5" cy="5" r="4" fill="#fff"/></svg>',
)}")`;

function Tiles(): JSX.Element {
  return (
    <div style={{ display: "flex", gap: 16, padding: 16, background: "var(--louis-color-bg-surface)" }}>
      {(["sm", undefined, "lg"] as const).map((size) => (
        <span
          key={size ?? "md"}
          className="louis-logo-tile"
          data-size={size}
          aria-hidden="true"
          style={{ ["--louis-logo-tile-image" as string]: LOGO }}
          data-testid={`tile-${size ?? "md"}`}
        >
          <span className="louis-logo-tile__glyph" data-testid={`glyph-${size ?? "md"}`} />
        </span>
      ))}
      <span className="louis-logo-tile" aria-hidden="true" data-testid="tile-fallback">
        <span className="louis-logo-tile__fallback" data-testid="fallback">
          K
        </span>
      </span>
    </div>
  );
}

test("크기 셋 48 · 56 · 72 · 반경 12 이고 글리프는 늘 칸의 절반이다", async () => {
  await page.viewport(1280, 800);
  await render(<Tiles />);
  for (const [size, edge] of [
    ["sm", 48],
    ["md", 56],
    ["lg", 72],
  ] as const) {
    const tile = find(`tile-${size}`).getBoundingClientRect();
    expect(tile.width, size).toBe(edge);
    expect(tile.height, size).toBe(edge);
    expect(px(getComputedStyle(find(`tile-${size}`)).borderTopLeftRadius)).toBe(12);
    const glyph = find(`glyph-${size}`).getBoundingClientRect();
    expect(glyph.width, `${size} 글리프`).toBe(edge / 2);
    expect(glyph.height).toBe(edge / 2);
    // 가운데 정렬.
    expect(glyph.left - tile.left).toBe(edge / 4);
    expect(glyph.top - tile.top).toBe(edge / 4);
  }
});

test("719 이하에서 기본(md) 칸이 48 · 글리프 24 로 내려가고 lg 는 그대로다", async () => {
  await page.viewport(719, 800);
  await render(<Tiles />);
  expect(find("tile-md").getBoundingClientRect().width).toBe(48);
  expect(find("glyph-md").getBoundingClientRect().width).toBe(24);
  expect(find("tile-lg").getBoundingClientRect().width).toBe(72);
  await page.viewport(1280, 800);
});

test("글리프는 로고 그림을 마스크로 받고 글자색으로 칠한다", async () => {
  await render(<Tiles />);
  const glyph = getComputedStyle(find("glyph-md"));
  expect(glyph.maskImage).toContain("data:image/svg+xml");
  expect(glyph.maskSize).toBe("contain");
  expect(glyph.maskRepeat).toBe("no-repeat");
  expect(glyph.backgroundColor).toBe(tokenColor("color-fg-primary"));
  expect(getComputedStyle(find("tile-md")).backgroundColor).toBe(tokenColor("color-gray-000-alpha-04", "backgroundColor"));
});

test("대체 글자는 body-md semibold 다", async () => {
  await render(<Tiles />);
  const fallback = getComputedStyle(find("fallback"));
  const probe = document.createElement("span");
  probe.style.fontSize = "var(--louis-typography-body-md-semibold-font-size)";
  probe.style.fontWeight = "var(--louis-typography-body-md-semibold-font-weight)";
  document.body.append(probe);
  expect(fallback.fontSize).toBe(getComputedStyle(probe).fontSize);
  expect(fallback.fontWeight).toBe(getComputedStyle(probe).fontWeight);
  probe.remove();
});

for (const theme of ["light", "dark"] as const) {
  test(`${theme} — 글리프 · 대체 글자가 칸 면 위 4.5:1 을 넘는다`, async () => {
    document.documentElement.setAttribute("data-theme", theme);
    await render(<Tiles />);
    const fallback = textContrast(find("fallback"));
    expect(fallback).toBeGreaterThanOrEqual(4.5);
    // 글리프 칠은 `currentcolor` 다 — 칸의 글자색이 곧 글리프 색이다.
    expect(getComputedStyle(find("glyph-md")).backgroundColor).toBe(getComputedStyle(find("tile-md")).color);
    const graphic = textContrast(find("tile-md"));
    expect(graphic).toBeGreaterThanOrEqual(4.5);
  });
}
