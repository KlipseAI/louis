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
  probe.style.setProperty("color", `var(--louis-${id})`);
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
          <Button variant="primary" size="md">
            만들기
          </Button>
        }
      />
    </div>,
  );

  const root = find(".louis-empty-state");
  const style = getComputedStyle(root);
  expect(px(style.paddingBlockStart), "paddingBlock").toBe(spec.paddingBlock);
  expect(px(style.paddingBlockEnd), "paddingBlock").toBe(spec.paddingBlock);
  expect(px(style.paddingInlineStart), "paddingInline").toBe(spec.paddingInline);
  expect(px(style.rowGap), "gap").toBe(spec.gap);

  const graphic = find(".louis-empty-state__graphic");
  expect(round(graphic.getBoundingClientRect().width), "graphic").toBe(spec.graphic);
  expect(round(graphic.getBoundingClientRect().height), "graphic height").toBe(spec.graphic);

  const title = find(".louis-empty-state__title");
  const titleStyle = getComputedStyle(title);
  expect(px(titleStyle.fontSize), "titleFontSize").toBe(spec.titleFontSize);
  expect(round(px(titleStyle.lineHeight)), "titleLineHeight").toBe(spec.titleLineHeight);

  const description = find(".louis-empty-state__description");
  const descriptionStyle = getComputedStyle(description);
  expect(px(descriptionStyle.fontSize), "descriptionFontSize").toBe(spec.descriptionFontSize);
  expect(round(px(descriptionStyle.lineHeight)), "descriptionLineHeight").toBe(
    spec.descriptionLineHeight,
  );

  expect(
    px(getComputedStyle(find(".louis-empty-state__action")).marginBlockStart),
    "actionMarginBlockStart",
  ).toBe(spec.actionMarginBlockStart);
});

test("상자가 아니다 — 배경도 테두리도 반경도 없다", async () => {
  // **제품 9벌이 유일하게 합의하는 축이다.** 여기에 면을 주면 부모 표면 위에 카드가 하나 더
  // 얹힌 것처럼 보이고, 빈 상태가 "무언가 있다"는 신호가 된다.
  const spec = measured.components["empty-state"].sizes.base;
  await render(<EmptyState title="아직 프로젝트가 없습니다" />);
  const style = getComputedStyle(find(".louis-empty-state"));

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
  const titles = [...document.querySelectorAll(".louis-empty-state__title")];
  expect(titles.map((node) => node.tagName)).toEqual(["H2", "H3"]);
});

test("그래픽과 설명과 액션이 모두 선택이다", async () => {
  // 제품의 페이지 빈 상태는 아이콘을 넣지 않고, CTA가 없는 것이 9벌 중 6벌이다.
  await render(<EmptyState title="내용 없음" />);
  expect(document.querySelector(".louis-empty-state__graphic"), "그래픽 없음").toBeNull();
  expect(document.querySelector(".louis-empty-state__description"), "설명 없음").toBeNull();
  expect(document.querySelector(".louis-empty-state__action"), "액션 없음").toBeNull();
  expect(find(".louis-empty-state__title").textContent).toBe("내용 없음");
});

test("그래픽은 보조기술에서 숨는다", async () => {
  // 제목이 말하는 것을 반복할 뿐이다.
  await render(<EmptyState graphic={<IconFolder />} title="아직 프로젝트가 없습니다" />);
  expect(find(".louis-empty-state__graphic").getAttribute("aria-hidden")).toBe("true");
});

test("live region이 아니다", async () => {
  // 빈 상태는 목록이 로드된 결과다. live region으로 두면 화면을 옮길 때마다 다시 읽힌다.
  await render(<EmptyState title="아직 프로젝트가 없습니다" description="첫 번째 영상을 만들어보세요." />);
  const root = find(".louis-empty-state");
  expect(root.getAttribute("aria-live"), "aria-live 없음").toBeNull();
  expect(root.getAttribute("role"), "role 없음").toBeNull();
});

test("제목과 설명의 위계가 토큰에서 온다", async () => {
  await render(<EmptyState title="아직 프로젝트가 없습니다" description="첫 번째 영상을 만들어보세요." />);
  expect(getComputedStyle(find(".louis-empty-state__title")).color, "제목").toBe(
    tokenValue("color-fg-primary"),
  );
  expect(getComputedStyle(find(".louis-empty-state__description")).color, "설명").toBe(
    tokenValue("color-fg-secondary"),
  );
});

// ── layout 축 ──────────────────────────────────────────────────────────────────
// 「면을 갖지 않는다」는 집계 9벌의 합의이고 **집계 안에서만** 참이다. 아래 셋은 그 밖의 두
// 자리가 계약대로 서 있는지를 잰다 — 이 파일이 없으면 계약과 Figma 는 서로 맞은 채 코드만
// 다른 상태가 조용히 생긴다(design/governance/decisions/DS-D-0035).

test("layout이 data-layout을 정하고 기본값에서도 붙는다", async () => {
  // 값이 있을 때만 붙이면 "기본값이라 없다"와 "prop을 못 받았다"가 DOM에서 구분되지 않는다.
  await render(
    <div>
      <EmptyState title="기본" />
      <EmptyState title="컴팩트" layout="compact" />
      <EmptyState title="캔버스" layout="canvas" />
    </div>,
  );
  expect(
    [...document.querySelectorAll(".louis-empty-state")].map((n) => n.getAttribute("data-layout")),
  ).toEqual(["base", "compact", "canvas"]);
});

test("compact의 구조값이 components.measured.json과 같다", async () => {
  const spec = measured.components["empty-state"].sizes.compact;
  await render(
    <div style={{ inlineSize: "480px" }}>
      <EmptyState
        layout="compact"
        title="아직 데이터가 없습니다"
        description="영상을 올리면 지표가 쌓입니다."
      />
    </div>,
  );

  const root = find(".louis-empty-state");
  const style = getComputedStyle(root);
  expect(px(style.paddingBlockStart), "paddingBlock").toBe(spec.paddingBlock);
  expect(px(style.paddingInlineStart), "paddingInline").toBe(spec.paddingInline);
  expect(px(style.rowGap), "gap").toBe(spec.gap);
  expect(px(style.borderTopWidth), "borderWidth").toBe(spec.borderWidth);
  expect(px(style.borderTopLeftRadius), "radius").toBe(spec.radius);
  expect(style.alignItems, "align").toBe(spec.align);

  const titleStyle = getComputedStyle(find(".louis-empty-state__title"));
  expect(px(titleStyle.fontSize), "titleFontSize").toBe(spec.titleFontSize);
  expect(round(px(titleStyle.lineHeight)), "titleLineHeight").toBe(spec.titleLineHeight);

  const descriptionStyle = getComputedStyle(find(".louis-empty-state__description"));
  expect(px(descriptionStyle.fontSize), "descriptionFontSize").toBe(spec.descriptionFontSize);
  expect(round(px(descriptionStyle.lineHeight)), "descriptionLineHeight").toBe(
    spec.descriptionLineHeight,
  );
  // base의 44ch 제한은 "넓은 화면 가운데"라는 전제에서 나온 값이다. 카드 안에서는 그 전제가
  // 성립하지 않아 제한을 푼다 — 두면 카드보다 좁은 자리에서 두 번 접힌다.
  expect(descriptionStyle.maxInlineSize, "설명 폭 제한 없음").toBe("none");
});

test("compact만 면을 갖는다", async () => {
  // 제품 9벌이 합의한 "상자가 아니다"의 **유일한 반례**이고, 반례가 실재한다는 사실이 축의
  // 근거다. 면은 카드보다 한 단계 밝은 표면이라 bg-inset이 아니라 bg-raised다.
  await render(
    <div>
      <EmptyState layout="compact" title="컴팩트" description="설명" />
    </div>,
  );
  const style = getComputedStyle(find(".louis-empty-state"));
  expect(style.backgroundColor, "면").toBe(tokenValue("color-bg-raised"));
  expect(style.borderTopColor, "테두리 색").toBe(tokenValue("color-stroke-default"));
});

test("canvas의 구조값이 components.measured.json과 같고 면은 없다", async () => {
  const spec = measured.components["empty-state"].sizes.canvas;
  await render(
    <div style={{ inlineSize: "640px" }}>
      <EmptyState
        layout="canvas"
        title="첫 노드를 만들어 시작하세요"
        action={
          <>
            <Button variant="secondary" size="md">
              이미지 생성
            </Button>
            <Button variant="secondary" size="md">
              비디오 생성
            </Button>
          </>
        }
      />
    </div>,
  );

  const root = find(".louis-empty-state");
  const style = getComputedStyle(root);
  expect(px(style.paddingBlockStart), "paddingBlock").toBe(spec.paddingBlock);
  expect(px(style.paddingInlineStart), "paddingInline").toBe(spec.paddingInline);
  expect(px(style.rowGap), "gap").toBe(spec.gap);
  expect(style.alignItems, "align").toBe(spec.align);
  // 캔버스 위에 뜬 오버레이라 상자를 그리면 노드가 하나 더 있는 것처럼 보인다.
  expect(style.backgroundColor, "면 없음").toBe(TRANSPARENT);
  expect(px(style.borderTopWidth), "borderWidth").toBe(spec.borderWidth);
  expect(px(style.borderTopLeftRadius), "radius").toBe(spec.radius);

  const titleStyle = getComputedStyle(find(".louis-empty-state__title"));
  expect(px(titleStyle.fontSize), "titleFontSize").toBe(spec.titleFontSize);
  expect(round(px(titleStyle.lineHeight)), "titleLineHeight").toBe(spec.titleLineHeight);

  const action = getComputedStyle(find(".louis-empty-state__action"));
  expect(px(action.marginBlockStart), "actionMarginBlockStart").toBe(spec.actionMarginBlockStart);
  expect(px(action.columnGap), "actionGap").toBe(spec.actionGap);
});

export type _EnsureTsx = JSX.Element;
