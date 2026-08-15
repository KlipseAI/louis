#!/usr/bin/env node
// 제품 배포 코드의 정본 값과 DS의 차이가 **전부 기록된 결정인지** 검증한다.
//
// 이 게이트가 없던 동안 DS는 제품과 205축 중 143축이 달랐고, 다른 모든 게이트는 초록이었다.
// 다른 게이트는 전부 DS 내부 일관성만 보기 때문이다 — 코드↔Figma, 토큰↔생성물.
//
// 이 게이트의 목적은 "DS가 제품과 같아야 한다"가 **아니다.** 디자인 시스템은 제품의 과거를 고칠
// 권한이 있다. 목적은 **모든 차이가 사람이 내린 결정이어야 한다**는 것이다. 조용히 벌어진 차이와
// 의도한 차이를 구분할 방법이 없던 것이 문제였다.
//
// 실행: node scripts/verify-product-parity.mjs [--no-canary]
//
// 근거 파일 재생성 절차는 migration/component-parity.md의 "측정 방법"에 있다. 제품 저장소는
// 이 저장소 밖에 있으므로 게이트가 직접 읽지 않는다 — 읽으면 clean checkout에서 돌지 않는다.
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const runCanary = !process.argv.includes("--no-canary");

const MEASURED_PATH = "migration/product.measured.json";

function readJson(relativePath) {
  return JSON.parse(readFileSync(resolve(repoRoot, relativePath), "utf8"));
}

const VALID_STATUS = new Set(["gap", "adopted", "accepted-deviation", "no-canon"]);
const CANON_KINDS = new Set(["shared-component", "shared-css", "shared-tokens", "none"]);
const MINIMUM_REASON = 20;

/** ds 포인터를 따라 실제 DS 값을 읽는다. 없으면 null을 돌려 "대조 불가"로 표시한다. */
function readDsValue(pointer) {
  if (pointer === undefined || pointer === null) return null;
  if (typeof pointer !== "object" || !Array.isArray(pointer.path)) return null;
  let node;
  try {
    node = readJson(pointer.file);
  } catch {
    return { error: `DS 근거 파일을 읽을 수 없습니다: ${pointer.file}` };
  }
  for (const key of pointer.path) {
    if (node === null || typeof node !== "object" || !(key in node)) {
      return { error: `DS 근거 경로가 없습니다: ${pointer.file}#${pointer.path.join(".")}` };
    }
    node = node[key];
  }
  return { value: node };
}

function check(document) {
  const failures = [];
  const counts = { gap: 0, adopted: 0, "accepted-deviation": 0, "no-canon": 0, compared: 0 };

  const components = document.components ?? {};
  if (Object.keys(components).length === 0) {
    failures.push("측정된 component가 하나도 없습니다.");
  }

  for (const [componentId, component] of Object.entries(components)) {
    const canon = component.canon;
    if (!canon || !CANON_KINDS.has(canon.kind)) {
      failures.push(`${componentId}: canon.kind가 없거나 알 수 없습니다.`);
      continue;
    }
    // 정본이 없다고 선언하려면 왜 없는지를 적어야 한다. 안 적으면 "아직 안 찾아봤다"와
    // "찾아봤는데 없다"가 구분되지 않는다.
    if (canon.kind === "none" && (canon.note ?? "").trim().length < MINIMUM_REASON) {
      failures.push(
        `${componentId}: 제품 정본이 없다고 선언하려면 canon.note에 ${MINIMUM_REASON}자 이상의 근거가 필요합니다.`,
      );
    }
    if (canon.kind !== "none" && !Array.isArray(canon.paths)) {
      failures.push(`${componentId}: 정본이 있으면 canon.paths가 필요합니다.`);
    }

    const axes = component.axes ?? {};
    if (component.axisCount !== Object.keys(axes).length) {
      failures.push(
        `${componentId}: axisCount ${component.axisCount}가 실제 축 수 ${Object.keys(axes).length}와 다릅니다.`,
      );
    }

    for (const [axisName, axis] of Object.entries(axes)) {
      const label = `${componentId}.${axisName}`;
      if (!VALID_STATUS.has(axis.status)) {
        failures.push(`${label}: status가 없거나 알 수 없습니다 — ${axis.status}`);
        continue;
      }
      counts[axis.status] += 1;

      if ((axis.evidence ?? "").trim().length === 0) {
        failures.push(`${label}: 제품 근거(파일:줄번호)가 없습니다.`);
      }

      if (axis.status === "gap") {
        failures.push(
          `${label}: 판정하지 않은 격차입니다 — 제품 "${axis.product}" / DS "${axis.ds}" (${axis.evidence})`,
        );
        continue;
      }

      if (axis.status === "no-canon" && canon.kind !== "none") {
        failures.push(
          `${label}: 제품에 정본이 있는데 no-canon으로 두었습니다. adopted나 accepted-deviation이어야 합니다.`,
        );
        continue;
      }

      if (axis.status === "accepted-deviation") {
        // 사유 없이 편차를 수용하면 이 게이트는 "gap을 accepted로 바꾸기"라는 한 줄로 무력화된다.
        if (typeof axis.reason !== "string" || axis.reason.trim().length < MINIMUM_REASON) {
          failures.push(
            `${label}: 의도적 편차에는 ${MINIMUM_REASON}자 이상의 reason이 필요합니다.`,
          );
        }
        continue;
      }

      if (axis.status === "adopted") {
        // 채택했다고 적어 두고 값은 그대로인 경우를 잡는다.
        const read = readDsValue(axis.dsPointer);
        if (read === null) {
          if (typeof axis.reason !== "string" || axis.reason.trim().length < MINIMUM_REASON) {
            failures.push(
              `${label}: 기계 대조가 불가능한 adopted에는 어떻게 확인했는지 reason이 필요합니다.`,
            );
          }
          continue;
        }
        if (read.error) {
          failures.push(`${label}: ${read.error}`);
          continue;
        }
        counts.compared += 1;
        const want = axis.productValue;
        if (want === undefined) {
          failures.push(`${label}: dsPointer가 있으면 대조할 productValue가 필요합니다.`);
          continue;
        }
        if (JSON.stringify(read.value) !== JSON.stringify(want)) {
          failures.push(
            `${label}: adopted라고 적혀 있는데 값이 다릅니다 — 제품 ${JSON.stringify(want)}, DS ${JSON.stringify(read.value)}`,
          );
        }
      }
    }
  }
  return { failures, counts };
}

const measured = readJson(MEASURED_PATH);
const { failures, counts } = check(measured);

// 게이트가 실제로 실패할 수 있는지 매 실행에서 증명한다.
//
// canary는 실패가 이미 있는 상태에서도 돌아야 한다. 그래서 판정 기준은 "변조 후 실패가 있는가"가
// 아니라 **"변조가 baseline에 없던 실패를 새로 만드는가"**다.
/**
 * **통과 중인** 축을 고른다.
 *
 * 이미 실패하는 축을 변조하면 새 실패가 생기지 않아 canary가 가려진다. 실제로 첫 판에서
 * "미판정 격차를 통과시키지 않는다" canary가 그렇게 무력화됐다 — 첫 축이 이미 gap이었다.
 */
function pickPassing(document, predicate = () => true) {
  for (const [componentId, component] of Object.entries(document.components)) {
    if (!predicate(component)) continue;
    for (const axis of Object.values(component.axes)) {
      if (axis.status !== "gap") return { componentId, component, axis };
    }
  }
  return null;
}

const TAMPERS = [
  [
    "미판정 격차를 통과시키지 않는다",
    (document) => {
      const found = pickPassing(document);
      if (found) found.axis.status = "gap";
    },
  ],
  [
    "사유 없는 의도적 편차를 통과시키지 않는다",
    (document) => {
      const found = pickPassing(document);
      if (!found) return;
      found.axis.status = "accepted-deviation";
      delete found.axis.reason;
    },
  ],
  [
    "짧은 사유를 통과시키지 않는다",
    (document) => {
      const found = pickPassing(document);
      if (!found) return;
      found.axis.status = "accepted-deviation";
      found.axis.reason = "그냥";
    },
  ],
  [
    "정본이 있는데 no-canon으로 두는 것을 통과시키지 않는다",
    (document) => {
      const entry = Object.values(document.components).find((c) => c.canon.kind !== "none");
      if (!entry) return;
      Object.values(entry.axes)[0].status = "no-canon";
    },
  ],
  [
    "근거 없는 축을 통과시키지 않는다",
    (document) => {
      const found = pickPassing(document);
      if (!found) return;
      found.axis.status = "accepted-deviation";
      found.axis.reason = "충분히 긴 사유를 적어 두어 reason 검사만으로는 걸리지 않게 한다";
      found.axis.evidence = "";
    },
  ],
  [
    "정본 없음을 근거 없이 선언하는 것을 통과시키지 않는다",
    (document) => {
      const entry = Object.values(document.components).find((c) => c.canon.kind === "none");
      if (!entry) return;
      entry.canon.note = "없음";
    },
  ],
  [
    "축 수를 속이는 것을 통과시키지 않는다",
    (document) => {
      Object.values(document.components)[0].axisCount += 1;
    },
  ],
];

const canaryFailures = [];
if (runCanary) {
  const baseline = new Set(failures);
  for (const [label, mutate] of TAMPERS) {
    const copy = JSON.parse(JSON.stringify(measured));
    mutate(copy);
    const introduced = check(copy).failures.filter((item) => !baseline.has(item));
    if (introduced.length === 0) {
      canaryFailures.push(
        baseline.size === 0
          ? `canary가 변조를 잡지 못했습니다: ${label}`
          : `canary의 검출력을 증명하지 못했습니다 — 기존 실패에 가려집니다: ${label}`,
      );
    }
  }
}

for (const failure of [...failures, ...canaryFailures]) {
  console.error(`[product-parity] ${failure}`);
}

if (failures.length > 0 || canaryFailures.length > 0) {
  console.error(
    `[product-parity] 실패 ${failures.length}건 (미판정 격차 ${counts.gap}건). ` +
      `모든 차이는 제품 값을 채택하거나 사유를 적은 의도적 편차여야 합니다.`,
  );
  process.exitCode = 1;
} else {
  console.log(
    `[product-parity] OK (채택 ${counts.adopted}건 중 기계 대조 ${counts.compared}건, ` +
      `의도적 편차 ${counts["accepted-deviation"]}건, 제품 정본 없음 ${counts["no-canon"]}건, ` +
      `변조 canary ${TAMPERS.length}종)`,
  );
}
