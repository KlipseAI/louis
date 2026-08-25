// design/components/spinner.md의 Acceptance tests를 실제 브라우저에서 검증한다.
//
// 제품의 로딩 표현은 약 62벌이지만 이번에는 **정본이 뚜렷하다** — 공용 LoadingSpinner의 recipe가
// motion-loop와 정확히 같다. 그래서 이 파일이 보는 것은 "제품 값을 옮겼는가"보다
// **"reduced-motion에서 회전이 멈춰도 의미가 남는가"** 쪽이다.
import type { JSX } from "react";
import { expect, test } from "vitest";
import { render } from "vitest-browser-react";
import { Spinner, type SpinnerSize } from "@klipse-design/react";
import measured from "../../../figma/components.measured.json" with { type: "json" };
import "@klipse-design/css/layers.css";
import "@klipse-design/css/tokens.css";
import "@klipse-design/css/styles.css";

declare const __LOUIS_REDUCED_MOTION__: boolean;

const px = (value: string): number => Number.parseFloat(value);
const round = (value: number): number => Math.round(value * 1000) / 1000;

function find(selector: string): HTMLElement {
  const node = document.querySelector(selector);
  if (node === null) throw new Error(`찾지 못했습니다: ${selector}`);
  return node as HTMLElement;
}

const SIZES: readonly SpinnerSize[] = ["md", "sm"];

for (const size of SIZES) {
  const spec = measured.components.spinner.sizes[size];

  test(`Spinner ${size}의 구조값이 components.measured.json과 같다`, async () => {
    await render(<Spinner size={size} label="불러오는 중" />);
    const ring = find(".louis-spinner__ring");
    const box = ring.getBoundingClientRect();

    expect(round(box.width), "width").toBe(spec.width);
    expect(round(box.height), "height").toBe(spec.height);
    // 정원이 계약이다. 한쪽만 맞아도 타원이 된다.
    expect(round(box.width), "정원").toBe(round(box.height));

    // sm의 링은 md의 절반이다 — 리터럴이 아니라 calc(ring / 2)로 적혀 있다.
    const track = getComputedStyle(ring, "::before");
    expect(px(track.borderTopWidth), "ringWidth").toBe(spec.ringWidth);
  });
}

test("링이 둘이다 — 트랙과 진행", async () => {
  // 트랙이 없으면 회전하는 조각이 어디를 도는지 보이지 않아 "무언가 깜빡인다"로 읽힌다.
  // 이전 DS의 spinner는 트랙 없이 위쪽 테두리만 비웠고 그것은 제품과 다른 표현이었다.
  await render(
    <span style={{ color: "rgb(10, 20, 30)" }}>
      <Spinner label="불러오는 중" />
    </span>,
  );
  const ring = find(".louis-spinner__ring");
  const track = getComputedStyle(ring, "::before");
  const arc = getComputedStyle(ring, "::after");

  // 트랙은 네 변이 모두 칠해진다.
  for (const side of ["borderTopColor", "borderRightColor", "borderBottomColor"] as const) {
    expect(track[side], `트랙 ${side}`).not.toBe("rgba(0, 0, 0, 0)");
  }
  // 진행은 위쪽 한 조각만 칠해진다.
  expect(arc.borderTopColor, "진행은 현재 색").toBe("rgb(10, 20, 30)");
  expect(arc.borderRightColor, "나머지는 투명").toBe("rgba(0, 0, 0, 0)");

  // 트랙은 현재 색을 흐리게 한 것이다 — 색 토큰이 아니라 currentColor에 달려 있다.
  expect(track.borderTopColor, "트랙이 현재 색과 다르다").not.toBe(arc.borderTopColor);
});

test("색을 물려받는다", async () => {
  // 버튼 안에서는 버튼 글자색, 본문에서는 본문 색이 된다. semantic 토큰으로 고정하지 않는다.
  await render(
    <span style={{ color: "rgb(200, 30, 40)" }}>
      <Spinner label="불러오는 중" />
    </span>,
  );
  expect(getComputedStyle(find(".louis-spinner__ring"), "::after").borderTopColor).toBe(
    "rgb(200, 30, 40)",
  );
});

test("loop recipe가 토큰에서 온다", async () => {
  await render(<Spinner label="불러오는 중" />);
  const style = getComputedStyle(find(".louis-spinner__ring"));
  const root = getComputedStyle(document.documentElement);
  const ms = (value: string): number =>
    value.trim().endsWith("ms")
      ? Number.parseFloat(value)
      : Number.parseFloat(value) * 1000;

  const expected = __LOUIS_REDUCED_MOTION__
    ? root.getPropertyValue("--louis-motion-reduced-duration")
    : root.getPropertyValue("--louis-motion-spin-duration");
  expect(ms(style.animationDuration), "duration").toBe(ms(expected));
  expect(style.animationTimingFunction, "등속").toBe(
    root.getPropertyValue("--louis-motion-spin-timing-function").trim(),
  );
  // **이름 하나에 본문 하나.** button·menu·spinner가 같은 keyframe을 쓴다.
  expect(style.animationName, "공용 keyframe").toBe("louis-spin");
});

test("reduced-motion에서 회전이 멈춰도 의미가 남는다", async () => {
  // DS-D-0016 — loop는 짧아지는 것이 아니라 사라진다. 그 대체가 role/aria-busy다.
  await render(<Spinner label="불러오는 중" />);
  const ring = find(".louis-spinner__ring");
  const root = find(".louis-spinner");

  expect(getComputedStyle(ring).animationIterationCount, "iteration").toBe(
    __LOUIS_REDUCED_MOTION__ ? "1" : "infinite",
  );
  // 회전 여부와 무관하게 항상 참이어야 한다.
  expect(root.getAttribute("role"), "role").toBe("status");
  expect(root.getAttribute("aria-busy"), "aria-busy").toBe("true");
  expect(root.getAttribute("aria-label"), "이름").toBe("불러오는 중");
});

test("label이 없으면 장식이 된다", async () => {
  // 라벨을 가진 부모가 이미 진행을 알리고 있을 때 쓴다. 여기서 또 알리면 같은 사실을 두 번 읽는다.
  await render(<Spinner />);
  const root = find(".louis-spinner");
  expect(root.getAttribute("aria-hidden"), "숨는다").toBe("true");
  expect(root.getAttribute("role"), "role 없음").toBeNull();
  expect(root.getAttribute("aria-live"), "live 없음").toBeNull();
  expect(root.getAttribute("aria-busy"), "busy 없음").toBeNull();
});

test("기본 라벨 문자열을 배포하지 않는다", async () => {
  // 제품에 aria-label="Loading"이 하드코딩된 자리가 있다. DS가 기본값을 두면 그 하드코딩을
  // 시스템 전체로 퍼뜨리는 셈이 된다 — 문구는 i18n을 가진 호출부가 소유한다.
  await render(<Spinner />);
  const html = find(".louis-spinner").outerHTML;
  expect(html).not.toContain("Loading");
  expect(html).not.toContain("로딩");
});

export type _EnsureTsx = JSX.Element;
