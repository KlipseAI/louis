---
id: app-shell
status: experimental
authority: normative
---

# App Shell

App Shell은 로그인 후 제품 화면의 navigation, viewport, main surface, top chrome, global overlay를
소유한다. 기능 Scene은 Shell **안의 콘텐츠**를 소유하며 sidebar 여백이나 viewport 적층을 다시 만들지
않는다.

이 패턴은 로그인 후 archive, creation hub, editor, highlight, analytics, account surface에 적용한다.
마케팅·인증처럼 독립 navigation을 가진 surface는 범위 밖이다.

## Anatomy

```text
AppShell
├─ Skip link
├─ Navigation rail
│  ├─ Brand / home
│  ├─ Primary navigation
│  └─ Account / plan actions
├─ Mobile navigation scrim
├─ Main surface
│  ├─ Top chrome
│  │  ├─ Navigation toggle
│  │  ├─ Breadcrumb / page title
│  │  ├─ Context actions
│  │  └─ Profile trigger
│  └─ Primary scroll root or workspace host
└─ Global overlay root
```

DOM portal은 이 anatomy를 구현하는 방법 중 하나일 뿐 계약이 아니다. 공용 API는 slot 또는 layout
composition을 우선하되, top chrome이 main surface의 폭·배경·scroll 문맥을 정확히 공유해야 한다.

## Ownership boundaries

| 소유자                 | 반드시 소유한다                                                                               | 소유하면 안 된다                                       |
| ---------------------- | --------------------------------------------------------------------------------------------- | ------------------------------------------------------ |
| App Shell              | viewport height, safe area, sidebar/drawer 상태, main offset, top chrome, global overlay root | 기능별 grid 열 수, editor pane 크기, 프로젝트 데이터   |
| Page pattern           | main surface 안의 section, page scroll content, empty/loading/error 상태                      | sidebar width 계산, body portal의 임의 z-index         |
| Editor Workspace       | workspace host 안의 pane, timeline, local menu와 local overlay                                | navigation rail, profile popover, viewport 전체 offset |
| Dialog/Overlay service | modal inert/focus/scroll lock, semantic overlay layer                                         | 페이지별 임의 숫자 z-index 계약                        |

Shell의 geometry를 바꾸는 기능 요구는 feature 내부 CSS 예외가 아니라 App Shell 변경으로 처리한다.

## Layout contract

### Persistent navigation

- navigation rail은 문서 흐름 밖에 있을 수 있지만 main surface가 **같은 sidebar state 원천**으로 자리를
  예약해야 한다.
- expanded, collapsed, editor-auto-collapsed의 어떤 상태에서도 navigation과 main surface가 겹치지
  않는다.
- sidebar 폭 변경 중 main offset과 main width를 따로 지연시키지 않는다.
- main surface의 바깥 여백과 안쪽 content inset은 별도 semantic token으로 관리한다. feature가 음수
  margin으로 sidebar gap을 보정하지 않는다.
- 넓은 화면에서 main surface는 남은 공간을 사용하며 임의 max-width로 프로젝트 목록을 3열에
  고정하지 않는다.

### Compact navigation

- compact mode에서 sidebar reserve는 0이고 main surface는 전폭이다.
- navigation은 scrim 위 drawer로 열리며 main content를 밀지 않는다.
- drawer가 열리면 뒤 콘텐츠는 pointer와 focus 양쪽에서 비활성화되고 문서 scroll이 잠긴다.
- Escape, scrim activation, navigation 완료로 닫히며 trigger로 focus를 복원한다.
- desktop의 collapsed preference를 compact drawer의 내부 배치에 적용하지 않는다. drawer는 label을
  포함한 expanded navigation이다.

### Main surface and scroll

- main surface는 page와 navigation 사이의 유일한 제품 작업 면이다.
- regular mode의 surface chrome과 compact mode의 edge-to-edge 표현은 같은 content 구조를 공유한다.
- 일반 page는 한 개의 primary scroll root를 가진다. `body`와 카드 내부가 동시에 세로 scroll하지
  않는다.
- workspace page는 main surface를 고정 host로 제공하고 editor가 내부 scroll을 소유한다.
- sticky top chrome은 primary scroll root와 같은 surface 안에 있어야 한다.
- main content와 top chrome은 동일한 좌우 inset 원천을 읽는다.

공용 App Shell composition은 하나만 제공하고 page scroll과 workspace host를 명시적인 variant로 둔다.
`<main>`과 시각 panel의 소유권을 variant마다 바꾸지 않는다.

## Sidebar spacing

간격은 다음 정렬선으로 검증한다. 픽셀을 복사하기보다 semantic token 관계를 보존한다.

1. brand와 navigation item의 leading content line
2. navigation item과 main content의 leading line
3. top chrome과 page section의 horizontal inset
4. main surface의 top/right/bottom outer gap
5. collapsed icon hit area의 optical center

위 관계 대부분에 semantic token이 붙었다(아래 표). 이름과 값이 바뀌어도 **sidebar 내부 padding 변경으로
main inset이 우연히 어긋나지 않게** 관계 테스트를 유지한다. 추출 근거는
[`KP-LAYOUT-001`](../../migration/product-baseline.md)에 있다.

### 해결된 치수

아래 표는 `packages/tokens/generated/tokens.json`에서 **생성된다.** 손으로 고치지 않는다.

계약은 관계이고 값은 그 관계의 현재 해다 — 코드에서는 값을 복사하지 말고 변수를 참조한다.
**다만 Figma처럼 변수를 바인딩할 수 없는 도구로 옮길 때는 여기 해결값을 쓴다.** 그 자리에서
값을 지어내거나 제품을 눈대중으로 재면 코드와 갈리고, 갈린 것을 잡아 주는 장치가 없다.

<!-- GENERATED:app-shell-geometry START -->
| Token | CSS variable | 해결값 |
| --- | --- | --- |
| `layout-app-shell-brand-mark-height` | `--kds-layout-app-shell-brand-mark-height` | `28px` |
| `layout-app-shell-content-inset` | `--kds-layout-app-shell-content-inset` | `16px` |
| `layout-app-shell-content-reserve` | `--kds-layout-app-shell-content-reserve` | `120px` |
| `layout-app-shell-outer-gap` | `--kds-layout-app-shell-outer-gap` | `12px` |
| `layout-app-shell-sidebar-collapsed` | `--kds-layout-app-shell-sidebar-collapsed` | `56px` |
| `layout-app-shell-sidebar-padding` | `--kds-layout-app-shell-sidebar-padding` | `12px` |
| `layout-app-shell-sidebar-width` | `--kds-layout-app-shell-sidebar-width` | `280px` |
| `layout-app-shell-top-bar-height` | `--kds-layout-app-shell-top-bar-height` | `40px` |
| `motion-shell-collapse` | `--kds-motion-shell-collapse-delay` | `0ms` |
| `motion-shell-collapse` | `--kds-motion-shell-collapse-duration` | `320ms` |
| `motion-shell-collapse` | `--kds-motion-shell-collapse-timing-function` | `cubic-bezier(0.4, 0, 0.2, 1)` |
<!-- GENERATED:app-shell-geometry END -->

각 값이 지배하는 자리는 이렇다.

| Token | 지배하는 자리 | 근거 |
| --- | --- | --- |
| `layout-app-shell-sidebar-width` | 펼침 레일 폭 | `globals.css:143` — `min(280px, calc(100vw - 120px))`이고 최소폭이 960px이라 데스크톱에서는 상수 280 |
| `layout-app-shell-sidebar-collapsed` | 접힘 레일 폭 | `globals.css:408-410` — `2 × 레일 패딩 + 메뉴 히트 폭` |
| `layout-app-shell-content-reserve` | 본문에 **남겨 두는** 최소 공간 | `globals.css:143`의 빼는 값. **레일 폭이 아니다** — 이름 함정의 전말은 [DS-D-0018](../governance/decisions/DS-D-0018-app-shell-geometry.md) |
| `layout-app-shell-content-inset` | 본문 좌우 안쪽 여백 | `globals.css:128` |
| `layout-app-shell-sidebar-padding` | 레일 좌우 패딩 | `globals.css:126` |
| `layout-app-shell-outer-gap` | 카드 바깥 여백 | 아래 「부분만 대응한다」 참조 |
| `layout-app-shell-top-bar-height` | 상단 크롬 행 높이 | 세 후보 중 이것을 고른 근거는 [App Shell Parts](../components/app-shell-parts.md) |
| `layout-app-shell-brand-mark-height` | 브랜드 마크 레일 | 같은 문서 |
| `motion-shell-collapse` | 접힘 전환 — offset과 폭이 **하나를 공유한다** | 따로 지연시키면 겹치는 프레임이 생긴다 |

### 아직 토큰이 없는 축

아래는 KDS가 값을 주지 못한다. 옮기는 쪽에서 **지어내지 말고 제품을 인용한다.**

| 제품 변수 | 데스크톱 | ≤719px | 근거 |
| --- | --- | --- | --- |
| `--app-gnb-safe-top` | `max(12px, env(safe-area-inset-top, 0px))` | 동일 | `globals.css:108` |
| `--app-gnb-main-inline-padding-end` | `12px` | `16px` | `globals.css:130` · `417` |
| `--app-gnb-rail-padding-bottom` | `12px` | `0px` | `globals.css:122` · `418` |
| `--app-shell-min-width` | `960px` | 미적용 | `globals.css:148` · `434` |
| 레일 폭 (compact) | — | `0px` | `globals.css:426` |

**`outer-gap`은 부분만 대응한다.** 제품에는 12px 관계가 셋(상·우·하) 있고 셋이 서로 다른 변수를
갖는다. compact에서 상단만 유지되고 우측은 16으로, 하단은 0으로 갈라지므로 **하나의 토큰으로
셋을 덮을 수 없다.** DS-D-0018이 이 토큰을 「부분」으로 판정한 이유다.

카드 표면 자체(반경 · 글래스 링 · 하단 페이드 20px)는 이 패턴이 아니라 제품의 레이어 밖 전역
클래스가 소유하며, 아직 DS 계약이 없다.

## 미결정 — 셸 형태 A / B

**제품에 카드를 거는 방식이 둘이고, 어느 쪽이 정본인지 정해지지 않았다.** 이 문서는 그 사실을
기록만 하며 한쪽을 고르지 않는다. 두 계열은 실제로 공존하고 소비처 수도 비슷하다 —
**한쪽만 그리면 나머지 절반이 시스템 밖이 된다.**

| | 형태 A | 형태 B |
| --- | --- | --- |
| 크롬 클래스 | `appMainCardChrome` | `appMainCardChromeSurface` |
| 정의 | `appHomeSceneStyles.ts:799` (`mainWithAppSidebar`) | `myPageSceneStyles.ts:69` (`contentWithAppSidebarPanel`) |
| 카드가 걸리는 요소 | `<main>` 자신 | `<main>` 바깥의 패널 div |
| 사이드바 자리를 비우는 요소 | 씬 루트 (`appHomeSceneStyles.ts:916`) | 패널 div 자신 |
| 접힘 전환 대상 | `margin-left` **와** `width` (`appHomeSceneStyles.ts:923`) | `margin-left` **만** (`myPageSceneStyles.ts:76`) |
| 카드 자체의 margin | 네 방향 0 | 좌·우만 값이 있고 상·하 0 |

전환 곡선은 양쪽 모두 `320ms cubic-bezier(0.4, 0, 0.2, 1)`로 같다 — 위 표의
`motion-shell-collapse`와 일치한다. **갈리는 것은 곡선이 아니라 무엇이 움직이는가다.**

소비처는 이렇다(배포본 `origin/main` 기준).

| 계열 | 소비처 |
| --- | --- |
| A — 직접 | `appHomeSceneStyles.ts` · `NodeCanvasHomeScene.tsx` · `YoutubeAnalyticsScene.tsx` · `InstagramAnalyticsScene.tsx` · `AdminClient.tsx` |
| B — 직접 | `myPageSceneStyles.ts` · `VideoEditScene.tsx` · `EditorProjectWorkspace.tsx` · `InquiryClient.tsx` · 숏폼 클립 편집 라우트 |
| B — 모듈 경유 | `ExploreScene.tsx` · `HighlightScene.tsx` · `HighlightProjectScene.tsx` · `SettingsScene.tsx` · `SubscriptionScene.tsx` |

**마지막 줄이 함정이다.** 이 다섯은 `myPageSceneStyles`(카드)와 `appHomeSceneStyles`(그 밖의 부품)를
**둘 다** import한다. 그래서 import 목록만 보면 어느 계열인지 판정되지 않는다 — 카드가 어디서
오는지를 따라가야 한다.

### 이 문서가 지금 정하지 않는 것

공용 `AppShell` composition의 `variant`(`page` · `workspace`)는 위 A/B와 **같은 축이 아니다.**
`variant`는 스크롤을 누가 소유하는지를 가르고, A/B는 카드가 어느 요소에 걸리는지를 가른다.
둘을 같은 것으로 읽고 매핑하면 한쪽 계열이 조용히 사라진다.

**Figma를 포함해 옮기는 쪽은 한쪽을 골라 굳히지 않는다.** 그리려는 화면이 어느 계열인지 위
표에서 확인하고, 표에 없는 화면이면 「판정 불가」로 보고한다. 결정이 서면 이 절을 결정 기록으로
바꾸고 [DS-D](../governance/decisions/README.md)에 남긴다.

## Editor route behavior

- immersive editor route에 진입하면 regular mode sidebar를 임시 collapsed로
  만들 수 있다.
- 진입 전 사용자의 상태를 기억하고 route 이탈 시 복원한다. 임시 상태를 영구 preference로 저장하지
  않는다.
- 편집 중 사용자가 sidebar를 직접 전환하면 자동 복원보다 명시적 사용자 선택을 우선한다.
- sidebar를 펼쳐도 workspace host가 재배치되어야 하며 editor 위에 rail을 겹쳐 놓지 않는다.
- compact mode에서는 drawer를 닫은 상태로 workspace에 진입하고, navigation이 필요할 때만 overlay로
  연다.

## Overlay contract

숫자 `z-index`는 공용 계약이 아니다. 다음 semantic layer의 상대 순서가 계약이다.

| Layer            | 예                                      | 규칙                                                                   |
| ---------------- | --------------------------------------- | ---------------------------------------------------------------------- |
| Surface          | page content, docked editor             | 자기 host 안의 기본 stacking context                                   |
| Local floating   | card menu, editor tooltip, crop handles | 소유 surface 안에서만 경쟁한다                                         |
| Shell chrome     | top chrome, persistent navigation       | docked workspace보다 위지만 modal을 넘지 않는다                        |
| Global non-modal | profile popover, command palette        | shell overlay root에 렌더하고 열려 있는 동안 실제로 선택 가능해야 한다 |
| Modal            | confirm, plan gate, destructive dialog  | 뒤 surface와 non-modal interaction을 막고 focus를 가둔다               |
| Critical system  | session/payment interruption            | 제품 modal보다 위에 둘 필요가 있는 경우에만 별도 정책으로 승인한다     |

- Docked editor root가 viewport-level stacking context를 만들어 profile popover를 가리면 안 된다.
- global popover를 열 때 충돌하는 local menu는 닫는다. modal이 열리면 non-modal popover는 닫거나 inert
  상태가 되어야 한다.
- 보이는 popover 위에 투명한 editor layer가 pointer event를 가로채면 실패다.
- feature overlay가 `document.body`를 직접 선택해야 한다면 global인지 local인지 문서화하고 overlay
  service를 거친다.

## Responsive matrix

| Mode        | Navigation                          | Main surface                                 | Top chrome                       | Scroll                                           |
| ----------- | ----------------------------------- | -------------------------------------------- | -------------------------------- | ------------------------------------------------ |
| Regular     | persistent expanded/collapsed rail  | rail 다음 남은 영역, surface chrome 유지     | surface 안 sticky                | page 또는 workspace가 하나의 주 scroll 정책 선택 |
| Constrained | persistent rail 또는 임시 collapsed | 기능 패널을 줄이거나 접되 rail과 겹치지 않음 | 주요 액션 유지, 보조 액션 menu화 | body 가로 scroll에 의존하지 않음                 |
| Compact     | reserve 0, overlay drawer           | edge-to-edge                                 | safe area 안에서 유지            | main scroll 한 개, drawer 열림 시 잠금           |

regular/compact 호환 경계와 grid profile은
[Responsive Layout](../foundations/responsive-layout.md)의 Compatibility matrix를 따른다.

## Accessibility

- navigation은 고유한 `aria-label`을 가진 `<nav>` landmark다.
- 현재 route는 시각 상태와 `aria-current="page"`를 함께 제공한다.
- collapse/drawer trigger는 접근 가능한 이름, `aria-expanded`, `aria-controls`를 가진다.
- main 시작점으로 이동하는 skip link를 첫 keyboard 경로에 둔다.
- top chrome의 시각 순서와 focus 순서를 일치시킨다.
- profile popover는 실제 상호작용 모델에 맞는 menu 또는 dialog semantics를 사용하고, 열기·선택·닫기·
  focus 복원을 keyboard로 완료할 수 있어야 한다.
- sidebar와 main surface 전환은 reduced-motion에서 공간 이동을 최소화한다.

## Extraction baseline

기존 제품의 App Shell은 sidebar geometry 일부를 공유했지만 Scene별 composition, viewport height와
overlay 숫자가 분산됐다. 비규범 provenance는
[`KP-LAYOUT-001`](../../migration/product-baseline.md)에 보존한다.

보존할 결과는 sidebar 단일 geometry, compact drawer의 zero reserve, immersive route의
collapse/restore다. 복제된 Scene shell, 전역 최소폭, raw z-index는 새 package 계약으로 가져오지 않는다.

## 구현 (2026-08-18)

공용 composition `AppShell`이 `@klipse-design/react`에 있다. `variant`가 `page`(본문이 구른다)와
`workspace`(에디터가 안쪽 스크롤을 소유한다) 둘이며 **한 composition에 둔다** — 가르면 `<main>`과
시각 panel의 소유권이 variant마다 달라진다.

| 계약 | 구현 |
| --- | --- |
| 자리 예약 | 레일이 `absolute`여도 본문이 **같은 상태 원천**으로 `padding-inline-start`를 잡는다 |
| 전환 | offset과 폭이 `motion-shell-collapse` 하나를 쓴다 — 따로 지연시키면 겹치는 프레임이 생긴다 |
| scroll root | `.kds-app-shell__content` 하나. 셸은 `overflow: hidden` |
| 상단 크롬 | scroll root **안에** sticky. 본문과 같은 좌우 inset 원천을 읽는다 |
| compact | 예약 0 · 레일이 drawer · scrim · 뒤 콘텐츠 `inert` |
| 건너뛰기 링크 | anatomy의 첫 항목. 초점을 받으면 나타난다 |

**접힘 상태는 소비처가 소유한다.** 라우트가 정하는 경우가 있어 셸이 갖지 않는다.

## Pre-implementation blockers

- ~~P2 local RC에 App Shell geometry token은 있다. 이를 소비하는 공용 App Shell composition과 실제 제품
  integration은 아직 없다.~~ composition은 섰다(2026-08-18). **제품 integration은 여전히 없다.**
- drawer의 `inert` 테스트는 섰다. **focus trap 자체와 scroll lock은 아직 없다** — 뒤를 죽이는 것과 초점을 가두는 것은 다른 일이다.
- safe-area와 viewport-height 전략이 package로 정의되지 않았다.
- semantic overlay layer와 profile menu interaction test가 없다.

## Acceptance tests

- regular expanded/collapsed, editor-auto-collapsed에서 sidebar와 main surface의 사각형이 겹치지 않는다.
- sidebar 첫 navigation item, brand, main content leading line이 승인된 token 관계로 정렬된다.
- compact drawer를 keyboard로 열고 탐색·선택·Escape 닫기 후 trigger focus 복원을 완료한다.
- drawer가 열린 동안 뒤 page의 link/button을 pointer나 Tab으로 조작할 수 없다.
- page route는 body가 아니라 main surface 안에서만 세로 scroll하고 top chrome은 유지된다.
- workspace route는 body scroll 없이 host를 채우고 sidebar 전환에 즉시 reflow한다.
- profile popover를 연 뒤 모든 menu item을 pointer와 keyboard로 선택할 수 있다.
- profile popover, command palette, confirm modal을 editor route에서 열어 semantic layer 순서와 focus를
  확인한다.
- hub와 project/detail 소비처가 같은 shell outer gap·content inset·top chrome 정렬선을
  사용하고, route 전환 시 sidebar 또는 main surface와 겹치지 않는다.
- compact 경계와 200% 확대에서 navigation·breadcrumb·profile·주요 완료 액션이 잘리거나 겹치지 않는다.
