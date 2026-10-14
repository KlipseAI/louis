// figma/components.measured.json 의 **media-scrubber · video-player** 기하를 코드가 여전히 만드는지 잰다(DS-D-0035 (c)).
// 플레이어는 React 표면이 없는 CSS 레시피(packages/css/src/component/video-player.css)라 문서(design/components/video-player.md)
// Anatomy 의 마크업(기본 판)과 「플랫폼 미리보기」 마크업(youtube 판)을 렌더한다. 글리프 · 볼륨 패널처럼 기하에 닿지 않는 자식은 뺐다.
import type { JSX } from "react";
import { beforeEach, expect, test } from "vitest";
import { page, userEvent } from "vitest/browser";
import { render } from "vitest-browser-react";
import measured from "../../../figma/components.measured.json" with { type: "json" };
import "@klipse-design/css/layers.css";
import "@klipse-design/css/tokens.css";
import "@klipse-design/css/styles.css";
import { find, px } from "./fixtures/contrast";

type Sizes = Record<string, Record<string, unknown>>;

/** `sizes` 한 칸의 수 필드. `$…` 사유와 한 객체에 섞여 있어 타입이 열려 있다 — 수가 아니면 던진다. */
function num(spec: Record<string, unknown>, field: string, label: string): number {
  const value = spec[field];
  if (typeof value !== "number") throw new Error(`${label}.${field}가 수가 아닙니다`);
  return value;
}

/** 트랙 높이 · 썸이 전이로 움직인다 — 끝난 값을 읽는다. */
async function settle(): Promise<void> {
  void getComputedStyle(document.body).opacity;
  await Promise.all(document.getAnimations().map((animation) => animation.finished.catch(() => undefined)));
}

const scrubberSizes = measured.components["media-scrubber"].sizes as unknown as Sizes;
const playerSizes = measured.components["video-player"].sizes as unknown as Sizes;

beforeEach(async () => {
  await page.viewport(1440, 900);
});

const vars = (values: Record<string, string | number>): Record<string, string | number> => values;

function Scrubber(): JSX.Element {
  return (
    <div className="louis-video-player__scrubber" role="slider" tabIndex={0} aria-label="재생 위치" aria-valuenow={25} data-testid="scrubber">
      <div className="louis-video-player__scrubber-track" data-testid="track">
        <div className="louis-video-player__scrubber-fill" />
      </div>
      <div className="louis-video-player__scrubber-thumb" data-testid="thumb" />
    </div>
  );
}

function Player({ platform }: { platform: "base" | "youtube" }): JSX.Element {
  if (platform === "youtube") {
    return (
      <div style={{ inlineSize: 640 }}>
        <div className="louis-video-player" data-platform="youtube" style={vars({ "--louis-video-player-progress": 30 })}>
          <video className="louis-video-player__media" style={{ inlineSize: 640, blockSize: 360 }} />
          <div className="louis-video-player__bottom" data-testid="bottom">
            <Scrubber />
            <div className="louis-video-player__controls" data-testid="controls">
              <div className="louis-video-player__controls-start">
                <button type="button" className="louis-video-player__button" data-role="play" aria-label="재생" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  return (
    <div style={{ inlineSize: 320, blockSize: 180 }}>
      <div className="louis-video-player" data-tone="dark" style={vars({ "--louis-video-player-progress": 42 })}>
        <video className="louis-video-player__media" />
        <div className="louis-video-player__bottom" data-testid="bottom">
          <div className="louis-video-player__bar" data-testid="bar">
            <span className="louis-video-player__time">0:07</span>
            <Scrubber />
            <span className="louis-video-player__time">−0:33</span>
          </div>
        </div>
      </div>
    </div>
  );
}

test("media-scrubber base — 누르는 높이 · 트랙 3 → 5(hover) · 썸 12 가 기록과 같다", async () => {
  const spec = scrubberSizes["base"];
  if (spec === undefined) throw new Error("media-scrubber.sizes.base 가 없습니다");
  const label = "media-scrubber.base";
  await render(<Player platform="base" />);
  const scrubber = find("scrubber");
  expect(scrubber.getBoundingClientRect().height, `${label} height`).toBe(num(spec, "height", label));
  await settle();
  expect(find("track").getBoundingClientRect().height, `${label} trackHeight`).toBe(num(spec, "trackHeight", label));
  // 썸은 쉬는 동안 scale(0) — 상자 크기는 선언으로 잰다.
  const thumb = getComputedStyle(find("thumb"));
  expect(px(thumb.inlineSize), `${label} thumbSize 폭`).toBe(num(spec, "thumbSize", label));
  expect(px(thumb.blockSize), `${label} thumbSize 높이`).toBe(num(spec, "thumbSize", label));
  await userEvent.hover(scrubber);
  await settle();
  expect(find("track").getBoundingClientRect().height, `${label} trackHeightHover`).toBe(num(spec, "trackHeightHover", label));
  // 펼치면 썸이 그 크기로 보인다.
  expect(find("thumb").getBoundingClientRect().width, `${label} thumbSize 펼침`).toBe(num(spec, "thumbSize", label));
  await userEvent.unhover(scrubber);
});

test("video-player base — 하단 줄 높이(파생) · 여백 · 막대 높이가 기록과 같다", async () => {
  const spec = playerSizes["base"];
  if (spec === undefined) throw new Error("video-player.sizes.base 가 없습니다");
  const label = "video-player.base";
  await render(<Player platform="base" />);
  const bottom = find("bottom");
  const style = getComputedStyle(bottom);
  expect(bottom.getBoundingClientRect().height, `${label} bottomHeight`).toBe(num(spec, "bottomHeight", label));
  expect(px(style.paddingTop), `${label} bottomPaddingTop`).toBe(num(spec, "bottomPaddingTop", label));
  expect(px(style.paddingLeft), `${label} bottomPaddingInline 왼`).toBe(num(spec, "bottomPaddingInline", label));
  expect(px(style.paddingRight), `${label} bottomPaddingInline 오른`).toBe(num(spec, "bottomPaddingInline", label));
  expect(px(style.paddingBottom), `${label} bottomPaddingBottom`).toBe(num(spec, "bottomPaddingBottom", label));
  expect(find("bar").getBoundingClientRect().height, `${label} barHeight`).toBe(num(spec, "barHeight", label));
});

test("video-player youtube — 하단 줄 높이(파생) · 들임 · 사이 · 진행 막대 · 조작 줄 높이가 기록과 같다", async () => {
  const spec = playerSizes["youtube"];
  if (spec === undefined) throw new Error("video-player.sizes.youtube 가 없습니다");
  const label = "video-player.youtube";
  await render(<Player platform="youtube" />);
  const bottom = find("bottom");
  const style = getComputedStyle(bottom);
  expect(bottom.getBoundingClientRect().height, `${label} bottomHeight`).toBe(num(spec, "bottomHeight", label));
  expect(px(style.left), `${label} bottomInset 왼`).toBe(num(spec, "bottomInset", label));
  expect(px(style.right), `${label} bottomInset 오른`).toBe(num(spec, "bottomInset", label));
  expect(px(style.bottom), `${label} bottomInset 아래`).toBe(num(spec, "bottomInset", label));
  expect(px(style.rowGap), `${label} bottomGap`).toBe(num(spec, "bottomGap", label));
  expect(find("scrubber").getBoundingClientRect().height, `${label} scrubberHeight`).toBe(num(spec, "scrubberHeight", label));
  expect(find("controls").getBoundingClientRect().height, `${label} controlsHeight`).toBe(num(spec, "controlsHeight", label));
});
