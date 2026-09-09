// figma/components.measured.json 의 **faq-row** 값을 코드가 여전히 만드는지 검증한다.
//
// 이 파일이 없으면 faq-row 칸은 한 번 적어 두고 잊히는 숫자가 된다. parity 게이트는 Figma 가
// measured 와 같은지만 보므로, CSS 가 조용히 바뀌면 **Figma 와 measured 는 서로 맞고 둘 다
// 코드와 틀린** 상태로 통과한다. `verify-figma-done` 이 요구하는 「두 방향」의 뒤쪽이 이 파일이고,
// 계약의 faq-row 가 `partial` 로 남아 있던 사유가 정확히 「그 되재기가 없다」였다.
//
// **React 컴포넌트가 아니라 클래스 마크업을 렌더한다.** faq-row 는 packages/react/src 에 표면이
// 없고 정본이 packages/css/src/component/faq-row.css 다. 그래서 여기서 렌더하는 마크업은 문서
// Usage 절의 계약 그대로여야 한다 — 소비처가 지켜야 하는 것과 다른 마크업을 재면 이 파일이
// 제품에 없는 값을 지키게 된다. alert · section-header · stat-tile 이 같은 형태다.
//
// **저작 CSS 를 직접 import 한다.** 생성물 `styles.css` 는 build-css 가 만드는데 다른 저작 파일
// 하나가 그 빌드를 앞질러 갈 수 있다. 저작 원본을 읽는 것이 오히려 더 정확하다 — 재는 대상이
// 「생성물이 최신인가」가 아니라 「저작 CSS 가 계약값을 만드는가」이기 때문이다(stat-tile 과 같다).
import type { JSX } from "react";
import { expect, test } from "vitest";
import { render } from "vitest-browser-react";
import measured from "../../../figma/components.measured.json" with { type: "json" };
import "@klipse-design/css/layers.css";
import "@klipse-design/css/tokens.css";
import "@klipse-design/css/styles.css";
import "../../css/src/component/faq-row.css";

type Size = "lg" | "md";

const SIZES: readonly Size[] = ["lg", "md"];
const spec = measured.components["faq-row"].sizes;

/** 계약의 키는 `{Expanded}/{Size}` 복합이다. */
const key = (expanded: boolean, size: Size) => `${expanded}/${size}` as const;

const px = (value: string): number => Number.parseFloat(value);

function find(testId: string): HTMLElement {
  const node = document.querySelector(`[data-testid="${testId}"]`);
  if (node === null) throw new Error(`찾지 못했습니다: ${testId}`);
  return node as HTMLElement;
}

/**
 * 행 하나를 **고정 폭** 상자 안에 렌더한다.
 *
 * 폭을 고정하는 이유는 닫힌 행 높이 66 때문이다. 질문이 두 줄이 되면 행이 자라므로, 폭이
 * 러너 창에 달려 있으면 66 을 재는 것이 아니라 「이 창에서 두 줄이 되는가」를 재게 된다.
 * 1400 · 1032 는 정본 두 자리의 실제 단 폭이고 되읽기의 `parts.Question.width` 와 같다.
 *
 * `md` 는 글리프 문자 자체를 `+` ↔ `−` 로 갈아 끼운다(정본 `FAQPanel.tsx`). `lg` 는 같은 `+`
 * 가 45° 돈다.
 */
function Specimen({
  size,
  expanded,
  id = "",
}: {
  size: Size;
  expanded: boolean;
  id?: string;
}): JSX.Element {
  return (
    <div style={{ inlineSize: size === "lg" ? "1400px" : "1032px" }}>
      <div className="louis-faq-row" data-size={size} data-testid={`row${id}`}>
        <button
          type="button"
          className="louis-faq-row__question"
          aria-expanded={expanded}
          data-testid={`question${id}`}
        >
          <span className="louis-faq-row__question-text" data-testid={`text${id}`}>
            Klipse는 무엇인가요?
          </span>
          <span className="louis-faq-row__icon" aria-hidden="true" data-testid={`icon${id}`}>
            {size === "md" && expanded ? "−" : "+"}
          </span>
        </button>
        {expanded ? (
          <p className="louis-faq-row__answer" data-testid={`answer${id}`}>
            Klipse는 크리에이터를 위한 AI 영상 제작 플랫폼입니다.
          </p>
        ) : null}
      </div>
    </div>
  );
}

for (const size of SIZES) {
  test(`faq-row ${size}: 행이 반경만 갖고 여백을 갖지 않는다`, async () => {
    await render(<Specimen size={size} expanded={false} />);
    const style = getComputedStyle(find("row"));
    const want = spec[key(false, size)];

    expect(px(style.borderTopLeftRadius)).toBe(want.radius);
    expect(px(style.paddingTop)).toBe(want.paddingBlock);
    expect(px(style.paddingBottom)).toBe(want.paddingBlock);
    expect(px(style.paddingLeft)).toBe(want.paddingInline);
    expect(px(style.paddingRight)).toBe(want.paddingInline);
    // 펼침이 모서리를 넘지 않게 하는 선언. 이것이 없으면 열린 답변이 반경 밖으로 삐져나온다.
    expect(style.overflowX).toBe("hidden");
  });

  test(`faq-row ${size}: 닫힌 질문 줄의 기하가 계약과 같다`, async () => {
    await render(<Specimen size={size} expanded={false} />);
    const question = find("question");
    const style = getComputedStyle(question);
    const want = spec[key(false, size)];

    expect(px(style.paddingTop)).toBe(want.questionPaddingBlock);
    expect(px(style.paddingBottom)).toBe(want.questionPaddingBlock);
    expect(px(style.paddingLeft)).toBe(want.questionPaddingInline);
    expect(px(style.paddingRight)).toBe(want.questionPaddingInline);
    expect(px(style.columnGap)).toBe(want.questionGap);
    expect(px(style.fontSize)).toBe(want.questionFontSize);
    expect(px(style.lineHeight)).toBe(want.questionLineHeight);
    // 66 = 18 + 30 + 18 · 48 = 12 + 24 + 12. 여백과 줄 상자에서 떨어지는 수이지 고정값이 아니다.
    expect(question.getBoundingClientRect().height).toBe(want.questionHeight);
    // 닫힌 행은 통째로 버튼이다 — 질문 글자가 짧아도 오른쪽 빈 자리까지 눌린다.
    expect(question.getBoundingClientRect().width).toBe(
      find("row").getBoundingClientRect().width,
    );
  });

  test(`faq-row ${size}: 글리프가 질문과 같은 줄 상자에 선다`, async () => {
    await render(<Specimen size={size} expanded={false} />);
    const icon = find("icon");
    const style = getComputedStyle(icon);
    const want = spec[key(false, size)];

    expect(px(style.fontSize)).toBe(want.iconFontSize);
    expect(icon.getBoundingClientRect().height).toBe(want.iconHeight);
    // 글리프는 줄어들지 않는다 — 질문이 길어지면 글자가 접히고 `+` 는 자리를 지킨다.
    expect(style.flexShrink).toBe("0");
  });

  test(`faq-row ${size}: 여닫이가 면·반경·좌우 여백을 바꾸지 않는다`, async () => {
    // 계약의 acceptance test 6. 두 상태를 **한 번에** 렌더한다 — 따로 렌더하면 `find` 가 항상
    // 첫 벌을 집어 두 값이 하나로 보이고 시험이 조용히 통과한다.
    await render(
      <div>
        <Specimen size={size} expanded={false} id="-closed" />
        <Specimen size={size} expanded id="-open" />
      </div>,
    );
    const closed = getComputedStyle(find("row-closed"));
    const open = getComputedStyle(find("row-open"));
    expect(open.backgroundColor).toBe(closed.backgroundColor);
    expect(open.borderTopLeftRadius).toBe(closed.borderTopLeftRadius);

    const closedQuestion = getComputedStyle(find("question-closed"));
    const openQuestion = getComputedStyle(find("question-open"));
    expect(openQuestion.paddingLeft).toBe(closedQuestion.paddingLeft);
    expect(openQuestion.paddingRight).toBe(closedQuestion.paddingRight);

    // 답변은 질문의 좌우와 맞는다 — 계약에 없는 값이라 관계로 고정한다.
    const answer = getComputedStyle(find("answer-open"));
    expect(answer.paddingLeft).toBe(closedQuestion.paddingLeft);
    expect(answer.paddingRight).toBe(closedQuestion.paddingRight);
  });
}

test("faq-row: `lg` 는 열림에서 글리프를 45° 돌리고 `md` 는 돌리지 않는다", async () => {
  // **`md` 는 글자 자체를 `+` ↔ `−` 로 갈아 끼운다.** 거기까지 돌리면 `−` 가 세로줄이 되어
  // 닫힘으로 읽힌다. 두 크기를 한 번에 렌더해 「둘 다 안 돈다」로 조용히 통과하는 것을 막는다.
  await render(
    <div>
      <Specimen size="lg" expanded id="-lg" />
      <Specimen size="md" expanded id="-md" />
      <Specimen size="lg" expanded={false} id="-lg-closed" />
    </div>,
  );
  // 45° 회전은 matrix(0.707…, 0.707…, -0.707…, 0.707…, 0, 0) 로 계산된다.
  const rotated = getComputedStyle(find("icon-lg")).transform;
  expect(rotated).not.toBe("none");
  expect(Number.parseFloat(rotated.replace("matrix(", ""))).toBeCloseTo(Math.SQRT1_2, 3);
  expect(getComputedStyle(find("icon-md")).transform).toBe("none");
  expect(getComputedStyle(find("icon-lg-closed")).transform).toBe("none");
});

test("faq-row: 상태의 출처가 `aria-expanded` 하나다", async () => {
  // `+` 는 `aria-hidden` 이라 상태를 싣지 않는다 — 회전을 `[aria-expanded="true"]` 에 걸어 둔
  // 것이 그 계약이고, 속성이 없으면 **시각도 서지 않아야** 둘이 갈리지 않는다.
  //
  // **속성을 지우고 되재지 않는다.** 회전에 220ms 전환이 걸려 있어 지운 직후의 계산값은 되돌아가는
  // 중간값이고, 그 시험은 「시간이 얼마나 흘렀나」를 재게 된다. 세 벌을 한 번에 세워 비교한다.
  await render(
    <div>
      <Specimen size="lg" expanded id="-true" />
      <Specimen size="lg" expanded={false} id="-false" />
      <div style={{ inlineSize: "1400px" }}>
        <div className="louis-faq-row" data-size="lg">
          <button type="button" className="louis-faq-row__question" data-testid="question-none">
            <span className="louis-faq-row__question-text">Klipse는 무엇인가요?</span>
            <span className="louis-faq-row__icon" aria-hidden="true" data-testid="icon-none">
              +
            </span>
          </button>
        </div>
      </div>
    </div>,
  );
  expect(getComputedStyle(find("icon-true")).transform).not.toBe("none");
  expect(getComputedStyle(find("icon-false")).transform).toBe("none");
  expect(getComputedStyle(find("icon-none")).transform).toBe("none");
});

test("faq-row: 행 면이 랜딩 바닥보다 진하고 사다리 칸이 아니다", async () => {
  // 문서 Known deviations 1 — `gray-900` 이나 `bg-*` 사다리를 쓰면 라이트에서 행이 바닥과
  // 같아져 사라진다. 이름은 `verify-recipe-record` 가 고정하고, 여기서는 **합성 결과가 실제로
  // 바닥과 다른가**를 잰다.
  await render(
    <div style={{ background: "var(--louis-color-landing-page-bg)" }}>
      <Specimen size="lg" expanded={false} />
    </div>,
  );
  const surface = getComputedStyle(find("row")).backgroundColor;
  const floor = getComputedStyle(document.documentElement).getPropertyValue(
    "--louis-color-landing-page-bg",
  );
  expect(surface).not.toBe("rgba(0, 0, 0, 0)");
  expect(surface).not.toBe(floor.trim());
});
