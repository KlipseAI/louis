---
id: media-card
status: experimental
authority: normative
summary: 사진이 배경을 채우고 그 위에 유리 배지와 흐린 정보 바를 얹는 정사각 미디어 카드입니다.
---

# Media Card

미디어가 주인공이고 그 위에 이름 한 줄이 얹히는 카드다. 랜딩의 캐러셀 둘(최신 AI 모델 · 그 외
기능)과 템플릿 그리드가 **같은 카드**를 쓴다.

**정본은 제품이다.** `MediaCard.tsx` 가 구현이고 LOUIS 에는 아직 표면이 없다 —
`packages/css/src/component` 에 `media-card.css` 가 없고 `packages/react/src` 에도 디렉터리가
없다. Figma 는 그 제품 구현을 투영한 것이고, 이 문서는 그 둘을 처음으로 대조한다.

**정보 바는 그라디언트 스크림이 아니다.** 흰색 저알파 면 + `backdrop-filter: blur(20px)` 이고,
위쪽 padding 40 이 흐린 영역을 글자 위로 더 확보해 사진과의 대비를 만든다. 그라디언트로 바꾸면
사진이 밝을 때 글자가 묻힌다 — 이 결정이 이 컴포넌트의 조형 전부다.

**색이 테마를 따르지 않는다.** 사진 위에 놓이는 전경은 두 테마에서 같아야 읽힌다. 그래서
`media-foreground-dark` 와 `static-white-alpha/*` 를 쓰고 `gray-*` 램프를 쓰지 않는다.

## Availability

| Surface       | 상태           | 근거                                                                                                                                                                    |
| ------------- | -------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Web           | `not-ready`    | 제품 구현이 정본이고 소비처가 세 자리다. **LOUIS 표면은 0** — CSS 레시피도 React export 도 없고 acceptance test 도 0건이다                                              |
| Figma         | `partial`      | `MediaCard` 3 variant(`Badge`) · TEXT 2 · BOOLEAN 2 · INSTANCE_SWAP 1. parity 게이트가 대조하는 것은 effect 두 겹 · 속성 축 · raw fill·stroke 0 셋이다. **기하는 대조하지 않는다** — `figma/components.measured.json` 에 `media-card` 항목이 없다 |
| Documentation | `done`         | 이 문서                                                                                                                                                                 |
| Maturity      | `experimental` | 되읽기와 문서가 방금 처음 섰다. LOUIS recipe 가 서고 기하 실측이 붙으면 승격한다                                                                                        |

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
4. **Info bar** — 하단의 흐린 띠. 위쪽 padding 40 이 흐림 영역을 넓힌다.
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
| `Badge` | VARIANT `New` · `Top` · `none` | `badge` prop 의 유무 + 그 문구. **축과 대응이 1:1 이 아니다**(Known deviations 5) |
| `Title` | TEXT | `name` |
| `Description` | BOOLEAN | `sub` 의 유무 |
| `DescriptionLabel` | TEXT | `sub` 의 문구 |
| `Icon` | BOOLEAN | `icon` 의 유무 |
| `Glyph` | INSTANCE_SWAP | `icon` 이 무엇인지 |

## Variants, sizes, and states

**축은 박스 하나뿐이고 그것은 Figma 에 없다.**

| 축 | 값 | 무엇이 바뀌나 |
| --- | --- | --- |
| `layout` (코드) | `carousel` | 폭 316 고정 · 줄어들지 않음 · `scroll-snap-align: start` |
| | `grid` | 칸이 폭을 정한다(`w-full aspect-square`) · 스냅 없음 |
| `Badge` (Figma) | `New` · `Top` · `none` | 알약의 유무와 그 문구 |

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
- **그리드 분기는 칸이 폭을 정한다.** `w-full aspect-square` 라 좁아지면 그대로 줄어들고
  정사각 비율만 지킨다. 1400 폭에서 한 칸이 345.5 다.
- 정보 바의 아래 모서리에는 반경을 걸지 않는다. `backdrop-filter` 가 조상의 `overflow: hidden`
  클립을 못 받는다는 기록이 제품 저장소에 있으나 현재 Chromium 에서 이 구조
  (카드 `relative` + `overflow` + 반경, 바 `absolute` + `z-index`)는 정상 클립된다.
- 배지와 정보 바가 둘 다 `backdrop-filter` 를 쓴다. 흐림 반경이 서로 다르고(10 · 20) 그것이
  두 층의 위계다 — 배지는 사진을 살짝 흐리고, 정보 바는 글자가 얹힐 만큼 흐린다.

## Content

- **이름은 한 줄이다.** 줄바꿈을 전제하지 않는다 — 정보 바 높이(111)가 이름 한 줄 + 설명 한
  줄로 계산돼 있어 두 줄이 되면 바가 자란다.
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
- **대비.** 이름은 `media-foreground-dark`(#fafafa) 를 흐린 사진 위에 놓고, 설명은 그 72% 다.
  바탕이 사진이라 대비를 고정할 수 없고 흐림 20 이 그 편차를 줄이는 장치다. **측정된 대비값이
  없다** — 사진마다 다르므로 SC 1.4.3 을 이 컴포넌트만으로 판정할 수 없다. 결손으로 적어 둔다.
- 포커스·키보드 계약이 없다. 지금은 카드가 상호작용 요소가 아니라서 성립하지만, 카드를 누를 수
  있게 만드는 순간 포커스 표시가 필요하다.
- 모션 없음 — `prefers-reduced-motion` 계약이 필요 없다.

## Specification

| Part | 값 | 토큰·근거 |
| --- | --- | --- |
| Box (`carousel`) | 316 × 316, 줄어들지 않음 | **리터럴**. 대응 spacing 토큰이 없다(Known deviations 4) |
| Box (`grid`) | 폭 100%, 정사각 | 칸이 정한다 |
| Card | radius 12, `overflow: hidden` | `radius/12` |
| Badge | 좌·상 16, 안쪽 4 / 2, radius 999 | `spacing` 2px 그리드(`left-8 top-8` · `px-2 py-1`) |
| Badge 면 | 흰색 20% + 배경 흐림 10 | `color/static-white-alpha/20` · `blur/surface`(=10) |
| Badge 글자 | caption-12-regular | `typography/caption-regular` · `color/media-foreground-dark` |
| Badge 높이 | 22 | 12 × 1.5 = 18, + 세로 안쪽 2 × 2 |
| Info bar | 좌우 16 · 아래 16 · **위 40** · 간격 4 | 위 40 이 흐림 영역을 넓히는 장치다 |
| Info bar 면 | 흰색 저알파 + 배경 흐림 20 | Figma 는 `color/static-white-alpha/04`, 제품은 1%(Known deviations 2) · 흐림은 **리터럴 20**(3) |
| Info bar 높이 | 111 | 40 + 30 + 4 + 21 + 16 |
| Name row | 높이 30, 간격 8 | 20 × 1.5 = 30 |
| Name | body-20-medium | `typography/body-lg-medium` · `color/media-foreground-dark` |
| Description | body-14-regular, 알파 72% | `typography/body-sm-regular` · `color/media-foreground-dark` 72% |
| Glyph | 16 × 16 | `icon` 슬롯 |

## Known deviations

1. **정보 바 높이가 시안과 다르다 — 111 대 98/94.** 시안은 모델명 줄 높이를 120% / 100% 로
   갈라 두 값을 냈는데, 제품 타입 스케일은 `body-20` 도 `body-14` 도 줄 높이 150% 다. 그래서
   40 + 30 + 4 + 21 + 16 = **111** 로 하나로 수렴시켰다. 시안 두 값 중 어느 쪽도 재현하지 않는다.
2. **흰색 1% 를 `static-white-alpha/04` 로 대체했다.** 제품은 `rgb(255 255 255/1%)` 인데
   알파 램프의 첫 단계가 **04** 다 — 01 단계가 없다. 리터럴로 두면 Figma 가 변수 알파로
   `paint.opacity` 를 덮어써 값이 유지되지 않으므로, 가장 가까운 램프 단계로 올렸다.
   **면이 제품보다 밝다**(4% 대 1%). 램프에 01 을 더할지, 제품을 04 로 올릴지는 소유자 판정이다.
3. **`BACKGROUND_BLUR 20` 이 리터럴이다.** blur 토큰은 `blur/10` · `blur/12` · `blur/16`
   셋뿐이고 20 이 없다. 배지의 10 은 `blur/surface` 로 묶였지만 정보 바의 20 은 묶을 대상이
   없다. 토큰을 하나 더 세울지는 소유자 판정이다.
4. **카드 폭 316 이 리터럴이다.** 토큰 전수에서 값이 316 인 변수가 없다. 시안 값이고 2px
   그리드에도 얹히지 않는다(316 = 2 × 158).
5. **`Badge` 축은 폐기 판정을 받았고 Figma 재작업이 남아 있다.**
   `design/governance/figma-component-authoring.md` §2 개정의 「네 시험」 중 **시험 4(값 자체가
   내용인가)** 에 걸린다 — 값에 문구(`New` · `Top`)가 들어가 있어 라이브러리가 카피를 소유하게
   되고, 문구가 늘 때마다 변형이 는다. 나머지 셋은 통과한다: 배지를 감춰도 카드는 316 × 316
   고정이라 스타일도 기하도 전이도 바뀌지 않는다. 갈 곳은 `Badge` BOOLEAN + `BadgeLabel` TEXT
   이고 변형은 3 → 1 이 된다. **아직 Figma 파일을 고치지 않았다** — 그래서 parity 계약은
   현상(3값 VARIANT)을 그대로 적고 있다. 재작업에는 기존 인스턴스의 재바인딩이 따라온다.
6. **`TopBar` 층이 제품에 없다.** 제품은 배지를 `absolute left-8 top-8` 로 놓고 Figma 는
   높이 54 · 안쪽 16 의 auto-layout 프레임으로 감쌌다. 보이는 위치는 같지만 층 수가 다르므로
   LOUIS recipe 를 세울 때 어느 쪽을 정본으로 삼을지 정해야 한다.
7. **`layout` 축이 Figma 에 없다.** 제품은 `carousel` · `grid` 두 박스를 갖는데 Figma 는 316
   고정 하나다. 그리드 쪽 폭은 칸이 정하므로 고정 폭 variant 로 그리면 어떤 폭을 골라도
   거짓이 된다 — Dialog 의 `fullscreen` 을 뺀 것과 같은 이유다. 그래서 **의도적으로 비웠고**,
   대신 이 문서가 그 축을 소유한다.
8. **기하가 게이트에 걸려 있지 않다.** `figma/components.measured.json` 에 `media-card` 항목이
   없어 316 · 111 · 40 · 22 를 아무도 대조하지 않는다. 위 값들은 제품 소스에서 읽은 것이고
   브라우저 실측이 아니다. 실측 probe 를 붙이는 것이 승격 조건이다.

## Acceptance tests

1. 카드가 정사각이고 radius 12 이며 사진이 모서리에서 잘린다.
2. `carousel` 박스만 `scroll-snap-align: start` 를 갖는다. `grid` 박스에는 없다.
3. 정보 바 높이가 **111** 이다(40 + 30 + 4 + 21 + 16).
4. 정보 바가 그라디언트가 아니라 저알파 면 + `backdrop-filter: blur(20px)` 이다.
5. 배지 흐림이 10, 정보 바 흐림이 20 으로 **서로 다르다.**
6. 이름·설명·배지 글자가 모두 `media-foreground-dark` 에서 오고 `gray-*` 램프를 쓰지 않는다.
7. Figma 되읽기에서 raw fill · raw stroke · 스타일 없는 텍스트가 각각 0 이다.
8. 사진에 `alt` 가 있고 이름과 같은 문구가 아니다.

## Migration and changelog

새로 선 컴포넌트다. 이전 API 가 없다. LOUIS recipe 가 서면 이 문서의 Specification 이 그 값의
정본이 된다. 사용자 영향 변경은 [Updates](../updates/README.md) 에 적는다.
