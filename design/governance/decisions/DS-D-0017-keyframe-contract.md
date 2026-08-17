---
id: decision-keyframe-contract
status: experimental
authority: normative
---

# DS-D-0017 keyframe이 애니메이션하는 property를 게이트가 본다

- Status: proposed
- Date: 2026-08-17
- Owners: repository owner, token maintainer
- Affects: `motionProperties`, `motion-loop`(breaking rename), `motion-shimmer`(additive), motion.md, Toast·Tooltip·Spinner, Skeleton(DS-P3)

## Context

[motion.md](../../foundations/motion.md)는 "**선언되지 않은 property를 component가 임의로
animation하지 않는다**"를 규범으로 두었다. **그것을 검사하는 게이트가 없다.** 검증되는 것은
`motionProperties` 선언의 모양뿐이고(`token-model.mjs`), 저작 CSS의 `@keyframes` 본문은 아무도 읽지
않는다.

그래서 **이미 셋이 어긋나 있었다.**

| keyframe | 실제 애니메이션 | 선언된 property |
| --- | --- | --- |
| `kds-toast-enter` | `opacity`, **`translate`** | `opacity`, `transform` |
| `kds-tooltip-enter` | `opacity`, **`scale`** | `opacity`, `transform` |
| `kds-spin` | `rotate` | (연결이 없어 검사 대상이 아니었다) |

`translate`·`scale`은 `transform`의 **개별 속성**이며 CSS에서 별개 property다. 선언과 실제가 처음부터
달랐고 아무도 몰랐다.

**Skeleton이 이 구멍을 그대로 밟을 참이었다.** 제품의 자리표시 32벌 중 면 계열 19벌의 우세 기법은
`background-position` 이동(12벌)인데, loop의 허용 property는 `opacity`·`rotate` 둘뿐이다. 그대로
지으면 **게이트는 전부 초록인 채로 규범을 위반한다** — Badge의 죽은 축이 게이트를 통과했던 것과 같은
구조다.

## `motion-loop`는 이름이 너무 넓었다

[DS-D-0016](DS-D-0016-loop-motion.md)이 700ms·linear를 **회전 22벌만 보고** 정했고 그 문서가 스스로
그렇게 적었다. 자리표시 19벌의 실측은 다르다.

| 축 | 회전 | 자리표시 |
| --- | --- | --- |
| 주기 | 700ms (22벌 중 10) | **1.6s** (19벌 중 12). 700ms는 **하나도 없다** |
| easing | `linear` (22/22 전수 일치) | 가감속 14 · 등속 5 |

motion.md의 "**easing은 등속이다**"도 근거가 "가감속이 붙으면 회전이 맥박처럼 뛴다"였다 —
**회전에만 성립하는 논거**를 loop 전체로 일반화한 것이다.

## Decision

**하나, keyframe 본문을 게이트가 읽는다.**

저작 CSS의 모든 `@keyframes`를 파싱해 애니메이션되는 property를 모으고, 그 keyframe을 참조하는
규칙이 쓰는 `motion-*` 토큰의 선언 집합 안에 있는지 대조한다. 파일이 달라도 따라간다 —
`kds-spin`은 `base.css`에 있고 소비처는 컴포넌트 셋이다.

**motion 토큰과 연결되지 않은 keyframe도 실패다.** 그것이 `1s linear` 리터럴이 게이트 밖에 있던
방식이다.

**둘, 허용 property를 실제에 맞춘다.**

- enter/exit — `opacity`, `transform`, **`translate`**, **`scale`**, **`rotate`**.
  개별 속성을 더한다. 이미 쓰고 있었고, 합성된다는 점에서 shorthand보다 낫다.
- loop — `opacity`, `rotate`, **`background-position`**.
  `background-position`은 합성 축이 아니므로 DS-D-0016의 "transform 축을 통째로 잡지 않는다"는
  논거와 충돌하지 않는다. `translate`는 넣지 않는다 — 자리표시의 우세 기법이 아니다.

**셋, `motion-loop`를 `motion-spin`으로 바꾸고 `motion-shimmer`를 세운다.**

| 토큰 | 값 | 쓰는 곳 |
| --- | --- | --- |
| `motion-spin` | 700ms · `linear` | 회전 |
| `motion-shimmer` | 1.6s · `easing-standard` | 자리표시 |

`motion-shimmer`의 easing이 제품의 `cubic-bezier(0.4, 0, 0.2, 1)`이 아니라 `easing-standard`인
이유는 제품의 자리표시 easing이 9/5/5로 갈려 **정본이 없기** 때문이다. 근사한 곡선을 새로 세우기보다
이미 있는 표준 곡선을 쓴다.

**넷, motion.md의 등속 규칙을 회전에 한정한다.**

## Consequences

- `motion-loop`가 사라지므로 **breaking**이다. DS-GOV-001 절차를 적용한다. 소비처는 Button·Menu·
  Spinner 셋과 Figma 변수 하나뿐이다.
- 새 게이트가 셋을 즉시 잡는다 — Toast·Tooltip의 선언 불일치와, motion 토큰에 연결되지 않은
  keyframe. 앞의 둘은 허용 property를 넓혀 해소되고, `kds-spin`은 이미 `motion-spin`을 가리킨다.
- Skeleton이 제품의 우세 기법을 그대로 쓸 수 있게 된다.
- 앞으로 keyframe을 추가할 때 motion 토큰과의 연결이 강제된다.

## Rollback

게이트와 canary를 지우고, 허용 property를 되돌리고, `motion-spin`을 `motion-loop`로 되돌린 뒤
`motion-shimmer`와 `transition.shimmer`를 지운다. motion.md의 두 문단을 되돌린다.

## Acceptance tests

1. `@keyframes`가 선언되지 않은 property를 애니메이션하면 게이트가 실패한다(canary).
2. motion 토큰에 연결되지 않은 `@keyframes`가 있으면 게이트가 실패한다(canary).
3. 파일이 다른 keyframe과 소비처를 게이트가 이어서 본다 — `kds-spin`이 통과한다.
4. `motion-spin`이 700ms·linear, `motion-shimmer`가 1600ms·`easing-standard`로 생성된다.
5. `motion-loop`가 더 이상 생성되지 않는다.
6. loop lifecycle에서 `background-position`이 허용되고 `transform`은 여전히 거부된다.
