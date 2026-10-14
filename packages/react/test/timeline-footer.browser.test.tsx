// Timeline Footer(`.louis-timeline-footer`)의 레시피가 실제로 그 픽셀을 만드는지 잰다(DS-D-0116).
//
// **React 표면이 아니라 클래스 마크업을 렌더한다.** 정본은 packages/css/src/component/timeline-footer.css 이고 마크업은
// design/components/timeline-footer.md 의 예시와 같다(fixtures/timeline-footer.tsx). 푸터는 늘 다크다 — 루트의 `data-theme="dark"` 가 램프를 고정하므로
// 문서 테마가 라이트여도 같은 그림이어야 한다.
import { afterEach, expect, test } from "vitest";
import { page } from "vitest/browser";
import { render } from "vitest-browser-react";
import "@klipse-design/css/layers.css";
import "@klipse-design/css/tokens.css";
import "@klipse-design/css/styles.css";
import { backdrop, contrastOn, find, px, textContrast } from "./fixtures/contrast";
import { TimelineFooterMarkup } from "./fixtures/timeline-footer";

afterEach(() => {
  document.documentElement.removeAttribute("data-theme");
});

test("1440 — 머리 줄 26 / 48 / 18 · 사이 20, 워드마크 24, 소셜 32 · 반경 8 · 사이 2", async () => {
  await page.viewport(1440, 900);
  await render(<TimelineFooterMarkup />);
  const bar = getComputedStyle(find("bar"));
  expect(px(bar.paddingTop)).toBe(26);
  expect(px(bar.paddingLeft)).toBe(48);
  expect(px(bar.paddingBottom)).toBe(18);
  expect(px(bar.columnGap)).toBe(20);
  expect(find("wordmark").getBoundingClientRect().height).toBe(24);
  const link = find("social-link").getBoundingClientRect();
  expect([link.width, link.height]).toEqual([32, 32]);
  expect(px(getComputedStyle(find("social-link")).borderTopLeftRadius)).toBe(8);
  expect(px(getComputedStyle(find("social")).columnGap)).toBe(2);
});

test("1440 — 타임라인 168 칸 · 눈금 28 · 트랙 48 · 레인 사이 12 · 클립 32 · 반경 6 · 좌우 12", async () => {
  await page.viewport(1440, 900);
  await render(<TimelineFooterMarkup />);
  expect(find("ruler-head").getBoundingClientRect().width).toBe(168);
  expect(find("ruler").getBoundingClientRect().height).toBe(28);
  expect(find("head-product").getBoundingClientRect().height).toBe(48);
  expect(find("lane-product").getBoundingClientRect().height).toBe(48);
  expect(px(getComputedStyle(find("lane-product")).columnGap)).toBe(12);
  const clip = getComputedStyle(find("clip-product-0"));
  expect(px(clip.height)).toBe(32);
  expect(px(clip.borderTopLeftRadius)).toBe(6);
  expect(px(clip.paddingLeft)).toBe(12);
  // 레인 시작 자리 · 클립 최소 폭은 트랙마다 다르다(%).
  const lane = find("lane-social").getBoundingClientRect();
  expect(Math.round(px(getComputedStyle(find("lane-social")).paddingLeft))).toBe(Math.round(lane.width * 0.3));
  // 클립 최소 폭 %는 레인의 내용 상자(패딩을 뺀 폭)에 대해 풀린다 — 제품 `min-w-[22%]` 와 같다.
  const trust = getComputedStyle(find("lane-trust"));
  const trustContent = find("lane-trust").clientWidth - px(trust.paddingLeft) - px(trust.paddingRight);
  expect(find("clip-trust-0").getBoundingClientRect().width).toBeGreaterThanOrEqual(Math.floor(trustContent * 0.22) - 1);
  // 재생헤드는 레인의 40.5% 자리에 1px.
  const timeline = find("timeline").getBoundingClientRect();
  const head = find("playhead").getBoundingClientRect();
  expect(head.width).toBe(1);
  expect(Math.abs(head.left - (timeline.left + 168 + (timeline.width - 168) * 0.405))).toBeLessThan(1);
});

test("375 — 이름 칸 44 · 이름은 보조기기에만 · 레인 줄바꿈 · 안쪽 8 · 메모와 태그라인 숨김 · 상태 줄 세로", async () => {
  await page.viewport(375, 900);
  await render(<TimelineFooterMarkup />);
  expect(find("ruler-head").getBoundingClientRect().width).toBe(44);
  expect(find("name-product").getBoundingClientRect().width).toBe(1);
  const lane = getComputedStyle(find("lane-trust"));
  expect(lane.flexWrap).toBe("wrap");
  expect(px(lane.paddingLeft)).toBe(8);
  expect(px(lane.columnGap)).toBe(6);
  expect(getComputedStyle(find("note-social-0")).display).toBe("none");
  expect(getComputedStyle(find("tagline")).display).toBe("none");
  expect(getComputedStyle(find("ruler-label-1")).display).toBe("none");
  expect(getComputedStyle(find("status")).flexDirection).toBe("column");
  expect(px(getComputedStyle(find("bar")).paddingLeft)).toBe(20);
  expect(px(getComputedStyle(find("bar")).paddingTop)).toBe(20);
});

test("문서 테마와 무관하게 다크이고 글자 대비가 4.5:1 을 넘는다", async () => {
  await page.viewport(1440, 900);
  const measured: Record<string, number> = {};
  const surfaces: string[] = [];
  for (const theme of ["light", "dark"] as const) {
    document.documentElement.setAttribute("data-theme", theme);
    const screen = await render(<TimelineFooterMarkup />);
    surfaces.push(getComputedStyle(find("footer")).backgroundColor);
    for (const id of ["tagline", "biz-label", "biz-value", "copyright", "name-product", "clip-product-0", "clip-trust-2", "clip-resources-1"]) {
      measured[`${theme}/${id}`] = textContrast(find(id));
    }
    // 시각 글자는 재생헤드 위 22 — 선 밖, 푸터 면 위에 선다(조상을 따라가면 주색 선이 바탕으로 잡힌다).
    measured[`${theme}/timecode`] = contrastOn(getComputedStyle(find("timecode")).color, backdrop(find("footer")));
    await screen.unmount();
  }
  expect(surfaces[0]).toBe(surfaces[1]);
  for (const [key, value] of Object.entries(measured)) {
    // 준비중 클립(aria-disabled)은 비활성 글자라 WCAG 1.4.3 예외다 — 그래도 3:1 은 지킨다.
    expect(value, key).toBeGreaterThanOrEqual(key.endsWith("clip-resources-1") ? 3 : 4.5);
  }
  // 실측(2026-10-15, 두 문서 테마 같음): 태그라인 · 사업자 값 · 트랙 이름 7.93, 사업자 라벨 · 저작권 5.75(제품 gray-500 은 약 4.0 — fg-tertiary 로 고침),
  // 클립 13.97 · 14.00, 준비중 클립 5.29, 시각 5.37.
});

test("lead 는 푸터 바로 위 160 에 선다", async () => {
  await page.viewport(1440, 900);
  await render(<TimelineFooterMarkup lead />);
  const lead = find("lead").getBoundingClientRect();
  const footer = find("footer").getBoundingClientRect();
  expect(lead.height).toBe(160);
  expect(lead.bottom).toBe(footer.top);
});
