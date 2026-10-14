// figma/components.measured.json 의 **breadcrumb** 기하를 코드가 여전히 만드는지 잰다(DS-D-0035 (c)).
// React 표면이 없는 CSS 레시피라 클래스 마크업을 렌더한다 — 마크업은 design/components/breadcrumb.md 의 예시 그대로다.
// 기록의 키는 Figma Breadcrumb 의 Kind 축(single · nested)이다.
import { expect, test } from "vitest";
import { render } from "vitest-browser-react";
import measured from "../../../figma/components.measured.json" with { type: "json" };
import "@klipse-design/css/layers.css";
import "@klipse-design/css/tokens.css";
import "@klipse-design/css/styles.css";
import "../../css/src/component/breadcrumb.css";
import { find, px } from "./fixtures/contrast";

function num(spec: Record<string, unknown>, field: string, label: string): number {
  const value = spec[field];
  if (typeof value !== "number") throw new Error(`${label}.${field}가 수가 아닙니다`);
  return value;
}

function word(spec: Record<string, unknown>, field: string, label: string): string {
  const value = spec[field];
  if (typeof value !== "string") throw new Error(`${label}.${field}가 글자가 아닙니다`);
  return value;
}

test("breadcrumb: single · nested 의 높이 · 여백 · 사이 · 반경 · 글자가 기록과 같다", async () => {
  await render(
    <div style={{ display: "grid", gap: 16, justifyItems: "start" }}>
      <nav className="louis-breadcrumb" aria-label="현재 위치" data-testid="breadcrumb-single">
        <span className="louis-breadcrumb__current" aria-current="page">
          대시보드
        </span>
      </nav>
      <nav className="louis-breadcrumb" aria-label="현재 위치" data-testid="breadcrumb-nested">
        <span className="louis-breadcrumb__parent">프로젝트</span>
        <span className="louis-breadcrumb__separator" aria-hidden="true">
          /
        </span>
        <span className="louis-breadcrumb__current" aria-current="page">
          대시보드
        </span>
      </nav>
    </div>,
  );
  for (const key of ["single", "nested"] as const) {
    const spec = measured.components["breadcrumb"].sizes[key] as Record<string, unknown>;
    const label = `breadcrumb.${key}`;
    const root = find(`breadcrumb-${key}`);
    const style = getComputedStyle(root);
    expect(root.getBoundingClientRect().height, `${label} height`).toBe(num(spec, "height", label));
    const padding = num(spec, "padding", label);
    expect(px(style.paddingLeft), `${label} paddingLeft`).toBe(padding);
    expect(px(style.paddingRight), `${label} paddingRight`).toBe(padding);
    expect(px(style.paddingTop), `${label} paddingTop`).toBe(padding);
    expect(px(style.paddingBottom), `${label} paddingBottom`).toBe(padding);
    expect(px(style.columnGap), `${label} gap`).toBe(num(spec, "gap", label));
    expect(px(style.borderTopLeftRadius), `${label} radius`).toBe(num(spec, "radius", label));
    // 격자 칸 안에서는 inline-flex 가 flex 로 블록화된다 — 플렉스 상자인지만 본다.
    expect(style.display, label).toMatch(/flex$/);
    expect(style.flexDirection, label).toBe(word(spec, "direction", label));

    const current = root.querySelector<HTMLElement>(".louis-breadcrumb__current")!;
    const currentStyle = getComputedStyle(current);
    expect(current.getBoundingClientRect().height, `${label} current height`).toBe(num(spec, "lineHeight", label));
    expect(px(currentStyle.fontSize), `${label} current fontSize`).toBe(num(spec, "fontSize", label));
    expect(current.getAttribute("aria-current"), label).toBe("page");

    const trail = [".louis-breadcrumb__parent", ".louis-breadcrumb__separator"].map((selector) =>
      root.querySelector<HTMLElement>(selector),
    );
    if (key === "single") {
      // 기록에도 trail* 이 없다 — 계약의 optional 이 그 빈자리로 통과한다.
      expect(trail.every((node) => node === null), label).toBe(true);
      expect(spec.trailLineHeight, label).toBeUndefined();
      continue;
    }
    for (const node of trail) {
      expect(node, label).not.toBeNull();
      expect(node!.getBoundingClientRect().height, `${label} trail height`).toBe(num(spec, "trailLineHeight", label));
      expect(px(getComputedStyle(node!).fontSize), `${label} trail fontSize`).toBe(num(spec, "trailFontSize", label));
    }
    // 사이 4 는 간격이 만든다 — 부모 끝과 구분자 시작이 정확히 gap 만큼 떨어진다.
    const parent = trail[0]!;
    const separator = trail[1]!;
    expect(
      separator.getBoundingClientRect().left - parent.getBoundingClientRect().right,
      `${label} parent→separator`,
    ).toBeCloseTo(num(spec, "gap", label), 1);
  }
});
