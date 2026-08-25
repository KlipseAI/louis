// design/components/empty-state.md의 Acceptance tests를 실제 브라우저에서 검증한다.
//
// 제품에 정의가 9벌 있고 서로 거의 합의하지 않는다. 아홉 벌이 동의하는 유일한 것은
// "자기 배경도 테두리도 반경도 갖지 않는다"이며, 그것이 이 파일에서 가장 중요한 단언이다.
import type { JSX } from "react";
import { expect, test } from "vitest";
import { render } from "vitest-browser-react";
import { Button, EmptyState } from "@klipse-design/react";
import { IconFolder } from "@klipse-design/react/icons";
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

function tokenValue(id: string): string {
  const probe = document.createElement("div");
  probe.style.setProperty("color", `var(--kds-${id})`);
  document.body.append(probe);
  const value = getComputedStyle(probe).color;
  probe.remove();
  return value;
}

test("EmptyState의 구조값이 components.measured.json과 같다", async () => {
  const spec = measured.components["empty-state"].sizes.base;
  await render(
    <div style={{ inlineSize: "640px" }}>
      <EmptyState
        graphic={<IconFolder />}
        title="아직 프로젝트가 없습니다"
        description="첫 번째 영상을 만들어보세요."
        action={
          <Button variant="primary" size="sm">
            만들기
          </Button>
        }
      />
    </div>,
  );

  const root = find(".kds-empty-state");
  const style = getComputedStyle(root);
  expect(px(style.paddingBlockStart), "paddingBlock").toBe(spec.paddingBlock);
  expect(px(style.paddingBlockEnd), "paddingBlock").toBe(spec.paddingBlock);
  expect(px(style.paddingInlineStart), "paddingInline").toBe(spec.paddingInline);
  expect(px(style.rowGap), "gap").toBe(spec.gap);

  const graphic = find(".kds-empty-state__graphic");
  expect(round(graphic.getBoundingClientRect().width), "graphic").toBe(spec.graphic);
  expect(round(graphic.getBoundingClientRect().height), "graphic height").toBe(spec.graphic);

  const title = find(".kds-empty-state__title");
  const titleStyle = getComputedStyle(title);
  expect(px(titleStyle.fontSize), "titleFontSize").toBe(spec.titleFontSize);
  expect(round(px(titleStyle.lineHeight)), "titleLineHeight").toBe(spec.titleLineHeight);

  const description = find(".kds-empty-state__description");
  const descriptionStyle = getComputedStyle(description);
  expect(px(descriptionStyle.fontSize), "descriptionFontSize").toBe(spec.descriptionFontSize);
  expect(round(px(descriptionStyle.lineHeight)), "descriptionLineHeight").toBe(
    spec.descriptionLineHeight,
  );

  expect(
    px(getComputedStyle(find(".kds-empty-state__action")).marginBlockStart),
    "actionMarginBlockStart",
  ).toBe(spec.actionMarginBlockStart);
});

test("상자가 아니다 — 배경도 테두리도 반경도 없다", async () => {
  // **제품 9벌이 유일하게 합의하는 축이다.** 여기에 면을 주면 부모 표면 위에 카드가 하나 더
  // 얹힌 것처럼 보이고, 빈 상태가 "무언가 있다"는 신호가 된다.
  const spec = measured.components["empty-state"].sizes.base;
  await render(<EmptyState title="아직 프로젝트가 없습니다" />);
  const style = getComputedStyle(find(".kds-empty-state"));

  expect(style.backgroundColor, "배경 없음").toBe(TRANSPARENT);
  expect(style.backgroundImage, "배경 이미지 없음").toBe("none");
  expect(px(style.borderTopWidth), "테두리 없음").toBe(spec.borderWidth);
  expect(px(style.borderTopLeftRadius), "반경 없음").toBe(spec.radius);
  expect(style.boxShadow, "그림자 없음").toBe("none");
});

test("제목이 heading이고 단계를 호출부가 정한다", async () => {
  // 빈 상태는 랜드마크 탐색으로 닿아야 한다. div로 두면 스크린 리더가 지나친다.
  await render(
    <div>
      <EmptyState title="기본" />
      <EmptyState title="섹션 안" headingLevel={3} />
    </div>,
  );
  const titles = [...document.querySelectorAll(".kds-empty-state__title")];
  expect(titles.map((node) => node.tagName)).toEqual(["H2", "H3"]);
});

test("그래픽과 설명과 액션이 모두 선택이다", async () => {
  // 제품의 페이지 빈 상태는 아이콘을 넣지 않고, CTA가 없는 것이 9벌 중 6벌이다.
  await render(<EmptyState title="내용 없음" />);
  expect(document.querySelector(".kds-empty-state__graphic"), "그래픽 없음").toBeNull();
  expect(document.querySelector(".kds-empty-state__description"), "설명 없음").toBeNull();
  expect(document.querySelector(".kds-empty-state__action"), "액션 없음").toBeNull();
  expect(find(".kds-empty-state__title").textContent).toBe("내용 없음");
});

test("그래픽은 보조기술에서 숨는다", async () => {
  // 제목이 말하는 것을 반복할 뿐이다.
  await render(<EmptyState graphic={<IconFolder />} title="아직 프로젝트가 없습니다" />);
  expect(find(".kds-empty-state__graphic").getAttribute("aria-hidden")).toBe("true");
});

test("live region이 아니다", async () => {
  // 빈 상태는 목록이 로드된 결과다. live region으로 두면 화면을 옮길 때마다 다시 읽힌다.
  await render(<EmptyState title="아직 프로젝트가 없습니다" description="첫 번째 영상을 만들어보세요." />);
  const root = find(".kds-empty-state");
  expect(root.getAttribute("aria-live"), "aria-live 없음").toBeNull();
  expect(root.getAttribute("role"), "role 없음").toBeNull();
});

test("제목과 설명의 위계가 토큰에서 온다", async () => {
  await render(<EmptyState title="아직 프로젝트가 없습니다" description="첫 번째 영상을 만들어보세요." />);
  expect(getComputedStyle(find(".kds-empty-state__title")).color, "제목").toBe(
    tokenValue("color-fg-primary"),
  );
  expect(getComputedStyle(find(".kds-empty-state__description")).color, "설명").toBe(
    tokenValue("color-fg-secondary"),
  );
});

export type _EnsureTsx = JSX.Element;
