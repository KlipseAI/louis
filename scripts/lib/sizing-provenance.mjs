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
    if (/^(-?[\d.]+)fr$/.test(track) || /minmax\([^)]*\bfr\b[^)]*\)/.test(track) || track === "auto") {
      return { verdict: AXIS.FILL, reason: `grid 트랙 ${track} — 남는 공간을 나눠 갖는다`, source: `grid-template: ${track}`, value: null };
    }
    const fixedTrack = px(track);
    if (fixedTrack != null) {
      return { verdict: AXIS.FIXED, reason: `grid 트랙 ${track} 고정`, source: `grid-template: ${track}`, value: fixedTrack };
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
 * `grid-template-columns` 선언에서 n번째 자식의 트랙을 집는다.
 * `repeat(N, X)`는 펼치고, `minmax(a,b)`처럼 괄호 안의 공백은 트랙 구분이 아니므로 깊이를 세며 자른다.
 * 트랙 수보다 자식이 많으면(암시적 트랙) null을 돌려 판정을 다른 규칙에 맡긴다.
 */
export function trackForChild(declaration, childIndex) {
  if (!declaration || childIndex == null) return null;
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
  return tracks[childIndex] ?? null;
}

/**
 * 노드 하나의 크기 출처를 판정한다.
 * @returns {{h:object, v:object, absolute:boolean, minMax:object}}
 */
export function decideNode({ declared = {}, computed = {}, parentComputed = null, parentDeclared = null, childIndex = null, tag = "", contextId = null }) {
  const isReplaced = /^(img|svg|video|canvas|iframe|input|textarea|select)$/.test(tag);
  const sub = (value) => (contextId ? substituteViewportUnits(value, contextId) : value);
  // 부모가 grid면 **선언된** 트랙 목록에서 이 자식의 트랙을 집는다. computed의 트랙은 이미 px로
  // 해결돼 `1fr`인지 고정인지 구분할 수 없으므로 반드시 선언값을 써야 한다.
  const gridTrack = trackForChild(
    parentDeclared?.["grid-template-columns"],
    childIndex,
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
    minMax: {
      minWidth: px(computed.minWidth),
      maxWidth: px(computed.maxWidth),
      minHeight: px(computed.minHeight),
      maxHeight: px(computed.maxHeight),
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
