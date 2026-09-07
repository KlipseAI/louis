---
id: decision-transform-frame-is-one-set
status: experimental
authority: normative
---

# DS-D-0060 크롭 창과 선택 상자는 한 벌이다 — 손잡이 위치는 축이 아니다

- Status: accepted (LOUIS · Figma · 계약 2026-09-07, 제품 채택은 미착수)
- Date: 2026-09-07
- Owners: design system maintainer
- Affects: `component-transform-frame`, `decision-product-surface-denominator`,
  `governance-figma-component-authoring`

## Context

제품 표면 원장의 `needed` 넷이 같은 조형을 그린다. 앵커 `5a67d692` 에서 넷을 다 읽었다.

| 자리 | 프레임 | 모서리 손잡이 | 변 손잡이 | 삼분할 | 바깥 스크림 |
| --- | --- | --- | --- | --- | --- |
| create/node-canvas-v2/nodes/CropModal.tsx 의 CropModalInner | 1px 점선(행진하는 개미) | 12×12 정사각 | 12×12 정사각 | 선택 | 마스크 |
| create/ImageCropModal.tsx 의 ImageCropModal | 위와 같음 | 위와 같음 | 위와 같음 | 없음 | 마스크 |
| …/videoEditParts/ClipCropModal.tsx | 1.5px + 바깥 1px 링 | 24×24 브래킷(두 변만) | 36×12 알약 | 항상 | 있음 |
| …/videoEditParts/PreviewOverlayLayer.tsx | 2px 링 | 10×10 정사각 | 10×10 정사각 | 없음 | 없음 |

앞의 둘은 같은 값이다 — **둘 다 `react-image-crop` 의 기본 크롬**이고
(`--rc-drag-handle-size: 12px` · `--rc-drag-bar-size: 6px` · marching-ants 테두리), 제품이 고른
것은 그 위에 얹은 색 변수 셋뿐이다. 그러므로 서로 다른 규범은 **셋**이다.

Figma 51종에 **변형 핸들이라는 부류가 아예 없다.** 넷째가 아니라 다섯째가 생기기 전에 하나로
모은다.

### 손잡이 위치는 축인가 슬롯인가 — 먼저 답해야 하는 질문

브리프가 이것을 먼저 판정하라고 했다. 답은 **어느 쪽도 아니다: 위치는 좌표이고, 축은 「어느
벌을 내놓는가」 하나다.**

- **위치는 축이 아니다.** 여덟 자리(nw·n·ne·e·se·s·sw·w)를 축으로 열면 한 프레임이 손잡이
  하나만 갖는다는 뜻이 되는데, 실제로는 넷 또는 여덟이 **동시에** 선다. 제품도 그렇게 적는다 —
  PreviewOverlayLayer 는 위치 배열을 `map` 으로 돌리고, ClipCropModal 은 위치별 클래스 표
  하나를 갖는다.
- **위치는 불리언 슬롯도 아니다.** 슬롯으로 열면 여덟 개의 BOOLEAN 이 생기고 실현되는 조합은
  둘뿐이다. §3 이 BOOLEAN 을 「있고 없고」에 쓰라고 한 것은 **서로 독립일 때**의 이야기다.
- **갈리는 것은 벌이다.** 넷(모서리만) 또는 여덟(모서리 + 변). 그것이 축이다.

### 비율 잠금은 별도 축이 아니다 — 실측이 그렇게 말한다

브리프의 초안은 `Handles` 와 `Ratio` 두 축을 제안했다. **제품 두 구현이 이미 두 축을 하나로
묶어 두었다.**

- `ClipCropModal` — 비율 프리셋이 잠기면 변 손잡이에 `CROP_HANDLE_DISABLED`(`opacity-0` +
  `pointer-events-none`)가 걸린다. 파일의 주석이 사유까지 적는다: 「변 단독 드래그는 비율을
  지키려면 가로·세로가 함께 바뀌어야 해 "한쪽만 줄인 게 아니라 반대쪽도 줄어든다"는 혼란을
  준다」.
- `react-image-crop` — `.ReactCrop--fixed-aspect` 에서 `ord-n`·`ord-e`·`ord-s`·`ord-w` 를
  `display: none` 으로 내린다.

두 축을 다 열면 `Ratio=Free · Handles=corners` 와 `Ratio=Locked · Handles=corners-and-edges`
라는 **실현되지 않는 칸이 둘** 생긴다. DS-D-0041 이 「축을 여는 것과 조합을 채우는 것은
별개다」를 적었는데, 여기서는 애초에 축이 하나다.

## Decision

1. **크롭 창과 선택 상자를 한 컴포넌트로 세운다.** 이름은 `TransformFrame` /
   `.louis-transform-frame` 이다.
2. **축은 `Handles` 하나다. 값은 `corners` · `corners-and-edges` 둘이다.**
   비율 잠금은 이 축의 **원인**이지 별도 축이 아니다.
3. **삼분할 안내선은 BOOLEAN 슬롯 `Grid` 다.** 크롭 창은 그리고 선택 상자는 그리지 않는데,
   그것이 기하를 바꾸지 않기 때문이다.
4. **없는 손잡이는 숨기지 않고 그리지 않는다.** 마크업에서 렌더하지 않고, Figma 변형에서
   노드를 지운다.
5. **바깥 스크림은 이 컴포넌트가 소유하지 않는다.** 소비처가 켜는 선언 하나로만 제공한다.

### 4 를 규칙으로 못 박는 이유

Figma 의 불리언은 **component set 단위**다. 한 변형에서 슬롯을 `visible=false` 로 눌러 「이
변형에는 그 자리가 없다」를 표현하면 **다른 변형의 그 슬롯까지 사라진다.** 「이 변형에는 없다」는
가시성이 아니라 구조이므로 노드를 지운다. 코드 쪽에도 같은 값이 있다 — 숨긴 손잡이는 잡히지
않은 채 접근성 트리에 남는다.

### 셋 중 무엇을 정본으로 삼았는가 — 값마다 따로 정했다

**`react-image-crop` 의 값은 규범이 아니다.** 12px 정사각도 행진하는 개미 테두리도 우리가 고른
적이 없는 남의 기본값이고, 제품은 그 위에 색 변수 셋만 덮었다. 그러므로 「제품 실측 셋」이
아니라 **「우리가 고른 실측 둘 + 참고 하나」**로 읽는다.

| 값 | 채택 | 사유 |
| --- | --- | --- |
| 프레임 두께 2 | PreviewOverlayLayer | 1.5 는 이 시스템의 두께 계단에 없다. `border-width-ring` 은 「지금 이것이 선택돼 있다」를 그리는 토큰이고 이 프레임이 하는 말이 정확히 그것이다 |
| 프레임 곡률 0 | 둘 다 | PreviewOverlayLayer 는 선택되는 순간 4 를 0 으로 편다. 곡률은 잘려 나갈 픽셀의 경계를 거짓말한다 |
| 손잡이 12 | ClipCropModal(변) + react-image-crop | 셋 중 둘이 12 다. 10 은 2px 격자 위에 있지 않다 |
| 변 손잡이 36×12 | ClipCropModal | 유일한 실측이다. 다른 둘은 변에도 정사각을 놓아 「무엇이 한 축만 움직이는가」를 모양으로 말하지 않는다 |
| 삼분할 선 1 | ClipCropModal | `border-width-default` 와 같다 |
| 손잡이 면 = 흰 면 + 액센트 링 | ClipCropModal(변) | 어떤 사진 위에서도 자기 대비를 갖는 유일한 벌이다. 채운 정사각 둘은 각자 반대색 1px 테두리를 덧대야 살아남았다 |

**24×24 브래킷(모서리 두 변만 그린 ㄱ자)은 버렸다.** 사유가 둘이다.

1. **기록할 수 없다.** Figma 에서 두 변만 그리려면 변마다 다른 stroke 두께를 줘야 하고, 그러면
   `node.strokeWeight` 가 `figma.mixed` 로 떨어져 되읽기가 두께를 **아무 값도 담지 못한다**.
   계약 밖의 값이 되는 것이고, 이 저장소가 반복해서 만난 「초록인데 재고 있지 않은」 자리다.
2. **선택 상자에서는 성립하지 않는다.** 브래킷은 뒤에 매체가 있을 때만 읽힌다. 같은 손잡이가
   매체 없는 오버레이 선택에도 서야 하므로 자기 면을 가져야 한다.

## Alternatives

- **`Mode = crop | select` 축을 연다.** 제품의 두 직업(자를 곳을 고른다 · 고른 것을 표시한다)이
  실제로 다른 크롬을 쓰므로 픽셀은 맞는다. **버리는 이유는 이 작업의 목적 자체다** — 셋으로
  갈린 규범을 둘로 줄이는 것은 수렴이 아니라 정리다. 두 직업이 실제로 요구하는 차이는
  삼분할 선과 스크림 둘뿐이고, 둘 다 기하를 바꾸지 않아 슬롯으로 충분하다.
- **`Handles` 에 `sides` 값을 더한다.** 배경 없는 자동맞춤 텍스트 오버레이는 좌우 둘만 내놓는다
  (`["w","e"]`). **버리는 이유는 그것이 손잡이 벌이 아니라 잠긴 축이기 때문이다** — 세로 크기가
  내용에서 계산되므로 세로 손잡이가 거짓말이 된다. 「어느 축이 잠겼는가」는 이 축과 직교하고,
  실재하는 자리가 하나뿐이라 값을 지어내지 않고 미결로 남긴다(아래 「닫지 않은 것」).
- **크롭 모달을 Dialog 의 `workbench` size 로 함께 세운다.** 브리프의 초안이 제안했다.
  **버리는 이유는 값이 없기 때문이다** — 세 모달의 폭이 720 · 760 · 720 이고 곡률이 16 · 16 · 10
  이며 높이 상한이 900 · 560 · 60vh 다. 셋이 수렴하지 않은 채 하나를 고르면 그것은 실측이
  아니라 지어낸 값이 된다. Dialog 의 계약이 높이를 아예 두지 않는다는 사실도 같은 방향이다.
  **이 프레임은 Dialog 없이도 선다** — PreviewOverlayLayer 가 그 증거다.

## Consequences

- Figma component set 이 52 → 53. `TransformFrame` 2 변형 + `Grid` BOOLEAN.
- `figma/components.measured.json` 에 `transform-frame` 이 서고 size 키가 축의 두 값이다.
- **원장의 넷은 그대로 `needed` 다.** 제품이 아직 이 레시피를 물지 않는다 — 값의 출처는
  제품이지만 대응은 제품이 클래스를 바꿔 물 때 선다. DS-D-0043 이 「보드에 인스턴스를 놓는
  자리는 제품이 무는 클래스가 정한다」를 적은 그대로다.
- 삼분할 선 색이 24% 에서 28% 로 **한 단 올라간다.** LOUIS 에 24% 짜리 매체 위 표식 토큰이
  없고, 만들면 배너 인디케이터가 이미 쓰는 값 옆에 두 번째 「매체 위 흐린 표식」이 생긴다.
  이것은 대비를 위한 변경이 아니라 토큰 하나를 아끼는 판정이다.

## Rollout and verification

세 곳이 같은 작업에 들어갔다(DS-D-0028).

1. **LOUIS** — packages/css/src/component/transform-frame.css 에 `.louis-transform-frame` 과
   `__grid` · `__grid-line` · `__handle`. React 표면은 없다(alert · switch · tabs 와 같은 형태).
2. **Figma** — `DS · Components` 페이지에 `TransformFrame` component set(node `1362:1297`),
   변형 둘(`1362:1273` · `1362:1283`), `Grid` BOOLEAN(`Grid#1362:0`). 색은 전부 변수에 묶었고
   되읽기가 `rawFills` 0 · `rawStrokes` 0 을 확인한다.
3. **계약** — `verify-figma-parity` 의 COMPONENT_CONTRACTS 에 `TransformFrame`,
   `figma-readback-emit` 의 CAPTURE 에 채취 명세, packages/react/test 에 되재기 브라우저
   테스트. DS-D-0035 (a)(b)(c) 를 만족하므로 manifest 의 `figma` 는 `done` 이다.

### 이 결정이 닫지 않은 것

- **제품 채택.** 네 자리를 이 레시피로 옮기는 일은 제품 픽셀을 움직일 수 있는 사람의 몫이다.
  옮길 diff 는 이 회차의 인계 문서가 갖는다.
- **잠긴 축(`["w","e"]` 두 손잡이).** 실재하는 자리가 하나뿐이라 값을 지어내지 않았다.
  두 번째 자리가 생기면 `LockedAxis` 같은 이름으로 열 후보다.
- **작업 영역이 있는 모달(Dialog `workbench`).** 위 Alternatives 의 사유대로 값을 먼저 모아야
  한다.
- **모바일 손잡이.** `react-image-crop` 은 `pointer: coarse` 에서 손잡이를 24 로 키우고 변
  손잡이를 없앤다. 그 분기는 이 레시피에 없다 — 제품의 다른 셋에도 없어 대조할 실측이 하나뿐이다.
