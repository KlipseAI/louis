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
  보관함
</SidebarNavItem>

<SidebarNavItem href="/highlight" icon={<IconGraph />} trailing={<Badge>3</Badge>} collapsed>
  하이라이트
</SidebarNavItem>

<AppTopBar
  leading={<IconButton label="사이드바 접기" onClick={toggle}><IconSidebar /></IconButton>}
  title="보관함"
  trailing={profileTrigger}
/>
```

## Anatomy

**SidebarNavItem** — Icon · Label · Trailing.
**AppTopBar** — Leading · Title · Trailing.

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
| Default | 투명, `color-foreground-secondary` |
| Hover | `color-action-ghost-hover`, `color-foreground-primary` |
| Current | `color-background-inset`, `color-foreground-primary` |
| Focus visible | 공유 focus ring |

AppTopBar는 상태 축이 **없다.** 대화형이 아니고 안의 슬롯이 자기 상태를 갖는다.

## Interaction and responsive behavior

- 라벨은 한 줄로 잘린다. rail 폭이 고정이라 줄바꿈하면 행 높이가 흔들린다.
- 접힘에서 라벨이 시각에서만 숨고 아이콘이 가운데 정렬된다.
- TopBar의 제목이 남는 자리를 먹고 한 줄로 잘린다. 양옆 슬롯은 자기 크기를 갖는다.

## Content

- 라벨은 **화면의 이름**이다. "보관함"이지 "보관함으로 이동"이 아니다.
- TopBar의 제목은 현재 위치를 말한다. 브레드크럼이 필요하면 `title` 자리에 넣는다 — 이 컴포넌트가
  브레드크럼 구조를 소유하지 않는다.

## Sidebar brand와 CTA

사이드바는 내비 항목만으로 성립하지 않는다. 배포본은 **맨 위에 브랜드 행**, **맨 아래에 업그레이드
CTA**를 갖는다. 그 둘이 없어서 한 번 조립한 홈 템플릿을 내렸다(2026-08-18).

| 부품 | 계약 |
| --- | --- |
| `SidebarBrand` | 행 최소 높이 `layout-app-shell-top-bar-height`(40) · 마크 레일 `layout-app-shell-brand-mark-height`(28) · 워드마크 최대 폭 240 |
| `SidebarCta` | `margin-block-start: auto`로 바닥에 붙는다 · 버튼 최소 높이 `layout-control-height-md` · **아이콘 슬롯이 없다** |

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
| 행 높이 | 32px | `layout-control-height-sm` |
| 행 좌우 여백 | 4px | `space-control-xs` |
| 행 간격 | 8px | `space-control-sm` — 배포본은 10이다(아래 편차) |
| 행 반경 | 10px | `radius-overlay-item` |
| 아이콘 | 20px | `icon-size-md` |
| 상단 바 높이 | 40px | `layout-app-shell-top-bar-height` |
| 상단 바 좌우 여백 | 16px | `layout-app-shell-content-inset` |
| CTA 버튼 높이 | 40px → 접힘 32px | `layout-control-height-md` → `-sm` |
| CTA 좌우 여백 | 14px → 접힘 10px | 제품 실측 |
| CTA 반경 | 12px | `radius-control` |
| CTA 면 · 글자 | 반전 solid | `background-upgrade` · `foreground-upgrade` |
| CTA 현재 위치 | 한 단계 더 반전 | `background-upgrade-current` · `foreground-upgrade-current` |
| CTA 접힘 라벨 | 54px 말줄임 · 12px | 제품 실측 |
| 브랜드 좌측 여백 | 4px → 접힘 0 | `space-control-xs` |
| 상단 바 제목 | 16px | `typography-body-md-medium` |
| 상단 바 선행 슬롯 간격 | 4px | `space-control-xs` |

**행 좌우 여백이 4px인 근거.** 배포본은 `main-inline-padding − sidebar-padding-x` = 16 − 12 = 4를 쓴다.
행만 떼어 보면 좁지만 **행과 레일의 합이 계약이다** — 레일 12 + 행 4 = 16이 본문 좌측선과 맞는다.
여기를 8로 두면 아이콘이 본문보다 4px 안쪽으로 들어가고, 사이드바와 본문이 어긋난 것처럼 보인다.

**브랜드 행은 40이고 그 안의 마크가 28이다.** 처음에는 행 자체를 24로 두었는데 그것은 아이콘 슬롯
크기(`icon-size-lg`)를 행 높이로 착각한 것이었다. 배포본의 사이드바 헤더 행은 `min-height: 40`이고
로고 레일이 `--app-gnb-sidebar-logo-h: 28`이다. 브랜드 행이 상단 바와 같은 40이라 좌우가 한 줄에서
만난다 — [DS-D-0018](../governance/decisions/DS-D-0018-app-shell-geometry.md)이 그 40을 소유한다.

**상단 바 높이가 40px인 근거.** 제품에는 세 값이 있고 서로 맞지 않는다 — portal 변종 52px,
fixed 변종 36px, 사이드바 헤더 행 `min-height: 40px`. `globals.css`의 주석이 정렬을 40px 전제로
계산하므로 **정렬의 기준이 40**이고 나머지 둘은 그 안에 담기는 내용의 결과다.
[DS-D-0018](../governance/decisions/DS-D-0018-app-shell-geometry.md)이 이 판정을 소유한다.

`layout-control-height-md`가 같은 40px이지만 쓰지 않는다. 값이 같은 것과 의미가 같은 것은 별개이며,
버튼 높이를 바꾸는 날 상단 바가 같이 움직이면 안 된다.

## Effects

없다.

## Implementation

- 선택 면을 **항목이 직접 갖는다.** 제품은 두 메커니즘을 쓴다 — 표준 사이드바는 형제로 놓인
  절대배치 span이 면을 그리고 항목은 투명하며, admin 사이드바는 항목이 직접 갖는다. 결과 색은
  같고 이동 애니메이션 유무만 다르다. 인디케이터를 형제로 두면 항목 하나를 다른 곳에 옮겨 놓을 수
  없고, 이동 애니메이션은 rail composition이 원할 때 얹을 수 있다.
- TopBar의 경계선이 기본이 아닌 이유는 제품의 것이 **스크롤 진행률에 따라 색이 연속으로 변하는
  런타임 계약**이기 때문이다. rAF로 매 프레임 값을 쓰므로 컴포넌트가 소유할 수 없다.

## Known deviations

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
- **compact 드로어의 layer 자리가 사다리에 없다.** 제품의 드로어(1400)와 scrim(1399)은 프로필
  popover(1100)보다 위인데 DS 사다리는 `sticky < popover`다. 드로어는 composition의 일부이며 그때
  판정한다.

## Acceptance tests

1. 행과 상단 바의 높이·여백·간격·반경·아이콘 크기가 `components.measured.json`과 같다.
2. **포커스 링이 실제로 그려지고** 두께와 색이 토큰에서 온다.
3. `current`가 `aria-current="page"`가 되고 면·글자가 states 표와 같다.
4. 접혀도 라벨이 DOM에 남고 `display: none`이 아니며, trailing은 사라진다.
5. `href`가 있으면 `<a>`, 없으면 `<button>`이다.
6. 아이콘이 `aria-hidden="true"`다.
7. TopBar의 제목이 남는 자리를 먹고 한 줄로 잘린다.
8. `divider`는 켤 때만 그려진다.
9. `.kds-layer-sticky`의 `z-index`가 `layer-sticky` 토큰에서 온다.
