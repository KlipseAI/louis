// figma/components.measured.json 의 **bare-button** 값을 코드가 여전히 만드는지 검증한다(DS-D-0035 (c)).
//
// 기록의 값은 레시피 선언이고 verify-recipe-record 가 선언 문자열을 맞댄다. 이 파일은 그 레시피가 브라우저에서 실제로
// 그 여백 · 반경 · 글자 크기를 만드는지를 잰다. React 표면이 없어 문서 API 절의 클래스 마크업을 렌더한다.
//
// **base 의 글자 크기 14 는 레시피 선언이 아니다**($labelFontSize) — `.louis-bare-button` 은 글꼴을 쥐지 않는 것이
// 계약이고 Figma 는 body-sm-regular 를 대표로 그린다. 그래서 base 는 소비처의 type 클래스를 **층 안에** 붙여 잰다.
// LOUIS 스타일은 층 밖(styles.css)이라, 레시피가 언젠가 `font` 를 쥐면 층 안의 소비처 선언을 이기고 이 칸이 달라진다 —
// 제품 `[font:inherit]` 사고(커밋 ce9af3491)가 바로 그 모양이었다.
import type { JSX } from "react";
import { expect, test } from "vitest";
import { render } from "vitest-browser-react";
import measured from "../../../figma/components.measured.json" with { type: "json" };
import "@klipse-design/css/layers.css";
import "@klipse-design/css/tokens.css";
import "@klipse-design/css/styles.css";
import { find, px } from "./fixtures/contrast";

type Sizes = Record<string, Record<string, unknown>>;

function num(spec: Record<string, unknown>, field: string, label: string): number {
  const value = spec[field];
  if (typeof value !== "number") throw new Error(`${label}.${field}가 수가 아닙니다`);
  return value;
}

/** 소비처의 type 클래스(제품 `type-body-14-regular`)를 흉내 낸다. 제품의 유틸리티처럼 층 안에 둔다. */
const CONSUMER_TYPE = `@layer consumer.utilities {
  .consumer-body-sm-regular {
    font-family: var(--louis-typography-body-sm-regular-font-family);
    font-size: var(--louis-typography-body-sm-regular-font-size);
    font-weight: var(--louis-typography-body-sm-regular-font-weight);
    line-height: var(--louis-typography-body-sm-regular-line-height);
  }
}`;

function Specimen({ layout }: { readonly layout: string }): JSX.Element {
  if (layout === "row-title") {
    return (
      <button type="button" className="louis-row-title" data-testid="button">
        배너 이름
      </button>
    );
  }
  if (layout !== "base") throw new Error(`bare-button 기록에 모르는 키가 있습니다: ${layout}`);
  return (
    <>
      <style>{CONSUMER_TYPE}</style>
      <button type="button" className="louis-bare-button consumer-body-sm-regular" data-testid="button">
        더 보기
      </button>
    </>
  );
}

/** 기록이 갖는 칸 전부. 기록에 칸이 늘었는데 여기서 재지 않으면 아래 시험이 실패한다. */
const MEASURED_FIELDS = ["paddingBlock", "paddingInline", "radius", "labelFontSize"];

for (const [key, spec] of Object.entries(measured.components["bare-button"].sizes as Sizes)) {
  test(`bare-button.${key}: 여백 · 테두리 · 반경 · 글자 크기가 기록과 같다`, async () => {
    const label = `bare-button.${key}`;
    expect(
      Object.keys(spec).filter((field) => !field.startsWith("$")).sort(),
      `${label} 기록의 칸이 이 시험이 재는 칸과 같다`,
    ).toEqual([...MEASURED_FIELDS].sort());
    await render(<Specimen layout={key} />);
    const style = getComputedStyle(find("button"));
    expect(px(style.paddingTop), `${label}.paddingBlock`).toBe(num(spec, "paddingBlock", label));
    expect(px(style.paddingBottom), `${label}.paddingBlock(end)`).toBe(num(spec, "paddingBlock", label));
    expect(px(style.paddingLeft), `${label}.paddingInline`).toBe(num(spec, "paddingInline", label));
    expect(px(style.paddingRight), `${label}.paddingInline(end)`).toBe(num(spec, "paddingInline", label));
    // 면이 없다 — UA 테두리가 남으면 여백 0 이어도 상자가 2 씩 커진다.
    expect(px(style.borderTopWidth), `${label}.border`).toBe(0);
    expect(px(style.borderLeftWidth), `${label}.border`).toBe(0);
    for (const corner of ["borderTopLeftRadius", "borderTopRightRadius", "borderBottomRightRadius", "borderBottomLeftRadius"] as const) {
      expect(px(style[corner]), `${label}.radius(${corner})`).toBe(num(spec, "radius", label));
    }
    expect(px(style.fontSize), `${label}.labelFontSize`).toBe(num(spec, "labelFontSize", label));
  });
}
