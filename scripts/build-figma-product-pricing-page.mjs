import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { transformSync } from "esbuild";
import { atomicWriteBatch } from "./lib/atomic-output.mjs";
import { loadProductSceneEvidence } from "./lib/product-scene-evidence.mjs";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const planPath = resolve(repoRoot, "figma/product-pricing-page.plan.json");
const templatePath = resolve(repoRoot, "scripts/templates/figma-product-pricing-renderer.js");
const checkOnly = process.argv.includes("--check");
// 생성물을 그냥 읽지 않는다 — **어느 제품 커밋의 증거인지 확인하고 읽는다.**
// scripts/lib/product-scene-evidence.mjs 에 사유가 있다.
const evidence = loadProductSceneEvidence("figma-product-pricing-page");
const template = readFileSync(templatePath, "utf8");
const fail = (message) => { throw new Error(`[figma-product-pricing-page] ${message}`); };
const px = (value) => Number(/^(-?[\d.]+)px$/.exec(value ?? "")?.[1] ?? 0);
const transparent = (value) => !value || value === "transparent" || value === "rgba(0, 0, 0, 0)";
const contexts = [
  { id: "desktop-1920x1080", viewport: "Desktop" },
  { id: "mobile-402x874", viewport: "Mobile" },
];
// **회색 램프는 손으로 적지 않고 LOUIS 에서 유도한다(2026-09-10).**
// 이 표는 원래 열 칸을 리터럴로 들고 있었는데, 그 값들은 LOUIS 가 SEED/TDS 로 recolor 하면서
// 여덟 칸이 움직였다(예: gray-800 `#313640` → `#2b2f36`). 표가 램프의 **사본**인 한 램프가
// 움직일 때마다 「unmapped measured color」로 멈추고, 그때 항목을 하나씩 더하면 같은 색이
// 두 벌 남는다. 정본에서 읽으면 그 부류가 통째로 사라진다.
//
// 알파가 섞인 것들은 램프에서 나오지 않으므로(제품이 `rgb(...)/x%` 로 조립한다) 그대로 둔다.
// 제품이 램프 칸에 실제로 씌우는 알파. 새 값이 나오면 「unmapped」로 멈추므로 여기 더한다 —
// 조용히 근사하지 않는다. 값은 실측에서 왔다.
const RAMP_ALPHAS = [0.88, 0.72, 0.64, 0.56, 0.48, 0.4, 0.32, 0.24, 0.16, 0.12, 0.1, 0.08, 0.04];
const rampCss = readFileSync(resolve(repoRoot, "packages/css/generated/tokens.css"), "utf8");
const rampBindings = {};
for (const match of rampCss.matchAll(
  /--louis-color-palette-gray-(\d+):\s*color\(srgb ([\d.]+) ([\d.]+) ([\d.]+)(?: ?\/ ?[\d.]+)?\);/g,
)) {
  const [r, g, b] = match.slice(2, 5).map((n) => Math.round(Number(n) * 255));
  rampBindings[`rgb(${r}, ${g}, ${b})`] = `gray${match[1]}`;
  // 제품은 같은 칸을 알파와 함께도 쓴다(`rgb(var(--…-rgb)/88%)`). 램프 칸마다 실제로
  // 나타나는 알파를 함께 등록해 「같은 색인데 알파만 다르다」로 멈추지 않게 한다.
  // 이름은 `gray700a88` 꼴로, 아래 손으로 적은 알파 항목과 같은 규칙이다.
  for (const alpha of RAMP_ALPHAS) {
    rampBindings[`rgba(${r}, ${g}, ${b}, ${alpha})`] =
      `gray${match[1]}a${String(Math.round(alpha * 100)).padStart(2, "0")}`;
  }
}
if (Object.keys(rampBindings).length < 10) {
  fail(`LOUIS 회색 램프를 읽지 못했습니다(${Object.keys(rampBindings).length}칸). tokens.css 형식이 바뀌었는지 보세요.`);
}
const colorBindings = {
  ...rampBindings,
  "rgb(0, 198, 142)": "mint500",
  "rgba(154, 160, 171, 0.9)": "gray500a90",
  "rgba(0, 0, 0, 0.74)": "blackA74",
  "rgba(23, 27, 34, 0.12)": "gray900a12",
  "rgba(23, 27, 34, 0.1)": "gray900a10",
  "rgba(23, 27, 34, 0.08)": "gray900a08",
  "rgba(0, 0, 0, 0.05)": "blackA05",
  "rgba(0, 0, 0, 0.12)": "blackA12",
  "rgba(0, 0, 0, 0.45)": "blackA45",
  "rgba(154, 160, 171, 0.14)": "gray500a14",
  "rgb(0, 122, 255)": "$brandBlueFixed",
  "rgb(0, 0, 0)": "gray1000",
};
// **표기를 먼저 맞춘다.** 같은 색이 브라우저에서 `rgb(23, 27, 34)` 로도 오고
// `color(srgb 0.090196 0.105882 0.133333)` 로도 온다 — 값이 `color-mix()` 나 LOUIS 토큰을
// 거치면 후자가 된다. 2026-09-10 재고정에서 이 표기로 오는 색이 18종이었고, 표에 항목을
// 하나씩 더하면 **같은 색이 표에 두 벌** 생기고 다음 표기 변화에 또 깨진다. 그래서 조회 전에
// `rgb()`/`rgba()` 한 형태로 접는다. 표는 그대로 rgb 표기 하나만 안다.
const srgbToRgb = (value) => {
  const match = /^color\(srgb ([\d.]+) ([\d.]+) ([\d.]+)(?: ?\/ ?([\d.]+))?\)$/.exec(value);
  if (!match) return value;
  const [r, g, b] = match.slice(1, 4).map((n) => Math.round(Number(n) * 255));
  const alpha = match[4];
  return alpha === undefined || Number(alpha) === 1
    ? `rgb(${r}, ${g}, ${b})`
    : `rgba(${r}, ${g}, ${b}, ${Number(alpha)})`;
};
const colorKey = (rawValue) => {
  const value = srgbToRgb(rawValue);
  if (transparent(value)) return null;
  return colorBindings[value] ?? fail(`unmapped measured color ${rawValue}` +
    (value === rawValue ? "" : ` (정규화: ${value})`));
};
const rel = (rect, root) => ({
  x: rect.x - root.x,
  y: rect.y - root.y,
  width: rect.width,
  height: rect.height,
});
const corners = (style) => [
  px(style.borderTopLeftRadius), px(style.borderTopRightRadius),
  px(style.borderBottomRightRadius), px(style.borderBottomLeftRadius),
];
const borderSpec = (style) => ["Top", "Right", "Bottom", "Left"].map((side) => ({
  width: px(style[`border${side}Width`]),
  color: px(style[`border${side}Width`]) ? colorKey(style[`border${side}Color`]) : null,
}));
const effectSpec = (rawValue) => {
  // 색과 같은 이유로 그림자도 `color(srgb …)` 로 온다(위 srgbToRgb 주석). 파서가 `rgba?()`
  // 만 알므로 **먼저 접는다** — 정규식에 srgb 갈래를 더하면 같은 형태를 두 벌 알게 된다.
  const value = typeof rawValue === "string"
    ? rawValue.replace(/color\(srgb [\d. /]+\)/g, (m) => srgbToRgb(m))
    : rawValue;
  if (!value || value === "none") return [];
  const matches = [...value.matchAll(/(rgba?\([^)]*\))\s+(-?[\d.]+)px\s+(-?[\d.]+)px\s+(-?[\d.]+)px\s+(-?[\d.]+)px(?:\s+(inset))?/g)];
  if (!matches.length) fail(`unsupported measured shadow ${value}`);
  return matches.map((match) => ({
    type: match[6] === "inset" ? "INNER_SHADOW" : "DROP_SHADOW",
    color: match[1],
    x: Number(match[2]), y: Number(match[3]), blur: Number(match[4]), spread: Number(match[5]),
  }));
};
const directChildren = (tree, rootPath) => tree.filter((entry) =>
  entry.path.startsWith(`${rootPath}.`) && entry.path.split(".").length === rootPath.split(".").length + 1);
const ancestorPaths = (path) => {
  const parts = path.split(".");
  return parts.map((_, index) => parts.slice(0, index + 1).join("."));
};

const makeContext = ({ id, viewport }) => {
  const page = evidence.pages[id]?.["/pricing"] ?? fail(`missing ${id} /pricing`);
  // **883 → 1160 (2026-09-10 재고정 5a67d692 → 91e5ea2a).** 요금제가 넷에서 다섯이 되며
  // 플랜 카드와 비교 열이 각각 하나씩 늘었고, 그 사이 286커밋의 문구·구조 변경이 얹혔다.
  // 이 수는 「같은 페이지인가」를 보는 것이지 값이 아니다 — 아래 반복 뿌리 수(플랜 5 · 팩 3 ·
  // 비교 5 · FAQ 7)가 실제 계약이고, 그 넷이 맞는지가 이 수보다 강한 확인이다.
  if (page.tree.length !== 1160) fail(`${id} pricing tree must have 1160 nodes, got ${page.tree.length}`);
  // 높이 실측(91e5ea2a): Desktop 4615.2969 → **4242.1563**, Mobile 5097.9063 → **5354.6719**.
  // 데스크톱은 줄고 모바일은 늘었다 — 플랜이 다섯이 되며 데스크톱은 한 줄에 더 눕고
  // 모바일은 세로로 한 장 더 쌓이기 때문이다. 폭은 둘 다 그대로다(1920 · 402).
  if ((viewport === "Desktop" && (page.main.width !== 1920 || page.main.height !== 4242.1563)) ||
      (viewport === "Mobile" && (page.main.width !== 402 || page.main.height !== 5354.6719))) {
    fail(`${id} pricing page geometry drift`);
  }
  const tree = page.tree;
  const byPath = new Map(tree.map((entry) => [entry.path, entry]));
  const isVisible = (entry) => ancestorPaths(entry.path).every((path) => {
    const ancestor = byPath.get(path);
    return !ancestor || (ancestor.style.display !== "none" && Number(ancestor.style.opacity) !== 0 && ancestor.rect.width > 0 && ancestor.rect.height > 0);
  });
  const hasSvgAncestor = (entry, rootPath) => ancestorPaths(entry.path)
    .filter((path) => path !== entry.path && path !== rootPath)
    .some((path) => byPath.get(path)?.tag === "svg");
  const iconKind = (entry) => {
    if (entry.style.maskImage?.includes("/icons/CheckCircle.svg")) return "featureCheck";
    if (entry.tag === "img" && entry.src === "/klipse-light.svg") return "headerLogo";
    if (entry.tag !== "svg") return null;
    const descendants = tree.filter((node) => node.path.startsWith(`${entry.path}.`));
    const paths = descendants.map((node) => node.vector?.d).filter(Boolean);
    if (descendants.some((node) => node.tag === "circle")) return "globe";
    if (paths.some((value) => value.startsWith("M213.85,125.46"))) return "bolt";
    if (paths.some((value) => value.startsWith("M5 12.5L10 17.5"))) return "tableCheck";
    if (paths.some((value) => value.startsWith("M176,32H80"))) return "instagram";
    if (paths.some((value) => value.startsWith("M23.498 6.186"))) return "youtube";
    if (entry.vector?.viewBox === "0 0 73 28") return "footerLogo";
    // 2026-09-10 재고정에서 새로 나타났다 — 공개 GNB 에 테마 전환 버튼이 생겼고(`Theme: System`)
    // 그 안의 모니터 글리프다(`components/theme/ThemeIcons.tsx`). 첫 서브패스로 집는다:
    // 화면 사각형이라 다른 아이콘과 겹치지 않는다.
    if (paths.some((value) => value.startsWith("M2.625 10.5L11.375"))) return "themeMonitor";
    // FAQ 아코디언의 ＋ 글리프. 가로선·세로선 두 path 뿐이라 둘을 함께 봐야 유일하다 —
    // 가로선만 보면 다른 구분선과 겹친다.
    if (paths.some((value) => value.startsWith("M3.75 12H20.25")) &&
        paths.some((value) => value.startsWith("M12 3.75V20.25"))) return "faqPlus";
    return fail(`unclassified measured SVG ${id} ${entry.path}`);
  };
  const textSpecs = (entries, root) => entries.filter((entry) => entry.ownText).flatMap((entry) => {
    const lineHeight = px(entry.style.lineHeight);
    const lines = entry.ownTextLines?.length ? entry.ownTextLines : [{ text: entry.ownText, ...entry.rect }];
    const parentPath = entry.path.split(".").slice(0, -1).join(".");
    const parent = byPath.get(parentPath);
    const align = entry.style.textAlign === "center" ? "CENTER" : entry.style.textAlign === "right" ? "RIGHT" : "LEFT";
    return lines.map((line, index) => ({
      name: `${entry.path} · line ${index + 1}`,
      text: line.text,
      rect: {
        x: (align === "LEFT" ? line.x : align === "RIGHT" && parent ? parent.rect.x : entry.rect.x) - root.rect.x,
        y: line.y - root.rect.y,
        width: align === "LEFT"
          ? Math.max(0, (parent?.rect.x ?? entry.rect.x) + (parent?.rect.width ?? entry.rect.width) - line.x)
          : align === "RIGHT" && parent
            ? entry.rect.x + entry.rect.width - parent.rect.x
            : entry.rect.width,
        height: lineHeight || line.height,
      },
      fontSize: px(entry.style.fontSize),
      fontWeight: Number(entry.style.fontWeight),
      lineHeight: lineHeight || line.height,
      letterSpacing: entry.style.letterSpacing === "normal" ? 0 : px(entry.style.letterSpacing),
      align,
      color: colorKey(entry.style.color),
    }));
  });
  const shapeSpecs = (entries, root) => entries.filter((entry) => {
    if (entry.path === root.path || entry.tag === "svg" || entry.tag === "img" || hasSvgAncestor(entry, root.path)) return false;
    const style = entry.style;
    return !transparent(style.backgroundColor) || borderSpec(style).some((side) => side.width) || style.boxShadow !== "none";
  }).map((entry) => ({
    name: entry.path,
    rect: rel(entry.rect, root.rect),
    fill: colorKey(entry.style.backgroundColor),
    corners: corners(entry.style),
    borders: borderSpec(entry.style),
    effects: effectSpec(entry.style.boxShadow),
  })).sort((a, b) => (b.rect.width * b.rect.height) - (a.rect.width * a.rect.height));
  const iconSpecs = (entries, root) => entries.filter((entry) =>
    isVisible(entry) && (entry.tag === "svg" || entry.tag === "img" || entry.style.maskImage?.includes("/icons/CheckCircle.svg")))
    .filter((entry) => !hasSvgAncestor(entry, root.path))
    .map((entry) => ({ name: entry.path, kind: iconKind(entry), rect: rel(entry.rect, root.rect) }));
  const flatten = (rootPath, setName, variantName) => {
    const root = byPath.get(rootPath) ?? fail(`missing ${id} root ${rootPath}`);
    if (!isVisible(root)) fail(`component root is not visible ${id} ${rootPath}`);
    const entries = tree.filter((entry) =>
      (entry.path === rootPath || entry.path.startsWith(`${rootPath}.`)) && isVisible(entry));
    return {
      setName, variantName, viewport, sourcePath: rootPath,
      rect: { width: root.rect.width, height: root.rect.height },
      root: {
        fill: colorKey(root.style.backgroundColor),
        corners: corners(root.style),
        borders: borderSpec(root.style),
        effects: effectSpec(root.style.boxShadow),
      },
      shapes: shapeSpecs(entries, root),
      texts: textSpecs(entries, root),
      icons: iconSpecs(entries, root),
    };
  };
  // 제품 실측(91e5ea2a). 2026-09-10 에 Trial·Basic·Pro·Max 에서 다섯으로 바뀌었다 —
  // 장이 하나 늘고 이름 셋이 갈렸다. 이 배열의 길이와 순서는 `planRoots` 의 DOM 순서와
  // 짝이 맞아야 한다(measure-product-scenes 의 카드 수 검사가 그 짝을 지킨다).
  const planNames = ["Trial", "Lite", "Plus", "Pro", "Ultra"];
  const packNames = ["Bronze", "Silver", "Gold"];
  const navRoots = ["main.1"];
  const planRoots = page.tierCards.map((card) => tree.find((entry) =>
    entry.tag === "article" && entry.rect.x === card.x && entry.rect.y === card.y)?.path ?? fail(`missing ${id} tier ${card.name}`));
  const packRoots = directChildren(tree, "main.2.0.0.3.1").map((entry) => entry.path);
  const comparisonRoots = directChildren(tree, "main.2.0.0.4.1.0").map((entry) => entry.path);
  const faqRoots = directChildren(tree, "main.2.1.0.0.1").map((entry) => entry.path);
  // 플랜과 비교 열이 넷에서 **다섯**으로 늘었고(Trial·Lite·Plus·Pro·Ultra), FAQ 가 일곱에서
  // **열하나**로 늘었다. 팩 셋만 그대로다. FAQ 열하나는 제품 i18n 과 글자로 대조했다 —
  // ko.ts 의 가격 문맥 `q:` 가 정확히 열하나이고 목록도 측정과 같다(무료 시작 · 크레딧 차감 ·
  // 소진 · 결제 주기 · 잔여 확인 · 취소 · 모델 · 이월 · 상업 이용 · 환불 · 팀).
  // planNames 의 길이·순서가 planRoots 와 짝이 맞아야 한다.
  if (planRoots.length !== 5 || packRoots.length !== 3 || comparisonRoots.length !== 5 || faqRoots.length !== 11) {
    fail(`${id} repeated root count drift: plans=${planRoots.length} packs=${packRoots.length} compare=${comparisonRoots.length} faq=${faqRoots.length}`);
  }
  const groups = [
    ...navRoots.map((path) => flatten(path, "Product/Public Global Navigation", `Viewport=${viewport}`)),
    ...planRoots.map((path, index) => flatten(path, "Product/Pricing Plan Card", `Plan=${planNames[index]}, Viewport=${viewport}`)),
    ...packRoots.map((path, index) => flatten(path, "Product/Pricing Credit Pack", `Pack=${packNames[index]}, Viewport=${viewport}`)),
    ...comparisonRoots.map((path, index) => flatten(path, "Product/Pricing Compare Column", `Plan=${planNames[index]}, Viewport=${viewport}`)),
    ...faqRoots.map((path, index) => flatten(path, "Product/Pricing FAQ Item", `Item=${String(index + 1).padStart(2, "0")}, Viewport=${viewport}`)),
    flatten("main.3", "Product/Public Footer", `Viewport=${viewport}`),
  ];
  const groupedRoots = groups.map((group) => group.sourcePath);
  const insideGroup = (entry) => groupedRoots.some((path) => entry.path === path || entry.path.startsWith(`${path}.`));
  const sceneRoot = byPath.get("main");
  const directTexts = textSpecs(tree.filter((entry) => isVisible(entry) && !insideGroup(entry)), sceneRoot);
  const placements = groups.map((group) => {
    const root = byPath.get(group.sourcePath);
    return {
      setName: group.setName,
      variantName: group.variantName,
      x: root.rect.x,
      y: root.rect.y,
      width: root.rect.width,
      height: root.rect.height,
    };
  });
  return {
    id, viewport, width: page.main.width, height: page.main.height,
    fill: colorKey(sceneRoot.style.backgroundColor),
    groups, directTexts, placements,
  };
};

const builtContexts = contexts.map(makeContext);
const allGroups = builtContexts.flatMap((context) => context.groups);
const bindings = {
  paletteCollection: "1 · Palette", paletteMode: "default",
  semanticCollection: "2 · Semantic", semanticMode: "landing-light",
  primitiveCollection: "Klipse Primitive", primitiveMode: "Base",
  gray000: { collection: "1 · Palette", name: "palette/gray-000" },
  gray100: { collection: "1 · Palette", name: "palette/gray-100" },
  gray200: { collection: "1 · Palette", name: "palette/gray-200" },
  gray400: { collection: "1 · Palette", name: "palette/gray-400" },
  gray500: { collection: "1 · Palette", name: "palette/gray-500" },
  gray600: { collection: "1 · Palette", name: "palette/gray-600" },
  gray700: { collection: "1 · Palette", name: "palette/gray-700" },
  gray800: { collection: "1 · Palette", name: "palette/gray-800" },
  gray900: { collection: "1 · Palette", name: "palette/gray-900" },
  gray1000: { collection: "1 · Palette", name: "palette/gray-1000" },
  mint500: { collection: "1 · Palette", name: "accent/mint/500" },
  gray500a90: { collection: "2 · Semantic", name: "palette/gray-500 · a90" },
  blackA74: { collection: "2 · Semantic", name: "gray/000 · a74" },
  gray900a12: { collection: "2 · Semantic", name: "palette/gray-900 · a12" },
  gray900a10: { collection: "2 · Semantic", name: "gray/900 · a10" },
  gray900a08: { collection: "2 · Semantic", name: "gray/900 · a8" },
  blackA05: { collection: "2 · Semantic", name: "gray/000 · a5" },
  blackA12: { collection: "2 · Semantic", name: "gray/000 · a12" },
  blackA45: { collection: "2 · Semantic", name: "gray/000 · a45" },
  gray500a14: { collection: "2 · Semantic", name: "app/nav-chip-tint" },
};
const base = {
  schemaVersion: 1,
  productCommit: evidence.productCommit,
  evidence: "migration/product.scenes.json#/pages/*/~1pricing/tree",
  pageId: "240:3529",
  pageName: "90 · ASSETS — 출처별 (logo · tile · icon · root · .glyph · .authored)",
  sectionName: "P · product/Pricing · measured full-page components and scenes",
  bindings,
  dependencies: { featureCheckId: "61:388", headerLogoId: "57:10", footerLogoId: "208:1887" },
};
const comparisonGroups = (viewport) =>
  allGroups.filter((group) =>
    group.setName === "Product/Pricing Compare Column" && group.viewport === viewport);
const phases = {
  shell: { ...base, phase: "components", groups: allGroups.filter((group) => ["Product/Public Global Navigation", "Product/Public Footer"].includes(group.setName)) },
  planDesktop: { ...base, phase: "components", groups: allGroups.filter((group) => group.setName === "Product/Pricing Plan Card" && group.viewport === "Desktop") },
  planMobile: { ...base, phase: "components", groups: allGroups.filter((group) => group.setName === "Product/Pricing Plan Card" && group.viewport === "Mobile") },
  credit: { ...base, phase: "components", groups: allGroups.filter((group) => group.setName === "Product/Pricing Credit Pack") },
  faq: { ...base, phase: "components", groups: allGroups.filter((group) => group.setName === "Product/Pricing FAQ Item") },
  // **비교 열은 한 조각에 하나씩 낸다.** 예전에는 2·2 로 둘씩 묶었는데, 요금제가 다섯이 되며
  // 열 하나가 커져 **두 열만으로도 50KB 상한을 넘었다**(54,253 bytes). 상한은 `use_figma` 가
  // 한 번에 받는 코드 크기라 조각 수는 늘어도 되고 크기는 안 된다. 열마다 하나면 플랜이 또
  // 늘어도 여기서 다시 걸리지 않는다 — 조각 이름은 아래 `comparisonChunks` 가 만든다.
  ...Object.fromEntries(
    ["Desktop", "Mobile"].flatMap((viewport) =>
      comparisonGroups(viewport).map((group, index) => [
        `comparison${viewport}${index}`,
        { ...base, phase: "components", groups: [group] },
      ])),
  ),
  scenes: {
    ...base, phase: "scenes", sceneSetName: "Product/Pricing Full Page",
    scenes: builtContexts.map(({ groups: _groups, ...scene }) => scene),
  },
};
const runner = (phase) => {
  const wrapped = transformSync(`async function __figmaRunner__(){const PLAN=${JSON.stringify(phases[phase])};\n${template}}`, {
    loader: "js", minify: true, legalComments: "none", target: "es2022",
  }).code.trim();
  const prefix = "async function __figmaRunner__(){";
  if (!wrapped.startsWith(prefix) || !wrapped.endsWith("}")) fail(`unexpected ${phase} runner wrapper`);
  return `// Generated by scripts/build-figma-product-pricing-page.mjs (${phase}). Do not edit by hand.\n${wrapped.slice(prefix.length, -1)}`;
};
const outputs = [
  { absolute: planPath, expected: `${JSON.stringify({ ...base, contexts: builtContexts }, null, 2)}\n` },
  { absolute: resolve(repoRoot, "figma/product-pricing-shell.draw.js"), expected: runner("shell") },
  { absolute: resolve(repoRoot, "figma/product-pricing-plan-desktop.draw.js"), expected: runner("planDesktop") },
  { absolute: resolve(repoRoot, "figma/product-pricing-plan-mobile.draw.js"), expected: runner("planMobile") },
  { absolute: resolve(repoRoot, "figma/product-pricing-credit.draw.js"), expected: runner("credit") },
  { absolute: resolve(repoRoot, "figma/product-pricing-faq.draw.js"), expected: runner("faq") },
  // 비교 열 조각 — 열 하나당 파일 하나(`…-desktop-1.draw.js` 꼴). 열 수가 바뀌면 파일 수도
  // 따라 바뀐다. 옛 `-a`/`-b` 두 파일은 이 회차에서 사라진다.
  ...["Desktop", "Mobile"].flatMap((viewport) =>
    comparisonGroups(viewport).map((_group, index) => ({
      absolute: resolve(repoRoot,
        `figma/product-pricing-comparison-${viewport.toLowerCase()}-${index + 1}.draw.js`),
      expected: runner(`comparison${viewport}${index}`),
    }))),
  { absolute: resolve(repoRoot, "figma/product-pricing-scenes.draw.js"), expected: runner("scenes") },
];
for (const { absolute, expected } of outputs) {
  if (absolute.endsWith(".draw.js") && Buffer.byteLength(expected) > 50_000) {
    fail(`${absolute.split("/").at(-1)} exceeds 50,000 bytes: ${Buffer.byteLength(expected)}`);
  }
}
if (checkOnly) {
  for (const { absolute, expected } of outputs) {
    let current;
    try { current = readFileSync(absolute, "utf8"); } catch { fail(`missing generated output ${absolute}`); }
    if (current !== expected) fail(`generated output drift ${absolute}`);
  }
} else {
  atomicWriteBatch(outputs);
}
console.log(`[figma-product-pricing-page] ${checkOnly ? "checked" : "built"}: ${builtContexts.map((entry) => `${entry.viewport} ${entry.width}×${entry.height}`).join(" · ")}`);
