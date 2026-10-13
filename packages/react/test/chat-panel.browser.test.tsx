// Chat Panel(`.louis-chat-panel`)의 레시피가 실제로 알약 · 창 · 기록 · 독 · 잠김의 기하와 다크 스코프 · 대비를 만드는지 잰다(DS-D-0094).
//
// **React 표면이 아니라 클래스 마크업을 렌더한다.** 정본은 packages/css/src/component/chat-panel.css 이고 마크업은
// design/components/chat-panel.md 의 예시 그대로다. 창은 루트 `data-theme="dark"` 스코프로 늘 어둡다 — 문서 테마가 라이트여도 그렇다.
// 대비는 토큰 값으로 손 계산하지 않고, 그 스코프 안에서 계산된 색을 실제 바탕에 합성해 잰다(fixtures/contrast).
//
// 열린 창은 튐 애니메이션(scale)을 갖는다 — 잴 때는 돌고 있는 애니메이션 · 전이를 끝으로 보낸 뒤 잰다.
import type { CSSProperties, JSX } from "react";
import { afterEach, beforeEach, expect, test } from "vitest";
import { page } from "vitest/browser";
import { render } from "vitest-browser-react";
import "@klipse-design/css/layers.css";
import "@klipse-design/css/tokens.css";
import "@klipse-design/css/styles.css";
import { backdrop, contrastOn, find, over, parseColor, px, type Rgba, ratio } from "./fixtures/contrast";

declare const __LOUIS_REDUCED_MOTION__: boolean;

beforeEach(async () => {
  await page.viewport(1280, 900);
});

afterEach(() => {
  document.documentElement.removeAttribute("data-theme");
});

type State = "closed" | "open" | "closing";

function Panel({
  state = "open",
  gate = false,
  suggestions = true,
}: {
  readonly state?: State;
  readonly gate?: boolean;
  readonly suggestions?: boolean;
}): JSX.Element {
  const open = state === "open";
  return (
    <div style={{ padding: 24 }}>
      <div
        className="louis-chat-panel"
        data-theme="dark"
        data-state={state}
        role={open ? "dialog" : undefined}
        aria-labelledby={open ? "refine-title" : undefined}
        style={{ "--louis-chat-panel-pill-inline-size": "152px" } as CSSProperties}
        data-testid="panel"
      >
        <header className="louis-chat-panel__header" data-testid="header">
          <button
            type="button"
            className="louis-chat-panel__trigger"
            aria-expanded={open}
            disabled={state !== "closed"}
            tabIndex={state === "closed" ? 0 : -1}
            data-testid="trigger"
          >
            <span className="louis-chat-panel__trigger-icon" aria-hidden="true" data-testid="glyph" />
            <span className="louis-chat-panel__title" id="refine-title" data-testid="title">
              AI 클립 수정
            </span>
          </button>
          <div className="louis-chat-panel__controls" aria-hidden={!open} data-testid="controls">
            <label className="louis-slider louis-chat-panel__opacity" data-size="md" data-testid="opacity">
              <input
                type="range"
                className="louis-slider__control"
                min={35}
                max={100}
                step={5}
                defaultValue={100}
                aria-label="채팅창 투명도"
                aria-valuetext="투명도 100%"
                tabIndex={open ? 0 : -1}
                style={{ "--louis-slider-fill": "100%" } as CSSProperties}
              />
            </label>
            <button
              type="button"
              className="louis-icon-button louis-chat-panel__close"
              data-variant="ghost"
              data-size="md"
              aria-label="AI 클립 수정 닫기"
              tabIndex={open ? 0 : -1}
              data-testid="close"
            >
              <svg className="louis-icon-button__glyph" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M18.75 5.25L5.25 18.75M18.75 18.75L5.25 5.25" stroke="currentColor" strokeWidth="2.25" fill="none" />
              </svg>
            </button>
          </div>
        </header>

        <div className="louis-chat-panel__body" aria-hidden={!open} inert={!open} data-testid="body">
          {gate ? (
            <button type="button" className="louis-chat-panel__gate" data-testid="gate">
              AI 클립 수정 — Pro
            </button>
          ) : (
            <>
              <div className="louis-chat-panel__log" role="log" aria-label="AI 클립 수정 대화" data-testid="log">
                <div className="louis-chat-panel__bubble" data-from="user" data-testid="user">
                  <p className="louis-chat-panel__text" data-testid="user-text">
                    앞에 1초 추가
                  </p>
                </div>
                <div className="louis-chat-panel__bubble" data-from="assistant" data-testid="assistant">
                  <p className="louis-chat-panel__text" data-testid="assistant-text">
                    시작을 1초 앞당겨 슛 직전 패스부터 보이게 한 수정안입니다. 길게 늘여 최대 폭에 닿는지 봅니다 — 말풍선은 기록 폭의 85% 를 넘지 않습니다.
                  </p>
                  <div className="louis-chat-panel__diff" data-testid="diff">
                    00:00 ~ 00:04 (4초)
                  </div>
                </div>
                <div className="louis-chat-panel__actions" data-testid="actions">
                  <button type="button" className="louis-button" data-variant="primary" data-size="md" data-testid="apply">
                    <span className="louis-button__label">적용</span>
                  </button>
                  <button type="button" className="louis-button" data-variant="ghost" data-size="md">
                    <span className="louis-button__label">취소</span>
                  </button>
                </div>
              </div>
              <div className="louis-chat-panel__dock" data-testid="dock">
                {suggestions ? (
                  <div className="louis-chat-panel__suggestions" role="group" aria-label="빠른 수정" data-testid="suggestions">
                    <button type="button" className="louis-chat-panel__suggestion" data-testid="suggestion-1">
                      앞에 5초 추가
                    </button>
                    <button type="button" className="louis-chat-panel__suggestion" data-testid="suggestion-2">
                      뒤에 3초 자르기
                    </button>
                  </div>
                ) : null}
                <div className="louis-chat-panel__composer" data-testid="composer">
                  <input
                    type="text"
                    className="louis-chat-panel__input"
                    placeholder="수정할 내용을 입력하세요"
                    aria-label="수정할 내용"
                    data-testid="input"
                  />
                  <button type="button" className="louis-button" data-variant="primary" data-size="md" aria-busy="false">
                    <span className="louis-button__label">전송</span>
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

const style = (testId: string, pseudo?: string): CSSStyleDeclaration => getComputedStyle(find(testId), pseudo);
const rect = (testId: string): DOMRect => find(testId).getBoundingClientRect();

/** 돌고 있는 튐 · 올라옴 · 전이를 끝으로 보낸다(줄인 모션에서는 이미 없다). */
function settle(): void {
  for (const animation of document.getAnimations()) animation.finish();
}

/** 다크 스코프 안에서 토큰 하나의 계산 색 — 문서 테마가 아니라 창 루트 아래에서 탐침을 칠해 읽는다. */
function scopedColor(token: string): string {
  const probe = document.createElement("span");
  probe.style.color = `var(--louis-${token})`;
  find("panel").append(probe);
  const value = getComputedStyle(probe).color;
  probe.remove();
  return value;
}

const windowGround = (): Rgba => parseColor(style("panel").backgroundColor);

test("알약 — 높이 40 · 반경 12 · 안 0 16 · 사이 8 · 글리프 18, 본문 0 · 조작 묶음 폭 0 · 투명", async () => {
  await render(<Panel state="closed" />);
  settle();
  const panel = find("panel");
  expect(panel.offsetHeight).toBe(40);
  expect(panel.offsetWidth).toBe(152);
  expect(px(style("panel").borderTopLeftRadius)).toBe(12);
  expect(style("panel").zIndex).toBe("auto");
  const header = style("header");
  expect([px(header.paddingTop), px(header.paddingRight), px(header.paddingBottom), px(header.paddingLeft)]).toEqual([0, 16, 0, 16]);
  expect(px(style("trigger").columnGap)).toBe(8);
  expect(find("glyph").offsetWidth).toBe(18);
  expect(find("glyph").offsetHeight).toBe(18);
  expect(find("body").offsetWidth).toBe(0);
  expect(find("body").offsetHeight).toBe(0);
  expect(find("controls").offsetWidth).toBe(0);
  expect(style("controls").opacity).toBe("0");
  expect(style("title").fontWeight).toBe("500");
  expect(style("panel", "::after").opacity).toBe("0");
  expect(style("panel", "::before").boxShadow).toContain("8px");
});

test("창 — 360 × 560 · 안 8 · 반경 22 · 머리 48 · 조작 묶음 104, 빛 24 · 고리", async () => {
  await render(<Panel />);
  settle();
  const panel = find("panel");
  expect(panel.offsetWidth).toBe(360);
  expect(panel.offsetHeight).toBe(560);
  const shell = style("panel");
  expect([px(shell.paddingTop), px(shell.paddingRight), px(shell.paddingBottom), px(shell.paddingLeft)]).toEqual([8, 8, 8, 8]);
  expect(px(shell.borderTopLeftRadius)).toBe(22);
  expect(find("header").offsetHeight).toBe(48);
  expect(find("header").offsetWidth).toBe(360 - 16);
  expect(find("controls").offsetWidth).toBe(104);
  expect(find("opacity").offsetWidth).toBe(64);
  expect(find("close").offsetWidth).toBe(32);
  expect(style("controls").opacity).toBe("1");
  expect(style("title").fontWeight).toBe("600");
  expect(style("panel", "::after").opacity).toBe("1");
  expect(style("panel", "::before").boxShadow).toContain("24px");
  // 본문은 머리 아래 남는 높이를 모두 받는다.
  expect(find("body").offsetHeight).toBe(560 - 16 - 48);
  expect(style("body").opacity).toBe("1");
});

test("닫히는 중 — 높이 40 으로 접혀 있고 누를 수 없다, 내용은 투명", async () => {
  await render(<Panel state="closing" />);
  settle();
  expect(find("panel").offsetHeight).toBe(40);
  expect(style("panel").pointerEvents).toBe("none");
  expect(style("body").opacity).toBe("0");
});

test("기록 — 위 10 · 좌우 14 · 사이 8, 말풍선 8 · 12 · 반경 12 · 최대 85%, 사용자 오른쪽 · 도우미 왼쪽", async () => {
  await render(<Panel />);
  settle();
  const log = style("log");
  expect([px(log.paddingTop), px(log.paddingRight), px(log.paddingBottom), px(log.paddingLeft)]).toEqual([10, 14, 0, 14]);
  expect(px(log.rowGap)).toBe(8);
  expect(rect("assistant").top - rect("user").bottom).toBeCloseTo(8, 1);
  for (const testId of ["user", "assistant"]) {
    const bubble = style(testId);
    expect([px(bubble.paddingTop), px(bubble.paddingRight), px(bubble.paddingBottom), px(bubble.paddingLeft)]).toEqual([8, 12, 8, 12]);
    expect(px(bubble.borderTopLeftRadius)).toBe(12);
  }
  const content = rect("log").width - 28;
  expect(rect("assistant").width).toBeCloseTo(content * 0.85, 0);
  expect(rect("log").right - 14 - rect("user").right).toBeCloseTo(0, 1);
  expect(rect("assistant").left - rect("log").left).toBeCloseTo(14, 1);
  expect(px(style("user-text").fontSize)).toBe(14);
  // 차이 상자 — 위 6 · 안 6 · 10 · 반경 8 · caption.
  const diff = style("diff");
  expect(px(diff.marginTop)).toBe(6);
  expect([px(diff.paddingTop), px(diff.paddingRight), px(diff.paddingBottom), px(diff.paddingLeft)]).toEqual([6, 10, 6, 10]);
  expect(px(diff.borderTopLeftRadius)).toBe(8);
  expect(px(diff.fontSize)).toBe(12);
  expect(px(style("actions").columnGap)).toBe(8);
});

test("독 — 위 10 · 사이 10, 제안 높이 18 · 간격 20, 입력 줄 48 · 반경 14 · 입력칸 32", async () => {
  await render(<Panel />);
  settle();
  const dock = style("dock");
  expect(px(dock.paddingTop)).toBe(10);
  expect(px(dock.rowGap)).toBe(10);
  expect(style("dock", "::before").content).not.toBe("none");
  expect(find("suggestion-1").offsetHeight).toBe(18);
  expect(rect("suggestion-2").left - rect("suggestion-1").right).toBeCloseTo(20, 1);
  expect(style("suggestion-2", "::before").content).not.toBe("none");
  expect(find("composer").offsetHeight).toBe(48);
  expect(px(style("composer").borderTopLeftRadius)).toBe(14);
  expect(find("input").offsetHeight).toBe(32);
  // 독이 창 맨 아래에 붙는다 — 창 안쪽 8.
  expect(rect("panel").bottom - rect("composer").bottom).toBeCloseTo(8, 0);
});

test("제안 줄이 없으면 독 위 선도 없다", async () => {
  await render(<Panel suggestions={false} />);
  settle();
  expect(style("dock", "::before").content).toBe("none");
});

test("잠김 — 높이 43 · 반경 10 · 1px 점선, 꽉 찬 폭", async () => {
  await render(<Panel gate />);
  settle();
  const gate = style("gate");
  expect(find("gate").offsetHeight).toBe(43);
  expect(px(gate.borderTopLeftRadius)).toBe(10);
  expect(gate.borderTopStyle).toBe("dashed");
  expect(px(gate.borderTopWidth)).toBe(1);
  expect(find("gate").offsetWidth).toBe(find("body").offsetWidth);
});

test("다크 스코프 — 문서가 라이트여도 창 면은 #171b22, 안의 Button primary 는 강조 면", async () => {
  document.documentElement.setAttribute("data-theme", "light");
  await render(<Panel />);
  settle();
  const ground = windowGround();
  expect(ground.slice(0, 3).map(Math.round)).toEqual([23, 27, 34]);
  expect(style("apply").backgroundColor).toBe(scopedColor("color-accent-primary"));
  expect(parseColor(style("assistant-text").color).slice(0, 3).map(Math.round)).toEqual([250, 250, 250]);
  // 닫기 — 쉴 때도 흰 8% 면(accent-ghost-hover, 다크 스코프).
  const close = parseColor(style("close").backgroundColor);
  expect(close[3]).toBeCloseTo(0.08, 2);
});

for (const theme of ["light", "dark"] as const) {
  test(`대비(${theme} 문서) — 글 4.5 · 닫기 글리프 3 이상, 사용자 말풍선 3.37 은 수용 편차(실측)`, async () => {
    document.documentElement.setAttribute("data-theme", theme);
    await render(<Panel />);
    settle();
    const ground = windowGround();
    expect(contrastOn(style("title").color, ground), "제목").toBeGreaterThanOrEqual(4.5);
    expect(contrastOn(style("assistant-text").color, backdrop(find("assistant"))), "도우미 글").toBeGreaterThanOrEqual(4.5);
    const diffGround = over(parseColor(style("diff").backgroundColor), backdrop(find("assistant")));
    expect(contrastOn(style("diff").color, diffGround), "차이 상자 글").toBeGreaterThanOrEqual(4.5);
    expect(contrastOn(style("suggestion-1").color, ground), "제안").toBeGreaterThanOrEqual(4.5);
    expect(contrastOn(scopedColor("color-fg-primary"), ground), "제안 호버").toBeGreaterThanOrEqual(4.5);
    // 입력 줄 — 창 면 위 흰 8% 를 불투명 합성한 면(배경 그림 한 겹 + 배경색).
    const composer = over(parseColor(scopedColor("color-gray-000-alpha-08")), parseColor(style("composer").backgroundColor));
    expect(contrastOn(getComputedStyle(find("input"), "::placeholder").color, composer), "placeholder").toBeGreaterThanOrEqual(4.5);
    expect(contrastOn(style("input").color, composer), "입력 글").toBeGreaterThanOrEqual(4.5);
    const closeGround = backdrop(find("close"));
    expect(contrastOn(style("close").color, closeGround), "닫기 글리프").toBeGreaterThanOrEqual(3);
    const user = contrastOn(style("user-text").color, backdrop(find("user")));
    expect(user, "사용자 말풍선 — Button primary 와 같은 쌍").toBeCloseTo(3.37, 1);
    expect(ratio(parseColor(style("user").backgroundColor), ground), "사용자 말풍선 면 대 창").toBeGreaterThanOrEqual(3);
  });
}

test("대비 — 잠김 글 · 호버 4.5 이상(다크 스코프)", async () => {
  document.documentElement.setAttribute("data-theme", "light");
  await render(<Panel gate />);
  settle();
  const ground = windowGround();
  expect(contrastOn(style("gate").color, ground), "잠김 글").toBeGreaterThanOrEqual(4.5);
  const hoverGround = over(parseColor(scopedColor("color-gray-000-alpha-04")), ground);
  expect(contrastOn(scopedColor("color-accent-primary-hover"), hoverGround), "잠김 호버").toBeGreaterThanOrEqual(4.5);
});

test("모션 — 열림은 튐(louis-chat-panel-open), 줄인 모션에서는 애니메이션 · 전이가 없다", async () => {
  await render(<Panel />);
  const shell = style("panel");
  if (__LOUIS_REDUCED_MOTION__) {
    expect(shell.animationName).toBe("none");
    expect(shell.transitionDuration.split(",").every((value) => px(value) === 0)).toBe(true);
  } else {
    expect(shell.animationName).toBe("louis-chat-panel-open");
    expect(shell.animationDuration).toBe("0.44s");
    expect(shell.transitionProperty).toContain("max-block-size");
    expect(shell.transitionDuration.split(",").every((value) => value.trim() === "0.44s")).toBe(true);
  }
  settle();
});

test("호버 규칙은 모두 @media (hover: hover) 안이다", () => {
  const offenders: string[] = [];
  const walk = (rules: CSSRuleList, guarded: boolean): void => {
    for (const rule of Array.from(rules)) {
      if (rule instanceof CSSMediaRule) walk(rule.cssRules, guarded || rule.conditionText.includes("hover: hover"));
      else if (rule instanceof CSSLayerBlockRule) walk(rule.cssRules, guarded);
      else if (rule instanceof CSSStyleRule && rule.selectorText.includes("louis-chat-panel") && rule.selectorText.includes(":hover") && !guarded) {
        offenders.push(rule.selectorText);
      }
    }
  };
  for (const sheet of Array.from(document.styleSheets)) walk(sheet.cssRules, false);
  expect(offenders).toEqual([]);
});
