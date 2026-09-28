#!/usr/bin/env node
// **제품 인라인 SVG 글리프 → Figma 제품 컴포넌트 세트(`Product/…`) 생성기.**
//
// ## 왜 있는가
//
// 표면 원장(`migration/product.surfaces.json`)의 `needed` 가운데 스무 건 남짓이 제품 `.tsx` 안에 인라인으로 그린
// `<svg>` 글리프다(저장 클라우드 셋 · 테마 셋 · 지구본 · 엔터 키 · 모바일 액션 바 …). 파일이 없어(`public/` 에 없다)
// 90 ASSETS 에는 `.glyph/` 추출본만 있었고, 그 추출본은 「소스 줄 대조로만 검증」하는 비공개 자산이라 표면 대응이
// 될 수 없었다. 소유자 결정(DS-D-0071 · 2026-09-26 「Figma 먼저, 생성기로 묶어서」)대로 제품 전용 부품을 Figma
// 제품 컴포넌트로 세우되, **손으로 옮기지 않고 제품 앵커의 원본을 기계로 옮긴다.**
//
// ## 무엇을 하는가
//
//   1. 제품 앵커(`migration/product-evidence.lock.json` 의 productCommit)에서 파일을 읽어 TypeScript 파서로 푼다.
//   2. 표면(`<파일>#<이름>`)의 정의를 찾아 첫 `<svg>` 를 SVG 문자열로 옮긴다 — JSX 속성 이름(camelCase)을 SVG 이름으로,
//      같은 파일의 상수 객체 펼침(`{...STROKE}`)을 풀어서, 같은 파일의 래퍼 컴포넌트(`<Glyph {...p}>…</Glyph>`)는 그
//      래퍼의 `<svg>` 에 자식을 끼워서, 매개변수 기본값(`size = 22`)을 대입해서. 옮길 수 없는 식이 있으면 멈춘다.
//   3. `currentColor` 는 검정으로 바꿔 싣고, 렌더러가 그 칠을 잉크 변수(`color/gray/000`, `.glyph/` 마스터와 같은 값 —
//      조립 규칙 21조)에 묶는다. 제품에서는 소비처의 글자 색이 칠한다.
//   4. 계획(`figma/product-glyphs.plan.json`)에 세트 · variant · SVG · 원본 줄 인용 · SVG 해시를 싣고, 러너
//      (`figma/product-glyphs.draw.js`)가 90 ASSETS 의 섹션 하나에 세트를 세운다(다시 돌리면 variant 안을 갈아 끼운다).
//
// `--check` 는 다시 뽑아 커밋된 계획 · 러너와 바이트 단위로 대조한다(제품 저장소가 필요하다 — verify:product 갈래).
// 계획의 `setName` 이 표면 원장 `figma` 칸의 제품 세트 어휘가 된다(DS-D-0071, `check-figma-surface-coverage`).
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { transformSync } from "esbuild";
import ts from "typescript";
import { atomicWriteBatch } from "./lib/atomic-output.mjs";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const productRoot = process.env.KLIPSE_PRODUCT_REPO ?? "/Users/sejunki/klipse-web";
const lock = JSON.parse(readFileSync(resolve(repoRoot, "migration/product-evidence.lock.json"), "utf8"));
const productCommit = lock.productCommit;
const checkOnly = process.argv.includes("--check");
const planPath = resolve(repoRoot, "figma/product-glyphs.plan.json");
const drawPath = resolve(repoRoot, "figma/product-glyphs.draw.js");
const templatePath = resolve(repoRoot, "scripts/templates/figma-product-glyphs-renderer.js");
const fail = (message) => {
  throw new Error(`[figma-product-glyphs] ${message}`);
};

const ASSETS_PAGE = "240:3529";
const SECTION_NAME = "R · product/Glyphs · 제품 인라인 SVG 글리프 — build-figma-product-glyphs 생성물";
const INK = { collection: "Klipse Semantic Color", name: "color/gray/000" };
// 글리프 안의 `var(--…)`(그라디언트 정지점)를 LOUIS Figma 변수로 잇는 표. 근거는 제품 앵커의 선언 줄이다.
const CSS_VARIABLES = {
  "--primary-500": { collection: "Klipse Primitive", name: "color/blue/500", declared: ["apps/web/app/globals.css", 200, "  --primary-500: var(--louis-color-blue-500);"] },
  "--gray-000": { collection: "Klipse Semantic Color", name: "color/gray/000", declared: ["apps/web/app/globals.css", 704, "  --gray-000: var(--palette-gray-000);"] },
};

// 세트 목록. variant 하나 = 표면 하나다(DS-D-0071 4항: 세트가 그 표면을 통째로 그린다).
// `attrs` 는 원본 `<svg>` 가 획을 호출부 CSS 에 맡긴 자리에만 쓴다 — 그 값의 근거(호출부 줄)를 `callSite` 로 인용한다.
const SETS = [
  {
    setName: "Product/Save Cloud Glyph",
    axis: "State",
    about: "프로젝트 저장 상태 글리프(ProjectSaveCloudGlyph). 소비처 다섯(Gnb · CreateScene · ProjectHeader · VideoEditModal · …)이 같은 셋을 쓴다. 저장 중은 Idle 과 같은 그림에 애니메이션 클래스를 더하고, 오프라인은 Failed 와 같은 그림이다.",
    variants: [
      { value: "Idle", surface: "apps/web/components/navigation/ProjectSaveCloudGlyph.tsx#CloudArrowUpSvg" },
      { value: "Saved", surface: "apps/web/components/navigation/ProjectSaveCloudGlyph.tsx#CloudCheckSvg" },
      { value: "Failed", surface: "apps/web/components/navigation/ProjectSaveCloudGlyph.tsx#CloudWarningSvg" },
    ],
  },
  {
    setName: "Product/Theme Glyph",
    axis: "Theme",
    about: "테마 선택 글리프 셋(ThemeIcons). 앱 GNB 프로필 팝오버와 랜딩 ThemeSelector 가 쓴다. 획 굵기는 호출부가 정한다 — 원본의 기본값(1, 팝오버)으로 그렸고 랜딩은 1.5 로 덮는다.",
    variants: [
      { value: "System", surface: "apps/web/components/theme/ThemeIcons.tsx#ThemeSystemIcon" },
      { value: "Light", surface: "apps/web/components/theme/ThemeIcons.tsx#ThemeLightIcon" },
      { value: "Dark", surface: "apps/web/components/theme/ThemeIcons.tsx#ThemeDarkIcon" },
    ],
  },
  {
    setName: "Product/Glyph",
    axis: "Name",
    about: "한 자리씩 쓰이는 제품 인라인 글리프. 각 variant 가 원본 표면 하나다.",
    variants: [
      {
        value: "Globe", surface: "apps/web/components/ui/GlobeIcon.tsx#GlobeIcon",
        attrs: { stroke: "currentColor", "stroke-width": "1.5" },
        callSite: ["apps/web/components/creative-media/CreativeMediaClient.tsx", 269, '          <GlobeIcon className="h-10 w-10 [stroke:currentColor] [stroke-width:1.5]" />'],
      },
      { value: "Key Enter", surface: "apps/web/components/navigation/CommandPalette.tsx#KeyEnterGlyph" },
      { value: "Pipeline Arrow", surface: "apps/web/components/scenes/create/guide/GettingStartedPanel.tsx#PipelineArrow" },
      { value: "Project Videos", surface: "apps/web/components/scenes/create/ProjectHeader.tsx#ProjectVideosIcon" },
      { value: "Minus", surface: "apps/web/components/scenes/create/node-canvas/primitives.tsx#MinusIcon" },
      { value: "Plan Sparkle", surface: "apps/web/components/navigation/Gnb.tsx#PlanSparkleGlyph" },
    ],
  },
  {
    setName: "Product/Mobile Action Glyph",
    axis: "Name",
    about: "캔버스 비디오 편집 모바일 액션 바 글리프(mobileActionGlyphs). 24 viewBox · currentColor · 획 1.75 · 둥근 끝(래퍼 Glyph 의 기본값), 표시 크기 22.",
    variantsFromFile: {
      path: "apps/web/components/scenes/create/node-canvas-v2/nodes/videoEditParts/mobileActionGlyphs.tsx",
      exportPrefix: "Glyph",
      exclude: ["Glyph"],
    },
  },
];

// ── 제품 원본 ─────────────────────────────────────────────────────────────────
const sources = new Map();
const readSource = (path) => {
  if (!sources.has(path)) {
    const text = execFileSync("git", ["-C", productRoot, "show", `${productCommit}:${path}`], { encoding: "utf8", maxBuffer: 32 * 1024 * 1024 });
    sources.set(path, { text, lines: text.split("\n"), file: ts.createSourceFile(path, text, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX) });
  }
  return sources.get(path);
};
const quoteAt = (path, line, expected) => {
  const { lines } = readSource(path);
  const quote = lines[line - 1] ?? "";
  if (expected !== undefined && quote !== expected) fail(`source quote drift ${path}:${line}: ${JSON.stringify(quote)}`);
  return { command: `git -C "$KLIPSE_PRODUCT_REPO" show ${productCommit}:${path}`, path, line, quote };
};

// ── JSX → SVG ─────────────────────────────────────────────────────────────────
const tagOf = (node) => (ts.isJsxElement(node) ? node.openingElement : node).tagName.getText();
const attrsOf = (node) => (ts.isJsxElement(node) ? node.openingElement : node).attributes.properties;
const childrenOf = (node) => (ts.isJsxElement(node) ? node.children : []);
const isJsx = (node) => ts.isJsxElement(node) || ts.isJsxSelfClosingElement(node);

const findDeclaration = (file, name) => {
  let found = null;
  const visit = (node) => {
    if (found) return;
    if (ts.isFunctionDeclaration(node) && node.name?.text === name) found = node;
    else if (ts.isVariableDeclaration(node) && ts.isIdentifier(node.name) && node.name.text === name && node.initializer
      && (ts.isArrowFunction(node.initializer) || ts.isFunctionExpression(node.initializer))) found = node.initializer;
    else ts.forEachChild(node, visit);
  };
  visit(file);
  return found;
};
const firstJsx = (node) => {
  let found = null;
  const visit = (child) => {
    if (found) return;
    if (isJsx(child)) found = child;
    else ts.forEachChild(child, visit);
  };
  visit(node);
  return found;
};
// 같은 파일의 최상위 `const X = { … } as const` — 펼침 속성(`{...STROKE}`)을 푼다. 값은 문자열 · 수 리터럴만.
const constObjects = (file) => {
  const out = new Map();
  for (const statement of file.statements) {
    if (!ts.isVariableStatement(statement)) continue;
    for (const declaration of statement.declarationList.declarations) {
      let init = declaration.initializer;
      while (init && (ts.isAsExpression(init) || ts.isSatisfiesExpression?.(init) || ts.isParenthesizedExpression(init))) init = init.expression;
      if (!init || !ts.isObjectLiteralExpression(init) || !ts.isIdentifier(declaration.name)) continue;
      const props = {};
      let literal = true;
      for (const prop of init.properties) {
        if (!ts.isPropertyAssignment(prop)) { literal = false; break; }
        const key = prop.name.getText().replace(/^["']|["']$/g, "");
        if (ts.isStringLiteral(prop.initializer) || ts.isNoSubstitutionTemplateLiteral(prop.initializer)) props[key] = prop.initializer.text;
        else if (ts.isNumericLiteral(prop.initializer)) props[key] = prop.initializer.text;
        else { literal = false; break; }
      }
      if (literal) out.set(declaration.name.text, props);
    }
  }
  return out;
};
// 본문의 `const X = useId();` — 그라디언트 id 를 고정 문자열로 둔다(렌더마다 다른 id 는 그림이 아니다).
const bodyIds = (fn, name) => {
  const out = {};
  let index = 0;
  const visit = (node) => {
    if (ts.isVariableDeclaration(node) && ts.isIdentifier(node.name) && node.initializer && ts.isCallExpression(node.initializer)
      && node.initializer.expression.getText() === "useId") out[node.name.text] = `${name}-${index += 1}`;
    ts.forEachChild(node, visit);
  };
  if (fn.body) visit(fn.body);
  return out;
};
// 매개변수 구조 분해의 기본값(`{ size = 22, children, ...rest }`)
const parameterDefaults = (fn) => {
  const out = {};
  for (const parameter of fn.parameters ?? []) {
    if (!ts.isObjectBindingPattern(parameter.name)) continue;
    for (const element of parameter.name.elements) {
      if (!ts.isIdentifier(element.name) || !element.initializer) continue;
      if (ts.isNumericLiteral(element.initializer) || ts.isStringLiteral(element.initializer)) out[element.name.text] = element.initializer.text;
    }
  }
  return out;
};

const SKIP_ATTRS = new Set(["className", "key", "ref", "role", "focusable", "style"]);
const svgName = (name) => {
  if (name.startsWith("aria-") || name.startsWith("data-")) return null;
  if (SKIP_ATTRS.has(name)) return null;
  if (["viewBox", "gradientUnits", "gradientTransform", "preserveAspectRatio", "patternUnits", "clipPathUnits", "spreadMethod"].includes(name)) return name;
  if (name === "xmlns" || name === "xmlnsXlink") return name === "xmlns" ? "xmlns" : "xmlns:xlink";
  return name.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`);
};
const escapeAttr = (value) => String(value).replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");

const evaluate = (expression, ctx, where) => {
  if (ts.isStringLiteral(expression) || ts.isNoSubstitutionTemplateLiteral(expression)) return expression.text;
  if (ts.isNumericLiteral(expression)) return expression.text;
  if (ts.isPrefixUnaryExpression(expression) && expression.operator === ts.SyntaxKind.MinusToken && ts.isNumericLiteral(expression.operand)) return `-${expression.operand.text}`;
  if (ts.isIdentifier(expression) && Object.hasOwn(ctx.vars, expression.text)) return ctx.vars[expression.text];
  if (ts.isTemplateExpression(expression)) {
    let out = expression.head.text;
    for (const span of expression.templateSpans) out += evaluate(span.expression, ctx, where) + span.literal.text;
    return out;
  }
  fail(`옮길 수 없는 식입니다 ${where}: ${expression.getText()}`);
};

const serialize = (node, ctx, where) => {
  const tag = tagOf(node);
  if (/^[A-Z]/.test(tag)) fail(`svg 안에 컴포넌트가 있습니다 ${where}: <${tag}>`);
  const attrs = new Map();
  for (const attribute of attrsOf(node)) {
    if (ts.isJsxSpreadAttribute(attribute)) {
      const name = attribute.expression.getText();
      if (ctx.consts.has(name)) { for (const [key, value] of Object.entries(ctx.consts.get(name))) { const out = svgName(key); if (out) attrs.set(out, value); } continue; }
      if (ctx.ignoredSpreads.has(name)) continue;
      fail(`풀 수 없는 펼침 속성입니다 ${where}: {...${name}}`);
    }
    const name = attribute.name.getText();
    const out = svgName(name);
    if (!out) continue;
    if (!attribute.initializer) continue; // 값 없는 불 속성(aria-hidden 등)은 그림에 영향이 없다
    const value = ts.isStringLiteral(attribute.initializer)
      ? attribute.initializer.text
      : evaluate(attribute.initializer.expression, ctx, `${where} ${name}`);
    attrs.set(out, value);
  }
  const inner = [];
  for (const child of childrenOf(node)) {
    if (ts.isJsxText(child)) { if (child.text.trim()) fail(`svg 안에 글자가 있습니다 ${where}`); continue; }
    if (ts.isJsxExpression(child)) {
      if (!child.expression) continue;
      if (ctx.slot && child.expression.getText() === "children") { inner.push(...ctx.slot); continue; }
      fail(`svg 안에 식이 있습니다 ${where}: ${child.expression.getText()}`);
    }
    if (isJsx(child)) inner.push(serialize(child, ctx, where));
  }
  if (ctx.rootAttrs && tag === "svg") for (const [key, value] of Object.entries(ctx.rootAttrs)) attrs.set(key, value);
  const attrText = [...attrs].map(([key, value]) => ` ${key}="${escapeAttr(value)}"`).join("");
  return inner.length ? `<${tag}${attrText}>${inner.join("")}</${tag}>` : `<${tag}${attrText}/>`;
};

const extract = (surface, options = {}) => {
  const [path, name] = surface.split("#");
  const { file, lines } = readSource(path);
  const declaration = findDeclaration(file, name);
  if (!declaration) fail(`정의를 찾지 못했습니다: ${surface}`);
  const jsx = firstJsx(declaration.body ?? declaration);
  if (!jsx) fail(`JSX 를 찾지 못했습니다: ${surface}`);
  const consts = constObjects(file);
  let svgNode = jsx;
  let ctx = { vars: { ...parameterDefaults(declaration), ...bodyIds(declaration, name) }, consts, ignoredSpreads: new Set(["p", "props", "rest"]), rootAttrs: options.attrs ?? null };
  const tag = tagOf(jsx);
  if (tag !== "svg") {
    // 같은 파일의 래퍼 컴포넌트 — 그 래퍼의 <svg> 에 이 표면의 자식을 끼운다.
    const wrapper = findDeclaration(file, tag);
    if (!wrapper) fail(`래퍼 컴포넌트를 찾지 못했습니다: ${surface} → <${tag}>`);
    const wrapperSvg = firstJsx(wrapper.body ?? wrapper);
    if (!wrapperSvg || tagOf(wrapperSvg) !== "svg") fail(`래퍼가 <svg> 로 시작하지 않습니다: ${tag}`);
    const slotCtx = { ...ctx };
    const slot = childrenOf(jsx).filter(isJsx).map((child) => serialize(child, slotCtx, surface));
    ctx = { ...ctx, vars: { ...parameterDefaults(wrapper), ...ctx.vars }, slot };
    svgNode = wrapperSvg;
  }
  if (tagOf(svgNode) !== "svg") fail(`첫 JSX 가 <svg> 가 아닙니다: ${surface}`);
  let svg = serialize(svgNode, ctx, surface);
  if (!/ xmlns="/.test(svg.slice(0, svg.indexOf(">")))) svg = svg.replace("<svg", '<svg xmlns="http://www.w3.org/2000/svg"');
  // CSS 변수는 그라디언트 정지점에서만 푼다 — 정지점 순서대로 변수를 적고 SVG 에는 자리표시 색을 싣는다(렌더러가 변수에 묶는다).
  const stops = [];
  svg = svg.replace(/<stop([^>]*?) stop-color="var\((--[\w-]+)\)"/g, (_, before, cssVar) => {
    const binding = CSS_VARIABLES[cssVar];
    if (!binding) fail(`모르는 CSS 변수입니다 — CSS_VARIABLES 에 근거와 함께 적는다: ${cssVar} (${surface})`);
    stops.push({ cssVar, collection: binding.collection, name: binding.name });
    return `<stop${before} stop-color="#000000"`;
  });
  if (/var\(--/.test(svg)) fail(`정지점 밖에 CSS 변수가 남았습니다: ${surface}`);
  const gradientIds = [...svg.matchAll(/<(?:linearGradient|radialGradient)[^>]* id="([^"]+)"/g)].map((m) => m[1]);
  for (const ref of svg.matchAll(/url\(#([^)]+)\)/g)) if (!gradientIds.includes(ref[1])) fail(`그라디언트가 아닌 참조입니다: ${ref[1]} (${surface})`);
  const viewBox = /viewBox="([^"]+)"/.exec(svg)?.[1];
  if (!viewBox) fail(`viewBox 가 없습니다: ${surface}`);
  const [, , vbW, vbH] = viewBox.split(/\s+/).map(Number);
  // 컴포넌트 크기는 원본 viewBox 격자다 — 표시 크기(width/height · className)는 소비처마다 다르다.
  const head = svg.slice(0, svg.indexOf(">"));
  const shown = { width: /\swidth="([\d.]+)"/.exec(head)?.[1] ?? null, height: /\sheight="([\d.]+)"/.exec(head)?.[1] ?? null };
  svg = svg.replace(/^<svg([^>]*?) width="[^"]*"/, "<svg$1").replace(/^<svg([^>]*?) height="[^"]*"/, "<svg$1");
  svg = svg.replace("<svg", `<svg width="${vbW}" height="${vbH}"`);
  const inked = svg.replace(/currentColor/g, "#000000");
  // 인용 줄은 이 표면 자신의 JSX 가 시작하는 줄이다(래퍼를 쓰는 표면도 제 줄을 인용한다).
  const line = file.getLineAndCharacterOfPosition(jsx.getStart()).line + 1;
  if (!lines[line - 1]?.includes(`<${tag}`)) fail(`인용 줄이 JSX 시작이 아닙니다: ${surface}:${line}`);
  return {
    ...(stops.length ? { stops } : {}),
    svg: inked,
    sha256: createHash("sha256").update(inked).digest("hex"),
    size: [vbW, vbH],
    shown,
    source: quoteAt(path, line),
  };
};

// ── 계획 ──────────────────────────────────────────────────────────────────────
const ledgerRows = JSON.parse(readFileSync(resolve(repoRoot, "migration/product.surfaces.json"), "utf8")).surfaces;
const sets = SETS.map((set) => {
  let variants = set.variants;
  if (set.variantsFromFile) {
    const { path, exportPrefix, exclude } = set.variantsFromFile;
    const { file } = readSource(path);
    variants = [];
    for (const statement of file.statements) {
      if (!ts.isVariableStatement(statement)) continue;
      if (!statement.modifiers?.some((m) => m.kind === ts.SyntaxKind.ExportKeyword)) continue;
      for (const declaration of statement.declarationList.declarations) {
        const name = declaration.name.getText();
        if (!name.startsWith(exportPrefix) || exclude.includes(name)) continue;
        // 원장이 `scoped`(LOUIS 아이콘에 같은 그림이 있어 아이콘 축이 소유)로 판정한 글리프는 싣지 않는다 — 제품 세트가
        // LOUIS 아이콘을 한 벌 더 만들면 두 정본이 생긴다(DS-D-0043).
        if (ledgerRows[`${path}#${name}`]?.verdict === "scoped") continue;
        variants.push({ value: name.slice(exportPrefix.length).replace(/([a-z])([A-Z])/g, "$1 $2"), surface: `${path}#${name}` });
      }
    }
    if (variants.length === 0) fail(`내보낸 글리프가 없습니다: ${path}`);
  }
  const seen = new Set();
  return {
    setName: set.setName,
    axis: set.axis,
    about: set.about,
    variants: variants.map((variant) => {
      if (seen.has(variant.value)) fail(`variant 가 겹칩니다: ${set.setName} ${variant.value}`);
      seen.add(variant.value);
      const extracted = extract(variant.surface, { attrs: variant.attrs });
      return {
        value: variant.value,
        surface: variant.surface,
        ...extracted,
        ...(variant.callSite ? { callSite: quoteAt(variant.callSite[0], variant.callSite[1], variant.callSite[2]), attrs: variant.attrs } : {}),
      };
    }),
  };
});

// 표면 원장과 잇는다 — 계획의 표면은 원장에 있어야 하고(없으면 이름이 틀렸다), 원장이 이 세트를 적었으면 variant 의 세트와 같아야 한다.
const ledger = ledgerRows;
for (const set of sets) {
  for (const variant of set.variants) {
    const row = ledger[variant.surface];
    if (!row) fail(`표면 원장에 없는 표면입니다: ${variant.surface}`);
    if (row.verdict === "figma" && row.figma !== set.setName) fail(`원장이 다른 대응을 적었습니다: ${variant.surface} → ${row.figma}`);
  }
}

const cssVariableEvidence = Object.fromEntries(Object.entries(CSS_VARIABLES).map(([cssVar, binding]) =>
  [cssVar, { collection: binding.collection, name: binding.name, declared: quoteAt(...binding.declared) }]));
const plan = {
  $comment: "생성물. scripts/build-figma-product-glyphs.mjs 가 제품 앵커의 인라인 <svg> 를 옮겨 만든다. 직접 수정하지 않는다.",
  productCommit,
  page: ASSETS_PAGE,
  sectionName: SECTION_NAME,
  ink: INK,
  cssVariables: cssVariableEvidence,
  sets,
};

// ── 러너 ──────────────────────────────────────────────────────────────────────
const payload = {
  page: ASSETS_PAGE,
  sectionName: SECTION_NAME,
  ink: INK,
  sets: sets.map((set) => ({
    setName: set.setName,
    axis: set.axis,
    description: `${set.about}\n출처: 제품 ${productCommit.slice(0, 8)} · 생성기 build-figma-product-glyphs`,
    variants: set.variants.map((variant) => ({
      name: `${set.axis}=${variant.value}`,
      svg: variant.svg,
      size: variant.size,
      ...(variant.stops ? { stops: variant.stops.map(({ collection, name }) => ({ collection, name })) } : {}),
      description: `출처: ${variant.source.path}:${variant.source.line} (${variant.surface.split("#")[1]})${variant.callSite ? ` · 획은 호출부 ${variant.callSite.path}:${variant.callSite.line}` : ""} · svg sha256 ${variant.sha256.slice(0, 12)}`,
    })),
  })),
};
const template = readFileSync(templatePath, "utf8");
const readableDraw = `const P = ${JSON.stringify(payload)};\n${template}`;
const wrappedDraw = transformSync(`async function __figmaRunner__(){${readableDraw}}`, { minify: true, target: "es2022", charset: "utf8" }).code.trim();
const wrapperPrefix = "async function __figmaRunner__(){";
if (!wrappedDraw.startsWith(wrapperPrefix) || !wrappedDraw.endsWith("}")) fail("unexpected esbuild wrapper output");
const draw = "// Generated and minified by scripts/build-figma-product-glyphs.mjs. Do not edit by hand.\n" + wrappedDraw.slice(wrapperPrefix.length, -1);
if (draw.length > 50_000) fail(`Figma runner exceeds connector limit: ${draw.length}`);
if (/\\u[0-9a-fA-F]{4}/.test(draw)) fail("러너에 유니코드 이스케이프가 있습니다 — 전송 중 풀린다");

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
const variantCount = sets.reduce((sum, set) => sum + set.variants.length, 0);
console.log(`[figma-product-glyphs] ${checkOnly ? "checked" : "built"} @ ${productCommit.slice(0, 8)}: 세트 ${sets.length} · variant ${variantCount} · 러너 ${draw.length}자`);
