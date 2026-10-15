---
id: decision-canvas-section
status: experimental
authority: normative
---

# DS-D-0093 노드 캔버스의 영역 프레임을 새 부품 `canvas-section` 으로 — Node Shell 의 변형이 아니고 Color Swatch 의 고르기가 아니다

- Status: accepted (소유자 지시로 초안의 기본값을 받는다, 2026-10-14)
- Date: 2026-10-14
- Owners: repository owner, design system maintainer
- Affects: `canvas-section`, `transform-frame`, `node-chrome-button`, `menu-popover`, `node-shell`, `color-swatch`, `decision-product-parts-become-louis`

## Context

[DS-D-0084](DS-D-0084-product-parts-become-louis.md) 승격 목록의 「큰 것(각각 Decision 먼저)」에 `canvas-section` 이 있다. 노드 캔버스에는 노드가 아닌
「영역」이 하나 있다 — 노드들을 감싸는 배경 프레임이고(`components/scenes/create/node-canvas-v2/nodes/SectionNode.tsx:185-192`, 통합 판 `54b62a8aa`), 이름은
프레임 바깥 위에 얹히며 색조를 고를 수 있다. 섹션을 옮기면 캔버스가 안의 노드를 함께 옮긴다.

LOUIS 에 이 조형(반투명 면 · 안쪽 경계 · 바깥 위 제목 · 색조)을 가진 부품이 없다. [Node Shell](../../components/node-shell.md) 은 400 폭 · 반경 24 ·
2px 테두리 · 카드 위 헤더의 계약이 한 줄도 맞지 않아 이 칸을 스스로 뺐고(「`section` 은 카드가 아니다」), [Color Swatch](../../components/color-swatch.md)
는 「팔레트에서 미리 정한 색 중 하나를 고르는 것」을 범위 밖으로 둔다. 제품 소비처는 캔버스 노드 하나와 보관함 썸네일 재현 하나다
(`components/scenes/create/node-canvas-v2/lib/archiveThumbnail/drawNodes.ts:1714-1788`).

제품 값에 결함이 다섯 있다 — 쉼 경계 1px 12% 가 캔버스 대비 라이트 1.38 · 다크 1.47, 색 버튼 견본 테두리 40% 가 라이트 2.74, 팔레트 칸 테두리 12% 가
메뉴 면 대비 1.32 · 1.42(16% 칸 자체는 면에서 1.10~1.39), 팔레트 칸의 접근 이름이 `rgba(239, 68, 68, 0.16)` 문자열, 긴 섹션 이름이 도움말 · 삭제 버튼을
덮는다(제목 바와 액션이 각자 `absolute`).

## Decision

1. **새 부품 `canvas-section` 한 벌**(`.louis-canvas-section` · `__edge` · `__header` · `__title-bar` · `__title` · `__title-input` · `__color-button` ·
   `__color-swatch` · `__actions` · `__palette` · `__tint-option`). 축은 루트 `data-tint` · `data-selected` 와 칸 `data-tint` · `aria-checked` 다.
2. **있는 부품 셋을 그대로 받는다** — 크기 조절의 선 · 모서리 손잡이는 [Transform Frame](../../components/transform-frame.md) `Handles=corners`(섹션 리사이즈가
   그 조형의 다섯째 사본이다), 도움말 · 삭제는 [Node Chrome Button](../../components/node-chrome-button.md), 팔레트의 면은 Popover
   (`data-louis-scope="canvas"`). canvas-section 이 새로 소유하는 것은 프레임 · 제목 머리 · 색 버튼 · 팔레트 격자와 칸 · 변 끌기 띠다.
3. **크기 · 자리 · 층 · 소속은 데이터다.** 폭 · 높이는 루트 인라인, 섹션이 다른 노드 뒤에 깔리는 것은 캔버스의 노드 순서(제품 `zIndex: -1001`)가 정한다.
   숫자 z-index 를 두지 않는다.
4. **색조는 LOUIS 원시에 있는 여섯** — 새 시맨틱 `color-canvas-section-tint-red` · `-yellow` · `-green` · `-blue` · `-violet` · `-pink`(두 모드 같은 `*-500`).
   16% 는 레시피의 `color-mix` 가 만든다. 노드 액센트(`node-*-accent`)와 원시가 우연히 같지만 재사용하지 않는다 — 뜻이 다르다.
5. **고쳐 올리는 값 다섯**(DS-D-0084 3항) — 쉼 경계 `gray-000-alpha-40`, 견본 · 칸 테두리 `stroke-strong`, 칸 접근 이름은 색 이름, 제목 머리는 한 줄
   (긴 이름이 액션 앞에서 말줄임), 이름 바꾸기는 키보드로도.
6. **React 표면은 만들지 않는다.** 마크업 계약을 문서가 소유한다. 새 의존성 · 패키지 구조 없음.

### 소유자 판정 — 초안의 기본값으로 정했다

초안(`scratchpad/promote/big/canvas-section.md`, 작업 폴더)이 남긴 판정 열하나를 소유자 지시로 초안이 권한 기본값으로 정했다. 뒤집으면 레시피 한 곳을 고친다.

| # | 판단 | 기본값 | 대안 |
| --- | --- | --- | --- |
| 1 | 색조 벌 | LOUIS 원시에 있는 여섯(빨강 · 노랑 · 초록 · 파랑 · 보라 · 분홍) + 없음 — 16% 에서 제품 열셋은 서로 거의 구별되지 않고(캔버스 대비 1.09~1.35), 일곱 칸이 격자 한 줄에 맞는다 | 제품 열셋 유지(원시 색상 일곱 신설) · 색조는 데이터(레시피는 16% 만) |
| 2 | 문서 저장 형식 | 색조 이름(`"blue"`)을 저장, 옛 rgba 는 읽을 때 가장 가까운 색상으로 | rgba 문자열 저장 + 레시피 쪽 rgba → 이름 표 |
| 3 | 쉼 경계(라이트 1.38 · 다크 1.47) | `gray-000-alpha-40` 으로 고쳐 올림(3.03 · 4.02) — 범위가 곧 소속이라 경계가 식별에 필요하다 | 제품 12% + Known deviation |
| 4 | 크기 조절 크롬 | Transform Frame `Handles=corners`(12 원) + `__edge` 띠 16 | 제품 8 정사각 · 반경 2 · 그림자를 canvas-section 이 소유 |
| 5 | 팔레트 의미 | `radiogroup` + `radio` + 색 이름 + 화살표 키 — 하나만 고르고 다시 눌러도 풀리지 않는다 | 제품 `group` + `aria-pressed`, 이름만 고침 |
| 6 | 팔레트 자리 | 오버레이 층에 띄운다(레시피는 자리를 갖지 않는다) — 섹션 쌓임 맥락(-1001) 안이면 섹션 안 노드 밑에 깔린다(코드로 추론) | 제품처럼 섹션 안 `absolute` |
| 7 | 제목 머리 배치 | `__header` 한 줄 — 긴 이름이 액션 앞에서 말줄임 | 제품처럼 바 · 액션이 각자 `absolute`(겹친다) |
| 8 | 이름 바꾸기 진입 | 제목을 `<button>` — 더블클릭 + Enter · F2(2.1.1) | 제품 `span` 더블클릭만 |
| 9 | 액션 잉크 | Node Chrome Button 기본 `fg-secondary`(8.67 · 7.93) — 덮기 하나가 사라진다 | 제품 72% 덮기(8.77 · 9.60) |
| 10 | 견본 · 칸 경계 | `stroke-strong`(견본 3.48 · 3.39 · 칸 4.62 · 3.74) — `color-swatch` 와 같은 판단 | 제품 40% · 12% |
| 11 | color-picker 와의 관계 | 팔레트는 canvas-section 의 짝 블록 — 색조는 이름 있는 선택지(토큰)이고 color-picker 의 격자는 값(데이터)이다 | color-picker 가 서면 그 격자로 옮긴다 |

### 경계와 하지 않는 것

- 부품이 소유한다 — 프레임의 면 · 반경 16 · 안쪽 경계(쉼 1 · 선택 2), 색조 여섯과 16%, 변 끌기 띠 16 의 자리 · 커서, Transform Frame 을 프레임에 채우는 규칙,
  제목 머리 한 줄(프레임 위 6)과 제목 바(여백 2 · 6 · 2 · 8 · 반경 8 · 면 8% · 글 72%), 이름 입력(80 ~ 240), 색 버튼 20 · 견본 12, 팔레트 격자(7 × 20 · 사이 6)와 칸
  (쉼 · 고름 · 없음 빗금).
- 화면이 소유한다 — 크기 · 자리 · 층, 소속 계산(`lib/sectionMembership.ts`), 끌기 · 크기 조절의 포인터 수학, 이름 바꾸기 진입 · 확정 · 취소, 팔레트 열고 닫기와
  오버레이 자리, 화살표 키 이동, 저장 형식.
- 하지 않는 것 — 원시 색 신설(주황 · 호박 · 라임 · 청록 · 하늘 · 남색 · 자주), 숫자 z-index, 섹션 크기 조절의 키보드 대안(2.5.7 — 캔버스 노드 전체의 빚),
  color-picker 와의 합치기, React 표면.

## Consequences

- 새 토큰 여섯(시맨틱 색, 원시 0) — `color-canvas-section-tint-red` · `-yellow` · `-green` · `-blue` · `-violet` · `-pink`. 장식 면이라 `contrastPairs` 는 없다 —
  섹션의 범위는 경계(40%)가 말한다.
- 제품 (나): `SECTION` · `SECTION_RING*` → `louis-canvas-section` + `data-selected` · `data-tint`, 프리셋 열셋 → 이름 여섯(옛 rgba 는 읽을 때 변환),
  `NodeResizer` 의 보이는 선 · 손잡이 → Transform Frame, 바 · 액션 → `__header` 한 줄, 팔레트 → 오버레이 층 + `radiogroup`, 이름 바꾸기에 Enter · F2,
  썸네일 재현(`drawNodes.ts`)의 리터럴을 토큰 표에서. 보이는 변화 — 쉼 경계가 또렷한 회색 선, 모서리 손잡이가 8 정사각 → 12 원, 저장된 주황 · 라임 등은
  가까운 색, 다크 액션 잉크가 한 단 옅게.
- Figma 에 `CanvasSection`(Selected) · `CanvasSectionTitleBar`(State) · `CanvasSectionColorButton`(State × Placeholder) · `CanvasSectionTintOption`(Selected) 세트와
  `CanvasSectionPalette` 가 서고, 변수 `color/canvas-section-tint-*` 여섯이 선다(Semantic Color Light · Dark).

## Rollback

`canvas-section.css` · 문서 · manifest 세 자리 · 토큰 여섯 · Figma 세트 · 변수 · 기록 · parity 계약을 지운다. 제품은 아직 이 클래스를 물지 않으므로 화면
변화가 없다.
