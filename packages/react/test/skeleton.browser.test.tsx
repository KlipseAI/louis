// design/components/skeleton.md의 Acceptance tests를 실제 브라우저에서 검증한다.
//
// **이 파일의 요지는 면 색이 없다는 것이다.** 제품은 전경색을 낮은 알파로 깔고 테마별 면을
// 고른 적이 없다. 그래서 테스트도 "어느 토큰인가"가 아니라 "놓이는 자리의 색을 무는가"를 잰다.
import type { JSX } from "react";
import { expect, test } from "vitest";
import { render } from "vitest-browser-react";
import { Skeleton } from "@klipse-design/react";
import measured from "../../../figma/components.measured.json" with { type: "json" };
import "@klipse-design/css/layers.css";
import "@klipse-design/css/tokens.css";
import "@klipse-design/css/styles.css";

const px = (v: string): number => Number.parseFloat(v);
// **모양마다 자기 기록을 본다.** 그전에는 셋 다 `sizes.base` 하나와 대조해서, 기록의
// `sizes.block.radius` · `sizes.text.radius` 가 무엇이든 이 테스트를 통과했다 — 실제로 기록이
// block 을 16 이라고 적어 둔 채 CSS 는 8 을 그리고 있었고 아무도 몰랐다 (2026-08-30).
const sizes = measured.components.skeleton.sizes;
const motion = measured.components.skeleton.motion;

function scope(): ParentNode {
  const g = document.querySelectorAll("[data-louis-fixture]");
  return g.length > 0 ? g[g.length - 1]! : document;
}
const skeleton = (): HTMLElement => {
  const n = scope().querySelector(".louis-skeleton");
  if (n === null) throw new Error("찾지 못했습니다");
  return n as HTMLElement;
};

test("면이 놓이는 자리의 글자색을 문다 — 고른 면 토큰이 아니다", async () => {
  // 부모의 color를 두 값으로 바꿔 가며 잰다. 면이 토큰이었다면 둘이 같게 나온다.
  const read = async (color: string): Promise<string> => {
    await render(
      <div data-louis-fixture style={{ color }}>
        <Skeleton style={{ inlineSize: "120px", blockSize: "20px" }} />
      </div>,
    );
    return getComputedStyle(skeleton()).backgroundColor;
  };
  const red = await read("rgb(255, 0, 0)");
  const blue = await read("rgb(0, 0, 255)");
  expect(red, "글자색을 따라간다").not.toBe(blue);
  // 알파가 실제로 낮은지. 불투명하면 뒤가 비치지 않아 자리표시가 아니라 덩어리가 된다.
  const alpha = Number((red.match(/[\d.]+\)$/) ?? ["1)"])[0].replace(")", ""));
  expect(alpha, "면이 반투명하다").toBeLessThan(0.5);
});

test("두 테마 모두에서 면이 보인다", async () => {
  await render(
    <div data-louis-fixture style={{ background: "var(--louis-color-bg-surface)" }}>
      <Skeleton style={{ inlineSize: "120px", blockSize: "20px" }} />
    </div>,
  );
  // (1c)가 걱정한 것 — 어느 한 테마에서 면이 배경과 같아지는가. 알파 방식은 구조상 그럴 수 없다.
  for (const theme of ["light", "dark"] as const) {
    document.documentElement.setAttribute("data-theme", theme);
    const bg = getComputedStyle(skeleton()).backgroundColor;
    const parentBg = getComputedStyle(skeleton().parentElement as HTMLElement).backgroundColor;
    expect(bg, `${theme}에서 면이 배경과 다르다`).not.toBe(parentBg);
    expect(bg, `${theme}에서 투명하지 않다`).not.toBe("rgba(0, 0, 0, 0)");
  }
  document.documentElement.removeAttribute("data-theme");
});

test("흐름이 background-position이고 motion 토큰을 쓴다", async () => {
  await render(
    <div data-louis-fixture>
      <Skeleton style={{ inlineSize: "120px", blockSize: "20px" }} />
    </div>,
  );
  const style = getComputedStyle(skeleton());
  expect(style.animationName, "공용 keyframe").toBe("louis-shimmer");

  // **두 motion context를 갈라서 잰다.** reduced-motion에서 loop는 짧아지는 것이 아니라
  // 사라진다(DS-D-0016) — 그래서 duration이 reduced 토큰이 되고 반복이 1회가 된다.
  // 한 값만 기대하면 둘 중 한 project에서 반드시 실패하고, 그것을 피하려고 단언을 느슨하게
  // 하면 reduced-motion 계약이 검사되지 않는다.
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const reducedDuration = px(
    getComputedStyle(document.documentElement).getPropertyValue("--louis-motion-reduced-duration"),
  );
  if (reduced) {
    expect(px(style.animationDuration) * 1000, "reduced duration").toBe(reducedDuration);
    expect(style.animationIterationCount, "reduced에서 1회").toBe(String(motion.reducedIterationCount));
  } else {
    expect(px(style.animationDuration) * 1000, "duration").toBe(motion.duration);
    expect(style.animationIterationCount, "무한 반복").toBe(motion.iterationCount);
  }
  // transform이 아니라 background-position이다 — loop 허용 property가 셋뿐이다(DS-D-0016).
  expect(style.transform, "transform을 쓰지 않는다").toBe("none");
  expect(style.backgroundImage, "그라디언트가 있다").toContain("gradient");
});

test("모양 셋의 반경이 계약과 같다", async () => {
  for (const shape of ["block", "text", "circle"] as const) {
    await render(
      <div data-louis-fixture>
        <Skeleton shape={shape} style={{ inlineSize: "40px", blockSize: "40px" }} />
      </div>,
    );
    const r = px(getComputedStyle(skeleton()).borderTopLeftRadius);
    if (shape === "circle") expect(r, "원").toBeGreaterThanOrEqual(20);
    else expect(r, `${shape} 반경`).toBe(sizes[shape].radius);
  }
});

test("읽히지 않는다", async () => {
  // 로딩을 알리는 것은 감싸는 영역의 일이다. 스켈레톤마다 읽히면 소음이 된다.
  await render(
    <div data-louis-fixture>
      <Skeleton />
    </div>,
  );
  expect(skeleton().getAttribute("aria-hidden"), "aria-hidden").toBe("true");
});

export type _EnsureTsx = JSX.Element;
