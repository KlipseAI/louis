import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { transformSync } from "esbuild";
import { atomicWriteBatch } from "./lib/atomic-output.mjs";
import { BINDING_POLICY, RENDERER_LIB, liveVariables, nestedFixedPaints, sourceQuotes } from "./lib/figma-live-variables.mjs";
import { INSTANCE_TEXT_LIB, topBarTextProperties } from "./lib/figma-top-bar-text.mjs";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const fixture = JSON.parse(readFileSync(resolve(repoRoot, "migration/product.auth-fixture.json"), "utf8"));
const planPath = resolve(repoRoot, "figma/product-upgrade-scene.plan.json");
const drawPath = resolve(repoRoot, "figma/product-upgrade-scene.draw.js");
const templatePath = resolve(repoRoot, "scripts/templates/figma-product-upgrade-scene-renderer.js");
const checkOnly = process.argv.includes("--check");
const productRoot = process.env.KLIPSE_PRODUCT_REPO ?? "/Users/sejunki/klipse-web";
const context = "desktop-1920x1080";
const mobileContext = "mobile-402x874";
const route = "/mypage/upgrade";
const redirectedRoute = "/mypage/upgrade/checkout";
const styles = new Map(fixture.computedStyles.map((entry) => [entry.id, entry.value]));
const fail = (message) => { throw new Error(`[figma-product-upgrade-scene] ${message}`); };
const sourceQuote = (path, line, expected) => {
  // 근거 문자열에는 기계마다 다른 절대경로를 적지 않는다 — 적으면 check 가 KLIPSE_PRODUCT_REPO 철자에 따라 갈린다.
  const command = `git -C "$KLIPSE_PRODUCT_REPO" show ${fixture.productCommit}:${path}`;
  const source = execFileSync("git", ["-C", productRoot, "show", `${fixture.productCommit}:${path}`], {
    encoding: "utf8",
    maxBuffer: 16 * 1024 * 1024,
  });
  const quote = source.split("\n")[line - 1] ?? "";
  if (quote !== expected) fail(`source quote drift ${path}:${line}: ${JSON.stringify(quote)}`);
  return { command, path, line, quote };
};
const screen = fixture.screens[context]?.[route] ?? fail(`missing ${context} ${route}`);
const redirected = fixture.screens[context]?.[redirectedRoute] ?? fail(`missing ${context} ${redirectedRoute}`);
const mobileScreen = fixture.screens[mobileContext]?.[route] ?? fail(`missing ${mobileContext} ${route}`);
const mobileRedirected = fixture.screens[mobileContext]?.[redirectedRoute] ?? fail(`missing ${mobileContext} ${redirectedRoute}`);
const node = (path) => screen.tree.find((entry) => entry.path === path) ?? fail(`missing node ${path}`);
const mobileNode = (path) => mobileScreen.tree.find((entry) => entry.path === path) ?? fail(`missing mobile node ${path}`);
const style = (entry) => styles.get(entry.styleRef) ?? fail(`missing style ${entry.styleRef}`);
const px = (value) => Number(/^(-?[\d.]+)px$/.exec(value ?? "")?.[1] ?? 0);
// 색 두 표기를 다 읽는다. 제품이 색 램프를 LOUIS 정본(`--louis-color-*`)에서 받게 되면서
// 토큰 값이 `color(srgb r g b / a)` 로 선언됐고, Chromium 은 그 계산값을 legacy `rgb()` 로
// 되돌리지 않고 같은 `color(srgb …)` 로 직렬화한다. 0–255 정수 대신 0–1 실수라는 것만 다르다.
// 표기를 못 읽는 것은 도구 결함이지 제품 변화가 아니므로, 값은 손대지 않고 파서만 넓힌다.
const COLOR_PATTERN = /^(?:rgba?\(\s*([\d.]+)[,\s]+([\d.]+)[,\s]+([\d.]+)(?:[,/\s]+([\d.]+))?\s*\)|color\(\s*srgb\s+([\d.]+)\s+([\d.]+)\s+([\d.]+)(?:\s*\/\s*([\d.]+))?\s*\))$/;
const color = (value) => {
  const match = COLOR_PATTERN.exec(value ?? "");
  if (!match) fail(`unsupported color ${value}`);
  if (match[5] !== undefined) {
    return [Number(match[5]), Number(match[6]), Number(match[7]), match[8] === undefined ? 1 : Number(match[8])];
  }
  return [Number(match[1]) / 255, Number(match[2]) / 255, Number(match[3]) / 255, match[4] === undefined ? 1 : Number(match[4])];
};
const shadows = (value) => {
  if (!value || value === "none") return [];
  const result = [];
  const pattern = /((?:rgba?|color)\([^)]*\))\s+(-?[\d.]+)px\s+(-?[\d.]+)px\s+(-?[\d.]+)px\s+(-?[\d.]+)px(?:\s+(inset))?/g;
  for (const match of value.matchAll(pattern)) {
    result.push({
      type: match[6] === "inset" ? "INNER_SHADOW" : "DROP_SHADOW",
      color: color(match[1]),
      offset: { x: Number(match[2]), y: Number(match[3]) },
      radius: Number(match[4]),
      spread: Number(match[5]),
    });
  }
  if (!result.length) fail(`unsupported shadow ${value}`);
  return result;
};
const outline = (computed) => {
  if (!computed.outlineStyle || computed.outlineStyle === "none") return null;
  const width = px(computed.outlineWidth);
  const offset = px(computed.outlineOffset);
  if (!width || computed.outlineStyle !== "solid") fail(`unsupported outline ${JSON.stringify({
    width: computed.outlineWidth,
    style: computed.outlineStyle,
    color: computed.outlineColor,
    offset: computed.outlineOffset,
  })}`);
  if (offset !== -width) fail(`outline cannot map losslessly to an inside stroke: ${width}px / ${offset}px`);
  return {
    width,
    style: computed.outlineStyle,
    color: color(computed.outlineColor),
    offset,
    figmaMapping: `${width}px INSIDE stroke`,
  };
};
const relRect = (entry, rootRect) => ({ x: entry.rect.x - rootRect.x, y: entry.rect.y - rootRect.y, width: entry.rect.width, height: entry.rect.height });
const textSpec = (entry, rootRect) => {
  const computed = style(entry);
  return {
    text: entry.ownText,
    rect: relRect(entry, rootRect),
    fontSize: px(computed.fontSize),
    fontWeight: Number(computed.fontWeight),
    lineHeight: px(computed.lineHeight),
    letterSpacing: computed.letterSpacing === "normal" ? 0 : px(computed.letterSpacing),
    textAlign: computed.textAlign,
    color: color(computed.color),
  };
};
// **자연 폭 표는 접힌 글자에만 남긴다(2026-09-14, 크기 굳힘 감사 묶음 3).**
// 옛 계획은 한 줄 글자에도 `figmaWidth`(Figma 글꼴의 자연 폭, 2026-09-05 임시 TextNode 실측)를 실어 렌더러가
// `textAutoResize NONE` 상자를 그 폭으로 넓혔다. 카드가 Auto Layout 이 된 뒤로 한 줄 글자는 HUG(`WIDTH_AND_HEIGHT`)라
// Figma 가 스스로 폭을 잰다 — 표가 필요 없다.
//
// **이미 접힌 글자는 다르다.** 가격 행(`inline-flex items-end gap-4`)의 가격과 "per month" 는 좁은 카드에서
// `flex-shrink` 로 줄어 브라우저가 두 줄로 접는다. Figma 에는 flex-shrink 가 없어 HUG 로 두면 한 줄로 펴지므로,
// 그 폭만은 측정 상자로 고정한다(조립 규칙 28 초안의 허용 사유 ③ 「flex-shrink 로 감긴 텍스트」). 그 고정이 브라우저와
// 같은 자리에서 접히려면 **줄마다** Figma 자연 폭이 상자 안에 들어가야 하므로, 줄별 자연 폭을 증거로 남겨
// `assertLineFit` 이 확인한다. 한 줄이라도 넘치면 Figma 는 다른 곳에서 접거나 세 줄이 되니 값을 옮기지 말고 다시 잰다.
//   2026-09-05 전량 재측정: `58a85b13`(티어 넷 → 다섯, 가격 문자열 전면 교체)과 가격 굵기 500 → 600.
const desktopFigmaLineMeasurements = {
  "12,900 KRW": { "12,900": 113, KRW: 80 },
  "29,900 KRW": { "29,900": 119, KRW: 80 },
  "49,900 KRW": { "49,900": 120, KRW: 80 },
  "74,900 KRW": { "74,900": 116, KRW: 80 },
  "per month": { per: 24, month: 46 },
};
const mobileFigmaLineMeasurements = {
  "12,900 KRW": { "12,900": 88, KRW: 62 },
  "per month": { per: 21, month: 40 },
};
const figmaGlyphMeasurements = {
  $measurement: "use_figma temporary TextNode natural bounds per wrapped line; exact per-string typography; measured 2026-09-05 and nodes removed",
  desktopLines: desktopFigmaLineMeasurements,
  mobileLines: mobileFigmaLineMeasurements,
};
const assertLineFit = (spec, lines, where) => {
  for (const [line, width] of Object.entries(lines)) {
    if (width > spec.box + 0.5) fail(`${where}: line ${JSON.stringify(line)} natural width ${width} overflows measured box ${spec.box}`);
  }
};
const renderedComponents = JSON.parse(readFileSync(resolve(repoRoot, "migration/product.rendered-components.json"), "utf8"));
if (renderedComponents.productCommit !== fixture.productCommit) fail("migration/product.rendered-components.json is not at this fixture anchor");
// 카드 CTA 는 제품 `Button`(LOUIS `.louis-button[data-size=md]`)이다 — 높이는 그 레시피가 선언한다. 측정 원장의
// `declared` 에는 LOUIS 클래스 규칙이 실리지 않아, 제품 레시피 원장(`button-md` probe)의 높이를 선언 출처로 쓴다.
const buttonMdHeight = px(renderedComponents.rendered?.["button-md"]?.height);
if (!buttonMdHeight) fail("product.rendered-components.json has no button-md height");

if (redirected.finalPath !== route || !redirected.redirected || JSON.stringify(redirected.tree) !== JSON.stringify(screen.tree)) {
  fail(`${redirectedRoute} no-query redirect no longer matches ${route}`);
}
if (
  mobileRedirected.finalPath !== route || !mobileRedirected.redirected ||
  JSON.stringify(mobileRedirected.tree) !== JSON.stringify(mobileScreen.tree)
) fail(`${mobileContext} ${redirectedRoute} no-query redirect no longer matches ${route}`);

const declaredValue = (entry, property, pattern, where) => {
  const value = entry.declared?.[property];
  if (typeof value !== "string" || !pattern.test(value)) {
    fail(`${where} ${entry.path}: declared ${property} ${JSON.stringify(value)} does not match ${pattern}`);
  }
  return value;
};
const paddingOf = (computed) => ({ top: px(computed.paddingTop), right: px(computed.paddingRight), bottom: px(computed.paddingBottom), left: px(computed.paddingLeft) });

/* **요금제 카드는 흐름이다 — 글자 · 아이콘 · 버튼을 측정 좌표에 박지 않는다(2026-09-14, 크기 굳힘 감사 묶음 3).**
   옛 계획은 카드 안의 모든 글자와 체크 아이콘 · 버튼을 카드 기준 rect 로 실었고, 렌더러가 `textAutoResize NONE` +
   x/y 로 박았다. 카드 폭이 316 → 256.8 로 바뀐 날(`58a85b13`) 그 좌표가 통째로 낡았다. 이제 계획은 **제품 JSX 의 구획**
   (`UpgradePlanPageClient.tsx` 의 `TIER_HEAD` · `TIER_PRICE_ROW` · `TIER_CREDITS_ROW` · `TIER_INCLUDES` ·
   `TIER_FEATURE_LIST` · `Button`)을 싣고, 값은 **선언이 정한 것만** 싣는다: 간격 · 패딩 · 여백(계산 스타일), 최소 높이
   (`min-h-[560px]`), 체크 아이콘 크기(`w-9 h-9`), 기능 행의 아이콘 트랙(`grid-template-columns: 18px 1fr`), 버튼 높이
   (Button md 레시피). 흐름 자식의 margin 은 Figma 에 없으므로 칠 없는 감싸개의 패딩으로 옮긴다(조립 규칙 7번).
   구획을 알아보지 못하면 던진다 — 원가 줄(`TIER_ORIGINAL_PRICE`)이나 비고(`TIER_NOTE`)가 화면에 나오면 여기서 멈춰
   슬롯을 더해야 한다. */
const cardStructure = (tree, root, lines, where) => {
  const kids = (path) => tree.filter((entry) => entry.parentPath === path);
  const isCheck = (entry) => style(entry).maskImage.includes("/icons/CheckCircle.svg");
  const margin = (computed) => ({ top: px(computed.marginTop), bottom: px(computed.marginBottom) });
  const sections = [];
  let rows = 0;
  let action = null;
  for (const child of kids(root.path)) {
    const computed = style(child);
    const inner = kids(child.path);
    if (child.tag === "button") {
      declaredValue(child, "margin-top", /^auto$/, where);
      declaredValue(child, "width", /^100%$/, where);
      if (px(computed.height) !== buttonMdHeight) fail(`${where}: plan card CTA height ${computed.height} is not the Button md recipe`);
      const label = child.ownText ? child : inner.find((entry) => entry.ownText) ?? fail(`${where}: missing card button label ${child.path}`);
      action = {
        text: label.ownText,
        rect: relRect(child, root.rect),
        height: buttonMdHeight,
        radius: px(computed.borderTopLeftRadius),
        padding: paddingOf(computed),
        fill: color(computed.backgroundColor),
        opacity: Number(computed.opacity),
        label: textSpec(label, root.rect),
      };
      continue;
    }
    if (child.tag === "div" && inner[0]?.tag === "h3") {
      if (inner.length !== 1) fail(`${where}: plan card head gained a description — add the slot`);
      sections.push({ kind: "head", margin: margin(computed), texts: [{ ...textSpec(inner[0], root.rect), sizing: "FILL" }] });
      continue;
    }
    if (child.tag === "div" && computed.display === "flex" && inner[0]?.tag === "strong") {
      const kind = rows === 0 ? "price" : "credits";
      rows += 1;
      sections.push({
        kind,
        margin: margin(computed),
        padding: paddingOf(computed),
        gap: px(computed.columnGap),
        alignItems: computed.alignItems,
        texts: inner.map((entry) => {
          const spec = textSpec(entry, root.rect);
          const textPadding = paddingOf(style(entry));
          const box = entry.rect.width - textPadding.left - textPadding.right;
          const wrapped = entry.rect.height - textPadding.top - textPadding.bottom > spec.lineHeight * 1.5;
          if (!wrapped) return { ...spec, padding: textPadding, sizing: "HUG" };
          const lineWidths = lines[spec.text] ?? fail(`${where}: wrapped row text ${JSON.stringify(spec.text)} has no Figma line measurement`);
          const fixed = { ...spec, padding: textPadding, sizing: "FIXED", box, $lineNaturalWidths: lineWidths };
          assertLineFit(fixed, lineWidths, `${where} ${JSON.stringify(spec.text)}`);
          return fixed;
        }),
      });
      continue;
    }
    if (child.tag === "p" && child.ownText) {
      sections.push({ kind: "includes", margin: margin(computed), texts: [{ ...textSpec(child, root.rect), sizing: "FILL" }] });
      continue;
    }
    if (child.tag === "ul") {
      sections.push({
        kind: "features",
        margin: margin(computed),
        gap: px(computed.rowGap),
        items: inner.map((li) => {
          const liStyle = style(li);
          declaredValue(li, "grid-template-columns", /^\d+(?:\.\d+)?px 1fr$/, where);
          const [first, second] = kids(li.path);
          const icon = first && isCheck(first) ? first : null;
          const text = icon ? second : first;
          if (!text?.ownText) fail(`${where}: feature row without text ${li.path}`);
          if (icon) declaredValue(icon, "width", /px\)?$/, where);
          return {
            gap: px(liStyle.columnGap),
            iconTrack: px(liStyle.gridTemplateColumns.split(" ")[0]),
            icon: icon ? { size: px(style(icon).width), marginTop: px(style(icon).marginTop), color: color(style(icon).backgroundColor), asset: "/icons/CheckCircle.svg" } : null,
            text: { ...textSpec(text, root.rect), sizing: "FILL" },
          };
        }),
      });
      continue;
    }
    fail(`${where}: unexpected plan card child ${child.tag} ${child.path}`);
  }
  return { sections, action };
};

/* **메인 표면 · 장면은 흐름이다(2026-09-14, 크기 굳힘 감사 묶음 3).** 옛 가드는 page · 바깥 · main · 카드 격자 rect 를
   `!== 1920/1080 · 1640 · 1632/1064 · 1300/608.1875`, 모바일 `!== 402/874 · 6/390 · 5651.75 · 359.1875 · 1668.7813` 로
   물었고, 렌더러가 그 rect 로 resize 하고 헤더 글자 · 카드 · 비교 제목을 측정 x/y 에 박았다. 이제 계획은 제품 선언을 싣는다:
     · 장면: 셸 패딩(`pt-[var(--app-gnb-safe-top)]` · `pb-[…rail-padding-bottom]`), main 의 `ml-[var(--app-gnb-sidebar-width)]` ·
       `pr-[var(--app-gnb-main-inline-padding-end)]`(계산값). 셸은 `h-[100dvh]` 라 main 이 위아래를 채운다.
     · 메인 표면(가격 섹션 · 뷰포트 크롭): 스크롤 칸 패딩, 상단 바 bleed, 컨테이너 `max-width: min(1300px, 100%)` 와 위 패딩,
       헤더 `max-width: 820px` · 아래 여백, 알림 알약 높이(`height: calc(32px)`) · 아래 여백, 제목 아래 여백, 본문 `max-width: 72ch`,
       선물 구매 줄의 위 여백(`mt-10`)과 버튼 높이(Button md 레시피 — 면 · 글자는 그리지 않고 자리만),
       덱 `repeat(N, minmax(0px, 1fr))` · gap, 비교 블록 위 여백(블록 margin 이 겹쳐 큰 쪽 하나만 남는다).
   숫자 가드는 없다 — 선언이 있는지와 rect 가 그 값들로 **닫히는지**(원장 대조)만 본다. 헤더는 렌더러가 그리는 자식의 합으로
   닫혀야 하고, 헤더 직계 자식이 렌더러가 그리는 목록과 다르면 멈춘다. */
const cappedWidth = (entry, available, where) => {
  const declared = declaredValue(entry, "max-width", /^min\(\d+(?:\.\d+)?px, 100%\)$/, where);
  const cap = Number(/^min\(([\d.]+)px/.exec(declared)[1]);
  return available >= cap ? { mode: "FIXED", value: cap, declared } : { mode: "FILL", value: entry.rect.width, declared };
};
const upgradeLayout = (tree, where) => {
  const at = (path) => tree.find((entry) => entry.path === path) ?? fail(`${where}: missing node ${path}`);
  const page = at("body.1");
  const shell = at("body.1.0.0");
  const outer = at("body.1.0.0.1");
  const section = at("body.1.0.0.1.0");
  const scroll = at("body.1.0.0.1.0.0");
  const slot = at("body.1.0.0.1.0.0.0");
  const bar = at("body.1.0.0.1.0.0.0.0");
  const container = at("body.1.0.0.1.0.0.1");
  const header = at("body.1.0.0.1.0.0.1.0");
  const notice = at("body.1.0.0.1.0.0.1.0.0");
  const title = at("body.1.0.0.1.0.0.1.0.1");
  const body = at("body.1.0.0.1.0.0.1.0.2");
  const deck = at("body.1.0.0.1.0.0.1.1");
  // 비교 블록은 뷰포트(모바일 402×874) 밖이면 측정 트리에 없다 — 없으면 그리지 않는다.
  const optional = (path) => tree.find((entry) => entry.path === path) ?? null;
  const kids = (path) => tree.filter((entry) => entry.parentPath === path);
  // 선물 구매 줄(KLI-264, `<div className="mt-10"><Button variant="secondary">`) — 아래 `giftSlot` 이 자리를 싣는다.
  const giftRow = optional("body.1.0.0.1.0.0.1.0.3");
  const compare = optional("body.1.0.0.1.0.0.1.2");
  const compareInner = optional("body.1.0.0.1.0.0.1.2.0");
  const compareTitle = optional("body.1.0.0.1.0.0.1.2.0.0");
  const [shellStyle, outerStyle, scrollStyle, barStyle, containerStyle, headerStyle, noticeStyle, titleStyle, bodyStyle, deckStyle] =
    [shell, outer, scroll, bar, container, header, notice, title, body, deck].map(style);
  declaredValue(shell, "height", /^100dvh$/, where);
  declaredValue(outer, "margin-left", /--app-gnb-sidebar-width/, where);
  declaredValue(section, "flex", /^1 1 0%$/, where);
  declaredValue(bar, "margin-left", /--mainchrome-bleed-left/, where);
  const deckColumns = declaredValue(deck, "grid-template-columns", /^repeat\(\d+, minmax\(0px, 1fr\)\)$/, where);
  // **헤더의 직계 자식은 렌더러가 그리는 것과 같아야 한다.** 헤더는 흐름이라 그 높이가 덱 · 비교 제목의 자리를 정한다 —
  // 렌더러가 모르는 자식이 끼면 Figma 헤더가 그만큼 짧아져 아래가 전부 위로 선다. 모르는 자식이 나오면 슬롯을 더한다.
  const drawnHeaderKids = [notice, title, body, ...(giftRow ? [giftRow] : [])];
  const headerKids = kids(header.path);
  if (headerKids.length !== drawnHeaderKids.length || headerKids.some((entry, index) => entry !== drawnHeaderKids[index])) {
    fail(`${where}: header children ${headerKids.map((entry) => `${entry.path.split(".").at(-1)}:${entry.tag}`).join(" · ")} are not the ones the renderer draws (notice · title · body · gift row) — add the slot`);
  }
  // 선물 구매 줄: 줄의 위 여백(`mt-10`, 칠 없는 감싸개 패딩)과 **버튼**(Button secondary md — 2026-09-14 컬렉션 이전부터
  // 면 · 글자를 라이브 변수로 칠한다). 높이는 Button md 레시피(카드 CTA 와 같은 출처), 폭은 내용 HUG + 좌우 패딩.
  let giftSlot = null;
  if (giftRow) {
    const [button, ...rest] = kids(giftRow.path);
    if (button?.tag !== "button" || rest.length) fail(`${where}: header gift row ${giftRow.path} is no longer a single button — update the gift slot`);
    const buttonStyle = style(button);
    if (px(buttonStyle.height) !== buttonMdHeight) fail(`${where}: header gift button height ${buttonStyle.height} is not the Button md recipe`);
    const label = button.ownText ? button : kids(button.path).find((entry) => entry.ownText) ?? fail(`${where}: missing header gift button label ${button.path}`);
    giftSlot = {
      paddingTop: px(style(giftRow).marginTop),
      paddingTopDeclared: declaredValue(giftRow, "margin-top", /px\)?$/, where),
      height: buttonMdHeight,
      label: label.ownText,
      button: {
        padding: paddingOf(buttonStyle),
        radius: px(buttonStyle.borderTopLeftRadius),
        fill: color(buttonStyle.backgroundColor),
        effects: shadows(buttonStyle.boxShadow),
        text: textSpec(label, button.rect),
      },
    };
  }
  const bleed = { left: -px(barStyle.marginLeft), right: -px(barStyle.marginRight) };
  const scrollPadding = paddingOf(scrollStyle);
  const contentWidth = section.rect.width - scrollPadding.left - scrollPadding.right;
  const layout = {
    page: { padding: { top: px(shellStyle.paddingTop), right: px(outerStyle.paddingRight), bottom: px(shellStyle.paddingBottom), left: px(outerStyle.marginLeft) } },
    main: {
      padding: { top: scrollPadding.top, right: scrollPadding.right - bleed.right, bottom: scrollPadding.bottom, left: scrollPadding.left - bleed.left },
      bleed,
      barGap: px(style(slot).marginBottom),
    },
    container: { width: cappedWidth(container, contentWidth, where), paddingTop: px(containerStyle.paddingTop) },
    header: {
      maxWidth: px(headerStyle.maxWidth),
      maxWidthDeclared: declaredValue(header, "max-width", /^\d+px$/, where),
      paddingBottom: px(headerStyle.marginBottom),
      notice: {
        height: px(noticeStyle.height),
        heightDeclared: declaredValue(notice, "height", /px\)?$/, where),
        padding: paddingOf(noticeStyle),
        paddingBottom: px(noticeStyle.marginBottom),
      },
      titlePaddingBottom: px(titleStyle.marginBottom),
      bodyMaxWidth: px(bodyStyle.maxWidth),
      bodyMaxWidthDeclared: declaredValue(body, "max-width", /ch$/, where),
      gift: giftSlot,
    },
    deck: { columns: Number(/^repeat\((\d+),/.exec(deckColumns)[1]), gap: px(deckStyle.columnGap), declared: deckColumns },
    compare: compare && compareInner && compareTitle ? { paddingTop: Math.max(px(style(compare).marginTop), px(style(compareInner).marginTop)) } : null,
  };
  const deckBottom = deck.rect.y + deck.rect.height;
  // 헤더 높이는 **렌더러가 그리는 자식**(알약 높이 + 아래 여백 · 제목 + 아래 여백 · 본문 · 선물 구매 줄의 위 여백 + 버튼 높이)으로
  // 닫혀야 한다. 측정 header 높이만으로 덱 자리를 대조하면 그리지 않는 자식이 끼어도 초록이다 — 선물 구매 줄이 그랬다.
  const drawnHeaderHeight =
    layout.header.notice.height + layout.header.notice.paddingBottom +
    title.rect.height + layout.header.titlePaddingBottom +
    body.rect.height +
    (layout.header.gift ? layout.header.gift.paddingTop + layout.header.gift.height : 0);
  const closes =
    section.rect.x === page.rect.x + layout.page.padding.left &&
    section.rect.y === page.rect.y + layout.page.padding.top &&
    section.rect.width === page.rect.width - layout.page.padding.left - layout.page.padding.right &&
    section.rect.height === page.rect.height - layout.page.padding.top - layout.page.padding.bottom &&
    bar.rect.x === section.rect.x + scrollPadding.left - bleed.left &&
    // 바 폭은 선언(`width: calc(100% + bleed…)`)이 정한다 — 스크롤 칸 패딩에서 bleed 를 뺀 안쪽을 채운다. 렌더러의 FILL 이 이것이다.
    bar.rect.width === section.rect.width - layout.main.padding.left - layout.main.padding.right &&
    container.rect.y === bar.rect.y + bar.rect.height + layout.main.barGap &&
    header.rect.y === container.rect.y + layout.container.paddingTop &&
    notice.rect.height === layout.header.notice.height &&
    header.rect.height === drawnHeaderHeight &&
    deck.rect.y === header.rect.y + header.rect.height + layout.header.paddingBottom &&
    (!layout.compare || compare.rect.y === deckBottom + layout.compare.paddingTop);
  if (!closes) fail(`${where}: measured upgrade rects no longer close over the declared layout values`);
  return {
    layout,
    rects: { page, section, bar, deck },
    texts: {
      headerNotice: textSpec(notice, section.rect),
      headerTitle: textSpec(title, section.rect),
      headerBody: { ...textSpec(body, section.rect), maxWidth: layout.header.bodyMaxWidth },
      ...(layout.compare ? { compareTitle: textSpec(compareTitle, section.rect) } : {}),
    },
  };
};

// **헤더가 다시 평평해졌다.** 그전에는 이벤트 알약이 제목 옆에 서서 제목·본문이 한 겹 더 들어가 있었는데
// (`6c5af2d9`), 제품이 알약을 **제목 위로** 올리며 그 겹을 걷었다(UpgradePlanPageClient.tsx `<header className={PRICING_HEADER}>`
// 위 주석). 지금 `<header>` 의 직속 자식은 넷이다: .0 알약(p>span) · .1 제목(h2) · .2 본문(p) · .3 선물 구매(div>button>span).
// `.3` 의 선물 구매 버튼(KLI-264)은 2026-09-14 컬렉션 이전까지 면과 글자를 그리지 않았다 — 버튼 색이 옛 로컬 변수 표에
// 없었다. 이제 Button secondary 레시피의 라이브 변수(`accent-secondary` · `accent-secondary-foreground`)로 칠한다.
// **자리는 그린다(2026-09-14).** 메인 표면이 흐름이 된 뒤로 헤더 높이가 덱 · 비교 제목의 자리를 정한다. 옛 러너는 카드를
// 측정 position 에 박아 이 누락이 위치를 흔들지 않았지만, 흐름에서 줄을 통째로 빼면 덱 · 비교 제목이 그 줄(위 여백 + 버튼
// 높이)만큼 위로 서고 모바일 조각(FIXED 높이 증거 경계)은 관측되지 않은 영역을 드러낸다. 그래서 `upgradeLayout` 이 줄의
// 위 여백과 Button md 높이를 `layout.header.gift` 로 싣고, 렌더러가 그 자리에 버튼을 짓는다. 헤더 높이 대조도 측정 header
// 높이가 아니라 그리는 자식의 합으로 닫는다 — 그 전 대조는 그리지 않는 자식을 담은 측정값으로 닫혀 공허하게 초록이었다.
const desktop = upgradeLayout(screen.tree, `${context} ${route}`);
const cardGrid = desktop.rects.deck;
const main = desktop.rects.section;
const pageRoot = desktop.rects.page;
const mainStyle = style(main);
const cardRoots = screen.tree.filter((entry) => entry.parentPath === cardGrid.path && entry.tag === "article");
if (cardRoots.length !== desktop.layout.deck.columns) fail(`expected ${desktop.layout.deck.columns} measured plan cards (deck columns), got ${cardRoots.length}`);
const cardSpecs = cardRoots.map((root) => {
  const where = `${context} ${root.path}`;
  const rootStyle = style(root);
  const structure = cardStructure(screen.tree, root, desktopFigmaLineMeasurements, where);
  if (!structure.action) fail(`${where}: desktop plan card has no CTA`);
  // 제품 정본은 `app/lib/payments/toss/plans.ts` 의 `UpgradePlanCode` = "trial" | "lite" | "plus" | "pro" | "ultra" 이고,
  // 화면에 찍히는 것은 그 `tierName` 이다(58a85b13).
  const title = structure.sections[0]?.kind === "head" ? structure.sections[0].texts[0].text : fail(`${where}: missing plan title`);
  if (!["Trial", "Lite", "Plus", "Pro", "Ultra"].includes(title)) fail(`${where}: unknown plan title ${title}`);
  return {
    plan: title,
    route,
    rect: { width: root.rect.width, height: root.rect.height },
    position: relRect(root, main.rect),
    padding: paddingOf(rootStyle),
    // `min-h-[560px]` — 선택값. 높이는 HUG 이고 최소만 선언이다(카드가 그보다 길면 내용이 정한다).
    minHeight: px(rootStyle.minHeight),
    minHeightDeclared: declaredValue(root, "min-height", /^\d+px$/, where),
    radius: px(rootStyle.borderTopLeftRadius),
    background: color(rootStyle.backgroundColor),
    effects: shadows(rootStyle.boxShadow),
    outline: outline(rootStyle),
    ...structure,
  };
});
// 덱은 `items-stretch` 라 다섯 카드가 가장 긴 카드의 높이로 늘어난다. Figma 에서 형제 모두를 세로 FILL 로 두면 높이를
// 정할 주체가 사라져 줄이 접히므로(조립 규칙 19번), **내용이 가장 긴 카드 하나만 HUG** 로 두고 나머지를 FILL 로 늘린다.
// 내용 높이는 버튼(`mt-auto`) 앞 마지막 구획의 끝 + 그 아래 여백 + 버튼 + 아래 패딩이다 — 측정 rect 의 원장 계산이다.
{
  const natural = cardRoots.map((root, index) => {
    const spec = cardSpecs[index];
    const last = screen.tree.filter((entry) => entry.parentPath === root.path && entry.tag !== "button").at(-1);
    return last.rect.y + last.rect.height + px(style(last).marginBottom) - root.rect.y + spec.action.height + spec.padding.bottom;
  });
  const tallest = natural.indexOf(Math.max(...natural));
  for (const [index, spec] of cardSpecs.entries()) spec.deckHeight = index === tallest ? "HUG" : "FILL";
}
// 현재 플랜 카드의 2px 아웃라인. 제품이 폐지된 accent-ultra 램프를 떠나 `--primary-200`
// (= LOUIS blue-200, rgb 163 213 255)으로, 알파도 LOUIS 16단 스케일에 맞춰 42% → 40% 로
// 스냅했다. 값이 바뀐 것은 제품 쪽 결정이므로 여기서는 실측을 따라간다.
// 근거 인용은 아래 currentPlanOutlineSource 가 같은 커밋의 소스 줄로 다시 확인한다.
const expectedCurrentPlanOutline = {
  width: 2, // 선언: apps/web/app/mypage/upgrade/UpgradePlanPageClient.tsx:232
  style: "solid",
  color: [163 / 255, 213 / 255, 255 / 255, 0.4],
  offset: -2,
  figmaMapping: "2px INSIDE stroke",
};
if (
  JSON.stringify(cardSpecs[0].outline) !== JSON.stringify(expectedCurrentPlanOutline) ||
  cardSpecs.slice(1).some((entry) => entry.outline !== null)
) fail("desktop current-plan outline drift");

const mobile = upgradeLayout(mobileScreen.tree, `${mobileContext} ${route}`);
const mobileMain = mobile.rects.section;
const mobilePageRoot = mobile.rects.page;
const mobileTopBar = mobile.rects.bar;
const mobileCardGrid = mobile.rects.deck;
const mobileMainStyle = style(mobileMain);
const topBar = desktop.rects.bar;
const topBarVariants = {
  desktop: { set: "Product/Desktop App Top Bar", variant: "Content=Subscription, Breadcrumb=Trail, Back=True, Divider=On" },
  mobile: { set: "Product/Mobile App Top Bar", variant: "Width=Inset, Breadcrumb=Trail, Back=True, Divider=On" },
};
// 상단 바 인스턴스의 TEXT 속성은 이 route 의 측정 바 글자로 채운다(`scripts/lib/figma-top-bar-text.mjs`).
const topBarText = {};
// **상단 바 높이는 여기서 숫자로 받지 않는다(2026-09-14).** 예전 가드는 `height !== 53` · `content.y !== 53` 을
// 물었는데, 제품 바는 높이를 선언하지 않는다(패딩 + 가장 큰 자식 + 헤어라인) — `6f6282c1` 이 프로필을 36 → 32
// 로 줄이자 49 가 됐다. 바 기하의 판정은 앱 셸 계획이 소유한다(`build-figma-product-app-shell` 이 같은 route ·
// 같은 노드를 재고 제품 식으로 닫히는지 본다). 여기서는 이 장면의 바가 그 계획의 variant 와 같은 상자인지만 본다
// (본문이 바 바로 아래에서 시작하는지는 위 `upgradeLayout` 의 닫힘 대조가 본다).
{
  const appShell = JSON.parse(readFileSync(resolve(repoRoot, "figma/product-app-shell.plan.json"), "utf8"));
  if (appShell.productCommit !== fixture.productCommit) fail("figma/product-app-shell.plan.json is not at this fixture anchor — run build-figma-product-app-shell first");
  const barOf = (set, name) => set.variants.find((entry) => entry.route === route && entry.name === name)
    ?? fail(`app-shell plan has no ${name} measured on ${route}`);
  const pairs = [
    [topBar, barOf(appShell.component.desktopTopBar, topBarVariants.desktop.variant), "desktop", screen.tree],
    [mobileTopBar, barOf(appShell.component, topBarVariants.mobile.variant), "mobile", mobileScreen.tree],
  ];
  for (const [bar, planned, where, tree] of pairs) {
    if (bar.rect.width !== planned.rect.width || bar.rect.height !== planned.rect.height) fail(`${where} upgrade top bar is not the app-shell plan bar`);
    topBarText[where] = topBarTextProperties({ tree, bar, appShellPlan: appShell, ...topBarVariants[where], fail, where: `${where} ${route}` });
  }
}

const mobileCardRoots = mobileScreen.tree.filter((entry) => entry.parentPath === mobileCardGrid.path && entry.tag === "article");
if (mobileCardRoots.length !== 2) fail(`expected exactly two viewport-observed mobile plan cards, got ${mobileCardRoots.length}`);
const mobileCardSpecs = mobileCardRoots.map((root) => {
  const where = `${mobileContext} ${root.path}`;
  const rootStyle = style(root);
  const structure = cardStructure(mobileScreen.tree, root, mobileFigmaLineMeasurements, where);
  if (structure.action) fail(`mobile fixture unexpectedly contains an action ${root.path}`);
  const title = structure.sections[0]?.kind === "head" ? structure.sections[0].texts[0].text : fail(`${where}: missing mobile plan title`);
  return {
    plan: title,
    route,
    viewport: "MobileVisibleSlice",
    // **보이는 조각이다.** 뷰포트(402×874) 밖의 기능 줄 · 버튼은 측정 트리에 없어 카드의 높이를 정한 내용 일부가 관측되지
    // 않았다. ≤788 은 `min-height: auto` 라 선언된 높이도 없다. 그래서 이 카드만 높이를 **측정 상자로 고정**하고(증거 경계)
    // 넘치는 것은 자른다 — 완전한 모바일 카드 계약이 아니다.
    rect: { width: root.rect.width, height: root.rect.height },
    position: relRect(root, mobileMain.rect),
    visibleIntersection: {
      top: Math.max(0, mobilePageRoot.rect.y - root.rect.y),
      bottom: Math.min(root.rect.height, mobilePageRoot.rect.y + mobilePageRoot.rect.height - root.rect.y),
    },
    padding: paddingOf(rootStyle),
    minHeightDeclared: declaredValue(root, "min-height", /^auto$/, where),
    radius: px(rootStyle.borderTopLeftRadius),
    background: color(rootStyle.backgroundColor),
    effects: shadows(rootStyle.boxShadow),
    outline: outline(rootStyle),
    ...structure,
    actionMeasured: false,
  };
});
if (
  // 두 번째 카드가 Basic → **Lite** 다. 개명이 아니라 **새 티어가 2번 자리에 끼어든 것**이다
  // — 옛 Basic 은 Plus 로 이름이 바뀌어 3번으로 밀렸고, 모바일 뷰포트에는 안 잡힌다(58a85b13).
  mobileCardSpecs.map((entry) => entry.plan).join(",") !== "Trial,Lite" ||
  JSON.stringify(mobileCardSpecs[0].outline) !== JSON.stringify(expectedCurrentPlanOutline) ||
  mobileCardSpecs[1].outline !== null
) fail("mobile upgrade card visible-slice drift");

// 화면 본체가 `page.tsx` 에서 이 파일로 통째로 옮겨 갔다 —
// `bdd47792 fix(pricing): 가격 조회가 실패해도 페이지가 죽지 않게 한다` 가 서버 껍데기만
// page.tsx 에 남기고 783줄을 새 파일로 뽑았다(`git log --diff-filter=A` 로 이 파일의 추가
// 커밋이 bdd47792 하나임을 확인했다). 남은 page.tsx 는 getPlanPricing() 을 부르는 17줄이다.
const upgradeSourcePath = "apps/web/app/mypage/upgrade/UpgradePlanPageClient.tsx";
// 좌표는 내용으로 다시 찾았다 — 두 문자열 모두 이 파일에서 유일하고 `TIER_CARD_CURRENT`
// 안에서 서로 붙어 있다. 파일이 바뀌었을 뿐 문자열은 한 글자도 안 움직였다.
const currentPlanOutlineSource = [
  sourceQuote(upgradeSourcePath, 232, '  "[outline:2px_solid_rgb(var(--primary-200-rgb)/40%)]",'),
  sourceQuote(upgradeSourcePath, 233, '  "[outline-offset:-2px]",'),
];
// 덱 · 카드 크기 축의 선언 원문 — 측정 원장의 `declared` 칸과 같은 뜻을 소스 줄로 한 번 더 못박는다.
const deckSource = [
  sourceQuote(upgradeSourcePath, 206, '  "grid [grid-template-columns:repeat(5,minmax(0,1fr))] gap-2 items-stretch",'),
  sourceQuote(upgradeSourcePath, 212, '  "min-h-[560px] [@media(max-width:788px)]:[min-height:auto]",'),
];
// **간격 · 패딩은 값이 같은 `Klipse Primitive/spacing/<n>` 에 묶는다** — 이름과 값을 되읽기(`figma/readback.json`)에서
// 확인한다(공용 헬퍼 `liveVariables`). 토큰이 없는 값(뷰포트 계산값 · 제품 지역 여백)은 숫자로 둔다 — 렌더러는 계획에
// `spacing<n>` 이 있을 때만 묶는다.
const live = liveVariables({ repoRoot, fail });
const cardSpacing = (spec) => [
  ...Object.values(spec.padding),
  ...spec.sections.flatMap((section) => [section.margin.top, section.margin.bottom, section.gap ?? 0, ...Object.values(section.padding ?? {}),
    ...(section.texts ?? []).flatMap((text) => Object.values(text.padding ?? {})),
    ...(section.items ?? []).flatMap((item) => [item.gap, item.icon?.marginTop ?? 0, item.icon ? 0 : item.iconTrack + item.gap])]),
  ...(spec.action ? Object.values(spec.action.padding) : []),
];
const layoutSpacing = (layout) => [
  ...Object.values(layout.main.padding), layout.main.bleed.left, layout.main.bleed.right, layout.main.barGap,
  layout.container.paddingTop, layout.header.paddingBottom, layout.header.notice.paddingBottom, ...Object.values(layout.header.notice.padding),
  layout.header.titlePaddingBottom, layout.header.gift?.paddingTop ?? 0, ...Object.values(layout.header.gift?.button.padding ?? {}),
  layout.deck.gap, layout.compare?.paddingTop ?? 0,
];
const spacingBindings = Object.fromEntries([...new Set([
  ...cardSpecs.flatMap(cardSpacing), ...mobileCardSpecs.flatMap(cardSpacing), ...layoutSpacing(desktop.layout), ...layoutSpacing(mobile.layout),
])].filter((value) => value > 0).sort((a, b) => a - b).flatMap((value) => live.spacingBinding(value)));
for (const radius of [...cardSpecs, ...mobileCardSpecs].flatMap((spec) => [spec.radius, spec.action?.radius].filter((value) => value !== undefined))) {
  live.radiusBinding(radius, "radius/12", "plan card");
}
for (const layout of [desktop.layout, mobile.layout]) {
  if (layout.header.gift) live.radiusBinding(layout.header.gift.button.radius, "radius/12", "header gift button");
}
for (const radius of [px(mainStyle.borderTopLeftRadius), px(mobileMainStyle.borderTopLeftRadius)]) {
  live.radiusBinding(radius, "radius/16", "upgrade main");
}

const plan = {
  $comment: "Generated from migration/product.auth-fixture.json. Do not edit by hand.",
  $evidenceClass: "product-only measured upgrade card inventory plus desktop scene and mobile visible slice; not a normative design-system contract",
  $productRegressionResolved: {
    $comment: "직전 앵커의 카드 면·글자색 회귀는 이 앵커에서 재현되지 않는다. 기록은 남긴다 — 같은 함정이 다시 열릴 수 있다.",
    was: "ae8fd627 에서 라이트 /mypage/upgrade 의 Basic·Pro 카드는 면 #FAFAFA 에 제목·가격이 #E3E4E8(대비 약 1.07:1)이었고, Trial·Max 는 면이 순검정으로 뒤집혀 있었다.",
    now: "5a67d692 실측 — 다섯 장 **모두** 같은 면 rgb(221,222,224) 에 같은 제목·가격색 rgb(42,47,57) 이다(대비 약 9.3:1). 카드마다 갈리던 면이 사라졌다.",
    fixedBy: "4ad47868 fix(web): 가격·업그레이드의 색 역할을 제자리로 돌린다 — 잉크와 종이가 뒤바뀌어 있었다",
    mechanism: "그 커밋이 `PRICING_DECK` 의 램프 핀 22줄(`[--gray-000:var(--palette-gray-000)]` … `-rgb` 짝까지)을 통째로 걷어내고 카드 면을 `bg-gray-900` 한 값으로 모았다. 옛 회귀의 원인은 그 핀이 `bg-*`·`text-*` 유틸리티에 닿지 않는다는 것이었다 — `@theme inline` 이 값을 빌드 시점에 접어 넣어 `var(--louis-color-gray-*)` 로 컴파일되므로 제품 별칭 `--gray-*` 를 덮어도 소용이 없고, 임의값으로 직접 적은 자리에만 걸렸다. 그래서 한 카드 안에서 면과 글자가 서로 다른 시스템을 따라갔다.",
    verified: "git show 4ad47868 -- apps/web/app/mypage/upgrade/page.tsx 가 그 22줄의 삭제와 `+ \"bg-gray-900\"` 를 함께 보여준다. 커밋은 ae8fd627..5a67d692 구간 안에 있다.",
    stillMeasuredNotDesigned: "면 rgb(221,222,224) 는 실측값 그대로 옮긴 것이다. 제품 소스 주석은 이 자리를 「라이트 #f1f1f3」로 적고 있어 값이 어긋나 있는데, 그 차이의 원인은 이 생성기가 확인하지 않았다 — 지어내지 않고 실측만 적는다.",
  },
  productCommit: fixture.productCommit,
  currentPlanOutlineSource: {
    lines: currentPlanOutlineSource,
    figmaMapping: "The measured 2px solid outline with -2px offset is represented losslessly as a 2px INSIDE stroke. No live Figma variable resolves to primary-200 at 40%, so the stroke is the unbound colour role primary200Alpha40 (colorEvidence) and the runner reports it in unboundColors.",
  },
  figmaGlyphMeasurements,
  contexts: [context, mobileContext],
  redirectContracts: [
    { context, requestedRoute: redirectedRoute, finalPath: redirected.finalPath, redirected: redirected.redirected, treeEqualsCanonical: true },
    { context: mobileContext, requestedRoute: redirectedRoute, finalPath: mobileRedirected.finalPath, redirected: mobileRedirected.redirected, treeEqualsCanonical: true },
  ],
  component: {
    id: "product/upgrade-scene",
    pageId: "240:3529",
    pageName: "90 · ASSETS — 출처별 (logo · tile · icon · root · .glyph · .authored)",
    sectionName: "O · product/Upgrade plans · measured desktop scene",
    cardSetName: "Product/Upgrade Plan Card",
    mobileVisibleCardSetName: "Product/Upgrade Plan Card Visible Slice",
    mainComponentName: "Product/Desktop Upgrade Main Surface",
    sceneComponentName: "Product/Desktop Upgrade Scene",
    mobileMainComponentName: "Product/Mobile Upgrade Main Surface",
    mobileSceneComponentName: "Product/Mobile Upgrade Scene",
    dependencies: {
      gnbSet: "Product/Gnb Desktop Shell",
      gnbVariant: "Current=Upgrade",
      topBarSet: topBarVariants.desktop.set,
      topBarVariant: topBarVariants.desktop.variant,
      mobileTopBarSet: topBarVariants.mobile.set,
      mobileTopBarVariant: topBarVariants.mobile.variant,
      checkIcon: "icon/CheckCircle",
    },
    page: { rect: { width: pageRoot.rect.width, height: pageRoot.rect.height }, background: color(style(pageRoot).backgroundColor) },
    deckSource,
    main: {
      rect: relRect(main, pageRoot.rect),
      background: color(mainStyle.backgroundColor),
      radius: px(mainStyle.borderTopLeftRadius),
      effects: shadows(mainStyle.boxShadow),
      layout: desktop.layout,
      topBarText: topBarText.desktop,
      ...desktop.texts,
    },
    cardGrid: relRect(cardGrid, main.rect),
    cards: cardSpecs,
    mobile: {
      page: { rect: { width: mobilePageRoot.rect.width, height: mobilePageRoot.rect.height }, background: color(style(mobilePageRoot).backgroundColor) },
      main: {
        rect: relRect(mobileMain, mobilePageRoot.rect),
        background: color(mobileMainStyle.backgroundColor),
        radius: px(mobileMainStyle.borderTopLeftRadius),
        effects: shadows(mobileMainStyle.boxShadow),
        layout: mobile.layout,
        topBarText: topBarText.mobile,
        ...mobile.texts,
      },
      cardGrid: relRect(mobileCardGrid, mobileMain.rect),
      cards: mobileCardSpecs,
      evidenceBoundary: "Only nodes present in the 402x874 fixture are drawn. Plus, Pro, Ultra, and card actions were outside the measured viewport and are absent; the two visible cards keep their measured height and clip.",
    },
    $bindingPolicy: BINDING_POLICY,
    // 색 역할(`colors.bindings`)은 아래에서 앞에 합친다.
    bindings: {
      radius12: { collection: "Klipse Primitive", name: "radius/12" },
      radius16: { collection: "Klipse Primitive", name: "radius/16" },
      ...spacingBindings,
    },
  },
};
/* **색은 라이브 변수에 역할로 묶는다(2026-09-14, 컬렉션 이전).** 옛 계획은 은퇴한 `1 · Palette[sidebar]` ·
   `2 · Semantic[light-sidebar]` 이름을 실어 라이브에서 첫머리에 던졌고, 렌더러는 측정 색을 **옛 램프 값의 표**
   (`"65,69,76,1"` 이 없던 `byColor`)로 변수에 대 보다가 못 찾으면 고정 페인트로 떨어뜨린 뒤 스스로 감사에서 던졌다
   (Updates (132) 전제 2). 이제 역할마다 제품 선언(소스 인용 — 카드 CTA · 선물 구매 버튼은 LOUIS Button 레시피)과 라이브
   변수를 적고, 칠하는 자리마다 측정 색과 값이 같은 역할을 고른다. 값이 같은 변수가 없는 측정 색(현재 플랜 아웃라인 ·
   `gray-300` 88% 글자)은 사유와 함께 고정 역할로 싣고, 러너는 `unboundColors` 로 돌려준다. 측정 fixture 는 light 라
   `Klipse Semantic Color[Light]` 로 푼다. 대조표는 계획의 `colorEvidence` 가 갖는다. */
{
  const quote = sourceQuotes({ repoRoot, productRoot, productCommit: fixture.productCommit, fail });
  const PAGE = upgradeSourcePath;
  const PRICING = "apps/web/components/landing/sections/PricingSection.tsx";
  const GLOBALS = "apps/web/app/globals.css";
  const BUTTON = "packages/css/src/component/button.css";
  const roles = live.colorRoles({
    theme: "light",
    where: "upgrade-scene",
    roles: {
      appPageBg: { name: "color/bg-canvas", declared: [quote.product(PAGE, 68, '  "bg-[var(--app-page-bg)]!",'), quote.product(GLOBALS, 791, "  --app-page-bg: var(--louis-color-bg-canvas);")] },
      appPageBgNarrow: { name: "color/bg-surface", declared: [quote.product(PAGE, 68, '  "bg-[var(--app-page-bg)]!",'), quote.product(GLOBALS, 1068, "    --app-page-bg: var(--louis-color-bg-surface);")] },
      appMainCardBg: { name: "color/bg-surface", declared: [quote.product(PAGE, 110, '  "bg-[var(--app-main-card-bg)]",'), quote.product(GLOBALS, 792, "  --app-main-card-bg: var(--louis-color-bg-surface);")] },
      gray000: {
        name: "color/gray/000",
        declared: [quote.product(PRICING, 125, '  "m-0 mb-9 type-heading-36-semibold text-gray-000 text-balance!";'), quote.product(PRICING, 360, '  "m-0 mb-16 type-heading-36-semibold text-gray-000 text-center";')],
      },
      gray000Alpha72: {
        name: "color/gray/000-alpha/72", mix: { name: "color/gray/000", alpha: 0.72 },
        declared: [quote.product(PAGE, 177, '  "text-[rgb(var(--gray-000-rgb)/72%)]!",')],
        reason: "Product paints rgb(var(--gray-000-rgb) / 72%) — pure black at 72% in light. The live color/gray/000-alpha/72 resolves to static-black-alpha/72 (#171b22 base), so the paint binds to that same-named live step and records the RGB gap (as the app-shell plan's exact=false inks).",
      },
      mediaForegroundDark: { name: "color/media-foreground-dark", declared: [quote.product(PRICING, 90, '  "type-body-14-medium text-[var(--louis-color-media-foreground-dark)]",')] },
      bgRaised: { name: "color/bg-raised", declared: [quote.product(PAGE, 223, '  "bg-[var(--louis-color-bg-raised)]",')] },
      gray200: { name: "color/gray/200", declared: [quote.product(PAGE, 215, '  "flex flex-col text-gray-200 overflow-hidden",')] },
      gray300: {
        name: "color/gray/300",
        declared: [quote.product(PAGE, 269, '  "mt-2 flex w-full pb-12 items-end gap-4 text-gray-300",'), quote.product(PAGE, 279, 'const TIER_INCLUDES = "[margin:12px_0_0] p-0 block text-gray-300";'),
          quote.product(PAGE, 285, '  "[&_li]:[font-weight:var(--type-weight-regular)] [&_li]:text-gray-300",')],
      },
      gray300Alpha88: {
        unbound: true, mix: { name: "color/gray/300", alpha: 0.88 },
        declared: [quote.product(PAGE, 265, '  "[&_span]:text-[rgb(var(--gray-300-rgb)/88%)] [&_span]:pb-2",')],
        reason: "The price row unit paints rgb(var(--gray-300-rgb) / 88%). The live file has no gray/300 alpha ramp and no variable resolves to gray-300 (palette-gray/700 in Light) at 88%, so the text keeps the measured colour as a fixed paint.",
      },
      green500: { collection: "Klipse Primitive", name: "color/green/500", declared: [quote.product(PAGE, 299, '  "block w-9 h-9 mt-2 bg-accent-green-500",')] },
      primary200Alpha40: {
        unbound: true, mix: { collection: "Klipse Primitive", name: "color/blue/200", alpha: 0.4 },
        declared: [quote.product(PAGE, 232, '  "[outline:2px_solid_rgb(var(--primary-200-rgb)/40%)]",')],
        reason: "The current-plan outline is rgb(var(--primary-200-rgb) / 40%). The live file has no blue alpha ramp and no variable resolves to blue-200 at 40%, so the stroke keeps the measured colour as a fixed paint.",
      },
      accentInverse: { name: "color/accent-inverse", declared: [quote.product(PAGE, 716, '                      variant="inverse"'), quote.ds(BUTTON, 170, "  background: var(--louis-color-accent-inverse);")] },
      fgOnAccentInverse: { name: "color/fg-on-accent-inverse", declared: [quote.ds(BUTTON, 171, "  color: var(--louis-color-fg-on-accent-inverse);")] },
      bgInset: { name: "color/bg-inset", declared: [quote.product(PAGE, 724, "                      disabled={"), quote.ds(BUTTON, 300, "  background: var(--louis-color-bg-inset);")] },
      fgDisabled: { name: "color/fg-disabled", declared: [quote.ds(BUTTON, 285, "  color: var(--louis-color-fg-disabled);")] },
      accentSecondary: { name: "color/accent-secondary", declared: [quote.product(PAGE, 603, '                  variant="secondary"'), quote.ds(BUTTON, 178, "  background: var(--louis-color-accent-secondary);")] },
      accentSecondaryForeground: { name: "color/accent-secondary-foreground", declared: [quote.ds(BUTTON, 182, "  color: var(--louis-color-accent-secondary-foreground);")] },
      boardSurface: { name: "color/bg-canvas", annotation: "section fill behind the sets (board canvas, not a product surface)" },
      docsTitle: { name: "color/fg-primary", annotation: "documentation frame title" },
      docsNote: { name: "color/fg-secondary", annotation: "documentation frame note" },
    },
  });
  const C = plan.component;
  for (const card of [...C.cards, ...C.mobile.cards]) {
    const where = `${card.plan} ${card.viewport ?? "Desktop"}`;
    card.paint = roles.paintFor(["bgRaised"], card.background, `${where} card`);
    if (card.outline) card.outline.paint = roles.paintFor(["primary200Alpha40"], card.outline.color, `${where} outline`);
    for (const section of card.sections) {
      for (const text of section.texts ?? []) text.paint = roles.paintFor(["gray200", "gray300", "gray300Alpha88"], text.color, `${where} ${section.kind} ${text.text}`);
      for (const item of section.items ?? []) {
        if (item.icon) item.icon.paint = roles.paintFor(["green500"], item.icon.color, `${where} feature check`);
        item.text.paint = roles.paintFor(["gray300", "gray200"], item.text.color, `${where} feature ${item.text.text}`);
      }
    }
    if (card.action) {
      card.action.fillPaint = roles.paintFor(["accentInverse", "bgInset"], card.action.fill, `${where} CTA`);
      card.action.label.paint = roles.paintFor(["fgOnAccentInverse", "fgDisabled"], card.action.label.color, `${where} CTA label`);
    }
  }
  for (const [surface, name] of [[C, "desktop"], [C.mobile, "mobile"]]) {
    surface.page.paint = roles.paintFor(["appPageBg", "appPageBgNarrow"], surface.page.background, `${name} page`);
    surface.main.paint = roles.paintFor(["appMainCardBg"], surface.main.background, `${name} main`);
    surface.main.headerNotice.paint = roles.paintFor(["mediaForegroundDark"], surface.main.headerNotice.color, `${name} notice`);
    surface.main.headerTitle.paint = roles.paintFor(["gray000"], surface.main.headerTitle.color, `${name} title`);
    surface.main.headerBody.paint = roles.paintFor(["gray000Alpha72"], surface.main.headerBody.color, `${name} body`);
    if (surface.main.compareTitle) surface.main.compareTitle.paint = roles.paintFor(["gray000"], surface.main.compareTitle.color, `${name} compare title`);
    const gift = surface.main.layout.header.gift;
    if (gift) {
      gift.button.fillPaint = roles.paintFor(["accentSecondary"], gift.button.fill, `${name} gift button`);
      gift.button.text.paint = roles.paintFor(["accentSecondaryForeground"], gift.button.text.color, `${name} gift label`);
    }
  }
  const colors = roles.finish();
  C.bindings = live.assertBindings({ ...colors.bindings, ...C.bindings }, "upgrade-scene bindings");
  C.colorEvidence = colors.evidence;
  // 품은 사이드바 셸 · 상단 바 인스턴스 속의 고정 역할(그 러너 계획의 `bindings.unbound`) — 감사가 인스턴스 안에서만 받는다.
  C.nestedFixedPaints = nestedFixedPaints({ repoRoot, fail, productCommit: fixture.productCommit, plans: ["figma/product-components.plan.json", "figma/product-app-shell.plan.json"] });
}
// **러너에는 러너가 읽는 것만 싣는다.** `use_figma` 의 code 인자는 50,000자가 상한이고,
// 카드가 넷에서 다섯이 되며 페이로드가 51,555자로 그 벽을 넘었다. 넘긴 것은 산문이다 —
// `$` 로 시작하는 키(`$comment`·`$evidenceClass`·`$productRegressionResolved`·`$measurement`·
// `$lineNaturalWidths`)는 **전부 기록용**이고 템플릿이 한 번도 읽지 않는다.
// 그래서 러너 사본에서만 걷어낸다. `plan.json` 은 산문을 그대로 들고 있으므로 증거는 줄지 않고,
// 값을 반올림하거나 노드를 빼는 식으로 그림을 줄이지도 않는다.
const stripAnnotations = (value) => {
  if (Array.isArray(value)) return value.map(stripAnnotations);
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).filter(([key]) => !key.startsWith("$")).map(([key, entry]) => [key, stripAnnotations(entry)]),
    );
  }
  return value;
};
// 증거 칸(rect · position · 선언 원문 · 보이는 교차)은 계획에만 남기고 러너에는 싣지 않는다 — 렌더러는 흐름으로 짓는다.
const runnerPlan = stripAnnotations(plan);
{
  const dropText = (text) => { if (text) delete text.rect; };
  for (const card of [...runnerPlan.component.cards, ...runnerPlan.component.mobile.cards]) {
    delete card.position; delete card.visibleIntersection; delete card.minHeightDeclared; delete card.route;
    for (const section of card.sections) {
      for (const text of section.texts ?? []) dropText(text);
      for (const item of section.items ?? []) dropText(item.text);
    }
    if (card.action) { delete card.action.rect; dropText(card.action.label); }
  }
  for (const surface of [runnerPlan.component.main, runnerPlan.component.mobile.main]) {
    for (const key of ["headerNotice", "headerTitle", "headerBody", "compareTitle"]) dropText(surface[key]);
    if (surface.layout.header.gift) { dropText(surface.layout.header.gift.button.text); delete surface.layout.header.gift.button.fill; }
    delete surface.layout.container.width.declared;
    delete surface.layout.header.maxWidthDeclared;
    delete surface.layout.header.bodyMaxWidthDeclared;
    delete surface.layout.header.notice.heightDeclared;
    if (surface.layout.header.gift) delete surface.layout.header.gift.paddingTopDeclared;
    delete surface.layout.deck.declared;
  }
  // **글자 스타일은 표 하나로 모은다.** 카드 다섯 · 조각 둘 · 헤더의 글자 97개가 스타일 15벌을 반복해, 각 글자에 크기 ·
  // 굵기 · 행간 · 자간 · 정렬 · 색 역할을 따로 실으면 러너가 50,000자 벽을 넘는다. 글자는 표의 번호(`s`)만 들고, 렌더러가 펼친다.
  const typeStyles = [];
  const keyOf = (text) => JSON.stringify([text.fontSize, text.fontWeight, text.lineHeight, text.letterSpacing, text.textAlign, text.paint]);
  const intern = (text) => {
    if (!text) return;
    // 색은 역할 이름(`paint`)으로 싣는다 — 측정 색은 `colorEvidence` 가 대조를 끝냈다.
    const style = { fontSize: text.fontSize, fontWeight: text.fontWeight, lineHeight: text.lineHeight, letterSpacing: text.letterSpacing, textAlign: text.textAlign, paint: text.paint };
    let index = typeStyles.findIndex((entry) => keyOf(entry) === keyOf(style));
    if (index < 0) index = typeStyles.push(style) - 1;
    for (const key of Object.keys(style)) delete text[key];
    delete text.color;
    text.s = index;
  };
  for (const card of [...runnerPlan.component.cards, ...runnerPlan.component.mobile.cards]) {
    delete card.background;
    for (const section of card.sections) {
      for (const text of section.texts ?? []) intern(text);
      for (const item of section.items ?? []) {
        intern(item.text);
        if (item.icon) { delete item.icon.color; delete item.icon.asset; }
      }
    }
    if (card.action) { intern(card.action.label); delete card.action.fill; }
    if (card.outline) delete card.outline.color;
  }
  for (const surface of [runnerPlan.component.main, runnerPlan.component.mobile.main]) {
    for (const key of ["headerNotice", "headerTitle", "headerBody", "compareTitle"]) intern(surface[key]);
    if (surface.layout.header.gift) intern(surface.layout.header.gift.button.text);
    delete surface.background;
  }
  runnerPlan.component.typeStyles = typeStyles;
  delete runnerPlan.component.cardGrid;
  delete runnerPlan.component.mobile.cardGrid;
  delete runnerPlan.component.colorEvidence;
  for (const entry of Object.values(runnerPlan.component.bindings.unbound ?? {})) delete entry.reason;
  for (const surface of [runnerPlan.component, runnerPlan.component.mobile]) delete surface.page.background;
  delete runnerPlan.component.deckSource;
  delete runnerPlan.currentPlanOutlineSource;
  delete runnerPlan.figmaGlyphMeasurements;
}
const readableDraw =
  "// Generated by scripts/build-figma-product-upgrade-scene.mjs. Do not edit by hand.\n" +
  "// Pass this file verbatim to use_figma. It creates only the measured desktop upgrade inventory/scene and mobile visible slice.\n" +
  "// Annotation-only `$` keys live in figma/product-upgrade-scene.plan.json; the runner payload carries only what it reads.\n" +
  `const PLAN=${JSON.stringify(runnerPlan)};\n` +
  readFileSync(resolve(repoRoot, RENDERER_LIB), "utf8") +
  readFileSync(resolve(repoRoot, INSTANCE_TEXT_LIB), "utf8") +
  readFileSync(templatePath, "utf8");
const wrappedDraw = transformSync(`async function __figmaRunner__(){${readableDraw}}`, {
  minify: true,
  target: "es2022",
}).code.trim();
const wrapperPrefix = "async function __figmaRunner__(){";
if (!wrappedDraw.startsWith(wrapperPrefix) || !wrappedDraw.endsWith("}")) fail("unexpected esbuild wrapper output");
const draw =
  "// Generated and minified by scripts/build-figma-product-upgrade-scene.mjs. Do not edit by hand.\n" +
  wrappedDraw.slice(wrapperPrefix.length, -1);
if (draw.length > 50_000) fail(`Figma runner exceeds connector limit: ${draw.length}`);
const expected = [
  { absolute: planPath, expected: `${JSON.stringify(plan, null, 2)}\n` },
  { absolute: drawPath, expected: draw },
];
if (checkOnly) {
  for (const entry of expected) {
    let current = "";
    try { current = readFileSync(entry.absolute, "utf8"); } catch { fail(`missing generated output ${entry.absolute.slice(repoRoot.length + 1)}`); }
    if (current !== entry.expected) fail(`generated output drift: ${entry.absolute.slice(repoRoot.length + 1)}`);
  }
} else atomicWriteBatch(expected);
console.log(`[figma-product-upgrade-scene] ${checkOnly ? "checked" : "built"} @ ${fixture.productCommit.slice(0, 8)}: ${cardSpecs.length} desktop cards + ${mobileCardSpecs.length} mobile visible slices + desktop/mobile scenes · checkout redirects asserted`);
