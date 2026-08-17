---
id: spinner
status: experimental
authority: normative
---

# Spinner

끝나는 시점을 모르는 작업이 진행 중임을 알린다.

제품의 로딩 표현은 약 **62벌**이다 — 회전 링 22, 스켈레톤 15, 텍스트 쉬머 11, 진행률 5, 그 외.
gap registry가 적은 "레시피 5종 · Skeleton 0종"은 둘 다 틀렸다. 회전 keyframe 이름은 **18개인데
본문은 전부 `to { rotate: 360deg }` 한 종류**다.

**다만 이번에는 정본이 뚜렷하다.** 공용 `LoadingSpinner`가 있고 그 recipe가 700ms · linear로
[DS-D-0016](../governance/decisions/DS-D-0016-loop-motion.md)이 세운 `motion-loop`와 정확히 같다.
링 구조도 그대로 옮겼다.

## Availability

| Surface       | 상태           | 근거                                                          |
| ------------- | -------------- | -------------------------------------------------------------- |
| Web           | `partial`      | public export와 실브라우저 acceptance test 8건이 두 motion context에서 각각 돈다 |
| Figma         | `partial`      | component set 2 variant(Size). parity 게이트가 Track·Arc를 자손으로 대조한다. publish는 DS-F-008 |
| Documentation | `done`         | 이 문서                                                        |
| Maturity      | `experimental` | 규범과 구현이 같은 변경 단위에서 처음 선다                     |

## When to use

- 끝나는 시점을 **모르는** 작업 — 서버 응답 대기, 업로드 시작 전 준비.
- 버튼이나 행 안에서 그 자리의 작업이 진행 중임을 표시할 때.

쓰지 않는 자리.

- **진행률을 아는 작업.** 회전 주기는 진행률이 아니라 한 바퀴의 시간이며 얼마나 남았는지에 대해
  아무것도 말하지 않는다([motion.md](../foundations/motion.md)의 Loop 절). 아는 값이 있으면
  determinate 표시를 쓴다.
- **자리가 정해진 콘텐츠가 곧 올 때.** 그것은 스켈레톤이며 다른 컴포넌트다.

## API

```tsx
<Spinner label="불러오는 중" />
<Spinner size="sm" label="저장 중" />

{/* 부모가 이미 알리고 있을 때는 장식이다 */}
<span aria-busy="true">생성 중 <Spinner /></span>
```

## Anatomy

1. **Root** — `<span>`. 색을 물려받고 접근성 역할을 소유한다.
2. **Ring** — 회전하는 원. 링이 **둘**이다.
   - 트랙 — 네 변이 모두 칠해진 흐린 원
   - 진행 — 위쪽 한 조각만 칠해진 원

**링을 root와 분리한 이유.** root가 회전하면 그 안에 넣은 텍스트나 슬롯이 함께 돈다.

**트랙이 있는 이유.** 없으면 회전하는 조각이 어디를 도는지 보이지 않아 "무언가 깜빡인다"로 읽힌다.
이전 DS의 spinner는 트랙 없이 위쪽 테두리만 비웠고, 그것은 제품과 다른 표현이었으며 편차로 선언된
적도 없었다.

## Properties

| prop | 값 | 기본 | 뜻 |
| --- | --- | --- | --- |
| `size` | `md` \| `sm` | `md` | 16px / 12px |
| `label` | string | 없음 | 읽히는 이름. **있으면 알리고 없으면 숨는다** |

**`label`에 기본값을 두지 않는다.** 제품에는 `aria-label="Loading"`이 하드코딩된 자리가 있는데,
DS가 기본 문자열을 배포하면 그 하드코딩을 시스템 전체로 퍼뜨리는 셈이 된다. 문구는 i18n을 가진
호출부가 소유한다.

## Hierarchy와 variants

tone 축이 없다. **색을 물려받는다** — 버튼 안에서는 버튼 글자색, 본문에서는 본문 색이 된다.
spinner에 semantic 색을 고정하면 놓이는 자리마다 어긋난다.

## States

상태 축이 **없다.** 대화형이 아니다.

## Interaction and responsive behavior

- 회전은 700ms 등속이다. 가감속이 붙으면 회전이 맥박처럼 뛰어 "진행 중"이 아니라 "잘못됨"으로
  읽힌다. `linear`는 제품의 회전 22벌이 **전수 일치하는 유일한 축**이다.
- **`prefers-reduced-motion`에서 회전이 멈춘다.** 짧아지는 것이 아니라 사라진다 — `0ms`짜리
  애니메이션을 무한 반복하는 것은 성립하지 않는다. 그때도 진행 중이라는 의미는 `role="status"`와
  `aria-busy`가 유지한다.

## Content

- `label`은 **무엇이 진행 중인지** 말한다. "로딩"이 아니라 "불러오는 중", "저장 중".
- 문구 끝에 말줄임표를 붙이지 않는다. 스크린 리더가 점을 읽는다.

## Accessibility

- `label`이 있으면 `role="status"` · `aria-live="polite"` · `aria-busy="true"` · `aria-label`.
- `label`이 없으면 `aria-hidden="true"`. 라벨을 가진 부모가 이미 진행을 알리고 있을 때 쓴다 —
  그 자리에서 spinner가 또 알리면 스크린 리더가 같은 사실을 두 번 읽는다.
- **reduced-motion에서 회전이 멈춰도 위 두 계약은 그대로다.** 그것이 loop의 reduce 대체다.

## Specification

| 축 | md | sm | 토큰 |
| --- | ---: | ---: | --- |
| 지름 | 16px | 12px | — |
| 링 두께 | 2px | 1px | `border-width-ring` / 그 절반 |
| 주기 | 700ms | 700ms | `motion-loop` |
| easing | linear | linear | `motion-loop` |
| 트랙 | 현재 색 22% | 같음 | — |
| 진행 | 현재 색 | 같음 | — |

**지름을 토큰으로 만들지 않은 이유**는 두 값이 이 컴포넌트에만 있기 때문이다.
[spacing-radius.md](../foundations/spacing-radius.md)가 "두 개 이상의 사용처"를 승격 조건으로 둔다.
`icon-size-sm`이 16px이지만 spinner는 아이콘이 아니라 값이 우연히 같을 뿐이며, 한쪽이 움직일 때
다른 쪽이 따라갈 이유가 없다.

**sm의 링을 `calc(ring / 2)`로 적은 이유.** 12px 원에 2px 링을 두르면 가운데가 거의 남지 않는다.
리터럴 1px 대신 관계로 적으면 `border-width-ring`이 움직일 때 함께 따라온다.

## Effects

없다.

## Implementation

- 회전 keyframe은 `base.css`의 **공용 `kds-spin` 하나**다. Button·Menu·Spinner가 같은 것을
  가리킨다. 제품이 이름 18개에 본문 1종을 가진 것과 같은 중복이 이 저장소에도 둘 있었고,
  이 컴포넌트를 세우면서 합쳤다.
- `transform: rotate()`가 아니라 개별 속성 `rotate`다. motion.md의 Loop 절이 그것을 허용
  property로 선언했으며 `scale`·`translate`와 합성된다.
- 트랙 색은 `color-mix(in srgb, currentcolor 22%, transparent)`다. semantic 색 토큰으로 표현되지
  않는다 — `currentColor`에 달려 있고 그것은 놓이는 자리마다 다르다.

## Known deviations

- **크기 토큰이 없다.** 위 Specification의 사유대로 승격 조건을 만족하지 않는다.
- **determinate 진행률을 다루지 않는다.** 제품의 진행률 표시 2벌은 두께·색·전환이 셋 다 다르고,
  `role="progressbar"`는 저장소 전체에 **1곳**뿐이며 `<progress>` 요소는 **0곳**이다. 별도
  컴포넌트이며 아직 없다.
- **스켈레톤과 텍스트 쉬머를 다루지 않는다.** 제품에 각각 15벌·11벌 있다. 같은 loop lifecycle을
  쓰되 축이 다르다.
- **Figma는 링을 채운 arc 밴드로 그린다.** CSS는 두 겹의 `border`인데 Figma에는 "테두리 한 변만
  칠하기"가 없다. stroke로 그리면 `innerRadius: 0`인 파이 조각의 외곽선(중심으로 가는 반지름 두
  줄)이 함께 그려진다 — 실측으로 확인하고 fill + `innerRadius`로 바꿨다. 결과는 같고 표현이 다르다.
- **Figma는 `currentColor`를 표현하지 못한다.** 문서용으로 `foreground-primary`를 쓴다. 실제로는
  놓이는 자리의 글자색이 된다.
- **제품의 공용 `LoadingSpinner`에는 `prefers-reduced-motion` 처리가 없다.** 비공용 정의 중 일부는
  갖고 있다. 공용을 그대로 승격하면 그 결함이 시스템 전체로 퍼지므로 여기서는 넣었다.

## Acceptance tests

1. md/sm의 지름과 링 두께가 `components.measured.json`과 같고, 폭과 높이가 같다(정원).
2. 링이 둘이며 트랙은 네 변이 칠해지고 진행은 위쪽 한 조각만 칠해진다.
3. 트랙 색이 진행 색과 다르다(같은 색의 흐린 것이다).
4. 색을 물려받는다 — 부모의 `color`가 진행 색이 된다.
5. `animation-duration`·`timing-function`이 `motion-loop`에서 오고 `animation-name`이 공용
   `kds-spin`이다.
6. reduced-motion에서 `animation-iteration-count`가 `1`이고, 그때도 `role="status"`와
   `aria-busy="true"`가 그대로다.
7. `label`이 없으면 `aria-hidden="true"`이고 role·live·busy가 모두 없다.
8. 기본 라벨 문자열을 배포하지 않는다.
