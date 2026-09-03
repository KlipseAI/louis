import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import ts from "typescript";
import { atomicWriteBatch } from "./lib/atomic-output.mjs";
import { resolveProductRef } from "./lib/product-ref.mjs";

// **「제품에 있는데 Figma 에 없는 것」을 세는 열거기.**
//
// 왜 있나: `verify-figma-parity` 는 계약 51 ↔ Figma 51 을 양방향으로 잠근 **닫힌 집합**이다.
// 계약에 선언되지 않은 제품 표면은 아무리 많이 빠져 있어도 초록이 나온다. 제품 트리를
// 열거하는 코드가 이 저장소에 **0건**이었고, `design/governance/figma-sync.md` 가 스스로
// 「Figma 커버리지 열거기가 아직 없다. 그래서 손으로 세어 기록한다」고 적었다. 손으로 센
// 원장은 반드시 낡는다.
//
// 방향은 `figma/product-coverage.json` 이 CSS property 축에서 이미 정한 것과 같다 —
// **제품이 선언한 것을 기계가 열거하고, 분류되지 않은 것을 나열한다. 사유 없이 넘기는 길은
// 없다.** 이 스크립트는 같은 모양을 「표면」축으로 만든다.
//
// ── 입자도 규칙: 무엇을 「하나의 표면」으로 세는가 ─────────────────────────
//
// **모듈 최상위에 정의된, JSX 를 돌려주는 PascalCase React 컴포넌트 하나 = 표면 하나.**
// 식별자는 `<제품 상대 경로>#<컴포넌트 이름>` 이다. 줄 번호를 쓰지 않으므로 줄이 밀려도
// 같은 표면이다(이 저장소의 baseline 이 요구하는 성질이다).
//
// **이 단위를 고른 근거.**
//  1. Figma 가 「컴포넌트」라고 부르는 것과 1:1 인 유일한 단위다 — 이름이 붙은, 재사용되는
//     시각 단위. 클래스 문자열은 그 **안의 레이어**이고, 라우트는 그것들의 **합성**이다.
//  2. AST 에서 기계적으로 나온다. 원장 §5 가 지적한 결함(179종이 손으로 타이핑한 리터럴이고
//     파일 읽기가 0건이었다)이 바로 여기서 막힌다.
//  3. **화면 층이 보인다.** 원장의 판정은 「컨트롤 층은 거의 맞고 화면 층은 거의 비었다」인데,
//     화면 층을 세지 못하는 단위를 고르면 문제가 없는 축만 재게 된다.
//
// **버린 후보와 그 이유(실측해서 버렸다).**
//  · 클래스 문자열 상수 하나 = 표면 하나 → 앵커에서 **3455개**(맵 키 441 + const 3014).
//    버린 이유: 이것들은 한 컴포넌트 **안의 레이어**다(`archiveCard` 옆에 `archiveCardTitle`
//    `archiveCardMeta` 가 나란히 선다). 3455개를 Figma 컴포넌트로 만들라는 뜻이 되는데
//    아무도 그런 뜻이 아니다. 게다가 15개 파일은 인라인 `className` 리터럴로만 칠해서
//    이 단위로는 보이지도 않는다. 버리지 않고 **표면 안의 증거**로 남긴다(`louis` 필드).
//  · 정본 컴포넌트(`components/ui/*.tsx`) = 표면 하나 → 앵커에서 **12개 파일**.
//    버린 이유: 그것은 컨트롤 층뿐이다. 원장이 「거의 맞다」고 판정한 축만 분모로 삼으면
//    커버리지가 100% 에 가깝게 나오고, 정작 비어 있는 화면 층은 분모 밖에 남는다.
//  · 라우트 × 시각 영역 → 「시각 영역」의 경계는 기계가 그을 수 없다. 매번 사람이 그으면
//    그것이 곧 손으로 타이핑한 목록이고, 이 열거기가 없애려는 바로 그 물건이다.
//
// **이 규칙이 못 보는 것(상한이다. 비율을 읽을 때 함께 읽어라).**
//  · 다른 함수 **안에서** 정의된 컴포넌트는 세지 않는다 — 앵커에서 PascalCase 2개.
//  · camelCase 렌더 헬퍼(`renderRow`)는 세지 않는다 — 앵커에서 14개.
//  · `.tsx` 가 아닌 파일이 그리는 표면은 없다(마크업은 전부 JSX 다).
//  · 한 컴포넌트가 여러 시각 상태를 갖는 것(variant/state)은 표면 1개로 센다. 상태 축은
//    `verify-figma-parity` 의 계약이 따로 잠근다.
//
// **왜 워킹트리가 아니라 앵커에서 읽는가.** 소유자가 제품 저장소에서 지금도 작업 중이다.
// 워킹트리에서 읽으면 같은 명령이 어제와 다른 값을 낸다 — `scripts/lib/product-ref.mjs` 가
// 그 사고를 이미 겪고 적어 둔 규칙을 그대로 따른다.

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const productRoot = process.env.KLIPSE_PRODUCT_REPO ?? "/Users/sejunki/klipse-web";
const { ref } = resolveProductRef();
const check = process.argv.includes("--check");
const OUT = "migration/product.surfaces.json";
const outPath = resolve(repoRoot, OUT);

if (!existsSync(resolve(productRoot, ".git"))) {
  console.error(
    "[product-surfaces] 제품 저장소가 없습니다: " +
      productRoot +
      "\n  이 게이트는 제품 저장소를 읽습니다. verify:product 레인에서만 돕니다.",
  );
  process.exit(1);
}

const git = (args) =>
  execFileSync("git", ["-C", productRoot, ...args], {
    encoding: "utf8",
    maxBuffer: 1 << 28,
  });

let commit;
try {
  commit = git(["rev-parse", ref]).trim();
} catch (error) {
  console.error(
    "[product-surfaces] 앵커 커밋을 제품 저장소에서 찾지 못했습니다: " +
      ref +
      "\n  " +
      String(error.message).trim(),
  );
  process.exit(1);
}

// 열거 대상. `app/` 과 `components/` 만 본다 — `lib/`·`hooks/` 는 마크업을 갖지 않고,
// 테스트 파일은 제품이 그리는 화면이 아니다.
const TREE = "apps/web";
const files = git(["ls-tree", "-r", "--name-only", commit, "--", TREE])
  .split("\n")
  .filter((f) => /\.tsx$/.test(f))
  .filter((f) => !/\.(test|spec)\.tsx$/.test(f))
  .sort();

if (files.length === 0) {
  console.error("[product-surfaces] " + TREE + " 아래에서 .tsx 를 하나도 읽지 못했습니다.");
  process.exit(1);
}

function containsJsx(node) {
  let found = false;
  const walk = (child) => {
    if (found) return;
    if (
      ts.isJsxElement(child) ||
      ts.isJsxSelfClosingElement(child) ||
      ts.isJsxFragment(child)
    ) {
      found = true;
      return;
    }
    ts.forEachChild(child, walk);
  };
  walk(node);
  return found;
}

const isComponentName = (name) => /^[A-Z]/.test(name);

/** `memo(...)` · `forwardRef(...)` 처럼 함수를 감싼 호출도 컴포넌트로 본다. */
function functionInside(initializer) {
  if (ts.isArrowFunction(initializer) || ts.isFunctionExpression(initializer)) {
    return initializer;
  }
  if (ts.isCallExpression(initializer)) {
    for (const argument of initializer.arguments) {
      if (ts.isArrowFunction(argument) || ts.isFunctionExpression(argument)) return argument;
    }
  }
  return null;
}

const LOUIS_CLASS = /\blouis-[a-z0-9]+(?:-[a-z0-9]+)*\b/g;

const found = [];
for (const file of files) {
  const source = git(["show", commit + ":" + file]);
  const sourceFile = ts.createSourceFile(
    file,
    source,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TSX,
  );
  const hasExport = (node) =>
    Boolean(node.modifiers?.some((m) => m.kind === ts.SyntaxKind.ExportKeyword));
  const hasDefault = (node) =>
    Boolean(node.modifiers?.some((m) => m.kind === ts.SyntaxKind.DefaultKeyword));

  const record = (name, node, binding) => {
    const text = node.getFullText(sourceFile);
    const louis = [...new Set(text.match(LOUIS_CLASS) ?? [])].sort();
    found.push({ id: file + "#" + name, file, binding, louis });
  };

  for (const statement of sourceFile.statements) {
    if (
      ts.isFunctionDeclaration(statement) &&
      statement.name &&
      isComponentName(statement.name.text) &&
      statement.body &&
      containsJsx(statement.body)
    ) {
      record(
        statement.name.text,
        statement,
        hasDefault(statement) ? "default" : hasExport(statement) ? "named" : "local",
      );
      continue;
    }
    if (ts.isVariableStatement(statement)) {
      const binding = hasExport(statement) ? "named" : "local";
      for (const declaration of statement.declarationList.declarations) {
        if (!ts.isIdentifier(declaration.name)) continue;
        if (!isComponentName(declaration.name.text)) continue;
        if (!declaration.initializer) continue;
        const fn = functionInside(declaration.initializer);
        if (!fn || !containsJsx(fn)) continue;
        record(declaration.name.text, declaration, binding);
      }
    }
  }
}

found.sort((a, b) => a.id.localeCompare(b.id));
const duplicate = found.find((s, i) => i > 0 && found[i - 1].id === s.id);
if (duplicate) {
  console.error("[product-surfaces] 표면 식별자가 겹칩니다: " + duplicate.id);
  process.exit(1);
}

// ── 분류는 사람이 소유한다 ─────────────────────────────────────────────────
// 열거는 기계가, 분류는 사람이. 다시 뽑을 때 사람이 적은 `verdict`·`figma`·`reason`·`weight`
// 를 그대로 물려받는다. 사라진 표면의 분류는 함께 사라진다 — 없는 표면에 대한 사유는
// 거짓말이다.
//
// **`verdict` 를 물려받지 않으면 판정 400건이 다음 재측정에서 통째로 사라진다.** 이 목록은
// 앵커가 움직일 때마다 다시 뽑히므로, 사람이 적은 축을 캐리 목록에 넣는 것이 곧 그 축을
// 보존하는 유일한 장치다.
const previous = existsSync(outPath) ? JSON.parse(readFileSync(outPath, "utf8")) : {};
const carried = previous.surfaces ?? {};

const surfaces = {};
for (const surface of found) {
  const before = carried[surface.id] ?? {};
  surfaces[surface.id] = {
    file: surface.file,
    binding: surface.binding,
    louis: surface.louis,
    verdict: before.verdict ?? null,
    figma: before.figma ?? null,
    reason: before.reason ?? null,
    // needed 에만 붙는 우선순위. 「무엇을 먼저 그리는가」가 needed 목록의 유일한 쓸모라
    // 판정과 같은 자리에 둔다. 다른 판정에서는 null 이고 게이트가 그것을 강제한다.
    weight: before.weight ?? null,
  };
}

const dropped = Object.keys(carried).filter((id) => !(id in surfaces));
const tally = (verdict) => Object.values(surfaces).filter((s) => s.verdict === verdict).length;
const mapped = tally("figma");
const scoped = tally("scoped");
const needed = tally("needed");
const unclear = tally("unclear");
const unclassified = found.length - mapped - scoped - needed - unclear;

const output = {
  $comment:
    "생성물. scripts/measure-product-surfaces.mjs 가 앵커 커밋의 제품 트리에서 열거한다. " +
    "`verdict`·`figma`·`reason`·`weight` 만 사람이 적고, 나머지 필드는 다시 뽑을 때 덮어쓴다.",
  $whyThisExists:
    "verify-figma-parity 는 계약 51 ↔ Figma 51 을 양방향으로 잠근 닫힌 집합이라, 계약에 " +
    "선언되지 않은 제품 표면은 아무리 많이 빠져 있어도 초록이 나온다. 제품 트리를 열거하는 " +
    "코드가 이 저장소에 0건이었고 figma-sync.md 는 「커버리지 열거기가 아직 없다. 그래서 " +
    "손으로 세어 기록한다」고 적었다. 손으로 센 원장은 반드시 낡는다.",
  $granularityRule:
    "표면 하나 = 모듈 최상위에 정의된, JSX 를 돌려주는 PascalCase React 컴포넌트 하나. " +
    "식별자는 `<경로>#<이름>` 이고 줄 번호를 쓰지 않는다. 고른 근거와 버린 후보 셋(클래스 " +
    "문자열 3455개 · 정본 컴포넌트 12개 · 라우트×시각영역)은 열거기 머리말에 적었다.",
  $howToUse:
    "새 표면이 나타나면 `verdict` 를 넷 중 하나로 적고 `reason` 에 20자 이상의 근거를 붙인다 — " +
    "figma(대응이 있다: 이름을 `figma` 에 적는다) · scoped(범위 밖이다) · " +
    "needed(Figma 에 세워야 하는데 아직 없다: `weight` 로 우선순위를 적는다) · " +
    "unclear(소유자 판단이 필요하다). **사유 없이 넘기는 길은 없다.** verdict 가 비면 그 표면은 " +
    "`unclassified` 로 세어지고, check-figma-surface-coverage 의 래칫이 그 수가 늘어나는 것을 막는다.",
  $verdictRule:
    "판정은 넷이다. 셋이 아니라 넷인 이유는 「Figma 에 세워야 하는데 아직 없다」를 적을 자리가 " +
    "없었기 때문이다 — 그것을 `reason` 에 적으면 미등록이 사유로 둔갑해 `scoped`(범위 밖)로 " +
    "세어졌고, 커버리지가 올라간 것처럼 보였다. `needed` 는 그 둔갑을 막는 축이고, " +
    "`unclear` 는 소유자 판단 대기 목록이다. 래칫의 방향도 판정마다 다르다 — " +
    "unclassified 는 늘면 실패(아무도 안 본 표면), needed 는 늘어도 실패하지 않는다(발견이지 " +
    "후퇴가 아니다), unclear 는 세기만 한다.",
  // **생성기가 이 규칙을 직접 발행한다.** 그전까지 `$stateRule` 은 생성물에 손으로 적혀
  // 있었고, 그래서 앵커 재고정으로 이 측정기를 다시 돌린 순간 조용히 사라졌다 —
  // check-figma-surface-coverage 가 「상태 축 규칙이 없습니다」로 막아서야 드러났다.
  // 생성물에 손으로 적은 규범은 다음 재측정에서 반드시 사라진다.
  $stateRule:
    "상태는 표면 하나의 축이다 — 별 표면이 되는 길은 둘뿐이다(DS-D-0040). ① 자식 구성: 본 " +
    "상태에 없던 «종류»의 자식이 들어오거나 같은 자식이 «다른 개수»로 반복되면 별 표면이다. " +
    "③ 자리의 주인: 본 상태를 소유한 표면이 이 원장에 없으면(화면이 인라인으로 그린다) 붙을 " +
    "축이 없으므로 별 표면이다. ② 배치만 다르거나(축 전치·열 수·정렬) 색·불투명도·문구·" +
    "글리프만 다르면 표면 하나의 축이므로 scoped 로 남는다. 자식이 «감춰지는» 것은 ①이 " +
    "아니다 — 오토레이아웃의 정상 결과다. 순서가 있다: 이 시험이 표면을 몇 개로 셀지를 먼저 " +
    "정하고, 그 축이 VARIANT 인가 BOOLEAN 인가는 design/governance/figma-component-authoring.md " +
    "§2 가 그다음에 정한다. 두 층을 섞으면 「BOOLEAN 으로 못 그리니까 별 컴포넌트」라는 잘못된 " +
    "추론이 나온다. 축을 연다고 조합을 전수로 채우는 것도 아니다 — 쓰지 않는 계단은 사다리가 " +
    "아니다(DS-D-0027 · DS-D-0030).",
  $upperBound:
    "이 수는 상한이 아니라 하한이다 — 다른 함수 안에서 정의된 컴포넌트(앵커에서 2개)와 " +
    "camelCase 렌더 헬퍼(14개)는 세지 않는다. `louis` 도 하한이다: 클래스 맵 파일을 " +
    "import 해서 쓰는 컴포넌트는 자기 본문에 louis 이름을 갖지 않는다.",
  productRef: ref,
  productCommit: commit,
  tree: TREE,
  filesScanned: files.length,
  // `mapped` 는 verdict === "figma" 의 수다. 이름을 유지하는 이유는 그것이 커버리지의
  // 분자이고, 이 이름을 읽는 게이트·카나리아가 이미 있기 때문이다.
  counts: { total: found.length, mapped, scoped, needed, unclear, unclassified },
  surfaces,
};

const body = JSON.stringify(output, null, 2) + "\n";
const line =
  `표면 ${found.length}종 · Figma 대응 ${mapped} · 범위 밖 ${scoped} · 필요 ${needed}` +
  ` · 판단대기 ${unclear} · 미분류 ${unclassified} · 파일 ${files.length} @ ${commit.slice(0, 8)}`;

if (check) {
  if (!existsSync(outPath)) {
    console.error("[product-surfaces] " + OUT + " 이 없습니다. 먼저 뽑으세요.");
    process.exit(1);
  }
  const current = readFileSync(outPath, "utf8");
  if (current !== body) {
    console.error(
      "[product-surfaces] 기록이 앵커의 제품 트리와 다릅니다. `pnpm run measure-product-surfaces` 로 다시 뽑으세요." +
        (dropped.length > 0
          ? "\n  앵커에서 사라진 표면 " + dropped.length + "개: " + dropped.slice(0, 5).join(", ")
          : ""),
    );
    process.exit(1);
  }
  console.log("[product-surfaces] checked: " + line);
} else {
  atomicWriteBatch([{ absolute: outPath, expected: body }]);
  console.log("[product-surfaces] built: " + line);
  if (dropped.length > 0) {
    console.log(
      "[product-surfaces] 앵커에서 사라져 분류가 함께 사라진 표면 " + dropped.length + "개: " +
        dropped.join(", "),
    );
  }
}
