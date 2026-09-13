import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { atomicWriteBatch } from "./lib/atomic-output.mjs";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const fixturePath = resolve(repoRoot, "migration/product.auth-fixture.json");
const planPath = resolve(repoRoot, "figma/product-app-shell.plan.json");
const drawPath = resolve(repoRoot, "figma/product-app-shell.draw.js");
const templatePath = resolve(repoRoot, "scripts/templates/figma-product-app-shell-renderer.js");
const checkOnly = process.argv.includes("--check");
const fixture = JSON.parse(readFileSync(fixturePath, "utf8"));
const productRoot = process.env.KLIPSE_PRODUCT_REPO ?? "/Users/sejunki/klipse-web";
const context = "mobile-402x874";
const screens = fixture.screens[context];
const styles = new Map(fixture.computedStyles.map((entry) => [entry.id, entry.value]));
// Measured in the target Figma file with Pretendard Medium 14px, 21px line height,
// -0.14px letter spacing. These bounds prevent Figma's glyph metrics from clipping the
// narrower browser DOM rectangles; they do not replace any product geometry.
const figmaGlyphBounds = {
  Home: { width: 38, height: 21 },
  Settings: { width: 52, height: 21 },
  Analytics: { width: 58, height: 21 },
  "/": { width: 5, height: 21 },
  "YouTube analytics": { width: 114, height: 21 },
  "My Page": { width: 55, height: 21 },
  Subscription: { width: 79, height: 21 },
  "Change plan": { width: 79, height: 21 },
  // 2026-09-13 — 읽기만으로 쟀다(아래 `$figmaGlyphMeasurement`). 1248:13051 · 1248:13053.
  Highlight: { width: 57, height: 21 },
  Clips: { width: 32, height: 21 },
};
const desktopFigmaGlyphBounds = {
  Home: { width: 43, height: 24 },
  Settings: { width: 60, height: 24 },
  Analytics: { width: 66, height: 24 },
  "/": { width: 6, height: 24 },
  "YouTube analytics": { width: 130, height: 24 },
  "My Page": { width: 63, height: 24 },
  Subscription: { width: 91, height: 24 },
  "Change plan": { width: 90, height: 24 },
  // 2026-09-13 — 1247:13150 · 1247:13152.
  Highlight: { width: 65, height: 24 },
  Clips: { width: 36, height: 24 },
};

const fail = (message) => {
  throw new Error(`[figma-product-app-shell] ${message}`);
};
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
const screen = (route) => screens[route] ?? fail(`missing screen ${route}`);
const node = (route, path) =>
  screen(route).tree.find((entry) => entry.path === path) ?? fail(`missing node ${route} ${path}`);
const style = (entry) => styles.get(entry.styleRef) ?? fail(`missing style ${entry.styleRef}`);
const px = (value) => {
  const match = /^(-?[\d.]+)px$/.exec(value ?? "");
  return match ? Number(match[1]) : 0;
};
const color = (value) => {
  const rgb =
    /^rgba?\(\s*([\d.]+)[,\s]+([\d.]+)[,\s]+([\d.]+)(?:[,/\s]+([\d.]+%?))?\s*\)$/.exec(
      value ?? "",
    );
  if (rgb) {
    const alpha = rgb[4] === undefined
      ? 1
      : rgb[4].endsWith("%") ? Number(rgb[4].slice(0, -1)) / 100 : Number(rgb[4]);
    return [
      Number(rgb[1]) / 255,
      Number(rgb[2]) / 255,
      Number(rgb[3]) / 255,
      alpha,
    ];
  }
  const srgb =
    /^color\(srgb\s+([\d.]+)\s+([\d.]+)\s+([\d.]+)(?:\s*\/\s*([\d.]+%?))?\)$/.exec(
      value ?? "",
    );
  if (srgb) {
    const alpha = srgb[4] === undefined
      ? 1
      : srgb[4].endsWith("%") ? Number(srgb[4].slice(0, -1)) / 100 : Number(srgb[4]);
    return [
      Number(srgb[1]),
      Number(srgb[2]),
      Number(srgb[3]),
      alpha,
    ];
  }
  const hex = /^#([\da-f]{2})([\da-f]{2})([\da-f]{2})$/i.exec(value ?? "");
  if (hex) return [Number.parseInt(hex[1], 16) / 255, Number.parseInt(hex[2], 16) / 255, Number.parseInt(hex[3], 16) / 255, 1];
  fail(`unsupported color ${value}`);
};
const relRect = (entry, rootRect) => ({
  x: entry.rect.x - rootRect.x,
  y: entry.rect.y - rootRect.y,
  width: entry.rect.width,
  height: entry.rect.height,
});
const textSpec = (entry, rootRect, glyphBounds = figmaGlyphBounds) => {
  const computed = style(entry);
  const figmaBounds = glyphBounds[entry.ownText] ?? fail(`missing Figma glyph bounds ${entry.ownText}`);
  return {
    text: entry.ownText,
    rect: relRect(entry, rootRect),
    fontSize: px(computed.fontSize),
    fontWeight: Number(computed.fontWeight),
    lineHeight: px(computed.lineHeight),
    letterSpacing: computed.letterSpacing === "normal" ? 0 : px(computed.letterSpacing),
    color: color(computed.color),
    figmaBounds,
  };
};
const profileVisualSpec = (screenRecord, profileButton, rootRect) => {
  const glyphs = screenRecord.tree.filter(
    (entry) => entry.tag === "path" && entry.path.startsWith(`${profileButton.path}.`),
  );
  if (glyphs.length !== 1) fail(`expected one default-avatar glyph under ${profileButton.path}, got ${glyphs.length}`);
  const probe = screenRecord.pseudoElementProbes?.profileRing ?? fail(`missing profile-ring probe ${profileButton.path}`);
  if (JSON.stringify(probe.buttonRect) !== JSON.stringify(profileButton.rect) || !probe.avatarRect) {
    fail(`profile-ring probe no longer matches ${profileButton.path}`);
  }
  const ringRect = {
    x: probe.buttonRect.x - rootRect.x,
    y: probe.buttonRect.y - rootRect.y,
    width: px(probe.afterStyle.width),
    height: px(probe.afterStyle.height),
  };
  const avatarRect = {
    x: probe.avatarRect.x - rootRect.x,
    y: probe.avatarRect.y - rootRect.y,
    width: probe.avatarRect.width,
    height: probe.avatarRect.height,
  };
  return {
    avatar: {
      rect: avatarRect,
      color: color(style(glyphs[0]).fill),
      asset: ".glyph/UserCircleDefaultAvatar",
    },
    ring: {
      rect: ringRect,
      width: px(probe.customProperties["--profile-ring-width"]),
      gap: px(probe.customProperties["--profile-ring-gap"]),
      progress: Number.parseFloat(probe.customProperties["--profile-ring-progress"]),
      fill: color(probe.customProperties["--profile-ring-fill"]),
      track: color(probe.customProperties["--profile-ring-track"]),
      radius: px(probe.afterStyle.borderTopLeftRadius),
      backgroundImage: probe.afterStyle.backgroundImage,
      maskImage: probe.afterStyle.maskImage,
      figmaMapping: "0% conic ring as a 2px INSIDE ellipse stroke",
    },
  };
};
const assertProfileVisual = (spec) => {
  const visual = spec.profileVisual;
  const control = spec.controls.profile;
  if (
    control.width !== 36 || control.height !== 36 ||
    visual.avatar.rect.x - control.x !== 4 || visual.avatar.rect.y - control.y !== 4 ||
    visual.avatar.rect.width !== 28 || visual.avatar.rect.height !== 28 ||
    // **#D5D7DD → #8B8E93.** 정체는 그대로다 — 제품 UserCircleDefaultAvatar 는 예나 지금이나
    // `text-palette-gray-400` 이고, 제품 globals.css 의 그 이름은 두 앵커 모두
    // `var(--louis-color-palette-gray-400)` 를 가리킨다(값이 아니라 이름을 소비한다).
    // 움직인 것은 **LOUIS 팔레트 원색 자신**이고, 지금 값은 핀 d963d1d 와 main 이 같다.
    // 같은 색에 역할 이름도 서 있다 — `app-avatar-default-ink`(tokens.css:284).
    JSON.stringify(visual.avatar.color) !== JSON.stringify([0.545098, 0.556863, 0.576471, 1]) ||
    visual.ring.rect.x !== control.x || visual.ring.rect.y !== control.y ||
    visual.ring.rect.width !== 36 || visual.ring.rect.height !== 36 ||
    visual.ring.width !== 2 || visual.ring.gap !== 2 || visual.ring.progress !== 0 ||
    JSON.stringify(visual.ring.fill) !== JSON.stringify([0, 198 / 255, 142 / 255, 1]) ||
    JSON.stringify(visual.ring.track) !== JSON.stringify([0, 0, 0, 0.2]) ||
    visual.ring.figmaMapping !== "0% conic ring as a 2px INSIDE ellipse stroke"
  ) fail(`profile visual drift ${spec.route}`);
};

const candidates = fixture.componentCandidateAudit.repeatedSubtreesByContext[context];
const candidateContracts = [
  // 제품 ae8fd627 에서 두 가지가 함께 움직였다. (1) 기본 아바타가 LOUIS `.louis-avatar`
  // 박스 안으로 들어가 `button > span > span > svg > path` 가 되면서 세 후보 모두 노드가
  // 하나씩 늘었다(기하는 픽셀 그대로). (2) `?__phase=` 하이라이트 6개 화면이 실측 대상에
  // 들어오면서 같은 상단바를 공유해 routeCount 가 12 → 18 이 됐다. subtree id 는 내용
  // 해시에 styleRef(등장 순서 인덱스)가 섞여 있어, 화면이 늘면 내용이 같아도 전부 다시
  // 계산된다 — 옛 id 와 새 id 는 roots(route+path) 집합으로 이어 붙였다.
  // 5a67d692 에서 셋 다 id 만 다시 움직였다 — nodeCount/routeCount 와 roots(route+path)
  // 배열은 ae8fd627 과 **바이트까지 같다**. 두 가지가 겹쳤다. (1) 실측값이 실제로 하나
  // 옮겨졌다: `.louis-avatar` 래퍼 span 의 상속 `color` 가 #777D89 → #575D67
  // (color(srgb 0.466667 0.490196 0.537255) → color(srgb 0.341176 0.364706 0.403922)).
  // LOUIS 라이트 `--louis-color-fg-tertiary` 가 회색 램프 재정렬(LOUIS ff6fa89 · 5c1137c ·
  // 888d1a3 · 3ec5966)에서 옮겨졌고, 제품이 핀 08dc52c4 · 63c63baf · cdab8226 · 5a67d692
  // 로 그것을 삼켰다. 화면에는 안 보인다 — 그 span 은 border-style:none · border-width:0 ·
  // outline-style:none · background transparent 라 currentColor 가 칠하는 자리가 없고,
  // 글리프는 자식 `UserCircleDefaultAvatar` 의 `text-palette-gray-400` 이 rgb(213,215,221)
  // 로 다시 덮는다(실측 fill 도 두 앵커에서 같다). `assertProfileVisual` 이 그 값을 계속
  // 물고 있으므로 이 축은 여전히 지켜진다. (2) computedStyles 가 586 → 580 으로 줄면서
  // styleRef(등장 순서 인덱스)가 통째로 밀렸다 — 해시에 그 인덱스가 섞여 있어 내용이 하나도
  // 안 바뀐 후보까지 id 가 전부 다시 계산된다(desktop `subtree-e4077e3527d7` 은 값 차이 0
  // 인데도 id 가 바뀐 증거다). 옛 id 와 새 id 는 roots(route+path) 집합으로 이어 붙였다.
  //
  // 세 번째로 갈렸다 — 이번에는 **제품이 아니라 측정기가 움직였다.** 앵커는 그대로
  // `5a67d692` 이고(새 fixture 의 `productCommit` 도 같다), 위 문단이 원인으로 지목한
  // styleRef 자리번호 자체를 걷어냈다: styleRef 를 등장 순서 인덱스에서 **스타일 내용의
  // 해시**로 바꾸고, `content-visibility: auto` 가 화면 밖 서브트리를 렌더링에서 걷어내던
  // 래치를 측정 전 스크롤 훑기로 풀었다. 같은 앵커에서 다시 재고 옛 측정과 전수 대조한
  // 결과 후보 수 desktop 51 → 51 · mobile 16 → 16, 서명(nodeCount·routeCount·
  // occurrenceCount·score·roots) 다중집합 불일치 **0**, computedStyles 580 → 579 — 구조는
  // 한 곳도 안 움직였고 id 체계만 한 번 갈렸다. 그 서명으로 옛→새를 1:1 로 이어 붙였다:
  //   subtree-117e0ad287ea(6/18) → subtree-d0270a3536b1
  //   subtree-44170228fb1c(15/4) → subtree-58853450d255
  //   subtree-4f8ad570cbbb(14/4) → subtree-3b91f2c79326
  // **이것이 마지막 일괄 이동이다.** styleRef 가 더는 자리번호가 아니므로 앞으로 id 는 값이
  // 실제로 바뀐 자리에서만 움직인다 — 다음에 이 가드가 물면 이름 갈림이 아니라 진짜 변경이다.
  ["subtree-70d030923c4b", 6, 18],
  ["subtree-e7d2c976fc2b", 15, 4],
  ["subtree-19866f2fb6c4", 14, 4],
].map(([id, nodeCount, routeCount]) => {
  const candidate = candidates.find((entry) => entry.id === id);
  if (!candidate || candidate.nodeCount !== nodeCount || candidate.routeCount !== routeCount) {
    fail(`measured mobile top-bar candidate ${id} changed; inspect before regenerating Figma`);
  }
  return candidate;
});

// **Divider 는 측정이 정한다 — 입력이 아니다.** 제품 6fbdac16 의
// `useMainChromeHeaderScrollProgress.ts:10-14` 가 「헤더 하단 헤어라인은 여기서 건드리지 않는다
// … 모든 화면에서 항상 켜진다」고 적고, fixture 의 측정 바 44개(22 route × 2 뷰포트)가 전부
// `border-bottom-width: 1px` 다. 옛 입력은 `/archive` 를 `divider:false` 로 두어 제품과 다른
// `Divider=Off` 조합을 만들었다. 이제 입력의 divider 가 측정 border 와 다르면 생성이 멈춘다.
// Off 조합 둘은 지우지 않는다 — 라이브 legacy 인스턴스가 참조하므로 아래 `preserved` 로 남긴다.
const BACK_GLYPH_D = "M19 12H5M5 12L11 6M5 12L11 18";
const THEME_MODE = { light: "Light", dark: "Dark" };
const CONTEXTS = {
  mobile: {
    id: "mobile-402x874",
    menuLabel: "Open navigation menu",
    glyphBounds: figmaGlyphBounds,
  },
  desktop: {
    id: "desktop-1920x1080",
    menuLabel: "Collapse sidebar",
    glyphBounds: desktopFigmaGlyphBounds,
  },
};
// 데스크톱 Content 축 값이 측정 라벨(Single 은 라벨, Trail 은 parent)과 같은지 본다.
const CONTENT_LABEL = {
  Home: "Home",
  Settings: "Settings",
  Analytics: "Analytics",
  MyPage: "My Page",
  Subscription: "Subscription",
  Highlight: "Highlight",
};
// 제품 `mainChromePageNav` 의 필드 이름을 그대로 TEXT component property 이름으로 쓴다
// (Gnb.tsx `kind === "single"` → `label`, trail → `parent`·`current`). 구분자 「/」는 속성이 아니다.
const TEXT_ROLES = {
  Single: [["current", "Label"]],
  Trail: [["parent", "Parent"], ["separator", null], ["current", "Current"]],
};
const variantName = (spec) =>
  `${spec.content === undefined ? `Width=${spec.width}` : `Content=${spec.content}`}, Breadcrumb=${spec.breadcrumb}, ` +
  `Back=${spec.back ? "True" : "False"}, Divider=${spec.divider ? "On" : "Off"}`;

const barSpec = (kind) => (input) => {
  const ctx = CONTEXTS[kind];
  const screenRecord = fixture.screens[ctx.id][input.route] ?? fail(`missing ${kind} screen ${input.route}`);
  const tree = screenRecord.tree;
  const root = tree.find((entry) => entry.path === input.rootPath) ?? fail(`missing ${kind} root ${input.route} ${input.rootPath}`);
  const rootStyle = style(root);
  const direct = tree.filter((entry) => entry.parentPath === input.rootPath);
  const nav = direct.find((entry) => entry.tag === "nav" && entry.ariaLabel === "Breadcrumb");
  const leading = nav && direct.find((entry) => entry.tag === "div" && entry.rect.x < nav.rect.x);
  const profile = nav && direct.find((entry) => entry.tag === "div" && entry.rect.x > nav.rect.x);
  if (!nav || !leading || !profile || direct.length !== 3) fail(`unexpected ${kind} top-bar structure ${input.route}`);
  // 뒤로가기는 aria-label 이 아니라 **자리**로 찾는다 — 앞머리 안의 두 번째 button.
  // `/mypage/upgrade` 는 「Back to subscription」, `/highlight` 는 「Highlight」(HighlightProjectScene.tsx
  // `aria-label={t.pageTitle}`)라 이름이 화면마다 다르다. 글리프는 둘 다 같은 화살표 path 여야 한다.
  const buttons = tree.filter((entry) => entry.tag === "button" && entry.path.startsWith(`${leading.path}.`));
  const [menu, backButton, ...extraButtons] = buttons;
  if (!menu || menu.ariaLabel !== ctx.menuLabel || extraButtons.length || Boolean(backButton) !== input.back) {
    fail(`unexpected ${kind} top-bar leading controls ${input.route}`);
  }
  if (backButton) {
    const glyph = tree.filter((entry) => entry.tag === "path" && entry.path.startsWith(`${backButton.path}.`));
    if (backButton.rect.x <= menu.rect.x || glyph.length !== 1 || glyph[0].vector?.d !== BACK_GLYPH_D) {
      fail(`unexpected ${kind} back control ${input.route}`);
    }
  }
  const profileButton = tree.find(
    (entry) => entry.ariaLabel === "Open profile" && entry.path.startsWith(`${profile.path}.`),
  );
  if (!profileButton || JSON.stringify(profileButton.rect) !== JSON.stringify(profile.rect)) {
    fail(`unexpected ${kind} profile control ${input.route}`);
  }
  const measuredDivider = px(rootStyle.borderBottomWidth) > 0;
  if (measuredDivider !== input.divider) fail(`${kind} divider input disagrees with measured border ${input.route}`);
  if (input.width !== undefined) {
    const viewport = fixture.contexts.find((entry) => entry.id === ctx.id).width;
    if (input.width !== (root.rect.width === viewport ? "Full" : "Inset")) fail(`mobile width input disagrees ${input.route}`);
  }
  const textNodes = tree.filter((entry) => entry.ownText && entry.path.startsWith(`${nav.path}.`));
  const roles = TEXT_ROLES[input.breadcrumb] ?? fail(`unknown breadcrumb ${input.breadcrumb}`);
  if (textNodes.length !== roles.length) fail(`unexpected ${kind} breadcrumb ${input.route}`);
  if (input.content !== undefined && textNodes[0].ownText !== CONTENT_LABEL[input.content]) {
    fail(`desktop Content=${input.content} disagrees with measured label ${textNodes[0].ownText} ${input.route}`);
  }
  if (THEME_MODE[screenRecord.theme] === undefined) fail(`unknown measured theme ${screenRecord.theme} ${input.route}`);
  return {
    ...input,
    theme: screenRecord.theme,
    rect: { width: root.rect.width, height: root.rect.height },
    gap: px(rootStyle.gap),
    padding: {
      top: px(rootStyle.paddingTop),
      right: px(rootStyle.paddingRight),
      bottom: px(rootStyle.paddingBottom),
      left: px(rootStyle.paddingLeft),
    },
    fill: color(rootStyle.backgroundColor),
    dividerColor: color(rootStyle.borderBottomColor),
    controlColor: color(style(menu).color),
    leading: relRect(leading, root.rect),
    nav: relRect(nav, root.rect),
    profile: relRect(profile, root.rect),
    labels: { menu: menu.ariaLabel, back: backButton?.ariaLabel ?? null, profile: profileButton.ariaLabel },
    controls: {
      menu: relRect(menu, root.rect),
      back: backButton ? relRect(backButton, root.rect) : null,
      profile: relRect(profileButton, root.rect),
    },
    profileVisual: profileVisualSpec(screenRecord, profileButton, root.rect),
    text: textNodes.map((entry, index) => ({
      role: roles[index][0],
      ...(roles[index][1] ? { property: roles[index][1] } : {}),
      ...textSpec(entry, root.rect, ctx.glyphBounds),
    })),
  };
};

const variantInputs = [
  { width: "Full", breadcrumb: "Single", back: false, divider: true, route: "/settings", rootPath: "body.1.0.0.1.0.0.0" },
  { width: "Full", breadcrumb: "Trail", back: false, divider: true, route: "/analytics/youtube", rootPath: "body.1.0.0.1.0.0.0.0" },
  // 하이라이트 phase 여섯의 바는 서브트리가 바이트까지 같다 — 하나(loading)면 된다.
  { width: "Full", breadcrumb: "Trail", back: true, divider: true, route: "/highlight/[projectId]?__phase=loading", rootPath: "body.1.0.0.1.0.0.0" },
  { width: "Inset", breadcrumb: "Single", back: false, divider: true, route: "/mypage/topup/fail", rootPath: "body.1.0.0.1.0.0" },
  { width: "Inset", breadcrumb: "Trail", back: false, divider: true, route: "/mypage/upgrade/billing-success", rootPath: "body.1.0.0.1.0.0" },
  { width: "Inset", breadcrumb: "Trail", back: true, divider: true, route: "/mypage/upgrade", rootPath: "body.1.0.0.1.0.0.0.0" },
];
// 모바일 세트에는 Content 축이 없어 `/archive` 는 `/settings` 와 같은 조합(Full·Single·False·On)이다.
// 그래서 측정 variant 로는 넣지 않고, 보존 variant 의 기하 출처로만 쓴다.
const PRESERVED_REASON = "보존 · 제품 출처 없음(legacy 인스턴스가 참조)";
const mobilePreservedInputs = [
  { width: "Full", breadcrumb: "Single", back: false, divider: true, route: "/archive", rootPath: "body.1.0.0.1.0.0.0.0" },
];

const mobileSidebarProbe = screens["/settings"].vectorControlProbes?.navigationOpen;
if (
  !mobileSidebarProbe ||
  mobileSidebarProbe.svgRect.width !== 20 ||
  mobileSidebarProbe.groups?.[0]?.transform !== "matrix(1, 0, 0, 1, 0, 0)"
) {
  fail("measured mobile sidebar SVG transform changed; inspect before regenerating Figma");
}

const desktopCandidates = fixture.componentCandidateAudit.repeatedSubtreesByContext["desktop-1920x1080"];
const desktopCandidateContracts = [
  // 모바일과 같은 두 가지 이유로 옮겨졌다. 아바타 래퍼 한 겹(+1 node)과 `?__phase=` 6개
  // 화면(+6 routes). 그때의 `subtree-3d697148af7a`(지금 `subtree-e4077e3527d7`) 만 5/3
  // 그대로인 것은 그 후보가 프로필 아래가
  // 아니라 결제 상태 본문이라 아바타 래퍼가 닿지 않기 때문이다.
  // 5a67d692 에서도 모바일과 정확히 같은 두 이유로 여섯 개의 id 만 옮겨졌다 —
  // nodeCount/routeCount 와 roots 는 여섯 다 그대로다. 다섯은 프로필 아래에
  // `.louis-avatar` 를 물고 있어 fg-tertiary 이동이 닿았고, `subtree-e4077e3527d7`(5/3)
  // 은 결제 상태 본문이라 값 차이가 **하나도 없는데도** id 가 바뀌었다 — styleRef 재번호가
  // 단독으로 해시를 움직인다는 증거이므로 그대로 남겨 둔다.
  //
  // 세 번째 이동도 모바일과 같은 하나다 — 제품이 아니라 측정기가 움직였다(앵커 `5a67d692`
  // 그대로, styleRef 를 자리번호에서 내용 해시로 교체 + `content-visibility: auto` 래치를
  // 스크롤 훑기로 못박음). 서명 전수 대조에서 불일치 0 이라 여섯 다 nodeCount·routeCount 는
  // 손대지 않고 이름만 옮긴다:
  //   subtree-5e2cc05efd59(6/18)  → subtree-f61c1155f4b4
  //   subtree-e30a85d54de2(15/4)  → subtree-9a75e3d066ea
  //   subtree-b5435a968b22(14/4)  → subtree-0510292f2d82
  //   subtree-c19f60450352(17/3)  → subtree-548fe53795f0
  //   subtree-21ea71cb874b(16/3)  → subtree-2fab43c147d6
  //   subtree-e4077e3527d7(5/3)   → subtree-beece6df8949
  // 위 문단이 「값 차이가 하나도 없는데도 id 가 바뀐 증거」로 든 5/3 후보는 이번에도 값이
  // 그대로인 채 이름만 갈렸다 — 그 증거가 한 번 더 재현된 셈이고, 이번이 그 마지막이다.
  ["subtree-e1fe7ee1d038", 6, 18],
  ["subtree-685a4a4bfa2e", 15, 4],
  ["subtree-caedd8a1445d", 14, 4],
  ["subtree-be0ca032e800", 17, 3],
  ["subtree-0733666e63fc", 16, 3],
  ["subtree-a36ea3231cff", 5, 3],
].map(([id, nodeCount, routeCount]) => {
  const candidate = desktopCandidates.find((entry) => entry.id === id);
  if (!candidate || candidate.nodeCount !== nodeCount || candidate.routeCount !== routeCount) {
    fail(`measured desktop top-bar candidate ${id} changed; inspect before regenerating Figma`);
  }
  return candidate;
});
const desktopVariantInputs = [
  { content: "Home", breadcrumb: "Single", back: false, divider: true, route: "/archive", rootPath: "body.1.0.0.1.0.0.0.0" },
  { content: "Settings", breadcrumb: "Single", back: false, divider: true, route: "/settings", rootPath: "body.1.0.0.1.0.0.0" },
  { content: "Analytics", breadcrumb: "Trail", back: false, divider: true, route: "/analytics/youtube", rootPath: "body.1.0.0.1.0.0.0.0" },
  { content: "MyPage", breadcrumb: "Single", back: false, divider: true, route: "/mypage/topup/fail", rootPath: "body.1.0.0.1.0.0" },
  { content: "Subscription", breadcrumb: "Single", back: false, divider: true, route: "/subscription", rootPath: "body.1.0.0.1.0.0.0" },
  { content: "Subscription", breadcrumb: "Trail", back: false, divider: true, route: "/mypage/upgrade/billing-fail", rootPath: "body.1.0.0.1.0.0" },
  { content: "Subscription", breadcrumb: "Trail", back: true, divider: true, route: "/mypage/upgrade", rootPath: "body.1.0.0.1.0.0.0.0" },
  { content: "Highlight", breadcrumb: "Trail", back: true, divider: true, route: "/highlight/[projectId]?__phase=loading", rootPath: "body.1.0.0.1.0.0.0" },
];
const desktopPreservedInputs = [desktopVariantInputs[0]];

const desktopSidebarProbe = fixture.screens["desktop-1920x1080"]["/settings"]
  .vectorControlProbes?.sidebarCollapse;
if (
  !desktopSidebarProbe ||
  desktopSidebarProbe.svgRect.width !== 20 ||
  desktopSidebarProbe.groups?.[0]?.transform !== "matrix(1, 0, 0, 1, -2.5, 0)"
) {
  fail("measured desktop sidebar SVG transform changed; inspect before regenerating Figma");
}
// **variant 이름을 plan 에 싣는다.** 앱 화면 치환(`scripts/lib/figma-component-substitution.mjs`)이
// 세트에 있는 조합과 TEXT 속성 결합을 이 plan 에서 읽는다 — 이름 공식을 그쪽에 또 적으면 세 벌이 된다.
// 러너(`runnerVariant`)에는 싣지 않는다. 렌더러는 같은 공식으로 이름을 스스로 짓는다.
const withName = (spec) => ({ name: variantName(spec), ...spec });
const preservedSpec = (kind) => (input) => withName({
  ...barSpec(kind)(input),
  divider: false,
  status: "preserved",
  reason: PRESERVED_REASON,
});
const measuredMobileVariants = variantInputs.map(barSpec("mobile")).map(withName);
const preservedMobileVariants = mobilePreservedInputs.map(preservedSpec("mobile"));
const measuredDesktopVariants = desktopVariantInputs.map(barSpec("desktop")).map(withName);
const preservedDesktopVariants = desktopPreservedInputs.map(preservedSpec("desktop"));
const mobileSets = [...measuredMobileVariants, ...preservedMobileVariants];
const desktopSets = [...measuredDesktopVariants, ...preservedDesktopVariants];
for (const spec of [...mobileSets, ...desktopSets]) assertProfileVisual(spec);
for (const [kind, list] of [["mobile", mobileSets], ["desktop", desktopSets]]) {
  const names = list.map(variantName);
  const duplicates = names.filter((name, index) => names.indexOf(name) !== index);
  if (duplicates.length) fail(`duplicate ${kind} top-bar variant ${duplicates.join(" | ")}`);
}

// **색은 제품 토큰 이름으로 묶고, 측정값과 라이브 해석값을 나란히 적는다.**
// 은퇴한 `1 · Palette`/`2 · Semantic` 대신 라이브 LOUIS 의 `Klipse Semantic Color` 를 쓴다.
// 아래 해석값은 2026-09-13 OlYKERKOkgbxBEEoXGZW2c 를 읽기 전용 use_figma 로 풀어 적은 것이다
// (Light 모드 → alias 끝의 `Klipse Primitive`). 면·경계선·아바타 잉크는 **값까지** 측정과 같아야
// 하고 다르면 생성이 멈춘다. 알파 잉크 넷(글자·아이콘·링 트랙)은 제품 표기
// `rgb(var(--gray-000-rgb) / N%)` 와 이름이 같은 `color/gray/000-alpha/N` 에 묶는다 — 라이브에
// 측정과 RGB 까지 같은 변수가 없다(라이브 `static-black-alpha/*` 는 #171b22 기반, 측정은 #000).
// 그 차이는 `bindingEvidence.*.exact=false` 로 남긴다.
const FIGMA_COLOR_COLLECTION = "Klipse Semantic Color";
const FIGMA_COLOR_BINDINGS = {
  surface: { name: "color/bg-surface", via: "color/palette-gray/000", hex: "fafafa", alpha: 1, requireExact: true },
  divider: { name: "color/stroke-hairline", via: "color/static-black-alpha/12", hex: "171b22", alpha: 0.12, requireExact: true },
  profile: { name: "color/app/avatar-default-ink", via: "color/palette-gray/400", hex: "8b8e93", alpha: 1, requireExact: true },
  profileRingTrack: { name: "color/gray/000-alpha/20", via: "color/static-black-alpha/20", hex: "171b22", alpha: 0.2 },
  // 알파 넷은 제품 `d673f976`「색 알파를 LOUIS 16단 스케일로 스냅」에서 78→80 · 52→48 · 65→64 · 36→32
  // 로 옮겨졌고 실측도 따라왔다. 출처는 Gnb.tsx 의 `mainChromePageNavCurrent` · `mainChromePageNavParent`
  // · `mainChromePageNavSep` 와 아이콘 버튼이다.
  current: { name: "color/gray/000-alpha/80", via: "color/static-black-alpha/80", hex: "171b22", alpha: 0.8 },
  parent: { name: "color/gray/000-alpha/48", via: "color/static-black-alpha/48", hex: "171b22", alpha: 0.48 },
  separator: { name: "color/gray/000-alpha/32", via: "color/static-black-alpha/32", hex: "171b22", alpha: 0.32 },
  control: { name: "color/gray/000-alpha/64", via: "color/static-black-alpha/64", hex: "171b22", alpha: 0.64 },
};
const measuredColors = {};
for (const spec of [...measuredMobileVariants, ...measuredDesktopVariants]) {
  const ink = {
    surface: spec.fill,
    divider: spec.dividerColor,
    control: spec.controlColor,
    profile: spec.profileVisual.avatar.color,
    profileRingTrack: spec.profileVisual.ring.track,
    ...Object.fromEntries(spec.text.map((entry) => [entry.role, entry.color])),
  };
  for (const [role, value] of Object.entries(ink)) {
    measuredColors[role] ??= value;
    if (JSON.stringify(measuredColors[role]) !== JSON.stringify(value)) fail(`measured ${role} color differs on ${spec.route}`);
  }
}
const themes = [...new Set([...mobileSets, ...desktopSets].map((spec) => spec.theme))];
if (themes.length !== 1) fail(`measured top bars span themes ${themes.join(", ")}`);
const measuredMode = THEME_MODE[themes[0]];
if (measuredMode !== "Light") fail(`recorded Figma resolutions are Light-mode; re-read variables for ${measuredMode}`);
if (JSON.stringify(Object.keys(measuredColors).sort()) !== JSON.stringify(Object.keys(FIGMA_COLOR_BINDINGS).sort())) {
  fail(`color roles drifted: measured ${Object.keys(measuredColors).sort().join(",")}`);
}
const hexOf = (rgba) => rgba.slice(0, 3).map((channel) => Math.round(channel * 255).toString(16).padStart(2, "0")).join("");
const bindingEvidence = Object.fromEntries(
  Object.entries(FIGMA_COLOR_BINDINGS).map(([role, live]) => {
    const measured = measuredColors[role];
    const exact = hexOf(measured) === live.hex && Math.round(measured[3] * 255) === Math.round(live.alpha * 255);
    if (live.requireExact && !exact) fail(`measured ${role} #${hexOf(measured)}/${measured[3]} no longer equals ${live.name}`);
    return [role, {
      measured: `#${hexOf(measured)}`,
      measuredAlpha: measured[3],
      figma: `${FIGMA_COLOR_COLLECTION}[${measuredMode}]/${live.name} → Klipse Primitive/${live.via}`,
      figmaValue: `#${live.hex}`,
      figmaAlpha: live.alpha,
      exact,
    }];
  }),
);

const typographyOf = (kind, list) => {
  const keys = ["fontSize", "fontWeight", "lineHeight", "letterSpacing"];
  const first = list[0].text[0];
  for (const spec of list) {
    for (const entry of spec.text) {
      if (keys.some((key) => entry[key] !== first[key])) fail(`${kind} breadcrumb typography differs ${spec.route} ${entry.text}`);
    }
  }
  return Object.fromEntries(keys.map((key) => [key, first[key]]));
};
// 세트 단위 TEXT 속성의 기본값은 하나뿐이다 — 묶인 글자는 모든 variant 에서 그 기본값을 보인다.
// 기본값은 plan 순서상 그 구조의 첫 측정 variant 글자로 정한다(출처 route 를 함께 적는다).
const textPropertiesOf = (list) =>
  Object.entries(TEXT_ROLES).flatMap(([breadcrumb, roles]) => {
    const source = list.find((spec) => spec.breadcrumb === breadcrumb) ?? fail(`no measured ${breadcrumb} variant`);
    return roles.flatMap(([role, name], index) =>
      name ? [{ name, breadcrumb, role, defaultValue: source.text[index].text, defaultSource: source.route }] : [],
    );
  });
const [firstProfile] = measuredMobileVariants;
const profileVisualConstants = {
  avatarInset: firstProfile.profileVisual.avatar.rect.x - firstProfile.controls.profile.x,
  avatarSize: firstProfile.profileVisual.avatar.rect.width,
  ringWidth: firstProfile.profileVisual.ring.width,
};

const avatarSourcePath = "apps/web/components/navigation/UserCircleDefaultAvatar.tsx";
const ringSourcePath = "apps/web/components/navigation/Gnb.tsx";
// 13 → 22. `AVATAR` 배열 머리의 `inline-flex … w-14 h-14` 가 `louis-avatar__fallback`
// 한 줄로 바뀌고 그 위에 9줄짜리 주석이 붙으면서 밀렸다. 인용 줄 자체는 그대로다.
const avatarSource = sourceQuote(avatarSourcePath, 22, '  "text-palette-gray-400",');
// `profileTrigger` 블록이 통째로 82줄 아래로 밀렸다(1358 → 1440). 인용 문자열은 여섯 줄
// 모두 ae8fd627 에서 글자 하나 안 바뀌었다.
// 5a67d692 에서 다시 12줄(1440 → 1452). 문자열 여섯 개는 또 한 글자도 안 바뀌었고 줄만
// 밀렸다 — 제품 52f70bac「면을 … 사다리로 모은다」가 이 블록 위에서 +11(20 insert / 9
// delete), 41ea8099「GNB … 테마 버튼을 둔다」가 +1 을 냈다. 이 파일에서 두 앵커 사이에
// Gnb.tsx 를 건드린 커밋은 그 둘과 ff4138a8 · 0524cd49 · 3d604624 뿐이고, 뒤 셋은 이
// 블록 위 줄 수를 바꾸지 않았다(실측: avatar-size 줄이 커밋별로 1451 → 1451 → 1452 →
// 1452 → 1452).
const ringSourceLines = [
  [1467, '    "[--profile-avatar-size:28px]",'],
  [1470, '    "[--profile-ring-track:rgb(var(--gray-000-rgb)_/_20%)]",'],
  [1471, '    "[--profile-ring-gap:2px]",'],
  [1472, '    "[--profile-ring-width:2px]",'],
  [1499, '    "[&::after]:[background:conic-gradient(_from_0deg,_var(--profile-ring-fill)_0_var(--profile-ring-progress),_var(--profile-ring-track)_var(--profile-ring-progress)_100%_)]",'],
  [1501, '    "[&::after]:[mask:radial-gradient(_farthest-side,_transparent_calc(100%_-_var(--profile-ring-width)),_#000_calc(100%_-_var(--profile-ring-width))_)]",'],
].map(([line, quote]) => sourceQuote(ringSourcePath, line, quote));

const dividerSources = [
  sourceQuote(
    "apps/web/components/navigation/Gnb.tsx",
    497,
    '    "[border-bottom:var(--louis-border-width-hairline)_solid_color-mix(_in_srgb,_var(--louis-color-stroke-hairline)_calc(var(--mainchrome-divider-progress,_1)_*_100%),_transparent_)]",',
  ),
  sourceQuote(
    "apps/web/components/scenes/useMainChromeHeaderScrollProgress.ts",
    13,
    " * 달라 보였다**. CSS 기본값이 `var(--mainchrome-divider-progress, 1)` 이므로 손대지 않으면",
  ),
  sourceQuote(
    "apps/web/components/scenes/useMainChromeHeaderScrollProgress.ts",
    14,
    " * 모든 화면에서 항상 켜진다 — 그게 통일된 정본이다(소유자 지정).",
  ),
];
const bindingOf = (role) => ({ collection: FIGMA_COLOR_COLLECTION, name: FIGMA_COLOR_BINDINGS[role].name });

const plan = {
  $comment: "Generated from migration/product.auth-fixture.json. Do not edit by hand.",
  $evidenceClass: "product-only measured Figma candidate; not a normative design-system contract",
  $figmaGlyphMeasurement:
    "Measured 2026-08-24 in OlYKERKOkgbxBEEoXGZW2c with temporary Pretendard Medium 14/21/-0.14 and 16/24/-0.16 text nodes; nodes were removed after reading natural WIDTH_AND_HEIGHT bounds. " +
    "Highlight and Clips were added 2026-09-13 by a read-only use_figma read of existing auto-sized (WIDTH_AND_HEIGHT) Pretendard Medium TEXT nodes on the generated /highlight/[projectId]?__phase=loading boards: " +
    "14px (-0.14px, line height 150% = 21px) 1248:13051 Highlight 57x21 and 1248:13053 Clips 32x21; 16px (-0.16px, 150% = 24px) 1247:13150 Highlight 65x24 and 1247:13152 Clips 36x24. " +
    "Cross-check in the same read: 1227:13358 Subscription 16px is 91x24, equal to the 2026-08-24 value. " +
    "Product rects remain authoritative for the bar, leading, nav and profile boxes. Breadcrumb text is auto-width inside a horizontal Auto Layout nav spaced by the product separator margin (4px), so a label set through a TEXT property reflows instead of clipping; the runner reports any default label whose Figma width differs from these bounds (glyphDrift).",
  productCommit: fixture.productCommit,
  profileVisualSource: {
    avatar: avatarSource,
    ring: ringSourceLines,
  },
  context,
  sourceCandidates: candidateContracts,
  $bindingPolicy:
    "Colors bind to the live LOUIS collections (Klipse Primitive[Base] · Klipse Semantic[Global] · Klipse Semantic Color[Light/Dark]); the retired 1 · Palette / 2 · Semantic are gone. " +
    "The measured theme picks the pinned mode. bindingEvidence records measured value beside the live resolution; surface, divider and avatar ink must be exact.",
  bindingEvidence,
  dividerSources,
  $labelProperties:
    "Both sets expose breadcrumb text as TEXT component properties named after the product mainChromePageNav fields: Single binds Label; Trail binds Parent and Current; the separator is not a property. " +
    "A set-level TEXT property has one default, so every bound master text shows that default and existing instances without an override show it too. Consumers must set these properties from their measured labels.",
  component: {
    id: "product/mobile-app-top-bar",
    pageId: "240:3529",
    pageName: "90 · ASSETS — 출처별 (logo · tile · icon · root · .glyph · .authored)",
    sectionName: "K · product/Mobile app top bar · measured component",
    componentSetName: "Product/Mobile App Top Bar",
    iconComponents: {
      sidebar: ".glyph/SidebarToggle",
      back: ".glyph/ArrowLeftLong",
      profile: ".glyph/UserCircleDefaultAvatar",
    },
    bindings: {
      modeCollection: FIGMA_COLOR_COLLECTION,
      mode: measuredMode,
      // 제품이 테마별 덮개 두 줄(`light → palette-gray-000` · `dark → palette-gray-800`)을 걷고
      // `bg-surface` 하나를 읽는다(Gnb.tsx:489-495). fixture 는 light 문맥에서 쟀고, 측정 면
      // #fafafa 는 `Klipse Semantic Color[Light]/color/bg-surface → palette-gray/000` 과 값이
      // 같다. 라이브 세트가 물고 있던 `Klipse Primitive/color/palette-gray/800`(#2b2f36)도,
      // bg-surface 의 Dark 값(palette-gray/900 #171b22)도 측정과 다르다.
      surface: bindingOf("surface"),
      $surfaceSource: sourceQuote(
        "apps/web/components/navigation/Gnb.tsx",
        489,
        '    "[background:var(--louis-color-bg-surface)]",',
      ),
      // 제품 `border-bottom … var(--louis-color-stroke-hairline)`(Gnb.tsx:497). 알파는 변수가 갖는다.
      divider: bindingOf("divider"),
      profile: bindingOf("profile"),
      profileRingTrack: bindingOf("profileRingTrack"),
      current: bindingOf("current"),
      parent: bindingOf("parent"),
      control: bindingOf("control"),
      separator: bindingOf("separator"),
      spacing4: { collection: "Klipse Primitive", name: "spacing/4" },
      spacing8: { collection: "Klipse Primitive", name: "spacing/8" },
      spacing16: { collection: "Klipse Primitive", name: "spacing/16" },
      radius12: { collection: "Klipse Primitive", name: "radius/12" },
    },
    profileVisual: profileVisualConstants,
    typography: typographyOf("mobile", mobileSets),
    textProperties: textPropertiesOf(measuredMobileVariants),
    variants: measuredMobileVariants,
    preservedVariants: preservedMobileVariants,
    desktopTopBar: {
      id: "product/desktop-app-top-bar",
      sectionName: "L · product/Desktop app top bar · measured component",
      componentSetName: "Product/Desktop App Top Bar",
      sourceCandidates: desktopCandidateContracts,
      sidebarGlyph: {
        sourceRoute: "/settings",
        displaySize: desktopSidebarProbe.svgRect.width,
        lineShiftX: -2.5,
        measuredTransform: desktopSidebarProbe.groups[0].transform,
      },
      typography: typographyOf("desktop", desktopSets),
      textProperties: textPropertiesOf(measuredDesktopVariants),
      variants: measuredDesktopVariants,
      preservedVariants: preservedDesktopVariants,
    },
  },
};

// 러너에는 렌더러가 읽는 것만 싣는다 — 50,000자 실행 한도 안에 variant 를 더 싣기 위해서다.
// 빠지는 것은 plan.json 이 그대로 갖고 생성기가 이미 검사한 값이다: 색 실측(→ bindingEvidence),
// 컨트롤·아바타·링 사각형(→ profileVisual 상수, assertProfileVisual 이 고정), 글자별 기하와
// 타이포(→ 세트 단위 typography, typographyOf 가 균일함을 확인).
const runnerVariant = (spec) => ({
  ...(spec.content === undefined ? { width: spec.width } : { content: spec.content }),
  breadcrumb: spec.breadcrumb,
  back: spec.back,
  divider: spec.divider,
  route: spec.route,
  ...(spec.status ? { status: spec.status, reason: spec.reason } : {}),
  rect: spec.rect,
  gap: spec.gap,
  padding: spec.padding,
  leading: spec.leading,
  nav: spec.nav,
  profile: spec.profile,
  labels: spec.labels,
  text: spec.text.map((entry) => ({ text: entry.text, role: entry.role, ...(entry.property ? { property: entry.property } : {}) })),
});
const glyphWidths = (bounds) => Object.fromEntries(Object.entries(bounds).map(([label, box]) => [label, box.width]));
const runnerPlan = {
  productCommit: plan.productCommit,
  context: plan.context,
  component: {
    ...plan.component,
    bindings: Object.fromEntries(Object.entries(plan.component.bindings).filter(([key]) => !key.startsWith("$"))),
    glyphWidths: glyphWidths(figmaGlyphBounds),
    variants: measuredMobileVariants.map(runnerVariant),
    preservedVariants: preservedMobileVariants.map(runnerVariant),
    desktopTopBar: {
      ...plan.component.desktopTopBar,
      sourceCandidates: undefined,
      glyphWidths: glyphWidths(desktopFigmaGlyphBounds),
      variants: measuredDesktopVariants.map(runnerVariant),
      preservedVariants: preservedDesktopVariants.map(runnerVariant),
    },
  },
};
const draw =
  "// Generated by scripts/build-figma-product-app-shell.mjs. Do not edit by hand.\n" +
  "// Pass this file verbatim to use_figma. It creates or reconciles the measured mobile and desktop top bars.\n" +
  `const PLAN=${JSON.stringify(runnerPlan)};\n` +
  readFileSync(templatePath, "utf8");
const RUNNER_LIMIT = 50_000;
if (draw.length > RUNNER_LIMIT) fail(`Figma runner exceeds connector limit: ${draw.length}`);
const expected = [
  { absolute: planPath, expected: `${JSON.stringify(plan, null, 2)}\n` },
  { absolute: drawPath, expected: draw },
];

if (checkOnly) {
  for (const entry of expected) {
    let current = "";
    try {
      current = readFileSync(entry.absolute, "utf8");
    } catch {
      fail(`missing generated output ${entry.absolute.slice(repoRoot.length + 1)}`);
    }
    if (current !== entry.expected) fail(`generated output drift: ${entry.absolute.slice(repoRoot.length + 1)}`);
  }
} else {
  atomicWriteBatch(expected);
}

console.log(
  `[figma-product-app-shell] ${checkOnly ? "checked" : "built"} @ ${fixture.productCommit.slice(0, 8)}: ` +
    `${measuredMobileVariants.length}+${preservedMobileVariants.length} mobile · ${measuredDesktopVariants.length}+${preservedDesktopVariants.length} desktop top-bar variants (measured+preserved) · ` +
    `runner ${draw.length}/${RUNNER_LIMIT} chars · mobile candidates ${candidateContracts
      .map((entry) => `${entry.nodeCount}/${entry.routeCount}`)
      .join(", ")} · desktop candidates ${desktopCandidateContracts.map((entry) => `${entry.nodeCount}/${entry.routeCount}`).join(", ")} nodes/routes`,
);
