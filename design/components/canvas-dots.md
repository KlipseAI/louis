---
id: canvas-dots
status: experimental
authority: normative
summary: 노드 캔버스 바닥에 지름 2 점을 24 격자로 깝니다.
---

# Canvas Dots

노드 캔버스의 바닥이다. 지름 2 의 점을 24 격자로 깔아 노드를 놓을 자리와 거리를 가늠하게 한다. 점은 **캔버스 좌표**에 박혀 있어 줌하면 함께
커지고 끌면 함께 흐른다.

## Availability

| Surface       | 상태           | 근거 |
| ------------- | -------------- | ---- |
| Web           | `partial`      | CSS 레시피 `.louis-canvas-dots` 만 있다(`packages/css/src/pattern/editor-workspace.css`). React 표면은 없다 |
| Figma         | `done`         | 한 칸 타일 `CanvasDots`(24 × 24). 계약 · 기하 · 되재기 시험이 선다([DS-D-0102](../governance/decisions/DS-D-0102-canvas-dots.md)) — 2026-10-15 되재기 `canvas-dots.browser.test.tsx` 로 done(DS-D-0035) |
| Documentation | `done`         | 이 문서 |
| Maturity      | `experimental` | 제품 캔버스가 xyflow SVG 대신 같은 값을 문다는 확인이 서면 승격 후보 |

## When to use

- 노드 캔버스 · 그 목업(랜딩 데모 · 정적 스냅샷) · Figma 캔버스 보드의 바닥.
- 쓰지 말아야 할 때: 차트 뒤 점 바닥. 그것은 [Chart Card](chart-card.md) 의 `data-floor="dots"` 다(격자 18 · 다른 잉크 · 줌을 따르지 않는다).
- 쓰지 말아야 할 때: 어두운 랜딩 면 위 20% 점(`node-canvas-v2/index.tsx:542`). 테마를 따르지 않는 다른 칸이다(DS-D-0084 판정 11).

## Anatomy

1. **Floor** — 면 `color-bg-canvas`. 클래스가 붙은 요소 자신이다.
2. **Dot** — 격자 교차점마다 하나. 지름 2 · `color-canvas-dot`. 그라디언트로 그려 DOM 노드가 아니다.

## Properties

| 지역 변수 | 기본 | 뜻 |
| --- | --- | --- |
| `--louis-canvas-dots-pitch` | 24px | 격자(제품 `gap`) |
| `--louis-canvas-dots-radius` | 1px | 점 반지름(제품 `size / 2`) |
| `--louis-canvas-dots-scale` | 1 | 캔버스 줌 배율(xyflow `transform[2]`) |
| `--louis-canvas-dots-x` · `-y` | 0px | 화면 이동량(xyflow `transform[0..1]`) |

Figma 타일 `CanvasDots` 에는 속성이 없다. 라이트 · 다크는 `Klipse Semantic Color` 모드가 정한다.

## Variants, sizes, and states

변형 · 크기 축이 없다. 격자와 점 크기는 줌 배율이 곱해질 뿐 바뀌지 않는다.

## States

상태가 없다 — 바닥은 포인터를 받지 않고(받는 것은 그 위 캔버스 판이다), 호버 · 포커스 · 비활성이 그림을 바꾸지 않는다.

| 상태 | 무엇이 바뀌나 |
| --- | --- |
| 기본 | 면 · 점 |
| 줌 | 격자 · 점이 배율만큼 함께 커진다(`--louis-canvas-dots-scale`) |
| 이동 | 격자 원점이 따라 흐른다(`--louis-canvas-dots-x` · `-y`) |
| 강제 색 | 점을 걷고 면만 남는다 |

## Interaction and responsive behavior

- 레시피는 크기를 갖지 않는다. 소비처의 캔버스 상자를 채운다.
- 살아 있는 캔버스는 xyflow 의 줌 · 이동을 지역 변수에 넣는다. 목업 · 정적 데모는 클래스만 붙인다.
- 원점: radial-gradient 의 점은 칸 가운데에 서므로 레시피가 반 칸을 되빼 xyflow 처럼 원점에 점을 둔다.

## Content

글자가 없다.

## Accessibility

- 장식이다. 정보를 싣지 않으므로 대체 텍스트 · 역할이 없고, 점 대비는 WCAG 1.4.11 의 대상이 아니다. 대비는 재서 적는다 — 다크 점 #fafafa 16% ·
  라이트 pg-600 28% 가 바닥 위에서 1.2:1 을 넘어 사라지지 않는다(시험 2).
- 강제 색에서는 점을 걷는다. 시스템 색 위에서 반투명 점은 의미 없는 얼룩이 된다.

## Specification

| Part/state | Token or recipe | 구현 근거 |
| --- | --- | --- |
| 면 | `color-bg-canvas` | 제품 `--canvas-bg`(`node-canvas-v2/index.tsx:504`) |
| 점 색 | `color-canvas-dot` | 제품 `--canvas-dot`(`node-canvas-v2/index.tsx:505` · `:530`, DS-D-0082) |
| 격자 | 24 | `CanvasBackground.tsx:5` `DEFAULT_CANVAS_DOT_GAP` |
| 점 지름 | 2(반지름 1) | `CanvasBackground.tsx:6` `DEFAULT_CANVAS_DOT_SIZE` |

## Implementation

- Web source: packages/css/src/pattern/editor-workspace.css
- Public import: `@klipse-design/css` (레시피 클래스). React 표면 없음
- Figma component: `CanvasDots` — DS · Components 의 「R1 · 캔버스 · 편집기 부품 (2026-10-15)」 섹션
- Tests/visual evidence: packages/react/test/canvas-dots.browser.test.tsx 가 figma/components.measured.json 의 canvas-dots 를 되잰다

### Usage

```html
<div class="louis-canvas-dots" style="--louis-canvas-dots-scale: 0.75; --louis-canvas-dots-x: 120px; --louis-canvas-dots-y: -36px"></div>
```

## Acceptance tests

1. 격자 간격(`background-size`)이 기록 `canvas-dots.tile.pitch`(24)와 같고, 줌 0.5 에서 12 로 함께 준다.
2. 점 지름(그라디언트 반지름 × 2)이 기록 `canvas-dots.tile.dot`(2)와 같다. 면이 `color-bg-canvas`, 점이 `color-canvas-dot` 이다. 라이트 · 다크에서 점이
   바닥 위 1.2:1 을 넘는다.
3. Figma 되읽기에서 `CanvasDots` 의 `rawFills` 가 0 이다(parity 게이트).

1~2 는 `packages/react/test/canvas-dots.browser.test.tsx` 가 실브라우저에서 잰다.

## Known deviations

1. **제품 캔버스는 이 클래스를 물지 않는다.** xyflow 가 SVG 패턴으로 같은 값을 그린다. 이 클래스는 값의 정본이고 목업 · Figma 대조가 쓴다.
2. **Figma 는 타일 한 칸이다.** 보드가 넓은 바닥을 깔려면 타일을 반복하거나 채움 원본으로 쓴다 — Figma 패턴 채움이 변수를 받지 못해서다(DS-D-0102).

## Migration and changelog

2026-10-15 — 2026-10-13 의 패턴 절 `.louis-canvas-dots` 를 컴포넌트 축으로 등록했다. 클래스 · 값은 그대로다([DS-D-0102](../governance/decisions/DS-D-0102-canvas-dots.md)).
