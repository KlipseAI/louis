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

## 배포본 재분해 (2026-08-18) — 낡은 인벤토리의 수를 폐기한다

`migration/screen-inventory.md`는 `sniperfactory-official/klipse`의 `louis`(2026-08-04, dirty)를
읽고 만든 것이고, 그 문서 스스로 **"브라우저 실측 렌더를 하지 않았다"**고 적어 두었다.
배포본 `KlipseAI/klipse-web` `origin/main` 7e9c3b69에서 8화면을 다시 분해했다.

| 단계 | 수 |
| --- | ---: |
| 분해된 구성요소 | **393** |
| 카탈로그로 조립 불가로 1차 판정 | **227** |
| **그중 반증 검증을 실제로 거친 것** | **64** |
| 반증으로 뒤집힌 것 | 8 |
| 확정 미등록 | 56 |
| 중복 제거 후 고유 종류 | **49** |

### 상한을 명시한다 — 163건은 검증되지 않았다

반증 단계에 **화면당 8건**의 상한을 걸었다(8화면 × 8 = 64). 따라서 227건 중 **163건은
아무도 반증을 시도하지 않았다.** 위의 49라는 수는 *"검증을 거친 64건에서 나온 고유
종류"*이지 전체 gap의 크기가 아니다. 검증 비율이 28%이고, 검증된 것 중 **12.5%가
뒤집혔다**는 점을 감안하면 나머지 163건에도 비슷한 비율의 오판이 섞여 있다고 봐야 한다.

**이 수를 "전체 gap"으로 인용하지 않는다.**

### 두 화면 이상에서 쓰이는 것 — 7종

공용 컴포넌트 후보이며 우선순위가 가장 높다.

| 종류 | 화면 | 근거 |
| --- | --- | --- |
| **진행률 링 프로필 아바타** | 하이라이트 상세 · 비디오에디터 워크스페이스 | `components/navigation/Gnb.tsx:5322` |
| **탭 배너 캐러셀** | 앱 홈 · 하이라이트 허브 | `components/banners/TabBannerCarousel.tsx:290` |
| **배너 컨트롤 (화살표 + 진행 도트)** | 앱 홈 · 하이라이트 허브 | `components/banners/TabBannerCarousel.tsx:317` |
| **업로드 진행바 (determinate)** | 하이라이트 상세 · 숏폼 클립 편집 | `components/scenes/HighlightProjectScene.tsx:2652` |
| **사이드바 브랜드 워드마크 행** | 앱 홈 · 노드캔버스 허브 | `components/navigation/Gnb.tsx:4377` |
| **복합 내비 행 + 인셋 생성(+) 버튼** | 하이라이트 허브 · 비디오에디터 허브 | `components/navigation/Gnb.tsx:4743` |
| **사이드바 하단 '보관함' 버튼** | 앱 홈 · 노드캔버스 허브 | `components/navigation/Gnb.tsx:5015` |

### 한 화면 전용 — 42종

제품 전용일 가능성이 높다. 이 저장소의 규칙은 **제품 전용 화면 코드를 공용 규범으로
복사하지 않는다**이므로, 각각 DS가 소유할지 제품이 소유할지 판정이 필요하다.

| 종류 | 화면 | 근거 |
| --- | --- | --- |
| 앱 셸 사이드바 레일 레이아웃 | 앱 홈 | `components/scenes/AppHomeScene.tsx:822` |
| 카드 인라인 이름 변경 입력 | 앱 홈 | `components/scenes/AppHomeScene.tsx:1204` |
| 크레딧 잔량 게이지 바 | 앱 홈 | `components/navigation/Gnb.tsx:3172` |
| 사이드바 생성 행 인셋 「+」 애드온 버튼 | 앱 홈 | `components/navigation/Gnb.tsx:4678` |
| 브레드크럼 (하이라이트 / 프로젝트명) | 하이라이트 상세 | `components/navigation/Gnb.tsx:5285` |
| 리뷰 세그먼트 행 (체크박스 + 썸네일 + 2줄 정보) | 하이라이트 상세 | `components/scenes/HighlightProjectScene.tsx:2926` |
| 상태 카드 스피너 (로딩·업로드·분석·추출) | 하이라이트 상세 | `components/scenes/HighlightProjectScene.tsx:2639` |
| 테마 선택 칩 그룹 | 하이라이트 상세 | `components/scenes/HighlightProjectScene.tsx:2699` |
| 영상 업로드 드롭존 | 하이라이트 상세 | `components/scenes/HighlightProjectScene.tsx:2679` |
| 빈 상태 워드마크 hero | 하이라이트 허브 | `components/scenes/HighlightScene.tsx:1200` |
| 진입 로딩 시머 텍스트 | 하이라이트 허브 | `components/scenes/HighlightScene.tsx:1189` |
| 업로드 카드 셸 (인플로우 960×240 / 하단 고정 400×140 두 변형) | 하이라이트 허브 | `components/scenes/HighlightScene.tsx:885` |
| 업로드 드롭존 버튼 | 하이라이트 허브 | `components/scenes/HighlightScene.tsx:895` |
| 점 격자 배경 | 노드캔버스 에디터 | `components/scenes/create/node-canvas-v2/components/CanvasBackground.tsx:11` |
| 도움말 버튼 점 뱃지 | 노드캔버스 에디터 | `components/scenes/create/node-canvas-v2/index.tsx:11136` |
| 하단 플로팅 툴바 알약 | 노드캔버스 에디터 | `components/scenes/create/node-canvas-v2/components/Toolbar.tsx:269` |
| 프로젝트명 인라인 이름 편집 | 노드캔버스 에디터 | `components/scenes/create/ProjectHeader.tsx:507` |
| 프로젝트 헤더 크롬 (프로그레시브 블러 + 글래스 브랜드 셸) | 노드캔버스 에디터 | `components/scenes/create/ProjectHeader.tsx:454` |
| 저장 상태 클라우드 글리프 | 노드캔버스 에디터 | `components/scenes/create/ProjectHeader.tsx:559` |
| 툴바 그라디언트 구분선 | 노드캔버스 에디터 | `components/scenes/create/node-canvas-v2/components/Toolbar.tsx:99` |
| 줌 비율 트리거 알약 | 노드캔버스 에디터 | `components/scenes/create/node-canvas-v2/components/CanvasZoomControl.tsx:145` |
| 앱 셸 레이아웃(좌측 레일 예약 + 우측 메인 카드 + 카드 안 스크롤 루트) | 노드캔버스 허브 | `components/scenes/NodeCanvasHomeScene.tsx:86` |
| 잔여 크레딧 진행 바 | 노드캔버스 허브 | `components/navigation/Gnb.tsx:3175` |
| 사이드바 복합 내비 행(내비 + 인셋 생성 버튼) | 노드캔버스 허브 | `components/navigation/Gnb.tsx:4626` |
| 결과 액션 2열 그리드 (YouTube 업로드 primary + 다운로드·다시 편집 soft ghost) | 숏폼 클립 편집 | `app/highlight/[projectId]/shorts/[shortId]/page.tsx:253` |
| 레이아웃 프리셋 칩 + 9:16 미니 다이어그램 | 숏폼 클립 편집 | `app/highlight/[projectId]/shorts/[shortId]/page.tsx:371` |
| 결과 메타데이터 정의 목록 (비율/길이/해상도/용량/형식, 행 사이 상단 구분선) | 숏폼 클립 편집 | `app/highlight/[projectId]/shorts/[shortId]/page.tsx:1284` |
| 전체 화면 로딩 스피너 (36px 링, 두께 3px) | 숏폼 클립 편집 | `app/highlight/[projectId]/shorts/[shortId]/page.tsx:125` |
| 전체화면 확대 미리보기 모달 (플레이어 확대 칩 → 라이트박스) | 숏폼 클립 편집 | `components/ui/VideoPlayer.tsx:674` |
| 결과 9:16 영상 플레이어 (apple 크롬: blur pill 재생바·스크럽·±10초·확대 칩) | 숏폼 클립 편집 | `components/ui/VideoPlayer.tsx:842` |
| YouTube 업로드 모달 (유튜브 플레이어 모사 + 제목·설명·태그 폼 + 예약 선택기) | 숏폼 클립 편집 | `components/youtube/YoutubeUploadModal.tsx:978` |
| 크레딧 카드(플랜 배지 + 잔여 수치 + 4px 잔량 바) | 비디오에디터 허브 | `components/navigation/Gnb.tsx:3147` |
| 메인 카드 표면 크롬(16px 곡률 + glass 프레임 + 베벨, ≤719px 전폭 되돌림) | 비디오에디터 허브 | `components/scenes/VideoEditScene.tsx:83` |
| 프로필 트리거(28px 아바타 + conic 사용량 링) | 비디오에디터 허브 | `components/navigation/Gnb.tsx:5312` |
| 사이드바 브랜드 헤더(로고 레일 + 워드마크 크롭) | 비디오에디터 허브 | `components/navigation/Gnb.tsx:4378` |
| 사이드바 하단 업그레이드 CTA(mint 알약) | 비디오에디터 허브 | `components/navigation/Gnb.tsx:5033` |
| 접이식 소스 섹션 헤더(chevron + 라벨 + 개수 + 추가) | 비디오에디터 워크스페이스 | `components/scenes/create/node-canvas-v2/nodes/VideoEditModal.tsx:16274` |
| 3분할 에디터 워크스페이스 레이아웃 | 비디오에디터 워크스페이스 | `components/scenes/create/node-canvas-v2/nodes/VideoEditModal.tsx:15997` |
| 패널 리사이즈 디바이더 3종 | 비디오에디터 워크스페이스 | `components/scenes/create/node-canvas-v2/nodes/VideoEditModal.tsx:15998` |
| 렌더 진행 오버레이(라벨 + 퍼센트) | 비디오에디터 워크스페이스 | `app/videoeditor/[projectId]/EditorProjectWorkspace.tsx:1114` |
| 결과 영상 플레이어(apple UI variant) | 비디오에디터 워크스페이스 | `app/videoeditor/[projectId]/EditorProjectWorkspace.tsx:1243` |
| 세로 아이콘 에셋 레일 탭(영상·이미지·오디오·텍스트) | 비디오에디터 워크스페이스 | `components/scenes/create/node-canvas-v2/nodes/VideoEditModal.tsx:16015` |

## 판정 — 세 화면 모두 gap 없이 재조립되지 않는다

| 화면 | route | 실측 | gap |
| --- | --- | ---: | ---: |
| 앱 홈 | `/archive` | 321 | 72 |
| 하이라이트 (허브·상세) | `/highlight`, `/highlight/[projectId]` | — | 130 |
| 비디오 에디터 (허브·워크스페이스) | `/videoeditor`, `/videoeditor/[projectId]` | — | 144 |

Figma에 있는 것은 Button component set 하나와 아이콘 26개다.

> **위 표는 2026-08-14의 기준선이다.** 그때 Figma에는 Button 하나뿐이었다. 지금은 여덟이고
> 토큰도 늘었다. 아래 "재측정"이 그 차이를 적는다. **72·130·144를 현재 값으로 인용하지 않는다.**

## 재계수 (2026-08-18) — 카탈로그 gap이 8종 → 2종

`DS-F-006`이 닫혀 Figma component가 **1개 → 18개**가 됐다. 2026-08-14 실측이 "Figma에 있던 자산은
Button component set 하나와 아이콘 26개뿐"이라 적었던 상태가 바뀌었으므로 다시 센다.

**이것은 카탈로그 gap의 재계수이지 화면 gap의 재계수가 아니다.** 72·130·144는 화면을 축 단위로
실측한 수이고, 그 수를 갱신하려면 **Figma에서 Home을 실제로 다시 조립해야 한다.** 아직 하지
않았다. 아래 표를 그 숫자로 인용하지 않는다.

### Home이 요구한 8종 중 6종이 섰다

| 요구 자산 | 2026-08-14 | 지금 |
| --- | --- | --- |
| Button | 있음 | 있음 |
| ProjectCard | 없음 | **web·figma `partial`** |
| SidebarNavItem · AppTopBar | 없음 | **web·figma `partial`**(app-shell-parts) |
| Menu | 없음 | **web·figma `partial`** |
| EmptyState | 없음 | **web·figma `partial`** |
| Badge | 없음 | **web·figma `partial`** |
| **Avatar** | 없음 | **여전히 없음** |
| **BannerCarousel · HomeBannerSlide** | 없음 | **여전히 없음** |

남은 둘의 근거는 [screen-inventory.md](screen-inventory.md)에 있다 — 아바타는 셸 파일에 인라인이고
기본 아바타 SVG만 분리돼 있으며(133·340행), 배너 캐러셀은 **허브 3곳이 공유**한다(150·168·236·279행).
연체 배너(`PastDueBanner`)도 카탈로그에 없는 banner/alert 계열이며 루트 레이아웃 전역이다.

### 아이콘 26개 → 29개

Wave B의 `caret-left`·`caret-right`·`caret-down`을 세웠다(2026-08-18) — **배너 캐러셀의 선행 조건이
풀렸다.** `sidebar-toggle`은 여전히 미보유이고 `magic-wand`·`eye-slash`·`x-circle`은 owner 판정
대기다.

### Avatar 실측 (2026-08-18)

Home의 남은 구멍 둘 중 하나다. **착수 전 census를 여기 남긴다** — 매 컴포넌트에서 가장 비싼
단계이고, 앞선 아홉 번 중 여덟 번은 등록부의 수가 틀렸다.

| 축 | 제품 |
| --- | --- |
| 공용 구현 | **부분만 있다.** `navigation/UserCircleDefaultAvatar.tsx`가 **기본 아바타 SVG 하나**를 소유한다 — 28×28(`w-14 h-14`), `currentColor`, `aria-hidden role="presentation"` |
| 아바타 본체 | **셸 파일에 인라인.** `Gnb.tsx`가 이미지/폴백 분기와 크기를 갖는다. 기본 이미지 센티넬 `DEFAULT_PROFILE_IMAGE_SRC = "__default_avatar__"`가 4곳 |
| 크기 | **24 · 28 둘.** `--profile-avatar-size`가 28px 기본이고 ProjectHeader 슬롯에서 24px로 덮인다(≤480px에서도 28px) |
| 색 | 기본 아바타만 해당 — light `palette-gray-400` · dark `palette-gray-600`. 다크 면 위에서 한 단계 밝게 |
| 링 | **진행률 링이 붙어 있다.** `--profile-ring-width: 2px` · `--profile-ring-gap: 2px` · `--profile-ring-progress`(0%)를 `::after`(`border-radius: 999px`)로 그린다 |
| 그 밖 | `SettingsScene`에 avatar 언급 77건 — 업로드 input 등 편집 흐름이며 시각 계약과 별개다 |

**판정 — Avatar는 링을 소유하지 않는다(2026-08-18).**

이 저장소가 앞서 같은 종류의 경계를 두 번 갈랐고 거기서 기준이 섰다. Slider는 `track` 변형을
**흡수했다** — 같은 컨트롤이 다르게 그려진 것이기 때문이다. SegmentedControl의 선택/비선택은
**variant 축으로 나누지 않았다** — 색만 다르고 기하가 같기 때문이다. 둘 다 "같은 것인가"가
기준이었다.

링은 같은 것이 아니다. **아바타는 신원 표식이고 링은 사용량/진행률이다.** 뜻이 다르다.

- 흡수하면 **모든 Avatar가 쓰지 않을 progress API를 갖는다.** 목록·댓글·멘션에 놓이는 아바타가
  대부분인데 그중 링을 쓰는 곳은 프로필 트리거 하나다
- 흡수하면 **링을 아바타 밖에서 쓸 수 없다.** 제품의 링 계산(`ring-size = avatar + (gap + width) × 2`)은
  감싸는 쪽의 식이지 아바타의 식이 아니다
- **선행 판정이 이미 열려 있다.** 인계서 (1c)가 "determinate 진행률 — 접근성 계약부터 정해야
  한다"로 막아 두었고 제품 전체에 `role="progressbar"`가 1곳뿐이다. 링을 Avatar에 넣으면
  **그 미결 판정이 Avatar의 API로 새어 들어온다**

그래서 Avatar는 **크기 · 이미지/폴백 · 접근성 이름**만 소유한다. 링은 (1c)가 풀린 뒤 아바타를
감싸는 별개 컴포넌트로 세운다. 제품의 링 사용처는 **프로필 트리거 하나**이므로 급하지 않다.

**크기 축은 24·28 둘이고 DS의 control 계단(40/32)과 맞지 않는다.** 아바타는 컨트롤이 아니라
표식이므로 계단을 따를 이유가 없다 — 제품 값을 그대로 옮기는 쪽이 유력하다.

### BannerCarousel 실측 (2026-08-18) — 선행 조건 넷이 충족되지 않았다

Home의 마지막 구멍이다. **Avatar와 달리 지금 착수할 수 없다.** census와 막는 것을 남긴다.

`TabBannerCarousel.tsx` **359줄**, 소비처 3(NodeCanvasHome · VideoEditScene · HighlightScene).
`HomeBannerSlide.tsx`가 앱 홈 전용으로 따로 있다. 합 **4벌 · 2파일**.

| 축 | 제품 |
| --- | --- |
| 배치 | `boxed`(`rounded-16`)와 `full-bleed` 둘 |
| 슬라이드 전환 | fade + `scale(1.012 → 1)`. 비활성은 `pointer-events:none`로 죽인다 |
| 콘텐츠 등장 | **stagger** — `translate3d(0,10px,0) → 0`에 지연을 걸어 순차로 올린다 |
| 톤 | `bright` · `dark`. **`useBannerImageTone(image_url)`이 런타임에 이미지에서 샘플링한다** |
| 부품 | wordmark(h-8, 톤에 따라 둘 중 하나만 보인다) · title(`heading-36-medium`) · description · 화살표 · 점 |
| 점 | 알약. 비활성 7px, **활성 20px로 늘어난다**(폭이 상태다) |
| 자동 넘김 | `useEffect` 타이머 |
| reduced-motion | `motion-reduce:duration-[0.01ms]` |

**막는 것 넷. 전부 이 컴포넌트 바깥의 미결이다.**

1. **톤이 런타임 샘플링이다.** 이 문서가 이미 "dominant-color 동적 텍스트 반전 — 런타임 휘도
   계산"을 Figma 표현 불가로 적고 "밝은/어두운 두 variant로 근사"라고 남겼다. 근사는 Figma
   쪽 이야기이고 **코드 쪽은 이미지 샘플링 훅에 달려 있어** DS가 소유할 수 있는 계약이 아니다
2. **progressive blur.** 같은 표가 `backdrop-filter` + 다단 mask를 표현 불가로 적었다. DS에는
   `blur-*` 토큰 둘뿐이고 단계적 흐림을 표현할 방법이 없다
3. **stagger.** 같은 표가 "진입 stagger · `filter` 단계"를 표현 불가로 적었다. DS motion에는
   **지연 축이 사실상 없다** — 인계서 (1a)가 `motion-*-delay` 8종이 **전부 0ms**이고 CSS가
   delay를 생략한다고 적어 두었다. stagger를 세우려면 그 8종의 처분부터 정해야 한다
4. **점의 폭이 상태다.** 7px ↔ 20px 전환은 `layout-change` motion이고, 그 토큰이 없다는 것이
   SegmentedControl에서 이미 걸린 미결이다

**그래서 순서가 있다.** (1a) delay 토큰 처분 → `layout-change` lifecycle → blur·톤의 표현 방법
(또는 채택하지 않는다는 판정)이 풀린 뒤라야 이 컴포넌트가 정직하게 선다. 지금 지으면 **네 미결이
전부 이 컴포넌트의 API와 Figma 계약으로 새어 들어온다** — Avatar에서 링을 흡수하지 않은 것과
같은 이유다.

**대안 하나.** 배너를 `boxed` 정지 상태(전환·stagger·blur·샘플링 없음, 톤은 prop)로만 먼저
세우고 움직임을 뒤로 미루는 길이 있다. 다만 그 경우 Home 재조립의 gap이 "없다"가 아니라
**"정지 상태만 있다"**가 되므로, 그것을 gap 0으로 셀지는 owner 판정이다.

### BannerCarousel 재실측 (2026-08-18) — 넷 중 셋이 무너졌고 다섯째가 나왔다

배포본 `KlipseAI/klipse-web` `origin/main` 7e9c3b69의 `TabBannerCarousel.tsx`를 직접 읽었다.
**앞의 "막는 것 넷"은 재보지 않고 세 번 반복한 것이다.** 재보니 셋이 값이었다.

| 막는다던 것 | 실측 | 판정 |
| --- | --- | --- |
| stagger 지연 축이 없다 | 0 · 40 · 80 · 150ms | **해소** — 토큰 `motion-stagger-1/2/3` |
| 점 폭 전환 토큰이 없다 | `width 220ms cubic-bezier(.4,0,.2,1)` + 배경 160ms | **해소** — `motion-layout-change`, DS-D-0019 |
| 톤이 런타임 샘플링이다 | 제품은 톤을 CSS 변수 **두 개**로만 넘긴다 | **해소** — DS는 `tone` prop, 샘플링은 제품 |
| progressive blur를 표현할 수 없다 | `blur(22px) saturate(125%)` + 5스톱 mask | **CSS는 해소**, Figma 근사만 남음 |

#### 다섯째 — 테마와 무관한 색이 DS에 없다

제품의 배너 부품은 **고정 `--palette-gray-*`를 쓴다.** 주석이 이유를 적어 뒀다 — *"사이트 테마와
무관하게 항상 같은 모습이어야 하므로 테마에 따라 뒤바뀌는 `--gray-*` semantic 토큰 대신"*.
배너의 면은 **사진**이지 테마 표면이 아니기 때문이다.

DS의 semantic 색 41개는 **전부 테마를 따라 뒤집힌다.** 그리고 CSS 게이트가 primitive 직접 소비를
막는다(canary `primitive consumption`). 즉 지금 상태로는 이 컴포넌트의 색을 정직하게 쓸 수 없다.

**이것은 CSS를 실제로 쓰려고 해서 발견됐다.** 앞의 넷은 문서를 읽어 적은 것이고 이것은 손이
멈춰서 나온 것이다.

#### 실측 명세 (구현 단위의 입력)

| 부위 | 값 |
| --- | --- |
| 컨테이너 | `boxed` radius 16px(= `--kds-radius-card`) · `fullBleed` 0. overflow hidden |
| 슬라이드 | absolute inset 0. 활성 `opacity 1 / scale(1)`, 비활성 `opacity 0 / scale(1.012)` + `pointer-events: none` |
| 슬라이드 전환 | opacity 420ms `ease` · transform 680ms `cubic-bezier(.22,1,.36,1)` |
| 배경 | `background-position: 68% center`, cover |
| 스크림 | `linear-gradient(to right, scrim/78% 0%, scrim/46% 30%, scrim/0% 60%)` |
| progressive blur | `::before` `backdrop-filter: blur(22px) saturate(125%)` + `mask-image: linear-gradient(to right, 100% 0%, 92% 24%, 52% 50%, 18% 68%, 0% 82%)`. reduced-motion에서 **둘 다 none** |
| 콘텐츠 | `min(540px, 100%)` · padding 24px / 20px |
| 워드마크 | 높이 16px · opacity .85 · 톤에 따라 둘 중 하나만 |
| 텍스트 묶음 | gap 6px. 제목 heading-36-medium, 설명 body-16-regular · margin-top 6px · max 480px · 텍스트색 72% |
| stagger | 비활성 `opacity 0 / translate3d(0,10px,0)`. 지연 워드마크 40 · 제목 80 · 설명 150ms. **나갈 때는 지연 0** |
| 컨트롤 | 우하단 16px · gap 8px · padding 4px · pill · 배경 28% · `backdrop-filter: blur(12px) saturate(130%)` |
| 화살표 | 28×28 · pill · 색 88% · hover 배경 14% · active `scale(.94)` · 전환 160ms |
| 점 | 높이 7px · 비활성 폭 7px 색 45% · **활성 폭 20px 색 100%** · 전환 `width 220ms cubic-bezier(.4,0,.2,1)`, 배경 160ms |
| 자동 넘김 | 5,500ms |

`w-10`이 40px이 아니라 20px인 것은 제품이 `--spacing: 2px` 격자를 쓰기 때문이다
(`app/tailwind.css`). 이 사실은 렌더 게이트가 `@theme`을 번역하기 전까지 게이트에서 지워져 있었다.

### ProgressBar 실측 (2026-08-18) — 정본이 없고, 한 벌은 정의되지 않은 색을 쓴다

배포본에서 determinate 진행바 **2벌**을 읽었다. 감사가 공용 후보 7종에 넣은 항목이며, Avatar가
링을 미룬 사유(*"determinate 진행률의 접근성 계약"*)도 여기에 걸려 있다.

| 축 | 하이라이트 상세 | 숏폼 클립 편집 |
| --- | --- | --- |
| 높이 | **6px** | **6px** |
| 반경 | **3px** | **3px** |
| 최대 폭 | **320px** | **320px** |
| 폭 | 100% | 60% |
| 트랙 색 | gray-900 10% (다크는 gray-000 10%) | gray-900 12% |
| 채움 색 | `var(--palette-primary-500, #6366f1)` | `var(--palette-gray-900)` |
| 전환 | 없음 | `width 300ms ease` |

**합의하는 축은 셋뿐이다** — 높이 · 반경 · 최대 폭. 그 셋은 그대로 옮긴다.

#### 채움 색 — 제품 변수 이름에 오타가 있다

처음엔 "정본이 없다"고 적었는데 **틀렸다.** 의도한 색은 분명하다.

`--palette-primary-500`이라는 이름이 제품에 **0곳**이다. 제품에서 `--palette-` 접두사는 **회색
계열에만** 쓰이고(`--palette-gray-000` 등), 파랑 계열은 접두사 없이 `--primary-500`이다
(`globals.css:159`, `#0088ff`). 진행바가 회색 쪽 규칙을 유추해 접두사를 붙였고, 그 이름이 없어서
CSS 폴백 `#6366f1`(인디고)로 떨어졌다.

**즉 브랜드 파랑으로 그리려던 것이 인디고로 그려지고 있다.** 제품 쪽 결함이며 고칠 곳은 이름
하나다(`--palette-primary-500` → `--primary-500`).

DS는 의도한 값을 채택한다. `color-action-primary`가 이미 `#0088ff`로 **정확히 같은 값**이라
따로 정할 것이 없다. `product.measured.json`에는 `adopted`로 적되, 인용한 제품 값이 **화면에
실제로 그려지는 색이 아니라 의도한 색**이라는 사실을 함께 남긴다.

숏폼은 `--palette-gray-900`(거의 검정)을 쓴다. 이쪽은 오타가 아니라 다른 선택이며, 두 벌이 서로
다른 색인 것은 그대로다 — 다만 **한쪽이 사고라는 점이 달라졌다.**

#### 전환도 갈린다

한 벌은 없고 한 벌은 300ms다. 정본이 없으므로 `motion-layout-change`(220ms)를 쓴다 — 폭이 변하는
같은 lifecycle이고 캐러셀 점과 같은 곡선이다([DS-D-0019](../design/governance/decisions/DS-D-0019-layout-change-motion.md)).

#### 남은 판정 — 접근성

`role="progressbar"`와 `aria-valuenow`가 필요하고, **값이 바뀔 때 스크린 리더가 얼마나 자주 읽을지**를
정해야 한다. 매 퍼센트마다 읽으면 100번 말한다. 구현 단위에서 `aria-live`를 걸지 말지 판정한다.

### 사이드바 부품 실측 (2026-08-18) — 앱 홈 템플릿의 선행 조건

배포본 `origin/main` 7e9c3b69의 `Gnb.tsx`를 읽었다. 감사가 확정한 공용 7종 중 넷이 여기 있다.

#### 1. 브랜드 워드마크 행 (`sidebarHeaderRow` · `sidebarLogoRail` · `sidebarBrandCrop`)

| 축 | 값 |
| --- | --- |
| 행 | `display:flex` · `align-items:center` · `gap:8px` · `width:100%` · `flex-shrink:0` |
| 로고 레일 | `min-height: var(--app-gnb-sidebar-logo-h, 28px)` · `overflow:hidden` |
| 크롭 | `transition: width 320ms cubic-bezier(0.4, 0, 0.2, 1)` |

#### 2. 하단 업그레이드 CTA (`sidebarUpgradeWrap` · `sidebarUpgradeButton` · `sidebarUpgradeLabel`)

| 축 | 값 |
| --- | --- |
| 자리 | `margin-top:auto` · `width:100%` · `padding-bottom: env(safe-area-inset-bottom, 0)` |
| 버튼 | `inline-flex` · `gap:8px` · `width:100%` · 타이포 `type-body-14-medium` |
| 라벨 | `max-width:240px` → 접힘 상태 `4.5rem`. `transition: max-width 320ms cubic-bezier(0.4, 0, 0.2, 1)` |

#### 3. 프로필 사용량 링 (`profileTrigger` · `profileImage`)

| 축 | 값 |
| --- | --- |
| 아바타 | `--profile-avatar-size: 28px` · `border-radius:999px` · `object-fit:cover` |
| 링 | 두께 `2px` · 간격 `2px` · 색 `var(--accent-mint-500)` · 트랙 `gray-000 / 20%` |
| 링 지름 | `avatar + (gap + width) × 2` = **36px** |
| 진행률 | `--profile-ring-progress: 0%` — 런타임 값 |

#### 4. 복합 내비 행

감사가 `Gnb.tsx:4626`·`:4743`에서 확인했다. 내비 행 안에 생성(+) 버튼이 인셋으로 들어간다.

#### 여기서 나온 판정 하나 — `motion-layout-change`가 한 값으로 부족하다

사이드바의 접힘 전환이 **320ms** `cubic-bezier(0.4, 0, 0.2, 1)`인데, 캐러셀 점은 **220ms**에 같은
곡선이다. 곡선은 같고 지속만 다르다. [DS-D-0019](../design/governance/decisions/DS-D-0019-layout-change-motion.md)가
연 lifecycle은 맞지만 **토큰이 하나뿐이라 둘 중 하나는 틀린 값을 쓰게 된다.**

구현 단위에서 `motion-layout-change`를 크기 축으로 가를지(예: 컨트롤 220 · 셸 320) 판정한다.
재보지 않고 하나로 뭉치면 오늘 반복된 실수를 또 하는 것이다.

#### 아이콘도 없다

카탈로그 29개에 노드 캔버스 · 비디오 에디터 · 하이라이트 · 분석 아이콘이 없다. `magic-wand`는
이 문서가 이미 *"−45° 회전 rect라 `transform` 없이 표현되지 않는다 · 이관 보류"*로 적어 두었고,
그 처분이 사이드바의 선행 조건이 됐다.

### 다음 순서

Avatar와 Banner/Carousel 둘이 카탈로그의 다음 후보다. 등록부 우선순위 1~15에 없었던 이유는
그 목록이 **컴포넌트 확산도**로 정렬됐기 때문이고, 화면 재조립 기준으로는 이 둘이 Home의
마지막 구멍이다. 세우고 나서 Home을 조립하면 그때 화면 gap의 실제 수가 나온다.

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
| T-5 `layout-project-card-minimum` 소비처 | **해소**(2026-08-18) | Project Grid 패턴이 섰고 `.kds-project-grid`가 **첫 CSS 소비처**다. 추측이 맞았다 — 이 토큰은 카드가 아니라 그리드의 것이었다. 다만 제품이 쓰지 않는 `minmax` 알고리즘이라는 지적은 그대로다: DS는 container 기반 `auto-fill`로 가고 제품은 breakpoint 고정이며, 그 둘이 같은 결과를 내는지는 브라우저 테스트가 환산해 대조한다 |
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

> **2026-08-18: 1~15순위가 전부 섰다.** 15항목 중 Web `partial` 15, Figma `partial` 11 ·
> `not-ready` 4(Slider · SegmentedControl · Checkbox · SelectableListRow). 남은 것은 Figma
> component set 넷과 화면 단위 gap 재계수다.

우선순위는 **몇 화면에 걸치는가 × 저장소 확산도**로 정했다. 확산도는 직접 센 값이다.

| 순위 | component | 화면 | 저장소 확산 | 근거 |
| ---: | --- | --- | --- | --- |
| 1 | **IconButton** | 3/3 | 세 화면 raw button 108개의 다수 | 정사각 아이콘 전용. 에디터 클래스 정의 33개, 하이라이트 9개. Button의 빠진 축 |
| 2 | **Tooltip** | 2/3 | **22 파일** | 제품 Button(17 파일)보다 넓게 쓰이는데 공용 컴포넌트가 없다 |
| 3 | **Toast** | 3/3 | **20 파일** | 같은 이유. 카탈로그에 규범조차 없다 |
| 4 | **Menu / Popover** | 3/3 | 서피스 정의 3벌 | 코드에 ActionMenu가 있으나 Figma component가 없다. 임의 좌표 앵커 변형이 추가로 필요 |
| 5 | **Dialog** | 3/3 | 직접 import 8곳 | 코드에 있고 Figma에 없다. DS-F-006 대상 |
| 6 | **ProjectCard** | 3/3 | 정의 **4벌** | 앱 홈·노드캔버스 홈·하이라이트 허브·에디터 허브. **web·figma partial**(2026-08-16) — 네 벌의 기하가 같아 그 값을 정본으로 옮겼다. parity 게이트가 자손 기하·타이포·흐림·자식 순서를 대조한다 |
| 7 | **TextField / Input** | 2/3 | **약 40벌 · 5계열** | 공용 구현 0. **web·figma partial**(2026-08-16) |
| 8 | **EmptyState** | 3/3 | **9벌**(살아 있는 것 8) | 홈 2 · 하이라이트 2(그중 1은 죽은 분기) · 에디터 **5**. **web·figma partial**(2026-08-16) — 9벌이 합의하는 축은 "면을 갖지 않는다" 하나뿐이고 그것을 옮겼다 |
| 9 | **Badge / StatusBadge** | 3/3 | **65벌** | **web·figma partial**(2026-08-17). "톤 4 + 상태 5"는 **둘 다 틀렸다** — 네 톤 클래스의 선언이 바이트 단위로 같고, 앱 홈 4변형의 색이 전부 `var(--gray-400)`다. 두 축 다 죽어 있었다 |
| 10 | **Spinner / Progress** | 2/3 | **약 62벌** | 재실측(2026-08-17): 회전 스피너 **22벌** · 스켈레톤 **15벌**("0종"이 틀렸다) · 진행률 5 · 텍스트 쉬머 11. 회전 키프레임 이름 18개인데 본문은 1종이다. **web·figma partial**(2026-08-17). 공용 LoadingSpinner의 recipe가 motion-loop와 정확히 같아 그것을 정본으로 옮겼다. determinate 진행률·스켈레톤·텍스트 쉬머는 별도 컴포넌트이며 아직 없다 |
| 11 | **SidebarNavItem · AppTopBar** | 3/3 | 앱 셸 **25파일** | **web·figma partial**(2026-08-18). "31곳"은 두 컴포넌트 합산이었다 — 앱 셸 Gnb 25 + 랜딩 Gnb 7, 한 파일이 둘 다 import한다. 셸 composition과 compact 드로어는 아직 없다 |
| 12 | **Slider** | 1/3 | **37벌 · 7레시피 · 6파일** | **web `partial` · figma `not-ready`**(2026-08-18). "에디터 `Slider.Root` 9"는 네 배 틀렸다 — Radix 22벌(3파일)을 덜 셌고 **네이티브 `input[type=range]` 15벌(5파일)을 통째로 빠뜨렸다.** 일곱 레시피가 **합의하는 축이 하나도 없어**(트랙 2·4·20·28px, 썸 0·10·12·14·16px) 정본이 없다. 포커스 표시를 명시적으로 지운 것이 25벌(68%)이고 옮기지 않았다. 인스펙터 17벌의 "썸을 지운 채움 막대"는 `track` 변형이 흡수하되 표식을 실제 썸으로 만들었다 |
| 13 | **SegmentedControl** | 2/3 | **11벌 · 6레시피 · 8파일** | **web `partial` · figma `not-ready`**(2026-08-18). "3 파일"은 틀렸다. Slider와 달리 **공용 구현이 둘 있는데 서로 아무것도 공유하지 않는다** — `SegmentedToggle` 컴포넌트(3벌, 스스로 SSOT라고 적혀 있다)와 `useSegmentedControlThumb` 훅(4벌, 스타일은 복붙). 전자를 정본으로 채택했고 반경·padding 3축에 기계 대조가 붙었다. `role="tablist"` 14곳 중 **5곳은 패널을 바꾸는 탭**이고 3곳은 카루셀 점이라 갈랐다 — 그쪽은 Tabs이며 아직 카탈로그에 없다 |
| 14 | **Checkbox** (indeterminate) | 1/3 | **21벌 · 5레시피 · 14파일** | **web `partial` · figma `not-ready`**(2026-08-18). "4 파일"은 틀렸다. **제품에 정본이 있는데(globals.css의 `.app-native-checkbox`) 21벌 중 2벌만 쓴다** — 그 클래스가 cascade layer 밖이라 소비처가 이길 수 없어, 색 하나를 바꾸려면 선언을 베껴야 했다. 크기 20px만 채택하고 `accent-color`는 버렸다. `indeterminate`는 제품에 1벌뿐이다. **선택 안 한 테두리 대비가 SC 1.4.11에 미달하고 테두리 토큰 셋 중 어느 것도 라이트에서 3:1을 넘지 못한다**(실측 1.27 · 1.38 · 2.52) |
| 15 | **SelectableListRow** | 2/3 | **3벌 — 등록부가 맞았다** | **web `partial` · figma `not-ready`**(2026-08-18). 아홉 번 만에 처음으로 수치가 맞았다. 셋이 합의하는 것은 골격(가로 flex · 선행 슬롯 · hover 면 · 전환 140ms)이고 선택 소유가 갈린다 — 하이라이트 2벌은 행의 면, 에디터 1벌은 안의 체크박스. 후자는 Checkbox가 소유한다. **다크에서 `background-inset`이 `surface`와 같은 색이라 표면 위 목록에서 선택 면이 사라져** 3px 선행 표식을 함께 그린다. 같은 위험이 SidebarNavItem에 남아 있다 |

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
| `caret-left` `caret-right` `caret-down` | 배너 화살표, 드롭다운 트리거 | **보유**(2026-08-18). 저장소에서 직접 그렸다 — 출처를 대조할 수 없는 상태에서 upstream이라 적으면 추정 출처가 되고 DS-D-0008이 그것을 빌드 실패로 둔다 |
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
