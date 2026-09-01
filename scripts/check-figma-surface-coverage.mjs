#!/usr/bin/env node
// **제품 표면이 Figma 에 대응물을 갖는지 세는 래칫.**
//
// 왜 있나: `verify-figma-parity` 는 계약 51 ↔ Figma 51 을 **양방향으로 잠근 닫힌 집합**이다.
// 두 방향 모두 계약 안에서만 돈다 — 계약에 선언되지 않은 제품 표면은 아무리 많이 빠져
// 있어도 초록이 나온다. 그래서 「Figma 가 제품을 얼마나 덮는가」는 지금까지 **손으로 세어**
// `design/governance/figma-sync.md` 에 적혀 있었고, 그 문서는 스스로 「커버리지 열거기가
// 아직 없다」고 자인한다. 손으로 센 원장은 반드시 낡는다.
//
// 이 게이트는 `figma/product-coverage.json` 이 CSS property 축에서 이미 하는 일을 표면
// 축에서 한다 — **제품이 선언한 것을 기계가 열거하고, 분류되지 않은 것을 나열한다. 사유
// 없이 넘기는 길은 없다.**
//
// ── 왜 verify:ci 인가 ─────────────────────────────────────────────────────
// 열거기는 제품 저장소를 읽으므로 로컬 전용이다(`verify-product-surfaces`, verify:product).
// **이 게이트는 그 생성물과 Figma 되읽기만 읽는다** — 저장소 밖을 보지 않으므로 러너에서
// 실제로 돈다. `verify-gate-split` 5번이 그 자립성을 문자열로 확인한다.
// 두 게이트는 같은 원장의 앞뒤다: 열거기는 「목록이 앵커와 같은가」를, 이 게이트는
// 「목록의 모든 줄이 분류돼 있는가」를 잰다.
//
// ── 래칫의 방향 ───────────────────────────────────────────────────────────
// `unclassified` 는 **정확히 일치**해야 한다. 늘면 사유 없는 표면이 새로 생긴 것이고,
// 줄면 분류가 진행된 것이니 baseline 을 내리라고 요구한다. 이 저장소의 lint baseline 과
// 같은 양방향 래칫이며, 목표는 이 수가 0 이 되는 것이다.
// `mapped` 도 정확히 일치해야 한다 — 떨어지면 커버리지가 후퇴한 것이고, 오르면 올려라.
// `total` 은 바닥만 지킨다. 표면을 통째로 지워서 분모를 줄이는 길을 막는 두 번째 그물이다.
//
// **한 번에 전부 덮으려 하지 않았다.** 이 저장소가 실패한 방식이 그것이다 — 227건을 1차
// 판정하고 64건만 반증해 상한이 불명확한 수를 남겼다. 여기서는 입자도 규칙과 열거기와
// 래칫만 세우고, 초기 baseline 은 2026-09-01 실측값으로 얼렸다. 다음 사람이 할 일은
// 이 수를 줄이는 것 하나뿐이다.
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const readJson = (relative) => JSON.parse(readFileSync(resolve(repoRoot, relative), "utf8"));

const LEDGER = "migration/product.surfaces.json";
const READBACK = "figma/readback.json";

// 2026-09-01 실측. 표면 400종 중 Figma 대응 10 · 범위 밖 2 · 미분류 388.
// 미분류를 새 위반으로 늘리려고 이 수를 올리지 마라 — 이 저장소의 baseline 규칙이다.
const UNCLASSIFIED_BASELINE = 388;
const MAPPED_BASELINE = 10;
const TOTAL_FLOOR = 400;

// 사유의 최소 길이. `verify-product-parity` 의 MINIMUM_REASON 과 같은 값이다 —
// 「없음」·「해당 없음」 같은 한 낱말이 사유로 통과하면 분류는 형식만 남는다.
const MINIMUM_REASON = 20;

const BINDINGS = new Set(["default", "named", "local"]);

const errors = [];
const ledger = readJson(LEDGER);
const readback = readJson(READBACK);

// Figma 어휘. 컴포넌트 51 + 템플릿 9. 여기에 없는 이름을 적는 것은 「있다고 적었지만
// 파일에 없다」는 뜻이고, 그것이 원장을 낡게 만드는 방식 그 자체다.
const vocabulary = new Set([
  ...Object.keys(readback.components ?? {}),
  ...Object.keys(readback.templates ?? {}),
]);
if (vocabulary.size === 0) {
  errors.push(READBACK + " 에서 Figma 컴포넌트·템플릿 이름을 하나도 읽지 못했습니다.");
}

// 규칙이 파일 안에 남아 있는지. 입자도 규칙이 사라지면 이 수들은 다시 의미를 잃는다 —
// 원장 §5 가 지적한 「분모가 확정되지 않았다」로 되돌아간다.
if (typeof ledger.$granularityRule !== "string" || ledger.$granularityRule.length < 40) {
  errors.push(LEDGER + " 에 입자도 규칙($granularityRule)이 없습니다. 규칙 없는 수는 비율이 아닙니다.");
}

const surfaces = ledger.surfaces ?? {};
const ids = Object.keys(surfaces);
if (ids.length === 0) errors.push(LEDGER + " 에 표면이 하나도 없습니다.");

let mapped = 0;
let scoped = 0;
let unclassified = 0;
const unclassifiedIds = [];

for (const id of ids) {
  const surface = surfaces[id];
  const at = LEDGER + "#" + id;

  if (typeof surface.file !== "string" || !surface.file.startsWith("apps/web/")) {
    errors.push(at + ": file 이 제품 트리 경로가 아닙니다.");
    continue;
  }
  // 식별자와 file 이 어긋나면 목록에 없는 자리를 분류한 것이 된다.
  if (!id.startsWith(surface.file + "#") || id.slice(surface.file.length + 1).length === 0) {
    errors.push(at + ": 식별자가 `<파일>#<컴포넌트>` 모양이 아니거나 file 과 어긋납니다.");
    continue;
  }
  if (!BINDINGS.has(surface.binding)) {
    errors.push(at + ": binding 이 default/named/local 이 아닙니다: " + String(surface.binding));
  }
  if (!Array.isArray(surface.louis) || surface.louis.some((c) => !/^louis-/.test(String(c)))) {
    errors.push(at + ": louis 는 `louis-` 로 시작하는 클래스 이름의 배열이어야 합니다.");
  }

  const hasFigma = surface.figma !== null && surface.figma !== undefined;
  const reason = typeof surface.reason === "string" ? surface.reason.trim() : "";

  if (hasFigma) {
    if (typeof surface.figma !== "string" || !vocabulary.has(surface.figma)) {
      errors.push(
        at + ": figma 이름이 " + READBACK + " 에 없습니다: " + String(surface.figma) +
          ". 되읽기에 없는 이름은 「Figma 에 있다」의 근거가 되지 못합니다.",
      );
    }
    // **대응이 있다고 적을 때도 근거를 적는다.** 이름만 이어 붙이는 것은 판정이 아니다.
    if (reason.length < MINIMUM_REASON) {
      errors.push(
        at + ": Figma 대응을 선언하려면 reason 에 " + MINIMUM_REASON +
          "자 이상의 근거가 필요합니다(어느 파일이 그 대응을 고정하는가).",
      );
    }
    mapped += 1;
    continue;
  }

  if (reason.length > 0) {
    if (reason.length < MINIMUM_REASON) {
      errors.push(
        at + ": 범위 밖으로 두려면 reason 에 " + MINIMUM_REASON + "자 이상의 사유가 필요합니다.",
      );
    }
    scoped += 1;
    continue;
  }

  unclassified += 1;
  unclassifiedIds.push(id);
}

// 요약이 스스로를 속이지 못하게. 파일 안의 counts 는 다시 센 값과 같아야 한다.
const counts = ledger.counts ?? {};
const recounted = { total: ids.length, mapped, scoped, unclassified };
for (const key of ["total", "mapped", "scoped", "unclassified"]) {
  if (counts[key] !== recounted[key]) {
    errors.push(
      LEDGER + " 의 counts." + key + " (" + String(counts[key]) + ") 가 다시 센 값 " +
        recounted[key] + " 와 다릅니다. `pnpm run measure-product-surfaces` 로 다시 뽑으세요.",
    );
  }
}

// ── 래칫 ──────────────────────────────────────────────────────────────────
if (unclassified > UNCLASSIFIED_BASELINE) {
  errors.push(
    "사유 없는 표면이 " + (unclassified - UNCLASSIFIED_BASELINE) + "개 늘었습니다 " +
      "(" + UNCLASSIFIED_BASELINE + " → " + unclassified + "). " +
      "대응하는 Figma 컴포넌트 이름을 figma 에 적거나, 왜 대응물이 없어도 되는지를 reason 에 " +
      MINIMUM_REASON + "자 이상으로 적으세요. 사유 없이 넘기는 길은 없습니다.\n      새로 생긴 자리: " +
      unclassifiedIds.slice(-5).join(", "),
  );
} else if (unclassified < UNCLASSIFIED_BASELINE) {
  errors.push(
    "사유 없는 표면이 " + (UNCLASSIFIED_BASELINE - unclassified) + "개 줄었습니다 " +
      "(" + UNCLASSIFIED_BASELINE + " → " + unclassified + "). 이득을 잠그세요 — " +
      "이 파일의 UNCLASSIFIED_BASELINE 을 " + unclassified + " 로 내립니다. " +
      "내리지 않으면 그 자리는 다음에 조용히 되돌아옵니다.",
  );
}

if (mapped < MAPPED_BASELINE) {
  errors.push(
    "Figma 대응이 선언된 표면이 " + (MAPPED_BASELINE - mapped) + "개 줄었습니다 " +
      "(" + MAPPED_BASELINE + " → " + mapped + "). 커버리지는 떨어질 수 없습니다.",
  );
} else if (mapped > MAPPED_BASELINE) {
  errors.push(
    "Figma 대응이 " + (mapped - MAPPED_BASELINE) + "개 늘었습니다 " +
      "(" + MAPPED_BASELINE + " → " + mapped + "). 이 파일의 MAPPED_BASELINE 을 " + mapped +
      " 로 올려 이득을 잠그세요.",
  );
}

if (ids.length < TOTAL_FLOOR) {
  errors.push(
    "표면 총수가 바닥 아래로 내려갔습니다 (" + TOTAL_FLOOR + " → " + ids.length + "). " +
      "분모를 지워서 커버리지를 올리는 길을 막는 그물입니다. 앵커가 움직여 실제로 줄었다면 " +
      "TOTAL_FLOOR 를 함께 내리고, 무엇이 사라졌는지 적으세요.",
  );
}

if (errors.length > 0) {
  console.error("Figma 표면 커버리지 게이트 실패:");
  for (const error of errors) console.error("  - " + error);
  process.exit(1);
}

const percent = ((mapped / ids.length) * 100).toFixed(1);
console.log(
  "Figma 표면 커버리지: 표면 " + ids.length + "종 · 대응 " + mapped + "(" + percent + "%) · " +
    "범위 밖 " + scoped + " · 사유 없음 " + unclassified + ". " +
    "입자도 규칙은 " + LEDGER + " 의 $granularityRule 이 소유한다.",
);
