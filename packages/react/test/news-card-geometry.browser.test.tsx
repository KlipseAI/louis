// figma/components.measured.json 의 **news-card** 값을 LOUIS 레시피가 여전히 만드는지 검증한다(DS-D-0035 (c)).
//
// 기록의 값은 제품 클래스를 실브라우저에서 잰 것이고(scripts/measure-product-components.mjs), parity 게이트는 Figma 를 그
// 기록과 맞댄다. 이 파일은 반대 방향 — `packages/css/src/component/news-card.css` 가 같은 수를 만드는지 — 를 잰다.
// React 표면이 없어 문서의 클래스 마크업을 렌더한다. 폭 · 높이는 카드가 아니라 **트랙 격자**가 정하므로 레시피의
// `.louis-news-card-track` 을 조상으로 세우고 격자가 계산하게 둔다 — 698 = 346 × 2 + 6, 326 = 160 × 2 + 6 을 여기서
// 적지 않는다. 960 이상 값이라 1280 폭에서 잰다.
import { expect, test } from "vitest";
import { page } from "vitest/browser";
import { render } from "vitest-browser-react";
import measured from "../../../figma/components.measured.json" with { type: "json" };
import "@klipse-design/css/layers.css";
import "@klipse-design/css/tokens.css";
import "@klipse-design/css/styles.css";
import "../../css/src/component/news-card.css";
import { find, px } from "./fixtures/contrast";

function num(spec: Record<string, unknown>, field: string, label: string): number {
  const value = spec[field];
  if (typeof value !== "number") throw new Error(`${label}.${field}가 수가 아닙니다`);
  return value;
}

function Card({ featured, measuredAs }: { featured: boolean; measuredAs?: string }) {
  const id = (part: string) => (measuredAs === undefined ? undefined : `${measuredAs}${part}`);
  return (
    <article className="louis-news-card" data-featured={featured ? "" : undefined} data-testid={id("")}>
      {featured ? <div className="louis-news-card__scrim" aria-hidden="true" /> : null}
      <div className="louis-news-card__body" data-testid={id("-body")}>
        <time className="louis-news-card__date" dateTime="2026-02-18" data-testid={id("-date")}>
          2026년 2월 18일
        </time>
        <h3 className="louis-news-card__headline" data-testid={id("-headline")}>
          디테일 컨트롤 · 카메라 옵션 · 오토 에이전트 추가
        </h3>
      </div>
    </article>
  );
}

test("news-card: 트랙 안에서 보통 · 피처드의 폭 · 높이 · 여백 · 반경 · Body 간격 · 글자가 기록과 같다", async () => {
  await page.viewport(1280, 800);
  await render(
    <div className="louis-news-card-track">
      <Card featured measuredAs="news-card-true" />
      <Card featured={false} measuredAs="news-card-false" />
      <Card featured={false} />
      <Card featured={false} />
      <Card featured={false} />
    </div>,
  );
  for (const key of ["false", "true"] as const) {
    const spec = measured.components["news-card"].sizes[key] as Record<string, unknown>;
    const label = `news-card.${key}`;
    const root = find(`news-card-${key}`);
    const style = getComputedStyle(root);
    const rect = root.getBoundingClientRect();
    expect(rect.width, `${label} width`).toBe(num(spec, "width", label));
    expect(rect.height, `${label} height`).toBe(num(spec, "height", label));
    expect(px(style.paddingTop), `${label} paddingTop`).toBe(num(spec, "paddingBlock", label));
    expect(px(style.paddingBottom), `${label} paddingBottom`).toBe(num(spec, "paddingBlock", label));
    expect(px(style.paddingLeft), `${label} paddingLeft`).toBe(num(spec, "paddingInline", label));
    expect(px(style.paddingRight), `${label} paddingRight`).toBe(num(spec, "paddingInline", label));
    expect(px(style.borderTopLeftRadius), `${label} radius`).toBe(num(spec, "radius", label));
    // 계약: 카드에 gap 선언이 없고(itemSpacing 0) 세로 배치다.
    expect(style.flexDirection, `${label} direction`).toBe("column");
    expect(style.rowGap, `${label} gap`).toBe("normal");
    const body = getComputedStyle(find(`news-card-${key}-body`));
    expect(px(body.rowGap), `${label} bodyGap`).toBe(num(spec, "bodyGap", label));
    const date = getComputedStyle(find(`news-card-${key}-date`));
    expect(px(date.fontSize), `${label} dateFontSize`).toBe(num(spec, "dateFontSize", label));
    const headline = getComputedStyle(find(`news-card-${key}-headline`));
    expect(px(headline.fontSize), `${label} headlineFontSize`).toBe(num(spec, "headlineFontSize", label));
    expect(px(headline.lineHeight), `${label} headlineLineHeight`).toBe(num(spec, "headlineLineHeight", label));
    // 계약의 lineHeightPercent 150 — 줄 높이 ÷ 글자 크기.
    expect(px(headline.lineHeight) / px(headline.fontSize), `${label} lineHeightPercent`).toBe(1.5);
  }
});
