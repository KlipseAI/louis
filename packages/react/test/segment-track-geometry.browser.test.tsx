// figma/components.measured.json 의 **segment-track · segment-track-block · segment-track-map-bar · stage-bar** 기록을
// 코드가 실제로 만드는지 잰다(DS-D-0035 — Figma 치수가 코드 실측과 만나야 한다).
//
// **왜 segment-track.browser.test.tsx 와 따로인가.** 그 파일은 레시피의 행동(눈금 닻 · 지도 줄 식 · 대비)을 잰다. 이 파일은
// Figma 세트 넷의 기하 계약이 걸린 기록을 키마다 되잰다 — parity 게이트는 Figma 가 기록과 같은지만 보므로, 레시피가 조용히
// 바뀌면 Figma 와 기록이 서로 맞고 둘 다 코드와 틀린 채로 통과한다. 이 파일이 그 틈을 막는다.
//
// **React 표면이 아니라 클래스 마크업을 렌더한다.** 정본이 packages/css/src/component/segment-track.css 이고 마크업은
// design/components/segment-track.md 의 예시 그대로다. 높이 하한(minHeight)은 하한이 되는 내용 — 지도 한 줄 · 칸 하나 ·
// 실패 줄 없음 — 으로 렌더해 정확히 맞댄다.
import type { CSSProperties, JSX } from "react";
import { beforeEach, expect, test } from "vitest";
import { page } from "vitest/browser";
import { render } from "vitest-browser-react";
import measured from "../../../figma/components.measured.json" with { type: "json" };
import "@klipse-design/css/layers.css";
import "@klipse-design/css/tokens.css";
import "@klipse-design/css/styles.css";
import "../../css/src/component/segment-track.css";

const trackSpec = measured.components["segment-track"].sizes as Record<string, Record<string, unknown>>;
const blockSpec = measured.components["segment-track-block"].sizes as Record<string, Record<string, unknown>>;
const mapBarSpec = measured.components["segment-track-map-bar"].sizes as Record<string, Record<string, unknown>>;
const stageSpec = measured.components["stage-bar"].sizes as Record<string, Record<string, unknown>>;

/** `sizes` 한 칸. `$…` 사유와 한 객체에 섞여 있어 타입이 열려 있다 — 수가 아니면 던진다. */
function sizeOf(spec: Record<string, Record<string, unknown>>, key: string, field: string, label: string): number {
  const row = spec[key];
  if (row === undefined) throw new Error(`${label}.${key} 가 기록에 없습니다`);
  const value = row[field];
  if (typeof value !== "number") throw new Error(`${label}.${key}.${field} 가 수가 아닙니다`);
  return value;
}

const px = (value: string): number => Number.parseFloat(value);

function find(testId: string): HTMLElement {
  const node = document.querySelector(`[data-testid="${testId}"]`);
  if (node === null) throw new Error(`찾지 못했습니다: ${testId}`);
  return node as HTMLElement;
}

const vars = (entries: Record<string, number | string>): CSSProperties =>
  Object.fromEntries(Object.entries(entries).map(([key, value]) => [`--louis-segment-track-${key}`, String(value)])) as CSSProperties;

beforeEach(async () => {
  await page.viewport(1280, 900);
});

// ── SegmentTrack — 키는 Layout × State ─────────────────────────────────────

function Track({ layout, filled, testId }: { readonly layout: string; readonly filled: boolean; readonly testId: string }): JSX.Element {
  return (
    <section
      className="louis-segment-track"
      aria-label="하이라이트"
      data-layout={layout === "compact" ? "compact" : undefined}
      data-testid={testId}
    >
      <div className="louis-segment-track__ruler" aria-hidden="true">
        <span className="louis-segment-track__tick" style={vars({ at: 0 })}>
          0:00
        </span>
      </div>
      <span className="louis-segment-track__label">
        <span className="louis-segment-track__label-glyph" aria-hidden="true" />
        하이라이트
      </span>
      {filled ? (
        <>
          {/* 하한 — 지도 한 줄. */}
          <div className="louis-segment-track__map" aria-hidden="true" style={vars({ lanes: 1 })}>
            <span className="louis-segment-track__map-bar" data-look="clip" style={vars({ start: 10, span: 20, lane: 0 })} />
          </div>
          <div className="louis-segment-track__strip" role="toolbar" aria-label="구간" aria-orientation="horizontal">
            <button type="button" className="louis-segment-track__block" data-look="clip" tabIndex={0}>
              <span className="louis-segment-track__block-label">
                <span className="louis-segment-track__block-number">1</span>
                <span className="louis-segment-track__block-title">선제골</span>
              </span>
            </button>
          </div>
        </>
      ) : (
        <div className="louis-segment-track__lane">새 하이라이트</div>
      )}
    </section>
  );
}

test("segment-track: 틀의 높이 하한 · 안쪽 · 줄 사이 · 반경이 SegmentTrack 기록과 같다", async () => {
  const keys = Object.keys(trackSpec);
  expect(keys.length).toBeGreaterThan(0);
  await render(
    <div style={{ inlineSize: 1000 }}>
      {keys.map((key) => {
        const [layout, state] = key.split("/") as [string, string];
        return <Track key={key} layout={layout} filled={state === "Filled"} testId={`track-${key}`} />;
      })}
    </div>,
  );
  for (const key of keys) {
    const node = find(`track-${key}`);
    const computed = getComputedStyle(node);
    const at = (field: string): number => sizeOf(trackSpec, key, field, "segment-track");
    expect(node.getBoundingClientRect().height, `${key} 높이 하한`).toBe(at("minHeight"));
    expect(px(computed.paddingTop), `${key} 위 안쪽`).toBe(at("paddingBlock"));
    expect(px(computed.paddingBottom), `${key} 아래 안쪽`).toBe(at("paddingBlockEnd"));
    expect(px(computed.paddingLeft), `${key} 왼 안쪽`).toBe(at("paddingInline"));
    expect(px(computed.paddingRight), `${key} 오른 안쪽`).toBe(at("paddingInline"));
    expect(px(computed.rowGap), `${key} 줄 사이`).toBe(at("gap"));
    expect(px(computed.borderTopLeftRadius), `${key} 반경`).toBe(at("radius"));
    // 틀에 테두리가 없다 — 헤어라인은 inset 그림자라 Figma 패딩에 접을 것이 없다.
    expect(px(computed.borderTopWidth), `${key} 테두리`).toBe(0);
  }
});

// ── SegmentTrackBlock — 키는 Look × Selected(코드 data-look × aria-current) ─────

test("segment-track 칸: 높이 · 좌우 안쪽 · 테두리 · 반경이 SegmentTrackBlock 기록과 같다", async () => {
  const keys = Object.keys(blockSpec);
  expect(keys.length).toBeGreaterThan(0);
  await render(
    <section className="louis-segment-track" aria-label="하이라이트" style={{ inlineSize: 1000 }}>
      <div className="louis-segment-track__strip" role="toolbar" aria-label="구간" aria-orientation="horizontal">
        {keys.map((key, index) => {
          const [look, selected] = key.split("/") as [string, string];
          return (
            <button
              key={key}
              type="button"
              className="louis-segment-track__block"
              data-look={look}
              aria-current={selected === "true" ? "true" : undefined}
              tabIndex={index === 0 ? 0 : -1}
              data-testid={`block-${key}`}
            >
              <span className="louis-segment-track__block-label">
                <span className="louis-segment-track__block-number">{index + 1}</span>
                <span className="louis-segment-track__block-title">구간</span>
              </span>
            </button>
          );
        })}
      </div>
    </section>,
  );
  for (const key of keys) {
    const node = find(`block-${key}`);
    const computed = getComputedStyle(node);
    const at = (field: string): number => sizeOf(blockSpec, key, field, "segment-track-block");
    expect(node.getBoundingClientRect().height, `${key} 높이`).toBe(at("height"));
    expect(px(computed.paddingLeft), `${key} 왼 안쪽`).toBe(at("paddingInline"));
    expect(px(computed.paddingRight), `${key} 오른 안쪽`).toBe(at("paddingInline"));
    expect(px(computed.borderLeftWidth), `${key} 테두리`).toBe(at("borderWidth"));
    expect(px(computed.borderTopLeftRadius), `${key} 반경`).toBe(at("radius"));
    // Figma 패딩은 내용 가장자리다 — 테두리를 접은 자리가 실제로 그 수인지 렌더로 잰다.
    const label = node.querySelector<HTMLElement>(".louis-segment-track__block-label");
    if (label === null) throw new Error(`${key} 칸 이름이 없습니다`);
    expect(label.getBoundingClientRect().left - node.getBoundingClientRect().left, `${key} 내용 가장자리`).toBe(
      at("paddingInline") + at("borderWidth"),
    );
    expect(computed.display, `${key} 가로 흐름`).toBe("flex");
  }
});

// ── SegmentTrackMapBar — 키는 Look × Emphasis ──────────────────────────────

/** Figma Look → 코드 data-look. accent 는 강조색 둘(selected · short)이다 — 둘 다 같은 기하인지 잰다. */
const MAP_LOOKS: Record<string, readonly string[]> = {
  clip: ["clip"],
  candidate: ["candidate"],
  accent: ["selected", "short"],
};

test("segment-track 지도 막대: 높이 · 반경이 SegmentTrackMapBar 기록과 같다", async () => {
  const keys = Object.keys(mapBarSpec);
  expect(keys.length).toBeGreaterThan(0);
  const rows = keys.flatMap((key) => {
    const [look, emphasis] = key.split("/") as [string, string];
    const codeLooks = MAP_LOOKS[look];
    if (codeLooks === undefined) throw new Error(`알 수 없는 Look: ${look}`);
    return codeLooks.map((codeLook) => ({ key, codeLook, emphasis, testId: `bar-${key}-${codeLook}` }));
  });
  await render(
    <section className="louis-segment-track" aria-label="하이라이트" style={{ inlineSize: 1000 }}>
      {rows.map((row) => (
        <div key={row.testId} className="louis-segment-track__map" aria-hidden="true" style={vars({ lanes: 1 })}>
          <span
            className="louis-segment-track__map-bar"
            data-look={row.codeLook}
            data-current={row.emphasis === "current" ? "true" : undefined}
            data-hover={row.emphasis === "hover" ? "true" : undefined}
            style={vars({ start: 10, span: 20, lane: 0 })}
            data-testid={row.testId}
          />
        </div>
      ))}
    </section>,
  );
  for (const row of rows) {
    const node = find(row.testId);
    const at = (field: string): number => sizeOf(mapBarSpec, row.key, field, "segment-track-map-bar");
    expect(node.getBoundingClientRect().height, `${row.testId} 높이`).toBe(at("height"));
    expect(px(getComputedStyle(node).borderTopLeftRadius), `${row.testId} 반경`).toBe(at("radius"));
  }
});

// ── StageBar — 키는 Layout(board · waiting · stopped) ─────────────────────

test("stage-bar: 높이 하한 · 안쪽 · 줄 사이 · 반경이 StageBar 기록과 같다", async () => {
  const keys = Object.keys(stageSpec);
  expect(keys.length).toBeGreaterThan(0);
  // Layout 은 줄 안 내용만 바꾼다 — 하한이 되는 한 줄(상태 글 하나, 실패 줄 없음)로 렌더한다.
  await render(
    <div style={{ inlineSize: 1000 }}>
      {keys.map((key) => (
        <div key={key} className="louis-stage-bar" data-testid={`stage-${key}`}>
          <div className="louis-stage-bar__row" data-testid={`stage-row-${key}`}>
            <span className="louis-stage-bar__state">{key}</span>
          </div>
        </div>
      ))}
    </div>,
  );
  for (const key of keys) {
    const node = find(`stage-${key}`);
    const computed = getComputedStyle(node);
    const at = (field: string): number => sizeOf(stageSpec, key, field, "stage-bar");
    expect(node.getBoundingClientRect().height, `${key} 높이 하한`).toBe(at("minHeight"));
    expect(px(getComputedStyle(find(`stage-row-${key}`)).minBlockSize), `${key} 한 줄 최소`).toBe(at("rowMinHeight"));
    expect(px(computed.paddingTop), `${key} 위 안쪽`).toBe(at("padding"));
    expect(px(computed.paddingBottom), `${key} 아래 안쪽`).toBe(at("padding"));
    expect(px(computed.paddingLeft), `${key} 왼 안쪽`).toBe(at("padding"));
    expect(px(computed.paddingRight), `${key} 오른 안쪽`).toBe(at("padding"));
    expect(px(computed.rowGap), `${key} 줄 사이`).toBe(at("gap"));
    expect(px(computed.borderTopLeftRadius), `${key} 반경`).toBe(at("radius"));
    expect(px(computed.borderTopWidth), `${key} 테두리`).toBe(0);
  }
});
