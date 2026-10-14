// figma/components.measured.json 의 **menu-media-item** 값을 LOUIS 레시피가 여전히 만드는지 잰다(DS-D-0035 (c), DS-D-0103).
//
// 정본은 packages/css/src/component/menu-popover.css 의 `.louis-menu__item[data-layout="media"]` 이고 마크업은 design/components/menu-popover.md
// 「그림 우물 항목」 그대로다. ActionMenuItem 에 layout prop 이 아직 없어 클래스 마크업을 렌더한다. 호버는 같은 면을 칠하는 `[data-highlighted]` 로 세운다.
import { afterEach, expect, test } from "vitest";
import { render } from "vitest-browser-react";
import measured from "../../../figma/components.measured.json" with { type: "json" };
import "@klipse-design/css/layers.css";
import "@klipse-design/css/tokens.css";
import "@klipse-design/css/styles.css";
import "../../css/src/component/menu-popover.css";
import { backdrop, contrastOn, find, px, textContrast, tokenColor } from "./fixtures/contrast";

afterEach(() => {
  document.documentElement.removeAttribute("data-theme");
});

const spec = measured.components["menu-media-item"].sizes.media;
const STATES = ["Default", "Hover", "Selected", "Disabled"] as const;

function Item({ state }: { readonly state: (typeof STATES)[number] }) {
  return (
    <div
      role="option"
      tabIndex={-1}
      className="louis-menu__item"
      data-layout="media"
      aria-selected={state === "Selected"}
      aria-disabled={state === "Disabled" ? true : undefined}
      data-highlighted={state === "Hover" ? "true" : undefined}
      data-testid={`item-${state}`}
    >
      <span className="louis-menu__item-media" aria-hidden="true" data-testid={`media-${state}`}>
        <svg viewBox="0 0 24 24" data-testid={`logo-${state}`}>
          <circle cx="12" cy="12" r="10" fill="currentColor" />
        </svg>
      </span>
      <span className="louis-menu__item-text" data-testid={`text-${state}`}>
        <span className="louis-menu__item-heading" data-testid={`heading-${state}`}>
          <span className="louis-menu__item-label" data-testid={`label-${state}`}>
            Seedance 1.0 Pro
          </span>
          <span className="louis-badge" data-testid={`badge-${state}`}>
            업데이트 예정
          </span>
        </span>
        <span className="louis-menu__item-description" data-testid={`desc-${state}`}>
          영상 길이 5–10초 · 1080p · 첫 프레임 · 끝 프레임까지 고를 수 있는 모델
        </span>
      </span>
    </div>
  );
}

function Panel() {
  return (
    <div
      className="louis-popover"
      role="listbox"
      aria-label="영상 모델"
      style={{ inlineSize: 320, ["--louis-overlay-collision-padding" as string]: "8px" }}
    >
      {STATES.map((state) => (
        <Item key={state} state={state} />
      ))}
    </div>
  );
}

test("menu-media-item: 네 상태의 높이 · 여백 · 간격 · 반경 · 우물 · 로고 · 글자 묶음이 기록과 같다", async () => {
  await render(<Panel />);
  for (const state of STATES) {
    const label = `menu-media-item.${state}`;
    const item = find(`item-${state}`);
    const style = getComputedStyle(item);
    expect(item.getBoundingClientRect().height, `${label} height`).toBe(spec.height);
    expect(px(style.paddingTop), `${label} paddingBlock`).toBe(spec.padding);
    expect(px(style.paddingBottom), `${label} paddingBlockEnd`).toBe(spec.padding);
    expect(px(style.paddingLeft), `${label} paddingInline`).toBe(spec.padding);
    expect(px(style.paddingRight), `${label} paddingInlineEnd`).toBe(spec.padding);
    expect(px(style.columnGap), `${label} gap`).toBe(spec.gap);
    expect(px(style.borderTopLeftRadius), `${label} radius`).toBe(spec.radius);
    expect(style.alignItems, `${label} 가운데 정렬`).toBe("center");
    const media = find(`media-${state}`);
    const mediaRect = media.getBoundingClientRect();
    expect(mediaRect.width, `${label} mediaSize`).toBe(spec.mediaSize);
    expect(mediaRect.height, `${label} mediaSize`).toBe(spec.mediaSize);
    expect(px(getComputedStyle(media).borderTopLeftRadius), `${label} mediaRadius`).toBe(spec.mediaRadius);
    const logo = find(`logo-${state}`).getBoundingClientRect();
    expect(logo.width, `${label} logoSize`).toBe(spec.logoSize);
    expect(logo.height, `${label} logoSize`).toBe(spec.logoSize);
    expect(px(getComputedStyle(find(`text-${state}`)).rowGap), `${label} textGap`).toBe(spec.textGap);
    expect(px(getComputedStyle(find(`heading-${state}`)).columnGap), `${label} headingGap`).toBe(spec.headingGap);
    expect(px(getComputedStyle(find(`label-${state}`)).fontSize), `${label} titleFontSize`).toBe(spec.titleFontSize);
    expect(px(getComputedStyle(find(`desc-${state}`)).fontSize), `${label} descriptionFontSize`).toBe(spec.descriptionFontSize);
    // 설명은 한 줄 말줄임이다 — 줄 높이 하나.
    const desc = find(`desc-${state}`);
    expect(desc.getBoundingClientRect().height, `${label} 설명 한 줄`).toBe(px(getComputedStyle(desc).lineHeight));
    // 배지는 이름 줄 끝에 선다.
    const heading = find(`heading-${state}`).getBoundingClientRect();
    expect(find(`badge-${state}`).getBoundingClientRect().right, `${label} 배지 끝`).toBeCloseTo(heading.right, 0);
  }
});

for (const theme of ["light", "dark"] as const) {
  test(`${theme} — 면 · 잉크가 정본 토큰이고 이름 · 설명 · 배지가 쉼 · 호버 · 선택 면 위 4.5:1 을 넘는다`, async () => {
    document.documentElement.setAttribute("data-theme", theme);
    await render(<Panel />);
    expect(getComputedStyle(find("media-Default")).backgroundColor).toBe(tokenColor("color-accent-secondary", "backgroundColor"));
    expect(getComputedStyle(find("item-Hover")).backgroundColor).toBe(tokenColor("color-accent-menu-item-hover", "backgroundColor"));
    expect(getComputedStyle(find("item-Selected")).backgroundColor).toBe(tokenColor("color-accent-secondary-hover", "backgroundColor"));
    for (const state of ["Default", "Hover", "Selected"] as const) {
      expect(getComputedStyle(find(`label-${state}`)).color, `${state} 이름 잉크`).toBe(tokenColor("color-fg-primary"));
      expect(getComputedStyle(find(`desc-${state}`)).color, `${state} 설명 잉크`).toBe(tokenColor("color-fg-secondary"));
      for (const part of ["label", "desc", "badge"] as const) {
        const node = find(`${part}-${state}`);
        const ratio = part === "badge" ? textContrast(node) : contrastOn(getComputedStyle(node).color, backdrop(find(`item-${state}`)));
        expect(ratio, `${theme} ${state} ${part} ${ratio.toFixed(2)}`).toBeGreaterThanOrEqual(4.5);
      }
    }
    // 비활성 — 이름 · 설명이 fg-disabled 를 물려받고 우물이 흐려진다(대비 요구 밖).
    expect(getComputedStyle(find("label-Disabled")).color).toBe(tokenColor("color-fg-disabled"));
    expect(getComputedStyle(find("desc-Disabled")).color).toBe(tokenColor("color-fg-disabled"));
    expect(getComputedStyle(find("media-Disabled")).opacity).toBe("0.4");
  });
}
