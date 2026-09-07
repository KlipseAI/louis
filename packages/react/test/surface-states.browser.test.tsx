// figma/components.measured.json의 **표면 컴포넌트 states 표**를 코드가 실제로 만드는지 검증한다.
//
// component-states.browser.test.tsx가 Button과 IconButton을 덮는 동안 Tooltip·Toast·Menu·Dialog·
// ProjectCard의 states 17건은 **아무도 읽지 않았다.** parity 게이트는 Figma만 보고, 그 파일의
// "빠짐없이 덮는다" 가드조차 기대 목록에 두 컴포넌트만 하드코딩돼 있었다. 표면 기하를 덮으면서
// 색을 빼놓으면 같은 함정이 색 축에 그대로 남는다.
//
// **색 이름을 역조회하지 않는다.** 같은 값을 갖는 토큰이 여럿이라 계산색 → 이름 역조회는 나중에
// 넣은 쪽으로 붙는다. 기대 토큰의 계산값을 probe로 얻어 값끼리 비교한다.
import type { JSX } from "react";
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
  ProjectCardAction,
  ProjectCardMedia,
  ProjectCardOverlay,
  ProjectCardTitle,
  ToastProvider,
  Tooltip,
  useToast,
  type ToastTone,
} from "@klipse-design/react";
import measured from "../../../figma/components.measured.json" with { type: "json" };
import "@klipse-design/css/layers.css";
import "@klipse-design/css/tokens.css";
import "@klipse-design/css/styles.css";

type Paint = {
  background: string | null;
  foreground: string;
  border?: string;
};

const TRANSPARENT = "rgba(0, 0, 0, 0)";

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

function find(selector: string): HTMLElement {
  const node = document.querySelector(selector);
  if (node === null) throw new Error(`찾지 못했습니다: ${selector}`);
  return node as HTMLElement;
}

/**
 * measured의 states 표를 꺼낸다. 없으면 **던진다** — undefined가 조용히 흘러가면 단언이
 * `undefined`끼리 비교돼 통과한다.
 */
function statesOf(component: keyof typeof measured.components, group: string): Record<string, Paint> {
  const table = (measured.components[component] as { states?: Record<string, unknown> }).states;
  const spec = table?.[group];
  if (spec === undefined) {
    throw new Error(`${component}.states.${group}가 measured에 없습니다`);
  }
  return spec as Record<string, Paint>;
}

function stateOf(spec: Record<string, Paint>, name: string): Paint {
  const paint = spec[name];
  if (paint === undefined) throw new Error(`states 표에 ${name}이 없습니다`);
  return paint;
}

test("Tooltip의 states 표가 코드와 같다", async () => {
  const spec = statesOf("tooltip", "base");
  await render(
    <OverlayProvider>
      <Tooltip content="설명" openDelay={0}>
        <Button>대상</Button>
      </Tooltip>
    </OverlayProvider>,
  );
  await userEvent.hover(find("button.louis-button"));
  await expect.poll(() => document.querySelector(".louis-tooltip")).not.toBeNull();
  assertPaint(find(".louis-tooltip"), stateOf(spec, "Default"), "tooltip/Default");
  await userEvent.unhover(find("button.louis-button"));
});

const TOAST_TONES: readonly ToastTone[] = ["neutral", "danger"];

for (const tone of TOAST_TONES) {
  test(`Toast ${tone}의 states 표가 코드와 같다`, async () => {
    const spec = statesOf("toast", tone);
    function Emitter(): JSX.Element {
      const { toast } = useToast();
      return <Button onClick={() => toast({ message: "저장했습니다", tone })}>띄우기</Button>;
    }
    await render(
      <ToastProvider>
        <Emitter />
      </ToastProvider>,
    );
    await userEvent.click(find("button.louis-button"));
    await expect.poll(() => document.querySelector(".louis-toast")).not.toBeNull();
    assertPaint(find(".louis-toast"), stateOf(spec, "Default"), `toast/${tone}`);
  });
}

test("Menu 항목의 states 표가 코드와 같다", async () => {
  const spec = statesOf("menu-popover", "base");
  await render(
    <OverlayProvider>
      <ActionMenu panelLabel="작업">
        <ActionMenuTrigger>
          <Button>열기</Button>
        </ActionMenuTrigger>
        <ActionMenuContent>
          <ActionMenuItem data-testid="plain">이름 바꾸기</ActionMenuItem>
          <ActionMenuItem data-testid="danger" danger>
            삭제
          </ActionMenuItem>
          <ActionMenuItem data-testid="disabled" disabled>
            잠김
          </ActionMenuItem>
          {/* 값 목록의 「지금 값」. role=listbox 의 aria-selected 이며, 행동 목록의
              aria-checked(글리프)와 다른 축이다 — 여기서는 면이 그것을 말한다. */}
          <ActionMenuItem data-testid="selected" aria-selected="true">
            한국어
          </ActionMenuItem>
        </ActionMenuContent>
      </ActionMenu>
    </OverlayProvider>,
  );
  await userEvent.click(find("button.louis-button"));
  await expect.poll(() => document.querySelector(".louis-menu__item")).not.toBeNull();

  // 패널 면은 Default의 background를 소유하고, 항목의 면은 hover에서만 칠해진다.
  const panel = find('.louis-popover[data-kind="action-menu"]');
  expect(getComputedStyle(panel).backgroundColor, "panel background").toBe(
    tokenValue(stateOf(spec, "Default").background as string, "background-color"),
  );

  const plain = find('[data-testid="plain"]');
  expect(getComputedStyle(plain).color, "Default foreground").toBe(
    tokenValue(stateOf(spec, "Default").foreground, "color"),
  );

  const danger = find('[data-testid="danger"]');
  assertPaint(danger, stateOf(spec, "Danger"), "menu/Danger");

  const disabled = find('[data-testid="disabled"]');
  assertPaint(disabled, stateOf(spec, "Disabled"), "menu/Disabled");

  await userEvent.hover(plain);
  assertPaint(plain, stateOf(spec, "Hover"), "menu/Hover");
  await userEvent.unhover(plain);

  const selected = find('[data-testid="selected"]');
  assertPaint(selected, stateOf(spec, "Selected"), "menu/Selected");

  await userEvent.hover(danger);
  assertPaint(danger, stateOf(spec, "DangerHover"), "menu/DangerHover");
  // **포인터를 치운다.** 얹은 채로 두면 뒤에 같은 좌표에 렌더되는 요소가 :hover를 받는다.
  await userEvent.unhover(danger);
});

test("Dialog surface의 states 표가 코드와 같다", async () => {
  const spec = statesOf("dialog", "base");
  await page.viewport(1280, 900);
  await render(
    <OverlayProvider>
      <Dialog open size="medium" onOpenChange={() => {}}>
        <DialogSurface>
          <DialogTitle>제목</DialogTitle>
        </DialogSurface>
      </Dialog>
    </OverlayProvider>,
  );
  assertPaint(find(".louis-dialog__surface"), stateOf(spec, "Default"), "dialog/Default");
});

test("ProjectCard의 states 표가 코드와 같다", async () => {
  const spec = statesOf("project-card", "base");
  await render(
    <div style={{ inlineSize: "360px" }}>
      <ProjectCard>
        <ProjectCardMedia>
          <ProjectCardOverlay>
            <ProjectCardTitle>여름 여행</ProjectCardTitle>
          </ProjectCardOverlay>
        </ProjectCardMedia>
        <ProjectCardAction />
      </ProjectCard>
    </div>,
  );
  // 프레임은 배경을 칠하지 않는다(미디어 면이 칠한다). 제목이 foreground를 갖는다.
  const card = find(".louis-project-card");
  const cardStyle = getComputedStyle(card);
  expect(cardStyle.backgroundColor, "card background").toBe(TRANSPARENT);
  // DS-D-0023: 프레임 경계는 border가 아니라 generic 헤어라인 inset이다.
  expect(cardStyle.borderTopWidth, "card border 제거").toBe("0px");
  expect(cardStyle.boxShadow, "card 헤어라인").toContain("inset");
  expect(cardStyle.boxShadow, "card 헤어라인 색").toContain(
    tokenValue("color-stroke-hairline", "color"),
  );
  expect(getComputedStyle(find(".louis-project-card-title")).color, "title foreground").toBe(
    tokenValue(stateOf(spec, "Default").foreground, "color"),
  );
});

test("states 표를 코드가 빠짐없이 읽는다", () => {
  // 이 파일과 component-states / text-field 테스트가 함께 measured의 모든 states를 덮어야 한다.
  // 새 컴포넌트가 states를 추가하고 테스트를 잊으면 여기서 걸린다 — 실제로 다섯이 그렇게 덮이지
  // 않은 채 있었고, TextField를 추가했을 때도 이 가드가 먼저 걸렸다.
  const covered = new Set([
    "alert", //           alert.browser.test.tsx — 레이아웃 × 톤 12조합
    "button", //          component-states.browser.test.tsx
    "icon-button", //     component-states.browser.test.tsx
    "app-shell-parts", // app-shell-parts.browser.test.tsx
    "badge", //           badge.browser.test.tsx
    "spinner", //         spinner.browser.test.tsx
    "empty-state", //     empty-state.browser.test.tsx
    "input", //           text-field.browser.test.tsx
    "avatar", //          avatar.browser.test.tsx
    "checkbox", //        checkbox.browser.test.tsx
    "select", //           select.browser.test.tsx — Default·Hover·Open·Disabled 넷
    "selectable-list-row", // selectable-list-row.browser.test.tsx
    "segmented-control", // segmented-control.browser.test.tsx
    "tooltip",
    "toast",
    "menu-popover",
    "dialog",
    "project-card",
    "sidebar-cta", //     sidebar-parts.browser.test.tsx
    "progress-bar", //    progress.browser.test.tsx
    "progress-ring", //   progress.browser.test.tsx
    // 아래 셋은 LOUIS recipe 가 없다(figmaAhead). 그려 볼 코드가 없어 「표가 부르는 이름이
    // 토큰층에 실재하는가 · 표가 스스로 선언한 규칙이 실브라우저에서 참인가」를 잰다.
    // 각 파일 머리말이 그 경계를 적는다 — 재는 범위를 넓혀 적으면 없는 것을 지키는 척하게 된다.
    "canvas-edge", //     canvas-edge.browser.test.tsx
    "floating-shell", //  floating-shell.browser.test.tsx
    "pill-trigger", //    floating-shell.browser.test.tsx — 문서가 하나라 파일도 하나다
  ]);
  const declared = Object.entries(measured.components)
    .filter(([, value]) => (value as { states?: unknown }).states !== undefined)
    .map(([id]) => id);
  expect(declared.filter((id) => !covered.has(id)), "테스트가 없는 states 표").toEqual([]);
});

export type _EnsureTsx = JSX.Element;
