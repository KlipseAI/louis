// figma/components.measured.json 의 **timeline-clip · timeline-trim-handle · timeline-ruler · timeline** 값을 코드가 여전히 만드는지 검증한다
// (DS-D-0035 (c), 2026-10-14 DS-D-0089).
//
// parity 게이트는 Figma 가 기록과 같은지만 본다. 이 파일이 없으면 CSS 가 조용히 바뀌어도 **Figma 와 기록은 서로 맞고 둘 다
// 코드와 틀린** 상태로 통과한다. 그래서 기록의 키(= Figma 되읽기의 축 키)마다 클래스 마크업을 렌더하고 기록의 필드를 계산값과 맞댄다.
// 대비 · 원점 식은 timeline.browser.test.tsx 가 소유한다.
import type { CSSProperties, JSX } from "react";
import { beforeEach, expect, test } from "vitest";
import { page } from "vitest/browser";
import { render } from "vitest-browser-react";
import measured from "../../../figma/components.measured.json" with { type: "json" };
import "@klipse-design/css/layers.css";
import "@klipse-design/css/tokens.css";
import "@klipse-design/css/styles.css";
import { find, px } from "./fixtures/contrast";

type Sizes = Record<string, Record<string, unknown>>;

function num(spec: Record<string, unknown>, field: string, label: string): number {
  const value = spec[field];
  if (typeof value !== "number") throw new Error(`${label}.${field}가 수가 아닙니다`);
  return value;
}

const vars = (entries: Record<string, string>): CSSProperties => entries as CSSProperties;

function Shell({ tone, selected }: { readonly tone: string; readonly selected: boolean }): JSX.Element {
  return (
    <div className="louis-timeline" style={{ ...vars({ "--louis-timeline-extent": "640px" }), inlineSize: 375, blockSize: 200 }} data-testid="shell">
      <div className="louis-timeline__viewport">
        <div className="louis-timeline__spacer" />
        <div className="louis-timeline__flow" data-testid="flow">
          <div className="louis-timeline-ruler" data-layout="compact" aria-hidden="true" data-testid="compact">
            <span className="louis-timeline-ruler__tick" style={vars({ "--louis-timeline-x": "0px" })} data-testid="compact-tick" />
          </div>
          <div className="louis-timeline__lane" data-tone={tone === "audio" ? "audio" : undefined}>
            <button type="button" className="louis-timeline__clip" data-tone={tone} aria-pressed={selected} style={vars({ "--louis-timeline-x": "40px", "--louis-timeline-w": "160px" })} data-testid="clip">
              <span className="louis-timeline__label">라벨</span>
              <span className="louis-timeline__trim" data-edge="start" aria-hidden="true" data-testid="trim-start" />
              <span className="louis-timeline__trim" data-edge="end" aria-hidden="true" data-testid="trim-end" />
            </button>
            <button type="button" className="louis-timeline__add" aria-label="소재 더하기" style={vars({ "--louis-timeline-x": "200px" })} data-testid="add" />
          </div>
        </div>
      </div>
      <div className="louis-timeline__playhead" aria-hidden="true" data-testid="playhead" />
    </div>
  );
}

function Ruler(): JSX.Element {
  return (
    <div style={{ inlineSize: 400 }}>
      <div className="louis-timeline-ruler" aria-hidden="true" data-testid="ruler">
        <span className="louis-timeline-ruler__tick" style={vars({ "--louis-timeline-x": "50%" })} data-testid="major" />
      </div>
    </div>
  );
}

beforeEach(async () => {
  await page.viewport(1440, 900);
});

// 기록을 id 문자열 인덱스로 **직접** 읽는다(간접 함수를 거치지 않는다) — verify-figma-done 이 그 모양으로 (c) 의 되재기를 센다.
const clipSizes = measured.components["timeline-clip"].sizes as Sizes;
const handleSizes = measured.components["timeline-trim-handle"].sizes as Sizes;
const rulerSizes = measured.components["timeline-ruler"].sizes as Sizes;
const shellSizes = measured.components["timeline"].sizes as Sizes;
function at(sizes: Sizes, key: string): Record<string, unknown> {
  const spec = sizes[key];
  if (spec === undefined) throw new Error(`기록에 ${key} 칸이 없습니다`);
  return spec;
}

test("기록의 키가 Figma 의 축과 같다", () => {
  expect(Object.keys(clipSizes).sort()).toEqual(
    ["audio/false", "audio/true", "caption/false", "caption/true", "image/false", "image/true", "video/false", "video/true"],
  );
  expect(Object.keys(handleSizes).sort()).toEqual(["next", "prev"]);
  expect(Object.keys(rulerSizes).sort()).toEqual(["base", "compact"]);
  expect(Object.keys(shellSizes)).toEqual(["base"]);
});

for (const [key, spec] of Object.entries(clipSizes)) {
  test(`timeline-clip ${key} — 기록의 기하를 코드가 만든다`, async () => {
    const [tone, selected] = key.split("/") as [string, string];
    await render(<Shell tone={tone} selected={selected === "true"} />);
    const clip = getComputedStyle(find("clip"));
    expect(find("clip").getBoundingClientRect().height, "height").toBe(num(spec, "height", key));
    expect(px(clip.paddingLeft), "paddingInline").toBe(num(spec, "paddingInline", key));
    expect(px(clip.paddingRight), "paddingInlineEnd").toBe(num(spec, "paddingInline", key));
    expect(px(clip.borderTopLeftRadius), "radius").toBe(num(spec, "radius", key));
  });
}

for (const [key, spec] of Object.entries(handleSizes)) {
  test(`timeline-trim-handle ${key} — 기록의 기하를 코드가 만든다`, async () => {
    await render(<Shell tone="video" selected />);
    const id = key === "prev" ? "trim-start" : "trim-end";
    expect(find(id).getBoundingClientRect().width, "width").toBe(num(spec, "width", key));
    expect(px(getComputedStyle(find(id), "::before").width), "bracketWidth").toBe(num(spec, "bracketWidth", key));
    const grip = getComputedStyle(find(id), "::after");
    expect(px(grip.width), "gripWidth").toBe(num(spec, "gripWidth", key));
    expect(px(grip.height), "gripHeight").toBe(num(spec, "gripHeight", key));
  });
}

test("timeline-ruler base · compact — 기록의 기하를 코드가 만든다", async () => {
  const base = at(rulerSizes, "base");
  const compact = at(rulerSizes, "compact");
  await render(
    <>
      <Ruler />
      <Shell tone="caption" selected={false} />
    </>,
  );
  expect(find("ruler").getBoundingClientRect().height, "base height").toBe(num(base, "height", "base"));
  expect(find("major").getBoundingClientRect().width, "base tickWidth").toBe(num(base, "tickWidth", "base"));
  expect(find("major").getBoundingClientRect().height, "base tickHeight").toBe(num(base, "tickHeight", "base"));
  expect(find("compact").getBoundingClientRect().height, "compact height").toBe(num(compact, "height", "compact"));
  expect(find("compact-tick").getBoundingClientRect().width, "compact tickWidth").toBe(num(compact, "tickWidth", "compact"));
  expect(find("compact-tick").getBoundingClientRect().height, "compact tickHeight").toBe(num(compact, "tickHeight", "compact"));
});

test("timeline base — 기록의 기하를 코드가 만든다", async () => {
  const spec = at(shellSizes, "base");
  await render(<Shell tone="video" selected={false} />);
  const flow = getComputedStyle(find("flow"));
  expect(px(flow.rowGap), "flowGap").toBe(num(spec, "flowGap", "base"));
  expect(px(flow.paddingTop), "flowPadding").toBe(num(spec, "flowPadding", "base"));
  expect(px(flow.paddingBottom), "flowPadding").toBe(num(spec, "flowPadding", "base"));
  const add = find("add").getBoundingClientRect();
  expect(add.width, "addSize").toBe(num(spec, "addSize", "base"));
  expect(add.height, "addSize").toBe(num(spec, "addSize", "base"));
  expect(px(getComputedStyle(find("add")).borderTopLeftRadius), "addRadius").toBe(num(spec, "addRadius", "base"));
  expect(find("playhead").getBoundingClientRect().width, "playheadWidth").toBe(num(spec, "playheadWidth", "base"));
});
