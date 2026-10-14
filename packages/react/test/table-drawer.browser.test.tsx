// figma/components.measured.json 의 **table-drawer** 값을 LOUIS 레시피가 여전히 만드는지 잰다(DS-D-0035 (c), DS-D-0107).
//
// 정본은 packages/css/src/component/table-drawer.css 이고 마크업은 design/components/table-drawer.md 의 Usage 그대로다(펼친 행의 colspan 칸 안).
// React 표면이 없어 클래스 마크업을 렌더한다.
import { afterEach, expect, test } from "vitest";
import { render } from "vitest-browser-react";
import measured from "../../../figma/components.measured.json" with { type: "json" };
import "@klipse-design/css/layers.css";
import "@klipse-design/css/tokens.css";
import "@klipse-design/css/styles.css";
import "../../css/src/component/table-drawer.css";
import { contrastOn, find, parseColor, px, tokenColor } from "./fixtures/contrast";

afterEach(() => {
  document.documentElement.removeAttribute("data-theme");
});

const spec = measured.components["table-drawer"].sizes.drawer;

function Host() {
  return (
    <div style={{ inlineSize: 720, padding: 16, background: "var(--louis-color-bg-surface)" }}>
      <table className="louis-table">
        <tbody>
          <tr>
            <td colSpan={6}>
              <div className="louis-table-drawer" id="drawer-1" data-testid="drawer">
                <div className="louis-table-drawer__head" data-testid="head">
                  <span className="louis-table-drawer__title" data-testid="title">
                    여름 세일 · 릴스 광고 — 가입 계정 24
                  </span>
                  <span className="louis-table-drawer__meta" data-testid="meta">
                    광고 ID 120210000000000
                    <button type="button" className="louis-icon-button" data-size="sm" data-variant="ghost" aria-label="광고 ID 복사">
                      <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true">
                        <rect x="4" y="4" width="8" height="8" fill="none" stroke="currentColor" />
                      </svg>
                    </button>
                  </span>
                </div>
                <div className="louis-table-drawer__body">
                  <table className="louis-table">
                    <thead>
                      <tr>
                        <th scope="col">가입</th>
                        <th scope="col">계정</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>10-14 21:00</td>
                        <td>user@example.com</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <button type="button" className="louis-button" data-variant="secondary" data-size="md" data-testid="more">
                  10명 더 보기
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

test("table-drawer: 여백 · 간격 · 반경 · 머리 · 보조 묶음 · 글자가 기록과 같고 「더 보기」가 왼쪽에 선다", async () => {
  await render(<Host />);
  const label = "table-drawer.drawer";
  const drawer = find("drawer");
  const style = getComputedStyle(drawer);
  for (const side of ["Top", "Right", "Bottom", "Left"] as const) {
    expect(px(style[`padding${side}`]), `${label} padding${side}`).toBe(spec.padding);
  }
  expect(px(style.rowGap), `${label} gap`).toBe(spec.gap);
  expect(px(style.borderTopLeftRadius), `${label} radius`).toBe(spec.radius);
  expect(px(getComputedStyle(find("head")).columnGap), `${label} headGap`).toBe(spec.headGap);
  expect(px(getComputedStyle(find("meta")).columnGap), `${label} metaGap`).toBe(spec.metaGap);
  expect(px(getComputedStyle(find("title")).fontSize), `${label} titleFontSize`).toBe(spec.titleFontSize);
  expect(px(getComputedStyle(find("meta")).fontSize), `${label} metaFontSize`).toBe(spec.metaFontSize);
  const box = drawer.getBoundingClientRect();
  const more = find("more").getBoundingClientRect();
  expect(more.left, "더 보기 왼쪽").toBe(box.left + spec.padding);
  expect(more.width, "더 보기는 늘어나지 않는다").toBeLessThan(box.width - spec.padding * 2);
});

for (const theme of ["light", "dark"] as const) {
  test(`${theme} — 면이 bg-raised + 헤어라인이고 제목 · 보조 글이 4.5:1 을 넘는다`, async () => {
    document.documentElement.setAttribute("data-theme", theme);
    await render(<Host />);
    const style = getComputedStyle(find("drawer"));
    expect(style.backgroundColor).toBe(tokenColor("color-bg-raised", "backgroundColor"));
    expect(style.boxShadow, "헤어라인 inset").toContain("inset");
    const ground = parseColor(style.backgroundColor);
    const title = getComputedStyle(find("title")).color;
    const meta = getComputedStyle(find("meta")).color;
    expect(title).toBe(tokenColor("color-fg-primary"));
    expect(meta).toBe(tokenColor("color-fg-tertiary"));
    for (const [part, ink] of [["title", title], ["meta", meta]] as const) {
      const ratio = contrastOn(ink, ground);
      expect(ratio, `${theme} ${part} ${ratio.toFixed(2)}`).toBeGreaterThanOrEqual(4.5);
    }
  });
}
