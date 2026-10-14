---
id: decision-table-drawer
status: experimental
authority: normative
---

# DS-D-0107 표 행 아래 펼치는 계정 목록을 새 부품 `table-drawer` 로 — Record Card 의 상세도 Stat Tile 도 아닌 「올린 면 안의 표」

- Status: accepted (소유자 지시로 초안의 기본값을 받는다, 2026-10-15)
- Date: 2026-10-15
- Owners: repository owner, design system maintainer
- Affects: `table-drawer`, `table`, `stat-tile`, `record-card`, `icon-button`, `button`, `decision-product-parts-become-louis`

## Context

원장의 `app/admin/AdAttributionPanel.tsx#GroupDrawer` 가 `needed`(oneoff)로 남아 있었다(통합 판 `54b62a8aa`). 광고 성과 표의 줄을 펼치면 그 아래
`colSpan 6` 칸에 서는 계정 목록 판이다 — 올린 면(`ADMIN_SURFACE` = `bg-raised` + 헤어라인, `AdminSection.tsx:69-70`) · 반경 16 · 여백 16 · 간격 12(`:95`),
머리 줄(제목 14 Medium + 「광고 ID」 12 tertiary + 복사 IconButton, `:506-514`), 두 번째 `louis-table`(`:517`), 「더 보기」 secondary Button(`:562`).

있는 것 — 안의 Table · Button · IconButton 은 정본이 있다. 없는 것 — **올린 면 + 머리 줄 + 표를 묶는 판.** [Record Card](../../components/record-card.md)
`raised` 는 라벨/값 상세를 펼치는 카드이고 머리 자체가 버튼이라 구성이 다르다. [Stat Tile](../../components/stat-tile.md) 은 같은 면이지만 KPI 타일이다.
원장 kind 는 oneoff(호출 자리 하나)이지만, 소유자 지시(2026-10-12, 「제품의 모든 것을 LOUIS 부품으로」)가 한 자리라는 이유로 화면 고유로 두는 기본값을 거뒀다.

제품 값에 대비 결함은 없다 — 보조 글 `fg-tertiary` 는 `bg-raised` 위에서 두 테마 모두 4.5 를 넘는다(시험 2).

## Decision

1. **새 부품 `table-drawer`**(`.louis-table-drawer` · `__head` · `__title` · `__meta` · `__body`). 면 `bg-raised` + `hairline-inset` · 반경 `radius-overlay` · 여백
   `space-control-lg` · 간격 `space-control-md`. 머리는 양 끝 정렬 · 줄바꿈 허용, 보조 묶음 간격 `space-control-xs`.
2. **있는 부품을 그대로 받는다** — 안쪽 표 `.louis-table`, 복사 IconButton sm ghost, 더 보기 `.louis-button` secondary(왼쪽 정렬). 펼침 트리거는 표 행 끝의
   IconButton(`aria-expanded` · `aria-controls`)이고 서랍은 그 `id` 를 갖는다.
3. **Table 의 변형으로 넣지 않는다** — Table 은 칸 · 머리 · 행의 문법이고 이 판은 표를 **담는** 면이다. Table 레시피 · Figma 세트를 건드리지 않는다.
4. Figma 는 한 장 `TableDrawer`(640 폭 표본, 안쪽 Table · IconButton · Button 인스턴스). 새 토큰 · 의존성 · React 표면 없음.

### 소유자 판정 — 초안의 기본값으로 정했다

| # | 판단 | 기본값 | 대안 |
| --- | --- | --- | --- |
| 1 | 새 부품인가 | `table-drawer` 신설 | Table 의 `data-layout="drawer"` 행 변형 · Record Card `raised` 확장 |
| 2 | 면 | `bg-raised` + 헤어라인(Stat Tile 과 같은 칸) | 오버레이 면(`bg-overlay`) |
| 3 | 반경 | `radius-overlay`(16) | `radius-card`(12) — 제품과 다르다 |
| 4 | 「더 보기」 뒤 포커스 | 새로 열린 첫 줄로 옮긴다(제품 동작 그대로, 문서 계약) | 버튼에 남긴다 |

## Consequences

- 원장의 `GroupDrawer` 는 `figma: TableDrawer` 로 닫을 수 있다(사상은 조정자가 적는다).

## Rollback

레시피 · 문서 · manifest 항목 · 계약 · 기록 · 시험을 지우고 Figma `TableDrawer` 를 지운다.
