// figma/components.measured.json 의 **floating-shell · pill-trigger** 기하를 코드가 칸마다 여전히 만드는지 잰다
// (DS-D-0035 (c)). floating-shell.browser.test.tsx 가 재료(면 · 헤어라인 · 흐림)와 기본 칸 하나를 이미 재지만
// 셸의 `compact` 칸과 트리거의 Hover · Open 칸은 재지 않았다 — 계약(verify-figma-parity 의 FloatingShell ·
// PillTrigger)이 대조하는 칸 전부를 여기서 기록 키마다 돈다. 두 조형 다 React 표면이 없는 CSS 레시피라 문서
// (design/components/floating-shell.md) Anatomy 절의 클래스 마크업을 렌더한다.
import { expect, test } from "vitest";
import { userEvent } from "vitest/browser";
import { render } from "vitest-browser-react";
import measured from "../../../figma/components.measured.json" with { type: "json" };
import "@klipse-design/css/layers.css";
import "@klipse-design/css/tokens.css";
import "@klipse-design/css/styles.css";
import "../../css/src/component/floating-shell.css";
import { find, px } from "./fixtures/contrast";

type Sizes = Record<string, Record<string, unknown>>;

/** `sizes` 한 칸의 수 필드. `$…` 사유와 한 객체에 섞여 있어 타입이 열려 있다 — 수가 아니면 던진다. */
function num(spec: Record<string, unknown>, field: string, label: string): number {
  const value = spec[field];
  if (typeof value !== "number") throw new Error(`${label}.${field}가 수가 아닙니다`);
  return value;
}

/** 전이가 끝난 계산값을 읽는다 — 트리거가 면 색 · 캐럿 회전을 전이로 옮긴다. */
async function settle(): Promise<void> {
  void getComputedStyle(document.body).backgroundColor;
  await Promise.all(document.getAnimations().map((animation) => animation.finished.catch(() => undefined)));
}

const shellSizes = measured.components["floating-shell"].sizes as unknown as Sizes;
const triggerSizes = measured.components["pill-trigger"].sizes as unknown as Sizes;

// 기록 키 → 마크업. `shell` 은 속성 없음(Figma Size=md), `compact` 는 `data-size="compact"`(Size=lg).
const SHELL_SIZE_ATTR: Record<string, string | undefined> = { shell: undefined, compact: "compact" };

for (const [key, spec] of Object.entries(shellSizes)) {
  test(`floating-shell ${key} — 높이 · 여백 · 간격 · 반경 · 조각 크기 · 조각 곡률이 기록과 같다`, async () => {
    if (!(key in SHELL_SIZE_ATTR)) throw new Error(`floating-shell.sizes.${key} 를 렌더할 마크업이 없습니다`);
    await render(
      <div className="louis-floating-shell" data-size={SHELL_SIZE_ATTR[key]} data-testid="shell">
        <span className="louis-floating-shell__item" data-testid="item" />
        <span className="louis-floating-shell__item" />
        <span className="louis-floating-shell__item" />
      </div>,
    );
    const label = `floating-shell.${key}`;
    const shell = find("shell");
    const style = getComputedStyle(shell);
    const item = find("item");
    const itemStyle = getComputedStyle(item);
    // 높이는 선언이 아니라 여백 + 조각 + 여백 의 파생이다 — 상자를 잰다.
    expect(shell.getBoundingClientRect().height, `${label} height`).toBe(num(spec, "height", label));
    expect(px(style.paddingTop), `${label} paddingTop`).toBe(num(spec, "paddingBlock", label));
    expect(px(style.paddingBottom), `${label} paddingBottom`).toBe(num(spec, "paddingBlock", label));
    expect(px(style.paddingLeft), `${label} paddingLeft`).toBe(num(spec, "paddingInline", label));
    expect(px(style.paddingRight), `${label} paddingRight`).toBe(num(spec, "paddingInline", label));
    expect(px(style.columnGap), `${label} gap`).toBe(num(spec, "gap", label));
    expect(px(style.borderTopLeftRadius), `${label} radius`).toBe(num(spec, "radius", label));
    expect(item.getBoundingClientRect().width, `${label} itemSize 폭`).toBe(num(spec, "itemSize", label));
    expect(item.getBoundingClientRect().height, `${label} itemSize 높이`).toBe(num(spec, "itemSize", label));
    expect(px(itemStyle.borderTopLeftRadius), `${label} itemRadius`).toBe(num(spec, "itemRadius", label));
  });
}

for (const [key, spec] of Object.entries(triggerSizes)) {
  test(`pill-trigger ${key} — 높이 · 여백 · 간격 · 반경 · 라벨 크기 · 캐럿이 기록과 같다`, async () => {
    if (!["Default", "Hover", "Open"].includes(key)) {
      throw new Error(`pill-trigger.sizes.${key} 를 만들 상태가 없습니다`);
    }
    await render(
      <button
        type="button"
        className="louis-pill-trigger"
        data-testid="trigger"
        aria-haspopup="menu"
        aria-expanded={key === "Open"}
      >
        100%
        <svg className="louis-pill-trigger__caret" data-testid="caret" viewBox="0 0 10 10" aria-hidden="true" />
      </button>,
    );
    const trigger = find("trigger");
    if (key === "Hover") await userEvent.hover(trigger);
    await settle();
    const label = `pill-trigger.${key}`;
    const style = getComputedStyle(trigger);
    expect(trigger.getBoundingClientRect().height, `${label} height`).toBe(num(spec, "height", label));
    expect(px(style.paddingTop), `${label} paddingTop`).toBe(num(spec, "paddingBlock", label));
    expect(px(style.paddingBottom), `${label} paddingBottom`).toBe(num(spec, "paddingBlock", label));
    expect(px(style.paddingLeft), `${label} paddingLeft`).toBe(num(spec, "paddingInline", label));
    expect(px(style.paddingRight), `${label} paddingRight`).toBe(num(spec, "paddingInline", label));
    expect(px(style.columnGap), `${label} gap`).toBe(num(spec, "gap", label));
    expect(px(style.borderTopLeftRadius), `${label} radius`).toBe(num(spec, "radius", label));
    expect(px(style.fontSize), `${label} labelFontSize`).toBe(num(spec, "labelFontSize", label));
    // 캐럿은 Open 에서 180° 돈다 — 회전한 상자도 정사각이라 크기는 선언값으로 잰다.
    const caret = getComputedStyle(find("caret"));
    expect(px(caret.inlineSize), `${label} caretSize 폭`).toBe(num(spec, "caretSize", label));
    expect(px(caret.blockSize), `${label} caretSize 높이`).toBe(num(spec, "caretSize", label));
    expect(Number(caret.opacity), `${label} caretOpacity`).toBe(num(spec, "caretOpacity", label));
    if (key === "Hover") await userEvent.unhover(trigger);
  });
}
