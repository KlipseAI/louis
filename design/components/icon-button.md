---
id: icon-button
status: experimental
authority: normative
summary: 아이콘 하나로 뜻이 분명할 때 라벨 없이 액션을 담습니다.
---

# Icon Button

라벨 없이 아이콘만으로 액션을 표현한다. 공간이 없어서가 아니라 **아이콘 하나로 뜻이 명확할 때만**
쓴다. 뜻이 흔들리면 [Button](button.md)에 라벨을 쓴다.

## Availability

| Surface       | 상태           | 근거                                                      |
| ------------- | -------------- | --------------------------------------------------------- |
| Web           | `partial`      | public export와 acceptance test; visual regression과 제품 소비 증거 없음 |
| Figma         | `partial`      | component set 40 variant (Variant 4 × Size 2 × State 5). **Size 축이 코드보다 한 칸 적다** — sm이 아직 없다. publish는 DS-F-008 |
| Documentation | `done`         | 이 문서                                                   |
| Maturity      | `experimental` | 규범과 구현이 같은 변경 단위에서 처음 선다                |

## 왜 Button의 prop이 아닌가

`Button`을 아이콘 전용으로 렌더한 결과를 실측했다 — **md 54×38, sm 46×30으로 정사각이 아니다.**
빈 라벨과의 `gap` 8px과 좌우 padding이 그대로 남기 때문이다. 기하가 다르다.

기하보다 결정적인 것은 **접근성 계약이 다르다**는 점이다. Button은 이름이 children에서 오므로
`label`을 필수로 만들 수 없다. Icon Button은 라벨이 없으면 **이름이 아예 없는 버튼**이 되므로
`label`을 필수 prop으로 강제한다. "children이 비었을 때만 필수"는 타입으로 표현할 수 없다.

## API

```tsx
import { IconButton } from "@klipse-design/react";
import { IconTrashSimple } from "@klipse-design/react/icons";

<IconButton label="삭제" variant="ghost" onClick={remove}>
  <IconTrashSimple />
</IconButton>
```

## Anatomy

1. Root — 네이티브 `<button>`, 정사각형
2. Glyph — 아이콘 하나. 항상 장식이며 보조 기술에서 숨는다
3. 이름 — `label`이 `aria-label`이 된다. 화면에는 보이지 않는다

## Properties

| Prop        | 값                                        | 기본값    | 설명                                        |
| ----------- | ----------------------------------------- | --------- | ------------------------------------------- |
| `label`     | string                                    | **필수**  | accessible name. 생략할 수 없다             |
| `variant`   | `primary`, `secondary`, `ghost`, `danger` | `ghost`   | Button과 같은 축                            |
| `size`      | `lg`, `md`, `sm`                          | `md`      | lg·md 32×32, sm 24×24                       |
| `pressed`   | boolean                                   | —         | 토글일 때만 준다. `aria-pressed`가 된다     |
| `disabled`  | boolean                                   | `false`   | 네이티브 비활성                             |

`children`은 아이콘 하나다. 텍스트를 넣지 않는다.

## Hierarchy와 variants

- variant는 Button과 같은 네 축을 쓴다. 새 시각 언어를 만들지 않는다.
- **Button의 다섯 번째 축 `inverse`는 없다.** icon-button.css에 그릴 규칙이 없고 제품 타입도
  넷이다. React가 `ButtonVariant`를 그대로 물려받고 있어 스타일 없이 렌더되는 조합을
  타입이 통과시켰다 — `IconButtonVariant`로 분리했다(2026-08-26).
- **기본값이 `ghost`인 이유**: 아이콘 전용 버튼은 대개 밀집한 도구 영역에 놓인다. 그 자리에서
  `primary`가 기본이면 화면에 경쟁하는 강조가 늘어난다.
- 크기는 padding이 아니라 **한 변의 길이**로 정한다. Button은 고정 높이가 없지만 Icon Button은
  정사각이 계약이므로 높이를 직접 소유한다.
- 사다리는 세 칸이지만 **아이콘 버튼에서 실제로 갈리는 것은 둘이다.** `lg`와 `md`는 둘 다
  `layout-control-height-md`(32)를 읽는다 — 40을 쓰는 자리가 제품에 없어서 축만 남겨 두었고
  ([DS-D-0027](../governance/decisions/DS-D-0027-control-size-ladder.md)), 값이 갈라지면 그때
  나뉜다. `sm`은 `layout-control-height-sm`(24)로 실제로 갈린다.
- **`sm`은 편집 표면의 도구 줄 전용이다.** 캔버스·타임라인·에셋 패널처럼 한 줄에 컨트롤이 여럿
  서고 화면의 주인공이 컨트롤이 아닌 자리에만 쓴다. 폼·대화상자·본문 흐름에는 `md`를 쓴다
  ([DS-D-0032](../governance/decisions/DS-D-0032-control-size-ladder-sm.md)).
- 한 영역에 아이콘 전용 버튼이 여럿이면 강조를 나누지 말고 전부 `ghost`로 둔다. 아이콘만으로는
  강조 차이가 라벨만큼 읽히지 않는다.

## States

상태 이름의 뜻은 [Interaction states](../foundations/interaction-states.md)가 소유한다.
Icon Button은 `active`(누르는 중)와 `pressed`(토글 켜짐)를 **둘 다** 갖는 첫 컴포넌트다.

| 상태       | 표현                                      | 비고                                        |
| ---------- | ----------------------------------------- | ------------------------------------------- |
| default    | variant의 기본 면                         |                                             |
| hover      | 면 강조만 바뀐다                          | hover에서만 드러나는 기능을 두지 않는다     |
| active     | `scale: 0.98`                             | reduced-motion에서는 이동을 제거한다        |
| pressed    | `aria-pressed`와 면 강조                  | **토글에만** 쓴다                           |
| disabled   | 네이티브 `disabled`, 전경 disabled 색     | 클릭이 실행되지 않고 그렇게 보인다          |

- `pressed`와 `active`는 **다른 축**이다. `active`는 누르고 있는 동안이고 `pressed`는 토글의 켜짐
  상태다. 둘을 같은 시각으로 표현하면 토글이 눌린 것인지 켜진 것인지 구분되지 않는다.
- `pressed`는 토글에만 쓴다. 한 번 실행되고 끝나는 액션에 주면 스크린리더가 상태를 잘못 읽는다.
- **hover와 active는 `pressed`를 덮지 않는다.** 지속 상태를 일시적 상태가 지우면 포인터를 얹는
  동안 토글이 꺼진 것으로 보인다. 실제로 그렇게 돼 있었다 — pressed primary에 hover하면 배경이
  variant 색으로 되돌아가고 글자만 pressed 색으로 남았다. CSS 특정성이 `[aria-pressed]`(0,2,0)보다
  `:hover[data-variant]`(0,3,0)가 높았기 때문이다. hover/active 규칙에서 pressed를 제외해 고쳤다.
- **`pressed`에는 별도의 hover 면이 없다.** 켜진 상태에서 포인터 피드백이 사라진다. Known
  deviations 참조.
- `loading` 상태는 아직 없다. Known deviations 참조.

## Interaction and responsive behavior

- **시각 크기와 hit area를 분리한다.** 컴포넌트가 `.louis-hit-target`을 직접 붙이므로, `sm`이
  24×24로 보여도 실제 히트 영역은 44×44다 — 보이지 않는 의사 요소가 중앙에 깔린다
  ([Inclusive Design](../foundations/inclusive-design.md)). 호출부가 따로 감쌀 필요가 없다.
  **세 칸 중 `sm`에서 그 간격이 가장 크다**(24 ↔ 44, 한 변당 20px). 그래서 이 장치가 없으면 `sm`은
  사다리의 칸이 아니라 그냥 작은 버튼이 되고, 겹침이라는 대가도 함께 온다 — Known deviations 참조.
- 뷰포트로 크기를 자동 전환하지 않는다. 밀집도는 화면 폭이 아니라 **그 자리의 역할**이 정한다.

## Content

- `label`은 동사로 쓴다 — "삭제", "닫기", "재생". 아이콘 이름("휴지통")이 아니다.
- 토글이면 **현재 상태가 아니라 수행할 동작**을 쓴다. 음소거 상태에서 라벨은 "음소거 해제"다.

## Accessibility

- 이름은 `label` 하나에서 온다. 아이콘에는 `label`을 주지 않는다 — 주면 이름이 두 겹으로 읽힌다
  ([Iconography](../foundations/iconography.md)).
- 아이콘은 항상 `aria-hidden`이다. Icon Button이 감싸는 span이 그것을 보장한다.
- `pressed`를 준 경우에만 `aria-pressed`가 붙는다. 주지 않으면 속성 자체가 없다 — `false`를 늘
  붙이면 일반 버튼이 토글로 노출된다.
- focus ring은 `.louis-focus-ring`이 소유한다.

## Specification

| 항목      | lg                              | md                              | sm                                 |
| --------- | ------------------------------- | ------------------------------- | ---------------------------------- |
| 한 변     | `layout-control-height-md` 32px | `layout-control-height-md` 32px | `layout-control-height-sm` 24px    |
| 글리프    | `icon-size-sm` 16px             | `icon-size-sm` 16px             | `icon-size-sm` 16px                |
| radius    | `radius-control` 12px           | `radius-control` 12px           | `radius-control-sm` 8px            |
| 히트 영역 | 44×44                           | 44×44                           | 44×44                              |

글리프 크기가 세 size에서 같은 이유: 아이콘은 **컨테이너와 독립**이다(Iconography Size model).
16px 글리프가 32 컨테이너에서 여백 8, 24에서 여백 4를 갖는다.

**`sm`의 반경만 사다리에서 갈린다.** 두 근거가 같은 값을 가리킨다.

1. **디자인 실측** — 비디오 에디터 아트보드의 트랙 레인 토글이 24 정사각에 반경 8이다. 같은
   화면에서 24를 쓰는 나머지 컨트롤(가져오기 버튼·필터 탭·줌 칩)도 전부 8이라, 이 값은 한 자리의
   취향이 아니라 그 화면이 24에 쓰는 반경이다.
2. **기하** — 24 정사각에서 12는 한 변의 절반이라 **완전한 원**이 된다. `radius-control`은 32에서
   모서리를 깎는 값이지 형태를 바꾸는 값이 아니었는데, 24에 그대로 쓰면 아이콘 버튼만 알약 언어로
   갈아탄다. 8은 이미 `radius-control-sm`이라는 이름을 갖고 있어 새 토큰이 필요하지 않다.

## Implementation

- `packages/react/src/icon-button/icon-button.tsx`
- `packages/css/src/component/icon-button.css`
- variant/state 시각은 `.louis-button`의 규칙을 재사용하지 않고 자체 선택자를 갖는다. 공유하면
  Button의 padding 계약이 정사각 계약과 충돌한다.

## Known deviations

| 항목 | 상태 | 사유 |
| --- | --- | --- |
| pressed의 hover 면 | 없음 | `background-inset`보다 한 단계 강한 중립 표면 토큰이 없다. 만들면 hover가 pressed를 덮지 않으면서도 피드백을 줄 수 있다. DS-P3-014 대상 |
| Figma 글리프 색 | instance override | Figma에는 `currentColor`가 없어 아이콘 instance 안 vector의 stroke를 variant마다 직접 변수에 다시 묶었다. 아이콘 정본이 바뀌어도 이 override는 따라오지 않는다 — 재적용은 수동이다 |
| `loading` 상태 | 없음 | 아이콘 자리에 무엇을 넣을지 미정. Button의 loading과 같은 축인지 판정이 필요하다 |
| 제품 32×32 radius 12 ↔ 모바일 40×40 radius 14 | 미채택 | 제품은 ≤719px에서 radius를 14로 바꾼다. 뷰포트로 radius를 바꾸는 근거를 찾지 못해 12로 고정했다 |
| `sm`의 글리프가 디자인보다 2px 크다 | 알려진 편차 | 디자인은 24 안에 **14px** 글리프를 그렸다. `icon-size` 계단은 16·20·24(·64)여서 14가 없고, 새 원시 토큰을 여는 것은 이 컴포넌트의 몫이 아니다. 그래서 세 칸이 공유하는 `icon-size-sm`(16)을 그대로 쓴다 — 여백이 한 변당 5가 아니라 4가 된다. 14를 계단에 들이는 판정은 토큰 단계로 넘긴다 |
| `sm`을 붙여 세우면 44 히트 영역이 앞 버튼의 **시각 박스 안까지** 덮는다 | 알려진 편차 | `.louis-hit-target`은 시각 박스 밖으로 한 변당 10px씩 넓힌다. `sm` 둘을 간격 없이 나란히 두면 중심 간 거리가 24라 타깃이 20px 겹치고, 겹친 자리는 나중에 그려진 형제가 가져간다(위치 지정 요소끼리는 DOM 순서가 곧 그리는 순서다). 실측했다 — 0~24와 24~48에 선 `sm` 두 개에서 `document.elementFromPoint(22, ...)`가 **왼쪽 버튼의 눈에 보이는 영역 안인데도 오른쪽 버튼을 돌려준다.** 디자인의 레인 토글 두 개가 정확히 그 배치다. 24 자체는 WCAG 2.2 AA(24px)를 만족하지만, 두 액션의 결과가 다르면 이것은 여유분 낭비가 아니라 오작동이다. 해결하지 않고 기록한다 — 도구 줄이 `sm`을 이웃하게 놓을 때는 간격을 준다 |
| Figma의 Size 축에 `sm`이 없다 | 미전파 | 코드와 규범은 세 칸인데 component set은 `lg`·`md` 둘뿐이다. `verify-figma-parity`가 그 차이를 낸다 — [DS-D-0032](../governance/decisions/DS-D-0032-control-size-ladder-sm.md)가 적은 대로 Figma 반영은 다음 단계다 |

## Acceptance tests

1. lg·md가 32×32, sm이 24×24 정사각이다.
2. 시각 크기와 무관하게 히트 영역이 44×44 이상이다 — `sm`에서도 그렇다.
3. `label`이 accessible name으로 정확히 한 번 노출된다.
4. 내부 아이콘이 accessibility tree에 노출되지 않는다.
5. `pressed`를 주지 않으면 `aria-pressed` 속성이 없다.
6. `pressed`를 주면 `aria-pressed`가 그 값으로 붙는다.
7. `disabled`면 클릭 핸들러가 실행되지 않는다.
8. 부모 `color` 변경이 글리프에 반영된다.
9. 세 size의 글리프 계산 박스가 모두 16px다.
10. 토글이 켜진 상태를 hover가 덮지 않는다.
11. `sm`의 반경이 8px이고, lg·md의 반경이 12px이다.

## Migration and changelog

- 2026-08-15 — 첫 공개. 세 화면 실측에서 raw `<button>` 108개 중 다수가 아이콘 전용이었고,
  `Button`으로는 정사각이 되지 않는다는 실측이 근거다.
- 2026-08-31 — `sm`(24) 추가([DS-D-0032](../governance/decisions/DS-D-0032-control-size-ladder-sm.md)).
  새 비디오 에디터 화면의 트랙 레인 토글이 소비처다. 같은 변경에서 **크기 절 전체를 다시 썼다** —
  DS-D-0027의 개명(구 `md`→`lg`, 구 `sm`→`md`)이 토큰과 React 타입에만 들어가고 이 문서에는
  들어오지 않아, 한 변을 40/32로 적고 글리프를 20px로 적고 있었다. CSS는 그때부터 32/32에
  16px이었다. `layout-control-height-sm`이 24가 된 오늘부터 그 문장들은 **있는 토큰을 틀린 값으로**
  가리키게 되므로 함께 고쳤다.
