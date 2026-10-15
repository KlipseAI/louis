---
id: date-picker
status: experimental
authority: normative
summary: 달력에서 날짜를, 세 열에서 시각을 고릅니다. 면은 놓이는 자리가 갖습니다.
---

# Date Picker

날짜와 시각을 고르는 칸들이다(`.louis-date-picker`, [DS-D-0096](../governance/decisions/DS-D-0096-date-picker.md) · [DS-D-0084](../governance/decisions/DS-D-0084-product-parts-become-louis.md)).
날짜 모드는 달 머리 · 요일 · 6주 42칸이고, 시각 모드는 오전/오후 · 시 · 분 세 열이다. **면은 없다** — 팝오버로 띄우면
[Menu / Popover](menu-popover.md) 의 composite 면에, 화면 안에 두면 소비처 카드에 놓인다. 값 하나를 한 열 목록에서 고르는 자리는 [Select](select.md)다.

제품 정본은 `components/scenes/create/node-canvas-v2/components/YoutubeSchedulePickers.tsx@54b62a8a:54-180`(통합 판 `54b62a8aa`) — 유튜브 노드 예약
(`components/scenes/create/node-canvas-v2/nodes/YoutubeNode.tsx:1500` · `:1510`)이 쓰고, 게시 흐름의 인라인 달력(`components/scenes/create/PublishFlow.tsx:437-473`)이
같은 해부를 따로 그린다.

**있는 부품을 그대로 받는다.** 면은 `.louis-popover[data-kind="composite-popover"]`(캔버스 안이면 `data-louis-scope="canvas"` — 라이트 흰색),
달 이동은 [Icon Button](icon-button.md) secondary md + `icon/caret-left` · `-right`, 「오늘」은 [Button](button.md) ghost md. 이 부품이 소유하는 것은
머리 배치 · 격자 · 칸 상태 · 바닥 줄 · 세 열 시각이다.

```html
<!-- 날짜 · 팝오버 (제품 유튜브 노드 예약) -->
<div class="louis-popover louis-overlay-panel louis-layer-modal" data-kind="composite-popover" data-louis-scope="canvas"
     role="dialog" aria-modal="true" aria-label="예약 날짜 선택">
  <div class="louis-date-picker" data-mode="date">
    <div class="louis-date-picker__header">
      <button type="button" class="louis-icon-button" data-variant="secondary" data-size="md" aria-label="이전 달">
        <svg class="louis-icon-button__glyph" aria-hidden="true"><!-- icon/caret-left --></svg>
      </button>
      <h2 class="louis-date-picker__title" id="yt-date-title" aria-live="polite">2026년 10월</h2>
      <button type="button" class="louis-icon-button" data-variant="secondary" data-size="md" aria-label="다음 달">
        <svg class="louis-icon-button__glyph" aria-hidden="true"><!-- icon/caret-right --></svg>
      </button>
    </div>
    <table class="louis-date-picker__grid" role="grid" aria-labelledby="yt-date-title">
      <thead>
        <tr>
          <th class="louis-date-picker__weekday" scope="col" abbr="일요일">일</th>
          <!-- … 7개 -->
        </tr>
      </thead>
      <tbody>
        <tr>
          <td class="louis-date-picker__cell"></td>                       <!-- 달 앞 빈 칸 -->
          <td class="louis-date-picker__cell" aria-selected="false">
            <button type="button" class="louis-date-picker__day" tabindex="-1" aria-disabled="true"
                    aria-label="2026년 10월 1일 목요일">1</button>
          </td>
          <!-- … -->
        </tr>
        <tr>
          <td class="louis-date-picker__cell" aria-selected="true">
            <button type="button" class="louis-date-picker__day" tabindex="0" aria-current="date"
                    aria-label="2026년 10월 13일 화요일">13</button>
          </td>
          <!-- … 늘 6줄 × 7칸 -->
        </tr>
      </tbody>
    </table>
    <div class="louis-date-picker__footer">
      <button type="button" class="louis-button" data-variant="ghost" data-size="md">오늘</button>
    </div>
  </div>
</div>

<!-- 시각 · 팝오버 -->
<div class="louis-popover louis-overlay-panel louis-layer-modal" data-kind="composite-popover" data-louis-scope="canvas"
     role="dialog" aria-modal="true" aria-label="예약 시각 선택">
  <div class="louis-date-picker" data-mode="time">
    <div class="louis-date-picker__time">
      <div class="louis-date-picker__column">
        <span class="louis-date-picker__column-label" aria-hidden="true"></span>
        <div class="louis-date-picker__listbox" role="listbox" tabindex="0" aria-label="오전/오후"
             aria-activedescendant="yt-time-am">
          <div class="louis-date-picker__option" role="option" id="yt-time-am" aria-selected="true" data-highlighted="true">오전</div>
          <div class="louis-date-picker__option" role="option" id="yt-time-pm" aria-selected="false">오후</div>
        </div>
      </div>
      <div class="louis-date-picker__column">
        <span class="louis-date-picker__column-label" id="yt-time-hour">시</span>
        <div class="louis-date-picker__listbox" role="listbox" tabindex="0" aria-labelledby="yt-time-hour"
             aria-activedescendant="yt-time-h03">
          <div class="louis-date-picker__option" role="option" id="yt-time-h12" aria-selected="false">12</div>
          <!-- 12, 01 … 11 -->
        </div>
      </div>
      <div class="louis-date-picker__column">
        <span class="louis-date-picker__column-label" id="yt-time-minute">분</span>
        <div class="louis-date-picker__listbox" role="listbox" tabindex="0" aria-labelledby="yt-time-minute">
          <div class="louis-date-picker__option" role="option" id="yt-time-m00" aria-selected="false" aria-disabled="true">00</div>
          <!-- 00 … 59 -->
        </div>
      </div>
    </div>
  </div>
</div>

<!-- 날짜 · 인라인 (게시 흐름) — 면은 소비처 카드, 대화상자가 아니다. 바닥 줄은 없어도 된다 -->
<div class="louis-date-picker" data-mode="date" data-layout="inline"> … </div>
```

계산값: 날짜 팝오버 296 × 370(내용 280 = 바깥 296 − composite 안쪽 8 × 2), 시각 팝오버 256 × 234(내용 240).

## Availability

| Surface       | 상태           | 근거 |
| ------------- | -------------- | ---- |
| Web           | `partial`      | CSS recipe `packages/css/src/component/date-picker.css` · 실브라우저 시험 `date-picker.browser.test.tsx`. React 표면은 없다 — 행동(포커스 · 방향키 · 위치 · 달 계산)은 소비처가 클래스와 마크업 계약을 문다(DS-D-0096) |
| Figma         | `done`      | 2026-10-14 — `DatePickerCell` 세트(Selected `false` · `true` — 코드 `aria-selected` × State `Default` · `Hover` · `Disabled`, Selected=true 의 Hover · Disabled 는 같은 그림의 채움 칸, BOOLEAN `Today` — 오늘 점, TEXT `Label` — 날짜 칸과 시각 항목이 한 세트), 달력 `DatePickerCalendar`(Layout `base` · `inline` — 코드 `data-layout`, TEXT `Month`, BOOLEAN `HasFooter`, 칸은 시드 데이터 2026년 10월), 시각 세 열 `DatePickerTime`(우물 196 은 clipsContent 로 구르는 자리를 보인다), 예시 보드 둘(캔버스 팝오버 296 × 370 · 256 × 234). 이동은 `IconButton` secondary md + `icon/caret-left` · `-right`, 「오늘」은 `Button` ghost md 인스턴스다. `tabular-nums` 는 Figma 글자 스타일에 없다. 기록 `date-picker-cell` · `-calendar` · `-time` 과 parity 기하 계약, 실브라우저 되재기(`date-picker-geometry.browser.test.tsx`). 제품 렌더 대조는 없다 |
| Documentation | `done`         | 이 문서 |
| Maturity      | `experimental` | 제품이 아직 이 클래스를 물지 않는다 |

## When to use

- 예약 · 마감처럼 **하루**를 고를 때(날짜 모드), 그 날의 **시각**을 고를 때(시각 모드). 트리거 하나에 팝오버 하나 — 날짜와 시각은 따로 연다.
- 값 하나를 한 열 목록에서 고르는 자리는 [Select](select.md), 고정된 몇 칸 중 하나는 [Segmented Control](segmented-control.md)다.
- 기간(시작 · 끝) · 여러 날 · 시간대는 이 부품의 범위 밖이다(DS-D-0096 「하지 않는 것」).

## Anatomy

1. 루트(`.louis-date-picker`) — 면이 없다. `data-mode` 가 담는 해부와 폭(280 · 240)을 고른다.
2. 머리(`__header`) — 이동 버튼 둘(Icon Button) + 달 이름(`__title`), 사이 8, 머리 → 격자 12.
3. 격자(`__grid`, `table[role="grid"]`) — 요일 머리(`__weekday`) 일곱 + 6주 42칸(`__cell` > `__day`). 칸 높이 36 · 사이 4, 요일 → 첫 줄 8.
4. 바닥(`__footer`) — 「오늘」(Button ghost md) 오른쪽 정렬, 격자 → 바닥 16.
5. 시각(`__time`) — 세 열(`__column`) 사이 8. 열 머리(`__column-label`, 18) → 우물 4.
6. 우물(`__listbox`) — 잉크 8% · 곡률 12 · 안쪽 2 · 항목 사이 4 · 높이 상한 196, 넘치면 구른다.
7. 칸(`__day` · `__option`) — 날짜 칸과 시각 항목이 같은 칸이다. 36 · 곡률 10 · 글자 body-sm regular · `tabular-nums`. 오늘 점 4(아래 4).

| 치수 | 값 |
| --- | --- |
| 날짜 팝오버 | 296 × 370 |
| 시각 팝오버 | 256 × 234 |
| 칸 높이 · 사이 · 곡률 | 36 · 4 · 10 |
| 머리 → 격자 · 요일 → 첫 줄 · 격자 → 바닥 | 12 · 8 · 16 |
| 열 사이 · 머리 → 우물 · 우물 안쪽 · 곡률 · 상한 | 8 · 4 · 2 · 12 · 196 |
| 오늘 점 · 아래 | 4 · 4 |

## Properties

| 속성 | 자리 | 뜻 |
| --- | --- | --- |
| `data-mode` | 루트 | `date` · `time` — 폭(280 · 240)과 담는 해부 |
| `data-layout="inline"` | 루트 | 폭을 놓인 자리에 맡긴다(없으면 팝오버 폭) |
| `aria-selected` | `td.__cell` · `.__option` | 지금 값. 날짜는 칸(`gridcell`)이, 시각은 항목(`option`)이 가진다 |
| `aria-disabled="true"` | `.__day` · `.__option` | 고를 수 없는 날 · 시각. 날짜는 포커스를 받는다(방향키가 지나간다). 네이티브 `disabled` 도 같은 모양이다 |
| `aria-current="date"` | `.__day` | 오늘 — 점 |
| `data-highlighted="true"` | `.__option` | `aria-activedescendant` 가 가리키는 항목(키보드 위치) |
| `tabindex` | `.__day` | 로빙 — 한 칸만 0 |

주 시작 요일 · 요일 · 달 이름 문자열 · 최소 날짜 · 최소 시각 · 12/24시간은 데이터다(소비처).

## States

| 상태 | 날짜 칸 | 시각 항목 |
| --- | --- | --- |
| 쉼 | 투명 · 팝오버 잉크(`fg-menu-item`) | 같음 |
| 호버(`hover: hover`) | `accent-ghost-hover` | 같음 |
| 키보드 위치 | `:focus-visible` → 호버 면 | `data-highlighted` → 호버 면 |
| 선택 | `accent-inverse` + `fg-on-accent-inverse`, 호버해도 그대로 | 같음 |
| 막힘 | `fg-disabled` · not-allowed · 호버 없음, 포커스는 받는다 | 같음 |
| 선택 + 막힘 | 선택 면이 이긴다 · 커서만 not-allowed | 같음 |
| 오늘 | 점 4 · `currentColor`(선택 칸에서는 뒤집힌 글자색) | — |

## Content

- 달 이름 · 요일은 앱 언어로(`Intl.DateTimeFormat` 에 앱 로캘을 준다 — 브라우저 로캘이 아니다).
- 요일 머리는 짧은 이름 + `abbr` 에 긴 이름. 날짜 칸 접근 이름은 전체 날짜(「2026년 10월 13일 화요일」).
- 시각은 두 자리(`01` · `05`). 오전/오후 열은 보이는 머리가 비어도 목록에 이름(`aria-label`)을 단다.

## Accessibility

**팝오버(대화상자)** — 트리거 `aria-haspopup="dialog"` · `aria-expanded`. 열면 포커스가 선택 칸(없으면 오늘, 없으면 첫 고를 수 있는 날)으로 간다.
Tab 은 대화상자 안에서 돈다(이동 · 격자 한 자리 · 「오늘」). Esc · 바깥 누름은 닫고 포커스를 트리거로 돌린다. 날짜를 고르면 닫힌다.

**날짜 격자 키보드**(APG Date Picker Dialog 와 같다):

| 키 | 동작 |
| --- | --- |
| ← → | 하루 앞뒤(RTL 에서 반대) |
| ↑ ↓ | 한 주 앞뒤 |
| Home End | 그 주 처음 · 끝 |
| PageUp PageDown | 한 달 앞뒤(같은 날, 없으면 그 달 끝날) |
| Shift + PageUp PageDown | 한 해 앞뒤 |
| Enter Space | 고른다(막힌 날은 아무 일 없음) |

달을 넘기면 달 이름이 `aria-live="polite"` 로 읽힌다. 달 이동은 **값을 바꾸지 않는다**.

**시각 열 키보드** — 각 열이 `listbox` 하나(Tab 으로 열 사이 이동). ↑ ↓ 한 칸, Home End 처음 · 끝, 움직이면 바로 값이 된다(선택이 포커스를 따른다 — 제품의
「누르면 즉시 값」과 같다). 막힌 항목은 건너뛰지 않고 지나가되 값이 되지 않는다. 열 때 선택 항목이 우물 가운데로 굴러 있다.

**인라인** — 대화상자 계약 없이 격자 · 키보드만. 포커스 링은 그리지 않는다(DS-D-0074) — 위치는 호버 면이 말하고, 강제 색에서는 선택이 `Highlight`,
막힘이 `GrayText`, 우물이 `CanvasText` 테두리, 시각 항목의 키보드 위치가 `Highlight` 외곽선이다.

## Acceptance tests

`packages/react/test/date-picker.browser.test.tsx` 가 클래스 마크업을 composite 팝오버 안에서 실브라우저로 렌더해 잰다. `packages/react/test/date-picker-geometry.browser.test.tsx` 는 기록 `figma/components.measured.json` 의 `date-picker-cell` · `-calendar` · `-time` 을 코드가 만드는지 되잰다.

1. 날짜 팝오버 296 × 370 · 시각 팝오버 256 × 234. 칸 36 · 사이 4, 머리 → 격자 12 · 요일 → 첫 줄 8 · 격자 → 바닥 16.
2. 요일 머리와 날짜 칸의 가로 중심이 같다(같은 열). 6주 고정 — 다섯 주 달도 높이가 같다.
3. 우물 상한 196 · 넘치면 구른다. 오전/오후 머리가 비어도 세 우물의 위 끝이 같다.
4. 대비는 실제로 잰다(`fixtures/contrast.ts`, 두 테마) — 선택 면 대 쉼 면 ≥ 3 · 선택 글자 ≥ 4.5 · 쉼 글자 ≥ 4.5 · 요일 · 열 머리 ≥ 4.5.
5. 막힌 칸은 호버 면이 없다. 선택 + 막힘은 선택 면이다.
6. 오늘 점 4 × 4 가 칸 가운데(LTR · RTL).
7. 호버 규칙은 모두 `@media (hover: hover)` 안이다.

## Known deviations

제품 대비 바뀌는 것(DS-D-0096 판정 2 · 5 · 6):

1. 선택 면이 뒤집힌다 — 제품 `pg-200` · `pg-600`(쉼 면 대비 1.77 · 2.57)을 `accent-inverse`(21.0 · 16.54)로 고쳐 올린다(DS-D-0084 3항).
2. 시각 우물이 `accent-secondary` 잉크 8% 다 — 제품 다크 `gray-900` 은 팝오버 면과 같은 값(1.00)이었다. 라이트는 제품보다 옅다(1.35 → 1.17).
3. 시각 항목 37 → 36, 격자 → 바닥 20 → 16, 열 머리 → 우물 6 → 4, 「오늘」 33 → 32 · 곡률 10 → 12.
4. 이동 버튼 면 `pg-100` → Icon Button secondary(`bg-surface` + 헤어라인), 글자 글리프 `‹ ›` → `icon/caret-*`.
5. 팝오버 안쪽 6 → 8(composite). 바깥 폭 296 · 256 은 같다.
6. 요일 줄과 칸이 같은 열을 쓴다 — 제품은 요일 사이 2 · 칸 사이 4 로 열이 어긋났다.
7. 게시 흐름 인라인 달력은 원 칸 · 글자 16 → 곡률 10 · 글자 14(DS-D-0096 판정 4).

## 제품에서 발견한 것

1. **모달이라고 말하지만 모달이 아니다.** `aria-modal={true}`(`components/scenes/create/node-canvas-v2/components/YoutubeSchedulePickers.tsx:424` · `:621`)인데 열 때
   포커스가 들어가지 않고, 가두지 않고, 닫혀도 트리거로 돌아가지 않는다. Esc 는 문서 전체 `keydown` 으로 잡는다(`YoutubeSchedulePickers.tsx:273-275`).
   키보드 사용자는 Tab 으로 날짜 칸 42개를 하나씩 지나가야 한다(방향키가 없다).
2. **날짜 칸 이름이 숫자뿐이다**(`YoutubeSchedulePickers.tsx:524`) — 「13」만 읽혀 무슨 달 무슨 요일인지 모른다. 요일 머리는 `span` 이라 열 머리로 이어지지 않는다
   (`YoutubeSchedulePickers.tsx@54b62a8a:418`).
3. **시각 선택이 색으로만 말한다** — 항목이 `button` 인데 `aria-pressed` · `aria-selected` 가 없다(`YoutubeSchedulePickers.tsx@54b62a8a:640-650` · `:662-674` · `:685-697`).
   오전/오후 열은 이름이 없다(`YoutubeSchedulePickers.tsx@54b62a8a:630-632`).
4. **막힌 시각 항목이 눌릴 것처럼 보인다** — 비활성 규칙이 없어 호버 면 · `pointer` 가 그대로다(`YoutubeSchedulePickers.tsx@54b62a8a:163-164`).
5. **다크 시각 우물이 사라진다**(`gray-900` = 팝오버 면, 1.00, `YoutubeSchedulePickers.tsx@54b62a8a:160`), **라이트 항목 호버가 우물에 녹는다**(`pg-100` / `pg-100`, 1.00,
   `YoutubeSchedulePickers.tsx@54b62a8a:170`).
6. **선택 칸 면 대비 미달** — 1.77 · 2.57(`YoutubeSchedulePickers.tsx@54b62a8a:92-94`), 시각 우물 위 1.31 · 2.57(`YoutubeSchedulePickers.tsx@54b62a8a:173-176`).
7. **요일 줄과 날짜 칸의 열이 어긋난다** — 열 사이 2 대 4(`YoutubeSchedulePickers.tsx@54b62a8a:72` · `:79`).
8. **높이 추정이 실제와 다르다** — 360 · 280(`YoutubeSchedulePickers.tsx:94` · `:187`) 대 실제 371 · 234. 위로 뒤집으면 날짜 팝오버가 앵커를 3px 덮고
   시각 팝오버는 46px 뜬다(`YoutubeSchedulePickers.tsx:134-136`).
9. 「선택 + 지난 날」의 다크 전용 호버 비대칭을 일부러 옮겼다(`YoutubeSchedulePickers.tsx@54b62a8a:110-121`) — 원본 모듈 CSS 의 특이도 사고를 보존한 것이다.
   레시피는 선택이 이기는 한 규칙으로 접는다.
10. 바닥의 `pt-4`(`YoutubeSchedulePickers.tsx@54b62a8a:130`)는 구분선이 없는데 남은 여백이다.
11. **게시 흐름 달력이 영어 고정이다** — 요일 `["Su",…]`(`components/scenes/create/PublishFlow.tsx@54b62a8a:259`), 이동 이름 `"Previous month"` · `"Next month"`
    (`PublishFlow.tsx@54b62a8a:353` · `:363`), 달 이름은 브라우저 로캘(`PublishFlow.tsx@54b62a8a:254`). 요일 대비 3.45(`PublishFlow.tsx@54b62a8a:113`). **달을 넘기면 값이 바뀐다**
    (`PublishFlow.tsx:249-257`) — 지난 달로 넘기면 지난 날이 예약값이 된다. 주 수가 5–6 으로 바뀌어 높이가 뛴다(`PublishFlow.tsx:240-243`).
    시각 입력이 라이트 테마에서도 `color-scheme: dark` 다(`PublishFlow.tsx:73`).
12. 예약 트리거의 자리표시 잉크가 32%(`components/scenes/create/node-canvas-v2/nodes/YoutubeNode.tsx:547-550`)라 대비 미달이다 — 트리거는 `node-shell` `__field`
    회차 몫이라 여기서 고치지 않고 그 회차에 넘긴다.
