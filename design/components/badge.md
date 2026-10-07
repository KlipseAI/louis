---
id: badge
status: experimental
authority: normative
summary: 상태나 분류를 한 조각의 라벨로 붙입니다.
---

# Badge

한 조각의 상태나 분류를 라벨로 붙인다.

제품에 배지 계열 정의가 **65벌** 있고 공용 구현은 0이다. 기하가 흩어져 단일 정본이 없다 —
반경 7갈래(999·12·10·8·6·5·4), 세로 여백 7갈래(0·1·1.5·2·3·4·6).

**gap registry가 적은 "톤 4 + 상태 5"는 둘 다 틀렸다.**

- "톤 4"는 `InspectorPill`의 tone prop 네 갈래를 센 것인데, **네 톤 클래스의 선언이 바이트 단위로
  같다.** 축이 죽어 있다.
- "상태 5"는 하이라이트 히스토리 카드만 맞다. 그것을 복제한 비디오 에디터는 3개뿐이고, 앱 홈의
  4변형은 **네 색이 전부 `var(--gray-400)`로 같다.** 여기도 축이 죽어 있다.
- 제품 전체의 실제 톤 값은 최소 11종이다.

## Availability

| Surface       | 상태           | 근거                                                          |
| ------------- | -------------- | -------------------------------------------------------------- |
| Web           | `partial`      | public export와 실브라우저 acceptance test 7건; visual regression과 제품 소비 증거 없음 |
| Figma         | `done`      | component set(Tone). 계약이 모든 property 를 pin 하고 Label 을 자손으로 대조한다. 기하는 양방향이다 — `badge.browser.test.tsx` 가 코드 쪽에서 같은 실측을 되잰다. 게시 없이 판정한다([DS-D-0035](../governance/decisions/DS-D-0035-figma-done-without-publish.md)) |
| Documentation | `done`         | 이 문서                                                        |
| Maturity      | `experimental` | 규범과 구현이 같은 변경 단위에서 처음 선다                     |

## When to use

- 항목 하나의 **상태**를 옆에 붙일 때 — 완료, 실패, 처리 중.
- 항목의 **분류**를 한 단어로 표시할 때 — 공개 범위, 플랜, 종류.

**목록 · 표의 상태 칸에서는 예외만 배지다(2026-10-07, 소유자).** 행마다 상태가 하나씩 붙는 목록에서 평소 값(공개 · 결제 완료 ·
진행 중)은 `caption` 크기의 `fg-secondary` 글자로 두고, **손이 가야 하는 예외**(숨김 · 초안 · 환불 · 실패 · 처리 대기)만 배지로
세운다. 모든 행이 알약이면 찾아야 할 줄이 오히려 흐려진다 — 제품 어드민 아홉 화면이 이 규칙으로 바뀌었다(작업 브랜치
`feat/admin-ops-review` 의 `AdminStatus`). 상세 화면처럼 상태가 하나만 놓이는 자리는 평소 값도 배지다.

쓰지 않는 자리.

- **누를 수 있어야 할 때.** 그것은 Button이거나 Chip이며 다른 컴포넌트다. 배지는 대화형이 아니다.
- **증감률과 개수.** 제품은 그것을 알약(999px)으로 그리고 상태 어휘를 갖지 않는다. 관리자 5벌과
  대시보드 6벌이 그 무리이며 **별도 컴포넌트**다. 여기 축으로 접지 않았다.
- 긴 설명. 배지는 한 줄로 잘린다.

## API

```tsx
<Badge tone="success">완료</Badge>
<Badge tone="danger" icon={<IconXCircle />}>실패</Badge>
<Badge tone="warning" dot>처리 중</Badge>
<Badge>초안</Badge>
```

## Anatomy

1. **Root** — `<span>`. 면·글자·반경을 소유한다.
2. **Icon** 또는 **Dot** — 선택. 라벨 앞에 온다. 크기가 글자를 따라간다.
3. **Label** — 자식 텍스트. 한 줄로 잘린다.

## Properties

| prop | 값 | 기본 | 뜻 |
| --- | --- | --- | --- |
| `tone` | `neutral` \| `success` \| `warning` \| `danger` \| `info` | `neutral` | 의미 축 |
| `icon` | ReactNode | 없음 | 라벨 앞 아이콘(`1em`) |
| `dot` | boolean | `false` | 라벨 앞 점(`0.5em`). `icon`이 있으면 무시된다 |

**기본이 `neutral`인 이유.** 상태가 없는 배지가 다수다(분류·개수 라벨). 색을 기본값으로 두면 아무
뜻도 없는 곳에 의미가 붙는다.

## Hierarchy와 variants

`tone`이 유일한 축이다. 제품의 상태 어휘는 최소 17벌이고 화면마다 다른데, 그것을 그대로 옮기면
DS가 제품의 도메인을 떠안는다. **네 상태 + 중립으로 접고**, 어느 도메인 값이 어느 tone인지는
호출부가 정한다.

크기 축이 없다. 배지는 이미 가장 작은 단위이고, 제품의 높이 분포(19·22·26px)는 크기 단계가 아니라
서로 다른 무리의 값이다.

## States

상태 축이 **없다.** 배지는 대화형이 아니라 hover·focus·press를 갖지 않는다. `tone`이 variant
축이고 각 tone은 하나의 표현만 갖는다.

## Interaction and responsive behavior

- 폭은 라벨이 정한다. 자리가 모자라면 말줄임으로 잘리고 **높이는 유지된다** — 배지가 두 줄이 되면
  그것이 놓인 행의 높이가 흔들린다.
- 44px hit target 규범의 대상이 **아니다.** 그것은 누를 수 있는 것의 계약이다.

## Content

- 라벨은 **한 단어 또는 짧은 명사구**다. "완료"이지 "처리가 완료되었습니다"가 아니다.
- **색이 유일한 신호가 되지 않게 라벨이 상태를 말해야 한다.** 초록 배지에 "완료"라고 쓰는 것이지
  초록만으로 완료를 뜻하게 하지 않는다. 색각 이상에서 tone은 전달되지 않는다.
- 같은 상태를 화면마다 다르게 부르지 않는다. 제품은 "완료"를 done·completed·finished로 부르는
  자리가 갈려 있다.

## Accessibility

- **아이콘과 점은 `aria-hidden`이다.** 라벨이 말하는 것을 반복하는 장식이다.
- 배지에 `role`을 주지 않는다. 상태가 **바뀌는 것을 알려야 한다면** 그것은 배지가 아니라 그
  배지를 감싼 live region의 일이다.
- tone은 색만 바꾸므로 위 Content의 규칙이 접근성 계약의 일부다.

## Specification

| 축 | 값 | 토큰 |
| --- | ---: | --- |
| 높이 | 26px | (여백 4+4 + 행간 18) |
| 세로 여백 | 4px | `space-control-xs` |
| 좌우 여백 | 8px | `space-control-sm` |
| 아이콘·점 간격 | 4px | `space-control-xs` |
| 반경 | 8px | `radius-control-sm` |
| 타이포 | 12/1.5 | `typography-caption-regular` |
| 아이콘 | `1em` | — |
| 점 | `0.5em` | — |
| 테두리 | 없음 | — |

**이 기하를 고른 이유.** 상태 배지의 대표는 하이라이트 히스토리 카드의 것이고
(`highlightSceneStyles.ts:764`), 그 여백 4/8px과 반경 8px이 **기존 토큰에 정확히 맞는다.**
gap registry가 "가장 복잡한" 것으로 지목한 배지이며 비디오 에디터가 그것을 복제해 두 벌이 같다.
새 토큰이 하나도 필요하지 않았다.

아이콘을 `1em`으로 둔 이유는 [iconography.md](../foundations/iconography.md)가 12px을 "4px 격자
밖"이라며 거부해 두었기 때문이다. 글자를 따라가게 하면 그 판정을 다시 열지 않아도 된다.

## Effects

없다.

## Implementation

- 면과 글자를 짝지은 `color-bg-{tone}`·`color-fg-{tone}` 토큰을 쓴다. 네 쌍은 `contrastPairs`에 `minimum 4.5`로
  선언돼 있고 실측 대비는 9.55~11.98이다. 톤이 없는 기본 배지의 `color-fg-secondary` /
  `color-bg-inset`(light 8.15 · dark 7.93)도 2026-09-13부터 같은 게이트가 잰다.
- 테두리 축을 열지 않는다. tone마다 border 토큰이 필요한데 `color-stroke-danger` 하나만 있고
  나머지 셋에는 대응이 없다.

## Known deviations

- **면을 칠하는 방식이 제품과 다르다.** 제품의 상태 배지는 다섯 상태의 **면이 전부 `gray-800`으로
  같고 글자색만 갈린다.** 게다가 light/dark 값이 같아 밝은 테마에서도 어두운 배지가 뜬다. 여기서는
  면과 글자를 짝지어, 색각 이상에서 글자색 하나에 기대지 않고 두 값이 게이트에 묶이게 했다.
- **배지 면이 페이지 면과 명도로는 거의 구별되지 않는다.** 실측 대비는 light에서
  `background-surface` 대비 1.03~1.14, dark에서 1.02~1.23이다.
  [color-theme.md](../foundations/color-theme.md)가 의미 있는 비텍스트 그래픽에 3:1을 요구하지만,
  **배지의 의미를 나르는 것은 면이 아니라 라벨(11:1)**이고 면은 색상(hue) 차이로 보인다. 명도
  대비를 3:1로 올리면 톤이 배지가 아니라 경고처럼 보인다. 수용하고 여기 적는다.
- **`contrastPairs`에 면 대 면 축이 아예 없다.** 선언된 쌍은 전부 글자 대 면이다. 위 수치는
  게이트가 계산하지 않으며, 그 결손은 이 컴포넌트가 만든 것이 아니라 드러낸 것이다.
- **알약 무리를 다루지 않는다.** 증감·개수 칩은 별도 컴포넌트이며 아직 없다.

## Acceptance tests

1. 높이·여백·간격·반경·타이포가 `components.measured.json`과 같다.
2. 다섯 tone의 면과 글자가 states 표와 같고, **다섯이 서로 다른 색을 만든다.**
3. `<span>`이며 tabindex·role이 없고 포인터 커서가 아니다.
4. 아이콘과 점이 `aria-hidden`이고 크기가 각각 `1em`·`0.5em`이며 점 색이 글자를 따라간다.
5. `icon`과 `dot`을 함께 주면 점이 렌더되지 않는다.
6. 라벨이 길어도 한 줄로 잘리고 높이가 유지된다.
7. 테두리 두께가 0이다.
