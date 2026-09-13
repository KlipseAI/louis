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

import { readFileSync, readdirSync, rmSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { atomicWriteBatch } from "./lib/atomic-output.mjs";
import {
  applyComponentInstances,
  COMPONENT_SETS,
  LOUIS_PRIMITIVE_EXCLUSIONS,
  LOUIS_PRIMITIVE_SITES,
  SIDEBAR_VARIANT_SOURCES,
} from "./lib/figma-component-substitution.mjs";
import { glyphBySignature, PRODUCT_GLYPHS } from "./lib/figma-glyph-identity.mjs";
import { normalizeAuthFixtureTree, toFigmaTreeSpec } from "./lib/figma-tree-spec.mjs";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const fixturePath = resolve(repoRoot, "migration/product.auth-fixture.json");
// **낱개 정본 프리미티브 치환의 두 증거.** 어느 쪽도 여기 상수로 베끼지 않는다 —
// 제품이 무는 레시피는 제품 원장이, LOUIS 의 size·variant 축은 되읽기가 소유한다.
const recipesPath = resolve(repoRoot, "migration/product.rendered-components.json");
const readbackPath = resolve(repoRoot, "figma/readback.json");
const planPath = resolve(repoRoot, "figma/app-screens.plan.json");
const templatePath = resolve(repoRoot, "scripts/templates/figma-app-screens-renderer.js");
const checkOnly = process.argv.includes("--check");
const fail = (message) => { throw new Error(`[figma-app-screens] ${message}`); };

const fixture = JSON.parse(readFileSync(fixturePath, "utf8"));
const recipes = JSON.parse(readFileSync(recipesPath, "utf8"));
const readback = JSON.parse(readFileSync(readbackPath, "utf8"));
// 제품 원장과 측정 fixture 가 같은 커밋을 봐야 한다. 어긋나면 「제품이 이 자리에서 무는
// 클래스」를 어제의 제품에서 읽고 오늘의 화면에 심는 것이 된다.
if (recipes.productCommit !== fixture.productCommit) {
  fail(
    `제품 레시피 원장의 커밋(${String(recipes.productCommit).slice(0, 8)})이 측정 fixture 의 ` +
    `${String(fixture.productCommit).slice(0, 8)} 와 다릅니다.`,
  );
}

// LOUIS(OlYKERKOkgbxBEEoXGZW2c)의 대상 프레임. 라이브에서 읽어 확인한 install id다.
// 별칭 route(`/mypage`→`/settings`, `/explore`→`/archive`, `/checkout`→`/upgrade`)는 제외한다 —
// 같은 화면을 두 번 그리게 된다.
const SCREENS = [
  { route: "/archive", desktop: "20:2", mobile: "23:2" },
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
];

const CONTEXTS = [
  { id: "desktop-1920x1080", key: "desktop" },
  { id: "mobile-402x874", key: "mobile" },
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
    ...(paint.stroke ? { b: [paint.stroke.color, ...paint.stroke.widths.map(round)] } : {}),
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
  };
};

const slim = (node) => ({
  t: node.tag,
  ...(node.text ? { x: node.text } : {}),
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
    ],
  } : {}),
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
  ...(node.instance ? {} : paintKeys(node)),
  ...(node.instance ? {} : typographyKeys(node)),
  ...(node.children.length ? { k: node.children.map(slim) } : {}),
});
const round = (value) => Math.round((value ?? 0) * 100) / 100;

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
// 렌더러 코드(~9KB)와 합쳐 `use_figma` 파서 한계 아래로 들어가는 축약 spec 예산.
// 실측: 20.7KB 페이로드(6화면 묶음)가 통과했다. 예전에 3200으로 잡았던 건 전사 오류를 파서 한계로
// 오해했기 때문이다 — 실제 한계는 훨씬 높다. 조각이 적을수록 적용 호출 수가 줄어든다.
const CHUNK_BUDGET = 9000;
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
const paintStats = { fills: 0, gradients: 0, strokes: 0, radii: 0, shadows: 0, texts: 0, textStyled: 0, textLiteral: new Set() };

for (const screen of SCREENS) {
  for (const context of CONTEXTS) {
    const measured = fixture.screens[context.id]?.[screen.route];
    if (!measured?.tree?.length) fail(`측정 트리가 없습니다: ${screen.route} @ ${context.id}`);
    if (measured.redirected) fail(`리다이렉트된 route는 대상이 아닙니다: ${screen.route}`);

    const tree = normalizeAuthFixtureTree(measured.tree, fixture.computedStyles);
    const { spec, stats } = toFigmaTreeSpec(tree, {
      rootPath: measured.rootPath,
      contextId: context.id,
    });
    // **이미 있는 컴포넌트는 다시 그리지 않는다.** 셸(사이드바·상단 바)과 본문 블록(결제 결과·
    // 체크아웃 상태·요금제 카드)을 잘라내고 인스턴스를 심는다(판정 근거는 figma-component-substitution.mjs).
    // **계산 스타일을 경로로 되찾는다.** `toFigmaTreeSpec` 는 색·기하를 파싱해 담지만 그
    // 과정에서 판정에 필요한 축(min-width·column-gap·box-shadow)이 사라진다 —
    // `parseBoxShadow` 는 `color(srgb …)` 표기를 아예 읽지 못해 헤어라인이 통째로 없어진다.
    // 그래서 spec 이 들고 있는 `path` 로 fixture 의 원래 계산 스타일을 다시 본다.
    const styleById = new Map(fixture.computedStyles.map((entry) => [entry.id, entry.value]));
    const styleByPath = new Map(measured.tree.map((node) => [node.path, styleById.get(node.styleRef)]));
    const shells = applyComponentInstances(spec, {
      route: screen.route,
      context: context.id,
      viewport: { width: measured.rootRect.width, height: measured.rootRect.height },
      styleOf: (path) => styleByPath.get(path) ?? null,
      evidence: { recipes, readback },
    });
    // **아이콘 정체를 서명 ↔ 이름 조인표에 댄다.** 인스턴스 치환 «뒤에» 돌린다 — 셸 안으로
    // 사라진 글리프는 payload 에 나오지 않으므로 이름을 붙일 일도 없다.
    const glyphs = applyGlyphIdentity(spec, `${screen.route} @ ${context.id}`);
    totalGlyphs += glyphs;
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
      frameSize: [round(measured.rootRect.width), round(measured.rootRect.height)],
      shells,
      stats: {
        measured: stats.total,
        kept: stats.kept,
        droppedInvisible: stats.droppedInvisible,
        droppedEmpty: stats.droppedEmpty,
        unresolved: stats.unresolved,
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
  const measuredDesktop = fixture.screens[desktopContext] ?? {};
  const signatureOf = (route, path) => {
    const nodes = (measuredDesktop[route]?.tree ?? [])
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
    if (source && measuredDesktop[source] && signatureOf(source, sidebar.path) !== signature) {
      fail(
        `${entry.route} 가 ${sidebar.variant} 를 받았지만 사이드바 서브트리가 그 variant 의 출처 ${source} 와 다릅니다. ` +
        "활성 항목이 다른 화면입니다 — PRODUCT_CURRENT_PATH 를 제품 <Gnb currentPath> 와 대조하세요.",
      );
    }
  }
}

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
const template = readFileSync(templatePath, "utf8");
const manifest = [];
for (const entry of screens) {
  const slimSpec = slim(entry.spec);
  const { head, chunks } = splitSpec(slimSpec);
  // **파일명에 위험한 글자를 남기지 않는다.** 화면 키는 이제 route가 아니라 상태라서
  // `?`·`[`·`]`가 들어올 수 있다(`/highlight/[projectId]?__phase=upload`). 셸 글롭이 대괄호를
  // 문자 클래스로, `?`를 한 글자 와일드카드로 읽으므로 `figma/app-screens.*`를 다루는 명령이
  // 조용히 빗나간다. 점도 뺀다 — 파일명 구획자(`app-screens.<slug>.<문맥>.<번호>.draw.js`)다.
  // 지금 SCREENS 12개의 키는 `[a-z-]`뿐이라 결과가 한 글자도 바뀌지 않는다.
  const slug = entry.route.replace(/^\//, "").replace(/\//g, "-")
    .replace(/[^A-Za-z0-9_-]+/g, "-")
    + "." + (entry.context.startsWith("desktop") ? "desktop" : "mobile");
  const files = [];

  const emit = (index, payload) => {
    const name = `figma/app-screens.${slug}.${String(index).padStart(2, "0")}.draw.js`;
    const draw =
      `// Generated by scripts/build-figma-app-screens.mjs. Do not edit by hand.\n` +
      `// ${entry.route} · ${entry.context} · 조각 ${index}/${chunks.length}\n` +
      `// 조각 00을 먼저 돌리고 나머지를 번호 순서대로 use_figma에 넘긴다.\n` +
      `const P=${JSON.stringify(payload)};\n${template}`;
    const bytes = Buffer.byteLength(draw);
    if (bytes > 50_000) fail(`조각이 50,000 바이트를 넘었습니다: ${name} = ${bytes}`);
    outputs.push({ absolute: resolve(repoRoot, name), expected: draw });
    files.push({ file: name, bytes });
  };

  // 조각 0: 프레임 껍데기 + head. 이후 조각들은 path로 자리표시를 찾아 채운다.
  emit(0, { route: entry.route, context: entry.context, frameId: entry.figmaFrameId,
            frameSize: entry.frameSize, head });
  // 조각은 **조상 먼저** 나가야 한다. `splitSpec`은 깊은 곳부터 떼어내므로 push 순서대로 돌리면
  // 아직 자리표시로 남아 있는 조상 안쪽을 찾으려다 실패한다(실측: `/mypage/upgrade` desktop 등 4화면).
  // 경로 길이 오름차순이면 조상이 항상 먼저이고, 형제끼리는 원래 순서를 유지한다.
  const ordered = chunks
    .map((chunk, index) => ({ chunk, index }))
    .sort((a, b) => a.chunk.path.length - b.chunk.path.length || a.index - b.index);
  ordered.forEach(({ chunk }, index) => {
    emit(index + 1, { route: entry.route, context: entry.context, frameId: entry.figmaFrameId,
                      path: chunk.path, spec: chunk.spec });
  });

  manifest.push({ route: entry.route, context: entry.context, frameId: entry.figmaFrameId,
                  chunkCount: files.length, files });
}
plan.runners = manifest;
// plan 갱신 후 다시 직렬화해야 manifest가 담긴다.
outputs[0] = { absolute: planPath, expected: `${JSON.stringify(plan, null, 2)}\n` };

// **더 이상 내지 않는 런너는 지운다.** 조각 수는 spec이 바뀌면 줄어드는데, 남은 옛 파일은
// `--check`가 잡지 못한다(검사는 "내야 할 것"만 본다). 실측 사고: 셸을 인스턴스로 바꿔 조각이
// 7→6으로 줄자 `settings.desktop.06`이 남았고, 그게 05와 같은 path를 들고 있어 중복처럼 보였다.
const wanted = new Set(outputs.map((output) => output.absolute));
const orphans = readdirSync(resolve(repoRoot, "figma"))
  .filter((name) => /^app-screens\..+\.\d\d\.draw\.js$/.test(name))
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
  `${screens.length} screens · ${totalNodes} nodes · UNRESOLVED ${totalUnresolved} · 인스턴스 ${totalShells}(공백 ${totalShellGaps}) · 아이콘 ${totalGlyphs} · 면 ${paintStats.fills}+${paintStats.gradients}g/${paintStats.strokes}/${paintStats.radii}/${paintStats.shadows} · 텍스트 ${paintStats.textStyled}/${paintStats.texts} 스타일 매칭 · 런너 ${SCREENS.length}개`,
);
