// figma/components.measured.json 의 **section-header** 값을 코드가 여전히 만드는지 검증한다.
//
// 이 파일이 없으면 section-header 칸은 한 번 적어 두고 잊히는 숫자가 된다. parity 게이트는
// Figma 가 measured 와 같은지만 보므로, CSS 가 조용히 바뀌면 **Figma 와 measured 는 서로 맞고
// 둘 다 코드와 틀린** 상태로 통과한다. `verify-figma-done` 이 요구하는 「두 방향」의 뒤쪽이
// 이 파일이다.
//
// **React 컴포넌트가 아니라 클래스 마크업을 렌더한다.** section-header 는 `packages/react/src`
// 에 표면이 없고 정본이 `packages/css/src/component/section-header.css` 다(계약의 `figmaAhead`
// 가 그 사실을 적는다). 그래서 여기서 렌더하는 마크업은 문서 Usage 절의 계약 그대로여야
// 한다 — 소비처가 지켜야 하는 것과 다른 마크업을 재면 이 파일이 제품에 없는 값을 지키게 된다.
// alert 가 같은 형태다.
//
// **모든 시험이 폭을 스스로 정한 iframe 안에서 잰다.** 이 컴포넌트의 정본 규칙 하나가 media
// query 이기 때문이다(719px 접힘 — 계약의 `$foldRule`). 처음에 그냥 렌더했더니 러너의 뷰포트가
// 719 이하라 **가로 벌이 한 번도 서지 않았고**, 그 상태에서 「가로로 선다」를 단언하지 않았다면
// 세로 값을 가로 계약과 대조하며 조용히 통과했을 것이다. 폭을 시험이 소유하면 그 사고가 없다.
// 접힘 자체도 여기서만 잴 수 있다 — Figma 에 그릴 자리가 없어 parity 는 볼 수 없다.
import { expect, test } from "vitest";
import measured from "../../../figma/components.measured.json" with { type: "json" };
import "@klipse-design/css/layers.css";
import "@klipse-design/css/tokens.css";
import "@klipse-design/css/styles.css";

type Level = "page" | "section" | "label";
/** 어드민 밖 자리의 세 단(2026-10-13, DS-D-0084). 슬롯 구성이 단마다 달라 위 세 단의 루프와 따로 잰다. */
type PlaceLevel = "list" | "article" | "display";

const LEVELS: readonly Level[] = ["page", "section", "label"];

/** 가로로 서는 폭. 720 이상이면 어느 값이든 같다 — 경계만 넘으면 된다. */
const WIDE = 1024;
/** 접히는 폭. 규칙이 `max-width: 719px` 이므로 경계값 자신을 쓴다. */
const NARROW = 719;

const px = (value: string): number => Number.parseFloat(value);
const round = (value: number): number => Math.round(value * 1000) / 1000;

/** 문서 Usage 절의 세 마크업 그대로다(section-header.md 「목록 머리」 · 「글 머리」 · 「전시 머리」). */
const placeMarkup = (level: PlaceLevel): string => {
  if (level === "list") {
    return [
      `<div class="louis-section-header" data-level="list" id="header">`,
      `<div class="louis-section-header__text" id="text"><h2 class="louis-section-header__title" id="title">아카이브<span class="louis-section-header__count">8</span></h2></div>`,
      `<div class="louis-section-header__actions" id="actions"><button type="button">새 하이라이트</button></div>`,
      `</div>`,
    ].join("");
  }
  if (level === "article") {
    return [
      `<header class="louis-section-header" data-level="article" id="header">`,
      `<div class="louis-section-header__text" id="text">`,
      `<h1 class="louis-section-header__title" id="title">제목</h1>`,
      `<p class="louis-section-header__description" id="description">리드 한 단락</p>`,
      `<div class="louis-section-header__meta" id="meta"><time datetime="2026-10-13">2026.10.13</time></div>`,
      `</div>`,
      `</header>`,
    ].join("");
  }
  return [
    `<div class="louis-section-header" data-level="display" id="header">`,
    `<div class="louis-section-header__text" id="text"><h2 class="louis-section-header__title" id="title">새 소식</h2></div>`,
    `<div class="louis-section-header__actions" id="actions"><button type="button">이전</button><button type="button">다음</button></div>`,
    `</div>`,
  ].join("");
};

const markup = (level: Level | PlaceLevel): string => {
  if (level === "list" || level === "article" || level === "display") return placeMarkup(level);
  const rows = [`<h2 class="louis-section-header__title" id="title">성과 지표</h2>`];
  if (level === "page") {
    rows.push(
      `<p class="louis-section-header__description" id="description">지난 기간과 견줘 무엇이 늘고 줄었는지 봅니다.</p>`,
    );
  }
  if (level !== "label") {
    rows.push(
      `<p class="louis-section-header__meta" id="meta">2026-08-08 ~ 2026-09-06</p>`,
    );
  }
  const actions =
    level === "label"
      ? ""
      : `<div class="louis-section-header__actions" id="actions"><button type="button">새로고침</button><button type="button">CSV</button></div>`;
  return [
    `<div class="louis-section-header" data-level="${level}" id="header">`,
    `<div class="louis-section-header__text" id="text">${rows.join("")}</div>`,
    actions,
    `</div>`,
  ].join("");
};

interface Mounted {
  readonly get: (id: string) => HTMLElement;
  readonly maybe: (id: string) => HTMLElement | null;
  readonly styleOf: (id: string) => CSSStyleDeclaration;
  readonly widthOf: (id: string) => number;
  readonly dispose: () => void;
}

/**
 * 주어진 폭의 iframe 안에 마크업을 세우고 그 안에서 잰다.
 *
 * 스타일시트는 문서의 `<style>`·`<link>` 를 복제해 넣는다 — vite 가 테스트 문서에 주입한
 * 것과 **같은 내용**이어야 하고, 따로 import 하면 두 벌이 갈릴 수 있다.
 */
function mount(level: Level | PlaceLevel, width: number): Mounted {
  const frame = document.createElement("iframe");
  frame.style.inlineSize = `${width}px`;
  frame.style.blockSize = "400px";
  frame.style.border = "0";
  document.body.append(frame);
  const doc = frame.contentDocument;
  const view = frame.contentWindow;
  if (doc === null || view === null) throw new Error("iframe 문서를 얻지 못했습니다");
  for (const node of Array.from(
    document.querySelectorAll("style, link[rel=stylesheet]"),
  )) {
    doc.head.append(node.cloneNode(true));
  }
  doc.body.style.margin = "0";
  doc.body.innerHTML = markup(level);
  const get = (id: string): HTMLElement => {
    const node = doc.getElementById(id);
    if (node === null) throw new Error(`찾지 못했습니다: ${id}`);
    return node;
  };
  return {
    get,
    maybe: (id) => doc.getElementById(id),
    styleOf: (id) => view.getComputedStyle(get(id)),
    widthOf: (id) => get(id).getBoundingClientRect().width,
    dispose: () => frame.remove(),
  };
}

/** 토큰의 계산값을 얻는다. 값이 같은 토큰이 여럿이라 이름 역조회는 쓰지 않는다(alert 와 같다). */
function tokenColor(id: string): string {
  const probe = document.createElement("div");
  probe.style.setProperty("color", `var(--louis-${id})`);
  document.body.append(probe);
  const value = getComputedStyle(probe).color;
  probe.remove();
  return value;
}

for (const level of LEVELS) {
  const spec = measured.components["section-header"].sizes[level];

  test(`SectionHeader ${level}의 구조값이 components.measured.json과 같다`, () => {
    const dom = mount(level, WIDE);
    try {
      const style = dom.styleOf("header");
      expect(style.flexDirection, "가로로 선다").toBe("row");
      expect(style.alignItems, "align").toBe(spec.align);
      expect(px(style.columnGap), "rowGap").toBe(spec.rowGap);
      expect(px(style.marginBlockEnd), "marginBlockEnd").toBe(spec.marginBlockEnd);

      // 면이 없다는 사실을 계약의 literal 0 과 같은 방향에서 잰다.
      expect(px(style.paddingTop), "paddingBlock").toBe(0);
      expect(px(style.paddingBottom), "paddingBlockEnd").toBe(0);
      expect(px(style.paddingLeft), "paddingInline").toBe(0);
      expect(px(style.paddingRight), "paddingInlineEnd").toBe(0);
      expect(px(style.borderTopWidth), "borderWidth").toBe(0);
      expect(px(style.borderTopLeftRadius), "radius").toBe(0);

      const text = dom.styleOf("text");
      expect(text.flexDirection, "제목 블록은 세로").toBe("column");
      expect(px(text.rowGap), "textGap").toBe(spec.textGap);

      const title = dom.styleOf("title");
      expect(px(title.fontSize), "titleFontSize").toBe(spec.titleFontSize);
      expect(round(px(title.lineHeight)), "titleLineHeight").toBe(
        round(spec.titleLineHeight),
      );
      expect(px(title.marginBlockStart), "제목은 자기 margin 을 갖지 않는다").toBe(0);
    } finally {
      dom.dispose();
    }
  });
}

test("SectionHeader page 만 설명·메타·액션 세 슬롯을 모두 갖는다", () => {
  const page = measured.components["section-header"].sizes.page;
  const dom = mount("page", WIDE);
  try {
    const description = dom.styleOf("description");
    expect(px(description.fontSize), "descriptionFontSize").toBe(
      page.descriptionFontSize,
    );
    expect(px(description.lineHeight), "descriptionLineHeight").toBe(
      page.descriptionLineHeight,
    );

    const meta = dom.styleOf("meta");
    expect(px(meta.fontSize), "metaFontSize").toBe(page.metaFontSize);
    expect(px(meta.lineHeight), "metaLineHeight").toBe(page.metaLineHeight);
    expect(meta.fontVariantNumeric, "메타는 tabular-nums").toContain("tabular-nums");

    const actions = dom.styleOf("actions");
    expect(px(actions.columnGap), "actionsGap").toBe(page.actionsGap);
    expect(actions.flexShrink, "액션은 줄지 않는다").toBe("0");
  } finally {
    dom.dispose();
  }
});

test("SectionHeader section 은 액션·메타를 갖고 설명은 갖지 않는다", () => {
  const spec = measured.components["section-header"].sizes.section;
  const dom = mount("section", WIDE);
  try {
    expect(dom.maybe("description"), "설명 없음").toBeNull();
    expect(px(dom.styleOf("meta").fontSize), "metaFontSize").toBe(spec.metaFontSize);
    expect(px(dom.styleOf("actions").columnGap), "actionsGap").toBe(spec.actionsGap);
  } finally {
    dom.dispose();
  }
});

test("SectionHeader label 은 제목 한 줄뿐이다", () => {
  const dom = mount("label", WIDE);
  try {
    expect(dom.maybe("description"), "설명 없음").toBeNull();
    expect(dom.maybe("meta"), "메타 없음").toBeNull();
    expect(dom.maybe("actions"), "액션 없음").toBeNull();
  } finally {
    dom.dispose();
  }
});

test("SectionHeader 의 잉크는 역할 토큰 셋이고 제목만 fg-primary 다", () => {
  const page = mount("page", WIDE);
  const label = mount("label", WIDE);
  try {
    expect(page.styleOf("title").color, "제목").toBe(tokenColor("color-fg-primary"));
    expect(page.styleOf("description").color, "설명").toBe(
      tokenColor("color-fg-secondary"),
    );
    expect(page.styleOf("meta").color, "메타").toBe(tokenColor("color-fg-tertiary"));
    // 아이브로우는 제목이 아니라 「무엇의 묶음인가」라 잉크도 한 단 내려간다.
    expect(label.styleOf("title").color, "아이브로우").toBe(
      tokenColor("color-fg-tertiary"),
    );
  } finally {
    page.dispose();
    label.dispose();
  }
});

test("SectionHeader 는 719px 이하에서 세로로 접히고 액션이 폭을 채운다", () => {
  const dom = mount("page", NARROW);
  try {
    const style = dom.styleOf("header");
    expect(style.flexDirection, "719px 이하에서는 세로").toBe("column");
    expect(style.alignItems, "교차축은 stretch").toBe("stretch");
    expect(round(dom.widthOf("actions")), "액션이 폭을 채운다").toBe(
      round(dom.widthOf("header")),
    );
  } finally {
    dom.dispose();
  }
});

/* ── 어드민 밖 자리의 세 단 ────────────────────────────────────────────────────
 *
 * 기록 `list` · `article` · `display` 칸은 2026-10-13 변형 묶음에서 Figma 되읽기로 옮긴 값이다. 그 값을 레시피가 여전히
 * 만드는지 여기서 잰다 — 1024 폭이라 랜딩 제목 계단(≤1023)은 서지 않고 정본 값(36)이 선다. */

/** 세 단이 같이 갖는 머리 · 제목 블록 · 제목 축을 잰다. 슬롯 축은 단마다 따로다. */
function expectHeadAxes(
  dom: Mounted,
  spec: {
    readonly align: string;
    readonly rowGap: number;
    readonly marginBlockEnd: number;
    readonly textGap: number;
    readonly titleFontSize: number;
    readonly titleLineHeight: number;
  },
): void {
  const style = dom.styleOf("header");
  expect(style.flexDirection, "가로로 선다").toBe("row");
  expect(style.alignItems, "align").toBe(spec.align);
  expect(px(style.columnGap), "rowGap").toBe(spec.rowGap);
  expect(px(style.marginBlockEnd), "marginBlockEnd").toBe(spec.marginBlockEnd);
  expect(px(style.paddingTop), "paddingBlock").toBe(0);
  expect(px(style.paddingLeft), "paddingInline").toBe(0);
  expect(px(style.paddingRight), "paddingInlineEnd").toBe(0);
  expect(px(style.borderTopWidth), "borderWidth").toBe(0);
  expect(px(style.borderTopLeftRadius), "radius").toBe(0);

  const text = dom.styleOf("text");
  expect(text.flexDirection, "제목 블록은 세로").toBe("column");
  expect(px(text.rowGap), "textGap").toBe(spec.textGap);

  const title = dom.styleOf("title");
  expect(px(title.fontSize), "titleFontSize").toBe(spec.titleFontSize);
  expect(round(px(title.lineHeight)), "titleLineHeight").toBe(round(spec.titleLineHeight));
}

test("SectionHeader list의 구조값이 components.measured.json과 같다", () => {
  const spec = measured.components["section-header"].sizes.list;
  const dom = mount("list", WIDE);
  try {
    expectHeadAxes(dom, spec);
    expect(px(dom.styleOf("header").paddingBottom), "paddingBlockEnd").toBe(0);
    expect(px(dom.styleOf("actions").columnGap), "actionsGap").toBe(spec.actionsGap);
  } finally {
    dom.dispose();
  }
});

test("SectionHeader article의 구조값이 components.measured.json과 같다", () => {
  const spec = measured.components["section-header"].sizes.article;
  const dom = mount("article", WIDE);
  try {
    expectHeadAxes(dom, spec);
    expect(px(dom.styleOf("description").fontSize), "descriptionFontSize").toBe(
      spec.descriptionFontSize,
    );
    const meta = dom.styleOf("meta");
    expect(px(meta.fontSize), "metaFontSize").toBe(spec.metaFontSize);
    expect(px(meta.lineHeight), "metaLineHeight").toBe(spec.metaLineHeight);
    expect(dom.maybe("actions"), "액션 자리가 없다").toBeNull();
  } finally {
    dom.dispose();
  }
});

test("SectionHeader display의 구조값이 components.measured.json과 같다", () => {
  const spec = measured.components["section-header"].sizes.display;
  const dom = mount("display", WIDE);
  try {
    expectHeadAxes(dom, spec);
    expect(px(dom.styleOf("header").paddingBottom), "paddingBlockEnd").toBe(0);
    expect(px(dom.styleOf("actions").columnGap), "actionsGap").toBe(spec.actionsGap);
  } finally {
    dom.dispose();
  }
});
