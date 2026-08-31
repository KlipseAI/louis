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
| Figma         | `partial`      | component set 3 variant(Size: lg·md·xs) — 코드는 넷이라 `sm`이 아직 없다. parity 게이트가 Track·Segment·Segment-Selected·Label을 자손으로 대조하며 raw fill·stroke 0이다. publish는 DS-F-008 |
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
| `size` | `lg` \| `md` \| `sm` \| `xs` | `lg` | 트랙 높이·반경·padding·타이포 |
| `disabled` | boolean | `false` | 그룹 전체를 비활성한다 |

`SegmentedControlItem`은 `value`와 `disabled`를 받는다.

**`size`의 앞 세 칸이 컨트롤 높이 사다리다** — `lg`(40) · `md`(32) · `sm`(24),
[DS-D-0027](../governance/decisions/DS-D-0027-control-size-ladder.md)과
[DS-D-0032](../governance/decisions/DS-D-0032-control-size-ladder-sm.md). `sm`은 **편집 표면의
도구 줄에서만** 쓴다 — 캔버스·타임라인·에셋 패널처럼 한 줄에 컨트롤이 여럿 서고 화면의 주인공이
편집 대상인 자리다. 폼·대화상자·본문 흐름에는 쓰지 않는다.

**`xs`는 사다리가 아니다.** 비디오 에디터 인스펙터의 조밀한 속성 행 전용이며
`layout-inspector-control-height`(28)를 읽는 이 컴포넌트의 지역 예외다. 아래 Known deviations.

**비제어 모드가 없다.** 세그먼트 컨트롤의 값은 거의 언제나 화면의 다른 부분을 다시 그리는
입력이라 호출부가 이미 그 값을 갖고 있다. 내부 상태를 두면 두 곳에 같은 값이 산다.

## Hierarchy와 variants

variant 축이 없다. 세그먼트 컨트롤은 강조 단계를 갖지 않는다 — 한 화면에 두 개가 있어도 어느
쪽이 "주요"한지는 시각이 아니라 배치가 말한다.

## States

| state | 표현 |
| --- | --- |
| Default | 면 없음(트랙 색이 보인다), 전경 `color-fg-secondary` |
| Hover | 전경 `color-fg-primary`. **면은 바뀌지 않는다** |
| Selected | 면 `color-bg-raised`, 전경 `color-fg-primary` |
| Disabled | 전경 `color-fg-disabled`, `cursor: not-allowed` |
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

| 축 | lg | md | sm | 토큰 |
| --- | ---: | ---: | ---: | --- |
| 트랙 높이 | 40px | 32px | 24px | `layout-control-height-lg` / `-md` / `-sm` |
| 트랙 padding | 4px | 4px | **2px** | `space-control-xs` · `space-control-xs` · 리터럴 |
| 트랙 반경 | 12px | 12px | **8px** | `radius-control` · `radius-control` · `radius-control-sm` |
| 트랙 헤어라인 (inset) | 0.5px | 0.5px | 0.5px | `border-width-hairline` + `color-stroke-hairline` |
| 세그먼트 높이 | 32px | 24px | 20px | 트랙 − 2×padding |
| 세그먼트 반경 | 8px | 8px | **6px** | `radius-control-sm` · `radius-control-sm` · 리터럴 |
| 세그먼트 좌우 여백 | 12px | 8px | 8px | `space-control-md` / `-sm` / `-sm` |
| 슬롯 간격 | 8px | 8px | 8px | `space-control-sm` |
| 타이포 | 14/1.5 | 12/1.5 | 12/1.5 | `typography-body-sm-medium` / `typography-caption-medium` |

사다리 밖의 `xs`는 트랙 28px(`layout-inspector-control-height`) · padding 3px · 트랙 반경
10px(`radius-inspector-control`) · 세그먼트 22px · 세그먼트 반경 7px이고 나머지는 `md`와 같다.

**세그먼트 반경은 바깥 반경에서 padding을 뺀 값이다** — lg·md는 12 − 4 = 8, sm은 8 − 2 = 6,
xs는 10 − 3 = 7. 중첩한 모서리가 어긋나지 않는다. lg·md의 두 값은 기존 토큰이라 새 토큰이 필요
없었고, sm·xs의 안쪽 값은 계단에 없어 리터럴이다 — **지어낸 값이 아니라 이 식이 낸 결과다.**

### `sm`의 값이 어디서 왔나

각 값의 근거를 하나씩 적는다. 근거는 **디자인 실측**(Figma `OlYKERKOkgbxBEEoXGZW2c` Page 14
프레임 `1087:2383`, 필터 탭 `1087:2432`와 그 다섯 세그먼트 `1087:2433`·`2435`·`2437`·`2439`·`2441`)
또는 **기존 사다리의 비례** 둘 중 하나다.

| 값 | 근거 |
| --- | --- |
| 트랙 높이 24 | 토큰. DS-D-0032가 연 `layout-control-height-sm` |
| 트랙 반경 8 | **실측.** 이 화면의 24 높이 컨트롤이 전부 반경 8이다 — 가져오기 `1087:2429`, 필터 탭 세그먼트, 70% 줌 칩 `1087:2482`, 트랙 레인 토글 `1087:2583` 외 8. 24에서 `radius-control`(12)은 한 변의 절반이라 알약이 된다 |
| 세그먼트 좌우 여백 8 | **실측.** 다섯 세그먼트가 좌우 8이다. 이 컴포넌트의 여백은 트랙이 아니라 세그먼트 높이를 따라와 lg 12 → md 8로 내려왔으므로 **비례만 이으면 4**인데, 비례보다 실측이 앞선다. 4로 깎으면 "비디오"·"이미지" 같은 세 글자 라벨이 서로 붙는다 |
| 타이포 12/1.5 | **실측이자 스케일의 바닥.** 디자인이 12px Pretendard Medium · line-height 150%이고, 타입 스케일의 마지막 칸이 caption(12)이라 아래가 없다. 두 근거가 같은 값을 가리킨다 |
| 트랙 padding 2 | **유도.** 아래는 세그먼트가 caption 행 높이 18px을 담아야 하므로 3 이하 — lg·md의 상수 4를 그대로 쓰면 세그먼트가 24 − 8 = 16이 되어 라벨이 선택 면을 뚫는다. 위는 트랙의 inset 헤어라인이 padding 상자 안쪽에 그려지고 자식이 그 위에 칠해지므로 0이면 양 끝 세그먼트가 선택됐을 때 헤어라인 세 변이 가려진다 — 다크에서 `bg-inset`이 `bg-surface`와 같은 색이라 그 헤어라인이 트랙의 유일한 경계다. 2px 격자에서 그 사이에 남는 값은 2 하나뿐이고, 3은 홀수인 데다 세그먼트가 정확히 18이라 여유가 0이 된다 |
| 세그먼트 높이 20 | 트랙 − 2×padding |
| 세그먼트 반경 6 | 위 파생식 — 8 − 2 |
| 슬롯 간격 8 | **비례(상수).** lg·md 둘 다 8이다. 디자인의 탭에는 아이콘 슬롯이 없어 이 축은 재지 못했다 |
| 최소 폭 | **없다.** 이 컴포넌트는 최소 폭 토큰을 읽지 않는다 — 세그먼트가 `flex: 1 1 auto`로 내용 크기를 갖는다. DS-D-0032도 `control-minimum-width-sm`을 만들지 않기로 판정했다 |

**디자인의 필터 탭에는 트랙이 없다.** 다섯 세그먼트가 24 높이에 그대로 서고, 선택은 글자색
하나(`#313640` ↔ `#777D89`)로만 전달된다. 그것은 이 문서가 제품 B 계열로 이미 기각한 표현이므로
**따르지 않는다** — 트랙과 선택 면은 그대로 두고 기하만 실측을 채택했다. 그래서 디자인의
세그먼트는 24인데 여기 세그먼트는 트랙 안쪽의 20이다.

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
32로 남는다. 이전엔 spread-only 바깥 그림자였고 색도 `color-stroke-subtle`이었다 — 다른 표면과 같은
generic 10% `color-stroke-hairline` inset으로 통일했다([DS-D-0023](../governance/decisions/DS-D-0023-hairline-inset.md)).
Figma는 INNER_SHADOW로 대응한다 — 이전 OUTSIDE stroke에서 바뀐 것이다.

선택 면에 그림자를 두지 않는다. 제품 A는 헤어라인 프레임을 얹지만, 면 색이 이미 트랙과 다르므로
경계가 그것으로 읽힌다.

## Implementation

- 트랙 면 `color-bg-inset`과 선택 면 `color-bg-raised`는 **한 테마에서 죽지 않는
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
- **`sm`이 44px 최소 hit target에 미달하고, 이 컴포넌트에는 그것을 메울 장치가 없다.**
  세그먼트가 20px이므로 절반을 밑돈다. [DS-D-0032](../governance/decisions/DS-D-0032-control-size-ladder-sm.md)는
  `sm`에 `.louis-hit-target`을 반드시 함께 붙이라고 적었지만 **여기서는 그 유틸을 쓸 수 없다.**
  그 유틸의 44×44 `::after`는 요소 중앙에 겹쳐 놓이는데, 세그먼트는 간격 없이 나란히 서고 폭이
  40 안팎이라 이웃의 타깃과 가로·세로 양쪽으로 겹친다 — "비디오"를 누르려다 "이미지"가 잡히는
  상태이며, [Menu Popover](menu-popover.md)가 항목에 같은 유틸을 쓰지 않는 이유와 정확히 같다.
  `md`·`lg`도 44에 미달하지만 `sm`에서 차이가 24px로 가장 크다. **해결하지 않고 알려진 편차로
  남긴다** — DS-D-0032의 그 문장과 이 컴포넌트의 기하가 아직 화해하지 않았다.
- **`xs`(28)가 `sm`(24)보다 크다.** 값의 문제는 없다 — `xs`는 사다리의 칸이 아니라
  `layout-inspector-control-height`를 읽는 지역 예외다. 그러나 같은 `data-size` 축에 서 있어서
  **이름이 순서를 거짓말한다.** 이름을 사다리 밖으로 옮길지 28을 사다리에 들일지는 DS-D-0032가
  미결로 남긴 판정이며 이 변경에서 열지 않았다. 타입에서는 `xs`를 맨 뒤에 두어 앞 셋이 사다리임을
  드러낸다.
- **Figma의 `Size` variant에 `sm`이 없다.** Figma는 `lg`·`md`·`xs` 셋이고 코드는 넷이다.
  `verify-figma-parity`가 정확히 그 한 줄로 빨갛다 —
  `SegmentedControl.Size — 코드 [lg, md, sm, xs], Figma=[lg, md, xs]`. 같은 이유로
  `scripts/verify-figma-parity.mjs`의 `SegmentedControlItem.Size` 선언도 아직 셋이다. `sm`을
  라이브러리에 그리는 것은 이 변경 단위 밖이며, 그때까지 이 축은 빨갛다 —
  [DS-D-0028](../governance/decisions/DS-D-0028-three-in-one-change.md) 규칙 1의 세 곳 중 Figma가
  아직 움직이지 않았다는 뜻이고, **그것이 이 변경의 정확한 상태다.**

## Acceptance tests

1. lg·md·sm의 트랙 높이·padding·반경·헤어라인 토큰·세그먼트 높이·반경·좌우 여백·슬롯 간격·타이포가
   `components.measured.json`과 같다.
2. 세 크기 **모두**에서 세그먼트 반경이 트랙 반경에서 트랙 padding을 뺀 값과 같다.
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
13. 세 크기 모두 자동 접근성 검사에 위반이 없다.
14. `sm`의 세그먼트가 caption 행 높이(18px)보다 낮지 않다 — 낮으면 라벨이 선택 면을 뚫는다.
