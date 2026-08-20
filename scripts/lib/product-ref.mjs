import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

// **측정은 움직이는 ref를 따라가지 않는다.**
//
// 그전까지 측정 스크립트는 `origin/main`을 봤고 근거 lock은 커밋을 고정했다. 둘이 갈리면
// 같은 명령이 어제와 다른 값을 낸다 — 2026-08-20에 배포본이 7e9c3b69에서 6337ad54로 넘어가자
// 표본 측정이 하드 실패했다(`previewZoomBadge` 상수가 새 커밋에서 사라졌다). 그전까지는 조용히
// 다른 값이 나올 수도 있었고, 그것이 더 나쁘다.
//
// 그래서 역할을 나눈다.
//
//   build-product-evidence.mjs   기준선을 **옮기는** 쪽 → `origin/main`을 본다
//   verify-product-evidence.mjs  기준선이 낡았다고 **알리는** 쪽 → `origin/main`을 본다
//   측정 스크립트들               기준선을 **재는** 쪽 → 여기서 lock의 커밋을 받는다
//
// 이렇게 하면 기준선 이동이 **의도한 행위**가 된다. lock을 갱신해야만 측정 대상이 움직이고,
// 갱신하지 않으면 제품이 아무리 앞서 나가도 어제와 같은 값이 나온다.
//
// 우선순위: `KLIPSE_PRODUCT_REF` 환경변수 > lock의 `productCommit` > `origin/main`.
// 환경변수를 맨 앞에 두는 것은 재기준선 작업 중에 후보 커밋으로 시험 측정을 하기 위해서다.

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const lockPath = resolve(repoRoot, "migration/product-evidence.lock.json");

export function resolveProductRef() {
  const fromEnv = process.env.KLIPSE_PRODUCT_REF;
  if (fromEnv) return { ref: fromEnv, source: "KLIPSE_PRODUCT_REF" };

  if (existsSync(lockPath)) {
    try {
      const lock = JSON.parse(readFileSync(lockPath, "utf8"));
      if (typeof lock.productCommit === "string" && /^[0-9a-f]{40}$/.test(lock.productCommit)) {
        return { ref: lock.productCommit, source: "product-evidence.lock.json" };
      }
    } catch {
      // lock이 깨져 있으면 아래 fallback으로 떨어진다. 조용히 넘기지 않고 source로 드러낸다.
    }
  }

  // lock이 없거나 읽을 수 없을 때만. 이 경로로 잰 값은 재현이 보장되지 않는다.
  return { ref: "origin/main", source: "fallback(origin/main) — 재현 보장 없음" };
}

export const productRef = resolveProductRef().ref;
