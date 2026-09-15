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

  - **예외** — 패널 안에 든 상단 크롬(`mainChromeTopBarInPanel`)은 `--mainchrome-bleed-left/right`로 감싼 요소의 좌우 패딩을 음수 margin으로 상쇄해 카드 전폭으로 번진다. 값과 폴백 트랩은 「아직 토큰이 없는 축」에 있다.

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
| `layout-app-shell-brand-mark-height` | `--louis-layout-app-shell-brand-mark-height` | `28px` |
| `layout-app-shell-content-inset` | `--louis-layout-app-shell-content-inset` | `16px` |
| `layout-app-shell-content-reserve` | `--louis-layout-app-shell-content-reserve` | `120px` |
| `layout-app-shell-outer-gap` | `--louis-layout-app-shell-outer-gap` | `12px` |
| `layout-app-shell-sidebar-collapsed` | `--louis-layout-app-shell-sidebar-collapsed` | `56px` |
| `layout-app-shell-sidebar-padding` | `--louis-layout-app-shell-sidebar-padding` | `12px` |
| `layout-app-shell-sidebar-width` | `--louis-layout-app-shell-sidebar-width` | `280px` |
| `layout-app-shell-top-bar-height` | `--louis-layout-app-shell-top-bar-height` | `40px` |
| `motion-shell-collapse` | `--louis-motion-shell-collapse-delay` | `0ms` |
| `motion-shell-collapse` | `--louis-motion-shell-collapse-duration` | `320ms` |
| `motion-shell-collapse` | `--louis-motion-shell-collapse-timing-function` | `cubic-bezier(0.4, 0, 0.2, 1)` |
<!-- GENERATED:app-shell-geometry END -->

각 값이 지배하는 자리는 이렇다.

| Token | 지배하는 자리 | 근거 |
| --- | --- | --- |
| `layout-app-shell-sidebar-width` | 펼침 레일 폭 | `globals.css:117` — `min(280px, calc(100vw - 120px))`이고 최소폭이 960px이라 데스크톱에서는 상수 280. **제품 `2c6bdacf`(2026-09-15 앵커)가 `min(240px, …)` 로 줄였다(소유자 지정 — 캔버스 레이어 패널 폭과 같다). 토큰은 아직 280 이다** — P2 값 이동은 이 앵커 이동에서 하지 않았고 판정이 남았다(Updates (138)) |
| `layout-app-shell-sidebar-collapsed` | 접힘 레일 폭 | `globals.css:354-356` — `2 × 레일 패딩 + 메뉴 히트 폭` |
| `layout-app-shell-content-reserve` | 본문에 **남겨 두는** 최소 공간 | `globals.css:117`의 빼는 값. **레일 폭이 아니다** — 이름 함정의 전말은 [DS-D-0018](../governance/decisions/DS-D-0018-app-shell-geometry.md) |
| `layout-app-shell-content-inset` | 본문 좌우 안쪽 여백 | `globals.css:99` |
| `layout-app-shell-sidebar-padding` | 레일 좌우 패딩 | `globals.css:97` |
| `layout-app-shell-outer-gap` | 카드 바깥 여백 | 아래 「부분만 대응한다」 참조 |
| `layout-app-shell-top-bar-height` | 상단 크롬 행 높이 | 세 후보 중 이것을 고른 근거는 [App Shell Parts](../components/app-shell-parts.md) |
| `layout-app-shell-brand-mark-height` | 브랜드 마크 레일 | 같은 문서 |
| `motion-shell-collapse` | 접힘 전환 — offset과 폭이 **하나를 공유한다** | 따로 지연시키면 겹치는 프레임이 생긴다 |

### 아직 토큰이 없는 축

아래는 **제품이 LOUIS 토큰을 소비하지 않는** 축이다. 「LOUIS 쪽에 값이 없다」는 뜻이 아니다 —
`--app-gnb-main-inline-padding-end`와 `--app-gnb-rail-padding-bottom`은 LOUIS에 **이름까지 같은
토큰이 이미 있고**([tokens.css:232](../../packages/tokens/generated/tokens.css) · `234`) 값도 데스크톱 값(둘 다 `12px`)과 같다. 제품이 받지
않는 이유는 이 두 축이 ≤719px에서 각각 `16px` · `0px`로 갈라지는데 LOUIS 토큰은 단일값이라 그
관계를 담지 못하기 때문이고, 제품이 바로 그 이유를 주석으로 적어 둔다(`globals.css:91` · `107`).
「제품 잔류」 주석 자체는 여섯 곳(`globals.css:86` · `97` · `100` · `107` · `114` · `120`)이지만
반응형 분기를 이유로 드는 것은 이 둘뿐이다 — 나머지 넷은 정렬 관계 · 씬 확장점 · JS 상수 짝 ·
제품 연출 좌표라는 다른 이유다. 옮기는 쪽에서 **지어내지 말고 제품을 인용한다.**

**두 줄은 예외다 — 제품이 실제로 LOUIS에서 값을 받는다.** `--app-shell-min-width`는
`var(--louis-app-shell-min-width)`(960px)이고, 드로어가 쓰는 `--app-gnb-sidebar-padding-x`는
`var(--louis-layout-app-shell-sidebar-padding)`이다(`globals.css:124` · `103`). 그래도 표에 남는
이유는 둘이 서로 다르다. `--app-shell-min-width`는 **≤719px에 아예 적용되지 않는다** — 선언은
`:130`이고 적용은 `@media (min-width: 720px)` 안 `:386`뿐이라 compact 쪽 거동이 토큰 바깥이다.
드로어 패딩은 반응형이 아니다 — `--app-gnb-sidebar-padding-x`는 폭 조건 없이 `:root`에 선언돼
≤719px에서도 `12px` 그대로이고(그래서 표의 데스크톱 칸이 `—`인 것은 「값이 없다」가 아니라
「드로어가 ≤719px 전용 부품」이라는 뜻이다), 그 행이 남는 진짜 이유는 **LOUIS에 오프캔버스
드로어라는 부품이 없다**는 것이다.

> **이 표의 링 · 인셋 행은 그 전 배포본의 기록이다(2026-09-15 앵커 `2c6bdacf` 에서 다시 대조).** 제품이 카드를 두르는 링을
> 12 → 8 로(`094c336b` — `--app-gnb-safe-top` `max(8px, …)` · `--app-gnb-main-inline-padding-end` `8px` · `--app-gnb-rail-padding-bottom`
> `8px`), ≤719px 본문 인셋을 16 → 6 으로(`b23ac6ef`) 내렸다. DS 토큰과 갈리는 판정이 먼저라 `figma/templates.measured.json` 의 해당
> 칸은 `$pending` 으로 두었다 — [Updates](../updates/README.md) (138) 「남은 것」.

| 제품 변수 | 데스크톱 | ≤719px | 근거 |
| --- | --- | --- | --- |
| `--app-gnb-safe-top` | `max(12px, env(safe-area-inset-top, 0px))` | 동일 | `globals.css:74` |
| `--app-gnb-main-inline-padding-end` | `12px` | `16px` | `globals.css:102` · `369` — LOUIS에 동명 토큰 `app-gnb-main-inline-padding-end`(12px, [tokens.css:232](../../packages/tokens/generated/tokens.css))가 있으나 제품이 받지 않는다 |
| `--app-gnb-rail-padding-bottom` | `12px` | `0px` | `globals.css:92` · `370` — LOUIS에 동명 토큰 `app-gnb-rail-padding-bottom`(12px, [tokens.css:234](../../packages/tokens/generated/tokens.css))가 있으나 제품이 받지 않는다 |
| `--app-shell-min-width` | `960px` — **LOUIS `app-shell-min-width` 를 받는다** | 미적용 | `globals.css:124` · 적용 `386` |
| 레일 폭 (compact) | — | `0px` | `globals.css:372` |
| 드로어 폭 | — | `min(240px, 100vw - 40px)` — 제품 `bc3e6fa3`(2026-09-15 앵커 `2c6bdacf`)가 280 → 240 | `Gnb.tsx:2053-2054` |
| 드로어 좌우 패딩 | — | `--app-gnb-sidebar-padding-x` = `12px` — **LOUIS `layout-app-shell-sidebar-padding` 을 받는다** | `Gnb.tsx:2076-2077` · `globals.css:97` |
| 드로어 면 (라이트) | — | `--palette-gray-200` (앱 셸 재매핑 후 `#eeeef1`) | `Gnb.tsx:2087` |
| 드로어 면 (다크) | — | `--app-page-bg` | `Gnb.tsx:2088` |
| 드로어 전환 | — | `transform 320ms cubic-bezier(0.4, 0, 0.2, 1)` | `Gnb.tsx:2080` |

| 드로어 스크림 면 | — | `rgba(0, 0, 0, 0.4)` — 테마 불변 | `Gnb.tsx:1920` |
| 드로어 스크림 등장 | — | `mobileMenuFadeIn 200ms ease forwards` (opacity 0 → 1), `motion-reduce`는 `animation: none` | `Gnb.tsx:1922-1923` · `keyframes.css:893-901` |
| 드로어 패널 두 끝 | — | 닫힘 `translateX(-100%)` → 열림 `translateX(0)`, 열린 상태 `box-shadow: none` | `Gnb.tsx:2079` · `2075-2076` |
| 셸 높이 (뷰포트) | `var(--app-shell-vh, 100dvh)` — 토큰이 아니라 런타임 주입 | 동일 | `AppHomeScene.tsx:267` · 소비 `appHomeSceneStyles.ts:831-832` · `AdminClient.tsx:55` |
| `--mainchrome-bleed-left` / `-right` | 선언하는 요소가 **자기 좌우 패딩과 같은 값**으로 정한다 — 형태 B `<main>`은 `16px` / `12px`, 결제 결과 카드는 `24px` / `24px` | 형태 B `<main>`은 `16px` / `16px`, 결제 결과 카드는 `0px` / `0px` | `myPageSceneStyles.ts:58-59` → `64-65` · `billing-success/page.tsx:60` → `57`·`58` |
| Create 노드 뷰 헤더 상하 인셋 | `8px` — `py-4` 리터럴, safe-area 참조 없음 | 동일 | `CreateScene.tsx:146-147` |
| Create 노드 뷰 헤더 좌우 인셋 | `12px` — `px-6` 리터럴 | 동일 | `CreateScene.tsx:146-147` |

**`outer-gap`은 부분만 대응한다.** 제품에는 12px 관계가 셋(상·우·하) 있고 셋이 서로 다른 변수를
갖는다. compact에서 상단만 유지되고 우측은 16으로, 하단은 0으로 갈라지므로 **하나의 토큰으로
셋을 덮을 수 없다.** DS-D-0018이 이 토큰을 「부분」으로 판정한 이유다.

**≤719px에서 바깥 여백은 토큰 값과 무관하게 0이다(2026-08-21 실측).** 위 표의 `12px → 16px` ·
`12px → 0px`는 **토큰 값**이고, 그 값을 읽던 **씬 루트가 compact에서 상·우·하 padding을 하드 `0`으로
덮는다.** 좌 padding은 데스크톱에서도 `0`이다.

| 씬 루트 | 데스크톱 | ≤719px | 근거 |
| --- | --- | --- | --- |
| 형태 A — AppHome | 상 `--app-gnb-safe-top` · 좌 `0` · 우 `--app-gnb-main-inline-padding-end` · 하 `--app-gnb-rail-padding-bottom` | 상·우·하 **모두 `0`** | `appHomeSceneStyles.ts:846-849` → `857-859` |
| 형태 A — Admin | 동일 | 상·우·하 **모두 `0`** | `AdminClient.tsx:57-58` → `45-47` |
| 형태 A — NodeCanvasHome | 동일 | 상·우·하 **모두 `0`** | `NodeCanvasHomeScene.tsx:97-98` → `103` |
| 형태 A — 분석 2씬 | 동일 | 상·우·하 **모두 `0`** | `InstagramAnalyticsScene.tsx:277-278` → `284-286` · `YoutubeAnalyticsScene.tsx:743-744` → `750-752` |
| 형태 B — 페이지 루트 | 상 `--app-gnb-safe-top` · 하 `--app-gnb-rail-padding-bottom`, 좌우 padding 없음 (패널이 `margin`으로 벌린다) | 상·하 `0`, 패널 `margin-right: 0` | `myPageSceneStyles.ts:495-496` → `524-525` · `74` → `90` |

**그래서 compact의 16px은 카드 바깥이 아니라 카드 안쪽으로 간다.** compact에서
`--app-gnb-main-inline-padding-end`를 읽는 자리는 전부 카드 안쪽이다 — 카드와 `<main>`의 안쪽
패딩(`appHomeSceneStyles.ts:766` · `myPageSceneStyles.ts:66` · `NodeCanvasHomeScene.tsx:129` ·
`AdminClient.tsx:98`), 카드 안 본문 컬럼(`InstagramAnalyticsScene.tsx:320`), 패널 안 상단
바(`Gnb.tsx:477`)다. **모바일 시안에 카드 바깥 여백을 그리면 틀린다 — 카드가 화면 폭 전체다.**

**드로어의 면은 페이지 배경이 아니다(2026-08-21 실측).** compact에서 드로어는 먼저
`--app-page-bg`를 깔지만 곧바로 테마별 규칙이 덮는데, **라이트만 `--palette-gray-200`으로
갈라진다.** 앱 셸 라이트에서 `--app-page-bg`는 `--palette-gray-100`(`#f8f8f9`)이고 드로어는
`#eeeef1`이므로 **페이지 배경색으로 드로어를 그리면 한 단계 밝게 나온다.** 다크는 둘이 같다.

**드로어 스크림은 dialog scrim과 다른 값이다.** 드로어 스크림은 `rgba(0, 0, 0, 0.4)`로 테마와
무관하게 고정이고, [Dialog](../components/dialog.md)의 `color-dim-modal`(라이트 56% · 다크 72%)과
갈린다. **56%/72%로 대신 그리면 뒤 화면이 한 단계 어둡게 나온다.** 적층도 DS 사다리 밖이다 —
드로어 `z-index: 1400` · 스크림 `1399`(`Gnb.tsx:2073` · `1904`)로 프로필 popover(1100)보다 위이며,
그 이탈은 [App Shell Parts](../components/app-shell-parts.md)의 Known deviations가 기록한다.

**셸 높이는 토큰이 아니라 런타임 주입이다.** `--app-shell-vh`는 CSS 어디에도 정의가 없다.
`AppHomeScene`이 마운트될 때 `Math.round(visualViewport.height ?? innerHeight)`를 px로
`documentElement`에 쓰고 언마운트에서 지운다 — `resize`와 `visualViewport.resize` 두 이벤트로
갱신한다(`AppHomeScene.tsx:263-277`, 주입 `241` · 정리 `249`). 존재 이유는 iOS Safari 등에서
`100dvh`가 실제 가시 높이와 어긋나 고정 높이 셸 아래에 흰 여백이 생기는 것을 막는 것이다. CSS는
언제나 `var(--app-shell-vh, 100dvh)`로 읽으므로 **JS 미실행·하이드레이션 전에는 `100dvh`가 남는다.**
**모바일 프레임 높이를 `100dvh` 상수로 굳히면 제품과 어긋나고, 그 어긋남을 잡아 주는 장치가 없다** —
프레임은 브라우저 크롬을 뺀 실제 가시 높이로 잡고 `100dvh`는 폴백으로만 적는다.

**bleed 두 개는 패널 안 상단 크롬을 카드 패딩 밖으로 되돌린다.** 크롬 바는
`width: calc(100% + 좌 + 우)`와 좌우 `calc(-1 * 같은 값)` margin으로 감싼 요소의 좌우 패딩을 정확히
상쇄해 **카드 전체 폭으로 번진다**(`Gnb.tsx:464-466`). 그래서 값은 언제나 **감싼 요소의 좌우 패딩과
같게** 선언된다 — 형태 B의 `<main>`은 `16px`/`12px`(`myPageSceneStyles.ts:58-59`, 그 패딩 `60`),
결제 결과 카드는 `24px`/`24px`(`billing-success/page.tsx:60`, 그 패딩 `63`)이다. ≤719px에서 형태 B는
`16px`/`16px`로 함께 바뀌고(`myPageSceneStyles.ts:64-65`, 그 패딩 `66`), 결제 결과 카드는 둘 다 `0`이
되어 크롬 바가 본문과 같은 폭이 된다(`billing-success/page.tsx:61`·`58`). **선언하지 않음이 「번짐
없음」이 아니다** — 세 선언의 폴백이 모두 `--app-gnb-main-inline-padding`(16px)이라, 선언을 빼면
우측도 12px(`-end`)이 아니라 16px로 번진다.

**Create 노드 뷰 상단 헤더는 이 인셋 규약 밖이다.** 이 헤더는 `fixed top-0 left-0 right-0`에
`py-4 px-6` 리터럴을 쓰고 `env(safe-area-inset-*)`도 `--app-gnb-main-inline-padding-end`도 참조하지
않는다(`CreateScene.tsx:146-147`, 소비 `673`). `--spacing`이 `2px`이므로 상하 **8px** · 좌우
**12px**이고, 이 헤더에는 719px 분기가 없어 compact에서도 12px 그대로다. **위 표의
`--app-gnb-safe-top`을 따라 상하 12px + safe-area로 그리면 실제 8px과 어긋난다.** 좌우 12px은 우연이
아니다 — 배포본 주석이 「좌우 12px 은 레이어 패널·툴바·줌과 같은 시작선, 상하는 8px」이라고 직접
적는다(`CreateScene.tsx:145`).

### 메인 카드 표면 — 값은 있고 계약이 없다

카드 표면 자체는 이 패턴이 아니라 제품의 레이어 밖 전역 클래스(`appMainCardChrome` /
`appMainCardChromeSurface`)가 소유하며, **아직 DS 계약이 없다.** 다만 「계약이 없다」가
「값을 모른다」는 뜻은 아니어서, Figma로 옮길 때 지어내지 않도록 실측값을 적어 둔다
(2026-08-21 실측 · 좌표는 `74a7303b` 기준, `globals.css@74a7303b:1316-1397`).

| 축 | 값 | 근거 |
| --- | --- | --- |
| 반경 | `16px` | `globals.css:1334` · `1340` |
| 프레임 | `var(--louis-hairline-inset)` — **0.5px 헤어라인 한 겹, 안쪽(`inset`)**. 글래스 5겹도 `--dropdown-frame`도 폐지됐다 | `globals.css:1430` · `1341` |
| 면 (라이트) | `--palette-gray-100` | `globals.css:1338-1340` · `1345-1347` |
| 면 (다크) | `--palette-gray-800` | `globals.css:1342-1344` · `1349-1351` |
| 스크롤 헤더 슬롯 | `position: sticky; top: 0; z-index: 5` — 하단 페이드(10)보다 **아래**다 | `appHomeSceneStyles.ts:743-751`(sticky·top·z-index는 `751-753`) · `InstagramAnalyticsScene.tsx:336` |
| 하단 페이드 | `::before` `z-index: 10` — `linear-gradient(to top, 면색 100% 0%, 56% 50%, 20% 80%, 0% 100%) bottom / 100% 20px no-repeat` | `globals.css:1362-1369`(공통) · `1362-1371`(라이트) · `1373-1382`(다크) |
| 클리핑 | `overflow: hidden` | `globals.css:1333` · `1339` |

**베벨 링(`::after`)은 제품에서 제거됐다.** 이전 판은 이 카드가 프레임 5겹 + 베벨 링 4겹 = 9겹을
갖는다고 적었다. 지금은 **프레임 한 겹뿐**이고, 남은 `::after` 선언은 `≤719px`에서 그 층을
`display: none` 시키던 블록 하나다. 카드 안쪽은 3층이 아니라 **2층이다 — 헤더 슬롯(5) < 하단 페이드(10).**

페이드는 카드가 만든 stacking context 안에 있고 `pointer-events: none` · `border-radius: inherit`을 받는다.

#### 프레임 해결값 — `--louis-hairline-inset`

**제품 토큰 `--dropdown-frame`은 폐지됐다.** 카드는 이제 LOUIS 정본을 직접 소비한다 —
`box-shadow: var(--louis-hairline-inset)`. 제품 저장소 전체에 `--dropdown-frame` **선언**은
0건이다. 다만 이름 자체는 아직 남아 있으니 검색으로 「살아 있다」고 오판하지 않는다 —
`check-tailwind-theme.mjs:194`는 폐지를 적은 **주석**이고, `:239`는 `--dropdown-frame-on-dark`
라는 **다른 토큰**의 금지 패턴이며, `docs/handoff-2026-08-24-louis-hairline-inset.md:52` ·
`66` · `191` · `347`은 폐지 전 상태를 적은 인수인계 문서다. 게이트가 실제로 고정하는 문자열은
`check-tailwind-theme.mjs:199`의 `"box-shadow: var(--louis-hairline-inset);"`이고, 그것은
폐지 확인이 아니라 **LOUIS recipe 소비를 고정**하는 계약이다.

| # | 종류 | inset | x | y | blur | spread | 색 |
| ---: | --- | --- | ---: | ---: | ---: | ---: | --- |
| 1 | 안쪽 헤어라인 | `inset` | `0` | `0` | `0` | `--louis-border-width-hairline` = `0.5px` | `--louis-color-stroke-hairline` |

**테마로 뒤집힌다.** 이전 판은 「라이트에서도 바이트 동일 — 테마 무관」이라고 적었는데, 그것은
`--dropdown-frame` 시절의 성질이다. `--louis-color-stroke-hairline`은 라이트
`color(srgb 0 0 0 / 0.08)`(검정 8%) · 다크 `color(srgb 1 1 1 / 0.08)`(흰 8%)로 **갈린다.**
알파도 옛 12%가 아니라 **8%**다. blur가 `0`이라 드롭섀도우가 아니라 **선**인 것은 그대로다.

**Figma에서는 한 노드에 한 겹으로 그린다** — 카드 노드에 **inner shadow** 0.5px 하나. 바깥
드롭섀도우가 아니다. 오버레이 노드도, 안쪽 베벨도 없다. `elevation-*` 9종 중 일치하는 것은
여전히 **없다** — 이 프레임은 elevation 축이 아니라 `hairline` 축이고, 정의는
[`base.css:21-22`](../../packages/css/src/base.css)에 있다.

**≤719px에서는 프레임과 베벨 링이 통째로 사라진다.** `border-radius: 0` · `box-shadow: none` ·
`overflow: visible`이 되고 `::before`/`::after`가 `display: none`이다(`globals.css:1433-1446`). 형태 B의
`::before`는 전역이 아니라 씬이 끈다(`myPageSceneStyles.ts:94`). **모바일 시안에 카드 프레임을 그리면
틀린다.**

#### 하단 페이드의 출처가 형태마다 다르다

형태 A는 전역 `.appMainCardChrome::before`(`globals.css:1362-1391`)가 준다. 형태 B에는 **그 전역
`::before`가 없고** 씬이 자기 `::before`에 상단·하단 두 배경 레이어를 함께 선언한다 —
`myPageSceneStyles.ts:88`(라이트) · `89`(다크). **출처만이 아니라 값도 갈라져 있다** — 하단
페이드의 가운데 두 스톱이 형태 A는 `56% 50%` · `20% 80%`(`globals.css:1375-1376` 라이트 ·
`1377-1378` 다크)인데 형태 B는 아직 `53% 50%` · `19% 80%`다. **형태 B를 「전역 클래스만 붙이면
된다」로 읽으면 페이드가 통째로 빠지고, 형태 B를 전역 값으로 그리면 스톱이 어긋난다.**

#### 형태 B 전용 상단 페이드 — 값은 적되 켜진 상태로 그리지 않는다

배포본에서 이 페이드가 켜지는 화면은 0개다. 원인은 [제품 확인 사항](../governance/product-confirmations.md)
§7과 [App Shell Parts](../components/app-shell-parts.md)가 기록한다. 값을 남기는 이유는 제품이 고쳤을
때 지어내지 않기 위해서다.

| 축 | 값 |
| --- | --- |
| 방향 | `linear-gradient(to bottom, …)` |
| 스톱 (면색 알파@위치) | `100%@0%` · `98%@30%` · `92%@50%` · `78%@64%` · `55%@76%` · `28%@87%` · `8%@95%` · `0%@100%` |
| 잉크 | 라이트 `--palette-gray-100-rgb` / 다크 `--palette-gray-800-rgb` — 하단 페이드와 같은 면색 |
| 배치·크기 | `top / 100% calc(72px * min(1, var(--header-progress, 0) * 1000)) no-repeat` |
| 실효 높이 | **`0px`** — `--header-progress`가 패널까지 올라오지 않아 언제나 폴백 `0` |

**`min(1, x * 1000)`은 페이드가 아니라 스위치다** — progress가 0을 조금이라도 넘으면 즉시 72px 전체가
켜진다. 제품이 고쳐 켜지는 날이 오면 높이는 상수 `72px`이다.

## 미결정 — 셸 형태 A / B

**제품에 카드를 거는 방식이 둘이고, 어느 쪽이 정본인지 정해지지 않았다.** 이 문서는 그 사실을
기록만 하며 한쪽을 고르지 않는다. 두 계열은 실제로 공존하고 소비처 수도 비슷하다 —
**한쪽만 그리면 나머지 절반이 시스템 밖이 된다.**

| | 형태 A | 형태 B |
| --- | --- | --- |
| 크롬 클래스 | `appMainCardChrome` | `appMainCardChromeSurface` |
| 정의 | `appHomeSceneStyles.ts:755` (`mainWithAppSidebar`) | `myPageSceneStyles.ts:69` (`contentWithAppSidebarPanel`) |
| 카드가 걸리는 요소 | `<main>` 자신 | `<main>` 바깥의 패널 div |
| 사이드바 자리를 비우는 요소 | 씬 루트 (`appHomeSceneStyles.ts:843`) | 패널 div 자신 |
| 접힘 전환 대상 | `margin-left` **와** `width` (`appHomeSceneStyles.ts:850`) | `margin-left` **만** (`myPageSceneStyles.ts:76`) |
| 카드 자체의 margin | 네 방향 0 | 좌·우만 값이 있고 상·하 0 |
| `<main>` 안쪽 패딩 (≥720px) | `0 16px` | `0 12px 20px 16px` |
| `<main>` 안쪽 패딩 (≤719px) | `0 16px` | `0 16px` |
| 스크롤 루트 | `<main>` 바깥의 뷰포트 div | `<main>` 자신 |

| `<main>` 안쪽 패딩 — 분석 2씬 예외 | `0` — 카드는 패딩 0이고 인셋을 자식이 갖는다 (`InstagramAnalyticsScene.tsx:299` · `YoutubeAnalyticsScene.tsx:773`, 본문 컬럼 좌우 `--app-gnb-main-inline-padding`은 `InstagramAnalyticsScene.tsx:319`·`320` · `YoutubeAnalyticsScene.tsx:806`·`807`) | 해당 없음 |
| `<main>` 하단 패딩 (≤780px) | 카드에는 **없다** — `0`. 옛 모듈 CSS의 `160px`은 카드가 **아닌** `<main>`에만 남았다 (`appHomeSceneStyles.ts:739`는 `:not(.tw-ah-067)` 조건, `NodeCanvasHomeScene.tsx:114`는 `MAIN_EMBEDDED`). 카드 쪽 선언은 `NodeCanvasHomeScene.tsx:128` · `AdminClient.tsx:97`의 `pb-0` | 해당 없음 |

**형태 B의 아래쪽 20px은 `pb-10`이다.** 제품이 Tailwind의 `--spacing`을 `2px`로 재정의했기
때문에(`tailwind.css:153`) `pb-10` = 20px이지 40px이 아니다. **Tailwind 기본값(4px 격자)으로
환산하면 두 배로 나온다.** 실측값: `--app-gnb-main-inline-padding` 16px ·
`--app-gnb-main-inline-padding-end` 12px(≤719px는 16px) — `globals.css:99`·`108`·`368`·`369`.

**≤780px의 160px은 카드로 옮겨오지 않았다.** 옛 모듈 CSS에서는 `.main`의
`padding-bottom: 160px`이 `.mainWithAppSidebar`의 padding 단축보다 소스 뒤에 있어 이겼고, 그래서
모바일 카드 하단이 0이 아니라 160px이었다. **배포본은 그 승자를 옮기지 않았다** — 이미 제거된
플로팅 CTA 자리의 잔재이고 스크롤 루트 **바깥**이라 스크롤해도 사라지지 않는 죽은 여백이 되기
때문이며, 배포본이 그 판단을 주석에 직접 적는다(`NodeCanvasHomeScene.tsx:120-124` ·
`AdminClient.tsx:87-90`). 남은 160px은 카드가 아닌 `<main>` 쪽뿐이다 —
`appHomeSceneStyles.ts:739`는 `:not(.tw-ah-067)`(= `mainWithAppSidebar`가 아닐 때)로 걸러지고,
`NodeCanvasHomeScene.tsx:114`는 랜딩 데모 임베드용 `MAIN_EMBEDDED`다. **모바일 시안에 카드 하단
160px을 그리면 틀린다** — 형태 A 카드의 ≤780px 하단 패딩은 `0`이다.

전환 곡선은 양쪽 모두 `320ms cubic-bezier(0.4, 0, 0.2, 1)`로 같다 — 위 표의
`motion-shell-collapse`와 일치한다. **갈리는 것은 곡선이 아니라 무엇이 움직이는가다.**

소비처는 이렇다(제품 정본 기준 — 커밋은 `migration/product-evidence.lock.json` 의 `productCommit`).

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
| scroll root | `.louis-app-shell__content` 하나. 셸은 `overflow: hidden` |
| 상단 크롬 | scroll root **안에** sticky. 본문과 같은 좌우 inset 원천을 읽는다 |
| compact | 예약 0 · 레일이 drawer · scrim · 뒤 콘텐츠 `inert` |
| 건너뛰기 링크 | anatomy의 첫 항목. 초점을 받으면 나타난다 |

**접힘 상태는 소비처가 소유한다.** 라우트가 정하는 경우가 있어 셸이 갖지 않는다.

## Pre-implementation blockers

- ~~P2 local RC에 App Shell geometry token은 있다. 이를 소비하는 공용 App Shell composition과 실제 제품
  integration은 아직 없다.~~ composition은 섰다(2026-08-18). **제품 integration은 여전히 없다.**
- drawer의 `inert` 테스트는 섰다. **focus trap 자체와 scroll lock은 아직 없다** — 뒤를 죽이는 것과 초점을 가두는 것은 다른 일이다.
- safe-area와 viewport-height 전략이 package로 정의되지 않았다.

  제품의 현행 해는 「아직 토큰이 없는 축」 표의 `--app-shell-vh` 런타임 주입이다. package 계약이
  서면 그것을 흡수하거나 대체한다.
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
