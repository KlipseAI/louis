---
id: decision-overlay-primitive-boundary
status: experimental
authority: normative
---

# DS-D-0011 Overlay primitive boundary

- Status: proposed
- Date: 2026-08-14
- Owners: repository owner, package maintainer
- Affects: `@klipse-design/react`, `component-dialog`, `component-menu-popover`,
  `foundation-motion`, `decision-behavior-dependency`, `decision-test-stack`

## Context

[DS-D-0003](DS-D-0003-behavior-dependency.md)이 "하부 유틸리티만 채택하고 **순서와 정책은 Klipse가
소유한다**"를 확정했다. DS-P3-005는 그 소유 구간을 실제 코드로 만드는 작업이고, `packages/react`에
Button 외 두 번째 내부 계층이 처음 생긴다.

이 계층은 Menu(DS-P3-006)와 Dialog(DS-P3-007)가 공유하지만 **그 자체로는 소비자 표면이 아니다.**
그래서 코드를 쓰기 전에 패키지 경계와 import 규약이 먼저 정해져야 한다. 정하지 않고 시작하면
`packages/react/src/index.ts`와 `package.json` `exports`, `verify-gates.mjs`의
`declaredPackageSurfaces`가 서로 다른 시점에 서로 다른 가정으로 수정된다.

추가로 규범에 공백이 두 개 있다. 어느 쪽도 이 결정 없이는 구현자가 임의로 메울 수밖에 없다.

- [Motion](../../foundations/motion.md)은 reduced-motion에서 "순서는 동일"만 규정하고 unmount
  timer의 duration에는 침묵한다.
- [Menu & Popover](../../components/menu-popover.md)의 dismiss reason 어휘는
  `{trigger, select, escape, outside, route}`인데, non-modal에서 Tab으로 focus가 빠져나가 닫히는
  경로가 어느 reason인지 규정돼 있지 않다.

## Decision

### 1. 내부 primitive를 public export 하지 않는다

`packages/react/src/overlay/**`는 `packages/react/src/index.ts`에서 재export하지 않고
`package.json`의 `exports`에도 서브패스를 만들지 않는다. 공개 표면은 Menu·Dialog 같은 **recipe**이며
primitive는 그 recipe의 구현 세부다.

인계서의 "독립 consumer 2개가 검증되기 전에는 패키지를 분리하지 않는다"와 같은 근거다. 현재 consumer는
0개이고, DS-P3-006·007이 완료되면 2개가 된다. 그때 이 항목을 재검토한다.

부수 효과가 0이라는 점이 중요하다. `verify-gates.mjs`의 `declaredPackageSurfaces`는 react 패키지를
`[".", "./package.json"]`로 선언하는데 이 결정은 그 목록을 건드리지 않으므로 **게이트 변경이 없다.**

### 2. 테스트는 `dist`를 상대 경로로 읽는다 — 기존 관행의 명시적 예외

`packages/react/test/**`에서 primitive를 검증할 때는
`import { … } from "../dist/overlay/index.js"`로 접근한다.

이는 "테스트는 소비자와 같은 public import를 쓴다"는 기존 관행의 예외이며, 예외인 이유를 여기 남긴다.
그 관행의 목적은 **소비자 표면을 소비자와 같은 경로로 검증하는 것**인데 overlay primitive는 소비자
표면이 아니다. 존재하지 않는 표면을 검증하려고 표면을 만드는 것은 목적과 수단이 뒤바뀐 것이다.

`src`가 아니라 `dist`를 읽는 것이 이 예외의 핵심 조건이다. 그래야 `tsc` + `isolatedDeclarations`
빌드 경로가 그대로 검증된다. `verify-figma-parity.mjs`가 `.d.ts`를 직접 읽어 union을 대조하는 것과
같은 선례다.

### 3. reduced-motion에서 unmount timer는 resolved recipe를 그대로 읽어 0ms로 붕괴한다

`readExitDuration(node)`는 토큰 이름을 JS에 하드코딩하지 않고 `getComputedStyle(node)`의
`transition-duration + transition-delay`, `animation-duration + animation-delay` 중 최댓값을 읽는다.
컴포넌트 CSS가 `@media (prefers-reduced-motion: reduce)`에서 duration을
`--kds-motion-reduced-duration`(= `0ms`)으로 대입하면 timer도 자동으로 0이 된다.

**순서는 바꾸지 않는다.** duration이 0이어도 `closing → performReturn → finish → unmount` 전이는
같은 순서로 일어나며, 단지 같은 tick 안에서 끝난다. 이것이 Motion의 "exit 완료와 unmount가 같은
source"를 실제로 증명 가능하게 만드는 유일한 구현이다 — 두 값이 서로 다른 곳에서 오면 어긋나도
테스트가 알 수 없다.

### 4. non-modal Tab 이탈은 `"outside"`로 매핑한다

새 reason(`focus-out` 등)을 만들지 않는다. reason 어휘는 Menu & Popover 규범이 소유하며 어휘 확장은
그 문서의 개정이지 DS-P3-005의 범위가 아니다.

`"outside"`가 정확히 맞는 이유는 focus 정책이 같기 때문이다. `outside`는 "포커스를 옮기지 않는다"인데
Tab 이탈은 사용자가 이미 focus를 다음 요소로 옮긴 상태다. 여기서 focus를 trigger로 되돌리면 사용자의
Tab을 취소하는 것이 되어 규범 위반이다.

### 5. 공개 진입점은 recipe 계층이 소유한다

`useOverlayContext()`는 Provider 밖에서 throw한다. 그래서 Menu·Dialog를 public export하는 순간
소비자가 렌더할 공개 컴포넌트가 하나 더 필요하다 — 결정 1은 `overlay/**`를 재export하지 않는다고만
정했고 이 진입점을 다루지 않았다.

primitive `OverlayProvider`를 그대로 재export하지 않고 **recipe 계층의 얇은 래퍼가 공개 이름을
소유한다.** 소비자가 보는 props는 `{ children, container? }`이며 primitive 모듈은 여전히 비공개다.

컴포넌트가 host를 자동 생성하는 안은 채택하지 않는다. 인스턴스마다 stacking과 inert 경계가 달라지고,
그것은 규범이 금지한 방향이다.

`declaredPackageSurfaces`와 `package.json`의 `exports`는 변하지 않는다 — 공개되는 것은 심볼이지
서브패스가 아니다.

## Alternatives

### primitive를 `./internal/overlay` 서브패스로 노출

테스트가 public import 관행을 그대로 유지할 수 있다. 그러나 (a) `exports`에 올라간 것은 semver 계약을
갖게 되고 — `internal` 이름은 도구가 강제하지 않는 사회적 약속일 뿐이다 — (b)
`declaredPackageSurfaces`와 scaffold canary를 함께 고쳐야 하며 (c) consumer 0개인 상태에서 계약을
먼저 만드는 것이 된다. 결정 2의 rollback 경로로 남긴다.

### primitive를 별도 패키지 `@klipse-design/overlay`로 분리

DS-P3-008에서 독립 headless 소비자가 실제로 둘 이상 생기면 그때 유효하다. 지금 분리하면 검증되지 않은
경계에 버전과 peer 계약을 붙이게 되고, DS-D-0006의 peer 규칙까지 새로 써야 한다.

### 테스트가 `src`를 직접 import

가장 빠르지만 빌드 경로를 건너뛴다. `isolatedDeclarations` 위반이나 `.d.ts` 생성 실패가 테스트를
통과한 뒤 build에서만 드러나며, 그마저 CI 순서에 의존한다.

### reduced-motion에서 timer를 JS 상수 0으로 고정

간단하지만 CSS와 JS가 서로 다른 source를 갖게 된다. CSS가 reduced-motion에서 duration을 남겨두고
JS만 0이면 시각 transition 도중에 unmount되며, 반대면 보이지 않는 요소가 timer만큼 살아 있다. 어느
쪽도 테스트가 감지하지 못한다 — 두 값을 각각 확인할 뿐 **일치**를 확인하지 않기 때문이다.

### Tab 이탈에 새 reason `focus-out`을 추가

호출부가 pointer 바깥 클릭과 keyboard 이탈을 구분할 수 있다. 그러나 구분이 필요한 실제 소비자가 아직
없고, 어휘 확장은 규범 문서 개정과 Menu·Dialog·Update를 같은 변경 단위에서 맞춰야 한다. 필요해지면
그때 규범 개정으로 처리한다.

## Consequences

- `packages/react`의 공개 표면이 DS-P3-005 전후로 **변하지 않는다.** 게이트 diff 0, `exports` diff 0.
- Menu와 Dialog는 primitive를 상대 경로로 import한다(`../overlay/use-overlay.js`). 번들러 관점에서
  단일 진입점 안의 내부 모듈이므로 tree-shaking에 불리하지 않다.
- overlay primitive에는 **소비자 표면 테스트가 없다.** 대신 `dist` 경유 내부 테스트와, DS-P3-006·007에서
  Menu·Dialog의 public 표면 테스트가 같은 계약을 다시 덮는다. 이 이중 구조를 의도적으로 유지한다.
- reduced-motion 검증이 자동으로 붙는다. `vitest.config.ts`의 `browser-reduced-motion` project가 모든
  브라우저 테스트를 reduced-motion 컨텍스트에서 한 번 더 돌리므로, 결정 3의 "순서 동일 · duration 0"은
  별도 테스트를 쓰지 않아도 전 테스트가 이중 실행되며 검증된다.
- `"outside"` 한 reason이 pointer와 keyboard 두 경로를 덮으므로, reason만 보고 입력 수단을 역추적할 수
  없다. 필요해지면 규범 개정으로 어휘를 넓힌다.

## Rollback

| 결정 | rollback |
| --- | --- |
| 1 public export 금지 | `src/index.ts` 재export + `exports`에 `./overlay` 추가 + `declaredPackageSurfaces` 갱신. 공개 시점부터 semver 계약 시작 |
| 2 dist 상대 import | 1을 되돌리거나 `./internal/overlay` 서브패스 선언. 테스트 import 경로만 바뀐다 |
| 3 resolved recipe 읽기 | `readExitDuration`에 상수 fallback을 주입. 단 CSS와의 일치 테스트를 함께 잃는다 |
| 4 `"outside"` 매핑 | menu-popover.md 어휘 확장 후 새 reason 발행. 소비자 코드는 reason을 switch로 다루므로 default 분기가 있으면 호환된다 |
| 5 recipe 래퍼 | primitive `OverlayProvider`를 직접 재export한다. 공개 심볼 이름이 같으므로 소비자 코드는 바뀌지 않는다 |

## Rollout and verification

1. 이 결정이 `proposed`인 동안에도 primitive 구현을 진행한다. 다섯 항목 모두 **되돌릴 때 public 표면이
   바뀌지 않거나(1·2·5), 국소 구현만 바뀌기(3·4)** 때문이다.
2. `overlay-store.ts`와 `branch-registry.ts`는 React 비의존이므로 `node` project에서 단위 검증한다.
   첫 측정 대상은 **같은 commit 중첩 마운트에서 topmost가 자식이 되는가**다 — 하부 유틸의 삽입 순서
   비교자가 이 저장소 안에서도 역전되는지 재현하고, 우리 비교자가 이를 이기는 것을 함께 남긴다.
3. 나머지는 `browser` project에서 두 개 이상 fixture로 pointer·keyboard·focus·stacking 회귀를
   재현·차단한다. 각 회귀마다 **검출력 테스트**(위반 상태를 만들면 실제로 실패하는지)를 함께 둔다.
4. DS-P3-006·007이 완료되면 결정 1을 재검토한다. 그 시점의 판단 기준은 "independent consumer 2개"이며
   Menu·Dialog는 같은 패키지 내부 consumer이므로 **자동으로 충족되지 않는다.**
5. owner가 확인하면 `accepted`로 전환한다.

## 재검토 조건

- 외부 consumer가 primitive를 직접 요구하면 결정 1·2를 함께 재검토한다.
- 하부 유틸을 교체하면(DS-D-0003의 fallback 경로) primitive 내부는 바뀌지만 이 결정의 경계는 유지된다.
  경계가 유지되지 않는 교체안은 이 결정을 supersede해야 한다.
- Motion 규범이 reduced-motion duration을 직접 규정하면 결정 3은 그 규범을 따르고 여기서 삭제한다.
