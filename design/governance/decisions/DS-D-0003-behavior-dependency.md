---
id: decision-behavior-dependency
status: experimental
authority: normative
---

# DS-D-0003 Accessibility behavior dependency

- Status: proposed
- Date: 2026-08-14
- Owners: repository owner, package maintainer
- Affects: `@klipse-design/react`, `component-dialog`, `component-menu-popover`,
  `foundation-elevation-layer`

## Context

[플레이북](../execution-playbook.md)은 "검증된 headless primitive 채택이 기본값이고 직접 구현은 그
primitive가 규범 계약을 충족하지 못한다는 **반증이 있을 때만**"이라고 규정한다. 이 결정은 그 반증을
찾는 조사의 결과다.

규범이 요구하는 두 계약이 판정 기준이다.

- **Menu:** item click이 outside-dismiss보다 먼저 **정확히 한 번** 실행되고, 중첩 portal에서도 선택할
  수 있어야 한다. "열리지만 선택되지 않음"은 명시적 금지 계약이다.
- **Dialog:** modal과 non-modal/docked workspace를 명시적 mode로 구분하고, 중첩 시 topmost 하나만
  Escape와 Tab scope를 소유한다.

여기에 [Elevation & Layer](../../foundations/elevation-layer.md)의 "투명하거나 closing 중인 layer가
보이는 control의 pointer/focus를 가로채면 실패"가 더해진다.

## Decision

**Radix Primitives의 하부 유틸리티만 채택**하고, 순서와 정책은 Klipse가 소유한다.

| 채택 | 소유 |
| --- | --- |
| dismissable layer, focus scope, positioning(popper), portal | Menu의 선택·닫힘 **순서** |
| | Dialog의 modal/workspace mode 분리, Escape 정책, scroll lock, 언마운트 lifecycle |

**Radix·Base UI·React Aria의 완제품 Menu·Dialog 컴포넌트는 채택하지 않는다.**

`branchId`와 portal host 계약은 **라이브러리 중립으로 설계**해 하부 유틸을 교체해도 public API가 바뀌지
않게 한다.

### 완제품을 배제하는 반증

플레이북이 요구한 "반증"이 실재한다. 조사 시점 기준 Radix에 다음 **미해결 이슈**가 있다.

| 증상 | 규범 위반 |
| --- | --- |
| 중첩 submenu 안 item이 선택 콜백을 **아예 발화하지 않음** | Menu의 "열리지만 선택되지 않음" 금지 계약과 문자 그대로 동일 |
| collision으로 뒤집힌 submenu가 click 착지 전에 닫힘(React 19 한정) | 같은 계약 |
| Dialog content가 오픈 직후 첫 프레임에 `pointer-events: none` | Elevation & Layer의 "closing/투명 layer가 pointer를 가로채면 실패" |

과거에 선택 콜백 중복 호출 이슈가 해결까지 20개월 이상 걸린 이력도 있다. 우리 규범이 **핵심 금지
계약으로 명시한 실패**가 상류에 미해결로 존재하는 이상, 그 계층을 우리가 소유해야 한다.

## Alternatives

### Radix 완제품 전량 채택

가장 적은 코드로 시작한다. 그러나 위 반증이 정확히 우리 금지 계약을 때린다. 상류 수정 속도가 우리
릴리스 속도를 좌우하게 된다.

### Base UI 전량 채택 (3순위)

Dialog API 적합도는 후보 중 최고다. modal 옵션이 우리 Surface classifier와 거의 1:1로 대응하고 중첩
dialog 상태를 속성으로 노출한다. 그러나 (a) **focus scope·dismissable layer·positioning을 서브패스로
노출하지 않아 부분 채택이 불가능**하고 — "순서는 우리가 소유한다"는 규범과 구조적으로 충돌한다 —
(b) 중첩 portal 판정이 이벤트 타깃 자체만 확인해 조상 탐색을 하지 않는 결함이 최근까지 있었으며
리포터가 회귀로 기술했다. (c) 패키지명이 바뀐 전례가 있어 안정성 이력이 짧다.

### React Aria 저수준 훅 (2순위, fallback)

outside-dismiss 타이밍 설계가 요구사항에 **가장 정확히** 부합한다. 포인터 누름에서는 상태 플래그만
세우고 **콜백은 click에서만 발화**하며, 유효성 판정에 `composedPath()`와 top-layer 속성을 쓴다 —
Menu 규범의 "구현은 `composedPath()`와 branch registry를 우선 사용한다"와 동일 구조다. scroll lock과
바깥 숨김도 독립 함수다.

감점: 라이선스가 나머지 후보와 다르고, 상위 컴포넌트 패키지가 client-only 의존성을 포함해 Server
Component에서 import되지 않는다(저수준 훅만 쓰면 회피될 가능성이 있으나 **미확인**). branch registry가
Radix만큼 명시적이지 않다.

### Ark UI / Zag.js

단일 패키지가 직접 의존성 수십 개를 끌어와 의존성 억제 제약에 정면으로 위배된다. 중첩 menu에서
마우스는 되는데 키보드 선택이 안 되는 이력과 프레임워크 간 동작 불일치 이력이 있고, 메이저 이관이
진행 중이라 채택 시 부채가 확정된다.

### Headless UI

**채택 반대.** 바깥 클릭 핸들러가 무시되는 이슈가 2년 가까이 미해결이고(우리가 금지한 실패 모드의
정반대 버전), 중첩 menu 전체 파손 회귀 이력이 있으며, 릴리스 간격이 길고 escape hatch가 없다.

### 전량 자체 구현

focus scope의 branch 처리, positioning의 collision/flip, portal은 이미 검증된 코드가 존재하며 재작성
이득이 없다. 우리가 소유해야 하는 것은 **순서와 정책**이지 기하 계산이 아니다.

## Consequences

- 새 런타임 의존성 4개(하부 유틸). 완제품 대비 표면이 작고 각각 독립 교체가 가능하다.
- Menu의 선택 순서와 Dialog의 mode·Escape·scroll lock·언마운트를 우리가 구현하므로 **그만큼의 테스트를
  우리가 소유**한다. [DS-D-0005](DS-D-0005-test-stack.md)의 회귀 테스트 3건이 이 계약의 증거다.
- 상류 이슈가 해결돼도 우리 순서 로직은 유지된다. 반대로 상류가 회귀해도 우리 계약은 깨지지 않는다.
- **S1 spike로 핵심 계약을 실측했다** (2026-08-14, 저장소 밖, Chromium headless). dismissable layer와
  portal 조합에서 다음이 통과했다.

  | 검증 | 결과 |
  | --- | --- |
  | item 클릭 시 select가 정확히 한 번, dismiss 미발화 | 통과 |
  | 바깥 클릭 시 dismiss만 발화, select 미발화 | 통과 |
  | **중첩 portal 안 item이 정확히 한 번 선택** | **통과** |
  | closing layer가 pointer를 놓으면 아래 control이 클릭됨 | 통과 |
  | 검출력 — closing layer가 pointer를 잡으면 클릭이 가로채져 **실패** | 통과 |

  마지막 항목이 중요하다. 규범 위반 상태를 일부러 만들었을 때 테스트가 실제로 실패하므로, 앞의 네
  통과가 "검사하지 않아서 통과한 것"이 아님이 보인다.

- 완제품 Menu가 실패한다고 보고된 **중첩 portal 선택**이 하부 유틸 조합에서는 통과했다. 이것이 부분
  채택의 직접 근거다.

## Rollback

하부 유틸 교체는 `branchId`와 portal host 계약을 라이브러리 중립으로 유지하는 한 public API를 바꾸지
않는다. fallback 경로는 React Aria 저수준 훅이고, 그마저 불가하면 outside-dismiss를 자체 구현으로
후퇴한다. 어느 경로든 소비자 계약은 동일하게 유지한다.

완제품 채택으로 되돌리는 것은 순서 소유권을 포기하는 것이므로 이 결정을 supersede하는 ADR이
요구된다.

## Rollout and verification

1. ~~S1 spike~~ — **완료(2026-08-14).** 위 Consequences의 표가 결과다. fallback 경로(S2)는 S1이
   통과했으므로 critical path에서 빠졌고, 필요해질 때 확인한다.
2. ~~회귀 테스트를 저장소로 옮긴다~~ — **완료(2026-08-14).** spike의 다섯 검증이 fixture 2종 위에서
   돌고 있으며 검출력 짝을 전부 유지했다. Menu/Dialog의 public API가 아직 없으므로 primitive 표면에
   붙였고, 그 예외는 [DS-D-0011](DS-D-0011-overlay-primitive-boundary.md) 결정 2가 소유한다.
3. ~~DS-P3-005에서 overlay behavior layer를 구현한다~~ — **완료(2026-08-14).**
4. ~~Dialog의 nested Escape 순서~~ — **실측 완료(2026-08-14).** 중첩 modal에서 Escape가 최상위 하나만
   닫고, 아래 Dialog는 inert이며 backdrop dismiss도 받지 않는 것을 `overlay-stacking.browser.test.tsx`가
   고정한다. scroll lock 복원은 인라인 style 속성 유무까지 대조한다.
5. owner가 이 결정을 확인하면 `accepted`로 전환한다.

### 부분 채택이 실제로 옳았는지 (2026-08-14 구현 후)

구현하며 하부 유틸의 세 성질을 실측했고, 셋 다 "순서는 우리가 소유한다"의 근거가 됐다.

| 실측 | 대응 |
| --- | --- |
| layer stack이 등록 순서로 최상위를 정해 같은 commit 중첩에서 부모가 위가 된다 | 우리 비교자가 lineage를 먼저 본다. `overlay-store.node.test.ts`가 두 규칙이 갈리는 것을 고정 |
| portal이 `container` falsy에서 `document.body`로 조용히 폴백한다 | host 미해결이면 `null`을 렌더한다. 폴백을 절대 태우지 않는다 |
| FocusScope의 unmount 복원이 비동기다 | mount/unmount autofocus를 둘 다 취소하고 우리가 unmount 전에 동기로 옮긴다 |

반대로 **기하 계산은 그대로 채택했다.** flip·shift·size·autoUpdate를 재작성할 이득이 없고, 결과는
`--louis-overlay-*` 한 블록으로만 새어 나온다.

`deferPointerDownOutside`와 `useDismissableLayerSurface()`는 **쓰지 않았다.** 우리 정책이 이미 지연을
소유하므로 둘을 켜면 같은 일을 두 곳이 하게 된다.

## 재검토 조건

- 상류의 반증 이슈가 해결되고 우리 회귀 테스트가 완제품에서도 통과하면 채택 범위 확대를 재검토한다.
- 하부 유틸의 유지보수가 중단되면 fallback 경로로 전환한다.
- 독립 headless package를 요구하는 실제 consumer가 둘 이상 생기면 내부 primitive의 공개 여부를
  재검토한다(인계서 5절 조건).

## API 확인 (2026-08-14)

설치된 타입 선언을 직접 읽어 다음을 확인했다. 조사 단계에서 "미문서화 내부 API일 가능성"으로 남았던
항목이 해소됐다.

- **`deferPointerDownOutside`는 공개 prop이다.** 문서 주석이 "바깥 `pointerdown`이 해당 상호작용의
  click까지 기다렸다가 dispatch되어, 외부 코드가 이후 이벤트의 전파를 막아 dismiss를 취소할 수
  있게 한다"고 명시한다. Menu의 "item 선택이 outside-dismiss보다 먼저"를 이 prop이 직접 지원한다.
- **`DismissableLayerBranch`와 `useDismissableLayerSurface()`가 존재한다.** 중첩 portal을 같은 내부
  영역으로 등록하는 branch registry가 라이브러리에 이미 있다. 우리가 `branchId` 계약을 그 위에
  얹는다.
- 바깥 상호작용 판정은 `onPointerDownOutside` / `onFocusOutside` / `onInteractOutside`로 분리돼 있고
  각각 `preventDefault()`로 취소 가능하다. 순서 정책을 우리가 소유하기에 충분한 훅이다.

## 미확인

- Dialog의 nested Escape 순서와 scroll lock 복원은 아직 실측하지 않았다. DS-P3-007 착수 전에 검증한다.
- fallback 후보의 저수준 훅이 Server Component 경계를 넘는지(S2)는 S1 통과로 critical path에서
  빠졌다. fallback이 필요해질 때 확인한다.
