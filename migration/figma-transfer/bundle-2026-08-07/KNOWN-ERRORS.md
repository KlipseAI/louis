# patterns.txt §6 정오표 — 배포본 실측으로 확인된 오류 96건

**이 파일을 `patterns.txt` 보다 먼저 읽어라.**

2026-08-21에 §6 전 절을 배포본(`klipse-web` `origin/main` = `a9ead58b`)과 대조했다.
주장 705건(§6.0~6.12·6.14~6.16 611건 + §6.13 94건) 중 **96건이 사실과 다르다.**

## 먼저 알아야 할 것 셋

1. **§6의 값 대부분은 여전히 맞다.** 705건 중 약 77%가 유효했다. 이 문서는 나머지를 적는다.
2. **인용 좌표(`파일:줄`)는 별도로 124건이 낡았다.** 사실은 맞고 줄만 밀린 경우다.
   **좌표를 믿지 말고 값을 믿어라.** 좌표가 필요하면 `git show origin/main:<경로>`로 다시 찾아라.
3. **`(highlight-standalone)` 경로와 `.module.css`는 배포본에 0건이다.** 삭제됐다.
   그 경로를 인용하는 표의 행은 통째로 무효다.

## 그 밖에 오늘 확정된 것

| | 값 |
| --- | --- |
| 루트 폰트 크기 | **12px** (`1rem = 12px`). `4.5rem` = **54px**이지 45px이 아니다 |
| Tailwind 간격 격자 | `--spacing: 2px` — `p-4` = **8px**, `pb-10` = **20px** |
| `--glass-dropdown-frame` | **5겹**이다. 단일 헤어라인이 아니고 라이트에서 알파가 뒤집힌다 |
| 앱 셸 라이트 페이지 바닥 | `#eeeef1` — 카드 면 `#f8f8f9`와 **다르다** |
| 형태 B 상단 72px 페이드 | **어디서도 켜지지 않는다.** 켜진 상태로 그리지 마라 |
| `/archive`의 내비 라벨 | 「보관함」이 아니라 **「홈」** |

## 심각도

| | 건수 | 뜻 |
| --- | ---: | --- |
| high | 24 | 그대로 그리면 화면이 눈에 띄게 틀린다 |
| medium | 45 | 값이 어긋나거나 범위가 틀리다 |
| low | 12 | 좁은 조건에서만 어긋난다 |
| (미분류) | 15 | 반증을 견딘 초기 판정 |


## §6.0 — 4건

### §6.0.2 「프로필 팝오버 계열만 예외로 `0 12px 24px rgb(var(--palette-gray-500-rgb) / 12%)` 드롭 섀도우 + 베벨 2줄 + `blur(40px)` 을 함께 쓴다」 **[medium]**

- **문서**: 프로필 팝오버는 표에 없는 커스텀 드롭 섀도우 + 베벨 쌍을 쓰는 예외
- **배포본**: `box-shadow: var(--dropdown-ambient-shadow), var(--glass-dropdown-frame)` — 표의 레벨 3 그대로다. 커스텀 드롭 섀도우도 베벨 2줄도 없다. `backdropFilter: blur(40px)` 만 맞다. `0 12px 24px … / 12%` 는 프로필 팝오버가 아니라 `--app-tooltip-shadow` 의 값이고 gray-500 이 아니라 gray-900(다크)/gray-600(라이트) 이다
- 근거: 제품 확인: Gnb.tsx:1264 `profilePopover: [` 블록. :1274 `"[box-shadow:var(--dropdown-ambient-shadow),_var(--glass-dropdown-frame)]"`, 라이트 오버라이드 :1287 도 동일한 `var(--dropdown-ambient-shadow), var(--glass-dropdown-frame)` — 표의 표준 조합 그대로이고 커스텀 드롭 섀도우도 베벨 페어도 없다. blur 는 컴포넌트 클래스가 아니라 React 인라인 style 로 :4023-4024 `backdropFilter/WebkitBackdropFilter: "blur(40px)"` 이며 팝오버 전용도 아니다(같은 파일 5165-5166·5359-5360 에도 동일

### `--glass-dropdown-frame` = `0 0 0 0.5px var(--palette-gray-700)` (§6.0 --glass-* 표)

- **문서**: 단일 겹 헤어라인 링 `0 0 0 0.5px var(--palette-gray-700)`
- **배포본**: 5겹 그림자다 — `0px 0px 0px 0.5px rgba(0,0,0,0.5)`, `±1.25px 0px 0px -0.75px rgba(0,0,0,0.8)` 좌우 림 2겹, `inset 0px ±1px 1px -0.5px rgba(255,255,255,0.5)` 안쪽 베벨 2겹. 라이트는 알파가 0.15/0.25/1 로 전부 뒤바뀐다. `var(--palette-gray-700)` 은 이 토큰 어디에도 없다
- 근거: globals.css:63-68 (다크) / globals.css:594-599 (라이트)

### `--glass-dropdown-frame-on-dark` = `0 0 0 0.5px var(--palette-gray-700)` (§6.0 --glass-* 표)

- **문서**: `--glass-dropdown-frame` 과 똑같은 단일 겹 값
- **배포본**: 역시 5겹이고, 다크 기준 알파(0.5/0.8/0.5)로 고정돼 테마 재정의가 없다. 표가 두 토큰을 같은 값으로 적어 놓아 '왜 둘이 따로 있는지'가 지워졌다
- 근거: globals.css:72-77

### §6.0.1 「근거 `globals.css:929-960`」

- **문서**: 전역 커스텀 스크롤바 규칙이 929-960 줄
- **배포본**: 실제로는 910-939 줄(`* { scrollbar-width }` 910, `::-webkit-scrollbar-corner` 939). CSS 본문은 한 글자도 안 틀렸는데 좌표만 19줄 밀렸다
- 근거: globals.css:910-939


## §6.1 — 5건

### §6.1.1 — `--glass-dropdown-frame` 은 0.5px 헤어라인 한 겹이다: 다크 `0 0 0 0.5px var(--palette-gray-700)`(#575d68), 라이트 `--palette-gray-300`. blur 0 · offset 0 · **[high]**

- **문서**: 한 겹 0.5px 헤어라인. 팔레트 토큰(gray-700/gray-300)으로 그린다
- **배포본**: 5겹 그대로다. `0px 0px 0px 0.5px rgba(0,0,0,0.5)` + `±1.25px 0px 0px -0.75px rgba(0,0,0,0.8)` 좌우 엣지 2줄 + `inset 0px ±1px 1px -0.5px rgba(255,255,255,0.5)` 흰 림 2줄. 팔레트 토큰이 아니라 검정/흰색 리터럴이고 알파도 100% 가 아니다
- 근거: 제품 확인: globals.css:63-68 `--glass-dropdown-frame` 은 **5겹**이다 — `0px 0px 0px 0.5px rgba(0,0,0,0.5)`(:64), `±1.25px 0px 0px -0.75px rgba(0,0,0,0.8)`(:65-66), `inset 0px ±1px 1px -0.5px rgba(255,255,255,0.5)`(:67-68). 팔레트 토큰이 아니라 검정/흰색 리터럴이고 알파도 0.5/0.8/0.5 로 100% 가 아니다. 라이트 오버라이드도 5겹이다(:594-599, 0.15/0.25/1.0). `var(--palette-gray-700)`(#575d68, :34) · `--palette-gray-300`(#d5d7dd, :30) 은 이 토큰 정의부 어

### §6.1.1 경고 상자 — 「2026-08 단순화. 이전에는 검정 외곽 링 + 좌우 검정 엣지(±1.25px) + 상하 흰 림 5겹이었다 … 이전 5겹 값을 참조하는 문서나 시안이 있으면 낡은 것이다」 **[high]**

- **문서**: 5겹은 과거형이고, 5겹을 참조하는 문서가 낡았다
- **배포본**: 방향이 정반대다. 배포본이 5겹이고, 코드 주석도 5겹으로 적고 있다(`:64-66` 주석 「검정 외곽 링 + 좌우 검정 엣지(±1.25px) + 상하 흰 림 inset」). 소비처 주석도 「전역 토큰 --glass-dropdown-frame 5겹」이라 부른다. 낡은 것은 헤어라인을 적은 이 절이다
- 근거: 제품 확인: a9ead58b(문서가 말하는 「2026-08 단순화」 이후 시점)에서도 5겹이 현행이다. globals.css:59-62 의 도입 주석이 구성을 현재형으로 서술한다 — 「검정 외곽 링 + 좌우 검정 엣지(±1.25px) + 상하 흰 림 inset. 다크: 링 #000 50% / 좌우 80% / 흰림 50%. 라이트: 링 15% / 좌우 25% / 흰림 100%」. 소비처 주석도 현재형이다 — Toolbar.tsx(실경로 `apps/web/components/scenes/create/node-canvas-v2/components/Toolbar.tsx`):34 「전역 토큰 `--glass-dropdown-frame` 5겹 — 상단 brand/actions shell 과 동일」, CanvasOnbo

### §6.1.1 — 「`--glass-dropdown-frame-on-dark` … 이전에는 흰 림이 라이트에서 뒤집히는 문제 때문에 분리돼 있었는데, 림이 사라져 그 이유가 없어졌다. 호출부 호환을 위해 이름만 남겨 둔다」 **[high]**

- **문서**: 흰 림이 사라져 분리 사유가 소멸했고 이름만 남은 껍데기다
- **배포본**: 흰 림은 살아 있고 분리 사유도 살아 있다. 라이트 규칙이 흰 림을 50%→100% 로 뒤집는 것이 그대로 있고, 코드 주석이 그 이유를 현재형으로 적고 있다
- 근거: 제품 확인 4점. (1) 흰 림 생존: globals.css:67-68 `inset 0px 1px 1px -0.5px rgba(255,255,255,0.5)` / `inset 0px -1px …` 가 `--glass-dropdown-frame` 안에 그대로 있다. (2) 라이트에서 뒤집힘 생존: :592-599 블록(`html[data-theme="light"]:not(:has([data-landing-walkthrough-dark])), [data-landing-walkthrough-light]`)이 흰 림을 `rgba(255,255,255,1)` 로 올린다(0.5 → 1.0). (3) 분리 사유가 코드 주석에 현재형: :69-71 「`--glass-dropdown-frame` 은 라이트 테마에서 흰 림 

### §6.1.3 — `--glass-inner-shadow-rgb` 의 「나머지 한 건은 `app/(highlight-standalone)/hl/page.module.css:34` 에 같은 값으로 재선언한 것이다」 **[medium]**

- **문서**: highlight-standalone 라우트의 page.module.css 에 두 번째 선언이 있다
- **배포본**: `apps/web/app/(highlight-standalone)` 디렉터리 전체가 배포본에 없다(`chore/remove-highlight-standalone` 병합). 저장소 전체에서 `--glass-inner-shadow-rgb:` 선언은 globals.css:53 단 하나다
- 근거: 제품 확인: `git ls-tree -r --name-only origin/main` 에 `highlight-standalone` 경로 0건, `.module.css` 파일 0개(즉 `page.module.css` 라는 파일 자체가 트리에 없다). origin/main 의 모든 .ts/.tsx/.css/.mjs/.json 을 파일 단위로 훑어 `--glass-inner-shadow-rgb *:` 선언을 센 결과 정확히 1건 — `apps/web/app/globals.css:53 --glass-inner-shadow-rgb: var(--palette-gray-000-rgb);`. 나머지 히트는 전부 `rgb(var(--glass-inner-shadow-rgb) / N%)` 형태의 소비다. 따라서 pattern

### §6.1.5 blur 표 — 16px 행의 근거는 `app/(highlight-standalone)/layout.tsx:65`, saturate 없음

- **문서**: 16px 은 saturate 동반 없이 highlight-standalone layout 한 곳
- **배포본**: 그 파일이 없다. 배포본의 16px backdrop 은 전부 `saturate(130%)` 를 동반하고 React 인라인 스타일 3곳이다 — AppHomeScene.tsx:56 · NodeCanvasHomeScene.tsx:510 · ConfirmModal.tsx:152. 「saturate 동반 여부까지가 한 세트」라는 이 절의 규칙 기준으로 행 자체가 틀렸다
- 근거: AppHomeScene.tsx:56 · NodeCanvasHomeScene.tsx:510 · ConfirmModal.tsx:152


## §6.2 — 5건

### §6.2.0 · §6.2.3 · §6.2.10#4 — `[data-page-root]` 램프 고정 블록의 위치

- **문서**: `globals.css:1658` 의 `[data-page-root]` 블록이 시맨틱 램프를 팔레트 램프로 고정한다. `:1659` `--gray-000`, `:1660` `--gray-100`, `:1668` `--gray-900`, `:1670`·`:1679` 각 `-rgb`
- **배포본**: 동작(테마 무관 고정)은 사실이지만 좌표가 통째로 31줄 밀렸다. 실제 블록은 `globals.css:1627` 에서 열리고 `--gray-000: var(--palette-gray-000)` 는 `:1628`, `--gray-100` `:1629`, `--gray-900` `:1637`, `--gray-000-rgb` `:1639`, `--gray-900-rgb` `:1648` 이며 `:1663` 에서 닫힌다. 문서가 가리킨 `:1658` 에는 `--footer-safe-bottom: env(safe-area-inset-bottom)` 이 있다. 이 좌표는 §6.2 에서 네 번 인용되므로 전부 빗나간다
- 근거: globals.css:1627-1649

### §6.2.0 · §6.2.10#5 — `html[data-theme="light"]` 블록 범위

- **문서**: `html[data-theme="light"]`(`globals.css:719-740`) 보다 더 가까운 조상 / 토큰을 어둡게 만드는 것은 `html[data-theme="light"]`(`globals.css:719`) 쪽이다
- **배포본**: 블록은 `globals.css:704` 에서 열리고 `--gray-000: var(--palette-gray-1000)` 은 `:708` 이다. 문서가 지목한 `:719` 는 빈 줄이고 `:720` 은 `--gray-000-rgb` 다. 게다가 블록은 `:740` 에서 끝나지 않고 계속된다(`:741` `--app-tooltip-radius` 등). 특이도 논증 자체는 성립한다
- 근거: globals.css:704-730

### §6.2.0 소비처 표 — `/inquiry` (랜딩 브랜치) 좌표

- **문서**: `app/inquiry/InquiryClient.tsx:783`(`:777-780` 의 `<main … data-page-root>` 안). 앱 브랜치는 `:770-774` 에서 먼저 return 한다
- **배포본**: `<main className={LANDING_ROOT} data-page-root data-inquiry-root>` 는 `:785-789`, `<LandingGnb lightSurface />` 는 `:791` 이다(+8 밀림). 앱 브랜치 분기 조건은 `:746` `searchParams.get("shell") === "app"` 이고 그 브랜치의 `<AppGnb>` 는 `:766`, return 종료는 `:781-782` 다 — 문서가 찍은 `:770-774` 는 `<AppGnb>` 의 prop 목록 한복판이다. 같은 표의 나머지 4개 라우트(HomePageClient `:763`/`:765`, pricing `:48`/`:50`, docs/layout `:63`/`:64`, BlogComingSoon `:102-105`/`:107`)는 전부 정확하다
- 근거: InquiryClient.tsx:746,785-791

### §6.2.5 · §6.2.6 · §6.2.8 · §6.2.10#1 — 랜딩 Gnb.tsx JSX 구간(750~900줄) 인용 좌표

- **문서**: `aria-current="location"` 분기 `:757` · 리소스 트리거 라벨 `:774` · 트리거 `<button aria-haspopup>` `:775-777` · 트리거 클릭 토글 `:778-780` · 활성 판정 `:770-773` · 칩 다크 오버라이드 `:229-230` · 햄버거 `aria-expanded` `:889` · 라벨 `<span>` `:813-817`
- **배포본**: 상수 정의 구간(63~340줄)은 좌표가 한 줄도 안 틀리는데 JSX 구간만 +2~+7 밀려 있다. 실제로는 `aria-current="location"` `:750`, 라벨 `{messages.nav.community}` `:778`, `aria-haspopup="true"`/`aria-expanded` `:772-773`, 토글 `onClick` `:774-776`, `menuLinkClass(isCommunityActive || communityOpen, …)` `:768-771`, 칩 다크 오버라이드 `:227-228`, `aria-expanded={mobileOpen}` `:887`, 라벨 `<span>` `:810-814` 다. 서술된 사실 자체는 모두 코드와 일치한다
- 근거: Gnb.tsx:750,768-778,227-228,810-814,887

### §6.2.5 · §6.2.6 · §6.2.7 · §6.2.8 — i18n 근거 파일 경로

- **문서**: `messages/ko.ts:15`, `messages/en.ts:13` 형태로 12쌍을 인용한다
- **배포본**: `apps/web/messages/ko.ts` 는 origin/main 에 존재하지 않는다. 실제 경로는 `apps/web/components/landing/system/messages/ko.ts` · `en.ts` 다. 줄 번호와 문구는 12쌍 전부 정확했다(ko `:11` 가격 · `:12` 블로그 · `:13` 템플릿 · `:15` 문서 · `:16` 문의 · `:17` 리소스 · `:18` 앰버서더 · `:19`·`:20` 공식 채널 · `:21` 공개 예정 · `:24` 시작하기 · `:25-26` 메뉴 열기/닫기, en 은 `:9`~`:24` 대응). 경로만 못 따라간다
- 근거: components/landing/system/messages/ko.ts:11-26


## §6.3 — 4건

### 접힘 CTA 라벨 max-width:4.5rem 이 45px 다 (§3 1rem = 10px) **[high]**

- **문서**: 접힘 라벨 `max-width:4.5rem` = **45px**(§3 `1rem = 10px`)
- **배포본**: 루트 폰트 크기는 10px 가 아니라 12px 다 — `html { font-size: var(--type-caption-12-size) }` 이고 `--type-caption-12-size: 12px`. 바로 위 주석만 「html 10px — 레거시 스케일 호환」이라고 낡은 채 남아 있다. 따라서 4.5rem = **54px**. globals.css 전체에 다른 html font-size 선언은 없다. (LOUIS components/app-shell-parts.md:148 도 실측 54px 로 적고 있다.)
- 근거: apps/web/app/globals.css:942-943 `html { font-size: var(--type-caption-12-size); }`; globals.css:374 `--type-caption-12-size: 12px;`. awk 스캔 결과 globals.css 안 html font-size 선언은 943 한 곳뿐이고 미디어쿼리 재정의도 없다. 941행 주석 `/* html 10px — 레거시 스케일 호환 ... */` 만 낡게 남아 있다. 해당 선언은 Gnb.tsx:1918 `"[html[data-app-gnb-sidebar-collapsed=true]_&]:[max-width:4.5rem]"` (sidebarUpgradeLabel). 4.5rem x 12px = 54px. 문서의 「45p

### 비활성 hover 배경(light)이 `rgb(213 215 221 / 50%)` 다 **[medium]**

- **문서**: | 비활성 hover | `background-color` | `rgb(213 215 221 / 50%)` | `rgb(250 250 250 / 10%)` |
- **배포본**: 규칙은 `rgb(var(--palette-gray-300-rgb) / 50%)` 인데, 사이드바가 화면에 있으면 `wrapperSidebar` 가 `html[data-theme=light] body:has(&)` 로 `--palette-gray-300-rgb` 를 `228 229 233` 로 재매핑한다. 해석값은 `rgb(228 229 233 / 50%)` 다. 213 215 221 은 같은 앱 셸 램프에서 `--palette-gray-400-rgb` 다 — 한 단계 어둡다. 이 절은 「+」 배경 표에는 앱 셸 램프를 적용했으면서 상태 표에는 전역 램프를 그대로 썼다. 다크(`rgb(250 250 250 / 10%)`)는 맞다.
- 근거: Gnb.tsx:519 `[html[data-theme=light]_.gnb-menuSidebar_.gnb-menuLink:hover:not(&)]:[background-color:rgb(var(--palette-gray-300-rgb)_/_50%)]` — 하드코딩이 아니라 변수 참조. Gnb.tsx:1982 `[html[data-theme=light]_body:has(&)]:[--palette-gray-300-rgb:228_229_233]`, :1983 `--palette-gray-400-rgb:213_215_221`. wrapperSidebar 는 Gnb.tsx:4084 에서 useSidebarNav 일 때 header 에 붙고, .gnb-menuSidebar 는 같은 useSidebarNav 분기(447

### 사이드바 토글 버튼에 포커스 링이 있다 **[medium]**

- **문서**: **포커스 링이 있다** — `:focus-visible` 에서 `outline:2px solid rgb(var(--gray-000-rgb)/35%)`, `outline-offset:2px`, 다크에서 `outline-color:rgb(var(--gray-000-rgb)/45%)`
- **배포본**: 선언은 있으나 화면에 그려지지 않는다. globals.css 의 `button:focus, button:focus-visible, … { outline: none }` 이 `@layer base` 블록이 끝난 **뒤(레이어 밖)** 에 있다. 레이어 안 스타일은 특이도와 무관하게 레이어 밖 스타일에 지고, Gnb 의 `[&:focus-visible]:[outline:2px_…]` 은 Tailwind `@layer utilities` 안이다. 토글은 `<button type="button">` 이므로(Gnb.tsx:5210) 셀렉터에 정확히 걸린다. 같은 파일 967-970 주석이 이 우열 관계를 직접 설명하는데, 정작 이 리셋만 레이어 밖에 남아 있다.
- 근거: globals.css `@layer base {` 는 971행에서 시작해 993행 `}` 로 닫힌다(그 안 991 `button, input[type=button|submit|reset] { outline: none }`). 995-1005 의 두 번째 리셋 `button:focus, button:focus-visible, button:active, ... { outline: none }` 은 레이어 밖이다. layout.tsx:19-20 이 tailwind.css → globals.css 순으로 import 하고 tailwind.css:28 `@layer theme, base, components, utilities;`, :31 `@import "tailwindcss/utilities.css" layer(

### 사이드바 로고를 누르면 `navigate(APP_HOME_PATH)` = `/archive` 로 간다 **[medium]**

- **문서**: 클릭 시 `navigate(APP_HOME_PATH)` = `/archive`
- **배포본**: 목적지는 `logoHomeHref` 이고 조건부다 — `logoVariant==="admin" ? "/admin" : createNavHub ? NODE_CANVAS_HUB_PATH : logoTargetsAppHome ? APP_HOME_PATH : "/"`. `NodeCanvasHomeScene` 이 `createNavHub={true}` 를 넘기고 그 화면도 이 사이드바를 쓰므로(useSidebarNav 는 createNavHub 로도 참이 된다), 캔버스 허브에서 로고는 `/archive` 가 아니라 `/nodecanvas` 로 간다.
- 근거: Gnb.tsx 전체에 `navigate(APP_HOME_PATH)` 호출 없음 — APP_HOME_PATH 는 import(19)와 삼항 한 갈래(2438)에만 등장. Gnb.tsx:2432-2439 `const logoHomeHref = logoVariant === "admin" ? "/admin" : createNavHub ? NODE_CANVAS_HUB_PATH : logoTargetsAppHome ? APP_HOME_PATH : "/";`. 사이드바 로고는 Gnb.tsx:4383 `onClick={() => navigate(logoHomeHref)}` / :4401 `<Link href={logoHomeHref}>` (useSidebarNav 분기 4374~). NodeCanvasHomeScene.t


## §6.4 — 1건

### Gnb.tsx 2489줄 이후의 인용 좌표 전반 (isMounted · portalPopoverPos · renderPopoverMenuContent · useLayoutEffect · 주석 · resolvedPath effect · pointerdown effect 

- **문서**: :2491 · :2494-2497 · :2997-3432 · :3865-3876 · :3863-3864 · :3858-3861 · :3896-3931 · :3918-3922 · :3976 · :4025-4026 · :5348-5379 · :5154-5174 · :5386-5392
- **배포본**: origin/main 실측은 각각 :2489 · :2492-2495 · :2995-3430 · :3863-3874 · :3861-3862 · :3856-3859 · :3894-3929 · :3916-3920 · :3974 · :4023-4024 · :5346-5375 · :5152-5173 · :5382-5394 — 대부분 2줄 위다. 값·구조 주장은 전부 유효하고 좌표만 어긋난다. 반면 :1033-1038 · :1264-1361 · :1752-1754 · :1957 · :1972-2000 은 정확히 일치하므로 드리프트는 파일 중반 이후에만 있다
- 근거: Gnb.tsx:2489


## §6.5 — 6건

### `--dropdown-surface-bg` 와 `--glass-dropdown-frame` 은 `:root` 가 아니라 `html[data-theme]` 에 정의된다 **[medium]**

- **문서**: 두 토큰이 `:root` 에 없고 `html[data-theme]` 에만 선언된다고 단언한다(근거로 `globals.css:58,82-83` 주석을 든다)
- **배포본**: 다크 값은 실제로 첫 `:root` 블록(globals.css:14 시작) 안에 있다 — `--glass-dropdown-frame` :63, `--dropdown-surface-bg` :101. `html[data-theme]` 계열 선언은 라이트 오버라이드(:594, :600)뿐이다. 인용한 주석 문장은 의도를 적은 것이고 실제 선언 위치와 다르다
- 근거: apps/web/app/globals.css 에서 `:root {` 는 :14 에 열려 :396 (열 0 의 첫 `}`) 에서 닫힌다. 두 토큰의 다크 값이 모두 그 안에 있다 — `--glass-dropdown-frame:` globals.css:63, `--dropdown-surface-bg: rgb(var(--palette-gray-800-rgb));` globals.css:101. `html[data-theme]` 계열 선언은 :592 `html[data-theme="light"]:not(...), [data-landing-walkthrough-light]` 블록의 라이트 오버라이드 두 줄(:594 glass-dropdown-frame, :600 `--dropdown-surface-bg: rgb(va

### 행 다크 기본 글자 `rgb(255 255 255 / 74%)`, 호버 배경 `rgb(255 255 255 / 8%)`, 호버 글자 96% **[medium]**

- **문서**: 순백(255 255 255) 기준 알파
- **배포본**: 기준색이 `--palette-gray-000-rgb` = `250 250 250` 이다. 실제 값은 `rgb(250 250 250 / 74%)` · `/8%` · `/96%`. 알파 퍼센트는 맞지만 기준색이 틀렸다(같은 절의 danger 표는 이 토큰을 250 250 250 으로 옳게 적는다)
- 근거: EditNode.tsx = apps/web/components/scenes/create/node-canvas-v2/nodes/EditNode.tsx. SIDE_MENU_ITEM 실측: :343 `bg-transparent text-[rgb(var(--palette-gray-000-rgb)/74%)]`, :346 `[&:hover]:bg-[rgb(var(--palette-gray-000-rgb)/8%)]`, :347 `[&:hover]:text-[rgb(var(--palette-gray-000-rgb)/96%)]`. 기준 토큰은 globals.css:40 `--palette-gray-000-rgb: 250 250 250;` 이며 저장소 전체 .css 중 이 토큰을 정의하는 파일은 globals.css 하나뿐이

### `--accent-red-300` / `-700` 은 `-rgb` 짝이 없어 hex 로 직접 참조된다 **[medium]**

- **문서**: 두 토큰에 `-rgb` 변형이 존재하지 않는다
- **배포본**: 둘 다 `-rgb` 짝이 있다 — `--accent-red-300-rgb: 255 154 164`(globals.css:241), `--accent-red-700-rgb: 183 36 49`(globals.css:245). 코드가 hex 를 쓰는 것은 사실이지만 이유(짝 부재)가 틀렸다
- 근거: globals.css 실측: red 스케일은 hex(:230-238)와 `-rgb`(:239-247)가 100~900 전 단계 짝을 이룬다. 문제의 두 개도 존재한다 — :241 `--accent-red-300-rgb: 255 154 164;`, :245 `--accent-red-700-rgb: 183 36 49;` (hex 는 :232 `#ff9aa4`, :236 `#b72431`). 따라서 '-rgb 짝이 없다'는 전제가 거짓이다. 결론부도 성립하지 않는다: 저장소 전체 .ts/.tsx/.css/.js/.md 를 훑어 `#ff9aa4`/`#b72431` 리터럴이 등장하는 파일은 globals.css(토큰 정의문) 단 하나뿐이라, 소비 코드가 hex 를 직접 참조하는 곳이 없다.

### `--dropdown-item-radius`(10px)를 실제로 소비하는 곳(전수) — 9개소 **[medium]**

- **문서**: NodeMoreMenu:65 · VideoModelMenu:70·129 · HomeCreateNewMenu:47 · NodeCanvasHomeScene:421 · VideoEditScene:343 · CustomDropdown:114 · landing/LanguageSelector:148 · landing/Gnb:203 을 '전수'로 제시
- **배포본**: 나열한 9곳은 전부 그 줄에 존재하지만 전수가 아니다. `apps/web` 에 15개소가 있고 6곳이 빠졌다 — navigation/Gnb.tsx:1049·:1150·:1450, appHomeSceneStyles.ts:94, ProjectVideosPopover.tsx:99, highlightSceneStyles.ts:847
- 근거: origin/main 전 파일 열거 결과 `--dropdown-item-radius` 소비처는 정확히 15개소다(정의부 globals.css:86, DESIGN_SYSTEM.md:236 제외): landing/navigation/Gnb.tsx:203, landing/system/LanguageSelector.tsx:148, navigation/Gnb.tsx:1049·1150·1450, scenes/HomeCreateNewMenu.tsx:47, scenes/NodeCanvasHomeScene.tsx:421, scenes/VideoEditScene.tsx:343, scenes/appHomeSceneStyles.ts:94, scenes/create/CustomDropdown.tsx:114, node-canvas-

### `SIDE_MENU_*` 계열은 EditNode·Toolbar 가 각자 같은 값을 복사해 갖고 있다 / 원천 표는 EditNode·MetaDropdownPanel·AnalyticsAccountMoreMenu 셋 **[medium]**

- **문서**: A 계열(`--menu-pad:4px`) 복사본이 EditNode·Toolbar 두 곳(원천 파일 표는 EditNode + AnalyticsAccountMoreMenu)
- **배포본**: `--menu-pad:4px` 를 선언하는 파일이 6개다 — EditNode.tsx:330, Toolbar.tsx:124, AnalyticsAccountMoreMenu.tsx:66, CanvasZoomControl.tsx:70, NodeSideButtons.tsx:253, TextNode.tsx:180
- 근거: `--menu-pad` 를 선언(`[--menu-pad:4px]`)하는 파일은 6개다 — EditNode.tsx:330, Toolbar.tsx:124, AnalyticsAccountMoreMenu.tsx:66, CanvasZoomControl.tsx:70, NodeSideButtons.tsx:253, TextNode.tsx:180. 파생 `rounded-[calc(var(--dropdown-radius)_-_var(--menu-pad,4px))]` 도 같은 6개 파일에 인라인 복사돼 있다(EditNode:342, Toolbar:136, AnalyticsAccountMoreMenu:79, CanvasZoomControl:82, NodeSideButtons:289, TextNode:191). 문서의 'EditN

### 이 계열의 소비자는 NodeSideButtons.tsx(6개소) · VideoNode.tsx(4개소) · YoutubeNode.tsx 다 **[medium]**

- **문서**: `MetaDropdownPanel` 을 import 하는 파일로 세 개를 든다
- **배포본**: 인용한 12개 줄번호(NodeSideButtons :1396·:1431·:1463·:1548·:1595·:1628, VideoNode :2535·:2611·:2711·:2776, YoutubeNode :1220·:1554)는 전부 정확하지만 import 하는 파일은 11개다 — Toolbar.tsx, BgmNode.tsx, ImageNode.tsx, CanvasZoomControl.tsx, NodeMoreMenu.tsx, EditNode.tsx 등이 빠졌다
- 근거: `MetaDropdownPanel` 을 값으로 import 하는 파일은 11개다(모두 apps/web/components/scenes/create/node-canvas-v2/ 하위): components/CanvasZoomControl.tsx:6, components/NodeMoreMenu.tsx:4, components/Toolbar.tsx:13, nodes/BgmNode.tsx:7, nodes/EditNode.tsx:33, nodes/ImageNode.tsx:20, nodes/NodeSideButtons.tsx:12, nodes/TextNode.tsx:25, nodes/TtsNode.tsx:13, nodes/VideoNode.tsx:27, nodes/YoutubeNode.tsx:25. (PageMetaD


## §6.6 — 6건

### TOOLBAR_WRAP 의 외곽은 전역 `--glass-dropdown-frame`(0.5px 헤어라인 한 겹)이다 **[high]**

- **문서**: 글래스 프레임이 0.5px 헤어라인 '한 겹'
- **배포본**: `--glass-dropdown-frame` 은 5겹이다 — blur 0 의 외곽 링(0,0,0/50%) + 좌우 엣지 ±1.25px(0,0,0/80%) 둘 + inset 흰 림(255,255,255/50%) 둘. 라이트는 링 15% / 엣지 25% / 흰 림 100% 로 알파가 전부 뒤집힌다. Toolbar.tsx 의 코드 주석 자체가 '전역 토큰 --glass-dropdown-frame 5겹' 이라고 적고 있다. 토큰을 쓴다는 사실만 맞고 '한 겹' 은 틀렸다
- 근거: apps/web/app/globals.css:63-68 (git show origin/main) — `--glass-dropdown-frame` 은 정확히 5줄 box-shadow 다: `0px 0px 0px 0.5px rgba(0,0,0,0.5)`, `1.25px 0px 0px -0.75px rgba(0,0,0,0.8)`, `-1.25px 0px 0px -0.75px rgba(0,0,0,0.8)`, `inset 0px 1px 1px -0.5px rgba(255,255,255,0.5)`, `inset 0px -1px 1px -0.5px rgba(255,255,255,0.5)`. globals.css:59-62 의 선언 주석도 '검정 외곽 링 + 좌우 검정 엣지(±1.25px) + 상하 흰 림 inset. 다

### 노드 안 톤 사다리 토큰 9개(`--surface-page`·`--surface-raised`·`--surface-input`·`--surface-answer`·`--surface-inset`·`--surface-inset-hover`·`--surface-inset-p **[high]**

- **문서**: '토큰은 globals.css 의 테마 블록에 있다' + '토큰만 정의돼 있고 소비처는 아직 안 옮겼다'
- **배포본**: 9개 토큰 중 **하나도 origin/main 에 존재하지 않는다.** `git grep 'surface-raised|surface-answer|surface-inset|surface-page|border-input|border-control' origin/main` 전부 0 hit — globals.css 뿐 아니라 저장소 전체에서 0 이다. GENERATED:theme-roles 표 전체가 배포본에 대응물이 없다. (표 안의 팔레트 헥스 11개는 별개로 전부 일치한다.)
- 근거: `git grep -nE -- "--(surface-page|surface-raised|surface-input|surface-answer|surface-inset|border-input|border-control)" origin/main` → 출력 0줄. 9개를 하나씩 `git grep -c` 로 돌려도 전부 매칭 파일 0개(.css/.ts/.tsx 포함 전 확장자). `-rgb` 접미 변형이나 대소문자 무시 검색으로도 0건이다. 즉 patterns.txt:1500-1512 의 GENERATED:theme-roles 표 9행 전체가 배포본에 대응물이 없고, patterns.txt:1498 의 '토큰은 globals.css 의 테마 블록에 있다' 와 patterns.txt:1531-1534 의 '토큰만 정의

### 테마 토글 버튼의 단일 위치는 `ProjectHeader` 우상단 actions shell 안이며 `iconButton` + `projectGuideButton` 클래스 조합으로 들어간다 **[high]**

- **문서**: ProjectHeader.tsx 안에 테마 토글이 있다
- **배포본**: `ProjectHeader.tsx` 에 테마 관련 식별자가 하나도 없다(`setTheme`/`useTheme`/`Theme` 전부 0 hit, `data-theme` 셀렉터 제외). 테마 선택은 `SettingsScene` 의 3지선다 옵션으로만 존재한다. `projectGuideButton` 은 실재하지만 가이드 버튼이지 테마 토글이 아니다
- 근거: apps/web/components/scenes/create/ProjectHeader.tsx 에 테마 제어 식별자 0건 — `setTheme`/`setThemePreference`/`useTheme`/`ThemeToggle`/`ThemePreference` 전부 없고, grep -i theme 로 걸리는 것은 전부 `[html[data-theme=light]_&]` 형태 CSS 셀렉터(:96, :98, :114, :116, :164, :202, :204, :231, :252, :255-256, :263-266)뿐이다. `setThemePreference` 를 가진 파일은 저장소 전체에서 셋뿐이다(git grep -l): apps/web/components/navigation/Gnb.tsx, apps/web/

### 좌상단 브랜드 영역 / 우상단 액션 영역의 위·아래 기준 패딩은 `max(12px, env(safe-area-inset-top, 0px))` **[medium]**

- **문서**: 상단 두 영역의 상하 여백 = `--app-gnb-safe-top` 식(safe-area 반영)
- **배포본**: Create 노드 뷰 헤더 컨테이너는 `py-4` 다. `--spacing: 2px` 격자이므로 상하 8px 이고 `env(safe-area-inset-top)` 은 어디에도 없다. 코드 주석이 명시적으로 '좌우 12px … 상하는 8px' 이라고 적는다. `--app-gnb-safe-top` 은 앱 셸(Gnb)의 토큰이지 캔버스 헤더의 값이 아니다
- 근거: apps/web/components/scenes/CreateScene.tsx:145-147 — `/* 노드 뷰 전용 상단 헤더 — 좌우 12px 은 레이어 패널·툴바·줌과 같은 시작선, 상하는 8px. */` 아래 `const NODE_PROJECT_HEADER = "fixed top-0 left-0 right-0 w-full max-w-none z-[1001] py-4 px-6 box-border"`. CreateScene.tsx:661-663 에서 `viewMode === "node"` 분기가 이 클래스를 그대로 쓰고 style 오버라이드가 없다. apps/web/app/tailwind.css:164 `--spacing: 2px;`(주석 '실측 결과 2px 격자다') 이므로 py-4 = 상하 8px. C

### 좌상단은 `env(safe-area-inset-left, 0px) + 12px`, 우상단은 `var(--app-gnb-main-inline-padding-end)`(= 12px) **[medium]**

- **문서**: 좌우 인셋이 safe-area 와 앱 셸 토큰에서 온다
- **배포본**: 같은 컨테이너가 `px-6`(= 12px) 리터럴 한 값으로 좌우를 동시에 준다. safe-area-inset-left 도, `--app-gnb-main-inline-padding-end` 참조도 없다. 결과 수치 12px 은 우연히 맞지만 출처가 다르고, 719px 이하에서 `--app-gnb-main-inline-padding-end` 가 16px 으로 바뀌어도 이 헤더는 12px 로 남는다
- 근거: 같은 CreateScene.tsx:146-147 이 좌우를 `px-6` 리터럴 한 값으로 동시에 준다 — 좌/우가 서로 다른 출처(safe-area vs 앱 셸 토큰)에서 온다는 문서 표(patterns.txt:1478-1480)의 구조 자체가 성립하지 않는다. `safe-area-inset-left` 는 CreateScene.tsx 에 0건이고 globals.css 에도 없다; 저장소에서 이 문자열이 나오는 곳은 Gnb.tsx:419 `[@media(max-width:719px)]:[.gnb-mainChromeTopBar:not(&)]:[padding-left:max(12px,_env(safe-area-inset-left,_0px))]` 같은 앱 셸 규칙뿐이라 이 헤더에 닿지 않는다. `--app-gnb-

### App Home `.updateBanner` 의 `bannerSlide*` 그라디언트 베이스는 `--palette-gray-900-rgb`(#171b22), 라이트는 `--palette-gray-100-rgb` **[medium]**

- **문서**: 배너 그라디언트 베이스 다크 gray-900 / 라이트 gray-100
- **배포본**: `bannerSlide*` 의 스크림 베이스는 `--banner-scrim-rgb: var(--palette-gray-1000-rgb)` 다. 톤 분기도 bright=`--palette-gray-000-rgb`, dark=`--palette-gray-1000-rgb` 이고 `--palette-gray-100-rgb` 는 이 범위에 아예 없다. 그 범위의 유일한 `--palette-gray-900-rgb` 등장은 배경이 아니라 `--banner-text-rgb`(글자색)다. 배경 자체도 단색 그라디언트가 아니라 `var(--banner-scrim-gradient), var(--archive-hero-bg)` 이미지 합성이다
- 근거: apps/web/components/scenes/appHomeSceneStyles.ts 의 `bannerSlide`(497-547). 그라디언트는 :540 `[--banner-scrim-gradient:linear-gradient(_to_right,_rgb(var(--banner-scrim-rgb)_/_78%)_0%,_rgb(var(--banner-scrim-rgb)_/_46%)_30%,_rgb(var(--banner-scrim-rgb)_/_0%)_60%_)]` 로 오직 `--banner-scrim-rgb` 만 참조하고, 그 값은 :539 `[--banner-scrim-rgb:var(--palette-gray-1000-rgb)]` 다. 톤 분기도 :542 bright=`--palette-gray-000-rg


## §6.7 — 6건

### "위 표는 코드에서 생성된다. 손으로 고치지 말고 `pnpm check-design-system --write` 로 다시 만든다" (+ `<!-- GENERATED:button-inventory START/END -->` 마커) **[high]**

- **문서**: 버튼 인벤토리가 `button-inventory` 생성 구간이며 --write 로 재생성된다
- **배포본**: 배포본 생성기의 regions 는 color-grayscale · type-weight · type-scale · type-scale-responsive · type-utility-class · component-tokens 6개뿐이고 `button-inventory` 는 없다. 대상 문서도 `appRoot/../../DESIGN_SYSTEM.md`(klipse-web 루트) 고정이라 migration/legacy-design-system.md 를 건드리지 않는다. 배포본 DESIGN_SYSTEM.md 의 §6.7 에는 GENERATED 마커가 없고 유지보수 지침은 정반대로 "새 버튼 클래스를 추가하면 6.7절에 한 줄이라도 반영하라"(=손으로 관리)다
- 근거: 생성기 `apps/web/scripts/check-design-system.mjs` 의 `const regions = {…}` (162행)는 정확히 6키다 — color-grayscale(163) / type-weight(168) / type-scale(170) / type-scale-responsive(175) / type-utility-class(191) / component-tokens(200). `button-inventory` 키 없음. `git grep -l "button-inventory" origin/main` 결과 파일 0개(theme-roles 도 0개). 대상 문서는 19-22행 `const appRoot = process.cwd(); const DOC_PATH = join(appRoot

### `components/scenes/create/node-canvas-v2/nodes/VideoEditModal.tsx` 행에 alignButton·alignButtonActive·alignButtonGroup·assetRailBtn·assetRailBtnActive·i **[medium]**

- **문서**: 이 17개 이름의 소유 파일이 VideoEditModal.tsx 라고 표기
- **배포본**: 17개 모두 VideoEditModal.tsx 안에 없다. 정의는 `videoEditParts/vemClass.ts`(Btn/Button 이름의 상수 33개)에, 사용은 `videoEditParts/OverlayInspector.tsx` · `ClipInspector.tsx` · `AudioClipInspector.tsx` · `AssetPanel.tsx` 에 있다. 그런데 `vemClass.ts` 는 139행짜리 표에 단 한 번도 등장하지 않는다
- 근거: apps/web/components/scenes/create/node-canvas-v2/nodes/VideoEditModal.tsx(14,170줄) 전체에서 alignButton|assetRailBtn|inspectorAudioIconBtn|inspectorFieldRemoveBtn|inspectorToggleBtn|overlayDeleteBtn|overlayUploadBtn|propertiesGhostBtn|sourceItemRemoveBtn|sourceSectionAddBtn → 0건. 정의는 전부 videoEditParts/vemClass.ts 에 있다: alignButton:4, alignButtonActive:34, alignButtonGroup:50, assetRailBtn:125, assetRa

### `components/scenes/create/node-canvas-v2/nodes/EditNode.tsx` 행에 `editUploadButton` 이 있다 **[low]**

- **문서**: EditNode.tsx 가 editUploadButton 버튼 클래스를 보유
- **배포본**: EditNode.tsx 의 `editUploadButton` 은 실제 식별자가 아니라 다른 파일을 가리키는 주석 문장("NodeSideButtons·VideoNode.editUploadButton과 동일 토큰")이다. 저장소 전체에서 editUploadButton 은 이 주석과 drawNodes.ts 의 주석 2곳뿐이며 선언·사용은 0건
- 근거: `git grep -n -i -E "edit[-_]?[Uu]pload[-_]?[Bb]utton" origin/main` 은 저장소 전체에서 딱 2건이고 둘 다 주석이다: apps/web/components/scenes/create/node-canvas-v2/nodes/EditNode.tsx:169 `/* ── Video in/out handles — NodeSideButtons·VideoNode.editUploadButton과 동일 토큰(색·그림자·호버). ──` (블록 주석 첫 줄, 실제 선언은 :178 `const SIDE_HANDLE_SHELL_BASE = [`), apps/web/components/scenes/create/node-canvas-v2/lib/archiveThumbnail/drawNod

### 인벤토리 표에 `app/(highlight-standalone)/**` 8행이 들어 있다 (hl-login, hl-signup, hl-signup/check-email, hl/[projectId], layout.tsx — submitBtn·toggleBtn·viewBt

- **문서**: 이 8개 파일이 apps/web 에 존재하며 버튼 클래스·상수를 보유한다고 표에 나열
- **배포본**: origin/main 의 apps/web 트리에 `(highlight-standalone)` 경로가 0건이다. 139행 전수 대조 결과 존재하지 않는 파일은 이 8개뿐이며, 배포본 생성기는 바로 이 종류의 썩음을 막으려고 문서가 인용한 `app/`·`components/` 경로의 실재를 검사하고 없으면 exit 1 한다 — 이 표를 그 검사에 걸면 8건이 잡힌다
- 근거: check-design-system.mjs:228

### `app/globals.css` 행: `processButton` · `sideButtons` · `toolbarButton` · `uploadPillButton`

- **문서**: globals.css 가 이 네 개의 버튼 클래스·상수를 보유한다 (표 서문: "실제 `<button>` / `role` 링크 버튼에 쓰이는 … 클래스 상수")
- **배포본**: 네 이름 모두 CSS 선택자가 아니라 **주석 산문**으로만 등장한다. `^\s*\.(processButton|sideButtons|toolbarButton|uploadPillButton)` 선택자는 0건. 게다가 globals.css 는 `sideButtons` 를 "Tailwind 전환으로 사라진 클래스"라고 명시하고 클래스명 매칭에 다시 의존하지 말라고 경고한다
- 근거: globals.css:1262

### 표는 "Tailwind 클래스 상수와 **남아 있는 CSS Module 클래스**" 를 정리한 것이다

- **문서**: apps/web 에 CSS Module 클래스가 아직 남아 있다는 전제
- **배포본**: origin/main 의 apps/web 에 `.module.css` 파일이 **0개**다. 표가 인용한 module.css 4개는 전부 위에서 확인된 (highlight-standalone) 유령 경로다. 배포본 §6.7 이 "CSS Module 인벤토리" 라는 옛 제목을 달고 있는 것과 달리 실제 코드에는 CSS Module 이 남아 있지 않다
- 근거: DESIGN_SYSTEM.md:475


## §6.8 — 6건

### 평면 심볼 마크 `components/ui/BrandSymbolMark.tsx` 가 auth 브랜드 패널의 마크다 — `<BrandSymbolMark />` 를 렌더한다 **[high]**

- **문서**: 원천 파일 표에 BrandSymbolMark.tsx 를 auth 패널 마크로 올리고, 브랜드 마크 절에서 `컴포넌트: <BrandSymbolMark />` 라고 못박는다
- **배포본**: origin/main 전체에서 BrandSymbolMark 를 import 하는 소비자가 하나도 없다 — 유일한 참조는 자기 정의와 DESIGN_SYSTEM.md 뿐인 사실상 dead component. 세 auth 원천은 모두 `BrandLogo`(워드마크)를 import 해 렌더한다
- 근거: `git grep -n "BrandSymbolMark" origin/main` 전체 결과 4줄뿐이고 전부 비-소비자다: BrandSymbolMark.tsx:12(자기 정의), DESIGN_SYSTEM.md:735·748·777(문서 자신). import 하는 파일 0개 = dead component. 반면 세 auth 원천은 모두 BrandLogo(워드마크)를 렌더한다 — login/page.tsx:9 import, 본문 `<aside className={BRAND_PANEL} aria-hidden="true"><BrandLogo themeMode="dark" alt="Klipse" width={logoWordmarkWidthForHeight(28)} height={28} className={BRAND_SY

### BrandSymbolMark 는 viewBox `0 0 800 800` 단일 path 이고 `fill="currentColor"` 라 CSS `color` 만으로 톤 제어된다 **[high]**

- **문서**: 단일 path + fill=currentColor → color 로 톤 제어
- **배포본**: viewBox 는 맞지만 path 가 아니다. 내부는 `<image href="/symbol.png" width=800 height=800>` 한 장이고, `fill` 속성도 `currentColor` 도 없다. 대신 `drop-shadow(0 1px 4px rgb(0 0 0 / 28%))` 필터가 하드코딩돼 있어 CSS color 로는 톤이 전혀 바뀌지 않는다
- 근거: `git show origin/main:apps/web/components/ui/BrandSymbolMark.tsx` 전문 31줄 직접 확인. 맞는 것은 viewBox 뿐(15행 `viewBox="0 0 800 800"`). 자식은 path 가 아니라 21-28행 `<image href="/symbol.png" x="0" y="0" width="800" height="800" preserveAspectRatio="xMidYMid meet" />` 단 하나 — 파일 전체에 `<path>`, `fill`, `currentColor` 문자열이 존재하지 않는다. 4-6행 `const SYMBOL_STYLE: CSSProperties = { filter: "drop-shadow(0 1px 4px rgb(0 0 0 /

### 브랜드 마크 크기는 `36px × 36px` 이다 **[high]**

- **문서**: 36×36 정사각 심볼
- **배포본**: 정사각이 아니라 워드마크다 — 세 원천 모두 `height={28}` 에 `width={logoWordmarkWidthForHeight(28)}` 로 폭을 비율 계산한다. 36 이라는 값은 origin/main auth 코드 어디에도 없다
- 근거: 세 원천 모두 `width={logoWordmarkWidthForHeight(28)} height={28}` 이다 (login/page.tsx, signup/page.tsx, components/auth/AuthStatusCard.tsx 의 `<BrandLogo …>` JSX 가 문자 단위로 동일). `apps/web/components/ui/brandLogoMetrics.ts:10-12` — `logoWordmarkWidthForHeight(h) = Math.round(h * 291 / 85)` (LOGO_VIEWBOX_W=291, LOGO_VIEWBOX_H=85) → h=28 이면 96. 즉 실제 박스는 96×28 워드마크이고 정사각이 아니다. auth 세 파일에서 36 은 마크 크기로 등장하지 않는다(

### 브랜드 마크 표시 톤은 `var(--gray-000)` 이며, 다크 패널 위 화이트 평면이라 Figma 큐브 그라디언트 효과는 의도적으로 쓰지 않는다 **[medium]**

- **문서**: var(--gray-000) 평면 화이트, 그라디언트 미사용
- **배포본**: 패널 마크는 `<BrandLogo themeMode="dark">` — CSS color 가 아니라 테마별 이미지 자산 전환으로 톤이 정해지고 `--gray-000` 은 개입하지 않는다. 게다가 BrandSymbolMark 자신의 docstring 은 GNB 로고에 임베드된 심볼 PNG 와 픽셀 동일한 실제 에셋을 그대로 렌더한다고 적혀 있어 '그라디언트 의도적 미사용'과 정반대다
- 근거: 패널 마크에는 색 선언이 없다. login/page.tsx 의 `BRAND_SYMBOL = ["[@media(max-width:719px)]:hidden!", "[@media(min-width:720px)]:block!"]`, AuthStatusCard.tsx 의 `BRAND_SYMBOL = "hidden! [line-height:0] [@media(min-width:720px)]:block!"` — 순수 display 유틸뿐이고 `--gray-000` 이 개입할 자리가 없다. 실제 톤은 BrandLogo.tsx 가 `/klipse-light.svg` 와 `/klipse-dark.svg` 두 `<Image>` 를 깔고 `assetClassName(themeMode, asset)`(39-44행)이 opacit

### 슬로건 컬러는 `var(--gray-000)` 이다 **[medium]**

- **문서**: 컬러: var(--gray-000)
- **배포본**: `text-palette-gray-000` — 시맨틱 토큰이 아니라 팔레트 원시값(#fafafa)을 직접 고정한다. `--gray-000` 은 라이트 테마에서 `--palette-gray-1000` 으로 뒤집히므로 문서대로면 라이트 테마에서 파란 패널 위 슬로건이 검게 변한다. 코드가 팔레트를 고정한 것은 그 뒤집힘을 피하려는 의도적 선택이다
- 근거: 세 원천의 BRAND_SLOGAN 은 모두 `"[@media(min-width:720px)]:text-palette-gray-000"` 이다(login/page.tsx·signup/page.tsx·AuthStatusCard.tsx 배열 내 동일 항목, 인용 좌표와 ±1). tailwind.css:58 `--color-palette-gray-000: var(--palette-gray-000);` → globals.css:20 `--palette-gray-000: #fafafa;` (`:root`, 14행 시작) 로 테마 무관 고정값이다. 반면 문서가 말한 `--gray-000` 은 테마 의존이다 — globals.css:664-665 `html[data-theme="dark"] { --gray-000: var

### ≥1200px 미디어 쿼리에서 `--type-heading-48-size/line-height/letter-spacing` 을 직접 적용해 한 단계 상승시킨다 (세 원천 공통) **[low]**

- **문서**: 세 토큰 값을 직접 적용
- **배포본**: signup 과 AuthStatusCard 만 세 CSS 변수를 직접 적용한다. login 은 Tailwind 테마 유틸 `text-heading-48!` 한 줄로 처리해 메커니즘이 다르다 — 결과값은 tailwind.css 가 같은 변수로 되돌리지만, 문서가 '동일 레이어를 공유한다'고 말하는 구조가 실제로는 갈라져 있다
- 근거: signup/page.tsx 와 components/auth/AuthStatusCard.tsx 의 BRAND_SLOGAN 만 `[@media(min-width:1200px)]:[font-size:var(--type-heading-48-size)]!` / `[line-height:var(--type-heading-48-line-height)]!` / `[letter-spacing:var(--type-heading-48-letter-spacing)]!` 세 줄을 직접 갖는다(두 파일 문자 단위 동일). login/page.tsx 의 BRAND_SLOGAN 마지막 항목은 `"[@media(min-width:1200px)]:text-heading-48!"` 한 줄뿐이고 CSS 변수를 직접 쓰지 않는다. 최종값은 t


## §6.9 — 6건

### `NODE_MAIN` 은 `relative w-[calc(var(--node-card-width) + 2 * var(--node-side-outset))]` 이고 노드 8종이 이 구조를 공유한다 **[high]**

- **문서**: 부품 표의 `NODE_MAIN` 행이 calc 폭 하나만 적고, 서두에서 "노드 8종이 이 구조를 공유하므로 새 노드는 여기서 시작한다"고 못박는다
- **배포본**: 8종 중 5종(Image·Video·Text·Tts·Bgm)만 calc 형태다. Edit·Youtube·Instagram 은 `const NODE_MAIN = "relative w-[var(--node-card-width)]"` 로 outset 항이 아예 없다
- 근거: 노드 8종 NODE_MAIN 을 전부 열어 대조했다. calc 형 5종 — ImageNode.tsx:137-138 / VideoNode.tsx:121-122 / TextNode.tsx:96-97 / TtsNode.tsx:79-80 / BgmNode.tsx:80-81 이 모두 `"relative w-[calc(var(--node-card-width)_+_2_*_var(--node-side-outset))]"`. plain 형 3종 — EditNode.tsx:84 · YoutubeNode.tsx:99 · InstagramNode.tsx:70 이 `const NODE_MAIN = "relative w-[var(--node-card-width)]";` 로 outset 항이 없다. NODE_WRAP 도 짝을 이뤄 갈

### `[data-node-canvas-marketing]` 스코프 안에서만 outset 이 `var(--node-side-leading-offset)`(38px)로 올라가고 컨테이너 정렬이 `items-center` → `items-stretch` 로 바뀐다 (⇒ 랜딩 노 **[high]**

- **문서**: 앱/랜딩 2행 표를 노드 일반 규칙으로 제시한다
- **배포본**: 그 마케팅 선언(`NODE_CONTAINER_CHROME`)은 Image·Text·Video 3종에만 존재한다. Bgm·Tts·Edit·Youtube·Instagram 파일에는 `NODE_CONTAINER_CHROME` 자체가 없어 랜딩에서도 outset 이 0 이다
- 근거: `NODE_CONTAINER_CHROME`(=`[[data-node-canvas-marketing]_&]:[--node-side-outset:var(--node-side-leading-offset)]` + `:items-stretch`) 는 저장소 전체에서 3건뿐 — ImageNode.tsx:132-134 · TextNode.tsx:91-93 · VideoNode.tsx:116-118. Bgm·Tts 는 `[--node-side-outset:0px]` 만 두고 마케팅 오버라이드가 없고(BgmNode.tsx:74-77 · TtsNode.tsx:73-76), Edit·Youtube·Instagram 은 토큰 자체가 없다. CSS 쪽에도 없음 — 전 `.css` 파일에서 `--node-side-outset` 선언

### 노드 컨테이너가 로컬 토큰 `[--node-card-width:400px]` · `[--node-side-outset:0px]` 를 선언한다 / "기본값은 0px(각 노드 컨테이너에서 선언)" **[medium]**

- **문서**: 부품 표와 `--node-side-outset` 절 모두 두 토큰이 각 노드 컨테이너에서 선언된다고 적는다
- **배포본**: `--node-card-width:400px` 은 8종 전부 선언하지만 `[--node-side-outset:0px]` 는 5종(Bgm·Image·Text·Tts·Video)만 선언한다. Edit·Youtube·Instagram 컨테이너에는 그 줄이 없다
- 근거: origin/main 전수 확인. `[--node-card-width:400px]` 은 8종 전부 선언(Bgm:75, Edit:80, Image:119, Instagram:49, Text:81, Tts:74, Video:101, Youtube:96). 그러나 `[--node-side-outset:0px]` 는 5종만 — BgmNode.tsx:76 · ImageNode.tsx:120 · TextNode.tsx:82 · TtsNode.tsx:75 · VideoNode.tsx:102. EditNode.tsx:79-81 은 NODE_CONTAINER 가 ["[--node-card-width:400px]", ...] 뿐이고, YoutubeNode.tsx:96-97 · InstagramNode.tsx:49-50 은 단

### 카드 `NODE_WRAP` 은 `ml-[var(--node-side-outset)]` 로 밀린다 **[medium]**

- **문서**: 부품 표의 카드 행, 그리고 "카드는 `ml-[var(--node-side-outset)]` 로 밀리므로" 라는 폭 산식 근거
- **배포본**: Edit·Youtube·Instagram 의 `NODE_WRAP` 에는 `ml-[var(--node-side-outset)]` 이 없다 — 세 노드에서는 outset 산식 자체가 성립하지 않는다
- 근거: NODE_WRAP 첫 줄 전수: ml-[var(--node-side-outset)] 있음 5종 — BgmNode.tsx:86 · ImageNode.tsx:147 · TextNode.tsx:251 · TtsNode.tsx:85 · VideoNode.tsx:129. 없음 3종 — EditNode.tsx:143 `"relative w-[var(--node-card-width)] box-border"`, YoutubeNode.tsx:259 `"relative w-[var(--node-card-width)] box-border h-auto flex flex-col"`, InstagramNode.tsx:141 `"relative w-[var(--node-card-width)] box-border h-240 flex f

### 카드는 `overflow-visible` 이다 **[medium]**

- **문서**: 부품 표 카드 행에 `overflow-visible`, 본문에도 "카드는 `overflow-visible` 이라 헤더를 클리핑하지도 않는다"
- **배포본**: Youtube·Instagram 카드는 `overflow-hidden` 이다(둘 다 `h-auto flex flex-col` / `h-240 flex flex-col` 구조와 한 쌍). 나머지 6종만 visible
- 근거: NODE_WRAP 의 rounded-[var(--node-outer-radius,24px)] 행 전수: overflow-visible 6종 — BgmNode.tsx:87 · EditNode.tsx:144 · ImageNode.tsx:148 · TextNode.tsx:255 · TtsNode.tsx:86 · VideoNode.tsx:130. overflow-hidden 2종 — YoutubeNode.tsx:260(259행이 `h-auto flex flex-col`) · InstagramNode.tsx:142(141행이 `h-240 flex flex-col`). 문서 1834행 부품표와 1822행 본문의 '카드는 overflow-visible' 보편 명제는 2종에서 반증된다.

### 본문 밴드 `NODE_BODY` 는 오디오 노드(Bgm/Tts)에만 존재한다 **[medium]**

- **문서**: 적층 순서 다이어그램과 부품 표가 `NODE_BODY` 를 Bgm·Tts 공통 밴드로 적는다
- **배포본**: `NODE_BODY` 선언은 BgmNode 한 곳뿐이다. TtsNode 에는 본문 밴드가 없고, 미디어 밴드 주석이 "아래 간격은 뒤따르는 프롬프트 밴드의 패딩이 전담한다"고 적어 미디어 밴드 다음이 곧장 프롬프트 밴드임을 명시한다
- 근거: origin/main 의 모든 .ts/.tsx/.css 를 파일 단위로 훑은 결과 `NODE_BODY` 히트는 BgmNode.tsx 단 한 파일(4회)뿐이다. BgmNode.tsx:144 `const NODE_BODY`, :154 `NODE_BODY_WITH_MEDIA`, :1155 조건부 합성 렌더. TtsNode.tsx 에는 선언도 사용도 없고 밴드 상수가 NODE_WRAP(85) → NODE_MAIN_MEDIA_BAND(95) → NODE_HEADER_ABOVE(105) 로만 이어진다. TtsNode.tsx:91-93 주석이 '하단만 0 — 아래 간격은 뒤따르는 프롬프트 밴드의 패딩이 전담한다(합산 16px 방지)' 라 미디어 밴드 다음이 곧장 프롬프트 밴드임을 명시한다(대조: BgmNode.tsx:1


## §6.10 — 6건

### `variant="primary"` 일 때만 리터럴 클래스 `Button_primary` 가 추가로 붙는다 — hl 라우트 전용 스코프 훅 **[high]**

- **문서**: 클래스 조립 순서가 `[type-body-14-medium, ROOT, SIZE, BORDER, VARIANT, (primary면 PRIMARY_HOOK), (아이콘 패딩), className]` 이고, `hl/page.module.css` 가 `[class*="Button_primary"]` 를 잡아 `color:#1a1a1a !important` 를 건다
- **배포본**: origin/main 의 Button.tsx 어디에도 `Button_primary` / `PRIMARY_HOOK` 문자열이 없다. classes 배열은 [type-body-14-medium, ROOT, SIZE, BORDER, VARIANT, leftIconPad, rightIconPad, className] 8칸뿐이고 primary 분기가 없다. 저장소 전체 grep 도 0건이며, `docs/tailwind-migration.md:679` 가 "`Button.tsx` 의 `PRIMARY_HOOK`(§7-G)도 같이 걷어냈다" 고 제거를 기록한다
- 근거: origin/main 전 파일 스캔에서 `Button_primary` / `PRIMARY_HOOK` 문자열의 유일한 히트는 docs/tailwind-migration.md:679 ("`Button.tsx` 의 `PRIMARY_HOOK`, §7-G)도 같이 걷어냈다") — 코드에는 0건이다. Button.tsx 실물 classes 배열은 ["type-body-14-medium", ROOT, isSmall?SIZE_SM:SIZE_MD, variant==="secondary"?BORDER_SECONDARY:BORDER_NONE, VARIANT_CLASS[variant], leftIcon 패딩, rightIcon 패딩, className] 8칸이고 `variant === "primary"` 분기가 아예 없다. pr

### `app/(highlight-standalone)/hl/page.module.css` 가 팔레트를 반전시켜 그 라우트의 primary 가 노란 면 + #1a1a1a 텍스트가 된다 (`:47-48`, `:55`, `:12`, `:65-70`), 그리고 hl 스코프(.wr **[high]**

- **문서**: hl 스코프 절 전체 + variant 최종색 표의 세 번째 행(#d4d4d4 / rgb(10 10 10) 기준 테두리·hover) + `hl/page.tsx:57-59`·`hl/[projectId]/page.tsx:203-204` 인용
- **배포본**: origin/main 에 `(highlight-standalone)` 트리도, `hl/` 디렉터리도, `page.module.css` 라는 이름의 파일도 **단 하나도 없다**. 하이라이트 라우트는 `app/highlight/` 로 이동했고 CSS 모듈이 아니라 유틸리티로 작성돼 있다. 따라서 §6.10 이 적은 회색 램프 '세 벌' 중 hl 한 벌은 존재하지 않으며 실제로는 두 벌(전역 #777d89 · 앱 셸 #9aa0ab)뿐이다
- 근거: `git ls-tree -r --name-only origin/main` 기준: `module.css` 로 끝나는 파일 0건, `app/(` 로 시작하는 라우트 그룹 0건 → `app/(highlight-standalone)/hl/page.module.css` 와 인용된 `:12`·`:23`·`:34`·`:47-48`·`:55`·`:65-70` 은 존재하지 않는 파일의 존재하지 않는 줄이다. 하이라이트 라우트는 apps/web/app/highlight/ 로만 존재한다(page.tsx, layout.tsx, HighlightWorkspace.tsx, [projectId]/page.tsx, [projectId]/shorts/[shortId]/page.tsx + CaptionColorPanel.tsx). 문서가 

### `variant="ghost"` 는 2곳 — `app/highlight/[projectId]/shorts/[shortId]/page.tsx:1345,1355` **[medium]**

- **문서**: ghost 호출부 2곳, 줄 1345·1355
- **배포본**: 3곳이고 줄도 다르다: shorts page `:1335`·`:1345`, 그리고 문서에 없는 새 자리 `CreativeMediaAdminClient.tsx:544`(`<Button variant="ghost" size="sm">`)
- 근거: `variant="ghost"` 를 전 .ts/.tsx 파일 단위로 스캔한 결과 3곳이다: apps/web/app/highlight/[projectId]/shorts/[shortId]/page.tsx:1335, 같은 파일:1345, apps/web/components/creative-media/CreativeMediaAdminClient.tsx:544 (`<Button variant="ghost" size="sm" disabled={busy} onClick={onDelete}>`). 문서 2206행은 '2건 / :1345,1355' 라 적는데, 1355 는 ghost 가 아니고 CreativeMediaAdminClient 호출부는 통째로 누락됐다. 단순 좌표 밀림이 아니라 건수(2→3)가 틀렸으므로 STAL

### `size="sm"` 은 5곳 — HomeCreateNewMenu:112 · NodeCanvasHomeScene:1274,1296 · VideoEditScene:728,750 **[medium]**

- **문서**: sm 호출부 5곳
- **배포본**: ui/Button 소비처 기준 9곳이다. NodeCanvasHomeScene 은 `:1274,1296` 이 아니라 `:1305,1327` 이고, 문서에 없는 CreativeMediaAdminClient `:245,:523,:540,:544` 4곳이 새로 생겼다. (HomeCreateNewMenu:112 · VideoEditScene:728,750 은 일치)
- 근거: patterns.txt:2207 says `size="sm"` is 5 call sites. Deployment: Button `size="sm"` exists at 9 call sites — components/scenes/HomeCreateNewMenu.tsx:112, components/scenes/NodeCanvasHomeScene.tsx:1305 and :1327, components/scenes/VideoEditScene.tsx:728,750, plus components/creative-media/CreativeMediaAdminClient.tsx:245,523,540,544 (that file imports `{ Button } from "@/components/ui/Button"` at :4

### 실사용 census — `ui/Button` import 17파일 · `<Button` 호출부 26곳

- **문서**: import 17파일, 호출부 26곳
- **배포본**: import 19파일(`@/components/ui/Button` 16 + 상대경로 `../ui/Button` 3: AppHomeScene:17 · HomeCreateNewMenu:10 · NodeCanvasHomeScene:16), `<Button` 호출부 38곳(Button.tsx 자기 정의 1건 제외). 컴포넌트 커버리지가 문서 기록보다 약 1.5배 늘었다
- 근거: AppHomeScene.tsx:17, HomeCreateNewMenu.tsx:10, NodeCanvasHomeScene.tsx:16

### §6.10 의 Button.tsx 줄번호 인용 전량 (py-0 `:58,65` · radius `:46` · primary `:91-103` · danger `:126-133` · text-palette-gray-600 `:107,118` · 다크 `:111-113`/

- **문서**: 위 좌표들
- **배포본**: 값·선언은 전부 그대로지만 **좌표가 통째로 밀렸다**: py-0 → :56,63 · radius → :44 · primary → :88-100(배경 :89 · color :90 · box-shadow :91 · ::before :94) · danger → :123-130(:126 ≡ :91) · gray-600 → :104,115 · 다크 → :108-110 / :119-120 · type-body-14-medium → :170 · [font-family:inherit] → :45. 문서 좌표를 그대로 열면 다른 줄이 나온다
- 근거: Button.tsx:44, Button.tsx:88-100, Button.tsx:170


## §6.11 — 2건

### 셸은 이 넷 밖에서도 재사용된다 — (EditorProjectWorkspace · YoutubeAnalyticsScene · VideoEditScene) 셋을 추가 소비처로 열거 **[medium]**

- **문서**: 셸의 추가 소비처는 EditorProjectWorkspace · YoutubeAnalyticsScene · VideoEditScene 세 파일
- **배포본**: origin/main 에는 그 셋 외에 node-canvas-v2/index.tsx(직접 렌더 2곳)와 nodes/VideoEditModal.tsx 도 GlassConfirmModal 을 import·렌더한다. 실제 소비 파일은 3개가 아니라 5개다 — '고치면 파급이 넓다'의 범위가 문서보다 크다
- 근거: patterns.txt:2226 lists exactly three extra consumers. Deployment has five files importing+rendering GlassConfirmModal outside the shell and the three wrappers: EditorProjectWorkspace.tsx:16/1303, VideoEditScene.tsx:14/974, YoutubeAnalyticsScene.tsx:8/2364, node-canvas-v2/index.tsx:65 with two real JSX renders at :10763 and :10796, and node-canvas-v2/nodes/VideoEditModal.tsx:49 with a render at :1

### titleId 기본값은 glass-confirm-title 이고 파생마다 고유값을 넘긴다(plan-gate-modal-title · node-delete-confirm-title · credit-confirm-modal-title) **[low]**

- **문서**: 고유 titleId 를 넘기는 파생은 셋뿐
- **배포본**: 기본값 glass-confirm-title 은 맞으나(GlassConfirmModal.tsx:138), 고유 titleId 를 넘기는 호출부가 둘 더 있다 — index.tsx 의 edit-edge-remove-confirm-title 과 video-model-change-drop-confirm-title. 둘 다 confirmVariant='danger' 이고 children 이 없다. 즉 danger 확인 모달은 NodeDeleteConfirmModal 하나가 아니라 셋이다
- 근거: Default is correct: GlassConfirmModal.tsx:138 `titleId = "glass-confirm-title"`, type :149, consumed at the card as aria-labelledby/id. But the doc's parenthetical list of unique titleIds is not exhaustive. Deployment has 9 call sites and 8 of them pass a unique titleId: plan-gate-modal-title (PlanGateModal.tsx:38), node-delete-confirm-title (NodeDeleteConfirmModal.tsx:67), credit-confirm-modal-ti


## §6.12 — 5건

### 오류 배너 텍스트: `overflow-hidden text-ellipsis whitespace-nowrap!`. 28px 한 줄 고정이므로 넘치면 말줄임 **[high]**

- **문서**: 한 줄 고정 + nowrap 말줄임
- **배포본**: `flex-[1_1_auto] min-w-0 line-clamp-3 break-words` — 최대 3줄까지 늘어나고 그 뒤 클램프한다. nowrap·text-ellipsis 선언 자체가 없다 (전문을 `title` 로 노출하는 부분만 유효)
- 근거: patterns.txt:2549 says the banner text is `flex-[1_1_auto] min-w-0 overflow-hidden text-ellipsis whitespace-nowrap!` and is locked to one 28px line. Deployment: PROMPT_ERROR_BANNER_TEXT = "flex-[1_1_auto] min-w-0 line-clamp-3 break-words" — ImageNode.tsx:542-543, VideoNode.tsx:875-876, EditNode.tsx:589-590, TtsNode.tsx:704-705, BgmNode.tsx:651-652, with the preceding comment "최대 3줄 클램프" on each. N

### `--app-tooltip-kbd-bg` 와 `--app-tooltip-text-subtle` 은 정의만 있고 소비처가 0 이다 — 툴팁 안 단축키 칩 UI 는 아직 없다 **[medium]**

- **문서**: 두 토큰 모두 소비처 0, 단축키 칩 UI 없음
- **배포본**: 단축키 칩이 실재한다. `modalRadixTooltipKbd` 가 두 토큰을 함께 소비하고(color: text-subtle, background: kbd-bg), text-subtle 은 애널리틱스 차트 툴팁 2곳에서도 쓰인다. 소비처는 최소 4곳
- 근거: patterns.txt:2564-2565 claims both tokens have 0 consumers and that no tooltip kbd chip UI exists. Deployment contradicts both. Outside globals.css (definitions at :395 and :699/:744/:788/:832), consumers are: videoEditParts/vemClass.ts:1408-1416 `modalRadixTooltipKbd` which consumes BOTH tokens in one block ([color:var(--app-tooltip-text-subtle)] at :1415, [background:var(--app-tooltip-kbd-bg)] a

### 오류 배너 면: `h-14`(높이 28px 고정) · `py-0 px-4` **[medium]**

- **문서**: 높이 28px 고정, 상하 패딩 0
- **배포본**: `min-h-14 py-4 px-4` — 28px 는 최소 높이이고 상하 패딩이 8px 있다. 다섯 노드 전부 같은 문자열
- 근거: patterns.txt:2547 says the banner face is `h-14`(height 28px fixed) · `py-0 px-4`. All five nodes carry the byte-identical string "flex items-center gap-4 w-full min-h-14 py-4 px-4 box-border": ImageNode.tsx:535, VideoNode.tsx:869, EditNode.tsx:583, TtsNode.tsx:698, BgmNode.tsx:645. So it is min-height, not fixed height, and vertical padding is py-4 (8px on the 2px --spacing grid, tailwind.css), n

### z-index 스택 … 영상 편집 모달 10100 **[medium]**

- **문서**: 영상 편집 모달이 10100
- **배포본**: 모달 루트(`modalRoot`)는 z-index 9999 다. 10100 은 에디터 토스트(`editorToast`)와 프리뷰 툴바 드롭다운(`previewToolbarDropdownMenuZ`)의 값이다. ChromeTooltip.tsx:32 의 코드 주석도 같은 낡은 값을 적고 있어 문서가 그것을 그대로 옮긴 것으로 보인다
- 근거: patterns.txt:2554 puts the video edit modal at z-index 10100. The modal root class VEM_CLASS.modalRoot is applied at VideoEditModal.tsx:10885 (docked variant :10884) and is defined at vemClass.ts:1418-1422 with "[z-index:9999]" (modalRootDocked at :1435-1440 is z-index:0). Every 10100 in origin/main is something else: vemClass.ts:678 editorToast, vemClass.ts:2489 previewToolbarDropdownMenuZ (`[z-i

### 표면·타이포·모션 토큰은 완전히 통일돼 있다. 세 변형이 모두 `globals.css` 의 `.app-tooltip-chrome` SSOT 를 소비한다 **[medium]**

- **문서**: 세 변형 모두 `.app-tooltip-chrome` 클래스를 소비
- **배포본**: `.app-tooltip-chrome` 클래스를 실제로 얹는 것은 A(`ChromeTooltip`)의 `BUBBLE_INNER` 뿐이다. B 는 `[data-tooltip]::after` 가, C 는 `modalRadixTooltipContent`/`Inner` 가 같은 `--app-tooltip-*` 토큰을 각자 다시 선언한다 — 통일 지점은 클래스가 아니라 토큰이다. 계산값은 같지만 '클래스를 소비한다'는 서술은 틀렸고, 이 차이 때문에 클래스에 선언을 하나 더해도 B·C 에는 전파되지 않는다
- 근거: apps/web/components/scenes/create/node-canvas-v2/components/ChromeTooltip.tsx:84-88 — `const BUBBLE_INNER = ["app-tooltip-chrome", "block max-w-full", ...]` — A만 클래스를 얹는다. apps/web/app/globals.css:1479 에 `.app-tooltip-chrome {` 이 있고, 그와 별개로 :1493 `[data-tooltip]:not([data-tooltip=""])::after` 가 color/background/border/box-shadow/border-radius/padding/font-size/font-weight/line-height/letter-spacin


## §6.13 — 16건

### 프로바이더 스택(AuthProvider → ThemeProvider → YoutubeConnectionProvider → InstagramConnectionProvider → I18nProvider → GenerationProvider → HighlightUploadP **[high]**

- **배포본**: 반증 시도 실패 — 원 판정 WRONG 유지. 좌표 밀림이 아니라 사실이 틀렸다. (1) 프로바이더 '순서'는 layout.tsx:94-100 과 정확히 일치하고, 인용 좌표 8개가 전부 정확하다(오차 0). (2) GenerationProvider.tsx 는 {children}(263) 뒤 형제로 항상 <style>(307-316)을, toasts.length>0 일 때 position:fixed; bottom:32px; left:50%; zIndex:1500 토스트 스택(264-306)을 렌더한다. 파일 전체에 precedence/href prop 이 0건이므로 React 19(react ^19.2.0, next 16.1.5)는 이 <style> 을 <head> 로 hoist 하지 않고 제자리(=<body>)에 렌더한다 — 즉 토스트가 없어도 DOM 노드가 항상 하나 생긴다. (3) GenerationProvider 가 HighlightUploadProvider 를 감싸므로 두 노드는 PastDueBanner·div.SITE_ROOT·GoogleAnalytics 뒤 <body> 직계 형제로 붙는다. (4) apps/web/app 하위 layout.tsx 17개 중 <html>/<body> 를 가진 것은 app/layout.tsx 뿐이라 GenerationProvider 는 전 라우트에서 마운트된다. (5) 나머지 6개는 실제로 C
- 근거: apps/web/app/layout.tsx:94-100 · apps/web/components/generation/GenerationProvider.tsx:259-317 (fixed 컨테이너 264-306, zIndex 270, <style> 307-316)

### 셸 토큰(--app-gnb-* · --app-shell-* · --app-page-bg)의 원천은 `app/globals.css` 의 `:root`, `html[data-app-gnb-sidebar-collapsed="true"]`, `@media (max-width: **[high]**

- **배포본**: 세 위치는 `--app-gnb-*` 에 대해서만 맞다. 두 가지가 틀렸다. (1) `--app-page-bg` 는 `:root` 에 없다 — `html[data-theme="dark"]`(691) · `html[data-theme="light"]`(734) · `[data-landing-walkthrough-dark]`(779) · `[data-landing-walkthrough-light]`(823) 네 테마 스코프에만 있고, 앱 셸 재정의는 globals.css 가 아니라 Gnb.tsx:1987 의 Tailwind 임의 변형에 있다. (2) `--app-shell-vh` 는 globals.css 에 아예 정의가 없다 — globals.css 의 `--app-shell-*` 은 `--app-shell-min-width`(148, 434) 뿐이고, `--app-shell-vh` 는 AppHomeScene.tsx:246 이 `documentElement.style.setProperty` 로 런타임 주입한다. 덧붙여 `--app-gnb-main-card-padding-block-start` 도 globals.css:124 밖에서 5개 씬 파일이 20px 로 덮는다(appHomeSceneStyles.ts:915 · NodeCanvasHomeScene.tsx:91 · YoutubeAnalyticsScene.tsx:739 · Instagram
- 근거: apps/web/app/globals.css:108-148 / 407-411 / 413-428, :691·734·779·823; apps/web/components/navigation/Gnb.tsx:1987; apps/web/components/scenes/AppHomeScene.tsx:246

### 형태 B 씬은 표의 7개(`myPageSceneStyles.ts` · VideoEditScene · HighlightScene · HighlightProjectScene · ExploreScene · SettingsScene · SubscriptionScene)이며,  **[high]**

- **배포본**: 형태 B 카드를 거는 소비처가 표 밖에 3곳 더 있고 전부 `components/scenes/` 가 **아니라** 라우트 폴더 안이다 — 셋 다 `appMainCardChromeSurface` + `contentWithAppSidebarPanel` 사본 + `<AppGnb>`/`<Gnb>` 를 갖는 온전한 앱 셸 화면이다(영상 편집 프로젝트 워크스페이스 · 문의 · 숏폼 클립 편집). 표가 이미 인정한 `app/admin/AdminClient.tsx` 까지 포함하면 라우트 폴더 안의 셸이 4곳이므로 「라우트 폴더가 아니라 씬 파일을 본다」는 탐색 지침 자체가 틀렸다. 참고로 LOUIS `design/patterns/app-shell.md:184-190` 의 소비처 표는 이 3곳을 이미 담고 있다 — patterns.txt 쪽이 뒤처졌다.
- 근거: apps/web/app/videoeditor/[projectId]/EditorProjectWorkspace.tsx:91 · apps/web/app/inquiry/InquiryClient.tsx:114 · apps/web/app/highlight/[projectId]/shorts/[shortId]/page.tsx:81

### 형태 B 는 패널이 자체 `::before` 로 상·하 페이드를 함께 그린다 — 상단 높이는 `calc(72px * min(1, var(--header-progress, 0) * 1000))` 이라 스크롤이 0 을 벗어나는 순간 0 → 72px 로 즉시 켜진다 **[high]**

- **배포본**: CSS 선언 자체(myPageSceneStyles.ts:88-89, VideoEditScene.tsx:91-92)는 서술과 정확히 일치한다. 그러나 런타임 서술이 성립하지 않는다. (1) `--header-progress` 를 세우는 코드는 `useMainChromeHeaderScrollProgress` 뿐이고, 그 훅을 호출하는 씬은 AppHomeScene(:155) · NodeCanvasHomeScene(:644) · HighlightScene(:185) 셋뿐이다 — 앞의 둘은 형태 A 라 상단 페이드 자체가 없다. (2) 훅은 값을 `headerSlot` 과 `wrapper.closest("main")` 에만 set 하는데, 형태 B 에서 패널 div 는 그 `<main>` 의 **부모**다. CSS 커스텀 프로퍼티는 위로 상속되지 않으므로 패널의 `::before` 는 언제나 폴백 `0` 을 읽고 상단 페이드 높이가 0px 으로 고정된다. (3) HighlightProjectScene 은 `panelNoFade`(`[&::before]:[display:none]!`)를 덧붙여 상·하 페이드를 통째로 끈다. → origin/main 에서 형태 B 상단 72px 페이드가 실제로 켜지는 화면은 0개다.
- 근거: apps/web/components/scenes/useMainChromeHeaderScrollProgress.ts:39-48 · HighlightScene.tsx:178-189, 1166-1173 · highlightSceneStyles.ts:1175

### 적층 순서 도식: 메인 카드 안에 「헤더 슬롯(sticky)」과 「스크롤 뷰포트」가 형제로 있고 헤더 슬롯이 뷰포트보다 **앞**에 온다 (patterns.txt:2598-2605) **[high]**

- **배포본**: 헤더 슬롯은 스크롤 뷰포트의 **형제가 아니라 자손**이다. 형태 A: `<main>` → `div.archiveRailScrollViewport`(스크롤 루트) → `div.archiveRailScrollStack` → `div.mainChromeHeaderSlot`. 형태 B: 패널 div → `<main>`(스크롤 루트) → `div.appSidebarMainLenisContent` → 헤더 슬롯. 같은 절 2695행이 「슬롯이 스크롤 콘텐츠의 직계여야 sticky 가 먹는다」고 적어 스스로 이 도식을 반박한다. 도식대로 조립하면 슬롯이 스크롤 밖에 있어 sticky 가 의미를 잃는다.
- 근거: apps/web/components/scenes/AppHomeScene.tsx:835-855 · apps/web/components/scenes/ArchiveRailScrollShell.tsx:17-25 · apps/web/components/scenes/HighlightScene.tsx:1167-1175

### `--header-progress` 의 용도는 「워드마크 축소 등 헤더 collapse」이며, 스크롤 시 「120px 구간에 걸쳐 --header-progress 가 0 → 1 로 헤더가 collapse 한다」 (patterns.txt:2704, 2780) **[high]**

- **배포본**: 배포본에서 `var(--header-progress)` 를 읽는 곳은 **형태 B 패널의 `::before` 상단 페이드 높이 하나뿐**이다. 워드마크를 줄이거나 헤더를 collapse 하는 규칙은 origin/main 어디에도 없다. 상수 이름과 훅 JSDoc(`useMainChromeHeaderScrollProgress.ts:3`)이 그 의도를 말하지만 구현은 존재하지 않는다. 120px 램프 자체는 실재하나(같은 파일 :4, :30-33) 그 값이 헤더 collapse 를 구동하지는 않는다.
- 근거: apps/web/components/scenes/myPageSceneStyles.ts:88-89 · apps/web/components/scenes/VideoEditScene.tsx:91-92 · apps/web/app/inquiry/InquiryClient.tsx:108,111 (origin/main 전체 .ts/.tsx/.css 스캔 결과 소비처는 이 3파일뿐)

### `useMainChromeHeaderScrollProgress` 는 3개 씬만 호출한다 — 셸 전반에서 「12px 에서 구분선이 완전히 나타나고」 「형태 B 패널은 --header-progress 가 0 을 벗어나는 즉시 상단 72px 페이드를 켠다」는 서술이 화면 대 **[high]**

- **배포본**: 진행값을 주입하는 씬은 셋뿐이다. 나머지 8개 화면에서는 변수가 아예 set 되지 않으므로 CSS 폴백이 실동작이 된다 — Gnb.tsx:428,432 는 `var(--mainchrome-divider-progress, 1)` 이라 **구분선이 scrollTop 0 에서부터 100% 불투명하게 켜져 있고 페이드인이 없다**. 형태 B 의 72px 상단 페이드는 `var(--header-progress, 0)` 폴백 0 이므로 MyPage·설정·구독·영상편집에서는 **영구히 0px** 이다. 스크롤해도 켜지지 않는다.
- 근거: 호출: apps/web/components/scenes/AppHomeScene.tsx:155 · HighlightScene.tsx:185 · NodeCanvasHomeScene.tsx:644 — 미호출(헤더 슬롯·portal 은 있음): YoutubeAnalyticsScene.tsx:1927,2138 · InstagramAnalyticsScene.tsx:1866 · VideoEditScene.tsx:698,704 · SettingsScene.tsx:663,966 · SubscriptionScene.tsx:640,768 · ExploreScene.tsx:46,52 · HighlightProjectScene.tsx:2360,2391 · app/admin/AdminClient.tsx:1221,1233

### 「뷰포트 여백은 카드가 아니라 씬 루트가 만든다. 카드 자체 margin 은 네 방향 0 이다.」를 새 앱 페이지 공통 규칙으로 제시 (patterns.txt:2792, 2653) **[high]**

- **배포본**: 형태 B 에서는 카드(패널 div)가 **자기 margin 으로 좌·우 뷰포트 여백을 직접 만든다.** 씬 루트가 만드는 것은 상·하 패딩뿐(myPageSceneStyles.ts:561-562). 이 규칙은 형태 A 에만 참이며, 같은 절 2620행의 A/B 표가 이미 정확히 반대로 적고 있어 문서 안에서 충돌한다. 「놓치기 쉬운 것」 체크리스트에 무조건절로 실려 있어 형태 B 화면을 그릴 때 그대로 오적용된다.
- 근거: apps/web/components/scenes/myPageSceneStyles.ts:69-80 (`contentWithAppSidebarPanel`) — `[margin-left:var(--app-gnb-sidebar-width)]`(:72) · `[margin-right:var(--app-gnb-main-inline-padding-end)]`(:74) · margin-top/bottom 0(:73,:75)

### 모바일 드로어(≤719px)의 배경은 `var(--app-page-bg)` 다. **[medium]**

- **배포본**: 베이스 규칙(2006)은 `[@media(max-width:719px)]:[background:var(--app-page-bg)]` 이 맞지만, 뒤이어 2015 가 `[html[data-theme=light]_&]:[background:var(--palette-gray-200)]` 로, 2016 이 `[html[data-theme=dark]_&]:[background:var(--app-page-bg)]` 로 덮는다. 즉 `--app-page-bg` 를 실제로 쓰는 것은 다크뿐이고, 라이트 드로어는 `--palette-gray-200`(앱 셸 재매핑 후 #eeeef1)이다. 라이트 앱 셸에서 `--app-page-bg` 는 `--palette-gray-100`(#f8f8f9)이므로 두 값이 실제로 다르다 — 라이트 드로어를 #f8f8f9 로 그리면 틀린다. 같은 행의 나머지(폭 `min(280px, calc(100vw − 40px))` 2002, `z-index: 1400` 2001, `transform` 2007·2018, `transition: transform 320ms cubic-bezier(0.4,0,0.2,1)` 2008, `motion-reduce` 전환 없음 2017)는 전부 맞다.
- 근거: apps/web/components/navigation/Gnb.tsx:2006, 2015, 2016

### 라이트 앱 셸 회색 램프 재매핑 표에서 `--palette-gray-400` · `-500` · `-600` 의 '기본' 값은 없다(—). **[medium]**

- **배포본**: 셋 다 `:root` 에 기본값이 있다 — `--palette-gray-400: #bcc0c9`(31) · `--palette-gray-500: #9aa0ab`(32) · `--palette-gray-600: #777d89`(33). 앱 셸 값(#d5d7dd / #bcc0c9 / #9aa0ab, Gnb.tsx:1976-1978)은 '없던 토큰이 새로 생기는' 것이 아니라 기본 램프를 한 칸씩 밝은 쪽으로 민 결과다(앱셸 gray-400 = 기본 gray-300, 앱셸 gray-500 = 기본 gray-400, 앱셸 gray-600 = 기본 gray-500). 표의 위쪽 네 행(100/150/200/300 = #f1f1f3→#f8f8f9 · #eaebee→#f1f1f3 · #e3e4e8→#eeeef1 · #d5d7dd→#e4e5e9)은 globals.css:24·26·28·30 및 Gnb.tsx:1972-1975 와 정확히 일치한다.
- 근거: apps/web/app/globals.css:31, 32, 33

### 형태 A 씬 루트는 `height: var(--app-shell-vh, 100dvh)` · `max-height` 동일 (patterns.txt:2727) **[medium]**

- **배포본**: 형태 A 5개 소비처 중 두 분석 씬은 `--app-shell-vh` 를 **읽지 않고** 맨 `100dvh` 를 쓴다. 즉 iOS Safari 보정이 분석 대시보드에는 걸리지 않는다. 「형태 A = app-shell-vh」로 일반화하면 배포본과 어긋난다.
- 근거: 참: AppHomeScene(appHomeSceneStyles.ts:904-905) · NodeCanvasHomeScene.tsx:101 · AdminClient.tsx:40 — 거짓: YoutubeAnalyticsScene.tsx:747 `h-[100dvh] max-h-[100dvh]` · InstagramAnalyticsScene.tsx:282 동일

### 「카드의 `overflow: hidden!` 은 중요 선언이다」 (patterns.txt:2793) **[medium]**

- **배포본**: 메커니즘 설명(레이어 밖 전역이 `@layer utilities` 를 특이도와 무관하게 이긴다)은 정확하고 제품 주석도 같은 말을 한다(NodeCanvasHomeScene.tsx:132-134, YoutubeAnalyticsScene.tsx:781-782). 그러나 **AppHomeScene 만 `!` 가 빠져 있다.** 결과적으로 ≤719px 에서 globals.css:1462-1466 의 `overflow: visible` 이 AppHomeScene 카드에서는 이기고 나머지 넷에서는 진다 — 같은 형태 A 안에서 모바일 클리핑 동작이 갈린다.
- 근거: 참(`overflow-hidden!`): NodeCanvasHomeScene.tsx:135 · YoutubeAnalyticsScene.tsx:783 · InstagramAnalyticsScene.tsx:310 · AdminClient.tsx:77 — 거짓: apps/web/components/scenes/appHomeSceneStyles.ts:781 `"[&.tw-ah-067:not(.tw-ah-066)]:[overflow:hidden]"` (`!` 없음)

### 「`useMainChromeHeaderScrollProgress` 가 rAF 로 스크롤 뷰포트를 읽어 **두 CSS 변수를** 헤더 슬롯(및 상위 `<main>`)에 직접 set 한다」 (patterns.txt:2700) **[medium]**

- **배포본**: 헤더 슬롯에는 두 변수(`--header-progress`, `--mainchrome-divider-progress`)를 set 하지만, `wrapper.closest("main")` 에는 **`--header-progress` 하나만** set 한다(:45-48). 「두 변수를 양쪽에」로 읽으면 틀리다. 나머지 서술(rAF · DOM style 직접 변경 · React 렌더 없음)은 :22-54 그대로 맞다.
- 근거: apps/web/components/scenes/useMainChromeHeaderScrollProgress.ts:39-48

### 모바일 드로어 배경은 `var(--app-page-bg)` 다 **[medium]**

- **배포본**: 베이스 `[@media(max-width:719px)]:[background:var(--app-page-bg)]` 뒤에 테마 스코프 두 줄이 더 있다 — 라이트는 `[html[data-theme=light]_&]:[background:var(--palette-gray-200)]`(Gnb.tsx:2015), 다크만 `var(--app-page-bg)`(2016). 라이트 앱 셸에서 `--palette-gray-200`은 #eeeef1 로, `--app-page-bg`(= --palette-gray-100 = #f8f8f9)와 값이 다르다. 즉 라이트 드로어 면색은 #eeeef1 이고, patterns 대로 그리면 한 단계 밝은 면을 칠하게 된다. 다크에서만 서술이 맞다.
- 근거: /Users/sejunki/klipse-web/apps/web/components/navigation/Gnb.tsx:2006(베이스) vs 2015-2016(테마 스코프 오버라이드)

### `useMainChromeHeaderScrollProgress` 가 rAF 로 두 CSS 변수를 헤더 슬롯(및 상위 `<main>`)에 직접 set 한다 **[low]**

- **배포본**: 헤더 슬롯에는 두 변수를 다 set 하지만 상위 `<main>` 에는 `--header-progress` 하나만 set 한다 — `panel.style.setProperty("--header-progress", ...)` 뿐이고 `--mainchrome-divider-progress` 는 넘기지 않는다. 산식·상수는 정확하다: `HEADER_COLLAPSE_SCROLL_PX = 120`, divider 는 `scrollTop <= 0 ? 0 : min(1, scrollTop / 12)`, rAF 루프이고 React 렌더는 없다. 이 차이 때문에 형태 B 패널의 상단 72px 페이드(`--header-progress` 를 `<main>` 에서 읽는다)는 동작하고, 구분선은 슬롯 안에서만 계산된다.
- 근거: /Users/sejunki/klipse-web/apps/web/components/scenes/useMainChromeHeaderScrollProgress.ts:37-47

### 형태 A `<main>` 은 720–780px 구간에서 하단에 160px 의 죽은 여백을 갖는다 **[low]**

- **배포본**: 씬마다 다르고, 최소한 NodeCanvasHomeScene 에서는 720px 아래에서도 160px 이 남는다. 그쪽 `MAIN_WITH_APP_SIDEBAR` 는 베이스 `pb-0` 위에 `[@media(max-width:780px)]:pb-[160px]`(:127) 만 얹고 ≤719px 에는 `pr-` 만 덮으므로(:128) 하단 패딩을 되돌리는 규칙이 아예 없다 — 파일 주석도 「모바일 하단 패딩은 0 이 아니라 160px 이다」라고 그 승자를 명시한다(:119-122). appHomeSceneStyles 쪽은 `main` 의 `[@media(max-width:780px)]:[padding-bottom:160px]!`(:783)과 `mainWithAppSidebar` 의 `[@media(max-width:719px)]:[padding:0_…_0_…]!`(:810)이 둘 다 중요 선언이라 승자가 생성 CSS 의 미디어 블록 정렬 순서에 달려 있고, 빌드 산출물 없이는 확정 못 한다(그 한 씬에 한해 UNVERIFIABLE). 어느 쪽이든 「720–780px 구간에 한정」이라는 서술은 배포본을 좁게 잡은 것이다.
- 근거: /Users/sejunki/klipse-web/apps/web/components/scenes/NodeCanvasHomeScene.tsx:123-128 vs appHomeSceneStyles.ts:770-785 · 799-812


## §6.14 — 6건

### 타이틀이 `type-heading-36-*` 유틸리티를 안 쓰므로 「font-family·feature-settings 는 붙지 않는다」 **[medium]**

- **문서**: 빠지는 것은 font-family 와 feature-settings 두 가지
- **배포본**: letter-spacing 도 빠진다. `.type-heading-36-medium` 은 font-family·font-feature-settings 에 더해 `letter-spacing: var(--type-heading-36-letter-spacing)` 를 주고 그 토큰은 `-0.02em` 이다. STATUS_TITLE 은 font-size·line-height·font-weight 만 임의 프로퍼티로 집어 자간이 normal 로 렌더된다(36px 기준 글자당 약 0.72px 차이)
- 근거: apps/web/app/globals.css:1026-1049 그룹 셀렉터(`.type-heading-48-regular` … `.type-caption-12-semibold`, 그 안에 `.type-heading-36-medium` 포함)가 font-family·font-feature-settings 를 주고, 개별 룰 globals.css:1079-1084 `.type-heading-36-medium { font-size; line-height; letter-spacing: var(--type-heading-36-letter-spacing); font-weight }` 로 letter-spacing 도 준다. 토큰은 globals.css:356 `--type-heading-36-letter-spacing

### PAGE_SHELL 의 패딩은 `padding-top: var(--app-gnb-safe-top)` · `padding-bottom: var(--app-gnb-rail-padding-bottom)` 이다 **[medium]**

- **문서**: 부품별 치수 표의 PAGE_SHELL 칸에 세로 패딩이 이 두 변수뿐이고, ≤719px 변화는 「하단 레일 패딩이 0 이 되어」라고 토큰 탓으로 적혀 있다
- **배포본**: ≤719px 에서 `pt-0` · `pb-0` 유틸리티가 명시적으로 두 패딩을 0 으로 덮는다. 하단은 토큰도 0 이 되지만 상단 `--app-gnb-safe-top` 은 ≤719px 에서도 `max(12px, env(...))` 로 남으므로, 상단이 0 이 되는 이유는 토큰이 아니라 이 유틸리티다
- 근거: apps/web/app/mypage/upgrade/billing-success/page.tsx 의 PAGE_SHELL 은 34-44행이고 세로 패딩 선언이 두 줄이다 — :41 `"pt-[var(--app-gnb-safe-top)] pb-[var(--app-gnb-rail-padding-bottom)]"` 와 :42 `"[@media(max-width:719px)]:pt-0 [@media(max-width:719px)]:pb-0"`. 문서의 부품별 치수 표(PAGE_SHELL 칸)는 :42 를 통째로 빠뜨렸다. 또 ≤719px 행이 「하단 레일 패딩이 0 이 되어 … 세로 패딩을 잃고」로 토큰 탓을 하는데, apps/web/app/globals.css:413 `@media (max-width: 719px) 

### 공유 컴포넌트가 없고 「공유 import 는 Gnb · useI18n · copy.ts 뿐」이다 **[low]**

- **문서**: 7개 파일이 import 하는 공유 모듈은 Gnb, useI18n, copy.ts 셋뿐이다
- **배포본**: 비동기 3개 라우트는 useAuth(AuthProvider)와 gaEvent(@/lib/gtag)를 더 import 하고, topup/success 와 billing-success 는 @sentry/nextjs 까지 import 한다. billing-change-success 는 useAuth 를 import 한다. 즉 공유 import 는 최대 6종이다
- 근거: patterns.txt:2823 「공유 import 는 `Gnb` · `useI18n` · `copy.ts` 뿐」. 실제로 동기 fail 4종(upgrade/fail, upgrade/billing-fail, topup/fail, upgrade/billing-change-fail)은 :6 Gnb, :7 useI18n 뿐이지만 비동기 3종은 더 많다. apps/web/app/mypage/upgrade/billing-success/page.tsx:6 Gnb / :7 `import { useAuth } from "@/components/auth/AuthProvider"` / :8 useI18n / :9 `import { gaEvent } from "@/lib/gtag"` / :10 `../copy` / :11 `i

### `css-modules-baseline.json` 에는 `hl-*` 5개만 남아 있다 **[low]**

- **문서**: 래칫 목록에 highlight 계열 모듈 5개가 남아 있다
- **배포본**: `files` 배열이 완전히 비어 있다(`"files": []`). 남은 CSS 모듈이 0개다. 파일 경로도 apps/web/ 이 아니라 apps/web/scripts/ 다
- 근거: `git ls-tree -r --name-only origin/main | grep css-modules-baseline` 결과는 `apps/web/scripts/css-modules-baseline.json` 단 하나(리포 루트 `scripts/…` 는 존재하지 않음). 그 파일 전문은 4줄이고 :3 이 `"files": []` 다 — 남은 CSS 모듈 0개, `hl-` 문자열 0건. patterns.txt:2949 의 「`css-modules-baseline.json` 에는 `hl-*` 5개만 남아 있다」는 틀렸다. 참고로 이미 확정된 사실(`.module.css` 0개)과도 일치한다. 좌표 문제가 아니라 내용이 틀린 것이므로 STALE_CITATION_ONLY 아님.

### `getSubscriptionErrorMessage` 는 28-case switch 다 **[low]**

- **문서**: 28-case switch
- **배포본**: `case` 절은 27개다(switch 는 18행, 첫 case 19행, 마지막 case "UNKNOWN_ERROR" 71행). default 를 세도 28이 되려면 default 를 case 로 세야 한다
- 근거: apps/web/app/mypage/upgrade/copy.ts:13 `export function getSubscriptionErrorMessage`, :18 `switch (code) {`. case 절은 :19 "MISSING_TOSS_CLIENT_KEY" 부터 :71 "UNKNOWN_ERROR" 까지 2행 간격 — 직접 나열해 세어보면 MISSING_TOSS_CLIENT_KEY, MISSING_PAYMENT_PARAMS, MISSING_BILLING_PARAMS, CONFIRM_PAYMENT_FAILED, BILLING_SUBSCRIBE_FAILED, BILLING_CHANGE_METHOD_FAILED, TOPUP_PACK_NOT_FOUND, TOPUP_CONFIRM_FAILED, TOPUP_CLAI

### 정적 실패 4종의 `?code` 기본값은 리터럴 `"UNKNOWN_ERROR"` 다 **[low]**

- **문서**: 리터럴 "UNKNOWN_ERROR"
- **배포본**: 리터럴이 아니라 i18n 키다 — `searchParams.get("code")?.trim() ?? failCopy.unknownErrorCode`. 값이 en/ko/ja 모두 "UNKNOWN_ERROR" 라 화면상 결과는 같지만, 같은 절이 진짜 리터럴로 지목한 `"-"` · `"Pack"` · `"Card"` · `"Status"` 와 성격이 다르다(로케일 파일을 고치면 바뀐다)
- 근거: 정적 실패 4종 모두 리터럴이 아니라 i18n 참조다. apps/web/app/mypage/upgrade/fail/page.tsx:135 `const failCopy = messages.subscription.upgradeFail;` / :138 `const code = searchParams.get("code")?.trim() ?? failCopy.unknownErrorCode;`. billing-fail/page.tsx 도 :135/:138 로 동일, topup/fail/page.tsx :122/:126, billing-change-fail/page.tsx :123/:126. 값은 apps/web/components/landing/system/messages/en.ts:4045 `unknownErrorC


## §6.15 — 6건

### 제출 버튼은 `rounded-12` 다 (부품별 치수 표의 '제출 버튼' 행) **[medium]**

- **문서**: 제출 버튼 | `w-full` · `h-24` = 48px 고정 · `mt-4`(8px) · `border: 0` · `rounded-12`
- **배포본**: `/recover` 의 제출 버튼만 `rounded-[999px]` (완전 알약)이다. login·signup·reset-password/new 는 rounded-12 로 맞다. 다섯 화면이 한 값을 공유한다고 읽으면 /recover 를 잘못 그린다.
- 근거: apps/web/app/recover/page.tsx:102-107 `const SUBMIT_BUTTON = ["type-body-16-medium", "w-full h-24 mt-4 [border:0] rounded-[999px]", "bg-gray-000 text-gray-1000", "[transition:transform_180ms_ease,filter_180ms_ease]"].join(" ")` — :104 가 `rounded-[999px]` 다. 죽은 상수가 아니라 :371-372 에서 실제 submit 버튼에 쓰인다. 대조군은 문서와 일치: login/page.tsx:207 `"w-full h-24 mt-4 [border:0] rounded-12"`, signup/page.tsx:211 `"… 

### 입력 우측 패딩은 두 값뿐이다 — 지우기만 `pr-19`(38px), 지우기+표시가 함께면 `pr-34`(68px) **[medium]**

- **문서**: 입력 우측 패딩이 그만큼 넓어진다 — 지우기만 있으면 `pr-19` = 38px, 지우기 + 표시가 함께 가능하면 `pr-34` = 68px
- **배포본**: 세 번째 값이 있다. 표시 토글만 있는 화면(`/signup`·`/reset-password/new`)은 `pr-20` = **40px** 이다. `pr-34`(68px)는 지우기+표시가 둘 다 붙는 `/login`·`/recover` 에서만 쓰인다.
- 근거: 세 번째 값이 실재한다. `--spacing: 2px` 는 apps/web/app/tailwind.css:164 에서 확인(주석 160-163 이 2px 격자 근거를 설명). 표시 토글만 있는 화면: apps/web/app/signup/page.tsx:117 `const INPUT_WITH_TOGGLE = "pr-20"` (사용처 504, 564), apps/web/app/reset-password/new/page.tsx:45 동일(사용처 197, 257), apps/web/app/aws/signup/page.tsx:170 도 `pr-20`. 지우기+표시가 함께인 화면만 pr-34: apps/web/app/login/page.tsx:139-140 (`INPUT_WITH_CLEAR="pr-19"`, `INPU

### 이 저장소의 `light:` 변형은 앱 테마가 아니라 랜딩 워크스루 스코프다 **[medium]**

- **문서**: `html[data-theme="light"]` 후손 규칙을 쓰고 `light:` 변형을 쓰지 않는다 — 이 저장소의 `light:`/`walkthrough-light:` 는 앱 테마가 아니라 랜딩 워크스루 스코프다
- **배포본**: `@custom-variant light` 는 `html[data-theme="light"]:not(:has([data-landing-walkthrough-dark]))` **또는** `[data-landing-walkthrough-light]` 를 매칭한다 — 앱 테마를 정확히 포함하며 문서 단위 킬스위치가 붙었을 뿐이다. 워크스루 전용인 것은 `walkthrough-light:`/`walkthrough-dark:` 두 개다. (인증 화면이 후손 규칙을 쓴다는 앞 절반은 맞다.)
- 근거: apps/web/app/tailwind.css:252 실물: `@custom-variant light (&:where(:is(html[data-theme="light"]:not(:has([data-landing-walkthrough-dark])), [data-landing-walkthrough-light]) *, :is(...)))`. 첫 분기가 `html[data-theme="light"]` 로 앱 문서 테마를 정면 매칭하며, `:not(:has(...))` 는 240-251 주석이 직접 "라이트 킬스위치"라고 설명하는 문서 단위 스위치일 뿐이다. 워크스루 전용은 251/254 주석 뒤의 261-262 `walkthrough-light`/`walkthrough-dark` 두 개다. 실사용도 앱 화면이다 —

### 체크박스의 2px 외곽 헤일로가 인증 화면 전체에서 유일하게 보이는 키보드 포커스 표시다 **[medium]**

- **문서**: **이 2px 외곽 헤일로가 인증 화면 전체에서 유일하게 보이는 키보드 포커스 표시다.** `box-shadow` 라서 레이어 밖 `outline: none` 리셋이 건드리지 못하기 때문에 살아남았다
- **배포본**: 레이어 밖 리셋의 선택자는 `button` 과 `input[type=button|submit|reset]` 뿐이고 `a` 는 포함되지 않는다. 저장소 어디에도 `a` 를 덮는 outline 리셋이 없으므로 `/login` 의 하단 링크·`/signup` 의 SWITCH_LINK·상태 카드 SECONDARY(`<Link href="/login">`)는 브라우저 기본 `:focus-visible` 아웃라인을 그대로 유지한다.
- 근거: apps/web/app/globals.css 에서 `outline` 은 991(레이어 안)과 1004(레이어 밖) 단 두 곳뿐이고, 두 규칙 모두 선택자가 `button, input[type="button"|"submit"|"reset"]`(+ :focus/:focus-visible/:active) 이다. 1007-1010 의 `a` 규칙은 `color: inherit; text-decoration: none` 뿐. origin/main 의 모든 .css 를 훑었을 때 `outline` 을 담은 파일은 globals.css 하나(다른 .css 0건)라 `a` 를 덮는 리셋이 저장소에 없다. 인증 화면 링크에도 outline-none 이 없다 — login/page.tsx:260-264 BOTTOM_LINK(

### 체크박스 호버는 `input:hover:not(:focus-visible)` 로 걸려 포커스가 호버를 이긴다 **[low]**

- **문서**: 호버는 `input:hover:not(:focus-visible)` 로 걸려 **포커스가 호버를 이긴다.**
- **배포본**: `:not(:focus-visible)` 가드는 **테두리 색에만** 붙었다. 면(배경) 호버는 `[input:hover+&]` 로 가드 없이 걸려 `:focus-visible` 중에도 `/9%` 로 켜진다. 즉 포커스가 이기는 축은 테두리 하나뿐이고, 포커스+호버 동시 상태는 테두리 62% + 면 9% 다.
- 근거: apps/web/app/signup/page.tsx LEGAL_CHECKBOX_FACE_UNCHECKED(185-193) 실물: L188 `[input:hover:not(:focus-visible)+&]:border-[rgb(var(--gray-000-rgb)/44%)]!` (가드 있음), L189 `[input:hover+&]:bg-[rgb(var(--gray-000-rgb)/9%)]!` (가드 **없음**), L190 focus-visible 테두리 62%, L191 focus-visible box-shadow. 즉 `:not(:focus-visible)` 는 테두리 축 한 줄에만 붙었고 면(배경) 호버는 포커스 중에도 9% 로 켜진다. patterns.txt:3080 의 "호버는 input:hover:

### 부동 라벨 `<span>` 이 입력 바로 뒤, 트레일링 버튼 앞에 온다 (적층 순서 다이어그램) **[low]**

- **문서**: div (INPUT_BOX) ├─ input ├─ span (FLOATING_LABEL) ├─ button (비밀번호 표시) └─ button (× 지우기)
- **배포본**: 실제 DOM 순서는 input → button(× 지우기) → button(표시) → span(FLOATING_LABEL) 로, 라벨이 **마지막**이다. 같은 스택 문맥에서 라벨이 버튼 위에 그려진다(라벨은 `pointer-events-none` 이라 히트는 안 뺏지만 페인트 순서가 다이어그램과 반대다).
- 근거: patterns.txt:2970-2977 다이어그램은 input → span(FLOATING_LABEL) → button(표시) → button(지우기) 순이다. 실제 apps/web/app/login/page.tsx: INPUT_BOX div 489 → input 500 → button(aria-label "Clear password") 519 → button(표시/숨김) 542 → span FLOATING_LABEL 565 → </div> 578. 라벨이 **마지막**이다. apps/web/app/signup/page.tsx 도 라벨이 마지막이나 순서는 input 501 → button(토글) 521 → span 539, 확인 필드는 input 561 → button 582 → span 604 로 지우기


## §6.16 — 6건

### 토스트에는 role="status"/aria-live 가 하나도 없다 — 시머 로딩 단어만 갖고 있고, 접근성을 다룬다면 토스트가 그 격차다 **[medium]**

- **문서**: 9개 토스트 렌더 자리 전부에 라이브 리전 속성이 없다
- **배포본**: 에디터 워크스페이스의 글래스 토스트는 role="status" + aria-live="polite" 를 갖는다. 나머지 8곳(NodeCanvasHomeScene:1685, CreateScene:997, VideoEditScene:965, AppHomeScene:1419, SettingsScene:1958, SubscriptionScene:1473 등)에는 없다 — '하나도 없다'가 아니라 '9곳 중 1곳만 있다'
- 근거: apps/web/app/videoeditor/[projectId]/EditorProjectWorkspace.tsx:1281-1288 — `{toast ? (<div className={`${TOAST} …`} role="status" aria-live="polite">` (1284-1285). 같은 파일 1105-1112 의 포털 오류 토스트는 `role="alert"` + `aria-live="assertive"` (1109-1110). apps/web/components/scenes/create/node-canvas-v2/nodes/VideoEditModal.tsx:14152 `<div className={VEM_CLASS.editorToast} role="status">`. 즉 라이브 리전을 가진 토스

### `--skeleton-*` 스코프는 4개 셸에서 동일하게 공급된다 **[medium]**

- **문서**: 8개 --skeleton-* 토큰을 동일하게 공급하는 셸이 4개
- **배포본**: 8종 전부를 공급하는 곳은 3개다 — StaticAnalyticsDemo.tsx:69-76, InstagramAnalyticsScene.tsx:210-217, YoutubeAnalyticsScene.tsx:669-676. (YoutubeVideoAnalyticsView.tsx:172-175 와 NodeCanvasAnalysisModal.tsx:157-160 은 lo/hi 2종만 공급하고 라이트 분기 값도 3%/7% 로 다르다.) 값 8종 자체는 문서와 전부 일치
- 근거: origin/main 에서 `--skeleton-` 선언을 가진 파일은 5개다. 8종 전량을 공급하는 셸은 3개뿐: components/landing/demo-snapshots/StaticAnalyticsDemo.tsx:69-76, components/scenes/InstagramAnalyticsScene.tsx:210-217, components/scenes/YoutubeAnalyticsScene.tsx:669-676 — 세 곳 모두 lo 6%·hi 12%·surface 5%·dot 9%·grad-top 8%·grad-bot 3%·wave-peak 10%·border 6% 로 완전 일치(문서 값 8종은 정확). 나머지 두 곳은 lo/hi 2종만 공급하고 라이트 분기까지 달리 준다: components/sc

### 빈 상태(리스트 페이지): 간격 12px · 패딩 80px 0 · 제목 h2 type-body-20-semibold · 본문 rgb(--gray-000-rgb)/55% **[medium]**

- **문서**: 리스트 페이지 빈 상태의 정본 값 (상태 표에서도 '로딩 완료, 항목 0 (리스트)' 행으로 일반화)
- **배포본**: 같은 절이 원천 파일로 든 VideoEditScene 의 빈 상태는 `flex flex-col items-center justify-center gap-8 py-32 px-0` = 간격 16px · 패딩 64px 0 이고, 제목 h2 가 아예 없으며(본문 p 하나 + Button), 본문 색이 시맨틱 55% 가 아니라 고정 `--palette-gray-500` 이고 강제 다크 임베드 분기도 없다. 12px/80px/제목/55% 는 AppHomeScene(appHomeSceneStyles.ts:697-713)과 NodeCanvasHomeScene(:167-181) 두 화면에만 맞다
- 근거: 인용 좌표 정확. apps/web/components/scenes/VideoEditScene.tsx:187-188 `const EMPTY_STATE = "flex flex-col items-center justify-center gap-8 py-32 px-0";`, :190 `const EMPTY_TEXT = "text-[var(--palette-gray-500)] m-0";`. JSX :721-733 은 `<div className={EMPTY_STATE}>` 안에 `<p className={`type-body-16-regular ${EMPTY_TEXT}`}>` 하나 + `<Button variant="primary" size="sm" leftIcon={<PlusIcon size={14}/>}>` 뿐 — 

### 글래스 토스트 글자는 `type-body-16-regular` **[medium]**

- **문서**: A. 글래스 열 전체가 type-body-16-regular
- **배포본**: 글래스 6곳 중 5곳은 type-body-16-regular 가 맞지만, 에디터 워크스페이스의 글래스 토스트는 `type-body-14-regular` 다
- 근거: 인용 좌표 정확. apps/web/app/videoeditor/[projectId]/EditorProjectWorkspace.tsx:1287 `<span className={`type-body-14-regular ${TOAST_TEXT}`}>{toast}</span>`. 그 컨테이너 TOAST(:229-240)는 `[backdrop-filter:blur(10px)]` + `var(--glass-bevel-highlight)`/`var(--glass-bevel-shade)` + `[html[data-theme=light]_&]:bg-[rgb(var(--palette-gray-800-rgb)/70%)]` / dark `--palette-gray-200-rgb/70%` 로 문서가 말하는 A 열 글래스 토스트 그 

### 글래스 토스트 박스 = `inline-flex items-center gap-6 py-6 px-10 rounded-16` **[medium]**

- **문서**: 글래스 토스트 6곳의 박스 값
- **배포본**: inline-flex/items-center/gap-6 는 CreateScene.tsx:171 · VideoEditScene.tsx:439 · EditorProjectWorkspace.tsx:232 세 곳에만 있다. NodeCanvasHomeScene.tsx:493 은 `py-6 px-10 rounded-16` 만, appHomeSceneStyles.ts:936-950 과 highlightSceneStyles.ts:2213-2227 도 display/gap 선언이 없다. 패딩 12/20px 과 곡률 16px 은 6곳 전부 일치
- 근거: 인용 좌표 정확. NodeCanvasHomeScene.tsx:491-497 TOAST_BASE = [`fixed bottom-16 left-1/2 [transform:translateX(-50%)] z-[1300]`, `py-6 px-10 rounded-16`, box-shadow, 라이트/다크 background] — 블록 전체에 inline-flex/items-center/gap 0건. appHomeSceneStyles.ts toast(936-950)는 position/bottom/left/transform/z-index/`[padding:12px_20px]`/`[border-radius:16px]`/backdrop-filter/box-shadow/animation/테마 background 만 있고 di

### 감소 모션 대응은 시스템 전반의 동작이 아니다. 8개 토스트 중 2개, 스켈레톤은 0개만 대응한다 **[low]**

- **문서**: 토스트 8개 중 2개가 prefers-reduced-motion 에 대응
- **배포본**: 토스트 표면은 같은 절의 표대로 6(글래스)+2(솔리드)+1(에디터 오류)=9곳이고, prefers-reduced-motion:reduce 에서 animate-none! 을 거는 것은 에디터 오류 토스트 1곳뿐이다. 같은 절의 앞 문단('C만 유일하게')과도 어긋난다. 스켈레톤 0개는 맞다(shared.tsx:163-167 에 감소 모션 분기 없음)
- 근거: origin/main 의 .ts/.tsx 전체에서 이름에 toast 가 든 클래스 상수 블록을 열거해 감소 모션 분기를 검사한 결과, 분기가 있는 토스트 상수는 단 하나다 — apps/web/app/videoeditor/[projectId]/EditorProjectWorkspace.tsx:150-158 ERROR_TOAST 의 :157 `[@media(prefers-reduced-motion:reduce)]:animate-none!`. '2개'의 다른 한 줄로 오인됐을 같은 파일 :146 은 LOADING_WORD(138-147, archiveLoadingSweep 시머)로 토스트가 아니다. 나머지 토스트 상수는 전부 무대응: EditorProjectWorkspace TOAST(230)/TOAST_TEXT(


---

**만드는 방법.** 각 절을 배포본과 대조하고, 지적마다 「문서가 맞나 지적이 맞나」를 다시 물어
확인했다. 초기 판정 중 75건은 질문이 모호해 분류가 뒤집혀 있었고, 재판정에서 65건이
「문서가 틀렸다」로 확정됐다. 이 문서에는 **재판정을 거친 것만** 담았다.

**LOUIS(`~/klipse-design-system`)와의 관계.** 같은 감사에서 「LOUIS에 없다」고 지목된 141건도
판정했는데, 실제 결손은 80건이고 **25건은 이미 LOUIS에 있었다.** 지목한 쪽이 `design/`만 보고
`migration/`을 안 봤기 때문이다. 그리고 §6.13에서는 **LOUIS가 번들보다 앞선 사례**가 나왔다 —
형태 B 씬 소비처를 LOUIS `patterns/app-shell.md`가 3곳 더 갖고 있다. **이관은 한 방향이 아니다.**
