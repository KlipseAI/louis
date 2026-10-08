// figma/components.measured.json 의 **floating-shell · pill-trigger** 값을 코드가 여전히 만드는지
// 검증한다. 둘이 한 파일인 이유는 문서가 하나이기 때문이다(design/components/floating-shell.md).
//
// **이 회차에서 재는 대상이 바뀌었다.** 이전 판에는 LOUIS recipe 가 없어서 「표가 부르는 이름이
// 토큰층에 실재하는가」만 잴 수 있었고, 여백·간격·높이·흐림 4 · 캐럿의 향은 문서가
// 「아직 재지 못하는 것」으로 남겨 두고 있었다. 이제 `packages/css/src/component/floating-shell.css`
// 가 서서 그 다섯이 전부 측정 대상이 된다 — 그리는 코드가 없어 못 재던 것이지 재기 싫었던 것이
// 아니다.
//
// **React 컴포넌트가 아니라 클래스 마크업을 렌더한다.** 두 조형은 packages/react/src 에 표면이
// 없고 정본이 CSS 다 — 소비처가 제품 캔버스 네 자리뿐이라 React 로 감쌀 근거가 아직 없다
// (alert · switch · node-chip · inspector-row 가 같은 형태다). 여기서 렌더하는 마크업은 문서
// Anatomy 절의 계약 그대로여야 한다.
//
// **저작 CSS 를 함께 import 한다.** 생성물 `styles.css` 가 정본이지만, 다른 저작 파일 하나가
// 빌드를 막으면 번들에 이 컴포넌트가 없는 채로 통과할 수 있다. stat-tile 이 같은 이유로 같은
// 것을 한다 — 재는 대상은 「생성물이 최신인가」가 아니라 「저작 CSS 가 계약값을 만드는가」다.
//
//   1. 두 표의 토큰 이름이 라이트·다크 양쪽에 **실재한다**(오타·개명을 잡는다).
//   2. 면과 잉크가 **테마를 타는 세만틱**이다. 고정 팔레트 토큰을 잘못 적으면 걸린다.
//   3. 레시피가 기록의 **기하**를 만든다 — 높이 40 은 선언이 아니라 파생값이라 여기서만 재진다.
//   4. 프레임이 공용 헤어라인 recipe(`--louis-hairline-inset`)가 칠하는 그 색·그 알파다(DS-D-0023).
//   5. 호버가 **색이 아니라 같은 면의 알파**를 올린다 — 실제 포인터를 얹어서 잰다.
//   6. 셸과 트리거가 **같은 유리**다 — 면 · 흐림 · 반경 · 헤어라인 넷이 한 묶음이라는 것이
//      두 조형을 한 문서에 둔 이유이고, 그 불변식을 여기서 직접 잰다.
//   7. 열림이 바꾸는 것은 **캐럿의 향뿐**이다 — 면도 잉크도 그대로다.
import type { JSX } from "react";
import { expect, test } from "vitest";
import { userEvent } from "vitest/browser";
import { render } from "vitest-browser-react";
import measured from "../../../figma/components.measured.json" with { type: "json" };
import "@klipse-design/css/layers.css";
import "@klipse-design/css/tokens.css";
import "@klipse-design/css/styles.css";
import "../../css/src/component/floating-shell.css";

type Paint = { background: string; foreground?: string; frame: string };

/**
 * 두 표의 **모양이 다르다.** floating-shell 은 `states.shell.Default` 로 한 겹 묶여 있고
 * pill-trigger 는 `states.Default` 가 곧 칸이다. 접어서 하나로 만들지 않고 각자 읽는다 —
 * 접으면 어느 쪽이 어떤 모양인지가 이 파일에서 사라진다.
 */
const shellComponent = measured.components["floating-shell"] as {
  states: { shell: Record<string, unknown> };
  sizes: { shell: Record<string, unknown> };
};
const triggerComponent = measured.components["pill-trigger"] as {
  states: Record<string, unknown>;
  sizes: Record<string, Record<string, unknown>>;
};

const shellStates = shellComponent.states.shell as Record<string, Paint>;
const triggerStates = triggerComponent.states as Record<string, Paint>;

/** `sizes` 의 수치 한 칸. `$…` 사유와 한 객체에 섞여 있어 타입이 열려 있다 — 수가 아니면 던진다. */
function sizeOf(spec: Record<string, unknown>, key: string, label: string): number {
  const value = spec[key];
  if (typeof value !== "number") throw new Error(`${label}.${key}가 수가 아닙니다`);
  return value;
}

const shellSize = (key: string): number =>
  sizeOf(shellComponent.sizes.shell, key, "floating-shell.sizes.shell");

/** `state` 이름으로 sizes 의 같은 칸을 집는다. 두 표가 같은 이름을 쓰는 것이 계약이다. */
function shellAlpha(state: string): number {
  if (!(state in shellStates)) throw new Error(`floating-shell.states.${state}가 없습니다`);
  return shellSize("surfaceAlpha");
}
function triggerSize(state: string, key: string): number {
  const spec = triggerComponent.sizes[state];
  if (spec === undefined) throw new Error(`pill-trigger.sizes.${state}가 없습니다`);
  return sizeOf(spec, key, `pill-trigger.sizes.${state}`);
}

type Rgba = { r: number; g: number; b: number; a: number };

/** 토큰이 `color(srgb …)` 로 발행돼 있어 문자열 비교는 형태 때문에 갈린다. 성분으로 내린다. */
function parseColor(value: string): Rgba {
  const open = value.indexOf("(");
  if (open === -1) throw new Error(`색을 읽지 못했습니다: ${value}`);
  const fn = value.slice(0, open).trim();
  const body = value.slice(open + 1, value.lastIndexOf(")"));
  const [head, tail] = body.split("/");
  const parts = (head ?? "")
    .trim()
    .split(/[\s,]+/)
    .filter((part) => /^[-+.\d]/.test(part))
    .map((part) => Number.parseFloat(part));
  if (parts.length < 3) throw new Error(`색을 읽지 못했습니다: ${value}`);
  const alpha =
    tail !== undefined ? Number.parseFloat(tail) : parts.length > 3 ? (parts[3] as number) : 1;
  const scale = fn === "color" ? 255 : 1;
  return {
    r: Math.round((parts[0] as number) * scale),
    g: Math.round((parts[1] as number) * scale),
    b: Math.round((parts[2] as number) * scale),
    a: Math.round(alpha * 1000) / 1000,
  };
}

const rgbOf = (value: string): string => {
  const { r, g, b } = parseColor(value);
  return `${r} ${g} ${b}`;
};
const alphaOf = (value: string): number => parseColor(value).a;
const px = (value: string): number => Number.parseFloat(value);

function declaredToken(id: string): string {
  return getComputedStyle(document.documentElement).getPropertyValue(`--louis-${id}`).trim();
}

function tokenColor(id: string): string {
  const probe = document.createElement("div");
  probe.style.setProperty("color", `var(--louis-${id})`);
  document.body.append(probe);
  const value = getComputedStyle(probe).color;
  probe.remove();
  return value;
}

/**
 * 돌고 있는 전이가 **끝날 때까지** 기다린다.
 *
 * 트리거는 `background-color` 에 전이를 걸고 있어서, 호버를 얹거나 테마를 뒤집은 직후에
 * 계산 스타일을 읽으면 보간 중인 색(Chromium 은 `oklab(…)` 으로 발행한다)이 나온다 — 계약값이
 * 아니라 계약값으로 **가는 중인** 값이다. 실제로 첫 판이 그것을 재고 빨개졌다.
 *
 * `document.getAnimations()` 는 돌고 있는 CSS 전이를 그대로 돌려주므로 sleep 이나 폴링 없이
 * 정확히 그 시점을 잡는다. 전이가 없으면(reduced-motion 프로젝트는 지속시간이 0 이다) 빈 배열이라
 * 즉시 풀린다.
 */
async function settle(): Promise<void> {
  // 스타일 재계산을 강제해 방금 바뀐 선언이 전이를 실제로 시작하게 한다.
  void getComputedStyle(document.body).backgroundColor;
  await Promise.all(
    document.getAnimations().map((animation) => animation.finished.catch(() => undefined)),
  );
}

function find(testId: string): HTMLElement {
  const node = document.querySelector(`[data-testid="${testId}"]`);
  if (node === null) throw new Error(`찾지 못했습니다: ${testId}`);
  return node as HTMLElement;
}

/**
 * 문서 Anatomy 절의 마크업.
 *
 * 셸에는 조각 **셋**을 담는다 — 높이 40 이 「여백 4 + 조각 32 + 여백 4」의 파생값이라는 계약을
 * 재려면 조각이 실제로 서 있어야 하고, 셋이면 간격 4 가 두 번 들어가 폭도 함께 검산된다.
 * 트리거는 닫힘과 열림을 나란히 세운다 — 열림이 바꾸는 것이 캐럿뿐이라는 것을 두 요소를
 * 마주 놓고 재기 위해서다.
 */
function Specimen(): JSX.Element {
  return (
    <div>
      <div className="louis-floating-shell" data-testid="shell">
        <span className="louis-floating-shell__item" data-testid="shell-item" />
        <span className="louis-floating-shell__item" />
        <span className="louis-floating-shell__item" />
      </div>
      <button
        type="button"
        className="louis-pill-trigger"
        data-testid="trigger"
        aria-haspopup="menu"
        aria-expanded={false}
      >
        100%
        <svg
          className="louis-pill-trigger__caret"
          data-testid="trigger-caret"
          viewBox="0 0 10 10"
          aria-hidden="true"
        />
      </button>
      <button
        type="button"
        className="louis-pill-trigger"
        data-testid="trigger-open"
        aria-haspopup="menu"
        aria-expanded
      >
        100%
        <svg
          className="louis-pill-trigger__caret"
          data-testid="trigger-open-caret"
          viewBox="0 0 10 10"
          aria-hidden="true"
        />
      </button>
    </div>
  );
}

/** 두 표를 한 줄씩 펼친다 — `[컴포넌트, 상태, 칸]`. */
function rows(): Array<[string, string, Paint]> {
  return [
    ...Object.entries(shellStates).map(
      ([state, paint]) => ["floating-shell", state, paint] as [string, string, Paint],
    ),
    ...Object.entries(triggerStates).map(
      ([state, paint]) => ["pill-trigger", state, paint] as [string, string, Paint],
    ),
  ];
}

test("두 표가 부르는 토큰이 라이트·다크 양쪽에 실재한다", () => {
  let checked = 0;
  for (const theme of ["light", "dark"] as const) {
    document.documentElement.setAttribute("data-theme", theme);
    for (const [component, state, paint] of rows()) {
      for (const [field, value] of Object.entries(paint)) {
        if (field.startsWith("$")) continue;
        expect(declaredToken(value as string), `${theme} ${component}/${state}.${field} — ${value}`).not.toBe("");
        checked += 1;
      }
    }
  }
  document.documentElement.removeAttribute("data-theme");
  expect(checked, "검사한 토큰 수").toBeGreaterThan(0);
});

test("면과 잉크가 테마를 타는 세만틱이다", () => {
  for (const [component, state, paint] of rows()) {
    const ink: Record<string, string> = {};
    const surface: Record<string, string> = {};
    for (const theme of ["light", "dark"] as const) {
      document.documentElement.setAttribute("data-theme", theme);
      surface[theme] = rgbOf(tokenColor(paint.background));
      if (paint.foreground === undefined) continue;
      ink[theme] = rgbOf(tokenColor(paint.foreground));
      // 잉크가 면과 같은 색이면 알약 위의 글자가 사라진다. 대비의 **크기**가 아니라 같은지를 본다.
      expect(ink[theme], `${theme} ${component}/${state} 잉크 ≠ 면`).not.toBe(surface[theme]);
    }
    document.documentElement.removeAttribute("data-theme");
    expect(surface["light"], `${component}/${state} 면이 테마를 탄다`).not.toBe(surface["dark"]);
    if (paint.foreground !== undefined) {
      expect(ink["light"], `${component}/${state} 잉크가 테마를 탄다`).not.toBe(ink["dark"]);
    }
  }
});

test("레시피가 기록의 기하를 만든다", async () => {
  await render(<Specimen />);

  const shell = find("shell");
  const shellStyle = getComputedStyle(shell);
  const item = find("shell-item");
  const itemStyle = getComputedStyle(item);

  // **높이 40 은 선언이 아니다.** 계약의 `$height` 가 「여백 4 + 조각 32 + 여백 4 의 파생값」이라
  // 적고 레시피도 그래서 높이를 선언하지 않는다 — 이 줄이 그 파생을 재는 유일한 자리다.
  expect(shell.getBoundingClientRect().height, "셸 높이 = 여백 + 조각 + 여백").toBe(
    shellSize("height"),
  );
  expect(px(shellStyle.paddingTop), "셸 위아래 여백").toBe(shellSize("paddingBlock"));
  expect(px(shellStyle.paddingLeft), "셸 좌우 여백").toBe(shellSize("paddingInline"));
  expect(px(shellStyle.columnGap), "조각 사이").toBe(shellSize("gap"));
  expect(px(shellStyle.borderRadius), "셸 반경").toBe(shellSize("radius"));
  // 경계는 테두리가 아니라 안쪽 헤어라인이다 — 계약의 borderWidth 가 0 인 것이 그 뜻이다.
  expect(px(shellStyle.borderTopWidth), "셸 테두리").toBe(shellSize("borderWidth"));
  expect(px(itemStyle.inlineSize), "조각 폭").toBe(shellSize("itemSize"));
  expect(px(itemStyle.blockSize), "조각 높이").toBe(shellSize("itemSize"));
  expect(px(itemStyle.borderRadius), "조각 곡률").toBe(shellSize("itemRadius"));
  // 폭도 파생이다 — 여백 4 + (32 × 3) + (간격 4 × 2) + 여백 4 = 112.
  expect(shell.getBoundingClientRect().width, "셸 폭 = 조각 셋 + 간격 둘 + 여백").toBe(
    shellSize("paddingInline") * 2 + shellSize("itemSize") * 3 + shellSize("gap") * 2,
  );

  const trigger = find("trigger");
  const triggerStyle = getComputedStyle(trigger);
  expect(trigger.getBoundingClientRect().height, "트리거 높이").toBe(
    triggerSize("Default", "height"),
  );
  expect(px(triggerStyle.paddingTop), "트리거 위아래 여백").toBe(
    triggerSize("Default", "paddingBlock"),
  );
  expect(px(triggerStyle.paddingLeft), "트리거 좌우 여백").toBe(
    triggerSize("Default", "paddingInline"),
  );
  expect(px(triggerStyle.columnGap), "문구와 캐럿 사이").toBe(triggerSize("Default", "gap"));
  expect(px(triggerStyle.borderRadius), "트리거 반경").toBe(triggerSize("Default", "radius"));
  expect(px(triggerStyle.borderTopWidth), "트리거 테두리").toBe(
    triggerSize("Default", "borderWidth"),
  );
  expect(px(triggerStyle.fontSize), "라벨 크기").toBe(triggerSize("Default", "labelFontSize"));
  // 행간 1 — 높이가 36 으로 고정돼 있어 라벨의 행간이 알약을 늘리지 않는다는 그 계약이다.
  expect(px(triggerStyle.lineHeight), "라벨 행간 = 글자 크기").toBe(
    triggerSize("Default", "labelFontSize"),
  );

  const caretStyle = getComputedStyle(find("trigger-caret"));
  expect(px(caretStyle.inlineSize), "캐럿 폭").toBe(triggerSize("Default", "caretSize"));
  expect(px(caretStyle.blockSize), "캐럿 높이").toBe(triggerSize("Default", "caretSize"));
  expect(Number(caretStyle.opacity), "캐럿 불투명도").toBe(triggerSize("Default", "caretOpacity"));
});

test("프레임이 공용 헤어라인 recipe 가 칠하는 그 색이다", async () => {
  await render(<Specimen />);
  for (const theme of ["light", "dark"] as const) {
    document.documentElement.setAttribute("data-theme", theme);
    for (const [component, testId] of [
      ["floating-shell", "shell"],
      ["pill-trigger", "trigger"],
    ] as const) {
      const paint =
        component === "floating-shell"
          ? (Object.values(shellStates)[0] as Paint)
          : (Object.values(triggerStates)[0] as Paint);
      const shadow = getComputedStyle(find(testId)).boxShadow;
      // DS-D-0023: 경계는 border 가 아니라 안쪽 헤어라인 한 겹이다.
      expect(shadow, `${theme} ${component} 헤어라인이 안쪽이다`).toContain("inset");
      expect(rgbOf(shadow), `${theme} ${component} 헤어라인 색`).toBe(
        rgbOf(tokenColor(paint.frame)),
      );
      expect(alphaOf(shadow), `${theme} ${component} 헤어라인 알파`).toBe(
        alphaOf(tokenColor(paint.frame)),
      );
    }
  }
  document.documentElement.removeAttribute("data-theme");
});

test("호버는 색이 아니라 같은 면의 알파를 올린다", async () => {
  await render(<Specimen />);
  const trigger = find("trigger");

  const resting = getComputedStyle(trigger).backgroundColor;
  expect(alphaOf(resting), "쉬고 있을 때의 면 알파").toBe(triggerSize("Default", "surfaceAlpha"));

  await userEvent.hover(trigger);
  await settle();
  const hovered = getComputedStyle(trigger).backgroundColor;
  // 같은 면 변수를 문다 — 호버가 갈라 놓는 것은 색이 아니다.
  expect(rgbOf(hovered), "호버가 면 색을 바꾸지 않는다").toBe(rgbOf(resting));
  expect(alphaOf(hovered), "호버의 면 알파").toBe(triggerSize("Hover", "surfaceAlpha"));
  // 그리고 그 둘이 실제로 갈린다 — 같으면 「호버가 알파를 올린다」가 빈말이 된다.
  expect(alphaOf(hovered), "호버가 알파를 올린다").toBeGreaterThan(alphaOf(resting));

  // 포인터를 치운다. 얹은 채로 두면 뒤에 같은 좌표에 렌더되는 요소가 :hover 를 받는다.
  await userEvent.unhover(trigger);
  await settle();
  expect(alphaOf(getComputedStyle(trigger).backgroundColor), "호버가 풀리면 돌아온다").toBe(
    triggerSize("Default", "surfaceAlpha"),
  );
});

test("셸과 트리거가 같은 유리다", async () => {
  await render(<Specimen />);
  for (const theme of ["light", "dark"] as const) {
    document.documentElement.setAttribute("data-theme", theme);
    // 테마를 뒤집으면 트리거의 `background-color` 전이가 돈다 — 끝난 뒤에 잰다.
    await settle();
    const shell = getComputedStyle(find("shell"));
    const trigger = getComputedStyle(find("trigger"));

    // 재료 넷 — 면 · 흐림 · 반경 · 헤어라인. 이 넷이 한 묶음이라는 것이 두 조형을 한 문서와
    // 한 레시피 파일에 둔 이유다(문서 「왜 한 문서인가」).
    expect(trigger.backgroundColor, `${theme} 같은 면`).toBe(shell.backgroundColor);
    expect(trigger.backdropFilter, `${theme} 같은 흐림`).toBe(shell.backdropFilter);
    expect(trigger.borderRadius, `${theme} 같은 반경`).toBe(shell.borderRadius);
    expect(trigger.boxShadow, `${theme} 같은 헤어라인`).toBe(shell.boxShadow);

    // 흐림 4 는 LOUIS 사다리(10 · 12 · 16)에 없어 이름을 갖지 못한다(문서 Known deviations 1).
    // 이름이 없다고 게이트 밖에 두지 않는다 — 기록의 값과 직접 대조한다.
    expect(shell.backdropFilter, `${theme} 흐림 반경`).toBe(`blur(${shellSize("blurRadius")}px)`);
    expect(alphaOf(shell.backgroundColor), `${theme} 셸 면 알파`).toBe(shellAlpha("Default"));
  }
  document.documentElement.removeAttribute("data-theme");
});

// 캔버스 안에서는 면 색만 `canvas-menu-surface` 로 바뀌고 알파는 그대로다(DS-D-0082). 범위는
// 조상의 `data-louis-scope="canvas"` 와 요소 자신의 같은 속성(포털되는 조각) 둘이다. 라이트에서
// 캔버스 면(흰색)과 앱 메뉴 면(palette-gray-025)이 실제로 갈리는지도 함께 본다 — 같으면 이 시험이
// 범위 규칙을 지워도 통과한다.
test("캔버스 안에서는 면 색이 canvas-menu-surface 이고 알파는 그대로다", async () => {
  await render(
    <>
      <div data-louis-scope="canvas">
        <div className="louis-floating-shell" data-testid="canvas-shell">
          <span className="louis-floating-shell__item" />
        </div>
      </div>
      <button
        type="button"
        className="louis-pill-trigger"
        data-louis-scope="canvas"
        data-testid="canvas-trigger"
        aria-haspopup="menu"
        aria-expanded={false}
      >
        100%
      </button>
      <div className="louis-floating-shell" data-testid="app-shell">
        <span className="louis-floating-shell__item" />
      </div>
    </>,
  );
  for (const theme of ["light", "dark"] as const) {
    document.documentElement.setAttribute("data-theme", theme);
    await settle();
    const canvasRgb = rgbOf(tokenColor("color-canvas-menu-surface"));
    for (const id of ["canvas-shell", "canvas-trigger"]) {
      const paint = getComputedStyle(find(id)).backgroundColor;
      expect(rgbOf(paint), `${theme} ${id} 면 색`).toBe(canvasRgb);
      expect(alphaOf(paint), `${theme} ${id} 면 알파`).toBe(shellAlpha("Default"));
    }
    expect(rgbOf(getComputedStyle(find("app-shell")).backgroundColor), `${theme} 캔버스 밖`).toBe(
      rgbOf(tokenColor("color-bg-menu")),
    );
  }
  document.documentElement.setAttribute("data-theme", "light");
  await settle();
  expect(rgbOf(tokenColor("color-canvas-menu-surface")), "라이트에서 두 면이 갈린다").not.toBe(
    rgbOf(tokenColor("color-bg-menu")),
  );
  document.documentElement.removeAttribute("data-theme");
});

test("열림이 바꾸는 것은 캐럿의 향뿐이다", async () => {
  await render(<Specimen />);
  const closed = getComputedStyle(find("trigger"));
  const open = getComputedStyle(find("trigger-open"));

  expect(open.backgroundColor, "열림은 면을 건드리지 않는다").toBe(closed.backgroundColor);
  expect(open.color, "열림은 잉크를 건드리지 않는다").toBe(closed.color);
  expect(open.boxShadow, "열림은 프레임을 건드리지 않는다").toBe(closed.boxShadow);
  expect(alphaOf(open.backgroundColor), "열림의 면 알파").toBe(triggerSize("Open", "surfaceAlpha"));

  // 180° 회전은 계산 스타일에서 matrix(-1, 0, 0, -1, 0, 0) 이다. 문자열이 아니라 성분으로
  // 읽는다 — 「돌았다」가 아니라 「반 바퀴 돌았다」를 재기 위해서다.
  expect(getComputedStyle(find("trigger-caret")).transform, "닫힘 캐럿은 돌지 않는다").toBe("none");
  const rotated = getComputedStyle(find("trigger-open-caret")).transform;
  const parts = rotated
    .slice(rotated.indexOf("(") + 1, rotated.lastIndexOf(")"))
    .split(",")
    // `+ 0` 은 `-0` 을 0 으로 되돌린다. 회전 행렬의 사인 항은 브라우저가 부호 있는 0 으로 내는데
    // `toEqual` 은 `-0` 과 `0` 을 다르다고 보므로, 부호 없는 0 하나로 정규화한다.
    .map((part) => Math.round(Number.parseFloat(part) * 1000) / 1000 + 0);
  expect(parts.slice(0, 4), "열림 캐럿이 180° 뒤집힌다").toEqual([-1, 0, 0, -1]);
});

export type _EnsureTsx = JSX.Element;
