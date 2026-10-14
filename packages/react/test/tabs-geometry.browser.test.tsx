// figma/components.measured.json 의 **tab-item · tabs** 기하를 코드가 여전히 만드는지 잰다(DS-D-0035 (c)). 탭은 React 표면이
// 없는 CSS 레시피(packages/css/src/component/tabs.css)라 문서(design/components/tabs.md) Anatomy 의 마크업을 렌더한다.
// 키는 Figma 의 Variant/State 축이고, 상태는 `aria-selected` · `disabled` · 실제 호버로 만든다.
import type { JSX } from "react";
import { beforeEach, expect, test } from "vitest";
import { page, userEvent } from "vitest/browser";
import { render } from "vitest-browser-react";
import measured from "../../../figma/components.measured.json" with { type: "json" };
import "@klipse-design/css/layers.css";
import "@klipse-design/css/tokens.css";
import "@klipse-design/css/styles.css";
import { find, px } from "./fixtures/contrast";

type Sizes = Record<string, Record<string, unknown>>;

/** `sizes` 한 칸의 수 필드. `$…` 사유와 한 객체에 섞여 있어 타입이 열려 있다 — 수가 아니면 던진다. */
function num(spec: Record<string, unknown>, field: string, label: string): number {
  const value = spec[field];
  if (typeof value !== "number") throw new Error(`${label}.${field}가 수가 아닙니다`);
  return value;
}

async function settle(): Promise<void> {
  void getComputedStyle(document.body).opacity;
  await Promise.all(document.getAnimations().map((animation) => animation.finished.catch(() => undefined)));
}

const itemSizes = measured.components["tab-item"].sizes as unknown as Sizes;
const listSizes = measured.components["tabs"].sizes as unknown as Sizes;

beforeEach(async () => {
  // 480px 이하 규칙(underline 의 wrap · 좌우 8)은 뷰포트 조건이라 Figma 변형이 없다 — 넓은 폭에서 잰다.
  await page.viewport(1440, 900);
});

function Tabs({ variant, state }: { variant: string | undefined; state: string }): JSX.Element {
  return (
    <nav className="louis-tabs" role="tablist" aria-label="보기" data-variant={variant} data-testid="list">
      <button
        className="louis-tabs__tab"
        type="button"
        role="tab"
        aria-selected={state === "Selected"}
        disabled={state === "Disabled"}
        data-testid="tab"
      >
        요약
      </button>
      <button className="louis-tabs__tab" type="button" role="tab" aria-selected={state !== "Selected"} data-testid="tab-2">
        상세 보기
      </button>
    </nav>
  );
}

for (const [key, spec] of Object.entries(itemSizes)) {
  test(`tab-item ${key} — 높이 · 여백 · 반경 · 라벨 크기가 기록과 같다`, async () => {
    const [variant, state] = key.includes("/") ? (key.split("/") as [string, string]) : [undefined, key];
    const label = `tab-item.${key}`;
    await render(<Tabs variant={variant} state={state} />);
    const tab = find("tab");
    if (state === "Hover") await userEvent.hover(tab);
    await settle();
    const style = getComputedStyle(tab);
    expect(tab.getBoundingClientRect().height, `${label} height`).toBe(num(spec, "height", label));
    expect(px(style.paddingTop), `${label} paddingBlock 위`).toBe(num(spec, "paddingBlock", label));
    expect(px(style.paddingBottom), `${label} paddingBlock 아래`).toBe(num(spec, "paddingBlock", label));
    expect(px(style.paddingLeft), `${label} paddingInline 왼`).toBe(num(spec, "paddingInline", label));
    expect(px(style.paddingRight), `${label} paddingInline 오른`).toBe(num(spec, "paddingInline", label));
    expect(px(style.borderTopLeftRadius), `${label} radius`).toBe(num(spec, "radius", label));
    expect(px(style.fontSize), `${label} labelFontSize`).toBe(num(spec, "labelFontSize", label));
    expect(px(style.lineHeight), `${label} labelLineHeight`).toBe(num(spec, "labelLineHeight", label));
    if (typeof spec["barWidth"] === "number") {
      expect(px(style.borderBottomWidth), `${label} barWidth`).toBe(num(spec, "barWidth", label));
    }
    if (state === "Hover") await userEvent.unhover(tab);
  });
}

for (const [key, spec] of Object.entries(listSizes)) {
  test(`tabs ${key} — 높이 · 간격 · 탭 높이가 기록과 같다`, async () => {
    const label = `tabs.${key}`;
    await render(<Tabs variant={key === "default" ? undefined : key} state="Selected" />);
    const list = find("list");
    const style = getComputedStyle(list);
    expect(list.getBoundingClientRect().height, `${label} height`).toBe(num(spec, "height", label));
    expect(px(style.columnGap), `${label} gap`).toBe(num(spec, "gap", label));
    expect(find("tab-2").getBoundingClientRect().left - find("tab").getBoundingClientRect().right, `${label} 탭 사이`).toBe(
      num(spec, "gap", label),
    );
    expect(find("tab").getBoundingClientRect().height, `${label} tabHeight`).toBe(num(spec, "tabHeight", label));
    expect(px(style.paddingTop) + px(style.paddingLeft), `${label} 여백 0`).toBe(0);
    if (typeof spec["borderWidth"] === "number") {
      // 밑선은 inset 헤어라인 — 상자에 들어가지 않고 그림자 두께로 선다.
      expect(style.boxShadow, `${label} 밑선 inset`).toContain("inset");
      expect(style.boxShadow, `${label} 밑선 두께`).toContain(`${num(spec, "borderWidth", label)}px`);
    }
  });
}
