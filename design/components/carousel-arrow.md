---
id: carousel-arrow
status: experimental
authority: normative
summary: 캐러셀을 앞뒤로 넘기는 32×32 화살표 버튼입니다.
---

# Carousel Arrow

캐러셀 헤더에서 트랙을 한 칸씩 넘기는 버튼. **한 쌍(prev + next)으로만 쓴다** — 하나만 놓는
자리는 없다.

**정본은 제품이다.** `CarouselArrows.tsx` 가 구현이고 LOUIS 에는 표면이 없다 —
`packages/css/src/component` 에 `carousel-arrow.css` 가 없고 `packages/react/src` 에도 없다.
랜딩의 캐러셀 세 곳(최신 AI 모델 · 그 외 기능 · 최신 소식)과 사용 후기 밴드가 **똑같은 버튼
쌍**을 쓴다.

**맨 앞·맨 뒤는 색이 아니라 `disabled` 다.** 시안에서 이전 버튼이 흐린 것은 상태 표현이 아니라
「더 넘길 곳이 없다」는 뜻이다. 그래서 글자색만 낮추는 것이 아니라 실제로 버튼을 비활성화한다 —
포인터 커서도 바뀌고 클릭도 먹지 않는다.

## Availability

| Surface       | 상태           | 근거                                                                                                                                                                        |
| ------------- | -------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Web           | `not-ready`    | 제품 구현이 정본이고 소비처가 다섯 자리다. **LOUIS 표면은 0** — CSS 레시피도 React export 도 없고 acceptance test 도 0건이다                                                |
| Figma         | `partial`      | `CarouselArrow` 6 variant(`Direction` × `State`). parity 게이트가 대조하는 것은 캐럿 stroke(1 · `CENTER`) · 헤어라인 effect(`INNER_SHADOW:0:0:0.5`) · 속성 축 · raw fill·stroke 0 넷이다. **기하는 대조하지 않는다** — `figma/components.measured.json` 에 `carousel-arrow` 항목이 없다 |
| Documentation | `done`         | 이 문서                                                                                                                                                                     |
| Maturity      | `experimental` | 되읽기와 문서가 방금 처음 섰다. LOUIS recipe 가 서고 기하 실측이 붙으면 승격한다                                                                                            |

## When to use

- 가로로 스크롤하는 트랙 옆에 「이전 / 다음」 컨트롤이 필요할 때. 랜딩 캐러셀 헤더가 그 자리다.
- 쓰지 않는 자리:
  - **일반 아이콘 버튼** — [Icon Button](./icon-button.md) 이다. 크기·강조 축이 있고 면이 잉크
    8% 오버레이가 아니다.
  - **배너 캐러셀 안의 화살표** — [Banner Carousel](./banner-carousel.md) 이 자기 컨트롤을
    소유한다. 그쪽은 배너 위에 얹히고 이쪽은 페이지 바탕 위에 놓인다.
  - **점 인디케이터** — 이 컴포넌트가 아니다.

## Anatomy

1. **Button** — 32 × 32 알약 아닌 사각(radius 12). 면은 잉크 8% 오버레이 + 0.5 헤어라인.
2. **Caret** — 16 × 16 프레임.
3. **glyph** — 그 안의 5 × 10 벡터. 획 1, 둥근 끝.

쌍의 간격은 **4** 다. 그 값은 쌍을 감싸는 래퍼가 갖고 있고 이 컴포넌트에는 없다.

## Properties

정본은 제품 컴포넌트의 prop 이다. **제품은 쌍을 하나의 컴포넌트로 내보낸다** — Figma 는 그중
버튼 하나를 set 으로 뽑았으므로 대응이 1:2 다.

| prop | 값 | 기본 | 뜻 |
| --- | --- | --- | --- |
| `onPrev` / `onNext` | 콜백 | 없음 | 트랙을 한 칸 옮긴다 |
| `prevDisabled` / `nextDisabled` | boolean | `false` | 맨 앞·맨 뒤. `disabled` 속성이 된다 |
| `prevLabel` / `nextLabel` | 문구 | 없음 | `aria-label`. **필수다** — 버튼에 글자가 없다 |

| Figma | 타입 | 코드 대응 |
| --- | --- | --- |
| `Direction` | VARIANT `prev` · `next` | 쌍의 어느 쪽인가. 코드에서는 두 개의 `<button>` 이라 prop 이 아니다 |
| `State` | VARIANT `Default` · `Hover` · `Disabled` | `Hover` 는 CSS 상태, `Disabled` 는 `*Disabled` prop |

## Variants, sizes, and states

크기 축이 없다. 32 × 32 하나다.

| 축 | 값 | 무엇이 바뀌나 |
| --- | --- | --- |
| `Direction` | `prev` · `next` | 캐럿 방향만. 기하는 완전히 같다 |
| `State` | `Default` · `Hover` · `Disabled` | 아래 States |

두 축은 직교한다 — 맨 앞에서 이전 버튼이 비활성인 것과 방향은 서로 독립이다.

## States

| 상태 | 무엇이 바뀌나 |
| --- | --- |
| Default | 면 잉크 8%(`landing/panel-strong`), 캐럿 `gray/000` |
| Hover | 면에 잉크 4% 한 겹을 **더 쌓는다**(합계 약 12%). 캐럿 색은 그대로 |
| Disabled | 면은 그대로, 캐럿이 `landing/text-muted` 로 낮아지고 커서가 `not-allowed` 가 된다 |
| Focus | **없다.** 아래 Accessibility |
| Active(누르는 중) | **없다.** 제품에 `:active` 선언이 없다 |

전환은 색과 면에만 걸린다 — `color 160ms ease, background-color 160ms ease`. 기하는 움직이지
않는다.

## Interaction and responsive behavior

- **hover 가 `@media (hover: hover)` 로 감싸이지 않는다.** 제품이 Tailwind 의 `hover:` 대신
  `[&:hover:not(:disabled)]` 임의 변형을 쓰기 때문이다. 터치 기기에서 탭 후 hover 면이 남을 수
  있다 — 결손으로 적어 둔다.
- hover 면을 **배경 이미지 한 겹**으로 쌓는다(`background-image: linear-gradient(…)`). 면 색을
  바꾸는 대신 겹을 더하는 방식이라 아래 층의 잉크 8% 가 그대로 남는다.
- 크기가 32 로 고정이고 좁은 화면에서도 줄지 않는다(`flex-none`).
- 비활성 버튼은 클릭도 포커스도 받지 않는다 — 네이티브 `disabled` 다.

## Content

- 버튼에 **보이는 글자가 없다.** 문구는 전부 `aria-label` 이다.
- 라벨은 「무엇을 넘기는가」를 말한다. `이전` 보다 `이전 모델 보기` 처럼 대상을 담는 편이
  같은 페이지에 캐러셀이 셋일 때 구분된다.

| | KO | EN | JA |
| --- | --- | --- | --- |
| 이전 | `이전 모델 보기` | `Previous models` | `前のモデルを見る` |
| 다음 | `다음 모델 보기` | `Next models` | `次のモデルを見る` |

## Accessibility

- 네이티브 `<button type="button">` 이다. Enter · Space 가 그대로 동작한다.
- 글자가 없으므로 `aria-label` 이 **접근 가능한 이름의 유일한 출처**다. 비우면 이름 없는
  버튼이 된다.
- 캐럿 SVG 는 `aria-hidden` 이다.
- 맨 앞·맨 뒤에서 `disabled` 가 되므로 보조기술이 「누를 수 없음」을 읽는다. 색만 흐리게 하는
  방식과 달리 상태가 이름에 실린다.
- **포커스 표시가 없다.** 제품 버튼 클래스에 `:focus-visible` 선언이 하나도 없고 Figma 에도
  `Focus` variant 가 없다. 키보드로 캐러셀을 넘길 때 어디에 있는지 보이지 않는다 —
  **SC 2.4.7 결손**이며 LOUIS recipe 를 세울 때 가장 먼저 채워야 할 칸이다.
- 타깃 크기 32 × 32 는 SC 2.5.8(24 × 24) 은 넘고 SC 2.5.5(44 × 44) 에는 미달한다. 쌍 간격이
  4 라 두 타깃이 붙어 있다는 점도 함께 본다.

## Specification

| Part/state | 값 | 토큰·근거 |
| --- | --- | --- |
| Button | 32 × 32, radius 12 | `w-16 h-16`(2px 그리드) · `radius/12` |
| Button 면 | 잉크 8% 오버레이 | `color/landing/panel-strong` |
| 헤어라인 | inset 0 0 0 0.5 | `--louis-hairline-inset` = `border-width-hairline`(0.5) + `color/stroke-hairline`. **stroke 가 아니다**(Known deviations 1) |
| Hover 면 | 잉크 4% 한 겹 추가 | `color/landing/panel` |
| 캐럿 프레임 | 16 × 16 | — |
| 캐럿 글리프 | 5 × 10, 획 1, 둥근 끝·이음 | 인라인 벡터. `1 \| CENTER` |
| 캐럿 색 | `gray/000` | 비활성에서 `landing/text-muted` |
| 쌍 간격 | 4 | 래퍼가 갖는다 — 이 컴포넌트 밖이다 |
| 전환 | 160ms ease (색 · 면) | — |

## Known deviations

1. **헤어라인이 stroke 가 아니라 `INNER_SHADOW spread 0.5` 다.** 제품이
   `box-shadow: var(--louis-hairline-inset)` 을 쓰기 때문이고, 그 토큰 자체가
   `inset 0 0 0 0.5px` 다(DS-D-0023 이후 LOUIS 의 헤어라인 정본). inset 그림자는 레이아웃 박스를
   건드리지 않으므로 32 × 32 가 그대로 남는다 — stroke 로 그리면 `INSIDE` 여도 시각 박스가
   달라진다. 되읽기의 `geometry.strokeWeight` 가 비어 있는 것이 정상이다.
2. **`Direction` 축은 판정을 받아 축 표에 열렸다(해소).**
   `design/governance/figma-component-authoring.md` §2 개정이 `Direction` 을 축 어휘에 넣었다 —
   허용값은 `prev` · `next` 이고, 값은 **트랙의 진행 방향**이지 화살표가 가리키는 쪽
   (`left`/`right`)이 아니다. 세로 트랙이 생겨도 이름이 산다. 글리프를 `INSTANCE_SWAP` 으로
   내려 축을 없애는 길은 두 캐럿이 아이콘 라이브러리에 없어(인라인 벡터) 스왑 후보를 채울
   대상이 없으므로 성립하지 않는다 — 그 판단의 근거도 같은 절에 남아 있다.
3. **hover 두 겹의 색 변수가 서로 바뀌어 묶여 있다.** 되읽기 기준 아래 겹은 `paint.opacity`
   0.08 인데 `color/landing/panel`(토큰 값 4%)에, 위 겹은 0.04 인데
   `color/landing/panel-strong`(토큰 값 8%)에 묶여 있다. **지금 화면은 맞게 보이지만 토큰이
   움직이면 따라오지 않는다.** 바인딩 검사는 「묶였는가」만 보므로 이 교차를 잡지 못한다.
   Figma 수정은 이번 변경의 범위 밖이라 고치지 않았다 — **소유자 판정 필요.**
4. **캐럿이 아이콘 라이브러리에 없다.** 이 페이지에서 두 글리프만 쓰이고, stroke 방식(획 1 ·
   둥근 끝)이 라이브러리 아이콘의 정본 두께(1.5)와 달라 그대로 가져다 쓸 수 없었다. 그래서
   제품은 인라인 SVG 로, Figma 는 벡터로 그렸다. 아이콘 정본과 획 두께가 다르다는 사실이
   그대로 남는다.
5. **제품은 쌍을 하나로 내보내고 Figma 는 하나를 set 으로 뽑았다.** 상호작용과 프로토타입을
   받는 단위가 버튼 하나이기 때문이다. 그 결과 **쌍 간격 4 를 아무도 소유하지 않는다** —
   제품에서는 래퍼의 `gap` 이고 Figma 에는 없다. 이 문서가 임시로 소유한다.
6. **기하가 게이트에 걸려 있지 않다.** `figma/components.measured.json` 에 `carousel-arrow`
   항목이 없어 32 · 12 · 16 · 5 × 10 을 아무도 대조하지 않는다. 위 값들은 제품 소스에서 읽은
   것이고 브라우저 실측이 아니다. 실측 probe 를 붙이는 것이 승격 조건이다.
7. **포커스 상태가 코드에도 Figma 에도 없다.** Accessibility 의 SC 2.4.7 결손과 같은 항목이다.
   `State` 축에 `Focus` 를 더하는 것은 코드에 포커스 링이 선 다음이다 — 먼저 그리면 Figma 가
   없는 것을 있는 것처럼 보여 준다.

## Acceptance tests

1. 버튼이 32 × 32 이고 radius 12 다.
2. 헤어라인이 stroke 가 아니라 `INNER_SHADOW:0:0:0.5` 이고, 되읽기의 `strokeWeight` 가 비어 있다.
3. 캐럿 획이 1 이고 정렬이 `CENTER` 이며 끝이 둥글다.
4. `Direction` 이 캐럿 방향만 바꾸고 기하는 여섯 변형이 모두 같다.
5. `State=Hover` 가 면에 한 겹을 더하고 캐럿 색은 바꾸지 않는다.
6. `State=Disabled` 가 캐럿만 `landing/text-muted` 로 낮춘다. 면은 Default 와 같다.
7. Figma 되읽기에서 raw fill · raw stroke 가 각각 0 이다.
8. 두 버튼 모두 `aria-label` 을 갖고, 맨 앞·맨 뒤에서 네이티브 `disabled` 가 된다.

## Migration and changelog

새로 선 컴포넌트다. 이전 API 가 없다. LOUIS recipe 가 서면 이 문서의 Specification 이 그 값의
정본이 된다. 사용자 영향 변경은 [Updates](../updates/README.md) 에 적는다.
