---
id: decision-gallery-panel
status: experimental
authority: normative
---

# DS-D-0104 편집 모달 안을 덮는 예시 패널을 새 부품 `gallery-panel` 로 — 두 번째 대화상자가 아니라 모달 내용 상자의 덮개다

- Status: accepted (소유자 지시로 초안의 기본값을 받는다, 2026-10-15)
- Date: 2026-10-15
- Owners: repository owner, design system maintainer
- Affects: `gallery-panel`, `dialog`, `asset-tile`, `icon-button`, `decision-product-parts-become-louis`

## Context

원장의 `components/scenes/create/node-canvas-v2/nodes/imageEditParts/ExampleGallery.tsx#ExampleGallery` 가 `needed` 로 남아 있었다(통합 판 `54b62a8aa`). 이미지 편집 모달의
스티커 탭에서 「예시 보기」를 누르면 열리는 패널이다 — 머리(제목 · 28 원형 닫기, 아래 헤어라인) · 본문(안내 한 줄 · 세 열 2:3 그림 격자)(`:10-49`).
파일 주석이 스스로 「모달 안을 덮는 패널 — 별도 포털을 쓰지 않는다」고 적는다(`:8-9`) — 편집 모달이 이미 포털 + 오버레이라 그 위에 또 띄우면 바깥 클릭
닫기가 서로 물린다. 그래서 [Dialog](../../components/dialog.md) 정본으로 접히지 않는다(원장 사유).

[Asset Tile](../../components/asset-tile.md) 은 고를 수 있는 칸이고 여기 칸은 보기만 한다. [Lightbox](../../components/lightbox.md) 는 한 장을 크게 본다. 맞는 부품이 없다.

제품 값의 결함 — 닫기 잉크 44% 와 안내 글 44% 가 패널 면 위에서 4.5 미달(라이트 gray-100 위 2.63 · 다크 gray-800 위 3.80, 잉크 44% 합성으로 계산), 면이 테마 고정 팔레트(다크 gray-800 · 라이트 gray-100)라
편집 모달 면(`bg-overlay`)과 한 겹이 갈려 보인다, 숫자 z-index(`z-[1]`).

## Decision

1. **새 부품 `gallery-panel`**(`.louis-gallery-panel` · `__head` · `__title` · `__close` · `__body` · `__hint` · `__grid` · `__cell`). 모달 내용 상자 안에서
   `absolute inset 0` 으로 덮는다. 숫자 z-index 없이 **마지막 자식**으로 둔다.
2. **값은 제품 그대로** — 머리 여백 10 · 12 · 8, 닫기 28 원 · 글리프 16, 본문 여백 12 · 간격 8, 격자 세 열 · 간격 8, 칸 2:3 · 반경 8 · 경계 1.
3. **고쳐 올리는 값**(DS-D-0084 3항) — 닫기 `fg-secondary`(호버 `fg-primary` + `accent-ghost-hover`), 안내 `fg-tertiary`, 면 `bg-overlay`, 칸 경계 `stroke-subtle`,
   칸 우물 `accent-secondary`.
4. **React 표면은 만들지 않는다.** Escape 로 패널만 닫기(편집 모달까지 닫히지 않게 전파를 멈춘다)는 소비처 동작으로 문서가 계약한다.
5. Figma 는 한 장 `GalleryPanel`(400 폭 표본) — 변형 축이 없다.

### 소유자 판정 — 초안의 기본값으로 정했다

| # | 판단 | 기본값 | 대안 |
| --- | --- | --- | --- |
| 1 | 새 부품인가 | `gallery-panel` 신설 | Dialog 의 `Layout=cover` 변형 — 포털 · 포커스 가두기 계약이 맞지 않는다 |
| 2 | 면 | `bg-overlay`(편집 모달과 한 겹) | 제품 gray-800 / gray-100 고정(새 시맨틱 하나) |
| 3 | 닫기 · 안내 잉크 | `fg-secondary` · `fg-tertiary`(4.5 이상) | 제품 44%(미달) |
| 4 | 칸 | 보기 전용 칸(`__cell`) — Asset Tile 이 아니다 | Asset Tile 재사용(고르기 상태가 없는데 상태 축을 끌고 온다) |
| 5 | 닫기 | 이 부품의 28 원(`__close`) | IconButton sm(24) — 제품보다 작아진다 |

## Consequences

- 원장의 `ExampleGallery` 는 `figma: GalleryPanel` 로 닫을 수 있다(사상은 조정자가 적는다).
- 새 토큰 · 새 의존성 없음.

## Rollback

레시피 · 문서 · manifest 항목 · 계약 · 기록 · 시험을 지우고 Figma `GalleryPanel` 을 지운다.
