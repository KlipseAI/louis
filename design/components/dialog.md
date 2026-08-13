---
id: dialog
status: experimental
authority: normative
---

# Dialog / Modal

현재 맥락 위에서 사용자의 결정을 받거나 짧은 작업을 완료할 때 쓰는 차단형 overlay다. 이 문서는
과거 여러 Modal 구현의 평균이 아니라 이 저장소가 따라야 할 **규범 계약**이다. 특히 독립
비디오 편집 프로젝트는 Dialog가 아니라 page-owned Workspace다.

## Availability

| Surface       | 상태           | 근거                                           |
| ------------- | -------------- | ---------------------------------------------- |
| Web           | `not-ready`    | `@klipse-design/react`에 public export가 없음  |
| Figma         | `not-ready`    | published Dialog component가 없음              |
| Documentation | `done`         | 이 문서                                        |
| Maturity      | `experimental` | primitive와 상호작용·layout 테스트가 아직 없음 |

## When to use

- 사용자가 현재 작업을 계속하기 전에 확인·취소 중 하나를 선택해야 할 때
- 삭제, 덮어쓰기, 결제처럼 결과가 크고 별도 확인이 필요할 때
- 현재 페이지 맥락을 유지한 채 완료할 수 있는 짧고 유한한 폼을 제공할 때
- 캔버스의 한 노드에서 임시로 영상 편집기를 열고, 닫으면 원래 캔버스로 돌아갈 때

다음에는 사용하지 않는다.

- 지속적으로 사용하는 편집기, 대시보드, 프로젝트 상세는 페이지 또는 Workspace로 만든다.
- 트리거 주변의 짧은 선택은 [Menu / Popover](menu-popover.md)를 사용한다.
- 진행 상황 알림만 필요하면 Toast/Status를 사용한다.
- 내용이 여러 단계이거나 URL·새로고침·뒤로가기를 독립적으로 가져야 하면 route를 사용한다.
- 화면이 좁다는 이유만으로 Workspace를 `aria-modal` Dialog로 바꾸지 않는다.

## Surface classifier

겉모양이 전체 화면이라고 같은 컴포넌트가 아니다. 아래 질문 중 하나라도 Workspace 쪽이면 Dialog API에
`portalContainer`를 넣어 의미를 바꾸지 말고 별도 셸을 사용한다.

| 질문/계약              | Modal Dialog                         | Docked / Route Workspace                               |
| ---------------------- | ------------------------------------ | ------------------------------------------------------ |
| 사용자 맥락            | 원래 화면 위의 임시 작업             | URL이 소유하는 주 작업                                 |
| Mount owner            | 앱 전용 modal overlay root           | AppShell이 할당한 main/workspace host                  |
| Position               | viewport 기준 fixed inset            | host 기준 flow/grid 또는 absolute inset                |
| Backdrop               | 있음                                 | 없음                                                   |
| Background interaction | inert + pointer 차단                 | sidebar/header 등 허용된 shell chrome은 계속 사용 가능 |
| ARIA                   | `role="dialog"`, `aria-modal="true"` | `main`/`region`; `aria-modal` 없음                     |
| Focus                  | 초기 포커스 + trap + 호출 요소 복귀  | 문서의 정상적인 focus 순서                             |
| Escape                 | dismissible이면 닫고 원래 맥락 복귀  | 페이지 자체를 닫지 않음; 하위 overlay만 닫음           |
| Body scroll            | 잠금                                 | AppShell/Workspace가 자체 scroll owner를 정함          |
| App sidebar relation   | Dialog가 위에서 차단                 | shell grid가 공간을 할당하며 서로 겹치지 않음          |
| 완료/뒤로가기          | `onOpenChange(false, reason)`        | route navigation·dirty guard                           |

## Variants

| Variant           | 용도                                      | 기본 초기 포커스                     |
| ----------------- | ----------------------------------------- | ------------------------------------ |
| `confirm`         | 되돌릴 수 있는 일반 확인                  | primary 또는 가장 안전한 명시적 액션 |
| `danger-confirm`  | 삭제·초기화 등 파괴적 결과                | 취소/가장 안전한 액션                |
| `task`            | 짧은 폼·설정                              | 첫 유효 필드                         |
| `media-workbench` | 현재 화면 위에서 임시로 여는 큰 편집 작업 | heading 또는 첫 핵심 컨트롤          |
| `sheet`           | 작은 화면에서 변환된 modal task           | 닫기 또는 첫 필드                    |

`docked`, `standalone`, `route`는 Dialog variant가 아니다. 공유해야 하는 것은 editor body이며, modal wrapper와
workspace wrapper는 분리한다.

## Anatomy

1. **Overlay root** — modal stack과 portal owner를 연결한다.
2. **Backdrop** — 배경을 시각적으로 낮추고 pointer interaction을 차단한다.
3. **Positioner** — viewport, safe area, 작은 화면 배치를 담당한다.
4. **Dialog surface** — role, accessible name/description, focus scope를 소유한다.
5. **Header** — 제목과 선택적 닫기 액션. 제목은 하나만 둔다.
6. **Body** — 설명, 폼, 오류, 스크롤 콘텐츠.
7. **Footer** — 안전한 취소와 primary/danger action.
8. **Nested overlay host** — Select, Popover, Tooltip을 같은 modal branch에 연결한다.

## Properties

목표 public API는 Dialog의 의미를 바꾸지 않는다. Workspace host를 받는 `portalContainer`는 이 API에
포함하지 않는다.

| Property          | 값/형태                                      | 기본값       | 설명                                                      |
| ----------------- | -------------------------------------------- | ------------ | --------------------------------------------------------- |
| `open`            | `boolean`                                    | 필수         | controlled state                                          |
| `onOpenChange`    | `(open, reason) => void`                     | 필수         | `confirm`, `cancel`, `escape`, `backdrop`, `programmatic` |
| `variant`         | 위 variant                                   | `task`       | 레이아웃·초기 포커스·dismiss 정책                         |
| `title`           | node + id                                    | 필수         | `aria-labelledby` 대상                                    |
| `description`     | node + id                                    | 권장         | `aria-describedby` 대상                                   |
| `initialFocus`    | ref, `surface`, `safe-action`, `first-field` | variant 기반 | 열림 포커스                                               |
| `returnFocus`     | ref 또는 호출 요소 자동 캡처                 | 자동         | 닫힘 포커스                                               |
| `dismissible`     | `boolean`                                    | `true`       | Escape/닫기 버튼 허용                                     |
| `closeOnBackdrop` | `boolean`                                    | variant 기반 | danger·busy 상태에서는 보통 false                         |
| `busy`            | `boolean`                                    | `false`      | 중복 실행·dismiss 차단, `aria-busy`                       |
| `confirmVariant`  | `primary`, `danger`                          | `primary`    | 액션 의미                                                 |
| `size`            | `compact`, `medium`, `large`, `fullscreen`   | `medium`     | content 요구에 따른 크기                                  |

버튼 라벨, loading, disabled, 오류는 명시적인 props/slots로 제공한다. 전역 keydown listener로 confirm을
추론하지 않는다.

## States

| 상태    | 계약                                                                           |
| ------- | ------------------------------------------------------------------------------ |
| Closed  | DOM 없음 또는 완전히 inert; 배경 상호작용 정상                                 |
| Opening | root mount → 배경 inert/scroll lock → 위치 확정 → initial focus → enter motion |
| Open    | top modal만 active; focus trap과 nested overlay branch 유지                    |
| Busy    | 중복 confirm과 accidental dismiss 차단; 상태 문구와 spinner, `aria-busy` 제공  |
| Error   | Dialog 유지; 오류를 관련 필드/요약에 연결하고 첫 오류로 이동할 수 있음         |
| Closing | 즉시 action과 focusable child를 inert 처리; exit 후 unmount와 focus return     |

닫힘 타이머는 가장 긴 exit duration과 같은 token에서 계산한다. 카드가 사라진 뒤 투명 root가 pointer를
가로채거나, root가 먼저 사라져 focus return이 실패하면 안 된다.

## Interaction

### Open and focus

1. 열기 직전 `document.activeElement` 또는 명시적 Trigger를 저장한다.
2. Modal root를 최상위 stack에 등록하고 뒤 앱 root를 inert 처리한다.
3. body/scroll owner를 잠그되 기존 inline style을 보존한다.
4. Surface가 배치된 뒤 variant에 맞는 initial focus를 보낸다.
5. 닫힐 때 Trigger가 남아 있으면 복귀하고, 없으면 논리적인 다음 owner로 보낸다.

Tab과 Shift+Tab은 최상위 Dialog 내부에서 순환한다. nested Popover에 포커스가 있으면 같은 modal branch로
취급한다. 아래 Dialog나 페이지로 포커스가 빠지지 않는다.

### Keyboard

- `Escape`: top modal만 닫는다. `dismissible=false` 또는 `busy=true`이면 닫지 않고 필요한 안내를 제공한다.
- `Enter`: 폼의 네이티브 submit 또는 현재 focus된 버튼만 실행한다. document capture 단계에서 전역
  confirm으로 바꾸지 않는다.
- `danger-confirm`: Enter를 누르는 것만으로 danger action을 실행하지 않는다. 사용자가 danger button에
  명시적으로 focus하고 활성화해야 한다.
- IME 조합, textarea 줄바꿈, Select/Listbox key event를 상위 Dialog가 가로채지 않는다.
- 중첩 Dialog가 불가피하면 topmost 하나만 Escape/Tab scope를 소유한다.

### Pointer

- Backdrop dismiss는 `event.target === event.currentTarget` 또는 overlay branch 외부인지 확인한 뒤 실행한다.
- Surface와 nested portaled overlay의 pointerdown/click은 backdrop dismiss로 처리하지 않는다.
- danger-confirm과 데이터 입력 task는 기본적으로 backdrop click을 취소와 동일시하지 않는다. 데이터
  손실 가능성이 있으면 dirty guard를 제공한다.
- closing 상태의 root는 action을 다시 받지 않는다. 다만 exit가 끝날 때까지 배경 클릭이 accidental
  action으로 통과하지 않도록 정책을 일관되게 유지한다.

## Modal and Workspace separation

Dialog는 modal behavior만 소유한다. route가 주 작업을 소유하면
[Editor Workspace](../patterns/editor-workspace.md)를 사용하고 App Shell geometry는
[App Shell](../patterns/app-shell.md)에 맡긴다.

- 하나의 core를 공유할 수 있지만 Dialog wrapper와 route Workspace wrapper는 별도 public type이다.
- portal target 유무, ref timing, z-index로 mode를 추론하지 않는다.
- route Workspace에는 backdrop, `aria-modal`, focus trap, outside-close를 적용하지 않는다.
- Workspace에서 연 confirm Dialog는 global modal root를 사용하고 topmost modal behavior를 따른다.

## Portal and layer rules

- 모든 Modal Dialog는 앱의 하나인 modal overlay root로 portal한다. feature tree 안의 임의 div는 허용하지
  않는다.
- raw z-index 대신 `layer-popover < layer-modal < layer-critical` 의미 토큰과 stack manager를 사용한다.
- 새 Dialog가 열리면 이전 Dialog는 stack에 남더라도 inert다. Escape, focus trap, backdrop은 topmost만
  처리한다.
- Dialog에서 연 Popover/Tooltip은 같은 modal branch에 등록한다. 별도 body portal이라는 이유로 Dialog를
  닫거나 inert 처리되지 않는다.
- toast가 modal보다 위에 필요한지 아래에 필요한지는 feedback policy로 정하고, 숫자를 높여 우연히
  해결하지 않는다.
- viewport safe area와 virtual keyboard를 고려한다. `100vh`보다 visual viewport/`100dvh`와 safe-area
  padding을 우선한다.

## Responsive behavior

- compact confirm: `min(360px, viewport - 40px)` 기준. 320px에서도 좌우 여백을 유지한다.
- task dialog: 최대폭을 두되 body만 스크롤하고 제목과 footer action은 접근 가능하게 유지한다.
- action은 충분한 폭에서는 한 행, 긴 KO/EN/JA 또는 200% 확대에서는 세로 스택으로 전환한다.
- 큰 media workbench는 작은 화면에서 fullscreen modal이 될 수 있지만 여전히 원래 화면 위의 임시 맥락이면
  Dialog 계약을 유지한다.
- route Workspace는 fullscreen으로 보여도 Dialog 모션, backdrop, focus trap을 적용하지 않는다.

## Content

- 제목은 결정을 구체적으로 설명한다: `프로젝트를 삭제할까요?`, `변경사항을 저장하고 나갈까요?`.
- 설명은 결과와 복구 가능 여부를 말한다. 제목을 반복하지 않는다.
- 버튼은 결과를 나타낸다: `취소` / `삭제`, `계속 편집` / `저장하고 나가기`.
- danger action에 `확인` 같은 모호한 라벨을 쓰지 않는다.
- async action은 `저장 중`, `삭제 중`처럼 상태를 표시하되 말줄임표를 쓰지 않는다.
- 오류 후 Dialog를 닫지 말고 사용자가 복구할 방법을 제공한다.

## Accessibility

- Surface는 `role="dialog"`와 `aria-modal="true"`를 사용한다. 즉시 주의가 필요한 짧은 경고에서만
  `alertdialog`를 검토한다.
- 보이는 제목을 `aria-labelledby`, 설명을 `aria-describedby`로 연결한다. id는 인스턴스마다 고유하다.
- 열림 초기 포커스, focus trap, 닫힘 focus return은 선택 사항이 아니다.
- modal 뒤 앱 root는 pointer뿐 아니라 보조 기술·키보드 접근도 막아야 한다.
- 모든 버튼에 visible `:focus-visible`이 있고 icon-only close에는 locale-aware accessible name이 있다.
- busy, error, status는 [Loading Pattern](../patterns/loading.md)과 live region 계약을 따른다.
- 320px, 200% 확대, light/dark, reduced-motion, KO/EN/JA를 검증한다.

## Specification

| Part/state      | 목표 token/recipe                                    | 검증                              |
| --------------- | ---------------------------------------------------- | --------------------------------- |
| Compact width   | `min(360px, 100vw - 40px)`                           | 320px viewport와 200% zoom        |
| Task max width  | content tier token                                   | 긴 폼과 locale별 문구             |
| Surface radius  | compact 24px, large `radius-overlay` 16px            | compact/regular visual regression |
| Surface padding | compact 16px, content tier에 따라 증가               | scroll 가능한 content/action 분리 |
| Backdrop        | `surface-scrim-modal` = neutral 50% reference        | light/dark 대비                   |
| Action height   | 44px 이상                                            | pointer/touch target              |
| Action gap      | 8px                                                  | 200% zoom reflow                  |
| Elevation       | `elevation-modal`                                    | overlay hierarchy                 |
| Layer           | `layer-modal`, 숫자 리터럴 금지                      | nested overlay stack              |
| Enter motion    | `motion-modal-enter`: opacity + translate/scale      | reduced-motion 대체               |
| Exit motion     | `motion-modal-exit`, unmount lifecycle과 같은 source | animation completion              |
| Reduced motion  | 비필수 transform/filter 제거, 즉시 또는 짧은 opacity | motion preference                 |

## Extraction baseline

Klipse product의 여러 modal은 focus, Escape, scroll lock과 layer 정책이 달랐고 route editor를 Modal API로
도킹했다. “독립 에디터와 좌측 sidebar가 겹침”은 허용 배치가 아니라 ownership 회귀다. 비규범 근거는
[`KP-DIALOG-001`](../../migration/product-baseline.md)과
[`KP-EDITOR-001`](../../migration/product-baseline.md)에 보존한다.

## Pre-implementation blockers

- 공용 focus scope, inert, scroll lock, modal stack과 overlay branch가 없다.
- semantic layer token의 Dialog 소비와 unique title/description ID 정책이 구현되지 않았다. Layer token
  자체는 P2 local RC에 있다.
- P2 motion token은 있지만 close motion과 unmount lifecycle을 Dialog 구현에 연결하지 않았다.
- Dialog와 route Workspace를 type/API 수준에서 분리한 구현이 없다.
- keyboard, focus, nested overlay, responsive geometry와 Figma parity test가 없다.

## Migration

1. focus scope, inert, scroll lock, stack, overlay branch를 가진 headless `Dialog` primitive를 만든다.
2. `ConfirmDialog`, `TaskDialog`, `MediaWorkbenchDialog` recipe를 그 위에 만든다.
3. 단순 confirm 소비처를 먼저 이관하고 danger action의 전역 Enter confirm을 금지한다.
4. form/legal/media modal을 공용 primitive로 옮겨 Escape·focus·scroll 정책을 맞춘다.
5. 영상 편집 UI를 `VideoEditorWorkspaceCore`, `VideoEditorDialog`, `VideoEditorRouteWorkspace`로 분리한다.
6. AppShell grid가 sidebar와 main rect를 유일하게 계산하도록 하고 raw offset/z-index를 제거한다.
7. Figma variant와 interaction/visual/a11y 테스트를 연결한 뒤 기존 Modal adapter를 폐기한다.

breaking API와 사용자 동작 변경은 decision과 [Updates](../updates/README.md)에 기록한다.

## Migration acceptance tests

### Dialog behavior

- pointer와 keyboard 각각으로 열었을 때 variant별 initial focus가 맞다.
- Tab/Shift+Tab이 top Dialog와 그 nested overlay branch 안에서만 순환한다.
- Escape는 top dismissible Dialog만 닫고 Trigger로 포커스를 돌린다.
- modal 동안 뒤 앱의 button/link/canvas가 pointer, keyboard, accessibility tree에서 상호작용되지 않는다.
- body/scroll owner가 잠기고 닫힌 뒤 기존 scroll 위치와 inline style이 복원된다.
- backdrop, Surface, nested portaled Popover 클릭이 각각 올바른 dismiss 결과를 만든다.
- busy 중 중복 confirm과 accidental dismiss가 차단되고 상태가 읽힌다.
- danger-confirm은 focus되지 않은 상태의 전역 Enter로 실행되지 않는다.
- 두 Dialog를 쌓아도 topmost 하나만 Escape, focus trap, confirm을 처리한다.

### Modal editor versus route workspace

- 캔버스에서 여는 영상 편집기는 viewport modal overlay에 있고 backdrop, dialog semantics, focus trap을 가진다.
- route editor는 page main rect 안에 있고 backdrop, `aria-modal`, modal focus trap이 없다.
- desktop sidebar expanded/collapsed 각 상태와 전환 중 `sidebarRect.right <= workspaceRect.left`를 만족한다.
- Workspace가 viewport 기준 `fixed left:0`이 아니며, shell이 할당한 host를 100% 채운다.
- top chrome action portal은 editor body의 layout rect를 바꾸거나 sidebar 위 hit area를 만들지 않는다.
- 719px 경계 전후에서 mobile drawer는 닫혀 있을 때 hit area가 없고, 열리면 backdrop과 닫기 동작이 있다.
- Workspace 안의 ConfirmDialog는 앱 modal root에 떠서 editor와 shell을 모두 차단한다.
- 브라우저 뒤로가기와 dirty guard가 modal close와 혼동되지 않는다.

### Visual and accessibility

- 320px, 200% 확대, KO/EN/JA 긴 문구, light/dark, reduced-motion에서 내용과 action이 잘리지 않는다.
- focus-visible, 이름·설명 연결, 중복 id, axe smoke를 검증한다.
- sidebar/workspace와 modal stack의 bounding-box·hit-test 회귀를 브라우저 테스트로 고정한다.

이 테스트와 Figma variant가 연결되고 알려진 편차가 닫히기 전에는 `stable`로 승격하지 않는다.
