---
id: input
status: experimental
authority: normative
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

쓰지 않는 자리.

- 여러 줄. 그것은 Textarea이며 이 컴포넌트의 축이 아니다.
- 정해진 목록에서 고르는 것. 그것은 Select다.
- 체크박스·라디오·파일. 각자 다른 컴포넌트다.

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
3. **Box** — **시각적 필드.** 높이·여백·테두리·반경·배경을 소유하고 포커스 링을 받는다.
4. **Prefix / Suffix** — 박스 안의 슬롯. 아이콘과 버튼이 들어간다.
5. **Control** — 실제 `<input>`. 박스가 시각을 소유하므로 여기는 비어 있다.
6. **Message** — 도움말 또는 오류. 한 자리를 나눠 쓴다.

**시각적 필드가 `<input>`이 아닌 이유.** 접두 아이콘과 접미 버튼을 필드 *안에* 두려면 `<input>`
하나로는 안 된다. 제품의 가장 큰 계열(인증 9벌)도 같은 구조를 쓴다.

## Properties

| prop | 값 | 기본 | 뜻 |
| --- | --- | --- | --- |
| `label` | ReactNode | 없음 | 시각 라벨. 없으면 `aria-label`이 필수다 |
| `size` | `md` \| `sm` | `md` | 시각 크기. 글자 크기는 바뀌지 않는다 |
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
| Default | `color-border-control` 테두리 |
| Hover | **바뀌지 않는다** |
| Focus | 박스가 `:focus-within`으로 공유 링을 받는다 |
| Invalid | `color-border-danger` 테두리 **+ 오류 문구 + `aria-invalid`** |
| Disabled | `color-border-subtle` 테두리, 전경 `color-foreground-disabled` |

**hover에서 아무것도 바꾸지 않는다.** 필드의 어포던스는 보이는 테두리와 텍스트 커서가 맡는다.
제품의 필드들도 대부분 hover 상태를 갖지 않는다.

**Focus는 states 표에 없다.** 색이 아니라 outline이라 면·전경·테두리 세 값으로 표현되지 않는다 —
브라우저 테스트가 따로 대조한다.

## Interaction and responsive behavior

- 박스 어디를 눌러도 텍스트 커서가 나온다(`cursor: text`). 슬롯 안의 버튼은 자기 커서를 갖는다.
- 높이는 `min-block-size`다. 200% 확대나 긴 값에서 잘리는 대신 자란다.
- 폭은 호출부가 정한다. 필드가 스스로 폭을 갖지 않는 이유는 폼의 격자가 그것을 소유하기 때문이다.

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
- placeholder는 `color-foreground-secondary`다. `foreground-tertiary`는 light에서 배경 대비
  **3.96:1**로 4.5:1에 미달한다.

## Specification

| 축 | md | sm | 토큰 |
| --- | ---: | ---: | --- |
| 높이 | 40px | 32px | `layout-control-height-md` / `-sm` |
| 좌우 여백 | 16px | 12px | `space-control-lg` / `-md` |
| 슬롯 간격 | 8px | 8px | `space-control-sm` |
| stack 간격 | 4px | 4px | `space-control-xs` |
| 반경 | 12px | 12px | `radius-control` |
| 테두리 | 0.5px | 0.5px | `border-width-hairline` |
| 값 타이포 | 14/1.5 | 14/1.5 | `typography-body-sm-regular` |
| 라벨 타이포 | 14/1.5 | 14/1.5 | `typography-body-sm-medium` |
| 메시지 타이포 | 12 | 12 | `typography-caption-regular` |

기하가 Button과 같은 계단인 이유는 하나다 — 같은 화면에 나란히 서는 컨트롤이 서로 다른 높이를
갖지 않게 하려는 것이다. 제품은 30·34·44·48px이 섞여 있다.

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
- **`color-border-control`을 쓴다.** 그런데 IconButton은 같은 자리에 `color-border-default`를
  쓴다 — 컨트롤 테두리의 정본이 저장소 안에서 아직 정해지지 않았다. 값도 다르다(전자는 반투명,
  후자는 불투명). 이 불일치는 이 컴포넌트가 만든 것이 아니라 드러낸 것이다.

## Acceptance tests

1. md/sm의 높이·좌우 여백·슬롯 간격·반경·테두리·타이포가 `components.measured.json`과 같다.
2. Default·Invalid·Disabled의 면·전경·테두리가 states 표와 같다.
3. 포커스 링을 **박스**가 받고, 입력 자신은 링을 그리지 않으며, 접미 슬롯이 박스 안에 있다.
4. placeholder가 `foreground-secondary`이고 값과 다르며 `opacity: 1`이다.
5. 라벨의 `for`가 입력을 가리키고, 라벨을 누르면 입력에 포커스가 간다.
6. 필드가 둘 있을 때 두 입력의 id가 다르다.
7. `invalid`면 `aria-invalid="true"`, `aria-describedby`가 메시지를 가리키고, 메시지가
   `role="alert"`이며 문구가 실제로 있다.
8. `invalid`가 아니면 메시지가 `role="alert"`이 **아니다.**
