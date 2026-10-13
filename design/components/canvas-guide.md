---
id: canvas-guide
status: experimental
authority: normative
summary: 캔버스에서 끄는 노드가 다른 노드와 줄이 맞을 때 그 줄을 보여 줍니다.
---

# Canvas Guide

노드를 끄는 동안, 가장자리나 가운데가 다른 노드와 맞는 순간에만 나타나는 가는 선이다(`.louis-canvas-guide`,
[DS-D-0084](../governance/decisions/DS-D-0084-product-parts-become-louis.md)). 놓으면 사라진다.
노드를 잇는 선은 [Canvas Edge](canvas-edge.md)이고, 바닥의 점 격자는 패턴 채움(`color-canvas-dot`)이다.
제품 정본은 `SmartGuideOverlay.tsx:13-66`(통합 판 `54b62a8aa`)이고, 캔버스 변환 층(`ViewportPortal`) 안에서 그린다
(`node-canvas-v2/index.tsx:12147-12149`).

```html
<!-- 캔버스 변환 층의 마지막 자식 -->
<svg class="louis-canvas-guide" aria-hidden="true">
  <line class="louis-canvas-guide__line" x1="240" y1="80" x2="240" y2="520"></line>
  <line class="louis-canvas-guide__line" x1="120" y1="300" x2="640" y2="300"></line>
</svg>
```

| 부분 | 값 |
| --- | --- |
| 층 | 변환 층 전체(`absolute` · 위 · 왼쪽 0 · 100%) · 넘침 보임 · 포인터 받지 않음 · 숫자 z-index 없음(칠 순서) |
| 선 | `color-canvas-guide`(라이트 `pink-600` · 다크 `pink-500`) · 두께 1(`border-width-default`) · `non-scaling-stroke` — 줌과 무관하게 화면 1px |

**좌표는 데이터다.** 어느 선이 어디서 어디까지인지는 스냅 계산이 정하고 소비처가 `<line>` 의 좌표로 준다. 레시피는 층 · 색 · 두께만 갖는다.
**층은 캔버스 좌표다** — 쓰기 방향을 따르지 않아 물리 `top` · `left` 를 쓴다.

## Availability

| Surface       | 상태           | 근거 |
| ------------- | -------------- | ---- |
| Web           | `partial`      | CSS recipe `packages/css/src/component/canvas-guide.css`. React 표면은 없다 — 스냅 계산은 소비처(노드 캔버스) 몫이다 |
| Figma         | `not-ready`    | Figma 부품은 아직 없다. 세울 것: `CanvasGuide` 세트 — `Orientation`(vertical · horizontal), 길이는 늘림(FILL) |
| Documentation | `done`         | 이 문서 |
| Maturity      | `experimental` | 제품이 아직 이 클래스를 물지 않는다 |

## Properties

좌표는 소비처가 준다 — 제품의 스냅 결과 한 줄이 선 하나다(`useSmartGuideSnapping.ts:4-13`).

| 값 | 뜻 |
| --- | --- |
| `type` | 세로 · 가로 |
| `position` | 맞춘 줄의 x(세로) 또는 y(가로), 캔버스 좌표 |
| `start` · `end` | 선이 뻗는 구간 — 맞춘 두 노드를 함께 덮는다 |

변형 축은 없다.

## States

| 상태 | 그림 |
| --- | --- |
| 끄는 중 · 줄이 맞음 | 선이 선다 |
| 그 밖 | 층을 그리지 않는다(소비처가 빈 목록이면 `<svg>` 를 두지 않는다) |

## Content

글자가 없다.

## Accessibility

- 끄는 동안의 시각 보조다(`aria-hidden`). 스냅 자체는 위치로 결과가 남으므로 보조기술에 알리지 않는다.
- 줌과 무관하게 화면 1px 이다. 강제 색에서는 `Highlight` 로 칠한다.
- 대비(실브라우저 실측, 그래픽 3:1): 캔버스 바닥(`bg-canvas`) 위 라이트 3.78 · 다크 6.01, 노드 카드(`bg-surface`) 위 4.02 · 5.48.

## Acceptance tests

`packages/react/test/canvas-guide.browser.test.tsx` 가 클래스 마크업을 실브라우저로 렌더해 잰다 — 층이 변환 층 전체를 덮고 포인터를 받지 않으며
(선 아래 카드가 누름을 받는다) 넘침을 자르지 않고 숫자 z-index 가 없는 것, 줌 50% 층 안에서 선이 `non-scaling-stroke` · 1px 인 것,
두 테마에서 선 색이 `color-canvas-guide` 이고 바닥 · 카드 위 3:1 을 넘는 것.

## Known deviations

1. **제품 리터럴 `#ff2d55` 를 새 원시로 세우지 않았다.** 라이트 바닥 위 3.28 로 그래픽 3:1 은 넘지만 램프 밖 색이다.
   제품 주석의 「핑크/마젠타」(`SmartGuideOverlay.tsx:39`) 의도대로 `pink-600` · `pink-500` 으로 접었다(DS-D-0084 「작은 새 부품」 판단 13).
2. **두께를 화면 1px 로 고정했다.** 제품은 캔버스 좌표 1 이라 줌 50% 에서 0.5px 로 흐려진다(판단 14). 전선(Canvas Edge)은 반대로 캔버스 두께를 따른다 —
   전선은 그림이고 이것은 계기다.

## 제품에서 발견한 것

- 빛 필터(`guideGlow`, `SmartGuideOverlay.tsx:30-34`)가 정의만 있고 어느 선도 쓰지 않는다 — 옮기지 않는다.
- 함수 주석(`SmartGuideOverlay.tsx:11`)은 「분홍/하늘색 대시」라 적지만 구현은 분홍 실선 한 색이다.
- 숫자 z-index 1000(`SmartGuideOverlay.tsx:25`) — 레시피는 칠 순서로 둔다.
