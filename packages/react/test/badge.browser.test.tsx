// design/components/badge.md의 Acceptance tests를 실제 브라우저에서 검증한다.
//
// 제품에는 배지 정의가 65벌 있고 tone 축이 **죽은 것**이 여럿이다 — 네 톤 클래스의 선언이 바이트
// 단위로 같거나, 네 상태의 색이 전부 같은 변수를 가리킨다. 그래서 이 파일에서 가장 중요한 단언은
// "다섯 tone이 실제로 서로 다른 색을 만든다"이다.
import type { JSX } from "react";
import { expect, test } from "vitest";
import { render } from "vitest-browser-react";
import { Badge, type BadgeTone } from "@klipse-design/react";
import { IconCheckCircle } from "@klipse-design/react/icons";
import measured from "../../../figma/components.measured.json" with { type: "json" };
import "@klipse-design/css/layers.css";
import "@klipse-design/css/tokens.css";
import "@klipse-design/css/styles.css";

const px = (value: string): number => Number.parseFloat(value);
const round = (value: number): number => Math.round(value * 1000) / 1000;
const TRANSPARENT = "rgba(0, 0, 0, 0)";

function find(selector: string): HTMLElement {
  const node = document.querySelector(selector);
  if (node === null) throw new Error(`찾지 못했습니다: ${selector}`);
  return node as HTMLElement;
}

function tokenValue(id: string, property: "background-color" | "color"): string {
  const probe = document.createElement("div");
  probe.style.setProperty(property, `var(--louis-${id})`);
  document.body.append(probe);
  const value =
    property === "color" ? getComputedStyle(probe).color : getComputedStyle(probe).backgroundColor;
  probe.remove();
  return value;
}

const TONES: readonly BadgeTone[] = ["neutral", "success", "warning", "danger", "info"];

test("Badge의 구조값이 components.measured.json과 같다", async () => {
  const spec = measured.components.badge.sizes.base;
  await render(<Badge>완료</Badge>);

  const node = find("span.louis-badge");
  const style = getComputedStyle(node);
  expect(round(node.getBoundingClientRect().height), "height").toBe(spec.height);
  expect(px(style.paddingBlockStart), "paddingBlock").toBe(spec.paddingBlock);
  expect(px(style.paddingInlineStart), "paddingInline").toBe(spec.paddingInline);
  expect(px(style.columnGap), "gap").toBe(spec.gap);
  expect(px(style.borderTopLeftRadius), "radius").toBe(spec.radius);
  expect(px(style.borderTopWidth), "borderWidth").toBe(spec.borderWidth);
  expect(px(style.fontSize), "fontSize").toBe(spec.fontSize);
  expect(round(px(style.lineHeight)), "lineHeight").toBe(spec.lineHeight);
});

test("다섯 tone이 states 표와 같고 서로 다른 색을 만든다", async () => {
  // **제품에서 이 축이 죽어 있던 자리다.** InspectorPill의 네 톤 클래스는 선언이 바이트 단위로
  // 같았고, appHome의 네 상태는 색이 전부 var(--gray-400)였다. 값이 실제로 갈리는지 본다.
  const states = measured.components.badge.states as Record<
    BadgeTone,
    { Default: { background: string; foreground: string } }
  >;
  await render(
    <div>
      {TONES.map((tone) => (
        <Badge key={tone} tone={tone} data-testid={tone}>
          라벨
        </Badge>
      ))}
    </div>,
  );

  const seen = new Map<string, BadgeTone>();
  for (const tone of TONES) {
    const node = find(`[data-testid="${tone}"]`);
    const style = getComputedStyle(node);
    const spec = states[tone].Default;

    expect(node.dataset.tone, `${tone} data-tone`).toBe(tone);
    expect(style.backgroundColor, `${tone} background`).toBe(
      tokenValue(spec.background, "background-color"),
    );
    expect(style.color, `${tone} foreground`).toBe(tokenValue(spec.foreground, "color"));

    const fingerprint = `${style.backgroundColor}|${style.color}`;
    const collision = seen.get(fingerprint);
    expect(collision, `${tone}이 ${collision ?? ""}와 같은 색이다 — tone 축이 죽었다`).toBeUndefined();
    seen.set(fingerprint, tone);
  }
  expect(seen.size, "다섯 tone이 모두 구별된다").toBe(TONES.length);
});

test("대화형이 아니다", async () => {
  // 누를 수 있는 배지가 필요하면 그것은 Button이거나 Chip이며 다른 컴포넌트다.
  await render(<Badge tone="success">완료</Badge>);
  const node = find(".louis-badge");
  expect(node.tagName, "span이다").toBe("SPAN");
  expect(node.getAttribute("tabindex"), "포커스를 받지 않는다").toBeNull();
  expect(node.getAttribute("role"), "role이 없다").toBeNull();
  expect(getComputedStyle(node).cursor, "포인터 커서가 아니다").not.toBe("pointer");
});

test("아이콘과 점이 보조기술에서 숨고 크기가 글자를 따라간다", async () => {
  const spec = measured.components.badge.sizes.base;
  await render(
    <div>
      <Badge tone="success" icon={<IconCheckCircle />} data-testid="with-icon">
        완료
      </Badge>
      <Badge tone="warning" dot data-testid="with-dot">
        대기
      </Badge>
    </div>,
  );

  const icon = find(".louis-badge__icon");
  expect(icon.getAttribute("aria-hidden"), "아이콘은 장식이다").toBe("true");
  // 1em이라 12px 아이콘 토큰을 새로 만들지 않는다.
  expect(round(icon.getBoundingClientRect().width), "아이콘이 글자 크기를 따라간다").toBe(
    spec.fontSize,
  );

  const dot = find(".louis-badge__dot");
  expect(dot.getAttribute("aria-hidden"), "점도 장식이다").toBe("true");
  expect(round(dot.getBoundingClientRect().width), "점은 0.5em").toBe(spec.fontSize / 2);
  expect(getComputedStyle(dot).backgroundColor, "점 색이 글자를 따라간다").toBe(
    getComputedStyle(find('[data-testid="with-dot"]')).color,
  );
});

test("아이콘과 점을 함께 두면 점이 나오지 않는다", async () => {
  // 같은 자리에서 두 신호가 경쟁한다.
  await render(
    <Badge icon={<IconCheckCircle />} dot>
      완료
    </Badge>,
  );
  expect(document.querySelector(".louis-badge__icon"), "아이콘은 있다").not.toBeNull();
  expect(document.querySelector(".louis-badge__dot"), "점은 없다").toBeNull();
});

test("라벨이 길어도 한 줄로 잘린다", async () => {
  // 배지가 두 줄이 되면 그것이 놓인 행의 높이가 흔들린다.
  const spec = measured.components.badge.sizes.base;
  await render(
    <div style={{ inlineSize: "80px" }}>
      <Badge>아주 긴 상태 라벨이 들어온 경우</Badge>
    </div>,
  );
  const node = find(".louis-badge");
  const style = getComputedStyle(node);
  expect(style.whiteSpace, "줄바꿈하지 않는다").toBe("nowrap");
  expect(style.textOverflow, "말줄임").toBe("ellipsis");
  expect(round(node.getBoundingClientRect().height), "높이가 유지된다").toBe(spec.height);
});

test("테두리를 쓰지 않는다", async () => {
  // tone은 면과 글자로만 전달된다. 테두리 축을 열면 tone마다 border 토큰이 필요한데 danger에만
  // 있고 나머지 셋에는 없다.
  await render(<Badge tone="danger">실패</Badge>);
  const style = getComputedStyle(find(".louis-badge"));
  expect(px(style.borderTopWidth), "테두리 두께 0").toBe(0);
  expect(style.borderTopStyle === "none" || style.borderTopColor === TRANSPARENT).toBe(true);
});

export type _EnsureTsx = JSX.Element;
