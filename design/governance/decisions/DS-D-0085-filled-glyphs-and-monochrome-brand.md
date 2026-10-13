---
id: decision-filled-glyphs-and-monochrome-brand
status: experimental
authority: normative
---

# DS-D-0085 채운 글리프와 한 색 브랜드 로고를 아이콘 세트에 받는다

- Status: accepted (소유자, 2026-10-13 — 한 색 브랜드 로고만 받는다)
- Date: 2026-10-13
- Owners: repository owner, design system maintainer
- Affects: `foundation-iconography`, `decision-icon-source`, `decision-product-parts-become-louis`

## Context

[DS-D-0084](DS-D-0084-product-parts-become-louis.md) 로 제품에 보이는 부품을 LOUIS 로 올리면서 아이콘 23개가 필요해졌다 — 노드 캔버스의
생성 버튼 별 · 오디오 재생 · 일시정지(채운 도형), 채널 줄의 YouTube · Instagram, 편집 노드 · 빈 영상 칸 글리프, 모바일 동작 바 열다섯.
두 규칙이 막고 있었다.

1. [iconography](../../foundations/iconography.md) 기하 계약은 요소마다 `fill="none"` 과 획 1.5 를 요구한다. 그런데 빌드(`build-icons.mjs`)는
   채움을 이미 받고 있고 정본 `video-stack` 이 채운 요소를 갖는다 — 문서와 실제가 어긋나 있었다.
2. [DS-D-0008](DS-D-0008-icon-source.md) 5항은 브랜드 로고를 아이콘 세트에서 뺀다. 근거는 둘이다 — 다색 · 고정색이라 `currentColor` 계약을
   지킬 수 없다, 상표 조건이 오픈소스 라이선스와 다른 축이다.

## Decision

1. **채운 글리프를 받는다 — 이름 끝이 `-fill` 이다.** 채운 요소는 `fill="currentColor"` 이고 획을 갖지 않는다. 같은 모양의 외곽선 글리프가
   있으면 짝으로 둔다(`play` · `play-fill`). `video-stack` 처럼 외곽선과 채움을 섞은 기존 글리프는 그대로 둔다.
2. **한 색 브랜드 로고를 받는다 — 이름 끝이 `-logo` 이다.** `currentColor` 하나로 그려지는 선 그림 로고만 받는다(`youtube-logo` ·
   `instagram-logo`). 다색 로고와 고정 브랜드 색을 요구하는 로고는 여전히 아이콘이 아니다(DS-D-0008 5항이 그 경우에 남는다).
   키워드에 「브랜드」 · `brand` 를 넣어 일반 글리프와 갈라 찾는다. 상표 사용 조건은 쓰는 자리(소비처)가 지킨다 — 아이콘 세트는
   모양을 공급할 뿐 쓰임을 허락하지 않는다.
3. **출처는 DS-D-0078 그대로다.** upstream 과 문자 그대로 같으면 `세트:원래 이름`(sparkle-fill · instagram-logo · frame-corners), 제품이 그린 것과
   손질한 것은 `original` 이다. lucide 와 0.3 ~ 0.5 단위만 다른 다섯(scissors · arrow-u-up-left/right · speaker-high · speaker-x)은 좌표를
   lucide 로 바꾸지 않았다 — 바꾸면 제품 그림과 어긋난다.

## Consequences

- 아이콘 47 → 70. Figma DS · Icons 에 같은 글리프를 세우고 icons 블록을 다시 뜬다(다음 작업).
- 노드 캔버스 부품의 결손 글리프(채널 줄 · 빈 영상 칸 · 오디오 재생 · 글자 생성 버튼)가 풀린다.

## Rollback

`-fill` · `-logo` 글리프와 출처 · 키워드 항목을 지우면 이전과 같다.
