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
    <figure class="louis-document-card" data-probe="trend-card">
      <figcaption class="louis-document-card__head"><span class="louis-document-card__title">추이</span></figcaption>
      <div class="louis-document-trend" data-probe="trend">
        <div class="louis-document-trend__plot" data-probe="trend-plot">
          <svg class="louis-document-trend__canvas" data-probe="trend-canvas" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true" focusable="false"><polyline class="louis-document-trend__path" data-probe="trend-path" points="0,20 40,60 70,40 100,100"/></svg>
          <ol class="louis-document-trend__points" role="list" aria-label="월별 방문">
            <li class="louis-document-trend__point" data-probe="trend-first" style="--louis-document-trend-x: 0%; --louis-document-trend-y: 20%"><span class="louis-document-trend__when">1월</span> <span class="louis-document-trend__value">20</span></li>
            <li class="louis-document-trend__point" data-probe="trend-hidden" style="--louis-document-trend-x: 40%; --louis-document-trend-y: 60%"><span class="louis-document-trend__when">2월</span> <span class="louis-document-trend__value">60</span></li>
            <li class="louis-document-trend__point" data-probe="trend-marked" data-label style="--louis-document-trend-x: 70%; --louis-document-trend-y: 40%"><span class="louis-document-trend__when">3월</span> <span class="louis-document-trend__value">40</span></li>
            <li class="louis-document-trend__point" data-probe="trend-last" style="--louis-document-trend-x: 100%; --louis-document-trend-y: 100%"><span class="louis-document-trend__when">4월</span> <span class="louis-document-trend__value">100</span></li>
          </ol>
        </div>
      </div>
    </figure>
    <figure class="louis-document-card" data-probe="media-card">
      <img class="louis-document-media" data-probe="media" width="160" height="100" alt="보기" src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='100'/%3E">
      <figcaption class="louis-document-card__description">캡션</figcaption>
    </figure>
    <figure class="louis-document-card">
      <figcaption class="louis-document-card__head"><span class="louis-document-card__title">나란히</span></figcaption>
      <div class="louis-document-compare" data-probe="compare">
        <div class="louis-document-compare__item"><p class="louis-document-compare__label" data-probe="compare-label">제품</p><img class="louis-document-media" data-probe="compare-media" width="100" height="200" alt="제품" src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='200'/%3E"></div>
        <div class="louis-document-compare__item"><p class="louis-document-compare__label">보드</p><img class="louis-document-media" width="100" height="200" alt="보드" src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='200'/%3E"></div>
      </div>
    </figure>
    <nav class="louis-document-toc" aria-label="목차" data-probe="toc">
      <p class="louis-document-toc__title">목차</p>
      <ol class="louis-document-toc__list" role="list" data-probe="toc-list">
        <li><a class="louis-document-toc__link" href="#t-a" data-probe="toc-link"><span class="louis-document-toc__kicker" data-probe="toc-kicker">01</span><span class="louis-document-toc__label">첫 절</span></a></li>
        <li><a class="louis-document-toc__link" href="#t-b"><span class="louis-document-toc__kicker">02</span><span class="louis-document-toc__label">둘째 절</span></a></li>
      </ol>
    </nav>
    <figure class="louis-document-card">
      <ol class="louis-document-stack" role="list" data-probe="stack">
        <li class="louis-document-stack__part" data-lead data-probe="stack-lead" style="--louis-document-stack-value: 60%"><span class="louis-document-stack__label">앞</span> <span class="louis-document-stack__value" data-probe="stack-value">60%</span></li>
        <li class="louis-document-stack__part" data-probe="stack-rest" style="--louis-document-stack-value: 30%"><span class="louis-document-stack__label">뒤</span> <span class="louis-document-stack__value">30%</span></li>
        <li class="louis-document-stack__part" data-tone="faint" data-probe="stack-faint" style="--louis-document-stack-value: 10%"><span class="louis-document-stack__label">끝</span> <span class="louis-document-stack__value">10%</span></li>
      </ol>
    </figure>
    <p class="louis-document-prose" data-probe="code-prose">명령은 <code data-probe="code-inline">--check</code> 로 돈다.<sup class="louis-document-footnote" data-probe="footnote"><a href="#t-fn-1" id="t-fnref-1">1</a></sup></p>
    <pre class="louis-document-codeblock" data-probe="codeblock"><code>node scripts/figma-screens-live-check.mjs --check live-246-3448.json live-246-3449.json live-246-3450.json --allow-partial</code></pre>
    <figure class="louis-document-quote" data-probe="quote">
      <blockquote class="louis-document-quote__text" data-probe="quote-text"><p>「옮긴 말」</p></blockquote>
      <figcaption class="louis-document-quote__cite" data-probe="quote-cite">소유자, 9월 29일</figcaption>
    </figure>
    <figure class="louis-document-card">
      <div class="louis-document-shot" data-probe="shot">
        <img class="louis-document-media" width="160" height="100" alt="보기" src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='100'/%3E">
        <span class="louis-document-pin" aria-hidden="true" data-probe="pin" style="--louis-document-pin-x: 25%; --louis-document-pin-y: 50%">1</span>
      </div>
      <ol class="louis-document-pins" role="list" data-probe="pins"><li class="louis-document-pins__item"><span class="louis-document-pin" aria-hidden="true">1</span><span>짚은 자리</span></li></ol>
    </figure>
    <div class="louis-document-table">
      <table class="louis-table" data-probe="table">
        <caption class="louis-visually-hidden">소재별 성과</caption>
        <thead><tr><th scope="col" data-probe="table-head">지표</th><th scope="col" data-align="end">A</th><th scope="col" data-align="end">합계</th></tr></thead>
        <tbody>
          <tr><th scope="row" data-probe="row-head">방문</th><td data-align="end" data-emphasis="lead" data-probe="lead-cell">265</td><td data-align="end" data-emphasis="total" data-probe="total-cell">514</td></tr>
          <tr><th scope="row">비용</th><td data-align="end" data-probe="plain-cell">₩207</td><td data-align="end"><strong data-probe="cell-strong">₩215</strong> <span class="louis-document-verdict" data-tone="neutral" data-probe="verdict-neutral">상태</span></td></tr>
          <tr><th scope="row">클릭</th><td data-align="end" data-probe="last-cell">279</td><td data-align="end">551</td></tr>
        </tbody>
      </table>
    </div>
  </section>
  <section class="louis-document-sources" aria-labelledby="t-sources">
    <h2 class="louis-document-sources__title" id="t-sources">출처</h2>
    <ol class="louis-document-sources__list" role="list" data-probe="sources-list">
      <li class="louis-document-sources__item" id="t-fn-1"><span class="louis-document-sources__number" data-probe="sources-number">1</span><span>원장 <code data-probe="code-small">migration/figma-board-composition.json</code></span></li>
    </ol>
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

// 시트 안에서 헤어라인을 갖는 것은 LOUIS 기본 표의 머리 행 하나다(표는 앱과 같은 부품이다 — 2026-09-29).
test("시트가 헤어라인 한 겹으로 바닥 위에 선다", () => {
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
  for (const name of ["decision-item", "card", "stat", "rail", "split", "note", "caution", "flow-label", "verdict", "marker", "quote", "codeblock"]) {
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

test("박스의 반경은 하나다 — 카드 · 수치 · 콜아웃이 card, 작은 표식은 pill", () => {
  expect(getComputedStyle(probe("card")).borderRadius).toBe(token("--louis-radius-card"));
  expect(getComputedStyle(probe("stat")).borderRadius).toBe(token("--louis-radius-card"));
  expect(getComputedStyle(probe("note")).borderRadius).toBe(token("--louis-radius-card"));
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
  // 감기는 제목은 줄 길이를 고르게 나누고, 두 줄 제목의 줄은 블록이다(구 경계에서 끊는다).
  const wrapOf = (style: CSSStyleDeclaration) => (style as unknown as { textWrapStyle?: string }).textWrapStyle ?? style.getPropertyValue("text-wrap");
  expect(wrapOf(title)).toContain("balance");
  expect(wrapOf(getComputedStyle(probe("section-title")))).toContain("balance");
  const line = document.createElement("span");
  line.className = "louis-document__title-line";
  probe("title").append(line);
  expect(getComputedStyle(line).display).toBe("block");
  line.remove();
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

// 추이 — 좌표는 소비처가 두 곳(점의 --louis-document-trend-x/y · polyline points)에 같은 숫자로 적는다(document.md Known deviations 8).
test("추이 — 선은 aria-hidden 인 2 두께 강조색이고, 점이 선의 꼭짓점에 선다", () => {
  const canvas = probe("trend-canvas");
  expect(canvas.getAttribute("aria-hidden")).toBe("true");
  const path = probe("trend-path") as unknown as SVGPolylineElement;
  const line = getComputedStyle(path);
  expect(line.strokeWidth).toBe("2px");
  expect(line.vectorEffect).toBe("non-scaling-stroke");
  expect(line.fill).toBe("none");
  expect(composite(line.stroke)).toEqual(composite(token("--louis-color-accent-primary")));
  const plot = probe("trend-plot");
  expect(plot.getBoundingClientRect().height).toBe(160);
  expect(getComputedStyle(plot).boxShadow).toContain("inset");
  // 선이 실제로 그려진 화면 좌표(뒤집기 포함)와 점 표식의 중심이 같다.
  const matrix = path.getScreenCTM();
  if (matrix === null) throw new Error("선의 화면 좌표를 얻지 못했습니다");
  const vertices = [...path.points].map((point) => {
    const drawn = new DOMPoint(point.x, point.y).matrixTransform(matrix);
    return [drawn.x, drawn.y] as const;
  });
  const box = plot.getBoundingClientRect();
  for (const name of ["trend-first", "trend-hidden", "trend-marked", "trend-last"]) {
    const point = probe(name);
    const style = getComputedStyle(point);
    const x = box.left + (box.width * Number.parseFloat(style.getPropertyValue("--louis-document-trend-x"))) / 100;
    const y = box.bottom - (box.height * Number.parseFloat(style.getPropertyValue("--louis-document-trend-y"))) / 100;
    const hit = vertices.some(([vx, vy]) => Math.abs(vx - x) <= 0.5 && Math.abs(vy - y) <= 0.5);
    expect(hit, `${name} 이 선의 꼭짓점에 없다`).toBe(true);
    const dot = getComputedStyle(point, "::before");
    expect(dot.width, name).toBe("8px");
    expect(composite(dot.backgroundColor), name).toEqual(composite(token("--louis-color-accent-primary")));
  }
});

test("추이 — 라벨은 처음 · 끝 · data-label 점만 보이고, 처음은 시작선 · 끝은 끝선에 맞는다", () => {
  const plot = probe("trend-plot").getBoundingClientRect();
  const part = (name: string, kind: "value" | "when"): HTMLElement => {
    const element = probe(name).querySelector<HTMLElement>(`.louis-document-trend__${kind}`);
    if (element === null) throw new Error(`${name} 의 ${kind} 가 없다`);
    return element;
  };
  for (const name of ["trend-first", "trend-marked", "trend-last"]) {
    expect(getComputedStyle(part(name, "value")).clipPath, name).toBe("none");
    expect(getComputedStyle(part(name, "when")).clipPath, name).toBe("none");
  }
  // 가운데 점의 라벨은 화면에서만 숨는다 — 글은 남는다.
  const hidden = part("trend-hidden", "value");
  expect(getComputedStyle(hidden).clipPath).toBe("inset(50%)");
  expect(hidden.getBoundingClientRect().width).toBeLessThanOrEqual(1);
  expect(probe("trend-hidden").textContent?.replace(/\s+/g, " ").trim()).toBe("2월 60");
  // 처음 · 끝 라벨이 좌표 상자 밖으로 나가지 않는다.
  expect(part("trend-first", "when").getBoundingClientRect().left).toBeCloseTo(plot.left, 0);
  expect(part("trend-first", "value").getBoundingClientRect().left).toBeCloseTo(plot.left, 0);
  expect(part("trend-last", "when").getBoundingClientRect().right).toBeCloseTo(plot.right, 0);
  expect(part("trend-last", "value").getBoundingClientRect().right).toBeCloseTo(plot.right, 0);
  // 값은 점 위에, 시점은 바닥 선 아래에 선다(사이 8).
  const marked = probe("trend-marked");
  const markedY = plot.bottom - (plot.height * Number.parseFloat(getComputedStyle(marked).getPropertyValue("--louis-document-trend-y"))) / 100;
  expect(part("trend-marked", "value").getBoundingClientRect().bottom).toBeCloseTo(markedY - 8, 0);
  expect(part("trend-marked", "when").getBoundingClientRect().top).toBeCloseTo(plot.bottom + 8, 0);
  // 맨 위 점의 값 라벨이 추이 상자 안에 든다 — 위 여백이 라벨 한 줄 + 8 이다.
  const trend = probe("trend").getBoundingClientRect();
  expect(part("trend-last", "value").getBoundingClientRect().top).toBeGreaterThanOrEqual(trend.top - 0.5);
  expect(part("trend-first", "when").getBoundingClientRect().bottom).toBeLessThanOrEqual(trend.bottom + 0.5);
});

test("캡처 — 카드 폭을 채우고 비율을 지키며, 캡처를 실은 카드는 면이 한 단 짙다", () => {
  const media = probe("media");
  const card = probe("media-card");
  const cardStyle = getComputedStyle(card);
  const inner = card.getBoundingClientRect().width - Number.parseFloat(cardStyle.paddingLeft) - Number.parseFloat(cardStyle.paddingRight);
  const box = media.getBoundingClientRect();
  expect(box.width).toBeCloseTo(inner, 0);
  expect(box.width / box.height).toBeCloseTo(1.6, 2);
  expect(getComputedStyle(media).borderRadius).toBe(token("--louis-radius-card"));
  expect(getComputedStyle(media).display).toBe("block");
});

for (const theme of THEMES) {
  test(`캡처 카드의 면 — ${theme} 에서 잉크 8% 이고 여느 카드(4%)보다 한 단 짙다`, () => {
    document.documentElement.setAttribute("data-theme", theme);
    const sheet = getComputedStyle(probe("sheet")).backgroundColor;
    const bare = composite(sheet);
    const strong = on(sheet, getComputedStyle(probe("media-card")).backgroundColor);
    // 칩(흐름 라벨)과 같은 면 — `--louis-document-face-strong`(잉크 8%)이다.
    expect(strong).toEqual(on(sheet, getComputedStyle(probe("flow-label")).backgroundColor));
    const plain = on(sheet, getComputedStyle(probe("card")).backgroundColor);
    const shift = (rgb: Rgb): number => Math.abs(luminance(rgb) - luminance(bare));
    expect(shift(strong)).toBeGreaterThan(shift(plain));
  });
}

test("나란히 보기 — 두 열 · 간격 8, 라벨은 14/500 fg-tertiary", () => {
  const compare = getComputedStyle(probe("compare"));
  expect(compare.gridTemplateColumns.split(" ").length).toBe(2);
  expect(compare.columnGap).toBe("8px");
  const label = getComputedStyle(probe("compare-label"));
  expect(label.fontSize).toBe("14px");
  expect(label.fontWeight).toBe("500");
  expect(composite(label.color)).toEqual(composite(token("--louis-color-fg-tertiary")));
  const media = probe("compare-media").getBoundingClientRect();
  expect(media.height / media.width).toBeCloseTo(2, 2);
});

test("목차 — 넓은 화면 두 열, 링크는 14/500 fg-secondary, 키커는 강조색", () => {
  expect(getComputedStyle(probe("toc-list")).gridTemplateColumns.split(" ").length).toBe(2);
  const link = getComputedStyle(probe("toc-link"));
  expect(link.fontSize).toBe("14px");
  expect(link.fontWeight).toBe("500");
  expect(link.textDecorationLine).toBe("none");
  expect(composite(link.color)).toEqual(composite(token("--louis-color-fg-secondary")));
  expect(composite(getComputedStyle(probe("toc-kicker")).color)).toEqual(composite(token("--louis-color-accent-primary")));
});

test("누적 막대 — 조각 폭이 몫이고, 앞선 조각만 강조색 · 나머지 잉크 24% · 12%, 바깥 두 끝만 둥글다", () => {
  const bar = probe("stack").getBoundingClientRect().width;
  for (const [name, share] of [["stack-lead", 0.6], ["stack-rest", 0.3], ["stack-faint", 0.1]] as const) {
    expect(probe(name).getBoundingClientRect().width, name).toBeCloseTo(bar * share, 0);
    expect(getComputedStyle(probe(name), "::before").height, name).toBe("8px");
  }
  const sheet = getComputedStyle(probe("sheet")).backgroundColor;
  const fill = (name: string): Rgb => on(sheet, getComputedStyle(probe(name), "::before").backgroundColor);
  expect(fill("stack-lead")).toEqual(composite(token("--louis-color-accent-primary")));
  const probeFace = document.createElement("div");
  host.append(probeFace);
  const ink = token("--louis-color-fg-primary");
  probeFace.style.background = `color-mix(in srgb, ${ink} 24%, transparent)`;
  expect(fill("stack-rest")).toEqual(on(sheet, getComputedStyle(probeFace).backgroundColor));
  probeFace.style.background = `color-mix(in srgb, ${ink} 12%, transparent)`;
  expect(fill("stack-faint")).toEqual(on(sheet, getComputedStyle(probeFace).backgroundColor));
  probeFace.remove();
  const lead = getComputedStyle(probe("stack-lead"), "::before");
  expect(lead.borderTopLeftRadius).not.toBe("0px");
  expect(lead.borderTopRightRadius).toBe("0px");
  expect(getComputedStyle(probe("stack-faint"), "::before").borderTopRightRadius).not.toBe("0px");
  // 값은 라벨 글이 갖는다 — 막대 칸은 생성 콘텐츠라 글이 없다.
  expect(probe("stack-lead").textContent?.replace(/\s+/g, " ").trim()).toBe("앞 60%");
  expect(getComputedStyle(probe("stack-value")).fontVariantNumeric).toContain("tabular-nums");
});

test("표 칸 안의 상태 알약 — 중립 톤은 칩과 같은 8% 면 · fg-secondary 이고 칸 흐름대로 선다", () => {
  const pill = getComputedStyle(probe("verdict-neutral"));
  const sheet = getComputedStyle(probe("sheet")).backgroundColor;
  expect(on(sheet, pill.backgroundColor)).toEqual(on(sheet, getComputedStyle(probe("flow-label")).backgroundColor));
  expect(composite(pill.color)).toEqual(composite(token("--louis-color-fg-secondary")));
  expect(pill.marginLeft).toBe("0px");
  expect(pill.blockSize ?? pill.height).toBe("24px");
});

test("각주와 출처 — 번호가 줄 높이를 밀지 않고, 출처 목록은 12 글자에 번호가 자릿수대로 선다", () => {
  const sup = getComputedStyle(probe("footnote"));
  expect(sup.lineHeight).toBe("0px");
  expect(sup.verticalAlign).toBe("super");
  expect(composite(getComputedStyle(probe("footnote").querySelector("a") as HTMLElement).color)).toEqual(composite(token("--louis-color-accent-primary")));
  // 번호가 있는 줄과 없는 줄의 높이가 같다(한 줄 문단).
  const prose = probe("code-prose");
  expect(prose.getBoundingClientRect().height).toBe(Number.parseFloat(getComputedStyle(prose).lineHeight));
  const list = getComputedStyle(probe("sources-list"));
  expect(list.fontSize).toBe("12px");
  expect(composite(list.color)).toEqual(composite(token("--louis-color-fg-tertiary")));
  expect(getComputedStyle(probe("sources-number")).fontVariantNumeric).toContain("tabular-nums");
});

test("코드 표기 — 고정폭 · 8% 면 · 한 덩어리로 줄을 넘기고, 둘레보다 한 단 작되 12 아래로 내려가지 않는다", () => {
  const inline = getComputedStyle(probe("code-inline"));
  expect(inline.fontFamily).toContain("monospace");
  expect(inline.display).toBe("inline-block");
  expect(inline.fontSize).toBe("14px");
  const sheet = getComputedStyle(probe("sheet")).backgroundColor;
  expect(on(sheet, inline.backgroundColor)).toEqual(on(sheet, getComputedStyle(probe("flow-label")).backgroundColor));
  expect(getComputedStyle(probe("code-small")).fontSize).toBe("12px");
  const block = probe("codeblock");
  const style = getComputedStyle(block);
  expect(style.whiteSpace).toBe("pre");
  expect(style.overflowX).toBe("auto");
  expect(style.borderRadius).toBe(token("--louis-radius-card"));
  expect(on(sheet, style.backgroundColor)).toEqual(on(sheet, getComputedStyle(probe("card")).backgroundColor));
  // 블록 안의 code 는 면을 겹치지 않는다.
  expect(getComputedStyle(block.querySelector("code") as HTMLElement).backgroundColor).toBe("rgba(0, 0, 0, 0)");
});

test("인용 — 카드 면 한 겹 위 20/500, 색 선이 없고 누가 한 말인지 14 로 적는다", () => {
  const quote = getComputedStyle(probe("quote"));
  const sheet = getComputedStyle(probe("sheet")).backgroundColor;
  expect(on(sheet, quote.backgroundColor)).toEqual(on(sheet, getComputedStyle(probe("card")).backgroundColor));
  expect(quote.borderRadius).toBe(token("--louis-radius-card"));
  expect(getComputedStyle(probe("quote"), "::before").content).toBe("none");
  expect(getComputedStyle(probe("quote-text")).marginLeft).toBe("0px");
  const text = getComputedStyle(probe("quote-text"));
  expect(text.fontSize).toBe("20px");
  expect(text.fontWeight).toBe("500");
  const cite = getComputedStyle(probe("quote-cite"));
  expect(cite.fontSize).toBe("14px");
  expect(composite(cite.color)).toEqual(composite(token("--louis-color-fg-tertiary")));
});

test("캡처 위 번호 핀 — 핀 중심이 캡처 기준 퍼센트 자리에 서고, 강조색 면 위 뒤집히지 않는 잉크다", () => {
  const shot = probe("shot").getBoundingClientRect();
  const pin = probe("pin");
  const box = pin.getBoundingClientRect();
  expect(box.width).toBe(24);
  expect(box.left + box.width / 2).toBeCloseTo(shot.left + shot.width * 0.25, 0);
  expect(box.top + box.height / 2).toBeCloseTo(shot.top + shot.height * 0.5, 0);
  const style = getComputedStyle(pin);
  expect(composite(style.backgroundColor)).toEqual(composite(token("--louis-color-accent-primary")));
  expect(composite(style.color)).toEqual(composite(token("--louis-color-fg-inverse")));
  expect(pin.getAttribute("aria-hidden")).toBe("true");
});

// 문서의 표는 LOUIS 기본 표 그대로다(2026-09-29 소유자 결정 — 문서용 규선 변형을 걷어냈다). 문서는 열 폭 정책만 정한다.
test("표 — 문서 안에서도 LOUIS 기본 표다: 머리 면 · 헤어라인 · 머리 12 · 셀 8", () => {
  const table = probe("table");
  expect(table.dataset.variant).toBeUndefined();
  const head = getComputedStyle(probe("table-head"));
  expect(composite(head.backgroundColor)).toEqual(composite(token("--louis-color-table-header-surface")));
  expect(head.fontSize).toBe("12px");
  expect(head.paddingTop).toBe("4px");
  expect(head.paddingLeft).toBe("8px");
  const headRow = probe("table-head").parentElement;
  if (headRow === null) throw new Error("머리 행을 찾지 못했습니다");
  expect(getComputedStyle(headRow).boxShadow).toContain("inset");
  const cell = getComputedStyle(probe("plain-cell"));
  expect(cell.paddingTop).toBe("8px");
  expect(cell.paddingLeft).toBe("8px");
  expect(cell.fontSize).toBe("14px");
  expect(composite(cell.borderBottomColor)).toEqual(composite(token("--louis-color-table-row-line")));
  expect(composite(cell.color)).toEqual(composite(token("--louis-color-fg-primary")));
  // 마지막 행 아래에는 선이 없다.
  expect(getComputedStyle(probe("last-cell")).borderBottomWidth).toBe("0px");
  // 문서는 소비처로서 열 폭 정책만 정한다 — 내용이 폭을 정한다. 문서 밖의 표는 기본값(fixed)을 지킨다.
  expect(getComputedStyle(table).tableLayout).toBe("auto");
  const plain = document.createElement("table");
  plain.className = "louis-table";
  plain.innerHTML = '<thead><tr><th scope="col">이름</th></tr></thead><tbody><tr><td>가</td></tr></tbody>';
  host.append(plain);
  expect(getComputedStyle(plain).tableLayout).toBe("fixed");
});

test("표 — 행 머리는 몸 칸과 같고 셀 강조 둘이 선다", () => {
  // 행 머리(`th scope="row"`)가 몸 칸 규칙을 받는다 — 브라우저 기본값(굵게 · 가운데)이 새지 않는다.
  const rowHead = getComputedStyle(probe("row-head"));
  const cell = getComputedStyle(probe("plain-cell"));
  expect(rowHead.fontWeight).toBe("400");
  expect(rowHead.textAlign).toBe("start");
  expect(rowHead.paddingLeft).toBe(cell.paddingLeft);
  expect(rowHead.borderBottomWidth).toBe(cell.borderBottomWidth);
  expect(rowHead.color).toBe(cell.color);
  // 셀 강조 — 합계는 잉크 한 단 · semibold, 앞선 값은 초록 · semibold.
  const total = getComputedStyle(probe("total-cell"));
  expect(total.fontWeight).toBe("600");
  expect(composite(total.color)).toEqual(composite(token("--louis-color-fg-primary")));
  const lead = getComputedStyle(probe("lead-cell"));
  expect(lead.fontWeight).toBe("600");
  expect(composite(lead.color)).toEqual(composite(token("--louis-color-alert-success-stroke")));
  expect(lead.textAlign).toBe("end");
  // 정렬 값 둘이 몸 칸(행 머리 포함)에서도 머리 칸과 같다 — 몸 칸의 `text-align: start` 가 정렬 규칙을 이기지 않는다.
  const aligned = document.createElement("table");
  aligned.className = "louis-table";
  aligned.innerHTML =
    '<thead><tr><th scope="col">이름</th><th scope="col" data-align="center">가운데</th><th scope="col" data-align="end">끝</th></tr></thead>' +
    '<tbody><tr><th scope="row" data-align="end">가</th><td data-align="center">1</td><td data-align="end">2</td></tr></tbody>';
  host.append(aligned);
  for (const align of ["center", "end"]) {
    for (const cell of aligned.querySelectorAll<HTMLElement>(`[data-align="${align}"]`)) {
      expect(getComputedStyle(cell).textAlign, `${cell.tagName} ${align}`).toBe(align);
    }
  }
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
  // 표 머리는 좁은 화면에서도 12 다 — 기본 표는 크기 축이 없다.
  expect(getComputedStyle(probe("table-head")).fontSize).toBe("12px");
  // 나란히 보기는 좁은 화면에서도 두 열이다 — 견주는 것이 목적이다.
  expect(columns("compare")).toBe(2);
  // 목차는 한 열, 인용은 20 → 16.
  expect(getComputedStyle(probe("toc-list")).gridTemplateColumns.split(" ").length).toBe(1);
  expect(getComputedStyle(probe("quote-text")).fontSize).toBe("16px");
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
  // 결정 · 흐름 · 격자 · 막대 · 타임라인 · 추이의 점 · 누적 막대 · 목차 · 출처 · 핀 설명 — 레시피의 목록 열이 모두 탐침에 있다.
  expect([...recipeClasses].sort()).toEqual([
    "louis-document-bars",
    "louis-document-decision__list",
    "louis-document-flow",
    "louis-document-grid",
    "louis-document-pins",
    "louis-document-sources__list",
    "louis-document-stack",
    "louis-document-timeline",
    "louis-document-toc__list",
    "louis-document-trend__points",
  ]);
  // 소비자가 베끼는 예시의 목록도 전부 이 열 가운데 하나이고 role="list" 를 단다 — 승인본(document.html)과 부품을 전부 쓰는
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
