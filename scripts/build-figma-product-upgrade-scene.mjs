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
// 2026-08-24 use_figma에서 각 실제 Pretendard font/style/size/line-height/letter-spacing으로
// WIDTH_AND_HEIGHT 임시 TextNode를 측정하고 모두 삭제했다. 브라우저의 left anchor를 보존하면서
// Figma font engine에서만 생기는 가격·credit 줄바꿈을 막는 Figma 측 자연 폭이다.
const desktopFigmaGlyphMeasurements = {
  Free: 71,
  "35,900 KRW": 201,
  "59,900 KRW": 201,
  "89,900 KRW": 202,
  "per month": 73,
  "200": 37,
  "1,800": 50,
  "3,000": 54,
  "4,500": 54,
  credits: 62,
};
const mobileFigmaGlyphMeasurements = {
  Free: 55,
  "35,900": 91,
  KRW: 61,
  per: 21,
  month: 40,
};
const figmaGlyphMeasurements = {
  $measurement: "use_figma temporary TextNode natural bounds; exact per-string typography; measured 2026-08-24 and nodes removed",
  desktop: desktopFigmaGlyphMeasurements,
  mobile: mobileFigmaGlyphMeasurements,
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
  mainOuter.rect.width !== 1640 || main.rect.width !== 1628 || main.rect.height !== 1056 ||
  cardGrid.rect.width !== 1300 || cardGrid.rect.height !== 560
) fail("desktop upgrade scene geometry changed");

const cardRoots = screen.tree.filter((entry) => entry.parentPath === cardGrid.path && entry.tag === "article");
if (cardRoots.length !== 4) fail(`expected four measured plan cards, got ${cardRoots.length}`);
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
      return desktopFigmaGlyphMeasurements[spec.text] ? { ...spec, figmaWidth: desktopFigmaGlyphMeasurements[spec.text] } : spec;
    });
  const icons = descendants
    .filter((entry) => style(entry).maskImage.includes("/icons/CheckCircle.svg"))
    .map((entry) => ({ rect: relRect(entry, root.rect), color: color(style(entry).backgroundColor), asset: "/icons/CheckCircle.svg" }));
  const title = texts.find((entry) => ["Trial", "Basic", "Pro", "Max"].includes(entry.text))?.text ?? fail(`missing plan title ${root.path}`);
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
if (cardSpecs.some((entry) => entry.rect.width !== 316 || entry.rect.height !== 560)) fail("plan card size drift");
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

const headerTitle = textSpec(node("body.1.0.0.1.0.0.1.0.0"), main.rect);
const headerBody = textSpec(node("body.1.0.0.1.0.0.1.0.1"), main.rect);
const compareTitle = textSpec(node("body.1.0.0.1.0.0.1.2.0.0"), main.rect);

// 모바일 숫자 셋이 정확히 카드 높이 −14 · 2행이라 −28 씩 움직였다. 14px 은 플랜 CTA 가
// 제품 자체 `h-23`(46px)에서 LOUIS Button md(32px)로 통일된 차이다. 데스크톱 카드는
// `min-h-[560px]` 이 잡아 주므로 560 그대로다. 값을 지어내지 않고 실측 그대로 옮긴다.
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
  mobileTopBar.rect.x !== 16 || mobileTopBar.rect.width !== 370 || mobileTopBar.rect.height !== 53 ||
  mobileContent.rect.x !== 16 || mobileContent.rect.y !== 53 || mobileContent.rect.width !== 370 || mobileContent.rect.height !== 3269.375 ||
  mobileCardGrid.rect.x !== 16 || mobileCardGrid.rect.y !== 401.3906 || mobileCardGrid.rect.width !== 370 || mobileCardGrid.rect.height !== 1166.1875
) fail("mobile upgrade visible-scene geometry changed");

const mobileCardRoots = mobileScreen.tree.filter((entry) => entry.parentPath === mobileCardGrid.path && entry.tag === "article");
if (mobileCardRoots.length !== 2) fail(`expected exactly two viewport-observed mobile plan cards, got ${mobileCardRoots.length}`);
const mobileCardSpecs = mobileCardRoots.map((root) => {
  const rootStyle = style(root);
  const descendants = mobileScreen.tree.filter((entry) => entry.path.startsWith(`${root.path}.`));
  if (descendants.some((entry) => entry.tag === "button")) fail(`mobile fixture unexpectedly contains an action ${root.path}`);
  const texts = descendants.filter((entry) => entry.ownText).map((entry) => {
    const spec = textSpec(entry, root.rect);
    if (spec.text === "Free") return { ...spec, figmaWidth: mobileFigmaGlyphMeasurements.Free };
    if (["200", "1,800", "credits"].includes(spec.text)) {
      return { ...spec, figmaWidth: desktopFigmaGlyphMeasurements[spec.text] };
    }
    if (spec.text === "35,900 KRW") {
      return {
        ...spec,
        $lineNaturalWidths: { "35,900": mobileFigmaGlyphMeasurements["35,900"], KRW: mobileFigmaGlyphMeasurements.KRW },
      };
    }
    if (spec.text === "per month") {
      return {
        ...spec,
        $lineNaturalWidths: { per: mobileFigmaGlyphMeasurements.per, month: mobileFigmaGlyphMeasurements.month },
      };
    }
    return spec;
  });
  const icons = descendants
    .filter((entry) => style(entry).maskImage.includes("/icons/CheckCircle.svg"))
    .map((entry) => ({ rect: relRect(entry, root.rect), color: color(style(entry).backgroundColor), asset: "/icons/CheckCircle.svg" }));
  const title = texts.find((entry) => ["Trial", "Basic"].includes(entry.text))?.text ?? fail(`missing mobile plan title ${root.path}`);
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
  mobileCardSpecs.map((entry) => entry.plan).join(",") !== "Trial,Basic" ||
  mobileCardSpecs.some((entry) => entry.rect.width !== 179 || entry.rect.height !== 679.5938 || entry.padding.left !== 12) ||
  JSON.stringify(mobileCardSpecs[0].outline) !== JSON.stringify(expectedCurrentPlanOutline) ||
  mobileCardSpecs[1].outline !== null
) fail("mobile upgrade card visible-slice drift");

const mobileHeaderTitle = textSpec(mobileNode("body.1.0.0.1.0.0.1.0.0"), mobileMain.rect);
const mobileHeaderBody = textSpec(mobileNode("body.1.0.0.1.0.0.1.0.1"), mobileMain.rect);
const upgradeSourcePath = "apps/web/app/mypage/upgrade/page.tsx";
// 좌표는 내용으로 다시 찾았다 — 두 문자열 모두 이 파일에서 유일하고 `TIER_CARD_CURRENT`
// 안에서 서로 붙어 있다(`git grep -n '\[outline:2px_solid_rgb(var(--primary-200-rgb)/40%)\]' ae8fd627`).
// 210·211 → 214·215 로 밀린 것은 앞쪽 `CHECKOUT_ERROR` 가 LOUIS `.louis-alert` 로 접히면서
// 주석 여러 줄이 들어온 결과다.
const currentPlanOutlineSource = [
  sourceQuote(upgradeSourcePath, 214, '  "[outline:2px_solid_rgb(var(--primary-200-rgb)/40%)]",'),
  sourceQuote(upgradeSourcePath, 215, '  "[outline-offset:-2px]",'),
];
const plan = {
  $comment: "Generated from migration/product.auth-fixture.json. Do not edit by hand.",
  $evidenceClass: "product-only measured upgrade card inventory plus desktop scene and mobile visible slice; not a normative design-system contract",
  $productRegression: {
    $comment: "이 계획의 카드 면·글자색은 제품 회귀를 그대로 담고 있다. 시안으로 읽지 마라.",
    symptom: "라이트 테마 /mypage/upgrade 에서 Basic·Pro 카드는 면 #FAFAFA 에 제목·가격 글자가 #E3E4E8 (대비 약 1.07:1, 사실상 안 보임), Trial·Max 카드는 면이 순검정으로 뒤집힌다. 직전 실측(a3ed8e03)에서는 네 장 모두 #FAFAFA 면에 #313640 글자였다.",
    mechanism: "제품이 LOUIS 핀을 bf62eba7 → 425a9c3d 로 올리면서 LOUIS generated/theme.css 가 `--color-gray-*: var(--louis-color-gray-*)` 를 들고 왔다. 제품은 apps/web/app/tailwind.css:48 의 `@theme inline` 에서 같은 이름을 `var(--gray-*)` 로 정의하는데, LOUIS theme.css 를 같은 theme 레이어의 244줄에서 **나중에** import 하므로 LOUIS 쪽이 이긴다. 실제 빌드 산출물이 `.bg-gray-000{background-color:var(--louis-color-gray-000)}` · `.text-gray-800{color:var(--louis-color-gray-800)}` 로 나온다.",
    consequence: "`:root` 값은 두 램프가 같아서 전역 화면은 그대로지만, 제품이 요소 단위로 덮어쓰던 `--gray-*` 가 전부 죽는다. 이 화면에서는 PRICING_DECK 의 라이트 아이덴티티 주입 22줄(apps/web/app/mypage/upgrade/page.tsx:177-198)이 무력화됐다. 같은 이유로 [data-landing-walkthrough-light|dark], [data-page-root] #pricing-faq, BlogShell/TemplateShell/BlogComingSoon 의 `[--gray-000:var(--palette-gray-1000)]!` 도 죽어 있다. `-rgb` 채널을 직접 읽는 임의값(`text-[rgb(var(--gray-500-rgb)/88%)]`)은 영향이 없다 — 그래서 같은 카드 안에서 일부 글자만 살아 있다.",
    introducedBefore: "74a7303b (이번 기준선 이동 ae8fd627 이 만든 것이 아니다 — 직전 lock 커밋에서 이미 성립한다)",
    verdict: "제품 회귀. 이 생성기는 실측을 왜곡하지 않고 그대로 옮기되, 이 값들을 디자인 의도로 채택하지 않는다.",
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
      },
      cardGrid: relRect(mobileCardGrid, mobileMain.rect),
      cards: mobileCardSpecs,
      evidenceBoundary: "Only nodes present in the 402x874 fixture are drawn. Pro, Max, and card actions were outside the measured viewport and are absent.",
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
      radius24: { collection: "Klipse Primitive", name: "radius/24" },
    },
  },
};
const readableDraw =
  "// Generated by scripts/build-figma-product-upgrade-scene.mjs. Do not edit by hand.\n" +
  "// Pass this file verbatim to use_figma. It creates only the measured desktop upgrade inventory/scene and mobile visible slice.\n" +
  `const PLAN=${JSON.stringify(plan)};\n` +
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
