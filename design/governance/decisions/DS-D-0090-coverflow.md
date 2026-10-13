---
id: decision-coverflow
status: experimental
authority: normative
---

# DS-D-0090 결과 미디어를 3D 로 늘어놓고 넘기는 커버플로를 새 부품 `coverflow` 로 — Banner Carousel 의 변형이 아니다

- Status: accepted (소유자 지시로 초안의 기본값을 받는다, 2026-10-14)
- Date: 2026-10-14
- Owners: repository owner, design system maintainer
- Affects: `coverflow`, `badge`, `banner-carousel`, `carousel-arrow`, `icon-button`, `media-slot`, `decision-product-parts-become-louis`

## Context

[DS-D-0084](DS-D-0084-product-parts-become-louis.md) 승격 목록의 「큰 것(각각 Decision 먼저)」에 `coverflow` 가 있다. 공개 템플릿 상세의 결과
캐러셀은 제품 한 파일에만 있다 — `components/templates/TemplateResultCarousel.tsx`(247줄, 통합 판 `54b62a8aa`), 소비처는 `app/templates/[slug]/page.tsx`
하나(218줄). 가운데 카드는 정면, 옆 카드는 뒤로 물러나 기울어 「더 있다」를 보인다.

카드 배치 식(옆 52% · 뒤 140 · 34° · 8% 작게, 하한 70%)이 JS 인라인 `transform` 이라(`components/templates/TemplateResultCarousel.tsx:169`) 클래스만으로는
카드가 한 점에 겹친다. 무대의 `preserve-3d` 는 같은 요소의 `overflow: hidden`(묶음 속성)에 접혀 아무 일도 하지 않고, 겹 순서를 숫자 z-index
`100 − abs` 가 정한다(`components/templates/TemplateResultCarousel.tsx:170`). 대비 · 접근성 부채도 있다 — 쉬는 점 잉크 20%(바닥 위 라이트 1.60 · 다크 1.64),
호버 점 40%(2.83 · 3.55), 활성 점을 호버하면 파랑을 잃는 특이도 사고를 이식 때 「보존」했다(`components/templates/TemplateResultCarousel.tsx:22-24`),
카드 라벨은 검정 56% 위라 흰 사진 위 4.73 으로 사진에 흔들리고, 이동 글리프가 글자 `‹` · `›` 다.

있는 부품으로 대 봤다. [Banner Carousel](../../components/banner-carousel.md) 은 사진 배너가 **한 장씩 겹쳐 사라지고**(면 = 사진, `color-media-*`),
화살 28 이 사진 위 유리 칩 안에 있으며 점은 30 × 2 막대이고 **밝기가 상태**다(DS-D-0033). 여기는 카드 여럿이 **동시에** 3D 로 늘어서고 조작이
페이지 바닥 위에 있으며 점은 8 원이고 **크기 · 색이 상태**다. [Carousel Arrow](../../components/carousel-arrow.md) 는 레시피가 없고 32 사각이다.
[Icon Button](../../components/icon-button.md) 은 32 단일이고 원형이 없다(`data-size="lg"` 를 열면 기존 소비처 크기가 바뀐다). [Media Slot](../../components/media-slot.md) 은
평면 칸이라 3D 배치 · 그림자 · 활성 상태를 담지 않는다. 어느 하나의 축으로 접히지 않는다.

## Decision

1. **새 부품 `coverflow`.** `packages/css/src/component/coverflow.css` 에 `.louis-coverflow`(루트 · 컨테이너) · `__stage`(자르기 · 끌기 방향 · 포커스) ·
   `__deck`(3D 문맥) · `__card` · `__media` · `__label`(자리만) · `__controls` · `__nav` · `__nav-glyph` · `__dots` · `__dot` 을 세운다.
2. **거리만 데이터다.** 소비처가 카드마다 `--louis-coverflow-offset`(가운데에서의 칸 수, 부호 있음) · `--louis-coverflow-depth`(그 절댓값)와
   `data-active` · `data-far`, 점에 `aria-current` 를 준다. 거리를 옆 · 뒤 · 기울기 · 크기로 바꾸는 식은 레시피가 소유한다(개별 변형 속성
   `translate` → `rotate` → `scale` 의 적용 순서가 제품 `transform` 목록과 같다).
3. **겹 순서는 깊이다.** 숫자 z-index 없이 `__deck` 의 `preserve-3d` 문맥이 카드를 깊이로 정렬한다. 자르기(`__stage`)와 3D(`__deck`)를 두 겹으로
   가른 것이 그 조건이다. 덱 자신의 상자가 z = 0 평면으로 옆 카드 앞을 막으므로 덱은 누름을 받지 않는다(`pointer-events: none`). 실브라우저 시험이
   겹친 자리의 맨 위 카드를 `elementFromPoint` 로 세어 제품 z-index 순서와 같음을 확인한다(가운데 0 · 2 · 4).
4. **새 시맨틱 셋, 원시 셋, 색 0.** `elevation-coverflow-card`(0 24 60 순검정 28%) · `elevation-coverflow-card-active`(0 32 80 40%) — 두 테마 같은
   global — 와 `motion-coverflow-shift`(520ms · `cubic-bezier(0.22, 1, 0.36, 1)`). `motionProperties` 에 `translate · rotate · scale`, `reducedMotionPairs` 에
   `motion-reduced` 짝. 나타남은 있는 `motion-crossfade-enter`(420 ease, 제품 400 ease 와 20ms 차)다.
5. **대비 미달은 고쳐서 올린다**(DS-D-0084 3항) — 쉬는 점 `gray-000-alpha-48`(3.68 · 4.76) · 호버 점 `-64`(6.61 · 8.03), 활성 점은 호버로 바뀌지 않는다,
   카드 라벨은 `louis-badge[data-surface="media"]` 조합(불투명 면 7.61, 사진과 무관), 이동 글리프는 아이콘 세트 `caret-left` · `caret-right` 16,
   비활성 이동 버튼은 `opacity: 0.3` 대신 `fg-disabled`.
6. **좁은 판은 컨테이너 질의다.** 묶음 폭 ≤ 608(제품 화면 640 경계에서 상세 페이지 좌우 여백 16 씩을 뺀 폭)에서 카드 320 × 400 · 무대 440.
   640 을 LOUIS breakpoint 로 세우지 않는다.
7. **React 표면은 만들지 않는다.** 키(←/→ 는 무대 자신이 포커스일 때만) · 끌기(48px 넘으면 한 칸, 8px 넘게 움직이면 카드 누름 무시) · 옆 카드 누름 ·
   처음 · 끝 `disabled` · 활성 칸 보정 · 미디어 하나면 조작 줄 생략 · 영상 컨트롤은 가운데만 — 소비처의 행동이고 문서가 계약한다.

### 소유자 판정 — 초안의 기본값으로 정했다

초안(`scratchpad/promote/big/coverflow.md`, 작업 폴더)이 남긴 판정 열하나를 소유자 지시로 초안이 권한 기본값으로 정했다. 뒤집으면 레시피 한 곳을 고친다.

| # | 판단 | 기본값 | 대안 |
| --- | --- | --- | --- |
| 1 | 겹 순서 | `__deck` 의 3D 깊이 정렬 — z-index 없음, 마크업 한 겹 더 | `z-index: calc(var(--louis-layer-content) - depth)` + 무대 `isolation` · 소비처 인라인 숫자 z-index |
| 2 | 거리의 소유 | 소비처가 offset · depth 두 변수 + `data-active` · `data-far` | React `Coverflow` 가 상태 · 키 · 끌기까지 |
| 3 | 좁은 판의 경계 | 컨테이너 질의 — 묶음 폭 ≤ 608 | 제품 그대로 화면 640 미디어 쿼리 · 소비처가 `data-layout="compact"` |
| 4 | 점 대비 | 쉼 48% · 호버 64% | 제품 20% · 40% + Known deviation |
| 5 | 활성 점 호버 | 활성 점은 호버로 바뀌지 않는다 | 제품 그대로(호버 때 회색) |
| 6 | 이동 버튼 | 이 부품의 `__nav` 40 원형(비활성 `fg-disabled`) | `carousel-arrow` 32 사각 레시피를 세워 쓴다 · `icon-button` 에 40 · 원형 축 |
| 7 | 이동 글리프 | 아이콘 세트 `caret-left` · `caret-right` 16 | 제품 글자 `‹` · `›` |
| 8 | 카드 라벨 | `badge[data-surface="media"]` 그대로(불투명 면, 좌우 8 · regular) | 제품 값(검정 56% · `#fafafa` · 좌우 10 · medium) |
| 9 | 새 토큰 | 그림자 둘 + 모션 하나 | 있는 것을 빌린다(`elevation-menu` · `motion-list-enter` 560) |
| 10 | 점 ARIA | banner-carousel 계약 그대로 — `role="tab"` · `aria-selected` · `aria-current` | 탭 목록 없이 버튼 묶음 + `aria-current` |
| 11 | 이름 | `coverflow`(id = 파일 = 클래스 접두) | `coverflow-carousel` + 접두 `.louis-coverflow` |

### 경계와 하지 않는 것

- 레시피가 소유한다 — 거리 → 자리 식의 계수 · 카드(4:5 · 반경 16 · 그림자 둘 · 사진 무대 면) · 무대 높이(카드 + 40) · 원근 1400 · 조작 줄 ·
  이동 버튼 · 점(8 · 1.35 배 · 16 × 24 누르는 자리) · 좁은 판 · 줄인 모션 · 강제 색.
- 소비처가 소유한다 — 거리 · 활성 · 창 밖 판단, 키 · 끌기 · 누름, 처음 · 끝 `disabled`, 영상 컨트롤 · 소리, 슬라이드 이름 「N / 전체」, 바깥 여백(`mt-4`).
- 하지 않는 것 — 자동 넘김(제품에 없다, 생기면 banner-carousel 의 정지 계약을 따른다) · banner-carousel 과 점 · 화살 합치기 · carousel-arrow 레시피 ·
  Figma 에서 원근을 흉내 내는 계약 · React 컴포넌트 · 새 의존성 · 새 breakpoint.

## Consequences

- 새 토큰 셋(원시 셋)과 `motionProperties` · `reducedMotionPairs` 한 줄씩. Figma 에 효과 스타일 `elevation/coverflow-card` · `-active` 가 선다.
- 제품 (나): 상수 열셋을 `louis-coverflow*` 로, 무대 안에 `__deck` 한 겹을 더하고 인라인 `transform` · `zIndex` 를 `--louis-coverflow-offset` · `-depth` 와
  `data-active` · `data-far` 로, 비활성 카드만 `aria-hidden="true"`(가운데는 속성을 뺀다) · 카드에 `role="group"` · `aria-roledescription="slide"` ·
  `aria-label="N / 전체"`, ←/→ 는 `event.target === event.currentTarget` 일 때만, 라벨을 media 배지로, 글자 글리프를 아이콘으로, 점에 `aria-current`,
  `[@media(max-width:640px)]` 둘을 지운다.
- 보이는 변화 — 점이 짙어지고(20% → 48%) 활성 점은 호버해도 파랑이 남는다, 라벨 면이 사진과 무관한 짙은 회색이 되고 글자가 조금 가늘다,
  이동 글리프가 아이콘이 되고 비활성 버튼이 흐려지는 대신 글리프 잉크가 `fg-disabled` 가 된다.
- Figma 에 `CoverflowCard` · `CoverflowNav` · `CoverflowDot` 세트와 시드 데이터 보드 `Coverflow` 가 선다.

## Rollback

`coverflow.css` · 문서 · manifest 세 자리 · 토큰 셋 · `motionProperties` · `reducedMotionPairs` 한 줄씩 · Figma 세트 · 효과 스타일 · 기록 · parity 계약을 지운다.
제품이 클래스를 물기 전이면 제품 영향은 없다(소비처가 하나다).
