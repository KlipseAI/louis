// design/components/app-shell-parts.md의 Acceptance tests를 실제 브라우저에서 검증한다.
//
// **이 파일의 요지는 "접힘은 폭이고, 이름은 남는다" 둘이다.** 접힌 사이드바에서 라벨을
// DOM에서 지우면 버튼의 접근 가능한 이름이 사라져 스크린 리더가 "버튼"만 읽는다.
import { expect, test } from "vitest";
import { render } from "vitest-browser-react";
import { SidebarBrand, SidebarCta } from "@klipse-design/react";
import measured from "../../../figma/components.measured.json";
import "@klipse-design/css/layers.css";
import "@klipse-design/css/tokens.css";
import "@klipse-design/css/styles.css";

const px = (value: string): number => Number.parseFloat(value);

/** measured의 states 표를 꺼낸다. 없으면 던진다 — undefined가 조용히 흘러가면 단언이 사라진다. */
function statesOf(component: string, group: string): Record<string, Record<string, string | null>> {
  const table = (measured.components as Record<string, { states?: Record<string, unknown> }>)[component]
    ?.states;
  const spec = table?.[group];
  if (spec === undefined) throw new Error(`${component}/${group} states 표가 없습니다`);
  return spec as Record<string, Record<string, string | null>>;
}

function stateOf(
  spec: Record<string, Record<string, string | null>>,
  name: string,
): Record<string, string | null> {
  const paint = spec[name];
  if (paint === undefined) throw new Error(`states 표에 ${name}이 없습니다`);
  return paint;
}

/** 토큰 이름을 브라우저가 계산한 값으로 바꾼다. 리터럴을 적으면 토큰이 움직여도 통과한다. */
function tokenValue(token: string): string {
  const probe = document.createElement("div");
  probe.style.color = `var(--kds-${token})`;
  document.body.append(probe);
  const value = getComputedStyle(probe).color;
  probe.remove();
  return value;
}

function scope(): ParentNode {
  const fixtures = document.querySelectorAll("[data-kds-fixture]");
  return fixtures.length > 0 ? fixtures[fixtures.length - 1]! : document;
}

test("워드마크는 접히면 폭이 0이 되고 DOM에는 남는다", async () => {
  await render(
    <div data-kds-fixture style={{ inlineSize: "280px" }}>
      <SidebarBrand mark={<span>K</span>} wordmark="Klipse" collapsed />
    </div>,
  );
  const wordmark = scope().querySelector<HTMLElement>(".kds-sidebar-brand__wordmark")!;
  expect(px(getComputedStyle(wordmark).maxInlineSize)).toBe(0);
  // 지우면 안 된다 — 접혔을 때도 브랜드 이름은 읽혀야 한다.
  expect(wordmark.textContent).toBe("Klipse");
});

test("브랜드 행은 40이고 마크 레일은 28이다 — 제품 실측", async () => {
  await render(
    <div data-kds-fixture style={{ inlineSize: "280px" }}>
      <SidebarBrand mark={<span>K</span>} wordmark="Klipse" />
    </div>,
  );
  const brand = scope().querySelector<HTMLElement>(".kds-sidebar-brand")!;
  const mark = scope().querySelector<HTMLElement>(".kds-sidebar-brand__mark")!;
  // 처음에는 행을 24로 두었는데 그것은 아이콘 슬롯 크기이지 행 높이가 아니었다.
  // 배포본은 헤더 행 min-height 40 · 로고 레일 28이다.
  expect(px(getComputedStyle(brand).minBlockSize)).toBe(40);
  expect(px(getComputedStyle(mark).minBlockSize)).toBe(28);
});

test("펼치면 워드마크가 보인다", async () => {
  await render(
    <div data-kds-fixture style={{ inlineSize: "280px" }}>
      <SidebarBrand mark={<span>K</span>} wordmark="Klipse" />
    </div>,
  );
  const wordmark = scope().querySelector<HTMLElement>(".kds-sidebar-brand__wordmark")!;
  expect(px(getComputedStyle(wordmark).maxInlineSize)).toBeGreaterThan(0);
});

test("CTA에 아이콘 슬롯이 없다 — 제품은 라벨 하나뿐이다", async () => {
  await render(
    <div data-kds-fixture style={{ inlineSize: "280px" }}>
      <SidebarCta label="업그레이드" />
    </div>,
  );
  const button = scope().querySelector<HTMLElement>(".kds-sidebar-cta__button")!;
  // 처음에 plus 글리프를 넣었는데 제품에는 없었다. 슬롯 자체를 두지 않는다.
  expect(button.querySelector(".kds-sidebar-cta__icon")).toBeNull();
  expect(button.children).toHaveLength(1);
});

test("CTA 색이 반전 solid pill이다 — mint도 브랜드 파랑도 아니다", async () => {
  await render(
    <div data-kds-fixture style={{ inlineSize: "280px" }}>
      <SidebarCta label="업그레이드" />
    </div>,
  );
  const button = scope().querySelector<HTMLElement>(".kds-sidebar-cta__button")!;
  const style = getComputedStyle(button);
  // 처음엔 브랜드 파랑, 다음엔 mint 16%로 고쳤는데 둘 다 제품에 없는 색이었다. mint는 기본
  // 선언이지만 형제 상수가 `:not(.active)`로 비활성 버튼의 색을 덮는다 — 실제로 그려지는 것은
  // 반전 solid pill이다. 값은 measured의 states 표가 소유한다.
  const spec = statesOf("sidebar-cta", "base");
  expect(style.backgroundColor).toBe(tokenValue(stateOf(spec, "Default").background as string));
  expect(style.color).toBe(tokenValue(stateOf(spec, "Default").foreground as string));
});

test("현재 위치면 한 단계 더 뒤집힌다 — aria-current가 소유한다", async () => {
  await render(
    <div data-kds-fixture style={{ inlineSize: "280px" }}>
      <SidebarCta label="업그레이드" current />
    </div>,
  );
  const button = scope().querySelector<HTMLElement>(".kds-sidebar-cta__button")!;
  expect(button.getAttribute("aria-current")).toBe("page");
  const spec = statesOf("sidebar-cta", "base");
  const style = getComputedStyle(button);
  expect(style.backgroundColor).toBe(tokenValue(stateOf(spec, "Current").background as string));
  expect(style.color).toBe(tokenValue(stateOf(spec, "Current").foreground as string));
});

test("접히면 높이와 여백이 함께 줄어든다 — 제품 실측 40→32, 14→10", async () => {
  await render(
    <div data-kds-fixture style={{ inlineSize: "72px" }}>
      <SidebarCta label="업그레이드" collapsed />
    </div>,
  );
  const button = scope().querySelector<HTMLElement>(".kds-sidebar-cta__button")!;
  const style = getComputedStyle(button);
  expect(px(style.minBlockSize)).toBe(32);
  expect(px(style.paddingInlineStart)).toBe(10);
  expect(px(style.paddingBlockStart)).toBe(0);
});

test("CTA가 바닥에 붙는다 — 내비 항목이 몇 개든", async () => {
  await render(
    <div
      data-kds-fixture
      style={{ inlineSize: "280px", blockSize: "400px", display: "flex", flexDirection: "column" }}
    >
      <div style={{ blockSize: "40px" }} />
      <SidebarCta label="업그레이드" />
    </div>,
  );
  const shell = scope() as HTMLElement;
  const cta = shell.querySelector<HTMLElement>(".kds-sidebar-cta")!;
  // `margin-block-start: auto`는 계산값이 실제 밀려난 픽셀로 풀린다. 그래서 선언이 아니라
  // **결과**를 잰다 — CTA 아래 모서리가 셸 바닥에 닿아야 계약이 성립한다.
  const shellBottom = shell.getBoundingClientRect().bottom;
  const ctaBottom = cta.getBoundingClientRect().bottom;
  expect(Math.abs(shellBottom - ctaBottom)).toBeLessThan(1);
});

test("접혀도 라벨이 보인다 — 54px까지 남기고 말줄임한다", async () => {
  await render(
    <div data-kds-fixture style={{ inlineSize: "72px" }}>
      <SidebarCta label="업그레이드" collapsed />
    </div>,
  );
  const button = scope().querySelector<HTMLButtonElement>(".kds-sidebar-cta__button")!;
  const label = scope().querySelector<HTMLElement>(".kds-sidebar-cta__label")!;
  const style = getComputedStyle(label);
  // 폭을 0으로 만들어 완전히 지우고 있었다. 배포본은 54까지 남기고 말줄임한다 — 아이콘이 없는
  // 버튼이라 라벨을 지우면 접힌 레일에 아무 단서도 남지 않는다.
  expect(px(style.maxInlineSize)).toBe(54);
  expect(style.textOverflow).toBe("ellipsis");
  expect(px(style.fontSize)).toBe(12);
  expect(button.textContent).toContain("업그레이드");
});

test("접힘 전환은 셸 값이다 — 컨트롤 220ms가 아니라 320ms", async () => {
  await render(
    <div data-kds-fixture style={{ inlineSize: "280px" }}>
      <SidebarBrand mark={<span>K</span>} wordmark="Klipse" />
    </div>,
  );
  const wordmark = scope().querySelector<HTMLElement>(".kds-sidebar-brand__wordmark")!;
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const duration = px(getComputedStyle(wordmark).transitionDuration);
  // 제품 실측 320ms. 캐러셀 점(220ms)과 곡선은 같고 지속만 다르다.
  expect(duration).toBeCloseTo(reduced ? 0 : 0.32, 3);
});
