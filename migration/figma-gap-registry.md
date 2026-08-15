# Figma 재조립 gap registry — Home

DS-F-007의 산출물이다. 배포 화면을 Klipse Design의 component·변수·style만으로 재조립할 때 **무엇이
없어서 raw로 그려야 하는지**를 기록한다. 이 목록이 DS-P3-009(카탈로그 순서)와 DS-P3-013(아이콘
범위)의 입력이다.

대상 화면은 앱 홈(route `/archive`, scene `AppHomeScene`)이다. 화면 지도와 route 목록은
[screen-inventory.md](screen-inventory.md)가 소유한다.

## 판정 요약

| 축 | 실측 | gap |
| --- | ---: | ---: |
| 앱 셸 (사이드바·헤더) | 83 | 19 |
| 프로젝트 그리드·카드 | 86 | 18 |
| 상단 chrome·액션 | 84 | 15 |
| 색·타이포·간격 | 68 | 20 |
| **합계** | **321** | **72** |

**현재 카탈로그로는 이 화면을 충실히 재조립할 수 없다.** Figma에 있는 것은 Button component set
하나와 아이콘 26개뿐이고, 화면이 요구하는 ProjectCard·BannerCarousel·Menu·Dialog·Toast·
SidebarNavItem·AppTopBar·Avatar·Badge·EmptyState는 전부 없다. 그러므로 이 단계의 재조립은
**픽셀 재현이 아니라 coverage 측정**이며, Templates의 산출물도 그렇게 읽어야 한다.

---

## 1. 토큰 — 지금 고쳐야 하는 것

이 넷은 카탈로그 확장을 기다릴 필요가 없고, 방치하면 **이름만 보고 집었을 때 화면이 달라진다.**

### 1-1. `radius-card` 20px ↔ 제품 카드 16px

프로젝트 카드·썸네일·배너·메인 카드·토스트가 전부 `border-radius: 16px`다. Klipse의
`--kds-radius-card`는 20px이고, 16px과 정확히 맞는 것은 `--kds-radius-overlay`다.

`radius-card`의 현재 유일한 소비처는 `packages/css/src/component/dialog.css:215`의 sheet variant다.
즉 **"카드"라는 이름을 가진 토큰을 정작 카드가 쓰지 않는다.**

- 판정 필요: `radius-card`를 16px로 정정할지, 제품을 20px로 올리는 migration을 기록할지.

### 1-2. `layout-project-card-minimum` 240px — 소비처가 없다

제품 그리드는 `minmax()`를 쓰지 않는다. 브레이크포인트로 **열 수를 고정**한다.

```
기본        repeat(2, 1fr)
≥ 720px     repeat(3, 1fr)
≥ 1200px    repeat(4, 1fr)
≥ 1800px    repeat(5, 1fr)
gap         12px  (= layout-project-grid-gap ✓ 일치)
```

`layout-project-card-minimum`은 `packages/css`에서 참조되지 않으며 규범 문서에서만 언급된다
([project-grid.md](../design/patterns/project-grid.md), [spacing-radius.md](../design/foundations/spacing-radius.md)).
**존재하지 않는 레이아웃 알고리즘을 기술하는 토큰이다.**

- 판정 필요: 열 수 고정 모델로 규범을 정정하고 토큰을 폐기할지, capacity 모델을 제품에 도입할지.

### 1-3. 라이트 팔레트가 앱 셸 스코프에서 통째로 재정의된다

제품은 `body:has(.gnb-wrapperSidebar)` 스코프에서 `--palette-gray-100~600`을 전부 다른 hex로 덮는다.
결과적으로 앱 셸 라이트 캔버스는 `#eeeef1`, 표면은 `#f8f8f9`인데 Klipse는 각각 `#f1f1f3`,
`#fafafa`다. **같은 이름의 semantic이 다른 값을 가리킨다.**

다크는 일치한다 — 캔버스 `#171b22`가 Klipse `color-background-canvas`(dark)와 정확히 같다.

- 판정 필요: Klipse 라이트 값을 제품에 맞출지, 제품의 스코프 재정의를 부채로 보고 제거할지.

### 1-4. 0.5px hairline 테두리에 대응하는 것이 없다

제품은 레이아웃을 밀지 않으려고 border 대신 spread-only box-shadow로 0.5px 테두리를 그린다
(`--glass-dropdown-frame`, 다크 `#575D68` / 라이트 `#D5D7DD`). 카드·드롭다운·팝오버·메인 카드가
공유하는 SSOT다.

Klipse `elevation/*` 4종은 전부 blur가 있는 drop shadow라 재현할 수 없고, `color/border-*`에도
이 다크/라이트 짝이 없다.

- 제안: `color/border-hairline` 변수 + `elevation/hairline-frame` effect style.

---

## 2. 카탈로그 — 이 화면이 요구하는 신규 component

DS-P3-009의 순서 입력이다. 괄호 안은 이 화면에서의 근거다.

| 우선 | component | 근거 |
| --- | --- | --- |
| 1 | **ProjectCard** | 화면 본체. 제품에도 공용 컴포넌트가 없고 `AppHomeScene.tsx` 안 인라인 `<article>`로만 존재한다. variant: canvas / videoedit / highlight |
| 2 | **SidebarNavItem** | 높이 32px·radius 10px·아이콘 20px·gap 10px. state 4종 + collapsed + addon + badge |
| 3 | **AppTopBar** | 좌(토글)·중(제목)·우(프로필) 3분할. **8개 씬이 공유**하는 셸 패턴이다 |
| 4 | **Menu / Popover** | manifest `figma: not-ready`. 코드에는 ActionMenu가 있으나 Figma component가 없어 배치 불가 |
| 5 | **EmptyState** | 빈 상태와 로딩 상태. manifest `figma: not-ready` |
| 6 | **Avatar** | 28px + 크레딧 progress ring |
| 7 | **Badge** | "베타" chip |
| 8 | **BannerCarousel** | 360px 히어로 3장 + 화살표 + 폭 확장형 인디케이터. 이 화면 전용 성격이 강해 pattern 후보 |

**Dialog와 Toast는 코드에 있으나 Figma component가 없다.** Dialog는 DS-F-006 대상이고, Toast는
카탈로그에 규범부터 없다.

---

## 3. 아이콘 — Wave B 입력

| 글리프 | 쓰임 | 상태 |
| --- | --- | --- |
| `magic-wand` | 사이드바 "비디오 에디터" | **이관 보류됨.** −45° 회전 rect라 `transform` 없이 표현되지 않는다(DS-D-0008 이관 노트). 이 화면이 실사용처이므로 처분 판단이 필요하다 |
| `caret-left` `caret-right` | 배너 화살표 | 미보유 |
| `caret-down` | "새로 만들기" 트리거 | 미보유 |
| `sidebar-toggle` | 사이드바 접기 | 미보유. 제품은 인라인 SVG |
| `highlight-symbol` | 사이드바 "하이라이트" | **브랜드 심볼.** DS-D-0008 결정 5에 따라 아이콘 세트가 아니다 |
| `youtube` | 사이드바 "YouTube 분석" | **상표.** 아이콘 세트가 아니다 |

카탈로그에 이미 있고 이 화면에서 그대로 쓰이는 것: `magnifying-glass`(검색) · `house`(홈) ·
`graph`(노드 캔버스) · `plus`(인라인 추가).

**아이콘 크기 12px·18px이 쓰인다.** Klipse는 16/20/24만 정의한다 — 18px은 20px로 정규화 가능해
보이지만 12px은 판정이 필요하다.

---

## 4. Figma로 표현할 수 없는 것 — 비채택 또는 근사 판정

| 항목 | 왜 |
| --- | --- |
| 카드 진입 stagger (560ms, index당 36ms) | Klipse motion은 overlay/modal enter·exit 4종뿐. 목록 진입 모션이 없다 |
| `filter: saturate/brightness` 단계 | Figma에 filter 개념이 없다 |
| 스크롤 연동 divider (0→12px 알파 보간) | 정적 style로 표현 불가. on/off 두 variant로 근사 |
| dominant-color 동적 텍스트 반전 | 런타임 휘도 계산. 밝은/어두운 두 variant로 근사 |
| 제목 오버레이 progressive blur + 5-stop mask | `backdrop-filter` + mask 조합 |
| glass inset bevel | Figma inner shadow로 근사 가능하나 DS에 style이 없다 |

---

## 5. 제품 부채 — DS가 고칠 문제가 아니다

adoption 노트로 넘긴다.

- **모달 액션 버튼이 공용 Button을 쓰지 않는다.** 삭제 확인 모달의 취소/삭제가 raw `<button>`으로
  높이 44px·radius 16px을 직접 잡는다. 공용 Button은 40px·radius 12px이다.
- **primary 버튼이 3-stop 그라디언트**이고 hover가 색이 아니라 `filter: brightness(1.06)`다.
  Klipse `color-action-primary`는 단색이다.
- **z-index 체계가 다르다.** 제품은 5 / 40 / 1100 / 1200 / 1300을 쓰고 Klipse layer 토큰은
  0 / 100 / 200 / 300 / 400이다.
- **죽은 스타일이 남아 있다.** `floatingCreateDock`·`floatingCreateButton`은 렌더되지 않는다.
  `--app-gnb-main-card-padding-block-start: 20px`은 선언만 있고 어디서도 읽지 않는다 —
  **문서만 보고 20px을 넣으면 틀린다.**
- 사이드바 항목 높이가 32px로 `layout-control-hit-target-minimum`(44px)에 못 미친다.

---

## 6. 이 화면에 **없는** 것

재조립 시 그리면 안 된다. 검색·정렬·필터·탭·세그먼트 컨트롤이 `AppHomeScene` 전체에 0건이다
(`role="tab"`은 배너 캐러셀 인디케이터뿐). 사이드바의 "검색"은 커맨드 팔레트를 여는 항목이지
화면 안 검색 입력이 아니다.

---

## 판정

**Home은 아직 gap 없이 재조립되지 않는다.** 목표 B의 검증 기준(Home·Highlight·Editor 3개 화면이
카탈로그 gap과 parity 결함 없이 재조립)에 도달하려면 최소한 §2의 1~5번 component가 Figma에
있어야 한다. 이 문서는 그 순서의 근거다.
