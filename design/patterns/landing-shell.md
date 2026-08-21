---
id: landing-shell
status: experimental
authority: normative
---

# Landing Shell

Landing Shell은 로그인 전 마케팅 화면의 껍데기다 — 홈 · 가격 · 탐색 · 블로그 · 문서 · 템플릿 ·
법적 고지가 이 하나를 공유한다.

**App Shell과 정반대 모델이다.** 앱 셸은 레일이 자리를 예약하고 본문이 그만큼 밀리지만, 랜딩
헤더는 **자리를 예약하지 않고 콘텐츠 위에 뜬다.** 두 셸을 같은 규칙으로 그리면 랜딩 첫 화면의
윗부분이 헤더에 가려지거나, 반대로 없는 여백이 생긴다.

값은 배포본 인용이며 아직 DS 토큰이 아니다. 간격 환산 기준은 제품의 `--spacing: 2px`다 —
`h-14`는 56px이 아니라 **28px**이다.

## Anatomy

| 부품 | 역할 |
| --- | --- |
| Blur plate | 헤더 뒤에 깔리는 **고정 120px** 흐림 판. 스크림 없이 글자 가독성을 만든다 |
| Header wrapper | `position: fixed` 투명 껍데기. 패딩만 갖는다 |
| Nav rail | 3열 그리드 — 로고 / 가운데 메뉴 / 우측 액션 |
| Menu list | 가운데 앵커 링크. **720px 미만에서 사라진다** |
| Actions | 언어 글로브 · 상단 CTA · 햄버거 |
| Fullscreen menu | 720px 미만 전용. `<nav>`의 자식이며 `z-index: -1`이다 |

**스크림이 없다.** 헤더는 배경이 `transparent`이고 가독성은 전적으로 blur plate가 만든다.
헤더에 반투명 면을 깔면 배포본과 다르다.

## Layout contract

| 축 | 값 |
| --- | --- |
| 헤더 | `position: fixed` · `top: 0` · `left: 0` · `width: 100%` · `background: transparent` |
| 헤더 패딩 | `12px 12px 12px 20px` · **≤450px** `12px 16px` |
| 레일 | `display: grid` · `grid-template-columns: 1fr auto 1fr` · `align-items: center` · `min-height: 24px` |
| 레일 전환 | `color 320ms ease` |
| 레일 (≤719px) | `grid-template-columns: 1fr auto` — **가운데 열이 소멸한다** |
| 1열 로고 | `justify-self: start` · 높이 24px · 폭 `calc(24px × 291 / 85)` = 82.16px |
| 2열 메뉴 | `justify-self: center` · `flex` · `gap: 16px` · **≤719px `display: none`** |
| 3열 액션 | `justify-self: end` · `inline-flex` · `gap: 8px` |
| 메뉴 링크 | 높이 `28px` · `padding-inline: 12px` · `border-radius: 999px` · 면 `transparent` |
| 메뉴 링크 전환 | `color 320ms ease, opacity 200ms ease` |

**헤더가 점유하는 높이는 48px이지만(12 + 24 + 12) 본문에서 예약되지 않는다.** 첫 섹션은 헤더
아래에서 시작하지 않고 **헤더 밑을 지나간다.** 앱 셸의 「레일이 자리를 예약한다」를 여기 적용하면
첫 화면의 구도가 통째로 달라진다.

근거: `landing/navigation/Gnb.tsx:70-75`(헤더) · `:78-82`(레일) · `:105-108`(로고) ·
`:116-119`(메뉴) · `:121-129`(메뉴 링크) · `tailwind.css:164`(간격 기준).

## Blur plate

랜딩 헤더가 가독성을 얻는 **유일한** 장치다. 헤더의 형제이고 한 층 아래에 깔린다.

| 축 | 값 |
| --- | --- |
| 배치 | `position: fixed` · `top/left/right: 0` · `height: **120px**` (고정) |
| 층 | `z-index: 1000` — 헤더(1001) 바로 아래 |
| 포인터 | `pointer-events: none` |
| 흐림 | `backdrop-filter: blur(12px)` |
| 마스크 | `linear-gradient(to bottom, rgb(0 0 0) 40%, rgb(0 0 0 / 0%) 100%)` — **2스톱** |
| 접두사 | 표준과 `-webkit-`를 **둘 다** 내보낸다 |
| DOM | `<div aria-hidden="true">` 하나. 자식이 없다 |

**120px은 헤더 점유 높이(48px)의 2.5배이고 뷰포트에 비례하지 않는다.** 마스크는 위에서 40%까지
완전 불투명이고 거기서 아래로 선형 감쇠한다.

**배너 캐러셀의 값을 여기 쓰지 마라.** 그쪽은 `blur(22px) saturate(125%)`에 5스톱 마스크라 흐림이
두 배 가깝게 짙고 감쇠 곡선이 다르다.

근거: `landing/navigation/Gnb.tsx:63-68` · `:700`.

## Tone inversion

랜딩 헤더는 **자기 밑을 지나는 섹션의 밝기에 따라 다섯 가지를 한 덩어리로 뒤집는다.** 이것을
모르면 밝은 섹션 위에서 헤더 글자가 사라진다.

### 켜지는 조건

`isCapabilitiesTheme || lightSurface || (mobileOpen && 다크 테마가 아님)`

- `lightSurface`는 밝은 배경 페이지에서 **prop으로 영구 고정**된다 — 스크롤과 무관하다.
- 다크 테마의 모바일 메뉴는 **제외**다. 메뉴 면이 어두우므로 헤더는 밝게 남는다.

### 감지선

`IntersectionObserver`가 `rootMargin: -3% 0px -96% 0px`로 **뷰포트 상단 3~4% 구간의 가로 띠**만
남긴다 — 고정 헤더가 실제로 덮는 자리다. 스크롤 중 reflow를 만들지 않으려고 관찰자로만 판정한다.

대상은 밝은 섹션 **7개**(`overview` · `capabilities` · `video-editor` · `highlight` · `pricing` ·
`faq` · `final-cta`)이고 다크 섹션(히어로 · 쇼케이스)은 제외다. **띠에 닿은 밝은 섹션이 하나라도
있으면 켜진다.**

예외가 하나 있다 — `#overview`는 병합 애니메이션이 대기 상태인 동안 밝은 섹션에서 빠진다.
그래서 그 상태 속성을 함께 감시해 재평가한다.

### 뒤집히는 다섯

| 부품 | 꺼짐 (어두운 섹션 위) | 켜짐 (밝은 섹션 위) |
| --- | --- | --- |
| 레일 전경 | `--gray-000` — 헤더 안에서 `#fafafa`로 복구 | `--gray-900` |
| 로고 자산 | `klipse-dark.svg` | `klipse-light.svg` |
| 메뉴 링크 | `gray-000` · 비활성 `opacity .7` / hover `.9` | `gray-900` · 비활성 `.5` / hover `.7` |
| 상단 CTA | 면 `--gray-000` · 글자 `gray-900` | 면 `--gray-900` · 글자 `gray-100` |
| 햄버거 | `gray-000` | `gray-900` |

활성 링크는 **양쪽 모두 불투명 1**이다. 전환은 레일·햄버거가 `color 320ms ease`, 로고가
`filter 320ms ease`다.

**헤더 안에서 `--gray-000`을 팔레트 값으로 되돌린다.** 시맨틱 램프는 테마에서 뒤집히는데 랜딩
헤더는 섹션 밝기로 판정하므로, 두 축이 겹치면 어두운 섹션 위에서 글자가 검게 나온다.

근거: `landing/navigation/Gnb.tsx:86-103` · `:370-375` · `:399-400` · `:611` · `:622-627` ·
`:653-657` · `:666-672` · `:702` · `:706-710` · `:131-151` · `:246-248` · `:259-260`.

## Layer order

**랜딩 GNB는 semantic layer를 쓰지 않고 실수를 직접 쓴다.** [Elevation & Layer](../foundations/elevation-layer.md)가
금지한 「공용 순서 사이의 임의 숫자」에 해당하므로 **부채로 기록한다.** 다만 화면을 그리려면 실제
순서를 알아야 한다.

| 층 | 값 | 비고 |
| --- | ---: | --- |
| 드롭다운 패널 (body portal) | **2000** | **인라인 style**이 클래스의 `z-20`을 이긴다 |
| 헤더 | 1001 | |
| Blur plate | 1000 | |
| `<nav>` | 2 | `position: relative` — 여기서 stacking context가 생긴다 |
| 풀스크린 모바일 메뉴 | **−1** | `<nav>`의 **자식**이다 |

### 음수 오버레이 관용구

모바일 메뉴는 `position: fixed; inset: 0; z-index: -1`이면서 `<nav>`의 자식이다. `<nav>`가
`relative` + `z-index: 2`로 자체 stacking context를 만들기 때문에 **`z: -1`이 밖으로 새지 않고
nav의 배경 층에 갇힌다.**

그 결과 **nav의 다른 자식인 로고와 햄버거가 메뉴 위에 남아 계속 눌린다** — 그것이 유일한 닫기
수단이다. 오버레이가 포인터를 가로채지 않는다는 점에서 규범을 만족시키지만, **방식이 규범이
기술한 것과 다르다.**

**판정이 필요하다.** 이 관용구를 `layer-*`의 대응 항목으로 인정할지, 부채로 보고 오버레이를 위로
올린 뒤 별도 닫기 버튼을 두게 할지. 정하지 않으면 화면을 조립할 때마다 다시 발명된다.

근거: `landing/navigation/Gnb.tsx:64` · `:71` · `:79` · `:162` · `:164` · `:288` · `:796` · `:906`.

## Compact behavior

720px 미만에서만 나타난다.

| 축 | 값 |
| --- | --- |
| 표면 | 기본 `display: none` → **≤719px `display: block`** |
| 전환 | `opacity 220ms ease` |
| 닫힘 | `opacity: 0` · `pointer-events: none` |
| 열림 | `opacity: 1` · `pointer-events: auto` |
| 안쪽 | `height: 100%` · `flex column` · `gap: 2px` |
| 안쪽 패딩 | `78px 18px calc(28px + env(safe-area-inset-bottom, 0px))` |
| 스크롤 | `overflow-y: auto` |
| 면 | `--palette-gray-100` (다크 `--palette-gray-900`) |
| 테두리 · 곡률 | `none` · `0` |
| 흐림 | **없다.** 불투명 100%다 |

**메뉴는 슬라이드하지 않는다 — 불투명도만 바뀐다.** 앱 셸의 드로어(`transform` 320ms)와 다르다.
상단 패딩 78px이 헤더 자리를 비운다.

근거: `landing/navigation/Gnb.tsx:287-303`.

## 아직 토큰이 없는 축

아래는 KDS가 값을 주지 못한다. **지어내지 말고 제품을 인용한다.**

| 축 | 값 | 근거 |
| --- | --- | --- |
| blur plate 높이 | `120px` | `landing/navigation/Gnb.tsx:64` |
| blur plate 흐림 | `blur(12px)` | `:65` |
| blur plate 마스크 | 2스톱 `40% → 100%` | `:66-67` |
| 헤더 패딩 | `12px 12px 12px 20px` (≤450px `12px 16px`) | `:72` · `:74` |
| 톤 전환 길이 | `320ms ease` | `:80` |
| 감지 띠 | `rootMargin: -3% 0px -96% 0px` | `:653-657` |

**흐림 12px은 DS의 blur primitive에 없다** — 현재 10px·12px 중 12px과 값이 같지만, 이 자리는
`backdrop-filter`이고 DS 쪽은 표면 흐림이라 같은 축인지 판정이 필요하다.

## Accessibility

- blur plate는 `aria-hidden="true"`이며 포인터를 받지 않는다.
- 가운데 메뉴는 720px 미만에서 DOM에서 사라진다(`display: none`) — 접힘이 아니라 **소거**다.
  앱 셸이 「이름은 남긴다」로 처리하는 것과 다르다.
- 모바일 메뉴가 열려 있을 때 로고와 햄버거가 계속 도달 가능하다. **닫기 버튼이 따로 없다.**

## Acceptance tests

1. 헤더가 본문 자리를 예약하지 않는다 — 첫 섹션이 헤더 밑을 지나간다.
2. blur plate가 120px 고정이고 뷰포트 높이에 비례하지 않는다.
3. 밝은 섹션이 상단 띠에 닿으면 다섯 부품이 **함께** 뒤집힌다. 하나만 뒤집히지 않는다.
4. `lightSurface` 페이지에서는 스크롤과 무관하게 켜진 상태로 고정된다.
5. 720px 미만에서 가운데 메뉴가 DOM에서 사라지고 레일이 2열이 된다.
6. 모바일 메뉴가 열려도 로고·햄버거가 눌린다.
7. 드롭다운 패널이 헤더 위에 그려진다 — 인라인 층이 클래스를 이긴다.

## Pre-implementation blockers

- **음수 오버레이 관용구의 판정**(위 Layer order). 인정할지 부채로 볼지 정해야 한다.
- **blur plate가 `backdrop-filter` 축인지 표면 흐림 축인지.** DS의 blur primitive와 같은 축이면
  토큰을 공유하고, 아니면 별도 축을 세운다.
- **톤 반전을 mode로 볼 것인가.** 라이트/다크 mode와 직교하는 **세 번째 축**이다 —
  [Color & Theme](../foundations/color-theme.md)의 mode 계약은 이 축을 모른다.

## 승격 조건

- 위 세 blocker가 닫힌다.
- blur plate · 헤더 패딩 · 톤 전환 길이가 semantic token으로 선다.
- 그 전까지 이 문서의 값은 **제품 인용**이며 DS 계약이 아니다.
