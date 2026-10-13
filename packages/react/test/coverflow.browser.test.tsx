// Coverflow(`.louis-coverflow`)의 레시피가 실제로 거리 → 자리 식 · 깊이 겹 순서 · 카드 · 무대 · 조작 줄 · 좁은 판 · 대비를 만드는지 잰다(DS-D-0090).
//
// **React 표면이 아니라 클래스 마크업을 렌더한다.** 정본은 packages/css/src/component/coverflow.css 이고 마크업은
// design/components/coverflow.md 의 예시 그대로다. 거리(offset · depth)는 소비처 몫이라 시험이 값을 준다.
// 자리는 제품의 인라인 `transform` 식(TemplateResultCarousel.tsx:169)을 같은 원근 안에 그린 탐침과 맞댄다.
// 대비는 토큰 값으로 손 계산하지 않고 계산 색을 랜딩 바닥 위에서 잰다(fixtures/contrast).
import type { CSSProperties, JSX } from "react";
import { afterEach, beforeEach, expect, test } from "vitest";
import { page, userEvent } from "vitest/browser";
import { render } from "vitest-browser-react";
import "@klipse-design/css/layers.css";
import "@klipse-design/css/tokens.css";
import "@klipse-design/css/styles.css";
import { backdrop, contrastOn, find, px, textContrast, tokenColor } from "./fixtures/contrast";

beforeEach(async () => {
  await page.viewport(1440, 900);
});

afterEach(() => {
  document.documentElement.removeAttribute("data-theme");
});

const PIXEL = "data:image/gif;base64,R0lGODlhAQABAAAAACw=";
const vars = (entries: Record<string, string>): CSSProperties => entries as CSSProperties;
const reduced = (): boolean => matchMedia("(prefers-reduced-motion: reduce)").matches;

/** 문서 예시의 커버플로 — 미디어 `count` 장, 가운데 `active`, 묶음 폭 `width`, 랜딩 바닥 위. */
function Coverflow({ count = 5, active = 2, width = 1120 }: { count?: number; active?: number; width?: number }): JSX.Element {
  return (
    <div style={{ background: "var(--louis-color-landing-page-bg)", inlineSize: width }} data-testid="ground">
      <div className="louis-coverflow" data-testid="root">
        <div className="louis-coverflow__stage" role="group" aria-roledescription="carousel" aria-label="결과 미디어" tabIndex={0} data-testid="stage">
          <div className="louis-coverflow__deck" data-testid="deck">
            {Array.from({ length: count }, (_, i) => {
              const offset = i - active;
              const depth = Math.abs(offset);
              return (
                <div
                  key={i}
                  className="louis-coverflow__card"
                  role="group"
                  aria-roledescription="slide"
                  aria-label={`${i + 1} / ${count}`}
                  aria-hidden={offset === 0 ? undefined : true}
                  data-active={offset === 0 ? "true" : undefined}
                  data-far={depth > 3 ? "true" : undefined}
                  data-offset={offset}
                  style={vars({ "--louis-coverflow-offset": String(offset), "--louis-coverflow-depth": String(depth) })}
                  data-testid={`card-${offset}`}
                >
                  <img className="louis-coverflow__media" src={PIXEL} alt="" draggable={false} data-testid={`media-${offset}`} />
                  {offset === 0 ? (
                    <span className="louis-coverflow__label" data-testid="label">
                      <span className="louis-badge" data-surface="media" data-testid="badge">
                        워크플로
                      </span>
                    </span>
                  ) : null}
                </div>
              );
            })}
          </div>
        </div>
        <div className="louis-coverflow__controls" data-testid="controls">
          <button type="button" className="louis-coverflow__nav" aria-label="이전" disabled={active === 0} data-testid="prev">
            <svg className="louis-coverflow__nav-glyph" viewBox="0 0 24 24" aria-hidden="true" data-testid="glyph">
              <polyline points="15 19.5 7.5 12 15 4.5" fill="none" stroke="currentColor" strokeWidth="1.5" />
            </svg>
          </button>
          <div className="louis-coverflow__dots" role="tablist" aria-label="미디어 고르기" data-testid="dots">
            {Array.from({ length: count }, (_, i) => (
              <button
                key={i}
                type="button"
                className="louis-coverflow__dot"
                role="tab"
                aria-selected={i === active}
                aria-current={i === active ? "true" : undefined}
                aria-label={`${i + 1}번째 미디어`}
                data-testid={i === active ? "dot-active" : `dot-${i}`}
              />
            ))}
          </div>
          <button type="button" className="louis-coverflow__nav" aria-label="다음" disabled={active === count - 1} data-testid="next">
            <svg className="louis-coverflow__nav-glyph" viewBox="0 0 24 24" aria-hidden="true">
              <polyline points="9 4.5 16.5 12 9 19.5" fill="none" stroke="currentColor" strokeWidth="1.5" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

/** 제품 식(TemplateResultCarousel.tsx:169)을 그대로 쓴 탐침 — 같은 무대 높이 · 원근 · 카드 크기에 인라인 `transform`. */
function ProductProbe({ count = 5, active = 2 }: { count?: number; active?: number }): JSX.Element {
  return (
    <div style={{ position: "relative", inlineSize: 1120, blockSize: 540, perspective: "1400px", transformStyle: "preserve-3d" }} data-testid="probe">
      {Array.from({ length: count }, (_, i) => {
        const offset = i - active;
        const abs = Math.abs(offset);
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              blockSize: 500,
              aspectRatio: "4 / 5",
              transform: `translate(-50%, -50%) translateX(${offset * 52}%) translateZ(${abs * -140}px) rotateY(${offset * -34}deg) scale(${Math.max(0.7, 1 - abs * 0.08)})`,
            }}
            data-testid={`probe-${offset}`}
          />
        );
      })}
    </div>
  );
}

const rect = (id: string): DOMRect => find(id).getBoundingClientRect();
const style = (id: string, pseudo?: string): CSSStyleDeclaration => getComputedStyle(find(id), pseudo);

test("가운데 카드 400 × 500 · 반경 16 · 사진 무대 면, 무대 540 · 원근 1400 은 덱에, 자르기는 무대에", async () => {
  await render(<Coverflow />);
  const card = rect("card-0");
  expect(card.width).toBeCloseTo(400, 1);
  expect(card.height).toBeCloseTo(500, 1);
  expect(px(style("card-0").borderTopLeftRadius)).toBe(16);
  expect(style("card-0").backgroundColor).toBe(tokenColor("color-media-stage-surface", "backgroundColor"));
  expect(style("card-0").overflow).toBe("hidden");
  const stage = rect("stage");
  expect(stage.height).toBe(540);
  expect(card.left + card.width / 2, "가운데").toBeCloseTo(stage.left + stage.width / 2, 1);
  expect(card.top + card.height / 2).toBeCloseTo(stage.top + stage.height / 2, 1);
  expect(style("stage").overflow).toBe("hidden");
  expect(style("stage").touchAction).toBe("pan-y");
  expect(style("deck").perspective).toBe("1400px");
  expect(style("deck").transformStyle).toBe("preserve-3d");
  expect(style("deck").overflow, "덱에 묶음 속성이 없다").toBe("visible");
  expect(style("card-0").zIndex, "숫자 z-index 없음").toBe("auto");
  expect(style("media-0").objectFit).toBe("cover");
  expect(rect("media-0").width).toBeCloseTo(400, 1);
});

test("거리 → 자리 — 카드마다 제품 인라인 transform 식과 같은 자리 · 크기에 투영된다", async () => {
  await render(
    <>
      <Coverflow />
      <ProductProbe />
    </>,
  );
  const stage = rect("stage");
  const probe = rect("probe");
  for (const offset of [-2, -1, 0, 1, 2]) {
    const card = rect(`card-${offset}`);
    const expected = rect(`probe-${offset}`);
    expect(card.left - stage.left, `${offset} 왼쪽`).toBeCloseTo(expected.left - probe.left, 0);
    expect(card.right - stage.left, `${offset} 오른쪽`).toBeCloseTo(expected.right - probe.left, 0);
    expect(card.top - stage.top, `${offset} 위`).toBeCloseTo(expected.top - probe.top, 0);
    expect(card.height, `${offset} 높이`).toBeCloseTo(expected.height, 0);
  }
  expect(style("card-1").scale).toBe("0.92");
  expect(style("card-2").scale).toBe("0.84");
  expect(rect("card-1").left, "오른쪽 카드가 오른쪽").toBeGreaterThan(rect("card-0").left);
  expect(rect("card--1").right).toBeLessThan(rect("card-0").right);
});

for (const active of [0, 2, 4]) {
  test(`겹 순서는 깊이다 — 가운데 ${active}: 겹친 자리의 맨 위 카드가 가운데에 가까운 카드다(제품 z-index 100 − abs 와 같다)`, async () => {
    await render(<Coverflow active={active} />);
    const stage = rect("stage");
    const y = stage.top + stage.height / 2;
    const cards = Array.from(document.querySelectorAll<HTMLElement>(".louis-coverflow__card")).filter((card) => card.dataset.far !== "true");
    let checked = 0;
    for (let x = stage.left + 2; x < stage.right - 2; x += 4) {
      const covering = cards.filter((card) => {
        const box = card.getBoundingClientRect();
        return x > box.left + 1 && x < box.right - 1;
      });
      if (covering.length === 0) continue;
      const depths = covering.map((card) => Math.abs(Number(card.dataset.offset)));
      const nearest = Math.min(...depths);
      if (depths.filter((depth) => depth === nearest).length > 1) continue;
      const expected = covering[depths.indexOf(nearest)];
      const hit = document.elementFromPoint(x, y)?.closest(".louis-coverflow__card");
      expect(hit?.getAttribute("data-offset"), `x ${Math.round(x - stage.left)}`).toBe(expected?.getAttribute("data-offset"));
      if (covering.length > 1) checked += 1;
    }
    expect(checked, "겹친 자리를 실제로 지났다").toBeGreaterThan(10);
  });
}

test("옆 카드 누름이 그 카드에 닿는다 — 가운데 카드 밖, 한 칸 옆 카드의 보이는 자리", async () => {
  await render(<Coverflow />);
  let clicked: string | null = null;
  find("deck").addEventListener("click", (event) => {
    clicked = (event.target as HTMLElement).closest(".louis-coverflow__card")?.getAttribute("data-offset") ?? null;
  });
  const center = rect("card-0");
  const right = rect("card-1");
  const x = (center.right + right.right) / 2;
  const y = center.top + center.height / 2;
  const hit = document.elementFromPoint(x, y) as HTMLElement | null;
  expect(hit?.closest(".louis-coverflow__card")?.getAttribute("data-offset"), "덱이 누름을 가로채지 않는다").toBe("1");
  // 그 자리에서 맞은 요소를 누른다 — 3D 변형 요소 안의 좌표를 자동화 도구가 옮기지 않아도 되게 맞은 요소에 바로 보낸다.
  hit?.click();
  expect(clicked).toBe("1");
  expect(style("card-1").cursor).toBe("pointer");
  expect(style("card-0").cursor).toBe("default");
});

test("가운데 카드는 깊은 그림자, 옆 카드는 얕은 그림자 — 새 elevation 토큰", async () => {
  await render(<Coverflow />);
  const shadow = (token: string): string => {
    const probe = document.createElement("div");
    probe.style.boxShadow = `var(--louis-${token})`;
    document.body.append(probe);
    const value = getComputedStyle(probe).boxShadow;
    probe.remove();
    return value;
  };
  expect(style("card-0").boxShadow).toBe(shadow("elevation-coverflow-card-active"));
  expect(style("card-1").boxShadow).toBe(shadow("elevation-coverflow-card"));
  expect(style("card-0").boxShadow).toContain("0px 32px 80px 0px");
  expect(style("card-1").boxShadow).toContain("0px 24px 60px 0px");
  if (!reduced()) {
    expect(style("card-1").transitionDuration.split(", ")[0], "넘김 520").toBe("0.52s");
    expect(style("card-1").transitionTimingFunction).toContain("cubic-bezier(0.22, 1, 0.36, 1)");
  } else {
    expect(style("card-1").transitionDuration).toBe("0s");
  }
});

test("세 칸 넘게 떨어진 카드 — 보이지 않고 눌리지 않는다", async () => {
  await render(<Coverflow count={7} active={0} />);
  expect(style("card-4").opacity).toBe("0");
  expect(style("card-4").pointerEvents).toBe("none");
  expect(style("card-3").opacity).toBe("1");
  expect(style("card-3").pointerEvents).toBe("auto");
  expect(style("card-6").scale, "하한 0.7").toBe("0.7");
});

test("좁은 판 — 묶음 폭 600 에서 카드 320 × 400 · 무대 440, 608 을 넘으면 그대로", async () => {
  const narrow = await render(<Coverflow width={600} />);
  expect(rect("card-0").width).toBeCloseTo(320, 1);
  expect(rect("card-0").height).toBeCloseTo(400, 1);
  expect(rect("stage").height).toBe(440);
  await narrow.unmount();
  await render(<Coverflow width={640} />);
  expect(rect("card-0").height).toBeCloseTo(500, 1);
  expect(rect("stage").height).toBe(540);
});

test("조작 줄 — 사이 16 · 위 20, 이동 버튼 40 원형 · 테두리 1 · 글리프 16, 점 8 · 사이 8 · 활성 1.35 배", async () => {
  await render(<Coverflow />);
  expect(rect("controls").top - rect("stage").bottom, "위 20").toBeCloseTo(20, 1);
  expect(px(style("controls").columnGap)).toBe(16);
  const prev = rect("prev");
  expect(prev.width).toBe(40);
  expect(prev.height).toBe(40);
  expect(style("prev").borderTopLeftRadius).toBe("50%");
  expect(px(style("prev").borderTopWidth)).toBe(1);
  expect(style("prev").borderTopStyle).toBe("solid");
  expect(style("prev").backgroundColor).toBe(tokenColor("color-gray-000-alpha-04", "backgroundColor"));
  expect(style("prev").borderTopColor).toBe(tokenColor("color-gray-000-alpha-16"));
  expect(rect("glyph").width).toBe(16);
  expect(rect("dot-0").width).toBe(8);
  expect(rect("dot-0").height).toBe(8);
  expect(px(style("dots").columnGap)).toBe(8);
  expect(rect("dot-1").left - rect("dot-0").right, "점 사이 8").toBeCloseTo(8, 1);
  expect(style("dot-0").backgroundColor).toBe(tokenColor("color-gray-000-alpha-48", "backgroundColor"));
  expect(style("dot-active").backgroundColor).toBe(tokenColor("color-accent-primary", "backgroundColor"));
  expect(style("dot-active").scale).toBe("1.35");
  expect(rect("dot-active").width).toBeCloseTo(10.8, 1);
  const target = style("dot-0", "::before");
  expect(px(target.top), "누르는 자리 위아래 8").toBe(-8);
  expect(px(target.left), "옆 4").toBe(-4);
});

test("처음 · 끝 — 이동 버튼은 fg-disabled 잉크, 흐리게 하지 않는다", async () => {
  await render(<Coverflow active={0} />);
  expect(style("prev").color).toBe(tokenColor("color-fg-disabled"));
  expect(style("prev").opacity).toBe("1");
  expect(style("prev").cursor).toBe("not-allowed");
  expect(style("next").color).toBe(tokenColor("color-fg-primary"));
});

test("호버 — 이동 버튼 면 12% · 테두리 24%, 쉬는 점 64%, 활성 점은 바뀌지 않는다", async () => {
  await render(<Coverflow />);
  await userEvent.hover(find("next"));
  await expect.poll(() => style("next").backgroundColor).toBe(tokenColor("color-gray-000-alpha-12", "backgroundColor"));
  await expect.poll(() => style("next").borderTopColor).toBe(tokenColor("color-gray-000-alpha-24"));
  await userEvent.hover(find("dot-0"));
  await expect.poll(() => style("dot-0").backgroundColor).toBe(tokenColor("color-gray-000-alpha-64", "backgroundColor"));
  await userEvent.hover(find("dot-active"));
  await new Promise((resolve) => setTimeout(resolve, 220));
  expect(style("dot-active").backgroundColor, "활성 점은 호버로 파랑을 잃지 않는다").toBe(tokenColor("color-accent-primary", "backgroundColor"));
});

test("라벨 — 왼쪽 · 아래 12 자리에 media 배지", async () => {
  await render(<Coverflow />);
  const card = rect("card-0");
  const label = rect("label");
  expect(label.left - card.left).toBeCloseTo(12, 1);
  expect(card.bottom - label.bottom).toBeCloseTo(12, 1);
  expect(style("label").pointerEvents).toBe("none");
  expect(style("badge").backgroundColor).toBe(tokenColor("color-media-badge-surface", "backgroundColor"));
});

test("호버 규칙은 전부 (hover: hover) 안이다", () => {
  const offenders: string[] = [];
  const walk = (rules: CSSRuleList, guarded: boolean): void => {
    for (const rule of Array.from(rules)) {
      if (rule instanceof CSSMediaRule) walk(rule.cssRules, guarded || rule.conditionText.includes("hover: hover"));
      else if (rule instanceof CSSLayerBlockRule) walk(rule.cssRules, guarded);
      else if (rule instanceof CSSStyleRule && rule.selectorText.includes("louis-coverflow") && rule.selectorText.includes(":hover") && !guarded) {
        offenders.push(rule.selectorText);
      }
    }
  };
  for (const sheet of Array.from(document.styleSheets)) walk(sheet.cssRules, false);
  expect(offenders).toEqual([]);
});

for (const theme of ["light", "dark"] as const) {
  test(`${theme} — 점 · 호버 점 · 활성 점 · 이동 글리프 · 라벨 대비를 랜딩 바닥 위에서 잰다`, async () => {
    document.documentElement.setAttribute("data-theme", theme);
    await render(<Coverflow />);
    const ground = backdrop(find("ground"));
    expect(contrastOn(style("dot-0").backgroundColor, ground), "쉬는 점").toBeGreaterThanOrEqual(3);
    expect(contrastOn(tokenColor("color-gray-000-alpha-64"), ground), "호버 점").toBeGreaterThanOrEqual(3);
    expect(contrastOn(style("dot-active").backgroundColor, ground), "활성 점").toBeGreaterThanOrEqual(3);
    expect(textContrast(find("next")), "이동 글리프 on 버튼 면").toBeGreaterThanOrEqual(4.5);
    expect(textContrast(find("badge")), "라벨").toBeGreaterThanOrEqual(4.5);
  });
}
