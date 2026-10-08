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
import { cdp, page, userEvent } from "vitest/browser";
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
  /** 토큰 이름, 또는 `null` — 테두리 자리는 있고 색이 없다(투명). background 의 `null` 과 같은 문법이다. */
  border?: string | null;
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
    if (expected.border === null) {
      expect(style.borderTopColor, `${label} border 투명`).toBe(TRANSPARENT);
    } else if (expected.border === "color-stroke-hairline") {
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

test("Tooltip coachmark의 states 표가 코드와 같다", async () => {
  const spec = statesOf("tooltip", "coachmark");
  await render(
    <OverlayProvider>
      <Tooltip title="제목" content="본문" openDelay={0}>
        <Button>대상</Button>
      </Tooltip>
    </OverlayProvider>,
  );
  await userEvent.hover(find("button.louis-button"));
  await expect.poll(() => document.querySelector('.louis-tooltip[data-layout="coachmark"]')).not.toBeNull();
  assertPaint(
    find('.louis-tooltip[data-layout="coachmark"]'),
    stateOf(spec, "Default"),
    "tooltip/coachmark/Default",
  );
  await userEvent.unhover(find("button.louis-button"));
});

/** 계산된 색의 알파. `color(srgb r g b)` 와 `rgb(...)` 는 알파를 적지 않으면 1 이다. */
function alphaOf(value: string): number {
  const slash = /\/\s*([\d.]+)\s*\)$/.exec(value);
  if (slash !== null) return Number(slash[1]);
  const rgba = /^rgba\([^)]*,\s*([\d.]+)\s*\)$/.exec(value);
  return rgba === null ? 1 : Number(rgba[1]);
}

/**
 * coachmark 의 꼬리와 면은 **한 불투명 재료**다(DS-D-0073).
 *
 * 꼬리(`::before`)는 면 위에 따로 칠해지는 도형이라, 둘이 반투명이면 겹친 자리가 두 번 칠해져
 * 진해지고 면의 테두리가 꼬리 밑으로 비쳐 상자와 꼬리가 두 조각으로 보인다. 둘 중 하나만
 * 바뀌어도 이음새가 돌아오므로 네 방향, 두 테마에서 같은 값이고 알파가 1 인지를 함께 잰다.
 * 꼬리의 테두리를 갖는 변도 면의 테두리와 같은 색이어야 한 덩어리로 읽힌다.
 *
 * **그 테두리는 폭만 남고 색이 없다(DS-D-0080).** 강조색 테두리를 걷되 1px 은 투명으로 남겨
 * 상자와 꼬리의 기하가 움직이지 않게 했다. 그래서 면과 꼬리 변의 색이 투명이고 폭이 1px 인지를
 * 함께 잰다 — 폭을 0 으로 걷으면 상자가 2px 줄고 꼬리가 1px 옮겨 가는데 색만 보면 초록이다.
 */
const COACHMARK_TAIL_EDGES = {
  bottom: ["borderTopColor", "borderLeftColor"],
  top: ["borderBottomColor", "borderRightColor"],
  right: ["borderBottomColor", "borderLeftColor"],
  left: ["borderTopColor", "borderRightColor"],
} as const;

type EdgeColor = "borderTopColor" | "borderRightColor" | "borderBottomColor" | "borderLeftColor";
type EdgeWidth = "borderTopWidth" | "borderRightWidth" | "borderBottomWidth" | "borderLeftWidth";
const widthOf = (color: EdgeColor): EdgeWidth => color.replace(/Color$/, "Width") as EdgeWidth;

/** 네 방향 코치마크를 한 화면에 세운다. positioner 의 `data-side` 가 꼬리의 방향을 정한다. */
async function renderCoachmarkSides(): Promise<(keyof typeof COACHMARK_TAIL_EDGES)[]> {
  const sides = Object.keys(COACHMARK_TAIL_EDGES) as (keyof typeof COACHMARK_TAIL_EDGES)[];
  await render(
    <>
      {sides.map((side) => (
        <div key={side} className="louis-tooltip-positioner" data-side={side}>
          <div className="louis-tooltip" data-layout="coachmark">
            <p className="louis-tooltip__title">제목</p>
            <p className="louis-tooltip__body">본문</p>
          </div>
        </div>
      ))}
    </>,
  );
  return sides;
}

test("Tooltip coachmark의 꼬리와 면이 네 방향 두 테마에서 한 불투명 재료다", async () => {
  const sides = await renderCoachmarkSides();
  const root = document.documentElement;
  const original = root.getAttribute("data-theme");
  const borderWidth = getComputedStyle(root).getPropertyValue("--louis-border-width-default").trim();
  try {
    for (const theme of ["light", "dark"] as const) {
      root.setAttribute("data-theme", theme);
      const material = tokenValue("color-bg-inverse", "background-color");
      for (const side of sides) {
        const label = `${theme}/${side}`;
        const panel = find(`.louis-tooltip-positioner[data-side="${side}"] .louis-tooltip`);
        const surface = getComputedStyle(panel);
        const tail = getComputedStyle(panel, "::before");
        expect(surface.backgroundColor, `${label} 면`).toBe(material);
        expect(alphaOf(surface.backgroundColor), `${label} 면 알파`).toBe(1);
        expect(tail.backgroundColor, `${label} 꼬리 = 면`).toBe(surface.backgroundColor);
        // DS-D-0080 — 면의 테두리는 네 변 모두 폭 1px 이고 색이 없다.
        for (const edge of ["Top", "Right", "Bottom", "Left"] as const) {
          expect(surface[`border${edge}Color`], `${label} 면 ${edge} 투명`).toBe(TRANSPARENT);
          expect(surface[`border${edge}Width`], `${label} 면 ${edge} 폭`).toBe(borderWidth);
        }
        for (const edge of COACHMARK_TAIL_EDGES[side]) {
          expect(tail[edge], `${label} 꼬리 ${edge} = 면 테두리`).toBe(surface.borderTopColor);
          expect(tail[widthOf(edge)], `${label} 꼬리 ${widthOf(edge)}`).toBe(borderWidth);
        }
      }
    }
  } finally {
    if (original === null) root.removeAttribute("data-theme");
    else root.setAttribute("data-theme", original);
  }
});

// DS-D-0080 — 강제 색(Windows 고대비)을 CDP 로 흉내 낸다. 평상시 투명인 테두리가 거기서는
// 시스템 색 실선으로 되살아나야 한다. 면이 시스템 색으로 치환되면 경계 없는 코치마크는 바탕과
// 구분되지 않는다. **결과를 잰다.** Chromium 은 tooltip.css 의 강제 색 블록이 없어도 투명
// 테두리를 시스템 색으로 그리므로(블록을 지우고 돌려 확인했다) 이 테스트가 그 블록을 지키지는
// 않는다 — 지키는 것은 「강제 색에서 경계가 보인다」는 결과다.
async function setForcedColors(active: boolean): Promise<void> {
  await cdp().send("Emulation.setEmulatedMedia", {
    features: active ? [{ name: "forced-colors", value: "active" }] : [],
  });
}

test("Tooltip coachmark의 투명 테두리가 강제 색에서 네 방향 모두 currentColor로 되살아난다", async () => {
  const sides = await renderCoachmarkSides();
  await setForcedColors(true);
  try {
    expect(matchMedia("(forced-colors: active)").matches).toBe(true);
    for (const side of sides) {
      const panel = find(`.louis-tooltip-positioner[data-side="${side}"] .louis-tooltip`);
      const surface = getComputedStyle(panel);
      const tail = getComputedStyle(panel, "::before");
      expect(surface.borderTopColor, `${side} 면 테두리 = currentColor`).toBe(surface.color);
      expect(alphaOf(surface.borderTopColor), `${side} 면 테두리 알파`).toBe(1);
      for (const edge of COACHMARK_TAIL_EDGES[side]) {
        expect(tail[edge], `${side} 꼬리 ${edge} = currentColor`).toBe(tail.color);
      }
    }
  } finally {
    await setForcedColors(false);
  }
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

// 캔버스 안에서 열리는 패널은 `bg-menu` 대신 `canvas-menu-surface` 를 읽는다(DS-D-0082). 범위는 조상의
// `data-louis-scope="canvas"` 와 패널 자신의 같은 속성(`body` 로 포털되는 캔버스 팝오버) 둘이다. 라이트에서
// 두 면이 실제로 갈리는지도 본다 — 같으면 범위 규칙을 지워도 이 시험이 통과한다.
test("Menu 패널이 캔버스 안에서만 canvas-menu-surface 를 읽는다", async () => {
  await render(
    <>
      <div data-louis-scope="canvas">
        <div className="louis-popover" data-testid="panel-in-scope" />
      </div>
      <div className="louis-popover" data-louis-scope="canvas" data-testid="panel-self-scope" />
      <div className="louis-popover" data-testid="panel-app" />
    </>,
  );
  for (const theme of ["light", "dark"] as const) {
    document.documentElement.setAttribute("data-theme", theme);
    const canvas = tokenValue("color-canvas-menu-surface", "background-color");
    expect(getComputedStyle(find('[data-testid="panel-in-scope"]')).backgroundColor, `${theme} 조상 범위`).toBe(canvas);
    expect(getComputedStyle(find('[data-testid="panel-self-scope"]')).backgroundColor, `${theme} 자기 범위`).toBe(canvas);
    expect(getComputedStyle(find('[data-testid="panel-app"]')).backgroundColor, `${theme} 캔버스 밖`).toBe(
      tokenValue("color-bg-menu", "background-color"),
    );
  }
  document.documentElement.setAttribute("data-theme", "light");
  expect(tokenValue("color-canvas-menu-surface", "background-color"), "라이트에서 두 면이 갈린다").not.toBe(
    tokenValue("color-bg-menu", "background-color"),
  );
  document.documentElement.removeAttribute("data-theme");
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
    "drop-zone", //       drop-zone.browser.test.tsx
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
