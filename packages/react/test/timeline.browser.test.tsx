// Timeline(`.louis-timeline`)과 짝 블록 Timeline Ruler(`.louis-timeline-ruler`)의 레시피가 실제로 원점 식 · 레인 · 클립 · 트림 손잡이 ·
// 「+」 · 재생헤드 · 눈금 두 판 · 대비를 만드는지 잰다(DS-D-0089).
//
// **React 표면이 아니라 클래스 마크업을 렌더한다.** 정본은 packages/css/src/component/timeline.css 이고 마크업은
// design/components/timeline.md 의 예시 그대로다. 기하 변수(extent · x · w)는 소비처 몫이라 시험이 값을 준다.
// 대비는 토큰 값으로 손 계산하지 않고 계산 색을 파인 면(`bg-inset`) 위에서 잰다(fixtures/contrast).
import type { CSSProperties, JSX } from "react";
import { afterEach, beforeEach, expect, test } from "vitest";
import { page } from "vitest/browser";
import { render } from "vitest-browser-react";
import "@klipse-design/css/layers.css";
import "@klipse-design/css/tokens.css";
import "@klipse-design/css/styles.css";
import { backdrop, contrastOn, find, parseColor, px, textContrast, tokenColor } from "./fixtures/contrast";

beforeEach(async () => {
  await page.viewport(1440, 900);
});

afterEach(() => {
  document.documentElement.removeAttribute("data-theme");
});

const PIXEL = "data:image/gif;base64,R0lGODlhAQABAAAAACw=";
const vars = (entries: Record<string, string>): CSSProperties => entries as CSSProperties;

/** 문서 예시의 타임라인 — 폭 375 · 높이 220 셸, 전체 길이 960. */
function Timeline(): JSX.Element {
  return (
    <div className="louis-timeline" style={{ ...vars({ "--louis-timeline-extent": "960px" }), inlineSize: 375, blockSize: 220 }} data-testid="shell">
      <div className="louis-timeline__viewport" role="region" aria-label="타임라인" data-testid="viewport">
        <div className="louis-timeline__spacer" aria-hidden="true" data-testid="spacer" />
        <div className="louis-timeline__flow" data-testid="flow">
          <div className="louis-timeline-ruler" data-layout="compact" aria-hidden="true" data-testid="compact">
            <span className="louis-timeline-ruler__tick" style={vars({ "--louis-timeline-x": "0px" })} />
            <span className="louis-timeline-ruler__label" style={vars({ "--louis-timeline-x": "0px" })}>
              0:00
            </span>
            <span className="louis-timeline-ruler__tick" style={vars({ "--louis-timeline-x": "160px" })} data-testid="compact-tick" />
            <span className="louis-timeline-ruler__label" style={vars({ "--louis-timeline-x": "160px" })} data-testid="compact-label">
              0:05
            </span>
          </div>
          <div className="louis-timeline__lane" data-testid="lane-caption">
            <button type="button" className="louis-timeline__clip" data-tone="caption" aria-pressed="false" aria-label="자막 클립, 오프닝 인사" style={vars({ "--louis-timeline-x": "32px", "--louis-timeline-w": "96px" })} data-testid="clip-caption">
              <span className="louis-timeline__label" data-testid="label-caption">
                오프닝 인사
              </span>
            </button>
          </div>
          <div className="louis-timeline__lane" data-testid="lane-image">
            <button type="button" className="louis-timeline__clip" data-tone="image" aria-pressed="false" aria-label="이미지 클립" style={vars({ "--louis-timeline-x": "128px", "--louis-timeline-w": "64px" })} data-testid="clip-image">
              <span className="louis-timeline__label" data-testid="label-image">
                IMG
              </span>
            </button>
          </div>
          <div className="louis-timeline__lane" data-tone="audio" data-testid="lane-audio">
            <button type="button" className="louis-timeline__clip" data-tone="audio" aria-pressed="false" aria-label="배경음 클립" style={vars({ "--louis-timeline-x": "0px", "--louis-timeline-w": "640px" })} data-testid="clip-audio">
              <canvas className="louis-timeline__wave" aria-hidden="true" />
              <span className="louis-timeline__label" data-testid="label-audio">
                BGM
              </span>
            </button>
          </div>
          <div className="louis-timeline__lane" data-testid="lane-video">
            <button type="button" className="louis-timeline__clip" data-tone="video" aria-pressed="true" aria-label="영상 클립, 3.2초, 선택됨" style={vars({ "--louis-timeline-x": "0px", "--louis-timeline-w": "102px" })} data-testid="clip-video">
              <span className="louis-timeline__strip" aria-hidden="true" data-testid="strip">
                <span className="louis-timeline__strip-tiles" data-testid="tiles">
                  <img className="louis-timeline__strip-tile" src={PIXEL} alt="" />
                </span>
              </span>
              <span className="louis-badge louis-timeline__duration" data-surface="media" data-testid="duration">
                3.2s
              </span>
              <span className="louis-timeline__trim" data-edge="start" aria-hidden="true" data-testid="trim-start" />
              <span className="louis-timeline__trim" data-edge="end" aria-hidden="true" data-testid="trim-end" />
            </button>
            <button type="button" className="louis-timeline__add" aria-label="소재 더하기" style={vars({ "--louis-timeline-x": "102px" })} data-testid="add">
              <svg className="louis-timeline__add-glyph" viewBox="0 0 20 20" aria-hidden="true" data-testid="glyph">
                <path d="M10 4v12M4 10h12" stroke="currentColor" strokeWidth="2" />
              </svg>
            </button>
          </div>
        </div>
      </div>
      <div className="louis-timeline__playhead" aria-hidden="true" data-testid="playhead" />
    </div>
  );
}

/** 문서 예시의 데스크톱 시퀀스 눈금자 — 폭 400, 파인 면 위. */
function Ruler(): JSX.Element {
  return (
    <div style={{ background: "var(--louis-color-bg-inset)", inlineSize: 400 }} data-testid="ground">
      <div className="louis-timeline-ruler" aria-hidden="true" data-testid="ruler">
        <span className="louis-timeline-ruler__tick" style={vars({ "--louis-timeline-x": "0%" })} data-testid="major" />
        <span className="louis-timeline-ruler__label" data-align="start" style={vars({ "--louis-timeline-x": "0%" })} data-testid="label-start">
          0:00
        </span>
        <span className="louis-timeline-ruler__tick" data-level="minor" style={vars({ "--louis-timeline-x": "10%" })} data-testid="minor" />
        <span className="louis-timeline-ruler__tick" data-level="mid" style={vars({ "--louis-timeline-x": "50%" })} data-testid="mid" />
        <span className="louis-timeline-ruler__label" style={vars({ "--louis-timeline-x": "50%" })} data-testid="label-mid">
          0:05
        </span>
        <span className="louis-timeline-ruler__tick" style={vars({ "--louis-timeline-x": "100%" })} />
        <span className="louis-timeline-ruler__label" data-align="end" style={vars({ "--louis-timeline-x": "100%" })} data-testid="label-end">
          0:10
        </span>
      </div>
    </div>
  );
}

const rect = (id: string): DOMRect => find(id).getBoundingClientRect();
const style = (id: string, pseudo?: string): CSSStyleDeclaration => getComputedStyle(find(id), pseudo);

/** CSS 식 하나를 같은 문서에서 칠해 계산 색을 읽는다(`color-mix` 결과 비교용). */
function paint(expression: string): string {
  const probe = document.createElement("span");
  probe.style.backgroundColor = expression;
  document.body.append(probe);
  const value = getComputedStyle(probe).backgroundColor;
  probe.remove();
  return value;
}

test("원점 — 흐르는 층은 창 폭의 절반, 자리지기는 창 폭 + extent, 창을 x(t) 만큼 굴리면 그 시각이 재생헤드 아래 온다", async () => {
  await render(<Timeline />);
  expect(style("shell").backgroundColor).toBe(tokenColor("color-bg-inset", "backgroundColor"));
  expect(style("shell").isolation).toBe("isolate");
  const viewport = find("viewport");
  expect(px(style("flow").left)).toBeCloseTo(viewport.clientWidth / 2, 1);
  expect(rect("spacer").width).toBeCloseTo(viewport.clientWidth + 960, 1);
  expect(px(style("flow").rowGap), "줄 사이 4").toBe(4);
  expect(px(style("flow").paddingTop), "위 8").toBe(8);
  expect(px(style("flow").paddingBottom), "아래 8").toBe(8);
  viewport.scrollLeft = 160;
  await new Promise((resolve) => requestAnimationFrame(() => resolve(undefined)));
  const playhead = rect("playhead");
  expect(playhead.width, "재생헤드 2").toBe(2);
  expect(playhead.left + playhead.width / 2).toBeCloseTo(rect("shell").left + rect("shell").width / 2, 1);
  expect(rect("compact-tick").left, "0:05 눈금이 재생헤드 가운데").toBeCloseTo(playhead.left + playhead.width / 2, 1);
  expect(viewport.scrollWidth - viewport.clientWidth, "끌 수 있는 범위 = 전체 길이").toBeCloseTo(960, 0);
});

test("레인 44 · 오디오 36, 클립 자리 · 길이 · 좌우 8 · 반경 8", async () => {
  await render(<Timeline />);
  expect(rect("lane-caption").height).toBe(44);
  expect(rect("lane-audio").height).toBe(36);
  expect(rect("clip-audio").height).toBe(36);
  const lane = rect("lane-caption");
  const clip = rect("clip-caption");
  expect(clip.left - lane.left).toBeCloseTo(32, 1);
  expect(clip.width).toBeCloseTo(96, 1);
  expect(clip.height).toBe(44);
  expect(px(style("clip-caption").paddingLeft)).toBe(8);
  expect(px(style("clip-caption").paddingRight)).toBe(8);
  expect(px(style("clip-caption").borderTopLeftRadius)).toBe(8);
  expect(style("clip-caption").touchAction).toBe("pan-x");
});

test("종류 넷의 면 — 영상은 accent-secondary, 자막 · 이미지 · 오디오는 timeline-clip-* 48%", async () => {
  await render(<Timeline />);
  expect(style("clip-video").backgroundColor).toBe(tokenColor("color-accent-secondary", "backgroundColor"));
  for (const tone of ["caption", "image", "audio"] as const) {
    expect(style(`clip-${tone}`).backgroundColor, tone).toBe(paint(`color-mix(in srgb, var(--louis-color-timeline-clip-${tone}) 48%, transparent)`));
    expect(parseColor(style(`clip-${tone}`).backgroundColor)[3], `${tone} 알파`).toBeCloseTo(0.48, 2);
  }
});

test("고른 클립 — 바깥 고리 2 timeline-accent, 스크롤에 내주지 않는다, 트림 괄호 8 이 클립 바깥 · 그립 2 × 12 가운데", async () => {
  await render(<Timeline />);
  const selected = style("clip-video");
  expect(selected.boxShadow).toContain("0px 0px 0px 2px");
  expect(selected.boxShadow).toContain(tokenColor("color-timeline-accent"));
  expect(selected.touchAction).toBe("none");
  const clip = rect("clip-video");
  const start = rect("trim-start");
  const end = rect("trim-end");
  expect(start.width, "손잡이 24").toBe(24);
  expect(start.height).toBe(44);
  expect(clip.left - start.left, "시작 손잡이가 바깥 8").toBeCloseTo(8, 1);
  expect(end.right - clip.right, "끝 손잡이가 바깥 8").toBeCloseTo(8, 1);
  const bracket = style("trim-start", "::before");
  expect(px(bracket.width), "괄호 8").toBe(8);
  expect(px(bracket.left)).toBe(0);
  expect(bracket.backgroundColor).toBe(tokenColor("color-timeline-accent", "backgroundColor"));
  expect(px(style("trim-end", "::before").right)).toBe(0);
  const grip = style("trim-start", "::after");
  expect(px(grip.width)).toBe(2);
  expect(px(grip.height)).toBe(12);
  expect(px(grip.left), "(8 − 2) / 2").toBe(3);
  expect(px(grip.marginTop)).toBe(-6);
  expect(px(style("trim-end", "::after").right)).toBe(3);
  expect(style("trim-start").touchAction).toBe("none");
});

test("「+」 44 · 틈 6 · 글리프 20, 재생헤드는 셸의 마지막 자식, 배지는 필름 위", async () => {
  await render(<Timeline />);
  const lane = rect("lane-video");
  const add = rect("add");
  expect(add.width).toBe(44);
  expect(add.height).toBe(44);
  expect(add.left - lane.left, "x 102 + 틈 6").toBeCloseTo(108, 1);
  expect(px(style("add").borderTopLeftRadius)).toBe(8);
  expect(rect("glyph").width).toBe(20);
  expect(find("shell").lastElementChild).toBe(find("playhead"));
  expect(style("duration").position, "배지가 절대 배치된 필름 위로").toBe("relative");
  expect(style("strip").position).toBe("absolute");
  expect(rect("tiles").width, "타일 줄이 자식 없이도 클립을 채운다").toBeCloseTo(rect("clip-video").width, 1);
  expect(px(style("tiles").columnGap)).toBe(1);
});

test("Timeline Ruler 기본 — 40, 눈금 12 · 8 · 6 이 바닥에 붙고, 양끝 글자는 칸 안에 닻을 옮긴다", async () => {
  await render(<Ruler />);
  const ruler = rect("ruler");
  expect(ruler.height).toBe(40);
  expect(ruler.width).toBe(400);
  expect(rect("major").height).toBe(12);
  expect(rect("mid").height).toBe(8);
  expect(rect("minor").height).toBe(6);
  for (const id of ["major", "mid", "minor"]) expect(rect(id).bottom, id).toBeCloseTo(ruler.bottom, 1);
  expect(rect("major").width).toBe(1);
  expect(rect("mid").left + rect("mid").width / 2, "가운데 닻").toBeCloseTo(ruler.left + 200, 1);
  expect(rect("label-start").left).toBeCloseTo(ruler.left, 1);
  expect(rect("label-end").right).toBeCloseTo(ruler.right, 1);
  const mid = rect("label-mid");
  expect(mid.left + mid.width / 2).toBeCloseTo(ruler.left + 200, 1);
  expect(mid.top - ruler.top, "글자 위 6").toBeCloseTo(6, 1);
});

test("Timeline Ruler compact — 20, 선은 높이 전체, 글자는 선 오른쪽 4 · 위 2", async () => {
  await render(<Timeline />);
  const compact = rect("compact");
  expect(compact.height).toBe(20);
  expect(compact.width, "타임라인 루트의 extent").toBe(960);
  const tick = rect("compact-tick");
  expect(tick.height).toBe(20);
  expect(tick.width).toBe(1);
  const label = rect("compact-label");
  expect(label.left - tick.left).toBeCloseTo(4, 1);
  expect(label.top - compact.top).toBeCloseTo(2, 1);
});

for (const theme of ["light", "dark"] as const) {
  test(`${theme} — 클립 글자 · 길이 배지 · 재생헤드 · 그립 · 눈금 · 「+」 대비를 파인 면 위에서 잰다`, async () => {
    document.documentElement.setAttribute("data-theme", theme);
    await render(
      <>
        <Timeline />
        <Ruler />
      </>,
    );
    const ground = backdrop(find("shell"));
    for (const tone of ["caption", "image", "audio"] as const) {
      expect(textContrast(find(`label-${tone}`)), `${tone} 클립 글자`).toBeGreaterThanOrEqual(4.5);
    }
    expect(textContrast(find("duration")), "영상 길이 배지").toBeGreaterThanOrEqual(4.5);
    expect(contrastOn(style("playhead").backgroundColor, ground), "재생헤드").toBeGreaterThanOrEqual(3);
    expect(contrastOn(style("trim-start", "::before").backgroundColor, ground), "괄호").toBeGreaterThanOrEqual(3);
    const bracket = parseColor(style("trim-start", "::before").backgroundColor);
    expect(contrastOn(style("trim-start", "::after").backgroundColor, bracket), "그립 on 괄호").toBeGreaterThanOrEqual(3);
    expect(textContrast(find("compact-label")), "촘촘한 눈금 글자").toBeGreaterThanOrEqual(4.5);
    expect(contrastOn(style("compact-tick").backgroundColor, ground), "촘촘한 눈금 선").toBeGreaterThanOrEqual(3);
    expect(textContrast(find("add")), "「+」 글리프").toBeGreaterThanOrEqual(4.5);
    const rulerGround = backdrop(find("ruler"));
    expect(contrastOn(style("major").backgroundColor, rulerGround), "기본 눈금").toBeGreaterThanOrEqual(3);
    expect(textContrast(find("label-mid")), "기본 눈금 글자").toBeGreaterThanOrEqual(4.5);
  });
}
