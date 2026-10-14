---
id: decision-drill-picker
status: experimental
authority: normative
---

# DS-D-0105 「프로젝트에서 가져오기」 피커를 새 부품 `drill-picker` 로 — 폴더 행은 Selectable List Row 이동 행, 새로 서는 것은 고르기 행 · 머리 · 발이다

- Status: accepted (소유자 지시로 초안의 기본값을 받는다, 2026-10-15)
- Date: 2026-10-15
- Owners: repository owner, design system maintainer
- Affects: `drill-picker`, `selectable-list-row`, `checkbox`, `badge`, `button`, `skeleton`, `decision-product-parts-become-louis`

## Context

원장의 `components/scenes/VideoEditProjectPicker.tsx#VideoEditProjectPickerContent` 가 `needed` 로 남아 있었다(통합 판 `54b62a8aa`). 영상 편집기 에셋 패널의
「프로젝트에서 가져오기」 본문이다(`AssetPanel.tsx:1432`) — Finder 식 두 단계: 프로젝트 목록(폴더 글리프 · 이름 · 체브론 행) → 그 프로젝트의 영상 목록(체크박스 ·
16:9 썸네일 · 종류 배지 또는 노드 아이콘 · 이름 행) + 아래 가져오기 버튼(`VideoEditProjectPicker.tsx:21-168`).

있는 것: 프로젝트 행은 [Selectable List Row](../../components/selectable-list-row.md) 의 이동 행(`data-layout="link"`)이 이미 「영상 편집기 프로젝트 피커가
그 자리다」라고 적는다. 체크박스는 `louis-checkbox` 를 문다. 로딩은 [Skeleton](../../components/skeleton.md) 이 그릴 수 있다. 없는 것: 여럿 고르기 행(Selectable List
Row 는 「여럿을 고르는 목록은 이 컴포넌트가 아니다 — Checkbox + 행 레이아웃」이라 스스로 뺐다), 뒤로 · 폴더 이름 머리, 위 헤어라인 목록 상자, 가져오기 발.

제품 값의 결함 — 실패 · 빈 목록 글 rgb(251 146 150) 96% 가 라이트 메뉴 면 위 1.91:1, 행 · 뒤로 잉크가 테마 분기 고정 팔레트 알파, 가져오기 버튼 · 종류 배지가
LOUIS Button · Badge 와 다른 면(primary 32% · 16%)을 각자 칠한다(대비는 8.7 · 9.8 로 결함이 아니다 — 수렴의 문제다).

## Decision

1. **새 부품 `drill-picker`**(`.louis-drill-picker` · `__head` · `__back` · `__title` · `__list` · `__check-row` · `__thumb` · `__meta` · `__label-row` · `__label` ·
   `__message` · `__footer`). 고르기 행은 `<label>` 하나가 체크박스 · 썸네일 · 글을 품는다 — 컨트롤이 중첩되지 않는다.
2. **있는 부품을 받는다** — 폴더 행 `.louis-selectable-list-row[data-layout="link"]`, 체크박스 `.louis-checkbox__control`, 종류 배지 `.louis-badge[data-tone="info"]`,
   가져오기 `.louis-button` primary lg(폭 100%), 로딩 `.louis-skeleton`.
3. **값은 제품 그대로** — 루트 간격 6, 머리 최소 28 · 간격 6, 뒤로 28 · 반경 8, 목록 위 선 1 · 위 여백 6 · 행 간격 2, 행 여백 8 · 6 · 간격 10 · 반경 8,
   썸네일 92 · 16:9 · 반경 8 · 경계 1, 글 묶음 간격 4, 아이콘 줄 간격 8, 발 여백 10 · 4 · 4.
4. **고쳐 올리는 값**(DS-D-0084 3항) — 실패 글 `fg-danger-on-surface`, 잉크 `fg-secondary` / 호버 `fg-primary`, 행 호버 면 `accent-ghost-hover`.
5. **Figma** — 고르기 행 세트 `DrillPickerRow`(`State` Default · Hover × `Checked` false · true, `Label` · `Badge` · `Icon`)와 항목 단계 합성 `DrillPicker`(머리 · 행 셋 ·
   발). 폴더 단계는 `SelectableListRow Layout=link` 인스턴스로 그린다. 새 토큰 · 의존성 · React 표면 없음.

### 소유자 판정 — 초안의 기본값으로 정했다

| # | 판단 | 기본값 | 대안 |
| --- | --- | --- | --- |
| 1 | 새 부품인가 | `drill-picker` 신설(폴더 행은 Selectable List Row 재사용) | Selectable List Row 에 `data-layout="check"` 변형 — 그 문서가 여럿 고르기를 범위 밖으로 뒀다 |
| 2 | 종류 배지 | `.louis-badge` info | 제품 primary 16% 면 그대로(새 시맨틱) |
| 3 | 목록 위 여백 | 두 단계 모두 6 | 폴더 목록 2 · 영상 목록 6 으로 가름(`data-` 속성 하나) |
| 4 | 가져오기 버튼 | `.louis-button` primary lg(40) — 제품 41 | 제품 primary 32% 면 · 높이 41 을 이 부품이 소유 |
| 5 | 로딩 | `.louis-skeleton`(행 치수 자리표시) | 제품 자체 그라디언트 쉬머 |
| 6 | 드릴 슬라이드(300ms) | 옮기지 않는다 — 움직임 토큰 회차 | 레시피 keyframes 두 벌 |

## Consequences

- 원장의 `VideoEditProjectPickerContent` 는 `figma: DrillPicker` 로 닫을 수 있다(사상은 조정자가 적는다). 같은 파일의 scoped 표면(글리프 · 썸네일 분기 · 스켈레톤)은 그대로다.
- Figma 세트 둘이 같은 manifest 항목(`figmaNames`)에 선다. 기록은 `drill-picker` 하나에 `picker` · `row` 두 칸이다.

## Rollback

레시피 · 문서 · manifest 항목 · 계약 둘 · 기록 · 시험을 지우고 Figma `DrillPicker` · `DrillPickerRow` 를 지운다.
