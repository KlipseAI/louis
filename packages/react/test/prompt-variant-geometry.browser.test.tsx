// figma/components.measured.json 의 **prompt-variant** 기록을 코드가 실제로 만드는지 잰다(DS-D-0035).
//
// parity 게이트는 Figma 의 PromptVariant 가 기록과 같은지만 본다. 레시피가 조용히 바뀌면 Figma 와 기록은
// 서로 맞고 둘 다 코드와 틀린 채로 통과한다 — 이 파일이 그 틈이다. React 표면이 없어 정본
// packages/css/src/component/prompt-variant.css 의 클래스 마크업(design/components/prompt-variant.md Anatomy)을 렌더한다.
//
// 키 둘은 `data-layout` 축이다 — 없음 = card(노드 안 후보 카드), `column`(비교 모달의 열). 폭 · 높이는 놓이는 자리와
// 내용이 정해 기록에 없다.
import { expect, test } from "vitest";
import { render } from "vitest-browser-react";
import measured from "../../../figma/components.measured.json" with { type: "json" };
import "@klipse-design/css/layers.css";
import "@klipse-design/css/tokens.css";
import "@klipse-design/css/styles.css";
import "../../css/src/component/prompt-variant.css";

const px = (value: string): number => Number.parseFloat(value);

function find(testId: string): HTMLElement {
  const node = document.querySelector(`[data-testid="${testId}"]`);
  if (node === null) throw new Error(`찾지 못했습니다: ${testId}`);
  return node as HTMLElement;
}

// 기록의 두 칸 — 키는 Figma 되읽기 geometry 의 키(Layout 변형)와 같다.
const spec = {
  card: measured.components["prompt-variant"].sizes["card"],
  column: measured.components["prompt-variant"].sizes["column"],
} as Record<"card" | "column", Record<string, unknown>>;

/** `sizes` 한 칸. `$…` 사유와 한 객체에 섞여 있어 타입이 열려 있다 — 수가 아니면 던진다. */
function sizeOf(key: "card" | "column", field: string): number {
  const value = spec[key][field];
  if (typeof value !== "number") throw new Error(`prompt-variant.${key}.${field}가 수가 아닙니다`);
  return value;
}

function Card() {
  return (
    <div style={{ inlineSize: 364 }}>
      <button type="button" className="louis-prompt-variant" aria-haspopup="dialog" data-testid="card">
        <span className="louis-prompt-variant__head">
          <span className="louis-prompt-variant__style">시네마틱</span>
          <svg className="louis-prompt-variant__expand" viewBox="0 0 16 16" aria-hidden="true" />
        </span>
        <span className="louis-prompt-variant__text">해 질 녘 옥상, 역광 속 실루엣</span>
      </button>
    </div>
  );
}

function Column() {
  return (
    <div className="louis-prompt-variant-grid" style={{ inlineSize: 816 }}>
      <div
        className="louis-prompt-variant"
        data-layout="column"
        role="group"
        aria-labelledby="pv-geom-style"
        data-testid="column"
      >
        <div className="louis-prompt-variant__head">
          <span className="louis-prompt-variant__style" id="pv-geom-style">
            시네마틱
          </span>
        </div>
        <div className="louis-prompt-variant__body">
          <span className="louis-prompt-variant__label">프롬프트</span>
          <p className="louis-prompt-variant__text">해 질 녘 옥상, 역광 속 실루엣</p>
        </div>
        <button type="button" className="louis-prompt-variant__action">
          이 프롬프트 사용
        </button>
      </div>
    </div>
  );
}

const layouts = [
  { key: "card", Specimen: Card },
  { key: "column", Specimen: Column },
] as const;

for (const { key, Specimen } of layouts) {
  test(`prompt-variant ${key}: 여백 · 간격 · 반경 · 방향이 기록과 같다`, async () => {
    await render(<Specimen />);
    const style = getComputedStyle(find(key));

    // Figma 의 paddingBlock · paddingInline 이 한 기록 칸(padding)을 읽는다 — 네 변이 모두 그 값이어야 한다.
    const padding = sizeOf(key, "padding");
    expect(px(style.paddingTop)).toBe(padding);
    expect(px(style.paddingBottom)).toBe(padding);
    expect(px(style.paddingLeft)).toBe(padding);
    expect(px(style.paddingRight)).toBe(padding);

    // itemSpacing ← gap. 열의 0 은 줄 사이를 머리 · 버튼의 마진이 갖는다는 뜻이다.
    expect(px(style.rowGap)).toBe(sizeOf(key, "gap"));

    // cornerRadius ← radius. 네 모서리가 같다.
    const radius = sizeOf(key, "radius");
    expect(px(style.borderTopLeftRadius)).toBe(radius);
    expect(px(style.borderTopRightRadius)).toBe(radius);
    expect(px(style.borderBottomLeftRadius)).toBe(radius);
    expect(px(style.borderBottomRightRadius)).toBe(radius);

    // layoutMode 는 계약의 literal VERTICAL — 세로 flex 다.
    expect(style.display).toBe("flex");
    expect(style.flexDirection).toBe("column");
  });
}
