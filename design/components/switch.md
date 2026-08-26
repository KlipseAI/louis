---
id: switch
status: experimental
authority: normative
summary: 즉시 적용되는 설정을 켜고 끕니다.
---

# Switch

즉시 적용되는 설정을 켜고 끈다. 누르는 순간 반영되며 폼 제출을 기다리지 않는다.

**제품에 스위치가 한 자리뿐이다.** 예약 업로드 토글(`PublishFlow.tsx:373-382`)이고, 갈래가 없으니
평균을 낼 것도 고를 것도 없었다 — 그 한 벌이 곧 정본이다. Badge가 65벌에서 축을 골라야 했던
상황의 정반대이고, 그래서 이 레시피는 **치수와 색을 제품에서 그대로 가져왔다.** 트랙 44×24 ·
안쪽 여백 2 · 썸 20 · 이동 20 · 220ms(`PublishFlow.tsx:78-83`, `PublishFlow.tsx:86-92`).

가져오면서 어긋난 값은 하나다. 이관 전 제품 정본의 꺼짐 트랙 알파가 15%였는데 여기서는 16%다 —
램프에 15가 없고, 램프 밖 값을 새로 만들지 않으려고 가장 가까운 단(`static-white-alpha.16`)을
골랐다. 1%p다. **지금 살아 있는 편차가 아니다.** 제품이 이 레시피를 채택한 뒤로는 제품도 16%를
렌더한다.

**이 문서의 `PublishFlow.tsx` 좌표는 전부 이관 전 고정 evidence 커밋 기준이다.** 그 커밋이 값을
가져온 출처이고, 현재 제품 트리는 이미 `.louis-switch`를 붙인 상태라 그 자리에 리터럴이 없다.
좌표 옆의 값을 "제품이 지금 이렇다"로 읽지 마라 — "여기 값이 어디서 왔는지"로 읽어야 한다.

## Availability

| Surface       | 상태           | 근거                                                          |
| ------------- | -------------- | -------------------------------------------------------------- |
| Web           | `partial`      | CSS 레시피 `packages/css/src/component/switch.css`가 서고 제품이 한 자리에서 소비한다. **React 컴포넌트가 없다** — `packages/react/src`에 `switch` 디렉터리가 없고, `packages/react/test`에 `switch.browser.test.tsx`도 없다. 소비처가 마크업을 손으로 쓴다 |
| Figma         | `partial`      | Switch — VARIANT 속성 Checked × Disabled로 4벌. 소비자가 그 드롭다운으로 상태를 바꾼다. `figma/components.measured.json`에 항목이 없어 기하가 대조되지 않는다 |
| Documentation | `done`         | 이 문서                                                        |
| Maturity      | `experimental` | 규범이 구현보다 먼저 서고, React 표면과 acceptance test가 아직 없다 |

## When to use

- **누르는 즉시 반영되는 설정** — 알림 켜기, 예약 발행 켜기, 자동 저장 켜기.
- 켜짐/꺼짐 **둘뿐**이고 중간 상태가 없을 때.

쓰지 않는 자리.

- **폼을 제출해야 반영되는 값.** 그것은 [Checkbox](checkbox.md)다. 체크박스는 "제출하면 이렇게
  된다"를 뜻하고 스위치는 "지금 이렇게 됐다"를 뜻한다. 두 컴포넌트를 가르는 유일한 기준이며,
  섞으면 사용자가 저장 버튼을 눌러야 하는지 아닌지 알 수 없다.
- **셋 이상 중 하나 고르기.** 그것은 [Segmented Control](segmented-control.md)이다.
- **부분 선택이 있을 때.** 스위치에 indeterminate가 없다. 그것은 Checkbox의 `indeterminate`다.
- **되돌릴 수 없거나 확인이 필요한 동작.** 스위치는 확인 단계를 갖지 않는다. 그것은 Button이고,
  필요하면 [Dialog](dialog.md)가 뒤따른다.
- 무거운 작업의 시작. 스위치가 켜진 뒤 몇 초를 기다려야 한다면 그 상태를 표현할 자리가 없다 —
  이 레시피에 loading 축이 없다.

## API

CSS 레시피만 있고 React 표면이 없다. 소비처가 마크업을 직접 쓴다.

```tsx
<button
  type="button"
  className="louis-switch louis-focus-ring"
  role="switch"
  aria-checked={scheduled}
  onClick={() => setScheduled(!scheduled)}
>
  <span className="louis-switch__thumb" />
</button>
```

**포커스 링은 이 레시피가 소유하지 않는다.** `.louis-focus-ring`을 함께 붙이지 않으면 키보드
포커스가 아무 표시도 남기지 않는다. 아래 Known deviations.

## Anatomy

1. **Track** — `<button type="button" role="switch">`. 면·반경·상태·커서를 소유하고, 자신이
   flex 자식일 때 눌리지 않도록 `flex: none`을 스스로 선언한다.
2. **Thumb** — `<span class="louis-switch__thumb">`. 원·그림자·**이동**을 소유한다.
3. **Label** — 트랙 **바깥**에 있다. 이 레시피에 라벨 슬롯이 없다.

**썸이 트랙의 pseudo-element가 아니라 실제 요소인 이유.** `::before`로 그리면 소비처가 그 자리를
덮어쓸 수 있고, 클래스 하나(`__thumb`)로 계약을 드러내는 편이 검사에도 걸린다.

**트랙이 `<button>`인 이유는 checkbox와 갈라서기 위해서다.** 네이티브 `<input type="checkbox">`로
그리면 폼 직렬화에 값이 실려 나가 "제출해야 반영되는 것"으로 읽힌다. 스위치는 그 뜻을 가지면
안 된다. 제품도 이미 `role="switch"` + `aria-checked`인 `<button>`을 쓰고 있었다
(`PublishFlow.tsx:373-382`).

## Properties

**React prop이 아니다.** 이 레시피의 입력은 소비처가 DOM에 직접 쓰는 속성이다.

| 속성 | 값 | 기본 | 뜻 |
| --- | --- | --- | --- |
| `role` | `switch` | **필수** | 역할. 없으면 그냥 버튼으로 읽힌다 |
| `aria-checked` | `true` \| `false` | **필수** | 켜짐/꺼짐. **이것이 유일한 상태 소스다** — 켜짐 면과 썸 위치가 이 속성 하나에서 나온다 |
| `disabled` | boolean | 없음 | `<button>`의 네이티브 비활성 |
| `aria-disabled` | `true` | 없음 | `disabled`를 쓸 수 없을 때의 대안. **표현만 같고 동작은 같지 않다** — 활성화를 막지 않는다 |
| `class` | `louis-switch` | **필수** | 트랙 |
| `class` | `louis-focus-ring` | 권장 | 포커스 링. 레시피 밖이다 |

**켜짐/꺼짐 클래스가 없는 이유.** 상태를 클래스로도 두면 클래스와 `aria-checked`가 어긋날 수
있고, 어긋나면 화면과 스크린 리더가 서로 다른 말을 한다. 제품은 이관 전 `TOGGLE`/`TOGGLE_ON`
두 상수로 갈랐는데(`PublishFlow.tsx:78-83`), 채택하면서 그 분기를 지웠다 — 상태가 `aria-checked`
한 곳에만 산다.

**`aria-disabled`도 받는 이유.** `disabled`가 붙은 `<button>`은 포커스를 받지 못해 왜 못 누르는지
설명할 기회가 사라진다. 두 경로 모두 같은 표현을 갖게 두고 어느 쪽을 쓸지는 호출부가 정한다.

**`aria-disabled`를 고르면 핸들러 가드가 호출부의 몫이다.** 두 경로는 **표현만 같고 동작이
같지 않다.** `aria-disabled`는 `<button>`의 활성화를 막지 않는데, 이 레시피가 그 선택자에 세우는
것은 `cursor: not-allowed`와 `opacity: 0.45` 둘뿐이고 `pointer-events`도 끄지 않는다. 클릭 ·
`Enter` · `Space`가 그대로 `onClick`에 도달한다는 뜻이고, 대신 막아 줄 React 래퍼도 없으므로
그 책임이 전부 소비처에 있다. `aria-disabled`를 쓸 때는 핸들러 첫 줄에서 직접 막아라. 막을
자신이 없으면 `disabled`를 써라 — 그쪽은 브라우저가 막는다.

## Hierarchy와 variants

**variant 축이 없다.** 스위치는 강조 단계를 갖지 않는다 — 한 화면에 여럿이 있어도 어느 설정이
중요한지는 스위치의 모양이 아니라 라벨과 배치가 말한다.

**크기 축이 없다.** 제품에 한 벌뿐이라 두 번째 크기를 요구한 자리가 없다. 크기 축을 지금 열면
근거 없는 값 하나를 만들어 두는 것이 된다.

트랙 크기가 `layout-control-height-*`(32 / 40px)를 **쓰지 않는다.** 24px은 그 계단에 없고,
스위치는 텍스트 컨트롤처럼 줄을 맞추는 물건이 아니라 라벨 오른쪽에 붙는 고유 기하다.

## States

| state | 표현 |
| --- | --- |
| Off | 트랙 `color-switch-off-track`(흰색 16%), 썸이 왼쪽 |
| On | 트랙 `color-switch-on-track`(#00c68e), 썸이 오른쪽으로 20px |
| Disabled | 위 두 표현 그대로, `opacity: 0.45` + `cursor: not-allowed` |
| Focus | 소비처가 붙인 `.louis-focus-ring`의 `:focus-visible` outline |

**hover 표현이 없다.** 제품 정본에 없었고, 넣으려면 꺼짐/켜짐 두 면에 각각 대응하는 hover 값이
필요한데 그 짝이 토큰에 없다. 커서가 `pointer`로 바뀌는 것이 현재의 유일한 hover 신호다.

**pressed 표현이 없다.** 눌림과 결과(면이 바뀌는 것)가 220ms 안에 겹쳐서, 누름 표현을 따로 두면
두 전환이 같은 시간대에서 다툰다.

**Disabled가 켜짐/꺼짐을 지우지 않는다.** 불투명도만 낮추므로 비활성 상태에서도 현재 값이
읽힌다. 값을 지우면 "왜 꺼져 있는지"를 사용자가 알 수 없다.

## Interaction and responsive behavior

- **폭이 고정이다.** 44px이고 늘거나 줄지 않는다. 트랙이 `flex: none`을 스스로 선언하므로
  `justify-between` 행 안에서 라벨이 길어져도 눌리지 않는다.
- 줄바꿈하지 않는다. `display: inline-flex`이고 자식이 하나다.
- 클릭·`Enter`·`Space`가 모두 값을 바꾼다 — `<button>`의 네이티브 활성화다.
- 썸의 이동은 `translate` 프로퍼티가 소유하고, 트랙의 면 전환은 `background`가 소유한다. **두
  전환이 서로 다른 요소에 있다.**

## Content

- 라벨은 **켜졌을 때 무엇이 참이 되는지**를 말한다. "예약 업로드"이지 "예약 업로드를
  켜시겠습니까?"가 아니다.
- **부정형을 쓰지 않는다.** "알림 끄기"라는 라벨의 스위치는 켜면 끄는 것이 되어 두 번 뒤집힌다.
- 라벨에 상태를 넣지 않는다. "예약 업로드 켜짐"이라고 쓰면 꺼졌을 때 라벨이 거짓말을 한다.
  상태는 스위치가 말한다.
- 라벨은 트랙 **왼쪽**에 둔다. 제품 정본이 그렇고(라벨 — 여백 — 스위치), 여러 설정이 세로로
  쌓일 때 스위치가 오른쪽 한 줄로 정렬된다.

## Accessibility

- **`role="switch"` + `aria-checked`가 상태를 나른다.** 색이 아니다. 색각 이상에서 초록/반투명
  회색 구분이 사라져도 보조기술은 "켜짐"을 읽는다.
- **이름은 트랙 바깥에서 온다.** 레시피에 라벨 슬롯이 없으므로 소비처가 `aria-labelledby`로 옆
  라벨을 가리키거나 `aria-label`을 준다. 현재 제품 소비처는 라벨 `<span>`을 옆에 두기만 하고 둘을
  **연결하지 않는다**(`PublishFlow.tsx:373-382`) — 스위치에 접근 가능한 이름이 없다. 아래 Known
  deviations.
- **포커스 링이 레시피 밖이다.** `.louis-focus-ring`(`packages/css/src/base.css`)을 함께 붙여야
  하고, 그 링은 `outline`이라 `border-radius`를 따라가고 forced-colors에서 `Highlight`로 바뀐다.
- **`prefers-reduced-motion: reduce`에서 두 전환의 duration이 `motion-reduced-duration`(0ms)이
  된다.** 값은 즉시 바뀌고 이동만 사라진다 — 전환을 없애는 것이지 동작을 없애는 것이 아니다.
- **forced-colors에서 면 색이 시스템 색으로 치환되면 on/off가 같아 보인다.** 트랙에
  `currentColor` 테두리를 세우고, 켜짐만 `Highlight`로 채우며, 썸을 꺼짐에서 `currentColor` ·
  켜짐에서 `HighlightText`로 뒤집어 두 상태가 갈라지게 한다. 그림자는 그 모드에서 지운다.
- **44px hit target 규범에 미달한다.** 폭 44px은 맞지만 높이가 24px이다. 아래 Known deviations.

## Specification

| 축 | 값 | 토큰 |
| --- | ---: | --- |
| 트랙 폭 | 44px | 리터럴 |
| 트랙 높이 | 24px | 리터럴 |
| 트랙 안쪽 여백 | 2px | 리터럴 |
| 트랙 반경 | 999px | `radius-pill` |
| 트랙 테두리 | 0 | — |
| 썸 지름 | 20px | 리터럴 (24 − 2×2) |
| 썸 반경 | 999px | `radius-pill` |
| 썸 이동 거리 | 20px | 리터럴 (44 − 4 − 20) |
| 꺼짐 트랙 | 흰색 16% | `color-switch-off-track` |
| 켜짐 트랙 | #00c68e | `color-switch-on-track` |
| 썸 면 | #fafafa | `color-switch-thumb` |
| 썸 그림자 | 0 1px 3px 검정 20% | `elevation-switch-thumb` |
| 비활성 불투명도 | 0.45 | 리터럴 |
| 전환 시간 | 220ms | `motion-layout-change-duration` |
| 전환 곡선 | cubic-bezier(0.4, 0, 0.2, 1) | `motion-layout-change-timing-function` |
| reduced-motion 전환 시간 | 0ms | `motion-reduced-duration` |
| forced-colors 테두리 | 1px | `border-width-default` |

**이 기하를 고른 이유.** 제품 정본의 값 그대로다 — 44×24 트랙, 2px 여백, 20px 썸, 20px 이동,
220ms(`PublishFlow.tsx:78-83`, `PublishFlow.tsx:86-92`). 제품에 갈래가 없어 고를 것이 없었고,
DS가 다른 값을 정하면 유일한 소비처의 외형이 바뀌는 것 말고 얻는 것이 없다.

**네 자리가 토큰이 아니라 리터럴인 이유.**

| 자리 | 왜 리터럴인가 |
| --- | --- |
| 트랙 44×24 | `layout-control-height-*`는 32 / 40px 두 단뿐이고 24는 그 계단에 없다. 스위치는 텍스트 컨트롤과 다른 축의 고유 기하이므로 그 계단에 억지로 맞추지 않는다 |
| 안쪽 여백 2px | `space-control-*` 램프가 4 / 8 / 12 / 16px에서 시작한다. 4px을 쓰면 썸이 16px이 되어 제품 외형이 바뀐다 |
| 썸 20px | 파생값이다 — 트랙 높이 24 − 여백 2×2 |
| 이동 20px | 파생값이다 — 트랙 폭 44 − 여백 4 − 썸 20 |

**세 파생값이 서로 물려 있다.** 트랙 폭·높이·여백 중 하나만 바꿔도 썸 지름과 이동 거리가 함께
움직인다. 셋 중 하나만 고치면 썸이 트랙 밖으로 나가거나 오른쪽 끝에 닿지 않는다.

**일부러 두지 않은 것.** 크기 축, variant 축, hover·pressed 표현, loading 표현, 라벨 슬롯,
트랙 안 아이콘·글자(ON/OFF), 트랙 안 체크 표시. 제품에 요구한 자리가 하나도 없고, 넣으면 전부
근거 없는 값이 된다.

## Effects

썸의 그림자 `elevation-switch-thumb`(0 1px 3px 검정 20%) 하나뿐이다. **켜짐(#00c68e)과
꺼짐(반투명 회색) 어느 면 위에서도 썸이 떠 보이게 하는 것이 목적**이고, 제품 정본의
`0 1px 3px rgb(... / 20%)`을 그대로 옮긴 값이다(`PublishFlow.tsx:86-92`).

트랙에 그림자도 헤어라인도 없다. 켜짐 면은 색으로 충분히 읽히고, 꺼짐 면은 아래 Known deviations의
대비 문제를 안고 있는데 헤어라인을 얹어도 그 문제가 풀리지 않는다(테두리 색 역시 같은 표면 위에서
같은 대비를 갖는다).

forced-colors에서 그림자를 지운다 — 그 모드에서 그림자는 렌더되지 않거나 시스템 색을 흐린다.

## Implementation

- **`translate` 프로퍼티로 이동한다. `transform`이 아니다.** `transform`으로 적으면 소비처가 얹는
  transform 유틸리티(제품은 Tailwind 임의값을 이 자리에 자주 쓴다)와 같은 프로퍼티를 다투고, 그
  순간 **이동이 통째로 사라진다** — 스위치가 상태를 바꿔도 썸이 제자리에 있게 된다. 별도 프로퍼티로
  분리하면 두 값이 합성된다.
- **트랙은 `background`만, 썸은 `translate`만 트랜지션한다.** 두 전환이 서로 다른 요소에 있고
  각자 자기 프로퍼티를 소유한다. 한 요소에 몰면 소비처가 하나를 덮을 때 다른 하나가 함께 죽는다.
- **트랙이 `box-sizing: border-box`를 스스로 선언한다.** reset(`packages/css/src/reset.css`)이
  opt-in이라 소비처가 켜지 않을 수 있고, 켜지 않으면 2px 패딩이 44×24 바깥으로 더해진다.
- **트랙이 `flex: none`도 스스로 선언한다 — 이쪽 이유는 reset이 아니다.** reset은 flex를 아예
  다루지 않는다(`box-sizing`, body·heading margin, list, media 넷뿐이다). flex 아이템의 기본값이
  `flex-shrink: 1`이므로 reset을 켜든 말든 flex 행 안에서 44px이 눌린다. 그래서 트랙이 자기 폭을
  스스로 지킨다.
- 꺼짐 트랙·켜짐 트랙·썸 세 색은 **light와 dark 모드의 값이 같다.** 테마에 따라 뒤집히지 않는다.
- `.louis-switch`에 `position: relative`가 선언돼 있으나 이 레시피 안에 절대 배치되는 자식이
  없다. 무엇을 위한 것인지 CSS에 근거가 없다 — **확인되지 않았다.**

## Known deviations

- **React 표면이 없다.** `packages/react/src/switch`가 없고 `packages/react/test`에 스위치
  테스트 파일도 없다. 다른 컴포넌트가 "실브라우저 acceptance test N건"을 근거로 세우는 자리에
  이 컴포넌트는 아무 증거가 없다. 아래 Acceptance tests는 사람이 확인할 항목이며 아직 기계가
  돌리지 않는다.
- **기하를 대조하는 게이트가 없다. parity 게이트는 돈다.** `scripts/verify-figma-parity.mjs`에
  `id: "switch"` 항목이 서 있고 `verify:ci`가 매번 실행하므로 Checked · Disabled 두 축과 썸의
  `DROP_SHADOW`는 Figma와 대조된다. 대조되지 않는 것은 **치수뿐이다** —
  `figma/components.measured.json`에 `switch` 항목이 없어 44×24 · 여백 2 · 썸 20 · 이동 20이
  어느 쪽에서도 기계로 확인되지 않는다. 이 문서 Specification의 기하는 사람이 읽어야 하는 값이다.
- **꺼짐 트랙 알파가 이관 전 제품 정본과 1%p 다르다.** 그쪽이 15%, 여기가 16%. 램프에 15가 없어
  가장 가까운 단을 골랐고, 램프 밖 값을 새로 만드는 대가보다 1%p가 쌌다. **살아 있는 편차가
  아니다** — 제품이 이 레시피를 채택한 뒤로 제품도 16%를 렌더한다. 이관 전 값과의 역사적 차이로
  남긴다.
- **꺼짐 상태가 밝은 테마에서 보이지 않는다.** 세 색이 두 모드에서 같은 값인데 꺼짐 트랙이
  흰색 16%다. `color-surface-background` 위에 놓고 계산하면 —

  | 대비 | 라이트(#f1f1f3) | 다크(#171b22) |
  | --- | ---: | ---: |
  | 꺼짐 트랙 대 표면 | 1.02 | 1.65 |
  | 썸 대 꺼짐 트랙 | 1.06 | 10.05 |
  | 켜짐 트랙 대 표면 | 1.97 | 7.78 |
  | 썸 대 켜짐 트랙 | 2.12 | 2.12 |

  라이트에서 꺼진 스위치는 표면과 구별되지 않고 썸도 트랙과 구별되지 않는다. **지금 드러나지
  않는 이유는 유일한 소비처가 어두운 화면이기 때문이다.** 제품 원본은 썸을 `--gray-000`으로
  칠했는데 그 변수는 테마에 따라 뒤집히므로 라이트에서 썸이 어두웠다 — LOUIS가 고정값으로
  옮기면서 그 뒤집힘이 사라졌다. 밝은 표면에서 스위치를 쓰기 전에 꺼짐 트랙과 썸을 테마별 값으로
  갈라야 한다. [color-theme.md](../foundations/color-theme.md)가 의미 있는 비텍스트 그래픽에
  요구하는 3:1을 라이트의 네 수치 전부가 넘지 못한다.
- **`motion-layout-change`가 `translate`를 선언하지 않는다.** 그 recipe의 허용 property는
  `inline-size`와 `background-color` 둘뿐인데 썸이 그 duration·easing으로 `translate`를
  트랜지션한다. [motion.md](../foundations/motion.md)의 Token model은 선언되지 않은 property를
  임의로 animation하지 않는다고 못박는다. **게이트는 이것을 잡지 않는다** — 계약 검사가
  `@keyframes`와 `animation-name`만 보고 `transition-property`는 보지 않는다. 트랙의
  `transition-property: background`도 선언된 이름(`background-color`)과 다른 단축 프로퍼티다.
  둘 다 recipe의 허용 목록을 넓히거나 스위치 전용 recipe를 세워야 풀린다.
- **포커스 링을 레시피가 소유하지 않는다.** 소비처가 `.louis-focus-ring`을 함께 붙여야 하고,
  빠뜨리면 키보드 포커스가 아무 표시도 남기지 않은 채 게이트를 통과한다. Button 계열이 같은
  구조인데, 스위치는 React 래퍼가 없어 **빠뜨릴 자리가 소비처마다 열려 있다.**
- **44px hit target에 미달한다.** 44×24이므로 높이가 절반이다. `.louis-hit-target`
  (`packages/css/src/base.css`)이 시각 크기를 그대로 두고 타깃만 44px로 넓히는 유틸로 이미 있는데
  이 레시피가 붙이지 않는다. 붙일지 여부는 소비처가 정하게 되어 있고, 현재 제품 소비처는 붙이지
  않는다.
- **접근 가능한 이름이 계약에 없다.** 라벨 슬롯이 없으니 이름은 소비처의 몫인데, 유일한 소비처가
  `aria-label`도 `aria-labelledby`도 주지 않아 지금 이 스위치는 이름 없이 "switch, on"으로만
  읽힌다(`PublishFlow.tsx:373-382`). **이것은 알파 1%p와 달리 아직 살아 있다** — 고정 커밋에서도
  현재 제품 트리에서도 그 연결이 없다. 레시피 채택이 고쳐 주지 않는 결손이고, 라벨 슬롯을 가진
  React 표면이 서면 함께 풀린다.
- **생성물이 낡아 진행 표에 나오지 않는다. 등록이 빠진 것이 아니다.** `design/manifest.json`의
  documents와 components 양쪽에 `switch`가 서 있고, 그래서 위 Availability 네 행은
  `scripts/build-design-docs.mjs`의 `validateAvailability`가 매 CI마다 registry와 대조한다 —
  네 값 중 하나라도 어긋나면 게이트가 그 자리에서 실패한다. 낡은 것은 생성 블록 두 곳이다:
  `design/components/README.md`의 `GENERATED:component-progress`와 `design/README.md`의
  `GENERATED:catalog`(Components 수가 25에 멈춰 있다). alert · node-chip · switch · table · tabs
  다섯이 함께 빠져 있으니 생성기를 다시 돌리면 다섯이 같이 풀린다. 이 문서가 고칠 수 있는
  결손이 아니다.

## Acceptance tests

1. 트랙이 44×24px이고 안쪽 여백이 2px이며 테두리 두께가 0이다.
2. 썸이 20×20px이고, 그 값이 트랙 높이 − 2×여백과 같다.
3. `aria-checked="true"`에서 썸의 `translate`가 `20px 0`이고, 그 값이 트랙 폭 − 2×여백 − 썸
   지름과 같다.
4. 트랙과 썸의 반경이 모두 `radius-pill`(999px)로 해석된다.
5. `aria-checked="false"`의 트랙 면이 `color-switch-off-track`, `true`의 트랙 면이
   `color-switch-on-track`으로 해석되고 **둘이 서로 다른 색을 만든다.**
6. 썸 면이 `color-switch-thumb`, 썸 그림자가 `elevation-switch-thumb`로 해석된다.
7. 위 세 색의 계산값이 `[data-theme="light"]`와 `[data-theme="dark"]`에서 **같다.** (다르게
   만드는 것이 위 Known deviations의 해소이며, 그때 이 항목을 뒤집는다.)
8. 상태가 클래스가 아니라 `aria-checked`에서만 나온다 — 클래스 목록이 두 상태에서 동일하다.
9. `disabled`와 `aria-disabled="true"`가 **같은 표현**(불투명도 0.45 · `cursor: not-allowed`)을
   만들고, 비활성 상태에서도 켜짐/꺼짐이 구별된다.
10. **표현이 같다고 동작까지 같지는 않다.** `disabled`가 붙은 트랙은 클릭이 `onClick`에 닿지
    않는다. `aria-disabled="true"`만 붙은 트랙은 **닿는다** — 레시피가 `pointer-events`를 끄지
    않으므로 그것이 정상이고, 막는 것은 호출부의 책임이다. 두 결과가 서로 다르게 나와야 한다.
11. 트랙의 `transition-property`가 `background` 하나이고, 썸의 것이 `translate` 하나다. **어느
    쪽에도 `transform`이 없다.**
12. 소비처가 썸에 transform 유틸리티를 얹어도 켜짐 이동이 사라지지 않는다.
13. 두 요소의 `transition-duration`이 `motion-layout-change-duration`(220ms)이고,
    `prefers-reduced-motion: reduce`에서 `motion-reduced-duration`(0ms)이 된다.
14. `forced-colors: active`에서 트랙에 `border-width-default` 두께의 `currentColor` 테두리가
    서고, 켜짐 트랙이 `Highlight`, 켜짐 썸이 `HighlightText`, 꺼짐 썸이 `currentColor`가 되며
    썸 그림자가 없다.
15. 트랙이 `flex` 행 안에서 폭 44px을 유지한다(`flex: none`).
16. 클릭·`Enter`·`Space`가 모두 값을 바꾼다.
17. `.louis-focus-ring`을 함께 붙였을 때 키보드 포커스에서만 outline이 나타나고 그 두께가
    `border-width-ring`이다.
18. 접근성 트리에서 역할이 `switch`이고 체크 상태가 노출된다.
