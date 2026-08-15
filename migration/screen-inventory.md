# Klipse 배포 화면 인벤토리

## 출처

- **제품 저장소**: `/Users/sejunki/klipse` (절대 경로), branch `louis`, 기준 commit `0d188651`
- **앱 경계**: `apps/` 하위에 `web` 하나뿐. 본 인벤토리의 모든 상대 경로는 제품 저장소 기준이다.
- **조사일**: 2026-08-14. 5개 병렬 조사(route 지도 / 공용 셸·컴포넌트 / Editor·Highlight / 아이콘 / 토큰·스타일)를 통합했다.
- **워킹트리 상태 경고**: 조사 시점 제품 저장소 워킹트리는 dirty였다. `apps/web/app/globals.css`, `DESIGN_SYSTEM.md`, `apps/web/scripts/check-design-system.mjs`가 미커밋 수정 상태였고, **제품 저장소의 `design/` 디렉터리 전체가 untracked(`??`)** 였다. 따라서 "제품 저장소에 이미 design 디렉터리와 manifest가 있다"는 것은 커밋된 사실이 아니라 조사 시점의 로컬 작업 상태다. 아래 §토큰/스타일 관찰의 `design/**` 관련 서술은 전부 이 전제 위에 있다.

**이 문서의 지위**

- 이 문서는 **비규범 reference**다. Klipse Design System의 규범(Foundation, Component, Pattern, Governance)이 아니며, manifest의 상태 판정 근거로 쓰지 않는다.
- **제품 코드를 이 저장소로 복사하지 않는다.** 여기에는 제품의 파일 경로, 구조적 사실, 개수, 관측된 계약만 기록한다. 구현 코드, 스타일 문자열, 토큰 값의 정의부를 옮겨 적지 않는다.
- 제품의 현재 상태는 "따라야 할 기준"이 아니라 "규범이 마주할 현실"이다. 특히 아래에 기록된 중복·부채·접근성 결함은 규범화 대상이 아니라 **규범이 해소해야 할 대상**이다.
- 이 문서의 모든 사실은 **소스 읽기 결과**이며 브라우저 실측 렌더는 하지 않았다.

---

## 화면 지도

### Home / Highlight / Editor — 셋 다 1:1이 아니다

세 이름 모두 단일 route에 대응하지 않는다. 카탈로그 pattern의 정본 대상을 고를 때 아래 분기를 먼저 확정해야 한다.

#### "Home" — 후보 3개

| 후보 | route | 실제 성격 | 판정 |
|---|---|---|---|
| **A. 앱 홈** | `/archive` | 사이드바 첫 항목, 한국어 라벨이 문자 그대로 "홈". `apps/web/lib/app-paths.ts`가 `APP_HOME_PATH = "/archive"`로 SSOT 선언. scene 이름은 `AppHomeScene`. route 이름(`archive`)과 화면 이름(홈)이 어긋나 있고, 코드 주석이 "예전 '아카이브'는 라우트명이 샌 것"이라 기록 | **`project-grid`·`app-shell` 패턴의 정본 대상** |
| B. 마케팅 랜딩 | `/` | 컴포넌트 이름이 `HomePage`/`HomePageClient`이지만 내용은 Hero·FAQ·Footer의 공개 랜딩 | 별개의 마케팅 표면으로 분리 취급 |
| C. 노드 캔버스 허브 | `/nodecanvas` | scene 이름이 `NodeCanvasHomeScene`. "노드 캔버스의 홈"이지 앱 전체 홈이 아님 | 허브 4종 중 하나로 취급 |

#### "Highlight" — 셸 2개 × 화면 3층

| 후보 | route | 성격 |
|---|---|---|
| **H1. 하이라이트 허브** | `/highlight` | 메인 앱 셸. 업로드 진입 + 히스토리 그리드 |
| **H2. 하이라이트 프로젝트 상세** | `/highlight/[projectId]` | **저장소 최대 화면(3,651줄)**. 8상태 phase 머신. "Highlight 화면"이라 부를 때 실질적으로 이것일 가능성이 높다 |
| H3. 숏폼 클립 편집 | `/highlight/[projectId]/shorts/[shortId]` | Highlight의 하위 단계이면서 동시에 Editor 성격 |
| H4. 독립 셸 대시보드 | `/hl` | H1+H2를 **라우트 이동 없이 state로** 합친 화면. `history.pushState`로 URL만 바꾼다. 자체 헤더 + light 테마 강제 |
| H5. 하이라이트 전용 랜딩 | `/hl-landing` | 공개 마케팅. sitemap 등록됨 |

**결정 분기점**: `/highlight`(메인 셸)와 `/hl`(독립 셸)은 **같은 scene 컴포넌트를 공유하지만 셸·테마·전환 애니메이션이 다르다.** 같은 화면으로 취급하면 Figma parity 검증이 깨진다. 재조립 전에 어느 셸 기준인지 반드시 고정해야 한다.

#### "Editor" — 성격이 다른 3개

| 후보 | route | 성격 |
|---|---|---|
| **E1. 노드 캔버스 에디터** | `/nodecanvas?project=<id>` / `?new=1` | 노드 그래프 기반 생성 캔버스. **라우트 세그먼트가 아니라 쿼리스트링으로 허브↔에디터가 갈린다** — route 트리만 봐서는 보이지 않는다 |
| **E2. 비디오 에디터(타임라인)** | `/videoeditor/[projectId]` | 클립·오버레이·오디오 트랙·트랜지션·마커. 이름에 "editor"가 들어간 유일한 route |
| E3. 숏폼 클립 에디터 | `/highlight/[projectId]/shorts/[shortId]` | 자막·워터마크 중심 경량 편집. E2와 같은 편집 본체를 공유 |

**결정 분기점**: `editor-workspace` 패턴이 타임라인·트랙·플레이헤드를 뜻하면 **E2**, 노드 그래프·캔버스·툴바를 뜻하면 **E1**이다. 그리고 E1·E2·E3는 편집 모달·플랜 게이트·확인 모달을 **노드 캔버스 디렉터리 하위에서 공유**한다 — 비디오 에디터 자산이 노드 캔버스 디렉터리 안에 살고 있다. 이 위치 불일치를 카탈로그 경계로 복사하면 안 된다.

### 전체 route 목록

#### 앱 셸 route (로그인 후 · 사이드바 있음)

셸 노출 경로 SSOT는 `apps/web/lib/app-paths.ts`의 `APP_SHELL_PATH_PREFIXES`: `/archive`, `/nodecanvas`, `/videoeditor`, `/highlight`, `/analytics`, `/settings`, `/subscription`, `/mypage`.
사이드바 메뉴 순서: `/archive` → `/nodecanvas` → `/videoeditor` → `/highlight` → (분석 eyebrow) → `/analytics/youtube` → `/analytics/instagram`.

| route | 화면 | 구현 소유 파일 | 규모 |
|---|---|---|---|
| `/archive` | 앱 홈 | `apps/web/components/scenes/AppHomeScene.tsx` | 1,433줄 |
| `/nodecanvas` | 노드 캔버스 허브 | `apps/web/components/scenes/NodeCanvasHomeScene.tsx` | 1,668줄 |
| `/nodecanvas?project=` `?new=1` | 노드 캔버스 에디터 | `apps/web/components/scenes/CreateScene.tsx` + `.../create/node-canvas-v2/index.tsx` | 1,025줄 + 11,307줄 |
| `/videoeditor` | 비디오 에디터 허브 | `apps/web/components/scenes/VideoEditScene.tsx` | 989줄 |
| `/videoeditor/[projectId]` | 비디오 에디터 워크스페이스 | `apps/web/app/videoeditor/[projectId]/EditorProjectWorkspace.tsx` | 1,318줄 |
| `/highlight` | 하이라이트 허브 | `apps/web/components/scenes/HighlightScene.tsx` | 1,572줄 |
| `/highlight/[projectId]` | 하이라이트 프로젝트 상세 | `apps/web/components/scenes/HighlightProjectScene.tsx` | **3,651줄** |
| `/highlight/[projectId]/shorts/[shortId]` | 숏폼 클립 편집 | 라우트 파일 자체 + `CaptionColorPanel.tsx` | 1,389줄 + 246줄 |
| `/analytics/youtube` | YouTube 분석 | `apps/web/components/scenes/YoutubeAnalyticsScene.tsx` + `scenes/analytics/` | 2,381줄 |
| `/analytics/instagram` | Instagram 분석 — **미배포**(플래그 차단) | `apps/web/components/scenes/InstagramAnalyticsScene.tsx` | 1,990줄 |
| `/settings` | 설정 | `apps/web/components/scenes/SettingsScene.tsx` | 1,968줄 |
| `/subscription` | 구독/크레딧 | `apps/web/components/scenes/SubscriptionScene.tsx` | 1,331줄 |
| `/explore` | **미배포** — page·middleware 양쪽에서 `/archive`로 redirect | `ExploreScene.tsx`(70줄, 라우트에서 미참조) | — |
| `/mypage` | `/settings`로 redirect (레거시 별칭) | — | — |

#### 결제/빌링 부수 화면 (`/mypage/**`, 9개)

`/mypage/upgrade`(744줄) · `/mypage/upgrade/checkout` · `/mypage/upgrade/billing-success`(526줄) · `billing-fail` · `billing-change-success` · `billing-change-fail` · `fail` · `/mypage/topup/success` · `/mypage/topup/fail`.
전부 앱 셸을 직접 렌더하는 route-local 화면이며 scene 계층을 거치지 않는다. 공통 카피 소스 1개를 공유한다.

#### 인증 / 온보딩 (10개)

`/login`(641줄) · `/signup`(739줄) · `/signup/check-email` · `/signup/verified` · `/signup/expired` · `/recover` · `/reset-password` · `/reset-password/new` · `/aws/signup`(688줄, **AWS Squid Ink 고정 테마 — 앱 테마 미적용**) · `/auth/callback`(route handler, UI 없음).

#### 공개 마케팅 / 문서 (15개)

`/` · `/pricing` · `/docs` · `/docs/highlight` · `/docs/nodecanvas` · `/docs/videoeditor` · `/blog` · `/blog/[slug]` · `/templates` · `/templates/[slug]` · `/inquiry`(790줄) · `/terms` · `/privacy` · `/data-deletion-status`.
sitemap이 노출하는 공개 URL은 `/`, `/hl-landing`, `/inquiry`, `/privacy`, `/terms` 5개뿐이다. `/pricing`·`/docs`·`/blog`·`/templates`는 미등록(사유 미확인).

#### `(highlight-standalone)` route group — 하이라이트 독립 제품 셸 (7개)

`/hl-landing` · `/hl-login` · `/hl-signup` · `/hl-signup/check-email` · `/hl` · `/hl/[projectId]` · `/hl/youtube-result`(폐기, `/hl`로 replace).
그룹 레이아웃(210줄)이 자체 헤더·줌 트랜지션·**light 테마 강제**를 소유한다. 메인 앱 사이드바를 쓰지 않는 별도 셸이며, `apps/web` 전체에 남은 5개 CSS Module(1,468줄)이 전부 여기에 있다. 제품 문서가 이 그룹을 **범위 밖/삭제 예정**으로 이미 선언했다.

#### 관리자 / 시스템

`/admin`(2,205줄, 탭형 콘솔 — 배너·블로그·자막 템플릿·문의·잡 모니터·제품 지표·환불·템플릿·모델별 사용량 9개 관리 화면) · 런타임 에러 경계 · 전역 에러 경계(인라인 스타일 자체 완결) · 404 · robots/sitemap · 루트 레이아웃(Provider 스택 7종 + 전역 배너).
API route handler 약 130개는 화면이 아니므로 목록화하지 않았다.

### 접근 제어 요약

- **게스트 전용**(로그인 시 redirect): `/login`, `/signup`, `/aws/signup`, `/recover` → `/archive` / `/hl-login`, `/hl-signup` → `/hl`
- **보호**(비로그인 시 redirect): `/archive`, `/create`, `/analytics`, `/dashboard`, `/mypage`, `/settings`, `/subscription` → `/login` / `/hl`, `/hl/*` → `/hl-login`
- **페이지 내부 분기**(middleware 미개입): `/nodecanvas`, `/videoeditor`, `/highlight` — 각 서버 컴포넌트가 인증 조회 후 비로그인 시 `/`로 redirect
- **차단**: `/explore*` → `/archive`, `/analytics/instagram*` → `/analytics/youtube`
- **관리자**: `/admin*` — 환경변수 이메일 대조, 미달 시 `/archive`

### 구조적 핵심 3가지

1. **route 파일은 거의 전부 얇은 껍데기다.** 실제 화면 구현은 `apps/web/components/scenes/*Scene.tsx`가 소유한다. 라우트는 인증 분기, metadata, 네비게이션 어댑터 역할만 한다. → **카탈로그 우선순위와 Figma 재조립 대상은 route가 아니라 scene이다.**
2. **route group layout은 전부 `return children` + metadata뿐이다.** 사이드바/헤더는 Next 레이아웃이 아니라 **각 Scene이 직접 셸 컴포넌트를 렌더**한다. `app-shell`이 코드상 공유 레이아웃으로 존재하지 않는다.
3. **앱 셸 소유자는 `apps/web/components/navigation/Gnb.tsx` 단일 파일(5,572줄)이다.** 사이드바 + 상단 크롬 바 + 프로필 팝오버 + 커맨드 팔레트 트리거 + 언어/테마 전환이 전부 여기 있다. 파일 앞 약 2,000줄은 CSS Module에서 옮겨온 스타일 문자열 맵이다.

---

## 화면별 구성 요소

입도 기준: **카탈로그 component/pattern 후보가 될 수 있는 최소 단위**. 카탈로그 ID는 현행 8 component(`button` `dialog` `menu-popover` `input` `select` `tooltip` `toast` `empty-state`) + 4 pattern(`app-shell` `project-grid` `editor-workspace` `loading`) 기준이다.

### 공통 — 앱 셸 (모든 앱 셸 route에 등장)

| 구성 요소 | 제품 구현 위치 | 카탈로그 ID | 비고 |
|---|---|---|---|
| 좌측 사이드바 컨테이너 | `components/navigation/Gnb.tsx` | `app-shell` | 접힘 상태를 localStorage에 저장. 파일 하나가 셸 전체를 소유 |
| 사이드바 메뉴 항목 + 활성 인디케이터 | `components/navigation/Gnb.tsx` | 카탈로그에 없음 (nav-item) | 활성 인디케이터가 슬라이딩 지오메트리 계산으로 구현 |
| 사이드바 아이콘 (mask 방식) | `components/navigation/Gnb.tsx` | 카탈로그에 없음 (icon / icon-mask) | 20px 고정 + `currentColor` 배경. 동일 패턴이 최소 7곳에 복붙 |
| 사이드바 접기 토글 | `components/navigation/Gnb.tsx` | 카탈로그에 없음 (icon-button) | `/videoeditor/[id]` 진입 시 자동 접힘, 이탈 시 복원 |
| 상단 크롬 바 | `components/navigation/Gnb.tsx` | `app-shell` | 사이드바 토글 + breadcrumb + 프로필 클러스터 |
| breadcrumb | `components/navigation/Gnb.tsx` | 카탈로그에 없음 (breadcrumb) | prop 1개로 현재 항목만 주입 |
| 프로필 아바타 | `components/navigation/Gnb.tsx`(인라인) + `navigation/UserCircleDefaultAvatar.tsx` | 카탈로그에 없음 (avatar) | 아바타 컴포넌트 자체가 셸 파일에 인라인, 기본 아바타 SVG만 분리 |
| 프로필 팝오버 | `components/navigation/Gnb.tsx` | `menu-popover` | 제품 manifest가 `menu-popover`의 정본 web 소스로 지정한 곳 |
| 언어 전환 메뉴 | `components/navigation/Gnb.tsx`, `components/landing/system/LanguageSelector.tsx` | `menu-popover` / `select` | 앱·랜딩 2벌 |
| 테마 전환 | `components/navigation/Gnb.tsx` + `components/theme/ThemeProvider.tsx` | 카탈로그에 없음 (theme toggle) | — |
| 업그레이드 CTA | `components/navigation/Gnb.tsx` | `button` | — |
| 커맨드 팔레트 | `components/navigation/CommandPalette.tsx` (952줄) | 카탈로그에 없음 (command-palette) | cmdk 미사용, 전량 자체 구현 |
| 슬롯 주입 크롬 | `components/navigation/Gnb.tsx` (`mainChromeSlot` / `chromeActionsPortal` / `mainChromeProfileLeading`) | 카탈로그에 없음 (slot-injection chrome) | **셸이 DOM 슬롯을 노출하고 자식 화면이 액션을 역주입하는 양방향 패턴.** `app-shell` 규범이 반드시 다뤄야 할 계약 |
| 연체 배너 | `components/PastDueBanner.tsx` | 카탈로그에 없음 (banner / alert) | 루트 레이아웃 전역 |
| Provider 스택 (인증·테마·i18n·생성·업로드·연동 7종) | `components/<feature>/` 각처 | 카탈로그에 없음 | `app-shell` 패턴의 필수 전제이나 규범에 없음 |
| 랜딩 셸(별개 사본) | `components/landing/navigation/Gnb.tsx` (1,010줄) | `app-shell` (별개) | 앱 셸과 **다른 계보**. 같은 규범으로 묶으면 안 됨 |
| 랜딩 데모 정적 복제본 | `components/landing/demo-snapshots/StaticGnb.tsx` | — | 셸의 **4번째 사본** |

### `/archive` — 앱 홈

| 구성 요소 | 제품 구현 위치 | 카탈로그 ID | 비고 |
|---|---|---|---|
| 홈 배너 슬라이드 | `components/banners/HomeBannerSlide.tsx` | 카탈로그에 없음 (banner) | — |
| 배너 캐러셀 | `components/banners/TabBannerCarousel.tsx` | 카탈로그에 없음 (carousel) | 저장소 3벌 중 1벌 |
| 프로젝트 카드 그리드 | `components/scenes/AppHomeScene.tsx` | `project-grid` | 4개 허브 중 하나. 모델은 공유, 렌더는 각자 |
| 프로젝트 카드 | `components/scenes/project-home/projectHomeModels.ts`(모델) + 각 scene(렌더) | 카탈로그에 없음 (card) | 상대시간 포맷·생성중 상태 판정을 4개 허브가 공유 |
| 가로 레일 스크롤 셸 | `ArchiveRailScrollShell` | 카탈로그에 없음 (scroll shell) | — |
| 새로 만들기 메뉴 | `components/scenes/HomeCreateNewMenu.tsx` | `menu-popover` | mask 아이콘 패턴 복제 지점 |
| 새 프로젝트 모달 | `components/projects/CreateProjectModal.tsx` | `dialog` | 공유 모듈 CSS 셸을 3개 소비자가 쓰는 **별개 계보** |
| 하이라이트 생성 모달 | `components/scenes/HighlightCreateModal.tsx` | `dialog` | — |
| 기본 버튼 | `components/ui/Button.tsx` | `button` | 제품의 유일한 정식 버튼. variant 4 / size 2 / 아이콘 슬롯 2 |
| 토스트 | `components/scenes/appHomeSceneStyles.ts` | `toast` | **자체 정의.** 6벌 중복 중 1벌 |
| 로딩(쉬머 워드) | `components/scenes/NodeCanvasHomeScene.tsx` 계열 상수 | `loading` | 3곳 복제 |
| 빈 상태 | scene 내부 | `empty-state` | 페이지 빈 상태에는 아이콘을 넣지 않는 규칙이 제품 문서에 기록됨 |
| 플랫폼 배지 | `components/scenes/archive/PlatformSection.tsx` | 카탈로그에 없음 (badge) | 하드코딩 색 사용처 |
| 아카이브 썸네일(Canvas 렌더) | `.../node-canvas-v2/lib/archiveThumbnail/` | 카탈로그에 없음 | CSS 변수 접근 불가 → 색 하드코딩이 구조적 제약 |

### `/nodecanvas` — 노드 캔버스 허브

| 구성 요소 | 제품 구현 위치 | 카탈로그 ID | 비고 |
|---|---|---|---|
| 탭 배너 캐러셀 | `components/banners/TabBannerCarousel.tsx` | 카탈로그에 없음 (carousel) | 허브 3곳 공유 |
| 캔버스 프로젝트 그리드 | `components/scenes/NodeCanvasHomeScene.tsx` | `project-grid` | 변종 2/4 |
| 새 프로젝트 모달 | `components/projects/CreateProjectModal.tsx` | `dialog` | — |
| 토스트 | `NodeCanvasHomeScene.tsx` 내 상수 | `toast` | **애니메이션 키프레임 이름이 다른 계열** |
| 로딩 워드 | `NodeCanvasHomeScene.tsx` 내 상수 | `loading` | — |
| 썸네일 하단 톤 계산 | `useThumbnailBottomTone` | 카탈로그에 없음 | 허브 2곳 공유 |

### `/nodecanvas?project=` — 노드 캔버스 에디터 (E1)

캔버스 본체 서브트리는 **164개 파일 / 약 86,264줄**, 진입 파일 하나가 11,307줄이다.

| 구성 요소 | 제품 구현 위치 | 카탈로그 ID | 비고 |
|---|---|---|---|
| 프로젝트 헤더(노드 모드 상단 크롬) | `components/scenes/create/ProjectHeader.tsx` (670줄) | `app-shell` 변종 | 셸 대신 고정 헤더를 직접 렌더 |
| 프로젝트명 인라인 편집 | `ProjectHeader.tsx` + 셸 rename prop 묶음 | 카탈로그에 없음 (inline-edit) | — |
| 저장 상태 글리프 | `components/navigation/ProjectSaveCloudGlyph.tsx` | 카탈로그에 없음 (status glyph) | — |
| 캔버스 뷰포트 | `.../node-canvas-v2/index.tsx` (`@xyflow/react`) | `editor-workspace` | 좌표계 3개(뷰포트 fixed / 뷰포트 포털 / 섹션 상대) |
| 캔버스 배경(dot grid) | `.../components/CanvasBackground.tsx` | 카탈로그에 없음 | — |
| 노드 9종 (video/image/text/youtube/instagram/edit/tts/bgm/section) | `.../node-canvas-v2/nodes/*.tsx` | 카탈로그에 없음 (canvas node) | `editor-workspace` 소속 |
| 엣지 + 프리뷰 연결선 | `.../edges/` | 카탈로그에 없음 | — |
| 캔버스 툴바 | `.../components/Toolbar.tsx` | 카탈로그에 없음 (toolbar) | 참조 10파일 |
| 줌 컨트롤 | `.../components/CanvasZoomControl.tsx` | 카탈로그에 없음 (zoom control) | ≤719px에서 숨김 |
| 미니맵 | `.../index.tsx` 내부 | 카탈로그에 없음 (minimap) | — |
| 레이어 패널 | `.../components/NodeLayersPanel.tsx` (539줄+) | 카탈로그에 없음 (side panel) | — |
| 스마트 가이드 오버레이 | `.../components/SmartGuideOverlay.tsx` | 카탈로그에 없음 (alignment guide) | 하드코딩 색 사용처 |
| 캔버스 빈 상태 | `.../components/CanvasEmptyState.tsx` | `empty-state` | 64px 글리프 + 중립색 규칙이 제품 문서에 기록됨 |
| 온보딩 힌트 3종 | `.../components/CanvasOnboardingHints.tsx` | 카탈로그에 없음 (coachmark) | — |
| 워크스루 오버레이 5종 | `.../Walkthrough*ConnectOverlay.tsx` | 카탈로그에 없음 (product tour) | — |
| 노드 컨텍스트 메뉴 / 팬 컨텍스트 메뉴 | `.../components/NodeContextMenu.tsx`, `PaneContextMenu.tsx` | `menu-popover` | — |
| 노드 더보기 메뉴 | `.../components/NodeMoreMenu.tsx` | `menu-popover` | — |
| 메타 드롭다운 패널 | `.../components/MetaDropdownPanel.tsx` | `menu-popover` | **참조 16파일 — 가장 널리 쓰이는 팝오버. 사실상의 정본 후보** |
| 페이지 메타 드롭다운 | `.../components/PageMetaDropdownPanel.tsx` | `menu-popover` | — |
| 프로젝트 영상 팝오버 | `.../components/ProjectVideosPopover.tsx` | `menu-popover` | — |
| 비디오 모델 메뉴 | `.../nodes/VideoModelMenu.tsx` | `menu-popover` | 공급자 로고 이미지 래퍼 포함 |
| 컬러 팝오버 + 스와치 버튼 | `.../nodes/ColorPopover.tsx` | `menu-popover` + 카탈로그에 없음 (color picker) | — |
| 예약 날짜/시간 피커 | `.../components/YoutubeSchedulePickers.tsx` | `menu-popover` + 카탈로그에 없음 (date/time picker) | — |
| 툴팁 | `.../components/ChromeTooltip.tsx` | `tooltip` | **제품의 사실상 정본, 참조 13파일.** 전역 CSS 클래스와 결합 |
| 글래스 확인 모달 | `.../components/GlassConfirmModal.tsx` | `dialog` | 제품 manifest가 지정한 정본 web 소스 |
| 구 확인 모달 | `components/scenes/create/ConfirmModal.tsx` | `dialog` | **구 계보. 신·구 2갈래 병존** |
| 크레딧 확인 모달 | `.../components/CreditConfirmModal.tsx` | `dialog` | 체크박스 스타일 문자열을 export |
| 노드 삭제 확인 모달 | `.../components/NodeDeleteConfirmModal.tsx` | `dialog` | — |
| 플랜 게이트 모달 | `.../components/PlanGateModal.tsx` | `dialog` | 참조 12파일 |
| 가격 모달 | `components/scenes/create/PricingModal.tsx` | `dialog` | — |
| 이미지 크롭 모달 / 크롭 모달 / 배치 크롭 | `create/ImageCropModal.tsx`, `.../nodes/CropModal.tsx` | `dialog` | 크롭 라이브러리 1건 + 자체 구현 병존 |
| 이미지 라이트박스 | `components/scenes/create/ImageLightbox.tsx` | `dialog` (라이트박스 변종) | — |
| 프롬프트 변형 비교 모달 | `.../components/PromptVariantCompareModal.tsx` | `dialog` | — |
| 가이드 모달 + 패널 6종 | `create/NodeCanvasGuideModal.tsx`, `create/guide/*.tsx` | `dialog` | — |
| 분석 모달 | `.../NodeCanvasAnalysisModal.tsx` | `dialog` | — |
| 생성 버튼(FAB) | `.../components/NodePromptGenerateButton.tsx` | 카탈로그에 없음 (FAB) | 기본 버튼의 primary 그라디언트 SSOT를 CSS 변수로 공유 |
| 액션 버튼 | `.../components/ActionButton.tsx` | 카탈로그에 없음 (icon-button) | 기본 버튼과 **별개 계보** |
| 복사 버튼 | `.../components/NodePromptInputCopyButton.tsx` | 카탈로그에 없음 (copy button) | 템플릿 화면에 또 하나의 계보가 있음 |
| 노드 헤더 액션 | `.../components/NodeHeaderActions.tsx` | 카탈로그에 없음 | — |
| 노드 제목 편집 라벨 | `.../components/NodeTitleEditableLabel.tsx` | 카탈로그에 없음 (editable label) | — |
| 프롬프트 리사이즈 핸들 | `.../components/NodePromptResizeHandle.tsx` | 카탈로그에 없음 (resize handle) | — |
| 프롬프트 연결 이미지 스트립 | `.../components/PromptLinkedImageStrip.tsx` | 카탈로그에 없음 (thumbnail strip) | — |
| 참조 태그 칩 | `components/scenes/create/ReferenceTagChips.tsx` | 카탈로그에 없음 (chip / tag) | — |
| 숏 캐러셀 | `components/scenes/create/ShotCarousel.tsx` | 카탈로그에 없음 (carousel) | 3벌 중 2벌 |
| 사진 그리드 | `components/scenes/create/PhotoGrid.tsx` | 카탈로그에 없음 (media grid) | — |
| 커스텀 드롭다운 | `components/scenes/create/CustomDropdown.tsx` | `select` | **제품 코드에서 select에 가장 가까운 단일 정본.** 검색·푸터 슬롯·배치 3방향·포털 비활성 옵션 보유 |
| 토스트 | `CreateScene.tsx` 내 상수 | `toast` | 6벌 중 1벌 |
| 로딩 블로커 / 로딩 워드 | `CreateScene.tsx` 내 상수 | `loading` | — |

> **모드 축 2개**: `CreateScene`은 `viewMode`(default/node)로 두 렌더 트리를 완전히 가른다(기본값 node). 캔버스 자체도 인터랙티브/정적(랜딩·워크스루) 플래그로 툴바·레이어 패널·빈 상태·힌트·드롭 오버레이가 통째로 켜지고 꺼진다.

### `/videoeditor` — 비디오 에디터 허브

| 구성 요소 | 제품 구현 위치 | 카탈로그 ID | 비고 |
|---|---|---|---|
| 탭 배너 캐러셀 | `components/banners/TabBannerCarousel.tsx` | 카탈로그에 없음 (carousel) | — |
| 편집 프로젝트 그리드 | `components/scenes/VideoEditScene.tsx` | `project-grid` | 변종 3/4 |
| 글래스 확인 모달 | `.../components/GlassConfirmModal.tsx` | `dialog` | — |
| 프로젝트 피커 | `components/scenes/VideoEditProjectPicker.tsx` (540줄) | 카탈로그에 없음 (file picker) | 파인더형 폴더/브레드크럼 글리프 자체 정의 |
| 토스트 | `VideoEditScene.tsx` 내 상수 | `toast` | 6벌 중 1벌 |

### `/videoeditor/[projectId]` — 비디오 에디터 워크스페이스 (E2)

편집 본체는 **단일 파일 23,060줄**이며, 스타일이 파일 내 약 280키 맵으로 인라인 전개돼 있다.

| 구성 요소 | 제품 구현 위치 | 카탈로그 ID | 비고 |
|---|---|---|---|
| route 셸 골격 (페이지/패널/메인/헤더 슬롯/스크롤 스택/모달 호스트) | `app/videoeditor/[projectId]/EditorProjectWorkspace.tsx` | `app-shell` | **숏폼 화면이 같은 골격을 독립 정의로 복제**하고 있음 |
| 편집 워크스페이스 그리드 (assets / preview / properties / timeline) | `.../nodes/VideoEditModal.tsx` | `editor-workspace` | **영역 계약이 컴포넌트 경계가 아니라 한 파일 안의 grid-area 문자열 하나로만 표현됨** |
| 에셋 패널 + 에셋 레일 탭(video/image/audio/text) | 같은 파일 | 카탈로그에 없음 (asset panel / tabs) | — |
| 리사이즈 디바이더 3축 (에셋 / 속성 / 타임라인) | 같은 파일 | 카탈로그에 없음 (resizable pane) | `role="separator"` + 포인터 드래그 + CSS 변수 폭. **3축 반복** |
| 프리뷰 영역 + 프리뷰 컨트롤 + 하단 바 | 같은 파일 | 카탈로그에 없음 (player chrome) | — |
| 타임라인 워크벤치 / 트랙 레인 / 룰러 | 같은 파일 + `.../videoEditParts/sequenceRuler.tsx` | 카탈로그에 없음 (timeline / track lane) | — |
| 오디오 파형 | `.../videoEditParts/AudioClipWaveform.tsx` | 카탈로그에 없음 (waveform) | canvas 자체 구현 |
| 클립 필름스트립 | `.../videoEditParts/clipFilmstrip.tsx` | 카탈로그에 없음 (filmstrip) | — |
| 속성(인스펙터) 패널 — 선택 종류별 4분기 | 같은 파일 | 카탈로그에 없음 (inspector) | — |
| 인스펙터 프리미티브 (숫자 입력 / 알약 / 지표) | `.../videoEditParts/inspectorPrimitives.tsx` | 부분적으로 `input` | **`NumberInput`이 저장소의 유일한 공용 입력 프리미티브** |
| 인스펙터 툴팁 | `.../videoEditParts/inspectorPrimitives.tsx` | `tooltip` | **툴팁 두 번째 구현** — 캔버스 툴팁과 별개 계보(라이브러리 기반) |
| 효과 탭 행 | `.../videoEditParts/effectsTabRow.tsx` | 카탈로그에 없음 (tabs) | — |
| 클립 크롭 모달 | `.../videoEditParts/ClipCropModal.tsx` | `dialog` | 슬라이더 라이브러리 사용 |
| 단축키 도움말 다이얼로그 | 같은 파일 | `dialog` | **23,060줄 전체에서 유일하게 `role="dialog"` + `aria-modal`을 가진 곳** |
| 플랜 게이트 모달 | `.../components/PlanGateModal.tsx` | `dialog` | — |
| 글래스 확인 모달 | `.../components/GlassConfirmModal.tsx` | `dialog` | — |
| 공용 비디오 플레이어 | `components/ui/VideoPlayer.tsx` (41KB) | 카탈로그에 없음 (video-player) | UI 변종 2 + 톤 2. 참조 8파일 |
| 체험판 워터마크 | `useTrialWatermark` | 카탈로그에 없음 | — |
| 토스트 | 같은 파일 내 자체 정의 | `toast` | — |

> **모드 판별이 값의 진위 하나에 매달려 있다.** 포털 컨테이너 prop의 null 여부가 포털 대상, 위치 방식, z-index, 백드롭, ESC 닫기, 백드롭 클릭 닫기, 헤더 위치·존재, 확인 버튼 라벨을 **동시에** 결정한다. 그 위에 두 번째 축(독립 프로젝트 선택 여부)이 얹혀 `/videoeditor`와 숏폼 화면을 다시 가른다. `editor-workspace` 규범이 route/modal 모드를 나눠 쓴 것은 코드 상태와 일치하며, 필요한 것은 재작성이 아니라 실측 근거 보강이다.

### `/highlight` — 하이라이트 허브 (H1)

| 구성 요소 | 제품 구현 위치 | 카탈로그 ID | 비고 |
|---|---|---|---|
| 업로드 카드 + 드롭존 | `components/scenes/HighlightScene.tsx` | 카탈로그에 없음 (file upload / dropzone) | — |
| 업로드 글리프 | 같은 파일(지역 정의) + mask 패턴 | 카탈로그에 없음 (icon) | mask 복제 지점 |
| 테마 선택 행 + 드롭다운(스포츠 플라이아웃 포함) | 같은 파일 | `menu-popover` / `select` | 중첩 플라이아웃 보유 |
| 히스토리 섹션 / 그리드 / 카드 | 같은 파일 | `project-grid` | 변종 4/4 |
| 히스토리 카드 드롭다운 | 같은 파일 | `menu-popover` | — |
| 탭 배너 캐러셀 | `components/banners/TabBannerCarousel.tsx` | 카탈로그에 없음 (carousel) | — |
| 생성 버튼 | `.../components/NodePromptGenerateButton.tsx` | 카탈로그에 없음 (FAB) | **캔버스 밖 화면이 캔버스 디렉터리에서 역수입** |
| 업로드 전역 상태 | `HighlightUploadProvider`, `highlightFileStore` | 카탈로그에 없음 | — |
| 줌 전환 | `useHighlightTransition`, `HighlightTransitionProvider` | 카탈로그에 없음 (transition) | 최상위 오버레이 레이어 점유 |
| 토스트 | `components/scenes/highlightSceneStyles.ts` | `toast` | 6벌 중 1벌 |

> 스타일은 95KB / 키 203개짜리 문자열 맵 하나가 소유하고, 허브·상세·랜딩 데모 3곳이 공유한다.

### `/highlight/[projectId]` — 하이라이트 프로젝트 상세 (H2, 저장소 최대 화면)

| 구성 요소 | 제품 구현 위치 | 카탈로그 ID | 비고 |
|---|---|---|---|
| 8상태 phase 머신 (loading/uploading/upload/analyzing/reviewed/extracting/completed/failed) | `components/scenes/HighlightProjectScene.tsx` | `loading` (부분) | **로딩·분석·실패 상태 전이가 한 화면 안에 8단계로 존재.** `loading` 패턴의 최대 검증 대상 |
| 리뷰 카드 + 세그먼트 체크박스 리스트 | 같은 파일 | 카탈로그에 없음 (checkbox / list) | 체크박스는 전역 CSS 클래스로만 존재 |
| 결과 카드 + 클립 리스트 + 상세 플레이어 | 같은 파일 | 카탈로그에 없음 (list-detail) | — |
| 그리드/리스트 뷰 토글 | 같은 파일 | 카탈로그에 없음 (segmented-control) | `role="group"` + data 속성. 별도 세그먼트 컴포넌트와 **중복 계보** |
| 클립 상세 모달 | 같은 파일 | `dialog` | 포털 |
| 합성 프리뷰 플레이어(자체 크롬: 스크림/중앙/하단/타임라인/진행) | 같은 파일 | 카탈로그에 없음 (player chrome) | 공용 플레이어와 **별개 구현** |
| AI 다듬기 플로팅 위젯 | 같은 파일 + `scenes/highlight/useClipRefinement.ts` | 카탈로그에 없음 (floating panel) | 드래그 + 투명도 슬라이더, 값을 localStorage에 저장 |
| 플랜 게이트 모달 | `.../components/PlanGateModal.tsx` | `dialog` | — |
| 공용 비디오 플레이어 | `components/ui/VideoPlayer.tsx` | 카탈로그에 없음 (video-player) | — |
| 기본 버튼 | `components/ui/Button.tsx` | `button` | — |
| 생성 스파클 글리프 | 같은 파일(지역 정의) | 카탈로그에 없음 (icon) | — |

> 이 화면 하나가 스타일 맵 **3개**(하이라이트 + 마이페이지 + 앱 홈)를 동시에 얹는다. 한국어 `aria-label` 하드코딩이 최소 4건 남아 있다(i18n 누수).

### `/highlight/[projectId]/shorts/[shortId]` — 숏폼 클립 편집 (H3 = E3)

| 구성 요소 | 제품 구현 위치 | 카탈로그 ID | 비고 |
|---|---|---|---|
| route 셸 골격 | 라우트 파일 내 독립 상수 | `app-shell` | **비디오 에디터 워크스페이스 골격의 복제본** |
| docked 편집 워크스페이스 | `.../nodes/VideoEditModal.tsx` (포털 컨테이너 주입) | `editor-workspace` | 헤더 숨김 + 액션을 셸 슬롯으로 역주입 |
| 자막 템플릿/레이아웃 패널 (추가 탭 주입) | 라우트 파일 | 카탈로그에 없음 (panel tabs 확장 슬롯) | 편집 본체가 외부 탭 주입을 받는 계약 |
| 자막 색상 패널 | `.../shorts/[shortId]/CaptionColorPanel.tsx` (246줄) | 카탈로그에 없음 (color panel) | — |
| YouTube 업로드 모달 | `components/youtube/YoutubeUploadModal.tsx` | `dialog` | 내부에 플레이어 목업 아이콘 17개 인라인 |
| 플랜 게이트 모달 | `.../components/PlanGateModal.tsx` | `dialog` | — |
| 체험판 워터마크 | `useTrialWatermark` | 카탈로그에 없음 | — |

### `/analytics/youtube` — YouTube 분석 대시보드

| 구성 요소 | 제품 구현 위치 | 카탈로그 ID | 비고 |
|---|---|---|---|
| 개요 / 시청자 / 성과 탭 | `components/scenes/analytics/` | 카탈로그에 없음 (tabs) | — |
| 플랫폼 탭 | `components/scenes/analytics/AnalyticsPlatformTabs.tsx` | 카탈로그에 없음 (tabs) | — |
| 메인 스크롤 영역 | `components/scenes/analytics/` | 카탈로그에 없음 (scroll region) | — |
| 콘텐츠 테이블 | `components/scenes/analytics/ContentTable.tsx` | 카탈로그에 없음 (table) | — |
| 영역 차트 / KPI 스파크라인 / 도넛 링 | `components/scenes/analytics/shared.tsx`, `useAudienceDonutRing.ts` | 카탈로그에 없음 (chart / sparkline) | **차트 라이브러리 없음 — 전량 자체 SVG** |
| 차트 툴팁 | `components/scenes/analytics/useAnalyticsBarTooltip.tsx` | `tooltip` | **툴팁 세 번째 구현** |
| 스켈레톤 5종 (KPI행 / 지표카드 / 주요블록 / 차트 / 테이블) | `components/scenes/analytics/shared.tsx` | 카탈로그에 없음 (skeleton) | **`loading` 패턴과 직결** |
| 상태 패널 / 데이터 부족 안내 | `components/scenes/analytics/shared.tsx` | `empty-state` | 표면 변종 3종(plain / innerPanel / donutCard) |
| 계정 더보기 메뉴 | `components/scenes/analytics/AnalyticsAccountMoreMenu.tsx` | `menu-popover` | — |
| 글래스 확인 모달 | `.../components/GlassConfirmModal.tsx` | `dialog` | — |
| 사이드바 탭 아이콘 | `components/scenes/analytics/shared.tsx` | 카탈로그에 없음 (icon slot) | — |

`/analytics/instagram`은 위 구성을 대부분 공유하나 **플래그로 차단된 미배포 화면**이다.

### `/settings` · `/subscription`

| 구성 요소 | 제품 구현 위치 | 카탈로그 ID | 비고 |
|---|---|---|---|
| 세그먼트 토글 | `components/scenes/SegmentedToggle.tsx` | 카탈로그에 없음 (segmented-control) | 슬라이딩 thumb. 하이라이트 뷰 토글과 **중복 계보** |
| 기본 아바타 | `components/navigation/UserCircleDefaultAvatar.tsx` | 카탈로그에 없음 (avatar) | — |
| 인라인 로딩 라벨 | `components/ui/InlineLoadingLabel.tsx` | 카탈로그에 없음 (제품 manifest에는 있음) | **참조 14파일 — 저장소에서 가장 많이 쓰이는 프리미티브** |
| 커스텀 드롭다운 | `components/scenes/create/CustomDropdown.tsx` | `select` | — |
| 확인 모달 | `components/scenes/create/ConfirmModal.tsx` | `dialog` | 구 계보 |
| 토스트 | `components/scenes/myPageSceneStyles.ts` | `toast` | 6벌 중 1벌 |
| 플랜/크레딧 카드 · 충전 팩 | `SubscriptionScene.tsx` | 카탈로그에 없음 (card) | — |

### `/mypage/**` — 결제/빌링 (9개)

| 구성 요소 | 제품 구현 위치 | 카탈로그 ID | 비고 |
|---|---|---|---|
| 플랜 비교표 | `components/landing/sections/PricingSection.tsx`에서 재사용 | 카탈로그에 없음 (table) | 랜딩 자산을 앱 화면이 역수입 |
| 결제창 패널 | `app/mypage/upgrade/TossPaymentWindowPanel.tsx` | 카탈로그에 없음 (embedded payment frame) | — |
| 결과 화면 6종 (성공/실패 × 업그레이드·정기결제·결제수단변경·충전) | 각 route 파일 | 카탈로그에 없음 (result / status page) | **제품 문서가 "아이콘 없음"을 명시적 규범으로 못박은 화면군.** 재조립 시 체크/엑스 배지를 넣으면 안 됨 |
| 확인 모달 | `components/scenes/create/ConfirmModal.tsx` | `dialog` | — |

### 인증 / 온보딩 (10개)

| 구성 요소 | 제품 구현 위치 | 카탈로그 ID | 비고 |
|---|---|---|---|
| 브랜드 로고 | `components/ui/BrandLogo.tsx` (참조 11파일) | 카탈로그에 없음 (brand logo) | — |
| 로고 치수 함수 | `components/ui/brandLogoMetrics.ts` | 카탈로그에 없음 (logo metrics token) | 로고 높이→워드마크 폭 환산 4함수 |
| 브랜드 심볼 | `components/ui/BrandSymbolMark.tsx` | 카탈로그에 없음 | — |
| 인증 상태 카드 | `components/auth/AuthStatusCard.tsx` | 카탈로그에 없음 (card) | 이메일 확인·만료·재설정 4화면 공유 |
| 폼 입력 필드 | 각 route 파일이 원시 요소를 직접 사용 | `input` (**구현 없음**) | 공용 입력 컴포넌트 부재 |
| 비밀번호 표시 토글 | 각 route 파일 + 정적 아이콘 자산 | 카탈로그에 없음 (icon-button) | **정적 SVG를 이미지로 로드 → 테마 반전 불가** |
| 약관 동의 모달 | `components/signup/SignupLegalModal.tsx` | `dialog` | 새 프로젝트 모달과 셸 CSS 공유 |
| 인라인 로딩 라벨 | `components/ui/InlineLoadingLabel.tsx` | 카탈로그에 없음 | — |
| AWS 워드마크 | `components/ui/AwsWordmark.tsx` | 카탈로그에 없음 (partner logo) | — |
| 지구본 아이콘 / 언어 선택 | `components/ui/GlobeIcon.tsx`, `CustomDropdown` | 카탈로그에 없음 / `select` | AWS 전용 화면에서 사용 |

> `/aws/signup`은 **AWS Squid Ink 고정 테마**로 앱 테마 체계 밖에서 동작한다.

### 공개 마케팅 / 문서 (15개)

| 구성 요소 | 제품 구현 위치 | 카탈로그 ID | 비고 |
|---|---|---|---|
| 랜딩 셸(별개 GNB) | `components/landing/navigation/Gnb.tsx` | `app-shell` (별개 계보) | 상단 바 + 모바일 햄버거 + 드롭다운 |
| Hero / 노드 캔버스 쇼케이스 / FAQ / Footer | `components/landing/sections/` (25개+) | 카탈로그에 없음 | 마케팅 전용 |
| 섹션 인터랙션 | `SectionInteractions` | 카탈로그에 없음 | — |
| 가격 섹션 + 플랜 비교표 | `components/landing/sections/PricingSection.tsx` | 카탈로그에 없음 (table) | — |
| 스테이지 카드 | `components/landing/sections/CapabilitiesShowcaseParts.tsx` | 카탈로그에 없음 (card) | 상위 쇼케이스는 현재 주석 처리 |
| 제품 글리프 3종 | `components/landing/sections/productGlyphs.tsx` | 카탈로그에 없음 (icon set) | — |
| 문서 사이드바 / 개요 / 아티클 | `app/docs/DocsSidebar.tsx`, `DocsOverview.tsx`, `DocArticle.tsx` | 카탈로그에 없음 (docs nav) | — |
| 블로그 셸 / 템플릿 셸 | `components/blog/BlogShell.tsx`, `components/templates/TemplateShell.tsx` | 카탈로그에 없음 (content shell) | — |
| 마크다운 렌더러 | `components/blog/MarkdownContent.tsx`, `components/legal/LegalMarkdownBody.tsx` | 카탈로그에 없음 (prose) | **2벌 중복** |
| 템플릿 결과 캐러셀 | `components/templates/TemplateResultCarousel.tsx` | 카탈로그에 없음 (carousel) | 3벌 중 3벌 |
| 프롬프트 복사 버튼 | `components/templates/CopyPromptButton.tsx` | 카탈로그에 없음 (copy button) | 캔버스 복사 버튼과 **중복 계보** |
| 문의 폼 | `app/inquiry/InquiryClient.tsx` (790줄) | `input` (구현 없음) + 자체 토스트 | — |
| 랜딩 데모 정적 스냅샷 | `components/landing/demo-snapshots/` | — | 셸·캔버스·분석·하이라이트의 **정적 복제본**. 규범 대조 대상 아님 |
| 언어 선택기 | `components/landing/system/LanguageSelector.tsx` | `menu-popover` / `select` | — |

### `(highlight-standalone)` — 독립 셸 (7개)

| 구성 요소 | 제품 구현 위치 | 카탈로그 ID | 비고 |
|---|---|---|---|
| 독립 셸 레이아웃 (자체 헤더 + 줌 트랜지션 + light 강제) | `app/(highlight-standalone)/layout.tsx` (210줄) | `app-shell` (**범위 밖**) | 앱 셸을 쓰지 않는 별도 셸 |
| CSS Module 스타일 5개 | 같은 그룹 하위 | — | `apps/web`에 남은 **유일한 CSS Module 자산(1,468줄)** |
| 하이라이트 대시보드 (state 전환) | `hl/page.tsx` | — | 라우트 이동 없이 허브↔상세를 state로 전환, URL만 history API로 변경 |

> 이 그룹은 별도 브랜드 색·자체 타입 스케일·자체 브레이크포인트를 쓰며, 제품 문서가 **범위 밖/삭제 예정**으로 이미 격리했다. **카탈로그로 흡수하면 안 된다.**

### `/admin` — 어드민 콘솔

탭형 단일 파일(2,205줄)이 배너·블로그·자막 템플릿·문의·잡 모니터·제품 지표·환불·템플릿·모델별 사용량 9개 관리 화면을 소유한다. 앱 셸을 **고정 배치가 아니라 카드 내부 슬롯 포털**로 사용하는 유일한 소비자다. 토스트 정의가 이 파일군에만 6곳 있고, mask 아이콘 패턴 복제 지점 2곳이 있다.

### 시스템 화면

| 화면 | 제품 구현 위치 | 카탈로그 ID | 비고 |
|---|---|---|---|
| 런타임 에러 경계 | `app/error.tsx` | `button` + `empty-state` | — |
| 전역 에러 경계 | `app/global-error.tsx` | 카탈로그에 없음 | **CSS 없이 렌더되므로 인라인 색 하드코딩이 구조적으로 불가피** |
| 404 | `app/not-found.tsx`, `not-found-content.tsx` | `empty-state` | 잔존 CSS Module 1개 |

---

## 카탈로그 gap

현행 카탈로그(8 component + 4 pattern)에 없으나 제품에 실재하는 것들. **사용 화면 수**는 조사에서 확인된 값이며, 정확한 전수 집계가 아닌 항목은 "약"으로 표기했다.

### 1순위 — 중복이 심하거나 접근성 위험이 큰 것

| 후보 ID | 사용 화면/파일 수 | 우선순위 근거 |
|---|---|---|
| `skeleton` | 분석 2화면 + 허브 4곳(로딩 워드 3벌 복제) | `loading` 패턴이 이미 beta인데 로딩 표면 컴포넌트가 카탈로그에 없다. 분석 화면에만 5종 export가 존재하고, 쉬머 워드는 3곳 복제. **`loading` 패턴 규범이 참조할 컴포넌트가 없는 상태** |
| `icon` / `icon-mask` | mask 패턴 복제 최소 7곳, 아이콘 소비 화면 전부 | 20px 고정 + `currentColor` 배경 + 이중 벤더 선언이 클래스 문자열로 복붙되고 있다. 재사용 컴포넌트가 없어 아이콘 크기·색 규범을 강제할 지점이 없다. **DS-P3-013 아이콘 트랙의 착지점** |
| `segmented-control` | 설정·구독·하이라이트 상세·분석 (최소 4화면, 구현 3벌) | 슬라이딩 thumb 컴포넌트 1개 + 하이라이트 뷰 토글 + 분석 플랫폼 탭이 각자 구현. `role="group"`·키보드 이동 규범이 없어 접근성 편차가 크다 |
| `card` | 홈·4개 허브·인증 4화면·랜딩·구독 (약 12화면) | `project-grid` 패턴이 카드를 전제하는데 카드 규범이 없다. 프로젝트 카드·인증 상태 카드·스테이지 카드가 각자 계보 |
| `banner` / `alert` | 전역 연체 배너 + 홈 배너 + 탭 배너 3허브 (약 6화면) | 루트 레이아웃 전역에 상시 존재하는 표면인데 규범이 없다 |
| `checkbox` | 하이라이트 상세, 크레딧 확인 모달, 어드민 (최소 3화면) | **컴포넌트가 아니라 전역 CSS 클래스 1개 + export된 클래스 문자열 2개**로만 존재. 포커스·라벨 연결 규범 부재는 명백한 접근성 위험 |
| `form-field` (라벨+에러+헬퍼) | 인증 10화면 + 문의 + 설정 + 어드민 (약 15화면) | `input` 카탈로그 항목은 있으나 제품에 범용 입력이 없고 원시 요소를 쓰는 파일이 34개다. 필드 래퍼 규범 없이 `input`만 만들면 실사용에 닿지 않는다 |
| `video-player` | 비디오 에디터·하이라이트 상세·숏폼·홈 등 참조 8파일 | 41KB 단일 컴포넌트에 UI 변종 2 + 톤 2. **규모·재사용도 모두 최상위인데 카탈로그에 없다.** 게다가 하이라이트 상세가 별도 자체 크롬을 또 구현 |

### 2순위 — 화면 커버리지가 넓은 것

| 후보 ID | 사용 화면/파일 수 | 우선순위 근거 |
|---|---|---|
| `loading-spinner` | 전역 (제품 manifest에는 beta로 존재) | DS 카탈로그에만 없다. 제품에는 이미 done 상태 |
| `inline-loading-label` | 참조 14파일 | **저장소에서 가장 많이 쓰이는 프리미티브**인데 DS 카탈로그에 없다 |
| `avatar` | 앱 셸 전 화면 + 설정 | 셸 파일에 인라인, 기본 이미지만 분리. 셸 규범의 필수 부품 |
| `icon-button` | 캔버스·에디터·셸·플레이어 (약 10화면) | 기본 버튼과 완전히 별개 계보로 존재. `button` 규범이 아이콘 전용 케이스를 흡수할지 분리할지 결정 필요 |
| `carousel` | 홈·3허브·캔버스·템플릿 (구현 **3벌**) | 배너 캐러셀 / 숏 캐러셀 / 템플릿 결과 캐러셀이 각자 구현 |
| `chip` / `tag` | 캔버스 + 인스펙터 알약 (최소 3화면) | — |
| `table` | 분석·랜딩 가격·업그레이드·어드민 (약 6화면) | 전량 자체 구현 |
| `chart` / `sparkline` | 분석 2화면 | **차트 라이브러리 없이 전량 자체 SVG.** 영역 차트·스파크라인·도넛 링 |
| `toolbar` | 캔버스(참조 10파일) + 편집 워크스페이스 | — |
| `command-palette` | 앱 셸 전 화면 | 952줄 자체 구현, 라이브러리 미사용. 키보드 내비게이션 규범 필요 |
| `coachmark` / onboarding hint | 캔버스 (힌트 3종 + 워크스루 오버레이 5종) | — |
| `lightbox` | 캔버스 + 하이라이트 | `dialog` 하위 변종으로 흡수할지 결정 필요 |
| `copy-button` | 캔버스 + 템플릿 (**2벌 중복**) | — |
| `editable-label` / inline-edit | 캔버스 헤더 + 노드 제목 + 편집 워크스페이스 헤더 | — |
| `brand-logo` / `wordmark` | 인증 10화면 + 셸 + 랜딩 (참조 11파일) | 로고 치수 환산 함수가 별도 존재 — 토큰화 후보 |
| `status-glyph` | 캔버스 저장 상태 + 분석 공개범위 아이콘 | — |
| `prose` / markdown | 블로그 + 약관 (**2벌 중복**) | — |

### 3순위 — 편집 워크스페이스 전용 (pattern 하위 구성 요소)

| 후보 ID | 사용 화면 수 | 우선순위 근거 |
|---|---|---|
| `resizable-pane` / divider | 편집 워크스페이스 2화면, **3축 반복** | `role="separator"` + 포인터 드래그 + 더블클릭 초기화 + CSS 변수 폭. `editor-workspace` 규범이 반드시 다뤄야 할 계약 |
| `timeline` / `track-lane` | 편집 워크스페이스 2화면 | `editor-workspace`의 핵심 anatomy인데 하위 규범이 없다 |
| `inspector` / properties panel | 편집 워크스페이스 2화면 (선택 종류별 4분기) | 동일 |
| `canvas-viewport-chrome` (툴바·줌·미니맵·레이어 패널) | 캔버스 에디터 1화면 + 랜딩 정적 캔버스 | 동일 |
| `waveform` / `filmstrip` | 편집 워크스페이스 2화면 | — |
| `slot-injection-chrome` | 편집 워크스페이스 2화면 + 어드민 | 셸이 DOM 슬롯을 노출하고 자식이 역주입하는 양방향 계약. **`app-shell` 규범의 미기록 계약** |
| `color-picker` | 캔버스 + 숏폼 자막 (2화면) | — |
| `date-time-picker` | 캔버스 예약 발행 (1화면) | — |
| `file-dropzone` | 하이라이트 허브 + 캔버스 드롭 (2화면) | — |
| `media-grid` / thumbnail strip | 캔버스 (2종) | — |
| `crop-modal` | 캔버스 3종 + 편집 워크스페이스 1종 | `dialog` 하위 변종. 라이브러리 기반과 자체 구현이 병존 |

### 토큰 축 gap (컴포넌트가 아님)

| 축 | 현황 | 근거 |
|---|---|---|
| `layer-*` (z-index) | **토큰 0개 / 고유 리터럴 65종** | 사실상 6단 이상의 서열이 **주석으로만** 유지되고, 주석과 실제 값이 이미 어긋난 지점이 확인됐다. 오버레이 규범(`dialog`·`menu-popover`·`tooltip`·`toast`)이 전부 이 축에 의존한다 |
| `elevation-*` | 3종 존재 / raw box-shadow **642건** | 제품 문서에 5단계 깊이 위계(평면 → 베벨 → 프레임 → 떠 있음 → 스크림)가 서술돼 있으나 **토큰 이름이 없다** |
| `motion-*` (duration/easing) | duration 토큰 0개, easing 토큰 2개 | 사용 1·2위 커브가 정본 토큰이 **아니다**. duration 상위값이 180/140/120/160/150/320/200/220ms |
| `focus-ring` | 토큰 없음 + 리셋이 레이어 밖 | **WCAG 2.4.7 위반 상태.** 아래 §토큰/스타일 관찰 참조 |

### 카탈로그에 있으나 제품에서 규범 이득이 가장 큰 항목 (신설이 아니라 강화)

| 카탈로그 ID | 제품 실태 | 이득 |
|---|---|---|
| `toast` | **공용 구현 없음. 정의 6~16곳 중복.** 키프레임 이름이 2계열로 갈렸고, 상태 관리는 화면마다 수동 타이머 반복. live region 없음 | **제품 통합 이득 최대.** 접근성(live region) 부재도 함께 해소 |
| `dialog` | 구현 **17~20개**. 제품이 지정한 정본 1개 + 별개 셸 계보 1개 + 각자 스크림·모션·z 재정의. **네이티브 dialog 요소 0건, focus trap·inert 사용 0건** | 접근성 최대 리스크 지점. ESC·focus trap·return focus·scroll lock 규범이 곧 결함 해소 |
| `menu-popover` | 구현 **13개 이상**으로 가장 분산. 공용 behavior API 없음 | 참조 16파일짜리 구현이 사실상의 정본 후보 — 규범 대조 기준으로 삼을 실물이 있다 |
| `input` | **범용 프리미티브 부재.** 원시 요소 직접 사용 34파일, 공용 입력은 숫자 전용 1개뿐 | 규범 작성 = 사실상 신규 제정. `form-field`와 함께 설계해야 실사용에 닿는다 |
| `empty-state` | 빈 상태 표현이 20개 파일에 분산, 페이지별 4가지 패턴 공존 | 캔버스 빈 상태(64px 글리프 + 중립색)와 페이지 빈 상태(아이콘 없음)가 **다른 규칙**임이 제품 문서에 이미 기록됨 — 변종 규범이 필요 |
| `tooltip` | 구현 **3벌** (자체 정본 1 + 라이브러리 1 + 차트 전용 1) | delay·wrapping·a11y 규칙이 분산 |
| `select` | 단일 정본 후보 1개 존재 (검색·푸터 슬롯·배치 3방향) | 제품에 쓸 만한 실물이 있어 규범화가 비교적 쉽다 |
| `app-shell` | 셸 골격이 **복제 2건** + 셸 사본 4개(앱/랜딩/데모/독립) | 슬롯 주입 계약과 사본 경계를 규범이 먼저 정의해야 parity 검증이 성립 |
| `project-grid` | 허브 **4곳**이 모델만 공유하고 렌더는 각자 | 규범 검증 시 4개 변종을 모두 대조해야 함 |
| `editor-workspace` | 모드 2개가 **prop 값의 진위 하나**에 매달림 | 기존 규범(experimental)이 이미 route/modal 분리를 적었고 코드와 모순되지 않는다. 필요한 것은 재작성이 아니라 실측 근거 보강 |
| `loading` | 쉬머 워드 3곳 복제 + 하이라이트 8상태 phase 머신 | 8상태 전이는 `loading` 패턴의 최대 검증 대상 |
| `button` | 유일한 정식 버튼 존재. focus-visible·loading API 없음 | 아이콘 슬롯의 크기·색을 호출부가 결정하는 계약, 광학 보정 규칙이 제품 문서에 이미 기록됨 |

---

## 아이콘 인벤토리

### 결론

Klipse는 **아이콘 라이브러리를 사실상 쓰지 않는다.** 아이콘 트랙(DS-P3-013)의 1순위 과제는 "어떤 라이브러리를 고를까"가 아니라 **3중 정의를 단일 소스로 접는 것**이다.

### 라이브러리 현황

| 패키지 | 선언 | 실제 import | 판정 |
|---|---|---|---|
| Phosphor 아이콘 패키지 | 있음 | **1건** | 사실상 미사용 (자체 아이콘 19개를 수제 복제) |
| lucide 아이콘 패키지 | 있음 | **0건** | **dead dependency** |
| react-icons / heroicons / tabler / Radix 아이콘 / feather / iconify | 없음 | — | 미도입 |

- 번들러 최적화 대상에는 둘 다 등록돼 있으나 한쪽은 코드에서 안 쓴다.
- SVGR 등 SVG→컴포넌트 변환 로더가 **설정돼 있지 않다.** 그래서 모든 SVG는 mask / 이미지 / 인라인 JSX 중 하나로 소비된다.
- 제품 저장소 자신이 이 사실을 문서화해 두었다: "라이브러리 import는 0건이며, 일부 글리프가 라이브러리 실루엣을 손으로 옮긴 것이라 주석에만 이름이 남아 있다."
- npm에서 실제로 import되는 아이콘은 **1종(Sparkle)** 뿐이며, 도입 사유(자체 근사본과 지오메트리가 달라 원본으로 교체)가 주석에 남아 있다.

### 3중 정의 구조 (아이콘 부채의 핵심)

| 레이어 | 위치 | 개수 | 색 지정 |
|---|---|---|---|
| ① 정적 SVG 자산 | `apps/web/public/icons/**` | **63개** (루트 61 + lucide 하위 2) | 대부분 흰/검 하드코딩 — mask로 덮어쓰는 전제 |
| ② 인라인 TSX 컴포넌트 | `apps/web/components/**` | 명명 컴포넌트 **약 94개**, `<svg>` 총 **283회** | 거의 전부 `currentColor` (482회) |
| ③ Canvas Path2D 재현본 | `.../node-canvas-v2/lib/archiveThumbnail/glyphs.ts`, `.../node-canvas/thumbnail.ts` | draw 함수 13 + path 상수 4 | canvas 스트로크 |

③의 주석이 중복을 명시적으로 인정한다 — "라이브 컴포넌트와 path 정확 일치", "public 자산과 path 정확 일치". **같은 글리프를 세 곳에서 수동 동기화**하고 있다.

저장소 전체 `.svg` 파일은 104개다(빌드 산출물·미사용 1건 포함).

### 아이콘 목록

#### 정적 자산 (`apps/web/public/icons/`, 63개)

PascalCase 계열(Phosphor 이름 규칙, viewBox 대부분 32) — 49개:
`Adjustment` `AlignLeftSimple` `AlignRightSimple` `ArrowUp` `ArrowsLeftRight` `CaretDoubleRight` `ChatCircle` `CheckCircle` `CheckCircle2` `CircleHalf` `Copy` `CreditCard` `Diamond` `DotsSixVertical` `DotsThreeVertical` `DownloadSimple` `Explore` `FileZip` `Folder` `Gear` `Graph` `Hand` `House` `Image` `Info` `InstagramLogo` `Lightbulb` `MagicWand` `MagnifyingGlass` `Monitor` `MonitorArrowUp` `Moon` `MusicNotesSimple` `PaintRoller` `Plus` `SignOut` `Sparkle` `SpeakerHigh` `SpeakerX` `Sun` `Template` `Translate` `TrashSimple` `UserSound` `VideoEditor` `Waveform` `X` `XCircle` `XCircle2`

kebab-case 계열(lucide 이름 규칙, viewBox 24·16·20 혼재) — 10개:
`copy-check` `eye` `eyeslash` `iconamoon_cursor-fill` `text` `user-default-profile` `video` `volume-2` `volume-x` `youtube`

브랜드 로고(아이콘 세트 아님) — 2개, lucide 하위 중복 — 2개(루트 동명 파일과 바이트 동일).

**참조 0건 자산 16개** (삭제 후보): `Adjustment` `CaretDoubleRight` `CheckCircle2` `CircleHalf` `CreditCard` `Explore` `Folder` `SpeakerHigh` `SpeakerX` `XCircle2` `copy-check` `user-default-profile` `volume-2` `volume-x` + lucide 하위 2개. `volume-*` 4개는 코드에서 **주석으로만** 언급된다.

viewBox 분포: 32 → 44개 · 24 → 11개 · 16 → 2개 · 20 → 1개 · 로고류 3개.

#### 정규 아이콘 컴포넌트 (`.../node-canvas-v2/icons/`, 19개)

노드 타입 아이콘의 정본 레지스트리. 전부 `{ size, strokeScreenPx }` 시그니처 + `currentColor` + `aria-hidden`.

`ImageIcon` `VideoCameraIcon` `TextIcon` `SparkleIcon` `MagicWandIcon` `MusicNotesSimpleIcon` `UserSoundIcon` `WaveformIcon` `YoutubeIcon` `InstagramIcon` `UploadSimpleIcon` `ArrowUpSimpleIcon` `AlignLeftSimpleIcon` `AlignRightSimpleIcon` `MonitorArrowUpIcon` `TemplateIcon` `MagnifyingGlassIcon` + **참조 0건 2개**(`CheckCircleIcon` `LightbulbIcon`).

#### 액션 글리프 레지스트리 (`.../node-canvas-v2/lib/nodeToolbarGlyphs.tsx`, 14개)

"노드 타입 아이콘은 icons/, 액션은 nodeToolbarGlyphs" 라는 **2분할 규칙이 제품 문서에 명시**돼 있다.

`ToolbarIconChevronLeft` `ToolbarChevronDown` `ToolbarIconPencil` `ToolbarIconExternalLink` `ToolbarIconDotsThreeVertical` `ToolbarIconCrop` `ToolbarIconUnlink` `ToolbarIconTrashSimple` `ToolbarIconDownload` `ToolbarIconCopy` `ToolbarIconCopyCheck` `ToolbarIconAspectOutputFrame` `ToolbarIconOutputFitMode` + **참조 0건 1개**(`ToolbarIconRegenerate`).
`ToolbarIconCrop`·`ToolbarIconUnlink`는 대응 원본 SVG가 없다.

#### v1 레거시 프리미티브 (`.../node-canvas/primitives.tsx`, 13개)

v2가 있음에도 **10개 이상 화면이 아직 여기서 import 중**이다(전역 배너, 하이라이트 상세, 분석, 비디오 허브, 캔버스 허브, 숏 캐러셀, 가이드 모달, 크롭 모달, 컴포저 바, 라이트박스).

`PlusIcon` `MinusIcon` `TrashIcon` `XIcon` `SwitchArrowsIcon` `ToolIcon`(hand/zoom/cursor 3글리프 분기) + eyebrow 아이콘 7종.

#### 전용 파일 아이콘 (10개)

`GlobeIcon` `BrandSymbolMark` `InfoCircleIcon` `ProjectSaveCloudGlyph` `UserCircleDefaultAvatar` `NodeCanvasGlyph` `VideoEditorGlyph` `HighlightGlyph` `VolumeOnIcon` `VolumeOffIcon`.

#### 화면 내 지역 정의 일회성 글리프 (약 38개)

커맨드 팔레트 5 · 셸 4 · 프로젝트 헤더 2 · 프로젝트 피커 2 · YouTube 노드 6 · BGM 노드 4 · TTS 노드 2(**BGM과 이름·역할 중복**) · 비디오 노드 2 · 컬러 팝오버 2 · Instagram 노드 1 · 모델 메뉴 1 · 텍스트 노드 2 · 툴바 2 · 노드 사이드 버튼 2(**툴바와 이름 중복, 별개 정의**) · 레이어 패널 1 · 하이라이트 허브 1 · 하이라이트 상세 1 · 분석 2 · 랜딩 데모 3.

**명명된 아이콘/글리프 식별자 고유 개수: 94개.**

#### 이름 없는 인라인 SVG (약 180개)

`<svg>` 총 283회 중 아이콘 전용 모듈이 52회. 나머지 대부분은 화면 파일 본문에 직접 박힌 익명 인라인 SVG다. 밀집도 상위:

| 파일 | `<svg>` 수 | 성격 |
|---|---|---|
| `.../nodes/VideoEditModal.tsx` | **42** | 편집 워크스페이스 툴바 전체 |
| `components/youtube/YoutubeUploadModal.tsx` | **17** | 플레이어 목업 |
| `components/navigation/Gnb.tsx` | **16** | 셸·사이드바·프로필 |
| `components/ui/VideoPlayer.tsx` | **11** | 공용 플레이어 |
| `components/scenes/archive/PlatformSection.tsx` | 9 | 플랫폼 배지 |
| `components/scenes/HighlightProjectScene.tsx` | 9 | — |
| `.../videoEditParts/ClipCropModal.tsx` | 8 | 클립 크롭 |

### 사용처 요약

- **노드 캔버스** — 아이콘 사용의 압도적 중심. 노드 타입 아이콘, 액션 글리프, 레이어 패널, 컨텍스트 메뉴, 툴바, 사이드 버튼, 빈 상태 64px 글리프가 전부 여기 모임
- **편집 워크스페이스** — 단일 파일 42개 인라인 SVG. **저장소에서 아이콘 부채가 가장 심한 지점**
- **앱 셸 / 커맨드 팔레트** — 정적 SVG를 mask로 소비하는 유일한 대규모 영역. 내비 아이콘 매핑이 셸 파일 한 곳에 상수로 있음
- **인증 화면** — 비밀번호 토글(참조 각 15회) + 에러 아이콘. **여기서만 정적 SVG를 이미지 컴포넌트로 로드**한다 → 테마 반전 불가
- **랜딩** — Phosphor 원본 좌표계(256)를 그대로 인라인한 2건 + 제품 글리프 3종
- **아카이브 썸네일(Canvas)** — Path2D 13종
- **결제/정산 7화면** — 제품 문서가 **"아이콘은 없다"를 명시적 규범으로 못박음.** 재조립 시 체크/엑스 배지를 넣으면 안 됨

### 크기·두께 규칙

**정본 공식이 존재한다.** `.../node-canvas-v2/icons/iconScreenStroke.ts`가 단일 소유:

- **표시 두께 = 글리프 크기 ÷ 16** (16px→1px, 20px→1.25px, 24px→1.5px, 32px→2px). 예외: 14px→0.88(비례값이 아닌 디자인 확정값)
- viewBox가 24든 32든 user-space 두께로 역산해 화면 두께를 일정하게 유지
- 노드 크롬 스트로크·사이드 핸들 아이콘 크기도 같은 모듈이 상수로 소유

실사용 `size` 값 빈도: `16`(38) · `15`(16) · `14`(9) · `64`(8, 노드 빈 상태) · `20`(3) · `13`(3) · `12`(2).
→ **12·13·15는 4px 격자 밖 임의값.** 정리 대상인지 예외 등록 대상인지 결정 필요.

**그러나 공식을 따르는 코드는 4분의 1 미만이다.** `strokeWidth` 리터럴 분포: `2`(85) · 계산값(68) · `1.5`(61) · `1.4`(25) · `2.25`(8) · `2.4`(6) · `1.6`(6) · `1.8`(5) · 그 외 다수. **게이트가 없어서 그렇다** — 아이콘 관련 자동 검증 규칙이 제품에 존재하지 않는다.

**viewBox 좌표계가 분열돼 있다.** TSX 인라인 분포: 24(161) · 16(31) · 32(30) · 36(8) · 14(7) · 10(6) · 20(5) · 12(3) · 256(2) · 기타 1회씩. **같은 세트 안에서도 24와 32가 섞인다** — Figma parity 작업의 즉각적 리스크.

**mask 방식은 20px 고정**이며, 클래스 문자열이 최소 7곳에 복붙돼 있다.

### 색·접근성 규약

| 경로 | 색 결정 | 비중 |
|---|---|---|
| 인라인 TSX | `currentColor` | **482회 — 지배적** |
| mask 소비 | `currentColor` 배경 (자산 원본 색 무시) | 약 20곳 |
| 이미지 컴포넌트 소비 | **자산 파일의 하드코딩 색 그대로 → 테마 대응 불가** | 약 14곳 |
| TSX 하드코딩 예외 | — | **11건뿐** |

TSX 하드코딩 11건: YouTube 로고 2곳(**중복 정의**), 플랫폼 배지 2곳, 스마트 가이드 라인, 랜딩 캡처 목업.
**정적 자산 색은 정반대다** — 61개 중 `currentColor`를 쓰는 것은 3개뿐이고 나머지는 흰/검 하드코딩(Figma 내보내기 잔재). 그래서 로고류는 라이트/다크 파일을 2벌씩 만들어 우회 중이다.

접근성: `aria-hidden` 568회로 사실상 기본 규약(라벨은 부모 버튼이 담당). `role="img"`·`focusable="false"`는 각 3회로 거의 안 쓴다. 비확대 스트로크는 아이콘 규범이 아니라 줌 컨텍스트 국소 처방으로 5곳에만 있다.

### 제품이 이미 문서화해 둔 아이콘 규범 (인용 가능한 기존 계약)

제품의 문서 생성 스크립트가 만드는 Iconography 절이 6개 규칙을 서술한다:

1. 소스: 정적 SVG → 컴포넌트 래퍼
2. 노드 타입 아이콘은 `icons/`, 액션 글리프는 `nodeToolbarGlyphs` — 레지스트리 2분할
3. lucide import 0건, 일부 글리프는 실루엣 수동 이식
4. 선 두께 = 글리프 크기 ÷ 16 (예외 14 → 0.88)
5. **컨테이너와 글리프를 구분한다** (예: 28px 컨테이너 안 20px 글리프)
6. 아이콘 색은 content 역할 토큰을 쓴다. **아이콘 래퍼 프레임에 흰색 배경을 두지 않는다**

추가 관측 규범: 사이드바 토글의 두께 역산 사례 · 기본 버튼은 아이콘 슬롯의 크기·색을 **일절 지정하지 않고 호출부가 결정** · 아이콘 광학 보정으로 아이콘 쪽 안쪽 여백을 2px 감산 · 노드 빈 상태 아이콘은 64px + 두께 2 + 낮은 불투명도이며 accent가 아니라 중립색 · **페이지 빈 상태에는 아이콘이 없다**.

### DS-P3-013 아이콘 트랙의 범위 근거

1. **라이브러리 채택이 자유롭다.** 현 상태는 어느 라이브러리에도 락인돼 있지 않다. 다만 정적 자산 49개가 Phosphor 이름 규칙을, 툴바 글리프 다수가 lucide 실루엣을 따르므로 **수렴 시 마이그레이션 매핑표가 필요**하다.
2. **3중 정의를 단일 소스로 접는 것이 최대 가치.** 토큰 파이프라인처럼 **아이콘도 생성 파이프라인 후보**다 — 하나의 SVG 소스에서 컴포넌트와 Canvas 상수를 함께 생성하면 현재의 수동 동기화 주석이 전부 사라진다.
3. **두께 공식은 그대로 규범화 가능**하되, 준수율 25% 미만이 실측치다. 게이트가 없어서다.
4. **viewBox 24/32 혼재와 size 12·13·15 임의값**은 Figma parity 검증 전에 정리 결정이 필요하다.
5. **즉시 정리 가능한 dead 항목**: 컴포넌트 3개, 자산 16개, 의존성 1개, 미사용 SVG 파일 1개.
6. **중복 정의 정리 대상**: YouTube 로고 2곳, 재생/일시정지 2세트, 업로드/생성 2세트, volume 4벌, v1 프리미티브 ↔ v2 글리프.
7. **mask 패턴은 컴포넌트화 대상.** DS의 `icon`/`icon-mask` 규범이 바로 여기에 값을 준다.
8. **카탈로그 우선순위 제안**(실사용 상위 집합): `image` `video-camera` `text` `sparkle` `chevron-down` `chevron-left/right` `x` `plus` `minus` `trash` `download` `copy`/`copy-check` `pencil` `external-link` `dots-three-vertical` `magnifying-glass` `play`/`pause` `speaker-high`/`speaker-x` `upload` `arrow-up` `align-left`/`align-right` `magic-wand` `music-notes` `waveform` `user-sound` `eye`/`eye-slash` `check-circle` `x-circle` `info` `house` `graph` `gear` `sign-out` `sun`/`moon` `translate`.
   **브랜드 로고(YouTube, Instagram, Google, Kling, AWS 등)는 아이콘 세트와 분리된 별도 트랙**으로 둔다.

---

## 토큰/스타일 관찰

### 현재 실태 요약

| 축 | 제품 현황 |
|---|---|
| CSS 변수 정의 | **단일 파일 소유.** 선언 562건 / 고유 이름 367개. Tailwind 설정 파일은 **존재하지 않음**(v4 CSS-first) |
| Tailwind | v4. preflight **의도적 제외**(전역 리셋을 직접 담당). 기본 팔레트 **전량 삭제** 후 제품 팔레트만 노출 |
| 간격 격자 | **`--spacing: 2px`** — 4px가 아니다. 실측 빈도(8·12·4·6·16·10·2·20·14·18px)를 근거로 선택 |
| radius | 토큰 유틸리티 사용 626회로 대체로 준수. 단 `999px` 리터럴 67회(`full` 토큰이 있는데 우회) |
| CSS Module | 5개 / 1,468줄만 잔존, **전부 범위 밖 화면**. 최초 104파일 / 약 78,000줄에서 전환 완료 상태 |
| 다크모드 | `prefers-color-scheme`를 CSS에서 직접 쓰지 않음. **속성 기반** + 서버 쿠키 SSR + paint 전 인라인 스크립트 |
| 폰트 | Pretendard Variable 단일 패밀리. 일본어 로케일만 별도 패밀리 교체 |
| 검증 게이트 | 13종 + baseline ratchet 파일 4종 |

### 이관 시 주의점

#### 1. 【최우선】 라이트 회색 램프가 두 벌이고, 두 번째는 CSS가 아니라 TSX에 있다

앱 셸 파일(`components/navigation/Gnb.tsx`)의 사이드바 래퍼가 Tailwind 임의 속성으로 자체 스코프를 만들어 **팔레트 회색 7단 + 시맨틱 회색 6단 + 배경·페이지·드롭다운 표면을 통째로 재선언**한다. 라이트 테마에서 전역 램프보다 **한 단계 밝은** 값이 앱 셸 안에서만 쓰인다.

- **제품의 생성 토큰 파일(tokens.yaml, foundations.txt)에 이 램프가 없다.** 두 파일 모두 CSS 두 개만 파싱하기 때문이다. → **생성 토큰 파일을 그대로 신뢰하면 라이트 앱 화면 전체가 한 단계 어긋난다.**
- 다크는 안전하다(재매핑이 라이트 스코프 한정).
- 조건이 **런타임 DOM 상태**라 Figma 모드나 정적 토큰 파일로 옮길 수 없다. 제품 문서가 "바인딩 금지 유지"를 권고 중이며 **미결정 상태**.
- Figma 재조립 시: 랜딩 계열은 변수 바인딩 가능, **앱 셸 계열은 바인딩 금지 · 해결값 직접 입력**.
- 코드 자체 불일치 1건: 어느 회색 한 단의 hex 표기와 rgb 미러가 초록 채널 1 차이. 어느 쪽이 의도인지 미결정이라 게이트가 양쪽을 받는다.

#### 2. 시맨틱 회색은 "시맨틱"이 아니라 **반전되는 스케일**이다

라이트에서 `000`이 잉크(검정)이고 `900`이 밝은 면이다. **이름의 숫자가 밝기를 뜻하지 않는다.** 실제로 이 규약을 오해해 "흰 글래스"를 만들려다 다크 UI처럼 보이는 배경이 나온 버그가 기록돼 있다. 관용구는 "면·글래스는 900 계열, 잉크는 000 계열"이며 **양 테마 공통 코드로 성립**한다.

→ `color-background-*` / `color-foreground-*`로 이관할 때 **이 반전 규약을 그대로 옮길지 정방향으로 뒤집을지를 먼저 Decision으로 정해야 한다.** 뒤집으면 유틸리티 466건 + 직접 참조 수천 건이 전부 뒤집혀야 한다.

#### 3. 역할 토큰 9개는 "정의만 되고 아무도 안 쓴다"

표면 7 + 테두리 2 = 9개가 정의돼 있으나 **소비처 0**. (grep 1건이 걸리지만 **정의되지 않은 토큰**을 참조해 항상 하드코딩 fallback으로 렌더되는 코드다.)

반면 제품의 생성 문서는 Figma Semantic 컬렉션 기준 **39개 역할**(surface 12 · content 9 · border 7 · interaction 4 · status 5 · brand 2)을 광고하고, 그중 CSS 변수로 존재하는 것은 9개뿐이며 나머지 30개는 Figma 전용이다.

→ DS 카탈로그의 `color-background/foreground/border/action/status-*` 계열은 **이 39개 이름 공간과 정면으로 겹친다.** Figma에만 있는 30개를 카탈로그로 승격하면 **코드에 없는 개념을 정본으로 만드는 것**이다. 제품 문서가 이것을 "문서 전체에서 가장 큰 괴리"로 지목했다. 역할 층을 실제로 착지시키려면 **호출부 약 970건 마이그레이션이 실제 작업량**이다.

`status-*` 후보 값은 코드에 존재하나 **`status-*` 이름 자체는 코드에 없다.** warning 후보가 두 개(amber / yellow) 있고 어느 쪽인지 코드 근거가 없다.

#### 4. elevation / layer / motion은 **이관할 원본이 없다 — 신규 제정이다**

| 축 | 원본 | 실태 |
|---|---|---|
| elevation | 토큰 3종 | raw box-shadow **642건**. 제품 문서의 5단계 깊이 위계(평면 → 베벨 → 프레임 → 떠 있음 → 스크림)는 훌륭한 규범이나 **토큰 이름이 없다**. "표에 없는 그림자를 추가하지 않는다", "글래스 표면에 테두리를 얹지 않는다"는 규칙까지 서술돼 있어 그대로 `elevation-0..4`로 제정할 수 있다. 단 **글래스 베벨은 반드시 highlight/shade 쌍으로 쓰인다** — 단일 토큰으로 압축하면 규약이 깨진다 |
| layer | **0개** | 고유 리터럴 **65종**(0~99990). 제품 문서가 "리터럴에서 사다리를 생성하려 하지 말 것 — 목적이 리터럴을 없애는 것"이라고 못박음. 관측되는 암묵 계층은 최상위 툴팁 > 팝오버 > 확인 모달 > 편집 모달 > 포털 모달 순이며, 같은 주석이 4개 파일에 복붙돼 유지된다. **주석과 실제 값이 이미 어긋난 지점이 확인됐다** |
| motion | duration 0개, easing 2개 | **사용 1·2위 커브가 정본 토큰이 아니다.** 정본 토큰은 사용 25회, 1위 커브는 76회. duration 상위: 180 · 140 · 120 · 160 · 150 · 320 · 200 · 220ms. 툴팁 계열만 유일하게 컴포넌트 스코프로 토큰화돼 있음. **정본을 정하는 Decision이 먼저** |

#### 5. space 스케일은 값이 아니라 **격자 크기 자체가 결정 사항**이다

2px 격자는 "4px 격자를 쓰면 858곳이 이탈한다"는 실측 근거로 선택됐다. DS가 `space-*`를 4px 배수로 정의하면 **제품의 6·10·14·18px 사용처가 전부 임의값으로 떨어진다.** 2px 배수로 잡거나 half-step을 명시해야 한다.

이탈은 유틸리티가 아니라 **임의값 쪽에 있다**: 픽셀 리터럴 총 558회, 그중 `999px`(67) · `5px`(61) · `3px`(48) · `9px`(39) · `7px`(34) · `1px`(33)이 상위. 홀수 픽셀이 격자를 벗어난다.

#### 6. typography는 **값 이관은 쉽고 API 이관이 어렵다**

- 값은 안전하다: 7단 × {size, line-height, letter-spacing} + weight 3단. heading 행간 1.35 / body·caption 1.5로 통일. 표에 없는 크기는 게이트가 막는다. raw 선언 잔여 위반은 범위 밖 화면 5건 + 정의 파일 자체 3건뿐
- 그러나 **반응형 램프가 랜딩 스코프에만 적용된다.** 앱 화면은 램프 없음. 추가로 좁은 폭에서 body-16이 body-14 크기로 전역 축소된다. **단일 값으로 이관하면 이 스코프 분기가 사라진다**
- 소비 문법이 이중화: 레거시 유틸 클래스 **1,751회** vs Tailwind 유틸 **57회**. 둘 다 같은 변수를 읽으므로 **값은 어긋나지 않는다** — 이관 시 값 문제가 아니라 API 문제다. 후자만 규범화하고 전자를 deprecation 경로에 올리는 편이 낫다

#### 7. 포커스 링 — **토큰을 만들어도 작동하지 않는다**

전역 CSS가 outline을 두 번 죽이는데, **두 번째가 레이어 밖**이라 모든 유틸리티를 이긴다. 따라서 `color-border-focus` 류 토큰을 만들어도 **호출부마다 우선순위 강제가 필요**하다. **WCAG 2.4.7 위반 상태**이며, 토큰 제정 전에 리셋 제거 여부를 Decision으로 먼저 정해야 한다.

#### 8. 이관하면 안 되는 것 / 값이 아닌 것

- **`(highlight-standalone)` 그룹과 그 하위 DESIGN 문서** — 별도 브랜드 색, 자체 타입 스케일, 자체 브레이크포인트. 제품이 이미 legacy로 격리 중. **카탈로그로 흡수 금지**
- **노드 채널 색 40여 개** — 캔버스 채널(youtube/instagram/edit/image/text/audio)은 **제품 도메인 개념**이다. `color-status-*`와 섞지 말 것. "비디오 채널은 존재하지 않는다" 같은 도메인 규칙이 토큰 구조에 박혀 있다
- **랜딩 워크스루 서브트리 테마 역전** — 토큰이 아니라 **스코프 메커니즘**이다. 문서 어딘가에 반대 테마가 마운트되면 문서 전체 오버라이드가 꺼지는 **문서 단위 킬스위치**로 동작한다. 옮기려면 토큰이 아니라 "테마 스코프 오버라이드" 규범으로 서술해야 한다
- **테마 강제 지점 2곳** — 독립 하이라이트 셸(light 강제)과 AWS 회원가입(고정 테마). 둘 다 semantic 토큰 체계 밖에서 동작한다
- **Canvas 2D 렌더러 3파일**(하드코딩 색 31 + 11 + 10건) — CSS 변수 접근 불가가 **구조적 제약**이다. "토큰 → JS 상수 export" 경로를 만들지 않는 한 하드코딩이 정상이며, 단순 위반으로 세지 말 것
- **전역 에러 경계** — CSS 없이 렌더되므로 인라인 색이 불가피
- **루트 폰트 크기 10px** — 타입 스케일과 무관한 환산 기준이며, 과거 이를 타입 토큰으로 바꾼 커밋이 회귀를 냈고 되돌린 이력이 주석에 박혀 있다. 건드리지 말 것
- **리터럴 폰트 페이스 중복 등록** — Canvas 렌더가 리터럴 패밀리명을 필요로 해서 의도적으로 이중 등록된 것이다. 제거하면 자막 프리뷰와 백엔드 렌더 크기가 어긋난다

#### 9. 브레이크포인트는 규약과 임의값이 섞여 있다

Tailwind 반응형 접두사는 거의 안 쓴다(`md:` 25회). 실제로는 임의 미디어 변형 리터럴이 지배한다: `719px`(466) · `720px`(201) · `480px`(186) · `900px`(99) · `560px`(42) · `450px`(42) · `640px`(29) · `1024px`(26) · `355px`(25) · 이하 다수. `719/720/480/960`은 앱 셸 규약이지만 `900/788/780/560/355` 등은 **근거 불명 리터럴**이다.

#### 10. 검증 전략은 그대로 가져올 가치가 있다

제품이 이미 확립한 두 패턴은 Klipse DS에 그대로 적용 가능하다:

1. **GENERATED 마커 + 이중 모드** — 문서의 값 구간만 코드에서 생성하고 손으로 쓴 설명은 보존. 기본은 검사(실패 시 종료 코드 1), 옵션으로 재생성. "틀린 SSOT는 SSOT가 없는 것보다 나쁘다"는 근거가 스크립트 헤더에 기록돼 있다
2. **baseline ratchet** — 신규 위반만 실패시키고 baseline은 줄이는 방향으로만 갱신. 현재 타이포·린트·CSS Module·문서 식별자 4종에 적용 중이며, **간격·radius·z-index·duration 리터럴에도 같은 방식을 적용할 수 있다**

#### 11. 제품 부채 수치 (규범 우선순위 참고용)

제품의 부채 집계가 총 **324건**(unverified 190 / decision-needed 134)을 기록하고 있고, 문서별 상위는 노드 캔버스 48 · 비디오 에디터 40 · 분석 39다. 이는 **화면 복잡도 순위와 일치**하며, 카탈로그 우선순위 판단의 보조 지표로 쓸 수 있다.

#### 12. 공용 UI 패키지 경계는 존재하지 않는다

monorepo의 UI 패키지는 스캐폴딩 보일러플레이트 3파일이고 **소비자 0**이다(의존성 선언만 남아 있음). 브랜드 자산 패키지는 이미지 1개. 즉 **제품에는 참고할 패키지 경계 선례가 없다** — Klipse DS의 package architecture는 제품에서 배울 것이 없고 처음부터 설계해야 한다.

---

## 미확인 항목

### 조사 범위 밖

- **브라우저 실측 렌더를 하지 않았다.** 모든 값은 소스 읽기 결과다. 제품 자신의 부채 집계도 unverified 190건에 같은 사유를 기록 중이다
- API route handler 약 130개의 개별 용도
- `apps/web/app/**` 하위 페이지 로컬 컴포넌트(어드민 관리 화면 9종, 편집 워크스페이스 route 파일 등)의 **전량 컴포넌트 인벤토리**. 셸/오버레이 관점에서만 확인했다
- 각 컴포넌트의 **접근성 구현 수준**(focus trap 유무, aria 속성 완비 여부)을 개별 검증하지 않았다. 확인된 것은 네이티브 dialog 요소 0건, focus trap·inert 검색 0건, 편집 워크스페이스 셸에 `role="dialog"`/`aria-modal` 부재(중첩 단축키 도움말 1곳만 예외)뿐이다
- 익명 인라인 SVG 약 180개의 **글리프별 의미 라벨 전수 목록**. 각 파일의 라벨이 i18n 키라 메시지 파일 대조가 추가로 필요하다
- Figma 라이브러리 측 아이콘 컴포넌트 유무
- 제품 저장소의 Figma 컴포넌트 덤프 전량 목록(앞부분만 읽음)
- 제품 문서 `DESIGN_SYSTEM.md`(4,412줄) §6.1~§6.16 본문, `design/pages/10.1~10.12` 12개 문서, 생성 문서 patterns/components 본문 — 개요만 확인했다. **화면별 관측 기록이 들어 있어 Figma 재조립 검증 시 추가 조사 가치가 있다**
- 전역 keyframes 파일(1,165줄)의 개별 애니메이션

### 사실 확인이 필요한 것

- `/pricing`, `/docs`, `/blog`, `/templates`가 sitemap에 없는 사유
- middleware의 게스트 전용 목록에 `/`가 빠진 것이 의도인지 여부. 주석은 게스트 전용이라 서술하지만 실제 조건에 없어 로그인 사용자도 랜딩에 접근 가능하다
- `ExploreScene`(70줄)이 어떤 화면을 그리는지 — 라우트에서 참조되지 않아 렌더 경로가 없다
- `/create/:path*`가 middleware matcher와 보호 목록에 있으나 해당 디렉터리는 존재하지 않는다 (레거시 잔재로 보이나 확정 불가)
- `/docs/nodecanvas`, `/docs/videoeditor`, `/docs/highlight`의 실제 렌더러 (각 19줄 shim만 확인)
- 랜딩 캡처 컴포넌트가 편집 본체를 어떤 모드로 호출하는지
- 편집 본체 내부의 특정 z-index 2지점의 소유 요소
- 독립 하이라이트 셸 레이아웃(210줄)의 세부 구조와, 그 하위 CSS Module 4개의 내용
- 정적 SVG 자산이 **정말 Phosphor 원본인지.** 제품 문서는 원본이라 서술하나 원본 좌표계는 256인데 파일들은 32/24로 내보내져 있고 색이 박혀 있다 — Figma 경유 재내보내기로 보인다. 지오메트리 일치 여부는 검증하지 않았다
- accent yellow와 accent amber 중 어느 쪽이 warning 역할인지 — 코드 근거를 찾지 못했다
- 회색 한 단의 hex 표기와 rgb 미러 간 1 채널 불일치에서 어느 쪽이 의도인지
- 빌드 산출물 디렉터리의 gitignore 여부

### 전제 재확인이 필요한 것

- **제품 저장소의 `design/` 디렉터리와 검증 스크립트 전량이 untracked였다.** 이 인벤토리의 §토큰/스타일 관찰에서 인용한 manifest 상태표, 부채 집계, 게이트 목록은 전부 **커밋되지 않은 로컬 상태**를 읽은 것이다. 커밋 이후 값이 달라졌을 수 있으므로, 이 문서를 근거로 삼기 전에 제품 저장소의 현재 커밋 상태를 재확인해야 한다
- 앱 셸 파일과 편집 본체의 라인 수가 조사 간 차이가 있었다(셸 "4,400줄 이상" vs 5,572줄, 편집 본체 "15,000줄 이상" vs 23,060줄). 더 구체적인 값을 채택했으나 조사 시점 워킹트리 차이일 가능성이 있다