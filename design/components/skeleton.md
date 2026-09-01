---
id: skeleton
status: experimental
authority: normative
summary: 아직 오지 않은 내용의 자리를 지킵니다.
---

# Skeleton

아직 오지 않은 내용의 자리를 지킨다.

## Availability

| Surface       | 상태           | 근거                                                                 |
| ------------- | -------------- | -------------------------------------------------------------------- |
| Web           | `partial`      | public export와 실브라우저 acceptance test 6건이 두 motion context에서 각각 돈다; visual regression, Figma component와 제품 소비 증거 없음 |
| Figma         | `partial`      | component set 3 shape(text·block·circle). Figma는 흐름을 표현하지 못해 정지 상태만 그린다; publish 전 |
| Documentation | `done`         | 이 문서                                                              |
| Maturity      | `experimental` | 규범과 구현이 같은 변경 단위에서 처음 선다                           |

## 면 색을 고르지 않는다

**이것이 이 컴포넌트의 핵심 판정이다.**

제품 실측(2026-08-18) — 면은 `rgb(var(--gray-000-rgb) / 8%)`, 하이라이트는 같은 색의 9%
그라디언트다. `--gray-000`은 **전경색**이고 테마마다 뒤집히므로 **제품은 테마별 면을 고른 적이
없다.** 알파는 어느 배경 위에서도 성립한다.

실행 인계서 (1c)가 "면 색이 문제다 — `background-inset`은 다크에서, `background-raised`는
라이트에서 죽는다"고 적어 두었는데, 그 문장은 **스켈레톤에 solid 면 토큰이 필요하다는 전제** 위에
있었다. 실측이 그 전제를 부정한다. **고를 면이 없으므로 죽을 조합도 없다.**

[Spinner](spinner.md)의 트랙(`currentcolor 22%`)과 [Project Card](project-card.md)의 스크림이
이미 같은 판단을 하고 있다 — 색 토큰을 넣으면 테마 축이 하나 더 생기고, 놓이는 자리마다 달라지는
값은 토큰이 될 수 없다.

## When to use

- 곧 올 내용의 **모양이 이미 정해져 있을 때.** 목록 행, 카드 격자, 프로필 머리.
- 기다림이 **한 호흡을 넘을 때.** 그보다 짧으면 깜빡임만 남는다.

쓰지 않는 자리.

- 진행률을 알 수 있을 때. 그것은 determinate progress이며 아직 카탈로그에 없다.
- 모양을 모를 때. 그때는 [Spinner](spinner.md)다.
- 내용이 비어 있는 것이 **결과**일 때. 그것은 [Empty State](empty-state.md)다.

## API

```tsx
<Skeleton shape="circle" style={{ inlineSize: 28, blockSize: 28 }} />
<Skeleton shape="text" style={{ inlineSize: "60%" }} />
```

**크기는 호출부가 정한다.** 자리표시가 대신할 것의 크기는 그 자리마다 다르므로 컴포넌트가 정할
수 없다.

## Anatomy

부품이 없다. 한 요소가 면과 흐름을 함께 갖는다 — 덧댄 층을 두지 않는 이유는 아래 흐름 절에 있다.

## Properties

| prop | 값 | 기본 | 뜻 |
| --- | --- | --- | --- |
| `shape` | `block` \| `text` \| `circle` | `block` | 반경과 기본 높이 |

나머지는 `<span>`의 네이티브 속성을 그대로 받는다. 크기는 `style`이나 `className`으로 준다.

## Hierarchy와 variants

강조 축이 없다. 자리표시는 서로 경쟁하지 않는다.

## States

상태 축이 없다. 대화형이 아니고 hover·focus·disabled를 갖지 않는다 — 스켈레톤은 **읽히지도
눌리지도 않는다.** 면은 놓이는 자리의 글자색을 물으므로 테마 축도 갖지 않는다.

## Interaction and responsive behavior

- 크기는 호출부가 정한다. 폭을 `%`로 주면 부모를 따라 늘고 준다.
- 흐름은 요소 폭에 비례한다(`background-size: 200%`). 넓은 자리에서 더 오래 가로지르는 것이
  자연스럽다.
- reduced-motion에서 흐름이 사라진다.

## Content

내용이 없다. 다만 **몇 개를 놓을지는 내용의 문제다.**

- 목록이면 **실제로 올 개수만큼** 놓는다. 세 개가 올 자리에 여덟을 놓으면 도착했을 때 화면이
  줄어든다.
- 글자 줄은 **마지막 줄을 짧게** 한다. 문단이 그렇게 생겼기 때문이며, 폭은 호출부가 준다.
- 모양을 모르면 스켈레톤이 아니라 [Spinner](spinner.md)다. 틀린 자리표시는 없는 것보다 나쁘다.

## Specification

| 축 | 값 | 근거 |
| --- | --- | --- |
| 면 | `currentcolor` 8% | 제품 값 그대로 |
| 하이라이트 | `currentcolor` 9% | 제품 값 그대로 |
| 반경 | `radius-control-sm` 8px (`circle`은 `radius-pill`) | — |
| `text` 높이 | `16px` 리터럴 | Figma·기록·제품 셋이 16이다 — 아래 Known deviations 1번 |
| 흐름 | `motion-shimmer` 1600ms | 아래 |

## 흐름은 `background-position`이다

덧댄 층을 `transform: translateX`로 미는 방법도 있지만 loop lifecycle의 허용 property는
`opacity`·`rotate`·`background-position` 셋이다([DS-D-0016](../governance/decisions/DS-D-0016-loop-motion.md)).
제품의 우세 기법도 면 그라디언트의 `background-position` 이동이라 둘이 같은 곳을 가리킨다 —
**층을 하나 덜 만든다.**

reduced-motion에서 loop는 짧아지는 것이 아니라 **사라진다.** 자리표시라는 뜻은 면과
`aria-hidden`이 유지하며 움직임이 그 뜻을 만드는 것이 아니다.

## Accessibility

**읽히지 않는다.** `aria-hidden`이다. 로딩을 알리는 것은 이 요소가 아니라 그것을 감싸는 영역의
`aria-busy` 또는 live region의 일이다 — 스켈레톤마다 읽히면 소음이 된다. [Loading](../patterns/loading.md)
패턴이 그 경계를 소유한다.

## 제품 실측 — 차트 스켈레톤

**이 컴포넌트의 Anatomy는 단일 프리미티브다.** 제품의 분석 대시보드는 그것으로 안 되는 자리를
갖는다 — **차트 모양을 미리 보여 주는 스켈레톤**이다. 값을 지어내지 않도록 적어 둔다.

| 층 | 값 |
| --- | --- |
| 판 | `position: absolute` · `inset: 12px 0` · 곡률 `8px` · 면 `var(--skeleton-surface)` |
| 영역 | `position: absolute` · `inset: 0` · 곡률 `12px` · `overflow: hidden` |
| 영역 배경 1 | 세로 그라디언트 `180deg` — `--skeleton-grad-top` → `--skeleton-grad-bot`, 크기 `100% 100%` |
| 영역 배경 2 | **점 격자** — radial-gradient, 크기 `20px 20px`, 위치 가운데 |
| 영역 모션 | `dashboardSkeletonFade 2s ease-in-out infinite` |
| 파형 (`::after`) | 높이 `62%` · 곡률 `12px 12px 8px 8px` · `--skeleton-wave-peak` → `transparent` |
| 파형 모양 | **`clip-path: polygon(…)`** — 7점 꺾은선이 차트 실루엣을 만든다 |

**파형은 그림이 아니라 `clip-path`다.** 그라디언트 사각형을 꺾은선으로 잘라 낸다 — Figma로 옮길
때는 같은 좌표의 다각형 마스크로 그려야 하고, 이미지를 넣으면 색이 테마를 안 따라간다.

**단일 프리미티브와 모션이 다르다.** 프리미티브는 `dashboardSkeletonPulse 1.6s
cubic-bezier(0.4, 0, 0.2, 1) infinite`이고 차트 영역은 `2s ease-in-out`이다. 두 리듬이 한 화면에서
같이 돈다.

근거: `components/scenes/analytics/shared.tsx:163-169`(프리미티브) · `:249`(판) ·
`:252-262`(영역과 파형).

### 이 자리에 감소-모션 분기가 없다

**분석 대시보드 파일 전체에 `motion-reduce`가 0건인데 애니메이션 선언은 5개이고 그중 셋이
무한 반복이다.** 프리미티브 스켈레톤(`skeleton.css`)이 갖는 감소-모션 계약이 여기에는 없다.

**옮길 때 이 상태를 그대로 재현하지 마라.** [Motion](../foundations/motion.md)의 감소-모션 계약이
DS 쪽 정본이고, 제품의 이 자리는 **결함으로 기록한다.**

같은 파일에서 하나 더 나왔다 — `dashboardAreaBreathe`(3.6s ease-in-out infinite)는 **`@keyframes`
정의가 없다.** 선언은 있는데 재생되지 않는다. 없는 애니메이션을 Figma에 그리면 배포본에 없는
움직임이 생긴다.

## Known deviations

- **알파 값이 제품 안에서도 한 값이 아니다.** 실측한 자리는 8%/9%였고 다른 자리는 다를 수 있다.
  한 값으로 고정한 이유는 자리표시의 진하기가 화면마다 달라야 할 근거가 없기 때문이다.
- **흐름이 `background-position` 애니메이션이라 Figma에서는 정지 상태만 표현된다.** component
  set 자체는 있다 — 위 Availability 표대로 `text`·`block`·`circle` 세 마스터를 가진 세트다.
  (2026-08-30 정정: 이 자리에 「Figma component set이 없다」고 적혀 있었고 같은 문서 Availability
  표와 정면으로 어긋났다. 세트는 `figma/readback.json`의 `components.Skeleton`에 세 shape로
  들어 있다.)
- **Figma는 `currentColor`를 표현하지 못한다.** 문서용으로 `fg-primary` 8%를 쓴다. 실제로는 놓이는
  자리의 글자색이 된다 — 위 「면 색을 고르지 않는다」가 정본이고 Figma 값은 그 대역이다.
  [Spinner](spinner.md)의 Known deviations가 같은 편차를 같은 이유로 적는다.
- **`text` 높이가 행간에서 파생되지 않는다 — 그 사유를 폐기했다(2026-09-01).** 여기는
  `block-size: var(--louis-typography-body-sm-regular-line-height)` 였고, 그 토큰이 단위 없는
  `1.5`라 `block-size`로는 타입이 맞지 않아 선언이 통째로 버려졌다. 규칙 본문에 다른 높이가 없어
  브라우저는 빈 div의 **0px**을 그렸다(실측 `blockSize:"0px"`). [Alert](alert.md)의 아이콘 광학
  정렬이 같은 함정에 빠졌던 자리이고 거기서는 글자 크기를 곱해 길이로 닫았는데, 여기서는 그
  수선을 쓰지 않았다 — 닫으면 14 × 1.5 = **21px**인데 세 곳의 기록이 전부 16이기 때문이다
  (`figma/readback.json`의 `Skeleton.geometry.text.height` · `figma/components.measured.json`의
  `skeleton.sizes.text.height` · 제품의 작은 스켈레톤 줄 `h-8` = 16px,
  `components/scenes/analytics/shared.tsx:187`). 사유 문장이 기록과 맞은 적이 없었고 무효 선언이
  그것을 가리고 있었다. 16을 리터럴로 적는다 — 값이 같은 토큰은 여럿 있지만 어느 것도 「글자 한
  줄이 차지하는 높이」를 뜻하지 않는다.
- **텍스트 여러 줄 묶음이 없다.** 마지막 줄을 짧게 하는 것은 호출부가 `inline-size`로 정한다.

## Acceptance tests

1. 면이 **놓이는 자리의 글자색을 따라간다** — 부모 `color`를 바꾸면 면 색이 바뀐다.
2. 면이 반투명하다(알파 < 0.5).
3. **light·dark 두 테마 모두에서** 면이 배경과 다르고 투명하지 않다.
4. 흐름이 공용 `louis-shimmer` keyframe이고 `motion-shimmer` 토큰을 쓰며 **`transform`을 쓰지 않는다.**
5. reduced-motion에서 duration이 reduced 토큰이 되고 반복이 1회가 된다.
6. 모양 셋의 반경이 계약과 같다.
7. **`text`의 기본 높이가 계약과 같다** — 인라인 `blockSize` 없이 잰다. 다른 케이스들이 전부
   인라인 높이를 주고 있어서 이 축만 가려져 있었다.
8. `aria-hidden`이다.
