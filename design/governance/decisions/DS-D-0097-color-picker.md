---
id: decision-color-picker
status: experimental
authority: normative
---

# DS-D-0097 색 하나를 채도 · 밝기 면, 색조 · 불투명도 띠, 헥스 입력, 페이지 색 격자로 고르는 판을 새 부품 `color-picker` 로 — 면은 Popover, 슬라이더의 변형이 아니다

- Status: accepted (소유자 지시로 초안의 기본값을 받는다, 2026-10-14)
- Date: 2026-10-14
- Owners: repository owner, design system maintainer
- Affects: `color-picker`, `color-swatch`, `menu-popover`, `slider`, `icon-button`, `canvas-section`, `decision-product-parts-become-louis`

## Context

[DS-D-0084](DS-D-0084-product-parts-become-louis.md) 승격 목록의 「큰 것(각각 Decision 먼저)」에 `color-picker` 가 있다(B2 #39 · #40). 제품의 색 고르기는
영상 편집기 인스펙터의 색 팝오버다(`components/scenes/create/node-canvas-v2/nodes/ColorPopover.tsx`, 통합 판 `54b62a8aa`, 호출부
`VideoEditModal.tsx:15399`). 채도 · 밝기 면(2차원) · 색조 띠 · 알파 띠 · 스포이드 · 헥스 · 알파 입력 · 「이 페이지에서」 색 격자가 한 판이고, 상수 열여덟으로 그린다
(`ColorPopover.tsx:243-404`). 트리거는 인스펙터 줄의 16 칩(`ColorSwatchButton`, `:29-89`)이다.

LOUIS 에 가장 가까운 것은 [Slider](../../components/slider.md)(막대 하나 · 채움 하나)와 [Color Swatch](../../components/color-swatch.md)(색 값 하나의 칩)다.
slider 는 2차원 면을 담지 못하고, 색 공간 그라디언트 · 체크무늬 · 「지금 색」으로 칠하는 손잡이는 어느 레시피에도 없다. 면(`.louis-popover`)은 제품도 이미 문다.

제품 값에 결함이 있다. 「이 페이지에서」 라벨 · 알파 `%` 가 `gray-500` 88% 로 글자 대비 미달(3.19 · 3.37, 입력 면 위 2.93 · 3.14), 색 칸 경계가 1.88 · 1.31 이라
흰 값 칸이 면에 녹고, 채도 · 밝기 표식의 바깥 헤어라인 32% 가 흰 바닥에서 2.23 이다. 면 · 색조 · 알파가 `role="slider"` + `tabIndex={0}` 인데 키 처리가 없어
포커스는 가는데 값이 안 바뀌고, 면은 밝기 하나만 보고한다. 대화에 이름이 없고 열어도 포커스가 옮지 않으며 트리거에 펼침 상태가 없다. 색 칸 이름이 CSS 문자열이고,
표식이 면 가장자리에서 잘리며(`overflow-hidden`), 흰 겹이 `#fafafa` 라 채도 0 · 밝기 1 이 FFFFFF 로 그려지지 않는다. 숫자 z-index(`z-[10300]`)가 있다.

## Decision

1. **새 컴포넌트 `color-picker` 하나**(CSS 레시피 · 문서 · Figma). `.louis-color-picker` · `__head` · `__area` · `__area-thumb` · `__channels` · `__channel` ·
   `__fields` · `__tool` · `__field` · `__input` · `__suffix` · `__label` · `__swatches` · `__option`. **면은 이 부품이 아니다** — `.louis-popover` 안의 내용이다.
2. **색 공간은 새 시맨틱 `color-spectrum-*` 여덟**(`red` · `yellow` · `green` · `cyan` · `blue` · `magenta` · `white` · `black`), 두 테마 같은 값. 원시는
   `primitive.color.pure.*` 여섯을 새로 두고(id `color-pure-*`), 흰 · 검정은 있는 `static.white` · `static.black` 을 가리킨다. 띠 · 면의 그라디언트는 `in srgb` 보간.
3. **색조 · 알파 띠는 네이티브 `<input type="range">`**(`__channel[data-channel="hue" | "alpha"]`), 띠 정지점을 손잡이 반지름만큼 당긴다. 2차원 면은
   `role="slider"` div 하나 + 두 축 방향키 + `aria-valuetext` 계약(키보드는 소비처).
4. **트리거는 `color-swatch` 의 변형** — 칩 아래 체크무늬, `<button>` 칩의 호버 테두리(`fg-tertiary`) · 누름 0.96. B2 의 `color-picker__swatch` 는 세우지 않는다.
5. **대비 미달 다섯을 고쳐 올린다** — 라벨 · `%` → `fg-tertiary`, 색 칸 경계 → `stroke-strong`, 표식 헤어라인 32 → 56%.
6. **스포이드 글리프는 `icon/eyedropper`**(Phosphor `eyedropper` regular)로 아이콘 파이프라인에 들인다.
7. React 표면 · 새 의존성 · 패키지 구조는 만들지 않는다. 숫자 z-index 없음 — 겹은 overlay branch 가 정한다.

### 소유자 판정 — 초안의 기본값으로 정했다

초안(`scratchpad/promote/big/color-picker.md`, 작업 폴더)이 남긴 판정 열둘을 소유자 지시로 초안이 권한 기본값으로 정했다. 뒤집으면 레시피 한 곳을 고친다.
**하나는 기본값을 그대로 받지 못했다** — 초안은 섹션 노드 프리셋 팔레트를 이 부품의 `data-variant="palette"` 로 접자고 했으나(초안 1′ · 판정 10), 초안을 쓴 뒤
[DS-D-0093](DS-D-0093-canvas-section.md) 판정 11 이 「팔레트는 canvas-section 의 짝 블록 — 색조는 이름 있는 선택지(토큰)이고 color-picker 의 격자는 값(데이터)」으로
먼저 정했다. 앞선 결정을 따른다 — 이 부품에 `palette` 변형 · 「없음」 칸 · `radiogroup` 은 없다.

| # | 판단 | 기본값 | 대안 |
| --- | --- | --- | --- |
| 1 | 부품의 자리 | 새 컴포넌트 `color-picker`(내용) + 면은 `.louis-popover`(menu-popover 「표면 공유」) | 면까지 소유하는 `color-picker` 팝오버 · slider 에 `hue` · `alpha` 변형을 열고 나머지를 조합(2차원 면 · 격자 · 입력을 담을 자리가 없다) |
| 2 | 트리거 칩 | `color-swatch` 의 변형(체크무늬 · 호버 · 누름) — 판정 바꿈 | B2 원안 `color-picker__swatch`(같은 칩이 두 부품에 산다) |
| 3 | 색 공간 색의 출처 | 새 시맨틱 `color-spectrum-*` 8(원시 6, 흰 · 검정은 있는 원시) — 원시 색 게이트를 통과하고 Figma 띠도 변수에 묶인다 | 흰 · 검정을 `media-scrim-*` 재사용(이름이 거짓말, 흰이 #fafafa) · `spectrum-red` 하나 + `in hsl longer hue`(CSS 와 Figma 가 다른 그림) |
| 4 | 면 크기 | 폭 채움 256 × 220 — 띠 · 입력과 오른쪽 끝이 맞는다. 보이는 변화: 면이 36 넓어진다 | 정사각 256 × 256 · 제품대로 220 × 220 왼쪽 붙음 |
| 5 | 색조 · 알파 띠 | 네이티브 range + 정지점을 손잡이 반지름만큼 당김. 대가: 양 끝 7 이 단색 | 제품대로 div `role="slider"`(키보드는 소비처) |
| 6 | 2차원 면 | `role="slider"` div 하나 + 두 축 방향키 + `aria-valuetext`(소비처 구현) | 숨긴 네이티브 range 둘(탭 정지 둘) |
| 7 | 체크무늬 | 테마 잉크 `gray-000-alpha-16` 사각 + 투명(새 토큰 없이 두 테마 바닥과 1.5~1.75) | 제품 값(다크 두 톤 차 1.08) · 두 테마 고정 밝은 체크(새 토큰 2) |
| 8 | 대비 미달 다섯 | 모두 고쳐 올린다(DS-D-0084 3항) | 제품 값 |
| 9 | 칸 호버 | 1.08 배 — canvas-section 팔레트 칸과 같은 반응, 반경 4 · 경계 `stroke-strong` | 제품대로 위로 1 들림 |
| 10 | 섹션 팔레트 | **이 부품에 두지 않는다**(DS-D-0093 판정 11) | 초안 기본값 `data-variant="palette"` — 앞선 결정과 충돌 |
| 11 | 스포이드 글리프 | Phosphor `eyedropper` 를 아이콘 파이프라인으로 들인다(`icon/eyedropper`) | 제품 인라인 SVG(획 3, 아이콘 계약 밖) |
| 12 | 면 kind · 입력 줄 치수 | `data-kind` 없는 `.louis-popover`(안쪽 6) + 판 256 · 입력 28 알약(`layout-inspector-control-height`). ARIA 는 composite-popover 계약 | `composite-popover`(안쪽 8 · 최소 240) + 판 252 · 입력 text-field sm 24 + icon-button sm 24 |

### 경계와 하지 않는 것

- 부품이 소유한다 — 판 폭 256 · 칸 사이 12, 머리(닫기 오른쪽), 면 256 × 220 · 반경 10 · 세 겹 · 표식, 띠 둘(12 알약 · 손잡이 14 · 사이 8), 입력 줄(28 알약 ·
  스포이드 28 · 알파 64 · 사이 6), 라벨 · 격자(28 칸 여섯 열 양 끝 정렬 · 체크무늬 · 지금 값 링), 줄인 모션, 강제 색.
- 놓이는 자리가 소유한다 — 면 · 반경 · 그림자 · 안쪽 6(`.louis-popover`), 위치 · 겹 순서(overlay).
- 소비처가 소유한다 — 색 변환(HSV · 헥스 · 알파), 면 끌기 · 두 축 키보드, 헥스 확정 · 되돌림, 스포이드(`EyeDropper` 가 있을 때만 그린다), 「이 페이지에서」 수집
  (중복 제거 · 최대 24), 열고 닫기 · 포커스 이동 · 복귀.
- 하지 않는 것 — 그라디언트 편집(정지점 여럿), 팔레트 저장 · 「최근 색」, 색 이름 검색, 대비 경고, 다른 색 공간(HSL · OKLCH) 입력, 스포이드 폴리필,
  면 · 띠의 관성, 색 변환 유틸 공용화, React 컴포넌트, 섹션 노드 팔레트(canvas-section).

## Consequences

- 새 토큰 여덟(시맨틱 `color-spectrum-*`)과 원시 여섯(`color-pure-*`)이 생성물 · 토큰 기준선 · Figma 변수(Klipse Primitive `pure/*` · Semantic Color
  `color/spectrum-*`)에 더해진다. 새 아이콘 `eyedropper` 하나.
- `color-swatch` 칩 아래 체크무늬가 깔린다 — 불투명 값은 그대로 보이고 반투명 값은 비친다. `<button>` 칩에 호버 테두리 · 누름이 생긴다.
- 제품 (나): `ColorPopover.tsx` 의 상수를 `louis-color-picker*` 클래스로, `--hue-color` · `--current-color` 를 루트 변수 다섯으로, 손 위치 · 창 전역 리스너 ·
  `createPortal` · `z-[10300]` 을 LOUIS overlay(대화 안 branch)로, 색조 · 알파 div 를 네이티브 range 로, 면에 키보드 · `aria-valuetext`, 칸 이름을 헥스 라벨로,
  트리거를 `.louis-color-swatch[data-size="sm"] > button` + `aria-haspopup="dialog"` · `aria-expanded`. 보이는 변화 — 면이 내용 폭을 채움, 라벨 · `%` · 칸 테두리가
  진해짐, 흰 겹이 FFFFFF, 닫기 글리프 12 → 16, 칸 호버가 들림 → 확대.
- Figma — `ColorPicker` · `ColorPickerOption` 세트(figma `partial` — 제품 렌더 대조 전).

## Rollback

`color-picker.css` · 문서 · manifest 세 자리 · Figma 세트 둘 · 기록 · parity 계약 · 되읽기 명세 · `color-swatch.css` 의 세 블록을 지운다. 토큰은 `color-spectrum-*`
여덟 · `color-pure-*` 여섯을 지우고 기준선 · Figma 변수를 되돌린다(다른 소비처가 없다). 아이콘 `eyedropper` 는 다른 소비처가 생기기 전이면 함께 지운다.
제품은 아직 이 클래스를 물지 않으므로 화면 변화가 없다.
