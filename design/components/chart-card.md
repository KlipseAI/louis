---
id: chart-card
status: experimental
authority: normative
summary: 지표 하나를 바깥 프레임과 안쪽 면 두 겹으로 싣고 그 안에 차트를 두는 카드입니다.
---

# Chart Card

지표 하나를 「바깥 프레임 + 안쪽 면」 두 겹으로 싣고, 안쪽 면에 수치·증감 알약·차트를 둔다.
애널리틱스 대시보드의 KPI 행과 주요 지표 블록이 **같은 조형**이며 차트가 붙는 자리만 다르다.

**Figma 51종에 차트 축이 하나도 없었다.** 그래서 지표 화면을 그리려면 매번 곡선을 손으로
그려야 했고, 실제로 제품에도 같은 그림이 네 벌(`OverviewTab` 인라인 2 · `PerformanceTab` 1 ·
`YoutubeVideoAnalyticsView` 1) 있다. 이 컴포넌트가 그 부류의 첫 칸이다.

## 두 겹인 이유가 반경에 적혀 있다

바깥 반경 16(`radius-overlay`) − 바깥 여백 6(`space-overlay-inset`) = 안쪽 반경
10(`radius-overlay-item`). 동심 정렬이라 셋이 서로를 참조하고, 하나를 바꾸면 안쪽 면의
곡률이 바깥 곡률과 어긋나 모서리에 초승달이 생긴다. 정본(앵커 `5a67d692` 의 `components/scenes/analytics/OverviewTab.tsx`)이
그 산술을 주석으로 적어 두었다. 값 셋이 오버레이 계단과 정확히 같아서 새 토큰을 세우지 않았다.

## Availability

| Surface       | 상태           | 근거 |
| ------------- | -------------- | ---- |
| Web           | `partial`      | CSS 레시피만 있고 React 표면은 없다. 곡선 자체는 소비처가 SVG 로 그린다(아래 When to use) |
| Figma         | `done`         | component set `ChartCard`(Chart × State 6 변형). 계약이 모든 property 를 pin 하고 기하는 양방향이다 — `chart-card.browser.test.tsx` 가 코드 쪽에서 같은 실측을 되잰다. 게시 없이 판정한다([DS-D-0035](../governance/decisions/DS-D-0035-figma-done-without-publish.md)) |
| Documentation | `done`         | 이 문서 |
| Maturity      | `experimental` | 규범·구현·Figma 가 같은 변경 단위에서 처음 선다 |

## When to use

- 지표 하나에 **추세**를 붙여야 할 때. 수치만으로 충분하면 `stat-tile` 이다.
- KPI 행(`Chart=spark`)과 주요 지표 블록(`Chart=area`)에 쓴다.

쓰지 않는 자리.

- **곡선 자체를 그리는 컴포넌트가 아니다.** 이 카드는 액자와 슬롯이고, 경로·축·툴팁은
  소비처의 SVG 다. 데이터에서 좌표를 내는 일은 DS 가 소유할 수 없다 — 표본 수, 결측,
  로케일별 축 라벨이 전부 화면의 것이다.
- **면이 필요 없는 자리.** 카드 안에 이미 면이 둘 있는데 그 안에 또 카드를 넣으면 세 겹이
  된다. 정본이 그것을 겪고 「단은 둘이면 충분하다」로 되돌아왔다.

## Anatomy

1. **Frame** — `.louis-chart-card`. 바깥 액자. `data-chart` 가 여기 붙는다.
2. **Header** — `.louis-chart-card__header`. 지표 이름과 기간.
3. **Label** / **Meta** — `.louis-chart-card__label` / `__meta`. 기간은 `area` 에만 있다.
4. **Panel** — `.louis-chart-card__panel`. 데이터가 사는 안쪽 면.
5. **Metric** — `.louis-chart-card__metric`. 수치와 증감 알약 한 묶음.
6. **Value** — `.louis-chart-card__value`. 36 Medium.
7. **Delta** — `.louis-delta-pill`. `stat-tile` 이 소유하는 알약을 그대로 쓴다.
8. **Chart** / **Spark** — `.louis-chart-card__chart` / `__spark`. 곡선이 들어갈 슬롯.
9. **Notice** — 데이터가 모자랄 때 그 슬롯을 대신하는 인라인 `Alert`(`Layout=inline`).

## Properties

| Property | 값 | 기본값 | 설명 |
| -------- | --- | ------ | ---- |
| `data-chart` | `area` · `spark` | `area` | 차트가 붙는 자리. `area` 는 수치 아래 전폭, `spark` 는 수치 옆 미니 곡선 |

## Variants, sizes, and states

`Chart` 축이 기하를 가른다 — 안쪽 면의 방향(세로·가로), 여백(12/14 · 14/16), 헤더 간격
(10 · 0), 최소 높이(없음 · 92)가 전부 이 축에서 갈린다.

Figma 는 여기에 `State` 축을 하나 더 갖는다. 여섯 칸은 전부 제품에 근거가 있다.

| | `area` | `spark` |
| --- | --- | --- |
| `default` | 곡선 + 축 라벨 | 값 옆 미니 곡선 |
| `insufficient` | 곡선 자리에 인라인 Alert | **곡선을 그리지 않는다** — 정본이 `hasSpark ? … : null` 이다 |
| `loading` | 차트 스켈레톤 | KPI 스켈레톤(`ReportKpiRowSkeleton`) |

계획서는 `Chart = Area\|Spark\|None` × `State = Default\|Insufficient\|Loading` 아홉 칸을
적었지만 그 중 셋은 제품에 그림이 없다. `Chart=None` 은 `spark`/`insufficient` 와 같은 그림이라
칸을 따로 만들지 않았다 — **없는 칸을 그리면 그 칸이 규범이 된다.**

CSS 에는 `State` 가 없다. 세 상태는 슬롯에 무엇이 들어가느냐이지 카드의 속성이 아니다.

## States

**CSS 에는 상태가 없다.** 세 상태는 카드의 속성이 아니라 **슬롯에 무엇이 들어가느냐**이고,
그래서 레시피에는 `data-state` 도 `:hover` 도 없다. Figma 만 `State` 축을 갖는다 — 정지 화면
하나에 그 셋을 다 그려 두어야 디자이너가 세 그림을 한자리에서 본다.

| 상태 | `area` | `spark` | 무엇이 그리나 |
| --- | --- | --- | --- |
| `default` | 곡선 + 축 라벨 | 값 옆 미니 곡선 | 소비처의 SVG 가 슬롯에 들어간다 |
| `insufficient` | 곡선 자리에 인라인 `Alert` | **곡선을 그리지 않는다** — 정본이 `hasSpark ? … : null` 이라 데이터가 모자라면 슬롯 자체가 비고 값과 알약만 남는다 | 소비처가 슬롯을 갈아 끼운다 |
| `loading` | 차트 스켈레톤 | KPI 스켈레톤(`ReportKpiRowSkeleton`) | 형제 컴포넌트인 `Skeleton` |

세 칸 모두에서 **액자와 안쪽 면은 움직이지 않는다.** 여백·반경·헤어라인·최소 높이가 그대로라
곡선이 늦게 도착해도 격자의 행 높이가 흔들리지 않는다 — `spark` 면의 `min-block-size: 92px`
가 그 하한이고, 그것이 이 축을 상태가 아니라 슬롯으로 둘 수 있는 이유다.

카드 자신은 **대화형이 아니다.** hover · focus · disabled 선언이 하나도 없고, `area` 곡선의
hover(세로선 + 점 + 툴팁)는 소비처의 SVG 가 소유한다. 유일한 매체 질의는
`forced-colors: active` 이고 거기서 두 면의 헤어라인이 시스템 색 실선으로 되살아난다 —
두 겹이라는 사실 자체가 정보이기 때문이다.

## Interaction and responsive behavior

카드 자체는 대화형이 아니다. `area` 곡선의 hover(세로선 + 점 + 툴팁)는 소비처의 SVG 가
소유한다.

`area` 슬롯의 높이는 **비율**이다(`aspect-ratio: 4 / 1`). 카드가 격자에서 어떤 폭을 받든
곡선의 기울기가 같아야 두 카드를 눈으로 비교할 수 있기 때문이다. `min-block-size: 140px` 는
좁은 화면에서 비율이 만드는 높이가 곡선을 못 읽을 만큼 납작해지는 것을 막는 하한이다.
정본은 여기에 폭 구간별 비율 넷(5:1 · 4:1 · 3:1 · 2.5:1)을 더 갖는데, 그 넷은 컨테이너
질의가 아니라 뷰포트 질의라 카드가 소유할 수 없다 — 소비처가 얹는다.

`spark` 면의 `min-block-size: 92px` 가 KPI 행의 실질 행 높이를 정한다. 알약이 없는 카드가
주저앉지 않게 하는 하한이다.

## Content

- 라벨은 지표 이름. 기간(`Meta`)은 이미 서식이 끝난 문자열을 받는다.
- 데이터가 모자랄 때의 문구는 인라인 Alert 가 나른다. 「데이터가 부족합니다」처럼 원인이
  아니라 상태를 적는다 — 카드는 왜 부족한지 모른다.

## Accessibility

- 곡선은 장식이 아니라 데이터다. 소비처가 SVG 에 접근 가능한 이름을 주거나, 같은 수를
  읽을 수 있는 표를 곁에 둔다. 이 카드는 그 결정을 대신하지 않는다.
- `spark` 곡선은 값의 반복 표현이라 정본이 `aria-hidden` 을 건다. 그 판단은 유지한다 —
  같은 수를 두 번 읽히면 스크린리더에서 지표가 두 개로 들린다.
- `forced-colors` 에서 두 면의 헤어라인이 사라진다. **두 겹이라는 사실 자체가 정보**이므로
  안쪽 면까지 시스템 색 실선으로 되살린다.

## Specification

| Part/state | Token or recipe | 구현 근거 |
| ---------- | --------------- | --------- |
| Frame 반경 | `radius-overlay` 16 | 정본 `rounded-16` |
| Frame 여백 | `space-overlay-inset` 6 | 정본 `p-3` |
| Frame 간격 | `space-control-sm` 8 | 정본 `gap-4` |
| Frame 면 | `color-bg-canvas` | 값이 정본과 바이트 단위로 같다 — 정본이 `--dashboard-card-bg` 로 이 토큰을 직접 물기 때문에 **동일성으로** 같다. 팔레트 칸은 라이트 `palette-gray-025` · 다크 `palette-gray-900` 이다(적어 둔 「라이트 palette-gray-100」은 라이트 사다리 `0279520`·`fe31e52` 이전 값이고, 다크는 `93353f9` 가 `palette-gray-850` 으로 내렸다가 2026-09-09 의 사다리 이동이 `900` 으로 되돌렸다) |
| Panel 반경 | `radius-overlay-item` 10 | 16 − 6 동심 정렬 |
| Panel 면 | `color-bg-overlay` | 값이 정본과 바이트 단위로 같다(라이트 palette-gray-000 · 다크 palette-gray-800) |
| Panel 여백 `area` | `space-control-md` 12 / 14px | 정본 `py-6 px-7` |
| Panel 여백 `spark` | 14px / `space-control-lg` 16 | 정본 `py-7 px-8` |
| Header 여백 | `space-overlay-inset` 6 / `space-overlay-item-gap` 2 | 정본 `pt-3 px-3 pb-1` |
| Label | `typography-body-sm-medium` · `color-fg-secondary` | |
| Meta | `typography-caption-regular` · `color-fg-tertiary` | |
| Value | `typography-heading-md-medium` · `color-fg-primary` | |
| Delta | `.louis-delta-pill` | `stat-tile` 이 소유한다 |
| Spark 슬롯 | 44% · 최대 130px · 46px | 정본 `w-[44%] max-w-65 h-23` |

## Acceptance tests

값의 정본은 `figma/components.measured.json` 의 `chart-card` 이고 두 방향이 그것을 되잰다 —
Figma 쪽은 `verify-figma-parity`, 코드 쪽은 `packages/react/test/chart-card.browser.test.tsx`
가 실브라우저 계산값으로 잰다. 시험은 값을 자기 파일에 적지 않고 그 기록에서 읽어 대조한다.

두 축(`area` · `spark`) 각각에서.

1. 바깥 액자의 여백 6 · 간격 8 · 반경 16 이 계약과 같고, **테두리 두께가 0** 이면서
   `box-shadow` 가 `none` 이 아니다 — 경계를 만드는 것이 border 가 아니라 안쪽 헤어라인
   한 겹이라는 계약이다([DS-D-0023](../governance/decisions/DS-D-0023-hairline-inset.md)).
2. 헤더의 여백 넷과 간격이 계약과 같다. `spark` 의 헤더 간격은 0 이다.
3. 안쪽 면의 여백·반경·주축 방향이 계약과 같다.
4. **동심 정렬이 산술로 성립한다** — `바깥 반경 − 바깥 여백 = 안쪽 반경`(16 − 6 = 10)을 시험이
   직접 계산해 확인한다. 셋 중 하나만 움직여도 여기서 걸린다.
5. 수치의 크기가 계약과 같고 `tabular-nums` 가 걸려 있으며, 증감 알약의 여백·반경이
   `stat-tile` 이 소유하는 값과 같다.
6. 라벨의 크기가 계약과 같다.

축마다 하나씩.

7. `area` 에는 기간(`Meta`)이 있다. 곡선 슬롯의 선택값은 비율 4 : 1 과 하한 140 이고, 카드 폭 400 일 때
   비율 높이 90 이 하한에 걸려 높이가 140 이다(`chart-card.sizes.area.chartMinHeight`).
8. `spark` 의 미니 곡선의 선택값은 폭 44% · 상한 130 · 높이 46 이다. 카드 폭 400 일 때 44%(156.6)가
   상한에 걸려 폭이 130 이다(`chart-card.sizes.spark.sparkWidth`).
9. **안쪽 면의 하한이 두 축에서 갈린다**: `area` 는 0, `spark` 는 92. 이 값은 계약 밖이라
   (Figma 가 `minHeight = 0` 을 거부하고 `null` 은 되읽기에서 사라진다) 두 칸을 다 재는 것은
   이 시험뿐이다.
10. **두 축의 안쪽 여백이 실제로 갈려 있다.** 둘이 같아지면 축이 죽은 것이므로 시험이 소리를
    낸다 — 값이 맞는지가 아니라 **축이 살아 있는지**를 재는 유일한 칸이다.

Figma 쪽에서는 `rawFills` · `rawStrokes` 가 0 이고, 데이터 부족 안내가 새로 그린 도형이 아니라
`Alert / Layout=inline` 인스턴스여서 그 값이 두 곳에서 두 번 계약되지 않는다.

## Known deviations

1. **안쪽 면의 여백이 두 축에서 갈린다**(12/14 · 14/16). 제품 정본이 갈려 있기 때문이고
   (KPI `py-7 px-8` · 주요 지표 `py-6 px-7`) 이 회차는 그 사실을 지우지 않고 축으로 적었다.
   둘 중 하나로 모으는 것은 소유자 판정이다 — 어느 쪽으로 모으든 픽셀이 움직인다.
2. **면 두 칸의 이름이 뜻과 어긋난다.** `bg-canvas`·`bg-overlay` 는 캔버스와 오버레이의
   이름인데 여기서는 카드의 두 단으로 쓴다. 값이 정확히 같아서 고른 것이고, 같은 값에
   이름을 하나 더 붙이는 것은 이 시스템이 이미 가진 중복(`radius-alert` 와 `radius-card-lg`
   가 둘 다 20)을 한 벌 더 만드는 일이다. 카드 계단에 이름을 세우는 것이 해소다.
3. **폭 구간별 비율 넷이 카드 밖에 있다.** 위 Interaction 절이 근거다.
4. **값의 잉크가 `fg-primary` 다.** 정본은 `text-gray-000`(라이트에서 순검정)이고
   `fg-primary` 는 라이트에서 palette-gray-900 이다. 형제인 `stat-tile` 이 라이트에서
   palette-gray-900 을 쓰므로 두 카드가 같은 잉크를 갖도록 맞췄다 — 정본 둘이 갈려 있었고
   이 회차는 더 많은 쪽을 골랐다.
5. **`area` 헤더의 기간이 `spark` 에는 없다.** 가시성이 아니라 구조다. Figma 에서도
   `spark` 변형에는 `Meta` 노드를 두지 않는다 — 불리언으로 숨기면 component set 단위로
   합쳐져 `area` 의 기간까지 사라진다.
6. **React 표면이 없다.** `stat-tile` 과 같다.

## Implementation

- Web source: packages/css/src/component/chart-card.css
- Public import: `@klipse-design/css/styles.layer.css` (레시피 클래스)
- Figma component: `ChartCard` — `DS · Components`
- Tests/visual evidence: packages/react/test/chart-card.browser.test.tsx
- 제품 정본(앵커 `5a67d692`): `components/scenes/analytics/OverviewTab.tsx` ·
  `components/scenes/InstagramAnalyticsScene.tsx` · `components/scenes/analytics/shared.tsx`.
  **저장소 접두사를 떼고 적는다** — 규범 문서는 제품 저장소 전용 경로를 직접 가리킬 수 없고
  (`build-design-docs` 의 저장소 경계 규칙), 좌표의 정본은 이 문서가 아니라 원장과
  evidence lock 이다

> 새 파일 넷은 아직 git 이 추적하지 않아 백틱 인용이 `verify-doc-paths` 를 깬다.
> 이 회차가 커밋을 하지 않으므로 경로를 백틱 없이 적는다 — 커밋이 서면 백틱으로 감싼다.

## Migration and changelog

처음 선다. [Updates](../updates/README.md) 참고.
