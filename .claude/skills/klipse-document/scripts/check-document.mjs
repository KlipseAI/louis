#!/usr/bin/env node
// LOUIS 문서 검사 — design/patterns/document.md 의 규칙 중 기계로 잴 수 있는 것을 잰다.
//   node .claude/skills/klipse-document/scripts/check-document.mjs <문서 폴더 또는 html> [--no-render] [--shots <캡처 폴더>]
// 실브라우저(chromium)에서 연다. 구조 · 접근성 · 문장 · 한도를 DOM 으로 재고, 1440 · 390 · 다크 1440 세 판을 떠
// <문서 폴더>/check/ 에 캡처를 남긴다 — 통과해도 캡처를 눈으로 본다(가로 넘침 · 그림 · 제목 줄 수만 기계가 잰다).
// ✗ 는 오류(종료 코드 1), ! 는 사람이 판단할 경고다.
import { existsSync, mkdirSync, readFileSync, statSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { chromium } from "playwright";

const here = dirname(fileURLToPath(import.meta.url));
const repo = resolve(here, "../../../..");
const args = process.argv.slice(2);
const render = !args.includes("--no-render");
const shotsIndex = args.indexOf("--shots");
const shotsArg = shotsIndex >= 0 ? args.splice(shotsIndex, 2)[1] : null;
const target = args.find((arg) => !arg.startsWith("--"));
if (!target) {
  console.error("사용법: check-document.mjs <문서 폴더 또는 html> [--no-render]");
  process.exit(1);
}
const file = statSync(resolve(target)).isDirectory() ? join(resolve(target), "index.html") : resolve(target);
if (!existsSync(file)) {
  console.error(`없다: ${file}`);
  process.exit(1);
}
const docDir = dirname(file);

// LOUIS 가 정의한 클래스 — 생성 CSS 에 없는 클래스는 지어낸 것이다.
const cssText = readFileSync(join(repo, "packages/css/generated/styles.css"), "utf8");
const known = new Set(cssText.match(/\.louis-[a-z0-9_-]+/g)?.map((name) => name.slice(1)) ?? []);

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page.goto(pathToFileURL(file).href + "?theme=light");
await page.evaluate(() => document.fonts.ready);

const findings = await page.evaluate((knownList) => {
  const known = new Set(knownList);
  const errors = [];
  const warnings = [];
  const text = (node) => (node?.textContent ?? "").replace(/\s+/g, " ").trim();
  const where = (node) => {
    const section = node.closest(".louis-document-section, .louis-document-decision, .louis-document__head, .louis-document-sources");
    const title = section?.querySelector("h1, h2, .louis-document-section__title");
    return title ? `「${text(title).slice(0, 30)}」` : "문서";
  };
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

  // ── 채울 자리 ──
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  const fills = [];
  for (let node = walker.nextNode(); node; node = walker.nextNode()) {
    if (node.textContent.includes("〔채울 자리")) fills.push(`${where(node.parentElement)} ${text(node.parentElement).slice(0, 60)}`);
  }
  for (const element of $$("[aria-label]")) if (element.getAttribute("aria-label").includes("〔채울 자리")) fills.push(`${where(element)} aria-label`);
  if (fills.length) errors.push(["채울 자리가 남았다", fills]);

  // ── 구조 ──
  const column = document.querySelector(".louis-document > .louis-document__sheet > .louis-document__column");
  if (!column) errors.push(["뼈대가 아니다", [".louis-document > .louis-document__sheet > .louis-document__column 가 없다"]]);
  const h1 = $$("h1");
  if (h1.length !== 1 || !h1[0].classList.contains("louis-document__title")) errors.push(["문서 제목(h1.louis-document__title)은 하나다", [`h1 ${h1.length}개`]]);
  const blocks = column ? [...column.children] : [];
  if (blocks[0] && !blocks[0].matches("header.louis-document__head")) errors.push(["머리가 맨 앞이다", [blocks[0].className]]);
  const decision = document.querySelector(".louis-document-decision");
  if (!decision) warnings.push(["결정 요청이 없다 — 리드가 결론을 말하는지 본다(결론이 먼저다)", []]);
  else if (blocks[1] !== decision) errors.push(["결정 요청은 머리 바로 아래다", [`지금 ${blocks.indexOf(decision) + 1}번째`]]);
  const sections = $$(".louis-document-section");
  const toc = document.querySelector("nav.louis-document-toc");
  if (sections.length > 5 && !toc) warnings.push(["절이 다섯을 넘는다 — 목차(nav.louis-document-toc)를 둘 자리다", [`절 ${sections.length}개`]]);
  if (sections.length <= 5 && toc) errors.push(["목차는 절이 다섯을 넘는 문서만 둔다", [`절 ${sections.length}개`]]);
  if (toc) {
    const ids = new Set(sections.map((section) => section.getAttribute("aria-labelledby")));
    const bad = $$("a", toc).filter((link) => !ids.has(link.getAttribute("href")?.slice(1))).map((link) => link.getAttribute("href"));
    if (bad.length) errors.push(["목차 링크가 절 앵커를 가리킨다", bad]);
  }
  const sectionProblems = [];
  for (const section of sections) {
    const id = section.getAttribute("aria-labelledby");
    const title = id && document.getElementById(id);
    if (!title || !section.contains(title) || title.tagName !== "H2") sectionProblems.push(`${where(section)} aria-labelledby → 절 안의 h2`);
    if (!section.querySelector(".louis-document-section__kicker")) sectionProblems.push(`${where(section)} 키커가 없다`);
    const callouts = $$(".louis-document-callout", section).length;
    const quotes = $$(".louis-document-quote", section).length;
    if (callouts > 1) sectionProblems.push(`${where(section)} 콜아웃 ${callouts} — 절마다 하나까지`);
    if (quotes > 1) sectionProblems.push(`${where(section)} 인용 ${quotes} — 절마다 하나까지`);
  }
  if (sectionProblems.length) errors.push(["절", sectionProblems]);

  // ── 한도(부품 선택표) ──
  const limits = [
    [".louis-document-flow", ".louis-document-flow__step", 5, "흐름 칩"],
    [".louis-document-timeline", ".louis-document-timeline__item", 4, "타임라인 항목 — 넘으면 절을 나눈다"],
    [".louis-document-pins", ":scope > li", 4, "캡처 위 핀"],
    [".louis-document-stack", ".louis-document-stack__part", 3, "누적 막대 조각"],
  ];
  const over = [];
  for (const [root, item, max, name] of limits) {
    for (const element of $$(root)) {
      const count = element.querySelectorAll(item).length;
      if (count > max) over.push(`${where(element)} ${name} ${count} (한도 ${max})`);
    }
  }
  if (over.length) errors.push(["한도를 넘었다", over]);

  // ── 마크업 규칙 ──
  const markup = [];
  // 내보내기(export-document)가 인라인한 LOUIS CSS 는 data-from 을 단다 — 그것은 쓴 스타일이 아니다.
  const ownStyles = $$("style:not([data-from])").length;
  if (ownStyles) markup.push(`<style> ${ownStyles}개 — 모양은 LOUIS 클래스가 낸다`);
  for (const element of $$("[style]")) {
    const declarations = element.getAttribute("style").split(";").map((part) => part.trim()).filter(Boolean);
    const foreign = declarations.filter((part) => !part.startsWith("--louis-document-"));
    if (foreign.length) markup.push(`${where(element)} 인라인 스타일 「${foreign.join("; ").slice(0, 60)}」 — 허용은 --louis-document-* 변수(막대 길이 · 핀 · 추이 좌표)뿐`);
  }
  const invented = new Set();
  for (const element of $$("[class]")) for (const name of element.classList) if (name.startsWith("louis-") && !known.has(name)) invented.add(name);
  if (invented.size) markup.push(`LOUIS 에 없는 클래스: ${[...invented].join(", ")}`);
  for (const title of $$("h1, h2, .louis-document-card__title, .louis-document-callout__title")) {
    if (title.querySelector("br")) markup.push(`${where(title)} 제목 안의 <br> — 두 줄이 좋으면 .louis-document__title-line 으로 구를 감싼다`);
  }
  if ($$('[data-accent="rail"]').length) markup.push("카드 레일(data-accent=\"rail\")은 걷어낸 변형이다");
  const lists = $$("ol[class*='louis-document'], ul[class*='louis-document']").filter((list) => list.getAttribute("role") !== "list");
  if (lists.length) markup.push(`role="list" 없는 목록: ${lists.map((list) => list.className.split(" ")[0]).join(", ")}`);
  if (markup.length) errors.push(["마크업", markup]);

  // ── 접근성 ──
  const a11y = [];
  for (const img of $$("img")) {
    if (!img.hasAttribute("alt")) a11y.push(`${where(img)} img 에 alt 가 없다`);
    else if (!img.getAttribute("alt").trim() && img.classList.contains("louis-document-media")) a11y.push(`${where(img)} 캡처의 대체 텍스트가 비었다 — 보이는 것과 짚는 점을 한두 문장`);
    if (!img.hasAttribute("width") || !img.hasAttribute("height")) a11y.push(`${where(img)} img 에 width · height 가 없다`);
  }
  for (const table of $$("table")) {
    if (!table.querySelector("caption")) a11y.push(`${where(table)} 표에 caption 이 없다(숨기려면 .louis-visually-hidden)`);
    const loose = $$("th", table).filter((cell) => !cell.hasAttribute("scope")).length;
    if (loose) a11y.push(`${where(table)} scope 없는 th ${loose}개`);
    if (!table.classList.contains("louis-table")) a11y.push(`${where(table)} 표는 LOUIS 기본 표(.louis-table)다`);
    if (!table.closest(".louis-document-table")) a11y.push(`${where(table)} 표를 .louis-document-table 로 감싼다`);
  }
  for (const link of $$(".louis-document-footnote a")) {
    const id = link.getAttribute("href")?.slice(1);
    if (!id || !document.getElementById(id)) a11y.push(`각주 ${text(link)} → 없는 출처 #${id}`);
  }
  for (const back of $$(".louis-document-sources__back")) {
    const id = back.getAttribute("href")?.slice(1);
    if (!id || !document.getElementById(id)) a11y.push(`출처의 「본문으로」 → 없는 자리 #${id}`);
  }
  if (a11y.length) errors.push(["접근성", a11y]);
  if ($$("button, input, select, textarea").length) warnings.push(["문서 안에 버튼 · 입력이 있다 — 필요해지면 문서가 아니라 화면이다", []]);

  // ── 문장(deck-kit docs/WRITING.md · document.md Content) ──
  const titled = $$("h1, h2, .louis-document-card__title, .louis-document-decision__label, .louis-document-callout__title, .louis-document-timeline__title");
  const counting = titled.filter((node) => /(^|\s)(한|두|세|네|다섯|여섯|일곱|여덟|아홉|열) ?(가지|개|종|단계|군데)/.test(text(node)));
  if (counting.length) errors.push(["세는 제목 — 항목 수는 화면이 보여 준다", counting.map((node) => text(node))]);
  const soothing = $$(".louis-document__column *").filter((node) => node.children.length === 0 && /(면 됩니다|뿐입니다|면 된다|뿐이다)[^가-힣A-Za-z0-9]*$/.test(text(node)));
  if (soothing.length) errors.push(["안심 어미(~면 된다 · ~뿐이다) — 사실만 적는다", soothing.map((node) => text(node).slice(-40))]);
  const contrast = titled.filter((node) => /아니라/.test(text(node)));
  if (contrast.length) warnings.push(["「A가 아니라 B」 대구 — 나쁜 예 · 좋은 예를 나란히 두는 자리가 아니면 B 만 쓴다", contrast.map((node) => text(node))]);
  const labels = $$(".louis-document-section__kicker, .louis-document-stat__label, .louis-document-flow__label, .louis-document-compare__label, .louis-document-toc__kicker");
  const upper = labels.filter((node) => /[A-Z]/.test(text(node)) && text(node) === text(node).toUpperCase() && text(node).replace(/[^A-Za-z]/g, "").length >= 3);
  if (upper.length) errors.push(["대문자 라벨 · 키커", upper.map((node) => text(node))]);
  const dotted = labels.filter((node) => text(node).includes("·"));
  if (dotted.length) warnings.push(["라벨 안의 가운뎃점 구분자 — 구분은 간격이 한다", dotted.map((node) => text(node))]);
  const emoji = $$(".louis-document__column *").filter((node) => node.children.length === 0 && /\p{Extended_Pictographic}/u.test(node.textContent));
  if (emoji.length) errors.push(["이모지로 뜻을 전하지 않는다", emoji.map((node) => text(node).slice(0, 40))]);
  const spaced = $$(".louis-document__column *").filter((node) => node.children.length === 0 && node.tagName !== "CODE"
    && /\d\s+(회|원|명|건|장|개|초|분|시간|일|주|개월|년|%)(?=[\s,.)]|$)/.test(node.textContent));
  if (spaced.length) warnings.push(["숫자와 단위는 붙여 쓴다(514회)", spaced.map((node) => text(node).slice(0, 50))]);
  const endings = new Map();
  for (const title of $$(".louis-document-section__title")) {
    const last = text(title).split(" ").at(-1);
    endings.set(last, [...(endings.get(last) ?? []), text(title)]);
  }
  const repeated = [...endings].filter(([, list]) => list.length >= 3);
  if (repeated.length) warnings.push(["절 제목이 같은 말로 셋 이상 끝난다 — 문형을 흩는다", repeated.map(([last, list]) => `「${last}」 × ${list.length}`)]);

  return { errors, warnings, sections: sections.length };
}, [...known]);

// ── 렌더(세 판) ──
const rendered = [];
if (render) {
  const shots = shotsArg ? resolve(shotsArg) : join(docDir, "check");
  mkdirSync(shots, { recursive: true });
  const views = [
    ["desktop", 1440, 900, "light"],
    ["mobile", 390, 844, "light"],
    ["dark", 1440, 900, "dark"],
  ];
  for (const [name, width, height, theme] of views) {
    await page.setViewportSize({ width, height });
    await page.goto(pathToFileURL(file).href + `?theme=${theme}`);
    await page.evaluate(() => document.fonts.ready);
    await page.waitForLoadState("networkidle").catch(() => {});
    const measure = await page.evaluate(() => {
      const root = document.documentElement;
      const overflow = root.scrollWidth - root.clientWidth;
      const images = [...document.images].filter((img) => !img.complete || img.naturalWidth === 0).map((img) => img.getAttribute("src").slice(0, 60));
      const lines = (node) => Math.round(node.getBoundingClientRect().height / parseFloat(getComputedStyle(node).lineHeight));
      const tall = [...document.querySelectorAll("h1, .louis-document-section__title")].filter((node) => lines(node) > 3).map((node) => `${node.textContent.trim().slice(0, 30)} (${lines(node)}줄)`);
      return { overflow, images, tall, height: root.scrollHeight };
    });
    await page.screenshot({ path: join(shots, `${name}.png`), fullPage: true });
    rendered.push([name, width, measure]);
    if (measure.overflow > 1) findings.errors.push([`${name} ${width} 가로 넘침`, [`${measure.overflow}px`]]);
    if (measure.images.length) findings.errors.push([`${name} 불러오지 못한 그림`, measure.images]);
    if (measure.tall.length) findings.warnings.push([`${name} 세 줄을 넘는 제목 — 글자를 줄이지 말고 문장을 줄인다`, measure.tall]);
  }
}
await browser.close();

const rel = relative(process.cwd(), file);
console.log(`[document-check] ${rel} — 절 ${findings.sections}`);
for (const [title, items] of findings.errors) {
  console.log(`✗ ${title}`);
  for (const item of items) console.log(`    ${item}`);
}
for (const [title, items] of findings.warnings) {
  console.log(`! ${title}`);
  for (const item of items) console.log(`    ${item}`);
}
for (const [name, width, measure] of rendered) console.log(`  캡처 ${name} ${width} · 높이 ${measure.height} → ${relative(process.cwd(), join(shotsArg ? resolve(shotsArg) : join(docDir, "check"), `${name}.png`))}`);
if (findings.errors.length) {
  console.log(`오류 ${findings.errors.length} · 경고 ${findings.warnings.length} — 규칙은 design/patterns/document.md`);
  process.exit(1);
}
console.log(`통과 · 경고 ${findings.warnings.length}. 캡처 세 판을 눈으로 본다.`);
