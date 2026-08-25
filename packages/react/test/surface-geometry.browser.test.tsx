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
  DialogActions,
  DialogFooter,
  DialogHeader,
  DialogSurface,
  DialogTitle,
  OverlayProvider,
  ProjectCard,
  ProjectCardAction,
  ProjectCardAdornment,
  ProjectCardEyebrow,
  ProjectCardMedia,
  ProjectCardMeta,
  ProjectCardOverlay,
  ProjectCardPlaceholder,
  ProjectCardTitle,
  ToastProvider,
  Tooltip,
  useToast,
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

/** 헤어라인 색의 계산 직렬화(라이트 `color(srgb 0 0 0 / 0.1)`). box-shadow 안의 색과 대조한다. */
const hairlineColor = (): string => {
  const probe = document.createElement("div");
  probe.style.setProperty("color", "var(--kds-color-stroke-hairline)");
  document.body.append(probe);
  const value = getComputedStyle(probe).color;
  probe.remove();
  return value;
};

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
            <DialogHeader>
              <DialogTitle>제목</DialogTitle>
            </DialogHeader>
            <DialogFooter>
              <DialogActions>
                <Button>취소</Button>
              </DialogActions>
            </DialogFooter>
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
    // **실제로 border가 아니라 modal elevation 뒤에 조합한 inset 헤어라인이다 (DS-D-0023).**
    expect(style.borderTopWidth, "border 제거").toBe("0px");
    expect(style.boxShadow, "inset 헤어라인").toContain("inset");
    expect(style.boxShadow, "헤어라인 색").toContain(hairlineColor());

    // measured의 padding 20은 **surface가 아니라 dialog root의 여백**이다(measured $note).
    // 그 값을 읽지 않으면 세 size 중 하나만 어긋나도 아무도 모른다.
    const root = find(".kds-dialog");
    const rootStyle = getComputedStyle(root);
    expect(px(rootStyle.paddingBlockStart), "paddingBlock").toBe(spec.paddingBlock);
    // **surface 안쪽 여백을 따로 본다.** 한 이름(`paddingBlock`)으로 뷰포트 여백과 surface
    // 여백을 둘 다 가리키다가, Figma가 20.5로 그려진 채 CSS는 16·24를 렌더하고 있었다.
    // 그 축을 보는 테스트가 없어 둘이 갈린 채로 통과했다.
    // **액션은 글자보다 가장자리에 가깝다.** 배포본이 액션 행에 `margin: -8px`을 걸어 만드는
    // 결과이며, 그 축을 보는 테스트가 없어 DS가 16에 두고도 통과하고 있었다.
    const footer = find(".kds-dialog__footer");
    expect(px(getComputedStyle(footer).paddingInlineStart), "footerInset").toBe(spec.footerInset);
    expect(px(getComputedStyle(footer).paddingBlockEnd), "footerInset").toBe(spec.footerInset);
    expect(px(getComputedStyle(footer).paddingBlockStart), "footerPaddingTop").toBe(spec.footerPaddingTop);

    const header = find(".kds-dialog__header");
    expect(px(getComputedStyle(header).paddingBlockStart), "surfaceInset").toBe(spec.surfaceInset);
    expect(px(getComputedStyle(header).paddingInlineStart), "surfaceInset").toBe(spec.surfaceInset);
    expect(px(rootStyle.paddingInlineStart), "paddingInline").toBe(spec.paddingInline);
    // measured의 gap 8은 header와 action이 함께 쓰는 space-control-sm이다(dialog.md "Action gap 8px").
    expect(px(getComputedStyle(find(".kds-dialog__header")).columnGap), "gap").toBe(spec.gap);
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

  // 여는 애니메이션의 변환에 영향받지 않도록 레이아웃 값을 쓴다.
  expect(panel.offsetHeight, "height").toBe(spec.height);
  expect(px(style.paddingBlockStart), "paddingBlock").toBe(spec.paddingBlock);
  expect(px(style.paddingInlineStart), "paddingInline").toBe(spec.paddingInline);
  expect(px(style.borderTopLeftRadius), "radius").toBe(spec.radius);
  expect(px(style.fontSize), "fontSize").toBe(spec.fontSize);
  expect(round(px(style.lineHeight)), "lineHeight").toBe(spec.lineHeight);
  expect(declaredBorderWidth(), "borderWidth").toBe(spec.borderWidth);
  // **실제로 border가 아니라 tooltip elevation 뒤에 조합한 inset 헤어라인이다 (DS-D-0023).**
  expect(style.borderTopWidth, "border 제거").toBe("0px");
  expect(style.boxShadow, "inset 헤어라인").toContain("inset");
  expect(style.boxShadow, "헤어라인 색").toContain(hairlineColor());
  // 포인터를 치운다. 얹은 채로 두면 뒤에 같은 좌표에 렌더되는 요소가 :hover를 받는다.
  await userEvent.unhover(find("button.kds-button"));
});

test("Toast의 구조값이 components.measured.json과 같다", async () => {
  const spec = measured.components.toast.sizes.base;
  function Emitter(): JSX.Element {
    const { toast } = useToast();
    return <Button onClick={() => toast("저장했습니다")}>띄우기</Button>;
  }
  await render(
    <ToastProvider>
      <Emitter />
    </ToastProvider>,
  );
  await userEvent.click(find("button.kds-button"));
  await expect.poll(() => document.querySelector(".kds-toast")).not.toBeNull();

  const toastNode = find(".kds-toast");
  const style = getComputedStyle(toastNode);
  expect(toastNode.offsetHeight, "height").toBe(spec.height);
  expect(px(style.paddingBlockStart), "paddingBlock").toBe(spec.paddingBlock);
  expect(px(style.paddingInlineStart), "paddingInline").toBe(spec.paddingInline);
  expect(px(style.borderTopLeftRadius), "radius").toBe(spec.radius);
  expect(px(style.fontSize), "fontSize").toBe(spec.fontSize);
  expect(round(px(style.lineHeight)), "lineHeight").toBe(spec.lineHeight);
  expect(px(style.borderTopWidth), "borderWidth").toBe(spec.borderWidth);
  // saturate는 흐림 뒤로 비치는 색이 죽지 않게 되살린다. 제품이 흐림과 함께 얹는다.
  expect(style.backdropFilter, "backdropBlur").toBe(`blur(${spec.backdropBlur}px) saturate(1.3)`);
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
  // 패널 경계는 border가 아니라 ambient elevation 뒤에 조합한 inset 헤어라인이다 (DS-D-0023).
  // elevation-menu는 이제 ambient만 소유하고 두 겹 frame이 없다.
  expect(panelStyle.borderTopWidth, "panel border 없음").toBe("0px");
  expect(panelStyle.boxShadow, "panel inset 헤어라인").toContain("inset");
  expect(panelStyle.boxShadow, "panel 헤어라인 색").toContain(hairlineColor());
  // **offsetWidth를 쓴다.** 패널의 enter 애니메이션이 scale 0.96을 걸고 있어 rect는 변환 후
  // 크기를 돌려준다 — 160이 153.6으로 읽힌다. transition-property에 scale을 넣기 전에는 scale이
  // 즉시 1로 튀어서 이 함정이 보이지 않았다.
  expect(panel.offsetWidth, "panel minWidth").toBeGreaterThanOrEqual(spec.minWidth);

  const item = find(".kds-menu__item");
  const itemStyle = getComputedStyle(item);
  expect(item.offsetHeight, "item height").toBe(spec.itemHeight);
  expect(px(itemStyle.paddingBlockStart), "item paddingBlock").toBe(spec.itemPaddingBlock);
  expect(px(itemStyle.paddingInlineStart), "item paddingInline").toBe(spec.itemPaddingInline);
  expect(px(itemStyle.columnGap), "item gap").toBe(spec.itemGap);
  expect(px(itemStyle.borderTopLeftRadius), "item radius").toBe(spec.itemRadius);
});

/**
 * ProjectCard는 그리드가 폭을 정하므로 폭을 계약에 두지 않는다. 여기서는 measured가 적어 둔
 * 측정용 폭을 강제해 나머지 구조값을 잰다.
 *
 * 자식 순서가 계약이다 — Media → Action → Adornment. harness가 그 순서를 쓰는 것은 계약을
 * 지키는 것이지 증명하는 것이 아니다. 증명은 아래 "슬롯이 눌린다" 테스트가 실제 hit test로 한다.
 */
function CardHarness({
  width,
  adornment,
  href,
}: {
  width?: number;
  adornment?: ReactNode;
  href?: string;
}): JSX.Element {
  const spec = measured.components["project-card"].sizes.base;
  return (
    <div style={{ inlineSize: `${width ?? spec.width}px` }}>
      <ProjectCard>
        <ProjectCardMedia>
          <ProjectCardPlaceholder />
          <ProjectCardOverlay>
            <ProjectCardEyebrow>하이라이트</ProjectCardEyebrow>
            <ProjectCardTitle>여름 여행</ProjectCardTitle>
            <ProjectCardMeta>3일 전 편집</ProjectCardMeta>
          </ProjectCardOverlay>
        </ProjectCardMedia>
        {href === undefined ? (
          <ProjectCardAction />
        ) : (
          <ProjectCardAction href={href} />
        )}
        {adornment}
      </ProjectCard>
    </div>
  );
}

test("ProjectCard의 구조값이 components.measured.json과 같다", async () => {
  const spec = measured.components["project-card"].sizes.base;
  await render(<CardHarness />);

  const card = find("div.kds-project-card");
  const cardStyle = getComputedStyle(card);
  expect(round(rect(card).width), "width").toBe(spec.width);
  // aspect-ratio 1이라 폭과 높이가 같아야 한다. 다르면 그리드에서 줄이 튄다.
  expect(round(rect(card).height), "height").toBe(spec.height);
  expect(px(cardStyle.borderTopLeftRadius), "radius").toBe(spec.radius);
  expect(declaredBorderWidth(), "borderWidth").toBe(spec.borderWidth);
  // **실제로 border가 아니라 inset 헤어라인이다 (DS-D-0023).** border를 지워도 aspect-ratio 폭·높이
  // 계약이 유지된다.
  expect(cardStyle.borderTopWidth, "border 제거").toBe("0px");
  expect(cardStyle.boxShadow, "inset 헤어라인").toContain("inset");
  expect(cardStyle.boxShadow, "헤어라인 색").toContain(hairlineColor());

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

test("ProjectCard의 제목 띠는 최소 트랙에서 내용보다 작아지지 않는다", async () => {
  // 처음 구현은 `block-size: 30%`만 두었다. 절대 위치 박스의 확정 크기라 내용이 커져도 자라지
  // 않고 **글자가 띠 위로 넘쳤다** — 240px 트랙에서 띠 71.4px에 내용 92.8px이라 eyebrow가 흐림이
  // 0인 구간에 놓였다. 문서·measured는 "자란다"고 적고 있어 실제와 어긋나 있었다.
  const spec = measured.components["project-card"].sizes.base;
  await render(<CardHarness width={spec.minimumTrack} />);

  const overlay = find(".kds-project-card-overlay");
  const content = find(".kds-project-card-overlay-content");
  const media = find(".kds-project-card-media");

  expect(rect(content).top, "내용이 띠 위로 넘치지 않는다").toBeGreaterThanOrEqual(
    rect(overlay).top - 0.5,
  );
  // 큰 카드에서는 30%가 이기고, 작은 카드에서는 내용이 이긴다. 최소 트랙은 후자다.
  expect(
    round(rect(overlay).height / rect(media).height),
    "최소 트랙에서는 띠가 30%보다 크다",
  ).toBeGreaterThan(spec.overlayHeightRatio);
});

test("ProjectCard의 슬롯은 클릭 타깃 위에 있어 실제로 눌린다", async () => {
  // DOM 순서를 되읽는 것으로는 증명되지 않는다 — harness가 그 순서를 직접 썼기 때문이다.
  // 실제 hit test로 본다.
  const clicks: string[] = [];
  await render(
    <CardHarness
      adornment={
        <ProjectCardAdornment placement="top-end">
          <button type="button" data-testid="more" onClick={() => clicks.push("more")}>
            더보기
          </button>
        </ProjectCardAdornment>
      }
    />,
  );
  const action = find(".kds-project-card-action");
  action.addEventListener("click", () => clicks.push("card"));

  const more = find('[data-testid="more"]');
  const box = more.getBoundingClientRect();
  const hit = document.elementFromPoint(box.left + box.width / 2, box.top + box.height / 2);
  expect(hit, "슬롯 좌표의 최상위 요소가 슬롯 안의 버튼이어야 한다").toBe(more);

  await userEvent.click(more);
  expect(clicks, "슬롯 버튼만 눌린다").toEqual(["more"]);
});

test("ProjectCard의 클릭 타깃은 카드 전체를 덮고 대화형 자손을 갖지 않는다", async () => {
  await render(<CardHarness href="/highlight/1" />);
  const card = find("div.kds-project-card");
  const action = find("a.kds-project-card-action");

  // 카드 전체가 클릭 타깃이다. `inset: 0`은 **padding box** 기준이므로 테두리 안쪽을 덮는다 —
  // 비교 대상도 padding box(clientWidth)여야 한다. border-box와 재면 테두리 두께만큼 어긋난다.
  expect(action.offsetWidth, "action width").toBe(card.clientWidth);
  expect(action.offsetHeight, "action height").toBe(card.clientHeight);

  // **`<a>` 안에 대화형 자손이 없어야 한다.** 처음 구현은 root가 `<a>`였고 슬롯의 버튼이 그
  // 안에 들어가 HTML이 무효였다. 규범 문서가 그 사용을 예시로 들고 있었다.
  expect(
    action.querySelectorAll("a, button, input, select, textarea, [tabindex]").length,
    "클릭 타깃 안에 대화형 자손이 없다",
  ).toBe(0);

  // 이름은 제목에서 온다.
  const title = find(".kds-project-card-title");
  expect(action.getAttribute("aria-labelledby"), "이름은 제목에서 온다").toBe(title.id);
  expect(title.id.length, "제목 id가 인스턴스마다 발급된다").toBeGreaterThan(0);
});

test("ProjectCardAction은 href가 있으면 링크, 없으면 버튼이다", async () => {
  // 제품의 네 벌은 전부 <article> + onClick이라 키보드로 열 수 없다. 클릭 타깃이 네이티브
  // 대화형 요소인 것이 이 컴포넌트가 제품과 다른 유일한 구조다 — 그래서 여기서 못을 박는다.
  await render(
    <div>
      <CardHarness href="/highlight/1" />
      <CardHarness />
    </div>,
  );
  const actions = [...document.querySelectorAll(".kds-project-card-action")];
  expect(actions.map((node) => node.tagName)).toEqual(["A", "BUTTON"]);
  expect(actions[0]?.getAttribute("href")).toBe("/highlight/1");
  expect(actions[1]?.getAttribute("type")).toBe("button");
});

test("ProjectCardMedia는 양수가 아닌 aspectRatio를 무시한다", async () => {
  // 0이나 음수가 흘러들면 미디어 면의 높이가 0이 되어 카드가 테두리만 남고 그 안의 절대 위치
  // 자식이 전부 사라진다. 계산 결과가 실수로 흘러드는 자리다.
  await render(
    <div style={{ inlineSize: "240px" }}>
      <ProjectCard>
        <ProjectCardMedia aspectRatio={0} data-testid="zero">
          <ProjectCardPlaceholder />
        </ProjectCardMedia>
      </ProjectCard>
    </div>,
  );
  const media = find('[data-testid="zero"]');
  // 계산값은 `1 / 1`로 직렬화된다.
  expect(getComputedStyle(media).aspectRatio, "0은 무시하고 기본 1을 쓴다").toBe("1 / 1");
  expect(rect(media).height, "면이 사라지지 않는다").toBeGreaterThan(0);
});

test("누름 전환이 실제로 걸린다 — scale은 transform과 별개 property다", async () => {
  // `transition-property: opacity, transform`만 적고 `scale`을 움직이면 선언이 아무것도 전이하지
  // 않는다. 네 컴포넌트가 그 상태였다. 선언한 property가 실제로 움직이는 것과 같아야 한다.
  await render(
    <div>
      <CardHarness />
      <Button>버튼</Button>
    </div>,
  );
  for (const selector of [".kds-project-card", ".kds-button"]) {
    const node = find(selector);
    expect(getComputedStyle(node).transitionProperty, `${selector} transitionProperty`).toContain(
      "scale",
    );
  }
});

export type _EnsureTsx = JSX.Element;
