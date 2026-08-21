---
id: menu-popover
status: experimental
authority: normative
summary: 트리거 옆에서 액션 목록이나 설정을 펼쳐 보여 줍니다.
---

# Menu / Popover

트리거와 가까운 곳에서 짧은 액션 목록 또는 복합 설정을 제공하는 비모달 overlay다. 이 문서는 과거
구현의 평균이 아니라 이 저장소가 유지할 **목표 계약**이다.

## Availability

| Surface       | 상태           | 근거                                                        |
| ------------- | -------------- | ----------------------------------------------------------- |
| Web           | `partial`      | `ActionMenu`·`CompositePopover` public export, 실브라우저 회귀 35건 |
| Figma         | `partial`      | component set 5 variant (항목 상태). 패널 component는 남음. publish는 DS-F-008 |
| Documentation | `done`         | 이 문서                                                     |
| Maturity      | `experimental` | 시각 회귀와 수동 screen-reader 검토가 아직 없음            |

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

   - **Item leading icon slot** — 라벨 앞에 서는 고정 치수 칩이다. 아이콘 자체가 아니라 아이콘을 담는
     면이며, 행이 좁아져도 줄지 않는다. 치수·곡률·면은 §Specification의 「Item leading icon slot」 표가
     소유한다. 이 슬롯을 아이콘 크기로만 정의하면 칩 면이 사라져 행이 밋밋해진다.
7. **Nested overlay** — submenu, Listbox, color picker 등이다. 부모와 같은 overlay branch에 등록한다.

## Properties

아래는 프레임워크에 종속되지 않는 public contract다. 구현체 이름은 달라도 의미를 바꾸지 않는다.

| Property           | 값/형태                                  | 기본값                         | 설명                                                     |
| ------------------ | ---------------------------------------- | ------------------------------ | -------------------------------------------------------- |
| `kind`             | `action-menu`, `composite-popover`       | 컴포넌트 정체성                | 역할과 키보드 패턴을 결정한다. prop이 아니라 별도 컴포넌트로 표현한다 |
| `open`             | `boolean`                                | controlled일 때 필수           | `defaultOpen`과 동시에 지정하지 않는다                    |
| `defaultOpen`      | `boolean`                                | `false`                        | uncontrolled 초기 상태. `onOpenChange`는 두 방식 모두에서 호출된다 |
| `onOpenChange`     | `(open, reason) => void`                 | 선택                           | `trigger`, `select`, `escape`, `outside`, `route`, `programmatic`을 구분 |
| `close(reason)`    | imperative handle                        | —                              | 소비자만 아는 reason(`route`)을 발행하는 유일한 통로      |
| `trigger`          | interactive element                      | 필수                           | 단 하나의 소유 trigger                                    |
| `panelLabel`       | 문자열 또는 id 참조                      | 필수                           | panel의 accessible name                                   |
| `placement`        | `top`, `bottom`, `left`, `right`         | `bottom`                       | 선호 방향이며 충돌 시 flip 가능                           |
| `align`            | `start`, `center`, `end`                 | `start`                        | anchor와 panel 정렬                                       |
| `offset`           | `--kds-overlay-offset`                   | 8px                            | **prop이 아니다.** overlay 표면 CSS가 소유한다            |
| `collisionPadding` | `--kds-overlay-collision-padding`        | 8px                            | **prop이 아니다.** 위와 같다                              |
| `portalHost`       | app overlay root                         | Provider가 소유                | 컴포넌트가 host를 고르지 않는다. 앱에서 한 번 정한다      |
| `branchId`         | opaque overlay branch id                 | 자동 생성                      | **입력받지 않는다.** 중첩 등록은 별도 수단이 제공한다     |
| `initialFocus`     | `first-enabled`, `last-enabled`, `surface`, ref, `none` | variant 고정 (§Focus) | 기본값을 임의로 바꾸지 않는다                |
| `closeOnSelect`    | `boolean`                                | action-menu `true` / composite-popover `false` | item 단위로 덮을 수 있다          |
| `disabled`         | `boolean`                                | `false`                        | trigger와 모든 열기 경로를 비활성화한다. **panel과 item으로 전파하지 않는다** |
| `disabledItems`    | `skip`, `announce`                       | `announce`                     | menu 단위 단일 전략. item이 개별로 고르지 않는다          |

`onOpenChange`의 reason은 분석용 장식이 아니다. 닫힌 뒤 포커스를 어디에 둘지, route 이동 전에 닫을지,
선택 콜백을 중복 실행하지 않을지를 결정하는 계약이다.

`programmatic`은 소비자가 `open`을 직접 내려 닫힌 경우다. 이것이 어휘에 있어야 하는 이유는 그 경로가
실제로 소비자에게 도달하기 때문이다 — 없으면 구현이 다른 reason 하나를 빌려 쓰게 되고, 그러면 포커스
정책이 갈린다.

`offset`·`collisionPadding`·`branchId`가 prop이 아닌 것은 축소가 아니라 소유권 정리다. 앞의 둘을
인스턴스마다 바꿀 수 있게 하면 같은 종류의 overlay가 화면마다 다른 간격을 갖게 되고, `branchId`를
받으면 중첩 판정의 정합성을 호출부가 책임지게 된다.

## States

| 상태      | Panel DOM과 포인터                                   | 포커스·ARIA                                           |
| --------- | ---------------------------------------------------- | ----------------------------------------------------- |
| Closed    | unmount 또는 `hidden` + `inert`; hit testing 불가    | trigger `aria-expanded="false"`                       |
| Opening   | 위치 계산이 끝나기 전 `visibility:hidden`; 클릭 불가 | panel을 잘못된 좌표에 먼저 노출하지 않음              |
| Open      | `pointer-events:auto`; 최상위 활성 branch            | trigger `aria-expanded="true"`; variant별 초기 포커스 |
| Closing   | 시각적 exit만 허용; 즉시 `inert`와 pointer 차단      | trigger `aria-expanded="false"`, `aria-controls` 제거; 선택 액션 재실행 불가; 자식 branch도 함께 닫는다 |
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

Disabled item 전략은 menu 단위로 하나만 고른다(`disabledItems`). `skip`은 네이티브 `disabled`로 표기해
탐색에서 빠지고, `announce`는 `aria-disabled="true"`로 표기해 방향키가 지나가되 활성화되지 않는다. 두
표기를 한 menu 안에서 섞지 않는다 — 섞이면 시각적으로 같아 보이는 두 항목이 서로 다른 탐색 규칙을 갖는다.
링크 item에는 네이티브 `disabled`가 없으므로 `skip` 전략에서도 별도 표기가 필요하다.

`Enter`/`Space`는 브라우저가 합성하는 `click`으로 처리한다. keydown을 따로 달면 같은 입력이 두 번
실행된다. 그래서 이 표의 `Enter/Space` 행과 `ArrowRight` 행은 서로 다른 계층에서 구현된다 — 전자는
activation, 후자는 keydown이다.

item은 네이티브 `<button>` 또는 `<a href>`여야 한다. 링크 item은 새 탭 열기와 주소 복사를 유지해야
하므로 `<button>`으로 흉내 내지 않는다.

action menu의 item 목록은 가상화하지 않는다. Home/End·typeahead·`aria-setsize`가 렌더되지 않은 항목을
볼 수 없기 때문이다. 목록이 그만큼 길면 Listbox 또는 페이지로 전환한다.

문자 키 typeahead는 IME 조합 중에는 동작하지 않는다. 조합을 시작하는 keydown의 `isComposing`이 아직
`false`이므로 조합 플래그와 `keyCode 229`를 함께 본다.

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
5. branch가 `closing`에 들어가면 자식 branch도 같은 tick에 닫는다. 자식 panel은 부모 panel의 자손이
   아니라 overlay host의 형제이므로 부모의 `inert`에 덮이지 않고, activation 봉인도 인스턴스 단위라
   자식에는 걸리지 않는다. 전파하지 않으면 exit 동안 자식 항목이 보이고 눌리고 실행된다.

### "열리지만 선택되지 않음" 금지 계약

Panel이 보이는 것과 선택 가능한 것은 같은 완료 조건이다. 다음 중 하나라도 실패하면 `open`으로 보지
않는다.

- Panel과 모든 item이 실제 hit-test 대상이다.
- Panel이 덮는 좌표에 더 높은 투명 레이어가 없다.
- 부모 outside handler가 내부 `pointerdown`에 반응하지 않는다.
- Trigger 비활성화가 Panel이나 portal subtree로 전파되지 않는다.
- exit node가 새 Panel 위에서 포인터를 가로채지 않는다.
- item activation 전에 unmount되지 않고 callback이 한 번 실행된다.

## Focus

primitive는 초기 focus 정책과 return focus 규칙을 제공하지만 **기본값을 정하지 않는다.** 어느
variant가 무엇을 받는지는 이 절이 소유한다. 순서는 primitive의 것이다 — 초기 focus는 위치가 확정된
뒤 `open`에서 한 번, return focus는 exit 이전 `closing` 진입 시점이다.

### 초기 focus

| Variant             | 초기 focus                                              |
| ------------------- | ------------------------------------------------------- |
| `action-menu`       | 첫 enabled item. `ArrowUp`으로 열면 마지막 enabled item |
| `submenu`           | 첫 enabled item                                         |
| `composite-popover` | panel root                                              |

**입력 수단으로 갈리지 않는다.** Properties 표의 "입력 방식 의존"은 `ArrowUp`으로 열 때만 마지막
item이 되는 것을 뜻하며, 그 정보는 trigger의 keydown이 직접 가지고 있다. pointer 여부를
`event.detail === 0` 같은 heuristic으로 역추론하지 않는다 — 그 판정은 엔진과 보조기술에 따라 달라져
이 저장소가 검증할 수 없고, 잘못 갈리면 키보드 사용자가 항목에 도달할 경로를 잃는다.

action-menu에 panel root를 쓰지 않는 이유는 roving `tabIndex`와 결합했을 때 막다른 길이 되기
때문이다. roving에서는 활성 item 하나만 tab stop이고 panel 자신은 `tabIndex="-1"`이므로, panel에
focus가 있는 상태의 `Tab`은 자손이 아니라 문서의 다음 대상으로 나간다. 그리고 이 문서는 action
menu의 `Tab`이 menu를 닫도록 정하고 있다. 즉 panel root는 "열렸는데 방향키로만 도달 가능한" 상태를
만든다.

**첫 enabled item이지 첫 focusable이 아니다.** `disabledItems: "announce"`인 menu의 첫 항목이
disabled이면 둘이 갈린다. 어느 전략이든 초기 focus는 건너뛴 뒤의 첫 enabled item이다.

**후보가 0개면 panel root로 강등한다.** 비동기 로딩, 검색 결과 0건, 권한상 전 항목 비활성인
menu에서 초기 focus가 조용히 사라지면 키보드로 패널에 도달할 방법이 없어진다. 안내 문구는
`menuitem`이 아니라 panel의 `aria-describedby` 대상 또는 `role="status"`로 둔다.

`composite-popover`가 panel root인 근거는 자손이 자연 Tab 순서로 tabbable이라는 점이다. panel이
focus를 가지면 다음 `Tab`이 실제로 그 자손으로 들어가고, 이때 panel 이름이 먼저 읽힌다. 성립 조건
셋은 모두 구현 계약이다.

1. panel root에 `tabIndex="-1"`이 있다. 없으면 `focus()`가 아무 일도 하지 않고 **조용히 `none`으로
   강등된다.**
2. panel에 accessible name이 있다. `panelLabel`이 필수인 것이 이 조건을 만족한다.
3. 프로그램적 focus가 `:focus-visible`을 유발하지 않는다. 브라우저 heuristic이므로 시각 회귀로
   고정한다.

초기 focus는 open당 한 번이다. **이미 이 overlay 또는 그 자손 overlay 안에 focus가 있으면 보내지
않는다** — 부모와 자식이 같은 프레임에 열릴 때 부모가 자식에게서 focus를 빼앗으면, 그 이동이 자식의
바깥 판정을 발화시켜 사용자가 아무것도 하지 않았는데 자식이 닫힌다.

### `none`의 허용 조건

`none`은 기본값이 아니다. panel은 문서 끝 overlay host에 있으므로 trigger에서의 가상 커서 훑기가
panel 내용에 닿지 않고, `aria-controls`를 따라가는 조작은 보조기술마다 달라 계약으로 삼을 수 없다.
다음을 **모두** 만족할 때만 쓴다.

- panel에 focusable 자손이 하나도 없다(순수 정보 표시).
- trigger가 `aria-describedby`로 panel 내용을 직접 참조한다.
- 그 예외를 사용처 문서에 근거와 함께 남긴다.

### Return focus

| reason         | 발생 경로                                         | focus 대상                              |
| -------------- | ------------------------------------------------- | --------------------------------------- |
| `escape`       | Escape 한 단계                                    | 이 단계의 trigger — submenu면 부모 item |
| `select`       | item 활성화 + `closeOnSelect`                     | trigger                                 |
| `trigger`      | 열린 trigger 재활성화, submenu의 `ArrowLeft`      | trigger — submenu면 부모 item           |
| `outside`      | 바깥 pointer, Tab 이탈                            | **옮기지 않는다**                       |
| `route`        | route 변경, trigger unmount, viewport 소유권 변경 | **옮기지 않는다** — route owner가 소유  |
| `programmatic` | 소비자가 `open`을 직접 내림                       | trigger가 살아 있으면 trigger           |

**submenu는 부모 item을 trigger로 넘긴다.** 넘기지 않아도 primitive가 부모 panel 안으로 되돌리므로
포커스가 문서 밖으로 튀지는 않지만, 복귀 대상이 "부모 panel의 첫 항목"이 되어 사용자가 있던 자리와
달라진다. 규범이 요구하는 것은 **연 자리로 돌아가는 것**이다.

return focus의 **시점**은 exit 완료가 아니라 `closing` 진입이다. panel이 아직 DOM에 있는 동안 동기로
옮기고 그 직후 subtree를 inert로 만든다. 순서를 뒤집으면 복원 대상이 사라진 뒤에 focus를 옮기게 되어
body로 떨어진다. 따라서 exit 모션 동안 화면에는 패널이 보이지만 focus와 accessibility tree에서는 이미
없다 — 의도한 상태이며 exit duration이 그 구간의 상한이다.

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

- **Portal host 선택이 테마 램프 상속을 바꾼다.** 제품의 프로필 팝오버는 전용 overlay root가 아니라
  `document.body`로 포털된다(`Gnb.tsx:4011`, `Gnb.tsx:4037`, `Gnb.tsx:5347`, `Gnb.tsx:5373`). 앱 셸 라이트
  램프가 바로 그 `body`에 얹히므로(`Gnb.tsx:1972-2000`, 선택자
  `html[data-theme=light] body:has(.gnb-wrapperSidebar)`) 패널이 램프를 **상속한다.** 이 문서가 규범으로
  요구하는 별도 overlay root로 옮기면 패널은 램프 밖으로 나가고 라이트 표면과 구분선 색이 함께 바뀐다.
  **host를 먼저 정하지 않고 색부터 옮기면 라이트가 한 계단 어긋난다.**

| 라이트 상태 | Panel surface | 내부 구분선 |
| --- | --- | --- |
| 사이드바 있음(램프 안) | **`#f8f8f9`** — 패널은 `--dropdown-surface-bg`를 소비하고(`Gnb.tsx:1273`), 램프가 `--palette-gray-100`을 재매핑하면서 `--dropdown-surface-bg`도 직접 재선언한다(`Gnb.tsx:1972`, `Gnb.tsx:1979`, `Gnb.tsx:2000`) | **`#eeeef1`** — `--profile-line-color: var(--palette-gray-200)`(`Gnb.tsx:1293`) 위에 램프 재매핑이 얹힌다(`Gnb.tsx:1974`, `Gnb.tsx:1981`) |
| 사이드바 없음(램프 밖) | **`#f1f1f3`** — `--dropdown-surface-bg: rgb(var(--palette-gray-100-rgb))`(`globals.css:600`, `globals.css:24`) | **`#e3e4e8`** — `--palette-gray-200`(`Gnb.tsx:1293`, `globals.css:28`) |
| 다크(램프 없음) | **`#313640`** — `--palette-gray-800`(`globals.css:101`) | **`#575d68`** — `--palette-gray-700`(`Gnb.tsx:1286`, `globals.css:34`) |

Specification 표의 `Panel surface` 행은 라이트 값을 하나만 담는다. 램프를 상속하는 한 라이트는 두 값으로
갈리므로, 한 값으로 그린 Figma 표면은 사이드바가 있는 화면과 없는 화면 중 하나에서 반드시 틀린다.

### 세로 배치와 flip

**기본 세로 배치는 트리거 위쪽이다.** 제품의 노드 캔버스 계열 패널은 앵커에서 `bottom: calc(100% + gap)`으로
서고(`BgmNode.tsx:244`, `Toolbar.tsx:110`), 위쪽 여유가 모자랄 때만 아래로 flip해 `top: calc(100% + gap)`으로
간다(`metaDropdownViewport.ts:4-5`, `MetaDropdownPanel.tsx:314-322`). Properties 표의 `placement` 기본값
`bottom`은 이 계열과 **정반대**다. 기본값을 그대로 그리면 패널이 트리거 아래로 뒤집혀 캔버스 노드를 덮는다.

**flip 판정 순서는 고정이다.** `need = 패널 높이 + gap`, `aboveAvail = 트리거 top − 8`,
`belowAvail = viewport 안쪽 높이 − 8 − 트리거 bottom`으로 두고 ① 위에 들어가면 위(flip 없음) → ② 아니고
아래에 들어가면 아래 → ③ 둘 다 안 들어가면 여유가 더 넓은 쪽이다(`metaDropdownViewport.ts:26-45`).
여기 8px은 뷰포트 여백이다(`META_DROPDOWN_VIEWPORT_PAD_PX`, `metaDropdownViewport.ts:2`). 「자리가 좁으면
뒤집는다」로만 옮기면 ③이 빠져 좁은 화면에서 방향이 갈린다.

**flip해도 뷰포트 클램프를 걸지 않는다.** flip 뒤에도 가장자리에서 잘리면 그냥 잘린 채 노출된다
(`MetaDropdownPanel.tsx:84-88`). 이 절이 말하는 「flip/shift」의 shift는 **이 패널에** 없다 — nudge 계산
유틸은 `metaDropdownViewport.ts:7`에 살아 있지만 `MetaDropdownPanel`이 호출하지 않는다. 같은 유틸을 실제로
부르는 `PageMetaDropdownPanel.tsx:134`과 여기서 갈리므로, 「제품에는 shift가 없다」로 일반화하지 않는다.

**닫히는 동안 flip 상태를 유지한다**(`MetaDropdownPanel.tsx:204-206`). 즉시 리셋하면 아래로 열렸던 패널이
페이드 도중 위로 튄다.

**flip하면 `transform-origin`도 반대편으로 함께 갈아탄다.** 원점을 고정한 채 flip하면 패널이 트리거 반대
방향에서 자라 나온다. 원점 클래스와 앵커 인라인 스타일이 같은 값으로 함께 바뀐다
(`MetaDropdownPanel.tsx:304-312`, `MetaDropdownPanel.tsx:314-322`).

| `motionOrigin` | 기본 원점 | 아래로 flip한 뒤 |
| --- | --- | --- |
| `bottom-center` | `bottom center` | **`top center`** |
| `bottom-left` | `bottom left` | **`left top`** |
| `top-center` | `top center` | flip 대상 아님 |
| `top-left` / `left-top` | `left top` — 두 이름이 같은 값이다 | flip 대상 아님 |
| `left-center` / `right-center` | `left center` / `right center` | flip 대상 아님 |
| `right-top` | `right top` | flip 대상 아님 |

**자동 flip은 `bottom-*`에서만 켜진다.** 별도 지정이 없으면 원점이 `bottom-center` 또는 `bottom-left`일 때만
활성이고, 측면 서브메뉴(`left-center`·`right-center`·`left-top`·`right-top`)와 `top-*`는 대상이 아니다
(`MetaDropdownPanel.tsx:155-157`). 서브메뉴에 세로 flip을 붙이면 제품에 없는 동작을 만든다. 원점 상수 8종은
`MetaDropdownPanel.tsx:61-68`이 소유한다.

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

- Trigger: `aria-haspopup="menu"`, `aria-expanded`, 고유한 `aria-controls`. `aria-controls`는 panel이
  마운트돼 있고 `closing`이 아닌 동안에만 부여한다 — 존재하지 않거나 inert인 노드를 가리키면 접근성
  검사가 오류를 내고 "제어 대상으로 이동"이 아무 데도 가지 않는다.
- Panel: `role="menu"`, 이름이 필요한 경우 `aria-labelledby`.
- Item: 동작에 따라 `menuitem`, `menuitemcheckbox`, `menuitemradio`. `aria-checked`는 후자 둘에서만
  유효하며, `menuitem`에 붙이면 접근성 검사가 허용되지 않은 속성으로 판정한다 — 시각 체크 표시와
  접근성 상태가 갈린다.
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
| Panel surface  | `color-background-menu` — 라이트 neutral-100 / 다크 neutral-800 | light/dark/high contrast   |
| Panel radius   | `radius-overlay` = 16px                                | visual regression          |
| Panel padding  | `space-overlay-inset` = 6px                            | item hit area 유지         |
| Panel border   | 없음. 헤어라인은 `elevation-menu`의 0.5px 스프레드     | 레이아웃 박스 불변         |
| Item radius    | `radius-overlay-item` = 10px                           | hover/focus/selected state |
| Item 사이 간격 | `space-overlay-item-gap` = 2px                         | 행이 붙지 않는다           |
| Item 내부 gap  | `space-overlay-item-content-gap` = 6px                 | 아이콘·라벨 간격           |
| Item 전경      | `color-foreground-menu-item` — 알파 86%                | light/dark                 |
| Item hover     | `color-action-menu-item-hover` — 반투명 오버레이       | 배경이 달라도 같은 정도    |
| Item height    | 44px 이상 (`layout-control-hit-target-minimum`)        | pointer/touch target       |
| Danger 전경    | `color-action-danger` = #ff4b59                        | 중립 표면 위 대비          |
| Danger hover   | `color-action-menu-danger-hover` — red 알파            | light/dark                 |
| Anchor offset  | 8px                                                    | collision/flip             |
| Panel width    | 최소 160px, composite 240px reference                  | 긴 locale 문구와 200% zoom |
| Elevation      | `elevation-menu` — ambient + 0.5px 헤어라인 2겹        | overlay hierarchy          |
| Open motion    | opacity + scale, `motion-overlay-enter`; origin=anchor | reduced-motion 대체        |
| Reduced motion | transform 제거, 짧은 opacity 또는 즉시 전환            | motion preference          |
| Layer          | `layer-popover`, 숫자 리터럴 금지                      | nested overlay stack       |

표의 값 대부분은 제품의 공용 토큰(`--dropdown-*`)에서 채택했다. 채택/편차 판정과 근거는
[`migration/product.measured.json`](../../migration/product.measured.json)에 있고 게이트가 매 실행
확인한다.

**항목 높이 44px과 focus ring은 제품을 따르지 않는다.** 제품 항목은 37px이고 focus ring이 없다.
둘 다 WCAG 계약이라 제품에 맞춰 낮추지 않았다. **`danger` 전경을 제품 값으로 바꾼 것이 문서가
이미 인정하던 대비 결함을 해소한다** — 이전 `color-foreground-danger`는 중립 표면 위에서
무너졌다.

### 제품 계열 분기와 파생 규칙

**제품의 메뉴 표면은 두 계열이다.** A계열은 지역 변수 `--menu-pad`로 패딩을 선언하고 아이템 곡률을 거기서
파생시킨다. B계열은 전역 `--dropdown-*`을 그대로 쓴다. 위 표의 한 줄짜리 값은 B계열만 담고 있다.

| Part | A계열(사이드 메뉴 표면) | B계열(노드 더보기) | 근거 |
| --- | --- | --- | --- |
| Panel padding | **4px** — `--menu-pad: 4px` 선언 후 `padding: var(--menu-pad)` | **6px** — `var(--dropdown-padding)` | `EditNode.tsx:330`, `Toolbar.tsx:124`, `AnalyticsAccountMoreMenu.tsx:66` / `NodeMoreMenu.tsx:55`, `globals.css:85` |
| Item radius | **12px** — 리터럴이 아니라 파생값 `calc(var(--dropdown-radius) - var(--menu-pad, 4px))` = 16 − 4 | **10px** — `var(--dropdown-item-radius)` | `EditNode.tsx:342`, `Toolbar.tsx:136` / `NodeMoreMenu.tsx:65`, `globals.css:86` |
| Panel radius | 16px — `var(--dropdown-radius)` | 같다 | `EditNode.tsx:329`, `NodeMoreMenu.tsx:55`, `globals.css:84` |
| Panel 최소 폭 | **160px** — `min-w-80`, `--spacing: 2px` | **140px** — `min-w-70` | `EditNode.tsx:333`, `Toolbar.tsx:127`, `AnalyticsAccountMoreMenu.tsx:69`, `tailwind.css:164` / `NodeMoreMenu.tsx:54` |

**A계열의 아이템 곡률은 패널 패딩에 연동된 파생값이다.** 12px를 리터럴로 박으면 패딩을 6px로 바꿨을 때
안쪽 모서리가 어긋난다. 값보다 먼저 `item radius = panel radius − panel padding` 규칙을 옮긴다 — 토큰
모델이 이 파생을 표현하지 못하면 A계열은 재현되지 않는다. A계열은 여러 파일이 같은 두 줄을 복제한다
(`EditNode.tsx:330`·`342`, `Toolbar.tsx:124`·`136`, `AnalyticsAccountMoreMenu.tsx:66`·`79`, `CanvasZoomControl.tsx:70`,
`NodeSideButtons.tsx:253`, `TextNode.tsx:180`).

Known deviations의 「panel padding이 6px이 아니라 4px이다」는 **DS 구현측 대체 사유**이고, 제품의 4px +
파생 12px 계열은 그와 별개로 존재한다. 둘을 같은 사실로 합치면 아이템 곡률이 10px로 굳어 A계열이 사라진다.

계열에 속하지 않는 폭 예외 둘이 더 있다. 160px 하나로 통일해 그리면 노드 더보기 메뉴가 20px 넓어지고,
Responsive behavior의 「기본 200px 권장」은 제품 어느 계열과도 맞지 않는다.

| 사용처 | Panel 최소 폭 | 근거 |
| --- | ---: | --- |
| 캔버스 툴바 메뉴 앵커 | `max(100%, 172px)` — 트리거 폭과 172px 중 큰 쪽 | `Toolbar.tsx:110` |
| 캔버스 줌 컨트롤 | 180px — `min-w-90` | `CanvasZoomControl.tsx:52` |

### Item leading icon slot

Anatomy 6번 안의 선행 아이콘 칩이다. 위 표에는 행이 없다.

| 속성 | 값 | 근거 |
| --- | --- | --- |
| 치수 | **20×20px** — `w-10 h-10`, `--spacing: 2px` | `EditNode.tsx:358`, `Toolbar.tsx:152`, `tailwind.css:164` |
| 정렬·수축 | flex 중앙 정렬(`items-center justify-center`) + `shrink-0` | `EditNode.tsx:358-359`, `Toolbar.tsx:152-153` |
| 곡률 | **5px 리터럴** — `rounded-[5px]`. radius 스케일(2·4·6·8·10·12·14·16·20·24)에 없다 | `EditNode.tsx:358`, `Toolbar.tsx:152`, `tailwind.css:169-180` |
| 면(다크) | `rgb(var(--gray-700-rgb)/100%)` = **#575d68** | `EditNode.tsx:359`, `Toolbar.tsx:153`, `globals.css:49`, `globals.css:684` |
| 면(라이트) | 의미 토큰이 아니라 `rgb(var(--palette-gray-200-rgb)/100%)`를 직접 지정한다. 해석값은 램프 밖 **#e3e4e8**, 사이드바 램프 안 **#eeeef1** — §Portal and layer rules의 램프 표와 같은 갈림이다 | `EditNode.tsx:360`, `Toolbar.tsx:154`, `globals.css:44`, `Gnb.tsx:1981` |
| 내부 아이콘 | 15px | `Toolbar.tsx:161`, `Toolbar.tsx:364`, `Toolbar.tsx:380` |

**라이트에서 의미 토큰을 쓰면 칩이 한 계단 어두워진다.** 라이트에서 `--gray-700-rgb`는
`--palette-gray-300-rgb`(#d5d7dd)로 뒤집혀 있다(`globals.css:727`, `globals.css:817`). 그래서 제품은 라이트
면만 팔레트를 직접 지정한다 — 다크 값을 의미 토큰으로 그대로 옮기면 칩이 라벨보다 무거워진다.

5px 곡률은 governance/product-confirmations.md의 「모서리 반경 — 토큰 없는 값 상위」 표가 이미 15회·11파일로
세어 둔 그 값이다. 같은 문서가 「radius와 spacing의 홀수 계단은 전부 이웃과 1px 차라 화면에서 구분되지
않으므로 확인할 자리가 없다」로 판정을 미뤄 두었으나, 이 슬롯이 그 5px이 실제로 서는 자리다. primitive 추가와
리터럴 허용 중 하나를 골라야 하며, 그 판정 문장도 함께 정정한다.

### 위 표에서 어긋나는 행

- **`Item 내부 gap` 6px은 제품과 2px 다르다.** 제품의 아이콘↔라벨 간격은 `gap-4` = **8px**다
  (`EditNode.tsx:341`). 6px로 그리면 20px 칩이 라벨에 붙는다.
- **`Anchor offset`은 8px 단일값이 아니다.** 노드 메타 드롭다운은 **4px**
  (`META_DROPDOWN_DEFAULT_VERTICAL_GAP_PX`, `metaDropdownViewport.ts:5`; 앵커 `BgmNode.tsx:244`,
  `ImageNode.tsx:583`, `TtsNode.tsx:404`, `VideoNode.tsx:463`, `YoutubeNode.tsx:497`), 캔버스 툴바와 줌
  컨트롤은 **8px**이다(`Toolbar.tsx:353`, `Toolbar.tsx:417`, `Toolbar.tsx:511`, `CanvasZoomControl.tsx:167`,
  `Toolbar.tsx:110`, `CanvasZoomControl.tsx:52`). 8px 하나로 그리면 노드 메타 드롭다운이 트리거에서 4px
  떠서 붙는다.
- **`Panel width` 최소 160px은 A계열에서만 맞다.** B계열은 140px이다.

## Implementation

- Web source: `packages/react/src/menu/**`, `packages/react/src/popover/**`,
  `packages/react/src/anchored/**`
- CSS recipe: `packages/css/src/component/menu-popover.css`
- Public import: `import { ActionMenu, CompositePopover, OverlayProvider } from "@klipse-design/react"`
- Tests: `packages/react/test/menu-{keyboard,pointer,submenu}.browser.test.tsx` (실브라우저 35건,
  두 motion context에서 각각)

소비자는 앱 root에 `OverlayProvider`를 한 번 둔다. host와 scroll owner를 앱이 한 번만 해석하게 하는
것이 계약이며, 컴포넌트가 host를 고르면 인스턴스마다 stacking과 inert 경계가 달라진다.

`kind`는 prop이 아니라 컴포넌트다. `ActionMenuItem`을 `CompositePopover` 안에 두면 문맥이 없어
던진다 — 프로필 패널에 `role="menu"`를 붙이는 것을 타입과 런타임에서 모두 막는다.

### 계층 분담

| 계약 | 소유 |
| --- | --- |
| Escape 단계별 닫힘, 바깥 판정, activation exactly-once, presence, focus 복원 시점, branch lineage | overlay primitive (DS-P3-005) |
| roving `tabIndex`, 방향키·Home/End·PageUp/Down, typeahead, aria 배선, 열림 통지, submenu 진입·복귀 | 이 recipe |
| 표면·item·group·separator의 시각 표현 | `menu-popover.css` |

키보드 리스너는 panel DOM 노드에 **native로** 붙인다. React 이벤트는 DOM이 아니라 React 트리로
전파되는데 `ActionMenuSubContent`는 부모 Content의 React 서브트리 안에 있으므로, React 핸들러를 쓰면
submenu의 방향키가 부모 핸들러까지 실행해 focus가 부모로 튀고 그 focusout이 submenu를 닫는다.
두 panel은 DOM에서 **형제**이므로 native 리스너에는 그 문제가 없다.

`Enter`/`Space`에 keydown 핸들러를 붙이지 않는다. 브라우저가 이미 click을 합성하므로 더하면 두 번
실행된다. `<a href>`만 예외인데, `<a>`의 Space는 click을 합성하지 않고 페이지를 스크롤하기 때문이다.

## Known deviations

- **바깥 클릭이 드물게 배경 액션을 실행한다 — 간헐 결함.** 규범이 차단급으로 지정한 계약
  ("바깥 클릭은 메뉴만 닫고 배경 액션을 실행하지 않는다")이 전체 suite 실행 **36회 중 1회** 깨졌다. 실측한 증상은 **패널은 정상적으로 닫히는데 클릭이 배경까지 도달하는 것**이고,
  `browser-reduced-motion` project에서만 관측됐다. 단일 테스트 20회, 단일 project(reduced-motion) 10회로는
  재현되지 않아 **파일 간 상태 간섭**으로 보인다.

  후보 기제는 `OverlayDismissRegion`의 게이트다. 이 layer가 store의 topmost가 아니면
  `shouldConsiderOutside`가 false를 반환하고, 그 경로는 하부 유틸의 dismiss만 취소한 뒤
  **클릭을 삼킬 리스너를 등록하지 않는다.** 그 뒤 다른 경로가 패널을 닫으면 클릭은 그대로 배경에
  떨어진다. 즉 store에 **이전 테스트의 record가 남아 topmost가 어긋난 상태**가 조건일 수 있다.
  【추정】 — 계측으로 확증하지 못했다.

  **추측으로 dismiss 로직을 고치지 않는다.** 재현이 36회에 1회라 고침의 효과를 증명할 수 없고,
  증명되지 않은 수정은 이 경로에서 더 나쁜 회귀를 만든다. 재현 절차와 관측 기록을 남기고
  계측 가능한 형태가 될 때 판정한다.

- **`surface-overlay` 대신 `color-background-overlay`를 쓴다.** Specification 표가 대는 이름의 토큰이
  소스에 없다. DS-P3-014가 이름을 정리하면 갱신한다.
- **panel padding이 6px이 아니라 4px이다.** `space-overlay-inset`이 없어 `space-control-xs`로
  대체했다. DS-P3-014가 토큰을 추가하면 변수 한 줄만 바꾼다.
- **panel에 hairline border가 있다.** Specification 표에는 없지만 dark에서 `elevation-popover`
  그림자만으로는 표면 경계가 서지 않는다.
- **item에 `.kds-hit-target`을 쓰지 않는다.** 그 유틸의 44px `::after`는 항목 중앙에 겹쳐 놓이므로
  간격 없이 쌓이는 행에서 인접 항목의 hit 영역을 2px씩 가로챈다. 행 자체를 44px로 만든다.
- **`offset`과 `collisionPadding`을 인스턴스별로 바꿀 수 없다.** 값은 overlay 표면 CSS 한 블록이
  소유하고 Provider가 1회 측정한다.
- **Anchor를 Trigger와 분리할 수 없다.** Anatomy 2번이 허용한 분리는 아직 public 수단이 없다.
- **한국어 typeahead가 동작하지 않는다.** 비편집 요소에서 IME가 켜져 있으면 keydown의 `key`가 완성
  음절로 오지 않는다. 구현은 조합 중 오작동만 막고 매칭은 `compositionend`가 도착하는 환경에서만
  시도한다. macOS·Windows 실기 측정이 `stable` 승격 전 조건이다.
- **`ArrowRight`/`ArrowLeft`가 RTL에서 반전되지 않는다.**
- **composite popover의 inset이 action menu보다 크다(8px vs 4px).** `.kds-hit-target`을 쓰는 컨트롤은
  44px 타겟을 시각 박스 밖으로 확장하는데, 패널이 스크롤 컨테이너라 그 초과분이 유령 스크롤바가 된다.
  action menu는 행 자체를 44px로 만들어 그 유틸을 쓰지 않으므로 4px을 유지한다 — 거기서 8px을 쓰면
  안쪽 곡률이 item radius보다 작아져 모서리가 뚫린다. 두 값이 다른 것은 실수가 아니다.
- **danger item의 톤이 일반 item과 거의 구분되지 않는다.** 워크샵에서 실측한 대비는 light
  **1.21**, dark **1.14**다(danger 텍스트 : 일반 텍스트). `background-danger`·`foreground-danger`는 foreground와
  background가 **함께 쓰이도록 만들어진 쌍**이고 두 테마에서 서로 값이 뒤바뀐다 — light의
  `danger-foreground`(짙은 적갈)가 dark에서는 `danger-background`다. 그래서 텍스트 색으로만 쓰면
  light에서는 hue로 겨우 읽히고 dark에서는 사실상 사라진다. 해소에는 중립 표면 위에서 성립하는
  danger foreground 토큰이 필요하며 `DS-P3-014`가 소유한다. 그때까지 파괴적 액션의 신호는 규범이
  이미 요구하는 **명확한 동사 라벨**이 진다.
- **바깥 클릭도 최상위 branch 하나만 닫는다.** submenu가 열려 있으면 두 번 눌러야 전체가 닫힌다.
  외부 이벤트 정책 3을 그대로 따른 결과이며, 실사용에서 어색하다는 근거가 모이면 규범을 먼저 고친다.
- **`route`로 닫으면 포커스가 body로 떨어질 수 있다.** 포커스를 옮기지 않는 것이 그 reason의 계약이고,
  새 화면이 포커스를 잡는 것이 정상 경로다.

## 승격 조건

Web `done`과 `stable`에는 다음이 남아 있다.

- visual regression fixture (hosted CI 확보 후, DS-D-0005 2단계)
- 수동 keyboard·screen-reader review 기록
- SSR render와 hydration 검증
- `Shift+Tab` 역방향 이탈과 scroll·resize·zoom anchor 추종 검증
- published Figma component와 parity report (DS-F-006-menu-popover)
- 위 Known deviations 중 한국어 typeahead와 RTL의 해소

## Extraction baseline

Klipse product에서 관측된 “프로필 팝오버는 열리지만 메뉴가 선택되지 않음”은 허용 variant가 아니라
차단급 회귀다. 비규범 근거는 [`KP-OVERLAY-001`](../../migration/product-baseline.md)에 보존한다.
새 구현은 특정 원인을 추측해 복사하지 않고 branch, hit-test, activation exactly-once 계약과 아래
회귀 테스트로 문제를 차단한다.

## Overlay behavior layer

이 문서의 pointer·keyboard·branch·stacking 계약은 `packages/react/src/overlay/`의 내부 primitive가
구현한다. Menu와 Popover는 그 위에 얹히는 recipe이며 **순서를 다시 쓰지 않는다.**

primitive는 public 표면이 아니다 — 경계와 그 이유는
[DS-D-0011](../governance/decisions/DS-D-0011-overlay-primitive-boundary.md)이 소유한다.

| 계약 | 구현 | 회귀 테스트 |
| --- | --- | --- |
| 선택이 닫힘보다 먼저, 정확히 한 번 | `overlay/activation-guard.ts`, `overlay/dismiss-region.tsx` | `overlay-pointer.browser.test.tsx` |
| 바깥 판정은 `composedPath()` + branch registry | `overlay/branch-registry.ts` | `overlay-pointer`, `overlay-store.node` |
| Escape는 최상위 한 단계만 | `overlay/overlay-store.ts` | `overlay-keyboard.browser.test.tsx` |
| 위치 확정 전 비가시·비 hit-test | `overlay/presence.ts` + `base.css` | `overlay-presence.browser.test.tsx` |
| exit 완료와 unmount가 같은 source | `overlay/presence.ts`의 `readExitDuration` | `overlay-presence.browser.test.tsx` |
| anchor 기준 배치와 `--kds-overlay-*` seam | `overlay/positioner.tsx`, `component/overlay.css` | `overlay-presence.browser.test.tsx` |

non-modal에서 Tab으로 focus가 빠져나가 닫히는 경로의 reason은 **`outside`** 다. 새 reason을 만들지
않은 이유는 focus 정책이 `outside`와 같기 때문이다 — 둘 다 포커스를 옮기지 않는다(DS-D-0011 결정 4).

## Pre-implementation blockers

- ~~공유 positioning, dismiss layer, overlay branch primitive가 없다.~~ **해소(DS-P3-005).** 위
  Overlay behavior layer 참조.
- ~~semantic layer token의 컴포넌트 소비와 nested portal 소유권 구현이 없다.~~ **해소(DS-P3-005).**
  `.kds-layer-*` 유틸을 primitive가 붙이고, 자손 branch는 부모 layer를 물려받는다.
- ~~action menu 방향키, Home/End, typeahead, roving focus test가 없다.~~ **해소(DS-P3-006).**
- ~~composite popover의 initial/return focus와 Tab 정책이 구현되지 않았다.~~ **해소(DS-P3-006).**
  위 §Focus가 variant별 매핑과 reason별 return focus를 소유한다.
- ~~Menu·Popover의 public export가 없다.~~ **해소(DS-P3-006).**
- published Figma component와 Web parity evidence가 없다(DS-F-006-menu-popover).

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
- pointer로 연 action menu도 첫 enabled item에서 시작하고, 첫 항목이 `aria-disabled`여도 같다.
- `ArrowUp`으로 열면 마지막 enabled item으로 간다.
- enabled item이 0개인 menu는 panel root가 focus를 받는다.
- submenu의 Escape와 `ArrowLeft`가 모두 부모 item으로 복귀한다.
- `outside`와 `route`로 닫을 때 포커스가 이동하지 않고, 같은 fixture의 `escape`는 이동한다.
- 소비자가 `open`을 직접 내리면 reason이 `programmatic`이고 trigger로 돌아간다.
- `closing` 진입과 같은 tick에 trigger의 `aria-expanded`가 `false`가 되고 `aria-controls`가 사라진다.
- submenu가 열린 채 부모를 닫으면 같은 tick에 submenu 항목이 accessibility tree에서 사라지고 클릭해도
  콜백이 실행되지 않는다.
- root `disabled`가 강제로 열린 panel의 item을 비활성화하지 않는다.
- `Shift+Tab` 역방향 이탈도 정방향과 같은 원칙을 따른다.

### Layout and accessibility

- scroll, resize, zoom, visual viewport 변화에도 Panel이 anchor를 따라가고 viewport를 벗어나지 않는다.
  정적 1회 측정으로는 이 계약을 검증할 수 없다 — 변화를 만든 뒤 다시 측정해야 한다.
- 320px, 200% 확대, KO/EN/JA 긴 라벨, light/dark, reduced-motion을 검증한다.
- 접근성 검사에서 role 구조, accessible name, `aria-expanded/controls`, focus-visible 오류가 없다.
  자동 검사가 `role="menu"`의 accessible name 누락은 잡지 못하므로 그 항목은 별도 단언으로 고정한다.
- forced-colors에서 하이라이트된 danger item의 배경과 전경이 서로 다른 시스템 색이다.

이 테스트와 Figma variant가 연결되고 알려진 편차가 닫히기 전에는 `stable`로 승격하지 않는다.
