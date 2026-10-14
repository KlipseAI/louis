// LOUIS 레시피 packages/css/src/component/canvas-edge.css 가 figma/components.measured.json 의 **canvas-edge** 와
// **canvas-edge-delete** 값을 여전히 만드는지 실브라우저에서 잰다(DS-D-0035 (c), 2026-10-14 DS-D-0100).
//
// canvas-edge.browser.test.tsx 는 states 표가 부르는 **이름**이 토큰층에 실재하는지를 잰다(레시피가 없던 시절의 근거). 이 파일은
// 레시피가 선 뒤의 반대 방향이다 — 클래스 마크업을 렌더해 실선의 두께 · 끝 · 톤 · hover 잉크, 히트 영역, 라벨 감싸개, 삭제 버튼의
// 기하 · 면 · 대비를 기록과 맞댄다. 쉬머 한 겹은 레시피 밖이다(제품 JS 의 톤 표) — 여기서 재지 않는다.
import type { JSX } from "react";
import { expect, test } from "vitest";
import { render } from "vitest-browser-react";
import measured from "../../../figma/components.measured.json" with { type: "json" };
import "@klipse-design/css/layers.css";
import "@klipse-design/css/tokens.css";
import "@klipse-design/css/styles.css";
import { backdrop, contrastOn, find, parseColor, px } from "./fixtures/contrast";

const edgeBase = measured.components["canvas-edge"].sizes.base as Record<string, unknown>;
const deleteSizes = measured.components["canvas-edge-delete"].sizes as Record<string, Record<string, unknown>>;

function num(spec: Record<string, unknown>, field: string, label: string): number {
  const value = spec[field];
  if (typeof value !== "number") throw new Error(`${label}.${field}가 수가 아닙니다`);
  return value;
}

const TONES = ["default", "image", "text", "youtube", "instagram", "edit", "audio"] as const;
type Tone = (typeof TONES)[number];
/** 제품 `TONE_LIFTS_ON_HOVER` — hover 에서 흰 잉크를 섞는 넷. */
const LIFTS: ReadonlySet<Tone> = new Set<Tone>(["youtube", "instagram", "edit", "audio"]);
const STROKE_TOKEN: Record<Tone, string> = {
  default: "color-canvas-edge-default",
  image: "color-node-handle-icon-image",
  text: "color-node-handle-icon-text",
  youtube: "color-node-handle-icon-youtube",
  instagram: "color-node-handle-icon-instagram",
  edit: "color-node-handle-icon-edit",
  audio: "color-node-handle-icon-audio",
};

/** 토큰(또는 CSS 색 식)을 같은 브라우저의 같은 프로퍼티로 계산시킨다. */
function computed(expression: string): string {
  const probe = document.createElement("div");
  probe.style.setProperty("color", expression);
  document.body.append(probe);
  const value = getComputedStyle(probe).color;
  probe.remove();
  return value;
}

function sameColor(a: string, b: string, label: string): void {
  const x = parseColor(a);
  const y = parseColor(b);
  for (let i = 0; i < 3; i += 1) expect(Math.abs((x[i] ?? 0) - (y[i] ?? 0)), `${label} 채널 ${i}`).toBeLessThan(1.5);
  expect(Math.abs((x[3] ?? 1) - (y[3] ?? 1)), `${label} 알파`).toBeLessThan(0.01);
}

const PATH = "M 8 88 C 120 88 120 32 232 32";

function Edges(): JSX.Element {
  return (
    <div style={{ background: "var(--louis-color-bg-canvas)" }}>
      <svg width={240} height={120 * TONES.length * 2} aria-hidden="true">
        {TONES.flatMap((tone, index) =>
          [false, true].map((hovered) => (
            <g
              key={`${tone}-${hovered}`}
              className="louis-canvas-edge"
              data-tone={tone}
              data-hovered={hovered ? "true" : "false"}
              transform={`translate(0 ${(index * 2 + (hovered ? 1 : 0)) * 120})`}
            >
              <path className="louis-canvas-edge__base" d={PATH} data-testid={`base-${tone}-${hovered ? "hover" : "rest"}`} />
            </g>
          )),
        )}
        <path className="louis-canvas-edge__hit" d={PATH} data-testid="hit" />
      </svg>
    </div>
  );
}

function DeleteButton({ visible, suffix }: { readonly visible: boolean; readonly suffix: string }): JSX.Element {
  return (
    <div style={{ position: "relative", inlineSize: 200, blockSize: 100, background: "var(--louis-color-bg-canvas)" }} data-testid={`canvas-${suffix}`}>
      <div className="louis-canvas-edge__label" data-visible={visible ? "true" : "false"} style={{ transform: "translate(-50%, -50%) translate(100px, 50px)" }} data-testid={`label-${suffix}`}>
        <button type="button" className="louis-canvas-edge__delete" aria-label="연결 삭제" data-testid={`delete-${suffix}`}>
          <svg className="louis-canvas-edge__delete-glyph" viewBox="0 0 8 8" aria-hidden="true" data-testid={`glyph-${suffix}`}>
            <path d="M1 1l6 6M7 1L1 7" />
          </svg>
        </button>
      </div>
    </div>
  );
}

async function settle(): Promise<void> {
  void getComputedStyle(document.body).opacity;
  await Promise.all(document.getAnimations().map((animation) => animation.finished));
}

test("실선이 기록의 두께 · 둥근 끝이고 톤마다 그 채널 토큰을 문다", async () => {
  await render(<Edges />);
  for (const tone of TONES) {
    const style = getComputedStyle(find(`base-${tone}-rest`));
    expect(px(style.strokeWidth), `${tone} 두께`).toBe(num(edgeBase, "strokeWidth", "canvas-edge.sizes.base"));
    expect(style.strokeLinecap, `${tone} 끝`).toBe("round");
    expect(style.fill, `${tone} 채움`).toBe("none");
    expect(style.pointerEvents, `${tone} 포인터`).toBe("none");
    sameColor(style.stroke, computed(`var(--louis-${STROKE_TOKEN[tone]})`), `${tone} 실선`);
  }
});

test("hover 는 넷에서만 흰 잉크를 hoverLiftAlpha 만큼 섞고 셋은 그대로다", async () => {
  await render(<Edges />);
  await settle();
  const lift = num(edgeBase, "hoverLiftAlpha", "canvas-edge.sizes.base");
  for (const tone of TONES) {
    const rest = getComputedStyle(find(`base-${tone}-rest`)).stroke;
    const hover = getComputedStyle(find(`base-${tone}-hover`)).stroke;
    if (LIFTS.has(tone)) {
      const expected = computed(
        `color-mix(in srgb, var(--louis-${STROKE_TOKEN[tone]}) ${Math.round((1 - lift) * 100)}%, var(--louis-color-canvas-edge-hover-ink))`,
      );
      sameColor(hover, expected, `${tone} hover`);
    } else {
      sameColor(hover, rest, `${tone} hover 는 그대로`);
    }
  }
});

test("히트 영역이 투명한 44 두께 획이고 포인터를 받는다", async () => {
  await render(<Edges />);
  const style = getComputedStyle(find("hit"));
  expect(px(style.strokeWidth)).toBe(num(edgeBase, "hitAreaStrokeWidth", "canvas-edge.sizes.base"));
  expect(parseColor(style.stroke)[3]).toBe(0);
  expect(style.cursor).toBe("pointer");
  expect(px(style.strokeWidth)).toBeGreaterThan(num(edgeBase, "strokeWidth", "canvas-edge.sizes.base"));
});

test("채널 없는 실선이 두 테마의 캔버스 위에서 3:1 을 넘는다 — 제품의 라이트 1.03:1 을 고쳐 올렸다", async () => {
  await render(<Edges />);
  for (const theme of ["light", "dark"] as const) {
    document.documentElement.setAttribute("data-theme", theme);
    // 실선은 stroke 에 전이를 건다 — 테마를 뒤집은 직후는 oklab 으로 보간 중인 색이라 끝난 뒤에 잰다.
    await settle();
    const ground = backdrop(find("base-default-rest").closest("div"));
    const ratio = contrastOn(getComputedStyle(find("base-default-rest")).stroke, ground);
    expect(ratio, `${theme} default 실선`).toBeGreaterThanOrEqual(3);
  }
  document.documentElement.removeAttribute("data-theme");
});

test("삭제 버튼의 기하가 기록의 State 키마다 같다", async () => {
  await render(<DeleteButton visible suffix="a" />);
  const keys = Object.keys(deleteSizes);
  expect(keys).toEqual(["Default", "Hover"]);
  for (const key of keys) {
    const spec = deleteSizes[key] as Record<string, unknown>;
    const label = `canvas-edge-delete.sizes.${key}`;
    const button = find("delete-a");
    const box = button.getBoundingClientRect();
    const style = getComputedStyle(button);
    expect(box.width, `${key} 폭`).toBe(num(spec, "width", label));
    expect(box.height, `${key} 높이`).toBe(num(spec, "height", label));
    // 레시피는 `radius-pill`(999)로 적는다 — 그리는 반경은 상자 절반에서 잘린다(제품 `rounded-[50%]` 와 같은 원).
    expect(Math.min(px(style.borderTopLeftRadius), box.height / 2), `${key} 반경`).toBe(num(spec, "radius", label));
    expect(px(style.borderTopWidth), `${key} 테두리`).toBe(num(spec, "borderWidth", label));
    expect(px(style.paddingTop), `${key} 위 여백`).toBe(num(spec, "paddingBlock", label));
    expect(px(style.paddingLeft), `${key} 옆 여백`).toBe(num(spec, "paddingInline", label));
    const glyph = find("glyph-a").getBoundingClientRect();
    expect(glyph.width, `${key} 글리프`).toBe(num(spec, "glyphSize", label));
    // 글리프가 원의 한가운데다.
    expect(glyph.left + glyph.width / 2).toBeCloseTo(box.left + box.width / 2, 1);
    expect(glyph.top + glyph.height / 2).toBeCloseTo(box.top + box.height / 2, 1);
  }
});

test("삭제 버튼의 쉼 면 · 테두리 · 잉크 · 그림자가 시맨틱에서 오고 호버 규칙이 진한 칸을 읽는다", async () => {
  await render(<DeleteButton visible suffix="b" />);
  const style = getComputedStyle(find("delete-b"));
  sameColor(style.backgroundColor, computed("var(--louis-color-canvas-edge-delete-surface)"), "면");
  sameColor(style.borderTopColor, computed("var(--louis-color-canvas-edge-delete-stroke)"), "테두리");
  sameColor(style.color, computed("var(--louis-color-canvas-edge-delete-ink)"), "잉크");
  expect(style.boxShadow).toContain("0px 2px 8px 0px");
  // 호버는 `@media (hover: hover)` 안의 규칙이다 — 진짜 포인터를 옮기지 않고 규칙이 무엇을 읽는지 본다.
  const hover: string[] = [];
  const walk = (rules: CSSRuleList, inHover: boolean): void => {
    for (const rule of Array.from(rules)) {
      if (rule instanceof CSSMediaRule) walk(rule.cssRules, inHover || rule.conditionText.includes("hover: hover"));
      else if (rule instanceof CSSStyleRule && rule.selectorText.includes(".louis-canvas-edge__delete:hover")) {
        expect(inHover, `${rule.selectorText} 가 hover 가드 안이다`).toBe(true);
        hover.push(rule.cssText);
      } else if ("cssRules" in rule) walk((rule as CSSGroupingRule).cssRules, inHover);
    }
  };
  for (const sheet of Array.from(document.styleSheets)) walk(sheet.cssRules, false);
  const text = hover.join("\n");
  expect(text).toContain("var(--louis-color-canvas-edge-delete-surface-hover)");
  expect(text).toContain("var(--louis-color-canvas-edge-delete-stroke-hover)");
  expect(text).toContain("var(--louis-color-fg-on-danger)");
  expect(text).toContain("scale(1.12)");
});

test("삭제 글리프가 두 테마의 붉은 면 위에서 3:1 을 넘는다", async () => {
  await render(<DeleteButton visible suffix="c" />);
  for (const theme of ["light", "dark"] as const) {
    document.documentElement.setAttribute("data-theme", theme);
    await settle();
    const button = find("delete-c");
    const ratio = contrastOn(getComputedStyle(button).color, backdrop(button));
    expect(ratio, `${theme} 글리프`).toBeGreaterThanOrEqual(3);
  }
  document.documentElement.removeAttribute("data-theme");
});

test("라벨은 숨김에서 포인터를 통과시키고 키보드 포커스가 들어오면 보인다", async () => {
  await render(<DeleteButton visible={false} suffix="d" />);
  await settle();
  const label = getComputedStyle(find("label-d"));
  expect(Number(label.opacity)).toBe(0);
  expect(label.pointerEvents).toBe("none");
  find("delete-d").focus();
  await settle();
  const focused = getComputedStyle(find("label-d"));
  expect(Number(focused.opacity)).toBe(1);
  expect(focused.pointerEvents).toBe("auto");
  // 포커스 링 — 제품에는 표시가 없었다.
  expect(getComputedStyle(find("delete-d")).boxShadow).toContain("0px 0px 0px 3px");
});
