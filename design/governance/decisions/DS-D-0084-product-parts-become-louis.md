---
id: decision-product-parts-become-louis
status: experimental
authority: normative
---

# DS-D-0084 제품에 보이는 부품은 LOUIS 부품으로 올린다 — 첫 건 노드 생성 버튼

- Status: accepted (소유자 지시, 2026-10-12 저녁)
- Date: 2026-10-13
- Owners: repository owner, design system maintainer
- Affects: `node-shell`, `decision-deck-feedback-triage`, `governance-figma-screen-assembly`

## Context

2026-10-12 저녁 소유자가 Figma 의 노드 생성 버튼이 제품과 다르다고 짚었다. 고치고 보니 그 버튼은 **Figma 보드(제품 측정 재현)에만
있고 LOUIS 에는 없었다** — `node-shell` 은 버튼이 서는 자리(`__generate`)만 갖고, 문서는 「생성 버튼은 제품 콘텐츠다」라고 적고 있었다.
덱 키트처럼 LOUIS 부품만으로 화면을 짓는 쪽은 이 버튼을 쓸 수 없다.

그 보고에 소유자가 「제품의 모든걸 LOUIS 부품으로 올려야 맞지」, 「제품에 보이는 부품들을 LOUIS 부품으로 하는 게 맞지? LOUIS 에 더한다는
의미」라고 했다.

지금까지의 기본값은 그 반대였다.

- 2026-09-26 결정(Figma 먼저 · 생성기로 묶어서): 제품 전용 부품은 Figma 제품 컴포넌트(`Product/…`)로 세우고, LOUIS 코드는 제품이 그
  정본을 실제로 쓰게 될 때 따라간다.
- [DS-D-0083](DS-D-0083-deck-feedback-triage.md) 은 22건 가운데 일곱을 (다) 「화면 고유로 둔다」로 판정했다.
- 저장소 규칙(CLAUDE.md) 「제품 전용 화면 코드와 과거 UI 부채를 공용 규범으로 복사하지 않는다」.

## Decision

1. **제품에 보이는 부품은 LOUIS 부품으로 올리는 것이 기본이다.** 「LOUIS 에 더한다」는 레시피(`louis-…` 클래스) · 필요한 시맨틱 토큰 ·
   문서 · Figma 디자인 시스템 부품을 갖춘다는 뜻이다. Figma 보드의 측정 재현은 등록이 아니다.
2. **예외는 부품이 될 수 없는 것뿐이다** — 데이터에서 좌표를 내는 차트 경로처럼 화면이 계산하는 것. 예외는 사유를 문서에 적는다.
3. **화면 코드를 복사하는 것이 아니다.** 같은 조형을 여러 화면이 쓰면 한 부품으로 추상화하고, 대비 미달 같은 부채는 고쳐서 올린다.
   CLAUDE.md 의 규칙은 이 뜻으로 고쳐 쓴다.
4. **DS-D-0083 의 (다) 일곱은 다시 판정한다** — 2b 하이라이트 트랙 · 무대 아래 막대, 2c AI 프롬프트 후보 카드, 2d-2 소스 썸네일 줄,
   2d-3 「편집」 버튼, 2d-4 채널 줄 · 예약 버튼, 2f 차트 점 바닥(곡선 경로는 예외로 남는다), 3c 업로드 무대. 각각 (가)로 옮겨 순서대로 올린다.
5. **진행은 묶어서 한다.** 표면 원장(`migration/product.surfaces.json`)의 「필요」 목록에서 뽑아 생성기로 묶는다 — 한 건씩 손으로 하지 않는다.

### 첫 건 — 노드 생성 버튼(`.louis-node-shell__generate-button`)

제품 정본 `NodePromptGenerateButton`(노드 다섯 · Creative Media). Button 의 변형이 아니라 node-shell 하위 부품이다 — 소유자가 고른 안이고,
primary 의 빛(위아래 1px, DS-D-0066)과 모양이 다르며 라벨 대신 별과 후행 슬롯을 갖기 때문이다.

| 부분 | 값 | 근거 |
| --- | --- | --- |
| 면 | 가로 그라디언트 `node-generate-surface-edge`(blue-450) → `-center`(blue-500) → edge | 제품 `--node-prompt-generate-gradient` |
| 안쪽 빛 | `::before` 에 `inset 0 0 8px 0` `node-generate-foreground` + `mix-blend-mode: overlay` | 제품 `OVERLAY_STROKE` |
| 상자 | 높이 · 최소 폭 32, 좌우 8, 반경 `radius-control` | 제품 `h-16 min-w-16 px-4` · `--button-radius` |
| 별 | 14 × 14, `node-generate-foreground` | Phosphor Sparkle fill `size={14}` |
| 후행 슬롯 | body-sm-regular, `node-generate-trailing`(blue-100), 숫자 고정폭 | 제품 `TRAILING` |
| 상태 | hover `brightness(1.06)`(호버 기기만), 누름 `scale 0.95`, 비활성 `opacity 0.35` | 제품 `CHROME` · `PROMPT_SUBMIT_FAB_DIMMED` |

**그라디언트는 토큰 형식을 새로 만들지 않는다.** 끝 색과 가운데 색을 시맨틱 둘로 세우고 레시피가 `linear-gradient` 로 조합한다 — 제품이
「gradient 토큰 타입이 없어서」 승격을 미뤘던 자리가 이것으로 풀린다.

## Consequences

- 새 시맨틱 넷(`node-generate-surface-edge` · `-surface-center` · `-foreground` · `-trailing`, 두 mode 같은 값). Figma 변수는 다음 동기화.
- Figma DS 부품 `NodeGenerateButton`(State Default · Disabled · Loading, TEXT Trailing)을 같은 날 세웠고 `NodeComposer` 의 Generate 자리를
  그 인스턴스로 바꿨다. 기록 `node-generate-button` · parity 계약 · 레시피 대조 · 실브라우저 시험 셋이 함께 섰다.
- 제품 (나): `NodePromptGenerateButton` 이 이 클래스를 물면 `CHROME` · `OVERLAY_STROKE` · `TRAILING` 상수와 소비처의 `opacity-[0.35]` 덮어쓰기를 지운다.
  같은 빛을 `::before/::after` 로 복사한 BgmNode · EditNode · ImageNode · InstagramNode 의 다른 버튼은 각자 부품으로 올릴 때 이 빛을 공유한다.

## 승격 목록(2026-10-13 조사)

표면 원장의 Figma 제품 세트 30종과 needed 의 부품 60 · 한 자리 18 · 판단 대기 1, DS-D-0083 (다) 일곱을 넷으로 갈랐다(조사 원문은
작업 폴더 `scratchpad/promote/` — A · B1 · B2).

| 판정 | 수 | 처리 |
| --- | ---: | --- |
| 이미 LOUIS 부품이 있다 | 33 | 표면 원장 대응을 LOUIS 이름으로 옮겼다(같은 날, 표면 35). 제품이 그 클래스를 무는 일은 제품 (나) 목록 |
| 기존 부품의 변형 · 하위 부품 | 36 | 축 하나씩 더하는 변형 묶음(Select lg · Tabs 활성 막대 · Section Header 단 · Choice Card list 등)과 node-shell 하위 부품(썸네일 줄 · 응답 칸 · 미디어 칸 · 채널 줄 · 크기 손잡이 · 글자 생성 버튼). video-player 크롬 레시피 · 볼륨(B2 #60) · YouTube 미리보기(B2 O19)는 섰다((250) — 아래 기본값 표) |
| 새 부품 | 약 21 | 작은 것: color-swatch(섰다, (251)) · logo-tile(섰다, (251)) · notice-pill(섰다, (251)) · media-slot(섰다, (245); 예시 갤러리 칸 `fill` 2:3 은 (251)) · prompt-variant(섰다, (248)) · asset-tile(섰다, (251)) · canvas-guide(섰다, (251)) · audio-cell(섰다, (245)). 작은 것은 모두 섰다 — 아래 기본값 표. 큰 것(각각 Decision 먼저): plan-comparison · timeline · coverflow · date-picker · color-picker · segment-track(섰다, (249) — Decision 대신 아래 기본값 표) · chat-panel · command-palette · lightbox(섰다, (252) · DS-D-0086) · content-card · plan-tier-card · channel-header(섰다, (253) · DS-D-0087) · canvas-section |
| 부품이 아니다 | 19 | 아이콘 세트로(글리프 넷 · 레이아웃 썸네일 — sparkle 1 · 모바일 동작 글리프 15 가 새로 필요), 화면 조립, 데이터 계산 경로(스파크라인 · 차트 곡선) |

소유자 판정 둘: 어드민 섹션 머리의 촘촘한 값 넷(간격 · 정렬 · 제목 28 · 설명 14 Regular)을 LOUIS compact 칸으로 열지, 제품 덮어쓰기를
지울지. 어드민 통계 타일의 칸 격자 덮어쓰기도 같은 질문이다. **2026-10-13 소유자: 어드민 작업(`feat/admin-ops-review`, 통합 판에 든 로컬 작업 브랜치)이 끝난 뒤 정한다** — 덮어쓰기 자체는 2026-09-22 부터 dev 에 있다(`45a50199a`). 그때까지 어드민 항목은 보류하고 노드 캔버스부터 올린다(소유자가 고른 순서). `canvas-edge` 의 「레시피를 세우지 않는다」(DS-D-0061)는 이 결정으로 다시 판정한다.

## 노드 캔버스 묶음에서 기본값으로 정한 판단(2026-10-13)

초안(`scratchpad/promote/node-parts-1.md` · `-2.md`, 작업 폴더)이 남긴 판단 거리 가운데 아래는 방침(3항 「부채는 고쳐서 올린다」)과 기존 규칙을 따라
기본값으로 정해 넣었다. 소유자가 뒤집으면 해당 레시피 · 토큰 한 곳을 고친다.

| 판단 | 기본값 | 대안 |
| --- | --- | --- |
| 복사 버튼 잉크 · 비활성 | md 와 같은 `fg-secondary` · 불투명도 0.35 | 제품 `palette-gray-500`(다크 2.91:1) · 잉크 바꾸기 |
| 28 버튼 이름 | `data-size="sm"` · Figma `Size=sm` | 쓰임새 이름 `prompt`(컨트롤 사다리 sm 은 24) |
| 「복사됨」 | 글리프 교체(Figma 축 없음) | 조건 축 `Copied` |
| 썸네일 줄 자리 | 새 부품 `media-slot` + `.louis-media-slot-strip` | `node-shell__attachments` |
| 편집 노드 소스 28 칸 · 줄 간격 6 · 9 · 반경 14 | 32 · 4 · 8 · 12 로 접음 | 제품 값 그대로 칸마다 |
| 응답 칸 생성 중 쉬머 | `loading-word` | 제품의 밝은 띠(새 모션) |
| 결과 글 · 생성 중 캡션 · 인스타 채널 글 · 크기 손잡이 그립 라이트 잉크 | 대비를 고친 값 | 제품 값 |
| 응답 상태의 Figma 축 | `Layout`(empty · generating · filled · error) | CSS 를 `data-layout` 으로 · 새 축 |
| 오디오 대기 게이지 · 미디어 비율 전환 | 소비처 값 · 기존 `motion-layout-change` | 새 모션 토큰 둘 |
| 저작 게이트 | 시맨틱 `color-gray-000-alpha-*` 를 연다 | 빈 칸 토큰 다섯 |

## 변형 묶음에서 기본값으로 정한 판단(2026-10-13)

기존 부품의 변형 20개(Updates (247))도 같은 방식이다. 작은 편차는 LOUIS 로 접고 제품 쪽 고침은 (나)로 넘긴다.

| 판단 | 기본값 | 대안 |
| --- | --- | --- |
| 문의 화면 48 높이 | Select lg 는 40, 48 칸을 열지 않는다 | TextField · Select 에 48 칸 |
| lg 캐럿 · 빈 값 잉크 | 캐럿 12 · `fg-tertiary` | 제품 10 · 48%/56% |
| 템플릿 상세 부제 | 글 머리 리드(body-lg)로 접음 | body-14 칸을 따로 |
| 랜딩 제목 계단 | 레시피 지역 변수(출처 주석) | `landing-shell` 의 반응형 타이포 토큰 |
| 줄 목록 선 · 표식 | 헤어라인 · LOUIS 표식 값 | 제품 선 · 반경 4 · 1.5px |
| 캔버스 상단 바 흐림 | LOUIS 헤더 띠(12 · 직선) | 제품 곡선에 새 마스크 이름 |
| 툴 버튼 잉크 · 이름 | `fg-secondary` · 켜짐 호버 12% · `fg-disabled`, `floating-shell__item` 하나 | 제품 값 · `canvas-tool-button` 따로 |
| 끄는 중 · 첨부 지우기 | Drop Zone 안쪽 링 · Media Slot 22 안쪽 | 제품 바깥 outline |
| 조정 강조 · 양방향 링 | 라이트 yellow-700 · conic 한 겹 | 제품 yellow-500 · SVG 계약 |
| 모션 메타 | `motion-tab-select` 에 translate 만. scale · 크기는 lifecycle 규칙이 막아 전이로 둔다 | lifecycle 을 고쳐 연다 |
| 차트 점 · 미디어 위 점 | `gray-000-alpha-12` 로 접음 | `color-canvas-dot-on-media` |
| 넓은 대화 | `data-size="compare"` · 반경 유도값 20 | `xlarge` · 24 |
| 미룬 것 | 라이트박스 버튼(`lightbox` 회차 — 섰다, (252) · DS-D-0086 하위 부품 `__action`) · 타임라인 푸터 · canvas-edge 삭제 · 플레이어 볼륨(섰다, (250)) · stat-tile cell(어드민 뒤) | — |

## segment-track 에서 기본값으로 정한 판단(2026-10-13)

하이라이트 트랙 · 무대 아래 막대(Updates (249), DS-D-0083 2b)는 「큰 것(Decision 먼저)」이었으나, 초안(`scratchpad/promote/segment-track.md`,
작업 폴더)이 남긴 소유자 판정 여덟을 소유자 지시로 초안의 기본값으로 정했다. 뒤집으면 레시피 · 토큰 한 곳을 고친다.

| 판단 | 기본값 | 대안 |
| --- | --- | --- |
| 기하의 소유 | 소비처가 변수 일곱(`--louis-segment-track-*`)으로 준다. React 표면은 두 번째 화면(편집기 타임라인)이 붙을 때 | React `SegmentTrack` 이 시각 → 위치 계산까지 소유 |
| 이름과 범위 | `segment-track` + 시맨틱 `segment-track-clip-*` | `timeline-track` + `timeline-clip-*` 로 열어 컴포지션 오디오 클립(pink)을 `data-tone` 으로 함께 |
| 촘촘한 판의 경계 | 소비처가 `data-layout="compact"` 를 단다 | 레시피에 화면 폭 900 미디어 쿼리 · 트랙 폭 컨테이너 쿼리 |
| 칸 경계 · 지도 막대 그래픽 대비(1.38~3.01) | 제품 값 그대로 + Known deviation(상태는 글자 · 선 모양 · 접근 이름이 말한다) | 라이트 선을 `blue-500` 으로(다음 추출 · 숏폼과 겹친다) |
| 무대 아래 막대의 형태 | 같은 파일의 짝 블록 `.louis-stage-bar` | 문서 스니펫만(제품 상수 유지) · 독립 컴포넌트 `stage-bar` |
| 실패 줄 잉크 | `fg-danger-on-surface`(6.34 · 6.43) — 보이는 변화 | 제품 `fg-danger`(14.27 · 14.49, 위험으로 읽히지 않는다) |
| 칸 상태 속성 | `data-look` 하나(candidate · selected · clip · short) | 제품처럼 `data-included` + `data-state` |
| 숏폼 칸 글자 3.37 | Button primary 의 소유자 수용 편차를 따른다 | 이 칸만 다른 짝 |

## video-player 에서 기본값으로 정한 판단(2026-10-13)

비디오 플레이어 크롬(Updates (250), DS-D-0083 2a)은 기존 컴포넌트라 새 Decision 이 필요 없었고, 초안(`scratchpad/promote/video-player.md`,
작업 폴더)이 남긴 막힘 셋(아래 1 · 3 · 4)과 소유자 판정 열넷을 소유자 지시로 초안의 기본값으로 정했다. 뒤집으면 레시피 · 토큰 한 곳을 고친다.

| 판단 | 기본값 | 대안 |
| --- | --- | --- |
| 1 hover 시맨틱(막힘) | 새 `media-control-surface-hover` = `static-black-alpha-40`, 틴트를 진하게(시간 글자 4.85 → 5.77) | 기존 `media-control-hover`(흰 12% 로 갈아 끼움, 2.78) · hover 없음 |
| 2 bright 유리 틴트 | 두 톤 모두 `media-control-surface`(`#171b22`)로 접음(채널당 ≤ 9.5/255) | `-surface-bright` · `-hover-bright`(순검정 28 · 40) 두 칸 |
| 3 유리 칩 소유(막힘) | 플레이어 소유 `__chip` + 밖에서는 `data-standalone`(앵커에서 밖 소비처 0) | 별개 부품(`media-chip` · IconButton 미디어 변형) · 소비처마다 값 |
| 4 흐림 2px(막힘) | 원시 `blur.2` + 역할 `blur-media-control`(뒤를 남기는 얕은 흐림, 사다리의 새 단이 아니다) | `blur-surface`(10)로 접기 · 흐림 없음 |
| 5 하이라이트 크게 보기 버튼(36 알약 · 검정 56%) | `__chip[data-standalone]`(32 · 12 · 28%)로 접음 — 제품 (나) | 별개로 둔다(IconButton 미디어 변형 판정과 함께) |
| 6 다운로드 버튼 면 | 칩 유리로 접음 — 보이는 변화 | 제품 값(검정 32% · 흰 80% · `brightness(125%)`)에 시맨틱 둘 |
| 7 크게 보기 모달의 틀 | Dialog 배경막(`dim-modal`) + 닫기 `__chip[data-standalone]` — 배경이 조금 더 어두워진다 | 제품 값(`gray-900/48%` · 닫기 36 원)을 레시피 `__expand` 로 |
| 8 모션 | 240 → `content-fade` · 120/140/160 → `control-hover` · 흐림 520 + 60 지연 → `content-rise` | 제품 ms 리터럴 |
| 9 React 표면 | 이번에는 CSS 만 — 제품 `VideoPlayer` 가 클래스를 입는다(web `partial`) | `packages/react` 에 `VideoPlayer` 를 함께 |
| 10 터치에서 진행 막대 펼침 | `:active` 로 누르는 동안 펼침 + 호버는 호버 기기만 | 호버 기기에서만(터치에서 썸이 영영 안 보인다) |
| 11 스크림 | 옮기지 않는다(켜는 분기 없음) — 제품에서 지운다 | `__scrim` 을 남긴다 |
| 12 YouTube 판을 LOUIS 에 | `data-platform="youtube"` 변형(장식 · 키 부채를 함께 고친다) | 화면에 둔다(플랫폼 재현은 부품이 아니다) |
| 13 플랫폼 빨강 | 원시 `youtube-red`(`#ff0033`) + 시맨틱 `platform-youtube-accent` · 레일 `platform-youtube-rail`(`static-black-alpha-56`) | `red-500`(`#ff4b59`)로 접기 |
| 14 축 이름 | `data-platform` | B2 의 `data-chrome="youtube"`(`Chrome` 은 표시 상태의 이름이다) |

초안이 남긴 작은 판단 하나도 기본값을 벗어났다 — YouTube 판의 받은 분 변수 `--louis-video-player-buffer` 는 `var(…, 0)` 폴백 대신
저작 규칙(지역 커스텀 속성은 루트에 선언)을 따라 루트에 선언했다.

## 작은 새 부품에서 기본값으로 정한 판단(2026-10-13)

작은 새 부품 다섯(asset-tile · color-swatch · logo-tile · notice-pill · canvas-guide)과 예시 갤러리 칸(Updates (251))은 초안
(`scratchpad/promote/small-parts.md`, 작업 폴더)이 남긴 소유자 판정 열다섯을 소유자 지시로 초안의 기본값으로 정했다. 뒤집으면 레시피 · 토큰 한 곳을 고친다.

| 판단 | 기본값 | 대안 |
| --- | --- | --- |
| 1 예시 갤러리 칸의 자리 | `media-slot[data-size="fill"][data-ratio="2:3"]` 변형 — 누를 수 없고 그림이 `cover` 로 칸을 덮는다 | B2 대로 `asset-tile` 의 글 없는 판 |
| 2 `asset-tile` 을 지금 세울지 | 소비처 1 이어도 지금(소비처 수는 승격 조건이 아니다, 2026-10-12 소유자) | 둘째 소비처가 생길 때까지 제품 상수 |
| 3 스티커 우물 색 | 두 테마 같은 `palette-gray-600` 40%(새 시맨틱 `asset-tile-well`) — 라이트 흰 에셋 2.06 은 Known deviation | 라이트만 더 진하게(테마별 값) |
| 4 `asset-tile` 작은 값 | 호버 면 10 → 08 · 라벨 72% → `fg-secondary` · 120 → 160ms, 격자 6 · 우물 반경 4 · 그림 안쪽 2 는 리터럴 | 전부 제품 값 |
| 5 색 칩 크기 · 경계 | md 32 · 8 · sm 16 · 4, 경계 `stroke-strong`(4.43 · 3.74) — 어드민 칩 테두리가 진해진다 | 화면마다 제품 값(30/6 · 32/8, `stroke-control` 1.27 · 1.63) |
| 6 색 칩 지우기 히트 | 보이는 원 16 + 누르는 자리 24(WCAG 2.5.8 AA) | 제품 15 그대로 · `.louis-hit-target` 44(칩을 덮는다) |
| 7 어드민 소비처 | 부품은 지금(근거는 하이라이트 패널 · 랜딩 히어로), 어드민 제품 (나)만 `feat/admin-ops-review` 뒤 | 부품도 그때까지 보류 |
| 8 로고 칸 반경 · 면 | 반경 모두 12(`radius-card`) · 면 4% | 제품 md 반경 10(리터럴) · 5% |
| 9 로고 칸의 자리 | 새 부품 `logo-tile` | `avatar[data-shape="square"]`(사람 표식 계약이 깨진다) |
| 10 공지 알약 스크림 | 쉼 56% · 호버 72% — 흰 프레임 위 글자 4.73 · 8.85(실측), 알약이 한 단 어두워진다 | 제품 48% · 64% |
| 11 공지 알약의 자리 | 새 부품 `notice-pill` | `badge[data-surface="glass"]`(「대화형이 아니다」 계약이 깨진다) |
| 12 알약의 누름 표시 | 요소가 말한다(`a[href]` · `button` 이면 커서 · 호버). Figma 는 `Interactive` 축 | `data-interactive` 속성 |
| 13 스냅 선 색 | 새 시맨틱 `canvas-guide` = 라이트 `pink-600` · 다크 `pink-500`(바닥 3.78 · 6.01, 카드 4.02 · 5.48 실측) | `red-600` · `red-500`(위험의 뜻) · `#ff2d55` 를 새 원시로 |
| 14 스냅 선 두께 | 줌과 무관하게 화면 1px(`non-scaling-stroke`) | 제품대로 캔버스 1(줌 50% 에서 0.5px) |
| 15 스냅 선의 자리 | 컴포넌트 `canvas-guide` | `editor-workspace` 패턴 안 블록 |

## Rollback

생성 버튼 규칙과 시맨틱 넷을 지우면 이전과 같다(쓰는 소비처가 아직 없다). video-player 레시피와 새 토큰 일곱도 같다 — 제품이 클래스를 입기 전에는 소비처가 없다. 작은 새 부품 다섯 · 예시 갤러리 칸 변형 · 새 시맨틱 셋(`asset-tile-well` · `notice-pill-dot` · `canvas-guide`)도 같다. 방침(1~5)은 소유자 지시라 되돌리지 않는다.
