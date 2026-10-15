---
id: decision-content-card
status: experimental
authority: normative
---

# DS-D-0088 커버 밖에 글이 서는 링크 카드를 새 부품 `content-card` 로 — Project Card · Media Card 의 변형이 아니다

- Status: accepted (소유자 지시로 초안의 기본값을 받는다, 2026-10-14)
- Date: 2026-10-14
- Owners: repository owner, design system maintainer
- Affects: `content-card`, `badge`, `project-card`, `media-card`, `decision-product-parts-become-louis`

## Context

[DS-D-0084](DS-D-0084-product-parts-become-louis.md) 승격 목록의 「큰 것(각각 Decision 먼저)」에 `content-card` 가 있다. 공개 블로그 인덱스
(`app/blog/page.tsx@54b62a8a:78-176`)와 템플릿 인덱스(`app/templates/page.tsx@54b62a8a:77-130`, 통합 판 `54b62a8aa`)가 「커버 그림 + 그 **밖**의 제목 · 설명 +
카드 전체가 링크 하나」인 카드를 각자 Tailwind 상수로 들고 있다. 표면 원장의 「16:9 격자 카드 · translateY 호버」 서술은 낡았다 — 블로그는
2026-09 에 글 왼쪽 · 썸네일 오른쪽의 가로 행이 됐고, 두 화면의 호버 · 비율 · 면이 이미 갈렸다.

LOUIS 의 카드 넷은 이 해부가 아니다. [Project Card](../../components/project-card.md) 는 제목을 그림 **위**에 점진 블러로 얹고 링크를 형제 층으로
깔아 슬롯 메뉴를 품는다(설명 · 날짜 자리가 없다). [Media Card](../../components/media-card.md) · [News Card](../../components/news-card.md) 는 레시피가
없고(web `not-ready`) 둘 다 사진 위 정보 판이다. [Start Card](../../components/start-card.md) 는 빈 캔버스의 `<button>` 이다.

대비 미달이 둘 있다. 블로그 날짜 잉크 `gray-000` 40%(랜딩 바닥 위 라이트 2.83 · 다크 3.55)와 블로그 제목 호버 `--primary-500`(라이트 3.37) —
후자는 1024 이상의 28px 에서는 큰 글자라 3:1 을 넘지만 1023 아래 랜딩 계단이 제목을 18px medium 으로 줄이면 큰 글자가 아니다.

## Decision

1. **새 부품 `content-card` 한 벌, 갈래 둘(`data-layout`).** `row`(기본, 블로그) — 글 왼쪽 · 16:9 썸네일 오른쪽, 면 없음, 719 아래에서 그림이
   위로 접힌다. `stack`(템플릿) — 잉크 4% 면 + 1px 선의 세로 카드, 4:3 커버, 오른쪽 위 개수 배지. 해부(커버 + 바깥 본문 + 통째 링크)가 같고
   갈리는 것은 배치 · 면 · 호버뿐이라 한 부품이다.
2. **비율은 축이 아니라 갈래의 기본값**이다 — 지역 변수 `--louis-content-card-ratio`(row `16 / 9` · stack `4 / 3`)를 소비처가 덮는다.
3. **카드 전체가 `<a href>` 하나다.** 안에 대화형 자손을 두지 않는다 — 그래서 project-card 처럼 링크를 형제 층으로 깔 필요가 없다.
4. **짝 블록 `.louis-content-card-list`** — row 줄 32(719 아래 40), `data-layout="grid"` 최소 300 트랙 · 줄 28 · 열 24. 폭 1120 은 landing-shell 몫이다.
5. **대비 미달 둘을 고쳐 올린다**(DS-D-0084 3항) — 날짜는 `landing-text-muted`(64%), row 호버 제목은 새 시맨틱 `color-content-card-title-hover`
   (라이트 `blue-620` · 다크 `blue-500`).
6. **호버는 호버 기기에서만, 움직임은 줄이지 않은 모션에서만**([DS-D-0077](DS-D-0077-hover-only-on-hover-devices.md)). 포커스 링은 그리지 않는다([DS-D-0074](DS-D-0074-focus-ring-removed.md)).
7. **커버 위 배지는 기존 `badge[data-surface="media"]`** 를 그대로 쓴다 — 레시피는 자리만 준다.
8. **React 표면은 만들지 않는다.** 마크업 계약을 문서가 소유한다.

### 소유자 판정 — 초안의 기본값으로 정했다

초안(`scratchpad/promote/big/content-card.md`, 작업 폴더)이 남긴 판정 아홉을 소유자 지시로 초안이 권한 기본값으로 정했다. 뒤집으면 레시피 한 곳을 고친다.

| # | 판단 | 기본값 | 대안 |
| --- | --- | --- | --- |
| 1 | 부품의 형태 | 새 부품 한 벌 + 갈래 `row` · `stack` | 두 부품(블로그 행 · 템플릿 카드) · MediaCard 레시피를 세우며 변형으로 흡수 |
| 2 | 비율 | 갈래의 기본값 + `--louis-content-card-ratio` 로 덮기 | `data-ratio`(16:9 · 4:3) 축 — §2 어휘에 `Ratio` 축 개정까지 부른다 |
| 3 | row 호버 제목 잉크 | 새 시맨틱 `content-card-title-hover`(라이트 `blue-620` 5.00 · 다크 `blue-500` 5.97) | `accent-primary` 그대로 + Known deviation(라이트 3.37) · 색을 빼고 밑줄 |
| 4 | 날짜 잉크 | `landing-text-muted` 64%(5.10 · 8.03) | `fg-tertiary`(6.44 · 6.39) · 제품 40%(2.83 · 3.55) |
| 5 | 호버 표현 | 갈래마다 — row 제목색 + 그림 확대, stack 떠오름 + 선 | 하나로 통일 |
| 6 | 호버 박자 | 제품 리터럴 320 · 220ms + 토큰 곡선 | 토큰 길이 zoom-settle 680 · content-rise 360 |
| 7 | 템플릿 배지 | `badge[data-surface="media"]` 정본(불투명, 높이 26) | 제품 덮어쓰기(검정 56% · 상하 3 · medium, 24) |
| 8 | Figma 배지 | Badge 인스턴스의 칠 · 글자를 media-badge 변수로 덮는다 | Badge 세트에 media 갈래 축을 연다(§2 어휘 개정) |
| 9 | 목록 블록 | 짝 블록 `.louis-content-card-list` | 소비처 몫으로 문서 스니펫만 |

### 경계와 하지 않는 것

- 부품이 소유한다 — 카드 상자(갈래별 배치 · 면 · 선 · 반경), 커버 상자(비율 · 반경 · 빈 커버 그라디언트 · 그림 채움), 본문 슬롯의 글자 · 잉크 ·
  줄 수, 호버와 박자, 719 접힘, 랜딩 제목 계단, 목록 간격.
- 화면이 소유한다 — 데이터 · 빈 목록 폴백 · 섹션 머리 · 콘텐츠 폭 1120 · 스크롤 리빌(`data-reveal`) · 날짜 서식 · 커버가 영상인지 그림인지.
- 하지 않는 것 — React 표면, MediaCard 와의 병합(제목 자리 · 데이터가 다르다), 랜딩 `TemplateGrid` 를 이 카드로 바꾸기, 제품 `≤450` 본문
  축소 규칙(타이포 기초의 몫), Badge 세트의 media 축.

## Consequences

- 새 토큰 `color-content-card-title-hover` 하나(원시 0)와 `contrastPairs` 한 줄(랜딩 바닥 위 4.5).
- 제품 (나): 블로그 `LIST_CLASS` · 카드 상수 여덟 → `louis-content-card-list` · `louis-content-card*`, 템플릿 `GRID_CLASS` · 카드 상수 →
  `[data-layout="grid"]` · `[data-layout="stack"]`, 배지 덮어쓰기를 지우고 `data-surface="media"`. 보이는 변화 — 날짜가 진해진다(40 → 64%),
  라이트 호버 제목이 한 단 진한 파랑, 템플릿 배지가 불투명 회색 · 2 높아진다, 터치 기기에서 호버가 붙지 않는다, 줄인 모션에서 확대 · 떠오름이 없다.
- Figma 에 `ContentCard`(Layout × State) 세트와 변수 `content-card/title-hover` 가 선다.

## Rollback

`content-card.css` · 문서 · manifest 세 자리 · 토큰 한 칸 · `contrastPairs` 한 줄 · Figma 세트 · 변수 · 기록 · parity 계약을 지운다. 제품은 앵커의
상수로 돌아간다(클래스만 바꾸므로 기하 변화는 없다).
