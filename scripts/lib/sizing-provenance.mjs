// **"왜 그 크기인가"를 되살린다.** 측정된 픽셀이 아니라 *선언된 의도*를 복원해
// Figma Auto Layout(FILL / HUG / FIXED / ABSOLUTE)으로 옮기기 위한 판정 계층이다.
//
// ## 왜 필요한가
//
// `getComputedStyle`은 **해결된(used) 값**을 준다. `width:100%`와 `width:1920px`가 둘 다 `"1920px"`로
// 보이므로, 측정 단계에서 이미 의도가 소실된다. 픽셀만 Figma에 박으면 프레임을 리사이즈했을 때 제품처럼
// 반응하지 않는다 — 실제로 highlight project 프레임의 메인 카드가 `1852`로 굳어 1920 프레임을 212px
// 넘쳤던 사고가 이것이다(정답은 고정폭이 아니라 `ml=사이드바폭 + mr=12`라는 **관계**였다).
//
// ## 어떻게 되살리는가 — 브라우저에게 직접 묻는다
//
// Tailwind를 재구현하거나 캐스케이드를 오프라인 재구성하지 않는다. 둘 다 틀리기 쉽다(유틸리티 정렬 순서,
// `@layer`, 미디어/자손 셀렉터, `--spacing` 같은 테마 변수까지 흉내내야 한다). 대신 **CDP
// `CSS.getMatchedStylesForNode`** 로 그 노드에 실제로 매칭된 규칙과 인라인 선언을 캐스케이드 순서대로
// 받는다. 검증 결과 이 경로는 `width:50%`를 **`"50%"` 원본 그대로** 돌려준다.
//
// ## 판정에 쓰는 신호 (우선순위)
//
// 1. **선언된 width/height** (CDP): `%`·`auto`·`px`·`calc()`·`var()`·`fit-content` 등 원문
// 2. **flex 축**: `flexGrow`/`flexBasis`는 computed에서도 해결되지 않아 그대로 살아남는다
// 3. **CSS 기본 규칙**: 선언이 없는 block 요소는 `width:auto` = **inline축을 채운다**(FILL).
//    `/pricing` 883노드 중 flexGrow가 0이 아닌 노드는 **하나도 없고** 46%가 부모 폭과 정확히 일치한다 —
//    이들은 "선언 누락"이 아니라 **CSS 기본 동작**이며 규칙으로 처리해야 한다.
// 4. **min/max**: computed에서도 `%`가 살아남는 축이라 그대로 Figma min/max로 옮긴다.
//
// 판정 불가는 **조용히 기본값으로 떨어뜨리지 않고** `UNRESOLVED`로 표시한다. 그 수가 게이트다.
//
// ## 실측 성적 (`/pricing` 883노드 × 2 뷰포트)
//
// | | desktop | mobile |
// |---|---|---|
// | 기본 규칙만 (선언값 없이) | 92.8% · UNRESOLVED 2 | 94.7% · UNRESOLVED 2 |
// | **+ CDP 선언값 + justify-self 규칙** | **97.6%** · UNRESOLVED **0** | **97.0%** · UNRESOLVED **0** |
//
// 잔여 오판(desktop 6 · mobile 8)은 실제 오판이 아니다: 대부분 `w=323.5 vs 기대 325`처럼 **테두리 1.5px**
// 차이이고, `w=640 vs 370` 하나는 가로 스크롤 컨테이너다.
//
// 검증 방법 주의: FILL은 `max-width`에 잘리므로 기대값에 max를 반영해야 하고(안 하면 `main.2.0.0`
// `width:100%`+`max-width:1300px`가 오판으로 잡힌다), grid 아이템은 부모 폭이 아니라 트랙 폭을 따르므로
// 부모-폭 대조에서 제외한다. 폭 0인 노드(접힌 모바일 메뉴)는 렌더 대상이 아니다.

/** Figma 축 판정값. */
export const AXIS = Object.freeze({
  FILL: "FILL",         // 부모가 크기를 결정 → layoutSizing*="FILL" / layoutGrow=1
  HUG: "HUG",           // 콘텐츠가 결정 → primary/counterAxisSizingMode="AUTO"
  FIXED: "FIXED",       // 진짜 고정값 → resize()
  UNRESOLVED: "UNRESOLVED", // 판정 실패. 조용히 넘기지 않는다.
});

/** 뷰포트 단위 상수 (owner 확정): 100vh = desktop 1080 / mobile 874. */
export const VIEWPORT = Object.freeze({
  "desktop-1920x1080": { width: 1920, height: 1080 },
  "mobile-402x874": { width: 402, height: 874 },
});

const LENGTH = /^(-?[\d.]+)px$/;
const PERCENT = /^(-?[\d.]+)%$/;

/** `"12px"` → 12. 아니면 null. */
export function px(value) {
  const match = LENGTH.exec(String(value ?? "").trim());
  return match ? Number(match[1]) : null;
}

/** `"100%"` → 100. 아니면 null. */
export function percent(value) {
  const match = PERCENT.exec(String(value ?? "").trim());
  return match ? Number(match[1]) : null;
}

/**
 * vh/vw/dvh/svh/lvh 를 뷰포트 상수로 치환한다. owner 규칙: 100vh = 1080/874, 100vw = 1920/402.
 * `calc()` 안에 있어도 치환되며, 원문은 호출자가 근거로 남긴다.
 */
export function substituteViewportUnits(declaration, contextId) {
  const vp = VIEWPORT[contextId];
  if (!vp || typeof declaration !== "string") return declaration;
  return declaration.replace(/(-?[\d.]+)(dvh|svh|lvh|vh|dvw|svw|lvw|vw)\b/g, (_, n, unit) => {
    const base = unit.endsWith("h") ? vp.height : vp.width;
    return `${(Number(n) / 100) * base}px`;
  });
}

/**
 * 한 축(가로/세로)의 판정.
 *
 * @param {object} input
 * @param {string|null} input.declared     CDP가 준 **선언된** width/height 원문 (`"100%"`, `"auto"`, `"320px"`, `calc(...)`)
 * @param {object} input.computed          computed style 객체 (해결된 값)
 * @param {"horizontal"|"vertical"} input.axis
 * @param {object|null} input.parentComputed 부모의 computed style (기본 동작 판정용)
 * @param {boolean} input.isReplaced       img/svg/video 등 치환 요소인가
 * @returns {{verdict:string, reason:string, source:string|null, value:number|null}}
 */
/** 괄호 깊이를 세며 최상위 콤마로만 자른다 — `min(520px, calc(100% - 8px))` 같은 중첩 대응. */
function splitTopLevel(input) {
  const parts = [];
  let depth = 0;
  let current = "";
  for (const char of input) {
    if (char === "(") depth += 1;
    if (char === ")") depth -= 1;
    if (char === "," && depth === 0) { parts.push(current.trim()); current = ""; continue; }
    current += char;
  }
  if (current.trim()) parts.push(current.trim());
  return parts;
}

/** 바깥 display가 block-level인 집합. `flex`·`grid`도 바깥은 block이다(안쪽만 flex/grid). */
const BLOCK_LEVEL = /^(block|flow-root|list-item|table|flex|grid)$/;

export function decideAxis({ declared: rawDeclared, computed, axis, parentComputed = null, isReplaced = false, gridTrack = null, selfAlign = null }) {
  const horizontal = axis === "horizontal";
  const position = computed?.position;
  // CDP는 `!important`를 값에 붙여 준다(`"50px !important"`). 우선순위는 collectDeclaredStyles가 이미
  // 처리했으므로 여기서는 떼어내고 값만 본다 — 안 떼면 전부 UNRESOLVED로 샌다.
  const declared = typeof rawDeclared === "string"
    ? rawDeclared.replace(/\s*!\s*important\s*$/i, "").trim()
    : rawDeclared;

  // 0. 절대 배치는 축 판정이 아니라 배치 문제다. 호출자가 ABSOLUTE로 처리한다.
  if (position === "absolute" || position === "fixed") {
    return { verdict: AXIS.FIXED, reason: `position:${position} — 절대 배치이므로 축이 아니라 좌표/제약으로 다룬다`, source: `position:${position}`, value: null };
  }

  const parentDisplay = parentComputed?.display ?? "";
  const inFlexRow = /flex/.test(parentDisplay) && (parentComputed?.flexDirection ?? "row").startsWith("row");
  const inFlexColumn = /flex/.test(parentDisplay) && (parentComputed?.flexDirection ?? "").startsWith("column");
  const mainAxisOfParent = horizontal ? inFlexRow : inFlexColumn;

  // 1. flex 주축: grow/basis 가 해결되지 않고 살아남는 유일한 신호다.
  if (mainAxisOfParent) {
    const grow = Number(computed?.flexGrow ?? 0);
    const basis = computed?.flexBasis;
    if (grow > 0) {
      return { verdict: AXIS.FILL, reason: `부모가 flex이고 flex-grow:${grow} — 남는 공간을 채운다`, source: `flex-grow:${grow}`, value: null };
    }
    if (basis && basis !== "auto" && percent(basis) === 100) {
      return { verdict: AXIS.FILL, reason: "flex-basis:100% — 부모 주축을 채운다", source: `flex-basis:${basis}`, value: null };
    }
    // **basis 가 주축 크기를 정한다(2026-09-30).** grow 0 이고 크기 선언이 없어도 basis 가 auto · content · 0 이 아니면 그 자리의 크기는
    // basis 다(수축이 없으면). 부모 비례 basis(`calc(50% - 32px)`)는 Figma 에 대응이 없어 그 뷰포트에서 푼 크기(측정)로 둔다 — HUG 로 두자
    // 글자 폭으로 줄어, 공개 페이지 모바일 푸터의 링크 묶음(basis 153 · 두 열로 감김)이 한 줄에 셋 섰다.
    const basisSet = basis && !/^(auto|content|0(px|%)?)$/.test(String(basis).trim());
    if (grow === 0 && (declared === "auto" || declared == null) && basisSet) {
      return { verdict: AXIS.FIXED, reason: `flex-basis:${basis} · grow 0 — basis 가 주축 크기다(부모 비례면 그 뷰포트에서 푼 측정 크기)`, source: `flex-basis:${basis}`, value: px(basis) };
    }
    if (grow === 0 && (declared === "auto" || declared == null)) {
      return { verdict: AXIS.HUG, reason: "부모가 flex, grow:0, 크기 선언 없음 — 콘텐츠가 결정한다", source: "flex-grow:0 · width:auto", value: null };
    }
  }

  // 2. 선언된 값이 있으면 그것이 정답이다 (CDP가 준 원문).
  if (declared != null && declared !== "") {
    const pct = percent(declared);
    if (pct === 100) {
      return { verdict: AXIS.FILL, reason: `${axis} 100% 선언 — 부모를 채운다`, source: `${horizontal ? "width" : "height"}:${declared}`, value: null };
    }
    if (pct != null) {
      // 100%가 아닌 퍼센트는 Figma에 대응이 없다. FILL로 두면 과대, FIXED로 두면 반응성을 잃는다.
      return { verdict: AXIS.UNRESOLVED, reason: `${pct}% 선언 — Figma에 부분 퍼센트 대응이 없다`, source: `${horizontal ? "width" : "height"}:${declared}`, value: null };
    }
    if (/^fit-content|^min-content|^max-content|^auto$/.test(declared)) {
      if (declared === "auto") {
        // block-level 요소의 auto는 inline축을 채우는 것이 CSS 기본이다.
        // **`display:flex`·`grid`도 block-level이다** — 바깥 display가 block이고 안쪽만 flex/grid다.
        // 안쪽 display로만 판정하면 flex 컨테이너가 HUG로 떨어진다. 실측 사고:
        // `/mypage/topup/fail`의 `main`은 `display:flex`+`width:auto`인데 HUG로 판정돼
        // Figma에서 1628이 아니라 콘텐츠 폭 520으로 줄었다. 진짜 inline-level은 `inline-flex`다.
        if (horizontal && BLOCK_LEVEL.test(computed?.display ?? "") && !isReplaced) {
          return { verdict: AXIS.FILL, reason: "block-level + width:auto — CSS 기본으로 inline축을 채운다", source: "width:auto (기본)", value: null };
        }
        return { verdict: AXIS.HUG, reason: `${axis} auto — 콘텐츠가 결정한다`, source: `${horizontal ? "width" : "height"}:auto`, value: null };
      }
      return { verdict: AXIS.HUG, reason: `${declared} — 콘텐츠가 결정한다`, source: `${horizontal ? "width" : "height"}:${declared}`, value: null };
    }
    const fixed = px(declared);
    // **고정 폭 + `max-width: 100%` 는 FILL + maxWidth 다(2026-10-08, 조립 규칙 15조의 6).** 「그 폭이되 포함 블록보다 넓어지지 않는다」 —
    // 부모가 넓으면 그 폭, 좁으면 부모 폭이다. Figma 의 FILL + maxWidth(그 폭)가 같은 뜻이다. FIXED 로 굳히면 팔레트 대화 상자
    // (`w-[560px] max-w-full`)가 모바일 360 에서 부모를 9.5 넘쳤다. 다만 FILL 은 포함 블록이 아니라 Figma 부모의 남는 자리를 채우므로,
    // 측정 폭에서 결과 폭이 측정값과 같은지(parity)는 부모 · 형제를 아는 호출자(`figma-tree-spec` convert)가 확인하고 어긋나면 FIXED 로 되돌린다.
    if (fixed != null && horizontal && percent(computed?.maxWidth) === 100) {
      return { verdict: AXIS.FILL, reason: `${declared} + max-width:100% — 부모를 채우되 ${fixed} 를 넘지 않는다`, source: `width:${declared} · max-width:100%`, value: fixed, limit: { max: fixed }, cappedFixed: fixed,
        fixedFallback: { verdict: AXIS.FIXED, reason: `${declared} 고정 선언`, source: `width:${declared}`, value: fixed } };
    }
    if (fixed != null) {
      return { verdict: AXIS.FIXED, reason: `${declared} 고정 선언`, source: `${horizontal ? "width" : "height"}:${declared}`, value: fixed };
    }

    // **CSS 변수는 computed가 이미 풀어 놓았다.** `var(--profile-ring-size)` 같은 선언은 그 자체로는
    // 해석할 수 없지만, 변수의 성질(고정 토큰인가 부모 비례인가)은 computed 값으로 판별된다.
    // 선언에 `%`가 섞이지 않은 순수 var/calc라면 **고정 토큰**으로 보고 computed px를 쓴다.
    // 실측 사례: `/settings`의 profile ring/avatar는 `var(--profile-ring-size)`이며 실제로 고정 크기다.
    // `calc(100% + ...)`처럼 **퍼센트가 섞인 계산식은 부모에 비례**하므로 FILL이다. 실측 사례:
    // `/settings`의 크롬 바가 `calc(100% + var(--mainchrome-bleed-left) + var(--mainchrome-bleed-right))`로
    // 부모보다 넓게 번진다(bleed). 이를 FIXED로 굳히면 리사이즈 때 따라오지 않는다.
    // **`min()`·`max()`·`clamp()`는 Figma의 max/minWidth와 정확히 대응한다.**
    // `min(520px, 100%)`는 "부모를 채우되 520을 넘지 않는다" — FILL + maxWidth 520이다.
    // FIXED 520으로 굳히면 부모가 520보다 좁아져도 안 줄어 제품과 어긋난다.
    // 실측 사례: `/mypage/topup/fail`의 상태 섹션이 `width:min(520px, 100%)`이고,
    // 해석 실패로 UNRESOLVED→FIXED가 되어 리사이즈에 반응하지 않았다.
    const clampish = /^(min|max|clamp)\(([^]*)\)$/.exec(declared.trim());
    if (clampish) {
      const [, fn, inner] = clampish;
      const parts = splitTopLevel(inner);
      const lengths = parts.map((part) => px(part)).filter((value) => value != null);
      const hasFullPercent = parts.some((part) => percent(part) === 100);
      if (hasFullPercent && lengths.length > 0) {
        const limit = fn === "max"
          ? { min: Math.max(...lengths) }
          : fn === "min"
            ? { max: Math.min(...lengths) }
            : { min: Math.min(...lengths), max: Math.max(...lengths) };
        return {
          verdict: AXIS.FILL,
          reason: `${fn}() + 100% — 부모를 채우되 ${JSON.stringify(limit)}로 묶인다`,
          source: `${horizontal ? "width" : "height"}:${declared}`,
          value: null,
          limit,
        };
      }
      if (lengths.length > 0 && !declared.includes("%")) {
        const resolved = px(horizontal ? computed?.width : computed?.height);
        if (resolved != null) {
          return { verdict: AXIS.FIXED, reason: `${fn}() 계산 결과 고정`, source: `${horizontal ? "width" : "height"}:${declared}`, value: resolved };
        }
      }
    }

    if (/^calc\(/.test(declared) && /(^|[\s(+\-*/])100%/.test(declared)) {
      return {
        verdict: AXIS.FILL,
        reason: `${declared.slice(0, 40)}… — 100% 기반 계산식이라 부모에 비례한다`,
        source: `${horizontal ? "width" : "height"}:${declared}`,
        value: null,
      };
    }

    if (/^(var\(|calc\()/.test(declared) && !declared.includes("%")) {
      const resolved = px(horizontal ? computed?.width : computed?.height);
      if (resolved != null) {
        return {
          verdict: AXIS.FIXED,
          reason: `${declared} — CSS 변수/계산식이지만 퍼센트가 없어 고정 크기로 해결됨(${resolved}px)`,
          source: `${horizontal ? "width" : "height"}:${declared}`,
          value: resolved,
        };
      }
    }
    // calc()/var() 등은 호출자가 뷰포트 치환 후 다시 넣어준다. 여기까지 왔다면 해석 실패.
    return { verdict: AXIS.UNRESOLVED, reason: `해석하지 못한 선언: ${declared}`, source: `${horizontal ? "width" : "height"}:${declared}`, value: null };
  }

  // 3. 선언이 아예 없는 경우 — CSS 기본 동작으로 판정한다.
  //    /pricing 883노드의 46%가 여기 해당하며 "누락"이 아니라 정상이다.
  const display = computed?.display ?? "";

  // **flex/grid 자식에는 block 기본 규칙이 적용되지 않는다.** 실측으로 확인: 이 규칙을 빼면
  // /pricing 오판 394건 중 390건(99%)이 여기서 나온다 — grid 부모 안의 flex 아이템(`main.1.0.0`,
  // 폭 82px)을 "block이니 부모 1888을 채운다"고 잘못 판정한다. flex/grid 아이템의 교차축 기본은
  // stretch지만 주축 기본은 콘텐츠(auto)다.
  const parentIsFlexOrGrid = /flex|grid/.test(parentDisplay);

  // grid 아이템은 **부모 폭이 아니라 자기 트랙**을 따른다. 고정 트랙(`236px`)이면 FIXED이고 `1fr`이면
  // 트랙이 남는 공간을 나눠 갖는 FILL이다. 이를 구분하지 않으면 `grid-template-columns:236px 1fr 324px`의
  // 사이드바(236)까지 FILL로 판정해 리사이즈 시 제품과 다르게 늘어난다.
  if (/grid/.test(parentDisplay) && horizontal && gridTrack != null) {
    // **`justify-self`가 stretch가 아니면 트랙을 채우지 않는다.** 실측 사례: `main.1.0.0`(a)는
    // 트랙이 `1fr`이지만 `justify-self:flex-start`라 실제 폭이 콘텐츠 크기(82px)다. 이걸 놓치면
    // 1fr 트랙의 모든 자식을 FILL로 잘못 판정한다.
    const justifySelf = selfAlign?.justifySelf ?? computed?.justifySelf ?? "auto";
    const parentJustifyItems = parentComputed?.justifyItems ?? "normal";
    const effectiveJustify = justifySelf !== "auto" ? justifySelf : parentJustifyItems;
    if (!/^(normal|stretch|auto)$/.test(effectiveJustify)) {
      return { verdict: AXIS.HUG, reason: `grid 트랙 ${gridTrack}이지만 justify-self:${effectiveJustify} — 트랙을 채우지 않는다`, source: `justify-self:${effectiveJustify}`, value: null };
    }
    const track = String(gridTrack).trim();
    // `minmax(a, Nfr)` 의 `fr` 앞은 숫자라 단어 경계(`\bfr`)가 서지 않는다 — 그 정규식이 한 번도 맞지 않아 문의 데스크톱의 두 칸
    // (`minmax(0, 0.8fr) minmax(0, 1.2fr)`)이 HUG 로 떨어져 폼이 140 폭으로 줄었다(2026-09-30, 보드 글자 자리 대조).
    if (/^(-?[\d.]+)fr$/.test(track) || /^minmax\(.*[\d.]fr\s*\)$/.test(track) || track === "auto") {
      return { verdict: AXIS.FILL, reason: `grid 트랙 ${track} — 남는 공간을 나눠 갖는다`, source: `grid-template: ${track}`, value: null };
    }
    const fixedTrack = px(track);
    if (fixedTrack != null) {
      return { verdict: AXIS.FIXED, reason: `grid 트랙 ${track} 고정`, source: `grid-template: ${track}`, value: fixedTrack };
    }
  }

  // **트랙 선언이 없는 grid 의 아이템도 칸을 채운다(2026-09-30).** `grid-template-columns` 선언이 없으면(암시적 한 열) 위 트랙 규칙이 서지
  // 않아 아래 flex 규칙으로 떨어졌고, grid 는 주축이 없어 「콘텐츠가 결정한다」(HUG)가 됐다 — 문의 모바일의 소개 `aside`(칸 370)가 HUG 로
  // 서고 안의 글자가 HUG 부모 안의 FILL 로 접혀 164 폭으로 줄이 늘었다(보드 글자 자리 대조로 찾았다). grid 아이템의 `justify-self` 기본
  // (normal)은 stretch 라 칸을 채운다.
  if (/grid/.test(parentDisplay) && horizontal && gridTrack == null && !isReplaced) {
    const justifySelf = selfAlign?.justifySelf ?? computed?.justifySelf ?? "auto";
    const parentJustifyItems = parentComputed?.justifyItems ?? "normal";
    const effectiveJustify = justifySelf !== "auto" ? justifySelf : parentJustifyItems;
    if (/^(normal|stretch|auto)$/.test(effectiveJustify)) {
      return { verdict: AXIS.FILL, reason: `grid 칸을 채운다 — 트랙 선언 없음 · justify-self:${effectiveJustify}`, source: "기본(grid item stretch)", value: null };
    }
  }

  if (parentIsFlexOrGrid) {
    const crossAxisOfParent = !mainAxisOfParent;
    const alignSelf = computed?.alignSelf ?? "auto";
    const parentAlignItems = parentComputed?.alignItems ?? "normal";
    const effectiveAlign = alignSelf !== "auto" ? alignSelf : parentAlignItems;
    if (crossAxisOfParent && /^(normal|stretch)$/.test(effectiveAlign) && !isReplaced) {
      return { verdict: AXIS.FILL, reason: `부모 ${parentDisplay}의 교차축 + align:${effectiveAlign} — 교차축을 채운다`, source: `align-items:${effectiveAlign}`, value: null };
    }
    return { verdict: AXIS.HUG, reason: `부모 ${parentDisplay}의 아이템, 크기 선언 없음 — 콘텐츠가 결정한다`, source: `기본(${parentDisplay} item)`, value: null };
  }

  if (horizontal) {
    if (/^(block|flow-root|list-item|table)$/.test(display) && !isReplaced) {
      return { verdict: AXIS.FILL, reason: "선언 없음 + block — CSS 기본으로 inline축을 채운다", source: "기본(block)", value: null };
    }
    if (/^(inline|inline-block|inline-flex|flex|grid|inline-grid)$/.test(display)) {
      // flex/grid 컨테이너 자체가 block-level이면 여전히 채운다.
      if (/^(flex|grid)$/.test(display) && !isReplaced) {
        return { verdict: AXIS.FILL, reason: "선언 없음 + block-level flex/grid — inline축을 채운다", source: "기본(block-level)", value: null };
      }
      return { verdict: AXIS.HUG, reason: `선언 없음 + ${display} — 콘텐츠가 결정한다`, source: `기본(${display})`, value: null };
    }
  } else {
    // 세로축의 기본은 콘텐츠다.
    return { verdict: AXIS.HUG, reason: "선언 없음 — 세로는 콘텐츠가 결정한다", source: "기본(height:auto)", value: null };
  }

  return { verdict: AXIS.UNRESOLVED, reason: `판정 규칙에 걸리지 않음 (display:${display})`, source: null, value: null };
}

/**
 * `grid-template-columns` 선언에서 **n번째 열**의 트랙을 집는다.
 * `repeat(N, X)`는 펼치고, `minmax(a,b)`처럼 괄호 안의 공백은 트랙 구분이 아니므로 깊이를 세며 자른다.
 * 열 번호가 트랙 수를 넘으면(암시적 열) null을 돌려 판정을 다른 규칙에 맡긴다.
 *
 * **두 번째 인자는 자식 순번이 아니라 열 번호다(2026-09-15).** 예전 호출자는 DOM 순번을 넘겼고, 자동 배치 grid 에서 열
 * 번호는 순번이 아니다 — `/subscription` 의 한 열 grid(`grid-template-columns: 1fr`)에서 둘째 · 셋째 자식이 트랙을 못 찾고
 * `align-items: start` 로 HUG 가 되어 `Credit usage history` 블록이 라이브 `190:1172` 에서 402 폭으로 접혔다. 열 번호는
 * `gridAutoPlacementColumn` 이 푼다.
 */
export function trackForChild(declaration, columnIndex) {
  const tracks = parseTracks(declaration);
  if (!tracks || columnIndex == null) return null;
  return tracks[columnIndex] ?? null;
}

/** 자동 배치가 아닌 배치 선언(`auto` · `auto / auto` 가 아닌 값)인가. */
const EXPLICIT_PLACEMENT = ["grid-column", "grid-column-start", "grid-column-end", "grid-row", "grid-row-start", "grid-row-end", "grid-area"];
function hasExplicitPlacement(declared) {
  return EXPLICIT_PLACEMENT.some((name) => {
    const value = String(declared?.[name] ?? "").replace(/\s*!\s*important\s*$/i, "").trim();
    return value !== "" && !/^auto(\s*\/\s*auto)*$/.test(value);
  });
}

/**
 * **자동 배치 grid 에서 흐름 자식이 놓이는 열(0부터).** CSS Grid 자동 배치(`grid-auto-flow: row`, dense 아님)는 명시 배치가
 * 없는 span 1 아이템을 문서 순서로 한 칸씩 채우고, 열이 끝나면 다음 행 첫 열로 간다 — 열 = (앞선 흐름 자식 수) mod 트랙 수.
 * 흐름 밖(`position: absolute/fixed`) 형제는 칸을 차지하지 않는다.
 *
 * 추측하지 않는 자리는 null 이다(판정은 다른 규칙으로 간다):
 *   · 부모 흐름이 `row` 가 아니다(column · dense 는 순서를 다시 짠다).
 *   · 이 자식이나 앞선 형제에 명시 배치(`grid-column` · `grid-row` · `grid-area` · span)가 있다.
 *   · 앞선 형제 중 측정되지 않은 것이 있다 — 측정기는 보이지 않거나 뷰포트 밖인 요소를 싣지 않고, 그것이 칸을 차지했는지
 *     (`display: none` 은 아니고 뷰포트 밖이면 차지한다) 알 수 없다. 경로의 순번이 이어지지 않으면 이 경우다.
 *
 * @param {object} input
 * @param {number} input.trackCount    `grid-template-columns` 트랙 수
 * @param {object|null} input.parentComputed 부모 computed style(`gridAutoFlow`)
 * @param {string} input.parentPath    부모 경로
 * @param {Array<{path:string, style?:object, declared?:object}>} input.siblings 부모의 측정 자식(문서 순)
 * @param {string} input.path          이 자식의 경로
 * @returns {number|null}
 */
export function gridAutoPlacementColumn({ trackCount, parentComputed, parentPath, siblings, path }) {
  if (!trackCount || !Array.isArray(siblings) || !path) return null;
  const flow = String(parentComputed?.gridAutoFlow ?? "row").trim();
  if (flow !== "row") return null;
  const indexOf = (candidate) => {
    const prefix = `${parentPath}.`;
    if (!candidate.startsWith(prefix)) return null;
    const rest = candidate.slice(prefix.length);
    return /^\d+$/.test(rest) ? Number(rest) : null;
  };
  const target = indexOf(path);
  if (target == null) return null;
  const ordered = siblings.map((sibling) => ({ sibling, index: indexOf(sibling.path) }));
  if (ordered.some((entry) => entry.index == null)) return null;
  ordered.sort((a, b) => a.index - b.index);
  let expected = 0;
  let cursor = 0;
  for (const { sibling, index } of ordered) {
    if (index > target) break;
    if (index !== expected) return null;
    expected += 1;
    const out = /^(absolute|fixed)$/.test(sibling.style?.position ?? "");
    if (hasExplicitPlacement(sibling.declared)) return null;
    if (index === target) return out ? null : cursor % trackCount;
    if (!out) cursor += 1;
  }
  return null;
}

/**
 * `grid-template-columns` 선언을 트랙 배열로 펼친다.
 * `repeat(N, X)`는 펼치고, `minmax(a,b)`처럼 괄호 안의 공백은 트랙 구분이 아니므로 깊이를 세며 자른다.
 */
export function parseTracks(declaration) {
  if (!declaration) return null;
  // `repeat(N, ...)`를 펼친다. 인자 안에 `minmax(0, 1fr)`처럼 괄호가 중첩되므로 정규식으로는 끝을
  // 찾을 수 없다 — 여는 괄호부터 깊이를 세어 짝을 찾는다.
  let expanded = String(declaration);
  for (let guard = 0; guard < 10; guard += 1) {
    const start = expanded.search(/repeat\(/i);
    if (start < 0) break;
    let depth = 0;
    let end = -1;
    for (let i = start + "repeat".length; i < expanded.length; i += 1) {
      if (expanded[i] === "(") depth += 1;
      else if (expanded[i] === ")") {
        depth -= 1;
        if (depth === 0) { end = i; break; }
      }
    }
    if (end < 0) break;
    const inner = expanded.slice(start + "repeat(".length, end);
    const comma = inner.indexOf(",");
    if (comma < 0) break;
    const count = Number(inner.slice(0, comma).trim());
    const track = inner.slice(comma + 1).trim();
    if (!Number.isFinite(count) || count <= 0) break;
    expanded = expanded.slice(0, start)
      + Array.from({ length: count }, () => track).join(" ")
      + expanded.slice(end + 1);
  }
  const tracks = [];
  let depth = 0;
  let current = "";
  for (const char of expanded) {
    if (char === "(") depth += 1;
    if (char === ")") depth -= 1;
    if (/\s/.test(char) && depth === 0) {
      if (current.trim()) tracks.push(current.trim());
      current = "";
      continue;
    }
    current += char;
  }
  if (current.trim()) tracks.push(current.trim());
  return tracks;
}

/**
 * min/max 크기의 computed 값을 px 한계로 푼다. 풀 수 없으면 null.
 *
 * **computed 는 퍼센트가 섞인 `min()`·`max()`·`clamp()` 를 풀지 않고 식 그대로 둔다** —
 * `max-width: min(1300px, 100%)` 의 computed `maxWidth` 도 `"min(1300px, 100%)"` 다. `px()` 만 보면
 * 그 상한이 통째로 사라지고 FILL 이 부모 폭을 다 먹는다. 실측 사례: `/mypage/upgrade` 데스크톱의
 * 요금 카드 격자가 제품 1300 대신 본문 1672 로 그려져 카드가 256.8 → 331.2 로 넓어졌다.
 * FILL 이 이미 「부모의 100%」이므로 옮길 수 있는 것은 **px 쪽 한계가 그대로 Figma 한계가 되는
 * 꼴**뿐이다 — 상한은 `min(L…, 100%)` · `clamp(a, 100%, b)` 의 b, 하한은 `max(L…, 100%)` ·
 * `clamp(a, 100%, b)` 의 a. `max-width: max(L, 100%)` 처럼 부모보다 넓게 풀리는 한계는 FILL 이 이미
 * 막으므로 옮기지 않는다. 100% 가 아닌 퍼센트가 섞이면 부모 비례라 풀지 않는다.
 */
function limitPx(kind, value) {
  const plain = px(value);
  if (plain != null) return plain;
  const match = /^(min|max|clamp)\(([^]*)\)$/.exec(String(value ?? "").trim());
  if (!match) return null;
  const [, fn, inner] = match;
  const parts = splitTopLevel(inner);
  const lengths = parts.map((part) => px(part));
  const full = parts.map((part) => percent(part) === 100);
  if (parts.some((part, i) => lengths[i] == null && !full[i])) return null;
  const known = lengths.filter((value) => value != null);
  if (known.length === 0) return null;
  if (!full.some(Boolean)) {
    if (fn === "min") return Math.min(...known);
    if (fn === "max") return Math.max(...known);
    return parts.length === 3 ? Math.max(lengths[0], Math.min(lengths[1], lengths[2])) : null;
  }
  if (fn === "clamp") {
    if (parts.length !== 3 || !full[1] || full[0] || full[2]) return null;
    return kind === "max" ? lengths[2] : lengths[0];
  }
  if (kind === "max") return fn === "min" ? Math.min(...known) : null;
  return fn === "max" ? Math.max(...known) : null;
}

/** 두 한계 중 더 좁은 쪽을 고른다(없으면 있는 쪽). */
function tighter(kind, a, b) {
  if (a == null) return b ?? null;
  if (b == null) return a;
  return kind === "min" ? Math.max(a, b) : Math.min(a, b);
}

/**
 * 노드 하나의 크기 출처를 판정한다.
 * @returns {{h:object, v:object, absolute:boolean, minMax:object}}
 */
export function decideNode({ declared = {}, computed = {}, parentComputed = null, parentDeclared = null, gridColumn = null, tag = "", contextId = null }) {
  const isReplaced = /^(img|svg|video|canvas|iframe|input|textarea|select)$/.test(tag);
  const sub = (value) => (contextId ? substituteViewportUnits(value, contextId) : value);
  // 부모가 grid면 **선언된** 트랙 목록에서 이 자식이 놓인 열의 트랙을 집는다. computed의 트랙은 이미 px로
  // 해결돼 `1fr`인지 고정인지 구분할 수 없으므로 반드시 선언값을 써야 한다. 열 번호는 자식 순번이 아니라
  // 자동 배치로 푼 값이다(`gridAutoPlacementColumn` — 호출자가 형제를 보고 넘긴다).
  const gridTrack = trackForChild(
    parentDeclared?.["grid-template-columns"],
    gridColumn,
  );
  // 선언된 justify-self/align-self 는 computed보다 정확하다(computed는 `auto`를 부모 값으로 해결해 준다).
  const selfAlign = {
    justifySelf: declared["justify-self"] ?? computed?.justifySelf,
    alignSelf: declared["align-self"] ?? computed?.alignSelf,
  };
  const h = decideAxis({ declared: sub(declared.width), computed, axis: "horizontal", parentComputed, isReplaced, gridTrack, selfAlign });
  const v = decideAxis({ declared: sub(declared.height), computed, axis: "vertical", parentComputed, isReplaced });
  return {
    h,
    v,
    absolute: computed.position === "absolute" || computed.position === "fixed",
    // min/max 는 computed에서도 %가 살아남는 축이라 그대로 Figma로 옮긴다.
    // `min()`/`clamp()` 선언이 만든 한계(`limit`)는 computed의 min/max보다 좁을 때만 이긴다.
    minMax: {
      minWidth: tighter("min", limitPx("min", computed.minWidth), h.limit?.min),
      maxWidth: tighter("max", limitPx("max", computed.maxWidth), h.limit?.max),
      minHeight: tighter("min", limitPx("min", computed.minHeight), v.limit?.min),
      maxHeight: tighter("max", limitPx("max", computed.maxHeight), v.limit?.max),
    },
  };
}

/**
 * 판정 결과를 Figma Plugin API 속성으로 옮긴다.
 * **호출 순서 주의:** FILL/HUG(`layoutSizing*`)는 노드가 auto-layout 부모의 자식이 된 *뒤에만* 유효하고,
 * `resize()`는 `primaryAxisSizingMode`를 FIXED로 덮어쓴다. 그래서 resize를 먼저, sizing을 나중에 건다.
 */
export function toFigmaSizing(decision) {
  const map = (verdict) => (verdict === AXIS.FILL ? "FILL" : verdict === AXIS.HUG ? "HUG" : "FIXED");
  return {
    layoutSizingHorizontal: map(decision.h.verdict),
    layoutSizingVertical: map(decision.v.verdict),
    layoutPositioning: decision.absolute ? "ABSOLUTE" : "AUTO",
    minWidth: decision.minMax.minWidth,
    maxWidth: decision.minMax.maxWidth,
    minHeight: decision.minMax.minHeight,
    maxHeight: decision.minMax.maxHeight,
    unresolved: [
      decision.h.verdict === AXIS.UNRESOLVED ? `h: ${decision.h.reason}` : null,
      decision.v.verdict === AXIS.UNRESOLVED ? `v: ${decision.v.reason}` : null,
    ].filter(Boolean),
  };
}

/** 바깥 display가 inline 계열인가 — 형제와 가로로 흐른다는 뜻이다. */
const INLINE_LEVEL = /^inline(-block|-flex|-grid|-table)?$/;

/**
 * CSS display → Figma layoutMode. Figma는 GRID도 지원한다(layoutMode:'GRID').
 *
 * **flex/grid가 아닌 흐름(block) 컨테이너도 auto-layout이어야 한다.** `NONE`으로 두면 자식이 전부
 * (0,0)에 겹치고 그 안에서는 FILL·HUG가 아예 거부되어 100×100 기본 크기로 남는다. 실측 사고:
 * `/mypage/upgrade/billing-change-fail` desktop은 최상위 래퍼가 `display:block`이라 화면 전체가
 * 100×100으로 무너졌다(스크린샷으로 확인).
 *
 * 방향은 자식의 바깥 display로 정한다 — CSS 흐름이 그렇게 동작한다. 흐름에서 빠진
 * absolute/fixed 자식은 방향 판정에 쓰지 않는다.
 */
export function toLayoutMode(computed, childComputeds = []) {
  const display = computed?.display ?? "";
  if (/grid/.test(display)) return "GRID";
  if (/flex/.test(display)) {
    return (computed.flexDirection ?? "row").startsWith("column") ? "VERTICAL" : "HORIZONTAL";
  }
  if (display === "none" || display === "contents" || display === "") return "NONE";
  if (display === "table-row") return "HORIZONTAL";
  const flow = childComputeds.filter(
    (child) => !/^(absolute|fixed)$/.test(child?.position ?? "static"),
  );
  if (flow.length === 0) return "NONE";
  return flow.every((child) => INLINE_LEVEL.test(child?.display ?? "")) ? "HORIZONTAL" : "VERTICAL";
}
