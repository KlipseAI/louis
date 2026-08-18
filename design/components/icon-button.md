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
| Figma         | `partial`      | component set 40 variant (Variant 4 × Size 2 × State 5). publish는 DS-F-008 |
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
| `size`      | `md`, `sm`                                | `md`      | md 40×40, sm 32×32                          |
| `pressed`   | boolean                                   | —         | 토글일 때만 준다. `aria-pressed`가 된다     |
| `disabled`  | boolean                                   | `false`   | 네이티브 비활성                             |

`children`은 아이콘 하나다. 텍스트를 넣지 않는다.

## Hierarchy와 variants

- variant는 Button과 같은 네 축을 쓴다. 새 시각 언어를 만들지 않는다.
- **기본값이 `ghost`인 이유**: 아이콘 전용 버튼은 대개 밀집한 도구 영역에 놓인다. 그 자리에서
  `primary`가 기본이면 화면에 경쟁하는 강조가 늘어난다.
- 크기는 padding이 아니라 **한 변의 길이**로 정한다 — `layout-control-height-md`(40)와
  `layout-control-height-sm`(32). Button은 고정 높이가 없지만 Icon Button은 정사각이 계약이므로
  높이를 직접 소유한다.
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

- **시각 크기와 hit area를 분리한다.** 컴포넌트가 `.kds-hit-target`을 직접 붙이므로, sm이 32×32로
  보여도 실제 히트 영역은 44×44다 — 보이지 않는 의사 요소가 중앙에 깔린다
  ([Inclusive Design](../foundations/inclusive-design.md)). 호출부가 따로 감쌀 필요가 없다.
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
- focus ring은 `.kds-focus-ring`이 소유한다.

## Specification

| 항목      | md                              | sm                              |
| --------- | ------------------------------- | ------------------------------- |
| 한 변     | `layout-control-height-md` 40px | `layout-control-height-sm` 32px |
| 글리프    | `icon-size-md` 20px             | `icon-size-md` 20px             |
| radius    | `radius-control` 12px           | `radius-control` 12px           |

글리프 크기가 두 size에서 같은 이유: 아이콘은 **컨테이너와 독립**이다(Iconography Size model).
20px 글리프가 40 컨테이너에서 여백 10, 32에서 여백 6을 갖는다.

## Implementation

- `packages/react/src/icon-button/icon-button.tsx`
- `packages/css/src/component/icon-button.css`
- variant/state 시각은 `.kds-button`의 규칙을 재사용하지 않고 자체 선택자를 갖는다. 공유하면
  Button의 padding 계약이 정사각 계약과 충돌한다.

## Known deviations

| 항목 | 상태 | 사유 |
| --- | --- | --- |
| pressed의 hover 면 | 없음 | `background-inset`보다 한 단계 강한 중립 표면 토큰이 없다. 만들면 hover가 pressed를 덮지 않으면서도 피드백을 줄 수 있다. DS-P3-014 대상 |
| Figma 글리프 색 | instance override | Figma에는 `currentColor`가 없어 아이콘 instance 안 vector의 stroke를 variant마다 직접 변수에 다시 묶었다. 아이콘 정본이 바뀌어도 이 override는 따라오지 않는다 — 재적용은 수동이다 |
| `loading` 상태 | 없음 | 아이콘 자리에 무엇을 넣을지 미정. Button의 loading과 같은 축인지 판정이 필요하다 |
| 제품 32×32 radius 12 ↔ 모바일 40×40 radius 14 | 미채택 | 제품은 ≤719px에서 radius를 14로 바꾼다. 뷰포트로 radius를 바꾸는 근거를 찾지 못해 12로 고정했다 |

## Acceptance tests

1. md가 40×40, sm이 32×32 정사각이다.
2. 시각 크기와 무관하게 히트 영역이 44×44 이상이다.
3. `label`이 accessible name으로 정확히 한 번 노출된다.
4. 내부 아이콘이 accessibility tree에 노출되지 않는다.
5. `pressed`를 주지 않으면 `aria-pressed` 속성이 없다.
6. `pressed`를 주면 `aria-pressed`가 그 값으로 붙는다.
7. `disabled`면 클릭 핸들러가 실행되지 않는다.
8. 부모 `color` 변경이 글리프에 반영된다.
9. 두 size의 글리프 계산 박스가 모두 20px다.
10. 토글이 켜진 상태를 hover가 덮지 않는다.

## Migration and changelog

- 2026-08-15 — 첫 공개. 세 화면 실측에서 raw `<button>` 108개 중 다수가 아이콘 전용이었고,
  `Button`으로는 정사각이 되지 않는다는 실측이 근거다.
