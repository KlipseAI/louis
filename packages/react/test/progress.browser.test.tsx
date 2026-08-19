// Progress의 접근성 계약(DS-D-0022)과 기하를 브라우저가 확인한다.
// **값이 DOM에 있고 보조기술이 읽는다**가 이 컴포넌트의 요지이므로 aria가 테스트의 중심이다.
import type { JSX } from "react";
import { expect, test, vi } from "vitest";
import { render } from "vitest-browser-react";
import { ProgressBar, ProgressRing } from "@klipse-design/react";
import measured from "../../../figma/components.measured.json";
import "@klipse-design/css/layers.css";
import "@klipse-design/css/tokens.css";
import "@klipse-design/css/styles.css";

const px = (value: string): number => Number.parseFloat(value);

function scope(): ParentNode {
  const fixtures = document.querySelectorAll("[data-kds-fixture]");
  return fixtures.length > 0 ? fixtures[fixtures.length - 1]! : document;
}

const barSpec = measured.components["progress-bar"].sizes.base;
const ringSpec = measured.components["progress-ring"].sizes.base;

/** 토큰 이름을 브라우저가 계산한 값으로 바꾼다. 리터럴을 적으면 토큰이 움직여도 통과한다. */
function tokenValue(token: string): string {
  const probe = document.createElement("div");
  probe.style.color = `var(--kds-${token})`;
  document.body.append(probe);
  const value = getComputedStyle(probe).color;
  probe.remove();
  return value;
}

test("트랙이 값을 갖는다 — 채움은 장식이다", async () => {
  await render(
    <div data-kds-fixture>
      <ProgressBar aria-label="업로드" value={42} />
    </div>,
  );
  const track = scope().querySelector<HTMLElement>(".kds-progress-bar")!;
  const fill = scope().querySelector<HTMLElement>(".kds-progress-bar__fill")!;
  expect(track.getAttribute("role")).toBe("progressbar");
  expect(track.getAttribute("aria-valuenow")).toBe("42");
  expect(track.getAttribute("aria-valuemin")).toBe("0");
  expect(track.getAttribute("aria-valuemax")).toBe("100");
  // 채움에 role을 걸면 폭이 0일 때 이름째 사라진다.
  expect(fill.getAttribute("role")).toBeNull();
  expect(fill.getAttribute("aria-hidden")).toBe("true");
});

test("indeterminate는 aria-valuenow를 아예 넣지 않는다", async () => {
  await render(
    <div data-kds-fixture>
      <ProgressBar aria-label="분석 중" indeterminate />
    </div>,
  );
  const track = scope().querySelector<HTMLElement>(".kds-progress-bar")!;
  // 0을 넣으면 "0% 완료"로 읽히고 그것은 "얼마나 걸릴지 모른다"와 다른 말이다.
  expect(track.getAttribute("aria-valuenow")).toBeNull();
  expect(track.getAttribute("aria-valuemin")).toBeNull();
  expect(track.getAttribute("aria-valuemax")).toBeNull();
  expect(track.getAttribute("role")).toBe("progressbar");
});

test("범위를 벗어난 값은 화면과 보조기술이 갈리지 않게 조인다", async () => {
  await render(
    <div data-kds-fixture>
      <ProgressBar aria-label="업로드" value={180} />
      <ProgressBar aria-label="내려받기" value={-40} />
    </div>,
  );
  const tracks = [...scope().querySelectorAll<HTMLElement>(".kds-progress-bar")];
  expect(tracks[0]!.getAttribute("aria-valuenow")).toBe("100");
  expect(tracks[1]!.getAttribute("aria-valuenow")).toBe("0");
  const fills = [...scope().querySelectorAll<HTMLElement>(".kds-progress-bar__fill")];
  expect(px(getComputedStyle(fills[0]!).inlineSize)).toBe(
    px(getComputedStyle(tracks[0]!).inlineSize),
  );
  expect(px(getComputedStyle(fills[1]!).inlineSize)).toBe(0);
});

test("valueText가 숫자를 대신 읽힌다", async () => {
  await render(
    <div data-kds-fixture>
      <ProgressBar aria-label="렌더링" value={58} valueText="3분 남음" />
    </div>,
  );
  expect(
    scope().querySelector<HTMLElement>(".kds-progress-bar")!.getAttribute("aria-valuetext"),
  ).toBe("3분 남음");
});

test("이름이 없으면 개발 중에 경고한다", async () => {
  const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
  await render(
    <div data-kds-fixture>
      <ProgressBar value={10} />
    </div>,
  );
  expect(warn).toHaveBeenCalled();
  expect(String(warn.mock.calls[0]![0])).toContain("DS-D-0022");
  warn.mockRestore();
});

test("바의 기하가 components.measured.json과 같다", async () => {
  await render(
    <div data-kds-fixture style={{ inlineSize: "480px" }}>
      <ProgressBar aria-label="업로드" value={50} />
    </div>,
  );
  const track = scope().querySelector<HTMLElement>(".kds-progress-bar")!;
  const style = getComputedStyle(track);
  expect(px(style.blockSize), "height").toBe(barSpec.height);
  // 제품 두 벌이 합의하는 유일한 폭 계약이다.
  expect(px(style.maxInlineSize), "maxInlineSize").toBe(barSpec.maxInlineSize);
  // 알약이다. `getComputedStyle`은 선언값을 돌려주므로 999가 나오고, 브라우저가 그리는 곡률은
  // 높이의 절반인 3px로 조여진다 — 제품이 적은 리터럴 3px과 결과가 같다.
  expect(px(style.borderTopLeftRadius)).toBe(barSpec.radius);
  expect(barSpec.radius).toBeGreaterThanOrEqual(barSpec.height / 2);
});

test("면과 채움 색이 states 표와 같다", async () => {
  await render(
    <div data-kds-fixture>
      <ProgressBar aria-label="업로드" value={50} />
      <ProgressRing aria-label="사용량" value={50}>
        <span style={{ inlineSize: "28px", blockSize: "28px", display: "block" }} />
      </ProgressRing>
    </div>,
  );
  const track = scope().querySelector<HTMLElement>(".kds-progress-bar")!;
  const fill = scope().querySelector<HTMLElement>(".kds-progress-bar__fill")!;
  const states = {
    bar: measured.components["progress-bar"].states.base,
    ring: measured.components["progress-ring"].states.base,
  };
  expect(getComputedStyle(track).backgroundColor).toBe(tokenValue(states.bar.Default.background));
  expect(getComputedStyle(fill).backgroundColor).toBe(tokenValue(states.bar.Default.foreground));
  // 링은 conic-gradient라 배경색이 아니라 이미지다. 두 색이 모두 그 안에 들어가는지 본다.
  const ringImage = getComputedStyle(
    scope().querySelector<HTMLElement>(".kds-progress-ring")!,
    "::after",
  ).backgroundImage;
  expect(ringImage).toContain("conic-gradient");
  expect(ringImage).toContain(tokenValue(states.ring.Default.foreground));
  expect(ringImage).toContain(tokenValue(states.ring.Default.background));
});

test("링은 지름을 내용에서 얻는다 — 소비처가 크기를 두 번 적지 않는다", async () => {
  await render(
    <div data-kds-fixture>
      <ProgressRing aria-label="사용량" value={30}>
        <span
          data-avatar
          style={{ inlineSize: "28px", blockSize: "28px", display: "block" }}
        />
      </ProgressRing>
    </div>,
  );
  const ring = scope().querySelector<HTMLElement>(".kds-progress-ring")!;
  // 제품 식: avatar + (gap + width) × 2 = 28 + (2 + 2) × 2 = 36
  expect(Math.round(ring.getBoundingClientRect().width)).toBe(ringSpec.size);
  expect(ring.getAttribute("role")).toBe("progressbar");
  expect(ring.getAttribute("aria-valuenow")).toBe("30");
});

export type _EnsureTsx = JSX.Element;
