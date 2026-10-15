---
id: decision-node-handle-tile
status: experimental
authority: normative
---

# DS-D-0108 도움말 패널의 채널 타일을 새 부품 `node-handle-tile` 로 — Node Side Handle 의 크기 축이 아니라 누르지 않는 그림

- Status: accepted (소유자 지시로 초안의 기본값을 받는다, 2026-10-15)
- Date: 2026-10-15
- Owners: repository owner, design system maintainer
- Affects: `node-handle-tile`, `node-side-handle`, `pattern-editor-workspace`, `decision-product-parts-become-louis`

## Context

원장의 `components/scenes/create/node-canvas-v2/components/CanvasHelpPanel.tsx#HandleTile` 이 `unclear` 로 남아 있었다(통합 판 `54b62a8aa`). 캔버스 도움말 패널의
입력 목록 앞에 붙는 채널 타일이다 — 24 · 반경 6 · 채널 면 `--node-handle-icon-*` 위 팔레트 흰색 글리프 14(`CanvasHelpPanel.tsx:224-244`), 여럿이면 간격 2 로 한 줄
(`:252-256`). 원장이 남긴 소유자 질문은 「[Node Side Handle](../../components/node-side-handle.md) 에 크기 · 채널 축을 더할지, 패널 보드 안의 그림으로 둘지」였고
editor-workspace.md 도 같은 판정을 「낮은 우선순위」로 남겼다.

두 질문 중 하나는 이미 풀려 있다 — Node Side Handle 의 레시피는 2026-10-12 에 채널 여섯을 갖게 됐다(그 파일 머리 주석). 남은 것은 크기다. 둘은 재료(면 토큰 ·
채널 판정 · 글리프 표)를 공유하지만 **물건이 다르다** — 사이드 핸들은 누르는 단추이고(셸 · 디스크 · 안쪽 광 · 호버 필터 · 비활성 면), 타일은 `aria-hidden`
그림이다(디스크도 광도 상태도 없다). 크기 축으로 넣으면 단추의 상태 축 전부가 그림 칸에서 실현되지 않는 칸이 된다.

## Decision

1. **새 부품 `node-handle-tile`**(`.louis-node-handle-tile[data-channel]` · 묶음 `.louis-node-handle-tile-group`). 24 · 반경 6 · 면 `color-node-handle-icon-*` · 글리프 14 ·
   묶음 간격 2. Node Side Handle 의 레시피 · Figma 세트는 건드리지 않는다.
2. **잉크는 `fg-on-danger`** — 제품의 팔레트 흰색 리터럴을 Node Side Handle 과 같은 세만틱으로 옮긴다(두 테마 같은 흰색).
3. **Figma 는 `NodeHandleTile`(Channel 6)** — 면은 채널 변수, 글리프 인스턴스의 획은 `fg-on-danger` 로 덮는다. 새 토큰 · 의존성 · React 표면 없음.
4. **원장 판정** — `unclear` 를 닫고 `figma: NodeHandleTile` 로 사상한다(조정자가 적는다).

### 소유자 판정 — 초안의 기본값으로 정했다

| # | 판단 | 기본값 | 대안 |
| --- | --- | --- | --- |
| 1 | 사이드 핸들의 크기 축인가 | 아니다 — 따로 선 그림 부품 | NodeSideHandle 에 `Size` 축(28 · 24) — 상태 칸이 그림에서 실현되지 않는다 |
| 2 | 패널 보드 안의 그림으로만 둘 것인가 | 아니다 — 부품으로 세운다(DS-D-0084 「모든 것을 부품으로」) | 보드 안 손그림(원장 scoped) |
| 3 | 글리프 잉크 | `fg-on-danger`(세만틱) | 제품 팔레트 흰색 리터럴 |
| 4 | 반경 · 글리프 크기 | 제품 6 · 14 리터럴 | 사다리로 접기(8 · 16) — 24 타일에서 여백이 갈린다 |
| 5 | 글리프 대비(흰색 위 image 2.12 · text 1.73) | 고치지 않는다 — `aria-hidden` 장식이고 옆 글이 뜻을 싣는다. 면 토큰은 캔버스 단추와 공유한다 | 그림 전용 진한 면 토큰 신설 |

## Consequences

- 원장의 `HandleTile` 은 `figma: NodeHandleTile` 로 닫을 수 있다. editor-workspace.md 의 「그림용 작은 크기 축이 필요한지 판정 필요」가 이 결정으로 닫힌다.
- 채널 면 대비(image · text 의 흰 글리프)는 캔버스 사이드 핸들의 문제이기도 하다 — 그쪽은 누르는 단추라 따로 판정할 일이다(이 결정 밖).

## Rollback

레시피 · 문서 · manifest 항목 · 계약 · 기록 · 시험을 지우고 Figma `NodeHandleTile` 을 지운다.
