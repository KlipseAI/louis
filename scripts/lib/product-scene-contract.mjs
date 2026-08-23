// 정적 Tailwind 하네스에서 성립하지 않아 실제 제품 페이지에서 재야 하는 표본의 소유 목록.
// 이 목록과 figma/product-specimens.json의 `liveOnly` 집합이 다르면 variants가 표본을
// 조용히 버리거나 scenes가 일부만 재는 상태가 된다. 두 측정기가 같은 검사를 공유한다.
export const LIVE_PRODUCT_SCENE_IDS = Object.freeze([
  "scene/staticHighlightDemo",
]);

export function assertLiveProductSceneCoverage(specimens) {
  if (!Array.isArray(specimens)) {
    throw new Error("[product-scenes] product-specimens.json의 specimens가 배열이 아닙니다.");
  }

  const declared = specimens
    .filter((specimen) => specimen.liveOnly)
    .map((specimen) => specimen.id)
    .sort();
  const handled = [...LIVE_PRODUCT_SCENE_IDS].sort();
  if (new Set(declared).size !== declared.length) {
    throw new Error("[product-scenes] liveOnly 표본 id는 중복될 수 없습니다: " + declared.join(", "));
  }
  if (JSON.stringify(declared) !== JSON.stringify(handled)) {
    throw new Error(
      "[product-scenes] liveOnly 커버리지가 다릅니다. declared=" + declared.join(",") +
        " handled=" + handled.join(","),
    );
  }

  return specimens.filter((specimen) => specimen.liveOnly);
}
