// figma/components.measured.json 의 **plan-tier-card · plan-tier-card-feature · plan-tier-card-notice** 값을 코드가 여전히 만드는지 검증한다
// (DS-D-0035 (c), 2026-10-14 DS-D-0091).
//
// parity 게이트는 Figma 가 기록과 같은지만 본다. 이 파일이 없으면 CSS 가 조용히 바뀌어도 **Figma 와 기록은 서로 맞고 둘 다
// 코드와 틀린** 상태로 통과한다. 그래서 기록의 키(= Figma 되읽기의 축 키)마다 클래스 마크업을 렌더하고 기록의 필드를 계산값과 맞댄다.
// compact 는 719 이하 뷰포트다. 대비 · 바닥 묶음 · 덱은 plan-tier-card.browser.test.tsx 가 소유한다.
import type { JSX } from "react";
import { beforeEach, expect, test } from "vitest";
import { page } from "vitest/browser";
import { render } from "vitest-browser-react";
import measured from "../../../figma/components.measured.json" with { type: "json" };
import "@klipse-design/css/layers.css";
import "@klipse-design/css/tokens.css";
import "@klipse-design/css/styles.css";
import { find, px } from "./fixtures/contrast";

type Sizes = Record<string, Record<string, unknown>>;

function num(spec: Record<string, unknown>, field: string, label: string): number {
  const value = spec[field];
  if (typeof value !== "number") throw new Error(`${label}.${field}가 수가 아닙니다`);
  return value;
}

function Card({ current }: { readonly current: boolean }): JSX.Element {
  return (
    <div style={{ inlineSize: 260 }}>
      <article className="louis-plan-tier-card" data-current={current ? "true" : undefined} aria-label="Plus" data-testid="card">
        <div className="louis-plan-tier-card__head" data-testid="head">
          <h3 className="louis-plan-tier-card__name">Plus</h3>
          <p className="louis-plan-tier-card__description">설명</p>
        </div>
        <span className="louis-plan-tier-card__price-original" data-testid="original">
          39,900원
        </span>
        <div className="louis-plan-tier-card__price" data-testid="price">
          <strong className="louis-plan-tier-card__amount" data-testid="amount">
            29,900원
          </strong>
          <span className="louis-plan-tier-card__period" data-testid="period">
            매월
          </span>
        </div>
        <div className="louis-plan-tier-card__credits" data-testid="credits">
          <strong className="louis-plan-tier-card__credits-amount">16,500</strong>
          <span>크레딧 지급</span>
        </div>
        <p className="louis-plan-tier-card__includes" data-testid="includes">
          Lite의 모든 기능 포함
        </p>
        <ul className="louis-plan-tier-card__features" data-testid="features">
          <li className="louis-plan-tier-card__feature" data-testid="feature">
            <span className="louis-plan-tier-card__feature-icon" aria-hidden="true" data-testid="icon" />
            <span data-testid="feature-text">프로젝트 최대 12개</span>
          </li>
          <li className="louis-plan-tier-card__feature" data-testid="feature-term-row">
            <span className="louis-plan-tier-card__feature-icon" aria-hidden="true" data-testid="icon-term" />
            <button type="button" className="louis-bare-button louis-plan-tier-card__feature-term" data-testid="term">
              하이라이트 자동 생성
            </button>
          </li>
        </ul>
        <p className="louis-plan-tier-card__note" data-testid="note">
          메모
        </p>
        <div className="louis-plan-tier-card__notice" data-testid="notice">
          <span className="louis-plan-tier-card__notice-label" data-testid="notice-label">
            다운그레이드 예약됨
          </span>
          <button className="louis-button louis-plan-tier-card__notice-action" data-variant="ghost" data-size="md" type="button">
            예약 취소
          </button>
        </div>
        <button className="louis-button louis-plan-tier-card__cta" data-variant="inverse" data-size="md" type="button" data-testid="cta">
          시작하기
        </button>
      </article>
    </div>
  );
}

beforeEach(async () => {
  await page.viewport(1440, 900);
});

const style = (testId: string): CSSStyleDeclaration => getComputedStyle(find(testId));
const rect = (testId: string): DOMRect => find(testId).getBoundingClientRect();
const card = measured.components["plan-tier-card"].sizes as Sizes;
const feature = measured.components["plan-tier-card-feature"].sizes as Sizes;
const notice = measured.components["plan-tier-card-notice"].sizes as Sizes;

test("기록의 키가 Figma 의 축과 같다", () => {
  expect(Object.keys(card).sort()).toEqual(["false/base", "false/compact", "true/base", "true/compact"]);
  expect(Object.keys(feature).sort()).toEqual(["false", "true"]);
  expect(Object.keys(notice)).toEqual(["base"]);
});

for (const [key, spec] of Object.entries(card)) {
  test(`plan-tier-card ${key} — 기록의 기하를 코드가 만든다`, async () => {
    const [selected, layout] = key.split("/") as ["false" | "true", "base" | "compact"];
    await page.viewport(layout === "compact" ? 719 : 1440, 900);
    await render(<Card current={selected === "true"} />);
    const root = style("card");
    expect(px(root.paddingTop), "padding").toBe(num(spec, "padding", key));
    expect(px(root.paddingLeft), "padding").toBe(num(spec, "padding", key));
    expect(px(root.borderTopWidth), "borderWidth").toBe(num(spec, "borderWidth", key));
    expect(px(root.borderTopLeftRadius), "radius").toBe(num(spec, "radius", key));
    const minHeight = num(spec, "minHeight", key);
    if (minHeight === 0) expect(root.minHeight, "minHeight").toMatch(/^(auto|0px)$/);
    else expect(px(root.minHeight), "minHeight").toBe(minHeight);
    expect(px(style("head").rowGap), "headGap").toBe(num(spec, "headGap", key));
    expect(px(style("original").marginTop), "pricingOffset").toBe(num(spec, "pricingOffset", key));
    expect(px(style("price").columnGap), "priceGap").toBe(num(spec, "priceGap", key));
    expect(px(style("amount").fontSize), "amountSize").toBe(num(spec, "amountSize", key));
    expect(px(style("period").paddingBottom), "periodPaddingBottom").toBe(num(spec, "periodPaddingBottom", key));
    expect(px(style("credits").columnGap), "creditsGap").toBe(num(spec, "creditsGap", key));
    expect(px(style("credits").marginTop), "creditsOffset").toBe(num(spec, "creditsOffset", key));
    expect(px(style("credits").paddingBottom), "creditsPaddingBottom").toBe(num(spec, "creditsPaddingBottom", key));
    expect(px(style("includes").marginTop), "includesOffset").toBe(num(spec, "includesOffset", key));
    expect(px(style("features").rowGap), "featuresGap").toBe(num(spec, "featuresGap", key));
    expect(px(style("features").marginTop), "featuresOffset").toBe(num(spec, "featuresOffset", key));
    expect(px(style("features").marginBottom), "featuresMarginBottom").toBe(num(spec, "featuresMarginBottom", key));
    // 바닥 묶음 — 둘째부터 사이 8(첫째는 auto).
    expect(rect("cta").top - rect("notice").bottom, "bottomGap").toBeCloseTo(num(spec, "bottomGap", key), 1);
    expect(px(style("note").paddingTop), "noteOffset").toBe(num(spec, "noteOffset", key));
  });
}

for (const [key, spec] of Object.entries(feature)) {
  test(`plan-tier-card-feature ${key} — 기록의 기하를 코드가 만든다`, async () => {
    await render(<Card current={false} />);
    const row = key === "true" ? "feature-term-row" : "feature";
    const icon = key === "true" ? "icon-term" : "icon";
    expect(px(style(row).columnGap), "gap").toBe(num(spec, "gap", key));
    expect(rect(icon).width, "iconSize").toBeCloseTo(num(spec, "iconSize", key), 1);
    expect(rect(icon).height, "iconSize").toBeCloseTo(num(spec, "iconSize", key), 1);
    expect(px(style(icon).marginTop), "iconOffset").toBeCloseTo(num(spec, "iconOffset", key), 1);
    expect(px(style(key === "true" ? "term" : "feature-text").fontSize), "fontSize").toBe(num(spec, "fontSize", key));
  });
}

test("plan-tier-card-notice base — 기록의 기하를 코드가 만든다", async () => {
  const spec = notice.base as Record<string, unknown>;
  await render(<Card current={false} />);
  const box = style("notice");
  expect(px(box.paddingTop), "paddingBlock").toBe(num(spec, "paddingBlock", "base"));
  expect(px(box.paddingLeft), "paddingInline").toBe(num(spec, "paddingInline", "base"));
  expect(px(box.borderTopWidth), "borderWidth").toBe(num(spec, "borderWidth", "base"));
  expect(px(box.columnGap), "gap").toBe(num(spec, "gap", "base"));
  expect(px(box.borderTopLeftRadius), "radius").toBe(num(spec, "radius", "base"));
  expect(px(style("notice-label").fontSize), "labelFontSize").toBe(num(spec, "labelFontSize", "base"));
});
