// figma/components.measured.json 의 **floating-shell · pill-trigger** states 표를 코드가 실제로
// 읽는지 검증한다. 둘이 한 파일인 이유는 문서가 하나이기 때문이다(design/components/floating-shell.md).
//
// 두 표도 세워진 날부터 아무도 읽지 않았다 — surface-states.browser.test.tsx 의
// 「states 표를 코드가 빠짐없이 읽는다」가 그 자리를 잡았다.
//
// **둘 다 LOUIS recipe 가 없다**(계약의 $why·$noProductRender). alert·stat-tile 처럼 정본 CSS 를
// 렌더해 잴 수가 없고, 문서 Known deviations 1 이 적듯 흐림 4 를 담을 토큰조차 아직 없다.
// 그래서 여기서 재는 것은 「LOUIS 가 이 알약을 그리는가」가 아니라 **「표가 부르는 이름이
// 토큰층에 실재하고, 표가 스스로 선언한 규칙 — 세만틱 면 · 공용 헤어라인 · 알파로만 갈리는
// 호버 — 이 실브라우저에서 참인가」** 다.
//
//   1. 두 표의 토큰 이름이 라이트·다크 양쪽에서 실재한다(오타·개명을 잡는다).
//   2. 면과 잉크가 **테마를 타는 세만틱**이다. 고정 팔레트 토큰을 잘못 적으면 여기서 걸린다.
//   3. 프레임이 공용 헤어라인 recipe(`--louis-hairline-inset`)가 칠하는 그 색이다 — DS-D-0023.
//      제품이 얹는 것과 같은 한 겹이고, 컴포넌트마다 shadow 문자열을 베끼지 않는다는 그 계약이다.
//   4. 호버가 **색이 아니라 같은 면의 알파**를 올린다. 세 상태의 면 rgb 가 같고 알파만
//      sizes 의 surfaceAlpha 대로 갈린다 — 문서 States 절이 그렇게 적는다.
//   5. 셸과 트리거가 **같은 면**을 문다(pill-trigger 의 $background 가 적는 그 사실).
import type { JSX } from "react";
import { expect, test } from "vitest";
import { render } from "vitest-browser-react";
import measured from "../../../figma/components.measured.json" with { type: "json" };
import "@klipse-design/css/layers.css";
import "@klipse-design/css/tokens.css";
import "@klipse-design/css/styles.css";

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

/** `state` 이름으로 sizes 의 같은 칸을 집는다. 두 표가 같은 이름을 쓰는 것이 계약이다. */
function shellAlpha(state: string): number {
  if (!(state in shellStates)) throw new Error(`floating-shell.states.${state}가 없습니다`);
  return sizeOf(shellComponent.sizes.shell, "surfaceAlpha", "floating-shell.sizes.shell");
}
function triggerAlpha(state: string): number {
  const spec = triggerComponent.sizes[state];
  if (spec === undefined) throw new Error(`pill-trigger.sizes.${state}가 없습니다`);
  return sizeOf(spec, "surfaceAlpha", `pill-trigger.sizes.${state}`);
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

function find(testId: string): HTMLElement {
  const node = document.querySelector(`[data-testid="${testId}"]`);
  if (node === null) throw new Error(`찾지 못했습니다: ${testId}`);
  return node as HTMLElement;
}

/**
 * 알약 하나를 표에서 읽어 칠한다.
 *
 * 면은 **합성해서** 칠한다 — 계약이 색과 알파를 따로 갖기 때문이다(색은 states 의 토큰,
 * 알파는 sizes 의 `surfaceAlpha`). 알파가 붙은 면 토큰을 새로 만들지 않는다는 판정이 그
 * 분리를 만들었고, 그래서 이 둘을 합쳐 하나의 면으로 만드는 것이 브라우저의 몫이다.
 */
function Pill({
  id,
  paint,
  alpha,
}: {
  id: string;
  paint: Paint;
  alpha: number;
}): JSX.Element {
  return (
    <div
      data-testid={id}
      style={{
        backgroundColor: `color-mix(in srgb, var(--louis-${paint.background}) ${(alpha * 100).toFixed(4)}%, transparent)`,
        color:
          paint.foreground === undefined ? undefined : `var(--louis-${paint.foreground})`,
        boxShadow: "var(--louis-hairline-inset)",
      }}
    />
  );
}

function Specimen(): JSX.Element {
  return (
    <div>
      {Object.entries(shellStates).map(([state, paint]) => (
        <Pill
          key={`shell-${state}`}
          id={`shell-${state}`}
          paint={paint}
          alpha={shellAlpha(state)}
        />
      ))}
      {Object.entries(triggerStates).map(([state, paint]) => (
        <Pill
          key={`trigger-${state}`}
          id={`trigger-${state}`}
          paint={paint}
          alpha={triggerAlpha(state)}
        />
      ))}
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

test("프레임이 공용 헤어라인 recipe 가 칠하는 그 색이다", async () => {
  await render(<Specimen />);
  for (const theme of ["light", "dark"] as const) {
    document.documentElement.setAttribute("data-theme", theme);
    for (const [component, state, paint] of rows()) {
      const id = component === "floating-shell" ? `shell-${state}` : `trigger-${state}`;
      const shadow = getComputedStyle(find(id)).boxShadow;
      // DS-D-0023: 경계는 border 가 아니라 안쪽 헤어라인 한 겹이다(계약의 borderWidth 도 0 이다).
      expect(shadow, `${theme} ${component}/${state} 헤어라인이 안쪽이다`).toContain("inset");
      expect(rgbOf(shadow), `${theme} ${component}/${state} 헤어라인 색`).toBe(
        rgbOf(tokenColor(paint.frame)),
      );
      expect(alphaOf(shadow), `${theme} ${component}/${state} 헤어라인 알파`).toBe(
        alphaOf(tokenColor(paint.frame)),
      );
    }
  }
  document.documentElement.removeAttribute("data-theme");
});

test("호버는 색이 아니라 같은 면의 알파를 올린다", async () => {
  await render(<Specimen />);
  const measuredSurfaces = Object.keys(triggerStates).map((state) => {
    const composed = getComputedStyle(find(`trigger-${state}`)).backgroundColor;
    return { state, rgb: rgbOf(composed), alpha: alphaOf(composed) };
  });

  const first = measuredSurfaces[0];
  if (first === undefined) throw new Error("pill-trigger.states 가 비어 있습니다");
  for (const surface of measuredSurfaces) {
    // 같은 면 변수를 문다 — 상태가 갈라 놓는 것은 색이 아니다.
    expect(surface.rgb, `${surface.state} 면 색`).toBe(first.rgb);
    expect(surface.alpha, `${surface.state} 면 알파`).toBe(triggerAlpha(surface.state));
  }
  // 그리고 그 알파가 한 값이 아니다 — 접어 두면 「호버가 알파를 올린다」가 사라진다.
  expect(new Set(measuredSurfaces.map((surface) => surface.alpha)).size, "알파가 갈리는 상태가 있다").toBeGreaterThan(1);
});

test("셸과 트리거가 같은 면을 문다", async () => {
  await render(<Specimen />);
  const [shellState] = Object.keys(shellStates);
  const [triggerState] = Object.keys(triggerStates);
  if (shellState === undefined || triggerState === undefined) {
    throw new Error("두 표 중 하나가 비어 있습니다");
  }
  for (const theme of ["light", "dark"] as const) {
    document.documentElement.setAttribute("data-theme", theme);
    const shellPaint = shellStates[shellState] as Paint;
    const triggerPaint = triggerStates[triggerState] as Paint;
    expect(rgbOf(tokenColor(triggerPaint.background)), `${theme} 트리거 면 = 셸 면`).toBe(
      rgbOf(tokenColor(shellPaint.background)),
    );
  }
  document.documentElement.removeAttribute("data-theme");
});

export type _EnsureTsx = JSX.Element;
