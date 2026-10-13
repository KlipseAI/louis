// Segment Track(`.louis-segment-track`)과 짝 블록 Stage Bar(`.louis-stage-bar`)의 레시피가 실제로 그 픽셀을 만드는지 잰다.
//
// **React 표면이 아니라 클래스 마크업을 렌더한다.** packages/react/src 에 표면이 없고 정본이
// packages/css/src/component/segment-track.css 다. 마크업은 design/components/segment-track.md 의 예시 그대로다.
//
// **기하는 데이터다.** 시각 → 위치 계산은 소비처 몫이라, 여기서는 변수 일곱을 손으로 주고 레시피가 그 값을 그 자리에
// 그리는지를 잰다(눈금 닻 · 지도 줄 식 · 막대 자리 · 칸 길이 비중).
//
// **대비는 렌더해서 잰다.** 칸 면은 반투명(48%)이라 토큰 값만으로는 대비가 나오지 않는다 — 조상 면을 합성한 바탕 위에서
// 글자의 계산 색을 잰다. 두 테마 다.
import type { CSSProperties, JSX } from "react";
import { afterEach, beforeEach, expect, test } from "vitest";
import { page } from "vitest/browser";
import { render } from "vitest-browser-react";
import "@klipse-design/css/layers.css";
import "@klipse-design/css/tokens.css";
import "@klipse-design/css/styles.css";
import "../../css/src/component/progress.css";
import "../../css/src/component/segment-track.css";

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

afterEach(() => {
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

/** 글자 잉크를 그 뒤 바탕에 합성해 WCAG 대비를 낸다. */
function contrastOf(node: HTMLElement): number {
  const ground = backdrop(node);
  const ink = over(parseColor(getComputedStyle(node).color), ground);
  const [hi, lo] = [luminance(ink), luminance(ground)].sort((x, y) => y - x) as [number, number];
  return (hi + 0.05) / (lo + 0.05);
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
  Object.fromEntries(Object.entries(entries).map(([key, value]) => [`--louis-segment-track-${key}`, String(value)])) as CSSProperties;

type Look = "clip" | "candidate" | "selected" | "short";

const BLOCKS: readonly { look: Look; weight: number; title: string }[] = [
  { look: "clip", weight: 1, title: "전반 12분 선제골" },
  { look: "candidate", weight: 3, title: "전반 31분 슈팅" },
  { look: "selected", weight: 1, title: "후반 54분 선방" },
  { look: "short", weight: 1, title: "후반 89분 역전 결승골" },
];

/** 채운 트랙 — 눈금 셋 · 지도(줄 수는 인자) · 구간 줄 넷. 첫 칸이 무대에 올라 있다. */
function FilledTrack({
  width = 1000,
  lanes = 2,
  layout,
}: {
  readonly width?: number;
  readonly lanes?: number;
  readonly layout?: "compact";
}): JSX.Element {
  return (
    <div style={{ inlineSize: width, background: "var(--louis-color-bg-surface)" }}>
      <section className="louis-segment-track" aria-label="하이라이트" data-layout={layout} data-testid="track" style={vars({ minor: "4%" })}>
        <div className="louis-segment-track__ruler" aria-hidden="true" data-testid="ruler">
          {[0, 50, 100].map((at) => (
            <span key={at} className="louis-segment-track__tick" data-testid={`tick-${at}`} style={vars({ at })}>
              {`${(at * 90) / 100}:00`}
            </span>
          ))}
        </div>
        <span className="louis-segment-track__label" data-testid="label">
          <span className="louis-segment-track__label-glyph" data-testid="glyph" aria-hidden="true" />
          하이라이트
        </span>
        <div className="louis-segment-track__map" aria-hidden="true" data-testid="map" style={vars({ lanes })}>
          <span className="louis-segment-track__map-bar" data-look="clip" data-testid="bar-rest" style={vars({ start: 25, span: 10, lane: 0 })} />
          <span
            className="louis-segment-track__map-bar"
            data-look="clip"
            data-current="true"
            data-testid="bar-current"
            style={vars({ start: 50, span: 5, lane: Math.max(0, lanes - 1) })}
          />
          <span className="louis-segment-track__map-bar" data-look="short" data-hover="true" data-testid="bar-hover" style={vars({ start: 70, span: 5, lane: 0 })} />
          <span className="louis-segment-track__map-bar" data-look="candidate" data-testid="bar-thin" style={vars({ start: 90, span: 0, lane: 0 })} />
          <span className="louis-segment-track__map-playhead" data-testid="map-playhead" style={vars({ at: 52 })} />
        </div>
        <div className="louis-segment-track__strip" role="toolbar" aria-label="구간" aria-orientation="horizontal" data-testid="strip">
          {BLOCKS.map((block, index) => (
            <button
              key={block.look}
              type="button"
              className="louis-segment-track__block"
              data-look={block.look}
              aria-current={index === 0 ? "true" : undefined}
              aria-label={`${index + 1} ${block.title}`}
              title={`${index + 1} ${block.title}`}
              tabIndex={index === 0 ? 0 : -1}
              data-testid={`block-${block.look}`}
              style={vars({ weight: block.weight })}
            >
              <span className="louis-segment-track__block-label" data-testid={`block-${block.look}-label`}>
                <span className="louis-segment-track__block-number">{index + 1}</span>
                <span className="louis-segment-track__block-title">{block.title}</span>
              </span>
              {index === 0 ? (
                <span className="louis-segment-track__block-playhead" aria-hidden="true" data-testid="block-playhead" style={vars({ at: 40 })} />
              ) : null}
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}

/** 빈 트랙 — 눈금 + 줄 머리 + 빈 줄. 길이를 모르므로 잔눈금 변수를 주지 않는다. */
function EmptyTrack({ layout }: { readonly layout?: "compact" }): JSX.Element {
  return (
    <div style={{ inlineSize: 1000, background: "var(--louis-color-bg-surface)" }}>
      <section className="louis-segment-track" aria-label="하이라이트" data-layout={layout} data-testid="track">
        <div className="louis-segment-track__ruler" aria-hidden="true" data-testid="ruler" />
        <span className="louis-segment-track__label" data-testid="label">
          <span className="louis-segment-track__label-glyph" aria-hidden="true" />
          하이라이트
        </span>
        <div className="louis-segment-track__lane" data-testid="lane">
          새 하이라이트
        </div>
      </section>
    </div>
  );
}

/** 무대 아래 막대 둘 — 올리는 중(안내 + 진행 묶음)과 판(상태 | 행동 + 실패 줄). */
function StageBars({ width = 1000 }: { readonly width?: number }): JSX.Element {
  return (
    <div style={{ inlineSize: width, background: "var(--louis-color-bg-surface)" }}>
      <div className="louis-stage-bar" data-testid="bar-upload">
        <div className="louis-stage-bar__row" data-testid="row-upload">
          <span className="louis-stage-bar__state" data-testid="state-upload">
            올리는 중
          </span>
          <p className="louis-stage-bar__note" data-testid="note">
            <span className="louis-stage-bar__line">창을 닫으면 올리기가 멈춰요.</span>
          </p>
          <div className="louis-stage-bar__progress" data-testid="progress">
            <span className="louis-stage-bar__percent" data-testid="percent">
              42%
            </span>
            <div
              className="louis-progress-bar"
              role="progressbar"
              aria-label="올리는 중"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={42}
              data-testid="progress-bar"
              style={{ "--louis-progress-value": "42" } as CSSProperties}
            >
              <div className="louis-progress-bar__fill" />
            </div>
          </div>
        </div>
      </div>
      <div className="louis-stage-bar" data-testid="bar-board" style={{ marginBlockStart: 16 }}>
        <div className="louis-stage-bar__row" data-testid="row-board">
          <span className="louis-stage-bar__state" data-testid="state-board">
            클립
          </span>
          <div className="louis-stage-bar__actions" data-testid="actions">
            <button type="button" className="louis-button" data-variant="primary" data-size="lg">
              숏폼 만들기
            </button>
          </div>
        </div>
        <p className="louis-stage-bar__error" role="alert" data-testid="error">
          숏폼을 만들지 못했어요. 다시 시도해 주세요.
        </p>
      </div>
    </div>
  );
}

test("틀의 안쪽 · 반경 · 격자(줄 머리 96 · 사이 12 · 줄 사이 6)가 제품 값이다", async () => {
  await render(<FilledTrack />);
  const track = style("track");
  expect(px(track.paddingTop)).toBe(12);
  expect(px(track.paddingLeft)).toBe(16);
  expect(px(track.paddingRight)).toBe(16);
  expect(px(track.paddingBottom)).toBe(14);
  expect(px(track.borderTopLeftRadius)).toBe(12);
  expect(px(track.columnGap)).toBe(12);
  expect(px(track.rowGap)).toBe(6);
  const box = rect("track");
  // 시간 열은 줄 머리 96 + 사이 12 뒤에서 시작한다.
  expect(rect("ruler").left - box.left).toBe(16 + 96 + 12);
  expect(rect("ruler").right).toBe(box.right - 16);
  expect(rect("map").left).toBe(rect("ruler").left);
  // 눈금 아래 6, 지도 아래 6.
  expect(rect("map").top - rect("ruler").bottom).toBe(6);
  expect(rect("strip").top + 4 - rect("map").bottom).toBe(6);
});

test("눈금 28 · 시각 글자 닻 · 큰 눈금 1 × 8 · 잔눈금 간격", async () => {
  await render(<FilledTrack />);
  const ruler = rect("ruler");
  expect(ruler.height).toBe(28);
  expect(style("ruler").backgroundImage).toContain("4%");
  // 0% 는 왼끝, 100% 는 오른끝에 붙어 칸 밖으로 나가지 않는다. 50% 는 가운데.
  expect(rect("tick-0").left).toBeCloseTo(ruler.left, 1);
  expect(rect("tick-100").right).toBeCloseTo(ruler.right, 1);
  const mid = rect("tick-50");
  expect(mid.left + mid.width / 2).toBeCloseTo(ruler.left + ruler.width / 2, 1);
  const mark = getComputedStyle(find("tick-50"), "::after");
  expect(px(mark.width)).toBe(1);
  expect(px(mark.height)).toBe(8);
  expect(px(mark.top)).toBe(mid.height + 2);
});

test("줄 머리가 마지막 줄 옆에 선다 — 빈 트랙은 빈 줄, 채운 트랙은 구간 줄", async () => {
  const empty = await render(<EmptyTrack />);
  expect(style("label").gridRowStart).toBe("2");
  const lane = rect("lane");
  const label = rect("label");
  expect(label.top + label.height / 2).toBeCloseTo(lane.top + lane.height / 2, 0);
  expect(lane.height).toBe(56);
  expect(style("lane").borderTopStyle).toBe("dashed");
  expect(px(style("lane").borderTopLeftRadius)).toBe(12);
  // 길이를 모르면 잔눈금은 12px.
  expect(style("ruler").backgroundImage).toContain("12px");
  await empty.unmount();

  await render(<FilledTrack />);
  expect(style("label").gridRowStart).toBe("3");
  expect(style("label").color).toBe(tokenColor("fg-secondary"));
  const glyph = rect("glyph");
  expect(glyph.width).toBe(16);
  expect(glyph.height).toBe(16);
});

test("지도 높이가 줄 식(줄 × 4 + (줄 − 1) × 2 + 6)을 따른다", async () => {
  for (const [lanes, height] of [
    [1, 10],
    [2, 16],
    [3, 22],
  ] as const) {
    const screen = await render(<FilledTrack lanes={lanes} />);
    expect(rect("map").height, `줄 ${lanes}`).toBe(height);
    await screen.unmount();
  }
});

test("지도 막대가 변수의 자리에 서고, 무대 · 가리킴 막대는 키워 고리를 두른다", async () => {
  await render(<FilledTrack lanes={2} />);
  const map = rect("map");
  const rest = rect("bar-rest");
  expect(rest.left - map.left).toBeCloseTo(map.width * 0.25, 1);
  expect(rest.width).toBeCloseTo(map.width * 0.1, 1);
  expect(rest.top - map.top).toBe(3);
  expect(rest.height).toBe(4);
  expect(style("bar-rest").backgroundColor).toBe(tokenColor("segment-track-clip-stroke"));
  // 길이 0 이어도 3 은 보인다.
  expect(rect("bar-thin").width).toBe(3);
  expect(style("bar-thin").backgroundColor).toBe(tokenColor("stroke-default"));
  // 무대 막대 — 둘째 줄(lane 1): 위 1 + 6, 높이 8, 고리 1.5 전경색.
  const current = rect("bar-current");
  expect(current.top - map.top).toBe(1 + 6);
  expect(current.height).toBe(8);
  expect(style("bar-current").boxShadow).toContain("1.5px");
  expect(style("bar-current").boxShadow).toContain(tokenColor("fg-primary"));
  // 가리킴 막대 — 강조색 고리, 숏폼이라 면도 강조색.
  expect(rect("bar-hover").height).toBe(8);
  expect(style("bar-hover").boxShadow).toContain(tokenColor("accent-primary"));
  expect(style("bar-hover").backgroundColor).toBe(tokenColor("accent-primary"));
  // 재생헤드 2 · 지도보다 위아래 2 길다 · 시각 자리 가운데.
  const head = rect("map-playhead");
  expect(head.width).toBe(2);
  expect(head.top).toBe(map.top - 2);
  expect(head.bottom).toBe(map.bottom + 2);
  expect(head.left + head.width / 2).toBeCloseTo(map.left + map.width * 0.52, 1);
});

test("칸 32 · 최소 88 · 좌우 8 · 남는 폭은 길이 비중이고, 무대 칸은 고리 2 · 바깥 1", async () => {
  await render(<FilledTrack />);
  const clip = find("block-clip");
  const s = getComputedStyle(clip);
  expect(clip.getBoundingClientRect().height).toBe(32);
  expect(px(s.minWidth)).toBe(88);
  expect(px(s.paddingLeft)).toBe(8);
  expect(px(s.borderTopLeftRadius)).toBe(8);
  expect(px(s.borderTopWidth)).toBe(1);
  // 칸 사이 4.
  expect(rect("block-candidate").left - rect("block-clip").right).toBe(4);
  // 비중 1 · 3 — 88 을 넘는 몫이 1 : 3.
  const extraClip = rect("block-clip").width - 88;
  const extraCandidate = rect("block-candidate").width - 88;
  expect(extraClip).toBeGreaterThan(0);
  expect(extraCandidate / extraClip).toBeCloseTo(3, 1);
  // 무대 칸 고리.
  expect(s.outlineStyle).toBe("solid");
  expect(px(s.outlineWidth)).toBe(2);
  expect(px(s.outlineOffset)).toBe(1);
  expect(s.outlineColor).toBe(tokenColor("fg-primary"));
  expect(getComputedStyle(find("block-candidate")).outlineStyle).toBe("none");
  // 칸 안 재생헤드 — 위아래 4, 폭 2, 칸 폭의 40% 자리.
  const head = rect("block-playhead");
  const box = clip.getBoundingClientRect();
  expect(head.width).toBe(2);
  expect(head.top - box.top).toBe(4 + 1);
  expect(box.bottom - head.bottom).toBe(4 + 1);
});

test("칸 상태 넷 — 선 모양과 면이 계약이다", async () => {
  await render(<FilledTrack />);
  const clip = style("block-clip");
  expect(clip.borderTopStyle).toBe("solid");
  expect(clip.borderTopColor).toBe(tokenColor("segment-track-clip-stroke"));
  expect(parseColor(clip.backgroundColor)[3]).toBeCloseTo(0.48, 2);
  const candidate = style("block-candidate");
  expect(candidate.borderTopStyle).toBe("dashed");
  expect(candidate.borderTopColor).toBe(tokenColor("stroke-default"));
  expect(parseColor(candidate.backgroundColor)[3]).toBe(0);
  expect(candidate.color).toBe(tokenColor("fg-tertiary"));
  const selected = style("block-selected");
  expect(selected.borderTopStyle).toBe("dashed");
  expect(selected.borderTopColor).toBe(tokenColor("accent-primary"));
  expect(parseColor(selected.backgroundColor)[3]).toBe(0);
  const short = style("block-short");
  expect(short.borderTopStyle).toBe("solid");
  expect(short.backgroundColor).toBe(tokenColor("accent-primary"));
  expect(short.color).toBe(tokenColor("fg-inverse"));
});

test("구간 줄은 넘치면 가로로 구르고 넘친 쪽 끝을 흐린다", async () => {
  await render(<FilledTrack width={420} />);
  const strip = find("strip");
  expect(getComputedStyle(strip).overflowX).toBe("auto");
  expect(strip.scrollWidth).toBeGreaterThan(strip.clientWidth);
  expect(px(getComputedStyle(strip).scrollPaddingLeft)).toBe(40);
  strip.setAttribute("data-fade-end", "true");
  expect(getComputedStyle(strip).maskImage).toContain("linear-gradient");
  strip.setAttribute("data-fade-start", "true");
  expect(getComputedStyle(strip).maskImage).toContain("40px");
});

test("촘촘한 판 — 한 칸 · 줄 머리 없음 · 안쪽 8 · 12 · 10 · 눈금 24 · 칸 44 × 136", async () => {
  const filled = await render(<FilledTrack layout="compact" />);
  const track = style("track");
  expect(px(track.paddingTop)).toBe(8);
  expect(px(track.paddingLeft)).toBe(12);
  expect(px(track.paddingBottom)).toBe(10);
  expect(style("label").display).toBe("none");
  expect(rect("ruler").left).toBe(rect("track").left + 12);
  expect(rect("ruler").height).toBe(24);
  expect(rect("block-clip").height).toBe(44);
  expect(rect("block-clip").width).toBe(136);
  expect(rect("block-candidate").width).toBe(136);
  await filled.unmount();

  await render(<EmptyTrack layout="compact" />);
  expect(rect("lane").height).toBe(40);
  expect(rect("lane").left).toBe(rect("track").left + 12);
});

test("Stage Bar — 트랙과 같은 면 · 한 줄 최소 40 · 진행 묶음 280 · 실패 줄은 제 줄", async () => {
  await render(<StageBars />);
  const bar = style("bar-upload");
  expect(px(bar.paddingTop)).toBe(8);
  expect(px(bar.paddingLeft)).toBe(8);
  expect(px(bar.borderTopLeftRadius)).toBe(12);
  expect(bar.backgroundColor).toBe(tokenColor("bg-raised"));
  expect(rect("row-upload").height).toBeGreaterThanOrEqual(40);
  expect(px(style("row-upload").paddingLeft)).toBe(8);
  expect(px(style("row-upload").columnGap)).toBe(12);
  // 진행 묶음은 280 · 오른쪽 끝.
  expect(rect("progress").width).toBe(280);
  expect(rect("progress").right).toBe(rect("row-upload").right);
  expect(px(style("percent").minWidth)).toBeGreaterThan(0);
  expect(style("percent").fontVariantNumeric).toBe("tabular-nums");
  // 안내는 상태 바로 뒤에 붙는다(오른쪽 남는 폭을 먹는다).
  expect(rect("note").left - rect("state-upload").right).toBe(12);
  // 판 — 행동은 오른쪽 끝, 실패 줄은 행 아래 제 줄 · 좌우 8 · 아래 4.
  expect(rect("actions").right).toBe(rect("row-board").right);
  const error = style("error");
  expect(rect("error").top).toBeGreaterThanOrEqual(rect("row-board").bottom);
  expect(rect("error").width).toBe(rect("bar-board").width - 16);
  expect(px(error.paddingLeft)).toBe(8);
  expect(px(error.paddingBottom)).toBe(4);
  expect(error.color).toBe(tokenColor("fg-danger-on-surface"));
});

test("Stage Bar — 719 이하에서 진행 묶음이 제 줄을 받는다", async () => {
  await page.viewport(719, 900);
  await render(<StageBars width={600} />);
  const row = rect("row-upload");
  const progress = rect("progress");
  expect(progress.width).toBe(row.width - 8);
  expect(progress.left).toBe(row.left + 8);
  expect(progress.top).toBeGreaterThan(rect("state-upload").bottom);
});

for (const theme of ["light", "dark"] as const) {
  test(`${theme} — 트랙의 글자가 대비 기준을 넘는다`, async () => {
    document.documentElement.setAttribute("data-theme", theme);
    await render(<FilledTrack />);
    expect(contrastOf(find("block-clip-label")), "클립 칸 글자").toBeGreaterThanOrEqual(4.5);
    expect(contrastOf(find("block-candidate-label")), "후보 칸 글자").toBeGreaterThanOrEqual(4.5);
    expect(contrastOf(find("block-selected-label")), "다음 추출 칸 글자").toBeGreaterThanOrEqual(4.5);
    expect(contrastOf(find("tick-50")), "눈금 글자").toBeGreaterThanOrEqual(4.5);
    expect(contrastOf(find("label")), "줄 머리").toBeGreaterThanOrEqual(4.5);
    // 숏폼 칸은 Button primary 와 같은 짝(3.37) — 소유자 수용 편차. 큰 글자 기준(3:1)만 지킨다.
    expect(contrastOf(find("block-short-label")), "숏폼 칸 글자").toBeGreaterThanOrEqual(3);
    // 클립 칸 면은 클립 시맨틱 48% 다.
    expect(style("block-clip").borderTopColor).toBe(tokenColor("segment-track-clip-stroke"));
  });

  test(`${theme} — 빈 줄 · Stage Bar 의 글자와 실패 줄이 대비 기준을 넘는다`, async () => {
    document.documentElement.setAttribute("data-theme", theme);
    await render(
      <>
        <EmptyTrack />
        <StageBars />
      </>,
    );
    expect(contrastOf(find("lane")), "빈 줄 글").toBeGreaterThanOrEqual(4.5);
    expect(contrastOf(find("state-board")), "상태").toBeGreaterThanOrEqual(4.5);
    expect(contrastOf(find("note")), "안내").toBeGreaterThanOrEqual(4.5);
    expect(contrastOf(find("percent")), "퍼센트").toBeGreaterThanOrEqual(4.5);
    const error = contrastOf(find("error"));
    expect(error, "실패 줄").toBeGreaterThanOrEqual(4.5);
    // 「실패」로 읽혀야 한다 — 거의 검정 · 거의 흰색(제품 `fg-danger`, 14 이상)이 아니다.
    expect(error, "실패 줄이 위험색으로 읽힌다").toBeLessThan(10);
  });
}
