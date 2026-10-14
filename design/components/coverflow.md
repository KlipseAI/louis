---
id: coverflow
status: experimental
authority: normative
summary: 카드 여럿을 3D 로 늘어놓고 가운데 한 장을 정면으로 세워 넘겨 봅니다.
---

# Coverflow

결과 미디어 여럿을 한 자리에서 넘겨 본다. **가운데 카드는 정면, 옆 카드는 뒤로 물러나 기울어** 「더 있다」를 보인다(`.louis-coverflow`,
[DS-D-0090](../governance/decisions/DS-D-0090-coverflow.md), [DS-D-0084](../governance/decisions/DS-D-0084-product-parts-become-louis.md)).
카드 여럿이 동시에 3D 로 늘어서고 조작이 페이지 바닥 위에 있는 것이 [Banner Carousel](banner-carousel.md)(사진 배너가 한 장씩 겹쳐 사라지고
조작이 사진 위)과 다르다.

제품 정본은 `components/templates/TemplateResultCarousel.tsx:26-247`(통합 판 `54b62a8aa`)이고 소비처는 공개 템플릿 상세의 결과 미디어 하나
(`app/templates/[slug]/page.tsx`, 218줄)다.

```html
<div class="louis-coverflow">
  <div class="louis-coverflow__stage" role="group" aria-roledescription="carousel" aria-label="결과 미디어" tabindex="0">
    <div class="louis-coverflow__deck">
      <div class="louis-coverflow__card" role="group" aria-roledescription="slide" aria-label="1 / 5"
           aria-hidden="true" style="--louis-coverflow-offset: -1; --louis-coverflow-depth: 1">
        <img class="louis-coverflow__media" src="…" alt="" draggable="false" loading="lazy">
      </div>
      <div class="louis-coverflow__card" role="group" aria-roledescription="slide" aria-label="2 / 5 워크플로"
           data-active="true" style="--louis-coverflow-offset: 0; --louis-coverflow-depth: 0">
        <video class="louis-coverflow__media" src="…" controls playsinline preload="metadata"></video>
        <span class="louis-coverflow__label"><span class="louis-badge" data-surface="media">워크플로</span></span>
      </div>
      <!-- 세 칸 넘게 떨어진 카드: data-far="true" -->
    </div>
  </div>
  <div class="louis-coverflow__controls">
    <button type="button" class="louis-coverflow__nav" aria-label="이전">
      <svg class="louis-coverflow__nav-glyph" aria-hidden="true"><!-- caret-left --></svg>
    </button>
    <div class="louis-coverflow__dots" role="tablist" aria-label="미디어 고르기">
      <button type="button" class="louis-coverflow__dot" role="tab" aria-selected="false" aria-label="1번째 미디어"></button>
      <button type="button" class="louis-coverflow__dot" role="tab" aria-selected="true" aria-current="true" aria-label="2번째 미디어"></button>
    </div>
    <button type="button" class="louis-coverflow__nav" aria-label="다음">
      <svg class="louis-coverflow__nav-glyph" aria-hidden="true"><!-- caret-right --></svg>
    </button>
  </div>
</div>
```

## When to use

- 같은 무게의 미디어 여러 장 가운데 한 장을 크게 보는 자리(결과 · 예시 갤러리).
- 쓰지 않는 자리 — 사진 배너 한 장씩은 [Banner Carousel](banner-carousel.md). 카드 줄을 가로로 굴리는 목록은 캐러셀 머리 +
  [Carousel Arrow](carousel-arrow.md). 한 장뿐이면 미디어를 그대로 둔다(조작 줄이 서지 않는다).

## Availability

| Surface       | 상태           | 근거 |
| ------------- | -------------- | ---- |
| Web           | `partial`      | CSS recipe `packages/css/src/component/coverflow.css` · 실브라우저 시험 `coverflow.browser.test.tsx`. React 표면은 없다 — 키 · 끌기 · 누름 · 거리 계산은 소비처가 갖는다(DS-D-0090) |
| Figma         | `done`      | 2026-10-14 — `CoverflowCard`(Layout `base` · `compact` × Selected `false` · `true` = 4, 코드 `data-active`, BOOLEAN `HasLabel`), `CoverflowNav`(Direction `prev` · `next` × State `Default` · `Hover` · `Disabled` = 6), `CoverflowDot`(Selected `false` · `true` — 코드 `aria-current` × State `Default` · `Hover` = 4, 활성 점 Hover 는 Default 와 같은 칸)와 시드 데이터 보드 `Coverflow`(Layout `base` 1120 · `compact` 600, 다섯 장 · 가운데 셋째). 그림자는 효과 스타일 `elevation/coverflow-card` · `-active`, 라벨은 Badge 인스턴스를 `media-badge` 변수로 덮었다. **Figma 는 원근을 그리지 못한다** — 옆 카드는 평면 근사(52% 옆 · 0.92 · 0.84 · 폭 cos 34° · 원근 1400 투영)이고 자리는 계약이 아니다. Media 는 자리표시다. 기록 `coverflow-card` · `coverflow-nav` · `coverflow-dot` · `coverflow` 와 parity 기하 계약, 실브라우저 되재기(`coverflow-geometry.browser.test.tsx`). 제품 렌더 대조는 없다 — 2026-10-14 기하 계약 · 실측 · 되재기로 done(DS-D-0035) |
| Documentation | `done`         | 이 문서 |
| Maturity      | `experimental` | 제품이 아직 이 클래스를 물지 않는다 |

## Anatomy

1. **무대**(`__stage`) — 자르기(`overflow: hidden`) · 끌기 방향(`touch-action: pan-y`) · 포커스. `role="group"` + `aria-roledescription="carousel"`.
   높이는 카드 + 40(위아래 20 씩 그림자 자리) — 540, 좁은 판 440.
2. **덱**(`__deck`) — 3D 문맥(`perspective: 1400px` · `preserve-3d`). **겹 순서는 깊이다** — 숫자 z-index 가 없다. 묶음 속성(overflow · opacity ·
   filter · clip-path · isolation · mask)을 덱에 더하면 평면으로 접혀 겹 순서가 문서 순서가 되므로 더하지 않는다.
   덱 자신의 상자도 3D 문맥의 z = 0 평면이라 뒤로 물러난 옆 카드 앞을 막는다 — 덱은 `pointer-events: none`, 카드가 누름을 받는다.
3. **카드**(`__card` · `__media`) — 400 × 500(4:5), 반경 16(`radius-overlay`), 면 `media-stage-surface`, 그림자 `elevation-coverflow-card`(가운데는
   `-active`). 미디어는 카드를 덮는다(`object-fit: cover`). 슬라이드 그룹.
4. **라벨**(`__label`) — 왼쪽 · 아래 12 자리만 준다. 안에는 `louis-badge[data-surface="media"]` 를 그대로 둔다.
5. **조작 줄**(`__controls`) — 사이 16 · 위 20. 이동 버튼 둘(`__nav` 40 원형 · `__nav-glyph` 16) 사이에 점 묶음(`__dots` 사이 8 · `__dot` 8 원).

## 거리는 소비처가 준다

카드마다의 자리는 「지금 가운데 카드」에서 몇 칸 떨어졌느냐 하나로 정해진다(`components/templates/TemplateResultCarousel.tsx:163-173`).
그 수는 상태에서 오고 CSS 가 셀 수 없다. **소비처는 거리만 준다** — 거리를 옆 · 뒤 · 기울기 · 크기로 바꾸는 식은 레시피가 소유한다.

| 변수 · 속성 | 단위 · 범위 | 다는 자리 | 제품 원천 | 기본값(루트) |
| --- | --- | --- | --- | --- |
| `--louis-coverflow-offset` | 정수, 부호 있음(왼쪽 음수) | `__card` 인라인 | `offset = i − active` | `0` |
| `--louis-coverflow-depth` | 정수 ≥ 0 = offset 의 절댓값 | `__card` 인라인 | `Math.abs(offset)` | `0` |
| `data-active="true"` | 가운데 카드 하나 | `__card` | `isActive` | 없음 |
| `data-far="true"` | depth > 3 — 보이지 않고 누를 수 없다 | `__card` | `hidden = abs > 3` | 없음 |
| `aria-current="true"` | 지금 카드의 점 | `__dot` | `i === active` | 없음 |

식 — 한 칸마다 카드 폭의 52% 옆 · 140 뒤 · −34° 돌림 · 8% 작게(하한 70%). 한 칸 옆 카드의 중심은 가운데에서 208 옆이고 크기 0.92 다.
개별 변형 속성의 적용 순서(`translate` → `rotate` → `scale`)가 제품 `transform` 목록의 순서와 같아 결과 행렬이 같다.
**depth 를 따로 받는 이유** — CSS `abs()` 가 모든 엔진에 서지 않았다. 서면 depth 를 지우고 `abs(var(--louis-coverflow-offset))` 로 접는다.

**소비처가 갖는 행동.** 무대 포커스에서 ←/→ 로 한 칸(**무대 자신이 포커스일 때만**), 끌어서 48px 넘으면 한 칸 · 8px 넘게 움직였으면 카드 누름을
무시, 옆 카드를 누르면 그 카드로, 처음 · 끝에서 이동 버튼 `disabled`, 미디어 수가 줄면 활성 칸 보정, 미디어가 하나면 조작 줄을 그리지 않는다.
영상은 가운데 카드만 `controls` · 소리를 갖는다(`components/templates/TemplateResultCarousel.tsx:114-143` · `components/templates/TemplateResultCarousel.tsx:180-190`).

## Properties

| 자리 | 속성 | 값 | 뜻 |
| --- | --- | --- | --- |
| `__card` | `--louis-coverflow-offset` · `--louis-coverflow-depth` | 정수 · 그 절댓값 | 가운데에서의 거리 |
| `__card` | `data-active` | `true` | 가운데 카드 — 깊은 그림자, 누름 커서 없음 |
| `__card` | `data-far` | `true` | 세 칸 넘게 떨어짐 — `opacity: 0` · `pointer-events: none` |
| `__card` | `aria-hidden` | `true` | 가운데가 아닌 카드(가운데는 속성을 뺀다) |
| `__dot` | `aria-current` · `aria-selected` | `true` | 지금 카드 |
| `__nav` | `disabled`(또는 `aria-disabled="true"`) | | 처음 · 끝 |

레시피 상수 — `--louis-coverflow-shift`(52%) · `-recede`(−140px) · `-tilt`(−34deg) · `-shrink`(0.08) · `-scale-min`(0.7) · `-card-block-size`(500px) —
는 루트에 선언되지만 덮는 자리가 아니다. 바꾸면 옆 카드끼리 평면이 꿰뚫어 깊이 정렬이 깨질 수 있다.

## States

| 상태 | 무엇이 바뀌나 |
| --- | --- |
| 카드 가운데 | 그림자 `elevation-coverflow-card-active`(0 32 80 40%), 커서 기본, 영상 컨트롤 · 소리 |
| 카드 옆(1~3칸) | 칸마다 52% 옆 · 140 뒤 · −34° · 8% 작게(하한 70%), 그림자 `elevation-coverflow-card`(0 24 60 28%) |
| 카드 창 밖(4칸~) | 보이지 않고 눌리지 않는다 — DOM 에 남아 넘길 때 전이가 이어진다 |
| 카드 전이 | 자리 · 그림자 `motion-coverflow-shift`(520 · 0.22/1/0.36/1), 나타남 `motion-crossfade-enter`(420 ease) |
| 이동 버튼 Hover | 면 잉크 4% → 12%, 테두리 16% → 24% — 호버 기기에서만 |
| 이동 버튼 Disabled | 글리프 `fg-disabled`, 커서 `not-allowed`, 호버하지 않는다 |
| 점 쉼 · Hover | 잉크 48% · 64% |
| 점 활성 | `accent-primary` × 1.35 — 호버로 바뀌지 않는다 |
| 좁은 판(묶음 ≤ 608) | 카드 320 × 400, 무대 440 |
| 줄인 모션 | 전이 0 — 자리는 그대로 바뀐다 |
| 강제 색 | 카드 경계 `CanvasText` 실선, 점 `CanvasText` · 활성 `Highlight`, 비활성 버튼 `GrayText` |

## Content

- 카드는 같은 비율(4:5)로 자른다(`object-fit: cover`). 다른 비율의 원본은 가운데를 기준으로 잘린다.
- 라벨은 한 줄, 그 카드가 다른 종류일 때만(결과들 사이의 워크플로 영상). 모든 카드에 달지 않는다.
- 영상은 저절로 재생하지 않는다 — 가운데 카드의 컨트롤로만.
- 슬라이드 이름은 「N / 전체」, 라벨이 있으면 더한다(「5 / 5 워크플로」). 그림은 `alt=""` 다.

## Accessibility

- 무대는 탭 정지 하나(`tabindex="0"`)이고 ←/→ 로 한 칸 넘긴다. **무대 자신이 포커스일 때만**(`event.target === event.currentTarget`) — 가운데
  영상의 컨트롤 키를 가로채지 않는다.
- 보조기술에 서는 카드는 가운데 하나다(나머지 `aria-hidden="true"`). 카드는 `role="group"` · `aria-roledescription="slide"` 로 banner-carousel 계약과 같다.
- 이동 버튼은 이름(「이전」 · 「다음」)이 필수다 — 글자가 없다. 처음 · 끝에서 `disabled`.
- 점은 `role="tab"` · `aria-selected` · `aria-current` 다. 누르는 자리는 16 × 24(위아래 8 · 옆 4 넓힘)이고, 24 에 못 미치는 폭은 같은 일을 하는
  40 이동 버튼이 대신한다(2.5.8).
- 상태는 색만으로 말하지 않는다 — 활성 점은 1.35 배 크다(1.4.1).
- 포커스 링은 그리지 않는다(DS-D-0074). 강제 색에서 점 · 카드 경계 · 비활성 버튼을 시스템 색으로 되살린다.

| 짝(바닥 위, 라이트 · 다크) | 제품 | 레시피 |
| --- | --- | --- |
| 쉬는 점 | 1.60 · 1.64 | 3.68 · 4.76 |
| 호버 점 | 2.83 · 3.55 | 6.61 · 8.03 |
| 활성 점 `accent-primary` | 3.37 · 5.97 | 같다 |
| 이동 글리프 / 버튼 면 | 18.43 · 18.97 | 15.15 · 18.97(`fg-primary`) |
| 이동 버튼 테두리 | 1.58 · 1.60 | 같다 — 글리프가 버튼을 알린다 |
| 카드 라벨 | 4.73(흰 사진 위 최악) | 7.61(사진과 무관) |

## Acceptance tests

`packages/react/test/coverflow.browser.test.tsx` 가 클래스 마크업을 실브라우저로 렌더해 잰다.

1. 다섯 장 · 가운데 2 — 카드 400 × 500 · 반경 16 · 무대 540, 한 칸 옆 카드 중심이 가운데에서 208 옆.
2. 겹 순서 — 겹친 자리의 맨 위 카드가 가운데 → 한 칸 옆 → 두 칸 옆 순서다(`elementFromPoint`), 가운데 0 · 2 · 4.
3. 옆 카드 누름이 그 카드에 닿는다.
4. 묶음 폭 600 — 카드 320 × 400 · 무대 440.
5. 이동 버튼 40 원형 · 테두리 1, 점 8 · 사이 8 · 활성 1.35 배, 조작 줄 사이 16 · 위 20.
6. `data-far` 카드는 `opacity: 0` · `pointer-events: none`.
7. 대비는 실제로 잰다 — 쉬는 점 · 호버 점 · 활성 점 ≥ 3, 이동 글리프 · 라벨 ≥ 4.5, 두 테마.
8. 호버 규칙이 `(hover: hover)` 밖에 없다.

`packages/react/test/coverflow-geometry.browser.test.tsx` 는 기록 `figma/components.measured.json` 의 `coverflow-card` · `coverflow-nav` · `coverflow-dot` · `coverflow` 칸을 코드가 만드는지 되잰다.

## Known deviations

1. **이동 버튼 테두리(잉크 16%, 바닥 위 1.58 · 1.60)는 3:1 미만이다** — 버튼을 알아보게 하는 것은 글리프다(15.15 · 18.97).
2. **활성 점과 쉬는 점의 휘도 차가 작다(1.09 · 1.25)** — 크기 1.35 배가 함께 상태를 말한다.
3. **점 탭 목록에 탭 패널이 없다** — banner-carousel 과 같은 계약이고 두 캐러셀을 함께 고칠 일이다.
4. **카드 나타남은 420 ease 다** — 제품 400 ease 와 20ms 차이고 있는 `motion-crossfade-enter` 를 쓴다.
5. **카드 그림자 전이는 `motionProperties` 선언 밖이다** — 선언 어휘에 `box-shadow` 가 없어 넘김 모션과 같은 시간에 따라간다(choice-card 와 같은 방식).
6. **좁은 판의 경계가 화면 640 이 아니라 묶음 폭 608 이다** — 상세 페이지에서는 같은 순간이지만 다른 자리에 놓으면 그 폭으로 판단한다.

## 제품에서 발견한 것

- 무대의 `preserve-3d` 는 같은 요소의 `overflow: hidden` 에 접혀 아무 일도 하지 않고, 겹 순서를 숫자 z-index(`100 − abs`)가 정한다
  (`components/templates/TemplateResultCarousel.tsx:28-33` · `components/templates/TemplateResultCarousel.tsx:170`).
- 활성 점을 호버하면 파랑을 잃는다 — 원본 CSS 의 특이도 사고를 이식 때 「보존」했다(`components/templates/TemplateResultCarousel.tsx:22-24`).
- 무대의 ←/→ 처리가 가운데 영상 컨트롤에서 올라온 키도 받아, 영상을 넘기는 키가 카드까지 넘긴다(`components/templates/TemplateResultCarousel.tsx:114-122`).
- 이동 글리프가 글자(`‹` · `›`)다. 가운데 카드에 `aria-hidden="false"` 가 찍힌다(`components/templates/TemplateResultCarousel.tsx:179`).
- 이식 원장(`migration/product-screens/10.3.md`)의 알파 넷이 앵커 값과 다르다(58 · 6 · 22 · 26 → 56 · 4 · 20 · 24). 레시피는 앵커를 따른다.

## 제품 (나) — 이 레시피가 서면 제품이 할 일

| 제품 자리 | 할 일 |
| --- | --- |
| 상수 열셋(`components/templates/TemplateResultCarousel.tsx:26-90`) | `louis-coverflow*` 클래스로. 바깥 `mt-4` 는 소비처 여백으로 남는다 |
| 무대 · 카드(`components/templates/TemplateResultCarousel.tsx:149-207`) | 무대 안에 `__deck` 한 겹을 더하고 카드를 그 안으로. 인라인 `transform` · `zIndex` 를 지우고 `--louis-coverflow-offset` · `-depth` 와 `data-active` · `data-far` 로 |
| 카드 접근성 | 비활성만 `aria-hidden="true"`, 카드에 `role="group"` · `aria-roledescription="slide"` · `aria-label="N / 전체"` |
| 키 | ←/→ 를 `event.target === event.currentTarget` 일 때만 |
| 라벨 | `<span class="louis-coverflow__label"><span class="louis-badge" data-surface="media">` 로 — 검정 56% · `#fafafa` · `px-5` · `font-medium` 덮어쓰기를 지운다(보이는 변화) |
| 이동 버튼 | 글자 `‹` · `›` → 아이콘 `caret-left` · `caret-right`. 비활성은 `opacity-30` 이 아니라 `fg-disabled`(보이는 변화) |
| 점 | `aria-current` 를 더한다. 쉬는 점 20% → 48%, 호버 40% → 64%, 활성 점 호버 사고가 사라진다(보이는 변화) |
| 좁은 판 | `[@media(max-width:640px)]` 둘을 지운다 — 레시피의 컨테이너 질의가 같은 화면 폭(상세 페이지 608 묶음)에서 바뀐다 |
