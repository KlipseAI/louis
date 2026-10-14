// figma/components.measured.json 의 **form-message** 기하를 코드가 여전히 만드는지 잰다(DS-D-0035 (c)).
// React 표면이 없는 CSS 레시피라 클래스 마크업을 렌더한다 — 마크업은 design/components/form-message.md 의 예시 그대로다.
// 기록의 키는 Figma FormMessage 의 Tone 축(error · neutral)이다.
import { expect, test } from "vitest";
import { render } from "vitest-browser-react";
import measured from "../../../figma/components.measured.json" with { type: "json" };
import "@klipse-design/css/layers.css";
import "@klipse-design/css/tokens.css";
import "@klipse-design/css/styles.css";
import "../../css/src/component/form-message.css";
import { find, px } from "./fixtures/contrast";

function num(spec: Record<string, unknown>, field: string, label: string): number {
  const value = spec[field];
  if (typeof value !== "number") throw new Error(`${label}.${field}가 수가 아닙니다`);
  return value;
}

test("form-message: error · neutral 의 높이 · 시작 여백 · 반경 · 글자가 기록과 같다 — 톤은 색만 가른다", async () => {
  await render(
    <div style={{ inlineSize: 320 }}>
      <p className="louis-form-message" data-tone="error" role="alert" data-testid="form-message-error">
        이메일 또는 비밀번호가 올바르지 않습니다.
      </p>
      <p className="louis-form-message" data-testid="form-message-neutral">
        8자 이상 입력하세요.
      </p>
    </div>,
  );
  const colors: string[] = [];
  for (const key of ["error", "neutral"] as const) {
    const spec = measured.components["form-message"].sizes[key] as Record<string, unknown>;
    const label = `form-message.${key}`;
    const root = find(`form-message-${key}`);
    const style = getComputedStyle(root);
    expect(root.getBoundingClientRect().height, `${label} height`).toBe(num(spec, "height", label));
    expect(px(style.paddingInlineStart), `${label} paddingInlineStart`).toBe(num(spec, "paddingInlineStart", label));
    expect(px(style.paddingInlineEnd), `${label} paddingInlineEnd`).toBe(num(spec, "paddingInlineEnd", label));
    expect(px(style.paddingTop), `${label} paddingTop`).toBe(num(spec, "paddingBlock", label));
    expect(px(style.paddingBottom), `${label} paddingBottom`).toBe(num(spec, "paddingBlock", label));
    expect(px(style.marginTop), `${label} margin`).toBe(0);
    expect(px(style.borderTopLeftRadius), `${label} radius`).toBe(num(spec, "radius", label));
    expect(px(style.fontSize), `${label} fontSize`).toBe(num(spec, "fontSize", label));
    expect(px(style.lineHeight), `${label} lineHeight`).toBe(num(spec, "lineHeight", label));
    colors.push(style.color);
  }
  // 두 톤은 같은 기하에 다른 글자색이다.
  expect(colors[0]).not.toBe(colors[1]);
});
