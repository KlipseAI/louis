#!/usr/bin/env node
// **Figma 언어 변수 계획 게이트(DS-D-0081, 2026-10-08).**
//
// `figma/locale-strings.plan.json`(생성기 `scripts/build-figma-locale-strings.mjs` 산출물)이 있으면 그 계획이 자기 입력과 어긋나지 않았는지
// 센다. 값의 정본은 로캘별 측정 원장(`migration/product-locale/<mode>.<locale>.json`)과 같은 DOM 경로 짝짓기이고, 이 게이트는 그 짝짓기를 다시
// 하지 않는다 — 생성기에게 `--check` 로 다시 시키고(같은 코드가 같은 입력에서 같은 바이트를 내는가), 그 바깥에서 아래를 따로 본다.
//
//   ① 계획 안의 일관성 — 변수 이름이 겹치지 않는가, 묶는 변수는 세 로캘 값이 서로 다른가(같으면 리터럴이어야 한다 — DS-D-0081 2항),
//      바인딩이 가리키는 변수가 있는가, `uses`·`stats` 가 바인딩과 맞는가.
//   ② 러너와 계획 — 러너 payload 의 변수 행(이름 · 세 로캘 값)이 계획의 변수와 같은가(사람이 러너만 고쳤거나 계획만 고친 것을 잡는다).
//   ③ 커밋 — 로캘 원장의 productCommit 이 lock 앵커(`migration/product-evidence.lock.json`)와 같은가, 계획의 productCommit 과 같은가.
//   ④ 생성기 재현 — `build-figma-locale-strings.mjs --check` 가 통과하는가(제품 저장소 사전이 필요하다 — KLIPSE_PRODUCT_REPO).
//
// 그리고 짝짓기 coverage 를 찍는다: 묶은 글자 / 대상 글자 · en 고정 rich-text 수 · 짝 없음 수 · 배치 위험 수.
//
// ## 종료코드
//
//   계획이 없으면 **NOT_MEASURED 를 크게 찍고 exit 0** 이다 — 시범이 시작되기 전에는 잴 것이 없다. 조용한 통과가 아니라는 표시가 그 배너다
//   (메모리 「조용한 exit 0 은 빨간 것보다 나쁘다」). 이 게이트를 package.json 에 걸 때는 그 배너가 종료코드에 반영돼야 하는지 다시 정한다.
//   계획이 있는데 위 ①~④ 가 어긋나면 exit 1. 생성기를 돌릴 수 없으면(제품 저장소 없음) ④ 는 재지 않은 것으로 크게 적고 exit 1 —
//   `--no-regenerate` 로 ④ 를 일부러 빼면 그렇게 적고 ①~③ 만으로 판정한다.
//
// 실행: `node scripts/check-locale-strings.mjs [--strict] [--no-regenerate] [--plan=<경로>] [--locale-dir=<폴더>]`
//   --strict  짝 없음 · 어긋남 보고(enDrift · textMissing · tagMismatch · labelUnresolved)가 하나라도 있으면 exit 1.

import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { readAnchor, samePin } from "./lib/product-anchor.mjs";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const args = process.argv.slice(2);
const argValue = (name) => args.find((arg) => arg.startsWith(`--${name}=`))?.slice(name.length + 3) ?? null;
const strict = args.includes("--strict");
const regenerate = !args.includes("--no-regenerate");
const planPath = resolve(repoRoot, argValue("plan") ?? "figma/locale-strings.plan.json");
const localeDir = argValue("locale-dir");
const relative = (absolute) => (absolute.startsWith(`${repoRoot}/`) ? absolute.slice(repoRoot.length + 1) : absolute);
const LOCALES = ["en", "ko", "ja"];
const COLLECTION = "Klipse Locale";

if (!existsSync(planPath)) {
  const bar = "=".repeat(78);
  console.log(
    [
      bar,
      `  NOT_MEASURED — 언어 변수 계획이 없어 아무것도 재지 않았습니다.`,
      `  ${relative(planPath)} 가 없습니다. 이 출력은 「통과」가 아니라 「잰 것이 0건」입니다.`,
      `  계획을 세우려면: node scripts/build-figma-locale-strings.mjs --only=<route>  (로캘 원장이 먼저 있어야 합니다)`,
      bar,
    ].join("\n"),
  );
  process.exit(0);
}

const problems = []; // 통과를 막는다
const warnings = []; // 짝 없음 · 어긋남 보고 — --strict 에서만 막는다
const fail = (message) => problems.push(message);
const plan = JSON.parse(readFileSync(planPath, "utf8"));

// ── ① 계획 안의 일관성 ────────────────────────────────────────────────────────
if (plan.collection !== COLLECTION) fail(`컬렉션 이름이 「${plan.collection}」 입니다(「${COLLECTION}」 이어야 합니다)`);
if (JSON.stringify(plan.modes) !== JSON.stringify(LOCALES)) fail(`모드가 ${JSON.stringify(plan.modes)} 입니다(${JSON.stringify(LOCALES)} 이어야 합니다)`);
if (plan.hiddenFromPublishing !== true) fail("hiddenFromPublishing 이 true 가 아닙니다 — 언어 변수가 라이브러리에 게시됩니다");

const strings = plan.variables ?? [];
const booleans = plan.presence ?? [];
const names = new Map();
for (const variable of [...strings, ...booleans]) {
  if (names.has(variable.name)) fail(`변수 이름이 겹칩니다: ${variable.name}`);
  names.set(variable.name, variable);
}
for (const variable of strings) {
  const values = LOCALES.map((locale) => variable.values?.[locale]);
  if (values.some((value) => typeof value !== "string")) fail(`STRING 변수 ${variable.name} 에 글자가 아닌 로캘 값이 있습니다`);
  else if (new Set(values).size < 2) fail(`STRING 변수 ${variable.name} 의 세 로캘 값이 같습니다 — 같으면 변수가 아니라 리터럴이어야 합니다(DS-D-0081 2항)`);
}
for (const variable of booleans) {
  const values = LOCALES.map((locale) => variable.values?.[locale]);
  if (values.some((value) => typeof value !== "boolean")) fail(`BOOLEAN 변수 ${variable.name} 에 참거짓이 아닌 값이 있습니다`);
  else if (values.every(Boolean)) fail(`BOOLEAN 변수 ${variable.name} 이 세 로캘 모두 참입니다 — 존재 변수가 아닙니다`);
}
const used = new Map();
const use = (name, where, expectedType) => {
  const variable = names.get(name);
  if (!variable) { fail(`바인딩 ${where} 가 없는 변수를 가리킵니다: ${name}`); return; }
  if (variable.type !== expectedType) fail(`바인딩 ${where} 의 ${name} 은 ${variable.type} 변수입니다(${expectedType} 이어야 합니다)`);
  used.set(name, (used.get(name) ?? 0) + 1);
};
const counts = { xv: 0, iv: 0, vv: 0 };
for (const [target, binding] of Object.entries(plan.bindings ?? {})) {
  for (const [path, entry] of Object.entries(binding)) {
    const where = `${target} ${path}`;
    if (entry.xv != null) { counts.xv += 1; use(entry.xv, where, "STRING"); }
    if (entry.iv != null) {
      counts.iv += 1;
      for (const name of typeof entry.iv === "object" ? Object.values(entry.iv) : [entry.iv]) use(name, where, "STRING");
    }
    if (entry.vv != null) { counts.vv += 1; use(entry.vv, where, "BOOLEAN"); }
  }
}
for (const variable of [...strings, ...booleans]) {
  if ((used.get(variable.name) ?? 0) !== variable.uses) fail(`변수 ${variable.name} 의 uses ${variable.uses} 가 바인딩에서 센 ${used.get(variable.name) ?? 0} 과 다릅니다`);
}
for (const [key, label] of [["boundTexts", "xv"], ["boundLabels", "iv"], ["boundVisible", "vv"]]) {
  if (plan.stats?.[key] !== counts[label]) fail(`stats.${key} ${plan.stats?.[key]} 가 바인딩에서 센 ${counts[label]} 과 다릅니다`);
}
if (plan.stats?.variables !== strings.length) fail(`stats.variables ${plan.stats?.variables} 가 변수 ${strings.length}개와 다릅니다`);
if (plan.stats?.presenceVariables !== booleans.length) fail(`stats.presenceVariables ${plan.stats?.presenceVariables} 가 존재 변수 ${booleans.length}개와 다릅니다`);

// ── ② 러너와 계획 ─────────────────────────────────────────────────────────────
const runnerRows = { strings: new Map(), booleans: new Map() };
if (!Array.isArray(plan.runners) || plan.runners.length === 0) fail("계획에 러너가 없습니다");
for (const runner of plan.runners ?? []) {
  const absolute = resolve(repoRoot, runner);
  if (!existsSync(absolute)) { fail(`러너가 없습니다: ${runner}`); continue; }
  const line = readFileSync(absolute, "utf8").split("\n").find((text) => text.startsWith("const P="));
  if (!line) { fail(`러너에 payload(const P=) 가 없습니다: ${runner}`); continue; }
  const payload = JSON.parse(line.slice("const P=".length).replace(/;$/, ""));
  if (payload.collection !== COLLECTION || JSON.stringify(payload.modes) !== JSON.stringify(LOCALES) || payload.hidden !== true) {
    fail(`러너 ${runner} 의 컬렉션 · 모드 · hidden 이 계획과 다릅니다`);
  }
  for (const kind of ["strings", "booleans"]) {
    for (const [id, name, ...values] of payload[kind] ?? []) {
      if (runnerRows[kind].has(id)) fail(`러너에 변수 ${id}(${name}) 가 두 번 있습니다`);
      runnerRows[kind].set(id, { name, values });
    }
  }
}
for (const [kind, variables] of [["strings", strings], ["booleans", booleans]]) {
  const rows = runnerRows[kind];
  for (const variable of variables) {
    const row = rows.get(variable.id);
    if (!row) { fail(`러너에 계획의 변수가 없습니다: ${variable.name}`); continue; }
    if (row.name !== variable.name) fail(`러너의 변수 이름 ${row.name} 이 계획의 ${variable.name} 과 다릅니다`);
    if (JSON.stringify(row.values) !== JSON.stringify(LOCALES.map((locale) => variable.values[locale]))) fail(`러너의 변수 ${variable.name} 값이 계획과 다릅니다`);
  }
  const planned = new Set(variables.map((variable) => variable.id));
  for (const id of rows.keys()) if (!planned.has(id)) fail(`러너에 계획에 없는 변수가 있습니다: ${rows.get(id).name}`);
}

// ── ③ 커밋 — 로캘 원장 ↔ lock 앵커 · 계획 ──────────────────────────────
const anchor = readAnchor();
const pin = (label, commit) => {
  if (typeof commit !== "string") fail(`${label} 에 productCommit 이 없습니다`);
  else if (!samePin(commit, anchor.commit)) fail(`${label} 의 productCommit ${commit.slice(0, 8)} 이 lock 앵커 ${anchor.commit.slice(0, 8)} 와 다릅니다`);
};
if (typeof plan.productCommit !== "string") fail("계획에 productCommit 이 없습니다");
const ledgerEntries = Object.entries(plan.ledgers ?? {});
if (ledgerEntries.length === 0) fail("계획에 로캘 원장이 하나도 적혀 있지 않습니다");
for (const [key, file] of ledgerEntries) {
  const absolute = resolve(repoRoot, file);
  if (!existsSync(absolute)) { fail(`로캘 원장 ${key} 파일이 없습니다: ${file}`); continue; }
  const ledger = JSON.parse(readFileSync(absolute, "utf8"));
  pin(`로캘 원장 ${key}`, ledger.productCommit);
  if (!samePin(ledger.productCommit, plan.productCommit)) fail(`로캘 원장 ${key} 의 커밋 ${String(ledger.productCommit).slice(0, 8)} 이 계획의 ${String(plan.productCommit).slice(0, 8)} 와 다릅니다`);
  const locale = key.split(".").pop();
  if (ledger.fixture?.locale !== locale) fail(`로캘 원장 ${key} 의 fixture.locale 이 ${ledger.fixture?.locale} 입니다(${locale} 이어야 합니다)`);
}
// 계획의 커밋이 보드 계획의 커밋과 같은지는 ④ 생성기 재현이 본다(생성기가 둘이 다르면 멈춘다).

// ── ④ 생성기 재현 ─────────────────────────────────────────────────────────────
let regenerated = "하지 않음(--no-regenerate)";
if (regenerate) {
  try {
    execFileSync("node", ["scripts/build-figma-locale-strings.mjs", "--check", ...(localeDir ? [`--locale-dir=${localeDir}`] : [])], {
      cwd: repoRoot, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"], maxBuffer: 1 << 28,
    });
    regenerated = "통과(계획 · 러너가 생성기 출력과 바이트로 같다)";
  } catch (error) {
    const message = String(error.stderr || error.message);
    const reason = (message.match(/Error: (\[figma-locale-strings\] .*)/)?.[1] ?? message.trim().split("\n").find((text) => text.trim()) ?? "").slice(0, 400);
    if (/생성물이 (다릅니다|없습니다)|더 이상 생성하지 않는 러너/.test(reason)) {
      regenerated = "어긋남";
      fail(`생성기 재현 대조가 어긋났습니다 — 계획이 입력(로캘 원장 짝짓기)과 다릅니다: ${reason}`);
    } else {
      regenerated = "NOT_MEASURED(생성기를 돌릴 수 없음)";
      fail(`생성기 재현 대조를 재지 못했습니다(NOT_MEASURED) — ${reason}`);
    }
  }
}

// ── coverage ────────────────────────────────────────────────────────────────
const sum = (list, key) => list.reduce((total, item) => total + (item[key] ?? 0), 0);
const targetTexts = sum(plan.targets ?? [], "texts");
const targetLabels = sum(plan.targets ?? [], "labels");
const report = plan.report ?? {};
const count = (name) => (report[name] ?? []).length;
const richFixed = count("richTextEnFixed");
const unpaired = count("textMissing") + count("labelUnresolved");
if (plan.stats.boundTexts + richFixed > targetTexts) fail(`묶은 글자 ${plan.stats.boundTexts} + en 고정 rich-text ${richFixed} 가 대상 글자 ${targetTexts} 를 넘습니다`);
if (plan.stats.boundLabels > targetLabels) fail(`묶은 라벨 ${plan.stats.boundLabels} 가 대상 라벨 ${targetLabels} 를 넘습니다`);
for (const name of ["enDrift", "textMissing", "tagMismatch", "labelUnresolved"]) {
  if (count(name) > 0) warnings.push(`${name} ${count(name)}건`);
}
const percent = (part, whole) => (whole === 0 ? "—" : `${Math.round((part / whole) * 1000) / 10}%`);
const scopeText = plan.scope === "all" ? "전체" : Array.isArray(plan.scope) ? plan.scope.join(", ") : String(plan.scope);

console.log(`[check-locale-strings] ${relative(planPath)} @ ${String(plan.productCommit).slice(0, 8)} · 범위 ${scopeText} · 대상 ${(plan.targets ?? []).length}`);
console.log(`  묶은 글자        ${plan.stats.boundTexts} / 대상 글자 ${targetTexts} (${percent(plan.stats.boundTexts, targetTexts)}) · 묶은 라벨 ${plan.stats.boundLabels} / ${targetLabels} · 존재(visible) ${plan.stats.boundVisible}`);
console.log(`  세 값 같아 리터럴 ${plan.stats.literalSameAcrossLocales} (글자 · 라벨 합) · en 고정 rich-text ${richFixed}`);
console.log(`  짝 없음          ${unpaired} (경로는 있는데 글자 없음 ${count("textMissing")} · 라벨 출처 못 찾음 ${count("labelUnresolved")}) · 로캘에만 있는 글자 ${count("localeOnly")} · 태그 불일치 ${count("tagMismatch")} · en 원장과 다른 보드 글자 ${count("enDrift")} · 로캘에서 서식 잃음 ${count("localeRichLost")}`);
console.log(`  배치 위험        ${count("layoutDelta")} (로캘 rect 가 en 과 2px 넘게 다른 글자 — 고정 크기 조상이 있으면 넘침 · 빈자리 후보)`);
console.log(`  변수             글자 ${strings.length} (i18n ${plan.dictionary?.i18n ?? "?"} · 측정 ${plan.dictionary?.measured ?? "?"} · 사전 불일치 ${(plan.dictionary?.disagreements ?? []).length}) · 존재 ${booleans.length} · 러너 ${(plan.runners ?? []).length}`);
console.log(`  커밋             lock 앵커 ${anchor.commit.slice(0, 8)} · 로캘 원장 ${ledgerEntries.length}개`);
console.log(`  생성기 재현      ${regenerated}`);

const blocking = strict ? [...problems, ...warnings.map((warning) => `보고: ${warning}`)] : problems;
if (warnings.length > 0 && !strict) console.log(`  [주의] 짝 없음 · 어긋남 보고가 있습니다: ${warnings.join(" · ")} (--strict 면 실패)`);
if (blocking.length > 0) {
  for (const message of blocking) console.error(`[check-locale-strings] 실패: ${message}`);
  process.exit(1);
}
console.log("[check-locale-strings] OK");
