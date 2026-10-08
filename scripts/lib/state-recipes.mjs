// 상태 레시피 — 한 라우트의 「상호작용 · 응답 · 시드로만 서는 상태」를 측정기가 재게 하는 선언.
//
// 정본 설계: 2026-10-08 상태 레시피 설계서(작업 메모 louis-uptake/2026-10-08-state-recipes-design.md) 1절 · 3절.
// 이 모듈은 측정기와 떨어져 있다 — 읽기 · 스키마 검증 · 정규화 · 단계 실행 · 가로채기 라우터 · 인용 확인만
// 한다. 측정기(`measure-product-auth-fixture.mjs --states=<영역>`)가 아래 표의 자리에서 이 모듈을 부른다(설계서 2절 —
// 줄 번호는 설계서를 쓸 때의 작업 트리 기준이라 지금 파일과 어긋난다, 자리 이름으로 찾는다). 새 코드는 모두 `statesArea` 나
// `spec.recipe` 가 있을 때만 돌아 기존 원장이 한 바이트도 바뀌지 않는다.
//
// ┌────┬──────────────────────────────┬──────────────────────────────────────────────────────────────┐
// │ #  │ 측정기 자리(작업 트리 줄)    │ 바꿀 것 — 이 모듈에서 부를 것                                │
// ├────┼──────────────────────────────┼──────────────────────────────────────────────────────────────┤
// │ 1  │ 26–40 모드 판정              │ --states=<area> → loadArea(area).mode 로 네 불리언을 정한다. │
// │    │                              │ 40줄 배타 검사에 states 를 넣는다.                           │
// │ 2  │ 41–46 출력 경로              │ states 면 migration/product-states/<area>.json               │
// │ 3  │ 312–328 SCREEN_SPECS         │ specFromRecipe(recipe, baseSpecs) 로 편다. 키 집합은         │
// │    │                              │ `...(spec.recipe ? { recipe } : {})` 로만 늘린다.            │
// │ 4  │ 377–391 routeFiles           │ file 우선(그대로). checkCites(recipe, productRoot, commit)    │
// │    │                              │ 를 여기서 함께 부르고 문제가 있으면 unavailable.              │
// │ 5  │ 705–706 + 가짜 Supabase      │ setOverlay(recipe.supabase) / beginMark(). 오버레이 null 이면 │
// │    │ 104–160                      │ 지금과 같은 분기. 레시피 화면의 400 은 실패.                  │
// │ 6  │ 753–761 직후                 │ recipe.clock → context.clock.setFixedTime(new Date(clock))   │
// │ 7  │ 793–805 route                │ 바깥 판정 앞에 `if (spec.recipe && await router.handle(r))    │
// │    │                              │ return;` — router = createRecipeRouter(recipe, {origin})      │
// │ 8  │ 809–816 isQuiet              │ 레시피 화면만 `[...inflight].every((r) => router.isHeld(r))`  │
// │ 9  │ 856 직후                     │ await runRecipeSteps(page, recipe, contextSpec.id) →          │
// │    │                              │ stabilize(key + " (상태 레시피 후)") → settleAfter → fonts    │
// │ 10 │ 859 · 1143 · 1258 겹침창     │ overlaySelectors 가 비면 문자열 '[role="dialog"]' 그대로      │
// │ 11 │ 1367–1385 화면 기록          │ stateRecipe {area, base, sha256: recipeDigest(recipe)} ·      │
// │    │                              │ recipeApi: router.summary() · router.unmatchedRequired() 실패 │
// │    │                              │ · assert 검사 · expectedSearch 는 expectUrl 로                │
// │ 12 │ 1441–1529 · 1533–1581 머리   │ contexts 부분집합이면 빈 칸 건너뜀 · $evidenceClass           │
// │    │                              │ "development-state-recipe-fixture" · sourceQuotes 에 cite    │
// └────┴──────────────────────────────┴──────────────────────────────────────────────────────────────┘
//
// 같은 화면 안에서 setOverlay 는 goto **전에** 걸고 finally(1391)에서 null 로 푼다 — 서버 렌더도 오버레이를
// 봐야 하기 때문이다. 단계는 기본 흐름(goto → 3초 → stabilize → settle → stabilize → fonts.ready) **다음에**
// 돈다(설계서 1-5).
//
// **조용한 통과를 막는 규칙**(설계서 5절 9번) — 이 모듈이 지키는 몫:
//   · park 를 뺀 마지막 단계는 waitFor(클릭이 빗나가도 기본 화면이 조용히 안정되면 그 상태로 잘못 잰다)
//   · assert 는 레시피마다 하나 이상
//   · 한 번도 맞지 않은 required api 항목은 실패(unmatchedRequired)
//   · cite 줄의 내용이 다르면 실패(checkCites)
//   · 위치 지정자는 엄격 — 맞는 요소가 둘 이상이면 실패
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, lstatSync, readFileSync, readdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { validateJsonSchema } from "./json-schema.mjs";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../..");

/** 영역 파일 폴더(저장소 상대). jsonFile 은 이 폴더 기준이다. */
export const MEASURE_STATES_DIR = "migration/measure-states";
const statesDir = resolve(repoRoot, MEASURE_STATES_DIR);
const schemaPath = resolve(statesDir, "_schema.json");

const TAG = "[state-recipes]";
/** 측정기의 CONTEXTS id 와 같아야 한다(measure-product-auth-fixture.mjs 126–128). */
export const CONTEXT_IDS = ["desktop-1920x1080", "mobile-402x874"];
export const STATE_PATTERN = /^[a-z0-9][a-z0-9-]*(\.[a-z0-9-]+)*$/;
const AREA_PATTERN = /^[a-z][a-z0-9-]*$/;
const ACTIONS = ["click", "dblclick", "hover", "fill", "press", "scrollIntoView", "waitFor", "blur", "park", "drag"];
const DEFAULT_TIMEOUT_MS = 30_000;
const BODYLESS_STATUS = new Set([204, 304]);

let cachedSchema = null;
function readSchema() {
  cachedSchema ??= JSON.parse(readFileSync(schemaPath, "utf8"));
  return cachedSchema;
}

/** `migration/measure-states/*.json` 가운데 `_` 로 시작하지 않는 영역 이름. 정렬해 돌려준다. */
export function listAreas() {
  if (!existsSync(statesDir)) return [];
  return readdirSync(statesDir)
    .filter((name) => name.endsWith(".json") && !name.startsWith("_"))
    .map((name) => name.slice(0, -".json".length))
    .sort();
}

/**
 * 영역 파일 하나를 읽고 스키마로 검증한 뒤 정규화한다. **base 물려받기는 하지 않는다** — 그것은 측정기의
 * SCREEN_SPECS 가 있어야 하므로 specFromRecipe 의 몫이다.
 *
 * 스키마 위반이 하나라도 있으면 모두 모아 던진다(부분 정규화된 값을 돌려주지 않는다).
 *
 * @param {string} area 영역 이름(파일 이름에서 .json 을 뺀 것)
 * @returns {{ area: string, mode: string, authoredAgainst: string, file: string, sha256: string,
 *   recipes: NormalizedRecipe[] }}
 */
export function loadArea(area) {
  if (typeof area !== "string" || !AREA_PATTERN.test(area)) {
    throw new Error(`${TAG} 영역 이름이 꼴에 맞지 않습니다: ${String(area)}`);
  }
  const file = `${MEASURE_STATES_DIR}/${area}.json`;
  const absolute = resolve(repoRoot, file);
  if (!existsSync(absolute)) throw new Error(`${TAG} 영역 파일이 없습니다: ${file}`);
  const text = readFileSync(absolute, "utf8");
  let raw;
  try {
    raw = JSON.parse(text);
  } catch (error) {
    throw new Error(`${TAG} ${file} JSON 을 읽을 수 없습니다: ${error.message}`);
  }
  const schemaErrors = validateJsonSchema(readSchema(), raw);
  if (schemaErrors.length > 0) {
    throw new Error(
      `${TAG} ${file} 스키마 위반 ${schemaErrors.length}건:\n` +
        schemaErrors.map((e) => `  ${e.path}: ${e.message}`).join("\n"),
    );
  }
  if (raw.area !== area) {
    throw new Error(`${TAG} ${file} 의 area 가 파일 이름과 다릅니다: ${raw.area}`);
  }
  return {
    area,
    mode: raw.mode,
    authoredAgainst: raw.authoredAgainst,
    file,
    sha256: sha256(text),
    recipes: raw.recipes.map((recipe, index) => normalizeRecipe(recipe, { area, mode: raw.mode, index })),
  };
}

/**
 * @typedef {object} NormalizedRecipe
 * 원래 필드 + 기본값(steps [] · pointer "park" · overlaySelectors [] · settleAfter false ·
 * api[].status 200 · required true · hold false · supabase {tables, rpc}) + 파생 필드
 * area · mode · index · baseKey(base ?? pattern) · state(키의 상태 꼬리).
 * jsonFile 항목에는 jsonPath(저장소 상대)가 붙는다 — 본문은 라우터가 처음 쓸 때 읽는다.
 */
function normalizeRecipe(recipe, { area, mode, index }) {
  const baseKey = recipe.base ?? recipe.pattern;
  const prefix = baseKey + " ";
  const state = recipe.id.startsWith(prefix) ? recipe.id.slice(prefix.length) : null;
  const tables = {};
  for (const [name, seed] of Object.entries(recipe.supabase?.tables ?? {})) {
    tables[name] = Array.isArray(seed)
      ? { rows: seed, extendBase: false }
      : { rows: seed.rows, extendBase: seed.extendBase === true, ...(seed.requireFilter ? { requireFilter: seed.requireFilter } : {}) };
  }
  return {
    ...recipe,
    area,
    mode,
    index,
    baseKey,
    state,
    steps: recipe.steps ?? [],
    pointer: recipe.pointer ?? "park",
    overlaySelectors: recipe.overlaySelectors ?? [],
    settleAfter: recipe.settleAfter === true,
    cite: recipe.cite ?? [],
    surfaces: recipe.surfaces ?? [],
    api: (recipe.api ?? []).map((entry) => ({
      ...entry,
      status: entry.status ?? 200,
      required: entry.required !== false,
      hold: entry.hold === true,
      ...(entry.jsonFile ? { jsonPath: `${MEASURE_STATES_DIR}/${entry.jsonFile}` } : {}),
    })),
    supabase: {
      tables,
      rpc: recipe.supabase?.rpc ?? {},
      ...(recipe.supabase?.module ? { module: recipe.supabase.module } : {}),
    },
  };
}

/**
 * 스키마가 말하지 못하는 규칙을 모든 영역에 걸쳐 판정한다. 던지지 않고 오류 문장 배열을 돌려준다
 * (한 번에 모든 문제를 보고하는 저장소의 관행).
 *
 * 규칙: 키 중복(영역 사이 포함) · 키에 # @ 금지 · 키 = 기준 키 + 공백 + 상태 · park 를 뺀 마지막 단계는
 * waitFor(steps 와 stepsByContext 각각) · assert 하나 이상 · apiHit all 인데 api 가 비면 오류 · jsonFile 은
 * data/<area>/ 아래에 실재하는 일반 파일이고 JSON · hold 가 아니면 json/jsonFile 하나(204 · 304 예외) ·
 * 똑같은 api 항목(뒤 것은 영영 안 맞음) · name 은 role 과만, exact 는 css 와 함께 못 씀 · park 좌표 길이 2 ·
 * drag hold 면 pointer keep · stepsByContext 키는 contexts 안 · supabase.module 은 자기 영역 파일이고 실재 ·
 * cssAssert 는 equals 와 sameAsBase 가운데 하나.
 *
 * @param {ReturnType<typeof loadArea>[]} areas
 * @returns {string[]}
 */
export function validateRecipes(areas) {
  const errors = [];
  const seenKeys = new Map();
  for (const loaded of areas) {
    for (const recipe of loaded.recipes) {
      const where = `${loaded.file} recipes[${recipe.index}] ${JSON.stringify(recipe.id)}`;
      const push = (message) => errors.push(`${where}: ${message}`);

      if (/[#@]/.test(recipe.id)) push("키에 # 나 @ 를 쓸 수 없습니다(보드 구성 id 가 route@context#path 꼴)");
      if (recipe.state === null || !STATE_PATTERN.test(recipe.state)) {
        push(`키는 "<기준 키> <상태>" 꼴이어야 합니다 — 기준 키 ${JSON.stringify(recipe.baseKey)}`);
      }
      if (seenKeys.has(recipe.id)) push(`키 중복 — 먼저 ${seenKeys.get(recipe.id)}`);
      else seenKeys.set(recipe.id, loaded.file);

      const stepLists = [["steps", recipe.steps]];
      for (const [contextId, steps] of Object.entries(recipe.stepsByContext ?? {})) {
        stepLists.push([`stepsByContext.${contextId}`, steps]);
        if (recipe.contexts && !recipe.contexts.includes(contextId)) {
          push(`stepsByContext.${contextId} 가 contexts 밖입니다`);
        }
      }
      for (const [label, steps] of stepLists) {
        const acting = steps.filter((step) => !("park" in step));
        if (acting.length > 0 && !("waitFor" in acting[acting.length - 1])) {
          push(`${label}: park 를 뺀 마지막 단계는 waitFor 여야 합니다(지금 ${describeStep(acting[acting.length - 1])})`);
        }
        steps.forEach((step, i) => {
          for (const problem of stepProblems(step)) push(`${label}[${i}]: ${problem}`);
          if (step.drag && step.hold === true && recipe.pointer !== "keep") {
            push(`${label}[${i}]: drag hold 는 pointer "keep" 과만 — park 가 버튼을 누른 채 마우스를 옮긴다`);
          }
        });
      }

      const assert = recipe.assert ?? {};
      const checks = (assert.text?.length ?? 0) + (assert.apiHit ? 1 : 0) + (assert.css?.length ?? 0);
      if (checks === 0) push("assert 에 검증이 하나도 없습니다(text · apiHit · css 가운데 하나 이상)");
      if (assert.apiHit === "all" && recipe.api.length === 0) push("assert.apiHit 가 all 인데 api 가 비었습니다");
      (assert.css ?? []).forEach((entry, i) => {
        const has = ("equals" in entry ? 1 : 0) + (entry.sameAsBase ? 1 : 0);
        if (has !== 1) push(`assert.css[${i}]: equals 와 sameAsBase 가운데 정확히 하나`);
      });

      const apiSignatures = new Map();
      recipe.api.forEach((entry, i) => {
        const label = `api[${i}] ${entry.method} ${entry.path}`;
        const signature = JSON.stringify([entry.method, entry.path, sortedEntries(entry.query ?? {})]);
        if (apiSignatures.has(signature)) push(`${label}: api[${apiSignatures.get(signature)}] 와 똑같아 영영 맞지 않습니다`);
        else apiSignatures.set(signature, i);
        const bodies = ("json" in entry ? 1 : 0) + (entry.jsonFile ? 1 : 0);
        if (entry.hold) {
          if (bodies > 0) push(`${label}: hold 항목은 답하지 않으므로 json · jsonFile 을 두지 않습니다`);
        } else if (bodies > 1) {
          push(`${label}: json 과 jsonFile 은 하나만`);
        } else if (bodies === 0 && !BODYLESS_STATUS.has(entry.status)) {
          push(`${label}: json 이나 jsonFile 이 필요합니다(본문 없는 응답은 204 · 304 만)`);
        }
        if (entry.jsonFile) {
          for (const problem of jsonFileProblems(entry.jsonFile, loaded.area)) push(`${label}: ${problem}`);
        }
      });

      if (recipe.supabase.module) {
        const [modulePath] = recipe.supabase.module.split("#");
        if (modulePath !== `scripts/lib/state-seeds/${loaded.area}.mjs`) {
          push(`supabase.module 은 자기 영역 시드 파일이어야 합니다: ${modulePath}`);
        } else if (!isPlainFile(resolve(repoRoot, modulePath))) {
          push(`supabase.module 파일이 없습니다: ${modulePath}`);
        }
      }
    }
  }
  return errors;
}

function stepProblems(step) {
  const problems = [];
  const action = ACTIONS.find((name) => name in step);
  if (action === "park" && step.park.length !== 2) problems.push("park 는 [x, y] 두 수");
  const locators = [];
  if (action && isObject(step[action])) locators.push(step[action]);
  if (isObject(step.on)) locators.push(step.on);
  for (const locator of locators) problems.push(...locatorProblems(locator));
  return problems;
}

function locatorProblems(L) {
  const problems = [];
  if ("name" in L && !("role" in L)) problems.push(`name 은 role 과만 씁니다(${describeLocator(L)})`);
  if ("exact" in L && "css" in L) problems.push(`exact 는 css 와 함께 쓸 수 없습니다(${describeLocator(L)})`);
  if (L.within) problems.push(...locatorProblems(L.within));
  return problems;
}

function jsonFileProblems(jsonFile, area) {
  const problems = [];
  if (!jsonFile.startsWith(`data/${area}/`)) problems.push(`jsonFile 은 data/${area}/ 아래여야 합니다: ${jsonFile}`);
  if (jsonFile.split("/").some((part) => part === ".." || part === "." || part === "")) {
    problems.push(`jsonFile 경로에 . · .. · 빈 칸을 쓸 수 없습니다: ${jsonFile}`);
    return problems;
  }
  const absolute = resolve(statesDir, jsonFile);
  if (!isPlainFile(absolute)) {
    problems.push(`jsonFile 이 없거나 일반 파일이 아닙니다: ${MEASURE_STATES_DIR}/${jsonFile}`);
    return problems;
  }
  try {
    JSON.parse(readFileSync(absolute, "utf8"));
  } catch (error) {
    problems.push(`jsonFile 이 JSON 이 아닙니다: ${error.message}`);
  }
  return problems;
}

/**
 * 레시피를 측정기의 화면 명세로 편다(설계서 2절 3번). base 가 있으면 같은 모드의 화면 명세에서
 * pattern · url · file · fullPage · reducedMotion 을 물려받고, 레시피의 url · file · fullPage ·
 * reducedMotion 이 덮어쓴다. 측정기 SCREEN_SPECS 와 같은 키 꼴(expectedPath · expectedSearch)을 돌려주되
 * expectedSearch 는 expectUrl 로 계산한다.
 *
 * @param {NormalizedRecipe} recipe
 * @param {{ id: string, pattern: string, url: string, file?: string, fullPage?: boolean,
 *   reducedMotion?: boolean }[]} baseSpecs 측정기가 그 모드로 편 SCREEN_SPECS
 */
export function specFromRecipe(recipe, baseSpecs) {
  let inherited = {};
  if (recipe.base) {
    const base = baseSpecs.find((spec) => spec.id === recipe.base);
    if (!base) throw new Error(`${TAG} ${recipe.id}: 같은 모드에 기준 화면이 없습니다: ${recipe.base}`);
    inherited = base;
  }
  const pattern = recipe.pattern ?? inherited.pattern;
  const url = recipe.url ?? inherited.url ?? pattern;
  const file = recipe.file ?? inherited.file;
  const fullPage = recipe.fullPage ?? inherited.fullPage ?? false;
  const reducedMotion = recipe.reducedMotion ?? inherited.reducedMotion ?? false;
  const target = new URL(recipe.expectUrl ?? url, "http://fixture.invalid");
  return {
    id: recipe.id,
    pattern,
    url,
    ...(file ? { file } : {}),
    ...(fullPage ? { fullPage: true } : {}),
    ...(reducedMotion ? { reducedMotion: true } : {}),
    expectedPath: target.pathname,
    expectedSearch: target.search,
    recipe,
  };
}

/**
 * 레시피의 `supabase` 를 가짜 Supabase 오버레이(`{ tables, rpc }`, fixture-fake-supabase setOverlay 의 꼴)로 편다(설계서 1-3 ·
 * 2절 5번). 바꿀 것이 하나도 없으면 null 을 돌려준다 — 그 화면은 오버레이 없는 종전 분기를 탄다.
 *   · module  `scripts/lib/state-seeds/<area>.mjs#<export>` — export(baseSeeds) 가 돌려준 **시드 전체**가 오버레이 표가 된다
 *   · tables  extendBase 가 아니면 그 표를 통째로 바꾸고, extendBase 면 앞 단계(모듈 결과, 없으면 baseSeeds)의 행 뒤에 붙인다
 *             (requireFilter 는 레시피 값, 없으면 앞 단계 값을 물려받는다)
 *   · rpc     그대로(없는 함수는 가짜 Supabase 의 기본 null)
 *
 * @param {NormalizedRecipe} recipe
 * @param {Record<string, object[] | { rows: object[], requireFilter?: string }>} baseSeeds 측정 모드의 기본 시드
 */
export async function supabaseOverlayOf(recipe, baseSeeds) {
  const { tables = {}, rpc = {}, module } = recipe.supabase ?? {};
  if (!module && Object.keys(tables).length === 0 && Object.keys(rpc).length === 0) return null;
  let current = baseSeeds;
  const out = {};
  if (module) {
    const [modulePath, name] = module.split("#");
    const loaded = await import(pathToFileURL(resolve(repoRoot, modulePath)).href);
    if (typeof loaded[name] !== "function") throw new Error(`${TAG} ${recipe.id}: ${module} 이 함수가 아닙니다`);
    current = loaded[name](baseSeeds);
    if (!isObject(current)) throw new Error(`${TAG} ${recipe.id}: ${module} 이 시드 객체를 돌려주지 않았습니다`);
    Object.assign(out, current);
  }
  for (const [name, seed] of Object.entries(tables)) {
    const prior = seed.extendBase && Object.hasOwn(current, name) ? current[name] : null;
    const rows = seed.extendBase ? [...(Array.isArray(prior) ? prior : prior?.rows ?? []), ...seed.rows] : seed.rows;
    const requireFilter = seed.requireFilter ?? (seed.extendBase && !Array.isArray(prior) ? prior?.requireFilter : undefined);
    out[name] = { rows, ...(requireFilter ? { requireFilter } : {}) };
  }
  return { tables: out, rpc };
}

/**
 * 위치 지정자 L 을 Playwright Locator 로 푼다. role · text · label · placeholder · css 가운데 정확히 하나,
 * 선택으로 within(L, 그 안에서 찾음) · nth. 엄격 모드는 Playwright 동작이 지키고, runRecipeSteps 가
 * waitFor 뒤에도 한 번 더 센다.
 *
 * @param {import("playwright").Page | import("playwright").Locator} page
 * @param {object} L
 * @returns {import("playwright").Locator}
 */
export function resolveLocator(page, L) {
  if (!isObject(L)) throw new Error(`${TAG} 위치 지정자가 객체가 아닙니다: ${JSON.stringify(L)}`);
  const kinds = ["role", "text", "label", "placeholder", "css"].filter((kind) => kind in L);
  if (kinds.length !== 1) throw new Error(`${TAG} 위치 지정자는 종류 하나만: ${describeLocator(L)}`);
  const scope = L.within ? resolveLocator(page, L.within) : page;
  const exact = L.exact === undefined ? {} : { exact: L.exact };
  let locator;
  switch (kinds[0]) {
    case "role":
      locator = scope.getByRole(L.role, { ...(L.name !== undefined ? { name: L.name } : {}), ...exact });
      break;
    case "text":
      locator = scope.getByText(L.text, exact);
      break;
    case "label":
      locator = scope.getByLabel(L.label, exact);
      break;
    case "placeholder":
      locator = scope.getByPlaceholder(L.placeholder, exact);
      break;
    default:
      locator = scope.locator(L.css);
  }
  return L.nth === undefined ? locator : locator.nth(L.nth);
}

/** 오류 문장용 위치 지정자 요약 — 예: `role=tab name=모델`. */
export function describeLocator(L) {
  if (!isObject(L)) return String(L);
  const parts = [];
  for (const key of ["role", "name", "text", "label", "placeholder", "css"]) {
    if (key in L) parts.push(`${key}=${L[key]}`);
  }
  if (L.exact !== undefined) parts.push(`exact=${L.exact}`);
  if (L.nth !== undefined) parts.push(`nth=${L.nth}`);
  if (L.within) parts.push(`within(${describeLocator(L.within)})`);
  return parts.join(" ");
}

/** 오류 문장용 단계 요약 — 예: `click role=tab name=모델`. */
export function describeStep(step) {
  const action = ACTIONS.find((name) => name in step) ?? "?";
  if (action === "park") return `park ${JSON.stringify(step.park)}`;
  if (action === "blur") return "blur";
  if (action === "press") return `press ${step.press}${step.on ? " on " + describeLocator(step.on) : ""}`;
  if (action === "drag") return `drag ${describeLocator(step.drag)} by ${step.by.dx},${step.by.dy}${step.hold ? " hold" : ""}`;
  if (action === "waitFor") return `waitFor ${describeLocator(step.waitFor)} ${step.state ?? "visible"}`;
  return `${action} ${describeLocator(step[action])}`;
}

/**
 * 레시피 단계를 차례로 돈다. 뷰포트별 덮어쓰기(stepsByContext[contextId])가 있으면 그것을 쓴다.
 * 실패하면 `[product-auth-fixture] <키> 단계 #n(<요약>) <원인>` 으로 던진다(크게 실패).
 * 끝나면 pointer 가 "park" 일 때 마지막 park 좌표(없으면 [0, 0])로 마우스를 옮긴다.
 *
 * @param {import("playwright").Page} page
 * @param {NormalizedRecipe} recipe
 * @param {string | { id: string }} contextId 측정기의 CONTEXTS id(또는 그 항목)
 * @returns {Promise<{ steps: number, parkedAt: [number, number] | null }>}
 */
export async function runRecipeSteps(page, recipe, contextId) {
  const id = typeof contextId === "string" ? contextId : contextId?.id;
  const steps = recipe.stepsByContext?.[id] ?? recipe.steps ?? [];
  let parkAt = [0, 0];
  for (const [index, step] of steps.entries()) {
    const timeout = step.timeoutMs ?? DEFAULT_TIMEOUT_MS;
    try {
      if ("park" in step) {
        parkAt = [step.park[0], step.park[1]];
        await page.mouse.move(parkAt[0], parkAt[1]);
      } else if ("blur" in step) {
        await page.evaluate(() => {
          const active = document.activeElement;
          if (active && typeof active.blur === "function") active.blur();
        });
      } else if ("press" in step) {
        if (step.on) await resolveLocator(page, step.on).press(step.press, { timeout });
        else await page.keyboard.press(step.press);
      } else if ("fill" in step) {
        await resolveLocator(page, step.fill).fill(step.value, { timeout });
      } else if ("scrollIntoView" in step) {
        await resolveLocator(page, step.scrollIntoView).scrollIntoViewIfNeeded({ timeout });
      } else if ("waitFor" in step) {
        const state = step.state ?? "visible";
        const locator = resolveLocator(page, step.waitFor);
        await locator.waitFor({ state, timeout });
        if (state === "visible" || state === "attached") {
          const count = await locator.count();
          if (count !== 1) throw new Error(`엄격 모드: 맞는 요소가 ${count}개입니다`);
        }
      } else if ("drag" in step) {
        await dragBy(page, resolveLocator(page, step.drag), step, timeout);
      } else {
        const action = ["click", "dblclick", "hover"].find((name) => name in step);
        if (!action) throw new Error("알 수 없는 단계");
        const locator = resolveLocator(page, step[action]);
        const options = { timeout, ...(step.position ? { position: step.position } : {}) };
        const act = () => locator[action](options);
        if (step.expectResponse) {
          await Promise.all([page.waitForResponse((response) => responseMatches(response, step.expectResponse), { timeout }), act()]);
        } else {
          await act();
        }
      }
    } catch (error) {
      throw new Error(
        `[product-auth-fixture] ${recipe.id} 단계 #${index + 1}(${describeStep(step)}) ${error?.message ?? error}`,
        { cause: error },
      );
    }
  }
  const holding = steps.some((step) => "drag" in step && step.hold === true);
  if (recipe.pointer !== "keep" && !holding) {
    await page.mouse.move(parkAt[0], parkAt[1]);
    return { steps: steps.length, parkedAt: parkAt };
  }
  return { steps: steps.length, parkedAt: null };
}

async function dragBy(page, locator, step, timeout) {
  await locator.waitFor({ state: "visible", timeout });
  const box = await locator.boundingBox({ timeout });
  if (!box) throw new Error("끌 요소의 상자가 없습니다");
  const x = box.x + box.width / 2;
  const y = box.y + box.height / 2;
  await page.mouse.move(x, y);
  await page.mouse.down();
  await page.mouse.move(x + step.by.dx, y + step.by.dy, { steps: 10 });
  if (step.hold !== true) await page.mouse.up();
}

function responseMatches(response, match) {
  const request = response.request();
  if (request.method() !== match.method) return false;
  const target = new URL(response.url());
  if (target.pathname !== match.path) return false;
  if (!querySubset(target.searchParams, match.query)) return false;
  return match.status === undefined || response.status() === match.status;
}

function querySubset(searchParams, query) {
  if (!query) return true;
  return Object.entries(query).every(([key, value]) => searchParams.getAll(key).includes(value));
}

/**
 * 같은 출처 /api/* 가로채기 라우터. context.route 처리기에서 바깥 판정 **앞에** 부른다:
 *   `if (spec.recipe && await router.handle(intercepted)) return;`
 * method · path 가 정확히 같고 query 가 부분집합이면 맞는다. 먼저 맞은 항목이 이긴다. hold 항목은 답하지
 * 않고 요청을 붙잡아 둔다(로딩 상태용) — isQuiet 는 붙잡힌 요청을 진행 중으로 세지 않게 isHeld 를 쓴다.
 *
 * @param {NormalizedRecipe} recipe
 * @param {{ origin?: string }} [options] origin 을 주면 그 출처의 요청만 본다(측정기: fixtureServer.url)
 */
export function createRecipeRouter(recipe, { origin } = {}) {
  const entries = (recipe.api ?? []).map((entry) => ({ entry, hits: 0, body: undefined }));
  const held = new Set();

  function bodyOf(slot) {
    if (slot.body !== undefined) return slot.body;
    const { entry } = slot;
    if ("json" in entry) slot.body = JSON.stringify(entry.json);
    else if (entry.jsonPath) slot.body = readFileSync(resolve(repoRoot, entry.jsonPath), "utf8");
    else slot.body = null;
    return slot.body;
  }

  /** @returns {Promise<boolean>} 이 라우터가 맡았으면 true(호출자는 더 처리하지 않는다). */
  async function handle(intercepted) {
    const request = intercepted.request();
    const target = new URL(request.url());
    if (origin && target.origin !== origin) return false;
    if (!target.pathname.startsWith("/api/")) return false;
    const slot = entries.find(
      ({ entry }) => entry.method === request.method() && entry.path === target.pathname && querySubset(target.searchParams, entry.query),
    );
    if (!slot) return false;
    slot.hits += 1;
    if (slot.entry.hold) {
      held.add(request);
      return true;
    }
    const body = bodyOf(slot);
    await intercepted.fulfill({
      status: slot.entry.status,
      ...(body === null ? {} : { contentType: "application/json; charset=utf-8", body }),
    });
    return true;
  }

  return {
    handle,
    /** 붙잡힌(hold) 요청인가 — isQuiet 갈래용. */
    isHeld: (request) => held.has(request),
    held,
    /** 화면 기록용: [{method, path, query?, status, hold, hits}] — 정의 순서. */
    summary: () =>
      entries.map(({ entry, hits }) => ({
        method: entry.method,
        path: entry.path,
        ...(entry.query ? { query: entry.query } : {}),
        status: entry.status,
        ...(entry.hold ? { hold: true } : {}),
        hits,
      })),
    /** required 인데 한 번도 맞지 않은 항목 — 하나라도 있으면 측정기는 실패한다. */
    unmatchedRequired: () => entries.filter(({ entry, hits }) => entry.required && hits === 0).map(({ entry }) => `${entry.method} ${entry.path}`),
    /** 맞은 횟수를 0 으로(같은 레시피를 다른 뷰포트에서 다시 쓸 때). */
    reset: () => {
      for (const slot of entries) slot.hits = 0;
      held.clear();
    },
  };
}

/**
 * 측정 뒤 검증(설계서 1-3 assert · 5절 9번) 가운데 페이지가 필요 없는 몫. 문제 문장 배열을 돌려준다 — 측정기는 하나라도
 * 있으면 크게 실패한다.
 *   · required 인데 한 번도 맞지 않은 api 항목(assert 와 무관하게 늘)
 *   · assert.apiHit "all" — required 가 아닌 항목까지 모두 한 번 이상
 *   · assert.text — 잰 트리와 겹침창 트리 노드의 ownText 가운데 하나에 그 글자가 들어 있어야 한다
 *
 * @param {NormalizedRecipe} recipe
 * @param {{ tree: { ownText?: string }[], overlays: { tree: { ownText?: string }[] }[] }} measured 측정 패스 결과
 * @param {ReturnType<typeof createRecipeRouter>} router
 */
export function recipeAssertProblems(recipe, measured, router) {
  const problems = [];
  const unmatched = router.unmatchedRequired();
  if (unmatched.length > 0) problems.push(`한 번도 맞지 않은 api 항목: ${unmatched.join(", ")}`);
  if (recipe.assert?.apiHit === "all") {
    const missed = router.summary().filter((entry) => entry.hits === 0).map((entry) => `${entry.method} ${entry.path}`);
    if (missed.length > 0) problems.push(`assert.apiHit all — 맞지 않은 항목: ${missed.join(", ")}`);
  }
  const texts = [...measured.tree, ...measured.overlays.flatMap((overlay) => overlay.tree)]
    .map((node) => node.ownText)
    .filter(Boolean);
  for (const text of recipe.assert?.text ?? []) {
    if (!texts.some((own) => own.includes(text))) problems.push(`assert.text ${JSON.stringify(text)} 가 잰 트리 · 겹침창에 없습니다`);
  }
  return problems;
}

/**
 * assert.css 의 값을 페이지에서 읽는다. 선택자에 맞는 요소는 정확히 하나여야 한다(위치 지정자와 같은 엄격 규칙) —
 * 아니면 그 항목의 값 대신 오류 문장을 돌려준다.
 *
 * @param {import("playwright").Page} page
 * @param {{ selector: string, property: string }[]} entries
 * @returns {Promise<({ value: string } | { error: string })[]>}
 */
export function readRecipeCss(page, entries) {
  return page.evaluate((list) => list.map(({ selector, property }) => {
    const nodes = document.querySelectorAll(selector);
    if (nodes.length !== 1) return { error: `선택자 ${selector} 에 맞는 요소가 ${nodes.length}개입니다` };
    return { value: getComputedStyle(nodes[0]).getPropertyValue(property).trim() };
  }), entries.map(({ selector, property }) => ({ selector, property })));
}

/**
 * 제품 줄 인용과 레시피가 가리키는 제품 파일을 고정 커밋에서 확인한다. 저장소 경로를 기본값으로 두지 않는다 —
 * 호출자가 통합 앵커 작업 트리(또는 측정기의 productRoot)와 커밋을 반드시 준다.
 *
 *   · cite[]: `git show <commit>:<path>` 의 line 번째 줄에 expect 가 들어 있어야 한다
 *   · file: 그 커밋에 있어야 한다
 *   · surfaces[]: 파일이 있고 그 이름의 정의(function · const · let · var · class)가 있어야 한다
 *
 * @param {NormalizedRecipe} recipe
 * @param {string} productRepo 제품 git 작업 트리의 절대 경로
 * @param {string} commit 커밋(짧은 해시 가능)
 * @returns {{ problems: string[], quotes: { command: string, path: string, line: number, quote: string }[] }}
 */
export function checkCites(recipe, productRepo, commit) {
  if (!productRepo || !commit) throw new Error(`${TAG} checkCites 에는 제품 저장소와 커밋이 필요합니다`);
  const problems = [];
  const quotes = [];
  const cache = new Map();
  const show = (path) => {
    if (!cache.has(path)) {
      try {
        cache.set(path, execFileSync("git", ["show", `${commit}:${path}`], { cwd: productRepo, encoding: "utf8", maxBuffer: 64 * 1024 * 1024, stdio: ["ignore", "pipe", "pipe"] }));
      } catch {
        cache.set(path, null);
      }
    }
    return cache.get(path);
  };
  for (const cite of recipe.cite ?? []) {
    const text = show(cite.path);
    if (text === null) {
      problems.push(`${recipe.id}: cite ${cite.path} 가 ${commit} 에 없습니다`);
      continue;
    }
    const line = text.split("\n")[cite.line - 1];
    if (line === undefined) {
      problems.push(`${recipe.id}: cite ${cite.path}:${cite.line} 줄이 없습니다`);
      continue;
    }
    if (!line.includes(cite.expect)) {
      problems.push(`${recipe.id}: cite ${cite.path}:${cite.line} 에 ${JSON.stringify(cite.expect)} 가 없습니다 — 지금 줄: ${JSON.stringify(line.trim())}`);
      continue;
    }
    quotes.push({ command: `git show ${commit}:${cite.path}`, path: cite.path, line: cite.line, quote: line });
  }
  if (recipe.file && show(recipe.file) === null) problems.push(`${recipe.id}: file ${recipe.file} 가 ${commit} 에 없습니다`);
  for (const surface of recipe.surfaces ?? []) {
    const [path, name] = surface.split("#");
    const text = show(path);
    if (text === null) {
      problems.push(`${recipe.id}: surface ${path} 가 ${commit} 에 없습니다`);
      continue;
    }
    const definition = new RegExp(`\\b(?:function\\*?|const|let|var|class)\\s+${name.replace(/\$/g, "\\$")}\\b`);
    if (!definition.test(text)) problems.push(`${recipe.id}: surface ${surface} — 그 파일에 ${name} 정의가 없습니다`);
  }
  return { problems, quotes };
}

/**
 * 화면 기록의 stateRecipe.sha256 용 — 레시피(정규화 전 필드 + 가로챌 본문)의 결정적 해시.
 * 키 순서를 정렬하므로 파일의 들여쓰기 · 키 순서가 바뀌어도 같다. jsonFile 본문도 포함한다.
 */
export function recipeDigest(recipe) {
  const { area, mode, index, baseKey, state, ...fields } = recipe;
  const bodies = (recipe.api ?? []).map((entry) => (entry.jsonPath ? readFileSync(resolve(repoRoot, entry.jsonPath), "utf8") : null));
  return sha256(canonicalJson({ area, mode, fields, bodies }));
}

function canonicalJson(value) {
  if (Array.isArray(value)) return "[" + value.map(canonicalJson).join(",") + "]";
  if (isObject(value)) {
    return "{" + Object.keys(value).sort().map((key) => JSON.stringify(key) + ":" + canonicalJson(value[key])).join(",") + "}";
  }
  return JSON.stringify(value ?? null);
}

function sortedEntries(object) {
  return Object.entries(object).sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0));
}

function sha256(text) {
  return createHash("sha256").update(text).digest("hex");
}

function isPlainFile(absolute) {
  try {
    const stat = lstatSync(absolute);
    return stat.isFile() && !stat.isSymbolicLink();
  } catch {
    return false;
  }
}

function isObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}
