import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { atomicWriteBatch } from "./lib/atomic-output.mjs";
import { BINDING_POLICY, RENDERER_LIB, liveVariables, nestedFixedPaints, parseCssColor, sourceQuotes } from "./lib/figma-live-variables.mjs";
import { INSTANCE_TEXT_LIB, topBarTextProperties } from "./lib/figma-top-bar-text.mjs";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const fixture = JSON.parse(readFileSync(resolve(repoRoot, "migration/product.auth-fixture.json"), "utf8"));
const planPath = resolve(repoRoot, "figma/product-payment-scenes.plan.json");
const drawPath = resolve(repoRoot, "figma/product-payment-scenes.draw.js");
const templatePath = resolve(repoRoot, "scripts/templates/figma-product-payment-scenes-renderer.js");
const checkOnly = process.argv.includes("--check");
const productRoot = process.env.KLIPSE_PRODUCT_REPO ?? "/Users/sejunki/klipse-web";
const context = "desktop-1920x1080";
const screens = fixture.screens[context];
const styles = new Map(fixture.computedStyles.map((entry) => [entry.id, entry.value]));
const fail = (message) => { throw new Error(`[figma-product-payment-scenes] ${message}`); };
const screen = (route) => screens[route] ?? fail(`missing screen ${route}`);
const node = (route, path) => screen(route).tree.find((entry) => entry.path === path) ?? fail(`missing node ${route} ${path}`);
const style = (entry) => styles.get(entry.styleRef) ?? fail(`missing style ${entry.styleRef}`);
const px = (value) => Number(/^(-?[\d.]+)px$/.exec(value ?? "")?.[1] ?? 0);
// 색은 두 표기(`rgb()` 0~255 · `color(srgb …)` 0~1)로 온다 — 공용 헬퍼의 `parseCssColor` 가 둘을 가른다
// (형제 생성기 build-figma-product-app-shell.mjs 가 먼저 세운 파서를 옮긴 것).
const color = (value) => parseCssColor(value, fail);
const relRect = (entry, rootRect) => ({
  x: entry.rect.x - rootRect.x,
  y: entry.rect.y - rootRect.y,
  width: entry.rect.width,
  height: entry.rect.height,
});
const candidates = fixture.componentCandidateAudit.repeatedSubtreesByContext[context];
// 후보 id 는 정규화한 서브트리의 sha256 이라, 서브트리가 한 노드라도 달라지면 id 가 통째로
// 바뀐다. 제품 a3ed8e03 → ae8fd627 사이에 아바타가 LOUIS `.louis-avatar` 를 채택하면서
// 감싸는 span 이 하나 늘었고(`UserCircleDefaultAvatar.tsx` 의 박스가 `.louis-avatar__fallback`
// 로 내려가고 호출부가 `.louis-avatar` 박스를 갖는다 — `components/navigation/Gnb.tsx:1054`),
// 결제 결과 화면 상단 바의 아바타를 포함하는 네 후보가 전부 노드 +1 · id 변경이 되었다.
// 짝(route pair)과 root path 로 옛 후보를 새 후보에 대응시킨 결과:
//   subtree-52d9ec85500e(86, body.1, fail 짝)        → subtree-b99c9f9ca497(87)
//   subtree-5aa2dd10161d(82, body.1, success 짝)     → subtree-4066df48bad5(83)
//   subtree-201c9e9375a9(24, body.1.0.0.1, fail)     → subtree-af4ef3c26765(25)
//   subtree-7bba430c44a0(20, body.1.0.0.1, success)  → subtree-77de3059c30d(21)
// ── 두 번째 이동: 앵커 ae8fd627 → 5a67d692 ──
// 이번에는 **한 노드도 움직이지 않았다.** 여덟 후보 전부 nodeCount·routeCount·occurrenceCount·
// score 와 roots(route·path·tag·rect)가 옛 fixture 와 byte 단위로 같다 — 이 fixture 의 후보
// 67개가 전부 그렇다(desktop 51 + mobile 16, old-only·new-only 0). 바뀐 것은 id 뿐이다.
//
// id 의 재료인 정규화 서브트리에 `styleRef` 가 들어 있고, styleRef 는 「최초 등장 순서」 색인
// (`s0`, `s1`, …)이라 **해결된 값**이 한 칸이라도 달라지면 표가 통째로 재색인된다(구별되는
// 스타일 586 → 580). 그래서 구조가 그대로여도 67개 id 가 전부 갈린다.
//
// 그 「해결된 값」이 왜 움직였는지 넷 다 짚었다. 바뀐 노드의 `declared` 는 옛/새 fixture 가
// 동일하다 — 제품이 쓴 선언은 그대로이고 토큰이 가리키는 값만 옮겨졌다는 뜻이다:
//   · 메인 면의 boxShadow `color(srgb 0 0 0 / 0.08) 0 0 0 0.5px inset` → `none`.
//     제품 **bea43fe7** `fix(web): 손수 만든 메인 카드 9곳도 같은 프레임 오버레이를 쓰게 한다`
//     가 0.5px 프레임을 요소 **자신의** inset box-shadow 에서 `::after` 오버레이로 옮겼다
//     (가장자리까지 닿는 불투명 자식이 inset 그림자를 덮어 헤더 쪽 선만 사라지던 버그).
//     헤어라인은 지금도 그려진다 — 의사요소라 DOM 트리 측정에 안 잡힐 뿐이고, 그래서 노드
//     수가 그대로다.
//
//     **한 번 틀리게 적었다가 반증에서 잡혔다. 두 가지가 틀렸었다.**
//     (가) 커밋을 `361f813f` 로 지목했는데 그 커밋은 `apps/web/app/globals.css` **한 파일만**
//     건드린다(`git show --name-only 361f813f`). 그것은 공용 `.appMainCardChromeSurface` 를
//     옮긴 것이고, 결제 화면을 실제로 바꾼 것은 아홉 개 page.tsx 를 건드린 `bea43fe7` 이다.
//     (나) 결제 결과 화면의 `<main>` 을 `myPageSceneStyles.ts` 의
//     `contentWithAppSidebarPanel` 이라고 적었는데 **아니다.** 각 페이지가 파일 안에 직접
//     가진 `STATUS_MAIN` 이다(`billing-success/page.tsx:51`, `<main className={STATUS_MAIN}>`
//     :416-417). 그래서 공용 클래스를 옮긴 커밋으로는 이 화면이 설명되지 않는다 —
//     설명이 되는 것처럼 보였던 것이 오귀속의 신호였다.
//   · gray-100 `0.945098 0.945098 0.952941` → `0.866667 0.870588 0.878431`
//   · gray-600 `0.466667 0.490196 0.537255` → `0.341176 0.364706 0.403922`
//   · gray-700 `0.341176 0.364706 0.407843` → `0.25098 0.270588 0.309804`
//     셋 다 LOUIS 회색 램프를 지각 균일로 다시 잡은 결과다(LOUIS 37509da·ff6fa89·5c1137c·
//     888d1a3·3ec5966). 제품은 핀을 425a9c3 → 3ec5966 으로 올려 받았고(08dc52c4·63c63baf·
//     cdab8226·5a67d692), 함께 사라진 050·150 별칭은 3d604624 가 걷었다. 세 값 모두 새 램프의
//     같은 칸과 정확히 일치한다 — 임의로 흘러간 색이 아니다.
//
// 기하는 한 픽셀도 안 움직였다: page 1920×1080 · main 1628×1004 · radius 16 ·
// padding 0/24/56/24, 모바일 402×874 · 402×810 · 0/16/40/16, page·main 배경색도 그대로다.
// 즉 아래 계약에서 옮길 것은 **id 여덟 개뿐**이고 nodeCount·routeCount 는 손대지 않는다.
// 짝(route pair)과 root path 로 대응시킨 결과:
//   subtree-b99c9f9ca497(87, body.1, fail 짝)        → subtree-d017e3c29303
//   subtree-4066df48bad5(83, body.1, success 짝)     → subtree-d843ea7725e7
//   subtree-af4ef3c26765(25, body.1.0.0.1, fail)     → subtree-48b751ac1e30
//   subtree-77de3059c30d(21, body.1.0.0.1, success)  → subtree-6dd1be31e112
//
// ── 세 번째 이동: 앵커는 그대로 5a67d692, 움직인 것은 측정기다 ──
// 제품은 한 걸음도 안 움직였다 — 새 fixture 의 `productCommit` 도 `5a67d692` 다. 고친 것은
// 측정기 쪽 결함 둘이다. (1) `styleRef` 가 「최초 등장 순서」 **자리번호**였다 — 위 두 번째
// 이동에서 67개 id 를 통째로 재색인에 휩쓸리게 한 바로 그 원인이다. 그것을 **스타일 내용의
// 해시**로 바꿨다. (2) `content-visibility: auto` 가 화면 밖 서브트리를 렌더링에서 걷어내
// 측정을 갉을 때가 있었다 — 측정 전에 페이지를 끝까지 훑어 래치를 풀도록 못박았다.
// 같은 앵커에서 다시 재고(52분, exit 0) 옛 측정과 전수 대조했다: 후보 수 desktop 51 → 51 ·
// mobile 16 → 16, 서명(nodeCount·routeCount·occurrenceCount·score·roots) 다중집합 불일치
// **0**, computedStyles 580 → 579. 즉 구조는 한 곳도 안 움직였고 id 체계만 한 번 갈렸다.
// 아래 대응은 그 서명으로 옛→새 id 를 1:1 로 이어 붙인 것이다.
// **이것이 마지막 일괄 이동이다.** styleRef 가 더는 자리번호가 아니므로, 앞으로 id 가 갈리는
// 자리는 그 서브트리의 값이 **실제로 바뀐 자리**뿐이다 — 다음에 이 가드가 물면 이름 갈림이
// 아니라 진짜 변경이니 그렇게 읽어라.
//   subtree-d017e3c29303(87, body.1, fail 짝)        → subtree-708f3483317a
//   subtree-d843ea7725e7(83, body.1, success 짝)     → subtree-4f5aa4e9cf22
//   subtree-48b751ac1e30(25, body.1.0.0.1, fail)     → subtree-0f24f9093a95
//   subtree-6dd1be31e112(21, body.1.0.0.1, success)  → subtree-71e9f8d4cba7
// 2026-09-11 재고정(f19cc41c → 38a7d5a4). 앞의 예고대로 **진짜 변경**이고 원인은 제품
// `658ece13`「사이드바에서 + 버튼을 걷고…」의 -4 노드다 — Canvas·Composition 두 행의
// `<button>` + `<svg>`(NavPlusGlyph) **두 쌍**이다. path 자식은 측정 트리에 실려 있지 않았다
// (2026-09-13 정정: 전에는 「NavPlusGlyph svg+path2 와 button」, 즉 버튼 하나로 적었다. 확인은
// `git show 7f41d5a^:` 과 `git show 4ebbe46:` 의 migration/product.auth-fixture.json 에서
// desktop 두 짝의 route 넷(billing-change-fail·topup-fail 87 → 83, billing-change-success·
// topup-success 83 → 79)의 `body.1` 아래 노드를 path 로 견준 것 — 넷 다 사라진 노드는
// `body.1.0.0.0.0.1.0.2.0.0.1` button·그 `.0` svg, `body.1.0.0.0.0.1.0.3.0.0.1` button·그 `.0`
// svg 뿐이고 더해진 노드 0).
// 결제 장면은 헤더를, 헤더는 사이드바를 품으므로 같은 -4 가 여기까지 올라온다.
// 판정은 `roots`(route·path·tag·rect) 바이트 동일 + nodeCount/score 만 이동으로 했다:
//   subtree-ed47f43c48b1(87, body.1, fail 짝)    → subtree-6dff099f5193(83)
//   subtree-6ba92d715b72(83, body.1, success 짝) → subtree-11c231002ba4(79)
// **nodeCount 로 고르면 틀린다** — 새 83 은 옛 83 이 아니라 옛 87 이 줄어든 것이다.
// 기하 가드(아래)는 rect 가 전부 그대로여서 건드리지 않는다.
// 2026-09-14 재고정(6fbdac16 → 6f6282c1). 넷 다 nodeCount · routeCount · score 와 `roots`(route · path · tag ·
// rect)가 옛 fixture(`918c42d:`)와 **바이트까지 같고** id 만 갈렸다. 네 후보 모두 상단 바를 품는데, 바 안의
// 프로필 버튼이 36 → 32(제품 `profileTrigger`)로 줄고 바가 그만큼 낮아져 서브트리 내용 해시가 움직였다 — 루트
// 상자는 main 카드 · 페이지 루트라 그대로다:
//   subtree-6dff099f5193(83, body.1, fail 짝)        → subtree-089233c2f2ee
//   subtree-11c231002ba4(79, body.1, success 짝)     → subtree-dbfe1829e8a7
//   subtree-ea6c9f0dfd59(25, body.1.0.0.1, fail)     → subtree-1ae30fbe2788
//   subtree-f034cc084ea1(21, body.1.0.0.1, success)  → subtree-ffbed6e9546f
const candidateContracts = [
  ["subtree-089233c2f2ee", 83, 2],
  ["subtree-dbfe1829e8a7", 79, 2],
  ["subtree-1ae30fbe2788", 25, 2],
  ["subtree-ffbed6e9546f", 21, 2],
].map(([id, nodeCount, routeCount]) => {
  const candidate = candidates.find((entry) => entry.id === id);
  if (!candidate || candidate.nodeCount !== nodeCount || candidate.routeCount !== routeCount) {
    fail(`measured payment scene candidate ${id} changed; inspect before regenerating Figma`);
  }
  return candidate;
});
const mobileCandidates = fixture.componentCandidateAudit.repeatedSubtreesByContext["mobile-402x874"];
// 모바일도 같은 아바타 span 한 개 때문에 네 후보가 전부 노드 +1 · id 변경이다.
// 넷 다 fail 짝(billing-change-fail · topup/fail)이고 root path 로 대응한다:
//   subtree-73a30a28794e(27, body.1)       → subtree-9640dfc0e390(28)
//   subtree-d79fa46213b4(26, body.1.0)     → subtree-9704504060de(27)
//   subtree-70ba76fddd21(25, body.1.0.0)   → subtree-ae47ccf88a5d(26)
//   subtree-9be5ba2fce8c(24, body.1.0.0.1) → subtree-8efeaf2c546f(25)
// 모바일도 같은 이동이다 — 구조·기하 그대로, `styleRef` 재색인으로 id 만 갈렸다. 넷 다
// fail 짝(billing-change-fail · topup/fail)이고 root path 로 대응한다:
//   subtree-9640dfc0e390(28, body.1)       → subtree-73b90f7c1ccd
//   subtree-9704504060de(27, body.1.0)     → subtree-124ec1ebd803
//   subtree-ae47ccf88a5d(26, body.1.0.0)   → subtree-25acb8040b2f
//   subtree-8efeaf2c546f(25, body.1.0.0.1) → subtree-918343b944e5
// 모바일도 같은 세 번째 이동이다 — 측정기의 styleRef 가 자리번호에서 내용 해시로 바뀌어 id 만
// 갈렸고, 서명 전수 대조에서 불일치 0 이었다. root path 대응은 그대로다:
//   subtree-73b90f7c1ccd(28, body.1)       → subtree-3dc02b6b63cf
//   subtree-124ec1ebd803(27, body.1.0)     → subtree-138bcfafd15b
//   subtree-25acb8040b2f(26, body.1.0.0)   → subtree-ba57b7970eb9
//   subtree-918343b944e5(25, body.1.0.0.1) → subtree-43750710c66c
// 모바일도 같은 회차 · 같은 이유다 — 서명과 roots 가 옛 fixture 와 바이트까지 같고 id 만 갈렸다:
//   subtree-2425ad25b02e(28, body.1)       → subtree-c3e5d0ca4f18
//   subtree-50076969733f(27, body.1.0)     → subtree-54960c3c0d87
//   subtree-a6ba0dac2ab4(26, body.1.0.0)   → subtree-20e63d295b79
//   subtree-60ed0dd6bac4(25, body.1.0.0.1) → subtree-cbbe72fde43b
const mobileCandidateContracts = [
  ["subtree-c3e5d0ca4f18", 28, 2],
  ["subtree-54960c3c0d87", 27, 2],
  ["subtree-20e63d295b79", 26, 2],
  ["subtree-cbbe72fde43b", 25, 2],
].map(([id, nodeCount, routeCount]) => {
  const candidate = mobileCandidates.find((entry) => entry.id === id);
  if (!candidate || candidate.nodeCount !== nodeCount || candidate.routeCount !== routeCount) {
    fail(`measured mobile payment scene candidate ${id} changed; inspect before regenerating Figma`);
  }
  return candidate;
});

/* **메인 표면과 장면은 흐름이다(2026-09-14, 크기 굳힘 감사 묶음 3).** 옛 가드는 page · main 의 측정 rect 를
   `!== 1920/1080 · 1632/1012 · 402/874 · 402/814` 로 물었고, 렌더러가 그 rect 로 resize 하고 상단 바 · 본문을 측정
   x/y 에 박았다 — 셸 토큰 한 칸(2026-09-09 링 12 → 8)이나 상단 바 높이(2026-09-14 프로필 36 → 32)가 움직일 때마다
   가드 숫자와 라이브 캔버스가 함께 낡았다. 이제 계획은 **선언이 정한 값**을 싣는다(형제 생성기
   build-figma-product-checkout-status 의 `sceneSpec` 과 같은 규칙):
     · 장면: 셸 패딩(`pt-[var(--app-gnb-safe-top)]` · `pb-[…rail-padding-bottom]` 계산값)과 main 의 좌우 margin
       (`ml-[var(--app-gnb-sidebar-width)]` · `mr-[var(--app-gnb-main-inline-padding-end)]` 계산값). 사이드바는
       `position: fixed` 라 흐름 밖이다.
     · 메인 표면: 패딩, 최소 높이(`min-height: calc(100dvh − …)` 을 이 뷰포트에서 푼 값 — 마스터의 뷰포트 기본 높이),
       상단 바 bleed(`margin-left: calc(-1 * var(--mainchrome-bleed-left, …))` 계산값), 본문 위 여백
       (`margin-top: clamp(56px, 10vh, 120px)` · ≤900 `calc(56px)` 계산값).
   숫자 가드는 없다 — 선언이 있는지와, 측정 rect 가 그 값들로 **닫히는지**(원장 대조)만 본다. */
const declaredValue = (entry, property, pattern, where) => {
  const value = entry.declared?.[property];
  if (typeof value !== "string" || !pattern.test(value)) {
    fail(`${where} ${entry.path}: declared ${property} ${JSON.stringify(value)} does not match ${pattern}`);
  }
  return value;
};
const padding = (computed) => ({
  top: px(computed.paddingTop), right: px(computed.paddingRight),
  bottom: px(computed.paddingBottom), left: px(computed.paddingLeft),
});
const sceneLayout = (contextName, route) => {
  const where = `${contextName} ${route}`;
  const tree = fixture.screens[contextName]?.[route]?.tree ?? fail(`missing screen ${where}`);
  const at = (path) => tree.find((entry) => entry.path === path) ?? fail(`missing node ${where} ${path}`);
  const page = at("body.1");
  const shell = at("body.1.0.0");
  const main = at("body.1.0.0.1");
  const slot = at("body.1.0.0.1.0");
  const bar = at("body.1.0.0.1.0.0");
  const content = at("body.1.0.0.1.1");
  const shellStyle = style(shell);
  const mainStyle = style(main);
  const barStyle = style(bar);
  const layout = {
    page: { padding: { top: px(shellStyle.paddingTop), right: px(mainStyle.marginRight), bottom: px(shellStyle.paddingBottom), left: px(mainStyle.marginLeft) } },
    main: {
      padding: padding(mainStyle),
      minHeight: px(mainStyle.minHeight),
      bleed: { left: -px(barStyle.marginLeft), right: -px(barStyle.marginRight) },
      barGap: px(style(slot).marginBottom),
      contentTop: px(style(content).marginTop),
      declared: {
        minHeight: declaredValue(main, "min-height", /^calc\(100dvh - /, where),
        marginLeft: declaredValue(main, "margin-left", /--app-gnb-sidebar-width/, where),
        barMarginLeft: declaredValue(bar, "margin-left", /--mainchrome-bleed-left/, where),
        contentMarginTop: declaredValue(content, "margin-top", /^(clamp|calc)\(/, where),
      },
    },
  };
  const closes =
    main.rect.x === page.rect.x + layout.page.padding.left &&
    main.rect.y === page.rect.y + layout.page.padding.top &&
    main.rect.width === page.rect.width - layout.page.padding.left - layout.page.padding.right &&
    main.rect.height === layout.main.minHeight &&
    bar.rect.x === main.rect.x + layout.main.padding.left - layout.main.bleed.left &&
    // 바 폭은 선언(`width: calc(100% + bleed…)`)이 정한다 — 메인 패딩에서 bleed 를 뺀 안쪽을 채운다. 렌더러의 FILL 이 이것이다.
    bar.rect.width === main.rect.width - (layout.main.padding.left - layout.main.bleed.left) - (layout.main.padding.right - layout.main.bleed.right) &&
    content.rect.y === bar.rect.y + bar.rect.height + layout.main.barGap + layout.main.contentTop;
  if (!closes) fail(`${where}: measured scene rects no longer close over the declared shell values`);
  return layout;
};

const representativeRoute = "/mypage/upgrade/billing-change-fail";
const pageRoot = node(representativeRoute, "body.1");
const main = node(representativeRoute, "body.1.0.0.1");
const pageStyle = style(pageRoot);
const mainStyle = style(main);
const layout = sceneLayout(context, representativeRoute);

const dependencies = {
  gnbSet: "Product/Gnb Desktop Shell",
  gnbVariant: "Current=Default",
  topBarSet: "Product/Desktop App Top Bar",
  topBarVariant: "Content=MyPage, Breadcrumb=Single, Back=False, Divider=On",
  mobileTopBarSet: "Product/Mobile App Top Bar",
  mobileTopBarVariant: "Width=Inset, Breadcrumb=Single, Back=False, Divider=On",
  resultSet: "Product/Payment Result Content",
};
// 상단 바 인스턴스의 TEXT 속성은 그 route 의 측정 바 글자로 채운다(`scripts/lib/figma-top-bar-text.mjs`).
const appShellPlan = JSON.parse(readFileSync(resolve(repoRoot, "figma/product-app-shell.plan.json"), "utf8"));
if (appShellPlan.productCommit !== fixture.productCommit) fail("figma/product-app-shell.plan.json is not at this fixture anchor — run build-figma-product-app-shell first");

const variants = [
  { outcome: "Failure", route: "/mypage/upgrade/billing-change-fail" },
  { outcome: "PlanDelayed", route: "/mypage/upgrade/billing-change-success" },
  { outcome: "TopupDelayed", route: "/mypage/topup/success" },
].map((entry) => {
  const routeMain = node(entry.route, "body.1.0.0.1");
  const routeTopBar = node(entry.route, "body.1.0.0.1.0.0");
  const routeContent = node(entry.route, "body.1.0.0.1.1");
  if (JSON.stringify(routeMain.rect) !== JSON.stringify(main.rect)) fail(`main rect drift ${entry.route}`);
  if (JSON.stringify(sceneLayout(context, entry.route)) !== JSON.stringify(layout)) fail(`scene layout drift ${entry.route}`);
  return {
    ...entry,
    mainRect: relRect(routeMain, pageRoot.rect),
    topBarRect: relRect(routeTopBar, routeMain.rect),
    contentRect: relRect(routeContent, routeMain.rect),
    topBarText: topBarTextProperties({ tree: screen(entry.route).tree, bar: routeTopBar, appShellPlan, set: dependencies.topBarSet, variant: dependencies.topBarVariant, fail, where: `${context} ${entry.route}` }),
  };
});
const mobileRoot = fixture.screens["mobile-402x874"][representativeRoute].tree.find((entry) => entry.path === "body.1") ??
  fail("missing mobile payment page root");
const mobileMain = fixture.screens["mobile-402x874"][representativeRoute].tree.find((entry) => entry.path === "body.1.0.0.1") ??
  fail("missing mobile payment main");
const mobileMainStyle = style(mobileMain);
const mobileLayout = sceneLayout("mobile-402x874", representativeRoute);
const mobileVariants = [
  { outcome: "Failure", route: "/mypage/upgrade/billing-change-fail" },
  { outcome: "PlanDelayed", route: "/mypage/upgrade/billing-change-success" },
  { outcome: "TopupDelayed", route: "/mypage/topup/success" },
].map((entry) => {
  const mobileScreen = fixture.screens["mobile-402x874"][entry.route];
  const routeMain = mobileScreen.tree.find((node) => node.path === "body.1.0.0.1") ?? fail(`missing mobile main ${entry.route}`);
  const routeTopBar = mobileScreen.tree.find((node) => node.path === "body.1.0.0.1.0.0") ?? fail(`missing mobile top bar ${entry.route}`);
  const routeContent = mobileScreen.tree.find((node) => node.path === "body.1.0.0.1.1") ?? fail(`missing mobile content ${entry.route}`);
  if (JSON.stringify(routeMain.rect) !== JSON.stringify(mobileMain.rect)) fail(`mobile main rect drift ${entry.route}`);
  if (JSON.stringify(sceneLayout("mobile-402x874", entry.route)) !== JSON.stringify(mobileLayout)) fail(`mobile scene layout drift ${entry.route}`);
  return {
    ...entry,
    mainRect: relRect(routeMain, mobileRoot.rect),
    topBarRect: relRect(routeTopBar, routeMain.rect),
    contentRect: relRect(routeContent, routeMain.rect),
    topBarText: topBarTextProperties({ tree: mobileScreen.tree, bar: routeTopBar, appShellPlan, set: dependencies.mobileTopBarSet, variant: dependencies.mobileTopBarVariant, fail, where: `mobile-402x874 ${entry.route}` }),
  };
});

// 본문 인스턴스의 폭 축은 결제 결과 세트의 계획이 소유한다(`width.mode` — 데스크톱 선언 상한 FIXED · 모바일 FILL).
const componentsPlan = JSON.parse(readFileSync(resolve(repoRoot, "figma/product-components.plan.json"), "utf8"));
if (componentsPlan.productCommit !== fixture.productCommit) fail("figma/product-components.plan.json is not at this fixture anchor — run build-figma-product-components first");
const resultWidthMode = (outcome, viewport) =>
  componentsPlan.component.paymentResult.variants.find((entry) => entry.outcome === outcome && entry.viewport === viewport)?.width.mode ??
  fail(`components plan has no payment result ${outcome}/${viewport}`);
for (const entry of variants) entry.contentWidth = resultWidthMode(entry.outcome, "Desktop");
for (const entry of mobileVariants) entry.contentWidth = resultWidthMode(entry.outcome, "Mobile");
const live = liveVariables({ repoRoot, fail });
for (const radius of [px(mainStyle.borderTopLeftRadius), px(mobileMainStyle.borderTopLeftRadius)]) {
  live.radiusBinding(radius, "radius/16", "measured payment main");
}
const spacingBindings = Object.fromEntries([...new Set([layout, mobileLayout].flatMap(({ main: L }) => [
  L.padding.left - L.bleed.left, L.padding.right - L.bleed.right, L.padding.bottom, L.bleed.left, L.bleed.right, L.barGap,
]))].filter((value) => value > 0).sort((a, b) => a - b).flatMap((value) => live.spacingBinding(value)));

/* **색은 라이브 변수에 역할로 묶는다(2026-09-14, 컬렉션 이전).** 옛 계획은 은퇴한 `1 · Palette[sidebar]` 의
   `palette/gray-200`(장면) · `palette/gray-100`(메인) 과 `2 · Semantic[light-sidebar]` 의 `gray/000 · a78` · `a52`(문서
   글자)를 실어 라이브에서 첫머리에 던졌고, 모바일 장면도 데스크톱과 같은 바닥 변수로 칠했다 — 측정은 둘이 다르다
   (≤719 에서 `--app-page-bg` 가 `bg-surface` 로 올라간다). 이제 자리마다 측정 색과 값이 같은 역할을 고르고 대조표를
   `colorEvidence` 에 싣는다. 측정 fixture 는 light 라 `Klipse Semantic Color[Light]` 로 푼다. */
const quote = sourceQuotes({ repoRoot, productRoot, productCommit: fixture.productCommit, fail });
const PAGE = "apps/web/app/mypage/upgrade/billing-change-fail/page.tsx";
const GLOBALS = "apps/web/app/globals.css";
const roles = live.colorRoles({
  theme: "light",
  where: "payment-scenes",
  roles: {
    appPageBg: {
      name: "color/bg-canvas",
      declared: [quote.product(PAGE, 32, '  "bg-[var(--app-page-bg)]!",'), quote.product(GLOBALS, 791, "  --app-page-bg: var(--louis-color-bg-canvas);")],
    },
    appPageBgNarrow: {
      name: "color/bg-surface",
      declared: [quote.product(PAGE, 32, '  "bg-[var(--app-page-bg)]!",'), quote.product(GLOBALS, 1068, "    --app-page-bg: var(--louis-color-bg-surface);")],
    },
    appMainCardBg: {
      name: "color/bg-surface",
      declared: [quote.product(PAGE, 53, '  "bg-[var(--app-main-card-bg)]",'), quote.product(GLOBALS, 792, "  --app-main-card-bg: var(--louis-color-bg-surface);")],
    },
    boardSurface: { name: "color/bg-canvas", annotation: "section fill behind the sets (board canvas, not a product surface)" },
    docsTitle: { name: "color/fg-primary", annotation: "documentation frame title" },
    docsNote: { name: "color/fg-secondary", annotation: "documentation frame note" },
  },
});
const pagePaint = roles.paintFor(["appPageBg", "appPageBgNarrow"], color(pageStyle.backgroundColor), "desktop page");
const mainPaint = roles.paintFor(["appMainCardBg"], color(mainStyle.backgroundColor), "desktop main");
const mobilePagePaint = roles.paintFor(["appPageBg", "appPageBgNarrow"], color(style(mobileRoot).backgroundColor), "mobile page");
const mobileMainPaint = roles.paintFor(["appMainCardBg"], color(mobileMainStyle.backgroundColor), "mobile main");
// 결과 route 셋이 같은 면을 쓰는지 — 대표 route 로 칠하므로 나머지가 다르면 멈춘다.
for (const [contextName, entries] of [[context, variants], ["mobile-402x874", mobileVariants]]) {
  for (const entry of entries) {
    const tree = fixture.screens[contextName][entry.route].tree;
    const at = (path) => tree.find((item) => item.path === path) ?? fail(`missing ${contextName} ${entry.route} ${path}`);
    const where = `${contextName} ${entry.route}`;
    const expected = contextName === context ? [pagePaint, mainPaint] : [mobilePagePaint, mobileMainPaint];
    if (roles.paintFor(["appPageBg", "appPageBgNarrow"], color(style(at("body.1")).backgroundColor), `${where} page`) !== expected[0] ||
      roles.paintFor(["appMainCardBg"], color(style(at("body.1.0.0.1")).backgroundColor), `${where} main`) !== expected[1]) {
      fail(`${where}: page or main surface role differs from ${representativeRoute}`);
    }
  }
}
const colors = roles.finish();

const plan = {
  $comment: "Generated from migration/product.auth-fixture.json. Do not edit by hand.",
  $evidenceClass: "product-only measured Figma composition; not a normative design-system contract",
  productCommit: fixture.productCommit,
  context,
  sourceCandidates: candidateContracts,
  component: {
    id: "product/desktop-payment-result-scenes",
    pageId: "240:3529",
    pageName: "90 · ASSETS — 출처별 (logo · tile · icon · root · .glyph · .authored)",
    sectionName: "M · product/Desktop payment result scenes · measured composition",
    mainSetName: "Product/Desktop Payment Result Main Surface",
    sceneSetName: "Product/Desktop Payment Result Scene",
    dependencies,
    page: {
      rect: { width: pageRoot.rect.width, height: pageRoot.rect.height },
      background: color(pageStyle.backgroundColor),
      paint: pagePaint,
    },
    main: {
      rect: { width: main.rect.width, height: main.rect.height },
      background: color(mainStyle.backgroundColor),
      paint: mainPaint,
      radius: px(mainStyle.borderTopLeftRadius),
      padding: padding(mainStyle),
    },
    layout,
    variants,
    mobile: {
      mainSetName: "Product/Mobile Payment Result Main Surface",
      sceneSetName: "Product/Mobile Payment Result Scene",
      sourceCandidates: mobileCandidateContracts,
      page: {
        rect: { width: mobileRoot.rect.width, height: mobileRoot.rect.height },
        background: color(style(mobileRoot).backgroundColor),
        paint: mobilePagePaint,
      },
      main: {
        rect: { width: mobileMain.rect.width, height: mobileMain.rect.height },
        background: color(mobileMainStyle.backgroundColor),
        paint: mobileMainPaint,
        radius: px(mobileMainStyle.borderTopLeftRadius),
        padding: padding(mobileMainStyle),
      },
      layout: mobileLayout,
      variants: mobileVariants,
    },
    $bindingPolicy: BINDING_POLICY,
    bindings: live.assertBindings({
      ...colors.bindings,
      radius16: { collection: "Klipse Primitive", name: "radius/16" },
      ...spacingBindings,
    }, "payment-scenes bindings"),
    colorEvidence: colors.evidence,
    // 품은 사이드바 셸 · 결과 본문 · 상단 바 인스턴스 속의 고정 역할(그 러너 계획의 `bindings.unbound`) — 감사가 인스턴스 안에서만 받는다.
    nestedFixedPaints: nestedFixedPaints({ repoRoot, fail, productCommit: fixture.productCommit, plans: ["figma/product-components.plan.json", "figma/product-app-shell.plan.json"] }),
  },
};
const summary = ({ id, nodeCount, routeCount, occurrenceCount, score }) => ({ id, nodeCount, routeCount, occurrenceCount, score });
const runnerPlan = structuredClone(plan);
runnerPlan.sourceCandidates = plan.sourceCandidates.map(summary);
runnerPlan.component.mobile.sourceCandidates = plan.component.mobile.sourceCandidates.map(summary);
// 선언 문자열은 계획(감사본)에만 남긴다 — 러너는 값만 읽는다.
delete runnerPlan.component.layout.main.declared;
delete runnerPlan.component.mobile.layout.main.declared;
// 색은 역할 이름(`paint`)으로만 싣는다 — 측정 색 · 대조표 · 사유는 계획에 남는다.
delete runnerPlan.component.$bindingPolicy;
delete runnerPlan.component.colorEvidence;
for (const surface of [runnerPlan.component, runnerPlan.component.mobile]) {
  delete surface.page.background;
  delete surface.main.background;
}
const draw =
  "// Generated by scripts/build-figma-product-payment-scenes.mjs. Do not edit by hand.\n" +
  "// Pass this file verbatim to use_figma. It composes only measured existing product components.\n" +
  `const PLAN=${JSON.stringify(runnerPlan)};\n` +
  readFileSync(resolve(repoRoot, RENDERER_LIB), "utf8") +
  readFileSync(resolve(repoRoot, INSTANCE_TEXT_LIB), "utf8") +
  readFileSync(templatePath, "utf8");
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
console.log(`[figma-product-payment-scenes] ${checkOnly ? "checked" : "built"} @ ${fixture.productCommit.slice(0, 8)}: ${variants.length} desktop + ${mobileVariants.length} mobile outcomes · desktop candidates ${candidateContracts.map((entry) => `${entry.nodeCount}/${entry.routeCount}`).join(", ")} · mobile candidates ${mobileCandidateContracts.map((entry) => `${entry.nodeCount}/${entry.routeCount}`).join(", ")} nodes/routes`);
