// figma/components.measured.json 의 **stat-tile** 값을 코드가 여전히 만드는지 검증한다.
//
// 이 파일이 없으면 stat-tile 칸은 한 번 적어 두고 잊히는 숫자가 된다. parity 게이트는 Figma 가
// measured 와 같은지만 보므로, CSS 가 조용히 바뀌면 **Figma 와 measured 는 서로 맞고 둘 다
// 코드와 틀린** 상태로 통과한다. alert 가 같은 이유로 자기 파일을 갖는다.
//
// **이 조형은 지금까지 어떤 기계도 본 적이 없다.** 정본 AdminStatTile 의 소비처 14 자리가 전부
// `/admin` 이고 제품의 대비·타이포·표면 게이트는 그 경로를 하나도 재지 않는다. 이 파일이 그
// 값을 처음으로 재는 기계다.
//
// **React 컴포넌트가 아니라 클래스 마크업을 렌더한다.** stat-tile 은 packages/react/src 에
// 표면이 없고 정본이 packages/css/src/component/stat-tile.css 다(계약의 figmaAhead 가 그 사실을
// 적는다). 여기서 렌더하는 마크업은 문서 Anatomy 절의 계약 그대로여야 한다.
//
// **저작 CSS 를 직접 import 한다.** 생성물 `styles.css` 는 build-css 가 만드는데, 이 변경이
// 서는 회차에 다른 저작 파일 하나가 그 빌드를 막고 있어 번들에 아직 이 컴포넌트가 없다.
// 저작 원본을 읽는 것은 오히려 더 정확하다 — 재는 대상이 「생성물이 최신인가」가 아니라
// 「저작 CSS 가 계약값을 만드는가」이기 때문이다.
import type { JSX } from "react";
import { expect, test } from "vitest";
import { render } from "vitest-browser-react";
import measured from "../../../figma/components.measured.json" with { type: "json" };
import "@klipse-design/css/layers.css";
import "@klipse-design/css/tokens.css";
import "@klipse-design/css/styles.css";
import "../../css/src/component/stat-tile.css";

type Size = "lg" | "md";
type Tone = "up" | "down" | "flat";

const SIZES: readonly Size[] = ["lg", "md"];
const TONES: readonly Tone[] = ["up", "down", "flat"];
const spec = measured.components["stat-tile"].sizes;

const px = (value: string): number => Number.parseFloat(value);
const round = (value: number): number => Math.round(value * 1000) / 1000;

function find(testId: string): HTMLElement {
  const node = document.querySelector(`[data-testid="${testId}"]`);
  if (node === null) throw new Error(`찾지 못했습니다: ${testId}`);
  return node as HTMLElement;
}

/**
 * 타일 하나를 **고정 폭** 상자 안에 렌더한다.
 *
 * 폭을 고정하는 이유는 값 때문이다. 정본이 값에 `white-space: nowrap` 을 걸어 두었고,
 * 폭이 좁으면 그 선언이 지켜지는지가 아니라 상자가 넘치는지를 재게 된다. 240 은 제품
 * 타일 격자(5열·1400px 이하 3열)의 실제 트랙 폭 대역이다.
 */
function Specimen({
  size,
  tone,
  hint = true,
  delta = true,
  id = "",
  stretch = false,
}: {
  size: Size;
  tone: Tone;
  hint?: boolean;
  delta?: boolean;
  /** 한 시험이 여러 벌을 렌더할 때 `find` 가 첫 벌만 집지 않도록 붙이는 접미사. */
  id?: string;
  /** 격자가 행 높이를 맞추는 상황. 알약의 `margin-block-start: auto` 는 그때만 뜻을 갖는다. */
  stretch?: boolean;
}): JSX.Element {
  return (
    <div
      style={
        stretch
          ? { display: "grid", gridTemplateColumns: "240px", blockSize: "240px" }
          : { inlineSize: "240px" }
      }
    >
      <div className="louis-stat-tile" data-size={size} data-testid={`tile${id}`}>
        <span className="louis-stat-tile__label" data-testid={`label${id}`}>
          신규 가입
        </span>
        <strong className="louis-stat-tile__value" data-testid={`value${id}`}>
          1,284
        </strong>
        {hint ? (
          <span className="louis-stat-tile__hint" data-testid={`hint${id}`}>
            지난 7일
          </span>
        ) : null}
        {delta ? (
          <span className="louis-delta-pill" data-tone={tone} data-testid={`delta${id}`}>
            +12.4%
          </span>
        ) : null}
      </div>
    </div>
  );
}

for (const size of SIZES) {
  test(`stat-tile ${size}: 액자 기하가 계약과 같다`, async () => {
    await render(<Specimen size={size} tone="flat" />);
    const tile = find("tile");
    const style = getComputedStyle(tile);
    const want = spec[size];

    expect(px(style.paddingTop)).toBe(want.paddingBlock);
    expect(px(style.paddingBottom)).toBe(want.paddingBlock);
    expect(px(style.paddingLeft)).toBe(want.paddingInline);
    expect(px(style.paddingRight)).toBe(want.paddingInline);
    expect(px(style.rowGap)).toBe(want.gap);
    expect(px(style.borderTopLeftRadius)).toBe(want.radius);
    // 계약의 borderWidth 0 은 「경계가 border 가 아니다」는 뜻이다. 0.5 는 그 자리를 대신하는
    // inset 그림자의 spread 이지 레이아웃 두께가 아니다(DS-D-0023).
    expect(px(style.borderTopWidth)).toBe(want.borderWidth);
    expect(style.boxShadow).not.toBe("none");
  });

  test(`stat-tile ${size}: 세 글자 자손의 크기와 행간이 계약과 같다`, async () => {
    await render(<Specimen size={size} tone="flat" />);
    const want = spec[size];

    const label = getComputedStyle(find("label"));
    expect(px(label.fontSize)).toBe(want.labelFontSize);
    expect(round((px(label.lineHeight) / px(label.fontSize)) * 100)).toBe(150);

    const value = getComputedStyle(find("value"));
    expect(px(value.fontSize)).toBe(want.valueFontSize);
    expect(round((px(value.lineHeight) / px(value.fontSize)) * 100)).toBe(
      want.valueLineHeightPercent,
    );
    // 여러 타일이 한 행에 서고 값이 갱신되므로 비례폭 숫자면 글자가 좌우로 떨린다.
    expect(value.fontVariantNumeric).toContain("tabular-nums");
    // 줄바꿈이 그 타일 하나만 키를 키워 행 전체를 어긋나게 한다.
    expect(value.whiteSpace).toBe("nowrap");

    const hint = getComputedStyle(find("hint"));
    expect(px(hint.fontSize)).toBe(want.hintFontSize);
    expect(round((px(hint.lineHeight) / px(hint.fontSize)) * 100)).toBe(150);
  });

  test(`stat-tile ${size}: 증감 알약의 기하가 계약과 같다`, async () => {
    await render(<Specimen size={size} tone="up" />);
    const delta = getComputedStyle(find("delta"));
    const want = spec[size];

    expect(px(delta.paddingTop)).toBe(want.deltaPaddingBlock);
    expect(px(delta.paddingBottom)).toBe(want.deltaPaddingBlock);
    // **두 구현이 다투던 유일한 값이다** — 어드민 8 · 애널리틱스 6. 6 이 정본이다.
    expect(px(delta.paddingLeft)).toBe(want.deltaPaddingInline);
    expect(px(delta.paddingRight)).toBe(want.deltaPaddingInline);
    expect(px(delta.borderTopLeftRadius)).toBe(want.deltaRadius);
    expect(px(delta.fontSize)).toBe(want.deltaFontSize);
  });
}

test("stat-tile: 세 톤이 면과 잉크를 함께 갈아 끼운다", async () => {
  // 톤이 색으로만 구별되는 자리라 「축이 죽어 있는지」를 여기서 잡는다. Badge 의 네 톤 클래스가
  // 바이트 단위로 같았던 것이 그 실패의 선례다.
  // **세 벌을 한 번에 렌더한다.** 따로 렌더하면 `find` 가 항상 첫 벌을 집어 세 값이 하나로
  // 보이고 시험이 조용히 통과한다 — 실제로 그렇게 통과할 뻔했다.
  await render(
    <div>
      {TONES.map((tone) => (
        <Specimen key={tone} size="md" tone={tone} id={`-${tone}`} />
      ))}
    </div>,
  );
  const seen = TONES.map((tone) => {
    const style = getComputedStyle(find(`delta-${tone}`));
    return `${style.backgroundColor} / ${style.color}`;
  });
  expect(new Set(seen).size).toBe(TONES.length);
});

test("stat-tile: 알약은 힌트가 없어도 바닥에 붙는다", async () => {
  // 격자가 행 높이를 맞추므로, 알약이 값 바로 밑에 뜨면 한 행 안에서 알약 줄이 들쭉날쭉해진다.
  //
  // **계산 스타일로는 잡히지 않는다.** `margin-block-start: auto` 의 사용값은 늘어날 자리가
  // 없으면 0px 이고, getComputedStyle 은 선언값이 아니라 그 사용값을 준다. 그래서 늘어날
  // 자리를 만들고(격자 240px) **위치를 잰다.**
  await render(<Specimen size="md" tone="flat" hint={false} stretch />);
  const tile = find("tile").getBoundingClientRect();
  const delta = find("delta").getBoundingClientRect();
  expect(Math.round(tile.bottom - delta.bottom)).toBe(
    measured.components["stat-tile"].sizes.md.paddingBlock,
  );
});
