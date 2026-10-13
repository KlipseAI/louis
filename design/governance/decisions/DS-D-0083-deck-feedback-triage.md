---
id: decision-deck-feedback-triage
status: experimental
authority: normative
---

# DS-D-0083 덱 키트 피드백 22건 분류 — LOUIS 에 더할 것, 제품이 돌아올 것, 화면에 둘 것

- Status: accepted (2026-10-12, 덱 키트 요청에 대한 판정)
- Date: 2026-10-12
- Owners: repository owner, design system maintainer
- Affects: `badge`, `project-card`, `section-header`, `node-shell`, `node-side-handle`, `segmented-control`,
  `chart-card`, `stat-tile`, `drop-zone`, `video-player`, `foundation-color-theme`

## Context

덱 키트(`~/klipse-deck-kit`)는 제품 화면을 캡처 대신 LOUIS 부품으로 짓는다. 값을 덮어쓰지 않고 지으려다 막힌 자리
22곳을 `docs/DESIGN-FEEDBACK.md` §1.15 에 적어 보냈다. 각 자리를 셋 중 하나로 판정한다.

- (가) LOUIS 에 변형이나 부품을 더한다.
- (나) 제품이 LOUIS 기본으로 돌아간다 — 제품 수정 목록으로 간다.
- (다) 화면 고유로 둔다 — 이유를 여기 적는다.

조사는 읽기 전용으로 셋으로 나눠 했다. 제품 기준은 klipse-web `origin/main` = `5d96d101c`, LOUIS 기준은 이 저장소
`7053c42d` 이다. 제품 인용의 명령은 `git -C <klipse-web> show origin/main:<경로> | cat -n` 이고(경로는 웹 앱 폴더 기준) 줄 번호는 그 출력이다.
아래 약칭은 `HS` = 웹 앱의 `components/scenes/HighlightScene.tsx`, `HSS` = 같은 폴더의 `highlightSceneStyles.ts`,
`AHS` = `appHomeSceneStyles.ts` 다.

**덱은 제품 핀을 따른다.** 제품은 LOUIS 를 `3ec8830d` 에 묶고(웹 앱의 `package.json:33`), 덱이 받는 스냅숏도 같은
판이다(`~/klipse-deck-kit/system/louis/SOURCE.md`). 그래서 이 결정의 (가)는 이 저장소에 서는 즉시 덱이 쓸 수 있지만,
(나) 가운데 「핀을 올리면 풀린다」는 항목은 제품이 핀을 올려야 덱 스냅숏에도 들어온다.

## Decision

### 한눈 표

| 항목 | 판정 | 이 저장소에서 바뀐 것 |
| --- | --- | --- |
| 1a 사진 위 상태 배지 | (가) | `.louis-badge[data-surface="media"]` + `media-badge-*` 시맨틱 여섯 |
| 1b 카드 썸네일 글자 띠 | (가) | `.louis-project-card-overlay[data-ink="on-dark\|on-bright"]` + `media-foreground-bright-soft` |
| 1c 카드 더보기 버튼 | (나) | 없음 — 레시피 inset 이 이미 8 이다 |
| 2a 비디오 플레이어 크롬 | (가) | 레시피 `.louis-video-player`(볼륨 `__volume` · `data-platform="youtube"` · `data-standalone` 칩) — 막힘 셋은 기본값으로(DS-D-0084), Updates (250) |
| 2b 하이라이트 트랙 · 무대 · 무대 아래 막대 | (다) → (가) DS-D-0084 | 새 부품 `.louis-segment-track` + 짝 블록 `.louis-stage-bar`(무대는 기존 `drop-zone[data-surface="media"]`) — Updates (249) |
| 2c AI 프롬프트 후보 카드 | (다) → (가) DS-D-0084 | 새 부품 `.louis-prompt-variant`(`data-layout` card · column) — Updates (248) |
| 2d-1 TTS 오디오 칸 | (가), 다음 작업 | 없음 — 슬라이더 접근성 계약을 새로 가진다 |
| 2d-2 컴포지션 소스 썸네일 줄 | (다) | 없음 — node-shell 판정 9 로 접는다 |
| 2d-3 「편집」 버튼 | (다) | 없음 |
| 2d-4 YouTube 업로드 폼 | 입력 상자 (나) · 채널 줄과 예약 버튼 (다) | 없음 |
| 2e 제목 옆 「편집 모드」 칩 | (가) | `.louis-node-shell__title-chip` + `node-edit-chip-*` 적응 쌍 |
| 2f 차트 점 바닥 · 축 라벨 | 점 바닥 (다) · 축 라벨 색 (나) | 문서 한 줄 |
| 3a 분석 큰 차트 블록 | (나) | 문서의 낡은 다크 값 정정 |
| 3b 「일부 공개」 배지 | (나) | 없음 |
| 3c 업로드 무대 · 주제 고르기 | 무대 (다) · 고르기 (나) | `drop-zone.md` 의 낡은 소비처 정정 |
| 3d 클립 목록 행 | (나) | 없음 — 선행 표식은 이미 없다 |
| 3e 아카이브 머리 | (가) | `section-header[data-level="list"]` + `__count` |
| 4a 사이드 핸들 채널 | (가) | `data-channel` audio · youtube · instagram, 「채널은 셋」 정정 |
| 4b 세그먼트 잠금 | (가) → 제품 (나) | 잠긴 칸 갈래, 선택된 잠긴 칸은 `fg-secondary` |
| 4c spark 44% | (가) | spark 가 `flex: 0 1 44%` 로 양보한다 |
| 4d delta down 12% | (가) → 제품 (나) | down 면 `accent-red-500-alpha-08` |
| 5a 노드 카드 테두리 | (나) | 없음 — 핀만 올리면 된다 |
| 5b 메타 알약 면 | (나) | 없음 — 핀과 캔버스 범위 |
| 5c 비활성 왼쪽 연결점 | (가) | 라이트 비활성 면 · 글리프를 제품이 구운 색으로 |
| 5d 노드 입력판 | (나) + (가) | `node-composer-surface` |

### (가) — 이 저장소에 더한 것

**1a 사진 위 배지.** `badge.md` 가 이미 「`tone` 이 아니라 밑면 입력이 필요한 별개 축」이라고 적어 둔 자리다. 페이지
면 위 배지에서 제품의 「면 하나, 글자색만」 방식을 거부한 판단은 그대로다. 사진 위에서는 밑면이 테마를 따르지 않으므로
칩도 두 mode 에서 같아야 한다(`color-theme.md` 「예외 — 면이 테마를 따르지 않으면」). 새 시맨틱은 두 mode 같은 값이다.

| 이름 | 값 | 대비(면 위) |
| --- | --- | --- |
| `color-media-badge-surface` | `palette-gray-800` | — |
| `color-media-badge-foreground` | `palette-gray-200` | — |
| `color-media-badge-foreground-success` | `green-400` | 7.40 |
| `color-media-badge-foreground-warning` | `yellow-400` | 8.33 |
| `color-media-badge-foreground-danger` | `red-400` | 5.00 |
| `color-media-badge-foreground-info` | `blue-400` | 5.07 |

제품은 다크에서 면을 `palette-gray-900` 으로 바꾼다(`HSS:71,73`). 제품 주석(`HSS:56-58`)이 「라이트 · 다크 동일」이 의도라고
적으므로 한 값(800)으로 둔다. 제품 쪽 매핑은 Done → success, Failed → danger, Processing → warning, Analyzed → info 다.

**1b 카드 띠의 사진 위 잉크.** 띠 위 글자색을 고르는 일(썸네일 밝기 표본)은 런타임이라 소비처의 것이다(`project-card.md`
「오버레이 대비」). 레시피는 결과 둘만 받는다: 어두운 사진 `on-dark`(제목 `media-foreground-dark`, 보조 `-dark-soft` 72%),
밝은 사진 `on-bright`(제목 `media-foreground-bright`, 보조 새 `media-foreground-bright-soft` = `static-black-alpha/72`).
`color-theme.md` 가 「쓰는 자리가 없다」며 열지 않았던 칸을 이 카드가 연다. 제품의 보조 88% · 80% 와 라이트 잉크
`palette-gray-100` 은 72% · `palette-gray-000` 으로 모인다 — 제품 (나) 몫이다. 덱은 `data-theme="dark"` 중첩 대신
`data-ink` 를 쓴다(다크 `fg-secondary` 는 불투명 `#a5a8ad` 라 사진 위 잉크가 아니다).

**2e 제목 옆 칩.** Badge 변형이 아니라 node-shell 부품이다 — 높이가 헤더에 묶이고 기하(1/6 · 반경 10 · caption medium ·
글리프 10)가 배지와 축 하나로 접히지 않는다. 색은 제품 값을 옮기지 않았다. 제품 편집 모드는 Tailwind 보라 리터럴
(`ImageNode.tsx:227-228`)이고, 덱이 그 자리에 `node-edit-accent` 를 같은 색 16% 위에 얹으면 다크에서 3.00:1 이다.
component CSS 는 테마 선택자를 쓰지 않으므로 테마마다 다른 적응 쌍을 세웠다.

| 이름 | light | dark | 대비 |
| --- | --- | --- | --- |
| `color-node-edit-chip-surface` | `violet-alpha/08` | `violet-alpha/16` | — |
| `color-node-edit-chip-foreground` | `violet-700` | `violet-300` | 라이트 8.78 · 다크 5.61 |

`violet-alpha` 는 `violet-500` 바탕의 새 primitive 다(08 · 16 두 칸). 「재편집 필요」(`data-tone="warning"`)는 제품
`yellow-600` on `yellow-200` 이 1.94:1 이라 status 쌍 `bg-warning` · `fg-warning` 으로 간다.

**3e 목록 머리.** 하이라이트 허브(`HSS:381-402`)와 노드 캔버스 허브(`NodeCanvasHomeScene.tsx:220-232`)가 같은 배치를
각자 그린다. 기존 세 단(20 · 36 · 12, 아래쪽 정렬, 719 접힘)과 크기 · 정렬 · 접힘이 모두 달라 네 번째 단 `list` 를 연다:
가운데 정렬, 사이 16, 제목 body-md-medium, 719 이하에서도 한 줄. 제목 안 개수는 `__count`(왼쪽 6, `fg-tertiary`).
제품 제목 잉크 `palette-gray-800/200` 과 개수 `palette-gray-500` 은 역할이 없어 `fg-primary` · `fg-tertiary` 로 간다
(`section-header.md` Known deviation 3 과 같은 판단). 아래 여백은 두 허브가 달라(12 · 8) 소비처가 진다.

**4a · 4b · 4c · 4d · 5c · 5d.** 같은 날 먼저 넣었다 — 각 컴포넌트 문서가 근거를 소유한다.

- 4a: `node-side-handle` 의 채널은 여섯이다(image · text · youtube · instagram · edit · audio). 비디오 채널은 없다.
- 4b: `segmented-control` 의 잠긴 칸은 `fg-disabled`, 선택된 채로 잠긴 칸은 `fg-secondary`.
- 4c: `chart-card` spark 는 `flex: 0 1 44%` 로 줄어 값에 닿지 않는다.
- 4d: `stat-tile` down 면은 `accent-red-500-alpha-08`(정본 8%)이다.
- 5c: 라이트 비활성 연결점 면 · 글리프는 제품이 구운 색 primitive(`node-handle-disabled-light.*`)를 읽는다.
- 5d: `node-composer-surface`(라이트 흰색 · 다크 `palette-gray-800`).

**다음 작업으로 남긴 (가) 둘.**

- 2a 비디오 플레이어: 컴포넌트는 manifest 에 있으니(`video-player`, experimental) 새 컴포넌트 결정은 필요 없다. recipe
  CSS 를 세우는 일이다. 막힘은 셋이다 — hover 시맨틱이 없다, 유리 칩의 소유(플레이어 대 소비처)가 정해지지 않았다,
  흐림 2px 가 흐림 사다리 밖이다. `video-player.md` 가 적은 다크 근사 · 834줄 · 소비처 8 은 지금 사실이 아니다
  (`static-black-alpha-28` 이 정확히 맞고, 제품은 1234줄 · 9 파일이다).
  **2026-10-13 섰다(Updates (250))** — 막힘 셋은 초안의 기본값으로: hover 는 새 시맨틱 `media-control-surface-hover`(틴트를 진하게),
  유리 칩은 플레이어가 소유(`data-standalone`), 흐림 2px 는 역할 이름 `blur-media-control`. 통합 판에서 다시 센 제품은 1231줄 · 9 파일 12 자리다.
- 2d-1 TTS 오디오 칸: 소비처 둘(TtsNode · BgmNode)이 같은 상수를 복사했고 이미 갈렸다(포커스 링이 BgmNode
  `:421-422` 에만 있다). `role="slider"` 접근성 계약을 새로 갖는 부품이라 따로 세운다.

### (나) — 제품 수정 목록

먼저 **핀을 올린다**: 웹 앱 `package.json:33` 의 LOUIS 핀을 이 결정이 들어간 커밋 이상으로. 5a · 5b · 5d · 3c 고르기는
핀만으로 풀린다(5a · 5b 는 `5805d8c4`, 5d 레시피는 `bd540a58` 이후). 5b 는 캔버스 셸에 `data-louis-scope="canvas"` 가
더 필요하다.

| 항목 | 제품 자리 | 할 일 |
| --- | --- | --- |
| 1a | `HSS:59-99` | 덮어쓰기를 `data-surface="media" data-tone=…` 로. 그 전에도 `HSS:64,66` 의 기본 글자색 두 줄은 지운다 — 같은 특이도의 상태 색을 이겨 「추출 완료」가 회색으로 보인다 |
| 1b | `HSS:236,346` · `AHS:266-270` | 표본 결과를 `data-ink` 로 띠에 단다(`HS:1479`) |
| 1c | `HSS:198,199,203` | 더보기 면 · 글리프 · hover 덮어쓰기를 지워 `media-control-*` 를 받는다. 앵커 `top/right 8` 은 남는다 |
| 2d-4 | YouTube 폼 입력 상자 | `.louis-node-shell__field` 로 |
| 2e | `ImageNode.tsx:225-229` · `EditNode.tsx:549-552` | `louis-node-shell__title-chip`(+ `data-tone="warning"`) |
| 2f | `analytics/shared.tsx:71` | 축 라벨 `var(--dashboard-muted-color)` → `var(--louis-color-fg-tertiary)` — 두 테마 모두 픽셀이 같다 |
| 3a | `analytics/OverviewTab.tsx:99-141` | 상수를 `louis-chart-card`(`data-chart="area"`) · `__header` · `__panel` · `__metric` 으로. `KpiCard.tsx:24` 가 이미 그렇다 |
| 3b | `analytics/ContentTable.tsx:178-201,698` | 일부 공개 → `louis-badge` warning, 비공개 · 초안 → neutral. 공개는 배지가 아니라 caption `fg-secondary` 글자(`badge.md` 「목록 · 표에서는 예외만 배지」) |
| 3c | `HSS:1404-1405` | 핀을 올린 뒤 placeholder 잉크 덮어쓰기를 지운다. 폭(`HSS:1403`)은 호출부 몫이라 남는다 |
| 3d | `HSS:1623-1626` · `HighlightStudioBoard.tsx:623` | 죽은 `[&::before]:[content:none]` 를 지운다 — LOUIS 는 핀 이전에 표식을 걷었다(DS-D-0070) |
| 3e | `HSS:381-402` · `NodeCanvasHomeScene.tsx:220-232` | `louis-section-header` `data-level="list"` + `__count` |
| 4b | `SegmentedToggle` 117-121 | 잠금 덮어쓰기를 지운다 |
| 4d | KpiCard · OverviewTab · Instagram · AdminSection 의 delta 8% 덮어쓰기 | 지운다 |
| 4c | KpiCard 480px 숨김 | 양보 규칙이 서면 지운다 |

### (다) — 화면에 두는 것과 그 이유

> **2026-10-13 — 이 절은 [DS-D-0084](DS-D-0084-product-parts-become-louis.md) 로 다시 판정한다.** 소유자 지시로 기본값이 「제품에 보이는
> 부품은 LOUIS 부품으로」 바뀌었다. 아래 일곱은 (가)로 옮겨 순서대로 올린다(차트 곡선 경로만 예외). 아래 사유는 그 시점의 기록이다.

- 2b 트랙 · 무대 · 막대: 무대와 막대는 이미 토큰과 LOUIS button · progress-bar 만으로 짜였다. 트랙은 원본 시간축의
  기하이고 한 컴포넌트가 하이라이트 화면 두 곳에서만 쓴다.
- 2c 후보 카드: 소비처 하나. 선택이 아니라 비교 모달을 여는 버튼이라 choice-card 도 아니다.
- 2d-2 소스 썸네일 줄: 노드 썸네일이 세 크기(28 · 32 · 76×52)로 갈려 node-shell 판정 9 로 접는다. 그 판정이 기다리던
  면 토큰은 DS-D-0082 의 `static-pure-black-alpha-*` 로 풀렸다.
- 2d-3 「편집」 버튼: LOUIS 에 그라디언트 토큰 형식이 없고, 제품 `globals.css:550` 이 승격하지 않는다고 적는다.
  덧붙여 그 주석의 「하나를 공유」는 사실과 다르다 — 넷(EditNode · InstagramNode · YoutubeNode · CreativeMediaClient)이
  인라인으로 복사한다. 제품에 알릴 일이다.
- 2d-4 채널 줄 · 예약 버튼: 아바타 32 와 버튼 28 은 LOUIS 사다리(아바타 24 · 28 · 40, 버튼 24 · 32 · 40)에 없다.
- 2f 점 바닥: 공용 `AreaChart` 하나가 쓴다. `chart-card.md` 의 「소비처의 것」 목록에 점 바닥을 보탰다.
- 3c 업로드 무대: 끌어 놓기 · 플레이어 · 트랙이 겹친 합성 무대라 페이지 면 위 drop-zone 이 아니다. 소유자가 원하면
  최소 (가)는 `drop-zone[data-surface="media"]` 지만 hover 4% · 보조 56% · 링 색 · 여백이 전부 판정 거리다.

### 덱 쪽에 알릴 것

- 덱 편집 모드 칩(덱 키트 스타일시트 4248~4250행)은 다크 장에서 3.00:1 이다. `louis-node-shell__title-chip` 으로 바꾼다.
- 3d 의 「덱은 막대를 LOUIS 그대로 둔다」는 「LOUIS 에 막대가 없다」가 맞다.
- 1b 는 `data-theme="dark"` 중첩 대신 `data-ink` 를 쓴다.

## Consequences

- 새 primitive `violet-alpha/{08,16}` 과 시맨틱 열(`media-badge-*` 여섯, `media-foreground-bright-soft`,
  `node-edit-chip-*` 둘)이 생긴다. Figma 변수는 다음 동기화에서 세운다.
- React `Badge` 에 `surface`, `ProjectCardOverlay` 에 `ink` 가 생긴다. 생략하면 이전과 같다.
- Figma 컴포넌트(Badge 의 `Surface` 축, 띠 잉크, 칩, 목록 머리)는 아직 없다 — 이 레시피들의 `figma` 상태는 그대로다.

## Rollback

새 변형 넷(배지 `data-surface`, 띠 `data-ink`, 머리 `list`, 제목 칩)은 속성을 달지 않으면 아무것도 바꾸지 않는다.
되돌리려면 그 규칙과 새 시맨틱 · primitive 를 지운다. 쓰는 소비처는 덱 하나다.
