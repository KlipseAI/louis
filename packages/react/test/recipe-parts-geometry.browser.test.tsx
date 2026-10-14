// figma/components.measured.json 의 **switch · keycap · node-chip · pane-divider · loading-word** 기하를 코드가 여전히 만드는지 잰다
// (DS-D-0035 (c)). 다섯 다 React 표면이 없는 CSS 레시피라 클래스 마크업을 렌더한다 — 마크업은 각 문서(design/components/*.md)의 예시
// 그대로다. 기록의 키는 Figma 변형 축 값이고, 상태 칸(Hover)은 실제로 올려 잰다.
import type { JSX } from "react";
import { expect, test } from "vitest";
import { page, userEvent } from "vitest/browser";
import { render } from "vitest-browser-react";
import measured from "../../../figma/components.measured.json" with { type: "json" };
import "@klipse-design/css/layers.css";
import "@klipse-design/css/tokens.css";
import "@klipse-design/css/styles.css";
import "../../css/src/component/switch.css";
import "../../css/src/component/keycap.css";
import "../../css/src/component/node-chip.css";
import "../../css/src/component/pane-divider.css";
import "../../css/src/component/loading-word.css";
import { find, px } from "./fixtures/contrast";

/** `sizes` 한 칸의 수 필드. `$…` 사유와 한 객체에 섞여 있어 타입이 열려 있다 — 수가 아니면 던진다. */
function num(spec: Record<string, unknown>, field: string, label: string): number {
  const value = spec[field];
  if (typeof value !== "number") throw new Error(`${label}.${field}가 수가 아닙니다`);
  return value;
}

/** `sizes` 한 칸의 글자 필드(CSS 의 `flex-direction` 값 등). */
function word(spec: Record<string, unknown>, field: string, label: string): string {
  const value = spec[field];
  if (typeof value !== "string") throw new Error(`${label}.${field}가 글자가 아닙니다`);
  return value;
}

/** 전이가 끝난 계산값을 읽는다 — 호버가 그립 길이 · 불투명도를 전이로 옮기므로 중간값을 읽지 않게 한다. */
async function settle(): Promise<void> {
  await Promise.all(document.getAnimations().map((animation) => animation.finished.catch(() => undefined)));
}

function expectPadding(style: CSSStyleDeclaration, inline: number, block: number, label: string): void {
  expect(px(style.paddingLeft), `${label} paddingLeft`).toBe(inline);
  expect(px(style.paddingRight), `${label} paddingRight`).toBe(inline);
  expect(px(style.paddingTop), `${label} paddingTop`).toBe(block);
  expect(px(style.paddingBottom), `${label} paddingBottom`).toBe(block);
}

// ── Switch ─────────────────────────────────────────────────────────────────────────────────────────────────

test("switch: 꺼짐 · 켜짐의 트랙 · 여백 · 반경 · 썸이 기록과 같다 — 켜짐은 썸을 translate 로만 옮긴다", async () => {
  await render(
    <div style={{ display: "grid", gap: 16, justifyItems: "start" }}>
      {(["false", "true"] as const).map((key) => (
        <button key={key} type="button" role="switch" aria-checked={key} aria-label="알림" className="louis-switch" data-testid={`switch-${key}`}>
          <span className="louis-switch__thumb" />
        </button>
      ))}
    </div>,
  );
  await settle();
  for (const key of ["false", "true"] as const) {
    const spec = measured.components.switch.sizes[key];
    const label = `switch.${key}`;
    const root = find(`switch-${key}`);
    const rect = root.getBoundingClientRect();
    const style = getComputedStyle(root);
    expect(rect.width, `${label} width`).toBe(num(spec, "width", label));
    expect(rect.height, `${label} height`).toBe(num(spec, "height", label));
    expectPadding(style, num(spec, "padding", label), num(spec, "padding", label), label);
    expect(px(style.borderTopLeftRadius), `${label} radius`).toBe(num(spec, "radius", label));
    expect(style.flexDirection, label).toBe(word(spec, "direction", label));
    const thumb = root.querySelector<HTMLElement>(".louis-switch__thumb")!;
    const thumbRect = thumb.getBoundingClientRect();
    const thumbStyle = getComputedStyle(thumb);
    expect(px(thumbStyle.inlineSize), `${label} thumb`).toBe(num(spec, "thumbSize", label));
    expect(px(thumbStyle.blockSize), `${label} thumb`).toBe(num(spec, "thumbSize", label));
    // translate 는 그리는 위치만 옮긴다 — 썸의 실제 자리가 패딩 시작 + thumbOffset 이다.
    expect(thumbRect.left - rect.left, `${label} thumb offset`).toBe(
      num(spec, "padding", label) + num(spec, "thumbOffset", label),
    );
  }
});

// ── Keycap ─────────────────────────────────────────────────────────────────────────────────────────────────

test("keycap: 글리프 · 글자 키캡의 최소 폭 · 높이 · 여백 · 반경 · 글자가 기록과 같다", async () => {
  await render(
    <div style={{ display: "flex", gap: 8, alignItems: "start" }}>
      <kbd className="louis-keycap" data-testid="keycap-glyph">⌘</kbd>
      <kbd className="louis-keycap" data-testid="keycap-text">Esc</kbd>
    </div>,
  );
  for (const key of ["glyph", "text"] as const) {
    const spec = measured.components.keycap.sizes[key];
    const label = `keycap.${key}`;
    const root = find(`keycap-${key}`);
    const style = getComputedStyle(root);
    const minWidth = num(spec, "minWidth", label);
    expect(px(style.minInlineSize), `${label} minWidth`).toBe(minWidth);
    expect(root.getBoundingClientRect().width, `${label} width`).toBeGreaterThanOrEqual(minWidth);
    expect(root.getBoundingClientRect().height, `${label} height`).toBe(num(spec, "height", label));
    expectPadding(style, num(spec, "paddingInline", label), num(spec, "paddingBlock", label), label);
    expect(px(style.borderTopLeftRadius), `${label} radius`).toBe(num(spec, "radius", label));
    expect(px(style.fontSize), `${label} fontSize`).toBe(num(spec, "fontSize", label));
    expect(px(style.lineHeight), `${label} lineHeight`).toBe(num(spec, "lineHeight", label));
    expect(style.flexDirection, label).toBe(word(spec, "direction", label));
  }
});

// ── Node Chip ──────────────────────────────────────────────────────────────────────────────────────────────

const GLYPH = (
  <svg className="louis-node-chip__glyph" viewBox="0 0 16 16" aria-hidden="true">
    <path d="M3 8h10" stroke="currentColor" />
  </svg>
);

test("node-chip: default · square · ghost 의 높이 · 여백 · 사이 · 반경 · 글리프 · 글자가 기록과 같다", async () => {
  await render(
    <div style={{ display: "flex", gap: 8, alignItems: "start" }}>
      <button type="button" className="louis-node-chip" data-testid="chip-default/default">
        {GLYPH}
        <span className="louis-node-chip__label">이미지</span>
      </button>
      <button type="button" className="louis-node-chip" data-shape="square" aria-label="사운드 끄기" data-testid="chip-default/square">
        {GLYPH}
      </button>
      <button type="button" className="louis-node-chip" data-variant="ghost" data-testid="chip-ghost/default">
        {GLYPH}
        <span className="louis-node-chip__label">예약</span>
      </button>
    </div>,
  );
  for (const key of ["default/default", "default/square", "ghost/default"] as const) {
    const spec: Record<string, unknown> = measured.components["node-chip"].sizes[key];
    const label = `node-chip.${key}`;
    const root = find(`chip-${key}`);
    const style = getComputedStyle(root);
    const rect = root.getBoundingClientRect();
    expect(rect.height, `${label} height`).toBe(num(spec, "height", label));
    // 글자 칩의 폭은 내용이 정한다(기록에 수가 없다). square 만 수로 맞댄다.
    if (typeof spec.width === "number") expect(rect.width, `${label} width`).toBe(spec.width);
    else expect(typeof spec.$width, `${label} $width`).toBe("string");
    expectPadding(style, num(spec, "paddingInline", label), 0, label);
    expect(px(style.columnGap), `${label} gap`).toBe(num(spec, "gap", label));
    expect(px(style.borderTopLeftRadius), `${label} radius`).toBe(num(spec, "radius", label));
    expect(style.flexDirection, label).toBe(word(spec, "direction", label));
    const glyph = root.querySelector<SVGElement>(".louis-node-chip__glyph")!.getBoundingClientRect();
    expect(glyph.width, `${label} glyph`).toBe(num(spec, "glyphSize", label));
    expect(glyph.height, `${label} glyph`).toBe(num(spec, "glyphSize", label));
    const text = root.querySelector<HTMLElement>(".louis-node-chip__label");
    if (spec.lineHeight === undefined) {
      expect(text, `${label} 은 글자가 없다`).toBeNull();
    } else {
      expect(px(style.fontSize), `${label} fontSize`).toBe(num(spec, "fontSize", label));
      expect(px(style.lineHeight), `${label} lineHeight`).toBe(num(spec, "lineHeight", label));
    }
  }
});

// ── Pane Divider ───────────────────────────────────────────────────────────────────────────────────────────

const PANE_KEYS = ["vertical/Default", "vertical/Hover", "horizontal/Default", "horizontal/Hover"] as const;

function Dividers(): JSX.Element {
  return (
    <div style={{ display: "flex", gap: 24, alignItems: "start", padding: 16 }}>
      {PANE_KEYS.map((key) => {
        const vertical = key.startsWith("vertical");
        return (
          // 판 사이에 끼운 모양 — 뻗는 축의 길이는 부모가 준다(표본 160).
          <div key={key} style={{ display: "flex", flexDirection: vertical ? "row" : "column", [vertical ? "blockSize" : "inlineSize"]: 160 }}>
            <div
              role="separator"
              aria-orientation={vertical ? "vertical" : "horizontal"}
              aria-label="판 크기 조절"
              className={`louis-pane-divider louis-pane-divider--${vertical ? "vertical" : "horizontal"}`}
              data-testid={`pane-${key}`}
            />
          </div>
        );
      })}
    </div>
  );
}

test("pane-divider: 네 칸의 트랙 굵기 · 그립 길이 · 반경 · 여백이 기록과 같다 — Hover 는 실제로 올린다", async () => {
  // 719 이하에서는 가로 구분자가 조밀 칸(트랙 8 · 그립 48)으로 바뀐다 — 기록과 Figma 는 넓은 화면의 칸이다.
  await page.viewport(1024, 768);
  await render(<Dividers />);
  // 줄인 움직임에서는 얹어도 그립이 자라지 않는다(레시피 `prefers-reduced-motion` 블록) — Hover 칸의 길이는 Default 칸과 같아야 한다.
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  for (const key of PANE_KEYS) {
    const spec: Record<string, unknown> = measured.components["pane-divider"].sizes[key];
    const label = `pane-divider.${key}`;
    const root = find(`pane-${key}`);
    if (key.endsWith("/Hover")) await userEvent.hover(root);
    else await userEvent.unhover(root);
    await settle();
    const rect = root.getBoundingClientRect();
    const style = getComputedStyle(root);
    // 트랙 굵기는 수로, 뻗는 축은 부모가 정해 기록에 수가 없다(표본 칸).
    if (typeof spec.width === "number") expect(rect.width, `${label} width`).toBe(spec.width);
    else expect(typeof spec.$width, `${label} $width`).toBe("string");
    if (typeof spec.height === "number") expect(rect.height, `${label} height`).toBe(spec.height);
    else expect(typeof spec.$height, `${label} $height`).toBe("string");
    expectPadding(style, num(spec, "padding", label), num(spec, "padding", label), label);
    expect(px(style.borderTopLeftRadius), `${label} radius`).toBe(num(spec, "radius", label));
    const grip = getComputedStyle(root, "::before");
    const gripSpec: Record<string, unknown> =
      reduced && key.endsWith("/Hover")
        ? measured.components["pane-divider"].sizes[key.replace("/Hover", "/Default") as (typeof PANE_KEYS)[number]]
        : spec;
    expect(px(grip.width), `${label} grip width`).toBe(num(gripSpec, "gripWidth", label));
    expect(px(grip.height), `${label} grip height`).toBe(num(gripSpec, "gripHeight", label));
    expect(grip.opacity, `${label} grip opacity`).toBe(key.endsWith("/Hover") ? "1" : "0");
    expect(px(grip.borderTopLeftRadius), `${label} grip radius`).toBe(num(spec, "gripRadius", label));
  }
});

// ── Loading Word ───────────────────────────────────────────────────────────────────────────────────────────

test("loading-word: 여백 · 모서리가 없다 — flow · reduced 두 칸이 기록과 같다", async () => {
  await render(
    <p>
      <span className="louis-loading-word" data-testid="word">분석 중</span>
    </p>,
  );
  const style = getComputedStyle(find("word"));
  for (const key of ["flow", "reduced"] as const) {
    const spec = measured.components["loading-word"].sizes[key];
    const label = `loading-word.${key}`;
    expectPadding(style, num(spec, "padding", label), num(spec, "padding", label), label);
    expect(px(style.borderTopLeftRadius), `${label} radius`).toBe(num(spec, "radius", label));
  }
});
