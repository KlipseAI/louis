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

// `/nodecanvas?project=<id>` 두 번째 프로젝트 — 나머지 노드 다섯(2026-10-14). 캔버스는 노드 묶음에 줌을 맞추므로 위 프로젝트에 노드를 더하면
// 그 화면의 모든 측정(줌 0.815)과 세트가 함께 흔들린다 — 그래서 프로젝트를 따로 둔다. 노드는 윗줄 TTS · 사운드(음악) · 편집, 아랫줄 YouTube ·
// Instagram 두 줄(미디어 폭 400 + 간격 160)이고 엣지는 없다 — 다섯을 한 줄에 두면 맞춤 줌이 0.52 배라(2026-10-14 캡처) 첫 프로젝트(0.815)와
// 비슷한 배율이 되게 두 줄로 접었다. data 는 제품이 툴바로 노드를 더할 때 넣는 기본값(`index.tsx` addStandaloneAudioNode ·
// addNodeFromToolbarVideoEdit)에 자리표시 글자만 얹었다. 생성 결과(오디오 · 영상)는 넣지 않는다 — 넣으면 재생 주소를 서명하러 바깥으로 간다.
// TTS 음성은 서버가 음성 목록을 못 받을 때 돌려주는 대체 목록의 첫 항목(`app/lib/providers/tts/google/index.ts` FALLBACK_KO_VOICES)이라
// 목록이 와도 안 와도 칩 글자가 같다. YouTube · Instagram 은 계정을 잇지 않은 상태다(가짜 Supabase 에 연결 행이 없다).
export const FIXTURE_CANVAS_MORE_PROJECT_ID = "00000000-0000-4000-8000-0000000c0002";
const canvasMoreDocument = {
  version: 2,
  globalState: { prompt: "", videoModelId: "seedance-2.0-mini", videoAspectRatio: "9:16", videoDuration: 8, videoSound: true, videoResolution: "1080p" },
  textNodeState: { texts: {}, inputTexts: {}, assistModels: {}, assistReasoning: {} },
  nodes: [
    { id: "seed-tts", type: "tts", position: { x: 0, y: 0 },
      data: { provider: "google", speed: 1, volume: 1, language: "ko-KR", voiceId: "ko-KR-Chirp3-HD-Achernar", voiceName: "Achernar (Chirp3 HD)", text: "Placeholder narration sentence." } },
    { id: "seed-bgm", type: "bgm", position: { x: 560, y: 0 },
      data: { provider: "elevenlabs", mode: "music", durationSec: 30, vocals: false, promptInfluence: 0.5, loop: false, volume: 1, prompt: "Placeholder music mood." } },
    { id: "seed-edit", type: "edit", position: { x: 1120, y: 0 }, data: { sources: [], clips: [] } },
    { id: "seed-youtube", type: "youtube", position: { x: 0, y: 480 }, data: { title: "Placeholder video title", description: "Placeholder video description." } },
    { id: "seed-instagram", type: "instagram", position: { x: 560, y: 480 }, data: { caption: "Placeholder caption sentence." } },
  ],
  edges: [],
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
// 시각은 `mm:ss` 로 적는다 — 초를 그대로 이어 붙이면 「00:65 – 00:80」처럼 없는 시각이 보드에 선다(2026-10-07 캡처).
const clock = (seconds) => `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`;
const highlightItem = (index) => ({
  index, start_time: clock(5 + index * 20), end_time: clock(20 + index * 20),
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
      { id: FIXTURE_CANVAS_MORE_PROJECT_ID, user_id: FIXTURE_USER, name: "Fixture canvas nodes project", status: "draft", node_canvas_thumbnail_url: null,
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
    updated_at: "2026-01-01T00:00:00.000Z", document: canvasDocument },
  { id: "00000000-0000-4000-8000-0000000c5002", project_id: FIXTURE_CANVAS_MORE_PROJECT_ID, user_id: FIXTURE_USER,
    updated_at: "2026-01-01T00:00:00.000Z", document: canvasMoreDocument }],
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
  // **모델 페이지 둘(2026-10-14, `/models` · `/models/[slug]`).** 제품 `app/lib/models/landingModelCards.ts` `loadLandingModelCards` 가
  // `landing_models` 를 `select(id, name, description, description_en, description_ja, media_url, media_type, video_playback, logo_url, badge,
  // display_order) · eq(is_active, true) · order(display_order)` 로 읽는다. 카드가 없으면 목록의 최신 모델 배너 · 상세의 한 줄 소개와 결과 영상 ·
  // 「다른 모델」 격자가 통째로 빠져(`app/models/page.tsx` · `app/models/[slug]/page.tsx`) 채운 상태가 아니다. 카드 이름은 제품
  // `PUBLIC_MODELS` 의 `landingName` 과 글자 그대로 같아야 붙는다(`sameCardName`) — 이름은 그 목록을 옮긴 것이고 한 줄 소개만 자리표시다.
  // **미디어는 그림 + 측정용 CDN 주소다.** `toServingUrl` 이 http(s) 만 그대로 두고(상대 경로는 「알 수 없는 키」로 null), `next/image` 는
  // `NEXT_PUBLIC_CDN_BASE_URL`(측정기가 `https://cdn.fixture.invalid` 로 세운다)의 호스트만 받는다(next.config.js remotePatterns). 그래서
  // 그 호스트 밑에 제품 public 의 예시 그림 경로(`/image-edit/examples/example-N.jpg`)를 붙인다 — 바깥 요청은 끊겨 브라우저에는 빈 칸이지만,
  // 측정기는 `/_next/image?url=` 의 원본 주소를 적고 생성기는 그 주소를 같은 예시 그림 자산 컴포넌트로 잇는다(build-figma-app-screens
  // IMAGE_COMPONENTS). 처음에 영상(`https://fixture.invalid/…mp4`)으로 시드했더니 영상 칸이 바탕 없는 빈 면이라 「다른 모델」 카드가 흰
  // 글자만 남았다 — 영상 모델의 카드도 그림 카드와 같은 상자(정사각 · object-cover)라 그림으로 둔다. 로고는 비운다 — 제품 `ModelLogo` 의
  // 이름 첫 글자 분기다(바깥 주소의 마스크는 그려지지 않는다). 첫 카드에만 「New」를 달아 목록 배너가 그 모델(Seedance 2.5)을 고른다(`newest` 산식).
  landing_models: [
    "Seedance 2.5", "Veo 3.1", "Kling 3.0", "Gemini Omni 1.1", "Seedance 2.0", "Minimax H3", "Kling 3.0 Omni", "GPT Image 2.5", "Nano Banana 2", "ElevenLabs",
  ].map((name, index) => ({
    id: `00000000-0000-4000-8000-0000000d${String(index + 1).padStart(4, "0")}`,
    name,
    description: "Placeholder one-line model description.",
    description_en: "Placeholder one-line model description.",
    description_ja: null,
    media_url: `https://cdn.fixture.invalid/image-edit/examples/example-${(index % 5) + 1}.jpg`,
    media_type: "image",
    video_playback: "loop",
    logo_url: null,
    badge: index === 0 ? "new" : null,
    display_order: index + 1,
    is_active: true,
  })),
});

// **Klipse Deck 교안 판(2026-10-14, 측정기 `--session-deck`).** 덱 화면(`/deck` · `/deck/c/[course]` · `/deck/manage`)은 DB 가 아니라 S3 의
// `shared/decks/current.json`(지금 판 id)과 `shared/decks/releases/<id>.json`(판 하나 — manifest · 메모)을 읽는다(앵커 `app/lib/deck/releases.server.ts`).
// 가짜 S3(`lib/fixture-fake-s3.mjs`)가 이 객체만 내준다. 세션 사용자(fixture@klipse.test)는 `ADMIN_EMAILS` 라 발표자 · 최고 관리자다 — 모든 교안을 본다.
// 라이브러리 카드 넷(과정 하나 · 언어판 셋인 덱 · 기준일 있는 덱 · 발표자 전용 덱)과 과정 차시 셋, 관리 화면의 판 둘(현재 · 지난 판)이 선다.
// 글자는 자리표시이고 manifest 의 꼴(DeckManifest · DeckItem · DeckInfo · access)은 제품 그대로다. 파일 해시 · 크기는 지어낸 값이다(내용은 내주지 않는다 —
// 표지 그림 `/deck/thumbs/<덱>.png` 는 404 로 빈 상자이고, 보드는 생성기 IMAGE_COMPONENTS 가 예시 그림에 잇는다).
export const FIXTURE_DECK_COURSE = "fixture-course";
const DECK_HASH = "f1c5".repeat(16);
const deckInfo = (slug, label, subtitle, minutes, extra = {}) => ({ slug, label, subtitle, minutes: String(minutes), slides: 24, ...extra });
const COURSE_DECKS = [1, 2, 3].map((n) => deckInfo(`fixture-course-${n}`, `Session ${n}`, `Placeholder session ${n} title`, 40 + n * 5));
const LANG_DECKS = [["KO", "ko"], ["EN", "en"], ["JA", "ja"]].map(([lang, code]) => deckInfo(`fixture-deck-${code}`, `Placeholder deck (${lang})`, "Placeholder deck subtitle", 30, { lang }));
const MEMBER_DECK = deckInfo("fixture-member-deck", "Placeholder member deck", "Placeholder deck subtitle", 20);
const PRESENTER_DECK = deckInfo("fixture-presenter-deck", "Placeholder presenter deck", "Placeholder deck subtitle", 50);
const deckFiles = (decks) => Object.fromEntries(decks.flatMap(({ slug, audience }) => [
  [`thumbs/${slug}.png`, { hash: DECK_HASH, size: 182_400, type: "image/png" }],
  [`_p/d/${slug}/index.html`, { hash: DECK_HASH, size: 96_200, type: "text/html" }],
  ...(audience === "presenter" ? [] : [[`d/${slug}/index.html`, { hash: DECK_HASH, size: 88_900, type: "text/html" }]]),
]));
const deckManifest = ({ withPresenterDeck }) => {
  const decks = [
    ...COURSE_DECKS.map((d) => ({ slug: d.slug, audience: [FIXTURE_DECK_COURSE] })),
    ...LANG_DECKS.map((d) => ({ slug: d.slug, audience: "member" })),
    { slug: MEMBER_DECK.slug, audience: "member" },
    ...(withPresenterDeck ? [{ slug: PRESENTER_DECK.slug, audience: "presenter" }] : []),
  ];
  return {
    format: 1,
    site: { sections: [{ title: "Placeholder section", items: [
      { kind: "course", slug: FIXTURE_DECK_COURSE, title: "Placeholder course", description: "Placeholder course description.", audience: "enrolled", decks: COURSE_DECKS },
      { kind: "deck", title: "Placeholder deck with language versions", audience: "member", decks: LANG_DECKS },
      { kind: "deck", title: "Placeholder member deck", audience: "member", asOf: "2026-10-01", decks: [MEMBER_DECK] },
      ...(withPresenterDeck ? [{ kind: "deck", title: "Placeholder presenter deck", audience: "presenter", decks: [PRESENTER_DECK] }] : []),
    ] }] },
    access: { [`c/${FIXTURE_DECK_COURSE}`]: [FIXTURE_DECK_COURSE], ...Object.fromEntries(decks.map(({ slug, audience }) => [`d/${slug}`, audience])) },
    files: deckFiles(decks),
  };
};
const DECK_RELEASE_CURRENT = "20261001T090000Z-00000000000f1c52";
const DECK_RELEASE_PREVIOUS = "20260915T090000Z-00000000000f1c51";
const deckRelease = (id, createdAt, note, manifest) => ({ format: 1, id, note, createdAt, createdBy: "fixture@klipse.test", manifest });
export const FIXTURE_DECK_S3_OBJECTS = Object.freeze({
  "shared/decks/current.json": { id: DECK_RELEASE_CURRENT, activatedAt: "2026-10-01T09:05:00.000Z", activatedBy: "fixture@klipse.test" },
  [`shared/decks/releases/${DECK_RELEASE_CURRENT}.json`]: deckRelease(DECK_RELEASE_CURRENT, "2026-10-01T09:00:00.000Z", "Placeholder release note", deckManifest({ withPresenterDeck: true })),
  [`shared/decks/releases/${DECK_RELEASE_PREVIOUS}.json`]: deckRelease(DECK_RELEASE_PREVIOUS, "2026-09-15T09:00:00.000Z", "Placeholder earlier release note", deckManifest({ withPresenterDeck: false })),
});

// **부스 체험(2026-10-15, `/creative-media`, DS-D-0109).** 세션 모드 가짜 Supabase 에 **따로 얹는** 시드다 — 공용 `FIXTURE_SEEDS` 는 건드리지
// 않는다(측정기가 세션 모드에서만 합친다). 제품 `app/creative-media/page.tsx` 는 활성 행사가 없으면 닫힘 화면만 그린다 —
// `app/lib/creative-media/events.ts` `getActiveEvent` 가 `creative_media_events` 를 `select(id, max_generations, generation_count, per_device_limit)
// · eq(is_active, true) · or(starts_at.is.null, starts_at.lte.<지금>) · or(ends_at.is.null, ends_at.gte.<지금>) · order(created_at.desc) · limit(1)
// · maybeSingle()` 로 읽고, `app/lib/creative-media/templates.ts` `listActiveTemplates` 가 `creative_media_templates` 를 `select(id, slug, title,
// title_en, description, description_en, example_image_urls) · eq(is_active, true) · order(display_order)` 로 읽는다(템플릿마다 완료 생성 수는
// `creative_media_generations` 의 head 개수 — 시드가 없어 0).
// **둘 다 `requireFilter: "is_active"`** — 같은 세션 측정의 부스 운영 화면(`/creative-media-admin`)이 같은 표를 활성 필터 없이 읽으므로 그
// 보드의 빈 상태를 바꾸지 않는다. 행사 기간은 비워(null) `or` 의 `is.null` 갈래로 통과한다. 예시 그림은 측정용 CDN 호스트 밑의 제품 public
// 예시 그림 경로다(`toServingUrl` 은 http(s) 를 그대로 둔다 — 생성기 IMAGE_COMPONENTS 가 같은 예시 그림 자산으로 잇는다). 글자는 자리표시다.
export const FIXTURE_CREATIVE_MEDIA_SEEDS = Object.freeze({
  creative_media_events: {
    requireFilter: "is_active",
    rows: [{
      id: "00000000-0000-4000-8000-00000000c3e1",
      max_generations: 500,
      generation_count: 128,
      per_device_limit: 3,
      is_active: true,
      starts_at: null,
      ends_at: null,
      created_at: "2026-01-01T00:00:00.000Z",
    }],
  },
  creative_media_templates: {
    requireFilter: "is_active",
    rows: [1, 2, 3, 4].map((n) => ({
      id: `00000000-0000-4000-8000-00000000c3${String(n).padStart(2, "0")}`,
      slug: `fixture-template-${n}`,
      title: `자리표시 템플릿 ${n}`,
      title_en: `Placeholder template ${n}`,
      description: "자리표시 템플릿 설명 한 줄.",
      description_en: "Placeholder one-line template description.",
      example_image_urls: [
        `https://cdn.fixture.invalid/image-edit/examples/example-${n}.jpg`,
        `https://cdn.fixture.invalid/image-edit/examples/example-${(n % 5) + 1}.jpg`,
      ],
      display_order: n,
      is_active: true,
    })),
  },
});
