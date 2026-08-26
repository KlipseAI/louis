/**
 * **LOUIS에 이미 있는 텍스트 스타일 색인 (2026-08-26 실측).**
 *
 * 새 스타일을 만들지 않는다. 측정된 타이포를 **이미 있는 스타일 이름**으로 바꿔 spec에 싣고,
 * 렌더러는 그 이름으로 스타일을 찾아 건다. 이름이 안 맞으면 렌더러가 적용 시점에 던진다.
 *
 * ## 왜 이름으로 싣는가
 * 숫자 6개(size·weight·lineHeight·letterSpacing·color·align)를 노드마다 싣는 것보다 이름 하나가
 * 짧고, 무엇보다 **디자인 시스템의 스타일을 실제로 쓰게 된다**. 스타일을 고치면 24화면에 전파된다.
 *
 * ## 매칭은 측정값이 스타일과 정확히 같을 때만
 * 측정 lineHeight는 px이고 LOUIS 스타일은 %다 — `size × percent/100` 으로 px로 환산해 비교한다.
 * 실측 확인: `typography/body-sm-regular`(14 · 150% · -0.14px) → 21px / -0.14px 이고,
 * 제품의 14px 본문이 정확히 lineHeight 21px · letterSpacing -0.14px 이다.
 *
 * `typography/*` 를 `type/*` 보다 먼저 고른다 — letterSpacing이 px로 적혀 있어 측정값과 문자 그대로 같다.
 * (`type/*` 의 `-1%` 는 같은 값으로 렌더되지만 환산을 거쳐야 한다.)
 */

/** 각 항목: [스타일 이름, fontSize, Figma 폰트 스타일, lineHeight(px), letterSpacing(px)] */
const STYLE_TABLE = Object.freeze([
  // typography/* — letterSpacing이 px. 측정값과 문자 그대로 같아 최우선.
  ["typography/caption-regular", 12, "Regular", 18, -0.12],
  ["typography/caption-medium", 12, "Medium", 18, -0.12],
  ["typography/caption-semibold", 12, "SemiBold", 18, -0.12],
  ["typography/body-sm-regular", 14, "Regular", 21, -0.14],
  ["typography/body-sm-medium", 14, "Medium", 21, -0.14],
  ["typography/body-sm-semibold", 14, "SemiBold", 21, -0.14],
  ["typography/body-md-regular", 16, "Regular", 24, -0.16],
  ["typography/body-md-medium", 16, "Medium", 24, -0.16],
  ["typography/body-md-semibold", 16, "SemiBold", 24, -0.16],
  ["typography/body-lg-regular", 20, "Regular", 30, -0.2],
  ["typography/body-lg-medium", 20, "Medium", 30, -0.2],
  ["typography/body-lg-semibold", 20, "SemiBold", 30, -0.2],
  ["typography/heading-sm-medium", 28, "Medium", 37.8, -0.56],
  ["typography/heading-md-medium", 36, "Medium", 48.6, -0.72],
  ["typography/heading-lg-medium", 48, "Medium", 64.8, -0.96],
  // type/* — 위에서 못 잡는 조합만 받는다(예: heading 28의 regular/semibold).
  ["type/heading-28/regular", 28, "Regular", 37.8, -0.56],
  ["type/heading-28/semibold", 28, "SemiBold", 37.8, -0.56],
  ["type/heading-36/regular", 36, "Regular", 48.6, -0.72],
  ["type/heading-36/semibold", 36, "SemiBold", 48.6, -0.72],
  ["type/heading-48/regular", 48, "Regular", 64.8, -0.96],
  ["type/heading-48/semibold", 48, "SemiBold", 64.8, -0.96],
]);

/** CSS font-weight → Figma 폰트 스타일. 제품이 실제로 쓰는 값은 400·500·600 셋뿐이다(실측). */
const WEIGHT_TO_STYLE = Object.freeze({ 400: "Regular", 500: "Medium", 600: "SemiBold", 700: "Bold" });

/** 렌더러가 미리 로드해야 하는 (family, style) 쌍. 폰트가 안 로드되면 텍스트 쓰기가 던진다. */
export const FONT_PAIRS = Object.freeze(
  [...new Set(STYLE_TABLE.map(([, , style]) => style))].map((style) => ({ family: "Pretendard", style })),
);

export const TEXT_STYLE_NAMES = Object.freeze(STYLE_TABLE.map(([name]) => name));

const near = (a, b) => Math.abs(a - b) <= 0.02;

/**
 * 측정 타이포 → LOUIS 텍스트 스타일 이름. 정확히 맞는 게 없으면 null.
 * `lineHeight`가 없으면(=normal) 스타일을 고르지 않는다 — 짐작해서 붙이면 제품과 달라진다.
 */
export function matchTextStyle({ size, weight, lineHeight, letterSpacing }) {
  if (size == null || lineHeight == null) return null;
  const wanted = WEIGHT_TO_STYLE[weight];
  if (!wanted) return null;
  const hit = STYLE_TABLE.find(([, styleSize, styleName, styleLine, styleTracking]) =>
    styleSize === size
    && styleName === wanted
    && near(styleLine, lineHeight)
    && near(styleTracking, letterSpacing ?? 0));
  return hit ? hit[0] : null;
}
