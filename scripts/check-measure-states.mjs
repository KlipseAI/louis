#!/usr/bin/env node
// **상태 레시피 영역 파일을 검사한다** — `migration/measure-states/*.json` 전부를 스키마(`_schema.json`)와
// `scripts/lib/state-recipes.mjs` 의 validateRecipes 로 본다. 측정기를 띄우지 않는 가벼운 검사다.
//
// 아직 package.json 게이트가 아니다(설계서 권장 순서 2 — 측정기에 끼운 뒤 게이트로 올린다). 올릴 때는
// `--require` 를 붙인다: 영역 파일이 0개면 「잰 것 0건」이라 NOT_MEASURED(2)로 끝난다(gate-exit 어휘).
// 지금 기본값은 0개도 통과(0)인데, 그때도 「영역 0개」를 크게 찍는다 — 조용한 exit 0 을 만들지 않는다.
//
// 선택: `--product-repo=<절대 경로>` 를 주면 레시피의 cite · file · surfaces 를 그 저장소의 커밋에서 확인한다.
// 커밋은 `--commit=<sha>`, 없으면 영역 파일의 authoredAgainst. 제품 저장소 경로를 기본값으로 두지 않는다 —
// 레시피는 통합 앵커 작업 트리를 기준으로 쓰므로 호출자가 그 경로를 명시한다.
import { existsSync, readFileSync } from "node:fs";
import { notMeasured } from "./lib/gate-exit.mjs";
import { MEASURE_STATES_DIR, checkCites, listAreas, loadArea, validateRecipes } from "./lib/state-recipes.mjs";
import { validateJsonSchema } from "./lib/json-schema.mjs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const TAG = "check-measure-states";
const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const argValue = (name) => process.argv.find((arg) => arg.startsWith(`--${name}=`))?.slice(name.length + 3);
const requireAreas = process.argv.includes("--require");
const productRepo = argValue("product-repo");
const commitOverride = argValue("commit");

// 스키마 자체가 지원 키워드 안에 있는지는 영역이 0개여도 본다 — 스키마가 깨진 채로 「영역 0개 통과」가 되지 않게.
const schema = JSON.parse(readFileSync(resolve(repoRoot, MEASURE_STATES_DIR, "_schema.json"), "utf8"));
validateJsonSchema(schema, { area: "x", mode: "session", authoredAgainst: "0000000", recipes: [] });

const areas = listAreas();
if (areas.length === 0) {
  if (requireAreas) notMeasured(TAG, `영역 파일이 0개입니다(${MEASURE_STATES_DIR}/*.json)`);
  console.log(`[${TAG}] 영역 파일 0개 — 검사할 레시피가 없습니다(${MEASURE_STATES_DIR}/*.json, 스키마는 읽힘). 게이트로 쓸 때는 --require`);
  process.exit(0);
}

if (productRepo && !existsSync(resolve(productRepo, ".git"))) {
  console.error(`[${TAG}] --product-repo 가 git 작업 트리가 아닙니다: ${productRepo}`);
  process.exit(1);
}

const errors = [];
const loaded = [];
for (const area of areas) {
  try {
    loaded.push(loadArea(area));
  } catch (error) {
    errors.push(error.message);
  }
}
errors.push(...validateRecipes(loaded));

let citeCount = 0;
if (productRepo) {
  for (const area of loaded) {
    const commit = commitOverride ?? area.authoredAgainst;
    for (const recipe of area.recipes) {
      const { problems, quotes } = checkCites(recipe, productRepo, commit);
      citeCount += quotes.length;
      errors.push(...problems.map((problem) => `${area.file}: ${problem}`));
    }
  }
}

const recipeCount = loaded.reduce((sum, area) => sum + area.recipes.length, 0);
const stepCount = loaded.reduce(
  (sum, area) => sum + area.recipes.reduce((inner, recipe) => inner + recipe.steps.length + Object.values(recipe.stepsByContext ?? {}).reduce((n, s) => n + s.length, 0), 0),
  0,
);

if (errors.length > 0) {
  for (const error of errors) console.error(`[${TAG}] ${error}`);
  console.error(`[${TAG}] 실패: ${errors.length}건 (영역 ${areas.length} · 읽힌 영역 ${loaded.length} · 레시피 ${recipeCount})`);
  process.exit(1);
}

console.log(
  `[${TAG}] OK (영역 ${loaded.length} · 레시피 ${recipeCount} · 단계 ${stepCount}` +
    (productRepo ? ` · 인용 확인 ${citeCount}` : " · 인용 확인 안 함(--product-repo 없음)") + ")",
);
