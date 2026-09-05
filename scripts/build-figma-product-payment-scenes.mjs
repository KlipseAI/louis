import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { atomicWriteBatch } from "./lib/atomic-output.mjs";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const fixture = JSON.parse(readFileSync(resolve(repoRoot, "migration/product.auth-fixture.json"), "utf8"));
const planPath = resolve(repoRoot, "figma/product-payment-scenes.plan.json");
const drawPath = resolve(repoRoot, "figma/product-payment-scenes.draw.js");
const templatePath = resolve(repoRoot, "scripts/templates/figma-product-payment-scenes-renderer.js");
const checkOnly = process.argv.includes("--check");
const context = "desktop-1920x1080";
const screens = fixture.screens[context];
const styles = new Map(fixture.computedStyles.map((entry) => [entry.id, entry.value]));
const fail = (message) => { throw new Error(`[figma-product-payment-scenes] ${message}`); };
const screen = (route) => screens[route] ?? fail(`missing screen ${route}`);
const node = (route, path) => screen(route).tree.find((entry) => entry.path === path) ?? fail(`missing node ${route} ${path}`);
const style = (entry) => styles.get(entry.styleRef) ?? fail(`missing style ${entry.styleRef}`);
const px = (value) => Number(/^(-?[\d.]+)px$/.exec(value ?? "")?.[1] ?? 0);
const color = (value) => {
  const match = /^rgba?\(\s*([\d.]+)[,\s]+([\d.]+)[,\s]+([\d.]+)(?:[,/\s]+([\d.]+))?\s*\)$/.exec(value ?? "");
  if (!match) fail(`unsupported color ${value}`);
  return [Number(match[1]) / 255, Number(match[2]) / 255, Number(match[3]) / 255, match[4] === undefined ? 1 : Number(match[4])];
};
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
const candidateContracts = [
  ["subtree-708f3483317a", 87, 2],
  ["subtree-4f5aa4e9cf22", 83, 2],
  ["subtree-0f24f9093a95", 25, 2],
  ["subtree-71e9f8d4cba7", 21, 2],
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
const mobileCandidateContracts = [
  ["subtree-3dc02b6b63cf", 28, 2],
  ["subtree-138bcfafd15b", 27, 2],
  ["subtree-ba57b7970eb9", 26, 2],
  ["subtree-43750710c66c", 25, 2],
].map(([id, nodeCount, routeCount]) => {
  const candidate = mobileCandidates.find((entry) => entry.id === id);
  if (!candidate || candidate.nodeCount !== nodeCount || candidate.routeCount !== routeCount) {
    fail(`measured mobile payment scene candidate ${id} changed; inspect before regenerating Figma`);
  }
  return candidate;
});

const representativeRoute = "/mypage/upgrade/billing-change-fail";
const pageRoot = node(representativeRoute, "body.1");
const main = node(representativeRoute, "body.1.0.0.1");
const topBar = node(representativeRoute, "body.1.0.0.1.0.0");
const content = node(representativeRoute, "body.1.0.0.1.1");
const pageStyle = style(pageRoot);
const mainStyle = style(main);
if (
  pageRoot.rect.width !== 1920 || pageRoot.rect.height !== 1080 ||
  main.rect.width !== 1628 || main.rect.height !== 1004 ||
  px(mainStyle.borderTopLeftRadius) !== 16
) fail("measured payment scene geometry changed; inspect before regenerating Figma");

const variants = [
  { outcome: "Failure", route: "/mypage/upgrade/billing-change-fail" },
  { outcome: "PlanDelayed", route: "/mypage/upgrade/billing-change-success" },
  { outcome: "TopupDelayed", route: "/mypage/topup/success" },
].map((entry) => {
  const routeMain = node(entry.route, "body.1.0.0.1");
  const routeTopBar = node(entry.route, "body.1.0.0.1.0.0");
  const routeContent = node(entry.route, "body.1.0.0.1.1");
  if (JSON.stringify(routeMain.rect) !== JSON.stringify(main.rect)) fail(`main rect drift ${entry.route}`);
  return {
    ...entry,
    mainRect: relRect(routeMain, pageRoot.rect),
    topBarRect: relRect(routeTopBar, routeMain.rect),
    contentRect: relRect(routeContent, routeMain.rect),
  };
});
const mobileRoot = fixture.screens["mobile-402x874"][representativeRoute].tree.find((entry) => entry.path === "body.1") ??
  fail("missing mobile payment page root");
const mobileMain = fixture.screens["mobile-402x874"][representativeRoute].tree.find((entry) => entry.path === "body.1.0.0.1") ??
  fail("missing mobile payment main");
const mobileMainStyle = style(mobileMain);
if (mobileRoot.rect.width !== 402 || mobileRoot.rect.height !== 874 || mobileMain.rect.width !== 402 || mobileMain.rect.height !== 810) {
  fail("measured mobile payment scene geometry changed; inspect before regenerating Figma");
}
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
  return {
    ...entry,
    mainRect: relRect(routeMain, mobileRoot.rect),
    topBarRect: relRect(routeTopBar, routeMain.rect),
    contentRect: relRect(routeContent, routeMain.rect),
  };
});

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
    dependencies: {
      gnbSet: "Product/Gnb Desktop Shell",
      gnbVariant: "Current=Default",
      topBarSet: "Product/Desktop App Top Bar",
      topBarVariant: "Content=MyPage, Breadcrumb=Single, Back=False, Divider=On",
      mobileTopBarSet: "Product/Mobile App Top Bar",
      mobileTopBarVariant: "Width=Inset, Breadcrumb=Single, Back=False, Divider=On",
      resultSet: "Product/Payment Result Content",
    },
    page: {
      rect: { width: pageRoot.rect.width, height: pageRoot.rect.height },
      background: color(pageStyle.backgroundColor),
    },
    main: {
      rect: { width: main.rect.width, height: main.rect.height },
      background: color(mainStyle.backgroundColor),
      radius: px(mainStyle.borderTopLeftRadius),
      padding: {
        top: px(mainStyle.paddingTop), right: px(mainStyle.paddingRight),
        bottom: px(mainStyle.paddingBottom), left: px(mainStyle.paddingLeft),
      },
    },
    variants,
    mobile: {
      mainSetName: "Product/Mobile Payment Result Main Surface",
      sceneSetName: "Product/Mobile Payment Result Scene",
      sourceCandidates: mobileCandidateContracts,
      page: {
        rect: { width: mobileRoot.rect.width, height: mobileRoot.rect.height },
        background: color(style(mobileRoot).backgroundColor),
      },
      main: {
        rect: { width: mobileMain.rect.width, height: mobileMain.rect.height },
        background: color(mobileMainStyle.backgroundColor),
        radius: px(mobileMainStyle.borderTopLeftRadius),
        padding: {
          top: px(mobileMainStyle.paddingTop), right: px(mobileMainStyle.paddingRight),
          bottom: px(mobileMainStyle.paddingBottom), left: px(mobileMainStyle.paddingLeft),
        },
      },
      variants: mobileVariants,
    },
    bindings: {
      paletteCollection: "1 · Palette",
      paletteMode: "sidebar",
      semanticCollection: "2 · Semantic",
      semanticMode: "light-sidebar",
      appBackground: { collection: "1 · Palette", name: "palette/gray-200" },
      surface: { collection: "1 · Palette", name: "palette/gray-100" },
      current: { collection: "2 · Semantic", name: "gray/000 · a78" },
      parent: { collection: "2 · Semantic", name: "gray/000 · a52" },
      radius16: { collection: "Klipse Primitive", name: "radius/16" },
    },
  },
};
const summary = ({ id, nodeCount, routeCount, occurrenceCount, score }) => ({ id, nodeCount, routeCount, occurrenceCount, score });
const runnerPlan = structuredClone(plan);
runnerPlan.sourceCandidates = plan.sourceCandidates.map(summary);
runnerPlan.component.mobile.sourceCandidates = plan.component.mobile.sourceCandidates.map(summary);
const draw =
  "// Generated by scripts/build-figma-product-payment-scenes.mjs. Do not edit by hand.\n" +
  "// Pass this file verbatim to use_figma. It composes only measured existing product components.\n" +
  `const PLAN=${JSON.stringify(runnerPlan)};\n` +
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
