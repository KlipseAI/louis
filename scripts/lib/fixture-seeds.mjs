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

// **공개 상세 둘(2026-10-07, 측정기 `--public-seeded`).** 블로그 글 · 템플릿 상세는 발행된 한 행이 있어야 선다 — 제품 `app/lib/blog/publicBlog.ts`
// `getPublishedPost` · `app/lib/templates/publicTemplates.ts` `getPublishedTemplate` 가 `select("*") · eq(slug) · eq(published, true) · maybeSingle()`
// 로 읽는다. 템플릿은 옛 손 조립 보드와 같은 미디어 5장(넘김 컨트롤이 보인다)이다. 블로그 상세는 커버를 그리지 않는다(커버는 목록
// `app/blog/page.tsx` 만 쓴다 — 옛 보드의 「커버 있음」은 틀렸다) — 커버는 비운다.
// 이미지는 바깥으로 새지 않게 제품 `public/` 의 같은 출처 파일(`/image-edit/examples/*.jpg`)을 상대 경로로 쓴다 — 제품 `toServedMedia` 가
// 해석 못 한 값을 원본 그대로 둔다(`servingUrlOrNull(url) ?? url`).
// 영상 · 유튜브 임베드는 넣지 않는다(CSP 가 data: 영상을 막고, 임베드는 바깥 네트워크다). 본문은 블로그 렌더러가 그리는 마크다운 요소를 한 번씩 담는다.
// 이 시드는 공개 목록(`/blog` · `/templates`)도 채우므로 **기존 공개 원장(`--public`)에는 넣지 않는다** — 그 보드는 빈 상태로 남는다.
const EXAMPLE = (n) => `/image-edit/examples/example-${n}.jpg`;
export const FIXTURE_PUBLIC_SEEDS = Object.freeze({
  blog_posts: [{
    id: "00000000-0000-4000-8000-0000000b1001",
    slug: "fixture-post",
    title: "Fixture post title",
    excerpt: "A one-line placeholder excerpt for the fixture post.",
    content: [
      "## Placeholder heading", "", "Placeholder paragraph with a [placeholder link](/blog).", "",
      "### Smaller heading", "", "- Item one", "- Item two", "", "1. Step one", "2. Step two", "",
      "> Placeholder quote", "", "`inline code`", "", "```", "code block", "```", "",
      "| Column A | Column B |", "| --- | --- |", "| Value | Value |", "", "---", "",
      `![](${EXAMPLE(1)})`,
    ].join("\n"),
    cover_image_url: null,
    published: true,
    published_at: "2026-01-01T00:00:00.000Z",
    author_email: null,
    created_at: "2026-01-01T00:00:00.000Z",
    updated_at: "2026-01-01T00:00:00.000Z",
  }],
  templates: [{
    id: "00000000-0000-4000-8000-0000000a1001",
    slug: "filter",
    title: "Fixture template title",
    description: "A placeholder description line.\nSecond line.",
    prompt: "Placeholder prompt text.\nSecond line.",
    media: [1, 2, 3, 4, 5].map((n) => ({ type: "image", url: EXAMPLE(n) })),
    workflow_video_url: null,
    published: true,
    published_at: "2026-01-01T00:00:00.000Z",
    sort_order: 0,
    author_email: null,
    created_at: "2026-01-01T00:00:00.000Z",
    updated_at: "2026-01-01T00:00:00.000Z",
  }],
});
