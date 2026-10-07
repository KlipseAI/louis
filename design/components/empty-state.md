---
id: empty-state
status: experimental
authority: normative
summary: 보여 줄 것이 없을 때 그 사실과 다음 행동을 안내합니다.
---

# Empty State

목록이나 영역에 보여 줄 것이 없을 때, 그 사실과 다음 행동을 알린다.

제품에 정의가 **9벌** 있다 — 앱 홈 2, 하이라이트 2, 비디오 에디터 5. 그중 하나(하이라이트의 둘째)는
조건상 도달할 수 없는 죽은 분기라 살아 있는 것은 8벌이다. 아홉 벌은 거의 합의하지 않는다.

| 축 | 갈림 |
| --- | --- |
| 세로 여백 | 80px 2벌 · 64px 1벌 · 선언 없음 나머지 |
| 블록 간격 | 12px 2벌 · 16px 1벌 |
| 제목 계층 | 있음 2벌 · 없음 나머지 |
| 행동 유도 | 있음 3벌 · 없음 6벌 |
| **배경·테두리·반경** | **9벌 전부 없음** |

마지막 줄이 유일한 합의이고, 그것을 그대로 옮겼다. 나머지는 두 홈이 동의한 값을 정본으로 골랐다 —
근거가 가장 두껍다.

**그 합의는 집계 «안»에서만 참이다.** 집계 밖에 정의가 둘 더 있고 둘 다 위 표로는 그릴 수 없다 —
대시보드의 `AnalyticsStatePanel` 은 면·1px 테두리·12 반경을 갖고 **왼쪽에서 시작하며**, 빈 캔버스의
`CanvasEmptyState` 는 그래픽 없이 28px 제목 한 줄 아래 생성 카드 줄과 글자 단추 줄만 그린다. 「아홉 벌이 합의하는 것은
하나뿐」이라는 문장은 그래서 **layout 축의 근거**다: 합의 밖의 자리가 실재한다는 사실을 이미 적고
있었다. 그 둘을 `compact` 과 `canvas` 로 세웠다 — 아래 [Layout](#layout) 을 본다.

## Availability

| Surface       | 상태           | 근거                                                          |
| ------------- | -------------- | -------------------------------------------------------------- |
| Web           | `partial`      | public export와 실브라우저 acceptance test 7건; visual regression과 제품 소비 증거 없음 |
| Figma         | `done`      | `Layout` 축 3변형의 component set. 계약이 모든 property 를 pin 하고 세 칸(`base`·`compact`·`canvas`)을 전부 대조하며 Graphic·Title·Description·Action 을 자손으로 본다. 기하는 양방향이다 — `empty-state.browser.test.tsx` 가 코드 쪽에서 같은 실측을 되잰다. 게시 없이 판정한다([DS-D-0035](../governance/decisions/DS-D-0035-figma-done-without-publish.md)) |
| Documentation | `done`         | 이 문서                                                        |
| Maturity      | `experimental` | 규범과 구현이 같은 변경 단위에서 처음 선다                     |

## When to use

- 목록·격자·패널에 항목이 **하나도 없을 때**.
- 사용자가 아직 아무것도 만들지 않아 다음 행동을 안내해야 할 때.

쓰지 않는 자리.

- **불러오지 못했을 때.** 그것은 오류이며 사용자가 취할 행동이 다르다 — 없으면 만들면 되고
  실패했으면 다시 시도해야 한다. 제품의 프로젝트 피커는 둘을 같은 빨간 표현으로 합쳐 두었는데,
  그 구조는 옮기지 않았다.
- **불러오는 중일 때.** 그것은 로딩이다. 빈 상태를 먼저 보여 주면 곧 사라질 "없습니다"를 읽힌다.
- 검색·필터 결과가 없을 때는 **같은 컴포넌트를 쓰되 문구가 다르다.** 아래 Content를 본다.

## API

```tsx
<EmptyState
  graphic={<IconFolder />}
  title="아직 프로젝트가 없습니다"
  description="첫 번째 영상을 만들어보세요."
  action={<Button variant="primary" size="sm" leftIcon={<IconPlus />}>만들기</Button>}
/>

{/* 섹션 카드 안 — 면을 갖는 2슬롯 패널 */}
<EmptyState
  layout="compact"
  headingLevel={3}
  title="아직 데이터가 없습니다"
  description="영상을 올리면 이 자리에 지표가 쌓입니다."
/>

{/* 작업 표면 위 — 그림 없이 큰 제목과 생성 카드 줄. 카드 줄이 action 슬롯 하나다 */}
<EmptyState
  layout="canvas"
  title="첫 노드를 만들어 시작하세요"
  action={<StartCardRow />}
/>
```

## Anatomy

1. **Container** — 세로 stack. `base`·`canvas` 는 가운데 정렬이고 `compact` 만 왼쪽에서 시작한다.
   면을 갖는 것도 `compact` 하나뿐이다.
2. **Graphic** — 64px 슬롯. 선택이다.
3. **Title** — heading. 무엇이 없는지 말한다.
4. **Description** — 선택. 다음에 무엇을 하면 되는지 말한다.
5. **Action** — 선택. 보통 Button 하나다.

자리마다 쓰는 슬롯이 다르다. **컴포넌트가 슬롯을 막지는 않는다** — 막으면 같은 prop 이 layout 마다
다르게 동작한다 — 대신 계약이 그 자리의 값을 갖지 않으며, Figma 의 그 변형에는 자손 자체가 없다.

| layout | Graphic | Title | Description | Action |
| --- | :---: | :---: | :---: | :---: |
| `base` | 선택 | 필수 | 선택 | 선택 |
| `compact` | — | 필수 | 필수 | — |
| `canvas` | — | 필수 | — | 필수(카드 줄) + 선택(글자 단추 줄) |

## Properties

| prop | 값 | 기본 | 뜻 |
| --- | --- | --- | --- |
| `title` | ReactNode | 필수 | 제목 |
| `description` | ReactNode | 없음 | 설명 |
| `graphic` | ReactNode | 없음 | 64px 그래픽 |
| `action` | ReactNode | 없음 | 행동 유도 |
| `headingLevel` | `2`–`6` | `2` | 제목의 heading 단계 |
| `layout` | `base` · `compact` · `canvas` | `base` | 놓이는 자리의 모양 |

`headingLevel`을 컴포넌트가 고정하지 않는 이유는 빈 상태가 놓이는 자리에 따라 문서 구조가 달라지기
때문이다. 섹션 안이면 `3`, 페이지 본문이면 `2`다.

## Hierarchy와 variants

**강조 축은 없다.** 빈 상태의 강조는 시각이 아니라 **행동 유도의 유무**가 만든다 — 사용자가 지금
할 수 있는 것이 있으면 버튼을 주고, 없으면 사실만 말한다.

## Layout

있는 축은 하나이고 그것은 강조가 아니라 **자리**다. 세 값은 "같은 것을 더/덜 강하게"가 아니라
서로 다른 곳에 산다.

| `layout` | 자리 | 제품 정본 |
| --- | --- | --- |
| `base` | 페이지 본문 | 앱 홈 두 벌(집계 9벌의 합의값) |
| `compact` | 섹션 카드 **안** | `AnalyticsStatePanel` — `components/scenes/analytics/shared.tsx:123-128` · `561-566` |
| `canvas` | 작업 표면 **위** | `CanvasEmptyState` — `components/scenes/create/node-canvas-v2/components/CanvasEmptyState.tsx:24-38` |

`compact` 은 이 컴포넌트의 **단일 최다 소비처**다 — 앵커 `5a67d692` 전수로 JSX 호출 15곳 / 6파일 /
2라우트(`/analytics/instagram` · `/analytics/youtube`)다.

**`compact` 만 면을 갖는다.** 그것이 「9벌 전부 없음」 합의의 유일한 반례이며, 반례가 실재한다는
사실이 축을 여는 근거다. 면과 테두리는 제품 실측과 **값이 같은** semantic 을 골랐다 — 제품 다크의
`--dashboard-chip-bg-strong`(gray-700)이 `color-bg-raised` 와, `--dashboard-input-border`(gray-600)가
`color-stroke-default` 와 같은 색**이었다**. 카드보다 한 단계 **밝은** 면이므로 `bg-inset` 이 아니라
`bg-raised` 다 — 제품 주석도 그 자리를 "카드보다 한 단계 밝은 표면"이라 부른다.

**면 쪽 등식은 2026-09-09 에 깨졌다.** 다크 면 사다리를 한 칸씩 내린 회차가 `bg-raised`(dark)를
`palette-gray-700` → `palette-gray-800` 으로 옮겼다. 제품 칩은 여전히 `gray-700` 이므로 이제
**LOUIS 쪽이 제품보다 한 칸 어둡다.** 테두리 쪽 등식(`--dashboard-input-border` ↔
`color-stroke-default`)은 그대로다 — 이 이동은 면 넷만 건드렸다. 토큰 **선택**의 근거는 값이
아니라 관계(「카드보다 한 단계 밝은 면」)이고 그 관계는 넷이 함께 내려가도 유지되므로
`bg-raised` 를 고른 판정은 바뀌지 않는다. 값을 다시 맞출지는 수렴 방향(LOUIS 레시피 ≠ 제품
픽셀이면 LOUIS 를 제품 쪽으로 재조율)의 대상이며 **소유자 판정이다** — 소유자가 화면 세 안을
보고 이 사다리를 골랐으므로 여기서 되돌리지 않는다.

**`canvas` 는 그림을 그리지 않는다.** 캔버스가 비었다는 사실보다 그림이 먼저 읽히기 때문이고,
제품도 그렇게 그린다. 대신 **카드 줄과 글자 단추 줄**이 화면을 채운다(아래 「canvas 의 줄 계약」) — 줄 안의 «개수»는 소비처가 정하므로 축이 아니다.

### canvas 의 줄 계약 (2026-10-07)

제품 빈 캔버스가 「제목 + 버튼 둘」에서 **세로 줄 셋**으로 바뀌었다(소유자 시안, 제품
`chore/landing-dead-walkthrough` `CanvasEmptyState.tsx` a31f808c5).

| 줄 | 슬롯 | 안 | 간격 |
| --- | --- | --- | --- |
| 1 제목 | `__title` | heading 28/600 한 줄 | — |
| 2 생성 카드 줄 | `__action` | 두 칸 격자. 칸은 [시작 카드](#시작-카드) | 카드 사이 `layout-project-grid-gap`(4px) — 소비처가 정한다 |
| 3 글자 단추 줄 | `__action` 하나 더 | ghost Button 하나(「사용법 보기」). 도움말을 여는 쪽이 없으면 줄이 없다 | — |

세 줄 사이는 모두 **20px**(`--louis-empty-state-canvas-gap`)다 — 액션 슬롯의 추가 간격은 canvas 에서 0 이라 둘째
슬롯도 같은 간격을 받는다. 줄 둘이 같은 `__action` 슬롯인 까닭은 슬롯의 «자리»(제목 아래, 가운데 정렬,
추가 간격 0)가 같고 안에 무엇이 서는지는 소비처가 정하기 때문이다. 그래서 레시피는 카드 줄의 칸 수 · 폭 ·
격자를 소유하지 않는다 — 폭이 띠 높이에 따라 줄기 때문이다(아래).

**여백과 간격은 공개 사용자 정의 속성이다.**

| 속성 | 값 | 뜻 |
| --- | ---: | --- |
| `--louis-empty-state-canvas-pad` | 24px | 세로 여백(`padding-block`) |
| `--louis-empty-state-canvas-gap` | 20px | 줄 사이 간격(`gap`) |

`.louis-empty-state[data-layout="canvas"]` 요소에 선언되므로 **그 요소나 자손에서 읽는다.** 제품이 이 두 값을
리터럴(`--canvas-start-pad:24px` · `--canvas-start-gap:20px`)로 베끼고 정규식 테스트로 묶어 둔 것이 이
속성을 연 계기다(`CanvasEmptyState.tsx:52`, `CanvasEmptyState.test.ts`). 조상 요소(제품의 `AVOID_BOX`)에서
읽을 수 있는 `:root` 선언은 하지 않았다 — 컴포넌트 층이 전역 선택자를 쓰지 않는다(DS-D-0004). 조상에 둔
변수가 필요하면 소비처가 자기 요소에서 이 속성을 읽어 넘긴다. 값이 바뀌면 소비처의 복사본이 아니라 이 속성이
따라간다.

**띠 맞춤 식은 제품 몫이다.** 제품은 캔버스 위쪽 헤더와 아래쪽 툴바 사이 «띠»(`100cqh`)에 제목부터
단추까지가 늘 들어가도록 카드 줄 폭을 줄인다. 제품 주석의 식은 이렇다 — 세로로 쌓이는 것은 여백 P · 제목 T · 간격 G ·
카드 · 간격 G · 단추 A · 여백 P 이고, 띠 높이 B 에서 카드가 가질 수 있는 높이는 B − T − A − 2P − 2G,
칸 둘과 칸 사이 간격 g 의 줄 폭으로는 그 × 640/403 + g 다. 줄 폭 하한은 칸 폭 128 이고 거기에 닿으면 P 가 0
까지, 그다음 G 가 8 까지 줄어든다(출처 `CanvasEmptyState.tsx` `BAND_FIT_VARS` 주석). 이 식은 **작업 표면의 크롬
높이**(`canvasChromeInsets`)와 **레이어 · 도움말 패널 피함**에 묶여 있어 레시피가 아는 것이 아니다 —
LOUIS 는 P 와 G 의 «최대값»만 발행하고 줄이는 쪽은 소비처가 한다. 소비처는 **발행한 값 이하로만** 줄여야 한다.

### 시작 카드

생성 카드(「이미지 생성」 · 「비디오 생성」)는 제품 `CanvasEmptyState.tsx` 의 `CARD`(138행 부근)다 —
aspect 320/403 · 반경 `radius-overlay`(칸 600 이상 `radius-card-lg`) · 면 `palette-gray-950` · `::after`
헤어라인(`hairline-inset`) · 위쪽 점진 블러 층(`progressive-blur` + `progressive-blur-mask-block-start`) ·
이름 `media-foreground-dark`. 안은 스틸 격자 또는 영상 + 프레임 띠이고 호버에서 움직인다.

**별도 부품 [Start Card](./start-card.md) 로 세웠다 — 소유자 결정(2026-10-07).** 이 컴포넌트의 변형도 [Media Card](./media-card.md) 의
변형도 아니다. Media Card 는 `<article>` 이고 상태가 없는 표시용인데 이 카드는 `<button>` 이고 호버 · 키보드 상태를 갖고, 기하도
정사각 + 아래 정보 띠 대 320/403 + **위쪽** 이름으로 달랐다. 이 컴포넌트는 카드 줄의 «자리»(`__action` 슬롯)만 소유하고 칸 안은
Start Card 가 그린다. 안의 미디어(스틸 흐름 · 영상 재생)는 제품 콘텐츠다. Figma 변형은 아직 없다.

## States

상태 축이 **없다.** 제품 9벌 중 hover·focus·disabled를 스스로 갖는 것이 0벌이고, 빈 상태는 대화형
요소가 아니다. 그 안의 행동 유도 버튼이 자기 상태를 갖는다.

## Interaction and responsive behavior

- 폭은 부모가 정한다. 설명은 `44ch`로 제한된다 — 넓은 화면에서 한 줄로 늘어나면 눈이 되돌아오지
  못한다. `ch`라서 확대해도 줄당 글자 수가 유지된다.
- 세로 여백 80px은 부모가 짧으면 그대로 넘친다. 빈 상태를 넣는 영역은 최소 높이를 스스로 가져야
  한다 — 그것은 이 컴포넌트가 아니라 레이아웃의 계약이다.

## Content

제품의 문구를 읽어 보면 어조가 하나로 모인다.

- **Title**은 "아직 …가 없습니다" 꼴이다. 마침표를 찍지 않는다.
- **Description**은 해요체 권유이며 마침표를 찍는다 — "첫 번째 영상을 만들어보세요."
- 검색·필터 결과가 없을 때는 **다른 문구다.** "해당하는 프로젝트가 없습니다 / 다른 검색어를
  시도해 보세요." 처음 만드는 것과 못 찾은 것은 다음 행동이 다르다.
- 제품에는 이 두 문구가 사전에 정의돼 있으나 **어떤 화면도 렌더하지 않는 죽은 문구**가 둘 있다
  (`archive.empty.cta`, `archive.emptyFilter`). 문구가 있는데 화면에 없는 것은 제품 부채이며 DS가
  고칠 문제가 아니다.
- 컴포넌트가 문구를 갖지 않는다. 제품의 캔버스 허브는 영상용 문구를 그대로 재사용해 캔버스
  화면에서 "첫 번째 영상을 만들어보세요"라고 말한다 — 문구를 컴포넌트에 고정하면 그런 일이 생긴다.

## Accessibility

- 제목이 **heading**이다. `div`로 두면 스크린 리더가 지나쳐 "왜 아무것도 없는지"를 알 수 없다.
- **`aria-live`를 붙이지 않는다.** 빈 상태는 목록이 로드된 결과이고 로딩을 알리는 것은 이미 다른
  요소의 일이다. 여기에 live region을 두면 화면을 옮길 때마다 다시 읽힌다. 제품도 빈 상태에는
  live region을 두지 않는다(로딩 상태에만 있다).
- **그래픽은 `aria-hidden`이다.** 제목이 말하는 것을 반복할 뿐이다.

## Specification

| 축 | `base` | `compact` | `canvas` | 토큰 |
| --- | ---: | ---: | ---: | --- |
| 세로 여백 | 80px | 20px | 24px | — (세 값 다 리터럴, canvas 는 `--louis-empty-state-canvas-pad`) |
| 좌우 여백 | 16px | 20px | 24px | base 만 `space-layout-gutter` |
| 블록 간격 | 12px | 6px | 20px | base 만 `space-stack-md`, canvas 는 `--louis-empty-state-canvas-gap` |
| 액션 추가 간격 | 4px | — | 0 | base 는 `space-control-xs` |
| 액션 슬롯 안 간격 | 12px | — | 12px(단추 줄) · 카드 줄은 소비처 | `space-stack-md` |
| 그래픽 | 64px | — | — | `icon-size-xl` |
| 제목 | 20/600 | 16/600 | 28/600 (2026-10-07 세미볼드) | `typography-body-lg-semibold` · `-body-md-semibold` · `-heading-sm-semibold` |
| 설명 | 16/400 | 14/400 | — | `typography-body-md-regular` · `-body-sm-regular` |
| 설명 최대 폭 | 44ch | 제한 없음 | — | — |
| 배경 | 없음 | `color-bg-raised` | 없음 | — |
| 테두리 | 0 | 1px `color-stroke-default` | 0 | `border-width-default` |
| 반경 | 0 | 12px | 0 | `radius-card` |
| 정렬 | center | flex-start | center | — |

여백과 간격에 토큰을 만들지 않은 이유는 **각 값의 소비처가 여기 한 줄뿐**이기 때문이다.
[spacing-radius.md](../foundations/spacing-radius.md)가 "두 개 이상의 사용처"를 토큰 승격 조건으로
두고 있어 리터럴을 한 줄씩 격리했다. `space-media-inset` 이 20 이고 `space-layout-section` 이 24 지만
그 이름들은 다른 뜻이다 — 값이 같다고 이름을 빌리면 이름이 거짓이 된다
([DS-D-0029](../governance/decisions/DS-D-0029-token-names-must-be-true.md)).

`compact` 의 설명 폭 제한을 푼 이유는 base 의 44ch 가 "넓은 화면 가운데"라는 전제에서 나온 값이고
카드 안에서는 그 전제가 성립하지 않기 때문이다 — 제한을 두면 카드보다 좁은 자리에서 두 번 접힌다.

## Effects

없다.

## Implementation

- 그래픽 슬롯이 크기를 소유한다(`inline-size`/`block-size` 64px). 안에 들어오는 아이콘이 자기
  크기를 갖고 와도 슬롯을 채운다 — Icon 컴포넌트의 기본은 20px이라 그냥 넣으면 작게 나온다.
- 액션은 `margin-block-start`로 한 단계 더 떨어진다. 읽는 것과 누르는 것 사이의 경계다.

## Known deviations

- **아홉 벌 중 어느 것과도 정확히 같지 않다.** 정본이 없으므로 "다르다"가 결함이 아니다. 두 홈이
  동의한 값을 골랐고, 각 축의 판정은
  [`product.measured.json`](../../migration/product.measured.json)에 있다.
- **오류 상태를 다루지 않는다.** 제품은 프로젝트 피커에서 "없음"과 "실패"를 같은 표현으로 합치고
  색을 하드코딩했다(`rgb(251 146 150 / 0.95)`). 그 둘을 가르는 것이 이 컴포넌트의 판단이며, 오류
  표현은 별도 컴포넌트가 소유해야 한다.

- **집계 9벌 밖의 열 번째 정의는 이제 축이다.** 대시보드(분석) 섹션은 빈 상태와 fetch
  실패를 `AnalyticsStatePanel` 한 컴포넌트로 그린다(`components/scenes/analytics/shared.tsx:549-570`).
  이 패널은 **배경·1px 테두리·12px 반경을 갖는다** — 위 「9벌 전부 없음」 합의의 유일한 반례다.
  2026-09-06 에 그 실측을 `layout="compact"` 로 세웠으므로 **더 이상 「이 컴포넌트로 그릴 수 없는
  자리」가 아니다.** 아래 표가 그 축의 출처다.

  | 축 | 값 | 근거 |
  | --- | --- | --- |
  | 배경 | `var(--dashboard-chip-bg-strong)` | `shared.tsx:125` |
  | 테두리 | `1px solid var(--dashboard-input-border)` | `shared.tsx:126-127` |
  | 반경 | 12px (`--radius-12`, `tailwind.css:173`) | `shared.tsx:124` |
  | 패딩 | 20px (`p-10`, 격자 2px는 `tailwind.css:162`) | `shared.tsx:124` |
  | 블록 간격 | 6px (`gap-3`) | `shared.tsx:124` |
  | 제목 | `type-body-16-semibold` · `text-gray-000` | `shared.tsx:562` · `shared.tsx:137` |
  | 본문 | `type-body-14-regular` · `var(--dashboard-muted-color)`, 줄높이만 16 계열로 덮어쓴다 | `shared.tsx:565` · `shared.tsx:138-141` |
  | 그래픽 · 액션 | **없다** | `shared.tsx:554-568` |

  자식은 제목 span과 본문 span 둘뿐이다. **Anatomy의 Graphic·Action 슬롯을 대시보드에서 찾으면
  없다** — 여기서는 Title·Description만 사는 2슬롯 패널이고, `compact` 계약도 그 두 슬롯의 값만
  갖는다. 본문 줄높이를 제품이 `--type-body-16-line-height` 로 덮지만 두 계열의 비율이 모두 1.5 라
  **픽셀은 바뀌지 않는다**(14 x 1.5 = 21) — 덮어쓰기가 있다는 사실과 값이 갈린다는 사실은 다르다.

- **대시보드에서는 `error`와 `neutral`의 픽셀이 완전히 같다.** 오류 분기가 더하는 클래스 문자열이
  **빈 문자열**이다(`shared.tsx:132`). 원본 CSS의 오류 배경·테두리색은 특이도 싸움에서 져
  **원본에서도 그려지지 않던 죽은 선언**이었고, 제품은 분기만 남겼다(`shared.tsx:130-132`, 556-560행).
  아이콘도, 재시도 버튼도, 액센트 색도 없다. **두 톤을 색으로 구분해 그리면 배포본과 어긋난다** —
  구분은 문구가 혼자 진다. 이 컴포넌트가 「없음」과 「실패」를 가르기로 한 판단은 채택 목표이고,
  대시보드는 그 목표에 아직 도달하지 않은 반례다.
- **`canvas` 제목의 잉크가 제품과 다르다.** 제품은 `rgb(var(--gray-000-rgb) / 72%)` 로 흰색을 72%
  로 눌러 쓰고(`CanvasEmptyState.tsx:33-38`) LOUIS 는 `color-fg-primary` 를 그대로 쓴다. 알파 잉크를
  옮기지 않은 이유는 표면 사다리와 같다 — 알파는 바닥이 무엇이냐에 따라 다른 색이 되고, LOUIS 의
  잉크 역할은 바닥과 무관하게 정해진다. **대비를 이유로 값을 바꾼 것이 아니다**: 옮기지 않은
  것은 색이 아니라 «알파로 색을 만드는 방식»이다.
- **`canvas` 제목은 세미볼드다(2026-10-07).** 소유자 요청으로 제품이 먼저 굵기만 600 으로 덮었고(`b6844e0e8`,
  `CanvasEmptyState.tsx` 의 `HEADING_CLASS`), LOUIS 가 그 값을 받았다 — 크기 · 행간 · 자간은 heading-sm 그대로라
  `typography-heading-sm-semibold` 를 새로 열었다. 제품의 덮어쓰기는 핀을 이 판으로 올릴 때 지운다(포커스 링 브랜치가
  핀을 먼저 올린 뒤).
- **둘째 액션 줄은 React 컴포넌트가 아직 담지 못한다(2026-10-07).** `EmptyState` 의 `action` prop 은 슬롯 하나만
  그린다(`packages/react/src/empty-state`). 제품은 컴포넌트를 쓰지 않고 `louis-empty-state` · `__title` ·
  `__action` 클래스를 직접 써서 슬롯을 둘 세운다. `secondaryAction` 을 여는지, 소비처가 클래스로 계속 쓰는지는
  소유자 판정이다 — 이 문서는 CSS 계약만 갱신했다.
- **Figma `canvas` 변형은 이전 모양이다(2026-10-07).** 아직 제목 + 버튼 둘이고 카드 줄과 글자 단추 줄이 없다.
  `figma/components.measured.json` 의 canvas 계약은 이번에 건드리지 않았다.
- **`Graphic`·`Actions` 를 Figma variant 축으로 열지 않았다.** 자리의 유무는 이미
  `HasGraphic`·`HasDescription`·`HasAction` 불리언이 담고, 액션 «개수»는 소비처가 정하므로 코드
  쪽에 되잴 근거가 없다. 한 방향만 걸리는 값은 계약에 넣지 않는다.
- **세로 여백이 리터럴이다.** 세 칸의 여백·간격이 각각 소비처 하나뿐이라 토큰으로 승격하지 않았다.
- **Figma는 액션의 추가 간격을 padding으로 만든다.** CSS는 액션에 `margin-block-start: 4px`를
  더해 앞 요소와 16px 떨어지는데, Figma auto-layout에는 자식별 간격이 없어 같은 4px을 Action
  프레임의 위쪽 padding으로 표현한다. 결과는 같고 표현이 다르다.
- **설명 폭이 Figma에서 근사다.** CSS는 `44ch`이고 Figma에 `ch` 단위가 없어 16px 기준 400px을 쓴다.

## Acceptance tests

1. 여백·간격·그래픽 크기·타이포가 `components.measured.json`과 같다.
2. **배경·배경 이미지·테두리·반경·그림자가 모두 없다.**
3. 제목이 heading이고 `headingLevel`이 태그를 바꾼다.
4. 그래픽·설명·액션이 모두 선택이며 없으면 DOM에도 없다.
5. 그래픽이 `aria-hidden="true"`다.
6. root에 `aria-live`도 `role`도 없다.
7. 제목이 `foreground-primary`, 설명이 `foreground-secondary`다.
8. `layout`이 root의 `data-layout`을 정하고 **기본값에서도 속성이 붙는다.**
9. `layout="compact"`의 여백·간격·반경·테두리 두께·제목/설명 크기·정렬이
   `components.measured.json`의 `sizes.compact`와 같다.
10. `layout="canvas"`의 여백·간격·제목 크기·액션 추가 간격·정렬이 `sizes.canvas`와 같고,
    **배경도 테두리도 반경도 없다**(base와 같은 자리다).
11. `compact`만 면을 갖는다 — 배경이 `color-bg-raised`, 테두리 색이 `color-stroke-default`다.
