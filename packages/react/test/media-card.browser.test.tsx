// figma/components.measured.json 의 **media-card** 값을 LOUIS 레시피(packages/css/src/component/media-card.css)가 여전히 만드는지
// 실브라우저에서 잰다(DS-D-0035 (c), 2026-10-14 DS-D-0099).
//
// 기록은 제품 MediaCard.tsx 의 클래스를 제품 Tailwind 로 잰 값이다(measure-product-components). parity 게이트는 Figma 가 그 기록과
// 같은지만 보므로, 레시피가 조용히 바뀌면 **Figma 와 기록은 서로 맞고 둘 다 코드와 틀린** 상태로 초록이 된다. 이 파일이 그 반대 방향이다.
// 문서 Acceptance tests 의 1 · 2 · 3 · 4 · 5 · 6 · 9 도 함께 잰다.
import type { JSX } from "react";
import { afterEach, expect, test } from "vitest";
import { page } from "vitest/browser";
import { render } from "vitest-browser-react";
import measured from "../../../figma/components.measured.json" with { type: "json" };
import "@klipse-design/css/layers.css";
import "@klipse-design/css/tokens.css";
import "@klipse-design/css/styles.css";
import { find, parseColor, px, tokenColor } from "./fixtures/contrast";

const base = measured.components["media-card"].sizes.base as Record<string, unknown>;
function spec(field: string): number {
  const value = base[field];
  if (typeof value !== "number") throw new Error(`media-card.sizes.base.${field}가 수가 아닙니다`);
  return value;
}

// 견본 사진 — 2×2 체크무늬 SVG. 사진이 무엇이든 기하는 같아야 한다.
const PHOTO =
  "data:image/svg+xml;utf8," +
  encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="2" height="2"><rect width="1" height="1" fill="#335"/><rect x="1" y="1" width="1" height="1" fill="#335"/><rect x="1" width="1" height="1" fill="#ccd"/><rect y="1" width="1" height="1" fill="#ccd"/></svg>');

function Card({ layout, testId, badge = true }: { readonly layout?: "carousel" | "grid"; readonly testId: string; readonly badge?: boolean }): JSX.Element {
  return (
    <article className="louis-media-card" data-layout={layout} data-testid={testId}>
      <img className="louis-media-card__media" src={PHOTO} alt="파형이 겹쳐 흐르는 보라색 추상 화면" data-testid={`${testId}-media`} />
      {badge ? (
        <span className="louis-media-card__badge" data-testid={`${testId}-badge`}>
          New
        </span>
      ) : null}
      <div className="louis-media-card__info" data-testid={`${testId}-info`}>
        <div className="louis-media-card__name-row" data-testid={`${testId}-row`}>
          <svg className="louis-media-card__glyph" viewBox="0 0 16 16" aria-hidden="true" data-testid={`${testId}-glyph`} />
          <span className="louis-media-card__title" data-testid={`${testId}-title`}>
            ElevenLabs
          </span>
        </div>
        <p className="louis-media-card__description" data-testid={`${testId}-description`}>
          Music &amp; Effects
        </p>
      </div>
    </article>
  );
}

afterEach(async () => {
  await page.viewport(1440, 900);
});

test("카드 · 배지 · 정보 바의 기하가 기록 base 의 항목마다 같다", async () => {
  await page.viewport(1440, 900);
  await render(<Card testId="card" />);
  const card = find("card");
  const box = card.getBoundingClientRect();
  expect(box.width).toBe(spec("width"));
  expect(box.height).toBe(spec("height"));
  const cardStyle = getComputedStyle(card);
  expect(px(cardStyle.borderTopLeftRadius)).toBe(spec("radius"));
  expect(px(cardStyle.paddingTop)).toBe(spec("paddingBlock"));
  expect(px(cardStyle.paddingLeft)).toBe(spec("paddingInline"));
  expect(cardStyle.overflow).toBe("hidden");

  const badge = find("card-badge");
  const badgeBox = badge.getBoundingClientRect();
  const badgeStyle = getComputedStyle(badge);
  expect(badgeBox.height).toBe(spec("badgeHeight"));
  expect(px(badgeStyle.paddingTop)).toBe(spec("badgePaddingBlock"));
  expect(px(badgeStyle.paddingLeft)).toBe(spec("badgePaddingInline"));
  expect(px(badgeStyle.borderTopLeftRadius)).toBe(spec("badgeRadius"));
  expect(px(badgeStyle.fontSize)).toBe(spec("badgeFontSize"));
  expect(px(badgeStyle.lineHeight)).toBe(spec("badgeLineHeight"));
  // 배지는 카드 모서리에서 16 — Figma TopBar 의 안쪽 16 이 같은 자리를 만든다(DS-D-0099).
  expect(badgeBox.left - box.left).toBe(spec("badgeInset"));
  expect(badgeBox.top - box.top).toBe(spec("badgeInset"));

  // 정보 바 — 높이 하나가 아니라 항별로 잰다(Acceptance 3).
  const info = getComputedStyle(find("card-info"));
  expect(px(info.paddingTop)).toBe(spec("infoPaddingBlockStart"));
  expect(px(info.paddingBottom)).toBe(spec("infoPaddingBlockEnd"));
  expect(px(info.paddingLeft)).toBe(spec("infoPaddingInline"));
  expect(px(info.paddingRight)).toBe(spec("infoPaddingInline"));
  const row = find("card-row");
  expect(px(getComputedStyle(row).columnGap)).toBe(spec("nameRowGap"));
  expect(row.getBoundingClientRect().height).toBe(spec("titleLineHeight"));
  const description = find("card-description");
  expect(px(getComputedStyle(description).marginTop)).toBe(spec("infoGap"));
  expect(description.getBoundingClientRect().height).toBeCloseTo(spec("descriptionLineHeight"), 0);
  const title = getComputedStyle(find("card-title"));
  expect(px(title.fontSize)).toBe(spec("titleFontSize"));
  expect(px(title.lineHeight)).toBe(spec("titleLineHeight"));
  expect(px(getComputedStyle(description).fontSize)).toBe(spec("descriptionFontSize"));
  const sum =
    spec("infoPaddingBlockStart") + spec("titleLineHeight") + spec("infoGap") + spec("descriptionLineHeight") + spec("infoPaddingBlockEnd");
  expect(find("card-info").getBoundingClientRect().height).toBeCloseTo(sum, 0);
  // 정보 바는 카드 바닥에 붙는다.
  expect(find("card-info").getBoundingClientRect().bottom).toBeCloseTo(box.bottom, 1);
  const glyph = find("card-glyph").getBoundingClientRect();
  expect(glyph.width).toBe(16);
});

test("carousel 박스만 스냅을 갖고 grid 는 칸을 따라 정사각이다", async () => {
  await page.viewport(1440, 900);
  await render(
    <>
      <Card testId="carousel" />
      <div style={{ inlineSize: 345.5 }}>
        <Card testId="grid" layout="grid" />
      </div>
    </>,
  );
  expect(getComputedStyle(find("carousel")).scrollSnapAlign).toContain("start");
  expect(getComputedStyle(find("grid")).scrollSnapAlign).toContain("none");
  const grid = find("grid").getBoundingClientRect();
  expect(grid.width).toBeCloseTo(345.5, 1);
  expect(grid.height).toBeCloseTo(345.5, 1);
});

test("959 이하에서 carousel 박스가 min(316px, 46vw) 로 줄고 480 이하에서 글자가 한 단 낮아진다", async () => {
  await page.viewport(375, 800);
  await render(<Card testId="narrow" />);
  const box = find("narrow").getBoundingClientRect();
  expect(box.width).toBeCloseTo(375 * 0.46, 1);
  expect(box.height).toBeCloseTo(375 * 0.46, 1);
  expect(px(getComputedStyle(find("narrow-title")).fontSize)).toBe(16);
  expect(px(getComputedStyle(find("narrow-description")).fontSize)).toBe(12);
  // 데스크톱 폭에서는 316 상한 그대로다 — 687 위에서 46vw 가 316 을 넘기 때문이다.
  await page.viewport(800, 800);
  expect(find("narrow").getBoundingClientRect().width).toBe(316);
});

test("흐림은 띠가 아니라 그 아래 한 층에 있고 마스크로 감쇠한다 — 배지와 같은 반경 blur-surface", async () => {
  await render(<Card testId="blur" />);
  const info = getComputedStyle(find("blur-info"));
  const layer = getComputedStyle(find("blur-info"), "::before");
  // 띠 자체에 마스크가 걸리면 글자가 함께 지워진다(Acceptance 4).
  expect(info.maskImage === "none" || info.maskImage === "").toBe(true);
  expect(layer.maskImage).toContain("linear-gradient");
  const radius = getComputedStyle(document.documentElement).getPropertyValue("--louis-blur-surface").trim();
  expect(layer.backdropFilter).toBe(`blur(${radius})`);
  expect(getComputedStyle(find("blur-badge")).backdropFilter).toBe(`blur(${radius})`);
  // 정보 바 tint 는 제품 흰색 1% 다 — Figma 의 static-white-alpha/04 와 다르게 레시피는 정본 값을 갖는다(DS-D-0099).
  expect(parseColor(layer.backgroundColor)[3]).toBeCloseTo(0.01, 4);
});

test("글자 · 배지 · 글리프가 미디어 전경 토큰에서 오고 두 테마에서 같다", async () => {
  await render(<Card testId="ink" />);
  const values: string[] = [];
  for (const theme of ["light", "dark"] as const) {
    document.documentElement.setAttribute("data-theme", theme);
    const fg = tokenColor("color-media-foreground-dark");
    expect(getComputedStyle(find("ink-title")).color, `${theme} 이름`).toBe(fg);
    expect(getComputedStyle(find("ink-badge")).color, `${theme} 배지`).toBe(fg);
    expect(getComputedStyle(find("ink-glyph")).color, `${theme} 글리프`).toBe(fg);
    expect(getComputedStyle(find("ink-description")).color, `${theme} 설명`).toBe(tokenColor("color-media-foreground-dark-soft"));
    values.push(getComputedStyle(find("ink-title")).color);
  }
  document.documentElement.removeAttribute("data-theme");
  expect(new Set(values).size).toBe(1);
  // 사진에 대체 텍스트가 있고 이름과 같은 문구가 아니다(Acceptance 8).
  const alt = find("ink-media").getAttribute("alt") ?? "";
  expect(alt.length).toBeGreaterThan(0);
  expect(alt).not.toBe(find("ink-title").textContent);
});
