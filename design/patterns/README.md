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
| [Loading](loading.md) | `beta` | `not-ready` | `partial` | `done` | **새 CSS가 없다** — 컴포넌트가 아니라 경계다. 부품은 Spinner와 Skeleton이 소유하고 이 패턴은 무엇을 언제 쓰는가와 **누가 로딩을 알리는가**를 정한다: 영역이 aria-busy를 갖고 자리표시는 전부 aria-hidden이다(여덟 개가 각각 읽히면 같은 말이 여덟 번 들린다). 실브라우저 5건이 그 합성을 대조한다. determinate progress는 접근성 계약이 선행이라 아직 두 갈래만 소유한다 |
| [App Shell](app-shell.md) | `experimental` | `not-ready` | `partial` | `done` | 공용 composition `AppShell`이 섰다(2026-08-18). 레일과 본문이 **같은 상태 원천**으로 자리를 예약해 어떤 접힘 상태에서도 겹치지 않고, primary scroll root가 하나이며 상단 크롬이 그 안에 sticky로 있다. page·workspace variant를 한 composition에 둔다. 실브라우저 acceptance test 8건. Figma 표현과 제품 소비 증거는 없다. compact drawer의 focus trap은 inert로 뒤를 죽이는 데까지이며 trap 자체는 아직 없다 |
| [Landing Shell](landing-shell.md) | `experimental` | `not-ready` | `not-ready` | `done` | 로그인 전 마케팅 화면의 껍데기. **App Shell과 정반대 모델이다** — 레일이 자리를 예약하지 않고 헤더가 콘텐츠 위에 뜬다. 가독성은 헤더가 아니라 **120px 고정 blur plate**가 만든다. 톤 반전은 다섯 부품이 한 덩어리로 뒤집히고 판정은 뷰포트 상단 3~4% 띠만 본다. 값은 전부 제품 인용이며 DS 계약이 아니다 — 음수 오버레이 관용구 · blur 축 · 톤 반전을 mode로 볼지 세 blocker가 열려 있다 |
| [Auth Two Panel](auth-two-panel.md) | `experimental` | `not-ready` | `not-ready` | `done` | 인증 화면 8개가 쓰는 2열 셸. **경로가 둘이다** — 5개는 공용 `AuthStatusCard`를 쓰고 3개는 같은 셸을 자기 파일에 복제한다. 전환점은 720px 하나이고 좁은 폭에서 폼 패널이 `display: contents`로 사라져 카드가 페이지 그리드의 정렬을 직접 받는다. 브랜드 면은 `#0093ff` 리터럴이라 테마 분기가 없다 |
| [Status Result](status-result.md) | `experimental` | `not-ready` | `not-ready` | `done` | 결제·구독 결과 7화면의 콘텐츠 컬럼. **셸이 아니라 App Shell 카드 안이다.** 세로 리듬이 24px 하나뿐이고 처리 중에는 위에서 밀지 않고 카드 안 세로 중앙에 온다. 액션 버튼이 전폭이라 세로로 쌓인다. 900px 분기는 셸 경계가 아니라 이 화면 계열 전용이며 승인 여부가 blocker다 |
| [Project Grid](project-grid.md) | `experimental` | `not-ready` | `partial` | `done` | — |
| [Editor Workspace](editor-workspace.md) | `experimental` | `not-ready` | `not-ready` | `done` | — |
<!-- GENERATED:pattern-progress END -->
<!-- prettier-ignore-end -->

상태 vocabulary는 [Components Progress Board](../components/README.md)와 같다. `web: partial`은
공용 구현 일부가 있다는 뜻이며 ownership·반응형·접근성 acceptance가 모두 통과했다는 뜻이 아니다.

Patterns는 소비 제품의 화면별 관측값보다 우선하는 신규 작업 규범이다. 제품 통합이 Pattern과 다르면
제품 이슈로 기록하고, 새 공용 구현은 Pattern을 따른다.
