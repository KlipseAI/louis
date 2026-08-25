// figma/components.measured.json의 states 표를 코드가 실제로 만드는지 검증한다.
//
// **색 이름을 역조회하지 않는다.** 같은 값을 갖는 토큰이 여럿 있어서(light에서
// color-bg-surface와 color-fg-inverse가 둘 다 neutral-0) 계산색 → 이름 역조회는
// 나중에 넣은 쪽으로 붙는다. 실제로 그렇게 잘못 읽은 적이 있다. 대신 **기대 토큰의 계산값**을
// probe로 얻어 값끼리 비교한다.
import type { JSX } from "react";
import { expect, test } from "vitest";
import { userEvent } from "vitest/browser";
import { render } from "vitest-browser-react";
import { Button, IconButton } from "@klipse-design/react";
import { IconTrashSimple } from "@klipse-design/react/icons";
import measured from "../../../figma/components.measured.json" with { type: "json" };
import "@klipse-design/css/layers.css";
import "@klipse-design/css/tokens.css";
import "@klipse-design/css/styles.css";

type Paint = { background: string | null; foreground: string; border?: string };
type Variant = "primary" | "secondary" | "ghost" | "danger";

const VARIANTS: readonly Variant[] = ["primary", "secondary", "ghost", "danger"];
const TRANSPARENT = "rgba(0, 0, 0, 0)";

/** 토큰의 계산값을 얻는다. 이름이 아니라 값으로 비교하기 위한 것이다. */
function tokenValue(id: string, property: "background-color" | "color"): string {
  const probe = document.createElement("div");
  probe.style.setProperty(property, `var(--kds-${id})`);
  document.body.append(probe);
  const value =
    property === "color"
      ? getComputedStyle(probe).color
      : getComputedStyle(probe).backgroundColor;
  probe.remove();
  return value;
}

function assertPaint(node: Element, expected: Paint, label: string): void {
  const style = getComputedStyle(node);
  const wantBackground =
    expected.background === null
      ? TRANSPARENT
      : tokenValue(expected.background, "background-color");
  expect(style.backgroundColor, `${label} background`).toBe(wantBackground);
  expect(style.color, `${label} foreground`).toBe(tokenValue(expected.foreground, "color"));
  if (expected.border !== undefined) {
    if (expected.border === "color-stroke-hairline") {
      // DS-D-0023: 일반 stroke는 border가 아니라 generic 헤어라인 inset이다.
      expect(style.borderTopWidth, `${label} border 제거`).toBe("0px");
      expect(style.boxShadow, `${label} 헤어라인`).toContain("inset");
      expect(style.boxShadow, `${label} 헤어라인 색`).toContain(
        tokenValue("color-stroke-hairline", "color"),
      );
    } else {
      expect(style.borderTopColor, `${label} border`).toBe(tokenValue(expected.border, "color"));
    }
  }
}

const iconStates = measured.components["icon-button"].states as Record<
  Variant,
  Record<string, Paint>
>;
const buttonStates = measured.components.button.states as Record<Variant, Record<string, Paint>>;

for (const variant of VARIANTS) {
  test(`IconButton ${variant}의 상태별 토큰이 states 표와 같다`, async () => {
    const spec = iconStates[variant];

    // Default / Pressed / Disabled — prop으로 도달한다.
    for (const [state, props] of [
      ["Default", {}],
      ["Pressed", { pressed: true }],
      ["Disabled", { disabled: true }],
    ] as const) {
      const host = document.createElement("div");
      document.body.append(host);
      try {
        await render(
          <IconButton variant={variant} label="a" {...props}>
            <IconTrashSimple />
          </IconButton>,
          { container: host },
        );
        const node = host.querySelector("button.kds-icon-button");
        if (node === null) throw new Error("IconButton을 찾지 못했습니다");
        const expected = spec[state];
        if (expected === undefined) throw new Error(`states 표에 ${state}가 없습니다`);
        assertPaint(node, expected, `${variant}/${state}`);
      } finally {
        host.remove();
      }
    }

    // Hover — 포인터로만 도달한다.
    const host = document.createElement("div");
    document.body.append(host);
    try {
      await render(
        <IconButton variant={variant} label="a">
          <IconTrashSimple />
        </IconButton>,
        { container: host },
      );
      const node = host.querySelector("button.kds-icon-button");
      if (node === null) throw new Error("IconButton을 찾지 못했습니다");
      await userEvent.hover(node);
      const expected = spec.Hover;
      if (expected === undefined) throw new Error("states 표에 Hover가 없습니다");
      assertPaint(node, expected, `${variant}/Hover`);
      // **포인터를 치운다.** 얹은 채로 두면 뒤에 같은 좌표에 렌더되는 요소가 :hover를 받아
      // Default를 재는 단언이 간헐적으로 hover 값을 읽는다 — 실제로 그렇게 실패했다.
      await userEvent.unhover(node);
    } finally {
      host.remove();
    }
  });
}

for (const variant of VARIANTS) {
  test(`Button ${variant}의 상태별 토큰이 states 표와 같다`, async () => {
    const spec = buttonStates[variant];

    for (const [state, props] of [
      ["Default", {}],
      ["Disabled", { disabled: true }],
      ["Loading", { loading: true }],
    ] as const) {
      const host = document.createElement("div");
      document.body.append(host);
      try {
        await render(
          <Button variant={variant} {...props}>
            저장
          </Button>,
          { container: host },
        );
        const node = host.querySelector("button.kds-button");
        if (node === null) throw new Error("Button을 찾지 못했습니다");
        const expected = spec[state];
        if (expected === undefined) throw new Error(`states 표에 ${state}가 없습니다`);
        assertPaint(node, expected, `${variant}/${state}`);
      } finally {
        host.remove();
      }
    }

    const host = document.createElement("div");
    document.body.append(host);
    try {
      await render(<Button variant={variant}>저장</Button>, { container: host });
      const node = host.querySelector("button.kds-button");
      if (node === null) throw new Error("Button을 찾지 못했습니다");
      await userEvent.hover(node);
      const expected = spec.Hover;
      if (expected === undefined) throw new Error("states 표에 Hover가 없습니다");
      assertPaint(node, expected, `${variant}/Hover`);
      await userEvent.unhover(node);
    } finally {
      host.remove();
    }
  });
}

test("states 표가 Figma set의 State 축을 빠짐없이 덮는다", () => {
  // 표에 없는 상태를 Figma가 갖고 있으면 그 상태의 색은 아무도 검증하지 않는다.
  const expectations: Readonly<Record<string, readonly string[]>> = {
    "icon-button": ["Default", "Hover", "Active", "Pressed", "Disabled"],
    button: ["Default", "Hover", "Active", "Disabled", "Loading"],
  };
  for (const [component, states] of Object.entries(expectations)) {
    const table = (
      component === "button" ? buttonStates : iconStates
    ) as Record<Variant, Record<string, Paint>>;
    for (const variant of VARIANTS) {
      expect(Object.keys(table[variant]).sort(), `${component}/${variant}`).toEqual(
        [...states].sort(),
      );
    }
  }
});

export type _EnsureTsx = JSX.Element;
