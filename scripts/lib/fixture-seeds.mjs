/**
 * **가짜 Supabase 의 표별 시드(2026-10-07).**
 *
 * 손 조립 보드 17장이 「데이터가 있어야 서는 화면」이라 측정 생성으로 바꾸지 못하고 있었다. 소유자가 2026-10-06 에 자리표시
 * 데이터를 허용했다 — **지어내는 것은 내용(이름 · 코드 · 번호)뿐이고 크기 · 색 · 간격은 그 내용으로 그려진 제품 화면을 잰 값이다**
 * (AGENTS.md 「값은 지어내지 않는다, 내용만」). 행의 모양(열 · 타입 · 필터 열)은 제품이 읽는 자리를 인용해 맞춘다.
 *
 * 여기 없는 표는 전과 같이 빈 목록이다. 시드가 든 표는 원장의 `fixture.seededTables` 에 표 이름과 행 수로 남는다 — 그 표에서 온
 * 글자는 제품 문구가 아니라 자리표시다.
 */

// `/admin/coupons/[id]/print` — 제품 `app/admin/coupons/[id]/print/page.tsx` 가 `[id]` 로 캠페인 한 행(`code, name` · `.eq("id", id)` ·
// `.maybeSingle()`)과 그 코드 목록(`code, sequence_no, batch_label` · `.eq("campaign_id", id)` · `.order("sequence_no")`)을 읽는다.
// 코드는 12자 Crockford Base32(`app/lib/payments/coupon-code.ts` 의 `COUPON_CODE_ALPHABET` — I · L · O · U 없음), 묶음 이름은 발급
// 경로(`app/api/admin/coupons/route.ts`)처럼 "1" · "2" 문자열이다. 10장 · 묶음 둘 — 묶음 띠와 4열 격자의 덜 찬 줄이 함께 보인다.
export const FIXTURE_COUPON_CAMPAIGN_ID = "00000000-0000-4000-8000-0000c0a90001";

const couponCodes = Array.from({ length: 10 }, (_, index) => ({
  campaign_id: FIXTURE_COUPON_CAMPAIGN_ID,
  code: `FX${String(index + 1).padStart(2, "0")}AAAAAAAA`,
  sequence_no: index + 1,
  batch_label: index < 6 ? "1" : "2",
}));

export const FIXTURE_SEEDS = Object.freeze({
  coupon_campaigns: [{ id: FIXTURE_COUPON_CAMPAIGN_ID, code: "FIXTURE2026", name: "픽스처 쿠폰 캠페인" }],
  coupon_codes: couponCodes,
});
