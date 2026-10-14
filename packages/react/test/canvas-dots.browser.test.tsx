// figma/components.measured.json 의 **canvas-dots** 값을 LOUIS 레시피(`.louis-canvas-dots`)가 여전히 만드는지 잰다(DS-D-0035 (c), DS-D-0102).
//
// 정본은 packages/css/src/pattern/editor-workspace.css 이고 마크업은 design/components/canvas-dots.md 의 예시 그대로다. 점은 DOM 노드가
// 아니라 반복 원형 그라디언트라, 격자는 계산된 `background-size` 로, 점 지름은 그라디언트 정지점(반지름)으로 잰다.
import { afterEach, expect, test } from "vitest";
import { render } from "vitest-browser-react";
import measured from "../../../figma/components.measured.json" with { type: "json" };
import "@klipse-design/css/layers.css";
import "@klipse-design/css/tokens.css";
import "@klipse-design/css/styles.css";
import "../../css/src/pattern/editor-workspace.css";
import { contrastOn, find, parseColor, px, tokenColor } from "./fixtures/contrast";

afterEach(() => {
  document.documentElement.removeAttribute("data-theme");
});

const spec = measured.components["canvas-dots"].sizes.tile;

function Floor({ scale }: { readonly scale?: number }) {
  const style: Record<string, string | number> = { inlineSize: 240, blockSize: 240 };
  if (scale !== undefined) style["--louis-canvas-dots-scale"] = String(scale);
  return <div className="louis-canvas-dots" style={style} data-testid="floor" />;
}

/** `radial-gradient(circle, <점> 0px, <점> Rpx, transparent Rpx)` 에서 마지막 정지점 R(반지름)을 꺼낸다. */
function radius(image: string): number {
  const stops = [...image.matchAll(/(\d+(?:\.\d+)?)px/g)].map((match) => Number(match[1]));
  const last = stops.at(-1);
  if (last === undefined) throw new Error(`정지점을 찾지 못했습니다: ${image}`);
  return last;
}

test("canvas-dots: 격자 간격과 점 지름이 기록과 같고, 줌 배율이 둘을 함께 키운다", async () => {
  await render(
    <div style={{ display: "grid", gap: 8 }}>
      <Floor />
    </div>,
  );
  const style = getComputedStyle(find("floor"));
  const [width, height] = style.backgroundSize.split(" ").map(px);
  expect(width, "pitch").toBe(spec.pitch);
  expect(height, "pitch").toBe(spec.pitch);
  expect(radius(style.backgroundImage) * 2, "dot").toBe(spec.dot);
  expect(style.backgroundImage.startsWith("radial-gradient(circle")).toBe(true);
});

test("canvas-dots: 줌 0.5 에서 격자 · 점이 반으로 준다 — 점은 캔버스 좌표에 박혀 있다", async () => {
  await render(<Floor scale={0.5} />);
  const style = getComputedStyle(find("floor"));
  expect(px(style.backgroundSize.split(" ")[0] ?? ""), "pitch × 0.5").toBe(spec.pitch / 2);
  expect(radius(style.backgroundImage) * 2, "dot × 0.5").toBe(spec.dot / 2);
});

for (const theme of ["light", "dark"] as const) {
  test(`${theme} — 면은 bg-canvas · 점은 canvas-dot 이고 점이 바닥에서 사라지지 않는다(장식 — 1.2:1 이상을 잰다)`, async () => {
    document.documentElement.setAttribute("data-theme", theme);
    await render(<Floor />);
    const style = getComputedStyle(find("floor"));
    expect(style.backgroundColor).toBe(tokenColor("color-bg-canvas", "backgroundColor"));
    const dot = tokenColor("color-canvas-dot");
    expect(style.backgroundImage.includes(dot), "점 잉크").toBe(true);
    const ratio = contrastOn(dot, parseColor(style.backgroundColor));
    expect(ratio, `${theme} 점 대비 ${ratio.toFixed(2)}`).toBeGreaterThanOrEqual(1.2);
  });
}
