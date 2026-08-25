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
| 컨테이너 | `boxed` radius 16px(= `--louis-radius-card`) · `fullBleed` 0. overflow hidden |
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

DS는 의도한 값을 채택한다. `color-accent-primary`가 이미 `#0088ff`로 **정확히 같은 값**이라
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

### 전수 검증 (2026-08-18) — 미검증 163건을 끝냈습니다

앞선 분해는 화면당 8건만 반증을 거쳤고 **163건이 검증되지 않은 채로 남아 있었습니다.** 8화면을
다시 열어 **전부** 판정했습니다.

| 판정 | 수 |
| --- | ---: |
| 판정한 항목 | 277 |
| 중복 제거 후 고유 | **248** |
| 기존 카탈로그로 **조립됨** | **108** |
| **미등록** | **84** |
| 제품 전용(DS가 소유하지 않아야 함) | 39 |
| 런타임 계산이라 표현 불가 | 17 |

**"227 미등록"은 과대였습니다.** 실제로는 248 중 84이고, 절반 가까이(108)가 이미 카탈로그로
조립됩니다. 그리고 39는 이 저장소 규칙상 **DS가 만들면 안 되는 것**입니다.

#### 84건을 주제로 묶으면

| 주제 | 수 |
| --- | ---: |
| **앱 셸 조립** | **14** |
| 카드 상호작용 | 14 |
| 타이포·메뉴 | 7 |
| 칩·선택 | 6 |
| 에디터 워크스페이스 · 진행률 · 아이콘 · 모션/표면 | 5씩 |
| 업로드·드롭 | 4 |
| 플레이어 | 3 |
| 그 외 | 16 |

**앱 셸이 14건으로 가장 큽니다.** 그런데 그 14건은 서로 다른 부품이 아니라 **같은 것이 화면마다
다른 이름으로 잡힌 것**입니다 — `app-shell-composition` · `app-shell-page-frame` ·
`app-shell-main-surface` · `app-shell-rail-gnb` · `main-card-chrome-surface` ·
`main-card-surface-chrome` · `in-card-header-slot` · `top-chrome-portal-slot` 등.

즉 **`app-shell` 패턴 하나가 서면 14건이 함께 닫힙니다.** 그것이 `web: not-ready`인 유일한 이유로
홈 템플릿을 내렸고, 여덟 화면이 각자 그 부재를 보고한 것입니다.

카드 상호작용 14건도 비슷하게 뭉칩니다 — hover에서 드러나는 더보기 버튼, 인라인 이름 변경,
진입 stagger, 우클릭 메뉴. **ProjectCard 하나의 상호작용 축**입니다.

#### 그래서 순서가 정해집니다

1. **`app-shell` 패턴** — 14건이 함께 닫힌다
2. **ProjectCard 상호작용 축** — 14건
3. 진행률(5) · 아이콘(5) — 이미 판정이 있다
4. 나머지는 화면 재조립을 하면서 필요한 것만

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
| T-5 `layout-project-card-minimum` 소비처 | **해소**(2026-08-18) | Project Grid 패턴이 섰고 `.louis-project-grid`가 **첫 CSS 소비처**다. 추측이 맞았다 — 이 토큰은 카드가 아니라 그리드의 것이었다. 다만 제품이 쓰지 않는 `minmax` 알고리즘이라는 지적은 그대로다: DS는 container 기반 `auto-fill`로 가고 제품은 breakpoint 고정이며, 그 둘이 같은 결과를 내는지는 브라우저 테스트가 환산해 대조한다 |
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


## 전 컴포넌트 제품 대조 (2026-08-19)

"지금 있는 모든 컴포넌트를 실제품과 대조해"에 대한 결과다. 그전까지 제품 값은 대부분 사람이
코드를 읽고 옮긴 것이었고 기계 대조는 **10축**뿐이었다. 이제 제품 소스의 클래스 상수를
**손으로 옮기지 않고** 배포 커밋에서 직접 꺼내 제품 자신의 Tailwind로 컴파일하고, 실브라우저에서
계산값을 읽어 DS와 맞춘다 — 탐침 60종 · **137축** · 컴포넌트 21/21.

`scripts/measure-product-components.mjs`가 그 게이트이며 축마다 `same`(같아야 한다) 또는
`deviates`(달라야 하고 사유가 있어야 한다) 중 하나를 요구한다. **편차가 사라지는 것도 실패다** —
사유가 낡았다는 뜻이기 때문이다. canary 4종이 검출력을 매 실행 증명한다.

### 이 대조로 드러난 것 — 제품과 달랐고 고친 것

| 축 | 제품 | 고치기 전 DS | 무엇이 틀렸나 |
| --- | ---: | ---: | --- |
| 배너 높이 | 360 | 240 | `h-180`과 `--spacing: 2px`를 곱하지 않고 눈대중으로 정한 값이었다 |
| 브랜드 행 높이 | 40 | 24 | 아이콘 슬롯 크기(`icon-size-lg`)를 행 높이로 착각했다 |
| 브랜드 마크 레일 | 28 | 없음 | 제품의 `--app-gnb-sidebar-logo-h`에 해당하는 부품이 아예 없었다 |
| 내비 항목 좌우 여백 | 4 | 8 | 레일 12 + 행 4 = 본문 16이라는 정렬 산수를 읽지 않았다 |
| 사이드바 CTA 아이콘 | 없음 | plus 글리프 | 제품을 읽지 않고 지어냈다 |
| 사이드바 CTA 색 | mint | 브랜드 파랑 | 같은 이유다 |
| 사이드바 CTA 접힘 | 32 / 0·10 | 40 / 10·14 | 접힘이 폭만 줄인다고 보았다 |
| 내비 항목 글자 | 14 | 기록 없음 | 축 자체가 없었다 |

### 남은 편차 — 다르고, 다른 이유가 있다

| 축 | 제품 | DS | 사유(요약) |
| --- | ---: | ---: | --- |
| `button-secondary-border.borderTopWidth` | 1 | 0.5 | 제품 1px, DS 0 |
| `tooltip.borderTopWidth` | 1 | 0.5 | 제품 1px, DS 0 |
| `toast.height` | 48 | 45 | 제품 48, DS 45 |
| `menu-item.height` | 40 | 44 | 제품 40, DS 44 |
| `dialog-card.paddingTop` | 16 | 20 | 제품 16, DS 20 |
| `dialog-card.borderTopLeftRadius` | 24 | 20 | 제품 24, DS 20 |
| `dialog-card.borderTopWidth` | 0 | 0.5 | 제품 0, DS 0 |
| `input-box.borderTopWidth` | 1 | 0.5 | 제품 1px, DS 0 |
| `empty-state.paddingLeft` | 0 | 16 | 제품 0, DS 16 |
| `spinner-sm.::after:borderTopWidth` | 2 | 1 | 제품 2, DS 1 |
| `selectable-row.paddingTop` | 6 | 8 | 제품 6, DS 8 |
| `selectable-row.columnGap` | 10 | 8 | 제품 10, DS 8 |
| `selectable-row.borderTopLeftRadius` | 14 | 10 | 제품 14, DS 10 |
| `segmented-segment.height` | 28 | 32 | 제품 28, DS 32 |
| `segmented-track.columnGap` | 2 | 8 | 제품 2, DS 8 |
| `skeleton.borderTopLeftRadius` | 999 | 8 | 제품 999(알약), DS 8 |
| `skeleton.::after:animationDuration` | 1300 | 1600 | 제품 1300ms, DS 1600ms |
| `top-bar.paddingLeft` | 8 | 16 | 제품 8, DS 16 |
| `slider-thumb-root.height` | 24 | 40 | 제품 24, DS 40 |
| `slider-track-root-panel.height` | 28 | 40 | 제품 28, DS 40 |
| `nav-item-inner.columnGap` | 10 | 8 | 제품 10, DS 8 |
| `nav-item-hover-light.backgroundColor` | rgb(228 229 233 / 0.5) | color-accent-ghost-hover | 라이트만 갈린다 |
| `progress-bar-track.borderTopLeftRadius` | 3 | 999 | 제품 3, DS 999(알약) |
| `nav-row.borderTopLeftRadius` | 10 | 0 | 제품 10, DS 0 |
| `nav-row.paddingLeft` | 4 | 0 | 제품 4, DS 0 |
| `progress-bar-fill.borderTopLeftRadius` | 3 | 999 | 제품 3, DS 999(알약) |
| `segmented-segment.borderTopWidth` | 0 | 0.5 | 제품 0, DS 0 |
| `segmented-thumb.height` | 28 | 32 | 제품 28, DS 32 |

전문은 `migration/product.rendered-components.json`의 `deviations`가 갖는다.

### Slider — "정본이 없다"를 "재지 않는다"로 바꾸지 않는다

처음에는 slider를 면제했다. 제품 정의 37벌이 일곱 레시피로 갈려 대표값이 없다는 것이 사유였다.
사실은 맞지만 결론이 틀렸다 — **어느 벌을 골랐는지 적으면 그 자체가 판정이고**, 아무것도 재지 않는
것보다 낫다. thumb형은 DS 기하에 가장 가까운 `ClipCropModal.tsx CROP_SLIDER_*`, track형은 최다
사용(8곳)인 `VideoEditModal.tsx overlayRadix*`를 골랐다.

골라서 재 보니 레일 4 · 썸 16 · 썸 테두리 2 · 트랙 레일 28/20 · 표식 2×14가 **전부 일치했다.**
어긋나는 것은 컨트롤 높이 하나이며(제품 24·28 vs DS 40) 그것은 control 계단을 따른 의도된 편차다.
면제 상태였다면 이 여덟 축의 일치를 아무도 증명하지 못했을 것이다.

이제 면제는 0건이고, 게이트는 사유 없는 미대조를 실패로 만든다.


## 탐침이 제품에 없는 모습을 재고 있었다 (2026-08-19, 2차)

1차 대조를 끝내고 **탐침 자체가 틀렸다**는 것을 발견했다. 탐침이 쓴 클래스만 컴파일했기 때문이다.

제품에는 **형제 상수에 선언되어 이 요소를 겨누는 규칙**이 있다. 업그레이드 버튼이 그렇다 —
`sidebarUpgradeButton`은 mint 16%를 선언하지만, 형제 상수 `sidebarUpgradeButtonActive`가
`html[data-theme=*] .gnb-sidebarUpgradeButton:not(&)`를 선언해 **비활성 버튼의 색을 덮는다.**
그 상수를 컴파일하지 않으면 규칙이 스타일시트에 없고, 탐침은 제품에 존재하지 않는 mint를 잰다.
그래서 CTA 색을 두 번 틀렸다 — 처음엔 브랜드 파랑, 다음엔 mint.

이제 탐침이 읽은 제품 파일의 **클래스 후보를 전부** 컴파일한다. 제품 번들도 저장소 전체를
훑으므로 그쪽이 더 충실하다. 함께 세 가지를 넓혔다.

- **색 대조.** measured가 색을 토큰 이름으로 적으므로 생성된 `tokens.css`에서 테마별 값을 꺼내
  제품이 렌더한 색과 맞춘다. 기하만 맞추고 색을 넘기면 "제품과 같다"고 말할 수 없다.
- **라이트 테마 문서.** 제품 규칙의 상당수가 `html[data-theme=light]`를 조상으로 요구한다.
- **조상이 둘인 규칙.** `wrapper`가 배열이면 바깥부터 겹쳐 감싼다.

### 이 2차 대조로 고친 것

| 컴포넌트 | 축 | 제품 | 고치기 전 DS |
| --- | --- | --- | --- |
| SidebarCta | 면 · 글자 | 반전 solid pill (테마 반전) | **mint 500 16% · mint 700** |
| SidebarCta | 현재 위치 | 한 단계 더 반전 | **variant 자체가 없었음** |
| SidebarCta | 접힘 라벨 | 54px 말줄임 · 12px | **폭 0으로 완전히 지움** |
| SidebarCta | 접힘 폭 | 32 (레일 56 − 여백 24) | 44 |
| SidebarBrand | 좌측 여백 | 4 → 접힘 0 | **선언 없음(0)** |
| SidebarBrand | 접힘 폭 | 32 | 72 |
| AppTopBar | 제목 글자 | 16 / 24 / 500 | 14 |
| AppTopBar | 선행 슬롯 간격 | 4 | 8 |
| EmptyState | 액션 사이 간격 | 12 | 8 |
| ProjectCard | 오버레이 아래 모서리 | `0 0 16px 16px` | **선언 없음(0)** |
| ProjectCard | 진입 이동량 | 18px | 8px |
| BannerCarousel | 스크림 칠 순서 | 사진과 같은 background 층 | **`::after`라 글자 위에 칠해짐** |

마지막 것이 가장 컸다. 스크림이 `::after`이고 콘텐츠와 둘 다 positioned·z-index 없음이라
트리 순서대로 칠해졌고, `::after`가 마지막이라 **제목과 설명 위에 스크림이 덮였다.**
규범 문서는 "숫자 z-index를 쓰지 않는다 — 결과는 같다"고 단언하고 있었는데 결과가 같지 않았다.
스크림을 슬라이드 자신의 `background-image` 첫 레이어로 옮겨 구조적으로 그 상태가 될 수 없게 했다.

### 판정 근거

의심 축 222개를 컴포넌트별로 판정하고, `ds-wrong`으로 살아남은 것은 다시 반증 전용 판정을
거치게 했다(확신이 없으면 기각). 결과는 `ds-wrong` 26 → 반증 통과 14, `recorded-deviation` 95,
`already-covered` 35, `not-real` 66이다. 통과한 14 중 측정 가능한 것은 전부 게이트 축이 됐다.


## hover와 문서 상태까지 잰다 (2026-08-19, 3차)

2차까지도 두 종류의 값을 놓치고 있었다.

**hover 전용 선언은 `getComputedStyle`로 읽히지 않는다.** 마우스를 올리거나 CDP로 상태를 강제하는
방법은 둘 다 흔들렸다. 대신 스타일시트에서 이 요소를 겨누는 `:hover` 규칙을 모아 특이도·소스
순서대로 복제본에 얹고 계산값을 읽는다. 값이 시트에서 오므로 사람이 옮겨 적을 자리가 없다.
(처음에 한 건도 안 잡힌 이유는 `:hover`를 지울 때 **이스케이프된 클래스 이름 안의 `\:hover\:`까지**
지워 선택자가 깨졌기 때문이다.)

**문서에 사이드바가 있다는 사실 자체가 색을 바꾼다.** 배포본의 `wrapperSidebar`는
`html[data-theme=light] body:has(&)`로 `--palette-gray-*`를 통째로 한 단계 밝게 재매핑한다.
그 표식이 없으면 라이트 탐침이 제품에 없는 색을 잰다 — 실제로 업그레이드 CTA의 라이트 전경을
`neutral.100`으로 잘못 재고 있었고 실제 값은 `neutral.50`이다.

### 3차에서 고친 것

| 컴포넌트 | 축 | 제품 | 고치기 전 DS |
| --- | --- | --- | --- |
| SidebarCta | 그림자 | 안쪽 1px 링 + 얕은 드롭 | **선언 없음** (규범에 "Effects 없다") |
| SidebarCta | 라이트 전경 | `neutral.50` | `neutral.100` |
| SidebarCta | 라이트 current 면 | `neutral.50` | `neutral.100` |
| SidebarNavItem | 다크 hover 면 | `rgb(250 250 250 / 0.1)` | 같음 — **이제 증명된다** |
| SidebarNavItem | 라이트 hover 면 | `rgb(228 229 233 / 0.5)` | 잉크 8% (편차로 기록) |


## 두 화면 이상에서 쓰이는 7종이 전부 닫혔다 (2026-08-19)

이 문서가 "공용 컴포넌트 후보이며 우선순위가 가장 높다"고 적어 둔 목록이다. 마지막 둘이 오늘
닫혔다.

| 종류 | 무엇이 소유하나 |
| --- | --- |
| 진행률 링 프로필 아바타 | `ProgressRing` (2026-08-19) |
| 탭 배너 캐러셀 | `BannerCarousel` |
| 배너 컨트롤 | `BannerCarousel`의 부품 |
| 업로드 진행바 (determinate) | `ProgressBar` (2026-08-19) |
| 사이드바 브랜드 워드마크 행 | `SidebarBrand` |
| 복합 내비 행 + 인셋 생성(+) 버튼 | `SidebarNavRow` (2026-08-19) |
| 사이드바 하단 '보관함' 버튼 | `SidebarCta` — **새로 만들지 않았다** |

마지막 것은 census가 두 개로 세었지만 하나였다. 배포본을 읽어 보니 '보관함' 버튼과 업그레이드
CTA가 **같은 클래스 세 개**(`sidebarUpgradeWrap` · `sidebarUpgradeButton` · `sidebarUpgradeLabel`)를
쓴다 — 바닥 자리는 하나이고 화면에 따라 라벨과 목적지만 바뀐다. 이름이 `SidebarCta`인 것은 그
자리의 첫 쓰임 때문이지 계약이 업그레이드에 매여 있다는 뜻이 아니다.

`SidebarNavRow`에서 배운 것 하나. 배포본은 이 행을 `<div>`로 두고 내비와 「+」를 **형제 버튼**으로
놓는다. 행 전체를 버튼으로 만들고 그 안에 버튼을 넣으면 HTML이 깨지고 키보드 순회가 무너지기
때문이다. DS도 같은 구조를 쓰고 acceptance test가 `button button`과 `a button`이 0건임을 확인한다.


## 앱 홈 템플릿을 다시 세웠다 (2026-08-19)

2026-08-18에 내렸던 그 템플릿이다. 내린 이유는 **재료가 없어서**였다 — 사이드바 부품 넷과
배치 규칙이 없는 채로 만든 화면은 제품처럼 보이지도 않고 다음 사람이 그것을 기준으로 삼는다.

이제 넷이 다 섰다. `SidebarBrand` · `SidebarCta` · `SidebarNavRow` · `ProgressRing`. 그래서
다시 조립했고 계약도 함께 되살렸다.

| 축 | 값 | 어디서 왔나 |
| --- | ---: | --- |
| 화면 폭 | 1440 | 재조립 뷰포트 |
| 사이드바 | 280 / 여백 12 | `--app-gnb-sidebar-width` · `--app-gnb-sidebar-padding-x` |
| 메인 카드 | 반경 16 · 좌우 16 | `appMainCardChrome` · `--app-gnb-main-inline-padding` |
| 그리드 | 4열 · gap 12 | `min-[1200px]:repeat(4,1fr)` · `[gap:12px]` |
| 섹션 상단 | 40 | 그리드 섹션 margin-top |
| 카드 | 270×270 · 반경 16 | 1116을 4열로 나눈 결과. 정사각은 `aspect-ratio: 1/1` |
| 내비 라벨 | **5**가지 | Gnb.tsx:2401-2405. 앞선 계약의 4는 YouTube 분석을 빠뜨린 것이었다 |
| 카드 제목 | **8**가지 | 같은 제목이 반복되면 그리드가 아니라 벽지다 |
| 기본 문자열 | **0**개 | "배너 제목"·"Label" 같은 것이 남아 있으면 조립이 끝나지 않은 것이다 |

### 조립하다가 드러난 것 둘

**① `AppTopBar`에 슬롯이 없었다.** 코드 API에는 `leading`·`trailing`이 처음부터 있고 CSS에도
`.louis-app-top-bar__leading` / `__trailing`이 있는데, Figma 컴포넌트에는 제목 하나뿐이었다.
그래서 조립하면 상단 바가 텅 비어 보였다. **표현하지 못하는 API는 없는 것과 같다** — 슬롯 둘을
INSTANCE_SWAP으로 열고 계약에 넣었다.

**② 오버레이 비율이 카드 크기를 탄다.** 제품은 `height: 30%`를 고정으로 쓰고 DS는 하한으로
쓴다(세 줄이 넘치던 결함을 그렇게 고쳤다). 4열 화면의 카드가 270이라 세 줄이 하한을 이겨
0.4가 된다. 0.3은 카드가 360 이상일 때의 값이다. 계약에 그 사실과 제품 값을 함께 적었다.

### 남은 것

- 카드 썸네일이 비어 있다. 이미지 자산은 이 저장소가 소유하지 않는다.
- 사이드바 토글 아이콘이 제품과 다르다 — 전용 글리프가 카탈로그에 없어 `arrows-left-right`로
  대신한다.
- 허브 템플릿 셋(노드캔버스 · 비디오에디터 · 하이라이트)이 남았다.


## 방향을 뒤집었다 — 제품이 선언한 것을 기계가 열거한다 (2026-08-19)

지금까지 게이트는 **내가 EXPECT에 넣기로 기억한 축만** 봤다. 그래서 하루 동안 나온 것이 이렇다 —
mint CTA(지어냄) · 배너 240 vs 360 · 브랜드 24 vs 40 · 내비 여백 8 vs 4 · 상단 바 14 vs 16 ·
스크림이 글자 위 · AppTopBar 슬롯 없음 · FloatingCreate 지어냄. **전부 게이트가 초록인 채로 틀린
것**이었다. 방법이 틀렸다는 뜻이다.

이제 반대로 한다.

> 제품 정본 클래스가 이 요소에 대해 **선언한 property를 브라우저가 열거하고**, 분류되지 않은 것이
> 하나라도 있으면 실패한다.

분류는 셋 중 하나다 — ① EXPECT의 대조 행(같아야 한다 / 달라야 하고 사유가 있다) ②
`figma/product-coverage.json`의 범위 밖 사유 ③ 대칭 묶음(모서리 넷·테두리 네 변·상하좌우 여백은
**값이 같을 때만** 한 축으로 접힌다 — ProjectCard 오버레이처럼 아래만 깎는 자리를 덮지 않는다).

**사유 없이 넘기는 길이 없다.** 낡은 사유도 실패다 — 제품이 더 이상 선언하지 않는 property에
사유가 남아 있으면 지우라고 말한다. canary 3종이 매 실행 검출력을 증명한다.

### 처음 돌렸을 때

제품 선언 **1,661건 · property 122종**이 나왔고 그중 **754건이 미분류**였다. 대조하던 것은 144축
뿐이었다. 즉 제품이 정한 것의 대부분을 보지 않고 "제품과 같다"고 적어 왔다.

분류를 끝낸 지금은 **1,710건 전부 분류 · 199축 대조**(일치 171 · 기록된 편차 28)다.

### 이 열거가 드러낸 것

- **툴팁과 체크박스가 "아무것도 선언하지 않은" 것으로 보였다.** 유틸리티 시트만 보고 있어서다 —
  제품이 `globals.css`의 전역 클래스로 쓰는 자리를 통째로 놓치고 있었다.
- **낡은 사유 8건.** `carousel`이 `background-image`를 선언한다고 적어 두었는데 실제로는
  슬라이드가 선언한다. 게이트가 그 거짓을 잡았다.
- 대조하지 않던 55축이 새로 대조 대상이 됐다 — 버튼 반경·아이콘 버튼 최대 폭·캐러셀 화살표와 점의
  반경·내비 항목 hover 기하·CTA 세 상태의 여백과 반경·슬라이더 레일과 썸의 반경 등.

### hover와 의사요소까지 센다

기본 상태만 세던 것을 곧바로 넓혔다. `:hover`·`::before`·`::after`가 각자 버킷이 되고, 전역 사유는
버킷을 가리지 않는다 — `cursor`가 기본에서 범위 밖이면 hover에서도 그렇다. 버킷별로 다르게 판정할
자리는 전체 키(`::after content`)로 적는다.

넓히자마자 **하나가 잡혔다.** 배포본 슬라이더의 채움 끝 표식(`::after`)이 **알약**인데 DS는 각진
2×14 막대였다. 2px 폭에서 끝 모양이 눈에 띈다. `radius-pill`로 고쳤다.

최종: 제품 선언 **1,971건 전부 분류 · 199축 대조**. 기본 1,710 + 상태·의사요소 261이다.


## "정본이 없다"를 Figma에 늘어놓는다 (2026-08-19)

owner의 지적이 맞았다 — **"제품에 정본이 없다"가 산문이었다.** 한 벌만 재고 나머지는 세지 않은
채 그렇게 적었고, 그 판단을 아무도 검증할 수 없었다. 정본을 고르는 일은 **눈으로 비교하는 일**이지
남의 문장을 믿는 일이 아니어야 한다.

`scripts/measure-product-variants.mjs`가 배포본에서 경쟁 정의를 **이름 패턴으로 전부** 찾아
브라우저에서 렌더하고 값이 같은 것끼리 묶는다. 파일 목록은 손으로 적지 않고 제품에서 찾는다
(모서리를 그리는 선언이 하나라도 있는 파일 154개). Figma의 **Product inventory** 페이지가 그
결과를 **제품에 보이는 그대로** 그린다 — 실제 문구, 실제 크기, 실제 색이다. 처음에는 수치 카드로
만들었다가 다시 만들었다. 값을 표로 늘어놓으면 읽는 사람이 그 값을 머릿속에서 그려야 하고,
그러면 "무엇이 어긋나 있는가"가 보이지 않는다. 캡션은 어디에 있는 정의인지와 몇 곳에서 쓰는지만
작게 단다.

**그림으로 보니 바로 보이는 것들.** 슬라이더 넷을 나란히 놓으면 굵은 레일에 얇은 표식이 서는 것과
얇은 레일에 둥근 썸이 얹히는 것이 **같은 컨트롤이 아니라는 게 한눈에 보인다.** 선택 가능한 행도
마찬가지다 — 넷은 메뉴 항목이고 둘만 목록 행이다.

| 종류 | 정의 | 묶음 | 제안 |
| --- | ---: | ---: | --- |
| toast | 4 | 3 | **rank1** — 두 벌이 값까지 동일하고 사용 156으로 최다 |
| dialog | 2 | 2 | **rank1** — 여백 16 · 반경 24가 두 벌 합의. 묶음이 갈린 것은 flex 간격 하나 때문 |
| icon-button | 6 | 5 | **rank1** — 32×32 · 반경 12. 글래스 효과는 owner가 없앤 개념이라 뺀다 |
| selectable-list-row | 7 | 6 | **rank4** — 나머지는 메뉴 항목이며 MenuPopover가 이미 소유한다 |
| text-field | 13 | 10 | **없음** — 최다가 7회이고 rank1·2는 테두리도 면도 없는 벌거벗은 input이다 |
| slider | 20 | 18 | **없음** — 형태부터 둘로 갈린다 |
| badge | 13 | 13 | **없음** — 전부 다르다 |

**이 인벤토리가 곧바로 하나를 고쳤다.** dialog 두 벌이 여백 16 · 반경 24로 합의하는데 DS는
20/20이었다. CSS 주석이 이유를 적어 두었다 — *"24px 토큰이 소스에 없다"*. 값을 제품이 아니라
토큰 계단이 정하게 둔 것이다. `radius-overlay-lg`를 세우고 24를 쓴다.

그 김에 더 나쁜 것도 나왔다. `paddingBlock` 한 이름이 **뷰포트 여백과 surface 안쪽 여백 둘을**
가리키고 있었다. Figma는 20.5로 그려져 있고 CSS는 16·24를 렌더했는데 그 축을 보는 테스트가 없어
갈린 채로 통과했다. `surfaceInset`을 따로 세우고 테스트를 붙였다.

### 한계

이름 있는 스타일 상수만 센다. JSX에 인라인으로 적힌 `className`은 이름이 없어 묶을 수 없다.
이름 패턴도 함께 기록하므로(생성물의 `pattern`) 놓친 것이 있으면 규칙을 감사할 수 있다.

---

## 미등록 부품 둘의 실측값 (2026-08-21)

**「없다」만 적어 두면 Figma 작업자는 그릴 수 없다.** 등록부에 이미 올라 있던 둘을 배포본
`a9ead58b`에서 재고 값을 붙인다. **DS 컴포넌트를 세울지는 로드맵 결정**이라 여기서 하지 않는다 —
`design/components/`에 문서를 만드는 것은 「LOUIS가 이것을 만든다」는 뜻이기 때문이다.

### 하단 캔버스 툴바 (`Toolbar.tsx`의 `TOOLBAR_WRAP`)

**알약이 아니다.** 곡률 16px이고 실측 높이 40px이라 `999px`이 되려면 20px이어야 한다.
[legacy-design-system](legacy-design-system.md)의 버튼 곡률 규약이 이것을 이미 짚어 두었다.

| 축 | 값 |
| --- | --- |
| 곡률 | `16px` — `--radius-16` 리터럴(spacing 파생이 아니다) |
| 패딩 · 아이템 간격 | `4px` · `4px` (`p-2` · `gap-2`, `--spacing: 2px`) |
| 테두리 | `none` |
| 면 (다크) | `rgb(var(--gray-800-rgb) / 70%)` = `#313640` 70% |
| 면 (라이트) | `rgb(var(--palette-gray-100-rgb) / 70%)` = `#f1f1f3` 70% |
| 뒤 흐림 | `backdrop-filter: blur(4px)` + `transform: translateZ(0)` |
| 그림자 | `var(--glass-dropdown-frame)` **5겹 그대로** — 앰비언트 섀도우는 안 붙는다 |
| 버튼 | `32×32` · 곡률 `var(--button-radius)` = 12px |
| 버튼 전환 | `background/color 0.12s ease` · `transform 120ms cubic-bezier(0.23, 1, 0.32, 1)` |
| 버튼 `:active` | `scale(0.95)` |

**시맨틱 `--gray-800`을 쓰면 라이트에서 틀린다.** 라이트에서 `--gray-800-rgb`는
`palette-gray-200`(`#e3e4e8`)으로 뒤집힌다. 제품은 라이트에서 **팔레트 쪽**을 직접 읽는다.

**선행 조건:** DS의 blur primitive는 10px·12px뿐이라 **4px이 없다.**

### 노드 인라인 오류 배너

**노드 다섯 종(Image · Video · Edit · Tts · Bgm)이 바이트 동일한 클래스 문자열을 쓴다** —
제품에 정본이 있는 드문 자리다. 라이트·다크 **공통값이고 테마 분기가 없다.**

| 축 | 값 |
| --- | --- |
| 배치 | `flex items-center` · 간격 `8px` · `width: 100%` |
| 최소 높이 | `28px` |
| 패딩 | `8px` (상하좌우) |
| 곡률 | `12px` |
| 면 | `rgb(var(--accent-red-500-rgb) / 10%)` |
| 테두리 | `0.5px solid rgb(var(--accent-red-500-rgb) / 20%)` |
| 글자 | `var(--accent-red-500)` = `#ff4b59` · `type-body-14-regular` |
| 줄 수 | **최대 3줄 클램프**, 넘치면 말줄임하고 전문은 `title` 속성 |
| 역할 | `role="alert"` |

**면 10% / 테두리 20% / 글자 100%** — 셋 다 같은 `--accent-red-500`이고 알파만 다르다.

**한 배너가 두 메시지를 나눠 쓴다** — 생성 실패와 크레딧 부족이며 동시에 뜨지 않는다.
우선순위는 실패가 먼저다.

**TextNode는 이 정본에 없다.** 별도의 밝은 붉은 글자를 쓴다. 합류시킬지는 제품 판단이다.
