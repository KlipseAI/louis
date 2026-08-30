---
id: patterns-overview
status: beta
authority: normative
---

# Patterns

컴포넌트를 조합해 반복되는 제품 문제를 푸는 규범이다. 특정 페이지의 현재 DOM을 복사하는 대신 상황에
따른 선택 기준과 전체 상태 흐름을 정의한다.

## Progress Board

<!-- prettier-ignore-start -->
<!-- GENERATED:pattern-progress START -->
| Pattern | Maturity | Figma | Web | Docs | Note |
| --- | --- | --- | --- | --- | --- |
| [Loading](loading.md) | `beta` | `partial` | `partial` | `done` | **새 CSS가 없다** — 컴포넌트가 아니라 경계다. 부품은 Spinner와 Skeleton이 소유하고 이 패턴은 무엇을 언제 쓰는가와 **누가 로딩을 알리는가**를 정한다: 영역이 aria-busy를 갖고 자리표시는 전부 aria-hidden이다(여덟 개가 각각 읽히면 같은 말이 여덟 번 들린다). 실브라우저 5건이 그 합성을 대조한다. determinate progress는 접근성 계약이 선행이라 아직 두 갈래만 소유한다 Figma 에 `DS · Templates` 의 `Pattern · Loading`(996:411)로 섰다(2026-08-30). **선택 기준 여섯을 나란히** 그렸다 — 상황이 표현을 정한다는 것이 이 패턴의 내용이기 때문이다: InlineLoadingLabel · Spinner+문구 · Skeleton · Determinate progress · 지속 상태(indeterminate + 문구) · 생성 중 셸(아이콘 64 · `color/node-image-icon` 바인딩). 여섯 다 기존 컴포넌트 인스턴스다. **문서가 경고한 「네 keyframe 이름을 네 흐름으로 보고 각각 만들면 틀린다」는 지켰다** — 흐름은 하나이고 여기서 나눈 것은 흐름이 아니라 상황이다. **아직 없는 것**: 스윕·호흡 모션 자체(Figma 가 표현하지 못한다. Skeleton 과 같은 한계) 와 시머 텍스트 레시피(`background-clip: text`). 그래서 `partial` 이다. |
| [App Shell](app-shell.md) | `experimental` | `partial` | `partial` | `done` | 공용 composition `AppShell`이 섰다(2026-08-18). 레일과 본문이 **같은 상태 원천**으로 자리를 예약해 어떤 접힘 상태에서도 겹치지 않고, primary scroll root가 하나이며 상단 크롬이 그 안에 sticky로 있다. page·workspace variant를 한 composition에 둔다. 실브라우저 acceptance test 8건. Figma 에 `DS · Templates` 페이지의 `Pattern · AppShell`(982:175)로 **섰다**(2026-08-30) — 확장(레일 280)·접힘(56) 두 상태이고 레일·상단 크롬·본문의 자리와 여백(outer-gap 12 · sidebar-padding 12 · content-inset 16)을 부품 인스턴스로 조립한다. **아직 없는 것**: workspace variant · compact drawer(모바일) · global overlay root · skip link. 그래서 `partial` 이다. 제품 소비 증거는 여전히 없다. compact drawer의 focus trap은 inert로 뒤를 죽이는 데까지이며 trap 자체는 아직 없다 |
| [Landing Shell](landing-shell.md) | `experimental` | `not-ready` | `not-ready` | `done` | 로그인 전 마케팅 화면의 껍데기. **App Shell과 정반대 모델이다** — 레일이 자리를 예약하지 않고 헤더가 콘텐츠 위에 뜬다. 가독성은 헤더가 아니라 **120px 고정 blur plate**가 만든다. 톤 반전은 다섯 부품이 한 덩어리로 뒤집히고 판정은 뷰포트 상단 3~4% 띠만 본다. 값은 전부 제품 인용이며 DS 계약이 아니다 — 음수 오버레이 관용구 · blur 축 · 톤 반전을 mode로 볼지 세 blocker가 열려 있다. StaticHighlightDemo의 고정 빌드 실측 입력은 준비됐지만 Figma 조립·되읽기 대조가 끝나지 않아 `figma: not-ready`를 유지한다 |
| [Auth Two Panel](auth-two-panel.md) | `experimental` | `partial` | `not-ready` | `done` | 인증 화면 8개가 쓰는 2열 셸. **경로가 둘이다** — 5개는 공용 `AuthStatusCard`를 쓰고 3개는 같은 셸을 자기 파일에 복제한다. 전환점은 720px 하나이고 좁은 폭에서 폼 패널이 `display: contents`로 사라져 카드가 페이지 그리드의 정렬을 직접 받는다. 브랜드 면은 `#0093ff` 리터럴이라 테마 분기가 없다 Figma 에 `DS · Templates` 의 `Pattern · AuthTwoPanel`(997:1220)로 섰다(2026-08-30). 문서가 요구한 대로 **하나로 그렸다** — 제품에는 공용 `AuthStatusCard` 를 쓰는 5벌과 같은 셸을 자기 파일에 복제한 3벌이 있는데, 그 복제는 그림이 아니라 알려진 부채다. 두 벌은 화면 폭이다: ≥720 2열(brand + form) · ≤719 1열(brand 는 그려지지 않고 로고 링크가 대신 선다). **브랜드 면은 `#0093ff` 리터럴로 칠했다** — 문서가 「시맨틱 토큰이 아니라 리터럴이고 라이트/다크 어느 쪽에서도 같은 파랑」이라고 적으므로 변수에 묶으면 그림이 거짓말을 한다. 카드 세로 간격이 8 → 28 로 세 배 반이 되는 것도 두 벌의 대비로 드러난다. `6svh`·`18ch` 는 px 토큰으로 승격되지 않으므로 대표값(54 · 280)으로 그렸다. **아직 없는 것**: 배경 SVG(`footer-logo-bg.svg`, `100% 100%` 로 늘어나는 것이 의도된 동작) 와 ≥1200 에서 슬로건이 heading-48 로 승급하는 변형. 그래서 `partial` 이다. |
| [Status Result](status-result.md) | `experimental` | `partial` | `not-ready` | `done` | 결제·구독 결과 7화면의 콘텐츠 컬럼. **셸이 아니라 App Shell 카드 안이다.** 세로 리듬이 24px 하나뿐이고 처리 중에는 위에서 밀지 않고 카드 안 세로 중앙에 온다. 액션 버튼이 전폭이라 세로로 쌓인다. 900px 분기는 셸 경계가 아니라 이 화면 계열 전용이며 승인 여부가 blocker다 Figma 에 `DS · Templates` 의 `Pattern · StatusResult`(993:379)로 섰다(2026-08-30). Success·Failure 두 벌이고 **세로 간격이 24 하나뿐**인 것이 계약이라 컬럼 전체를 그 리듬으로만 세웠다. 폭 520(=min(520,100%)) · Alert 는 실패 화면에만 · 액션은 전폭 버튼 세로 쌓기 · Meta list 는 dt/dd 행이다. **아직 없는 것**: 900px 에서 meta 가 세로로 접히는 변형. 그래서 `partial` 이다. |
| [Route Boundary](route-boundary.md) | `experimental` | `partial` | `not-ready` | `done` | 404 · 오류 · 최후 경계 셋. **셋 중 하나는 디자인 시스템을 쓸 수 없다** — 최후 경계는 루트 레이아웃이 실패한 뒤라 토큰도 i18n도 전역 CSS도 없고, 토큰을 참조하도록 「고치면」 그 화면이 막으려던 실패에 함께 휩쓸린다. 앞의 둘은 같은 뼈대를 공용 컴포넌트가 아니라 복제로 쓴다. 값은 전부 제품 인용이며 DS 계약이 아니다 Figma 에 `DS · Templates` 의 `Pattern · RouteBoundary`(993:431)로 섰다(2026-08-30). 세 갈래를 그대로 그렸다 — 404 · 오류는 토큰과 공용 Button 을 쓰고, **최후 경계는 토큰을 쓰지 않는다**. 문서가 「루트 레이아웃이 실패한 뒤라 전역 CSS 도 i18n 도 로드되지 않았다」고 적으므로 그 프레임만 리터럴(#0a0a0a · #ededed · #a1a1a1 · 폭 420)로 그렸다 — 토큰으로 그렸다면 그림이 거짓말을 한다. **아직 없는 것**: ≤719px 좌우 패딩 16 변형. 그래서 `partial` 이다. |
| [Project Grid](project-grid.md) | `experimental` | `partial` | `partial` | `done` | Figma 에 `DS · Templates` 의 `Pattern · ProjectGrid`(991:252)로 섰다(2026-08-30). **열 수를 viewport 표로 그리지 않았다** — 레시피가 `auto-fill minmax(240px, 1fr)` 이라 열 수는 container 폭에서 유도된다(`floor((W + 4) / 244)`). 문서 자신도 viewport 표는 호환 프로파일이고 container 가 좁으면 줄 수 있다고 적는다. 그래서 container 600·850·1116·1300 → 2·3·4·5열로 그렸고, 1116/4열은 `Template · AppHome` 의 격자와 같은 값이다. 상태 셋(Loading=Skeleton block · Error=Alert danger · Empty=EmptyState)도 함께 그렸다. **아직 없는 것**: section header(label·count·action)와 pagination/load-more sentinel. 그래서 `partial` 이다. |
| [Editor Workspace](editor-workspace.md) | `experimental` | `not-ready` | `not-ready` | `done` | — |
<!-- GENERATED:pattern-progress END -->
<!-- prettier-ignore-end -->

상태 vocabulary는 [Components Progress Board](../components/README.md)와 같다. `web: partial`은
공용 구현 일부가 있다는 뜻이며 ownership·반응형·접근성 acceptance가 모두 통과했다는 뜻이 아니다.

Patterns는 소비 제품의 화면별 관측값보다 우선하는 신규 작업 규범이다. 제품 통합이 Pattern과 다르면
제품 이슈로 기록하고, 새 공용 구현은 Pattern을 따른다.
