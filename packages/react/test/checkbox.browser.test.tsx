// design/components/checkbox.md의 Acceptance tests를 실제 브라우저에서 검증한다.
//
// 제품에 정본이 있는데 **21벌 중 2벌만 쓴다.** 그 클래스가 cascade layer 밖이라 소비처가 이길 수
// 없기 때문이다. 크기는 채택했고 그리는 방식은 바꿨으므로, 이 파일에서 중요한 것은 직접 그린
// 표시가 `:checked`·`:indeterminate` 두 상태에서 실제로 보이는가다.
import type { JSX } from "react";
import { useState } from "react";
import axe from "axe-core";
import { expect, test } from "vitest";
import { userEvent } from "vitest/browser";
import { render } from "vitest-browser-react";
import { Checkbox } from "@klipse-design/react";
import measured from "../../../figma/components.measured.json" with { type: "json" };
import "@klipse-design/css/layers.css";
import "@klipse-design/css/tokens.css";
import "@klipse-design/css/styles.css";

const px = (value: string): number => Number.parseFloat(value);
const round = (value: number): number => Math.round(value * 1000) / 1000;
const spec = measured.components.checkbox.sizes.base;
const states = measured.components.checkbox.states.base;

function find(selector: string): HTMLElement {
  const node = document.querySelector(selector);
  if (node === null) throw new Error(`찾지 못했습니다: ${selector}`);
  return node as HTMLElement;
}

const control = (): HTMLInputElement =>
  find("input.kds-checkbox__control") as HTMLInputElement;

const tokenPx = (id: string): number =>
  px(getComputedStyle(document.documentElement).getPropertyValue(`--kds-${id}`));

function tokenValue(id: string, property: "background-color" | "color"): string {
  const probe = document.createElement("div");
  probe.style.setProperty(property, `var(--kds-${id})`);
  document.body.append(probe);
  const value =
    property === "color"
      ? getComputedStyle(probe).color
      : getComputedStyle(probe).backgroundColor;
  probe.remove();
  return value;
}

const markOf = (input: HTMLElement): CSSStyleDeclaration =>
  getComputedStyle(input, "::before");

test("구조값이 components.measured.json과 같다", async () => {
  await render(<Checkbox label="전체 선택" />);
  const input = control();
  const style = getComputedStyle(input);

  expect(input.offsetWidth, "boxSize").toBe(spec.boxSize);
  expect(input.offsetHeight, "boxSize").toBe(spec.boxSize);
  expect(px(style.borderTopLeftRadius), "radius").toBe(spec.radius);
  expect(tokenPx("border-width-hairline"), "borderWidth").toBe(spec.borderWidth);
  expect(px(getComputedStyle(find(".kds-checkbox")).columnGap), "gap").toBe(spec.gap);

  const labelStyle = getComputedStyle(find(".kds-checkbox__label"));
  expect(px(labelStyle.fontSize), "fontSize").toBe(spec.fontSize);
  expect(round(px(labelStyle.lineHeight)), "lineHeight").toBe(spec.lineHeight);
});

test("체크 표시의 기하가 components.measured.json과 같다", async () => {
  // **`appearance: none`인 checkbox의 ::before는 계산값이 읽힌다.** Slider의 섀도우
  // pseudo-element와 달리 여기는 진짜 pseudo-element라 게이트가 실제 그림을 본다.
  await render(<Checkbox label="선택" defaultChecked />);
  const mark = markOf(control());
  expect(px(mark.width), "checkInline").toBe(spec.checkInline);
  expect(px(mark.height), "checkBlock").toBe(spec.checkBlock);
  expect(px(mark.borderRightWidth), "checkStroke").toBe(spec.checkStroke);
  expect(px(mark.borderBottomWidth), "checkStroke").toBe(spec.checkStroke);
  expect(px(mark.borderTopWidth), "위 변은 비어 있다").toBe(0);
  expect(px(mark.borderLeftWidth), "왼 변은 비어 있다").toBe(0);
  expect(mark.opacity, "보인다").toBe("1");
});

test("indeterminate 표시가 가로 막대이고 체크와 다르다", async () => {
  await render(<Checkbox label="일부 선택" indeterminate />);
  const mark = markOf(control());
  expect(px(mark.width), "indeterminateInline").toBe(spec.indeterminateInline);
  expect(px(mark.height), "indeterminateBlock").toBe(spec.indeterminateBlock);
  expect(mark.opacity, "보인다").toBe("1");
  // 체크와 같은 모양이면 "일부"와 "전부"가 화면에서 구분되지 않는다.
  expect(px(mark.width), "체크와 폭이 다르다").not.toBe(spec.checkInline);
});

test("indeterminate가 checked를 이긴다", async () => {
  // 네이티브에서 둘은 동시에 참일 수 있다. 그때 화면은 "일부"를 보여야 한다 —
  // 부분 선택은 선택이 아니다.
  await render(<Checkbox label="둘 다" defaultChecked indeterminate />);
  const input = control();
  expect(input.checked, "checked도 참").toBe(true);
  expect(input.indeterminate, "indeterminate도 참").toBe(true);

  const mark = markOf(input);
  expect(px(mark.width), "막대가 이긴다").toBe(spec.indeterminateInline);
  expect(px(mark.borderRightWidth), "체크의 테두리가 남지 않는다").toBe(0);
});

test("선택하지 않았을 때는 표시가 없다", async () => {
  await render(<Checkbox label="선택 안 함" />);
  expect(markOf(control()).opacity, "표시가 숨는다").toBe("0");
});

test("states 표가 코드와 같다", async () => {
  await render(<Checkbox label="상태" />);
  const input = control();
  const read = (): CSSStyleDeclaration => getComputedStyle(input);

  expect(read().backgroundColor, "Default background").toBe(
    tokenValue(states.Default.background, "background-color"),
  );
  expect(read().borderTopColor, "Default border").toBe(
    tokenValue(states.Default.border, "color"),
  );
  expect(getComputedStyle(find(".kds-checkbox__label")).color, "Default foreground").toBe(
    tokenValue(states.Default.foreground, "color"),
  );

  await userEvent.click(input);
  expect(read().backgroundColor, "Checked background").toBe(
    tokenValue(states.Checked.background, "background-color"),
  );
  expect(read().borderTopColor, "Checked border").toBe(
    tokenValue(states.Checked.border, "color"),
  );
});

test("disabled의 면·테두리·라벨이 states 표와 같다", async () => {
  await render(<Checkbox label="비활성" disabled />);
  const input = control();
  expect(getComputedStyle(input).backgroundColor, "Disabled background").toBe(
    tokenValue(states.Disabled.background, "background-color"),
  );
  expect(getComputedStyle(input).borderTopColor, "Disabled border").toBe(
    tokenValue(states.Disabled.border, "color"),
  );
  expect(getComputedStyle(find(".kds-checkbox__label")).color, "Disabled foreground").toBe(
    tokenValue(states.Disabled.foreground, "color"),
  );
});

test("라벨을 눌러도 값이 바뀐다", async () => {
  // 상자가 20px이라 라벨이 hit target의 대부분을 담당한다. label이 감싸므로 연결은 id가 아니라
  // 포함 관계가 만든다 — 같은 화면에 여럿이 있어도 겹치지 않는다.
  const seen: boolean[] = [];
  await render(<Checkbox label="약관에 동의합니다" onCheckedChange={(v) => seen.push(v)} />);
  await userEvent.click(find(".kds-checkbox__label"));
  expect(control().checked, "라벨 클릭이 값을 바꾼다").toBe(true);
  expect(seen, "콜백이 값을 받는다").toEqual([true]);
});

test("Space가 값을 바꾼다", async () => {
  await render(<Checkbox label="키보드" />);
  const input = control();
  input.focus();
  await userEvent.keyboard(" ");
  expect(input.checked, "Space로 켠다").toBe(true);
  await userEvent.keyboard(" ");
  expect(input.checked, "Space로 끈다").toBe(false);
});

test("controlled일 때 호출부가 값을 소유한다", async () => {
  function Fixture(): JSX.Element {
    const [checked, setChecked] = useState(false);
    return (
      <>
        <Checkbox label="제어" checked={checked} onCheckedChange={setChecked} />
        <button type="button" onClick={() => setChecked(true)}>
          켜기
        </button>
      </>
    );
  }
  await render(<Fixture />);
  expect(control().checked, "초기").toBe(false);
  await userEvent.click(find("button"));
  expect(control().checked, "바깥에서 켠다").toBe(true);
});

test("indeterminate가 aria로도 전달된다", async () => {
  await render(<Checkbox label="일부" indeterminate />);
  // DOM 프로퍼티만으로는 보조기술이 "일부"를 읽지 못하는 경우가 있다. mixed를 함께 준다.
  expect(control().getAttribute("aria-checked"), "mixed").toBe("mixed");
});

test("disabled면 클릭과 키보드로 값이 바뀌지 않는다", async () => {
  const seen: boolean[] = [];
  await render(<Checkbox label="비활성" disabled onCheckedChange={(v) => seen.push(v)} />);
  const input = control();
  await userEvent.click(find(".kds-checkbox__label"), { force: true });
  input.focus();
  await userEvent.keyboard(" ");
  expect(input.checked, "값 그대로").toBe(false);
  expect(seen, "콜백 없음").toEqual([]);
});

test("포커스 링이 키보드에서만 나타난다", async () => {
  await render(
    <>
      <button type="button">앞</button>
      <Checkbox label="포커스" />
    </>,
  );
  const input = control();

  await userEvent.click(input);
  expect(input.matches(":focus-visible"), "포인터 클릭에는 링이 없다").toBe(false);
  expect(getComputedStyle(input).outlineStyle, "링 없음").toBe("none");

  find("button").focus();
  await userEvent.tab();
  expect(document.activeElement, "Tab이 들어온다").toBe(input);
  expect(input.matches(":focus-visible"), "키보드 포커스").toBe(true);
  const style = getComputedStyle(input);
  expect(style.outlineStyle, "링 있음").toBe("solid");
  expect(px(style.outlineWidth), "두께가 border-width-ring").toBe(tokenPx("border-width-ring"));
});

test("접근성 위반이 없다", async () => {
  const host = document.createElement("div");
  document.body.append(host);
  try {
    await render(
      <>
        <Checkbox label="하나" />
        <Checkbox label="둘" defaultChecked />
        <Checkbox label="셋" indeterminate />
        <Checkbox aria-label="라벨 없음" />
      </>,
      { container: host },
    );
    const results = await axe.run(host, {
      runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag22aa"] },
    });
    expect(results.violations.map((v) => v.id).sort(), "접근성 위반").toEqual([]);
  } finally {
    host.remove();
  }
});

export type _EnsureTsx = JSX.Element;
