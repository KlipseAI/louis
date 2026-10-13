// Video Player 크롬 레시피(`.louis-video-player`)가 실제로 그 픽셀을 만드는지 잰다.
//
// **React 표면이 아니라 클래스 마크업을 렌더한다.** packages/react/src 에 표면이 없고(DS-D-0083 2a 판정 9) 정본이
// packages/css/src/component/video-player.css 다. 마크업은 design/components/video-player.md 「마크업 계약」 그대로다.
// 행동(자동 숨김 · 소리 저장소 · 키 계약)은 제품 `VideoPlayer` 몫이라 여기서는 소비처가 다는 속성(`data-chrome` ·
// `data-open` · 변수)을 손으로 주고, 레시피가 그 상태를 그리는지만 본다.
//
// **대비는 렌더해서 잰다.** 유리는 반투명(28 · 40%)이라 토큰 값만으로는 대비가 나오지 않는다 — 기준 밑면(중간 회색 영상 128)
// 위에 유리를 합성한 바탕에서 글자 · 글리프의 계산 색을 잰다.
import type { CSSProperties, JSX } from "react";
import { afterEach, beforeEach, expect, test } from "vitest";
import { page, userEvent } from "vitest/browser";
import { render } from "vitest-browser-react";
import "@klipse-design/css/layers.css";
import "@klipse-design/css/tokens.css";
import "@klipse-design/css/styles.css";
import "../../css/src/component/video-player.css";

const px = (value: string): number => Number.parseFloat(value);

function find(testId: string): HTMLElement {
  const node = document.querySelector(`[data-testid="${testId}"]`);
  if (node === null) throw new Error(`찾지 못했습니다: ${testId}`);
  return node as HTMLElement;
}

const rect = (testId: string): DOMRect => find(testId).getBoundingClientRect();
const style = (testId: string): CSSStyleDeclaration => getComputedStyle(find(testId));

beforeEach(async () => {
  await page.viewport(1280, 900);
});

afterEach(async () => {
  await userEvent.unhover(document.body);
  document.documentElement.removeAttribute("data-theme");
});

type Rgba = readonly [number, number, number, number];

/** 계산 색 문자열(`rgb()` · `rgba()` · `color(srgb …)`)을 0~255 채널 + 알파로 푼다. */
function parseColor(value: string): Rgba {
  const srgb = /^color\(srgb\s+([\d.e-]+)\s+([\d.e-]+)\s+([\d.e-]+)(?:\s*\/\s*([\d.e-]+))?\)$/.exec(value);
  if (srgb !== null) {
    return [Number(srgb[1]) * 255, Number(srgb[2]) * 255, Number(srgb[3]) * 255, srgb[4] === undefined ? 1 : Number(srgb[4])];
  }
  const rgb = /^rgba?\(([\d.]+),?\s*([\d.]+),?\s*([\d.]+)(?:\s*[,/]\s*([\d.]+))?\)$/.exec(value);
  if (rgb !== null) {
    return [Number(rgb[1]), Number(rgb[2]), Number(rgb[3]), rgb[4] === undefined ? 1 : Number(rgb[4])];
  }
  throw new Error(`색을 풀지 못했습니다: ${value}`);
}

const over = (top: Rgba, bottom: Rgba): Rgba => {
  const a = top[3];
  return [top[0] * a + bottom[0] * (1 - a), top[1] * a + bottom[1] * (1 - a), top[2] * a + bottom[2] * (1 - a), 1];
};

/** 요소 뒤에 실제로 깔린 바탕 — 조상의 배경색을 위에서부터 합성한다(불투명을 만나면 멈춘다). */
function backdrop(node: HTMLElement): Rgba {
  const layers: Rgba[] = [];
  for (let current: HTMLElement | null = node; current !== null; current = current.parentElement) {
    const layer = parseColor(getComputedStyle(current).backgroundColor);
    if (layer[3] > 0) layers.push(layer);
    if (layer[3] >= 1) break;
  }
  return layers.reduceRight<Rgba>((bottom, top) => over(top, bottom), [255, 255, 255, 1]);
}

function luminance([r, g, b]: Rgba): number {
  const channel = (c: number): number => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}

const ratio = (a: Rgba, b: Rgba): number => {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x) as [number, number];
  return (hi + 0.05) / (lo + 0.05);
};

/** 글자 잉크를 그 뒤 바탕에 합성해 WCAG 대비를 낸다. */
function contrastOf(node: HTMLElement): number {
  const ground = backdrop(node);
  return ratio(over(parseColor(getComputedStyle(node).color), ground), ground);
}

/** 시맨틱 토큰의 계산 색 — 같은 테마에서 탐침 요소로 읽는다. */
function tokenColor(name: string): string {
  const probe = document.createElement("span");
  probe.style.color = `var(--louis-color-${name})`;
  document.body.append(probe);
  const value = getComputedStyle(probe).color;
  probe.remove();
  return value;
}

const vars = (entries: Record<string, number | string>): CSSProperties =>
  Object.fromEntries(Object.entries(entries).map(([key, value]) => [`--louis-video-player-${key}`, String(value)])) as CSSProperties;

/** 기준 밑면 — 중간 회색 영상(128). 영상 위 크롬의 밑면은 런타임이라 이것으로 잰다. */
const MID_GRAY = "rgb(128 128 128)";

function Player({
  width = 640,
  height = 360,
  tone,
  chrome,
  surface,
  volumeOpen = false,
  volumeLength,
  skip = true,
  ground = MID_GRAY,
}: {
  readonly width?: number;
  readonly height?: number;
  readonly tone?: "dark" | "bright";
  readonly chrome?: "hidden";
  readonly surface?: "stage";
  readonly volumeOpen?: boolean;
  readonly volumeLength?: number;
  readonly skip?: boolean;
  readonly ground?: string;
}): JSX.Element {
  return (
    <div style={{ inlineSize: width, blockSize: height, background: ground, borderRadius: 12 }} data-testid="frame">
      <div
        className="louis-video-player"
        data-tone={tone}
        data-chrome={chrome}
        data-surface={surface}
        data-testid="player"
        style={vars({ progress: 40, volume: 75, ...(volumeLength === undefined ? {} : { "volume-length": `${volumeLength}px` }) })}
      >
        <video className="louis-video-player__media" data-testid="media" muted />
        <div className="louis-video-player__center" data-testid="center">
          {skip ? (
            <button type="button" className="louis-video-player__skip" aria-label="10초 뒤로" data-testid="skip-back">
              <svg width="22" height="22" aria-hidden="true" />
            </button>
          ) : null}
          <button type="button" className="louis-video-player__play" aria-label="재생" data-testid="play">
            <svg width="34" height="34" aria-hidden="true" />
          </button>
          {skip ? (
            <button type="button" className="louis-video-player__skip" aria-label="10초 앞으로" data-testid="skip-forward">
              <svg width="22" height="22" aria-hidden="true" />
            </button>
          ) : null}
        </div>
        <div className="louis-video-player__bottom" data-testid="bottom">
          <div className="louis-video-player__bar" data-testid="bar">
            <span className="louis-video-player__time" data-testid="time">
              0:07
            </span>
            <div
              className="louis-video-player__scrubber"
              role="slider"
              tabIndex={0}
              aria-label="재생 위치"
              aria-valuemin={0}
              aria-valuemax={58}
              aria-valuenow={23}
              aria-valuetext="0:23 / 0:58"
              data-testid="scrubber"
            >
              <div className="louis-video-player__scrubber-track" data-testid="track">
                <div className="louis-video-player__scrubber-fill" data-testid="fill" />
              </div>
              <div className="louis-video-player__scrubber-thumb" data-testid="thumb" />
            </div>
            <span className="louis-video-player__time">−0:35</span>
          </div>
          <div className="louis-video-player__volume" data-open={volumeOpen ? "true" : "false"} data-testid="volume">
            <button type="button" className="louis-video-player__chip" aria-label="음소거" data-testid="volume-chip">
              <svg width="16" height="16" aria-hidden="true" />
            </button>
            <div className="louis-video-player__volume-panel" data-testid="volume-panel">
              <div className="louis-video-player__volume-surface" data-testid="volume-surface">
                <div
                  className="louis-video-player__volume-slider"
                  role="slider"
                  tabIndex={0}
                  aria-label="볼륨"
                  aria-orientation="vertical"
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-valuenow={75}
                  aria-valuetext="75%"
                  data-testid="volume-slider"
                >
                  <div className="louis-video-player__volume-track" data-testid="volume-track">
                    <div className="louis-video-player__volume-fill" data-testid="volume-fill" />
                  </div>
                  <div className="louis-video-player__volume-thumb" data-testid="volume-thumb" />
                </div>
              </div>
            </div>
          </div>
          <button type="button" className="louis-video-player__chip" aria-label="크게 보기" data-testid="expand-chip">
            <svg width="16" height="16" aria-hidden="true" />
          </button>
        </div>
        <button type="button" className="louis-video-player__chip louis-video-player__download" aria-label="다운로드" data-testid="download">
          <svg width="16" height="16" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}

test("가운데 — 재생 58 원 · 스킵 48 원, 사이는 폭의 12%(28~52)", async () => {
  await render(<Player />);
  const play = rect("play");
  expect(play.width).toBe(58);
  expect(play.height).toBe(58);
  expect(px(style("play").borderTopLeftRadius)).toBeGreaterThanOrEqual(29);
  const back = rect("skip-back");
  expect(back.width).toBe(48);
  expect(back.height).toBe(48);
  // 640 × 12% = 76.8 → 52 로 묶인다.
  expect(play.left - back.right).toBeCloseTo(52, 1);
  // 가운데 정렬 — 재생 원의 가운데가 플레이어 가운데다.
  const player = rect("player");
  expect(play.left + play.width / 2).toBeCloseTo(player.left + player.width / 2, 1);
  expect(play.top + play.height / 2).toBeCloseTo(player.top + player.height / 2, 1);
});

test("가운데 사이는 좁으면 28, 중간은 12% 그대로다", async () => {
  const screen = await render(<Player width={200} height={200} />);
  expect(rect("play").left - rect("skip-back").right).toBeCloseTo(28, 1);
  await screen.rerender(<Player width={300} height={200} />);
  expect(rect("play").left - rect("skip-back").right).toBeCloseTo(36, 1);
});

test("하단 줄 — 위 6 · 좌우 8 · 아래 8 · 사이 8, 알약 32 · 좌우 12 · 사이 10 · 반경 12, 칩 32 · 반경 12", async () => {
  await render(<Player />);
  const player = rect("player");
  const bottom = style("bottom");
  expect(px(bottom.paddingTop)).toBe(6);
  expect(px(bottom.paddingLeft)).toBe(8);
  expect(px(bottom.paddingRight)).toBe(8);
  expect(px(bottom.paddingBottom)).toBe(8);
  expect(rect("bottom").bottom).toBe(player.bottom);

  const bar = rect("bar");
  expect(bar.height).toBe(32);
  expect(bar.left - player.left).toBe(8);
  expect(px(style("bar").paddingLeft)).toBe(12);
  expect(px(style("bar").columnGap)).toBe(10);
  expect(px(style("bar").borderTopLeftRadius)).toBe(12);
  expect(player.bottom - bar.bottom).toBe(8);

  const volume = rect("volume-chip");
  const expand = rect("expand-chip");
  for (const chip of [volume, expand]) {
    expect(chip.width).toBe(32);
    expect(chip.height).toBe(32);
  }
  expect(px(style("expand-chip").borderTopLeftRadius)).toBe(12);
  expect(volume.left - bar.right).toBe(8);
  expect(expand.left - volume.right).toBe(8);
  expect(player.right - expand.right).toBe(8);
});

test("알약이 먼저 줄고 칩은 줄지 않는다", async () => {
  await render(<Player width={240} height={200} skip={false} />);
  expect(rect("volume-chip").width).toBe(32);
  expect(rect("expand-chip").width).toBe(32);
  expect(rect("bar").width).toBe(240 - 8 * 2 - 32 * 2 - 8 * 2);
  expect(rect("expand-chip").right).toBeLessThanOrEqual(rect("player").right - 8);
});

test("다운로드는 오른쪽 위 10 의 칩이고 가운데 크롬 위에 칠한다", async () => {
  await render(<Player />);
  const player = rect("player");
  const download = rect("download");
  expect(download.top - player.top).toBe(10);
  expect(player.right - download.right).toBe(10);
  expect(download.width).toBe(32);
  expect(style("download").backgroundColor).toBe(style("expand-chip").backgroundColor);
  const hit = document.elementFromPoint(download.left + 16, download.top + 16);
  expect(hit?.closest("[data-testid]")?.getAttribute("data-testid")).toBe("download");
});

test("진행 막대 — 히트 20 · 트랙 3 · 채움은 위치 변수, 썸은 숨어 있다가 호버에서 펼친다(3 → 5, 썸 12)", async () => {
  await render(<Player />);
  expect(rect("scrubber").height).toBe(20);
  expect(rect("track").height).toBe(3);
  expect(rect("fill").width).toBeCloseTo(rect("track").width * 0.4, 1);
  expect(style("thumb").transform).toMatch(/^matrix\(0, 0, 0, 0, /);
  expect(rect("thumb").width).toBe(0);

  await userEvent.hover(find("scrubber"));
  await expect.poll(() => rect("track").height, { timeout: 2000 }).toBe(5);
  await expect.poll(() => rect("thumb").width, { timeout: 2000 }).toBe(12);
  const thumb = rect("thumb");
  const track = rect("track");
  expect(thumb.left + thumb.width / 2).toBeCloseTo(track.left + track.width * 0.4, 1);
  expect(thumb.top + thumb.height / 2).toBeCloseTo(track.top + track.height / 2, 1);
});

test("트랙 · 채움 · 썸 · 시간이 알약의 잉크(currentColor)를 따른다 — 레일은 그 28%", async () => {
  await render(<Player />);
  const ink = tokenColor("media-control-foreground");
  expect(style("bar").color).toBe(ink);
  expect(style("fill").backgroundColor).toBe(ink);
  expect(style("thumb").backgroundColor).toBe(ink);
  const rail = parseColor(style("track").backgroundColor);
  expect(rail[3]).toBeCloseTo(parseColor(ink)[3] * 0.28, 2);
});

test("유리 한 면 — 다섯 표면이 media-control-surface · 헤어라인 · 흐림 2 를 나눠 쓴다", async () => {
  await render(<Player volumeOpen />);
  const glass = tokenColor("media-control-surface");
  for (const id of ["play", "skip-back", "bar", "volume-chip", "expand-chip", "volume-surface"]) {
    expect(style(id).backgroundColor, id).toBe(glass);
    expect(style(id).backdropFilter, id).toBe("blur(2px)");
    expect(style(id).boxShadow, id).toContain("inset");
  }
});

test("hover 는 틴트를 진하게 한다 — media-control-surface-hover(40%), 알약은 그대로", async () => {
  await render(<Player />);
  const rest = style("bar").backgroundColor;
  for (const id of ["play", "skip-back", "expand-chip"]) {
    await userEvent.hover(find(id));
    await expect.poll(() => style(id).backgroundColor, { timeout: 2000 }).toBe(tokenColor("media-control-surface-hover"));
  }
  await userEvent.hover(find("bar"));
  expect(style("bar").backgroundColor).toBe(rest);
  expect(parseColor(tokenColor("media-control-surface-hover"))[3]).toBeGreaterThan(parseColor(rest)[3]);
});

test("크롬 숨김 — 가운데 · 하단 줄 opacity 0 · 포인터 없음, 유리 흐림 0. 다운로드는 남는다", async () => {
  await render(<Player chrome="hidden" />);
  for (const id of ["center", "bottom"]) {
    await expect.poll(() => style(id).opacity, { timeout: 2000 }).toBe("0");
    expect(style(id).pointerEvents).toBe("none");
  }
  expect(style("play").backdropFilter).toBe("blur(0px)");
  expect(style("bar").backdropFilter).toBe("blur(0px)");
  expect(style("download").opacity).toBe("1");
});

test("톤 bright 는 잉크만 바꾼다 — 유리는 그대로", async () => {
  await render(<Player tone="bright" />);
  expect(style("player").color).toBe(tokenColor("media-control-foreground-bright"));
  expect(style("bar").color).toBe(tokenColor("media-control-foreground-bright"));
  expect(style("bar").backgroundColor).toBe(tokenColor("media-control-surface"));
  expect(style("fill").backgroundColor).toBe(tokenColor("media-control-foreground-bright"));
});

test("무대 판 — 검은 판 위 contain, 기본은 cover", async () => {
  const screen = await render(<Player />);
  expect(style("media").objectFit).toBe("cover");
  expect(parseColor(style("player").backgroundColor)[3]).toBe(0);
  await screen.rerender(<Player surface="stage" />);
  expect(style("media").objectFit).toBe("contain");
  expect(style("player").backgroundColor).toBe(tokenColor("media-stage-surface"));
});

test("볼륨 — 닫힘은 높이 0 · 포인터 없음, 열림은 길이 변수만큼 칩 위로(틈 8), 트랙 3 · 썸 12 · 아래에서 위로", async () => {
  const screen = await render(<Player />);
  expect(rect("volume-surface").height).toBe(0);
  expect(style("volume-panel").pointerEvents).toBe("none");
  const barBefore = rect("bar");

  await screen.rerender(<Player volumeOpen />);
  await expect.poll(() => rect("volume-surface").height, { timeout: 2000 }).toBe(112);
  expect(style("volume-panel").pointerEvents).toBe("auto");
  const chip = rect("volume-chip");
  const surface = rect("volume-surface");
  expect(surface.width).toBe(32);
  expect(surface.left).toBe(chip.left);
  expect(chip.top - surface.bottom).toBe(8);
  expect(rect("volume-panel").bottom).toBe(chip.top);
  expect(px(style("volume-surface").borderTopLeftRadius)).toBe(12);
  // 흐름 밖 — 알약이 움직이지 않는다.
  expect(rect("bar")).toEqual(barBefore);

  const slider = rect("volume-slider");
  expect(slider.top - surface.top).toBe(8);
  expect(surface.bottom - slider.bottom).toBe(8);
  const track = rect("volume-track");
  expect(track.width).toBe(3);
  expect(track.height).toBe(112 - 16);
  const fill = rect("volume-fill");
  expect(fill.bottom).toBe(track.bottom);
  expect(fill.height).toBeCloseTo(track.height * 0.75, 1);
  const thumb = rect("volume-thumb");
  expect(thumb.width).toBe(12);
  expect(thumb.top + thumb.height / 2).toBeCloseTo(track.bottom - track.height * 0.75, 1);
  expect(thumb.left + thumb.width / 2).toBeCloseTo(track.left + track.width / 2, 1);

  await screen.rerender(<Player volumeOpen volumeLength={64} />);
  await expect.poll(() => rect("volume-surface").height, { timeout: 2000 }).toBe(64);
});

test("홀로 선 칩 — 플레이어 밖에서도 유리 · 잉크 · 흐림을 스스로 든다", async () => {
  await render(
    <div style={{ padding: 16, background: MID_GRAY }}>
      <button type="button" className="louis-video-player__chip" data-standalone="true" aria-label="크게 보기" data-testid="standalone">
        <svg width="16" height="16" aria-hidden="true" />
      </button>
    </div>,
  );
  expect(rect("standalone").width).toBe(32);
  expect(style("standalone").backgroundColor).toBe(tokenColor("media-control-surface"));
  expect(style("standalone").color).toBe(tokenColor("media-control-foreground"));
  expect(style("standalone").backdropFilter).toBe("blur(2px)");
  await userEvent.hover(find("standalone"));
  await expect.poll(() => style("standalone").backgroundColor, { timeout: 2000 }).toBe(tokenColor("media-control-surface-hover"));
});

test("대비 — 중간 회색 영상 위 시간 글자 · 칩 글리프가 쉼 · hover 모두 4.5 이상, 흰 12% 로 갈아 끼우면 미달", async () => {
  await render(<Player />);
  const time = contrastOf(find("time"));
  expect(time).toBeGreaterThanOrEqual(4.5);

  await userEvent.hover(find("expand-chip"));
  await expect.poll(() => style("expand-chip").backgroundColor, { timeout: 2000 }).toBe(tokenColor("media-control-surface-hover"));
  const hover = contrastOf(find("expand-chip"));
  expect(hover).toBeGreaterThan(time);

  // 거부한 대안 — 카드 · 배너의 `media-control-hover`(흰 12%)로 면을 갈아 끼우면.
  const replaced = over(parseColor(tokenColor("media-control-hover")), [128, 128, 128, 1]);
  const ink = over(parseColor(tokenColor("media-control-foreground")), replaced);
  expect(ratio(ink, replaced)).toBeLessThan(4.5);
  console.info(`[video-player] 대비 — 쉼 ${time.toFixed(2)} · hover ${hover.toFixed(2)} · 흰 12% 대안 ${ratio(ink, replaced).toFixed(2)}`);
});

test("대비 — bright 톤은 밝은 영상(200) 위에서 쉼 · hover 모두 4.5 이상", async () => {
  await render(<Player tone="bright" ground="rgb(200 200 200)" />);
  const time = contrastOf(find("time"));
  expect(time).toBeGreaterThanOrEqual(4.5);
  await userEvent.hover(find("expand-chip"));
  await expect.poll(() => style("expand-chip").backgroundColor, { timeout: 2000 }).toBe(tokenColor("media-control-surface-hover"));
  const hover = contrastOf(find("expand-chip"));
  expect(hover).toBeGreaterThanOrEqual(4.5);
  console.info(`[video-player] bright 대비 — 쉼 ${time.toFixed(2)} · hover ${hover.toFixed(2)}`);
});

/** YouTube 미리보기 — 업로드 모달 시청 화면의 재현. */
function YoutubePreview({ fullscreen = false, open = false }: { readonly fullscreen?: boolean; readonly open?: boolean }): JSX.Element {
  return (
    <div style={{ inlineSize: 800 }}>
      <div
        className="louis-video-player"
        data-platform="youtube"
        data-fullscreen={fullscreen ? "true" : undefined}
        data-testid="yt"
        style={vars({ progress: 30, buffer: 60, volume: 50 })}
      >
        <video className="louis-video-player__media" data-testid="yt-media" muted style={{ aspectRatio: "16 / 9" }} />
        <div className="louis-video-player__bottom" data-testid="yt-bottom">
          <div
            className="louis-video-player__scrubber"
            role="slider"
            tabIndex={0}
            aria-label="재생 위치"
            aria-valuemin={0}
            aria-valuemax={58}
            aria-valuenow={17}
            aria-valuetext="0:17 / 0:58"
            data-testid="yt-scrubber"
          >
            <div className="louis-video-player__scrubber-track" data-testid="yt-track">
              <div className="louis-video-player__scrubber-buffer" data-testid="yt-buffer" />
              <div className="louis-video-player__scrubber-fill" data-testid="yt-fill" />
            </div>
            <div className="louis-video-player__scrubber-thumb" data-testid="yt-thumb" />
          </div>
          <div className="louis-video-player__controls" data-testid="yt-controls">
            <div className="louis-video-player__controls-start">
              <button type="button" className="louis-video-player__button" data-role="play" aria-label="재생" data-testid="yt-play">
                <svg viewBox="0 0 36 36" aria-hidden="true" />
              </button>
              <div className="louis-video-player__cluster" data-open={open ? "true" : undefined} data-testid="yt-volume">
                <button type="button" className="louis-video-player__button" aria-label="음소거" data-testid="yt-mute">
                  <svg viewBox="0 0 36 36" aria-hidden="true" />
                </button>
                <div className="louis-video-player__level" data-testid="yt-level">
                  <div className="louis-video-player__level-slider" role="slider" tabIndex={0} aria-label="볼륨" aria-valuemin={0} aria-valuemax={100} aria-valuenow={50}>
                    <div className="louis-video-player__level-fill" />
                    <div className="louis-video-player__level-thumb" />
                  </div>
                </div>
              </div>
              <div className="louis-video-player__cluster">
                <span className="louis-video-player__clock" data-testid="yt-clock">
                  0:17
                  <span className="louis-video-player__clock-separator" data-testid="yt-sep">
                    {" / "}
                  </span>
                  <span className="louis-video-player__clock-total">0:58</span>
                </span>
              </div>
            </div>
            <div className="louis-video-player__cluster" data-align="end" data-testid="yt-end">
              <span className="louis-video-player__deco" aria-hidden="true" data-testid="yt-deco">
                <svg viewBox="0 0 36 36" />
                <span className="louis-video-player__badge" data-testid="yt-badge">
                  HD
                </span>
              </span>
              <button type="button" className="louis-video-player__button" aria-label="전체화면" data-testid="yt-fullscreen">
                <svg viewBox="0 0 36 36" aria-hidden="true" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

test("YouTube 판 — 무대 반경 12 · 최대 360, 아래 크롬 좌우 · 아래 12 · 줄 사이 6, 컨트롤 줄 40", async () => {
  const screen = await render(<YoutubePreview />);
  const yt = rect("yt");
  expect(yt.height).toBe(360);
  expect(px(style("yt").borderTopLeftRadius)).toBe(12);
  expect(style("yt").backgroundColor).toBe(tokenColor("media-stage-surface"));
  expect(style("yt-media").objectFit).toBe("contain");
  const bottom = rect("yt-bottom");
  expect(bottom.left - yt.left).toBe(12);
  expect(yt.right - bottom.right).toBe(12);
  expect(yt.bottom - bottom.bottom).toBe(12);
  expect(rect("yt-controls").top - rect("yt-scrubber").bottom).toBe(6);
  expect(rect("yt-controls").height).toBe(40);

  await screen.rerender(<YoutubePreview fullscreen />);
  expect(px(style("yt").borderTopLeftRadius)).toBe(0);
  expect(rect("yt").height).toBe(800 * (9 / 16));
});

test("YouTube 판 — 진행 히트 16 · 트랙 4 → 6, 레일 · 받은 분 · 재생분 · 점은 늘 보이고 호버에서 7/6 배", async () => {
  await render(<YoutubePreview />);
  expect(rect("yt-scrubber").height).toBe(16);
  expect(rect("yt-track").height).toBe(4);
  expect(style("yt-track").backgroundColor).toBe(tokenColor("platform-youtube-rail"));
  expect(style("yt-fill").backgroundColor).toBe(tokenColor("platform-youtube-accent"));
  expect(style("yt-thumb").backgroundColor).toBe(tokenColor("platform-youtube-accent"));
  expect(rect("yt-thumb").width).toBe(12);
  const track = rect("yt-track");
  expect(rect("yt-buffer").width).toBeCloseTo(track.width * 0.6, 1);
  expect(rect("yt-fill").width).toBeCloseTo(track.width * 0.3, 1);
  // 받은 분은 흰 잉크의 40%.
  expect(parseColor(style("yt-buffer").backgroundColor)[3]).toBeCloseTo(0.4, 2);

  await userEvent.hover(find("yt-scrubber"));
  await expect.poll(() => rect("yt-track").height, { timeout: 2000 }).toBe(6);
  await expect.poll(() => rect("yt-thumb").width, { timeout: 2000 }).toBeCloseTo(14, 0);
});

test("YouTube 판 — 버튼 40 · 글리프 30 · 알약은 끝이 둥근 유리, 장식은 버튼이 아니다", async () => {
  await render(<YoutubePreview />);
  expect(rect("yt-play").width).toBe(40);
  expect(rect("yt-play").height).toBe(40);
  const glyph = find("yt-play").querySelector("svg")!.getBoundingClientRect();
  expect(glyph.width).toBe(30);
  expect(style("yt-play").backgroundColor).toBe("rgba(0, 0, 0, 0)");
  expect(style("yt-play").backdropFilter).toBe("blur(12px)");
  expect(style("yt-play").opacity).toBe("0.92");
  expect(style("yt-volume").backgroundColor).toBe(tokenColor("media-control-surface"));
  expect(px(style("yt-volume").borderTopLeftRadius)).toBeGreaterThanOrEqual(20);
  expect(px(style("yt-end").paddingLeft)).toBe(6);
  expect(px(style("yt-clock").paddingLeft)).toBe(14);
  expect(style("yt-deco").pointerEvents).toBe("none");
  expect(find("yt-deco").getAttribute("aria-hidden")).toBe("true");
  expect(find("yt-deco").tabIndex).toBe(-1);
  expect(style("yt-badge").backgroundColor).toBe(tokenColor("platform-youtube-accent"));
  expect(style("yt-clock").color).toBe(tokenColor("media-foreground-dark"));
  expect(parseColor(style("yt-sep").color)[3]).toBeCloseTo(0.8, 2);

  await userEvent.hover(find("yt-play"));
  await expect.poll(() => style("yt-play").opacity, { timeout: 2000 }).toBe("1");
});

test("YouTube 판 — 가로 볼륨은 0 ↔ 62(슬라이더 48 + 6 + 8)", async () => {
  const screen = await render(<YoutubePreview />);
  expect(rect("yt-level").width).toBe(0);
  await screen.rerender(<YoutubePreview open />);
  await expect.poll(() => rect("yt-level").width, { timeout: 2000 }).toBe(62);
});

test("YouTube 판 — 719 이하에서 최대 300", async () => {
  await page.viewport(600, 900);
  await render(<YoutubePreview />);
  expect(rect("yt").height).toBe(300);
});

test("YouTube 판 대비 — 중간 회색 영상 위 시간 글자 4.5 이상", async () => {
  await render(
    <div style={{ background: MID_GRAY }}>
      <YoutubePreview />
    </div>,
  );
  // 시간 알약의 바탕 = 유리 28% over 영상. 무대 판(검정)을 지나지 않게 회색 위 유리로 직접 합성한다.
  const glass = parseColor(style("yt-volume").backgroundColor);
  const ground = over(glass, [128, 128, 128, 1]);
  const ink = over(parseColor(style("yt-clock").color), ground);
  expect(ratio(ink, ground)).toBeGreaterThanOrEqual(4.5);
  const separator = over(parseColor(style("yt-sep").color), ground);
  console.info(`[video-player] YouTube 대비 — 시간 ${ratio(ink, ground).toFixed(2)} · 구분 ${ratio(separator, ground).toFixed(2)}`);
});
