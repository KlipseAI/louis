// 표 행 hover 는 면이 아니라 상태 레이어다 (DS-D-0065) — design/components/table.md Acceptance 10 · 11 · 17.
//
// `color-table-row-hover` 가 면 사다리 칸(light `palette-gray-050` · dark `palette-gray-900`)을 물던
// 동안, 다크에서는 그 값이 `bg-surface` · `bg-raised` 와 같아 카드 위 표의 hover 가 바닥과 같은
// 색이 됐고, 라이트에서도 `bg-inset` 바닥 위에서 같은 일이 났다. 계산값 문자열을 비교하면 이것이
// 드러나지 않는다 — 토큰도 규칙도 멀쩡히 적용돼 있기 때문이다. 그래서 **바닥과 hover 를 캔버스에
// 차례로 칠해 8비트 합성색으로** 잰다(정규식으로 `color()` 를 긁지 않는다).
import { expect, test } from "vitest";
import { userEvent } from "vitest/browser";
import "@klipse-design/css/tokens.css";
import "@klipse-design/css/styles.css";

const THEMES = ["light", "dark"] as const;
const FLOORS = ["bg-canvas", "bg-inset", "bg-surface", "bg-raised"] as const;
type Rgb = readonly [number, number, number];

function composite(...colors: readonly string[]): Rgb {
  const context = document.createElement("canvas").getContext("2d", { willReadFrequently: true });
  if (context === null) throw new Error("2d 캔버스를 만들지 못했습니다");
  context.canvas.width = 1;
  context.canvas.height = 1;
  for (const color of colors) {
    context.fillStyle = "#ff00ff";
    context.fillStyle = color;
    if (context.fillStyle === "#ff00ff") throw new Error(`캔버스가 색을 읽지 못했습니다: ${color}`);
    context.fillRect(0, 0, 1, 1);
  }
  const [r, g, b] = context.getImageData(0, 0, 1, 1).data;
  return [r ?? 0, g ?? 0, b ?? 0];
}

const channel = (value: number): number => {
  const s = value / 255;
  return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
};
const luminance = ([r, g, b]: Rgb): number => 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);

function alphaOf(color: string): number {
  const context = document.createElement("canvas").getContext("2d", { willReadFrequently: true });
  if (context === null) throw new Error("2d 캔버스를 만들지 못했습니다");
  context.canvas.width = 1;
  context.canvas.height = 1;
  context.clearRect(0, 0, 1, 1);
  context.fillStyle = color;
  context.fillRect(0, 0, 1, 1);
  return (context.getImageData(0, 0, 1, 1).data[3] ?? 0) / 255;
}

function mount(floor: string): { host: HTMLElement; interactive: HTMLTableCellElement; plain: HTMLTableCellElement } {
  const host = document.createElement("div");
  host.style.padding = "16px";
  host.style.background = `var(--louis-color-${floor})`;
  host.innerHTML = [
    '<table class="louis-table">',
    '<thead><tr><th scope="col">이름</th><th scope="col" data-align="end">값</th></tr></thead>',
    "<tbody>",
    '<tr data-interactive="true"><td data-probe="interactive">가</td><td data-align="end">1</td></tr>',
    '<tr><td data-probe="plain">나</td><td data-align="end">2</td></tr>',
    "</tbody>",
    "</table>",
  ].join("");
  document.body.append(host);
  const interactive = host.querySelector<HTMLTableCellElement>('[data-probe="interactive"]');
  const plain = host.querySelector<HTMLTableCellElement>('[data-probe="plain"]');
  if (interactive === null || plain === null) throw new Error("표 셀을 찾지 못했습니다");
  return { host, interactive, plain };
}

for (const theme of THEMES) {
  test(`${theme}: 행 hover 토큰은 면이 아니라 알파 상태 레이어다`, () => {
    document.documentElement.setAttribute("data-theme", theme);
    const root = getComputedStyle(document.documentElement);
    const hover = root.getPropertyValue("--louis-color-table-row-hover").trim();
    expect(hover, "토큰이 비어 있으면 규칙이 통째로 죽는다").not.toBe("");
    const alpha = alphaOf(hover);
    expect(alpha, `${theme} table-row-hover 는 불투명 면이 아니어야 한다`).toBeGreaterThan(0);
    expect(alpha).toBeLessThan(1);
    // 버튼과 같은 상태 레이어 — ghost hover 와 같은 칸을 문다(DS-D-0065).
    expect(hover).toBe(root.getPropertyValue("--louis-color-accent-ghost-hover").trim());
  });

  for (const floor of FLOORS) {
    test(`${theme} · ${floor} 바닥: 누르는 행은 hover 에서 바닥과 다른 색이 되고 정적 행은 그대로다`, async () => {
      document.documentElement.setAttribute("data-theme", theme);
      const { host, interactive, plain } = mount(floor);
      try {
        const floorColor = getComputedStyle(host).backgroundColor;
        expect(alphaOf(floorColor), `${floor} 는 불투명 바닥이어야 합성이 성립한다`).toBe(1);
        const rest = composite(floorColor, getComputedStyle(interactive).backgroundColor);
        expect(rest).toEqual(composite(floorColor));

        await userEvent.hover(interactive);
        const interactiveRow = interactive.parentElement;
        if (interactiveRow === null) throw new Error("행을 찾지 못했습니다");
        expect(interactiveRow.matches(":hover")).toBe(true);
        expect(getComputedStyle(interactiveRow).cursor).toBe("pointer");
        const hovered = composite(floorColor, getComputedStyle(interactive).backgroundColor);
        // Acceptance 10 — 칠해진 것이 바로 그 토큰이다.
        const token = getComputedStyle(document.documentElement).getPropertyValue("--louis-color-table-row-hover").trim();
        expect(hovered, `${theme} ${floor}: hover 면이 color-table-row-hover 가 아니다`).toEqual(composite(floorColor, token));
        expect(hovered, `${theme} ${floor}: hover 합성색이 바닥과 같다 — 표 위에서 hover 가 사라진다`).not.toEqual(rest);
        // 잉크 방향 — 라이트는 검정 알파라 바닥보다 어둡고, 다크는 흰색 알파라 바닥보다 밝다.
        if (theme === "light") expect(luminance(hovered)).toBeLessThan(luminance(rest));
        else expect(luminance(hovered)).toBeGreaterThan(luminance(rest));

        await userEvent.hover(plain);
        const plainRow = plain.parentElement;
        if (plainRow === null) throw new Error("행을 찾지 못했습니다");
        expect(plainRow.matches(":hover")).toBe(true);
        expect(getComputedStyle(plainRow).cursor).not.toBe("pointer");
        expect(composite(floorColor, getComputedStyle(plain).backgroundColor)).toEqual(rest);
        await userEvent.unhover(plain);
      } finally {
        host.remove();
      }
    });
  }
}
