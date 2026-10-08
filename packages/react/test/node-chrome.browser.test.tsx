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
    buttonSpec["neutral/Default"] as Record<string, unknown>,
    key,
    "node-chrome-button.sizes.neutral/Default",
  );
const handle = (key: string): number =>
  sizeOf(handleSpec.image as Record<string, unknown>, key, "node-side-handle.sizes.image");

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

function Handle({
  channel,
  disabled = false,
}: {
  channel: "image" | "text" | "edit";
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
        <span className="louis-node-side-handle__glyph" data-testid={`hglyph-${channel}`} />
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
