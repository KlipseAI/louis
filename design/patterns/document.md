---
id: document
status: experimental
authority: normative
---

# Document

보고서 · 운영안 · 제안서처럼 **스크롤로 끝까지 읽는 문서**의 규범이다. 페이지 바닥 위에 메인 카드
한 장이 서고, 그 안에서 머리 → 결정 요청 → 번호 절 → 맺음이 한 줄로 흐른다. 누를 것이 거의 없고
한 번 끝까지 읽히는 것이 목적이라, 앱 화면의 부품을 빌리지 않고 문서의 부품을 한 벌 따로 갖는다.

정본은 소유자가 2026-09-21 에 승인한 「Klipse Meta 광고 운영안」이다. **첫 시안은 거절됐다** — LOUIS
앱 부품(Alert · StatTile · 카드마다 테두리)을 그대로 얹은 것이었고 소유자 말은 「실망스럽다」 ·
「난 화려한 걸 원하는 게 아니야」였다. 승인된 두 번째 시안은 klipse-deck-kit 의 구성 규칙으로
다시 짠 것이다. 이 문서의 규칙은 그 두 시안의 차이에서 나왔다. 판정 기록은
[DS-D-0067](../governance/decisions/DS-D-0067-document-is-not-an-app-screen.md)이 갖는다.

## Availability

| Surface | 상태 | 근거 |
| --- | --- | --- |
| Web | `partial` | CSS 레시피 `packages/css/src/pattern/document.css`(`.louis-document*`)와 표 변형 `.louis-table[data-variant="ruled"]`. 실브라우저 테스트 `packages/css/test/document.browser.test.ts`. React 표면은 없다 — 소비처는 클래스 마크업을 쓴다. 제품 소비처가 아직 없다 |
| Figma | `not-ready` | 템플릿 보드도 변수도 없다. 문서 규칙 값(박스 간격 8 · 카드 여백 24/32 …)이 아직 토큰이 아닌 이유가 이것이다(아래 [값의 출처](#값의-출처)) |
| Documentation | `done` | 이 문서와 예시 [`packages/css/examples/document.html`](../../packages/css/examples/document.html) |
| Maturity | `experimental` | 승인본 하나와 장표 규약 하나가 근거다 |

## 언제 쓰나

- **읽고 판단하는 문서** — 운영안 · 결과 보고 · 제안서 · 회고. 결론과 결정 요청이 있고, 수치와
  근거가 절로 나뉜다.
- 브라우저로 보내고, 필요하면 인쇄해 PDF 로 남긴다.

쓰지 않는 자리.

| 이런 것이면 | 이것을 쓴다 | 왜 다른가 |
| --- | --- | --- |
| 조작하는 화면(대시보드 · 설정 · 편집기) | [App Shell](app-shell.md) 과 앱 컴포넌트 | 레일과 상단 크롬이 자리를 예약하고, 카드가 대화형이다. 문서는 셸 크롬이 없다 |
| 로그인 전 마케팅 화면 | [Landing Shell](landing-shell.md) | 헤더가 콘텐츠 위에 뜨고 톤이 뒤집힌다. 문서는 시트 한 장 위에서 가만히 읽힌다 |
| 발표 장표(1920×1080) | klipse-deck-kit · `migration/deck/` | 한 장에 주장 하나 · 글머리 5줄이 한도인 판형이다. 문서는 스크롤이라 한도가 절 단위다 |
| 결제 결과 한 칸 | [Status Result](status-result.md) | 앱 셸 카드 안의 한 열이다 |

문서 안에서 버튼 · 입력이 필요해지면 그것은 문서가 아니라 화면이다. 링크는 괜찮다.

## 구조

```text
Page (.louis-document)                       바닥 bg-canvas, 가장자리 12
└─ Sheet (.louis-document__sheet)             bg-surface · 반경 16 · 헤어라인 한 겹 ← 문서의 유일한 깊이
   └─ Column (.louis-document__column)        측정 폭 920 · 위 80 아래 64 · 절 사이 72
      ├─ Head (.louis-document__head)          발행 주체 · 제목 48 · 리드 20 · 메타 12
      ├─ Decision (.louis-document-decision)   결론 · 결정 요청 — 머리 바로 아래
      ├─ Section × n (.louis-document-section) 키커(번호) · 절 제목 28 · 출처 줄 · 블록들
      │   └─ 블록: 산문 · 격자(카드 · 수치) · 비교 막대 · 규선 표 · 타임라인 · 흐름 · 콜아웃
      └─ Foot (.louis-document__foot)          헤어라인 위 한 줄
```

- **결론이 먼저다.** 승인이나 확인이 필요한 것은 머리 바로 아래 `Decision` 에 번호 목록으로 둔다.
  끝까지 읽어야 무엇을 정하는지 알게 하지 않는다. 맺음 절은 그 결정을 근거와 함께 다시 한 번 말한다.
- **절은 번호로 부른다.** 키커는 `01` · `02` 또는 `요약` · `판단 기준` 같은 짧은 이름이다. 제목은
  명사구나 짧은 평서문이고, 부제(출처 줄)에서 기준 시점과 출처를 밝힌다.
- 절 안의 블록 순서는 **주장 → 근거 → 해석**이다. 수치 격자 → 비교 → 표 → 해석 카드가 그 순서다.

## 깊이 · 면 · 색

klipse-deck-kit `docs/DESIGN-RULES.md` §1 · §3 · §11 을 따른다.

- **깊이는 헤어라인 한 겹이다.** 시트만 `hairline-inset` 을 갖는다. 시트 안의 면은 테두리도 그림자도
  없이 **잉크 알파 면색**으로만 선다 — `fg-primary` 4%(카드 · 수치 · 결정 항목), 8%(칩 · 막대
  트랙). 가장자리가 필요해 보이면 선을 긋지 말고 알파를 한 단 올린다. 알파는
  [DS-D-0026](../governance/decisions/DS-D-0026-alpha-scale.md)의 16단에서 고른다.
- **면은 겹치지 않는다.** 카드 안에 수치를 놓으면 수치는 자기 면을 버리고 카드의 면을 쓴다. 알파
  면이 두 겹이면 한 단 짙은 상자가 생기고, 그것이 곧 깊이 하나를 더 만드는 일이다.
- 면 사다리 칸(`bg-inset` · `bg-raised`)을 쓰지 않는다. 다크에 시트 위 한 칸 면이 없기 때문이다 —
  표 행 hover 가 같은 이유로 알파 상태 레이어로 옮겨 갔다([DS-D-0065](../governance/decisions/DS-D-0065-table-row-hover-is-a-state-layer.md)).
- **강조색은 `accent-primary` 하나다.** 키커 · 날짜 · 번호 표식 · 비교에서 앞선 막대 ·
  기본 콜아웃이 전부 같은 파랑이다. 강조색은 글자보다 **면**으로 쓴다(번호 표식의 12% 면).
- **초록은 앞선 값에만** 쓴다 — 표에서 이긴 칸, 비교 카드의 판정 알약. 장식으로 쓰지 않는다.
- **노랑은 비용이 드는 지점에만** 쓴다 — `caution` 콜아웃. 「그냥 강조」로 쓰면 아무도 보지 않는다.
- 글자색은 역할 잉크다: 제목 `fg-primary` · 본문 `fg-secondary` · 라벨과 메타 `fg-tertiary`.
  승인본은 잉크 알파(72% · 56%)로 글자를 칠했는데 **옮기지 않았다** — LOUIS 의 잉크 역할은 바닥과
  무관하게 정해진다([Section Header](../components/section-header.md) Known deviations 2 와 같은 판단).

## 타이포 역할

단계는 여섯이다 — heading 36 · 28, body 20 · 16 · 14, caption 12(`migration/deck/information-hierarchy.md`).
굵기는 semibold(600)까지다. **문서 제목과 리드는 랜딩 데스크톱의 절 제목 · 설명과 같은 크기다** — 제목
`type-heading-36-semibold`, 리드 `type-body-16-medium`(제품 랜딩의 개요 · 단계 · 템플릿 · 요금 절 머리). 2026-09-28
소유자 지시이고, 전에는 제목 48 · 리드 20/400 이었다.

| 역할 | 크기 | 부품 |
| --- | --- | --- |
| 문서 제목 — 한 문서에 하나 | 36 / 600 | `.louis-document__title` |
| 수치(KPI) | 36 / 600 | `.louis-document-stat__value` |
| 절 제목 | 28 / 600 | `.louis-document-section__title` |
| 수치 단위 | 20 / 400 | `.louis-document-stat__unit` |
| 리드 · 본문 · 카드 제목 · 결정 항목 | 16 / 500 · 400 · 600 | `__lead` · `.louis-document-prose` · `__title` · `__label` |
| 설명 · 표 · 키커 · 라벨 | 14 / 400 · 500 | `__description` · `.louis-table` · `__kicker` · `__label` |
| 메타 · 판정 알약 · 표식 | 12 / 500 · 600 | `__meta` · `.louis-document-verdict` · `.louis-document-marker` |

- 위계는 **크기 → 굵기 → 색** 순서로 준다. 셋을 한꺼번에 바꾸지 않는다.
- 수치는 크기를 더 키우지 않는다. 36 이 한도다.
- heading-48 · heading-28 은 합성 ramp 에 medium 칸만 있어 크기 · 행간 · 자간은 그 칸에서, 굵기는
  semibold 칸에서 받는다([Stat Tile](../components/stat-tile.md) `lg` 와 같은 처리).

## 간격 · 반경

| 규칙 | 값 | 출처 |
| --- | ---: | --- |
| 박스를 나열하는 컨테이너의 gap(카드 열 · 수치 행 · 결정 항목) | 8 | 소유자 지시(2026-09-28) — `migration/deck/layout-rules.md` 「박스 사이 간격 10」에서 내렸다 |
| 카드 안쪽 여백 | 24 · 넓게 쓸 자리만 32 | deck-kit §4A 「카드 안쪽 여백 24 또는 32만」 |
| 절 안 블록 사이 | 24 | `space-layout-section` |
| 절과 절 사이 | 72 | 승인본 |
| 부품이 소유한 안쪽 간격 | 부품 정의 | 「컴포넌트 내부 간격은 컴포넌트 정의를 따르며 장표에서 덮어쓰지 않는다」(`layout-rules.md`) |

반경은 **역할 다섯** 중 하나를 고른다(deck-kit §4A): 카드 · 수치 · 결정 항목은 `radius-card` 12,
시트는 `radius-overlay` 16(deck-kit 이 앱 메인 카드에 준 역할), 콜아웃만 `radius-alert` 20, 칩 · 알약 ·
표식 · 막대는 `radius-pill`. 숫자를 새로 만들지 않는다.

### 값의 출처

박스 간격 8 · 카드 여백 24/32 · 시트 폭과 여백 · 절 간격은 **아직 토큰이 아니다.** 이 역할을 말하는
토큰이 저장소에 없고, 토큰을 세우면 Figma 변수를 같은 작업에서 적용해야 하는데
([DS-D-0028](../governance/decisions/DS-D-0028-three-in-one-change.md) · `verify-figma-parity`) 이 패턴의
Figma 는 `not-ready` 다. 그래서 레시피 루트가 값을 **이름으로 한 번씩만** 선언하고
(`--louis-document-box-gap` · `--louis-document-card-inset` …) 모든 규칙이 그 이름을 읽는다. 숫자가
규칙 본문에 흩어지지 않으므로, 토큰으로 올릴 때 선언 한 줄씩만 바꾸면 된다. 문서 규칙 값을 두고
같은 값을 가진 다른 역할의 토큰(`layout-alert-compact-inset` 10 등)을 빌리지 않는다 — 한 값이 두 뜻을
나르면 한쪽을 고칠 때 다른 쪽이 따라 움직인다([DS-D-0029](../governance/decisions/DS-D-0029-token-names-must-be-true.md)).

**예외가 셋 있다 — 알고 빌렸다.** 바닥과 시트 사이(`layout-app-shell-outer-gap`) · 비교 막대의 빈
트랙(`progress-track`) · 비용 주의의 노랑(`alert-warning-stroke`)은 다른 부품의 토큰을 빌린다. 셋 다
레시피 루트의 이름(`--louis-document-floor-inset` · `-bars-track-face` · `-caution`)으로 한 번만 읽고
규칙 본문은 그 이름만 쓴다. 그 부품이 값을 바꾸면 문서도 따라 움직인다는 뜻이고, 그 사실을 아래
[Known deviations](#known-deviations) 5 가 적는다.

## 읽기 폭

- 시트는 최대 1120, 본문 열의 글자 폭(측정 폭)은 920 이다 — 1440 화면에서 시트 가장자리와 글자
  사이가 100 이 되어 장표 여백 100 과 같다.
- **산문 한 줄은 760 을 넘기지 않는다.** 한국어 16px 에서 한 줄 45자 안팎이다. 카드 · 표 · 격자는
  920 을 다 쓰고, 산문만 좁게 선다.
- 한국어 조판은 `word-break: keep-all` + `overflow-wrap: anywhere` 다 — 어절을 끊지 않고, 끊을 곳이
  없는 긴 영문 · 숫자만 접는다.

## 부품 선택표

| 무엇을 말하려나 | 부품 | 규칙 |
| --- | --- | --- |
| 승인 · 확인이 필요한 것 | `.louis-document-decision` (`ol role="list"`) + 번호 표식 | 머리 바로 아래. 항목은 한 줄 제목 + 한 줄 조건 |
| 절의 주장을 풀어 쓰기 | `.louis-document-prose` | 문단 사이 12. 강조는 `strong`(semibold · `fg-primary`)만 |
| 나란한 항목 셋 · 넷 | `.louis-document-grid` + `.louis-document-card` | 기본 3열, `data-columns="2|4"`. 번호가 있으면 `ol` 과 표식, 없으면 `ul` — 어느 쪽이든 `role="list"` |
| 지표 몇 개 | `.louis-document-grid[data-columns="4"]` + `.louis-document-stat` | 라벨 14 · 수치 36 · 단위 20 · 보조 12. 한 행 넷까지 |
| 두세 대상의 비교 | `.louis-document-card` 안 `.louis-document-bars` (`ul role="list"`) | 앞선 쪽만 `data-lead` 로 강조색, 나머지는 잉크 24%. 막대는 0 에서 시작. 판정은 `.louis-document-verdict` |
| 전체 수치 | `.louis-table[data-variant="ruled"]` 를 `.louis-document-table` 로 감싼다 | 가로 규선만. 숫자 열 `data-align="end"`, 합계 `data-emphasis="total"`, 앞선 값 `data-emphasis="lead"` |
| 해석 · 한 대목 짚기 | `.louis-document-card`(`__title` + `__body`) | 강조는 본문 `strong` 으로만 준다. 색 선을 긋지 않는다. 절마다 하나 |
| 기간 요약 + 설명 | `.louis-document-card[data-layout="split"]` (+ `data-inset="lg"`) | 왼쪽에 수치, 오른쪽에 판단. 좁으면 쌓인다 |
| 일정 | `.louis-document-timeline` (`ol role="list"`) | 끝난 항목만 `data-state="done"`. 넷 넘으면 절을 나눈다 |
| 순환 · 순서 | `.louis-document-flow` (`ol role="list"`) | 칩 사이는 화살표. 다섯 칩까지 |
| 결론 한 줄 · 비용 주의 | `.louis-document-callout` (`data-tone="caution"`) | 절마다 하나까지. 노랑은 비용 · 되돌리기 어려움에만 |
| 기간 대비 증감 | `.louis-delta-pill` | 방향(up · down) 어휘다. 비교의 판정에는 쓰지 않는다 |

**목록 부품은 `role="list"` 를 단다.** 레시피가 목록 표식을 전부 지우기 때문이다 — 이유는 아래
[Accessibility](#accessibility).

**기존 컴포넌트와의 경계.** 위 부품 가운데 기존 LOUIS 컴포넌트에 얹은 것은 표 하나다
(`data-variant="ruled"` — [Table](../components/table.md)). 나머지를 변형으로 얹지 않은 이유는
[DS-D-0067](../governance/decisions/DS-D-0067-document-is-not-an-app-screen.md) 판정표가 부품마다 적는다.
요약하면 — Alert 는 **화면 상태**를 알리는 배너라 편집 강조와 뜻이 다르고, Stat Tile 은 「액자가
있고 없고가 조형을 가른다」를 자기 규칙으로 갖고 있으며, Badge 는 반경 8 의 상태 표식이라 알약
칩과 반경 축이 갈린다.

## 반응형

719 가 경계다([Responsive Layout](../foundations/responsive-layout.md) — 이 저장소가 행동 경계로
인정한 폭이고 Section Header · App Shell 이 같은 값을 쓴다).

| 축 | ≥720 | ≤719 |
| --- | --- | --- |
| 시트 | 가장자리 12 · 반경 16 · 헤어라인 | 화면 전체 — 가장자리 0 · 반경 0 · 헤어라인 없음 |
| 본문 열 여백 | 위 80 · 좌우 40 · 아래 64 | 위 40 · 좌우 20 · 아래 40 |
| 절 사이 | 72 | 56 |
| 카드 여백 | 24 · 넓은 카드 32 · 콜아웃 24 | 20 · 넓은 카드 위아래 24 좌우 20 · 콜아웃 24 |
| 제목 · 절 제목 · 수치 · 리드 | 36 · 28 · 36 · 16 | 28 · 20 · 28 · 16 |
| 격자 | 3 · 2 · 4열 | 1 · 1 · 2열 — 4열만 2열로 남는다 |
| 기간 요약 카드 | 가로 둘 | 세로로 쌓인다 |
| 타임라인 | 날짜 열 112 + 본문 | 날짜가 본문 위로 올라간다 |
| 규선 표 | 14 | 12, 셀 여백을 줄인다. 넘치면 `.louis-document-table` 이 가로로 스크롤한다 |

글자 램프는 `migration/deck/information-hierarchy.md` 의 반응형 칸에서 **7단계 안의 값만** 골랐다.
출처는 네 줄(`heading-48 → 36 → 32 → 28` · `heading-36 → 32 → 28 → 20` · `heading-28 → 20 → 18` ·
`body-20 → 18 → 16`)이고 32 · 18 은 7단계 밖이라 건너뛴다. 그래서 제목 48→36 · 수치 36→28 · 절 제목
28→20 · 리드 20→16 이었다 — 수치와 리드는 출처의 첫 칸(32 · 18)이 아니라 그다음 칸이다. 2026-09-28 에 제목이 36, 리드가
16 이 된 뒤로는 제목 36→28(`heading-36` 줄의 다음 칸, 랜딩 절 제목의 좁은 계단과 같다) · 리드는 16 그대로다.

좁은 화면의 카드 여백은 승인본 그대로 셋으로 갈린다. 나열된 박스(카드 · 수치 · 결정 항목)는 20 이고,
「24 또는 32만」 규칙의 예외다(`--louis-document-card-inset-compact`). 넓은 카드(`data-inset="lg"`,
기간 요약)는 위아래가 한 단 내려 24, 좌우는 20 이다 — **좌우를 20 으로 맞춰야 위아래 카드와 글자
시작선이 한 줄에 선다.** 32 로 두면 시작선이 12 어긋나고 390 에서 설명이 한 줄 늘어난다. 콜아웃은
나열이 아니라 홀로 서는 결론이라 24 를 지킨다.

## 다크

테마는 문서 루트가 아니라 `html[data-theme]` 가 정한다. 레시피는 테마로 분기하지 않는다 — 면이
`fg-primary` 알파라서 라이트에서는 어두운 틴트, 다크에서는 밝은 틴트가 저절로 된다. note 콜아웃
표식(파랑 면 위 `i`)은 테마로 뒤집히지 않는 잉크(`fg-inverse`)를 쓴다(deck-kit §3.2 「가장 흔한
사고」). **caution 표식(노랑 면 위 `!`)만 다르다** — `fg-warning` 을 쓰고, 이 잉크는 테마로 뒤집힌다
(라이트 짙은 갈색 · 다크 옅은 노랑). 대비는 라이트 6.53:1 · 다크 3.43:1 이다. 표식은 `aria-hidden`
장식이고 뜻은 제목이 말하지만, 다크의 3.43 은 글자 기준 4.5 에 못 미친다. deck-kit 은 노랑에만 따로
잉크(`--accent-yellow-ink`)를 두는데 LOUIS 에는 그 역할이 없다. 두 테마 모두 승인본과 나란히 캡처로
대조했다(아래 [예시](#예시)).

## 인쇄

시트가 종이가 된다 — 바닥 · 가장자리 · 반경 · 헤어라인이 사라지고 바탕이 `bg-surface` 가 된다.
면(카드 · 수치 · 콜아웃)은 남긴다. 카드 · 수치 · 콜아웃 · 결정 항목 · 타임라인 항목은 쪽에서 끊지
않는다(`break-inside: avoid`). 배경 인쇄를 끈 브라우저에서는 면이 사라지고 글만 남는다 — 그래도
읽히도록 면만으로 뜻을 전하지 않는다.

## 하지 않는 것

- **카드에 색 선(레일)을 긋지 않는다.** 강조는 본문 `strong` 과 절 구성으로 준다. 좌측 3px 레일 변형
  (`data-accent="rail"`, deck-kit `.k-card--accent` 에서 옮겨 온 것)은 2026-09-28 소유자 지시로 걷어냈다 — 옛 마크업을
  그대로 둔 카드는 여느 카드로 선다.
- 면에 테두리 · 그림자 · 안쪽 베벨을 두르지 않는다. **카드마다 테두리**를 두른 것이 첫 시안이 거절된
  이유 중 하나다.
- **앱 부품을 문서에 얹지 않는다** — 경고 배너(Alert)를 편집 강조로, 대시보드 타일(StatTile)을 수치
  카드로 쓰지 않는다. 첫 시안이 거절된 이유 그대로다.
- **라벨 앞에 점을 찍지 않는다** — 칩 · 알약 앞의 색 점(상태 인디케이터)도 안 된다. 라벨과 라벨
  사이에 가운뎃점(`·`)을 구분자로 넣지 않는다 — 구분은 간격이 한다(deck-kit §11). 문장 안의 나열에
  가운뎃점을 쓰는 것은 괜찮다(`copy-tone.md`).
- **라벨 · 키커를 대문자로 쓰지 않는다**(`copy-tone.md` 「UI 라벨 · 아이브로우를 전부 대문자로 쓰지
  않는다」).
- 강조색을 둘 이상 쓰지 않는다. 노랑을 그냥 강조로 쓰지 않는다.
- 7단계 밖의 크기, bold(700)를 쓰지 않는다. 한도를 넘겼다고 글자를 줄이지 않고 절을 나눈다.
- 막대를 0 이 아닌 곳에서 시작하지 않는다. 3D · 그라디언트 채움을 쓰지 않는다(`chart-style.md`).
- 이모지로 뜻을 전하지 않는다. 로고를 글자나 그라디언트로 흉내 내지 않는다 — 실물 에셋을 쓴다.

## Content

- 제목은 명사구나 짧은 평서문으로 끊고, 리드에서 한 문장으로 푼다.
- 수치를 쓰는 절은 **기준 시점과 출처**를 절 머리의 출처 줄(`__source`)에 남긴다.
- 숫자와 단위는 붙여 쓴다(`514회`). 금액은 통화 기호를 앞에 둔다(`₩110,539`).
- 세는 제목(「세 가지 이유」) · 안심 어미 · 「A가 아니라 B」 대구를 반복하지 않는다(deck-kit
  `docs/WRITING.md`).

## Accessibility

- **표는 `caption` 을 갖는다.** 보이지 않게 두려면 `.louis-visually-hidden` 을 쓴다. 열 머리는
  `th scope="col"`, 첫 열이 행의 이름이면 `th scope="row"` 다 — 규선 표는 행 머리를 몸 칸과 같게 그린다.
- **비교 막대의 값은 글로 남는다.** 트랙은 `aria-hidden="true"` 이고 막대 옆 수치 텍스트가 값을 갖는다.
  비교 카드는 `figure` 이고 `figcaption` 이 그 이름이다.
- **목록은 목록이다.** 결정 요청 · 타임라인 · 흐름 · 번호 카드는 `ol`, 순서가 없는 나열(막대 · 번호 없는
  격자)은 `ul` 이다.
- **목록에는 `role="list"` 를 단다.** 이 레시피의 목록(결정 · 격자 · 막대 · 타임라인 · 흐름)은 전부
  `list-style: none` 이다. WebKit/VoiceOver 계열은 표식을 지운 목록의 롤을 벗기고, 그러면 「몇 개 중 몇
  번째」도 순서도 읽히지 않는다 — [Step Tile](../components/step-tile.md) Known deviations 11 과 같은
  결함이다. 레시피는 소비자의 마크업을 바꿀 수 없으므로 이 규칙은 마크업의 몫이고, 예시가 그대로 따른다.
- 번호 표식은 `aria-hidden="true"` 다 — 순서는 목록 롤이 말하므로 표식까지 읽히면 번호가 두 번 들린다.
  이 선택은 위 `role="list"` 를 전제로 한다.
- 흐름의 화살표 · 콜아웃 표식 글리프는 **대체 텍스트가 빈 생성 콘텐츠**다(`content: "→" / ""`). 콜아웃은
  `role="note"` 를 권한다. 표식의 톤(참고 · 주의)은 색이 아니라 콜아웃 제목이 말한다.
- 타임라인의 끝난 노드는 장식이다. 끝났다는 사실이 중요하면 글에 적는다.
- 색만으로 뜻을 전하지 않는다 — 앞선 값은 초록과 **굵기**가 함께 가고, 표에는 「Seedance 우세」처럼
  글로 된 판정이 함께 선다.
- 제목 계층은 `h1`(문서) → `h2`(결정 요청 · 절)다. 절은 `section` + `aria-labelledby` 로 제목에 묶는다.
- 대비 — 본문 · 라벨 · 메타 · 콜아웃 글자는 두 테마에서 4.5:1 을 넘는다(가장 낮은 쌍이 다크의 수치
  라벨 `fg-tertiary`/면 4.74). **넘지 못하는 쌍이 있다** — 아래 Known deviations 1 · 2.

## Specification

| 축 | 값 | 이름 |
| --- | --- | --- |
| 바닥 · 시트 | `bg-canvas` · `bg-surface` + `hairline-inset` · 반경 16 | `radius-overlay` |
| 바닥과 시트 사이 | 8(≤719 에서 0) | `--louis-document-floor-inset` (= `layout-app-shell-outer-gap`, 빌린 값 — 승인본은 12, Known deviations 4 · 5) |
| 시트 최대 폭 · 측정 폭 · 산문 폭 | 1120 · 920 · 760 | `--louis-document-sheet-max-inline-size` · `-measure` · `-prose-measure` |
| 본문 열 여백 | 80 / 40 / 64 | `--louis-document-inset-block-start` · `-inline` · `-block-end` |
| 절 사이 · 절 안 | 72 · 24 | `--louis-document-flow-gap` · `space-layout-section` |
| 박스 사이 | 8 | `--louis-document-box-gap` |
| 카드 여백 | 24 · 32 · 좁은 화면 20 | `--louis-document-card-inset` · `-lg` · `-compact` |
| 면 · 짙은 면 · 강조 면 | `fg-primary` 4% · 8% · `accent-primary` 12% | `--louis-document-face` · `-face-strong` · `-accent-face` |
| 비용 주의(노랑) | `alert-warning-stroke` — 콜아웃 면 16% · 표식 면 | `--louis-document-caution` (빌린 값) |
| 막대 트랙 · 채움 · 앞선 채움 | `progress-track` · `fg-primary` 24% · `accent-primary`, 높이 8 | `--louis-document-bars-track-face` (= `progress-track`, 빌린 값) · `--louis-document-bars-track-block-size` |
| 번호 표식 · 콜아웃 표식 · 칩 · 판정 알약 | 26 · 22 · 28 · 24 | 각 부품 루트의 `--louis-document-*` |
| 타임라인 | 날짜 열 112 · 노드 16 · 이음선 2(`stroke-hairline`) · 들여 30 | `--louis-document-timeline-*` |
| 규선 표 | 머리 14/500 `fg-tertiary` · 셀 12 여백 · 머리 아래 `table-row-line` · 행 사이 `stroke-hairline` | [Table](../components/table.md) |
| 맺음 | 위 24 · `hairline-inset-block-start` · 12 `fg-tertiary` | — |

## Known deviations

1. **강조색 글자가 라이트에서 4.5:1 에 못 미친다.** 키커 · 타임라인 날짜(`accent-primary` 14/500)가
   시트 위 3.37:1 이다(다크 4.90). 번호 표식(12/600, 12% 면 위)은 라이트 2.72 · 다크 3.84 인데 표식은
   `aria-hidden` 인 장식이라 대상이 아니다. 승인본의 색이고, 글자로 쓸 수 있는 파랑 역할(라이트에서
   한 단 짙은 강조 잉크)이 LOUIS 에 없다. 해소는 그 역할 토큰을 세우는 것이고 소유자 판정이다.
2. **앞선 값의 초록이 라이트에서 2.12:1 이다**(다크 4.21). 규선 표의 `data-emphasis="lead"` 가
   `alert-success-stroke` 를 쓴다 — `louis-delta-pill[data-tone="up"]` 과 같은 선택이고 같은 결함이다
   ([Table](../components/table.md) Known deviations). 굵기가 함께 가고 표에 글로 된 판정이 있어 색이
   유일한 전달 수단은 아니지만, 대비는 기준에 못 미친다. 판정 알약은 `fg-success` 라 8.34:1 이다.
3. **문서 규칙 값이 토큰이 아니다** — 위 [값의 출처](#값의-출처). Figma 가 `not-ready` 인 동안의
   상태이고, 토큰으로 올리는 것이 다음 단계다.
4. **승인본과 몇 px 씩 다른 자리가 있다.** 승인본의 6 · 14 · 20 간격을 LOUIS 간격 계단의 4 · 12 · 16 으로
   옮겼고(수치 카드 줄 간격 · 막대 행 간격 · 타임라인 열 간격), 규선 표 셀 여백은 12/14 가 12/12, 좁은
   화면의 10/6 이 8/4 다. 기간 범위의 화살표는 SVG 24 대신 단위 글자(20)다. 표 머리 아래 선과 맺음 선은
   1px 잉크 12% 대신 각각 `table-row-line` 1px · 헤어라인 0.5px 다. 판정 알약 면은 초록 14% 대신
   `accent-green-500-alpha-08` 이다. 390 에서 이 차이는 **줄 바꿈을 바꾸지 않는다** — 절마다 높이를 재어
   대조하면 한 절(「기존 Meta 광고 성과」)만 46 짧고(표 셀 여백 36 · 수치 격자 6 · 비교 막대 4) 맺음이 1
   짧다(아래 [예시](#예시)). 박스 여백은 390 · 360 · 320 모두 승인본과 같다. 바닥과 시트 사이는 720 이상에서
   승인본의 12 가 아니라 8 이다 — 아래 5 의 빌림이 실제로 움직인 자리다(≤719 는 바닥 여백이 0 이라 같다).
5. **다른 부품의 토큰 셋을 빌린다** — 바닥과 시트 사이가 App Shell 의 `layout-app-shell-outer-gap`,
   비교 막대의 빈 트랙이 Progress 의 `progress-track`, 비용 주의 노랑이 Alert 의
   `alert-warning-stroke` 다(위 [값의 출처](#값의-출처)). 문서 역할의 토큰이 없어서이고, 그 부품이
   값을 바꾸면 문서도 따라 움직인다. 루트 이름 셋(`--louis-document-floor-inset` · `-bars-track-face` ·
   `-caution`)만 이 토큰을 읽으므로, 문서 역할의 토큰이 서면 선언 한 줄씩 바꾼다. 앞의 것은
   `scripts/check-coverage-targets.mjs` 의 `DEAD_TOKEN_BASELINE` 을 73 → 72 로 내린 원인이다 — 문서가
   그 토큰을 놓으면 기준선을 73 으로 되돌려야 게이트가 통과한다(DS-D-0067 되돌리기).
   **이 빌림은 한 번 실제로 움직였다.** 링 여백을 제품 값으로 옮긴 결정
   ([DS-D-0063](../governance/decisions/DS-D-0063-ring-and-compact-inset-follow-the-product.md) · Updates (139))이
   `layout-app-shell-outer-gap` 을 12 → 8 로 옮겼고, 이 패턴과 그 결정이 한 브랜치에서 만나면서
   (Updates (148)) 720 이상의 바닥과 시트 사이가 8 이 됐다. 앱 셸이 메인 카드를 띄우는 관계와 같다는
   빌린 이유가 그대로이므로 되돌리지 않았다. 승인본의 12 로 둘지는 문서 역할 토큰을 세울 때 정한다.
6. **좁은 폰에서 4열 격자의 긴 수치가 카드를 넘는다.** ≤719 에서 수치 격자는 2열이고 수치는 한 줄
   고정(`nowrap`)이다. 8자 수치(「₩110,539」, 28px 에서 136)가 390 에서는 카드 안쪽 여백 안에 머물지만,
   360 에서는 카드 경계를 1 넘고 320 에서는 21 넘어 옆 카드 앞까지 번진다. 승인본 CSS 도 같다. 새
   경계(예: ≤374 에서 1열)는 [Responsive Layout](../foundations/responsive-layout.md) 4절 「breakpoint 는
   행동 경계다」에 따라 결정 기록이 필요하고, 콘텐츠 한도(한 행 넷의 수치 글자 수)로 막을지와 함께
   소유자 판정으로 남긴다. 한도의 글자 수는 아직 재지 않았다.

## Acceptance tests

`packages/css/test/document.browser.test.ts` — 실브라우저(chromium), 일반 · reduced-motion 두 project.

1. 시트가 문서의 유일한 헤어라인이고 바닥(`bg-canvas`) 위에 `bg-surface` · 반경 16 으로 선다. 1440 에서
   시트 폭이 1120 이다.
2. 시트 안의 면 아홉 가지(결정 항목 · 카드 · 수치 · 기간 요약 · 콜아웃 둘 · 칩 · 판정 알약 · 표식)에
   그림자도 테두리도 없다.
3. 두 테마에서 면은 `fg-primary` 4% · 칩은 8% 합성색이고, 라이트에서는 시트보다 어둡게 · 다크에서는
   밝게 선다. 카드 안의 수치는 면을 겹치지 않는다.
4. 박스 사이 gap 이 8, 카드 여백이 24 · 32 다.
5. 반경이 역할 토큰(`card` · `alert` · `pill`)이다.
6. 격자가 기본 3열, `data-columns` 2 · 4 열이다.
7. 제목 36/600 · 리드 16/500 · 절 제목 28/600 · 수치 36 `tabular-nums` 한 줄. 키커는 대문자로 바뀌지 않는다. 어떤
   글자도 600 을 넘지 않는다 — 산문 · 결정 항목 · 콜아웃 · 수치 보조 · 표 칸 안의 `strong` 도 600 ·
   `fg-primary` 다(브라우저 기본 `bolder` 가 새지 않는다).
8. 산문은 flex 가 아니다 — `p` 에 붙어도 안의 `strong` 이 쪼개지지 않는다.
9. 비교 막대의 길이가 값이고, 앞선 쪽만 강조색이며, 트랙은 `aria-hidden`, 수치는 글로 남는다.
10. 타임라인의 끝난 노드만 강조색이고 마지막 항목에는 이음선이 없다.
11. 흐름의 화살표는 대체 텍스트가 빈 생성 콘텐츠이고 앞 칩 뒤에 붙으며(줄이 접히면 줄 끝에 남는다) 마지막 칩 뒤에는 없다.
12. 콜아웃 두 톤의 면이 다르고 표식 글리프는 `i` · `!` 이며 장식이다.
13. 판정 알약은 `delta-pill` 이 아니고 `fg-success` 잉크 · 높이 24 이며 카드 머리 끝에 붙는다.
14. 규선 표 — 머리 면이 없고 머리 아래 `table-row-line` 1px, 행 사이 `stroke-hairline`, 첫 · 끝 열 바깥
    여백 0, 행 머리가 굵어지거나 가운데로 가지 않으며, 셀 강조 둘이 선다. `data-align` 두 값(`center` ·
    `end`)이 머리 칸과 몸 칸에서 같다. 변형이 없는 표는 그대로다.
15. ≤719 에서 시트가 화면이 되고(반경 · 헤어라인 · 가장자리 0), 글자가 한 단씩 내려가며, 4열만 2열로
    남고, 가로 스크롤이 없다. 카드 여백은 나열된 박스 20 · 넓은 카드 위아래 24 좌우 20 · 콜아웃 24 이고,
    넓은 카드 안의 글자가 위 카드의 글자와 같은 x 에서 시작한다.
16. 목록 부품 다섯(결정 · 흐름 · 격자 · 막대 · 타임라인)은 `list-style: none` 이고 `role="list"` 를 단다.
    예시(`examples/document.html`)의 목록도 전부 그 다섯 가운데 하나이고 `role="list"` 를 단다.

인쇄와 강제 색은 브라우저 테스트가 재지 않는다 — 규칙만 있다.

## 예시

[`packages/css/examples/document.html`](../../packages/css/examples/document.html) — 승인된 운영안을
LOUIS 클래스만으로 다시 짠 것이다. 파일 안에 `<style>` 이 없고 `packages/css/generated` 를 상대 경로로
링크하므로 저장소에서 그대로 열린다. `?theme=light|dark` 로 테마를 고정한다. 폰트는 Pretendard 를
버전을 고정해(`@v1.3.9`) CDN 에서 읽는다 — 대조 캡처를 다시 뜰 때 글꼴이 바뀌어 높이가 흔들리지 않게
하려는 것이다.

2026-09-21 에 데스크톱 1440 · 모바일 390(배율 2) · 다크 1440 세 판을 Playwright 로 떠서 승인 캡처와
나란히 놓았다. 전체 높이는 데스크톱 5190 / 승인 5193, 모바일 7035 / 승인 7082 이고, 차이는 위 Known
deviations 4 의 간격 계단 반올림에서 온다. 첫 대조에서는 좁은 화면의 기간 요약 카드가 32 여백으로 남아
설명이 한 줄 늘어난 것을 놓쳤다(모바일 7056) — 그 뒤로 박스 여백을 390 · 360 · 320 에서 계산값으로도 잰다.
이 높이는 바닥이 12 이던 때의 것이다. 바닥이 8 이 된 뒤(Known deviations 5) 같은 판을 다시 재면
데스크톱 · 다크 5182, 모바일 7035 다 — 줄어든 8 은 바닥 위아래 4 씩이고, ≤719 는 바닥 여백이 0 이라
그대로다. 같은 페이지에 바닥만 12 로 되돌려 재면 5190 으로 위 기록과 같다.

[`packages/css/examples/document-report.html`](../../packages/css/examples/document-report.html) — 둘째 예시. 부품 선택표의 부품과
변형을 한 문서에 전부 쓴 「LOUIS Figma 화면 보드 9월 운영 보고」다(결정 요청 셋 · 흐름 다섯 칩 · 번호 격자 3열 두 줄 · 무번호 격자 4열 ·
수치 넷과 증감 알약 · 비교 막대 둘 · 규선 표 둘 · 해석 카드 · 분할 카드 · 타임라인 · 참고와 주의 콜아웃). 수치는 저장소 기준(2026-09-28)이고
지어낸 값이 없다. 2026-09-28 에 데스크톱 1440 · 모바일 390(배율 2) · 다크 1440 세 판을 Playwright 로 떴다 — 높이 5394 · 7229 · 5394,
가로 넘침 0. 부록 절이 이 문서를 쓰며 부품이 모자랐던 자리를 적는다(아래 「남은 것」의 부품 목록).

## 남은 것

- 문서 규칙 값을 토큰으로 — Decision · 토큰 원본 · Figma 변수 적용 · 되읽기를 한 작업에서.
- Figma 템플릿 보드(`Pattern · Document`).
- 강조색 글자 · 초록 글자의 대비(Known deviations 1 · 2) — 역할 토큰 판정.
- 빌린 토큰 셋(Known deviations 5) — 문서 규칙 값의 토큰 승격과 같은 작업에서 문서 역할로 옮긴다.
- 좁은 폰의 수치 넘침(Known deviations 6) — 새 경계인지 콘텐츠 한도인지 소유자 판정.
- 제품 소비처. 문서를 만드는 첫 소비처가 이 레시피를 물면 `web` 을 다시 판정한다.
- 운영 보고를 쓰며 모자랐던 부품(`document-report.html` 부록) — 세 시점 이상을 잇는 추이 차트(선 · 계단), 그림과 캡션 · 전후 나란히 보기,
  부분과 전체를 한 줄에 보이는 누적 막대, 규선 표 칸 안의 판정 알약, 각주와 문서 끝 출처 목록, 목차와 절 앵커, 본문 안 코드 표기와 코드 블록,
  인용 블록. 가장 자주 부딪힌 것은 추이와 캡처 첨부다 — 앱 부품으로 대신하지 않고 문서 역할로 세운다(DS-D-0067).
