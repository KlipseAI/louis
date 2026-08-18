---
id: banner-carousel
status: experimental
authority: normative
---

# Banner Carousel

허브 화면 최상단에서 사진 배너 몇 장을 돌려 보여 준다.

## Availability

| Surface       | 상태           | 근거                                                                 |
| ------------- | -------------- | -------------------------------------------------------------------- |
| Web           | `partial`      | public export와 실브라우저 acceptance test 8건이 두 motion context에서 각각 돈다; visual regression, Figma component와 제품 소비 증거 없음 |
| Figma         | `partial`      | component set 4 variant(Tone × Bleed)에 기하 계약이 붙었고 parity가 매 실행 대조한다; publish 전 |
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
  autoAdvanceMs={5500}
/>
```

## Anatomy

컨테이너 → 슬라이드(배경 · 스크림 · progressive blur · 콘텐츠) → 컨트롤(화살표 · 점 · 화살표).

## Properties

| Prop | 값 | 뜻 |
| --- | --- | --- |
| `slides` | `BannerCarouselSlide[]` | 비면 아무것도 그리지 않는다 |
| `label` | `string` | **필수.** 영역 자체의 이름 |
| `bleed` | `boxed`(기본) · `full` | 카드 반경 또는 각지게 |
| `autoAdvanceMs` | `number`(기본 5500) | `0`이면 넘기지 않는다 |
| `index` · `onIndexChange` | `number` · `(n) => void` | 제어 모드 |

`label`이 필수인 이유는 **제목이 슬라이드마다 바뀌기 때문**이다. 영역의 이름이 없으면 스크린
리더에서 "무엇의 1/3인지" 알 수 없다.

## Hierarchy와 variants

variant 축은 `bleed` 하나다. 톤은 variant가 아니라 **슬라이드마다 다른 데이터**다.

## States

슬라이드는 활성/비활성 둘. 비활성은 DOM에 남는다 — 지우면 전환이 그려지지 않는다. 대신
`aria-hidden`으로 보조기술에서 지우고 `pointer-events: none`으로 클릭을 죽인다.

## Interaction and responsive behavior

화살표는 이전/다음, 점은 직접 이동. 자동 넘김은 `setInterval`이며 **현재 값에서 다음을 계산한다** —
활성 index를 타이머 의존성에 넣으면 넘길 때마다 타이머가 재시작해 간격이 들쭉날쭉해진다.

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
| progressive blur | `blur(22px) saturate(125%)` + 5스톱 mask |
| 콘텐츠 | `min(540px, 100%)`, padding `layout-section` / `media-inset` |
| 제목 · 설명 | `heading-md-medium` · `body-md-regular`(72%) |
| stagger | `motion-stagger-1/2/3`(40 · 80 · 150ms), 나갈 때 지연 0 |
| 컨트롤 | `radius-pill`, `media-control-surface`, `blur-panel` |
| 화살표 | 28×28, `media-control-foreground`, hover `media-control-hover` |
| 점 | 7px, 활성 폭 20px, `motion-layout-change`(220) |
| 자동 넘김 | 5,500ms |

## 폭이 상태다

점에는 라벨이 없어 **폭 말고 현재 위치를 말하는 것이 없다**([DS-D-0019](../governance/decisions/DS-D-0019-layout-change-motion.md)).
`scale`로 늘리면 두께와 반경까지 함께 늘어나 7px 알약이 20px 자리에서 찌그러진다.

그런데 **폭은 보조기술이 읽지 않는다.** 그래서 `aria-selected`가 함께 상태를 갖는다 — 시각과
의미가 각자 자기 축으로 말하며, 어느 한쪽만으로는 계약이 성립하지 않는다.

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
- 자동 넘김이 **포커스나 hover에서 멈추지 않는다.** 제품도 멈추지 않는다. WCAG 2.2.2를 만족하려면
  멈춤 수단이 필요하며, 제품 값을 그대로 옮긴 상태라 **이것은 해소되지 않은 접근성 결함**이다.
  다음 변경 단위에서 정지 버튼 또는 hover 일시정지를 판정한다.

## Acceptance tests

실브라우저에서 `packages/react/test/banner-carousel.browser.test.tsx`가 확인한다.

1. 점의 활성 폭 20px · 비활성 7px, 높이는 둘 다 7px.
2. `aria-selected`와 `aria-current`가 폭과 함께 상태를 갖는다.
3. 비활성 슬라이드가 DOM에 남고 `aria-hidden`이며 `pointer-events: none`이다.
4. 톤 색이 라이트와 다크에서 같다.
5. 화살표와 점이 슬라이드를 바꾼다.
6. 슬라이드가 하나면 컨트롤을 그리지 않는다.
7. `bleed="full"`이면 반경이 0이다.
8. 모션이 문맥에 따라 갈린다 — 기본에서 점 220ms · 슬라이드 420/680ms, reduced-motion에서 0.
