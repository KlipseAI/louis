---
id: checkbox
status: experimental
authority: normative
---

# Checkbox

독립적인 켜짐/꺼짐을 고른다. 여럿을 동시에 고를 수 있다.

**제품에 공용 정본이 있는데 21벌 중 2벌만 쓴다.** `globals.css:990`의 `.app-native-checkbox`
(20×20 · `accent-color`)이고, 이유를 제품이 스스로 적어 두었다 — 그 클래스가 **cascade layer
밖**이라 `@layer utilities` 안의 어떤 유틸리티도 이길 수 없어서, 색 하나를 바꾸려는 소비처가
클래스를 떼고 선언을 통째로 베껴야 했다. 갈라지는 축은
[`product.measured.json`](../../migration/product.measured.json)이 사유와 함께 갖는다.

## Availability

| Surface       | 상태           | 근거                                                                                 |
| ------------- | -------------- | ------------------------------------------------------------------------------------ |
| Web           | `partial`      | public export와 실브라우저 acceptance test 14건이 두 motion context에서 각각 돈다; visual regression, Figma component와 제품 소비 증거 없음 |
| Figma         | `not-ready`    | component set이 아직 없다. DS-F-006-checkbox가 소유한다                              |
| Documentation | `done`         | 이 문서                                                                              |
| Maturity      | `experimental` | 규범과 구현이 같은 변경 단위에서 처음 선다                                           |

## When to use

- 서로 **독립적인** 켜짐/꺼짐 — 약관 동의, 옵션 켜기, 목록의 다중 선택.
- 목록 머리의 **일괄 선택.** 그 자리에서 `indeterminate`가 "일부만 골랐다"를 말한다.

쓰지 않는 자리.

- 서로 배타적인 값 중 하나 고르기. 그것은 Segmented Control 또는 radio다.
- 즉시 적용되는 설정 켜기/끄기. 그것은 Switch이며 아직 카탈로그에 없다. 체크박스는 폼을
  **제출해야** 반영된다는 뜻을 갖는다.
- 필터 알약. 그것은 다중 선택이더라도 Badge/Chip의 모양을 갖는다.

## API

```tsx
<Checkbox label="약관에 동의합니다" checked={agreed} onCheckedChange={setAgreed} />

<Checkbox
  label={`전체 선택 (${selected.length}/${items.length})`}
  checked={selected.length === items.length}
  indeterminate={selected.length > 0 && selected.length < items.length}
  onCheckedChange={selectAll}
/>
```

## Anatomy

1. **Row** — `<label>`. 상자와 라벨을 담고 클릭 영역을 소유한다.
2. **Control** — `<input type="checkbox">`. **상자가 곧 입력이다.**
3. **Mark** — 컨트롤의 `::before`. 체크와 부분 선택 막대가 이 자리를 나눠 쓴다.
4. **Label** — 상자 옆 글자.

**입력을 숨기고 형제를 그리지 않는다.** `appearance: none`이면 입력 자신을 칠할 수 있고, 숨기면
라벨 연결과 포커스가 두 곳으로 갈라진다. 제품의 signup 계열 6벌이 숨기는 구조인데 그 대가로
`:focus-visible`을 형제 선택자로 옮겨야 했다.

## Properties

| prop | 값 | 기본 | 뜻 |
| --- | --- | --- | --- |
| `label` | ReactNode | 없음 | 상자 옆 글자. 없으면 `aria-label`이 필수다 |
| `checked` | boolean | 없음 | 주면 controlled가 된다 |
| `defaultChecked` | boolean | 없음 | 비제어 초기값 |
| `indeterminate` | boolean | `false` | 부분 선택. 아래 States |
| `onCheckedChange` | `(checked: boolean) => void` | 없음 | 값이 바뀔 때 |

나머지는 `<input>`의 네이티브 속성을 그대로 받는다.

**크기 축이 없다.** 제품 정본이 20px이고 나머지 값(14px · 브라우저 기본)은 서로 합의하지 않으며
두 번째 소비처도 없다. 필요해지면 그때 추가한다.

## Hierarchy와 variants

variant 축이 없다. 체크박스는 강조 단계를 갖지 않는다.

## States

| state | 표현 |
| --- | --- |
| Default | 면 `color-background-surface`, 테두리 `color-border-strong`, 표시 없음 |
| Checked | 면·테두리 `color-action-primary`, 체크 표시 `color-foreground-inverse` |
| Indeterminate | 면·테두리 `color-action-primary`, **가로 막대** `color-foreground-inverse` |
| Disabled | 면 `color-background-inset`, 테두리 `color-border-subtle`, 표시 `color-foreground-disabled` |
| Focus | 컨트롤이 공유 링을 받는다 |

**Indeterminate가 Checked를 이긴다.** 네이티브에서 두 상태는 동시에 참일 수 있고, 그때 화면은
"일부"를 보여야 한다 — 부분 선택은 선택이 아니다. 두 규칙이 소스 순서로 갈리므로 CSS가 그 승패를
명시적으로 고정한다.

**hover에서 아무것도 바꾸지 않는다.** 상자가 이미 테두리로 자기를 알리고, 라벨이 커서를 바꾼다.

## Interaction and responsive behavior

- 라벨을 눌러도 값이 바뀐다. 상자가 20px이라 **라벨이 클릭 영역의 대부분을 담당한다.**
- 연결은 `id`가 아니라 `<label>`의 포함 관계가 만든다. 같은 화면에 여럿이 있어도 겹치지 않는다.
- 라벨이 여러 줄이면 상자는 **첫 줄 옆에** 남는다.
- Space가 값을 바꾼다. Enter는 바꾸지 않는다 — 폼 안에서 Enter는 제출이다.

## Content

- 라벨은 **켰을 때 참이 되는 문장**이다. "알림을 받지 않음"이 아니라 "알림 받기"다. 부정형은
  끄는 동작이 이중 부정이 된다.
- 일괄 선택 라벨에는 개수를 함께 둔다. "전체 선택 (2/5)"가 `indeterminate`의 뜻을 글자로도 말한다.

## Accessibility

- **네이티브 `<input type="checkbox">`다.** Space, `:indeterminate` 의사 클래스, 폼 제출,
  forced-colors가 전부 브라우저의 것이다.
- `indeterminate`는 **콘텐츠 속성이 없는 DOM 프로퍼티라** JSX로 넘어가지 않는다. 컴포넌트가 매
  렌더 뒤에 ref로 맞추고, `aria-checked="mixed"`를 함께 준다 — 프로퍼티만으로는 보조기술이
  "일부"를 읽지 못하는 경우가 있다.
- 라벨이 없으면 `aria-label`이 필수다.
- forced-colors에서 면 색이 시스템 색으로 치환돼 표시가 배경과 같아지므로 `CanvasText`로 되돌린다.
- **부분 선택을 색으로만 알리지 않는다.** 막대와 체크는 모양이 다르고, 일괄 선택 라벨의 개수가
  같은 사실을 글자로도 말한다.

## Specification

| 축 | 값 | 토큰 |
| --- | ---: | --- |
| 상자 | 20×20px | 리터럴 — 제품 정본 채택 |
| 테두리 | 0.5px | `border-width-hairline` |
| 반경 | 8px | `radius-control-sm` |
| 상자–라벨 간격 | 8px | `space-control-sm` |
| 체크 표시 | 5×9px, 2px 획 | 리터럴 |
| 부분 선택 막대 | 10×2px | 리터럴 |
| 라벨 타이포 | 14/1.5 | `typography-body-sm-regular` |

상자 20px은 제품 정본 `.app-native-checkbox`의 값이다. 리터럴로 남긴 이유는 소비처가 이 컴포넌트
하나뿐이기 때문이며 Spinner·Slider와 같은 판정이다.

## Effects

없다. 그림자도 흐림도 쓰지 않는다.

## Implementation

- `accent-color`를 쓰지 않는다. 그것은 면 색 하나만 주고 **체크 표시의 굵기·반경·포커스 링·부분
  선택 막대를 전부 브라우저가 정한다** — 테마와 플랫폼마다 다르다. 제품의 signup 계열 6벌이 이미
  직접 그리는 것도 같은 이유다.
- 표시는 `::before` 하나가 두 상태를 나눠 쓴다. 회전한 테두리로 그리는 이유는 CSS package가
  아이콘 자산을 소비하지 않기 때문이다([DS-D-0008](../governance/decisions/DS-D-0008-icon-source.md)).
- 제품의 전역 클래스는 **cascade layer 밖**에 있어 소비처가 이길 수 없었다. 이 저장소의 컴포넌트
  CSS는 전부 `@layer`에 들어가므로 같은 함정이 없다.

## Known deviations

- **선택하지 않은 상자의 테두리 대비가 WCAG 2.2 SC 1.4.11(3:1)에 미달한다.** 상자 면 대비 실측은
  `color-border-control` 1.27/1.63 · `color-border-default` 1.38/2.93 ·
  **`color-border-strong` 2.52/4.61**(라이트/다크)이고, **테두리 토큰 셋 중 어느 것도 라이트에서
  3:1을 넘지 못한다.** 가장 가까운 `border-strong`을 골랐고 라이트의 2.52는 남는다. 이 실측은
  인계서 (2b) 컨트롤 테두리 정본 판정의 입력이며, 해소하려면 새 값이 필요하므로 owner 판정이다.
  선택된 상태의 면은 3.12/4.90으로 통과한다.
- **`color-border-strong`의 첫 소비처가 여기다.** 인계서 (1a)가 "소비처 0이고 이름이 가리키는 것이
  그 이름을 안 쓴다"고 분류한 넷 중 하나인데, 이제 이름이 뜻과 맞는 소비처가 생겼다 — 경계가
  반드시 보여야 하는 자리다. 그 토큰의 처분 판정을 다시 해야 한다.
- **크기 축이 없다.** 좁은 목록 행에서 20px이 클 수 있으나 두 번째 소비처가 확인되기 전에는
  만들지 않는다.
- **Switch가 없다.** 즉시 적용되는 설정에는 다른 컴포넌트가 필요하다.
- **자동 접근성 검사가 1.4.11을 보지 않는다.** axe의 `color-contrast`는 텍스트만 본다 — 위 수치는
  손으로 계산했고 게이트가 재지 않는다.

## Acceptance tests

1. 상자 크기·반경·테두리 토큰·간격·라벨 타이포가 `components.measured.json`과 같다.
2. 체크 표시의 폭·높이·획 두께가 계약과 같고 위·왼 변이 비어 있다.
3. 부분 선택 막대의 폭·높이가 계약과 같고 **체크와 폭이 다르다.**
4. `checked`와 `indeterminate`가 동시에 참이면 **막대가 이기고** 체크의 테두리가 남지 않는다.
5. 선택하지 않았을 때는 표시가 보이지 않는다.
6. Default·Checked·Disabled의 면·테두리·라벨 색이 states 표와 같다.
7. 라벨을 눌러도 값이 바뀌고 콜백이 그 값을 받는다.
8. Space가 값을 켜고 끈다.
9. controlled일 때 호출부의 값이 이긴다.
10. `indeterminate`면 `aria-checked="mixed"`다.
11. `disabled`면 클릭과 키보드로 값이 바뀌지 않고 콜백이 불리지 않는다.
12. 포커스 링이 **키보드에서만** 나타나고 두께가 `border-width-ring`이다.
13. 라벨 있음·선택됨·부분 선택·라벨 없음 넷 모두 자동 접근성 검사에 위반이 없다.
