---
id: project-card
status: experimental
authority: normative
---

# Project Card

프로젝트 하나를 썸네일과 제목으로 보여 주고, 눌러서 연다.

Klipse의 홈과 허브 화면은 전부 이 카드의 격자다. 제품에는 이 카드의 정의가 **4벌** 있다 — 앱 홈,
노드캔버스 홈, 하이라이트 허브, 비디오 에디터 허브. 네 벌의 기하가 서로 같아서, 이 컴포넌트의
값은 DS가 정한 것이 아니라 **제품 정본을 옮긴 것**이다.

## Availability

| Surface       | 상태           | 근거                                                            |
| ------------- | -------------- | --------------------------------------------------------------- |
| Web           | `partial`      | public export 8종과 실브라우저 구조 테스트; visual regression과 제품 소비 증거 없음 |
| Figma         | `not-ready`    | component set 없음. DS-F-006의 다음 대상                        |
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
<ProjectCard href={`/highlight/${id}`}>
  <ProjectCardMedia aspectRatio={1}>
    <img src={thumbnail} alt="" />
    <ProjectCardOverlay>
      <ProjectCardEyebrow>하이라이트</ProjectCardEyebrow>
      <ProjectCardTitle>여름 여행</ProjectCardTitle>
      <ProjectCardMeta>3일 전 편집</ProjectCardMeta>
    </ProjectCardOverlay>
    <ProjectCardAdornment placement="top-end">{menu}</ProjectCardAdornment>
  </ProjectCardMedia>
</ProjectCard>
```

## Anatomy

1. **Card** — 대화형 root. 반경과 헤어라인 테두리를 소유한다.
2. **Media** — 비율이 고정된 면. 썸네일·자리표시·오버레이·슬롯의 좌표계다.
3. **Overlay** — 미디어 하단의 제목 띠. 흐림 층을 소유한다.
4. **Eyebrow / Title / Meta** — 오버레이 안의 세 줄. 각각 한 줄로 잘린다.
5. **Adornment** — 미디어 모서리의 슬롯. 상태 칩과 더보기 메뉴가 들어간다.

## Properties

| part | prop | 값 | 기본 | 뜻 |
| --- | --- | --- | --- | --- |
| Card | `href` | string | 없음 | 있으면 `<a>`, 없으면 `<button>` |
| Media | `aspectRatio` | number | `1` | 폭 대 높이 |
| Adornment | `placement` | `top-start` \| `top-end` | `top-end` | 붙는 모서리 |

나머지는 각 요소의 네이티브 속성을 그대로 받는다.

## Hierarchy와 variants

variant 축이 없다. 카드의 강조는 카드가 아니라 **썸네일**이 만든다. 상태(생성 중, 실패 등)는
`ProjectCardAdornment` 안의 별도 컴포넌트가 표현하며 카드 자신의 축으로 두지 않는다 — 제품의 네
벌이 이미 그렇게 하고 있고, 카드에 상태 축을 만들면 화면마다 다른 상태 어휘가 카드로 새어 들어온다.

## States

| state | 표현 |
| --- | --- |
| Default | 헤어라인 테두리, 변형 없음 |
| Hover | 카드 자신은 바뀌지 않는다. 슬롯 안의 컨트롤이 드러난다 |
| Active | `scale(0.975)` |
| Focus visible | 공유 focus ring |

**hover에서 카드 면을 바꾸지 않는다.** 카드의 대부분은 썸네일이고 그 위에 어떤 강조를 얹어도
이미지에 따라 결과가 달라진다. 제품 네 벌도 hover에서 면을 바꾸지 않는다.

## Interaction and responsive behavior

- root가 네이티브 `<a>`/`<button>`이므로 Enter·Space·새 탭·링크 복사가 브라우저 기본으로 동작한다.
- 세 줄은 모두 한 줄로 잘린다. 카드 폭은 격자가 정하므로 줄바꿈을 허용하면 카드마다 높이가 다르다.
- 오버레이 높이는 px이 아니라 미디어 높이의 30%다. 카드가 작아져도 흐림이 글자를 덮는다.
  **하한이 있다** — 세 줄과 여백의 합보다 30%가 작아지면 오버레이가 내용 높이로 자란다. 그 경계는
  미디어 높이 약 310px이며, 격자의 최소 트랙 240px에서는 실제로 넘어간다.
- `prefers-reduced-motion`에서 누름 변형을 없앤다.

## Content

- **Eyebrow**는 종류나 분류 한 단어다. 문장을 쓰지 않는다.
- **Title**은 사용자가 지은 이름이다. 길이를 제한하지 않고 잘라서 보여 준다.
- **Meta**는 시각이나 상태 한 조각이다. 두 정보를 이어 붙이지 않는다 — 잘리면 둘 다 못 읽는다.
- 썸네일의 `alt`는 **빈 문자열**이다. 제목이 바로 옆에 있어 같은 정보를 두 번 읽히지 않는다.

## Accessibility

- root가 대화형 요소다. 제품의 네 벌은 전부 `<article>`에 `onClick`을 걸어 **키보드로 열 수 없고**
  스크린 리더에 버튼으로도 읽히지 않는다. 그 구조는 옮기지 않았다.
- 카드 안에 다른 컨트롤을 둘 때 `<a>` 안에 `<button>`을 중첩할 수 없다. `ProjectCardAdornment`는
  미디어 면 위에 절대 배치되며, 호출부가 그 컨트롤의 이벤트 전파를 막는다.
- focus ring은 공유 `.kds-focus-ring`이다.
- **오버레이 글자의 대비는 썸네일에 달려 있어 보장되지 않는다.** 흐림이 뒤를 고르게 만들지만
  값을 고정하지는 못한다. 아래 Known deviations를 본다.

## Specification

| 축 | 값 | 토큰 |
| --- | ---: | --- |
| 반경 | 16px | `radius-card` |
| 테두리 | 0.5px | `border-width-hairline` + `color-border-subtle` |
| 미디어 배경 | — | `color-background-canvas` |
| 오버레이 높이 | 미디어의 30% | — |
| 오버레이 여백 | 16px | `space-layout-gutter` |
| 줄 간격 | 4px | `space-card-text-gap` |
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

- `.kds-project-card`는 격자 트랙을 채운다(`inline-size: 100%`). `<button>`/`<a>`는 내용에 맞춰
  줄어드는데 미디어 폭이 `100%`라 서로를 참조해 0으로 접힌다.
- `box-sizing`을 카드와 오버레이에 **명시한다.** `<button>`은 UA 기본이 border-box지만 `<a>`는
  아니고, 오버레이가 content-box면 30% 띠에 여백 32px이 더해져 39%가 된다.
- 숫자 z-index를 쓰지 않는다. 흐림 층은 `::before`이므로 트리 순서에서 앞이고, 텍스트 wrapper가
  `position: relative`가 되어 그 위에 칠해진다. **Adornment는 Overlay 뒤에 둔다** — 앞에 두면
  하단 모서리의 컨트롤이 흐림 층에 덮인다.

## Known deviations

- **오버레이 대비를 보장하지 못한다.** 흰 썸네일 위의 밝은 글자, 검은 썸네일 위의 어두운 글자가
  가능하다. 제품은 하이라이트 카드에 한해 dominant color의 광도를 계산해 글자색을 뒤집지만, 나머지
  카드는 테마 색을 그대로 쓴다. DS도 같다. 해소하려면 썸네일의 평균 광도를 읽어야 하며 그것은
  런타임 계약이라 이 컴포넌트가 소유할 수 없다.
- **줄 높이 1.2가 리터럴이다.** tight 축의 typography 토큰이 소스에 없다. 제품도 같은 이유로
  `--project-card-overlay-line-height`를 따로 둔다.
- **미디어 배경이 light에서 제품과 7/255 다르다.** 제품은 `palette-gray-200`(#e3e4e8), DS는
  `color-background-canvas`(light #f1f1f3 · dark #171b22)다. dark는 정확히 같다. 이 한 자리를 위해
  색 계단을 늘리지 않는다.
- **위계를 opacity가 아니라 토큰으로 만든다.** 제품은 같은 색에 0.72/0.7을 곱한다. 그러면 결과가
  뒤에 놓인 썸네일에 따라 달라진다.

## Acceptance tests

1. 240px 트랙 안에서 카드가 접히지 않는다(폭이 트랙과 같다).
2. `aspect-ratio` 기본값에서 카드의 폭과 높이가 같다.
3. 반경이 16px이고 `radius-card`에서 온다.
4. 오버레이 띠가 미디어 높이의 정확히 30%다(내용이 그보다 작을 때).
5. 오버레이 `::before`의 `backdrop-filter`가 `blur(10px)`이고, mask가 Effects 표의 다섯 정지점을
   그대로 갖는다.
6. Adornment가 Overlay 뒤에 있고 둘 다 숫자 z-index를 쓰지 않는다.
7. `href`가 있으면 `<a>`, 없으면 `<button>`으로 렌더된다.
