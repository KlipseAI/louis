// figma/components.measured.json 의 **canvas-edge** states 표를 코드가 실제로 읽는지 검증한다.
//
// 이 표는 세워진 날부터 아무도 읽지 않았다. surface-states.browser.test.tsx 의
// 「states 표를 코드가 빠짐없이 읽는다」가 그 사실을 잡아 낸 자리이고, 그 가드의 뜻은
// **기록만 있고 코드가 그것을 읽지 않으면 그 표는 계약이 아니다** 이다.
//
// **이 컴포넌트에는 LOUIS recipe 가 없다**(계약의 figmaAhead·$noProductRender 가 그 사실을
// 적는다). alert·stat-tile 은 표면이 없어도 정본 CSS 가 있어 클래스 마크업을 렌더해 재지만,
// 엣지는 CSS 한 줄도 없다 — 제품이 SVG 속성과 JS 문자열로 그린다. 그래서 여기서 재는 것은
// 「LOUIS 가 이 조형을 그리는가」가 아니라 **「표가 부르는 이름이 LOUIS 토큰층에 실재하고,
// 표가 스스로 선언한 규칙이 그 층에서 참인가」** 다. 재는 범위를 넓혀 적으면 이 파일이
// 없는 것을 지키는 척하게 된다.
//
// 그래서 다음 넷만 잰다. 넷 다 표에서 읽어 대조하며, 표를 코드에 베끼지 않는다.
//
//   1. 표가 부르는 토큰 이름이 라이트·다크 양쪽에서 **실재한다**(오타·개명을 잡는다).
//   2. 톤마다 실선이 **채널 램프의 500 칸**이고 쉬머가 **같은 램프의 200 칸**이다
//      — 문서 Acceptance tests 2·4 다. edit 에 red-200 을 붙이면 여기서 걸린다.
//   3. Hover 가 채널을 바꾸지 않는다 — 표가 톤마다 두 번 적은 그 이름이 같은 색을 칠한다.
//   4. Hover 의 흰 잉크가 sizes 의 hoverLiftAlpha 와 같은 알파이고, 그 색이 채널 없는 톤의
//      실선과 같다($hoverLiftAlpha 가 적는 「#fafafa = palette-gray 000」이다).
//
// **색 이름을 역조회하지 않는다.** 같은 값을 갖는 토큰이 여럿이라(instagram 과 youtube 가
// 지금 같은 값이다) 계산색 → 이름 역조회는 나중에 넣은 쪽으로 붙는다.
import type { JSX } from "react";
import { expect, test } from "vitest";
import { render } from "vitest-browser-react";
import measured from "../../../figma/components.measured.json" with { type: "json" };
import "@klipse-design/css/layers.css";
import "@klipse-design/css/tokens.css";
import "@klipse-design/css/styles.css";

/** 표 한 칸. `$`로 시작하는 형제 키는 사유이고 값이 아니다. */
type EdgePaint = {
  stroke: string;
  shimmer?: string | null;
  strokeLift?: string | null;
};

const component = measured.components["canvas-edge"] as {
  states: Record<string, Record<string, unknown>>;
  sizes: { base: Record<string, unknown> };
};
const tones: Record<string, Record<string, EdgePaint>> = Object.fromEntries(
  Object.entries(component.states).map(([tone, group]) => [
    tone,
    group as Record<string, EdgePaint>,
  ]),
);
const base = component.sizes.base;

/** `sizes` 의 수치 한 칸. `$…` 사유와 한 객체에 섞여 있어 타입이 열려 있다 — 수가 아니면 던진다. */
function sizeOf(key: string): number {
  const value = base[key];
  if (typeof value !== "number") throw new Error(`canvas-edge.sizes.base.${key}가 수가 아닙니다`);
  return value;
}

/** Tone 축에서 **채널이 없는** 칸. edgeTone.ts 의 이름 그대로이며 흰 잉크의 정체를 이 칸이 갖는다. */
const BASE_TONE = "default";
/** State 축의 두 칸. Figma 변형이 갖는 것이 이 둘뿐이다(문서 States 절). */
const DEFAULT_STATE = "Default";
const HOVER_STATE = "Hover";

type Rgba = { r: number; g: number; b: number; a: number };

/**
 * 계산색 문자열을 숫자로 읽는다.
 *
 * 토큰이 `color(srgb …)` 로 발행돼 있어 브라우저 직렬화가 `rgb()` 와 다른 형태로 나온다.
 * 문자열끼리 비교하면 같은 색이 형태 때문에 갈리므로 성분으로 내려서 비교한다.
 */
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

/** 토큰이 **선언돼 있는지** 본다. 없으면 빈 문자열이라 오타·개명이 여기서 걸린다. */
function declaredToken(id: string): string {
  return getComputedStyle(document.documentElement).getPropertyValue(`--louis-${id}`).trim();
}

/** 토큰의 계산값. 이름 역조회를 하지 않기 위해 기대 토큰 쪽을 탐침으로 푼다. */
function tokenColor(id: string): string {
  const probe = document.createElement("div");
  probe.style.setProperty("color", `var(--louis-${id})`);
  document.body.append(probe);
  const value = getComputedStyle(probe).color;
  probe.remove();
  return value;
}

function find(testId: string): SVGPathElement {
  const node = document.querySelector(`[data-testid="${testId}"]`);
  if (node === null) throw new Error(`찾지 못했습니다: ${testId}`);
  return node as unknown as SVGPathElement;
}

/**
 * 톤 × 상태마다 실선 하나를 그린다.
 *
 * 곡선과 두께는 계약의 시편 값이다 — 좌표는 두 핸들이 정하는 데이터라 계약이 아니고
 * 이 수는 그것을 그려 보이는 시편의 크기다($specimenWidth). 색은 **표에서 읽어** 칠한다.
 */
function Specimen(): JSX.Element {
  const width = sizeOf("specimenWidth");
  const height = sizeOf("specimenHeight");
  const spanX = sizeOf("specimenSpanX");
  const spanY = sizeOf("specimenSpanY");
  const insetX = (width - spanX) / 2;
  const top = (height - spanY) / 2;
  const bottom = top + spanY;
  const control = spanX / 2;
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} aria-hidden="true">
      {Object.entries(tones).flatMap(([tone, group]) =>
        Object.entries(group).map(([state, paint]) => (
          <path
            key={`${tone}-${state}`}
            data-testid={`edge-${tone}-${state}`}
            d={`M ${insetX} ${bottom} C ${insetX + control} ${bottom} ${insetX + control} ${top} ${insetX + spanX} ${top}`}
            fill="none"
            strokeWidth={sizeOf("strokeWidth")}
            strokeLinecap="round"
            style={{ stroke: `var(--louis-${paint.stroke})` }}
          />
        )),
      )}
    </svg>
  );
}

test("states 표가 부르는 토큰이 라이트·다크 양쪽에 실재한다", () => {
  let checked = 0;
  for (const theme of ["light", "dark"] as const) {
    document.documentElement.setAttribute("data-theme", theme);
    for (const [tone, group] of Object.entries(tones)) {
      for (const [state, paint] of Object.entries(group)) {
        for (const [field, value] of Object.entries(paint)) {
          // `$…`는 사유이고, null 은 「이 톤은 그것을 갖지 않는다」는 실측이다(둘 다 이름이 아니다).
          if (field.startsWith("$") || value === null) continue;
          expect(declaredToken(value as string), `${theme} ${tone}/${state}.${field} — ${value}`).not.toBe("");
          checked += 1;
        }
      }
    }
  }
  document.documentElement.removeAttribute("data-theme");
  // 표가 통째로 비면 위 루프가 아무것도 돌지 않고 조용히 통과한다.
  expect(checked, "검사한 토큰 수").toBeGreaterThan(0);
});

test("톤마다 실선이 채널 램프의 500 칸이고 쉬머가 같은 램프의 200 칸이다", async () => {
  await render(<Specimen />);
  let checked = 0;
  for (const [tone, group] of Object.entries(tones)) {
    const paint = group[DEFAULT_STATE];
    if (paint === undefined) throw new Error(`${tone}에 ${DEFAULT_STATE}가 없습니다`);
    const shimmer = paint.shimmer;
    // 채널이 없는 톤은 쉬머가 null 이다 — 하이라이트가 베이스와 같은 색이라 이름이 없다.
    if (shimmer === null || shimmer === undefined) continue;
    const family = /^color-([a-z]+)-200$/.exec(shimmer);
    expect(family, `${tone} 쉬머가 램프의 200 칸이다 — ${shimmer}`).not.toBeNull();
    const rung500 = `color-${(family as RegExpExecArray)[1]}-500`;
    expect(rgbOf(getComputedStyle(find(`edge-${tone}-${DEFAULT_STATE}`)).stroke), `${tone} 실선 = ${rung500}`).toBe(
      rgbOf(tokenColor(rung500)),
    );
    expect(alphaOf(tokenColor(shimmer)), `${tone} 쉬머가 불투명하다`).toBe(1);
    checked += 1;
  }
  expect(checked, "채널을 가진 톤 수").toBeGreaterThan(0);
});

test("Hover 는 채널을 바꾸지 않는다", async () => {
  await render(<Specimen />);
  for (const tone of Object.keys(tones)) {
    const hover = getComputedStyle(find(`edge-${tone}-${HOVER_STATE}`)).stroke;
    const normal = getComputedStyle(find(`edge-${tone}-${DEFAULT_STATE}`)).stroke;
    expect(rgbOf(hover), `${tone} Hover 실선`).toBe(rgbOf(normal));
  }
});

test("Hover 의 흰 잉크가 hoverLiftAlpha 이고 채널 없는 톤의 실선 색이다", () => {
  const baseTone = tones[BASE_TONE];
  if (baseTone === undefined) throw new Error(`Tone 축에 ${BASE_TONE}가 없습니다`);
  const baseStroke = baseTone[DEFAULT_STATE];
  if (baseStroke === undefined) throw new Error(`${BASE_TONE}에 ${DEFAULT_STATE}가 없습니다`);
  const paper = tokenColor(baseStroke.stroke);

  let lifted = 0;
  for (const [tone, group] of Object.entries(tones)) {
    const hover = group[HOVER_STATE];
    if (hover === undefined) throw new Error(`${tone}에 ${HOVER_STATE}가 없습니다`);
    // **null 도 값이다.** 필드가 통째로 사라지면 「hover 에 색을 바꾸지 않는다」는 실측이
    // 기록에서 사라지고 이 시험은 그 톤을 건너뛴 채 통과한다.
    expect("strokeLift" in hover, `${tone} Hover 에 strokeLift 칸이 있다`).toBe(true);
    const lift = hover.strokeLift;
    if (lift === null || lift === undefined) continue;
    const ink = tokenColor(lift);
    expect(alphaOf(ink), `${tone} 흰 잉크의 알파`).toBe(sizeOf("hoverLiftAlpha"));
    expect(rgbOf(ink), `${tone} 흰 잉크의 색 = ${BASE_TONE} 실선`).toBe(rgbOf(paper));
    lifted += 1;
  }
  expect(lifted, "흰 잉크를 얹는 톤 수").toBeGreaterThan(0);
});

export type _EnsureTsx = JSX.Element;
