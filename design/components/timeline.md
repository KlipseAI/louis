---
id: timeline
status: experimental
authority: normative
summary: 화면 가운데 고정 재생헤드 아래로 트랙이 흐르는 편집 타임라인. 시간 눈금자(Timeline Ruler)를 짝으로 갖습니다.
---

# Timeline

편집기 좁은 화면의 타임라인이다. **재생헤드는 화면 가운데에 서 있고 트랙이 흐른다** — 끌면 시각이 바뀌고, 클립을 누르면 고르고, 고른
클립의 양 끝을 끌어 자른다(`.louis-timeline`, [DS-D-0089](../governance/decisions/DS-D-0089-timeline.md), [DS-D-0084](../governance/decisions/DS-D-0084-product-parts-become-louis.md)).
창을 옮기는 것은 브라우저 스크롤이라 관성 · 되튐 · 붙잡기가 그 플랫폼의 것이다. 클립이 px 좌표에 절대 배치되는 것이
[Segment Track](segment-track.md)(칸이 시간 순서로 흐르는 줄)과 다르다.

같은 파일의 짝 블록 **Timeline Ruler**(`.louis-timeline-ruler`, 아래 「Timeline Ruler — 시간 눈금자」 절)는 시간 눈금이다. 데스크톱 시퀀스
타임라인 위의 3단 눈금과, 이 셸 안의 촘촘한 눈금(`data-layout="compact"`)이 같은 블록이다.

제품 정본은 `components/scenes/create/node-canvas-v2/nodes/videoEditParts/MobileTimeline.tsx@54b62a8a:823-1085` ·
`components/scenes/create/node-canvas-v2/nodes/videoEditParts/mobileTimelineClass.ts:7-46` ·
`components/scenes/create/node-canvas-v2/nodes/videoEditParts/sequenceRuler.tsx:28-34`(통합 판 `54b62a8aa`)이고 소비처는 편집기 모달 하나
(`components/scenes/create/node-canvas-v2/nodes/VideoEditModal.tsx:12677` 타임라인 · `components/scenes/create/node-canvas-v2/nodes/VideoEditModal.tsx:13029` 눈금자)다.

```html
<div class="louis-timeline" style="--louis-timeline-extent: 960px">
  <div class="louis-timeline__viewport" role="region" aria-label="타임라인">
    <div class="louis-timeline__spacer" aria-hidden="true"></div>
    <div class="louis-timeline__flow">
      <div class="louis-timeline-ruler" data-layout="compact" aria-hidden="true">
        <span class="louis-timeline-ruler__tick" style="--louis-timeline-x: 0px"></span>
        <span class="louis-timeline-ruler__label" style="--louis-timeline-x: 0px">0:00</span>
        <span class="louis-timeline-ruler__tick" style="--louis-timeline-x: 160px"></span>
        <span class="louis-timeline-ruler__label" style="--louis-timeline-x: 160px">0:05</span>
      </div>
      <div class="louis-timeline__lane">
        <button type="button" class="louis-timeline__clip" data-tone="caption" aria-pressed="false"
                aria-label="자막 클립, 오프닝 인사" style="--louis-timeline-x: 32px; --louis-timeline-w: 96px">
          <span class="louis-timeline__label">오프닝 인사</span>
        </button>
      </div>
      <div class="louis-timeline__lane" data-tone="audio">
        <button type="button" class="louis-timeline__clip" data-tone="audio" aria-pressed="false"
                aria-label="배경음 클립" style="--louis-timeline-x: 0px; --louis-timeline-w: 640px">
          <canvas class="louis-timeline__wave" aria-hidden="true"></canvas>
          <span class="louis-timeline__label">BGM</span>
        </button>
      </div>
      <div class="louis-timeline__lane">
        <button type="button" class="louis-timeline__clip" data-tone="video" aria-pressed="true"
                aria-label="영상 클립, 3.2초, 선택됨" style="--louis-timeline-x: 0px; --louis-timeline-w: 102px">
          <span class="louis-timeline__strip" aria-hidden="true">
            <span class="louis-timeline__strip-tiles"><img class="louis-timeline__strip-tile" src="…" alt=""></span>
          </span>
          <span class="louis-badge louis-timeline__duration" data-surface="media">3.2s</span>
          <span class="louis-timeline__trim" data-edge="start" aria-hidden="true"></span>
          <span class="louis-timeline__trim" data-edge="end" aria-hidden="true"></span>
        </button>
        <button type="button" class="louis-timeline__add" aria-label="소재 더하기" style="--louis-timeline-x: 102px">
          <svg class="louis-timeline__add-glyph" aria-hidden="true">…plus…</svg>
        </button>
      </div>
    </div>
  </div>
  <div class="louis-timeline__playhead" aria-hidden="true"></div>
</div>
```

## Availability

| Surface       | 상태           | 근거 |
| ------------- | -------------- | ---- |
| Web           | `partial`      | CSS recipe `packages/css/src/component/timeline.css`(Timeline Ruler 포함) · 실브라우저 시험 `timeline.browser.test.tsx`. React 표면은 없다 — 스크롤 ↔ 시각 · 배율 · 끌기 · 자르기는 제품 컴포넌트가 갖는다(DS-D-0089) |
| Figma         | `done`      | 2026-10-14 — `TimelineClip`(Tone `video` · `caption` · `image` · `audio` × Selected `false` · `true` = 8, 코드 `data-tone` · `aria-pressed`), `TimelineTrimHandle`(Direction `prev` · `next` = 코드 `data-edge` start · end), `TimelineRuler`(Layout `base` · `compact`)와 시드 데이터 보드 `Timeline`(375 × 240, 재생헤드 0:04 — 레인 · 클립 자리는 데이터). 면 · 고리 · 괄호는 변수 `timeline/*` 넷, 길이는 Badge 인스턴스를 `media-badge` 변수로 덮었다. 예시 필름 타일 · 파형 봉우리는 자리표시다. 「+」 호버 · 스크롤 · 끌기는 그리지 않는다. 기록 `timeline-clip` · `timeline-trim-handle` · `timeline-ruler` · `timeline` 과 parity 기하 계약, 실브라우저 되재기(`timeline-geometry.browser.test.tsx`). 제품 렌더 대조는 없다 — 2026-10-14 기하 계약 · 실측 · 되재기로 done(DS-D-0035) |
| Documentation | `done`         | 이 문서 |
| Maturity      | `experimental` | 제품이 아직 이 클래스를 물지 않는다 |

## Anatomy

1. 셸 `.louis-timeline` — 파인 면(`bg-inset`). 남는 높이를 채운다(`flex: 1 1 0%`). 셸의 `isolation` 이 안의 칠 순서를 가둔다.
2. 창 `__viewport` — 가로 스크롤러(`overscroll-behavior-x: contain` · `touch-action: pan-x`). 스크롤바는 숨긴다.
3. 자리지기 `__spacer` — 창 폭 + 전체 길이(`calc(100% + extent)`). 끌 수 있는 범위를 만든다.
4. 흐르는 층 `__flow` — 창 폭의 절반(`left: 50%`)에서 시작. 눈금 · 레인이 위에서부터 쌓인다(사이 4 · 위아래 8).
5. 눈금 `.louis-timeline-ruler[data-layout="compact"]` — 20, 아래 짝 블록.
6. 레인 `__lane` — 44, 오디오(`data-tone="audio"`) 36. 내용이 있는 줄만.
7. 클립 `__clip` — `<button>`. 좌우 8 · 반경 8(`radius-control-sm`). 바닥(`__strip` · `__wave`) → 라벨(`__label` 또는 길이 배지 `__duration`) → 트림 손잡이(`__trim`, 고른 클립에만) 순서.
8. 트림 손잡이 `__trim` — 24 폭, 클립 바깥 8 괄호(`::before`, `timeline-accent`)와 그 가운데 2 × 12 그립(`::after`, `fg-inverse`).
9. 「+」 `__add` — 메인 트랙 끝, 레인 높이 정사각 · 앞 틈 6 · 글리프 20(`__add-glyph`, 아이콘 세트 `plus.svg`).
10. 재생헤드 `__playhead` — 셸의 마지막 자식. 가운데 고정 2.

## 기하는 소비처가 준다

시간과 픽셀을 잇는 식 `xOf`(`components/scenes/create/node-canvas-v2/nodes/videoEditParts/MobileTimeline.tsx:284`)와 배율은 프로젝트마다 다르고
CSS 가 할 수 없다. 그 결과만 변수로 받는다.

| 변수 | 단위 | 다는 자리 | 기본값 |
| --- | --- | --- | --- |
| `--louis-timeline-extent` | px | `.louis-timeline` 루트 | `0px` |
| `--louis-timeline-x` | px(눈금자 기본 판은 `%`) | `__clip` · `__add` · `.louis-timeline-ruler__tick` · `__label` | `0px` |
| `--louis-timeline-w` | px | `__clip` | `0px` |

흐르는 층 `left` 와 자리지기 폭은 레시피가 창 폭으로 푼다 — 흐르는 층은 창의 절대 배치 자식이라 담는 상자가 창의 padding box 이고, `left: 50%` 가
제품이 재서 주던 `layoutWidth / 2` 와 같다. `scrollLeft = x(t)` 이면 시각 t 가 정확히 재생헤드 아래 온다. 시간축은 쓰기 방향을 따르지 않는다(왼쪽이 0초).

## Properties

React 를 만들지 않는다 — 이 마크업 계약이 공개 계약이다.

| 속성 · 요소 | 값 | 뜻 |
| --- | --- | --- |
| 클립 `data-tone` | 없음 · `video` · `caption` · `image` · `audio` | 바닥 면 — 영상 · 없음은 `accent-secondary`(필름이 덮는다), 나머지는 `timeline-clip-*` 48% |
| 클립 `aria-pressed` | `true` · `false` | 고른 클립 — 바깥 고리 2 `timeline-accent`, `touch-action: none`, 트림 손잡이 둘 |
| 레인 `data-tone` | `audio` | 높이 36 |
| 손잡이 `data-edge` | `start` · `end` | 괄호가 붙는 쪽 |
| `__duration` | `.louis-badge[data-surface="media"]` 에 함께 단다 | 영상 클립 길이 |
| 기하 변수 셋 | 위 표 | 소비처가 계산해 준다 |

## States

| 상태 | 그림 |
| --- | --- |
| 쉼 | 종류 면 · 라벨. 손잡이 없음 |
| 고름(`aria-pressed="true"`) | 고리 2 + 양 끝 괄호 8 · 그립 2 × 12 |
| 끄는 중(옮기기 · 자르기) | 모양은 고름과 같다. 자리 · 길이 변수만 바뀐다 |
| 필름 기다림 | 영상 클립 바닥이 `accent-secondary`, 배지는 그대로 읽힌다 |
| 「+」 호버 | `accent-secondary-hover` — 호버 기기에서만 |
| 줄인 모션 | 전환이 없다(스크롤 관성은 플랫폼 설정을 따른다) |
| 강제 색 | 클립 1px `CanvasText` 윤곽, 고른 클립 2px `Highlight`, 재생헤드 · 괄호 `Highlight` |

## Content

- 영상 클립 글은 **길이**(`3.2s`, 소수 한 자리)다 — 손끝에서 자르고 옮길 때 필요한 숫자. 트랙 이름(V1)은 이 화면에 레일이 없어 쓰지 않는다.
- 자막은 내용, 이미지는 `IMG`, 오디오는 `TTS` · `BGM`. 넘치면 말줄임.
- 눈금 글자는 `m:ss`. 간격은 소비처가 배율로 고른다(`[1, 2, 5, 10, 30, 60]` 초 중 글자 사이 56 이상인 첫 값).

## Accessibility

- 창은 `role="region"` + `aria-label` 이다. 클립은 `<button>` 이라 탭 순서에 있고 Enter · Space 가 고르기다(누르기와 같다).
- 고름은 `aria-pressed="true"` 다 — 고리는 그 상태의 그림이다. 접근 이름은 **종류 + 보이는 글 + 상태**(「영상 클립, 3.2초, 선택됨」)다.
- 트림 손잡이 · 재생헤드 · 눈금 · 필름스트립 · 파형은 `aria-hidden` 이다. **트림에는 아직 키보드 대안이 없다**(Known deviations 3).
- 「+」는 글리프뿐이라 `aria-label`(「소재 더하기」)이 필수다.
- 포커스 링은 그리지 않는다([DS-D-0074](../governance/decisions/DS-D-0074-focus-ring-removed.md)).
- 대비(`bg-inset` 위, 라이트 · 다크 — 시험이 실제로 잰다): 자막 · 이미지 · 오디오 클립 글자 `fg-primary` 4.5 이상, 영상 길이 배지 4.5 이상,
  재생헤드 · 고리 · 괄호 3:1 이상(3.89 · 5.37), 그립 3:1 이상, 촘촘한 눈금 글자 4.5 이상 · 선 3:1 이상, 「+」 글리프 4.5 이상.

## Acceptance tests

`packages/react/test/timeline.browser.test.tsx` 가 클래스 마크업을 실브라우저로 렌더해 잰다.

1. 셸 면 `bg-inset`, 흐르는 층 `left` = 창 폭 / 2, 자리지기 폭 = 창 폭 + extent, 창을 x(t) 만큼 굴리면 그 시각이 재생헤드 아래 온다.
2. 레인 44 · 36, 클립 자리 · 길이 · 좌우 8 · 반경 8, 종류 넷의 면.
3. 고른 클립 고리 2 · `touch-action: none`, 트림 손잡이 24 · 괄호 8 이 클립 바깥 · 그립 2 × 12 가운데.
4. 「+」 44 · 틈 6, 재생헤드 2 가 가운데, 칠 순서(배지가 필름 위).
5. 눈금자 — 기본 40 · 눈금 12 / 8 / 6 바닥 정렬 · 양끝 글자 닻, compact 20 · 선 높이 전체 · 글자 오른쪽 4.
6. 대비는 실제로 잰다 — 클립 글자 · 배지 · 재생헤드 · 그립 · 촘촘한 눈금 글자 · 선 · 「+」, 두 테마.

`packages/react/test/timeline-geometry.browser.test.tsx` 는 기록 `figma/components.measured.json` 의 `timeline-clip`(Tone × Selected 여덟) · `timeline-trim-handle` · `timeline-ruler` · `timeline` 을 코드가 만드는지 되잰다.

## Timeline Ruler — 시간 눈금자

| 판 | 높이 | 눈금 | 글자 |
| --- | --- | --- | --- |
| 기본(데스크톱 시퀀스) | 40 | `data-level` major 12 · `mid` 8 · `minor` 6, 바닥에 붙음, 가운데 닻 | 큰 눈금 위 가운데(위 6), 양끝은 `data-align` `start` · `end` |
| `data-layout="compact"`(타임라인 안) | 20 | 큰 눈금만, 높이 전체 | 선 오른쪽 4, 위 2 |

- 눈금 자리는 `--louis-timeline-x`(기본은 `%`, 촘촘한 판은 px), 단 · 정렬은 모델(`components/scenes/create/node-canvas-v2/lib/videoEdit/ruler.ts:156` 의
  `buildSequenceRulerModel`)이 정한다. 촘촘한 판의 폭은 타임라인 루트의 `--louis-timeline-extent` 를 읽는다.
- 늘 `aria-hidden` 이다. 끌어 시킹하는 면이면 `data-interactive="true"` — 포인터 전용이고 키보드 시킹은 편집기 단축키가 갖는다.
- 잉크는 적응 시맨틱이다 — 기본 눈금 `gray-000-alpha-80` · 글자 `fg-primary`, 촘촘한 판 선 `gray-000-alpha-48` · 글자 `gray-000-alpha-56`.
  제품의 테마 분기 여덟 · 그림자 넷은 접었다(파인 면 위라 그림자가 할 일이 없다).
- 제품의 재생헤드 캡(`components/scenes/create/node-canvas-v2/nodes/videoEditParts/sequenceRuler.tsx@54b62a8a:156-178`)과 격자선(`SequenceGridLines`)은 소비처가 없어 올리지 않았다.

```html
<div class="louis-timeline-ruler" aria-hidden="true">
  <span class="louis-timeline-ruler__tick" style="--louis-timeline-x: 0%"></span>
  <span class="louis-timeline-ruler__label" data-align="start" style="--louis-timeline-x: 0%">0:00</span>
  <span class="louis-timeline-ruler__tick" data-level="minor" style="--louis-timeline-x: 10%"></span>
  <span class="louis-timeline-ruler__tick" data-level="mid" style="--louis-timeline-x: 50%"></span>
  <span class="louis-timeline-ruler__tick" style="--louis-timeline-x: 100%"></span>
  <span class="louis-timeline-ruler__label" data-align="end" style="--louis-timeline-x: 100%">0:10</span>
</div>
```

## Known deviations

1. **클립 경계의 그래픽 대비가 라이트에서 3:1 미만이다**(자막 1.07 · 이미지 1.11 · 오디오 1.28 · 영상 기본 면 1.17). 정체는 글자와 자리가,
   범위는 선택 고리 · 괄호가 3:1 이상으로 말한다(DS-D-0089 판단 8, segment-track 과 같은 판단).
2. **그립 `fg-inverse` on 괄호의 다크 대비는 3.37** — Button primary 와 같은 쌍이다. 그래픽 3:1 은 넘는다.
3. **트림 · 옮기기는 포인터 전용이다.** 제품에 키보드 대안이 없다(인스펙터에도 시작 · 끝 값이 없다) — 제품 (나) 과제(DS-D-0089 판단 12).
4. **고쳐 올린 값** — 모바일 눈금 글자 흰색 56% → `gray-000-alpha-56`, 선 24% → `-48`, 재생헤드 · 고리 · 괄호 `accent-primary` → `timeline-accent`,
   영상 길이 흰 글자 + 그림자 → media 배지, 데스크톱 라이트 눈금 `gray-900` 72% → 검정 80%(DS-D-0084 3항).
5. **레시피는 719 경계로 숨지 않는다** — 제품 셸의 `display` 분기(`components/scenes/create/node-canvas-v2/nodes/videoEditParts/mobileTimelineClass.ts:11-12`)는 편집기 배치의 일이다.

## 제품에서 발견한 것

- 「+」 버튼에 접근 이름이 없다(`components/scenes/create/node-canvas-v2/nodes/videoEditParts/MobileTimeline.tsx@54b62a8a:978-997`).
- 영상 클립 글자가 필름이 오기 전 라이트에서 1.32 다 — 흰 글자가 `accent-secondary` 위에 선다.
- 흐르는 층의 `left` 는 폭을 재지 않아도 `50%` 로 같다 — 첫 렌더 폴백 375(`components/scenes/create/node-canvas-v2/nodes/videoEditParts/MobileTimeline.tsx:37`)가 만드는 한 프레임 어긋남이 레시피에서는 없다.
- 고름이 클래스로만 표시되고 보조기술에 나가지 않는다(`aria-pressed` 없음).
