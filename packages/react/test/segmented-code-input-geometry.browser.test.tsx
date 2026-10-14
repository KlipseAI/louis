// figma/components.measured.json 의 **segmented-code-input** 값을 LOUIS 레시피가 여전히 만드는지 검증한다(DS-D-0035 (c)).
//
// 기록의 값은 제품 칸 클래스(BOX)를 실브라우저에서 잰 것이고(scripts/measure-product-components.mjs), parity 게이트는
// Figma 를 그 기록과 맞댄다. 이 파일은 반대 방향 — `packages/css/src/component/segmented-code-input.css` 가 같은 수를
// 만드는지 — 를 잰다. React 표면이 없어 문서의 클래스 마크업을 렌더한다. 칸은 컨테이너에 맞춰 줄므로 상한 28 에 닿고도
// 남는 폭(420)에 세운다 — 구분자 폭은 하이픈 글자가 정해 Figma 표본 폭 386 에 기대지 않는다.
import { expect, test } from "vitest";
import { render } from "vitest-browser-react";
import measured from "../../../figma/components.measured.json" with { type: "json" };
import "@klipse-design/css/layers.css";
import "@klipse-design/css/tokens.css";
import "@klipse-design/css/styles.css";
import "../../css/src/component/segmented-code-input.css";
import { find, px } from "./fixtures/contrast";

const STATES = ["Default", "Focus", "Disabled"] as const;

function num(spec: Record<string, unknown>, field: string, label: string): number {
  const value = spec[field];
  if (typeof value !== "number") throw new Error(`${label}.${field}가 수가 아닙니다`);
  return value;
}

function Group({ state }: { state: (typeof STATES)[number] }) {
  const nodes = [];
  for (let index = 0; index < 12; index += 1) {
    nodes.push(
      <input
        key={`c${index}`}
        className="louis-segmented-code-input__cell"
        maxLength={1}
        defaultValue="A"
        aria-label={`${index + 1}번째 글자`}
        disabled={state === "Disabled"}
        data-testid={index === 0 ? `sci-${state}-cell` : undefined}
      />,
    );
    // 네 칸마다 구분자 — 마지막 칸 뒤에는 없다.
    if ((index + 1) % 4 === 0 && index < 11) {
      nodes.push(
        <span
          key={`s${index}`}
          className="louis-segmented-code-input__separator"
          aria-hidden="true"
          data-testid={index === 3 ? `sci-${state}-separator` : undefined}
        >
          -
        </span>,
      );
    }
  }
  return (
    <div className="louis-segmented-code-input" role="group" aria-label="쿠폰 코드" data-testid={`sci-${state}`}>
      {nodes}
    </div>
  );
}

test("segmented-code-input: Default · Focus · Disabled 의 묶음 높이 · 칸 28 × 36 · 반경 · 테두리 · 글자가 기록과 같다", async () => {
  await render(
    <div style={{ display: "grid", gap: 16, inlineSize: 420 }}>
      {STATES.map((state) => (
        <Group key={state} state={state} />
      ))}
    </div>,
  );
  (find("sci-Focus-cell") as HTMLInputElement).focus();
  const borders: string[] = [];
  for (const state of STATES) {
    const spec = measured.components["segmented-code-input"].sizes[state] as Record<string, unknown>;
    const label = `segmented-code-input.${state}`;
    const root = find(`sci-${state}`);
    const rootStyle = getComputedStyle(root);
    // 묶음 높이는 칸 높이가 정한다(계약 height → cellHeight). 여백 · 반경 0 · 가로 배치.
    expect(root.getBoundingClientRect().height, `${label} height`).toBe(num(spec, "cellHeight", label));
    expect(px(rootStyle.paddingTop), `${label} paddingBlock`).toBe(0);
    expect(px(rootStyle.paddingLeft), `${label} paddingInline`).toBe(0);
    expect(px(rootStyle.borderTopLeftRadius), `${label} radius`).toBe(0);
    expect(rootStyle.flexDirection, `${label} direction`).toBe("row");
    const cell = find(`sci-${state}-cell`);
    const cellStyle = getComputedStyle(cell);
    const cellRect = cell.getBoundingClientRect();
    expect(cellRect.width, `${label} cellWidth`).toBe(num(spec, "cellWidth", label));
    expect(cellRect.height, `${label} cellHeight`).toBe(num(spec, "cellHeight", label));
    expect(px(cellStyle.borderTopLeftRadius), `${label} cellRadius`).toBe(num(spec, "cellRadius", label));
    // 진짜 1px 테두리 — 헤어라인 inset 그림자가 아니다(문서 Known deviations 2).
    expect(px(cellStyle.borderTopWidth), `${label} borderWidth`).toBe(num(spec, "borderWidth", label));
    expect(cellStyle.borderTopStyle, `${label} borderStyle`).toBe("solid");
    expect(px(cellStyle.fontSize), `${label} charFontSize`).toBe(num(spec, "charFontSize", label));
    expect(px(cellStyle.lineHeight), `${label} charHeight`).toBe(num(spec, "charHeight", label));
    const separator = find(`sci-${state}-separator`);
    const sepStyle = getComputedStyle(separator);
    expect(separator.getBoundingClientRect().height, `${label} separator height`).toBe(num(spec, "charHeight", label));
    expect(px(sepStyle.fontSize), `${label} dash fontSize`).toBe(num(spec, "charFontSize", label));
    borders.push(cellStyle.borderTopColor);
  }
  // 포커스는 테두리 색만 바꾼다 — 기하는 위에서 세 칸이 같았다.
  expect(borders[1]).not.toBe(borders[0]);
  expect(getComputedStyle(find("sci-Disabled-cell")).opacity).toBe("0.4");
});
