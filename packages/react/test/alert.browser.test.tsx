// figma/components.measured.json 의 **alert** 값을 코드가 여전히 만드는지 검증한다.
//
// 이 파일이 없으면 alert 칸은 한 번 적어 두고 잊히는 숫자가 된다. parity 게이트는 Figma 가
// measured 와 같은지만 보므로, CSS 가 조용히 바뀌면 **Figma 와 measured 는 서로 맞고 둘 다
// 코드와 틀린** 상태로 통과한다. 다른 칸에서 그 반대편을 잡는 것이
// component-geometry / surface-geometry 두 파일이고, alert 는 그 둘 어디에도 없었다.
//
// **React 컴포넌트가 아니라 클래스 마크업을 렌더한다.** alert 는 `packages/react/src` 에
// 표면이 없고 정본이 `packages/css/src/component/alert.css` 다(계약의 `figmaAhead` 가 그
// 사실을 적는다). 그래서 여기서 렌더하는 마크업은 문서 Usage 절의 계약 그대로여야 한다 —
// 소비처가 지켜야 하는 것과 다른 마크업을 재면 이 파일이 제품에 없는 값을 지키게 된다.
import type { JSX } from "react";
import { expect, test } from "vitest";
import { render } from "vitest-browser-react";
import measured from "../../../figma/components.measured.json" with { type: "json" };
import "@klipse-design/css/layers.css";
import "@klipse-design/css/tokens.css";
import "@klipse-design/css/styles.css";

type Layout = "block" | "inline" | "banner";
type Tone = "danger" | "info" | "success" | "warning";

const LAYOUTS: readonly Layout[] = ["block", "inline", "banner"];
const TONES: readonly Tone[] = ["danger", "info", "success", "warning"];
const TRANSPARENT = "rgba(0, 0, 0, 0)";

const px = (value: string): number => Number.parseFloat(value);
const rect = (node: Element): DOMRect => node.getBoundingClientRect();
const round = (value: number): number => Math.round(value * 1000) / 1000;

/** 토큰의 계산값을 얻는다. 값이 같은 토큰이 여럿이라 이름 역조회는 쓰지 않는다. */
function tokenValue(id: string, property: "background-color" | "color"): string {
  const probe = document.createElement("div");
  probe.style.setProperty(property, `var(--louis-${id})`);
  document.body.append(probe);
  const style = getComputedStyle(probe);
  const value = property === "color" ? style.color : style.backgroundColor;
  probe.remove();
  return value;
}

/**
 * 한 줄짜리 알림 하나를 고정 폭 상자 안에 렌더한다.
 *
 * 폭을 고정하는 이유는 높이 때문이다. 폭이 컨테이너에 달려 있어서(`inline-size: 100%`)
 * 좁으면 문구가 두 줄이 되고, 그러면 계약의 「한 줄 높이」를 재는 것이 아니라 줄 수를 잰다.
 */
function Specimen({
  layout,
  tone,
  dismiss = false,
  id = "",
}: {
  layout: Layout;
  /** `exactOptionalPropertyTypes` 가 켜져 있어 `undefined` 를 명시적으로 받는다 — danger 는
   *  속성을 **주지 않는 것**이 계약이라(문서 Known deviations 3) 호출부가 undefined 를 넘긴다. */
  tone?: Tone | undefined;
  /** 닫기 슬롯. **기본이 꺼짐인 이유가 계약에 있다** — 계약의 `height` 는 아이콘 + 한 줄의
   *  높이이고, 닫기에 들어가는 `.louis-icon-button` 은 32px 이라 그것을 넣으면 줄 높이가
   *  아니라 버튼 높이를 재게 된다. 그래서 닫기는 그 슬롯을 재는 시험에서만 켠다. */
  dismiss?: boolean;
  id?: string;
}): JSX.Element {
  return (
    <div style={{ inlineSize: "600px" }}>
      <div
        className="louis-alert"
        data-layout={layout}
        data-tone={tone}
        data-testid={`alert${id}`}
        role="status"
      >
        <span className="louis-alert__icon" data-testid={`icon${id}`} />
        <div className="louis-alert__content" data-testid={`content${id}`}>
          안내
        </div>
        {dismiss ? (
          <span className="louis-alert__dismiss" data-testid={`dismiss${id}`}>
            <button className="louis-icon-button" type="button" aria-label="닫기" />
          </span>
        ) : null}
      </div>
    </div>
  );
}

function find(testId: string): HTMLElement {
  const node = document.querySelector(`[data-testid="${testId}"]`);
  if (node === null) throw new Error(`찾지 못했습니다: ${testId}`);
  return node as HTMLElement;
}

for (const layout of LAYOUTS) {
  const spec = measured.components.alert.sizes[layout];

  test(`Alert ${layout}의 구조값이 components.measured.json과 같다`, async () => {
    await render(<Specimen layout={layout} />);
    const root = find("alert");
    const style = getComputedStyle(root);

    expect(px(style.paddingTop), "paddingBlock").toBe(spec.paddingBlock);
    expect(px(style.paddingBottom), "paddingBlockEnd").toBe(spec.paddingBlock);
    expect(px(style.paddingLeft), "paddingInline").toBe(spec.paddingInline);
    expect(px(style.paddingRight), "paddingInlineEnd").toBe(spec.paddingInline);
    expect(px(style.columnGap), "gap").toBe(spec.gap);
    expect(px(style.borderTopWidth), "borderWidth").toBe(spec.borderWidth);
    expect(px(style.borderBottomWidth), "borderWidth (아래)").toBe(spec.borderWidth);
    expect(px(style.borderTopLeftRadius), "radius").toBe(spec.radius);
    expect(px(style.fontSize), "fontSize").toBe(spec.fontSize);
    expect(px(style.lineHeight), "lineHeight").toBe(spec.lineHeight);
    // 한 줄 높이. 패딩 + 테두리 + 행 높이의 합이 계약의 height 다.
    expect(round(rect(root).height), "height").toBe(spec.height);

    const icon = find("icon");
    expect(round(rect(icon).width), "icon width").toBe(spec.icon);
    expect(round(rect(icon).height), "icon height").toBe(spec.icon);
    expect(px(getComputedStyle(icon).marginBlockStart), "iconMarginBlockStart").toBe(
      spec.iconMarginBlockStart,
    );
  });
}

test("Alert banner의 닫기는 오른쪽 끝에 고정되고 흐름을 밀지 않는다", async () => {
  const spec = measured.components.alert.sizes.banner;
  // **닫기가 있는 벌과 없는 벌을 나란히 렌더한다.** 「밀지 않는다」는 두 벌을 비교해야만
  // 참·거짓이 갈리는 명제다. 한 벌만 재면 「가운데에 있다」밖에 못 재는데, 그것은 아이콘이
  // 앞에 서는 순간 거짓이 된다 — 가운데에 서는 것은 본문 상자가 아니라 **행 전체**다.
  await render(
    <div>
      <Specimen layout="banner" dismiss id="-with" />
      <Specimen layout="banner" id="-without" />
    </div>,
  );
  const root = find("alert-with");
  const dismiss = find("dismiss-with");
  expect(getComputedStyle(dismiss).position, "position").toBe("absolute");
  expect(
    round(rect(root).right - rect(dismiss).right),
    "dismissInsetInlineEnd",
  ).toBe(spec.dismissInsetInlineEnd);
  expect(
    round(rect(find("content-with")).left),
    "닫기가 있어도 본문이 같은 자리에 선다",
  ).toBe(round(rect(find("content-without")).left));
  // 그 자리가 실제로 가운데인지도 함께 본다 — 행 전체(아이콘 왼끝 ~ 본문 오른끝)가 기준이다.
  const lineLeft = rect(find("icon-with")).left;
  const lineRight = rect(find("content-with")).right;
  expect(
    Math.abs((lineLeft + lineRight) / 2 - (rect(root).left + rect(root).width / 2)) < 1,
    "행이 띠 가운데에 선다",
  ).toBe(true);
});

for (const layout of LAYOUTS) {
  const paints = measured.components.alert.states[layout];

  for (const tone of TONES) {
    const paint = paints[tone];

    test(`Alert ${layout}/${tone}가 계약이 지목한 토큰을 문다`, async () => {
      // danger 는 CSS 에 선택자가 없다 — 속성을 주지 않은 기본이 곧 danger 다(문서 Known
      // deviations 3). 속성을 주면 「없는 값을 통과시킨다」를 재게 되므로 주지 않는다.
      await render(<Specimen layout={layout} tone={tone === "danger" ? undefined : tone} />);
      const style = getComputedStyle(find("alert"));

      const wantBackground =
        paint.background === null ? TRANSPARENT : tokenValue(paint.background, "background-color");
      expect(style.backgroundColor, "background").toBe(wantBackground);
      expect(style.color, "foreground").toBe(tokenValue(paint.foreground, "color"));
      if ("border" in paint && paint.border !== undefined) {
        expect(style.borderTopColor, "border").toBe(tokenValue(paint.border, "color"));
      }
    });
  }
}
