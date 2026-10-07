---
id: tooltip
status: experimental
authority: normative
summary: 포인터나 초점이 머무를 때 짧은 설명을 덧붙입니다.
---

# Tooltip

포인터나 키보드 focus가 컨트롤에 머무를 때 **짧은 보조 설명**을 띄운다. 이름을 대신하지 않고
보강한다. 이름이 없어서 tooltip이 필요하다면 그건 tooltip이 아니라 라벨이 빠진 것이다.

## Availability

| Surface       | 상태           | 근거                                                      |
| ------------- | -------------- | --------------------------------------------------------- |
| Web           | `partial`      | public export와 acceptance test; visual regression과 제품 소비 증거 없음 |
| Figma         | `done`      | component set(Side). 계약이 모든 property 를 pin 한다. 기하는 양방향이다 — `surface-geometry.browser.test.tsx` 가 코드 쪽에서 같은 실측을 되잰다. 게시 없이 판정한다([DS-D-0035](../governance/decisions/DS-D-0035-figma-done-without-publish.md)) |
| Documentation | `done`         | 이 문서                                                   |
| Maturity      | `experimental` | 규범과 구현이 같은 변경 단위에서 처음 선다                |

## When to use

- 아이콘 전용 컨트롤의 **이름을 보강**할 때. 이름 자체는 [Icon Button](icon-button.md)의 `label`이
  소유하고, tooltip은 그것을 눈으로도 보이게 한다.
- 단축키·현재 값·짧은 제약을 덧붙일 때.

쓰지 않는 경우가 더 중요하다.

- **상호작용이 필요한 내용은 넣지 않는다.** 링크·버튼·입력이 들어가야 하면
  [Menu / Popover](menu-popover.md)다. Tooltip은 포인터를 얹을 수 없다.
- **오류·경고를 tooltip으로만 알리지 않는다.** 포인터가 없는 사용자에게 도달하지 않는다.
- **긴 문장을 넣지 않는다.** 두 줄을 넘으면 화면에 상시 표시할 자리를 찾는다.

## API

```tsx
import { Tooltip } from "@klipse-design/react";
import { IconButton } from "@klipse-design/react";
import { IconTrashSimple } from "@klipse-design/react/icons";

<Tooltip content="삭제 (⌫)">
  <IconButton label="삭제">
    <IconTrashSimple />
  </IconButton>
</Tooltip>
```

`children`은 **하나의 상호작용 가능한 요소**다. tooltip은 그 요소에 `aria-describedby`를 붙인다.

## Anatomy

1. Trigger — `children`. tooltip은 이 요소를 감싸지 않고 **속성만 붙인다**
2. Surface — portal된 설명 표면. `role="tooltip"`
3. Arrow — 선택. 방향을 가리킨다

`coachmark` layout에서는 2·3이 이렇게 갈린다.

4. Stack — 제목/본문 덩어리(세로, 간격 2)
5. Tail — 화살표 대신 서는 꼬리. 10 정사각형을 45° 돌린 것이라 base의 삼각형(12×6)과 **다른 도형**이다

## Properties

| Prop           | 값                                        | 기본값  | 설명                                          |
| -------------- | ----------------------------------------- | ------- | --------------------------------------------- |
| `content`      | ReactNode                                 | **필수**| 설명. 상호작용 요소를 넣지 않는다             |
| `side`         | `top`, `bottom`, `left`, `right`          | `top`   | 선호 방향. 공간이 없으면 뒤집힌다             |
| `openDelay`    | number (ms)                               | `300`   | 포인터 진입 후 열리기까지. 제품 값             |
| `disabled`     | boolean                                   | `false` | tooltip을 띄우지 않는다. trigger는 그대로다   |
| `suppress`     | boolean                                   | `false` | 떠 있는 tooltip을 exit 모션 없이 즉시 걷어낸다 |

| `children`     | ReactElement                              | **필수**| 상호작용 가능한 요소 하나                     |
| `layout`       | `base`, `coachmark`                       | 유추    | 비우면 `title`의 유무가 정한다. Figma의 `Layout` 축과 1:1로 맞추기 위해 명시도 열어 둔다 |
| `title`        | ReactNode                                 | 없음    | 있으면 `content`가 본문이 되고 layout이 `coachmark`가 된다. `base`에서는 무시한다 |

## Hierarchy와 variants

강조 축이 없다. Tooltip은 위계를 표현하지 않는다 — 위계를 표현해야 하면 그건 tooltip이 아니다.

**`layout` 축이 있다(2026-09-06).** `base`는 포인터를 따라다니는 한 줄 설명이고, `coachmark`는
대상에 붙어 **함께 움직이는** 제목/본문 두 줄 안내다. 크기 사다리가 아니라 표면에 담기는 것이
달라지는 축이다.

제품 정본은 캔버스의 `CanvasFirstNodeHint`로, React Flow의 `ViewportPortal` 안에서 flow
좌표로 놓여 **캔버스와 함께 팬·줌된다.** 그것이 두 layout이 갈리는 가장 큰 이유다.

`coachmark`에서 갈리는 것 셋: 폭을 내용이 아니라 상한 320 이 정하고(`min(320px, 가용 폭)`), 제목/본문 두 줄이며, 경계가 헤어라인이 아니라
**강조색 1px 테두리**다. 「여기를 보라」를 말하는 것이 그 테두리이므로 generic 헤어라인으로 바꾸면
축이 아무것도 바꾸지 않게 된다.

## States

| 상태     | 표현                                  | 비고                                              |
| -------- | ------------------------------------- | ------------------------------------------------- |
| closed   | 렌더되지 않는다                       | DOM에도 없다                                      |
| open     | `role="tooltip"`, `aria-describedby`  | 지연 후 열린다                                    |
| disabled | 아무것도 열리지 않는다                | trigger의 동작은 영향받지 않는다                  |

| suppressed | 즉시 사라진다 — exit 전환이 돌지 않는다 | 같은 trigger에서 Menu·Popover가 열릴 때           |

- **`suppress`와 `disabled`는 다른 축이다.** `disabled`는 애초에 열리지 않게 하고, `suppress`는 **이미 떠 있는 것을 걷어낸다.** 두 축을 하나로 묶으면 드롭다운이 펼쳐지는 동안 tooltip 잔상이 버튼 옆에 남는다 — exit 전환을 태우지 않고 같은 커밋에서 내리는 이유다(`ChromeTooltip.tsx:187-198`). 제품 호출부는 사이드바 펼침·메뉴 열림·빈 프롬프트에서 이 prop을 세운다.

- **닫힘은 지연 없이 즉시**다. 열 때만 지연이 있다. 포인터가 떠났는데 설명이 남으면 어느 컨트롤의
  설명인지 알 수 없다.
- 키보드 focus는 **지연 없이** 연다. 지연은 포인터가 지나가는 것을 열림으로 오인하지 않기 위한
  것이고, focus는 의도된 이동이다.

## Interaction and responsive behavior

- 포인터 진입·focus로 열리고, 이탈·blur·`Escape`·스크롤로 닫힌다.
- **tooltip 표면은 포인터 이벤트를 받지 않는다.** 받으면 표면 위로 포인터가 이동했을 때 trigger가
  이탈로 판정돼 깜빡인다.
- **터치에는 열리지 않는다.** 터치에는 hover가 없고, 길게 눌러 여는 방식은 컨텍스트 메뉴와
  충돌한다. 터치 사용자에게 필요한 정보라면 화면에 둔다.
- 화면 경계에서 방향이 뒤집힌다. 위치 계산은 overlay primitive가 소유한다.
- **anchor와의 간격을 자체 숫자로 갖지 않는다.** overlay 표면 CSS가 소유하고 Provider가 1회
  측정한 값을 쓴다 — 여기서 다시 쓰면 Menu·Dialog와 간격이 갈린다.

## Content

- 한 줄, 길어도 두 줄. 마침표를 찍지 않는다.
- trigger의 이름을 그대로 반복하지 않는다. "삭제" 버튼에 "삭제"를 띄우면 스크린리더가 이름과
  설명으로 두 번 읽는다. 덧붙일 것이 없으면 tooltip을 두지 않는다.
- 단축키는 이름 뒤에 붙인다 — "삭제 (⌫)".

## 단축키 슬롯(2026-10-07)

이름 뒤에 `(H)` 처럼 단축키를 붙이는 자리는 `.louis-tooltip__shortcut` 이다. 앞의 공백과 괄호까지 슬롯 안에 글자로 적는다 —
`<span class="louis-tooltip__shortcut"> (H)</span>`. **거친 포인터(`@media (pointer: coarse)`)에서는 슬롯이 숨는다.** 터치에는 누를
키보드가 없고, 키보드를 붙인 태블릿에서 포커스로 열린 툴팁도 같다 — 판정은 포인터 종류만 쓰고 입력 장치를 추측하지 않는다.
공백과 괄호를 슬롯 밖에 두면 숨겼을 때 이름 뒤에 빈 괄호나 공백이 남는다. 키캡 모양(`.louis-keycap`)으로 그리지 않는다 — 툴팁은
글자 한 줄이고, 키캡은 명령 팔레트·도움말 같은 목록 행의 오른쪽 자리다([Keycap](keycap.md)). 근거는 제품 캔버스 모바일 UX 작업
브랜치(`feat/canvas-mobile-ux`)의 `ChromeTooltip.tsx` `SHORTCUT_HINT` 이고, 노드 우클릭 메뉴의 단축키 배지와 같은 규칙이다.

**터치로 누른 트리거에서는 툴팁을 열지 않는다(동작 계약 — 소비자/React 의 몫, CSS 가 아니다).** 터치에는 호버에서 떠나는 순간이
없어, 열린 툴팁이 다음 탭까지(모달 위에서도) 남는다. 그래서 두 가지를 지킨다.

- 터치의 `pointerenter` 는 호버가 아니라 누름의 시작이다 — `pointerType === "touch"` 이면 열지 않는다.
- 트리거를 마지막으로 누른 포인터 종류를 기억해 두고, 터치로 눌렸다면 포커스를 받아도 열지 않는다. **포커스를 잃으면 그 기억을
  지운다** — 이어서 키보드로 들어온 포커스는 지금처럼 지연 없이 연다.

위 「터치에는 열리지 않는다」(Interaction)의 구체화다 — 그쪽은 방침이고 이쪽은 포커스 경로까지 막는 판정이다. LOUIS
`Tooltip` React 구현(`tooltip.tsx`)은 첫째만 한다 — 둘째(터치로 누른 뒤의 포커스 경로)는 아직 없고 `onFocus` 가 지연 없이 연다. 제품
`ChromeTooltip.tsx` 가 정본이며 React 몫이다.

## Accessibility

- 표면은 `role="tooltip"`이고 trigger는 `aria-describedby`로 그것을 가리킨다. **`aria-labelledby`가
  아니다** — tooltip은 이름이 아니라 설명이다.
- **trigger는 자기 이름을 스스로 갖는다.** tooltip이 이름의 유일한 출처가 되면 포인터 없는
  사용자에게 이름이 없다.
- `Escape`로 닫힌다. 열려 있는 동안 focus는 trigger에 남는다 — tooltip으로 focus가 이동하지 않는다.
- tooltip은 focusable이 아니다.

## Specification

| 항목        | 값                                                      |
| ----------- | ------------------------------------------------------- |
| 타이포      | `typography-caption-regular` (12px)                     |
| padding     | `space-control-xs` 4px / `space-control-sm` 8px         |
| radius      | `radius-control-sm` 8px                                 |
| 헤어라인    | inset (`--louis-hairline-inset`) 0.5px `color-stroke-hairline` — tooltip elevation 뒤에 조합. 이전 1px `color-stroke-tooltip` border가 없어지며 높이도 28 → 26px로 줄었다([DS-D-0023](../governance/decisions/DS-D-0023-hairline-inset.md)) |
| 배경        | `color-bg-inverse` — **페이지와 반전된다**       |
| 전경        | `color-fg-on-inverse`                           |
| 그림자      | `elevation-tooltip` (테마마다 색이 다르다)              |
| layer       | `layer-popover`                                         |
| 최대 폭     | min(320px, 사용 가능 폭)                                |
| anchor 간격 | `--louis-overlay-offset` 8px — Menu·Dialog와 같은 값       |
| collision   | `--louis-overlay-collision-padding` 8px                    |
| 열림 지연   | 300ms                                                   |
| 닫힘        | 즉시                                                    |
| 열림 모션   | `motion-tooltip-enter` 140ms, scale 0.97 → 1            |

| 닫힘 모션   | 120ms, `cubic-bezier(0.19, 1, 0.22, 1)`, scale 1 → 0.97 |
| 확대 기준점 | anchor — `side`를 따라간다. `top` → `bottom center`, `left` → `right center`, `right` → `left center` |

### `layout = coachmark`

| 항목            | 값                                                      |
| --------------- | ------------------------------------------------------- |
| 폭              | `min(320px, 가용 폭)` — 상한 320(`box-sizing: border-box`)이 선택값이고, 가용 폭이 그보다 넓으면 320(`tooltip.sizes.coachmark.width`) |
| 높이            | 테두리 1+1 + padding 12+12 + 내용 — 제목과 본문이 한 줄씩일 때 64(내용 38, `tooltip.sizes.coachmark.height`) |
| padding         | `space-control-md` 12 (네 변)                            |
| radius          | `radius-card` 12                                        |
| 테두리          | 1px `accent-primary` 56%                                 |
| 배경            | `color-bg-inverse` — **불투명**, 꼬리와 같은 재료(DS-D-0073) |
| 제목            | `typography-caption-medium` (12/18)                     |
| 본문            | `typography-caption-regular` (12/18) · 불투명도 72%      |
| 제목/본문 간격  | `space-overlay-item-gap` 2                              |
| 꼬리            | 변 10의 정사각형을 45° 돌린 것. 정렬 축 24 · 표면 밖 6. 면과 같은 `color-bg-inverse` |
| 그림자          | `elevation-tooltip` — base와 **같다**                    |


**닫기 자리(2026-10-07).** 코치마크는 사용자가 치울 수 있어야 해서 `.louis-tooltip__close` 를 둔다 — 표면의 오른쪽 위 모서리 칸
(폭 44 · 높이 42, 표면 안), 글리프는 칸 오른쪽 끝에서 8 안쪽 · 제목 줄과 같은 높이. 표면은 포인터를 받지 않고 닫기만
`pointer-events: auto` 다. 닫기가 있으면 제목이 오른쪽 20 을 비운다. 쉬는 불투명도 72%, hover · 키보드 초점에서 100%(링 없음).
`aria-label` 을 준다. 근거는 제품 캔버스 다음 단계 코치마크(`CanvasOnboardingHints.tsx` `NEXT_STEP_COACHMARK_CLOSE`) — 소유자가
「너무 안으로 들어와」라며 세 번 고친 값이다. Figma 의 `Layout=coachmark` 네 변형에도 절대 배치 `Close`(44×42, `icon/x` 14)와 제목 줄 오른쪽 20(`TitleRow`)을 세웠다(2026-10-07).

**제품과 갈리는 값 다섯과 그 사유.** 「제품」 칸은 `CanvasFirstNodeHint` 가 LOUIS coachmark 레시피(`louis-tooltip`)로 옮기기 전의 값이다 — 지금 제품은 레시피를 소비해 오른쪽 값을 받는다.

| 제품 | LOUIS | 왜 |
| --- | --- | --- |
| 가로 padding 14 | 12 | 14는 space 축(4·8·12·16)에 없다. 새 계단을 세울 사유가 없다 |
| 제목/본문 간격 3 | 2 | 같은 자리를 [Toast](toast.md)의 `callout`이 2로 쓴다. 한 시스템 안에서 같은 자리는 한 값이다 |
| `0 8px 24px` 검정 16% | `elevation-tooltip` | 그 값을 가진 토큰이 없고, layout 축은 자기 그림자를 가질 수 없다(아래) |
| `backdrop-filter: blur(panel)` | 없음 | 같은 이유 |
| 면과 꼬리 `--gray-900` 72% | `color-bg-inverse` 불투명 | 반투명 꼬리가 면 위에 따로 칠해져 겹친 자리가 진해지고 면의 테두리가 꼬리 밑으로 비쳤다. 소유자가 「따로따로인 것처럼 보이는 현상」으로 판정했다([DS-D-0073](../governance/decisions/DS-D-0073-coachmark-surface-is-opaque.md)) |

**layout 축이 자기 effect를 가질 수 없는 이유.** Figma component set의 effect는 변형이 아니라
역할(`self`) 하나가 갖는 값이고, parity 계약이 그것을 문자열 하나로 잡는다. layout이 자기
그림자·흐림을 가지려면 컴포넌트를 둘로 쪼개야 하는데, 둘은 같은 앵커 표면이라 이름을 둘로 늘릴
자리가 아니다([DS-D-0027](../governance/decisions/DS-D-0027-control-size-ladder.md)의 「이름이
실물보다 많으면 고르는 쪽이 손해를 본다」).

**꼬리 방향은 `side`를 따라간다.** positioner가 발행하는 `data-side`는 collision으로 뒤집힌 뒤의
실제 방향이라, 표면이 뒤집히면 꼬리도 함께 옮겨간다. 네 방향 모두 테두리를 갖는 두 변이 다르다 —
`border-style: solid`를 네 변에 주고 두 변만 폭을 주면 나머지가 initial `medium`(3px)로 그려지므로,
변마다 폭과 색을 함께 준다.

**면과 꼬리는 한 불투명 재료다(2026-10-02, [DS-D-0073](../governance/decisions/DS-D-0073-coachmark-surface-is-opaque.md)).**
꼬리는 `::before` 로 면 위에 따로 칠하는 도형이다. 둘이 반투명이면 꼬리 안쪽 절반이 면과 겹친 자리가 두 번
칠해져 진해지고, 면의 테두리가 꼬리 밑으로 비쳐 지나가 상자와 꼬리가 두 조각으로 보인다. 둘을 같은 불투명
`color-bg-inverse` 로 칠하면 위치 지정된 꼬리가 면의 테두리를 덮어 이음새가 사라진다. 그래서 둘 중 하나만
바꾸면 안 된다 — 브라우저 테스트가 네 방향, 두 테마에서 둘이 같은 값이고 알파가 1 인지를 잰다.

**「닫힘: 즉시」는 지연이 없다는 뜻이지 전환이 0이라는 뜻이 아니다.** 제품은 exit를 별도 duration·easing으로 돌린다 — enter는 `cubic-bezier(0.23, 1, 0.32, 1)` 140ms로 감속하고, exit는 `cubic-bezier(0.19, 1, 0.22, 1)` 120ms로 가속한다. **비대칭이다.** 열림 곡선을 닫힘에 그대로 재사용하면 tooltip이 끝에서 늘어져 잔상처럼 남는다. 전환 property는 `opacity`와 `transform` 둘뿐이고 열림·닫힘이 같은 두 축을 다툰다. 제품은 이 5종을 `globals.css:336-340`에 tooltip 모션 SSOT로 선언한다 — rest scale·enter duration·exit duration·enter ease·exit ease. **다만 값의 출처는 이제 제품이 아니라 LOUIS다** — 다섯 줄 모두 `var(--louis-motion-tooltip-*)` / `var(--louis-motion-scale-tooltip-rest)` 별칭이고, 숫자는 [tokens.css:526](../../packages/tokens/generated/tokens.css)·`549-553`이 소유한다.

**확대 기준점을 center로 두면 방향감이 사라진다.** 제품 버블은 항상 trigger 쪽 모서리에서 자란다 — `top`이면 아래 모서리, `left`면 오른쪽 모서리, `right`면 왼쪽 모서리다(`ChromeTooltip.tsx:71-73`). Figma에서 scale 0.97 → 1을 center 기준으로 그리면 버블이 trigger에서 뻗어 나오는 것이 아니라 제자리에서 부푸는 것처럼 보인다. `bottom`은 제품에 근거가 없다 — 제품 placement는 `top`·`left`·`right` 셋뿐이고(`ChromeTooltip.tsx:14`), `bottom`의 `top center`는 DS 판정이다.

**reduced motion은 컴포넌트가 아니라 토큰 층에서 끈다.** 제품은 `@media (prefers-reduced-motion: reduce)` 안에서 `:root`의 세 토큰을 덮어써 enter·exit·rest 세 변형에 한 번에 적용한다(`globals.css:1533-1539`). 변형마다 따로 끄지 않는다.

| 토큰           |  기본 | reduce |
| -------------- | ----: | -----: |
| enter duration | 140ms |    1ms |
| exit duration  | 120ms |    1ms |
| rest scale     |  0.97 |      1 |

**`0ms`가 아니라 `1ms`다.** 버블의 언마운트가 `transitionend`에 걸려 있어 duration을 0으로 두면 이벤트가 발화하지 않고 180ms 폴백 타이머가 대신 걷어낸다. `1ms`는 정상 경로를 살려 둔다. rest scale을 1로 되돌리면 크기 이동만 사라지고 페이드는 1ms 안에 끝난다.

`radius-control-sm`(8px)은 이 컴포넌트가 첫 소비자다. 제품 실측에서 8px이 가장 많이 쓰이는
radius인데 semantic 이름이 없었다.

**표면이 반전된다는 것이 이 컴포넌트의 핵심이다.** 라이트에서 어두운 면에 밝은 글자, 다크에서
그 반대다. 이전 DS는 `background-inset`을 써서 페이지와 같은 극성이었고 제품과 정반대였다.
`color-bg-inverse`/`color-fg-on-inverse`는 Toast가 먼저 세운 토큰인데 값이 제품의
tooltip 면과 정확히 같았다.

**모션이 아예 걸리지 않고 있었다.** `animation-duration`과 `animation-timing-function`만 있고
`animation-name`이 없었다. 값만 적어 두고 실제로 도는지 확인하지 않은 결과다. 제품의
140ms/`cubic-bezier(0.23, 1, 0.32, 1)`와 scale 0.97을 채택했다.

## Implementation

- `packages/react/src/tooltip/tooltip.tsx`
- `packages/css/src/component/tooltip.css`
- 위치 계산은 overlay primitive의 `OverlayPositioner`/`OverlayAnchor`/`OverlayPositioned`를 쓴다.
  focus scope·inert·scroll lock·dismissable layer는 **쓰지 않는다** — tooltip은 focus를 가져가지
  않고 바깥 클릭을 삼키지도 않는다. DS-D-0011의 primitive 소비자가 Menu·Dialog에 이어 셋이 된다.

## Known deviations

| 항목 | 상태 | 사유 |
| --- | --- | --- |
| Figma component set | 없음 | DS-F-006 대상 |
| 그룹 지연 건너뛰기 | 없음 | 하나가 열린 뒤 인접 trigger로 옮길 때 지연을 건너뛰는 동작. 제품도 Radix Provider에 의존하며, 공유 상태 설계가 필요해 분리했다 |
| arrow | 없음 | 제품은 10×5 arrow를 쓴다. 표면 경계와 방향 표시의 값을 아직 판정하지 못했다 |
| 열림 모션 | `overlay-enter` 채택 | 제품은 140ms에 `cubic-bezier(0.23, 1, 0.32, 1)`이고 DS는 200ms다. 제품 값을 그대로 들이려면 motion 토큰 추가가 선행이라 DS 값을 썼다 |

| 닫힘 모션 | 없음 | 제품은 exit를 120ms `cubic-bezier(0.19, 1, 0.22, 1)`로 따로 돌리지만 `louis-tooltip`에는 exit keyframe이 없다. exit motion 토큰 추가가 선행이다 |
| coachmark 의 흐림 | 없음 | 면이 불투명이라 흐림이 비출 것이 없다. 반투명 면에 흐림을 얹는 안은 꼬리에 같은 흐림을 줄 수 없어(꼬리는 따로 칠하는 도형이다) 이음새가 남는다(DS-D-0073) |
| 확대 기준점 | 미배선 | overlay 표면은 `--louis-overlay-transform-origin`으로 anchor 원점을 이미 갖고 있고 규범도 menu-popover 문서에 `origin=anchor`로 서 있다. 그런데 `louis-tooltip` 표면이 `louis-overlay-panel`을 얹지 않아 지금은 center에서 자란다 |

## Acceptance tests

1. 포인터 진입 후 지연이 지나면 열린다.
2. 지연 전에 포인터가 떠나면 열리지 않는다.
3. 키보드 focus는 지연 없이 연다.
4. 포인터 이탈로 즉시 닫힌다.
5. `Escape`로 닫히고 focus는 trigger에 남는다.
6. 열려 있는 동안 trigger의 `aria-describedby`가 표면 id를 가리킨다.
7. 닫히면 `aria-describedby`가 사라진다.
8. 표면의 `role`이 `tooltip`이다.
9. 표면이 포인터 이벤트를 받지 않는다.
10. `disabled`면 열리지 않는다.
11. trigger의 accessible name이 tooltip 내용으로 바뀌지 않는다.
12. `coachmark` 의 면과 꼬리가 네 방향, 두 테마에서 같은 불투명 `color-bg-inverse` 이고, 꼬리의 테두리 변이 면의 테두리와 같은 색이다.

## Migration and changelog

- 2026-10-02 — `coachmark` 의 면과 꼬리를 `color-bg-inverse-translucent` 에서 불투명 `color-bg-inverse` 로 옮겼다(DS-D-0073).
  Figma 의 꼬리 테두리 변도 바깥 두 변으로 바로잡았다.
- 2026-08-15 — 첫 공개. 세 화면 실측에서 22개 파일이 tooltip을 쓰는데 공용 컴포넌트가 없었다.
  제품 자신의 Button(17개 파일)보다 넓게 쓰인다.
