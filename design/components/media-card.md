---
id: media-card
status: experimental
authority: normative
summary: 사진이 배경을 채우고 그 위에 유리 배지와 흐린 정보 바를 얹는 정사각 미디어 카드입니다.
---

# Media Card

미디어가 주인공이고 그 위에 이름 한 줄이 얹히는 카드다. 랜딩의 캐러셀 둘(최신 AI 모델 · 그 외
기능)과 템플릿 그리드가 **같은 카드**를 쓴다.

**정본은 제품이고 LOUIS 레시피가 그것을 옮긴다(2026-10-14, [DS-D-0099](../governance/decisions/DS-D-0099-figma-partials-close.md)).** `MediaCard.tsx` 가 구현이고
`packages/css/src/component/media-card.css` 가 그 일곱 상수(BOX · CARD · BADGE · INFO · NAME_ROW · NAME · SUB)를 옮긴 레시피다.
React 표면은 없다 — 소비처가 클래스를 물면 되는 자리다. Figma 는 그 구현을 투영한 것이다.

```html
<article class="louis-media-card" data-layout="carousel">
  <img class="louis-media-card__media" src="…" alt="…">
  <span class="louis-media-card__badge">New</span>
  <div class="louis-media-card__info">
    <div class="louis-media-card__name-row"><svg class="louis-media-card__glyph" aria-hidden="true">…</svg><span class="louis-media-card__title">ElevenLabs</span></div>
    <p class="louis-media-card__description">Music &amp; Effects</p>
  </div>
</article>
```

**정보 바는 점진 블러다.** 아래는 온전히 흐리고 위로 갈수록 흐림이 걷힌다. 곡선과 반경의 정본은
[Project Card](./project-card.md) 의 제목 띠와 **같은 것**이고, `packages/css/src/base.css` 의
`--louis-progressive-blur` · `--louis-progressive-blur-mask` 가 그 한 벌을 소유한다. 두 카드가
그것을 참조한다.

전에는 균일 `blur(20px)` 이었고 「위쪽 padding 40 이 흐린 영역을 글자 위로 넓혀 대비를 만든다」가
그 조형의 설명이었다. **그 판단이 소유자 의도와 달랐다** — 균일 흐림은 띠의 윗변이 사진 위에
직선으로 남아 유리판을 올린 자국이 보인다. 소유자 확인(2026-08-27)으로 정본을 하나로 합쳤다.
그라디언트 스크림(사진 위에 검정을 까는 것)으로 바꾼 것은 **아니다** — 다루는 것은 여전히 색이
아니라 흐림의 세기다.

**색이 테마를 따르지 않는다.** 사진 위에 놓이는 전경은 두 테마에서 같아야 읽힌다. 그래서
`media-foreground-dark` 와 `static-white-alpha/*` 를 쓰고 `gray-*` 램프를 쓰지 않는다.

**빈 캔버스의 시작 카드는 이 카드가 아니다 — 별도 부품 [Start Card](./start-card.md) 로 세웠다(소유자 결정 2026-10-07).** 제품 빈 캔버스의
생성 카드는 위쪽 점진 블러 + 위쪽 이름 + `<button>` 이라 정사각 · 아래 띠 · 상태 없는 `<article>` 인 이 카드와 기하와 역할이 다르다.
재료(점진 블러 마스크 `progressive-blur-mask-block-start`)만 공유하고 변형 축은 열지 않았다.

## Availability

| Surface       | 상태           | 근거                                                                                                                                                                    |
| ------------- | -------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Web           | `partial`      | CSS recipe `packages/css/src/component/media-card.css`(박스 `data-layout` · 배지 · 정보 바 · 이름 줄 · 설명). React 표면은 없다 — 소비처가 클래스를 물면 되는 자리다. 정보 바의 점진 블러(반경 + 마스크 곡선)는 `base.css` 가 발행하고 레시피와 제품이 그것을 참조한다. 실브라우저 시험 `packages/react/test/media-card.browser.test.tsx` |
| Figma         | `done`         | `MediaCard` 단일 COMPONENT · TEXT 3(`Title` · `DescriptionLabel` · `BadgeLabel`) · BOOLEAN 3(`Icon` · `Description` · `Badge`) · INSTANCE_SWAP 1. parity 게이트가 effect 두 겹 · 속성 · raw fill·stroke 0 · 기하(카드 폭 · 높이 · 반경 · 배지 · 정보 바 항목)를 `figma/components.measured.json` 의 `media-card` 와 맞대고, `media-card.browser.test.tsx` 가 레시피가 같은 값을 만드는지 되잰다 — 두 방향이 다 걸려 DS-D-0035 를 채운다(2026-10-14) |
| Documentation | `done`         | 이 문서                                                                                                                                                                 |
| Maturity      | `experimental` | React 표면이 없고 사진 위 대비를 고정해 잴 수 없다(Accessibility) |

## When to use

- 사진·영상 썸네일이 카드 면 전체를 채우고 그 위에 이름 한 줄이 얹히는 자리. 랜딩의 모델
  캐러셀 · 기능 캐러셀 · 템플릿 그리드 세 곳이 전부 그것이다.
- 쓰지 않는 자리:
  - **프로젝트 썸네일** — [Project Card](./project-card.md) 다. 면이 테마를 따르고 조작 메뉴를 갖는다.
  - **가로 폭을 다 쓰는 홍보 배너** — [Banner Carousel](./banner-carousel.md) 이다.
  - **재생이 목적인 자리** — [Video Player](./video-player.md) 다. 이 카드는 컨트롤을 갖지 않는다.

## Anatomy

1. **Box** — 바깥 상자. 카드 안쪽과 완전히 분리돼 있고 **박스만** 두 벌이다(아래 Variants).
2. **Media** — 사진. 카드를 꽉 채우고(`object-cover`) 카드가 `overflow: hidden` 으로 자른다.
3. **Badge**(선택) — 좌상단 유리 알약. 흰색 20% + 배경 흐림 10.
4. **Info bar** — 하단의 흐린 띠. 흐림은 띠 자체가 아니라 그 아래 깔리는 **한 층**(`::before`)이
   칠한다 — 마스크는 요소와 자손 전부에 걸리므로 띠에 얹으면 글자까지 함께 지워진다. 위쪽
   padding 40 은 그 마스크가 흐림을 죽일 활주로다.
   1. **Name row** — 브랜드 글리프(선택) + 이름.
   2. **Description**(선택) — 한 줄 설명.

Figma 에는 여기에 **`TopBar` 프레임이 하나 더 있다.** 제품은 배지를 `absolute` 로 놓고 Figma 는
auto-layout 프레임으로 감쌌다 — 결과 위치는 같고 구조가 다르다(Known deviations 6).

## Properties

정본은 제품 컴포넌트의 prop 이다. LOUIS 표면이 없으므로 대조할 `.d.ts` 가 없고, parity 계약도
`figmaAhead` 로 그 사실을 적어 둔다.

| prop | 값 | 기본 | 뜻 |
| --- | --- | --- | --- |
| `image` | 경로 | 없음 | 카드를 채우는 사진. `object-cover` 로 잘린다 |
| `alt` | 문구 | 없음 | 사진의 대체 텍스트. **필수다** |
| `badge` | 문구 \| 없음 | 없음 | 좌상단 알약. 없으면 알약 자체가 렌더되지 않는다 |
| `icon` | 노드 \| 없음 | 없음 | 브랜드 글리프. 시안이 단색 실루엣이라 `currentColor` SVG 를 받는다 |
| `name` | 문구 | 없음 | 이름 한 줄. 카드에서 유일한 필수 글자다 |
| `sub` | 문구 \| 없음 | 없음 | 설명 한 줄 |
| `layout` | `carousel` \| `grid` | `carousel` | 바깥 상자만 바꾼다. 아래 Variants |
| `sizes` | 문구 \| 없음 | `316px` | `next/image` 의 `sizes`. **`grid` 에서는 반드시 넘긴다** — 칸에 따라 폭이 달라진다 |

Figma 의 축·슬롯은 이것과 이렇게 대응한다.

| Figma | 타입 | 코드 대응 |
| --- | --- | --- |
| `Badge` | BOOLEAN | `badge` prop 의 유무 |
| `BadgeLabel` | TEXT | `badge` 의 문구(`New` · `Top` 등 — 낱말은 Content 가 갖는다) |
| `Title` | TEXT | `name` |
| `Description` | BOOLEAN | `sub` 의 유무 |
| `DescriptionLabel` | TEXT | `sub` 의 문구 |
| `Icon` | BOOLEAN | `icon` 의 유무 |
| `Glyph` | INSTANCE_SWAP | `icon` 이 무엇인지 |

## Variants, sizes, and states

**축은 박스 하나뿐이고 그것은 Figma 에 없다.**

| 축 | 값 | 무엇이 바뀌나 |
| --- | --- | --- |
| `layout` (코드) | `carousel` | 960 이상 316 × 316 · 959 이하 `min(316px, 46vw)` 정사각 · 트랙 안에서 줄지 않음(`flex-none`) · `scroll-snap-align: start` |
| | `grid` | 칸이 폭을 정한다(`w-full aspect-square`) · 스냅 없음 |

카드 **안쪽**(배지 · 정보 바 · 이름 · 부제)은 두 쓰임이 완전히 같다. 전에는 템플릿 그리드가 같은
조형을 따로 다시 짰고, 그 대가로 정본이 둘이 되어 실제로 값이 갈라졌다 — 유리 배지의 흰색 20%
를 한쪽은 토큰으로, 다른 쪽은 리터럴로 받았다. 폭을 prop 으로 뚫는 대신 **박스만 축으로 갈라**
안쪽을 한 벌로 남겼다.

## States

시각 상태가 **없다.** hover · focus · pressed · disabled 선언이 제품 구현에 하나도 없고 Figma
에도 `State` 축이 없다.

| 상태 | 무엇이 바뀌나 |
| --- | --- |
| 기본 | 하나뿐이다 |
| hover | **없다.** 카드 자체는 반응하지 않는다 — 캐러셀의 스크롤과 화살표가 상호작용을 갖는다 |
| focus | **없다.** 카드가 `<article>` 이고 포커스를 받지 않는다 |
| 로딩 | **없다.** 사진 로딩은 `next/image` 가 처리하고 자리표시자를 그리지 않는다 |

카드를 누를 수 있게 만들려면 상태 계약부터 정해야 한다 — 지금 구조에 링크를 씌우면 포커스
표시가 없는 클릭 타깃이 생긴다(Accessibility 참조).

## Interaction and responsive behavior

- **캐러셀 분기에만 스냅이 붙는다.** `scroll-snap-align: start` 가 `carousel` 박스에만 있어
  캐러셀 전용 성질이 그리드로 새지 않는다.
- **캐러셀 박스는 959 이하에서 화면을 따라 줄어든다**(소유자 요청). `min(316px, 46vw)` 정사각이다 —
  한 화면에 카드가 최소 둘 보이고 다음 장이 조금 비치도록 고른 비율이다(제품 주석: 375 화면에서
  46vw × 2 + 6 = 351, 남는 24 가 다음 장의 미리보기). 687 위에서는 46vw 가 316 을 넘으므로 316 이
  상한이다. 960 이상에서는 316 그대로다.
- **그리드 분기는 칸이 폭을 정한다.** `w-full aspect-square` 라 좁아지면 그대로 줄어들고
  정사각 비율만 지킨다. 1400 폭에서 한 칸이 345.5 다.
- 정보 바의 아래 모서리에는 반경을 걸지 않는다. `backdrop-filter` 가 조상의 `overflow: hidden`
  클립을 못 받는다는 기록이 제품 저장소에 있고 Project Card 의 LOUIS recipe 는 그 사유로 아래 두
  모서리를 직접 깎는데, **현재 Chromium 에서는 그 사유가 재현되지 않는다.** 2026-08-27 헤드리스
  실측: 조상 `overflow: hidden` + 반경 12 안에서 둥근 모서리 **바깥** 픽셀의 줄무늬 대비가 흐림
  없는 대조군 56.7 에 대해 56.6(흐림을 요소에) · 56.6(`::before` 에) · 56.8(거기에 반경까지)
  이었다. 조상 클립이 듣는다. 라이브러리인 LOUIS 는 소비처가 자를 것을 가정할 수 없어 반경을
  자족으로 남기고, 제품 카드는 바로 위에서 자르므로 걸지 않는다.
- 배지와 정보 바가 둘 다 `backdrop-filter` 를 쓴다. **반경은 이제 둘 다 10**(`blur/surface`)이고,
  두 층을 가르는 것은 반경이 아니라 **마스크의 유무**다 — 배지는 균일하게 흐리고, 정보 바는
  아래에서 위로 흐림이 죽는다.

## Content

- **이름은 한 줄이다.** 줄바꿈을 전제하지 않는다 — 정보 바 높이는 내용이 정하므로(481 이상에서
  이름 한 줄 + 설명 한 줄일 때 111) 두 줄이 되면 바가 자란다. 480 이하에서는 카드가 작아지는 만큼
  이름(`body-20` → `body-16` 크기)과 설명(`body-14` → `caption-12` 크기)을 한 단 낮춰 캡션이 카드를
  덮지 않게 한다.
- 배지 문구는 **짧은 표식**이다(`New` · `Top`). 문장을 넣지 않는다.
- 설명은 카테고리·용도 한 마디다(`Music & Effects`).
- **`alt` 는 비울 수 없다.** 사진이 카드의 내용이고 장식이 아니다.

| | KO | EN | JA |
| --- | --- | --- | --- |
| 배지 | `신규` | `New` | `新着` |
| 이름 | `ElevenLabs` | `ElevenLabs` | `ElevenLabs` |
| 설명 | `음악 · 효과음` | `Music & Effects` | `音楽・効果音` |

## Accessibility

- 카드는 `<article>` 이다. 목록 안에서 항목의 경계를 알려 준다.
- **사진에 `alt` 가 필수다.** 카드의 이름이 사진 밖에 글자로 있으므로 `alt` 는 사진 자체를
  설명한다 — 이름을 그대로 복사하면 스크린리더가 같은 말을 두 번 읽는다.
- 글리프는 장식이며 이름이 옆에 글자로 있다.
- **대비.** 이름은 `media-foreground-dark`(#fafafa) 를 흐린 사진 위에 놓고, 설명은 그 72% 다(2026-10-07 부터 `color-media-foreground-dark-soft`, [색과 테마](../foundations/color-theme.md)).
  바탕이 사진이라 대비를 고정할 수 없고 흐림 20 이 그 편차를 줄이는 장치다. **측정된 대비값이
  없다** — 사진마다 다르므로 SC 1.4.3 을 이 컴포넌트만으로 판정할 수 없다. 결손으로 적어 둔다.
- 포커스·키보드 계약이 없다. 지금은 카드가 상호작용 요소가 아니라서 성립하지만, 카드를 누를 수
  있게 만드는 순간 포커스 표시가 필요하다.
- 모션 없음 — `prefers-reduced-motion` 계약이 필요 없다.

## Specification

| Part | 값 | 토큰·근거 |
| --- | --- | --- |
| Box (`carousel`) | 316 × 316(960 이상) · 959 이하 `min(316px, 46vw)` 정사각 | 316 은 시안 값을 고른 **리터럴**이고 46vw 는 「한 화면에 둘 + 다음 장 미리보기」로 고른 비율이다. 대응 spacing 토큰이 없다(Known deviations 4) · `media-card.sizes.base` |
| Box (`grid`) | 폭 100%, 정사각 | 칸이 정한다 |
| Card | radius 12, `overflow: hidden` | `radius/12` |
| Badge | 좌·상 16, 안쪽 4 / 2, radius 999 | `spacing` 2px 그리드(`left-8 top-8` · `px-2 py-1`) |
| Badge 면 | 흰색 20% + 배경 흐림 10 | `color/static-white-alpha/20` · `blur/surface`(=10) |
| Badge 글자 | caption-12-regular | `typography/caption-regular` · `color/media-foreground-dark` |
| Badge 높이 | 22 | 12 × 1.5 = 18, + 세로 안쪽 2 × 2 |
| Info bar | 좌우 16 · 아래 16 · **위 40** · 간격 4 | 위 40 이 마스크의 활주로다(아래 주) |
| Info bar 면 | 흰색 저알파 tint + **점진 배경 흐림** | Figma 는 `color/static-white-alpha/04`, 제품은 1%(Known deviations 2) |
| Info bar 흐림 | 반경 10, 마스크로 아래→위 감쇠 | `blur/surface` · 곡선은 `--louis-progressive-blur-mask` |
| Info bar 마스크 | 바닥에서 0~55% 온전 · 70% 80% · 85% 40% · 100% 0 | `figma/components.measured.json` 의 `project-card.overlayMaskStops` 가 표를 소유한다 |
| Info bar 높이 | 내용이 정한다 — 481 이상에서 이름 · 설명이 한 줄이면 111 | `infoPaddingBlockStart` 40 + `titleLineHeight` 30 + `infoGap` 4 + `descriptionLineHeight` 21 + `infoPaddingBlockEnd` 16. 480 이하는 글자가 한 단 낮아져 함께 낮아진다 |
| Name row | 높이 30, 간격 8 | 20 × 1.5 = 30 |
| Name | body-20-medium | `typography/body-lg-medium` · `color/media-foreground-dark` |
| Description | body-14-regular, 알파 72% | `typography/body-sm-regular` · `color/media-foreground-dark-soft`(= `media-foreground-dark` 72%, 2026-10-14 Figma 도 이 변수에 묶였다) |
| Glyph | 16 × 16 | `icon` 슬롯 |

**위 padding 40 은 이제 마스크의 상수다.** 띠 111 에서 글자 윗변은 바닥에서 71(=64%) 에 있고
마스크가 그 자리에 남기는 흐림이 약 0.88 이다. 40 을 16 으로 줄이면 띠가 87 이 되어 같은 글자
윗변이 82% 로 올라가고 흐림이 0.5 밖에 남지 않는다 — 이름이 사진 위에서 읽히지 않는다. 값이
바뀐 것이 아니라 **하는 일이 바뀌었다**(흐린 영역 확보 → 감쇠 구간 확보).

## Known deviations

1. **정보 바 높이가 시안과 다르다 — 111 대 98/94.** 시안은 모델명 줄 높이를 120% / 100% 로
   갈라 두 값을 냈는데, 제품 타입 스케일은 `body-20` 도 `body-14` 도 줄 높이 150% 다. 그래서
   40 + 30 + 4 + 21 + 16 = **111** 로 하나로 수렴시켰다. 시안 두 값 중 어느 쪽도 재현하지 않는다.
2. **정보 바 tint — 레시피는 제품 1%, Figma 는 `static-white-alpha/04`(2026-10-14 판정, [DS-D-0099](../governance/decisions/DS-D-0099-figma-partials-close.md)).** 제품은
   흰색 1% 이고 [색과 테마](../foundations/color-theme.md) 「블러 표면의 tint 알파는 램프 단계가 아니다」가 그 값을 정본 예외로
   세웠다 — 레시피는 `color-mix(media-foreground-dark 1%)` 로 그대로 갖는다. Figma 는 변수 알파가 `paint.opacity` 를 덮어 1% 를
   담을 칸이 없어 가장 가까운 램프 단계 04 에 남는다(Figma 면이 제품보다 밝다, 4% 대 1%). 램프에 01 을 더하는 안은 「02 · 03 도」가
   열려 거절했다.
3. **Figma 의 progressive 램프가 CSS 마스크 곡선과 정확히 같지 않다 — 근사다.**
   먼저 **해소된 것**: 정보 바의 흐림 반경이 리터럴 20 이던 자리가 `blur/surface`(10) 로
   내려왔다. blur 토큰에 20 이 없어 이름을 못 갖던 값이 사라졌으므로 「토큰을 하나 더 세울지」는
   더 물을 필요가 없다.

   남는 차이는 **두 매체가 감쇠를 표현하는 방식**이다.

   - CSS 는 `blur(10)` 을 온전히 칠한 층의 **알파**를 마스크로 깎는다. 정지점이 넷이라 곡선이
     꺾인다: 바닥에서 55% 까지 1.0, 70% 에 0.8, 85% 에 0.4, 100% 에 0.
   - Figma 는 두 점 사이에서 **반경 자체**를 0 → 10 으로 **직선** 보간한다. 꺾을 방법이 없다.

   같은 두 점(위 끝 0, 바닥에서 55% 지점 온전)을 쓰므로 양 끝은 일치하고 **중간이 갈린다.**
   Figma 의 직선을 CSS 정지점 자리에서 읽으면 바닥에서 70% 에서 0.667(CSS 0.8, **−13.3pt**),
   85% 에서 0.333(CSS 0.4, **−6.7pt**) 이다. 부호가 한쪽이라 Figma 쪽이 그 구간에서 조금 더
   빨리 걷힌다. 더해서 「알파 0.4 의 blur(10) 층」과 「blur(4)」는 원리가 달라 같은 픽셀을 내지
   않는다 — 수치 차이보다 이쪽이 근본이다. Figma 가 꺾인 램프를 지원하기 전에는 좁힐 수 없다.
4. **카드 폭 316 이 리터럴이다.** 토큰 전수에서 값이 316 인 변수가 없다 — 시안 값을 고른 것이다
   (2px 격자에는 떨어진다, 316 = 2 × 158). 959 이하의 `min(316px, 46vw)` 도 같은 리터럴을 상한으로 쓴다.
5. ~~**`Badge` 축은 폐기 판정을 받았고 Figma 재작업이 남아 있다.**~~ **2026-10-14 해소([DS-D-0099](../governance/decisions/DS-D-0099-figma-partials-close.md)).** VARIANT 3값
   (`New` · `Top` · `none`)을 `Badge` BOOLEAN + `BadgeLabel` TEXT 로 접어 변형이 3 → 1 이 됐다(§2 시험 4 — 값이 내용이었다).
   기존 인스턴스 다섯(「작업 · 시안」)은 새 컴포넌트로 바꿔 끼우고 문구 · 이름 · 설명을 옮겼다. 컴포넌트가 다시 서서 노드 id 가 바뀌었다.
6. **`TopBar` 층이 제품에 없다 — 정본은 제품의 절대 배치다(2026-10-14 판정, DS-D-0099).** 제품은 배지를 `absolute left-8 top-8`
   로 놓고 레시피도 카드 모서리에서 16 에 `absolute` 로 놓는다. Figma 의 높이 54 · 안쪽 16 오토레이아웃은 같은 자리를 만드는
   투영으로 남는다 — 계약이 그 인셋을 기록의 `badgeInset` 으로 맞대고 시험이 레시피에서 같은 16 을 잰다.
7. **`layout` 축이 Figma 에 없다.** 제품은 `carousel` · `grid` 두 박스를 갖는데 Figma 는 316
   고정 하나다(960 이상의 캐러셀 박스). 캐러셀 박스도 959 이하에서는 화면을 따라 줄어든다. 그리드 쪽 폭은 칸이 정하므로 고정 폭 variant 로 그리면 어떤 폭을 골라도
   거짓이 된다 — Dialog 의 `fullscreen` 을 뺀 것과 같은 이유다. 그래서 **의도적으로 비웠고**,
   대신 이 문서가 그 축을 소유한다.
8. ~~**기하는 한 방향으로만 대조된다.**~~ **2026-10-14 해소.** 레시피가 서고 `media-card.browser.test.tsx` 가 기록
   `media-card.sizes.base` 의 항목(카드 316 · 배지 22 · 정보 바의 위 40 · 아래 16 · 간격 4 · 줄 높이 30 · 21 · 배지 인셋 16 …)을
   레시피에서 되잰다.

## Acceptance tests

1. 카드가 정사각이고 radius 12 이며 사진이 모서리에서 잘린다.
2. `carousel` 박스만 `scroll-snap-align: start` 를 갖는다. `grid` 박스에는 없다.
3. 481 이상에서 이름 · 설명이 한 줄일 때 정보 바가 `media-card.sizes.base` 의 항별 값으로 선다 —
   위 `infoPaddingBlockStart` 40 · 이름 행 `titleLineHeight` 30 · `infoGap` 4 · 설명
   `descriptionLineHeight` 21 · 아래 `infoPaddingBlockEnd` 16(합 111). 높이 하나가 아니라 항별로 잰다.
4. 정보 바의 흐림이 **띠가 아니라 그 아래 한 층에** 있고, 그 층이 마스크로 아래→위 감쇠한다.
   띠 자체에 마스크가 걸려 글자가 함께 지워지면 실패다.
5. 배지와 정보 바의 흐림 반경이 **둘 다 `blur/surface`(10)** 다. 둘을 가르는 것은 마스크의
   유무이지 반경이 아니다.
6. 이름·설명·배지 글자가 모두 `media-foreground-dark` 에서 오고 `gray-*` 램프를 쓰지 않는다.
7. Figma 되읽기에서 raw fill · raw stroke · 스타일 없는 텍스트가 각각 0 이다.
8. 사진에 `alt` 가 있고 이름과 같은 문구가 아니다.
9. 캐러셀 박스가 960 이상에서 316 × 316, 959 이하에서 `min(316px, 46vw)` 정사각이다.

`packages/react/test/media-card.browser.test.tsx` 가 레시피에서 1 · 2 · 3 · 4 · 5 · 6 · 8 · 9 를 잰다(9 는 375 · 800 폭). 7 은
`verify-figma-parity` 가 Figma 쪽에서 잰다.

## Migration and changelog

새로 선 컴포넌트다. 이전 API 가 없다. 2026-10-14 LOUIS recipe 가 섰다 — 이 문서의 Specification 은 레시피와 같은 값을
적는다(DS-D-0099). 같은 날 Figma `Badge` 축이 BOOLEAN + TEXT 로 접혔다.

**2026-08-27 — 정보 바가 균일 `blur(20)` 에서 점진 블러로 바뀌었다.** Project Card 의 제목 띠와
같은 레시피이고 반경이 10 으로 내려간다. 사용자가 보는 변화이므로 아래 셋이 함께 움직였다:
`base.css` 가 곡선과 반경을 값으로 발행 · 제품 `MediaCard.tsx` 의 정보 바가 `::before` 로 갈라져
그것을 참조 · Figma `MediaCard` 의 InfoBar effect 가 `BACKGROUND_BLUR PROGRESSIVE` 로 교체. 사용자 영향 변경은 [Updates](../updates/README.md) 에 적는다.
