---
id: segmented-control
status: experimental
authority: normative
summary: 한 줄에 놓인 두셋 중 하나를 고릅니다.
---

# Segmented Control

한 줄에 놓인 두셋 중 하나를 고른다.

**제품에 공용 구현이 둘 있는데 서로 아무것도 공유하지 않는다.** `SegmentedToggle` 컴포넌트(파일
주석이 스스로 SSOT라고 적어 두었다, 3벌)와 `useSegmentedControlThumb` 훅(4벌, 훅만 공유하고
스타일은 복붙)이고, 트랙 padding 4↔3, 트랙 반경 12↔8, 썸 반경 8↔6, easing 셋, 비활성 글자
42%↔58%↔55%↔48%가 전부 다르다. 정본을 `SegmentedToggle`로 잡았고 갈라지는 축은
[`product.measured.json`](../../migration/product.measured.json)이 사유와 함께 갖는다.

## Availability

| Surface       | 상태           | 근거                                                                                   |
| ------------- | -------------- | -------------------------------------------------------------------------------------- |
| Web           | `partial`      | public export와 실브라우저 acceptance test 14건이 두 motion context에서 각각 돈다; visual regression과 제품 소비 증거 없음 |
| Figma         | `partial`      | component set 2 variant(Size). parity 게이트가 Track·Segment·Segment-Selected·Label을 자손으로 대조하며 raw fill·stroke 0이다. publish는 DS-F-008 |
| Documentation | `done`         | 이 문서                                                                                |
| Maturity      | `experimental` | 규범과 구현이 같은 변경 단위에서 처음 선다                                             |

## When to use

- 선택지가 **둘에서 넷**이고, 라벨이 짧으며, 전부 한눈에 보여야 할 때 — 테마, 정렬 기준, 기간,
  보기 방식.
- 고른 값이 **같은 화면의 내용을 다시 그릴 때.** 다른 곳으로 이동하지 않는다.

쓰지 않는 자리.

- **패널을 바꿀 때.** 그것은 Tabs이며 아직 카탈로그에 없다. 제품의 대시보드 상단
  `DASHBOARD_TABS` 다섯 자리가 그쪽이다.
- 선택지가 다섯 이상이거나 라벨이 길 때. 그것은 Select 또는 Menu다.
- 켜고 끄는 것. 그것은 Switch이며 아직 카탈로그에 없다.
- 여럿을 동시에 고를 때. 그것은 Checkbox 그룹이다.
- 목적지로 이동할 때. 그것은 링크다.

## API

```tsx
<SegmentedControl label="테마" value={theme} onValueChange={setTheme}>
  <SegmentedControlItem value="system">시스템</SegmentedControlItem>
  <SegmentedControlItem value="light">라이트</SegmentedControlItem>
  <SegmentedControlItem value="dark">다크</SegmentedControlItem>
</SegmentedControl>
```

## Anatomy

1. **Track** — `<fieldset>`. 면·반경·헤어라인(inset)과 padding을 소유한다.
2. **Legend** — 그룹 이름. 시각적으로 숨기고 보조기술에 남긴다.
3. **Segment** — `<label>`. 시각을 소유한다.
4. **Input** — 숨겨진 `<input type="radio">`. 선택 상태와 키보드를 소유한다.

**시각적 세그먼트가 `<input>`이 아닌 이유.** radio를 그대로 그릴 수 없고, 라벨이 면·반경·포커스
링을 받아야 아이콘과 글자를 함께 담을 수 있다. Text Field가 박스를 `<input>` 바깥에 둔 것과 같은
구조다.

## Properties

| prop | 값 | 기본 | 뜻 |
| --- | --- | --- | --- |
| `label` | string | **필수** | 그룹 이름. `<legend>`가 되고 화면에서는 숨는다 |
| `value` | string | **필수** | 현재 값. 항상 controlled다 |
| `onValueChange` | `(value: string) => void` | **필수** | 값이 바뀔 때 |
| `size` | `md` \| `sm` | `md` | 트랙 높이와 타이포 |
| `disabled` | boolean | `false` | 그룹 전체를 비활성한다 |

`SegmentedControlItem`은 `value`와 `disabled`를 받는다.

**비제어 모드가 없다.** 세그먼트 컨트롤의 값은 거의 언제나 화면의 다른 부분을 다시 그리는
입력이라 호출부가 이미 그 값을 갖고 있다. 내부 상태를 두면 두 곳에 같은 값이 산다.

## Hierarchy와 variants

variant 축이 없다. 세그먼트 컨트롤은 강조 단계를 갖지 않는다 — 한 화면에 두 개가 있어도 어느
쪽이 "주요"한지는 시각이 아니라 배치가 말한다.

## States

| state | 표현 |
| --- | --- |
| Default | 면 없음(트랙 색이 보인다), 전경 `color-foreground-secondary` |
| Hover | 전경 `color-foreground-primary`. **면은 바뀌지 않는다** |
| Selected | 면 `color-background-raised`, 전경 `color-foreground-primary` |
| Disabled | 전경 `color-foreground-disabled`, `cursor: not-allowed` |
| Focus | 세그먼트가 공유 링을 받는다 |

**hover에서 면을 바꾸지 않는다.** 바꾸면 얹은 것과 선택된 것이 같은 표현이 되어 어느 쪽이 현재
값인지 순간 읽히지 않는다. 제품 B는 hover에 면을 칠하고 선택에도 면을 칠해 이 문제를 갖는다.

**Selected는 면과 전경을 함께 바꾼다.** 제품 B 계열은 선택을 색 하나로만 전달하고 aria도 없어서,
색각 이상과 스크린 리더 양쪽에서 현재 값이 사라진다.

## Interaction and responsive behavior

- 폭은 호출부가 정한다. 트랙은 내용 크기로 자라되 `max-inline-size: 100%`라 컨테이너를 넘지 않는다.
- 세그먼트는 내용 크기를 기준으로 늘고 준다. 좁아지면 라벨이 **줄바꿈이 아니라 말줄임**으로
  줄어든다 — 줄바꿈하면 트랙 높이가 변해 옆에 선 컨트롤과 어긋난다.
- 선택 면이 움직이는 전환이 **없다.** 아래 Known deviations.

## Content

- 라벨은 **한 단어**를 목표로 한다. "최신"이지 "최신 순으로 정렬"이 아니다.
- 라벨 길이를 서로 비슷하게 맞춘다. 하나만 길면 그 세그먼트가 트랙을 지배한다.
- `label`은 무엇을 고르는 축인지를 말한다. "테마"이지 "테마를 선택하세요"가 아니다.

## Accessibility

- **네이티브 radio 그룹이다.** 방향키 roving, 끝에서 되돌기, "3 중 1" 그룹 안내, 폼 제출,
  forced-colors가 전부 브라우저의 것이다. Button이 활성화를, Slider가 범위를 네이티브에 맡긴
  것과 같은 이유다.
- 제품은 선택을 셋으로 다르게 전달한다 — `aria-pressed`(A), **아무것도 없음**(B), `role="tab"`(C).
  패널을 바꾸지 않고 값을 고르는 것은 radiogroup이며 그 하나를 골랐다.
- **`<fieldset>` + `<legend>`인 이유.** legend가 그룹에 이름을 붙이는 유일한 네이티브 경로다.
  `role="radiogroup"` + `aria-label`을 얹은 `<div>`는 안의 네이티브 radio와 역할이 겹친다.
  제품 A는 `<span aria-label>`을 쓰는데, role 없는 span의 `aria-label`은 보조기술이 무시한다.
- **포커스 링을 세그먼트가 받는다.** radio는 숨겨져 있어 거기 걸면 화면 밖에 그려진다.
  제품의 여섯 레시피 **어디에도 포커스 표시 선언이 없다.**
- forced-colors에서는 면 색이 시스템 색으로 치환돼 선택이 사라지므로 테두리로 다시 세운다.
- radio 그룹 이름은 컴포넌트가 인스턴스마다 발급한다. 호출부가 만들면 같은 화면에 컨트롤이 둘일
  때 그룹이 합쳐져 한쪽을 고르면 다른 쪽 선택이 풀린다.

## Specification

| 축 | md | sm | 토큰 |
| --- | ---: | ---: | --- |
| 트랙 높이 | 40px | 32px | `layout-control-height-md` / `-sm` |
| 트랙 padding | 4px | 4px | `space-control-xs` |
| 트랙 반경 | 12px | 12px | `radius-control` |
| 트랙 헤어라인 (inset) | 0.5px | 0.5px | `border-width-hairline` + `color-border-hairline` |
| 세그먼트 높이 | 32px | 24px | 트랙 − 2×padding |
| 세그먼트 반경 | 8px | 8px | `radius-control-sm` |
| 세그먼트 좌우 여백 | 12px | 8px | `space-control-md` / `-sm` |
| 슬롯 간격 | 8px | 8px | `space-control-sm` |
| 타이포 | 14/1.5 | 12/1.5 | `typography-body-sm-medium` / `typography-caption-medium` |

**세그먼트 반경은 바깥 반경에서 padding을 뺀 값이다** — 12 − 4 = 8. 중첩한 모서리가 어긋나지
않고, 두 값 다 기존 토큰이라 새 토큰이 필요 없었다.

**이 파생식은 두 갈래다.** 자식이 **테두리에 닿으면** `outer − border-width`, **padding으로
인셋되면** `outer − padding`이다. 위의 12 − 4 = 8은 후자다. 하나로 뭉쳐 쓰면 테두리를 가진 카드
안에서 2px 어긋난다.

| 경우 | 식 | 값 |
| --- | --- | ---: |
| 테두리 안쪽에 딱 붙는 자식 | `outer − border-width` | 24 − 2 = 22px |
| padding으로 인셋된 자식 | `outer − padding` | 12 − 4 = 8px |
| 노드 카드 안 8px 인셋 박스 — **예외** | 파생하지 않는다 | **16px** (계산값 14px) |

**노드 카드 안 8px 인셋 박스는 파생식을 따르지 않는다.** 제품의 노드 카드는 바깥 24px · 테두리
2px · 경계에 닿는 면 22px(`--node-outer-radius` · `--node-inner-radius`,
`node-canvas-v2/index.tsx:308-312`)까지 첫째 식을 지키지만, 그 안에서 8px 인셋된 박스는 기하
동심값 22 − 8 = 14px이 아니라 `--node-input-radius` **16px**을 쓴다. 한 자리의 사고가 아니다 —
프롬프트 입력 셸(사방 8px 인셋, `nodes/ImageNode.tsx:385-387`)과 오디오 결과 카드(부모 미디어
밴드가 8px 인셋 `nodes/BgmNode.tsx:139`, 반경 `nodes/BgmNode.tsx:401`)가 같은 16px이다. 노드
계열 전체의 관용이다.

**이 값을 14px로 "고치지" 않는다.** 제품은 인셋 박스가 카드 곡률을 따라가는 것보다 입력·결과
카드끼리 같은 곡률을 갖는 쪽을 택했다. 파생식만 알고 이 예외를 모르면 노드를 Figma로 옮기는
사람이 16px을 버그로 읽고 14px을 넣어, 노드 안쪽 박스가 전부 어긋난다.

높이가 Button·Text Field·Slider와 같은 계단인 이유는 하나다 — 나란히 서는 컨트롤이 서로 다른
높이를 가지면 줄이 어긋난다. 제품 A는 36px이고 그 값은 이 저장소의 어떤 컨트롤과도 맞지 않는다.

## Effects

**트랙의 헤어라인은 테두리가 아니라 generic 10% inset box-shadow다.** `border`를 쓰면 border-box
안쪽이 줄어 세그먼트 높이가 40 − 8 − 2×테두리가 되는데, 브라우저가 DPR 1에서 0.5px을 1px로
올리므로 그 값이 화면마다 달라진다. inset box-shadow도 레이아웃을 건드리지 않아 세그먼트가 정확히
32로 남는다. 이전엔 spread-only 바깥 그림자였고 색도 `color-border-subtle`이었다 — 다른 표면과 같은
generic 10% `color-border-hairline` inset으로 통일했다([DS-D-0023](../governance/decisions/DS-D-0023-hairline-inset.md)).
Figma는 INNER_SHADOW로 대응한다 — 이전 OUTSIDE stroke에서 바뀐 것이다.

선택 면에 그림자를 두지 않는다. 제품 A는 헤어라인 프레임을 얹지만, 면 색이 이미 트랙과 다르므로
경계가 그것으로 읽힌다.

## Implementation

- 트랙 면 `color-background-inset`과 선택 면 `color-background-raised`는 **한 테마에서 죽지 않는
  유일한 짝이다.** 다크에서 `inset`·`surface`·`menu`·`overlay` 넷이 같은 색이고 라이트에서
  `raised`·`overlay`·`surface` 셋이 같다.
- 트랙에 헤어라인을 두는 이유도 같다 — 다크에서 `inset`이 `surface`와 같아, 표면 위에 놓인
  트랙이 테두리 없이는 보이지 않는다.
- 세그먼트의 `flex`는 `1 1 auto`다. `1 1 0`으로 두면 기준 크기가 0이라 **여유가 있는데도 라벨이
  잘린다.**
- `<fieldset>`의 기본 여백·테두리를 스스로 지운다. reset은 opt-in이라 소비자가 켜지 않을 수 있다.

## Known deviations

- **선택 면이 움직이지 않는다.** 제품 여섯 중 넷이 220~240ms 슬라이딩 썸을 갖고 그것이 이
  컴포넌트에서 가장 널리 합의된 축인데, DS에 그 전환을 부를 토큰이 없다.
  [Motion](../foundations/motion.md)은 semantic recipe로 `layout-change`를 **이름만 예약해 두고**
  실제 토큰은 없으며, lifecycle도 `enter`·`exit`·`loop` 셋뿐이다. 넷째 lifecycle을 세우는 것은
  DS-D-0016이 `loop`에 한 것과 같은 크기의 변경이고, token source가 바뀌면 Figma 변수·style을 다시
  적용해야 하므로 이 변경 단위 밖이다. 이름이 맞지 않는 기존 motion 토큰(`overlay-enter` 등)을
  빌려 쓰지 않는다 — `radius-card`와 같은 함정이 된다.
- **제품의 슬라이딩 썸 구현이 셋으로 갈린다.** JS `offsetWidth`(A), JS `getBoundingClientRect` +
  ResizeObserver(B), CSS만(C). 위 토큰이 서면 어느 쪽을 채택할지 함께 정한다.
- **Tabs가 없다.** 제품의 `DASHBOARD_TABS` 다섯 자리는 패널을 바꾸므로 이 컴포넌트가 아니다.
- **아이콘 슬롯의 크기 계약이 없다.** `gap`만 정해 두었고 아이콘은 호출부가 넣는다.
- **RTL에서 방향키 방향을 검증하지 않았다.** 네이티브 radio의 동작에 맡긴다.

## Acceptance tests

1. md/sm의 트랙 높이·padding·반경·헤어라인 토큰·세그먼트 높이·반경·좌우 여백·슬롯 간격·타이포가
   `components.measured.json`과 같다.
2. 세그먼트 반경이 트랙 반경에서 트랙 padding을 뺀 값과 같다.
3. Default·Hover·Selected·Disabled의 면과 전경이 states 표와 같다.
4. **트랙 면과 선택 면이 light·dark 두 테마 모두에서 서로 다르다.**
5. 선택이 색이 아니라 radio의 `checked`로 전달된다.
6. 그룹 이름이 `<legend>`이고 화면에서는 숨겨지되 지워지지 않는다.
7. 방향키가 값을 옮기고 끝에서 되돈다.
8. 컨트롤이 둘일 때 radio 그룹 이름이 서로 다르고 각자 자기 선택을 갖는다.
9. 클릭이 값을 바꾸고 이전 선택이 풀린다.
10. 포커스 링을 **세그먼트**가 받고 키보드에서만 나타나며 두께가 `border-width-ring`이다.
11. 그룹 `disabled`가 자손 입력 전부를 `:disabled`로 만들고 값이 바뀌지 않는다.
12. 항목 하나만 비활성할 수 있고 나머지는 살아 있다.
13. 두 크기 모두 자동 접근성 검사에 위반이 없다.
