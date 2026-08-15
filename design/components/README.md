---
id: components-overview
status: beta
authority: normative
---

# Components

Klipse 화면을 이루는 재사용 가능한 UI 단위다. 컴포넌트가 코드나 Figma 한쪽에만 존재한다고 해서
완성된 것으로 보지 않는다.

## Progress Board

<!-- prettier-ignore-start -->
<!-- GENERATED:component-progress START -->
| Component | Maturity | Figma | Web | Docs | Note |
| --- | --- | --- | --- | --- | --- |
| [Button](button.md) | `experimental` | `partial` | `partial` | `done` | public export와 실브라우저 acceptance test. Figma component set 40 variant에 아이콘 슬롯과 기하 계약이 붙었다 — figma/components.measured.json이 정본이고 코드·Figma 양방향을 게이트가 잰다. color-action-danger* 부재로 danger가 tonal이고 hover 면 변화가 없다 |
| [Icon Button](icon-button.md) | `experimental` | `not-ready` | `partial` | `done` | public export와 실브라우저 acceptance test 10건. Button을 아이콘 전용으로 렌더하면 정사각이 아니라는 실측이 별도 컴포넌트의 근거이며 그 실측도 테스트로 고정했다. Figma component set, visual regression, 제품 사용처가 남음 |
| [Dialog / Confirm Modal](dialog.md) | `experimental` | `not-ready` | `partial` | `done` | Dialog compound가 public export다. variant 5종·backdrop 정책·차단 안내를 recipe가 소유한다. Figma component와 시각 회귀는 아직 없다 |
| [Menu / Popover](menu-popover.md) | `experimental` | `not-ready` | `partial` | `done` | ActionMenu·CompositePopover·submenu가 public export다. Figma component와 시각 회귀는 아직 없다 |
| Input / Field | `experimental` | `not-ready` | `not-ready` | `not-ready` | P3 component backlog |
| Select / Dropdown | `experimental` | `not-ready` | `not-ready` | `not-ready` | P3 component backlog |
| [Tooltip](tooltip.md) | `experimental` | `not-ready` | `partial` | `done` | public export와 실브라우저 acceptance test 11건. overlay primitive의 positioner와 portal만 소비하고 focus scope·inert·scroll lock은 쓰지 않는다. 그룹 지연 건너뛰기와 arrow, Figma component set이 남음 |
| [Toast](toast.md) | `experimental` | `not-ready` | `partial` | `done` | public export와 실브라우저 acceptance test 12건. overlay primitive를 쓰지 않는다 — anchor·focus·바깥 클릭 어느 것도 해당하지 않아 Provider가 자기 live region viewport를 소유한다. 실행 취소 액션과 Figma component set이 남음 |
| Empty State | `experimental` | `not-ready` | `not-ready` | `not-ready` | P3 component backlog |
<!-- GENERATED:component-progress END -->
<!-- prettier-ignore-end -->

상태 의미:

- `done`: 해당 플랫폼에서 의도된 범위를 구현했다.
- `partial`: 구현은 있으나 API·상태·접근성·문서 또는 Figma 일치가 남았다.
- `not-ready`: 아직 제공하지 않는다.
- `not-planned`: 해당 플랫폼에 제공할 필요가 없다.
- `deprecated`: 대체 경로가 있으며 신규 사용을 금지한다.

## 문서 템플릿

새 컴포넌트 문서는 다음 순서를 사용한다.

1. 목적과 사용 시점
2. Availability와 maturity
3. Anatomy
4. Properties와 기본값
5. Variants, sizes, states
6. Interaction과 responsive behavior
7. Content
8. Accessibility
9. Specification과 사용 토큰
10. Web/Figma 링크, known deviations, migration, changelog

현재 첫 기준 문서는 [Button](button.md)이다. 구현을 시작할 때 manifest, public package API,
접근성·visual test와 Figma evidence를 함께 갱신한다.
