#!/usr/bin/env node
// **Figma 보드의 언어 변수 계획(DS-D-0081, 2026-10-08).**
//
// 보드 글자는 en 측정의 리터럴이다. 같은 화면을 로캘마다 다시 잰 원장(`migration/product-locale/<mode>.<locale>.json`, 측정기
// `--locale=ko|ja`)과 DOM 경로로 짝지어(`scripts/lib/locale-text-pairing.mjs`) **세 로캘 값이 다른 글자만** STRING 컬렉션
// 「Klipse Locale」(모드 en · ko · ja, 게시 숨김)의 변수로 묶는다. 세 값이 같으면 리터럴로 둔다. 로캘마다 있다 없다 하는 노드는
// `visible` 을 존재 BOOLEAN 에 묶는다. 범위 서식 글자는 묶지 않는다(첫 모드 전환에 서식이 무너진다 — 「rich-text, en 고정」으로 보고).
//
// ## 이름
//
// 사전(제품 `components/landing/system/messages` — 원장 커밋에서 꺼낸다)은 **이름 짓기와 교차 검증에만** 쓴다. en 글자가 사전 키 하나에만
// 맞고 잰 ko · ja 가 그 키의 사전 값과 같으면 `i18n/<키>`(세 값이 사전 문자열과 바이트로 같을 때 — 줄바꿈 · NBSP 가 끼면 `~<sha8>` 를
// 붙인다), 아니면 `screen/<첫 화면>/<sha8>` 이다. 변수의 정체는 세 값의 sha256 이고(같은 값이면 화면이 달라도 한 변수) 러너가 그것을
// 변수 설명에 적어 찾는다 — 범위가 넓어져 이름이 바뀌어도 이미 묶인 보드가 끊기지 않는다(figma-locale-strings-renderer.js).
//
// ## 산출물
//
//   figma/locale-strings.plan.json      — 변수 · 바인딩(보드 · 부품의 경로 → 변수 이름) · 보고(짝 없음 · 모양 차이 · 배치 위험)
//   figma/locale-strings.<nn>.draw.js   — 컬렉션 · 변수를 세우는 러너(보드 러너보다 먼저)
//
// 보드 생성기(build-figma-app-screens.mjs)가 계획의 바인딩을 읽어 러너 payload 에 `xv` · `vv` · `iv` 와 `locale` 을 싣는다.
//
// 실행: `node scripts/build-figma-locale-strings.mjs [--only=<route> …] [--check] [--locale-dir=<dir>]`
//   --only        그 화면(두 뷰포트)과 그 화면이 쓰는 제품 부품만 계획한다(시범). 계획에 범위가 남고 `--check` 는 그 범위를 다시 쓴다.
//   --locale-dir  로캘 원장 폴더(기본 migration/product-locale).
//   사전: KLIPSE_PRODUCT_REPO(기본 /Users/sejunki/klipse-web)에 원장 커밋이 있어야 한다.

import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { existsSync, mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { buildSync } from "esbuild";
import { atomicWriteBatch } from "./lib/atomic-output.mjs";
import { LOCALES, indexByPath, labelText, measuredSpecOf, pairLocaleTexts, figmaTextValue } from "./lib/locale-text-pairing.mjs";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const fail = (message) => { throw new Error(`[figma-locale-strings] ${message}`); };
const argValues = (name) => process.argv.filter((arg) => arg.startsWith(`--${name}=`)).map((arg) => arg.slice(name.length + 3));
const checkOnly = process.argv.includes("--check");
const localeDir = resolve(repoRoot, argValues("locale-dir")[0] ?? "migration/product-locale");
const planPath = resolve(repoRoot, "figma/locale-strings.plan.json");
const templatePath = resolve(repoRoot, "scripts/templates/figma-locale-strings-renderer.js");
const RUNNER_PREFIX = "locale-strings";
const COLLECTION = "Klipse Locale";
const TARGETS = LOCALES.filter((locale) => locale !== "en");
// 러너 한 조각의 바이트 상한 — 보드 러너와 같은 여유(use_figma 50,000 − 포장).
const RUNNER_BYTES = 47_000;

// 범위 — `--only` 가 없으면 `--check` 는 기록된 계획의 범위를 다시 쓴다(시범 계획을 전체로 착각하지 않게).
const recordedPlan = existsSync(planPath) ? JSON.parse(readFileSync(planPath, "utf8")) : null;
const onlyArg = argValues("only");
const scope = onlyArg.length > 0 ? [...new Set(onlyArg)].sort()
  : checkOnly && Array.isArray(recordedPlan?.scope) ? recordedPlan.scope : "all";

// ── en 원장 · 보드 계획 ───────────────────────────────────────────────────────
// 원장 키는 측정기 모드 이름이다 — 로캘 원장 파일 이름(`<mode>.<locale>.json`)과 같다.
const EN_LEDGERS = {
  auth: "migration/product.auth-fixture.json",
  anonymous: "migration/product.anonymous-fixture.json",
  session: "migration/product.session-fixture.json",
  public: "migration/product.public-fixture.json",
  "public-seeded": "migration/product.public-seeded-fixture.json",
};
const readJson = (relative) => JSON.parse(readFileSync(resolve(repoRoot, relative), "utf8"));
const enLedgers = Object.fromEntries(Object.entries(EN_LEDGERS)
  .filter(([, relative]) => existsSync(resolve(repoRoot, relative)))
  .map(([mode, relative]) => [mode, readJson(relative)]));
const boardPlan = readJson("figma/app-screens.plan.json");
const partsPlan = readJson("figma/product-parts.plan.json");
const productCommit = boardPlan.productCommit;
for (const [mode, ledger] of Object.entries(enLedgers)) {
  if (ledger.productCommit !== productCommit) fail(`en 원장 ${mode} 의 커밋(${String(ledger.productCommit).slice(0, 8)})이 보드 계획(${productCommit.slice(0, 8)})과 다릅니다 — 보드 생성기를 먼저 돌리세요.`);
}

/** 보드 화면이 어느 en 원장에서 왔는가 — 보드 계획은 원장 키를 싣지 않으므로 경로 · 노드 수로 가린다. */
const modeOfScreen = (screen) => {
  const hits = Object.entries(enLedgers).filter(([, ledger]) => {
    const measured = ledger.screens?.[screen.context]?.[screen.route];
    return measured?.tree?.length === screen.stats.measured && measured.rootPath === screen.spec.path;
  });
  if (hits.length !== 1) fail(`보드 ${screen.route} @ ${screen.context} 의 en 원장을 하나로 정하지 못했습니다(${hits.map(([mode]) => mode).join(", ") || "없음"})`);
  return hits[0][0];
};

const localeLedgers = new Map();
const localeLedgerOf = (mode, locale) => {
  const key = `${mode}.${locale}`;
  if (!localeLedgers.has(key)) {
    const path = join(localeDir, `${key}.json`);
    if (!existsSync(path)) fail(`로캘 원장이 없습니다: ${path} — node scripts/measure-product-auth-fixture.mjs ${mode === "auth" ? "" : `--${mode} `}--locale=${locale}`);
    const ledger = JSON.parse(readFileSync(path, "utf8"));
    if (ledger.productCommit !== productCommit) fail(`로캘 원장 ${key} 의 커밋(${String(ledger.productCommit).slice(0, 8)})이 en 원장(${productCommit.slice(0, 8)})과 다릅니다`);
    if (ledger.fixture?.locale !== locale) fail(`로캘 원장 ${key} 의 fixture.locale 이 ${ledger.fixture?.locale} 입니다`);
    localeLedgers.set(key, { ledger, file: path.startsWith(repoRoot) ? path.slice(repoRoot.length + 1) : path });
  }
  return localeLedgers.get(key).ledger;
};

// ── 사전(이름 · 교차 검증) ────────────────────────────────────────────────────
// 원장 커밋의 사전을 제품 저장소에서 꺼내 묶는다 — 작업 트리의 사전은 다른 커밋일 수 있다. ja 는 en 위의 덮어쓰기(deepMerge),
// 어드민은 en · ko 둘뿐이라 ja 화면이 en 어드민 사전을 쓴다(제품 useAdminMessages).
const MESSAGES_DIR = "apps/web/components/landing/system/messages";
const loadDictionary = () => {
  const productRoot = process.env.KLIPSE_PRODUCT_REPO ?? "/Users/sejunki/klipse-web";
  try { execFileSync("git", ["cat-file", "-e", `${productCommit}^{commit}`], { cwd: productRoot, stdio: "ignore" }); }
  catch { fail(`사전을 꺼낼 커밋 ${productCommit.slice(0, 8)} 이 ${productRoot} 에 없습니다 — KLIPSE_PRODUCT_REPO 를 그 커밋이 있는 저장소로 세우세요.`); }
  const scratch = mkdtempSync(join(tmpdir(), "klipse-locale-dict-"));
  try {
    const archive = execFileSync("git", ["archive", "--format=tar", productCommit, MESSAGES_DIR], { cwd: productRoot, maxBuffer: 256 * 1024 * 1024 });
    execFileSync("tar", ["-x", "-C", scratch], { input: archive });
    const bundled = buildSync({
      stdin: {
        // 어드민 사전은 뒤 커밋에만 있다(a4125565 에는 없다) — 있는 것만 묶는다.
        contents: ["en", "ko", "ja", "admin-en", "admin-ko"].filter((name) => existsSync(join(scratch, MESSAGES_DIR, `${name}.ts`)))
          .map((name) => `export { default as ${name.replace("-", "_")} } from "./${name}";`).join("\n"),
        resolveDir: join(scratch, MESSAGES_DIR),
        loader: "ts",
      },
      bundle: true, format: "cjs", platform: "node", write: false, logLevel: "silent",
    });
    const file = join(scratch, "messages.cjs");
    writeFileSync(file, bundled.outputFiles[0].text);
    return createRequire(import.meta.url)(file);
  } finally {
    rmSync(scratch, { recursive: true, force: true });
  }
};
const flatten = (value, prefix, out) => {
  if (typeof value === "string") out[prefix] = value;
  else if (Array.isArray(value)) value.forEach((item, index) => flatten(item, `${prefix}.${index}`, out));
  else if (value && typeof value === "object") for (const [key, item] of Object.entries(value)) flatten(item, prefix ? `${prefix}.${key}` : key, out);
  return out; // 함수 잎은 값이 없다 — 건너뛴다
};
const messages = loadDictionary();
const dictionary = { en: flatten(messages.en, "", {}), ko: flatten(messages.ko, "", {}), ja: flatten(messages.ja, "", {}) };
if (messages.admin_en) {
  Object.assign(dictionary.en, flatten(messages.admin_en, "admin", {}));
  Object.assign(dictionary.ko, flatten(messages.admin_ko ?? {}, "admin", {}));
  Object.assign(dictionary.ja, flatten(messages.admin_en, "admin", {}));
}
const keysByEn = new Map();
for (const [key, value] of Object.entries(dictionary.en)) {
  const plain = labelText(value);
  if (!keysByEn.has(plain)) keysByEn.set(plain, []);
  keysByEn.get(plain).push(key);
}

// ── 짝짓기 ───────────────────────────────────────────────────────────────────
const slugOf = (route) => (route === "/" ? "home" : route.replace(/^\//, "").replace(/\//g, "-").replace(/[^A-Za-z0-9_-]+/g, "-"));
const selected = boardPlan.screens.filter((screen) => scope === "all" || scope.includes(screen.route));
if (scope !== "all") for (const route of scope) if (!selected.some((screen) => screen.route === route)) fail(`보드 계획에 화면이 없습니다: ${route}`);
const partSets = new Map(partsPlan.sets.map((set) => [set.setName, set]));

const targets = []; // { key, route(이름용), result }
const report = { enDrift: [], textMissing: [], tagMismatch: [], labelUnresolved: [], localeRichLost: [], localeOnly: [], richTextEnFixed: [], labelledPartsSkipped: [] };
const absorb = (key, result) => {
  for (const [name, list] of Object.entries(result.issues)) report[name].push(...list.map((item) => ({ target: key, ...item })));
  report.localeOnly.push(...result.localeOnly.map((item) => ({ target: key, ...item })));
};

const partUses = new Map(); // `${set}|${variant}` → { set, variant, boards: [{ screen, mode, path }] }
for (const screen of selected) {
  const mode = modeOfScreen(screen);
  const key = `${screen.route} @ ${screen.context}`;
  const enSpec = measuredSpecOf(enLedgers[mode], screen.context, screen.route);
  const localeSpecs = Object.fromEntries(TARGETS.map((locale) => {
    const spec = measuredSpecOf(localeLedgerOf(mode, locale), screen.context, screen.route);
    if (!spec) fail(`로캘 원장 ${mode}.${locale} 에 ${key} 가 없습니다 — 측정기 --only=${screen.route} --locale=${locale}`);
    return [locale, spec];
  }));
  const result = pairLocaleTexts({ boardSpec: screen.spec, enSpec, localeSpecs });
  absorb(key, result);
  targets.push({ key, route: screen.route, result });
  const walk = (node) => {
    if (node.instance && partSets.has(node.instance.set)) {
      const id = `${node.instance.set}|${node.instance.variant}`;
      if (!partUses.has(id)) partUses.set(id, { set: node.instance.set, variant: node.instance.variant, boards: [] });
      partUses.get(id).boards.push({ screen, mode, path: node.path });
      return;
    }
    for (const child of node.children ?? []) walk(child);
  };
  walk(screen.spec);
}

// 부품 — 보드가 쓰는 제품 부품의 마스터 글자를 묶는다(마스터를 묶으면 모든 인스턴스가 따른다). 부품의 측정 화면이 로캘 원장에 없으면
// (시범은 /inquiry 만 잰다 — 푸터는 랜딩에서 찍었다) 그 부품이 선 보드에서 같은 상대 경로로 짝짓는다. en 에서 두 자리의 글자가 모두 같을 때만.
for (const use of partUses.values()) {
  const set = partSets.get(use.set);
  const variant = set.variants.find((entry) => entry.variant === use.variant) ?? fail(`부품 계획에 variant 가 없습니다: ${use.set} ${use.variant}`);
  const key = `part:${use.set} ${use.variant}`;
  // 글자 속성 부품(쿠폰 코드 칩)은 마스터 글자가 TEXT 속성에 묶여 있어 변수와 겹치지 않는다 — 보고만 한다. 부품 계획은 `label` 을 싣지 않아
  // 그 부품 러너의 payload(`P.label`)로 가린다.
  if (labelledPart(variant)) {
    report.labelledPartsSkipped.push({ target: key });
    continue;
  }
  const candidates = Object.entries(enLedgers).filter(([, ledger]) =>
    ledger.screens?.[variant.context]?.[variant.route]?.tree?.some((node) => node.path === variant.path));
  const textsOfSpec = (spec) => { const out = []; const walk = (node) => { if (node.text) out.push(labelText(node.text)); (node.children ?? []).forEach(walk); }; walk(spec); return out; };
  const fits = candidates.filter(([mode]) =>
    JSON.stringify(textsOfSpec(measuredSpecOf(enLedgers[mode], variant.context, variant.route, variant.path))) === JSON.stringify(variant.signature.texts));
  if (fits.length !== 1) fail(`부품 ${key} 의 en 원장을 하나로 정하지 못했습니다(${fits.map(([mode]) => mode).join(", ") || "없음"})`);
  const [partMode] = fits[0];
  const enSpec = measuredSpecOf(enLedgers[partMode], variant.context, variant.route, variant.path);
  // 부품 안의 정본 프리미티브 인스턴스(부품 계획 instances)는 컴포넌트가 그린다 — 보드처럼 잘라 라벨만 남긴다.
  const boardSpec = structuredClone(enSpec);
  const boardIndex = indexByPath(boardSpec);
  for (const applied of variant.instances ?? []) {
    const node = boardIndex.get(applied.path) ?? fail(`부품 ${key} 의 인스턴스 자리가 측정에 없습니다: ${applied.path}`);
    node.instance = { set: applied.set, variant: applied.variant, ...(applied.label == null ? {} : { label: applied.label }) };
    node.children = [];
    node.text = null;
  }
  let localeSpecs;
  let remap = null;
  const own = TARGETS.every((locale) => existsSync(join(localeDir, `${partMode}.${locale}.json`))
    && localeLedgerOf(partMode, locale).screens?.[variant.context]?.[variant.route]);
  if (own) {
    localeSpecs = Object.fromEntries(TARGETS.map((locale) => [locale, measuredSpecOf(localeLedgerOf(partMode, locale), variant.context, variant.route, variant.path)]));
  } else {
    const board = use.boards[0];
    const boardEn = indexByPath(measuredSpecOf(enLedgers[board.mode], board.screen.context, board.screen.route));
    const mismatch = [];
    const check = (node) => {
      if (node.text) {
        const at = boardEn.get(board.path + node.path.slice(variant.path.length));
        if (!at?.text || figmaTextValue(at) !== figmaTextValue(node)) mismatch.push(node.path);
      }
      (node.children ?? []).forEach(check);
    };
    check(enSpec);
    if (mismatch.length > 0) fail(`부품 ${key} 를 보드 ${board.screen.route} 의 ${board.path} 에서 짝지을 수 없습니다 — en 글자가 다른 자리 ${mismatch.length}: ${mismatch.slice(0, 3).join(", ")}`);
    localeSpecs = Object.fromEntries(TARGETS.map((locale) => [locale, measuredSpecOf(localeLedgerOf(board.mode, locale), board.screen.context, board.screen.route)]));
    remap = { from: variant.path, to: board.path, board: `${board.screen.route} @ ${board.screen.context}` };
  }
  const result = pairLocaleTexts({ boardSpec, enSpec, localeSpecs, remap });
  absorb(key, result);
  targets.push({ key, route: variant.route, result, ...(remap ? { pairedOn: remap.board } : {}) });
}
function labelledPart(variant) {
  const line = readFileSync(resolve(repoRoot, variant.runner), "utf8").split("\n").find((text) => text.startsWith("const P="));
  return Boolean(line && JSON.parse(line.slice("const P=".length, -1)).label);
}

// ── 변수 · 바인딩 ─────────────────────────────────────────────────────────────
const sha = (values) => createHash("sha256").update(JSON.stringify(LOCALES.map((locale) => values[locale]))).digest("hex");
const strings = new Map(); // id → variable
const booleans = new Map();
const bindings = {};
const dictionaryCheck = { i18n: 0, measured: 0, disagreements: [] };
let literalSame = 0;
const nameFor = (entry, route) => {
  const keys = keysByEn.get(entry.plain.en) ?? [];
  const id = sha(entry.values);
  if (keys.length === 1) {
    const [key] = keys;
    const agrees = TARGETS.every((locale) => labelText(dictionary[locale][key]) === entry.plain[locale]);
    if (agrees) {
      dictionaryCheck.i18n += 1;
      const exact = LOCALES.every((locale) => dictionary[locale][key] === entry.values[locale]);
      // Figma 변수 이름에 점을 쓰지 않는다 — 키의 점을 무리(`/`)로 바꾼다.
      return `i18n/${key.replace(/\./g, "/")}${exact ? "" : `~${id.slice(0, 8)}`}`;
    }
    dictionaryCheck.disagreements.push({ key, en: entry.plain.en, measured: Object.fromEntries(TARGETS.map((locale) => [locale, entry.plain[locale]])),
      dictionary: Object.fromEntries(TARGETS.map((locale) => [locale, dictionary[locale][key] ?? null])) });
  }
  dictionaryCheck.measured += 1;
  return `screen/${slugOf(route)}/${id.slice(0, 8)}`;
};
const stringVariable = (entry, route) => {
  const id = sha(entry.values).slice(0, 12);
  if (!strings.has(id)) strings.set(id, { id, name: nameFor(entry, route), type: "STRING", values: entry.values, uses: 0 });
  const variable = strings.get(id);
  variable.uses += 1;
  return variable.name;
};
const presenceVariable = (pattern) => {
  const values = Object.fromEntries(LOCALES.map((locale) => [locale, pattern.split("+").includes(locale)]));
  const id = `presence-${pattern.replace(/\+/g, "-")}`;
  if (!booleans.has(id)) booleans.set(id, { id, name: `presence/${pattern.replace(/\+/g, "-")}`, type: "BOOLEAN", values, uses: 0 });
  booleans.get(id).uses += 1;
  return booleans.get(id).name;
};
const differs = (values) => new Set(LOCALES.map((locale) => values[locale])).size > 1;
for (const { key, route, result } of targets) {
  const binding = {};
  const at = (path) => (binding[path] ??= {});
  for (const entry of result.texts) {
    if (entry.rich) {
      if (differs(entry.values)) report.richTextEnFixed.push({ target: key, path: entry.path, values: entry.values });
      continue;
    }
    if (!differs(entry.values)) { literalSame += 1; continue; }
    at(entry.path).xv = stringVariable(entry, route);
  }
  for (const entry of result.labels) {
    if (!differs(entry.values)) { literalSame += 1; continue; }
    const name = stringVariable(entry, route);
    if (entry.prop == null) at(entry.path).iv = name;
    else at(entry.path).iv = { ...(typeof at(entry.path).iv === "object" ? at(entry.path).iv : {}), [entry.prop]: name };
  }
  for (const entry of result.presence) {
    if (entry.pattern === LOCALES.join("+")) continue; // 부모가 숨었다가 이 노드에서 다시 모두 있다 — 경로가 겹쳐 생기지 않는다
    at(entry.path).vv = presenceVariable(entry.pattern);
  }
  if (Object.keys(binding).length > 0) bindings[key] = Object.fromEntries(Object.entries(binding).sort(([a], [b]) => a.localeCompare(b)));
}
{
  const names = new Map();
  for (const variable of [...strings.values(), ...booleans.values()]) {
    if (names.has(variable.name)) fail(`변수 이름이 겹칩니다: ${variable.name}`);
    names.set(variable.name, variable.id);
  }
}

// ── 배치 위험 보고(DS-D-0081 7항) — 보드는 en 배치다. 글자 상자가 로캘에서 2px 넘게 달라지고 그 축이 고정인 조상이 있으면 넘침 · 빈자리 후보다.
const layoutDelta = [];
for (const { key, result } of targets) {
  for (const entry of result.texts) {
    if (!entry.delta) continue;
    for (const [locale, delta] of Object.entries(entry.delta)) layoutDelta.push({ target: key, path: entry.path, locale, ...delta });
  }
}

const variables = [...strings.values()].sort((a, b) => a.name.localeCompare(b.name));
const presence = [...booleans.values()].sort((a, b) => a.name.localeCompare(b.name));
const boundTexts = Object.values(bindings).reduce((sum, binding) => sum + Object.values(binding).filter((entry) => entry.xv).length, 0);
const plan = {
  $comment: "Generated by scripts/build-figma-locale-strings.mjs. Do not edit by hand.",
  $why: "보드 글자 가운데 en · ko · ja 값이 다른 것만 「Klipse Locale」 변수에 묶는다 — 값은 로캘별 측정의 같은 DOM 경로에서 얻는다(DS-D-0081). ko · ja 는 en 배치에 그 언어의 글자 · 줄바꿈을 얹은 미리보기다.",
  productCommit,
  collection: COLLECTION,
  modes: LOCALES,
  hiddenFromPublishing: true,
  scope,
  ledgers: Object.fromEntries([...localeLedgers.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([key, { file }]) => [key, file])),
  dictionary: { source: MESSAGES_DIR, commit: productCommit, keys: Object.keys(dictionary.en).length, ...dictionaryCheck },
  targets: targets.map(({ key, result, pairedOn }) => ({ key, texts: result.texts.length, labels: result.labels.length, ...(pairedOn ? { pairedOn } : {}) })),
  stats: {
    boundTexts,
    boundLabels: Object.values(bindings).reduce((sum, binding) => sum + Object.values(binding).filter((entry) => entry.iv).length, 0),
    boundVisible: Object.values(bindings).reduce((sum, binding) => sum + Object.values(binding).filter((entry) => entry.vv).length, 0),
    literalSameAcrossLocales: literalSame,
    variables: variables.length,
    presenceVariables: presence.length,
  },
  variables,
  presence,
  bindings,
  report: { ...report, layoutDelta },
};

// ── 러너 — 변수를 바이트 상한 안의 조각으로 나눈다. 조각은 서로 독립이다(figma-locale-strings-renderer.js).
const template = readFileSync(templatePath, "utf8");
const payloadLiteral = (payload) => JSON.stringify(payload).replace(/ /g, "\\u00a0");
const header = (index, total) => `// Generated by scripts/build-figma-locale-strings.mjs. Do not edit by hand.\n// 「${COLLECTION}」 변수 · 조각 ${index}/${total - 1} — 보드 러너보다 먼저, 순서 없이 use_figma 에 넘긴다.\n`;
const rows = [
  ...variables.map((variable) => ["strings", [variable.id, variable.name, ...LOCALES.map((locale) => variable.values[locale])]]),
  ...presence.map((variable) => ["booleans", [variable.id, variable.name, ...LOCALES.map((locale) => variable.values[locale])]]),
];
const base = { collection: COLLECTION, modes: LOCALES, hidden: true };
const groups = [];
for (const [kind, row] of rows) {
  const last = groups.at(-1);
  const trial = last ? { ...last, [kind]: [...(last[kind] ?? []), row] } : null;
  if (trial && Buffer.byteLength(header(99, 100) + `const P=${payloadLiteral(trial)};\n` + template) <= RUNNER_BYTES) groups[groups.length - 1] = trial;
  else groups.push({ ...base, [kind]: [row] });
}
if (groups.length === 0) groups.push({ ...base, strings: [] });
const outputs = groups.map((payload, index) => ({
  absolute: resolve(repoRoot, `figma/${RUNNER_PREFIX}.${String(index).padStart(2, "0")}.draw.js`),
  expected: header(index, groups.length) + `const P=${payloadLiteral(payload)};\n` + template,
}));
for (const output of outputs) if (Buffer.byteLength(output.expected) > RUNNER_BYTES) fail(`러너가 ${RUNNER_BYTES} 바이트를 넘습니다: ${output.absolute}`);
plan.runners = outputs.map((output) => output.absolute.slice(repoRoot.length + 1));
outputs.unshift({ absolute: planPath, expected: `${JSON.stringify(plan, null, 2)}\n` });

const wanted = new Set(outputs.map((output) => output.absolute));
const orphans = readdirSync(resolve(repoRoot, "figma"))
  .filter((name) => new RegExp(`^${RUNNER_PREFIX}\\.\\d\\d\\.draw\\.js$`).test(name))
  .map((name) => resolve(repoRoot, "figma", name))
  .filter((absolute) => !wanted.has(absolute));
if (checkOnly) {
  for (const output of outputs) {
    if (!existsSync(output.absolute)) fail(`생성물이 없습니다: ${output.absolute.slice(repoRoot.length + 1)}`);
    if (readFileSync(output.absolute, "utf8") !== output.expected) fail(`생성물이 다릅니다: ${output.absolute.slice(repoRoot.length + 1)}`);
  }
  for (const orphan of orphans) fail(`더 이상 생성하지 않는 러너가 남아 있습니다: ${orphan.slice(repoRoot.length + 1)}`);
} else {
  atomicWriteBatch(outputs);
  for (const orphan of orphans) rmSync(orphan);
}

const issueCounts = Object.entries(plan.report).filter(([, list]) => list.length).map(([name, list]) => `${name} ${list.length}`).join(" · ");
console.log(
  `[figma-locale-strings] ${checkOnly ? "checked" : "built"} @ ${productCommit.slice(0, 8)} · 범위 ${scope === "all" ? "전체" : scope.join(",")}: ` +
  `대상 ${targets.length} · 묶은 글자 ${boundTexts} · 라벨 ${plan.stats.boundLabels} · 존재 ${plan.stats.boundVisible} · 세 값 같음(리터럴) ${literalSame} · ` +
  `변수 ${variables.length}(i18n ${dictionaryCheck.i18n} · 측정 ${dictionaryCheck.measured} · 사전 불일치 ${dictionaryCheck.disagreements.length}) · 존재 변수 ${presence.length} · 러너 ${groups.length}` +
  (issueCounts ? ` · 보고: ${issueCounts}` : ""),
);
