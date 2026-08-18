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
| [Loading](loading.md) | `beta` | `not-ready` | `not-ready` | `done` | — |
| [App Shell](app-shell.md) | `experimental` | `not-ready` | `not-ready` | `done` | — |
| [Project Grid](project-grid.md) | `experimental` | `not-ready` | `partial` | `done` | — |
| [Editor Workspace](editor-workspace.md) | `experimental` | `not-ready` | `not-ready` | `done` | — |
<!-- GENERATED:pattern-progress END -->
<!-- prettier-ignore-end -->

상태 vocabulary는 [Components Progress Board](../components/README.md)와 같다. `web: partial`은
공용 구현 일부가 있다는 뜻이며 ownership·반응형·접근성 acceptance가 모두 통과했다는 뜻이 아니다.

Patterns는 소비 제품의 화면별 관측값보다 우선하는 신규 작업 규범이다. 제품 통합이 Pattern과 다르면
제품 이슈로 기록하고, 새 공용 구현은 Pattern을 따른다.
