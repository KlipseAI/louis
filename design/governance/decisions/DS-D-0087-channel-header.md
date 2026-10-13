---
id: decision-channel-header
status: experimental
authority: normative
---

# DS-D-0087 채널 머리를 배치만 소유하는 얇은 새 부품 `channel-header` 로 — Section Header 의 단이 아니다

- Status: accepted (소유자 지시로 초안의 기본값을 받는다, 2026-10-13)
- Date: 2026-10-13
- Owners: repository owner, design system maintainer
- Affects: `channel-header`, `skeleton`, `section-header`, `avatar`, `decision-product-parts-become-louis`

## Context

[DS-D-0084](DS-D-0084-product-parts-become-louis.md) 승격 목록의 「큰 것(각각 Decision 먼저)」에 `channel-header` 가 있다. 유튜브 · 인스타그램
분석 화면이 함께 쓰는 채널 머리(`components/scenes/analytics/AnalyticsChannelHeader.tsx`, 통합 판 `54b62a8aa`)는 제품 안에서 이미 한
컴포넌트로 모였지만, 그 조형 — 띠 비율 6:1(560 이하 4:1) · 아바타 64(560 이하 48) · 이름 28(480 이하 20) · 간격으로 뗀 수치 · 한 줄 설명 ·
줄 안 스켈레톤 — 은 Tailwind 상수 열넷(`:26-92`)으로만 있고 LOUIS 에는 없다. 덱 키트 · Figma 보드는 이 머리를 부품으로 쓸 수 없다.

안의 조각은 이미 LOUIS 다 — `avatar` · `skeleton` · `bare-button` · `louis-visually-hidden` · `icon-button` + `menu-popover`. 비어 있는 것은
그 조각을 세우는 **배치**와 **좁은 화면 단**, **로딩 전후 줄 높이를 같게 하는 규칙**이다.

글자 대비 미달은 없다(이름 `fg-primary`, 수치 · 설명은 제품 `--dashboard-muted-color` 가 두 테마 모두 `fg-tertiary` 와 같은 값). 고쳐 올리는
것은 역할 잉크다 — 설명 호버의 88% 알파(`:69`) → `fg-primary`, 라이트 이름 `static-black` → `fg-primary`, 아바타 폴백의 빈 회색 원(`:47`) →
avatar 의 사람 글리프. 제품 글자 줄 스켈레톤 유틸 문자열(`inline-block align-middle h-[0.75em]`)은 이 머리 밖의 세 파일에도 복제돼 있다.

## Decision

1. **새 부품 `channel-header` — 배치만 소유하는 얇은 CSS 레시피.** 안의 조각은 기존 LOUIS 클래스를 같은 요소에 함께 단다. Section Header 의
   단(`data-level`)으로 넣지 않는다 — 그 레시피는 「제목 블록 + 액션」 한 줄 flex 이고, 채널 머리는 루트가 세로(띠 위 · 줄 아래)이며 줄 앞쪽에
   아바타가 서고 정렬이 가운데이며 좁은 화면에서 띠 비율과 아바타 크기가 함께 바뀐다. 단 하나로 넣으면 다른 여섯 단이 쓰지 않을 해부가 생긴다.
   반대로 「부품 아님」으로 두면 상수 열넷이 제품에 남아 DS-D-0084 3항(복사 금지)에 어긋난다.
2. **글자를 사진 위에 얹지 않는다**를 계약으로 올린다 — 스크림 · 미디어 잉크가 없다. 띠는 장식이다.
3. **로딩은 같은 표면의 상태다**([DS-D-0040](DS-D-0040-state-is-a-variant-axis.md)) — 루트 `aria-busy="true"`, 글자 자리는 줄 안 스켈레톤.
   [Skeleton](../../components/skeleton.md) 에 `data-shape="line"`(높이 `0.75em` · 인라인 · 가운데)을 연다. React `SkeletonShape` 에 `line` 이 더해진다.
4. **바깥 여백 · 셸 인셋은 소비처**가 진다.
5. **새 토큰은 없다.** 바뀌는 것은 역할 잉크 셋과 다크 띠 면 · 480 이하 이름 행간(Known deviations).
6. **React 표면은 만들지 않는다.** 마크업 계약을 문서 Properties 절이 소유한다.

### 소유자 판정 — 초안의 기본값으로 정했다

초안(`scratchpad/promote/big/channel-header.md`, 작업 폴더)이 남긴 판정 아홉을 소유자 지시로 초안이 권한 기본값으로 정했다. 뒤집으면 레시피 한 곳을 고친다.

| # | 판단 | 기본값 | 대안 |
| --- | --- | --- | --- |
| 1 | 형태 | 새 부품 `channel-header`(배치만 소유) | `section-header[data-level="profile"]` + `__banner` · `__avatar` · 부품 아님(조합 스니펫, 제품 상수 유지) |
| 2 | 아바타 64 · 48 의 소유 | 머리의 `__avatar` 가 크기를 갖고 `.louis-avatar` 와 같은 요소에 단다 | avatar 에 쓰임새 크기 `data-size="channel"` |
| 3 | 좁은 화면 단의 경계 | 뷰포트 560 · 480(제품 그대로, 선례 tabs · chart-card) | 머리 폭 컨테이너 쿼리 · 소비처 `data-layout="compact"` |
| 4 | 글자 줄 스켈레톤 | skeleton 에 `data-shape="line"`(제품 네 파일) | 머리 지역 `__line` |
| 5 | 띠 면(그림 전) | `bg-inset`, 새 토큰 0(다크 `gray-700` → `gray-950`) | 새 시맨틱 `channel-header-banner-surface`(라이트 `gray-050` · 다크 `gray-700`) |
| 6 | 바깥 여백 | 소비처 — 좌우 셸 인셋 · 아래 16 · 위 0 | 레시피가 `padding-block-end: 16` 과 셸 인셋을 갖는다 |
| 7 | 480 이하 이름 행간 | body-lg medium 통째(20 / 1.5 = 30) | 제품처럼 크기 · 자간만(20 / 1.35 = 27) — 글자 스타일이 없어 Figma 가 그릴 수 없다 |
| 8 | 영상 분석 모달 머리 | 이번 범위 밖 — 문서 「제품에서 발견한 것」 | 띠 · 아바타 없는 판 + 제목 두 줄 축으로 함께 올린다 |
| 9 | 수치 줄 간격 떼기(`SpacedItems`) | 이 머리의 `__stats` 가 먼저 갖는다 | 새 작은 부품(`spaced-list` 류) |

### 경계와 하지 않는 것

- React 컴포넌트 · 그림 실패 기억 · 자리 미리 잡기 판단(`reserveBanner` · `reserveDescription`) — 소비처의 상태다.
- 채널 정보 대화상자 · 계정 더보기 메뉴의 행동 — [Dialog](../../components/dialog.md) · [Menu Popover](../../components/menu-popover.md) 가 갖는다.
- 영상 분석 모달 머리를 이 부품에 넣지 않는다(제목 두 줄 · grid 링크 배치가 다르다) — 셋째 소비처가 되는지는 따로 판정한다.
- `SpacedItems` 를 독립 부품으로 세우지 않는다 — 콘텐츠 표가 같은 값을 쓰는 것이 확인되면 떼어낸다.
- 새 breakpoint 를 세우지 않는다 — 560 · 480 은 제품 값 그대로이고 LOUIS 의 셸 경계가 아니다.

## Consequences

- 제품 (나): 상수 열넷을 `louis-channel-header*` 클래스로 바꾸고 헤더 카드에는 소비처 몫(아래 16 · 좌우 인셋 · 719 이하 오른쪽 8)만 남긴다.
  로딩 판에 루트 `aria-busy`, 막대를 `data-shape="line"` 으로(유틸 높이 · 잉크 · 폭 삭제). 머리 밖 세 파일(KPI 카드 · 영상 분석 모달 머리 ·
  영상 분석 본문)의 같은 유틸 문자열도 `line` 으로. 보이는 변화 — 아바타 폴백 글리프, 다크 설명 호버 88% → 100%, 480 이하 이름 줄 3px.
- Figma 에 `ChannelHeader`(Loading × Layout) · `ChannelHeaderDescription`(State) 세트와 Skeleton `line` 칸이 선다. 새 변수는 없다.

## Rollback

`channel-header.css` · 문서 · manifest 세 자리 · Figma 두 세트 · 기록 · parity 계약을 지우면 끝난다. skeleton `line` 은 소비처가 넷이라 남긴다. 토큰을 더하지 않아
생성 토큰과 기준선이 움직이지 않는다. 제품은 앵커의 상수로 돌아간다.
