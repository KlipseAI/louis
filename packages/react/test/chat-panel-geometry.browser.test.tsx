// figma/components.measured.json 의 **chat-panel · chat-bubble · chat-dock · chat-suggestion · chat-gate** 값을 코드가 여전히 만드는지
// 검증한다(DS-D-0035 (c), 2026-10-14 DS-D-0094).
//
// parity 게이트는 Figma 가 기록과 같은지만 본다. 이 파일이 없으면 CSS 가 조용히 바뀌어도 **Figma 와 기록은 서로 맞고 둘 다
// 코드와 틀린** 상태로 통과한다. 그래서 기록의 키(= Figma 되읽기의 축 키)마다 클래스 마크업을 렌더하고 기록의 필드를 계산값과 맞댄다.
// 대비 · 다크 스코프 · 모션 · 호버 가드는 chat-panel.browser.test.tsx 가 소유한다.
import type { CSSProperties, JSX } from "react";
import { beforeEach, expect, test } from "vitest";
import { page } from "vitest/browser";
import { render } from "vitest-browser-react";
import measured from "../../../figma/components.measured.json" with { type: "json" };
import "@klipse-design/css/layers.css";
import "@klipse-design/css/tokens.css";
import "@klipse-design/css/styles.css";
import { find, px } from "./fixtures/contrast";

type Sizes = Record<string, Record<string, unknown>>;

beforeEach(async () => {
  await page.viewport(1280, 900);
});

function num(spec: Record<string, unknown>, field: string, label: string): number {
  const value = spec[field];
  if (typeof value !== "number") throw new Error(`${label}.${field}가 수가 아닙니다`);
  return value;
}

const style = (testId: string): CSSStyleDeclaration => getComputedStyle(find(testId));

/** 열림 튐(scale) · 전이를 끝으로 보낸다 — 레이아웃 값은 offset* 로 재지만 계산 스타일도 끝 값이어야 한다. */
function settle(): void {
  for (const animation of document.getAnimations()) animation.finish();
}

function Panel({ open }: { readonly open: boolean }): JSX.Element {
  return (
    <div style={{ padding: 24 }}>
      <div
        className="louis-chat-panel"
        data-theme="dark"
        data-state={open ? "open" : "closed"}
        style={{ "--louis-chat-panel-pill-inline-size": "152px" } as CSSProperties}
        data-testid="panel"
      >
        <header className="louis-chat-panel__header" data-testid="header">
          <button type="button" className="louis-chat-panel__trigger" aria-expanded={open} disabled={open} data-testid="trigger">
            <span className="louis-chat-panel__trigger-icon" aria-hidden="true" data-testid="glyph" />
            <span className="louis-chat-panel__title" data-testid="title">
              AI 클립 수정
            </span>
          </button>
          <div className="louis-chat-panel__controls" aria-hidden={!open}>
            <label className="louis-slider louis-chat-panel__opacity" data-size="md">
              <input type="range" className="louis-slider__control" aria-label="채팅창 투명도" defaultValue={100} />
            </label>
            <button type="button" className="louis-icon-button louis-chat-panel__close" data-variant="ghost" data-size="md" aria-label="닫기" />
          </div>
        </header>
        <div className="louis-chat-panel__body" aria-hidden={!open} inert={!open}>
          <div className="louis-chat-panel__log" role="log" data-testid="log">
            <div className="louis-chat-panel__bubble" data-from="user" data-testid="bubble-user">
              <p className="louis-chat-panel__text">앞에 1초 추가</p>
            </div>
            <div className="louis-chat-panel__bubble" data-from="assistant" data-testid="bubble-assistant">
              <p className="louis-chat-panel__text">시작을 1초 앞당긴 수정안입니다.</p>
              <div className="louis-chat-panel__diff" data-testid="diff">
                00:00 ~ 00:04 (4초)
              </div>
            </div>
            <div className="louis-chat-panel__media" data-testid="bubble-media">
              <div style={{ aspectRatio: "16 / 9" }} />
            </div>
          </div>
          <div className="louis-chat-panel__dock" data-testid="dock">
            <div className="louis-chat-panel__suggestions" data-testid="suggestions">
              <button type="button" className="louis-chat-panel__suggestion" data-testid="suggestion-1">
                앞에 5초 추가
              </button>
              <button type="button" className="louis-chat-panel__suggestion" data-testid="suggestion-2">
                뒤에 3초 자르기
              </button>
              <button type="button" className="louis-chat-panel__suggestion" disabled data-testid="suggestion-disabled">
                리플레이 빼기
              </button>
            </div>
            <div className="louis-chat-panel__composer" data-testid="composer">
              <input type="text" className="louis-chat-panel__input" aria-label="수정할 내용" data-testid="input" />
              <button type="button" className="louis-button" data-variant="primary" data-size="md">
                <span className="louis-button__label">전송</span>
              </button>
            </div>
          </div>
        </div>
      </div>
      <div className="louis-chat-panel" data-theme="dark" data-state="open" style={{ marginBlockStart: 24 }}>
        <div className="louis-chat-panel__body">
          <button type="button" className="louis-chat-panel__gate" data-testid="gate">
            AI 클립 수정 — Pro
          </button>
        </div>
      </div>
    </div>
  );
}

const panel = measured.components["chat-panel"].sizes as Sizes;
const bubble = measured.components["chat-bubble"].sizes as Sizes;
const dock = measured.components["chat-dock"].sizes as Sizes;
const suggestion = measured.components["chat-suggestion"].sizes as Sizes;
const gate = measured.components["chat-gate"].sizes as Sizes;

for (const [key, spec] of Object.entries(panel)) {
  test(`chat-panel ${key} — 셸 · 머리 · 글리프 · 제목`, async () => {
    const open = key.startsWith("true");
    await render(<Panel open={open} />);
    settle();
    const label = `chat-panel.${key}`;
    expect(find("panel").offsetHeight, `${label}.height`).toBe(num(spec, "height", label));
    const shell = style("panel");
    expect(px(shell.paddingTop), `${label}.padding`).toBe(num(spec, "padding", label));
    expect(px(shell.paddingLeft), `${label}.padding`).toBe(num(spec, "padding", label));
    expect(px(shell.borderTopLeftRadius), `${label}.radius`).toBe(num(spec, "radius", label));
    const header = style("header");
    expect(find("header").offsetHeight, `${label}.headerHeight`).toBe(num(spec, "headerHeight", label));
    expect(px(header.paddingTop), `${label}.headerPaddingBlock`).toBe(num(spec, "headerPaddingBlock", label));
    expect(px(header.paddingLeft), `${label}.headerPaddingInline`).toBe(num(spec, "headerPaddingInline", label));
    expect(px(header.columnGap), `${label}.headerGap`).toBe(num(spec, "headerGap", label));
    expect(px(style("trigger").columnGap), `${label}.headerGap(단추)`).toBe(num(spec, "headerGap", label));
    expect(find("glyph").offsetWidth, `${label}.glyph`).toBe(num(spec, "glyph", label));
    expect(find("glyph").offsetHeight, `${label}.glyph`).toBe(num(spec, "glyph", label));
    expect(px(style("title").fontSize), `${label}.titleSize`).toBe(num(spec, "titleSize", label));
  });
}

test("chat-bubble — user · assistant · media 의 안쪽 · 사이 · 반경", async () => {
  await render(<Panel open />);
  settle();
  for (const [key, spec] of Object.entries(bubble)) {
    const label = `chat-bubble.${key}`;
    const node = style(`bubble-${key}`);
    expect(px(node.paddingTop), `${label}.paddingBlock`).toBe(num(spec, "paddingBlock", label));
    expect(px(node.paddingBottom), `${label}.paddingBlock`).toBe(num(spec, "paddingBlock", label));
    expect(px(node.paddingLeft), `${label}.paddingInline`).toBe(num(spec, "paddingInline", label));
    expect(px(node.paddingRight), `${label}.paddingInline`).toBe(num(spec, "paddingInline", label));
    expect(px(node.borderTopLeftRadius), `${label}.radius`).toBe(num(spec, "radius", label));
    if (key === "assistant") expect(px(style("diff").marginTop), `${label}.gap`).toBe(num(spec, "gap", label));
  }
});

test("chat-dock — 위 · 사이, 제안 줄, 입력 줄 · 입력칸", async () => {
  await render(<Panel open />);
  settle();
  const spec = dock.base as Record<string, unknown>;
  const label = "chat-dock.base";
  const node = style("dock");
  expect(px(node.paddingTop), `${label}.paddingTop`).toBe(num(spec, "paddingTop", label));
  expect(px(node.paddingBottom), `${label}.paddingBottom`).toBe(num(spec, "paddingBottom", label));
  expect(px(node.rowGap), `${label}.gap`).toBe(num(spec, "gap", label));
  expect(px(style("suggestions").paddingLeft), `${label}.suggestionsInline`).toBe(num(spec, "suggestionsInline", label));
  const first = find("suggestion-1").getBoundingClientRect();
  const second = find("suggestion-2").getBoundingClientRect();
  expect(second.left - first.right, `${label}.suggestionsGap`).toBeCloseTo(num(spec, "suggestionsGap", label), 1);
  expect(find("composer").offsetHeight, `${label}.composerHeight`).toBe(num(spec, "composerHeight", label));
  const composer = style("composer");
  expect(px(composer.paddingTop), `${label}.composerPadding`).toBe(num(spec, "composerPadding", label));
  expect(px(composer.paddingLeft), `${label}.composerPadding`).toBe(num(spec, "composerPadding", label));
  expect(px(composer.columnGap), `${label}.composerGap`).toBe(num(spec, "composerGap", label));
  expect(px(composer.borderTopLeftRadius), `${label}.composerRadius`).toBe(num(spec, "composerRadius", label));
  expect(find("input").offsetHeight, `${label}.inputHeight`).toBe(num(spec, "inputHeight", label));
});

test("chat-suggestion — 높이 · 글 · 불투명도(Default · Hover · Disabled)", async () => {
  await render(<Panel open />);
  settle();
  const ids: Record<string, string> = { Default: "suggestion-1", Hover: "suggestion-1", Disabled: "suggestion-disabled" };
  for (const [key, spec] of Object.entries(suggestion)) {
    const label = `chat-suggestion.${key}`;
    const id = ids[key] ?? "suggestion-1";
    expect(find(id).offsetHeight, `${label}.height`).toBe(num(spec, "height", label));
    expect(px(style(id).fontSize), `${label}.fontSize`).toBe(num(spec, "fontSize", label));
    expect(Number(style(id).opacity), `${label}.opacity`).toBe(num(spec, "opacity", label));
  }
});

test("chat-gate — 높이 · 안쪽 · 테두리 · 반경 · 글(Default · Hover 같은 기하)", async () => {
  await render(<Panel open={false} />);
  settle();
  for (const [key, spec] of Object.entries(gate)) {
    const label = `chat-gate.${key}`;
    const node = style("gate");
    expect(find("gate").offsetHeight, `${label}.height`).toBe(num(spec, "height", label));
    expect(px(node.paddingTop), `${label}.paddingBlock`).toBe(num(spec, "paddingBlock", label));
    expect(px(node.paddingLeft), `${label}.paddingInline`).toBe(num(spec, "paddingInline", label));
    expect(px(node.borderTopWidth), `${label}.borderWidth`).toBe(num(spec, "borderWidth", label));
    expect(px(node.borderTopLeftRadius), `${label}.radius`).toBe(num(spec, "radius", label));
    expect(px(node.fontSize), `${label}.fontSize`).toBe(num(spec, "fontSize", label));
  }
});
