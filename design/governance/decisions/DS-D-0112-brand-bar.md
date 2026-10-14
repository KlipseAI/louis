---
id: decision-brand-bar
status: experimental
authority: normative
---

# DS-D-0112 앱 셸 없는 독립 화면의 머리 막대를 새 부품 `brand-bar` 로 — 왼쪽 락업, 오른쪽 Text Link 묶음, App Top Bar 의 변형이 아니다

- Status: accepted (소유자 지시로 초안의 기본값을 받는다, 2026-10-15)
- Date: 2026-10-15
- Owners: repository owner, design system maintainer
- Affects: `brand-bar`, `text-link`, `app-shell-parts`, `decision-product-parts-become-louis`

## Context

표면 원장의 `app/deck/DeckParts.tsx` 의 `DeckTopBar` 가 `needed` 로 남았다. 덱 화면군(앱 사이드바 없는 독립 화면) 네 라우트 — `deck/page.tsx` ·
`deck/c/[course]/page.tsx` · `deck/manage/page.tsx` · `deck/notice/page.tsx` — 가 같은 막대를 그린다(통합 판 `54b62a8aa`). 왼쪽은 「Klipse 워드마크 + Deck」
락업(높이 28, 홈 링크면 `louis-focus-ring rounded-8`), 오른쪽은 링크 묶음(`gap-x-12 gap-y-4` · `flex-wrap` · 오른쪽 정렬)이고 링크는 body-14 medium
`fg-secondary` → 호버 `fg-primary` 다. 막대는 `gap-8` 에 아래 여백 `mb-24` 다.

LOUIS 의 [App Shell Parts](../../components/app-shell-parts.md) `AppTopBar` 는 앱 셸 안의 40 막대(제목 가운데)라 맞지 않고, 락업형 독립 화면 머리가 없다.
링크 모양은 [Text Link](../../components/text-link.md) 의 `data-underline="none"` 이 이미 갖는다(그 문서의 소비처 표가 이 파일을 든다).

## Decision

1. **새 부품 `brand-bar` 한 벌**(`.louis-brand-bar` · `__brand` · `__links` · `__link`). 이름은 덱이 아니라 모양(브랜드 락업 막대)으로 짓는다 —
   다음 독립 화면(공유 · 초대 같은)이 이름을 바꾸지 않고 쓴다.
2. **막대** — 양끝 · 가운데 맞춤 · 사이 16(`space-control-lg`). **링크 묶음** — 오른쪽 정렬 · 줄바꿈 · 세로 8(`space-control-sm`) · 가로 24(`space-layout-section`).
3. **락업은 소비처의 그림이다.** 레시피는 자리(높이 28 `layout-app-shell-brand-mark-height` · 줄지 않음 · 링크면 반경 8)만 갖는다.
4. **링크는 Text Link 그대로**(`.louis-text-link[data-underline="none"]`) + `__link`(body-sm medium · 줄바꿈 없음).
5. 아래 여백 48 은 화면 몫이다 — 막대가 갖지 않는다. 새 토큰 · 새 의존성 · React 표면 없음.

### 소유자 판정 — 초안의 기본값으로 정했다

| # | 판단 | 기본값 | 대안 |
| --- | --- | --- | --- |
| 1 | 자리 | 새 부품 `brand-bar` | `app-shell-parts` 의 AppTopBar 변형(앱 셸 40 막대 계약이 깨진다) · 덱 전용 `deck-top-bar` |
| 2 | 링크 모양 | Text Link `underline=none` 그대로 | 부품 안 링크 잉크를 따로 |
| 3 | 아래 여백 48 | 화면 몫 | 막대가 `margin-block-end` 로 갖는다 |
| 4 | 락업 높이 토큰 | `layout-app-shell-brand-mark-height`(28, 같은 브랜드 마크 높이) | 새 토큰 · 리터럴 28 |

## Consequences

- 제품 (나): `TOP_BAR` · `TOP_LINKS` · `BACK_LINK` 를 `louis-brand-bar*` 와 `louis-text-link` 로. 보이는 변화 없음(값이 같다).
- Figma 에 `BrandBar`(BOOLEAN `ExtraLink`) 컴포넌트가 선다. 링크는 `TextLink`(Underline=none) 인스턴스다.

## Rollback

`brand-bar.css` · 문서 · manifest 세 자리 · Figma 컴포넌트 · 기록 · parity 계약을 지운다. 제품은 아직 이 클래스를 물지 않으므로 영향이 없다.
