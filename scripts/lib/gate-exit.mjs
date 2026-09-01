// 게이트의 종료코드 어휘.
//
// **왜 코드를 나누나.** `verify:product` 는 `&&` 로 이어 붙인 사슬이고, `verify-gate-split` 은
// 그 단계 수를 센다. 둘 다 종료코드만 본다 — 출력 문구는 읽지 않는다. 그래서 「잴 것이
// 하나도 없었다」가 `exit 0` 이면 사슬도 계수기도 그것을 **통과**로 센다. 실제로 그랬다:
// `measure-product-scenes.mjs` 는 liveOnly 표본 0개를 확인하고 전용 문구를 찍은 뒤 `exit 0`
// 했고, `verify-product-scenes` 는 표본 0개·route 0개를 재고 초록이었다(2026-09-01 원장
// `scenes-gate-measures-nothing`). 같은 날 `verify-product-render` 도 브라우저 대조를 0건
// 수행하고 초록이었다(`product-render-zero-comparisons`).
//
// 「빨간 것보다 나쁜 조용한 exit 0」은 이 저장소가 이미 두 번 밟은 함정이다
// (scripts/verify-gate-split.mjs 머리말). 그 판정을 문구가 아니라 **종료코드**로 옮긴다.
//
//   0  MEASURED       — 실제로 재고 대조했다.
//   1  UNAVAILABLE    — 잴 수 없다(제품 저장소·빌드 산출물 등 전제조건이 없다).
//   2  NOT_MEASURED   — 전제조건은 갖췄는데 **잰 것이 0건**이다.
//
// 1 과 2 를 가르는 이유: 「환경이 없다」는 그 기계를 갖추면 사라지지만, 「잴 것이 없다」는
// 갖춰도 사라지지 않는다 — 표본·계약 자체가 비어 있다는 뜻이라 고칠 곳이 다르다. 2026-08-30
// 에 이 둘을 뭉뚱그린 탓에 「환경 탓」으로 읽히던 영구 빨강이 사실은 「표본이 지워졌다」였다.
export const EXIT_MEASURED = 0;
export const EXIT_UNAVAILABLE = 1;
export const EXIT_NOT_MEASURED = 2;

// 문구에 `SKIP` 을 쓰지 않는다. `verify-gate-split` 이 출력의 SKIP 을 「조용히 자기를 껐다」로
// 판정하고, 그 판정은 옳다 — 재지 않은 것은 건너뛴 것이 아니라 실패다.
export function notMeasured(tag, message) {
  console.error("[" + tag + "] 재지 않았습니다(NOT_MEASURED) — " + message);
  process.exit(EXIT_NOT_MEASURED);
}

export function unavailable(tag, message) {
  console.error("[" + tag + "] 측정 불가(UNAVAILABLE) — " + message);
  process.exit(EXIT_UNAVAILABLE);
}
