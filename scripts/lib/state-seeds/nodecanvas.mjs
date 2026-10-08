/**
 * **상태 레시피 영역 「nodecanvas」의 가짜 Supabase 시드(2026-10-08).**
 *
 * 정본 설계: 상태 레시피 설계서(작업 메모 louis-uptake/2026-10-08-state-recipes-design.md) 1-3절 `supabase.module` · 4-7절.
 * 레시피(`migration/measure-states/nodecanvas.json`)의 `supabase.module` 이 `scripts/lib/state-seeds/nodecanvas.mjs#<export>` 로
 * 이 파일의 내보내기 하나를 가리킨다. **계약: 내보내기는 `FIXTURE_SEEDS`(scripts/lib/fixture-seeds.mjs)를 받아 늘린 시드 전체를
 * 돌려준다** — 그 화면 동안만 가짜 Supabase 의 표가 이 값으로 바뀐다(설계서 2절 5번 `setOverlay`). 기존 `fixture-seeds.mjs` 는
 * 고치지 않는다(설계서 3절 「시드 상수」 — 거기에 행을 더하면 세션 원장의 `seededTables` 와 허브 빈 상태가 바뀐다).
 *
 * 화면마다 **새 프로젝트 id** 를 쓴다. 기준 화면(`/nodecanvas?project=<FIXTURE_CANVAS_PROJECT_ID>`)의 문서는 그대로 두고, 레시피의
 * `url` 이 이 id 를 연다. 행 모양은 기준 시드와 같다(제품이 읽는 자리):
 *   · `projects` — 제품 `app/api/projects/[projectId]/route.ts:177` 이 `id` · `user_id` eq · maybeSingle 로 읽는다. `requireFilter: "id"`
 *     는 기준 시드와 같다(허브 목록에 새 행이 새지 않게).
 *   · `canvas_sessions` — 제품 `app/api/canvas/[projectId]/route.ts:302–303` 이 `project_id` · `user_id` eq · maybeSingle 로 읽는다.
 *     프로젝트마다 행 하나라 기준 행 옆에 붙여도 섞이지 않는다.
 *
 * **지어낸 것은 내용(이름 · 제목 · 개수)뿐이다.** 문구는 제품 랜딩 쇼케이스 문서(`components/landing/sections/nodeShowcase.ts`, 영어판)의
 * 데모 값을 그대로 옮겼다 — 제품이 같은 노드에 직접 쓴 값이라 글자 길이 위험이 가장 적다. 그 문서에 없는 칸만 짧은 「Placeholder …」다.
 * 미디어는 바깥으로 새지 않게 제품 `public/` 의 같은 출처 파일(쇼케이스 이미지 · 영상)을 상대 경로로 쓴다 — 캔버스 조회의
 * `withPlayableDocumentUrlsAndUnsignedRefs` 는 해석 못 하는 값을 그대로 둔다(`app/lib/storage/serving.ts` toPlayableUrl 주석).
 * 오디오 파일은 제품 `public/` 에 없어 TTS · 사운드 노드는 생성 전 상태다(쇼케이스는 `blob:` 오디오라 문서에 담을 수 없다).
 * 시각은 고정 절대 시각(UTC 정오 근처 — 어느 시간대에서도 날짜가 같다)이다.
 *
 * React Flow 의 fitView 가 노드 수에 따라 배율을 바꾸므로(설계서 5절 5번) **캔버스 하나에 노드를 3개 넘게 두지 않는다**. 가로 자리는
 * 기준 시드와 같은 격자(미디어 폭 400 + 간격 160 → x 0 · 560 · 1120)다.
 */

export const NODECANVAS_STATE_PROJECTS = Object.freeze({
  publish: "00000000-0000-4000-8000-0000000c0101",
  analysis: "00000000-0000-4000-8000-0000000c0102",
  audio: "00000000-0000-4000-8000-0000000c0103",
  sectionEdit: "00000000-0000-4000-8000-0000000c0104",
  imageEdit: "00000000-0000-4000-8000-0000000c0105",
  promptVariants: "00000000-0000-4000-8000-0000000c0106",
  empty: "00000000-0000-4000-8000-0000000c0107",
});

const CREATED_AT = "2026-01-10T03:00:00.000Z";

// ── 제품 데모 값(nodeShowcase.ts 영어판) ──────────────────────────────────────────────────────────────
// 줄 번호는 통합 앵커 76b6cf15 기준이고, 레시피의 cite 가 같은 줄을 기계로 확인한다.
const SHOWCASE_IMAGE_URL = "/images/landing/node-showcase-sofa.webp"; // nodeShowcase.ts:26
const SHOWCASE_IMAGE_ASPECT = 1088 / 1920; // :27
const SHOWCASE_VIDEO_URL = "/videos/node-showcase-sofa.mp4"; // :28
const SHOWCASE_VIDEO_ASPECT = 720 / 1272; // :29–31
const SHOWCASE_ASSIST_MODEL = "gemini-3.5-flash-lite"; // :48
const TEXT_INPUT_EN = // :90
  "Write an image prompt for a bouclé modular sofa key visual. Keep the product as the hero, with no people.";
const TEXT_OUTPUT_EN = [ // :92
  "An oatmeal bouclé modular sofa is the hero of a minimal living room in afternoon sun. Its rounded modules run long and sit low, with no legs.",
  "Shoot from low eye level, the nearest arm module large and the rest receding diagonally. An oak block table and black ceramic vase sit front right.",
  "Low sun through black steel grid windows casts a diagonal patch on the plaster wall and long frame shadows across the concrete floor.",
  "A 35mm lens with deep focus keeps bouclé loops and oak grain crisp. Warm oatmeal, oak and matte black in natural-light interior photography.",
  "Avoid people, sofa legs, floating furniture, smeared fabric and warped window frames.",
].join("\n");
const IMAGE_PROMPT_EN = // :113
  "An oatmeal bouclé modular sofa sits beside an oak block table and a black ceramic vase, as afternoon sun casts long window shadows across the concrete floor.";
const VIDEO_PROMPT_EN = // :121
  "The camera opens on the bouclé sofa in a sunlit living room, moves in close on the fabric, and ends low where the modules sit on an oak base.";
const SCRIPT_INPUT_EN = // :143
  "Write a voiceover script for the sofa ad video. Keep it calm, and only mention what's on screen.";
const SCRIPT_OUTPUT_EN = [ // :145
  "Afternoon sun fills the living room, and black steel window shadows stretch across the concrete floor.",
  "Under the wooden ceiling beams, light falls in a diagonal patch on the plaster wall.",
  "In that light, an oatmeal bouclé modular sofa sits low.",
  "Its rounded modules run long and close to the floor, with no legs.",
  "Move in close, and the sunlit bouclé loops come into sharp focus.",
  "Below, a warm oak base holds each module.",
  "With a thick oak block table and a black ceramic vase beside it, the room settles into oatmeal, oak and matte black.",
  "Hydra Glow. The bouclé modular sofa, in the afternoon light.",
].join("\n");
const YOUTUBE_TITLE_EN = "Hydra Glow Sofa Launch Teaser"; // :241
const YOUTUBE_DESCRIPTION_EN = // :250
  "Meet the Hydra Glow bouclé modular sofa.\nA close look at sunlit bouclé and its oak base.\nIt sits low on the floor, with no legs showing.\n#HydraGlow #BoucleSofa #ModularSofa";
const YOUTUBE_TAGS_EN = ["HydraGlow", "sofa", "homedecor"]; // :421
const DEMO_CHANNEL_ID = "klipse-demo-channel"; // :427
const DEMO_CHANNEL_TITLE = "Klipse Studio"; // :428
const TTS_VOICE_ID_EN = "en-US-Chirp3-HD-Kore"; // :385
const TTS_VOICE_NAME = "Kore (Chirp3 HD)"; // :400

/** 레시피 응답(`data/nodecanvas/*.json`)과 같아야 하는 값 — 데이터 파일이 이 값을 손으로 옮겨 적었다. */
export const NODECANVAS_STATE_CONTENT = Object.freeze({
  youtubeVideoId: "Placeholder",
  youtubeUploadedAt: CREATED_AT,
  channelId: DEMO_CHANNEL_ID,
  channelTitle: DEMO_CHANNEL_TITLE,
  ttsVoiceId: TTS_VOICE_ID_EN,
  ttsVoiceName: TTS_VOICE_NAME,
  youtubeTitle: YOUTUBE_TITLE_EN,
});

// ── 노드 · 연결선 만들기(제품 문서 꼴: useCanvasPersistence.ts CanvasDocument) ─────────────────────────
const videoNode = (id, x) => ({
  id,
  type: "video",
  position: { x, y: 0 },
  // nodeShowcase.ts videoNode(:283–298) 과 같은 data — 결과가 있어야 게시 출력점(youtube-out · instagram-out)이 선다
  // (VideoNode.tsx:1569 `videoOutputsReady({ videoUrl })`).
  data: {
    prompt: VIDEO_PROMPT_EN,
    modelId: "seedance-2.0-mini",
    aspectRatio: "9:16",
    mediaAspect: SHOWCASE_VIDEO_ASPECT,
    duration: 4,
    soundOn: true,
    videoResolution: "720p",
    videoUrl: SHOWCASE_VIDEO_URL,
  },
});

const publishEdge = (source, target, kind) => ({
  // 제품 makeAddYoutubeNode · makeAddInstagramNode(index.tsx:6931–6941 · 7009–7019)의 id · 핸들 · 톤
  id: `edge-${source}-${target}-${kind}`,
  source,
  sourceHandle: `${kind}-out`,
  target,
  targetHandle: `${kind}-in`,
  data: { tone: kind },
});

const textEdge = (source, target) => ({
  id: `edge-${source}-${target}-text`,
  source,
  sourceHandle: "out",
  target,
  targetHandle: "text",
  data: { tone: "text" }, // edgeTone.ts:28
});

const GLOBAL_STATE = {
  prompt: "",
  videoModelId: "seedance-2.0-mini",
  videoAspectRatio: "9:16",
  videoDuration: 8,
  videoSound: true,
  videoResolution: "1080p",
};

/** 텍스트(LLM) 노드는 결과 · 입력을 문서의 textNodeState 에도 적어야 캔버스가 그 칸을 채운다(nodeShowcase.ts showcaseDocument). */
function canvasDocument(nodes, edges = []) {
  const textNodeState = { texts: {}, inputTexts: {}, assistModels: {}, assistReasoning: {} };
  for (const node of nodes) {
    if (node.type !== "text") continue;
    if (typeof node.data.generatedText === "string" && node.data.generatedText) textNodeState.texts[node.id] = node.data.generatedText;
    if (typeof node.data.text === "string") textNodeState.inputTexts[node.id] = node.data.text;
    textNodeState.assistModels[node.id] = SHOWCASE_ASSIST_MODEL;
    textNodeState.assistReasoning[node.id] = "minimal";
  }
  return { version: 2, globalState: GLOBAL_STATE, textNodeState, nodes, edges };
}

// ── 문서 일곱 ───────────────────────────────────────────────────────────────────────────────────────

/** nodes.publish(+ 날짜 · 시각 팝오버): 영상 → 유튜브(예약, 업로드 전) · 인스타그램(연결 전). */
export const PUBLISH_DOCUMENT = canvasDocument(
  [
    videoNode("nc-publish-video", 0),
    {
      id: "nc-publish-youtube",
      type: "youtube",
      position: { x: 560, y: 0 },
      // nodeShowcase.ts youtubeNode(:411–435). 예약 날짜는 쇼케이스처럼 「내일」 — 레시피 clock(2026-01-15) 의 다음 날.
      data: {
        title: YOUTUBE_TITLE_EN,
        description: YOUTUBE_DESCRIPTION_EN,
        tags: YOUTUBE_TAGS_EN,
        originVideoNodeId: "nc-publish-video",
        isScheduled: true,
        scheduleDate: "2026-01-16",
        scheduleTime: "19:00",
      },
    },
    {
      id: "nc-publish-instagram",
      type: "instagram",
      position: { x: 1120, y: 0 },
      data: { originVideoNodeId: "nc-publish-video" },
    },
  ],
  [publishEdge("nc-publish-video", "nc-publish-youtube", "youtube"), publishEdge("nc-publish-video", "nc-publish-instagram", "instagram")],
);

/** analysis: 영상 → 업로드를 마친 유튜브 노드(분석 단추가 선다, YoutubeNode.tsx:1579–1616). 채널은 지금 연결된 계정과 같아야 한다. */
export const ANALYSIS_DOCUMENT = canvasDocument(
  [
    videoNode("nc-analysis-video", 0),
    {
      id: "nc-analysis-youtube",
      type: "youtube",
      position: { x: 560, y: 0 },
      data: {
        title: YOUTUBE_TITLE_EN,
        description: YOUTUBE_DESCRIPTION_EN,
        tags: YOUTUBE_TAGS_EN,
        originVideoNodeId: "nc-analysis-video",
        youtubeVideoId: NODECANVAS_STATE_CONTENT.youtubeVideoId,
        youtubeUploadedAt: CREATED_AT,
        youtubeChannelId: DEMO_CHANNEL_ID,
        youtubeChannelTitle: DEMO_CHANNEL_TITLE,
        youtubePublishedUrl: `https://youtu.be/${NODECANVAS_STATE_CONTENT.youtubeVideoId}`,
      },
    },
  ],
  [publishEdge("nc-analysis-video", "nc-analysis-youtube", "youtube")],
);

/** nodes.audio: 대본 텍스트(LLM) → TTS, 그리고 사운드(음악). 오디오 결과 없음 = 생성 전 상태. */
export const AUDIO_DOCUMENT = canvasDocument(
  [
    {
      id: "nc-audio-script",
      type: "text",
      position: { x: 0, y: 0 },
      data: { mode: "llm", text: SCRIPT_INPUT_EN, generatedText: SCRIPT_OUTPUT_EN, assistanceModel: SHOWCASE_ASSIST_MODEL, assistanceReasoning: "minimal" },
    },
    {
      id: "nc-audio-tts",
      type: "tts",
      position: { x: 560, y: 0 },
      // nodeShowcase.ts ttsNode(:392–407) 에서 결과(blob 오디오 · 길이)만 뺐다.
      data: { provider: "google", voiceId: TTS_VOICE_ID_EN, voiceName: TTS_VOICE_NAME, text: SCRIPT_OUTPUT_EN, language: "en-US", speed: 1, volume: 1 },
    },
    {
      id: "nc-audio-bgm",
      type: "bgm",
      position: { x: 1120, y: 0 },
      // 제품 addStandaloneAudioNode(index.tsx:6448–6462)의 음악 기본값 + 자리표시 프롬프트 한 줄
      data: { provider: "elevenlabs", mode: "music", durationSec: 30, vocals: false, promptInfluence: 0.5, loop: false, volume: 1, prompt: "Placeholder music prompt." },
    },
  ],
  [textEdge("nc-audio-script", "nc-audio-tts")],
);

/** nodes.section-edit: 섹션(자식 = 빈 편집 노드) + 6줄을 넘는 프롬프트의 이미지 노드(생성 전 — 프롬프트 칸이 보이고 리사이즈 핸들이 선다). */
export const SECTION_EDIT_DOCUMENT = canvasDocument([
  {
    id: "nc-section",
    type: "section",
    position: { x: 0, y: 0 },
    // 이름은 제품 기본 이름 규칙(sectionHelpers.ts:17), 크기는 기본값(constants.ts:19–20), 색은 프리셋(SectionNode.tsx:23)
    data: { name: "Section 01", width: 880, height: 560, backgroundColor: "rgba(59, 130, 246, 0.16)" },
  },
  {
    id: "nc-section-edit",
    type: "edit",
    parentId: "nc-section",
    position: { x: 240, y: 64 },
    data: { sources: [], clips: [] }, // 제품 addNodeFromToolbarVideoEdit(index.tsx:6410–6413)
  },
  {
    id: "nc-section-image",
    type: "image",
    position: { x: 1040, y: 0 },
    // 프롬프트는 쇼케이스 텍스트 노드 결과(5문단) — 쇼케이스가 이미지 칸엔 「6줄을 넘으면 핸들이 붙어」 일부러 짧게 쓴 그 긴 글이다.
    data: { imageOrigin: "generate", model: "gpt-image-2", prompt: TEXT_OUTPUT_EN },
  },
]);

/** image-edit.*: 같은 출처 쇼케이스 이미지가 든 이미지 노드 하나. */
export const IMAGE_EDIT_DOCUMENT = canvasDocument([
  {
    id: "nc-image-edit",
    type: "image",
    position: { x: 0, y: 0 },
    data: { imageOrigin: "generate", imageUrl: SHOWCASE_IMAGE_URL, mediaAspect: SHOWCASE_IMAGE_ASPECT, model: "gpt-image-2", prompt: IMAGE_PROMPT_EN },
  },
]);

/** prompt-variants: 결과 없는 텍스트(LLM) 노드 → 빈 이미지 노드(용도 = 이미지). 생성 응답은 레시피 api 가 가로챈다. */
export const PROMPT_VARIANTS_DOCUMENT = canvasDocument(
  [
    {
      id: "nc-variants-text",
      type: "text",
      position: { x: 0, y: 0 },
      data: { mode: "llm", text: TEXT_INPUT_EN, assistanceModel: SHOWCASE_ASSIST_MODEL, assistanceReasoning: "minimal" },
    },
    {
      id: "nc-variants-image",
      type: "image",
      position: { x: 560, y: 0 },
      data: { imageOrigin: "generate", model: "gpt-image-2" },
    },
  ],
  [textEdge("nc-variants-text", "nc-variants-image")],
);

// ── 시드 늘리기 ────────────────────────────────────────────────────────────────────────────────────

function rowsOf(entry) {
  if (Array.isArray(entry)) return entry;
  return entry?.rows ?? [];
}

function fixtureUserId(baseSeeds) {
  const userId = rowsOf(baseSeeds.projects)[0]?.user_id;
  if (typeof userId !== "string" || !userId) throw new Error("[state-seeds/nodecanvas] FIXTURE_SEEDS.projects 에 user_id 가 없습니다");
  return userId;
}

/**
 * 기준 시드에 프로젝트 한 행(+ 문서가 있으면 캔버스 세션 한 행)을 붙인 시드 전체를 돌려준다. 다른 표는 그대로다.
 * `document` 가 null 이면 세션 행을 넣지 않는다 — 제품은 세션이 없으면 빈 캔버스로 연다(fixture-seeds.mjs 노드캔버스 주석).
 */
function withCanvasProject(baseSeeds, { projectId, name, document }) {
  const userId = fixtureUserId(baseSeeds);
  const projectsEntry = baseSeeds.projects;
  const projectRow = {
    id: projectId, user_id: userId, name, status: "draft", node_canvas_thumbnail_url: null,
    created_at: CREATED_AT, updated_at: CREATED_AT,
  };
  const projects = Array.isArray(projectsEntry)
    ? [...projectsEntry, projectRow]
    : { ...projectsEntry, rows: [...rowsOf(projectsEntry), projectRow] };
  const next = { ...baseSeeds, projects };
  if (document) {
    const sessionId = projectId.replace(/0c01(\d\d)$/, "0c51$1");
    next.canvas_sessions = [
      ...rowsOf(baseSeeds.canvas_sessions),
      { id: sessionId, project_id: projectId, user_id: userId, updated_at: CREATED_AT, document },
    ];
  }
  return next;
}

export const publishCanvas = (baseSeeds) =>
  withCanvasProject(baseSeeds, { projectId: NODECANVAS_STATE_PROJECTS.publish, name: "Placeholder publish project", document: PUBLISH_DOCUMENT });
export const analysisCanvas = (baseSeeds) =>
  withCanvasProject(baseSeeds, { projectId: NODECANVAS_STATE_PROJECTS.analysis, name: "Placeholder analysis project", document: ANALYSIS_DOCUMENT });
export const audioCanvas = (baseSeeds) =>
  withCanvasProject(baseSeeds, { projectId: NODECANVAS_STATE_PROJECTS.audio, name: "Placeholder audio project", document: AUDIO_DOCUMENT });
export const sectionEditCanvas = (baseSeeds) =>
  withCanvasProject(baseSeeds, { projectId: NODECANVAS_STATE_PROJECTS.sectionEdit, name: "Placeholder section project", document: SECTION_EDIT_DOCUMENT });
export const imageEditCanvas = (baseSeeds) =>
  withCanvasProject(baseSeeds, { projectId: NODECANVAS_STATE_PROJECTS.imageEdit, name: "Placeholder image project", document: IMAGE_EDIT_DOCUMENT });
export const promptVariantsCanvas = (baseSeeds) =>
  withCanvasProject(baseSeeds, { projectId: NODECANVAS_STATE_PROJECTS.promptVariants, name: "Placeholder prompt project", document: PROMPT_VARIANTS_DOCUMENT });
/** empty: 문서가 아직 없는 새 프로젝트(첫 진입) — 노드 0개라 빈 캔버스 시작 안내가 선다. */
export const emptyCanvas = (baseSeeds) =>
  withCanvasProject(baseSeeds, { projectId: NODECANVAS_STATE_PROJECTS.empty, name: "Placeholder empty project", document: null });
