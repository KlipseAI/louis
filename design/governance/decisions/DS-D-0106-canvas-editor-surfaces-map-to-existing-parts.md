---
id: decision-canvas-editor-surfaces-map-to-existing-parts
status: experimental
authority: normative
---

# DS-D-0106 캔버스 · 편집기 표면 셋은 새 부품이 아니다 — 효과 절 머리는 Inspector Section Head, 스티커 캔버스는 Transform Frame, 캔버스 FAB 는 죽은 코드

- Status: accepted (소유자 지시로 초안의 기본값을 받는다, 2026-10-15)
- Date: 2026-10-15
- Owners: repository owner, design system maintainer
- Affects: `inspector-section-head`, `menu-popover`, `transform-frame`, `icon-button`, `decision-product-parts-become-louis`

## Context

원장(`migration/product.surfaces.json`, 통합 판 `54b62a8aa`)에 `needed` 로 남은 캔버스 · 편집기 표면 일곱 가운데 셋은 새 조형을 갖지 않는다.
[DS-D-0084](DS-D-0084-product-parts-become-louis.md) 는 「제품에 보이는 모든 것을 LOUIS 부품으로」이고 있는 부품을 넓히는 쪽을 먼저 본다. 셋을 소스로
다시 읽었다.

1. `components/scenes/create/node-canvas-v2/nodes/videoEditParts/effectsTabRow.tsx#VideoEditEffectsTabRow` — 원장 사유는 「행 안에서 펼쳐지는 선택」이라는
   새 문법이었다. 소스에는 그 문법이 없다. 머리는 이미 `InspectorSectionHead`(`:212-214`, 원장 `figma: InspectorSectionHead`), 트리거는
   `InspectorSectionAction`(원장 `figma: IconButton`, size sm), 메뉴는 `louis-popover` + `louis-menu__item`(`:63-70` · `:91`)을 그대로 문다. 파일이 자기 것으로
   갖는 것은 rAF 펼침 애니와 포털 좌표 · 형제 드롭다운 상호 배제 배선뿐이다.
2. `…/nodes/imageEditParts/StickerCanvas.tsx#StickerCanvas` — 스티커 상자의 선택 틀 · 손잡이 여덟 · 모서리 바깥 회전 띠는 이미
   [Transform Frame](../../components/transform-frame.md) 이 이 파일을 정본으로 인용해 소유한다(`__rotate-zone`, `StickerCanvas.tsx@54b62a8a:95-106`). 남는 것은
   우물(`WELL`, 프레임을 가운데 두는 어두운 바닥 · 여백 12)과 프레임 그림자인데, 그것은 같은 모달의 크롭 탭이 쓰는 작업 영역과 같은 자리다 —
   크롭 모달 셋(`CropModalInner` · `ClipCropModal` · 미리보기 오버레이)이 이미 `figma: TransformFrame` 으로 닫혔다.
3. `…/components/ActionButton.tsx#ActionButton` — 44 원형 FAB. 앵커 전체에서 이 이름을 import 하거나 렌더하는 곳이 0이다(자기 파일 · 무관한 주석
   `ImageLightbox.tsx:44` · lint 기준선뿐). 파일 머리 주석이 스스로 「`NodeCanvasV2.module.css` 이식 · 공유 파일은 남는다」라 적은 이식 잔재다.

## Decision

1. **효과 절 머리 → Figma `InspectorSectionHead`(`Action=Icon`).** 열린 메뉴는 `MenuPanel` + `Menu` 항목 둘(페이드 인 · 페이드 아웃)이다. 새 Figma 세트를
   세우지 않는다. rAF 펼침 · 상호 배제는 Menu 정본(overlay Provider)으로 수렴할 **코드 부채**로 남긴다.
2. **스티커 캔버스 → Figma `TransformFrame`(`Handles=corners-and-edges`).** 제품 손잡이(10 · 반경 4 · 1.5 링)는 LOUIS 12 원 · 1 링으로 접혀 있다(DS-D-0062) —
   제품이 레시피를 물 때 함께 바뀐다. 우물은 Dialog `workbench` 회차(transform-frame.md Known deviations 8)가 정한다.
3. **캔버스 FAB 는 사상하지 않는다 — `scoped` 를 권한다.** 소비처 0 인 죽은 코드라 「제품에 보이는 것」이 아니다. IconButton 에 `circle` 모양 · 떠 있는
   그림자 변형을 더하자는 원장 사유는 살아 있는 표면을 전제했는데 그 전제가 틀렸다. 제품에서 파일을 지우는 것이 맞다(제품 저장소 몫).

### 소유자 판정 — 초안의 기본값으로 정했다

| # | 판단 | 기본값 | 대안 |
| --- | --- | --- | --- |
| 1 | 효과 절 머리 | `InspectorSectionHead` 로 사상, 새 세트 없음 | 「행 안 펼침」 전용 세트 신설 |
| 2 | 스티커 캔버스 | `TransformFrame` 으로 사상, 손잡이는 LOUIS 값 | 스티커 전용 손잡이(10 · 반경 4) 변형 |
| 3 | 캔버스 FAB | 죽은 코드 — `scoped` 권고, 제품에서 삭제 | IconButton `Shape=circle` + elevated 변형 신설 |

## Consequences

- 원장의 세 표면을 조정자가 `figma: InspectorSectionHead` · `figma: TransformFrame` · `scoped` 로 옮길 수 있다.
- 새 토큰 · 새 Figma 세트 · 새 레시피 없음.

## Rollback

원장 판정을 `needed` 로 되돌린다. 이 결정은 저장소 파일을 바꾸지 않는다.
