---
id: tooltip
status: experimental
authority: normative
---

# Tooltip

포인터나 키보드 focus가 컨트롤에 머무를 때 **짧은 보조 설명**을 띄운다. 이름을 대신하지 않고
보강한다. 이름이 없어서 tooltip이 필요하다면 그건 tooltip이 아니라 라벨이 빠진 것이다.

## Availability

| Surface       | 상태           | 근거                                                      |
| ------------- | -------------- | --------------------------------------------------------- |
| Web           | `partial`      | public export와 acceptance test; visual regression과 제품 소비 증거 없음 |
| Figma         | `not-ready`    | component set 미생성                                      |
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

## Properties

| Prop           | 값                                        | 기본값  | 설명                                          |
| -------------- | ----------------------------------------- | ------- | --------------------------------------------- |
| `content`      | ReactNode                                 | **필수**| 설명. 상호작용 요소를 넣지 않는다             |
| `side`         | `top`, `bottom`, `left`, `right`          | `top`   | 선호 방향. 공간이 없으면 뒤집힌다             |
| `openDelay`    | number (ms)                               | `280`   | 포인터 진입 후 열리기까지                     |
| `disabled`     | boolean                                   | `false` | tooltip을 띄우지 않는다. trigger는 그대로다   |
| `children`     | ReactElement                              | **필수**| 상호작용 가능한 요소 하나                     |

## Hierarchy와 variants

variant가 없다. Tooltip은 강조 축을 갖지 않는다 — 위계를 표현해야 하면 그건 tooltip이 아니다.

## States

| 상태     | 표현                                  | 비고                                              |
| -------- | ------------------------------------- | ------------------------------------------------- |
| closed   | 렌더되지 않는다                       | DOM에도 없다                                      |
| open     | `role="tooltip"`, `aria-describedby`  | 지연 후 열린다                                    |
| disabled | 아무것도 열리지 않는다                | trigger의 동작은 영향받지 않는다                  |

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
| 배경        | `color-background-inset`                                |
| 전경        | `color-foreground-primary`                              |
| 그림자      | `elevation-popover`                                     |
| layer       | `layer-popover`                                         |
| 최대 폭     | 288px                                                   |
| anchor 간격 | `--kds-overlay-offset` 8px — Menu·Dialog와 같은 값       |
| collision   | `--kds-overlay-collision-padding` 8px                    |
| 열림 지연   | 280ms                                                   |
| 닫힘        | 즉시                                                    |

`radius-control-sm`(8px)은 이 컴포넌트가 첫 소비자다. 제품 실측에서 8px이 가장 많이 쓰이는
radius인데 semantic 이름이 없었다.

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

## Migration and changelog

- 2026-08-15 — 첫 공개. 세 화면 실측에서 22개 파일이 tooltip을 쓰는데 공용 컴포넌트가 없었다.
  제품 자신의 Button(17개 파일)보다 넓게 쓰인다.
