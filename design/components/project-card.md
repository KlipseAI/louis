---
id: project-card
status: experimental
authority: normative
summary: 프로젝트를 썸네일과 제목으로 보여 주고, 눌러서 엽니다.
---

# Project Card

프로젝트 하나를 썸네일과 제목으로 보여 주고, 눌러서 연다.

Klipse의 홈과 허브 화면은 전부 이 카드의 격자다. 제품에는 이 카드의 정의가 **4벌** 있다 — 앱 홈,
노드캔버스 홈, 하이라이트 허브, 비디오 에디터 허브. 네 벌의 기하가 서로 같아서, 이 컴포넌트의
값은 DS가 정한 것이 아니라 **제품 정본을 옮긴 것**이다.

## Availability

| Surface       | 상태           | 근거                                                            |
| ------------- | -------------- | --------------------------------------------------------------- |
| Web           | `partial`      | public export 10종과 실브라우저 acceptance test 6건; visual regression과 제품 소비 증거 없음 |
| Figma         | `partial`      | component 하나. parity 게이트가 자손 기하·타이포·흐림·자식 순서를 대조하고 변조 canary 7종이 검출력을 고정한다. publish는 DS-F-008 |
| Documentation | `done`         | 이 문서                                                          |
| Maturity      | `experimental` | 규범과 구현이 같은 변경 단위에서 처음 선다                       |

## When to use

- 격자 안에서 프로젝트·하이라이트·영상 같은 **시각 결과물 하나**를 대표할 때.
- 썸네일이 내용을 설명하고 제목이 그것을 확인해 주는 관계일 때.

쓰지 않는 자리.

- 썸네일이 없고 글만 있는 목록. 그것은 목록 행이지 카드가 아니다.
- 한 번에 하나만 보이는 상세 화면의 헤더.

## API

```tsx
<ProjectCard>
  <ProjectCardMedia aspectRatio={1}>
    <ProjectCardThumbnail>
      <img src={thumbnail} alt="" />
    </ProjectCardThumbnail>
    <ProjectCardOverlay>
      <ProjectCardEyebrow>하이라이트</ProjectCardEyebrow>
      <ProjectCardTitle>여름 여행</ProjectCardTitle>
      <ProjectCardMeta>3일 전 편집</ProjectCardMeta>
    </ProjectCardOverlay>
  </ProjectCardMedia>

  {/* 클릭 타깃은 카드 전체를 덮는 형제다. 순서가 계약이다 — Media → Action → Adornment. */}
  <ProjectCardAction href={`/highlight/${id}`} />
  <ProjectCardAdornment placement="top-end">{menu}</ProjectCardAdornment>
</ProjectCard>
```

**프레임을 링크로 만들지 않는다.** 처음 구현은 root 자체가 `<a>`였고, 그러면 슬롯의 더보기 버튼이
`<a>` 안의 대화형 자손이 되어 HTML이 무효가 되고 보조기술에서 동작이 정의되지 않는다. 이 문서가
바로 그 사용을 예시로 들고 있었다. 그래서 링크를 카드 전체에 늘려 깔고 슬롯을 그 **위**에 형제로
둔다.

## Anatomy

**자식 순서가 계약이다** — Media → Action → Adornment. 숫자 z-index를 쓰지 않으므로 칠 순서가 곧
DOM 순서이고, 슬롯이 Action 앞에 오면 슬롯 안의 컨트롤이 클릭 타깃에 덮여 눌리지 않는다.

1. **Card** — 프레임. 반경과 헤어라인 테두리를 소유하며 대화형이 아니다.
2. **Media** — 비율이 고정된 면. 썸네일·자리표시·오버레이의 좌표계다.
3. **Thumbnail** — 썸네일 자리. `<img>`나 `<video>`를 그대로 담는다.
4. **Overlay** — 미디어 하단의 제목 띠. 흐림 층을 소유한다.
5. **Eyebrow / Title / Meta** — 오버레이 안의 세 줄. 각각 한 줄로 잘린다.
6. **Action** — 카드 전체를 덮는 클릭 타깃. `<a>` 또는 `<button>`이다.
7. **Adornment** — 카드 모서리의 슬롯. 상태 칩과 더보기 메뉴가 들어간다.

## Properties

| part | prop | 값 | 기본 | 뜻 |
| --- | --- | --- | --- | --- |
| Action | `href` | string | 없음 | 있으면 `<a>`, 없으면 `<button>` |
| Media | `aspectRatio` | number | `1` | 폭 대 높이. **양수가 아니면 무시한다** |
| Adornment | `placement` | `top-start` \| `top-end` | `top-end` | 붙는 모서리 |

나머지는 각 요소의 네이티브 속성을 그대로 받는다.

`aspectRatio`가 0이나 음수면 미디어 면의 높이가 0이 되어 카드가 테두리만 남고 그 안의 절대 위치
자식이 전부 사라진다. 계산 결과가 실수로 흘러드는 자리라 컴포넌트가 막는다.

## Hierarchy와 variants

variant 축이 없다. 카드의 강조는 카드가 아니라 **썸네일**이 만든다. 상태(생성 중, 실패 등)는
`ProjectCardAdornment` 안의 별도 컴포넌트가 표현하며 카드 자신의 축으로 두지 않는다 — 제품의 네
벌이 이미 그렇게 하고 있고, 카드에 상태 축을 만들면 화면마다 다른 상태 어휘가 카드로 새어 들어온다.

## States

| state | 표현 |
| --- | --- |
| Default | 헤어라인 테두리, 변형 없음 |
| Hover | 카드 자신은 바뀌지 않는다. 슬롯 안의 컨트롤이 드러난다 |
| Active | `scale(0.975)`. `:has(.kds-project-card-action:active)`로 **클릭 타깃만** 본다 — 프레임에 직접 걸면 슬롯의 버튼을 눌러도 카드가 줄어든다 |
| Focus visible | 링은 프레임에 그린다. 투명한 클릭 타깃에만 링이 뜨면 무엇이 선택됐는지 모른다 |

**hover에서 카드 면을 바꾸지 않는다.** 카드의 대부분은 썸네일이고 그 위에 어떤 강조를 얹어도
이미지에 따라 결과가 달라진다. 제품 네 벌도 hover에서 면을 바꾸지 않는다.

## Interaction and responsive behavior

- 클릭 타깃이 네이티브 `<a>`/`<button>`이므로 Enter·Space·새 탭·링크 복사가 브라우저 기본으로 동작한다.
- 세 줄은 모두 한 줄로 잘린다. 카드 폭은 격자가 정하므로 줄바꿈을 허용하면 카드마다 높이가 다르다.
- 오버레이 높이는 px이 아니라 **미디어 높이의 30%를 하한으로** 갖는다
  (`block-size: fit-content; min-block-size: 30%`). 큰 카드에서는 30%가 이기고, 세 줄과 여백의 합이
  그보다 커지는 작은 카드에서는 내용이 이긴다. 경계는 미디어 높이 약 310px이며 격자의 최소 트랙
  240px은 그 아래다.

  처음 구현은 `block-size: 30%`만 두었다. 절대 위치 박스의 확정 크기라 내용이 커져도 자라지 않고
  **글자가 띠 위로 넘쳤다** — 240px에서 띠 71.4px에 내용 92.8px이라 eyebrow가 흐림이 0인 구간에
  놓였다. 실측으로 찾아 고쳤고 테스트가 최소 트랙에서 그것을 고정한다.
- `prefers-reduced-motion`에서 누름 변형을 없앤다.

## Content

- **Eyebrow**는 종류나 분류 한 단어다. 문장을 쓰지 않는다.
- **Title**은 사용자가 지은 이름이다. 길이를 제한하지 않고 잘라서 보여 준다.
- **Meta**는 시각이나 상태 한 조각이다. 두 정보를 이어 붙이지 않는다 — 잘리면 둘 다 못 읽는다.
- 썸네일의 `alt`는 **빈 문자열**이다. 제목이 바로 옆에 있어 같은 정보를 두 번 읽히지 않는다.

## 상호작용 축 (2026-08-18)

배포본 실측을 옮겼다. 전수 검증이 미등록 84건 중 **14건을 카드 상호작용으로 묶었고**, 그 14건이
아래 셋으로 닫힌다.

| 부품 | 계약 |
| --- | --- |
| 진입 stagger | `motion-list-enter`(560ms) · 항목당 36ms. **순서는 소비처가 준다** |
| `ProjectCardMore` | 32×32 · `media-control-*` 색 · hover와 **초점**에서 드러난다 |
| `ProjectCardRename` | 크롬 없음 · 초점 표시만 |

**진입 순서를 카드가 갖지 않는 이유** — 카드는 자기 순서를 알 방법이 없고, 알아도 그리드가 다시
정렬되면 틀린다. 그리고 스크롤로 더 불러온 카드에 0부터 다시 주면 **이미 있던 카드가 함께 튄다.**

**더보기 버튼이 media 색인 이유** — 면이 사진이다. 테마 색이면 밝은 썸네일 위에서 흰 버튼이
사라진다.

**`:focus-visible`이 아니라 `:focus-within`으로 드러내는 이유** — 브라우저 heuristic에 따라
키보드로 닿았는데도 안 보이는 경우가 생기고, 숨은 컨트롤에서 그것은 **닿을 수 없다는 뜻**이다.
초점 링 자체는 `:focus-visible`이 소유한다.

**reduced-motion에서는 항상 보인다.** 움직임을 줄여 달라고 한 사람에게 hover로만 드러나는
컨트롤은 찾기 어렵다.

**이름 변경에 크롬이 없는 이유** — 테두리나 면이 생기면 글자가 밀려 "다른 곳으로 갔다"처럼 보인다.

## Accessibility

- 클릭 타깃이 네이티브 `<a>`/`<button>`이다. 제품의 네 벌은 전부 `<article>`에 `onClick`을 걸어
  **키보드로 열 수 없고** 스크린 리더에 버튼으로도 읽히지 않는다. 그 구조는 옮기지 않았다.
- **클릭 타깃 안에 대화형 자손을 두지 않는다.** `ProjectCardAdornment`는 그 형제이며 위에 칠해진다.
- 클릭 타깃의 이름은 `ProjectCardTitle`에서 온다. id는 호출부가 만들면 카드가 여럿일 때 겹치므로
  컴포넌트가 인스턴스마다 발급한다. 제목이 없는 카드는 `aria-label`을 직접 준다.
- focus ring은 프레임에 그린다(`:has()`).
- **오버레이 글자의 대비는 썸네일에 달려 있어 보장되지 않는다.** 흐림이 뒤를 고르게 만들지만
  값을 고정하지는 못한다. 아래 Known deviations를 본다.

## Specification

| 축 | 값 | 토큰 |
| --- | ---: | --- |
| 반경 | 16px | `radius-card` |
| 오버레이 높이 하한 | 미디어의 30% | — |
| 테두리 | 0.5px | `border-width-hairline` + `color-border-subtle` |
| 미디어 배경 | — | `color-background-canvas` |
| 오버레이 여백 | 16px | `space-layout-gutter` |
| 줄 간격 | 4px | `space-stack-xs` |
| 줄 높이 | 1.2 | — |
| 배경 흐림 | 10px | `blur-surface` |
| 제목 | body-md-medium | `typography-body-md-medium` |
| Eyebrow·Meta | body-sm-regular | `typography-body-sm-regular` |
| 누름 | `scale(0.975)` | — |

## Effects

**프로그레시브 블러 하나뿐이다.** 오버레이의 `::before`가 `backdrop-filter: blur(10px)`에 위로
사라지는 mask를 걸어, 아래는 온전히 흐리고 위로 갈수록 흐림이 사라진다.

| 위치(아래에서) | 남는 흐림 |
| ---: | ---: |
| 0% | 1 |
| 55% | 1 |
| 70% | 0.8 |
| 85% | 0.4 |
| 100% | 0 |

불투명 스크림을 덮는 방식과 다르다. 스크림은 썸네일의 색을 지우지만 흐림은 색을 남기면서 글자 뒤의
고주파 성분만 없앤다. Figma에서는 같은 뜻을 `BACKGROUND_BLUR`의 `PROGRESSIVE` 모드가 표현한다.

정지점은 [`figma/components.measured.json`](../../figma/components.measured.json)이 갖는다 — 코드와
Figma가 같은 원천을 본다.

## Implementation

- `.kds-project-card`는 격자 트랙을 채운다(`inline-size: 100%`). 프레임이 내용에 맞춰 줄어들면
  미디어 폭이 `100%`라 서로를 참조해 0으로 접힌다 — 240px 트랙에서 2px(테두리만)로 쟀다.
- `box-sizing`을 카드와 오버레이에 **명시한다.** 소비자의 reset에 기대면 결과가 달라지고, 오버레이가
  content-box면 30% 띠에 여백 32px이 더해져 39%가 된다.
- 숫자 z-index를 쓰지 않는다. 칠 순서는 곧 DOM 순서다 — 흐림 층은 `::before`라 트리 순서에서 앞이고
  텍스트 wrapper가 `position: relative`로 그 위에 온다. 카드 수준에서는 **Media → Action →
  Adornment**가 그 계약이다.
- 썸네일은 `ProjectCardThumbnail`이 자리를 잡는다. CSS가 `.kds-project-card-media > img`를 직접
  잡으면 Next.js `Image`처럼 래퍼를 하나 더 만드는 컴포넌트를 넣는 순간 선택자가 빗나간다.
- 누름 전환은 `transition-property`에 **`scale`**을 적는다. `scale`은 `transform`과 별개 property라
  `transform`만 적으면 선언이 아무것도 전이하지 않는다 — 이 저장소의 네 컴포넌트가 그 상태였다.

## Known deviations

- **오버레이 대비를 보장하지 못한다.** 흰 썸네일 위의 밝은 글자, 검은 썸네일 위의 어두운 글자가
  가능하다. 제품은 하이라이트 카드에 한해 dominant color의 광도를 계산해 글자색을 뒤집지만, 나머지
  카드는 테마 색을 그대로 쓴다. DS도 같다. 해소하려면 썸네일의 평균 광도를 읽어야 하며 그것은
  런타임 계약이라 이 컴포넌트가 소유할 수 없다.
- **줄 높이 1.2가 리터럴이다.** tight 축의 typography 토큰이 소스에 없다. 제품도 같은 이유로
  `--project-card-overlay-line-height`를 따로 두며, 그 변수는 카드 4벌에서만 쓰인다(15곳) — 타입
  스케일의 축이 아니라 카드의 값이다. **Figma에서는 이것이 text style을 못 쓰게 만든다** — Figma
  text style은 all-or-nothing이라 줄 간격만 덮으면 style 연결이 끊긴다. 그래서 세 줄은 style에
  묶이지 않고 parity 게이트가 `fontSize`와 `lineHeightPercent`를 직접 대조한다.
- **미디어 배경이 light에서 제품과 7/255 다르다.** 제품은 `palette-gray-200`(#e3e4e8), DS는
  `color-background-canvas`(light #f1f1f3 · dark #171b22)다. dark는 정확히 같다. 이 한 자리를 위해
  색 계단을 늘리지 않는다.
- **위계를 opacity가 아니라 토큰으로 만든다.** 제품은 같은 색에 0.72/0.7을 곱한다. 그러면 결과가
  뒤에 놓인 썸네일에 따라 달라진다.

## Acceptance tests

1. 240px 트랙 안에서 카드가 접히지 않는다(폭이 트랙과 같다).
2. `aspect-ratio` 기본값에서 카드의 폭과 높이가 같다.
3. 반경이 16px이고 `radius-card`에서 온다.
4. 측정 폭 360에서 오버레이 띠가 미디어 높이의 정확히 30%다.
5. **최소 트랙 240에서 내용이 띠 위로 넘치지 않고, 띠가 30%보다 커진다.**
6. 오버레이 `::before`의 `backdrop-filter`가 `blur(10px)`이고, mask가 Effects 표의 다섯 정지점을
   그대로 갖는다.
7. **슬롯 안의 버튼이 실제로 눌린다** — 그 좌표의 최상위 요소가 그 버튼이고, 클릭이 카드로 새지
   않는다. DOM 순서를 되읽는 것으로는 증명되지 않는다.
8. 클릭 타깃이 카드의 padding box 전체를 덮고 **대화형 자손을 하나도 갖지 않는다.**
9. 클릭 타깃의 `aria-labelledby`가 제목의 id를 가리킨다.
10. `href`가 있으면 `<a>`, 없으면 `<button>`으로 렌더된다.
11. `aspectRatio`가 0이면 무시하고 기본 1을 쓴다.
12. 누름 전환이 실제로 걸린다 — `transition-property`에 `scale`이 있다.
