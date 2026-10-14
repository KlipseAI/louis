// figma/components.measured.json 의 **node-shell · node-chrome-button · node-side-handle** 값을
// 코드가 실제로 만드는지 검증한다.
//
// **셋이 한 파일인 이유는 한 벌이기 때문이다.** 셸의 헤더 높이는 크롬 버튼의 토큰에서 오고
// (행이 32 인 것은 제목이 아니라 버튼 때문이다), 사이드 핸들은 그 셸의 좌우 레일에 선다. 세
// 파일로 나누면 그 인과가 세 곳으로 흩어지고, 어느 한 조각을 옮겼을 때 나머지 둘이 따라
// 움직였는지를 한 눈에 볼 수 없다.
//
// **왜 필요한가.** parity 게이트는 Figma 가 기록과 같은지만 본다. 그래서 레시피가 조용히
// 바뀌면 **Figma 와 기록은 서로 맞고 둘 다 코드와 틀린** 상태로 통과한다. verify-recipe-record
// 가 저작 CSS 의 «글자»를 읽어 그 틈을 메우지만, 글자가 실제로 그 픽셀을 만드는지는 보지
// 못한다 — 캐스케이드·상속·`inherit` 로 받는 값은 렌더해야만 나온다. 이 파일이 그 자리다.
//
// **React 표면이 아니라 클래스 마크업을 렌더한다.** 셋 다 packages/react/src 에 표면이 없고
// 정본이 packages/css/src/component/node-*.css 다(계약의 figmaAhead 가 그 사실을 적는다).
// 여기서 렌더하는 마크업은 각 문서 Anatomy 절의 계약 그대로여야 한다.
import type { JSX } from "react";
import { expect, test } from "vitest";
import { render } from "vitest-browser-react";
import measured from "../../../figma/components.measured.json" with { type: "json" };
import "@klipse-design/css/layers.css";
import "@klipse-design/css/tokens.css";
import "@klipse-design/css/styles.css";
import "../../css/src/component/node-shell.css";
import "../../css/src/component/node-chrome-button.css";
import "../../css/src/component/node-side-handle.css";
import "../../css/src/component/node-chip.css";
import { parseColor } from "./fixtures/contrast";

const shellSpec = measured.components["node-shell"].sizes;
const buttonSpec = measured.components["node-chrome-button"].sizes;
const handleSpec = measured.components["node-side-handle"].sizes;

/** `sizes` 한 칸. `$…` 사유와 한 객체에 섞여 있어 타입이 열려 있다 — 수가 아니면 던진다. */
function sizeOf(spec: Record<string, unknown>, key: string, label: string): number {
  const value = spec[key];
  if (typeof value !== "number") throw new Error(`${label}.${key}가 수가 아닙니다`);
  return value;
}

const shell = (key: string): number =>
  sizeOf(shellSpec["video/false"] as Record<string, unknown>, key, "node-shell.sizes.video/false");
const button = (key: string): number =>
  sizeOf(
    buttonSpec["md/neutral/Default"] as Record<string, unknown>,
    key,
    "node-chrome-button.sizes.md/neutral/Default",
  );
const handle = (key: string): number =>
  sizeOf(handleSpec["image/Default"] as Record<string, unknown>, key, "node-side-handle.sizes.image/Default");

const px = (value: string): number => Number.parseFloat(value);

function find(testId: string): HTMLElement {
  const node = document.querySelector(`[data-testid="${testId}"]`);
  if (node === null) throw new Error(`찾지 못했습니다: ${testId}`);
  return node as HTMLElement;
}

/** 토큰 하나를 **렌더해서** 색 문자열로 내린다. 토큰은 `color(srgb …)` 로 발행돼 있어 계산값과
 * 형태가 다르므로, 같은 브라우저에 같은 프로퍼티로 물려 계산시킨 값끼리 비교한다. */
function tokenColor(id: string): string {
  const probe = document.createElement("div");
  probe.style.setProperty("color", `var(--louis-${id})`);
  document.body.append(probe);
  const value = getComputedStyle(probe).color;
  probe.remove();
  return value;
}

/** 액센트 88% — 선택 테두리의 계약값을 브라우저가 합성한 그대로 만든다. */
function accent88(id: string): string {
  const probe = document.createElement("div");
  probe.style.setProperty(
    "color",
    `color-mix(in srgb, var(--louis-${id}) 88%, transparent)`,
  );
  document.body.append(probe);
  const value = getComputedStyle(probe).color;
  probe.remove();
  return value;
}

type Accent =
  | "video"
  | "image"
  | "text"
  | "youtube"
  | "instagram"
  | "audio"
  | "edit";

const ACCENTS: readonly Accent[] = [
  "video",
  "image",
  "text",
  "youtube",
  "instagram",
  "audio",
  "edit",
];

/** 문서 Anatomy 절 그대로의 셸 한 벌. 본문은 노드 타입이 채우는 슬롯이라 비워 둔다. */
function Shell({
  accent = "video",
  selected = false,
  id = "",
}: {
  accent?: Accent;
  selected?: boolean;
  id?: string;
}): JSX.Element {
  return (
    <div
      className="louis-node-shell"
      data-accent={accent}
      data-selected={selected ? "true" : "false"}
      data-testid={`shell${id}`}
    >
      <div className="louis-node-shell__header" data-testid={`header${id}`}>
        <span className="louis-node-shell__title" data-testid={`title${id}`}>
          <span className="louis-node-shell__glyph" data-testid={`glyph${id}`} />
          <span className="louis-node-shell__label" data-testid={`label${id}`}>
            이미지
          </span>
        </span>
        <span className="louis-node-shell__actions" data-testid={`actions${id}`}>
          <button
            type="button"
            className="louis-node-chrome-button"
            data-testid={`download${id}`}
            aria-label="다운로드"
          >
            <span className="louis-node-chrome-button__glyph" data-testid={`dglyph${id}`} />
          </button>
          <button
            type="button"
            className="louis-node-chrome-button"
            data-tone="danger"
            data-testid={`remove${id}`}
            aria-label="삭제"
          >
            <span className="louis-node-chrome-button__glyph" />
          </button>
        </span>
      </div>
      <div className="louis-node-shell__card" data-testid={`card${id}`}>
        <div className="louis-node-shell__body" data-testid={`body${id}`} />
      </div>
    </div>
  );
}

const CHANNELS = ["image", "text", "edit", "audio", "youtube", "instagram"] as const;
type Channel = (typeof CHANNELS)[number];

function Handle({
  channel,
  disabled = false,
}: {
  channel: Channel;
  disabled?: boolean;
}): JSX.Element {
  return (
    <button
      type="button"
      className="louis-node-side-handle"
      data-channel={channel}
      data-testid={`handle-${channel}${disabled ? "-off" : ""}`}
      aria-label={channel}
      {...(disabled ? { disabled: true } : {})}
    >
      <span
        className="louis-node-side-handle__facet"
        data-testid={`facet-${channel}${disabled ? "-off" : ""}`}
      >
        <span className="louis-node-side-handle__glyph" data-testid={`hglyph-${channel}${disabled ? "-off" : ""}`} />
      </span>
    </button>
  );
}

test("셸의 기하가 기록과 같다", async () => {
  await render(<Shell />);
  const root = getComputedStyle(find("shell"));
  expect(find("shell").getBoundingClientRect().width).toBe(shell("cardWidth"));
  expect(px(root.rowGap)).toBe(shell("headerToCardGap"));
  expect(px(root.paddingTop)).toBe(shell("paddingBlock"));
  expect(px(root.paddingLeft)).toBe(shell("paddingInline"));

  const header = getComputedStyle(find("header"));
  expect(find("header").getBoundingClientRect().height).toBe(shell("headerHeight"));
  expect(px(header.columnGap)).toBe(shell("headerGap"));
  expect(px(header.paddingLeft)).toBe(shell("headerPaddingInline"));
  expect(px(header.paddingRight)).toBe(shell("headerPaddingInline"));

  expect(px(getComputedStyle(find("title")).columnGap)).toBe(shell("titleGap"));
  const glyph = find("glyph").getBoundingClientRect();
  expect(glyph.width).toBe(shell("glyphSize"));
  expect(glyph.height).toBe(shell("glyphSize"));
});

// 라벨의 줄 상자는 **줄 높이 1 이 만든 결과값**이다. body-14 의 기본 1.5 를 좁혀 글리프와
// 시각 중앙을 맞춘 것이고, 그 사실은 수 하나(labelHeight 14)로만 남아 있어 렌더 없이는
// 확인할 방법이 없다 — verify-recipe-record 는 비율을 수로 풀지 못한다.
test("라벨의 줄 상자가 글자 크기와 같다", async () => {
  await render(<Shell />);
  const label = getComputedStyle(find("label"));
  expect(px(label.fontSize)).toBe(shell("labelFontSize"));
  expect(px(label.lineHeight)).toBe(shell("labelHeight"));
});

// 액션 쌍은 **의도적으로 붙어 있다.** 간격 0 과 자식 둘이 함께 있어야 「붙였다」가 계약으로
// 남는다 — 한쪽만 바뀌면 폭 64 가 조용히 다른 수로 간다.
test("액션 쌍이 간격 없이 붙고 폭이 버튼 변의 두 배다", async () => {
  await render(<Shell />);
  const actions = find("actions");
  expect(px(getComputedStyle(actions).columnGap)).toBe(shell("actionsGap"));
  expect(actions.children.length).toBe(shell("actionsCount"));
  expect(actions.getBoundingClientRect().width).toBe(shell("actionsWidth"));
});

// 카드의 폭·곡률·테두리. **높이는 재지 않는다** — 셸이 소유하지 않는 값이고, 기록의 160 은
// 제품의 폴백을 옮긴 자리표시자다(문서 Known deviations 5).
test("카드의 폭·곡률·테두리가 기록과 같다", async () => {
  await render(<Shell />);
  const card = getComputedStyle(find("card"));
  expect(find("card").getBoundingClientRect().width).toBe(shell("cardWidth"));
  expect(px(card.borderTopLeftRadius)).toBe(shell("cardRadius"));
  expect(px(card.borderTopWidth)).toBe(shell("borderWidth"));
  expect(card.borderTopStyle).toBe("solid");
  // 바깥 프레임은 자기 곡률을 갖지 않는다 — 곡률은 카드가 갖는다.
  expect(px(getComputedStyle(find("shell")).borderTopLeftRadius)).toBe(shell("rootRadius"));
});

// **미선택 일곱이 전부 같다**는 것이 실측이다. 카드 자신은 타입을 드러내지 않는다 — 이
// 시험이 없으면 누가 액센트를 미선택 면에 흘려도 아무도 보지 못한다.
test("미선택에서 액센트 일곱이 같은 면과 같은 테두리를 갖는다", async () => {
  await render(
    <>
      {ACCENTS.map((accent) => (
        <Shell key={accent} accent={accent} id={`-${accent}`} />
      ))}
    </>,
  );
  const paints = ACCENTS.map((accent) => {
    const card = getComputedStyle(find(`card-${accent}`));
    return `${card.backgroundColor} / ${card.borderTopColor}`;
  });
  expect(new Set(paints).size).toBe(1);
});

// 미선택 테두리는 캔버스 토큰이다(DS-D-0082) — 라이트 흰색 · 다크 palette-gray-700. 공용
// `stroke-default` 로 되돌아가면 두 테마 모두 한 칸씩 틀린다. 두 테마를 다 잰다.
test("미선택 카드 테두리가 두 테마에서 node-card-stroke 다", async () => {
  await render(<Shell />);
  for (const theme of ["light", "dark"] as const) {
    document.documentElement.setAttribute("data-theme", theme);
    expect(getComputedStyle(find("card")).borderTopColor, `${theme} 카드 테두리`).toBe(
      tokenColor("color-node-card-stroke"),
    );
  }
  document.documentElement.removeAttribute("data-theme");
});

// 메타 알약은 캔버스 안에서만 캔버스 면을 읽는다(DS-D-0082). 노드 셸 안과
// `data-louis-scope="canvas"` 안 둘이 범위이고, 그 밖(문의 화면 첨부 등)은 기본 면 그대로다.
test("메타 알약이 캔버스 안에서만 canvas-chip-surface 를 읽는다", async () => {
  await render(
    <>
      <div className="louis-node-shell">
        <span className="louis-node-chip" data-testid="chip-in-shell">
          모델
        </span>
      </div>
      <div data-louis-scope="canvas">
        <span className="louis-node-chip" data-testid="chip-in-scope">
          모델
        </span>
      </div>
      <span className="louis-node-chip" data-testid="chip-outside">
        모델
      </span>
    </>,
  );
  for (const theme of ["light", "dark"] as const) {
    document.documentElement.setAttribute("data-theme", theme);
    // 알약은 `background` 에 전이를 건다 — 테마를 뒤집은 직후는 보간 중인 색이라 끝난 뒤에 잰다.
    void getComputedStyle(document.body).backgroundColor;
    await Promise.all(document.getAnimations().map((animation) => animation.finished));
    const canvas = tokenColor("color-canvas-chip-surface");
    expect(getComputedStyle(find("chip-in-shell")).backgroundColor, `${theme} 셸 안`).toBe(canvas);
    expect(getComputedStyle(find("chip-in-scope")).backgroundColor, `${theme} 범위 안`).toBe(canvas);
    expect(getComputedStyle(find("chip-outside")).backgroundColor, `${theme} 캔버스 밖`).toBe(
      tokenColor("color-node-chip-surface"),
    );
  }
  document.documentElement.removeAttribute("data-theme");
});

// 선택에서만 액센트가 나타난다. youtube 와 instagram 이 **바이트 단위로 같다**는 기록의
// 주장($whyAccentNotType)도 여기서 함께 검증한다 — 같은 값을 두 칸으로 남긴 결정이라,
// 어느 날 한쪽만 움직이면 그 결정이 뜻을 잃는다.
test("선택 테두리가 액센트 88% 이고 youtube·instagram 이 같다", async () => {
  await render(
    <>
      {ACCENTS.map((accent) => (
        <Shell key={accent} accent={accent} selected id={`-${accent}`} />
      ))}
    </>,
  );
  for (const accent of ACCENTS) {
    expect(getComputedStyle(find(`card-${accent}`)).borderTopColor).toBe(
      accent88(`color-node-${accent}-accent`),
    );
    expect(getComputedStyle(find(`title-${accent}`)).color).toBe(
      tokenColor(`color-node-${accent}-accent`),
    );
  }
  expect(getComputedStyle(find("card-youtube")).borderTopColor).toBe(
    getComputedStyle(find("card-instagram")).borderTopColor,
  );
});

test("크롬 버튼의 기하가 기록과 같고 면이 없다", async () => {
  await render(<Shell />);
  const box = find("download").getBoundingClientRect();
  expect(box.width).toBe(button("width"));
  expect(box.height).toBe(button("height"));
  const style = getComputedStyle(find("download"));
  expect(px(style.borderTopLeftRadius)).toBe(button("radius"));
  expect(px(style.borderTopWidth)).toBe(button("borderWidth"));
  expect(px(style.paddingTop)).toBe(button("paddingBlock"));
  expect(px(style.paddingLeft)).toBe(button("paddingInline"));
  // **면이 없는 것이 이 버튼의 정체다.** 기본에 면이 생기면 IconButton 의 ghost 와 구분이
  // 사라지고, 노드 크롬 축을 따로 두는 이유도 함께 사라진다.
  expect(style.backgroundColor).toBe("rgba(0, 0, 0, 0)");
  const glyph = find("dglyph").getBoundingClientRect();
  expect(glyph.width).toBe(button("glyphSize"));
  expect(glyph.height).toBe(button("glyphSize"));
});

// 비활성은 면이 아니라 **불투명도로만** 갈린다. 0.35 는 제품의 `disabled:opacity-35` 이고,
// Figma 쪽 정본은 parity 게이트의 opacity 블록이다 — 기록에는 일부러 두지 않았다.
test("비활성 크롬 버튼이 불투명도로만 갈린다", async () => {
  await render(
    <button type="button" className="louis-node-chrome-button" data-testid="off" disabled>
      <span className="louis-node-chrome-button__glyph" />
    </button>,
  );
  const style = getComputedStyle(find("off"));
  expect(Number(style.opacity)).toBeCloseTo(0.35, 3);
  expect(style.backgroundColor).toBe("rgba(0, 0, 0, 0)");
});

// 호버 틴트의 모드 쌍(DS-D-0099). 제품은 중립 라이트 검정 8% · 다크 흰 12%, 삭제 red 8% · 12%, sm 8% · 16% 다.
// 진짜 포인터를 옮기지 않고 **두 칸**을 잰다 — 토큰이 그 쌍을 갖는가, 그리고 호버 규칙이 그 토큰을 읽는가.
// 앞 칸만 재면 규칙이 옛 `accent-ghost-hover`(두 모드 8%)로 돌아가도 초록이다.
function hoverRuleBackgrounds(): string[] {
  const out: string[] = [];
  const walk = (rules: CSSRuleList): void => {
    for (const rule of Array.from(rules)) {
      if (rule instanceof CSSStyleRule && rule.selectorText.includes(".louis-node-chrome-button") && rule.selectorText.includes(":hover")) {
        const value = rule.style.getPropertyValue("background");
        if (value !== "") out.push(`${rule.selectorText} => ${value}`);
      } else if ("cssRules" in rule) walk((rule as CSSGroupingRule).cssRules);
    }
  };
  for (const sheet of Array.from(document.styleSheets)) walk(sheet.cssRules);
  return out;
}

test("크롬 버튼 호버 틴트가 모드 쌍 토큰을 읽는다", async () => {
  await render(<span />);
  // [채널 r · g · b(0~255), 알파] — 라이트 / 다크. 다크의 흰색은 palette-gray-000(#fafafa)이다(제품 `--palette-gray-000-rgb`).
  const expected: Record<string, Record<"light" | "dark", readonly [number, number, number, number]>> = {
    "color-node-chrome-hover": { light: [0, 0, 0, 0.08], dark: [250, 250, 250, 0.12] },
    "color-node-chrome-hover-sm": { light: [23, 27, 34, 0.08], dark: [250, 250, 250, 0.16] },
    "color-node-chrome-danger-hover": { light: [255, 75, 89, 0.08], dark: [255, 75, 89, 0.12] },
  };
  for (const theme of ["light", "dark"] as const) {
    document.documentElement.setAttribute("data-theme", theme);
    for (const [token, pair] of Object.entries(expected)) {
      const got = parseColor(tokenColor(token));
      const want = pair[theme];
      for (let i = 0; i < 3; i += 1) expect(Math.abs((got[i] ?? 0) - want[i]!), `${theme} ${token} 채널 ${i}`).toBeLessThan(1);
      expect(got[3], `${theme} ${token} 알파`).toBeCloseTo(want[3], 3);
    }
  }
  document.documentElement.removeAttribute("data-theme");
  const rules = hoverRuleBackgrounds().join("\n");
  expect(rules).toContain("var(--louis-color-node-chrome-hover)");
  expect(rules).toContain("var(--louis-color-node-chrome-danger-hover)");
  expect(rules).toContain("var(--louis-color-node-chrome-hover-sm)");
  expect(rules).not.toContain("accent-ghost-hover");
});

test("사이드 핸들의 기하가 기록과 같고 디스크가 셸을 꽉 채운다", async () => {
  await render(<Handle channel="image" />);
  const shellBox = find("handle-image").getBoundingClientRect();
  expect(shellBox.width).toBe(handle("width"));
  expect(shellBox.height).toBe(handle("height"));
  const shellStyle = getComputedStyle(find("handle-image"));
  expect(px(shellStyle.borderTopLeftRadius)).toBe(handle("radius"));
  expect(px(shellStyle.borderTopWidth)).toBe(handle("borderWidth"));
  // **셸은 투명하고 채색은 디스크가 갖는다.** 셸에 면이 붙으면 호버 스케일이 클릭 영역을
  // 흔든다 — 제품이 둘을 나눈 이유가 그것이다.
  expect(shellStyle.backgroundColor).toBe("rgba(0, 0, 0, 0)");

  // 디스크의 28 과 8 은 레시피에 수로 적혀 있지 않다(`100%` 와 `inherit`). 관계가 계약이고
  // 수는 그 결과라서, 그 수가 실제로 나오는지는 **렌더해야만** 알 수 있다.
  const facetBox = find("facet-image").getBoundingClientRect();
  expect(facetBox.width).toBe(handle("facetSize"));
  expect(facetBox.height).toBe(handle("facetSize"));
  expect(px(getComputedStyle(find("facet-image")).borderTopLeftRadius)).toBe(
    handle("facetRadius"),
  );
  const glyph = find("hglyph-image").getBoundingClientRect();
  expect(glyph.width).toBe(handle("glyphSize"));
  expect(glyph.height).toBe(handle("glyphSize"));
});

// 채널 셋이 서로 다른 면을 갖고, 그 면이 제품과 같은 토큰에서 온다. 이 시험이 없으면
// 세 채널이 같은 색으로 무너져도 기하 시험은 전부 초록으로 남는다.
test("채널 셋의 디스크가 각자의 채널 토큰을 문다", async () => {
  await render(
    <>
      <Handle channel="image" />
      <Handle channel="text" />
      <Handle channel="edit" />
    </>,
  );
  const faces = (["image", "text", "edit"] as const).map((channel) => {
    const paint = getComputedStyle(find(`facet-${channel}`)).backgroundColor;
    expect(paint).toBe(tokenColor(`color-node-handle-icon-${channel}`));
    return paint;
  });
  expect(new Set(faces).size).toBe(3);
});

// 비활성은 채널별 비활성 토큰으로 간다. **라이트에서 제품과 갈리는 자리**라(제품은 활성
// 토큰에 밝기 필터를 건다) 어느 값을 무는지가 결정이고, 그 결정이 조용히 뒤집히지 않게 잰다.
test("비활성 디스크가 채널별 비활성 토큰을 문다", async () => {
  await render(<Handle channel="image" disabled />);
  const facet = getComputedStyle(find("facet-image-off"));
  expect(facet.backgroundColor).toBe(tokenColor("color-node-handle-bg-disabled-image"));
  expect(facet.color).toBe(tokenColor("color-node-handle-icon-disabled-image"));
});

// Figma NodeSideHandle 의 열두 칸(Channel 6 × State Default · Disabled, DS-D-0099)을 기록의 키마다 렌더해 맞댄다.
// 기하는 열두 칸이 같지만 **칸마다 잰다** — 비활성에서 디스크가 줄거나 셸이 면을 얻으면 그 칸만 빨개진다.
// 비활성 칸은 면 · 잉크가 그 채널의 비활성 토큰이고 안쪽 광(`::before`)이 꺼진다(Figma 는 INNER_SHADOW 가 없다).
test("사이드 핸들 열두 칸이 기록의 키마다 같은 기하와 그 칸의 토큰을 갖는다", async () => {
  await render(
    <>
      {CHANNELS.map((channel) => (
        <Handle key={channel} channel={channel} />
      ))}
      {CHANNELS.map((channel) => (
        <Handle key={`${channel}-off`} channel={channel} disabled />
      ))}
    </>,
  );
  const keys = Object.keys(handleSpec);
  expect(keys.length).toBe(12);
  for (const key of keys) {
    const [channel, state] = key.split("/") as [Channel, "Default" | "Disabled"];
    const spec = handleSpec[key as keyof typeof handleSpec] as Record<string, unknown>;
    const suffix = state === "Disabled" ? "-off" : "";
    const label = `node-side-handle.sizes.${key}`;
    const shell = find(`handle-${channel}${suffix}`).getBoundingClientRect();
    expect(shell.width, `${key} 폭`).toBe(sizeOf(spec, "width", label));
    expect(shell.height, `${key} 높이`).toBe(sizeOf(spec, "height", label));
    expect(px(getComputedStyle(find(`handle-${channel}${suffix}`)).borderTopLeftRadius), `${key} 반경`).toBe(sizeOf(spec, "radius", label));
    const facetNode = find(`facet-${channel}${suffix}`);
    expect(facetNode.getBoundingClientRect().width, `${key} 디스크`).toBe(sizeOf(spec, "facetSize", label));
    expect(px(getComputedStyle(facetNode).borderTopLeftRadius), `${key} 디스크 반경`).toBe(sizeOf(spec, "facetRadius", label));
    expect(find(`hglyph-${channel}${suffix}`).getBoundingClientRect().width, `${key} 글리프`).toBe(sizeOf(spec, "glyphSize", label));
    const facet = getComputedStyle(facetNode);
    const glow = getComputedStyle(facetNode, "::before").display;
    if (state === "Default") {
      expect(facet.backgroundColor, `${key} 면`).toBe(tokenColor(`color-node-handle-icon-${channel}`));
      expect(glow, `${key} 안쪽 광`).not.toBe("none");
    } else {
      expect(facet.backgroundColor, `${key} 면`).toBe(tokenColor(`color-node-handle-bg-disabled-${channel}`));
      expect(facet.color, `${key} 잉크`).toBe(tokenColor(`color-node-handle-icon-disabled-${channel}`));
      expect(glow, `${key} 안쪽 광`).toBe("none");
    }
  }
});

// ── 생성 버튼(2026-10-13, DS-D-0084) ────────────────────────────────────────
// 입력판 오른쪽 끝의 별 + 크레딧 알약. 기록은 `node-generate-button`(레시피 선언)이고 Figma 는 NodeGenerateButton 이다.
const generateSpec = measured.components["node-generate-button"].sizes;
const generate = (key: string): number =>
  sizeOf(generateSpec["Credit/Default"] as Record<string, unknown>, key, "node-generate-button.sizes.Credit/Default");

function GenerateButton({ disabled = false, testId }: { readonly disabled?: boolean; readonly testId: string }): JSX.Element {
  return (
    <button type="button" className="louis-node-shell__generate-button" data-testid={testId} disabled={disabled}>
      <span className="louis-node-shell__generate-content" data-testid={`${testId}-content`}>
        <svg className="louis-node-shell__generate-icon" data-testid={`${testId}-icon`} viewBox="0 0 256 256" aria-hidden="true" />
        <span className="louis-node-shell__generate-trailing" data-testid={`${testId}-trailing`}>
          2250
        </span>
      </span>
    </button>
  );
}

test("생성 버튼의 기하가 기록과 같다", async () => {
  await render(<GenerateButton testId="gen" />);
  const style = getComputedStyle(find("gen"));
  expect(find("gen").getBoundingClientRect().height).toBe(generate("height"));
  expect(px(style.minWidth)).toBe(generate("minWidth"));
  expect(px(style.paddingTop)).toBe(generate("paddingBlock"));
  expect(px(style.paddingLeft)).toBe(generate("paddingInline"));
  expect(px(style.borderTopLeftRadius)).toBe(generate("radius"));
  expect(px(getComputedStyle(find("gen-content")).columnGap)).toBe(generate("gap"));
  const icon = find("gen-icon").getBoundingClientRect();
  expect(icon.width).toBe(generate("iconSize"));
  expect(icon.height).toBe(generate("iconSize"));
});

// 면은 시맨틱 둘의 가로 그라디언트이고, 안쪽 빛은 `::before` 의 흰 8px 안쪽 그림자를 overlay 로 섞는다.
// 이 둘이 생성 버튼을 primary Button(단색 · 위아래 1px 빛)과 가르는 정체다.
test("생성 버튼의 면이 그라디언트이고 빛이 overlay 로 섞인다", async () => {
  await render(<GenerateButton testId="gen2" />);
  const image = getComputedStyle(find("gen2")).backgroundImage;
  expect(image).toContain("linear-gradient(90deg");
  expect(image).toContain(tokenColor("color-node-generate-surface-edge"));
  expect(image).toContain(tokenColor("color-node-generate-surface-center"));
  const glow = getComputedStyle(find("gen2"), "::before");
  expect(glow.mixBlendMode).toBe("overlay");
  expect(glow.boxShadow).toContain("inset");
  expect(glow.boxShadow).toContain("8px");
  expect(glow.boxShadow).toContain(tokenColor("color-node-generate-foreground"));
  expect(getComputedStyle(find("gen2-trailing")).color).toBe(tokenColor("color-node-generate-trailing"));
});

test("비활성 생성 버튼이 불투명도로만 갈린다", async () => {
  await render(<GenerateButton testId="gen3" disabled />);
  const style = getComputedStyle(find("gen3"));
  expect(Number(style.opacity)).toBeCloseTo(0.35, 3);
  expect(style.backgroundImage).toContain("linear-gradient(90deg");
});
