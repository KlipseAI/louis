---
id: segment-track
status: experimental
authority: normative
summary: 원본 영상의 시간축 위에 구간을 놓고 그중 하나를 무대에 올린다. 무대 아래 상태 | 행동 막대(Stage Bar)를 짝으로 갖는다.
---

# Segment Track

원본 영상의 길이를 눈금으로 깔고, 그 위에 AI 가 찾은 구간을 두 번 보여 준다 — **전체 지도**(원본 자리 그대로의 가는 막대)와
**구간 줄**(시간 순서대로 읽을 수 있는 칸). 자리는 지도가, 이름과 상태는 구간 줄이 늘 맡는다(`.louis-segment-track`,
[DS-D-0084](../governance/decisions/DS-D-0084-product-parts-become-louis.md), [DS-D-0083](../governance/decisions/DS-D-0083-deck-feedback-triage.md) 2b).
영상 길이에 따라 모양을 바꾸지 않는다 — 두 시간 경기의 30초 구간은 1440 화면에서 4px 이라, 원본 자리 그대로의 칸은 이름을 담지 못한다.

같은 파일의 짝 블록 **Stage Bar**(`.louis-stage-bar`, 아래 「Stage Bar — 무대 아래 막대」 절)는 무대 바로 아래의 상태 | 행동 한 줄이다.
트랙과 같은 올린 면이고, 안의 조작은 전부 LOUIS 부품 그대로다.

제품 정본은 `StudioSegmentTrack.tsx:121-158` · `highlightSceneStyles.ts:1408-1587` · `highlightSceneStyles.ts:1750-1842`(통합 판 `54b62a8aa`)이고
소비처는 하이라이트 허브의 빈 트랙(`HighlightScene.tsx:985`)과 스튜디오 판(`HighlightStudioBoard.tsx:1528`) 둘이다.

```html
<section class="louis-segment-track" aria-label="하이라이트" style="--louis-segment-track-minor: 4%">
  <div class="louis-segment-track__ruler" aria-hidden="true">
    <span class="louis-segment-track__tick" style="--louis-segment-track-at: 0">0:00</span>
    <span class="louis-segment-track__tick" style="--louis-segment-track-at: 50">45:00</span>
    <span class="louis-segment-track__tick" style="--louis-segment-track-at: 100">90:00</span>
  </div>
  <span class="louis-segment-track__label">
    <span class="louis-segment-track__label-glyph" aria-hidden="true">…</span>하이라이트
  </span>
  <!-- 빈 트랙이면 지도와 구간 줄 대신: <div class="louis-segment-track__lane">새 하이라이트</div> -->
  <div class="louis-segment-track__map" aria-hidden="true" style="--louis-segment-track-lanes: 2">
    <span class="louis-segment-track__map-bar" data-look="clip" data-current="true"
          style="--louis-segment-track-start: 12.5; --louis-segment-track-span: 3.1; --louis-segment-track-lane: 0"></span>
    <span class="louis-segment-track__map-playhead" style="--louis-segment-track-at: 13.4"></span>
  </div>
  <div class="louis-segment-track__strip" role="toolbar" aria-label="구간" aria-orientation="horizontal" data-fade-end="true">
    <button type="button" class="louis-segment-track__block" data-look="clip" aria-current="true"
            aria-label="1 후반 89분 역전 결승골, 클립" title="1 후반 89분 역전 결승골, 클립" tabindex="0"
            style="--louis-segment-track-weight: 31">
      <span class="louis-segment-track__block-label">
        <span class="louis-segment-track__block-number">1</span>
        <span class="louis-segment-track__block-title">후반 89분 역전 결승골</span>
      </span>
      <span class="louis-segment-track__block-playhead" aria-hidden="true" style="--louis-segment-track-at: 42"></span>
    </button>
    <!-- 나머지 칸은 tabindex="-1" -->
  </div>
</section>
```

## Anatomy

1. **틀** — 올린 면(`bg-raised` · 헤어라인 · `radius-card`), 안쪽 위 12 · 좌우 16 · 아래 14. 두 칸 격자 — 줄 머리 96 · 사이 12 · 줄 사이 6.
2. **눈금**(`__ruler` · `__tick`) — 높이 28. 시각 글자(caption regular · `fg-tertiary` · 고정폭 숫자) + 글자 아래 2 띄운 큰 눈금 1 × 8
   (`stroke-default`), 바닥에 잔눈금 1px · 높이 4(`stroke-subtle`). 보조기술에는 감춘다.
3. **줄 머리**(`__label` · `__label-glyph`) — 글리프 16 + 트랙 이름(caption medium · `fg-secondary`), 사이 6. 늘 마지막 줄 옆에 선다
   (빈 트랙 2행, 채운 트랙 3행). 촘촘한 판에서는 뺀다.
4. **빈 줄**(`__lane`) — 구간이 없을 때. 최소 56 · 좌우 12 · 1px 점선 `stroke-default` · 반경 `radius-control` · 가운데 caption `fg-tertiary`.
5. **전체 지도**(`__map` · `__map-bar` · `__map-playhead`) — `bg-inset` · 반경 `radius-control-sm`. 막대 4 · 최소 3 · 알약, 줄 사이 2 ·
   위아래 3(줄 1 → 10 · 2 → 16 · 3 → 22). 재생헤드 2 · 지도보다 위아래 2 길다. 보조기술에는 감춘다.
6. **구간 줄**(`__strip`) — 칸 사이 4. 넘치면 가로로 구르고(스크롤바 없음) 넘친 쪽 끝 40 이 흐려진다. 무대 칸의 고리가 잘리지 않게
   안쪽 4 를 비우고 그만큼 넓힌다.
7. **칸**(`__block` · `__block-label` · `__block-number` · `__block-title` · `__block-playhead`) — `<button>`. 높이 32 · 최소 88 · 좌우 8 ·
   반경 `radius-control-sm` · 1px 선. 이름은 caption medium, 번호 + 제목 사이 6, 제목부터 말줄임. 칸 안 재생헤드 2 · 위아래 4.

## 기하는 소비처가 준다

시각을 위치로 바꾸는 계산(`StudioSegmentTrack.tsx:18-25` 의 `trackPercent` · `rulerTicks` · `rulerStepSec` · `assignTrackLanes`)은 영상마다
다르고 CSS 가 할 수 없다. **그 결과만 변수로 받는다.** 레시피는 변수가 무엇을 뜻하는지와 그것을 어떻게 그리는지를 소유한다.
기본값은 루트가 선언하고, 소비처는 요소마다 인라인으로 덮는다.

| 변수 | 단위 · 범위 | 다는 자리 | 기본값 |
| --- | --- | --- | --- |
| `--louis-segment-track-minor` | 길이(보통 `%`) — 큰 눈금 한 칸 ÷ 5 | 루트 또는 `__ruler` | `12px`(길이를 모를 때) |
| `--louis-segment-track-at` | 수 0~100 | `__tick` · `__map-playhead` · `__block-playhead` | `0` |
| `--louis-segment-track-lanes` | 정수 1~3 | `__map` | `1` |
| `--louis-segment-track-lane` | 정수 0~2 | `__map-bar` | `0` |
| `--louis-segment-track-start` | 수 0~100 | `__map-bar` | `0` |
| `--louis-segment-track-span` | 수 0~100 | `__map-bar` | `0` |
| `--louis-segment-track-weight` | 정수 ≥ 1 — 구간 길이(초) 반올림 | `__block` | `1` |

시간축은 쓰기 방향을 따르지 않는다(왼쪽이 0초). 그래서 위치는 물리 `left` 다 — [Slider](slider.md) 눈금자와 같은 판단이다.

## Availability

| Surface       | 상태           | 근거 |
| ------------- | -------------- | ---- |
| Web           | `partial`      | CSS recipe `packages/css/src/component/segment-track.css`(Stage Bar 포함). React 표면은 없다 — 시각 → 위치 계산 · 줄 나누기 · 롤빙 · 굴림은 제품 컴포넌트가 갖고 클래스와 변수를 물면 된다 |
| Figma         | `partial`      | 2026-10-13 — `SegmentTrack`(Layout regular · compact × State Filled · Empty, Filled 는 시드 예시) · `SegmentTrackBlock`(Look 넷 × Selected — 코드 `aria-current`) · `SegmentTrackMapBar`(Look 셋 × Emphasis 셋) · `StageBar`(Layout 셋, BOOLEAN Error · Progress). 칸 호버(`segment-track-clip-hover`) · 구간 줄 굴림과 끝 흐림 · 719 이하 줄바꿈은 그리지 않았다. 기하 계약 · 기록은 아직 없다 |
| Documentation | `done`         | 이 문서 |
| Maturity      | `experimental` | 제품이 아직 이 클래스를 물지 않는다 |

## Properties

| 이름 | 값 | 뜻 |
| --- | --- | --- |
| 칸 `data-look` | 없음 · `clip`(기본) · `candidate` · `selected` · `short` | 점선은 아직 만들지 않은 것, 면이 진할수록 더 만들어진 것 — 옅은 강조 면 · 회색 점선 · 강조 점선 · 강조 면 |
| 칸 `aria-current` | `true` | 무대에 오른 칸 — 전경색 고리 2(바깥 1), 칸 안 재생헤드 |
| 지도 막대 `data-look` | 칸과 같은 넷 | `candidate` 회색(`stroke-default`), `clip` 클립 선 색, `selected` · `short` 강조색 |
| 지도 막대 `data-current` · `data-hover` | `true` | 키워(높이 8 · 최소 6) 고리 1.5 — 무대는 전경색, 가리킴(호버 · 포커스)은 강조색 |
| 구간 줄 `data-fade-start` · `data-fade-end` | `true` | 넘친 쪽 끝 40 을 흐린다. 스크롤 위치로 소비처가 단다 |
| 루트 `data-layout` | 없음 · `compact` | 촘촘한 판 — 한 칸 · 줄 머리 없음 · 안쪽 8 · 12 · 10 · 눈금 24 · 빈 줄 40 · 칸 44 × 136 고정 |
| 기하 변수 일곱 | 위 표 | 소비처가 계산해 준다 |

## States

| 상태 | 그림 |
| --- | --- |
| 빈 트랙 | 눈금 + 줄 머리 + 빈 줄(점선). 길이를 모르면 잔눈금 12px |
| 클립(기본) | 면 `segment-track-clip` 48% · 선 `segment-track-clip-stroke` |
| 클립 호버 | 면 `segment-track-clip-hover` 48% — 호버 기기에서만 |
| 후보(뺌) | 투명 · 점선 `stroke-default` · 글자 `fg-tertiary`. 호버 `accent-ghost-hover` |
| 다음 추출 | 투명 · 점선 `accent-primary`. 호버 `accent-ghost-hover` |
| 숏폼 | 면 · 선 `accent-primary` · 글자 `fg-inverse`. 호버로 면을 바꾸지 않는다 |
| 무대(`aria-current`) | 고리 2 `fg-primary` · 바깥 1. 지도 막대는 키워 고리 1.5 `fg-primary` |
| 가리킴 | 지도 막대만 키워 고리 1.5 `accent-primary` |
| 도는 칸(추출 · 렌더) | 모양은 그대로, 제목만 [Loading Word](loading-word.md)로 흐른다(`StudioSegmentTrack.tsx:363-364`) |
| 줄인 모션 | 칸 전환 시간 0 |
| 강제 색 | 틀은 `CanvasText` 1px 테두리, 무대 고리는 `Highlight`, 지도 막대 · 두 재생헤드는 `CanvasText` |

## Content

- 트랙 이름은 무엇의 트랙인지 한 마디다(「하이라이트」). 빈 줄 글은 지금 할 일이다(「새 하이라이트」).
- 칸 이름은 **보이는 번호 + 제목**이다. 번호는 목록 행과 같은 번호다 — 좁은 칸에서 제목이 잘려도 번호로 목록과 이어진다.
- 눈금 글자는 시각(`0:00`, `1:30:00`)이다. 간격은 소비처가 영상 길이로 고른다.

## Accessibility

- 구간 줄은 `role="toolbar"` + `aria-orientation="horizontal"` 이고 탭 정지는 하나다 — 무대에 오른 칸, 없으면 첫 칸. 줄 안에서 옮겨 다니다
  나갔다 돌아오면 마지막 칸으로, 그사이 무대의 칸이 바뀌었으면 무대의 칸으로 들어간다.
- ←/→ 한 칸, Home/End 처음 · 끝(`StudioSegmentTrack.tsx:249-265`). Alt · Ctrl · Meta 조합은 처리하지 않는다(브라우저 몫). 누르면
  (Enter · Space) 무대에 오른다.
- 칸의 접근 이름은 **보이는 번호 + 제목 + 상태**다(WCAG 2.5.3, `StudioSegmentTrack.tsx:44-48`) — 모양만으로는 상태를 모른다.
  `title` 에도 같은 이름을 둔다(좁은 칸은 제목이 잘린다).
- 무대에 오른 칸은 `aria-current="true"` 다. 고리는 포커스가 아니라 상태다.
- 포커스 링은 그리지 않는다([DS-D-0074](../governance/decisions/DS-D-0074-focus-ring-removed.md)). 포커스한 칸은 지도에서 그 막대가
  가리킴 고리(`data-hover`)를 받는다.
- 무대에 오른 칸이 가려져 있으면 줄을 굴려 보인다 — 페이지는 굴리지 않고, 줄인 모션에서는 즉시(`StudioSegmentTrack.tsx:233-246`).
- 눈금과 지도는 `aria-hidden` 이다 — 누르는 곳은 구간 줄이고, 지도는 같은 것을 자리로 다시 말하는 중복 표시다.
- 대비(`bg-raised` 위, 라이트 · 다크): 클립 칸 글자 `fg-primary` 12.52 · 5.50(호버 10.92 · 6.66), 후보 칸 · 눈금 · 빈 줄 글자
  `fg-tertiary` 6.72 · 5.25, 줄 머리 `fg-secondary` 9.63 · 7.24, 숏폼 칸 `fg-inverse` on `accent-primary` 3.37(Known deviations 2).

## Acceptance tests

`packages/react/test/segment-track.browser.test.tsx` 가 클래스 마크업을 실브라우저로 렌더해 잰다 — 틀의 안쪽 · 반경 · 격자 96 / 12 / 6,
눈금 28 · 큰 눈금 1 × 8 · 시각 글자 닻, 줄 머리 행(빈 트랙 2 · 채운 트랙 3), 빈 줄 56, 지도 줄 식(1 · 2 · 3 줄 → 10 · 16 · 22)과
막대 자리 · 최소 폭, 무대 · 가리킴 막대의 키움과 고리, 칸 32 · 최소 88 · 길이 비중, 칸 상태 넷의 선 모양 · 면, 무대 칸 고리,
촘촘한 판(한 칸 · 칸 44 × 136 · 눈금 24), Stage Bar 의 면 · 한 줄 최소 40 · 진행 묶음 · 실패 줄, 그리고 두 테마에서 글자 대비와
실패 줄 잉크(`fg-danger-on-surface`). 레시피 선언은 빌드의 저작 게이트가 지킨다.

## Stage Bar — 무대 아래 막대

무대 바로 아래의 한 줄 — 왼쪽은 무대에 오른 칸의 상태, 오른쪽은 그 칸의 다음 행동이다(`.louis-stage-bar`, 제품
`highlightSceneStyles.ts:1421-1434` · `highlightSceneStyles.ts:1679-1732`). 트랙과 같은 올린 면이고, **안의 조작은 LOUIS 부품 그대로**다 —
[Button](button.md) · [Checkbox](checkbox.md) · [Progress](progress.md) `louis-progress-bar` · [Loading Word](loading-word.md) ·
[Menu Popover](menu-popover.md). 이 블록은 면과 줄 배치만 갖는다. 제품의 막대 세 벌(판 `HighlightStudioBoard.tsx:833-843`,
멈춤 `HighlightStudioBoard.tsx:978-1033`, 기다림 `HighlightStudioBoard.tsx:1037-1086`)이 같은 상수를 쓴다.

```html
<div class="louis-stage-bar">
  <div class="louis-stage-bar__row">
    <span class="louis-stage-bar__state">
      <span class="louis-loading-word">올리는 중</span>
    </span>
    <p class="louis-stage-bar__note">
      <span class="louis-stage-bar__line">창을 닫으면 올리기가 멈춰요.</span>
    </p>
    <div class="louis-stage-bar__progress">
      <span class="louis-stage-bar__percent">42%</span>
      <div class="louis-progress-bar" role="progressbar" aria-label="올리는 중" aria-valuemin="0" aria-valuemax="100"
           aria-valuenow="42" style="--louis-progress-value: 42"><div class="louis-progress-bar__fill"></div></div>
    </div>
  </div>
</div>

<!-- 판: 상태 | 행동, 실패하면 제 줄 -->
<div class="louis-stage-bar">
  <div class="louis-stage-bar__row">
    <span class="louis-stage-bar__state">클립</span>
    <div class="louis-stage-bar__actions">
      <button type="button" class="louis-button" data-variant="primary" data-size="lg">숏폼 만들기</button>
    </div>
  </div>
  <p class="louis-stage-bar__error" role="alert">숏폼을 만들지 못했어요. 다시 시도해 주세요.</p>
</div>
```

| 슬롯 | 무엇을 넣나 | 값 |
| --- | --- | --- |
| 면 | — | 안쪽 8 · 사이 8 · `radius-card` · `bg-raised` · 헤어라인 · 줄바꿈 |
| `__row` | 상태 · 안내 · 행동 · 진행 한 줄 | 양끝 정렬 · 줄 사이 8 · 칸 사이 12 · 최소 40 · 왼쪽 8 · 줄바꿈 |
| `__state`(+ `__glyph`) | 상태 한 마디 — 도는 일은 `louis-loading-word`, 멈춤은 글리프 + `role="alert"`(위험) · `role="status"` | body-sm medium · `fg-primary` · 사이 8 · 글리프 16 은 글자색 |
| `__note`(+ `__line`) | 한두 문장 안내 — 문장마다 줄 | body-sm regular · `fg-secondary` · 오른쪽 남는 폭을 먹는다 |
| `__actions` | `Button`(primary · secondary) · `Checkbox` · 내려받기 링크 · 더보기 `Menu`(위로 연다) | 사이 8 · 오른쪽 끝 |
| `__progress`(`__percent` + `louis-progress-bar`) | 올리는 중의 퍼센트와 막대 | 사이 8 · 280 까지 · 오른쪽 끝. 퍼센트 최소 4ch · 고정폭 숫자. 719 이하에서 제 줄 |
| `__error` | 행동이 실패한 한 줄 — 실패할 때만 선다 | caption regular · `fg-danger-on-surface` · 제 줄 · 좌우 8 · 아래 4 |

- 한 줄 최소 높이 40 — 칸을 오가도, 분석이 끝나 판이 들어와도 무대 높이가 그대로다.
- 막대에 랜드마크를 세우지 않는다 — 무대 영역과 같은 이름이 겹친다(`HighlightStudioBoard.tsx:831`).
- 만드는 동안의 버튼은 `disabled` 가 아니라 `aria-disabled` 로 잠근다 — 누른 초점이 문서 밖으로 빠지지 않고 실패하면 그 자리에서 다시
  누른다(`HighlightStudioBoard.tsx:781-786`).
- 대비(`bg-raised` 위, 라이트 · 다크): 상태 `fg-primary`, 안내 `fg-secondary` 9.63 · 7.24, 실패 줄 `fg-danger-on-surface` 6.34 · 6.43.
- `AnalysisWaitHint` 의 틀을 푸는 `display: contents`(`highlightSceneStyles.ts:1732`)는 소비처 몫이다 — 레시피에 두지 않는다.

## Known deviations

1. **칸 경계 · 지도 막대의 그래픽 대비가 3:1 미만이다(제품 값 그대로).** 클립 선 라이트 1.98 · 다크 1.91, 클립 면 경계 1.38 · 3.01,
   지도 막대(`bg-inset` 위) 1.68 · 2.09, 후보 점선 2.39 · 2.57. 칸의 정체와 상태는 **글자(번호 · 제목) · 선 모양(실선 · 점선) · 접근 이름**이
   함께 말하고 지도는 `aria-hidden` 중복이라 1.4.11 의 「식별에 필요한 그래픽」으로 보지 않았다. 라이트 선을 `blue-500` 으로 올리면
   `accent-primary` 인 다음 추출 · 숏폼과 선 색이 겹쳐 상태 구별을 잃는다.
2. **숏폼 칸 글자 3.37** — [Button](button.md) primary 의 소유자 수용 편차와 같은 면 · 글자 짝이다. 따로 고치지 않는다.
3. **실패 줄 잉크를 고쳤다.** 제품 `fg-danger`(`highlightSceneStyles.ts:1862`)는 불투명 위험 면의 짝이라 카드 위에서 라이트 14.27(거의 검정) ·
   다크 14.49(거의 흰색)로 「실패」가 읽히지 않는다. `fg-danger-on-surface`(6.34 · 6.43)로 옮겼다 — 보이는 변화다.
4. **칸의 포커스 링을 옮기지 않았다**(`highlightSceneStyles.ts:1567-1568`, DS-D-0074).
5. **테마 분기를 시맨틱으로 접었다.** 제품은 칸 선 · 지도 막대를 `html[data-theme=dark] &` 로 갈랐다(`highlightSceneStyles.ts:1543` ·
   `highlightSceneStyles.ts:1786`). component CSS 는 테마 선택자를 쓰지 않으므로 `segment-track-clip-stroke`(라이트 blue-300 · 다크 blue-800)
   한 칸이다. 칸 면 48% 는 원시 알파를 새로 세우지 않고 `color-mix` 로 만든다.
6. **칸 상태 속성을 하나로 모았다.** 제품은 `data-included` + `data-state` 둘이고 `look` 이 있으면 `included` 를 무시한다
   (`StudioSegmentTrack.tsx:162-165`). 레시피는 `data-look` 하나다 — `included=false` 는 `candidate` 다.
7. **촘촘한 판의 경계를 레시피에 두지 않았다.** 제품은 화면 폭 900 미디어 쿼리다(`highlightSceneStyles.ts:1419` · `highlightSceneStyles.ts:1444` ·
   `highlightSceneStyles.ts:1570`). 900 은 스튜디오 배치 전체의 경계라 트랙이 정할 일이 아니고, LOUIS 에 새 breakpoint 를 세우지 않는다
   ([Responsive Layout](../foundations/responsive-layout.md)) — 소비처가 `data-layout="compact"` 를 단다.
8. **틀 · 격자를 한 요소로 접었다.** 제품은 틀(`studioTimeline`, flex 세로)이 격자(`studioTrackGrid`)를 하나 감싼다
   (`StudioSegmentTrack.tsx:122-126`). 자식이 늘 하나라 레시피는 루트가 격자다.
9. **사다리 밖 값.** 줄 머리 96 · 줄 사이 6 · 아래 안쪽 14(촘촘 10) · 눈금 28(촘촘 24) · 큰 눈금 8 · 빈 줄 56(촘촘 40) · 칸 최소 88(촘촘 136) ·
   지도 막대 4 · 최소 3 · 키운 8 · 고리 1.5 · 흐림 40 · 진행 묶음 280 은 제품 값 그대로다.

## 제품에서 발견한 것

- 칸의 문법(반투명 면 48% + 1px 선 · 반경 `control-sm` · 호버 한 단 진하게 · 다크 선 800)이 컴포지션 타임라인 오디오 클립
  (`vemClass.ts:417-445`, pink)과 같고 색만 다르다. 두 곳을 한 부품(`timeline-track` + `data-tone`)으로 모을지는 열려 있다 — 셋째 소비처가
  실제로 붙을 때 토큰 이름만 옮기는 Decision 으로 넓힌다.
- 판의 칸 모양 넷(`studioBoard.ts:47`)이 곧 레시피 `data-look` 넷이다.

## 제품 (나) — 이 레시피가 서면 제품이 할 일

| 제품 자리 | 할 일 |
| --- | --- |
| `StudioSegmentTrack.tsx:121-158` · `StudioSegmentTrack.tsx:267-353` | 상수를 `louis-segment-track*` 클래스로, `--studio-*` 를 `--louis-segment-track-*` 로, `data-included` + `data-state` 를 `data-look` 하나로 |
| `highlightSceneStyles.ts:1406-1587` · `highlightSceneStyles.ts:1750-1842` | 트랙 상수를 지운다 |
| 촘촘한 판 | 화면 폭 900 판정을 트랙의 `data-layout="compact"` 로 내린다 |
| `HighlightStudioBoard.tsx:833-843` · `HighlightStudioBoard.tsx:978-1033` · `HighlightStudioBoard.tsx:1037-1086` | 막대 세 벌을 `louis-stage-bar*` 로. 실패 줄 잉크가 `fg-danger-on-surface` 로 바뀐다 |
| `highlightSceneStyles.ts:1423-1434` · `highlightSceneStyles.ts:1680-1730` · `highlightSceneStyles.ts:1855-1863` | 막대 상수를 지운다. `studioStageBarHint` 는 소비처에 남는다 |
| 칸 포커스 링(`highlightSceneStyles.ts:1567-1568`) | 지운다 — 전역 규칙(DS-D-0074)이 소유한다 |
