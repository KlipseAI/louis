// DS-D-0016의 Acceptance tests를 실제 브라우저에서 검증한다.
//
// 이 파일이 생기기 전까지 **회전 둘이 게이트 밖에 있었다** — `animation: ... 1s linear infinite`의
// duration과 easing이 리터럴이라 토큰을 바꿔도 따라오지 않았고, reduced-motion에서 실제로 멈추는지
// 확인하는 것도 없었다. 두 project(browser / browser-reduced-motion)가 각각 자기 쪽을 본다.
import type { JSX } from "react";
import { expect, test } from "vitest";
import { render } from "vitest-browser-react";
import { Button } from "@klipse-design/react";
import "@klipse-design/css/layers.css";
import "@klipse-design/css/tokens.css";
import "@klipse-design/css/styles.css";

declare const __KDS_REDUCED_MOTION__: boolean;

function find(selector: string): HTMLElement {
  const node = document.querySelector(selector);
  if (node === null) throw new Error(`찾지 못했습니다: ${selector}`);
  return node as HTMLElement;
}

const tokenValue = (id: string): string =>
  getComputedStyle(document.documentElement).getPropertyValue(`--kds-${id}`).trim();

/**
 * 시간 값을 ms로 접는다.
 *
 * **단위로 비교하지 않는다.** 토큰은 `700ms`인데 getComputedStyle은 `0.7s`로 정규화해서 돌려준다 —
 * 문자열로 대조하면 값이 같은데도 실패한다.
 */
const ms = (value: string): number => {
  const trimmed = value.trim();
  return trimmed.endsWith("ms")
    ? Number.parseFloat(trimmed)
    : Number.parseFloat(trimmed) * 1000;
};

test("spinner의 loop recipe가 토큰에서 온다", async () => {
  await render(
    <Button loading>
      저장
    </Button>,
  );
  const spinner = find(".kds-button__spinner");
  const style = getComputedStyle(spinner);

  // 리터럴이던 자리다. 토큰을 바꾸면 여기가 따라와야 한다.
  const duration = __KDS_REDUCED_MOTION__ ? "motion-reduced-duration" : "motion-loop-duration";
  expect(ms(style.animationDuration), "duration이 토큰에서 온다").toBe(ms(tokenValue(duration)));

  // easing은 reduced에서도 loop 것을 유지한다 — 멈추는 것은 iteration이지 곡선이 아니다.
  expect(style.animationTimingFunction, "등속이다").toBe(
    tokenValue("motion-loop-timing-function"),
  );
  expect(style.animationName, "keyframe이 붙어 있다").not.toBe("none");
});

test("reduced-motion에서 회전이 멈추고 진행은 aria가 남긴다", async () => {
  // DS-D-0016 — loop는 짧아지는 것이 아니라 사라진다. 의미는 aria-busy가 유지한다.
  await render(
    <Button loading>
      저장
    </Button>,
  );
  const spinner = find(".kds-button__spinner");
  const iteration = getComputedStyle(spinner).animationIterationCount;

  if (__KDS_REDUCED_MOTION__) {
    expect(iteration, "reduce에서 한 바퀴만 돈다").toBe("1");
  } else {
    expect(iteration, "평시에는 무한이다").toBe("infinite");
  }

  // 회전이 멈추든 아니든 "진행 중"이라는 사실은 남아야 한다.
  const button = find("button.kds-button");
  expect(
    button.getAttribute("aria-busy") ?? button.getAttribute("aria-disabled"),
    "진행 중이라는 의미가 aria로 남는다",
  ).not.toBeNull();
});

test("loop duration이 700ms다", () => {
  // 제품의 우세값이다(회전 22벌 중 10벌). 이전 DS의 1s는 제품 어디와도 일치하지 않았다.
  expect(tokenValue("motion-loop-duration")).toBe("700ms");
  expect(tokenValue("motion-loop-timing-function")).toBe("cubic-bezier(0, 0, 1, 1)");
});

export type _EnsureTsx = JSX.Element;
