// design/components/banner-carousel.md의 Acceptance tests를 실제 브라우저에서 검증한다.
//
// **이 파일의 요지는 "폭이 상태다"와 "톤이 테마가 아니다" 둘이다.** 점은 라벨이 없어 폭 말고
// 현재 위치를 말하는 것이 없고(DS-D-0019), 배너의 면은 사진이지 테마 표면이 아니라 톤 색이
// 라이트·다크에서 같아야 한다(DS-D-0020 이전의 색 계약).
import type { JSX } from "react";
import { expect, test } from "vitest";
import { render } from "vitest-browser-react";
import { userEvent } from "vitest/browser";
import { BannerCarousel } from "@klipse-design/react";
import type { BannerCarouselSlide } from "@klipse-design/react";
import "@klipse-design/css/layers.css";
import "@klipse-design/css/tokens.css";
import "@klipse-design/css/styles.css";

const px = (value: string): number => Number.parseFloat(value);

const SLIDES: readonly BannerCarouselSlide[] = [
  { id: "a", tone: "dark", title: "첫 배너", description: "설명 하나" },
  { id: "b", tone: "bright", title: "둘째 배너" },
  { id: "c", tone: "dark", title: "셋째 배너" },
];

function scope(): ParentNode {
  const fixtures = document.querySelectorAll("[data-kds-fixture]");
  return fixtures.length > 0 ? fixtures[fixtures.length - 1]! : document;
}

async function mount(node: JSX.Element): Promise<void> {
  // `render`는 비동기로 커밋한다. await 없이 질의하면 컨테이너가 비어 있다.
  await render(<div data-kds-fixture style={{ inlineSize: "960px" }}>{node}</div>);
  // **높이는 소비처가 정한다.** 슬라이드가 전부 absolute라 높이를 주지 않으면 섹션이 0으로
  // 접히고, `overflow: hidden`이 컨트롤을 잘라 클릭조차 되지 않는다. 제품도 호출부가 높이를
  // 준다. 테스트가 그 계약을 대신 지킨다.
  const root = scope().querySelector<HTMLElement>(".kds-banner-carousel")!;
  root.style.blockSize = "240px";
}

const dots = (): HTMLElement[] =>
  [...scope().querySelectorAll<HTMLElement>(".kds-banner-carousel__dot")];
const slides = (): HTMLElement[] =>
  [...scope().querySelectorAll<HTMLElement>(".kds-banner-carousel__slide")];

test("점의 폭이 상태다 — 활성 20px, 비활성 7px", async () => {
  // 자동 넘김을 끈다. 켜 두면 220ms 전환 도중에 재는 일이 생겨 값이 흔들린다.
  await mount(<BannerCarousel slides={SLIDES} label="홈 배너" autoAdvanceMs={0} />);
  const [first, second] = dots();
  expect(px(getComputedStyle(first!).inlineSize)).toBe(20);
  expect(px(getComputedStyle(second!).inlineSize)).toBe(7);
  // 높이는 상태가 아니다 — 알약이 찌그러지지 않는다는 뜻이고, scale을 쓰지 않은 이유다.
  expect(px(getComputedStyle(first!).blockSize)).toBe(7);
  expect(px(getComputedStyle(second!).blockSize)).toBe(7);
});

test("폭은 보조기술이 읽지 않으므로 aria가 함께 상태를 갖는다", async () => {
  await mount(<BannerCarousel slides={SLIDES} label="홈 배너" autoAdvanceMs={0} />);
  const [first, second] = dots();
  expect(first!.getAttribute("aria-selected")).toBe("true");
  expect(first!.getAttribute("aria-current")).toBe("true");
  expect(second!.getAttribute("aria-selected")).toBe("false");
  expect(second!.getAttribute("aria-current")).toBeNull();
});

test("비활성 슬라이드는 남아 있되 보조기술에서 지워지고 클릭을 훔치지 않는다", async () => {
  await mount(<BannerCarousel slides={SLIDES} label="홈 배너" autoAdvanceMs={0} />);
  const [active, resting] = slides();
  expect(active!.getAttribute("aria-hidden")).toBeNull();
  expect(resting!.getAttribute("aria-hidden")).toBe("true");
  expect(getComputedStyle(active!).pointerEvents).toBe("auto");
  expect(getComputedStyle(resting!).pointerEvents).toBe("none");
  // DOM에서 지우면 전환이 그려지지 않는다.
  expect(slides()).toHaveLength(3);
});

test("톤은 테마가 아니다 — 라이트와 다크에서 같은 색이 나온다", async () => {
  await mount(<BannerCarousel slides={SLIDES} label="홈 배너" autoAdvanceMs={0} />);
  const title = (): HTMLElement =>
    scope().querySelector<HTMLElement>(".kds-banner-carousel__title")!;
  const root = document.documentElement;
  const original = root.getAttribute("data-theme");

  root.setAttribute("data-theme", "light");
  const light = getComputedStyle(title()).color;
  root.setAttribute("data-theme", "dark");
  const dark = getComputedStyle(title()).color;

  if (original === null) root.removeAttribute("data-theme");
  else root.setAttribute("data-theme", original);

  expect(light).toBe(dark);
  // 첫 슬라이드는 tone="dark"라 밝은 글자여야 한다. 사진이 어두우면 글자가 밝다.
  expect(light).not.toBe("rgb(0, 0, 0)");
});

test("화살표와 점이 슬라이드를 바꾼다", async () => {
  await mount(<BannerCarousel slides={SLIDES} label="홈 배너" autoAdvanceMs={0} />);
  const next = scope().querySelectorAll<HTMLElement>(".kds-banner-carousel__arrow")[1]!;
  await userEvent.click(next);
  expect(dots()[1]!.getAttribute("aria-selected")).toBe("true");
  await userEvent.click(dots()[2]!);
  expect(dots()[2]!.getAttribute("aria-selected")).toBe("true");
  // 포인터를 치운다. 남기면 다음 테스트가 hover 상태의 값을 읽는다.
  await userEvent.unhover(dots()[2]!);
});

test("슬라이드가 하나면 컨트롤을 그리지 않는다", async () => {
  await mount(<BannerCarousel slides={[SLIDES[0]!]} label="홈 배너" autoAdvanceMs={0} />);
  expect(scope().querySelector(".kds-banner-carousel__controls")).toBeNull();
});

test("bleed=full이면 반경이 0이다", async () => {
  await mount(<BannerCarousel slides={SLIDES} label="홈 배너" bleed="full" autoAdvanceMs={0} />);
  const root = scope().querySelector<HTMLElement>(".kds-banner-carousel")!;
  expect(px(getComputedStyle(root).borderStartStartRadius)).toBe(0);
});

test("모션 계약 — 문맥에 따라 갈린다", async () => {
  await mount(<BannerCarousel slides={SLIDES} label="홈 배너" autoAdvanceMs={0} />);
  const dot = dots()[0]!;
  const slide = slides()[0]!;
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (reduced) {
    // 레이아웃 재계산이 가장 비싸므로 제일 먼저 꺼진다.
    expect(px(getComputedStyle(dot).transitionDuration)).toBe(0);
    expect(px(getComputedStyle(slide).transitionDuration)).toBe(0);
  } else {
    // 배포본 실측: 점 220ms, 슬라이드 420ms(opacity) + 680ms(scale).
    const dotDurations = getComputedStyle(dot).transitionDuration.split(",").map((v) => px(v));
    expect(dotDurations[0]).toBeCloseTo(0.22, 3);
    const slideDurations = getComputedStyle(slide).transitionDuration.split(",").map((v) => px(v));
    expect(slideDurations).toEqual([0.42, 0.68]);
  }
});
