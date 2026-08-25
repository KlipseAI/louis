// design/components/avatar.md의 Acceptance tests를 실제 브라우저에서 검증한다.
//
// 제품에 공용 구현이 **부분만** 있다(기본 아바타 SVG 하나). 본체는 셸 파일에 인라인이라
// 대조할 바깥 기준이 크기 두 값뿐이고, 나머지는 이 파일이 고정한다.
import type { JSX } from "react";
import axe from "axe-core";
import { expect, test } from "vitest";
import { userEvent } from "vitest/browser";
import { render } from "vitest-browser-react";
import { Avatar, type AvatarSize } from "@klipse-design/react";
import measured from "../../../figma/components.measured.json" with { type: "json" };
import "@klipse-design/css/layers.css";
import "@klipse-design/css/tokens.css";
import "@klipse-design/css/styles.css";

const px = (value: string): number => Number.parseFloat(value);
const states = measured.components.avatar.states.base;

// **마지막으로 렌더된 무리만 본다.** 앞 테스트가 남긴 DOM이 있으면 첫 요소가 다른 렌더를
// 가리킨다 — hosted CI가 selectable-list-row에서 그 함정을 잡았다.
function scope(): ParentNode {
  const groups = document.querySelectorAll("[data-louis-fixture]");
  return groups.length > 0 ? groups[groups.length - 1]! : document;
}
function find(selector: string): HTMLElement {
  const node = scope().querySelector(selector);
  if (node === null) throw new Error(`찾지 못했습니다: ${selector}`);
  return node as HTMLElement;
}
const avatar = (): HTMLElement => find(".louis-avatar");

function tokenValue(id: string, property: "background-color" | "color"): string {
  const probe = document.createElement("div");
  probe.style.setProperty(property, `var(--louis-${id})`);
  document.body.append(probe);
  const value =
    property === "color" ? getComputedStyle(probe).color : getComputedStyle(probe).backgroundColor;
  probe.remove();
  return value;
}

const SIZES: readonly AvatarSize[] = ["md", "sm"];

for (const size of SIZES) {
  const spec = measured.components.avatar.sizes[size];

  test(`Avatar ${size}의 구조값이 components.measured.json과 같다`, async () => {
    await render(
      <div data-louis-fixture>
        <Avatar size={size} name="기세준" />
      </div>,
    );
    const node = avatar();
    expect(node.offsetWidth, "size").toBe(spec.size);
    expect(node.offsetHeight, "size").toBe(spec.size);
    // 원이다. 정사각이므로 반경이 변의 절반 이상이면 원이 된다.
    expect(px(getComputedStyle(node).borderTopLeftRadius), "radius").toBeGreaterThanOrEqual(
      spec.size / 2,
    );
  });
}

test("states 표가 코드와 같다", async () => {
  await render(
    <div data-louis-fixture>
      <Avatar name="기세준" />
    </div>,
  );
  const node = avatar();
  // 포인터를 먼저 치운다. 앞 테스트가 얹어 둔 포인터가 같은 좌표에 남으면 :hover가 샌다.
  await userEvent.unhover(node);
  expect(getComputedStyle(node).backgroundColor, "Default background").toBe(
    tokenValue(states.Default.background, "background-color"),
  );
  expect(getComputedStyle(node).color, "Default foreground").toBe(
    tokenValue(states.Default.foreground, "color"),
  );
});

test("src가 없으면 폴백 글리프를 그린다", async () => {
  await render(
    <div data-louis-fixture>
      <Avatar name="기세준" />
    </div>,
  );
  expect(find(".louis-avatar__fallback").tagName.toLowerCase(), "svg다").toBe("svg");
  expect(scope().querySelector(".louis-avatar__image"), "이미지는 없다").toBeNull();
});

test("src가 있으면 이미지를 그리고 원을 채운다", async () => {
  await render(
    <div data-louis-fixture>
      <Avatar name="기세준" src="data:image/gif;base64,R0lGODlhAQABAAAAACw=" />
    </div>,
  );
  const img = find(".louis-avatar__image") as HTMLImageElement;
  // 비율이 맞지 않아도 원을 채운다 — 여백이 생기면 원이 깨져 보인다.
  expect(getComputedStyle(img).objectFit, "cover").toBe("cover");
  expect(scope().querySelector(".louis-avatar__fallback"), "폴백은 없다").toBeNull();
});

test("이름이 있으면 접근성 이름을 갖고, 이미지가 그것을 두 번 읽지 않는다", async () => {
  await render(
    <div data-louis-fixture>
      <Avatar name="기세준" src="data:image/gif;base64,R0lGODlhAQABAAAAACw=" />
    </div>,
  );
  const node = avatar();
  expect(node.getAttribute("role"), "img 역할").toBe("img");
  expect(node.getAttribute("aria-label"), "이름").toBe("기세준");
  // 바깥이 이름을 가지므로 안의 img는 비어 있어야 한다. 둘 다 가지면 같은 이름이 두 번 들린다.
  expect((find(".louis-avatar__image") as HTMLImageElement).alt, "alt는 비운다").toBe("");
});

test("이름이 없으면 장식으로 숨는다", async () => {
  // 옆에 이름이 이미 적혀 있는 자리(목록 행, 댓글 머리)가 그렇다.
  await render(
    <div data-louis-fixture>
      <Avatar />
    </div>,
  );
  const node = avatar();
  expect(node.getAttribute("aria-hidden"), "숨는다").toBe("true");
  expect(node.getAttribute("role"), "역할 없음").toBeNull();
  expect(node.getAttribute("aria-label"), "이름 없음").toBeNull();
});

test("링을 그리지 않는다", async () => {
  // 제품은 프로필 트리거에 진행률 링을 겹치지만 그것은 이 컴포넌트의 축이 아니다.
  // 누군가 링을 여기에 넣으면 (1c)의 미결 판정이 API로 새어 들어온다.
  await render(
    <div data-louis-fixture>
      <Avatar name="기세준" />
    </div>,
  );
  const style = getComputedStyle(avatar());
  expect(style.borderTopWidth, "테두리 없음").toBe("0px");
  expect(style.boxShadow, "그림자 없음").toBe("none");
  expect(getComputedStyle(avatar(), "::after").content, "덧그린 층 없음").toBe("none");
});

test("접근성 위반이 없다", async () => {
  const host = document.createElement("div");
  document.body.append(host);
  try {
    await render(
      <div data-louis-fixture>
        <Avatar name="기세준" />
        <Avatar name="기세준" src="data:image/gif;base64,R0lGODlhAQABAAAAACw=" />
        <Avatar />
        <Avatar size="sm" name="작은 아바타" />
      </div>,
      { container: host },
    );
    const results = await axe.run(host, {
      runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag22aa"] },
    });
    expect(results.violations.map((v) => v.id).sort(), "접근성 위반").toEqual([]);
  } finally {
    host.remove();
  }
});

export type _EnsureTsx = JSX.Element;
