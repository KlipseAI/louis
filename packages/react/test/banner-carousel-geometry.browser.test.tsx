// figma/components.measured.json 의 **banner-carousel** 값을 코드가 여전히 만드는지 검증한다(DS-D-0035 (c)).
//
// parity 게이트는 Figma 가 기록과 같은지만 본다. 이 파일이 없으면 CSS 가 조용히 바뀌어도 **Figma 와 기록은 서로 맞고
// 둘 다 코드와 틀린** 상태로 통과한다. 그래서 기록의 키(= Figma 의 Bleed 축 boxed · full)마다 LOUIS React 컴포넌트를
// 렌더하고, parity 계약(scripts/verify-figma-parity.mjs 의 banner-carousel)이 거는 필드를 계산값과 맞댄다.
//
// **폭 960 · 높이 360 은 소비처가 준다.** 슬라이드가 전부 absolute 라 높이를 주지 않으면 섹션이 접힌다(banner-carousel.css
// 머리 주석). 제품 호출부가 `h-180`(격자 2px → 360)을 주므로 시험도 그 계약을 대신 지키고, 그 위에서 반경 · 본문 칸 ·
// 컨트롤 묶음 · 정지 버튼 · 막대가 기록과 같은지를 잰다. 컨트롤은 기본 배치(`indicator`)다 — Figma 가 모델링하는
// 배치가 그것이고 계약이 화살표 둘을 뺀 이유와 같다. 대비 · 상태 · 키보드는 banner-carousel.browser.test.tsx 가 소유한다.
import { expect, test } from "vitest";
import { render } from "vitest-browser-react";
import { BannerCarousel } from "@klipse-design/react";
import type { BannerCarouselBleed, BannerCarouselSlide } from "@klipse-design/react";
import measured from "../../../figma/components.measured.json" with { type: "json" };
import "@klipse-design/css/layers.css";
import "@klipse-design/css/tokens.css";
import "@klipse-design/css/styles.css";

const spec = measured.components["banner-carousel"].sizes;

const px = (value: string): number => Number.parseFloat(value);
const round = (value: number): number => Math.round(value * 100) / 100;

const SLIDES: readonly BannerCarouselSlide[] = [
  { id: "a", tone: "dark", title: "첫 배너", description: "설명 하나" },
  { id: "b", tone: "bright", title: "둘째 배너" },
  { id: "c", tone: "dark", title: "셋째 배너" },
];

function one<T extends Element>(root: ParentNode, selector: string): T {
  const node = root.querySelector<T>(selector);
  if (node === null) throw new Error(`찾지 못했습니다: ${selector}`);
  return node;
}

async function mount(bleed: BannerCarouselBleed, width: number, height: number): Promise<HTMLElement> {
  // `render` 는 비동기로 커밋한다. await 없이 질의하면 컨테이너가 비어 있다.
  const screen = await render(
    <div data-testid="fixture" style={{ inlineSize: `${width}px` }}>
      {/* 자동 넘김을 끄지 않는다 — 정지 버튼이 컨트롤 폭 134 의 일부다(28 + 8 + 98). */}
      <BannerCarousel label="배너" slides={SLIDES} bleed={bleed} />
    </div>,
  );
  const root = one<HTMLElement>(screen.container, ".louis-banner-carousel");
  root.style.blockSize = `${height}px`;
  return root;
}

const KEYS = Object.keys(spec) as (keyof typeof spec)[];

test("기록의 키가 Bleed 축 둘이다 — 키가 늘면 이 파일이 그 키를 재야 한다", () => {
  expect([...KEYS].sort()).toEqual(["boxed", "full"]);
});

for (const key of KEYS) {
  const want = spec[key];

  test(`banner-carousel ${key}: 루트의 폭 · 높이 · 반경이 기록과 같다`, async () => {
    const root = await mount(key, want.width, want.height);
    expect(root.dataset.bleed ?? "boxed").toBe(key);
    const box = root.getBoundingClientRect();
    expect(round(box.width)).toBe(want.width);
    expect(round(box.height)).toBe(want.height);
    expect(px(getComputedStyle(root).borderTopLeftRadius)).toBe(want.radius);
  });

  test(`banner-carousel ${key}: 본문 칸이 540 폭 · 위 24 · 왼쪽 20 여백이다`, async () => {
    const root = await mount(key, want.width, want.height);
    const content = one<HTMLElement>(root, ".louis-banner-carousel__slide[data-active=\"true\"] .louis-banner-carousel__content");
    const box = content.getBoundingClientRect();
    const style = getComputedStyle(content);
    expect(round(box.width)).toBe(want.contentInline);
    // 계약의 Content.height 는 루트 높이와 같은 키를 본다 — 본문이 배너 높이를 다 채운다.
    expect(round(box.height)).toBe(want.height);
    expect(px(style.paddingTop)).toBe(want.contentBlockPadding);
    expect(px(style.paddingLeft)).toBe(want.contentInlinePadding);
  });

  test(`banner-carousel ${key}: 컨트롤 묶음의 폭 · 높이 · 간격이 기록과 같다`, async () => {
    const root = await mount(key, want.width, want.height);
    const controls = one<HTMLElement>(root, ".louis-banner-carousel__controls");
    expect(controls.dataset.controls).toBe("indicator");
    // 컨트롤은 좌우를 다 잡는 띠라(`inset-inline: 0`) 띠의 폭이 아니라 **자식 묶음의 외곽**이 계약의 폭이다.
    const children = [...controls.children] as HTMLElement[];
    const boxes = children.map((child) => child.getBoundingClientRect());
    const left = Math.min(...boxes.map((b) => b.left));
    const right = Math.max(...boxes.map((b) => b.right));
    const top = Math.min(...boxes.map((b) => b.top));
    const bottom = Math.max(...boxes.map((b) => b.bottom));
    expect(round(right - left)).toBe(want.controlsWidth);
    expect(round(bottom - top)).toBe(want.controlsHeight);
    expect(px(getComputedStyle(controls).columnGap)).toBe(want.controlsGap);
    // 막대 사이 간격(계약 밖이지만 기록의 dotsGap 이다 — 134 의 98 = 30·4·30·4·30 이 여기서 떨어진다).
    const dots = one<HTMLElement>(root, ".louis-banner-carousel__dots");
    expect(px(getComputedStyle(dots).columnGap)).toBe(want.dotsGap);
  });

  test(`banner-carousel ${key}: 정지 버튼이 28 원형이고 글리프가 하나다`, async () => {
    const root = await mount(key, want.width, want.height);
    const toggle = one<HTMLElement>(root, ".louis-banner-carousel__controls [aria-pressed]");
    const box = toggle.getBoundingClientRect();
    expect(round(box.width)).toBe(want.arrowSize);
    expect(round(box.height)).toBe(want.arrowSize);
    expect(px(getComputedStyle(toggle).borderTopLeftRadius)).toBe(want.arrowRadius);
    expect(toggle.children.length).toBe(want.controlGlyphCount);
  });

  test(`banner-carousel ${key}: 활성 막대와 쉬는 막대가 같은 30 × 2 알약이다`, async () => {
    const root = await mount(key, want.width, want.height);
    const active = one<HTMLElement>(root, ".louis-banner-carousel__dot[aria-current=\"true\"]");
    const rest = one<HTMLElement>(root, ".louis-banner-carousel__dot:not([aria-current])");
    for (const dot of [active, rest]) {
      const box = dot.getBoundingClientRect();
      expect(round(box.width)).toBe(want.dotWidth);
      expect(round(box.height)).toBe(want.dotHeight);
      expect(px(getComputedStyle(dot).borderTopLeftRadius)).toBe(want.dotRadius);
    }
  });
}
