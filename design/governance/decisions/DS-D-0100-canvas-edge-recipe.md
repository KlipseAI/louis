---
id: decision-canvas-edge-recipe
status: experimental
authority: normative
---

# DS-D-0100 연결선에 레시피를 세운다 — 실선 · hover 잉크 · 히트 영역 · 삭제 버튼은 LOUIS, 쉬머 한 겹은 제품 JS (DS-D-0061 재판정)

- Status: accepted (소유자 지시로 판정마다 기본값을 받는다, 2026-10-14)
- Date: 2026-10-14
- Owners: repository owner, design system maintainer
- Affects: `canvas-edge`, `decision-canvas-edge-canon-is-a-token-table`, `decision-product-parts-become-louis`

## Context

[DS-D-0061](DS-D-0061-canvas-edge-canon-is-a-token-table.md)(2026-09-09)은 「연결선의 정본은 CSS 가 아니라 톤 표다」를 근거로
`canvas-edge` 에 레시피를 세우지 않았다. 근거는 둘이었다 — 쉬머의 페인트가 인스턴스 기하(두 핸들 좌표에서 나오는
`linearGradient`)이고, 주기가 SMIL 의 `dur` 이라 CSS 로 옮겨갈 수 없다. 그래서 레시피는 한 표를 CSS 와 JS 두 집에 살게 한다.

[DS-D-0084](DS-D-0084-product-parts-become-louis.md)(소유자 2026-10-12: 「제품에 보이는 모든 것을 LOUIS 부품으로」)가 이 판정을 다시
열라고 적었다. 같은 날 Figma `CanvasEdge` 는 `partial` 에 남은 다섯 중 하나였고, 사유는 「쉬머 · 번짐 · 삭제 버튼이 Figma 에 없고
LOUIS recipe 가 없어 evidence 가 한 방향」이었다. 제품 표면 원장은 `DeletableEdge` 를 Figma 대응이 없는 자리로 센다.

다시 보면 DS-D-0061 의 두 근거는 **쉬머 한 겹에 대해서만 참이다.** 연결선의 나머지 — 실선(두께 2 · 둥근 끝 · 톤마다 채널 토큰),
hover 의 흰 잉크, 투명한 히트 영역 44, 선 한가운데 뜨는 삭제 버튼(20 원 · 붉은 면 · 흰 X · 그림자 · 호버 1.12 · 누름 0.94) — 은
CSS 가 온전히 담고, 제품도 이미 클래스 상수(`DELETE_BTN` · `LABEL_WRAP`)와 SVG 속성으로 갖고 있다. 「여덟 번째 사본」 우려는
쉬머 표에 대한 것이었고 이 넷에는 해당하지 않는다.

제품 값에 결함이 셋 있다 — 채널 없는 실선(`default`)이 두 테마 다 palette-gray-000 이라 라이트 캔버스(palette-gray-025) 위에서
1.03:1 로 사라진다, 삭제 버튼이 호버로만 떠서 포인터 없이는 연결을 지울 수 없다(SC 2.1.1), 버튼에 포커스 표시가 없다(SC 2.4.7).

## Decision

| 판단 | 기본값 | 대안 |
| --- | --- | --- |
| 레시피를 세우나 | **세운다** — `packages/css/src/component/canvas-edge.css`. DS-D-0061 을 이 범위에서 뒤집는다 | 판정 유지(Figma partial 이 영구히 남는다) |
| 레시피가 갖는 것 | **실선 · hover 잉크 · 히트 영역 · 라벨 감싸개 · 삭제 버튼.** `.louis-canvas-edge`(`data-tone` · `data-hovered`) · `__base` · `__shimmer`(획 모양만) · `__hit` · `__label`(`data-visible`) · `__delete` · `__delete-glyph` | 쉬머 stop 색까지 레시피로(시맨틱 여섯이 더 필요하고 표가 두 집에 산다 — 거절) |
| 쉬머 한 겹 | **제품 JS 의 톤 표(`V2_EDGE_TONE`)에 남는다** — 그라디언트 좌표 · SMIL 주기 · 하이라이트 stop · 번짐. DS-D-0061 의 두 근거가 여기서는 여전히 참이다 | — |
| 삭제 버튼의 자리 | **canvas-edge 의 부품이다**(별 부품이 아니다). manifest 항목은 하나이고 `figmaNames` 가 `CanvasEdge` · `CanvasEdgeDelete` 둘이다. Figma `CanvasEdge` 의 `State=Hover` 칸이 선 한가운데 `CanvasEdgeDelete`(Hover) 인스턴스 `Delete` 를 품는다 — 제품 `DeletableEdge` 를 그대로 투영한다 | Icon Button 의 변형으로 흡수(붉은 면 · 20 원 · 그림자가 사다리 밖 — 거절) · 별 부품(소비처가 하나뿐 — 거절) |
| 삭제 버튼 색 | **새 시맨틱 여섯**(`color-canvas-edge-delete-surface` red-600 88% · `-surface-hover` red-600 · `-stroke` 56% · `-stroke-hover` 80% · `-ink` 흰 88% · `-shadow` 순검정 40%)과 **새 원시 셋**(`color-red-600-alpha-56` · `-80` · `-88`). 호버 잉크는 `fg-on-danger`. Figma 는 변수 알파가 칠 불투명도를 덮어 알파를 변수로만 담을 수 있다 | 알파를 접어 불투명 red-600 한 칸으로(제품 「호버는 약간 더 진한 알파」를 잃는다 — 거절) |
| Hover 의 scale · 누름 | **Figma 칸을 열지 않는다** — 크기가 아니라 동작이다(NodeChromeButton `$whyNoActive` 와 같은 판정). 레시피는 `@media (hover: hover)` 안에서 1.12, `:active` 0.94 | — |
| 채널 없는 실선 | **새 시맨틱 `color-canvas-edge-default`** — 라이트 palette-gray-500(4.16:1) · 다크 palette-gray-000(제품 그대로). DS-D-0084 3항 — 과거 부채를 고쳐 올린다. Figma `Tone=default` 의 Line 도 이 변수로 다시 묶는다 | 제품 그대로(라이트 1.03:1 — 거절) |
| hover 의 흰 잉크 | **새 시맨틱 `color-canvas-edge-hover-ink`**(palette-gray-000) — `color-mix(채널 88%, 흰 잉크)`. 일곱 톤 중 넷만(제품 `TONE_LIFTS_ON_HOVER`) | — |
| 키보드 | **라벨이 `:focus-within` 에서 보인다** — 포커스가 들어오면 숨김을 푼다. 포커스 링 `elevation-focus-ring`. 제품 부채를 고쳐 올린다(SC 2.1.1 · 2.4.7) | — |
| 호버 가드 | **`@media (hover: hover)` 안**(DS-D-0077) — 제품은 가드 없는 `:hover` 다 | — |
| 층 | **숫자 z-index 를 두지 않는다** — 라벨의 `z-20` · `z-[12050]` 은 캔버스의 노드 층이 정한다 | — |

## Consequences

- `figma/components.measured.json` 의 `$noRecipe` 명부가 비고(장치는 남는다), manifest 의 `web` 이 `not-planned` 에서 `partial` 이 된다.
  `verify-gates` 의 명부 카나리아 둘은 판정을 지어 넣어 장치가 살아 있음을 증명한다.
- 새 기록 `canvas-edge-delete`(State 키 Default · Hover)와 parity 계약 `CanvasEdgeDelete`, 레시피 되재기
  `canvas-edge-recipe.browser.test.tsx` 가 서고, `canvas-edge` 의 `figma` 가 `done` 이 된다(`verify-figma-done`).
- 제품 표면 원장의 `DeletableEdge` 는 Figma `CanvasEdge` 에 대응한다(Hover 칸의 `Delete` 인스턴스).
- 남는 것: 쉬머 · 번짐은 Figma 에 없다(애니메이션 · 톤마다 다른 반경), 워크스루 사본 넷의 어긋남, 색만으로 채널을 말하는 것(SC 1.4.1).

## Rollback

`packages/css/src/component/canvas-edge.css` 를 지우고 `$noRecipe` 에 DS-D-0061 의 사유를 되돌리고 manifest `web` 을 `not-planned` 로
내린다. Figma 는 `CanvasEdgeDelete` 세트와 Hover 칸의 `Delete` 인스턴스를 지우고 `Tone=default` 의 Line 을 palette-gray/000 으로
되묶는다. 그때 `figma` 를 `partial` 로 내리면 `MANIFEST_DONE_FLOOR` 도 함께 내려야 한다.
