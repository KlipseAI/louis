---
id: input
status: experimental
authority: normative
summary: 한 줄 텍스트를 입력받습니다.
---

# Text Field

한 줄 텍스트를 입력받는다.

**제품에 공용 구현이 없다.** 텍스트 입력 정의가 약 40벌이고 다섯 계열로 갈리며 계열 사이에 합의가
없다 — 인증 floating-label 9벌, 테두리 박스 5벌, 테두리 없는 채운 면 9벌, 투명 인라인 rename 8벌,
노드 캔버스 프롬프트 5벌. 그래서 이 컴포넌트의 값은 제품 정본을 옮긴 것이 **아니라 DS가 정한
것**이고, 어디서 갈라지는지는 [`product.measured.json`](../../migration/product.measured.json)이
사유와 함께 갖는다.

## Availability

| Surface       | 상태           | 근거                                                        |
| ------------- | -------------- | ------------------------------------------------------------ |
| Web           | `partial`      | public export와 실브라우저 acceptance test 8건; visual regression과 제품 소비 증거 없음 |
| Figma         | `partial`      | component set 8 variant(Size×State). parity 게이트가 Box·Label·Value·Message를 자손으로 대조한다. publish는 DS-F-008 |
| Documentation | `done`         | 이 문서                                                      |
| Maturity      | `experimental` | 규범과 구현이 같은 변경 단위에서 처음 선다                   |

## When to use

- 자유 형식의 짧은 텍스트를 한 줄로 받을 때 — 이름, 이메일, 검색어, URL.
- `size="sm"`(24)은 **편집 표면의 도구 줄에서만** 쓴다 — 캔버스·타임라인·에셋 패널처럼 한 줄에
  컨트롤이 여럿 서고 화면의 주인공이 필드가 아니라 편집 대상인 자리
  ([DS-D-0032](../governance/decisions/DS-D-0032-control-size-ladder-sm.md)).

쓰지 않는 자리.

- 여러 줄. 그것은 Textarea이며 이 컴포넌트의 축이 아니다.
- 정해진 목록에서 고르는 것. 그것은 Select다.
- 체크박스·라디오·파일. 각자 다른 컴포넌트다.
- **폼·대화상자·본문 흐름의 `sm`.** 그 자리에서 24는 누르기 어렵고 `md`가 이미 맞다. 도구 줄이
  24를 감당하는 것은 사용자가 그 줄을 **보면서** 쓰기 때문이지 24가 일반적으로 충분해서가 아니다.

## API

```tsx
<TextField
  label="프로젝트 이름"
  placeholder="예: 여름 여행"
  description="공백 없이 입력합니다"
  suffix={<IconButton size="sm" label="지우기" onClick={clear}><IconX /></IconButton>}
/>

<TextField label="이름" invalid description="이미 쓰는 이름입니다" />
```

## Anatomy

1. **Stack** — 라벨·박스·메시지를 세로로 담는다.
2. **Label** — 시각 라벨. `htmlFor`로 입력에 연결된다.
3. **Box** — **시각적 필드.** 높이·여백·헤어라인(inset)·반경·배경을 소유하고 포커스 링을 받는다.
4. **Prefix / Suffix** — 박스 안의 슬롯. 아이콘과 버튼이 들어간다.
5. **Control** — 실제 `<input>`. 박스가 시각을 소유하므로 여기는 비어 있다.
6. **Message** — 도움말 또는 오류. 한 자리를 나눠 쓴다.

**시각적 필드가 `<input>`이 아닌 이유.** 접두 아이콘과 접미 버튼을 필드 *안에* 두려면 `<input>`
하나로는 안 된다. 제품의 가장 큰 계열(인증 9벌)도 같은 구조를 쓴다.

## Properties

| prop | 값 | 기본 | 뜻 |
| --- | --- | --- | --- |
| `label` | ReactNode | 없음 | 시각 라벨. 없으면 `aria-label`이 필수다 |
| `size` | `lg` \| `md` \| `sm` | `lg` | 시각 크기. `lg`·`md`는 글자 크기가 같고 `sm`만 내려간다 |
| `description` | ReactNode | 없음 | 필드 아래 한 줄. `invalid`면 오류 문구가 된다 |
| `invalid` | boolean | `false` | 오류 상태 |
| `prefix` / `suffix` | ReactNode | 없음 | 박스 안의 슬롯 |
| `type` | `text` \| `email` \| `password` \| `search` \| `tel` \| `url` | `text` | 텍스트 입력만 다룬다 |

나머지는 `<input>`의 네이티브 속성을 그대로 받는다.

## Hierarchy와 variants

variant 축이 없다. 필드는 강조 단계를 갖지 않는다 — 한 폼 안에서 어떤 필드가 다른 필드보다
"주요"하다는 표현은 시각이 아니라 순서와 라벨이 맡는다.

## States

| state | 표현 |
| --- | --- |
| Default | generic 헤어라인(inset, `color-stroke-hairline`) |
| Hover | **바뀌지 않는다** |
| Focus | 박스가 `:focus-within`으로 공유 링을 받는다 |
| Invalid | generic 헤어라인 유지 — 색 축 대신 **오류 문구 + `aria-invalid` + `role="alert"`**가 전달한다 |
| Disabled | generic 헤어라인 유지, 전경 `color-fg-disabled`이 상태를 전달한다 |

**hover에서 아무것도 바꾸지 않는다.** 필드의 어포던스는 보이는 테두리와 텍스트 커서가 맡는다.
제품의 필드들도 대부분 hover 상태를 갖지 않는다.

**Focus는 states 표에 없다.** 색이 아니라 outline이라 면·전경·테두리 세 값으로 표현되지 않는다 —
브라우저 테스트가 따로 대조한다.

## Interaction and responsive behavior

- 박스 어디를 눌러도 텍스트 커서가 나온다(`cursor: text`). 슬롯 안의 버튼은 자기 커서를 갖는다.
- 높이는 `min-block-size`다. 200% 확대나 긴 값에서 잘리는 대신 자란다.
- 폭은 호출부가 정한다. 필드가 스스로 폭을 갖지 않는 이유는 폼의 격자가 그것을 소유하기 때문이다.
  `sm`도 마찬가지다 — 최소 폭 계약을 열지 않았다.
- `sm`은 값이 12로 내려가므로 같은 값이 `md`보다 좁게 그려진다. 도구 줄에서 필드 폭을 고정할 때
  `md`에서 잰 폭을 그대로 쓰면 남는다.

## Content

- **Label**은 무엇을 넣는지를 말한다. "이름"이지 "이름을 입력하세요"가 아니다.
- **Placeholder**는 예시다. 라벨을 대신하지 않는다 — 입력을 시작하면 사라지기 때문이다.
- **Description**은 제약이나 형식을 말한다. `invalid`일 때는 **무엇이 틀렸고 어떻게 고치는지**를
  말한다. "잘못된 입력"이 아니라 "이미 쓰는 이름입니다".
- 도움말과 오류가 같은 자리를 쓴다. 둘이 동시에 뜨면 어느 것을 읽어야 하는지 모른다.

## Accessibility

- **라벨이 필수다.** 시각 라벨이 없으면 `aria-label`을 준다. 제품의 대부분의 필드는 시각 라벨이
  없고 placeholder가 그 역할을 대신하는데, 그 구조는 옮기지 않았다.
- id는 컴포넌트가 인스턴스마다 발급한다. 호출부가 만들면 같은 화면에 필드가 여럿일 때 겹친다.
- **오류를 색만으로 알리지 않는다.** `aria-invalid`와 `aria-describedby`로 연결된 문구가 함께 뜨고,
  그 문구는 `role="alert"`이라 뜨는 즉시 읽힌다. 도움말은 alert가 아니다 — 화면을 여는 것만으로
  스크린 리더가 시끄러워지면 안 된다.
- 포커스 링은 박스가 받는다. `<input>`에 걸면 링이 글자 주위에만 뜨고 슬롯이 밖에 남는다.
- **`sm`(24)은 44px 최소 타겟에 미달하며, 이 컴포넌트는 그것을 메울 수 없다.** `Button`·
  `IconButton`은 `.louis-hit-target`이 시각 크기를 그대로 두고 타깃만 넓히는데, 그 유틸은
  `::after` 절대배치 오버레이라 필드 위를 덮어 캐럿 배치와 드래그 선택을 가로챈다. 그래서 이
  컴포넌트는 세 칸 어디에도 그 유틸을 쓰지 않는다. WCAG 2.2 AA의 24×24는 만족하고 44px(AAA)는
  만족하지 않는다 — **알려진 편차이며 해결이 아니다.** DS-D-0032가 「`sm`은 `.louis-hit-target`을
  반드시 함께 붙인다」고 적은 계약을 이 컴포넌트만 지키지 못한다.
- placeholder는 `color-fg-secondary`다. `foreground-tertiary`는 light에서 배경 대비
  **3.96:1**로 4.5:1에 미달한다.

## Specification

| 축 | lg | md | sm | 토큰 |
| --- | ---: | ---: | ---: | --- |
| 높이 | 40px | 32px | 24px | `layout-control-height-lg` / `-md` / `-sm` |
| 좌우 여백 | 16px | 12px | 8px | `space-control-lg` / `-md` / `-sm` |
| 슬롯 간격 | 8px | 8px | 8px | `space-control-sm` |
| stack 간격 | 4px | 4px | 4px | `space-control-xs` |
| 반경 | 12px | 12px | 8px | `radius-control` / `radius-control-sm` |
| 헤어라인 (inset) | 0.5px | 0.5px | 0.5px | `border-width-hairline` + `color-stroke-hairline` |
| 값 타이포 | 14/1.5 | 14/1.5 | 12/1.5 | `typography-body-sm-regular` / `typography-caption-regular` |
| 라벨 타이포 | 14/1.5 | 14/1.5 | 14/1.5 | `typography-body-sm-medium` |
| 메시지 타이포 | 12 | 12 | 12 | `typography-caption-regular` |

기하가 Button과 같은 계단인 이유는 하나다 — 같은 화면에 나란히 서는 컨트롤이 서로 다른 높이를
갖지 않게 하려는 것이다. 제품은 30·34·44·48px이 섞여 있다.

### `sm`의 값은 어디서 왔나

세 칸 중 `sm`만 **높이 말고도 갈리는 축이 둘 있다.** 어느 값이 실측이고 어느 값이 비례인지
축마다 적는다 — 둘 다 아닌 값은 정하지 않았다.

| 축 | 값 | 근거 |
| --- | ---: | --- |
| 높이 | 24 | [DS-D-0032](../governance/decisions/DS-D-0032-control-size-ladder-sm.md)가 정했다 |
| 좌우 여백 | 8 | **둘 다.** 사다리 비례(16 → 12 → 8)이자 디자인 실측이다 — 글자를 담은 24 자리 넷이 전부 좌우 8이었다 |
| 슬롯 간격 · stack 간격 | 8 · 4 | 비례. `lg`·`md`가 같으므로 `sm`도 같다. 인접 슬롯을 가진 실측 자리도 8이다 |
| 반경 | 8 | **실측.** 비례로는 12인데 24 높이에서 12는 높이의 절반이라 필드가 알약이 된다 |
| 값 타이포 | 12/1.5 | **실측.** 비례로는 14인데 잰 24 높이 컨트롤이 전부 12/150%였다 |
| 라벨 타이포 | 14/1.5 | 비례. 라벨은 박스 밖이라 24에 걸리지 않고, 24 위에 선 시각 라벨을 재지 못했다 |
| 최소 폭 · 아이콘 슬롯 | — | **열지 않는다.** 이 컴포넌트는 어느 칸에서도 두 계약을 갖지 않는다 |

실측한 자리는 Figma `OlYKERKOkgbxBEEoXGZW2c` page 14의 프레임 `1087:2383`(비디오 에디터)이고,
노드 번호는 [`components.measured.json`](../../figma/components.measured.json)의 `input.sizes.sm`이
갖는다. **그 화면에 TextField로 확정된 24 높이 자리는 없다** — 가장 가까운 것이 인스펙터
불투명도의 40×24 값 박스이고, DS-D-0032가 센 여섯 자리(가져오기 · 필터 탭 · 줌 칩 · 레인 토글)에
그것은 들어 있지 않다. 그래서 이 표의 실측 둘은 **그 여섯 자리와 그 값 박스가 공통으로 쓰는
값**이지, 이 컴포넌트가 그 화면에서 실제로 서는 자리를 잰 것이 아니다.

실제로 잰 것은 넷이다 — 가져오기 버튼 · 필터 탭 하나 · 줌 칩 · 값 박스. 여섯 중 나머지 둘은
아이콘만 든 정사각(레인 토글 24×24, 좌우 여백 0)이라 여백·타이포 판정에 쓸 수 없다.

반경만 그 넷이 갈린다. 앞의 셋은 8이고 값 박스만 6이다. **8을 골랐다** — 6에는 semantic
이름이 없고(원시 `radius-6`뿐이다), 같은 줄에 나란히 서는 형제 컨트롤들과 갈리며, `IconButton`도
`sm`에서 `radius-control-sm`을 고른다. 한 컴포넌트만 6으로 두면 도구 줄에서 필드의 모서리만
다른 곡률이 된다.

**`radius-control-sm`이라는 이름은 지금 두 뜻을 갖는다.** 이 토큰이 생긴 이유는 SegmentedControl의
중첩 반경(바깥 12에서 패딩 4를 뺀 8)이었고 크기 사다리와 무관했다. 오늘부터 `IconButton`과 이
컴포넌트가 그것을 「`sm` 칸의 컨트롤 반경」으로 읽는다. 값이 같아 지금은 부딪히지 않지만 두 뜻
중 하나가 움직이면 갈린다 — DS-D-0032가 SegmentedControl의 `xs`(28)를 두고 적은 것과 같은
형태의 미결이며, 이 문서는 그 사실만 적고 열지 않는다.

## Effects

없다. 그림자도 흐림도 쓰지 않는다.

## Implementation

- `caret-color`를 **선언하지 않는다.** 브라우저 기본이 `currentColor`이고 값 텍스트가
  `foreground-primary`이므로 자동으로 따라간다. 전용 토큰을 만들면 값과 캐럿이 따로 놀 수 있다.
- placeholder에 `opacity: 1`을 명시한다. Firefox가 기본으로 낮추는데, 대비를 계산해 놓고 브라우저가
  다시 흐리게 만들면 의미가 없다.
- 박스는 `<label>`이 아니라 `<div>`다. `<label>`로 두면 슬롯 안의 버튼을 눌러도 입력이 포커스를
  가져가 버튼이 동작하지 않는다.

## Known deviations

- **제품과 거의 모든 축이 다르다.** 정본이 없으므로 "다르다"가 결함이 아니다. 각 축의 판정은
  [`product.measured.json`](../../migration/product.measured.json)의 `text-field`에 있다.
- **Figma의 Focus는 링을 stroke로 그린다.** CSS는 `outline`인데 Figma에 outline이 없어 바깥으로
  나가는 사각형 stroke로 표현한다. 두께는 같고(`border-width-ring` 2px) 모서리 반경만 근사다.
- **Textarea가 없다.** 제품에는 여러 줄 입력이 최소 5벌 있다(노드 캔버스 프롬프트 계열). 같은
  박스 구조로 확장할 수 있으나 이번 범위가 아니다.
- **`sm`에서 라벨(14)이 값(12)보다 크다.** 값은 실측으로 내려갔고 라벨은 재지 못해 비례대로
  남았다. 도구 줄의 `sm` 필드는 보통 시각 라벨 없이 `aria-label`로 서므로 지금은 부딪히지
  않는다. 라벨을 가진 `sm` 필드가 실제로 생기면 **그때 재서** 정한다 — 여기서 유도하면 재지 않은
  값을 하나 지어내는 것이 된다.
- **`sm`의 반경 8은 이 컴포넌트를 잰 값이 아니다.** 디자인의 24 자리 여섯은 8이고 가장 가까운
  값 박스만 6이다. 판정 근거는 위 「`sm`의 값은 어디서 왔나」에 있다.
- **Figma에 `sm` variant가 없다.** [DS-D-0028](../governance/decisions/DS-D-0028-three-in-one-change.md)
  규칙 1의 세 곳 중 LOUIS만 움직였다. `verify-figma-parity`가 코드 타입 `TextFieldSize`에서 축을
  읽으므로 **그 게이트는 지금 빨갛고, 그것이 이 변경의 정확한 상태다.** 위 Availability 표의
  「component set 8 variant」도 Figma가 따라온 뒤에 갱신된다.
- **컨트롤 테두리 정본은 이제 닫혔다.** 이전엔 `color-stroke-control`을 썼는데 IconButton은 같은
  자리에 `color-stroke-default`를 써서 저장소 안 정본이 정해지지 않은 채였다. [DS-D-0023](../governance/decisions/DS-D-0023-hairline-inset.md)이
  모든 일반 0.5px stroke를 단일 `color-stroke-hairline` generic 헤어라인으로 통일해 (2b)를 닫았다 —
  Button·IconButton·TextField가 이제 같은 색·두께를 쓴다.

## Acceptance tests

1. lg/md/sm의 높이·좌우 여백·슬롯 간격·반경·테두리·타이포가 `components.measured.json`과 같다.
2. Default·Invalid·Disabled의 면·전경·테두리가 states 표와 같다.
3. 포커스 링을 **박스**가 받고, 입력 자신은 링을 그리지 않으며, 접미 슬롯이 박스 안에 있다.
4. placeholder가 `foreground-secondary`이고 값과 다르며 `opacity: 1`이다.
5. 라벨의 `for`가 입력을 가리키고, 라벨을 누르면 입력에 포커스가 간다.
6. 필드가 둘 있을 때 두 입력의 id가 다르다.
7. `invalid`면 `aria-invalid="true"`, `aria-describedby`가 메시지를 가리키고, 메시지가
   `role="alert"`이며 문구가 실제로 있다.
8. `invalid`가 아니면 메시지가 `role="alert"`이 **아니다.**
9. 사다리가 이름 순서대로 내려간다 — lg 40 > md 32 > sm 24. 이름이 순서를 거짓말하는 상태를
   막는다(DS-D-0027이 고친 문제가 정확히 그것이었다).
10. `sm`의 반경이 높이의 절반보다 작다 — 필드가 알약이 되지 않는다. 토큰 이름만 읽으면 둘 다
    「control 반경」이라 계산값을 봐야 보인다.
