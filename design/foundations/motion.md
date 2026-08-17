---
id: foundation-motion
status: experimental
authority: normative
---

# Motion

Motion은 장식 효과가 아니라 상태 전환, 공간 변화와 lifecycle 완료 시점을 설명한다. P2의 duration/easing
원본, semantic motion recipe, reduced-motion 대체와 platform projection은 로컬 release-candidate다. 실제
component animation과 public adoption은 P3 이후가 소유한다.

## Source and artifacts

| 구분           | 계약 경로                                     | 현재 상태               |
| -------------- | --------------------------------------------- | ----------------------- |
| DTCG source    | `packages/tokens/src/klipse.tokens.json`      | local release-candidate |
| Validator      | `scripts/lib/token-model.mjs`                 | local release-candidate |
| CSS            | `packages/tokens/generated/tokens.css`        | done projection         |
| JavaScript     | `packages/tokens/generated/index.js`          | done projection         |
| TypeScript     | `packages/tokens/generated/index.d.ts`        | done projection         |
| Resolved JSON  | `packages/tokens/generated/tokens.json`       | done projection         |
| Figma proposal | `packages/tokens/generated/figma.tokens.json` | done, not published     |
| Manifest       | `packages/tokens/generated/manifest.json`     | done projection         |
| Diff baseline  | `packages/tokens/baseline/manifest.json`      | local release-candidate |

Motion primitive와 semantic recipe는 단일 DTCG source 안의 논리적 계층이며 별도 정본 파일이 아니다.

## Token model

- primitive는 duration과 easing 재료를 소유한다.
- semantic recipe는 overlay-enter, overlay-exit, modal-enter, modal-exit, layout-change처럼 목적을 소유한다.
- Klipse `motionProperties` extension은 lifecycle마다 duration, easing과 함께 허용 CSS property를
  선언한다. 선언되지 않은 property를 component가 임의로 animation하지 않는다.
- lifecycle은 셋이다 — `enter`, `exit`, **`loop`**. 항목에 `lifecycle`이 없으면 enter/exit로 본다.
- unmount timer와 interaction lock은 시각 transition과 같은 resolved recipe를 읽는다.
- loading처럼 지속 시간이 작업 완료에 달린 상태를 고정 animation duration으로 가장하지 않는다.

## Loop

무한히 반복하는 motion이다. spinner의 회전, shimmer의 쓸림이 여기 속한다.
[DS-D-0016](../governance/decisions/DS-D-0016-loop-motion.md)이 이 절을 세웠다.

- **loop는 진행률을 말하지 않는다.** 한 바퀴의 주기일 뿐이며 얼마나 남았는지에 대해 아무것도
  전하지 않는다. 위의 "지속 시간을 가장하지 않는다"와 충돌하지 않는 이유가 이것이다 — 그 문장이
  금지하는 것은 진행률을 시간으로 위장하는 것이고, 주기는 진행률이 아니다.
  진행률을 아는 작업에는 loop가 아니라 determinate 표시를 쓴다.
- **회전의 easing은 등속이다.** 가감속이 붙으면 회전이 맥박처럼 뛰어 "무언가 일어나는 중"이 아니라
  "무언가 잘못됨"으로 읽힌다. `motion-spin`이 그 recipe를 소유한다. **이 규칙은 회전에만 적용된다**
  — 자리표시의 쓸림에는 가감속이 맞으며 제품도 그렇게 쓴다([DS-D-0017](../governance/decisions/DS-D-0017-keyframe-contract.md)).
- loop recipe는 둘이다. `motion-spin`(700ms · 등속)과 `motion-shimmer`(1.6s · standard).
- 허용 property는 `opacity`·`rotate`·`background-position`이다. `transform` 전체를 넣지 않는 이유는
  개별 속성이 `scale`·`translate`와 합성되기 때문이다 — 회전 하나 때문에 transform 축을 통째로
  잡지 않는다. `background-position`은 합성 축이 아니라 같은 논거에 걸리지 않는다.
- **`@keyframes` 본문이 애니메이션하는 property를 게이트가 읽는다.** 선언과 실제가 어긋나면
  빌드가 실패한다. motion 토큰에 연결되지 않은 keyframe도 실패다.
- **loop는 `reducedMotionPairs`의 대상이 아니다.** 아래 Reduced motion을 본다.

## Reduced motion

- enter/exit semantic recipe마다 `reduce` mode 또는 명시적인 대체가 있어야 한다.
- **loop는 짧아지지 않고 사라진다.** `0ms`짜리 애니메이션을 무한 반복하는 것은 성립하지 않으므로
  reduce 짝을 두지 않는다. 대신 loop를 쓰는 component는 `animation-iteration-count: 1`로 회전을
  멈추고, **진행 중이라는 의미를 `aria-busy`나 텍스트로 남긴다.** 그것이 loop의 reduce 대체다.
- 위치·크기·scale 기반 비필수 motion은 제거하거나 짧은 opacity/state change로 대체한다.
- motion을 제거해도 open/closed, loading, success, error 의미가 텍스트와 상태로 남아야 한다.
- reduced-motion에서도 focus 이동, scroll lock, inert와 unmount 순서는 동일하다.

## Platform mapping

- CSS는 duration/easing custom property와 semantic recipe metadata를 생성한다.
- JavaScript는 resolved transition 값과 motion metadata를 제공하고 TypeScript declaration은 token별
  transition value shape, ID·mode·alias target과 runtime container를 선언한다. 실제 animation completion과
  unmount lifecycle 연결은 P3/P5 소비 구현이 소유한다.
- Figma proposal은 지원 가능한 easing/duration을 매핑하고 spring·복합 keyframe처럼 손실되는 정보는
  metadata로 표시한다. semantic `motion-*`는 Figma가 해석하지 않는 문서용 STRING 변수로 격하하고
  primitive `transition-*`와 easing은 미표현으로 둔다
  ([DS-D-0007](../governance/decisions/DS-D-0007-figma-library-structure.md)).
- duration 또는 easing 변경은 사용자 동작·lifecycle에 영향을 주면 behavior change로 분류한다.

## Acceptance tests

P2 local RC는 아래의 구조·생성 검사를 자동화한다.

- schema가 음수 duration, 알 수 없는 easing, 누락된 reduced-motion 대체를 거부한다.
- 모든 semantic recipe가 duration, easing, property와 reduce 결과로 resolve된다.
- `motionProperties`가 알려진 lifecycle만 참조하고 `opacity`, `transform` 등 validator가 허용한 CSS
  property만 포함한다.
- CSS의 semantic transition output과 JS·JSON·Figma proposal·manifest의 primitive/semantic transition
  graph가 normalized model과 일치하고 TypeScript가 해당 ID/type/value shape를 선언한다. Lossy mapping은
  Figma proposal에 명시된다.
- 같은 process에서 동일 source를 반복 render한 결과가 byte-for-byte 동일하다.

다음은 P3/P5 소비 구현 게이트이며 아직 `not-ready`다.

- Dialog/Popover exit 완료와 unmount 시점이 같은 source를 사용한다.
- `prefers-reduced-motion: reduce`에서 비필수 transform과 무한 shimmer가 제거된다.
- loop를 쓰는 component가 reduce에서 회전을 멈추고 `aria-busy` 또는 텍스트로 진행을 남긴다.
