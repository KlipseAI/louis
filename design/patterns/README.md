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
| [Project Grid](project-grid.md) | `experimental` | `not-ready` | `partial` | `done` | — |
| [Editor Workspace](editor-workspace.md) | `experimental` | `not-ready` | `not-ready` | `done` | — |
<!-- GENERATED:pattern-progress END -->
<!-- prettier-ignore-end -->

상태 vocabulary는 [Components Progress Board](../components/README.md)와 같다. `web: partial`은
공용 구현 일부가 있다는 뜻이며 ownership·반응형·접근성 acceptance가 모두 통과했다는 뜻이 아니다.

Patterns는 소비 제품의 화면별 관측값보다 우선하는 신규 작업 규범이다. 제품 통합이 Pattern과 다르면
제품 이슈로 기록하고, 새 공용 구현은 Pattern을 따른다.
