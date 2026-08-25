// design/patterns/project-grid.md의 계약을 실제 브라우저에서 검증한다.
//
// 핵심 계약은 **viewport가 아니라 container**로 열 수가 정해진다는 것이다. 그래서 이 파일은
// viewport를 바꾸지 않고 **container 폭만** 바꿔 가며 잰다 — media query 구현이었다면 전부
// 같은 열 수가 나와 실패한다.
import type { JSX } from "react";
import { expect, test } from "vitest";
import { render } from "vitest-browser-react";
import "@klipse-design/css/layers.css";
import "@klipse-design/css/tokens.css";
import "@klipse-design/css/styles.css";

const px = (value: string): number => Number.parseFloat(value);

function scope(): ParentNode {
  const groups = document.querySelectorAll("[data-louis-fixture]");
  return groups.length > 0 ? groups[groups.length - 1]! : document;
}
const grid = (): HTMLElement => {
  const node = scope().querySelector(".louis-project-grid");
  if (node === null) throw new Error("grid를 찾지 못했습니다");
  return node as HTMLElement;
};
const columns = (): number =>
  getComputedStyle(grid()).gridTemplateColumns.split(" ").filter(Boolean).length;

const token = (id: string): number =>
  px(getComputedStyle(document.documentElement).getPropertyValue(`--louis-${id}`));

async function mount(width: number, count = 12): Promise<void> {
  await render(
    <div data-louis-fixture style={{ inlineSize: `${width}px` }}>
      <div className="louis-project-grid">
        {Array.from({ length: count }, (_, i) => (
          <div key={i} data-card style={{ blockSize: "40px", background: "#ddd" }} />
        ))}
      </div>
    </div>,
  );
}

// 규범의 migration compatibility profile을 **container 폭으로 환산한** 값이다.
// 열 수 = floor((W + gap) / (최소 + gap)). 이 계산이 규범의 2/3/4/5와 같은 결과를 내는지가
// 이 표의 요지이며, 숫자를 손으로 적지 않고 토큰에서 유도한다.
test("열 수가 container 폭에서 유도된다 — viewport가 아니다", async () => {
  const min = token("layout-project-card-minimum");
  const gap = token("layout-project-grid-gap");
  expect(min, "카드 최소 폭 토큰").toBeGreaterThan(0);

  for (const want of [1, 2, 3, 4, 5]) {
    // 그 열 수가 딱 들어가는 폭. 다음 열이 들어가기 직전이다.
    const width = want * min + (want - 1) * gap;
    await mount(width);
    expect(columns(), `${width}px에서 ${want}열`).toBe(want);
  }
});

test("container가 넓어지면 열이 늘고 좁아지면 준다", async () => {
  const min = token("layout-project-card-minimum");
  const gap = token("layout-project-grid-gap");
  const wide = 5 * min + 4 * gap;
  await mount(wide);
  expect(columns(), "넓을 때").toBe(5);
  // 같은 viewport에서 container만 줄인다 — 사이드바가 펴진 상황이다.
  (grid().parentElement as HTMLElement).style.inlineSize = `${3 * min + 2 * gap}px`;
  expect(columns(), "container만 줄였을 때").toBe(3);
});

test("최소 폭보다 좁아도 1열로 떨어지고 가로 스크롤이 없다", async () => {
  const min = token("layout-project-card-minimum");
  const narrow = Math.round(min / 2);
  await mount(narrow, 3);
  expect(columns(), "1열 fallback").toBe(1);
  const node = grid();
  // `min(최소, 100%)`가 없으면 track이 container를 넘어 가로 스크롤이 생긴다.
  expect(node.scrollWidth, "가로 스크롤 없음").toBeLessThanOrEqual(node.clientWidth);
  expect(node.getBoundingClientRect().width, "container를 넘지 않음").toBeLessThanOrEqual(narrow);
});

test("모든 카드가 같은 track을 쓰고 마지막 행이 앞선 카드를 늘리지 않는다", async () => {
  const min = token("layout-project-card-minimum");
  const gap = token("layout-project-grid-gap");
  // 3열에 4장 — 마지막 행이 한 장만 남는다.
  await mount(3 * min + 2 * gap, 4);
  const cards = Array.from(scope().querySelectorAll("[data-card]")) as HTMLElement[];
  const widths = new Set(cards.map((c) => Math.round(c.getBoundingClientRect().width)));
  expect(widths.size, "카드 폭이 모두 같다").toBe(1);
});

test("gap이 공용 토큰이고 열 수가 달라져도 같다", async () => {
  const min = token("layout-project-card-minimum");
  const gap = token("layout-project-grid-gap");
  for (const want of [2, 4]) {
    await mount(want * min + (want - 1) * gap);
    const style = getComputedStyle(grid());
    expect(px(style.columnGap), `${want}열의 gap`).toBe(gap);
    expect(px(style.rowGap), `${want}열의 row gap`).toBe(gap);
  }
});

export type _EnsureTsx = JSX.Element;
