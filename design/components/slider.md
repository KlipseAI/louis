---
id: slider
status: experimental
authority: normative
summary: 정해진 범위 안에서 값 하나를 고릅니다.
---

# Slider

정해진 범위 안에서 하나의 수를 고른다.

**제품에 공용 구현이 없다.** 정의가 37벌이고 일곱 레시피로 갈리며 **레시피 사이에 합의하는 축이
하나도 없다** — 트랙 높이 2·4·20·28px, 썸 0·10·12·14·16px, 채움 색 다섯 갈래다. 그래서 이
컴포넌트의 값은 제품 정본을 옮긴 것이 **아니라 DS가 정한 것**이고, 어디서 갈라지는지는
[`product.measured.json`](../../migration/product.measured.json)이 사유와 함께 갖는다.

## Availability

| Surface       | 상태           | 근거                                                                                 |
| ------------- | -------------- | ------------------------------------------------------------------------------------ |
| Web           | `partial`      | public export와 실브라우저 acceptance test 16건이 두 motion context에서 각각 돈다; visual regression, Figma component와 제품 소비 증거 없음 |
| Figma         | `partial`      | component set 4 variant(Size×Variant). 복합 키 `{size}/{variant}`로 그룹을 나눠 parity 게이트가 variant별 기하를 각각 대조한다. raw fill·stroke 0. publish는 DS-F-008 |
| Documentation | `done`         | 이 문서                                                                              |
| Maturity      | `experimental` | 규범과 구현이 같은 변경 단위에서 처음 선다                                           |

## When to use

- 값이 **연속적이고** 대략의 위치가 정확한 숫자보다 중요할 때 — 투명도, 볼륨, 재생 속도, 줌.
- 조정한 결과를 **즉시 볼 수 있을 때.** 슬라이더의 값은 미리보기가 대신 읽어 준다.

쓰지 않는 자리.

- 정확한 수를 입력해야 할 때. 그것은 숫자 Text Field다. 둘을 나란히 두는 것은 괜찮다.
- 선택지가 다섯 이하의 이산값일 때. 그것은 Segmented Control이다.
- 켜고 끄는 것. 그것은 Switch이며 아직 카탈로그에 없다.
- **범위(시작–끝) 선택.** 손잡이가 둘인 형태는 이 컴포넌트의 축이 아니다.

## API

```tsx
<Slider label="투명도" min={0} max={1} step={0.05} value={opacity}
  onValueChange={setOpacity} formatValue={(v) => `${Math.round(v * 100)}%`} />

<Slider label="재생 속도" variant="track" min={0.5} max={2} step={0.05} defaultValue={1} />
```

## Anatomy

1. **Stack** — 라벨과 컨트롤을 세로로 담는다.
2. **Label** — 시각 라벨. `htmlFor`로 컨트롤에 연결된다.
3. **Control** — 실제 `<input type="range">`. 레일·채움·썸을 전부 이 요소가 그린다.

**값 표시는 이 컴포넌트의 부품이 아니다.** 제품은 값 문구의 자리와 형식이 벌마다 다르고(오른쪽
알약, 라벨 옆, 아래 눈금) 그 배치는 호출부의 격자에 달려 있다. 컴포넌트는 `formatValue`로
스크린 리더용 표현만 소유한다.

## Properties

| prop | 값 | 기본 | 뜻 |
| --- | --- | --- | --- |
| `label` | ReactNode | 없음 | 시각 라벨. 없으면 `aria-label`이 필수다 |
| `size` | `md` \| `sm` | `md` | 컨트롤 높이. 레일 두께는 바뀌지 않는다 |
| `variant` | `thumb` \| `track` | `thumb` | 아래 Hierarchy와 variants |
| `min` / `max` / `step` | number | `0` / `100` / `1` | 범위와 눈금 |
| `value` | number | 없음 | 주면 controlled가 된다 |
| `defaultValue` | number | `min` | 비제어 초기값 |
| `onValueChange` | `(value: number) => void` | 없음 | 값이 바뀔 때 |
| `formatValue` | `(value: number) => string` | 없음 | `aria-valuetext`. 아래 Accessibility |

나머지는 `<input>`의 네이티브 속성을 그대로 받는다.

## Hierarchy와 variants

| variant | 모양 | 쓰는 자리 |
| --- | --- | --- |
| `thumb` | 4px 레일 위의 둥근 손잡이 | 기본. 값이 한 점으로 읽히면 된다 |
| `track` | 28/20px 굵은 막대를 채우고 채움 끝에 얇은 표식 | 좁은 인스펙터에서 값이 **양**으로 읽혀야 할 때 |

`track`은 제품 인스펙터 17벌의 형태다. **다른 점이 하나 있다** — 제품은 그 표식을 장식으로
그리고 진짜 손잡이를 `width:0; opacity:0; pointer-events:none`으로 지웠다. 여기서는 표식이 곧
손잡이라 모양은 같고 포커스와 방향키가 살아 있다.

## States

states 표를 두지 않는다. 칠해지는 면(레일·채움·썸)이 전부 브라우저의 섀도우 pseudo-element라
**계산값을 읽을 수 없고**, 게이트가 확인할 수 없는 표를 두면 "확인했다"는 주장만 남는다. 토큰
배정은 아래 Specification이 갖고 CSSOM 선언 대조가 그것을 고정한다.

| state | 표현 |
| --- | --- |
| Default | 채움 `color-action-primary`, 빈 레일 `color-border-default`, 썸 `color-action-primary` + 표면색 링 |
| Hover | **바뀌지 않는다** |
| Focus | 컨트롤 전체가 공유 링을 받는다 |
| Disabled | 레일 전체 `color-border-subtle`, 썸 `color-foreground-disabled`, `cursor: not-allowed` |

**hover에서 아무것도 바꾸지 않는다.** 제품의 두 레시피는 썸을 1.15배로 키우는데, 커서가 이미
레일 위에 있고 손잡이가 보이므로 어포던스가 부족하지 않다. 크기가 변하면 그 순간 값이 어디인지
읽기가 더 어렵다.

## Interaction and responsive behavior

- 폭은 호출부가 정한다. 컨트롤은 `inline-size: 100%`이며 스스로 폭을 갖지 않는다.
- 레일 어디를 눌러도 그 지점으로 값이 간다. 네이티브 동작이며 손잡이를 정확히 집을 필요가 없다.
- `touch-action: none`이라 드래그 중에 화면이 따라 스크롤되지 않는다. 스크롤이 따라오면 값이 튄다.
- 세로 방향은 지원하지 않는다. 제품에 세로 슬라이더가 0벌이다.

## Content

- **Label**은 무엇을 조절하는지를 말한다. "투명도"이지 "투명도를 조절하세요"가 아니다.
- 단위는 라벨이 아니라 값 표시가 갖는다. "속도(배)"가 아니라 "속도"이고 값이 "1.5배"다.
- 최소·최대 눈금 문구를 두려면 호출부가 컨트롤 아래에 놓는다. 컴포넌트의 부품이 아니다.

## Accessibility

- **네이티브 `<input type="range">`다.** `role="slider"`, `aria-valuenow`/`valuemin`/`valuemax`,
  방향키·Home/End·PageUp/PageDown, 터치, forced-colors, RTL이 전부 브라우저의 것이다. Button이
  활성화를 네이티브 `<button>`에 맡긴 것과 같은 이유로 여기도 직접 만들지 않는다.
- **라벨이 필수다.** 시각 라벨이 없으면 `aria-label`을 준다.
- `formatValue`는 **숫자가 그 자체로 뜻을 갖지 않을 때만** 준다. `0.5`가 아니라 `50%`,
  `1.5`가 아니라 `1.5배`. 늘 붙이면 `aria-valuetext`가 `aria-valuenow`를 덮어 원래 값을 잃는다.
- **포커스 링을 지우지 않는다.** 제품의 세 레시피가 `outline: none`을 직접 선언했고 그것이
  37벌 중 25벌(68%)이다. 키보드 사용자가 지금 어디에 있는지 알 수 없는 상태를 옮기지 않는다.
- id는 컴포넌트가 인스턴스마다 발급한다. 호출부가 만들면 같은 화면에 슬라이더가 여럿일 때 겹친다.

## Specification

| 축 | md | sm | 토큰 |
| --- | ---: | ---: | --- |
| 컨트롤 높이 | 40px | 32px | `layout-control-height-md` / `-sm` |
| 레일 두께 | 4px | 4px | 리터럴 |
| 레일 반경 | 999px | 999px | `radius-pill` |
| 썸 지름 | 16px | 12px | 리터럴 |
| 썸 테두리 | 2px | 2px | `border-width-ring` |
| `track` 막대 높이 | 28px | 20px | 리터럴 |
| `track` 막대 반경 | 8px | 8px | `radius-control-sm` |
| `track` 표식 | 2×14px | 2×14px | 리터럴 |
| stack 간격 | 4px | 4px | `space-control-xs` |
| 라벨 타이포 | 14/1.5 | 14/1.5 | `typography-body-sm-medium` |

리터럴이 남아 있는 이유는 소비처가 이 컴포넌트 하나뿐이기 때문이다 —
[Spacing & Radius](../foundations/spacing-radius.md)가 "두 개 이상의 사용처"를 승격 조건으로 둔다.
Spinner의 16/12px과 같은 판정이다.

컨트롤 높이가 Button·Text Field와 같은 계단인 이유는 하나다 — 인스펙터에서 나란히 서는 컨트롤이
서로 다른 높이를 가지면 줄이 어긋난다. 제품 슬라이더는 8·12·16·24·28px로 흩어져 있다.

## Effects

없다. 썸에 그림자를 쓰지 않는다 — 제품의 썸 그림자 넷이 값이 다 다르고(`0 1.5px 3px/24%`,
`0 2px 8px/22%`, `0 1px 2px/30%`) DS의 elevation 넷 중 맞는 것이 없다. 새 elevation 토큰을 만드는
대신 표면색 링으로 분리한다. 어느 배경 위에서도 성립하고 forced-colors에서도 사라지지 않는다.

## Implementation

- 채움 비율은 컴포넌트가 `--kds-slider-fill`로 내려보낸다. `::-webkit-slider-runnable-track`은
  진행 구간을 따로 갖지 않아 그라디언트 정지점으로 그려야 하고, 그 비율은 값에서만 나온다.
  Firefox는 `::-moz-range-progress`가 있어 비율이 필요 없다.
- 그래서 **비제어일 때도 컴포넌트가 값을 안다.** 그 상태가 채움의 유일한 출처다. controlled면
  `value` prop이 이긴다.
- WebKit과 Firefox의 pseudo-element를 **한 선택자로 합치지 않는다.** 한 브라우저가 모르는
  pseudo-element가 섞이면 규칙 전체가 버려진다.
- WebKit은 썸을 트랙 박스의 위쪽 가장자리에 붙인다. `margin-block-start`로 차이의 절반만큼
  올려야 가운데에 온다. Firefox는 자동으로 가운데 정렬한다.

## Known deviations

- **레일·채움·썸의 렌더 결과를 게이트가 보지 못한다.** Chromium의
  `getComputedStyle(input, "::-webkit-slider-runnable-track")`은 섀도우 pseudo-element가 아니라
  호스트 input의 값을 돌려준다(2026-08-18 실측: 320×40, 배경 투명, 반경 0). 그래서 테스트는
  CSSOM의 **선언**을 대조한다. 선언과 실제 그림이 갈라지는 경로는 열려 있고, 이것은 visual
  regression(2단계 harness)이 닫아야 한다.
- **Firefox 경로가 미검증이다.** `::-moz-range-*` 규칙을 나란히 적었으나 test harness가
  Chromium 단독이라 실행된 적이 없다.
- **컨트롤 높이 40px은 `layout-control-hit-target-minimum` 44px에 미달한다.** Button은
  `.kds-hit-target`의 `::after`로 44를 채우지만 range input은 `::before`/`::after`가 트랙·썸에
  배정돼 그 유틸리티를 쓸 수 없다. Text Field도 같은 40px이며, 레일이 가로 전체를 차지해 실제
  타깃 면적은 크다.
- **제품과 거의 모든 축이 다르다.** 정본이 없으므로 "다르다"가 결함이 아니다. 각 축의 판정은
  [`product.measured.json`](../../migration/product.measured.json)의 `slider`에 있다.
- **범위(두 손잡이) 선택이 없다.** 제품에 0벌이라 이번 범위가 아니다.

## Acceptance tests

1. md/sm의 컨트롤 높이·stack 간격·라벨 타이포가 `components.measured.json`과 같다.
2. md/sm의 레일 두께·썸 지름·썸 테두리 토큰 선언이 `components.measured.json`과 같다.
3. `track` 변형의 막대 높이와 표식 크기 선언이 `components.measured.json`과 같다.
4. `track` 변형의 썸이 `width:0`·`height:0`·`opacity`·`pointer-events`로 지워지지 않는다.
5. `--kds-slider-fill`이 값을 따라가고 min에서 `0%`, max에서 `100%`다.
6. 방향키가 `step`만큼 움직이고 `min`·`max`를 넘지 않는다.
7. controlled일 때 호출부의 값이 이기고, 갱신하지 않으면 값이 튀지 않는다.
8. 라벨의 `for`가 컨트롤을 가리키고, 라벨을 누르면 컨트롤이 포커스를 받는다.
9. 슬라이더가 둘 있을 때 두 컨트롤의 id가 다르다.
10. 포커스 링이 **키보드에서만** 나타나고 두께가 `border-width-ring`이다.
11. `disabled`면 키보드로도 값이 바뀌지 않고 `onValueChange`가 불리지 않는다.
12. `formatValue`를 준 것만 `aria-valuetext`를 갖는다.
13. 두 변형 모두 자동 접근성 검사에 위반이 없다.
