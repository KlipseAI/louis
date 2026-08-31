// design/components/banner-carousel.md의 Acceptance tests를 실제 브라우저에서 검증한다.
//
// **이 파일의 요지는 "밝기가 상태다"와 "톤이 테마가 아니다" 둘이다.** 인디케이터 세 칸은 폭이
// 같고 활성 칸만 밝으며(DS-D-0033 이 DS-D-0019 의 「폭이 상태다」를 뒤집었다), 배너의 면은
// 사진이지 테마 표면이 아니라 톤 색이 라이트·다크에서 같아야 한다(DS-D-0020 이전의 색 계약).
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

/**
 * 계산된 색의 알파. **표기가 하나가 아니다** — 토큰이 `color(srgb …)`로 굳으면 브라우저도
 * `color(srgb 1 1 1 / 0.28)`로 돌려주고 `rgba(…)`가 아니다. 문자열을 정규식으로 보면 그 차이에
 * 걸려 넘어지므로 알파만 떼어 본다.
 */
const alphaOf = (color: string): number => {
  const slash = /\/\s*([\d.]+)\s*\)/.exec(color);
  if (slash) return Number.parseFloat(slash[1]!);
  const rgba = /rgba?\(([^)]*)\)/.exec(color);
  if (rgba) {
    const parts = rgba[1]!.split(",").map((v) => v.trim());
    return parts.length === 4 ? Number.parseFloat(parts[3]!) : 1;
  }
  return 1;
};

const SLIDES: readonly BannerCarouselSlide[] = [
  { id: "a", tone: "dark", title: "첫 배너", description: "설명 하나" },
  { id: "b", tone: "bright", title: "둘째 배너" },
  { id: "c", tone: "dark", title: "셋째 배너" },
];

function scope(): ParentNode {
  const fixtures = document.querySelectorAll("[data-louis-fixture]");
  return fixtures.length > 0 ? fixtures[fixtures.length - 1]! : document;
}

async function mount(node: JSX.Element): Promise<void> {
  // `render`는 비동기로 커밋한다. await 없이 질의하면 컨테이너가 비어 있다.
  await render(<div data-louis-fixture style={{ inlineSize: "960px" }}>{node}</div>);
  // **높이는 소비처가 정한다.** 슬라이드가 전부 absolute라 높이를 주지 않으면 섹션이 0으로
  // 접히고, `overflow: hidden`이 컨트롤을 잘라 클릭조차 되지 않는다. 제품도 호출부가 높이를
  // 준다. 테스트가 그 계약을 대신 지킨다.
  const root = scope().querySelector<HTMLElement>(".louis-banner-carousel")!;
  root.style.blockSize = "240px";
}

const dots = (): HTMLElement[] =>
  [...scope().querySelectorAll<HTMLElement>(".louis-banner-carousel__dot")];
const slides = (): HTMLElement[] =>
  [...scope().querySelectorAll<HTMLElement>(".louis-banner-carousel__slide")];

test("사진 위에 스크림이 없다 — 배경은 사진 한 겹이다", async () => {
  await mount(
    <BannerCarousel
      label="배너"
      slides={[{ ...SLIDES[0]!, imageUrl: "data:image/gif;base64,R0lGODlhAQABAAAAACw=" }]}
    />,
  );
  const slide = slides()[0]!;
  const layers = getComputedStyle(slide).backgroundImage;
  // 좌→우 스크림(78% → 46% → 0)이 걷혔다. 글자가 가운데로 오면서 그 어둠은 대비가 아니라
  // 사진을 한쪽만 어둡게 만드는 일이 됐다. 이제 소비처가 넘긴 사진만 남는다.
  expect(layers).toContain("url(");
  expect(layers).not.toContain("linear-gradient");
});

test("흐림은 한 층이다 — ::after 가 제목 위에 칠해질 자리를 만들지 않는다", async () => {
  await mount(<BannerCarousel label="배너" slides={SLIDES} />);
  const slide = slides()[0]!;
  // 위·아래 두 밴드를 `::before` 와 `::after` 로 하나씩 두면 `::after` 가 콘텐츠 **뒤**에 와서
  // 제목 위에 칠해진다 — 예전 스크림이 정확히 그 이유로 `::after` 를 떠났다. 두 밴드를 한 층의
  // 마스크 두 겹으로 쌓아 그 상태가 구조적으로 생기지 않게 한다.
  expect(getComputedStyle(slide, "::after").backdropFilter).toBe("none");
  // reduced-motion 에서는 흐림 자체가 꺼지므로 `::before` 도 none 이다. 그래도 요지는 남는다 —
  // 흐림이 어디에 살든 `::after` 에는 없다.
  if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    expect(getComputedStyle(slide, "::before").backdropFilter).not.toBe("none");
  }
});

test("흐림 밴드는 위·아래 20%다 — 가운데는 흐리지 않다", async () => {
  await mount(<BannerCarousel label="배너" slides={SLIDES} />);
  const band = getComputedStyle(slides()[0]!, "::before");
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    // 움직임을 줄여 달라고 하면 흐림 자체를 지운다 — 밴드를 잴 것이 남지 않는다.
    expect(band.backdropFilter).toBe("none");
    expect(band.maskImage).toBe("none");
    return;
  }
  // 마스크가 두 겹이고 각 겹이 20% 높이로 위·아래에 붙는다. 겹치지 않으므로 가운데 60%는
  // 마스크 알파가 0 — 흐림이 걸리지 않는다.
  expect(band.maskImage.split("linear-gradient").length - 1).toBe(2);
  expect(band.maskSize).toBe("100% 20%, 100% 20%");
  expect(band.maskPosition).toBe("50% 0%, 50% 100%");
});

test("인디케이터는 밝기가 상태다 — 폭은 셋 다 30px로 같다", async () => {
  await mount(<BannerCarousel slides={SLIDES} label="홈 배너" autoAdvanceMs={0} />);
  const [first, second, third] = dots();
  // 폭으로 말하던 시절에는 활성 칸이 7 → 20px 로 늘어 옆 칸을 밀었다. 가운데 정렬 배너에서
  // 그 밀림은 인디케이터 전체를 슬라이드마다 좌우로 흔든다(DS-D-0033).
  for (const dot of [first, second, third]) {
    expect(px(getComputedStyle(dot!).inlineSize)).toBe(30);
    expect(px(getComputedStyle(dot!).blockSize)).toBe(2);
  }
  const rest = getComputedStyle(second!).backgroundColor;
  const active = getComputedStyle(first!).backgroundColor;
  expect(active).not.toBe(rest);
  // 활성은 불투명하고 쉬는 칸은 비친다 — 그 차이가 상태를 말한다.
  expect(alphaOf(rest)).toBeCloseTo(0.28, 2);
  expect(alphaOf(active)).toBe(1);
});

test("2px 막대는 그대로는 누를 수 없다 — 탭 타깃을 위아래로 넓힌다", async () => {
  await mount(<BannerCarousel slides={SLIDES} label="홈 배너" autoAdvanceMs={0} />);
  const target = getComputedStyle(dots()[0]!, "::before");
  // 보이는 막대는 2px 다. 레이아웃 기하를 건드리지 않고 위아래로 8px 씩만 넓힌다 — 18px.
  expect(px(target.insetBlockStart)).toBe(-8);
  expect(px(target.insetBlockEnd)).toBe(-8);
});

test("컨트롤은 하단 가운데다 — 알약은 data-controls=pill 로 남는다", async () => {
  await mount(<BannerCarousel slides={SLIDES} label="홈 배너" autoAdvanceMs={0} />);
  const root = scope().querySelector<HTMLElement>(".louis-banner-carousel")!;
  const controls = scope().querySelector<HTMLElement>(".louis-banner-carousel__controls")!;
  const rootBox = root.getBoundingClientRect();
  const box = controls.getBoundingClientRect();
  // 본문이 가운데 정렬이라 컨트롤도 같은 축을 본다.
  expect(box.left + box.width / 2 - (rootBox.left + rootBox.width / 2)).toBeCloseTo(0, 1);
  expect(rootBox.bottom - box.bottom).toBeCloseTo(16, 1);
  // 좌우를 다 잡은 대가로 생긴 투명한 띠가 슬라이드의 클릭을 훔치지 않는다.
  expect(getComputedStyle(controls).pointerEvents).toBe("none");
  expect(getComputedStyle(scope().querySelector(".louis-banner-carousel__dots")!).pointerEvents).toBe(
    "auto",
  );
});

test("본문은 배너 한가운데다", async () => {
  await mount(<BannerCarousel slides={SLIDES} label="홈 배너" autoAdvanceMs={0} />);
  const content = scope().querySelector<HTMLElement>(".louis-banner-carousel__content")!;
  const style = getComputedStyle(content);
  expect(style.textAlign).toBe("center");
  expect(style.alignItems).toBe("center");
  const slideBox = slides()[0]!.getBoundingClientRect();
  const box = content.getBoundingClientRect();
  expect(box.left - slideBox.left).toBeCloseTo(slideBox.right - box.right, 1);
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
    scope().querySelector<HTMLElement>(".louis-banner-carousel__title")!;
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
  await mount(
    <BannerCarousel slides={SLIDES} label="홈 배너" controls="pill" autoAdvanceMs={0} />,
  );
  // 화살표는 `pill` 배치에만 있다. autoAdvanceMs=0이라 정지 버튼이 없어 [0]=이전, [1]=다음.
  const next = scope().querySelectorAll<HTMLElement>(".louis-banner-carousel__arrow")[1]!;
  await userEvent.click(next);
  expect(dots()[1]!.getAttribute("aria-selected")).toBe("true");
  await userEvent.click(dots()[2]!);
  expect(dots()[2]!.getAttribute("aria-selected")).toBe("true");
  // 포인터를 치운다. 남기면 다음 테스트가 hover 상태의 값을 읽는다.
  await userEvent.unhover(dots()[2]!);
});

test("자동 넘김을 멈출 수 있다 — WCAG 2.2.2", async () => {
  await mount(<BannerCarousel slides={SLIDES} label="홈 배너" autoAdvanceMs={5000} />);
  const buttons = [...scope().querySelectorAll<HTMLElement>(".louis-banner-carousel__arrow")];
  // **정지 버튼은 배치와 무관하다.** 기본 배치에는 화살표가 없어 이 하나뿐이다 — 움직이는 것을
  // 멈추는 것은 장식이 아니라 계약이라 배치가 바뀌어도 사라지지 않는다.
  expect(buttons).toHaveLength(1);
  const toggle = buttons.find((b) => b.getAttribute("aria-pressed") !== null)!;
  expect(toggle.getAttribute("aria-pressed")).toBe("false");
  expect(toggle.getAttribute("aria-label")).toContain("정지");
  await userEvent.click(toggle);
  expect(toggle.getAttribute("aria-pressed")).toBe("true");
  expect(toggle.getAttribute("aria-label")).toContain("시작");
  await userEvent.unhover(toggle);
});

test("자동 넘김을 끄면 정지 버튼도 그리지 않는다", async () => {
  await mount(<BannerCarousel slides={SLIDES} label="홈 배너" autoAdvanceMs={0} />);
  // 기본 배치에는 화살표가 없으므로 남는 버튼이 하나도 없다.
  expect(scope().querySelectorAll(".louis-banner-carousel__arrow")).toHaveLength(0);
});

test("pill 배치는 화살표와 알약 면을 되살린다", async () => {
  await mount(
    <BannerCarousel slides={SLIDES} label="홈 배너" controls="pill" autoAdvanceMs={0} />,
  );
  const controls = scope().querySelector<HTMLElement>(".louis-banner-carousel__controls")!;
  const style = getComputedStyle(controls);
  expect(scope().querySelectorAll(".louis-banner-carousel__arrow")).toHaveLength(2);
  expect(style.backgroundColor).not.toBe("rgba(0, 0, 0, 0)");
  expect(style.pointerEvents).toBe("auto");
  // 알약은 우하단으로 되돌아간다 — 가운데가 아니다.
  const root = scope().querySelector<HTMLElement>(".louis-banner-carousel")!;
  const rootBox = root.getBoundingClientRect();
  const box = controls.getBoundingClientRect();
  expect(rootBox.right - box.right).toBeCloseTo(16, 1);
  expect(box.left + box.width / 2 - (rootBox.left + rootBox.width / 2)).not.toBeCloseTo(0, 1);
});

test("슬라이드가 하나면 컨트롤을 그리지 않는다", async () => {
  await mount(<BannerCarousel slides={[SLIDES[0]!]} label="홈 배너" autoAdvanceMs={0} />);
  expect(scope().querySelector(".louis-banner-carousel__controls")).toBeNull();
});

test("bleed=full이면 반경이 0이다", async () => {
  await mount(<BannerCarousel slides={SLIDES} label="홈 배너" bleed="full" autoAdvanceMs={0} />);
  const root = scope().querySelector<HTMLElement>(".louis-banner-carousel")!;
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
    // 슬라이드 420ms(opacity) + 680ms(scale). 인디케이터는 폭이 아니라 색만 바뀌므로
    // 레이아웃 전환 220ms 가 사라지고 컨트롤 호버 160ms 하나만 남는다.
    const dotDurations = getComputedStyle(dot).transitionDuration.split(",").map((v) => px(v));
    expect(dotDurations).toEqual([0.16]);
    const slideDurations = getComputedStyle(slide).transitionDuration.split(",").map((v) => px(v));
    expect(slideDurations).toEqual([0.42, 0.68]);
  }
});
