---
id: foundation-interaction-states
status: experimental
authority: normative
---

# Interaction states

컨트롤이 가질 수 있는 상태의 **이름과 그 이름이 가리키는 기술적 사실**을 고정한다. 이 문서가 없던
동안 Button은 `Pressed`를 "누르고 있는 중"으로, Icon Button은 `pressed`를 "토글이 켜짐"으로 썼다.
같은 단어가 두 컴포넌트에서 다른 것을 가리켰고, 그 상태로 Figma component set이 하나 만들어졌다.

## 이름은 웹 플랫폼에서 가져온다

새 단어를 만들지 않는다. 상태 이름은 CSS pseudo-class 또는 ARIA 속성 이름을 그대로 쓴다. 그러면
"이 이름이 무슨 뜻인가"를 이 문서가 아니라 플랫폼 명세가 답한다.

| 이름       | 출처                    | 가리키는 사실                          | 축              |
| ---------- | ----------------------- | -------------------------------------- | --------------- |
| `default`  | —                       | 아무 상태도 아님                       | —               |
| `hover`    | `:hover`                | 포인터가 위에 있음                     | 일시적          |
| `focus`    | `:focus-visible`        | 키보드 focus가 있음 — **그리지 않는다** | 일시적          |
| `active`   | `:active`               | **누르고 있는 동안**                   | 일시적          |
| `pressed`  | `aria-pressed="true"`   | **토글이 켜져 있음**                   | 지속            |
| `selected` | `aria-selected="true"`  | 목록·탭에서 선택됨                     | 지속            |
| `checked`  | `aria-checked`          | 체크박스·라디오가 켜짐                 | 지속            |
| `expanded` | `aria-expanded="true"`  | 연결된 표면이 열려 있음                | 지속            |
| `disabled` | `:disabled`, `aria-disabled` | 실행되지 않음                     | 지속            |
| `busy`     | `aria-busy="true"`      | 진행 중이며 중복 실행을 막음           | 지속            |

## `focus`는 그리지 않는다

2026-10-06 소유자가 키보드 포커스 링을 전부 걷기로 정했다([DS-D-0074](../governance/decisions/DS-D-0074-focus-ring-removed.md)).
`focus`는 이름으로 남지만 **평상 렌더링에서 링도 번짐도 그리지 않는다.** 브라우저 기본 링도
지운다. 포커스의 표현은 `packages/css/src/base.css`의 한 규칙이 소유하고, 컴포넌트는 링을 다시
선언하지 않는다. 링은 강제 색(Windows 고대비)에서만 시스템 색 `Highlight`로 선다.

링이 아닌 상태 표현은 그대로다 — 메뉴 항목의 `[data-highlighted]` 면, 입력 테두리와 떠오른 라벨의
색처럼 포커스와 함께 바뀌는 면·글자는 이 결정의 대상이 아니다.

## `active`와 `pressed`를 절대 섞지 않는다

가장 자주 틀리는 곳이라 따로 적는다.

- `active`는 **손가락이 닿아 있는 동안**이다. 떼면 사라진다. 시각적으로는 눌리는 피드백이다.
- `pressed`는 **토글이 켜진 상태**다. 손을 떼도 남는다. 시각적으로는 켜져 있음의 표시다.

둘을 같은 시각으로 표현하면 사용자는 버튼이 눌린 것인지 켜진 것인지 구분할 수 없다. 이름까지
같으면 **만드는 사람도 구분하지 못한다** — 실제로 그렇게 됐다.

일상 영어에서 "pressed"가 두 뜻을 다 갖는 것이 원인이다. 그래서 일상 영어가 아니라 플랫폼 이름을
정본으로 삼는다: `:active`가 있는 쪽이 `active`, `aria-pressed`가 있는 쪽이 `pressed`다.

## 어느 상태를 어디가 소유하는가

| 축                    | 소유                          | 이유                                                     |
| --------------------- | ----------------------------- | -------------------------------------------------------- |
| 일시적 상태           | CSS pseudo-class              | 브라우저가 이미 안다. prop으로 받으면 두 진실이 생긴다   |
| 지속 상태             | prop → ARIA 속성 → `[attr]` 선택자 | 보조 기술이 읽어야 하므로 DOM에 남아야 한다      |

**일시적 상태를 prop으로 받지 않는다.** `hovered`, `active` 같은 prop을 두면 호출부가 브라우저와
경쟁하게 되고, 둘이 어긋나는 순간 어느 쪽이 옳은지 판정할 근거가 없다.

지속 상태는 `data-*`가 아니라 **ARIA 속성 자체**를 선택자로 쓴다. `[aria-pressed="true"]`가
`[data-pressed="true"]`보다 나은 이유는 하나뿐인데 결정적이다 — 속성이 없으면 스타일도 없으므로,
**보조 기술에 노출되지 않은 상태는 화면에도 나타날 수 없다.** 둘이 어긋날 방법이 없어진다.

값이 boolean이 아닌 축(`variant`, `size`)은 이 규칙 밖이며 `data-*`를 쓴다 (DS-D-0004).

## 제품 실측 — 확인 모달 액션

**LOUIS는 상태 어휘만 갖고 값이 없다.** Figma로 옮길 때 지어내지 않도록 제품이 실제로 쓰는 값을
한 자리 적어 둔다(배포본 실측). 이것은 **DS 계약이 아니라 제품 인용**이다.

| 상태 | 취소 | 확인 (primary) | 확인 (danger) |
| --- | --- | --- | --- |
| hover | `filter: brightness(125%)` | `brightness(92%)` | `brightness(0.92)` |
| active | `transform: scale(0.97)` | 같음 | 같음 |
| disabled | `opacity: .6` · `cursor: default` | 같음 | 같음 |

`active`와 `disabled`는 **세 벌이 공유하는 base**에서 온다. hover만 벌마다 다르다.

전환은 셋 다 `transform 180ms ease, filter 180ms ease, opacity 180ms ease`다 — **세 프로퍼티가
같은 길이**다.

**밝기로 상태를 만든다.** 면 색을 바꾸는 것이 아니라 `filter: brightness()`를 얹으므로, 같은
장치가 어떤 면 위에서도 동작한다. 그래서 danger 버튼에 따로 hover 색을 정의하지 않는다.
`brightness(0.92)`와 `brightness(92%)`는 표기만 다르고 계산값이 같다.

### 셀렉터 함정 — 터치에서도 hover가 발동한다

호버가 `hover:`가 아니라 `[&:hover:not(:disabled)]:`로 저작돼 있어 **`@media (hover: hover)`
가드가 없다.** 포인터가 없는 기기에서도 탭이 hover를 남긴다.

원본 모듈 CSS의 맨 `:hover`를 그대로 보존한 결과이며 그 파일이 이유를 주석으로 갖고 있다.
**의도된 것인지 잔재인지는 제품이 판정해야 한다** — 그 전까지 이 값을 「호버 전용」으로 읽지
않는다.

근거: `GlassConfirmModal.tsx:99-101`(base) · `:105`(취소) · `:111`(primary) · `:119`(danger).

**LOUIS 는 이 함정을 따라가지 않는다(2026-10-07, [DS-D-0077](../governance/decisions/DS-D-0077-hover-only-on-hover-devices.md)).**
호버 규칙은 `@media (hover: hover)` 안에 둔다 — 터치에서 누른 뒤 호버 색이 남지 않게. `:focus-visible` 과
`[data-highlighted]` 는 가드 밖에 두고, `:active` 는 대상이 아니다. 제품도 `feat/canvas-mobile-ux` 에서 같은 가드로 바꿨다.

## Figma에서의 표현

Figma에는 CSS 상태가 없다. 그래서 일시적 상태도 variant property로 만들어야 하고, 그 property는
**코드에 대응하는 prop이 없다.** parity 게이트는 그런 property를 사유와 함께 계약에 선언해야만
통과시킨다 — 선언되지 않은 property가 생기면 실패한다.

variant option 이름은 이 문서의 이름을 **대문자로 시작해** 그대로 쓴다: `Default`, `Hover`,
`Active`, `Pressed`, `Disabled`, `Loading`. 컴포넌트가 갖지 않는 상태는 option을 만들지 않는다.

## Accessibility

- 지속 상태는 반드시 ARIA 속성으로 노출된다. 색이나 굵기만으로 표현된 상태는 상태가 아니다.
- 토글이 아닌 컨트롤에 `aria-pressed`를 붙이지 않는다. 한 번 실행되고 끝나는 액션에 붙이면
  스크린리더가 "눌림/안 눌림"을 계속 읽는다.
- `disabled`는 이유를 인접 텍스트로 제공한다. 비활성 자체는 이유를 말하지 않는다.
- 상태 전환에 애니메이션을 쓰는 경우 [Motion](motion.md)의 reduced-motion 계약을 따른다.

## Acceptance tests

1. 컴포넌트 규범의 States 표에 쓰인 이름이 모두 이 문서의 표에 있다.
2. `active`와 `pressed`를 함께 갖는 컴포넌트에서 둘의 시각 표현이 서로 다르다.
3. 지속 상태가 ARIA 속성 없이 시각적으로만 표현되는 경우가 없다.
4. Figma component set의 State option 이름이 이 문서의 이름과 일치한다.

## Migration and changelog

- 2026-08-15 — 첫 공개. Button의 Figma `State=Pressed`(실제로는 `:active`)와 Icon Button 규범의
  `pressed`(실제로는 `aria-pressed`)가 충돌한 것을 발견해 어휘를 고정했다. Button의 option을
  `Active`로 고치고 component set을 다시 만들었다.
