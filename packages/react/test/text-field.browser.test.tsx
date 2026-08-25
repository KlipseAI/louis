// design/components/text-field.md의 Acceptance tests를 실제 브라우저에서 검증한다.
//
// 이 컴포넌트는 제품에 정본이 없어(정의 약 40벌, 다섯 계열, 합의 없음) 값을 DS가 정했다.
// 그래서 **정본이 있는 컴포넌트보다 테스트가 더 중요하다** — 대조할 바깥 기준이 없다.
import type { JSX } from "react";
import { expect, test } from "vitest";
import { userEvent } from "vitest/browser";
import { render } from "vitest-browser-react";
import { TextField, type TextFieldSize } from "@klipse-design/react";
import measured from "../../../figma/components.measured.json" with { type: "json" };
import "@klipse-design/css/layers.css";
import "@klipse-design/css/tokens.css";
import "@klipse-design/css/styles.css";

const px = (value: string): number => Number.parseFloat(value);
const round = (value: number): number => Math.round(value * 1000) / 1000;

const declaredBorderWidth = (): number =>
  px(getComputedStyle(document.documentElement).getPropertyValue("--louis-border-width-hairline"));

function find(selector: string): HTMLElement {
  const node = document.querySelector(selector);
  if (node === null) throw new Error(`찾지 못했습니다: ${selector}`);
  return node as HTMLElement;
}

function tokenValue(id: string, property: "background-color" | "color"): string {
  const probe = document.createElement("div");
  probe.style.setProperty(property, `var(--louis-${id})`);
  document.body.append(probe);
  const value =
    property === "color" ? getComputedStyle(probe).color : getComputedStyle(probe).backgroundColor;
  probe.remove();
  return value;
}

const SIZES: readonly TextFieldSize[] = ["md", "sm"];

for (const size of SIZES) {
  const spec = measured.components.input.sizes[size];

  test(`TextField ${size}의 구조값이 components.measured.json과 같다`, async () => {
    await render(
      <div style={{ inlineSize: "320px" }}>
        <TextField label="이름" size={size} description="공백 없이 입력합니다" />
      </div>,
    );

    const box = find(".louis-text-field__box");
    const boxStyle = getComputedStyle(box);
    expect(box.offsetHeight, "height").toBe(spec.height);
    expect(px(boxStyle.paddingInlineStart), "paddingInline").toBe(spec.paddingInline);
    expect(px(boxStyle.columnGap), "gap").toBe(spec.gap);
    expect(px(boxStyle.borderTopLeftRadius), "radius").toBe(spec.radius);
    // 헤어라인 두께 토큰은 여전히 0.5다 (measured와 parity).
    expect(declaredBorderWidth(), "borderWidth").toBe(spec.borderWidth);
    // **실제로 border가 아니라 inset 헤어라인으로 그려진다 (DS-D-0023).** border는 제거됐고
    // 경계는 generic 헤어라인 색의 inset box-shadow다.
    expect(boxStyle.borderTopWidth, "border 제거").toBe("0px");
    expect(boxStyle.boxShadow, "inset 헤어라인").toContain("inset");
    expect(boxStyle.boxShadow, "헤어라인 색").toContain(
      tokenValue("color-stroke-hairline", "color"),
    );

    const control = find(".louis-text-field__control");
    const controlStyle = getComputedStyle(control);
    expect(px(controlStyle.fontSize), "fontSize").toBe(spec.fontSize);
    expect(round(px(controlStyle.lineHeight)), "lineHeight").toBe(spec.lineHeight);

    expect(px(getComputedStyle(find(".louis-text-field__label")).fontSize), "labelFontSize").toBe(
      spec.labelFontSize,
    );
    expect(px(getComputedStyle(find(".louis-text-field__message")).fontSize), "messageFontSize").toBe(
      spec.messageFontSize,
    );
    expect(px(getComputedStyle(find(".louis-text-field")).rowGap), "stackGap").toBe(spec.stackGap);
  });
}

test("states 표가 코드와 같다 — 모든 상태가 generic 헤어라인이다", async () => {
  // DS-D-0023: invalid/disabled의 stroke 색 축을 없앴다. 세 상태가 같은 generic 헤어라인 inset을
  // 쓰고, 상태는 면(background) · foreground · 메시지 · aria가 전달한다. invalid의 danger는 아래
  // "오류를 색만으로 알리지 않는다" 테스트가 메시지 + aria-invalid + role=alert로 확인한다.
  const spec = measured.components.input.states.base;
  await render(
    <div>
      <TextField label="기본" data-testid="default" />
      <TextField label="오류" invalid description="이미 쓰는 이름입니다" data-testid="invalid" />
      <TextField label="잠김" disabled data-testid="disabled" />
    </div>,
  );
  const boxes = [...document.querySelectorAll(".louis-text-field__box")] as HTMLElement[];
  const controls = [...document.querySelectorAll(".louis-text-field__control")] as HTMLElement[];
  const [defaultBox, invalidBox, disabledBox] = boxes;
  const [defaultControl, , disabledControl] = controls;
  if (defaultBox === undefined || invalidBox === undefined || disabledBox === undefined) {
    throw new Error("세 필드를 찾지 못했습니다");
  }
  if (defaultControl === undefined || disabledControl === undefined) {
    throw new Error("control을 찾지 못했습니다");
  }

  // 세 상태 모두 border 없이 같은 generic 헤어라인 inset을 쓴다.
  const hairline = tokenValue("color-stroke-hairline", "color");
  for (const box of [defaultBox, invalidBox, disabledBox]) {
    const style = getComputedStyle(box);
    expect(style.borderTopWidth, "border 제거").toBe("0px");
    expect(style.boxShadow, "inset 헤어라인").toContain("inset");
    expect(style.boxShadow, "헤어라인 색").toContain(hairline);
  }

  // 면과 전경은 상태를 유지한다.
  expect(getComputedStyle(defaultBox).backgroundColor, "Default background").toBe(
    tokenValue(spec.Default.background, "background-color"),
  );
  expect(getComputedStyle(defaultControl).color, "Default foreground").toBe(
    tokenValue(spec.Default.foreground, "color"),
  );
  expect(getComputedStyle(disabledControl).color, "Disabled foreground").toBe(
    tokenValue(spec.Disabled.foreground, "color"),
  );
});

test("포커스 링을 박스가 받는다 — 슬롯까지 함께 둘린다", async () => {
  // `<input>`에 걸면 링이 글자 주위에만 뜨고 접미 버튼이 링 밖에 남는다.
  await render(
    <TextField
      label="검색"
      suffix={
        <button type="button" data-testid="clear">
          ×
        </button>
      }
    />,
  );
  const control = find(".louis-text-field__control");
  const box = find(".louis-text-field__box");

  await userEvent.click(control);
  expect(document.activeElement, "입력에 포커스가 간다").toBe(control);

  const boxStyle = getComputedStyle(box);
  expect(boxStyle.outlineStyle, "박스에 링이 뜬다").toBe("solid");
  expect(px(boxStyle.outlineWidth), "링 두께").toBe(
    px(getComputedStyle(document.documentElement).getPropertyValue("--louis-border-width-ring")),
  );
  expect(boxStyle.outlineColor, "링 색").toBe(tokenValue("color-stroke-focus", "color"));

  // 입력 자신은 링을 그리지 않는다 — 두 겹이 되면 안 된다.
  expect(getComputedStyle(control).outlineStyle, "입력은 링을 그리지 않는다").toBe("none");

  // 접미 버튼이 박스 안에 있어야 링이 그것까지 둘러싼다.
  const clear = find('[data-testid="clear"]');
  expect(box.contains(clear), "슬롯이 박스 안에 있다").toBe(true);
});

test("placeholder가 값과 구분되면서 대비를 지킨다", async () => {
  // 제품의 알파 placeholder는 light에서 4.5:1에 미달한다. tertiary도 3.96:1로 미달해 secondary를
  // 쓰고, 값과의 구분은 색 단계가 아니라 primary/secondary 위계가 맡는다.
  await render(<TextField label="이름" placeholder="예: 여름 여행" />);
  const control = find(".louis-text-field__control");
  const placeholder = getComputedStyle(control, "::placeholder");

  expect(placeholder.color, "placeholder 색").toBe(
    tokenValue("color-fg-secondary", "color"),
  );
  expect(getComputedStyle(control).color, "값 색").toBe(
    tokenValue("color-fg-primary", "color"),
  );
  expect(placeholder.color, "값과 달라야 한다").not.toBe(getComputedStyle(control).color);
  // Firefox가 기본으로 낮춘다. 대비를 계산해 놓고 브라우저가 흐리게 만들면 의미가 없다.
  expect(placeholder.opacity, "opacity가 대비를 깎지 않는다").toBe("1");
});

test("라벨이 입력에 연결되고 id는 인스턴스마다 다르다", async () => {
  await render(
    <div>
      <TextField label="첫째" />
      <TextField label="둘째" />
    </div>,
  );
  const labels = [...document.querySelectorAll("label.louis-text-field__label")] as HTMLLabelElement[];
  const controls = [...document.querySelectorAll(".louis-text-field__control")] as HTMLInputElement[];
  expect(labels.length, "라벨 둘").toBe(2);

  for (const [index, label] of labels.entries()) {
    const control = controls[index];
    if (control === undefined) throw new Error("control이 없습니다");
    expect(label.htmlFor, "for가 입력을 가리킨다").toBe(control.id);
    // 라벨을 눌러 입력에 포커스가 가는지 — 연결이 실제로 동작하는지 본다.
    await userEvent.click(label);
    expect(document.activeElement, "라벨 클릭이 입력에 닿는다").toBe(control);
  }
  // **id가 겹치지 않는다.** 호출부가 만들면 같은 화면에 필드가 여럿일 때 겹친다.
  expect(controls[0]?.id).not.toBe(controls[1]?.id);
});

test("오류를 색만으로 알리지 않는다", async () => {
  // 색 하나로만 알리면 색각 이상에서 오류가 전달되지 않는다.
  await render(<TextField label="이름" invalid description="이미 쓰는 이름입니다" />);
  const control = find(".louis-text-field__control");
  const message = find(".louis-text-field__message");

  expect(control.getAttribute("aria-invalid"), "aria-invalid").toBe("true");
  expect(control.getAttribute("aria-describedby"), "메시지와 연결된다").toBe(message.id);
  expect(message.textContent, "문구가 실제로 있다").toBe("이미 쓰는 이름입니다");
  expect(message.getAttribute("role"), "오류는 뜨는 즉시 읽힌다").toBe("alert");
});

test("도움말은 alert가 아니다", async () => {
  // 오류가 아닌 도움말까지 alert로 읽으면 화면을 여는 것만으로 스크린 리더가 시끄러워진다.
  await render(<TextField label="이름" description="공백 없이 입력합니다" />);
  const message = find(".louis-text-field__message");
  expect(message.getAttribute("role"), "도움말은 alert가 아니다").toBeNull();
  expect(find(".louis-text-field__control").getAttribute("aria-invalid")).toBeNull();
});

export type _EnsureTsx = JSX.Element;
