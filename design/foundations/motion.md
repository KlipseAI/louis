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
- Klipse `motionProperties` extension은 enter/exit lifecycle마다 duration, easing과 함께 허용 CSS property를
  선언한다. 선언되지 않은 property를 component가 임의로 animation하지 않는다.
- unmount timer와 interaction lock은 시각 transition과 같은 resolved recipe를 읽는다.
- loading처럼 지속 시간이 작업 완료에 달린 상태를 고정 animation duration으로 가장하지 않는다.

## Reduced motion

- semantic recipe마다 `reduce` mode 또는 명시적인 대체가 있어야 한다.
- 위치·크기·scale 기반 비필수 motion은 제거하거나 짧은 opacity/state change로 대체한다.
- motion을 제거해도 open/closed, loading, success, error 의미가 텍스트와 상태로 남아야 한다.
- reduced-motion에서도 focus 이동, scroll lock, inert와 unmount 순서는 동일하다.

## Platform mapping

- CSS는 duration/easing custom property와 semantic recipe metadata를 생성한다.
- JavaScript는 resolved transition 값과 motion metadata를 제공하고 TypeScript declaration은 token별
  transition value shape, ID·mode·alias target과 runtime container를 선언한다. 실제 animation completion과
  unmount lifecycle 연결은 P3/P5 소비 구현이 소유한다.
- Figma proposal은 지원 가능한 easing/duration을 매핑하고 spring·복합 keyframe처럼 손실되는 정보는
  metadata로 표시한다.
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
