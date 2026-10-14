---
id: decision-property-stack
status: experimental
authority: normative
---

# DS-D-0114 라벨이 컨트롤 위에 쌓이는 편집 패널 묶음을 새 부품 `property-stack` 으로 — 칸은 Color Swatch stack, 슬라이더는 Slider, Inspector Row 의 변형이 아니다

- Status: accepted (소유자 지시로 초안의 기본값을 받는다, 2026-10-15)
- Date: 2026-10-15
- Owners: repository owner, design system maintainer
- Affects: `property-stack`, `color-swatch`, `slider`, `inspector-row`, `decision-product-parts-become-louis`

## Context

표면 원장의 `app/highlight/[projectId]/shorts/[shortId]/CaptionColorPanel.tsx` 의 `CaptionColorPanel` 이 `needed` 로 남았다. 하이라이트 숏츠 편집
모달의 오른쪽 패널에서 제목 · 부제목 · 자막 세 요소마다 글자 · 배경 · 박스 테두리 · 외곽선 색과 배경 여백을 고친다(통합 판 `54b62a8aa`).
구조는 묶음 라벨(caption medium `fg-tertiary`) 아래 요소마다 이름(caption `fg-primary`) · 라벨 위 색 칸 넷(줄바꿈 · 사이 12) · (배경이 있으면)
여백 슬라이더 줄(라벨 · Slider · 값)이다. 묶음 사이 10, 안쪽 위 8 · 좌우 12 · 아래 4.

칸 하나(라벨 위 30 칩 · 빈 칸 · 지우기)는 이미 [Color Swatch](../../components/color-swatch.md) `data-layout="stack"` 이고, 슬라이더는
[Slider](../../components/slider.md) md 다. [Inspector Row](../../components/inspector-row.md) 는 이 행을 일부러 받지 않았다 — 라벨이 컨트롤 **위**에
쌓이고 컨트롤이 색 칸이라 28 한 줄로 표현되지 않는다(그 문서 Known deviations 6). **남은 것은 묶음 · 줄 · 슬라이더 줄의 흐름이다.**

## Decision

1. **새 부품 `property-stack`**(`.louis-property-stack` · `__label` · `__group` · `__group-label` · `__fields` · `__slider-row` · `__slider-label` ·
   `__slider-value`). 이름은 자막 색이 아니라 모양(세로 속성 묶음)으로 짓는다 — 같은 편집 패널의 다른 묶음이 쓴다.
2. **칸은 Color Swatch stack, 슬라이더는 Slider md 그대로.** 레시피는 흐름만 갖는다.
3. **값** — 묶음 사이 12(`space-stack-md`, 제품 10 을 접음) · 안쪽 8 / 12 / 4 · 요소 안 4 · 칸 사이 12 · 슬라이더 줄 사이 8, 라벨 최소 28 · 값 최소 16.
4. 새 토큰 · 새 의존성 · React 표면 없음.

### 소유자 판정 — 초안의 기본값으로 정했다

| # | 판단 | 기본값 | 대안 |
| --- | --- | --- | --- |
| 1 | 자리 | 새 부품 `property-stack` | Inspector Row 에 세로 행 형태 + `Value=Swatch` 칸을 연다(inspector-row.md Known deviations 6 의 「별개의 결정」) |
| 2 | 묶음 사이 10 | 12 로 접는다 | 리터럴 10 |
| 3 | 슬라이더 줄 위 2(`pt-1`) | 요소 안 사이 4 에 접는다(없앤다) | 리터럴 2 |
| 4 | 칸 열 폭 44 | Color Swatch stack 이 이미 갖는다 | 묶음이 칸 폭을 정한다 |

## Consequences

- 제품 (나): 패널 루트 · 요소 · 칸 줄 · 슬라이더 줄의 유틸리티를 `louis-property-stack*` 로, `Swatch` 함수를 Color Swatch stack 마크업으로.
  보이는 변화 — 묶음 사이 10 → 12, 슬라이더 줄 위 2 가 없어진다.
- Figma 에 `PropertyStack`(요소 셋)과 `PropertyStackGroup`(BOOLEAN Slider)이 선다. 칸은 `ColorSwatch`(Layout=stack) 인스턴스다.

## Rollback

`property-stack.css` · 문서 · manifest 세 자리 · Figma 컴포넌트 둘 · 기록 · parity 계약을 지운다. 제품은 아직 이 클래스를 물지 않으므로 영향이 없다.
