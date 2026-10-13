// figma/components.measured.json 의 **media-slot · audio-cell** 기하를 코드가 실제로 만드는지 잰다(DS-D-0035 (c)).
//
// parity 게이트는 Figma 가 기록과 같은지만 본다. 레시피가 조용히 바뀌면 **Figma 와 기록은 서로 맞고 둘 다 코드와 틀린**
// 상태로 통과한다 — 이 파일이 그 반대 방향이다. 키는 Figma 되읽기(MediaSlot · AudioCell)의 키와 같다.
//
// **React 표면이 아니라 클래스 마크업을 렌더한다.** 둘 다 packages/react/src 에 표면이 없고 정본이
// packages/css/src/component/media-slot.css · audio-cell.css 다. 마크업은 각 문서(design/components/*.md) 예시 그대로다.
//
// Hover 키는 CSS 상태라 렌더로 만들지 않는다 — 레시피의 hover 규칙은 색만 바꾸므로 Default 마크업의 기하가 그 키의 기하다.
import type { CSSProperties, JSX } from "react";
import { expect, test } from "vitest";
import { render } from "vitest-browser-react";
import measured from "../../../figma/components.measured.json" with { type: "json" };
import "@klipse-design/css/layers.css";
import "@klipse-design/css/tokens.css";
import "@klipse-design/css/styles.css";
import "../../css/src/component/media-slot.css";
import "../../css/src/component/audio-cell.css";

const px = (value: string): number => Number.parseFloat(value);

function find(testId: string): HTMLElement {
  const node = document.querySelector(`[data-testid="${testId}"]`);
  if (node === null) throw new Error(`찾지 못했습니다: ${testId}`);
  return node as HTMLElement;
}

/** `sizes` 한 칸. `$…` 사유와 한 객체에 섞여 있어 타입이 열려 있다 — 수가 아니면 던진다. */
function num(spec: Record<string, unknown>, field: string, label: string): number {
  const value = spec[field];
  if (typeof value !== "number") throw new Error(`${label}.${field}가 수가 아닙니다`);
  return value;
}

// ── Media Slot ────────────────────────────────────────────────────────────

const FIXED_SLOTS: readonly {
  key: string;
  spec: Record<string, unknown>;
  size: "md" | "video" | "attachment";
}[] = [
  { key: "md/base/Default", spec: measured.components["media-slot"].sizes["md/base/Default"], size: "md" },
  { key: "video/base/Default", spec: measured.components["media-slot"].sizes["video/base/Default"], size: "video" },
  {
    key: "attachment/base/Default",
    spec: measured.components["media-slot"].sizes["attachment/base/Default"],
    size: "attachment",
  },
];

const FILL_SLOTS: readonly {
  key: string;
  spec: Record<string, unknown>;
  empty: boolean;
  ratio?: "2:3";
}[] = [
  { key: "fill/base/Default", spec: measured.components["media-slot"].sizes["fill/base/Default"], empty: false },
  { key: "fill/empty/Default", spec: measured.components["media-slot"].sizes["fill/empty/Default"], empty: true },
  { key: "fill/empty/Hover", spec: measured.components["media-slot"].sizes["fill/empty/Hover"], empty: true },
  {
    key: "fill/base/Default/2:3",
    spec: measured.components["media-slot"].sizes["fill/base/Default/2:3"],
    empty: false,
    ratio: "2:3",
  },
];

/** 고정 칸 — md 는 문서대로 `data-size` 를 달지 않는다(없음 = md). */
function FixedSlot({ size }: { size: "md" | "video" | "attachment" }): JSX.Element {
  return (
    <div className="louis-media-slot-strip" data-layout="wrap">
      <div className="louis-media-slot" data-size={size === "md" ? undefined : size} data-testid="slot" />
    </div>
  );
}

/** 채움 칸 — 3 열 줄(열 폭 = (212 − 8·2) / 3)에 세운다. 폭은 줄이 정하므로 기록에 수가 없다. */
function FillSlot({ empty, ratio }: { empty: boolean; ratio?: "2:3" | undefined }): JSX.Element {
  return (
    <div style={{ inlineSize: 212 }}>
      <div className="louis-media-slot-strip" data-layout="grid">
        {empty ? (
          <button
            type="button"
            className="louis-media-slot"
            data-size="fill"
            data-empty="true"
            aria-label="참조 더하기"
            data-testid="slot"
          />
        ) : (
          <div className="louis-media-slot" data-size="fill" data-ratio={ratio} data-testid="slot" />
        )}
      </div>
    </div>
  );
}

function expectFrame(style: CSSStyleDeclaration, spec: Record<string, unknown>, label: string): void {
  expect(px(style.borderTopLeftRadius), `${label} 반경`).toBe(num(spec, "radius", label));
  const border = num(spec, "borderWidth", label);
  expect(px(style.borderTopWidth), `${label} 테두리 위`).toBe(border);
  expect(px(style.borderRightWidth), `${label} 테두리 오른쪽`).toBe(border);
  expect(px(style.borderBottomWidth), `${label} 테두리 아래`).toBe(border);
  expect(px(style.borderLeftWidth), `${label} 테두리 왼쪽`).toBe(border);
  expect(style.boxSizing, `${label} 상자`).toBe("border-box");
}

for (const { key, spec, size } of FIXED_SLOTS) {
  test(`media-slot ${key}: 상자 · 반경 · 테두리가 기록과 같다`, async () => {
    await render(<FixedSlot size={size} />);
    const slot = find("slot");
    const rect = slot.getBoundingClientRect();
    expect(rect.width, `${key} 폭`).toBe(num(spec, "width", key));
    expect(rect.height, `${key} 높이`).toBe(num(spec, "height", key));
    expectFrame(getComputedStyle(slot), spec, key);
  });
}

for (const { key, spec, empty, ratio } of FILL_SLOTS) {
  test(`media-slot ${key}: 열 폭을 받고 비율 · 반경 · 테두리가 기록과 같다`, async () => {
    await render(<FillSlot empty={empty} ratio={ratio} />);
    const slot = find("slot");
    const rect = slot.getBoundingClientRect();
    // 폭은 열 폭이다 — 기록에 수가 없어야 하고(채움 칸), 실제로 열을 채운다.
    expect(spec.width, `${key} 폭은 기록에 굳히지 않는다`).toBeUndefined();
    expect(rect.width, `${key} 폭 = 열 폭`).toBeCloseTo((212 - 8 * 2) / 3, 1);
    expect(rect.height / rect.width, `${key} 세로 / 폭`).toBeCloseTo(num(spec, "heightPerWidth", key), 2);
    const style = getComputedStyle(slot);
    expectFrame(style, spec, key);
    if (empty) expect(style.borderTopStyle, `${key} 점선`).toBe("dashed");
  });
}

// ── Audio Cell ────────────────────────────────────────────────────────────

const AUDIO_STATES: readonly { key: string; spec: Record<string, unknown>; pending: boolean }[] = [
  { key: "Ready", spec: measured.components["audio-cell"].sizes["Ready"], pending: false },
  { key: "Playing", spec: measured.components["audio-cell"].sizes["Playing"], pending: false },
  { key: "Pending", spec: measured.components["audio-cell"].sizes["Pending"], pending: true },
];

/** 노드 카드 폭(380 표본) 안의 칸. Ready · Playing 은 같은 마크업이다 — 재생 글리프만 다르다. */
function AudioCell({ pending, playing }: { pending: boolean; playing: boolean }): JSX.Element {
  return (
    <div style={{ inlineSize: 380 }}>
      {pending ? (
        <div className="louis-audio-cell" data-state="pending" aria-busy="true" data-testid="cell">
          <span className="louis-audio-cell__pending" aria-hidden="true" />
        </div>
      ) : (
        <div className="louis-audio-cell" style={{ "--louis-audio-cell-progress": "0.4" } as CSSProperties} data-testid="cell">
          <div className="louis-audio-cell__content">
            <button type="button" className="louis-audio-cell__play" aria-label={playing ? "일시정지" : "재생"}>
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M8 5v14l11-7z" />
              </svg>
            </button>
            <div className="louis-audio-cell__track">
              <div
                className="louis-audio-cell__bar"
                role="slider"
                tabIndex={0}
                aria-label="재생 위치"
                aria-valuemin={0}
                aria-valuemax={30}
                aria-valuenow={12}
                aria-valuetext="0:12 / 0:30"
              >
                <div className="louis-audio-cell__fill" />
                <span className="louis-audio-cell__thumb" aria-hidden="true" />
              </div>
              <div className="louis-audio-cell__time">
                <span>0:12</span>
                <span>0:30</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

for (const { key, spec, pending } of AUDIO_STATES) {
  test(`audio-cell ${key}: 높이 · 여백 · 반경 · 가로 흐름이 기록과 같다`, async () => {
    await render(<AudioCell pending={pending} playing={key === "Playing"} />);
    const cell = find("cell");
    const style = getComputedStyle(cell);
    expect(cell.getBoundingClientRect().height, `${key} 높이`).toBe(num(spec, "height", key));
    const padding = num(spec, "padding", key);
    expect(px(style.paddingTop), `${key} 위 여백`).toBe(padding);
    expect(px(style.paddingBottom), `${key} 아래 여백`).toBe(padding);
    expect(px(style.paddingLeft), `${key} 왼쪽 여백`).toBe(padding);
    expect(px(style.paddingRight), `${key} 오른쪽 여백`).toBe(padding);
    expect(px(style.borderTopLeftRadius), `${key} 반경`).toBe(num(spec, "radius", key));
    // Figma layoutMode HORIZONTAL 의 코드 쪽 — 가로 flex.
    expect(style.display, `${key} flex`).toBe("flex");
    expect(style.flexDirection, `${key} 가로`).toBe("row");
    // 테두리가 없다 — Figma 패딩이 CSS 패딩과 같은 수인 근거(헤어라인은 inset 그림자).
    expect(px(style.borderTopWidth), `${key} 테두리 없음`).toBe(0);
  });
}
