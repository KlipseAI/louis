// design/components/segmented-control.md의 Acceptance tests를 실제 브라우저에서 검증한다.
//
// 제품에 공용 구현이 **둘** 있는데(SegmentedToggle 컴포넌트 · useSegmentedControlThumb 훅)
// 서로 아무것도 공유하지 않고, 선택을 전달하는 방법도 셋으로 갈린다 — `aria-pressed`,
// **아무것도 없음**(색으로만), `role="tab"`. 그래서 이 파일에서 가장 중요한 단언은 기하가 아니라
// **선택이 보조기술에 실제로 전달되는가**다.
import type { JSX } from "react";
import { useState } from "react";
import axe from "axe-core";
import { expect, test } from "vitest";
import { userEvent } from "vitest/browser";
import { render } from "vitest-browser-react";
import {
  SegmentedControl,
  SegmentedControlItem,
  type SegmentedControlSize,
} from "@klipse-design/react";
import measured from "../../../figma/components.measured.json" with { type: "json" };
import "@klipse-design/css/layers.css";
import "@klipse-design/css/tokens.css";
import "@klipse-design/css/styles.css";

const px = (value: string): number => Number.parseFloat(value);
const round = (value: number): number => Math.round(value * 1000) / 1000;

function find(selector: string): HTMLElement {
  const node = document.querySelector(selector);
  if (node === null) throw new Error(`찾지 못했습니다: ${selector}`);
  return node as HTMLElement;
}

function all(selector: string): HTMLElement[] {
  return Array.from(document.querySelectorAll(selector)) as HTMLElement[];
}

const radios = (): HTMLInputElement[] =>
  all(".kds-segmented-control__input") as HTMLInputElement[];

const tokenPx = (id: string): number =>
  px(getComputedStyle(document.documentElement).getPropertyValue(`--kds-${id}`));

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

// 기본값을 여기서 채운다. `exactOptionalPropertyTypes`가 켜져 있어 `undefined`를 그대로
// 넘기면 타입이 거부한다 — 컴포넌트 쪽을 느슨하게 하는 대신 호출부가 값을 갖는다.
function Fixture({
  size = "md",
  disabled = false,
  itemDisabled = false,
}: {
  size?: SegmentedControlSize;
  disabled?: boolean;
  itemDisabled?: boolean;
}): JSX.Element {
  const [value, setValue] = useState("light");
  return (
    <SegmentedControl
      label="테마"
      size={size}
      value={value}
      onValueChange={setValue}
      disabled={disabled}
    >
      <SegmentedControlItem value="system">시스템</SegmentedControlItem>
      <SegmentedControlItem value="light">라이트</SegmentedControlItem>
      <SegmentedControlItem value="dark" disabled={itemDisabled}>
        다크
      </SegmentedControlItem>
    </SegmentedControl>
  );
}

const SIZES: readonly SegmentedControlSize[] = ["md", "sm"];

for (const size of SIZES) {
  const spec = measured.components["segmented-control"].sizes[size];

  test(`SegmentedControl ${size}의 구조값이 components.measured.json과 같다`, async () => {
    await render(<Fixture size={size} />);

    const track = find(".kds-segmented-control");
    const trackStyle = getComputedStyle(track);
    expect(track.offsetHeight, "trackHeight").toBe(spec.trackHeight);
    expect(px(trackStyle.paddingTop), "trackPadding").toBe(spec.trackPadding);
    expect(px(trackStyle.borderTopLeftRadius), "trackRadius").toBe(spec.trackRadius);
    // 헤어라인은 border가 아니라 inset box-shadow다 (DS-D-0023) — border를 쓰면 세그먼트 높이가
    // DPR에 따라 달라진다. 이전엔 spread-only 바깥 그림자였고 이제 다른 표면과 같은 generic
    // 10% inset 헤어라인이다. 두께 토큰은 여전히 0.5이며 그 값은 선언 토큰으로 본다.
    expect(trackStyle.borderTopWidth, "border 제거").toBe("0px");
    expect(trackStyle.boxShadow, "inset 헤어라인").toContain("inset");
    expect(trackStyle.boxShadow, "헤어라인 색").toContain(
      tokenValue("color-stroke-hairline", "color"),
    );
    expect(tokenPx("border-width-hairline"), "borderWidth").toBe(spec.borderWidth);

    const segment = find(".kds-segmented-control__segment");
    const segmentStyle = getComputedStyle(segment);
    expect(segment.offsetHeight, "segmentHeight").toBe(spec.segmentHeight);
    expect(px(segmentStyle.borderTopLeftRadius), "segmentRadius").toBe(spec.segmentRadius);
    expect(px(segmentStyle.paddingInlineStart), "segmentPaddingInline").toBe(
      spec.segmentPaddingInline,
    );
    expect(px(segmentStyle.columnGap), "segmentGap").toBe(spec.segmentGap);
    expect(px(segmentStyle.fontSize), "fontSize").toBe(spec.fontSize);
    expect(round(px(segmentStyle.lineHeight)), "lineHeight").toBe(spec.lineHeight);
  });
}

test("세그먼트 반경이 바깥 반경에서 padding을 뺀 값이다", async () => {
  // 중첩한 모서리가 어긋나지 않으려면 안쪽 = 바깥 − padding이어야 한다. 두 값이 따로 움직이면
  // 선택 면의 모서리가 트랙 모서리를 뚫거나 안쪽으로 밀린다.
  await render(<Fixture />);
  const track = getComputedStyle(find(".kds-segmented-control"));
  const segment = getComputedStyle(find(".kds-segmented-control__segment"));
  expect(px(segment.borderTopLeftRadius)).toBe(
    px(track.borderTopLeftRadius) - px(track.paddingTop),
  );
});

test("states 표가 코드와 같다", async () => {
  const spec = measured.components["segmented-control"].states.base;
  await render(<Fixture />);
  const segments = all(".kds-segmented-control__segment");
  const [system, light] = segments;

  // 비선택은 트랙 색을 그대로 보인다 — 자기 면을 칠하지 않는다.
  expect(getComputedStyle(system!).backgroundColor, "Default background").toBe(
    "rgba(0, 0, 0, 0)",
  );
  expect(getComputedStyle(system!).color, "Default foreground").toBe(
    tokenValue(spec.Default.foreground, "color"),
  );

  expect(getComputedStyle(light!).backgroundColor, "Selected background").toBe(
    tokenValue(spec.Selected.background as string, "background-color"),
  );
  expect(getComputedStyle(light!).color, "Selected foreground").toBe(
    tokenValue(spec.Selected.foreground, "color"),
  );

  await userEvent.hover(system!);
  expect(getComputedStyle(system!).color, "Hover foreground").toBe(
    tokenValue(spec.Hover.foreground, "color"),
  );
  // 포인터를 치운다. 얹은 채로 두면 뒤에 같은 좌표에 렌더되는 요소가 :hover를 받는다.
  await userEvent.unhover(system!);
});

test("트랙 면과 선택 면이 두 테마 모두에서 서로 다르다", async () => {
  // **이것이 이 컴포넌트에서 가장 잘 깨지는 축이다.** 다크에서 inset·surface·menu·overlay
  // 넷이 같은 색이고 라이트에서 raised·overlay·surface 셋이 같다. 짝을 잘못 고르면 한 테마에서
  // 선택이 통째로 사라지는데 선언은 정상이라 다른 어떤 게이트도 잡지 못한다.
  await render(<Fixture />);
  for (const theme of ["light", "dark"] as const) {
    document.documentElement.setAttribute("data-theme", theme);
    const track = getComputedStyle(find(".kds-segmented-control")).backgroundColor;
    const selected = getComputedStyle(
      find('.kds-segmented-control__segment[data-selected="true"]'),
    ).backgroundColor;
    expect(selected, `${theme}에서 선택 면이 트랙 면과 같습니다`).not.toBe(track);
  }
  document.documentElement.removeAttribute("data-theme");
});

test("선택이 색이 아니라 radio 상태로 전달된다", async () => {
  // 제품 B 계열은 선택을 색으로만 전달하고 aria가 아예 없다. 색각 이상과 스크린 리더 양쪽에서
  // 현재 값이 사라진다.
  await render(<Fixture />);
  const [system, light, dark] = radios();
  expect(system!.checked, "system").toBe(false);
  expect(light!.checked, "light").toBe(true);
  expect(dark!.checked, "dark").toBe(false);
  expect(light!.type, "네이티브 radio다").toBe("radio");
});

test("그룹 이름이 legend이고 화면에서는 숨겨진다", async () => {
  await render(<Fixture />);
  const legend = find(".kds-segmented-control__legend");
  expect(legend.tagName, "legend 요소다").toBe("LEGEND");
  expect(legend.textContent, "그룹 이름").toBe("테마");
  // 숨겨졌지만 지워지지는 않았다. 지우면 스크린 리더가 "3 중 1"만 읽고 무엇을 고르는지 모른다.
  expect(legend.offsetWidth, "화면에서는 1px 이하다").toBeLessThanOrEqual(1);
});

test("방향키가 값을 옮기고 끝에서 되돈다", async () => {
  await render(<Fixture />);
  const [system, light, dark] = radios();
  light!.focus();

  await userEvent.keyboard("{ArrowRight}");
  expect(dark!.checked, "오른쪽").toBe(true);

  // 네이티브 radio 그룹은 끝에서 처음으로 되돈다. 직접 만들면 이 동작을 빠뜨리기 쉽다.
  await userEvent.keyboard("{ArrowRight}");
  expect(system!.checked, "끝에서 되돈다").toBe(true);

  await userEvent.keyboard("{ArrowLeft}");
  expect(dark!.checked, "왼쪽으로 되돈다").toBe(true);
});

test("컨트롤이 둘이면 radio 그룹이 섞이지 않는다", async () => {
  await render(
    <>
      <Fixture />
      <Fixture />
    </>,
  );
  const names = new Set(radios().map((radio) => radio.name));
  expect(names.size, "그룹 이름이 둘이다").toBe(2);

  // 이름이 겹치면 한쪽을 고르는 순간 다른 쪽 선택이 풀린다.
  const checked = radios().filter((radio) => radio.checked);
  expect(checked, "각 컨트롤이 자기 선택을 갖는다").toHaveLength(2);
});

test("클릭이 값을 바꾸고 이전 선택이 풀린다", async () => {
  await render(<Fixture />);
  const segments = all(".kds-segmented-control__segment");
  await userEvent.click(segments[2]!);

  expect(radios()[2]!.checked, "누른 것이 선택된다").toBe(true);
  expect(segments[2]!.dataset.selected, "선택 표시").toBe("true");
  expect(segments[1]!.dataset.selected, "이전 선택이 풀린다").toBe("false");
});

test("포커스 링을 라벨이 받고 키보드에서만 나타난다", async () => {
  await render(
    <>
      <button type="button">앞</button>
      <Fixture />
    </>,
  );
  const segments = all(".kds-segmented-control__segment");
  const selected = segments[1]!;

  await userEvent.click(selected);
  expect(getComputedStyle(selected).outlineStyle, "포인터 클릭에는 링이 없다").toBe("none");

  find("button").focus();
  await userEvent.tab();
  // Tab은 그룹의 선택된 radio로 들어온다.
  expect(radios()[1]!.matches(":focus-visible"), "키보드 포커스다").toBe(true);
  const style = getComputedStyle(selected);
  expect(style.outlineStyle, "라벨이 링을 받는다").toBe("solid");
  expect(px(style.outlineWidth), "링 두께가 border-width-ring이다").toBe(
    tokenPx("border-width-ring"),
  );
});

test("그룹 disabled가 항목 전부를 막는다", async () => {
  await render(<Fixture disabled />);
  const segments = all(".kds-segmented-control__segment");
  // **`input.disabled`가 아니라 `:disabled`를 본다.** IDL 속성은 콘텐츠 속성만 반영하므로
  // fieldset이 끈 상태에서도 false다. 실제로 꺼졌는지는 의사 클래스만 안다 — CSS도 그것을 쓴다.
  expect(
    radios().every((radio) => radio.matches(":disabled")),
    "fieldset disabled가 자손 입력에 내려간다",
  ).toBe(true);
  expect(radios()[0]!.disabled, "IDL 속성은 그대로 false다").toBe(false);
  expect(getComputedStyle(segments[0]!).color, "Disabled foreground").toBe(
    tokenValue(
      measured.components["segmented-control"].states.base.Disabled.foreground,
      "color",
    ),
  );

  await userEvent.click(segments[2]!, { force: true });
  expect(radios()[2]!.checked, "값이 바뀌지 않는다").toBe(false);
});

test("항목 하나만 비활성할 수 있다", async () => {
  await render(<Fixture itemDisabled />);
  const [system, , dark] = radios();
  expect(dark!.disabled, "그 항목만 비활성").toBe(true);
  expect(system!.disabled, "나머지는 살아 있다").toBe(false);
});

test("접근성 위반이 없다", async () => {
  for (const size of SIZES) {
    const host = document.createElement("div");
    document.body.append(host);
    try {
      await render(<Fixture size={size} />, { container: host });
      const results = await axe.run(host, {
        runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag22aa"] },
      });
      expect(
        results.violations.map((violation) => violation.id).sort(),
        `${size}에서 접근성 위반이 있습니다`,
      ).toEqual([]);
    } finally {
      host.remove();
    }
  }
});

export type _EnsureTsx = JSX.Element;
