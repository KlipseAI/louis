// 정적 Tailwind 하네스에서 성립하지 않아 실제 제품 페이지에서 재야 하는 표본의 소유 목록.
// 이 목록과 figma/product-specimens.json의 `liveOnly` 집합이 다르면 variants가 표본을
// 조용히 버리거나 scenes가 일부만 재는 상태가 된다. 두 측정기가 같은 검사를 공유한다.
// **지금은 비어 있다.** 유일한 항목이던 `scene/staticHighlightDemo` 가 재던 UI —
// 랜딩의 창 셸 데모 패드(`EmptyProjectDemoPad` + `StaticHighlightDemo`) — 는 제품
// `8802565e`(2026-08-26, 랜딩을 "New Klipse" 구성으로 개편)에서 **삭제됐다.** 표본은 지워진
// 파일을 계속 가리켰고, 그래서 `verify-product-scenes` 는 빌드 환경을 갖춰 줘도 잴 것이
// 없었다(2026-08-30 확인). 살아남은 `StaticCreateDemo` 는 랜딩이 아니라 인앱
// `GettingStartedPanel` 안에 있어 인증 뒤에 있고, `CapabilitiesShowcaseParts` 는 아무도
// import 하지 않는 고아다.
//
// 목록을 비우면 게이트는 "잴 것이 없다"고 말하고 통과한다 — **조용히 초록이 되는 것이 아니라
// 비었다는 사실을 매번 찍는다.** 랜딩에 합성 장면이 다시 서면 여기에 id 를 넣어 되살린다.
export const LIVE_PRODUCT_SCENE_IDS = Object.freeze([]);

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
