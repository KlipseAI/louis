// figma/components.measured.json 의 **section-shell** 값을 코드가 여전히 만드는지 검증한다(DS-D-0035 (c), 2026-10-15 DS-D-0111).
//
// 기록의 키는 Figma 되읽기의 축 키(`<Viewport>/<Bleed>`)다. 뷰포트 칸마다 그 경계 안의 폭으로 렌더하고 기록의 필드를
// 계산값과 맞댄다 — 세로 · 좌우 여백과(bleed 가 아니면) 콘텐츠 최대 폭.
import { expect, test } from "vitest";
import { page } from "vitest/browser";
import { render } from "vitest-browser-react";
import measured from "../../../figma/components.measured.json" with { type: "json" };
import "@klipse-design/css/layers.css";
import "@klipse-design/css/tokens.css";
import "@klipse-design/css/styles.css";
import { find, px } from "./fixtures/contrast";

const VIEWPORT: Record<string, number> = { "≥960": 1280, "≤959": 959, "≤719": 719, "≤640": 640, "≤355": 355 };

for (const key of Object.keys(measured.components["section-shell"].sizes)) {
  test(`section-shell ${key} — 기록이 레시피의 계산값과 같다`, async () => {
    const [viewport, bleed] = key.split("/") as [string, string];
    await page.viewport(VIEWPORT[viewport]!, 800);
    await render(
      <section className="louis-section-shell" data-bleed={bleed === "true" ? "true" : undefined} data-testid="shell">
        <div className="louis-section-shell__content" data-testid="content">
          콘텐츠
        </div>
      </section>,
    );
    const spec = measured.components["section-shell"].sizes[key as keyof typeof measured.components["section-shell"]["sizes"]] as Record<string, unknown>;
    const shell = getComputedStyle(find("shell"));
    expect(px(shell.paddingTop), "block").toBe(spec.block);
    expect(px(shell.paddingBottom), "block").toBe(spec.block);
    expect(px(shell.paddingLeft), "inline").toBe(spec.inline);
    if (spec.contentMax !== undefined) expect(px(getComputedStyle(find("content")).maxWidth), "contentMax").toBe(spec.contentMax);
  });
}
