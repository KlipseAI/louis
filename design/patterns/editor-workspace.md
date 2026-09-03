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

## Canvas node side controls

캔버스 노드 카드는 좌·우 **바깥**에 28px 정사각 컨트롤 레일을 세운다. 제품은 이 레일을 카드 안이 아니라
카드 패딩 박스 바깥에서 계산하고, 값은 전역 변수 한 벌에서만 가져온다. **컨트롤 자리를 카드 폭에
포함시켜 계산하면 카드와 레일이 함께 어긋난다.**

| CSS variable | 해결값 | 지배하는 자리 |
| --- | --- | --- |
| `--node-side-handle-size` | `28px` | 사이드 버튼·핸들 한 변 — `globals.css:483` |
| `--node-side-handle-radius` | `8px` | 그 크롬의 모서리 — `globals.css:484` |
| `--node-side-gap` | `10px` | 카드 패딩 박스 ↔ 컨트롤 열 **수평** 간격 — `globals.css:492` |
| `--node-side-stack-gap` | `8px` | 같은 열 컨트롤끼리 **세로** 간격 — `globals.css:494` |
| `--node-side-ctrl` | `var(--node-side-handle-size, 28px)` | 레일 계산이 참조하는 한 변 — `globals.css:495` |
| `--node-side-leading-offset` | `calc(gap + ctrl)` = **38px** | 카드 왼쪽 테두리 ↔ 좌 레일 바깥선 — `globals.css:496` |
| `--node-handle-outbound-slot` | `calc(100% + gap)` | 우 출력 `left:`·좌 레일 `right:` 공통식 — `globals.css:497` |

규범 주석은 `globals.css:486-491`에 있다. 캔버스 셸이 같은 이름으로 덮어쓸 수 있게 열어 두었으나 현재
재정의하는 곳은 없다.

### 레일 배치

- 좌 레일은 `left: calc(-1 * var(--node-side-leading-offset))`에 선다.
  `right: var(--node-handle-outbound-slot)`은 같은 자리의 다른 표기다.
- 우 출력 핸들은 `left: var(--node-handle-outbound-slot)`에 선다.
- 둘 다 `top: 50%` + `translateY(-50%)`로 카드 세로 중앙에 건다. 레일 컨테이너는 `z-[5]`다.
- 한 열에 컨트롤이 여럿이면 세로 간격은 gap(10px)이 아니라 stack-gap(8px)이다.
  **n개 스택의 총높이 = n × 28 + (n − 1) × 8** — 4개면 136px.

수평 간격과 세로 간격을 한 값으로 합치면 레일 길이가 스택 개수마다 틀린다. 코드에서 `38px`을 직접
적는 것도 틀린다 — 그것은 `gap + ctrl`의 현재 해이고, gap이 바뀌면 좌 레일만 밀린다. Figma처럼 변수를
바인딩할 수 없는 도구로 옮길 때만 해결값 38px을 쓰고 파생 관계를 함께 적는다.

### Outset은 전역이 아니다

`--node-side-outset`은 전역 변수가 아니다. 노드 컴포넌트가 각자 로컬로 `0px`을 선언한다 —
`VideoNode.tsx` · `ImageNode.tsx` · `TextNode.tsx` · `TtsNode.tsx` · `BgmNode.tsx` 다섯이고, 그 밖의
노드(`EditNode.tsx` · `YoutubeNode.tsx` · `InstagramNode.tsx`)는 선언 없이 `var(--node-side-outset, 0px)`
폴백만 읽는다.

값이 `--node-side-leading-offset`(38px)으로 올라가는 것은 `[data-node-canvas-marketing]` 스코프
안에서뿐이고, **그 override를 가진 노드는 `VideoNode.tsx` · `ImageNode.tsx` · `TextNode.tsx` 셋뿐이다.**
`TtsNode.tsx` · `BgmNode.tsx`는 마케팅 스코프에서도 `0px`로 남는다. override가 걸린 노드에서는 같은
자리에서 정렬도 `center`에서 `stretch`로 바뀐다 — 마케팅 임베드는 좌우 크롬을 노드 박스 안에 포함하기
때문이다. 그래서 노드 바깥 박스 폭이 문맥마다 갈린다.

| 문맥 | outset | 카드 폭 | 바깥 박스 폭 |
| --- | ---: | ---: | ---: |
| 앱 에디터 캔버스 | `0px` | 400px | **400px** |
| 랜딩·마케팅 임베드 (video · image · text 노드) | `38px` | 400px | **476px** |

바깥 박스 폭 = `카드 폭 + 2 × outset`이다. 랜딩 쇼케이스 문서에서 노드의 `position.x`는 카드가 아니라
이 바깥 박스의 왼쪽을 가리킨다. 앱 값 400px로 랜딩 간격을 계산하면 노드마다 76px씩 밀린다.

**`--node-side-outset`을 전역 SSOT로 승격하지 않는다.** 올리는 순간 앱 캔버스가 랜딩 폭을 상속하고
카드가 컨트롤 자리만큼 안으로 밀린다.

### 카드 외곽선의 SSOT는 카드가 아니라 셸이다

**노드 모듈은 자기 border를 선언하지 않는다.** 캔버스 셸이 후손 셀렉터로
`[data-node-chrome="wrap"]`에 두께와 색을 **일괄 공급**한다. 카드가 자기 border를 다시 선언하면
회귀다.

| 상태 | 값 |
| --- | --- |
| 비선택 · 다크 | `2px solid rgb(var(--palette-gray-600-rgb) / 100%)` = `#777d89` |
| 비선택 · 라이트 | `2px solid rgb(var(--palette-gray-000-rgb) / 100%)` = `#fafafa` |
| 선택 (양 테마) | `2px solid rgb(var(--node-selection-accent-rgb) / 86%)` |

**시맨틱이 아니라 팔레트를 직접 읽는다.** `--gray-600`이 아니라 `--palette-gray-600-rgb`다 —
시맨틱으로 옮기면 테마에서 뒤집혀 두 상태가 같은 색이 된다.

계약 넷이 코드 주석에 적혀 있다.

1. **두께는 셸이 공급한다.**
2. **선택은 색 전환만이다** — 성능을 위해 `box-shadow`를 더하지 않는다.
3. **선택 규칙은 정렬에 맡기지 않고 `!`로 승자를 고정한다** — 원본에서 라이트 규칙보다 뒤에 있었다.
4. **선택 시 타이틀 줄도 같은 액센트를 100%로 받는다.** 미디어 오버레이 헤더는 제외인데
   **현재 그 표식을 붙이는 곳이 없다** — 배선 전이다.

**반경도 셸이 준다.** `--node-outer-radius: 24px`이고 안쪽은 `--node-inner-radius: 22px`다 —
**외곽에서 border 2px를 뺀 값**이다. 두 값을 따로 정하면 border 안쪽 콘텐츠가 모서리에서 어긋난다.
내부 입력 상자는 `--node-input-radius: 16px`로 또 다르다.

### 면에는 SSOT가 없다

**선은 셸이 한 곳에서 주는데 면은 그렇지 않다.** 노드 **여덟이 각자** 같은 두 줄을 자기
`NODE_WRAP` 상수에 인라인 복제한다.

| 테마 | 면 |
| --- | --- |
| 다크 | `rgb(var(--gray-800-rgb) / 100%)` |
| 라이트 | `rgb(var(--palette-gray-100-rgb) / 100%)` — 사이드바 램프 아래에서는 `#f8f8f9` |

**같은 카드에서 선은 팔레트를 읽고 면은 시맨틱(다크)과 팔레트(라이트)를 섞어 읽는다.** 셋을 한
규칙으로 통일하면 어느 한 테마가 틀린다.

**한쪽만 고치면 여덟 중 일곱이 남는다.** 면을 셸로 올리는 것은 제품 변경이므로 여기서 정하지
않고, 옮길 때는 **여덟이 같은 값이라는 사실**만 계약으로 쓴다.

선택 액센트는 채널마다 다르다. 일곱 채널의 값은
[DS-D-0010](../governance/decisions/DS-D-0010-token-coverage.md)의 선택 액센트 절이 소유한다.
**한 색으로 옮기면 일곱 중 여섯이 틀린다.**

근거: `components/scenes/create/node-canvas-v2/index.tsx:353-365` ·
`globals.css:655`(다크 램프 `--gray-800-rgb`)·`:56`(`--palette-gray-800-rgb`) ·
`:48`(라이트 `--palette-gray-100-rgb`)·`:30`(`--palette-gray-100`).

### 같은 숫자가 CSS 밖에 두 벌 더 있다

기하 값이 CSS 변수 한 벌로 끝나지 않는다. **TypeScript 상수가 같은 숫자를 다시 적고, 세 번째 벌이
썸네일 레이아웃에 또 있다.** 셋은 **수기 동기화 계약**이라 한쪽만 고치면 화면이 어긋난다.

| 상수 | 값 | CSS 대응 |
| --- | ---: | --- |
| `NODE_SIDE_GAP_PX` | 10 | `--node-side-gap` |
| `NODE_SIDE_STACK_GAP_PX` | 8 | `--node-side-stack-gap` |
| `NODE_SIDE_CONTROL_PX` | 28 | `--node-side-handle-size` |
| `NODE_SIDE_OUTSET_PX` | 38 | `--node-side-leading-offset` |
| `NODE_FLOW_OUTER_WIDTH_PX` | 476 | 카드 400 + 2 × 38 |

근거는 `components/scenes/create/node-canvas-v2/constants.ts:23-32`이고, 세 번째 벌은
`node-canvas-v2/lib/archiveThumbnail/layout.ts:41-42`가 **토큰 참조 없이 자기 리터럴로** 다시 적는다.

**Figma로 옮길 때 `28 · 10 · 8 · 38 · 476`을 한 세트로 옮긴다.** 하나만 바꾸면 랜딩 쇼케이스 배치와
썸네일 렌더가 앱 화면과 갈린다.

### 알려진 어긋남

**이 어긋남은 제품이 해소했다 — 토큰을 없애는 쪽으로.** 앞선 판은
`--node-handle-chrome-transition`(= `background 0.13s ease, color 0.13s ease, transform 0.1s ease`)이
이름과 달리 사이드 컨트롤 shell과 겹치지 않는다고 적고 「승격 전에 둘 중 어느 쪽이 계약인지 정한다」로
남겨 두었다. 배포본 `74a7303b`에 **그 토큰은 선언이 하나도 없다.** 지금은 전환을 토큰으로 두지
않는다는 것 자체가 규범이고, 제품 주석이 그것을 직접 적는다 — 「전환은 토큰이 아니라 소비처
유틸리티에 직접 적는다 — 셸은 `filter/color/border-color 0.13s ease`, 아이콘 스케일만
`transform 0.1s ease`」(`globals.css:429-430`).

**그래서 승격할 전환 토큰이 없다.** 사이드 컨트롤의 전환 사양은 소비처 유틸리티에서 읽는다.

핸들 shell/facet 2층 골격을 포함한 비규범 근거는
[`legacy-design-system.md` §6.9](../../migration/legacy-design-system.md)에 있다.

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

## 면 색 — 이 패턴은 토큰이 없어 제품을 그대로 인용한다 (2026-08-30)

에디터의 바닥과 패널 면은 **LOUIS 시맨틱으로 표현할 수 없다.** 값이 이렇다.

| | 라이트 | 다크 |
| --- | --- | --- |
| 워크스페이스 바닥 | `#f1f1f3` (`--palette-gray-100`) | `#313640` (`--palette-gray-800`) |
| 패널 넷 (assets · preview · properties · timeline) | `#e3e4e8` (`--palette-gray-200`) | `#171b22` (`--palette-gray-900`) |

**패널이 바닥보다 어둡다 — 두 테마 모두.** 일반 시맨틱 `bg-canvas`/`bg-surface` 는 그 반대를
전제한다(표면이 바닥 위로 뜬다: 라이트 `#fafafa` · 다크 `#313640`). 그래서 그 둘을 갖다 붙이면
**밝기 관계가 통째로 뒤집힌다.**

Figma 변수를 전수 조회해 확인했다.

- 바닥 짝(`#f1f1f3` / `#313640`)을 가진 변수는 셋 있으나 전부 다른 역할 이름이다 —
  `color/bg-menu` · `color/table-header-surface` · `color/dropdown/surface-bg`. 이름이 참이어야
  한다는 [DS-D-0029](../governance/decisions/DS-D-0029-token-names-must-be-true.md) 때문에 쓸 수 없다.
- **패널 짝(`#e3e4e8` / `#171b22`)을 가진 변수는 하나도 없다.**

그래서 `Pattern · EditorWorkspace` 의 면은 변수 바인딩이 아니라 **제품 인용 리터럴**이고,
프레임 이름에 다크 짝을 적어 둔다. 보드가 라이트로 그려지므로 리터럴은 라이트 값이다.

**이 패턴을 `done` 으로 올리려면 선행 판정이 필요하다** — 에디터 바닥·패널에 semantic 두 개를
세울 것인가, 아니면 이 축을 영구히 제품 인용으로 둘 것인가. 세운다면 두 값이 램프를 타지 않는
고정 팔레트 조합이라 light/dark 두 mode 를 갖는 semantic 이어야 한다.

**제품을 시맨틱 쪽으로 뒤집는 선택은 하지 않았다.** 그것은 라이트·다크 양쪽에서 눈에 보이는
외형 변경이고, 이 문서 어디에도 「패널이 바닥 위로 떠야 한다」는 규범이 없다. 소유자 판정으로
남긴다(2026-08-30, 소유자가 「Figma 를 제품에 맞춘다」를 택했다).

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
