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
| [Alert](alert.md) | `experimental` | `partial` | `partial` | `done` | CSS 레시피(.louis-alert)는 있고 React 표면은 없다. Figma component set 4 variant(Tone). 결제·체크아웃 배너가 정본이다. 2026-08-26: 레시피만 있고 문서·Figma 가 없던 다섯 중 하나였다 — 시스템이 정의해 놓고 디자이너가 볼 수 없는 상태였다. |
| [Sidebar Nav Item · App Top Bar](app-shell-parts.md) | `experimental` | `partial` | `partial` | `done` | public export 2종, Figma component 둘(SidebarNavItem 6 variant · AppTopBar), parity 게이트가 Icon을 자손으로 대조한다. 실브라우저 acceptance test 10건. 셸의 레이아웃 계약은 app-shell 패턴이 소유하고 여기는 그 안의 부품 둘이다. 제품 실측에서 사이드바 항목에 포커스 표시가 아예 없다는 것을 찾았다 — 전역 리셋이 항목의 링 선언을 특이도와 무관하게 이긴다. 셸 composition과 compact 드로어는 아직 없다 2026-08-19: SidebarNavRow가 서고 AppTopBar에 leading·trailing 슬롯이 생겼다 — 코드 API에는 처음부터 있었는데 Figma에는 제목 하나뿐이라 조립하면 화면이 비어 보였다. 표현하지 못하는 API는 없는 것과 같다. |
| [Avatar](avatar.md) | `experimental` | `partial` | `partial` | `done` | public export와 실브라우저 acceptance test 9건이 두 motion context에서 각각 돈다. 제품에 공용 구현이 **부분만** 있다 — 기본 아바타 SVG 하나만 분리돼 있고 본체는 셸 파일에 인라인이다. 크기 28/24는 제품의 --profile-avatar-size 두 값을 그대로 옮겼고 control 계단을 따르지 않는다(아바타는 컨트롤이 아니라 표식이다). **진행률 링을 소유하지 않는다** — 흡수하면 인계서 (1c)의 미결 판정이 API로 새어 들어온다. 테스트가 테두리·그림자·::after 층이 0인지 확인한다. Figma component set 2 variant(Size)가 섰고 parity 게이트가 Fallback을 자손으로 대조한다 — raw fill 0. **계약이 stroke·effect 0을 요구하므로 링이 새어 들어오면 게이트가 잡는다.** publish는 DS-F-008이다 |
| [Badge](badge.md) | `experimental` | `partial` | `partial` | `done` | public export, Figma component set 5 variant(Tone), parity 게이트가 Label을 자손으로 대조한다. 실브라우저 acceptance test 7건. 제품에 정의가 65벌이고 공용 구현은 0이다. gap registry의 '톤 4 + 상태 5'는 둘 다 틀렸다 — 네 톤 클래스의 선언이 바이트 단위로 같고, 앱 홈 4변형의 색이 전부 같은 변수를 가리킨다. 새 토큰 없이 기존 토큰에 맞는 기하를 골랐다. 알약(999px) 증감·개수 칩은 별도 컴포넌트이며 아직 없다 |
| [Banner Carousel](banner-carousel.md) | `experimental` | `partial` | `partial` | `done` | public export와 실브라우저 acceptance test 10건. Figma component set 4 variant(Tone × Bleed)에 기하 계약이 붙었고 parity가 매 실행 대조한다. 값은 전부 배포본 실측이며 모션 9종·미디어 색 9종·space-media-inset이 이 컴포넌트를 위해 섰다. **정지 버튼은 제품에 없다** — WCAG 2.2.2를 위해 의도적으로 더한 것이고 그만큼 컨트롤 폭이 제품보다 36px 넓다. 제품 소비 증거가 없다 |
| [Breadcrumb](breadcrumb.md) | `experimental` | `partial` | `not-ready` | `partial` | 제품 전수 인벤토리에서 확인. 앱 상단 페이지 내비(Gnb.tsx:5335-5352) — 부모는 48% 로 흐리고 현재는 aria-current 가 소유한다. LOUIS recipe 는 아직 없다. |
| [Button](button.md) | `experimental` | `partial` | `partial` | `done` | public export와 실브라우저 acceptance test. Figma component set 40 variant에 아이콘 슬롯과 기하 계약이 붙었다. primary 면이 제품 브랜드 블루라 WCAG AA에 미달하며 owner 결정으로 수용한 상태다 — 규범 Known deviations 참조 |
| [Carousel Arrow](carousel-arrow.md) | `experimental` | `partial` | `not-ready` | `done` | 랜딩 캐러셀 헤더의 넘김 버튼 쌍. 제품 구현(CarouselArrows.tsx)이 정본이고 소비처가 다섯 자리다 — LOUIS recipe 는 없다. 32×32 · radius 12 · 잉크 8% 면 · 헤어라인은 stroke 가 아니라 inset 그림자다(DS-D-0023 정본). Figma 는 쌍이 아니라 버튼 하나를 set 으로 뽑았다(Direction × State 6) — 상호작용과 프로토타입을 받는 단위가 그것이다. **Direction 축은 figma-component-authoring.md §2 개정으로 축 표에 열렸다** — 값 prev·next 는 트랙의 진행 방향이지 화살표가 가리키는 쪽이 아니다. hover 두 겹의 색 변수가 서로 바뀌어 묶여 있는 것도 미해결이다. 포커스 표시가 코드에도 Figma 에도 없다(SC 2.4.7 결손). |
| [Checkbox](checkbox.md) | `experimental` | `partial` | `partial` | `done` | public export와 실브라우저 acceptance test 14건이 두 motion context에서 각각 돈다. **제품에 정본이 있는데 21벌 중 2벌만 쓴다** — 그 전역 클래스가 cascade layer 밖이라 소비처가 이길 수 없었다. 크기 20px은 채택하고 accent-color는 채택하지 않았다(면 색 하나만 주고 표시·링·부분선택 막대를 브라우저가 정한다). indeterminate는 DOM 프로퍼티라 ref로 맞추고 aria-checked=mixed를 함께 준다. **선택 안 한 테두리 대비가 SC 1.4.11(3:1)에 미달하며 테두리 토큰 셋 중 어느 것도 라이트에서 넘지 못한다** — 실측을 규범에 적었고 인계서 (2b) 판정의 입력이다. color-stroke-strong의 첫 소비처다. Figma component set 4 variant(State)가 섰고 parity 게이트가 Box·Check·Dash·Label을 자손으로 대조한다 — raw fill·stroke 0. 체크는 CSS와 같은 구조(5×9 사각형의 두 변 + 45° 회전)라 계약값이 그대로 남는다. publish는 DS-F-008이다 |
| [Dialog / Confirm Modal](dialog.md) | `experimental` | `partial` | `partial` | `done` | public export와 실브라우저 acceptance test. Figma component set 3 variant(Size). fullscreen은 표면이 뷰포트라 고정 폭 variant로 그릴 수 없어 제외했다. 제품에 공용 정본이 없다 |
| [Empty State](empty-state.md) | `experimental` | `partial` | `partial` | `done` | public export와 실브라우저 acceptance test 7건. Figma component 하나이며 parity 게이트가 Graphic·Title·Description·Action을 자손으로 대조한다. 제품에 정의가 9벌 있고 하나는 도달 불가능한 죽은 분기다. 아홉 벌이 합의하는 것은 '자기 배경도 테두리도 반경도 갖지 않는다' 하나뿐이다. 오류 상태는 다루지 않는다 — 제품은 둘을 합쳤지만 사용자가 취할 행동이 다르다 |
| [FAQ Row](faq-row.md) | `experimental` | `partial` | `not-ready` | `done` | 랜딩·가격 두 페이지가 쓰는 아코디언 행. 제품 구현(FAQ.tsx)이 정본이고 LOUIS recipe 는 없다 — 행 하나가 통째로 버튼이다(좌우 20 · 위아래 18 · 사이 16, 닫힌 높이 66 = 18+30+18). **면을 gray-900 으로 두면 라이트에서 사라진다** — 그 단이 랜딩 페이지 바닥과 바이트 동일해져 대비가 1:1 이 되므로 잉크 8% 오버레이(landing/panel-strong)를 쓴다. 밑줄 2열 배치를 버리고 면으로 나눈 결과 행 면과 바닥의 대비가 1.2:1 뿐이고 헤어라인도 두르지 않는다 — 다른 랜딩 면과 갈리는 자리다. 전환이 둘로 갈려 있다: 높이·투명도 300ms cubic-bezier(0.4,0,0.2,1)(framer-motion) 과 + 글리프 회전 220ms ease(CSS) 인데 Figma 는 한 전환에 두 시간을 담을 수 없어 300 으로 합쳤다. **Expanded 는 figma-component-authoring.md §2 개정으로 조건 축(false·true) 명부에 올랐다** — + 글리프가 계속 보이는 채로 45° 돌고(시험 1) 여닫이에 전이를 걸어야 해서(시험 3) BOOLEAN 이 아니다. + 글리프 대비가 라이트에서 3.73:1 로 AA(4.5) 미만이지만 아이콘성 글리프라 비-텍스트 3:1 로 판정했다. aria-controls 와 제목 요소가 없고 prefers-reduced-motion 계약도 없다. 가격 페이지 스코프가 --gray-000 만 되돌리고 --gray-300 을 빼놓아 다크 테마에서 답변 대비가 1.29:1 로 떨어지는 미해결이 남아 있다. |
| [FormMessage](form-message.md) | `experimental` | `partial` | `not-ready` | `partial` | 제품 전수 인벤토리에서 확인. 인증 폼 아래 한 줄 메시지(login/page.tsx:199,537) — caption-12-regular · padding-left 4. error/neutral 두 톤. LOUIS recipe 는 아직 없다. |
| [GNB Menu Item](gnb-menu-item.md) | `experimental` | `partial` | `not-ready` | `done` | 랜딩 상단 내비게이션 가운데 메뉴의 항목 하나. 제품 구현(landing/navigation/Gnb.tsx 의 menuLinkClass)이 정본이고 앵커·라우트·드롭다운 트리거·「공개 예정」 넷이 같은 알약을 쓴다 — LOUIS recipe 는 없다. **상태를 면이 아니라 잉크 불투명도로 만든다**: 여덟 변형의 기하가 완전히 같아 되읽기 키가 base 하나이고, 면·테두리·그림자가 전부 없다. **톤은 테마가 아니라 밑에 깔린 면이다** — 라이트 테마 안의 어두운 사진 밴드에서 뒤집히므로 시맨틱 램프가 아니라 고정 palette-gray-* 를 쓴다. **제품이 밝은 면 Default 를 0.50 → 0.65 로 올렸는데 Figma 는 아직 0.50 이다** — 0.50 은 랜딩 바닥과 AA 미달이었고 누를 수 있는 링크라 비활성 면제 대상이 아니다. 되읽기가 opacity 를 담지 않아 어떤 게이트도 이 어긋남을 잡지 못한다. **figma-component-authoring.md §2 개정이 두 축을 판정했다** — Surface 는 축 표에 열렸고(제품이 이 자리를 고정 팔레트로 받으므로 테마 모드로 접히지 않는다), State=Selected 는 접기 시험을 통과해 State 값으로 남는다. 남은 것은 Figma 재작업이다 — Surface 두 변형이 어느 색에 묶여 있는지 확인해야 한다. 포커스 링을 코드도 Figma 도 소유하지 않는다(SC 2.4.7 결손). |
| [Icon Button](icon-button.md) | `experimental` | `partial` | `partial` | `done` | public export와 실브라우저 acceptance test 11건. Figma component set 40 variant가 기하 계약(한 변 40/32)으로 묶여 있다. pressed의 hover 면과 loading 상태가 남음 |
| [Input / Field](text-field.md) | `experimental` | `partial` | `partial` | `done` | public export와 실브라우저 acceptance test 8건. Figma component set 8 variant(Size×State)이며 parity 게이트가 Box·Label·Value·Message를 자손으로 대조한다. **제품에 공용 구현이 없다** — 정의 약 40벌이 다섯 계열로 갈려 값은 DS가 정했다. 시각적 필드는 <input>이 아니라 감싸는 박스다. Textarea는 아직 없다 |
| [Keycap](keycap.md) | `experimental` | `partial` | `not-ready` | `partial` | 제품 전수 인벤토리에서 확인된 미커버 패턴. CommandPalette.tsx:281-296 의 단축키 칩 — h20 · px5 · r6 · caption-12 · leading 1. LOUIS recipe 는 아직 없다. |
| [Media Card](media-card.md) | `experimental` | `partial` | `not-ready` | `done` | 사진이 배경을 채우고 그 위에 유리 배지와 흐린 정보 바를 얹는 정사각 카드. 제품 구현(MediaCard.tsx)이 정본이고 랜딩 캐러셀 둘과 템플릿 그리드가 같은 카드를 쓴다 — LOUIS recipe 는 없다. 정보 바는 그라디언트 스크림이 아니라 저알파 면 + 배경 흐림 20 이고 위쪽 padding 40 이 그 장치다. 높이 111 은 시안 98/94 와 다르다 — 제품 타입 스케일의 줄 높이 150% 를 따른 결과다. **Badge 축은 figma-component-authoring.md §2 개정에서 폐기 판정을 받았다** — 값이 내용이라 시험 4 에 걸린다. Badge BOOLEAN + BadgeLabel TEXT 로 접고 변형 3 → 1 이 되는 Figma 재작업이 남아 있다. 제품의 layout 축(carousel·grid)은 고정 폭으로 그릴 수 없어 Figma 에서 의도적으로 비웠다. 흰색 1% 는 알파 램프에 01 단계가 없어 static-white-alpha/04 로 올렸고 흐림 20 은 대응 토큰이 없어 리터럴이다. |
| [Menu / Popover](menu-popover.md) | `experimental` | `partial` | `partial` | `done` | public export와 실브라우저 acceptance test. Figma는 항목 set 5 variant와 패널 component 둘로 나뉜다 — 항목이 조립 단위이고 패널이 그것을 담는다. 제품 공용 정본은 --dropdown-* 토큰이며 면·간격·알파를 채택했다. 서브메뉴와 체크 상태가 남음 |
| [News Card](news-card.md) | `experimental` | `partial` | `not-ready` | `done` | 날짜 한 줄과 제목으로 소식 한 건을 적는 카드. 제품 구현(NewsCarousel.tsx 안의 NewsCard)이 정본인데 **export 되지 않는 파일 내부 함수**라 소비처가 한 자리뿐이다 — MediaCard·CarouselArrow 가 여러 곳에서 이미 쓰이던 것을 뒤늦게 이름 붙인 것과 출발점이 다르다. LOUIS recipe 는 없다. **색이 두 갈래다** — 보통 카드는 테마를 따르는 landing/panel-strong · gray/000 · landing/text-muted, 피처드는 사진 + 스크림 위라 고정 media-foreground-dark · palette-gray/500 이다. 열 폭 347 = (1400 − gap 4×3) ÷ 4 이고 피처드 698×324 는 두 열 두 행 + 간격이다. 카드 면이 시안 #171b22 가 아닌 것은 gray-900 이 라이트에서 랜딩 바닥과 바이트 동일이 되어 카드 경계가 사라지기 때문이다. **Featured 는 figma-component-authoring.md §2 개정으로 조건 축(false·true) 명부에 올랐다** — 프레임 자신의 고정 크기가 347×160 → 698×324 로 다시 쓰여(시험 2) BOOLEAN 으로 접히지 않는다. 스크림은 제품에서 한 겹 3정지점인데 Figma 는 두 겹이다 — 정지점에 변수를 묶으면 알파가 변수값으로 덮이기 때문이며 합성 곡선은 대조되지 않는다. 보통 카드 날짜의 라이트 대비 3.5:1(SC 1.4.3 결손)과 시안이 다섯 장을 같은 #9aa0ab 로 찍은 것을 두 갈래로 가른 것도 미해결이다. |
| [Node Chip](node-chip.md) | `experimental` | `partial` | `partial` | `done` | CSS 레시피(.louis-node-chip)는 있고 React 표면은 없다. Figma component set 6 variant(Shape × State). 캔버스 노드 크롬의 알약이며 4개 노드가 소비한다. 다크 disabled 대비 1.00:1 버그를 칩 전용 fg 토큰으로 고친 이력이 있다. |
| [Progress](progress.md) | `experimental` | `partial` | `partial` | `done` | determinate 진행률. **제품에 정본이 없어 접근성 계약부터 DS가 정했다**(DS-D-0022) — 배포본에 role="progressbar"가 1곳, <progress>가 0곳이다. 값을 갖는 것은 트랙이고 채움은 장식이다. 기하는 제품 셋이 합의하는 축(높이 6 · 알약 · 최대 폭 320)만 옮기고 색은 DS가 골랐다. 링은 제품 정본이 하나뿐이라 두께·간격·지름 식을 그대로 옮겼고, 지름을 계산하는 대신 padding으로 만들어 내용이 커지면 따라온다. indeterminate는 폭이 아니라 면 그라디언트를 흘린다 — loop 허용 property가 그렇다 |
| [Project Card](project-card.md) | `experimental` | `partial` | `partial` | `done` | public export 10종과 실브라우저 acceptance test 6건. 값은 제품 정의 4벌의 정본을 옮긴 것이다. 프로그레시브 블러의 첫 소비처이며, parity 게이트가 자손 기하·타이포·흐림·자식 순서를 대조한다. 구조는 제품과 다르다 — 프레임은 div이고 클릭 타깃이 카드 전체를 덮는 형제다 |
| [Segmented Control](segmented-control.md) | `experimental` | `partial` | `partial` | `done` | public export와 실브라우저 acceptance test 14건이 두 motion context에서 각각 돈다. **제품에 공용 구현이 둘인데 서로 아무것도 공유하지 않는다** — SegmentedToggle 컴포넌트(3벌)와 useSegmentedControlThumb 훅(4벌, 스타일은 복붙). 정본을 전자로 잡고 높이만 control 계단을 따랐다. 네이티브 radio 그룹이며 fieldset/legend가 그룹 이름을 소유한다. 트랙 inset ↔ 선택 raised는 두 테마 모두에서 죽지 않는 유일한 면 조합이다. 선택 면의 슬라이딩 전환은 layout-change motion 토큰이 없어 미구현이다. Figma component set 2 variant(Size)가 섰고 parity 게이트가 Track·Segment·Segment-Selected·Label을 자손으로 대조한다 — raw fill·stroke 0. 헤어라인은 CSS의 inset box-shadow에 대응하는 INNER_SHADOW effect다 (DS-D-0023, 이전엔 spread-only box-shadow → OUTSIDE stroke였다). publish는 DS-F-008이다 |
| [SegmentedControlItem](segmented-control-item.md) | `experimental` | `partial` | `not-ready` | `partial` | 세그먼트 하나. hover·selected·focus 는 컨트롤이 아니라 여기가 받으므로 별도 component set 으로 뽑고 프로토타입 반응(ON_HOVER → Hover, ON_CLICK → Selected)을 건다. hover 는 글자색만 바꾼다. |
| Select / Dropdown | `experimental` | `not-planned` | `not-planned` | `not-planned` | **고르기는 Menu가 소유한다**(2026-08-18 판정). 제품 실측에서 네이티브 <select> 12벌이 전부 /admin 아래이고 배포 화면(Home·Highlight·Editor)에는 0벌이다 — 제품은 트리거 + 메뉴 패널로 고르며 그 파일이 11개다. DS에는 이미 ActionMenu와 CompositePopover가 있어 그 자리를 덮는다. gap registry 우선순위 1~15 어디에도 들지 않은 이유도 같다. 관리자 도구는 이 저장소의 소비 surface가 아니다. 수요가 생기면 Decision으로 이 판정을 뒤집고 다시 연다 |
| [Selectable List Row](selectable-list-row.md) | `experimental` | `partial` | `partial` | `done` | public export와 실브라우저 acceptance test 12건이 두 motion context에서 각각 돈다. master-detail의 좌측 열이며 제품 3벌 중 2벌(행의 면이 선택을 갖는 쪽)을 덮는다 — 나머지 1벌은 선택을 체크박스가 가지므로 Checkbox + 행 레이아웃이다. 선택은 aria-current가 소유하고 **면 하나에 기대지 않는다**: 다크에서 background-inset이 surface와 같은 색이라 표면 위 목록에서 선택 면이 사라지므로 3px 선행 표식을 함께 그린다. 같은 위험이 SidebarNavItem에 남아 있다(사이드바가 캔버스 위라서 성립). listbox가 아니며 Tab이 목록을 훑는다. Figma component set 3 variant(State)가 섰고 parity 게이트가 Marker·Text·Title·Meta·Media·Trailing을 자손으로 대조한다 — raw fill 0. Marker의 폭이 계약이라 선택 표식이 사라지면 게이트가 잡는다. publish는 DS-F-008이다 |
| [Skeleton](skeleton.md) | `experimental` | `partial` | `partial` | `done` | public export와 실브라우저 acceptance test 5건이 두 motion context에서 각각 돈다. **면 색을 고르지 않는다** — 제품 실측(면 8% · 하이라이트 9%, 전경색 기준)대로 currentColor를 낮은 알파로 깐다. 인계서 (1c)의 "면 색 판정"은 solid 토큰이 필요하다는 전제 위에 있었고 실측이 그것을 부정했다. 흐름은 background-position이며 loop 허용 property(DS-D-0016)와 제품 우세 기법이 같은 곳을 가리킨다. 크기는 호출부가 정한다 |
| [Slider](slider.md) | `experimental` | `partial` | `partial` | `done` | public export와 실브라우저 acceptance test 16건이 두 motion context에서 각각 돈다. **제품에 공용 구현이 없다** — 정의 37벌이 일곱 레시피로 갈리고 합의하는 축이 하나도 없어 값은 DS가 정했다. 네이티브 <input type="range">이며 track 변형이 제품 인스펙터의 채움 막대를 흡수한다(제품은 그 자리에서 썸을 지웠고 DS는 표식을 곧 썸으로 만든다). 레일·썸의 렌더 결과는 섀도우 pseudo-element라 계산값을 읽을 수 없어 CSSOM 선언을 대조한다. Figma component set 4 variant(Size×Variant)가 섰고 **복합 키 `{size}/{variant}`를 쓰는 유일한 컴포넌트**다 — Variant 축이 레일 두께 4↔28과 썸 16↔2×14를 바꾼다. parity 게이트가 Rail·Fill·Thumb·Control·Label을 그룹별로 대조하고 변조 canary가 한 variant만 어긋난 경우를 잡는다. publish는 DS-F-008이다 |
| [Spinner](spinner.md) | `experimental` | `partial` | `partial` | `done` | public export, Figma component set 2 variant(Size), parity 게이트가 Track·Arc를 자손으로 대조한다. 실브라우저 acceptance test 8건이 두 motion context에서 각각 돈다. 제품의 로딩 표현은 약 62벌이지만 공용 LoadingSpinner가 정본이고 그 recipe(700ms · linear)가 motion-loop와 정확히 같다. 회전 keyframe은 base.css의 공용 louis-spin 하나이며 Button·Menu도 그것을 가리킨다. determinate 진행률·스켈레톤·텍스트 쉬머는 별도 컴포넌트이며 아직 없다 |
| [Step Tile](step-tile.md) | `experimental` | `partial` | `not-ready` | `done` | 순서가 있는 3-스텝 안내의 한 칸. 비어 있는 정사각 면 하나와 그 밑의 한 줄 캡션이 전부다. 제품 구현(StepTiles.tsx)이 정본이고 랜딩 한 자리에서 쓴다 — LOUIS recipe 는 없다. 변형 축이 0 이고 슬롯 셋(Label TEXT · Description BOOLEAN · DescriptionLabel TEXT)이 전부라 닫힌 축 표를 벗어나는 축이 없다. 타일 면은 gray-* 램프가 아니라 landing/panel-strong 에서 받는다 — 램프를 뒤집으면 라이트에서 타일과 바닥이 같은 값이 되어 대비 1:1 로 사라진다. 테두리도 그림자도 없다. **캡션의 층이 두 매체에서 다르다** — Figma 는 가로 auto-layout(itemSpacing 4)이고 제품은 문단 하나의 인라인 흐름에 진짜 공백 문자(실측 4.69)다. flex 로 두면 복사·접근성 트리에서 라벨과 설명이 붙기 때문이며, 어느 쪽을 recipe 정본으로 삼을지는 소유자 판정이다. 줄 높이 150% 를 따른 결과 설명이 있는 한 줄 카드가 시안보다 6 높다. 462.667 은 한 폭에서 나온 FILL 분배값이라 고정 폭 축을 만들지 않았다. 타일 콘텐츠와 문구(카드 1·2 설명 중복 · JA 번역 없음)는 아직 미결이다. |
| [Switch](switch.md) | `experimental` | `partial` | `partial` | `done` | CSS 레시피(.louis-switch)는 있고 React 표면은 없다. Figma component set 4 variant(Checked × Disabled). 44×24 는 제품 실측을 채택한 값이다. 2026-08-26 Figma 등재. |
| [Table](table.md) | `experimental` | `partial` | `partial` | `done` | CSS 레시피(.louis-table)는 있고 React 표면은 없다. Figma 는 셋으로 나뉜다 — TableHeaderCell(Align 3) · TableCell(Align × State 6) · 그 둘을 조립하는 Table. 머리 칸과 몸 칸은 패딩·타이포·글자색·테두리가 모두 달라 한 set 으로 묶으면 절반이 거짓 조합이 된다. |
| [Tabs](tabs.md) | `experimental` | `partial` | `partial` | `done` | CSS 레시피(.louis-tabs)는 있고 React 표면은 없다. Figma 는 둘로 나뉜다 — 상호작용과 프로토타입을 받는 TabItem(State 4) 과 그것을 조립하는 Tabs. 네 상태가 전부 opacity 로만 갈린다. |
| [Toast](toast.md) | `experimental` | `partial` | `partial` | `done` | public export와 실브라우저 acceptance test 14건. Figma component set 2 variant(Tone). 제품에 공용 정본이 없어 값은 DS가 정했다. 실행 취소 액션이 남음 |
| [Tooltip](tooltip.md) | `experimental` | `partial` | `partial` | `done` | public export와 실브라우저 acceptance test 12건. Figma component set 4 variant(Side). 표면이 페이지와 반전된다 — 제품 공용 SSOT에서 채택했다. 그룹 지연 건너뛰기와 arrow가 남음 |
| [Video Player](video-player.md) | `experimental` | `partial` | `partial` | `done` | 제품 구현(VideoPlayer.tsx)이 정본이고 소비처가 8곳이다. LOUIS recipe 는 아직 없다 — Figma 가 코드보다 앞서 있는 자리다. **스킨 축을 없앴다** — 두 벌 중 하나만 8곳 중 7곳에서 쓰였고 나머지 한 자리도 같은 조형으로 통합했다(제품·Figma 동시 반영). Figma 는 둘로 나뉜다: 포인터 이벤트를 혼자 소유하는 MediaScrubber(2 variant, ON_HOVER 프로토타입)와 그것을 조립하는 VideoPlayer(4 variant, Chrome × Tone). tone=bright 가 유리 틴트가 아니라 잉크만 뒤집는다는 함정을 문서에 적어 두었다. |
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
