// design/components/app-shell-parts.md의 Acceptance tests를 실제 브라우저에서 검증한다.
//
// **이 파일의 요지는 "접힘은 폭이고, 이름은 남는다" 둘이다.** 접힌 사이드바에서 라벨을
// DOM에서 지우면 버튼의 접근 가능한 이름이 사라져 스크린 리더가 "버튼"만 읽는다.
import { expect, test } from "vitest";
import { render } from "vitest-browser-react";
import { SidebarBrand, SidebarCta } from "@klipse-design/react";
import "@klipse-design/css/layers.css";
import "@klipse-design/css/tokens.css";
import "@klipse-design/css/styles.css";

const px = (value: string): number => Number.parseFloat(value);

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

test("펼치면 워드마크가 보인다", async () => {
  await render(
    <div data-kds-fixture style={{ inlineSize: "280px" }}>
      <SidebarBrand mark={<span>K</span>} wordmark="Klipse" />
    </div>,
  );
  const wordmark = scope().querySelector<HTMLElement>(".kds-sidebar-brand__wordmark")!;
  expect(px(getComputedStyle(wordmark).maxInlineSize)).toBeGreaterThan(0);
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

test("접혀도 버튼의 접근 가능한 이름이 남는다", async () => {
  await render(
    <div data-kds-fixture style={{ inlineSize: "72px" }}>
      <SidebarCta label="업그레이드" collapsed />
    </div>,
  );
  const button = scope().querySelector<HTMLButtonElement>(".kds-sidebar-cta__button")!;
  const label = scope().querySelector<HTMLElement>(".kds-sidebar-cta__label")!;
  expect(px(getComputedStyle(label).maxInlineSize)).toBe(0);
  // 폭이 0이어도 텍스트는 남아야 접근 가능한 이름이 성립한다.
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
