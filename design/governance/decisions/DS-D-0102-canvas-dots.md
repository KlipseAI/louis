---
id: decision-canvas-dots
status: experimental
authority: normative
---

# DS-D-0102 노드 캔버스 바닥의 점 격자를 부품 `canvas-dots` 로 — 패턴의 채움이 아니라 Figma 가 인스턴스로 까는 한 칸이다

- Status: accepted (소유자 지시로 초안의 기본값을 받는다, 2026-10-15)
- Date: 2026-10-15
- Owners: repository owner, design system maintainer
- Affects: `canvas-dots`, `pattern-editor-workspace`, `chart-card`, `decision-product-parts-become-louis`

## Context

원장의 `components/scenes/create/node-canvas-v2/components/CanvasBackground.tsx#CanvasBackground` 가 `needed` 로 남아 있었다(통합 판 `54b62a8aa`).
노드 캔버스의 바닥 — xyflow `<Background variant=Dots gap=24 size=2>`(`CanvasBackground.tsx:5-6` · `:15-20`) — 이고, 렌더 지점이 셋이다(CreateScene ·
랜딩 NodeMockupCard · StaticCreateDemo). 원장 사유는 「Figma 에 이 바닥이 없으면 어떤 캔버스 보드도 얹을 바닥이 없다」였다.

값의 정본은 이미 있다 — 2026-10-13 의 `.louis-canvas-dots`(`packages/css/src/pattern/editor-workspace.css`, 색 `color-canvas-dot` · 바닥 `bg-canvas`,
DS-D-0082). 빠진 것은 **Figma 쪽 부품**과 **그 둘을 맞대는 축**이다. 패턴은 `figma/templates.measured.json` 축이라 「지금 코드가 그 값을 만든다」를
세울 수 없고(verify-figma-done 머리말), Figma 의 패턴 채움(이미지 · `pattern/canvas-dot` 자산)은 변수를 받지 못해 라이트 · 다크 점 색이 모드를 따르지 않는다.
차트 점 바닥이 같은 벽에 부딪혀 타일 컴포넌트 `ChartCardDotTile` 로 풀었다(2026-10-13).

## Decision

1. **새 부품 `canvas-dots`** — 레시피는 그대로 `.louis-canvas-dots`(파일도 그대로 `pattern/editor-workspace.css`)이고, 이 결정은 그 클래스를 **컴포넌트 축으로
   등록**한다. 규범 문서 `design/components/canvas-dots.md` 가 생기고 editor-workspace 문서의 같은 절은 그쪽을 가리킨다.
2. **Figma 는 한 칸 타일 `CanvasDots`(24 × 24)** — 면 `color/bg-canvas`, 가운데 지름 2 의 점 `Dot` 이 `color/canvas-dot`. 보드는 이 타일을 격자로 깔거나
   타일 하나를 채움 원본으로 쓴다. 변형 축이 없다(테마는 모드, §4).
3. **기하 계약은 격자 간격과 점 지름 둘** — `figma/components.measured.json` 의 `canvas-dots.tile.pitch` · `dot`. 값은 레시피 선언이고(`--louis-canvas-dots-pitch: 24px` ·
   `--louis-canvas-dots-radius: 1px`), 실브라우저 시험이 계산된 `background-size` 와 그라디언트 반지름으로 되잰다.
4. **점 대비는 고치지 않는다.** 점은 위치를 가늠하는 장식이고 정보를 싣지 않는다(WCAG 1.4.11 의 대상 밖). 시험은 대비를 **재서 적고**(점이 바닥에서 사라지지
   않는다 — 1.2:1 이상) 3:1 을 요구하지 않는다.

### 소유자 판정 — 초안의 기본값으로 정했다

| # | 판단 | 기본값 | 대안 |
| --- | --- | --- | --- |
| 1 | 부품인가 패턴의 채움인가 | 부품 `canvas-dots` 로 등록(레시피 파일은 옮기지 않는다) | 패턴에 두고 표면을 `scoped` 로 |
| 2 | Figma 형태 | 24 타일 한 칸(`ChartCardDotTile` 과 같은 기법) | 이미지 패턴 채움 — 변수를 받지 못한다 |
| 3 | 점 대비 | 장식이라 재기만 한다 | 점 알파를 올려 3:1 — 캔버스가 시끄러워진다 |
| 4 | 랜딩 정적 임베드의 20% 점 | 이 부품의 칸이 아니다(DS-D-0084 판정 11 그대로) | `color-canvas-dot-on-media` 신설 |

## Consequences

- 원장의 `CanvasBackground` 는 `figma: CanvasDots` 로 닫을 수 있다(사상은 조정자가 원장에 적는다).
- 레시피 값을 바꾸면 기록(`canvas-dots`) · Figma 타일 · 시험이 함께 빨개진다 — 패턴 축으로는 걸리지 않던 일이다.
- 새 토큰 · 새 의존성 없음.

## Rollback

manifest 의 `canvas-dots` 항목 · 문서 · 계약 · 기록 · 시험을 지우고 Figma 의 `CanvasDots` 를 지운다. 레시피는 원래 자리에 그대로 남는다.
