---
id: transform-frame
status: experimental
authority: normative
---

# TransformFrame

매체 위에 사각형 하나를 세우고 그 변과 모서리에 잡을 곳을 붙인다. 자를 곳을 고르는 일과 고른
것을 표시하는 일은 같은 조형이고, 이 컴포넌트가 그 하나를 소유한다.

## Availability

| Surface       | 상태           | 근거                                                             |
| ------------- | -------------- | ---------------------------------------------------------------- |
| Web           | `partial`      | CSS 레시피만 있다. React 표면은 없다 — Alert · Switch 와 같은 형태 |
| Figma         | `done`         | `TransformFrame` component set (`1362:1297`), 2 variant + Grid    |
| Documentation | `done`         | 이 문서                                                          |
| Maturity      | `experimental` | 제품이 이 레시피를 물면 stable 후보                              |

## When to use

- 이미지·영상에서 **남길 영역**을 고르게 할 때(크롭).
- 캔버스·프리뷰 위에서 **고른 것**을 표시하고 크기를 바꾸게 할 때(선택 상자).
- 쓰지 말아야 할 때: 값을 한 축으로만 고르는 자리. 그것은 Slider 다.
- 쓰지 말아야 할 때: 잡을 곳 없이 영역만 표시하는 자리. 테두리 하나면 된다.

## Anatomy

1. **Frame** — 남길 영역 또는 고른 것의 경계. 자기 크기를 갖지 않는다(소비처가 정한다).
2. **Grid** — 삼분할 안내선. 크롭에는 있고 선택에는 없다.
3. **Handle** — 잡을 곳. 모서리 넷 또는 모서리 넷 + 변 넷. **여덟 자리가 같은 점 하나다** —
   한때 변만 알약으로 눕혔고, 접은 사유는 DS-D-0062 가 갖는다.
4. **Scrim**(선택) — 버려질 바깥을 덮는 층. 프레임이 아니라 **무대**의 값이라 소비처가 켠다.

## Properties

| Property | 값                            | 기본값             | 설명                                          |
| -------- | ----------------------------- | ------------------ | --------------------------------------------- |
| Handles  | `corners` · `corners-and-edges` | `corners`          | 내놓을 손잡이 벌. 마크업이 정한다             |
| Grid     | `false` · `true`              | `true`             | 삼분할 안내선의 유무                          |

`data-louis-scrim` 을 프레임에 걸면 바깥을 덮는 층이 켜진다. 축이 아니라 소비처의 스위치다.

## Variants, sizes, and states

**축은 `Handles` 하나다.** 손잡이 여덟 자리는 축이 아니라 좌표다 — 넷 또는 여덟이 동시에 선다.
자리마다 **모양이 갈리지도 않는다.** 어느 축을 움직이는지는 자리(모서리냐 변의 가운데냐)와
커서가 말하고, 모양까지 그 일을 맡으면 짧은 상자 위에서 손잡이가 창보다 커진다(DS-D-0062).

**비율 잠금은 별도 축이 아니다.** 비율이 잠기면 변 손잡이가 사라진다. 변을 혼자 끌면 비율을
지키느라 반대 축도 함께 움직여 「한쪽만 줄인 게 아니다」가 되기 때문이고, 제품의 두 구현이
이미 그 규칙을 갖고 있다. 그래서 잠금은 이 축의 **원인**이지 두 번째 축이 아니다. 근거는
DS-D-0060 이 갖는다.

**없는 손잡이는 숨기지 않고 그리지 않는다.** 숨김으로 두면 잡히지 않는 손잡이가 접근성 트리에
남고, Figma 쪽에서는 불리언이 component set 단위라 한 변형을 숨기면 다른 변형의 그 자리까지
사라진다.

크기 축은 없다. 프레임의 크기는 사용자가 끄는 영역의 크기이고, 손잡이는 그것과 무관하게 같다.

## States

**상태 축이 없다.** Figma 의 축은 `Handles` 하나와 불리언 `Grid` 뿐이고, 레시피에도
`:hover` · `:focus` · `:active` · `[disabled]` 선언이 하나도 없다. 제품 넷 어디에도 그 선언이
없기 때문이다 — 넷 다 포인터를 손잡이 위에서 «끄는» 조작만 그리고, 잡기 전과 잡은 뒤의 그림이
같다.

| 상태 | 무엇이 바뀌나 | 어디가 소유하나 |
| --- | --- | --- |
| 기본 | 프레임 1 · 손잡이 12 · 안내선 1 | 이 레시피 |
| 손잡이 위 | **면도 잉크도 바뀌지 않는다.** 커서만 그 손잡이가 움직이는 축으로 바뀐다(`nwse` · `ns` · `nesw` · `ew`) | 이 레시피 |
| 끄는 중 | 그림이 그대로다. 프레임과 손잡이에 `touch-action: none` 이 걸려 브라우저가 스크롤·줌으로 가로채지 않는다 | 이 레시피(선언) · 소비처(좌표) |
| 비율 잠김 | 변 손잡이 넷이 **사라진다** | `Handles=corners` — 상태가 아니라 축이다 |
| 바깥이 덮인다 | 버려질 바깥에 스크림 한 겹 | 소비처가 `data-louis-scrim` 으로 켠다 |
| 무대가 확대됨 | 손잡이·선이 화면 위에서 같은 크기로 남는다 | 소비처가 `--louis-transform-frame-scale` 에 배율을 넣는다 |

**비율 잠금을 상태로 열지 않은 이유가 이 표의 요지다.** 잠기면 변 손잡이가 없어지는데, 그것을
상태로 적으면 `Handles=corners-and-edges` × `잠김` 이라는 실현되지 않는 칸이 생긴다. 제품 두
구현이 이미 그것을 축으로 접어 두었다(하나는 `opacity: 0` + `pointer-events: none`, 다른 하나는
`display: none`).

**포커스 상태가 없는 것은 결손이다.** 손잡이가 키보드로 잡히지 않아 포커스가 갈 자리가 없고,
그 사실은 아래 Accessibility 와 Known deviations 6 이 갖는다. 상태 축을 여기서 여는 것이 아니라
키보드 조절이 서는 회차에 함께 연다.

## Interaction and responsive behavior

- 손잡이는 변의 **바깥으로 절반** 나간다. 잡는 곳이 안쪽에만 있으면 자를 곳의 마지막 몇 px 을
  손가락이 덮는다. 그래서 프레임은 자식을 자르지 않는다.
- 무대가 확대돼 있으면 `--louis-transform-frame-scale` 에 그 배율을 넣는다. 손잡이와 선이
  화면 위에서 같은 크기로 남는다.
- 포인터 수학(끌기·클램프·비율 유지)과 프레임의 자리는 소비처가 소유한다. 이 레시피는 모양만
  소유한다 — PaneDivider 가 `grid-area` 를 소비처에 남긴 것과 같다.
- 손잡이와 프레임에 `touch-action: none` 이 걸린다. 끄는 동안 브라우저가 스크롤·줌으로
  가로채지 않게 한다.

## Content

글자가 없다. 크기·비율 같은 수치를 곁들이려면 프레임 밖에 두고 이 컴포넌트에 넣지 않는다 —
프레임 안에 글자를 얹으면 매체를 가린다.

## Accessibility

- 손잡이는 **잡을 수 있는 것**이므로 이름과 역할이 있어야 한다. 이 레시피는 모양만 주고,
  소비처가 `role`·`aria-label`·키보드 조절을 붙인다. 오늘 제품 넷 중 어느 것도 키보드로 크기를
  바꾸지 못한다 — 값을 여기서 정할 수 없어 표식만 남긴다.
- 손잡이의 잡히는 크기가 12 라 `layout-control-hit-target-minimum` 에 못 미친다. 포인터로
  정밀하게 끄는 조작이라 손잡이를 그 크기로 키우면 서로 겹쳐 자를 곳이 보이지 않는다.
  소비처가 히트 영역을 넓히는 것이 옳은 자리다 — PaneDivider 가 `::after` 로 그렇게 한다.
- 색이 테마를 따르지 않는다. 이 선이 놓이는 바닥은 페이지가 아니라 매체이고 매체는
  라이트·다크를 모른다.

## Specification

| Part/state    | Token or recipe                    | 구현 근거                                     |
| ------------- | ---------------------------------- | --------------------------------------------- |
| 프레임 두께   | `border-width-default`             | 매체 위의 표식이지 컨트롤의 링이 아니다(DS-D-0062) |
| 프레임 곡률   | 0                                  | 직각. 잘림선이 모서리에서도 직각이다          |
| 프레임 색     | `color-accent-primary`             | 「지금 이것이 선택돼 있다」                    |
| 손잡이 크기   | 12                                 | 제품 실측 둘이 이 수다                        |
| 변 손잡이 크기 | 12                                | 모서리와 같다. 축은 자리와 커서가 말한다      |
| 손잡이 곡률   | `radius-pill`                      | 여덟 자리가 모두 원                           |
| 손잡이 면     | `color-media-indicator-active`     | 매체 위에서 테마를 타지 않는 표식             |
| 손잡이 링     | `border-width-default` · `color-accent-primary` | 프레임과 같은 두께          |
| 안내선 두께   | `border-width-default`             | 삼분할 선                                     |
| 안내선 색     | `color-media-indicator-rest`       | 매체 위의 쉬는 표식                           |
| 스크림        | `color-dim-modal`                  | 소비처가 켠다                                 |

## Implementation

- Web source: packages/css/src/component/transform-frame.css
- Public import: `@klipse-design/css` (레시피 클래스). React 표면 없음
- Figma component: `TransformFrame` (`1362:1297`)
- Tests/visual evidence: packages/react/test/transform-frame.browser.test.tsx 가
  figma/components.measured.json 의 transform-frame 을 되잰다

### Usage

```html
<div class="louis-transform-frame">
  <div class="louis-transform-frame__grid">
    <i class="louis-transform-frame__grid-line" data-axis="vertical" data-third="1"></i>
    <i class="louis-transform-frame__grid-line" data-axis="vertical" data-third="2"></i>
    <i class="louis-transform-frame__grid-line" data-axis="horizontal" data-third="1"></i>
    <i class="louis-transform-frame__grid-line" data-axis="horizontal" data-third="2"></i>
  </div>
  <span class="louis-transform-frame__handle" data-position="nw"></span>
  <!-- … 내놓을 자리만 -->
</div>
```

## Acceptance tests

값의 정본은 `figma/components.measured.json` 의 `transform-frame` 이고, 두 방향이 그것을 각각
되잰다 — Figma 쪽은 `verify-figma-parity`, 코드 쪽은 아래 브라우저 시험이다. 한 방향만 걸려
있으면 기록과 Figma 를 함께 옮겨 초록을 유지할 수 있다.

1. 두 벌(`corners` · `corners-and-edges`) 각각에서 프레임의 테두리 두께가 1, 곡률이 0 이다.
2. 같은 두 벌에서 모서리 손잡이 넷이 12×12 이고 곡률이 999 이며, 테두리 두께가 **프레임과
   같은 1** 다 — 계약에 두께 키가 하나뿐인 것이 그 사실이다.
3. 삼분할 안내선은 세로선의 폭과 가로선의 높이가 각각 1 이다. 나머지 한 축은 창의 크기라
   재지 않는다.
4. `corners` 에서 변 손잡이 넷이 **DOM 에 없다.** 숨긴 것과 그리지 않은 것을 가르는 시험이다 —
   숨기면 잡히지 않는 손잡이가 접근성 트리에 남는다.
5. 변 손잡이 넷이 **모서리와 같은 12×12** 다. 한 축만 조용히 늘어나는 회귀를 잡으려고 폭과
   높이를 각각 대조한다.
6. 손잡이 넷이 프레임의 변 **바깥으로 정확히 절반**(6) 나간다. 두 상자의 관계라 계약 표로는
   적을 수 없어 이 시험이 소유한다. Figma 쪽의 같은 사실은 되읽기의 `outsideParts` 가 갖는다.
7. Figma 되읽기에서 `rawFills` · `rawStrokes` 가 0 이다 — 색이 전부 변수에 물려 있다.

1~6 은 `packages/react/test/transform-frame.browser.test.tsx` 가 실브라우저 계산값으로 잰다 —
다섯 시험이고, 값을 파일에 적지 않고 `figma/components.measured.json` 에서 읽어 대조한다.
7 은 parity 게이트의 몫이다.

**React 컴포넌트가 아니라 클래스 마크업을 렌더한다.** 이 컴포넌트에는 React 표면이 없고
정본이 CSS 레시피라, 시험이 재는 마크업은 위 Usage 절이 적은 계약 그대로여야 한다 — 소비처가
지켜야 하는 것과 다른 마크업을 재면 제품에 없는 값을 지키게 된다.

## Known deviations

1. **제품이 아직 이 레시피를 물지 않는다.** 원장의 네 표면은 `needed` 로 남아 있다. 값의
   출처는 제품이지만 대응은 제품이 클래스를 바꿔 물 때 선다.
2. **안내선 색이 제품보다 한 단 진하다.** 제품은 흰색 24%, 이 레시피는
   `color-media-indicator-rest`(28%)다. LOUIS 에 24% 짜리 매체 위 표식 토큰이 없고, 만들면 배너
   인디케이터가 이미 쓰는 값 옆에 두 번째 「매체 위 흐린 표식」이 생긴다.
3. **모서리 브래킷을 버렸다.** 비디오 편집기의 크롭은 모서리를 두 변만 그린 24×24 ㄱ자로
   그린다. Figma 에서 변마다 다른 두께를 주면 되읽기가 두께를 아무 값도 담지 못하고, 그
   브래킷은 뒤에 매체가 있을 때만 읽혀 선택 상자에서 성립하지 않는다. DS-D-0060 이 판정을 갖는다.
4. **잠긴 축(좌우 손잡이 둘)이 없다.** 배경 없는 자동맞춤 텍스트 오버레이는 세로 크기가
   내용에서 계산돼 좌우 둘만 내놓는다. 실재하는 자리가 하나뿐이라 값을 지어내지 않았다.
5. **모바일 분기가 없다.** `react-image-crop` 은 `pointer: coarse` 에서 손잡이를 24 로 키우고
   변 손잡이를 없앤다. 제품의 다른 둘에는 그 분기가 없어 대조할 실측이 하나뿐이다.
6. **키보드 조절이 없다.** 위 Accessibility 가 사유를 갖는다.
7. **삼분할 안내선의 기준 상자가 두 매체에서 다르다.** CSS 의 절대 배치는 테두리 **안쪽**을
   기준으로 삼아 선이 선 안쪽 폭의 삼분점에 서고, Figma 의 자손은 프레임 상자 전체를 기준으로
   삼는다. 차이는 프레임 두께만큼(각 변 2)이다. 제품의 클립 크롭도 CSS 쪽과 같은 방식이라
   보이는 것은 제품과 같고, 이 값은 계약에 들어 있지 않다.
8. **작업 영역이 있는 모달(Dialog `workbench`)이 서지 않았다.** 세 크롭 모달의 폭·곡률·높이
   상한이 수렴하지 않는다. DS-D-0060 Alternatives 가 그 판정을 갖는다.

## Migration and changelog

새 컴포넌트다. 대체하는 API 가 없다.

2026-09-09 — 크롬을 한 단 낮췄다. 프레임과 손잡이의 선이 2 에서 1 로 내려가고, 변 손잡이의
알약(12×36)이 모서리와 같은 원(12×12)이 됐다. 계약 키 `edgeHandleLength` 가
`edgeHandleSize` 로 바뀐다. 사유는 DS-D-0062. [Updates](../updates/README.md) 참조.
