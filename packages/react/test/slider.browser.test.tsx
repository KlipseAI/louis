// design/components/slider.md의 Acceptance tests를 실제 브라우저에서 검증한다.
//
// 이 컴포넌트는 제품에 정본이 없다 — 정의 37벌이 일곱 레시피로 갈리고 **합의하는 축이 하나도
// 없다.** 대조할 바깥 기준이 없으므로 테스트가 유일한 고정 장치다.
//
// ## 왜 레일과 썸을 계산값으로 재지 않는가
//
// Chromium의 `getComputedStyle(input, "::-webkit-slider-runnable-track")`은 섀도우
// pseudo-element가 아니라 **호스트 input의 값**을 돌려준다 — 2026-08-18 실측에서 320×40,
// 배경 투명, 반경 0이 나왔다. 그래서 그 축들은 CSSOM의 **선언**을 대조한다. Button의
// borderWidth가 계산값(브라우저가 1px로 올린다) 대신 선언 토큰을 보는 것과 같은 이유다.
import type { JSX } from "react";
import { useState } from "react";
import axe from "axe-core";
import { expect, test } from "vitest";
import { userEvent } from "vitest/browser";
import { render } from "vitest-browser-react";
import { Slider, type SliderSize } from "@klipse-design/react";
import measured from "../../../figma/components.measured.json" with { type: "json" };
import "@klipse-design/css/layers.css";
import "@klipse-design/css/tokens.css";
import "@klipse-design/css/styles.css";

const px = (value: string): number => Number.parseFloat(value);

function find(selector: string): HTMLElement {
  const node = document.querySelector(selector);
  if (node === null) throw new Error(`찾지 못했습니다: ${selector}`);
  return node as HTMLElement;
}

const control = (): HTMLInputElement =>
  find("input.louis-slider__control") as HTMLInputElement;

const tokenPx = (id: string): number =>
  px(getComputedStyle(document.documentElement).getPropertyValue(`--louis-${id}`));

/**
 * 배포 CSS가 이 선택자에 이 속성을 **선언했는지** 읽는다.
 *
 * 섀도우 pseudo-element는 계산값이 없지만 규칙 자체는 CSSOM에 있다. 선택자를 문자열로 비교하는
 * 대신 정규화해서 맞춘다 — 브라우저가 `::-webkit-slider-thumb`의 대소문자와 공백을 다시 쓴다.
 */
function declared(selector: string, property: string): string {
  const wanted = selector.replace(/\s+/g, " ").trim();
  for (const sheet of Array.from(document.styleSheets)) {
    let rules: CSSRuleList;
    try {
      rules = sheet.cssRules;
    } catch {
      continue;
    }
    for (const rule of Array.from(rules)) {
      const nested = rule instanceof CSSLayerBlockRule ? Array.from(rule.cssRules) : [rule];
      for (const candidate of nested) {
        if (!(candidate instanceof CSSStyleRule)) continue;
        if (candidate.selectorText.replace(/\s+/g, " ").trim() !== wanted) continue;
        const value = candidate.style.getPropertyValue(property);
        if (value !== "") return value.trim();
      }
    }
  }
  throw new Error(`선언을 찾지 못했습니다: ${selector} { ${property} }`);
}

const SIZES: readonly SliderSize[] = ["lg", "md"];
// 기본(속성 없음)이 lg 다 — md 만 `[data-size="md"]` 로 덮는다. 계단 개명(sm→md, md→lg,
// DS-D-0027) 전에는 기본이 md 였고 이 삼항이 그때 방향 그대로 남아 lg 와 md 의 기대값이
// 서로 바뀌어 있었다.
const sizeScope = (size: SliderSize): string =>
  size === "lg" ? ".louis-slider__control" : '.louis-slider[data-size="md"] .louis-slider__control';

// **measured의 키가 `{size}/{variant}` 복합이다.** Variant 축이 레일 두께와 썸 크기를 바꾸므로
// size 하나로 묶으면 두 값이 한 항목에 섞여 어느 쪽이 어느 변형의 것인지 사라진다.
const specOf = (size: SliderSize, variant: "thumb" | "track") =>
  measured.components.slider.sizes[`${size}/${variant}` as keyof typeof measured.components.slider.sizes];

for (const size of SIZES) {
  const spec = specOf(size, "thumb");

  test(`Slider ${size}의 렌더 기하가 components.measured.json과 같다`, async () => {
    await render(
      <div style={{ inlineSize: "320px" }}>
        <Slider label="투명도" size={size} min={0} max={100} defaultValue={40} />
      </div>,
    );

    expect(control().offsetHeight, "height").toBe(spec.height);
    expect(px(getComputedStyle(find(".louis-slider")).rowGap), "stackGap").toBe(spec.stackGap);
    expect(px(getComputedStyle(find(".louis-slider__label")).fontSize), "labelFontSize").toBe(
      spec.labelFontSize,
    );
  });

  test(`Slider ${size}의 레일·썸 선언이 components.measured.json과 같다`, async () => {
    await render(<Slider label="투명도" size={size} />);

    // 레일 두께는 크기 축을 갖지 않는다 — 두 크기가 같은 4px이고 CSS에 sm 재정의가 없다.
    // 그래서 두 크기 모두 기본 선언을 읽는다. 썸만 크기별 규칙이 있다.
    const rail = ".louis-slider__control::-webkit-slider-runnable-track";
    const thumb = `${sizeScope(size)}::-webkit-slider-thumb`;
    expect(px(declared(rail, "block-size")), "railHeight").toBe(spec.railHeight);
    expect(px(declared(thumb, "inline-size")), "thumbInline").toBe(spec.thumbInline);
    expect(px(declared(thumb, "block-size")), "thumbBlock").toBe(spec.thumbBlock);

    // 썸 테두리는 리터럴이 아니라 링 토큰이다. 선언이 그 토큰을 가리키는지와, 그 토큰이
    // 계약값으로 계산되는지를 따로 본다 — 둘 중 하나만 보면 조용히 갈라진다.
    // 테두리도 크기 축을 갖지 않는다. sm 규칙은 크기만 덮으므로 선언은 기본 규칙에 있다.
    expect(
      declared(".louis-slider__control::-webkit-slider-thumb", "border"),
      "thumb border는 링 토큰을 쓴다",
    ).toContain("var(--louis-border-width-ring)");
    expect(tokenPx("border-width-ring"), "thumbBorderWidth").toBe(spec.thumbBorderWidth);
  });

  test(`Slider ${size}의 track 변형 선언이 components.measured.json과 같다`, async () => {
    const trackSpec = specOf(size, "track");
    await render(<Slider label="투명도" size={size} variant="track" />);

    // 굵은 막대는 레일이고 얇은 표식은 썸이다 — thumb 변형과 **같은 부품의 다른 값**이라
    // 계약에서도 같은 이름을 쓴다.
    const barSelector =
      size === "lg"
        ? '.louis-slider[data-variant="track"] .louis-slider__control::-webkit-slider-runnable-track'
        : '.louis-slider[data-variant="track"][data-size="md"] .louis-slider__control::-webkit-slider-runnable-track';
    expect(px(declared(barSelector, "block-size")), "railHeight").toBe(trackSpec.railHeight);

    const grip =
      '.louis-slider[data-variant="track"] .louis-slider__control::-webkit-slider-thumb';
    expect(px(declared(grip, "inline-size")), "thumbInline").toBe(trackSpec.thumbInline);
    expect(px(declared(grip, "block-size")), "thumbBlock").toBe(trackSpec.thumbBlock);
    // track의 표식은 테두리를 갖지 않는다. 계약이 0을 요구하고 선언이 border: 0이어야 한다.
    expect(trackSpec.thumbBorderWidth, "track 썸은 테두리가 없다").toBe(0);
    expect(declared(grip, "border"), "border를 0으로 지운다").toContain("0");
  });
}

test("track 변형의 썸이 지워지지 않는다 — 제품이 지운 바로 그 자리다", async () => {
  const trackSpec = specOf("md", "track");
  await render(<Slider label="투명도" variant="track" />);
  const grip = '.louis-slider[data-variant="track"] .louis-slider__control::-webkit-slider-thumb';

  // 제품 인스펙터 17벌은 `width:0; height:0; opacity:0; pointer-events:none`으로 썸을 지운다.
  // 그 넷 중 하나라도 여기 들어오면 키보드 사용자가 손잡이를 잃는다.
  expect(px(declared(grip, "inline-size")), "썸 폭이 0이면 안 된다").toBeGreaterThan(0);
  expect(px(declared(grip, "block-size")), "썸 높이가 0이면 안 된다").toBeGreaterThan(0);
  for (const property of ["opacity", "pointer-events"]) {
    let value = "";
    try {
      value = declared(grip, property);
    } catch {
      value = "";
    }
    expect(value, `${property}를 선언하지 않는다`).toBe("");
  }
});

test("채움 비율이 값을 따라간다", async () => {
  await render(<Slider label="투명도" min={0} max={200} defaultValue={50} />);
  const input = control();
  expect(input.style.getPropertyValue("--louis-slider-fill"), "초기 채움").toBe("25%");

  input.focus();
  await userEvent.keyboard("{End}");
  expect(input.value, "End가 max로 간다").toBe("200");
  expect(input.style.getPropertyValue("--louis-slider-fill"), "max 채움").toBe("100%");

  await userEvent.keyboard("{Home}");
  expect(input.style.getPropertyValue("--louis-slider-fill"), "min 채움").toBe("0%");
});

test("방향키가 step만큼 움직이고 min·max를 넘지 않는다", async () => {
  const seen: number[] = [];
  await render(
    <Slider
      label="속도"
      min={0.5}
      max={2}
      step={0.25}
      defaultValue={1}
      onValueChange={(value) => seen.push(value)}
    />,
  );
  const input = control();
  input.focus();

  await userEvent.keyboard("{ArrowRight}");
  expect(input.value, "오른쪽 한 칸").toBe("1.25");

  await userEvent.keyboard("{ArrowLeft}{ArrowLeft}");
  expect(input.value, "왼쪽 두 칸").toBe("0.75");

  // 하한에서 더 내려도 min 아래로 가지 않는다. 네이티브가 막는 것이고 그것이 이 컴포넌트가
  // 네이티브를 고른 이유다.
  await userEvent.keyboard("{ArrowLeft}{ArrowLeft}{ArrowLeft}");
  expect(input.value, "min에서 멈춘다").toBe("0.5");
  expect(seen.at(-1), "onValueChange가 같은 값을 본다").toBe(0.5);
});

test("controlled일 때 호출부가 값을 소유한다", async () => {
  function Fixture(): JSX.Element {
    const [value, setValue] = useState(10);
    return (
      <>
        <Slider label="투명도" min={0} max={100} value={value} onValueChange={setValue} />
        <button type="button" onClick={() => setValue(80)}>
          80으로
        </button>
      </>
    );
  }
  await render(<Fixture />);
  const input = control();
  expect(input.value, "초기값").toBe("10");

  await userEvent.click(find("button"));
  expect(input.value, "바깥에서 바꾼 값이 반영된다").toBe("80");
  expect(input.style.getPropertyValue("--louis-slider-fill"), "채움도 따라간다").toBe("80%");
});

test("값이 갱신되지 않는 controlled에서 값이 튀지 않는다", async () => {
  // 호출부가 onValueChange를 무시하면 값은 그대로여야 한다. 내부 상태가 이기면 화면과
  // 호출부의 상태가 갈라진다.
  await render(<Slider label="고정" min={0} max={100} value={30} onValueChange={() => {}} />);
  const input = control();
  input.focus();
  await userEvent.keyboard("{ArrowRight}");
  expect(input.value, "controlled 값이 이긴다").toBe("30");
  expect(input.style.getPropertyValue("--louis-slider-fill"), "채움도 그대로다").toBe("30%");
});

test("라벨이 컨트롤에 연결되고, 필드가 둘이면 id가 다르다", async () => {
  await render(
    <>
      <Slider label="투명도" />
      <Slider label="속도" />
    </>,
  );
  const inputs = Array.from(
    document.querySelectorAll("input.louis-slider__control"),
  ) as HTMLInputElement[];
  const labels = Array.from(
    document.querySelectorAll("label.louis-slider__label"),
  ) as HTMLLabelElement[];

  expect(inputs).toHaveLength(2);
  expect(inputs[0]!.id, "id가 서로 다르다").not.toBe(inputs[1]!.id);
  expect(labels[0]!.htmlFor, "라벨이 첫 컨트롤을 가리킨다").toBe(inputs[0]!.id);

  await userEvent.click(labels[1]!);
  expect(document.activeElement, "라벨을 누르면 그 컨트롤이 포커스를 받는다").toBe(inputs[1]);
});

test("포커스 링이 키보드에서만 나타난다", async () => {
  await render(
    <>
      <button type="button">앞</button>
      <Slider label="투명도" />
    </>,
  );
  const input = control();

  await userEvent.click(input);
  expect(input.matches(":focus"), "클릭은 포커스를 준다").toBe(true);
  expect(input.matches(":focus-visible"), "포인터 클릭에는 링이 없다").toBe(false);
  expect(getComputedStyle(input).outlineStyle, "포인터 클릭에는 링이 없다").toBe("none");

  // 키보드로 들어오면 :focus-visible이 켜진다. 앞 요소에서 Tab으로 넘어와야 브라우저가
  // 그 구분을 한다 — input.focus()만으로는 판정이 바뀌지 않는다.
  find("button").focus();
  await userEvent.tab();
  expect(document.activeElement, "Tab이 컨트롤로 들어온다").toBe(input);
  expect(input.matches(":focus-visible"), "키보드 포커스다").toBe(true);
  const focused = getComputedStyle(input);
  expect(focused.outlineStyle, "키보드에서는 링이 있다").toBe("solid");
  expect(px(focused.outlineWidth), "링 두께가 border-width-ring이다").toBe(
    tokenPx("border-width-ring"),
  );
});

test("disabled면 키보드로도 값이 바뀌지 않는다", async () => {
  const seen: number[] = [];
  await render(
    <Slider label="투명도" min={0} max={100} defaultValue={40} disabled onValueChange={(v) => seen.push(v)} />,
  );
  const input = control();
  expect(input.disabled, "disabled 속성").toBe(true);

  input.focus();
  await userEvent.keyboard("{ArrowRight}{End}");
  expect(input.value, "값이 그대로다").toBe("40");
  expect(seen, "콜백이 불리지 않는다").toEqual([]);
});

test("formatValue를 준 값만 aria-valuetext를 갖는다", async () => {
  await render(
    <>
      <Slider label="속도" min={0.5} max={2} step={0.5} defaultValue={1.5} formatValue={(v) => `${v}배`} />
      <Slider label="여백" min={0} max={48} step={2} defaultValue={8} />
    </>,
  );
  const inputs = Array.from(
    document.querySelectorAll("input.louis-slider__control"),
  ) as HTMLInputElement[];

  expect(inputs[0]!.getAttribute("aria-valuetext"), "뜻이 있는 표현을 준다").toBe("1.5배");
  // 숫자가 그 자체로 뜻을 가지면 붙이지 않는다. 늘 붙이면 aria-valuenow를 덮는다.
  expect(inputs[1]!.getAttribute("aria-valuetext"), "기본은 없다").toBeNull();
});

test("두 변형 모두 접근성 위반이 없다", async () => {
  for (const variant of ["thumb", "track"] as const) {
    const host = document.createElement("div");
    document.body.append(host);
    try {
      await render(<Slider label="투명도" variant={variant} defaultValue={40} />, {
        container: host,
      });
      const results = await axe.run(host, {
        runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag22aa"] },
      });
      expect(
        results.violations.map((violation) => violation.id).sort(),
        `${variant}에서 접근성 위반이 있습니다`,
      ).toEqual([]);
    } finally {
      host.remove();
    }
  }
});

export type _EnsureTsx = JSX.Element;
