// Notice Pill(`.louis-notice-pill`)의 레시피가 실제로 그 픽셀을 만드는지 잰다.
//
// **React 표면이 아니라 클래스 마크업을 렌더한다.** 정본은 packages/css/src/component/notice-pill.css 이고 마크업은
// design/components/notice-pill.md 의 예시 그대로다.
//
// **대비는 최악의 영상 프레임 위에서 잰다.** 알약은 영상 위에 뜨고 영상은 어떤 밝기든 될 수 있다 — 흰 프레임(#fff) 위에서
// 스크림을 합성한 면 대 글자를 잰다. 두 테마가 같은 값이어야 한다(media 축).
import type { JSX } from "react";
import { afterEach, expect, test } from "vitest";
import { userEvent } from "vitest/browser";
import { render } from "vitest-browser-react";
import "@klipse-design/css/layers.css";
import "@klipse-design/css/tokens.css";
import "@klipse-design/css/styles.css";
import "../../css/src/component/notice-pill.css";
import { find, parseColor, px, textContrast, tokenColor } from "./fixtures/contrast";

afterEach(() => {
  document.documentElement.removeAttribute("data-theme");
});

const WORDMARK =
  "data:image/svg+xml," +
  encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="200" height="20"><rect width="200" height="20" fill="#fff"/></svg>');

/** 흰 영상 프레임 위 알약 셋 — 맨 공지(`p`), 로고 있는 링크(`a`), 좁은 자리의 긴 문구. */
function Hero(): JSX.Element {
  return (
    <div style={{ display: "grid", gap: 12, padding: 24, inlineSize: 480, background: "#ffffff" }}>
      <div>
        <p className="louis-notice-pill" data-testid="static">
          <span className="louis-notice-pill__dot" aria-hidden="true" data-testid="static-dot" />
          <span className="louis-notice-pill__text" data-testid="static-text">
            새 모델이 열렸습니다
          </span>
        </p>
      </div>
      <div>
        <a className="louis-notice-pill" href="#notice" data-testid="link">
          <span className="louis-notice-pill__dot" aria-hidden="true" data-testid="link-dot" />
          <img className="louis-notice-pill__logo" src={WORDMARK} alt="" data-testid="logo" />
          <span className="louis-notice-pill__text" data-testid="link-text">
            지금 써 보기
          </span>
        </a>
      </div>
      <div style={{ inlineSize: 160 }}>
        <p className="louis-notice-pill" data-testid="narrow">
          <span className="louis-notice-pill__dot" aria-hidden="true" />
          <span className="louis-notice-pill__text" data-testid="narrow-text">
            아주 긴 공지 문구가 알약 폭을 넘어도 줄이 바뀌지 않는다
          </span>
        </p>
      </div>
    </div>
  );
}

test("알약은 높이 32 · 좌우 12 · 반경 12 · 유리 흐림 16 이다", async () => {
  await render(<Hero />);
  const pill = find("static");
  expect(pill.getBoundingClientRect().height).toBe(32);
  const style = getComputedStyle(pill);
  expect(px(style.paddingLeft)).toBe(12);
  expect(px(style.paddingRight)).toBe(12);
  expect(px(style.borderTopLeftRadius)).toBe(12);
  expect(px(style.marginTop)).toBe(0);
  expect(style.backdropFilter).toContain("blur(16px)");
  expect(style.backdropFilter).toContain("saturate(1.3)");
});

test("점 4 · 뒤 10, 로고 높이 16 · 최대 48 · 뒤 6 이 요소마다 오른쪽 간격이다", async () => {
  await render(<Hero />);
  const dot = find("link-dot").getBoundingClientRect();
  expect(dot.width).toBe(4);
  expect(dot.height).toBe(4);
  const logo = find("logo").getBoundingClientRect();
  expect(logo.left - dot.right).toBe(10);
  expect(logo.height).toBe(16);
  expect(logo.width).toBe(48);
  expect(find("link-text").getBoundingClientRect().left - logo.right).toBe(6);
  // 로고가 없으면 점 뒤 10 이 그대로 문구 앞 간격이다.
  expect(find("static-text").getBoundingClientRect().left - find("static-dot").getBoundingClientRect().right).toBe(10);
});

test("긴 문구는 한 줄에서 말줄임으로 잘리고 알약은 32 를 지킨다", async () => {
  await render(<Hero />);
  const text = find("narrow-text");
  expect(getComputedStyle(text).textOverflow).toBe("ellipsis");
  expect(text.scrollWidth).toBeGreaterThan(text.clientWidth);
  expect(find("narrow").getBoundingClientRect().height).toBe(32);
  expect(find("narrow").getBoundingClientRect().width).toBeLessThanOrEqual(160);
});

test("누를 수 있는 요소만 커서 · 호버가 붙고, 호버에서 스크림이 56% → 72% 다", async () => {
  await render(<Hero />);
  expect(getComputedStyle(find("static")).cursor).not.toBe("pointer");
  const link = find("link");
  expect(getComputedStyle(link).cursor).toBe("pointer");
  expect(getComputedStyle(link).textDecorationLine).toBe("none");
  expect(parseColor(getComputedStyle(link).backgroundColor)[3]).toBeCloseTo(0.56, 2);
  await userEvent.hover(link);
  await expect.poll(() => parseColor(getComputedStyle(link).backgroundColor)[3]).toBeCloseTo(0.72, 2);
  await userEvent.unhover(link);
  // 누를 수 없는 알약은 호버해도 그대로다.
  await userEvent.hover(find("static"));
  expect(parseColor(getComputedStyle(find("static")).backgroundColor)[3]).toBeCloseTo(0.56, 2);
  await userEvent.unhover(find("static"));
});

for (const theme of ["light", "dark"] as const) {
  test(`${theme} — 흰 프레임 위에서 글자가 쉼 · 호버 모두 4.5:1 을 넘고 면 · 점이 테마를 따르지 않는다`, async () => {
    document.documentElement.setAttribute("data-theme", theme);
    await render(<Hero />);
    const rest = textContrast(find("static"));
    expect(rest, "쉼").toBeGreaterThanOrEqual(4.5);

    const link = find("link");
    await userEvent.hover(link);
    await expect.poll(() => parseColor(getComputedStyle(link).backgroundColor)[3]).toBeCloseTo(0.72, 2);
    const hover = textContrast(link);
    expect(hover, "호버").toBeGreaterThanOrEqual(4.5);
    await userEvent.unhover(link);

    expect(getComputedStyle(find("static")).color).toBe(tokenColor("color-media-foreground-dark"));
    expect(getComputedStyle(find("static-dot")).backgroundColor).toBe(tokenColor("color-green-500", "backgroundColor"));
    expect(getComputedStyle(find("static-dot")).backgroundColor).toBe(tokenColor("color-notice-pill-dot", "backgroundColor"));
  });
}
