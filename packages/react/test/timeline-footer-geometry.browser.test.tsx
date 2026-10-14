// figma/components.measured.json 의 **timeline-footer · timeline-footer-clip** 값을 코드가 여전히 만드는지 검증한다(DS-D-0035 (c), 2026-10-15 DS-D-0116).
// 기록의 키(= Figma 되읽기의 축 키)마다 그 뷰포트로 클래스 마크업을 렌더하고 필드를 계산값과 맞댄다.
import { expect, test } from "vitest";
import { page } from "vitest/browser";
import { render } from "vitest-browser-react";
import measured from "../../../figma/components.measured.json" with { type: "json" };
import "@klipse-design/css/layers.css";
import "@klipse-design/css/tokens.css";
import "@klipse-design/css/styles.css";
import { find, px } from "./fixtures/contrast";
import { TimelineFooterMarkup } from "./fixtures/timeline-footer";

const VIEWPORT: Record<string, number> = { "≥720": 1440, "≤719": 375 };

for (const key of Object.keys(measured.components["timeline-footer"].sizes)) {
  test(`timeline-footer ${key} — 기록이 레시피의 계산값과 같다`, async () => {
    await page.viewport(VIEWPORT[key]!, 900);
    await render(<TimelineFooterMarkup />);
    const spec = measured.components["timeline-footer"].sizes[key as keyof typeof measured.components["timeline-footer"]["sizes"]] as Record<string, unknown>;
    const bar = getComputedStyle(find("bar"));
    expect(px(bar.paddingTop), "barPaddingTop").toBe(spec.barPaddingTop);
    expect(px(bar.paddingBottom), "barPaddingBottom").toBe(spec.barPaddingBottom);
    expect(px(bar.paddingLeft), "inline").toBe(spec.inline);
    expect(px(bar.columnGap), "barGap").toBe(spec.barGap);
    expect(px(getComputedStyle(find("brand")).columnGap), "brandGap").toBe(spec.brandGap);
    expect(find("wordmark").getBoundingClientRect().height, "wordmarkHeight").toBe(spec.wordmarkHeight);
    expect(px(getComputedStyle(find("social")).columnGap), "socialGap").toBe(spec.socialGap);
    expect(find("social-link").getBoundingClientRect().width, "socialSize").toBe(spec.socialSize);
    expect(px(getComputedStyle(find("social-link")).borderTopLeftRadius), "socialRadius").toBe(spec.socialRadius);
    expect(find("ruler-head").getBoundingClientRect().width, "headWidth").toBe(spec.headWidth);
    expect(find("ruler").getBoundingClientRect().height, "rulerHeight").toBe(spec.rulerHeight);
    expect(find("head-product").getBoundingClientRect().width, "headWidth").toBe(spec.headWidth);
    expect(find("lane-product").getBoundingClientRect().height, "trackHeight").toBe(spec.trackHeight);
    expect(px(getComputedStyle(find("head-product")).columnGap), "trackHeadGap").toBe(spec.trackHeadGap);
    expect(px(getComputedStyle(find("lane-product")).paddingRight), "lanePaddingEnd").toBe(spec.lanePaddingEnd);
    expect(find("playhead").getBoundingClientRect().width, "playheadWidth").toBe(spec.playheadWidth);
    const status = getComputedStyle(find("status"));
    expect(px(status.paddingTop), "statusPaddingTop").toBe(spec.statusPaddingTop);
    expect(px(status.paddingBottom), "statusPaddingBottom").toBe(spec.statusPaddingBottom);
    expect(px(status.paddingLeft), "inline").toBe(spec.inline);
    expect(px(getComputedStyle(find("biz")).columnGap), "bizGap").toBe(spec.bizGap);
  });
}

for (const key of Object.keys(measured.components["timeline-footer-clip"].sizes)) {
  test(`timeline-footer-clip ${key} — 기록이 레시피의 계산값과 같다`, async () => {
    await page.viewport(1440, 900);
    await render(<TimelineFooterMarkup />);
    const spec = measured.components["timeline-footer-clip"].sizes[key as "true" | "false"] as Record<string, unknown>;
    const clip = getComputedStyle(find(key === "true" ? "clip-product-0" : "clip-resources-1"));
    expect(px(clip.height), "height").toBe(spec.height);
    expect(px(clip.paddingLeft), "paddingInline").toBe(spec.paddingInline);
    expect(px(clip.columnGap), "gap").toBe(spec.gap);
    expect(px(clip.borderTopLeftRadius), "radius").toBe(spec.radius);
    expect(clip.boxShadow.includes(`${spec.borderWidth}px`), "borderWidth").toBe(true);
  });
}
