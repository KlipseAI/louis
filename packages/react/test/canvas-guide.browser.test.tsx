// Canvas Guide(`.louis-canvas-guide`)의 레시피가 실제로 그 픽셀을 만드는지 잰다.
//
// **React 표면이 아니라 클래스 마크업을 렌더한다.** 정본은 packages/css/src/component/canvas-guide.css 이고 마크업은
// design/components/canvas-guide.md 의 예시 그대로다. 층은 캔버스 변환(이동 · 줌) 안에 선다 — 시험도 `scale()` 을 건 층 안에 그린다.
import type { JSX } from "react";
import { afterEach, expect, test } from "vitest";
import { render } from "vitest-browser-react";
import "@klipse-design/css/layers.css";
import "@klipse-design/css/tokens.css";
import "@klipse-design/css/styles.css";
import "../../css/src/component/canvas-guide.css";
import { contrastOn, find, parseColor, tokenColor } from "./fixtures/contrast";

afterEach(() => {
  document.documentElement.removeAttribute("data-theme");
});

/** 줌 50% 캔버스 — 바닥(`bg-canvas`) 위 변환 층, 노드 카드 하나와 세로 · 가로 스냅 선. */
function Canvas({ zoom = 0.5 }: { readonly zoom?: number }): JSX.Element {
  return (
    <div
      style={{ position: "relative", inlineSize: 400, blockSize: 300, overflow: "hidden", background: "var(--louis-color-bg-canvas)" }}
      data-testid="floor"
    >
      <div
        style={{ position: "absolute", inset: 0, transformOrigin: "0 0", transform: `scale(${zoom})` }}
        data-testid="viewport"
      >
        <div
          style={{ position: "absolute", left: 40, top: 40, inlineSize: 200, blockSize: 120, background: "var(--louis-color-bg-surface)" }}
          data-testid="card"
        />
        <svg className="louis-canvas-guide" aria-hidden="true" data-testid="layer">
          <line className="louis-canvas-guide__line" x1={40} y1={0} x2={40} y2={400} data-testid="vertical" />
          <line className="louis-canvas-guide__line" x1={0} y1={100} x2={600} y2={100} data-testid="horizontal" />
        </svg>
      </div>
    </div>
  );
}

test("층은 변환 층 전체를 덮고 포인터를 받지 않으며 넘침을 자르지 않는다", async () => {
  await render(<Canvas zoom={1} />);
  const layer = find("layer");
  const style = getComputedStyle(layer);
  expect(style.position).toBe("absolute");
  expect(style.pointerEvents).toBe("none");
  expect(style.overflow).toBe("visible");
  expect(style.zIndex).toBe("auto");
  const box = layer.getBoundingClientRect();
  const viewport = find("viewport").getBoundingClientRect();
  expect(box.left).toBe(viewport.left);
  expect(box.top).toBe(viewport.top);
  expect(box.width).toBe(viewport.width);
  expect(box.height).toBe(viewport.height);
  // 선 위를 눌러도 아래 카드가 받는다.
  const card = find("card").getBoundingClientRect();
  expect(document.elementFromPoint(card.left + 1, card.top + 60)).toBe(find("card"));
});

test("선은 줌과 무관하게 화면 1px 이다 — 두께가 변환을 따르지 않는다", async () => {
  await render(<Canvas zoom={0.5} />);
  const line = find("vertical");
  const style = getComputedStyle(line);
  expect(style.vectorEffect).toBe("non-scaling-stroke");
  expect(style.strokeWidth).toBe("1px");
  expect(style.fill).toBe("none");
});

for (const theme of ["light", "dark"] as const) {
  test(`${theme} — 선 색이 캔버스 바닥 · 노드 카드 위 모두 3:1 을 넘는다`, async () => {
    document.documentElement.setAttribute("data-theme", theme);
    await render(<Canvas />);
    const stroke = getComputedStyle(find("vertical")).stroke;
    expect(stroke).toBe(tokenColor("color-canvas-guide"));
    const floor = contrastOn(stroke, parseColor(getComputedStyle(find("floor")).backgroundColor));
    const card = contrastOn(stroke, parseColor(getComputedStyle(find("card")).backgroundColor));
    expect(floor, "바닥").toBeGreaterThanOrEqual(3);
    expect(card, "카드").toBeGreaterThanOrEqual(3);
  });
}
