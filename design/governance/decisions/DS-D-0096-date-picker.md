---
id: decision-date-picker
status: experimental
authority: normative
---

# DS-D-0096 날짜는 달력에서, 시각은 세 열에서 고르는 칸들을 새 부품 `date-picker` 로 — 면이 없는 내용 부품, Menu 값 목록의 변형이 아니다

- Status: accepted (소유자 지시로 초안의 기본값을 받는다, 2026-10-14)
- Date: 2026-10-14
- Owners: repository owner, design system maintainer
- Affects: `date-picker`, `menu-popover`, `icon-button`, `button`, `select`, `node-shell`, `decision-product-parts-become-louis`

## Context

[DS-D-0084](DS-D-0084-product-parts-become-louis.md) 승격 목록의 「큰 것(각각 Decision 먼저)」에 `date-picker` 가 있다(B2 #34 · #35). 제품에는 날짜 · 시각 고르기가
두 벌 있다 — 캔버스 유튜브 노드의 예약 팝오버(`components/scenes/create/node-canvas-v2/components/YoutubeSchedulePickers.tsx`, 통합 판 `54b62a8aa`, 날짜 · 시각
두 팝오버)와 게시 흐름의 인라인 달력(`components/scenes/create/PublishFlow.tsx:347-406`). 두 화면이 상수 마흔여 개로 각자 그린다
(`YoutubeSchedulePickers.tsx:54-180` 서른 · `PublishFlow.tsx:95-133` 열).

LOUIS 에 달력도 시각 열도 없다. 가장 가까운 [Menu / Popover](../../components/menu-popover.md) 값 목록(`.louis-menu__item[aria-selected]`)은 **한 열 목록**이고
선택 표시가 잉크 12%(흰 면 대비 1.28)다. 달력은 2차원 격자라 표 의미 · 열 맞춤 · 6주 고정 높이 · 오늘 표시가 필요하고, 시각 세 열은 각각 구르는 우물이다.
[Segmented Control](../../components/segmented-control.md)은 칸 수가 고정된 한 줄이다.

제품 값에 결함이 있다. 팝오버 쪽은 선택 칸 면이 쉼 면 대비 라이트 1.77 · 다크 2.57(상태 표식 3:1 미달), 다크 시각 우물이 팝오버 면과 같은 값(1.00)이라
사라지고 라이트 항목 호버가 우물에 녹는다(1.00). `aria-modal` 이라 말하지만 포커스를 옮기지도 가두지도 않고, 날짜 칸 이름이 숫자뿐이며, 시각 선택이 색으로만
말한다. 게시 흐름 쪽은 요일 · 이동 이름이 영어 고정이고 요일 대비가 3.45 이며, 달을 넘기면 선택값이 바뀐다.

## Decision

1. **새 컴포넌트 `date-picker` 하나, 두 모드**(`data-mode="date"` · `"time"`). `.louis-date-picker` · `__header` · `__title` · `__grid` · `__weekday` · `__cell` ·
   `__day` · `__footer` · `__time` · `__column` · `__column-label` · `__listbox` · `__option`. **면이 없는 내용 부품**이다 — 팝오버면
   `.louis-popover[data-kind="composite-popover"]`(제품 34 · 35), 인라인이면 소비처 카드(`data-layout="inline"`, 게시 흐름).
2. **날짜 칸과 시각 항목은 한 칸 문법**이다 — 높이 36 · 곡률 `radius-overlay-item` 10 · 호버 · 키보드 위치 `accent-ghost-hover` · 선택 `accent-inverse` +
   `fg-on-accent-inverse` · 막힘 `fg-disabled`. 선택이 호버 · 포커스 · 막힘을 이긴다.
3. **격자는 `table[role="grid"]`** — 요일 머리와 칸이 같은 열을 쓰고(`border-spacing` 4), 늘 6주 42칸. 오늘은 `aria-current="date"` + 숫자 아래 점 4.
4. **시각은 세 `listbox`** — 우물 `accent-secondary`(잉크 8%) · 곡률 12 · 안쪽 2 · 상한 196, 키보드 위치는 `aria-activedescendant` + `data-highlighted`.
5. **달 이동 · 「오늘」은 기존 부품을 문다** — `icon-button` secondary md + `icon/caret-left` · `-right`, `button` ghost md. 새 토큰 0.
6. **행동은 소비처다** — 위치 · 겹 순서 · 포커스 이동 · 방향키 · 달 계산 · 문자열. 접근성 계약(APG 날짜 선택 대화)은 문서가 소유하고 제품 (나)에서 고친다.
   React 표면 · 새 의존성 · 패키지 구조는 만들지 않는다.

### 소유자 판정 — 초안의 기본값으로 정했다

초안(`scratchpad/promote/big/date-picker.md`, 작업 폴더)이 남긴 판정 열을 소유자 지시로 초안이 권한 기본값으로 정했다. 뒤집으면 레시피 한 곳을 고친다.

| # | 판단 | 기본값 | 대안 |
| --- | --- | --- | --- |
| 1 | 부품의 자리 | 새 컴포넌트 `date-picker` 하나에 두 모드(`date` · `time`) — 같은 면 · 같은 칸 문법 · 같은 소비처. 이름이 시각을 말하지 않는 것은 대가다 | `date-picker` 와 `time-picker` 둘(칸 규칙 · 문서 · Figma 칸 세트가 두 벌) · 제품 화면 고유(DS-D-0084 위반) |
| 2 | 선택 표현 | `accent-inverse` 면 + `fg-on-accent-inverse` 글자(면 21.0 · 16.54, 글자 20.12 · 20.12). 게시 흐름 · ChoiceCard 행 고름이 이미 이 짝이다 | 메뉴 값 목록 잉크 12%(1.28 · 1.42) · 제품 고정 팔레트 `pg-200` · `pg-600`(1.77 · 2.57) — 둘 다 상태 표식 3:1 미달 |
| 3 | 오늘 표시 | `aria-current="date"` + 숫자 아래 점 4(`currentColor`, Figma BOOLEAN `Today`) | `aria-current` 만(제품대로) · 칸 테두리 링(키보드 위치 · 선택과 겹친다) |
| 4 | 둘째 소비처(게시 흐름 인라인 달력) | 같은 부품 `data-layout="inline"` 으로 접는다 — 원 칸 · body-16 → 곡률 10 · body-14 | 이번 회차는 팝오버만 · 인라인에 제품 모양을 축으로 |
| 5 | 작은 값 접기 | 시각 항목 37 → 36, 격자 → 바닥 20 → 16(`space-control-lg`), 열 머리 → 우물 6 → 4(`space-stack-xs`), 「오늘」 33 → 32 · 곡률 10 → 12(`button` md), 이동 버튼 면 `pg-100` → `icon-button` secondary · 글자 글리프 → `icon/caret-*`, 팝오버 안쪽 6 → 8(바깥 폭 296 · 256 유지). 이름 없는 값(폭 280 · 240, 칸 36, 우물 196, 점 4)만 출처 주석 리터럴 | 전부 제품 값 리터럴 |
| 6 | 시각 우물 면 | `accent-secondary` 잉크 8%(SegmentedControl 트랙 선례, 1.17 · 1.25) — 알파라 캔버스 흰 면이든 앱 `bg-menu` 든 같은 관계 | 제품 값(라이트 `pg-100` · 다크 `gray-900` 1.00) · `bg-inset` |
| 7 | 막힌 날의 포커스 | `aria-disabled` — 포커스는 받고 값은 안 된다(방향키가 지난 날을 지나간다) | 네이티브 `disabled`(제품대로 — 방향키 이동에 구멍) |
| 8 | 시각 열의 의미 | 열마다 `listbox` + `aria-activedescendant`, 움직이면 바로 값 | 버튼 + `aria-pressed`(Tab 정거장 74개) · `radiogroup` |
| 9 | 겹 순서 | 소비처가 `louis-layer-modal` 을 고른다 — 제품 10300 은 캔버스 하단 툴바(10000) · 영상 편집 모달(10100) 위에 서려는 값이다. 레시피에는 숫자도 layer 도 없다 | `louis-layer-popover`(툴바 밑으로 깔린다) · 새 layer 토큰 |
| 10 | 접근성 계약 | APG 날짜 선택 대화 계약 전부(초기 포커스 · 가둠 · Esc 복귀 · 방향키 · PageUp/Down · 전체 날짜 이름 · `aria-live` 달 이름)를 문서 계약으로, 제품 (나)에서 고친다 | 제품 행동을 기록만 |

### 경계와 하지 않는 것

- 부품이 소유한다 — 달 머리 배치(사이 8 · 머리 → 격자 12), 요일 줄 + 6주 42칸 격자(칸 36 · 사이 4 · 요일 → 첫 줄 8), 칸 상태(쉼 · 호버 · 키보드 위치 · 선택 · 막힘 ·
  선택 + 막힘 · 오늘), 바닥 줄(격자 → 바닥 16, 오른쪽 정렬), 세 열 시각(열 사이 8 · 머리 → 우물 4 · 우물 · 항목), 강제 색.
- 놓이는 자리가 소유한다 — 면 · 곡률 · 그림자 · 안쪽 여백(`.louis-popover[data-kind="composite-popover"]` 또는 카드), 위치 · 겹 순서.
- 소비처가 소유한다 — 달 계산(첫 요일 · 일수 · 42칸 채움) · 최소 날짜 · 최소 시각 · 12/24시간 · 요일 · 달 이름 문자열(`Intl.DateTimeFormat`) · 주 시작 요일,
  열 때 선택 항목 굴리기, 바깥 누름 · Esc · 포커스 이동 · 복귀 · 방향키, 캔버스로 휠 · 포인터가 새지 않게 막기. 트리거는 `node-shell` `__field` 회차 몫(B2 #53).
- 하지 않는 것 — 기간 선택(시작 · 끝), 여러 날 선택, 주 번호, 달 · 해 드롭다운, 24시간 열 · 초 열, 시간대, 시각 직접 입력, 휠 · 드럼 굴림 모션,
  어드민 네이티브 `<input type="date">` 넷의 교체, 게시 흐름의 네이티브 시각 입력 교체(별건), React 컴포넌트.

## Consequences

- 새 토큰 0. 생성물 · 토큰 기준선이 움직이지 않는다.
- 제품 (나): `YoutubeSchedulePickers.tsx` 의 상수를 `louis-date-picker*` 클래스로, 면은 `louis-popover` + `data-kind="composite-popover"` + `data-louis-scope="canvas"`,
  `fixed z-[10300]` · 손 위치 잡기(높이 추정 360 · 280 대 실제 370 · 234)를 LOUIS overlay(positioner + `louis-layer-modal`)로, `div` 격자를 `table[role="grid"]` 로,
  세 열을 `listbox` 셋으로, 대화상자 포커스 계약과 방향키. `PublishFlow.tsx` 는 같은 마크업 `data-layout="inline"`, 문자열을 앱 로캘로, 달 이동이 값을 바꾸지 않게.
  보이는 변화 — 선택 날 · 시각이 라이트 검정 · 다크 흰 면, 다크 시각 우물이 보임, 게시 흐름 칸이 원에서 곡률 10 · 글자 16 → 14, 요일 · 이동 이름이 앱 언어, 오늘에 점.
- Figma — `DatePickerCell` · `DatePickerCalendar` · `DatePickerTime` 세트(figma `partial` — 제품 렌더 대조 전).

## Rollback

`date-picker.css` · 문서 · manifest 세 자리 · Figma 세 세트 · 기록 · parity 계약 · 되읽기 명세를 지우면 끝난다. 토큰을 더하지 않아 생성물 · 기준선이 움직이지 않는다.
제품은 아직 이 클래스를 물지 않으므로 화면 변화가 없다.
