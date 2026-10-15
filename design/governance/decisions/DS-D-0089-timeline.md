---
id: decision-timeline
status: experimental
authority: normative
---

# DS-D-0089 시간축 위에 클립을 놓는 편집 타임라인을 새 부품 `timeline` 으로 — 눈금자는 같은 파일의 짝 블록, Segment Track 의 변형이 아니다

- Status: accepted (소유자 지시로 초안의 기본값을 받는다, 2026-10-14)
- Date: 2026-10-14
- Owners: repository owner, design system maintainer
- Affects: `timeline`, `badge`, `segment-track`, `video-player`, `slider`, `decision-product-parts-become-louis`

## Context

[DS-D-0084](DS-D-0084-product-parts-become-louis.md) 승격 목록의 「큰 것(각각 Decision 먼저)」에 `timeline` 이 있다. 제품 편집기에 시간축 부품이 둘 있고
둘 다 화면 파일 안의 상수다 — 좁은 화면의 모바일 타임라인(`MobileTimeline.tsx` 1,089줄 · `mobileTimelineClass.ts` 의 `MOBILE_TIMELINE_CLASS` 296줄)과
데스크톱 시퀀스 눈금자(`sequenceRuler.tsx` 의 `PremiereSequenceRuler`, 통합 판 `54b62a8aa`). 소비처는 편집기 모달 하나다(`VideoEditModal.tsx:12677` 타임라인 ·
`VideoEditModal.tsx:13029` 눈금자).

LOUIS 에는 시간축 위 **px 좌표에 클립을 절대 배치**하는 부품이 없다. [Segment Track](../../components/segment-track.md) 은 칸이 flex 로 흐르는
「시간 순서 줄」이고 지도 · 줄 머리 격자를 갖는다. [Video Player](../../components/video-player.md) 의 스크러버는 한 줄 진행 바, [Slider](../../components/slider.md) 는
네이티브 range 라 트랙 · 클립이 없다. 가운데 고정 재생헤드 · 스크롤 창 · 고른 클립의 트림 손잡이도 새 조형이다.

대비 · 접근성 부채가 있다. 모바일 눈금 글자 흰색 56%(파인 면 위 라이트 1.07) · 선 흰색 24%(라이트 1.03), 재생헤드 · 선택 고리 · 트림 괄호
`accent-primary`(라이트 2.98), 필름 전 영상 클립 길이 글자(흰 글자 on `accent-secondary` 라이트 1.32), 접근 이름 없는 「+」 버튼(`MobileTimeline.tsx@54b62a8a:978-997`),
보조기술에 나가지 않는 고름 상태(`aria-pressed` 없음). 데스크톱 눈금자는 `html[data-theme=light]` 선택자 여덟로 테마를 가른다.

## Decision

1. **새 부품 `timeline` 과 같은 파일의 짝 블록 `timeline-ruler`.** `packages/css/src/component/timeline.css` 에 `.louis-timeline`(셸 · 창 · 자리지기 ·
   흐르는 층 · 재생헤드 · 레인 · 클립 · 바닥 · 라벨 · 트림 손잡이 · 「+」)과 `.louis-timeline-ruler`(기본 = 데스크톱 시퀀스 3단 눈금, `data-layout="compact"` =
   타임라인 안의 촘촘한 눈금)를 세운다. 시퀀스 눈금자의 소비처가 데스크톱 셸이라 `.louis-timeline` 밖에서도 서야 하므로 `__ruler` 하위 부품이 아니라 독립 블록이다.
2. **기하는 데이터다.** 시각 → 픽셀(`xOf`) · 배율 · 눈금 간격은 소비처가 계산해 변수 셋으로 준다 — `--louis-timeline-extent`(전체 길이 px) ·
   `--louis-timeline-x`(자리) · `--louis-timeline-w`(길이). 흐르는 층 `left: 50%` 와 자리지기 `calc(100% + extent)` 는 레시피가 창 폭으로 푼다.
3. **새 시맨틱 넷, 원시 0.** `color-timeline-clip-caption`(yellow-300) · `-image`(green-300) · `-audio`(pink-300) — 면은 레시피가 `color-mix` 48% 로 만든다 —
   와 `color-timeline-accent`(라이트 blue-600 · 다크 blue-500). `contrastPairs` 에 `timeline-accent` on `bg-inset` 3:1 한 줄.
4. **대비 미달은 고쳐서 올린다**(DS-D-0084 3항) — 모바일 눈금 글자 `gray-000-alpha-56`(4.73 · 6.18) · 선 `gray-000-alpha-48`(3.60 · 4.83), 재생헤드 · 고리 · 괄호
   `timeline-accent`(3.89 · 5.37), 영상 클립 길이는 `louis-badge[data-surface="media"]`(7.61, 그림과 무관), 「+」에 `aria-label`, 데스크톱 눈금자의 테마 분기는
   적응 시맨틱(`gray-000-alpha-80` · `fg-primary`)으로 접는다.
5. **마크업 계약.** 클립 종류 `data-tone`(video · caption · image · audio), 고름 `aria-pressed`, 손잡이 쪽 `data-edge`(start · end), 오디오 레인 `data-tone="audio"`,
   눈금 단 `data-level`(major · mid · minor), 글자 정렬 `data-align`(start · end), 끌어 시킹 `data-interactive="true"`.
6. **React 표면은 만들지 않는다.** 스크롤 ↔ 시각 · 배율 · 끌기 · 자르기 · 길게 누르기 · 가장자리 자동 스크롤은 소비처의 행동이다.

### 소유자 판정 — 초안의 기본값으로 정했다

초안(`scratchpad/promote/big/timeline.md`, 작업 폴더)이 남긴 판정 열셋을 소유자 지시로 초안이 권한 기본값으로 정했다. 뒤집으면 레시피 한 곳을 고친다.

| # | 판단 | 기본값 | 대안 |
| --- | --- | --- | --- |
| 1 | 범위와 형태 | `timeline`(모바일 셸) + 같은 파일 짝 블록 `timeline-ruler` | `timeline__ruler` 하위 부품 · 데스크톱 시퀀스 타임라인 전체까지 한 회차 |
| 2 | 기하의 소유 | 변수 셋 + 흐르는 층 `50%` · 자리지기 `100% + extent` 를 레시피가 | React `Timeline` 이 시각 → 픽셀까지 |
| 3 | 좁은 화면 경계 | 소비처가 트리 하나를 그린다(레시피는 숨지 않는다) | 레시피에 `max-width: 719px` |
| 4 | 시간축 강조색 | 새 `timeline-accent`(라이트 blue-600 · 다크 blue-500) | `accent-primary` + Known deviation(라이트 2.98) |
| 5 | 영상 클립 길이 글자 | `louis-badge[data-surface="media"]` 조합 | 제품 흰 글자 + 그림자 · 바닥을 `media-stage-surface` 로 |
| 6 | 모바일 눈금 잉크 | 글자 `gray-000-alpha-56` · 선 `-48` | 글자만 고치고 선은 `-24` + deviation |
| 7 | 데스크톱 눈금자 테마 분기 · 그림자 | 눈금 `gray-000-alpha-80` · 글자 `fg-primary`, 그림자 뺌 | 그림자 유지(새 그림자 토큰) |
| 8 | 클립 경계 대비(라이트 1.07~1.28) | 제품 값 + Known deviation | 1px 선 + 종류별 선 토큰 셋 |
| 9 | 고름 속성 | `aria-pressed` 하나를 CSS 훅으로(Figma `Selected`) | `data-selected` + `aria-pressed` |
| 10 | 클립 종류의 이름 | `data-tone` → Figma `Tone`(§2 `data-tone` 철자 예외) | `data-kind` + §2 에 `Kind` 축 |
| 11 | 「+」 의 형태 | 하위 부품 `__add`(레인 높이 정사각, 호버 추가) | IconButton secondary + 소비처 크기 덮어쓰기 |
| 12 | 트림의 키보드 대안 | 이번 회차는 기록만(Known deviation · 제품 (나)) | 손잡이를 `role="slider"` 계약으로 레시피 문서에 |
| 13 | 소비처 없는 제품 경로 | 재생헤드 캡 · `SequenceGridLines` · 시퀀스 밖 눈금자 면을 올리지 않는다 | 레시피에 함께 둔다 |

### 경계와 하지 않는 것

- 레시피가 소유한다 — 조형 · 칠 순서(숫자 z-index 없음, 셸 `isolation`) · 원점 식 · 레인 높이 · 클립 면 · 고리 · 손잡이 기하 · 「+」 · 눈금 두 판.
- 소비처가 소유한다 — 시각 ↔ 픽셀 · 배율 · 스크롤 추종 · 끌기 · 길게 누르기(400ms · 6px) · 가장자리 자동 스크롤 · 탭 해제 · 눈금 모델(`buildSequenceRulerModel`) ·
  필름스트립 타일 수 · 파형 · 줄 순서(빈 트랙은 그리지 않는다) · 「+」 는 메인 트랙 끝에만 · 좁은 화면 판정.
- 하지 않는 것 — 데스크톱 시퀀스 타임라인의 레일 · 트랙 · 클립 · 손잡이 · 마커 · 줌 스템(`vemClass.ts` 의 `sequenceUnified*` · `audioClip`)은 다음 회차가
  이 레시피의 클립 문법과 `timeline-clip-*` 를 물려받는다. 재생헤드 캡 · 격자선(소비처 0)은 올리지 않는다. React 컴포넌트 · 새 의존성 · 새 breakpoint 없음.

## Consequences

- 새 토큰 넷(원시 0)과 `contrastPairs` 한 줄.
- 제품 (나): `MOBILE_TIMELINE_CLASS` → `louis-timeline*`, 자리지기 인라인 폭과 흐르는 층 인라인 `left` 를 루트의 `--louis-timeline-extent` 하나로, 클립 · 「+」 의 인라인
  `left` · `width` 를 `--louis-timeline-x` · `-w` 로, 클립에 `data-tone` · `aria-pressed` · `aria-label`, 영상 길이 라벨을 배지로, 「+」에 `aria-label`, 창에
  `role="region"`. `sequenceRuler.tsx` 의 눈금 · 글자를 `louis-timeline-ruler*` 로 옮기고 테마 분기 · 그림자 · 재생헤드 캡 · `SequenceGridLines` 를 지운다.
- 보이는 변화 — 라이트 눈금 글자 · 선이 보이게 되고, 영상 클립 길이가 칩이 되고, 라이트 재생헤드 · 고리 · 괄호가 한 단 진해지고, 데스크톱 라이트 눈금이 진해진다(6.28 → 11.30).
- Figma 에 `TimelineClip` · `TimelineTrimHandle` · `Timeline` · `TimelineRuler` 세트와 변수 `timeline/*` 넷이 선다.

## Rollback

`timeline.css` · 문서 · manifest 세 자리 · 토큰 넷 · `contrastPairs` 한 줄 · Figma 세트 · 변수 · 기록 · parity 계약을 지운다. 제품이 클래스를 물기 전이면 제품 영향은 없다.
