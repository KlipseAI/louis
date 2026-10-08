// figma/components.measured.json 의 **select** 값을 코드가 여전히 만드는지 검증한다.
//
// 이 파일이 없으면 select 칸은 한 번 적어 두고 잊히는 숫자가 된다. parity 게이트는 Figma 가
// measured 와 같은지만 보므로, CSS 가 조용히 바뀌면 **Figma 와 measured 는 서로 맞고 둘 다
// 코드와 틀린** 상태로 통과한다. verify-figma-done 의 조건 (c) 뒷절이 이 파일을 요구한다.
//
// **React 컴포넌트가 아니라 클래스 마크업을 렌더한다.** select 는 packages/react/src 에 표면이
// 없고 정본이 packages/css/src/component/select.css 다(계약의 figmaAhead 가 그 사실을 적는다).
// 그래서 여기서 렌더하는 마크업은 design/components/select.md 의 Anatomy 그대로여야 한다 —
// 소비처가 지켜야 하는 것과 다른 마크업을 재면 이 파일이 제품에 없는 값을 지키게 된다.
import type { JSX } from "react";
import { expect, test } from "vitest";
import { userEvent } from "vitest/browser";
import { render } from "vitest-browser-react";
import measured from "../../../figma/components.measured.json" with { type: "json" };
import "@klipse-design/css/layers.css";
import "@klipse-design/css/tokens.css";
import "@klipse-design/css/styles.css";

type Size = "md" | "sm";

const SIZES: readonly Size[] = ["md", "sm"];

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
 * 트리거 하나를 고정 폭 상자 안에 렌더한다.
 *
 * **폭을 호출부가 준다.** 트리거의 폭은 계약에 없다 — 제품에서 Gnb 는 88, 인스펙터는 140 이고
 * ComposerBar 는 남는 폭을 먹는다. 여기서 고정하는 이유는 값이 말줄임되는지가 아니라 높이·
 * 여백·간격을 재기 위해서이며, 그 값들은 폭과 무관하다.
 *
 * **`data-size` 를 md 에서 주지 않는다.** 속성이 없을 때가 md 라는 것이 계약이므로(계약의
 * Size 사유), 속성을 주면 「없는 기본값을 통과시킨다」를 재게 된다.
 */
function Specimen({
  size,
  open = false,
  disabled = false,
  placeholder = false,
}: {
  size: Size;
  open?: boolean;
  disabled?: boolean;
  placeholder?: boolean;
}): JSX.Element {
  return (
    <div style={{ inlineSize: "160px" }}>
      <button
        type="button"
        className="louis-select-trigger"
        data-size={size === "sm" ? "sm" : undefined}
        data-testid="trigger"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label="언어"
        disabled={disabled}
      >
        <span className="louis-select-trigger__icon" data-testid="glyph" aria-hidden="true" />
        <span
          className="louis-select-trigger__value"
          data-testid="value"
          data-placeholder={placeholder ? "" : undefined}
        >
          {placeholder ? "주제 선택" : "한국어"}
        </span>
        <span className="louis-select-trigger__caret" data-testid="caret" aria-hidden="true" />
      </button>
    </div>
  );
}

function find(testId: string): HTMLElement {
  const node = document.querySelector(`[data-testid="${testId}"]`);
  if (node === null) throw new Error(`찾지 못했습니다: ${testId}`);
  return node as HTMLElement;
}

for (const size of SIZES) {
  const spec = measured.components.select.sizes[size];

  test(`SelectTrigger ${size}의 구조값이 components.measured.json과 같다`, async () => {
    await render(<Specimen size={size} />);
    const trigger = find("trigger");
    const style = getComputedStyle(trigger);

    expect(trigger.offsetHeight, "height").toBe(spec.height);
    expect(px(style.paddingTop), "paddingBlock").toBe(spec.paddingBlock);
    expect(px(style.paddingBottom), "paddingBlockEnd").toBe(spec.paddingBlock);
    expect(px(style.paddingLeft), "paddingInline").toBe(spec.paddingInline);
    // **끝 쪽 여백을 따로 본다.** sm 에서 시작 8 · 끝 6 으로 갈리므로, 한 칸으로 접으면
    // 그 비대칭이 어느 쪽으로 무너져도 초록이다.
    expect(px(style.paddingRight), "paddingInlineEnd").toBe(spec.paddingInlineEnd);
    expect(px(style.columnGap), "gap").toBe(spec.gap);
    expect(px(style.borderTopWidth), "borderWidth").toBe(spec.borderWidth);
    expect(px(style.borderTopLeftRadius), "radius").toBe(spec.radius);
    expect(px(style.fontSize), "fontSize").toBe(spec.fontSize);
    expect(px(style.lineHeight), "lineHeight").toBe(spec.lineHeight);

    const glyph = find("glyph");
    expect(round(rect(glyph).width), "iconSize").toBe(spec.iconSize);
    expect(round(rect(glyph).height), "iconSize (높이)").toBe(spec.iconSize);

    const caret = find("caret");
    // **캐럿은 크기 축을 따라 줄지 않는다.** 두 칸이 같은 값을 갖는 것이 계약이므로 두 번 잰다.
    expect(round(rect(caret).width), "caretSize").toBe(spec.caretSize);
    expect(round(rect(caret).height), "caretSize (높이)").toBe(spec.caretSize);
  });
}

test("SelectTrigger 의 값이 남는 폭을 먹고 캐럿은 끝에 남는다", async () => {
  // 값이 오므라들면 캐럿이 값 옆에 붙어 상자 가운데에 떠 있게 된다 — 폭이 고정된 자리에서
  // 실제로 일어나는 사고이고, 계약이 gap 하나로 배치를 정하는 이유다.
  const spec = measured.components.select.sizes.md;
  await render(<Specimen size="md" />);
  const trigger = find("trigger");
  const caret = find("caret");
  expect(
    round(rect(trigger).right - rect(caret).right),
    "캐럿 오른끝이 끝 쪽 여백만큼 안쪽에 선다",
  ).toBe(spec.paddingInlineEnd);
  expect(rect(find("value")).width > 0, "값이 폭을 갖는다").toBe(true);
});

test("SelectTrigger 가 열리면 캐럿이 180° 돈다", async () => {
  await render(<Specimen size="md" open />);
  // matrix(-1, 0, 0, -1, 0, 0) 이 180° 다. 문자열이 아니라 행렬로 보는 이유는 브라우저가
  // rotate() 를 matrix 로 계산해 돌려주기 때문이다.
  expect(getComputedStyle(find("caret")).transform, "열린 캐럿").toBe("matrix(-1, 0, 0, -1, 0, 0)");
});

/* ── states 표 ────────────────────────────────────────────────────────────────
 *
 * surface-states.browser.test.tsx 의 「states 표를 코드가 빠짐없이 읽는다」 래칫이 이 파일을
 * `select` 의 담당으로 셈한다. 네 상태를 여기서 전부 읽는다. */
const paints = measured.components.select.states.base;

test("SelectTrigger Default 가 계약이 지목한 토큰을 문다", async () => {
  await render(<Specimen size="md" />);
  const style = getComputedStyle(find("trigger"));
  expect(style.backgroundColor, "background").toBe(
    tokenValue(paints.Default.background, "background-color"),
  );
  expect(style.color, "foreground").toBe(tokenValue(paints.Default.foreground, "color"));
});

test("SelectTrigger Hover 가 계약이 지목한 토큰을 문다", async () => {
  await render(<Specimen size="md" />);
  await userEvent.hover(find("trigger"));
  // **전이가 끝날 때까지 기다린다.** 면에 `transition-property: background-color` 가 걸려 있어서
  // hover 직후의 계산값은 목표색이 아니라 보간 중인 색이다 — 실제로 `oklab(...)` 중간값이
  // 잡혔다. 폴링하지 않으면 이 단언은 「전이가 있다」에 걸려 늘 빨갛다.
  await expect
    .poll(() => getComputedStyle(find("trigger")).backgroundColor, { timeout: 2000 })
    .toBe(tokenValue(paints.Hover.background, "background-color"));
  expect(getComputedStyle(find("trigger")).color, "foreground").toBe(
    tokenValue(paints.Hover.foreground, "color"),
  );
  await userEvent.unhover(find("trigger"));
});

test("SelectTrigger Open 이 hover 와 같은 면을 유지한다", async () => {
  // 포인터가 패널로 넘어가면 트리거는 hover 를 잃는다. 그때 면이 돌아가면 「무엇이 열려
  // 있는지」가 화면에서 사라지므로, 이 시험은 **hover 없이** 연다.
  await render(<Specimen size="md" open />);
  const style = getComputedStyle(find("trigger"));
  expect(style.backgroundColor, "background").toBe(
    tokenValue(paints.Open.background, "background-color"),
  );
  expect(style.color, "foreground").toBe(tokenValue(paints.Open.foreground, "color"));
});

test("SelectTrigger Disabled 는 면을 두고 잉크만 내린다", async () => {
  await render(<Specimen size="md" disabled />);
  const style = getComputedStyle(find("trigger"));
  expect(style.backgroundColor, "background").toBe(
    tokenValue(paints.Disabled.background, "background-color"),
  );
  expect(style.color, "foreground").toBe(tokenValue(paints.Disabled.foreground, "color"));
  expect(style.cursor, "cursor").toBe("not-allowed");
});

/* ── 값이 없는 상태(placeholder) ──────────────────────────────────────────────
 *
 * measured `states.placeholder` 네 칸을 읽는다. Figma `Placeholder=true` 여덟 변형과 같은 표다.
 * **잉크는 트리거가 아니라 값 요소에서 잰다** — placeholder 규칙이 값 요소에 직접 색을 주므로
 * 트리거의 계산색은 이 상태를 말하지 않는다. Disabled 칸이 이 묶음의 요점이다: 가드가 없던 판은
 * 꺼진 빈 Select 의 값을 fg-tertiary 로 그렸다. */
const placeholderPaints = measured.components.select.states.placeholder;

test("SelectTrigger placeholder 가 쉼에서 값 잉크를 fg-tertiary 로 내리고 면은 그대로 둔다", async () => {
  await render(<Specimen size="md" placeholder />);
  expect(getComputedStyle(find("trigger")).backgroundColor, "Default background").toBe(
    tokenValue(placeholderPaints.Default.background, "background-color"),
  );
  expect(getComputedStyle(find("value")).color, "Default value ink").toBe(
    tokenValue(placeholderPaints.Default.foreground, "color"),
  );
});

test("SelectTrigger placeholder 가 hover 에서 면만 바꾸고 잉크는 그대로 둔다", async () => {
  await render(<Specimen size="md" placeholder />);
  await userEvent.hover(find("trigger"));
  await expect
    .poll(() => getComputedStyle(find("trigger")).backgroundColor, { timeout: 2000 })
    .toBe(tokenValue(placeholderPaints.Hover.background, "background-color"));
  expect(getComputedStyle(find("value")).color, "Hover value ink").toBe(
    tokenValue(placeholderPaints.Hover.foreground, "color"),
  );
  await userEvent.unhover(find("trigger"));
});

test("SelectTrigger placeholder 가 열려도 잉크는 fg-tertiary 다", async () => {
  await render(<Specimen size="md" placeholder open />);
  expect(getComputedStyle(find("trigger")).backgroundColor, "Open background").toBe(
    tokenValue(placeholderPaints.Open.background, "background-color"),
  );
  expect(getComputedStyle(find("value")).color, "Open value ink").toBe(
    tokenValue(placeholderPaints.Open.foreground, "color"),
  );
});

test("SelectTrigger placeholder 가 꺼지면 fg-disabled 가 이긴다", async () => {
  await render(<Specimen size="md" placeholder disabled />);
  expect(getComputedStyle(find("trigger")).backgroundColor, "Disabled background").toBe(
    tokenValue(placeholderPaints.Disabled.background, "background-color"),
  );
  expect(getComputedStyle(find("value")).color, "Disabled value ink").toBe(
    tokenValue(placeholderPaints.Disabled.foreground, "color"),
  );
});
