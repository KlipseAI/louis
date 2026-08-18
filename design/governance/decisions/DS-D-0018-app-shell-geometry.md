---
id: decision-app-shell-geometry
status: experimental
authority: normative
---

# DS-D-0018 앱 셸의 실제 치수에 이름을 준다

- Status: proposed
- Date: 2026-08-17
- Owners: repository owner, token maintainer
- Affects: `layout-app-shell-sidebar-minimum`(breaking rename), 앱 셸 토큰 3종(additive), `.kds-layer-sticky`, SidebarNavItem·AppTopBar

## Context

`layout-app-shell-*` 넷은 **소비처가 0**이고, 실측해 보니 넷 중 둘만 제품과 맞는다.

| 토큰 | 값 | 제품 | 판정 |
| --- | ---: | --- | --- |
| `content-inset` | 16px | `--app-gnb-main-inline-padding` 16px | **맞다** |
| `sidebar-padding` | 12px | `--app-gnb-sidebar-padding-x` 12px | **맞다** |
| `outer-gap` | 12px | 제품에 12px 관계가 **셋**이고 compact에서 갈라진다 | 부분 |
| `sidebar-minimum` | 120px | **사이드바가 아니다** | 틀렸다 |

**`sidebar-minimum`이 이름 함정이다.** 제품에서 120px이 나오는 유일한 자리는
`--app-gnb-sidebar-width: min(280px, calc(100vw - 120px))`의 **빼는 값**, 즉 사이드바가 아니라
**본문에 남겨 두는 최소 공간**이다. 모바일 드로어는 같은 자리에 40px을 쓴다. 실제 사이드바 폭은
펼침 280px · 접힘 56px · compact 0px 셋인데 **어느 것도 120px이 아니고 셋 다 토큰이 없다.**

`migration/token-mapping.md`에 이 토큰의 매핑 행이 **없다** — 출처 없이 생긴 토큰이다.
`radius-card`·`elevation-focus-ring`과 같은 종류이며, 다음 사람이
`inline-size: max(var(--kds-layout-app-shell-sidebar-minimum), …)`이라고 쓰면 제품에 존재한 적 없는
120px 사이드바가 생긴다.

**정작 필요한 값이 없다.** 사이드바 펼침 280 · 접힘 56 · 상단 크롬 행 40 셋이 토큰에 없어
SidebarNavItem과 AppTopBar를 지을 수 없다.

## Decision

1. **`layout-app-shell-sidebar-minimum` → `layout-app-shell-content-reserve`.** 값 120px은 그대로다.
   이름이 "본문에 남기는 최소 공간"이라는 실제 뜻을 말한다.
2. **`layout-app-shell-sidebar-width` 280px** 신설. 사이드바 펼침 폭.
3. **`layout-app-shell-sidebar-collapsed` 56px** 신설. 접힘 폭.
4. **`layout-app-shell-top-bar-height` 40px** 신설. 상단 크롬 행 높이.
5. **`.kds-layer-sticky` 유틸리티**를 `base.css`에 추가한다. 토큰은 있는데 쓸 클래스가 없어
   셸을 짓는 사람이 숫자를 쓰게 되어 있었다.

280과 56은 primitive spacing에 없으므로 함께 세운다(`spacing.280`, `spacing.56`).

## 상단 바 높이가 40px인 근거

제품에는 세 값이 있고 서로 맞지 않는다 — portal 변종 52px(8+36+8), fixed 변종 36px, 사이드바 헤더
행 `min-height: 40px`. **40을 고른다.** `globals.css`의 주석이 `--app-gnb-sidebar-align-main-margin-top`을
40px 전제로 계산하고 있어 **정렬의 기준이 40**이며, 나머지 둘은 그 안에 담기는 내용의 결과다.

**`layout-control-height-md`(40px)를 쓰지 않는다.** 값이 같지만 뜻이 다르다 — 버튼 높이를 바꾸는 날
상단 바가 같이 움직이면 안 된다. `migration/token-mapping.md`가 이미 "값이 같은 것과 의미가 같은
것은 별개다"를 규범으로 적어 두었다.

## `outer-gap`은 손대지 않는다

제품의 12px 관계 셋(rail-below-chrome-gap · rail-padding-bottom · main-inline-padding-end)이
compact에서 16/12/0으로 갈라지므로 하나의 토큰으로 표현되지 않는다.
`migration/token-mapping.md`가 정확히 이 합침을 금지한다. **셸 composition을 실제로 지을 때** 셋으로
가를지 판정하며, 지금은 소비처가 없으므로 미룬다.

## Consequences

- `sidebar-minimum`이 사라지므로 **breaking**이다. 소비처가 0이라 코드 영향은 없고 Figma 변수
  이름만 바뀐다. DS-GOV-001 절차를 적용한다.
- 소비처 0인 semantic 토큰 41개 중 앱 셸 몫 넷이 실제 소비처를 갖게 된다.
- `layer-sticky`가 쓸 수 있는 형태가 된다.

## 남는 문제 — compact 드로어의 layer

제품의 드로어(1400)와 scrim(1399)은 프로필 popover(1100)보다 **위**인데, DS 사다리
(`content < sticky < popover < modal < critical`)에는 그 자리가 없다. 드로어를 `sticky`에 두면 열린
popover에 가린다. **이 결정은 드로어를 다루지 않는다** — 드로어는 App Shell composition의 일부이며
그것을 지을 때 사다리에 자리를 추가할지 판정한다.

## Rollback

세 토큰과 두 primitive를 지우고 `content-reserve`를 `sidebar-minimum`으로 되돌린다.
`.kds-layer-sticky` 규칙 세 줄을 뺀다.

## Acceptance tests

1. `layout-app-shell-sidebar-width` 280px, `-sidebar-collapsed` 56px, `-top-bar-height` 40px가
   생성된다.
2. `layout-app-shell-sidebar-minimum`이 더 이상 생성되지 않고 `-content-reserve`가 그 자리를 갖는다.
3. `.kds-layer-sticky`의 `z-index`가 `layer-sticky` 토큰에서 온다.
4. `diff-tokens.mjs`가 removal 1 · additive 5로 분류하고 baseline 갱신 후 통과한다.
