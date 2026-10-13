---
id: channel-header
status: experimental
authority: normative
summary: 채널 · 계정 하나의 머리. 배너 띠 아래 아바타 · 이름 · 수치 · 설명 한 줄 · 액션이 한 줄로 섭니다.
---

# Channel Header

연결한 채널(유튜브) · 계정(인스타그램) 하나를 화면 맨 위에서 **누구의 화면인지** 말한다(`.louis-channel-header`,
[DS-D-0087](../governance/decisions/DS-D-0087-channel-header.md)). 배너는 띠로 두고 글자는 그 아래에 둔다 — 유튜브 채널 페이지와 같은 배치다.
글자를 사진 위에 얹지 않으므로 베일도, 사진에 따라 흔들리는 대비도 없다.

**얇은 부품이다.** 안의 조각은 전부 이미 LOUIS 다 — [Avatar](avatar.md) · [Skeleton](skeleton.md) · [Bare Button](bare-button.md) ·
`.louis-visually-hidden` · [Icon Button](icon-button.md) + [Menu Popover](menu-popover.md). 이 부품이 갖는 것은 **배치**(띠 → 프로필 줄, 줄 안의
세 칸), **좁은 화면 단**(띠 비율 · 아바타 크기 · 이름 크기), **로딩 전후 줄 높이가 같게 하는 규칙**뿐이다. 제목 블록 + 액션 한 줄인
[Section Header](section-header.md) 의 단이 아니다 — 루트가 세로이고 앞쪽 미디어가 서며 가운데 정렬이다(DS-D-0087 판단 1).

제품 정본은 `components/scenes/analytics/AnalyticsChannelHeader.tsx:26-92` 의 상수와 `:138-231` 의 마크업이고, 소비처는 유튜브 분석
(`components/scenes/YoutubeAnalyticsScene.tsx:1409-1438`)과 인스타그램 분석(`components/scenes/InstagramAnalyticsScene.tsx:1758-1778`)이다
(통합 판 `54b62a8aa`).

```html
<!-- 불러온 판 — 유튜브(띠 · 설명 · 액션) -->
<header class="louis-channel-header">
  <div class="louis-channel-header__banner">
    <img class="louis-channel-header__banner-image" src="…" alt="" />
  </div>
  <div class="louis-channel-header__profile">
    <span class="louis-avatar louis-channel-header__avatar" aria-hidden="true">
      <img class="louis-avatar__image" src="…" alt="" />
    </span>
    <div class="louis-channel-header__text">
      <h1 class="louis-channel-header__name">채널 이름</h1>
      <p class="louis-channel-header__stats">
        <span>구독자 1.2천명<span class="louis-visually-hidden">, </span></span>
        <span>동영상 48개<span class="louis-visually-hidden">, </span></span>
        <span>조회수 3.4만회</span>
      </p>
      <button type="button" class="louis-bare-button louis-channel-header__description"
              aria-haspopup="dialog" title="채널 정보">채널 설명 원문…</button>
    </div>
    <div class="louis-channel-header__actions">
      <button type="button" class="louis-icon-button" data-variant="ghost"
              aria-label="더보기" aria-haspopup="menu" aria-expanded="false" aria-controls="…">…</button>
    </div>
  </div>
</header>

<!-- 로딩 판 — 띠 · 설명 자리를 미리 잡는다 -->
<header class="louis-channel-header" aria-busy="true">
  <div class="louis-skeleton louis-channel-header__banner" data-shape="block" aria-hidden="true"></div>
  <div class="louis-channel-header__profile">
    <div class="louis-skeleton louis-channel-header__avatar" data-shape="circle" aria-hidden="true"></div>
    <div class="louis-channel-header__text" aria-hidden="true">
      <div class="louis-channel-header__name"><span class="louis-skeleton" data-shape="line"></span></div>
      <div class="louis-channel-header__stats"><span class="louis-skeleton" data-shape="line"></span></div>
      <div class="louis-channel-header__description"><span class="louis-skeleton" data-shape="line"></span></div>
    </div>
  </div>
</header>
```

## Availability

| Surface       | 상태           | 근거 |
| ------------- | -------------- | ---- |
| Web           | `partial`      | CSS recipe `packages/css/src/component/channel-header.css` · 실브라우저 시험 `channel-header.browser.test.tsx`. React 표면은 없다 — 소비처가 클래스와 마크업 계약을 문다(DS-D-0087) |
| Figma         | `partial`      | 2026-10-13 — `ChannelHeader` 세트(Loading `false` · `true` × Layout `base` · `compact` = 4, BOOLEAN `HasBanner` · `HasDescription` · `HasActions`, TEXT `Name` · `Stat1`~`Stat3`, INSTANCE_SWAP `Actions` — 기본 IconButton ghost 점 셋 세로)와 설명 한 줄의 상호작용을 가진 `ChannelHeaderDescription`(State `Default` · `Hover`, Default 에 ON_HOVER). `compact` 는 560 이하 · 480 이하 두 단을 한 칸(폭 448)으로 그린다. 띠 · 아바타 · 줄 막대는 Skeleton(`block` · `circle` · 새 `line`) · Avatar 인스턴스이고 띠 면은 `bg-inset` 이다(예시 그림 없음). 기록 `channel-header` · `channel-header-description` 과 parity 기하 계약, 실브라우저 되재기(`channel-header-geometry.browser.test.tsx`). 제품 렌더 대조는 없다 |
| Documentation | `done`         | 이 문서 |
| Maturity      | `experimental` | 제품이 아직 이 클래스를 물지 않는다 |

## Anatomy

| 부분 | 값 |
| --- | --- |
| 루트 `.louis-channel-header` | 세로. 띠와 줄 사이 16(`space-layout-gutter`). 바깥 여백이 없다 |
| 배너 띠 `__banner` · `__banner-image` | 6:1(560 이하 4:1) · 반경 12(`radius-card`) · `cover`. 장식(`alt=""`). 그림 전의 면 `bg-inset`. 그림이 없으면 소비처가 요소째 뺀다 |
| 프로필 줄 `__profile` | 가운데 정렬, 사이 16 |
| 아바타 `.louis-avatar` + `__avatar` | 64(560 이하 48). 폴백은 avatar 의 사람 글리프. 보조기술에는 감춘다 |
| 글 칸 `__text` | 사이 4(`space-stack-xs`), 남는 폭을 먹는다 |
| 이름 `__name` | heading-sm medium 28 / 1.35(480 이하 body-lg medium 20 / 1.5) · `fg-primary` · 한 줄 말줄임 |
| 수치 `__stats` | body-sm regular 14 / 1.5 · `fg-tertiary` · 항목 사이 12(`space-stack-md`) · 넘친 줄 사이 2 |
| 설명 `__description` | 수치와 같은 글자 · 한 줄 접힘 |
| 액션 `__actions` | 줄 끝 슬롯 |

## Properties

React 를 만들지 않는다 — 이 마크업 계약이 공개 계약이다.

| 속성 · 요소 | 뜻 | 누가 단다 |
| --- | --- | --- |
| `aria-busy="true"`(루트) | 로딩 판. 수치 · 설명 자리의 flex · 줄 접기를 풀고 스켈레톤 잉크를 `fg-primary` 로 고정한다 | 소비처 — 데이터가 없을 때 |
| `__banner` 생략 | 띠 없는 판(인스타그램 · 그림 없음 · 실패) | 소비처 |
| `__description` 요소 | `<button>`(+ `.louis-bare-button`, `aria-haspopup="dialog"`) = 누르면 정보 대화상자 · `<p>` = 정적 · 생략 = 설명 없음 | 소비처 |
| 이름 요소 | `<h1>`(화면의 첫 제목). 다른 제목 아래에 놓이면 그 위계를 따른다 | 소비처 |
| `__actions` 생략 | 액션 없는 판 | 소비처 |

변형 축은 없다. 좁은 화면 단은 뷰포트가 정한다(아래 States).

## States

| 상태 | 훅 | 무엇이 바뀌나 |
| --- | --- | --- |
| 불러온 판 | — | 위 Anatomy |
| 로딩 | 루트 `aria-busy="true"` | 띠 · 아바타가 스켈레톤(`block` · `circle`)으로, 글자 줄이 줄 안 스켈레톤(`line`, 폭 180 · 260 · 360)으로. 줄 높이는 그대로다 |
| 설명 호버 | `:hover`(호버 기기에서만) | 설명 잉크 `fg-tertiary` → `fg-primary` |
| 좁은 화면 560 이하 | 뷰포트 | 띠 4:1 · 아바타 48 |
| 좁은 화면 480 이하 | 뷰포트 | 이름 body-lg medium(20 / 1.5) |

**로딩은 같은 표면의 상태다**([DS-D-0040](../governance/decisions/DS-D-0040-state-is-a-variant-axis.md)) — 자식 집합이 같고 내용만 자리표시로
바뀐다. 글자 자리 막대는 실제 글자 줄 **안**에 서므로 그 줄의 행간이 줄 높이를 정하고, 로딩이 끝나는 순간 아래 탭 줄이 밀리지 않는다.

## Content

- 이름은 채널 이름 그대로(인스타그램은 `@` + 사용자 이름). 없으면 플랫폼 이름으로 대신한다.
- 수치는 이미 로케일 문구로 조립된 항목(「구독자 1.2천명」)이다. 가운뎃점으로 잇지 않는다 — 간격이 뗀다(2026-09-22 소유자 결정).
  넘치면 항목째 다음 줄로 간다.
- 설명은 원문 그대로 넣는다. 줄바꿈은 한 줄로 접힌 안에서 공백으로 흐르고, 원문 줄바꿈은 대화상자 본문이 보여 준다.
- 액션은 계정 하나의 더보기 메뉴 하나를 권한다 — 트리거는 Icon Button ghost, 메뉴는 Menu Popover 다.

## Accessibility

- 이름은 화면의 첫 제목(`<h1>`)이다. 아바타 · 띠는 이름과 같은 사실의 그림이라 감춘다(`aria-hidden` · `alt=""`).
- 수치 항목 사이에 보이지 않는 구분(`.louis-visually-hidden`, ko/en 「, 」 · ja 「、」)을 넣는다 — flex 안의 공백은 접근성 트리에서도 빠져
  없으면 「6명동영상」처럼 붙여 읽는다(`components/scenes/analytics/SpacedItems.tsx:1-11`).
- 누르는 설명은 `<button>` 이고 접근 이름은 **보이는 설명 글**이다(2.5.3). 대화상자를 열므로 `aria-haspopup="dialog"`, `title` 은 대화상자 이름.
- 포커스 링은 전역 규칙이 소유한다([DS-D-0074](../governance/decisions/DS-D-0074-focus-ring-removed.md)).
- 로딩 중에는 루트가 `aria-busy="true"` 이고 자리표시는 전부 `aria-hidden` 이다.
- 대비(실브라우저 실측, 바닥 `bg-surface`): 이름 라이트 16.54 · 다크 16.54, 수치 · 설명 라이트 6.44 · 다크 5.25, 설명 호버 이름과 같다.

## Acceptance tests

`packages/react/test/channel-header.browser.test.tsx` 가 클래스 마크업을 실브라우저로 렌더해 잰다.

1. 띠 비율 — 1440 · 561 에서 6:1, 560 · 375 에서 4:1. 반경 12. 로딩 띠도 12(block 의 16 이 아니다).
2. 아바타 64 · 560 이하 48. 로딩 원도 같은 크기.
3. 띠 → 줄 16 · 줄 안 16 · 글 칸 4 · 수치 사이 12 · 넘친 수치 줄 사이 2 · 가운데 정렬 · 바깥 여백 0.
4. **로딩 전후 머리 높이가 같다** — 1440 · 560 · 480 · 375, 띠 있음 · 없음에서 `aria-busy` 판과 불러온 판의 높이를 맞댄다(이름 37.8 · 수치 21 · 설명 21).
5. 설명이 375 에서도 한 줄이다(제품이 3줄로 풀린 사고, `components/scenes/analytics/AnalyticsChannelHeader.tsx:65-66`).
6. 이름 481 에서 28 / 37.8, 480 · 375 에서 20 / 30.
7. 로딩 막대 — `line` 높이는 글자 크기 × 0.75(이름 21 · 수치 10.5), 폭 180 · 260 · 360, 잉크 `fg-primary`.
8. 설명 호버에서 잉크가 `fg-primary` 로. 대비는 실제로 잰다 — 이름 · 수치 · 설명 · 설명 호버, 두 테마.

## Known deviations

1. **다크 띠 면이 제품 `gray-700` 에서 `bg-inset`(`gray-950`)으로 내려간다** — 그림이 뜨기 전 한순간의 우물이다(DS-D-0087 판단 5).
2. **480 이하 이름 행간이 제품 27(1.35)에서 30(body-lg 1.5)으로 3 늘어난다** — 크기 · 자간만 바꾸는 조합은 글자 스타일이 없다(판단 7).
3. **아바타 폴백이 빈 회색 원에서 avatar 의 사람 글리프로 바뀐다**(`fg-tertiary` on `bg-inset`).
4. **바깥 여백(좌우 셸 인셋 · 아래 16)은 레시피 밖이다** — 소비처가 진다(판단 6).
5. **설명 호버 잉크가 88% 알파에서 `fg-primary` 로** — 알파로 색을 만드는 방식을 옮기지 않았다.

## 제품에서 발견한 것

- 글자 줄 스켈레톤(`inline-block align-middle h-[0.75em]`)이 네 파일에 복제돼 있었다 — `components/scenes/analytics/AnalyticsChannelHeader.tsx:83-84` ·
  `components/scenes/analytics/KpiCard.tsx:62-63` · `components/scenes/create/node-canvas-v2/NodeCanvasAnalysisModal.tsx:148-149` ·
  `components/scenes/archive/YoutubeVideoAnalyticsView.tsx:253-254`.
  → [Skeleton](skeleton.md) 의 `line` 모양.
- 수치 줄의 간격 떼기(`SpacedItems`)가 분석 두 씬 · 콘텐츠 표 · 영상 분석 모달에서 쓰인다. 지금은 이 머리의 `__stats` 가 갖는다(판단 9).
- 영상 분석 모달 머리(`components/scenes/create/node-canvas-v2/NodeCanvasAnalysisModal.tsx:110-146`)가 이 머리의 글 칸 규칙을 주석으로 따른다 —
  띠 · 아바타 없이 제목 두 줄이라 이번 범위 밖이다(판단 8).
- 계정 더보기 트리거(`components/scenes/analytics/AnalyticsAccountMoreMenu.tsx:77-117`)는 알파 잉크 · 테마 분기 선택자로 그린 32 아이콘 버튼이다 —
  Icon Button ghost 의 일.
- 설명 호버가 `@media (hover: hover)` 밖이라 터치에서 탭 뒤 진한 잉크가 남는다(`components/scenes/analytics/AnalyticsChannelHeader.tsx:69`).
