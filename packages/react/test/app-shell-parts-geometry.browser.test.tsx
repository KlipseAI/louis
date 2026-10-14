// figma/components.measured.json 의 **sidebar-brand · sidebar-cta** 기하와 **app-shell-parts.canvas**(캔버스 판 상단 바)를
// 코드가 칸마다 여전히 만드는지 잰다(DS-D-0035 (c)). LOUIS React 부품(SidebarBrand · SidebarCta · AppTopBar)을 렌더하고,
// 사이드바 둘은 실제 레일(`.louis-app-shell__rail`) 안에 둔다 — 펼친 폭 · 접힌 폭이 레일 토큰에서 파생되는 값이기 때문이다.
//
// **재지 않는 필드 둘.** `sidebar-brand.false.wordmarkWidth`(96) 와 `sidebar-cta.false.labelWidth`(60) 는 코드 선언이 아니라
// 담긴 것(워드마크 자산 · 라벨 문구와 글꼴)이 정하는 폭이다 — 시험이 그 폭의 내용을 골라 넣으면 기록을 자기가 쓴 수로
// 되읽는 것이 된다. 그 둘은 parity 가 Figma 와 기록을 맞대는 것으로 남는다. 마크(`markSize`)는 높이만 코드 선언
// (`min-block-size: layout-app-shell-brand-mark-height`)이라 높이만 잰다.
import type { JSX } from "react";
import { beforeEach, expect, test } from "vitest";
import { page } from "vitest/browser";
import { render } from "vitest-browser-react";
import { AppTopBar, IconButton, SidebarBrand, SidebarCta } from "@klipse-design/react";
import measured from "../../../figma/components.measured.json" with { type: "json" };
import "@klipse-design/css/layers.css";
import "@klipse-design/css/tokens.css";
// 레일은 `box-sizing` 을 스스로 선언하지 않고 소비처의 reset(border-box)을 전제한다 — 레일 내용 폭 = 레일 폭 − 패딩 × 2 가
// 그 전제의 결과다(parity 의 `rail-content` 채움 원천과 같은 식). 그래서 패키지의 reset 을 함께 싣는다.
import "@klipse-design/css/reset.css";
import "@klipse-design/css/styles.css";
import { px } from "./fixtures/contrast";

type Sizes = Record<string, Record<string, unknown>>;

/** `sizes` 한 칸의 수 필드. `$…` 사유와 한 객체에 섞여 있어 타입이 열려 있다 — 수가 아니면 던진다. */
function num(spec: Record<string, unknown>, field: string, label: string): number {
  const value = spec[field];
  if (typeof value !== "number") throw new Error(`${label}.${field}가 수가 아닙니다`);
  return value;
}

function cell(sizes: Sizes, key: string, id: string): Record<string, unknown> {
  const spec = sizes[key];
  if (spec === undefined) throw new Error(`${id}.sizes.${key} 가 없습니다`);
  return spec;
}

function one(selector: string): HTMLElement {
  const node = document.querySelector<HTMLElement>(selector);
  if (node === null) throw new Error(`찾지 못했습니다: ${selector}`);
  return node;
}

/** 실제 셸 레일. 기록 키 `true` = 접힘(`data-collapsed="true"`), `false` = 펼침. */
function Rail({ collapsed, children }: { collapsed: boolean; children: JSX.Element }): JSX.Element {
  return (
    <div
      className="louis-app-shell"
      data-collapsed={collapsed ? "true" : undefined}
      style={{ ["--app-shell-viewport-height" as string]: "600px" }}
    >
      <nav className="louis-app-shell__rail" aria-label="사이드바">
        {children}
      </nav>
    </div>
  );
}

// 데스크톱 폭에서 잰다 — 719px 이하에서는 레일이 접힘과 무관하게 드로어 폭이 된다(app-shell.css Compact).
beforeEach(async () => {
  await page.viewport(1440, 900);
});

const brandSizes = measured.components["sidebar-brand"].sizes as unknown as Sizes;
const ctaSizes = measured.components["sidebar-cta"].sizes as unknown as Sizes;
const topBarSizes = measured.components["app-shell-parts"].sizes as unknown as Sizes;

for (const key of Object.keys(brandSizes)) {
  test(`sidebar-brand ${key} — 행 높이 · 곡률 · 앞 여백 · 마크 높이(접힘은 폭)가 기록과 같다`, async () => {
    const spec = cell(brandSizes, key, "sidebar-brand");
    const label = `sidebar-brand.${key}`;
    const collapsed = key === "true";
    await render(
      <Rail collapsed={collapsed}>
        <SidebarBrand mark={<span style={{ display: "block", inlineSize: 16, blockSize: 16 }} />} wordmark="Klipse" collapsed={collapsed} />
      </Rail>,
    );
    const brand = one(".louis-sidebar-brand");
    const style = getComputedStyle(brand);
    expect(brand.getBoundingClientRect().height, `${label} height`).toBe(num(spec, "height", label));
    expect(px(style.borderTopLeftRadius), `${label} radius`).toBe(num(spec, "radius", label));
    expect(px(style.paddingInlineStart), `${label} paddingInlineStart`).toBe(num(spec, "paddingInlineStart", label));
    expect(px(style.paddingInlineEnd), `${label} paddingInlineEnd 0`).toBe(0);
    expect(one(".louis-sidebar-brand__mark").getBoundingClientRect().height, `${label} markSize 높이`).toBe(
      num(spec, "markSize", label),
    );
    // 접힌 폭은 레일 토큰의 파생(접힌 레일 − 패딩 × 2)이다. 펼친 폭은 채움 칸이라 기록에 수가 없다(`$width`).
    if (typeof spec["width"] === "number") {
      expect(brand.getBoundingClientRect().width, `${label} width`).toBe(num(spec, "width", label));
    }
  });
}

for (const key of Object.keys(ctaSizes)) {
  test(`sidebar-cta ${key} — 높이 · 곡률 · 여백 · 간격(접힘은 폭 · 라벨)이 기록과 같다`, async () => {
    const spec = cell(ctaSizes, key, "sidebar-cta");
    const label = `sidebar-cta.${key}`;
    const collapsed = key === "true";
    await render(
      <Rail collapsed={collapsed}>
        <SidebarCta label="업그레이드" collapsed={collapsed} />
      </Rail>,
    );
    const button = one(".louis-sidebar-cta__button");
    const style = getComputedStyle(button);
    // `height` 는 하한이다(기록 `$height`) — 선언과 「상자가 그 이상」을 함께 본다. 접힌 32 는 실효 높이와 같다.
    expect(px(style.minBlockSize), `${label} height 하한`).toBe(num(spec, "height", label));
    expect(button.getBoundingClientRect().height, `${label} 상자 ≥ height`).toBeGreaterThanOrEqual(num(spec, "height", label));
    expect(px(style.borderTopLeftRadius), `${label} radius`).toBe(num(spec, "radius", label));
    expect(px(style.paddingLeft), `${label} paddingInline 왼`).toBe(num(spec, "paddingInline", label));
    expect(px(style.paddingRight), `${label} paddingInline 오른`).toBe(num(spec, "paddingInline", label));
    expect(px(style.paddingTop), `${label} paddingBlock 위`).toBe(num(spec, "paddingBlock", label));
    expect(px(style.paddingBottom), `${label} paddingBlock 아래`).toBe(num(spec, "paddingBlock", label));
    expect(px(style.columnGap), `${label} gap`).toBe(num(spec, "gap", label));
    if (collapsed) {
      const text = one(".louis-sidebar-cta__label");
      const textStyle = getComputedStyle(text);
      expect(button.getBoundingClientRect().width, `${label} width`).toBe(num(spec, "width", label));
      expect(button.getBoundingClientRect().height, `${label} 실효 높이`).toBe(num(spec, "height", label));
      expect(px(textStyle.maxInlineSize), `${label} labelMaxWidth`).toBe(num(spec, "labelMaxWidth", label));
      // 접힌 라벨 폭 = 버튼 32 − 좌우 패딩 10 × 2 — 문구가 아니라 상자가 정한다.
      expect(text.getBoundingClientRect().width, `${label} labelWidth`).toBe(num(spec, "labelWidth", label));
      expect(px(textStyle.fontSize), `${label} labelFontSize`).toBe(num(spec, "labelFontSize", label));
    }
  });
}

test("app-shell-parts canvas — 캔버스 판 상단 바의 높이(파생) · 여백 · 사이가 기록과 같다", async () => {
  const spec = cell(topBarSizes, "canvas", "app-shell-parts");
  const label = "app-shell-parts.canvas";
  await render(
    <div style={{ inlineSize: 480 }}>
      <AppTopBar
        data-surface="canvas"
        leading={
          <IconButton size="md" variant="ghost" label="홈">
            <span />
          </IconButton>
        }
        title="제목 없는 프로젝트"
      />
    </div>,
  );
  const bar = one(".louis-app-top-bar");
  const style = getComputedStyle(bar);
  // 높이는 선언이 아니라 8 + 32(IconButton md) + 8 의 파생이다.
  expect(bar.getBoundingClientRect().height, `${label} height`).toBe(num(spec, "height", label));
  expect(px(style.paddingTop), `${label} paddingBlock 위`).toBe(num(spec, "paddingBlock", label));
  expect(px(style.paddingBottom), `${label} paddingBlock 아래`).toBe(num(spec, "paddingBlock", label));
  expect(px(style.paddingLeft), `${label} paddingInline 왼`).toBe(num(spec, "paddingInline", label));
  expect(px(style.paddingRight), `${label} paddingInline 오른`).toBe(num(spec, "paddingInline", label));
  expect(px(style.columnGap), `${label} gap`).toBe(num(spec, "gap", label));
  expect(px(style.borderBottomWidth), `${label} borderWidth`).toBe(num(spec, "borderWidth", label));
});

test("app-shell-parts topBar — 기본 바의 위아래 여백은 0 이다(기록 paddingBlock)", async () => {
  const spec = cell(topBarSizes, "topBar", "app-shell-parts");
  await render(<AppTopBar title="보관함" />);
  const style = getComputedStyle(one(".louis-app-top-bar"));
  expect(px(style.paddingTop), "topBar paddingBlock 위").toBe(num(spec, "paddingBlock", "topBar"));
  expect(px(style.paddingBottom), "topBar paddingBlock 아래").toBe(num(spec, "paddingBlock", "topBar"));
});
