// Document 패턴 — design/patterns/document.md Acceptance tests · DS-D-0067.
//
// 문자열이 아니라 **계산값과 구조**를 잰다. 색은 테마마다 바닥 위에 캔버스로 합성해 8비트로
// 비교한다(table.browser.test.ts 와 같은 방법) — 계산값 문자열만 보면 토큰도 규칙도 멀쩡한데
// 다크에서 면이 바닥과 같은 색이 되는 사고를 보지 못한다.
import { afterEach, beforeEach, expect, test } from "vitest";
import { page } from "vitest/browser";
import "@klipse-design/css/tokens.css";
import "@klipse-design/css/styles.css";

const THEMES = ["light", "dark"] as const;
type Rgb = readonly [number, number, number];

function composite(...colors: readonly string[]): Rgb {
  const context = document.createElement("canvas").getContext("2d", { willReadFrequently: true });
  if (context === null) throw new Error("2d 캔버스를 만들지 못했습니다");
  context.canvas.width = 1;
  context.canvas.height = 1;
  for (const color of colors) {
    context.fillStyle = "#ff00ff";
    context.fillStyle = color;
    if (context.fillStyle === "#ff00ff") throw new Error(`캔버스가 색을 읽지 못했습니다: ${color}`);
    context.fillRect(0, 0, 1, 1);
  }
  const [r, g, b] = context.getImageData(0, 0, 1, 1).data;
  return [r ?? 0, g ?? 0, b ?? 0];
}

const channel = (value: number): number => {
  const s = value / 255;
  return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
};
const luminance = ([r, g, b]: Rgb): number =>
  0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);

const token = (name: string): string =>
  getComputedStyle(document.documentElement).getPropertyValue(name).trim();

/** 계산된 색을 불투명 바닥 위에 칠한 결과 — 두 색이 「같아 보이는가」를 8비트로 묻는다. */
const on = (floor: string, color: string): Rgb => composite(floor, color);

const FIXTURE = `
<div class="louis-document" data-probe="page">
<main class="louis-document__sheet" data-probe="sheet">
<article class="louis-document__column" data-probe="column">
  <header class="louis-document__head">
    <p class="louis-document__brand">Klipse 마케팅</p>
    <h1 class="louis-document__title" data-probe="title">문서 제목</h1>
    <p class="louis-document__lead">한 문장 리드</p>
    <p class="louis-document__meta">2026년 9월</p>
  </header>
  <section class="louis-document-decision" aria-labelledby="t-decision">
    <h2 class="louis-document-decision__title" id="t-decision">승인이 필요한 사항</h2>
    <ol class="louis-document-decision__list" role="list" data-probe="decision-list">
      <li class="louis-document-decision__item" data-probe="decision-item">
        <span class="louis-document-marker" aria-hidden="true" data-probe="marker">1</span>
        <p class="louis-document-decision__label">첫 결정</p>
        <p class="louis-document-decision__detail"><strong data-probe="decision-strong">설명</strong></p>
      </li>
      <li class="louis-document-decision__item">
        <span class="louis-document-marker" aria-hidden="true">2</span>
        <p class="louis-document-decision__label">둘째 결정</p>
        <p class="louis-document-decision__detail">설명</p>
      </li>
    </ol>
  </section>
  <section class="louis-document-section" aria-labelledby="t-one">
    <div class="louis-document-section__head">
      <p class="louis-document-section__kicker" data-probe="kicker">01</p>
      <h2 class="louis-document-section__title" id="t-one" data-probe="section-title">절 제목</h2>
    </div>
    <p class="louis-document-prose" data-probe="prose">문장 <strong data-probe="strong">강조</strong> 문장</p>
    <ol class="louis-document-flow" role="list" aria-label="흐름" data-probe="flow">
      <li class="louis-document-flow__step" data-probe="flow-first"><span class="louis-document-flow__label" data-probe="flow-label">가</span></li>
      <li class="louis-document-flow__step" data-probe="flow-second"><span class="louis-document-flow__label">나</span></li>
    </ol>
    <ol class="louis-document-grid" role="list" data-probe="grid-3">
      <li class="louis-document-card" data-probe="card"><p class="louis-document-card__title">카드</p><p class="louis-document-card__description">설명</p></li>
      <li class="louis-document-card"><p class="louis-document-card__title">카드</p></li>
      <li class="louis-document-card"><p class="louis-document-card__title">카드</p></li>
    </ol>
    <div class="louis-document-grid" data-columns="4" data-probe="grid-4">
      <div class="louis-document-stat" data-probe="stat"><p class="louis-document-stat__label">노출</p><p class="louis-document-stat__value" data-probe="stat-value">8,983<span class="louis-document-stat__unit">회</span></p><p class="louis-document-stat__hint"><strong data-probe="hint-strong">보조</strong></p></div>
      <div class="louis-document-stat"><p class="louis-document-stat__label">도달</p><p class="louis-document-stat__value">6,586</p></div>
      <div class="louis-document-stat"><p class="louis-document-stat__label">방문</p><p class="louis-document-stat__value">514</p></div>
      <div class="louis-document-stat"><p class="louis-document-stat__label">비용</p><p class="louis-document-stat__value">₩110,539</p></div>
    </div>
    <div class="louis-document-grid" data-columns="2" data-probe="grid-2">
      <figure class="louis-document-card">
        <figcaption class="louis-document-card__head"><span class="louis-document-card__title">방문</span><span class="louis-document-verdict" data-probe="verdict">+16회</span></figcaption>
        <ul class="louis-document-bars" role="list">
          <li class="louis-document-bars__row"><span class="louis-document-bars__label">A</span><span class="louis-document-bars__track" aria-hidden="true" data-probe="track"><span class="louis-document-bars__fill" style="--louis-document-bar-value: 50%" data-probe="fill"></span></span><span class="louis-document-bars__value" data-probe="bar-value">249</span></li>
          <li class="louis-document-bars__row" data-lead="true"><span class="louis-document-bars__label">B</span><span class="louis-document-bars__track" aria-hidden="true"><span class="louis-document-bars__fill" style="--louis-document-bar-value: 100%" data-probe="lead-fill"></span></span><span class="louis-document-bars__value">265</span></li>
        </ul>
      </figure>
      <div class="louis-document-card" data-accent="rail" data-probe="rail"><p class="louis-document-card__title">해석</p></div>
    </div>
    <div class="louis-document-card" data-inset="lg" data-layout="split" data-probe="split">
      <div class="louis-document-stat" data-probe="nested-stat"><p class="louis-document-stat__label">기간</p><p class="louis-document-stat__value">9/23</p></div>
      <div><p class="louis-document-card__title">판단</p></div>
    </div>
    <ol class="louis-document-timeline" role="list" aria-label="일정">
      <li class="louis-document-timeline__item" data-state="done"><p class="louis-document-timeline__when">9/22</p><div class="louis-document-timeline__body" data-probe="tl-done"><p class="louis-document-timeline__title">끝남</p></div></li>
      <li class="louis-document-timeline__item"><p class="louis-document-timeline__when">9/23</p><div class="louis-document-timeline__body" data-probe="tl-next"><p class="louis-document-timeline__title">다음</p></div></li>
      <li class="louis-document-timeline__item"><p class="louis-document-timeline__when">9/30</p><div class="louis-document-timeline__body" data-probe="tl-last"><p class="louis-document-timeline__title">마지막</p></div></li>
    </ol>
    <div class="louis-document-callout" role="note" data-probe="note"><span class="louis-document-callout__mark" aria-hidden="true" data-probe="note-mark"></span><div class="louis-document-callout__body"><p class="louis-document-callout__title">짚을 것</p><p class="louis-document-callout__text"><strong data-probe="callout-strong">강조</strong></p></div></div>
    <div class="louis-document-callout" data-tone="caution" role="note" data-probe="caution"><span class="louis-document-callout__mark" aria-hidden="true" data-probe="caution-mark"></span><div class="louis-document-callout__body"><p class="louis-document-callout__title">비용 확인</p></div></div>
    <div class="louis-document-table">
      <table class="louis-table" data-variant="ruled" data-probe="ruled">
        <caption class="louis-visually-hidden">소재별 성과</caption>
        <thead><tr><th scope="col" data-probe="ruled-head">지표</th><th scope="col" data-align="end">A</th><th scope="col" data-align="end">합계</th></tr></thead>
        <tbody>
          <tr><th scope="row" data-probe="row-head">방문</th><td data-align="end" data-emphasis="lead" data-probe="lead-cell">265</td><td data-align="end" data-emphasis="total" data-probe="total-cell">514</td></tr>
          <tr><th scope="row">비용</th><td data-align="end" data-probe="plain-cell">₩207</td><td data-align="end"><strong data-probe="cell-strong">₩215</strong></td></tr>
          <tr><th scope="row">클릭</th><td data-align="end" data-probe="last-cell">279</td><td data-align="end">551</td></tr>
        </tbody>
      </table>
    </div>
  </section>
  <footer class="louis-document__foot" data-probe="foot"><span>Plan</span><span>2026.09</span></footer>
</article>
</main>
</div>`;

let host: HTMLElement;
const probe = (name: string): HTMLElement => {
  const element = host.querySelector<HTMLElement>(`[data-probe="${name}"]`);
  if (element === null) throw new Error(`탐침이 없습니다: ${name}`);
  return element;
};

beforeEach(async () => {
  // vitest 브라우저 기본 창은 좁아서(≤719) 압축 규칙이 먼저 걸린다. 넓은 판을 먼저 잰다.
  await page.viewport(1440, 900);
  host = document.createElement("div");
  host.innerHTML = FIXTURE;
  document.body.append(host);
});

afterEach(() => {
  host.remove();
});

test("시트가 문서의 유일한 헤어라인이고 바닥 위에 선다", () => {
  const pageStyle = getComputedStyle(probe("page"));
  const sheet = getComputedStyle(probe("sheet"));
  const floor = pageStyle.backgroundColor;
  expect(on(floor, floor)).toEqual(composite(token("--louis-color-bg-canvas")));
  expect(on(floor, sheet.backgroundColor)).toEqual(composite(token("--louis-color-bg-surface")));
  expect(sheet.borderRadius).toBe(token("--louis-radius-overlay"));
  expect(sheet.boxShadow).toContain("inset");
  expect(sheet.boxShadow).toContain(token("--louis-border-width-hairline"));
  // 화면 가장자리와 시트 사이는 앱 셸이 메인 카드를 띄우는 그 값이다.
  expect(pageStyle.paddingTop).toBe(token("--louis-layout-app-shell-outer-gap"));
  expect(probe("sheet").getBoundingClientRect().width).toBe(1120);
});

test("카드에 색 레일이 없다 — 2026-09-28 소유자 지시로 레일 변형을 걷어냈다", () => {
  // 옛 마크업(`data-accent="rail"`)을 그대로 둔 카드도 여느 카드로 선다 — 앞에 긋는 선이 없다.
  expect(getComputedStyle(probe("rail"), "::before").content).toBe("none");
  expect(getComputedStyle(probe("rail")).backgroundColor).toBe(getComputedStyle(probe("card")).backgroundColor);
});

test("시트 안의 면에는 테두리도 그림자도 없다 — 깊이는 한 겹이다", () => {
  for (const name of ["decision-item", "card", "stat", "rail", "split", "note", "caution", "flow-label", "verdict", "marker"]) {
    const style = getComputedStyle(probe(name));
    expect(style.boxShadow, `${name} 에 그림자가 있다`).toBe("none");
    for (const side of ["Top", "Right", "Bottom", "Left"] as const) {
      expect(style[`border${side}Width`], `${name} 에 ${side} 테두리가 있다`).toBe("0px");
    }
  }
});

for (const theme of THEMES) {
  test(`${theme}: 안쪽 면은 잉크 알파다 — 시트와 다른 색이고 방향이 테마를 따른다`, () => {
    document.documentElement.setAttribute("data-theme", theme);
    const sheet = getComputedStyle(probe("sheet")).backgroundColor;
    const bare = composite(sheet);
    const ink = token("--louis-color-fg-primary");
    const face = on(sheet, getComputedStyle(probe("card")).backgroundColor);
    const strong = on(sheet, getComputedStyle(probe("flow-label")).backgroundColor);
    // 면은 fg-primary 4% · 칩은 8% 다 — 같은 잉크를 두 단 쓴다.
    const probeFace = document.createElement("div");
    probeFace.style.background = `color-mix(in srgb, ${ink} 4%, transparent)`;
    host.append(probeFace);
    expect(face).toEqual(on(sheet, getComputedStyle(probeFace).backgroundColor));
    probeFace.style.background = `color-mix(in srgb, ${ink} 8%, transparent)`;
    expect(strong).toEqual(on(sheet, getComputedStyle(probeFace).backgroundColor));
    probeFace.remove();
    expect(face).not.toEqual(bare);
    if (theme === "light") {
      expect(luminance(face)).toBeLessThan(luminance(bare));
      expect(luminance(strong)).toBeLessThan(luminance(face));
    } else {
      expect(luminance(face)).toBeGreaterThan(luminance(bare));
      expect(luminance(strong)).toBeGreaterThan(luminance(face));
    }
    // 같은 면을 쓰는 부품들은 같은 색이다.
    for (const name of ["decision-item", "stat", "rail", "split"]) {
      expect(on(sheet, getComputedStyle(probe(name)).backgroundColor), name).toEqual(face);
    }
    // 카드 안의 수치는 면을 겹치지 않는다.
    expect(on(sheet, getComputedStyle(probe("nested-stat")).backgroundColor)).toEqual(bare);
  });
}

test("박스 사이는 8, 카드 여백은 24 · 32 다", () => {
  for (const name of ["decision-list", "grid-3", "grid-4", "grid-2"]) {
    const style = getComputedStyle(probe(name));
    expect(style.rowGap, name).toBe("8px");
  }
  for (const name of ["grid-3", "grid-4", "grid-2"]) {
    expect(getComputedStyle(probe(name)).columnGap, name).toBe("8px");
  }
  for (const name of ["card", "stat", "decision-item", "note"]) {
    expect(getComputedStyle(probe(name)).paddingTop, name).toBe("24px");
    expect(getComputedStyle(probe(name)).paddingLeft, name).toBe("24px");
  }
  expect(getComputedStyle(probe("split")).paddingTop).toBe("32px");
  expect(getComputedStyle(probe("split")).paddingLeft).toBe("32px");
  expect(getComputedStyle(probe("nested-stat")).paddingTop).toBe("0px");
});

test("반경은 역할 다섯 가운데 하나다", () => {
  expect(getComputedStyle(probe("card")).borderRadius).toBe(token("--louis-radius-card"));
  expect(getComputedStyle(probe("stat")).borderRadius).toBe(token("--louis-radius-card"));
  expect(getComputedStyle(probe("note")).borderRadius).toBe(token("--louis-radius-alert"));
  for (const name of ["flow-label", "verdict", "marker", "track"]) {
    expect(getComputedStyle(probe(name)).borderRadius, name).toBe(token("--louis-radius-pill"));
  }
});

test("격자 열 수 — 기본 3 · data-columns 2 · 4", () => {
  const columns = (name: string): number =>
    getComputedStyle(probe(name)).gridTemplateColumns.split(" ").length;
  expect(columns("grid-3")).toBe(3);
  expect(columns("grid-4")).toBe(4);
  expect(columns("grid-2")).toBe(2);
});

test("타이포 — 제목 36 · 절 제목 28 · 수치 36 · 리드 16/500, 굵기는 semibold 까지", () => {
  // 제목과 리드는 랜딩 데스크톱의 절 제목(type-heading-36-semibold) · 설명(type-body-16-medium)과 같다(2026-09-28).
  const title = getComputedStyle(probe("title"));
  expect(title.fontSize).toBe("36px");
  expect(title.fontWeight).toBe("600");
  const lead = getComputedStyle(document.querySelector(".louis-document__lead")!);
  expect(lead.fontSize).toBe("16px");
  expect(lead.fontWeight).toBe("500");
  const section = getComputedStyle(probe("section-title"));
  expect(section.fontSize).toBe("28px");
  expect(section.fontWeight).toBe("600");
  const value = getComputedStyle(probe("stat-value"));
  expect(value.fontSize).toBe("36px");
  expect(value.fontVariantNumeric).toBe("tabular-nums");
  expect(value.whiteSpace).toBe("nowrap");
  // 키커는 강조색 글자이고 대문자로 바꾸지 않는다.
  const kicker = getComputedStyle(probe("kicker"));
  expect(kicker.textTransform).toBe("none");
  expect(composite(kicker.color)).toEqual(composite(token("--louis-color-accent-primary")));
  for (const element of host.querySelectorAll<HTMLElement>("*")) {
    expect(Number(getComputedStyle(element).fontWeight), element.className).toBeLessThanOrEqual(600);
  }
});

test("산문은 flex 가 아니다 — 문장 안의 strong 이 쪼개지지 않는다", () => {
  expect(getComputedStyle(probe("prose")).display).toBe("block");
  expect(getComputedStyle(probe("strong")).display).toBe("inline");
  expect(composite(getComputedStyle(probe("strong")).color)).toEqual(
    composite(token("--louis-color-fg-primary")),
  );
});

test("강조(strong)는 문서 어디서나 semibold · fg-primary 다 — 브라우저 기본 bolder(700)가 새지 않는다", () => {
  for (const name of ["strong", "decision-strong", "callout-strong", "hint-strong", "cell-strong"]) {
    const strong = getComputedStyle(probe(name));
    expect(strong.fontWeight, name).toBe("600");
    expect(composite(strong.color), name).toEqual(composite(token("--louis-color-fg-primary")));
  }
});

test("비교 막대 — 길이는 값이고 앞선 쪽만 강조색이며 수치가 글로 남는다", () => {
  const track = probe("track").getBoundingClientRect().width;
  expect(probe("fill").getBoundingClientRect().width).toBeCloseTo(track / 2, 0);
  expect(composite(getComputedStyle(probe("lead-fill")).backgroundColor)).toEqual(
    composite(token("--louis-color-accent-primary")),
  );
  expect(composite(getComputedStyle(probe("fill")).backgroundColor)).not.toEqual(
    composite(token("--louis-color-accent-primary")),
  );
  expect(probe("track").getAttribute("aria-hidden")).toBe("true");
  expect(probe("bar-value").textContent).toBe("249");
  expect(getComputedStyle(probe("track")).blockSize).toBe("8px");
});

test("타임라인 — 끝난 노드만 강조색이고 마지막 항목에는 이음선이 없다", () => {
  const node = (name: string): string => getComputedStyle(probe(name), "::before").backgroundColor;
  expect(composite(node("tl-done"))).toEqual(composite(token("--louis-color-accent-primary")));
  expect(composite(node("tl-next"))).not.toEqual(composite(token("--louis-color-accent-primary")));
  expect(getComputedStyle(probe("tl-next"), "::after").content).toBe('""');
  expect(getComputedStyle(probe("tl-last"), "::after").content).toBe("none");
});

test("흐름 — 칩 사이 화살표는 대체 텍스트가 빈 생성 콘텐츠이고 앞 칩 뒤에 붙으며 마지막 칩 뒤에는 없다", () => {
  expect(getComputedStyle(probe("flow-second"), "::after").content).toBe("none");
  expect(getComputedStyle(probe("flow-first"), "::before").content).toBe("none");
  const arrow = getComputedStyle(probe("flow-first"), "::after").content;
  expect(arrow).toContain("→");
  expect(arrow).toContain('/ ""');
  expect(probe("flow").tagName).toBe("OL");
});

test("콜아웃 — 두 톤의 면이 다르고 표식은 장식이다", () => {
  const sheet = getComputedStyle(probe("sheet")).backgroundColor;
  expect(on(sheet, getComputedStyle(probe("note")).backgroundColor)).not.toEqual(
    on(sheet, getComputedStyle(probe("caution")).backgroundColor),
  );
  expect(getComputedStyle(probe("note-mark"), "::before").content).toContain('"i"');
  expect(getComputedStyle(probe("caution-mark"), "::before").content).toContain('"!"');
  expect(composite(getComputedStyle(probe("caution-mark")).backgroundColor)).toEqual(
    composite(token("--louis-color-alert-warning-stroke")),
  );
  expect(probe("note-mark").getAttribute("aria-hidden")).toBe("true");
});

test("판정 알약 — 앞선 쪽의 초록 면이고 방향 알약(delta-pill)을 빌리지 않는다", () => {
  const verdict = probe("verdict");
  expect(verdict.classList.contains("louis-delta-pill")).toBe(false);
  const style = getComputedStyle(verdict);
  expect(composite(style.color)).toEqual(composite(token("--louis-color-fg-success")));
  expect(style.blockSize).toBe("24px");
  // 카드 머리 끝에 붙는다.
  const head = verdict.parentElement?.getBoundingClientRect();
  expect(head).toBeDefined();
  expect(verdict.getBoundingClientRect().right).toBeCloseTo(head?.right ?? 0, 0);
});

test("맺음 — 위 경계는 헤어라인 한 줄이다", () => {
  const style = getComputedStyle(probe("foot"));
  expect(style.boxShadow).toContain("inset");
  expect(style.borderTopWidth).toBe("0px");
});

test("규선 표 — 머리 면이 없고 가로 규선만 남으며 열 끝이 본문 끝과 맞는다", () => {
  const table = probe("ruled");
  expect(getComputedStyle(table).tableLayout).toBe("auto");
  const head = getComputedStyle(probe("ruled-head"));
  expect(head.backgroundColor).toBe("rgba(0, 0, 0, 0)");
  expect(head.borderBottomWidth).toBe("1px");
  expect(composite(head.borderBottomColor)).toEqual(composite(token("--louis-color-table-row-line")));
  expect(head.fontSize).toBe("14px");
  expect(head.paddingLeft).toBe("0px");
  const headRow = probe("ruled-head").parentElement;
  if (headRow === null) throw new Error("머리 행을 찾지 못했습니다");
  expect(getComputedStyle(headRow).boxShadow).toBe("none");
  const cell = getComputedStyle(probe("plain-cell"));
  expect(composite(cell.borderBottomColor)).toEqual(composite(token("--louis-color-stroke-hairline")));
  expect(composite(cell.color)).toEqual(composite(token("--louis-color-fg-secondary")));
  // 마지막 행 아래에는 선이 없다 — 표 아래는 본문의 여백이다.
  expect(getComputedStyle(probe("last-cell")).borderBottomWidth).toBe("0px");
  // 행 머리는 몸 칸과 같다 — 브라우저 기본값(굵게 · 가운데)이 새지 않는다.
  const rowHead = getComputedStyle(probe("row-head"));
  expect(rowHead.fontWeight).toBe("400");
  expect(rowHead.textAlign).toBe("start");
  expect(rowHead.paddingLeft).toBe("0px");
  // 셀 강조
  const total = getComputedStyle(probe("total-cell"));
  expect(total.fontWeight).toBe("600");
  expect(total.paddingRight).toBe("0px");
  expect(composite(total.color)).toEqual(composite(token("--louis-color-fg-primary")));
  const lead = getComputedStyle(probe("lead-cell"));
  expect(lead.fontWeight).toBe("600");
  expect(composite(lead.color)).toEqual(composite(token("--louis-color-alert-success-stroke")));
  expect(lead.textAlign).toBe("end");
  // 정렬 값 둘이 몸 칸에서도 머리 칸과 같다 — 몸 칸의 `text-align: start` 가 기본 정렬 규칙을 이긴다.
  const aligned = document.createElement("table");
  aligned.className = "louis-table";
  aligned.dataset.variant = "ruled";
  aligned.innerHTML =
    '<thead><tr><th scope="col">이름</th><th scope="col" data-align="center">가운데</th><th scope="col" data-align="end">끝</th></tr></thead>' +
    '<tbody><tr><th scope="row">가</th><td data-align="center">1</td><td data-align="end">2</td></tr></tbody>';
  host.append(aligned);
  for (const align of ["center", "end"]) {
    for (const cell of aligned.querySelectorAll<HTMLElement>(`[data-align="${align}"]`)) {
      expect(getComputedStyle(cell).textAlign, `${cell.tagName} ${align}`).toBe(align);
    }
  }
});

test("변형이 없는 표는 그대로다 — 머리 면과 헤어라인을 유지한다", () => {
  const plain = document.createElement("table");
  plain.className = "louis-table";
  plain.innerHTML = '<thead><tr><th scope="col">이름</th></tr></thead><tbody><tr><td>가</td></tr></tbody>';
  host.append(plain);
  const cell = plain.querySelector("th");
  const row = plain.querySelector("thead > tr");
  if (cell === null || row === null) throw new Error("표 머리를 찾지 못했습니다");
  const th = getComputedStyle(cell);
  expect(composite(th.backgroundColor)).toEqual(composite(token("--louis-color-table-header-surface")));
  expect(getComputedStyle(row).boxShadow).toContain("inset");
  expect(getComputedStyle(plain).tableLayout).toBe("fixed");
});

test("좁은 화면(≤719) — 시트가 화면이 되고 글자가 한 단씩 내려가며 4열만 2열로 남는다", async () => {
  await page.viewport(390, 844);
  const columns = (name: string): number =>
    getComputedStyle(probe(name)).gridTemplateColumns.split(" ").length;
  expect(columns("grid-3")).toBe(1);
  expect(columns("grid-2")).toBe(1);
  expect(columns("grid-4")).toBe(2);
  const sheet = getComputedStyle(probe("sheet"));
  expect(sheet.borderTopLeftRadius).toBe("0px");
  expect(sheet.boxShadow).toBe("none");
  expect(getComputedStyle(probe("page")).paddingTop).toBe("0px");
  expect(getComputedStyle(probe("title")).fontSize).toBe("28px");
  expect(getComputedStyle(document.querySelector(".louis-document__lead")!).fontSize).toBe("16px");
  expect(getComputedStyle(probe("section-title")).fontSize).toBe("20px");
  expect(getComputedStyle(probe("stat-value")).fontSize).toBe("28px");
  expect(getComputedStyle(probe("column")).paddingLeft).toBe("20px");
  // 카드 여백은 승인본 그대로 셋으로 갈린다 — 나열된 박스 20, 넓은 카드(기간 요약) 위아래 24 ·
  // 좌우 20, 콜아웃 24. 카드 안의 수치는 0 을 지킨다.
  for (const name of ["card", "stat", "decision-item", "rail"]) {
    expect(getComputedStyle(probe(name)).paddingTop, name).toBe("20px");
    expect(getComputedStyle(probe(name)).paddingLeft, name).toBe("20px");
  }
  const split = getComputedStyle(probe("split"));
  expect(split.paddingTop).toBe("24px");
  expect(split.paddingBottom).toBe("24px");
  expect(split.paddingLeft).toBe("20px");
  expect(split.paddingRight).toBe("20px");
  expect(getComputedStyle(probe("note")).paddingTop).toBe("24px");
  expect(getComputedStyle(probe("note")).paddingLeft).toBe("24px");
  expect(getComputedStyle(probe("nested-stat")).paddingTop).toBe("0px");
  // 글자 시작선 — 기간 요약 안의 글자가 위 카드의 글자와 같은 x 에서 시작한다.
  const cardTextStart =
    probe("card").getBoundingClientRect().left + Number.parseFloat(getComputedStyle(probe("card")).paddingLeft);
  expect(probe("nested-stat").getBoundingClientRect().left).toBeCloseTo(cardTextStart, 1);
  expect(split.gridTemplateColumns.split(" ").length).toBe(1);
  expect(getComputedStyle(probe("ruled-head")).fontSize).toBe("12px");
  // 가로 스크롤이 생기지 않는다.
  expect(document.documentElement.scrollWidth).toBeLessThanOrEqual(390);
});

// WebKit/VoiceOver 는 `list-style: none` 인 목록의 롤을 벗긴다(step-tile.md Accessibility 와 같은 결함).
// 이 레시피는 목록 표식을 전부 지우므로, 목록 롤은 마크업의 `role="list"` 가 지킨다. 번호 표식이
// `aria-hidden` 인 것도 이 롤이 순서를 말한다는 전제 위에 있다.
test('목록 롤 — 표식을 지운 목록은 role="list" 를 달고, 예시도 그렇다', async () => {
  const lists = [...host.querySelectorAll<HTMLElement>("ol, ul")];
  const recipeClasses = new Set<string>();
  for (const list of lists) {
    expect(getComputedStyle(list).listStyleType, list.className).toBe("none");
    expect(list.getAttribute("role"), list.className).toBe("list");
    recipeClasses.add(list.classList[0] ?? "");
  }
  // 결정 · 흐름 · 격자 · 막대 · 타임라인 — 레시피의 목록 다섯이 모두 탐침에 있다.
  expect([...recipeClasses].sort()).toEqual([
    "louis-document-bars",
    "louis-document-decision__list",
    "louis-document-flow",
    "louis-document-grid",
    "louis-document-timeline",
  ]);
  // 소비자가 베끼는 예시의 목록도 전부 이 다섯 가운데 하나이고 role="list" 를 단다 — 승인본(document.html)과 부품을 전부 쓰는
  // 운영 보고(document-report.html) 둘 다.
  // `new URL` 의 경로는 글자 그대로 적는다 — Vite 는 글자 그대로의 `new URL("…", import.meta.url)` 만 옮겨 적고, 변수로 넘기면 풀리지 않는다.
  const examples = [
    new URL("../examples/document.html", import.meta.url),
    new URL("../examples/document-report.html", import.meta.url),
  ];
  for (const url of examples) {
    const file = url.pathname.split("/").pop();
    const response = await fetch(url);
    expect(response.ok, file).toBe(true);
    const example = new DOMParser().parseFromString(await response.text(), "text/html");
    const exampleLists = [...example.querySelectorAll(".louis-document ol, .louis-document ul")];
    expect(exampleLists.length, file).toBeGreaterThan(0);
    for (const list of exampleLists) {
      expect(recipeClasses.has(list.classList[0] ?? ""), `${file} ${list.className}`).toBe(true);
      expect(list.getAttribute("role"), `${file} ${list.className}`).toBe("list");
    }
  }
});
