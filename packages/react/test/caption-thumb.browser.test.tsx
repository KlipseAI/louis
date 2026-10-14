// Caption Thumb(`.louis-caption-thumb`)의 레시피가 실제로 그 썸네일을 만드는지 잰다(DS-D-0115).
//
// **React 표면이 아니라 클래스 마크업을 렌더한다.** 정본은 packages/css/src/component/caption-thumb.css 이고 마크업은
// design/components/caption-thumb.md 의 예시 그대로다. 위치 · 색은 소비처가 주는 데이터라 지역 변수가 그대로 서는지만 본다.
import type { CSSProperties, JSX } from "react";
import { afterEach, expect, test } from "vitest";
import { page } from "vitest/browser";
import { render } from "vitest-browser-react";
import "@klipse-design/css/layers.css";
import "@klipse-design/css/tokens.css";
import "@klipse-design/css/styles.css";
import { find, px } from "./fixtures/contrast";

afterEach(() => {
  document.documentElement.removeAttribute("data-theme");
});

const v = (vars: Record<string, string>): CSSProperties => vars as CSSProperties;

function Thumb(): JSX.Element {
  return (
    <span
      className="louis-caption-thumb"
      aria-hidden="true"
      data-testid="thumb"
      style={v({ "--louis-caption-thumb-letterbox": "rgb(0, 0, 0)", "--louis-caption-thumb-video-y": "25%", "--louis-caption-thumb-video-h": "50%" })}
    >
      <span className="louis-caption-thumb__video" data-testid="video" />
      <span className="louis-caption-thumb__line" data-role="title" data-testid="title" style={v({ "--louis-caption-thumb-y": "6%", "--louis-caption-thumb-color": "rgb(250, 250, 250)" })} />
      <span className="louis-caption-thumb__line" data-role="subtitle" data-testid="subtitle" style={v({ "--louis-caption-thumb-y": "13%" })} />
      <span className="louis-caption-thumb__line" data-role="caption" data-testid="caption" style={v({ "--louis-caption-thumb-y": "68%", "--louis-caption-thumb-x": "15%", "--louis-caption-thumb-w": "70%" })} />
      <span className="louis-caption-thumb__line" data-role="caption" data-boxed="true" data-testid="boxed" style={v({ "--louis-caption-thumb-y": "80%" })} />
      <span className="louis-caption-thumb__line" data-role="subtitle" data-boxed="true" data-testid="boxed-sub" style={v({ "--louis-caption-thumb-y": "90%" })} />
    </span>
  );
}

test("프레임은 27 × 48 · 반경 4 · 넘침 자름이고 레터박스는 지역 변수를 따른다", async () => {
  await page.viewport(1280, 800);
  await render(<Thumb />);
  const box = find("thumb").getBoundingClientRect();
  expect(box.width).toBe(27);
  expect(box.height).toBe(48);
  const style = getComputedStyle(find("thumb"));
  expect(px(style.borderTopLeftRadius)).toBe(4);
  expect(style.overflow).toBe("hidden");
  expect(style.backgroundColor).toBe("rgb(0, 0, 0)");
  expect(style.boxShadow).not.toBe("none");
});

test("영상 자리는 지역 변수대로 서고 두 테마에서 같은 색이다", async () => {
  await page.viewport(1280, 800);
  const colors: string[] = [];
  for (const theme of ["light", "dark"] as const) {
    document.documentElement.setAttribute("data-theme", theme);
    const screen = await render(<Thumb />);
    const frame = find("thumb").getBoundingClientRect();
    const video = find("video").getBoundingClientRect();
    expect(video.top - frame.top).toBe(12);
    expect(video.height).toBe(24);
    expect(video.width).toBe(27);
    colors.push(getComputedStyle(find("video")).backgroundColor);
    await screen.unmount();
  }
  expect(colors[0]).toBe(colors[1]);
});

test("줄 높이는 제목 3 · 부제목 2 · 자막 3 · 박스 +2 · 반경 1 이고 위치 · 색은 지역 변수를 따른다", async () => {
  await page.viewport(1280, 800);
  await render(<Thumb />);
  expect(find("title").getBoundingClientRect().height).toBe(3);
  expect(find("subtitle").getBoundingClientRect().height).toBe(2);
  expect(find("caption").getBoundingClientRect().height).toBe(3);
  expect(find("boxed").getBoundingClientRect().height).toBe(5);
  expect(find("boxed-sub").getBoundingClientRect().height).toBe(4);
  expect(px(getComputedStyle(find("title")).borderTopLeftRadius)).toBe(1);
  expect(getComputedStyle(find("title")).backgroundColor).toBe("rgb(250, 250, 250)");
  const frame = find("thumb").getBoundingClientRect();
  const caption = find("caption").getBoundingClientRect();
  expect(Math.round((caption.left - frame.left) * 100) / 100).toBeCloseTo(27 * 0.15, 1);
  expect(caption.width).toBeCloseTo(27 * 0.7, 1);
});
