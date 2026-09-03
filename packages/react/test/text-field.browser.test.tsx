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

// 세 칸 전부 돈다. 한 칸만 재면 사다리가 아니라 그 칸 하나의 값이 맞는지만 보게 된다.
const SIZES: readonly TextFieldSize[] = ["lg", "md", "sm"];

for (const size of SIZES) {
  // measured 의 키는 `{Size}/{LabelBehavior}` 복합이다 (DS-D-0049).
  const spec = measured.components.input.sizes[`${size}/stacked`];

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

test("사다리가 이름 순서대로 내려간다 — lg > md > sm", async () => {
  // DS-D-0027이 만든 문제가 정확히 이것이었다. 같은 32를 md·sm 두 이름이 가리켰고, 이름이
  // 실물보다 많아 고르는 쪽이 손해를 봤다. DS-D-0032가 sm(24)을 더하면서 세 이름이 세 높이를
  // 갖는데, 그 대응이 깨지는 것은 값 하나만 어긋나도 되는 일이라 매 실행 확인한다.
  await render(
    <div style={{ inlineSize: "320px" }}>
      <TextField label="큰" size="lg" />
      <TextField label="보통" size="md" />
      <TextField label="작은" size="sm" />
    </div>,
  );
  const [lg, md, sm] = [...document.querySelectorAll(".louis-text-field__box")] as HTMLElement[];
  if (lg === undefined || md === undefined || sm === undefined) {
    throw new Error("세 칸을 찾지 못했습니다");
  }
  expect(lg.offsetHeight, "lg").toBe(40);
  expect(md.offsetHeight, "md").toBe(32);
  expect(sm.offsetHeight, "sm").toBe(24);
  expect(lg.offsetHeight, "lg > md").toBeGreaterThan(md.offsetHeight);
  expect(md.offsetHeight, "md > sm").toBeGreaterThan(sm.offsetHeight);
});

test("sm이 알약이 되지 않는다 — 반경이 높이의 절반보다 작다", async () => {
  // radius-control 12를 그대로 물려받으면 24 높이에서 12 = 높이/2라 필드가 알약이 된다.
  // size는 크기만 바꾸는 축인데 모양까지 바뀌므로 sm만 radius-control-sm으로 내려간다.
  // 이 어긋남은 계산값을 봐야 보인다 — 토큰 이름만 읽으면 둘 다 "control 반경"이다.
  await render(
    <div style={{ inlineSize: "320px" }}>
      <TextField label="작은" size="sm" />
    </div>,
  );
  const box = find(".louis-text-field__box");
  const radius = px(getComputedStyle(box).borderTopLeftRadius);
  expect(radius, "measured 계약과 같다").toBe(measured.components.input.sizes["sm/stacked"].radius);
  expect(radius * 2, "높이보다 작다 — 알약이 아니다").toBeLessThan(box.offsetHeight);
});

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

// ── 플로팅 라벨 (DS-D-0049) ──────────────────────────────────────────────────
//
// 이 축은 **계산 스타일로만 보인다.** `data-label-behavior` 속성만 확인하면 「속성은 붙었는데
// 라벨은 그대로인」 경우를 통과시킨다. Dialog 의 Tone 축이 같은 이유로 참조 비교를 세웠다.

test("floating 의 높이는 여백과 값이 만든다 — 12 + 8 + 21 + 12", async () => {
  // 선언된 높이가 없다. 네 항이 전부 토큰이고, 그 합이 실제로 53 이 되는지는 브라우저만 안다.
  // 제품의 같은 구성이 58 인 것은 값 타이포가 body-16(행 24)이기 때문이며 이 축의 어긋남이 아니다.
  await render(
    <div style={{ inlineSize: "320px" }}>
      <TextField label="이메일" labelBehavior="floating" />
    </div>,
  );
  const box = find(".louis-text-field__box");
  const style = getComputedStyle(box);
  const spec = measured.components.input.sizes["lg/floating"];
  expect(px(style.paddingBlockStart), "위 여백 = space-control-md").toBe(spec.paddingBlock);
  expect(px(style.paddingBlockEnd), "아래 여백 = space-control-md").toBe(spec.paddingBlock);
  const control = getComputedStyle(find(".louis-text-field__control"));
  expect(px(control.marginBlockStart), "라벨 행 = space-control-sm").toBe(spec.labelRow);
  expect(round(px(control.lineHeight)), "값 행 = body-sm 21").toBe(spec.lineHeight);
  // 합이 measured 의 height 다. 네 항 중 하나만 어긋나도 여기서 갈린다.
  expect(spec.paddingBlock * 2 + spec.labelRow + spec.lineHeight, "네 항의 합").toBe(spec.height);
  expect(box.offsetHeight, "12 + 8 + 21 + 12").toBe(spec.height);
  expect(px(style.paddingInlineStart), "좌우 여백").toBe(spec.paddingInline);
  expect(px(style.borderTopLeftRadius), "반경").toBe(spec.radius);
});

test("floating 이 stacked 의 나머지 값을 하나도 다시 쓰지 않는다", async () => {
  // 이 축이 여는 것은 라벨의 자리 하나다. 반경·좌우 여백·슬롯 간격·헤어라인이 함께 움직이면
  // 그것은 축이 아니라 두 번째 컴포넌트다 — DS-D-0049 가 축으로 판정한 근거가 바로 이것이다.
  await render(
    <div style={{ inlineSize: "320px" }}>
      <TextField label="쌓임" />
      <TextField label="떠오름" labelBehavior="floating" />
    </div>,
  );
  const [stacked, floating] = [...document.querySelectorAll(".louis-text-field__box")] as HTMLElement[];
  if (stacked === undefined || floating === undefined) throw new Error("두 박스를 찾지 못했습니다");
  const a = getComputedStyle(stacked);
  const b = getComputedStyle(floating);
  expect(b.borderTopLeftRadius, "반경").toBe(a.borderTopLeftRadius);
  expect(b.paddingInlineStart, "좌우 여백").toBe(a.paddingInlineStart);
  expect(b.columnGap, "슬롯 간격").toBe(a.columnGap);
  expect(b.boxShadow, "헤어라인").toBe(a.boxShadow);
  expect(b.backgroundColor, "면").toBe(a.backgroundColor);
});

test("라벨이 값과 포커스에 따라 떠오르고, 색은 포커스만 따른다", async () => {
  // 제품 일곱 벌이 두 조건을 갈라 둔다 — `focused || value` 가 자리를, `focused` 가 색을 정한다.
  // 한 조건으로 합치면 값이 든 채 포커스를 잃은 필드의 라벨이 계속 밝게 남는다.
  //
  // **전이가 끝난 뒤에 잰다.** 클릭 직후의 계산값은 220ms 짜리 전이의 중간값이라 13.99 같은
  // 수가 나온다 — 실제로 이 테스트의 첫 판이 그 값에 걸렸다. 도착점을 재려면 기다려야 한다.
  await render(
    <div style={{ inlineSize: "320px" }}>
      <TextField label="이메일" labelBehavior="floating" />
    </div>,
  );
  const label = find(".louis-text-field__label");
  const control = find(".louis-text-field__control") as HTMLInputElement;
  const box = find(".louis-text-field__box");
  const secondary = tokenValue("color-fg-secondary", "color");
  const primary = tokenValue("color-fg-primary", "color");

  const top = (): number => label.getBoundingClientRect().top - box.getBoundingClientRect().top;
  const fontSize = (): number => px(getComputedStyle(label).fontSize);

  // 쉼 — 세로 중앙, body-sm 14, secondary.
  const restingTop = top();
  const floatSpec = measured.components.input.sizes["lg/floating"];
  expect(fontSize(), "쉴 때 14").toBe(floatSpec.labelFontSize);
  expect(getComputedStyle(label).color, "쉴 때 secondary").toBe(secondary);

  // 포커스 — 떠오르고 색이 primary 가 된다.
  await userEvent.click(control);
  await expect.poll(fontSize, { timeout: 2000 }).toBe(floatSpec.labelFloatedFontSize);
  expect(top(), "떠오르면 위로 간다").toBeLessThan(restingTop);
  expect(round(top()), "떠오른 자리 = space-control-sm 8").toBe(8);
  expect(getComputedStyle(label).color, "포커스면 primary").toBe(primary);
  // 행간은 caption 토큰 그대로다 — 리터럴 1 로 덮으면 Figma text style 연결이 끊긴다.
  expect(round(px(getComputedStyle(label).lineHeight)), "행 높이 = caption 18").toBe(18);

  // 값이 있고 포커스가 없다 — 자리는 떠 있고 색은 secondary 로 돌아온다.
  await userEvent.type(control, "a@b.co");
  await userEvent.click(document.body);
  await expect.poll(() => getComputedStyle(label).color, { timeout: 2000 }).toBe(secondary);
  expect(fontSize(), "값이 있으면 떠 있다").toBe(floatSpec.labelFloatedFontSize);
  expect(round(top()), "값이 있으면 떠 있다 — 자리").toBe(8);
});

test("떠오른 라벨의 글자가 값의 글자와 닿지 않는다", async () => {
  // 이 관계가 `inset-block-start: 8` 을 고른 유일한 이유다. caption 행간(18px)을 그대로 쓰면서
  // 12 에 놓으면 라벨 글자가 15..27 이 되어 값 글자(23.5..)를 3.5px 파고든다. 8 로 당기면
  // 11..23 이고 값과 0.5px 를 두고 비켜선다 — 제품이 `line-height: 1` + `top: 12` 로 얻는
  // 12..24 와 1px 안이다.
  //
  // **상자끼리 재면 안 된다.** 행 상자는 글자 위아래로 반-행간을 품는다 — 재야 하는 것은 글자 띠다.
  await render(
    <div style={{ inlineSize: "320px" }}>
      <TextField label="이메일" labelBehavior="floating" defaultValue="a@b.co" />
    </div>,
  );
  const band = (node: HTMLElement): { top: number; bottom: number } => {
    const style = getComputedStyle(node);
    const half = (px(style.lineHeight) - px(style.fontSize)) / 2;
    const rect = node.getBoundingClientRect();
    return { top: rect.top + half, bottom: rect.bottom - half };
  };
  const label = band(find(".louis-text-field__label"));
  const value = band(find(".louis-text-field__control"));
  expect(label.bottom, "라벨 글자가 값 글자 위에서 끝난다").toBeLessThanOrEqual(value.top);
});

test("stacked 에서는 라벨이 박스 밖의 형제로 남는다", async () => {
  // floating 이 라벨을 박스 안으로 옮기므로, 기본값이 그대로인지가 회귀의 첫 자리다.
  await render(
    <div style={{ inlineSize: "320px" }}>
      <TextField label="이름" />
    </div>,
  );
  const label = find(".louis-text-field__label");
  expect(label.closest(".louis-text-field__box"), "박스 밖이다").toBeNull();
  expect(getComputedStyle(label).position, "흐름에 남는다").toBe("static");
});

test("floating 이 placeholder 를 스스로 채우고 숨긴다", async () => {
  // `:placeholder-shown` 은 placeholder 속성이 있을 때만 걸린다. 호출부가 주지 않아도 떠오름이
  // 동작해야 하므로 컴포넌트가 공백 하나를 넣고, 그 공백이 화면에 보이면 안 된다.
  await render(
    <div style={{ inlineSize: "320px" }}>
      <TextField label="이메일" labelBehavior="floating" />
      <TextField label="이름" />
    </div>,
  );
  const [floating, stacked] = [...document.querySelectorAll(".louis-text-field__control")] as HTMLInputElement[];
  if (floating === undefined || stacked === undefined) throw new Error("두 control 을 찾지 못했습니다");
  expect(floating.placeholder, "floating 은 채워진다").toBe(" ");
  expect(stacked.getAttribute("placeholder"), "stacked 은 손대지 않는다").toBeNull();
});

test("floating 의 라벨도 htmlFor 로 input 에 이어져 있다", async () => {
  // 라벨이 input **뒤**로 옮겨 갔다. DOM 순서가 바뀌었으므로 접근성 이름이 살아 있는지 확인한다.
  await render(
    <div style={{ inlineSize: "320px" }}>
      <TextField label="이메일" labelBehavior="floating" />
    </div>,
  );
  const control = find(".louis-text-field__control");
  const label = find(".louis-text-field__label") as HTMLLabelElement;
  expect(label.htmlFor, "for 가 control 을 가리킨다").toBe(control.id);
  expect(label.compareDocumentPosition(control) & Node.DOCUMENT_POSITION_PRECEDING, "input 이 앞선다").toBeTruthy();
});
