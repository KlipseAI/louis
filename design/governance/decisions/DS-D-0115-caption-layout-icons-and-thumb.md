---
id: decision-caption-layout-icons-and-thumb
status: experimental
authority: normative
---

# DS-D-0115 숏츠 편집의 자막 레이아웃 칩은 아이콘 `caption-layout-*` 일곱, 템플릿 썸네일은 새 부품 `caption-thumb`

- Status: accepted (소유자 지시로 초안의 기본값을 받는다, 2026-10-15)
- Date: 2026-10-15
- Owners: repository owner, design system maintainer
- Affects: `caption-thumb`, `foundations-iconography`, `decision-product-parts-become-louis`

## Context

하이라이트 숏츠 편집 화면(`app/highlight/[projectId]/shorts/[shortId]/page.tsx`, 통합 판 `54b62a8aa`)의 템플릿 탭에 그림 둘이 있고, 표면 원장에서
둘 다 `needed` 다.

- **`LayoutThumb`** — 자막 레이아웃 프리셋(`CAPTION_LAYOUT_IDS` 일곱: standard · essay · news · bubble · cinematic · impact · lecture)을 18 × 32 세로
  프레임(테두리 `gray-000` 24% · 반경 3) 안의 막대(currentColor 75%, 높이 2 또는 비율)로 보여 주는 글리프다(`LAYOUT_THUMB_SPECS`). 원장은 「컴포넌트가 아니라
  DS·Icons 축」으로 저울을 기울였다 — 고정된 목록마다 한 벌이고 currentColor 를 따른다.
- **`TemplateThumb`** — 템플릿 행 앞의 27 × 48 썸네일. 레터박스 색 위에 원본 비율을 fit 으로 넣은 회색 영상 자리, 그 위에 제목 · 부제목 · 자막 막대 셋
  (높이 3 · 2 · 3, 박스 배경이 있으면 +2, 색은 배경 ?? 글자색)이다. 원장은 소비처 1 · oneoff 로 적었지만 [DS-D-0084](DS-D-0084-product-parts-become-louis.md)
  「작은 새 부품」 판단 2(소비처 수는 승격 조건이 아니다)가 그 저울을 넘는다.

아이콘 요소에 알파 16단 투명도가 2026-10-14 에 열렸다(iconography, `highlight` 선례).

## Decision

1. **아이콘 일곱 `caption-layout-{standard,essay,news,bubble,cinematic,impact,lecture}`** — 24 격자 · 선 1.5. 프레임은 중심선 6.75 · 2.25 · 10.5 × 19.5 ·
   반경 1.5 의 사각에 `opacity="0.4"`(제품 24% 를 1.5 획에서 읽히게 사다리 한 칸 올림), 막대는 선 1.5 · 둥근 끝(제품 75% 를 1 로 — 프레임과의 농담 차이를
   유지), impact 의 굵은 막대는 채운 사각. 막대 위치는 제품 비율을 안쪽 9 × 18 상자에 옮기고, 선끼리 붙지 않게 중심 사이 2.25 이상을 둔다(news).
   출처 `original`. Figma `DS · Icons` 에 `icon/caption-layout-*`(벡터 · `color/fg-primary` 획 · 레이어 불투명도).
2. **새 부품 `caption-thumb`**(`.louis-caption-thumb` · `__video` · `__line`) — 프레임 27 × 48 · 반경 4 · 헤어라인, 줄 높이 제목 3 · 부제목 2 · 자막 3(박스면 +2) ·
   반경 1. 레터박스 · 영상 자리 · 줄 위치 · 색은 소비처가 지역 변수(`--louis-caption-thumb-*`)로 준다 — 콘텐츠 그림이라 테마를 따르지 않는다.
3. **새 시맨틱 하나 `color-caption-thumb-video`** — 두 테마 `palette-gray-600`(제품 `bg-palette-gray-600`). 컴포넌트 CSS 는 원시를 쓰지 않는다.
4. React 표면 · 새 의존성 없음.

### 소유자 판정 — 초안의 기본값으로 정했다

| # | 판단 | 기본값 | 대안 |
| --- | --- | --- | --- |
| 1 | LayoutThumb 의 자리 | 아이콘 일곱(원장의 저울) | 컴포넌트 `caption-layout-thumb`(Layout 축 일곱) |
| 2 | 아이콘 농담 | 프레임 0.4 · 막대 1 | 제품 비율 그대로(0.24 · 0.72 — 24 크기에서 프레임이 사라진다) |
| 3 | news 막대 간격 | 중심 사이 2.25 이상으로 벌린다 | 제품 비율 그대로(세 줄이 한 덩이) |
| 4 | TemplateThumb 의 자리 | 새 부품 `caption-thumb`(소비처 1 이어도) | 원장의 oneoff — 보드에 시드 값으로 그 자리에 그린다 |
| 5 | 영상 자리 색 | 새 시맨틱 `caption-thumb-video`(gray-600 두 테마) | `asset-tile-well`(값은 같지만 뜻이 다르다) |

## Consequences

- 아이콘 74 → 81. 제품 (나): `LayoutThumb` 을 `<CaptionLayoutStandardIcon />` 등으로, `TemplateThumb` 의 인라인 스타일을 `louis-caption-thumb*` 와 지역
  변수로. 보이는 변화 — 레이아웃 칩 글리프가 24 격자 선 아이콘으로 바뀐다(프레임 3:5.6 → 12:21, 막대가 둥근 끝).
- Figma 에 아이콘 일곱 · `CaptionThumb` · 변수 `color/caption-thumb-video` 가 선다.

## Rollback

아이콘 SVG 일곱 · provenance · keywords 줄과 생성물, `caption-thumb.css` · 토큰 하나 · 문서 · manifest 세 자리 · Figma 아이콘 · 컴포넌트 · 변수 · 기록 ·
parity 계약을 지운다. 제품은 아직 어느 것도 물지 않으므로 영향이 없다.
