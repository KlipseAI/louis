---
id: banner-carousel
status: experimental
authority: normative
summary: 허브 화면 맨 위에서 사진 배너를 돌려 보여 줍니다.
---

# Banner Carousel

허브 화면 최상단에서 사진 배너 몇 장을 돌려 보여 준다.

## Availability

| Surface       | 상태           | 근거                                                                 |
| ------------- | -------------- | -------------------------------------------------------------------- |
| Web           | `partial`      | public export와 실브라우저 acceptance test 17건이 두 motion context에서 각각 돈다; 제품이 컨트롤·인디케이터 레시피를 실제로 소비한다(`appHomeSceneStyles.ts`); visual regression 없음 |
| Figma         | `done`      | component set 4 variant(Tone × Bleed)에 기하 계약이 붙었고 parity가 매 실행 대조한다; 2026-08-31 재조정분(가운데 본문 · 하단 가운데 막대)이 반영됐다; `controls="pill"` 변형은 아직 모델링하지 않았고 publish 전 — 2026-10-14 되재기 시험 `banner-carousel-geometry.browser.test.tsx` 로 done(DS-D-0035) |
| Documentation | `done`         | 이 문서                                                              |
| Maturity      | `experimental` | 규범과 구현이 같은 변경 단위에서 처음 선다                           |

## 면이 사진이다

이 컴포넌트의 배경은 **테마 표면이 아니라 이미지**다. 그래서 색이 `color-media-*`이고 라이트와
다크에서 **같은 값**을 갖는다. 테마를 따라 뒤집히는 semantic 색을 쓰면 라이트 테마 위의 어두운
사진에서 흰 글자에 흰 스크림이 깔려 오히려 안 보인다.

`tone`은 **사진의 밝기**이지 테마가 아니다. 밝은 사진 위에서는 글자가 어두워야 하므로
`tone="bright"`가 어두운 전경색을 고른다. 이 이름을 테마로 읽으면 값이 뒤집힌다.

**무엇으로 판정할지는 이 컴포넌트가 소유하지 않는다.** 제품은 이미지를 런타임에 샘플링하고, DS는
결과를 `tone` prop으로 받기만 한다. 샘플링을 흡수하면 DS가 이미지 로딩과 CORS를 떠안게 되고,
그것은 배너의 계약이 아니다.

## 본문은 가운데다. 스크림은 없다

제목·설명·CTA가 배너 **한가운데**에 선다. 왼쪽 540px 상자에 붙이던 배치는 좌→우 스크림
(78% → 46% → 0)과 한 몸이었다 — 그 어둠은 왼쪽에 놓인 글자의 대비를 만드는 장치였다.

글자가 가운데로 오면서 그 스크림은 대비가 아니라 **사진을 한쪽만 어둡게 만드는 일**이 됐다.
그래서 함께 걷었다. 이제 배경은 사진 한 겹이고, 글자 대비는 `tone`(밝은 사진 → 어두운 글자)이
혼자 책임진다.

**그 책임이 얇아질 수 있다는 것을 여기 적어 둔다.** 사진 한 장 안에서 밝기가 크게 갈리면 톤 하나로
고른 글자색이 일부 구간에서 대비를 잃는다. 제품 실측에서 실제로 그런 사진이 있었다(중앙값 2.49:1).
사진을 고르는 쪽이 그것을 책임지며, 필요하면 소비처가 가운데에 자기 스크림을 얹는다 — DS는 한쪽
방향으로만 걷히는 스크림을 다시 들이지 않는다.

## 높이는 소비처가 정한다

슬라이드가 전부 `position: absolute`라 **높이를 주지 않으면 0으로 접힌다.** `overflow: hidden`이
함께 있어 컨트롤도 잘려 클릭되지 않는다. 제품도 호출부가 높이를 준다.

DS가 기본 높이를 정하지 않는 이유는 배너의 세로 크기가 화면마다 다르고(허브 4종이 서로 다르다)
**실측된 단일 정본이 없기 때문**이다. 임의의 기본값을 넣으면 그 값이 정본인 척한다.

## When to use

- 허브 화면 최상단에서 **여러 장의 사진 배너**를 돌려 보여 줄 때.
- 배너가 한 장뿐이면 캐러셀이 아니다. 이 컴포넌트는 슬라이드가 하나일 때 **컨트롤을 그리지
  않는다** — 넘길 곳이 없는 화살표와 점은 거짓말이다.
- 목록의 항목을 가로로 넘기는 용도가 아니다. 그것은 별개이며 아직 카탈로그에 없다.

## API

```tsx
<BannerCarousel
  slides={[{ id, imageUrl, tone, title, description, wordmark }]}
  label="홈 배너"
  bleed="boxed"
  controls="indicator"
  autoAdvanceMs={5500}
/>
```

## Anatomy

컨테이너 → 슬라이드(사진 · progressive blur 밴드 · 콘텐츠) → 컨트롤(인디케이터, `pill`이면
화살표와 알약 면까지).

## Properties

| Prop | 값 | 뜻 |
| --- | --- | --- |
| `slides` | `BannerCarouselSlide[]` | 비면 아무것도 그리지 않는다 |
| `label` | `string` | **필수.** 영역 자체의 이름 |
| `bleed` | `boxed`(기본) · `full` | 카드 반경 또는 각지게 |
| `controls` | `indicator`(기본) · `pill` | 하단 가운데 인디케이터만, 또는 우하단 알약 + 화살표 |
| `autoAdvanceMs` | `number`(기본 5500) | `0`이면 넘기지 않는다 |
| `index` · `onIndexChange` | `number` · `(n) => void` | 제어 모드 |

`label`이 필수인 이유는 **제목이 슬라이드마다 바뀌기 때문**이다. 영역의 이름이 없으면 스크린
리더에서 "무엇의 1/3인지" 알 수 없다.

## Hierarchy와 variants

variant 축은 `bleed`와 `controls` 둘이다. 톤은 variant가 아니라 **슬라이드마다 다른 데이터**다.

`controls`는 배치만 가른다 — 인디케이터의 모양(30×2 막대)은 두 배치에서 같다. `pill`이 남아 있는
이유는 화살표가 필요한 소비처가 여전히 있기 때문이고, 기본이 `indicator`인 이유는 본문이 가운데
정렬이라 컨트롤도 같은 축을 보아야 하기 때문이다.

## States

슬라이드는 활성/비활성 둘. 비활성은 DOM에 남는다 — 지우면 전환이 그려지지 않는다. 대신
`aria-hidden`으로 보조기술에서 지우고 `pointer-events: none`으로 클릭을 죽인다.

## Interaction and responsive behavior

화살표는 이전/다음, 점은 직접 이동. 자동 넘김은 `setInterval`이며 **현재 값에서 다음을 계산한다** —
활성 index를 타이머 의존성에 넣으면 넘길 때마다 타이머가 재시작해 간격이 들쭉날쭉해진다.

자동 넘김이 멈추는 경우가 셋이다.

1. **정지 버튼**을 누르면 멈춘다. 상태는 버튼이 소유하며 `aria-pressed`로 말한다.
2. 포인터가 위에 있거나 **초점이 안에 있으면** 멈춘다. 읽는 중에 글자가 바뀌지 않게 한다.
3. `prefers-reduced-motion: reduce`이면 **아예 돌지 않는다.** 느리게 도는 것은 답이 아니다.

2번을 `aria-pressed`에 반영하지 않는다. hover는 **의도가 아니라 부수효과**이고, 그것으로 상태를
흔들면 스크린 리더가 커서 움직임마다 상태를 읽는다.

## Content

제목은 한 줄을 넘길 수 있다. 설명은 최대 480px에서 접힌다. 워드마크는 **톤에 맞는 것 하나만**
싣는다 — 두 벌을 넣고 CSS로 감추면 보조기술이 둘 다 읽는다.

## Specification

값은 전부 배포본 실측이며 근거는 [`migration/figma-gap-registry.md`](../../migration/figma-gap-registry.md)의
명세표가 갖는다.

| 부위 | 값 |
| --- | --- |
| 컨테이너 반경 | `radius-card`(16) · `bleed="full"`은 0 |
| 슬라이드 전환 | `motion-crossfade-enter`(420) + `motion-zoom-settle`(680), 비활성 `scale(1.012)` |
| progressive blur | `blur(22px) saturate(125%)` + 위·아래 밴드 각 20%(`--louis-banner-blur-band`) |
| blur mask | 아래 `progressive-blur-mask`(to top) · 위 `progressive-blur-mask-block-start`(to bottom) |
| 콘텐츠 | `min(540px, 100%)` 가운데, padding `layout-section` / `media-inset` |
| 제목 · 설명 | `heading-md-medium` · `body-md-regular`(72%) |
| stagger | `motion-stagger-1/2/3`(40 · 80 · 150ms), 나갈 때 지연 0 |
| 컨트롤 | 하단 가운데, `space-control-lg`(16) 띄움, 간격 `space-control-sm`(8) |
| 컨트롤 `pill` | 우하단 `space-control-lg`(16), `radius-pill`, `media-control-surface`, `blur-panel` |
| 화살표 | 28×28, `media-control-foreground`, hover `media-control-hover` — `pill`에서만 그린다 |
| 인디케이터 | 30×2, 간격 `space-control-xs`(4), `radius-pill`, 탭 타깃 18(`::before` ∓8) |
| 인디케이터 색 | 쉼 `media-indicator-rest`(28%) · 활성 `media-indicator-active`, `motion-control-hover`(160) |
| 자동 넘김 | 5,500ms |

## 밝기가 상태다

세 칸의 폭이 같고 **활성 칸만 밝다**([DS-D-0033](../governance/decisions/DS-D-0033-brightness-is-state.md)).

그전에는 폭이 상태였다 — 7px 점이 활성일 때 20px로 늘었고, 그 근거가
[DS-D-0019](../governance/decisions/DS-D-0019-layout-change-motion.md)였다. 늘어난 칸은 옆 칸을
민다. 컨트롤이 우하단에 있을 때는 그 밀림이 오른쪽 끝에 고정된 알약 안에서 흡수됐지만, 컨트롤이
**하단 가운데**로 오면서 밀림이 곧 인디케이터 전체의 좌우 흔들림이 됐다 — 슬라이드가 바뀔 때마다
가운데축이 움직인다. 폭을 고정하고 밝기로 말하면 그 흔들림이 사라진다.

바뀌지 않은 것도 적어 둔다. **폭도 밝기도 보조기술은 읽지 않는다.** 그래서 `aria-selected`가
함께 상태를 갖는 계약은 그대로다 — 시각과 의미가 각자 자기 축으로 말하며, 어느 한쪽만으로는
계약이 성립하지 않는다.

막대가 2px라 **보이는 것이 곧 누를 수 있는 것이 아니다.** `::before`로 위아래 8px씩 넓혀 18px
타깃을 만든다. 옛 7px 점도 좁았지만 2px는 그보다 더 좁아서, 넓히지 않으면 폭 고정이 접근성
후퇴가 된다.

## Accessibility

- 영역은 `aria-roledescription="carousel"`과 `label`을 갖는다.
- 슬라이드는 `role="group"` · `aria-roledescription="slide"` · `"N / 전체"`.
- 비활성 슬라이드는 `aria-hidden`.
- 점은 `role="tab"` · `aria-selected` · `aria-current`.
- 화살표와 점은 `border-width-ring`로 focus를 표시한다.

## Known deviations

- **숫자 z-index를 쓰지 않는다.** 제품은 `z-1`·`z-2`·`z-3`을 쓴다. DS는 DOM 순서가 곧 칠 순서이며
  Dialog·ProjectCard가 같은 방식이다. 결과는 같다.
- **reduced-motion에서 progressive blur도 지운다.** 제품과 같다. 흐림 자체가 합성 부담이다.
- **정지 버튼이 있다. 제품에는 없다.** 자동으로 움직이는 것은 멈출 수 있어야 하고(WCAG 2.2.2),
  이 저장소는 제품의 과거 UI 부채를 공용 규범으로 복사하지 않는다. `controls="indicator"`에서도
  그린다 — 배치는 장식이고 정지는 계약이다. 그 결과 컨트롤 폭이 제품보다 36px 넓다
  (28 버튼 + 8 간격) — **의도적으로 다른 값**이다.
- **쉬는 인디케이터가 28%다. Figma 시안은 30%다.** 알파 사다리에 30이 없고 가장 가까운 칸이
  28이다([DS-D-0026](../governance/decisions/DS-D-0026-alpha-scale.md)). 2pp 차이는 2px 막대에서
  보이지 않으며, 사다리를 벗어나 새 원시값을 내는 것이 더 큰 비용이다.

## Acceptance tests

실브라우저에서 `packages/react/test/banner-carousel.browser.test.tsx`가 확인한다.

1. 인디케이터 세 칸의 폭이 모두 30px · 높이 2px이고, 쉬는 칸만 알파 0.28이다.
2. `aria-selected`와 `aria-current`가 밝기와 함께 상태를 갖는다.
3. 비활성 슬라이드가 DOM에 남고 `aria-hidden`이며 `pointer-events: none`이다.
4. 톤 색이 라이트와 다크에서 같다.
5. 화살표(`controls="pill"`)와 인디케이터가 슬라이드를 바꾼다.
6. 슬라이드가 하나면 컨트롤을 그리지 않는다.
7. `bleed="full"`이면 반경이 0이다.
8. 모션이 문맥에 따라 갈린다 — 기본에서 인디케이터 160ms · 슬라이드 420/680ms, reduced-motion에서 0.
9. 정지 버튼이 `aria-pressed`와 라벨을 함께 바꾼다.
10. `autoAdvanceMs={0}`이면 정지 버튼을 그리지 않는다 — 멈출 것이 없는 버튼은 거짓말이다.
11. 배경에 스크림이 없다 — `background-image`가 사진 한 겹이다.
12. 흐림이 한 층이다 — `::after`에 `backdrop-filter`가 없어 제목 위에 칠해질 자리가 없다.
13. 흐림 밴드가 위·아래 20%이고 가운데는 걸리지 않는다(reduced-motion에서는 밴드 자체가 없다).
14. 2px 막대의 탭 타깃이 위아래로 8px씩 넓다.
15. 컨트롤이 배너 가운데축 위에 있고 하단에서 16px 띄며, 투명한 띠가 클릭을 훔치지 않는다.
16. 본문이 좌우 같은 여백으로 가운데 선다.
17. `controls="pill"`이 화살표 둘과 알약 면을 되살리고 우하단으로 돌아간다.
