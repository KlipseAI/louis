// figma/components.measured.json 의 **inline-loading-label** 값을 LOUIS 레시피가 여전히 만드는지 검증한다(DS-D-0035 (c)).
//
// 기록의 값은 제품 클래스를 실브라우저에서 잰 것이고(scripts/measure-product-components.mjs), parity 게이트는 Figma 를 그
// 기록과 맞댄다. 이 파일은 반대 방향 — `packages/css/src/component/inline-loading-label.css` 가 같은 수를 만드는지 — 를 잰다.
// React 표면이 없어 문서 Anatomy 의 클래스 마크업을 렌더한다.
//
// **처음 그리는 상태로 잰다.** 슬롯은 폭 · 여백을 200ms 전이로 움직이므로 상태를 바꾼 직후의 계산값은 중간값이다 — 칸마다
// 처음부터 그 상태로 그려 전이가 시작되지 않게 한다.
import type { JSX } from "react";
import { expect, test } from "vitest";
import { render } from "vitest-browser-react";
import measured from "../../../figma/components.measured.json" with { type: "json" };
import "@klipse-design/css/layers.css";
import "@klipse-design/css/tokens.css";
import "@klipse-design/css/styles.css";
import "../../css/src/component/spinner.css";
import "../../css/src/component/inline-loading-label.css";
import { find, px } from "./fixtures/contrast";

const KEYS = ["md/false", "md/true", "sm/false", "sm/true"] as const;

function num(spec: Record<string, unknown>, field: string, label: string): number {
  const value = spec[field];
  if (typeof value !== "number") throw new Error(`${label}.${field}가 수가 아닙니다`);
  return value;
}

function Labels(): JSX.Element {
  return (
    <div style={{ display: "grid", gap: 16, padding: 16, fontSize: 14, lineHeight: 1.5 }}>
      {KEYS.map((key) => {
        const [size, loading] = key.split("/");
        return (
          <div key={key}>
            <span
              className="louis-inline-loading-label"
              data-size={size}
              data-loading={loading}
              data-testid={`root-${key}`}
            >
              <span className="louis-inline-loading-label__label">{loading === "true" ? "가입 중" : "가입"}</span>
              <span className="louis-inline-loading-label__slot" aria-hidden="true" data-testid={`slot-${key}`}>
                <span className="louis-spinner" data-size={size}>
                  <span className="louis-spinner__ring" />
                </span>
              </span>
            </span>
          </div>
        );
      })}
    </div>
  );
}

test("inline-loading-label: 네 칸의 여백 · 반경 · 슬롯 왼쪽 여백 · 슬롯 지름이 기록과 같다", async () => {
  await render(<Labels />);
  for (const key of KEYS) {
    const spec = measured.components["inline-loading-label"].sizes[key] as Record<string, unknown>;
    const label = `inline-loading-label.${key}`;
    const root = getComputedStyle(find(`root-${key}`));
    expect(px(root.paddingTop), label).toBe(num(spec, "paddingBlock", label));
    expect(px(root.paddingBottom), label).toBe(num(spec, "paddingBlock", label));
    expect(px(root.paddingLeft), label).toBe(num(spec, "paddingInline", label));
    expect(px(root.paddingRight), label).toBe(num(spec, "paddingInline", label));
    expect(px(root.borderTopLeftRadius), label).toBe(num(spec, "radius", label));
    expect(root.display, label).toBe("inline-flex");

    // Figma 의 itemSpacing 이 이 레시피에서는 슬롯의 margin-inline-start 다. 닫힘은 0.
    const slotElement = find(`slot-${key}`);
    const slot = getComputedStyle(slotElement);
    expect(px(slot.marginLeft), label).toBe(num(spec, "gap", label));

    if ("slot" in spec) {
      const diameter = num(spec, "slot", label);
      const box = slotElement.getBoundingClientRect();
      expect(box.width, label).toBe(diameter);
      expect(box.height, label).toBe(diameter);
      expect(slot.opacity, label).toBe("1");
    } else {
      // 닫힘 — 기록에 slot 키가 없다(Figma 가 레이어를 숨긴다). 레시피는 폭 0 + overflow hidden 으로 접는다.
      expect(slotElement.getBoundingClientRect().width, label).toBe(0);
      expect(slot.overflow, label).toBe("hidden");
      expect(slot.opacity, label).toBe("0");
    }
  }
});
