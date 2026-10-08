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
// 6f6282c1 에서 값 하나와 줄 셋이 움직였다. `[--profile-avatar-size:28px]` 가 `24px` 가 됐고, 바로 위에
// 세 줄짜리 주석(「프로필 버튼 크기는 여기 한 곳이 정한다」)이 붙어 블록이 +3 밀렸다(1467 → 1470).
// 2c6bdacf 에서 줄만 −37 밀렸다(1470 → 1433) — 위쪽 스타일 표에서 어드민 아이콘 사본(`customSidebarIconMask`) · 사이드바와
// 모바일 「분석」 아이브로우 상수가 걷히고 아이콘 슬롯 주석이 늘었다. 이 파일의 Gnb.tsx 인용 문자열은 모두 글자 그대로이고 줄만 옮겼다.
// 나머지 문자열 다섯은 글자 그대로다.
// a4125565 에서 줄만 −1 밀렸다(1433 → 1432) — 1094행 근처 크레딧 팝오버 주석이 한 줄 줄었다(`git diff -U0 2c6bdacf a4125565`).
const ringSourceLines = [
  [1467, '    "[--profile-avatar-size:24px]",'],
  [1470, '    "[--profile-ring-track:rgb(var(--gray-000-rgb)_/_20%)]",'],
  [1471, '    "[--profile-ring-gap:2px]",'],
  [1472, '    "[--profile-ring-width:2px]",'],
  [1499, '    "[&::after]:[background:conic-gradient(_from_0deg,_var(--profile-ring-fill)_0_var(--profile-ring-progress),_var(--profile-ring-track)_var(--profile-ring-progress)_100%_)]",'],
  [1501, '    "[&::after]:[mask:radial-gradient(_farthest-side,_transparent_calc(100%_-_var(--profile-ring-width)),_#000_calc(100%_-_var(--profile-ring-width))_)]",'],
].map(([line, quote]) => sourceQuote(ringSourcePath, line, quote));
// 버튼 한 변이 식이라는 선언 셋 — `--profile-ring-size` calc 와 그것을 폭·높이로 쓰는 두 줄.
const profileSizeSourceLines = [
  [1473, '    "[--profile-ring-size:calc(_var(--profile-avatar-size)_+_(var(--profile-ring-gap)_+_var(--profile-ring-width))_*_2_)]",'],
  [1475, '    "[width:var(--profile-ring-size)]",'],
  [1476, '    "[height:var(--profile-ring-size)]",'],
].map(([line, quote]) => sourceQuote(ringSourcePath, line, quote));
// **앞머리 컨트롤 한 변도 선언이다.** `mainChromeSidebarToggle`(Gnb.tsx:359) 의 `[width:32px]` ·
// `[height:32px]`. 두 문자열은 파일에 네 번씩 나오므로 블록 머리(:359–360)를 함께 인용해 자리를 고정한다.
// 뒤로가기 버튼은 화면마다 다른 상수(`CHROME_BACK_BUTTON` · `HIGHLIGHT_BACK_BUTTON`)가 크기를 쥐므로
// 선언을 여기 다시 옮기지 않고, 측정 크기가 토글과 같은지만 본다(`barSpec`).
const toggleSourceLines = [
  [359, "  mainChromeSidebarToggle: ["],
  [360, '    "gnb-mainChromeSidebarToggle",'],
  [366, '    "[width:32px]",'],
  [367, '    "[height:32px]",'],
].map(([line, quote]) => sourceQuote(ringSourcePath, line, quote));

// **프로필 크기는 리터럴이 아니라 제품 선언에서 읽는다(2026-09-14).** 이 가드는 전에 `32` · `24`
// (그 전에는 `36` · `28`)를 숫자로 물었고, 제품이 아바타 한 값을 바꿀 때마다 가드가 먼저 낡았다.
// 제품 `profileTrigger` 가 크기를 한 곳에서 정한다 — 아바타(`--profile-avatar-size`) + (간격 + 두께) × 2
// (Gnb.tsx 의 `--profile-ring-size` calc 와 `width/height: var(--profile-ring-size)`). 그 식을 인용 줄에서
// 풀어 측정과 대조한다. 값이 옮겨지면 인용 대조가 먼저 울리고, 식이 닫히지 않으면 여기서 울린다.
const declaredPx = (quote, property) => {
  const match = new RegExp(`\\[${property}:(\\d+(?:\\.\\d+)?)px\\]`).exec(quote.quote);
  if (!match) fail(`declared ${property} not found in ${quote.path}:${quote.line}`);
  return Number(match[1]);
};
const DECLARED_PROFILE = (() => {
  const avatar = declaredPx(ringSourceLines[0], "--profile-avatar-size");
  const gap = declaredPx(ringSourceLines[2], "--profile-ring-gap");
  const width = declaredPx(ringSourceLines[3], "--profile-ring-width");
  return { avatar, gap, width, ringSize: avatar + (gap + width) * 2 };
})();
// 토글 글리프의 표시 크기도 선언이다(Gnb.tsx:5252–5254 `<svg className={…mainChromeSidebarToggleSvg} width={20} height={20}>`).
const toggleSvgSourceLines = [
  [5367, "                      className={gnbStyles.mainChromeSidebarToggleSvg}"],
  [5368, "                      width={20}"],
  [5369, "                      height={20}"],
].map(([line, quote]) => sourceQuote(ringSourcePath, line, quote));
const DECLARED_TOGGLE_SVG = (() => {
  const [width, height] = [toggleSvgSourceLines[1], toggleSvgSourceLines[2]].map((entry) => Number(/=\{(\d+)\}/.exec(entry.quote)?.[1]));
  if (!(width > 0) || width !== height) fail(`declared sidebar toggle svg is not a square: ${width}×${height}`);
  return width;
})();
const DECLARED_CONTROL = (() => {
  const width = declaredPx(toggleSourceLines[2], "width");
  const height = declaredPx(toggleSourceLines[3], "height");
  if (width !== height) fail(`declared sidebar toggle is not square: ${width}×${height}`);
  return width;
})();
const assertProfileVisual = (spec) => {
  const visual = spec.profileVisual;
  const control = spec.controls.profile;
  const { avatar, gap, width, ringSize } = DECLARED_PROFILE;
  if (
    control.width !== ringSize || control.height !== ringSize ||
    visual.avatar.rect.x - control.x !== gap + width || visual.avatar.rect.y - control.y !== gap + width ||
    visual.avatar.rect.width !== avatar || visual.avatar.rect.height !== avatar ||
    // **#D5D7DD → #8B8E93.** 정체는 그대로다 — 제품 UserCircleDefaultAvatar 는 예나 지금이나
    // `text-palette-gray-400` 이고, 제품 globals.css 의 그 이름은 두 앵커 모두
    // `var(--louis-color-palette-gray-400)` 를 가리킨다(값이 아니라 이름을 소비한다).
    // 움직인 것은 **LOUIS 팔레트 원색 자신**이고, 지금 값은 핀 d963d1d 와 main 이 같다.
    // 같은 색에 역할 이름도 서 있다 — `app-avatar-default-ink`(tokens.css:284).
    JSON.stringify(visual.avatar.color) !== JSON.stringify([0.545098, 0.556863, 0.576471, 1]) ||
    visual.ring.rect.x !== control.x || visual.ring.rect.y !== control.y ||
    visual.ring.rect.width !== ringSize || visual.ring.rect.height !== ringSize ||
    visual.ring.width !== width || visual.ring.gap !== gap || visual.ring.progress !== 0 ||
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
  //
  // 6fbdac16 → 6f6282c1(2026-09-14) 에서 셋 다 물었고, 위 예고대로 **진짜 변경**이다. 제품이 프로필
  // 버튼을 36 → 32 로 줄여(`profileTrigger` 의 `--profile-avatar-size` 28 → 24) 바 안의 프로필 rect 와
  // 바 자신의 높이(패딩 + 가장 큰 자식 + 헤어라인)가 함께 움직였다. 옛 fixture(`918c42d:`)와 새 fixture 를
  // 견주면 nodeCount/routeCount 는 셋 다 그대로이고, roots 의 (route, path, tag) 가 바이트까지 같으며
  // 달라진 것은 roots 의 rect 뿐이다 — 6/18 은 프로필 묶음(36 → 32, x +4), 15/4 · 14/4 는 바(높이
  // 53 → 49). 그 (route, path) 집합으로 1:1 이었다:
  //   subtree-70d030923c4b(6/18) → subtree-7afea61e7dab
  //   subtree-e7d2c976fc2b(15/4) → subtree-9a75e0bd18d2
  //   subtree-19866f2fb6c4(14/4) → subtree-8a8ec102efb8
  //
  // 2026-09-26: id 는 그대로이고 **걸친 라우트 수만** 늘었다 — 인증 fixture 에 화면이 늘어서다(같은 앵커 2c6bdacf). 보드 없던
  // 실제 화면 셋(bulk-success · bulk-fail · coupons)이 프로필 묶음을 18 → 21 로, 결제 성공 화면 넷의 `?preview=` 상태 여섯이
  // 21 → 27 로 늘렸고, 새 상태 화면 여섯은 MyPage · Subscription 바를 써서 두 바가 4 → 6 이 됐다. nodeCount 는 셋 다 그대로다.
  //
  // 2026-10-08 재고정(a4125565 → 통합 판 76b6cf15, DS-D-0079): 셋 다 갈렸다. 서명 대조에서 구조 · rect 는 그대로이고 바뀐 계산값은
  // 노드 전부의 `fontFamily` 하나다(통합 판의 글꼴 스택 `"Pretendard Variable", -apple-system, …`). 걸친 라우트는 두 가지로 줄었다 —
  // 프로필 묶음 27 → 26 은 redirect 가 된 `/subscription/coupons`(구매 내역이 구독 허브 탭으로 갔다), 두 바 6 → 5 는 `/mypage/topup/fail`
  // 이 빠져서다. 통합 판에서 그 화면의 바 글자가 「My Page」 → 「Subscription」 으로 바뀌어(rect 폭 55 → 78.69) 같은 서명이 아니다.
  //   subtree-7afea61e7dab(6/27) → subtree-aa5a4115196f(6/26)
  //   subtree-9a75e0bd18d2(15/6) → subtree-32b7c0952c2b(15/5)
  //   subtree-8a8ec102efb8(14/6) → subtree-a528a644ec31(14/5)
  // 2026-10-08 밤(앵커 54b62a8a): 프로필 묶음 26 → 20 — id · 6노드 그대로이고 빠진 여섯은 하이라이트 상세 `?__phase=` 여섯이다. 하이라이트 새 화면
  // 갈래가 그 단계들을 스튜디오 판(`HighlightStudioShell`, Gnb variant=create)으로 바꿔 모바일 상단 바 프로필 묶음을 그리지 않는다.
  ["subtree-aa5a4115196f", 6, 20],
  ["subtree-32b7c0952c2b", 15, 5],
  ["subtree-a528a644ec31", 14, 5],
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
// Off 조합 둘은 지우지 않는다 — 라이브 인스턴스가 참조하므로 아래 `preserved` 로 남긴다. 2026-09-13 실측으로
// 참조처는 legacy 그룹만이 아니다: 손으로 조립한 허브 보드의 **보이는** 바 넷(528:2665 · 528:2653 · 493:539 ·
// 493:816)과 legacy 둘(521:2592 · 488:262), 그리고 옛 계획의 archive 데스크톱 generated 바 하나다
// (`figma-screens-live-check --emit --consumers`).
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
  const padding = {
    top: px(rootStyle.paddingTop),
    right: px(rootStyle.paddingRight),
    bottom: px(rootStyle.paddingBottom),
    left: px(rootStyle.paddingLeft),
  };
  const gap = px(rootStyle.gap);
  const leadingGap = px(style(leading).gap);
  const dividerWidth = px(rootStyle.borderBottomWidth);
  // **바의 크기는 계산값이다 — 숫자로 받지 않고, 측정이 제품 식으로 닫히는지만 본다(2026-09-14).**
  // 제품 바는 높이를 선언하지 않는다(`[min-block-size:0]` · `[padding:8px_var(--mainchrome-pad-x)]`,
  // 아래 `layoutSources`). Figma 세트는 같은 식을 Auto Layout 으로 옮긴다 — 높이 HUG · 폭 FIXED(기본값만,
  // 소비처는 FILL) · 가운데 nav FILL. 그래서 측정이 그 식과 닫혀야 옮긴 그림이 제품과 같다:
  //   높이 = 패딩 위 + 가장 큰 자식 + 패딩 아래 + 아래 헤어라인(측정 border-bottom)
  //   폭   = 패딩 좌 + 앞머리 + gap + nav + gap + 뒷머리 + 패딩 우
  //   앞머리 = 컨트롤들 + 앞머리 gap × (개수 − 1),  뒷머리 = 프로필 버튼
  // 식이 닫히지 않으면 제품에 새 자식·margin·최소 높이가 생긴 것이므로 Figma 를 짓기 전에 멈춘다.
  const close = (actual, expected, what) => {
    if (Math.abs(actual - expected) > 0.01) fail(`${kind} top-bar ${what} no longer closes (${actual} ≠ ${expected}) ${input.route}`);
  };
  close(root.rect.height, padding.top + Math.max(leading.rect.height, nav.rect.height, profile.rect.height) + padding.bottom + dividerWidth, "height = padding + tallest child + hairline");
  close(root.rect.width, padding.left + leading.rect.width + gap + nav.rect.width + gap + profile.rect.width + padding.right, "width = padding + leading + nav + profile + gaps");
  const leadingControls = [menu, backButton].filter(Boolean);
  close(leading.rect.width, leadingControls.reduce((sum, entry) => sum + entry.rect.width, 0) + leadingGap * (leadingControls.length - 1), "leading width = controls + gap");
  for (const control of leadingControls) {
    if (control.rect.width !== DECLARED_CONTROL || control.rect.height !== DECLARED_CONTROL) {
      fail(`${kind} leading control ${control.ariaLabel} is not the declared ${DECLARED_CONTROL} square (Gnb.tsx mainChromeSidebarToggle) ${input.route}`);
    }
  }
  close(profile.rect.width, profileButton.rect.width, "trailing width = profile button");
  // breadcrumb 간격은 구분자 `mainChromePageNavSep` 의 `[margin:0_4px]` 이다 — 좌우가 같아야 itemSpacing 하나로 옮긴다.
  const separatorIndex = roles.findIndex(([role]) => role === "separator");
  const separatorStyle = separatorIndex >= 0 ? style(textNodes[separatorIndex]) : null;
  const navGap = separatorStyle ? px(separatorStyle.marginLeft) : 0;
  if (separatorStyle && px(separatorStyle.marginRight) !== navGap) fail(`${kind} breadcrumb separator margin is not symmetric ${input.route}`);
  return {
    ...input,
    theme: screenRecord.theme,
    rect: { width: root.rect.width, height: root.rect.height },
    gap,
    leadingGap,
    navGap,
    dividerWidth,
    padding,
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
  // **Full · Trail · 뒤로 조합은 측정에서 뺐다(2026-10-08 밤, 앵커 54b62a8a).** 출처였던 하이라이트 상세 `?__phase=` 여섯이 하이라이트 새 화면
  // 갈래의 스튜디오 판(`HighlightStudioShell` — Gnb variant=create: 뒤로 단추 · 프로필만, 브레드크럼 없음)으로 바뀌어 이 바를 그리지 않는다.
  // 같은 바를 그리는 측정 화면은 세션 원장의 쇼츠 결과(「Highlight / 자리표시 쇼츠 제목」)뿐인데, 그 글자의 Figma 글리프 경계
  // (`figmaGlyphBounds`)는 라이브에 같은 글꼴 · 크기의 글자 노드가 없어 읽기만으로 잴 수 없다(2026-10-08 탐침 — 보드의 같은 글자는 28px 제목뿐).
  // 라이브 세트의 그 칸(1521:5349)은 지우지 않는다 — 렌더러는 계획의 측정 · 보존 어느 쪽에도 없는 이름을 만나면 던지므로(ensureSet,
  // 2026-10-09 LOUIS 적용이 그렇게 멈췄다) 이름만 `untouchedMobileInputs` 에 올려 손대지 않고 배치에서만 자리를 준다. 경계를 재면
  // 쇼츠 결과를 출처로 되살린다.
  // 통합 판(76b6cf15)에서 `/mypage/topup/fail` 의 바 글자가 「Subscription」 이 됐다 — 「My Page」 바(위 15/5 · 14/5 후보)의 출처를 같은 충전
  // 흐름의 `/mypage/topup/success` 로 옮긴다(같은 root path, 후보 roots 에 있다).
  { width: "Inset", breadcrumb: "Single", back: false, divider: true, route: "/mypage/topup/success", rootPath: "body.1.0.0.1.0.0" },
  { width: "Inset", breadcrumb: "Trail", back: false, divider: true, route: "/mypage/upgrade/billing-success", rootPath: "body.1.0.0.1.0.0" },
  { width: "Inset", breadcrumb: "Trail", back: true, divider: true, route: "/mypage/upgrade", rootPath: "body.1.0.0.1.0.0.0.0" },
];
// 모바일 세트에는 Content 축이 없어 `/archive` 는 `/settings` 와 같은 조합(Full·Single·False·On)이다.
// 그래서 측정 variant 로는 넣지 않고, 보존 variant 의 기하 출처로만 쓴다.
const PRESERVED_REASON = "보존 · 제품 출처 없음(라이브 허브 보드·legacy 인스턴스가 참조)";
const mobilePreservedInputs = [
  { width: "Full", breadcrumb: "Single", back: false, divider: true, route: "/archive", rootPath: "body.1.0.0.1.0.0.0.0" },
];
// **측정 출처가 사라졌지만 라이브 세트에 남아 있는 칸 — 이름만 싣고 측정하지 않는다(2026-10-09).** 렌더러는 이 칸을 지우지도
// 고치지도 않는다(모드 고정 · 칠 · 기하 · 설명 모두 그대로). 세트 격자 배치와 세트 크기 맞춤에서만 자리를 갖는다. 화면 치환
// 후보도 아니다 — 치환은 `variants` 만 읽는다. 이름은 2026-10-09 LOUIS 읽기 탐침으로 확인했다.
const UNTOUCHED_REASON = "측정 출처 사라짐 — 하이라이트 상세 `?__phase=` 가 스튜디오 판(바 없음)으로 바뀌었다(앵커 54b62a8a). 라이브 칸은 그대로 둔다";
const untouchedMobileInputs = [
  { width: "Full", breadcrumb: "Trail", back: true, divider: true }, // 라이브 1521:5349
];

const mobileSidebarProbe = screens["/settings"].vectorControlProbes?.navigationOpen;
if (
  !mobileSidebarProbe ||
  mobileSidebarProbe.svgRect.width !== DECLARED_TOGGLE_SVG ||
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
  //
  // 6fbdac16 → 6f6282c1(2026-09-14) 은 모바일과 같은 진짜 변경이다 — 프로필 버튼 36 → 32 와 그만큼 낮아진
  // 바. 여섯 다 nodeCount/routeCount 와 roots 의 (route, path, tag) 가 옛 fixture 와 같고 rect 만 다르다 —
  // 6/18 은 프로필 묶음(36 → 32), 15/4 · 14/4 · 17/3 · 16/3 은 바(높이 53 → 49), 5/3 은 바 가운데 줄
  // (y −2 · 폭 +4 — 프로필이 줄어든 만큼 넓어졌다):
  //   subtree-e1fe7ee1d038(6/18) → subtree-11bba9db9ef0
  //   subtree-685a4a4bfa2e(15/4) → subtree-ba7cbd8a0ce2
  //   subtree-caedd8a1445d(14/4) → subtree-fd281c1bcbbc
  //   subtree-be0ca032e800(17/3) → subtree-8a6691461153
  //   subtree-0733666e63fc(16/3) → subtree-8ac04d3f1453
  //   subtree-a36ea3231cff(5/3)  → subtree-8e576a12733a
  //
  // 6f6282c1 → 2c6bdacf(2026-09-15) 은 레일 폭이다 — 제품 `bc3e6fa3` 가 `--app-gnb-sidebar-width` 를 `min(280px, …)` 에서
  // `min(240px, …)` 로 줄여 카드 안 바가 왼쪽으로 40 넓어졌다. 다섯 다 nodeCount/routeCount 와 roots 의 (route, path, tag) 가 옛
  // fixture(HEAD)와 같고 rect 는 x −40 · 폭 +40 뿐이다(높이 · y 그대로). 프로필 묶음 6/18 은 오른쪽 끝에 붙어 있어 rect 까지 같아
  // id 가 그대로다:
  //   subtree-ba7cbd8a0ce2(15/4) → subtree-9650ff03cd07
  //   subtree-fd281c1bcbbc(14/4) → subtree-bab0168c7bfe
  //   subtree-8a6691461153(17/3) → subtree-ee83e5ff8b7f
  //   subtree-8ac04d3f1453(16/3) → subtree-b92008e236c0
  //   subtree-8e576a12733a(5/3)  → subtree-869dcbe1a654
  // 2026-09-26: 모바일 가드와 같은 사유로 걸친 라우트 수만 늘었다(18 → 27 · 4 → 6 · 3 → 5). id 와 nodeCount 는 그대로다.
  // 2026-10-08 재고정(a4125565 → 통합 판 76b6cf15): 모바일 가드와 같은 둘이다 — 노드 전부의 `fontFamily` 로 id 가 갈렸고, 프로필 묶음은
  // `/subscription/coupons` redirect 로 27 → 26, MyPage 바 둘은 바 글자가 「Subscription」 이 된 `/mypage/topup/fail` 이 빠져 6 → 5 다.
  // 17/5 · 16/5 · 5/5 는 라우트 수까지 그대로다. 구조 · rect 는 여섯 다 그대로다.
  //   subtree-11bba9db9ef0(6/27) → subtree-7f52f3f91e25(6/26)
  //   subtree-9650ff03cd07(15/6) → subtree-91e6a1c240cd(15/5)
  //   subtree-bab0168c7bfe(14/6) → subtree-d3cdd3988a01(14/5)
  //   subtree-ee83e5ff8b7f(17/5) → subtree-97349085415b
  //   subtree-b92008e236c0(16/5) → subtree-c80157b3010b
  //   subtree-869dcbe1a654(5/5)  → subtree-9cde2f3932a9
  // 2026-10-08 밤(앵커 54b62a8a): 프로필 묶음 26 → 20 — 모바일 가드와 같다(하이라이트 상세 `?__phase=` 여섯이 스튜디오 판으로 바뀌어 빠졌다).
  ["subtree-7f52f3f91e25", 6, 20],
  ["subtree-91e6a1c240cd", 15, 5],
  ["subtree-d3cdd3988a01", 14, 5],
  ["subtree-97349085415b", 17, 5],
  ["subtree-c80157b3010b", 16, 5],
  ["subtree-9cde2f3932a9", 5, 5],
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
  // 출처를 `/mypage/topup/fail` 에서 `/mypage/topup/success` 로 옮겼다 — 위 모바일 Inset · Single 과 같은 사유(통합 판에서 그 화면 바가 Subscription).
  { content: "MyPage", breadcrumb: "Single", back: false, divider: true, route: "/mypage/topup/success", rootPath: "body.1.0.0.1.0.0" },
  { content: "Subscription", breadcrumb: "Single", back: false, divider: true, route: "/subscription", rootPath: "body.1.0.0.1.0.0.0" },
  { content: "Subscription", breadcrumb: "Trail", back: false, divider: true, route: "/mypage/upgrade/billing-fail", rootPath: "body.1.0.0.1.0.0" },
  { content: "Subscription", breadcrumb: "Trail", back: true, divider: true, route: "/mypage/upgrade", rootPath: "body.1.0.0.1.0.0.0.0" },
  // Highlight 칸은 측정에서 뺐다 — 위 모바일 Full · Trail · 뒤로 조합과 같은 사유(2026-10-08 밤). 라이브 칸은 아래 untouched 로 남긴다.
];
const desktopPreservedInputs = [desktopVariantInputs[0]];
const untouchedDesktopInputs = [
  { content: "Highlight", breadcrumb: "Trail", back: true, divider: true }, // 라이브 1521:5599
];

const desktopSidebarProbe = fixture.screens["desktop-1920x1080"]["/settings"]
  .vectorControlProbes?.sidebarCollapse;
if (
  !desktopSidebarProbe ||
  desktopSidebarProbe.svgRect.width !== DECLARED_TOGGLE_SVG ||
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
const untouchedOf = (inputs) => inputs.map((input) => ({ name: variantName(input), reason: UNTOUCHED_REASON }));
const untouchedMobileVariants = untouchedOf(untouchedMobileInputs);
const untouchedDesktopVariants = untouchedOf(untouchedDesktopInputs);
for (const spec of [...mobileSets, ...desktopSets]) assertProfileVisual(spec);
for (const [kind, list, untouched] of [["mobile", mobileSets, untouchedMobileVariants], ["desktop", desktopSets, untouchedDesktopVariants]]) {
  const names = [...list.map(variantName), ...untouched.map((entry) => entry.name)];
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

const dividerSources = [
  sourceQuote(
    "apps/web/components/navigation/Gnb.tsx",
    476,
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

// **바의 Auto Layout 은 제품 선언이 정한다(2026-09-14).** 인용 여섯이 식의 출처다: 높이 하한을 끄고
// (`min-block-size:0`) 세로 패딩 8 을 주는 바, 남는 폭을 차지하고(`flex:1`) 넘치면 말줄임하는 제목.
const layoutSources = [
  [438, '    "[min-block-size:0]",'],
  [461, '    "[padding:8px_var(--mainchrome-pad-x)]",'],
  [315, '    "louis-app-top-bar__title",'],
  [317, '    "[flex:1]",'],
  [347, '    "[overflow:hidden]",'],
  [348, '    "[text-overflow:ellipsis]",'],
].map(([line, quote]) => sourceQuote(ringSourcePath, line, quote));
// 세트 variant 가 지켜야 할 축. 렌더러가 적용 뒤 스스로 대조하고(`layoutViolations`), 라이브는
// `figma-screens-live-check --sets` 가 같은 값을 읽어 대조한다 — 값을 세 곳에 따로 적지 않는다.
const layoutContract = {
  $why:
    "Product top bar declares no height: min-block-size 0 + padding 8 + tallest child + bottom hairline (layoutSources). " +
    "So the variant hugs vertically; its default width is the measured bar and consumers set FILL. Leading and trailing clusters hug their declared controls; the breadcrumb nav fills the rest and truncates the last label.",
  root: { layoutMode: "HORIZONTAL", layoutSizingHorizontal: "FIXED", layoutSizingVertical: "HUG", strokesIncludedInLayout: true },
  leading: { layoutMode: "HORIZONTAL", layoutSizingHorizontal: "HUG", layoutSizingVertical: "HUG" },
  breadcrumb: { layoutMode: "HORIZONTAL", layoutSizingHorizontal: "FILL", layoutSizingVertical: "HUG" },
  profile: { layoutSizingHorizontal: "FIXED", layoutSizingVertical: "FIXED" },
};

// **간격 · 헤어라인 변수는 되읽기(`figma/readback.json`)에서 이름과 값을 확인하고 묶는다.** 패딩 · gap 은
// 측정 px 과 값이 같은 `Klipse Primitive/spacing/<n>` 에, 아래 헤어라인은 제품 선언
// `var(--louis-border-width-hairline)`(Gnb.tsx:497)과 이름이 같은 `Klipse Semantic/border-width/hairline` 에 묶는다.
// 헤어라인은 **선택 두께**다 — 제품이 고른 토큰이 0.5 이고, 측정 border 1px 은 DPR 1 에서 브라우저가 올려
// 그린 결과다(`$hairline`). 그래서 Figma 의 HUG 높이는 측정 rect 가 아니라 선언 식을 따른다.
const readback = JSON.parse(readFileSync(resolve(repoRoot, "figma/readback.json"), "utf8"));
const liveFloat = (collection, name, seen = new Set()) => {
  const key = `${collection}::${name}`;
  if (seen.has(key)) fail(`circular Figma variable ${key}`);
  seen.add(key);
  const row = readback.collections?.[collection]?.rows?.find((entry) => entry[0] === name);
  if (!row || row[1] !== "FLOAT") fail(`figma/readback.json has no FLOAT variable ${key}`);
  const [[, alias, raw]] = row[3];
  if (alias) {
    const at = alias.indexOf("::");
    return liveFloat(alias.slice(0, at), alias.slice(at + 2), seen);
  }
  return raw;
};
const spacingValues = [...new Set([...mobileSets, ...desktopSets].flatMap((spec) => [
  spec.gap, spec.leadingGap, spec.navGap, spec.padding.top, spec.padding.right, spec.padding.bottom, spec.padding.left,
]))].filter((value) => value > 0).sort((a, b) => a - b);
const spacingBindings = Object.fromEntries(spacingValues.map((value) => {
  const name = `spacing/${value}`;
  if (liveFloat("Klipse Primitive", name) !== value) fail(`Klipse Primitive/${name} does not resolve to ${value}`);
  return [`spacing${value}`, { collection: "Klipse Primitive", name }];
}));
const hairlineBinding = { collection: "Klipse Semantic", name: "border-width/hairline" };
const hairlineFigmaValue = liveFloat(hairlineBinding.collection, hairlineBinding.name);
const measuredHairlines = [...new Set([...mobileSets, ...desktopSets].map((spec) => spec.dividerWidth))];
if (measuredHairlines.length !== 1 || !(hairlineFigmaValue > 0) || hairlineFigmaValue > measuredHairlines[0]) {
  fail(`hairline evidence no longer lines up: measured ${measuredHairlines.join("/")} · Figma ${hairlineFigmaValue}`);
}

const plan = {
  $comment: "Generated from migration/product.auth-fixture.json. Do not edit by hand.",
  $evidenceClass: "product-only measured Figma candidate; not a normative design-system contract",
  $figmaGlyphMeasurement:
    "Measured 2026-08-24 in OlYKERKOkgbxBEEoXGZW2c with temporary Pretendard Medium 14/21/-0.14 and 16/24/-0.16 text nodes; nodes were removed after reading natural WIDTH_AND_HEIGHT bounds. " +
    "Highlight and Clips were added 2026-09-13 by a read-only use_figma read of existing auto-sized (WIDTH_AND_HEIGHT) Pretendard Medium TEXT nodes on the generated /highlight/[projectId]?__phase=loading boards: " +
    "14px (-0.14px, line height 150% = 21px) 1248:13051 Highlight 57x21 and 1248:13053 Clips 32x21; 16px (-0.16px, 150% = 24px) 1247:13150 Highlight 65x24 and 1247:13152 Clips 36x24. " +
    "Cross-check in the same read: 1227:13358 Subscription 16px is 91x24, equal to the 2026-08-24 value. " +
    "The bar is an Auto Layout row that hugs its declared controls (layoutContract); measured rects only check that the product formula closes. Breadcrumb labels before the last are auto-width inside a horizontal nav spaced by the product separator margin (4px); the last label fills the nav and truncates at the end, so a label set through a TEXT property reflows instead of clipping. The runner reports any auto-width default label whose Figma width differs from these bounds (glyphDrift).",
  productCommit: fixture.productCommit,
  profileVisualSource: {
    avatar: avatarSource,
    ring: ringSourceLines,
    size: profileSizeSourceLines,
  },
  controlSource: toggleSourceLines,
  controlGlyphSource: toggleSvgSourceLines,
  layoutSources,
  $hairline: {
    declared: "var(--louis-border-width-hairline) — dividerSources[0]",
    figma: `${hairlineBinding.collection}/${hairlineBinding.name}`,
    figmaValue: hairlineFigmaValue,
    measuredBorderBottomWidth: measuredHairlines[0],
    note: "The measured border is the hairline as rasterized at device pixel ratio 1; Figma binds the declared token, so a hugging bar is padding + tallest child + the token value.",
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
    pageName: "90 · 자산 — 아이콘 · 로고 · 제품 부품",
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
      // `bg-surface` 하나를 읽는다(Gnb.tsx:470-476). fixture 는 light 문맥에서 쟀고, 측정 면
      // #fafafa 는 `Klipse Semantic Color[Light]/color/bg-surface → palette-gray/000` 과 값이
      // 같다. 라이브 세트가 물고 있던 `Klipse Primitive/color/palette-gray/800`(#2b2f36)도,
      // bg-surface 의 Dark 값(palette-gray/900 #171b22)도 측정과 다르다.
      surface: bindingOf("surface"),
      $surfaceSource: sourceQuote(
        "apps/web/components/navigation/Gnb.tsx",
        467,
        '    "[background:var(--louis-color-bg-surface)]",',
      ),
      // 제품 `border-bottom … var(--louis-color-stroke-hairline)`(Gnb.tsx:478). 알파는 변수가 갖는다.
      divider: bindingOf("divider"),
      profile: bindingOf("profile"),
      profileRingTrack: bindingOf("profileRingTrack"),
      current: bindingOf("current"),
      parent: bindingOf("parent"),
      control: bindingOf("control"),
      separator: bindingOf("separator"),
      // 패딩 · gap · 구분자 여백으로 측정된 값마다 하나(`spacingBindings`, 되읽기에서 값 확인).
      ...spacingBindings,
      // 아래 헤어라인 두께 — 제품 `var(--louis-border-width-hairline)` 과 같은 이름(`$hairline`).
      hairline: hairlineBinding,
      radius12: { collection: "Klipse Primitive", name: "radius/12" },
    },
    layoutContract,
    controlSize: DECLARED_CONTROL,
    iconSize: DECLARED_TOGGLE_SVG,
    profileVisual: { ...profileVisualConstants, controlSize: DECLARED_PROFILE.ringSize },
    typography: typographyOf("mobile", mobileSets),
    textProperties: textPropertiesOf(measuredMobileVariants),
    variants: measuredMobileVariants,
    preservedVariants: preservedMobileVariants,
    untouchedVariants: untouchedMobileVariants,
    desktopTopBar: {
      id: "product/desktop-app-top-bar",
      sectionName: "L · product/Desktop app top bar · measured component",
      componentSetName: "Product/Desktop App Top Bar",
      sourceCandidates: desktopCandidateContracts,
      iconSize: DECLARED_TOGGLE_SVG,
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
      untouchedVariants: untouchedDesktopVariants,
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
  // 폭은 세트의 기본값으로만 쓴다(소비처는 FILL). 높이는 싣지 않는다 — 렌더러가 HUG 로 두고 계산하게 한다.
  barWidth: spec.rect.width,
  gap: spec.gap,
  leadingGap: spec.leadingGap,
  navGap: spec.navGap,
  padding: spec.padding,
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
    untouchedVariants: untouchedMobileVariants.map((entry) => entry.name),
    desktopTopBar: {
      ...plan.component.desktopTopBar,
      sourceCandidates: undefined,
      glyphWidths: glyphWidths(desktopFigmaGlyphBounds),
      variants: measuredDesktopVariants.map(runnerVariant),
      preservedVariants: preservedDesktopVariants.map(runnerVariant),
      untouchedVariants: untouchedDesktopVariants.map((entry) => entry.name),
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
    `${measuredMobileVariants.length}+${preservedMobileVariants.length}+${untouchedMobileVariants.length} mobile · ${measuredDesktopVariants.length}+${preservedDesktopVariants.length}+${untouchedDesktopVariants.length} desktop top-bar variants (measured+preserved+untouched) · ` +
    `runner ${draw.length}/${RUNNER_LIMIT} chars · mobile candidates ${candidateContracts
      .map((entry) => `${entry.nodeCount}/${entry.routeCount}`)
      .join(", ")} · desktop candidates ${desktopCandidateContracts.map((entry) => `${entry.nodeCount}/${entry.routeCount}`).join(", ")} nodes/routes`,
);
