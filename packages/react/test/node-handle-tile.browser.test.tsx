// figma/components.measured.json 의 **node-handle-tile** 값을 LOUIS 레시피가 여전히 만드는지 잰다(DS-D-0035 (c), DS-D-0108).
//
// 정본은 packages/css/src/component/node-handle-tile.css 이고 마크업은 design/components/node-handle-tile.md 의 Usage 그대로다. React 표면이 없어
// 클래스 마크업을 렌더한다. 채널 여섯 각각이 기록의 그 채널 칸을 되잰다.
import { afterEach, expect, test } from "vitest";
import { render } from "vitest-browser-react";
import measured from "../../../figma/components.measured.json" with { type: "json" };
import "@klipse-design/css/layers.css";
import "@klipse-design/css/tokens.css";
import "@klipse-design/css/styles.css";
import "../../css/src/component/node-handle-tile.css";
import { contrastOn, find, parseColor, px, tokenColor } from "./fixtures/contrast";

afterEach(() => {
  document.documentElement.removeAttribute("data-theme");
});

const CHANNELS = ["image", "text", "edit", "audio", "youtube", "instagram"] as const;
const sizes = measured.components["node-handle-tile"].sizes;

function Tiles() {
  return (
    <span className="louis-node-handle-tile-group" data-testid="group">
      {CHANNELS.map((channel) => (
        <span key={channel} className="louis-node-handle-tile" data-channel={channel} aria-hidden="true" data-testid={`tile-${channel}`}>
          <svg viewBox="0 0 16 16" data-testid={`glyph-${channel}`}>
            <path d="M3 8h10" stroke="currentColor" />
          </svg>
        </span>
      ))}
    </span>
  );
}

test("node-handle-tile: 채널 여섯의 타일 · 반경 · 글리프가 기록과 같고 묶음 간격이 2 다", async () => {
  await render(<Tiles />);
  for (const channel of CHANNELS) {
    const spec = sizes[channel];
    const label = `node-handle-tile.${channel}`;
    const tile = find(`tile-${channel}`);
    const rect = tile.getBoundingClientRect();
    expect([rect.width, rect.height], `${label} size`).toEqual([spec.size, spec.size]);
    expect(px(getComputedStyle(tile).borderTopLeftRadius), `${label} radius`).toBe(spec.radius);
    const glyph = find(`glyph-${channel}`).getBoundingClientRect();
    expect([glyph.width, glyph.height], `${label} glyphSize`).toEqual([spec.glyphSize, spec.glyphSize]);
  }
  expect(px(getComputedStyle(find("group")).columnGap)).toBe(2);
});

for (const theme of ["light", "dark"] as const) {
  test(`${theme} — 면이 채널 토큰 · 잉크가 fg-on-danger 이고 글리프가 면 위에서 사라지지 않는다(장식 — 대비를 잰다)`, async () => {
    document.documentElement.setAttribute("data-theme", theme);
    await render(<Tiles />);
    const ratios: string[] = [];
    for (const channel of CHANNELS) {
      const style = getComputedStyle(find(`tile-${channel}`));
      expect(style.backgroundColor, `${channel} 면`).toBe(tokenColor(`color-node-handle-icon-${channel}`, "backgroundColor"));
      expect(style.color, `${channel} 잉크`).toBe(tokenColor("color-fg-on-danger"));
      const ratio = contrastOn(style.color, parseColor(style.backgroundColor));
      ratios.push(`${channel} ${ratio.toFixed(2)}`);
      expect(ratio, `${theme} ${channel} ${ratio.toFixed(2)}`).toBeGreaterThanOrEqual(1.5);
    }
    console.info(`[node-handle-tile] ${theme} 글리프 대비: ${ratios.join(" · ")}`);
  });
}
