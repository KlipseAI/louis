// figma/components.measured.json 의 **floating-shell-item · floating-shell-divider** 값을 코드가 여전히 만드는지
// 검증한다(DS-D-0035 (c) — Figma 치수가 코드 실측과 만나야 한다).
//
// parity 게이트는 Figma 의 FloatingShellItem · FloatingShellDivider 가 기록과 같은지만 본다. 이 파일이 없으면
// 레시피가 조용히 바뀌어도 **Figma 와 기록은 서로 맞고 둘 다 코드와 틀린** 상태로 통과한다.
//
// **React 표면이 없어 클래스 마크업을 렌더한다.** 정본은 packages/css/src/component/floating-shell.css 의
// `__item[data-variant="ghost"]` · `__glyph` · `__divider` 이고, 마크업은 design/components/floating-shell.md
// 「툴 버튼」 절의 예시 그대로다. 저작 CSS 를 함께 import 하는 이유는 floating-shell.browser.test.tsx 머리말과 같다.
//
// 키는 Figma 의 Size × State 여덟 칸이다. md 는 속성 없는 셸, lg 는 `data-size="compact"` 셸 안의 조각이다.
// State 는 상자를 바꾸지 않는다는 것이 계약이라 칸마다 그 상태의 마크업을 세워 같은 값을 잰다 —
// 어느 상태 규칙이 크기를 다시 쓰기 시작하면 그 칸에서 걸린다.
import type { JSX } from "react";
import { expect, test } from "vitest";
import { userEvent } from "vitest/browser";
import { render } from "vitest-browser-react";
import measured from "../../../figma/components.measured.json" with { type: "json" };
import "@klipse-design/css/layers.css";
import "@klipse-design/css/tokens.css";
import "@klipse-design/css/styles.css";
import "../../css/src/component/floating-shell.css";

type Size = "md" | "lg";
type State = "Default" | "Hover" | "Pressed" | "Disabled";

const SIZES: readonly Size[] = ["md", "lg"];
const STATES: readonly State[] = ["Default", "Hover", "Pressed", "Disabled"];

const px = (value: string): number => Number.parseFloat(value);

/** `sizes` 한 칸에서 수 하나. `$…` 사유와 한 객체에 섞여 있어 타입이 열려 있다 — 수가 아니면 던진다. */
function numberOf(spec: Record<string, unknown> | undefined, field: string, label: string): number {
  const value = spec?.[field];
  if (typeof value !== "number") throw new Error(`${label}.${field}가 수가 아닙니다`);
  return value;
}

function find(testId: string): HTMLElement {
  const node = document.querySelector(`[data-testid="${testId}"]`);
  if (node === null) throw new Error(`찾지 못했습니다: ${testId}`);
  return node as HTMLElement;
}

/** 상태마다 문서가 정한 마크업 — Pressed 는 켜짐(`aria-pressed`), Disabled 는 `disabled`. Hover 는 포인터를 얹어 만든다. */
function Item({ size, state }: { size: Size; state: State }): JSX.Element {
  const id = `${size}-${state}`;
  return (
    <div className="louis-floating-shell" data-size={size === "lg" ? "compact" : undefined}>
      <button
        type="button"
        className="louis-floating-shell__item"
        data-variant="ghost"
        data-testid={`item-${id}`}
        aria-label="선택"
        aria-pressed={state === "Pressed" ? "true" : "false"}
        disabled={state === "Disabled"}
      >
        <span className="louis-floating-shell__glyph" aria-hidden="true" data-testid={`glyph-${id}`}>
          <svg viewBox="0 0 20 20" />
        </span>
      </button>
    </div>
  );
}

for (const size of SIZES) {
  for (const state of STATES) {
    const key = `${size}/${state}`;
    test(`floating-shell-item ${key}: 상자 · 곡률 · 글리프가 기록과 같다`, async () => {
      await render(<Item size={size} state={state} />);
      const id = `${size}-${state}`;
      const spec = (measured.components["floating-shell-item"].sizes as Record<string, Record<string, unknown>>)[key];
      const label = `floating-shell-item.${key}`;
      const item = find(`item-${id}`);
      if (state === "Hover") await userEvent.hover(item);

      const box = item.getBoundingClientRect();
      const want = numberOf(spec, "size", label);
      expect(Math.round(box.width)).toBe(want);
      expect(Math.round(box.height)).toBe(want);
      // 계산값의 inline-size · block-size 도 같은 수여야 한다 — 상자가 부모 flex 에 늘어난 값이 아니라 선언임을 확인한다.
      const style = getComputedStyle(item);
      expect(px(style.width)).toBe(want);
      expect(px(style.height)).toBe(want);

      const radius = numberOf(spec, "radius", label);
      expect(px(style.borderTopLeftRadius)).toBe(radius);
      expect(px(style.borderTopRightRadius)).toBe(radius);
      expect(px(style.borderBottomRightRadius)).toBe(radius);
      expect(px(style.borderBottomLeftRadius)).toBe(radius);

      const glyph = find(`glyph-${id}`).getBoundingClientRect();
      const glyphSize = numberOf(spec, "glyphSize", label);
      expect(Math.round(glyph.width)).toBe(glyphSize);
      expect(Math.round(glyph.height)).toBe(glyphSize);
    });
  }
}

test("floating-shell-divider divider: 폭 · 높이가 기록과 같다", async () => {
  await render(
    <div className="louis-floating-shell">
      <button type="button" className="louis-floating-shell__item" data-variant="ghost" aria-label="선택" />
      <span className="louis-floating-shell__divider" aria-hidden="true" data-testid="divider" />
      <button type="button" className="louis-floating-shell__item" data-variant="ghost" aria-label="이동" />
    </div>,
  );
  const spec = measured.components["floating-shell-divider"].sizes["divider"] as Record<string, unknown>;
  const width = numberOf(spec, "width", "floating-shell-divider.divider");
  const height = numberOf(spec, "height", "floating-shell-divider.divider");
  const divider = find("divider");
  const box = divider.getBoundingClientRect();
  expect(box.width).toBe(width);
  expect(Math.round(box.height)).toBe(height);
  const style = getComputedStyle(divider);
  expect(px(style.width)).toBe(width);
  expect(px(style.height)).toBe(height);
});
