// design/components/selectable-list-row.md의 Acceptance tests를 실제 브라우저에서 검증한다.
//
// **선택은 면 하나가 갖는다(DS-D-0070)** — SidebarNavItem과 같은 방식이다. 예전에는 다크에서
// background-inset이 surface와 같은 색이라 3px 선행 표식을 함께 그렸다. 지금 inset은 canvas와 같고
// 올라온 면들과는 갈리므로, 이 파일에서 가장 중요한 단언은 "올라온 면 위에서 선택 면이 보이는가"다.
import type { JSX } from "react";
import { useState } from "react";
import axe from "axe-core";
import { expect, test } from "vitest";
import { userEvent } from "vitest/browser";
import { render } from "vitest-browser-react";
import { SelectableListRow } from "@klipse-design/react";
import measured from "../../../figma/components.measured.json" with { type: "json" };
import "@klipse-design/css/layers.css";
import "@klipse-design/css/tokens.css";
import "@klipse-design/css/styles.css";

const px = (value: string): number => Number.parseFloat(value);
const round = (value: number): number => Math.round(value * 1000) / 1000;
const spec = measured.components["selectable-list-row"].sizes.base;
const states = measured.components["selectable-list-row"].states.base;

// **`document` 전체를 훑지 않는다.** 같은 파일의 앞 테스트가 남긴 DOM이 있으면 인덱스가 밀려
// `[0]`이 다른 렌더의 행을 가리킨다. hosted CI가 그것을 잡았고(2026-08-18, browser-reduced-motion
// project), **로컬에서 세 번 관측된 간헐 실패의 정체가 이것이었다** — 순서에 따라 나기도 하고
// 안 나기도 해서 로컬에서는 재현되지 않았다. 항상 **마지막으로 렌더된 무리**만 본다.
function scope(): ParentNode {
  const groups = document.querySelectorAll("[data-louis-fixture]");
  return groups.length > 0 ? groups[groups.length - 1]! : document;
}

function find(selector: string): HTMLElement {
  const node = scope().querySelector(selector);
  if (node === null) throw new Error(`찾지 못했습니다: ${selector}`);
  return node as HTMLElement;
}

const all = (selector: string): HTMLElement[] =>
  Array.from(scope().querySelectorAll(selector)) as HTMLElement[];

const row = (): HTMLButtonElement => find("button.louis-selectable-list-row") as HTMLButtonElement;

const tokenPx = (id: string): number =>
  px(getComputedStyle(document.documentElement).getPropertyValue(`--louis-${id}`));

function tokenValue(id: string, property: "background-color" | "color"): string {
  const probe = document.createElement("div");
  probe.style.setProperty(property, `var(--louis-${id})`);
  document.body.append(probe);
  const value =
    property === "color"
      ? getComputedStyle(probe).color
      : getComputedStyle(probe).backgroundColor;
  probe.remove();
  return value;
}

const TRANSPARENT = "rgba(0, 0, 0, 0)";

function Fixture({ selected = 0 }: { selected?: number }): JSX.Element {
  return (
    <div data-louis-fixture style={{ inlineSize: 320 }}>
      {["첫 클립", "둘째 클립", "셋째 클립"].map((label, index) => (
        <SelectableListRow
          key={label}
          selected={index === selected}
          title={label}
          meta={`00:0${index} · 12초`}
          trailing={<span>{index + 1}</span>}
        />
      ))}
    </div>
  );
}

test("구조값이 components.measured.json과 같다", async () => {
  await render(<Fixture />);
  const style = getComputedStyle(row());
  expect(px(style.paddingTop), "padding").toBe(spec.padding);
  expect(px(style.columnGap), "gap").toBe(spec.gap);
  expect(px(style.borderTopLeftRadius), "radius").toBe(spec.radius);
  expect(px(style.fontSize), "titleFontSize").toBe(spec.titleFontSize);
  expect(round(px(style.lineHeight)), "titleLineHeight").toBe(spec.titleLineHeight);

  const meta = getComputedStyle(find(".louis-selectable-list-row__meta"));
  expect(px(meta.fontSize), "metaFontSize").toBe(spec.metaFontSize);
  expect(round(px(meta.lineHeight)), "metaLineHeight").toBe(spec.metaLineHeight);
  expect(px(getComputedStyle(find(".louis-selectable-list-row__text")).rowGap), "textGap").toBe(
    spec.textGap,
  );
});

test("states 표가 코드와 같다", async () => {
  await render(<Fixture />);
  const [selected, plain] = all("button.louis-selectable-list-row");

  // **포인터를 먼저 치운다.** 앞 테스트가 얹어 둔 포인터가 같은 좌표에 남아 있으면 새로 렌더된
  // 행이 그 자리에서 :hover를 받는다 — hosted CI가 그 상태를 결정적으로 재현했고(2026-08-18)
  // 받은 값이 `#171b22 / 0.08`, 곧 `color-accent-ghost-hover`였다. 로컬은 포인터 위치가 달라
  // 재현되지 않는다. surface-states 테스트가 같은 함정을 이미 기록해 두었다.
  await userEvent.unhover(plain!);
  expect(getComputedStyle(plain!).backgroundColor, "Default background").toBe(TRANSPARENT);
  expect(getComputedStyle(plain!).color, "Default foreground").toBe(
    tokenValue(states.Default.foreground, "color"),
  );

  expect(getComputedStyle(selected!).backgroundColor, "Selected background").toBe(
    tokenValue(states.Selected.background as string, "background-color"),
  );
  expect(getComputedStyle(selected!).color, "Selected foreground").toBe(
    tokenValue(states.Selected.foreground, "color"),
  );

  await userEvent.hover(plain!);
  expect(getComputedStyle(plain!).backgroundColor, "Hover background").toBe(
    tokenValue(states.Hover.background as string, "background-color"),
  );
  expect(getComputedStyle(plain!).color, "Hover foreground").toBe(
    tokenValue(states.Hover.foreground, "color"),
  );
  await userEvent.unhover(plain!);
});

test("올라온 면 위에서 선택 면이 배경과 갈린다 — 표면, 올라온 면, 메뉴, 오버레이", async () => {
  // **선택은 면 하나가 갖는다(DS-D-0070).** 예전에는 다크에서 background-inset이 surface와 같은 색이라
  // 3px 선행 표식을 함께 그렸다. 다크 사다리가 바뀐 지금 inset은 canvas와 같은 값이고 올라온 면들과는
  // 갈린다 — 이 단언이 그 사실을 지킨다. 사다리가 다시 바뀌어 면이 같아지면 여기서 걸린다.
  const floors = ["color-bg-surface", "color-bg-raised", "color-bg-menu", "color-bg-overlay"] as const;
  await render(
    <div data-louis-fixture>
      {floors.map((floor) => (
        <div key={floor} data-floor={floor} style={{ inlineSize: 320, background: `var(--louis-${floor})` }}>
          <SelectableListRow selected title="선택됨" />
        </div>
      ))}
    </div>,
  );

  for (const theme of ["light", "dark"] as const) {
    document.documentElement.setAttribute("data-theme", theme);
    for (const floor of floors) {
      const host = find(`[data-floor="${floor}"]`);
      const selected = host.querySelector("button.louis-selectable-list-row") as HTMLElement;
      expect(getComputedStyle(selected).backgroundColor, `${theme}에서 ${floor} 위 선택 면`).not.toBe(
        getComputedStyle(host).backgroundColor,
      );
    }
  }
  document.documentElement.removeAttribute("data-theme");
});

test("선행 표식이 없다 — 선택한 행과 선택하지 않은 행 모두", async () => {
  // 소유자가 왼쪽 막대를 거부했고(DS-D-0070) 제품의 선택 행 셋도 표식을 보이지 않았다.
  await render(<Fixture selected={0} />);
  const [selected, plain] = all("button.louis-selectable-list-row");
  expect(getComputedStyle(selected!, "::before").content, "선택한 행").toBe("none");
  expect(getComputedStyle(plain!, "::before").content, "선택하지 않은 행").toBe("none");
});

test("선택을 aria-current가 소유한다", async () => {
  // 시각 전용 속성을 두면 화면에는 선택으로 보이는데 보조기술에는 아무것도 전달되지 않는다.
  // SidebarNavItem과 같은 판정이다.
  await render(<Fixture selected={1} />);
  const rows = all("button.louis-selectable-list-row");
  expect(rows[1]!.getAttribute("aria-current"), "선택된 행").toBe("true");
  expect(rows[0]!.getAttribute("aria-current"), "나머지").toBeNull();
  expect(rows.filter((r) => r.getAttribute("aria-current") === "true"), "하나만").toHaveLength(1);
});

test("행 전체가 버튼이고 클릭이 한 번만 실행된다", async () => {
  let count = 0;
  await render(<div data-louis-fixture><SelectableListRow title="클립" meta="12초" onClick={() => (count += 1)} /></div>);
  const button = row();
  expect(button.tagName, "button 요소다").toBe("BUTTON");
  expect(button.type, "제출이 아니다").toBe("button");

  // 제목·보조 문구·후행 슬롯 어디를 눌러도 행이 받는다.
  await userEvent.click(find(".louis-selectable-list-row__meta"));
  expect(count, "한 번만").toBe(1);
});

test("긴 제목이 줄바꿈이 아니라 말줄임으로 줄어든다", async () => {
  // 행 높이가 항목마다 달라지면 목록이 튄다.
  await render(
    <div data-louis-fixture style={{ inlineSize: 200 }}>
      <SelectableListRow
        title="아주 아주 아주 긴 클립 제목이 들어오는 경우"
        meta="아주 아주 긴 보조 문구도 마찬가지다"
      />
    </div>,
  );
  const title = find(".louis-selectable-list-row__title");
  const meta = find(".louis-selectable-list-row__meta");
  expect(getComputedStyle(title).textOverflow, "제목").toBe("ellipsis");
  expect(title.scrollWidth, "제목이 실제로 잘린다").toBeGreaterThan(title.clientWidth);
  expect(title.offsetHeight, "제목이 한 줄이다").toBeLessThanOrEqual(spec.titleLineHeight + 1);
  expect(getComputedStyle(meta).textOverflow, "보조 문구").toBe("ellipsis");
});

test("선택된 행에서도 보조 문구가 한 단계 낮게 남는다", async () => {
  await render(<div data-louis-fixture><SelectableListRow selected title="제목" meta="보조" /></div>);
  const titleColor = getComputedStyle(row()).color;
  const metaColor = getComputedStyle(find(".louis-selectable-list-row__meta")).color;
  expect(metaColor, "둘이 같으면 위계가 사라진다").not.toBe(titleColor);
  expect(metaColor).toBe(tokenValue("color-fg-secondary", "color"));
});

test("disabled면 클릭이 실행되지 않고 hover가 면을 칠하지 않는다", async () => {
  let count = 0;
  await render(<div data-louis-fixture><SelectableListRow title="비활성" disabled onClick={() => (count += 1)} /></div>);
  const button = row();
  await userEvent.click(button, { force: true });
  expect(count, "실행 안 됨").toBe(0);
  expect(getComputedStyle(button).color, "Disabled foreground").toBe(
    tokenValue(states.Disabled.foreground, "color"),
  );

  await userEvent.hover(button);
  expect(getComputedStyle(button).backgroundColor, "hover가 칠하지 않는다").toBe(TRANSPARENT);
  await userEvent.unhover(button);
});

test("포커스 링이 키보드에서만 나타난다", async () => {
  await render(
    <div data-louis-fixture>
      <button type="button">앞</button>
      <SelectableListRow title="포커스" />
    </div>,
  );
  const button = row();

  await userEvent.click(button);
  expect(button.matches(":focus-visible"), "포인터 클릭에는 링이 없다").toBe(false);

  find("button").focus();
  await userEvent.tab();
  expect(document.activeElement, "Tab이 들어온다").toBe(button);
  const style = getComputedStyle(button);
  expect(style.outlineStyle, "링 있음").toBe("solid");
  expect(px(style.outlineWidth), "두께가 border-width-ring").toBe(tokenPx("border-width-ring"));
});

test("목록을 방향키가 아니라 Tab이 훑는다", async () => {
  // 행이 버튼이므로 각각이 탭 순서에 있다. roving focus를 흉내 내지 않는다 —
  // 그것은 listbox의 계약이고 이 컴포넌트는 버튼 목록이다.
  await render(<Fixture />);
  const rows = all("button.louis-selectable-list-row");
  rows[0]!.focus();
  await userEvent.tab();
  expect(document.activeElement, "다음 행으로 간다").toBe(rows[1]);
});

test("접근성 위반이 없다", async () => {
  const host = document.createElement("div");
  document.body.append(host);
  try {
    function Interactive(): JSX.Element {
      const [selected, setSelected] = useState(0);
      return (
        <div data-louis-fixture style={{ inlineSize: 320 }}>
          {["첫", "둘", "셋"].map((label, index) => (
            <SelectableListRow
              key={label}
              selected={index === selected}
              title={label}
              meta="12초"
              onClick={() => setSelected(index)}
            />
          ))}
        </div>
      );
    }
    await render(<Interactive />, { container: host });
    const results = await axe.run(host, {
      runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag22aa"] },
    });
    expect(results.violations.map((v) => v.id).sort(), "접근성 위반").toEqual([]);
  } finally {
    host.remove();
  }
});

export type _EnsureTsx = JSX.Element;
