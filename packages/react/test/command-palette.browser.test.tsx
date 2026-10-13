// Command Palette(`.louis-command-palette`)의 레시피가 셸 · 검색줄 · 목록 · 플라이아웃 · 발의 기하와 수명 · 겹 · 대비를 실제로 만드는지 잰다(DS-D-0095).
//
// **React 표면이 아니라 클래스 마크업을 렌더한다.** 정본은 packages/css/src/component/command-palette.css 와 Menu 의 한 줄 항목
// (`menu-popover.css` `data-layout="inline"`)이고, 마크업은 design/components/command-palette.md 의 예시 그대로다.
// 패널이 반투명(bg-menu 88%)이라 바닥이 페이지다 — 대비는 토큰 값으로 손 계산하지 않고 캔버스 → 딤 → 패널 면 → (행 면) 순으로 계산 색을 합성해 잰다.
import type { CSSProperties, JSX } from "react";
import { afterEach, beforeEach, expect, test } from "vitest";
import { page, userEvent } from "vitest/browser";
import { render } from "vitest-browser-react";
import "@klipse-design/css/layers.css";
import "@klipse-design/css/tokens.css";
import "@klipse-design/css/styles.css";
import { contrastOn, find, over, parseColor, px, type Rgba, tokenColor } from "./fixtures/contrast";

declare const __LOUIS_REDUCED_MOTION__: boolean;

beforeEach(async () => {
  await page.viewport(1440, 900);
});

afterEach(() => {
  document.documentElement.removeAttribute("data-theme");
});

type State = "opening" | "open" | "closing";

const FROM = {
  "--louis-command-palette-from-x": "-508px",
  "--louis-command-palette-from-y": "-96px",
  "--louis-command-palette-from-scale-x": "0.36",
  "--louis-command-palette-from-scale-y": "0.07",
  "--louis-command-palette-flyout-top": "40px",
} as CSSProperties;

function Glyph({ testId, className = "louis-icon" }: { readonly testId?: string; readonly className?: string }): JSX.Element {
  return (
    <svg className={className} data-size="sm" viewBox="0 0 24 24" aria-hidden="true" data-testid={testId}>
      <circle cx="12" cy="12" r="6" fill="none" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

function Palette({
  state = "open",
  overlay = false,
  empty = false,
  flyout = false,
}: {
  readonly state?: State;
  readonly overlay?: boolean;
  readonly empty?: boolean;
  readonly flyout?: boolean;
}): JSX.Element {
  return (
    <div
      className={overlay ? "louis-overlay-panel louis-command-palette" : "louis-command-palette"}
      role="dialog"
      aria-modal="true"
      aria-label="검색"
      data-louis-state={state}
      data-louis-overlay-mode={overlay ? "modal" : undefined}
      style={FROM}
      data-testid="root"
    >
      <div className="louis-command-palette__scrim" aria-hidden="true" data-testid="scrim" />
      <div className="louis-command-palette__panel" data-testid="panel">
        <div className="louis-command-palette__search" data-testid="search">
          <Glyph className="louis-icon louis-command-palette__search-icon" testId="search-icon" />
          <input
            className="louis-command-palette__input"
            type="text"
            role="combobox"
            aria-label="메뉴 · 프로젝트 검색"
            aria-expanded="true"
            aria-autocomplete="list"
            aria-controls="cp-list"
            aria-activedescendant="cp-theme"
            placeholder="메뉴 · 프로젝트 검색"
            data-testid="input"
          />
          <button type="button" className="louis-icon-button" data-size="sm" data-variant="ghost" aria-label="닫기" data-testid="close">
            <Glyph />
          </button>
        </div>
        <div className="louis-command-palette__body" data-testid="body">
          {empty ? (
            <p className="louis-command-palette__empty" data-testid="empty">
              검색 결과가 없습니다
            </p>
          ) : (
            <div className="louis-command-palette__list" id="cp-list" role="listbox" aria-label="검색 결과" data-testid="list">
              <div className="louis-command-palette__group" role="group" aria-labelledby="cp-g-canvas" data-testid="group-1">
                <div className="louis-menu__group-label" id="cp-g-canvas" data-testid="group-label">
                  캔버스
                </div>
                <div className="louis-menu__item" data-layout="inline" role="option" id="cp-canvas" data-testid="row-canvas">
                  <span className="louis-menu__item-icon">
                    <Glyph testId="row-icon" />
                  </span>
                  <span className="louis-menu__item-label" data-testid="row-label">
                    캔버스
                  </span>
                  <span className="louis-menu__item-description" data-testid="row-description">
                    노드로 이미지 · 영상 만들기 — 아주 긴 설명이 패널 폭을 넘어 말줄임이 걸리는지 보려고 길게 적는다 아주 길게 적는다
                  </span>
                </div>
                <div className="louis-menu__item" data-layout="inline" role="option" id="cp-new" data-testid="row-plain">
                  <span className="louis-menu__item-icon">
                    <Glyph />
                  </span>
                  <span className="louis-menu__item-label">새 캔버스</span>
                </div>
              </div>
              <div className="louis-command-palette__group" role="group" aria-labelledby="cp-g-settings" data-testid="group-2">
                <div className="louis-menu__group-label" id="cp-g-settings">
                  설정
                </div>
                <div
                  className="louis-menu__item"
                  data-layout="inline"
                  role="option"
                  id="cp-theme"
                  data-highlighted="true"
                  data-testid="row-theme"
                >
                  <span className="louis-menu__item-icon">
                    <Glyph />
                  </span>
                  <span className="louis-menu__item-label">테마</span>
                  <span className="louis-menu__item-trailing" data-testid="row-theme-trailing">
                    다크
                  </span>
                  <svg className="louis-command-palette__chevron" viewBox="0 0 24 24" aria-hidden="true" data-testid="chevron">
                    <path d="M9 6l6 6-6 6" fill="none" stroke="currentColor" strokeWidth="1.5" />
                  </svg>
                </div>
              </div>
              <div className="louis-command-palette__group" role="group" aria-labelledby="cp-g-account">
                <div className="louis-menu__group-label" id="cp-g-account">
                  계정
                </div>
                <div className="louis-menu__item" data-layout="inline" data-tone="danger" role="option" id="cp-logout" data-testid="row-danger">
                  <span className="louis-menu__item-label">로그아웃</span>
                </div>
                <div
                  className="louis-menu__item"
                  data-layout="inline"
                  data-tone="danger"
                  role="option"
                  aria-disabled="true"
                  id="cp-delete"
                  data-testid="row-danger-disabled"
                >
                  <span className="louis-menu__item-label">계정 삭제</span>
                </div>
              </div>
            </div>
          )}
          {flyout ? (
            <div className="louis-popover louis-command-palette__flyout" role="listbox" aria-labelledby="cp-flyout-title" data-testid="flyout">
              <div className="louis-menu__group-label" id="cp-flyout-title">
                테마
              </div>
              <div className="louis-menu__item" data-layout="inline" role="option" aria-selected="false" data-testid="flyout-system">
                <span className="louis-menu__item-label">시스템</span>
              </div>
              <div className="louis-menu__item" data-layout="inline" role="option" aria-selected="true" data-testid="flyout-dark">
                <span className="louis-menu__item-label">다크</span>
              </div>
            </div>
          ) : null}
        </div>
        <div className="louis-command-palette__footer" data-testid="footer">
          <span className="louis-command-palette__hint" data-testid="hint-move">
            <kbd className="louis-keycap" data-testid="key-up">
              <Glyph />
              <span className="louis-visually-hidden">위 화살표</span>
            </kbd>
            <kbd className="louis-keycap" data-testid="key-down">
              <Glyph />
              <span className="louis-visually-hidden">아래 화살표</span>
            </kbd>
            <span data-testid="hint-move-label">이동</span>
          </span>
          <span className="louis-command-palette__hint" data-testid="hint-close">
            <kbd className="louis-keycap" data-testid="key-esc">
              Esc
            </kbd>
            <span>닫기</span>
          </span>
          <span className="louis-command-palette__hint" data-align="end" data-testid="hint-end">
            <span>선택</span>
            <kbd className="louis-keycap">
              <Glyph />
              <span className="louis-visually-hidden">Enter</span>
            </kbd>
          </span>
        </div>
        <div className="louis-visually-hidden" role="status" aria-live="polite">
          결과 4개
        </div>
      </div>
    </div>
  );
}

const style = (testId: string): CSSStyleDeclaration => getComputedStyle(find(testId));
const rect = (testId: string): DOMRect => find(testId).getBoundingClientRect();
const rootToken = (name: string): string => getComputedStyle(document.documentElement).getPropertyValue(`--louis-${name}`).trim();
const ms = (value: string): number => (value.trim().endsWith("ms") ? px(value) : px(value) * 1000);

function settle(): void {
  for (const animation of document.getAnimations()) animation.finish();
}

/** 패널 바닥 — 테마 캔버스 위에 딤, 그 위에 패널 면(88%)을 합성한다. 흐림 4 는 넓은 면의 밝기를 바꾸지 않는다. */
function panelGround(): Rgba {
  const canvas = parseColor(tokenColor("color-bg-canvas", "backgroundColor"));
  const dimmed = over(parseColor(style("scrim").backgroundColor), canvas);
  return over(parseColor(style("panel").backgroundColor), dimmed);
}

test("셸 — 1440 × 900 에서 패널 560 · 위 126(14vh) · 반경 16 · 최대 높이 min(70dvh, 520), 겹 layer-critical", async () => {
  await render(<Palette />);
  settle();
  const panel = rect("panel");
  expect(panel.width).toBe(560);
  expect(panel.top).toBe(126);
  expect(panel.left).toBe((1440 - 560) / 2);
  expect(px(style("panel").borderTopLeftRadius)).toBe(16);
  expect(px(style("panel").maxHeight)).toBe(520);
  expect(style("root").position).toBe("fixed");
  expect(style("root").zIndex).toBe(rootToken("layer-critical"));
  expect(style("panel").backdropFilter).toBe("blur(4px)");
  // 패널 면 = bg-menu 88%.
  const surface = parseColor(style("panel").backgroundColor);
  expect(surface[3]).toBeCloseTo(0.88, 2);
  expect(surface.slice(0, 3)).toEqual(parseColor(tokenColor("color-bg-menu", "backgroundColor")).slice(0, 3));
  expect(style("scrim").backgroundColor).toBe(tokenColor("color-dim-modal", "backgroundColor"));
});

test("좁은 화면 — 375 × 812 에서 좌우 12 · 위 8vh", async () => {
  await page.viewport(375, 812);
  await render(<Palette />);
  settle();
  const panel = rect("panel");
  expect(panel.left).toBe(12);
  expect(panel.width).toBe(375 - 24);
  expect(panel.top).toBeCloseTo(812 * 0.08, 0);
});

test("검색줄 — 높이 48 · 좌 18 · 우 14 · 사이 6, 검색 글리프 왼쪽 끝 = 행 글리프 왼쪽 끝", async () => {
  await render(<Palette />);
  settle();
  const search = style("search");
  expect(find("search").offsetHeight).toBe(48);
  expect(px(search.paddingLeft)).toBe(18);
  expect(px(search.paddingRight)).toBe(14);
  expect(px(search.columnGap)).toBe(6);
  expect(rect("search-icon").width).toBe(16);
  expect(rect("search-icon").left).toBe(rect("row-icon").left);
  // 아래 한 면 헤어라인(box-shadow).
  expect(search.boxShadow).toContain("inset");
});

test("목록 — 안쪽 6 · 그룹 사이 4 · 행 사이 2, 그룹 제목 위아래 4 · 좌우 12", async () => {
  await render(<Palette />);
  settle();
  const list = style("list");
  expect(px(list.paddingTop)).toBe(6);
  expect(px(list.paddingLeft)).toBe(6);
  expect(px(list.rowGap)).toBe(4);
  expect(px(style("group-1").rowGap)).toBe(2);
  expect(rect("group-2").top - rect("group-1").bottom).toBe(4);
  const label = style("group-label");
  expect(px(label.paddingTop)).toBe(4);
  expect(px(label.paddingLeft)).toBe(12);
  expect(label.color).toBe(tokenColor("color-fg-secondary"));
});

test("행 — Menu 항목 한 줄 변형: 37 · 좌우 12 · 간격 6 · 가운데, 설명은 같은 줄 · 말줄임 · fg-secondary, 현재값은 끝", async () => {
  await render(<Palette />);
  settle();
  const row = style("row-canvas");
  expect(find("row-canvas").offsetHeight).toBe(37);
  expect(px(row.paddingLeft)).toBe(12);
  expect(px(row.paddingRight)).toBe(12);
  expect(px(row.columnGap)).toBe(6);
  expect(row.alignItems).toBe("center");
  expect(row.whiteSpace).toBe("nowrap");
  const description = style("row-description");
  expect(description.textOverflow).toBe("ellipsis");
  expect(description.color).toBe(tokenColor("color-fg-secondary"));
  expect(rect("row-description").top).toBeLessThan(rect("row-label").bottom);
  expect(find("row-description").scrollWidth).toBeGreaterThan(find("row-description").clientWidth);
  expect(rect("row-canvas").right).toBeLessThanOrEqual(rect("list").right);
  // 설명이 없는 행의 현재값은 끝(셰브론 12 앞)에 선다.
  expect(find("row-plain").offsetHeight).toBe(37);
  const theme = rect("row-theme");
  expect(rect("chevron").width).toBe(12);
  expect(rect("chevron").right).toBe(theme.right - 12);
  expect(rect("row-theme-trailing").right).toBe(rect("chevron").left - 6);
});

test("발 — 높이 38 · 좌우 18 · 묶음 사이 16 · 키와 글자 6 · 키 사이 4, 실행 안내는 끝", async () => {
  await render(<Palette />);
  settle();
  const footer = style("footer");
  expect(find("footer").offsetHeight).toBe(38);
  expect(px(footer.paddingLeft)).toBe(18);
  expect(px(footer.paddingRight)).toBe(18);
  expect(px(footer.columnGap)).toBe(16);
  expect(footer.color).toBe(tokenColor("color-fg-tertiary"));
  expect(rect("key-down").left - rect("key-up").right).toBe(4);
  expect(rect("hint-move-label").left - rect("key-down").right).toBe(6);
  expect(rect("hint-close").left - rect("hint-move").right).toBe(16);
  expect(rect("hint-end").right).toBe(rect("footer").right - 18);
  // 키캡 글리프가 행 글리프와 같은 세로 줄에 선다(좌 18).
  expect(rect("key-up").left).toBe(rect("row-icon").left);
});

test("결과 없음 — 위아래 28 · 좌우 12 · 가운데 · fg-secondary", async () => {
  await render(<Palette empty />);
  settle();
  const empty = style("empty");
  expect(px(empty.paddingTop)).toBe(28);
  expect(px(empty.paddingBottom)).toBe(28);
  expect(px(empty.paddingLeft)).toBe(12);
  expect(empty.textAlign).toBe("center");
  expect(empty.color).toBe(tokenColor("color-fg-secondary"));
});

test("플라이아웃 — Popover 면 · 폭 180 · 오른쪽 6 · 위는 변수, 높이 ≤ 본문 − 12, 지금 값은 hover 해도 12%", async () => {
  await render(<Palette flyout />);
  settle();
  const body = rect("body");
  const flyout = rect("flyout");
  expect(flyout.width).toBe(180);
  expect(flyout.right).toBe(body.right - 6);
  expect(flyout.top).toBe(body.top + 40);
  expect(flyout.height).toBeLessThanOrEqual(body.height - 12);
  expect(style("flyout").position).toBe("absolute");
  expect(style("flyout").animationName).toBe("louis-command-palette-flyout-enter");
  expect(ms(style("flyout").animationDuration)).toBe(__LOUIS_REDUCED_MOTION__ ? 0 : ms(rootToken("motion-overlay-enter-duration")));
  const selected = style("flyout-dark").backgroundColor;
  await userEvent.hover(find("flyout-dark"));
  expect(style("flyout-dark").backgroundColor).toBe(selected);
  expect(parseColor(selected)[3]).toBeGreaterThan(0);
  // 지금 값이 아닌 행은 hover 해도 면이 없다(커서는 하이라이트 한 행).
  await userEvent.hover(find("flyout-system"));
  expect(parseColor(style("flyout-system").backgroundColor)[3]).toBe(0);
});

test("커서는 한 행 — 하이라이트가 아닌 행에 hover 해도 면이 없고, 하이라이트 행만 면을 갖는다", async () => {
  await render(<Palette />);
  settle();
  await userEvent.hover(find("row-canvas"));
  expect(parseColor(style("row-canvas").backgroundColor)[3]).toBe(0);
  expect(style("row-theme").backgroundColor).toBe(tokenColor("color-accent-menu-item-hover", "backgroundColor"));
});

test("위험 행 — 잉크 fg-danger-on-surface, 꺼진 위험 행은 fg-disabled", async () => {
  await render(<Palette />);
  settle();
  expect(style("row-danger").color).toBe(tokenColor("color-fg-danger-on-surface"));
  expect(style("row-danger-disabled").color).toBe(tokenColor("color-fg-disabled"));
});

test("수명 — opening 에서 패널은 변수 자리에서 납작하고 루트는 페이드하지 않는다, closing 은 modal-exit", async () => {
  const { rerender } = await render(<Palette state="opening" />);
  const root = style("root");
  expect(root.opacity).toBe("1");
  expect(style("panel").opacity).toBe("0");
  expect(style("scrim").opacity).toBe("0");
  if (__LOUIS_REDUCED_MOTION__) {
    expect(["none", "0px", "0px 0px"]).toContain(style("panel").translate);
    expect(["none", "1"]).toContain(style("panel").scale);
    expect(ms(root.transitionDuration)).toBe(0);
  } else {
    expect(style("panel").translate).toBe("-508px -96px");
    expect(style("panel").scale).toBe("0.36 0.07");
    expect(ms(root.transitionDuration)).toBe(ms(rootToken("motion-modal-enter-duration")));
  }
  // 두 자식이 루트의 시간을 그대로 받는다.
  expect(style("panel").transitionDuration).toBe(root.transitionDuration);
  expect(style("scrim").transitionDuration).toBe(root.transitionDuration);
  await rerender(<Palette state="closing" />);
  const closing = style("root");
  expect(ms(closing.transitionDuration)).toBe(__LOUIS_REDUCED_MOTION__ ? 0 : ms(rootToken("motion-modal-exit-duration")));
  expect(style("panel").transitionProperty).toBe("opacity, translate, scale");
});

test("use-overlay 로 띄울 때 — overlay-panel 의 anchored 값(루트 opacity · scale · 최대 크기)을 되돌린다", async () => {
  await render(<Palette state="opening" overlay />);
  const root = style("root");
  expect(root.opacity).toBe("1");
  expect(["none", "1"]).toContain(root.scale);
  expect(root.overflow).toBe("hidden");
  expect(root.maxWidth).toBe("none");
});

for (const theme of ["light", "dark"] as const) {
  test(`대비(${theme}) — 유리 88% + dim-modal 바닥에서 보조 글자 · 위험 행 · 키캡 4.5, 글리프 3 이상`, async () => {
    document.documentElement.setAttribute("data-theme", theme);
    await render(<Palette />);
    settle();
    const ground = panelGround();
    expect(contrastOn(style("group-label").color, ground), "그룹 제목 fg-secondary").toBeGreaterThanOrEqual(4.5);
    expect(contrastOn(style("row-description").color, ground), "설명 fg-secondary").toBeGreaterThanOrEqual(4.5);
    expect(contrastOn(style("row-label").color, ground), "행 이름").toBeGreaterThanOrEqual(4.5);
    expect(contrastOn(getComputedStyle(find("input"), "::placeholder").color, ground), "안내 문구").toBeGreaterThanOrEqual(4.5);
    expect(contrastOn(style("footer").color, ground), "키 안내 fg-tertiary").toBeGreaterThanOrEqual(4.5);
    expect(contrastOn(style("row-danger").color, ground), "위험 행").toBeGreaterThanOrEqual(4.5);
    const highlighted = over(parseColor(style("row-theme").backgroundColor), ground);
    expect(contrastOn(style("row-theme-trailing").color, highlighted), "하이라이트 행의 현재값").toBeGreaterThanOrEqual(4.5);
    const dangerHover = over(parseColor(tokenColor("color-accent-menu-danger-hover", "backgroundColor")), ground);
    expect(contrastOn(style("row-danger").color, dangerHover), "위험 행 하이라이트").toBeGreaterThanOrEqual(4.5);
    const keycap = over(parseColor(style("key-esc").backgroundColor), ground);
    expect(contrastOn(style("key-esc").color, keycap), "키캡 글자").toBeGreaterThanOrEqual(4.5);
    expect(contrastOn(style("search-icon").color, ground), "검색 글리프").toBeGreaterThanOrEqual(3);
    expect(contrastOn(style("chevron").color, highlighted), "셰브론").toBeGreaterThanOrEqual(3);
  });
}

test("호버 규칙은 모두 @media (hover: hover) 안이다", () => {
  const offenders: string[] = [];
  const walk = (rules: CSSRuleList, guarded: boolean): void => {
    for (const rule of Array.from(rules)) {
      if (rule instanceof CSSMediaRule) walk(rule.cssRules, guarded || rule.conditionText.includes("hover: hover"));
      else if (rule instanceof CSSLayerBlockRule) walk(rule.cssRules, guarded);
      else if (rule instanceof CSSStyleRule && rule.selectorText.includes("louis-command-palette") && rule.selectorText.includes(":hover") && !guarded) {
        offenders.push(rule.selectorText);
      }
    }
  };
  for (const sheet of Array.from(document.styleSheets)) walk(sheet.cssRules, false);
  expect(offenders).toEqual([]);
});
