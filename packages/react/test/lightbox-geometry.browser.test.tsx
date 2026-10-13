// figma/components.measured.json 의 **lightbox-action · lightbox** 값을 코드가 여전히 만드는지 검증한다(DS-D-0035 (c), 2026-10-13 DS-D-0086).
//
// parity 게이트는 Figma 가 기록과 같은지만 본다. 이 파일이 없으면 CSS 가 조용히 바뀌어도 **Figma 와 기록은 서로 맞고 둘 다
// 코드와 틀린** 상태로 통과한다. 그래서 기록의 키(= Figma 되읽기의 variant 키)마다 클래스 마크업을 렌더하고 기록의 필드를
// 계산값과 맞댄다. 대비 · 수명은 lightbox.browser.test.tsx 가 소유하고, 이 파일은 계약이 거는 기하만 본다.
import type { JSX } from "react";
import { expect, test } from "vitest";
import { userEvent } from "vitest/browser";
import { render } from "vitest-browser-react";
import measured from "../../../figma/components.measured.json" with { type: "json" };
import "@klipse-design/css/layers.css";
import "@klipse-design/css/tokens.css";
import "@klipse-design/css/styles.css";
import "../../css/src/component/lightbox.css";
import { find, px } from "./fixtures/contrast";

type Sizes = Record<string, Record<string, unknown>>;

function num(spec: Record<string, unknown>, field: string, label: string): number {
  const value = spec[field];
  if (typeof value !== "number") throw new Error(`${label}.${field}가 수가 아닙니다`);
  return value;
}

function Lightbox(): JSX.Element {
  return (
    <div className="louis-lightbox" role="dialog" aria-modal="true" aria-label="이미지 크게 보기" data-louis-state="open">
      <div className="louis-lightbox__scrim" aria-hidden="true" />
      <div className="louis-lightbox__frame" data-testid="frame">
        <img className="louis-lightbox__media" src="data:image/gif;base64,R0lGODlhAQABAAAAACw=" alt="예시" draggable={false} />
        <div className="louis-lightbox__actions" data-testid="actions">
          {(["Default", "Hover"] as const).map((key) => (
            <button key={key} type="button" className="louis-lightbox__action" aria-label={key} data-testid={`action-${key}`}>
              <svg viewBox="0 0 24 24" aria-hidden="true" data-testid={`glyph-${key}`}>
                <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="1.5" />
              </svg>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

test("lightbox-action: 두 상태 칸의 크기 · 반경 · 글리프가 기록과 같다", async () => {
  await render(<Lightbox />);
  // Hover 칸은 실제로 올린다 — 호버가 면 알파만 바꾸고 상자를 건드리지 않는다는 것이 기록의 주장이다.
  await userEvent.hover(find("action-Hover"));
  for (const [key, spec] of Object.entries(measured.components["lightbox-action"].sizes as Sizes)) {
    const label = `lightbox-action.${key}`;
    const node = find(`action-${key}`);
    const box = node.getBoundingClientRect();
    expect(box.width, `${label}.size`).toBe(num(spec, "size", label));
    expect(box.height, `${label}.size`).toBe(num(spec, "size", label));
    expect(px(getComputedStyle(node).borderTopLeftRadius), `${label}.radius`).toBe(num(spec, "radius", label));
    const glyph = find(`glyph-${key}`).getBoundingClientRect();
    expect(glyph.width, `${label}.glyphSize`).toBe(num(spec, "glyphSize", label));
    expect(glyph.height, `${label}.glyphSize`).toBe(num(spec, "glyphSize", label));
  }
});

test("lightbox: 창 반경 · 액션 묶음 안쪽 · 사이 · 방향이 기록과 같다", async () => {
  await render(<Lightbox />);
  const spec = measured.components["lightbox"].sizes["base"] as Record<string, unknown>;
  const label = "lightbox.base";
  const frame = find("frame").getBoundingClientRect();
  expect(px(getComputedStyle(find("frame")).borderTopLeftRadius), `${label}.frameRadius`).toBe(num(spec, "frameRadius", label));
  const actions = find("actions");
  const box = actions.getBoundingClientRect();
  expect(box.top - frame.top, `${label}.actionsInset`).toBe(num(spec, "actionsInset", label));
  expect(frame.right - box.right, `${label}.actionsInset`).toBe(num(spec, "actionsInset", label));
  expect(px(getComputedStyle(actions).columnGap), `${label}.actionGap`).toBe(num(spec, "actionGap", label));
  expect(getComputedStyle(actions).flexDirection, `${label}.actionsDirection`).toBe(spec["actionsDirection"]);
});
