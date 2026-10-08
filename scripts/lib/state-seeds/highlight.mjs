/**
 * **상태 레시피 「highlight」 영역의 Supabase 시드(2026-10-08).**
 *
 * 레시피 `migration/measure-states/highlight.json` 의 `supabase.module` 이 이 파일의 export 를 가리킨다. 계약(설계서 1-3
 * `supabase.module`): export 는 측정기의 `FIXTURE_SEEDS` 를 받아 **늘린 시드 전체**를 돌려준다 — 바꾸지 않은 표는 받은 그대로
 * 두므로, 오버레이를 「표 통째 교체」로 읽든 「전체 시드 교체」로 읽든 같은 결과다. `fixture-seeds.mjs` 는 고치지 않는다(설계서 3절
 * 「시드 상수」 — FIXTURE_SEEDS 에 행을 더하면 세션 원장의 seededTables 와 허브의 빈 상태가 바뀐다).
 *
 * **지어낸 것은 내용(이름 · 글자)뿐이다.** 크기 · 색 · 간격은 측정값이고, 템플릿의 스타일 칸은 제품이 직접 쓴 값을 옮긴다:
 *   · 템플릿 칸의 기본값 = 제품 어드민 「새 템플릿」 폼의 초기값(`apps/web/app/admin/CaptionTemplateManagement.tsx` 276 EMPTY_POSITIONS,
 *     545–554 resetForm). 빈 문자열 색은 DB 꼴인 null 로 적는다(`captionTemplateStyle.ts:79` 가 "" 와 null 을 같이 「없음」으로 본다).
 *   · 기본 템플릿의 제목 배경색 하나만 켠다 — 값은 색 패널이 배경을 켤 때 쓰는 제품 기본값 `#000000`(`CaptionColorPanel.tsx:38`).
 *     그래야 스와치 두 상태(값 있음 30×30 color input + ✕ / 값 없음 점선 +)와 배경 여백 슬라이더 줄(132)이 함께 선다.
 *   · 템플릿 이름 `bold-bg` · `clean` 은 제품 레이아웃 추천표의 키다(`captionLayoutPresets.ts` 231–232) — 추천 배지(「Suggested」)가 선다.
 *     보이는 이름(label_en · label_ko)은 제품에 데모 값이 없어 짧은 자리표시다.
 *   · 오버레이는 제품 `buildOverlaysFromTemplate`(shorts page.tsx 517–585)가 템플릿에서 만드는 꼴을 그대로 따른다 — 위치는
 *     positions["9:16"], 높이 0.1, 제목 rowIndex 4 · 부제목 5 · 자막 3, 스타일은 `captionTemplateOverlayStyle`(captionTemplateStyle.ts 55–93).
 *     자막이 있어야 색 패널의 세 줄(제목 · 부제목 · 자막, CaptionColorPanel.tsx 27–31)이 다 서는데, 자동 적용은 자막을 만들지 않으므로
 *     (page.tsx 925 `captions: []`) 세 오버레이를 editor_state 에 미리 넣는다 — 있으면 자동 적용은 건드리지 않는다(page.tsx 915).
 *   · 소스 · 클립은 편집기 시드(`fixture-seeds.mjs` editorSource)와 같은 꼴 — 영상 주소는 바깥 절대 URL(측정기가 끊어 검은 면),
 *     썸네일은 1×1 PNG data URL(디코더 추출을 건너뛴다). 길이 15초 = 하이라이트 완료 시드의 클립 길이(duration_seconds 15).
 */

const ONE_PIXEL_PNG = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mN8+P9/PQAJYwN4d1E2KAAAAABJRU5ErkJggg==";
const FIXED_AT = "2026-01-03T00:00:00.000Z";

// 제품 어드민 「새 템플릿」 폼의 초기값(CaptionTemplateManagement.tsx 276 · 545–554). 색 "" → null.
const ADMIN_DEFAULT_POSITIONS = {
  "9:16": { title_y: 0.08, caption_y: 0.88, title_x: 0.075, title_width: 0.85, caption_x: 0.075, caption_width: 0.85, subtitle_y: 0.14, subtitle_x: 0.075, subtitle_width: 0.85, wm_x: 0.35, wm_y: 0.93, wm_width: 0.3 },
  "16:9": { title_y: 0.08, caption_y: 0.88, title_x: 0.075, title_width: 0.85, caption_x: 0.075, caption_width: 0.85, subtitle_y: 0.14, subtitle_x: 0.075, subtitle_width: 0.85, wm_x: 0.35, wm_y: 0.93, wm_width: 0.3 },
  "1:1": { title_y: 0.15, caption_y: 0.78, title_x: 0.075, title_width: 0.85, caption_x: 0.075, caption_width: 0.85, subtitle_y: 0.22, subtitle_x: 0.075, subtitle_width: 0.85, wm_x: 0.35, wm_y: 0.93, wm_width: 0.3 },
};
const adminDefaultTemplate = () => ({
  positions: ADMIN_DEFAULT_POSITIONS,
  title_font_family: "Pretendard", title_font_size: 36, title_font_weight: "bold",
  title_font_color: "#fafafa", title_bg_color: null, title_bg_radius: 0, title_bg_padding: 8,
  caption_font_family: "Pretendard", caption_font_size: 32, caption_font_weight: "regular",
  caption_font_color: "#fafafa", caption_bg_color: null, caption_bg_radius: 0, caption_bg_padding: 8,
  subtitle_font_family: "Pretendard", subtitle_font_size: 34, subtitle_font_weight: "regular",
  subtitle_font_color: "#fafafa", subtitle_bg_color: null, subtitle_bg_radius: 0, subtitle_bg_padding: 0,
  subtitle_border_color: null, subtitle_border_width: 0,
  title_border_color: null, title_border_width: 0, caption_border_color: null, caption_border_width: 0,
  text_stroke_color: null, text_stroke_width: 0, text_align: "center",
  max_chars_per_line: 12, fade_duration: 0.15, letterbox_color: "#000000", lang_mode: "ko",
  watermark_url: null, watermark_opacity: 1, watermark_enabled: false,
  watermark2_url: null, watermark2_opacity: 1, watermark2_enabled: false,
  source_crop: null, preview_url: null,
});

/** 자막 템플릿 두 행 — 기본(`bold-bg`, 제목 배경 켬)과 `clean`(어드민 초기값 그대로). */
export const HIGHLIGHT_CAPTION_TEMPLATES = Object.freeze([
  {
    ...adminDefaultTemplate(),
    id: "00000000-0000-4000-8000-0000000ca701",
    name: "bold-bg",
    label_ko: "자리표시 템플릿 A",
    label_en: "Placeholder template A",
    is_default: true,
    title_bg_color: "#000000",
    created_at: FIXED_AT,
  },
  {
    ...adminDefaultTemplate(),
    id: "00000000-0000-4000-8000-0000000ca702",
    name: "clean",
    label_ko: "자리표시 템플릿 B",
    label_en: "Placeholder template B",
    is_default: false,
    created_at: FIXED_AT,
  },
]);

// captionTemplateStyle.ts 42–93 을 옮긴 것 — 오버레이 스타일은 제품이 템플릿에서 만드는 값과 같아야 한다.
const FONT_WEIGHT = { bold: 700, medium: 500, light: 300, regular: 400 };
function overlayStyle(t, element, widthFrac) {
  const pick = (ti, su, ca) => (element === "title" ? ti : element === "subtitle" ? su : ca);
  const fade = element === "caption" ? t.fade_duration : 0;
  return {
    fontSize: pick(t.title_font_size, t.subtitle_font_size, t.caption_font_size),
    fontColor: pick(t.title_font_color, t.subtitle_font_color, t.caption_font_color),
    fontFamily: pick(t.title_font_family, t.subtitle_font_family, t.caption_font_family),
    fontWeight: FONT_WEIGHT[pick(t.title_font_weight, t.subtitle_font_weight, t.caption_font_weight)] ?? 400,
    backgroundColor: pick(t.title_bg_color, t.subtitle_bg_color, t.caption_bg_color) || undefined,
    backgroundRadius: pick(t.title_bg_radius, t.subtitle_bg_radius, t.caption_bg_radius),
    backgroundPadding: pick(t.title_bg_padding, t.subtitle_bg_padding, t.caption_bg_padding),
    borderColor: pick(t.title_border_color, t.subtitle_border_color, t.caption_border_color) || undefined,
    borderWidth: pick(t.title_border_width, t.subtitle_border_width, t.caption_border_width),
    strokeColor: t.text_stroke_color || undefined,
    strokeWidth: t.text_stroke_width,
    maxCharsPerLine: t.max_chars_per_line,
    textAlign: t.text_align,
    fadeIn: fade,
    fadeOut: fade,
    wrapMaxWidth: widthFrac,
  };
}
// JSON 으로 저장되는 행이라 undefined 칸은 뺀다(DB 를 거친 editor_state 에는 없는 키다).
const dropUndefined = (value) => JSON.parse(JSON.stringify(value));

// shorts page.tsx 517–585 buildOverlaysFromTemplate 의 꼴(aspect 9:16, totalSec 15, 자막 한 줄).
function overlaysFromTemplate(tpl, { titleKo, titleEn, caption }, totalSec) {
  const pos = tpl.positions["9:16"];
  const row = (id, content, element, rowIndex, y, x, w) => ({
    id, type: "text", content, startSec: 0, endSec: totalSec,
    x: x ?? (1 - w) / 2, y, width: w, height: 0.1,
    style: overlayStyle(tpl, element, w), rowIndex,
  });
  return dropUndefined([
    row("tpl-title-fixture", titleKo, "title", 4, pos.title_y, pos.title_x, pos.title_width ?? 0.85),
    row("tpl-subtitle-fixture", titleEn, "subtitle", 5, pos.subtitle_y, pos.subtitle_x, pos.subtitle_width ?? 0.85),
    row("tpl-cap-0-fixture", caption, "caption", 3, pos.caption_y, pos.caption_x, pos.caption_width ?? 0.85),
  ]);
}

/**
 * `/highlight/[projectId]/shorts/[shortId] edit.templates` — 쇼츠 한 행에 편집 상태(소스 하나 · 클립 하나 · 오버레이 셋)를 넣고
 * 자막 템플릿 두 행을 더한다. 쇼츠 행은 기존 시드 행(같은 id · 같은 result_url)에 editor_state 만 바꿔 끼운다 — 결과 보기에서
 * 「Re-edit」 을 눌러야 편집기가 열린다(page.tsx 1128 `setModalOpen(!json.data.result_url)`).
 *
 * @param {Record<string, unknown>} FIXTURE_SEEDS 측정기의 세션 시드(`fixture-seeds.mjs`)
 */
export function editTemplatesSeeds(FIXTURE_SEEDS) {
  const baseShorts = FIXTURE_SEEDS.highlight_shorts;
  const baseRow = baseShorts?.rows?.[0];
  if (!baseRow) throw new Error("[state-seeds/highlight] FIXTURE_SEEDS.highlight_shorts 에 행이 없습니다 — 기준 화면 시드가 바뀌었습니다");
  const defaultTemplate = HIGHLIGHT_CAPTION_TEMPLATES.find((tpl) => tpl.is_default);
  const totalSec = 15;
  const fps = 30;
  const editorState = {
    aspectRatio: "9:16",
    fitMode: "fit",
    layoutId: "standard",
    sources: [{
      nodeId: "hs-fixture-src", origin: "import", name: "Placeholder clip", url: "https://fixture.invalid/hs-fixture-src.mp4",
      fps, totalFrames: totalSec * fps, durationSec: totalSec, width: 1920, height: 1080, thumbnails: [ONE_PIXEL_PNG],
    }],
    clips: [{ id: "clip-1", sourceVideoNodeId: "hs-fixture-src", startFrame: 0, endFrame: totalSec * fps }],
    sourceRegions: [],
    overlays: overlaysFromTemplate(defaultTemplate, {
      titleKo: baseRow.caption_ko,
      titleEn: baseRow.caption_en,
      caption: "Placeholder caption line",
    }, totalSec),
    transitions: [],
  };
  return {
    ...FIXTURE_SEEDS,
    highlight_shorts: { ...baseShorts, rows: [{ ...baseRow, editor_state: editorState }] },
    caption_templates: HIGHLIGHT_CAPTION_TEMPLATES.map((tpl) => ({ ...tpl })),
  };
}
