// figma/components.measured.json 의 **choice-card** 값을 코드가 여전히 만드는지 검증한다.
//
// verify-recipe-record 는 레시피의 **선언**을 기록과 맞대지만, 선언이 계산값이 되는 길(특이도 · 상속 · 크기별 재정의가
// 어느 쪽을 이기는지)은 보지 못한다. 2026-10-13 의 줄 목록(`list`)이 그 자리다 — 표식 20 은 `[data-variant="list"]` 규칙이
// `[data-size="sm"]` 규칙과 같은 특이도로 이겨야 서고, 이름 20 은 sm · row 재정의가 걸리지 **않아야** 선다. 그래서 다섯 칸을
// 전부 렌더해 계산값으로 잰다. `verify-figma-done` 의 「두 방향」 뒤쪽이 이 파일이다.
//
// **React 컴포넌트가 아니라 클래스 마크업을 렌더한다.** choice-card 는 `packages/react/src` 에 표면이 없고 정본이
// `packages/css/src/component/choice-card.css` 다(계약의 figmaAhead). 마크업은 design/components/choice-card.md 의 Usage 그대로다 —
// 묶음과 항목에 같은 `data-variant` · `data-size` 를 단다.
import type { JSX } from "react";
import { expect, test } from "vitest";
import { render } from "vitest-browser-react";
import measured from "../../../figma/components.measured.json" with { type: "json" };
import "@klipse-design/css/layers.css";
import "@klipse-design/css/tokens.css";
import "@klipse-design/css/styles.css";

type Key = "card/md" | "card/sm" | "row/md" | "list/md" | "list/sm";

const KEYS: readonly Key[] = ["card/md", "card/sm", "row/md", "list/md", "list/sm"];

/** 기록 칸의 모양. 표식 · 체크 · 설명은 칸마다 있거나 없다(행형은 표식이 없고, sm 은 설명 표본이 없다). */
interface ChoiceSpec {
  readonly minHeight: number;
  readonly paddingBlock: number;
  readonly paddingInline: number;
  readonly gap: number;
  readonly radius: number;
  readonly textGap: number;
  readonly labelFontSize: number;
  readonly labelLineHeight: number;
  readonly descriptionFontSize?: number;
  readonly descriptionLineHeight?: number;
  readonly markerSize?: number;
  readonly markerRadiusRadio?: number;
  readonly markerRadiusCheckbox?: number;
  readonly checkInline?: number;
  readonly checkBlock?: number;
}

const SIZES: Record<Key, ChoiceSpec> = measured.components["choice-card"].sizes;

const px = (value: string): number => Number.parseFloat(value);
/** 줄 높이를 Figma 퍼센트로 — 기록이 `lineHeightPercent` 로 적는다. */
const percent = (lineHeight: string, fontSize: string): number =>
  Math.round((px(lineHeight) / px(fontSize)) * 1000) / 10;

function find(selector: string): HTMLElement {
  const node = document.querySelector(`[data-louis-fixture] ${selector}`);
  if (node === null) throw new Error(`찾지 못했습니다: ${selector}`);
  return node as HTMLElement;
}

function Item({
  variant,
  size,
  role,
}: {
  variant: string;
  size: string;
  role: "radio" | "checkbox";
}): JSX.Element {
  return (
    <button
      type="button"
      className="louis-choice-card"
      data-variant={variant}
      data-size={size}
      role={role}
      aria-checked="false"
      data-role={role}
    >
      <span className="louis-choice-card__text">
        <span className="louis-choice-card__label">유튜브</span>
        <span className="louis-choice-card__description">긴 영상과 쇼츠를 올려요</span>
      </span>
      <span className="louis-choice-card__marker" aria-hidden="true" />
    </button>
  );
}

for (const key of KEYS) {
  const spec = SIZES[key];
  const [variant, size] = key.split("/") as [string, string];

  test(`ChoiceCard ${key}의 구조값이 components.measured.json과 같다`, async () => {
    // **폭을 고정한다.** list/sm 묶음은 560 경계로 열 수가 바뀌고, 항목 기하는 그와 무관하지만 칸 폭이 정해져야 줄바꿈이 없다.
    await render(
      <div data-louis-fixture style={{ inlineSize: 400 }}>
        <div className="louis-choice-group" data-variant={variant} data-size={size} role="radiogroup" aria-label="활동 채널">
          <Item variant={variant} size={size} role="radio" />
        </div>
        <div className="louis-choice-group" data-variant={variant} data-size={size} role="group" aria-label="활동 채널">
          <Item variant={variant} size={size} role="checkbox" />
        </div>
      </div>,
    );

    const item = find('[data-role="radio"]');
    const style = getComputedStyle(item);
    expect(style.flexDirection, "layoutMode HORIZONTAL").toBe("row");
    expect(style.alignItems, "counterAxisAlignItems CENTER").toBe("center");
    expect(px(style.minHeight), "minHeight").toBe(spec.minHeight);
    expect(item.offsetHeight >= spec.minHeight, "높이가 하한을 넘는다").toBe(true);
    expect(px(style.paddingTop), "paddingBlock").toBe(spec.paddingBlock);
    expect(px(style.paddingBottom), "paddingBlockEnd").toBe(spec.paddingBlock);
    expect(px(style.paddingLeft), "paddingInline").toBe(spec.paddingInline);
    expect(px(style.paddingRight), "paddingInlineEnd").toBe(spec.paddingInline);
    expect(px(style.columnGap), "gap").toBe(spec.gap);
    expect(px(style.borderTopLeftRadius), "radius").toBe(spec.radius);

    const text = getComputedStyle(find('[data-role="radio"] .louis-choice-card__text'));
    expect(text.flexDirection, "Text VERTICAL").toBe("column");
    expect(px(text.rowGap), "textGap").toBe(spec.textGap);

    const label = getComputedStyle(find('[data-role="radio"] .louis-choice-card__label'));
    expect(px(label.fontSize), "labelFontSize").toBe(spec.labelFontSize);
    expect(percent(label.lineHeight, label.fontSize), "labelLineHeight").toBe(spec.labelLineHeight);

    if (spec.descriptionFontSize !== undefined) {
      const description = getComputedStyle(find('[data-role="radio"] .louis-choice-card__description'));
      expect(px(description.fontSize), "descriptionFontSize").toBe(spec.descriptionFontSize);
      expect(percent(description.lineHeight, description.fontSize), "descriptionLineHeight").toBe(
        spec.descriptionLineHeight,
      );
    }

    // 행형은 기록에 표식이 없다 — 고른 면의 뒤집힘이 표식이다($slots). 마크업에 표식을 두더라도 그 칸은 재지 않는다.
    if (spec.markerSize !== undefined) {
      const marker = find('[data-role="radio"] .louis-choice-card__marker');
      expect(marker.offsetWidth, "markerSize").toBe(spec.markerSize);
      expect(marker.offsetHeight, "markerSize (높이)").toBe(spec.markerSize);
      expect(px(getComputedStyle(marker).borderTopLeftRadius), "markerRadiusRadio").toBe(
        spec.markerRadiusRadio,
      );
      expect(
        px(getComputedStyle(find('[data-role="checkbox"] .louis-choice-card__marker')).borderTopLeftRadius),
        "markerRadiusCheckbox",
      ).toBe(spec.markerRadiusCheckbox);
      const check = getComputedStyle(marker, "::before");
      expect(px(check.width), "checkInline").toBe(spec.checkInline);
      expect(px(check.height), "checkBlock").toBe(spec.checkBlock);
    }
  });
}

test("ChoiceCard list 는 표식이 이름 묶음보다 앞에 선다", async () => {
  // 마크업 순서는 card 와 같고(이름 묶음 → 표식) CSS `order` 가 자리만 옮긴다 — Figma 프레임의 자식 순서가 바뀌는 이유다.
  await render(
    <div data-louis-fixture style={{ inlineSize: 400 }}>
      <div className="louis-choice-group" data-variant="list" role="radiogroup" aria-label="활동 채널">
        <Item variant="list" size="md" role="radio" />
      </div>
    </div>,
  );
  const marker = find(".louis-choice-card__marker").getBoundingClientRect();
  const text = find(".louis-choice-card__text").getBoundingClientRect();
  expect(marker.right <= text.left, "표식이 왼쪽").toBe(true);
});
