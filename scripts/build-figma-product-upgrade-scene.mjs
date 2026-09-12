import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { transformSync } from "esbuild";
import { atomicWriteBatch } from "./lib/atomic-output.mjs";

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
  const command = `git -C ${productRoot} show ${fixture.productCommit}:${path}`;
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
// use_figma 에서 각 실제 Pretendard font/style/size/line-height/letter-spacing 으로
// WIDTH_AND_HEIGHT 임시 TextNode 를 세워 자연 폭을 읽고 모두 삭제했다. 브라우저의 left anchor 를
// 보존하면서 Figma font engine 에서만 생기는 가격·credit 줄바꿈을 막는 Figma 측 자연 폭이다.
//
// **2026-09-05 전량 재측정.** 옛 표를 한 줄도 물려받지 못한 이유가 둘이다 —
// ① `58a85b13 feat(payments): Lite 티어를 추가하고 Basic·Max 를 Plus·Ultra 로 개명한다` 가
//    티어를 넷에서 다섯으로 늘리며 가격·크레딧 문자열을 통째로 바꿨다(35,900 → 12,900 …).
// ② 가격과 "Free" 의 굵기가 medium(500) → semibold(600) 으로 올라가, 글자가 같은 "Free" 조차
//    폭이 달라졌다(데스크톱 71 → 72 · 모바일 55 → 56).
//
// 표가 두 벌인 것도 이번 앵커에서 생긴 차이다. 카드가 316 → 256.8 로 좁아지면서 **데스크톱에서도**
// 가격 행과 "per month" 가 브라우저에서 이미 두 줄로 접힌다(가격 상자 159 · 높이 48.6×2).
//   · 한 줄로 놓이는 글자 → `figmaWidth`. 상자를 자연 폭까지 넓혀 Figma 에서만 생기는 접힘을 막는다.
//   · 이미 접힌 글자 → 넓히면 **접힘이 사라져** 브라우저와 달라진다. 폭은 실측 상자 그대로 두고,
//     줄별 자연 폭만 증거로 남겨 같은 자리에서 같은 두 줄이 되는지 아래 assertLineFit 이 확인한다.
const desktopFigmaGlyphMeasurements = {
  Free: 72,
  "800": 37,
  "5,000": 53,
  "16,500": 62,
  "30,000": 66,
  "48,000": 66,
  credits: 62,
};
const desktopFigmaLineMeasurements = {
  "12,900 KRW": { "12,900": 113, KRW: 80 },
  "29,900 KRW": { "29,900": 119, KRW: 80 },
  "49,900 KRW": { "49,900": 120, KRW: 80 },
  "74,900 KRW": { "74,900": 116, KRW: 80 },
  "per month": { per: 24, month: 46 },
};
const mobileFigmaGlyphMeasurements = {
  Free: 56,
};
const mobileFigmaLineMeasurements = {
  "12,900 KRW": { "12,900": 88, KRW: 62 },
  "per month": { per: 21, month: 40 },
};
const figmaGlyphMeasurements = {
  $measurement: "use_figma temporary TextNode natural bounds; exact per-string typography; measured 2026-09-05 and nodes removed",
  desktop: desktopFigmaGlyphMeasurements,
  desktopLines: desktopFigmaLineMeasurements,
  mobile: mobileFigmaGlyphMeasurements,
  mobileLines: mobileFigmaLineMeasurements,
};
// 접힌 글자는 **줄마다** 실측 상자 안에 들어가야 브라우저와 같은 지점에서 접힌다. 한 줄이라도
// 넘치면 Figma 는 다른 곳에서 접거나 세 줄이 되므로, 그때는 값을 옮기지 말고 다시 재야 한다.
const assertLineFit = (spec, lines, where) => {
  for (const [line, width] of Object.entries(lines)) {
    if (width > spec.rect.width + 0.5) fail(`${where}: line ${JSON.stringify(line)} natural width ${width} overflows measured box ${spec.rect.width}`);
  }
};

if (redirected.finalPath !== route || !redirected.redirected || JSON.stringify(redirected.tree) !== JSON.stringify(screen.tree)) {
  fail(`${redirectedRoute} no-query redirect no longer matches ${route}`);
}
if (
  mobileRedirected.finalPath !== route || !mobileRedirected.redirected ||
  JSON.stringify(mobileRedirected.tree) !== JSON.stringify(mobileScreen.tree)
) fail(`${mobileContext} ${redirectedRoute} no-query redirect no longer matches ${route}`);
const pageRoot = node("body.1");
const mainOuter = node("body.1.0.0.1");
const main = node("body.1.0.0.1.0");
const topBar = node("body.1.0.0.1.0.0.0.0");
const content = node("body.1.0.0.1.0.0.1");
const cardGrid = node("body.1.0.0.1.0.0.1.1");
const mainStyle = style(main);
if (
  pageRoot.rect.width !== 1920 || pageRoot.rect.height !== 1080 ||
  // **1628×1056 → 1632×1064 (2026-09-10 재고정).** 앱 셸 링 패딩이 12 → 8 로 줄어
  // 메인 카드가 가로 +4 · 세로 +8 만큼 자랐다(`--app-gnb-main-inline-padding-end` ·
  // `--app-gnb-safe-top` · `--app-gnb-rail-padding-bottom`). 바깥(1640)과 카드 격자
  // (1300×608.1875)는 그대로다 — 자란 것은 카드 안쪽 하나뿐이고, 그것이 이 변경의 전부다.
  mainOuter.rect.width !== 1640 || main.rect.width !== 1632 || main.rect.height !== 1064 ||
  // 카드 덱이 넷에서 **다섯**으로 늘며 높이가 560 → 608.1875 로 자랐다.
  // `58a85b13` 이 Lite 티어를 넣고 Basic·Max 를 Plus·Ultra 로 개명했고, PRICING_DECK 의
  // 격자가 `repeat(5,minmax(0,1fr))` 라 폭 1300 은 그대로인 채 칸이 다섯으로 쪼개졌다.
  // 높이는 `min-h-[560px]` 을 내용이 넘어선 결과다 — 칸이 좁아져 가격·특징 줄이 더 접힌다.
  cardGrid.rect.width !== 1300 || cardGrid.rect.height !== 608.1875
) fail("desktop upgrade scene geometry changed");

const cardRoots = screen.tree.filter((entry) => entry.parentPath === cardGrid.path && entry.tag === "article");
if (cardRoots.length !== 5) fail(`expected five measured plan cards, got ${cardRoots.length}`);
const cardSpecs = cardRoots.map((root) => {
  const rootStyle = style(root);
  const descendants = screen.tree.filter((entry) => entry.path.startsWith(`${root.path}.`));
  // 카드의 CTA 는 **역할**로 찾는다 — 카드 안에 button 은 이것 하나뿐이다.
  // 예전엔 `tag === "button" && entry.ownText` 로 찾았는데, 제품이 이 CTA 를 LOUIS
  // `Button` 컴포넌트로 바꾸면서(apps/web/components/ui/Button.tsx) 글자가 button 자신이
  // 아니라 `<span class="louis-button__label">` 자식으로 내려갔다. 그래서 「글자를 가진
  // button」이 사라져 경로 탐색이 실패했다. 인덱스 경로를 새로 못박는 대신 조건에서
  // ownText 를 떼고, 글자는 button 서브트리에서 읽는다 — 라벨이 다시 button 자신으로
  // 돌아오든 또 한 겹 감싸이든 같은 코드가 견딘다.
  const button = descendants.find((entry) => entry.tag === "button") ?? fail(`missing card button ${root.path}`);
  const buttonStyle = style(button);
  const buttonLabel = button.ownText
    ? button
    : descendants.find((entry) => entry.path.startsWith(`${button.path}.`) && entry.ownText) ?? fail(`missing card button label ${root.path}`);
  const texts = descendants
    // 경계에 `.` 을 붙여 비교한다 — 형제가 10 개를 넘으면 `…0.5` 가 `…0.50` 의 접두사가 된다.
    .filter((entry) => entry.ownText && entry.path !== button.path && !entry.path.startsWith(`${button.path}.`))
    .map((entry) => {
      const spec = textSpec(entry, root.rect);
      const lines = desktopFigmaLineMeasurements[spec.text];
      if (lines) {
        assertLineFit(spec, lines, `desktop ${root.path} ${JSON.stringify(spec.text)}`);
        return { ...spec, $lineNaturalWidths: lines };
      }
      return desktopFigmaGlyphMeasurements[spec.text] ? { ...spec, figmaWidth: desktopFigmaGlyphMeasurements[spec.text] } : spec;
    });
  const icons = descendants
    .filter((entry) => style(entry).maskImage.includes("/icons/CheckCircle.svg"))
    .map((entry) => ({ rect: relRect(entry, root.rect), color: color(style(entry).backgroundColor), asset: "/icons/CheckCircle.svg" }));
  // 제품 정본은 `app/lib/payments/toss/plans.ts` 의 `UpgradePlanCode`
  // = "trial" | "lite" | "plus" | "pro" | "ultra" 이고, `max` 는 LegacyUpgradePlanCode 로
  // 내려가 `ultra` 로 매핑된다. 화면에 찍히는 것은 그 `tierName` 이다(58a85b13).
  const title = texts.find((entry) => ["Trial", "Lite", "Plus", "Pro", "Ultra"].includes(entry.text))?.text ?? fail(`missing plan title ${root.path}`);
  return {
    plan: title,
    route,
    rect: { width: root.rect.width, height: root.rect.height },
    position: relRect(root, main.rect),
    padding: { top: px(rootStyle.paddingTop), right: px(rootStyle.paddingRight), bottom: px(rootStyle.paddingBottom), left: px(rootStyle.paddingLeft) },
    radius: px(rootStyle.borderTopLeftRadius),
    background: color(rootStyle.backgroundColor),
    effects: shadows(rootStyle.boxShadow),
    outline: outline(rootStyle),
    texts,
    icons,
    action: {
      text: buttonLabel.ownText,
      rect: relRect(button, root.rect),
      radius: px(buttonStyle.borderTopLeftRadius),
      fill: color(buttonStyle.backgroundColor),
      opacity: Number(buttonStyle.opacity),
      // 라벨의 타이포·색은 글자를 실제로 가진 노드에서 읽는다. 렌더러는 이 spec 의 rect 를
      // 쓰지 않고 action 프레임 박스로 덮어 세로 가운데 정렬하므로(템플릿 makeFixedText),
      // button 이든 label span 이든 배치 결과는 같다.
      label: textSpec(buttonLabel, root.rect),
    },
  };
});
// 다섯 칸 격자의 한 칸 — 1300 = 256.7969×5 + 4×4. `gap-6`(12px)에서 `gap-2`(4px)로 좁힌 것은
// `13e5f570 feat(pricing): 플랜 카드를 디자인 시스템 값으로 맞추고 할인가를 표시한다` 이고,
// 같은 커밋이 반경도 `rounded-24` → `rounded-12` 로 내렸다(실측 12px 이 그 결과다).
// 높이 608.1875 는 가장 긴 카드(Plus)의 내용 높이이고 `items-stretch` 로 다섯이 함께 늘어난다.
if (cardSpecs.some((entry) => entry.rect.width !== 256.7969 || entry.rect.height !== 608.1875)) fail("plan card size drift");
// 현재 플랜 카드의 2px 아웃라인. 제품이 폐지된 accent-ultra 램프를 떠나 `--primary-200`
// (= LOUIS blue-200, rgb 163 213 255)으로, 알파도 LOUIS 16단 스케일에 맞춰 42% → 40% 로
// 스냅했다. 값이 바뀐 것은 제품 쪽 결정이므로 여기서는 실측을 따라간다.
// 근거 인용은 아래 currentPlanOutlineSource 가 같은 커밋의 소스 줄로 다시 확인한다.
const expectedCurrentPlanOutline = {
  width: 2,
  style: "solid",
  color: [163 / 255, 213 / 255, 255 / 255, 0.4],
  offset: -2,
  figmaMapping: "2px INSIDE stroke",
};
if (
  JSON.stringify(cardSpecs[0].outline) !== JSON.stringify(expectedCurrentPlanOutline) ||
  cardSpecs.slice(1).some((entry) => entry.outline !== null)
) fail("desktop current-plan outline drift");

// **헤더가 다시 평평해졌다.** 그전에는 이벤트 알약이 제목 옆에 서서 제목·본문이 한 겹 더
// 들어가 있었는데(`6c5af2d9`), 제품이 알약을 **제목 위로** 올리며 그 겹을 걷었다. 소스가
// 사유를 적는다 — 알약과 제목이 한 행을 다투다 `flex-wrap` 으로 알약이 다음 줄로 내려가면
// 헤더 아래 여백이 알약 위에 남아 요금제 카드 상단을 파고들었다(UpgradePlanPageClient.tsx
// `<header className={PRICING_HEADER}>` 위 주석). 지금 `<header>` 의 직속 자식은 넷이다:
//   .0 알약(p>span) · .1 제목(h2) · .2 본문(p) · .3 선물 구매(div>button>span)
// **자리번호만 옮기면 안 된다** — 옛 코드는 «글자 없는 header» 를 텍스트로 읽어 조용히 빈
// 문자열을 냈다. 그래서 태그로 확인하고 옮긴다(실측: desktop p·h2·p·div, mobile 같음).
//
// **아직 안 그리는 것 하나** — `.3` 의 선물 구매 버튼(KLI-264)이다. 실측 장면에는 보이는데
// 이 생성기의 계획에 슬롯이 없다. 텍스트 셋만 옮겨 생성기를 되살리고, 버튼은 다음 회차에서
// 슬롯과 함께 넣는다. 여기 적어 두는 이유는 적지 않으면 「없는 것」이 되기 때문이다.
const headerNotice = textSpec(node("body.1.0.0.1.0.0.1.0.0"), main.rect);
const headerTitle = textSpec(node("body.1.0.0.1.0.0.1.0.1"), main.rect);
const headerBody = textSpec(node("body.1.0.0.1.0.0.1.0.2"), main.rect);
const compareTitle = textSpec(node("body.1.0.0.1.0.0.1.2.0.0"), main.rect);

const mobilePageRoot = mobileNode("body.1");
const mobileMainOuter = mobileNode("body.1.0.0.1");
const mobileMain = mobileNode("body.1.0.0.1.0");
const mobileTopBar = mobileNode("body.1.0.0.1.0.0.0.0");
const mobileContent = mobileNode("body.1.0.0.1.0.0.1");
const mobileCardGrid = mobileNode("body.1.0.0.1.0.0.1.1");
const mobileMainStyle = style(mobileMain);
if (
  mobilePageRoot.rect.width !== 402 || mobilePageRoot.rect.height !== 874 ||
  mobileMainOuter.rect.width !== 402 || mobileMain.rect.width !== 402 || mobileMain.rect.height !== 874 ||
  // **좌우가 16 → 6 으로, 폭이 370 → 390 으로 넓어졌다 (제품 094c336b, 2026-09-09).**
  // 앱 셸 링을 12 에서 8 로 내리며 ≤719 의 `--app-gnb-main-inline-padding` 도 12 → 6 이 됐다:
  // 402 − 6 − 6 = 390. 형제 생성기 checkout-status·payment-scenes 가 같은 회차를 이미 옮겼다.
  //
  // 높이는 **넓어진 결과**다. 폭이 20 늘어 같은 글이 덜 접히므로 문서가 5748.9531 → 5651.75
  // 로 «줄었다». 격자도 1728.7813 → 1668.7813 이고, 시작이 449.3906 → 412.1875 로 37.2 올라온
  // 것은 그 위 헤더가 덜 접힌 만큼이다(알약은 여전히 제목 위 한 줄을 차지한다).
  mobileTopBar.rect.x !== 6 || mobileTopBar.rect.width !== 390 || mobileTopBar.rect.height !== 53 ||
  mobileContent.rect.x !== 6 || mobileContent.rect.y !== 53 || mobileContent.rect.width !== 390 || mobileContent.rect.height !== 5651.75 ||
  mobileCardGrid.rect.x !== 6 || mobileCardGrid.rect.y !== 412.1875 || mobileCardGrid.rect.width !== 390 || mobileCardGrid.rect.height !== 1668.7813
) fail("mobile upgrade visible-scene geometry changed");

const mobileCardRoots = mobileScreen.tree.filter((entry) => entry.parentPath === mobileCardGrid.path && entry.tag === "article");
if (mobileCardRoots.length !== 2) fail(`expected exactly two viewport-observed mobile plan cards, got ${mobileCardRoots.length}`);
const mobileCardSpecs = mobileCardRoots.map((root) => {
  const rootStyle = style(root);
  const descendants = mobileScreen.tree.filter((entry) => entry.path.startsWith(`${root.path}.`));
  if (descendants.some((entry) => entry.tag === "button")) fail(`mobile fixture unexpectedly contains an action ${root.path}`);
  const texts = descendants.filter((entry) => entry.ownText).map((entry) => {
    const spec = textSpec(entry, root.rect);
    // "Free" 는 모바일이 heading-28 이라 데스크톱(36)과 폭이 다르다 — **먼저** 걸러낸다.
    if (spec.text === "Free") return { ...spec, figmaWidth: mobileFigmaGlyphMeasurements.Free };
    // 크레딧 행은 모바일도 body-20 medium 그대로라 데스크톱 측정을 함께 쓴다(같은 타이포).
    if (desktopFigmaGlyphMeasurements[spec.text]) return { ...spec, figmaWidth: desktopFigmaGlyphMeasurements[spec.text] };
    const lines = mobileFigmaLineMeasurements[spec.text];
    if (lines) {
      assertLineFit(spec, lines, `mobile ${root.path} ${JSON.stringify(spec.text)}`);
      return { ...spec, $lineNaturalWidths: lines };
    }
    return spec;
  });
  const icons = descendants
    .filter((entry) => style(entry).maskImage.includes("/icons/CheckCircle.svg"))
    .map((entry) => ({ rect: relRect(entry, root.rect), color: color(style(entry).backgroundColor), asset: "/icons/CheckCircle.svg" }));
  const title = texts.find((entry) => ["Trial", "Lite"].includes(entry.text))?.text ?? fail(`missing mobile plan title ${root.path}`);
  return {
    plan: title,
    route,
    viewport: "MobileVisibleSlice",
    rect: { width: root.rect.width, height: root.rect.height },
    position: relRect(root, mobileMain.rect),
    visibleIntersection: {
      top: Math.max(0, mobilePageRoot.rect.y - root.rect.y),
      bottom: Math.min(root.rect.height, mobilePageRoot.rect.y + mobilePageRoot.rect.height - root.rect.y),
    },
    padding: { top: px(rootStyle.paddingTop), right: px(rootStyle.paddingRight), bottom: px(rootStyle.paddingBottom), left: px(rootStyle.paddingLeft) },
    radius: px(rootStyle.borderTopLeftRadius),
    background: color(rootStyle.backgroundColor),
    effects: shadows(rootStyle.boxShadow),
    outline: outline(rootStyle),
    texts,
    icons,
    actionMeasured: false,
  };
});
if (
  // 두 번째 카드가 Basic → **Lite** 다. 개명이 아니라 **새 티어가 2번 자리에 끼어든 것**이다
  // — 옛 Basic 은 Plus 로 이름이 바뀌어 3번으로 밀렸고, 모바일 뷰포트에는 안 잡힌다(58a85b13).
  // 카드 상자 179×679.5938 → 183×592.5938: 폭은 격자 2열의 gap 이 좁아진 만큼 늘고,
  // 높이는 다섯 티어로 특징 목록이 짧아진 만큼 줄었다.
  mobileCardSpecs.map((entry) => entry.plan).join(",") !== "Trial,Lite" ||
  // 카드 상자 183×592.5938 → **193×572.5938** (제품 094c336b). 격자 폭이 370 → 390 으로
  // 20 넓어졌고 2열이라 카드마다 +10, 그만큼 특징 줄이 덜 접혀 높이가 20 줄었다.
  mobileCardSpecs.some((entry) => entry.rect.width !== 193 || entry.rect.height !== 572.5938 || entry.padding.left !== 12) ||
  JSON.stringify(mobileCardSpecs[0].outline) !== JSON.stringify(expectedCurrentPlanOutline) ||
  mobileCardSpecs[1].outline !== null
) fail("mobile upgrade card visible-slice drift");

// 모바일도 같은 구조다(위 주석 참조).
const mobileHeaderNotice = textSpec(mobileNode("body.1.0.0.1.0.0.1.0.0"), mobileMain.rect);
const mobileHeaderTitle = textSpec(mobileNode("body.1.0.0.1.0.0.1.0.1"), mobileMain.rect);
const mobileHeaderBody = textSpec(mobileNode("body.1.0.0.1.0.0.1.0.2"), mobileMain.rect);
// 화면 본체가 `page.tsx` 에서 이 파일로 통째로 옮겨 갔다 —
// `bdd47792 fix(pricing): 가격 조회가 실패해도 페이지가 죽지 않게 한다` 가 서버 껍데기만
// page.tsx 에 남기고 783줄을 새 파일로 뽑았다(`git log --diff-filter=A` 로 이 파일의 추가
// 커밋이 bdd47792 하나임을 확인했다). 남은 page.tsx 는 getPlanPricing() 을 부르는 17줄이다.
const upgradeSourcePath = "apps/web/app/mypage/upgrade/UpgradePlanPageClient.tsx";
// 좌표는 내용으로 다시 찾았다 — 두 문자열 모두 이 파일에서 유일하고 `TIER_CARD_CURRENT`
// 안에서 서로 붙어 있다(`git show 5a67d692:…UpgradePlanPageClient.tsx | grep -n outline`
// 이 219·220 만 준다). 파일이 바뀌었을 뿐 문자열은 한 글자도 안 움직였다.
const currentPlanOutlineSource = [
  sourceQuote(upgradeSourcePath, 232, '  "[outline:2px_solid_rgb(var(--primary-200-rgb)/40%)]",'),
  sourceQuote(upgradeSourcePath, 233, '  "[outline-offset:-2px]",'),
];
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
    figmaMapping: "The measured 2px solid outline with -2px offset is represented losslessly as a 2px INSIDE stroke. No exact local Figma color variable exists, so this remains a measured product-only fixed paint.",
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
      topBarSet: "Product/Desktop App Top Bar",
      topBarVariant: "Content=Subscription, Breadcrumb=Trail, Back=True, Divider=On",
      mobileTopBarSet: "Product/Mobile App Top Bar",
      mobileTopBarVariant: "Width=Inset, Breadcrumb=Trail, Back=True, Divider=On",
      checkIcon: "icon/CheckCircle",
    },
    page: { rect: { width: pageRoot.rect.width, height: pageRoot.rect.height }, background: color(style(pageRoot).backgroundColor) },
    main: {
      rect: relRect(main, pageRoot.rect),
      width: main.rect.width,
      height: main.rect.height,
      background: color(mainStyle.backgroundColor),
      radius: px(mainStyle.borderTopLeftRadius),
      effects: shadows(mainStyle.boxShadow),
      topBar: relRect(topBar, main.rect),
      content: relRect(content, main.rect),
      headerTitle,
      headerBody,
      headerNotice,
      compareTitle,
    },
    cardGrid: relRect(cardGrid, main.rect),
    cards: cardSpecs,
    mobile: {
      page: { rect: { width: mobilePageRoot.rect.width, height: mobilePageRoot.rect.height }, background: color(style(mobilePageRoot).backgroundColor) },
      main: {
        rect: relRect(mobileMain, mobilePageRoot.rect),
        width: mobileMain.rect.width,
        height: mobileMain.rect.height,
        background: color(mobileMainStyle.backgroundColor),
        radius: px(mobileMainStyle.borderTopLeftRadius),
        effects: shadows(mobileMainStyle.boxShadow),
        topBar: relRect(mobileTopBar, mobileMain.rect),
        content: relRect(mobileContent, mobileMain.rect),
        headerTitle: mobileHeaderTitle,
        headerBody: mobileHeaderBody,
        headerNotice: mobileHeaderNotice,
      },
      cardGrid: relRect(mobileCardGrid, mobileMain.rect),
      cards: mobileCardSpecs,
      evidenceBoundary: "Only nodes present in the 402x874 fixture are drawn. Plus, Pro, Ultra, and card actions were outside the measured viewport and are absent.",
    },
    bindings: {
      paletteCollection: "1 · Palette",
      paletteMode: "sidebar",
      semanticCollection: "2 · Semantic",
      semanticMode: "light-sidebar",
      primitiveCollection: "Klipse Primitive",
      primitiveMode: "Base",
      appBackground: { collection: "1 · Palette", name: "palette/gray-200" },
      surface: { collection: "1 · Palette", name: "palette/gray-50" },
      cardSurface: { collection: "1 · Palette", name: "palette/gray-000" },
      black: { collection: "1 · Palette", name: "palette/gray-1000" },
      gray900: { collection: "1 · Palette", name: "palette/gray-900" },
      gray800: { collection: "1 · Palette", name: "palette/gray-800" },
      gray700: { collection: "1 · Palette", name: "palette/gray-700" },
      gray600: { collection: "1 · Palette", name: "palette/gray-600" },
      gray500: { collection: "1 · Palette", name: "palette/gray-500" },
      gray500a90: { collection: "2 · Semantic", name: "palette/gray-500 · a90" },
      // 아래 둘은 위 $productRegression 이 설명하는 카드 글자색을 받는다. 이름은 형제 계획
      // (product-checkout-status · product-payment-scenes · product-components)이 같은 컬렉션에서
      // 이미 쓰고 있는 것만 골랐다 — 이 저장소에는 "1 · Palette" 카탈로그 readback 이 없어
      // 존재를 확인할 다른 방법이 없다. 확인 못 한 이름은 넣지 않았고, 그 색들은 템플릿에서
      // 실측 고정 페인트로 떨어진다(palette/gray-150 · gray-300 · primary-500 · gray-500 a88).
      gray200: { collection: "1 · Palette", name: "palette/gray-200" },
      gray100: { collection: "1 · Palette", name: "palette/gray-100" },
      blackA72: { collection: "2 · Semantic", name: "gray/000 · a72" },
      mint500: { collection: "1 · Palette", name: "accent/mint/500" },
      radius12: { collection: "Klipse Primitive", name: "radius/12" },
      radius16: { collection: "Klipse Primitive", name: "radius/16" },
    },
  },
};
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
const readableDraw =
  "// Generated by scripts/build-figma-product-upgrade-scene.mjs. Do not edit by hand.\n" +
  "// Pass this file verbatim to use_figma. It creates only the measured desktop upgrade inventory/scene and mobile visible slice.\n" +
  "// Annotation-only `$` keys live in figma/product-upgrade-scene.plan.json; the runner payload carries only what it reads.\n" +
  `const PLAN=${JSON.stringify(stripAnnotations(plan))};\n` +
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
