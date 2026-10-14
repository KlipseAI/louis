#!/usr/bin/env node
import { createHash } from "node:crypto";
import { inflateRawSync } from "node:zlib";
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
  treeLookOf,
} from "./lib/figma-component-substitution.mjs";
import { glyphBySignature, PRODUCT_GLYPHS } from "./lib/figma-glyph-identity.mjs";
import { COLOR_COLLECTION, PRIMITIVE_COLLECTION, RENDERER_LIB, THEME_MODE, liveVariables } from "./lib/figma-live-variables.mjs";
import { normalizeAuthFixtureTree, toFigmaTreeSpec } from "./lib/figma-tree-spec.mjs";
import { figmaTextValue } from "./lib/locale-text-pairing.mjs";
import { loadArea } from "./lib/state-recipes.mjs";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const fixturePath = resolve(repoRoot, "migration/product.auth-fixture.json");
// **낱개 정본 프리미티브 치환의 두 증거.** 어느 쪽도 여기 상수로 베끼지 않는다 —
// 제품이 무는 레시피는 제품 원장이, LOUIS 의 size·variant 축은 되읽기가 소유한다.
const recipesPath = resolve(repoRoot, "migration/product.rendered-components.json");
const readbackPath = resolve(repoRoot, "figma/readback.json");
// **LOUIS 예시 실행(`--louis-examples`, 2026-10-07).** 같은 변환 · 같은 렌더러로 LOUIS 문서 예시(`migration/louis.document-examples.json`)를
// Figma 레이어로 생성한다 — 제품 화면 보드 통계(보드 수 · 커버리지 · 기준선)와 섞이지 않게 화면 · 부품 · 계획 · 러너 · 기준선을 따로 둔다.
const LOUIS_EXAMPLES = process.argv.includes("--louis-examples");
const RUNNER_PREFIX = LOUIS_EXAMPLES ? "louis-document" : "app-screens";
const PART_RUNNER_PREFIX = LOUIS_EXAMPLES ? "louis-document-parts" : "product-parts";
const planPath = resolve(repoRoot, `figma/${RUNNER_PREFIX}.plan.json`);
const partsPlanPath = resolve(repoRoot, `figma/${PART_RUNNER_PREFIX}.plan.json`);
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
  // 공개 시드 원장(2026-10-07, `--public-seeded`) — 발행된 한 행이 있어야 서는 공개 상세(블로그 글 · 템플릿)를 자리표시 시드로 잰다.
  publicSeeded: optionalFixture("migration/product.public-seeded-fixture.json"),
  // 덱 세션 원장(2026-10-14, `--session-deck`) — 세션 서버에 가짜 S3(자리표시 교안 판)를 붙여 잰 Klipse Deck 화면.
  sessionDeck: optionalFixture("migration/product.session-deck-fixture.json"),
  // LOUIS 문서 예시(2026-10-07, 측정기 `--louis-examples`) — 예시 실행에서만 쓴다.
  louisExamples: LOUIS_EXAMPLES ? optionalFixture("migration/louis.document-examples.json") : null,
};
// **상태 레시피 원장(2026-10-08, 상태 레시피 설계서 3절).** 측정기 `--states=<영역>` 이 쓴 `migration/product-states/<영역>.json` 을 훑어
// `states:<영역>` 원장으로 싣는다. 그 원장의 보드는 영역 파일(`migration/measure-states/<영역>.json`) 레시피의 `board` 가 정한다(아래
// STATE_RECIPE_SCREENS) — 영역 작업이 이 파일의 보드 목록을 건드리지 않게. 원장 폴더가 없으면 아무것도 싣지 않아 출력이 종전과 같다.
const statesLedgerDir = resolve(repoRoot, "migration/product-states");
if (!LOUIS_EXAMPLES && existsSync(statesLedgerDir)) {
  // 보드 레시피가 없는 영역의 원장은 싣지 않는다(2026-10-08 밤) — 그릴 것이 없는데 커밋 대조에는 걸려, 다른 작업이 옛 앵커로 잰 채
  // 작업 트리에 둔 원장(하이라이트 · 분석 · 랜딩) 하나가 앵커 이동의 보드 생성을 통째로 막았다. 보드가 생기면 그때부터 대조한다.
  for (const name of readdirSync(statesLedgerDir).filter((entry) => entry.endsWith(".json")).sort()) {
    const area = name.slice(0, -".json".length);
    if (!loadArea(area).recipes.some((recipe) => recipe.board)) continue;
    LEDGERS[`states:${area}`] = JSON.parse(readFileSync(resolve(statesLedgerDir, name), "utf8"));
  }
}
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
  // 2026-10-15 — 랜딩 「/」 의 남은 그림(조립 규칙 15조의 21). 히어로 영상의 포스터 · 개요 캔버스 노드의 사진 · 끝 장면의 하늘 첫 칸은 측정기가
  // src 로 싣는다(영상은 poster). 하이라이트 격자 25칸과 모바일 숏폼 포스터는 `background-image: url(…)` 라 attachBackgroundImages 가 잇는다.
  // 제품 public 원본을 같은 섹션(U · image/)에 원본 픽셀 크기의 이미지 채움 컴포넌트로 올렸다(webp 는 Figma 에서 빈 회색이라 PNG 로 변환).
  "/landing-hero/v4/poster.webp": "image/landing/hero-poster",
  "/images/landing/node-showcase-sofa.webp": "image/landing/node-showcase-sofa",
  "/landing-ending/v1/sky-start.webp": "image/landing/ending-sky-start",
  "/landing-highlight/v1/short.webp": "image/landing/highlight-short",
  // 컴포지션 장면 판의 영상 포스터 — 로캘마다 다른 녹화라 보드 로캘(en)의 것만 올렸다.
  "/landing-composition/v3/en/poster.webp": "image/landing/composition-poster-en",
  ...Object.fromEntries([1, 2, 3, 4, 5].flatMap((row) => [1, 2, 3, 4, 5].map((column) =>
    [`/landing-highlight/v1/cells/r${row}c${column}.webp`, `image/landing/highlight-cell-r${row}c${column}`]))),
  // 2026-10-07 — LOUIS 문서 예시(packages/css/examples)의 그림 넷. 브랜드 표식은 예시에 data URL 로 들어 있어 해시 키(imageKeyOf)로 잇는다.
  "data-sha256:14c4cecb59a81ede": "image/louis-examples/brand-mark",
  "/examples/media/login-product-mobile.webp": "image/louis-examples/login-product-mobile",
  "/examples/media/login-board-mobile.webp": "image/louis-examples/login-board-mobile",
  "/examples/media/data-deletion-board-crop.webp": "image/louis-examples/data-deletion-board-crop",
  // 2026-10-07 — 공개 시드 측정(템플릿 · 블로그 상세)의 자리표시 미디어. 제품 public 원본(600×900)을 같은 섹션에 이미지 채움 컴포넌트로 올렸다.
  "/image-edit/examples/example-1.jpg": "image/examples/example-1",
  "/image-edit/examples/example-2.jpg": "image/examples/example-2",
  "/image-edit/examples/example-3.jpg": "image/examples/example-3",
  "/image-edit/examples/example-4.jpg": "image/examples/example-4",
  "/image-edit/examples/example-5.jpg": "image/examples/example-5",
  // 2026-10-14 — 공개 시드의 랜딩 모델 카드(모델 목록 · 상세) 미디어. `next/image` 가 받는 측정용 CDN 호스트 밑에 같은 예시 그림 경로를 붙였다
  // (`lib/fixture-seeds.mjs` landing_models 주석) — 측정기가 적는 원본 주소가 이 꼴이다.
  ...Object.fromEntries([1, 2, 3, 4, 5].map((n) => [`https://cdn.fixture.invalid/image-edit/examples/example-${n}.jpg`, `image/examples/example-${n}`])),
  // 2026-10-14 — 덱 세션 측정(`--session-deck`)의 교안 표지(`/deck/thumbs/<덱>.png`). 가짜 S3 가 표지 객체를 내주지 않아 측정에서는 빈 상자다 —
  // 자리표시 교안(`lib/fixture-seeds.mjs` FIXTURE_DECK_S3_OBJECTS)의 덱 여덟을 같은 예시 그림에 돌려 잇는다(표지 내용은 제품 것이 아니다).
  ...Object.fromEntries(["fixture-course-1", "fixture-course-2", "fixture-course-3", "fixture-deck-ko", "fixture-deck-en", "fixture-deck-ja", "fixture-member-deck", "fixture-presenter-deck"]
    .map((slug, index) => [`/deck/thumbs/${slug}.png`, `image/examples/example-${(index % 5) + 1}`])),
};
const liveAssets = JSON.parse(readFileSync(resolve(repoRoot, "figma/live-assets.json"), "utf8"));
const imageComponentBySrc = new Map(Object.entries(IMAGE_COMPONENTS).map(([src, name]) => {
  const hits = Object.values(liveAssets.components ?? {}).filter((entry) => entry.name === name || entry.name.startsWith(`${name} (`));
  if (hits.length !== 1) fail(`자산 이미지 ${src} 의 컴포넌트 «${name}» 가 figma/live-assets.json 에 ${hits.length}개입니다 — 하나여야 합니다`);
  return [src, { id: hits[0].id, name: hits[0].name }];
}));
// **data URL 그림은 해시로 잇는다(2026-10-07).** 측정기는 같은 출처가 아닌 src 를 origin + pathname 으로 적어 data URL 이 통째로
// 원장에 남는다(LOUIS 문서 예시의 브랜드 표식). 그 문자열의 sha256 앞 16자를 키로 쓴다 — 그림이 바뀌면 키도 바뀌어 대응이 끊긴다.
const imageKeyOf = (src) => (/^(null|data:)/.test(src) ? `data-sha256:${createHash("sha256").update(src).digest("hex").slice(0, 16)}` : src);
// **mask 아이콘(2026-10-07).** 제품 아이콘 다수는 `<span>` 의 `mask-image: url("/icons/X.svg")` + `background-color`(= currentColor)로
// 그려진다. 측정 트리에는 바탕색 상자만 남아, 보드가 그 자리를 색 네모로 그렸다(하이라이트 완료 「Download all」 · 구독 결제 · 요금의
// CheckCircle 등 보드 116곳과 부품 안, 캡처로 확인). public/icons 원본은 `90 · 자산` 에 `icon/<파일 이름>` 컴포넌트로 있으므로 그 인스턴스로
// 바꾸고(`im`), 렌더러가 인스턴스 안의 면 · 획을 그 자리의 바탕색으로 덮는다(`mt`) — mask 는 모양만 주고 색은 바탕이 준다.
// 자식이 있는 자리 · 셸 안 · `/icons/` 와 public 루트 밖 원본은 건드리지 않고 감사본에 남긴다.
// 같은 이름이 둘이면(`DS · Icons` 의 DS 아이콘과 `90 · 자산` 「C · icon/」 의 제품 원본 — `icon/text`) mask 원본인 「C · icon/」 섹션을
// 고른다. 예전에는 하나가 아니면 버려, 노드캔버스의 `/icons/text.svg` 자리가 색 네모로 남았다(2026-10-12).
// public 루트 원본(`/X.svg`)은 `90 · 자산` 「D · root/」 의 `root/X` 로 잇는다 — 하이라이트 표식 `/highlight_symbol.svg` 21곳이 색 네모로
// 남았다(2026-10-12). 그 섹션에 없는 이름은 예전처럼 감사본에 남는다.
const assetComponentByName = (name) => {
  let hits = Object.values(liveAssets.components ?? {}).filter((entry) => entry.name === name);
  if (hits.length > 1) hits = hits.filter((entry) => /^C · icon\//.test(entry.section ?? ""));
  return hits.length === 1 ? { id: hits[0].id, name: hits[0].name } : null;
};
const attachMaskIcons = (node, styleOf, unmapped) => {
  if (node.instance) return;
  const mask = styleOf(node.path)?.maskImage;
  const url = mask && /^url\("([^"]+)"\)$/.exec(mask)?.[1];
  if (url && !node.imageComponent) {
    const name = url.startsWith("/icons/") && url.endsWith(".svg") ? `icon/${url.slice("/icons/".length, -".svg".length)}`
      : /^\/[^/]+\.svg$/.test(url) ? `root/${url.slice(1, -".svg".length)}` : null;
    const component = name && !(node.children ?? []).length ? assetComponentByName(name) : null;
    if (component && node.paint?.fill) { node.imageComponent = component; node.maskTint = true; }
    else unmapped.push({ path: node.path, mask: url, rect: [Math.round(node.rect.width), Math.round(node.rect.height)] });
  }
  for (const child of node.children ?? []) attachMaskIcons(child, styleOf, unmapped);
};
// **칠 순서를 CSS 쌓임 순서로(2026-10-07).** Figma 는 자식 배열 순서대로 칠하고, 측정 트리는 DOM 순서다. 제품은 z-index 로 그 순서를
// 뒤집는다 — 노드캔버스 편집기에서 점 바탕(`svg`, z-index −1)이 DOM 상 노드 층(z-index 4) 뒤에 있어 보드에서 노드를 통째로 덮었고,
// 상단 바(`position: fixed`, z-index 1001)는 DOM 상 `main` 앞이라 그 바탕에 덮였다(제품 캡처 대조). 형제 사이에서 CSS 쌓임 순서
// (음수 z → 흐름 속 비위치 요소 → 위치 지정 auto/0 → 양수 z 값 순, 같으면 DOM 순서)를 따른다. **옮기는 것은 Figma 에서 ABSOLUTE 인 자식뿐이다** —
// 흐름 자식의 순서를 바꾸면 배치가 바뀐다. 흐름 자식은 제자리에 두고, ABSOLUTE 자식을 그보다 낮지 않은 마지막 형제 뒤에 넣는다.
// 쌓임 맥락을 넘나드는 비교(조상의 z 끼리)는 하지 않는다 — 형제 안에서만 견준다.
const stackKey = (style) => {
  const positioned = Boolean(style?.position) && style.position !== "static";
  const z = Number.parseInt(style?.zIndex, 10);
  if (positioned && Number.isFinite(z) && z < 0) return [0, z];
  if (!positioned) return [1, 0];
  if (!Number.isFinite(z) || z === 0) return [2, 0];
  return [3, z];
};
// 같은 층 · 같은 z 이면 DOM 순서다(세 번째 칸) — 위치 지정 auto 끼리(relative 버튼과 absolute 선택 표시)는 DOM 순서로 칠한다.
const keyLess = (a, b) => a[0] !== b[0] ? a[0] < b[0] : a[1] !== b[1] ? a[1] < b[1] : a[2] < b[2];
const orderByStacking = (node, styleOf, moved) => {
  if (node.instance || !node.children?.length) return;
  for (const child of node.children) orderByStacking(child, styleOf, moved);
  const entries = node.children.map((child, index) => ({ child, key: [...stackKey(styleOf(child.path)), index], movable: child.positioning === "ABSOLUTE" }));
  if (!entries.some((entry) => entry.movable)) return;
  const result = entries.filter((entry) => !entry.movable);
  for (const entry of entries.filter((item) => item.movable)) {
    let at = 0;
    for (let index = 0; index < result.length; index += 1) if (keyLess(result[index].key, entry.key)) at = index + 1;
    result.splice(at, 0, entry);
  }
  const reordered = result.map((entry) => entry.child);
  // 겹치지 않는 형제끼리는 칠 순서가 화면에 드러나지 않는다(앱 셸 사이드바 0~240 과 본문 240~). 순서가 뒤집히는 쌍 가운데 실제로
  // 겹치는 것이 있을 때만 바꾼다 — 보이지 않는 차이로 보드를 다시 보내지 않는다.
  const overlap = (a, b) => Math.min(a.rect.x + a.rect.width, b.rect.x + b.rect.width) - Math.max(a.rect.x, b.rect.x) > HALF_PIXEL
    && Math.min(a.rect.y + a.rect.height, b.rect.y + b.rect.height) - Math.max(a.rect.y, b.rect.y) > HALF_PIXEL;
  const domIndex = new Map(node.children.map((child, index) => [child, index]));
  const visible = reordered.some((a, i) => reordered.slice(i + 1).some((b) => domIndex.get(b) < domIndex.get(a) && overlap(a, b)));
  if (visible) {
    moved.push(node.path);
    node.children = reordered;
  }
};
// **흐름 자식이 없는 HUG 상자는 측정 크기로(2026-10-07).** Figma 의 HUG 오토레이아웃은 흐름 자식이 하나도 없으면(자식이 모두 ABSOLUTE)
// 줄어들 근거가 없어 처음 만든 크기(새 프레임 기본 100)에 머문다. 쇼츠 결과의 제목 묶음(CSS `height: 64px`, 자식은 absolute 줄 하나)이
// 100 으로 서서 본문이 36 아래로 밀렸다(제품 캡처 대조). 그런 상자는 HUG 축을 측정 크기(FIXED)로 둔다.
const fixEmptyHug = (node, fixed) => {
  if (node.instance) return;
  for (const child of node.children ?? []) fixEmptyHug(child, fixed);
  if (!node.layout || !node.children?.length || node.children.some((child) => child.positioning !== "ABSOLUTE")) return;
  for (const axis of ["layoutSizingHorizontal", "layoutSizingVertical"]) {
    if (node.sizing?.[axis] === "HUG") { node.sizing = { ...node.sizing, [axis]: "FIXED" }; fixed.push(`${node.path} ${axis}`); }
  }
};
// **비율 상자는 측정 높이로(2026-10-07).** `aspect-ratio` 상자는 높이를 자식이 아니라 폭과 비율에서 얻는다. Figma 에는 비율 상자가
// 없어 HUG 로 두면 자식(대개 FILL 미디어)에 따라 접힌다 — 노드캔버스 비디오 노드의 미리보기 영역이 접혀 노드가 짧았다(제품 캡처 대조).
// 비율 상자의 세로 HUG 를 측정 높이(FIXED)로 둔다. 폭은 그대로 부모를 따른다.
const fixAspectBoxes = (node, styleOf, fixed) => {
  if (node.instance) return;
  for (const child of node.children ?? []) fixAspectBoxes(child, styleOf, fixed);
  const ratio = styleOf(node.path)?.aspectRatio;
  if (!ratio || ratio === "auto" || !node.layout || node.sizing?.layoutSizingVertical !== "HUG") return;
  node.sizing = { ...node.sizing, layoutSizingVertical: "FIXED" };
  fixed.push(node.path);
};
// **줄어드는 세로 상자의 FILL 글자는 HUG 로(2026-10-07).** CSS 에서 폭을 내용에 맞추는(shrink-to-fit) 세로 상자는 가장 긴 글줄의 폭이
// 된다. Figma 의 HUG 세로 상자는 FILL 자식으로 폭을 정하지 못해 HUG · FIXED 자식(버튼)의 폭으로 접힌다 — 전체 오류 화면의 글 묶음이
// 267 대신 버튼 폭 104 로 서서 제목이 「문제가 발 / 생했습니다」로 꺾였다(제품 캡처 대조). 측정 폭이 HUG · FIXED 자식보다 넓을 때만,
// FILL 인 글자 잎(과 글자 하나만 감싼 margin 감싸개)을 HUG 로 바꾼다. 글자의 줄은 제품 줄대로 실려 있어 HUG 로 늘어나지 않는다.
const fixShrinkToFit = (node, fixed) => {
  if (node.instance) return;
  for (const child of node.children ?? []) fixShrinkToFit(child, fixed);
  if (node.layout?.layoutMode !== "VERTICAL" || node.sizing?.layoutSizingHorizontal !== "HUG") return;
  const flow = (node.children ?? []).filter((child) => child.positioning !== "ABSOLUTE");
  const sized = flow.filter((child) => child.sizing?.layoutSizingHorizontal !== "FILL");
  const room = node.rect.width - (node.layout.padding?.left ?? 0) - (node.layout.padding?.right ?? 0);
  const widest = Math.max(0, ...sized.map((child) => child.rect.width));
  if (room <= widest + HALF_PIXEL) return;
  // 폭 때문에 감긴 글자(명시적 줄 수보다 높다)는 HUG 로 바꾸면 한 줄로 늘어난다 — 제품 줄이 실린(\n) 글자 · 한 줄 글자만 바꾼다.
  const isTextLeaf = (child) => {
    if (!child.text || (child.children ?? []).length) return false;
    const lineHeight = child.typography?.lineHeight;
    const lines = typeof child.text === "string" ? child.text.split("\n").length : 1;
    return Boolean(lineHeight) && child.rect.height <= lineHeight * lines + lineHeight / 2;
  };
  for (const child of flow) {
    if (child.sizing?.layoutSizingHorizontal !== "FILL") continue;
    const inner = child.tag === "margin" && child.children?.length === 1 && isTextLeaf(child.children[0]) ? child.children[0] : null;
    if (!isTextLeaf(child) && !inner) continue;
    child.sizing = { ...child.sizing, layoutSizingHorizontal: "HUG" };
    if (inner) inner.sizing = { ...inner.sizing, layoutSizingHorizontal: "HUG" };
    fixed.push(child.path);
  }
};
// **text-align: center 가 가운데로 보내는 인라인 블록(2026-10-07).** 블록 상자의 `text-align: center` 는 글자뿐 아니라 인라인 블록 자식
// (버튼)도 가운데로 보낸다. 생성기는 그 정렬을 글자에만 옮겨, 전체 오류 화면의 「다시 시도」 버튼이 글 묶음 왼쪽에 붙었다(제품 캡처 대조).
// 세로 상자가 `text-align: center` 이고 교차축 정렬이 비어 있으며 인라인 블록 자식이 있으면 교차축을 CENTER 로 둔다.
const centreInlineBlocks = (node, styleOf, centred) => {
  if (node.instance) return;
  for (const child of node.children ?? []) centreInlineBlocks(child, styleOf, centred);
  if (node.layout?.layoutMode !== "VERTICAL" || node.layout.align?.counterAxis) return;
  const style = styleOf(node.path);
  if (style?.textAlign !== "center" || !/^(block|flow-root)$/.test(style.display ?? "")) return;
  const inlineBlock = (node.children ?? []).some((child) => /^inline-(block|flex|grid)$/.test(styleOf(child.path)?.display ?? "")
    && child.sizing?.layoutSizingHorizontal !== "FILL");
  if (!inlineBlock) return;
  node.layout = { ...node.layout, align: { ...node.layout.align, counterAxis: "CENTER" } };
  centred.push(node.path);
};
// **화면 높이 뿌리는 보드 높이를 따른다(2026-10-08, 조립 규칙 15조의 3).** 앱 셸은 뿌리가 `min-height: 100svh`, 그 안의 셸이
// `height: var(--app-shell-vh, 100dvh)` 처럼 뷰포트 높이 단위로 화면을 채운다. 크기 판정은 뷰포트 단위를 측정 뷰포트 상수(1080 · 874)로
// 풀어 뿌리를 세로 HUG + 최소 높이 1080, 셸을 FIXED 1080 으로 굳혔다 — 보드 높이를 1080 → 1400 으로 늘리자 아래 320 이 빈 회색으로
// 남았다(제품은 화면 높이를 채운다). 그래서 뷰포트 높이 단위를 «보드 높이»로 옮긴다:
//   1. 뿌리 — 높이 · 최소 높이 선언에 뷰포트 높이 단위가 있고 측정 높이 = 보드 높이 = 뷰포트 높이(내용이 아니라 그 단위가 높이를 정했다)면
//      세로 FILL(보드 틀은 세로 자동 배치라 FILL 이 틀 높이다). 문서 길이 페이지(측정 높이 > 뷰포트, `fullPage` 의 긴 문서)는 내용이
//      높이를 정했으므로 HUG 그대로다.
//   2. 사슬 — FILL 이 된 노드의 흐름 자식 가운데 측정 높이가 부모 안쪽 높이(패딩 · 제 margin 을 뺀)와 같고 높이 · 최소 높이 · 최대 높이
//      선언에 뷰포트 높이 단위나 `100%` 가 있는 자식을 세로 FILL 로 잇는다(세로 부모에서는 흐름 자식이 하나일 때만 — FILL 이 남는 자리를
//      다 받는다). 이미 FILL 인 자식은 판정 없이 사슬을 잇는다. 인스턴스 · 절대 배치는 잇지 않는다(절대 배치 셸은 제약이 맡는다).
//   3. 사슬 위 노드의 뷰포트 단위 최소 · 최대 높이(측정값 1080 고정)는 걷는다 — FILL 이 그 뜻을 대신하고, 남기면 보드를 줄이거나 늘릴 때
//      1080 에 묶인다.
// 측정 크기에서는 FILL 이 측정 높이와 같은 값으로 풀리므로 노드 자리 · 크기는 바뀌지 않는다.
const VIEWPORT_HEIGHT_UNIT = /(?:^|[^\w.-])[\d.]+(?:dvh|svh|lvh|vh)\b/;
const fillScreenHeight = (root, declaredOf, viewportHeight, frameHeight, filled) => {
  const viewportDeclared = (node, keys) => keys.some((key) => VIEWPORT_HEIGHT_UNIT.test(String(declaredOf(node.path)?.[key] ?? "")));
  const near = (a, b) => Math.abs(a - b) <= HALF_PIXEL;
  const release = (node) => {
    const sizing = { ...node.sizing };
    if (sizing.minHeight && viewportDeclared(node, ["min-height"])) delete sizing.minHeight;
    if (sizing.maxHeight && viewportDeclared(node, ["max-height"])) delete sizing.maxHeight;
    node.sizing = sizing;
  };
  // 뿌리의 뷰포트 폭 한계(`max-width: 100vw` — 전체 오류 화면 body)도 같은 이유로 걷는다. 측정 폭(1920 · 402)으로 풀린 상한이 남아 보드를
  // 2560 으로 넓히자 뿌리가 1920 에 멈췄다(늘림 시험 폭 추종 0.75). 뿌리는 이미 틀 폭을 채운다(FILL).
  if (!root.instance && root.sizing.layoutSizingHorizontal === "FILL") {
    const viewportWide = (key) => /(?:^|[^\w.-])[\d.]+(?:dvw|svw|lvw|vw)\b/.test(String(declaredOf(root.path)?.[key] ?? ""));
    const sizing = { ...root.sizing };
    let released = false;
    if (sizing.maxWidth && viewportWide("max-width")) { delete sizing.maxWidth; released = true; }
    if (sizing.minWidth && viewportWide("min-width")) { delete sizing.minWidth; released = true; }
    if (released) { root.sizing = sizing; filled.push(`${root.path} width`); }
  }
  if (root.instance || !near(root.rect.height, frameHeight) || !near(frameHeight, viewportHeight)) return;
  if (!viewportDeclared(root, ["height", "min-height"])) return;
  if (root.sizing.layoutSizingVertical !== "FILL") { root.sizing = { ...root.sizing, layoutSizingVertical: "FILL" }; filled.push(root.path); }
  release(root);
  const walk = (node) => {
    const mode = node.layout?.layoutMode;
    if (node.instance || (mode !== "VERTICAL" && mode !== "HORIZONTAL")) return;
    const flow = (node.children ?? []).filter((child) => child.positioning !== "ABSOLUTE");
    if (mode === "VERTICAL" && flow.length !== 1) return;
    const padding = node.layout.padding ?? {};
    for (const child of flow) {
      if (child.instance) continue;
      const room = node.rect.height - (padding.top ?? 0) - (padding.bottom ?? 0) - (child.margin?.top ?? 0) - (child.margin?.bottom ?? 0);
      if (!near(child.rect.height, room)) continue;
      if (child.sizing.layoutSizingVertical !== "FILL") {
        const declared = declaredOf(child.path) ?? {};
        const full = ["height", "min-height", "max-height"].some((key) => /^100%/.test(String(declared[key] ?? "").trim()));
        if (!full && !viewportDeclared(child, ["height", "min-height", "max-height"])) continue;
        child.sizing = { ...child.sizing, layoutSizingVertical: "FILL" };
        filled.push(child.path);
      }
      release(child);
      walk(child);
    }
  };
  walk(root);
};
// **한 점짜리 자리표시 그림은 그 색 면이다(2026-10-12 오후).** 측정 fixture 의 시드 그림(노드캔버스 이미지 노드 · 영상 노드 참조 썸네일 · 레이어 패널
// 썸네일)은 1×1 PNG data URL 이라 이어질 자산이 없어 보드가 그 자리를 비워 두었다 — 제품 캡처는 옅은 하늘색으로 차 있었다(소유자 캔버스 대조).
// `object-fit: cover` 로 칸을 채우는 한 점 그림이므로 그 화소 색의 면과 같다. 1×1 RGB · RGBA(8비트)만 푼다.
const onePixelColor = (src) => {
  // 측정기가 src 에서 페이지 origin 을 걷어 data URL 이 `nullimage/png;base64,…` 로 남는다(origin 이 「null:」 로 잡힌다) — 둘 다 받는다.
  const match = /^(?:null)?(?:data:)?image\/png;base64,(.+)$/.exec(src ?? "");
  if (!match) return null;
  const bytes = Buffer.from(match[1], "base64");
  if (bytes.readUInt32BE(16) !== 1 || bytes.readUInt32BE(20) !== 1 || bytes[24] !== 8 || ![2, 6].includes(bytes[25])) return null;
  const idat = [];
  for (let at = 8; at < bytes.length;) {
    const length = bytes.readUInt32BE(at);
    if (bytes.toString("latin1", at + 4, at + 8) === "IDAT") idat.push(bytes.subarray(at + 8, at + 8 + length));
    at += 12 + length;
  }
  // zlib 머리(2) · 꼬리 검사합(4)을 떼고 푼다 — fixture 의 한 점 PNG(fixture-seeds ONE_PIXEL_PNG)는 검사합이 틀려도 브라우저가 그린다.
  const stream = Buffer.concat(idat);
  const raw = inflateRawSync(stream.subarray(2, stream.length - 4));
  // raw[0] 은 줄 필터 — 한 점 그림은 왼쪽 · 위 이웃이 없어 어느 필터든 화소가 그대로다.
  const hex = (value) => value.toString(16).padStart(2, "0");
  const rgb = hex(raw[1]) + hex(raw[2]) + hex(raw[3]);
  return bytes[25] === 6 && raw[4] !== 255 ? rgb + hex(raw[4]) : rgb;
};
// **노드캔버스 점 격자(2026-10-12 오후).** 제품 배경은 React Flow `<Background variant=Dots gap={24} size={2}>`(CanvasBackground.tsx)의
// `<pattern>` 채움인데, 측정은 무늬를 담지 못해 보드가 바탕색 면만 그렸다(소유자 캔버스 대조). 무늬는 `90 · 자산` 「V · pattern/」 의
// `pattern/canvas-dot`(줌 1 기준 24 칸 가운데 지름 2 점, color/canvas-dot)과 같은 모양의 타일을 깔아 옮긴다(렌더러 `dg` 주석 — PATTERN 칠은 use_figma 가 받지 않는다). 줌 · 위상은 같은 화면의 React Flow
// 뷰포트 변환(`matrix(z, 0, 0, z, tx, ty)`)에서 얻는다 — @xyflow/react BackgroundComponent 가 점 중심을 x = (tx mod G) − G/2 − 1 + s/2 + kG
// (G = 24z, s = 2z) 에 둔다. 렌더러는 그 위상에 맞춘 무늬 사각형을 배경 틀(잘림) 안에 G 만큼 넉넉히 깐다.
const CANVAS_DOT_GAP = 24; // CanvasBackground.tsx DEFAULT_CANVAS_DOT_GAP
const CANVAS_DOT_SIZE = 2; // CanvasBackground.tsx DEFAULT_CANVAS_DOT_SIZE
const attachDotGrid = (spec, measuredTree, styleOf) => {
  const grids = [];
  const walk = (node) => { if (node.glyphId === "canvas-dot-grid-background") grids.push(node); for (const child of node.children ?? []) walk(child); };
  walk(spec);
  for (const grid of grids) {
    const scope = grid.path.split(".").slice(0, -1).join(".");
    const viewport = measuredTree
      .filter((node) => node.path.startsWith(`${scope}.`))
      .map((node) => /^matrix\(([-\d.e]+), 0, 0, ([-\d.e]+), ([-\d.e]+), ([-\d.e]+)\)$/.exec(styleOf(node.path)?.transform ?? ""))
      .find((match) => match && match[1] === match[2]);
    if (!viewport) fail(`점 격자 ${grid.path} 의 React Flow 뷰포트 변환을 찾지 못했습니다 — 측정 원장에 matrix(z, 0, 0, z, tx, ty) 가 있어야 합니다`);
    const [zoom, tx, ty] = [Number(viewport[1]), Number(viewport[3]), Number(viewport[4])];
    const gap = CANVAS_DOT_GAP * zoom, half = (CANVAS_DOT_SIZE * zoom) / 2;
    const phase = (t) => (((t % gap) + gap) % gap) - gap / 2 - 1 + half; // 점 중심의 위상
    grid.dotGrid = { zoom, centerX: phase(tx), centerY: phase(ty) };
  }
};
// spec 을 돌며 이어진 `<img>` 에 컴포넌트를 붙인다. 이어지지 않은 src 는 plan 감사본에 남긴다.
const attachImageComponents = (node, unmapped) => {
  // `<video>` 의 src 는 측정기가 실은 포스터다(조립 규칙 15조의 21) — 같은 표로 잇는다.
  if ((node.tag === "img" || node.tag === "video") && node.src) {
    const component = imageComponentBySrc.get(imageKeyOf(node.src));
    const pixel = component ? null : onePixelColor(node.src);
    if (component) node.imageComponent = component;
    else if (pixel) node.paint = { ...(node.paint ?? { gradient: null, stroke: null, radius: null, shadow: null, opacity: null }), fill: pixel };
    else unmapped.push({ path: node.path, src: imageKeyOf(node.src), rect: [Math.round(node.rect.width), Math.round(node.rect.height)] });
  }
  for (const child of node.children ?? []) attachImageComponents(child, unmapped);
};
// **바탕 그림(조립 규칙 15조의 21, 2026-10-15).** 제품이 그림을 `<img>` 가 아니라 `background-image: url(…)` 로 그리는 자리(랜딩 하이라이트
// 격자 25칸 · 모바일 숏폼 포스터)는 측정 트리에 바탕 없는 상자만 남아 보드가 빈 칸으로 그렸다. 바탕이 **url 한 겹**이고 그 url 이
// IMAGE_COMPONENTS 에 이어져 있을 때만 잇는다 — 자식이 없으면 그 상자가 곧 인스턴스가 되고, 자식이 있으면 바탕은 모든 자식 아래에
// 칠해지므로 맨 앞 자식으로 두 축 STRETCH ABSOLUTE 인스턴스를 끼운다(15조의 13 과 같은 제약). `background-size: cover` 와 컴포넌트의
// 이미지 채움(FILL)은 둘 다 가운데를 채우며 자른다. 그라디언트와 겹친 바탕 · 이어지지 않은 url 은 건드리지 않고 감사본에 남긴다.
// 쌓임 순서 정렬 «뒤에» 돈다 — 끼운 자식에는 측정 스타일이 없다.
const attachBackgroundImages = (node, styleOf, unmapped) => {
  if (node.instance || node.imageComponent) return;
  const background = styleOf(node.path)?.backgroundImage;
  const url = background && /^url\("([^"]+)"\)$/.exec(background)?.[1];
  if (url) {
    const component = imageComponentBySrc.get(imageKeyOf(url));
    if (!component) unmapped.push({ path: node.path, background: url, rect: [Math.round(node.rect.width), Math.round(node.rect.height)] });
    else if (!(node.children ?? []).length) node.imageComponent = component;
    else {
      const why = { verdict: "FIXED", reason: "바탕 그림 — 부모를 두 축으로 채우는 ABSOLUTE 인스턴스(조립 규칙 15조의 21)", source: "100%", value: null };
      node.children = [{
        path: `${node.path}.bg`,
        tag: "img",
        rect: { ...node.rect },
        positioning: "ABSOLUTE",
        offset: { x: 0, y: 0 },
        constraints: { horizontal: "STRETCH", vertical: "STRETCH" },
        sizing: { layoutSizingHorizontal: "FIXED", layoutSizingVertical: "FIXED", layoutPositioning: "ABSOLUTE" },
        why: { horizontal: why, vertical: why },
        margin: { top: 0, right: 0, bottom: 0, left: 0 },
        layout: null,
        paint: null,
        imageComponent: component,
        children: [],
      }, ...node.children];
    }
  }
  for (const child of node.children ?? []) if (!child.path.endsWith(".bg")) attachBackgroundImages(child, styleOf, unmapped);
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

// 상태 레시피 보드 — 원장이 있는 영역의 레시피 가운데 `board` 를 적은 것. 데스크톱 전용 레시피(`contexts`)는 `board.desktop` 만 적고,
// 아래 화면 루프는 보드가 없는 뷰포트를 건너뛴다. 원장에 그 레시피가 아직 없으면(재지 않음) 다른 원장 화면처럼 싣지 않는다.
const STATE_BOARD_CONTEXTS = { desktop: "desktop-1920x1080", mobile: "mobile-402x874" };
const STATE_RECIPE_SCREENS = Object.keys(LEDGERS).filter((key) => key.startsWith("states:")).flatMap((key) =>
  loadArea(key.slice("states:".length)).recipes
    .filter((recipe) => recipe.board)
    // baseRoute — 셸 치환(사이드바 활성 항목 표)은 상태 키가 아니라 그 상태가 선 기준 화면으로 찾는다.
    .map((recipe) => ({ route: recipe.id, baseRoute: recipe.baseKey, ...recipe.board, fixture: key }))
    .filter((screen) => Object.entries(STATE_BOARD_CONTEXTS)
      .every(([board, contextId]) => !screen[board] || LEDGERS[key].screens?.[contextId]?.[screen.route])));

// LOUIS(OlYKERKOkgbxBEEoXGZW2c)의 대상 프레임. 라이브에서 읽어 확인한 install id다.
// 별칭 route(`/mypage`→`/settings`, `/explore`→`/archive`, `/checkout`→`/upgrade`)는 제외한다 —
// 같은 화면을 두 번 그리게 된다.
const PRODUCT_SCREENS = [
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
  // 전체 오류 화면(2026-10-07) — 측정기가 저장소가 막힌 브라우저를 흉내 내 루트 경계를 세운다(measure-product-auth-fixture `blockStorage`).
  { route: "global-error", desktop: "37:33", mobile: "37:41", fixture: "anonymous" },
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
  // `/subscription/coupons`(보드 2076:3371 · 2076:3372)는 통합 판(2026-10-08, DS-D-0079)에서 뺀다 — 넘기기만 하는 옛 주소가 되어
  // `/subscription?tab=group` 으로 **리다이렉트되어** 구독 허브가 재진다(redirected: true, 위 `/analytics/instagram` 과 같은 이유).
  // 결제 화면 `/subscription/group-purchase` 는 원장 라우트에 없다 — 측정기가 그 주소를 재면 보드를 그쪽으로 옮긴다. Figma 보드는 그대로 둔다.
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
    // 쿠폰 인쇄(2026-10-07) — 가짜 Supabase 의 자리표시 시드(`lib/fixture-seeds.mjs` — 캠페인 하나 · 코드 10장 · 묶음 둘)로 연 화면. 글자는
    // 자리표시이고 크기 · 색 · 간격은 잰 값이다. 데스크톱은 옛 손 조립 보드(721×345) 자리, 모바일은 같은 섹션 §20 자리에 새로 세웠다.
    { route: "/admin/coupons/[id]/print", desktop: "224:3393", mobile: "2682:175", fixture: "session" },
    // 노드캔버스 편집기(2026-10-07) — 프로젝트 한 행 · 캔버스 문서(노드 셋 · 엣지 둘) 자리표시 시드로 연 화면. 옛 손 조립 보드 자리다.
    { route: "/nodecanvas?project=", desktop: "38:3", mobile: "38:3843", fixture: "session" },
    // 편집기(2026-10-07) — 소스 둘 · 클립 둘 자리표시 시드. 미리보기 영상은 검은 면(바깥 주소)이다. 옛 손 조립 보드 자리다.
    { route: "/videoeditor/[projectId]", desktop: "39:3", mobile: "39:1520", fixture: "session" },
    // 하이라이트 완료 격자(2026-10-07) — 클립 다섯 자리표시 시드. 카드 영상은 검은 면 · 비율 4:3(CSS 기본값)이다. 옛 손 조립 보드 자리다.
    { route: "/highlight/[projectId] completed", desktop: "220:3452", mobile: "220:3759", fixture: "session" },
    { route: "/highlight/[projectId]/shorts/[shortId]", desktop: "221:3234", mobile: "221:3504", fixture: "session" },
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
  // **공개 시드 원장 화면(2026-10-07).** 블로그 글 · 템플릿 상세 — 가짜 Supabase 의 자리표시 시드(`lib/fixture-seeds.mjs` fixturePublicSeeds)로
  // 연 로그아웃 화면. 옛 손 조립 보드와 같은 상태(블로그 커버 · 부제 있음, 템플릿 미디어 5장)다. 글자는 자리표시, 크기 · 색 · 간격은 잰 값이다.
  ...(LEDGERS.publicSeeded ? [
    { route: "/blog/[slug]", desktop: "216:2824", mobile: "216:2940", fixture: "publicSeeded" },
    { route: "/templates/[slug]", desktop: "217:2868", mobile: "217:2978", fixture: "publicSeeded" },
    // 모델 목록 · 상세(2026-10-14) — 랜딩 모델 카드 10장 자리표시 시드(배너 · 한 줄 소개 · 결과 영상 검은 면 · 다른 모델). 사양 · 크레딧은 제품 코드
    // 상수다. 01 · 공개 의 ⚠ 미등록 섹션(3471:9265)에 새로 세운 프레임이다.
    { route: "/models", desktop: "3471:9267", mobile: "3471:9268", fixture: "publicSeeded" },
    { route: "/models/[slug]", desktop: "3471:9269", mobile: "3471:9270", fixture: "publicSeeded" },
  ].filter((screen) => LEDGERS.publicSeeded.screens?.["desktop-1920x1080"]?.[screen.route]) : []),
  ...STATE_RECIPE_SCREENS,
];
// LOUIS 문서 예시 보드 — `DS · Templates` 의 「Pattern · Document — 문서 스킬」 보드 안 프레임(2026-10-07).
const LOUIS_EXAMPLE_SCREENS = [
  { route: "document-report", desktop: "2723:534", mobile: "2723:535", fixture: "louisExamples" },
  { route: "document", desktop: "2723:542", mobile: "2723:543", fixture: "louisExamples" },
];
const SCREENS = LOUIS_EXAMPLES ? LOUIS_EXAMPLE_SCREENS : PRODUCT_SCREENS;
// 예시 실행의 기준선 — 제품 기준선과 따로 잠근다(수와 사유는 생성기가 처음 낸 값을 보고 적는다).
// 문서 부품은 예시 document-report 의 데스크톱 · 모바일에 하나씩 선다(콜아웃은 기본 · 주의 둘). 운영안(document)은 글자가 달라 인스턴스가 아니다.
const LOUIS_EXAMPLE_CONTENT_INSTANCES = {
  "Document/Head": 2,
  "Document/Decision": 2,
  "Document/Toc": 2,
  "Document/Flow": 2,
  "Document/Card Grid": 2,
  "Document/Stat Grid": 2,
  "Document/Stack Card": 2,
  "Document/Bars Card": 2,
  "Document/Trend Card": 2,
  "Document/Table": 2,
  "Document/Compare": 2,
  "Document/Codeblock": 2,
  "Document/Callout": 4,
  "Document/Shot": 2,
  "Document/Timeline": 2,
  "Document/Quote": 2,
  "Document/Sources": 2,
};
const LOUIS_EXAMPLE_UNRESOLVED_FILL_IN_HUG = {};

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
// **통합 판 앵커(2026-10-08, DS-D-0079) — 요금제 선물 화면이 원장에서 사라졌다.** `/subscription/coupons` 는 이제 넘기기만 하는 옛 주소다
// (제품 76b6cf15 app/subscription/coupons/page.tsx — `plan` 이 없으면 `/subscription?tab=group`, 있으면 `/subscription/group-purchase`).
// 측정기는 그 주소를 그대로 열어 구독 허브(단체 구매 탭 · 오류 상태)를 재고, 결제 화면 `/subscription/group-purchase` 는 원장 라우트에 없다.
// 그래서 요금제 선택 카드(`Product/Gift Plan Option` 넷 × 두 뷰포트 — 옛 자리 body.1.0.0.1.0.1.1.1.1.0 ~ 3)와 수량 스테퍼
// (`Product/Quantity Stepper` 두 뷰포트 — 옛 자리 body.1.0.0.1.0.1.1.2.1.1)를 찍을 서브트리가 없어 세트 항목을 잠시 뺀다. 같은 컨트롤이
// 다른 측정 화면에도 없다(세션 `/mypage/upgrade/checkout` 은 gift 모드가 아니다). 측정기가 `/subscription/group-purchase` 를 재면 그 원장에서
// 자리를 찾아 되살린다 — Figma 세트(2086:5881 ~ 5888 · 5890 · 5891)는 그대로 둔다. 옛 항목은 git 기록(이 줄 앞 커밋)에 있다.
// 세션 원장 `/nodecanvas?project=` 의 노드 카드 층(React Flow 노드 셋 — .0 텍스트 · .1 이미지 · .2 비디오).
const NODE_CANVAS = "body.1.0.0.0.7.0.0.0.0.0.0.0.2";
const PRODUCT_PARTS = [
  // **둘째 묶음(2026-09-26 저녁) — 보드 구성 원장의 「미보유」 18 을 0 으로.** 셋 다 LOUIS 컨트롤 사다리에 앉지 않는 제품 전용 자리다.
  // 통합 판(2026-10-08): `Product/Analytics Connect Button`(옛 자리 `/analytics/youtube` body.1.0.0.1.0.0.2.0.3)을 뺐다 — 제품이 지역 알약
  // (`CONNECT_NOTICE_BTN`)을 걷고 LOUIS Button(`inverse` · `lg`)으로 바꿔(76b6cf15 components/scenes/YoutubeAnalyticsScene.tsx 358행 주석)
  // 같은 버튼(지금 자리 .1.0.3)이 LOUIS 정본 Button 인스턴스로 치환된다(부품 뿌리가 다른 세트로 치환 — 제품 전용 자리가 아니다).
  // Figma 세트(2101:5880 · 5881)는 그대로 둔다.
  // 앵커 54b62a8a(2026-10-08 밤): `Product/Highlight Theme Chips`(옛 자리 `/highlight/[projectId]?__phase=upload` body.1.0.0.1.0.1.0.1.2.1)을 뺐다 —
  // 하이라이트 새 화면 갈래가 업로드 단계를 스튜디오 판으로 바꾸고 테마 칩 줄과 그 스타일을 걷었다(제품 52fc0f268 · db90c09bf — `themeChips` 0건).
  // Figma 세트(2101:5883 · 5884)는 그대로 둔다.
  {
    // 모바일 쿠폰 화면에는 결제 패널이 측정 화면 안에 없었다 — 세트는 데스크톱 variant 하나다.
    // 통합 판(2026-10-08): 요금제 선물 화면(`/subscription/coupons` body.1.0.0.1.0.1.1.2.5.1.1)이 원장에서 사라져(위 PRODUCT_PARTS 머리 주석)
    // 같은 패널을 쓰는 세션 원장 결제 진행(`/mypage/upgrade/checkout?plan=pro`) 데스크톱에서 찍는다 — 글자 서열이 옛 자리와 같다.
    set: "Product/Checkout Agreement",
    about: "요금제 선물 결제 패널의 약관 동의 상자(app/mypage/upgrade/TossPaymentWindowPanel.tsx CHECKOUT_AGREEMENT_BOX). 체크박스는 LOUIS .louis-checkbox 를 제품이 16px · gap 10 으로 덮는다(같은 파일 147-155행 주석 — LOUIS 기본 20 · gap 8).",
    variants: [
      ["Viewport=Desktop", "desktop-1920x1080", "body.1.0.0.1.0.0.1.0.3.1.1", [
        "I agree to the terms below and to automatic subscription renewal with the registered card.",
        "Your card will only be used for subscription payments and automatic renewals.",
        "Payment service terms", "Privacy collection consent", "Third-party data sharing consent",
      ], "2101:5886"],
    ].map(([variant, context, path, anchor, component]) => ({ variant, route: "/mypage/upgrade/checkout", context, path, fixture: "session", anchor, component })),
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
  // **다섯째 묶음(2026-10-07) — 편집기 밖 필요 부품 조사(scratchpad 「parts41-survey」)에서 측정 서브트리가 바로 선 것.** 공개 화면 푸터는
  // 랜딩 · 문의 · 요금 · 블로그 · 템플릿이 같은 컴포넌트를 쓰고 측정도 노드 81 · 글자 서열이 같다 — 공개 원장(`fixture: "public"`)에서 뜬다.
  {
    set: "Product/Landing Footer",
    about: "공개 화면 공용 타임라인 푸터(components/landing/sections/TimelineFooter.tsx — 문구 · 시간 눈금 · 링크 묶음 넷을 트랙으로 · 사업자 정보 · 저작권 줄, 늘 다크). 폰(720 아래)은 트랙 이름이 아이콘만 남는다.",
    // 통합 판(2026-10-08): 푸터가 공용 타임라인 푸터로 바뀌어(문구 · 눈금 타임코드 · 링크 · 회사 정보, 데스크톱 노드 124 · 모바일 89) 글자 서열이
    // 길어져(데스크톱 서명 62) 앵커를 `{ length, fnv }` 로 준다. 트랙 아이콘 넷은 figma-glyph-identity 의 footer-track-* 이다. variant 는 같은 푸터가
    // 같은 경로(body.1.0.0.3)에 선 `/inquiry` 에서 찍는다(랜딩 · 문의 · 요금 · 템플릿 · 블로그 · 공개 시드 둘이 같은 글자 서열). 되살림(2026-10-08):
    // 공개 `/` 가 한때 오류 경계로 재져 푸터가 없었다가 다시 재자 랜딩 데스크톱 푸터도 이 세트의 인스턴스가 됐다(CONTENT_INSTANCES_BY_SET).
    variants: [
      ["Viewport=Desktop", "desktop-1920x1080", { length: 62, fnv: "f262472e" }, "2677:4185"],
      // 모바일(2677:4186)은 한때 뺐다가 되살렸다(2026-10-08) — 사업자 정보 줄(flex-wrap ul)에서 주소 칸(body.1.0.0.3.2.0.3 li, 362×36)이
      // 혼자 한 줄을 차지해 줄 폭까지 줄어들며 두 줄로 감기는데, 크기 조합 풀이(reconcileFigmaSizing)가 그 꼴을 풀지 못해 부품이 멈췄다.
      // 「감기는 줄에서 혼자 한 줄을 차지한 감긴 글자」 규칙(조립 규칙 28조)이 푼다 — 첫 판(2026-10-08)은 측정 폭 FIXED 였고 늘림 시험 360 에서
      // 넘쳐, 2026-10-09 부터 그 자리에서 줄을 끊고 글자는 줄 폭 FILL 이다(splitWrapRowsAtLoneText). 모바일 글자 서열은
      // 트랙 이름이 아이콘만 남아 데스크톱보다 짧다(23).
      ["Viewport=Mobile", "mobile-402x874", { length: 23, fnv: "98743518" }, "2677:4186"],
    ].map(([variant, context, anchor, component]) => ({ variant, route: "/inquiry", context, path: "body.1.0.0.3", fixture: "public", anchor, component })),
  },
  {
    set: "Product/Page Header",
    about: "앱 허브 머리(components/ui/PageHeader.tsx — .louis-section-header data-level=page · 제목 + 설명). 노드캔버스 · 하이라이트 허브도 같은 머리를 쓰지만 카드 · 기록이 있을 때만 그린다 — 측정은 /videoeditor 다.",
    variants: [
      ["Viewport=Desktop", "desktop-1920x1080", "2683:4185"],
      ["Viewport=Mobile", "mobile-402x874", "2683:4186"],
    ].map(([variant, context, component]) => ({
      variant, route: "/videoeditor", context, path: "body.1.0.0.1.0.1.0", fixture: "session", component,
      anchor: ["Composition", "Chain your finished generations together — cut them down in Composition, and add subtitles or images."],
    })),
  },
  {
    set: "Product/Admin Section Header",
    about: "어드민 머리(app/admin/AdminSection.tsx AdminSectionHeader — level=page · 제목 · 메타 · 오른쪽 아이콘 동작). 측정은 /admin 유저 관리 탭(시드 사용자 한 명 — 2026-10-15 프로필 시드부터, 전에는 빈 목록 「0 users」)이다. section · label 단계와 설명 칸은 측정되지 않은 탭 · 모달에만 있다.",
    // 통합 판(2026-10-08): 어드민 글자가 영어가 되고(「유저 관리」 → 「Users」) 필터 칩 · 정렬 · 새로고침 막대가 머리 밖의 검색 · 필터 줄로 갈라졌다.
    // 머리는 제목 · 메타 · 새로고침 아이콘 버튼(inlineActions)만 남아 옛 자리 body.1.0.0.1.0.0.0.1.1 이 아니라 그 형 .1.0 이다.
    variants: [
      ["Viewport=Desktop", "desktop-1920x1080", "2683:4188"],
      ["Viewport=Mobile", "mobile-402x874", "2683:4189"],
    ].map(([variant, context, component]) => ({
      variant, route: "/admin", context, path: "body.1.0.0.1.0.0.0.1.0", fixture: "session", component,
      anchor: ["Users", "1 users"],
    })),
  },
  {
    set: "Product/Select Dropdown",
    about: "선택 칸(components/scenes/create/CustomDropdown.tsx — 버튼 · 값 · 꺾쇠, 닫힌 상태). Field 는 문의 양식의 48 칸, Admin 은 어드민 선택(AdminSelect) 40 칸이다. 아이콘만 있는 칸(AWS 가입 언어 선택)은 글자가 없어 서명으로 묶지 않는다.",
    variants: [
      ["Trigger=Field, Viewport=Desktop", "desktop-1920x1080", "/inquiry", "body.1.0.0.2.0.0.1.1.0.0.0.1", "public", ["Bug report"], "2683:4191"],
      ["Trigger=Field, Viewport=Mobile", "mobile-402x874", "/inquiry", "body.1.0.0.2.0.0.1.1.0.0.0.1", "public", ["Bug report"], "2683:4192"],
      ["Trigger=Admin, Viewport=Desktop", "desktop-1920x1080", "/creative-media-admin", "body.1.0.0.0.2.1.0.0.1.1.2.1", "session", ["nano-banana-2"], "2683:4193"],
      ["Trigger=Admin, Viewport=Mobile", "mobile-402x874", "/creative-media-admin", "body.1.0.0.0.2.1.0.0.1.1.2.1", "session", ["nano-banana-2"], "2683:4194"],
    ].map(([variant, context, route, path, fixture, anchor, component]) => ({ variant, route, context, path, fixture, anchor, component })),
  },
  {
    // 글자 서열이 수백 개라 앵커를 글자 수 · FNV 로 준다. 모바일은 가로 스크롤 안에서 보이는 열만 잰다(데스크톱 241 · 모바일 159).
    set: "Product/Plan Comparison Table",
    about: "요금제 비교표(components/landing/sections/PricingSection.tsx PlanComparisonTable — 제목 · 가로 스크롤 · 요금제 열마다 머리 · 분류 · 기능 행). /pricing 과 /mypage/upgrade 가 같은 컴포넌트를 쓴다 — 측정은 /pricing 이다.",
    variants: [
      // 통합 판(2026-10-08): 경로는 같고 앵커만 다시 적었다 — 데스크톱 241 → 239. 원장의 날글자(ownText) · 태그 구성은 옛 판과 같다(239 · 756 노드).
      ["Viewport=Desktop", "desktop-1920x1080", { length: 239, fnv: "c3545fea" }, "2683:4196"],
      // 모바일 159 → 157(날글자 157 · 495 노드 — 옛 판과 같다).
      ["Viewport=Mobile", "mobile-402x874", { length: 157, fnv: "e9258b89" }, "2683:4197"],
    ].map(([variant, context, anchor, component]) => ({ variant, route: "/pricing", context, path: "body.1.0.0.2.0.0.4", fixture: "public", anchor, component })),
  },
  // **2026-10-08 — 통합 판(DS-D-0079) 원장에서 세운 제품 세트 다섯.** 「필요」 표면(부품 · 한자리)을 측정 서브트리로 찍는다 — 화면 종류는 보드 몫이라 넣지 않는다.
  {
    // 글자가 없다(aria-label 뿐) — 컴포넌트는 채우지만 보드의 같은 자리는 묶이지 않는다(매처가 글자 없는 노드를 보지 않는다, CONTENT_INSTANCES_BY_SET 0).
    set: "Product/Theme Cycle Button",
    about: "랜딩 GNB 우측 테마 순환 버튼(ThemeSelector.tsx. LanguageSelector 의 TRIGGER_COMPACT·ICON_COMPACT 기하를 그대로 써서 높이 32, 좌우 8, 폭 36, 면 투명, 글리프 20, stroke 1.5). 통합 판에서는 GNB 구조가 바뀌어 액션 열이 body.1.0.0.1.0.3 이 되었다. 순서는 .3.0 언어 버튼 래퍼, .3.1 테마 버튼, .3.2 Get started(모바일은 .3.3 햄버거)다. / 가 오류 화면으로 재져서 아침 조사의 / body.1.0.0.1.0.2.1 은 무효이고, 같은 GNB 가 붙은 /pricing 으로 바꿨다. aria-label 「Theme: Light」로 확인했다. 측정에는 현재 preference(light)의 글리프 하나만 담겨 있다.",
    variants: [
      { variant: "Viewport=Desktop", route: "/pricing", context: "desktop-1920x1080", path: "body.1.0.0.1.0.3.1", fixture: "public", anchor: [], component: "2888:4193" },
      { variant: "Viewport=Mobile", route: "/pricing", context: "mobile-402x874", path: "body.1.0.0.1.0.3.1", fixture: "public", anchor: [], component: "2888:4194" },
    ],
  },
  {
    set: "Product/Template Result Carousel",
    about: "템플릿 상세의 3D 커버플로 캐러셀(components/templates/TemplateResultCarousel.tsx. perspective 스테이지 .3.0, 원형 nav ‹ › 와 도트 줄 .3.1(40 높이)). public-seeded 원장에만 그려져 있고, 통합 판에서도 경로가 아침 조사와 같다. 데스크톱 스테이지는 860x540(노드 19), 모바일은 370x440(노드 15)이다. 카드 좌하단 라벨 배지는 측정 항목에 label 이 없어 그려지지 않았다.",
    variants: [
      { variant: "Viewport=Desktop", route: "/templates/[slug]", context: "desktop-1920x1080", path: "body.1.0.0.2.0.0.3", fixture: "publicSeeded", anchor: ["‹", "›"], component: "2888:4196" },
      { variant: "Viewport=Mobile", route: "/templates/[slug]", context: "mobile-402x874", path: "body.1.0.0.2.0.0.3", fixture: "publicSeeded", anchor: ["‹", "›"], component: "2888:4197" },
    ],
  },
  {
    set: "Product/Article Header",
    about: "블로그 상세의 아티클 머리 조판(app/blog/[slug]/page.tsx ARTICLE_HEAD_CLASS. h1 heading-36 제목, p body-20 부제, 밑줄 메타 행 div 50 높이의 날짜). public-seeded 원장에 있고, 통합 판에서도 경로가 아침 조사와 같다. 뒤로가기 링크(← 블로그, 51.84x21)는 형제 body.1.0.0.2.0.0.0 이라 이 서브트리 밖이다. 부모 body.1.0.0.2.0.0 은 MarkdownContent 본문(데스크톱 760x1607)까지 잡아 너무 크다. 표면 reason 의 커버와 구분선은 측정에 없다. app/templates/[slug] 의 header(body.1.0.0.2.0.0.1, 860x131.59)가 같은 상수 벌을 복제하므로 수렴 후보다.",
    variants: [
      { variant: "Viewport=Desktop", route: "/blog/[slug]", context: "desktop-1920x1080", path: "body.1.0.0.2.0.0.1", fixture: "publicSeeded", anchor: ["Fixture post title", "A one-line placeholder excerpt for the fixture post.", "2026년 1월 1일"], component: "2888:4199" },
      { variant: "Viewport=Mobile", route: "/blog/[slug]", context: "mobile-402x874", path: "body.1.0.0.2.0.0.1", fixture: "publicSeeded", anchor: ["Fixture post title", "A one-line placeholder excerpt for the fixture post.", "2026년 1월 1일"], component: "2888:4200" },
    ],
  },
  {
    set: "Product/Attachment Dropzone",
    about: "문의 폼 본문의 작성 그룹 겸 드롭존이다(InquiryClient.tsx 183행 COMPOSE_GROUP = louis-text-field__box flex-col, 625행에서 dragOver 일 때 COMPOSE_BORDER_DRAG 를 더하고 636행 onDrop). 안에 textarea 200 높이, 첨부 툴바(Attach images 버튼, 0 / 5 카운터)가 있다. 카테고리 칩은 louis-tabs, 토스트는 Toast 로 이미 접혔으니 컨트롤 하나만 남는다. public 원장 /inquiry, 경로는 아침 조사와 같다. 측정은 idle 상태뿐이다. dragover 테두리와 썸네일 줄(images>0)은 원장에 없다. 앵커는 textarea 자리표시 · 「Attach images」 · 「0 / 5」 셋, 노드 11. 카운터 「0 / 5」 는 측정마다 바뀌는 글자가 아니다(첨부 0 장의 고정 상태).",
    variants: [
      { variant: "Viewport=Desktop", route: "/inquiry", context: "desktop-1920x1080", path: "body.1.0.0.2.0.0.1.1.0.2.1", fixture: "public", anchor: ["Please describe your issue in detail", "Attach images", "0 / 5"], component: "2888:4202" },
      { variant: "Viewport=Mobile", route: "/inquiry", context: "mobile-402x874", path: "body.1.0.0.2.0.0.1.1.0.2.1", fixture: "public", anchor: ["Please describe your issue in detail", "Attach images", "0 / 5"], component: "2888:4203" },
    ],
  },
  {
    // 글자가 없다(img 둘) — 테마 순환 버튼과 같이 컴포넌트만 채우고 보드는 묶이지 않는다.
    set: "Product/Admin Wordmark Logo",
    about: "Gnb admin 변형의 브랜드 행이다(components/navigation/Gnb.tsx 2321행 function GnbWordmarkLogo, 2367행 /klipse-admin-wordmark-black.svg). 24x28 심볼 클립 span 안에 klipse-light.svg(96x28)가 있고, 계산된 갭 뒤에 admin 워드마크 img(78x28)가 이어진다. session /admin 데스크톱 사이드바에서 재졌고 경로는 아침과 같다. 모바일 /admin(노드 56)은 사이드바가 닫힌 드로어라 이 노드가 없어 데스크톱 하나다. 글자가 없어 앵커는 [] 다. 글자 서열 서명으로는 보드의 같은 서브트리를 묶을 수 없으니 구조 서명이나 수동 component 지정이 필요하다(Select Dropdown 의 아이콘만 있는 칸과 같은 사정). reason 대로 LOUIS SidebarBrand 에 Brand=klipse|admin 축을 더하는 대안도 있다.",
    variants: [
      { variant: "Viewport=Desktop", route: "/admin", context: "desktop-1920x1080", path: "body.1.0.0.0.0.0.0.0.0.0", fixture: "session", anchor: [], component: "2888:4205" },
    ],
  },
  // **2026-10-08 — 인증 두 세트(통합 판 로그아웃 원장 `product.anonymous-fixture.json`).** 인증 화면 여섯이 같은 플로팅 라벨 입력 상자를 각자 다시
  // 적는다(INPUT_BOX_TOP · INPUT_BOX_BOTTOM · INPUT_BOX). 칸 하나가 부품이다 — 위 칸(위만 곡률 12 · mb −1), 아래 칸(아래만 12), 단칸(네 모서리 12) ×
  // 포커스(autoFocus — 라벨이 떠 12px · 테두리 40% + 안쪽 링) / 쉼(라벨 16px · 테두리 12%). 글자 하나(라벨)로는 위 칸 · 단칸이 갈리지 않아
  // 매처가 뿌리 모양(`look`)으로 가린다(figma-component-substitution matchContent). 원장에 없는 조합(아래 칸 포커스)은 세우지 않았다.
  {
    set: "Product/Auth Floating Field",
    // 글자 하나라 설정 · 약관 본문의 「Email」 칸, 남색으로 덮은 AWS 가입 칸에도 붙었다 — 서브트리 모양까지 같을 때만 맞춘다(treeLookOf).
    strictLook: true,
    about: "인증 화면의 플로팅 라벨 입력 칸(app/(auth-brand)/login · signup · reset-password 의 INPUT_BOX_TOP/BOTTOM · INPUT_BOX — 데스크톱 400×58 · 모바일 370×55). 지우기 · 비밀번호 표시 버튼은 값이 있을 때만 서서 측정에 없다.",
    variants: [
      ["Shape=Top, State=Focused", "/login", "body.1.0.0.1.0.2.0.0", ["Email"], "2889:4193", "2889:4194"],
      ["Shape=Bottom, State=Idle", "/login", "body.1.0.0.1.0.2.0.1", ["Password"], "2889:4195", "2889:4196"],
      ["Shape=Single, State=Focused", "/signup", "body.1.0.0.1.0.2.0", ["Username"], "2889:4197", "2889:4198"],
      ["Shape=Single, State=Idle", "/reset-password", "body.1.0.0.1.0.2.0.0", ["Email"], "2889:4199", "2889:4200"],
      ["Shape=Top, State=Idle", "/signup", "body.1.0.0.1.0.2.2.0", ["Password"], "2889:4201", "2889:4202"],
    ].flatMap(([axes, route, path, anchor, desktop, mobile]) => [["Desktop", "desktop-1920x1080", desktop], ["Mobile", "mobile-402x874", mobile]]
      .map(([viewport, context, component]) => ({ variant: `${axes}, Viewport=${viewport}`, route, context, path, fixture: "anonymous", anchor, component }))),
  },
  {
    set: "Product/Signup Legal Agreements",
    // AWS 가입(/aws/signup)이 같은 글자의 블록을 남색 리터럴로 복제한다 — 뿌리에 칠이 없어 서브트리 모양으로 가린다(treeLookOf).
    strictLook: true,
    about: "회원가입 폼의 약관 동의 두 줄(app/(auth-brand)/signup LEGAL_AGREEMENTS — 줄마다 체크박스 면 · 동의 문구 · ghost 「View」). 측정은 둘 다 해제 상태다.",
    variants: [
      ["Viewport=Desktop", "desktop-1920x1080", "2889:4204"],
      ["Viewport=Mobile", "mobile-402x874", "2889:4205"],
    ].map(([variant, context, component]) => ({ variant, route: "/signup", context, path: "body.1.0.0.1.0.2.4", fixture: "anonymous", component,
      anchor: ["I agree to the Privacy Policy (required)", "View", "I agree to the Terms of Service (required)", "View"] })),
  },
  // **2026-10-08(저녁) — 오류 경계에서 돌아온 세션 화면의 제품 세트.** 노드캔버스 프로젝트(`/nodecanvas?project=`) · 편집기(`/videoeditor/[projectId]`)를
  // 다시 재자(e82574a7) 아침에 막혀 있던 「필요」 표면(부품 · 한자리)이 측정 서브트리로 섰다. 화면 종류(kind screen — 레이어 패널 · 에셋 패널 ·
  // 쇼츠 결과 · 랜딩 히어로 · 후기 밴드)는 보드 몫이라 넣지 않는다.
  // **캔버스 안 부품은 데스크톱 하나다.** 캔버스가 화면에 맞춰 줌을 잡아 데스크톱은 0.815 배(카드 326 폭 · 버튼 26.09), 모바일은 0.19 배(카드 76 폭 ·
  // 글자 4px 안팎)로 재졌다. 모바일 variant 는 읽을 수 없는 축소판을 부품으로 굳히는 셈이라 세우지 않는다 — 모바일 보드의 카드는 측정한 노드 그대로다.
  // 캔버스 밖 크롬(프로젝트 머리 · 툴바)은 줌을 타지 않아 두 뷰포트를 세운다. 카드 세트가 보드의 카드를 통째로 인스턴스로 바꾸므로 카드 안 부품
  // (연결 버튼 · 머리 동작 · 생성 · 복사 · 제목 · 이미지 줄 · LLM 결과)은 보드 인스턴스가 0 이다 — 부품은 부품을 품지 않는다(PARTS 변환).
  {
    // 줌 비율 트리거는 한때 세우지 못했다 — 버튼이 글자(「82%」)와 캐럿 svg 를 함께 들어, 트리 변환이 떼어낸 글자 상자에 버튼 상자(36 높이 ·
    // 패딩 포함 폭)를 주자 2.57 줄로 감긴 글자로 읽혀 부품이 멈췄다. 떼어낸 글자를 익명 flex 항목의 상자(이웃 사이 폭 · 줄 높이)로 잡는
    // 규칙(figma-tree-spec flexRowTextRect)이 푼다(2026-10-08). 글자 「82%」는 캔버스가 화면에 맞춘 줌(0.815)이다.
    set: "Product/Canvas Zoom Trigger",
    about: "캔버스 우하단 줌 · 보기 옵션 트리거(node-canvas-v2/components/CanvasZoomControl.tsx — 반투명 알약 · 줌 비율 · 캐럿, 높이 36 · 곡률 16 · 배경 흐림). 측정은 메뉴가 닫힌 상태이고 비율은 캔버스가 화면에 맞춘 줌이다. 줌을 타지 않는 크롬이지만 모바일 캔버스에는 이 컨트롤이 없어 데스크톱 하나다.",
    variants: [{ variant: "Viewport=Desktop", route: "/nodecanvas?project=", context: "desktop-1920x1080", path: "body.1.0.0.0.7.0.0.3.0", fixture: "session", anchor: ["82%"], component: "2979:3679" }],
  },
  {
    set: "Product/Canvas Text Node",
    about: "캔버스 텍스트 노드 카드(node-canvas-v2/nodes/TextNode.tsx — 머리 · 생성된 프롬프트 결과 · 요청 프롬프트 셸 · 좌우 연결 버튼). 측정은 생성이 끝난 LLM 프롬프트 모드이고 캔버스 줌 0.815 배다.",
    variants: [{ variant: "Viewport=Desktop", route: "/nodecanvas?project=", context: "desktop-1920x1080", path: `${NODE_CANVAS}.0`, fixture: "session", anchor: ["AI image prompt", "Placeholder generated prompt paragraph.", "39 chars", "29 chars", "Placeholder request sentence.", "Image", "Video", "Regenerate"], component: "2949:3617" }],
  },
  {
    set: "Product/Canvas Image Node",
    about: "캔버스 이미지 노드 카드(node-canvas-v2/nodes/ImageNode.tsx — 머리 · 결과 이미지 · 연결된 프롬프트 상태 · 모델 · 비율 · 품질 · Regenerate). 측정은 생성이 끝난 상태이고 캔버스 줌 0.815 배다.",
    variants: [{ variant: "Viewport=Desktop", route: "/nodecanvas?project=", context: "desktop-1920x1080", path: `${NODE_CANVAS}.1`, fixture: "session", anchor: ["Image", "AI image prompt connected", "GPT Image 2.5 Flare", "1:1", "High", "Regenerate"], component: "2949:3619" }],
  },
  {
    set: "Product/Canvas Video Node",
    about: "캔버스 비디오 노드 카드(node-canvas-v2/nodes/VideoNode.tsx — 머리 · 빈 결과 자리 · 연결 이미지 줄 · 프롬프트 · 모델 · 길이 · 비율 · 해상도 · 생성 알약). 측정은 생성 전 상태이고 캔버스 줌 0.815 배다.",
    variants: [{ variant: "Viewport=Desktop", route: "/nodecanvas?project=", context: "desktop-1920x1080", path: `${NODE_CANVAS}.2`, fixture: "session", anchor: ["Video", "Your generated video will appear here.", "0 chars", "Describe the video you want to create.", "Seedance 2.0 Mini", "8s", "9:16", "1080p", "2250"], component: "2949:3621" }],
  },
  // **2026-10-14 — 나머지 노드 카드 다섯.** 세션 원장의 두 번째 노드캔버스 프로젝트(`/nodecanvas?project= more-nodes`, 시드 `lib/fixture-seeds.mjs`
  // FIXTURE_CANVAS_MORE_PROJECT_ID)에서 찍는다 — 첫 프로젝트에 노드를 더하면 맞춤 줌이 바뀌어 위 세트 · 보드가 모두 흔들린다. 노드 층의 자리는
  // 첫 프로젝트와 같다(NODE_CANVAS). 윗줄 TTS · 사운드 · 편집, 아랫줄 YouTube · Instagram 두 줄이라 맞춤 줌은 0.775 배(카드 310 폭)다.
  // 이 화면은 보드를 세우지 않아(PRODUCT_SCREENS 에 없다) 보드 인스턴스가 0 이다. 모바일 variant 는 위 카드 셋과 같은 사정으로 세우지 않는다.
  {
    set: "Product/Canvas TTS Node",
    about: "캔버스 TTS 노드 카드(node-canvas-v2/nodes/TtsNode.tsx — 머리 · 대본 입력 · 음성 · 속도 · 볼륨 · 생성 단추 · 좌우 연결 버튼). 측정은 생성 전 상태이고 캔버스 줌 0.775 배다.",
    variants: [{ variant: "Viewport=Desktop", route: "/nodecanvas?project= more-nodes", context: "desktop-1920x1080", path: `${NODE_CANVAS}.0`, fixture: "session", anchor: ["TTS", "31 / 5,000 chars", "Placeholder narration sentence.", "Achernar (Chirp3 HD)", "1x", "100%"], component: "3418:3681" }],
  },
  {
    set: "Product/Canvas BGM Node",
    about: "캔버스 사운드(BGM) 노드 카드(node-canvas-v2/nodes/BgmNode.tsx — 머리 · 음악 · 효과음 · 업로드 탭 · 프롬프트 · 보컬 · 길이 · 볼륨 · 생성 단추 · 좌우 연결 버튼). 측정은 음악 탭의 생성 전 상태이고 캔버스 줌 0.775 배다.",
    variants: [{ variant: "Viewport=Desktop", route: "/nodecanvas?project= more-nodes", context: "desktop-1920x1080", path: `${NODE_CANVAS}.1`, fixture: "session", anchor: ["Sound", "Music", "SFX", "Upload", "23 / 2,000 chars", "Placeholder music mood.", "Instrumental", "30s", "100%", "120"], component: "3418:3683" }],
  },
  {
    set: "Product/Canvas Edit Node",
    about: "캔버스 편집(Composition) 노드 카드(node-canvas-v2/nodes/EditNode.tsx — 머리 · 빈 상태 안내 · 입력 연결 버튼 셋). 측정은 연결된 영상이 없는 상태이고 캔버스 줌 0.775 배다.",
    variants: [{ variant: "Viewport=Desktop", route: "/nodecanvas?project= more-nodes", context: "desktop-1920x1080", path: `${NODE_CANVAS}.2`, fixture: "session", anchor: ["Composition", "Connect video nodes to start editing.", "No videos connected. Connect completed video nodes to edit."], component: "3418:3685" }],
  },
  {
    set: "Product/Canvas YouTube Node",
    about: "캔버스 YouTube 업로드 노드 카드(node-canvas-v2/nodes/YoutubeNode.tsx — 머리 · 제목 · 설명 · 태그 · 업로드 시점 · 업로드 단추 · 입력 연결 버튼). 측정은 계정을 잇지 않은 상태이고 캔버스 줌 0.775 배다.",
    variants: [{ variant: "Viewport=Desktop", route: "/nodecanvas?project= more-nodes", context: "desktop-1920x1080", path: `${NODE_CANVAS}.3`, fixture: "session", anchor: ["YouTube", "Placeholder video title", "Placeholder video description.", "Type a tag and press Enter", "Upload immediately", "Upload"], component: "3418:3687" }],
  },
  {
    set: "Product/Canvas Instagram Node",
    about: "캔버스 Instagram 업로드 노드 카드(node-canvas-v2/nodes/InstagramNode.tsx — 머리 · 캡션 · 게시 단추 · 입력 연결 버튼). 측정은 계정을 잇지 않은 상태이고 캔버스 줌 0.775 배다.",
    variants: [{ variant: "Viewport=Desktop", route: "/nodecanvas?project= more-nodes", context: "desktop-1920x1080", path: `${NODE_CANVAS}.4`, fixture: "session", anchor: ["Instagram", "Caption", "Placeholder caption sentence.", "Post to Instagram"], component: "3418:3689" }],
  },
  {
    set: "Product/Project Header",
    about: "캔버스 상단 프로젝트 머리(scenes/create/ProjectHeader.tsx — 진행형 블러 띠 · 뒤로 · 구분선 · 프로젝트 이름 · 저장 · 프로필). 줌을 타지 않는 크롬이라 두 뷰포트다.",
    variants: [
      { variant: "Viewport=Desktop", route: "/nodecanvas?project=", context: "desktop-1920x1080", path: "body.1.0.0.0.0", fixture: "session", anchor: ["Fixture canvas project"], component: "2949:3623" },
      { variant: "Viewport=Mobile", route: "/nodecanvas?project=", context: "mobile-402x874", path: "body.1.0.0.0.0", fixture: "session", anchor: ["Fixture canvas project"], component: "2949:3624" },
    ],
  },
  {
    // 글자가 없다(aria-label 뿐) — 컴포넌트만 채우고 보드는 묶이지 않는다(테마 순환 버튼과 같은 사정).
    set: "Product/Node Target Button",
    about: "노드 좌우의 채널 연결 버튼(node-canvas-v2/nodes/NodeSideButtons.tsx TargetButton). Input 은 텍스트 노드 왼쪽의 잠긴 입력(생성 뒤 수정 불가), Output 은 오른쪽 출력 핸들이다. 캔버스 줌 0.815 배.",
    variants: [
      { variant: "Side=Input, Viewport=Desktop", route: "/nodecanvas?project=", context: "desktop-1920x1080", path: `${NODE_CANVAS}.0.0.1.0.2.0.0`, fixture: "session", anchor: [], component: "2949:3626" },
      { variant: "Side=Output, Viewport=Desktop", route: "/nodecanvas?project=", context: "desktop-1920x1080", path: `${NODE_CANVAS}.0.0.1.0.3.0`, fixture: "session", anchor: [], component: "2949:3627" },
    ],
  },
  {
    // 글자가 없다(aria-label 뿐) — 보드는 묶이지 않는다.
    set: "Product/Canvas Toolbar",
    about: "캔버스 하단 플로팅 툴바 알약(node-canvas-v2/components/Toolbar.tsx — 이동 · 손 도구 · 구분선 · 노드 추가 여섯 · 도움말). 줌을 타지 않는 크롬이라 두 뷰포트다.",
    variants: [
      { variant: "Viewport=Desktop", route: "/nodecanvas?project=", context: "desktop-1920x1080", path: "body.1.0.0.0.7.0.0.2", fixture: "session", anchor: [], component: "2949:3629" },
      { variant: "Viewport=Mobile", route: "/nodecanvas?project=", context: "mobile-402x874", path: "body.1.0.0.0.7.0.0.2", fixture: "session", anchor: [], component: "2949:3630" },
    ],
  },
  {
    // 글자가 없다 — 보드는 묶이지 않는다.
    set: "Product/Node Header Actions",
    about: "노드 머리 우측 아이콘 버튼 묶음(node-canvas-v2/components/NodeHeaderActions.tsx — 도움말 · 다운로드 · 삭제). 결과가 있는 이미지 · 비디오 노드는 셋, 텍스트 노드는 다운로드가 없어 둘이다. 캔버스 줌 0.815 배.",
    variants: [
      { variant: "Buttons=3, Viewport=Desktop", route: "/nodecanvas?project=", context: "desktop-1920x1080", path: `${NODE_CANVAS}.1.0.0.1.0`, fixture: "session", anchor: [], component: "2949:3632" },
      { variant: "Buttons=2, Viewport=Desktop", route: "/nodecanvas?project=", context: "desktop-1920x1080", path: `${NODE_CANVAS}.0.0.0.1.0`, fixture: "session", anchor: [], component: "2949:3633" },
    ],
  },
  {
    set: "Product/Node Generate Button",
    about: "노드 프롬프트의 생성 알약(node-canvas-v2/components/NodePromptGenerateButton.tsx — 그라디언트 면 · 별 아이콘 · 크레딧). Generate 는 생성 전 비디오 노드(크레딧 후행), Regenerate 는 생성이 끝난 텍스트 · 이미지 노드다. 캔버스 줌 0.815 배.",
    variants: [
      { variant: "State=Generate, Viewport=Desktop", route: "/nodecanvas?project=", context: "desktop-1920x1080", path: `${NODE_CANVAS}.2.0.1.0.5.0.0.3.0.1.0.0`, fixture: "session", anchor: ["2250"], component: "2949:3635" },
      { variant: "State=Regenerate, Viewport=Desktop", route: "/nodecanvas?project=", context: "desktop-1920x1080", path: `${NODE_CANVAS}.0.0.1.0.5.0.0.2.1.0`, fixture: "session", anchor: ["Regenerate"], component: "2949:3636" },
    ],
  },
  {
    // 글자가 없다 — 보드는 묶이지 않는다.
    set: "Product/Node Prompt Copy Button",
    about: "프롬프트 입력 복사 버튼(node-canvas-v2/components/NodePromptInputCopyButton.tsx — 정사각 · 복사 글리프, 성공 뒤 체크로 바뀐다). 측정은 쉼 상태다. 캔버스 줌 0.815 배.",
    variants: [{ variant: "Viewport=Desktop", route: "/nodecanvas?project=", context: "desktop-1920x1080", path: `${NODE_CANVAS}.0.0.1.0.4.0.0.1.0`, fixture: "session", anchor: [], component: "2949:3638" }],
  },
  {
    set: "Product/Node Title Label",
    about: "노드 제목(node-canvas-v2/components/NodeTitleEditableLabel.tsx — 타입 글리프 · 말줄임 제목, 더블클릭하면 같은 자리에서 입력으로 바뀐다). 측정은 텍스트 노드의 읽기 상태다. 캔버스 줌 0.815 배.",
    variants: [{ variant: "Viewport=Desktop", route: "/nodecanvas?project=", context: "desktop-1920x1080", path: `${NODE_CANVAS}.0.0.0.0`, fixture: "session", anchor: ["AI image prompt"], component: "2949:3640" }],
  },
  {
    // 글자가 없다(img 뿐) — 보드는 묶이지 않는다.
    set: "Product/Prompt Image Strip",
    about: "프롬프트에 연결된 입력 이미지 썸네일 줄(node-canvas-v2/components/PromptLinkedImageStrip.tsx — 정사각 썸네일 · 가로 스크롤). 측정은 비디오 노드의 연결 이미지 하나다. 캔버스 줌 0.815 배.",
    variants: [{ variant: "Viewport=Desktop", route: "/nodecanvas?project=", context: "desktop-1920x1080", path: `${NODE_CANVAS}.2.0.1.0.5.0.0.0`, fixture: "session", anchor: [], component: "2949:3642" }],
  },
  {
    set: "Product/LLM Response Area",
    about: "텍스트 노드의 LLM 결과 영역(node-canvas-v2/nodes/TextNode.tsx LlmResponseArea — 생성된 프롬프트 편집 칸 · 복사 · 글자 수). 측정은 결과가 있는 갈래이고 생성 중 · 오류 · 변형 비교 갈래는 원장에 없다. 캔버스 줌 0.815 배.",
    variants: [{ variant: "Viewport=Desktop", route: "/nodecanvas?project=", context: "desktop-1920x1080", path: `${NODE_CANVAS}.0.0.1.0.4`, fixture: "session", anchor: ["Placeholder generated prompt paragraph.", "39 chars"], component: "2949:3644" }],
  },
  {
    set: "Product/Mobile Timeline",
    about: "편집기 모바일 타임라인(node-canvas-v2/nodes/videoEditParts/MobileTimeline.tsx — 가운데 고정 재생헤드 · 흐르는 트랙 · 클립 필름 줄 · 길이 배지). 데스크톱은 다른 타임라인이라 모바일 하나다.",
    variants: [{ variant: "Viewport=Mobile", route: "/videoeditor/[projectId]", context: "mobile-402x874", path: "body.1.0.0.2.0.1.0.0.1.0.0.4.1.0.2.0", fixture: "session", anchor: ["5.0s"], component: "2949:3646" }],
  },
  {
    // 글자가 없다(눈금만) — 보드는 묶이지 않는다.
    set: "Product/Sequence Ruler",
    about: "편집기 데스크톱 타임라인 눈금자(node-canvas-v2/nodes/videoEditParts/sequenceRuler.tsx PremiereSequenceRuler — ppRuler · ppRulerFace 의 보조 · 중간 눈금). 모바일은 다른 타임라인(Mobile Timeline)이라 데스크톱 하나다.",
    variants: [{ variant: "Viewport=Desktop", route: "/videoeditor/[projectId]", context: "desktop-1920x1080", path: "body.1.0.0.2.0.1.0.0.1.0.0.4.1.0.2.1.0.0.0.1.1", fixture: "session", anchor: [], component: "2949:3648" }],
  },
];
// LOUIS 문서 부품(2026-10-07) — 예시 `document-report` 의 측정 서브트리에서 찍는다. 세트는 문서 스킬 보드의 부품 카탈로그 열에 있다.
// 경로는 원장에 클래스가 없어 같은 뷰포트 · 같은 글꼴로 예시를 다시 열고 부품 클래스의 상자와 같은 상자의 노드로 짚었다(데스크톱 · 모바일 같은 경로).
// 앵커(글자 서열의 `{ length, fnv }`)는 아래 표가 갖는다 — 비어 있으면 생성기가 전부 계산해 모아 보여 주고 멈춘다(손으로 옮겨 적지 않는다).
const LOUIS_DOC_ANCHORS = {
  "Document/Head Viewport=Desktop": { length: 5, fnv: "d664aeac" },
  "Document/Head Viewport=Mobile": { length: 5, fnv: "d664aeac" },
  "Document/Decision Viewport=Desktop": { length: 10, fnv: "ad659c15" },
  "Document/Decision Viewport=Mobile": { length: 10, fnv: "ad659c15" },
  "Document/Toc Viewport=Desktop": { length: 15, fnv: "de0339b4" },
  "Document/Toc Viewport=Mobile": { length: 15, fnv: "de0339b4" },
  "Document/Flow Viewport=Desktop": { length: 5, fnv: "cecbe88b" },
  "Document/Flow Viewport=Mobile": { length: 5, fnv: "cecbe88b" },
  "Document/Card Grid Viewport=Desktop": { length: 9, fnv: "2d5d6bcf" },
  "Document/Card Grid Viewport=Mobile": { length: 9, fnv: "2d5d6bcf" },
  "Document/Stat Grid Viewport=Desktop": { length: 14, fnv: "4e11f1a9" },
  "Document/Stat Grid Viewport=Mobile": { length: 14, fnv: "4e11f1a9" },
  "Document/Stack Card Viewport=Desktop": { length: 5, fnv: "3b49ff05" },
  "Document/Stack Card Viewport=Mobile": { length: 5, fnv: "3b49ff05" },
  "Document/Bars Card Viewport=Desktop": { length: 6, fnv: "23398b89" },
  "Document/Bars Card Viewport=Mobile": { length: 6, fnv: "23398b89" },
  "Document/Trend Card Viewport=Desktop": { length: 2, fnv: "55b1bf21" },
  "Document/Trend Card Viewport=Mobile": { length: 2, fnv: "55b1bf21" },
  "Document/Table Viewport=Desktop": { length: 40, fnv: "8b95064d" },
  "Document/Table Viewport=Mobile": { length: 40, fnv: "8b95064d" },
  "Document/Compare Viewport=Desktop": { length: 2, fnv: "284c8921" },
  "Document/Compare Viewport=Mobile": { length: 2, fnv: "284c8921" },
  "Document/Codeblock Viewport=Desktop": { length: 1, fnv: "effb3ba0" },
  "Document/Codeblock Viewport=Mobile": { length: 1, fnv: "effb3ba0" },
  "Document/Callout Tone=Default, Viewport=Desktop": { length: 2, fnv: "bccb34a9" },
  "Document/Callout Tone=Default, Viewport=Mobile": { length: 2, fnv: "bccb34a9" },
  "Document/Callout Tone=Caution, Viewport=Desktop": { length: 2, fnv: "394fd6d9" },
  "Document/Callout Tone=Caution, Viewport=Mobile": { length: 2, fnv: "394fd6d9" },
  "Document/Shot Viewport=Desktop": { length: 2, fnv: "fbe78d48" },
  "Document/Shot Viewport=Mobile": { length: 2, fnv: "fbe78d48" },
  "Document/Timeline Viewport=Desktop": { length: 12, fnv: "24178af8" },
  "Document/Timeline Viewport=Mobile": { length: 12, fnv: "24178af8" },
  "Document/Quote Viewport=Desktop": { length: 2, fnv: "6e91b91d" },
  "Document/Quote Viewport=Mobile": { length: 2, fnv: "6e91b91d" },
  "Document/Sources Viewport=Desktop": { length: 15, fnv: "66ba82ee" },
  "Document/Sources Viewport=Mobile": { length: 15, fnv: "66ba82ee" },
};
const docPart = (set, path, desktop, mobile) => ({
  set, about: `LOUIS 문서 부품 ${set} — 예시 document-report 의 측정 서브트리.`,
  variants: [["Viewport=Desktop", "desktop-1920x1080", desktop], ["Viewport=Mobile", "mobile-402x874", mobile]].map(([variant, context, component]) => ({
    variant, route: "document-report", context, path: `body.0.0.0.${path}`, fixture: "louisExamples", anchor: LOUIS_DOC_ANCHORS[`${set} ${variant}`] ?? null, component,
  })),
});
const LOUIS_DOC_PARTS = [
  docPart("Document/Head", "0", "2725:535", "2725:536"),
  docPart("Document/Decision", "1", "2725:540", "2725:541"),
  docPart("Document/Toc", "2", "2725:545", "2725:546"),
  docPart("Document/Flow", "3.2", "2725:550", "2725:551"),
  docPart("Document/Card Grid", "3.3", "2725:555", "2725:556"),
  docPart("Document/Stat Grid", "4.1", "2725:560", "2725:561"),
  docPart("Document/Stack Card", "4.2", "2725:565", "2725:566"),
  docPart("Document/Bars Card", "4.3.0", "2725:570", "2725:571"),
  docPart("Document/Trend Card", "4.4.0", "2725:575", "2725:576"),
  docPart("Document/Table", "4.5", "2725:580", "2725:581"),
  docPart("Document/Compare", "5.2.1", "2725:585", "2725:586"),
  docPart("Document/Codeblock", "5.4", "2725:590", "2725:591"),
  { set: "Document/Callout", about: "louis-document-callout — 결론 한 줄(기본) · 비용 주의(data-tone=caution).", variants: [
    ["Tone=Default, Viewport=Desktop", "desktop-1920x1080", "5.6", "2725:595"], ["Tone=Default, Viewport=Mobile", "mobile-402x874", "5.6", "2725:596"],
    ["Tone=Caution, Viewport=Desktop", "desktop-1920x1080", "8.2", "2725:597"], ["Tone=Caution, Viewport=Mobile", "mobile-402x874", "8.2", "2725:598"],
  ].map(([variant, context, path, component]) => ({ variant, route: "document-report", context, path: `body.0.0.0.${path}`, fixture: "louisExamples", anchor: LOUIS_DOC_ANCHORS[`Document/Callout ${variant}`] ?? null, component })) },
  docPart("Document/Shot", "6.2.0", "2725:602", "2725:603"),
  docPart("Document/Timeline", "8.1", "2725:607", "2725:608"),
  docPart("Document/Quote", "9.2", "2725:612", "2725:613"),
  docPart("Document/Sources", "10", "2725:617", "2725:618"),
];
const PARTS = LOUIS_EXAMPLES ? LOUIS_DOC_PARTS : PRODUCT_PARTS;

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
// **제약 코드도 같은 함정이다(2026-10-08).** 첫 글자만 쓰면 `MIN` 과 `MAX` 가 둘 다 `"M"` 이 되어 렌더러(`CONSTRAINT` — M · A · S · C)가
// 오른쪽에 붙은 절대 배치를 모두 왼쪽 고정으로 읽었다 — `/aws/signup` 오른쪽 위 모서리 단추(`right: 20px`)가 보드를 1440 으로 줄이자
// 1864 에 남아 보드 밖으로 460 나갔다(늘림 시험). 렌더러와 같은 표로 옮긴다.
// SCALE(K) 는 스크립트가 무대 크기로 자리를 쓰는 층이다(2026-10-14, 조립 규칙 15조의 8 · figma-tree-spec constraintsFor).
const CONSTRAINT_CODES = { MIN: "M", MAX: "A", STRETCH: "S", CENTER: "C", SCALE: "K" };
const CONSTRAINT_CODE = (value) => {
  const code = CONSTRAINT_CODES[value];
  if (!code) throw new Error(`[figma-app-screens] 알 수 없는 제약: ${value}`);
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
    // 그림자의 섞기 모드(가상 요소 그림자, figma-tree-spec withPseudoShadows)는 7번째 칸 — 보통 섞기면 싣지 않는다(다른 보드 payload 그대로).
    ...(paint.shadow ? { e: paint.shadow.map((shadow) =>
      [shadow.inset ? 1 : 0, shadow.color, round(shadow.x), round(shadow.y), round(shadow.blur), round(shadow.spread), ...(shadow.blend ? [shadow.blend] : [])]) } : {}),
    ...(paint.opacity != null ? { a: round(paint.opacity) } : {}),
    // 자동 배치 없는 글자 상자의 안쪽 여백 [위, 오른쪽, 아래, 왼쪽](figma-tree-spec textInset) — 렌더러가 글자를 그만큼 들인다.
    ...(node.textInset ? { ti: node.textInset.map(round) } : {}),
    // 점 격자 [줌, 점 중심 x 위상, y 위상](attachDotGrid) — 렌더러가 점 타일 그림을 TILE 로 깐다(자산 pattern/canvas-dot 과 같은 모양).
    ...(node.dotGrid ? { dg: [Math.round(node.dotGrid.zoom * 100000) / 100000, round(node.dotGrid.centerX), round(node.dotGrid.centerY)] } : {}),
    // 뒤 흐림 px(figma-tree-spec backdropBlur) — 렌더러가 BACKGROUND_BLUR 로 건다.
    ...(paint.backdropBlur ? { bb: round(paint.backdropBlur) } : {}),
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
    // 1 = 말줄임 글자, 2 = 제품에서 실제로 잘린 말줄임 글자(측정기 truncated) — 렌더러가 2 면 측정 폭을 최대 폭으로 둔다.
    ...(typography.truncate ? { tt: typography.truncated ? 2 : 1 } : {}),
    // 줄 수를 자르는 글자(`-webkit-line-clamp`, figma-tree-spec lineClampOf) — 렌더러가 칸 폭 글자에 그 줄 수로 끝을 자른다(조립 규칙 15조의 10).
    ...(typography.lineClamp ? { lc: typography.lineClamp } : {}),
    // 글자 모양으로 오린 그라디언트(figma-tree-spec clippedTextPaint) — [각도, [색, 위치], …].
    ...(typography.gradient ? { tg: [round(typography.gradient.angle), ...typography.gradient.stops.map((stop) => [stop.color, round(stop.position)])] } : {}),
  };
};

// **로캘 변수 바인딩(DS-D-0081, 2026-10-08).** `figma/locale-strings.plan.json`(scripts/build-figma-locale-strings.mjs 생성물)이 있으면
// 그 계획이 묶은 자리의 노드에 변수 이름을 싣고 payload 에 `locale` 을 더한다 — 렌더러는 `P.locale` 이 있을 때만 글자 → 텍스트 스타일 →
// 바인딩 순서로 묶는다. 계획이 없으면(또는 `--no-locale`) 이 갈래는 아무것도 싣지 않아 러너가 바이트 하나 바뀌지 않는다.
// 계획은 보드 계획(app-screens.plan.json)의 경로를 열쇠로 지었다 — 앵커가 다르거나 묶은 자리가 사라졌으면 조용히 en 리터럴로 두지 않고 멈춘다.
// 그때는 `--no-locale` 로 보드를 먼저 세우고 로캘 원장 · 계획을 다시 만든다(계획이 옛 보드 계획에서 지어졌으므로 순서가 이렇다).
const localePlanArg = process.argv.find((arg) => arg.startsWith("--locale-plan="));
const localePlanPath = localePlanArg ? resolve(localePlanArg.slice("--locale-plan=".length)) : resolve(repoRoot, "figma/locale-strings.plan.json");
const localePlan = !LOUIS_EXAMPLES && !process.argv.includes("--no-locale") && existsSync(localePlanPath)
  ? JSON.parse(readFileSync(localePlanPath, "utf8")) : null;
if (localePlan && localePlan.productCommit !== fixture.productCommit) {
  fail(`로캘 계획의 커밋(${String(localePlan.productCommit).slice(0, 8)})이 측정 fixture(${String(fixture.productCommit).slice(0, 8)})와 다릅니다 — ` +
    "로캘 원장을 새 앵커에서 다시 재고 build-figma-locale-strings 를 돌리거나, --no-locale 로 보드를 먼저 세우세요.");
}
// 지금 축약하는 보드 · 부품의 바인딩(경로 → { xv, vv, iv }). slim 앞에 세우고 뒤에 비운다.
let localeBindings = null;
const localeUsed = new Set();
const localeKeys = (node) => {
  const binding = localeBindings?.[node.path];
  if (!binding) return {};
  const out = {};
  // 범위 서식 글자는 묶지 않는다 — 첫 모드 전환에 서식이 한 덩어리로 무너진다(DS-D-0081 4항, 실측 10-08).
  if (binding.xv && node.text && !node.textRanges?.length) out.xv = binding.xv;
  if (binding.vv) out.vv = binding.vv;
  if (binding.iv && node.instance?.label != null) out.iv = binding.iv;
  for (const key of Object.keys(out)) localeUsed.add(`${node.path}|${key}`);
  return out;
};
const localeConsumed = new Set();
/** 바인딩을 세우고 축약한 뒤, 계획이 묶은 자리가 모두 쓰였는지 본다. */
const slimWithLocale = (key, spec) => {
  localeBindings = localePlan?.bindings?.[key] ?? null;
  localeUsed.clear();
  const slimmed = slim(spec);
  if (localeBindings) {
    localeConsumed.add(key);
    const stale = Object.entries(localeBindings).flatMap(([path, binding]) =>
      Object.keys(binding).filter((name) => !localeUsed.has(`${path}|${name}`)).map((name) => `${path} ${name}`));
    if (stale.length > 0) fail(`로캘 계획이 묶은 자리가 ${key} 에 없습니다(${stale.length}) — 계획이 옛 보드에서 지어졌습니다: ${stale.slice(0, 5).join(", ")}`);
  }
  const locale = localeBindings ? { collection: localePlan.collection } : null;
  localeBindings = null;
  return { slimmed, locale };
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
  // 식은 로캘 짝짓기(locale-text-pairing.mjs figmaTextValue)와 한 함수다 — en 모드의 변수 값이 이 리터럴과 같아야 한다.
  ...(node.text ? { x: figmaTextValue(node) } : {}),
  // 글자 안의 범위 서식 [시작, 끝, 굵기(0 = 문단 그대로), 색("" = 그대로), 밑줄 1/0] — 섞인 문단(figma-tree-spec richInlineText).
  // 여섯째 칸(글자 크기)은 크기가 있는 범위에만 붙인다 — 각주 번호(2026-10-07). 없는 범위는 다섯 칸 그대로다.
  // 일곱째 칸(자간에 더할 px)은 요소 margin 을 옮긴 범위에만 붙인다(2026-10-08, richInlineText `track`) — 여섯째 칸은 0 으로 채운다.
  ...(node.text && node.textRanges?.length ? { xr: node.textRanges.map((range) => [range.start, range.end, range.weight ?? 0, range.color ?? "", range.underline ? 1 : 0,
    ...(range.track ? [range.size ?? 0, range.track] : range.size ? [range.size] : [])]) } : {}),
  r: [round(node.rect.width), round(node.rect.height)],
  s: SIZING_CODE(node.sizing.layoutSizingHorizontal) + SIZING_CODE(node.sizing.layoutSizingVertical),
  ...(node.positioning === "ABSOLUTE" ? { p: 1 } : {}),
  ...(node.offset ? { o: [round(node.offset.x), round(node.offset.y)] } : {}),
  ...(node.constraints ? { n: CONSTRAINT_CODE(node.constraints.horizontal) + CONSTRAINT_CODE(node.constraints.vertical) } : {}),
  // margin은 0이 아닐 때만 담는다(대부분 0이라 payload를 아낀다).
  ...(node.margin && (node.margin.top || node.margin.right || node.margin.bottom || node.margin.left)
    ? { m: [round(node.margin.top), round(node.margin.right), round(node.margin.bottom), round(node.margin.left)] }
    : {}),
  ...(node.sizing.minHeight ? { mh: round(node.sizing.minHeight) } : {}),
  ...(node.sizing.maxWidth ? { mw: round(node.sizing.maxWidth) } : {}),
  // 비율 잠금(figma-tree-spec containFitOf, 조립 규칙 15조의 15) — 스크립트가 부모 안에 비율을 지켜 맞춘 상자. 있을 때만 싣는다.
  ...(node.aspectLock ? { ar: 1 } : {}),
  // 폭 하한 — 하한에 닿은 자리만(측정 폭 = 하한). 요금제 비교표(`min-width: 640px`)가 스크롤 칸(370)에 FILL 로 눌려 열이 좁아지고
  // 글자가 여러 줄로 꺾여 모바일 보드가 1269 길었다(2026-09-30, 글자 전부 대조).
  // auto margin 감싸개(wrapSiblingMargins)의 하한은 측정 폭에서 닿지 않아도 싣는다 — 줄이 좁아질 때 자식 상자 아래로 접히지 않게.
  ...(node.sizing.minWidth && node.sizing.layoutSizingHorizontal !== "FIXED"
    && (Math.abs(node.rect.width - node.sizing.minWidth) <= 0.5 || node.tag === "margin")
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
      ...(node.layout.columnTracks ? [emptyAutoColumnsToZero(node)] : []),
    ],
  } : {}),
  // 감긴 가로 줄의 줄 간격(`row-gap`) — Figma `counterAxisSpacing`. 렌더러가 걸지 않아 감긴 줄 사이가 붙었다(2026-09-30, 공개 페이지
  // 모바일 푸터의 링크 묶음 두 줄 사이 40).
  ...(node.layout?.wrap && node.layout.counterAxisSpacing && wrapRowCount(node) > 1 ? { cg: round(node.layout.counterAxisSpacing) } : {}),
  // grid 의 행 간격(`row-gap`)이 열 간격과 다를 때만 — 측정은 GRID 의 `itemSpacing` 에 column-gap, `counterAxisSpacing` 에 row-gap 을 싣는데
  // 렌더러가 간격 하나(l[1])를 행 · 열에 같이 걸어, 하이라이트 단계 모바일의 안내 grid(`row-gap 6 · column-gap 12`)가 6 커졌다(2026-10-12).
  // 같거나 행이 하나면 싣지 않는다(다른 보드의 payload 는 그대로다). **row-gap 이 `normal`(측정 null)이면 0 이다** — grid 의 `normal` 은 0 인데
  // 열 간격만 선언한 목록(LOUIS 문서 목차 `ol`, column-gap 24)이 행 사이에 24 를 받아 모바일 목차가 309 → 453 으로 섰다.
  ...(node.layout?.layoutMode === "GRID" && flowChildren(node).length > (node.layout.columns || 1)
    && round(node.layout.counterAxisSpacing ?? 0) !== round(node.layout.itemSpacing) ? { cg: round(node.layout.counterAxisSpacing ?? 0) } : {}),
  // grid 칸 안 정렬 [가로, 세로](figma-tree-spec gridCellAlign) — 칸을 채우지 않은 자식만. **`g` 가 아니다** — `g` 는 그라디언트 키다(paintKeys).
  ...(node.gridAlign ? { ga: [node.gridAlign.horizontal ?? "", node.gridAlign.vertical ?? ""] } : {}),
  // grid 칸 자리와 span [행, 열, 행 span, 열 span](figma-tree-spec gridPlacements) · 그 grid 의 행 수.
  ...(node.gridPlace ? { gp: node.gridPlace } : {}),
  ...(node.layout?.rowCount ? { gr: node.layout.rowCount } : {}),
  // 자산 이미지 — `<img src>` 가 이어진 LOUIS 컴포넌트 [id, 이름](IMAGE_COMPONENTS).
  ...(node.imageComponent ? { im: [node.imageComponent.id, node.imageComponent.name] } : {}),
  ...(node.maskTint ? { mt: 1 } : {}),
  ...(node.clipsContent ? { c: 1 } : {}),
  // 셸 자리는 자식 대신 컴포넌트 variant 참조만 싣는다.
  // **세 번째 칸은 라벨이다** — 컴포넌트가 노출한 TEXT 슬롯을 채울 글자. 라벨이 없는 인스턴스
  // (Gnb Shell · 본문 블록)는 두 칸 그대로라 payload 가 한 바이트도 바뀌지 않는다. 상단 바는
  // 속성이 여럿이라 문자열이 아니라 `{속성 이름: 글자 | null}` 객체다(2026-09-13, 앱 셸 plan 의 textProperties).
  ...(node.instance ? { i: node.instance.label == null
    ? [node.instance.set, node.instance.variant]
    : [node.instance.set, node.instance.variant, node.instance.label] } : {}),
  // 로캘 변수(DS-D-0081) — `xv` 글자 · `vv` 존재(visible) · `iv` 인스턴스 라벨. 로캘 계획이 묶은 자리에만 붙는다(localeKeys 주석).
  ...localeKeys(node),
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
      // 자리표시. grid 칸 자리(`gp`)는 남긴다(2026-10-07) — 빠지면 Figma 가 자리표시를 빈 칸에 자동으로 넣어, 뒤 형제가 제 칸을
      // 잃는다(편집기 데스크톱: 타임라인 자리표시가 (0,3)에 들어가 오른쪽 리사이저 · aside 가 「occupied」로 실패).
      head.k[index] = { t: child.t, r: child.r, s: child.s, ...(child.gp ? { gp: child.gp } : {}), w: 1 };
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
let totalStackingMoved = 0;
let totalEmptyHugFixed = 0;
let totalAspectFixed = 0;
let totalShrinkFixed = 0;
let totalInlineCentred = 0;
let totalGridRows = 0;
const countImageComponents = (node) => (node.imageComponent ? 1 : 0)
  + (node.children ?? []).reduce((sum, child) => sum + countImageComponents(child), 0);
let totalSizingReconciled = 0;
let totalAutoMarginCentred = 0;
let totalMarginWrapped = 0;
let totalSpaceBetweenHug = 0;
let totalCarriedLinesHugged = 0;
let totalCollapsedTables = 0;
let totalBleedHoisted = 0;
let totalBleedUnresolved = 0;
let totalGapsPaired = 0;
let totalGapsUnresolved = 0;
let totalUnresolvedFillInHug = 0;
let totalScreenHeightFilled = 0;
let screenHeightBoards = 0;

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
/**
 * **빈 `auto` 열은 폭 0 이다(2026-10-12 오후).** CSS grid 의 `auto` 열에 놓인 항목이 없으면 그 열은 0 이 되지만, Figma 의 빈 HUG 열은 FLEX 열과
 * 남은 폭을 똑같이 나눈다(작업 페이지 임시 프레임 — 하이라이트 단계 모바일 상단 바 `auto 1fr auto` 에 항목 둘: 프로필이 제품 x 354 대신 가운데
 * 173 에 섰다). 항목이 없는 HUG 열을 FIXED 0 으로 싣는다. 칸 자리(`gridPlace`)가 있으면 그것을, 없으면 흐름 순서(i % 열 수)를 따른다.
 */
const emptyAutoColumnsToZero = (node) => {
  const tracks = node.layout.columnTracks;
  const columns = node.layout.columns || tracks.length;
  const used = new Set();
  flowChildren(node).forEach((child, index) => {
    const place = child.gridPlace;
    if (Array.isArray(place)) { for (let c = place[1]; c < place[1] + (place[3] || 1); c += 1) used.add(c); }
    else used.add(index % columns);
  });
  return tracks.map((track, index) => (track[0] === "H" && !used.has(index) ? ["X", 0] : track));
};
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
/**
 * 늘어나기 전의 내용 크기 — `contentExtent` 와 같되 그 축 FILL 자식은 측정 크기(늘어난 크기)가 아니라 제 내용 크기로 센다. 잴 수 없으면 null.
 * 구독 데스크톱 요금제 카드는 안쪽 열(FILL)이 행 높이로 늘어나 있어 측정 자식으로 세면 두 카드가 모두 행 높이였다.
 */
function intrinsicExtent(node, axisName) {
  const axis = AXIS_OF[axisName];
  const layout = node.layout;
  const children = flowChildren(node);
  if (node.instance || !layout || layout.layoutMode === "GRID" || layout.wrap || children.length === 0) return null;
  const sizes = children.map((child) => (child.sizing[axis.sizing] === "FILL" && child.layout ? intrinsicExtent(child, axisName) : child.rect[axis.extent]));
  if (sizes.some((size) => size == null)) return null;
  const outer = sizes.map((size, index) => size + (children[index].margin?.[axis.start] ?? 0) + (children[index].margin?.[axis.end] ?? 0));
  const padding = layout.padding[axis.start] + layout.padding[axis.end];
  return layout.layoutMode === axis.mode
    ? padding + outer.reduce((sum, size) => sum + size, 0) + layout.itemSpacing * (children.length - 1)
    : padding + Math.max(...outer);
}
const UNRESOLVED_FILL_KIND = {
  instance: "인스턴스 — 내용 크기는 컴포넌트가 갖고 계획이 잴 수 없다",
  text: "글자 잎 — 계획에 글자의 내용 폭이 없다",
  unmeasurable: "내용 크기를 잴 수 없다(GRID · 흐름 자식 없음)",
  larger: "측정 크기가 내용보다 크다 — 부모 밖(부모 판정 · grid 트랙)에서 왔거나 측정기가 싣지 않은 선언(block-size 등)이다",
  smaller: "측정 크기가 내용보다 작다 — 수축(flex-shrink)이다",
};
/**
 * **감기는 줄에서 혼자 한 줄을 차지한 감긴 글자는 그 자리에서 줄을 끊는다(2026-10-09).** `flex-wrap: wrap` 줄의 항목은 한 줄 내용
 * (max-content)이 남은 폭보다 길면 제 줄로 내려가 줄 폭까지 줄어들며(flex-shrink) 감긴다 — 공개 푸터 모바일의 주소 칸(li, 362 · 두 줄).
 * Figma 감기 자동 배치에는 그 「내용 폭으로 줄을 고르고 줄 폭으로 줄어드는」 항목이 없다:
 *   · 측정 폭 FIXED(a51d4b7c 첫 판)는 줄이 좁아지면 넘친다 — 늘림 시험 run 2026-10-09a 의 360 에서 줄 320 보다 +42 · 보드 밖 +22,
 *     공개 모바일 보드 일곱의 글자 잘림 1 → 8.
 *   · 감기 줄 안의 FILL 글자는 줄을 고를 때 폭이 0 인 것처럼 앞 항목 뒤에 붙는다(라이브 탐침 2026-10-09: 362 줄에서 「Business
 *     Registration No.」 219.27 뒤 남은 120.73 에 서서 다섯 줄로 감겼고, 390 줄에서는 14.62 폭 · 37 줄).
 * 그래서 측정에서 혼자 선 줄을 구조로 옮긴다 — 감기는 줄을 세로 쌓기(간격 = 줄 간격)로 바꾸고, 그 글자 앞 · 뒤의 항목은 원래 줄의
 * 배치(감기 · 간격 · 정렬)를 그대로 가진 칠 없는 감기는 줄(가로 FILL · 세로 HUG)로 묶는다. 글자는 세로 쌓기의 흐름 자식이 되어
 * 「줄바꿈 텍스트」 규칙대로 폭 FILL(줄 폭을 따른다)이 된다. 측정 폭에서는 줄 나눔 · 자리가 같고(옛 · 새 생성기 대조), 줄이 좁아져도
 * 글자는 줄 폭을 따른다. 절대 배치 자식이 있는 감기는 줄은 건드리지 않는다(절대 자식의 자리 기준이 바뀐다).
 *
 * 끊은 글자는 「제품 줄을 옮긴 글자」의 폭 맞춤(hugCarriedLines)에서 뺀다 — 그 규칙은 Figma 글꼴이 칸보다 몇 px 넓어 옮긴 줄을 다시 감는
 * 자리를 막지만, 여기서는 줄 폭을 따르는 것이 목적이고 여유가 넉넉하다. 원장 근거(2026-10-09, 주소 칸): 같은 li 의 데스크톱 측정이 한 줄
 * 400.23(max-content)이라 줄 폭 400 아래(모바일 시험 360 · 430 의 줄 320 · 390)에서는 제품도 늘 혼자 한 줄이고, 같은 글꼴(Pretendard 12 ·
 * 자간 −0.12) 한 줄 표본 55 로 맞춘 글자 폭(잔차 RMS 0.83 · 상대 최대 4.3%)으로 옮긴 두 줄은 약 180 · 221(오차를 얹어 188 · 231)이다 —
 * 측정 줄 362 에서 131, 360 시험의 줄 320 에서 89 남는다.
 *
 * **끊는 항목은 셋이다(2026-10-12).** 감긴 글자 말고도 두 가지가 감기는 줄에서 혼자 한 줄을 차지하고 Figma 감기가 그 자리를 못 지킨다
 * (늘림 시험 run 2026-10-09b, 하이라이트 분석 중 · 업로드 중 모바일):
 *   · 「auto」 오른쪽 auto margin(`margin-right: auto`)으로 줄을 채운 글자 — 안내 문구 p(274.39 + auto 91.61 = 줄 366). margin 감싸개가
 *     그 auto 를 padding 으로 굳혀 감싸개가 366 HUG 로 서서 360 에서 줄(324) 밖으로 나갔다. CSS 에서 그 p 는 내용 폭(줄 폭까지 줄어든다) +
 *     남는 폭이다 — 끊은 세로 쌓기에서 줄 폭 FILL 로 두고 auto margin 은 버린다(글자는 왼쪽에서 시작한다). 칠이 없고 정렬 없는 글자 잎, 또는
 *     그런 글자만 쌓은 칠 없는 세로 상자만(상자 안 글자도 FILL — 블록 글자를 「줄어드는 상자」 보정이 HUG 로 돌려 둔 것을 되돌린다).
 *     측정 폭에서는 글자가 왼쪽 정렬 · 칠 없음이라 상자 폭이 늘어도 그림이 같고, 여유는 auto margin 만큼이다(분석 중 91.61 · 업로드 중 34.98).
 *   · 「basis」 기본 크기가 줄 폭 100% 인 항목(`flex-basis: 100%`, 또는 `flex-basis: auto` + `width: 100%`) — 어느 폭에서도 혼자 한 줄이다.
 *     감기 줄의 FILL 은 줄을 고를 때 폭 0 처럼 앞 항목 뒤에 붙어(업로드 중 430 의 진행 막대가 안내 문구 줄로 올라왔다) 끊어서 세운다. 판정은
 *     그대로(FILL)이고 세로 쌓기에서 줄 폭을 차지한다.
 * 끊는 항목이 여럿이면 줄 하나에서 모두 끊는다 — 그 사이 항목은 `~lines-before` · `~lines-after` · `~lines-after-2` … 묶음이다.
 * 알려진 차이: 분석 중 모바일 430 은 제품에서 「Analyzing video」(99.72) + 간격 12 + 안내 문구(274.39) = 386.1 이 줄 394 에 들어가 한 줄이 되지만
 * 끊은 구조는 두 줄로 남는다(넘침 · 잘림은 없다). 측정 폭(줄 366)과 그보다 좁은 폭에서는 제품도 두 줄이다.
 */
function splitWrapRowsAtLoneText(spec, declaredOf = () => null) {
  const isAuto = (value) => /^auto$/.test(String(value ?? "").replace(/!important/g, "").trim());
  const isFull = (value) => /^100%$/.test(String(value ?? "").replace(/!important/g, "").trim());
  const outerWidth = (node) => node.rect.width + (node.margin?.left ?? 0) + (node.margin?.right ?? 0);
  const plainText = (node) => node.text && !node.paint && !node.layout && !node.instance && !node.typography?.align;
  // 혼자 한 줄을 차지한 항목의 종류 — 「wrapped」 감긴 글자, 「auto」 오른쪽 auto margin 으로 줄을 채운 글자(또는 글자만 쌓은 칠 없는 상자),
  // 「basis」 기본 크기가 줄 폭 100% 인 항목. 아니면 null.
  const loneKind = (node, parent) => {
    if (node.instance || node.positioning === "ABSOLUTE") return null;
    const room = parent.rect.width - parent.layout.padding.left - parent.layout.padding.right;
    const alone = flowChildren(parent).every((child) => child === node
      || child.rect.y >= node.rect.y + node.rect.height - HALF_PIXEL || child.rect.y + child.rect.height <= node.rect.y + HALF_PIXEL);
    if (!alone || Math.abs(outerWidth(node) - room) > HALF_PIXEL) return null;
    const lineHeight = node.typography?.lineHeight;
    if (node.text && !node.paint && !node.layout && lineHeight && node.sizing.layoutSizingHorizontal === "HUG"
      && node.rect.height >= lineHeight * 2 - HALF_PIXEL) return "wrapped";
    const declared = declaredOf(node.path) ?? {};
    if (node.sizing.layoutSizingHorizontal === "HUG" && !node.paint && isAuto(declared["margin-right"]) && !isAuto(declared["margin-left"])
      && (plainText(node) || (node.layout?.layoutMode === "VERTICAL" && !node.text && flowChildren(node).length > 0
        && (node.children ?? []).every((child) => plainText(child) && child.positioning !== "ABSOLUTE")))) return "auto";
    const basis = String(declared["flex-basis"] ?? "auto").replace(/!important/g, "").trim();
    if (node.sizing.layoutSizingHorizontal === "FILL" && (isFull(basis) || (basis === "auto" && isFull(declared.width)))) return "basis";
    return null;
  };
  const walk = (node) => {
    if (node.instance) return;
    const layout = node.layout;
    const children = node.children ?? [];
    // 자식이 하나면 끊을 줄이 없다(그 글자는 「가로 줄 안에서 줄어들어 감긴 글자」 판정이 남은 폭 FILL 로 푼다).
    if (layout?.layoutMode === "HORIZONTAL" && layout.wrap && node.sizing.layoutSizingHorizontal !== "HUG" && children.length > 1
      && children.every((child) => child.positioning !== "ABSOLUTE")) {
      const kinds = children.map((child) => loneKind(child, node));
      if (kinds.some(Boolean)) {
        const lonePaths = children.filter((_, index) => kinds[index]).map((child) => child.path).join(" · ");
        const group = (items, suffix) => {
          if (items.length === 0) return [];
          const top = Math.min(...items.map((child) => child.rect.y - (child.margin?.top ?? 0)));
          const bottom = Math.max(...items.map((child) => child.rect.y + child.rect.height + (child.margin?.bottom ?? 0)));
          const reason = `감기는 줄(${node.path})을 혼자 한 줄을 차지한 항목(${lonePaths}) 자리에서 끊은 줄 — 줄 폭을 따른다(FILL), 높이는 내용(HUG)`;
          return [{
            path: `${node.path}~lines-${suffix}`, tag: "lines", name: `lines ${suffix} ${node.path}`, text: null, textLines: null, paints: false,
            rect: { x: node.rect.x + layout.padding.left, y: top, width: node.rect.width - layout.padding.left - layout.padding.right, height: bottom - top },
            glyph: null, paint: null, typography: null, positioning: "AUTO", margin: null, offset: null, constraints: null,
            sizing: { layoutSizingHorizontal: "FILL", layoutSizingVertical: "HUG", minWidth: null, maxWidth: null, minHeight: null, maxHeight: null, unresolved: [] },
            why: { horizontal: { verdict: "FILL", reason }, vertical: { verdict: "HUG", reason } },
            layout: { ...layout, padding: { top: 0, right: 0, bottom: 0, left: 0 } },
            clipsContent: false,
            children: items,
          }];
        };
        const out = [];
        let run = [];
        // 첫 묶음은 「before」, 끊은 항목 뒤의 묶음은 「after」 — 끊는 항목이 여럿이면 그 사이 묶음은 「after-2」 · 「after-3」 … 이다.
        let afterCount = 0;
        const flush = () => {
          if (run.length === 0) return;
          const suffix = out.length === 0 ? "before" : (afterCount += 1) === 1 ? "after" : `after-${afterCount}`;
          out.push(...group(run, suffix));
          run = [];
        };
        children.forEach((child, index) => {
          const kind = kinds[index];
          if (!kind) { run.push(child); return; }
          flush();
          // 끊은 자리의 글자는 줄 폭을 따른다 — 「제품 줄을 옮긴 글자」의 폭 맞춤(hugCarriedLines)이 세로 쌓기 안의 글자로 보고 HUG 로 돌리지 않게 표시한다.
          if (kind !== "basis") child.splitWrapLine = node.path;
          if (kind === "auto") {
            // 오른쪽 auto margin 은 그 줄의 남는 폭이다 — 세로 쌓기에서는 줄 폭 FILL 이 그 자리를 갖는다(글자는 왼쪽에서 시작한다).
            const reason = `감기는 줄(${node.path})에서 오른쪽 auto margin 으로 혼자 한 줄을 채운 글자 — CSS 는 내용 폭(줄 폭까지 줄어든다) + 남는 폭이다. 끊은 세로 쌓기에서 줄 폭(FILL)을 따르고 margin 은 버린다`;
            child.margin = { ...child.margin, right: 0 };
            child.why = { ...child.why, horizontal: { verdict: "FILL", reason, source: `margin-right auto · measured ${child.rect.width}`, value: null, previous: child.why?.horizontal ?? null } };
            child.sizing = { ...child.sizing, layoutSizingHorizontal: "FILL" };
            // 글자를 쌓은 상자면 그 글자도 줄 폭을 따른다 — 블록 글자(CSS 기본 FILL)를 「줄어드는 상자」 보정(fixShrinkToFit)이 HUG 로
            // 돌려 둔 것을 되돌린다. 줄이 좁아지면 글자가 상자 폭에서 감긴다(제품은 상자가 줄 폭까지 줄어들며 감긴다).
            for (const text of child.layout ? child.children : []) {
              text.splitWrapLine = node.path;
              if (text.sizing.layoutSizingHorizontal === "FILL") continue;
              text.why = { ...text.why, horizontal: { verdict: "FILL", reason: `${reason} — 그 상자 안의 글자`, source: `measured ${text.rect.width}`, value: null, previous: text.why?.horizontal ?? null } };
              text.sizing = { ...text.sizing, layoutSizingHorizontal: "FILL" };
            }
          }
          out.push(child);
        });
        flush();
        node.children = out;
        node.layout = { ...layout, layoutMode: "VERTICAL", itemSpacing: layout.counterAxisSpacing ?? 0, counterAxisSpacing: null, wrap: false,
          align: { counterAxis: "MIN", primaryAxis: null } };
      }
    }
    for (const child of node.children ?? []) walk(child);
  };
  walk(spec);
}
function reconcileFigmaSizing(spec, declaredOf = () => null) {
  splitWrapRowsAtLoneText(spec, declaredOf);
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
    // **grid 행의 높은 칸은 생성기가 고른다(2026-09-30).** 렌더러의 행 맞춤(칸이 모두 세로 FILL 이면 내용을 재어 가장 높은 칸만 HUG)은
    // grid 를 만드는 순간에 돈다 — 러너 조각이 칸 안 내용을 뒤 조각에서 붙이면 그때의 높이로 고른다. 요금제 비교표 모바일(한 줄 다섯 열)이
    // 뒤 조각에 내용이 남은 둘째 열 높이로 서서 Trial 열이 잘리고 그 아래가 모두 165 올라왔다. 측정에서 자기 내용이 행 높이와 같은 칸을
    // HUG 로 둔다 — 렌더러의 행 맞춤은 칸이 모두 FILL 인 행만 돈다.
    if (node.layout?.layoutMode === "GRID" && !node.layout.rows && node.sizing.layoutSizingVertical === "HUG") {
      const cells = flowChildren(node);
      const columns = Math.max(1, node.layout.columns || 1);
      if (!cells.some((cell) => cell.gridPlace)) {
        for (let start = 0; start < cells.length; start += columns) {
          const row = cells.slice(start, start + columns);
          if (row.length < 2 || !row.every((cell) => cell.sizing.layoutSizingVertical === "FILL" && !cell.instance)) continue;
          const height = Math.max(...row.map((cell) => cell.rect.height));
          const tallest = row.find((cell) => {
            const content = intrinsicExtent(cell, "vertical");
            return content != null && Math.abs(content - cell.rect.height) <= HALF_PIXEL && Math.abs(cell.rect.height - height) <= HALF_PIXEL;
          });
          if (tallest) {
            change(tallest, "vertical", "HUG",
              `grid 행(${node.path})의 가장 높은 칸 — 자기 내용 ${height} 이 행 높이다. 렌더러의 행 맞춤은 조각을 나누면 내용이 덜 붙은 때의 높이로 고른다`,
              `row ${height}`);
          }
        }
      }
    }
    // **표 줄의 칸은 줄 높이로 늘어난다(2026-09-30).** CSS 표 칸은 늘 줄 높이다. 판정기는 내용 높이(HUG)로 두는데, 테두리를 겹친 표
    // (`border-collapse`)의 칸은 테두리를 반씩만 가져 Figma 의 HUG 칸(패딩 + 내용 + 테두리 둘)이 측정보다 1 높다 — 약관 정의 표의 이름 칸
    // (`<strong>`)이 줄마다 1 씩 키워 표 아래가 모두 6 내려갔다. 자기 내용이 줄보다 낮은 칸을 FILL 로 둔다 — 줄 높이는 FILL 이 아닌 칸이 정한다.
    if (node.tag === "tr" && node.layout?.layoutMode === "HORIZONTAL" && node.sizing.layoutSizingVertical === "HUG") {
      const cells = flowChildren(node);
      const shorter = cells.filter((cell) => cell.layout && cell.layout.layoutMode !== "GRID" && cell.sizing.layoutSizingVertical === "HUG"
        && (contentExtent(cell, "vertical") ?? Infinity) < cell.rect.height - HALF_PIXEL);
      if (shorter.length > 0 && cells.some((cell) => !shorter.includes(cell) && cell.sizing.layoutSizingVertical !== "FILL")) {
        for (const cell of shorter) {
          change(cell, "vertical", "FILL",
            `표 줄(${node.path})의 칸 — 자기 내용 ${Math.round(contentExtent(cell, "vertical") * 100) / 100} 이 줄 높이 ${cell.rect.height} 보다 낮다. 표 칸은 줄 높이로 늘어난다`,
            `row ${cell.rect.height}`);
        }
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
          // **그 폭을 정한 한 줄 글자는 FILL 로 두지 않는다(2026-10-07).** 측정 폭은 브라우저 글꼴의 글자 폭이라, Figma 의 같은 글꼴이 그보다
          // 조금만 넓어도 FILL 글자가 줄을 꺾는다 — 공개 페이지 푸터 데스크톱의 「Product」 열(56.28)이 「Prod / uct」 두 줄로 섰다(부품 캡처).
          // 세로 흐름 안의 왼쪽 정렬 · 칠 없는 한 줄 글자는 늘어나도 그림이 같으므로 HUG(글자 폭)로 옮긴다. 가운데 · 오른쪽 정렬은 늘어난 폭이
          // 줄 자리를 정하므로 그대로 둔다.
          if (axisName === "horizontal" && node.layout.layoutMode === "VERTICAL") {
            for (const child of fills) {
              const lineHeight = child.typography?.lineHeight;
              if (child.text && !child.layout && !child.paint && !child.typography?.align && lineHeight
                && child.rect.height < lineHeight * 2 - HALF_PIXEL) {
                change(child, axisName, "HUG",
                  `측정 폭으로 선 부모(${node.path}) 안의 한 줄 글자 — 왼쪽 정렬 · 칠 없음이라 늘어나도 그림이 같다. FILL 이면 Figma 글꼴 폭이 측정보다 넓을 때 줄을 꺾는다`,
                  `single line ${child.rect.height} / line-height ${lineHeight}`);
              }
            }
          }
          continue;
        }
        // **최대 크기에 막힌 HUG 부모의 스크롤 칸(2026-10-12 오후).** 부모가 `max-height` 에 닿아 섰고(측정 = 상한) 주축 FILL 자식의 내용이 측정보다
        // 크면, 그 자식은 남은 자리를 채우고 넘치는 내용을 스크롤한다. Figma 는 HUG 부모의 FILL 자식을 내용보다 작게 접어(작업 페이지 임시 프레임:
        // 커맨드 팔레트 520 패널이 479 · 목록 428 이 387) 아래 단축키 줄이 올라왔다. 자식을 측정 크기 FIXED 로 세우면 부모가 상한에 선다.
        const parentMax = node.sizing?.[axisName === "vertical" ? "maxHeight" : "maxWidth"];
        const clamped = primary && parentMax && Math.abs(node.rect[axis.extent] - parentMax) <= HALF_PIXEL;
        for (const child of fills) {
          const measured = child.rect[axis.extent];
          const content = contentExtent(child, axisName);
          if (clamped && content != null && content > measured + HALF_PIXEL) {
            change(child, axisName, "FIXED",
              `최대 크기(${parentMax})에 막힌 HUG 부모(${node.path})의 주축 FILL — 내용 ${Math.round(content * 100) / 100} 이 측정보다 커 넘치는 만큼 스크롤한다. Figma 는 이 FILL 을 내용보다 작게 접는다`,
              `measured ${measured}`);
            continue;
          }
          // **textarea 는 HUG 로 접지 않는다(2026-10-13).** 그 「내용 크기」는 측정한 글자 상자(= textarea 내용 상자)라 측정과 같아 보이지만
          // Figma 의 HUG 는 글자 줄 수로 접는다 — 텍스트 노드 입력판 본문 칸이 63 → 최소 48 로 줄어, `min-height: 140` 칸이 모자란 8 을 설정 줄
          // (Image · Video · 생성 버튼) **아래** 빈칸으로 남겼다(소유자 캡처). textarea 의 높이는 CSS(행 수 · grow · 높이 선언)가 정하므로 측정 크기로 굳힌다.
          if (child.tag === "textarea") {
            change(child, axisName, "FIXED",
              `HUG 부모(${node.path})의 ${primary ? "주축 grow" : "교차축 stretch"} 자식이 textarea 다 — 높이는 내용이 아니라 CSS 가 정하므로 측정 ${measured} 으로 굳힌다`,
              "textarea");
            continue;
          }
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
          // 글자 잎의 주축 grow — 부모의 측정 크기가 흐름 자식 측정 크기의 합(+ 간격 · 패딩)과 같으면 남는 공간이 없어 grow 가 아무 일도
          // 하지 않았다(2026-09-30, 구독 데스크톱 크레딧 카드의 안내 문단 — grid 행의 높은 칸을 HUG 로 두자 드러났다).
          if (primary && child.text && !child.layout) {
            const parentContent = contentExtent(node, axisName);
            if (parentContent != null && Math.abs(parentContent - node.rect[axis.extent]) <= HALF_PIXEL) {
              change(child, axisName, "HUG",
                `HUG 부모(${node.path})의 주축 grow 가 아무 일도 하지 않았다 — 부모 측정 ${node.rect[axis.extent]} 이 흐름 자식의 합과 같아 남는 공간이 없다`,
                `parent content ${Math.round(parentContent * 100) / 100}`);
              continue;
            }
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
function wrapSiblingMargins(spec, declaredOf = () => null) {
  const wrapped = [];
  const SIDES = ["top", "right", "bottom", "left"];
  // 양수 margin 만 감싼다. 음수(번짐 — 상단 바 −16 / −8)는 감싸개가 들고 가서 전과 같이 부모 padding 을 깎는다(첫 자식일 때).
  const hasMargin = (node) => node.margin && SIDES.some((side) => (node.margin[side] ?? 0) > 0.01);
  const axis = (sizing) => (sizing === "FILL" ? "FILL" : "HUG");
  const isAuto = (value) => /^auto$/.test(String(value ?? "").replace(/!important/g, "").trim());
  // **가로 줄의 auto margin 은 남는 폭이다(2026-10-09, 조립 규칙 15조의 7).** `margin-left: auto`(오른쪽 끝 단추) · `margin-right: auto`
  // (앞에 붙인 문구)는 줄의 남는 폭을 먹는다 — 측정값(1272.97 등)을 감싸개 padding 으로 옮기면 감싸개가 HUG 로 그 폭에 굳어, 보드를
  // 1440 으로 줄이자 하이라이트 스튜디오 판의 알림 줄(새로고침 · 다시 시도 · 클립 받기 단추, 「분석 중」 문구)이 줄 밖으로 +284 ~ +414
  // 나갔다(늘림 시험 run 2026-10-09a, 03-app 부모 밖 14 → 22 중 넷). 그 변의 padding 을 버리고 감싸개를 가로 FILL(남는 폭) · 폭 하한 =
  // 자식 상자로 두며, 자식은 auto 의 반대쪽에 붙인다(왼쪽 auto → MAX, 오른쪽 → MIN, 둘 다 → CENTER). 측정 폭에서는 남는 폭 = 측정
  // margin 이라 자리가 같다(auto 둘이 나눈 남는 폭도 FILL 둘이 똑같이 나눈다). 폭이 정해진(HUG 아닌) 가로 줄에서만 —
  // HUG 줄에는 남는 폭이 없다. **감기는 줄에서 혼자 한 줄을 차지한 감싸개는 그대로 둔다** — 감기 줄의 FILL 은 줄을 고를 때 폭이 0 인
  // 것처럼 앞 항목 뒤에 붙어(splitWrapRowsAtLoneText 주석의 라이브 탐침), 뒤 항목(업로드 진행 막대, `flex-basis: 100%`)이 그 줄로
  // 올라온다. 오른쪽 auto 로 줄을 채운 글자는 그보다 앞서 splitWrapRowsAtLoneText 가 줄을 끊어 margin 을 버리므로(2026-10-12) 여기까지
  // 오지 않는다 — 남는 것은 그 규칙 밖(칠 · 정렬 · 왼쪽 auto 등)의 감싸개다.
  const autoSidesOf = (node, child) => {
    if (node.layout.layoutMode !== "HORIZONTAL" || node.sizing.layoutSizingHorizontal === "HUG" || child.sizing.layoutSizingHorizontal === "FILL") return [];
    const declared = declaredOf(child.path) ?? {};
    const sides = ["left", "right"].filter((side) => isAuto(declared[`margin-${side}`]) && (child.margin[side] ?? 0) > HALF_PIXEL);
    if (sides.length === 0) return [];
    const room = node.rect.width - node.layout.padding.left - node.layout.padding.right;
    const outer = child.rect.width + Math.max(0, child.margin.left ?? 0) + Math.max(0, child.margin.right ?? 0);
    return node.layout.wrap && Math.abs(outer - room) <= HALF_PIXEL ? [] : sides;
  };
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
        const autoSides = autoSidesOf(node, child);
        const out = Object.fromEntries(SIDES.map((side) => [side, autoSides.includes(side) ? 0 : Math.max(0, child.margin[side] ?? 0)]));
        const bleed = Object.fromEntries(SIDES.map((side) => [side, Math.min(0, child.margin[side] ?? 0)]));
        wrapped.push({ path: child.path, margin: SIDES.map((side) => child.margin[side] ?? 0), ...(autoSides.length ? { auto: autoSides } : {}) });
        // auto 변의 측정 margin 은 감싸개 상자에 남긴다(측정 폭의 자리 · 검증용) — padding 으로는 옮기지 않는다.
        const boxLeft = Math.max(0, child.margin.left ?? 0), boxRight = Math.max(0, child.margin.right ?? 0);
        child.margin = out;
        const sizing = {
          ...child.sizing,
          layoutSizingHorizontal: autoSides.length ? "FILL" : axis(child.sizing.layoutSizingHorizontal),
          layoutSizingVertical: axis(child.sizing.layoutSizingVertical),
          minWidth: autoSides.length ? child.rect.width + out.left + out.right : null, maxWidth: null, minHeight: null, maxHeight: null, unresolved: [],
        };
        const reason = autoSides.length
          ? `auto margin(${autoSides.join(" · ")}) 감싸개 — 줄의 남는 폭(FILL), 폭 하한은 자식 상자`
          : "형제가 있는 자식의 margin 감싸개 — 자식이 FILL 이면 FILL, 아니면 HUG";
        const primaryAxis = autoSides.length === 2 ? "CENTER" : autoSides[0] === "left" ? "MAX" : null;
        return {
          path: `${child.path}~margin`, tag: "margin", name: `margin ${child.path}`, text: null, textLines: null, paints: false,
          rect: { x: child.rect.x - boxLeft, y: child.rect.y - out.top,
            width: child.rect.width + boxLeft + boxRight, height: child.rect.height + out.top + out.bottom },
          glyph: null, sizing, paint: null, typography: null, positioning: "AUTO",
          margin: bleed, offset: null, constraints: null,
          why: { horizontal: { verdict: sizing.layoutSizingHorizontal, reason }, vertical: { verdict: sizing.layoutSizingVertical, reason } },
          // 방향과 교차축 정렬은 부모를 따른다 — 최대 폭에 닿은 FILL 자식(결제 결과 본문 520)이 부모의 CENTER 로 가운데 서던 것을
          // 감싸개 안에서도 그대로 받게. grid 부모의 감싸개는 세로 오토 레이아웃이고 칸 안 정렬을 넘겨받는다(위 주석).
          ...(gridAlign ? { gridAlign } : {}),
          ...(gridPlace ? { gridPlace } : {}),
          layout: { layoutMode: grid ? "VERTICAL" : node.layout.layoutMode, itemSpacing: 0, counterAxisSpacing: null, wrap: false,
            padding: { top: 0, right: 0, bottom: 0, left: 0 }, columns: null, align: { counterAxis: grid ? null : node.layout.align?.counterAxis ?? null, primaryAxis } },
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
/**
 * **제품 줄을 옮긴 글자는 Figma 가 다시 감지 않게 폭을 글자에 맞춘다(2026-10-01).** 측정기의 `wrapLines` 로 제품 줄바꿈을 그대로 넣어도
 * (measured-text.mjs) 글자 상자가 칸 폭(FILL · FIXED, 높이 맞춤)이면 Figma 는 제 글꼴로 한 줄이 칸보다 몇 px 넓을 때 그 줄을 한 번 더 감는다 —
 * 개인정보 데스크톱의 「The Company processes … User Data Policy」 줄이 720 을 넘겨 두 줄 문단이 세 줄이 됐고, 그런 문단이 쌓여 보드 끝이
 * 개인정보 80 · 약관 모바일 92 내려갔다(끝 대조 · 글자 대조로 찾았다 — 줄바꿈을 넣지 않은 옛 손 보드 글자는 Figma 가 스스로 두 줄로 감았다).
 * 줄을 옮긴 글자를 가로 · 세로 HUG(폭 맞춤)로 둬 줄바꿈이 제품 자리에서만 일어나게 한다. **상자 폭이 바뀌어도 자리가 같은 경우만** —
 * 시작 정렬 글자이고, 부모가 폭이 정해진(HUG 아닌) 세로 쌓기이며 교차축이 시작이거나 글자가 부모의 흐름 자식 하나이고, 측정 상자가 부모
 * 내용의 시작선에 붙어 있을 때. 가운데 · 끝 정렬 글자, 여러 자식이 선 가로 줄 안의 글자, grid 칸의 글자는 그대로 둔다. 감기는 줄을 끊은
 * 자리의 글자(splitWrapRowsAtLoneText)도 그대로 둔다 — 줄 폭을 따르게 끊은 것이다. *
 * **폭이 부모 안쪽 폭과 같아도 FILL 로 돌리지 않는다(2026-10-12 판단).** 늘림 시험에서 이 HUG 가 줄이 좁아지면 부모 밖으로 나간다
 * (/highlight 모바일 설명 문단 390 · 세 줄, 하이라이트 단계 모바일의 가운데 정렬 두 줄 안내 340 / 칸 342 — 이쪽은 이 규칙이 아니라 flex 항목 판정의 HUG 다). 「여유 ≤ 2px 이거나 부모가 FILL 축이면
 * FILL + 같은 줄 나눔」은 측정 폭 parity 를 지키지 못한다 — 다시 감기는 위험은 상자 여유가 아니라 «줄» 여유로 정해지고, 원장에는 줄마다의 폭이
 * 없다. 이 규칙을 낳은 개인정보 데스크톱 문단이 바로 폭 720 = 부모 720(모바일 483.61 = 483.61)이라 그 조건이 이 사고를 그대로 되살린다.
 * Figma 에서 옮긴 줄의 폭을 재기 전(탐침)에는 HUG 로 둔다.
 * **예외 — 줄 수를 자르는 글자(`typography.lineClamp`, 2026-10-14 조립 규칙 15조의 10).** `line-clamp` 상자는 블록 폭이고 N 줄보다 길어질 수 없어
 * (렌더러가 `maxLines` 로 자른다) 다시 감겨도 높이가 바뀌지 않는다 — 판정 폭(FILL) 그대로 둔다. 랜딩 모바일 뉴스 카드 제목이 HUG 145 로 360 의 129 칸
 * 밖으로 16 나가던 것이다.
 */
function hugCarriedLines(spec) {
  const changed = [];
  const walk = (node, parent) => {
    if (node.instance) return;
    const carried = Array.isArray(node.wrapLines) && node.wrapLines.length > 1;
    if (carried && node.text && parent && !node.splitWrapLine && !node.typography?.align && !node.typography?.lineClamp && node.positioning !== "ABSOLUTE"
      && node.sizing?.layoutSizingHorizontal !== "HUG" && parent.sizing?.layoutSizingHorizontal !== "HUG") {
      const layout = parent.layout ?? {};
      const flow = flowChildren(parent);
      const vertical = layout.layoutMode === "VERTICAL" && (layout.align?.counterAxis ?? "MIN") === "MIN";
      const alone = layout.layoutMode === "HORIZONTAL" && flow.length === 1 && (layout.align?.primaryAxis ?? "MIN") === "MIN";
      const contentStart = (parent.rect?.x ?? 0) + (layout.padding?.left ?? 0);
      const atStart = Math.abs((node.rect?.x ?? 0) - contentStart) <= 1;
      if ((vertical || alone) && atStart) {
        const before = node.sizing.layoutSizingHorizontal;
        node.sizing = { ...node.sizing, layoutSizingHorizontal: "HUG", layoutSizingVertical: "HUG", minWidth: null, maxWidth: null };
        node.why = { ...node.why, horizontal: { verdict: "HUG", reason: `제품 줄을 옮긴 글자 — Figma 가 다시 감지 않게 폭 맞춤(전 판정 ${before})` } };
        changed.push(node.path);
      }
    }
    for (const child of node.children ?? []) walk(child, node);
  };
  walk(spec, null);
  return changed;
}

/**
 * **테두리를 겹친 표의 칸은 테두리를 반씩 갖는다(2026-10-01).** CSS 표(`border-collapse: collapse`)에서 이웃 칸은 테두리 하나를 나눠 갖고
 * 줄 높이 · 칸 폭에는 변마다 테두리의 반만 든다. Figma 칸은 획을 통째로 레이아웃에 넣어(안쪽 획 · 레이아웃에 포함) 칸마다 테두리 하나가
 * 더 붙는다 — 약관 사업자 정보 표의 이름 칸(패딩 5 + 글자 18 + 패딩 5 + 테두리 2 = 30)이 줄(29)보다 높아 줄마다 1 씩 키웠고, 표 넷을
 * 지나며 문서 아래가 9 내려갔다(보드 글자 자리 대조). 원장에는 `border-collapse` 가 없어 측정 자리로 가린다 — 겹친 표는 표 상자가 줄보다
 * 바깥 칸 테두리의 반쪽씩 넓다(370 ↔ 369; 따로 그리는 표는 줄과 같거나 제 테두리 · 간격만큼 넓다). 그런 표의 자동 배치 칸은 패딩에서 변마다
 * 테두리의 반을 빼고, 표는 바깥 반쪽을 패딩으로 갖는다. 글자뿐인 칸(면 + 글자)은 측정 크기로 서므로 그대로다.
 */
function halveCollapsedBorders(spec) {
  const changed = [];
  const unwrap = (node) => (node?.tag === "margin" && node.children?.length === 1 ? node.children[0] : node);
  const rowsOf = (table) => {
    const rows = [];
    for (const child of (table.children ?? []).map(unwrap)) {
      if (child.tag === "tr") rows.push(child);
      else if (/^(thead|tbody|tfoot)$/.test(child.tag ?? "")) for (const row of (child.children ?? []).map(unwrap)) if (row.tag === "tr") rows.push(row);
    }
    return rows;
  };
  const cellsOf = (row) => (row.children ?? []).map(unwrap).filter((cell) => /^(td|th)$/.test(cell.tag ?? ""));
  const strokeOf = (cell) => (cell.paint?.stroke && !cell.paint.stroke.inset && !cell.paint.stroke.outside ? cell.paint.stroke.widths : null);
  const walk = (node) => {
    if (node.instance) return;
    if (node.tag === "table" && node.layout && !node.paint?.stroke) {
      const rows = rowsOf(node);
      const head = rows.length > 0 ? cellsOf(rows[0]) : [];
      const tail = rows.length > 0 ? cellsOf(rows.at(-1)) : [];
      const left = head.length > 0 ? strokeOf(head[0]) : null;
      const right = head.length > 0 ? strokeOf(head.at(-1)) : null;
      const outer = left && right ? (left[3] + right[1]) / 2 : 0;
      const collapsed = outer > HALF_PIXEL / 2 && rows.every((row) => cellsOf(row).every((cell) => strokeOf(cell)))
        && Math.abs(node.rect.width - rows[0].rect.width - outer) <= HALF_PIXEL / 2;
      if (collapsed) {
        for (const row of rows) {
          for (const cell of cellsOf(row)) {
            if (!cell.layout) continue;
            const [top, rightWidth, bottom, leftWidth] = strokeOf(cell);
            const pad = cell.layout.padding;
            cell.layout = { ...cell.layout, padding: { top: Math.max(0, pad.top - top / 2), right: Math.max(0, pad.right - rightWidth / 2),
              bottom: Math.max(0, pad.bottom - bottom / 2), left: Math.max(0, pad.left - leftWidth / 2) } };
          }
        }
        const half = (cells, side) => Math.max(0, ...cells.map((cell) => strokeOf(cell)[side])) / 2;
        const pad = node.layout.padding;
        node.layout = { ...node.layout, padding: { top: pad.top + half(head, 0), right: pad.right + right[1] / 2,
          bottom: pad.bottom + half(tail, 2), left: pad.left + left[3] / 2 } };
        changed.push(node.path);
      }
    }
    for (const child of node.children ?? []) walk(child);
  };
  walk(spec);
  return changed;
}

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
    // **가로 줄의 외동 항목도 같다 — 주축 가운데(2026-10-14, 조립 규칙 15조의 12).** 홈 배너 슬라이드(`article` 가로 flex)의 글 상자
    // (`width: min(540px, 100%); margin-inline: auto`)는 측정기 선언 목록에 `margin-inline` 이 없어 auto 를 잃고 계산값 550 / 550 이
    // 부모 padding 으로 굳었다 — /archive 데스크톱을 1440 으로 줄이자 슬라이드 1160 에서 padding 1100 이 남아 글 상자가 60 으로 접혔다.
    // 위와 같은 수의 닫힘(최대 폭에 닿은 FILL · 좌우 여백이 같고 (안쪽 폭 − 폭) / 2)이면 auto 이고, 외동 흐름 항목이라 주축 정렬
    // CENTER 가 같은 자리다(측정 폭에서 자리 · 크기 그대로).
    if (node.layout?.layoutMode === "HORIZONTAL" && !node.layout.wrap) {
      const children = flowChildren(node);
      const child = children.length === 1 ? children[0] : null;
      const inner = node.rect.width - node.layout.padding.left - node.layout.padding.right;
      const margin = child?.margin ?? { left: 0, right: 0 };
      const slack = child ? (inner - child.rect.width) / 2 : 0;
      const fillAtMax = child && child.sizing.layoutSizingHorizontal === "FILL" && child.sizing.maxWidth != null
        && Math.abs(child.rect.width - child.sizing.maxWidth) <= HALF_PIXEL;
      if (fillAtMax && slack > HALF_PIXEL && margin.left > HALF_PIXEL && Math.abs(margin.left - margin.right) <= HALF_PIXEL
        && Math.abs(margin.left - slack) <= HALF_PIXEL) {
        centred.push({ path: node.path, from: node.layout.align.primaryAxis ?? null, children: [child.path], margin: [margin.left], axis: "primary" });
        node.layout = { ...node.layout, align: { ...node.layout.align, primaryAxis: "CENTER" } };
        child.margin = { ...child.margin, left: 0, right: 0 };
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
const pendingAnchors = {};
{
  // 부품도 보드처럼 원장을 고른다(`fixture` 키 — 없으면 인증 원장). 공개 화면 푸터는 공개 원장에만 있다(2026-10-07).
  const styleIndex = new Map();
  const styleByIdOf = (ledger) => {
    if (!styleIndex.has(ledger)) styleIndex.set(ledger, new Map(ledger.computedStyles.map((entry) => [entry.id, entry.value])));
    return styleIndex.get(ledger);
  };
  for (const part of PARTS) {
    const seen = new Set();
    for (const variant of part.variants) {
      if (seen.has(variant.variant)) fail(`부품 variant 가 겹칩니다: ${part.set} ${variant.variant}`);
      seen.add(variant.variant);
      const ledger = fixtureOf(variant);
      const styleById = styleByIdOf(ledger);
      const measured = ledger.screens[variant.context]?.[variant.route];
      if (!measured?.tree?.length) fail(`부품의 측정 트리가 없습니다: ${variant.route} @ ${variant.context}`);
      const root = measured.tree.find((node) => node.path === variant.path) ?? fail(`부품 경로가 측정에 없습니다: ${part.set} ${variant.variant} ${variant.path}`);
      const tree = normalizeAuthFixtureTree(measured.tree, ledger.computedStyles);
      const { spec, stats } = toFigmaTreeSpec(tree, { rootPath: variant.path, contextId: variant.context });
      // 서명은 치환 «앞»에서 뜬다 — 보드 쪽 매처도 치환 전 서브트리의 글자로 판정한다.
      const signature = contentSignatureOf(spec);
      const look = lookOf(spec);
      const treeLook = part.strictLook ? treeLookOf(spec) : null;
      if (part.label && (!signature.leaf || signature.texts.length !== 1 || !new RegExp(part.labelPattern).test(signature.texts[0]))) {
        fail(`글자 속성 부품은 글자 하나를 든 잎이고 그 글자가 labelPattern 에 들어야 합니다: ${part.set} ${variant.variant} ${JSON.stringify(signature.texts)}`);
      }
      // 앵커는 글자 서열 그대로이거나, 긴 표처럼 서열이 수백 개면 `{ length, fnv }`(글자 수 · 서열 JSON 의 FNV-1a)다(2026-10-07).
      const anchorOf = (texts) => {
        const text = JSON.stringify(texts);
        let h = 0x811c9dc5;
        for (let i = 0; i < text.length; i += 1) { h ^= text.charCodeAt(i); h = Math.imul(h, 0x01000193) >>> 0; }
        return { length: texts.length, fnv: h.toString(16).padStart(8, "0") };
      };
      const anchorMatches = Array.isArray(variant.anchor)
        ? JSON.stringify(signature.texts) === JSON.stringify(variant.anchor)
        : JSON.stringify(anchorOf(signature.texts)) === JSON.stringify(variant.anchor);
      if (variant.anchor === null) {
        // 앵커를 아직 적지 않은 부품(LOUIS 문서 부품) — 계산한 값을 모아 끝에 한 번에 보여 준다.
        pendingAnchors[`${part.set} ${variant.variant}`] = anchorOf(signature.texts);
      } else if (!anchorMatches) {
        fail(`부품 ${part.set} ${variant.variant} 의 글자 서열이 기대와 다릅니다 — 측정 경로가 다른 노드를 가리킨다: ${JSON.stringify(signature.texts).slice(0, 400)} ${JSON.stringify(anchorOf(signature.texts))}`);
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
      // 자산 이미지도 보드와 같이 잇는다(2026-10-07) — 빠져 있어 Document/Compare 의 그림 두 칸이 빈 상자로 그려졌다.
      const unmappedImages = [];
      attachImageComponents(spec, unmappedImages);
      const unmappedMasks = [];
      attachMaskIcons(spec, (path) => styleByPath.get(path) ?? null, unmappedMasks);
      attachDotGrid(spec, measured.tree, (path) => styleByPath.get(path) ?? null);
      const stackingMoved = [];
      orderByStacking(spec, (path) => styleByPath.get(path) ?? null, stackingMoved);
      totalStackingMoved += stackingMoved.length;
      const emptyHugFixed = [];
      fixEmptyHug(spec, emptyHugFixed);
      const aspectFixed = [];
      fixAspectBoxes(spec, (path) => styleByPath.get(path) ?? null, aspectFixed);
      const shrinkFixed = [];
      fixShrinkToFit(spec, shrinkFixed);
      const inlineCentred = [];
      centreInlineBlocks(spec, (path) => styleByPath.get(path) ?? null, inlineCentred);
      totalInlineCentred += inlineCentred.length;
      totalShrinkFixed += shrinkFixed.length;
      totalAspectFixed += aspectFixed.length;
      totalEmptyHugFixed += emptyHugFixed.length;
      const sizingFix = reconcileFigmaSizing(spec, (path) => declaredByPath.get(path) ?? null);
      // 부품은 모든 인스턴스가 따라 그리는 원본이다 — 풀지 못한 감긴 글자(한 줄로 늘어난다)를 보드처럼 통계로만 두지 않고 멈춘다.
      if (sizingFix.unresolvedWraps.length > 0 && !LOUIS_EXAMPLES) {
        fail(`부품 ${part.set} ${variant.variant} 에 풀지 못한 감긴 글자가 있습니다 — Figma 에서 한 줄로 늘어납니다: ${JSON.stringify(sizingFix.unresolvedWraps)}`);
      }
      // **LOUIS 문서 예시는 측정 폭으로 묶는다(2026-10-07).** 인라인 코드 칩(`code`, 바탕 · 안쪽 여백이 있는 inline-block)이 섞인 감긴 문장은
      // 글자 범위로 합칠 수 없다(칩의 바탕은 글자 범위에 없다). 한 줄로 늘어나 부품 밖으로 넘치지 않게 그 글자를 측정 폭(FIXED)으로 묶고,
      // 자리는 부품 계획의 `unresolvedWraps` 에 남긴다 — 칩은 글자 옆 상자로 선다(문장 흐름 안이 아니다).
      let partHugHeight = false;
      if (sizingFix.unresolvedWraps.length > 0 && LOUIS_EXAMPLES) {
        const byPath = new Map();
        const parentOf = new Map();
        const index = (node) => { byPath.set(node.path, node); for (const child of node.children ?? []) { parentOf.set(child.path, node); index(child); } };
        index(spec);
        for (const wrap of sizingFix.unresolvedWraps) {
          const node = byPath.get(wrap.path);
          if (!node) continue;
          node.sizing = { ...node.sizing, layoutSizingHorizontal: "FIXED" };
          // **여러 줄로 감긴 조각은 줄 폭으로(2026-10-07).** 모바일에서 각주 문장이 코드 칩을 사이에 두고 세 줄로 감기면 그 글자 조각의
          // 측정 폭은 줄 폭이 아니다(20 · 34 · 0) — 그 폭으로 묶으면 Figma 가 한 자씩 세로로 쌓았다(Document/Sources 모바일 1031 높이, 캡처).
          // 감긴 조각은 부모 줄의 안쪽 폭으로 묶고, 부모 가로 줄은 감기게 해 칩과 링크가 다음 줄로 내려가게 한다(칩이 글자 옆 상자로 서는 알려진 차이와 같은 결).
          const parent = parentOf.get(node.path);
          if (wrap.lines > 1 && parent?.layout?.layoutMode === "HORIZONTAL") {
            partHugHeight = true;
            const inner = parent.rect.width - (parent.layout.padding?.left ?? 0) - (parent.layout.padding?.right ?? 0);
            node.rect = { ...node.rect, width: inner };
            parent.layout = { ...parent.layout, wrap: true };
          }
        }
      }
      centreAutoMargins(spec);
      const marginWrapped = wrapSiblingMargins(spec, (path) => declaredByPath.get(path) ?? null);
      const bleed = hoistBleed(spec);
      if (bleed.unresolved.length > 0) fail(`부품 ${part.set} ${variant.variant} 에 옮기지 못한 번짐이 있습니다: ${JSON.stringify(bleed.unresolved)}`);
      const gaps = pairNegativeGaps(spec);
      if (gaps.unresolved.length > 0) fail(`부품 ${part.set} ${variant.variant} 에 묶지 못한 음수 간격이 있습니다: ${JSON.stringify(gaps.unresolved)}`);
      const spaceBetweenHug = dropHugSpaceBetween(spec);
      hugCarriedLines(spec);
      halveCollapsedBorders(spec);
      const viewport = variant.context.startsWith("desktop") ? "Desktop" : "Mobile";
      partContent.push({ set: part.set, variant: variant.variant, viewport, texts: signature.texts, structure: signature.structure,
        ...(signature.leaf ? { leaf: signature.leaf } : {}),
        // 모양은 늘 싣는다 — 글자 · 구조가 같은 후보가 여럿일 때 매처가 뿌리 모양으로 가린다(인증 입력 상자, 2026-10-08).
        look, ...(treeLook ? { treeLook } : {}), ...(part.label ? { label: part.label, labelPattern: part.labelPattern } : {}) });
      parts.push({
        set: part.set, variant: variant.variant, route: variant.route, context: variant.context, path: variant.path,
        ...(part.label ? { label: part.label } : {}),
        componentId: variant.component, frameSize: [round(root.rect.width), round(root.rect.height)],
        ...(partHugHeight ? { hugHeight: true } : {}),
        signature, instances: inner.applied, stats: { kept: stats.kept, unresolved: stats.unresolved, sizingReconciled: sizingFix.reconciled.length,
          ...(stats.lineBoxSlack.length ? { lineBoxSlack: stats.lineBoxSlack } : {}),
          ...(marginWrapped.length ? { marginWrapped } : {}),
          ...(bleed.hoisted.length ? { bleedHoisted: bleed.hoisted } : {}),
          ...(gaps.paired.length ? { negativeGapsPaired: gaps.paired } : {}),
          ...(spaceBetweenHug.length ? { spaceBetweenHug } : {}),
          ...(unmappedImages.length ? { unmappedImages } : {}),
          ...(unmappedMasks.length ? { unmappedMasks } : {}),
          ...(stackingMoved.length ? { stackingMoved } : {}),
          ...(shrinkFixed.length ? { shrinkFixed } : {}) },
        spec,
      });
    }
  }
}

if (Object.keys(pendingAnchors).length > 0) {
  fail(`앵커를 적지 않은 부품이 ${Object.keys(pendingAnchors).length}개입니다 — 계산한 값을 확인하고 LOUIS_DOC_ANCHORS 에 옮기세요:\n${JSON.stringify(pendingAnchors, null, 1)}`);
}
for (const screen of SCREENS) {
  const source = fixtureOf(screen);
  for (const context of CONTEXTS) {
    if (!screen[context.key]) continue; // 보드를 한 뷰포트에만 둔 상태 레시피 화면(STATE_RECIPE_SCREENS)
    const measured = source.screens[context.id]?.[screen.route];
    if (!measured?.tree?.length) fail(`측정 트리가 없습니다: ${screen.route} @ ${context.id}`);
    // 테마 속성이 아예 없는 화면은 테마를 쓰지 않는다 — 전체 오류 화면(`global-error.tsx`)은 루트 레이아웃 대신 제 `<html lang="ko">` 와
    // 인라인 색으로 선다. 그 화면만 검사에서 뺀다(측정 테마가 다른 화면은 여전히 멈춘다).
    if (measured.theme !== measuredTheme && !(measured.theme == null && screen.route === "global-error")) fail(`화면 테마 ${measured.theme} 가 fixture 테마 ${measuredTheme} 와 다릅니다: ${screen.route} @ ${context.id}`);
    if (measured.redirected) fail(`리다이렉트된 route는 대상이 아닙니다: ${screen.route}`);
    // **겹침(2026-10-08, 상태 레시피).** 앱 뿌리 밖(body 바로 아래)에 서는 고정 겹침 — 커맨드 팔레트(role=dialog) · 연체 배너 — 은 측정기가
    // `overlays` 에 따로 싣는다. 겹침 뿌리를 앱 뿌리의 자식으로 붙여 그린다: 겹침 뿌리는 position:fixed 이고 rect 가 뷰포트 기준이라 뿌리(0,0)
    // 안의 절대 배치와 같고, 경로가 `overlay.N` 이라 문서 순서 정렬에서 `body.*` 형제 뒤 — 마지막 자식이 된다(조립 규칙 15조). 겹침을
    // 싣지 않은 원장(상태 레시피 밖 전부)은 `overlays` 가 비어 있어 출력이 종전과 같다.
    const measuredTree = [...measured.tree, ...(measured.overlays ?? []).flatMap((overlay) => overlay.tree.map((node) =>
      (node.parentPath === null ? { ...node, parentPath: measured.rootPath } : node)))];

    const tree = normalizeAuthFixtureTree(measuredTree, source.computedStyles);
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
    const styleByPath = new Map(measuredTree.map((node) => [node.path, styleById.get(node.styleRef)]));
    // 선언(`declared`)도 경로로 되찾는다 — 사이드바는 폭 수가 아니라 폭 선언으로 찾는다(figma-component-substitution.mjs).
    const declaredByPath = new Map(measuredTree.map((node) => [node.path, node.declared ?? null]));
    const shells = applyComponentInstances(spec, {
      route: screen.baseRoute ?? screen.route,
      context: context.id,
      viewport: { width: measured.rootRect.width, height: measured.rootRect.height },
      styleOf: (path) => styleByPath.get(path) ?? null,
      declaredOf: (path) => declaredByPath.get(path) ?? null,
      evidence: { recipes, readback },
      extraContent: partContent,
      // 끈적 장면 무대(측정기 `captureStickyScenes` 가 제 스크롤 자리에서 잰 서브트리) — 조립 규칙 15조의 20.
      sceneStages: (measured.stickyScenes ?? []).map((scene) => scene.stage),
    });
    // **아이콘 정체를 서명 ↔ 이름 조인표에 댄다.** 인스턴스 치환 «뒤에» 돌린다 — 셸 안으로
    // 사라진 글리프는 payload 에 나오지 않으므로 이름을 붙일 일도 없다.
    const glyphs = applyGlyphIdentity(spec, `${screen.route} @ ${context.id}`);
    totalGlyphs += glyphs;
    // 자산 이미지도 치환 «뒤에» 잇는다 — 셸 안으로 사라진 로고(사이드바 워드마크)는 셸 컴포넌트가 그린다.
    const unmappedImages = [];
    attachImageComponents(spec, unmappedImages);
    const unmappedMasks = [];
    attachMaskIcons(spec, (path) => styleByPath.get(path) ?? null, unmappedMasks);
    attachDotGrid(spec, measuredTree, (path) => styleByPath.get(path) ?? null);
    const stackingMoved = [];
    orderByStacking(spec, (path) => styleByPath.get(path) ?? null, stackingMoved);
    totalStackingMoved += stackingMoved.length;
    const unmappedBackgrounds = [];
    attachBackgroundImages(spec, (path) => styleByPath.get(path) ?? null, unmappedBackgrounds);
    const emptyHugFixed = [];
    fixEmptyHug(spec, emptyHugFixed);
    const aspectFixed = [];
    fixAspectBoxes(spec, (path) => styleByPath.get(path) ?? null, aspectFixed);
    const shrinkFixed = [];
    fixShrinkToFit(spec, shrinkFixed);
    const inlineCentred = [];
    centreInlineBlocks(spec, (path) => styleByPath.get(path) ?? null, inlineCentred);
    totalInlineCentred += inlineCentred.length;
    totalShrinkFixed += shrinkFixed.length;
    totalAspectFixed += aspectFixed.length;
    totalEmptyHugFixed += emptyHugFixed.length;
    totalImageInstances += countImageComponents(spec);
    totalGridRows += stats.gridRows.filter((entry) => entry.rows).length;
    // 인스턴스 치환 뒤에 돈다 — 인스턴스로 바뀐 서브트리 안의 판정은 컴포넌트가 갖는다.
    const sizingFix = reconcileFigmaSizing(spec, (path) => declaredByPath.get(path) ?? null);
    const autoMarginCentred = centreAutoMargins(spec);
    totalAutoMarginCentred += autoMarginCentred.length;
    const marginWrapped = wrapSiblingMargins(spec, (path) => declaredByPath.get(path) ?? null);
    totalMarginWrapped += marginWrapped.length;
    const bleed = hoistBleed(spec);
    totalBleedHoisted += bleed.hoisted.length;
    totalBleedUnresolved += bleed.unresolved.length;
    const gaps = pairNegativeGaps(spec);
    totalGapsPaired += gaps.paired.length;
    totalGapsUnresolved += gaps.unresolved.length;
    const spaceBetweenHug = dropHugSpaceBetween(spec);
    totalSpaceBetweenHug += spaceBetweenHug.length;
    totalCarriedLinesHugged += hugCarriedLines(spec).length;
    totalCollapsedTables += halveCollapsedBorders(spec).length;
    // 화면 높이 뿌리(fillScreenHeight 주석) — 크기 조합 풀이 · 감싸개가 다 끝난 뒤, 보드 틀 높이(아래 frameSize 와 같은 식)에 묶는다.
    const frameHeight = round(measured.fullPage ? measured.rootRect.height : Math.min(measured.rootRect.height, Number(context.id.split("x").pop())));
    const screenHeightFilled = [];
    fillScreenHeight(spec, (path) => declaredByPath.get(path) ?? null, Number(context.id.split("x").pop()), frameHeight, screenHeightFilled);
    totalScreenHeightFilled += screenHeightFilled.length;
    if (screenHeightFilled.length) screenHeightBoards += 1;
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
        ...(unmappedMasks.length ? { unmappedMasks } : {}),
        // 이어지지 않은 바탕 그림 url(attachBackgroundImages 주석).
        ...(unmappedBackgrounds.length ? { unmappedBackgrounds } : {}),
        ...(stackingMoved.length ? { stackingMoved } : {}),
        ...(shrinkFixed.length ? { shrinkFixed } : {}),
        ...(inlineCentred.length ? { inlineCentred } : {}),
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
    // 출처의 사이드바 경로는 출처 보드에서 읽는다 — 상태 레시피 화면은 앱 뿌리 앞에 겹침(연체 배너 · body 바로 아래)이 서면 뿌리가
    // `body.2` 로 밀려 같은 사이드바가 다른 절대 경로에 있다(서명은 상대 경로라 그대로 견줄 수 있다). 출처 보드가 있는데 사이드바가
    // 없으면 출처가 사이드바를 재지 않은 것이라 ②를 건너뛰고 ①만 받는다 — `Current=Highlight` 의 출처가 원장에 없을 때와 같다.
    // (세션 원장 `/nodecanvas` 가 한때 오류 경계 「Something went wrong」로 재져 이 길을 탔다. 되살림(2026-10-08): 다시 재 사이드바가 돌아왔다.)
    const sourceEntry = screens.find((other) => other.context === desktopContext && other.route === source);
    const sourcePath = sourceEntry
      ? sourceEntry.shells.applied.find((applied) => applied.set === COMPONENT_SETS.sidebar)?.path
      : sidebar.path;
    if (source && sourcePath && measuredOf(source) && signatureOf(source, sourcePath) !== signature) {
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
const CONTENT_INSTANCES_BY_SET = LOUIS_EXAMPLES ? LOUIS_EXAMPLE_CONTENT_INSTANCES : {
  // 2026-10-08: 8 → 6 — 통합 판(DS-D-0079)의 `/mypage/topup/fail` 본문이 액션 둘(「Try again」 재시도 링크 + 「Back to subscription」)이라
  // (제품 76b6cf15 app/mypage/topup/fail/page.tsx 189행 retryHref) 액션 하나인 `Outcome=Failure` 와 서명이 달라 두 뷰포트가 날노드로 그려진다.
  [COMPONENT_SETS.paymentResult]: 6,
  [COMPONENT_SETS.checkoutStatus]: 6,
  // 2026-09-29: 5 → 9 — 공개 원장 `/pricing` 데스크톱의 요금제 카드 넷이 `/mypage/upgrade` 카드와 글자 서열 · 구조 · 뷰포트가 같다(같은 제품 카드).
  [COMPONENT_SETS.upgradePlanCard]: 9,
  [COMPONENT_SETS.upgradePlanCardSlice]: 2,
  // 2026-09-26: 「진행 중 이벤트 알약」(제품 `PricingNotice`) — `/mypage/upgrade` 데스크톱 · 모바일 헤더의 알약 하나씩.
  // 2026-09-29: 2 → 4 — 공개 원장 `/pricing` 데스크톱 · 모바일 헤더에도 같은 알약이 선다.
  // 2026-10-08: 4 → 0 — 통합 판(DS-D-0079)에서 알약이 걷혔다(제품 f0527efc6). 세트 은퇴는 보드를 다시 보낸 뒤.
  [COMPONENT_SETS.pricingNotice]: 0,
  // 2026-09-26(뒤): 제품 부품 세트(PARTS) — `/subscription/coupons` 의 요금제 선택 카드 넷 × 두 뷰포트, 수량 스테퍼 × 두 뷰포트.
  // 2026-10-08: 8 · 2 → 0 · 0 — 통합 판에서 `/subscription/coupons` 가 리다이렉트만 하는 옛 주소가 되어 요금제 선물 화면이 원장에 없다
  // (PRODUCT_PARTS 머리 주석). 세트 항목을 잠시 뺐다.
  "Product/Gift Plan Option": 0,
  "Product/Quantity Stepper": 0,
  // 둘째 묶음: 유튜브 연결 버튼 × 두 뷰포트(잎 서명 — 버튼이 글자를 제 몸에 든다), 하이라이트 업로드 테마 칩 줄 × 두 뷰포트,
  // 쿠폰 결제 동의 상자 × 데스크톱.
  // 2026-10-08: 2 → 0 — 통합 판에서 제품이 지역 알약을 LOUIS Button(inverse · lg)으로 바꿔 세트 항목을 뺐다(PRODUCT_PARTS 의 주석).
  "Product/Analytics Connect Button": 0,
  // 2026-10-08 밤: 2 → 0 — 앵커 54b62a8a 에서 하이라이트 업로드 단계의 테마 칩 줄이 걷혀 세트 항목을 뺐다(PRODUCT_PARTS 의 주석).
  "Product/Highlight Theme Chips": 0,
  // 2026-09-29: 1 → 2 — 세션 원장 결제 진행(`/mypage/upgrade/checkout?plan=pro`) 데스크톱에도 같은 동의 상자가 선다.
  // 2026-10-08: 2 → 1 — 통합 판에서 쿠폰 화면이 원장에서 빠져 세션 결제 진행 데스크톱 하나만 남았다(variant 도 그 자리에서 찍는다).
  "Product/Checkout Agreement": 1,
  // 셋째 묶음: 결제 상태 알림 × 두 뷰포트(billing-success 일부 반영 미리보기), bulk 쿠폰 안내 × 두 뷰포트 × 미리보기 둘(성공 · 발급 실패).
  "Product/Billing Status Alert": 2,
  "Product/Bulk Coupon Notice": 4,
  // 넷째 묶음: 쿠폰 코드 칩 — bulk 성공 미리보기 데스크톱 30 · 모바일 15(측정 화면 안에 보이는 칩만 잰다).
  "Product/Coupon Code Chip": 45,
  // 다섯째 묶음(2026-10-07): 공개 화면 푸터 — 랜딩 · 문의 · 요금 · 블로그 · 템플릿 × 두 뷰포트(같은 컴포넌트 · 같은 글자 서열).
  // 같은 날 뒤: 10 → 14 — 공개 시드 원장의 블로그 글 · 템플릿 상세 × 두 뷰포트에도 같은 푸터가 선다.
  // 2026-10-08: 14 → 7 — 통합 판에서 모바일 variant 를 잠시 뺐다(감긴 주소 칸, PRODUCT_PARTS 의 주석 — 모바일 −7). 남은 것은 랜딩 · 문의 ·
  // 요금 · 템플릿 · 블로그 · 블로그 글 · 템플릿 상세의 데스크톱 일곱이다. 되살림(2026-10-08): 공개 `/` 가 한때 오류 경계로 재져 6 이었다가
  // fixture 에 CDN 주소를 세워 다시 재자 랜딩 데스크톱 푸터가 돌아왔다(+1).
  // 같은 날 뒤: 7 → 14 — 모바일 variant 를 되살렸다(감기는 줄에서 혼자 한 줄을 차지한 감긴 글자 규칙, PRODUCT_PARTS 의 주석). 데스크톱과 같은
  // 일곱 화면(랜딩 · 문의 · 요금 · 템플릿 · 블로그 · 블로그 글 · 템플릿 상세)의 모바일 푸터가 인스턴스가 됐다(+7).
  // 2026-10-14: 14 → 18 — 모델 목록 · 상세(공개 시드) × 두 뷰포트에 같은 푸터가 선다(+4).
  "Product/Landing Footer": 18,
  // 같은 날 뒤: 앱 허브 머리(/videoeditor) · 어드민 머리(/admin) × 두 뷰포트, 선택 칸 — 문의(Field) · 부스 운영(Admin) × 두 뷰포트,
  // 요금제 비교표(/pricing) × 두 뷰포트. /mypage/upgrade 의 비교표는 측정 화면 밖이라(노드 2) 인스턴스가 아니다.
  // 2026-10-08: 2 → 6 — 셸 상태 레시피 `/videoeditor seeded` · `/videoeditor seeded.more-menu` × 두 뷰포트에도 같은 허브 머리가 선다.
  "Product/Page Header": 6,
  "Product/Admin Section Header": 2,
  "Product/Select Dropdown": 4,
  "Product/Plan Comparison Table": 2,
  // 2026-10-08(통합 판 원장 일곱 세트): 템플릿 상세 캐러셀 · 블로그 글 머리 · 문의 첨부 드롭존 — 측정한 그 자리 × 두 뷰포트.
  "Product/Template Result Carousel": 2,
  "Product/Article Header": 2,
  "Product/Attachment Dropzone": 2,
  // 테마 순환 버튼(/pricing) · 어드민 워드마크(/admin 데스크톱)는 글자가 없어(aria-label · img 뿐) 글자 서열 서명으로 보드에 묶이지 않는다 —
  // 매처가 글자 없는 노드를 보지 않는다(Select Dropdown 의 아이콘만 있는 칸과 같은 사정). 컴포넌트만 채우고 보드는 측정한 노드 그대로다.
  "Product/Theme Cycle Button": 0,
  "Product/Admin Wordmark Logo": 0,
  // 인증 입력 칸 14 — 로그인 위 칸 포커스 · 아래 칸 쉼, 가입 단칸 포커스(Username) · 단칸 쉼(Email) · 위 칸 쉼(Password), 비밀번호 찾기
  // 단칸 쉼, 새 비밀번호 위 칸 쉼 × 두 뷰포트. 가입 · 새 비밀번호의 「Confirm password」 아래 칸은 글자가 달라(세트의 아래 칸은 「Password」)
  // 날노드로, 탈퇴 복구(/recover)는 글자가 한국어라 묶이지 않는다. AWS 가입 · 설정 · 약관 본문의 같은 글자 칸은 서브트리 모양이 달라 뺀다(strictLook).
  "Product/Auth Floating Field": 14,
  // 약관 동의 줄 — 가입 × 두 뷰포트. AWS 가입의 같은 글자 블록(남색)은 서브트리 모양이 달라 뺀다(strictLook).
  "Product/Signup Legal Agreements": 2,
  // 2026-10-08(저녁) — 오류 경계에서 돌아온 세션 화면의 세트(PRODUCT_PARTS 의 주석). 노드 카드 셋은 노드캔버스 프로젝트 데스크톱 보드에 하나씩,
  // 프로젝트 머리는 두 뷰포트, 모바일 타임라인은 편집기 모바일 보드 하나다. 모바일 캔버스의 카드(줌 0.19)는 데스크톱 variant 와 뷰포트가 달라 날노드다.
  // 2026-10-15(R2): 셋 다 1 → 2 — 패널 상태 레시피 `/nodecanvas?project= panel.help` 데스크톱 보드도 같은 캔버스(텍스트 → 이미지 → 비디오)다.
  "Product/Canvas Text Node": 2,
  "Product/Canvas Image Node": 2,
  "Product/Canvas Video Node": 2,
  // 2026-10-14 — 나머지 노드 카드 다섯은 두 번째 노드캔버스 프로젝트에서 찍는데 그 화면은 보드가 없다(PRODUCT_PARTS 의 주석) — 0 이다.
  "Product/Canvas TTS Node": 0,
  "Product/Canvas BGM Node": 0,
  "Product/Canvas Edit Node": 0,
  "Product/Canvas YouTube Node": 0,
  "Product/Canvas Instagram Node": 0,
  // 2026-10-15(R2): 2 → 4 — 패널 상태 레시피 `/nodecanvas?project= panel.help` × 두 뷰포트에도 같은 프로젝트 머리가 선다.
  "Product/Project Header": 4,
  "Product/Mobile Timeline": 1,
  // 같은 날 뒤: 줌 비율 트리거 — 노드캔버스 프로젝트 데스크톱 보드 하나(모바일 캔버스에는 이 컨트롤이 없다).
  // 2026-10-15(R2): 1 → 2 — 패널 상태 레시피 `/nodecanvas?project= panel.help` 데스크톱 보드(같은 캔버스 위 도움말 패널)에도 같은 트리거가 선다.
  "Product/Canvas Zoom Trigger": 2,
  // 카드 안 부품은 카드 인스턴스가 서브트리를 통째로 가져가 보드에 따로 서지 않는다(생성 알약 · 제목 · LLM 결과 — 글자는 있다).
  // 2026-10-15(R2): 0 → 2 — 패널 상태 레시피 `/nodecanvas?project= panel.image-edit` · `panel.angle` 데스크톱의 이미지 노드(쇼케이스 시드 — 프롬프트 ·
  // GPT Image 2 · 9:16)는 카드 세트와 서명이 달라 카드가 날노드로 남고, 그 안의 「Regenerate」 생성 알약만 이 세트의 인스턴스가 된다.
  "Product/Node Generate Button": 2,
  "Product/Node Title Label": 0,
  "Product/LLM Response Area": 0,
  // 글자가 없는 부품(aria-label · svg · img 뿐)은 매처가 보지 않는다 — 테마 순환 버튼과 같은 사정.
  "Product/Node Target Button": 0,
  "Product/Canvas Toolbar": 0,
  "Product/Node Header Actions": 0,
  "Product/Node Prompt Copy Button": 0,
  "Product/Prompt Image Strip": 0,
  "Product/Sequence Ruler": 0,
};
const contentSets = new Set([...CONTENT_COMPONENTS, ...partContent].map((entry) => entry.set));
const contentInstances = Object.fromEntries([...contentSets].map((set) => [set, 0]));
const contentSkipped = [];
for (const entry of screens) {
  for (const applied of entry.shells.applied) if (contentSets.has(applied.set)) contentInstances[applied.set] += 1;
  for (const skipped of entry.shells.skipped) if (contentSets.has(skipped.set)) contentSkipped.push(`${entry.route} @ ${entry.context} · ${skipped.path}: ${skipped.reason}`);
}
{
  // 어긋난 세트를 모두 모아 한 번에 보인다(2026-10-07) — 첫 세트에서 멈추면 세트가 여럿 늘 때 한 번에 하나씩만 보였다.
  const drift = [...new Set([...Object.keys(CONTENT_INSTANCES_BY_SET), ...contentSets])]
    .filter((set) => (contentInstances[set] ?? 0) !== (CONTENT_INSTANCES_BY_SET[set] ?? 0))
    .map((set) => `본문 세트 ${set} 의 인스턴스가 ${contentInstances[set] ?? 0} 개입니다(기준 ${CONTENT_INSTANCES_BY_SET[set] ?? 0}).`);
  if (drift.length > 0) {
    fail(
      `${drift.join("\n")}\n` +
      "줄었으면 매처가 그 보드를 놓친 이유를, 늘었으면 옳은 서브트리에 붙었는지를 먼저 보고 CONTENT_INSTANCES_BY_SET 을 고치며 사유를 적으세요.",
    );
  }
}
// **알고 둔 보류(2026-09-29).** 공개 원장 `/pricing` 모바일의 요금제 카드 넷은 데스크톱 카드와 글자 서열이 같지만 세트에 모바일 variant 가 없다 —
// 모바일 세트는 `/mypage/upgrade` 모바일 뷰포트에 보이는 조각(`upgradePlanCardSlice`)뿐이다. 모바일 온전한 카드 variant 가 서기 전까지 보드는
// 측정한 노드 그대로 그린다. 여기 없는 보류는 여전히 멈춘다.
// **같은 결의 보류(2026-10-08 저녁).** 노드캔버스 프로젝트 모바일의 노드 카드 셋과 카드 안 글자 부품(제목 · LLM 결과 · 생성 알약)은 데스크톱
// variant 와 글자 서열이 같지만 모바일 variant 를 일부러 세우지 않았다 — 캔버스 맞춤 줌이 0.19 배라 카드 76 폭 · 글자 4px 안팎의 축소판이다
// (PRODUCT_PARTS 의 「캔버스 안 부품은 데스크톱 하나다」). 모바일 보드의 카드는 측정한 노드 그대로 그린다.
// 2026-10-15(R2): 같은 캔버스 문서 위에 도움말 패널을 연 상태 레시피 보드(`/nodecanvas?project= panel.help`)도 같은 여덟 자리다.
const NODE_CANVAS_MOBILE_SKIPPED = ["/nodecanvas?project=", "/nodecanvas?project= panel.help"].flatMap((route) =>
  ["0.0", "0.0.0.0.0.1", "0.0.1.0.4.0.0", "0.0.1.0.5.0.0.2.1.0.1", "1.0", "1.0.1.0.5.0.0.1.0.1.0.0.1", "2.0", "2.0.1.0.5.0.0.3.0.1.0.0.1"]
    .map((tail) => `${route} @ mobile-402x874 · ${NODE_CANVAS}.${tail}`))
  // 같은 결 — 쇼케이스 이미지 노드 하나를 연 이미지 편집 · 카메라 각도 보드의 모바일 생성 알약(「Regenerate」, 줌 축소판).
  .concat(["/nodecanvas?project= panel.image-edit", "/nodecanvas?project= panel.angle"].map((route) => `${route} @ mobile-402x874 · ${NODE_CANVAS}.0.0.1.0.5.0.0.2.0.1.0.0.1`));
const CONTENT_SKIPPED_ALLOWED = new Set([...[1, 2, 3, 4].map((index) => `/pricing @ mobile-402x874 · body.1.0.0.2.0.0.1.${index}`), ...NODE_CANVAS_MOBILE_SKIPPED]);
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
// 공개 페이지 푸터(링크 열 · 소셜 링크)의 stretch 자식(데스크톱 `body.1.0.0.3.1.0.1` 세로, 2026-09-29 새 보드 · 캡처 대조 전)은 2026-10-07 부터
// 보드가 아니라 부품 `Product/Landing Footer` 안에 있다 — 보드 다섯 장의 그 자리는 인스턴스가 되어 이 표에서 빠졌다. 캡처 대조는 부품에서 한다.
const INQUIRY_FORM_PENDING_WHY = "문의 폼 · 안내 칸의 stretch 자식 — 2026-09-29 새 보드, 캡처 대조 전";
const BOOTH_ADMIN_PENDING_WHY = "부스 운영 본문의 grow 자식 — 2026-09-29 새 보드, 캡처 대조 전";
const LANDING_PENDING_WHY = "랜딩 개요 · 푸터의 세로 stretch 자식 — 2026-09-30 새 보드(가장 높은 형제가 HUG 로 서고 나머지가 그 높이로 늘어나는지 캡처 대조 전)";
// 2026-10-06 앵커 a4125565 — 랜딩 노드 캔버스 목업의 두 자리는 감싸는 층이 하나 늘어 경로만 한 단계 깊어졌다(수 · 축 · 사유는 그대로).
const EDITOR_SEED_PENDING_WHY = "노드캔버스 편집기 · 영상 편집기 · 하이라이트 완료(자리표시 시드)의 세로 stretch 자식 — 2026-10-07 새 보드, 캡처 대조 전";
// 2026-10-08 — 셸 상태 레시피의 커맨드 팔레트 겹침(`overlay.1.1` 대화 상자 · 행 · 플라이아웃). 보드를 보낸 뒤 캡처로 대조한다.
const PALETTE_PENDING_WHY = "커맨드 팔레트 대화 상자 · 행 · 플라이아웃의 stretch 자식 — 2026-10-08 새 상태 보드(겹침을 처음 그린다), 캡처 대조 전";
// 2026-10-15 — 분석 상태 레시피(연결된 채널)의 처음 보드. 시청자 탭 지역 행의 stretch 자식 · 로딩 스켈레톤 막대. 보낸 뒤 캡처로 대조한다.
const ANALYTICS_PENDING_WHY = "분석 연결 상태 보드(시청자 탭 행 · 로딩 스켈레톤 막대)의 stretch 자식 — 2026-10-15 새 상태 보드, 캡처 대조 전";
const SHORT_RESULT_PLAYER_WHY ="쇼츠 결과 플레이어 상자 — 높이를 `aspect-ratio: 9/16` 이 폭에서 얻고 자식이 그 높이를 채운다(Figma 는 비율 상자가 없다). 2026-10-07 새 보드, 캡처 대조 전";
const UNRESOLVED_FILL_IN_HUG_BY_PARENT = LOUIS_EXAMPLES ? LOUIS_EXAMPLE_UNRESOLVED_FILL_IN_HUG : {
  // 되살림(2026-10-08): 아래 자리는 통합 판(DS-D-0079)에서 세션 `/videoeditor/[projectId]` 가 오류 경계로 재져 잠시 빠졌다가, fixture 에
  // CDN 주소를 세워 다시 재자 서브트리가 돌아와 되살렸다. 같이 빠졌던 공개 `/` 데스크톱 `body.1.0.0.2.1.0.1 · vertical`(LANDING_PENDING_WHY)은
  // 다시 잰 랜딩에서 0 이다 — 통합 판 랜딩 개요에는 풀지 못한 HUG 부모 · FILL 자식이 남지 않아 되살리지 않는다.
  // 2026-10-08(저녁): 편집기 모바일 `body.1.0.0.2.0.1.0.0.1.0.0.4.1.0.2 · vertical`(1, EDITOR_SEED_PENDING_WHY)을 뺐다 — 그 stretch 자식(모바일
  // 타임라인 셸 `…4.1.0.2.0`)이 부품 `Product/Mobile Timeline` 의 인스턴스가 되어 측정 크기로 선다. 캡처 대조는 부품에서 한다(Landing Footer 와 같다).
  // 2026-10-08(밤): 커맨드 팔레트의 가로 자리 35개(PALETTE_PENDING_WHY · `overlay.1.1` 대화 상자와 그 행)를 뺐다 — 측정기가 겹침에도 선언을 싣자
  // 대화 상자(`w-[560px] max-w-full`)가 FILL + 최대 폭 560 이 되어(조립 규칙 15조의 6) 그 아래 가로 stretch 자식이 풀렸다. 세로 자리는 그대로다.
  "/settings @ mobile-402x874 · body.1.0.0.1.0.1.1.1 · horizontal": { count: 1, why: ROW_ACTION_BUTTON_WHY },
  "/settings @ mobile-402x874 · body.1.0.0.1.0.1.4.1 · horizontal": { count: 1, why: ROW_ACTION_BUTTON_WHY },
  "/settings @ mobile-402x874 · body.1.0.0.1.0.1.5.1 · horizontal": { count: 1, why: ROW_ACTION_BUTTON_WHY },
  "/settings @ mobile-402x874 · body.1.0.0.1.0.1.6.1 · horizontal": { count: 1, why: ROW_ACTION_BUTTON_WHY },
  "/settings @ mobile-402x874 · body.1.0.0.1.0.1.10.1 · horizontal": { count: 1, why: ROW_ACTION_BUTTON_WHY },
  // 2026-10-12(오후): 커맨드 팔레트 대화 상자 세로 자리 둘(`overlay.1.1`, 데스크톱 · 모바일)을 뺐다 — 캡처에서 목록이 아래 단축키 줄을 덮고
  // 패널이 520 대신 479 로 섰다. 대화 상자가 최대 높이에 막힌 HUG 이고 목록(FILL)의 내용이 측정보다 커, 목록을 측정 크기 FIXED 로 세우는
  // 규칙(최대 크기에 막힌 HUG 부모의 스크롤 칸)이 풀었다. 플라이아웃 둘은 그 조건이 아니라 남는다.
  "/archive palette.flyout @ desktop-1920x1080 · overlay.1.1.1 · vertical": { count: 1, why: PALETTE_PENDING_WHY },
  "/archive palette.flyout @ mobile-402x874 · overlay.1.1.1 · vertical": { count: 1, why: PALETTE_PENDING_WHY },
  "/analytics/youtube audience @ desktop-1920x1080 · body.1.0.0.1.0.0.3.1.1.0.0.1.0.0 · vertical": { count: 2, why: ANALYTICS_PENDING_WHY },
  "/analytics/youtube audience @ desktop-1920x1080 · body.1.0.0.1.0.0.3.1.1.0.0.1.0.1 · vertical": { count: 2, why: ANALYTICS_PENDING_WHY },
  "/analytics/youtube audience @ desktop-1920x1080 · body.1.0.0.1.0.0.3.1.1.0.0.1.0.2 · vertical": { count: 2, why: ANALYTICS_PENDING_WHY },
  "/analytics/youtube audience @ desktop-1920x1080 · body.1.0.0.1.0.0.3.1.1.0.0.1.0.3 · vertical": { count: 2, why: ANALYTICS_PENDING_WHY },
  "/analytics/youtube audience @ desktop-1920x1080 · body.1.0.0.1.0.0.3.1.1.0.0.1.0.4 · vertical": { count: 2, why: ANALYTICS_PENDING_WHY },
  "/analytics/youtube audience @ desktop-1920x1080 · body.1.0.0.1.0.0.3.1.1.0.0.1.0.5 · vertical": { count: 2, why: ANALYTICS_PENDING_WHY },
  "/analytics/youtube audience @ desktop-1920x1080 · body.1.0.0.1.0.0.3.1.1.0.0.1.0.6 · vertical": { count: 2, why: ANALYTICS_PENDING_WHY },
  "/analytics/youtube audience @ mobile-402x874 · body.1.0.0.1.0.0.3.1.1.0.0.1.0.0 · vertical": { count: 2, why: ANALYTICS_PENDING_WHY },
  "/analytics/youtube audience @ mobile-402x874 · body.1.0.0.1.0.0.3.1.1.0.0.1.0.1 · vertical": { count: 2, why: ANALYTICS_PENDING_WHY },
  "/analytics/youtube audience @ mobile-402x874 · body.1.0.0.1.0.0.3.1.1.0.0.1.0.2 · vertical": { count: 2, why: ANALYTICS_PENDING_WHY },
  "/analytics/youtube audience @ mobile-402x874 · body.1.0.0.1.0.0.3.1.1.0.0.1.0.3 · vertical": { count: 2, why: ANALYTICS_PENDING_WHY },
  "/analytics/youtube audience @ mobile-402x874 · body.1.0.0.1.0.0.3.1.1.0.0.1.0.4 · vertical": { count: 2, why: ANALYTICS_PENDING_WHY },
  "/analytics/youtube audience @ mobile-402x874 · body.1.0.0.1.0.0.3.1.1.0.0.1.0.5 · vertical": { count: 2, why: ANALYTICS_PENDING_WHY },
  "/analytics/youtube audience @ mobile-402x874 · body.1.0.0.1.0.0.3.1.1.0.0.1.0.6 · vertical": { count: 2, why: ANALYTICS_PENDING_WHY },
  "/analytics/youtube loading @ desktop-1920x1080 · body.1.0.0.1.0.0.3.0.0.0.1.0 · horizontal": { count: 1, why: ANALYTICS_PENDING_WHY },
  "/analytics/youtube loading @ desktop-1920x1080 · body.1.0.0.1.0.0.3.0.0.1.1.0 · horizontal": { count: 1, why: ANALYTICS_PENDING_WHY },
  "/analytics/youtube loading @ mobile-402x874 · body.1.0.0.1.0.0.3.0.0.0.1.0 · horizontal": { count: 1, why: ANALYTICS_PENDING_WHY },
  "/analytics/youtube loading @ mobile-402x874 · body.1.0.0.1.0.0.3.0.0.1.1.0 · horizontal": { count: 1, why: ANALYTICS_PENDING_WHY },
  // 2026-10-14 — 랜딩 끈적 장면을 제 스크롤 자리에서 잰 뒤(조립 규칙 15조의 20) 처음 보이는 두 자리. ① 끝 장면 문장(`h2`, 두 줄 span 이 block
  // 이라 h2 폭을 채운다)은 글자가 부모 폭을 정하는 stretch 다 — 두 span 이 같은 282.44 폭이다. ② 개요 캔버스(0.361 배)의 TTS 노드 재생 막대는
  // `height: calc(4px)` 막대 안의 `height: 100%` 채움이다 — 막대의 calc 선언이 배율을 거쳐 HUG 로 판정됐다. 보낸 뒤 캡처로 대조한다.
  "/ @ desktop-1920x1080 · body.1.0.0.2.8.0.2.0 · horizontal": { count: 2, why: TEXT_DETERMINED_WHY },
  "/ @ mobile-402x874 · body.1.0.0.2.8.0.2.0 · horizontal": { count: 2, why: TEXT_DETERMINED_WHY },
  "/ @ desktop-1920x1080 · body.1.0.0.2.1.1.0.1.0.0.0.0.0.0.2.4.0.1.0.2.0.0.1.0 · vertical": { count: 1, why: LANDING_PENDING_WHY },
  "/ @ mobile-402x874 · body.1.0.0.2.1.1.0.1.0.0.0.0.0.0.2.4.0.1.0.2.0.0.1.0 · vertical": { count: 1, why: LANDING_PENDING_WHY },
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
  const { slimmed: slimSpec, locale } = slimWithLocale(`${entry.route} @ ${entry.context}`, entry.spec);
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
      { route: entry.route, context: entry.context, frameId: entry.figmaFrameId, frameSize: entry.frameSize, colour, head, ...(locale ? { locale } : {}) },
      ...groups.map((group) => ({ route: entry.route, context: entry.context, frameId: entry.figmaFrameId,
                                  colour, slots: group.slots, ...(locale ? { locale } : {}) })),
    ];
    return payloads.map((payload, index) => {
      const name = `figma/${RUNNER_PREFIX}.${slug}.${String(index).padStart(2, "0")}.draw.js`;
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
  const { slimmed: slimSpec, locale } = slimWithLocale(`part:${part.set} ${part.variant}`, part.spec);
  // 글자 속성 부품은 마스터 글자를 TEXT 속성에 묶는다 — 변수 바인딩과 한 글자에 겹치지 않는다(로캘 계획도 그 부품을 묶지 않는다).
  if (locale && part.label) fail(`글자 속성 부품에 로캘 바인딩이 있습니다: ${part.set} ${part.variant}`);
  const slug = `${part.set.replace(/^Product\//, "")} ${part.variant}`.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  const base = { route: `part:${part.set} ${part.variant}`, context: part.context, frameId: part.componentId };
  // **큰 부품은 보드처럼 조각으로 나눈다(2026-10-07).** 요금제 비교표(노드 754)는 한 조각에 들지 않는다. 렌더러는 보드와 부품을 같은
  // 방식으로 채우므로(조각 0 이 머리, 뒤 조각이 `slots` 를 조상 먼저 채운다) 나누는 규칙도 보드와 같다. 한 조각에 드는 부품은 결과가 그대로다.
  const draftsOf = ({ head, chunks }, budget) => {
    const ordered = chunks
      .map((chunk, index) => ({ chunk, index }))
      .sort((a, b) => a.chunk.path.length - b.chunk.path.length || a.index - b.index);
    const groups = [];
    for (const { chunk } of ordered) {
      const size = slimBytes(chunk.spec) + JSON.stringify(chunk.path).length + 16;
      const last = groups.at(-1);
      if (last && last.size + size <= budget) { last.slots.push({ path: chunk.path, spec: chunk.spec }); last.size += size; }
      else groups.push({ size, slots: [{ path: chunk.path, spec: chunk.spec }] });
    }
    // **부품 머리의 바깥 margin 은 싣지 않는다(2026-10-12 오후).** 렌더러는 흐름 자식 하나의 margin 을 부모 padding 으로 옮기는데, 부품 머리의
    // 부모는 마스터 틀이라 쓰는 자리의 여백(요금제 비교표 `margin-top: 64`)이 마스터 padding 이 됐다. 마스터는 높이 고정이라 보이지 않았지만,
    // 내용 맞춤 인스턴스(/pricing 데스크톱)는 64 커졌다 — 그 여백은 보드의 감싸개가 이미 갖는다.
    const { m: _outerMargin, ...partHead } = head;
    const payloads = [
      { ...base, frameSize: part.frameSize, ...(part.hugHeight ? { hugHeight: true } : {}), colour, head: partHead, ...(part.label ? { label: part.label } : {}), ...(locale ? { locale } : {}) },
      ...groups.map((group) => ({ ...base, colour, slots: group.slots, ...(locale ? { locale } : {}) })),
    ];
    return payloads.map((payload, index) => {
      const name = `figma/${PART_RUNNER_PREFIX}.${slug}.${String(index).padStart(2, "0")}.draw.js`;
      const draw =
        `// Generated by scripts/build-figma-app-screens.mjs. Do not edit by hand.\n` +
        `// 제품 부품 ${part.set} · ${part.variant} ← ${part.route} @ ${part.context} ${part.path}` +
        (payloads.length > 1 ? ` · 조각 ${index}/${payloads.length - 1}` : "") + `\n` +
        `const P=${payloadLiteral(payload)};\n${template}`;
      return { name, draw, bytes: Buffer.byteLength(draw) };
    });
  };
  let budget = CHUNK_BUDGET;
  let drafts = draftsOf(splitSpec(slimSpec, budget), budget);
  while (drafts.some((draft) => draft.bytes > RUNNER_BYTES)) {
    budget -= 1000;
    if (budget < 3000) fail(`조각 예산을 3000 아래로 줄여도 ${RUNNER_BYTES} 바이트에 들지 않습니다: ${part.set} ${part.variant}`);
    drafts = draftsOf(splitSpec(slimSpec, budget), budget);
  }
  if (part.label && drafts.length > 1) fail(`글자 속성 부품은 한 조각이어야 합니다: ${part.set} ${part.variant}`);
  for (const { name, draw } of drafts) outputs.push({ absolute: resolve(repoRoot, name), expected: draw });
  partRunners.push({ set: part.set, variant: part.variant, componentId: part.componentId, file: drafts[0].name,
    ...(drafts.length > 1 ? { files: drafts.map((draft) => draft.name) } : {}) });
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
// 로캘 계획에 있는데 이 실행이 그리지 않은 보드 · 부품 — 화면 목록에서 빠졌거나 이름이 바뀌었다.
if (localePlan) {
  const unknown = Object.keys(localePlan.bindings ?? {}).filter((key) => !localeConsumed.has(key));
  if (unknown.length > 0) fail(`로캘 계획의 보드 · 부품을 이 실행이 그리지 않습니다: ${unknown.join(", ")}`);
}

// **더 이상 내지 않는 런너는 지운다.** 조각 수는 spec이 바뀌면 줄어드는데, 남은 옛 파일은
// `--check`가 잡지 못한다(검사는 "내야 할 것"만 본다). 실측 사고: 셸을 인스턴스로 바꿔 조각이
// 7→6으로 줄자 `settings.desktop.06`이 남았고, 그게 05와 같은 path를 들고 있어 중복처럼 보였다.
const wanted = new Set(outputs.map((output) => output.absolute));
const orphans = readdirSync(resolve(repoRoot, "figma"))
  .filter((name) => new RegExp(`^(${RUNNER_PREFIX}|${PART_RUNNER_PREFIX})\\..+\\.\\d\\d\\.draw\\.js$`).test(name))
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
  `${screens.length} screens · 부품 ${parts.length} · ${totalNodes} nodes · UNRESOLVED ${totalUnresolved} · 인스턴스 ${totalShells}(공백 ${totalShellGaps}) · 아이콘 ${totalGlyphs} · 자산 이미지 ${totalImageInstances} · 칠 순서 정렬 ${totalStackingMoved} · 빈 HUG 고정 ${totalEmptyHugFixed} · 비율 상자 고정 ${totalAspectFixed} · 줄어드는 상자 글자 ${totalShrinkFixed} · 가운데 인라인 블록 ${totalInlineCentred} · 늘어난 grid 행 ${totalGridRows} · 크기 조합 풀이 ${totalSizingReconciled}(못 푼 HUG·FILL ${totalUnresolvedFillInHug}) · auto 여백 가운데 ${totalAutoMarginCentred} · margin 감싸개 ${totalMarginWrapped} · 번짐 올림 ${totalBleedHoisted}(못 옮김 ${totalBleedUnresolved}) · 음수 간격 묶음 ${totalGapsPaired}(못 묶음 ${totalGapsUnresolved}) · HUG space-between ${totalSpaceBetweenHug} · 제품 줄 폭 맞춤 ${totalCarriedLinesHugged} · 겹친 표 ${totalCollapsedTables} · 화면 크기 묶음 ${totalScreenHeightFilled}(보드 ${screenHeightBoards}) · 면 ${paintStats.fills}+${paintStats.gradients}g/${paintStats.strokes}/${paintStats.radii}/${paintStats.shadows} · 텍스트 ${paintStats.textStyled}/${paintStats.texts} 스타일 매칭 · 런너 ${SCREENS.length}개`,
);
