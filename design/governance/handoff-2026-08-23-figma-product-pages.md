---
id: handoff-figma-product-pages
status: beta
authority: reference
---

# 인계서 — 제품 전 페이지 Figma 이식과 디자인 시스템 추출 (2026-08-23)

이 문서는 현재 Codex 작업이 사용 한도나 세션 종료로 끊길 때 다른 에이전트가 같은 근거에서 바로
이어가기 위한 살아 있는 인계서다. 대화 요약을 정본으로 삼지 않는다. 진행할 때마다 이 문서의
`완료`, `진행 중`, `다음 순서`, `검증`을 갱신한다.

> **2026-09-28 — 이 문서의 체크포인트는 2026-09-15 에서 멈춰 있다.** 그 뒤 진행(09-22 앵커 `2c6bdacf` 라이브 적용 (155) ·
> 09-26 「Figma 먼저, 생성기로 묶어서」 (162)~(166) · 09-28 사이드바 셸 간격 (167))은 [Updates](../updates/README.md) 가 갖는다.
> 아래 「다음 순서」의 1(세트 → 보드 적용) · 2(업그레이드 카드 다섯 요금제) · 5(`ProgressRing` 마스터)는 (155) 까지 끝났다.
>
> **최근 체크포인트는 아래 「현재 체크포인트」의 2026-09-15(앵커 `2c6bdacf`) 절이다.** 이 인용 블록은 2026-08-24 기록이다.
>
> 2026-08-24. mobile Upgrade와 profile 링에 이어 public `/pricing` 전체 페이지를
> 883개 측정 subtree와 실제 텍스트 줄 조각에서 생성했다. `get_goal`은 여전히
> `usageLimited`와 `remainingTokens:null`만 반환해 주간 잔여율을 수치로 확인할 수 없다. 따라서 이 문서는
> 특정 리셋 시각을 정본으로 삼지 않고, 매 checkpoint의 실제 완료물·검증·다음 순서만 인계한다.

## 현재 체크포인트

> **2026-09-15(뒤) — 앵커를 `2c6bdacf` 로 옮겼다. 라이브에는 쓰지 않았다.** 제품이 펼친 사이드바를 240 으로 줄이고(`bc3e6fa3`, 모바일
> 서랍은 블러 표면) 「분석」 아이브로우를 걷었다(`2c6bdacf`). 소유자 결정대로 옛 앵커 계획은 적용하지 않고 새 계획으로 세트 · 보드를 한 번만
> 적용한다 — 아래 2026-09-15 절의 「적용한 러너 넷」 뒤 라이브 상태는 그대로다. 저장소 변경과 계획 차이는 [Updates](../updates/README.md)
> (138): 사이드바 부품 펼친 폭을 채움 규칙으로(기록 256 → `$width`, parity `fillIn`), 사이드바 매처를 폭 선언으로, 레일 표본 은퇴, 후보 서명
> 이동, 컴포넌트 러너의 아이브로우 행 `retired/` · 메뉴 · CTA 크기 맞춤. **옛 앵커 계획 대비 보드 36 은 같음 18(모바일) · 다름 18(데스크톱)** 이고,
> 「다음 순서」 1번 5단계의 (가) 컴포넌트 러너 재적용에 두 변화가 더해진다 — 메뉴 variant 여섯의 `section/Analytics` 행이 `retired/` 로 숨고,
> 메뉴 · 행 · CTA variant 폭이 레일 내용 폭(216)으로, 셸 variant 가 레일 폭(240)으로 준다. 사이드바를 인스턴스로 쓰는 소비처(데스크톱 보드 ·
> 결제 장면 · 손 조립 허브)의 사이드바가 함께 좁아지고 옆 본문은 보드 러너가 넓힌다.
>
> **앵커 검토 뒤(같은 날, (138) 「앵커 검토 뒤」).** parity 채움 칸이 사이드바 표본 폭을 건너뛰지 않고 DS 레일 내용 폭(레일 폭 토큰 −
> 레일 패딩 토큰 × 2)과 맞대며 `SidebarNavRow` 폭 사본도 규칙이 됐다. `figma/templates.measured.json` 은 레일 · 서랍 폭 240 과
> `NavEyebrow` 제거로 옮기고 본문 · 컨테이너 · 카드 폭을 규칙으로 바꿨다 — **parity 가 template 열로 빨갛다**(전과 같은 일곱 + 열).
> 그래서 「다음 순서」 1번 세트 단계에 **DS · Templates** 가 더해진다: `Pattern · AppShell`(`982:175`) Expanded 레일 240 · 본문 폭 ·
> Compact 서랍 240, `Template · AppHome`(레일 240 · 카드 286 · 오버레이 비율 · `NavEyebrow` 숨김), `Pattern · ProjectGrid`(`991:252`) 4열
> 컨테이너 1156 · 카드 286. 토큰 `layout-app-shell-sidebar-width` 를 240 으로 옮기면 DS · Components `SidebarBrand` · `SidebarCta`
> `Collapsed=false` · `SidebarNavRow` 폭 216 도 더해진다. template 되읽기를 뜨는 스크립트는 아직 없다(`templates` 블록은 손으로 떴다) —
> **(141) 이 `figma-readback-emit --templates` 로 세웠고, 명세는 2026-09-22 (150) 에 라이브로 검증했다**(세트 적용 뒤 이것으로 다시 뜬다).
> 본문 끝 여백 · 레일 위 패딩 · 링(제품 8, `094c336b`) · compact 인셋(제품 6, `b23ac6ef`)은 DS 토큰 판정 대기로 기록을 두었다
> (`$pending`, parity 가 매 실행 인쇄).

> **2026-09-15 — 세트 러너 넷을 라이브에 적용했고, sidebar-states 사전 점검에서 멈춰 러너 · 판정기를 고쳤다.** 앞의 것은 라이브
> 쓰기(HEAD `c156bae` 포장본), 뒤의 것은 저장소 변경이다(라이브에 쓰지 않았다 — 읽기 전용 탐침만). 적용 기록은 저장소 밖 작업 메모에
> 있어 인계에 필요한 사실을 옮긴다.
>
> - **적용한 러너 넷(각 1회, 던짐 0).** 컴포넌트(`alreadyExisted` · 보이는 페인트 820 = 묶임 800 + BETA 13 + 로고 7, variant id 전부 보존,
>   메뉴 세트 `384:215` · 셸 `392:611` · 결제 · 체크아웃 · 업그레이드 장면의 보이는 `add-action` 0 — `retired/` 로 숨음) → 체크아웃 ·
>   결제 장면(바 12 `topBarTextChanges` 전부 빈 배열, 폭 FIXED → FILL 만) → 업그레이드(카드 세트 `417:2213` 에 `Lite` · `Plus` · `Ultra`,
>   보이는 조각 `422:2567` 에 `Lite` 가 더해지고 `Basic` · `Max` 는 보존). 소비처 대조는 매 단계 크기 축(sizing)만 달라졌다.
>   업그레이드 응답은 `mutatedNodeIds` 에서 20KB 로 잘렸다(앞 필드는 온전) — 아래에서 고쳤다.
> - **멈춘 곳 — sidebar-states.** 계획 install 의 옛 레일 · 옛 헤더 · breadcrumb · 액션 · 프로필 원본 id(`39:4` · `39:11` · `39:12` · `39:13` ·
>   `75:525` · `39:14`)가 라이브에 없고, 상단 바 컴포넌트는 `Product/Desktop Composition Top Bar · Sidebar=Collapsed`(`477:4999`)로 이미
>   개명돼 있었다. 그 러너는 세트 칠을 쓴 뒤 던질 자리라 돌리지 않았다. highlight-hub 러너와 AppTopBar 템플릿 셋(`1040:13429` · `982:251` ·
>   `982:208`)의 세로 HUG, 보드 36 도 남았다.
> - **적용 뒤 보인 것.** (1) 손 조립 허브 데스크톱 셋(`219:3403` · `29:3` · `219:2917`)의 셸 인스턴스 활성 행에 옛 다크 면 override
>   `#2b2f36`(묶임)이 남아, light 로 바뀐 라벨(#000)의 대비가 1.56:1 이다 — 행 `I493:279;491:359;491:279` · `I493:556;491:553;491:479` ·
>   `I493:2;491:109;491:23`. (2) 메뉴 라벨이 variant 여섯 모두 「VideoEditor」(계획 「Composition」). (3) 메뉴 · 셸 세트가 여섯째 · 일곱째
>   variant 를 담지 못한다(폭 1696 · 2160, variant 끝 1776 · 2240).
> - **저장소(라이브 미적용, [Updates](../updates/README.md) (137)).** sidebar-states 러너가 보드 프레임 `39:3` 아래를 이름 · 자리로 찾고
>   **전부 찾은 뒤에만 쓴다**(없거나 둘이면 첫 쓰기 전에 던진다 — 라이브에서 찾기 단계만 돌려 대상 전부를 찾았다). 컴포넌트 러너가 메뉴
>   라벨 글자를 계획에 맞추고(`menuLabelChanges`) 세트 크기를 variant 배치에서 도출한다. 업그레이드 러너 반환은 노드 수 요약. 보드 판정기가
>   grid 자식의 트랙을 자동 배치 열로 집어 `/subscription` 크레딧 이력 블록이 트랙을 채운다. 세그먼트 제외 판정은 bespoke → blocked 로
>   사실을 따랐다. 측정기 선언 수집에 논리 크기 속성을 더하고 auth fixture 와 `/pricing` 원장을 앵커에서 다시 쟀다(두 `--check` 초록,
>   결과는 (137) 「세그먼트 칸 높이」). 보드 계획의 `unresolvedFillInHug` 는 28 → 12 다.

> **2026-09-14 — 라이브 적용이 보드 19/35 에서 멈췄고, 앵커를 `6f6282c1` 로 옮기며 크기 굳힘 감사 묶음 1~3 을
> 고쳤다.** 앞의 것은 라이브 쓰기이고(`origin/main` `2e3332d` 계획), 뒤의 것은 저장소 변경이다(라이브에 쓰지 않았다).
> 적용 기록은 저장소 밖 작업 메모에 있어, 이 절이 인계에 필요한 사실을 옮겨 둔다.
>
> - **첫 시도는 쓰기 없이 멈췄다.** 27번의 「적용 직전 버전 저장」에서 `figma.saveVersionHistoryAsync` 가 `use_figma` 에서
>   「not a supported API」로 던졌다. 조립 규칙 27번을 그 사실로 고쳤다 — 버전은 사람이 Figma 앱에서 남긴다.
> - **둘째 시도의 소비처 · 세트 재탐침은 2026-09-13 기준선과 같았다**(Mobile 25 = generated 11 · legacy 4 · 컴포넌트 안 7 ·
>   허브 3, Desktop 29 = 10 · 8 · 7 · 4).
> - **앱 셸 세트 러너(옛 계획)를 적용했다.** 모바일 세트에 `1521:5349`, 데스크톱 세트에 `1521:5577` · `1521:5588` ·
>   `1521:5599` 가 더해졌고 기존 variant id 는 전부 남았다(지운 것 0). 두 세트가 TEXT 속성 `Label` · `Parent` · `Current` 를
>   얻었고, 보이는 페인트 132 가 전부 변수에 묶였으며 글리프 어긋남은 0 이다.
>   - **허브 보드 일곱의 글자 · 면 override 는 그대로였다** — 글자 레이어를 TEXT 속성에 묶은 뒤에도 덮어쓴 글자가 남았다.
>     2026-09-13 절이 「적용해 보기 전까지 확인되지 않았다」고 적은 물음의 답이다. 되채울 것은 없었다.
>   - **결제 장면 컴포넌트 안 바 14 는 속성 기본값 글자로 바뀌었다**(Settings · Home · Analytics / YouTube analytics).
>     `setProperties` 로 기준선 글자(My Page · Subscription / Change plan)를 되채우고 다시 읽어 확인했다. 면
>     `#2b2f36` → `#fafafa`(측정 `bg-surface` light) · 폭 370 → 390 · 1628 → 1632 는 받아들였다.
> - **보드 러너는 페이지 `246:3449` 의 20 장 중 19 장**(settings · analytics/youtube · archive 두 뷰포트씩, highlight 열둘,
>   subscription 데스크톱)을 적용했고 장마다 라이브 대조가 계획과 같았다(같음 1 · 다름 0). 20 번째 `190:1497`
>   (`/subscription` 모바일)에서 러너가 세로 프레임에 `layoutWrap` 을 걸다 던졌다 — 원자적으로 되돌아가 옛 generated
>   `1228:12258` 과 숨긴 legacy 가 남았다. 남은 16 장(`190:1497` 과 페이지 `246:3450` 의 15 장)과 마지막 전수 대조는
>   미뤘다. 앵커 이동이 모든 보드 계획을 다시 만들기 때문이다.
> - **지금 라이브의 상태.** 앱 셸 두 세트는 조합 · TEXT 속성은 새것이지만 **높이를 FIXED 로 굳힌 옛 구조**이고, 19 보드는
>   `2e3332d` 계획으로 그려져 있으며, 나머지 17 보드(`190:1497` · 페이지 `246:3450` 의 15 장 · 첫 적용에서 뺀 `192:1251`)는
>   그 전 계획 그대로다. 컴포넌트 · 체크아웃 · 결제 장면 · 업그레이드 ·
>   sidebar-states 러너는 적용하지 않았다(은퇴한 컬렉션을 찾는다).
> - **저장소(라이브 미적용).** 앵커 `6f6282c1` — 소유자가 프로필 버튼 32 와 그만큼 낮아진 상단 바를 새 기준으로 받았다.
>   바의 높이는 fit 이라 Figma · 도구 · 문서에 수로 굳히지 않는다([Updates](../updates/README.md) (131)). 감사 묶음 1
>   (상단 바 세트 hug 재구성 · 구조 매처 · 편집기 · 하이라이트 허브 · 업그레이드 가드의 파생 리터럴 · 세로 wrap 결함 ·
>   크기 굳힘 게이트 · 계약과 문서의 계산값)과 묶음 2 · 3(결제 결과 · 체크아웃 본문 · 메인 표면 · 장면, 요금제 카드를 흐름으로 ·
>   본문 치환을 크기에서 뗌 — (132))을 고쳤고, 규칙은 [Figma 화면 조립 규칙](figma-screen-assembly.md) 28번으로 세웠다.
> - **컬렉션 이전(같은 날, 라이브 미적용).** 컴포넌트 · 체크아웃 · 결제 장면 · 업그레이드 · sidebar-states 러너가 라이브 3컬렉션의
>   변수에 역할로 묶는다([Updates](../updates/README.md) (133)) — 위 「적용하지 않았다(은퇴한 컬렉션을 찾는다)」의 막힘이 풀렸고,
>   남은 순서는 「다음 순서」 1번이다. 컴포넌트 러너는 사이드바 세트를 light 측정으로 옮기고(보드 사이드바 색이 바뀐다), 옛 compound 행의 + 버튼을 숨긴다.
> - **보드 생성물 · 렌더러 · 결제 장면 러너(같은 날 뒤, 라이브 미적용).** 보드 두 장(`30:33` 제목 잘림 · `28:3` 세그먼트 겹침)을 깨던
>   크기 조합을 보드 생성기가 측정으로 풀고(전수 19 자리 · 조각 8), 보드 렌더러를 라이브 컬렉션 · Light 모드로 옮겼으며, 결제 장면
>   세 러너가 바 폭 FILL 을 측정으로 닫고 바 TEXT 속성을 route 측정 글자로 채운다([Updates](../updates/README.md) (135)).
>   `28:3` 은 **가로** 겹침만 풀렸다 — 세그먼트 칸의 세로(LOUIS `block-size` 를 측정기가 싣지 않았다)와 `/subscription` 크레딧 이력
>   블록(grid 트랙 순번)은 여전히 Figma 가 접는다. 보드 생성기가 그런 자리 28 을 계획 `stats.unresolvedFillInHug` 에 싣고 부모 · 축마다
>   수를 잠근다((136)) — 보드 러너 바이트는 그대로다.
> - **푸시 전 막힌 것 하나.** `verify-figma-parity`(verify:ci)가 빨갛다 — 라이브 `ProgressRing` 마스터(36)와 AppTopBar
>   후행 슬롯 표본(36)이 기록의 32 와 어긋난다. 소유자 승인으로 마스터를 옮기고 되읽기를 다시 뜨기 전에는 앵커 이동을
>   푸시하지 않는다((131) 「ProgressRing」 · 「계약과 문서의 계산값」 절).

> **2026-09-13(뒤) — 앱 셸 세트 확장 · 화면 계획 재생성 · 라이브 대조.** 라이브 Figma 에는 쓰지 않았다.
> 커밋은 `lane/figma-shell` 의 f0f35bf · 14e2076 · a99e81a · c132b46 과 그 뒤 도구·문서 커밋이다.
>
> - **라이브 상태를 기계로 쟀다.** 새 도구 `scripts/figma-screens-live-check.mjs`(쓰는 법은
>   [Figma Sync](figma-sync.md) 「화면 보드 라이브 대조」)로 36 보드를 읽기 전용으로 떴다. 36 보드 모두
>   generated 트리가 하나이고 pending 자리표시·generated/legacy 밖 직계 자식은 0 이다. 기대값을
>   `--ref 9f8483a` 로 두면 **34/36 이 같다** — 다른 둘은 archive(`20:2` · `23:2`)이고 노드 수는 같으며
>   h1 글자만 다르다. 이 갈래 직전 main(`df31396`)의 계획과는 14/36(결제 보드)이다. 셸만 보면
>   `df31396` 계획과 갈리는 것은 analytics 두 보드(라이브에 상단 바 인스턴스가 없다)뿐이었다.
> - **`488:658` 은 적용해도 지워지지 않는다.** 그 바는 숨긴 `legacy//subscription`(`586:3949`,
>   visible=false) > `190:1204` 안에 있다. 렌더러는 이름이 `generated/<route> <문맥>` 인 직계 자식만
>   지우고(`scripts/templates/figma-app-screens-renderer.js:482-483`), legacy 그룹은 없을 때만 만든다
>   (`:486-491`) — legacy 를 지우는 줄이 없다. 보이는 subscription 데스크톱 바는 라이브에서도 날노드였다.
> - **컴포넌트 러너의 컬렉션 문제.** 라이브 LOUIS 의 변수 컬렉션은 `Klipse Primitive` · `Klipse Semantic` ·
>   `Klipse Semantic Color`(Light/Dark) 셋이고, `1 · Palette` · `2 · Semantic` 을 찾는 러너는 첫머리에서
>   던진다. 앱 셸 러너는 f0f35bf 에서 옮겼다 — 상단 바 면은 측정(light fixture, 44 바 전부 `#fafafa`)과
>   값이 같은 `Klipse Semantic Color[Light]/color/bg-surface` 이다. 아래 「top bar 색 수정 — 반드시 유지」
>   (palette-gray-800)는 앵커 `a3ed8e03` 다크 캡처의 기록이고 이 측정이 대체한다. 나머지 여섯
>   (components · sidebar-states · payment-scenes · checkout-status · upgrade-scene · pricing)은 아직 옛
>   이름이라 **지금 돌지 않는다**.
> - **새 variant 넷과 라벨 속성(14e2076).** 모바일 `Width=Full, Breadcrumb=Trail, Back=True, Divider=On`,
>   데스크톱 `Content=Subscription, Breadcrumb=Single` · `Content=Highlight, Breadcrumb=Trail, Back=True` ·
>   `Content=Home, …, Divider=On`. Divider 는 측정 border 로 판정한다(제품이 헤어라인을 늘 켠다). 옛 Off
>   조합 둘은 라이브 인스턴스가 참조해 `preservedVariants` 로 남겼다 — 참조처는 legacy 둘만이 아니라 허브
>   보드의 **보이는** 바 넷(아래 소비처 항목)이다. breadcrumb 는 TEXT 속성 `Label` · `Parent` · `Current` 다.
> - **상단 바 세트의 소비처는 화면 보드와 결제 장면만이 아니다(2026-09-13 라이브, 리뷰 지적으로 다시 쟀다).**
>   `figma-screens-live-check --emit --consumers` 로 두 세트의 인스턴스를 전부 뽑았다. Mobile 25 = generated 11 ·
>   legacy 4(숨김) · 결제 장면 컴포넌트 안 7 · **손 조립 허브 보드 3**, Desktop 29 = generated 10 · legacy 8(숨김) ·
>   컴포넌트 안 7 · **허브 보드 4**. 허브 일곱은 이 저장소의 어떤 생성기도 다시 채우지 않고 `--check` 도 보지 않는다:
>
>   | 인스턴스 | 보드 | variant | 보이는 글자 | 크기·배치 |
>   | --- | --- | --- | --- | --- |
>   | `528:2665` | `29:44` mobile `/highlight` | Full · Single · Off | Highlight | 402 FIXED |
>   | `528:2653` | `219:3701` mobile `/videoeditor` | Full · Single · Off | 비디오 에디터 | 402 FIXED |
>   | `528:2641` | `219:3209` mobile `/canvas` | Full · Single · On | 캔버스 | 402 FIXED |
>   | `493:539` | `219:3403` desktop `/videoeditor` | Home · Single · Off | 비디오 에디터 | 1628 FILL |
>   | `493:816` | `29:3` desktop `/highlight` | Home · Single · Off | Highlight | 1628 FILL |
>   | `493:262` | `219:2917` desktop `/canvas` | Settings · Single · On | 캔버스 | 1628 FILL |
>   | `488:779` | `220:3072` desktop `/analytics/instagram` | Analytics · Trail · On | Analytics / YouTube analytics | 1628 FILL |
>
>   일곱 모두 루트 면(`#2b2f36`)과 글자 색을 인스턴스에서 덮어써 두었고, `488:779` 를 뺀 여섯은 글자 **내용**도
>   덮어썼다(`488:779` 는 variant 기본 글자를 그대로 보인다 — instagram 보드인데 「YouTube analytics」). 앱 셸
>   러너가 마스터를 고칠 때 이 override 가 어떻게 되는지 — 특히 글자 레이어를 TEXT 속성에 묶은 뒤에도 덮어쓴
>   글자가 남는지 — 는 **적용해 보기 전까지 확인되지 않았다.** 결제 장면 컴포넌트 안의 바 14 는 크기·면·글자
>   override 가 없어 마스터 변경(기본 라벨, 크기 1628→1632 · 370→390, 면 색)을 그대로 받을 것으로 본다(추론).
> - **옛 「다음 순서」 1·2 의 결과(c132b46).** subscription 데스크톱과 highlight 열두 보드가 상단 바
>   인스턴스를 얻었고 archive 데스크톱 바가 `Divider=On` 이 됐다. 치환의 variant 목록은 이제 앱 셸 plan 을
>   읽는다. 같은 조사에서 사이드바 활성 항목 오류 둘을 찾아 고쳤다 — highlight 여섯은 제품이
>   `currentPath="/highlight"` 를 넘기므로 `Current=Highlight`, `/mypage/upgrade/billing-success` ·
>   `billing-fail` · `fail` 데스크톱은 `currentPath="/mypage/upgrade"` 라 `Current=Upgrade` 다. 생성기의
>   사이드바 서명 가드가 다시 틀리면 멈춘다.
> - **`/mypage/upgrade` 데스크톱의 「후퇴」는 치환 결함이 아니다.** 라이브 카드 인스턴스 넷(Trial · Basic ·
>   Pro · Max, 316×560)은 옛 제품이다. 제품 5258d9b2 가 요금제를 다섯(Trial · Lite · Plus · Pro · Ultra,
>   256.8×608.19)으로 바꿨고 계획은 그 측정을 그린다. 세트를 다섯으로 다시 짓기(upgrade-scene 러너)
>   전까지 이 보드는 첫 적용에서 뺀다 — 아래 다음 순서 1.
> - **archive 의 `Button primary「Start a new project」` 가 계획에서 빠지는 것은 제품 변경이다.** 그 버튼은
>   홈 배너 CTA 였고 제품 `AppHomeScene.tsx:232` 가 「CTA 버튼은 이 전환과 함께 사라진다」고 적는다
>   (배너가 DB 행으로 옮겨가며 링크 컬럼이 없다). 계획이 옳다.
>
> **2026-09-13 — 앵커 `6fbdac16`.** 검증 결과는 이 절이 아니라 그 회차 커밋 메시지와 명령이 낸다
> (아래 「검증 기준선」). 이 절 아래의 2026-08-24 항목들은 그 시점의 기록이다. 특히 「다음 화면은
> `/docs` shell」은 **무효다** — 제품이 `/docs` 트리를 걷어냈고(`ca56540c`) 문서 정본은 별도 저장소로
> 옮겨졌다.
>
> - **앵커 이동을 두 번 끝냈다.** `38a7d5a4`(낙후 핀 13 → 0) 뒤 `6fbdac16`. 두 번째는 인용·서브트리
>   재고정이 0 건이었고 표면·보드 판정 수가 전후 동일했다 — 앵커 사이 9 커밋은 캔버스 이미지 생성
>   이어받기와 CI 훅 · 문서이고 DS 가 재는 시각 축과 겹치지 않았다.
> - **상단 바 매처 회귀를 찾아 고쳤다.** 제품이 상단 바 래퍼에
>   `margin-bottom: var(--app-gnb-main-card-padding-block-start)`(데스크톱 16px · 모바일 6px — 제품
>   `b6b4e245` · `e95e1fb3`)를 주자 스펙에
>   래퍼가 남았고, `scripts/lib/figma-component-substitution.mjs` 의 매처가 래퍼를 바로 착각해 슬롯을
>   닫았다. archive · settings · subscription 다섯 보드가 `Product/*App Top Bar` 인스턴스를 잃었고,
>   highlight 모바일 여섯에는 틀린 `Inset` 이 붙었다. INSTANCE 합계는 Avatar 가 따로 세어져 84 로 가려져
>   **어떤 게이트도 울리지 않았다.** 매처를 고쳐 36 화면 중 34 가 회귀 전과 같고 둘(analytics)은 같은
>   버그에 가려져 있던 바를 새로 얻었다. `scripts/check-figma-board-composition.mjs` 에 보드별 셸 래칫
>   `SHELL_INSTANCES_BY_BOARD` 를, `scripts/verify-gates.mjs` 에 합계가 상쇄되는 모양의 canary 를 세웠다.
> - **앵커를 옮길 때는 `scripts/regen-figma-at-anchor.sh` 를 쓴다.** 전제를 확인하고 `package.json` 의
>   `verify:product` 순서로 측정 → Figma 생성 → 문서를 돈다. 측정이 실패하거나 SKIPPED 를 내면 생성
>   전에 멈춘다. fixture 체크아웃과 빌드는 하지 않고 할 일을 인쇄한다. **같은 커밋에서 기준선도
>   옮긴다** — 목록은 그 스크립트 머리말이 소유한다(`check-coverage-targets.mjs` 의 표면 기준선,
>   `check-figma-board-composition.mjs` 의 `BESPOKE_BASELINE` · `CANDIDATE_FLOOR` ·
>   `SHELL_INSTANCES_BY_BOARD`). 두 회차 연속 이것을 잊어 그물이 늘어졌고 canary 가 물지 못했다.
> - **Figma 생성 check 다섯이 제품 저장소 경로 철자에 묶여 있었다.** product-app-shell · components ·
>   highlight-hub · sidebar-states · upgrade-scene 생성기가 근거 명령 문자열에 `KLIPSE_PRODUCT_REPO`
>   절대경로를 적어서, 같은 트리를 `$PWD/../klipse-web` 로 가리키면 check 가 drift 로 죽고 다른 기계에서는
>   원저자 경로가 아닌 한 늘 죽었다. 이제 `"$KLIPSE_PRODUCT_REPO"` 자리표시를 적고, 런북은 두 루트를
>   실경로로 굳혀 내보낸다. 두 철자 모두에서 check 가 통과하는 것을 확인했다.
> - **랜딩 `/` 은 범용 측정기로 잰다.** 제품 `8802565e` 가 랜딩을 개편해 옛 전용 측정기
>   (`#capabilities article` · 상위 섹션 8개)가 잴 것을 잃었다. 옛 전용 기록을 읽는 소비자는 0 이었다.
>   합성 장면 축은 새 랜딩에 장면이 없어 표본 0 이 **참인 상태**다.
> - **라이브 Figma 는 아직 옛 계획이다.** 생성물은 새 앵커로 다시 만들었지만 파일에 적용하지 않았다.
>   사이드바 compound 행 둘(+ 버튼)이 simple 로 내려갔고 `.glyph/NavPlusGlyph` 매핑이 걷혔다 —
>   라이브 보드의 그 컴포넌트는 사용자 자산이라 지우지 않았다. (이때 「highlight 모바일 여섯의 상단 바는
>   날노드로 남는다」고 적었지만 같은 날 뒤 절에서 세트에 그 조합을 더해 해소했다.)

- Upgrade desktop/mobile scene 완료: `417:2461`, `422:2696`; mobile visible-slice set `422:2567`.
- 제품 캡처 대조에서 Trial 2px current-plan outline과 36px profile usage ring 누락을 발견해 측정기부터
  확장한 뒤 Figma를 수정했다.
- 마지막 Figma 감사: Upgrade visible paint 706 = variable-bound 699 + brand fixed 1 + measured outline 6;
  Top Bar visible paint 98/98 variable-bound; Pretendard 이탈 0; mobile viewport 밖 콘텐츠 0.
- 마지막 생성 check: inventory, product components, app-shell, payment scenes, checkout status, upgrade scene
  및 pricing page 일곱 Figma 생성기가 모두 고정 fixture에서 통과했다.
- `/pricing` full-page set `443:9424`: desktop `443:7960`, mobile `443:8657`; 반복 set 6개,
  scene당 instance 20개, paint 2,192 = bound 2,184 + 허용 brand fixed 4 + other unbound 0.
- 다음 화면은 `/docs` shell과 반복 detail이다. 숫자를 보충하지 말고 고정 제품 렌더 probe를 먼저 만든다.
- **2026-08-24 이어받은 세션 갱신:** collapsed Upgrade CTA 생성기 부채(steps 1·2·3)를 닫았고 stale AI
  docs로 막혀 있던 `verify-gates`를 재생성으로 통과시켰다. **step 4(Highlight hub 생성기)도 완료** —
  `build-figma-product-highlight-hub.mjs`/renderer를 만들어 정본 파일에서 no-op reconcile을 확인하고
  `verify:product`에 게이트를 등록했다(로컬 25 + CI 14 = 39). `KLIPSE_PRODUCT_FIXTURE_ROOT` +
  `KLIPSE_PRODUCT_BUILD_ROOT=/private/tmp/klipse-web-measure.528RlU/repo`로 `pnpm run verify:product`가
  exit 0이다(tailwind 3건은 working repo tailwindcss 부재로 graceful SKIP). 상세는 아래
  "2026-08-24 이어받은 세션" 절. **정본 Figma 파일은 `OlYKERKOkgbxBEEoXGZW2c`다** — DS 초안
  `bxGEp0km5zluMJGulaTvFW`와 혼동하지 말 것. **step 5 소스 측정도 완료**(3 desktop을 pinned 소스로
  adversarial 검증): `38:3`은 공통 GNB 없는 전면 에디터로 이미 올바름 확정(교체 불필요 — 인계서 가정이
  틀렸다), `220:3452`/`221:3234`는 공통 GNB 셸이며 셸 기하는 확정·top-bar 내부는 dynamic 인증 route probe
  필요로 차단. **step 6(mobile common shell) 대부분 완료**: app-shell renderer의 mobile reconcile 결함
  (stale-LIGHT)을 desktop과 동등하게 고쳐 커밋했고, 라이브 `Product/Mobile App Top Bar` 6 variant를
  다크로 reconcile한 뒤 **공통 셸 mobile 프레임 7개**(archive·settings·subscription·analytics/youtube +
  nodecanvas·videoeditor·highlight 허브)에 shared instance를 적용·스크린샷 검증했다. **미적용 3개**
  (instagram·highlight project·highlight shorts)와 **step 5 잔여**(220/221 desktop)는 **같은 dynamic
  인증 route probe 블로커**를 공유한다(auth-fixture는 정적 route만 렌더). 전면 에디터 2개는 제외.
  상세는 "남은 것 (step 6 + step 5 잔여)" 절.

## 목표

1. Klipse 제품의 모든 페이지를 고정 제품 커밋에서 직접 측정한다.
2. 측정값과 제품 렌더를 근거로 Figma에 desktop/mobile 화면을 제품과 동일하게 구현한다.
3. 여러 화면에서 반복되는 UI를 먼저 Figma component/variant로 묶는다.
4. 반복 계약을 token/component/pattern 후보로 추려 디자인 시스템 규범과 생성물에 기록한다.
5. 그 계약을 제품에 다시 적용하는 일은 화면 정본과 추출 근거가 준비된 뒤 별도 adoption 단계로 한다.

## 절대 경계

- 제품 저장소 `/Users/sejunki/klipse-web`은 읽기 전용이다. 제품 수정은 이 작업의 권한에 없다.
- 제품 기준선은 `migration/product-evidence.lock.json`이 고정한 커밋이다. 현재 값은
  `a3ed8e031214f67ac319c5ceaa7ad2808cf0d3a4`다.
- 숫자·색·반경·간격을 추측해 Figma나 기록에 넣지 않는다. 값이 없으면 측정 probe부터 추가한다.
- 제품 선언 확인은 고정 커밋에 대한 exact command, verbatim line, line number를 남긴다.
- 기존 dirty worktree와 아래 추적되지 않은 사용자 파일을 보존한다.
  - **figma/run-ds-library.js**
  - **figma/run-full-figma-sync.js**
  - **scripts/build-figma-ds-library.mjs**
  - **scripts/build-figma-full-runner.mjs**
  - **scripts/figma-live-bridge.mjs**
  - **scripts/figma-live-daemon.mjs**

## Figma 정본

- 파일 key: `OlYKERKOkgbxBEEoXGZW2c`
- 제품 화면 페이지: `246:3447`
- 획득/랜딩 섹션: `255:1830`
- 법무 섹션: `255:1838`
- 제품 asset/component 페이지: `240:3529`

### 완료된 권위 프레임

| route | desktop | mobile |
| --- | --- | --- |
| `/` | `359:2032` · 1920×10527.140625 | `359:2986` · 402×9033 |
| `/privacy` | `350:17450` · 1920×10557 | `350:18523` · 402×12015 |
| `/terms` | `350:19606` · 1920×8896 | `350:20517` · 402×11461 |

랜딩 hero product SVG는 `361:3721`과 `361:3723`이다. VideoEditor component set은 `332:187`,
desktop/mobile main component는 `332:22`와 `332:138`, 화면 instance는 `359:3917`과 `359:4284`다.
데스크톱 hydrated NodeCanvas wrapper/raster는 `359:2069`와 `359:2070`이다.

### 기존 Figma 화면 inventory와 권위

2026-08-24 `figma.root.children` 및 각 section/frame을 Plugin API로 readback했다. 파일에는 8 pages,
21 route sections, 95 frames가 이미 있다. 이들은 대부분 이름에 적힌 대로 “문서만 보고 재구현”한
L2/L3 초안이며 제품 실측 정본이 아니다. 현재 권위 프레임은 위 표의 6장뿐이다.

주요 page/section:

- 인증 page `246:3448`: `255:1842`, `255:1844`, `255:1846`
- 앱 page `246:3449`: `255:1848`~`255:1858`
- 결제 page `246:3450`: `255:1860`, `255:1862`
- 운영 page `246:3451`: `255:1864`, `255:1866`, `255:1868`

기존 화면은 삭제하지 않고, 같은 section 안에서 제품 실측 frame으로 교체·검산한 뒤에만 reference를
정리한다. 기존 frame의 “7차 연속 통과”는 내부 문서 재구현끼리의 일치이며 제품 render parity 증거가 아니다.

### 기존 인증 frame readback 대조

기존 인증 16개 frame의 `CARD`/`FORM` 계층을 readback했다. 전부 plain `FRAME`이며 Figma component
instance가 하나도 아니다. 대표 mismatch:

| route/context | 기존 Figma frame | Figma card | 제품 실측 card |
| --- | --- | --- | --- |
| login desktop | `24:3` | y=375.5 · 400×320 | y=380.0938 · 400×319.7969 |
| login mobile | `24:19` | y=277 · 370×320 | y=274 · 370×326 |
| signup desktop | `187:1152` | y=375.5 · 400×551 | y=253.5938 · 400×572.7969 |
| signup mobile | `187:1230` | y=277 · 370×719 | y=151 · 370×572 |
| check-email desktop | `184:1131` | y=375.5 · 400×224 | y=428.0938 · 400×223.7969 |
| expired desktop | `184:1237` | y=375.5 · 400×142 | y=457.0938 · 400×165.7969 |
| reset desktop | `185:1142` | y=375.5 · 400×246 | y=393.0938 · 400×293.7969 |
| reset/new mobile | `185:1317` | y=277 · 370×449 | y=230.0938 · 370×413.7969 |
| recover desktop | `188:1166` | y=355.5 · 400×369 | y=344 · 400×392 |

따라서 기존 frame을 위치만 조금 보정해서는 안 된다. 제품 실측 tree에서 Auth two-panel shell component와
hug-content card를 먼저 만들고, 상태/내용을 instance property나 variant로 조립해야 한다.

## 진행 중 — `/pricing`

`scripts/measure-product-scenes.mjs`와 생성물 `migration/product.scenes.json`의 `pages`에 `/pricing`을
추가했다. clean standalone product build를 light/en 문맥에서 직접 렌더한다.

| viewport | main | pricing | FAQ | footer |
| --- | --- | --- | --- | --- |
| 1920×1080 | 1920×4615.2969 | y=0 · h=2778.1875 | y=2778.1875 · h=847.5781 | y=3625.7656 · h=989.5313 |
| 402×874 | 402×5097.9063 | y=0 · h=3780.2656 | y=3780.2656 · h=764.0781 | y=4544.3438 · h=553.5625 |

측정기는 GNB, surface, h2, Trial/Basic/Pro/Max 4개 카드, FAQ, Footer도 기록한다. 생성 후 연속
`--check`가 통과했다. Figma frame은 아직 없다.

Figma capture 도구는 호출 인자에 localhost URL과 viewport를 함께 고정하지 못한다는 안전 경고로 세 번
거절됐다. 두 번째 호출 전 Chrome이 정확히 `/pricing`, 1920×1080, light/en임을 readback했고, 세 번째는
pinned production standalone을 `127.0.0.1:3199`에 다시 띄운 뒤 file/section을 고정해 호출했지만 schema가
실제 URL·route·viewport를 잠글 수 없다는 이유로 거절됐다. 임의 page를 manual raster/upload로 우회하지 않는다. 다시
시도하려면 사용자에게 아래 대상과 크기를 그대로 포함한 명시적 승인을 받는다.

> 현재 Chrome의 `http://127.0.0.1:<port>/pricing`을 1920×1080 및 402×874로 Figma 파일
> `OlYKERKOkgbxBEEoXGZW2c`, 섹션 `255:1830` 아래에 캡처하는 것을 승인한다.

## 완료 — 공개·문서·인증 route inventory 측정

`migration/product.scenes.json`의 `pages`는 이제 아래 22개 route를 1920×1080과 402×874에서 직접 잰다.

- 기존 정밀 화면: `/`, `/pricing`, `/privacy`, `/terms`
- 문서·콘텐츠: `/docs`, `/docs/highlight`, `/docs/nodecanvas`, `/docs/videoeditor`, `/blog`,
  `/templates`, `/templates/filter`, `/inquiry`
- 상태·인증: `/data-deletion-status`, `/login`, `/signup`, `/signup/check-email`, `/signup/expired`,
  `/signup/verified`, `/recover`, `/reset-password`, `/reset-password/new`, `/aws/signup`

일반 페이지 측정은 문서 끝까지 스크롤해 `content-visibility` 구간을 활성화하고 높이가 연속 안정된 뒤
top으로 복귀해 landmark, h1/h2, image와 root/body rect를 기록한다. 생성 직후 `--check`를 두 번 연속
통과했다. 게스트 fixture에서 `/aws/signup`은 두 viewport 모두 `/signup`으로 redirect되므로 별도 AWS
가입 화면은 인증 상태 fixture를 먼저 정의해야 한다.

같은 생성물의 `routeInventory`는 아래 명령 결과에서 49개 `page.tsx`를 전수 수집해 route pattern,
dynamic 여부, concrete 측정 URL과 측정 context를 기록한다.

- 명령: `git ls-tree -r --name-only a3ed8e031214f67ac319c5ceaa7ad2808cf0d3a4 -- apps/web/app`
- 총 page file/pattern: 49
- desktop/mobile concrete 측정이 연결된 pattern: 22
- fixture 또는 후속 측정이 필요한 pattern: 27
- dynamic pattern: 6

미측정 27개는 admin 2개, 인증 후 app/analytics/archive/create/settings/subscription 계열,
결제 결과 계열, dynamic blog/highlight/videoeditor다. 목록은 생성물 `routeInventory.pages`가 정본이며
수기로 다시 세지 않는다.

미측정 static 22개는 guest 문맥의 최종 결과도 두 viewport에서 쟀다.

- 17개 → `/login`: `/admin`, analytics 2개, `/archive`, `/explore`, mypage/topup/upgrade 10개,
  `/settings`, `/subscription`
- 3개 → `/`: `/highlight`, `/nodecanvas`, `/videoeditor`
- `/creative-media-admin`: redirect 없이 `Page not found`
- `/creative-media`: redirect 없이 `Something went wrong`

두 viewport 결과가 동일한 분류를 냈다. guest redirect는 destination 화면 coverage일 뿐 source app 화면
coverage가 아니다. 인증 fixture가 없으면 위 20개 앱 route를 완료 처리하지 않는다. 현재 guest outcome까지도
없는 범위는 `/admin/coupons/[id]/print`, `/blog/[slug]`, `/highlight/[projectId]`,
`/highlight/[projectId]/shorts/[shortId]`, `/videoeditor/[projectId]` 다섯 dynamic pattern이다.

대표 document height는 다음과 같다.

| route | desktop 1920×1080 | mobile 402×874 |
| --- | ---: | ---: |
| `/docs` | 1794 | 1831 |
| `/docs/highlight` | 4028 | 4597 |
| `/docs/nodecanvas` | 4571 | 5535 |
| `/docs/videoeditor` | 4637 | 5532 |
| `/templates/filter` | 2950 | 2739 |
| `/inquiry` | 1829 | 1318 |

## 반복 shell 후보 — pinned source 인용

아래 판정은 제품 working tree를 읽은 요약이 아니다. 각 명령은 pinned commit의 파일을 직접 출력했고,
인용은 그 출력의 같은 행에 byte-for-byte 존재한다.

### Docs shell과 detail article

- 명령: `git -C /Users/sejunki/klipse-web show a3ed8e031214f67ac319c5ceaa7ad2808cf0d3a4:apps/web/app/docs/layout.tsx`
- 63행: `    <main className={DOCS_ROOT_CLASS} data-page-root>`
- 64행: `      <Gnb lightSurface />`
- 65행: `      <div className={SHELL_CLASS}>`
- 66행: `        <DocsSidebar />`
- 67행: `        <div className={CONTENT_CLASS}>{children}</div>`
- 69행: `      <Footer />`

따라서 `/docs` 하위는 GNB·sidebar·content·footer shell을 실제로 공유한다. 세 detail route는 같은
`DocArticle`에 key만 다르게 전달한다.

- 명령: `git -C /Users/sejunki/klipse-web show a3ed8e031214f67ac319c5ceaa7ad2808cf0d3a4:apps/web/app/docs/highlight/page.tsx`
- 18행: `  return <DocArticle docKey="highlight" />;`
- 명령: `git -C /Users/sejunki/klipse-web show a3ed8e031214f67ac319c5ceaa7ad2808cf0d3a4:apps/web/app/docs/nodecanvas/page.tsx`
- 18행: `  return <DocArticle docKey="nodecanvas" />;`
- 명령: `git -C /Users/sejunki/klipse-web show a3ed8e031214f67ac319c5ceaa7ad2808cf0d3a4:apps/web/app/docs/videoeditor/page.tsx`
- 18행: `  return <DocArticle docKey="videoeditor" />;`

### Blog/Template marketing shell

- 명령: `git -C /Users/sejunki/klipse-web show a3ed8e031214f67ac319c5ceaa7ad2808cf0d3a4:apps/web/components/templates/TemplateShell.tsx`
- 44행: `    <main className={LIGHT_SURFACE_CLASS} data-page-root>`
- 45행: `      <SectionInteractions />`
- 46행: `      <Gnb lightSurface />`
- 47행: `      <div className={SURFACE_LAYER}>{children}</div>`
- 48행: `      <Footer />`
- 명령: `git -C /Users/sejunki/klipse-web show a3ed8e031214f67ac319c5ceaa7ad2808cf0d3a4:apps/web/components/blog/BlogShell.tsx`
- 45행: `    <main className={LIGHT_SURFACE_CLASS} data-page-root>`
- 46행: `      <SectionInteractions />`
- 47행: `      <Gnb lightSurface />`
- 48행: `      <div className={SURFACE_LAYER}>{children}</div>`
- 49행: `      <Footer />`

두 shell의 JSX 구조가 동일하므로 Figma에서는 하나의 marketing shell component 후보로 묶되, 실제
computed style과 child bounds 대조가 끝나기 전 DS component로 승격하지 않는다.

### Auth status shell

- 명령: `git -C /Users/sejunki/klipse-web show a3ed8e031214f67ac319c5ceaa7ad2808cf0d3a4:apps/web/components/auth/AuthStatusCard.tsx`
- 106행: `    <div className={PAGE}>`
- 107행: `      <aside className={BRAND_PANEL} aria-hidden="true">`
- 120행: `      <div className={FORM_PANEL}>`
- 121행: `        <div className={CARD}>`

`/signup/check-email`, `/signup/expired`, `/signup/verified`, `/reset-password`,
`/reset-password/new`가 모두 이 component를 직접 호출한다. 예:

- 명령: `git -C /Users/sejunki/klipse-web show a3ed8e031214f67ac319c5ceaa7ad2808cf0d3a4:apps/web/app/signup/expired/page.tsx`
- 31행: `    <AuthStatusCard`
- 명령: `git -C /Users/sejunki/klipse-web show a3ed8e031214f67ac319c5ceaa7ad2808cf0d3a4:apps/web/app/reset-password/page.tsx`
- 190행: `    <AuthStatusCard`

이 다섯 화면은 Figma에서 AuthStatusCard component + content/state variants 후보가 맞다. `/login`,
`/signup`, `/recover`는 이 import 증거가 없으므로 시각적으로 닮아도 같은 component라고 먼저 선언하지 않는다.

`/login`과 `/signup`은 component를 공유하지 않지만 pinned source에서 같은 바깥 JSX를 각각 선언한다.

- 명령: `git -C /Users/sejunki/klipse-web show a3ed8e031214f67ac319c5ceaa7ad2808cf0d3a4:apps/web/app/login/page.tsx`
- 388행: `    <div className={PAGE}>`
- 389행: `      <aside className={BRAND_PANEL} aria-hidden="true">`
- 402행: `      <div className={FORM_PANEL}>`
- 403행: `        <div className={CARD}>`
- 명령: `git -C /Users/sejunki/klipse-web show a3ed8e031214f67ac319c5ceaa7ad2808cf0d3a4:apps/web/app/signup/page.tsx`
- 390행: `    <div className={PAGE}>`
- 391행: `      <aside className={BRAND_PANEL} aria-hidden="true">`
- 404행: `      <div className={FORM_PANEL}>`
- 405행: `        <div className={CARD}>`

`/recover`는 별도 단일 card 구조다.

- 명령: `git -C /Users/sejunki/klipse-web show a3ed8e031214f67ac319c5ceaa7ad2808cf0d3a4:apps/web/app/recover/page.tsx`
- 196행: `    <div className={PAGE}>`
- 197행: `      <div className={CARD}>`

## 반복 shell render probe

`scripts/measure-product-scenes.mjs`의 일반 페이지 측정은 위 후보에 `componentProbe`를 함께 기록한다.
각 probe는 rect와 `styleAxes` 전 축을 브라우저 computed style에서 직접 읽는다.

- Docs: root, shell, sidebar, content, article, main/aside, sidebar group/link, summary card, section, control
- AuthStatusCard: root, brand panel, form panel, card, heading, form, control
- Marketing: root, surface, footer, control

두 번 연속 `--check`가 통과했다. 측정 비교 결과:

- Docs sidebar computed style은 네 route에서 viewport별로 완전히 동일하다. desktop은
  x=20, y=120, w=240, h=264이고 mobile은 x=16, y=100, w=370, h=264다.
- Docs detail 우측 aside는 desktop에서 w=248이고 mobile에서는 display 결과가 0×0이다.
- AuthStatusCard root·brand panel·form panel computed style은 다섯 route에서 viewport별로 완전히 동일하다.
- AuthStatusCard desktop root는 1920×1080, brand/form panel은 각각 x=20/970, y=20, w=930,
  h=1040, card width는 400이다.
- mobile root는 402×874, brand/form panel은 0×0으로 숨고 card는 x=20, w=362다.
- `/signup/expired`와 `/signup/verified` card는 rect와 모든 computed style이 완전히 동일하다.
- 나머지 AuthStatusCard card 간 style 차이는 콘텐츠에 따른 `height`와 그 높이에서 계산되는
  `transformOrigin`뿐이다. 이 결과는 fixed-height variant가 아니라 hug-content component여야 함을 뜻한다.
- `/login`·`/signup`과 AuthStatusCard 다섯 route의 바깥 root·brand panel·form panel computed style은
  viewport별로 완전히 동일하다. 제품 코드가 중복이어도 Figma에는 하나의 Auth two-panel shell component가
  맞다. card는 `/login`만 gap=28이고 `/signup`과 AuthStatusCard는 gap=24라 variant/property로 보존한다.
- `/login` desktop card는 x=1235, y=380.0938, w=400, h=319.7969이고 mobile은
  x=16, y=274, w=370, h=326이다. `/signup`은 각각 x=1235, y=253.5938, w=400,
  h=572.7969와 x=16, y=151, w=370, h=572다.
- `/recover`는 two-panel이 아니다. desktop card는 x=760, y=344, w=400, h=392이고 mobile은
  x=16, y=249, w=370, h=376이다.
- `/data-deletion-status`는 별도 inline-style main이며 desktop x=720, y=80, w=480, h=325.9531,
  mobile x=0, y=80, w=402, h=302.3125로 측정됐다.
- Blog/Template marketing root의 computed style 차이도 콘텐츠 `height`와 그 높이에서 계산되는
  `transformOrigin`뿐이다. source의 동일 JSX와 render probe가 모두 같은 shell component 후보를 지지한다.

## 측정기 안정화 변경

`scripts/measure-product-scenes.mjs`는 다음을 보장한다.

- 합성 장면과 공개·문서·법무·인증 22개 route를 1920×1080·402×874에서 측정한다.
- 장면은 외부 pad를 viewport에 배치해 내부 `overflow-hidden` scene host를 스크롤하지 않는다.
- 이미지 load/error와 `decode()` 모두 5초 상한이 있다.
- 폭 0 또는 style none인 border color와 외부 `<img>`의 비시각 `color`만 투명으로 정규화한다.
- 장면은 `parentRect`와 `nativeSceneRect`를 기록하고 외부 페이지 스크롤 위치에 종속된 rect는 기록하지 않는다.
- 일반 페이지는 문서 끝까지 스크롤해 지연 렌더 구간과 높이를 안정화한 뒤 top 기준으로 측정한다.
- 반복 shell 후보는 component root·하위 panel·control의 rect와 computed style 전 축을 함께 기록한다.
- pinned commit의 49개 page file을 route pattern inventory로 만들고 실측 coverage를 자동 대조한다.
- 미측정 static route는 guest 최종 path·redirect·theme·locale·heading·height를 두 viewport에서 기록한다.
- `--check` 실패 시 첫 JSON 차이 경로와 recorded/measured 값을 출력한다.

## 개발 인증 fixture — 보호 route 기본 상태

`scripts/measure-product-auth-fixture.mjs`와 생성물 `migration/product.auth-fixture.json`을 추가했다.
이 산출물의 evidence class는 **`development-auth-fixture`**다. 운영 세션, 실사용자·실결제·실프로젝트
데이터, API 성공 상태, 인증 후 페이지 완료 판정의 근거가 아니다. 제품이 직접 선언한 개발 우회로
보호 route의 로그인 후 shell과 실패/빈 기본 상태를 Figma 이식 전에 측정하기 위한 중간 근거다.

제품 선언은 working tree가 아니라 pinned commit에서 다음 명령과 원문으로 확인했다.

- 명령: `git -C /Users/sejunki/klipse-web show a3ed8e031214f67ac319c5ceaa7ad2808cf0d3a4:apps/web/middleware.ts`
- 31행: ` * 개발 전용 인증 바이패스 — 로그인 없이 로그인-후(보호) 페이지를 확인(반응형 작업 등)하기 위함.`
- 32행: ` * 운영(production)에선 NODE_ENV 게이트로 절대 활성화되지 않는다(이중 안전장치).`
- 35행: `const DEV_AUTH_BYPASS =`
- 36행: `    process.env.NODE_ENV !== "production" &&`
- 37행: `    process.env.NEXT_PUBLIC_DEV_AUTH_BYPASS === "1";`
- 215행: `    if (!user && isProtectedPage && !DEV_AUTH_BYPASS) {`
- 명령: `git -C /Users/sejunki/klipse-web show a3ed8e031214f67ac319c5ceaa7ad2808cf0d3a4:apps/web/components/auth/AuthProvider.tsx`
- 30행: ` * 개발 전용 인증 바이패스 — 실제 세션이 없을 때 목 유저를 채워 로그인-후 화면을 확인(반응형 작업 등).`
- 31행: ` * 운영에선 NODE_ENV 게이트로 절대 활성화되지 않는다(미들웨어와 동일 플래그).`
- 36행: `const DEV_AUTH_BYPASS =`
- 37행: `  process.env.NODE_ENV !== "production" &&`
- 38행: `  process.env.NEXT_PUBLIC_DEV_AUTH_BYPASS === "1";`
- 345행: `      if (!response.ok || !result.ok) {`
- 346행: `        if (DEV_AUTH_BYPASS) {`
- 347행: `          setUser(DEV_MOCK_USER);`
- 348행: `          setProfile(DEV_MOCK_PROFILE);`

측정기는 clean fixture checkout의 HEAD가 pinned commit인지 전후에 확인하고, 임시 Next development
server를 직접 띄운다. Supabase는 연결되지 않는 localhost로 고정하고 외부 요청을 차단한다. 각 route는
격리된 light/en-US context에서 3초 이상 기다린 뒤 path·theme·locale·height·root text·element/dialog
count가 6회 연속 안정될 때 app root와 표시 중 dialog의 가시 DOM geometry, computed style 전 축,
heading, landmark, localhost API status를 기록한다. 동일 style 객체는 무손실 style table로만 압축한다.

16 route × 2 viewport 결과:

| requested route | final route | fixture 기본 상태 |
| --- | --- | --- |
| `/archive` | `/archive` | banner 500·project 401이 드러난 empty projects + 세 제품 banner |
| `/settings` | `/settings` | Trial 설정, billing/billing-details 401 |
| `/subscription` | `/subscription` | Trial·0 credit·history 기본 상태, billing 401 |
| `/analytics/youtube` | 동일 | 연결 전 상태 위 Upgrade required dialog |
| `/analytics/instagram` | `/analytics/youtube` | 독립 화면이 아니라 YouTube 상태로 이동 |
| `/mypage` | `/settings` | route alias |
| `/mypage/upgrade` | 동일 | Trial/Basic/Pro/Max 및 Compare Plans |
| `/mypage/upgrade/checkout` | `/mypage/upgrade` | `plan` query가 없어 선택 화면으로 복귀 |
| billing success/fail/change success/change fail, upgrade fail | 동일 | payment delayed 또는 not completed 기본 상태 |
| topup success/fail | 동일 | credit top-up delayed 또는 not completed 기본 상태 |
| `/explore` | `/archive` | route alias |

desktop은 각 shell이 1920×1080, mobile은 402×874 viewport에 고정되어 document height만으로 구분되지
않는다. 그래서 생성물은 화면별 82~812개 가시 노드 전체를 기록한다. 임시 localhost port가 CSS
`background-image` URL에 끼어든 첫 drift는 origin만 제거하고 asset path·gradient·색은 그대로 보존해
정규화했다. 그 뒤 연속 `--check`로 재현성을 확인한다.

Figma에서 아이콘을 추측해 다시 그리지 않도록 tree에 SVG `viewBox`·`d`·`points`·좌표·반경·크기·
fill/clip rule과 CSS mask image/size/position/repeat, stroke dash 축도 추가했다. 현재 두 viewport 전체에서
viewport와 교차하는 tree node 2,641개, vector 속성이 있는 SVG node 232개, 그중 path `d` 108개,
고유 mask image 7종을 기록한다. 503개 computed style table과 reference로 무손실 정규화한 파일은
약 2.6MB다. mask asset은 `MagnifyingGlass.svg`, `House.svg`, `Graph.svg`, `MagicWand.svg`,
`highlight_symbol.svg`, `youtube.svg`, `CheckCircle.svg` 일곱 경로다.

### 측정 기반 component 후보

같은 생성기의 `componentCandidateAudit`가 redirect source를 제외한 canonical 화면 사이에서 5노드 이상
subtree를 전수 비교한다. root 기준 상대 geometry, tag/role/input type, computed style table reference,
DOM 경로가 viewport 안에서 전부 같고 서로 다른 route 두 곳 이상에서 반복될 때만 후보로 남긴다.
처음에는 rect 크기만 보고 mobile x=-268의 닫힌 drawer도 “가시”로 잘못 세어 mobile 후보를 34개로
과대계수했다. viewport 교차 조건을 추가해 재생성한 정본은 desktop 39개, mobile 11개다.
**후보 목록은 Figma/DS 승격 기록이 아니다.** 상위 근거:

- desktop 47노드 app sidebar subtree가 10 route에서 동일하다: settings, subscription, upgrade,
  billing result 5종, topup result 2종. 바로 아래 46노드 list도 같은 10 route에서 동일하다.
  mobile에서는 닫힌 drawer가 x=-268로 viewport 밖이므로 가시 후보에서 빠진다.
- desktop 59노드 header/58노드 nav subtree가 settings·subscription·billing-change
  success/fail·topup success/fail 6 route에서 동일하다. 별도 59/58노드 header/nav는
  upgrade·billing success/fail·upgrade fail 4 route에서 동일하다. 적어도 두 measured variant가 있다.
- billing-change-fail과 topup-fail은 desktop 86노드 화면 root 전체, mobile 27노드 가시 root 전체가
  동일하다. content 문자열을 signature에서 제외했기 때문에 공용 failure result shell + copy property
  후보가 강하다.
- billing-change-success와 topup-success는 desktop에서 82노드 root 전체가 동일하지만 mobile에서는
  전체 root 일치가 없다. mobile에서는 change/topup success/fail 4 route의 14노드 상단 bar만 동일하다.
  콘텐츠 높이 차이를 먼저 확인한 뒤 hug-content component로 묶어야 한다.
- desktop에서는 archive·settings·subscription·analytics·upgrade·결제 결과 12 canonical route 모두에서
  동일한 9노드 nav item subtree 두 종류가 반복된다. mobile에서는 같은 12 route의 화면 안 우측 상단
  36×36 control subtree 5노드가 반복된다.

후보 ID, 정확한 route/path/root rect, node/route/occurrence count와 score는 생성물에 있으므로 이 문서의
수기 목록을 Figma 입력으로 쓰지 않는다.

2026-08-24 Figma Plugin API readback으로 앱 page `246:3449`와 결제 page `246:3450`의 전체 노드를 다시
훑었다. 앱 page는 instance 237개, 결제 page는 263개지만 두 page 모두 `COMPONENT` 또는
`COMPONENT_SET` definition은 **0개**다. 관련 기존 master는 asset page의
`.glyph/NavPlusGlyph` (`180:636`, 두 page에서 instance 38개)와 `.glyph/SidebarToggle`
(`63:244`, instance 21개)뿐이다. 따라서 합성 app sidebar/payment-result component는 아직 없으며,
기존 L2/L3 frame을 component화했다고 간주할 수 없다.

측정된 desktop sidebar가 제품의 `Gnb` 소유인지도 pinned source에서 확인했다.

- 명령: `git -C /Users/sejunki/klipse-web show a3ed8e031214f67ac319c5ceaa7ad2808cf0d3a4:apps/web/components/navigation/Gnb.tsx`
- 4453행: `          ) : useSidebarNav ? (`
- 4455행: `              className={gnbStyles.menuSidebarOuter}`
- 4546행: ``                <ul className={`${gnbStyles.menu} ${gnbStyles.menuSidebar}`}>``
- 4547행: `                  {/* 검색 — 홈 위 첫 항목. 커맨드 팔레트를 연다(내비 항목이 아니므로 인디케이터 대상 아님). */}`
- 4586행: `                  {SIDEBAR_MENU_ROWS.filter(`
- 4587행: `                    (row) => row.type !== "link" || !isNavHrefHidden(row.href),`
- 4631행: `                            <div`
- 4636행: ``                                  ? `${gnbStyles.menuLink} ${gnbStyles.menuSidebarCreateCompound} ${gnbStyles.menuLinkActive}```
- 4637행: ``                                  : `${gnbStyles.menuLink} ${gnbStyles.menuSidebarCreateCompound}```
- 4663행: `                              <button`
- 4666행: `                                  gnbStyles.menuSidebarCreateAddonInset`
- 4677행: `                                <NavPlusGlyph />`

따라서 Figma 후보는 임의로 새로 이름 붙인 sidebar가 아니라 제품 `Gnb`의 `useSidebarNav` branch다.
기본 row, active row, Search command row, NodeCanvas/VideoEditor compound row + add-on action, 닫힌 mobile
drawer 상태를 component property/variant 후보로 보존해야 한다.

## 완료 — 첫 측정 기반 Figma component family: desktop Gnb

위 47노드 반복 후보를 제품 수치로만 조립한 첫 Figma component set을 asset page에 만들었다.

- section: `381:22` · `I · product/Gnb sidebar · measured component`
- 설명 frame: `381:23`
- component set: `384:215` · `Product/Gnb Sidebar Menu`
- `Current=Default`: `382:22`
- `Current=Home`: `384:85`
- `Current=YouTube`: `384:122`
- Upgrade CTA component set: `390:215` · `Product/Gnb Upgrade CTA`
- `State=Default`: `390:211`
- `State=Current`: `390:213`
- desktop shell component set: `392:611` · `Product/Gnb Desktop Shell`
- shell `Current=Default`: `392:211`
- shell `Current=Home`: `392:311`
- shell `Current=YouTube`: `392:411`
- shell `Current=Upgrade`: `392:511`

세 variant는 각각 256×250이며 row y는 0, 36, 72, 108, 144, 180, 218이다. Home과 YouTube
active state의 글자·아이콘은 각 route의 실측값 `#000`, opacity 1을 사용하고, inactive state는
`#575d68`, icon opacity 0.92다. app shell surface `#eeeef1`, BETA chip tint, row radius/padding,
Pretendard 14/500/-1%도 모두 `migration/product.auth-fixture.json`에서 도출했다. 기존 Figma의 정확한
MagnifyingGlass·House·Graph·MagicWand·highlight_symbol·youtube·NavPlusGlyph master를 instance로
재사용했다. 검산 결과 각 variant의 visible paint 65개 중 65개가 기존 Figma variable에 bound됐고
unbound paint는 0개다.

59노드 desktop header 후보 두 그룹을 node/path/rect/style로 직접 비교하면 57노드는 같고 아래 두 경로만
다르다: `.0.2.0.0` Upgrade button, `.0.2.0.0.0` label. Default CTA는 256×41, padding 10/14,
radius 12, `#171b22`/`#f8f8f9`, inner 0/0/0/1 8% + drop 0/1/2 6%다. Current CTA는 같은 geometry에
`#f8f8f9`/`#000`, drop 0/12/24 12%다. live readback에서 spacing 8, padding 10/14, radius 12,
두 fill/text color가 모두 기존 variable에 bound됐고 세 shadow effect도 측정값과 일치했다.

제품이 upgrade route에서 이 active state를 선언하는 근거:

- 명령: `git -C /Users/sejunki/klipse-web grep -n -F 'resolvedPath.startsWith("/mypage/upgrade")' a3ed8e031214f67ac319c5ceaa7ad2808cf0d3a4 -- apps/web/components/navigation/Gnb.tsx`
- 5032행: `                      resolvedPath.startsWith("/mypage/upgrade")`
- 명령: `git -C /Users/sejunki/klipse-web grep -n -F 'sidebarUpgradeButtonActive' a3ed8e031214f67ac319c5ceaa7ad2808cf0d3a4 -- apps/web/components/navigation/Gnb.tsx`
- 5033행: ``                        ? `type-body-14-medium ${gnbStyles.sidebarUpgradeButton} ${gnbStyles.sidebarUpgradeButtonActive}```

전체 shell은 6노드 brand 후보가 12 route에서 동일하다는 측정과 위 menu/CTA set을 조합한다. 각 variant는
280×1080이고 정확한 `logo/klipse-light` master `57:10`을 96×28로 재사용한다. logo는 x=16/y=18,
menu instance는 x=12/y=64, CTA instance는 x=12/y=1027이다. 네 shell의 visible paint는 각각 68개이고
67개가 variable bound다. 남은 1개는 브랜드 자산 master가 소유하는 색 고정 black wordmark vector다.

이 component는 아직 디자인 시스템 규범이 아니라 **product-only measured candidate**다. 제품의 현재
sidebar ramp와 신규 Klipse primitive가 다르므로 legacy `palette/sidebar`, `semantic/light-sidebar` mode를
명시해 현재 제품 렌더를 보존했다. 반복 범위와 상태가 더 쌓이기 전에 신규 DS token 값으로 바꾸지 않는다.

수동 Plugin API 호출을 정본으로 남기지 않기 위해 아래 코드 기반 생성 경로를 추가했다.

- source fixture: `migration/product.auth-fixture.json`
- generator: `scripts/build-figma-product-components.mjs`
- renderer template: `scripts/templates/figma-product-components-renderer.js`
- generated plan: `figma/product-components.plan.json`
- generated Figma runner: `figma/product-components.draw.js`
- package gate: `check-figma-product-components` · `verify:product`의 17번째 제품 의존 leaf

생성기는 menu 후보 `subtree-7fba13f6a8a4`(47노드·10 route), brand 후보
`subtree-08a5cfbcf527`(6노드·12 route), header 후보 `subtree-bf514c7b7b96`(59노드·6 route)와
`subtree-e4dcecc90d80`(59노드·4 route)을 assert하고 fixture에서 geometry·style·asset mask·variant를
다시 추출한다. runner는 page/section/component set/variable/icon을 재탐색해 없는 것만 만든다. 세 set이
모두 있는 라이브 파일에서 재실행했을 때 set `384:215`, `390:215`, `392:611`과 총 9개 variant ID를
그대로 반환하며 `alreadyExisted: true`로 종료됐다. `--check`는 plan과 runner의 바이트 드리프트를 잡는다.

## 완료 — 측정 기반 Payment Result Content component

billing change와 credit top-up의 개발 fixture 기본 결과를 Gnb shell에서 분리해 별도 product-only
component set으로 만들었다.

- section: `J · product/Payment result · measured component`
- component set: `395:628` · `Product/Payment Result Content`
- `Outcome=Failure, Viewport=Desktop`: `395:592`
- `Outcome=Failure, Viewport=Mobile`: `395:600`
- `Outcome=PlanDelayed, Viewport=Desktop`: `395:608`
- `Outcome=PlanDelayed, Viewport=Mobile`: `395:613`
- `Outcome=TopupDelayed, Viewport=Desktop`: `395:618`
- `Outcome=TopupDelayed, Viewport=Mobile`: `395:623`

Failure section은 billing-change-fail/topup-fail 두 route에서 desktop 9노드 후보
`subtree-eca01d4c1ecf`, mobile 9노드 후보 `subtree-6431e73e726b`로 완전히 같다. Success desktop은
5노드 후보 `subtree-d1aea0da5d0f`로 geometry/style이 같고 copy만 다르다. 이 ID들은 outline 계산축을
fixture에 추가한 뒤 같은 root/count를 다시 확인해 갱신했다. Mobile success는 plan 설명이
2줄, top-up 설명이 1줄이라 section 높이가 283.7813과 262.7813으로 다르므로 한 높이로 합치지 않고
별도 measured variant를 유지했다.

제품 copy 선언 근거:

- 명령: `git -C /Users/sejunki/klipse-web grep -n -F 'Payment was not completed.' a3ed8e031214f67ac319c5ceaa7ad2808cf0d3a4 -- apps/web/app apps/web/components`
- `apps/web/components/landing/system/messages/en.ts` 4035행: `      title: "Payment was not completed.",`
- 명령: `git -C /Users/sejunki/klipse-web grep -n -F 'Payment confirmed, but plan update delayed' a3ed8e031214f67ac319c5ceaa7ad2808cf0d3a4 -- apps/web/app apps/web/components`
- 같은 파일 4024행: `      title: "Payment confirmed, but plan update delayed",`
- 명령: `git -C /Users/sejunki/klipse-web grep -n -F 'Payment confirmed, but credit top-up delayed' a3ed8e031214f67ac319c5ceaa7ad2808cf0d3a4 -- apps/web/app apps/web/components`
- 같은 파일 4029행: `      title: "Payment confirmed, but credit top-up delayed",`

Failure는 desktop 520×237.5938, mobile 370×320.1875다. 두 delayed success의 desktop은
520×217.1875이고, mobile은 위 copy wrapping에 따라 높이가 갈린다. 제목/본문/action/error detail의
모든 text box와 button rect는 fixture의 상대 좌표를 사용한다. 처음에는 browser의 fractional glyph width를
Figma fixed text width로 강제해 `UNKNOWN_ERROR`가 0.xpx 차이로 두 줄이 되는 결함을 시각 검산에서 잡았다.
최종 구현은 측정된 flex 계약을 그대로 쓴다: desktop detail은 row/space-between 520×45, mobile은
column/center 370×82, gap 16, vertical padding 12. 두 viewport 모두 error value는 한 줄이다.

라이브 readback에서 6개 variant의 제목·본문·error term/value·action paint는 전부 기존 variable에
bound됐다. `#000`, `#f8f8f9`, black 56%, black 48%, radius 12, action horizontal padding 20을 사용한다.
생성 runner는 44,490자로 Figma API 50,000자 제한 안에 있고, 전체 evidence roots는 plan에 보존하되
runner에는 후보 ID/nodeCount/routeCount만 실어 전송량을 줄였다. 재실행 시 set `395:628`을 재발견하고
Failure detail auto-layout을 idempotent하게 reconcile한다.

## 완료 — 측정 기반 Mobile App Top Bar component

모바일 보호 route 16개의 상단 앱 크롬을 전수 대조해 제품에 실제로 존재하는 조합 6개를 별도
product-only component set으로 만들었다.

- section: `400:591` · `K · product/Mobile app top bar · measured component`
- 설명 frame: `400:592`
- component set: `400:670` · `Product/Mobile App Top Bar`
- `Width=Full, Breadcrumb=Single, Back=False, Divider=Off`: `400:595`
- `Width=Full, Breadcrumb=Single, Back=False, Divider=On`: `400:606`
- `Width=Full, Breadcrumb=Trail, Back=False, Divider=On`: `400:617`
- `Width=Inset, Breadcrumb=Single, Back=False, Divider=On`: `400:630`
- `Width=Inset, Breadcrumb=Trail, Back=False, Divider=On`: `400:641`
- `Width=Inset, Breadcrumb=Trail, Back=True, Divider=On`: `400:654`

full bar는 402×53, panel inset bar는 370×53이다. 둘 다 vertical padding 8, horizontal padding 16,
child gap 8이며 sidebar control은 32×32, profile control은 36×36이다. Back이 있는 leading cluster만
68×32, gap 4다. single title과 parent/separator/current trail을 같은 축으로 섞지 않고 측정된 조합만
variant로 남겼다. archive/explore의 transparent divider도 임의로 gray divider로 통합하지 않았다.

근거 후보는 mobile `subtree-2c2025d948a9` 14노드·4 route,
`subtree-9fb50e18369c` 13노드·4 route, profile control `subtree-80b5c31c3514`
5노드·12 route다. 기존 Figma master `.glyph/SidebarToggle` `63:244`,
`.glyph/ArrowLeftLong` `194:1616`, `.glyph/UserCircleDefaultAvatar` `173:710`을 재사용했다. 특히
ArrowLeftLong을 24→20으로 줄였을 때 제품 측정의 path 11.6667×10과 일치한다.

제품이 이 구조를 선언하는 pinned source 근거:

- 명령: `git -C /Users/sejunki/klipse-web show a3ed8e031214f67ac319c5ceaa7ad2808cf0d3a4:apps/web/components/navigation/Gnb.tsx`
- 5187행: `            const mainChromeTopBarNode = (`
- 5199행: `                <div className={gnbStyles.mainChromeLeadingCluster}>`
- 5202행: `                    className={gnbStyles.mainChromeSidebarToggle}`
- 5262행: `                  <nav`
- 5264행: `                    aria-label={messages.analytics.breadcrumbNavAria}`
- 5298행: `                <div className={gnbStyles.mainChromeProfileCluster}>`
- 5313행: `                    aria-label="Open profile"`
- 명령: `git -C /Users/sejunki/klipse-web show a3ed8e031214f67ac319c5ceaa7ad2808cf0d3a4:apps/web/components/navigation/Gnb.tsx`
- 423행: `    "[padding:8px_var(--mainchrome-pad-x)]",`
- 425행: `    "[border-bottom:1px_solid_color-mix(_in_srgb,_rgb(var(--gray-000-rgb)_/_8%)_calc(var(--mainchrome-divider-progress,_1)_*_100%),_transparent_)]",`
- 428행: `    "[html[data-theme=light]_&]:[background:var(--palette-gray-100)]",`
- 429행: `    "[html[data-theme=light]_&]:[border-bottom-color:color-mix(_in_srgb,_var(--palette-gray-200)_calc(var(--mainchrome-divider-progress,_1)_*_100%),_transparent_)]",`
- 432행: `    "[@media(max-width:719px)]:[padding:8px_var(--app-gnb-main-inline-padding-end)_8px_var(--app-gnb-main-inline-padding)]",`
- 명령: `git -C /Users/sejunki/klipse-web show a3ed8e031214f67ac319c5ceaa7ad2808cf0d3a4:apps/web/app/mypage/upgrade/page.tsx`
- 510행: `  /** 상단 크롬 바(사이드바 열림닫힘 토글 옆)에 두는 뒤로가기 버튼 — 비디오에디터 등과 동일 패턴으로 통일. */`
- 516행: `      aria-label={sub.backToSubscription}`
- 518행: `      <svg width={20} height={20} viewBox="0 0 24 24" fill="none" aria-hidden="true">`
- 520행: `          d="M19 12H5M5 12L11 6M5 12L11 18"`

처음 라이브 스크린샷에서는 browser DOM glyph rect를 Figma text layer의 clip rect로 그대로 써서
`Home`, `Settings`, `Subscription` 끝 글자가 잘렸다. 임의 여백을 넣지 않고 목표 Figma 파일에서
Pretendard Medium 14/21/-0.14px 임시 text node의 natural bounds를 직접 측정한 뒤 즉시 제거했다. 그
Figma glyph bounds와 측정 이유를 `figma/product-app-shell.plan.json`에 기록했고, 제품 rect는 위치와
container 정본으로 유지한다. 수정 후 6 variant 전체 문구를 스크린샷으로 확인했다.

처음 구현은 profile glyph를 `palette/gray-300`에 묶고 제품의 `::after` usage ring을 누락했다. DOM tree에
나타나지 않는 값을 추측해 보충하지 않고 `pseudoElementProbes.profileRing`을 측정기에 추가했다. 16개
route×2 context readback은 avatar 28×28, button/ring 36×36, ring gap/width 2px, progress 0%, track
`rgba(0,0,0,.20)`를 재현한다. glyph path runtime fill은 `rgb(213,215,221)`이며 Figma의 정확한
`palette/gray-400`; ring은 `gray/000 · a20`에 묶었다.

제품 선언 인용:

- 명령: `git -C /Users/sejunki/klipse-web show a3ed8e031214f67ac319c5ceaa7ad2808cf0d3a4:apps/web/components/navigation/UserCircleDefaultAvatar.tsx | nl -ba`
- 13행: `  "text-palette-gray-400",`
- 명령: `git -C /Users/sejunki/klipse-web show a3ed8e031214f67ac319c5ceaa7ad2808cf0d3a4:apps/web/components/navigation/Gnb.tsx | nl -ba`
- 1358행: `    "[--profile-avatar-size:28px]",`
- 1361행: `    "[--profile-ring-track:rgb(var(--gray-000-rgb)_/_20%)]",`
- 1362행: `    "[--profile-ring-gap:2px]",`
- 1363행: `    "[--profile-ring-width:2px]",`
- 1390행: `    "[&::after]:[background:conic-gradient(_from_0deg,_var(--profile-ring-fill)_0_var(--profile-ring-progress),_var(--profile-ring-track)_var(--profile-ring-progress)_100%_)]",`
- 1392행: `    "[&::after]:[mask:radial-gradient(_farthest-side,_transparent_calc(100%_-_var(--profile-ring-width)),_#000_calc(100%_-_var(--profile-ring-width))_)]",`

mobile/desktop 두 set의 최종 라이브 readback은 visible paint 98개 중 98개가 기존 variable에 bound됐고
unbound 0개다. Upgrade에 쓰인 mobile/desktop back=true 변형의 ring node는 각각 `430:2785`,
`430:2791`이다. 생성 경로:

- generator: `scripts/build-figma-product-app-shell.mjs`
- renderer: `scripts/templates/figma-product-app-shell-renderer.js`
- generated plan: `figma/product-app-shell.plan.json`
- generated runner: `figma/product-app-shell.draw.js` · source quote 검증과 profile reconcile 추가 후 48,107 bytes
- package gate: `check-figma-product-app-shell` · `verify:product`의 18번째 제품 의존 leaf

## 완료 — 측정 기반 Desktop App Top Bar component

route별 바깥 sticky slot은 1580/1596/1600으로 달랐지만 실제 top bar는 모두 1628×53이었다. slot 폭을
component 폭으로 잘못 승격하지 않고 실제 bar의 content/breadcrumb/back/divider 조합 6개만 만들었다.

- section: `405:610` · `L · product/Desktop app top bar · measured component`
- 설명 frame: `405:611`
- component set: `405:692` · `Product/Desktop App Top Bar`
- Home/off: `405:617`
- Settings/single: `405:628`
- Analytics/trail: `405:639`
- MyPage/single: `405:652`
- Subscription/trail: `405:663`
- Subscription/trail/back: `405:676`
- expanded SidebarToggle glyph: `405:614` · `Product/.glyph/SidebarToggle · Expanded measured`

모든 variant는 1628×53, padding 8, child gap 8이다. leading은 x8/y10에서 32×32 또는 back이 있을 때
68×32, breadcrumb는 x48 또는 x84, profile은 x1584/y8에서 36×36이다. live readback이 이 좌표를
그대로 반환했다. desktop family와 expanded glyph의 visible paint 44개는 전부 variable-bound됐다.

desktop의 `data-sidebar-expanded=true`는 폭 0인 SVG `<g>`를 이동시키므로 기존 가시 tree에 잡히지
않았다. `scripts/measure-product-auth-fixture.mjs`에 별도 `vectorControlProbes`를 추가해 button/svg rect,
group computed transform, path geometry/stroke를 기록했다. clean pinned build의 생성 직후 `--check`가
16 routes×2 contexts에서 통과했다.

- mobile open: `matrix(1, 0, 0, 1, 0, 0)`
- desktop collapse control: `matrix(1, 0, 0, 1, -2.5, 0)` at 20px SVG
- Figma 32px expanded master line x: 8. 20px instance에서 위 -2.5px transform과 같은 위치다.
- back arrow path: 20px SVG 안에서 11.6667×10, stroke 1.5

desktop text는 목표 Figma 파일에서 Pretendard Medium 16/24/-0.16의 natural bounds를 직접 측정하고
임시 node를 제거했다. product DOM rect는 placement/container 정본으로 유지하고 Figma glyph bounds는
clip 방지에만 사용한다. 6개 variant 전체 스크린샷에서 문구와 back/expanded glyph를 검산했다.

근거 후보: `subtree-53fc052b1377` 5노드·12 route,
`subtree-dadf2a2fbd77`/`subtree-66d7e03eea07` 14/13노드·4 route,
`subtree-8a189a16b13a`/`subtree-36775db94d9d` 16/15노드·3 route,
`subtree-5293ac01577e` 5노드·3 route. 생성 경로는 Mobile Top Bar와 같은 app-shell plan/runner다.

## 완료 — Desktop Payment Result Main Surface와 full scene

change/top-up 결과 4개 route를 기존 측정 component만 중첩해 제품 전체 장면으로 조립했다.

- section: `406:629` · `M · product/Desktop payment result scenes · measured composition`
- 설명 frame: `406:630`
- main surface set: `406:687` · `Product/Desktop Payment Result Main Surface`
  - Failure `406:633`, PlanDelayed `406:653`, TopupDelayed `406:670`
- full scene set: `406:1045` · `Product/Desktop Payment Result Scene`
  - Failure `406:688`, PlanDelayed `406:809`, TopupDelayed `406:927`
- mobile main surface set: `407:1076` · `Product/Mobile Payment Result Main Surface`
  - Failure `407:1022`, PlanDelayed `407:1042`, TopupDelayed `407:1059`
- mobile full scene set: `407:1134` · `Product/Mobile Payment Result Scene`
  - Failure `407:1077`, PlanDelayed `407:1098`, TopupDelayed `407:1116`

main surface는 1628×1004, background `#f8f8f9`, radius 16, top bar (0,0), result content
(554,161)이다. full scene은 1920×1080, app background `#eeeef1`, Gnb (0,0), main surface
(280,12)다. 따라서 full scene의 result content는 제품과 같은 절대 x834/y173이다. 단일 1920×1080
variant와 전체 set을 스크린샷으로 검산했다.

mobile main surface는 402×810, top bar (16,0), result content (16,109)이고 full scene은 402×874다.
main 아래 64px는 측정된 app background `#eeeef1`로 남는다. 3개 variant 전체 스크린샷에서 제목 wrapping,
failure detail의 vertical 배치, button y와 하단 surface 경계를 확인했다. failure full-page/main 후보는
`subtree-73a30a28794e` 27노드·2 route와 `subtree-9be5ba2fce8c` 24노드·2 route이며 중간 wrapper
`subtree-d79fa46213b4`/`subtree-70ba76fddd21` 26/25노드 후보도 generator가 assert한다.

failure full-page/main 후보는 `subtree-52d9ec85500e` 86노드·2 route와
`subtree-201c9e9375a9` 24노드·2 route, delayed-success는 `subtree-5aa2dd10161d`
82노드·2 route와 `subtree-7bba430c44a0` 20노드·2 route다. 장면은
`Product/Gnb Desktop Shell` Current=Default, `Product/Desktop App Top Bar` MyPage,
`Product/Payment Result Content`의 해당 desktop outcome을 instance로만 사용한다.

desktop/mobile 전체 visible paint 350개 중 347개가 variable-bound됐고, 나머지 3개는 각 desktop scene의 기존
`logo/klipse-light` master가 소유하는 색 고정 black wordmark다. 다른 unbound paint는 0개다.

- generator: `scripts/build-figma-product-payment-scenes.mjs`
- renderer: `scripts/templates/figma-product-payment-scenes-renderer.js`
- generated plan/runner: `figma/product-payment-scenes.plan.json`, `figma/product-payment-scenes.draw.js`
- package gate: `check-figma-product-payment-scenes` · `verify:product`의 19번째 제품 의존 leaf

## 완료 — Checkout Status Content와 3개 desktop/mobile full scene

`/mypage/upgrade/billing-success`, `/mypage/upgrade/billing-fail`, `/mypage/upgrade/fail`의
desktop/mobile 기본 실패·승인 지연 상태를 별도 product-only component로 만들고 전체 장면까지 조립했다.

- section: `410:1118` · `N · product/Checkout status · measured component and scenes`
- 설명 frame: `410:1119`
- content set: `410:1208` · `Product/Checkout Status Content`
  - 6 variants: `410:1122`, `410:1132`, `410:1147`, `410:1165`, `410:1175`, `410:1190`
- desktop main set: `410:1294`
- desktop full scene set: `410:1769`
- mobile main set: `410:1380`
- mobile full scene set: `410:1858`

desktop content는 520px, mobile content는 370px이며 성공 지연형의 경고 surface·border·text와 실패형의
2/3개 detail row, 두 action을 모두 fixture에서 직접 가져왔다. desktop detail은 좌우 정렬, mobile detail은
가운데 세로 정렬이다. full scene은 기존 `Product/Gnb Desktop Shell` Current=Upgrade와 Subscription trail
desktop/mobile top bar를 instance로 중첩한다.

첫 Figma screenshot에서 브라우저와 Figma Pretendard font engine의 자연 폭 차이 때문에 `UNKNOWN_ERROR`와
일부 term이 줄바꿈됐다. use_figma 임시 TextNode를 14px/21px, letter spacing -0.16/-0.14에서 직접 측정한 뒤
삭제했고, 64/56~57/52/120~121/141/7px 자연 폭과 측정 출처를 plan에 기록해 제품 측정 anchor를 유지한 채
한 줄로 보정했다. 보정 후 mobile full scene set screenshot에서 3개 장면의 wrapping·상세행·button을 재검산했다.

새 장면 전체 visible paint 504개 중 501개가 variable-bound됐고, 나머지 3개는 desktop scene의 기존
Klipse wordmark 고정 paint다. error `#ff4b59`, 8% surface, 16% border는 이미 존재한 Palette/Primitive
variable에 바인딩했으며 새 토큰은 만들지 않았다.

- generator: `scripts/build-figma-product-checkout-status.mjs`
- renderer: `scripts/templates/figma-product-checkout-status-renderer.js`
- generated plan/runner: `figma/product-checkout-status.plan.json`, `figma/product-checkout-status.draw.js`
- package gate: `check-figma-product-checkout-status` · `verify:product`의 20번째 제품 의존 leaf

## 완료 — Desktop/Mobile Upgrade Plan Card와 canonical/redirect scene

`/mypage/upgrade` 기본 상태를 desktop 1920×1080과 mobile 402×874에서 구현했다. plan query가 없는
`/mypage/upgrade/checkout`은 두 context 모두 `/mypage/upgrade`로 redirect되며 측정 tree가 canonical과
완전히 같음을 generator가 assert한다.

- section: `417:1982` · `O · product/Upgrade plans · measured desktop scene`
- 설명 frame: `417:1983`
- desktop card set: `417:2213` · `Product/Upgrade Plan Card`
  - Trial `417:1986`, Basic `417:2042`, Pro `417:2123`, Max `417:2172`
- desktop main/scene: `417:2214` · 1628×1056, `417:2461` · 1920×1080
- mobile visible-slice set: `422:2567` · `Product/Upgrade Plan Card Visible Slice`
  - Trial `422:2458`, Basic `422:2512`
- mobile main/scene: `422:2568` · 402×874, `422:2696` · 402×874

desktop card는 모두 316×560, radius24, 16px inset이다. mobile fixture viewport에 실제로 교차하는 것은
Trial/Basic 두 article뿐이며 각각 179×693.5938, x=16/207, inset 12다. Pro/Max와 action은 viewport 밖이라
mobile component에 넣지 않았다. desktop/mobile 모두 `icon/CheckCircle` 기존 master를 instance로 중첩하고
`accent/mint/500`에 바인딩했다.

Figma font engine의 자연 폭은 임시 TextNode로 측정한 뒤 전부 삭제했다. desktop은 Free/세 가격/per month/
네 credit/credits = 71/201/201/202/73/37/50/54/54/62px, mobile은 Free/`35,900`/KRW/per/month =
55/91/61/21/40px다. mobile `35,900 KRW`와 `per month`는 제품의 좁은 열에서 각각 두 줄로 보이되,
Figma에서는 textAutoResize `NONE`, 가격 box 104.5625×75.5938 @ (12,52), period box 42.4375×46
@ (124.5625,81.5938)로 readback됐다.

실제품 402×874 캡처와 Figma를 나란히 본 뒤 Trial current-plan outline 누락을 발견했다. fixture 계산축에
outline width/style/color/offset을 추가해 desktop/mobile Trial 모두 `2px solid rgba(185,225,247,.42)`,
offset `-2px`임을 생성 기록에 넣었다. Basic/Pro/Max는 `outline-style:none`이다. 정확한 로컬 Figma color
variable이 없어 근사값을 쓰지 않고 제품 전용 fixed paint로 두며, `-2px` outline은 같은 시각 결과인
2px INSIDE stroke로 매핑했다.

제품 선언 인용:

- 명령: `git -C /Users/sejunki/klipse-web show a3ed8e031214f67ac319c5ceaa7ad2808cf0d3a4:apps/web/app/mypage/upgrade/page.tsx | nl -ba`
- 210행: `  "[outline:2px_solid_rgb(var(--accent-ultra-400-rgb)/42%)]",`
- 211행: `  "[outline-offset:-2px]",`

최종 scene paint 감사: 706 visible = 699 variable-bound + 기존 Klipse wordmark fixed 1 + 측정 Trial outline
6. desktop/mobile Trial master는 stroke 2/INSIDE/rgba exact, Basic master는 stroke 0으로 readback됐다.
79개 source text의 font family는 전부 Pretendard이며 mobile forbidden content는 0이다. 두 scene 모두
clipsContent=true이고 Figma screenshot natural size가 정확히 1920×1080, 402×874다. 제품 mobile 캡처의
좌하단 검은 `N`은 Next 개발 도구 overlay이며 제품 UI로 옮기지 않는다.

- generator: `scripts/build-figma-product-upgrade-scene.mjs`
- renderer: `scripts/templates/figma-product-upgrade-scene-renderer.js`
- generated plan/runner: `figma/product-upgrade-scene.plan.json`, `figma/product-upgrade-scene.draw.js`
  - runner 45,904 bytes; 50,000자 connector 제한을 넘지 않도록 esbuild로 생성 시 minify한다.
- package gate: `check-figma-product-upgrade-scene` · `verify:product`의 21번째 제품 의존 leaf

## 완료 — Public `/pricing` desktop/mobile 전체 페이지와 반복 component set

고정 standalone의 light/en-US `/pricing`을 desktop 1920×1080과 mobile 402×874에서 끝까지
hydrate/scroll한 뒤 각 문맥의 `main[data-page-root]` 하위 883개 노드를 측정했다. 상위 section rect만
기록하던 단계에서 geometry, computed style, asset URL, SVG vector attribute와 직접 텍스트의 글자별
`Range` 줄 조각까지 확장했다. 모바일 가격은 `35,900`/`KRW`, `per`/`month`의 실제 두 줄을 보존한다.

- section: `443:6508` · `P · product/Pricing · measured full-page components and scenes`
- full-page set: `443:9424` · `Product/Pricing Full Page`
  - desktop `443:7960` · 1920×4615.296875
  - mobile `443:8657` · 402×5097.90625
- component sets
  - Public Global Navigation `443:6534` · 2 variants
  - Public Footer `443:6616` · 2 variants
  - Pricing Plan Card `443:6869` · 8 variants
  - Pricing Credit Pack `443:7188` · 6 variants
  - Pricing FAQ Item `443:7245` · 14 variants
  - Pricing Compare Column `443:7404` · 8 variants
- scene당 instance: navigation 1 + plan 4 + credit 3 + compare 4 + FAQ 7 + footer 1 = 20
- paint audit: visible solid 2,192 = variable-bound 2,184 + footer brand-blue fixed 4, other unbound 0
- CheckCircle 개별 readback `443:6707`: 18×18 원형 stroke/check, clip definition surface는 gray-000,
  보이는 stroke 2개만 accent/mint/500. 전체 페이지 축소 screenshot의 사각형처럼 보이는 표시는 확대
  readback에서 실제 사각형 fill이 아님을 확인했다.

첫 screenshot에서 Figma 글리프 폭 차이로 가격/표 라벨이 감기는 문제를 잡았다. 임의 폭을 더하지 않고
측정된 부모 행/셀의 오른쪽 경계와 글자 `Range.x`를 사용했다. 이로써 navigation 12px, credit text 20px,
desktop/mobile compare inset 20/14px가 제품 좌표와 일치한다. `₩`와 금액은 같은 행의 서로 다른 측정
fragment로 유지한다.

재현 runner는 connector 50KB 제한 때문에 shell, plan desktop/mobile, credit, FAQ, comparison
desktop/mobile 각 2개, scenes로 분할했다. generator/check는
scripts/build-figma-product-pricing-page.mjs(2026-10-06 은퇴) / `check-figma-product-pricing-page`이며 `verify:product`의
22번째 제품 의존 leaf다.

## 2026-08-24 추가 — 공통 GNB/헤더와 비디오 편집기 그리드 복구

사용자 캡처에서 확인된 흰 placeholder 접힘 rail, 누락된 펼침/접힘 버튼, 밝은 헤더 divider,
사라진 Upgrade CTA, 세로로 밀려난 비디오 프리뷰/속성 패널을 우선 복구했다.

- 제품 계측: `migration/product.sidebar-states.json`
  - pinned `a3ed8e03`, dark/en-US, 1920×1080
  - expanded sidebar/main/toggle: 280×1080, x280·1628×1056, 32×32 `Collapse sidebar`
  - collapsed sidebar/main/toggle: 56×1080, x56·1852×1056, 32×32 `Expand sidebar`
  - collapsed menu: x12, y64/100/136/172/208/244, 32×32, 4px 간격
  - expanded/collapsed Upgrade: 256×41 / 32×32, `rgb(241 241 243)`, radius12
- 새 Figma component set: `476:4956` · `Product/Gnb Desktop Rail`
  - Default `476:4551`, Home `476:4632`, VideoEditor `476:4713`, YouTube `476:4794`, Upgrade `476:4875`
  - root와 brand/menu/rows가 중첩 Auto Layout이며 white placeholder는 사용하지 않는다.
- 새 video top bar component: `477:4999`
  - 1852×52 HORIZONTAL Auto Layout, padding8, gap8
  - leading cluster는 `Expand sidebar` 32 + 제품 source arrow 32, gap4
  - breadcrumb `layoutGrow=1`, 오른쪽 portal actions 229 + profile ring36
  - divider는 제품 선언 `gray-000/8%`이며 기존 밝은 gray-200 실선을 쓰지 않는다.
- video scene `39:3`
  - 새 rail instance `477:4918`, topbar instance `477:5015`
  - body `479:4941` · 1820×988 nested Auto Layout
  - 제품 CSS grid를 그대로 매핑: columns `236 / 4 / 1244 / 4 / 324`, column-gap2;
    rows `580 / 4 / 400`, row-gap2
  - assets/preview/properties가 같은 상단 행, timeline이 하단 400px 행에 들어간다.
- analytics scene `30:3`
  - expanded YouTube GNB instance `465:1089`, measured topbar, 실제 제품 기본 미연결 상태로 교체
  - 가짜 KPI/chart/table을 숨기고 icon/title/body/Google 연결 CTA를 fixture 좌표로 중앙 정렬
  - 공통 CTA를 white Upgrade master로 교체해 하단 버튼 배경이 다시 보인다.
- 재현 생성물:
  - `scripts/measure-product-sidebar-states.mjs`
  - `scripts/build-figma-product-sidebar-states.mjs`
  - `scripts/templates/figma-product-sidebar-states-renderer.js`
  - `figma/product-sidebar-states.plan.json`, `figma/product-sidebar-states.draw.js` (20,827 bytes)
  - generated runner를 현재 Figma에 재실행해 같은 node IDs로 멱등 적용됨을 확인했다.
- 회귀 수정:
  - `figma-product-components`는 모든 desktop shell에 제품에서 보이는 white Upgrade CTA를 사용하고,
    GNB palette mode를 default로 고정한다.
  - `figma-product-app-shell` divider는 `gray/000` 8%로 생성한다.
  - `figma/product-components.draw.js`는 connector 50KB 제한 아래 49,891 bytes다.

검증:

- `measure-product-sidebar-states.mjs --check`: expanded 280 → collapsed 56 @ `a3ed8e03`
- product components/app shell/sidebar states 세 생성기 `--check`: 통과
- sidebar states generated runner Figma 재실행: `railSetId=476:4956`, `topBarId=477:4999`,
  `bodyId=479:4941`, `videoFrameId=39:3`
- `verify-gate-split`: CI 14 / product 24, 통과
- `git diff --check`: 통과

아직 완료라고 부르면 안 되는 것:

- video editor의 내부 콘텐츠는 pinned source grid 선언과 기존 product-owned content nodes로 재배치했지만,
  dynamic route 자체는 server-side Supabase `getUser()` 때문에 dev auth bypass로 직접 렌더하지 못했다.
  다음 단계는 `EditorProjectWorkspace`/`VideoEditModal` 전용 authenticated fixture를 만들어 내부 콘텐츠까지
  browser pixel 비교를 추가하는 것이다.
- analytics 연결 완료 상태는 API success fixture가 없으므로 기본 미연결 상태만 제품과 같다고 검증했다.
- 나머지 app screens에는 아직 과거 duplicated GNB/header가 남아 있다. 새 expanded/collapsed master를 route별
  current/breadcrumb variant로 교체하는 작업이 최우선이다.

## 2026-08-24 한도 인계 — 공통 셸 전면 교체, Highlight 복구, 남은 생성기 부채

이 절이 현재 상태의 최우선 인계 기준이다. 바로 위의 “나머지 app screens 전체가 남았다”는 문장은
이번 후속 작업 전 상태다. 이번 세션에서 안전하게 식별된 desktop 공통 화면은 실제 shared instance로
교체했다. 과거 수동 sidebar/header는 삭제하지 않고 `visible=false`로 보존했다.

### 라이브 Figma에서 완료한 공통 셸 교체

- 결제 실패 desktop 4개: 모두 `Current=Default` expanded GNB + Subscription trail top bar
  - `/mypage/upgrade/fail` `183:743`: rail `486:2`, bar `486:262`
  - `/mypage/upgrade/billing-fail` `183:922`: rail `486:281`, bar `486:383`
  - `/mypage/upgrade/billing-change-fail` `183:1095`: rail `486:399`, bar `486:501`
  - `/mypage/topup/fail` `183:1606`: rail `486:517`, bar `486:619`
- page-03 common desktop
  - Archive `20:2`: Home rail `488:2`, Home bar `488:262`
  - Settings `28:3`: Default rail `488:279`, Settings bar `488:539`
  - Subscription `190:1172`: Default rail `488:556`, Subscription bar `488:658`
  - Instagram analytics `220:3072`: Default rail `488:677`, Analytics bar `488:779`
    - pinned source는 `INSTAGRAM_ANALYTICS_HIDDEN=true`라 active Instagram row를 발명하지 않았다.
  - NodeCanvas hub `219:2917`: NodeCanvas rail `493:2`, localized bar `493:262`
  - VideoEditor hub `219:3403`: VideoEditor rail `493:279`, localized bar `493:539`
  - Highlight hub `29:3`: Highlight rail `493:556`, localized bar `493:816`
- 모든 common main은 제품 fixture의 desktop geometry `x=280, y=12, 1628×1056`으로 정규화했다.
  `y=0, h=1080`이던 NodeCanvas/VideoEditor/Instagram도 수정됐다.
- localized top-bar instance의 `current` TextNode는 `textAutoResize=WIDTH_AND_HEIGHT`로 바꿔
  `비디오`, `Highli`처럼 잘리던 문제를 제거했다.

### expanded GNB variants와 생성기

기존 set에 공통 active-class 규칙만 적용한 3개 variant를 추가했다. 새 geometry/color는 만들지 않았고,
Home에서 측정된 token-bound active paint를 제품의 공통 `isSidebarMenuHrefActive` 규칙대로 재사용했다.

- menu set `384:215`
  - NodeCanvas `491:16`, VideoEditor `491:266`, Highlight `491:460`
- shell set `392:611`
  - NodeCanvas `491:105`, VideoEditor `491:355`, Highlight `491:549`
- 제품 인용:
  - 명령: `git -C /Users/sejunki/klipse-web show a3ed8e031214f67ac319c5ceaa7ad2808cf0d3a4:apps/web/components/navigation/Gnb.tsx | nl -ba`
  - 4605행: `                    const href = row.href;`
  - 4606행: `                    const isActive = isSidebarMenuHrefActive(href);`
  - 513행: `    "[.gnb-menuSidebar_.gnb-menuLink:not(&)]:[color:var(--gray-300)]",`
  - 519행: `    "[color:var(--gray-000)]",`
- `scripts/build-figma-product-components.mjs`와 renderer는 existing set에도 missing menu/shell variant를
  추가·reconcile하도록 갱신했다. generated runner는 49,091 bytes이며 Figma 재실행 후 같은 node IDs로
  멱등 적용됐다.

### top bar 색 수정 — 반드시 유지

이전 renderer는 desktop top bar를 semantic `surface/background`에 묶어 다크 화면에서 sidebar와 같은
검정으로 보이게 했다. 사용자 캡처의 main surface는 `rgb(49,54,64)`였고 pinned 제품 선언도 dark top bar를
`palette-gray-800`로 지정한다. 따라서 `figma-product-app-shell`의 `surface` binding을
`1 · Palette / palette/gray-800`으로 바꾸고 generated runner를 재실행했다.

- 명령: `git -C /Users/sejunki/klipse-web show a3ed8e031214f67ac319c5ceaa7ad2808cf0d3a4:apps/web/components/navigation/Gnb.tsx | nl -ba`
- 430행: `    "[html[data-theme=dark]_&]:[background:var(--palette-gray-800)]",`
- Figma 결과: payment, analytics, VideoEditor hub의 header와 main surface가 같은 gray-800으로 복구됨.
- app-shell build/check 통과; runner 41,073 bytes.

### Highlight hub Auto Layout 복구

기존 `29:7`은 카드 5개가 main의 세로 Auto Layout 직계 child라 한 열로 1,600px 이상 늘어났다.
제품 source의 desktop 5-column grid를 다음 구조로 다시 묶었다.

- viewport `498:36`: VERTICAL Auto Layout, x0/y53, 1628×1003, padding `40 16 200 16`
- heading `498:37`: HORIZONTAL Auto Layout, 1596×24, eyebrow/count gap6
- grid `498:38`: HORIZONTAL + `layoutWrap=WRAP`, width1596, gap12/cross-gap12
- cards `29:19`, `29:24`, `29:29`, `29:34`, `29:39`: 각 309.6×309.6, 한 행 5열
- fixed upload `134:588`: main의 ABSOLUTE child, x620/y908, 400×140
- 제품 인용:
  - `highlightSceneStyles.ts:881` `    "[display:grid]",`
  - `highlightSceneStyles.ts:883` `    "[gap:12px]",`
  - `highlightSceneStyles.ts:886` `    "min-[1800px]:[grid-template-columns:repeat(5,_1fr)]",`
  - `highlightSceneStyles.ts:1098` `    "[width:100%]",`
  - `highlightSceneStyles.ts:1100` `    "[margin:40px_auto_0]",`
  - `highlightSceneStyles.ts:1101` `    "[padding-bottom:200px]",`
- screenshot QA에서 5개 카드가 한 행으로 정렬되고 fixed upload가 하단 중앙에 유지됨을 확인했다.
- **미완료:** 이 Highlight 구조는 아직 전용 plan/renderer로 생성되지 않았다. 다음 에이전트는 현재 node IDs를
  기준으로 전용 generator를 만들거나 기존 product scene generator에 편입해야 한다. 라이브 Figma만 보고
  완료 처리하지 않는다.

### collapsed Upgrade CTA — 라이브 수정 완료, 생성기 반영 미완료

VideoEditor project QA에서 collapsed rail 하단에 `pgra...`가 튀어나오는 것을 발견했다. 원인은 256×41
expanded CTA instance를 32×32로 `resize()`해 내부 text가 왜곡된 것이었다. 측정 기록은 실제 collapsed
button과 label viewport를 별도로 가진다.

- 측정: button 32×32, radius12, padding-inline10, white `rgb(241,241,243)`;
  label viewport x22/y1043, 12×18, overflow hidden
- 새 master `500:5344` · `Product/Gnb Collapsed Upgrade CTA`
- rail 5 variants의 instance: `500:5347`, `500:5350`, `500:5353`, `500:5356`, `500:5359`
- 기존 왜곡 instance는 숨김 처리했다.
- 제품 인용은 `Gnb.tsx:1953-1959`(collapsed width/height/padding/gap)와
  `Gnb.tsx:1993-1999`(collapsed label max-width/caption typography)다. 실측 당시 fixture 는
  `a3ed8e03` 이었고, 좌표는 evidence lock 이 고정한 배포본 기준으로 옮겼다 — 값은 그대로다.
- **미완료:** `scripts/measure-product-sidebar-states.mjs`의 `styleAxes`에는 font/line-height/letter-spacing/
  text-overflow/white-space를 추가했지만, 한도 인계 시점에 JSON 재측정과 sidebar-state builder/renderer 반영은
  아직 하지 않았다. 다음 에이전트의 첫 코드 작업이다. 현재 renderer의 `upgrade.createInstance(); resize(32,32)`
  로직을 그대로 실행하면 라이브 수정이 되돌아간다.

### 최신 시각 검증 결과와 남은 범위

- 결제 실패 `183:922`: 로고/메뉴/white Upgrade, 32×32 Collapse, Subscription trail, profile이 복구됨.
- VideoEditor project `39:3`: 56px collapsed rail, Expand+Back, assets/preview/properties 상단 5열,
  timeline 하단 400px. collapsed CTA는 위 master 교체 후 다시 screenshot할 것.
- Analytics `30:3`: shared YouTube GNB/topbar + 실제 미연결 기본 상태. connected state는 미검증.
- VideoEditor hub `219:3403`: active row, gray-800 header, full localized label, 5-card row 정상.
- Highlight `29:3`: active row, gray-800 header, 5-column card grid, fixed upload 정상.
- 아직 교체/검증해야 할 desktop: NodeCanvas project `38:3`, Highlight project `220:3452`,
  Highlight short detail `221:3234` 등 특수 shell. common 1628 shell을 측정 없이 강제로 적용하지 말 것.
- mobile frames는 이번 desktop 교체 범위에 포함하지 않았다. `Product/Mobile App Top Bar`와 mobile GNB를
  route별 fixture로 검증해 별도 적용해야 한다.
- 결제 성공/checkout/upgrade/pricing full scene은 assets page의 생성 component set이 SSOT이며, page-04의
  과거 수동 scene과 혼동하지 않는다.

## 2026-08-24 이어받은 세션 — steps 1~3 완료, 환경 이슈 하나 해소

정본 파일은 `bxGEp0km5zluMJGulaTvFW`가 아니라 **`OlYKERKOkgbxBEEoXGZW2c`**다(이어받는 사람이 헷갈리지
않게 못박는다). 위 "Figma 정본" 섹션의 key가 맞다.

### 완료 — collapsed Upgrade CTA 생성기 부채 (아래 6단계의 1·2·3)

- **1. 재측정.** `KLIPSE_PRODUCT_FIXTURE_ROOT=/private/tmp/klipse-web-measure.528RlU/repo`로
  `node scripts/measure-product-sidebar-states.mjs`를 실행했다. fixture는 pinned `a3ed8e03`이고 clean이며
  Next CLI가 살아 있었다. `styleAxes`에 이미 있던 typography 축이 `migration/product.sidebar-states.json`에
  들어왔고 `--check`가 결정적으로 재현됨을 확인했다(exit 0). 외부 URL은 쓰지 않았다 — fixture가 스스로
  dev server를 띄운다.
- collapsed CTA 실측: 버튼 32×32 · radius 12 · padding-inline 10 · bg `rgb(241,241,243)` · text `rgb(23,27,34)`;
  라벨 span은 clip 12×18 viewport(x22/y1043) 안에서 Pretendard Medium 12/18 · ls −0.12 · text-overflow ellipsis ·
  white-space nowrap. 근거: `Gnb.tsx:1956`(height 32), `:1945`(padding 0 10px), `:1984`(ellipsis), `:1985`(caption font).
- **2. 생성기 수정.** builder가 collapsed CTA의 **라벨 child**(`sidebar.0.2.0.0.0`)를 잡도록 했고
  `measurements.collapsed.upgrade.label = { rect, style, text }`를 plan에 넣었다. renderer는 이제 expanded CTA를
  `resize(32,32)`하지 않고 **전용 master `Product/Gnb Collapsed Upgrade CTA`를 find-or-create**해 그 인스턴스를 놓는다.
  master fill은 `1 · Palette/palette/gray-100`, 라벨 fill은 `palette/gray-900`에 묶고 라벨은 12×18 clip 프레임 안에
  WIDTH_AND_HEIGHT text로 넣어 제품처럼 잘린다. `build --check` 멱등 통과.
- **지뢰 제거 확인.** 옛 코드 `upgrade.createInstance(); resize(32,32)`가 사라졌다. renderer의 variant 재빌드는
  `if (!railSet)` 안에만 있고 라이브에 `Product/Gnb Desktop Rail`(`476:4956`)이 이미 있으므로 재실행해도
  라이브 인스턴스를 건드리지 않는다. from-scratch 재빌드도 이제 왜곡 없는 master 인스턴스를 만든다.
- **3. 라이브 검증.** 정본 파일에서 rail 5 variant를 readback했다 — 각 variant에 CTA 인스턴스가 둘 있고
  옛 왜곡본(`390:213` State=Current 참조)은 `visible=false`(y640), 새 정본(`500:5344` 참조)은 `visible=true`(y1036)다.
  `39:3`의 collapsed rail(`477:4918`) 스크린샷에서 하단 흰 pill이 56px rail 안에 있고 라벨이 밖으로 나오지
  않음을 확인했다. `pgra...` overflow는 없다.

### 함께 해소 — verify-gates가 stale AI docs로 막혀 있었다

이어받은 시점에 `pnpm run verify-gates`가 `[llms] generated AI 문서가 최신이 아닙니다: design/llms/guidelines.txt`로
실패하고 있었다(내 변경 이전부터의 dirty 상태). `node scripts/build-llms-docs.mjs`로 재생성하니 80 normative
sources로 통과한다. `guidelines.txt`/`patterns.txt`는 tracked-modified다.

### verify:product 실행 시 환경 변수 두 개가 필요하다

- `KLIPSE_PRODUCT_FIXTURE_ROOT` — sidebar-states/auth 측정 gate가 쓴다.
- `KLIPSE_PRODUCT_BUILD_ROOT` — **product-scenes gate가 쓴다.** 이게 없으면 "측정 불가"로 hard fail한다.
  둘 다 `/private/tmp/klipse-web-measure.528RlU/repo`로 두면 된다(standalone `.next`가 들어 있다).
- `verify-product-components`/`verify-product-variants`는 working repo `/Users/sejunki/klipse-web`에
  tailwindcss가 없어 **graceful SKIP**한다(실패 아님). 이는 08-19 계열 gate이며 pinned 커밋이 달라 이
  workstream에선 skip이 정상이다.

### 완료 — step 4 · Highlight hub 생성기

- **생성기.** `scripts/build-figma-product-highlight-hub.mjs` + `scripts/templates/figma-product-highlight-hub-renderer.js`.
  새 브라우저 측정 없이 소스에서 기하를 파생한다: main card 1628 − padding 16×2 = body **1596**,
  card = (1596 − gap 12×(5−1))/5 = **309.6**. 두 값은 builder 안에서 assert로 못박혀 소스가 바뀌면 깨진다.
  `sourceQuote`로 `highlightSceneStyles.ts`의 12줄(877/879/882/1094/1096/1097/1111/2270/2272/2274/2275/2276)을
  pinned `a3ed8e03`에 대해 정확히 인용한다. 생성물: `figma/product-highlight-hub.plan.json` + `.draw.js`.
- **renderer는 reconciler다.** install id로 프레임을 찾아(`screenId 29:3`, `viewportId 498:36`,
  `headingId 498:37`, `gridId 498:38`, cards `29:19/24/29/34/39`, `uploadId 134:588`) Auto Layout 속성만
  멱등적으로 다시 박는다. 노드를 새로 만들거나 지우지 않는다. 카드가 grid 밖으로 빠져 있으면 재부모화하고,
  이미 소속돼 있으면 건드리지 않는다. name drift 시 throw.
- **라이브 no-op 검증.** 정본 파일 `OlYKERKOkgbxBEEoXGZW2c`에 draw.js를 실행하니
  before viewport `[1628,1003,gap12,pad40]` → after `viewport[1628,1003] · heading 1596 · grid 1596 ·
  reparented[] · upload[400,140,620,908]`. **reparented가 비어 있고 모든 치수가 파생값과 일치** —
  이미 올바른 라이브를 재현하는 순수 no-op임을 증명했다.
- **게이트 등록.** `package.json`에 `build-figma-product-highlight-hub`/`check-figma-product-highlight-hub`를
  추가하고 `verify:product` 체인에 `check-figma-product-highlight-hub`를 넣었다. `verify-gate-split`는
  이를 **로컬 전용(제품 저장소 필요)** 25번째 gate로 분류한다(CI 14 + 로컬 25 = 39). `build --check` 멱등 통과.

### 측정 완료 — step 5 · project-specific desktop 3개 소스 계약 (adversarial 검증됨)

pinned `a3ed8e03` 소스를 워크플로(6 에이전트, 전원 refuted=false·high)로 계약화하고 인용을 한 줄씩
대조했다. **결론이 인계서의 가정을 뒤집는다** — `38:3`은 공통 GNB를 붙이면 안 되는 화면이었고, 이미
올바르다. 상세 계약과 인용은 세션 scratchpad `step5-source-contracts.md`에 있다. 핵심:

- **`38:3` /nodecanvas?project= — 검증 완료, 변경 없음.** 공통 GNB 없음이 소스로 증명된다:
  `nodecanvas/layout.tsx`(7행 `return children;`)은 passthrough, Gnb 사이드바는 `Gnb.tsx:3420-3423`에서 `!isCreateVariant`로
  꺼진다. 전면 캔버스(`CreateScene.tsx:620` `h-[100svh] overflow-hidden`, `:518` main `p-0`), 상단 고정
  ProjectHeader(`CreateScene.tsx:147` `fixed top-0 ... z-[1001] py-4 px-6`, 2열 그리드 `create/ProjectHeader.tsx`(57행)),
  하단 중앙 떠 있는 toolbar + 우하단 zoom(`node-canvas-v2/index.tsx:507-508/513`). **라이브 `38:3`이 이와
  정확히 일치**(readback + 스크린샷 `step5-nodecanvas-38-3.png`: 브랜드 셸·프로필·레이어 패널 오버레이·
  하단 툴바·줌·노드 4). GNB/topbar 교체는 이 화면에 하면 안 된다.
- **`220:3452` /highlight/[projectId] — 공통 GNB 셸, 손수 만든 셸을 교체해야 함.** 공통 GNB present:
  `HighlightProjectScene.tsx:2352-2355` `{!hideGnb && <Gnb currentPath="/highlight">}` (default hideGnb=false).
  editor rail 없음. body는 `margin-left:var(--app-gnb-sidebar-width)` + `margin-right:var(--app-gnb-main-inline-padding-end=12px)`.
  top bar = GNB mainChromeTopBar(`Gnb.tsx:435-452`): toggle 32+breadcrumb `clipsBreadcrumb`(좌) | headerSlot 포털(중) |
  back button(arrow `d="M19 12H5M5 12L11 6M5 12L11 18"`, `:2374`)+프로필(우). 라이브 `220:3484` main card는
  x280 **w1852 오버플로**(정상은 1628 = 1920−280−12).
- **`221:3234` /highlight/[projectId]/shorts/[shortId] — 공통 GNB 셸, 같은 처리.** shorts
  `apps/web/app/highlight/[projectId]/shorts/[shortId]/page.tsx`(1064–1066행)
  `<Gnb embedded={false} currentPath="/highlight">`, PANEL `ml-[sidebar-width]`+`mr-[12px]`, top bar back button
  arrow 동일(`:1079`), breadcrumb "숏폼 편집"(`:1068`). 결과 영상 있을 때만 뜨는 route 소유 SHORT_TOPBAR
  오버레이(`absolute top-[20px] h-[36px]`, `:157-158`). (검증기가 이 파일 7개 인용의 줄번호 drift를 보정:
  정확한 줄은 `:66/:67/:80/:81/:82/:83/:84/:102` — 인용문 자체는 유효.)

> **인용 lock 주의.** 위에서 `nodecanvas/layout.tsx`·`create/ProjectHeader.tsx`·
> `shorts/[shortId]/page.tsx` 세 파일은 좌표를 `:줄`이 아니라 `(N행)`으로 적었다. 이 세 파일은 아직
> `product-evidence.lock.json`(evidence 85파일)에 없어서 `verify-citations`가 `파일.tsx:줄` 형태를 잡으면
> "lock에 없음"으로 실패한다. `build-product-evidence.mjs`는 이 저장소 커밋이 원격에 있어야 lock을
> 갱신하는데 이 workstream이 전부 uncommitted라 지금은 못 넣는다. **커밋+push 후 `build-product-evidence`로
> 세 파일을 lock에 넣고 `:줄` 형식으로 되돌린다.** 전체 인용은 세션 scratchpad `step5-source-contracts.md`에 있다.

**차단 사유(220/221 top-bar 내부 기하).** top-bar의 실제 painted height는 콘텐츠 구동이라 소스에 없고
(`mainChromeTopBar`에 height 선언 없음; 40px은 companion-row 토큰일 뿐), back button 박스(`w-16 h-16`)의
px은 제품 tailwind scale에 달렸다. 이를 재려면 이 **dynamic 인증 route를 렌더**해야 하는데,
`measure-product-auth-fixture.mjs`는 정적 보호 route(`/archive`·`/settings`·`/mypage/**`·`/explore` 등)만
렌더하고 Supabase는 unreachable·외부요청 차단이라 `/highlight/[projectId]`·`/shorts/[shortId]`·
`/nodecanvas?project=`의 "완료" 상태를 못 만든다. 따라서 220/221의 top-bar 내부는 **seed 프로젝트 + 도달
가능한 mock 데이터를 갖춘 새 fixture 능력이 필요한 probe-gated 단계**다. 재지 않은 값을 그리지 않는다.

**220/221에서 지금 측정 없이 확정 가능한 것(다음 생성기가 쓸 값):** 공통 GNB 사이드바 280 expanded ·
Highlight active row(currentPath=/highlight → menu variant `491:460` / shell variant `491:549`) · main card
x280 / mr12 → **width 1628** (1920 프레임) · top-bar 3-클러스터 구조. 이 확정값으로 셸(사이드바+메인 폭)을
생성기로 재현하고, top-bar 내부는 probe 후 채운다. app-shell install 패턴(`build-figma-product-app-shell.mjs`)을 따른다.

### 남은 것 (step 6 + step 5 잔여) — 정확한 recipe

**step 5 잔여 · 220/221 셸 생성기 + top-bar probe.** 위 확정값으로 220:3452·221:3234의 손수 셸(사이드바
`220:3453`/`221:3235`, main `220:3484`/`221:3266`, top bar `220:3485`/`221:3267`)을 공통 GNB rail instance +
1628 메인으로 교체하는 생성기를 만든다(옛 노드는 삭제 말고 visible=false 보존). top-bar 내부 기하는
dynamic route probe 능력이 생긴 뒤 채운다.

**step 6 · mobile common shell — 7/12 프레임 적용·검증 완료. 3 프레임 probe-gated, 2 제외.**

_인벤토리 (page `246:3449` 03 · 앱 셸의 mobile 프레임 12개, 전부 402 wide):_
`23:2` /archive · `28:44` /settings · `190:1497` /subscription · `219:3209` /nodecanvas hub ·
`38:3843` /nodecanvas?project= · `219:3701` /videoeditor hub · `39:1520` /videoeditor project ·
`29:44` /highlight hub · `220:3759` /highlight/[projectId] · `221:3504` /highlight shorts ·
`30:33` /analytics/youtube · `220:3311` /analytics/instagram. 전부 상단 크롬이 **손수 제작**(shared
instance 아님)이며 surface는 `gray/800`(다크)로 이미 올바르다 — 즉 프레임은 깨지지 않았고, step 6은
정합성(shared component 화) 작업이지 결함 수정이 아니다.

_공유 컴포넌트:_ `Product/Mobile App Top Bar` set `400:670`(6 variant, section `400:591`) +
`Product/Desktop App Top Bar`. auth-fixture 16 route(402×874, `migration/product.auth-fixture.json`)에서
측정됨. app-shell 생성기(`build-figma-product-app-shell.mjs`)는 이 **컴포넌트 라이브러리만 만들고**
화면 프레임에 instance를 넣지 않는다(desktop도 화면 적용은 라이브였다).

_발견한 블로커와 수정:_ **라이브 `Product/Mobile App Top Bar` variant는 stale-LIGHT다** —
surface가 `palette/gray-100`(248,248,249)에 묶여 있다. plan은 `palette/gray-800`(다크)를 의도한다.
원인: renderer의 mobile **reconcile 분기**가 surface/variable-mode/text-fill을 재적용하지 않았다
(create 분기에만 있었다). desktop reconcile 분기는 이미 완전하다(surface `491`, modes `485-486`,
text-fills `535`). **이 세션에서 mobile reconcile 분기를 desktop과 동등하게 고쳤다**
(`figma-product-app-shell-renderer.js`: variant surface + palette/semantic mode + leading control 아이콘 +
divider stroke + breadcrumb text-fill 재적용). 재생성·`--check`·`verify:product` 통과. draw.js 42,436B.

_라이브 적용 완료 (이 세션):_ reconciler를 고친 뒤 라이브 `Product/Mobile App Top Bar` 6 variant를
다크로 reconcile했다(surface `palette/gray-800` = 49,54,64 확인; semantic mode dark 99:7 → text/아이콘 white).
결제 page(`04`)에는 이 컴포넌트 instance가 **0개**라 회귀 blast radius가 없음을 확인했다. 그 뒤 공통 셸
mobile 프레임에 shared variant instance를 넣었다(옛 bar는 visible=false 보존, auto-layout이 body를 자동 재배치):

- **적용·검증 완료 7 프레임 (스크린샷 확인):**
  - `23:2` /archive → `400:595`(Full/Single/Div Off) · "Home"
  - `28:44` /settings → `400:606`(Full/Single/Div On) · "Settings" (ko "설정"→en, 측정·desktop 선례 일치)
  - `190:1497` /subscription → `400:606` + text override "Subscription" (mobile fixture 측정 = Single "Subscription")
  - `30:33` /analytics/youtube → `400:617`(Full/Trail/Div On) · "Analytics / YouTube analytics"
  - `219:3209` /nodecanvas hub → `400:606` + "캔버스" (desktop 허브 선례 `493:262`와 동일)
  - `219:3701` /videoeditor hub → `400:595` + "비디오 에디터" (desktop `493:539` 동일)
  - `29:44` /highlight hub → `400:595` + "Highlight" (desktop `493:816` 동일)
  - text override는 clip 방지로 `textAutoResize=WIDTH_AND_HEIGHT`. desktop 선례(static 4)의 top-bar 라벨을
    직접 readback해 일치 확인: archive Home · settings Settings · subscription "Subscription / Change plan"(desktop은
    trail이나 **mobile fixture는 single "Subscription"** — viewport별로 갈리며 mobile은 측정값을 따른다) ·
    analytics Analytics/YouTube analytics.

- **미적용 — 측정 한계 3 프레임 (dynamic 인증 route probe 필요, step 5 잔여와 동일 블로커):**
  - `220:3311` /analytics/instagram: mobile fixture·desktop 선례 모두 "Analytics / YouTube analytics"(미연동
    fallback의 degenerate 값)인데 프레임의 손수 라벨 "분석 / Instagram 분석"이 의미상 맞다 — 측정값이 화면
    의도와 어긋나 적용 보류.
  - `220:3759` /highlight/[projectId] · `221:3504` /highlight shorts: dynamic route. desktop 대응(`220:3452`/
    `221:3234`)이 step 5에서 probe-gated로 남은 것과 동일. 손수 라벨 "하이라이트 / 클립", "하이라이트 / 숏폼 편집" 보존.

- **제외 — 전면 에디터 2 프레임 (공통 셸 아님):** `38:3843` /nodecanvas?project=(캔버스),
  `39:1520` /videoeditor project(에디터 카드). desktop `38:3`/`39:3`처럼 공통 top bar 없음이 맞다.

- **아직 안 한 것:** mobile GNB 드로어(닫힘 x=-268)는 열림 상태를 제품 소스로 별도 확인해야 한다. 7 프레임의
  shared instance 화면 적용은 desktop처럼 **라이브-온리(생성기 미반영)** 다 — desktop screen 적용과 같은
  기존 부채 패턴. 화면 적용까지 생성기로 고정하려면 별도 "screen-application" 생성기가 필요하다(desktop도 없음).

**통합 블로커:** step 5 잔여(220/221 desktop)와 step 6 미적용 3 프레임은 **같은 뿌리** — dynamic 인증 route
(`/highlight/[projectId]`, `/shorts/[shortId]`, `/nodecanvas?project=`, `/analytics/instagram` 연동 상태)를
현재 auth-fixture가 못 렌더한다(정적 보호 route + unreachable Supabase). seed 프로젝트/연동 데이터를 갖춘
fixture 확장이 이 둘을 동시에 푼다.

### 캔버스 청소 (2026-08-25) — 교체된 손수 셸 영구 삭제

토스식 캔버스 위생(작업 페이지에 죽은 레이어 없음)으로 라이브 정본을 정리했다. 전 페이지 숨김 노드
감사 후, **공유 컴포넌트로 교체되고 숨겨져 있던 손수 셸 33개를 영구 삭제**했다(page 03: 25 · page 04: 8 —
`sidebar (280)`/`top chrome bar` 계열). git 커밋과 생성기가 정본이라 복구 가능. 삭제기는 **visible=false만
지우는 안전장치**를 넣어 보이는 노드는 절대 건드리지 않는다. 검증: page 03 숨김 36→11, page 04 8→0,
archive/billing-fail/settings-mobile의 보이는 공유 셸 인스턴스 전부 유지, archive 데스크톱 스크린샷 정상.

**보류·손대지 않은 것:**
- page 03 숨김 11개 = `/analytics/youtube` 데스크톱(`30:7`)의 옛 콘텐츠(KPI/차트/배너/콘텐츠표). 셸이
  아니라 **콘텐츠**이고, 현재 보이는 본문이 `465:1367 measured/analytics-youtube-unconnected`(미연동)인데
  프레임 제목은 "채널 연동 **완료**"라 **상태 불일치** 소지가 있다 — 제목과 맞는 연동 콘텐츠가 오히려 이
  숨김 쪽이다. 콘텐츠 손실 위험이라 삭제 보류. **다음: 이 화면이 연동 완료 상태를 보여야 하는지 미연동을
  보여야 하는지 먼저 판정**하고, 그에 따라 숨김 콘텐츠를 되살리거나(제목=연동완료면) 삭제한다(미연동이 맞으면).
- page 90 숨김 13개 = GNB rail variant 내부의 옛 `upgrade-cta`/`measured collapsed` 인스턴스. **컴포넌트
  내부**라 수동 삭제하면 생성기와 어긋난다 — sidebar-states/components 생성기가 정리해야 한다.
- 빈 프레임(노드 핸들 28×28, `divider/measured` 1px), 아이콘 내부 Vector/Group 658개는 정상 구조 — 유지.

### 다음 에이전트 첫 6단계 (원본 — 1·2·3은 위에서 완료)

1. `migration/product.sidebar-states.json`을 새 typography 축으로 재측정한다. 외부 서버를 쓸 경우
   `KLIPSE_PRODUCT_MEASURE_URL=http://127.0.0.1:<pinned-dev-bypass-port>`와 clean fixture
   `/private/tmp/klipse-web-measure.528RlU/repo`를 사용한다. **← 완료**
2. `figma-product-sidebar-states` plan에 collapsed Upgrade label 12×18과 typography를 넣고 renderer가
   `Product/Gnb Collapsed Upgrade CTA` master를 생성/reconcile하도록 바꾼다. expanded CTA resize 금지. **← 완료**
3. generated runner를 Figma에 재실행하고 `39:3` screenshot에서 rail 하단 라벨이 rail 밖으로 나오지 않는지 본다. **← 완료(재실행은 no-op임을 확인, 스크린샷 검증 완료)**
4. Highlight `498:36/37/38` 구조를 generated plan/renderer로 고정하고 idempotency를 검증한다. **← 완료(reconciler no-op 확인, verify:product 게이트 등록)**
5. project-specific desktop 3개를 각각 pinned source/probe로 측정한 뒤 GNB/topbar를 교체한다.
   **← 소스 측정 완료(adversarial 검증). `38:3`은 공통 GNB 없는 전면 에디터로 이미 올바름을 검증·확정
   (교체 불필요). `220:3452`/`221:3234`는 공통 GNB 셸임을 확정 — 셸(사이드바 280 + 메인 1628)은 확정값,
   top-bar 내부는 dynamic 인증 route probe 필요로 차단(위 "측정 완료 — step 5" 참조).**
6. 그 후 mobile common shell을 route별로 교체한다. analytics connected/dynamic project state는 fixture가
   없으면 완료 처리하지 않는다.

## 다음 순서

**2026-09-14 기준 순서다.** 이 절 아래 번호 목록은 2026-08-24 기록이며, `/docs` 항목은 무효다. 옛 1번(subscription
데스크톱 바를 지운다)은 틀린 전제였고, 2026-09-13 의 1번(앱 셸 세트 → 보드 35 장)은 위 체크포인트대로 옛 계획으로 세트와
보드 19 장까지 돌고 멈췄다. 앵커 `6f6282c1` 이 모든 보드 계획을 다시 만들었으므로 **이미 적용한 19 장까지 전량 다시 적용한다.**

1. **라이브 적용 — 세트 → 보드 전량. 쓰기 승인이 먼저다.** 순서는 [Figma 화면 조립 규칙](figma-screen-assembly.md) 27번을 따른다:
   1. 버전 — `use_figma` 로는 남길 수 없다(2026-09-14). 사람이 Figma 앱에서 남기거나, 남기지 않고 간다는 사실을 승인 질문에 넣는다.
   2. **소비처 기준선** — `figma-screens-live-check --emit --consumers` 를 읽기 전용으로 돌려 남긴다. 수는 새로 센다
      (2026-09-14 적용으로 보드 19 장의 generated 인스턴스가 새로 만들어졌다).
   3. `figma/product-app-shell.draw.js`(앵커 `6f6282c1` — 상단 바 hug 재구성). 기존 variant 와 앞머리 · breadcrumb · 프로필
      노드를 **같은 id 로 옮기므로** TEXT 속성 값과 override 가 남는다. 마스터를 고치므로 바를 인스턴스로 쓰는 모든 소비처의
      **높이가 식을 따라 낮아진다**(허브 보드 일곱 · 결제 장면 컴포넌트 안 14 · 숨긴 legacy · generated). 허브 일곱의 글자 · 면
      override 는 2026-09-14 에 TEXT 속성 결합 뒤에도 남았다.
   4. **소비처 대조** — `--consumers <전> <후>`. 받아들인 높이 변화는 `--expect-change` 로 이름을 댄다. 받아들이지 않은 보이는
      변화가 남으면 여기서 멈춘다.
   5. **2026-09-15 현재: 앞 넷(컴포넌트 → 체크아웃 · 결제 장면 · 업그레이드)은 `c156bae` 러너로 적용했다(위 체크포인트).** 남은 순서는
      (가) **컴포넌트 러너 재적용**((137) — 메뉴 라벨 · 세트 크기. 반환 `menuLabelChanges` 가 variant 여섯의 `row/Composition`
      「VideoEditor」→「Composition」 여섯이어야 하고, 메뉴 세트 `384:215` · 셸 `392:611` 의 크기는 러너가 놓인 variant 의 끝에서 도출한다
      (앵커 `2c6bdacf` 에서 variant 폭이 레일 내용 폭 · 레일 폭으로 줄므로 (137) 이 적은 폭 수는 낡았다 — 수를 기대값으로 쓰지 않고
      「variant 끝 + 여백 = 세트 끝」을 본다). 그 밖의 변화가 없어야 한다 — 감사 수 · variant id · 소비처 해시가 2026-09-15 적용 뒤와 같은지
      본다. **예외 하나(기대한 변화, 되돌림 대상 아님):** 손 조립 허브 `219:3403` 의 활성 행 라벨이 「VideoEditor」→「Composition」이
      된다 — 그 인스턴스는 글자를 덮어쓰지 않아 마스터 라벨을 따른다. 적용 뒤 스크린숏으로 확인하고 되돌리지 않는다((149)).
      섹션 `381:22` 는 2200 폭 그대로라 두 세트가 섹션 밖으로 나온 모양이 남는다 — **소유자 결정(2026-09-16): 섹션 `400:591` 은
      옮기지 않고 `381:22` 의 크기 리터럴도 두며 기록만 한다**((149)) →
      (나) **허브 활성 행 면의 일회성 쓰기**(2026-09-15 적용 워크플로의 결정 — 러너 범위 밖, 세트 단계에서 한 번): 행 `I493:279;491:359;491:279`
      (`219:3403`) · `I493:556;491:553;491:479`(`29:3`) · `I493:2;491:109;491:23`(`219:2917`)의 `fills` override 를 `[]` 로(노드 삭제 · detach ·
      resetOverrides 아님). 제품 light 활성 행은 면이 없다(`Gnb.tsx:604`). 쓰기 전후 그 행의 라벨 대비와 나머지 override 필드를 대조한다 →
      (다) **sidebar-states**((137) — 찾기 단계가 대상을 전부 찾아야 쓴다. 반환의 `railInstanceId` 477:4918 · `topBarId` 477:4999 ·
      `topBarInstanceId` 477:5015 · `bodyId` 479:4941 가 이 id 인지, 두 인스턴스 이름이 `… Composition …` 인지 본다) → (라) highlight-hub →
      (마) AppTopBar 템플릿 셋(`1040:13429` · `982:251` · `982:208`) 세로 HUG. **컬렉션 이전은 끝났다
      ([Updates](../updates/README.md) (133))** — 다섯 러너가 라이브 3컬렉션의 변수에 역할로 묶고, 업그레이드 러너의 페인트 감사도
      풀렸다. 컴포넌트 러너가 먼저다 — 결제 장면 세 러너가 그 러너의 사이드바 셸 · 결과 본문 세트를 인스턴스로 품는다. 러너마다
      전후 `--consumers`. 결제 장면 러너들은 컴포넌트 안 바 인스턴스를 그 자리에서 다시 쓰고(없을 때만 새로 만든다) 폭을 FILL
      로 두며(모바일 390 · 데스크톱 1632 — 넘침 0), TEXT 속성을 route 측정 글자로 채운다((135)). 계획 라벨이 2026-09-14 에
      되채운 글자와 같으므로 반환의 `topBarTextChanges` 가 전부 빈 배열이어야 한다 — 바뀐 속성이 나오면 멈추고 `--consumers` 로 본다. **컴포넌트 러너는 사이드바 메뉴 · 셸 · CTA
      세트의 색을 다크에서 light 측정으로 옮기고 로고를 `klipse-light` 로 바꾼다** — 그 세트를 인스턴스로 쓰는 데스크톱 보드 ·
      결제 장면 · 손 조립 허브의 사이드바가 함께 바뀌는데 `--consumers` 는 상단 바 두 세트만 본다. **같은 적용이 Canvas · Composition
      행의 + 버튼(`add-action · New project (…)`, 메뉴 variant 마다 둘 — 제품 `658ece13` 이 걷었다)을 숨겨 `retired/` 로 두고 아이콘 ·
      라벨을 같은 id 로 행 직계로 옮긴다**(Updates (133) 「옛 compound 행」). 적용 승인 질문에 이 두 변화를 넣고 전후 스크린숏으로 본다 —
      적용 뒤 메뉴 세트 `384:215` 와 그 인스턴스에 보이는 `add-action` 이 0 인지도 센다. 러너마다 반환의 `unboundColors`(고정 역할과 페인트 수)와 `allowedFixedPaintCounts`(`brandLogo` · 품은 세트의
      고정 역할 `nested …`)가 (133) 표의 역할과 같은지 본다 — 역할이 다르거나 `Unexpected unbound visible paints` 로 던지면 거기서 멈춘다.
   6. `figma-screens-live-check --sets` 로 세트 확인(상단 바 두 세트의 `layoutContract` 포함) → 보드 러너 전량
      (`figma/app-screens.*.00.draw.js` — 세트 러너가 끝났으면 `192:1251` 을 포함한 36 장). 보드 러너는 루트에 `Klipse Semantic
      Color` Light 를 고정하고, 반환의 `unboundColors` 는 계획 `colourBinding.unbound` 안에 있어야 한다((135)).
   7. `figma-screens-live-check --check <두 페이지 결과 · 세트 결과>` 로 **36/36 탐침 · 다름 0**(결과 파일을 빠뜨리면 실패한다).
      이 대조는 크기를 보지 않으므로 **적용 완료 조건이 하나 더 있다((136) · (137))** — 계획 `stats.unresolvedFillInHug` 의 자리마다
      스크린숏에서 접힌 모양이 그 자리 그대로인지 확인하고, 기준선에 없는 접힘이 보이면 멈춘다. 2026-09-15 에 두 자리가 풀렸다 —
      `190:1172` · `190:1497` 의 크레딧 이력 블록과 가격 블록은 트랙 폭을 채워야 하고(grid 자동 배치 열 — 모바일 가격 블록도 HUG → FILL 이다,
      (149) 정정. 적용 뒤 `190:1497` 가격 블록이 트랙 폭을 채우는지 스크린숏으로 본다), `/settings` 세그먼트 칸 세로는 (137)
      「세그먼트 칸 높이」가 적은 결과대로 확인한다. 남은 자리는 제품과 다르게 적용되므로 적용 승인 질문에 넣는다.

   **허브 보드 일곱(소유자 결정):** 이들을 다시 짓는 생성기가 없다. 2026-09-14 적용은 글자 · 면 override 가 속성 결합 뒤에도
   남는다는 것을 보였으므로 (가)의 글자 되채우기는 필요 없었다. 남는 결정은 3단계의 **높이 변화**를 받아들일지다 — (나) 제품
   표류 기록으로 두고 `--expect-change` 로 받는다, (다) 허브 보드를 다시 짓는 생성기가 서기 전까지 앱 셸 러너 적용을 미룬다.
   인스턴스를 분리(detach)하는 것은 사용자 자산을 바꾸므로 이 목록에 넣지 않는다.

   **2026-09-14(Updates 132) 뒤로 보드 러너는 세트 러너 뒤에만 돈다.** 치환 매처가 결과 · 체크아웃 본문 14 보드와
   `/mypage/upgrade` 두 보드의 요금제 카드를 인스턴스로 치환하게 되어, 세트 러너(컴포넌트 · 체크아웃 · 결제 장면 ·
   업그레이드 — 컬렉션 이전은 (133) 에서 끝났다)를 적용하기 전에 보드 러너를 돌리면 옛 절대배치 variant 가 보드에 심기고
   `/mypage/upgrade` 두 보드는 `Plan=Lite` 를 찾지 못해 던진다. 세트 러너가 막힌 채 보드부터 가야 한다면 그 16 보드를 미루고,
   미룬 동안의 대조는 `--expect-differ` 로 그 프레임을 이름으로 댄다.
   **`/mypage/upgrade` 데스크톱(`192:1251`)** 러너는 카드가 인스턴스가 되며 조각 하나(`00`)로 줄었다.
   미룬 동안에도 앱 셸 러너가 TEXT 속성을 열었으므로 그 보드의 상단 바 인스턴스(2026-09-13 라이브 `1231:9569`)는 기본
   라벨을 보이고 있을 수 있다 — 그 인스턴스 하나에만 `Parent=Subscription` · `Current=Change plan` 을 채운다.
2. `Product/Upgrade Plan Card` 세트를 제품 다섯 요금제로 — **러너와 매처는 2026-09-14 에 섰다(Updates 132).**
   upgrade-scene 러너가 세트를 제자리에서 reconcile 해 `Lite` · `Plus` · `Ultra` 를 더하고 `Trial` · `Pro` 를 다섯 요금제
   구조로 옮기며, 옛 `Plan=Basic` · `Plan=Max` 는 지우지 않고 보존한다. `CONTENT_COMPONENTS` 는 이제 upgrade-scene ·
   components · checkout-status plan 에서 읽는다(손 사본 없음). 컬렉션 이전과 페인트 감사도 (133) 에서 풀렸고, 헤더의 선물 구매
   버튼 면 · 글자를 Button secondary 레시피 변수로 칠한다. **남은 것은 적용이다**(1번 5단계).
3. **컬렉션 이전 — 다섯은 끝났다(2026-09-14, [Updates](../updates/README.md) (133)).** components · checkout-status ·
   payment-scenes · upgrade-scene · sidebar-states 생성기가 공용 헬퍼(`scripts/lib/figma-live-variables.mjs` · 렌더러 조각
   `scripts/templates/lib/figma-live-variables.js`)로 칠하는 자리마다 측정 색과 값이 같은 라이브 변수 역할을 고르고, 대조표를
   계획 `colorEvidence` 에 싣는다. sidebar-states 는 제품 개명을 따라 `Current=Composition` 을 쓰고(라이브에 없으면 지어 더한다),
   옛 `gnb/Current=VideoEditor · …` 인스턴스는 같은 노드를 바꿔 쓴다. 앱 화면 보드 렌더러도 라이브 컬렉션 · Light 모드로 옮겼다
   ((135)). **남은 것:** `/pricing` 러너(`product-pricing-page` — 아직 옛 컬렉션을 찾는다), 효과(그림자) 색의 변수 결합, 업그레이드
   알림 알약의 면 · 점(면 `media-scrim-dark` 48% 는 값이 같은 라이브 변수가 없어 고정 역할이 된다). 결제 장면(payment-scenes ·
   checkout-status · upgrade-scene)의 메인 서피스 컴포넌트 안 바 14(모바일 `407:1076` · `410:1380` · `422:2568`, 데스크톱 `406:687` ·
   `410:1294` · `417:2214`)는 2026-09-14 앱 셸 러너(옛 계획) 적용에서 기본 라벨로 바뀌어 손으로 되채웠다 — 이제 러너들이 route 측정
   글자로 채우고 바꾼 속성을 `topBarTextChanges` 로 돌려준다((135)).
4. **랜딩 `/` 전용 축은 짓지 않는다(2026-09-13 판정 — 소비자 0).** `migration/product.scenes.json` 의
   `pages.*["/"]` 를 읽는 코드는 측정기 자신의 `--check` 뿐이다 — 증거 로더(scripts/lib/product-scene-evidence.mjs(2026-10-06 은퇴))의
   유일한 호출자 scripts/build-figma-product-pricing-page.mjs(2026-10-06 은퇴) 는 `/pricing` 만 읽고(`:123`), 옛 전용 키
   (`nodeCanvasArticle` · `sections`)는 이력 전체에서 측정기와 생성물 밖에 나온 적이 없다(`git log --all -S
   nodeCanvasArticle` 세 커밋). Figma 생성기 중 랜딩 보드를 만드는 것은 없고 앱 화면 계획 36 보드에도 `/` 가
   없다. 라이브 `/` 보드 `359:2032` · `359:2986` 은 앵커 `a3ed8e03` 의 손 조립이라 생성기도 게이트도 읽지 않고,
   개편(`8802565e`) 전 랜딩을 그린다. 표면 원장의 소유자 판정(2026-09-03,
   `migration/product.surfaces.json` 의 `HomePageClient.tsx#LandingContent`)도 「아홉 섹션 조립 자체는 범위 밖」
   이고 세울 것은 `#final-cta` 밴드다. **다시 여는 조건:** 랜딩 보드를 만드는 생성기나 그 보드를 대조하는
   게이트가 계획으로 먼저 서고, 그것이 읽을 축을 이름으로 적을 때. 옛 `/` 보드를 어떻게 둘지(표류 표식 ·
   숨김 · 새 랜딩 재이식)는 소유자 결정이다.
5. **`ProgressRing` 마스터와 AppTopBar 후행 슬롯 표본(Figma 쓰기, 소유자 승인).** 기록은 32 · 내용 24 인데 라이브는 36 · 28 이라
   `verify-figma-parity`(verify:ci)가 빨갛다. 옮긴 뒤 두 컴포넌트의 되읽기를 다시 뜨고(`figma-readback-emit --components` ·
   `build-figma-snapshot`) 초록이면 `progress.figma` 를 `done` 으로, `check-coverage-targets` 의 `MANIFEST_DONE_FLOOR` 를 되올린다.
   **이것 전에는 앵커 이동을 푸시하지 않는다**([Updates](../updates/README.md) (131)).
6. **크기 굳힘 감사의 남은 묶음 4~11.** 묶음 1~3 은 2026-09-14 에 고쳤고 규칙은 조립 규칙 28번이다. 남은 것(권장 순):
   - 4 — Gnb 사이드바 세트(메뉴 · CTA · 셸 · 접힌 레일): 측정 rect 로 FIXED 한 행 · 목록 · CTA 와 합산 리터럴. 묶음 1 과 같은
     sidebar-states 렌더러를 만지므로 그 뒤다.
   - 6 — 앱 화면 보드 판정기(`sizing-provenance` · `figma-tree-spec` · 렌더러): 뷰포트 단위를 치환된 입력으로 판정, 글자 + 면 잎의
     HUG 누락, 줄바꿈 텍스트를 한 줄로 폄, 논리 크기 속성 미수집, 부분 % 가 조용히 FIXED. 36 보드 재적용이 따른다.
     **2026-09-15 에 셋을 닫았다((137))** — 논리 크기 속성 수집(측정기 · auth fixture 재측정, 세그먼트 칸 세로 12), 한 열 grid 의 트랙
     순번(`gridAutoPlacementColumn`, 크레딧 이력 블록 4) — 래칫 28 → 12 — 과 세그먼트 제외 판정(bespoke → blocked, 사유를 제품 인용으로).
     **남은 것:** 레시피 원장 probe `segmented-track` · `segmented-segment` 를 쓰이지 않는 `myPageSceneStyles.ts` 상수에서 `SegmentedToggle`
     의 레시피 클래스 마크업으로 옮기고 `LOUIS_PRIMITIVE_SITES` 에 자리를 세우는 일(원장 재측정 — 막힘 4 가 replaceable 로 간다), 래칫에 남은
     12(설정 모바일 Button 인스턴스 5 · 구독 데스크톱 본문 section 1 · 글자가 폭을 정하는 stretch 6), 뷰포트 단위 · 글자 + 면 잎 HUG · 줄바꿈 ·
     부분 %.
   - 7 — 인벤토리 선언 판정 정규식(`w-full` 이 `max-w-full` 안에서도 걸리는 류)과 absolute 고정.
   - 8 — DS · Components 세트의 hug 축 FIXED(SidebarCta · Dialog sheet · Segmented · Tab · NodeChip · Keycap · Tooltip ·
     FormMessage · InspectorRow)와 `figma/components.measured.json` 의 「패딩 + 한 줄」 높이. 기록 · parity 계약 · Figma 를
     같은 변경 단위에서 옮긴다. SidebarCta 는 2026-09-14 읽기 전용으로 확인했다 — `Collapsed=false` variant 가 세로 FIXED 40 ·
     라벨 `TRUNCATE` 라 줄 높이가 최소를 넘기는 코드 · 제품과 갈리고, 기록 칸도 최소값이라 parity 는 초록이다
     ([App Shell Parts](../components/app-shell-parts.md) Known deviations, [Updates](../updates/README.md) (134)). 같은 읽기에서
     `Collapsed=true` variant 의 폭이 74(가로 AUTO)로 나와 되읽기(2026-09-07)의 32 와 달랐다 — 같은 시간에 다른 워크플로가
     DS · Components 에 쓰고 있었으므로, 이 묶음에 들어갈 때 되읽기를 다시 떠서 확인한다.
   - 9 — NONE 루트 안 겹침 레이어의 constraints 와 비율(BannerCarousel · VideoPlayer · TransformFrame · ProjectCard 띠 ·
     StepTile), project-card 문서의 조건 없는 불변식.
   - 10 — news-card · media-card 문서의 계산값 사실 서술.
   - 5 — `/pricing` DOM 캡처 평탄화. 증거 스냅숏과 재사용 컴포넌트를 가르는 Decision 이 먼저다.
   - 11 — 고아 생성기 build-figma-ds-library.mjs · figma/run-ds-library.js 은퇴(실행하면 페이지를 통째로 지운다).
     **2026-10-06 걷었다** — 되살릴 때는 `3d3c20ea` 에서 꺼낸다.
   감사의 docs 갈래 출력은 중간에서 잘려 받지 못한 발견이 있다 — 묶음 10 에 들어가기 전에 그 갈래를 다시 돈다.
7. `execution-handoff.md` 의 큐(`DS-P3-001` owner 확인 · `DS-P3-014` 토큰 커버리지)로 돌아간다.

### 2026-08-24 기록

1. 새 GNB/topbar master를 page-03의 모든 app screen에 route별 instance로 교체한다. duplicated sidebar/header는
   삭제하지 말고 먼저 숨겨 보존하며, route current state와 breadcrumb를 제품 fixture에서 확인한다.
   사용자는 이 장기 작업 범위의 안전한 Figma/저장소 작업을 사전 승인했다. 제품 저장소 쓰기, publish,
   사용자 자산 삭제처럼 범위를 넓히는 작업은 여전히 하지 않는다.
2. `/docs`에 값이 생성물에 없으면 capture 결과를 근거처럼 쓰지 말고 먼저
   `scripts/measure-product-scenes.mjs` 또는 route 전용 probe에 축을 추가한다.
3. 화면 이름에 route, viewport, pinned product, editable을 명시하고 임시 reference frame은 검증 후 삭제한다.
4. `/pricing`의 반복 UI를 성급히 DS 규범 component로 승격하지 않는다. 먼저 네 tier card와 FAQ가 다른
   route에서도 반복되는지 route inventory에서 확인한다.
5. video editor authenticated fixture와 analytics connected-state fixture를 만든 뒤 내부 콘텐츠의 browser/Figma
   좌표 비교를 추가한다. 그 다음 공개 `/docs` shell과 반복 docs detail shell로 돌아간다.
6. 미측정 27개 pattern 중 16개 static route의 개발 인증 fixture 기본 상태는 측정됐다. 다음은
   archive populated state, billing 성공 state, analytics 연결 state처럼 API success fixture를 route별로
   정의한다. 다섯 dynamic project route와 admin은 운영 인증·권한 fixture가 없으므로 완료 처리하지 않는다.
7. 화면 coverage가 쌓이면 반복 후보를 Figma component/variant로 묶고, 측정 근거가 있는 값만
   `figma/components.measured.json` 또는 관련 normative spec으로 승격한다.

## 검증 기준선

**수를 여기 적지 않는다.** 게이트 수·leaf 수·앵커 커밋은 적는 순간부터 낡는다(아래 기록의
「22개 leaf」·「CI형 게이트 14개 중 13개」·`a3ed8e03` 이 전부 그렇게 낡았다). 지금 기준은 명령이 낸다.

- 앵커: `migration/product-evidence.lock.json` 의 `productCommit`.
- 게이트 수: `package.json` 의 `verify:ci` · `verify:product`.
- 커밋 전: `pnpm build` · `pnpm check` · `pnpm verify` · `pnpm test` · `git diff --check`.
  커밋 뒤 푸시 전: `pnpm clean-room`. 절차의 정본은 `execution-handoff.md` 6절이다.
- `pnpm verify` 를 `&&` 체인으로만 돌리면 첫 실패 뒤가 가려진다. 원인을 좁힐 때는 두 갈래의
  게이트를 하나씩 돌려 각자의 종료코드를 본다. 백그라운드로 돌릴 때 `| tail` 로 파이프하면
  종료코드가 `tail` 의 것이 되고 출력이 끝까지 버퍼링된다.

### 2026-08-24 기준 (기록)


- `verify-product-scenes`: clean pinned standalone에서 scene/staticHighlightDemo 2문맥×32노드와
  public/pricing page 측정 `--check` 통과 @ `a3ed8e03`.
- `verify-product-auth-fixture`: outline 4축과 `pseudoElementProbes.profileRing`을 포함해 16 routes ×
  2 viewport 전체 생성 직후 `--check` 통과 @ `a3ed8e03`.
- 로컬 `verify:product` 기준은 22개 leaf다. 이번 변경의 `verify-gates`는 positive 4 + failure canary 36을
  byte-for-byte 복원했고, product render 33변수×4문맥, components 73탐침/240축, variants 95표본,
  specimen context 95표본, 일곱 Figma 생성 check, tailwind interop까지 포함한다. Chromium leaf는 macOS
  sandbox Mach port 제한 때문에 승인된 sandbox 밖에서 실행했고, scenes/auth는
  `KLIPSE_PRODUCT_BUILD_ROOT=/private/tmp/klipse-web-measure.528RlU/repo`를 명시했다.
- `pnpm run` 래퍼는 workspace 의존성 상태를 보고 `node_modules` 제거/재설치를 요구했으나 TTY가 없어
  `[ERR_PNPM_ABORTED_REMOVE_MODULES_DIR_NO_TTY]`에서 멈췄다. 사용자 의존성을 변경하지 않고 package.json의
  같은 Node entrypoint를 직접 실행했다. 제품/Figma 게이트 실패가 아니다.
- fixture outline 축 때문에 바뀐 반복 subtree hash는 같은 root·nodeCount·routeCount를 대조한 뒤
  product-components/app-shell/payment-scenes 생성기에 갱신했다. inventory·components·app-shell·payment·
  checkout·upgrade·pricing 일곱 Figma 생성 check와 design docs 92개·LLM 5개·Figma summary 26개 check가 통과했다.
- product-scenes를 새 clean pinned standalone로 다시 만들 때 StaticHighlightDemo desktop wordmark 폭이
  이전 기록 187.9999에서 실측 188.25로 0.2501px 달랐다. 같은 build로 생성한 뒤 즉시 `--check`를
  다시 실행해 2문맥·32노드가 전량 재현됨을 확인했다. 추측 보정이 아니라 현재 build 측정으로 갱신했다.
- pinned standalone은 `/private/tmp/klipse-web-measure.528RlU/repo`에서 Next 16.1.5 webpack build로
  생성했고 release commit·BUILD_ID·required-server-files·source map 원문을 scenes 게이트가 검증했다.
  temp checkout은 소스 기준 clean이며 `.next/static`과 `public`만 배포형 standalone에 복사했다.
- CI형 게이트 14개 중 13개는 직접 통과했다. consumer도 SSR/tree-shaking까지 통과했으나 아래
  `npm pack --dry-run` 3건만 런타임 실행 파일 부재로 완료하지 못했다.
- consumer gate: SSR과 tree-shaking 통과. 현재 Codex runtime에 `npm` 실행 파일이 없어 마지막
  `npm pack --dry-run` 3건만 환경상 실행하지 못했다.
- `pnpm build` wrapper는 공급망 정책이 `esbuild@0.28.2` install script를 승인하지 않아 중단됐다.
  정책을 완화하지 않았고, package.json의 실제 build/check 명령은 직접 실행해 통과했다.
- `git diff --check`: 통과
- 제품 working repo HEAD/status: `5103ffeb`, clean. 이 저장소는 pinned 기준보다 앞서 있으므로 제품 근거로
  working tree를 읽지 않는다. 이번 Figma/측정 근거는 모두 `git show`/`git grep`의 pinned
  `a3ed8e031214f67ac319c5ceaa7ad2808cf0d3a4` 또는 clean fixture
  `/private/tmp/klipse-web-measure.528RlU/repo`에서 얻었다.
- DS worktree는 의도적으로 dirty다. 새 upgrade/app-shell/payment/checkout generated plan·runner와 generator·
  renderer는 아직 untracked이며 커밋하지 않았다. figma/run-ds-library.js(2026-10-06 은퇴), `figma/run-full-figma-sync.js`,
  scripts/build-figma-ds-library.mjs(2026-10-06 은퇴), `scripts/build-figma-full-runner.mjs`,
  `scripts/figma-live-bridge.mjs`, `scripts/figma-live-daemon.mjs`는 사용자 소유 untracked 파일이므로 보존한다.

## 한도 종료 직전 체크리스트

1. 이 문서의 완료 프레임 ID, 진행 중 route, 마지막 측정 commit과 검증 결과를 갱신한다.
2. `git status --short`와 `git diff --check`를 기록한다.
3. 실행 중 localhost server를 종료하고 임시 browser viewport를 reset한다.
4. 제품 repo가 clean인지 확인한다.
5. 다음 에이전트에게 이 문서를 첫 진입점으로 지정한다.
