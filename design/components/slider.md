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
| Web           | `partial`      | public export와 실브라우저 acceptance test 19건이 두 motion context에서 각각 돈다(`sm`이 크기별 3건을 더했다); visual regression, Figma component와 제품 소비 증거 없음 |
| Figma         | `done`      | component set(Size·Variant·State). DS-D-0032 의 `sm` 이 Figma 에도 서서 코드 축과 같아졌다. 복합 키 `{size}/{variant}` 로 그룹을 나눠 variant별 기하를 각각 대조하고 raw fill·stroke 0 이다. 기하는 양방향이다 — `slider.browser.test.tsx` 가 코드 쪽에서 같은 실측을 되잰다. 게시 없이 판정한다([DS-D-0035](../governance/decisions/DS-D-0035-figma-done-without-publish.md)) |
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
| `size` | `lg` \| `md` \| `sm` | `lg` | 컨트롤 높이. 레일 두께는 바뀌지 않는다. **값의 순서가 이름의 순서와 다르다** — 아래 Specification |
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
| Default | 채움 `color-accent-primary`, 빈 레일 `color-stroke-default`, 썸 `color-accent-primary` + 표면색 링 |
| Hover | **바뀌지 않는다** |
| Focus | 컨트롤 전체가 공유 링을 받는다 |
| Disabled | 레일 전체 `color-stroke-subtle`, 썸 `color-fg-disabled`, `cursor: not-allowed` |

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
- **포커스 링은 그리지 않는다**([DS-D-0074](../governance/decisions/DS-D-0074-focus-ring-removed.md)).
  제품의 세 레시피가 `outline: none`을 직접 선언한 것(37벌 중 25벌)과 이제 같다. 강제 색에서만
  `base.css`가 `Highlight` 링을 그린다.
- id는 컴포넌트가 인스턴스마다 발급한다. 호출부가 만들면 같은 화면에 슬라이더가 여럿일 때 겹친다.

## Specification

| 축 | lg | md | sm | 토큰 |
| --- | ---: | ---: | ---: | --- |
| 컨트롤 높이 | 40px | 16px | 24px | `layout-control-height-lg` / 리터럴 / `-sm` |
| 레일 두께 | 4px | 4px | 4px | 리터럴 |
| 레일 반경 | 999px | 999px | 999px | `radius-pill` |
| 썸 지름 | 16px | 12px | 12px | 리터럴 |
| 썸 테두리 | 2px | 2px | 2px | `border-width-ring` |
| `track` 막대 높이 | 28px | 20px | 20px | 리터럴 |
| `track` 막대 반경 | 8px | 8px | 8px | `radius-control-sm` |
| `track` 표식 | 2×14px | 2×14px | 2×14px | 리터럴 |
| stack 간격 | 4px | 4px | 4px | `space-control-xs` |
| 라벨 타이포 | 14/1.5 | 14/1.5 | 12/1.5 | `typography-body-sm-medium` / 〃 / `typography-caption-medium` |

리터럴이 남아 있는 이유는 소비처가 이 컴포넌트 하나뿐이기 때문이다 —
[Spacing & Radius](../foundations/spacing-radius.md)가 "두 개 이상의 사용처"를 승격 조건으로 둔다.
Spinner의 16/12px과 같은 판정이다.

컨트롤 높이가 Button·Text Field와 같은 계단인 이유는 하나다 — 인스펙터에서 나란히 서는 컨트롤이
서로 다른 높이를 가지면 줄이 어긋난다. 제품 슬라이더는 8·12·16·24·28px로 흩어져 있다.

### `sm`(24)은 어디서 나왔나

DS-D-0027이 사다리를 두 칸으로 세우면서 24를 기각한 사유는 "제품에 24 높이 컨트롤이 없다"
하나였고, 새 비디오 에디터 디자인이 그 전제를 없앴다. [DS-D-0032](../governance/decisions/DS-D-0032-control-size-ladder-sm.md)가
세 번째 칸을 열었고, **이 컴포넌트에서는 그 칸이 유도값이 아니라 실측이다.** Figma
`OlYKERKOkgbxBEEoXGZW2c`의 프레임 `1087:2383`(비디오에디터) 인스펙터에 불투명도 슬라이더가 있다.

| 잰 것 | 노드 | 값 | 이 문서의 축 |
| --- | --- | ---: | --- |
| 슬롯 | `1087:2510` | 140×24 | 컨트롤 높이 24 |
| 레일 | `1087:2513` | 80×4, 슬롯 안 `y=10` | 레일 두께 4, `(24 − 4) / 2`로 세로 가운데 |
| 썸 | `1087:2515` | 12×12, 레일 기준 `y=−4` | 썸 지름 12, `(4 − 12) / 2` |
| 라벨·값 글자 | `1087:2509` · `1087:2512` | 12px / 150% | 라벨 타이포 caption 12/1.5 |

같은 프레임의 타임라인 줌 슬라이더(`1087:2572` 레일 100×4, `1087:2577` 썸 12×12)도 레일과 썸이
같은 값이다. **둘 다 `thumb` 변형이라 `track` 변형의 `sm` 실측은 없다** — 막대 20px은 재서 얻은
수가 아니라 이미 잰 둘 중 하나를 고른 것이다. 28(패널)과 20(패널 밖)은 제품 인스펙터의 두 실측값이고
그 사이에 이을 비례가 없어서(높이가 40→16으로 24 줄 때 막대는 28→20으로 8만 준다) 세 번째 수를
유도하지 않았다. `sm`이 서는 자리가 편집 표면의 도구 줄, 즉 패널 밖이므로 20을 쓴다. 표식 14px이
들어가는 하한이기도 하다.

라벨 타이포만 크기 축을 갖는 이유도 두 근거가 같은 값을 가리켰기 때문이다 — 위 실측의 12/150%와,
Segmented Control이 밀도가 낮은 칸에서 같은 `typography-caption-medium`으로 내려가는 선례다.
**굵기는 옮기지 않는다.** `medium`(500)은 세 칸이 같고 size는 굵기 축이 아니다.

## Effects

없다. 썸에 그림자를 쓰지 않는다 — 제품의 썸 그림자 넷이 값이 다 다르고(`0 1.5px 3px/24%`,
`0 2px 8px/22%`, `0 1px 2px/30%`) DS의 elevation 넷 중 맞는 것이 없다. 새 elevation 토큰을 만드는
대신 표면색 링으로 분리한다. 어느 배경 위에서도 성립하고 forced-colors에서도 사라지지 않는다.

## Implementation

- 채움 비율은 컴포넌트가 `--louis-slider-fill`로 내려보낸다. `::-webkit-slider-runnable-track`은
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
  `.louis-hit-target`의 `::after`로 44를 채우지만 range input은 `::before`/`::after`가 트랙·썸에
  배정돼 그 유틸리티를 쓸 수 없다. Text Field도 같은 40px이며, 레일이 가로 전체를 차지해 실제
  타깃 면적은 크다.
- **`sm`(24)은 그 미달이 가장 크고, DS-D-0032가 요구한 보정을 할 수 없다.** 그 결정은
  「`sm`은 `.louis-hit-target`을 반드시 함께 붙인다」를 사다리 계약으로 적었는데, 이 컴포넌트는
  위와 같은 이유로 그 유틸리티를 쓸 수 없다 — `::after`가 이미 트랙·썸의 것이다. 그래서 24에서
  세로 타깃은 24px 그대로이고 44에 20px 모자란다. 완화하는 사실 둘: 레일이 가로 전체를 차지해
  면적은 넓고, 네이티브 range라 레일 어디를 눌러도 값이 그 지점으로 간다. **해결하지 않고
  편차로 적는다** — 고치려면 컨트롤을 감싸는 요소가 타깃을 대신 갖는 구조 변경이 필요하고,
  그것은 이 변경의 범위가 아니다.
- **`size`의 값 순서가 이름 순서와 다르다 — `lg`(40) > `sm`(24) > `md`(16).** `md`만 사다리 토큰이
  아니라 리터럴 16이기 때문이다. DS-D-0027이 「한 컴포넌트만 옮기면 `Button size="md"`는 32인데
  `TextField size="md"`는 40인 함정이 생긴다」고 적은 그 함정은 이 컴포넌트에 **이미 열려 있었고**,
  `sm`(24)을 여는 일이 그것을 만든 것이 아니라 보이게 만들었다. 이번에 `md`를 32로 되돌리지 않은
  이유는 16이라는 판정을 소유한 기록이
  [`product.measured.json`](../../migration/product.measured.json)이고, 그 기록을 함께 옮기지 않은 채
  CSS와 계약만 바꾸면 게이트는 초록인데 근거가 사라지기 때문이다. **미결이다** — 다음에 이
  컴포넌트를 여는 사람이 둘 중 하나를 판정한다: `md`를 사다리로 되돌리고 16을 사다리 밖 이름으로
  옮기거나, 16을 버린다. 새 디자인이 같은 자리(인스펙터 슬라이더)를 24로 그렸으므로 16의 소비처가
  남아 있는지가 그 판정의 첫 질문이다.
- **`md`의 `track` 막대가 컨트롤보다 두껍다 — 20 > 16.** 위 미결의 직접적인 결과다. 막대 20px은
  제품 인스펙터 실측이고 컨트롤 16px은 위에서 미결로 둔 리터럴이라, 둘을 함께 두면 막대가
  컨트롤 박스 밖으로 위아래 2px씩 나간다. 브라우저에서는 `::-webkit-slider-runnable-track`이
  호스트 input의 상자를 넘어 그려질 뿐이지만, Figma에서는 컨트롤 프레임이 그것을 **잘랐다**
  (2026-09-01 실측: `Size=md, Variant=track`의 State 셋 전부에서 `Rail`이 프레임 밖으로 나가고
  `Control.clipsContent`가 위아래 2px을 지웠다). 라이브를 고쳐 컨트롤의 클립을 끄고 변형 프레임에
  아래 padding 2를 줬으므로 Figma의 `md/track` 인스턴스만 높이가 41이 아니라 **43**이다.
  `md`를 사다리로 되돌리는 판정이 나면 이 보정도 함께 사라진다.
- **제품과 거의 모든 축이 다르다.** 정본이 없으므로 "다르다"가 결함이 아니다. 각 축의 판정은
  [`product.measured.json`](../../migration/product.measured.json)의 `slider`에 있다.
- **범위(두 손잡이) 선택이 없다.** 제품에 0벌이라 이번 범위가 아니다.

## Acceptance tests

1. lg/md/sm의 컨트롤 높이·stack 간격·라벨 타이포가 `components.measured.json`과 같다.
2. lg/md/sm의 레일 두께·썸 지름·썸 테두리 토큰 선언이 `components.measured.json`과 같다.
3. `track` 변형의 막대 높이와 표식 크기 선언이 `components.measured.json`과 같다.
4. `track` 변형의 썸이 `width:0`·`height:0`·`opacity`·`pointer-events`로 지워지지 않는다.
5. `--louis-slider-fill`이 값을 따라가고 min에서 `0%`, max에서 `100%`다.
6. 방향키가 `step`만큼 움직이고 `min`·`max`를 넘지 않는다.
7. controlled일 때 호출부의 값이 이기고, 갱신하지 않으면 값이 튀지 않는다.
8. 라벨의 `for`가 컨트롤을 가리키고, 라벨을 누르면 컨트롤이 포커스를 받는다.
9. 슬라이더가 둘 있을 때 두 컨트롤의 id가 다르다.
10. 키보드 포커스에도 링이 없고, 강제 색에서만 두께 `border-width-ring`의 링이 선다(DS-D-0074).
11. `disabled`면 키보드로도 값이 바뀌지 않고 `onValueChange`가 불리지 않는다.
12. `formatValue`를 준 것만 `aria-valuetext`를 갖는다.
13. 두 변형 모두 자동 접근성 검사에 위반이 없다.
