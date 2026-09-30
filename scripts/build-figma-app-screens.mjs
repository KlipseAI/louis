#!/usr/bin/env node
// **측정된 앱 화면을 Figma Auto Layout 계층으로 생성한다.**
//
// ## 왜 이 생성기인가
//
// 기존 생성기 8개는 화면을 절대좌표로 전사(轉寫)하거나(pricing) 컴포넌트 라이브러리만 만들었다.
// 화면 프레임에 실제로 무언가를 심는 일은 전부 **라이브 수작업**이었고(handoff:1173) 그래서 재현되지
// 않았다. 이 생성기는 그 고리를 메운다 — 측정 → 판정 → Auto Layout 계층까지 스크립트로 고정한다.
//
// ## 무엇을 만드는가
//
// `migration/product.auth-fixture.json`에 **전체 노드 트리가 이미 있는** 보호 앱 화면 12개(× 2 뷰포트)를
// 크기 출처 판정(FILL/HUG/FIXED/ABSOLUTE)이 붙은 계층 spec으로 바꾸고, Figma 플러그인 런너를 낸다.
// 측정 픽셀을 박지 않으므로 프레임을 리사이즈하면 제품처럼 반응한다.
//
// ## 산출물
//
//   figma/app-screens.plan.json   — 사람이 읽는 감사본(판정 근거 `why` 포함)
//   figma/app-screens.<route>.draw.js — use_figma에 그대로 넘기는 런너(50KB 상한)
//
// 실행: `node scripts/build-figma-app-screens.mjs [--check]`

import { transformSync } from "esbuild";
import { existsSync, readFileSync, readdirSync, rmSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { atomicWriteBatch } from "./lib/atomic-output.mjs";
import {
  applyComponentInstances,
  COMPONENT_SETS,
  CONTENT_COMPONENTS,
  contentSignatureOf,
  LOUIS_PRIMITIVE_EXCLUSIONS,
  LOUIS_PRIMITIVE_SITES,
  lookOf,
  SIDEBAR_VARIANT_SOURCES,
} from "./lib/figma-component-substitution.mjs";
import { glyphBySignature, PRODUCT_GLYPHS } from "./lib/figma-glyph-identity.mjs";
import { COLOR_COLLECTION, PRIMITIVE_COLLECTION, RENDERER_LIB, THEME_MODE, liveVariables } from "./lib/figma-live-variables.mjs";
import { normalizeAuthFixtureTree, toFigmaTreeSpec } from "./lib/figma-tree-spec.mjs";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const fixturePath = resolve(repoRoot, "migration/product.auth-fixture.json");
// **낱개 정본 프리미티브 치환의 두 증거.** 어느 쪽도 여기 상수로 베끼지 않는다 —
// 제품이 무는 레시피는 제품 원장이, LOUIS 의 size·variant 축은 되읽기가 소유한다.
const recipesPath = resolve(repoRoot, "migration/product.rendered-components.json");
const readbackPath = resolve(repoRoot, "figma/readback.json");
const planPath = resolve(repoRoot, "figma/app-screens.plan.json");
const partsPlanPath = resolve(repoRoot, "figma/product-parts.plan.json");
const templatePath = resolve(repoRoot, "scripts/templates/figma-app-screens-renderer.js");
const checkOnly = process.argv.includes("--check");
const fail = (message) => { throw new Error(`[figma-app-screens] ${message}`); };

const fixture = JSON.parse(readFileSync(fixturePath, "utf8"));
// **로그아웃 원장(2026-09-28).** 인증 화면 · 404 · 짧은 공개 화면은 인증 우회 없이 잰 `product.anonymous-fixture.json` 에 있다
// (`measure-product-auth-fixture.mjs --anonymous`). 화면 항목의 `fixture: "anonymous"` 가 그 원장을 고른다. 스타일 id 는 값의 해시라
// 두 원장의 표가 섞여도 같은 id 는 같은 값이다.
const anonymousFixture = JSON.parse(readFileSync(resolve(repoRoot, "migration/product.anonymous-fixture.json"), "utf8"));
// **세션 · 공개 원장(2026-09-29).** 서버가 로그인을 확인하는 화면(허브)은 가짜 Supabase 세션으로 잰 `product.session-fixture.json`,
// 뷰포트보다 긴 공개 페이지는 문서 전체를 잰 `product.public-fixture.json` 에 있다(`measure-product-auth-fixture.mjs --session ·
// --public`). 화면 항목의 `fixture` 가 고른다. 원장이 없으면 그 원장을 고른 화면에서 멈춘다.
const optionalFixture = (relative) => {
  const path = resolve(repoRoot, relative);
  return existsSync(path) ? JSON.parse(readFileSync(path, "utf8")) : null;
};
const LEDGERS = {
  anonymous: anonymousFixture,
  session: optionalFixture("migration/product.session-fixture.json"),
  public: optionalFixture("migration/product.public-fixture.json"),
};
const fixtureOf = (screen) => {
  if (!screen.fixture) return fixture;
  return LEDGERS[screen.fixture] ?? fail(`화면 ${screen.route} 의 원장 ${screen.fixture} 가 없습니다`);
};
const recipes = JSON.parse(readFileSync(recipesPath, "utf8"));
const readback = JSON.parse(readFileSync(readbackPath, "utf8"));
// 제품 원장과 측정 fixture 가 같은 커밋을 봐야 한다. 어긋나면 「제품이 이 자리에서 무는
// 클래스」를 어제의 제품에서 읽고 오늘의 화면에 심는 것이 된다.
for (const source of [fixture, ...Object.values(LEDGERS).filter(Boolean)]) {
  if (recipes.productCommit !== source.productCommit) {
    fail(
      `제품 레시피 원장의 커밋(${String(recipes.productCommit).slice(0, 8)})이 측정 fixture(${source.$evidenceClass})의 ` +
      `${String(source.productCommit).slice(0, 8)} 와 다릅니다.`,
    );
  }
}
for (const source of Object.values(LEDGERS).filter(Boolean)) {
  if (source.fixture?.theme !== fixture.fixture?.theme) fail("측정 원장들의 테마가 다릅니다 — 보드 색 모드는 하나다");
}

// **자산 이미지(2026-09-28).** 제품 `<img src>` 는 그림이 파일이라 측정에 모양이 없고, 렌더러가 빈 상자로 그렸다 — 인증 화면
// 브랜드 패널 · 카드 위의 로고가 통째로 빠졌다(캡처로 확인). src 를 LOUIS 90 · 자산의 컴포넌트에 잇는다. 이름은 여기 적되 id 와
// 실재는 라이브 자산 목록(`figma/live-assets.json`)이 증거다 — 없으면 멈춘다. 여기 없는 src 는 지금처럼 빈 상자로 남는다.
// `<img>` 는 제 색으로 그려지므로(`currentColor` 가 닿지 않는다) 컴포넌트의 색을 대조한 뒤에만 잇는다 — `/icons/youtube.svg` 는 검정 획
// (`stroke="black"`)이고 `icon/youtube` 의 획은 `color/gray/000`(라이트 검정)이라 같다. 획 두께는 다르다 — 컴포넌트는 DS 아이콘 규칙대로
// 32 상자에 2(48 로 줄이면 3.0)이고 제품은 원본 2.4 를 1.5 배로 그려 3.6 이다(2026-09-28 대조).
const IMAGE_COMPONENTS = {
  "/klipse-dark.svg": "logo/klipse-dark",
  "/klipse-light.svg": "logo/klipse-light",
  "/icons/aws-logo.svg": "icon/aws-logo",
  "/icons/youtube.svg": "icon/youtube",
  // 2026-09-30 — 하이라이트 허브 머리글 · 관리자 사이드바의 워드마크. 90 · 자산의 브랜드 자산(색 고정)이 제품 public 원본 그대로다.
  "/highlight-wordmark.svg": "logo/highlight-wordmark",
  "/klipse-admin-wordmark-black.svg": "logo/klipse-admin-wordmark-black",
  // `/aws/signup` 브랜드 패널의 심볼 — 제품은 next/image 로 `/symbol.png` 를 36 으로 그린다(측정기가 `url` 쿼리에서 원본을 싣는다).
  "/symbol.png": "logo/klipse-symbol",
  // 2026-09-30 — 랜딩 개요의 노드 종류 타일(public 루트 다색 SVG — 90 · 자산 B · tile/)과 밴드 사진 넷. 사진은 90 · 자산 U · image/ 에 원본
  // 픽셀 크기의 이미지 채움(FILL = object-cover) 컴포넌트로 올렸다 — 인스턴스를 측정 크기로 줄이면 가운데를 채우며 잘린다.
  "/Text.svg": "tile/Text",
  "/Image.svg": "tile/Image",
  "/Video.svg": "tile/Video",
  "/Audio.svg": "tile/Audio",
  // 라이브 이름은 제품 메뉴 이름(Composition)이다 — 원본 파일 이름은 그대로 VideoEditor.svg.
  "/VideoEditor.svg": "tile/Composition",
  "/YouTube.svg": "tile/YouTube",
  "/images/landing/testimonials-backdrop.jpg": "image/landing/testimonials-backdrop",
  "/images/landing/creator-program-backdrop.jpg": "image/landing/creator-program-backdrop",
  "/images/landing/ambassador-seal.png": "image/landing/ambassador-seal",
  "/images/landing/news-featured.webp": "image/landing/news-featured",
};
const liveAssets = JSON.parse(readFileSync(resolve(repoRoot, "figma/live-assets.json"), "utf8"));
const imageComponentBySrc = new Map(Object.entries(IMAGE_COMPONENTS).map(([src, name]) => {
  const hits = Object.values(liveAssets.components ?? {}).filter((entry) => entry.name === name || entry.name.startsWith(`${name} (`));
  if (hits.length !== 1) fail(`자산 이미지 ${src} 의 컴포넌트 «${name}» 가 figma/live-assets.json 에 ${hits.length}개입니다 — 하나여야 합니다`);
  return [src, { id: hits[0].id, name: hits[0].name }];
}));
// spec 을 돌며 이어진 `<img>` 에 컴포넌트를 붙인다. 이어지지 않은 src 는 plan 감사본에 남긴다.
const attachImageComponents = (node, unmapped) => {
  if (node.tag === "img" && node.src) {
    const component = imageComponentBySrc.get(node.src);
    if (component) node.imageComponent = component;
    else unmapped.push({ path: node.path, src: node.src, rect: [Math.round(node.rect.width), Math.round(node.rect.height)] });
  }
  for (const child of node.children ?? []) attachImageComponents(child, unmapped);
};

// **색 변수의 컬렉션 · 모드(2026-09-14).** 렌더러는 측정 색과 값이 같은 라이브 변수를 찾아 묶는다. 그 컬렉션은 되읽기
// (`figma/readback.json`)에 있는 라이브 셋 가운데 색을 담는 둘이고(은퇴한 컬렉션이 되읽기에 남아 있으면
// 공용 헬퍼 `RETIRED_COLLECTIONS` 대조가 멈춘다), 모드는 측정 테마가 정한다 — fixture 는 light 문맥에서 잰다(`fixture.theme`, 화면마다 `theme`).
// 제품 컴포넌트 러너(`scripts/lib/figma-live-variables.mjs`)와 같은 규칙이라 모드는 `Klipse Semantic Color` 에만 고정한다.
const liveColour = liveVariables({ repoRoot, fail });
const measuredTheme = fixture.fixture?.theme;
const colour = liveColour.assertBindings({
  modeCollection: COLOR_COLLECTION,
  mode: THEME_MODE[measuredTheme] ?? fail(`측정 테마를 모릅니다: ${measuredTheme}`),
  // 앞 컬렉션이 먼저다 — 값이 같은 변수가 둘이면 역할 층(Semantic Color)이 원료(Primitive)를 이긴다.
  collections: [COLOR_COLLECTION, PRIMITIVE_COLLECTION],
}, "app-screens colour");

// LOUIS(OlYKERKOkgbxBEEoXGZW2c)의 대상 프레임. 라이브에서 읽어 확인한 install id다.
// 별칭 route(`/mypage`→`/settings`, `/explore`→`/archive`, `/checkout`→`/upgrade`)는 제외한다 —
// 같은 화면을 두 번 그리게 된다.
const SCREENS = [
  { route: "/archive", desktop: "20:2", mobile: "23:2" },
  // 허브 셋(`/nodecanvas` 219:2917 · 219:3209, `/videoeditor` 219:3403 · 219:3701, `/highlight` 29:3 · 29:44)은 여기 없다 — 서버 인증
  // 확인으로 fixture 에서 랜딩으로 넘어가 잴 수 없다(측정기 ROUTES 주석, 2026-09-28). 보드는 아직 손 조립이다(섹션 머리글 ⚠).
  // **로그아웃 화면(2026-09-28).** 손 조립 · 옛 캡처였던 인증 화면 아홉 · 데이터 삭제 상태 · 404 를 로그아웃 원장에서 그린다.
  { route: "/login", desktop: "24:3", mobile: "24:19", fixture: "anonymous" },
  { route: "/signup", desktop: "187:1152", mobile: "187:1230", fixture: "anonymous" },
  { route: "/aws/signup", desktop: "187:1300", mobile: "187:1387", fixture: "anonymous" },
  { route: "/signup/check-email", desktop: "184:1131", mobile: "184:1188", fixture: "anonymous" },
  { route: "/signup/expired", desktop: "184:1237", mobile: "184:1292", fixture: "anonymous" },
  { route: "/signup/verified", desktop: "184:1339", mobile: "184:1394", fixture: "anonymous" },
  { route: "/reset-password", desktop: "185:1142", mobile: "185:1202", fixture: "anonymous" },
  { route: "/reset-password/new", desktop: "185:1254", mobile: "185:1317", fixture: "anonymous" },
  { route: "/recover", desktop: "188:1166", mobile: "188:1184", fixture: "anonymous" },
  { route: "/data-deletion-status", desktop: "214:2965", mobile: "214:2980", fixture: "anonymous" },
  { route: "404", desktop: "37:3", mobile: "37:10", fixture: "anonymous" },
  { route: "/settings", desktop: "28:3", mobile: "28:44" },
  { route: "/subscription", desktop: "190:1172", mobile: "190:1497" },
  { route: "/analytics/youtube", desktop: "30:3", mobile: "30:33" },
  // `/analytics/instagram`은 제외한다. auth-fixture에서 이 route는 `/analytics/youtube`로
  // **리다이렉트되어** 같은 화면이 측정된다(redirected: true). 그리는 순간 instagram 프레임에
  // youtube 내용이 들어간다. 이 화면의 정본은 dynamic 연동 상태 fixture가 생겨야 나온다.
  { route: "/mypage/upgrade", desktop: "192:1251", mobile: "192:1794" },
  { route: "/mypage/upgrade/billing-success", desktop: "25:3", mobile: "25:29" },
  { route: "/mypage/upgrade/billing-fail", desktop: "183:922", mobile: "183:1057" },
  { route: "/mypage/upgrade/billing-change-success", desktop: "183:1258", mobile: "183:1391" },
  { route: "/mypage/upgrade/billing-change-fail", desktop: "183:1095", mobile: "183:1225" },
  { route: "/mypage/upgrade/fail", desktop: "183:743", mobile: "183:881" },
  { route: "/mypage/topup/success", desktop: "183:1427", mobile: "183:1565" },
  { route: "/mypage/topup/fail", desktop: "183:1606", mobile: "183:1736" },
  // **2026-09-26 — 보드가 없던 실제 화면 셋.** 사양 문서 · 커버리지 파일에 없어 「⚠ 미등록」 섹션에 세웠다(조립 규칙 20조).
  { route: "/mypage/upgrade/bulk-success", desktop: "2075:2243", mobile: "2075:2244" },
  { route: "/mypage/upgrade/bulk-fail", desktop: "2075:2245", mobile: "2075:2246" },
  { route: "/subscription/coupons", desktop: "2076:3371", mobile: "2076:3372" },
  // **결제 성공 화면 넷의 실제 성공 상태(2026-09-26).** 쿼리 없이 연 화면은 「결제 정보 없음」 분기라 성공 화면의 본체가 보드에
  // 없었다. 개발 전용 `?preview=` 후크(운영에서 꺼지는 NODE_ENV 게이트 — 인용은 측정기 sourceQuotes)로 연 상태 보드다. 프레임은
  // 라우트 섹션 안 §20 자리에 세웠다(결제 결과 섹션 255:1862 의 항목 7~10, bulk 미등록 섹션 2075:2241 의 항목 2~3).
  { route: "/mypage/upgrade/billing-success?preview=success", desktop: "2108:2507", mobile: "2108:2508" },
  { route: "/mypage/upgrade/billing-success?preview=partial", desktop: "2108:2509", mobile: "2108:2510" },
  { route: "/mypage/upgrade/billing-change-success?preview=success", desktop: "2108:2511", mobile: "2108:2512" },
  { route: "/mypage/topup/success?preview=success", desktop: "2108:2513", mobile: "2108:2514" },
  { route: "/mypage/upgrade/bulk-success?preview=success", desktop: "2108:2515", mobile: "2108:2516" },
  { route: "/mypage/upgrade/bulk-success?preview=issue-error", desktop: "2108:2517", mobile: "2108:2518" },
  // `/highlight/[projectId]` 의 phase 상태 여섯. 프레임은 §20 배치 산식으로 새로 세웠다
  // (섹션 `255:1856`, 항목 index 3~8 → x 8560 / 160 / 2960 / 5760 / 8560 / 160,
  //  rowTop 240 · 2140 · 3840). 측정은 개발 전용 `?__phase=` 후크가 연다.
  // `reviewed` · `completed` 는 fixture 에 세그먼트·클립 시드가 없어 빈 화면이 되므로 재지 않는다
  //  — `measure-product-auth-fixture.mjs` 의 ROUTES 주석에 노드 수와 함께 사유가 있다.
  { route: "/highlight/[projectId]?__phase=loading", desktop: "1064:3132", mobile: "1064:3133" },
  { route: "/highlight/[projectId]?__phase=uploading", desktop: "1064:3134", mobile: "1064:3135" },
  { route: "/highlight/[projectId]?__phase=upload", desktop: "1064:3136", mobile: "1064:3137" },
  { route: "/highlight/[projectId]?__phase=analyzing", desktop: "1064:3138", mobile: "1064:3139" },
  { route: "/highlight/[projectId]?__phase=extracting", desktop: "1064:3140", mobile: "1064:3141" },
  { route: "/highlight/[projectId]?__phase=failed", desktop: "1064:3142", mobile: "1064:3143" },
  // `/highlight/[projectId]?__phase=…` 6개는 **측정은 됐지만 여기 없다.** 이 목록의 항목은
  // 보드에 이미 있는 대상 프레임 id를 들어야 하는데(`renderer:388`이 `getNodeByIdAsync`로 찾고,
  // 없으면 던진다) 하이라이트 상세의 phase 프레임은 아직 보드에 없다. 프레임을 만드는 것은
  // Figma 쪽 작업이라 측정과 같은 걸음에 할 수 없다 — 프레임이 생기면 여기에 id와 함께 더하면
  // 그때부터 런너가 나온다. 키에 `[`·`]`·`?`가 있어도 파일명은 아래에서 정리한다.
  // **세션 원장 · 공개 원장 화면(2026-09-29).** 손 조립이던 보드를 측정 생성으로 바꾼다 — 원장이 있을 때만 싣는다(없으면 이 항목들이 빠질 뿐
  // 생성기는 멈추지 않는다). 세션 원장은 가짜 Supabase 세션(인증 고정 사용자 · 데이터 빈 목록), 공개 원장은 로그아웃 · 문서 전체다.
  ...(LEDGERS.session ? [
    { route: "/nodecanvas", desktop: "219:2917", mobile: "219:3209", fixture: "session" },
    { route: "/videoeditor", desktop: "219:3403", mobile: "219:3701", fixture: "session" },
    { route: "/highlight", desktop: "29:3", mobile: "29:44", fixture: "session" },
    // `/admin` 은 원장에만 있다 — 관리자에게는 사이드바가 관리자 메뉴를 더한 다른 셸이라(노드 90 ↔ 설정 53) 셸 세트에 variant 가 먼저 서야
    // 한다. 보드는 손 조립으로 둔다(2026-09-29).
    // 부스 운영 — 측정 서버의 픽스처 키로 열고, 관리자 Supabase 클라이언트가 가짜 Supabase 에 붙어 행사 없는 빈 상태를 그린다.
    { route: "/creative-media-admin", desktop: "224:3553", mobile: "224:3799", fixture: "session" },
    { route: "/admin", desktop: "222:3310", mobile: "222:3626", fixture: "session" },
    { route: "/mypage/upgrade/checkout", desktop: "199:1729", mobile: "199:2782", fixture: "session" },
    // 부스 체험 — 가짜 Supabase 에 행사가 없어 「No event is running right now」 빈 상태로 선다(공개 모드는 오류 경계 — `error` 보드).
    { route: "/creative-media", desktop: "224:3455", mobile: "224:3504", fixture: "session" },
  ].filter((screen) => LEDGERS.session.screens?.["desktop-1920x1080"]?.[screen.route]) : []),
  ...(LEDGERS.public ? [
    // 약관 둘 — 떼어낸 자리를 조각 하나에 묶어 뷰포트마다 4 ~ 5 조각이다. 문장 안의 굵은 글자(`<strong>`)가 섞인 문단(개인정보 54 · 이용약관 41)은
    // 측정기가 싣는 조각 순서로 글자 하나 + 범위 서식으로 합친다(figma-tree-spec richInlineText) — 따로 세우면 「7 days」 가 문장에서 떨어져
    // 오른쪽에 섰다. 표 칸(td · tr · th)은 크기 판정 규칙이 없어 미해결로 남고 측정 폭(FIXED)으로 선다. 옛 보드(제품 DOM 캡처)는 은퇴한 7모드
    // 변수에 묶여 바탕이 회색 · 글자가 거의 흰색으로 틀어져 있었다(2026-09-30).
    // 랜딩 — 로그아웃 문서 전체. 템플릿 섹션은 DB(`creative_media_templates`)가 닿지 않아 빈 배열이 오고 제품 코드대로 빠진다(2026-09-30).
    { route: "/", desktop: "359:2032", mobile: "359:2986", fixture: "public" },
    { route: "/privacy", desktop: "350:17450", mobile: "350:18523", fixture: "public" },
    { route: "/terms", desktop: "350:19606", mobile: "350:20517", fixture: "public" },
    { route: "/inquiry", desktop: "36:3", mobile: "36:44", fixture: "public" },
    { route: "/pricing", desktop: "213:2297", mobile: "213:3353", fixture: "public" },
    { route: "/templates", desktop: "33:3", mobile: "33:47", fixture: "public" },
    // `/templates/[slug]` 은 원장에만 있다 — 연 `filter` 템플릿이 이 빌드에 없어 「Page not found」(노드 8)가 재졌다. 보드는 손 조립으로 둔다.
    { route: "/blog", desktop: "214:2767", mobile: "214:2865", fixture: "public" },
    // 루트 오류 경계 — 공개 모드의 부스 체험이 던져 선 `app/error.tsx` 화면(측정기 PUBLIC_ROUTES 의 `error`). 404 와 같은 섹션의 보드다.
    { route: "error", desktop: "37:18", mobile: "37:25", fixture: "public" },
  ].filter((screen) => LEDGERS.public.screens?.["desktop-1920x1080"]?.[screen.route]) : []),
];

const CONTEXTS = [
  { id: "desktop-1920x1080", key: "desktop" },
  { id: "mobile-402x874", key: "mobile" },
];

// **제품 부품 세트(2026-09-26 — DS-D-0071 · 소유자 결정 「Figma 먼저, 생성기로 묶어서」).** 보드 안의 제품 전용 컨트롤을
// 측정 서브트리 그대로 제품 컴포넌트 variant 로 찍고(보드와 같은 변환 · 같은 렌더러), 보드는 같은 서브트리를 그 variant 의
// 인스턴스로 쓴다 — 본문 세트 치환과 같은 판정(글자 서열 · 구조 서명 · 뷰포트)이라 서명 함수도 같은 것을 쓴다
// (`contentSignatureOf`). 대상 컴포넌트는 90 · 자산 의 「S · product/Parts」 섹션에 먼저 세운 빈 variant 다(보드 프레임과
// 같은 순서 — 러너는 있는 노드만 채운다). `anchor` 는 서브트리의 글자 서열이다: 측정이 옮겨 다른 노드를 가리키면 멈춘다.
const PART_SECTION = "S · product/Parts · 측정 서브트리 — build-figma-app-screens 생성물";
const COUPONS = "/subscription/coupons";
const PLAN_OPTION = (plan, price) => [plan, `${price} KRW each`];
const PARTS = [
  {
    set: "Product/Gift Plan Option",
    about: "요금제 선물 화면의 요금제 선택 카드(role=radio 버튼, app/subscription/coupons/page.tsx). 선택된 카드는 파랑 1.5 링, 나머지는 헤어라인이다 — 측정 fixture 에서는 Lite 가 선택돼 있다.",
    variants: [
      ["Plan=Lite, Viewport=Desktop", "desktop-1920x1080", "body.1.0.0.1.0.1.1.1.1.0", PLAN_OPTION("Lite", "12,900"), "2086:5881"],
      ["Plan=Plus, Viewport=Desktop", "desktop-1920x1080", "body.1.0.0.1.0.1.1.1.1.1", PLAN_OPTION("Plus", "29,900"), "2086:5882"],
      ["Plan=Pro, Viewport=Desktop", "desktop-1920x1080", "body.1.0.0.1.0.1.1.1.1.2", PLAN_OPTION("Pro", "49,900"), "2086:5883"],
      ["Plan=Ultra, Viewport=Desktop", "desktop-1920x1080", "body.1.0.0.1.0.1.1.1.1.3", PLAN_OPTION("Ultra", "74,900"), "2086:5884"],
      ["Plan=Lite, Viewport=Mobile", "mobile-402x874", "body.1.0.0.1.0.1.1.1.1.0", PLAN_OPTION("Lite", "12,900"), "2086:5885"],
      ["Plan=Plus, Viewport=Mobile", "mobile-402x874", "body.1.0.0.1.0.1.1.1.1.1", PLAN_OPTION("Plus", "29,900"), "2086:5886"],
      ["Plan=Pro, Viewport=Mobile", "mobile-402x874", "body.1.0.0.1.0.1.1.1.1.2", PLAN_OPTION("Pro", "49,900"), "2086:5887"],
      ["Plan=Ultra, Viewport=Mobile", "mobile-402x874", "body.1.0.0.1.0.1.1.1.1.3", PLAN_OPTION("Ultra", "74,900"), "2086:5888"],
    ].map(([variant, context, path, anchor, component]) => ({ variant, route: COUPONS, context, path, anchor, component })),
  },
  {
    set: "Product/Quantity Stepper",
    about: "요금제 선물 결제 패널(app/mypage/upgrade/TossPaymentWindowPanel.tsx gift 모드)의 수량 스테퍼 — − · 수량 입력 · +. 입력 값(「1」)은 측정기가 `value` 로 싣고 트리 변환이 글자로 옮긴다(2026-09-29).",
    variants: [
      ["Viewport=Desktop", "desktop-1920x1080", "body.1.0.0.1.0.1.1.2.1.1", ["−", "1", "+"], "2086:5890"],
      ["Viewport=Mobile", "mobile-402x874", "body.1.0.0.1.0.1.1.2.1.1", ["−", "1", "+"], "2086:5891"],
    ].map(([variant, context, path, anchor, component]) => ({ variant, route: COUPONS, context, path, anchor, component })),
  },
  // **둘째 묶음(2026-09-26 저녁) — 보드 구성 원장의 「미보유」 18 을 0 으로.** 셋 다 LOUIS 컨트롤 사다리에 앉지 않는 제품 전용 자리다.
  {
    set: "Product/Analytics Connect Button",
    about: "유튜브 분석 연결 안내의 계정 연결 버튼(components/scenes/YoutubeAnalyticsScene.tsx CONNECT_NOTICE_BTN — h-20 · rounded-full · bg-gray-000). LOUIS 버튼 사다리에 40 알약 반전 면이 없다.",
    variants: [
      ["Viewport=Desktop", "desktop-1920x1080", "body.1.0.0.1.0.0.2.0.3", ["Connect Google Account"], "2101:5880"],
      ["Viewport=Mobile", "mobile-402x874", "body.1.0.0.1.0.0.2.0.3", ["Connect Google Account"], "2101:5881"],
    ].map(([variant, context, path, anchor, component]) => ({ variant, route: "/analytics/youtube", context, path, anchor, component })),
  },
  {
    // 칩 하나가 아니라 줄 하나다 — 제품이 테마 여섯을 고정 목록 하나로 그린다(themeChips 의 map). 칩마다 세트를 두면 라벨만 다른
    // variant 가 열둘이 된다. 선택 칩(themeChipActive)은 측정 fixture 에 없다 — 업로드 단계의 기본 테마가 비어 있다.
    set: "Product/Highlight Theme Chips",
    about: "하이라이트 업로드 단계의 테마 칩 줄(components/scenes/HighlightProjectScene.tsx themeChips — 칩 여섯, h 18). 선택 칩은 측정되지 않았다.",
    variants: [
      ["Viewport=Desktop", "desktop-1920x1080", "body.1.0.0.1.0.1.0.1.2.1", ["Live Commerce", "Education", "Gaming", "Sports", "Vlog", "Interview"], "2101:5883"],
      ["Viewport=Mobile", "mobile-402x874", "body.1.0.0.1.0.1.0.1.2.1", ["Live Commerce", "Education", "Gaming", "Sports", "Vlog", "Interview"], "2101:5884"],
    ].map(([variant, context, path, anchor, component]) => ({ variant, route: "/highlight/[projectId]?__phase=upload", context, path, anchor, component })),
  },
  {
    // 모바일 쿠폰 화면에는 결제 패널이 측정 화면 안에 없다(보드 계획에 약관 글자가 없다) — 데스크톱 하나다.
    set: "Product/Checkout Agreement",
    about: "요금제 선물 결제 패널의 약관 동의 상자(app/mypage/upgrade/TossPaymentWindowPanel.tsx CHECKOUT_AGREEMENT_BOX). 체크박스는 LOUIS .louis-checkbox 를 제품이 16px · gap 10 으로 덮는다(같은 파일 147-155행 주석 — LOUIS 기본 20 · gap 8).",
    variants: [
      ["Viewport=Desktop", "desktop-1920x1080", "body.1.0.0.1.0.1.1.2.5.1.1", [
        "I agree to the terms below and to automatic subscription renewal with the registered card.",
        "Your card will only be used for subscription payments and automatic renewals.",
        "Payment service terms", "Privacy collection consent", "Third-party data sharing consent",
      ], "2101:5886"],
    ].map(([variant, context, path, anchor, component]) => ({ variant, route: COUPONS, context, path, anchor, component })),
  },
  // **셋째 묶음(2026-09-26 저녁) — 결제 성공 미리보기 보드에서 드러난 안내 상자 둘.** 둘 다 글자를 제 몸에 든 잎이다(잎 서명).
  // 쿠폰 코드 칩(bulk 성공 미리보기, 데스크톱 30 · 모바일 15)은 칩마다 글자가 달라 글자 서열 서명으로 묶을 수 없다 — 글자 속성
  // (component TEXT property)을 가진 부품이 필요하다(다음 묶음).
  {
    set: "Product/Billing Status Alert",
    about: "결제 성공 화면의 상태 알림(app/mypage/upgrade/billing-success/page.tsx STATUS_ALERT_ERROR — 빨강 8% 면 · 16% 테두리 · 곡률 12). 측정은 개발용 ?preview=partial 의 결제 수단 등록 실패 문구다.",
    variants: [
      ["Viewport=Desktop", "desktop-1920x1080", "body.1.0.0.1.1.2", ["Failed to register the billing method and complete the subscription charge."], "2109:5880"],
      ["Viewport=Mobile", "mobile-402x874", "body.1.0.0.1.1.2", ["Failed to register the billing method and complete the subscription charge."], "2109:5881"],
    ].map(([variant, context, path, anchor, component]) => ({ variant, route: "/mypage/upgrade/billing-success?preview=partial", context, path, anchor, component })),
  },
  {
    set: "Product/Bulk Coupon Notice",
    about: "bulk 결제 성공 화면의 안내(app/mypage/upgrade/bulk-success/page.tsx NOTICE — 헤어라인 · 곡률 8 · 64% 글자). 성공 · 발급 실패 미리보기가 같은 안내를 쓴다.",
    variants: [
      ["Viewport=Desktop", "desktop-1920x1080", "body.1.0.0.1.0.1.0.2", ["No plan is applied to the paying account. Hand out the codes below — each person's plan starts the day they redeem one."], "2109:5883"],
      ["Viewport=Mobile", "mobile-402x874", "body.1.0.0.1.0.1.0.2", ["No plan is applied to the paying account. Hand out the codes below — each person's plan starts the day they redeem one."], "2109:5884"],
    ].map(([variant, context, path, anchor, component]) => ({ variant, route: "/mypage/upgrade/bulk-success?preview=success", context, path, anchor, component })),
  },
  // **넷째 묶음(2026-09-26 밤) — 글자 속성 부품.** 쿠폰 코드 칩은 칩마다 글자가 달라 글자 서열로 묶을 수 없다. `label` 이 있는 부품은
  // 글자가 아니라 모양(잎 · 태그 · 칠과 타이포 `lookOf` · 뷰포트)으로 맞추고, 글자는 인스턴스의 TEXT 속성(이름 `label`)으로 옮긴다.
  // 부품 러너가 세트에 그 속성을 열고 글자 노드를 묶는다. `labelPattern` 은 그 모양의 잎 가운데 이 부품이 받을 글자의 꼴이다 —
  // 모양만 같은 다른 글자 잎이 끌려오지 않게 한다.
  {
    set: "Product/Coupon Code Chip",
    about: "bulk 결제 성공 화면의 쿠폰 코드 칩(app/mypage/upgrade/bulk-success/page.tsx CODE_CHIP — 헤어라인 · 곡률 8 · 88% 글자). 글자는 TEXT 속성 Code 다.",
    label: "Code",
    labelPattern: "^[A-Z0-9]+(?:-[A-Z0-9]+)+$",
    variants: [
      ["Viewport=Desktop", "desktop-1920x1080", "body.1.0.0.1.0.1.0.3.0", ["PREV-IEW0-001"], "2115:5880"],
      ["Viewport=Mobile", "mobile-402x874", "body.1.0.0.1.0.1.0.3.0", ["PREV-IEW0-001"], "2115:5881"],
    ].map(([variant, context, path, anchor, component]) => ({ variant, route: "/mypage/upgrade/bulk-success?preview=success", context, path, anchor, component })),
  },
];

/** 런너 payload를 줄이기 위한 축약. 키가 길면 50KB 상한에 금방 닿는다. */
// **축 코드는 서로 겹치면 안 된다.** 첫 글자만 쓰면 `FIXED`와 `FILL`이 둘 다 `"F"`가 되어
// 렌더러가 모든 고정 크기를 FILL로 읽는다. 실측 사고: 20×20 아이콘이 행 전체를 채워 텍스트를
// 오른쪽으로 밀고, `width:min(520px,100%)` 섹션이 1628로 늘어났다(스크린샷으로 확인).
const SIZING_CODES = { FILL: "F", HUG: "H", FIXED: "A" };
const SIZING_CODE = (verdict) => {
  const code = SIZING_CODES[verdict];
  if (!code) throw new Error(`[figma-app-screens] 알 수 없는 sizing 판정: ${verdict}`);
  return code;
};

/**
 * 색·타이포 축약 키.
 *   f — 배경 채움 hex           b — 테두리 [hex, top, right, bottom, left]
 *   d — radius(4모서리가 같으면 숫자 하나)  e — 그림자 [[inset,hex,x,y,blur,spread], …]
 *   a — 불투명도                y — LOUIS 텍스트 스타일 이름(문자열) 또는 [size,weight,lineHeight,tracking]
 *   tc — 글자색 hex             ta — 정렬
 */
const paintKeys = (node) => {
  const paint = node.paint;
  if (!paint) return {};
  const radius = paint.radius && paint.radius.every((value) => value === paint.radius[0])
    ? paint.radius[0] : paint.radius;
  return {
    ...(paint.fill ? { f: paint.fill } : {}),
    // `g`: 그라디언트 면 — [각도, [색, 위치], …]. `f` 보다 위에 그려진다(CSS background-image 규칙).
    ...(paint.gradient ? { g: [round(paint.gradient.angle),
      ...paint.gradient.stops.map((stop) => [stop.color, round(stop.position)])] } : {}),
    // **헤어라인 · 바깥 링(2026-09-26).** 여섯째 칸 1 = 그림자(`--louis-hairline-inset`)에서 옮긴 안쪽 선, 2 = 바깥 링(선택 표시)에서
    // 옮긴 바깥 선(OUTSIDE) — 둘 다 박스 크기에 들어가지 않는다. 렌더러가
    // `strokesIncludedInLayout = false` 로 둔다: GRID 프레임은 획을 레이아웃에 넣는 것이 기본이라 두면 0.5 선이 위아래로 더해져
    // 쿠폰 요금제 카드가 70 → 71 이 됐다. CSS 테두리는 다섯 칸 그대로다. 렌더러는 획의 변수를 값이 같은 것 가운데
    // `color/stroke-hairline` > `color/stroke-*` > 첫 변수 순으로 고른다 — 헤어라인 #171B22 12% 의 첫 변수가 `color/accent-secondary-hover`,
    // 획 역할 중 첫째가 `color/stroke-control` 이었고, LOUIS 는 헤어라인을 `--louis-color-stroke-hairline` 으로 정의한다(base.css).
    ...(paint.stroke ? { b: [paint.stroke.color, ...paint.stroke.widths.map(round), ...(paint.stroke.inset ? [1] : paint.stroke.outside ? [2] : [])] } : {}),
    ...(radius ? { d: Array.isArray(radius) ? radius.map(round) : round(radius) } : {}),
    ...(paint.shadow ? { e: paint.shadow.map((shadow) =>
      [shadow.inset ? 1 : 0, shadow.color, round(shadow.x), round(shadow.y), round(shadow.blur), round(shadow.spread)]) } : {}),
    ...(paint.opacity != null ? { a: round(paint.opacity) } : {}),
  };
};

const typographyKeys = (node) => {
  const typography = node.typography;
  if (!typography) return {};
  return {
    y: typography.style
      ? typography.style
      : [round(typography.size), typography.weight, round(typography.lineHeight ?? 0), round(typography.letterSpacing ?? 0)],
    ...(typography.color ? { tc: typography.color } : {}),
    ...(typography.align ? { ta: typography.align } : {}),
    ...(typography.truncate ? { tt: 1 } : {}),
    // 글자 모양으로 오린 그라디언트(figma-tree-spec clippedTextPaint) — [각도, [색, 위치], …].
    ...(typography.gradient ? { tg: [round(typography.gradient.angle), ...typography.gradient.stops.map((stop) => [stop.color, round(stop.position)])] } : {}),
  };
};

const slim = (node) => {
  // 세로 배치에 wrap 칸이 서면 렌더러가 `layoutWrap = "WRAP"` 을 세로 프레임에 걸려다 던진다(2026-09-14
  // `/subscription` 모바일). 원천은 figma-tree-spec 이 막지만, payload 로 새어 나오면 여기서 멈춘다.
  if (node.layout?.wrap && node.layout.layoutMode !== "HORIZONTAL") {
    fail(`wrap 은 HORIZONTAL 에만 실을 수 있습니다: ${node.path} (${node.layout.layoutMode})`);
  }
  // 인스턴스 자리에 글자가 남으면 렌더러가 인스턴스보다 먼저 TEXT 로 만든다(2026-09-26 — 잎 인스턴스가 칠 없는 글자로 그려졌다).
  if (node.instance && node.text) fail(`인스턴스 자리에 글자가 남았습니다: ${node.path} (${node.instance.set})`);
  return slimNode(node);
};
const slimNode = (node) => ({
  t: node.tag,
  // 글자 끝의 공백은 NBSP 로 싣는다(2026-09-28) — Figma 의 폭 자동 글자는 끝 공백을 폭에 넣지 않아, 측정이 살린 경계 공백이
  // 「account?Log in」처럼 사라졌다. 줄바꿈 없는 공백은 글리프라 폭을 차지한다.
  // **글자는 제품 글꼴로 보이는 줄대로 싣는다(2026-09-29).** 보드 글꼴은 너비가 달라 폭만 옮기면 줄이 다른 자리에서 꺾인다
  // (measured-text.mjs). 서명 · 매칭은 spec 의 `text` 를 그대로 본다.
  ...(node.text ? { x: (node.wrapLines?.length > 1 ? node.wrapLines.join("\n") : node.text).replace(/^ /, "\u00a0").replace(/ $/, "\u00a0") } : {}),
  // 글자 안의 범위 서식 [시작, 끝, 굵기(0 = 문단 그대로), 색("" = 그대로), 밑줄 1/0] — 섞인 문단(figma-tree-spec richInlineText).
  ...(node.text && node.textRanges?.length ? { xr: node.textRanges.map((range) => [range.start, range.end, range.weight ?? 0, range.color ?? "", range.underline ? 1 : 0]) } : {}),
  r: [round(node.rect.width), round(node.rect.height)],
  s: SIZING_CODE(node.sizing.layoutSizingHorizontal) + SIZING_CODE(node.sizing.layoutSizingVertical),
  ...(node.positioning === "ABSOLUTE" ? { p: 1 } : {}),
  ...(node.offset ? { o: [round(node.offset.x), round(node.offset.y)] } : {}),
  ...(node.constraints ? { n: node.constraints.horizontal[0] + node.constraints.vertical[0] } : {}),
  // margin은 0이 아닐 때만 담는다(대부분 0이라 payload를 아낀다).
  ...(node.margin && (node.margin.top || node.margin.right || node.margin.bottom || node.margin.left)
    ? { m: [round(node.margin.top), round(node.margin.right), round(node.margin.bottom), round(node.margin.left)] }
    : {}),
  ...(node.sizing.minHeight ? { mh: round(node.sizing.minHeight) } : {}),
  ...(node.sizing.maxWidth ? { mw: round(node.sizing.maxWidth) } : {}),
  // 폭 하한 — 하한에 닿은 자리만(측정 폭 = 하한). 요금제 비교표(`min-width: 640px`)가 스크롤 칸(370)에 FILL 로 눌려 열이 좁아지고
  // 글자가 여러 줄로 꺾여 모바일 보드가 1269 길었다(2026-09-30, 글자 전부 대조).
  ...(node.sizing.minWidth && node.sizing.layoutSizingHorizontal !== "FIXED" && Math.abs(node.rect.width - node.sizing.minWidth) <= 0.5
    ? { mn: round(node.sizing.minWidth) } : {}),
  // 높이 상한 — 상한에 닿은 자리만(측정 높이 = 상한). 늘이기(FILL)가 상한을 넘으면 Figma 가 칸을 더 채운다(하이라이트 허브 모바일 본문
  // `max-height: calc(100dvh - 64px)` 810 이 819 로 서서 가운데 놓인 내용이 4 내려갔다).
  ...(node.sizing.maxHeight && node.sizing.layoutSizingVertical !== "FIXED" && Math.abs(node.rect.height - node.sizing.maxHeight) <= 0.5
    ? { xh: round(node.sizing.maxHeight) } : {}),
  ...(node.layout ? {
    l: [
      node.layout.layoutMode[0],
      round(node.layout.itemSpacing),
      round(node.layout.padding.top), round(node.layout.padding.right),
      round(node.layout.padding.bottom), round(node.layout.padding.left),
      node.layout.align.counterAxis ?? "",
      node.layout.align.primaryAxis ?? "",
      node.layout.wrap ? 1 : 0,
      node.layout.columns ?? 0,
      // 늘어난 grid 행(figma-tree-spec gridStretchedRow) — 있을 때만 11번째 칸으로 싣는다(없는 보드의 payload 는 그대로다).
      // 크기가 다른 grid 열(figma-tree-spec gridColumnTracks)은 12번째 칸이다 — 그때 행이 없으면 11번째는 0 이다.
      ...(node.layout.rows || node.layout.columnTracks ? [node.layout.rows ?? 0] : []),
      ...(node.layout.columnTracks ? [node.layout.columnTracks] : []),
    ],
  } : {}),
  // 감긴 가로 줄의 줄 간격(`row-gap`) — Figma `counterAxisSpacing`. 렌더러가 걸지 않아 감긴 줄 사이가 붙었다(2026-09-30, 공개 페이지
  // 모바일 푸터의 링크 묶음 두 줄 사이 40).
  ...(node.layout?.wrap && node.layout.counterAxisSpacing && wrapRowCount(node) > 1 ? { cg: round(node.layout.counterAxisSpacing) } : {}),
  // grid 칸 안 정렬 [가로, 세로](figma-tree-spec gridCellAlign) — 칸을 채우지 않은 자식만. **`g` 가 아니다** — `g` 는 그라디언트 키다(paintKeys).
  ...(node.gridAlign ? { ga: [node.gridAlign.horizontal ?? "", node.gridAlign.vertical ?? ""] } : {}),
  // grid 칸 자리와 span [행, 열, 행 span, 열 span](figma-tree-spec gridPlacements) · 그 grid 의 행 수.
  ...(node.gridPlace ? { gp: node.gridPlace } : {}),
  ...(node.layout?.rowCount ? { gr: node.layout.rowCount } : {}),
  // 자산 이미지 — `<img src>` 가 이어진 LOUIS 컴포넌트 [id, 이름](IMAGE_COMPONENTS).
  ...(node.imageComponent ? { im: [node.imageComponent.id, node.imageComponent.name] } : {}),
  ...(node.clipsContent ? { c: 1 } : {}),
  // 셸 자리는 자식 대신 컴포넌트 variant 참조만 싣는다.
  // **세 번째 칸은 라벨이다** — 컴포넌트가 노출한 TEXT 슬롯을 채울 글자. 라벨이 없는 인스턴스
  // (Gnb Shell · 본문 블록)는 두 칸 그대로라 payload 가 한 바이트도 바뀌지 않는다. 상단 바는
  // 속성이 여럿이라 문자열이 아니라 `{속성 이름: 글자 | null}` 객체다(2026-09-13, 앱 셸 plan 의 textProperties).
  ...(node.instance ? { i: node.instance.label == null
    ? [node.instance.set, node.instance.variant]
    : [node.instance.set, node.instance.variant, node.instance.label] } : {}),
  // **인스턴스에는 색·타이포를 싣지 않는다.** 컴포넌트가 이미 제 색을 갖고 있고,
  // 덮어쓰면 디자인 시스템 쪽 수정이 화면에 전파되지 않는다. 라벨은 여기 해당하지 않는다 —
  // 컴포넌트가 **스스로 연 슬롯**을 채우는 것이지 컴포넌트가 정한 값을 덮는 것이 아니다.
  // **아이콘의 정체.** `<svg>` 자리는 크기·색만으로는 「20×20 회색 상자」와 구분되지 않는다.
  // 서명 자체를 싣지 않고 이름만 싣는 이유는 payload 예산이다 — 서명 하나가 최대 900바이트라
  // 39자리면 조각이 갈라진다. 서명 ↔ 이름의 조인은 생성 시점에 끝내고(`glyphIdOf`), 감사본
  // (`plan.json` 의 `productGlyphs`)이 그 표를 통째로 들고 있어 원장이 되짚을 수 있다.
  ...(node.glyphId ? { v: node.glyphId } : {}),
  // 아이콘의 그림(figma-tree-spec glyphMarkup) — 렌더러가 createNodeFromSvg 로 그린다.
  ...(node.glyphSvg ? { vs: node.glyphSvg } : {}),
  ...(node.instance ? {} : paintKeys(node)),
  ...(node.instance ? {} : typographyKeys(node)),
  ...(node.children.length ? { k: node.children.map(slim) } : {}),
});
const round = (value) => Math.round((value ?? 0) * 100) / 100;
// payload 한 줄 — NBSP 는 이스케이프로 적는다. 날 글자로 두면 러너를 옮겨 적을 때 여느 공백으로 바뀌기 쉽고, 이스케이프는 포장기
// (wrap-one)가 보내는 사본에서 지킨다.
const payloadLiteral = (payload) => JSON.stringify(payload).replace(/\u00a0/g, "\\u00a0");

/**
 * **화면을 use_figma가 삼킬 수 있는 조각으로 나눈다.**
 *
 * 실측한 제약: `use_figma`는 인라인 payload가 크고 깊으면 `SyntaxError: expecting ']'`로 끊긴다.
 * 단순 크기 문제도 단순 깊이 문제도 아니다 — 7.9KB 평면 배열과 14단계 얕은 중첩은 통과하는데,
 * 89노드/깊이 12짜리 실제 화면은 실패한다(74노드/깊이 12는 통과). 크기×깊이 조합에서 끊긴다.
 *
 * 그래서 한 화면을 조각 여러 개로 낸다:
 *   조각 0 — 프레임 껍데기 + 상단부. 떼어낸 자리에 `w`(대기) 표시를 남긴다.
 *   조각 n — `path`(자식 인덱스 체인)로 그 자리를 찾아 실제 서브트리를 붙인다.
 *
 * **반드시 축약(slim) 후 크기로 재야 한다.** plan.json의 spec은 판정 근거(`why`) 등 감사 필드를 달고
 * 있어 60~168KB지만 축약 후에는 4~14KB다. 감사본 크기로 예산을 재면 과분할된다(실패한 첫 시도).
 */
// 압축 렌더러와 합쳐 `use_figma` 한계 아래로 들어가는 축약 spec 예산 — 러너 바이트 상한(`RUNNER_BYTES`)을 넘는 화면은 아래 루프가
// 예산을 줄여 다시 나눈다. 실측: 20.7KB 페이로드(6화면 묶음)가 통과했다. 예전에 3200으로 잡았던 건 전사 오류를 파서 한계로
// 오해했기 때문이다 — 실제 한계는 훨씬 높다. 조각이 적을수록 적용 호출 수가 줄어든다.
const CHUNK_BUDGET = 30000;
// 러너 한 조각의 바이트 상한 — `use_figma` 의 50,000 에서 포장(전사 오류 가드 약 400자 · 이스케이프 풀이)의 여유를 뺐다.
const RUNNER_BYTES = 47_000;
const slimBytes = (node) => JSON.stringify(node).length;

function splitSpec(slimRoot, budget = CHUNK_BUDGET) {
  const chunks = [];

  // 한 노드를 예산 안에 들어오도록 잘라 head를 만들고, 떼어낸 서브트리를 chunks에 쌓는다.
  const fit = (node, path) => {
    const head = { ...node };
    if (!node.k?.length) return head;

    head.k = node.k.map((child, index) => fit(child, [...path, index]));
    // 자식을 다 붙인 뒤에도 예산을 넘으면, 무거운 자식부터 떼어낸다.
    let order = head.k
      .map((child, index) => ({ index, bytes: slimBytes(child) }))
      .sort((a, b) => b.bytes - a.bytes);
    for (const { index } of order) {
      if (slimBytes(head) <= budget) break;
      const child = head.k[index];
      if (!child || child.w) continue; // 이미 대기표시면 건너뛴다
      chunks.push({ path: [...path, index], spec: child });
      head.k[index] = { t: child.t, r: child.r, s: child.s, w: 1 }; // 자리표시
    }
    return head;
  };

  const head = fit(slimRoot, []);
  // 같은 자리를 두 번 떼어내면 뒤 조각이 대기 자리를 못 찾는다 — 경로는 반드시 유일하다.
  const seen = new Set();
  for (const chunk of chunks) {
    const key = chunk.path.join(".");
    if (seen.has(key)) throw new Error(`[figma-app-screens] 조각 경로가 중복됐습니다: ${key}`);
    seen.add(key);
  }
  return { head, chunks };
}

const screens = [];
const outputs = [];
let totalNodes = 0;
let totalUnresolved = 0;
let totalShells = 0;
let totalShellGaps = 0;
let totalGlyphs = 0;
let totalImageInstances = 0;
let totalGridRows = 0;
const countImageComponents = (node) => (node.imageComponent ? 1 : 0)
  + (node.children ?? []).reduce((sum, child) => sum + countImageComponents(child), 0);
let totalSizingReconciled = 0;
let totalAutoMarginCentred = 0;
let totalMarginWrapped = 0;
let totalSpaceBetweenHug = 0;
let totalBleedHoisted = 0;
let totalBleedUnresolved = 0;
let totalGapsPaired = 0;
let totalGapsUnresolved = 0;
let totalUnresolvedFillInHug = 0;

/**
 * **`<svg>` 자리에 이름을 붙인다.** 서명은 `glyphSignature`(figma-tree-spec.mjs)가 측정에서
 * 떴고, 이름은 손으로 읽은 조인표가 소유한다(figma-glyph-identity.mjs). 여기서는 잇기만 한다.
 *
 * **서명이 표에 없으면 던진다.** 조용히 이름 없이 두면 보드에 「20×20 회색 상자」가 하나 더
 * 늘고, 원장은 그것을 `blocked` 로 세면서 「생성기가 정체를 버렸다」는 이미 틀린 사유를 붙인다.
 * 새 아이콘이 들어오면 표에 한 줄을 적는 것이 이 게이트가 요구하는 일이다.
 */
function applyGlyphIdentity(spec, where) {
  let count = 0;
  const walk = (node) => {
    if (node.instance) return;
    if (node.glyph != null) {
      const glyph = glyphBySignature(node.glyph);
      if (!glyph) {
        fail(
          `아이콘 서명이 조인표에 없습니다(${where} · ${node.path}): ${node.glyph.slice(0, 120)}… — ` +
          "`scripts/lib/figma-glyph-identity.mjs` 의 PRODUCT_GLYPHS 에 이름·대응·사유를 적으세요. " +
          "이름 없이 두면 그 자리는 보드에서 크기만 남은 상자가 됩니다.",
        );
      }
      node.glyphId = glyph.id;
      count += 1;
    }
    for (const child of node.children ?? []) walk(child);
  };
  walk(spec);
  return count;
}
/**
 * **Figma 가 CSS 와 다르게 푸는 크기 조합을 측정으로 풀어 둔다(2026-09-14).**
 *
 * 판정기(`sizing-provenance.mjs`)는 노드 하나의 선언만 본다. 그 판정을 부모와 나란히 두면 Figma 가 CSS 와 다르게
 * 푸는 조합이 둘 생긴다 — 보드 두 장이 그 모양으로 깨져 있었다(2026-09-14 verify-r3 스크린숏, 라이브 탐침):
 *
 *   · **감긴 글자가 HUG 다.** 선언 없는 흐름 글자는 CSS 에서 `min(max-content, 가용 폭)` 이라, 가용 폭보다 길면 그 폭에서
 *     감긴다. Figma 의 HUG 글자(`WIDTH_AND_HEIGHT`)에는 가용 폭이 없어 한 줄로 늘어난다. `/analytics/youtube` 모바일
 *     본문 제목(측정 350 폭 · 5줄)이 폭 1172 한 줄이 되어 카드 좌우로 잘렸다(`30:33`). 측정 높이가 줄 높이의 두 배
 *     이상이면 **감긴 것**이고, 폭을 정한 것은 부모다 — 세로 흐름 부모(글자의 가로가 교차축)의 폭이 정해져 있으면
 *     FILL 로 옮긴다(렌더러가 `textAutoResize = "HEIGHT"` 를 건다, 조립 규칙 28번 「줄바꿈 텍스트」).
 *   · **HUG 부모 안의 FILL 자식.** CSS 에서 내용 크기로 서는(shrink-to-fit) 부모 안의 `flex-grow` · stretch 는 남는
 *     공간이 없어 아무 일도 하지 않는다. Figma 는 HUG 부모의 FILL 자식을 최소 크기로 접는다. `/settings` 의 테마 ·
 *     언어 세그먼트(`flex: 1 1 auto` 버튼 셋)가 트랙 97 · 버튼 29.68 로 접혀 라벨이 서로 겹쳤다(`28:3`). 측정 크기가
 *     **자기 내용 크기와 같으면**(패딩 + 자식 측정 크기 + 간격, 0.5px 안) grow · stretch 가 아무 일도 하지 않은
 *     것이므로 HUG 로 옮긴다. 내용보다 크면 부모 밖에서 온 크기이거나 측정기가 싣지 않은 선언이라 판정을 바꾸지 않는다.
 *
 * 바꾼 자리는 `why` 에 전 판정과 함께 남기고 화면의 `stats.sizingReconciled` 에 센다. 여기서 풀지 못한(부모 폭이
 * 정해지지 않은) 감긴 글자는 `stats.wrappedHugText` 에 남긴다 — 조용히 한 줄로 두지 않는다.
 *
 * **풀지 못한 HUG 부모 · FILL 자식도 같은 대접을 받는다(2026-09-14 리뷰).** 첫 판은 측정이 내용과 다르면 `continue` 로
 * 조용히 넘어갔다. 그래서 `/settings` 세그먼트 칸의 **세로**(교차축 stretch, 측정 28 · 내용 21)가 게이트와 계획으로는
 * 초록인 채 남았고, 라이브에서는 트랙이 패딩 + 21 로 서며 절대 배치 알약(28)이 트랙 아래로 나온다. 이제 그 자리는
 * `stats.unresolvedFillInHug`(자리 · 부모 · 축 · 측정 · 내용 · 종류 · 사유)에 남고, 아래 `UNRESOLVED_FILL_IN_HUG_BY_PARENT`
 * 가 부모 · 축마다 수를 양방향으로 잠근다. **수로 굳히지 않는다** — 측정 크기로 FIXED 를 걸면 부모 판정이 틀린 자리
 * (`/subscription` 한 열 grid 의 트랙 순번)까지 조용히 가려진다. 푸는 길은 선언을 싣거나 부모 판정을 고치는 것이다.
 *
 * Figma 가 CSS 와 같은 크기를 내는 조합은 풀지 못한 것으로 세지 않는다 — Figma 는 HUG 부모의 FILL 자식을 **자기 내용과
 * 최소 크기 중 큰 쪽**으로 세운다:
 *   · 부모에 그 축의 최소 크기가 있고 측정 크기를 덮는다(루트 `body.1.0` 의 뷰포트 최소 높이) — 자식이 그 최소를 채운다.
 *   · 자식의 최소 크기가 측정 크기를 덮는다(`/analytics/youtube` 본문 카드 최소 높이, `/settings` 모바일 `Go` 버튼 최소 폭).
 *   · 교차축에 FILL 이 아닌 형제가 있다 — 그 형제가 부모를 세우고 나머지를 늘인다.
 */
const HALF_PIXEL = 0.5;
const AXIS_OF = {
  horizontal: { sizing: "layoutSizingHorizontal", extent: "width", min: "minWidth", start: "left", end: "right", mode: "HORIZONTAL" },
  vertical: { sizing: "layoutSizingVertical", extent: "height", min: "minHeight", start: "top", end: "bottom", mode: "VERTICAL" },
};
const flowChildren = (node) => (node.children ?? []).filter((child) => child.positioning !== "ABSOLUTE");
/** 감긴 가로 줄이 측정에서 실제로 몇 줄로 섰는가 — 흐름 자식의 y 로 가른다(한 줄이면 줄 간격 · 줄 안 stretch 가 그림에 뜻이 없다). */
const wrapRowCount = (node) => {
  if (!node.layout?.wrap || node.layout.layoutMode !== "HORIZONTAL") return 0;
  const tops = [];
  for (const child of flowChildren(node)) if (!tops.some((y) => Math.abs(y - child.rect.y) <= 0.5)) tops.push(child.rect.y);
  return tops.length;
};
/** 자동 배치 노드가 한 축에서 자기 내용으로 서면 가질 크기(측정 자식 · 간격 · 패딩). 잴 수 없으면 null. */
function contentExtent(node, axisName) {
  const axis = AXIS_OF[axisName];
  const layout = node.layout;
  const children = flowChildren(node);
  if (node.instance || !layout || layout.layoutMode === "GRID" || children.length === 0) return null;
  const outer = (child) => child.rect[axis.extent] + (child.margin?.[axis.start] ?? 0) + (child.margin?.[axis.end] ?? 0);
  const padding = layout.padding[axis.start] + layout.padding[axis.end];
  // 감긴 가로 줄의 세로는 줄마다의 높이 합 + 줄 간격이다 — 측정 자리(y)로 줄을 가른다.
  if (layout.wrap && layout.layoutMode === "HORIZONTAL" && axisName === "vertical") {
    const rows = [];
    for (const child of [...children].sort((a, b) => a.rect.y - b.rect.y)) {
      const row = rows.find((entry) => Math.abs(entry.y - child.rect.y) <= HALF_PIXEL);
      if (row) row.height = Math.max(row.height, outer(child));
      else rows.push({ y: child.rect.y, height: outer(child) });
    }
    return padding + rows.reduce((sum, row) => sum + row.height, 0) + (layout.counterAxisSpacing ?? 0) * (rows.length - 1);
  }
  return layout.layoutMode === axis.mode
    ? padding + children.reduce((sum, child) => sum + outer(child), 0) + layout.itemSpacing * (children.length - 1)
    : padding + Math.max(...children.map(outer));
}
const UNRESOLVED_FILL_KIND = {
  instance: "인스턴스 — 내용 크기는 컴포넌트가 갖고 계획이 잴 수 없다",
  text: "글자 잎 — 계획에 글자의 내용 폭이 없다",
  unmeasurable: "내용 크기를 잴 수 없다(GRID · 흐름 자식 없음)",
  larger: "측정 크기가 내용보다 크다 — 부모 밖(부모 판정 · grid 트랙)에서 왔거나 측정기가 싣지 않은 선언(block-size 등)이다",
  smaller: "측정 크기가 내용보다 작다 — 수축(flex-shrink)이다",
};
function reconcileFigmaSizing(spec) {
  const reconciled = [];
  const unresolvedWraps = [];
  const unresolvedFillInHug = [];
  const change = (node, axisName, to, reason, source) => {
    const axis = AXIS_OF[axisName];
    reconciled.push({ path: node.path, axis: axisName, from: node.sizing[axis.sizing], to, reason });
    node.why = { ...node.why, [axisName]: { verdict: to, reason, source, value: null, previous: node.why?.[axisName] ?? null } };
    node.sizing = { ...node.sizing, [axis.sizing]: to };
  };
  const walk = (node, parent) => {
    if (node.instance) return;
    const lineHeight = node.typography?.lineHeight;
    if (node.text && !node.paint && !node.layout && node.positioning !== "ABSOLUTE" && lineHeight
      && node.sizing.layoutSizingHorizontal === "HUG" && node.rect.height >= lineHeight * 2 - HALF_PIXEL) {
      const lines = Math.round((node.rect.height / lineHeight) * 100) / 100;
      const definite = parent?.layout?.layoutMode === "VERTICAL" && parent.sizing.layoutSizingHorizontal !== "HUG";
      const room = parent?.layout ? parent.rect.width - parent.layout.padding.left - parent.layout.padding.right : null;
      // **가로 줄 안의 감긴 글자(2026-09-26).** flex 행의 글자는 줄어들며(flex-shrink) 형제가 쓰고 남은 폭에서 감긴다 — 쿠폰 결제
      // 동의 문구(체크박스 16 · 간격 10 옆 461.6, 2줄)가 한 줄 550 으로 늘어나 동의 상자가 193 → 174 로 섰다. 형제가 모두 FILL 이
      // 아니고 측정 폭이 남은 폭과 같으면 그 폭을 정한 것은 줄이다 — FILL(남은 폭 차지)로 옮긴다.
      const row = parent?.layout?.layoutMode === "HORIZONTAL" && parent.sizing.layoutSizingHorizontal !== "HUG";
      const siblings = row ? flowChildren(parent).filter((child) => child !== node) : [];
      const leftover = row
        ? room - siblings.reduce((sum, child) => sum + child.rect.width + (child.margin?.left ?? 0) + (child.margin?.right ?? 0), 0)
          - parent.layout.itemSpacing * siblings.length
        : null;
      const fillsRow = row && siblings.every((child) => child.sizing.layoutSizingHorizontal !== "FILL")
        && Math.abs(node.rect.width - leftover) <= HALF_PIXEL;
      if (definite && node.rect.width <= room + HALF_PIXEL) {
        change(node, "horizontal", "FILL",
          `측정 글자가 ${lines}줄로 감겼다 — 폭은 내용이 아니라 부모(세로 흐름, 폭 ${parent.sizing.layoutSizingHorizontal})가 정한다. HUG 글자는 Figma 에서 한 줄로 늘어난다`,
          `height ${node.rect.height} / line-height ${lineHeight}`);
      } else if (fillsRow) {
        change(node, "horizontal", "FILL",
          `측정 글자가 ${lines}줄로 감겼다 — 폭은 가로 줄(폭 ${parent.sizing.layoutSizingHorizontal})에서 형제가 쓰고 남은 폭 ${Math.round(leftover * 100) / 100} 이다. HUG 글자는 Figma 에서 한 줄로 늘어난다`,
          `height ${node.rect.height} / line-height ${lineHeight}`);
      } else {
        unresolvedWraps.push({ path: node.path, lines, parent: parent?.path ?? null });
      }
    }
    // **감긴 줄 안의 세로 stretch(2026-09-30).** 감긴 가로 줄에서 CSS 의 교차축 stretch 는 제 줄의 높이로 늘일 뿐인데, Figma 의 감긴 줄 안
    // 세로 FILL 은 최소로 접혀 둘째 줄이 첫 줄에 겹쳤다(공개 페이지 모바일 푸터, 둘째 줄 −72). 칠이 없으면 HUG(늘어난 높이는 보이지 않는다),
    // 칠이 있으면 측정 높이 FIXED 로 둔다.
    if (wrapRowCount(node) > 1) {
      for (const child of flowChildren(node)) {
        if (child.instance || child.sizing.layoutSizingVertical !== "FILL") continue;
        const hug = !child.paint && (child.layout || child.text);
        change(child, "vertical", hug ? "HUG" : "FIXED",
          `감긴 가로 줄(${node.path}) 안의 세로 stretch — Figma 는 감긴 줄 안의 FILL 을 최소로 접는다. ${hug ? "칠이 없어 내용 높이(HUG)로 둔다" : "칠이 있어 측정 높이로 둔다"}`,
          `wrap row · measured ${child.rect.height}`);
      }
    }
    if (node.layout && node.layout.layoutMode !== "GRID") {
      const children = flowChildren(node);
      for (const axisName of ["horizontal", "vertical"]) {
        const axis = AXIS_OF[axisName];
        if (node.sizing[axis.sizing] !== "HUG") continue;
        // 부모의 최소 크기가 측정 크기를 덮으면 Figma 도 자식을 그 최소까지 채운다 — CSS 와 같다. 덮지 못하면 아래로 흘려 센다.
        const parentMin = node.sizing[axis.min];
        if (parentMin && parentMin >= node.rect[axis.extent] - HALF_PIXEL) continue;
        const primary = node.layout.layoutMode === axis.mode;
        const fills = children.filter((child) => child.sizing[axis.sizing] === "FILL");
        // 교차축은 FILL 이 아닌 형제가 하나라도 있으면 Figma 가 그 형제로 부모를 세우고 나머지를 늘인다 — CSS 와 같다.
        if (fills.length === 0 || (!primary && fills.length !== children.length)) continue;
        // **내용 폭을 잴 수 없는 교차축 FILL 들의 HUG 부모(2026-09-30).** 교차축 자식이 모두 FILL 이면 Figma 는 HUG 부모를 최소로 접는다.
        // CSS 에서 그 부모 폭은 자식의 내용 폭(max-content)인데, 원장에는 한 줄 글자의 글자 폭이 없어(블록 글자의 측정 상자는 늘어난 폭이다)
        // 어느 자식이 폭을 정했는지 되짚을 수 없다 — 문의 데스크톱 안내 카드의 글 칸(304)이 122 로 접혀 문단이 세 줄로 늘었고, 공개 페이지
        // 푸터의 링크 열이 제목 폭으로 좁아졌다. 부모 판정(HUG)은 CSS 대로 맞고 Figma 가 그 조합을 나타내지 못하는 자리라, 부모를 그 뷰포트에서
        // 푼 측정 폭(FIXED)으로 세운다 — 자식은 FILL 로 그 폭을 따른다. 내용을 잴 수 있는 자식만이면 아래 판정(HUG 로 옮기기 · 수축)을 따른다.
        if (!primary && fills.some((child) => contentExtent(child, axisName) == null)) {
          change(node, axisName, "FIXED",
            `교차축 자식이 모두 FILL 이고 내용 폭을 잴 수 없는 자식(글자 잎 · 인스턴스)이 있다 — CSS 의 부모 폭은 자식의 max-content 인데 원장에 글자 폭이 없고, Figma 는 모두 FILL 이면 HUG 부모를 최소로 접는다. 그 뷰포트에서 푼 측정 폭으로 선다`,
            `measured ${node.rect[axis.extent]}`);
          continue;
        }
        for (const child of fills) {
          const measured = child.rect[axis.extent];
          const content = contentExtent(child, axisName);
          if (content != null && Math.abs(measured - content) <= HALF_PIXEL) {
            change(child, axisName, "HUG",
              `HUG 부모(${node.path})의 ${primary ? "주축 grow" : "교차축 stretch"} 가 아무 일도 하지 않았다 — 측정 ${measured} 이 자기 내용 크기와 같다. Figma 는 HUG 부모의 FILL 자식을 최소 크기로 접는다`,
              `content ${Math.round(content * 100) / 100}`);
            continue;
          }
          // 자식의 최소 크기가 측정 크기를 덮으면(그리고 내용이 측정보다 크지 않으면) 늘이기는 아무 일도 하지 않았다 — 자식은 그 최소
          // (= 측정)에 섰다. **FILL 로 두지 않는다(2026-09-30).** Figma 는 HUG 부모의 주축 크기를 FILL 자식의 최소로만 세워 형제가 부모
          // 밖으로 넘쳤다 — 문의 모바일 메시지 칸(textarea FILL · 최소 200 + 첨부 줄 57)이 265 대신 200 으로 서서 그 아래가 모두 65
          // 올라갔다(라이브 탐침). 잎은 측정 크기 FIXED, 자동 배치 프레임은 HUG(최소 크기가 측정을 지킨다)로 옮긴다.
          const childMin = child.sizing[axis.min];
          if (childMin && childMin >= measured - HALF_PIXEL && (content == null || content <= measured + HALF_PIXEL)) {
            change(child, axisName, child.layout ? "HUG" : "FIXED",
              `HUG 부모(${node.path})의 ${primary ? "주축 grow" : "교차축 stretch"} 가 아무 일도 하지 않았다 — 측정 ${measured} 이 자식의 최소 크기 ${childMin} 에 섰다. Figma 는 HUG 부모를 FILL 자식의 최소로만 세워 형제가 넘친다`,
              `min ${childMin}`);
            continue;
          }
          const kind = content != null ? (measured > content ? "larger" : "smaller")
            : child.instance ? "instance" : child.text && !child.layout ? "text" : "unmeasurable";
          unresolvedFillInHug.push({
            path: child.path,
            parent: node.path,
            axis: axisName,
            stretch: primary ? "grow" : "stretch",
            measured,
            content: content == null ? null : Math.round(content * 100) / 100,
            kind,
            reason: UNRESOLVED_FILL_KIND[kind],
          });
        }
      }
    }
    for (const child of node.children ?? []) walk(child, node);
  };
  walk(spec, null);
  return { reconciled, unresolvedWraps, unresolvedFillInHug };
}

/**
 * **내용으로 서는(HUG) 축의 space-between 은 gap 이다(2026-09-26).** CSS `justify-content: space-between` 은 남는 공간을 나눌 뿐이고, 내용으로
 * 서는 축에는 남는 공간이 없어 `gap` 만 남는다. Figma 는 SPACE_BETWEEN 이면 itemSpacing 을 버리고 HUG 축에서는 간격을 0 으로 접는다 — 결제
 * 성공 미리보기 모바일의 결제 정보 행(dt · dd 세로, gap 16)이 붙어 행마다 16 씩 올라갔다(마지막 행 −111, 보드 글자 자리 대조). 그 축이 HUG
 * 이면 주축 정렬을 MIN 으로 두어 itemSpacing(= gap)이 살게 한다.
 */
function dropHugSpaceBetween(spec) {
  const changed = [];
  const walk = (node) => {
    if (node.instance) return;
    const layout = node.layout;
    if (layout && layout.align?.primaryAxis === "SPACE_BETWEEN") {
      const axis = layout.layoutMode === "VERTICAL" ? node.sizing.layoutSizingVertical
        : layout.layoutMode === "HORIZONTAL" ? node.sizing.layoutSizingHorizontal : null;
      if (axis === "HUG") {
        changed.push({ path: node.path, layoutMode: layout.layoutMode, itemSpacing: layout.itemSpacing });
        node.layout = { ...layout, align: { ...layout.align, primaryAxis: null } };
      }
    }
    for (const child of node.children ?? []) walk(child);
  };
  walk(spec);
  return changed;
}

/**
 * **형제가 있는 자식의 margin 을 감싸개 패딩으로 옮긴다(2026-09-26).** Figma Auto Layout 에는 margin 이 없고, 렌더러는 흐름 자식이
 * 하나일 때만 margin 을 부모 padding 으로 옮긴다 — 그 판정이 자식을 붙이는 순간에 돌아 **첫 자식의 margin 은 형제가 뒤에 와도 부모
 * padding 에 붙고**(첫 자식의 margin-bottom 이 부모 아래로 간다 — 결제 동의 상자의 체크박스 margin-top 4 가 줄 전체의 위 패딩이
 * 되어 상자가 2 커졌다), **둘째부터는 버려졌다**(결제 결과 보드 14 장과 미리보기 12 장의 본문이 `margin-top: 108` 을 잃어 상단 바에
 * 붙었다 — 제품 h1 y 165 · 보드 64). 형제가 있는 흐름 자식이 margin 을 가지면 칠 없는 감싸개(자식 하나)로 싸서 렌더러의 「자식 하나」
 * 규칙이 감싸개 padding 으로 옮기게 한다(음수는 전과 같이 0 으로 막힌다 — 번짐). 감싸개의 크기는 축마다 자식이 FILL 이면 FILL,
 * 아니면 HUG — CSS 에서 margin 상자가 차지하는 자리다.
 *
 * **GRID 부모도 감싼다(2026-09-29).** 처음에는 「칸이 정한다」며 건너뛰었는데, 렌더러는 grid 행을 내용 높이(HUG)로 깔아서 CSS 에서
 * auto 행 높이에 들어가던 margin 이 칸에 남지 않았다. 로그인 모바일 보드의 열(grid, 자식 셋)에서 로고 링크의 `margin-bottom: 24` 는
 * 첫 자식이라 열 전체의 아래 padding 이 되고, 버튼 · 링크 줄의 `margin-top: 8` 은 버려져, 제품 로고 y 278 · 폼 388 이 보드에서
 * 285.5 · 371.5 가 됐다(제품 캡처와 나란히 놓아 찾았다 — 구조 대조는 통과했다). grid 칸에 서는 것은 감싸개이므로 칸 안 정렬
 * (`gridAlign`)을 감싸개가 넘겨받고, 감싸개 안은 세로 오토 레이아웃이다 — margin 상자가 칸 안에 서는 CSS 와 같다.
 */
function wrapSiblingMargins(spec) {
  const wrapped = [];
  const SIDES = ["top", "right", "bottom", "left"];
  // 양수 margin 만 감싼다. 음수(번짐 — 상단 바 −16 / −8)는 감싸개가 들고 가서 전과 같이 부모 padding 을 깎는다(첫 자식일 때).
  const hasMargin = (node) => node.margin && SIDES.some((side) => (node.margin[side] ?? 0) > 0.01);
  const axis = (sizing) => (sizing === "FILL" ? "FILL" : "HUG");
  const walk = (node) => {
    if (node.instance) return;
    const children = node.children ?? [];
    const grid = node.layout?.layoutMode === "GRID";
    if (node.layout && flowChildren(node).length >= 2) {
      node.children = children.map((child) => {
        if (child.positioning === "ABSOLUTE" || !hasMargin(child)) return child;
        const gridAlign = grid ? child.gridAlign ?? null : null;
        if (grid) delete child.gridAlign;
        const gridPlace = grid ? child.gridPlace ?? null : null;
        if (grid) delete child.gridPlace;
        const out = Object.fromEntries(SIDES.map((side) => [side, Math.max(0, child.margin[side] ?? 0)]));
        const bleed = Object.fromEntries(SIDES.map((side) => [side, Math.min(0, child.margin[side] ?? 0)]));
        wrapped.push({ path: child.path, margin: SIDES.map((side) => child.margin[side] ?? 0) });
        child.margin = out;
        const sizing = {
          ...child.sizing,
          layoutSizingHorizontal: axis(child.sizing.layoutSizingHorizontal),
          layoutSizingVertical: axis(child.sizing.layoutSizingVertical),
          minWidth: null, maxWidth: null, minHeight: null, maxHeight: null, unresolved: [],
        };
        const reason = "형제가 있는 자식의 margin 감싸개 — 자식이 FILL 이면 FILL, 아니면 HUG";
        return {
          path: `${child.path}~margin`, tag: "margin", name: `margin ${child.path}`, text: null, textLines: null, paints: false,
          rect: { x: child.rect.x - out.left, y: child.rect.y - out.top,
            width: child.rect.width + out.left + out.right, height: child.rect.height + out.top + out.bottom },
          glyph: null, sizing, paint: null, typography: null, positioning: "AUTO",
          margin: bleed, offset: null, constraints: null,
          why: { horizontal: { verdict: sizing.layoutSizingHorizontal, reason }, vertical: { verdict: sizing.layoutSizingVertical, reason } },
          // 방향과 교차축 정렬은 부모를 따른다 — 최대 폭에 닿은 FILL 자식(결제 결과 본문 520)이 부모의 CENTER 로 가운데 서던 것을
          // 감싸개 안에서도 그대로 받게. grid 부모의 감싸개는 세로 오토 레이아웃이고 칸 안 정렬을 넘겨받는다(위 주석).
          ...(gridAlign ? { gridAlign } : {}),
          ...(gridPlace ? { gridPlace } : {}),
          layout: { layoutMode: grid ? "VERTICAL" : node.layout.layoutMode, itemSpacing: 0, counterAxisSpacing: null, wrap: false,
            padding: { top: 0, right: 0, bottom: 0, left: 0 }, columns: null, align: { counterAxis: grid ? null : node.layout.align?.counterAxis ?? null, primaryAxis: null } },
          clipsContent: false,
          children: [child],
        };
      });
    }
    for (const child of node.children ?? []) walk(child);
  };
  walk(spec);
  return wrapped;
}

/**
 * **좌우 번짐(음수 margin)을 padding 을 가진 조상까지 끌어올린다(2026-09-26).** 렌더러는 자식을 붙이는 순간 흐름 자식이 하나이면
 * margin 을 부모 padding 으로 옮기고 음수는 0 에서 막는다. 그래서 ① 번짐을 받을 padding 이 직계 부모에 없으면 번짐이 사라졌고(설정 ·
 * 구독 · 쿠폰 · highlight · 보관함의 상단 바가 padding 0 인 부모 안에 갇혀 제품보다 좌 16 · 우 8 안쪽에 섰다 — 모바일은 6),
 * ② 번지는 자식이 첫 자식이면 부모 padding 을 깎아 **뒤에 오는 형제까지** padding 없이 섰다(결제 결과 · bulk · 요금제 본문 — 요금제
 * 카드 격자의 가운데가 4 어긋났다).
 * 아래에서 위로 돈다. 부모 N 의 한 변 s 에서 흐름 자식 번짐의 최댓값을 D 라 하면, N 의 padding[s] 에서 take = min(padding, D) 를
 * 깎고 남는 D − take 는 N 이 음수 margin 으로 들고 올라간다(N 이 그만큼 넓어지고, N 의 부모가 같은 규칙으로 받는다). 각 흐름 자식은
 * 원래 자리를 지키도록 (옮긴 번짐 − 제 번짐) 만큼 감싸개 padding 을 받는다(이미 감싸개면 그 padding 에 더한다). 칠 · 테두리 · 그림자 ·
 * 자르기가 있는 노드와 뿌리 · 절대 배치 노드는 넓히면 모양이 바뀌므로 넓히지 않는다(못 옮긴 번짐은 `unresolved`). 형제가 있는 가로
 * 줄 · GRID 는 건드리지 않고, 위아래 번짐은 전과 같이 렌더러가 다룬다.
 */
function hoistBleed(spec) {
  const hoisted = [];
  const unresolved = [];
  const SIDES = ["left", "right"];
  const rigid = (node) => Boolean(node.clipsContent || node.paint?.fill || node.paint?.gradient || node.paint?.stroke || node.paint?.shadow);
  const bleedOf = (node, side) => Math.max(0, -(node.margin?.[side] ?? 0));
  const axis = (sizing) => (sizing === "FILL" ? "FILL" : "HUG");
  const walk = (node, isRoot) => {
    if (node.instance) return;
    for (const child of node.children ?? []) walk(child, false);
    if (!node.layout || node.layout.layoutMode === "GRID") return;
    const flow = flowChildren(node);
    const moved = {};
    for (const side of SIDES) {
      const most = Math.max(0, ...flow.map((child) => bleedOf(child, side)));
      if (most <= HALF_PIXEL) continue;
      if (flow.length > 1 && node.layout.layoutMode !== "VERTICAL") {
        unresolved.push({ path: node.path, side, bleed: most, why: "형제가 있는 가로 줄" });
        continue;
      }
      const pad = node.layout.padding[side];
      const take = Math.min(pad, most);
      const canGrow = !isRoot && !rigid(node) && node.positioning !== "ABSOLUTE"
        && !(node.children ?? []).some((child) => child.positioning === "ABSOLUTE");
      const grow = canGrow ? most - take : 0;
      if (most - take - grow > HALF_PIXEL) unresolved.push({ path: node.path, side, bleed: most, moved: take + grow, why: canGrow ? "" : "칠 · 자르기 · 뿌리 · 절대 배치" });
      node.layout = { ...node.layout, padding: { ...node.layout.padding, [side]: pad - take } };
      if (grow > HALF_PIXEL) {
        node.margin = { top: 0, right: 0, bottom: 0, left: 0, ...node.margin, [side]: (node.margin?.[side] ?? 0) - grow };
        node.rect = { ...node.rect, x: node.rect.x - (side === "left" ? grow : 0), width: node.rect.width + grow };
      }
      moved[side] = take + grow;
      hoisted.push({ path: node.path, side, bleed: most, padding: take, grow });
    }
    if (Object.keys(moved).length === 0) return;
    node.children = node.children.map((child) => {
      if (child.positioning === "ABSOLUTE") return child;
      const pad = Object.fromEntries(SIDES.map((side) => [side, Math.max(0, (moved[side] ?? 0) - bleedOf(child, side))]));
      for (const side of SIDES) if (moved[side] != null && bleedOf(child, side) > 0) child.margin = { ...child.margin, [side]: 0 };
      if (pad.left <= HALF_PIXEL && pad.right <= HALF_PIXEL) return child;
      if (child.tag === "margin") {
        child.layout = { ...child.layout, padding: { ...child.layout.padding, left: child.layout.padding.left + pad.left, right: child.layout.padding.right + pad.right } };
        child.rect = { ...child.rect, x: child.rect.x - pad.left, width: child.rect.width + pad.left + pad.right };
        return child;
      }
      const sizing = {
        ...child.sizing,
        layoutSizingHorizontal: axis(child.sizing.layoutSizingHorizontal),
        layoutSizingVertical: axis(child.sizing.layoutSizingVertical),
        minWidth: null, maxWidth: null, minHeight: null, maxHeight: null, unresolved: [],
      };
      const reason = "번짐을 조상으로 올린 만큼 형제 자리를 지키는 감싸개 — 자식이 FILL 이면 FILL, 아니면 HUG";
      return {
        path: `${child.path}~margin`, tag: "margin", name: `margin ${child.path}`, text: null, textLines: null, paints: false,
        rect: { x: child.rect.x - pad.left, y: child.rect.y, width: child.rect.width + pad.left + pad.right, height: child.rect.height },
        glyph: null, sizing, paint: null, typography: null, positioning: "AUTO",
        margin: null, offset: null, constraints: null,
        why: { horizontal: { verdict: sizing.layoutSizingHorizontal, reason }, vertical: { verdict: sizing.layoutSizingVertical, reason } },
        layout: { layoutMode: node.layout.layoutMode, itemSpacing: 0, counterAxisSpacing: null, wrap: false,
          padding: { top: 0, right: pad.right, bottom: 0, left: pad.left }, columns: null, align: { counterAxis: node.layout.align?.counterAxis ?? null, primaryAxis: null } },
        clipsContent: false,
        children: [child],
      };
    });
  };
  walk(spec, true);
  return { hoisted, unresolved };
}

/**
 * **형제 사이의 위아래 음수 margin 을 두 형제를 묶은 세로 쌓기의 간격으로 옮긴다(2026-09-29).** Figma Auto Layout 에는 margin 이
 * 없고 간격(itemSpacing · gridRowGap)은 부모 안에서 하나다. 렌더러는 첫 자식의 margin 만 부모 padding 으로 옮기고(음수는 0 에서
 * 막힌다) 나머지는 버려서, 형제를 겹치거나 당기는 음수 margin 이 사라졌다 — 로그인 · 가입 · 비밀번호 화면의 입력칸 한 쌍(테두리를
 * 겹치는 `margin-bottom: -1`)이 1 벌어져 폼이 제품보다 1 컸고(172 ↔ 171), 로그인 데스크톱의 아래 링크 줄(`margin-top: -12`)은 12,
 * 가입 안내 문단(`-4`)은 4 아래에 섰다. 음수 간격을 가진 이웃 둘을 칠 없는 세로 쌓기 하나로 묶고 간격을 (부모 간격 + 음수 margin)
 * 으로 둔다 — Figma 는 음수 간격을 받는다. 세로 쌓기와 한 열 GRID 에서만(여러 열이면 칸 배치가 바뀐다) 묶고, 늘어난 행(`rows`)이
 * 있는 GRID 는 건드리지 않는다. 묶음의 교차축 정렬은 부모(세로) 또는 채우지 않는 자식의 칸 정렬(GRID)을 따르고, 두 자식의 칸
 * 정렬이 다르면 묶지 않는다(`unresolved`). 묶음은 첫 자식의 위 · 둘째의 아래 음수 margin 을 들고 가 다음 이웃과 다시 묶일 수 있다.
 */
function pairNegativeGaps(spec) {
  const paired = [];
  const unresolved = [];
  const below = (node) => Math.min(0, node.margin?.bottom ?? 0);
  const above = (node) => Math.min(0, node.margin?.top ?? 0);
  const walk = (node) => {
    if (node.instance) return;
    for (const child of node.children ?? []) walk(child);
    const mode = node.layout?.layoutMode;
    const grid = mode === "GRID";
    if (mode !== "VERTICAL" && !(grid && (node.layout.columns ?? 1) === 1 && !node.layout.rows)) return;
    for (let guard = 0; guard < 64; guard += 1) {
      const flow = flowChildren(node);
      const index = flow.findIndex((child, at) => at + 1 < flow.length && below(child) + above(flow[at + 1]) < -HALF_PIXEL);
      if (index < 0) return;
      const [a, b] = [flow[index], flow[index + 1]];
      const overlap = below(a) + above(b);
      a.margin = { ...a.margin, bottom: 0 };
      b.margin = { ...b.margin, top: 0 };
      let counterAxis = grid ? null : node.layout.align?.counterAxis ?? null;
      if (grid) {
        const aligns = [...new Set([a, b].filter((child) => child.sizing.layoutSizingHorizontal !== "FILL")
          .map((child) => child.gridAlign?.horizontal ?? "AUTO"))];
        if (aligns.length > 1) {
          unresolved.push({ path: node.path, pair: [a.path, b.path], overlap, why: "두 자식의 칸 정렬이 다르다" });
          continue;
        }
        counterAxis = aligns[0] && aligns[0] !== "AUTO" ? aligns[0] : null;
      }
      const fill = (key) => ([a, b].some((child) => child.sizing[key] === "FILL") ? "FILL" : "HUG");
      const sizing = {
        ...a.sizing, layoutSizingHorizontal: fill("layoutSizingHorizontal"), layoutSizingVertical: fill("layoutSizingVertical"),
        minWidth: null, maxWidth: null, minHeight: null, maxHeight: null, unresolved: [],
      };
      const gridAlign = grid && sizing.layoutSizingHorizontal !== "FILL" && counterAxis ? { horizontal: counterAxis, vertical: null } : null;
      if (grid) { delete a.gridAlign; delete b.gridAlign; }
      const gap = Math.round(((node.layout.itemSpacing ?? 0) + overlap) * 100) / 100;
      const reason = "음수 margin 으로 겹치거나 당기는 이웃 둘의 묶음 — 둘 중 하나가 FILL 이면 FILL, 아니면 HUG";
      const left = Math.min(a.rect.x, b.rect.x);
      const top = Math.min(a.rect.y, b.rect.y);
      const pair = {
        path: `${a.path}~pair`, tag: "pair", name: `pair ${a.path}`, text: null, textLines: null, paints: false,
        rect: { x: left, y: top, width: Math.max(a.rect.x + a.rect.width, b.rect.x + b.rect.width) - left,
          height: Math.max(a.rect.y + a.rect.height, b.rect.y + b.rect.height) - top },
        glyph: null, sizing, paint: null, typography: null, positioning: "AUTO",
        margin: { top: above(a), right: 0, bottom: below(b), left: 0 }, offset: null, constraints: null,
        why: { horizontal: { verdict: sizing.layoutSizingHorizontal, reason }, vertical: { verdict: sizing.layoutSizingVertical, reason } },
        ...(gridAlign ? { gridAlign } : {}),
        layout: { layoutMode: "VERTICAL", itemSpacing: gap, counterAxisSpacing: null, wrap: false,
          padding: { top: 0, right: 0, bottom: 0, left: 0 }, columns: null, align: { counterAxis, primaryAxis: null } },
        clipsContent: false,
        children: [a, b],
      };
      a.margin = { ...a.margin, top: 0 };
      b.margin = { ...b.margin, bottom: 0 };
      paired.push({ path: pair.path, pair: [a.path, b.path], gap, overlap });
      const at = node.children.indexOf(a);
      node.children = node.children.filter((child) => child !== b).map((child) => (child === a ? pair : child));
      if (at < 0) throw new Error(`pairNegativeGaps: 자식 자리를 잃었다 ${a.path}`);
    }
    throw new Error(`pairNegativeGaps: 묶기가 끝나지 않는다 ${node.path}`);
  };
  walk(spec);
  return { paired, unresolved };
}

/**
 * **`margin: auto` 가운데 정렬을 부모의 교차축 정렬로 옮긴다(2026-09-23).**
 *
 * Figma Auto Layout 에는 margin 이 없다. 렌더러는 흐름 자식이 하나일 때만 margin 을 부모 padding 으로 옮기고, 형제가 있으면
 * 버린다. `max-width: min(1300px, 100%)` 에 `margin-inline: auto` 인 `/mypage/upgrade` 데스크톱 카드 격자 컨테이너는 상단 바와
 * 형제라 여백 174 / 174 가 버려져 본문 왼쪽에 붙었다(제품은 가운데 x 430). 한계가 없던 때는 FILL 1672 가 이를 가렸다.
 * 여백이 auto 에서 왔다는 것은 수로 닫힌다 — 좌우 여백이 같고, 폭이 최대 폭에 닿았고, 여백이 (부모 안쪽 폭 − 폭) / 2 다.
 * 형제가 모두 가로 FILL 이면 교차축 정렬은 그 형제들에 아무 일도 하지 않으므로 부모를 CENTER 로 두고 여백을 지운다.
 *
 * 첫 자식이 음수 margin 으로 번지면(상단 바 −16 / −8) 렌더러가 부모 padding 을 깎아 가운데 기준이 넓어지던 차이(`/mypage/upgrade`
 * 데스크톱 4 = (16 − 8) / 2, 예전 `residual`)는 hoistBleed 가 형제 감싸개로 padding 을 돌려주어 없앤다.
 */
function centreAutoMargins(spec) {
  const centred = [];
  const walk = (node) => {
    if (node.instance) return;
    if (node.layout?.layoutMode === "VERTICAL") {
      const children = flowChildren(node);
      const inner = node.rect.width - node.layout.padding.left - node.layout.padding.right;
      const offsetOf = (child) => child.rect.x - node.rect.x - node.layout.padding.left;
      const auto = children.filter((child) => {
        const margin = child.margin ?? { left: 0, right: 0 };
        const slack = (inner - child.rect.width) / 2;
        const fillAtMax = child.sizing.layoutSizingHorizontal === "FILL" && child.sizing.maxWidth != null
          && Math.abs(child.rect.width - child.sizing.maxWidth) <= HALF_PIXEL;
        if (!fillAtMax || slack <= HALF_PIXEL) return false;
        const byMargin = margin.left > HALF_PIXEL && Math.abs(margin.left - margin.right) <= HALF_PIXEL
          && Math.abs(margin.left - slack) <= HALF_PIXEL;
        // **계산 margin 이 0 으로 읽혀도 자리가 가운데면 auto 다(2026-09-26).** 측정기가 flex 항목의 auto margin 사용값을 때때로 0 으로
        // 읽는다 — `/settings` 데스크톱 본문(`margin-inline: auto`, x 380)이 세 번 재어 0 · 124 · 0 이었다. rect 는 세 번 모두 같으므로
        // 좌우 margin 이 둘 다 0 이고 자리가 부모 안쪽의 가운데이면 같은 판정을 준다.
        const byGeometry = Math.abs(margin.left ?? 0) <= HALF_PIXEL && Math.abs(margin.right ?? 0) <= HALF_PIXEL
          && Math.abs(offsetOf(child) - slack) <= HALF_PIXEL;
        return byMargin || byGeometry;
      });
      if (auto.length > 0 && children.every((child) => auto.includes(child) || child.sizing.layoutSizingHorizontal === "FILL")) {
        centred.push({ path: node.path, from: node.layout.align.counterAxis, children: auto.map((child) => child.path),
          margin: auto.map((child) => ((child.margin?.left ?? 0) > HALF_PIXEL ? child.margin.left : Math.round(offsetOf(child) * 100) / 100)) });
        node.layout = { ...node.layout, align: { ...node.layout.align, counterAxis: "CENTER" } };
        for (const child of auto) child.margin = { ...child.margin, left: 0, right: 0 };
      }
    }
    for (const child of node.children ?? []) walk(child);
  };
  walk(spec);
  return centred;
}

const paintStats = { fills: 0, gradients: 0, strokes: 0, radii: 0, shadows: 0, texts: 0, textStyled: 0, textLiteral: new Set() };

// ── 제품 부품(PARTS) — 보드보다 먼저 변환한다. 보드가 같은 서브트리를 이 부품의 인스턴스로 쓰려면 서명이 먼저 있어야 한다.
const parts = [];
const partContent = [];
{
  const styleById = new Map(fixture.computedStyles.map((entry) => [entry.id, entry.value]));
  for (const part of PARTS) {
    const seen = new Set();
    for (const variant of part.variants) {
      if (seen.has(variant.variant)) fail(`부품 variant 가 겹칩니다: ${part.set} ${variant.variant}`);
      seen.add(variant.variant);
      const measured = fixture.screens[variant.context]?.[variant.route];
      if (!measured?.tree?.length) fail(`부품의 측정 트리가 없습니다: ${variant.route} @ ${variant.context}`);
      const root = measured.tree.find((node) => node.path === variant.path) ?? fail(`부품 경로가 측정에 없습니다: ${part.set} ${variant.variant} ${variant.path}`);
      const tree = normalizeAuthFixtureTree(measured.tree, fixture.computedStyles);
      const { spec, stats } = toFigmaTreeSpec(tree, { rootPath: variant.path, contextId: variant.context });
      // 서명은 치환 «앞»에서 뜬다 — 보드 쪽 매처도 치환 전 서브트리의 글자로 판정한다.
      const signature = contentSignatureOf(spec);
      const look = lookOf(spec);
      if (part.label && (!signature.leaf || signature.texts.length !== 1 || !new RegExp(part.labelPattern).test(signature.texts[0]))) {
        fail(`글자 속성 부품은 글자 하나를 든 잎이고 그 글자가 labelPattern 에 들어야 합니다: ${part.set} ${variant.variant} ${JSON.stringify(signature.texts)}`);
      }
      if (JSON.stringify(signature.texts) !== JSON.stringify(variant.anchor)) {
        fail(`부품 ${part.set} ${variant.variant} 의 글자 서열이 기대와 다릅니다 — 측정 경로가 다른 노드를 가리킨다: ${JSON.stringify(signature.texts)}`);
      }
      // 부품 안의 LOUIS 정본 프리미티브는 보드와 같은 규칙으로 인스턴스가 된다(셸 · 본문 세트는 부품 안에 없다).
      const styleByPath = new Map(measured.tree.map((node) => [node.path, styleById.get(node.styleRef)]));
      const declaredByPath = new Map(measured.tree.map((node) => [node.path, node.declared ?? null]));
      const inner = applyComponentInstances(spec, {
        route: variant.route,
        context: variant.context,
        viewport: { width: measured.rootRect.width, height: measured.rootRect.height },
        styleOf: (path) => styleByPath.get(path) ?? null,
        declaredOf: (path) => declaredByPath.get(path) ?? null,
        evidence: { recipes, readback },
      });
      if (inner.applied.some((applied) => applied.path === variant.path)) fail(`부품 뿌리가 다른 세트로 치환됐습니다: ${part.set} ${variant.variant}`);
      applyGlyphIdentity(spec, `${part.set} ${variant.variant}`);
      const sizingFix = reconcileFigmaSizing(spec);
      // 부품은 모든 인스턴스가 따라 그리는 원본이다 — 풀지 못한 감긴 글자(한 줄로 늘어난다)를 보드처럼 통계로만 두지 않고 멈춘다.
      if (sizingFix.unresolvedWraps.length > 0) {
        fail(`부품 ${part.set} ${variant.variant} 에 풀지 못한 감긴 글자가 있습니다 — Figma 에서 한 줄로 늘어납니다: ${JSON.stringify(sizingFix.unresolvedWraps)}`);
      }
      centreAutoMargins(spec);
      const marginWrapped = wrapSiblingMargins(spec);
      const bleed = hoistBleed(spec);
      if (bleed.unresolved.length > 0) fail(`부품 ${part.set} ${variant.variant} 에 옮기지 못한 번짐이 있습니다: ${JSON.stringify(bleed.unresolved)}`);
      const gaps = pairNegativeGaps(spec);
      if (gaps.unresolved.length > 0) fail(`부품 ${part.set} ${variant.variant} 에 묶지 못한 음수 간격이 있습니다: ${JSON.stringify(gaps.unresolved)}`);
      const spaceBetweenHug = dropHugSpaceBetween(spec);
      const viewport = variant.context.startsWith("desktop") ? "Desktop" : "Mobile";
      partContent.push({ set: part.set, variant: variant.variant, viewport, texts: signature.texts, structure: signature.structure,
        ...(signature.leaf ? { leaf: signature.leaf } : {}),
        ...(part.label ? { label: part.label, labelPattern: part.labelPattern, look } : {}) });
      parts.push({
        set: part.set, variant: variant.variant, route: variant.route, context: variant.context, path: variant.path,
        ...(part.label ? { label: part.label } : {}),
        componentId: variant.component, frameSize: [round(root.rect.width), round(root.rect.height)],
        signature, instances: inner.applied, stats: { kept: stats.kept, unresolved: stats.unresolved, sizingReconciled: sizingFix.reconciled.length,
          ...(stats.lineBoxSlack.length ? { lineBoxSlack: stats.lineBoxSlack } : {}),
          ...(marginWrapped.length ? { marginWrapped } : {}),
          ...(bleed.hoisted.length ? { bleedHoisted: bleed.hoisted } : {}),
          ...(gaps.paired.length ? { negativeGapsPaired: gaps.paired } : {}),
          ...(spaceBetweenHug.length ? { spaceBetweenHug } : {}) },
        spec,
      });
    }
  }
}

for (const screen of SCREENS) {
  const source = fixtureOf(screen);
  for (const context of CONTEXTS) {
    const measured = source.screens[context.id]?.[screen.route];
    if (!measured?.tree?.length) fail(`측정 트리가 없습니다: ${screen.route} @ ${context.id}`);
    if (measured.theme !== measuredTheme) fail(`화면 테마 ${measured.theme} 가 fixture 테마 ${measuredTheme} 와 다릅니다: ${screen.route} @ ${context.id}`);
    if (measured.redirected) fail(`리다이렉트된 route는 대상이 아닙니다: ${screen.route}`);

    const tree = normalizeAuthFixtureTree(measured.tree, source.computedStyles);
    const { spec, stats } = toFigmaTreeSpec(tree, {
      rootPath: measured.rootPath,
      contextId: context.id,
      // 뷰포트만 잰 원장은 뷰포트 밖에서 시작하는 노드를 싣지 않는다(figma-tree-spec flowSlack).
      recordedBottom: measured.fullPage ? null : measured.viewport.height,
    });
    // **이미 있는 컴포넌트는 다시 그리지 않는다.** 셸(사이드바·상단 바)과 본문 블록(결제 결과·
    // 체크아웃 상태·요금제 카드)을 잘라내고 인스턴스를 심는다(판정 근거는 figma-component-substitution.mjs).
    // **계산 스타일을 경로로 되찾는다.** `toFigmaTreeSpec` 는 색·기하를 파싱해 담지만 그
    // 과정에서 판정에 필요한 축(min-width·column-gap·box-shadow)이 사라진다 — `parseBoxShadow` 는 2026-09-26 까지
    // `color(srgb …)` 표기를 읽지 못해 헤어라인이 통째로 없어졌다(지금은 읽고, 안쪽 링은 획으로 옮긴다).
    // 그래서 spec 이 들고 있는 `path` 로 fixture 의 원래 계산 스타일을 다시 본다.
    const styleById = new Map(source.computedStyles.map((entry) => [entry.id, entry.value]));
    const styleByPath = new Map(measured.tree.map((node) => [node.path, styleById.get(node.styleRef)]));
    // 선언(`declared`)도 경로로 되찾는다 — 사이드바는 폭 수가 아니라 폭 선언으로 찾는다(figma-component-substitution.mjs).
    const declaredByPath = new Map(measured.tree.map((node) => [node.path, node.declared ?? null]));
    const shells = applyComponentInstances(spec, {
      route: screen.route,
      context: context.id,
      viewport: { width: measured.rootRect.width, height: measured.rootRect.height },
      styleOf: (path) => styleByPath.get(path) ?? null,
      declaredOf: (path) => declaredByPath.get(path) ?? null,
      evidence: { recipes, readback },
      extraContent: partContent,
    });
    // **아이콘 정체를 서명 ↔ 이름 조인표에 댄다.** 인스턴스 치환 «뒤에» 돌린다 — 셸 안으로
    // 사라진 글리프는 payload 에 나오지 않으므로 이름을 붙일 일도 없다.
    const glyphs = applyGlyphIdentity(spec, `${screen.route} @ ${context.id}`);
    totalGlyphs += glyphs;
    // 자산 이미지도 치환 «뒤에» 잇는다 — 셸 안으로 사라진 로고(사이드바 워드마크)는 셸 컴포넌트가 그린다.
    const unmappedImages = [];
    attachImageComponents(spec, unmappedImages);
    totalImageInstances += countImageComponents(spec);
    totalGridRows += stats.gridRows.filter((entry) => entry.rows).length;
    // 인스턴스 치환 뒤에 돈다 — 인스턴스로 바뀐 서브트리 안의 판정은 컴포넌트가 갖는다.
    const sizingFix = reconcileFigmaSizing(spec);
    const autoMarginCentred = centreAutoMargins(spec);
    totalAutoMarginCentred += autoMarginCentred.length;
    const marginWrapped = wrapSiblingMargins(spec);
    totalMarginWrapped += marginWrapped.length;
    const bleed = hoistBleed(spec);
    totalBleedHoisted += bleed.hoisted.length;
    totalBleedUnresolved += bleed.unresolved.length;
    const gaps = pairNegativeGaps(spec);
    totalGapsPaired += gaps.paired.length;
    totalGapsUnresolved += gaps.unresolved.length;
    const spaceBetweenHug = dropHugSpaceBetween(spec);
    totalSpaceBetweenHug += spaceBetweenHug.length;
    totalSizingReconciled += sizingFix.reconciled.length;
    totalUnresolvedFillInHug += sizingFix.unresolvedFillInHug.length;
    totalNodes += stats.kept;
    totalUnresolved += stats.unresolved.length;
    totalShells += shells.applied.length;
    totalShellGaps += shells.skipped.length;
    // 이관 커버리지 — 숫자로 판정할 수 있어야 "이관이 됐다"고 말할 수 있다.
    const tally = (spec) => {
      if (spec.instance) return;
      if (spec.paint?.fill) paintStats.fills += 1;
      if (spec.paint?.gradient) paintStats.gradients += 1;
      if (spec.paint?.stroke) paintStats.strokes += 1;
      if (spec.paint?.radius) paintStats.radii += 1;
      if (spec.paint?.shadow) paintStats.shadows += 1;
      if (spec.typography) {
        paintStats.texts += 1;
        if (spec.typography.style) paintStats.textStyled += 1;
        else paintStats.textLiteral.add(`${spec.typography.size}/${spec.typography.weight}/${spec.typography.lineHeight}/${spec.typography.letterSpacing}`);
      }
      for (const child of spec.children ?? []) tally(child);
    };
    tally(spec);

    screens.push({
      route: screen.route,
      context: context.id,
      figmaFrameId: screen[context.key],
      // **보드는 뷰포트 창이다.** 인증 fixture 는 뷰포트와 겹치는 노드만 잰다(측정기 `intersectsViewport`) — 문서가 뷰포트보다
      // 길어도(결제 성공 미리보기 모바일 1103 · 1286) 그 아래 행은 측정에 없다. 프레임을 문서 높이로 세우면 아래가 빈 채 남으므로
      // 뷰포트 높이에서 자른다(보드 이름 「뷰포트 창」).
      // 문서 끝까지 잰 화면(`fullPage`, 공개 원장)은 문서 높이로 선다 — 뷰포트 창 규칙은 뷰포트만 잰 원장의 것이다.
      frameSize: [round(measured.rootRect.width), round(measured.fullPage ? measured.rootRect.height : Math.min(measured.rootRect.height, Number(context.id.split("x").pop())))],
      shells,
      stats: {
        measured: stats.total,
        kept: stats.kept,
        droppedInvisible: stats.droppedInvisible,
        droppedEmpty: stats.droppedEmpty,
        unresolved: stats.unresolved,
        // 제품은 세로 flex 에 wrap 을 걸었지만 Figma 는 HORIZONTAL 에만 wrap 이 있어 NO_WRAP 으로 옮긴 자리.
        ...(stats.verticalWrap.length ? { verticalWrap: stats.verticalWrap } : {}),
        // 한 줄짜리 인라인 흐름의 줄 상자(strut)를 패딩으로 옮긴 자리(figma-tree-spec 의 lineBoxSlack 주석).
        ...(stats.lineBoxSlack.length ? { lineBoxSlack: stats.lineBoxSlack } : {}),
        // 늘어난 grid 행(FIXED)과 칸 안 정렬(figma-tree-spec 의 gridStretchedRow · gridCellAlign 주석).
        ...(stats.gridRows.length ? { gridRows: stats.gridRows } : {}),
        // LOUIS 자산에 잇지 못해 빈 상자로 남은 `<img>`(IMAGE_COMPONENTS 주석).
        ...(unmappedImages.length ? { unmappedImages } : {}),
        // Figma 가 CSS 와 다르게 푸는 크기 조합을 측정으로 푼 자리(reconcileFigmaSizing 주석) · 풀지 못한 감긴 글자 ·
        // 풀지 못한 HUG 부모 · FILL 자식(UNRESOLVED_FILL_IN_HUG_BY_PARENT 가 부모 · 축마다 수를 잠근다).
        ...(sizingFix.reconciled.length ? { sizingReconciled: sizingFix.reconciled } : {}),
        ...(sizingFix.unresolvedWraps.length ? { wrappedHugText: sizingFix.unresolvedWraps } : {}),
        ...(sizingFix.unresolvedFillInHug.length ? { unresolvedFillInHug: sizingFix.unresolvedFillInHug } : {}),
        // `margin: auto` 가운데 정렬을 부모 교차축 CENTER 로 옮긴 자리(centreAutoMargins 주석).
        ...(autoMarginCentred.length ? { autoMarginCentred } : {}),
        // 형제가 있는 자식의 margin 을 감싸개 padding 으로 옮긴 자리(wrapSiblingMargins 주석).
        ...(marginWrapped.length ? { marginWrapped } : {}),
        // 좌우 번짐을 padding 을 가진 조상까지 올린 자리 · 못 옮긴 번짐(hoistBleed 주석).
        ...(bleed.hoisted.length ? { bleedHoisted: bleed.hoisted } : {}),
        ...(bleed.unresolved.length ? { bleedUnresolved: bleed.unresolved } : {}),
        // 형제 사이의 위아래 음수 margin 을 묶음 간격으로 옮긴 자리 · 묶지 못한 자리(pairNegativeGaps 주석).
        ...(gaps.paired.length ? { negativeGapsPaired: gaps.paired } : {}),
        ...(gaps.unresolved.length ? { negativeGapsUnresolved: gaps.unresolved } : {}),
        // HUG 축의 space-between 을 MIN(gap 이 사는 정렬)으로 옮긴 자리(dropHugSpaceBetween 주석).
        ...(spaceBetweenHug.length ? { spaceBetweenHug } : {}),
      },
      spec,
    });
  }
}

/**
 * **사이드바 variant 는 측정 사이드바 서브트리와 어긋날 수 없다(2026-09-13).**
 *
 * 사이드바의 `Current` 는 route 표(`PRODUCT_CURRENT_PATH`)가 고른다. 표만 믿으면 틀려도 조용하다 —
 * 옛 표는 highlight 여섯과 `/mypage/upgrade` 하위 셋을 Default 로 두었고 어느 게이트도 울지 않았다.
 * 그런데 활성 항목은 측정에 남는다(활성 버튼의 글자색·CTA 면이 다른 styleRef 다). 그래서 사이드바
 * 서브트리의 [상대 경로·태그·글자·rect·styleRef] 를 서명으로 삼아 두 가지를 확인한다:
 *   ① 서명이 같은 보드는 같은 variant 다.
 *   ② variant 의 출처 route(components plan)가 이 fixture 에 측정돼 있으면, 그 variant 를 받은 보드의
 *      서명은 출처와 같다. (`Current=Highlight` 의 출처 `/highlight` 는 fixture 에 없어 ②를 건너뛰고
 *      ①만 받는다.)
 */
{
  const desktopContext = CONTEXTS.find((context) => context.key === "desktop").id;
  // 화면마다 제 원장에서 읽는다 — 허브(세션 원장)의 사이드바도 같은 서명 규칙을 받는다. 스타일 id 는 값의 해시라 원장이 달라도 견줄 수 있다.
  const measuredOf = (route) => {
    const screen = SCREENS.find((entry) => entry.route === route.split("?")[0] || entry.route === route);
    return (screen ? fixtureOf(screen) : fixture).screens[desktopContext]?.[route] ?? fixture.screens[desktopContext]?.[route];
  };
  const signatureOf = (route, path) => {
    const nodes = (measuredOf(route)?.tree ?? [])
      .filter((node) => node.path === path || node.path.startsWith(`${path}.`));
    return nodes.length === 0 ? null : JSON.stringify(nodes.map((node) =>
      [node.path.slice(path.length), node.tag, node.ownText ?? "", node.rect, node.styleRef]));
  };
  const variantBySignature = new Map();
  for (const entry of screens) {
    if (entry.context !== desktopContext) continue;
    const sidebar = entry.shells.applied.find((applied) => applied.set === COMPONENT_SETS.sidebar);
    if (!sidebar) continue;
    const signature = signatureOf(entry.route, sidebar.path) ?? fail(`사이드바 측정 서브트리가 없습니다: ${entry.route} ${sidebar.path}`);
    const seen = variantBySignature.get(signature);
    if (seen && seen.variant !== sidebar.variant) {
      fail(
        `사이드바 서브트리가 같은 두 보드가 다른 variant 를 받았습니다: ${seen.route}(${seen.variant}) · ` +
        `${entry.route}(${sidebar.variant}). figma-component-substitution.mjs 의 PRODUCT_CURRENT_PATH 를 제품 <Gnb currentPath> 와 대조하세요.`,
      );
    }
    variantBySignature.set(signature, { route: entry.route, variant: sidebar.variant });
    const source = SIDEBAR_VARIANT_SOURCES[sidebar.variant];
    if (source && measuredOf(source) && signatureOf(source, sidebar.path) !== signature) {
      fail(
        `${entry.route} 가 ${sidebar.variant} 를 받았지만 사이드바 서브트리가 그 variant 의 출처 ${source} 와 다릅니다. ` +
        "활성 항목이 다른 화면입니다 — PRODUCT_CURRENT_PATH 를 제품 <Gnb currentPath> 와 대조하세요.",
      );
    }
  }
}

/**
 * **본문 블록 인스턴스는 세트마다 정확히 잠근다(2026-09-14, 크기 굳힘 감사 묶음 2).**
 *
 * 감사 시점에 결과 · 체크아웃 보드 14장의 본문이 한 장도 인스턴스가 되지 못하고 날노드로 그려지고 있었는데, 어떤 게이트도
 * 말하지 않았다 — 치환 매처가 크기 손 사본을 1px 창으로 비교했고, 실패는 `skipped` 에도 남지 않았다. 매처는 이제 세트 plan 의
 * 글자 서열 · 구조 서명 · 뷰포트로 판정하고, 글자가 같은데 맞지 않은 자리는 사유와 함께 `skipped` 에 남긴다. 여기서는 그 결과를
 * 두 쪽에서 잠근다:
 *   · 세트별 인스턴스 수가 아래 수와 **같다**(양방향). 줄면 보드가 날노드로 돌아간 것이고, 늘면 새 화면이 붙었거나 오치환이다 —
 *     어느 쪽이든 누군가 보고 이 수를 고치며 사유를 적는다(보드 구성 게이트의 `SHELL_INSTANCES_BY_BOARD` 와 같은 규칙).
 *   · 본문 세트의 `skipped` 는 0 이다. 사유가 생기면 세트나 매처가 제품과 어긋난 것이다.
 * 수는 결과 8(billing-change-fail · billing-change-success · topup/success · topup/fail × 두 뷰포트 — topup/fail 은
 * billing-change-fail 과 본문 서브트리가 같아 같은 `Outcome=Failure` 를 받는다) · 체크아웃 6(billing-success · billing-fail ·
 * upgrade/fail × 두 뷰포트) · 요금제 카드 5(`/mypage/upgrade` 데스크톱) · 보이는 조각 2(같은 route 모바일)다.
 */
const CONTENT_INSTANCES_BY_SET = {
  [COMPONENT_SETS.paymentResult]: 8,
  [COMPONENT_SETS.checkoutStatus]: 6,
  // 2026-09-29: 5 → 9 — 공개 원장 `/pricing` 데스크톱의 요금제 카드 넷이 `/mypage/upgrade` 카드와 글자 서열 · 구조 · 뷰포트가 같다(같은 제품 카드).
  [COMPONENT_SETS.upgradePlanCard]: 9,
  [COMPONENT_SETS.upgradePlanCardSlice]: 2,
  // 2026-09-26: 「진행 중 이벤트 알약」(제품 `PricingNotice`) — `/mypage/upgrade` 데스크톱 · 모바일 헤더의 알약 하나씩.
  // 2026-09-29: 2 → 4 — 공개 원장 `/pricing` 데스크톱 · 모바일 헤더에도 같은 알약이 선다.
  [COMPONENT_SETS.pricingNotice]: 4,
  // 2026-09-26(뒤): 제품 부품 세트(PARTS) — `/subscription/coupons` 의 요금제 선택 카드 넷 × 두 뷰포트, 수량 스테퍼 × 두 뷰포트.
  "Product/Gift Plan Option": 8,
  "Product/Quantity Stepper": 2,
  // 둘째 묶음: 유튜브 연결 버튼 × 두 뷰포트(잎 서명 — 버튼이 글자를 제 몸에 든다), 하이라이트 업로드 테마 칩 줄 × 두 뷰포트,
  // 쿠폰 결제 동의 상자 × 데스크톱.
  "Product/Analytics Connect Button": 2,
  "Product/Highlight Theme Chips": 2,
  // 2026-09-29: 1 → 2 — 세션 원장 결제 진행(`/mypage/upgrade/checkout?plan=pro`) 데스크톱에도 같은 동의 상자가 선다.
  "Product/Checkout Agreement": 2,
  // 셋째 묶음: 결제 상태 알림 × 두 뷰포트(billing-success 일부 반영 미리보기), bulk 쿠폰 안내 × 두 뷰포트 × 미리보기 둘(성공 · 발급 실패).
  "Product/Billing Status Alert": 2,
  "Product/Bulk Coupon Notice": 4,
  // 넷째 묶음: 쿠폰 코드 칩 — bulk 성공 미리보기 데스크톱 30 · 모바일 15(측정 화면 안에 보이는 칩만 잰다).
  "Product/Coupon Code Chip": 45,
};
const contentSets = new Set([...CONTENT_COMPONENTS, ...partContent].map((entry) => entry.set));
const contentInstances = Object.fromEntries([...contentSets].map((set) => [set, 0]));
const contentSkipped = [];
for (const entry of screens) {
  for (const applied of entry.shells.applied) if (contentSets.has(applied.set)) contentInstances[applied.set] += 1;
  for (const skipped of entry.shells.skipped) if (contentSets.has(skipped.set)) contentSkipped.push(`${entry.route} @ ${entry.context} · ${skipped.path}: ${skipped.reason}`);
}
for (const set of new Set([...Object.keys(CONTENT_INSTANCES_BY_SET), ...contentSets])) {
  if ((contentInstances[set] ?? 0) !== CONTENT_INSTANCES_BY_SET[set]) {
    fail(
      `본문 세트 ${set} 의 인스턴스가 ${contentInstances[set] ?? 0} 개입니다(기준 ${CONTENT_INSTANCES_BY_SET[set] ?? 0}). ` +
      "줄었으면 매처가 그 보드를 놓친 이유를, 늘었으면 옳은 서브트리에 붙었는지를 먼저 보고 CONTENT_INSTANCES_BY_SET 을 고치며 사유를 적으세요.",
    );
  }
}
// **알고 둔 보류(2026-09-29).** 공개 원장 `/pricing` 모바일의 요금제 카드 넷은 데스크톱 카드와 글자 서열이 같지만 세트에 모바일 variant 가 없다 —
// 모바일 세트는 `/mypage/upgrade` 모바일 뷰포트에 보이는 조각(`upgradePlanCardSlice`)뿐이다. 모바일 온전한 카드 variant 가 서기 전까지 보드는
// 측정한 노드 그대로 그린다. 여기 없는 보류는 여전히 멈춘다.
const CONTENT_SKIPPED_ALLOWED = new Set([1, 2, 3, 4].map((index) => `/pricing @ mobile-402x874 · body.1.0.0.2.0.0.1.${index}`));
const contentSkippedUnexpected = contentSkipped.filter((line) => !CONTENT_SKIPPED_ALLOWED.has(line.split(":")[0]));
if (contentSkippedUnexpected.length > 0) fail(`본문 세트 치환이 사유와 함께 보류됐습니다 — 세트 plan 이나 매처가 제품과 어긋났습니다:\n  ${contentSkippedUnexpected.join("\n  ")}`);

/**
 * **풀지 못한 HUG 부모 · FILL 자식은 부모 · 축마다 정확히 잠근다(2026-09-14 리뷰).**
 *
 * `reconcileFigmaSizing` 이 no-op grow · stretch 를 HUG 로 푼 뒤에도 남는 자리다. 첫 판은 이 자리를 조용히 넘겨, `/settings`
 * 세그먼트 칸의 세로가 계획 · 게이트로는 초록인 채 라이브에 적용될 뻔했다. 수는 양방향이다 — 늘면 Figma 가 CSS 와 다르게
 * 접는 자리가 새로 생긴 것이고, 줄면 선언이 실렸거나 부모 판정이 고쳐진 것이다. 어느 쪽이든 그 자리를 보드에서 보고 여기를
 * 고치며 사유를 적는다. 키는 fixture 경로라 재측정이 경로를 옮기면 여기서 멈춘다 — 조용히 다른 자리에 붙지 않는다.
 * 사유가 같은 자리는 `why` 를 나눠 쓴다.
 */
// 2026-09-15: `/settings` 두 뷰포트 테마 · 언어 트랙의 칸 세로(`body.1.0.0.1.0.1.7.1.0` · `…8.1.0` 세로 3 · 3 · 3 · 3)가 빠졌다 —
// 제품 칸은 LOUIS `.louis-segmented-control[data-size=settings] .louis-segmented-control__segment` 의
// `block-size: var(--louis-layout-settings-segment-height)` 로 서는데 측정기 선언 수집(`DECLARED_PROPERTIES`)에 논리 크기 속성이 없어
// 판정이 교차축 stretch 였다. 속성을 더하고(`scripts/lib/declared-styles.mjs` — 물리 칸으로 합친다) auth fixture 를 앵커에서 다시 재자
// 칸 세로가 선언 FIXED 가 되어 트랙이 패딩 + 칸 선언 높이로 선다.
const ROW_ACTION_BUTTON_WHY =
  "행 액션 칸의 LOUIS Button 인스턴스 grow. 부모(행의 액션 칸)가 내용 크기라 CSS 의 grow 는 no-op 인데, 인스턴스의 내용 크기는 " +
  "컴포넌트가 가져 계획이 대조할 수 없다. Figma 는 인스턴스를 자기 내용(라벨 + 패딩)으로 세운다 — 라이브 `28:44` 읽기 전용 탐침(2026-09-14)에서 " +
  "다섯 모두 폭이 측정과 같았다";
const TEXT_DETERMINED_WHY =
  "글자가 부모 폭을 정하는 stretch. 부모가 내용 크기라 폭은 가장 긴 글자의 내용 폭이고, Figma 도 글자 내용 폭으로 선다 — 라이브 `190:1172` " +
  "읽기 전용 탐침(2026-09-14)에서 부모 폭이 측정과 글리프 폭 차이만큼만 달랐다";
// 2026-09-15: `/subscription` 두 뷰포트 `Credit usage history` 블록(`body.1.0.0.1.0.1.1.0.2` 가로 2 · 2)이 빠졌다 — 판정기가 한 열
// grid 의 셋째 자식 트랙을 자식 순번으로 집어 못 찾던 것을 자동 배치 열 번호로 풀었다(`sizing-provenance.mjs` 의
// `gridAutoPlacementColumn`). 블록이 트랙 `1fr` 의 FILL 이 되어 그 안의 FILL 자식이 더는 HUG 부모 안에 있지 않다.
// 2026-09-29: `/subscription` 데스크톱 본문 칸(`body.1.0.0.1.0.1` 세로 1)이 풀렸다 — 그 높이의 출처는 `min-height: 100%` 였고 크기 판정이
// 퍼센트를 버렸다. 트리 변환이 부모 안쪽 높이의 P% 가 측정 높이와 같으면 최소 높이로 싣는다(figma-tree-spec 퍼센트 최소 높이) —
// 칸이 1044 로 서고 section 이 남은 높이를 채워, 가운데 선 안내가 9 위에 서던 것이 풀린다.
// 2026-09-29: 세션 · 공개 원장 보드(부스 운영 · 문의 · 공개 페이지 푸터)의 HUG 부모 · FILL 자식 — **캡처 대조 전**이다. 보낸 뒤 보드 캡처 · 글자 자리
// 대조로 폭이 무너졌는지 보고, 무너지지 않았으면 근거를 적고 무너졌으면 판정기(reconcileFigmaSizing)를 고쳐 이 줄을 푼다.
const PUBLIC_FOOTER_PENDING_WHY = "공개 페이지 푸터(링크 열 · 소셜 링크)의 stretch 자식 — 2026-09-29 새 보드, 캡처 대조 전";
const INQUIRY_FORM_PENDING_WHY = "문의 폼 · 안내 칸의 stretch 자식 — 2026-09-29 새 보드, 캡처 대조 전";
const BOOTH_ADMIN_PENDING_WHY = "부스 운영 본문의 grow 자식 — 2026-09-29 새 보드, 캡처 대조 전";
const LANDING_PENDING_WHY = "랜딩 개요 · 푸터의 세로 stretch 자식 — 2026-09-30 새 보드(가장 높은 형제가 HUG 로 서고 나머지가 그 높이로 늘어나는지 캡처 대조 전)";
const UNRESOLVED_FILL_IN_HUG_BY_PARENT = {
  "/ @ desktop-1920x1080 · body.1.0.0.2.1.0.1 · vertical": { count: 1, why: LANDING_PENDING_WHY },
  "/ @ desktop-1920x1080 · body.1.0.0.2.1.0.1.1.2.0.0.0.0.0.0.0.2.0.0.1.0.4.0.0 · vertical": { count: 1, why: LANDING_PENDING_WHY },
  "/ @ desktop-1920x1080 · body.1.0.0.3.1.0.1 · vertical": { count: 1, why: PUBLIC_FOOTER_PENDING_WHY },
  "/ @ mobile-402x874 · body.1.0.0.2.1.0.1.1.2.0.0.0.0.0.0.0.2.0.0.1.0.4.0.0 · vertical": { count: 1, why: LANDING_PENDING_WHY },
  "/inquiry @ desktop-1920x1080 · body.1.0.0.3.1.0.1 · vertical": { count: 1, why: PUBLIC_FOOTER_PENDING_WHY },
  "/pricing @ desktop-1920x1080 · body.1.0.0.3.1.0.1 · vertical": { count: 1, why: PUBLIC_FOOTER_PENDING_WHY },
  "/templates @ desktop-1920x1080 · body.1.0.0.3.1.0.1 · vertical": { count: 1, why: PUBLIC_FOOTER_PENDING_WHY },
  "/blog @ desktop-1920x1080 · body.1.0.0.3.1.0.1 · vertical": { count: 1, why: PUBLIC_FOOTER_PENDING_WHY },
  "/settings @ mobile-402x874 · body.1.0.0.1.0.1.1.1 · horizontal": { count: 1, why: ROW_ACTION_BUTTON_WHY },
  "/settings @ mobile-402x874 · body.1.0.0.1.0.1.4.1 · horizontal": { count: 1, why: ROW_ACTION_BUTTON_WHY },
  "/settings @ mobile-402x874 · body.1.0.0.1.0.1.5.1 · horizontal": { count: 1, why: ROW_ACTION_BUTTON_WHY },
  "/settings @ mobile-402x874 · body.1.0.0.1.0.1.6.1 · horizontal": { count: 1, why: ROW_ACTION_BUTTON_WHY },
  "/settings @ mobile-402x874 · body.1.0.0.1.0.1.10.1 · horizontal": { count: 1, why: ROW_ACTION_BUTTON_WHY },
};
{
  const actual = {};
  for (const entry of screens) {
    for (const item of entry.stats.unresolvedFillInHug ?? []) {
      const key = `${entry.route} @ ${entry.context} · ${item.parent} · ${item.axis}`;
      actual[key] = (actual[key] ?? 0) + 1;
    }
  }
  const drift = [...new Set([...Object.keys(UNRESOLVED_FILL_IN_HUG_BY_PARENT), ...Object.keys(actual)])]
    .filter((key) => (actual[key] ?? 0) !== (UNRESOLVED_FILL_IN_HUG_BY_PARENT[key]?.count ?? 0))
    .map((key) => `${key}: ${actual[key] ?? 0} (기준 ${UNRESOLVED_FILL_IN_HUG_BY_PARENT[key]?.count ?? 0})`);
  if (drift.length > 0) {
    fail(
      `풀지 못한 HUG 부모 · FILL 자식이 기준과 다릅니다 — Figma 는 그 자식을 CSS 와 다르게 접습니다:\n  ${drift.join("\n  ")}\n` +
      "늘었으면 계획 stats.unresolvedFillInHug 의 자리를 보드에서 보고, 줄었으면 무엇이 풀었는지 확인한 뒤 UNRESOLVED_FILL_IN_HUG_BY_PARENT 를 고치며 사유를 적으세요.",
    );
  }
}

/**
 * **측정 색 → 라이브 변수(값 대조) 감사본.** 렌더러는 칠하는 자리(`f` 면 · `b` 선 · `tc` 글자)의 측정 hex 와 값이 같은 변수를
 * `P.colour.collections` 순서 · 파일의 변수 순서로 처음 만나는 것에 묶고, 없으면 리터럴로 칠해 `unboundColors` 로 돌려준다.
 * 같은 값을 되읽기에서 같은 규칙(모드 · 별칭 · `rrggbb[aa]` 8비트 표기)으로 풀어 적어 둔다 — 라이브 실행의 `unboundColors`
 * 가 여기 `unbound` 와 같아야 한다. 후보가 여럿인 색은 전부 적는다(렌더러가 파일 순서로 고른다).
 */
// 되읽기의 색 값은 `[r, g, b, a]`(0–1, 소수 6자리)다 — 렌더러의 `colorToHex` 와 같은 8비트 표기로 옮긴다.
const colourHex = ([r, g, b, a]) => {
  const channel = (value) => Math.round(value * 255).toString(16).padStart(2, "0");
  return `${channel(r)}${channel(g)}${channel(b)}${a === undefined || a >= 0.999 ? "" : channel(a)}`;
};
const variablesByHex = new Map();
for (const variable of liveColour.colorVariables(colour.collections, colour.mode)) {
  const hex = colourHex(variable.value);
  if (!variablesByHex.has(hex)) variablesByHex.set(hex, []);
  variablesByHex.get(hex).push(`${variable.collection}/${variable.name}`);
}
const paintedHexes = new Set();
for (const entry of screens) {
  const walk = (node) => {
    if (node.instance) return;
    for (const hex of [node.paint?.fill, node.paint?.stroke?.color, node.typography?.color]) if (hex) paintedHexes.add(hex);
    for (const child of node.children ?? []) walk(child);
  };
  walk(entry.spec);
}
const colourBinding = {
  ...colour,
  bound: Object.fromEntries([...paintedHexes].sort().filter((hex) => variablesByHex.has(hex)).map((hex) => [hex, variablesByHex.get(hex)])),
  unbound: [...paintedHexes].sort().filter((hex) => !variablesByHex.has(hex)),
};

const plan = {
  $comment: "Generated by scripts/build-figma-app-screens.mjs. Do not edit by hand.",
  $evidenceClass: "development-auth-fixture 측정 기반 Figma Auto Layout 화면 — 운영 세션·실데이터 parity 아님",
  $why: "측정 픽셀을 박지 않고 크기 출처(FILL/HUG/FIXED/ABSOLUTE)로 조립하므로 프레임을 리사이즈하면 제품처럼 반응한다.",
  productCommit: fixture.productCommit,
  figmaFileKey: "OlYKERKOkgbxBEEoXGZW2c",
  screenCount: screens.length,
  totalNodes,
  totalUnresolved,
  totalShellInstances: totalShells,
  totalShellGaps,
  totalSizingReconciled,
  totalUnresolvedFillInHug,
  contentInstancesBySet: contentInstances,
  colourBinding,
  // **낱개 정본 프리미티브의 판정 근거를 생성물에 남긴다.** 목록에 «없는» 것이 곧 판정이라
  // (「제품이 그 자리에서 정본을 물지 않는다」), 사유가 코드에만 있으면 보드를 읽는 사람은
  // 그것이 누락인지 결정인지 구분할 수 없다.
  louisPrimitiveSites: LOUIS_PRIMITIVE_SITES.map((site) => ({
    id: site.id, probe: site.probe, element: site.element,
    component: site.component, size: site.size, why: site.why,
  })),
  louisPrimitiveExclusions: LOUIS_PRIMITIVE_EXCLUSIONS,
  // **아이콘 조인표도 생성물에 싣는다 — 정본 자리 목록과 같은 이유다.** 보드 원장은 payload 의
  // `v`(이름)만 보고 「LOUIS 에 대응이 있는가」를 판정해야 하는데, 목록을 그쪽에 다시 적으면
  // 두 벌이 되어 반드시 어긋난다. 서명까지 통째로 싣는 이유는 감사다 — 이름이 어느 그림에
  // 붙었는지 확인하려면 서명이 있어야 한다.
  productGlyphs: PRODUCT_GLYPHS,
  paint: { ...paintStats, textLiteral: [...paintStats.textLiteral].sort() },
  screens,
};

outputs.push({ absolute: planPath, expected: `${JSON.stringify(plan, null, 2)}\n` });

// **조각 런너.** 화면 하나가 `use_figma` 한 번에 안 들어가므로(위 splitSpec 주석 참조) 화면·문맥마다
// 조각 파일을 낸다. 조각 0을 먼저 돌리고 나머지를 순서대로 돌리면 화면이 완성된다.
// 렌더러 앞에 공용 조각(변수 · 모드 풀이)을 붙인다 — 제품 컴포넌트 러너와 같은 순서(payload 줄 뒤 · 템플릿 앞).
// **렌더러는 압축해 싣는다(2026-09-30).** 주석을 그대로 실은 렌더러가 조각마다 약 43KB(한글 주석이 바이트를 키운다)라 50,000 바이트
// 벽 안에서 payload 는 조각당 7KB 남짓이었다 — 요금제 데스크톱이 15 조각, 약관(`/privacy`)은 뷰포트마다 139 조각이 되어 보낼 수
// 없었다. 형제 생성기(제품 컴포넌트 · 업그레이드 장면)와 같은 방법으로 esbuild 로 줄인다 — 주석은 저장소(scripts/templates)에 그대로
// 남는다. `P` 는 감싸개 밖에서 선언되는 자유 변수라 이름이 바뀌지 않고, `const P=…;` 줄은 JSON 그대로다(라이브 대조 · 보드 원장이
// 그 줄만 읽는다).
const template = (() => {
  const prefix = "async function __figmaRunner__(){";
  const readable = readFileSync(resolve(repoRoot, RENDERER_LIB), "utf8") + readFileSync(templatePath, "utf8");
  const wrapped = transformSync(`${prefix}${readable}}`, { minify: true, target: "es2022" }).code.trim();
  if (!wrapped.startsWith(prefix) || !wrapped.endsWith("}")) fail("렌더러 압축 결과의 감싸개가 예상과 다릅니다");
  return `${wrapped.slice(prefix.length, -1)}\n`;
})();
const manifest = [];
for (const entry of screens) {
  const slimSpec = slim(entry.spec);
  // **파일명에 위험한 글자를 남기지 않는다.** 화면 키는 이제 route가 아니라 상태라서
  // `?`·`[`·`]`가 들어올 수 있다(`/highlight/[projectId]?__phase=upload`). 셸 글롭이 대괄호를
  // 문자 클래스로, `?`를 한 글자 와일드카드로 읽으므로 `figma/app-screens.*`를 다루는 명령이
  // 조용히 빗나간다. 점도 뺀다 — 파일명 구획자(`app-screens.<slug>.<문맥>.<번호>.draw.js`)다.
  // 지금 SCREENS 12개의 키는 `[a-z-]`뿐이라 결과가 한 글자도 바뀌지 않는다.
  // 랜딩(`/`)은 지우면 빈 이름이라 `home` 으로 부른다(`app-screens..desktop` 이 되지 않게).
  const slug = (entry.route === "/" ? "home" : entry.route.replace(/^\//, "").replace(/\//g, "-")
    .replace(/[^A-Za-z0-9_-]+/g, "-"))
    + "." + (entry.context.startsWith("desktop") ? "desktop" : "mobile");

  // 조각 0: 프레임 껍데기 + head. 이후 조각들은 path로 자리표시를 찾아 채운다.
  // 조각은 **조상 먼저** 나가야 한다. `splitSpec`은 깊은 곳부터 떼어내므로 push 순서대로 돌리면
  // 아직 자리표시로 남아 있는 조상 안쪽을 찾으려다 실패한다(실측: `/mypage/upgrade` desktop 등 4화면).
  // 경로 길이 오름차순이면 조상이 항상 먼저이고, 형제끼리는 원래 순서를 유지한다.
  const draftsOf = ({ head, chunks }) => {
    const ordered = chunks
      .map((chunk, index) => ({ chunk, index }))
      .sort((a, b) => a.chunk.path.length - b.chunk.path.length || a.index - b.index);
    // **떼어낸 자리를 조각 하나에 묶는다(2026-09-30).** 나누기는 무거운 자식을 하나씩 떼어내므로, 문단이 많은 문서는 떼어낸 자리마다 조각이
    // 하나라 약관이 뷰포트마다 18 ~ 41 조각이었다. 조상 먼저 순서를 지키며 예산까지 채운다 — 자리를 만드는 조각이 늘 앞(같은 조각이면
    // 앞 칸)이고, 렌더러 · 라이브 대조 · 보드 원장은 `slots` 를 차례로 채운다.
    const groups = [];
    for (const { chunk } of ordered) {
      const size = slimBytes(chunk.spec) + JSON.stringify(chunk.path).length + 16;
      const last = groups.at(-1);
      if (last && last.size + size <= budget) { last.slots.push({ path: chunk.path, spec: chunk.spec }); last.size += size; }
      else groups.push({ size, slots: [{ path: chunk.path, spec: chunk.spec }] });
    }
    const payloads = [
      { route: entry.route, context: entry.context, frameId: entry.figmaFrameId, frameSize: entry.frameSize, colour, head },
      ...groups.map((group) => ({ route: entry.route, context: entry.context, frameId: entry.figmaFrameId,
                                  colour, slots: group.slots })),
    ];
    return payloads.map((payload, index) => {
      const name = `figma/app-screens.${slug}.${String(index).padStart(2, "0")}.draw.js`;
      const draw =
        `// Generated by scripts/build-figma-app-screens.mjs. Do not edit by hand.\n` +
        `// ${entry.route} · ${entry.context} · 조각 ${index}/${groups.length}\n` +
        `// 조각 00을 먼저 돌리고 나머지를 번호 순서대로 use_figma에 넘긴다.\n` +
        `const P=${payloadLiteral(payload)};\n${template}`;
      return { name, draw, bytes: Buffer.byteLength(draw) };
    });
  };
  // **조각 예산을 바이트 상한에 맞춰 줄인다(2026-09-26).** 예산(`CHUNK_BUDGET`)은 축약 spec 의 글자 수이고 상한은 러너 전체의
  // 바이트다 — 렌더러가 자라거나 조각에 한글이 많으면 예산 안의 조각이 50,000 바이트를 넘는다(설정 데스크톱 49,730). 넘는 화면만
  // 예산을 1000 씩 줄여 다시 나눈다. 넘는 화면이 없으면 결과는 한 글자도 바뀌지 않는다.
  let budget = CHUNK_BUDGET;
  let drafts = draftsOf(splitSpec(slimSpec, budget));
  while (drafts.some((draft) => draft.bytes > RUNNER_BYTES)) {
    budget -= 1000;
    if (budget < 3000) fail(`조각 예산을 3000 아래로 줄여도 ${RUNNER_BYTES} 바이트에 들지 않습니다: ${entry.route} @ ${entry.context}`);
    drafts = draftsOf(splitSpec(slimSpec, budget));
  }
  const files = [];
  for (const { name, draw, bytes } of drafts) {
    outputs.push({ absolute: resolve(repoRoot, name), expected: draw });
    files.push({ file: name, bytes });
  }

  manifest.push({ route: entry.route, context: entry.context, frameId: entry.figmaFrameId,
                  chunkCount: files.length, files });
}
plan.runners = manifest;
// plan 갱신 후 다시 직렬화해야 manifest가 담긴다.
outputs[0] = { absolute: planPath, expected: `${JSON.stringify(plan, null, 2)}\n` };

// ── 제품 부품 러너 · 계획 ──────────────────────────────────────────────────────
// 보드와 같은 렌더러로 부품 variant(빈 컴포넌트) 안을 채운다. 계획의 `setName` 은 표면 원장의 제품 세트 어휘가 된다(DS-D-0071).
const partRunners = [];
for (const part of parts) {
  const slimSpec = slim(part.spec);
  const { head, chunks } = splitSpec(slimSpec);
  if (chunks.length > 0) fail(`부품이 한 조각에 들어가지 않습니다: ${part.set} ${part.variant}`);
  const slug = `${part.set.replace(/^Product\//, "")} ${part.variant}`.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  const name = `figma/product-parts.${slug}.00.draw.js`;
  const payload = { route: `part:${part.set} ${part.variant}`, context: part.context, frameId: part.componentId, frameSize: part.frameSize, colour, head,
    ...(part.label ? { label: part.label } : {}) };
  const draw =
    `// Generated by scripts/build-figma-app-screens.mjs. Do not edit by hand.\n` +
    `// 제품 부품 ${part.set} · ${part.variant} ← ${part.route} @ ${part.context} ${part.path}\n` +
    `const P=${payloadLiteral(payload)};\n${template}`;
  if (Buffer.byteLength(draw) > RUNNER_BYTES) fail(`부품 러너가 ${RUNNER_BYTES} 바이트를 넘었습니다: ${name}`);
  outputs.push({ absolute: resolve(repoRoot, name), expected: draw });
  partRunners.push({ set: part.set, variant: part.variant, componentId: part.componentId, file: name });
}
const partsPlan = {
  $comment: "Generated by scripts/build-figma-app-screens.mjs (PARTS). Do not edit by hand.",
  $why: "보드 안의 제품 전용 컨트롤을 측정 서브트리 그대로 제품 컴포넌트 variant 로 찍고, 보드는 같은 서브트리를 그 인스턴스로 쓴다(DS-D-0071).",
  productCommit: fixture.productCommit,
  sectionName: PART_SECTION,
  sets: PARTS.map((part) => ({
    setName: part.set,
    about: part.about,
    variants: parts.filter((entry) => entry.set === part.set).map((entry) => ({
      variant: entry.variant, route: entry.route, context: entry.context, path: entry.path, componentId: entry.componentId,
      frameSize: entry.frameSize, signature: entry.signature, instances: entry.instances, stats: entry.stats,
      runner: partRunners.find((runner) => runner.set === entry.set && runner.variant === entry.variant).file,
    })),
    boardInstances: contentInstances[part.set] ?? 0,
  })),
};
outputs.push({ absolute: partsPlanPath, expected: `${JSON.stringify(partsPlan, null, 2)}\n` });

// **더 이상 내지 않는 런너는 지운다.** 조각 수는 spec이 바뀌면 줄어드는데, 남은 옛 파일은
// `--check`가 잡지 못한다(검사는 "내야 할 것"만 본다). 실측 사고: 셸을 인스턴스로 바꿔 조각이
// 7→6으로 줄자 `settings.desktop.06`이 남았고, 그게 05와 같은 path를 들고 있어 중복처럼 보였다.
const wanted = new Set(outputs.map((output) => output.absolute));
const orphans = readdirSync(resolve(repoRoot, "figma"))
  .filter((name) => /^(app-screens|product-parts)\..+\.\d\d\.draw\.js$/.test(name))
  .map((name) => resolve(repoRoot, "figma", name))
  .filter((absolute) => !wanted.has(absolute));

if (checkOnly) {
  for (const output of outputs) {
    let current = "";
    try { current = readFileSync(output.absolute, "utf8"); }
    catch { fail(`생성물이 없습니다: ${output.absolute.slice(repoRoot.length + 1)}`); }
    if (current !== output.expected) fail(`생성물이 다릅니다: ${output.absolute.slice(repoRoot.length + 1)}`);
  }
  for (const orphan of orphans) fail(`더 이상 생성하지 않는 런너가 남아 있습니다: ${orphan.slice(repoRoot.length + 1)}`);
} else {
  atomicWriteBatch(outputs);
  for (const orphan of orphans) rmSync(orphan);
}

console.log(
  `[figma-app-screens] ${checkOnly ? "checked" : "built"} @ ${fixture.productCommit.slice(0, 8)}: ` +
  `${screens.length} screens · 부품 ${parts.length} · ${totalNodes} nodes · UNRESOLVED ${totalUnresolved} · 인스턴스 ${totalShells}(공백 ${totalShellGaps}) · 아이콘 ${totalGlyphs} · 자산 이미지 ${totalImageInstances} · 늘어난 grid 행 ${totalGridRows} · 크기 조합 풀이 ${totalSizingReconciled}(못 푼 HUG·FILL ${totalUnresolvedFillInHug}) · auto 여백 가운데 ${totalAutoMarginCentred} · margin 감싸개 ${totalMarginWrapped} · 번짐 올림 ${totalBleedHoisted}(못 옮김 ${totalBleedUnresolved}) · 음수 간격 묶음 ${totalGapsPaired}(못 묶음 ${totalGapsUnresolved}) · HUG space-between ${totalSpaceBetweenHug} · 면 ${paintStats.fills}+${paintStats.gradients}g/${paintStats.strokes}/${paintStats.radii}/${paintStats.shadows} · 텍스트 ${paintStats.textStyled}/${paintStats.texts} 스타일 매칭 · 런너 ${SCREENS.length}개`,
);
