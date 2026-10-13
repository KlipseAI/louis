// Lightbox(`.louis-lightbox`)의 레시피가 실제로 그 픽셀과 수명을 만드는지 잰다.
//
// **React 표면이 아니라 클래스 마크업을 렌더한다.** 정본은 packages/css/src/component/lightbox.css 이고 마크업은
// design/components/lightbox.md 의 예시 그대로다. 상태는 바꾸지 않고 상태마다 처음부터 렌더한다 — 전이 중간값을 읽지 않기 위해서다.
// 두 motion 프로젝트(browser · browser-reduced-motion)에서 같이 돈다. 줄인 모션 분기는 matchMedia 로 가른다.
import type { CSSProperties, JSX } from "react";
import { afterEach, expect, test } from "vitest";
import { page, userEvent } from "vitest/browser";
import { render } from "vitest-browser-react";
import "@klipse-design/css/layers.css";
import "@klipse-design/css/tokens.css";
import "@klipse-design/css/styles.css";
import "../../css/src/component/lightbox.css";
import { find, over, parseColor, px, ratio, tokenColor, type Rgba } from "./fixtures/contrast";

afterEach(async () => {
  document.documentElement.removeAttribute("data-theme");
  await page.viewport(1440, 900);
});

const WHITE: Rgba = [255, 255, 255, 1];
const reduced = (): boolean => matchMedia("(prefers-reduced-motion: reduce)").matches;
const token = (name: string): string => getComputedStyle(document.documentElement).getPropertyValue(`--louis-${name}`).trim();
const ms = (value: string): number => (value.endsWith("ms") ? px(value) : px(value) * 1000);

const GLYPH = (
  <svg viewBox="0 0 24 24" aria-hidden="true" data-testid="glyph">
    <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="1.5" />
  </svg>
);

interface LightboxProps {
  readonly state?: "opening" | "open" | "closing";
  readonly ratio?: number;
  readonly from?: { readonly x: number; readonly y: number; readonly scale: number };
  readonly overlay?: boolean;
}

function Lightbox({ state = "open", ratio: r, from, overlay = false }: LightboxProps): JSX.Element {
  const style: Record<string, string> = {};
  if (r !== undefined) style["--louis-lightbox-ratio"] = String(r);
  if (from !== undefined) {
    style["--louis-lightbox-from-x"] = `${from.x}px`;
    style["--louis-lightbox-from-y"] = `${from.y}px`;
    style["--louis-lightbox-from-scale"] = String(from.scale);
  }
  return (
    <div
      className={overlay ? "louis-overlay-panel louis-lightbox" : "louis-lightbox"}
      role="dialog"
      aria-modal="true"
      aria-label="이미지 크게 보기"
      data-louis-state={state}
      data-testid="root"
      style={style as CSSProperties}
    >
      <div className="louis-lightbox__scrim" aria-hidden="true" data-testid="scrim" />
      <div className="louis-lightbox__frame" data-testid="frame">
        <img className="louis-lightbox__media" src="data:image/gif;base64,R0lGODlhAQABAAAAACw=" alt="참조 이미지 2" draggable={false} data-testid="media" />
        <div className="louis-lightbox__actions" data-testid="actions">
          <button type="button" className="louis-lightbox__action" aria-label="참조 이미지 2 삭제" data-testid="delete">
            {GLYPH}
          </button>
          <button type="button" className="louis-lightbox__action" aria-label="닫기" data-testid="close">
            {GLYPH}
          </button>
        </div>
      </div>
    </div>
  );
}

const CASES = [
  { viewport: [1440, 900], ratio: 1, width: 640 },
  { viewport: [1440, 900], ratio: 1.5, width: 640 },
  // 세로 그림 — 80% 세로(720)가 먼저 닿는다. 가로 = 720 × 0.5.
  { viewport: [1440, 900], ratio: 0.5, width: 360 },
  // 좁은 화면 — 90vw(337.5)가 먼저 닿는다.
  { viewport: [375, 812], ratio: 1, width: 337.5 },
] as const;

for (const { viewport, ratio: r, width } of CASES) {
  test(`창 크기 — ${viewport[0]}×${viewport[1]} 비율 ${r} 은 가로 ${width} 이고 640 · 90vw · 80dvh 안에서 비율을 지킨다`, async () => {
    await page.viewport(viewport[0], viewport[1]);
    await render(<Lightbox ratio={r} />);
    const frame = find("frame").getBoundingClientRect();
    expect(frame.width).toBeCloseTo(width, 1);
    expect(frame.height).toBeCloseTo(width / r, 1);
    expect(frame.width).toBeLessThanOrEqual(Math.min(640, viewport[0] * 0.9) + 0.01);
    expect(frame.height).toBeLessThanOrEqual(viewport[1] * 0.8 + 0.01);
    // 화면 가운데.
    expect(frame.left + frame.width / 2).toBeCloseTo(viewport[0] / 2, 0);
    expect(frame.top + frame.height / 2).toBeCloseTo(viewport[1] / 2, 0);
  });
}

test("액션 36 원 · 묶음 안쪽 10 · 사이 8 · 글리프 20 · 창 반경 16 · 층 layer-modal", async () => {
  await render(<Lightbox />);
  const frame = find("frame").getBoundingClientRect();
  const remove = find("delete").getBoundingClientRect();
  const close = find("close").getBoundingClientRect();
  expect(close.width).toBe(36);
  expect(close.height).toBe(36);
  expect(px(getComputedStyle(find("close")).borderTopLeftRadius)).toBeGreaterThanOrEqual(18);
  expect(frame.right - close.right).toBe(10);
  expect(close.top - frame.top).toBe(10);
  expect(close.left - remove.right).toBe(8);
  // 닫기가 모서리(마지막)다.
  expect(close.left).toBeGreaterThan(remove.left);
  const glyph = find("close").querySelector("svg")!.getBoundingClientRect();
  expect(glyph.width).toBe(20);
  expect(glyph.height).toBe(20);
  expect(px(getComputedStyle(find("frame")).borderTopLeftRadius)).toBe(16);
  expect(getComputedStyle(find("frame")).overflow).toBe("hidden");
  expect(getComputedStyle(find("media")).objectFit).toBe("contain");
  expect(getComputedStyle(find("root")).zIndex).toBe(token("layer-modal"));
  expect(getComputedStyle(find("root")).position).toBe("fixed");
  // 흐림은 blur-surface.
  expect(getComputedStyle(find("close")).backdropFilter).toBe(`blur(${token("blur-surface")})`);
});

test("opening 에서 창이 from 변수 자리에 있고 open 에서 풀린다", async () => {
  const from = { x: -412, y: 180, scale: 0.18 };
  const opening = await render(<Lightbox state="opening" from={from} />);
  const frame = getComputedStyle(find("frame"));
  expect(getComputedStyle(find("root")).opacity).toBe("0");
  expect(getComputedStyle(find("root")).visibility).toBe("hidden");
  if (reduced()) {
    expect(frame.translate).toBe("none");
    expect(frame.scale).toBe("none");
  } else {
    expect(frame.translate).toBe("-412px 180px");
    expect(frame.scale).toBe("0.18");
  }
  await opening.unmount();

  await render(<Lightbox state="open" from={from} />);
  const open = getComputedStyle(find("frame"));
  expect(open.translate).toBe("none");
  expect(open.scale).toBe("none");
  expect(getComputedStyle(find("root")).opacity).toBe("1");
});

test("수명 시간 — 열림 modal-enter · 닫힘 modal-exit, 창은 루트 시간을 물려받는다. 줄인 모션에서 0 이다", async () => {
  const open = await render(<Lightbox state="open" />);
  const enter = getComputedStyle(find("root"));
  const frameEnter = getComputedStyle(find("frame"));
  expect(enter.transitionProperty).toBe("opacity");
  expect(frameEnter.transitionProperty).toBe("translate, scale");
  expect(frameEnter.transitionDuration).toBe(enter.transitionDuration);
  if (reduced()) expect(ms(enter.transitionDuration)).toBe(ms(token("motion-reduced-duration")));
  else expect(ms(enter.transitionDuration)).toBe(ms(token("motion-modal-enter-duration")));
  await open.unmount();

  await render(<Lightbox state="closing" from={{ x: 40, y: -20, scale: 0.5 }} />);
  const exit = getComputedStyle(find("root"));
  expect(exit.opacity).toBe("0");
  expect(exit.pointerEvents).toBe("none");
  expect(getComputedStyle(find("frame")).transitionDuration).toBe(exit.transitionDuration);
  if (reduced()) {
    expect(ms(exit.transitionDuration)).toBe(ms(token("motion-reduced-duration")));
    expect(getComputedStyle(find("frame")).translate).toBe("none");
  } else {
    expect(ms(exit.transitionDuration)).toBe(ms(token("motion-modal-exit-duration")));
    expect(getComputedStyle(find("frame")).translate).toBe("40px -20px");
  }
});

test("louis-overlay-panel 을 함께 단 루트 — anchored 상한 · 스크롤 · 열림 scale 을 되돌린다", async () => {
  await render(<Lightbox state="opening" overlay />);
  const root = getComputedStyle(find("root"));
  expect(root.scale).toBe("1");
  expect(root.overflow).toBe("hidden");
  expect(root.maxWidth).toBe("none");
  expect(root.maxHeight).toBe("none");
});

test("호버에서 액션 면이 56% → 80% 로 진해진다", async () => {
  await render(<Lightbox />);
  const close = find("close");
  const scrim = parseColor(tokenColor("color-media-scrim-dark", "backgroundColor"));
  const rest = parseColor(getComputedStyle(close).backgroundColor);
  expect(rest[3]).toBeCloseTo(0.56, 2);
  expect(rest[0]).toBeCloseTo(scrim[0], 0);
  await userEvent.hover(close);
  await expect.poll(() => parseColor(getComputedStyle(close).backgroundColor)[3]).toBeCloseTo(0.8, 2);
  await userEvent.unhover(close);
  expect(getComputedStyle(close).transitionProperty).toContain("scale");
});

const measuredContrast: Record<string, { glyph: number; glyphHover: number; circle: number; scrim: number }> = {};

for (const theme of ["light", "dark"] as const) {
  test(`${theme} — 스크림 · 액션은 두 테마 같은 media 색이고 순백 그림 위 글리프가 3:1 을 넘는다`, async () => {
    document.documentElement.setAttribute("data-theme", theme);
    await render(<Lightbox />);
    const scrim = parseColor(getComputedStyle(find("scrim")).backgroundColor);
    const action = parseColor(getComputedStyle(find("close")).backgroundColor);
    const ink = parseColor(getComputedStyle(find("close")).color);
    const media = parseColor(tokenColor("color-media-scrim-dark", "backgroundColor"));
    const foreground = parseColor(tokenColor("color-media-foreground-dark"));
    expect(scrim[3]).toBeCloseTo(0.88, 2);
    expect(scrim[0]).toBeCloseTo(media[0], 0);
    expect(action[3]).toBeCloseTo(0.56, 2);
    expect(ink).toEqual(foreground);
    expect(getComputedStyle(find("glyph")).color).toBe(getComputedStyle(find("close")).color);

    // 액션은 그림 위에 선다 — 최악 바닥은 순백 그림이다(흐림은 흰색을 바꾸지 않는다).
    const surface = over(action, WHITE);
    const glyph = ratio(over(ink, surface), surface);
    const hover = over([action[0], action[1], action[2], 0.8], WHITE);
    const glyphHover = ratio(over(ink, hover), hover);
    const circle = ratio(surface, WHITE);
    // 흰 그림과 스크림의 경계 — 밝은 화면(흰 바닥) 위에 합성한 스크림.
    const scrimEdge = ratio(WHITE, over(scrim, WHITE));
    expect(glyph, "글리프(56%)").toBeGreaterThanOrEqual(3);
    expect(glyphHover, "글리프(80%)").toBeGreaterThanOrEqual(3);
    expect(circle, "액션 원 경계").toBeGreaterThanOrEqual(3);
    expect(scrimEdge, "스크림 경계").toBeGreaterThanOrEqual(3);
    measuredContrast[theme] = { glyph, glyphHover, circle, scrim: scrimEdge };
    // 두 테마 같은 값 — 테마를 따르지 않는다.
    if (theme === "dark") {
      expect(measuredContrast.dark!.glyph).toBeCloseTo(measuredContrast.light!.glyph, 2);
      expect(measuredContrast.dark!.scrim).toBeCloseTo(measuredContrast.light!.scrim, 2);
    }
    // 문서 Accessibility 의 기록값.
    expect(glyph).toBeCloseTo(4.73, 2);
    expect(glyphHover).toBeCloseTo(12.1, 1);
    expect(circle).toBeCloseTo(4.94, 2);
    expect(scrimEdge).toBeCloseTo(16.56, 2);
  });
}
