---
id: button
status: experimental
authority: normative
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

| 상태          | 계약                                                   |
| ------------- | ------------------------------------------------------ |
| Enabled       | 라벨만으로 결과를 예측할 수 있음                       |
| Hover         | hover에서만 기능을 드러내지 않음                       |
| Pressed       | feedback은 제공하되 reduced-motion에서 scale 이동 제거 |
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
- reduced-motion에서 pressed/loading 의미가 유지된다.

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
| — | `State=Hover`, `State=Pressed` | 코드에서는 CSS 상태다. Figma에 CSS 상태가 없어 variant로 둔다 |
| `children` | Label 텍스트 | |

Figma component의 모든 fill·stroke는 변수에, 모든 텍스트는 text style에 바인딩된다(raw 값 0).
focus-visible 링은 브라우저가 그리므로 Figma variant로 두지 않는다.

활성화는 네이티브 `<button>`에 맡긴다. pointer click, Enter, Space가 각각 정확히 한 번 실행되는 것은
브라우저가 보장하며, keydown으로 클릭을 흉내 내면 중복 실행이 된다.

`loading`은 네이티브 `disabled`를 쓰지 않는다. 네이티브 disabled는 현재 focus를 제거하는데 규범이
이를 금지하기 때문이다. 대신 `aria-disabled`로 표시하고 activation을 명시적으로 막는다. 검증은 두
층으로 한다 — 실제 포인터는 actionability에서 차단되고, 프로그램적 click과 keyboard는 컴포넌트가
막는다.

## Known deviations

- **`danger` variant가 tonal이다.** solid danger를 표현할 `color-action-danger*` 토큰이 아직 없어
  `color-status-danger-*`로 대체했다. `DS-P3-014` 단위 9가 토큰을 추가하면 갱신한다.
  Button은 foreground와 background를 **쌍으로** 쓰므로 대비가 성립한다. 같은 토큰을 텍스트 색으로만
  쓰면 중립 표면에서 무너지는데, 그 실측은 [Menu / Popover](menu-popover.md)의 Known deviations에 있다.
- **고정 높이가 없다.** 높이를 padding과 line-height로 결정하고 44px 타깃은 `kds-hit-target`이
  보장한다. 제품과 픽셀 단위로 맞추려면 control height 토큰이 필요하다(DS-P3-014).

## 승격 조건

Web `done`과 `stable`에는 다음이 남아 있다.

- visual regression fixture (hosted CI 확보 후, DS-D-0005 2단계)
- 수동 keyboard·screen-reader review 기록
- SSR render와 hydration 검증
- published Figma component와 parity report (DS-F-006)
- 두 개 이상의 제품 사용처
