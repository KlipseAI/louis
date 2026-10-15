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

#### 캔버스 하단 바 (노드 캔버스의 compact)

노드 캔버스 편집기는 위 규칙을 **하단 바 한 줄 + 아래 시트**로 푼다. 2026-10-07, 제품
`feat/canvas-mobile-ux` `Toolbar.tsx:219` · `index.tsx`(`TOOLBAR_ROW`) @3923caf7. 앱 셸이 compact 로 들어가는
`≤719px` 에서 켜진다.

| 칸 | 순서 | 동작 |
| --- | --- | --- |
| 레이어 | **맨 왼쪽** | 레이어 시트를 연다. 휴대폰에서 캔버스의 노드를 찾는 첫 조작이다(소유자 결정 2026-09-15) |
| 툴 전환 | 둘째 | 선택 ↔ 이동 |
| 추가 | 셋째 | 데스크톱의 노드 추가 칸 여섯이 **「추가」 시트 한 칸**으로 모인다 |
| 되돌리기 | 넷째 | 되돌릴 것이 없으면 비활성(불투명도 0.56, 누름 · 호버 틴트 없음) |

- **전체 보기(맞춤)는 두지 않는다**(소유자 결정 2026-09-15). 두 손가락으로 줄이면 같은 결과이고, 누르면 캔버스가
  예고 없이 멀리 가 버린다.
- 셸은 [Floating Shell](../components/floating-shell.md)의 `data-size="compact"` — 조각 **40**, 누르는 영역 **44**
  (`.louis-hit-target`), 바 높이 **48**(`4 + 40 + 4`). 데스크톱 배치는 속성이 없는 32 조각이다.
- **바닥 여백은 `max(12px, env(safe-area-inset-bottom))`** 이다 — 안전 영역 위에 뜬다. 앱이 `viewport-fit=cover` 를
  켜지 않아 환경 값은 보통 0 이고 12 가 남는다. 가운데 정렬이고 캔버스 크롬 최상단 층이다(상단 블러와 레이어 패널 위).
- 거친 포인터에서는 바 행에 `touch-action: pan-x pan-y` 를 건다. `manipulation` 은 핀치 확대를 허용해 Android
  인앱 WebView 에서 시트 위 핀치가 캔버스가 아니라 **페이지**를 키웠고, 페이지가 커지면 좌표계가 어긋나 뒤판을
  눌러도 시트가 닫히지 않았다. 시트 루트도 같은 선언을 건다.
- **시트는 새 부품이 아니다.** [Dialog](../components/dialog.md)의 `data-variant="sheet"` 에 에디터 시트의 손잡이를
  얹은 것이다. 뒤판 누르기 · 손잡이 탭 · 아래로 쓸기 · Escape 로 닫고, 닫힌 동안에는 본문을 마운트하지
  않는다(레이어 목록의 썸네일처럼 무거운 내용이 닫힌 시트에 남지 않게). 문서 본문으로 포털돼 캔버스 셸의
  `touch-action: none` · 쌓임 맥락에 갇히지 않는다. 시트 행은 메뉴 항목 레시피에 손가락 높이(최소 터치 목표)만
  더한다.
- 이미지 결과 크게 보기가 열려 있거나 편집 맞춤 상태인 동안에는 바를 **숨긴다**(마운트는 유지해 파일 입력과
  시트 상태가 끊기지 않는다) — 같은 자리에 라이트박스의 저장 · 닫기 행이 뜬다.
- 우측 하단 배율 컨트롤은 이 폭에서 숨는다 — 휠 · 핀치로 줌한다.

Figma 변형은 아직 없다. 위 구성의 정본은 제품이고, 이 절은 그것을 옮긴 것이다.

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
| `--node-side-handle-size` | `28px` | 사이드 버튼·핸들 한 변 — `globals.css:498` |
| `--node-side-handle-radius` | `8px` | 그 크롬의 모서리 — `globals.css:495` |
| `--node-side-gap` | `10px` | 카드 패딩 박스 ↔ 컨트롤 열 **수평** 간격 — `globals.css:507` |
| `--node-side-stack-gap` | `8px` | 같은 열 컨트롤끼리 **세로** 간격 — `globals.css:494` |
| `--node-side-ctrl` | `var(--node-side-handle-size, 28px)` | 레일 계산이 참조하는 한 변 — `globals.css:510` |
| `--node-side-leading-offset` | `calc(gap + ctrl)` = **38px** | 카드 왼쪽 테두리 ↔ 좌 레일 바깥선 — `globals.css:511` |
| `--node-handle-outbound-slot` | `calc(100% + gap)` | 우 출력 `left:`·좌 레일 `right:` 공통식 — `globals.css:512` |

규범 주석은 `globals.css:501-506`에 있다. 캔버스 셸이 같은 이름으로 덮어쓸 수 있게 열어 두었으나 현재
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

근거: `components/scenes/create/node-canvas-v2/index.tsx:367-379` ·
`globals.css:673`(다크 램프 `--gray-800-rgb`)·`:56`(`--palette-gray-800-rgb`) ·
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
`transform 0.1s ease`」(`globals.css:444-445`).

**그래서 승격할 전환 토큰이 없다.** 사이드 컨트롤의 전환 사양은 소비처 유틸리티에서 읽는다.

핸들 shell/facet 2층 골격을 포함한 비규범 근거는
[`legacy-design-system.md` §6.9](../../migration/legacy-design-system.md)에 있다.

## 캔버스 측면 패널

캔버스 **오른쪽에 붙는** 도움말 패널이다. 옛 가이드 모달을 대체한 큰 표면이고 `768px` 미만에서는 **아래 시트**로
바뀐다. 2026-10-07, 제품 `chore/landing-dead-walkthrough` `CanvasHelpPanel.tsx@b3c56ed1a:55`(@d040dce15). 캔버스를 가리지
않고 읽으면서 따라 하게 하는 자리다 — 그래서 모달이 아니다.

### 두 모습

| | 넓은 화면(`≥768px`) | 좁은 화면(`<768px`) |
| --- | --- | --- |
| 모습 | 캔버스 위에 떠 있는 **도킹 패널** | 아래 시트 + 뒤의 어두운 막 |
| 자리 | 위 `48` · 오른쪽 `12` · 아래 `64` · 폭 `340` | 좌우 `0` · 아래 `0` · 최대 높이 `72dvh` · 아래 모서리 직각 |
| 의미 | 비모달. 가두지 않는다 — 캔버스와 같이 쓴다 | **모달.** `role="dialog"` · `aria-modal` · 포커스 가두기 |
| 막(scrim) | 없다 | `dim-modal`. 누르면 닫는다. 읽기 도구에는 숨긴다(안에 같은 닫기가 있다) |
| 등장 | 오른쪽에서 앞쪽 이동(`drillSlideFwd`) | 아래에서 페이드 인(`detailPanelFadeIn`) |
| 닫기 키 | 패널 안에서만 듣는다 — 캔버스의 Escape 는 메뉴를 닫는 데 쓰인다 | 앱 공용 모달 훅이 맨 위 하나만 받게 한다 |

- **면은 메뉴 면이다.** `color-bg-menu` · `radius-overlay-lg`(24) · `elevation-popover` 에 안쪽 헤어라인(`--louis-hairline-inset`)
  한 겹. 새 값이 하나도 없어 **CSS 레시피를 세우지 않았다** — 소비처가 하나이고 값이 전부 이름 있는 토큰이라
  복제될 위험이 없다. 둘째 소비처(예: 노드 안 설정 패널)가 생기면 그때 `.louis-` 클래스로 올린다.
- **자리는 캔버스가 피해야 하는 값이다.** 위 `48` 은 노드 뷰 헤더(위아래 8 + 내용 32)의 아래 끝, 아래 `64` 는
  우측 하단 배율 컨트롤(바닥 12 + 높이 40) 위에 숨 12 다. 클래스 리터럴로 그려지므로 값을 클래스로 흘려보낼 수
  없고, 읽는 쪽(빈 캔버스 안내가 비키는 폭, 「보여 주기」가 노드를 맞출 때 비키는 폭)이 제품의 상수
  `canvasHelpPanelGeometry.ts`(폭 340 · 오른쪽 여백 12 · 시트 경계 768)를 보고 테스트가 리터럴과의 일치를 지킨다.
  **세 값을 한 세트로 옮긴다** — 하나만 바꾸면 안내 문구가 패널 밑으로 들어간다.
- **층은 툴바 아래, 캔버스와 레이어 패널 위다.** 도킹일 때 z `1002`(툴바 `1003` 과 그 메뉴보다 아래, 캔버스와 레이어
  패널 `1000` 보다 위). 시트일 때는 툴바까지 덮는다 — 시트 `1005`, 막 `1004`. 이 수들은 제품 값이고 LOUIS 에는
  층 이름이 아직 없다. 시트를 연 동안 캔버스는 손대지 않는다.
- **경계가 둘이다 — 719 와 768.** 앱 셸의 compact 는 `≤719px` 이고 이 패널의 시트 경계는 `<768px` 다. `720–767`
  에서는 셸이 compact 가 아닌데 도움말은 이미 시트다. 같은 값으로 맞출지는 **판정 필요**다 — 맞추면 패널이 오른쪽에
  붙을 최소 폭이 넓어지거나 시트가 한 구간 늘어난다.

### 구성 — 머리 · 몸 · 쪽

```text
Panel (aside, aria-label)
├─ Head   (높이 ≥52, 좌우 12, 위 8, 간격 4)
│  ├─ Back 단추       ← 처음 쪽이 아닐 때만
│  ├─ Title (h2, 포커스 대상)
│  └─ Close 단추
└─ Body   (세로 스크롤, 항목 간격 20, 좌우 8)
   ├─ Search          ← 처음 쪽에서만
   └─ Page            ← 쪽이 바뀌면 키가 바뀌어 새로 들어온다
```

- **쪽(page) 하나만 보인다.** 처음 · 노드 종류 · 노드 하나 · 하고 싶은 일 · 단축키 · 모델 비교 · 자주 묻는 질문.
  쪽 구성과 플랜 판정은 데이터 계층이 갖고 패널은 그리기만 한다. 열림 상태와 지금 쪽은 **캔버스가 쥔다** — 노드
  머리의 도움말 단추([Node Chrome Button](../components/node-chrome-button.md))가 같은 패널을 그 노드의 쪽으로
  열기 때문이다.
- **쪽 이동 모션은 방향을 말한다.** 앞으로 들어갈 때는 오른쪽에서(`drillSlideFwd`), 처음으로 돌아올 때나 바로
  앞 쪽으로 물러날 때는 왼쪽에서(`drillSlideBack`) 들어온다. 패널이 처음 열릴 때는 패널 자체가 들어오므로 쪽은
  앞으로 들어온다. 방향은 쪽에서 정한다 — 쪽은 패널 밖에서도 바뀐다.
- **뒤로는 지나온 쪽으로 간다.** 「노드 종류」에서 연 노드 쪽은 그 목록으로, 자주 묻는 질문의 링크로 간 쪽은 그
  질문으로 돌아간다. 처음 쪽에서 들어가면 비우고, 패널 밖에서 쪽이 바뀌어도 비운다. 뒤로 단추의 이름이 목적지를
  말한다(처음으로 · 노드 목록으로 · 이전으로).
- **머리의 제목은 쪽 제목이고 포커스를 받는다.** 열면 · 쪽이 바뀌면 제목으로 포커스를 옮겨 읽기 도구가 새 쪽을
  읽게 한다 — 누른 행은 쪽과 함께 사라져 그대로 두면 포커스가 문서 맨 앞으로 빠진다. 닫으면 연 자리(툴바 ·
  노드 단추)로 돌려준다. Safari · Firefox 는 단추를 눌러도 포커스를 주지 않아 닫을 때 돌아갈 곳을 캔버스가
  넘긴다. 쪽이 바뀌면 맨 위부터 읽는다(스크롤 초기화).

### 행의 문법 — 다섯

패널 안의 조각은 다섯 가지 문법이고 **전부 지역 구현**이다. 각각의 LOUIS 대응과 판정이 남은 것을 적는다.

| 조각 | 값 | 가장 가까운 LOUIS | 상태 |
| --- | --- | --- | --- |
| **이동 행**(`LinkRow`) | 사방 8 · 간격 10 · 반경 `radius-overlay-item`(10) · 호버 `bg-inset` · 제목 body-14 medium + 부제 caption-12 `fg-tertiary` + 오른쪽 부가 글자와 뒤 체브론(16, 좌우 뒤집힌 chevron-left) | [Selectable List Row](../components/selectable-list-row.md) — **선택용이라 다르다** | 처음 쪽 · 노드 목록 · 검색 결과가 모두 이 행이다. 선택 행의 변형으로 둘지 새 부품으로 둘지 **판정 필요** |
| **진행 체크리스트** | 20 상태 아이콘: 완료는 `accent-primary` 채운 원 + `fg-inverse` 체크, **지금**은 링 + 점(`accent-primary`), 남음은 `fg-tertiary` 링. 지금 단계만 제목이 medium 이고 설명과 보조 버튼(「보여 주기」)을 펼친다. `aria-current="step"` + 상태를 말하는 숨은 글자 | [Progress](../components/progress.md) · [Step Tile](../components/step-tile.md) — **다르다** | 상태가 있는 단계 목록은 LOUIS 에 없다. 원장에 **부품 후보**로 올린다. 세 단계를 모두 끝내면 묶음 자체를 숨긴다 |
| **번호 단계** | 22 원 · `bg-inset` · `fg-secondary` · caption-12 medium · 항목 간격 12, 번호와 글 사이 10 | 없다 | 하고 싶은 일 쪽마다 쓰이고 옛 가이드 두 파일에서도 되풀이된 조각이다. primitive 후보 — 낮은 우선순위 |
| **키캡** | 22×22 이상 · 좌우 6 · 반경 `radius-overlay-item`(10) · `bg-inset` · `fg-secondary` · caption-12 medium. 손의 동작(끌기 · 클릭 · 스크롤 · 핀치)은 상자 없이 글자, 동시에 누르는 키 사이에 「+」 | [Keycap](../components/keycap.md)(레시피 없음) | **소비처가 둘이 되며 값이 갈렸다**: 명령 팔레트의 `KEY` 는 20×20 · 반경 6 · `gray-000` 8% 다. 한 레시피로 정할 때 두 소비처의 치수와 면을 같이 결정한다 — **판정 필요** |
| **검색칸** | 높이 36 · `bg-inset` · `radius-control`(12) · 돋보기 16 · placeholder `fg-tertiary` · 좌우 12 | [Text Field](../components/text-field.md) | 앞 아이콘이 있는 **채운 면** 변형이다. 레이어 패널 검색과 함께 판정한다 |

- **패널 머리의 아이콘 단추**(뒤로 · 닫기)는 32 정사각 · `radius-overlay-item`(10) · `fg-secondary` · 호버
  `bg-inset` + `fg-primary` 다. [Icon Button](../components/icon-button.md)의 ghost 는 반경이 `radius-control`(12)
  이라 **반경만 다르다.** 오버레이 안 ghost 아이콘 단추의 반경을 10 으로 정할지, 제품이 `louis-icon-button` 을 쓰게
  할지 **판정 필요**(낮은 우선순위).
- **묶음 제목은 행보다 한 단계 위**(16 세미볼드 · 기본 글자색)다. 작은 회색 소제목(눈썹 라벨)을 쓰지 않는다. 처음
  쪽은 「첫 영상 만들기」만 제목을 갖고 나머지는 제목 없이 위 헤어라인으로 나눈다(소유자 10-07 시안 B).
- **자주 묻는 질문은 [FAQ Row](../components/faq-row.md) md 의 첫 소비다.** `louis-faq-row` · `data-size="md"` 를 그대로
  문다. 질문만 늘어놓고 답은 누른 것만 펼치며, 검색에서 질문을 골라 들어오면 그 질문을 펼쳐 둔다.
- **모델 비교표는 [Table](../components/table.md)의 레시피를 쓰지 않는다.** 이름 칸이 남는 폭을 갖고 값 칸은 내용
  폭으로 오른쪽 정렬하며(`tabular-nums`) 열 이름이 스크롤 영역 위에 붙는다(`sticky`, 위 `-8` 은 스크롤 영역의 위
  여백만큼이라 줄이 그 사이로 비치지 않는다). 줄 사이 선은 **둘째 줄부터** 긋는다 — 맨 위에서 선이 두 겹이 되지
  않게. Table 에 붙는 머리와 조밀 축을 둘지 **판정 필요**다.
- **채널 버튼 타일은 그림이다.** 24 · 반경 6 · 채널 면(`--node-handle-icon-*`) 위 흰 글리프 — 캔버스 왼쪽 버튼과 같은
  면 토큰이고 같은 판정(`getEdgeTone`)·같은 표(`HANDLE_GLYPH`)를 읽는다. [Node Side Handle](../components/node-side-handle.md)과 같은
  재료를 다른 크기(28 → 24)와 **팔레트 흰색 리터럴 잉크**로 다시 그렸다 — 잉크를 토큰으로 두고 그림용 작은 크기 축이
  필요한지 **판정 필요**(낮은 우선순위). → 2026-10-15 판정: 크기 축이 아니라 따로 선 그림 부품 [Node Handle Tile](../components/node-handle-tile.md)
  (잉크 `fg-on-danger`, [DS-D-0108](../governance/decisions/DS-D-0108-node-handle-tile.md)).

### 하지 않는 것

- 패널을 모달로 만들지 않는다. 넓은 화면의 패널은 캔버스를 쓰는 동안 열려 있는 것이 목적이다.
- 닫기를 막지 않는다 — Escape · 닫기 단추 · (시트일 때) 막 누르기, 셋 다 같은 일을 한다.
- 도움말 쪽 문구를 LOUIS 가 소유하지 않는다. 문구 · 쪽 구성 · 플랜 판정은 제품 데이터 계층이다.

Figma 변형은 아직 없다. 위 표의 값은 제품 `CanvasHelpPanel.tsx` 의 클래스 리터럴을 이 저장소의 토큰 이름으로 읽은 것이다.

## 바닥 점 격자 — `.louis-canvas-dots`

2026-10-15 부터 규범은 컴포넌트 문서 [Canvas Dots](../components/canvas-dots.md) 가 갖는다(Figma 타일 `CanvasDots`, [DS-D-0102](../governance/decisions/DS-D-0102-canvas-dots.md)).
레시피 파일은 그대로 이 패턴의 것이다. 아래는 이 패턴 안에서의 자리다.

캔버스 작업 면의 채움이다(레시피 `packages/css/src/pattern/editor-workspace.css`). 지름 2 점 · 24 격자 · `color-canvas-dot`(다크 #fafafa 16% ·
라이트 pg-600 28%) 위 `bg-canvas`. 정본은 제품 `components/scenes/create/node-canvas-v2/components/CanvasBackground.tsx:5-6 · :15-20`(xyflow
`<Background variant=Dots gap=24 size=2>`)이고 색은 `--canvas-dot`(`node-canvas-v2/index.tsx:523` · `:530`)과 바이트가 같다(DS-D-0082).

점은 **캔버스 좌표**에 박혀 있다 — 줌하면 격자와 점이 함께 커지고, 끌면 함께 흐른다. 살아 있는 캔버스는 `--louis-canvas-dots-scale` ·
`-x` · `-y` 를 넣고, 목업 · 정적 데모는 클래스만 붙인다. 노드 캔버스 자체는 xyflow 바닥(SVG 패턴)을 같은 값으로 그린다 — 이 클래스는
**값의 정본**이고 랜딩 목업 · 정적 데모 · Figma 대조가 쓴다.

| 지역 변수 | 기본 | 뜻 |
| --- | --- | --- |
| `--louis-canvas-dots-pitch` | 24px | 격자(제품 `gap`) |
| `--louis-canvas-dots-radius` | 1px | 점 반지름(제품 `size / 2`) |
| `--louis-canvas-dots-scale` | 1 | 캔버스 줌 배율(xyflow `transform[2]`) |
| `--louis-canvas-dots-x` · `-y` | 0px | 화면 이동량(xyflow `transform[0..1]`) |

강제 색에서는 점을 걷고 면만 남긴다. [Chart Card](../components/chart-card.md) 의 점 바닥(`data-floor="dots"`)과 같은 기법이고 격자 ·
잉크 · 줌 추종만 다르다.

**랜딩 정적 임베드의 20% 점은 이 칸이 아니다.** 어두운 랜딩 면 위 `palette-gray-000` 20%(`node-canvas-v2/index.tsx:551`)라 테마를 따르는
캔버스 점과 다른 칸이다. 새 이름(`color-canvas-dot-on-media`)을 세우지 않고 랜딩 회차로 미룬다(DS-D-0084 소유자 판정 11, 2026-10-13 기본값).

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
전제한다(표면이 바닥 위로 뜬다). 그래서 그 둘을 갖다 붙이면 **밝기 관계가 통째로 뒤집힌다.**
`bg-surface` 의 값 자체는 그 뒤 움직였다 — 여기 `#313640` 이라 적혀 있던 다크 값은 회색 램프
재구성과 2026-09-09 의 다크 사다리 이동을 거쳐 지금 `palette-gray-850` `#21252d` 다(`bg-canvas`
(dark)는 `palette-gray-900` `#171b22`). **뒤집힘이라는 사실은 값과 무관하게 그대로다** — 넷이
함께 내려갔고 표면은 여전히 바닥 위로 뜬다. 위 표의 제품 hex 넷은 2026-08-30 실측 당시의
값이다.

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
