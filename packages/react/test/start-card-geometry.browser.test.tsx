// figma/components.measured.json 의 **start-card** 값을 코드가 여전히 만드는지 검증한다(DS-D-0035 (c)).
//
// parity 게이트는 Figma 가 기록과 같은지만 본다. 이 파일이 없으면 CSS 가 조용히 바뀌어도 **Figma 와 기록은 서로 맞고
// 둘 다 코드와 틀린** 상태로 통과한다. 기록의 값은 레시피 선언으로 적혔는데(기록의 `$note`), 그 선언을 레시피가 여전히
// 만드는지를 여기서 실브라우저로 되잰다.
//
// **React 컴포넌트가 아니라 클래스 마크업을 렌더한다.** start-card 는 packages/react/src 에 표면이 없고 정본이
// packages/css/src/component/start-card.css 다. 마크업은 레시피 머리 주석과 start-card.md Anatomy 의 순서 그대로다
// (미디어 → 블러 → 이름). 저작 CSS 를 직접 import 한다 — 재는 대상이 「저작 CSS 가 계약값을 만드는가」다(faq-row 와 같다).
//
// **키는 카드 폭이 정한다.** sm = 폭 240 미만 · md = 240 이상(`@container louis-start-card (min-width: 240px)`). 대표 폭은
// 문서의 두 자리 190(빈 캔버스 칸) · 320(제품 기준)이다. 카드를 감싸는 상자는 컨테이너가 아니다 — 반경 16 → 20 은
// 조상 컨테이너가 600 이상일 때의 칸 값이라 키가 아니고(기록의 `$keyRule`), 여기서는 기본 반경을 잰다.
import type { JSX } from "react";
import { expect, test } from "vitest";
import { render } from "vitest-browser-react";
import measured from "../../../figma/components.measured.json" with { type: "json" };
import "@klipse-design/css/layers.css";
import "@klipse-design/css/tokens.css";
import "@klipse-design/css/styles.css";
import "../../css/src/component/start-card.css";

const spec = measured.components["start-card"].sizes;
type Key = keyof typeof spec;

/** 키마다 대표 카드 폭. 240 기준선의 양쪽이다. */
const WIDTH: Record<Key, number> = { sm: 190, md: 320 };

const px = (value: string): number => Number.parseFloat(value);

function one<T extends Element>(root: ParentNode, selector: string): T {
  const node = root.querySelector<T>(selector);
  if (node === null) throw new Error(`찾지 못했습니다: ${selector}`);
  return node;
}

function Specimen({ width }: { readonly width: number }): JSX.Element {
  return (
    <div style={{ inlineSize: `${width}px` }}>
      <button type="button" className="louis-start-card">
        <span className="louis-start-card__media" aria-hidden="true" />
        <span className="louis-start-card__blur" aria-hidden="true" />
        <span className="louis-start-card__label">이미지 생성</span>
      </button>
    </div>
  );
}

const KEYS = Object.keys(spec) as Key[];

test("기록의 키가 Size 축 둘이다 — 키가 늘면 이 파일이 그 키를 재야 한다", () => {
  expect([...KEYS].sort()).toEqual(["md", "sm"]);
});

for (const key of KEYS) {
  const want = spec[key];

  test(`start-card ${key}(폭 ${WIDTH[key]}): 반경 · 이름 여백 · 이름 크기가 기록과 같다`, async () => {
    const screen = await render(<Specimen width={WIDTH[key]} />);
    const card = one<HTMLElement>(screen.container, ".louis-start-card");
    const label = one<HTMLElement>(screen.container, ".louis-start-card__label");

    // 대표 폭이 정말 그 칸에 서 있는지 먼저 본다 — 폭이 어긋나면 아래 값은 다른 키를 잰 것이다.
    expect(Math.round(card.getBoundingClientRect().width)).toBe(WIDTH[key]);

    const cardStyle = getComputedStyle(card);
    expect(px(cardStyle.borderTopLeftRadius)).toBe(want.radius);
    expect(px(cardStyle.borderTopRightRadius)).toBe(want.radius);
    expect(px(cardStyle.borderBottomLeftRadius)).toBe(want.radius);
    expect(px(cardStyle.borderBottomRightRadius)).toBe(want.radius);

    const labelStyle = getComputedStyle(label);
    expect(px(labelStyle.paddingTop)).toBe(want.labelPadding);
    expect(px(labelStyle.paddingRight)).toBe(want.labelPadding);
    expect(px(labelStyle.paddingBottom)).toBe(want.labelPadding);
    expect(px(labelStyle.paddingLeft)).toBe(want.labelPadding);
    expect(px(labelStyle.fontSize)).toBe(want.labelFontSize);
  });

  test(`start-card ${key}: 루트가 흐름 배치가 아니다 — 슬롯 셋이 모두 절대 배치다`, async () => {
    // 계약의 `layoutMode: NONE` 이 코드에서 무엇인지를 고정한다. 슬롯 하나라도 흐름으로 돌아오면 Figma 의 NONE 이 거짓이 된다.
    const screen = await render(<Specimen width={WIDTH[key]} />);
    for (const part of ["media", "blur", "label"]) {
      const node = one<HTMLElement>(screen.container, `.louis-start-card__${part}`);
      expect(getComputedStyle(node).position, part).toBe("absolute");
    }
  });
}
