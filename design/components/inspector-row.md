---
id: inspector-row
status: experimental
authority: normative
summary: 속성 패널의 라벨-값 한 줄이며 값 자리의 네 형태를 한 축으로 접습니다.
---

# Inspector Row

속성 패널에서 **이름 하나와 값 하나**를 한 줄에 세운다. 행 자체가 박스이고 라벨이 왼쪽,
값이 오른쪽에 선다. 값 자리는 네 형태(글자 · 숫자 칸 · 색 점 · 알약)를 갖고 그것이 이
컴포넌트의 유일한 축이다.

**부품 다섯이 아니라 문법 하나다.** 편집기 인스펙터 다섯 보드는 이 행과
[Inspector Section Head](inspector-section-head.md)의 배치일 뿐이고, 알약 · 숫자 칸 · 색 점은
독립 부품이 아니라 이 행의 값 형태다. 다섯을 따로 세우면 문법이 아니라 부품 다섯이 된다.

## Availability

| Surface       | 상태           | 근거                                                    |
| ------------- | -------------- | ------------------------------------------------------- |
| Web           | `partial`      | `packages/css/src/component/inspector-row.css` (React 표면 없음) |
| Figma         | `partial`      | component set `InspectorRow` (4 variant)                |
| Documentation | `done`         | 이 문서                                                 |
| Maturity      | `experimental` | 소비처가 붙고 상태 축이 실측으로 판정되면 beta          |

## When to use

- 속성 패널·설정 패널에서 **한 줄에 이름과 값 하나**를 보일 때.
- 값이 상태 어휘일 때(`없음` · `자동`)는 `Value=Pill`, 색일 때는 `Value=Color`,
  숫자를 직접 고칠 수 있을 때는 `Value=Number`.

쓰지 않는 자리:

- 라벨이 값 **위**에 오는 세로 배치. 이 행은 28 한 줄이라 그 배치를 표현하지 못한다.
- 값이 여러 개이거나 컨트롤이 두 줄 이상인 자리 — 그것은 절이지 행이 아니다.
- 목록의 선택 행 — 그것은 `SelectableListRow`다.

## Anatomy

1. **Row** — 박스. 224×28(폭은 패널이 정한다) · 반경 8 · 안쪽 여백 0 8 · 사이 간격 10.
2. **Label** — 남는 자리를 먹고 한 줄로 잘린다.
3. **Value** — 오른쪽 끝에 붙는 값 묶음. 안쪽 사이 간격 8.
4. 값 형태 넷 — **ValueText**(글자) · **Dot**(8 원) + ValueText · **Pill**(높이 20 · 반경 6 ·
   1px 테두리) · **Number**(140×28 · 반경 8 · 안쪽 여백 0 10).

## Properties

| Property    | 값                            | 기본값  | 설명                                    |
| ----------- | ----------------------------- | ------- | --------------------------------------- |
| `Value`     | Text \| Number \| Color \| Pill | `Text`  | 값 자리의 **구조**. 가시성 축이 아니다. |
| `Label`     | 텍스트                        | `라벨`  | 행의 이름                               |
| `ValueText` | 텍스트                        | `자동`  | 값 글자. 네 형태 모두 이 슬롯을 쓴다    |

`Value`가 불리언 넷이 아닌 이유: 네 형태는 서로 다른 노드를 갖고, Figma의 불리언은
component set 단위라 한 변형에서 슬롯을 숨기면 다른 변형에서도 사라진다. 「이 형태에는 그
자리가 없다」는 가시성이 아니라 구조다.

## Variants, sizes, and states

크기 축이 없다. 행 높이는 하나이며 `layout-inspector-control-height`(28)를 읽는다 —
컨트롤 사다리의 `layout-control-height-sm`(24)이 아니라 인스펙터 전용 칸이고,
`SegmentedControl`의 `xs`가 이미 같은 토큰을 읽는다.

## States

행과 라벨은 대화형이 아니다. 대화형인 것은 `Value=Number`의 숫자 칸 하나이며 **상태 축을
열지 않았다.** 정본에서 그 칸이 갖는 시각 상태는 hover 하나뿐이고(면이 같은 색의 옅은 판으로
바뀐다), 스크럽(드래그)과 편집은 시각 선언이 없다 — 드래그는 문서 전체의 커서를 바꿀 뿐이고,
편집(`:focus`)의 링이 패널 안에서 살아남는지는 소스로 판정할 수 없다(같은 특이도의 두 선언이
경쟁해 승자가 유틸리티 정렬 순서에 달렸다). **값이 같은 변형을 나열하면 죽은 축이 된다.**
그 판정은 브라우저 실측이 서면 다시 연다 — Known deviations 3.

## Interaction and responsive behavior

- 라벨이 길면 한 줄에서 말줄임으로 잘린다. 값은 잘리지 않는다 — 잘린 값은 틀린 값이다.
- 719px 이하에서 행 높이가 `layout-control-hit-target-minimum`(44)으로 자란다.
  Figma에는 그 폭의 변형이 없고 레시피의 미디어 쿼리가 소유한다.
- 숫자 칸은 좌우 드래그 스크럽 · 산술식 입력 · ↑↓ 증감을 받는다. 그것은 **동작이지 값이
  아니라서** 레시피와 계약에 적을 것이 없고 소비처가 진다.

## Content

- 라벨은 명사구 한 낱말~두 낱말. 문장을 쓰지 않는다.
- 값은 단위를 붙여 쓴다(`24px` · `1.5s`). 숫자만 쓰면 무엇의 수인지 라벨에 의존하게 된다.
- KO `불투명도 / 80%` · EN `Opacity / 80%` · JA `不透明度 / 80%`.
- 값이 없을 때는 빈 칸이 아니라 알약으로 `없음`을 쓴다 — 빈 칸은 「불러오는 중」과 구분되지
  않는다.

## Accessibility

- 행은 표의 한 줄처럼 읽혀야 한다. 라벨과 값을 각각 요소로 두고 값이 입력이면
  `aria-label`로 라벨을 잇는다 — 시각적 근접만으로는 이름이 되지 않는다.
- 색 점은 값이 아니라 값의 **반복**이다. 점 옆의 글자가 색을 말해야 하고 점은
  `aria-hidden`이다 — 색이 유일한 신호가 되면 WCAG 1.4.1을 스스로 깬다.
- 숫자 칸은 `role="spinbutton"`과 `aria-valuenow`/`min`/`max`를 갖는다.
- 44px 최소 타깃은 719px 이하에서 행 높이로 충족된다. 그보다 넓은 폭에서 28 한 줄인 것은
  포인터 전용 편집 표면의 예외다.

## Specification

| Part/state | Token or recipe                                  | 구현 근거                       |
| ---------- | ------------------------------------------------ | ------------------------------- |
| Row 높이   | `layout-inspector-control-height`                | `.louis-inspector-row`          |
| Row 여백   | `space-control-sm`                               | `.louis-inspector-row`          |
| Row 사이   | 10 (계단 밖 · 레시피 주석이 사유를 갖는다)       | `.louis-inspector-row`          |
| Row 반경   | `radius-control-sm`                              | `.louis-inspector-row`          |
| Row 면     | `color-bg-inset`                                 | `.louis-inspector-row`          |
| Label      | `typography-caption-medium` · `color-fg-secondary` | `.louis-inspector-row__label` |
| Value 사이 | `space-control-sm`                               | `.louis-inspector-row__value`   |
| Dot        | 8 · `radius-pill`                                | `.louis-inspector-row__dot`     |
| Pill       | 높이 20 · 여백 6 · 반경 6 · `border-width-default` · `color-bg-canvas` | `.louis-inspector-row__pill` |
| Number     | 140×28 · 여백 10 · `radius-control-sm` · `color-bg-raised` | `.louis-inspector-row__number` |

값의 출처는 `figma/components.measured.json`의 `inspector-row.row`가 `$` 사유로 하나씩
인용한다.

## Implementation

- Web source: `packages/css/src/component/inspector-row.css`
- Public import: CSS 레시피 전용 — React 표면이 없다.
- Figma component: `InspectorRow` (page `DS · Components`)
- Tests/visual evidence: `scripts/verify-figma-parity.mjs`의 `inspector-row` 계약이
  Figma 기하를 `figma/components.measured.json`과 대조한다. 브라우저 되재기는 아직 없다.

## Known deviations

1. **면이 정본과 갈린다 — 이제 라이트만이 아니라 다크도 그렇다.** 정본은 팔레트 칸을 테마마다
   직접 골랐다(행 다크 gray-800 / 라이트 gray-100, 숫자 칸 다크 gray-700 / 라이트 gray-300).
   **한동안 다크는 `color-bg-inset` · `color-bg-raised` 와 정확히 같았고 라이트만 어긋났다.**
   그 등식은 다크 면 사다리를 내린 두 회차가 깼다 — `3a2ca71` 이 `bg-inset`(dark)을
   `palette-gray-800` → `850` 으로, 2026-09-09 의 이동이 다시 `850` → `900` 으로 내리고
   `bg-raised`(dark)를 `palette-gray-700` → `800` 으로 내렸다. 지금은 행이 두 칸(정본
   gray-800 대 `bg-inset` gray-900), 숫자 칸이 한 칸(정본 gray-700 대 `bg-raised` gray-800)
   어긋난다. 라이트는 전과 같이 한 칸(행) 그리고 여러 칸(숫자 칸) 어긋난다.
   **판정은 바뀌지 않는다.** 레시피는 팔레트 칸이 아니라 **관계**를 고정하기 때문이다 — 행은
   한 칸 들어가고 그 안의 컨트롤은 한 칸 나온다. 넷이 함께 내려갔으므로 그 관계는 그대로다.
   정본의 라이트가 이 사다리 위에 없는 것은 그 화면이 다크를 먼저 그리고 라이트를 팔레트로
   번역했기 때문이며, 움직여야 할 쪽은 정본이다. **소유자 확인 대상이다** — 이제 확인할 것이
   라이트 한 축이 아니라 두 축이다.
2. **알약 테두리가 0.5 inset 헤어라인이 아니라 진짜 1px이다.** 이 시스템에서 그런 자리는
   여기와 `SegmentedCodeInput` 둘뿐이다. 알약의 면이 패널 바닥과 같은 값이라 경계가 사라지면
   알약이 사라지고, 기법을 바꾸면 20 높이 상자의 바깥 치수도 함께 움직인다. 기법 통일은 그
   둘을 한 묶음으로 놓고 판정한다.
3. **숫자 칸의 상태 축이 비어 있다.** 위 States가 사유를 갖는다. hover 한 칸을 열려면 정본의
   「같은 면을 80%로」를 이 시스템의 어느 토큰이 표현할지 정해야 하고, 그 자리는 사다리에 없다.
4. **알약의 tone 축을 들여오지 않았다.** 정본에 tone 넷이 선언돼 있으나 **셋의 선언이 글자까지
   같아 죽어 있다.** `Badge`로 흡수하는 선택지는 세 이유로 막혀 있다 — 죽은 축을 들여오게 되고,
   `Badge` 계약의 `borderWidth: 0` 규칙과 어긋나며, `Badge`에 size 축을 열면 이미 배포된 set의
   격자가 두 배가 된다. **소유자 판정 대상이다.**
5. **색 점의 색은 소비처가 준다.** Figma에서는 `color/accent-primary`에 묶어 두었고 그것은
   값이 아니라 표본이다. 이 레시피에서 색을 토큰으로 두지 않는 유일한 자리다.
6. **자막 색 패널의 행은 채택하지 않았다.** 같은 문법으로 보이지만 라벨이 컨트롤 **위**에
   쌓이고 컨트롤이 30 색 견본이라 28 한 줄이 표현하지 못한다. 채택하려면 세로 행 형태와
   `Value=Swatch` 칸을 함께 열어야 하고 그것은 별개의 결정이다.

## Acceptance tests

- Figma `InspectorRow`의 네 변형이 한 키(`row`)로 되읽혀 기하 배열이 전부 길이 1이다 —
  값 형태가 행의 기하를 바꾸지 않는다는 계약이다.
- `rawFills` · `rawStrokes` · `textUnstyled`가 0이다.
- 알약의 stroke가 `1|INSIDE` 하나이고 그 밖의 두께가 없다.
- 라벨을 긴 문구로 바꿔도 행이 두 줄이 되지 않고 값이 잘리지 않는다.

## Migration and changelog

새 컴포넌트다. 대체하는 API가 없다. [Updates](../updates/README.md)를 본다.
