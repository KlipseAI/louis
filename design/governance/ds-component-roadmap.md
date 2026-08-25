# DS 컴포넌트 성숙 로드맵 (커버리지 · 갭 · 어돕션)

2026-08-25 착수. 정본 두 파일: **DS 라이브러리 `bxGEp0km5zluMJGulaTvFW`**(재사용 컴포넌트·토큰) +
**제품 보드 `OlYKERKOkgbxBEEoXGZW2c`**(화면 재현·측정 컴포넌트). 지도 아티팩트가 둘을 함께 담는다.

## 실측 진단 (라이브 감사)

- DS 라이브러리 = **57 컴포넌트** (Button 40 variant · TextField 8 · Badge 5 · Checkbox 4 · Slider 4 ·
  Dialog · Tooltip · Toast · Menu · Avatar · SegmentedControl · ProjectCard · BannerCarousel · AppTopBar ·
  Sidebar\* · Progress · Skeleton · Spinner · EmptyState · SelectableListRow + icon/\* 31). 원자/범용 분자는
  충실하다.
- **어돕션 = 0.** 제품 보드 화면들은 DS 인스턴스를 하나도 안 쓰고 전부 bespoke 측정 프레임이다(두 파일이
  분리·미연결). 라이브 검색으로 board 내 DS 컴포넌트 인스턴스 0개 확인.
- **커버리지 갭 = 제품 고유 organism** (VideoEditor 패널 104 · Payment/Checkout 20 · Canvas Node 18 ·
  Highlight editor 10 · Chart 6 · KPI Card 5 · Data Table · Pricing 2). 이들은 DS에 없다.

## 검증된 build-spec (워크플로 wf_f002b502, 16 에이전트, 전원 high·refuted 0)

organism → DS 진입 방식 판정 (component=새 primitive / composition=원자 조립):

| organism | 판정 | buildableNow | seed-gated | 새 primitive | 비고 |
|---|---|---|---|---|---|
| **Change Pill** | component | ✅ | (data는 gated) | **ChangePill** | badge.css가 "별도 물건"으로 이미 지정. **← 제작 완료** |
| KPI Card | both | ✅ | data만 | (ChangePill + Sparkline) | shell은 composition |
| Chart block | both | ✅(StaticAnalyticsDemo 공개) | data만 | **Chart**(AreaChart+Sparkline, viewBox 800×200) | shell=Card+Badge+Skeleton+EmptyState+Chart |
| Data Table | both | ✅ | data만 | **Table/Row/HeaderCell/Cell** | shell=Card+Table+Badge+Skeleton+EmptyState |
| Canvas Node | both | ✅ | 열린 프로젝트 data | **Node Card**(NodeType 4·Selected·핸들) | 조립: Badge/Button/TextField/SegmentedControl/Menu |
| VideoEditor 패널 | both | ✅(vemClass geometry) | data | **Editor Grid**(layout primitive, Shell 섹션) | 조립: SegmentedControl/Slider/TextField/IconButton/Badge |
| Highlight editor | both | ✅ | data | **CaptionColorPanel**(Forms) | 조립: Button/Progress/Spinner/Slider/SelectableListRow |
| Payment/Checkout | both | ✅ | ❌ 아님 | **Alert/Callout**(Feedback, Tone=error만 측정됨) | 조립: Button×2 + Alert + text |
| Pricing card | **composition** | ✅ | ❌ | (없음) | DS 아님 — 제품 씬 유지. 조립: Button/Icon/Text/token frame |

**핵심 재프레이밍:** analytics organism이 seed-fixture로 막힌 게 아니라 **정적 상태(Change Pill, 랜딩
StaticAnalyticsDemo 차트, skeleton)가 공개 route에서 측정 가능** → 지금 제작 가능. LIVE 데이터 상태만 gated.

## 진행 (phase)

1. **새 primitive 제작 (buildable now)** — ChangePill ✅ · 다음: Chart · Table 계열 · Alert/Callout ·
   Node Card · Editor Grid · CaptionColorPanel. 전부 DS 라이브러리(bxGEp0)에 시맨틱 토큰 바인딩으로.
2. **composition** — KPI/Chart/Table/Pricing shell은 새 컴포넌트가 아니라 원자+새 primitive 조립 레시피.
3. **거버넌스** — 각 컴포넌트를 packages/css·react(코드 정본) + readback.json/snapshot.json + 토큰/manifest +
   게이트에 반영(parity 26→+N). ChangePill부터 배치 반영 예정.
4. **어돕션** — DS 라이브러리 publish/연결 → 95개 화면을 bespoke에서 DS 인스턴스 조립으로 재구성. 0% → 목표.

## 토큰 갭 (제작 중 발견)

- `color/fg-success`·`bg-success`·`fg-danger`·`bg-danger` 존재 → ChangePill 시맨틱 바인딩 가능.
- `foreground-success-on-surface` 부재(danger-on-surface는 있음) — surface 위 success 전경 토큰 갭. 필요 시 추가.
- neutral pill bg는 전용 subtle 토큰이 없어 `color/bg-surface`로 임시 바인딩 — subtle bg 토큰 신설 후보.

## 제작 완료 — organism 갭 7종 전부 (Figma, 스크린샷 검증)

DS 라이브러리 `bxGEp0` Components 페이지에 7개 신규 컴포넌트를 시맨틱 토큰 바인딩으로 제작.

| # | 컴포넌트 | set/id | 섹션 | 구성 | 근거 |
|---|---|---|---|---|---|
| 1 | **ChangePill** | `342:123` | Content | Tone=Positive/Negative/Neutral · padding 4/12 · radius 999 · caption-12-medium | OverviewTab CHANGE_PILL_CLASSES; badge.css "별도 물건" |
| 2 | **Chart** (AreaChart) | `343:131` | Content | Accent=Positive(success)/Negative(danger) · stroke 2 round · 그라디언트 0.18→0 · 그리드 · 끝점 dot | analytics shared AreaChart viewBox 800×200 |
| 3 | **KPI Card** | `346:117` | Content | Label+Value+ChangePill 인스턴스+미니 sparkline (composition) | reportKpiCard.kpiCardV2 |
| 4 | **Data Table** | `348:124` | Content | header + rows · cell media/text/numeric/badge(instance) · 행 구분선 | analytics ContentTable |
| 5 | **Node Card** | `349:124` | Shell | header(type Badge + title + more) + body slot + 좌우 handle | node-canvas-v2 NODE_CONTAINER |
| 6 | **Editor Grid** | `350:127` | Shell | assets(236)/preview(flex)/properties(324) + timeline(400) 레이아웃 | vemClass.ts grid-template |
| 7 | **CaptionPanel** | `351:127` | Forms | 색 swatch + 크기 slider (highlight shorts) | CaptionColorPanel |

바인딩: bg-surface · fg-primary · fg-secondary · stroke-default · accent-primary · fg/bg-success · fg/bg-danger.
값·곡선·행은 placeholder(인스턴스가 data 교체). Pricing/Payment는 composition으로 판정되어 신규 컴포넌트 아님.

**아직 안 한 것 (다음 phase):**
- **거버넌스** — 이 7개를 코드 정본(packages/css·react) + readback.json/snapshot.json 재생성 + 토큰/manifest +
  parity 게이트(26→33)에 반영. Figma-only 상태다.
- **어돕션** — DS 라이브러리 publish/연결 후 제품 보드 95 화면을 bespoke→DS 인스턴스 조립으로 재구성(0%→).
