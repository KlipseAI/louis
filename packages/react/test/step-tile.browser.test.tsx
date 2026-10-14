// figma/components.measured.json 의 **step-tile** 값을 LOUIS 레시피(packages/css/src/component/step-tile.css)가 여전히 만드는지
// 실브라우저에서 잰다(DS-D-0035 (c), 2026-10-14 DS-D-0099).
//
// 기록은 제품 StepTiles.tsx 의 클래스를 제품 Tailwind 로 잰 값이다(measure-product-components). parity 게이트는 Figma 가 그 기록과
// 같은지만 보므로, 레시피가 조용히 바뀌면 **Figma 와 기록은 서로 맞고 둘 다 코드와 틀린** 상태로 초록이 된다. 이 파일이 그 반대 방향이다.
// 더해서 DS-D-0099 의 판정 셋 — 캡션이 진짜 공백으로 잇는 인라인 흐름인가, 목록이 `role="list"` 를 갖는가, 설명이 AA 를 넘는가 — 를 잰다.
import type { JSX } from "react";
import { afterEach, expect, test } from "vitest";
import { page } from "vitest/browser";
import { render } from "vitest-browser-react";
import measured from "../../../figma/components.measured.json" with { type: "json" };
import "@klipse-design/css/layers.css";
import "@klipse-design/css/tokens.css";
import "@klipse-design/css/styles.css";
import { contrastOn, find, parseColor, px, tokenColor } from "./fixtures/contrast";

const base = measured.components["step-tile"].sizes.base as Record<string, unknown>;
function spec(field: string): number {
  const value = base[field];
  if (typeof value !== "number") throw new Error(`step-tile.sizes.base.${field}가 수가 아닙니다`);
  return value;
}

const ITEMS = [
  { label: "영상을 직접 업로드하거나 유튜브 URL 입력.", description: "영상의 주제를 선택하세요." },
  { label: "카테고리", description: "영상의 주제를 선택하세요." },
  { label: "생성", description: "" },
] as const;

function Steps(): JSX.Element {
  return (
    <div style={{ inlineSize: 1400, padding: 24, background: "var(--louis-color-landing-page-bg)" }} data-testid="page">
      <ol className="louis-step-tile-list" role="list" data-testid="list">
        {ITEMS.map((item, index) => (
          <li key={item.label} className="louis-step-tile" data-testid={`card-${index}`}>
            <div className="louis-step-tile__tile" data-testid={`tile-${index}`} />
            <p className="louis-step-tile__caption" data-testid={`caption-${index}`}>
              <span className="louis-step-tile__label" data-testid={`label-${index}`}>
                {item.label}
              </span>
              {item.description === "" ? null : (
                <>
                  {" "}
                  <span className="louis-step-tile__description" data-testid={`description-${index}`}>
                    {item.description}
                  </span>
                </>
              )}
            </p>
          </li>
        ))}
      </ol>
    </div>
  );
}

afterEach(async () => {
  document.documentElement.removeAttribute("data-theme");
  await page.viewport(1440, 900);
});

test("한 칸의 기하가 기록과 같다 — 루트 간격 12 · 안쪽 0 · 타일 정사각 반경 12 · 캡션 20/30", async () => {
  await page.viewport(1440, 900);
  await render(<Steps />);
  const card = getComputedStyle(find("card-1"));
  expect(px(card.rowGap)).toBe(spec("gap"));
  expect(px(card.paddingTop)).toBe(spec("paddingBlock"));
  expect(px(card.paddingLeft)).toBe(spec("paddingInline"));
  expect(px(card.borderTopLeftRadius)).toBe(spec("radius"));

  const tile = find("tile-1");
  const box = tile.getBoundingClientRect();
  expect(Math.abs(box.width - box.height)).toBeLessThan(0.01);
  const tileStyle = getComputedStyle(tile);
  expect(px(tileStyle.borderTopLeftRadius)).toBe(spec("tileRadius"));
  // 테두리도 그림자도 없다 — 면이 유일한 조형이다.
  expect(px(tileStyle.borderTopWidth)).toBe(0);
  expect(tileStyle.boxShadow).toBe("none");
  expect(tileStyle.overflow).toBe("hidden");
  // 타일 ↔ 캡션 실제 거리도 기록의 간격이다.
  const caption = find("caption-1").getBoundingClientRect();
  expect(caption.top - box.bottom).toBeCloseTo(spec("gap"), 1);

  for (const testId of ["label-1", "description-1"]) {
    const style = getComputedStyle(find(testId));
    expect(px(style.fontSize), `${testId} 글자 크기`).toBe(spec("labelFontSize"));
  }
  // 한 줄 캡션의 높이가 줄 높이 하나다.
  expect(caption.height).toBeCloseTo(spec("labelLineHeight"), 0);
});

test("타일 면이 landing-panel-strong 이고 세 칸의 타일 윗선이 정렬된다", async () => {
  await page.viewport(1440, 900);
  await render(<Steps />);
  expect(getComputedStyle(find("tile-0")).backgroundColor).toBe(tokenColor("color-landing-panel-strong", "backgroundColor"));
  const tops = [0, 1, 2].map((index) => find(`tile-${index}`).getBoundingClientRect().top);
  expect(new Set(tops).size).toBe(1);
  // 1400 폭 3열 · 사이 6 — 칸 폭은 (1400 − 12) ÷ 3.
  expect(find("tile-0").getBoundingClientRect().width).toBeCloseTo((1400 - 12) / 3, 1);
});

test("캡션은 진짜 공백으로 잇는 인라인 흐름이다 — 복사와 접근성 트리에서 라벨과 설명이 붙지 않는다", async () => {
  await render(<Steps />);
  expect(find("caption-1").textContent).toBe("카테고리 영상의 주제를 선택하세요.");
  expect(getComputedStyle(find("caption-1")).display).toBe("block");
  expect(getComputedStyle(find("label-1")).display).toBe("inline-block");
  expect(getComputedStyle(find("description-1")).display).toBe("inline-block");
  // 공백 폭이 Figma 의 itemSpacing 4 의 원천이다(실측 4.69) — 0 이면 flex 로 무너진 것이다.
  const gap = find("description-1").getBoundingClientRect().left - find("label-1").getBoundingClientRect().right;
  expect(gap).toBeGreaterThan(3);
  expect(gap).toBeLessThan(7);
  // 설명이 없는 칸은 덩어리 자체가 없다.
  expect(document.querySelector('[data-testid="description-2"]')).toBeNull();
  expect(find("caption-2").textContent).toBe("생성");
});

test("목록이 role=list 를 갖고 마커가 없다", async () => {
  await render(<Steps />);
  const list = find("list");
  expect(list.getAttribute("role")).toBe("list");
  expect(getComputedStyle(list).listStyleType).toBe("none");
  expect(list.querySelectorAll(":scope > li").length).toBe(3);
});

test("720 미만에서 한 열로 선다", async () => {
  await page.viewport(700, 900);
  await render(<Steps />);
  const left = [0, 1, 2].map((index) => find(`tile-${index}`).getBoundingClientRect().left);
  expect(new Set(left).size).toBe(1);
  // 767 이하 계단 — 캡션 16 · 줄 높이 24.
  expect(px(getComputedStyle(find("label-1")).fontSize)).toBe(16);
});

test("라벨과 설명이 두 테마에서 랜딩 바닥 위 AA 를 넘는다", async () => {
  await render(<Steps />);
  for (const theme of ["light", "dark"] as const) {
    document.documentElement.setAttribute("data-theme", theme);
    const ground = parseColor(getComputedStyle(find("page")).backgroundColor);
    const label = contrastOn(getComputedStyle(find("label-1")).color, ground);
    const description = contrastOn(getComputedStyle(find("description-1")).color, ground);
    expect(label, `${theme} 라벨`).toBeGreaterThanOrEqual(4.5);
    expect(description, `${theme} 설명`).toBeGreaterThanOrEqual(4.5);
    expect(getComputedStyle(find("label-1")).color).toBe(tokenColor("color-landing-text-strong"));
    expect(getComputedStyle(find("description-1")).color).toBe(tokenColor("color-landing-text-muted"));
  }
});
