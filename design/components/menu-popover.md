---
id: menu-popover
status: experimental
authority: normative
---

# Menu / Popover

트리거와 가까운 곳에서 짧은 액션 목록 또는 복합 설정을 제공하는 비모달 overlay다. 이 문서는 과거
구현의 평균이 아니라 이 저장소가 유지할 **목표 계약**이다.

## Availability

| Surface       | 상태           | 근거                                                        |
| ------------- | -------------- | ----------------------------------------------------------- |
| Web           | `not-ready`    | `@klipse-design/react`에 public export가 없음               |
| Figma         | `not-ready`    | published Menu/Popover component가 없음                     |
| Documentation | `done`         | 이 문서                                                     |
| Maturity      | `experimental` | primitive, overlay branch, 키보드·포인터 테스트가 아직 없음 |

## When to use

- **Action menu**: 한 트리거에서 서로 독립적인 짧은 명령 목록을 연다. 예: `새로 만들기`, 카드 더보기.
- **Composite popover**: 계정 정보, 테마 세그먼트, 언어 선택처럼 서로 다른 종류의 컨트롤을 한 패널에
  묶는다. 현재 프로필 패널은 이 유형이다.
- **Submenu**: 정보 구조상 반드시 필요한 한 단계의 하위 액션만 제공한다. 두 단계를 넘기지 않는다.

다음에는 사용하지 않는다.

- 값 하나를 선택하는 폼 필드는 Select/Listbox를 사용한다. `menu` 역할로 폼 선택을 흉내 내지 않는다.
- 사용자의 작업을 막고 결정을 요구하면 [Dialog](dialog.md)를 사용한다.
- 설명만 제공하면 Tooltip을 사용한다.
- 계속 보여야 하는 탐색·도구 모음은 페이지 내 Navigation/Toolbar로 둔다.
- 작은 화면에서 내용이 길어 독립적인 탐색 흐름이 되면 Sheet 또는 페이지로 전환한다. 역할만 menu인
  풀스크린 화면을 만들지 않는다.

## Variants

| Variant             | 패널 역할                           | 내부 탐색                                       | 대표 사용처         |
| ------------------- | ----------------------------------- | ----------------------------------------------- | ------------------- |
| `action-menu`       | `menu`                              | 방향키 roving focus, Home/End, typeahead        | create/card actions |
| `composite-popover` | 이름이 있는 비모달 `dialog`         | 자연스러운 Tab 순서, 내부 위젯은 각자 패턴 사용 | profile controls    |
| `submenu`           | 부모와 같은 overlay branch의 `menu` | Right/Left 또는 Enter/Escape로 진입·복귀        | 짧은 하위 명령      |

프로필처럼 버튼, 링크, 세그먼트, Listbox가 섞인 패널에 `role="menu"`를 붙이지 않는다. 반대로 순수 명령
목록을 이름만 dialog로 만들고 방향키 탐색을 생략하지 않는다.

## Anatomy

1. **Trigger** — 이름, `aria-expanded`, 패널과의 관계를 소유한다.
2. **Anchor** — 위치 계산에 쓰는 요소다. 보통 Trigger와 같지만 합성 트리거에서는 분리할 수 있다.
3. **Portal host** — 클리핑과 stacking context에서 패널을 분리하는 앱 공용 overlay root다.
4. **Panel** — 표면, 접근성 역할, 충돌 보정, 스크롤 경계를 소유한다.
5. **Group label / separator** — 액션 묶음의 의미를 보조한다. 빈 장식 행을 menuitem으로 만들지 않는다.
6. **Item / control** — 전체 행이 하나의 히트 영역이고, 상태와 accessible name을 가진다.
7. **Nested overlay** — submenu, Listbox, color picker 등이다. 부모와 같은 overlay branch에 등록한다.

## Properties

아래는 프레임워크에 종속되지 않는 public contract다. 구현체 이름은 달라도 의미를 바꾸지 않는다.

| Property           | 값/형태                            | 기본값         | 설명                                                     |
| ------------------ | ---------------------------------- | -------------- | -------------------------------------------------------- |
| `kind`             | `action-menu`, `composite-popover` | 필수           | 역할과 키보드 패턴을 결정                                |
| `open`             | `boolean`                          | 필수           | controlled open state                                    |
| `onOpenChange`     | `(open, reason) => void`           | 필수           | `trigger`, `select`, `escape`, `outside`, `route`를 구분 |
| `trigger`          | interactive element                | 필수           | 단 하나의 소유 trigger                                   |
| `panelLabel`       | id 참조 또는 문자열                | 필수           | panel의 accessible name                                  |
| `placement`        | `top`, `bottom`, `left`, `right`   | `bottom`       | 선호 방향이며 충돌 시 flip 가능                          |
| `align`            | `start`, `center`, `end`           | `start`        | anchor와 panel 정렬                                      |
| `offset`           | spacing token                      | `space-4`(8px) | trigger와 panel 사이 간격                                |
| `collisionPadding` | spacing token                      | `space-4`(8px) | viewport·safe area 최소 여백                             |
| `portalHost`       | app overlay root                   | 앱 기본값      | arbitrary ancestor가 아니라 명시적 host                  |
| `branchId`         | opaque overlay branch id           | 자동 생성      | 중첩 portal을 같은 내부 영역으로 판정                    |
| `initialFocus`     | `first`, `last`, ref, `none`       | 입력 방식 의존 | 키보드로 열면 항목, pointer로 열면 trigger 유지 가능     |
| `closeOnSelect`    | `boolean`                          | `true`         | 토글·세그먼트처럼 패널 안에서 계속 조정할 때 false       |
| `disabled`         | `boolean`                          | `false`        | trigger와 모든 열기 경로를 비활성화                      |

`onOpenChange`의 reason은 분석용 장식이 아니다. 닫힌 뒤 포커스를 어디에 둘지, route 이동 전에 닫을지,
선택 콜백을 중복 실행하지 않을지를 결정하는 계약이다.

## States

| 상태      | Panel DOM과 포인터                                   | 포커스·ARIA                                           |
| --------- | ---------------------------------------------------- | ----------------------------------------------------- |
| Closed    | unmount 또는 `hidden` + `inert`; hit testing 불가    | trigger `aria-expanded="false"`                       |
| Opening   | 위치 계산이 끝나기 전 `visibility:hidden`; 클릭 불가 | panel을 잘못된 좌표에 먼저 노출하지 않음              |
| Open      | `pointer-events:auto`; 최상위 활성 branch            | trigger `aria-expanded="true"`; variant별 초기 포커스 |
| Closing   | 시각적 exit만 허용; 즉시 `inert`와 pointer 차단      | 선택 액션 재실행 불가                                 |
| Disabled  | panel을 열 수 없음                                   | 네이티브 `disabled` 우선                              |
| Item busy | 해당 액션 중복 실행 차단, spinner와 `aria-busy` 제공 | 전체 메뉴를 불필요하게 닫지 않음                      |

`opacity: 0`과 `aria-hidden`만으로 닫힌 panel을 유지하지 않는다. 그 안의 링크와 버튼이 Tab 순서에 남기
때문이다.

## Interaction

### Open and close

- pointer로 Trigger를 누르면 연다. 열린 Trigger를 다시 누르면 닫혀야 하며, 열림 상태라는 이유로 Trigger에
  `pointer-events:none`을 주지 않는다.
- `Enter`/`Space`는 열고 첫 enabled item으로 이동한다. `ArrowDown`은 첫 item, `ArrowUp`은 마지막 item으로
  연다.
- `Escape`는 최상위 nested overlay부터 한 단계씩 닫는다. 부모까지 닫혔을 때 Trigger로 포커스를 돌린다.
- route 변경, Trigger unmount, viewport 소유권 변경 시 닫는다.
- Action menu에서 `Tab`/`Shift+Tab`은 menu를 닫고 문서의 다음/이전 포커스 대상으로 이동한다.
- Composite popover에서는 Tab이 패널의 자연스러운 순서를 돈다. 마지막에서 다음 문서 대상으로 나가면
  panel을 닫고 그 다음 문서 대상에 focus를 유지한다. `Shift+Tab` 이탈도 같은 원칙을 역방향으로 적용한다.
  비모달 popover이므로 배경 전체를 inert로 만들지 않는다.

### Action menu keyboard

| 키                 | 동작                                      |
| ------------------ | ----------------------------------------- |
| `ArrowDown/Up`     | enabled item 사이를 순환                  |
| `Home/End`         | 첫/마지막 enabled item                    |
| 문자 키            | 현재 위치 다음부터 locale-aware typeahead |
| `Enter/Space`      | 현재 item을 한 번 실행                    |
| `ArrowRight`       | submenu가 있으면 열고 첫 item으로 이동    |
| `ArrowLeft/Escape` | submenu를 닫고 부모 item으로 복귀         |

Disabled item은 탐색에서 건너뛰거나 `aria-disabled="true"`로 이유를 읽을 수 있게 한다. 두 전략을 한 menu
안에서 섞지 않는다.

### Pointer and outside interaction

외부 클릭 판정은 단일 `panelRef.contains(target)`로 끝내지 않는다. 다음 모두를 **같은 overlay branch의
내부**로 처리한다.

- Trigger와 Panel
- body로 다시 portal된 submenu/Listbox
- 검색 input, scrollbar, color picker처럼 Panel에서 연 nested overlay
- pointer capture 중인 drag control

구현은 `event.composedPath()`와 branch registry를 우선 사용한다. nested overlay가 별도 DOM subtree라는
이유로 부모의 outside handler가 먼저 닫히면 안 된다. 내부 `pointerdown`에서 panel을 unmount하거나
`preventDefault()`해 후속 `click`을 없애지 않는다. item의 `click`/키보드 activation이 완료된 뒤
`onOpenChange(false, "select")`와 item action이 정확히 한 번 실행돼야 한다.

외부 이벤트 정책:

1. document capture 단계에서 가장 위 branch 하나만 검사한다.
2. composed path에 branch member가 있으면 아무것도 닫지 않는다.
3. 외부라면 현재 branch만 닫고, 클릭이 배경에 전달돼도 안전한지 명시한다.
4. modal 위의 popover라면 modal branch의 자식으로 등록해 modal 자체를 닫지 않는다.

### "열리지만 선택되지 않음" 금지 계약

Panel이 보이는 것과 선택 가능한 것은 같은 완료 조건이다. 다음 중 하나라도 실패하면 `open`으로 보지
않는다.

- Panel과 모든 item이 실제 hit-test 대상이다.
- Panel이 덮는 좌표에 더 높은 투명 레이어가 없다.
- 부모 outside handler가 내부 `pointerdown`에 반응하지 않는다.
- Trigger 비활성화가 Panel이나 portal subtree로 전파되지 않는다.
- exit node가 새 Panel 위에서 포인터를 가로채지 않는다.
- item activation 전에 unmount되지 않고 callback이 한 번 실행된다.

## Portal and layer rules

- 기본은 앱 root 옆의 전용 overlay root에 portal한다. `overflow:hidden`, `transform`, `filter`, `contain`,
  `isolation`이 있는 화면 조상 안에서 z-index를 올리는 방식으로 해결하지 않는다.
- inline panel은 조상 클리핑과 stacking context가 없다는 테스트가 있을 때만 허용한다.
- raw z-index 대신 `layer-content < layer-sticky < layer-popover < layer-modal < layer-critical`의 의미
  토큰을 사용한다. nested menu는 임의로 1,200 같은 값을 쓰지 않고 부모 branch 안에서 순서를 얻는다.
- scroll, resize, visual viewport 변화, anchor ResizeObserver에 반응해 위치를 다시 계산한다. viewport와
  safe area를 넘으면 flip/shift하고, 최대 높이를 설정해 panel 자체가 스크롤한다.
- 위치 계산 전에는 보이지 않아야 한다. CSS의 임시 `top/right`를 한 프레임 노출하지 않는다.
- Tooltip은 포인터를 막지 않는다. 장식 pseudo-element도 항상 `pointer-events:none`이다.

## Responsive behavior

- 320px viewport와 200% 확대에서 panel 폭은 `min(preferred, viewport - 2 * collisionPadding)`을 넘지 않는다.
- action menu는 최소 Trigger 폭 이상, 기본 200px을 권장한다. 프로필 composite popover는 240px을 기준으로
  하되 긴 번역과 200% 확대에서 내용 폭으로 확장하거나 작은 화면 variant로 바꾼다.
- 높이가 부족하면 `max-height`와 내부 스크롤을 사용한다. viewport 밖 item을 잘라내지 않는다.
- touch에서는 각 action의 hit area를 44px 이상 권장한다. 시각 행이 40px이면 인접 패딩으로 44px의
  유효 타깃을 확보한다.
- mobile Sheet로 전환하면 기존 menu가 아니라 이름 있는 modal dialog가 된다. focus trap, scroll lock,
  닫기 버튼 계약도 함께 전환한다.

## Content

- item label은 결과를 예측할 수 있는 짧은 명사 또는 동사형으로 쓴다: `설정`, `새 비디오 편집`, `삭제`.
- danger item은 색만 바꾸지 않고 명확한 동사를 사용한다.
- 아이콘은 라벨을 반복 설명하지 않으며 장식이면 보조 기술에서 숨긴다.
- group label과 separator를 남발하지 않는다. 두 item 이하의 그룹은 별도 heading 없이 배치할 수 있다.
- KO/EN/JA에서 말줄임이 액션 의미를 없애면 줄바꿈 또는 폭 확장을 택한다.

## Accessibility

### Action menu

- Trigger: `aria-haspopup="menu"`, `aria-expanded`, 고유한 `aria-controls`.
- Panel: `role="menu"`, 이름이 필요한 경우 `aria-labelledby`.
- Item: 동작에 따라 `menuitem`, `menuitemcheckbox`, `menuitemradio`.
- roving `tabIndex`로 panel 안의 Tab stop은 하나만 둔다.

### Composite popover

- Trigger: `aria-haspopup="dialog"`, `aria-expanded`, 고유한 `aria-controls`.
- Panel: `role="dialog"`, `aria-modal="false"`를 생략하고 `aria-labelledby` 또는 locale-aware label을 제공.
- 내부 버튼, 링크, segmented control, Listbox는 각자의 네이티브/ARIA 역할을 유지한다.
- 같은 페이지에 GNB가 여러 번 마운트될 수 있으므로 `profile-popover` 같은 고정 id를 복제하지 않는다.

공통으로 visible focus ring, disabled 상태, reduced-motion, 200% 확대를 지원한다. Panel이 닫혀 있으면 그
자손은 accessibility tree와 Tab 순서에서 제외돼야 한다.

## Specification

| Part/state     | 목표 token/recipe                                      | 검증                       |
| -------------- | ------------------------------------------------------ | -------------------------- |
| Panel surface  | `surface-overlay` / 불투명 theme surface               | light/dark/high contrast   |
| Panel radius   | `radius-overlay` = 16px                                | visual regression          |
| Panel padding  | `space-overlay-inset` = 6px                            | item hit area 유지         |
| Item radius    | `radius-overlay-item` = 10px                           | hover/focus/selected state |
| Item height    | visual 40px 이상, touch target 44px 권장               | pointer/touch target       |
| Anchor offset  | 8px                                                    | collision/flip             |
| Panel width    | action 200px+, profile 240px reference                 | 긴 locale 문구와 200% zoom |
| Elevation      | `elevation-popover`                                    | overlay hierarchy          |
| Open motion    | opacity + scale, `motion-overlay-enter`; origin=anchor | reduced-motion 대체        |
| Reduced motion | transform 제거, 짧은 opacity 또는 즉시 전환            | motion preference          |
| Layer          | `layer-popover`, 숫자 리터럴 금지                      | nested overlay stack       |

## Extraction baseline

Klipse product에서 관측된 “프로필 팝오버는 열리지만 메뉴가 선택되지 않음”은 허용 variant가 아니라
차단급 회귀다. 비규범 근거는 [`KP-OVERLAY-001`](../../migration/product-baseline.md)에 보존한다.
새 구현은 특정 원인을 추측해 복사하지 않고 branch, hit-test, activation exactly-once 계약과 아래
회귀 테스트로 문제를 차단한다.

## Pre-implementation blockers

- 공유 positioning, dismiss layer, overlay branch primitive가 없다.
- semantic layer token과 nested portal 소유권 구현이 없다.
- action menu 방향키, Home/End, typeahead, roving focus test가 없다.
- composite popover의 initial/return focus와 Tab 정책이 구현되지 않았다.
- published Figma component와 Web parity evidence가 없다.

## Migration

1. portal, positioning, branch registry, dismiss layer를 가진 headless `Overlay` primitive를 먼저 만든다.
2. 그 위에 `ActionMenu`와 `CompositePopover`를 별도 public API로 만든다.
3. 프로필 composite popover의 테마·언어 nested overlay를 같은 branch에 등록한다.
4. create menu와 card menu를 action-menu variant로 옮긴다.
5. 로컬 document/window listener와 raw z-index를 제거하고 Figma variant를 연결한다.

기존 CSS hook이나 panel id를 호환해야 하면 한 릴리스 동안 adapter를 두되, 새 사용처에 구 API를 노출하지
않는다. 사용자 영향 변경은 [Updates](../updates/README.md)에 기록한다.

## Migration acceptance tests

### Pointer regression

- Trigger 클릭 → Panel visible → action item 클릭 시 callback이 **정확히 한 번** 실행된다.
- 링크, destructive action과 logout item도 pointer와 touch에서 각각 한 번만 실행된다.
- 언어 Trigger → portaled Listbox option 클릭 시 부모가 pointerdown에서 먼저 닫히지 않고 값이 변경된다.
- 테마 세그먼트 클릭은 Panel을 유지하고 선택 상태만 바꾼다.
- panel 안 scrollbar, nested overlay, disabled item 클릭을 outside로 오판하지 않는다.
- panel 바깥 클릭은 최상위 branch 하나만 닫고 배경 액션을 뜻하지 않게 실행하지 않는다.
- exit 중인 투명 panel과 pseudo-element가 새 panel/item hit test를 막지 않는다.

### Keyboard and focus

- Action menu를 Enter/Space/ArrowUp/ArrowDown으로 열고 모든 enabled item을 방향키로 탐색·실행한다.
- Home/End, typeahead, submenu Right/Left, Escape의 단계별 닫힘을 검증한다.
- Composite popover는 Tab 순서가 시각 순서와 같고, Escape는 Trigger로 복귀하며 Tab 이탈은 다음/이전 문서
  대상에 focus를 유지한다.
- 닫힌 panel의 자손이 Tab 순서와 accessibility tree에 없다.
- 동일 화면에 두 인스턴스를 렌더해 id가 중복되지 않는다.

### Layout and accessibility

- scroll, resize, zoom, visual viewport 변화에도 Panel이 anchor를 따라가고 viewport를 벗어나지 않는다.
- 320px, 200% 확대, KO/EN/JA 긴 라벨, light/dark, reduced-motion을 검증한다.
- 접근성 검사에서 role 구조, accessible name, `aria-expanded/controls`, focus-visible 오류가 없다.

이 테스트와 Figma variant가 연결되고 알려진 편차가 닫히기 전에는 `stable`로 승격하지 않는다.
