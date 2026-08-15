// figma/components.measured.json의 **표면 컴포넌트** 값을 코드가 여전히 만드는지 검증한다.
//
// component-geometry.browser.test.tsx가 Button과 IconButton을 덮는 동안 Dialog·Tooltip·Toast·
// Menu는 measured에 값만 있고 코드 쪽 대조가 없었다. 그 상태가 정확히 measured 파일이 스스로
// 경고하는 함정이다 — parity 게이트는 Figma가 measured와 같은지만 보므로 **Figma와 measured는
// 서로 맞고 둘 다 코드와 틀린** 상태로 통과한다. 실제로 radius-card를 20에서 16으로 내렸을 때
// Dialog compact가 20을 유지하는지 아무 테스트도 확인하지 못했다.
import type { JSX, ReactNode } from "react";
import { expect, test } from "vitest";
import { page, userEvent } from "vitest/browser";
import { render } from "vitest-browser-react";
import {
  ActionMenu,
  ActionMenuContent,
  ActionMenuItem,
  ActionMenuTrigger,
  Button,
  Dialog,
  DialogSurface,
  DialogTitle,
  OverlayProvider,
  ProjectCard,
  ProjectCardAdornment,
  ProjectCardEyebrow,
  ProjectCardMedia,
  ProjectCardMeta,
  ProjectCardOverlay,
  ProjectCardPlaceholder,
  ProjectCardTitle,
  Tooltip,
} from "@klipse-design/react";
import measured from "../../../figma/components.measured.json" with { type: "json" };
import "@klipse-design/css/layers.css";
import "@klipse-design/css/tokens.css";
import "@klipse-design/css/styles.css";

const px = (value: string): number => Number.parseFloat(value);
const rect = (node: Element): DOMRect => node.getBoundingClientRect();
const round = (value: number): number => Math.round(value * 1000) / 1000;

/** 선언된 헤어라인 두께. 브라우저가 DPR 1에서 0.5px을 1px로 올리므로 계산값을 쓰지 않는다. */
const declaredBorderWidth = (): number =>
  px(getComputedStyle(document.documentElement).getPropertyValue("--kds-border-width-hairline"));

function find(selector: string): HTMLElement {
  const node = document.querySelector(selector);
  if (node === null) throw new Error(`찾지 못했습니다: ${selector}`);
  return node as HTMLElement;
}

// measured가 값을 가진 size만 돈다. DialogSize에는 measured에 없는 것도 있어 그 타입으로 색인하면
// 계약이 없는 size를 조용히 넘기게 된다.
const DIALOG_SIZES = ["compact", "medium", "large"] as const;

for (const size of DIALOG_SIZES) {
  const spec = measured.components.dialog.sizes[size];

  test(`Dialog ${size}의 구조값이 components.measured.json과 같다`, async () => {
    // surface 폭은 `min(size, 100%)`다. 기본 test viewport가 좁아서 늘 100%가 이기면 세 size가
    // 전부 같은 폭으로 읽혀 계약을 전혀 검증하지 못한다 — 실제로 medium과 large가 같은 366.52로
    // 나왔다. 의도한 폭이 나올 만큼 넓힌다.
    await page.viewport(1280, 900);
    await render(
      <OverlayProvider>
        <Dialog open size={size} onOpenChange={() => {}}>
          <DialogSurface>
            <DialogTitle>제목</DialogTitle>
          </DialogSurface>
        </Dialog>
      </OverlayProvider>,
    );

    const surface = find(".kds-dialog__surface");
    const style = getComputedStyle(surface);

    // **offsetWidth를 쓴다.** 여는 애니메이션이 scale 0.98을 걸고 있어 getBoundingClientRect는
    // 변환 후 크기를 돌려준다 — 세 size가 전부 정확히 98%로 읽혔다. offsetWidth는 레이아웃 폭이다.
    expect(surface.offsetWidth, "width").toBe(spec.width);
    expect(px(style.borderTopLeftRadius), "radius").toBe(spec.radius);
    expect(declaredBorderWidth(), "borderWidth").toBe(spec.borderWidth);
  });
}

test("Tooltip의 구조값이 components.measured.json과 같다", async () => {
  const spec = measured.components.tooltip.sizes.base;
  await render(
    <OverlayProvider>
      <Tooltip content="설명" openDelay={0}>
        <Button>대상</Button>
      </Tooltip>
    </OverlayProvider>,
  );
  await userEvent.hover(find("button.kds-button"));
  await expect.poll(() => document.querySelector(".kds-tooltip")).not.toBeNull();

  const panel = find(".kds-tooltip");
  const style = getComputedStyle(panel);

  expect(round(rect(panel).height), "height").toBe(spec.height);
  expect(px(style.paddingBlockStart), "paddingBlock").toBe(spec.paddingBlock);
  expect(px(style.paddingInlineStart), "paddingInline").toBe(spec.paddingInline);
  expect(px(style.borderTopLeftRadius), "radius").toBe(spec.radius);
  expect(px(style.fontSize), "fontSize").toBe(spec.fontSize);
  expect(round(px(style.lineHeight)), "lineHeight").toBe(spec.lineHeight);
  expect(declaredBorderWidth(), "borderWidth").toBe(spec.borderWidth);
  // 포인터를 치운다. 얹은 채로 두면 뒤에 같은 좌표에 렌더되는 요소가 :hover를 받는다.
  await userEvent.unhover(find("button.kds-button"));
});

test("Menu 패널과 항목의 구조값이 components.measured.json과 같다", async () => {
  const spec = measured.components["menu-popover"].sizes.panel;
  await render(
    <OverlayProvider>
      <ActionMenu panelLabel="작업">
        <ActionMenuTrigger>
          <Button>열기</Button>
        </ActionMenuTrigger>
        <ActionMenuContent>
          <ActionMenuItem>이름 바꾸기</ActionMenuItem>
        </ActionMenuContent>
      </ActionMenu>
    </OverlayProvider>,
  );
  await userEvent.click(find("button.kds-button"));
  await expect.poll(() => document.querySelector('.kds-popover[data-kind="action-menu"]')).not.toBeNull();

  const panel = find('.kds-popover[data-kind="action-menu"]');
  const panelStyle = getComputedStyle(panel);
  expect(px(panelStyle.paddingBlockStart), "panel paddingBlock").toBe(spec.paddingBlock);
  expect(px(panelStyle.paddingInlineStart), "panel paddingInline").toBe(spec.paddingInline);
  expect(px(panelStyle.rowGap), "panel gap").toBe(spec.gap);
  expect(px(panelStyle.borderTopLeftRadius), "panel radius").toBe(spec.radius);
  expect(round(rect(panel).width), "panel minWidth").toBeGreaterThanOrEqual(spec.minWidth);

  const item = find(".kds-menu__item");
  const itemStyle = getComputedStyle(item);
  expect(round(rect(item).height), "item height").toBe(spec.itemHeight);
  expect(px(itemStyle.paddingBlockStart), "item paddingBlock").toBe(spec.itemPaddingBlock);
  expect(px(itemStyle.paddingInlineStart), "item paddingInline").toBe(spec.itemPaddingInline);
  expect(px(itemStyle.columnGap), "item gap").toBe(spec.itemGap);
  expect(px(itemStyle.borderTopLeftRadius), "item radius").toBe(spec.itemRadius);
});

/**
 * ProjectCard는 그리드가 폭을 정하므로 폭을 계약에 두지 않는다. 여기서는 measured가 적어 둔
 * 측정용 폭을 강제해 나머지 구조값을 잰다.
 */
function CardHarness({ children }: { children?: ReactNode }): JSX.Element {
  const spec = measured.components["project-card"].sizes.base;
  return (
    <div style={{ inlineSize: `${spec.width}px` }}>
      <ProjectCard aria-label="프로젝트">
        <ProjectCardMedia>
          <ProjectCardPlaceholder />
          <ProjectCardOverlay>
            <ProjectCardEyebrow>하이라이트</ProjectCardEyebrow>
            <ProjectCardTitle>여름 여행</ProjectCardTitle>
            <ProjectCardMeta>3일 전 편집</ProjectCardMeta>
          </ProjectCardOverlay>
          {children}
        </ProjectCardMedia>
      </ProjectCard>
    </div>
  );
}

test("ProjectCard의 구조값이 components.measured.json과 같다", async () => {
  const spec = measured.components["project-card"].sizes.base;
  await render(<CardHarness />);

  const card = find("button.kds-project-card");
  const cardStyle = getComputedStyle(card);
  expect(round(rect(card).width), "width").toBe(spec.width);
  // aspect-ratio 1이라 폭과 높이가 같아야 한다. 다르면 그리드에서 줄이 튄다.
  expect(round(rect(card).height), "height").toBe(spec.height);
  expect(px(cardStyle.borderTopLeftRadius), "radius").toBe(spec.radius);
  expect(declaredBorderWidth(), "borderWidth").toBe(spec.borderWidth);

  const media = find(".kds-project-card-media");
  const overlay = find(".kds-project-card-overlay");
  const overlayStyle = getComputedStyle(overlay);
  expect(
    round(rect(overlay).height / rect(media).height),
    "overlayHeightRatio",
  ).toBe(spec.overlayHeightRatio);
  expect(px(overlayStyle.paddingBlockStart), "overlayPadding").toBe(spec.overlayPadding);
  expect(px(overlayStyle.paddingInlineStart), "overlayPadding").toBe(spec.overlayPadding);

  const content = find(".kds-project-card-overlay-content");
  expect(px(getComputedStyle(content).rowGap), "overlayTextGap").toBe(spec.overlayTextGap);

  const title = find(".kds-project-card-title");
  const titleStyle = getComputedStyle(title);
  // line-height는 1.2배수라 계산값이 font-size에 비례한다. 비율로 되돌려 본다.
  expect(round(px(titleStyle.lineHeight) / px(titleStyle.fontSize)), "overlayLineHeight").toBe(
    spec.overlayLineHeight,
  );

  const blurred = getComputedStyle(overlay, "::before");
  expect(blurred.backdropFilter, "backdropBlur").toBe(`blur(${spec.backdropBlur}px)`);

  // **프로그레시브인지 본다.** mask가 없으면 균일한 흐림이고 그것은 다른 물건이다. 정지점은
  // measured가 갖고 있어 Figma의 PROGRESSIVE offset과 같은 원천을 쓴다.
  //
  // 계산값의 색 표기는 브라우저가 정한다 — 1은 `rgb(0, 0, 0)`, 0은 `rgba(0, 0, 0, 0)`,
  // 그 사이는 `color(srgb 0 0 0 / a)`다. 표기가 아니라 **위치와 남는 비율**을 확인한다.
  const mask = blurred.maskImage;
  expect(mask, "위로 사라져야 한다").toContain("to top");
  for (const [position, remaining] of spec.overlayMaskStops) {
    const expected =
      remaining === 1
        ? `rgb(0, 0, 0) ${position}%`
        : remaining === 0
          ? `rgba(0, 0, 0, 0) ${position}%`
          : `color(srgb 0 0 0 / ${remaining}) ${position}%`;
    expect(mask, `mask 정지점 ${position}%`).toContain(expected);
  }
});

test("ProjectCard의 adornment는 오버레이보다 위에 칠해진다", async () => {
  // 숫자 z-index를 쓰지 않으므로 칠 순서가 DOM 순서다. adornment를 overlay 뒤에 두는 것이
  // 계약이며, 어기면 하단 모서리의 컨트롤이 흐림 층에 덮여 눌리지 않는다.
  await render(
    <CardHarness>
      <ProjectCardAdornment placement="top-end">
        <span data-testid="chip">더보기</span>
      </ProjectCardAdornment>
    </CardHarness>,
  );
  const adornment = find(".kds-project-card-adornment");
  const overlay = find(".kds-project-card-overlay");
  expect(
    overlay.compareDocumentPosition(adornment) & Node.DOCUMENT_POSITION_FOLLOWING,
    "adornment가 overlay 뒤에 있어야 한다",
  ).toBeGreaterThan(0);
  expect(getComputedStyle(adornment).zIndex, "숫자 z-index를 쓰지 않는다").toBe("auto");
  expect(getComputedStyle(overlay).zIndex, "숫자 z-index를 쓰지 않는다").toBe("auto");
});

test("ProjectCard는 href가 있으면 링크, 없으면 버튼이다", async () => {
  // 제품의 네 벌은 전부 <article> + onClick이라 키보드로 열 수 없다. root가 네이티브 대화형
  // 요소인 것이 이 컴포넌트가 제품과 다른 유일한 구조다 — 그래서 여기서 못을 박는다.
  await render(
    <div>
      <ProjectCard href="/highlight/1" aria-label="링크 카드">
        <ProjectCardMedia />
      </ProjectCard>
      <ProjectCard aria-label="버튼 카드">
        <ProjectCardMedia />
      </ProjectCard>
    </div>,
  );
  const cards = [...document.querySelectorAll(".kds-project-card")];
  expect(cards.map((node) => node.tagName)).toEqual(["A", "BUTTON"]);
  expect(cards[0]?.getAttribute("href")).toBe("/highlight/1");
  expect(cards[1]?.getAttribute("type")).toBe("button");
});

export type _EnsureTsx = JSX.Element;
