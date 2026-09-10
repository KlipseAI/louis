---
id: app-shell-parts
status: experimental
authority: normative
summary: 앱 셸을 이루는 사이드바 행과 상단 바입니다.
---

# Sidebar Nav Item · App Top Bar

앱 셸 안에 놓이는 부품 둘이다 — navigation rail의 한 행과 top chrome의 한 줄.

**셸의 레이아웃 계약은 이 문서의 것이 아니다.** 사이드바가 어디에 자리를 예약하는지, 스크롤 루트가
어디인지, compact에서 드로어가 어떻게 열리는지는 [app-shell 패턴](../patterns/app-shell.md)이
소유한다. 여기 있는 것은 그 안에 담기는 조각이다.

## Availability

| Surface       | 상태           | 근거                                                          |
| ------------- | -------------- | -------------------------------------------------------------- |
| Web           | `partial`      | 브랜드 행·CTA 포함. public export와 실브라우저 acceptance test 10건; 셸 composition은 없다 |
| Figma         | `partial`      | component 둘 — SidebarNavItem 6 variant(State×Collapsed)와 AppTopBar. publish는 DS-F-008 |
| Documentation | `done`         | 이 문서                                                        |
| Maturity      | `experimental` | 규범과 구현이 같은 변경 단위에서 처음 선다                     |

## When to use

- 앱 셸의 navigation rail에 화면 하나를 대표하는 행을 놓을 때.
- 본문 위에 제목과 액션 한 줄이 필요할 때.

쓰지 않는 자리.

- **셸 전체를 조립하는 것.** 그것은 패턴이며 composition이 아직 없다.
- 목록 안의 선택 가능한 행. 그것은 SelectableListRow이며 다른 컴포넌트다.
- 탭. 가로로 늘어서고 콘텐츠를 바꾸는 것은 다른 축이다.

## API

```tsx
<SidebarNavItem href="/archive" icon={<IconHouse />} current>
  홈
</SidebarNavItem>

<SidebarNavItem href="/highlight" icon={<IconGraph />} trailing={<Badge>3</Badge>} collapsed>
  하이라이트
</SidebarNavItem>

<AppTopBar
  leading={<IconButton label="사이드바 접기" onClick={toggle}><IconSidebar /></IconButton>}
  title="홈"
  trailing={profileTrigger}
/>
```

## Anatomy

**SidebarNavItem** — Icon · Label · Trailing.
**AppTopBar** — Leading · Title · Trailing.

**SidebarSectionLabel** — 레일은 평평한 목록이 아니다. 「분석」 아래로 항목을 묶는 **비대화형 구획 라벨
행**이 하나 있다. 이 행을 모르면 YouTube 분석이 하이라이트 바로 아래 붙어 구획이 사라진다.

행(`<li>`)

| 축 | 값 | 비고 |
| --- | --- | --- |
| 요소·시맨틱 | `<li role="presentation">` | 목록 항목으로 세지 않는다 |
| `list-style` | `none` | |
| `margin` | `0` | |
| `padding` | `12px 0 4px` | **상하 비대칭.** 위 12로 앞 구획과 떼고 아래 4로 자기 항목에 붙인다 |
| `width` | `100%` | |
| 접힘 | `display: none` | 아이콘만 남는 레일에서 글자 구획은 의미가 없다 |
| 접힘 + `≤719px` 드로어 | `display: block` | 드로어는 폭이 있으므로 되살린다 |

라벨(`<span>`)

| 축 | 값 |
| --- | --- |
| 타이포 | `type-caption-12-medium`(12px / 1.5 = 18px) |
| `display` | `block` |
| `padding-left` | `main-inline-padding − sidebar-padding-x` = 16 − 12 = **4px** — 아이콘·로고와 같은 시작선 |
| 색 (light) | `--palette-gray-600` → 앱 셸 램프에서 `#9aa0ab` |
| 색 (dark) | `--palette-gray-400` = `#bcc0c9` |
| 문구 | 「분석」 / "Analytics" |

**4px을 따로 지어내지 않는다.** Specification의 행 좌우 여백 4px과 **같은 식에서 나온 같은 값**이다.
두 자리가 한 식을 공유하므로 한쪽만 8로 두면 구획 라벨이 아이콘 시작선에서 밀려난다.

근거: `Gnb.tsx:819-824`(라벨) · `Gnb.tsx:826-833`(행) · `Gnb.tsx:4588-4599`(마크업) ·
`globals.css:97`·`:105`(두 인셋 변수) · `globals.css:316-318`(caption-12) ·
`Gnb.tsx:2064`(앱 셸 라이트 램프) · `globals.css:33`.

## Properties

| 컴포넌트 | prop | 값 | 기본 | 뜻 |
| --- | --- | --- | --- | --- |
| SidebarNavItem | `href` | string | 없음 | 있으면 `<a>`, 없으면 `<button>` |
| | `icon` | ReactNode | 없음 | 행 앞 아이콘 |
| | `trailing` | ReactNode | 없음 | 행 끝 배지·개수. 접힘에서 사라진다 |
| | `current` | boolean | `false` | 현재 화면. `aria-current="page"`가 된다 |
| | `collapsed` | boolean | `false` | rail이 접혔는가 |
| AppTopBar | `leading` / `title` / `trailing` | ReactNode | 없음 | 세 슬롯 |
| | `divider` | boolean | `false` | 아래 경계선 |

## Hierarchy와 variants

variant 축이 없다. rail 안의 행은 전부 같은 무게이며, 강조는 `current` 하나다.

## States

| state | SidebarNavItem |
| --- | --- |
| Default | 투명, `color-fg-secondary` |
| Hover | `color-accent-ghost-hover`, `color-fg-primary` |
| Current | `color-bg-inset`, `color-fg-primary` |
| Focus visible | 공유 focus ring |

**행 아이콘은 라벨보다 옅다.** 아이콘 슬롯은 20×20에 `background-color: currentColor` + 마스크이고,
비활성 행에서 `opacity: 0.92`, 활성 행에서만 `1`이 된다. 라벨은 어느 상태에서도 100%다 — **같은 행
안에서 아이콘과 글자의 농도가 다르다.** 둘을 같은 농도로 그리면 Default 행이 배포본보다 진해지고,
Current로 넘어갈 때 일어나는 변화가 하나 사라진다.

| state | 아이콘 농도 | 라벨 농도 |
| --- | ---: | ---: |
| Default · Hover · Focus visible | 92% | 100% |
| Current | 100% | 100% |

농도는 전경색을 바꾸는 것이 아니라 마스크 슬롯의 `opacity`다. 색을 한 단계 옅은 토큰으로 바꿔 흉내내면
hover에서 전경이 바뀔 때 값이 어긋난다.

근거: 20×20은 이제 제품이 아니라 LOUIS `.louis-sidebar-nav-item__icon`(`icon-size-md` = 20px)이
소유하고 제품은 그 클래스를 얹기만 한다(`Gnb.tsx:608-613`). 농도는 그대로 제품 선언이다 —
`Gnb.tsx:615`(`currentColor`) · `:615`(`opacity:0.92`) · `:624`(활성에서 `1`) ·
라벨 `Gnb.tsx:651-669`에 `opacity` 선언 0건.

AppTopBar는 상태 축이 **없다.** 대화형이 아니고 안의 슬롯이 자기 상태를 갖는다.

## Interaction and responsive behavior

- 라벨은 한 줄로 잘린다. rail 폭이 고정이라 줄바꿈하면 행 높이가 흔들린다.
- 접힘에서 라벨이 시각에서만 숨고 아이콘이 가운데 정렬된다.
- TopBar의 제목이 남는 자리를 먹고 한 줄로 잘린다. 양옆 슬롯은 자기 크기를 갖는다.

## Content

- 라벨은 **화면의 이름**이다. "홈"이지 "홈으로 이동"이 아니다.
- **라우트 이름을 라벨로 쓰지 않는다.** `/archive`의 라벨은 「보관함」이 아니라 **「홈」**이다
  (`appNav.archive`). 경로에서 라벨을 유추하면 배포본에 없는 이름이 나간다 — 실제로 이 문서가
  네 곳에서 「보관함」이라고 적고 있었다(2026-08-21 정정).
- TopBar의 제목은 현재 위치를 말한다. 브레드크럼이 필요하면 `title` 자리에 넣는다 — 이 컴포넌트가
  브레드크럼 구조를 소유하지 않는다.

<!-- GENERATED:app-nav-labels START -->
배포본 `5a67d692` 기준. **이 표는 생성물이다** — 경로 대응은 제품이 `appNavItemLabels`로 직접 선언한다.

| 라우트 | 한국어 | English | 경로로 유추 |
| --- | --- | --- | --- |
| `/archive` | 홈 | Home | **불가** |
| `/nodecanvas` | 캔버스 | NodeCanvas | 가능 |
| `/videoeditor` | 비디오 에디터 | VideoEditor | 가능 |
| `/highlight` | 하이라이트 | Highlight | 가능 |
| `/analytics/youtube` | YouTube 분석 | YouTube analytics | **불가** |
| `/analytics/instagram` | Instagram 분석 | Instagram analytics | **불가** |

사이드바 바닥 자리는 하나이고 **홈**과 **업그레이드**가 나눠 쓴다.
<!-- GENERATED:app-nav-labels END -->

### 레일 항목 인벤토리

위 표는 **라벨 대응표일 뿐이다.** 레일에 서는 순서와 존재 여부는 이 표가 소유한다(배포본 `a9ead58b`).

| # | 행 | 라우트 | 아이콘 자산 | 선택 축 | 비고 |
| ---: | --- | --- | --- | --- | --- |
| 1 | 검색 | — | `/icons/MagnifyingGlass.svg` | **밖** | 커맨드 팔레트를 연다. `href`가 없다 |
| 2 | 홈 | `/archive` | `/icons/House.svg` | 안 | |
| 3 | 캔버스 | `/nodecanvas` | `/icons/Graph.svg` | 안 | 복합 행(「+」) |
| 4 | 비디오 에디터 | `/videoeditor` | `/icons/MagicWand.svg` | 안 | 복합 행(「+」) |
| 5 | 하이라이트 | `/highlight` | `/highlight_symbol.svg` | 안 | trailing 베타 칩 |
| 6 | 「분석」 구획 라벨 | — | — | 밖 | `<li role="presentation">` |
| 7 | YouTube 분석 | `/analytics/youtube` | `/icons/youtube.svg` | 안 | |

**`/analytics/instagram`은 레일에 서지 않는다.** 라우트도 아이콘(`/icons/InstagramLogo.svg`)도 라벨도
코드에 있지만 `INSTAGRAM_ANALYTICS_HIDDEN = true`가 그 행을 렌더 직전에 걷어낸다. 위 라벨 표에 한 줄로
올라 있다고 그리면 배포본에 없는 행이 하나 더 선다. 같은 플래그를 미들웨어가 라우트 차단에도 쓰므로
켜면 메뉴와 라우트가 함께 열린다.

**검색 행은 선택 축 밖에 있다.** 레일 첫 항목은 내비가 아니라 커맨드 팔레트를 여는 버튼이고, 유일하게
행 배열 밖에 하드코딩되어 목록 위에 선다.

| 축 | 값 |
| --- | --- |
| 위치 | 사이드바 `<ul>`의 **첫 `<li>`**. 「홈」보다 위 |
| 요소 | `<button type="button">` — `href`가 없다 |
| 시맨틱 | `aria-haspopup="dialog"` |
| 선택 | `aria-current`를 **절대 받지 않는다.** 활성 인디케이터(형제 절대배치 span)의 추종 대상도 아니다 |
| 아이콘 | `/icons/MagnifyingGlass.svg` — 다른 행과 같은 마스크 경로 |
| 라벨 | 「검색」 / "Search" |
| 접근 이름 | 펼침에서는 라벨 `<span>`이 소유한다. 접힘에서 라벨이 `aria-hidden`이 되고 버튼에 `aria-label`이 붙는다 |
| 골격 | 나머지 행과 **완전히 같다** |

골격이 같으므로 `SidebarNavItem`을 그대로 쓰되 `href`와 `current`를 주지 않고 `aria-haspopup="dialog"`를
얹는 것이 옳다. Hierarchy의 「rail 안의 행은 전부 같은 무게다」는 **시각 무게에 대해서만** 참이다 —
선택 축에 속하는지는 별개 축이고, 검색 행과 구획 라벨 행은 그 축 밖이다. 이 둘을 내비 항목으로 그리면
활성 인디케이터가 갈 수 있는 자리가 둘 늘어난다.

근거: `Gnb.tsx:2141-2162`(아이콘 대응과 행 배열) · `Gnb.tsx:2357-2358`·`Gnb.tsx:4583-4585`(숨김 필터) ·
`Gnb.tsx:4544-4582`(검색 행. 주석이 「내비 항목이 아니므로 인디케이터 대상 아님」이라 적는다) ·
`Gnb.tsx:4552-4560` · `app-paths.ts:6`·`:32-37` · `middleware.ts:183` · 라벨 `ko.ts:1317`·`en.ts:1326`.

## 복합 내비 행

배포본에는 내비 항목 하나와 「+」 생성 버튼이 한 줄을 나눠 쓰는 형태가 있다(하이라이트 허브 ·
비디오에디터 허브). 보통 항목은 행 전체가 하나의 히트 영역인데, 여기서는 **두 개의 목적지가 한
줄을 나눠 쓴다** — 왼쪽은 "그 화면으로", 오른쪽은 "새로 만들기"다.

`SidebarNavRow`가 그 줄을 소유한다. `SidebarNavItem`을 감쌀 뿐이며 항목을 다시 만들지 않는다 —
다른 컴포넌트를 만들면 선택 색·높이·반경이 두 곳에서 갈린다.

**행 자체는 버튼이 아니다.** 버튼 안에 버튼을 넣으면 HTML이 깨지고 키보드 순회가 무너진다.
배포본도 같은 이유로 행을 `<div>`로 두고 내비와 액션을 형제로 놓는다.

**접히면 액션이 사라진다.** 아이콘 하나가 들어가는 32px 자리에 둘을 넣을 수 없다. 배포본도
접힘에서 `display: none`으로 지운다.

**복합 행은 「캔버스」와 「비디오 에디터」 두 줄이다.** 위 문단의 「하이라이트 허브 ·
비디오에디터 허브」는 오기다 — **하이라이트 행에는 「+」가 없고** 그 자리에 베타 칩이 온다(trailing).

**두 「+」의 동작이 서로 다르다.** 한 문장으로 뭉뚱그리면 한쪽을 반드시 잘못 그린다.

| 행 | 「+」 동작 | 화면 결과 |
| --- | --- | --- |
| 캔버스 | `stopPropagation()` 후 트리거 요소를 넘겨 생성 모달을 연다 | **모달이 뜬다.** 복귀 포커스가 그 버튼이다 |
| 비디오 에디터 | `stopPropagation()` 후 프로젝트를 만들고 `/videoeditor/{id}`로 이동한다 | **모달 없이 즉시 생성 후 이동.** 중간 화면이 없다 |

두 행이 `stopPropagation()`을 쓰는 이유는 같다 — 액션이 행의 내비 절반을 함께 발화시키면 안 된다.
접근 이름도 갈린다: "New project (open canvas)" 대 "New project (video edit)".

**액션 슬롯(「+」 버튼)의 기하.** 32px 행 안에 들어가는 24px 버튼이며 행 높이와 같지 않다.

| 축 | 값 |
| --- | ---: |
| 크기 | 24 × 24 (행 32보다 8 작다) |
| 반경 | 6px |
| 테두리 | `0` |
| 여백 | `margin: 0` · `padding: 0` — 글리프가 flex 가운데 정렬 |
| `flex-shrink` | `0` — 라벨이 길어도 줄지 않는다 |
| 전환 | `background 160ms ease` |
| 접힘 | `display: none` |

| 상태 | light | dark |
| --- | --- | --- |
| rest | `--palette-gray-200` = `#eeeef1` | `--palette-gray-700` = `#575d68` |
| hover | `--palette-gray-300` = `#e4e5e9` | `--palette-gray-600` = `#777d89` |

글자색은 `inherit`으로 행의 전경을 그대로 받는다. **면은 행 배경 위에서 한 단계 올라온 중립이지
강조색이 아니다** — 브랜드 파랑이나 accent로 그리면 배포본과 다르다. 행 자체는 `display: flex` ·
`gap: 4px`이다.

**글리프는 앱 내비 아이콘과 같은 규격이다** — 표시 20 × 20, `viewBox="0 0 32 32"`, 두 path
(`M16 9V23`, `M9 16H23`), `stroke="currentColor"`, `stroke-width="2.4"`, `stroke-linecap="round"`,
`fill="none"`. 텍스트 「+」 글자가 아니므로 폰트를 바꿔도 두께가 따라오지 않는다(버튼에 남아 있는
`font-size`·`font-weight` 선언은 사문이다).

근거: `Gnb.tsx:765-789`(액션 버튼) · `Gnb.tsx:790-797`(행) · `Gnb.tsx:2198-2223`(글리프) ·
`Gnb.tsx:2060-2061`(앱 셸 라이트 램프) · `globals.css:35-36`(다크) ·
`Gnb.tsx:2151-2162`(행 배열) · `Gnb.tsx:4660-4675`(캔버스 모달) ·
`Gnb.tsx:2706-2720`(비디오 에디터 즉시 생성) · `Gnb.tsx:4749-4791`(하이라이트 = 일반 행 + 베타 칩).

## Sidebar brand와 CTA

사이드바는 내비 항목만으로 성립하지 않는다. 배포본은 **맨 위에 브랜드 행**, **맨 아래에 업그레이드
CTA**를 갖는다. 바닥 자리는 하나이고 화면에 따라 "홈"이 되기도 한다 — 배포본이 같은 클래스를
쓰므로 `SidebarCta` 하나가 둘을 덮는다. 이름이 CTA인 것은 그 자리의 첫 쓰임 때문이지 계약이
업그레이드에 매여 있다는 뜻이 아니다. 그 둘이 없어서 한 번 조립한 홈 템플릿을 내렸다(2026-08-18).

| 부품 | 계약 |
| --- | --- |
| `SidebarBrand` | 행 최소 높이 `layout-app-shell-top-bar-height`(40) · 마크 레일 `layout-app-shell-brand-mark-height`(28) · 워드마크 최대 폭 240 |
| `SidebarNavRow` | `gap` `space-control-xs` · 항목이 남는 자리를 먹고 액션은 옆에 선다 |
| `SidebarCta` | `margin-block-start: auto`로 바닥에 붙는다 · 버튼 최소 높이 `layout-control-height-lg` · **아이콘 슬롯이 없다** |

**브랜드 워드마크의 렌더 폭은 96px이다 — 위 표의 「최대 폭 240」은 실제의 2.5배다.**

| 상태 | 폭 | 산출 |
| --- | ---: | --- |
| 펼침 | **96px** | `round(28 × 291 / 85)` = 95.859 → 96 |
| 접힘(크롭) | **23.7176px** | `calc(28px × 72 / 85)` |

마크 높이 28px은 `--app-gnb-sidebar-logo-h`와 동기이고, 로고 자산의 viewBox는 **291 × 85**, 그 안의 좌측
결합 마크(큐브) 영역은 **72 × 72**다. 96px은 그 비례에서 나와 렌더에 직접 들어간다.

**제품 CSS에는 이 폭의 토큰이 없다.** LOUIS는 `app-gnb-sidebar-logo-wordmark-w`(96px)를 발행하지만
배포본 `74a7303b`의 제품 트리에 `--app-gnb-sidebar-logo-wordmark-w` 선언은 **한 건도 없다** —
96px은 CSS 리터럴이 아니라 JS 상수
`SIDEBAR_WORDMARK_FULL_W = logoWordmarkWidthForHeight(SIDEBAR_LOGO_H)`에서 나온다. 앞선 판이
「같은 값을 리터럴로 고정한다」고 적은 CSS 좌표는 지운다 — 가리킬 선언이 없다.

**접힘은 워드마크를 0으로 줄이는 것이 아니라 크롭이다.** 감싼 상자의 `width`가
`--app-gnb-sidebar-logo-cube-px`(= `calc(28px * 72 / 85)` = 23.7176px)로 좁아지고 `overflow: hidden`이
걸린다 — 이미지 자체는 96px 폭 그대로 남고 보이는 창만 줄어 좌측 큐브 심볼이 남는다. 아래 「접힘은
폭이다」가 말하는 `max-inline-size` 0 기법은 CTA 라벨 쪽 서술이고, 브랜드는 이 크롭을 쓴다. 폭 전환은
`width 320ms cubic-bezier(0.4, 0, 0.2, 1)`로 `motion-shell-collapse`와 같은 값이다.

**히트·정렬 폭은 크롭 폭과 다르다.** 접힌 레일에서 브랜드 자리의 정렬 폭은
`--app-gnb-sidebar-logo-symbol-w: 28px`이고 제품 주석이 「큐브 그림체보다 넓을 수 있음」을 명시한다.
23.72(그림) ≠ 28(자리)을 구분해 그린다 — 한 값으로 뭉치면 접힌 레일에서 로고가 아이콘 열과 어긋난다.

근거: `Gnb.tsx:2325`(`SIDEBAR_LOGO_H = 28`) · `Gnb.tsx:2326`·`brandLogoMetrics.ts:1-4`·`:10-12`(폭 산출) ·
`Gnb.tsx:2517`·`Gnb.tsx:4377`(렌더) · `globals.css:110`·`:118`·`:121` ·
`Gnb.tsx:1906`(접힘 정렬 폭 소비) · `Gnb.tsx:1821-1835`(크롭, 특히 `:1817`·`:1820`·`:1821`).

**CTA에는 아이콘이 없고 색은 반전 solid pill이다.** 처음에는 plus 글리프와 브랜드 파랑, 다음에는
mint 16%로 고쳤는데 셋 다 배포본에 없는 것이었다. 마크업은 라벨 `<span>` 하나뿐이고, 면과 글자는
테마를 따라 뒤집힌다 — 라이트 `#171b22` 위 `#f1f1f3`, 다크 `#f1f1f3` 위 `#171b22`.

mint를 두 번째로 틀린 이유가 중요하다. `sidebarUpgradeButton`은 실제로 mint 16%를 **선언한다.**
그런데 형제 상수 `sidebarUpgradeButtonActive`가
`html[data-theme=*] .gnb-sidebarUpgradeButton:not(&)`를 선언해 **비활성 버튼의 면과 글자를 덮는다.**
탐침이 그 형제 상수를 컴파일하지 않아, 제품 스타일시트에 있는 규칙이 측정 문서에는 없었다. 지금은
탐침이 읽은 제품 파일의 클래스를 전부 컴파일한다 — 형제가 겨누는 규칙도 함께 선다.

`aria-current="page"`면 한 단계 더 뒤집힌다(라이트 `#f1f1f3` 위 near-black, 다크 `#313640` 위
`#fafafa`). 그 상태는 "이 버튼의 목적지에 이미 와 있다"는 뜻이고, 선택을 `aria-current`가 소유하는
것은 `SidebarNavItem`과 같은 규칙이다.

**접히면 높이와 여백이 함께 줄어든다.** 40 → 32, 좌우 14 → 10, 상하 10 → 0, 간격 8 → 0. 폭만 줄이면
접힌 레일에서 버튼이 혼자 커 보인다.

**접힘은 폭이다.** 워드마크와 라벨의 `max-inline-size`가 0으로 줄어들며 잘린다 — 폭이 상태이므로
`layout-change` lifecycle이고([DS-D-0019](../governance/decisions/DS-D-0019-layout-change-motion.md))
값은 `motion-shell-collapse`(320ms)다. 캐러셀 점의 `motion-layout-change`(220ms)와 **곡선은 같고
지속만 다르다** — 제품 실측이 그렇고, 하나로 뭉치면 둘 중 하나가 틀린 값을 쓴다.

**접혀도 CTA 라벨은 보인다.** 폭을 0으로 만들어 완전히 지우고 있었는데 배포본은 54px까지 남기고
말줄임하며 글자도 caption으로 한 단계 줄인다. 아이콘이 없는 버튼이라 라벨을 지우면 접힌 레일에
아무 단서도 남지 않는다. 브랜드 워드마크는 마크가 남으므로 0으로 줄여도 단서가 있다 — 그래서 둘의
접힘이 다르다. 어느 쪽이든 **DOM에서 지우지는 않는다.** 지우면 접근 가능한 이름이 사라진다.

**접힘 상태는 소비처가 소유한다.** 셸이 접혔는지 아는 것은 셸이고 이 부품은 결과를 받는다.

## Accessibility

- **선택을 `aria-current="page"`가 소유한다.** 시각 전용 속성을 따로 두면 화면에는 선택으로 보이는데
  보조기술에는 아무것도 전달되지 않는 상태를 만들 수 있다.
- **접혀도 라벨이 DOM에 남는다.** 지우면 접기/펴기마다 접근성 이름이 사라졌다 나타나고, 스크린 리더
  사용자에게는 접힘이 보이지 않는 상태 변화가 된다. `clip-path`로 시각에서만 숨긴다.
- 아이콘은 `aria-hidden`이다. 라벨이 이름을 소유한다.
- **포커스 링이 실제로 그려진다.** 아래 Known deviations를 본다.

## Specification

| 축 | 값 | 토큰 |
| --- | ---: | --- |
| 행 높이 | 32px | `layout-control-height-md` |
| 아이콘–라벨 간격 | 제품 10px · DS 8px | 없음 — 제품 실측 (2026-08-21 조립 검증). DS는 `space-control-sm`이고 10은 계단에 없다(아래 편차) |
| 브랜드 행 → 목록 시작 | 32px | 없음 — 제품 `rail-below-chrome-gap` = (16−12)+20+8 |
| 활성 인디케이터 면 | 라이트 `#e4e5e9`(시프트 후) · 다크 `#313640` · 반경 10px | 없음 — 제품 실측 |
| 행 좌우 여백 | 4px | `space-control-xs` |
| 목록 행 간격 | 4px | `space-control-xs` — 배포본 실측 |
| 행 반경 | 10px | `radius-overlay-item` |
| 아이콘 | 20px | `icon-size-md` |
| 레일 패딩 | 12px 사방 | `space-control-md` — 배포본 실측(**하단도 12다**) |
| 상단 바 높이 | 40px — **아래 각주** | `layout-app-shell-top-bar-height` |
| 상단 바 좌우 여백 | 16px | `layout-app-shell-content-inset` |
| 상단 바 선행 슬롯 | 32px | `IconButton` sm이 들어가는 자리 |
| 상단 바 후행 슬롯 | 36px | `ProgressRing`이 아바타를 감싼 크기 |
| CTA 버튼 높이 | 40px → 접힘 32px | `layout-control-height-lg` → `-md` |
| CTA 좌우 여백 | 14px → 접힘 10px | 제품 실측 |
| CTA 반경 | 12px | `radius-control` |
| CTA 면 · 글자 | 반전 solid | `background-upgrade` · `foreground-upgrade` |

**상단 바 40px은 DS 계약이지 제품 실측이 아니다(2026-08-21 조립 검증).** 제품의 카드 안(in-panel)
바는 세로 패딩 8px에 가장 큰 자식이 프로필 링(36px)이라 **실효 높이 52px**이다. 토큰 40의 선정
근거(제품에 52/36/40 셋이 있고 정렬 주석이 40을 전제)는 유효하지만, **`/archive`를 40으로
조립하면 12px 어긋난다.** 제품 화면을 그릴 때는 52를 쓰고, DS 컴포넌트를 새로 세울 때 40을 쓴다.

위 「없음」 세 행은 **§10.1을 실제로 Figma에 조립하면서 이 문서만으로 부족했던 값**이다. 셋 다
`migration/`에는 있었지만 규범에 없어서 조립자가 제품 코드를 열어야 했다.
| CTA 현재 위치 | 한 단계 더 반전 | `background-upgrade-current` · `foreground-upgrade-current` |
| CTA 접힘 라벨 | 54px 말줄임 · 12px | 제품 실측 |
| 브랜드 좌측 여백 | 4px → 접힘 0 | `space-control-xs` |
| 상단 바 제목 | 16px | `typography-body-md-medium` |
| 상단 바 선행 슬롯 간격 | 4px | `space-control-xs` |

**행 좌우 여백이 4px인 근거.** 배포본은 `main-inline-padding − sidebar-padding-x` = 16 − 12 = 4를 쓴다.
행만 떼어 보면 좁지만 **행과 레일의 합이 계약이다** — 레일 12 + 행 4 = 16이 본문 좌측선과 맞는다.
여기를 8로 두면 아이콘이 본문보다 4px 안쪽으로 들어가고, 사이드바와 본문이 어긋난 것처럼 보인다.

**행 간격과 아이콘–라벨 간격은 다른 축이다.** 표의 「행 간격 8px · 배포본은 10이다」 행은
2026-08-30까지 아이콘–라벨 축(`.louis-sidebar-nav-item`의 `gap`)의 값과 편차 문구를 축 이름만
바꾼 채 달고 있었다. **목록의 행 간격은 4px이다** — 배포본 `Gnb.tsx:734`의 `[gap:4px]`이고
(≤719px도 `Gnb.tsx:721`에서 같은 4px), 브라우저 실측
`migration/product.sidebar-states.json`의 `sidebar.0.1.0`(목록 `ul`)이 `gap: 4px`다. 같은
스냅샷에서 아이콘–라벨을 감싸는 `sidebar.0.1.0.0.0.0.0`이 `gap: 10px`으로 따로 잡힌다. 두 축을
한 행에 묶어 두면 4를 8로 조립하게 된다.

**레일 패딩은 사방 12px이고 하단도 12다.** 배포본에서 레일은 `gnb-wrapper`와
`gnb-wrapperSidebar`를 함께 달고(`Gnb.tsx:4083`), 단축 `padding: 12px 24px`(`Gnb.tsx:2039`)가
먼저 네 변을 정한 뒤 `wrapperSidebar`가 위·좌·우만 다시 선언한다(`Gnb.tsx:2054-2056`).
**하단만 다시 선언되지 않는다** — 그래서 클래스 목록만 훑으면 「하단 0」으로 읽히는데, 단축이
이미 12를 넣어 두었으므로 실제 값은 12다. 브라우저 실측이 그것을 확인한다 —
`migration/product.sidebar-states.json`의 `sidebar` 노드가 `paddingTop`·`Right`·`Bottom`·`Left`
모두 `12px`다. 레시피 `.louis-app-shell__rail`의 `padding: var(--louis-space-control-md)`가 이
실측과 같으므로 **이 축은 편차가 아니다.** 데스크톱에서 CTA가 뷰포트 바닥에 붙어 보이는 것은
패딩이 0이어서가 아니라 `.louis-sidebar-cta`의 `margin-block-start: auto` 때문이다.

**브랜드 행은 40이고 그 안의 마크가 28이다.** 처음에는 행 자체를 24로 두었는데 그것은 아이콘 슬롯
크기(`icon-size-lg`)를 행 높이로 착각한 것이었다. 배포본의 사이드바 헤더 행은 `min-height: 40`이고
로고 레일이 `--app-gnb-sidebar-logo-h: 28`이다. 브랜드 행이 상단 바와 같은 40이라 좌우가 한 줄에서
만난다 — [DS-D-0018](../governance/decisions/DS-D-0018-app-shell-geometry.md)이 그 40을 소유한다.

**상단 바 높이가 40px인 근거.** 제품에는 세 값이 있고 서로 맞지 않는다 — portal 변종 52px,
fixed 변종 36px, 사이드바 헤더 행 `min-height: 40px`. `globals.css`의 주석이 정렬을 40px 전제로
계산하므로 **정렬의 기준이 40**이고 나머지 둘은 그 안에 담기는 내용의 결과다.
[DS-D-0018](../governance/decisions/DS-D-0018-app-shell-geometry.md)이 이 판정을 소유한다.

`layout-control-height-lg`가 같은 40px이지만 쓰지 않는다. 값이 같은 것과 의미가 같은 것은 별개이며,
버튼 높이를 바꾸는 날 상단 바가 같이 움직이면 안 된다.

**하이라이트 행의 trailing은 Badge가 아니다.** API 예시의 `trailing={<Badge>3</Badge>}`는 슬롯 자리를
보여 줄 뿐이고, 배포본이 그 자리에 다는 것은 「베타」/"BETA" 칩 하나다. 칩을 다는 행은 `/highlight`
**하나뿐**이다.

| 축 | 이 칩 | Badge |
| --- | ---: | ---: |
| 높이 | **24px**(3+18+3) | 26px(4+18+4) |
| 상하 여백 | **3px** | 4px |
| 좌우 여백 | 8px | 8px |
| 반경 | **6px** | 8px `radius-control-sm` |
| 타이포 | `type-caption-12-medium`(12/1.5) | 12/1.5 · **regular** |

Badge를 그대로 넣으면 32px 행 안에서 2px 높고 반경이 어긋나며 글자 굵기도 한 단계 얇아진다.
badge.md가 적은 제품 높이 분포(19·22·26)에 24가 없다는 것이 이 칩이 Badge 무리가 **아니라는** 증거다.

**두 테마가 서로 다른 축으로 면을 만든다.**

| | 글자 | 면 |
| --- | --- | --- |
| light | `--palette-gray-600`(앱 셸 램프 `#9aa0ab`) | `rgb(var(--palette-gray-500-rgb) / 12%)` = `rgb(188 192 201 / 12%)` |
| dark | `--palette-gray-400`(`#bcc0c9`) | `rgb(var(--gray-000-rgb) / 12%)` |

라이트는 **면 램프 500의 12%**, 다크는 **잉크의 12%**다. 한쪽 축으로 통일하면 다른 쪽이 사라지거나 뜬다.
라이트 값이 앱 셸 램프에서 나오므로 Known deviations의 `body:has(&)` 재매핑을 함께 읽어야 값이 맞는다.
배치는 `flex-shrink: 0` · 사이드바 안에서 `margin-left: auto`로 행 끝에 붙고 · 접힘에서 `display: none`과
`aria-hidden`이다.

근거: `Gnb.tsx:184-196`(칩) · `Gnb.tsx:4780-4788`(하이라이트 행에서만 렌더) · `globals.css:316-318` ·
`Gnb.tsx:2064`·`:2069` · `globals.css:33` · 문구 `ko.ts:1301`·`en.ts:1310`.

**상단 바 좌우 여백 16px은 카드 안 변종에 맞지 않는다.** 본문 카드 안에 놓이는 상단 바는 카드 안쪽
인셋을 음수 좌우 마진으로 상쇄해 **카드 모서리까지 풀블리드**하고, 자기 좌우 패딩은
`--mainchrome-pad-x: 8px`을 쓴다.

| 속성 | 값 |
| --- | --- |
| `--mainchrome-pad-x` | `8px` |
| `width` | `calc(100% + var(--mainchrome-bleed-left, var(--app-gnb-main-inline-padding)) + var(--mainchrome-bleed-right, var(--app-gnb-main-inline-padding)))` |
| `margin-left` / `margin-right` | 각 bleed 변수의 음수 |
| `padding` | `8px var(--mainchrome-pad-x)` → **8px 8px** |
| divider box-shadow | 켜지면 방향성 inset 헤어라인(`--louis-hairline-inset-block-end`)이 풀블리드 폭 전체를 가로지른다. border가 아니므로 레이아웃 높이를 늘리지 않는다([DS-D-0023](../governance/decisions/DS-D-0023-hairline-inset.md)) |

bleed 폴백은 좌우 모두 `--app-gnb-main-inline-padding`(16px)이고 짝 토큰
`--app-gnb-main-inline-padding-end`는 12px이다. 앱 셸 본문 카드 두 곳은 자기 카드의 좌우 패딩과 **같은
값**을 넣어 상쇄가 정확하다 — 앱 홈은 주입 없이 폴백 16/16으로 좌우 16 패딩을 상쇄하고, 마이페이지는
좌 16 · 우 12를 명시로 주입해 좌 16 · 우 12 패딩을 상쇄한다. **다만 상쇄가 언제나 정확하지는 않다** —
결제 상태 페이지들은 bleed를 24px로 주입해 두고 `≤900px`에서 카드 패딩만 16/12로 바꾸므로 그 구간에서는
bleed가 패딩보다 크다. 그 화면들은 이 문서의 범위 밖이다.

**그래서 데스크톱(≥720px)에서 바 콘텐츠와 본문이 좌측에서 8px 어긋난다.**

- 바의 배경·구분선은 **카드 폭 전체**를 가로지른다.
- 바 안 콘텐츠(선행 아이콘 · 제목 · 후행 슬롯)의 시작선 = 카드 가장자리 **+8px**.
- 같은 카드의 본문 시작선 = **+16px**(마이페이지 우측만 12px).
- Figma에서 헤더를 16px 인셋으로 그리면 배포본과 8px 틀리고, 구분선도 좌우로 각각 16px(마이페이지 우
  12px)씩 짧아진다.

**≤719px에서만 어긋남이 사라진다.** 이 폭에서 `--mainchrome-pad-x`가 `--app-gnb-main-inline-padding`으로
갈아타고 두 인셋 토큰이 **둘 다 16px**로 재정의되어 바 콘텐츠 시작선 = 본문 시작선 = 16px이 된다.
bleed와 음수 마진 자체는 이 폭에서도 계속 걸려 있으므로 배경·구분선은 여전히 풀블리드다. **세로
패딩은 폭과 무관하게 8px 고정**이고, 이것이 DS-D-0018이 적은 portal 변종 52px = 8+36+8의 그 8이다.

**16px 하나로 본문과 상단 바 두 자리를 겸하게 두지 않는다.** 위 표의
`layout-app-shell-content-inset`은 본문 인셋이고 카드 안 상단 바의 8px은 다른 축이다 — 이 편차를 계약
으로 승격하려면 별도 semantic token이 필요하다.

근거: `Gnb.tsx:459`·`:462`-`:465`·`:467`·`:469`·`:475`·`:476` ·
`globals.css:99`·`:108`·`:365-371` · `appHomeSceneStyles.ts:793`·`:805` ·
`myPageSceneStyles.ts:58`·`:59`·`:60` · 반례 `mypage/topup/success/page.tsx:60-62`·`:63`·`:64`·`:66`.

## Effects

| 부품 | 값 | 토큰 |
| --- | --- | --- |
| SidebarCta 버튼 | 안쪽 1px 링 + 얕은 드롭 | `elevation-upgrade` |

"없다"고 적어 두었는데 그것은 사유가 아니라 누락의 결과 서술이었다. 배포본의 업그레이드 버튼에는
실제로 그림자가 그려진다 — 반전 pill이 사이드바 면에서 떨어져 보이게 하는 일을 한다. 라이트는
안쪽 링이 흰색 8%, 다크는 검정 8%로 뒤집힌다.

**드롭은 `0 1px 2px` 검정이고 알파가 테마마다 다르다 — 라이트 4% · 다크 12%다.** 2026-08-30까지
`elevation-upgrade`의 라이트 알파가 6%였는데 배포본에 6%는 없다(`Gnb.tsx:1979` 라이트 4% ·
`Gnb.tsx:1984` 다크 12%). 6은 기록된 편차가 아니라 실측 오차였고, 토큰을 4%로 내려 맞췄다.
**제품 화면은 이 수정으로 움직이지 않는다** — 배포본은 두 테마 모두 utilities 레이어에서 같은
축을 다시 선언해 컴포넌트 레이어의 이 값을 덮는다. 움직이는 것은 LOUIS 자신의 소비처
(`packages/css/src/component/app-shell.css`의 `.louis-sidebar-cta__button`)와 Figma effect
style이다.

내비 항목과 상단 바에는 없다. 그 둘은 사이드바 면 위에 그대로 놓인다.

## Implementation

- 선택 면을 **항목이 직접 갖는다.** 제품은 두 메커니즘을 쓴다 — 표준 사이드바는 형제로 놓인
  절대배치 span이 면을 그리고 항목은 투명하며, admin 사이드바는 항목이 직접 갖는다. 결과 색은
  같고 이동 애니메이션 유무만 다르다. 인디케이터를 형제로 두면 항목 하나를 다른 곳에 옮겨 놓을 수
  없고, 이동 애니메이션은 rail composition이 원할 때 얹을 수 있다.
- TopBar의 경계선이 기본이 아닌 이유는 제품의 것이 **스크롤 진행률에 따라 색이 연속으로 변하는
  런타임 계약**이기 때문이다. rAF로 매 프레임 값을 쓰므로 컴포넌트가 소유할 수 없다.

  소유하지 못한다고 값을 모르는 것은 아니다. 옮길 때 지어내지 않도록 적어 둔다
  (2026-08-21 실측, `useMainChromeHeaderScrollProgress.ts`).

  | 변수 | 식 | 폴백 | 소비처 |
  | --- | --- | --- | --- |
  | `--mainchrome-divider-progress` | `scrollTop <= 0 ? 0 : min(1, scrollTop / 12)` | 없음 | 경계선 (`Gnb.tsx:470` · `473`) |
  | `--header-progress` | `clamp(0, scrollTop / 120, 1)` | `0` | 아래 참조 |

  **12px에서 경계선이 완전히 나타난다.** 0에서만 0이고 그 위는 즉시 램프에 올라탄다 —
  「스크롤이 있으면 선이 있다」에 가깝지 페이드가 길지 않다.

  **`--mainchrome-divider-progress`의 폴백은 「없음」이 아니라 `1`이다(위 표 정정).** 소비처가
  `var(--mainchrome-divider-progress, 1)`로 읽으므로 **진행값을 주입하지 않는 화면은 스크롤 0에서도
  경계선이 100%로 그려진다.** 진행값을 주입하는 것은 훅을 부르는 세 화면뿐이다
  (`AppHomeScene.tsx:221` · `HighlightScene.tsx:184` · `CanvasHomeScene.tsx:727`).

  그래서 Properties의 `divider` 기본 `false`와 Acceptance test 8은 **제품 기본과 반대다.** Figma로
  옮길 때 그 세 화면 밖의 기본 프레임은 **경계선 있음**으로 그린다 — `divider`를 끈 상태를 기본으로
  그리면 대부분의 화면이 배포본과 다르다.

  | AppTopBar 경계선 | 값 | 근거 |
  | --- | --- | --- |
  | 주입 있음 · `scrollTop = 0` | 경계선 없음(알파 0%) | `useMainChromeHeaderScrollProgress.ts:34-37` |
  | 주입 있음 · `scrollTop ≥ 12px` | 100% — 라이트 `--palette-gray-200`, 그 밖 `rgb(var(--gray-000-rgb) / 8%)`를 `color-mix`로 보간 | `Gnb.tsx:470` · `:473` |
  | 주입 **없음**(그 밖의 화면) | 정지 상태에서도 100% | 폴백 `1` |
  | 전환 | `border-bottom-color 120ms ease` | `Gnb.tsx:471` |

  **이 표는 `Gnb.tsx`가 소유한 스크롤 진행률 구현을 그대로 인용한 것이라 LOUIS 소스가 손댈 수 없다.**
  LOUIS 자체 `data-divider` 레시피는 이제 `border-bottom`이 아니라 방향성 inset 헤어라인
  (`--louis-hairline-inset-block-end`)이고 전환도 없다 — 위 `border-bottom-color` 전환은 여전히
  제품의 별도 런타임 계약을 가리키며, `Gnb.tsx`가 같은 box-shadow/색 전환으로 옮겨가면 이 표도
  다시 실측해야 한다([DS-D-0023](../governance/decisions/DS-D-0023-hairline-inset.md)).

  **`--header-progress`는 지금 아무 화면도 켜지 않는다(주의).** 상수 이름과 JSDoc은 「워드마크 축소
  등 헤더 collapse」라고 말하지만 **그런 소비처가 배포본에 없다.** 실제 소비처는 형태 B 패널의
  상단 페이드 6곳뿐인데(3파일), 훅이 이 변수를 `<main>`에 쓰고 페이드는 **그 부모인 패널**의
  `::before`에 있다. 커스텀 프로퍼티는 위로 상속되지 않으므로 페이드는 언제나 폴백 `0`을 읽는다.
  게다가 그 3파일 중 훅을 호출하는 것은 하나뿐이다. **상단 페이드를 켜진 상태로 그리지 마라.**

## Known deviations

- **라이트에서 hover 면이 갈린다.** 제품은 재매핑된 `palette-gray-300`을 50%로 덮고(브라우저 실측
  `rgb(228 229 233 / 0.5)`), DS는 `color-accent-ghost-hover`의 잉크 8%를 쓴다. 면 계열에 매는 것과
  잉크에 매는 것의 차이이며, 그 토큰을 SelectableListRow와 공유하므로 사이드바 하나 때문에 옮기지
  않는다. **다크는 `rgb(250 250 250 / 0.1)`로 정확히 같다.**
- **사이드바가 화면에 있으면 라이트 팔레트가 통째로 한 단계 밝아진다.** 배포본의 `wrapperSidebar`가
  `html[data-theme=light] body:has(&)`로 `--palette-gray-*`를 재매핑한다. 그래서 업그레이드 CTA의
  라이트 전경이 `neutral.100`이 아니라 `neutral.50`이다 — 탐침이 그 표식을 두지 않았을 때 한 단계
  어두운 값을 재고 있었다.
- **제품의 사이드바 항목에는 포커스 표시가 없다.** `globals.css`의
  `button:focus, button:focus-visible { outline: none }`이 `@layer base` 블록 **밖**에 있어
  `@layer utilities` 안의 Tailwind 임의 유틸리티를 특이도와 무관하게 이긴다. 항목이 선언한
  `[&:focus-visible]:[outline:2px_...]` 세 줄이 전부 사문이고, 앱 셸 소비처 25곳이 모두 `<button>`
  분기를 타므로 **키보드 사용자가 지금 어디에 있는지 알 수 없다.** 그 구조는 옮기지 않았고
  테스트가 링이 실제로 그려지는지 확인한다.
- **목적지가 있으면 링크다.** 제품의 앱 셸 소비처 25곳이 전부 `onNavigate`를 넘겨 `<button>`
  분기를 타는데, 그 결과 새 탭·링크 복사·미들클릭이 죽는다. 라우터 가로채기는 호출부가 `onClick`에서
  한다.
- **셸 composition이 없다.** rail·drawer·scroll root·safe area는 패턴이 기술하지만 구현이 없다.
  이 둘은 그 안에 놓일 조각이며, 그 자체로는 셸을 만들지 못한다.
- **Figma의 접힘에는 라벨이 없다.** 코드는 `clip-path`로 시각에서만 숨기는데 Figma에 그 표현이
  없어 노드를 뺐다. 접근성 이름이 유지되는지는 코드 테스트가 본다.
- **사이드바 토글 아이콘이 제품과 다르다.** 배포본은 전용 토글 글리프를 쓰는데 카탈로그에 없어
  `arrows-left-right`로 대신한다. 아이콘 자산이 서면 바꾼다.
- **compact 드로어의 layer 자리가 사다리에 없다.** 제품의 드로어(1400)와 scrim(1399)은 프로필
  popover(1100)보다 위인데 DS 사다리는 `sticky < popover`다. 드로어는 composition의 일부이며 그때
  판정한다.
- **아이콘–라벨 간격이 8과 10으로 갈린다.** 배포본은 10이고(`Gnb.tsx:636`의
  `gnb-menuLinkInner` `gap:10px`) 레시피 `.louis-sidebar-nav-item`은 `space-control-sm` 8을 쓴다.
  10은 DS 간격 계단(4·8·12·16)에 없고 SelectableListRow와 같은 판단을 한다 — 한 컴포넌트를 위해
  계단을 늘리지 않는다. 위 Specification의 「아래 편차」가 가리키는 것이 이 항목이다. **목록의 행
  간격(4px)과 헷갈리지 않는다** — 그 축은 편차가 아니라 제품과 같다.
- **레일이 면을 갖는지가 갈린다.** 레시피 `.louis-app-shell__rail`은
  `background-color: var(--louis-color-bg-surface)`를 칠하는데, 배포본의 데스크톱 레일은
  **투명하다**(`Gnb.tsx:2040` `[background:transparent]`, 브라우저 실측
  `migration/product.sidebar-states.json`의 `sidebar` 노드 `backgroundColor: rgba(0, 0, 0, 0)`).
  제품에서 레일은 셸 바닥 위에 그대로 얹히고 밝은 면은 본문 카드 쪽이며, 면을 칠하는 선언은
  ≤719px 드로어에만 있다(`Gnb.tsx:2099-2100`). **값을 지금 걷어내지 않는 이유가 있다** — 레시피의
  ≤719px 블록에는 면 선언이 따로 없어서 base에서 빼면 드로어가 scrim 위에서 비친다. 드로어 면을
  제품처럼 칠하려면 라이트에서 `#eeeef1`이 필요한데 그 값에 이름이 없다(아래). 그 토큰이 서는 날
  base의 면을 걷고 드로어 블록으로 옮긴다.
- **시프트된 라이트 램프의 셸 바닥 `#eeeef1`에 토큰이 없다.** 위 「라이트 팔레트가 한 단계
  밝아진다」의 결과로 배포본 셸 바닥과 ≤719px 드로어 면이 `#eeeef1`이 되는데, LOUIS primitive
  램프에 그 값이 없다(`packages/css/generated/tokens.css`에 `#eeeef1`(238 238 241)이 0건이고,
  이웃 계단은 `palette-gray-100` `#f1f1f3`과 `palette-gray-150` `#eaebee`다). 그래서 Figma는 이
  면을 변수 없이 raw hex로 그린다. 선택지는 둘이다 — primitive를 세우거나, `.louis-app-shell`의 면을 `bg-canvas`가 아닌 셸
  전용 역할 토큰으로 가르거나. **어느 쪽도 토큰 계약을 바꾸므로 소유자 판정이 남아 있다.**

## Acceptance tests

1. 행과 상단 바의 높이·여백·간격·반경·아이콘 크기가 `components.measured.json`과 같다.
2. **포커스 링이 실제로 그려지고** 두께와 색이 토큰에서 온다.
3. `current`가 `aria-current="page"`가 되고 면·글자가 states 표와 같다.
4. 접혀도 라벨이 DOM에 남고 `display: none`이 아니며, trailing은 사라진다.
5. `href`가 있으면 `<a>`, 없으면 `<button>`이다.
6. 아이콘이 `aria-hidden="true"`다.
7. TopBar의 제목이 남는 자리를 먹고 한 줄로 잘린다.
8. `divider`는 켤 때만 그려진다.
9. `.louis-layer-sticky`의 `z-index`가 `layer-sticky` 토큰에서 온다.
