// Prompt Variant(`.louis-prompt-variant`)의 레시피가 실제로 그 픽셀을 만드는지 잰다.
//
// **React 표면이 아니라 클래스 마크업을 렌더한다.** packages/react/src 에 표면이 없고 정본이
// packages/css/src/component/prompt-variant.css 다. 마크업은 design/components/prompt-variant.md 의 예시 그대로다.
//
// **대비는 렌더해서 잰다.** 카드는 노드 응답 칸(`__response[data-state="filled"]`, 노란 8% 면) 위에, 열은 대화 면
// (`bg-overlay`) 위에 선다. 반투명 면이 겹겹이라 토큰 값만으로는 대비가 나오지 않는다 — 조상 면을 합성한 바탕 위에서
// 글자 · 글리프의 계산 색을 잰다. 두 테마 다.
import type { JSX } from "react";
import { afterEach, expect, test } from "vitest";
import { page } from "vitest/browser";
import { render } from "vitest-browser-react";
import "@klipse-design/css/layers.css";
import "@klipse-design/css/tokens.css";
import "@klipse-design/css/styles.css";
import "../../css/src/component/node-shell.css";
import "../../css/src/component/prompt-variant.css";

const px = (value: string): number => Number.parseFloat(value);

function find(testId: string): HTMLElement {
  const node = document.querySelector(`[data-testid="${testId}"]`);
  if (node === null) throw new Error(`찾지 못했습니다: ${testId}`);
  return node as HTMLElement;
}

afterEach(() => {
  document.documentElement.removeAttribute("data-theme");
});

type Rgba = readonly [number, number, number, number];

/** 계산 색 문자열(`rgb()` · `rgba()` · `color(srgb …)`)을 0~255 채널 + 알파로 푼다. */
function parseColor(value: string): Rgba {
  const srgb = /^color\(srgb\s+([\d.e-]+)\s+([\d.e-]+)\s+([\d.e-]+)(?:\s*\/\s*([\d.e-]+))?\)$/.exec(value);
  if (srgb !== null) {
    return [Number(srgb[1]) * 255, Number(srgb[2]) * 255, Number(srgb[3]) * 255, srgb[4] === undefined ? 1 : Number(srgb[4])];
  }
  const rgb = /^rgba?\(([\d.]+),?\s*([\d.]+),?\s*([\d.]+)(?:\s*[,/]\s*([\d.]+))?\)$/.exec(value);
  if (rgb !== null) {
    return [Number(rgb[1]), Number(rgb[2]), Number(rgb[3]), rgb[4] === undefined ? 1 : Number(rgb[4])];
  }
  throw new Error(`색을 풀지 못했습니다: ${value}`);
}

const over = (top: Rgba, bottom: Rgba): Rgba => {
  const a = top[3];
  return [top[0] * a + bottom[0] * (1 - a), top[1] * a + bottom[1] * (1 - a), top[2] * a + bottom[2] * (1 - a), 1];
};

/** 요소 뒤에 실제로 깔린 바탕 — 조상의 배경색을 위에서부터 합성한다(불투명을 만나면 멈춘다). */
function backdrop(node: HTMLElement): Rgba {
  const layers: Rgba[] = [];
  for (let current: HTMLElement | null = node; current !== null; current = current.parentElement) {
    const layer = parseColor(getComputedStyle(current).backgroundColor);
    if (layer[3] > 0) layers.push(layer);
    if (layer[3] >= 1) break;
  }
  return layers.reduceRight<Rgba>((bottom, top) => over(top, bottom), [255, 255, 255, 1]);
}

function luminance([r, g, b]: Rgba): number {
  const channel = (c: number): number => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}

/** 글자(또는 글리프) 잉크를 그 뒤 바탕에 합성해 WCAG 대비를 낸다. */
function contrastOf(node: HTMLElement): number {
  const ground = backdrop(node);
  const ink = over(parseColor(getComputedStyle(node).color), ground);
  const [hi, lo] = [luminance(ink), luminance(ground)].sort((x, y) => y - x) as [number, number];
  return (hi + 0.05) / (lo + 0.05);
}

const LONG = "해 질 녘 옥상, 역광 속 실루엣.\n카메라는 천천히 다가가고 바람에 머리카락이 흩날린다. 따뜻한 주황 하늘, 필름 그레인, 얕은 심도, 35mm 렌즈의 넓은 화각과 느린 달리 인.";

/** 노드 응답 칸 안 후보 카드 둘 — 카드 바탕이 실제 노란 면이 되도록 셸 카드 면 위에 세운다. */
function Cards(): JSX.Element {
  return (
    <div style={{ inlineSize: 396, background: "var(--louis-color-bg-surface)" }}>
      <div className="louis-node-shell__response" data-state="filled">
        <div className="louis-node-shell__response-scroll">
          {["시네마틱", "미니멀"].map((name, index) => (
            <button
              key={name}
              type="button"
              className="louis-prompt-variant"
              aria-haspopup="dialog"
              data-testid={`card-${index}`}
            >
              <span className="louis-prompt-variant__head" data-testid={`card-${index}-head`}>
                <span className="louis-prompt-variant__style" data-testid={`card-${index}-style`}>
                  {name}
                </span>
                <svg className="louis-prompt-variant__expand" data-testid={`card-${index}-expand`} viewBox="0 0 16 16" aria-hidden="true">
                  <path d="M9.5 2.5H13.5V6.5M6.5 13.5H2.5V9.5M13.5 2.5L9 7M2.5 13.5L7 9" stroke="currentColor" fill="none" />
                </svg>
              </span>
              <span className="louis-prompt-variant__text" data-testid={`card-${index}-text`}>
                {LONG}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

/** 비교 모달 본문 — 대화 면(`bg-overlay`) 위 두 열. */
function Columns({ width = 832 }: { readonly width?: number }): JSX.Element {
  return (
    <div style={{ inlineSize: width, background: "var(--louis-color-bg-overlay)" }}>
      <div className="louis-prompt-variant-grid" data-testid="grid">
        {["시네마틱", "미니멀"].map((name, index) => (
          <div
            key={name}
            className="louis-prompt-variant"
            data-layout="column"
            role="group"
            aria-labelledby={`pv-${index}`}
            data-testid={`col-${index}`}
          >
            <div className="louis-prompt-variant__head" data-testid={`col-${index}-head`}>
              <span className="louis-prompt-variant__style" id={`pv-${index}`} data-testid={`col-${index}-style`}>
                {name}
              </span>
            </div>
            <div className="louis-prompt-variant__body" data-testid={`col-${index}-body`}>
              <span className="louis-prompt-variant__label" data-testid={`col-${index}-label`}>
                프롬프트
              </span>
              <p className="louis-prompt-variant__text" data-testid={`col-${index}-text`}>
                {LONG}
              </p>
            </div>
            <button type="button" className="louis-prompt-variant__action" data-testid={`col-${index}-action`}>
              이 프롬프트 사용
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

test("카드의 여백 · 간격 · 반경 · 테두리가 제품 값이고 카드끼리 8 이다", async () => {
  await render(<Cards />);
  const card = getComputedStyle(find("card-0"));
  expect(px(card.paddingTop)).toBe(10);
  expect(px(card.paddingLeft)).toBe(10);
  expect(px(card.rowGap)).toBe(6);
  expect(px(card.borderTopLeftRadius)).toBe(10);
  expect(px(card.borderTopWidth)).toBe(1);
  expect(card.borderTopStyle).toBe("solid");
  expect(px(getComputedStyle(find("card-0-head")).columnGap)).toBe(6);
  expect(px(getComputedStyle(find("card-0")).marginTop)).toBe(0);
  expect(px(getComputedStyle(find("card-1")).marginTop)).toBe(8);
  const gap = find("card-1").getBoundingClientRect().top - find("card-0").getBoundingClientRect().bottom;
  expect(gap).toBe(8);
  // 카드는 응답 칸의 스크롤 칸 폭을 채운다.
  expect(find("card-0").getBoundingClientRect().width).toBe(
    find("card-0").parentElement!.getBoundingClientRect().width,
  );
  const expand = find("card-0-expand").getBoundingClientRect();
  expect(expand.width).toBe(16);
  expect(expand.height).toBe(16);
});

test("카드 본문이 세 줄에서 잘린다", async () => {
  await render(<Cards />);
  const text = find("card-0-text");
  const style = getComputedStyle(text);
  expect(style.webkitLineClamp).toBe("3");
  expect(style.overflow).toBe("hidden");
  expect(style.whiteSpace).toBe("pre-wrap");
  const lineHeight = px(style.lineHeight);
  expect(text.getBoundingClientRect().height).toBeCloseTo(lineHeight * 3, 0);
  expect(text.scrollHeight).toBeGreaterThan(text.clientHeight);
});

test("열의 여백 · 반경 · 머리 아래 12 · 알약이 계약이고 펼침이 없다", async () => {
  await render(<Columns />);
  const column = getComputedStyle(find("col-0"));
  expect(px(column.paddingTop)).toBe(16);
  expect(px(column.paddingLeft)).toBe(16);
  expect(px(column.borderTopLeftRadius)).toBe(16);
  expect(px(column.borderTopWidth)).toBe(1);
  expect(px(getComputedStyle(find("col-0-head")).marginBottom)).toBe(12);
  const pill = getComputedStyle(find("col-0-style"));
  expect(px(pill.paddingTop)).toBe(4);
  expect(px(pill.paddingLeft)).toBe(10);
  expect(px(pill.borderTopLeftRadius)).toBeGreaterThanOrEqual(999);
  expect(parseColor(pill.backgroundColor)[3]).toBeCloseTo(0.16, 2);
  expect(px(getComputedStyle(find("col-0-body")).rowGap)).toBe(4);
  // 열 본문은 자르지 않는다 — 넘침은 본문 묶음의 스크롤이 갖는다.
  expect(getComputedStyle(find("col-0-text")).display).toBe("block");
  expect(getComputedStyle(find("col-0-body")).overflowY).toBe("auto");
});

test("사용 버튼이 위 16 · 높이 40 · 열 안쪽 폭을 채운다", async () => {
  await render(<Columns />);
  const action = find("col-0-action");
  const style = getComputedStyle(action);
  expect(action.getBoundingClientRect().height).toBe(40);
  expect(px(style.marginTop)).toBe(16);
  expect(px(style.borderTopLeftRadius)).toBe(12);
  const column = find("col-0").getBoundingClientRect();
  expect(action.getBoundingClientRect().width).toBe(column.width - 2 * (16 + 1));
  // 열 바닥에서 여백 16 + 테두리 1 위에 선다.
  expect(column.bottom - action.getBoundingClientRect().bottom).toBe(17);
});

// 넓은 화면에서 두 열, 719 이하에서 한 열(모바일 경계) — 뷰포트를 바꿔 두 판을 다 잰다.
test("비교 격자가 넓은 화면에서 두 같은 폭 열 · 간격 16 이고 719 이하에서 한 열이다", async () => {
  await page.viewport(1280, 900);
  await render(<Columns />);
  const left = find("col-0").getBoundingClientRect();
  const right = find("col-1").getBoundingClientRect();
  expect(px(getComputedStyle(find("grid")).columnGap)).toBe(16);
  expect(right.left - left.right).toBe(16);
  expect(left.width).toBe(right.width);
  expect(left.top).toBe(right.top);

  await page.viewport(719, 900);
  const stackedLeft = find("col-0").getBoundingClientRect();
  const stackedRight = find("col-1").getBoundingClientRect();
  expect(stackedLeft.left).toBe(stackedRight.left);
  expect(stackedRight.top - stackedLeft.bottom).toBe(16);
});

for (const theme of ["light", "dark"] as const) {
  test(`${theme} — 카드의 글 · 글리프가 대비 기준을 넘는다`, async () => {
    document.documentElement.setAttribute("data-theme", theme);
    await render(<Cards />);
    expect(contrastOf(find("card-0-style")), "스타일 이름").toBeGreaterThanOrEqual(4.5);
    expect(contrastOf(find("card-0-text")), "본문").toBeGreaterThanOrEqual(4.5);
    expect(contrastOf(find("card-0-expand")), "펼침 글리프(그래픽)").toBeGreaterThanOrEqual(3);
    // 스타일 이름은 노드 결과 글과 같은 시맨틱을 읽는다.
    const probe = document.createElement("span");
    probe.style.color = "var(--louis-color-node-text-response-foreground)";
    document.body.append(probe);
    expect(getComputedStyle(find("card-0-style")).color).toBe(getComputedStyle(probe).color);
    probe.remove();
  });

  test(`${theme} — 열의 알약 · 라벨 · 본문 · 사용 버튼이 대비 기준을 넘는다`, async () => {
    document.documentElement.setAttribute("data-theme", theme);
    await render(<Columns />);
    expect(contrastOf(find("col-0-style")), "이름 알약").toBeGreaterThanOrEqual(4.5);
    expect(contrastOf(find("col-0-label")), "라벨").toBeGreaterThanOrEqual(4.5);
    expect(contrastOf(find("col-0-text")), "본문").toBeGreaterThanOrEqual(4.5);
    expect(contrastOf(find("col-0-action")), "사용 버튼 글").toBeGreaterThanOrEqual(4.5);
  });
}
