// Plan Tier Card(`.louis-plan-tier-card`)의 레시피가 실제로 그 틀 · 줄 · 바닥 묶음 · 덱 · 좁은 화면 · 대비를 만드는지 잰다(DS-D-0091).
//
// **React 표면이 아니라 클래스 마크업을 렌더한다.** 정본은 packages/css/src/component/plan-tier-card.css 이고 마크업은
// design/components/plan-tier-card.md 의 예시 그대로다. 1199 · 719 · 479 가 뷰포트 질의라 시험이 뷰포트를 스스로 정한다.
// 대비는 토큰 값으로 손 계산하지 않고 계산 색을 카드 면(`bg-raised`) 위에서 잰다(fixtures/contrast).
import type { CSSProperties, JSX } from "react";
import { afterEach, beforeEach, expect, test } from "vitest";
import { page } from "vitest/browser";
import { render } from "vitest-browser-react";
import "@klipse-design/css/layers.css";
import "@klipse-design/css/tokens.css";
import "@klipse-design/css/styles.css";
import { backdrop, contrastOn, find, parseColor, px, ratio, textContrast, tokenColor } from "./fixtures/contrast";

beforeEach(async () => {
  await page.viewport(1440, 900);
});

afterEach(async () => {
  document.documentElement.removeAttribute("data-theme");
  await page.viewport(1440, 900);
});

const GROUND: CSSProperties = { background: "var(--louis-color-bg-canvas)", padding: 16, inlineSize: 1300, maxInlineSize: "100%", boxSizing: "border-box" };

function Check({ testId }: { readonly testId?: string }): JSX.Element {
  return (
    <span className="louis-plan-tier-card__feature-icon" aria-hidden="true" data-testid={testId}>
      <svg className="louis-icon" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="2" />
      </svg>
    </span>
  );
}

/** 문서 예시의 덱 — 현재 · 할인 · 예약 안내 카드 하나와, 원가 빈 줄 카드 넷. */
function Deck({ deckStyle }: { readonly deckStyle?: CSSProperties }): JSX.Element {
  return (
    <div style={GROUND}>
      <div className="louis-plan-tier-deck" style={deckStyle} data-testid="deck">
        <article className="louis-plan-tier-card" aria-labelledby="tier-plus" data-current="true" data-testid="card">
          <div className="louis-plan-tier-card__head" data-testid="head">
            <h3 className="louis-plan-tier-card__name" id="tier-plus" data-testid="name">
              Plus
            </h3>
            <p className="louis-plan-tier-card__description" data-testid="description">
              혼자 만드는 크리에이터를 위한 플랜
            </p>
          </div>
          <span className="louis-plan-tier-card__price-original" data-testid="original">
            <span className="louis-visually-hidden">정가 </span>39,900원
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
            <strong className="louis-plan-tier-card__credits-amount" data-testid="credits-amount">
              16,500
            </strong>
            <span>크레딧 지급</span>
          </div>
          <p className="louis-plan-tier-card__includes" data-testid="includes">
            Lite의 모든 기능 포함
          </p>
          <ul className="louis-plan-tier-card__features" data-testid="features">
            <li className="louis-plan-tier-card__feature" data-testid="feature">
              <Check testId="icon" />
              <button type="button" className="louis-bare-button louis-plan-tier-card__feature-term" data-testid="term">
                프로젝트 최대 12개
              </button>
            </li>
            <li className="louis-plan-tier-card__feature" data-testid="feature-plain">
              <Check />
              <span data-testid="feature-text">하이라이트 자동 생성</span>
            </li>
          </ul>
          <p className="louis-plan-tier-card__note" data-testid="note">
            부가세 포함 가격입니다.
          </p>
          <div className="louis-plan-tier-card__notice" data-testid="notice">
            <span className="louis-plan-tier-card__notice-label" data-testid="notice-label">
              다운그레이드 예약됨
            </span>
            <button className="louis-button louis-plan-tier-card__notice-action" data-variant="ghost" data-size="md" type="button" data-testid="notice-action">
              예약 취소
            </button>
          </div>
          <button className="louis-button louis-plan-tier-card__cta" data-variant="inverse" data-size="md" type="button" disabled data-testid="cta">
            현재 플랜
          </button>
        </article>
        {[1, 2, 3, 4].map((index) => (
          <article key={index} className="louis-plan-tier-card" aria-label={`티어 ${index}`} data-testid={`other-${index}`}>
            <div className="louis-plan-tier-card__head">
              <h3 className="louis-plan-tier-card__name">티어 {index}</h3>
            </div>
            <span className="louis-plan-tier-card__price-original" data-placeholder="true" aria-hidden="true" data-testid={index === 1 ? "placeholder" : undefined}>
              {"\u00a0"}
            </span>
            <div className="louis-plan-tier-card__price" data-testid={index === 1 ? "price-2" : undefined}>
              <strong className="louis-plan-tier-card__amount">0원</strong>
            </div>
            <div className="louis-plan-tier-card__credits">
              <strong className="louis-plan-tier-card__credits-amount">500</strong>
              <span>크레딧 지급</span>
            </div>
            <ul className="louis-plan-tier-card__features">
              <li className="louis-plan-tier-card__feature">
                <Check />
                <span>프로젝트 최대 3개</span>
              </li>
            </ul>
            <button className="louis-button louis-plan-tier-card__cta" data-variant="inverse" data-size="md" type="button" data-testid={index === 1 ? "cta-2" : undefined}>
              시작하기
            </button>
          </article>
        ))}
      </div>
    </div>
  );
}

const style = (testId: string): CSSStyleDeclaration => getComputedStyle(find(testId));
const rect = (testId: string): DOMRect => find(testId).getBoundingClientRect();

test("틀 — 안쪽 16 · 반경 12 · 최소 높이 560 · bg-raised 면 · 헤어라인 · fg-primary", async () => {
  await render(<Deck />);
  const card = style("other-1");
  expect(px(card.paddingTop)).toBe(16);
  expect(px(card.paddingLeft)).toBe(16);
  expect(px(card.borderTopLeftRadius)).toBe(12);
  expect(px(card.minHeight)).toBe(560);
  expect(rect("other-1").height).toBeGreaterThanOrEqual(560);
  expect(card.backgroundColor).toBe(tokenColor("color-bg-raised", "backgroundColor"));
  expect(card.boxShadow).not.toBe("none");
  expect(card.color).toBe(tokenColor("color-fg-primary"));
});

test("현재 플랜 — 2px accent-primary 안쪽 링", async () => {
  await render(<Deck />);
  const shadow = style("card").boxShadow;
  expect(shadow).toContain("inset");
  expect(shadow).toContain(" 2px");
  const accent = tokenColor("color-accent-primary");
  expect(shadow.startsWith(accent) || shadow.includes(accent)).toBe(true);
});

test("줄 — 머리 사이 16 · 원가 위 10 · 원가 뒤 가격 위 0 · 가격 사이 8 · 크레딧 위 4 아래 24 · 포함 위 12 · 목록 위 8 아래 18 · 줄 사이 4", async () => {
  await render(<Deck />);
  expect(px(style("head").rowGap)).toBe(16);
  expect(px(style("original").marginTop)).toBe(10);
  expect(px(style("price").marginTop)).toBe(0);
  expect(px(style("price").columnGap)).toBe(8);
  expect(px(style("credits").marginTop)).toBe(4);
  expect(px(style("credits").paddingBottom)).toBe(24);
  expect(px(style("includes").marginTop)).toBe(12);
  expect(px(style("features").marginTop)).toBe(8);
  expect(px(style("features").marginBottom)).toBe(18);
  expect(px(style("features").rowGap)).toBe(4);
  expect(px(style("feature").columnGap)).toBe(8);
  expect(style("feature").gridTemplateColumns.startsWith("18px")).toBe(true);
  expect(px(style("amount").fontSize)).toBe(36);
  expect(px(style("period").paddingBottom)).toBe(4);
  expect(style("original").textDecorationLine).toBe("line-through");
  expect(style("credits-amount").fontWeight).toBe(style("credits").fontWeight);
});

test("원가 빈 줄 — 자리는 같고 보이지 않으며, 할인 카드와 가격 줄 윗변이 같다", async () => {
  await render(<Deck />);
  expect(style("placeholder").visibility).toBe("hidden");
  expect(rect("placeholder").height).toBeCloseTo(rect("original").height, 1);
  const own = rect("price").top - rect("card").top;
  const other = rect("price-2").top - rect("other-1").top;
  // 할인 카드에는 설명이 있어 머리가 더 높다 — 같은 머리 높이로 견준다.
  const ownHead = rect("head").height;
  const otherHead = (find("other-1").querySelector(".louis-plan-tier-card__head") as HTMLElement).getBoundingClientRect().height;
  expect(own - ownHead).toBeCloseTo(other - otherHead, 1);
});

test("체크 아이콘 — 18 × 18, 기능 첫 줄 가운데와 ±0.5", async () => {
  await render(<Deck />);
  const icon = rect("icon");
  expect(icon.width).toBeCloseTo(18, 1);
  expect(icon.height).toBeCloseTo(18, 1);
  const line = px(style("feature").lineHeight);
  const lineCentre = rect("feature").top + line / 2;
  expect(Math.abs(icon.top + icon.height / 2 - lineCentre)).toBeLessThanOrEqual(0.5);
  expect(style("icon").color).toBe(tokenColor("color-plan-tier-card-feature-icon"));
});

test("상세 트리거 — 줄과 같은 글자 · 점선 밑줄 · 도움 커서", async () => {
  await render(<Deck />);
  const term = style("term");
  const text = style("feature-text");
  expect(term.fontSize).toBe(text.fontSize);
  expect(term.fontWeight).toBe(text.fontWeight);
  expect(term.lineHeight).toBe(text.lineHeight);
  expect(term.fontFamily).toBe(text.fontFamily);
  expect(term.color).toBe(text.color);
  expect(term.textDecorationLine).toBe("underline");
  expect(term.textDecorationStyle).toBe("dotted");
  expect(term.cursor).toBe("help");
  expect(term.textDecorationColor).toBe(tokenColor("color-stroke-underline"));
});

test("바닥 묶음 — 기능 목록 다음 하나만 남은 높이를 먹고 나머지는 8, CTA 는 카드 안쪽 폭 · 바닥", async () => {
  await render(<Deck />);
  // 현재 카드 — 메모가 auto, 안내 · CTA 는 8.
  expect(rect("note").top - rect("features").bottom).toBeGreaterThan(18);
  expect(rect("notice").top - rect("note").bottom).toBeCloseTo(8, 1);
  expect(rect("cta").top - rect("notice").bottom).toBeCloseTo(8, 1);
  // 빈 줄 카드 — 목록 바로 다음 CTA 가 auto 로 바닥에 선다.
  const card = rect("other-1");
  expect(card.bottom - 16 - rect("cta-2").bottom).toBeCloseTo(0, 1);
  expect(rect("cta-2").width).toBeCloseTo(card.width - 32, 1);
  expect(rect("cta").width).toBeCloseTo(rect("card").width - 32, 1);
  // 같은 줄 카드는 늘여 높이가 같다.
  expect(rect("card").height).toBeCloseTo(card.height, 1);
});

test("예약 안내 — 위아래 8 · 좌우 12 · 사이 8 · 반경 8 · 선 1(잉크 12%) · 면 잉크 4%, 버튼은 한 줄", async () => {
  await render(<Deck />);
  const notice = style("notice");
  expect(px(notice.paddingTop)).toBe(8);
  expect(px(notice.paddingLeft)).toBe(12);
  expect(px(notice.columnGap)).toBe(8);
  expect(px(notice.borderTopLeftRadius)).toBe(8);
  expect(px(notice.borderTopWidth)).toBe(1);
  expect(notice.borderTopColor).toBe(tokenColor("color-gray-000-alpha-12"));
  expect(notice.backgroundColor).toBe(tokenColor("color-gray-000-alpha-04", "backgroundColor"));
  expect(style("notice-action").whiteSpace).toBe("nowrap");
  expect(style("notice-action").flexShrink).toBe("0");
});

test("덱 — 1200 이상 5열 · 1199 이하 2열 · 사이 4, 소비처가 변수로 1열", async () => {
  await render(<Deck />);
  expect(style("deck").gridTemplateColumns.split(" ")).toHaveLength(5);
  expect(px(style("deck").columnGap)).toBe(4);
  await page.viewport(1199, 900);
  await expect.poll(() => style("deck").gridTemplateColumns.split(" ").length).toBe(2);
  document.body.replaceChildren();
  await render(<Deck deckStyle={{ "--louis-plan-tier-deck-columns": "1" } as CSSProperties} />);
  expect(style("deck").gridTemplateColumns.split(" ")).toHaveLength(1);
});

test("좁은 화면 — 719 이하 안쪽 12 · 최소 높이 없음, 479 이하 금액 28", async () => {
  await render(<Deck />);
  await page.viewport(720, 900);
  await expect.poll(() => px(style("other-1").paddingTop)).toBe(16);
  expect(px(style("other-1").minHeight)).toBe(560);
  await page.viewport(719, 900);
  await expect.poll(() => px(style("other-1").paddingTop)).toBe(12);
  expect(style("other-1").minHeight).toMatch(/^(auto|0px)$/);
  expect(px(style("amount").fontSize)).toBe(36);
  await page.viewport(479, 900);
  await expect.poll(() => px(style("amount").fontSize)).toBe(28);
});

test("호버 규칙이 없다 — 카드는 누르는 것이 아니다", () => {
  const offenders: string[] = [];
  const walk = (rules: CSSRuleList): void => {
    for (const rule of Array.from(rules)) {
      if (rule instanceof CSSMediaRule || rule instanceof CSSLayerBlockRule) walk(rule.cssRules);
      else if (rule instanceof CSSStyleRule && rule.selectorText.includes("louis-plan-tier") && rule.selectorText.includes(":hover")) {
        offenders.push(rule.selectorText);
      }
    }
  };
  for (const sheet of Array.from(document.styleSheets)) walk(sheet.cssRules);
  expect(offenders).toEqual([]);
});

for (const theme of ["light", "dark"] as const) {
  test(`대비(${theme}) — 원가 · 글자 4.5 이상, 현재 링 3 이상(실측)`, async () => {
    document.documentElement.setAttribute("data-theme", theme);
    await render(<Deck />);
    const values = {
      name: textContrast(find("name")),
      description: textContrast(find("description")),
      original: textContrast(find("original")),
      amount: textContrast(find("amount")),
      period: textContrast(find("period")),
      credits: textContrast(find("credits")),
      includes: textContrast(find("includes")),
      feature: textContrast(find("feature-text")),
      term: textContrast(find("term")),
      note: textContrast(find("note")),
      noticeLabel: textContrast(find("notice-label")),
    };
    for (const [name, value] of Object.entries(values)) expect(value, `${theme} ${name}`).toBeGreaterThanOrEqual(4.5);
    const ground = backdrop(find("card"));
    const ring = contrastOn(tokenColor("color-accent-primary"), ground);
    expect(ring, `${theme} ring`).toBeGreaterThanOrEqual(3);
    // 장식 체크(aria-hidden, 줄마다 같은 표식)는 1.4.11 대상이 아니다 — 문서의 수(라이트 2.22 · 다크 7.78)가 그대로인지만 본다(DS-D-0091 판정 4).
    const icon = ratio(parseColor(style("icon").color), ground);
    expect(icon, `${theme} icon`).toBeCloseTo(theme === "light" ? 2.22 : 7.78, 1);
  });
}
