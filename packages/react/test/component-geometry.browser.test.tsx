// figma/components.measured.json의 값을 코드가 여전히 만드는지 검증한다.
//
// 이 파일이 없으면 measured 파일은 한 번 적어 두고 잊히는 숫자가 된다. parity 게이트는 Figma가
// measured와 같은지만 보므로, 코드가 조용히 바뀌면 **Figma와 measured는 서로 맞고 둘 다 코드와
// 틀린** 상태로 통과한다. 여기가 그 반대편을 잡는다.
import type { JSX, ReactNode } from "react";
import { expect, test } from "vitest";
import { render } from "vitest-browser-react";
import { Button, IconButton } from "@klipse-design/react";
import { IconTrashSimple } from "@klipse-design/react/icons";
import measured from "../../../figma/components.measured.json" with { type: "json" };
import "@klipse-design/css/layers.css";
import "@klipse-design/css/tokens.css";
import "@klipse-design/css/styles.css";

type SizeKey = "md" | "sm";

const px = (value: string): number => Number.parseFloat(value);
const rect = (node: Element): DOMRect => node.getBoundingClientRect();
const round = (value: number): number => Math.round(value * 1000) / 1000;

/**
 * 선언된 헤어라인 두께.
 *
 * **계산값을 쓰지 않는다.** 브라우저는 DPR 1에서 0.5px 테두리의 사용값을 1px로 올리므로
 * getComputedStyle은 언제나 1px을 돌려준다. 레티나에서는 half-pixel로 그려진다.
 */
const declaredBorderWidth = (): number =>
  px(getComputedStyle(document.documentElement).getPropertyValue("--kds-border-width-hairline"));

/**
 * 각 컨트롤을 자기 블록에 담아 렌더한다.
 *
 * 같은 flex 행에 넣으면 기본 `align-items: stretch`가 높이를 가장 큰 형제에 맞춰 늘린다. 실제로
 * 그렇게 재다가 Button 높이를 39 대신 40으로 읽었다 — 측정 도구가 측정 대상을 바꾼 경우다.
 */
function Isolated({ children }: { children: ReactNode }): JSX.Element {
  return <div style={{ display: "block" }}>{children}</div>;
}

const SIZES: readonly SizeKey[] = ["md", "sm"];

for (const size of SIZES) {
  const spec = measured.components.button.sizes[size];

  test(`Button ${size}의 구조값이 components.measured.json과 같다`, async () => {
    await render(
      <div>
        <Isolated>
          <Button size={size}>Label</Button>
        </Isolated>
        <Isolated>
          <Button size={size} loading>
            Label
          </Button>
        </Isolated>
        <Isolated>
          <Button size={size} leftIcon={<IconTrashSimple />}>
            Label
          </Button>
        </Isolated>
      </div>,
    );
    const buttons = [...document.querySelectorAll("button.kds-button")];
    const [plain, loading, withIcon] = buttons;
    if (plain === undefined || loading === undefined || withIcon === undefined) {
      throw new Error("버튼 셋을 찾지 못했습니다");
    }
    const style = getComputedStyle(plain);

    expect(round(rect(plain).height), "height").toBe(spec.height);
    expect(px(style.paddingTop), "paddingBlock").toBe(spec.paddingBlock);
    expect(px(style.paddingLeft), "paddingInline").toBe(spec.paddingInline);
    expect(px(style.columnGap), "gap").toBe(spec.gap);
    expect(declaredBorderWidth(), "borderWidth").toBe(spec.borderWidth);
    // base에는 실제 border가 없다 — 헤어라인은 secondary만 inset box-shadow로 갖는다 (DS-D-0023).
    // border를 지워도 border-box + min-block-size가 40/32 높이를 유지한다.
    expect(px(style.borderTopWidth), "base border 제거").toBe(0);
    expect(px(style.borderTopLeftRadius), "radius").toBe(spec.radius);
    expect(px(style.fontSize), "fontSize").toBe(spec.fontSize);
    expect(px(style.lineHeight), "lineHeight").toBe(spec.lineHeight);

    const spinner = loading.querySelector(".kds-button__spinner");
    const slot = withIcon.querySelector(".kds-button__icon");
    if (spinner === null || slot === null) throw new Error("spinner/icon 슬롯이 없습니다");
    expect(round(rect(spinner).width), "spinner").toBe(spec.spinner);
    expect(round(rect(spinner).height), "spinner height").toBe(spec.spinner);
    expect(round(rect(slot).width), "iconSlot").toBe(spec.iconSlot);
    expect(round(rect(slot).height), "iconSlot height").toBe(spec.iconSlot);

    // 로딩과 아이콘 variant의 높이가 기본과 같아야 한다. 다르면 Figma에서 줄이 튄다.
    expect(round(rect(loading).height), "loading height").toBe(spec.height);
    expect(round(rect(withIcon).height), "leftIcon height").toBe(spec.height);
  });
}

for (const size of SIZES) {
  const spec = measured.components["icon-button"].sizes[size];

  test(`IconButton ${size}의 구조값이 components.measured.json과 같다`, async () => {
    await render(
      <Isolated>
        <IconButton size={size} label="삭제">
          <IconTrashSimple />
        </IconButton>
      </Isolated>,
    );
    const node = document.querySelector("button.kds-icon-button");
    if (node === null) throw new Error("IconButton을 찾지 못했습니다");
    const style = getComputedStyle(node);
    const box = rect(node);

    expect(round(box.width), "width").toBe(spec.width);
    expect(round(box.height), "height").toBe(spec.height);
    // 정사각이 계약이다. 위 둘이 각각 맞아도 여기서 한 번 더 못을 박는다.
    expect(round(box.width), "정사각").toBe(round(box.height));
    expect(declaredBorderWidth(), "borderWidth").toBe(spec.borderWidth);
    // base에는 실제 border가 없다 — 정사각 계약은 inline/block-size가 지키고 헤어라인은
    // secondary만 inset box-shadow로 갖는다 (DS-D-0023).
    expect(px(style.borderTopWidth), "base border 제거").toBe(0);
    expect(px(style.borderTopLeftRadius), "radius").toBe(spec.radius);

    const glyph = node.querySelector(".kds-icon-button__glyph");
    if (glyph === null) throw new Error("glyph 슬롯이 없습니다");
    expect(round(rect(glyph).width), "glyph").toBe(spec.glyph);
    expect(round(rect(glyph).height), "glyph height").toBe(spec.glyph);
  });
}

test("헤어라인은 secondary variant에만 있다 — primary/ghost/danger에 불필요한 frame이 없다", async () => {
  // DS-D-0023: base border를 지웠으므로 secondary만 inset 헤어라인을 갖고 나머지는 frame이 없다.
  await render(
    <div>
      <Isolated>
        <Button variant="secondary">이차</Button>
      </Isolated>
      <Isolated>
        <Button variant="primary">기본</Button>
      </Isolated>
      <Isolated>
        <Button variant="ghost">고스트</Button>
      </Isolated>
      <Isolated>
        <Button variant="danger">위험</Button>
      </Isolated>
      <Isolated>
        <IconButton variant="secondary" label="이차">
          <IconTrashSimple />
        </IconButton>
      </Isolated>
      <Isolated>
        <IconButton variant="ghost" label="고스트">
          <IconTrashSimple />
        </IconButton>
      </Isolated>
    </div>,
  );
  const node = (selector: string): HTMLElement => {
    const found = document.querySelector(selector);
    if (found === null) throw new Error(`찾지 못했습니다: ${selector}`);
    return found as HTMLElement;
  };

  // secondary만 inset 헤어라인을 갖는다.
  for (const selector of [
    '.kds-button[data-variant="secondary"]',
    '.kds-icon-button[data-variant="secondary"]',
  ]) {
    expect(getComputedStyle(node(selector)).boxShadow, `${selector} 헤어라인`).toContain("inset");
  }

  // primary/ghost/danger에는 frame이 없고 border도 없다.
  for (const selector of [
    '.kds-button[data-variant="primary"]',
    '.kds-button[data-variant="ghost"]',
    '.kds-button[data-variant="danger"]',
    '.kds-icon-button[data-variant="ghost"]',
  ]) {
    const style = getComputedStyle(node(selector));
    expect(style.boxShadow, `${selector} frame 없음`).toBe("none");
    expect(px(style.borderTopWidth), `${selector} border 없음`).toBe(0);
  }
});

export type _EnsureTsx = JSX.Element;
