# Figma 재조립 gap registry — Home · Highlight · Editor

DS-F-007의 산출물이다. 배포 화면을 Klipse Design의 component·변수·style만으로 재조립할 때 **무엇이
없어서 raw로 그려야 하는지**를 기록한다. 이 목록이 DS-P3-009(카탈로그 순서)와 DS-P3-013(아이콘
범위)의 입력이다.

화면 지도와 route 목록은 [screen-inventory.md](screen-inventory.md)가 소유한다.

> **template 수치는 게이트가 지킨다.** 재조립 template이 제품 실측과 어긋나면
> `verify-figma-parity`가 실패한다 — 계약은 [templates.measured.json](../figma/templates.measured.json)에
> 근거(파일:줄번호)와 함께 있고, 변조 canary 3종이 검출력을 매 실행에서 증명한다.
> 이 검사는 나중에 붙였다. 없던 동안 Home template의 카드가 제품과 다른 구조로 그려진 채
> 통과했다 — 제품 카드는 정사각 썸네일에 제목이 **하단 30% 오버레이로 겹치는** 형태인데 썸네일
> 아래에 제목을 따로 놓는 형태였다. 게이트가 없는 곳은 사람이 확인해야 하고, 확인했다고 스스로
> 말하는 것은 증거가 아니다.

---

## 판정 — 세 화면 모두 gap 없이 재조립되지 않는다

| 화면 | route | 실측 | gap |
| --- | --- | ---: | ---: |
| 앱 홈 | `/archive` | 321 | 72 |
| 하이라이트 (허브·상세) | `/highlight`, `/highlight/[projectId]` | — | 130 |
| 비디오 에디터 (허브·워크스페이스) | `/videoeditor`, `/videoeditor/[projectId]` | — | 144 |

Figma에 있는 것은 Button component set 하나와 아이콘 26개다.

> **위 표는 2026-08-14의 기준선이다.** 그때 Figma에는 Button 하나뿐이었다. 지금은 여덟이고
> 토큰도 늘었다. 아래 "재측정"이 그 차이를 적는다. **72·130·144를 현재 값으로 인용하지 않는다.**

## 재측정 (2026-08-16)

카탈로그 1~6순위가 Web과 Figma에 모두 섰다 — IconButton · Tooltip · Toast · Menu/Popover ·
Dialog · ProjectCard. Figma component는 하나에서 여덟로 늘었다.

토큰 요구 일곱 중 셋이 해소됐다. **화면 단위 gap 재계수는 아직 하지 않았다** — 그것은 Figma에서
Home을 실제로 다시 조립해야 나오는 숫자이고, 여기서는 근거였던 토큰 요구만 다시 판정한다.

| 항목 | 판정 | 근거 |
| --- | --- | --- |
| T-1 `radius-8` 이름 없음 | **해소** | `radius-control-sm` 8px |
| T-2 범주형 색 팔레트 | 미해소 | `color-status-*` 넷뿐. 에디터가 쓰는 sky·pink·red·mint·amber·yellow 없음 |
| T-3 컨트롤 높이 토큰 | **부분** | `layout-control-height-md`(40) `-sm`(32) 생김. 제품은 여덟 단계이므로 나머지는 그대로 |
| T-4 `radius-card` 20↔16 | **해소** | [DS-D-0014](../design/governance/decisions/DS-D-0014-card-radius.md)로 16px. Dialog는 `radius-card-lg`로 옮겼다 |
| T-5 `layout-project-card-minimum` 소비처 | 미해소 | 여전히 CSS 소비처가 없다. ProjectCard는 폭을 그리드에 맡기므로 이 토큰은 Project Grid **패턴**의 것이고 그 패턴이 아직 없다 |
| T-6 라이트 팔레트 앱 셸 재정의 | 미해소 | 제품 쪽. `apps/web/components/navigation/Gnb.tsx:1962`가 `--palette-gray-100`을 `#f8f8f9`로 덮는다 |
| T-7 0.5px hairline과 glass bevel | **부분** | 제품에서 글래스를 걷어내 베벨은 사라졌다. DS에는 여전히 spread-only 전용 elevation 토큰이 없다 — `elevation-menu`가 drop 겹과 함께 갖고 있을 뿐이다 |

### 7·8순위를 실제로 세어 보니 등록부가 틀렸다

7순위와 8순위를 채택하기 전에 제품을 전수로 다시 셌다. 두 항목 모두 **처음 센 숫자가 적었다.**

**TextField / Input — 공용 구현 0, 정의 약 40벌, 5계열.** 처음엔 "에디터 16 · 하이라이트 3"으로
적었으나 인증·설정·블로그·문의·노드 캔버스까지 합치면 그보다 훨씬 넓다.

| 계열 | 벌 | 시각적 필드가 무엇인가 |
| --- | ---: | --- |
| A. floating-label 인증 | 9 | **감싸는 `div`.** `<input>`은 투명·무테두리다 |
| B. 테두리 보이는 박스 | 5 | `<input>` 자신 |
| C. 테두리 없는 채운 면 | 9 | `<input>` 자신 (배경만) |
| D. 투명 인라인 rename | 8 | 없음 (제자리 편집) |
| E. 노드 캔버스 프롬프트 | 5 | `<textarea>` 자신 |

**포커스 표현이 통일돼 있지 않다.** 인증 계열은 outline을 쓰지 않고 wrapper의 border-color를
바꾸며 `box-shadow: inset 0 0 0 1px`로 테두리를 두껍게 보이게 한다. `outline: 2px solid
rgb(var(--gray-000-rgb)/22%)` + `outline-offset: 1px`을 문자 단위로 똑같이 갖는 것이 다섯 벌 있고,
`[&:focus-visible]:[outline:none]`으로 포커스 표시를 **의도적으로 없앤** 것도 있다
(`NodeLayersPanel.tsx:178`의 주석이 "요청대로 색 제거"라고 적어 두었다).

**EmptyState — 9벌.** "홈 2 · 하이라이트 2 · 에디터 3 = 7벌"은 틀렸다. 에디터가 3이 아니라 5다 —
`VideoEditModal` **한 파일 안에만 세 벌**(preview · source · inspector)이 있고 허브와 프로젝트
피커가 더 있다. 파일 단위로 세면 놓치는 형태였다. 하이라이트의 두 번째 벌은 조건상 도달할 수
없는 죽은 분기라 살아 있는 것은 8벌이다.

아홉 벌은 거의 합의하지 않는다 — 컨테이너 padding이 80/64px, gap이 12/16px, 제목 계층이 있는 것과
없는 것, CTA가 있는 것 3 · 없는 것 6. 자기 배경이나 테두리를 가진 것은 **0벌**이다.

두 항목 모두 ProjectCard가 3벌이 아니라 4벌이었던 것과 같은 종류의 누락이다. **처음 센 숫자를
근거로 쓰지 않는다.**

남은 카탈로그는 7순위 이하다.

## 이 실측의 결론 하나

**제품에는 공용 컴포넌트 층이 사실상 없다.** `apps/web/components/ui/`는 파일 10개이고 그중 시각
컴포넌트는 넷뿐이다 — Button(17 파일에서 import) · VideoPlayer(7) · InlineLoadingLabel(12) ·
LoadingSpinner(1). 나머지는 브랜드 마크와 훅이다.

그래서 Klipse Design은 제품을 **따라잡는** 것이 아니라 **제품에 없던 층을 처음 만드는** 것이다.
실측이 찾은 중복 정의는 전부 그 부재의 비용이다 — ProjectCard 정의 4벌, Menu 서피스 3벌,
Spinner 레시피 5종, PaneDivider 6선언.

### 가장 강한 단일 신호 — 버튼 공용 사용률 6%

세 화면(+하이라이트 허브)의 버튼을 직접 셌다.

| 파일 | raw `<button>` | 공용 `<Button>` |
| --- | ---: | ---: |
| `AppHomeScene.tsx` | 9 | 1 |
| `HighlightScene.tsx` | 9 | 0 |
| `HighlightProjectScene.tsx` | 22 | 7 |
| `VideoEditModal.tsx` | 68 | 0 |
| **합계** | **108** | **8** |

제품에 Button이 있는데도 94%가 손으로 만들어진다. **Button 하나로는 덮이지 않는다**는 뜻이고,
빠진 축은 아이콘 전용 버튼·크기 단계·loading 상태다.

---

## 카탈로그 순서 — 세 화면 합산

우선순위는 **몇 화면에 걸치는가 × 저장소 확산도**로 정했다. 확산도는 직접 센 값이다.

| 순위 | component | 화면 | 저장소 확산 | 근거 |
| ---: | --- | --- | --- | --- |
| 1 | **IconButton** | 3/3 | 세 화면 raw button 108개의 다수 | 정사각 아이콘 전용. 에디터 클래스 정의 33개, 하이라이트 9개. Button의 빠진 축 |
| 2 | **Tooltip** | 2/3 | **22 파일** | 제품 Button(17 파일)보다 넓게 쓰이는데 공용 컴포넌트가 없다 |
| 3 | **Toast** | 3/3 | **20 파일** | 같은 이유. 카탈로그에 규범조차 없다 |
| 4 | **Menu / Popover** | 3/3 | 서피스 정의 3벌 | 코드에 ActionMenu가 있으나 Figma component가 없다. 임의 좌표 앵커 변형이 추가로 필요 |
| 5 | **Dialog** | 3/3 | 직접 import 8곳 | 코드에 있고 Figma에 없다. DS-F-006 대상 |
| 6 | **ProjectCard** | 3/3 | 정의 **4벌** | 앱 홈·노드캔버스 홈·하이라이트 허브·에디터 허브. **web done**(2026-08-16) — 네 벌의 기하가 같아 그 값을 정본으로 옮겼다. Figma component 있음, parity 게이트 미적용 |
| 7 | **TextField / Input** | 2/3 | **약 40벌 · 5계열** | 공용 구현 0. 2026-08-16 재측정 |
| 8 | **EmptyState** | 3/3 | **9벌**(살아 있는 것 8) | 홈 2 · 하이라이트 2(그중 1은 죽은 분기) · 에디터 **5**. 2026-08-16 재측정 |
| 9 | **Badge / StatusBadge** | 3/3 | 톤 4 + 상태 5 | 하이라이트 상태 5톤이 가장 복잡 |
| 10 | **Spinner / Progress** | 2/3 | 레시피 **5종** | 하이라이트 상세 한 화면에 로딩 표현 5종, Skeleton 0종 |
| 11 | **SidebarNavItem · AppTopBar** | 3/3 | Gnb import 31곳 | 셸. 상세는 breadcrumb·trailing 슬롯을 추가로 요구한다 |
| 12 | **Slider** | 1/3 | 에디터 `Slider.Root` 9 | 에디터 전용이지만 속성 패널이 통째로 막힌다 |
| 13 | **SegmentedControl** | 2/3 | 3 파일 | 뷰 전환·정렬 |
| 14 | **Checkbox** (indeterminate) | 1/3 | 4 파일 | 하이라이트 일괄 선택 |
| 15 | **SelectableListRow** | 2/3 | 하이라이트 2 · 에디터 1 | master-detail의 좌측 열 |

**에디터 전용이지만 그 화면의 뼈대인 것** — 5-pane grid · PaneDivider · InspectorField(33회) ·
InspectorSection(22회) · TimeRuler · Playhead · TimelineClip · TrackLane. 이것 없이는 에디터가
한 줄도 조립되지 않는다. `editor-workspace` pattern은 **규범 문서만 있고 Figma·Web 모두
`not-ready`인 유일한 pattern**이다.

---

## 토큰 — 세 화면이 함께 요구하는 것

### T-1. `radius-8`에 semantic 이름이 없다

에디터에서 가장 많이 쓰이는 radius다 — 직접 센 분포: **8이 28회**, 12가 20회, 999가 11회,
6이 11회, 4가 10회. Klipse semantic radius는 control 12 / overlay 16 / overlay-item 10 /
card 20 / pill 999 다섯이라 **최다 사용 값에 이름이 없다.**

### T-2. 범주형 색 팔레트가 없다

에디터는 클립을 소스별로 색 구분한다. 직접 센 참조: `sky` 63 · `pink` 19 · `red` 16 · `mint` 13 ·
`amber` 12 · `yellow` 2. Klipse 색 변수에는 `status-{danger,success,warning,info}` 넷뿐이라
**클립 색 구분·선택 스트로크·스냅 표시·마커를 표현할 방법이 없다.**

### T-3. 컨트롤 높이 토큰이 없다

에디터에 22 / 28 / 30 / 32 / 36 / 40 / 44 / 48 여덟 단계가 돈다. Klipse에는 컨트롤 크기 토큰이
아예 없고 `layout-control-hit-target-minimum`(44)만 있다.

### T-4. `radius-card` 20px ↔ 제품 카드 16px

카드·썸네일·배너·메인 카드·토스트가 전부 16px이고 16px과 맞는 것은 `radius-overlay`다.
`radius-card`의 유일한 소비처는 `packages/css/src/component/dialog.css:215`의 sheet variant다 —
**"카드"라는 이름의 토큰을 정작 카드가 쓰지 않는다.**

### T-5. `layout-project-card-minimum` 240px에 소비처가 없다

DS는 `minmax(240px, 1fr)` auto-fill을 전제하지만 제품은 minmax를 쓰지 않고 브레이크포인트로 열
수를 고정한다(2 / 3@720 / 4@1200 / 5@1800). `packages/css` 어디서도 참조되지 않고 규범 문서에서만
언급된다 — **존재하지 않는 알고리즘을 기술하는 토큰이다.**

### T-6. 라이트 팔레트가 앱 셸 스코프에서 재정의된다

`body:has(.gnb-wrapperSidebar)`에서 `--palette-gray-100~600`이 통째로 덮인다. 앱 셸 라이트 캔버스
`#eeeef1` / 표면 `#f8f8f9`가 Klipse `#f1f1f3` / `#fafafa`와 다르다. **다크는 `#171b22`로 정확히
일치한다.**

### T-7. 0.5px hairline과 glass bevel

제품은 border 대신 spread-only box-shadow로 0.5px 테두리를 그린다(`--glass-dropdown-frame`,
다크 `#575D68` / 라이트 `#D5D7DD`). Klipse `elevation/*` 4종은 전부 blur가 있어 재현할 수 없다.
inset bevel도 마찬가지다.

---

## 아이콘 — Wave B 입력

| 글리프 | 쓰임 | 상태 |
| --- | --- | --- |
| `magic-wand` | 사이드바 "비디오 에디터" | **이관 보류됨.** −45° 회전 rect라 `transform` 없이 표현되지 않는다. 실사용처가 확인됐으므로 처분 판단이 필요하다 |
| `caret-left` `caret-right` `caret-down` | 배너 화살표, 드롭다운 트리거 | 미보유 |
| `sidebar-toggle` | 사이드바 접기 | 미보유. 제품은 인라인 SVG |
| 에디터 아이콘 약 24종 | 타임라인·툴바·인스펙터 | 미실측. 에디터 착수 시 별도 인벤토리 필요 |
| `highlight-symbol` · `youtube` | 사이드바 | **브랜드/상표.** DS-D-0008 결정 5에 따라 아이콘 세트가 아니다 |

카탈로그에 있고 그대로 쓰이는 것: `magnifying-glass` · `house` · `graph` · `plus` ·
`dots-three-vertical`.

**아이콘 크기 12px·18px이 쓰인다.** Klipse는 16/20/24만 정의한다.

---

## Figma로 표현할 수 없는 것

| 항목 | 왜 |
| --- | --- |
| 타임라인 클립의 폭·좌표 | duration 비율 × 줌 배율(1–8×)의 `calc` 결과다. 대표 줌 상태를 고정하는 결정이 선행되어야 한다 |
| dominant-color 동적 텍스트 반전 | 런타임 휘도 계산. 밝은/어두운 두 variant로 근사 |
| 카드→페이지 zoom-in 전환 | scale 10× + blur |
| pill → 패널 morph (리파인 위젯) | 40px 알약이 360×560으로 스프링 확장 |
| 진입 stagger · `filter` 단계 | Figma에 filter 개념이 없다 |
| progressive blur + 다단 mask | `backdrop-filter` + mask 조합 |

---

## 제품 부채 — DS가 고칠 문제가 아니다

adoption 노트로 넘긴다.

- 모달 액션 버튼이 공용 Button을 쓰지 않는다. 삭제 확인 모달의 취소/삭제가 raw `<button>`이다.
- primary 버튼이 3-stop 그라디언트이고 hover가 `filter: brightness(1.06)`다.
- z-index가 제품 31단계 vs Klipse layer 5단계다.
- 죽은 스타일이 남아 있다. `floatingCreateDock`은 렌더되지 않고,
  `--app-gnb-main-card-padding-block-start: 20px`은 선언만 있고 아무도 읽지 않는다 —
  **문서만 보고 20px을 넣으면 틀린다.**
- 업로드 단계 테마 chip이 선언 0개인 marker-only 클래스라 시각적으로 미적용 상태다.
- 한도·삭제 확인이 `window.alert` / `window.confirm`이다.
- 하이라이트 상세에서 클립 상세 블록이 통째로 중복 정의된다.

---

## 실측의 한계

- 하이라이트·에디터는 **gap 목록 중심**으로 읽었고 홈처럼 수치를 전수 실측하지 않았다.
  해당 화면을 실제로 재조립할 때 수치 실측이 한 번 더 필요하다.
- 검증 단계에서 10건이 `confirmed=false`로 표시됐으나, 읽어 보면 **전부 "gap 자체는 실재한다"고
  확인하면서 세부 수치가 달라 false가 된 것**이다. 판정 기준을 "하나라도 틀리면 false"로 준 탓에
  "gap이 없다"와 "숫자가 틀리다"가 뭉개졌다. 그래서 이 문서의 수치는 **직접 다시 센 값만** 썼다.
- 에디터 아이콘 인벤토리는 하지 않았다.

## 판정

목표 B의 기준은 Home·Highlight·Editor 3개 화면이 카탈로그 gap과 parity 결함 없이 재조립되는
것이다. **현재 셋 다 미달이고, 가장 먼 것은 에디터다.** 위 표의 1~11번이 서면 홈과 하이라이트
허브가 대부분 조립되고, 12번 이후와 에디터 전용 뼈대가 서야 에디터가 조립된다.
