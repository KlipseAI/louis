// figma/components.measured.json 의 **asset-tile · color-swatch · logo-tile · notice-pill · canvas-guide** 값을 코드가 여전히
// 만드는지 검증한다(DS-D-0035 (c), 2026-10-13 DS-D-0084 작은 새 부품).
//
// parity 게이트는 Figma 가 기록과 같은지만 본다. 이 파일이 없으면 CSS 가 조용히 바뀌어도 **Figma 와 기록은 서로 맞고 둘 다
// 코드와 틀린** 상태로 통과한다. 그래서 기록의 키(= Figma 되읽기의 variant 키)마다 그 칸의 클래스 마크업을 렌더하고 기록의
// 필드를 계산값과 맞댄다. 각 부품의 대비 · 동작은 부품별 시험(asset-tile.browser.test.tsx 등)이 소유하고, 이 파일은 계약이
// 거는 기하만 본다.
//
// **React 표면이 아니라 클래스 마크업을 렌더한다.** 다섯 다 packages/react/src 에 표면이 없고 정본이
// packages/css/src/component/*.css 다. 마크업은 각 문서 Anatomy 절의 예시 그대로다.
import type { JSX } from "react";
import { expect, test } from "vitest";
import { page, userEvent } from "vitest/browser";
import { render } from "vitest-browser-react";
import measured from "../../../figma/components.measured.json" with { type: "json" };
import "@klipse-design/css/layers.css";
import "@klipse-design/css/tokens.css";
import "@klipse-design/css/styles.css";
import "../../css/src/component/text-field.css";
import "../../css/src/component/asset-tile.css";
import "../../css/src/component/color-swatch.css";
import "../../css/src/component/logo-tile.css";
import "../../css/src/component/notice-pill.css";
import "../../css/src/component/canvas-guide.css";
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

// ── Asset Tile ─────────────────────────────────────────────────────────────────────────────────────────────

const WHITE_ASSET =
  "data:image/svg+xml," +
  encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 10"><path d="M1 1h8v8H1z" fill="none" stroke="#fff"/></svg>');

const ASSET_TILE_KEYS = ["Default", "Hover", "Active"] as const;

function AssetTiles(): JSX.Element {
  return (
    <div style={{ inlineSize: 212, background: "var(--louis-color-bg-surface)" }}>
      <div className="louis-asset-tile-grid">
        {ASSET_TILE_KEYS.map((key) => (
          <button key={key} type="button" className="louis-asset-tile" title="격자" data-testid={`asset-${key}`}>
            <span className="louis-asset-tile__well">
              <img className="louis-asset-tile__media" src={WHITE_ASSET} alt="" draggable={false} />
            </span>
            <span className="louis-asset-tile__label">격자</span>
          </button>
        ))}
      </div>
    </div>
  );
}

test("asset-tile: 세 상태 칸의 여백 · 테두리 · 사이 · 반경 · 방향이 기록과 같다", async () => {
  await render(<AssetTiles />);
  // Hover 칸은 실제로 올린다 — 호버가 칠만 바꾸고 상자를 건드리지 않는다는 것이 기록의 주장이다.
  // Active(`scale: 0.97`)는 누르는 동안만이라 붙잡지 않는다 — `scale` 은 그리는 크기라 계산값 여백에 닿지 않는다.
  await userEvent.hover(find("asset-Hover"));
  for (const key of ASSET_TILE_KEYS) {
    const spec = measured.components["asset-tile"].sizes[key];
    const label = `asset-tile.${key}`;
    const style = getComputedStyle(find(`asset-${key}`));
    const padding = num(spec, "padding", label);
    const border = num(spec, "borderWidth", label);
    expect(px(style.paddingTop), label).toBe(padding);
    expect(px(style.paddingBottom), label).toBe(padding);
    expect(px(style.paddingLeft), label).toBe(padding);
    expect(px(style.paddingRight), label).toBe(padding);
    expect(px(style.borderTopWidth), label).toBe(border);
    expect(px(style.borderLeftWidth), label).toBe(border);
    expect(px(style.rowGap), label).toBe(num(spec, "gap", label));
    expect(px(style.borderTopLeftRadius), label).toBe(num(spec, "radius", label));
    expect(style.display, label).toBe("flex");
    expect(style.flexDirection, label).toBe(word(spec, "direction", label));
  }
});

// ── Color Swatch ───────────────────────────────────────────────────────────────────────────────────────────

const PLUS = (
  <svg viewBox="0 0 16 16" aria-hidden="true">
    <path d="M8 3v10M3 8h10" stroke="currentColor" />
  </svg>
);

// 칸마다 블록 `<div>` 로 감싼다 — 격자 · 플렉스 부모의 자식이 되면 `inline-flex` 가 `flex` 로 블록화되어(CSS Display §2.7) 레시피의 `display` 를 잴 수 없다.
function Swatches(): JSX.Element {
  return (
    <div style={{ display: "grid", gap: 16, inlineSize: 320, padding: 16, background: "var(--louis-color-bg-surface)" }}>
      <div>
        <div className="louis-color-swatch" data-testid="swatch-row/md/filled">
          <input type="color" className="louis-color-swatch__chip" defaultValue="#ffffff" aria-label="배경" />
          <div className="louis-text-field" data-size="md">
            <div className="louis-text-field__box">
              <input className="louis-text-field__control" defaultValue="#FFFFFF" aria-label="배경 헥스" />
            </div>
          </div>
        </div>
      </div>
      <div>
        <div className="louis-color-swatch" data-testid="swatch-row/md/empty">
          <button type="button" className="louis-color-swatch__chip" data-empty="true" aria-label="배경 색 더하기">
            {PLUS}
          </button>
          <div className="louis-text-field" data-size="md">
            <div className="louis-text-field__box">
              <input className="louis-text-field__control" defaultValue="" aria-label="배경 헥스" />
            </div>
          </div>
        </div>
      </div>
      <div>
        <span className="louis-color-swatch" data-size="sm" data-testid="swatch-row/sm/filled">
          <span className="louis-color-swatch__chip" style={{ ["--louis-color-swatch-value" as string]: "#000000" }} />
          #000000
        </span>
      </div>
      <div style={{ display: "flex", gap: 12 }}>
        <div>
          <label className="louis-color-swatch" data-layout="stack" data-testid="swatch-stack/md/filled">
            <span className="louis-color-swatch__label">배경</span>
            <span className="louis-color-swatch__frame">
              <input type="color" className="louis-color-swatch__chip" defaultValue="#000000" />
            </span>
          </label>
        </div>
        <div>
          <div className="louis-color-swatch" data-layout="stack" data-testid="swatch-stack/md/empty">
            <span className="louis-color-swatch__label">테두리</span>
            <button type="button" className="louis-color-swatch__chip" data-empty="true" aria-label="테두리 색 더하기">
              {PLUS}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

test("color-swatch: 다섯 칸의 간격 · 방향이 기록과 같다", async () => {
  await render(<Swatches />);
  for (const key of ["row/md/filled", "row/md/empty", "row/sm/filled", "stack/md/filled", "stack/md/empty"] as const) {
    const spec = measured.components["color-swatch"].sizes[key];
    const label = `color-swatch.${key}`;
    const style = getComputedStyle(find(`swatch-${key}`));
    const gap = num(spec, "gap", label);
    expect(style.display, label).toBe("inline-flex");
    expect(style.flexDirection, label).toBe(word(spec, "direction", label));
    expect(px(style.rowGap), label).toBe(gap);
    expect(px(style.columnGap), label).toBe(gap);
  }
});

// 상태 칸(Hover · Active) — 상태 규칙이 칩에만 걸려 칸의 간격 · 방향이 Default 와 같다는 것이 기록의 주장이다. Hover 칸은 칩을
// 실제로 올려 잰다. Active(`scale: 0.96`)는 누르는 동안만이라 붙잡지 않는다 — scale 은 그리는 크기라 계산값 간격에 닿지 않는다.
const SWATCH_STATE_KEYS = [
  "row/md/filled/Hover", "row/md/empty/Hover", "row/sm/filled/Hover", "stack/md/filled/Hover", "stack/md/empty/Hover",
  "row/md/empty/Active", "row/sm/filled/Active", "stack/md/empty/Active",
] as const;

test("color-swatch: 상태 칸 여덟의 간격 · 방향이 기록과 같다 — 호버는 실제로 올린다", async () => {
  await render(<Swatches />);
  for (const key of SWATCH_STATE_KEYS) {
    const base = key.split("/").slice(0, 3).join("/");
    const root = find(`swatch-${base}`);
    if (key.endsWith("/Hover")) await userEvent.hover(root.querySelector<HTMLElement>(".louis-color-swatch__chip")!);
    const spec = measured.components["color-swatch"].sizes[key];
    const label = `color-swatch.${key}`;
    const style = getComputedStyle(root);
    const gap = num(spec, "gap", label);
    expect(style.display, label).toBe("inline-flex");
    expect(style.flexDirection, label).toBe(word(spec, "direction", label));
    expect(px(style.rowGap), label).toBe(gap);
    expect(px(style.columnGap), label).toBe(gap);
  }
});

// ── Logo Tile ──────────────────────────────────────────────────────────────────────────────────────────────

const LOGO = `url("data:image/svg+xml,${encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 10"><circle cx="5" cy="5" r="4" fill="#fff"/></svg>',
)}")`;

const LOGO_TILE_KEYS = ["sm/glyph", "sm/fallback", "md/glyph", "md/fallback", "lg/glyph", "lg/fallback"] as const;

function LogoTiles(): JSX.Element {
  return (
    <div style={{ display: "flex", gap: 16, padding: 16, background: "var(--louis-color-bg-surface)" }}>
      {LOGO_TILE_KEYS.map((key) => {
        const [size, content] = key.split("/");
        return content === "glyph" ? (
          <span
            key={key}
            className="louis-logo-tile"
            data-size={size}
            aria-hidden="true"
            style={{ ["--louis-logo-tile-image" as string]: LOGO }}
            data-testid={`logo-${key}`}
          >
            <span className="louis-logo-tile__glyph" />
          </span>
        ) : (
          <span key={key} className="louis-logo-tile" data-size={size} aria-hidden="true" data-testid={`logo-${key}`}>
            <span className="louis-logo-tile__fallback">K</span>
          </span>
        );
      })}
    </div>
  );
}

test("logo-tile: 여섯 칸의 폭 · 높이 · 반경이 기록과 같다(1280)", async () => {
  // md 는 719 이하에서 48 로 내려간다 — Figma 는 데스크톱 판을 그리므로 넓은 창에서 잰다.
  await page.viewport(1280, 800);
  await render(<LogoTiles />);
  for (const key of LOGO_TILE_KEYS) {
    const spec = measured.components["logo-tile"].sizes[key];
    const label = `logo-tile.${key}`;
    const node = find(`logo-${key}`);
    const rect = node.getBoundingClientRect();
    const size = num(spec, "size", label);
    expect(rect.width, label).toBe(size);
    expect(rect.height, label).toBe(size);
    expect(px(getComputedStyle(node).borderTopLeftRadius), label).toBe(num(spec, "radius", label));
  }
});

// ── Notice Pill ────────────────────────────────────────────────────────────────────────────────────────────

// 칸마다 블록 `<div>` 로 감싼다 — 격자 · 플렉스 부모의 자식이 되면 `inline-flex` 가 `flex` 로 블록화되어(CSS Display §2.7) 레시피의 `display` 를 잴 수 없다.
function NoticePills(): JSX.Element {
  return (
    <div style={{ display: "grid", justifyItems: "start", gap: 12, padding: 24, inlineSize: 480, background: "#ffffff" }}>
      <div>
        <p className="louis-notice-pill" data-testid="pill-false/Default">
          <span className="louis-notice-pill__dot" aria-hidden="true" />
          <span className="louis-notice-pill__text">새 모델이 열렸습니다</span>
        </p>
      </div>
      <div>
        <a className="louis-notice-pill" href="#notice" data-testid="pill-true/Default">
          <span className="louis-notice-pill__dot" aria-hidden="true" />
          <span className="louis-notice-pill__text">지금 써 보기</span>
        </a>
      </div>
      <div>
        <a className="louis-notice-pill" href="#notice" data-testid="pill-true/Hover">
          <span className="louis-notice-pill__dot" aria-hidden="true" />
          <span className="louis-notice-pill__text">지금 써 보기</span>
        </a>
      </div>
    </div>
  );
}

test("notice-pill: 세 칸의 높이 · 좌우 여백 · 반경 · 방향이 기록과 같다", async () => {
  await render(<NoticePills />);
  // Hover 칸은 실제로 올린다 — 호버는 스크림 농도만 바꾸고 상자는 같다는 것이 기록의 주장이다.
  await userEvent.hover(find("pill-true/Hover"));
  for (const key of ["false/Default", "true/Default", "true/Hover"] as const) {
    const spec = measured.components["notice-pill"].sizes[key];
    const label = `notice-pill.${key}`;
    const node = find(`pill-${key}`);
    const style = getComputedStyle(node);
    const paddingInline = num(spec, "paddingInline", label);
    expect(node.getBoundingClientRect().height, label).toBe(num(spec, "height", label));
    expect(px(style.paddingLeft), label).toBe(paddingInline);
    expect(px(style.paddingRight), label).toBe(paddingInline);
    expect(px(style.borderTopLeftRadius), label).toBe(num(spec, "radius", label));
    expect(style.display, label).toBe("inline-flex");
    expect(style.flexDirection, label).toBe(word(spec, "direction", label));
  }
});

// ── Canvas Guide ───────────────────────────────────────────────────────────────────────────────────────────

test("canvas-guide: 세로 · 가로 선의 두께가 기록과 같다", async () => {
  await render(
    <div style={{ position: "relative", inlineSize: 400, blockSize: 300, background: "var(--louis-color-bg-canvas)" }}>
      <svg className="louis-canvas-guide" aria-hidden="true">
        <line className="louis-canvas-guide__line" x1={40} y1={0} x2={40} y2={120} data-testid="guide-vertical" />
        <line className="louis-canvas-guide__line" x1={0} y1={100} x2={120} y2={100} data-testid="guide-horizontal" />
      </svg>
    </div>,
  );
  for (const key of ["vertical", "horizontal"] as const) {
    const spec = measured.components["canvas-guide"].sizes[key];
    const label = `canvas-guide.${key}`;
    const style = getComputedStyle(find(`guide-${key}`));
    expect(px(style.strokeWidth), label).toBe(num(spec, "thickness", label));
    // 두께가 줌과 무관하다는 것이 이 값의 전제다 — 빠지면 변환 층 안에서 1 이 아니게 된다.
    expect(style.vectorEffect, label).toBe("non-scaling-stroke");
  }
});
