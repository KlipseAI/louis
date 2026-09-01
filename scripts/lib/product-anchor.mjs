import { readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

// **제품 측정 앵커는 하나다.** 그 하나는 `migration/product-evidence.lock.json` 의
// `productCommit` 이다.
//
// 정본을 고른 근거는 취향이 아니라 계수다(2026-09-01). 코드가 앵커를 실제로 읽는 자리는
// 세 갈래인데 셋 다 이 파일을 읽는다 —
//   · `scripts/lib/product-ref.mjs` 를 import 하는 측정·생성 스크립트 15개
//   · `verify-citations` 가 인용 좌표를 열 때 쓰는 `lock.productCommit`
//   · `scripts/lib/product-scene-evidence.mjs` 가 장면 생성물을 대조하는 기준
// 반대로 `migration/*.json` · `figma/*.json` 이 스스로 적어 두는 `productCommit` 핀 25개는
// **아무도 읽지 않는 기록**이다 — 생성 당시의 제품이 무엇이었는지를 적어 둘 뿐이다.
// 그래서 정본은 lock 이고, 나머지는 그 정본을 따라와야 하는 그림자다.
//
// 2026-09-01 실측에서 그림자가 다섯 갈래로 흩어져 있었다: `ae8fd627`(19핀) ·
// `a3ed8e03`(4핀) · `a89fc0d5`(1) · `7e9c3b69`(1) · `086f4a62`(1). 즉 생성물 25개가 네
// 시점의 제품을 동시에 「이 저장소가 재고 있는 제품」이라고 말하고 있었다. 흩어짐 자체보다
// 나쁜 것은 그것을 재는 자가 없었다는 것이다 — `scripts/verify-product-anchor.mjs` 가 그 일을
// 한다.
//
// **이 파일은 제품 저장소를 열지 않는다.** 핀끼리의 일치는 저장소 없이 판정할 수 있고,
// 그래야 hosted CI(제품 저장소가 없다)에서 돈다.
const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const lockPath = resolve(repoRoot, "migration/product-evidence.lock.json");

// 핀으로 세는 키. 값이 커밋 해시처럼 생겼을 때만 핀으로 본다 — `productRef` 는 lock 에서
// 브랜치 이름(`design`)이고 생성물에서는 해결된 해시라, 모양으로 갈라야 한다.
//
// `dsPin`(LOUIS 커밋)과 `louisCommit` 은 뺐다. 다른 축의 앵커이고, 제품 앵커와 같아야 할
// 이유가 없다.
export const PIN_KEYS = new Set(["productCommit", "productRef", "releaseCommit", "commit"]);

const COMMIT_SHAPE = /^[0-9a-f]{7,40}$/;

export function readAnchor() {
  const lock = JSON.parse(readFileSync(lockPath, "utf8"));
  return {
    commit: lock.productCommit,
    ref: lock.productRef,
    source: "migration/product-evidence.lock.json",
  };
}

// 같은 커밋인가. 짧은 핀(예: `086f4a62`)이 있으므로 접두 비교를 한다 — 40자끼리는
// 그냥 동치 비교와 같다.
export function samePin(pin, canon) {
  if (typeof pin !== "string" || typeof canon !== "string") return false;
  const short = pin.length <= canon.length ? pin : canon;
  const long = pin.length <= canon.length ? canon : pin;
  return long.startsWith(short);
}

// `migration/` · `figma/` 아래 모든 `.json` 을 훑어 핀을 걷는다. 생성물 목록을 손으로 들면
// 새 생성물이 목록 밖에서 조용히 흩어진다 — 그것이 애초에 다섯 갈래가 생긴 방식이다.
export function collectPins() {
  const pins = [];
  for (const dir of ["migration", "figma"]) walk(resolve(repoRoot, dir));
  pins.sort((a, b) => (a.file + a.path).localeCompare(b.file + b.path));
  return pins;

  function walk(absolute) {
    for (const entry of readdirSync(absolute)) {
      const child = resolve(absolute, entry);
      if (statSync(child).isDirectory()) {
        walk(child);
        continue;
      }
      if (!entry.endsWith(".json")) continue;
      const file = relative(repoRoot, child);
      // lock 자신은 정본이므로 자기 자신과 대조하지 않는다.
      if (file === "migration/product-evidence.lock.json") continue;
      let parsed;
      try {
        parsed = JSON.parse(readFileSync(child, "utf8"));
      } catch {
        // 읽을 수 없는 JSON 은 이 게이트의 관심사가 아니다. 다른 게이트가 잡는다.
        continue;
      }
      visit(parsed, file, "");
    }
  }

  function visit(node, file, path) {
    if (!node || typeof node !== "object") return;
    if (Array.isArray(node)) {
      node.forEach((item, index) => visit(item, file, path + "/" + index));
      return;
    }
    for (const [key, value] of Object.entries(node)) {
      if (typeof value === "string") {
        if (PIN_KEYS.has(key) && COMMIT_SHAPE.test(value)) {
          pins.push({ file, path: path + "/" + key, key, value });
        }
        continue;
      }
      visit(value, file, path + "/" + key);
    }
  }
}
