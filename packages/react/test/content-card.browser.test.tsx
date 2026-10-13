// Content Card(`.louis-content-card`)의 레시피가 실제로 그 배치 · 접힘 · 랜딩 제목 계단 · 호버 · 대비를 만드는지 잰다(DS-D-0088).
//
// **React 표면이 아니라 클래스 마크업을 렌더한다.** 정본은 packages/css/src/component/content-card.css 이고 마크업은
// design/components/content-card.md 의 예시 그대로다. 719 접힘 · 1023 · 767 계단이 뷰포트 질의라 시험이 뷰포트를 스스로 정한다.
// 대비는 토큰 값으로 손 계산하지 않고 계산 색을 랜딩 바닥(`landing-page-bg`) 위에서 잰다(fixtures/contrast).
import type { CSSProperties, JSX } from "react";
import { afterEach, beforeEach, expect, test } from "vitest";
import { page, userEvent } from "vitest/browser";
import { render } from "vitest-browser-react";
import "@klipse-design/css/layers.css";
import "@klipse-design/css/tokens.css";
import "@klipse-design/css/styles.css";
import { find, px, textContrast, tokenColor } from "./fixtures/contrast";

beforeEach(async () => {
  await page.viewport(1440, 900);
});

afterEach(async () => {
  document.documentElement.removeAttribute("data-theme");
  await page.viewport(1440, 900);
});

const PIXEL = "data:image/gif;base64,R0lGODlhAQABAAAAACw=";
const GROUND: CSSProperties = { background: "var(--louis-color-landing-page-bg)", padding: 16, inlineSize: 1120, maxInlineSize: "100%", boxSizing: "border-box" };

/** 문서 예시의 row — 블로그 한 줄(두 장). */
function Row({ empty = false, ratio }: { readonly empty?: boolean; readonly ratio?: string }): JSX.Element {
  const style = ratio === undefined ? undefined : ({ "--louis-content-card-ratio": ratio } as CSSProperties);
  return (
    <div style={GROUND} data-testid="ground">
      <ul className="louis-content-card-list" data-testid="list">
        <li>
          <a className="louis-content-card" href="#post" style={style} data-testid="card">
            <div className="louis-content-card__body" data-testid="body">
              <h2 className="louis-content-card__title" data-testid="title">
                글 제목
              </h2>
              <p className="louis-content-card__description" data-testid="description">
                발췌 문장이 두 줄까지 이어집니다.
              </p>
              <span className="louis-content-card__meta" data-testid="meta">
                <time dateTime="2026-10-13">2026.10.13</time>
              </span>
            </div>
            {empty ? (
              <div className="louis-content-card__cover" data-empty="true" aria-hidden="true" data-testid="cover" />
            ) : (
              <div className="louis-content-card__cover" data-testid="cover">
                <img className="louis-content-card__media" src={PIXEL} alt="" data-testid="media" />
              </div>
            )}
          </a>
        </li>
        <li data-testid="second">
          <a className="louis-content-card" href="#post-2">
            <div className="louis-content-card__body">
              <h2 className="louis-content-card__title">둘째 글</h2>
            </div>
            <div className="louis-content-card__cover" data-empty="true" aria-hidden="true" />
          </a>
        </li>
      </ul>
    </div>
  );
}

/** 문서 예시의 stack — 템플릿 격자(세 장). */
function Stack(): JSX.Element {
  return (
    <div style={GROUND} data-testid="ground">
      <ul className="louis-content-card-list" data-layout="grid" data-testid="list">
        {[0, 1, 2, 3].map((index) => (
          <li key={index} data-testid={`cell-${index}`}>
            <a className="louis-content-card" data-layout="stack" href={`#t-${index}`} data-testid={index === 0 ? "card" : undefined}>
              <div className="louis-content-card__cover" data-testid={index === 0 ? "cover" : undefined}>
                <img className="louis-content-card__media" src={PIXEL} alt="" />
                <span className="louis-badge louis-content-card__badge" data-surface="media" aria-label="미디어 3개" data-testid={index === 0 ? "badge" : undefined}>
                  3
                </span>
              </div>
              <div className="louis-content-card__body" data-testid={index === 0 ? "body" : undefined}>
                <h2 className="louis-content-card__title" data-testid={index === 0 ? "title" : undefined}>
                  템플릿 이름
                </h2>
                <p className="louis-content-card__description" data-testid={index === 0 ? "description" : undefined}>
                  설명 두 줄
                </p>
              </div>
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** 줄인 모션 프로젝트(browser-reduced-motion)에서는 확대 · 떠오름이 서지 않아야 한다. */
const reduced = (): boolean => matchMedia("(prefers-reduced-motion: reduce)").matches;

const rect = (id: string): DOMRect => find(id).getBoundingClientRect();
const style = (id: string): CSSStyleDeclaration => getComputedStyle(find(id));

test("row — 커버 320 × 180 · 반경 12 · 오른쪽, 사이 24 · 본문 사이 8 · 메타 위 2, 면 없음", async () => {
  await render(<Row />);
  const cover = rect("cover");
  expect(cover.width).toBe(320);
  expect(cover.height).toBeCloseTo(180, 1);
  expect(px(style("cover").borderTopLeftRadius)).toBe(12);
  expect(style("cover").overflow).toBe("hidden");
  expect(cover.left - rect("body").right).toBeCloseTo(24, 1);
  expect(cover.right).toBeCloseTo(rect("card").right, 1);
  expect(rect("description").top - rect("title").bottom).toBeCloseTo(8, 1);
  expect(rect("meta").top - rect("description").bottom).toBeCloseTo(10, 1);
  expect(style("card").backgroundColor).toBe("rgba(0, 0, 0, 0)");
  expect(style("card").borderTopWidth).toBe("0px");
  expect(style("card").textDecorationLine).toBe("none");
  // 본문은 세로 가운데.
  const card = rect("card");
  const body = rect("body");
  expect(body.top + body.height / 2).toBeCloseTo(card.top + card.height / 2, 0);
  // 그림이 커버를 채운다.
  expect(rect("media").width).toBe(320);
  expect(style("media").objectFit).toBe("cover");
  // 목록 줄 사이 32.
  expect(rect("second").top - rect("card").bottom).toBeCloseTo(32, 1);
});

test("row 글자 — 제목 heading-sm medium 28 / 37.8 두 줄 자름, 설명 body-md 16 두 줄, 메타 caption 12", async () => {
  await render(<Row />);
  const title = style("title");
  expect(title.fontSize).toBe("28px");
  expect(px(title.lineHeight)).toBeCloseTo(37.8, 1);
  expect(title.fontWeight).toBe("500");
  expect(title.webkitLineClamp).toBe("2");
  expect(style("description").fontSize).toBe("16px");
  expect(style("description").webkitLineClamp).toBe("2");
  expect(style("meta").fontSize).toBe("12px");
  expect(style("title").color).toBe(tokenColor("color-fg-primary"));
  expect(style("description").color).toBe(tokenColor("color-landing-text-soft"));
  expect(style("meta").color).toBe(tokenColor("color-landing-text-muted"));
});

test("빈 커버 — 그라디언트, 같은 320 × 180", async () => {
  await render(<Row empty />);
  expect(style("cover").backgroundImage).toContain("linear-gradient");
  expect(rect("cover").width).toBe(320);
  expect(rect("cover").height).toBeCloseTo(180, 1);
});

test("비율 덮기 — --louis-content-card-ratio: 1 / 1 이면 320 × 320", async () => {
  await render(<Row ratio="1 / 1" />);
  expect(rect("cover").width).toBe(320);
  expect(rect("cover").height).toBeCloseTo(320, 1);
});

for (const [width, folded] of [
  [720, false],
  [719, true],
  [375, true],
] as const) {
  test(`${width} — row ${folded ? "접힘(그림 위 · 폭 채움 · 사이 12, 줄 40)" : "가로"}`, async () => {
    await page.viewport(width, 900);
    await render(<Row />);
    const cover = rect("cover");
    const body = rect("body");
    if (folded) {
      expect(cover.bottom).toBeLessThanOrEqual(body.top + 0.5);
      expect(body.top - cover.bottom).toBeCloseTo(12, 1);
      expect(cover.width).toBeCloseTo(rect("card").width, 1);
      expect(cover.height).toBeCloseTo((cover.width * 9) / 16, 1);
      expect(rect("second").top - rect("card").bottom).toBeCloseTo(40, 1);
    } else {
      expect(cover.width).toBe(320);
      expect(cover.left).toBeGreaterThan(body.right);
      expect(rect("second").top - rect("card").bottom).toBeCloseTo(32, 1);
    }
  });
}

for (const [width, rowSize, stackSize] of [
  [1024, 28, 20],
  [1023, 18, 18],
  [768, 18, 18],
  [767, 18, 16],
] as const) {
  test(`${width} — 랜딩 제목 계단 row ${rowSize} · stack ${stackSize}`, async () => {
    await page.viewport(width, 900);
    const row = await render(<Row />);
    expect(px(style("title").fontSize)).toBe(rowSize);
    if (rowSize === 18) expect(px(style("title").letterSpacing)).toBeCloseTo(-0.18, 2);
    await row.unmount();
    await render(<Stack />);
    expect(px(style("title").fontSize)).toBe(stackSize);
  });
}

test("stack — 반경 16 · 선 1(8%) · 잉크 4% 면 · 커버 4:3 카드 폭 · 본문 18 / 18 / 20 · 배지 오른쪽 위 12", async () => {
  await render(<Stack />);
  const card = style("card");
  expect(px(card.borderTopLeftRadius)).toBe(16);
  expect(card.borderTopWidth).toBe("1px");
  expect(card.borderTopColor).toBe(tokenColor("color-gray-000-alpha-08"));
  expect(card.backgroundColor).toBe(tokenColor("color-gray-000-alpha-04", "backgroundColor"));
  expect(card.overflow).toBe("hidden");
  const cardBox = rect("card");
  const cover = rect("cover");
  expect(cover.width).toBeCloseTo(cardBox.width - 2, 1);
  expect(cover.height).toBeCloseTo((cover.width * 3) / 4, 1);
  expect(cover.top - cardBox.top).toBeCloseTo(1, 1);
  expect(style("cover").backgroundColor).toBe(tokenColor("color-media-stage-surface", "backgroundColor"));
  const body = style("body");
  expect([body.paddingTop, body.paddingRight, body.paddingBottom, body.paddingLeft]).toEqual(["18px", "18px", "20px", "18px"]);
  expect(style("title").fontSize).toBe("20px");
  expect(px(style("title").lineHeight)).toBeCloseTo(30, 1);
  expect(style("title").webkitLineClamp).toBe("none");
  expect(style("description").fontSize).toBe("14px");
  const badge = rect("badge");
  expect(cover.right - badge.right).toBeCloseTo(12, 1);
  expect(badge.top - cover.top).toBeCloseTo(12, 1);
  expect(style("badge").backgroundColor).toBe(tokenColor("color-media-badge-surface", "backgroundColor"));
});

test("격자 — 최소 300 트랙 · 줄 28 · 열 24", async () => {
  await render(<Stack />);
  const list = style("list");
  expect(list.display).toBe("grid");
  expect(list.rowGap).toBe("28px");
  expect(list.columnGap).toBe("24px");
  // 1088 안쪽 폭 → 300 트랙 셋.
  const a = rect("cell-0");
  const b = rect("cell-1");
  const d = rect("cell-3");
  expect(a.width).toBeGreaterThanOrEqual(300);
  expect(b.left - a.right).toBeCloseTo(24, 1);
  expect(d.top).toBeGreaterThan(a.bottom);
});

test("row 호버 — 제목 잉크가 content-card-title-hover, 그림 105%(줄인 모션에서는 확대 없음)", async () => {
  await render(<Row />);
  await userEvent.hover(find("card"));
  await expect.poll(() => style("title").color).toBe(tokenColor("color-content-card-title-hover"));
  if (reduced()) expect(style("media").scale).toBe("none");
  else await expect.poll(() => style("media").scale).toBe("1.05");
  await userEvent.unhover(find("card"));
});

test("stack 호버 — 선 16% · 4 떠오름(줄인 모션에서는 떠오름 없음)", async () => {
  await render(<Stack />);
  await userEvent.hover(find("card"));
  await expect.poll(() => style("card").borderTopColor).toBe(tokenColor("color-gray-000-alpha-16"));
  if (reduced()) expect(style("card").translate).toBe("none");
  else await expect.poll(() => style("card").translate).toBe("0px -4px");
  await userEvent.unhover(find("card"));
});

test("호버 규칙은 전부 (hover: hover) 안이다", () => {
  const offenders: string[] = [];
  const walk = (rules: CSSRuleList, guarded: boolean): void => {
    for (const rule of Array.from(rules)) {
      if (rule instanceof CSSMediaRule) walk(rule.cssRules, guarded || rule.conditionText.includes("hover: hover"));
      else if (rule instanceof CSSLayerBlockRule) walk(rule.cssRules, guarded);
      else if (rule instanceof CSSStyleRule && rule.selectorText.includes("louis-content-card") && rule.selectorText.includes(":hover") && !guarded) {
        offenders.push(rule.selectorText);
      }
    }
  };
  for (const sheet of Array.from(document.styleSheets)) walk(sheet.cssRules, false);
  expect(offenders).toEqual([]);
});

const measured: Record<string, Record<string, number>> = {};

for (const theme of ["light", "dark"] as const) {
  test(`${theme} — 제목 · 호버 제목 · 발췌 · 날짜 · stack 설명의 글자 대비를 랜딩 바닥 위에서 잰다`, async () => {
    document.documentElement.setAttribute("data-theme", theme);
    const row = await render(<Row />);
    const title = textContrast(find("title"));
    const description = textContrast(find("description"));
    const meta = textContrast(find("meta"));
    await userEvent.hover(find("card"));
    await expect.poll(() => style("title").color).toBe(tokenColor("color-content-card-title-hover"));
    const hover = textContrast(find("title"));
    await userEvent.unhover(find("card"));
    await row.unmount();
    await render(<Stack />);
    const stackTitle = textContrast(find("title"));
    const stackDescription = textContrast(find("description"));
    const values = { title, hover, description, meta, stackTitle, stackDescription };
    for (const [label, value] of Object.entries(values)) expect(value, label).toBeGreaterThanOrEqual(4.5);
    measured[theme] = values;
    // 문서 Accessibility 의 기록값.
    const recorded =
      theme === "light"
        ? { hover: 5.0, description: 6.69, meta: 5.1, stackDescription: 6.4 }
        : { hover: 5.97, description: 10.13, meta: 8.03, stackDescription: 9.85 };
    for (const [label, value] of Object.entries(recorded)) {
      expect(values[label as keyof typeof values], label).toBeCloseTo(value, 1);
    }
  });
}
