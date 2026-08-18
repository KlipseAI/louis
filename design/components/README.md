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
| [Button](button.md) | `experimental` | `partial` | `partial` | `done` | public export와 실브라우저 acceptance test. Figma component set 40 variant에 아이콘 슬롯과 기하 계약이 붙었다. primary 면이 제품 브랜드 블루라 WCAG AA에 미달하며 owner 결정으로 수용한 상태다 — 규범 Known deviations 참조 |
| [Icon Button](icon-button.md) | `experimental` | `partial` | `partial` | `done` | public export와 실브라우저 acceptance test 11건. Figma component set 40 variant가 기하 계약(한 변 40/32)으로 묶여 있다. pressed의 hover 면과 loading 상태가 남음 |
| [Dialog / Confirm Modal](dialog.md) | `experimental` | `partial` | `partial` | `done` | public export와 실브라우저 acceptance test. Figma component set 3 variant(Size). fullscreen은 표면이 뷰포트라 고정 폭 variant로 그릴 수 없어 제외했다. 제품에 공용 정본이 없다 |
| [Menu / Popover](menu-popover.md) | `experimental` | `partial` | `partial` | `done` | public export와 실브라우저 acceptance test. Figma는 항목 set 5 variant와 패널 component 둘로 나뉜다 — 항목이 조립 단위이고 패널이 그것을 담는다. 제품 공용 정본은 --dropdown-* 토큰이며 면·간격·알파를 채택했다. 서브메뉴와 체크 상태가 남음 |
| [Input / Field](text-field.md) | `experimental` | `partial` | `partial` | `done` | public export와 실브라우저 acceptance test 8건. Figma component set 8 variant(Size×State)이며 parity 게이트가 Box·Label·Value·Message를 자손으로 대조한다. **제품에 공용 구현이 없다** — 정의 약 40벌이 다섯 계열로 갈려 값은 DS가 정했다. 시각적 필드는 <input>이 아니라 감싸는 박스다. Textarea는 아직 없다 |
| Select / Dropdown | `experimental` | `not-ready` | `not-ready` | `not-ready` | P3 component backlog |
| [Tooltip](tooltip.md) | `experimental` | `partial` | `partial` | `done` | public export와 실브라우저 acceptance test 12건. Figma component set 4 variant(Side). 표면이 페이지와 반전된다 — 제품 공용 SSOT에서 채택했다. 그룹 지연 건너뛰기와 arrow가 남음 |
| [Toast](toast.md) | `experimental` | `partial` | `partial` | `done` | public export와 실브라우저 acceptance test 14건. Figma component set 2 variant(Tone). 제품에 공용 정본이 없어 값은 DS가 정했다. 실행 취소 액션이 남음 |
| [Empty State](empty-state.md) | `experimental` | `partial` | `partial` | `done` | public export와 실브라우저 acceptance test 7건. Figma component 하나이며 parity 게이트가 Graphic·Title·Description·Action을 자손으로 대조한다. 제품에 정의가 9벌 있고 하나는 도달 불가능한 죽은 분기다. 아홉 벌이 합의하는 것은 '자기 배경도 테두리도 반경도 갖지 않는다' 하나뿐이다. 오류 상태는 다루지 않는다 — 제품은 둘을 합쳤지만 사용자가 취할 행동이 다르다 |
| [Project Card](project-card.md) | `experimental` | `partial` | `partial` | `done` | public export 10종과 실브라우저 acceptance test 6건. 값은 제품 정의 4벌의 정본을 옮긴 것이다. 프로그레시브 블러의 첫 소비처이며, parity 게이트가 자손 기하·타이포·흐림·자식 순서를 대조한다. 구조는 제품과 다르다 — 프레임은 div이고 클릭 타깃이 카드 전체를 덮는 형제다 |
| [Badge](badge.md) | `experimental` | `partial` | `partial` | `done` | public export, Figma component set 5 variant(Tone), parity 게이트가 Label을 자손으로 대조한다. 실브라우저 acceptance test 7건. 제품에 정의가 65벌이고 공용 구현은 0이다. gap registry의 '톤 4 + 상태 5'는 둘 다 틀렸다 — 네 톤 클래스의 선언이 바이트 단위로 같고, 앱 홈 4변형의 색이 전부 같은 변수를 가리킨다. 새 토큰 없이 기존 토큰에 맞는 기하를 골랐다. 알약(999px) 증감·개수 칩은 별도 컴포넌트이며 아직 없다 |
| [Spinner](spinner.md) | `experimental` | `partial` | `partial` | `done` | public export, Figma component set 2 variant(Size), parity 게이트가 Track·Arc를 자손으로 대조한다. 실브라우저 acceptance test 8건이 두 motion context에서 각각 돈다. 제품의 로딩 표현은 약 62벌이지만 공용 LoadingSpinner가 정본이고 그 recipe(700ms · linear)가 motion-loop와 정확히 같다. 회전 keyframe은 base.css의 공용 kds-spin 하나이며 Button·Menu도 그것을 가리킨다. determinate 진행률·스켈레톤·텍스트 쉬머는 별도 컴포넌트이며 아직 없다 |
| [Slider](slider.md) | `experimental` | `not-ready` | `partial` | `done` | public export와 실브라우저 acceptance test 16건이 두 motion context에서 각각 돈다. **제품에 공용 구현이 없다** — 정의 37벌이 일곱 레시피로 갈리고 합의하는 축이 하나도 없어 값은 DS가 정했다. 네이티브 <input type="range">이며 track 변형이 제품 인스펙터의 채움 막대를 흡수한다(제품은 그 자리에서 썸을 지웠고 DS는 표식을 곧 썸으로 만든다). 레일·썸의 렌더 결과는 섀도우 pseudo-element라 계산값을 읽을 수 없어 CSSOM 선언을 대조한다. Figma component set은 DS-F-006-slider가 소유한다 |
| [Sidebar Nav Item · App Top Bar](app-shell-parts.md) | `experimental` | `partial` | `partial` | `done` | public export 2종, Figma component 둘(SidebarNavItem 6 variant · AppTopBar), parity 게이트가 Icon을 자손으로 대조한다. 실브라우저 acceptance test 10건. 셸의 레이아웃 계약은 app-shell 패턴이 소유하고 여기는 그 안의 부품 둘이다. 제품 실측에서 사이드바 항목에 포커스 표시가 아예 없다는 것을 찾았다 — 전역 리셋이 항목의 링 선언을 특이도와 무관하게 이긴다. 셸 composition과 compact 드로어는 아직 없다 |
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
