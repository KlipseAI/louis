---
id: decision-section-shell
status: experimental
authority: normative
---

# DS-D-0111 랜딩 섹션의 리듬을 토큰 일곱과 껍데기 `section-shell` 로 — 세로 120 · 88 · 60, 좌우 20 · 16 · 12, 콘텐츠 1400, bleed 축

- Status: accepted (소유자 지시로 초안의 기본값을 받는다, 2026-10-15)
- Date: 2026-10-15
- Owners: repository owner, design system maintainer
- Affects: `section-shell`, `landing-shell`, `section-header`, `governance-figma-component-authoring`, `decision-product-parts-become-louis`

## Context

표면 원장의 `components/landing/system/SectionShell.tsx` 의 `SectionShell` 이 `needed`(high)로 남았다. 랜딩 여덟 섹션(CreatorProgram · FAQ ·
ModelCarousel · NewsCarousel · OverviewSection · StepTiles · TemplateGrid · Testimonials)이 그것을 밟고, HomePageClient · Footer 는 상수만
가져간다. 값은 세 벌이다(통합 판 `54b62a8aa`).

| 축 | 값 | 경계 | 제품 |
| --- | --- | --- | --- |
| 세로 여백 | 120 → 88 → 60 | ≤959 · ≤640 | `SectionShell.tsx` 의 `SECTION` |
| 좌우 인셋 | 20 → 16 → 12 | ≤719 · ≤355 | `sectionInline.ts` 의 `INLINE` |
| 콘텐츠 폭 | 최대 1400 · 가운데 | — | `SectionShell.tsx` 의 `CONTENT_WIDTH` |
| bleed | 좌우 인셋 · 폭 제한 없음, 안쪽 상자가 같은 인셋을 직접 건다 | — | `SectionShell.tsx` 의 `bleed` · `INLINE` export |

LOUIS 에 이 리듬이 없다 — [landing-shell](../../patterns/landing-shell.md) 패턴은 GNB · 푸터 · 면을 갖지만 섹션 하나의 껍데기 값은 갖지 않는다.
원장의 kindReason 은 「그리는 부품이 아니다 — 레이아웃 토큰 한 벌 + Figma 오토레이아웃 규격」이라고 적었다.

## Decision

1. **토큰 일곱** — `layout-section-block`(120) · `-block-md`(88) · `-block-sm`(60) · `layout-section-inline`(20) · `-inline-md`(16) ·
   `-inline-sm`(12) · `layout-section-content-max`(1400). 원시 둘(`space-88` · `space-1400`)이 함께 선다.
2. **껍데기 레시피 `section-shell`**(`.louis-section-shell` · `__content` · `__inset`, 축 `data-bleed`). 면 · 선 · 반경 · 글자가 없는
   레이아웃 부품이다 — 레시피는 계단을 경계에 붙이는 일만 한다.
3. **경계는 제품 그대로** — 세로 ≤959 · ≤640, 좌우 ≤719 · ≤355. 640 · 355 는 LOUIS compact 경계(719)와 다르지만 랜딩 전 섹션이 같은
   경계를 밟아야 줄이 맞아 접지 않는다.
4. **Figma 는 `SectionShell` 컴포넌트**(Viewport × Bleed) — 패딩 · 최대 폭을 토큰 변수에 묶은 오토레이아웃 규격이다. 이를 위해
   [figma-component-authoring](../figma-component-authoring.md) §2 에 `Viewport` 축(값 = CSS 미디어 경계의 철자)과 조건 축 `Bleed` 를 연다.
5. 새 의존성 · React 표면 없음. 리빌(`data-reveal`)과 앵커 여백(`scroll-mt-60`)은 껍데기 밖 — 소비처 몫이다.

### 소유자 판정 — 초안의 기본값으로 정했다

| # | 판단 | 기본값 | 대안 |
| --- | --- | --- | --- |
| 1 | 형태 | 토큰 일곱 + 껍데기 레시피 + Figma 컴포넌트 | 토큰만(레시피 없음) · `landing-shell` 패턴 안 블록 |
| 2 | 좌우 인셋 토큰 | 따로 셋(`layout-section-inline*`) — 값이 같은 `space-media-inset` 등을 빌리지 않는다 | 기존 간격 토큰 재사용(뜻이 다른 이름을 빌린다) |
| 3 | 경계 640 · 355 | 제품 그대로 | 719 · 479 로 접기(랜딩 전 섹션의 줄이 바뀐다) |
| 4 | Figma 축 | `Viewport`(경계 철자) × 조건 축 `Bleed` — 다섯 칸이 실재한다 | `Size` 사다리(두 계단의 경계가 달라 셋으로 안 접힌다) · 예시 프레임만 |
| 5 | 리빌 · 앵커 여백 | 소비처 | 껍데기가 `data-reveal` · `scroll-margin` 을 갖는다 |

## Consequences

- 제품 (나): `SECTION` · `INLINE` · `CONTENT_WIDTH` 를 `louis-section-shell` · `__inset` · `__content` 로. 보이는 변화 없음(값 · 경계가 같다).
- Figma 에 변수 아홉 · `SectionShell` 세트가 선다.

## Rollback

`section-shell.css` · 토큰 아홉 · 문서 · manifest 세 자리 · Figma 세트 · 변수 · 기록 · parity 계약 · §2 의 두 줄을 지운다. 제품은 아직 이 클래스를
물지 않으므로 영향이 없다.
