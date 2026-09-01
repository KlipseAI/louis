import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { unavailable } from "./gate-exit.mjs";

// `migration/product.scenes.json` 을 **어느 제품 커밋의 증거인지 확인한 뒤** 넘긴다.
//
// 왜 있나: 2026-09-01 실측에서 이 생성물은 제품 `a3ed8e03`(2026-08-21)에 멈춰 있었는데,
// 근거 lock 과 나머지 제품 생성물 열 개는 전부 `ae8fd627`(2026-08-30)이었다. 그런데
// `build-figma-product-pricing-page.mjs` 는 그것을 그대로 읽어 Figma 가격 페이지 계획을
// 생성하고 **초록**이었다 — 9일 낡은 화면을 「이 커밋의 제품」이라고 말하고 있었다.
// 낡음 자체보다 나쁜 것은 낡았다는 사실을 아무도 재지 않는 것이다(원장
// `scenes-gate-measures-nothing`).
//
// 생성물이 스스로 `productCommit` 을 적으므로, 소비 지점에서 lock 과 대조하면 끝난다.
// 커밋이 어긋나면 여기서 멈춘다 — 그려 놓은 것이 무엇의 그림인지 모르는 채로 진행하지 않는다.
const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const evidencePath = resolve(repoRoot, "migration/product.scenes.json");
const lockPath = resolve(repoRoot, "migration/product-evidence.lock.json");

export function loadProductSceneEvidence(tag) {
  const evidence = JSON.parse(readFileSync(evidencePath, "utf8"));
  const lock = JSON.parse(readFileSync(lockPath, "utf8"));
  const pinned = lock.productCommit;
  const measured = evidence.productCommit;
  if (typeof pinned !== "string" || !/^[0-9a-f]{40}$/.test(pinned)) {
    unavailable(tag, "migration/product-evidence.lock.json 의 productCommit 을 읽지 못했습니다.");
  }
  if (measured !== pinned) {
    unavailable(
      tag,
      "migration/product.scenes.json 은 제품 " + String(measured).slice(0, 8) +
        " 의 증거인데 근거 lock 은 " + pinned.slice(0, 8) + " 를 고정하고 있습니다. " +
        "이 생성물로 만든 Figma 계획은 lock 이 가리키는 제품이 아닙니다. " +
        "`KLIPSE_PRODUCT_BUILD_ROOT=<고정 커밋 clean 빌드> pnpm run measure-product-scenes` 로 " +
        "다시 재세요. 지금은 그 측정기 자체가 NOT_MEASURED 입니다 — liveOnly 표본이 0개라 " +
        "route 측정까지 함께 멈춰 있습니다(scripts/lib/product-scene-contract.mjs). " +
        "둘은 같은 매듭이며, 측정기를 장면 축과 route 축으로 가르는 것이 그 매듭을 푸는 길입니다.",
    );
  }
  return evidence;
}
