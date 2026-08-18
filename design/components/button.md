---
id: button
status: experimental
authority: normative
summary: 사용자가 바로 실행할 수 있는 액션을 표현합니다.
---

# Button

사용자가 즉시 실행할 수 있는 명확한 액션을 표현한다. 제품별 버튼 스타일을 만들기 전에 공용
Button 계약으로 해결할 수 있는지 먼저 확인한다.

## Availability

| Surface       | 상태           | 근거                                                      |
| ------------- | -------------- | --------------------------------------------------------- |
| Web           | `partial`      | public export와 acceptance test 11건; 아래 남은 증거 참조 |
| Figma         | `partial`      | library draft의 component set 40 variant와 parity 대조 통과; publish 전 |
| Documentation | `done`         | 이 문서                                                   |
| Maturity      | `experimental` | 제품 소비 증거와 visual regression이 아직 없음            |

## API

```tsx
import { Button } from "@klipse-design/react";

<Button variant="primary">새 프로젝트 만들기</Button>
<Button variant="secondary">취소</Button>
<Button variant="danger">삭제</Button>
```

소비자는 `@klipse-design/css`의 `layers.css`를 root layout 최상단에서 먼저 import하고
`styles.css`(또는 Tailwind 사용 시 `styles.layer.css`)를 함께 불러온다.

링크 이동이 목적이면 클릭으로 navigation을 흉내 내지 말고 Link primitive를 사용한다.

## Anatomy

1. Root — 네이티브 `<button>`과 hit area
2. Left icon — 선택 사항, 장식이면 보조 기술에서 숨김
3. Label — 결과를 설명하는 텍스트
4. Right icon — 선택 사항, 장식이면 보조 기술에서 숨김
5. Progress indicator — loading일 때 label 의미와 함께 제공

## Properties

| Prop         | 값                                        | 기본값    | 설명                                            |
| ------------ | ----------------------------------------- | --------- | ----------------------------------------------- |
| `variant`    | `primary`, `secondary`, `ghost`, `danger` | `primary` | 강조와 의미                                     |
| `size`       | `md`, `sm`                                | `md`      | 시각 크기; hit area 계약은 별도 유지            |
| `loading`    | boolean                                   | `false`   | 중복 실행 차단, `aria-busy`, progress indicator |
| `leftIcon`   | ReactNode                                 | —         | 라벨 앞 보조 아이콘                             |
| `rightIcon`  | ReactNode                                 | —         | 라벨 뒤 보조 아이콘                             |
| native props | ButtonHTMLAttributes                      | —         | `disabled`, `aria-*`, event                     |

`type` 기본값은 `button`이다. 폼 제출은 호출부가 `type="submit"`을 명시한다.

## Hierarchy와 variants

| Variant     | 용도                | 원칙                                               |
| ----------- | ------------------- | -------------------------------------------------- |
| `primary`   | 핵심 진행·생성 액션 | 한 영역의 최우선 액션에 사용                       |
| `secondary` | 취소·대안           | primary를 보조                                     |
| `ghost`     | 툴바·저강조 액션    | 면이 없어도 발견 가능한 위치에서 사용              |
| `danger`    | 삭제·초기화         | 결과를 구체적으로 설명하고 필요하면 확인 단계 제공 |

강조 수준을 색만으로 결정하지 않고, 같은 영역에 경쟁하는 primary를 여러 개 두지 않는다.

## States

상태 이름의 뜻은 [Interaction states](../foundations/interaction-states.md)가 소유한다.
Button은 토글이 아니므로 `pressed`(`aria-pressed`)를 갖지 않는다 — 누르는 중은 `active`다.

| 상태          | 계약                                                   |
| ------------- | ------------------------------------------------------ |
| Enabled       | 라벨만으로 결과를 예측할 수 있음                       |
| Hover         | hover에서만 기능을 드러내지 않음                       |
| Active        | 누르고 있는 동안의 feedback. reduced-motion에서 scale 이동 제거 |
| Disabled      | 실행되지 않으며 이유가 필요하면 인접 설명 제공         |
| Focus-visible | 배경과 테마에 관계없이 2px 이상 명확한 indicator       |
| Loading       | label 의미 유지, 중복 실행 차단, `aria-busy=true`      |

## Content

- 결과를 예측할 수 있는 짧은 동사형 라벨을 쓴다: `저장`, `업로드`, `삭제`.
- `확인`, `다음`처럼 맥락 없이는 결과를 알 수 없는 라벨은 구체화한다.
- 진행 문구 끝에 ellipsis를 붙이지 않는다.
- 번역과 200% 확대에서 잘리면 버튼 폭 또는 action layout을 바꾼다.

## Accessibility

- 아이콘 전용 버튼은 accessible name을 제공한다.
- disabled처럼 보이지만 동작하는 요소를 만들지 않는다.
- loading 중 현재 focus를 제거하지 않는다.
- 주요 액션 hit area는 44×44 CSS px 이상을 목표로 한다.
- `aria-disabled`를 사용하면 click과 keyboard activation을 모두 명시적으로 차단한다.

## Acceptance tests

- pointer click, Enter, Space가 각각 정확히 한 번 실행된다.
- disabled와 loading에서 모든 activation 경로가 차단된다.
- loading 시작·완료 시 accessible name과 focus가 예측 가능하다.
- light/dark/high contrast에서 focus-visible이 보인다.
- KO/EN/JA 긴 라벨, 200% zoom, 320px container에서 핵심 텍스트가 사라지지 않는다.
- reduced-motion에서 active/loading 의미가 유지된다.
- **아이콘 유무로 높이가 달라지지 않는다.** md·sm 모두에서 `leftIcon`/`rightIcon`을 준 버튼과
  주지 않은 버튼의 높이가 같다.
- 구조값이 [`figma/components.measured.json`](../../figma/components.measured.json)과 일치한다.

## Implementation

- Web source: `packages/react/src/button/button.tsx`
- CSS recipe: `packages/css/src/component/button.css`
- Public import: `import { Button } from "@klipse-design/react"`
- Tests: `packages/react/test/button.browser.test.tsx` (실브라우저 11건)
- Figma component: library draft의 `Button` set (40 variant, publish 전)

### 코드 prop ↔ Figma property

| 코드 | Figma | 비고 |
| --- | --- | --- |
| `variant` | `Variant` (primary/secondary/ghost/danger) | 옵션 집합을 parity 게이트가 `ButtonVariant`와 대조한다 |
| `size` | `Size` (md/sm) | `ButtonSize`와 대조한다 |
| `loading` | `State=Loading` | boolean prop이 Figma에서는 state variant다 |
| `disabled` | `State=Disabled` | 같은 이유 |
| — | `State=Hover`, `State=Active` | 코드에서는 CSS 상태다. Figma에 CSS 상태가 없어 variant로 둔다 |
| `children` | Label 텍스트 | |

Figma component의 모든 fill·stroke는 변수에, 모든 텍스트는 text style에 바인딩된다(raw 값 0).
focus-visible 링은 브라우저가 그리므로 Figma variant로 두지 않는다.

활성화는 네이티브 `<button>`에 맡긴다. pointer click, Enter, Space가 각각 정확히 한 번 실행되는 것은
브라우저가 보장하며, keydown으로 클릭을 흉내 내면 중복 실행이 된다.

`loading`은 네이티브 `disabled`를 쓰지 않는다. 네이티브 disabled는 현재 focus를 제거하는데 규범이
이를 금지하기 때문이다. 대신 `aria-disabled`로 표시하고 activation을 명시적으로 막는다. 검증은 두
층으로 한다 — 실제 포인터는 actionability에서 차단되고, 프로그램적 click과 keyboard는 컴포넌트가
막는다.

## Specification

구조값은 [`figma/components.measured.json`](../../figma/components.measured.json)이 정본이고 실제
브라우저 측정으로 고정된다. 코드가 이 값을 만드는지는
`packages/react/test/component-geometry.browser.test.tsx`가, Figma가 이 값과 같은지는 parity
게이트가 매 실행 검증한다.

| 항목        | md                                  | sm                                  |
| ----------- | ----------------------------------- | ----------------------------------- |
| 높이        | `layout-control-height-md` 40px     | `layout-control-height-sm` 32px     |
| 최소 폭     | 없음                                | `layout-control-minimum-width-sm` 48px |
| padding     | 0 / `space-control-lg` 16px         | 0 / `space-control-md` 12px         |
| gap         | `space-control-sm` 8px              | `space-control-xs` 4px              |
| border      | `border-width-hairline` 0.5px       | `border-width-hairline` 0.5px       |
| radius      | `radius-control` 12px               | `radius-control` 12px               |
| 타이포      | `body-sm-medium` 14px / 21px        | `body-sm-medium` 14px / 21px        |
| spinner     | 18px (`1em` + border 2)             | 18px (`1em` + border 2)             |
| 아이콘 슬롯 | `icon-size-md` 20px                 | `icon-size-sm` 16px                 |

**이 값들은 제품 배포 코드에서 채택한 것이다.** 근거와 채택/편차 판정은
[`migration/product.measured.json`](../../migration/product.measured.json)에 있고 게이트가 매 실행
확인한다.

두 가지가 제품과 다르고 사유가 그 파일에 적혀 있다.

- **높이가 `height`가 아니라 `min-block-size`다.** 일반 라벨에서는 제품과 정확히 같은 40/32가
  나오고, KO/EN/JA 긴 라벨이나 200% 확대에서는 잘리는 대신 자란다. 제품은 `nowrap`이라 그 경우
  라벨이 넘친다.
- **타이포가 size 축이 아니다.** 제품과 같이 md·sm 모두 14px/21px를 쓴다. 이전 DS는 sm에서
  caption 12px로 줄여 제품과 달랐다.

아이콘이 붙은 쪽은 padding을 2px 줄인다(md 16→14, sm 12→10). 아이콘의 자체 시각 여백 때문에
텍스트-only 대비 그 쪽이 넓어 보이는 것을 보정하는 것이며 제품과 같다.

## Known deviations

- **`danger` variant가 tonal이다.** solid danger를 표현할 `color-action-danger*` 토큰이 아직 없어
  `color-background-danger`·`color-foreground-danger`로 대체했다. `DS-P3-014` 단위 9가 토큰을 추가하면 갱신한다.
  Button은 foreground와 background를 **쌍으로** 쓰므로 대비가 성립한다. 같은 토큰을 텍스트 색으로만
  쓰면 중립 표면에서 무너지는데, 그 실측은 [Menu / Popover](menu-popover.md)의 Known deviations에 있다.
- **고정 높이가 없다.** 높이를 padding과 line-height로 결정하고 44px 타깃은 `kds-hit-target`이
  보장한다. 제품과 픽셀 단위로 맞추려면 control height 토큰이 필요하다(DS-P3-014).
- **네 variant 전부 WCAG AA에 미달한다.** owner가 제품의 공용 Button을 정본으로 채택했고,
  그 제품 Button이 네 variant 모두 4.5에 못 미친다. axe 실측값이다.

  | variant | 전경 | 배경 | 대비 |
  | --- | --- | --- | --- |
  | `primary` | `#fafafa` | `#0088ff` | **3.37** |
  | `secondary` | `#777d89` | 흰 배경 | **4.13** |
  | `ghost` | `#777d89` | 흰 배경 | **4.13** |
  | `danger` | `#fafafa` | `#ff4b59` | **3.14** |

  이 미달은 제품이 이미 갖고 있는 것이고 DS가 그것을 그대로 재현한다. 해소하려면 면을 어둡게
  하거나(primary는 `blue.700` 6.12, secondary는 `neutral.700` 6.35) 라벨을 18.66px bold 이상으로
  키워야 하며 둘 다 브랜드 판정 대상이다. 같은 사유가 token source의 `contrastPairs[].note`,
  axe 테스트의 허용 목록, `migration/product.measured.json`에 있다.
- **아이콘 슬롯 크기를 Button이 소유한다.** [Iconography](../foundations/iconography.md)는 글리프
  크기를 아이콘이 소유한다고 하지만, 슬롯에 크기를 두지 않으면 호출부가 넘긴 아이콘 크기가 그대로
  버튼 높이가 된다. sm에 기본(20px) 아이콘을 넣으면 높이가 28이 아니라 **30**이 됐고, 같은 줄의
  버튼들이 아이콘 유무로 어긋났다. 높이가 호출부에 따라 달라지는 것은 컨트롤이 아니므로 슬롯을
  md 20 / sm 16으로 고정하고 글리프를 슬롯에 맞춘다. 컨테이너 크기는 컨트롤이 소유한다는 같은
  문서의 규칙과는 어긋나지 않는다.

## 승격 조건

Web `done`과 `stable`에는 다음이 남아 있다.

- visual regression fixture (hosted CI 확보 후, DS-D-0005 2단계)
- 수동 keyboard·screen-reader review 기록
- SSR render와 hydration 검증
- published Figma component와 parity report (DS-F-006)
- 두 개 이상의 제품 사용처
