---
id: editor-workspace
status: experimental
authority: normative
---

# Editor Workspace

Editor Workspace는 preview, assets, properties, timeline처럼 여러 작업 pane이 동시에 필요한 편집 화면의
구조 계약이다. **route workspace와 modal editor를 같은 것으로 취급하지 않는 것**이 첫 규칙이다.

mode는 API와 DOM semantics에서 명시적으로 분리하며 portal target이나 ref timing으로 추론하지 않는다.

## Modes

| Mode                     | 예                                          | 소유 영역                                          | Modal semantics                                                                 |
| ------------------------ | ------------------------------------------- | -------------------------------------------------- | ------------------------------------------------------------------------------- |
| Route / docked workspace | 독립 editor project, highlight short editor | App Shell이 준 workspace host                      | 아니다. route main content이며 backdrop, `aria-modal`, focus trap을 쓰지 않는다 |
| Modal editor             | canvas에서 임시 editor 열기                 | viewport의 승인된 modal layer                      | 맞다. 뒤 UI를 inert 처리하고 focus를 가둔다                                     |
| Compact route workspace  | 작은 viewport의 project editor              | App Shell main 영역 전체, navigation은 닫힌 drawer | route다. 화면을 채워도 dialog로 노출하지 않는다                                 |

Mode를 `portalContainer`의 null 여부나 우연한 ref timing으로 추론하지 않는다. public API는
`mode="route" | "modal"`처럼 의도를 직접 표현해야 하며 잘못된 mode는 개발 단계에서 실패해야 한다.

## Anatomy

```text
App Shell                         ← route mode에서만
├─ Navigation rail / drawer       ← App Shell 소유
├─ Top chrome                     ← back, title, save/export, profile
└─ Workspace host
   └─ Editor workspace
      ├─ Assets pane
      ├─ Preview pane
      ├─ Properties / inspector pane
      ├─ Timeline pane
      ├─ Pane dividers / collapse controls
      └─ Local overlay root

Global overlay root               ← profile, command palette, modal confirm
```

Route mode에서 workspace host는 top chrome 아래 남은 surface를 채운다. Editor는 host 밖의 sidebar 공간을
계산하지 않는다.

## Ownership boundaries

### App Shell owns

- sidebar expanded/collapsed/drawer state와 main offset
- viewport height, safe area, route top chrome
- breadcrumb/back, profile, command palette 같은 global chrome
- global non-modal과 modal overlay root
- immersive route 진입 시 임시 sidebar collapse와 이탈 시 복원

### Editor owns

- assets, preview, inspector, timeline의 배치와 크기 상태
- pane resize/collapse, selection, playback, timeline keyboard interaction
- workspace host 안의 tooltip, menu, crop/guide overlay
- dirty/save/export 상태를 top chrome action slot에 제공하는 것

### Editor must not own

- `100vw - sidebar width` 같은 shell geometry
- body에 직접 올린 임의 z-index 경쟁
- route mode의 backdrop, page-level focus trap, click-outside close
- profile popover나 sidebar pointer handling

## Route workspace contract

- workspace root는 host를 기준으로 `inset: 0` 또는 flex fill하며 `min-width: 0`, `min-height: 0`을 가진다.
- regular/constrained mode에서 root는 host-relative다. viewport `position: fixed`로 sidebar reserve를 무시하지
  않는다.
- App Shell sidebar가 펼쳐지거나 접히면 host rectangle이 바뀌고 workspace는 그 안에서 reflow한다.
- immersive editor 진입 시 sidebar를 임시 collapse할 수 있다. 이 상태는 사용자
  preference를 덮어쓰지 않고 이탈 시 복원한다.
- 사용자가 편집 중 sidebar를 직접 펼치면 workspace가 밀려나거나 재배치되어야 한다. sidebar가 editor
  assets pane 위에 겹치면 실패다.
- 내부 editor header의 title/action을 top chrome으로 옮겼다면 원래 header는 중복 렌더하지 않는다. action
  portal 대상이 첫 render에 없더라도 두 벌의 저장/완료 버튼이 잠시 보이면 안 된다.
- editor scroll은 workspace 내부 pane이 소유하고 body/main page scroll과 경쟁하지 않는다.

## Modal editor contract

- 승인된 global modal root에 렌더하고 route content, navigation, global non-modal을 inert 처리한다.
- dialog name/description, initial focus, Tab containment, Escape, close 후 trigger focus 복원을 제공한다.
- backdrop activation은 drag 종료나 pointer capture와 충돌하지 않아야 한다.
- modal mode의 full-viewport stacking은 route mode에 전달되지 않는다.
- nested confirm/crop/help overlay는 가장 최근에 열린 layer부터 Escape로 닫힌다.
- 저장하지 않은 변경이 있으면 close request와 discard confirm을 분리한다.

## Pane layout

### Regular

- 상단 작업 행은 assets, preview, inspector를 두고 timeline은 하단 작업 행을 소유한다.
- preview가 핵심 pane이며 보조 pane 최소값 때문에 0 이하로 압축되지 않는다.
- pane width/height는 resize 가능한 state와 승인된 범위에서 관리한다. CSS literal과 component state가
  서로 다른 기본값을 갖지 않는다.
- divider는 pointer drag 외에 keyboard 조절과 reset을 제공한다.
- collapsed pane은 focus 순서와 접근성 트리에서 제거되고 명시적인 restore control을 남긴다.

기본 recipe는 assets, divider, preview, divider, properties와 하단 timeline 관계를 사용한다. pane
폭과 timeline 높이는 승인된 semantic token/state에서 오며 임의 fallback 숫자를 token으로 승격하지
않는다.

### Constrained

- host 폭이 모든 pane을 안전하게 담지 못하면 낮은 우선순위 pane부터 collapse 또는 drawer/tab로 옮긴다.
- App Shell을 포함한 문서 전체 horizontal scroll로 작업 공간을 숨기지 않는다.
- preview, playback, timeline, save/export는 계속 도달 가능해야 한다.
- breakpoint는 viewport가 아니라 workspace host의 pane 최소 요구량에서 결정한다.

constrained recipe는 compact 전환 전에도 전역 최소폭과 가로 scroll에 의존하지 않아야 한다.

### Compact

- App Shell sidebar reserve는 0이고 navigation drawer는 기본 닫힘이다.
- pane은 한 열의 단계형 구조, tabs, sheets 중 하나로 표현한다.
- preview, timeline, inspector뿐 아니라 **assets에도 명시적인 진입점**이 있어야 한다.
- 숨은 implicit CSS grid track에 assets가 우연히 배치되는 구현을 허용하지 않는다.
- 완료/저장/뒤로가기 같은 route action은 safe area 안에 유지하고 가상 키보드에도 가려지지 않는다.
- 높이가 짧으면 pane의 고정 최소 높이를 모두 유지하려 하지 말고 active pane에 scroll을 부여한다.

compact recipe가 assets 진입점을 생략하면 문서 순서나 숨은 implicit grid track에 우연히 배치하지 않고
검증 단계에서 실패한다.

## Responsive matrix

| Mode              | Shell navigation                                 | Pane presentation                                    | Overlay scope                                                |
| ----------------- | ------------------------------------------------ | ---------------------------------------------------- | ------------------------------------------------------------ |
| Regular route     | 임시 collapsed persistent rail, 사용자 전환 가능 | assets + preview + inspector / timeline              | local overlay는 host, global overlay는 shell root            |
| Constrained route | rail이 차지한 뒤 host 기준                       | 보조 pane collapse·tab·drawer, preview/timeline 유지 | local overlay가 host 밖 sidebar를 덮지 않음                  |
| Compact route     | reserve 0, 닫힌 overlay drawer                   | 명시적인 single-column/step structure                | editor는 main 영역을 채우고 shell drawer는 별도 global layer |
| Modal             | 배경 navigation inert                            | viewport 안에서 regular/compact editor layout 선택   | modal root가 소유, nested modal은 overlay service 사용       |

compact 호환 경계는 [Responsive Layout](../foundations/responsive-layout.md)에 기록한다. container 기반
전환은 위 기능 결과를 우선한다.

## Overlay and portal contract

### Local overlays

다음은 workspace host 또는 editor shell을 기준으로 위치한다.

- pane menu, tooltip, selection handles
- crop overlay와 composition guide
- timeline hover preview와 drag tooltip
- inspector option list가 host를 벗어날 필요가 없는 경우

local overlay는 sidebar/top chrome/profile popover보다 높은 viewport stacking context를 만들지 않는다.
host가 `overflow: hidden`이어도 떠 있는 menu가 필요하면 host 내부 local overlay root를 둔다.

### Global overlays

다음만 App Shell overlay service로 승격한다.

- profile popover와 command palette
- plan gate, destructive confirm, unsaved-change confirm
- viewport 기준 positioning이 실제 요구인 floating UI

승격 시 layer semantics, focus ownership, close order를 선언한다. 단순히 clipping을 피하려고
`document.body`로 보내지 않는다.

### Interaction guarantees

- global profile popover가 보이면 editor 위에서 pointer와 keyboard로 menu item을 선택할 수 있다.
- modal dialog가 열리면 profile popover와 local menu는 닫히거나 inert다.
- nested overlay에서 Escape는 topmost layer 하나만 닫는다.
- overlay close 후 focus는 editor selection을 파괴하지 않는 논리 trigger로 돌아간다.
- route editor와 modal editor의 z-index가 같은 selector나 상수로 섞이지 않는다.

## Keyboard and accessibility

- route mode root에는 `role="dialog"`/`aria-modal`을 붙이지 않는다. `<main>` 또는 이름 있는 application
  region 안에 pane landmark를 제공한다.
- assets, preview, inspector, timeline은 heading 또는 `aria-label`로 구분한다.
- pane resize/collapse, timeline zoom, clip 이동·자르기에는 keyboard 대체 동작을 제공한다.
- Space 재생/정지는 text input, menu, dialog에서 동작하지 않게 scope를 관리한다.
- focus가 숨긴 pane이나 뒤 modal layer에 남지 않아야 한다.
- 처리 상태는 구체적인 `role="status"`/progress semantics를 제공하고 편집 가능한 영역 전체를 불필요하게
  막지 않는다.
- reduced-motion에서 shell open/close와 pane 이동은 즉시 전환하되 drag/selection 결과는 유지한다.
- 200% 확대와 KO/EN/JA 긴 action label에서도 save/export/back을 사용할 수 있어야 한다.

## Extraction baseline

제품 구현의 host-scoped route workspace와 immersive route collapse/restore 결과는 보존하되,
Modal과 Workspace를 portal 유무로 분기한 API는 가져오지 않는다. compact assets 접근 누락,
body-portal floating UI, raw layer 숫자와 sidebar overlap 위험은 해결 대상이다.

비규범 provenance는 [`KP-EDITOR-001`](../../migration/product-baseline.md)에 있다.

## Pre-implementation blockers

- route와 dialog를 명시적으로 분리한 workspace API가 없다.
- regular/constrained/compact pane recipe와 assets 대체 진입점이 없다.
- local/global overlay service와 Escape/focus ownership test가 없다.
- pane resize keyboard alternative와 responsive geometry regression이 없다.

## Acceptance tests

### Geometry

- regular route에서 sidebar expanded/collapsed/auto-collapsed 각각 navigation과 editor rectangle이 겹치지
  않는다.
- editor 진입 전 sidebar 상태가 이탈 후 복원되고, 편집 중 사용자 전환은 즉시 workspace를 reflow한다.
- compact route에서 sidebar reserve가 0이고 drawer가 닫힌 상태로 시작하며 assets, preview, timeline,
  inspector, save/export에 모두 도달한다.
- 짧은 viewport와 200% 확대에서 pane이 workspace 밖으로 밀려 완료 액션이 사라지지 않는다.
- body와 workspace가 동시에 가로/세로 scroll하지 않는다.

### Overlay

- editor route에서 profile popover를 열고 pointer·keyboard로 설정/구독/언어/테마 항목을 선택한다.
- profile popover 위를 투명한 editor root가 가로채지 않는다.
- crop/help/local menu → global confirm 순서로 중첩하고 Escape가 topmost layer 하나씩 닫히는지 확인한다.
- modal editor를 열면 navigation과 route content가 inert이고 닫으면 원래 trigger로 focus가 돌아온다.
- route editor에는 backdrop click close나 modal focus trap이 적용되지 않는다.

### Interaction and accessibility

- keyboard만으로 pane 이동, collapse/restore, resize 대체, playback, save/export를 완료한다.
- focus가 숨겨진 pane, 닫힌 menu, modal 뒤에 남지 않는다.
- processing, upload, render success/failure가 screen reader에 중복 없이 전달된다.
- light/dark, reduced-motion, KO/EN/JA에서 top chrome과 editor action이 중복되거나 잘리지 않는다.
