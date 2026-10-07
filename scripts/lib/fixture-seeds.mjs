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

// `/nodecanvas?project=<id>` — 노드캔버스 편집기(2026-10-07). `/api/projects/[projectId]` 가 프로젝트 한 행(`id` · `user_id` eq · maybeSingle)을,
// `/api/canvas/[projectId]` 가 캔버스 문서(`canvas_sessions` · `project_id` · `user_id` eq · maybeSingle)를 읽는다 — 프로젝트가 없으면 오류 한 줄,
// 문서가 없으면 빈 캔버스다. 노드는 텍스트 → 이미지 → 영상 셋과 두 엣지로, data 꼴 · 핸들 이름 · 간격(미디어 폭 400 + 간격 160)은 제품
// `lib/landing/buildLandingShowcaseV2Document.ts` 를 따른다. 이미지는 바깥으로 새지 않게 1×1 PNG data URL 이다(문서 서명이 data: 를 그대로 둔다).
// 영상 노드는 결과 없이(빈 상태) — `generated_videos` 를 넣으면 서명하러 바깥으로 간다. 프로젝트 행은 `id` 로 집을 때만 보인다(허브 목록은 빈 상태로 둔다).
export const FIXTURE_CANVAS_PROJECT_ID = "00000000-0000-4000-8000-0000000c0001";
const FIXTURE_USER = "00000000-0000-4000-8000-00000000f1c5";
const ONE_PIXEL_PNG = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mN8+P9/PQAJYwN4d1E2KAAAAABJRU5ErkJggg==";
const canvasDocument = {
  version: 2,
  globalState: { prompt: "", videoModelId: "seedance-2.0-mini", videoAspectRatio: "9:16", videoDuration: 8, videoSound: true, videoResolution: "1080p" },
  textNodeState: { texts: { "seed-text": "Placeholder generated prompt paragraph." }, inputTexts: { "seed-text": "Placeholder request sentence." }, assistModels: {}, assistReasoning: {} },
  nodes: [
    { id: "seed-text", type: "text", position: { x: 0, y: 0 }, data: { mode: "llm", text: "Placeholder request sentence.", generatedText: "Placeholder generated prompt paragraph." } },
    { id: "seed-image", type: "image", position: { x: 560, y: 0 }, data: { imageOrigin: "generate", imageUrl: ONE_PIXEL_PNG, mediaAspect: 1 } },
    { id: "seed-video", type: "video", position: { x: 1120, y: 0 }, data: { modelId: "seedance-2.0-mini", aspectRatio: "9:16", duration: 8, soundOn: true, videoResolution: "1080p", mediaAspect: 0.5625 } },
  ],
  edges: [
    { id: "edge-seed-text-seed-image-text", source: "seed-text", sourceHandle: "out", target: "seed-image", targetHandle: "text", data: { tone: "text" } },
    { id: "edge-seed-image-seed-video-reference-images", source: "seed-image", sourceHandle: "image", target: "seed-video", targetHandle: "reference-images", data: { tone: "image" } },
  ],
};

// `/videoeditor/[projectId]` — 편집기(2026-10-07). `/api/editor/projects/[projectId]` 가 `editor_projects` 한 행(`id` · `user_id` eq · maybeSingle)을
// 읽는다 — 없으면 빈 편집기(「Untitled Project」)다. 소스 둘 · 클립 둘. 소스 영상 주소는 스토리지 참조가 아닌 절대 URL(`https://fixture.invalid/…`) —
// 참조로 읽히면 서명하러 가고, 측정기는 바깥 요청을 끊어 미리보기 영상은 검은 면이다(크롭 비율은 소스 메타의 width · height 가 정한다).
// 썸네일은 1×1 PNG data URL 로 채워 디코더 추출을 건너뛴다(비면 재시도하며 안정화가 흔들린다). `thumbnail_url` 은 `?tv=4` 를 붙여 진입 1.2초 뒤
// 썸네일 생성 요청(스토리지 업로드)을 막는다 — 이 화면은 그 값을 그리지 않는다. 편집기 허브 목록이 같은 표를 `user_id` 로 읽으므로 `id` 로 집을 때만 보인다.
export const FIXTURE_EDITOR_PROJECT_ID = "00000000-0000-4000-8000-0000000ed170";
const editorSource = (nodeId, origin, name, frames) => ({
  nodeId, origin, name, url: `https://fixture.invalid/${nodeId}.mp4`, fps: 30, totalFrames: frames, durationSec: frames / 30,
  width: 1920, height: 1080, thumbnails: [ONE_PIXEL_PNG],
});

// `/highlight/[projectId]` 완료(클립 격자, 2026-10-07). `/api/highlight/project/[projectId]` 가 `highlight_jobs` 최신 한 행(`project_id` · `user_id` eq ·
// order · limit 1)과 프로젝트 이름(`projects` · `id` eq)을 읽는다. 상태 `extracted` 에 클립 다섯이 있으면 완료 격자다. 클립 주소는 스토리지 참조가
// 아닌 바깥 절대 URL 이라 서명 없이 내려가고, 측정기는 바깥 요청을 끊어 카드 영상은 검은 면 · 비율은 CSS 기본값(4:3)이다 — 실제 제품은 원본
// 비율이지만 비율도 데이터라 지어내지 않는다. 상세 보기(viewMode detail)는 카드를 눌러야 열려 재지 않는다. 허브(`/highlight`)는 프로젝트를
// `user_id` · `type` 으로 읽으므로 이 프로젝트 행은 `id` 로 집을 때만 보인다.
export const FIXTURE_HIGHLIGHT_PROJECT_ID = "00000000-0000-4000-8000-00000000c0c1";
const highlightItem = (index) => ({
  index, start_time: `00:${String(5 + index * 20).padStart(2, "0")}`, end_time: `00:${String(20 + index * 20).padStart(2, "0")}`,
  duration_seconds: 15, summary: `Placeholder summary ${index + 1}`, reason: `Placeholder reason ${index + 1}`,
  score: Math.round((0.95 - index * 0.05) * 100) / 100, type: "single", title: `Placeholder clip title ${index + 1}`, segments: null,
});

// `/highlight/[projectId]/shorts/[shortId]` 렌더 완료 결과(2026-10-07). `/api/highlight/shorts/[shortId]` 가 `highlight_shorts` 한 행(`id` · `user_id` eq ·
// maybeSingle)을 읽고 `result_url` 을 `toPlayableUrl` 로 바꾼다 — 스토리지 참조가 아닌 바깥 절대 URL 은 그대로 내려가고, 측정기는 바깥 요청을
// 끊어 결과 영상은 검은 면이다. `result_url` 이 있으면 편집 모달을 닫은 결과 보기다(page.tsx 836 `setModalOpen(!json.data.result_url)`).
// `editor_state` 는 비워 비율이 제품 기본값(9:16)을 따른다. 뒤로가기 옆 제목은 하이라이트 완료 시드의 프로젝트 이름이다.
// 하이라이트 완료 화면이 같은 표를 읽어도 `id` 로 집을 때만 보인다.
export const FIXTURE_HIGHLIGHT_SHORT_ID = "00000000-0000-4000-8000-00000000c0c3";

export const FIXTURE_SEEDS = Object.freeze({
  coupon_campaigns: [{ id: FIXTURE_COUPON_CAMPAIGN_ID, code: "FIXTURE2026", name: "픽스처 쿠폰 캠페인" }],
  coupon_codes: couponCodes,
  projects: {
    requireFilter: "id",
    rows: [
      { id: FIXTURE_CANVAS_PROJECT_ID, user_id: FIXTURE_USER, name: "Fixture canvas project", status: "draft", node_canvas_thumbnail_url: null,
        created_at: "2026-01-01T00:00:00.000Z", updated_at: "2026-01-01T00:00:00.000Z" },
      { id: FIXTURE_HIGHLIGHT_PROJECT_ID, user_id: FIXTURE_USER, name: "Fixture highlight project", status: "draft", node_canvas_thumbnail_url: null,
        created_at: "2026-01-01T00:00:00.000Z", updated_at: "2026-01-01T00:00:00.000Z" },
    ],
  },
  highlight_jobs: {
    requireFilter: "project_id",
    rows: [{
      id: "00000000-0000-4000-8000-00000000c0c2", project_id: FIXTURE_HIGHLIGHT_PROJECT_ID, user_id: FIXTURE_USER, created_at: "2026-01-02T00:00:00.000Z",
      cut_job_id: "fixture-cut-completed", theme_id: "vlog", sport_type: null, source_filename: "placeholder-source.mp4", status: "extracted",
      highlights: [0, 1, 2, 3, 4].map(highlightItem),
      clips: [0, 1, 2, 3, 4].map((index) => ({ index, filename: `clip_${index}.mp4`, download_url: `https://fixture.invalid/clip-${index}.mp4` })),
      video_url: null, thumbnail_url: null, dominant_color: null, selected_indices: [0, 1, 2, 3, 4], unanalyzed_ranges: [],
    }],
  },
  highlight_shorts: {
    requireFilter: "id",
    rows: [{
      id: FIXTURE_HIGHLIGHT_SHORT_ID, user_id: FIXTURE_USER, job_id: "00000000-0000-4000-8000-00000000c0c2", clip_index: 0, status: "done",
      editor_state: {}, result_url: "https://fixture.invalid/short-result.mp4",
      caption_ko: "자리표시 쇼츠 제목", caption_en: "Placeholder short title",
      created_at: "2026-01-03T00:00:00.000Z", updated_at: "2026-01-03T00:00:00.000Z",
    }],
  },
  canvas_sessions: [{ id: "00000000-0000-4000-8000-0000000c5001", project_id: FIXTURE_CANVAS_PROJECT_ID, user_id: FIXTURE_USER,
    updated_at: "2026-01-01T00:00:00.000Z", document: canvasDocument }],
  editor_projects: {
    requireFilter: "id",
    rows: [{
      id: FIXTURE_EDITOR_PROJECT_ID, user_id: FIXTURE_USER, name: "Fixture edit project", source_type: "upload", source_ref_id: null, status: "draft",
      result_url: null, thumbnail_url: "https://fixture.invalid/editor-thumbnail.webp?tv=4",
      created_at: "2026-01-01T00:00:00.000Z", updated_at: "2026-01-01T00:00:00.000Z",
      state: {
        aspectRatio: "16:9", fitMode: "fit",
        sources: [editorSource("ep-fixture-a", "upload", "Clip A", 300), editorSource("ep-fixture-b", "import", "Clip B", 240)],
        clips: [
          { id: "clip-1", sourceVideoNodeId: "ep-fixture-a", startFrame: 0, endFrame: 150 },
          { id: "clip-2", sourceVideoNodeId: "ep-fixture-b", startFrame: 0, endFrame: 120 },
        ],
        sourceRegions: [], overlays: [], audioTracks: [], transitions: [], markers: [],
      },
    }],
  },
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
