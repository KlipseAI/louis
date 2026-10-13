// figma/components.measured.json 의 **chart-card** 값을 코드가 여전히 만드는지 검증한다.
//
// parity 게이트는 Figma 가 measured 와 같은지만 본다. 이 파일이 없으면 CSS 가 조용히 바뀌어도
// **Figma 와 measured 는 서로 맞고 둘 다 코드와 틀린** 상태로 통과한다. DS-D-0035 (c) 가
// 요구하는 반대 방향이 이것이다.
//
// **React 표면이 없어 클래스 마크업을 렌더한다.** 곡선 자체는 이 컴포넌트의 것이 아니라
// 소비처의 SVG 다(문서 When to use). 그래서 차트 슬롯은 빈 상자로 두고 **슬롯의 기하**만 잰다.
//
// **저작 CSS 를 직접 import 하는 이유는 stat-tile.browser.test.tsx 머리말과 같다.**
import type { JSX } from "react";
import { expect, test } from "vitest";
import { render } from "vitest-browser-react";
import measured from "../../../figma/components.measured.json" with { type: "json" };
import "@klipse-design/css/layers.css";
import "@klipse-design/css/tokens.css";
import "@klipse-design/css/styles.css";
import "../../css/src/component/stat-tile.css";
import "../../css/src/component/chart-card.css";

type Chart = "area" | "spark";

const CHARTS: readonly Chart[] = ["area", "spark"];
const spec = measured.components["chart-card"].sizes;

const px = (value: string): number => Number.parseFloat(value);

function find(testId: string): HTMLElement {
  const node = document.querySelector(`[data-testid="${testId}"]`);
  if (node === null) throw new Error(`찾지 못했습니다: ${testId}`);
  return node as HTMLElement;
}

/**
 * 카드 하나를 **고정 폭 400** 안에 렌더한다.
 *
 * 400 이어야 두 값이 계약대로 걸린다. spark 곡선은 `44%` 에 상한 130 이라 안쪽 면의 내용 폭이
 * 296 을 넘어야 상한 쪽이 이기고(400 − 6·2 − 16·2 = 356), area 곡선은 `4 / 1` 비율이 만드는
 * 높이가 하한 140 보다 낮아야 하한 쪽이 이긴다(360 / 4 = 90). **재는 것은 두 뚜껑이 걸린
 * 상태**이고 그것이 계약에 적힌 값이다.
 */
function Specimen({ chart, id = "" }: { chart: Chart; id?: string }): JSX.Element {
  return (
    <div style={{ inlineSize: "400px" }}>
      <div className="louis-chart-card" data-chart={chart} data-testid={`card${id}`}>
        <div className="louis-chart-card__header" data-testid={`header${id}`}>
          <span className="louis-chart-card__label" data-testid={`label${id}`}>
            도달
          </span>
          {chart === "area" ? (
            <span className="louis-chart-card__meta" data-testid={`meta${id}`}>
              최근 7일
            </span>
          ) : null}
        </div>
        <div className="louis-chart-card__panel" data-testid={`panel${id}`}>
          <div className="louis-chart-card__metric" data-testid={`metric${id}`}>
            <h2 className="louis-chart-card__value" data-testid={`value${id}`}>
              12,480
            </h2>
            <span className="louis-delta-pill" data-tone="up" data-testid={`delta${id}`}>
              +12.4%
            </span>
          </div>
          {chart === "area" ? (
            <div className="louis-chart-card__chart" data-testid={`chart${id}`} />
          ) : (
            <div className="louis-chart-card__spark" data-testid={`spark${id}`} />
          )}
        </div>
      </div>
    </div>
  );
}

for (const chart of CHARTS) {
  test(`chart-card ${chart}: 바깥 액자가 계약과 같다`, async () => {
    await render(<Specimen chart={chart} />);
    const style = getComputedStyle(find("card"));
    const want = spec[chart];

    expect(px(style.paddingTop)).toBe(want.paddingBlock);
    expect(px(style.paddingBottom)).toBe(want.paddingBlock);
    expect(px(style.paddingLeft)).toBe(want.paddingInline);
    expect(px(style.paddingRight)).toBe(want.paddingInline);
    expect(px(style.rowGap)).toBe(want.gap);
    expect(px(style.borderTopLeftRadius)).toBe(want.radius);
    expect(px(style.borderTopWidth)).toBe(want.borderWidth);
    expect(style.boxShadow).not.toBe("none");
  });

  test(`chart-card ${chart}: 헤더 여백과 간격이 계약과 같다`, async () => {
    await render(<Specimen chart={chart} />);
    const style = getComputedStyle(find("header"));
    const want = spec[chart];

    expect(px(style.paddingTop)).toBe(want.headerPaddingBlock);
    // 아래 여백이 얕은 것은 카드의 세로 간격을 프레임 gap 이 이미 내기 때문이다.
    expect(px(style.paddingBottom)).toBe(want.headerPaddingBlockEnd);
    expect(px(style.paddingLeft)).toBe(want.headerPaddingInline);
    expect(px(style.paddingRight)).toBe(want.headerPaddingInline);
    expect(px(style.columnGap)).toBe(want.headerGap);
  });

  test(`chart-card ${chart}: 안쪽 면이 계약과 같다`, async () => {
    await render(<Specimen chart={chart} />);
    const style = getComputedStyle(find("panel"));
    const want = spec[chart];

    expect(px(style.paddingTop)).toBe(want.panelPaddingBlock);
    expect(px(style.paddingBottom)).toBe(want.panelPaddingBlock);
    expect(px(style.paddingLeft)).toBe(want.panelPaddingInline);
    expect(px(style.paddingRight)).toBe(want.panelPaddingInline);
    expect(px(style.borderTopLeftRadius)).toBe(want.panelRadius);
    expect(style.flexDirection).toBe(want.panelLayout);
    // 동심 정렬: 바깥 반경 − 바깥 여백 = 안쪽 반경.
    expect(want.radius - want.paddingInline).toBe(want.panelRadius);
  });

  test(`chart-card ${chart}: 수치와 증감 알약이 계약과 같다`, async () => {
    await render(<Specimen chart={chart} />);
    const want = spec[chart];

    const value = getComputedStyle(find("value"));
    expect(px(value.fontSize)).toBe(want.valueFontSize);
    expect(value.fontVariantNumeric).toContain("tabular-nums");
    // 정본이 `m-0` 을 거는 자리다. UA 의 h2 마진이 남으면 수치가 알약과 밑줄을 못 맞춘다.
    expect(px(value.marginTop)).toBe(0);

    const delta = getComputedStyle(find("delta"));
    expect(px(delta.paddingTop)).toBe(want.deltaPaddingBlock);
    expect(px(delta.paddingLeft)).toBe(want.deltaPaddingInline);
    expect(px(delta.borderTopLeftRadius)).toBe(want.deltaRadius);
  });

  test(`chart-card ${chart}: 라벨 크기가 계약과 같다`, async () => {
    await render(<Specimen chart={chart} />);
    const want = spec[chart];
    const label = getComputedStyle(find("label"));
    expect(px(label.fontSize)).toBe(want.labelFontSize);
  });
}

test("chart-card area: 기간이 있고 곡선 슬롯이 하한 높이를 갖는다", async () => {
  await render(<Specimen chart="area" />);
  const want = spec.area;

  const meta = getComputedStyle(find("meta"));
  expect(px(meta.fontSize)).toBe(want.metaFontSize);

  const slot = find("chart");
  const style = getComputedStyle(slot);
  // 비율(4:1)이 만드는 높이가 90 이라 하한 140 이 이긴다. `box-sizing: border-box` 가
  // 없으면 여백 24 가 비율 밖으로 새어 나가 같은 폭에서 높이가 두 값을 갖는다.
  expect(style.boxSizing).toBe("border-box");
  expect(Math.round(slot.getBoundingClientRect().height)).toBe(want.chartMinHeight);
});

test("chart-card spark: 미니 곡선이 상한 폭과 고정 높이를 갖는다", async () => {
  await render(<Specimen chart="spark" />);
  const want = spec.spark;
  const rect = find("spark").getBoundingClientRect();

  // 44% 가 156.6 이라 상한 130 이 이긴다 — 계약에 적힌 값이 그 뚜껑이다.
  expect(Math.round(rect.width)).toBe(want.sparkWidth);
  expect(Math.round(rect.height)).toBe(want.sparkHeight);
});

test("chart-card: 두 축의 안쪽 면 하한이 갈린다", async () => {
  // **이 축은 Figma 와 대조되지 않는다.** Figma 는 minHeight 에 0 을 넣지 못하고 null 로 두면
  // 되읽기에서 통째로 빠져 area 의 「하한 없음」을 적을 자리가 없다. 그래서 계약 밖이고,
  // 두 칸을 다 재는 것은 이 시험뿐이다 — 여기서 빠지면 아무도 보지 않는 값이 된다.
  await render(<Specimen chart="area" />);
  expect(px(getComputedStyle(find("panel")).minHeight)).toBe(0);

  await render(<Specimen chart="spark" id="-spark" />);
  expect(px(getComputedStyle(find("panel-spark")).minHeight)).toBe(
    spec.spark.panelMinHeight,
  );
});

test("chart-card: 두 축의 안쪽 여백이 실제로 갈려 있다", async () => {
  // 제품 정본 둘이 갈려 있고(KPI py-7 px-8 · 주요 지표 py-6 px-7) 이 회차는 그 사실을
  // 지우지 않고 축으로 적었다. 둘이 같아지면 축이 죽은 것이므로 여기서 소리를 낸다.
  expect(spec.area.panelPaddingBlock).not.toBe(spec.spark.panelPaddingBlock);
  expect(spec.area.panelPaddingInline).not.toBe(spec.spark.panelPaddingInline);
});

// 점 바닥(2026-10-13, DS-D-0084) — Figma 의 ChartCardDotTile 한 칸이 이 격자 간격이다. 기록 `chart-card-dot-tile.tile.pitch` 를
// 코드가 여전히 만드는지 잰다. 층은 `::before` 라 그 계산값의 `background-size` 를 읽는다.
test("chart-card 점 바닥: 격자 간격이 ChartCardDotTile 기록과 같다", async () => {
  await render(
    <div className="louis-chart-card" data-chart="area">
      <div className="louis-chart-card__chart" data-floor="dots" data-testid="dots-chart" />
    </div>,
  );
  const pitch = measured.components["chart-card-dot-tile"].sizes.tile.pitch;
  const size = getComputedStyle(find("dots-chart"), "::before").backgroundSize.split(" ").map(px);
  expect(size).toEqual([pitch, pitch]);
});
