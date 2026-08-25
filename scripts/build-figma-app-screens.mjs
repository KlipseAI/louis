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

import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { atomicWriteBatch } from "./lib/atomic-output.mjs";
import { normalizeAuthFixtureTree, toFigmaTreeSpec } from "./lib/figma-tree-spec.mjs";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const fixturePath = resolve(repoRoot, "migration/product.auth-fixture.json");
const planPath = resolve(repoRoot, "figma/app-screens.plan.json");
const templatePath = resolve(repoRoot, "scripts/templates/figma-app-screens-renderer.js");
const checkOnly = process.argv.includes("--check");
const fail = (message) => { throw new Error(`[figma-app-screens] ${message}`); };

const fixture = JSON.parse(readFileSync(fixturePath, "utf8"));

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
];

const CONTEXTS = [
  { id: "desktop-1920x1080", key: "desktop" },
  { id: "mobile-402x874", key: "mobile" },
];

/** 런너 payload를 줄이기 위한 축약. 키가 길면 50KB 상한에 금방 닿는다. */
const slim = (node) => ({
  t: node.tag,
  ...(node.text ? { x: node.text } : {}),
  r: [round(node.rect.width), round(node.rect.height)],
  s: node.sizing.layoutSizingHorizontal[0] + node.sizing.layoutSizingVertical[0],
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
    ],
  } : {}),
  ...(node.clipsContent ? { c: 1 } : {}),
  ...(node.children.length ? { k: node.children.map(slim) } : {}),
});
const round = (value) => Math.round((value ?? 0) * 100) / 100;

const screens = [];
const outputs = [];
let totalNodes = 0;
let totalUnresolved = 0;

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
    totalNodes += stats.kept;
    totalUnresolved += stats.unresolved.length;

    screens.push({
      route: screen.route,
      context: context.id,
      figmaFrameId: screen[context.key],
      frameSize: [round(measured.rootRect.width), round(measured.rootRect.height)],
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

const plan = {
  $comment: "Generated by scripts/build-figma-app-screens.mjs. Do not edit by hand.",
  $evidenceClass: "development-auth-fixture 측정 기반 Figma Auto Layout 화면 — 운영 세션·실데이터 parity 아님",
  $why: "측정 픽셀을 박지 않고 크기 출처(FILL/HUG/FIXED/ABSOLUTE)로 조립하므로 프레임을 리사이즈하면 제품처럼 반응한다.",
  productCommit: fixture.productCommit,
  figmaFileKey: "OlYKERKOkgbxBEEoXGZW2c",
  screenCount: screens.length,
  totalNodes,
  totalUnresolved,
  screens,
};

outputs.push({ absolute: planPath, expected: `${JSON.stringify(plan, null, 2)}\n` });

// route별 런너. 한 파일에 다 담으면 connector 50KB 상한을 넘는다.
const template = readFileSync(templatePath, "utf8");
for (const screen of SCREENS) {
  const parts = screens.filter((entry) => entry.route === screen.route);
  const payload = parts.map((entry) => ({
    route: entry.route,
    context: entry.context,
    frameId: entry.figmaFrameId,
    frameSize: entry.frameSize,
    spec: slim(entry.spec),
  }));
  const slug = screen.route.replace(/^\//, "").replace(/\//g, "-");
  const draw =
    `// Generated by scripts/build-figma-app-screens.mjs. Do not edit by hand.\n` +
    `// ${screen.route} — use_figma에 이 파일 내용을 그대로 넘긴다.\n` +
    `const PLAN=${JSON.stringify(payload)};\n${template}`;
  const bytes = Buffer.byteLength(draw);
  if (bytes > 50_000) fail(`런너가 50,000 바이트를 넘었습니다: app-screens.${slug}.draw.js = ${bytes}`);
  outputs.push({ absolute: resolve(repoRoot, `figma/app-screens.${slug}.draw.js`), expected: draw });
}

if (checkOnly) {
  for (const output of outputs) {
    let current = "";
    try { current = readFileSync(output.absolute, "utf8"); }
    catch { fail(`생성물이 없습니다: ${output.absolute.slice(repoRoot.length + 1)}`); }
    if (current !== output.expected) fail(`생성물이 다릅니다: ${output.absolute.slice(repoRoot.length + 1)}`);
  }
} else {
  atomicWriteBatch(outputs);
}

console.log(
  `[figma-app-screens] ${checkOnly ? "checked" : "built"} @ ${fixture.productCommit.slice(0, 8)}: ` +
  `${screens.length} screens · ${totalNodes} nodes · UNRESOLVED ${totalUnresolved} · 런너 ${SCREENS.length}개`,
);
