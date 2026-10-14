---
id: decision-menu-media-item
status: experimental
authority: normative
---

# DS-D-0103 영상 모델 메뉴의 행을 Menu 항목의 그림 우물 변형으로 — 새 모델 피커가 아니라 `data-layout="media"` 한 칸이다

- Status: accepted (소유자 지시로 초안의 기본값을 받는다, 2026-10-15)
- Date: 2026-10-15
- Owners: repository owner, design system maintainer
- Affects: `menu-popover`, `badge`, `text-field`, `tabs`, `decision-product-parts-become-louis`

## Context

원장의 `components/scenes/create/node-canvas-v2/nodes/VideoModelMenu.tsx#VideoModelMenu` 가 `needed` 로 남아 있었다(통합 판 `54b62a8aa`). 영상 노드의 모델 고르기
메뉴이고 구성은 셋이다 — 검색 칸(`:66-73`) · 프로바이더 필터 칩(`:89-102`, 배경 없는 글자 탭) · 모델 목록(`:121-283`). 원장 사유는 「항목이 Menu 정본의
아이콘 + 라벨보다 정보가 많아(브랜드 로고 · 능력 축) 흡수되지 않는다」였다.

셋 중 둘은 이미 정본이 있다(Text Field · Tabs 의 글자 탭). 패널은 `MenuPanel` 이다. 남는 것은 **행 하나**다 — 48 우물에 브랜드 로고 24, 이름 16 medium,
끝 배지(「업데이트 예정」 · 「Basic 이상」), 설명 12 한 줄(`:149-166` · `:181-184` · `:251-283`). Menu 의 두 줄 항목(`Layout=description`, 20 타일 · 이름 14)과
뼈대가 같고 우물 크기 · 이름 단계 · 배지만 다르다.

제품 값의 결함 셋 — 설명 48%(tertiary 칸)는 호버 면 위 다크 4.28 로 미달, 플랜 잠김 행은 0.78 흐림이라 이름 대비가 내려가고 보라 면 · 보라 배지가 LOUIS
어휘에 없다, 비활성 행은 0.55 흐림이다.

## Decision

1. **Menu 항목의 변형 `data-layout="media"`** — 레시피 `menu-popover.css` 에 우물(`__item-media`) · 이름 줄(`__item-heading`)을 더한다. 행은 `role="option"`
   (값 목록)이고 선택은 정본 규칙(`aria-selected` → `accent-secondary-hover` 면)을 따른다. `§2` 의 `Layout` 어휘에 `media` 가 이미 있다.
2. **Figma 는 따로 선 세트 `MenuMediaItem`** — `State` = Default · Hover · Selected · Disabled. `Menu` 세트의 `Layout` 에 넣으면 `State` 일곱과 곱해져 실현되지 않는
   칸(Danger · Busy …)이 생긴다. 속성 `Title` · `Description` · `Badge`(BOOLEAN) · `MediaGlyph`(INSTANCE_SWAP).
3. **브랜드 로고는 레시피가 칠하지 않는다.** 원장의 `ProviderGlyph` 가 scoped(제3자 자산)이고, 평상시 실루엣 · 호버 원색은 소비처의 그림 처리다.
4. **고쳐 올리는 값**(DS-D-0084 3항) — 설명 `fg-secondary`, 비활성은 잉크 `fg-disabled`(행 흐림 대신), 플랜 잠김은 따로 그리지 않는다.
5. 새 토큰 · 새 의존성 · React 표면 없음.

### 소유자 판정 — 초안의 기본값으로 정했다

| # | 판단 | 기본값 | 대안 |
| --- | --- | --- | --- |
| 1 | 새 부품인가 | Menu 항목의 변형(`data-layout="media"`) + Figma 세트 `MenuMediaItem` | 모델 피커 전용 부품 · Menu 세트의 `Layout=media` 칸 일곱 |
| 2 | 우물 반경 | `radius-control-sm`(8) | 제품 6 리터럴 |
| 3 | 플랜 잠김 행 | 기본 행 + 배지 글자(중립 배지) — 누를 수 있다 | 제품 보라 면 · 보라 배지(새 토큰 둘) · 0.78 흐림 |
| 4 | 설명 잉크 | `fg-secondary`(호버 면 위 4.5 이상) | 제품 48%(tertiary, 다크 호버 4.28) |
| 5 | 설명 마퀴 | 옮기지 않는다 — 한 줄 말줄임 | 호버 마퀴(움직임 토큰 · reduced-motion 분기) |
| 6 | 선택 표시 | 값 목록 정본(`aria-selected` 면) | 제품처럼 선택 면 없음 |

## Consequences

- 원장의 `VideoModelMenu` 는 `figma: MenuMediaItem` 으로 닫을 수 있다(사상은 조정자가 적는다). 패널은 `MenuPanel`, 검색은 Text Field, 칩은 Tabs 가 그린다.
- `menu-popover` 의 Figma `done` 이 새 세트까지 덮는다 — 계약 · 기하(`menu-media-item`) · 브라우저 되재기가 함께 선다.

## Rollback

레시피의 `data-layout="media"` 절 · 문서 절 · 계약 · 기록 · 시험 · manifest `figmaNames` 의 `MenuMediaItem` 을 지우고 Figma 세트를 지운다.
