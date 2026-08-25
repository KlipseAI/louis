---
id: decision-loop-motion
status: experimental
authority: normative
---

# DS-D-0016 무한 반복 motion에 lifecycle을 준다

- Status: proposed
- Date: 2026-08-17
- Owners: repository owner, token maintainer
- Affects: `motion.md`, `motionProperties` schema, `motion-loop`(additive), Button·Menu spinner, Spinner(DS-P3)

## Context

**규범이 무한 반복을 다루지 않는다.** [motion.md](../../foundations/motion.md)의 Token model은 소유
목적을 `overlay-enter` / `overlay-exit` / `modal-enter` / `modal-exit` / `layout-change`로 한정한다.
무한이 등장하는 유일한 문장은 아직 `not-ready`인 P3/P5 게이트의 "reduced-motion에서 무한 shimmer가
제거된다" 하나다.

그래서 **이미 있는 회전 둘이 게이트 밖에 있다.**

| 자리 | 지금 상태 |
| --- | --- |
| `button.css` spinner | `animation: louis-button-spin 1s linear infinite` — duration과 easing이 리터럴 |
| `menu-popover.css` spinner | 같음 |
| 두 keyframe | `rotate: 360deg`를 애니메이션하는데 `rotate`는 허용 property가 아니다 |

제품도 같은 상태다 — 회전 keyframe **14개**(전부 `app/keyframes.css`)를 **18건**의 `animation`
선언이 참조하는데 본문은 전부 `to { transform: rotate(360deg) }` 한 종류다. 주기는 **700ms가
우세하고(11회 / 18건)** DS의 `1s`는 제품 어디와도 일치하지 않는다(실사용은 700·800·640·880ms).

> **수치 정정(2026-08-21).** 원래 「회전 정의 22벌, keyframe 이름 18개, 700ms 10회」라고 적었다.
> 다시 세니 **이름 14개 · 선언 18건 · 700ms 11회**다 — 두 범주(이름과 선언)가 뒤바뀌어 있었다.
> **결론은 그대로다.** 700ms가 우세하고 DS의 `1s`는 어디와도 안 맞는다.

Spinner 컴포넌트를 세우려면 이 셋이 먼저 풀려야 한다.

1. 규범에 loop lifecycle이 없다.
2. `token-model.mjs`가 semantic `transition` 토큰 **전량**에 reduced-motion 짝을 강제한다. loop의
   reduced 짝은 "더 짧은 duration"이 아니라 **제거**이므로 `0ms + infinite`라는 성립하지 않는 값을
   만들게 된다.
3. `allowedMotionProperties`가 `opacity`·`transform` 둘뿐이라 `rotate`를 선언할 수 없다.

## Decision

**`loop`를 세 번째 lifecycle로 세운다.** enter·exit와 나란한 축이며 규칙이 다르다.

1. `motionProperties` 항목에 **선택적 `lifecycle` 필드**를 둔다 — `"enter" | "exit" | "loop"`.
   생략하면 `enter`나 `exit`로 간주한다(기존 항목은 그대로 통과한다).
2. **loop는 `reducedMotionPairs`의 대상이 아니다.** reduced-motion에서 loop는 짧아지는 것이 아니라
   **사라진다.** 그 사실은 duration 토큰이 아니라 규범과 컴포넌트가 소유한다.
3. loop의 허용 property는 `rotate`와 `opacity`다. `transform`은 넣지 않는다 — 개별 속성 `rotate`가
   `scale`·`translate`와 합성되므로 회전 하나 때문에 transform 전체를 잡지 않는다.
4. `motion-loop` semantic recipe를 세운다. **700ms · linear**다.
   - 700ms는 제품의 우세값이다(22벌 중 10벌).
   - `linear`는 제품 22벌이 **전수 일치하는 유일한 축**이다. 등속이 아니면 회전이 맥박처럼 뛴다.
   - primitive에 `linear` easing이 없어 함께 추가한다(`cubic-bezier(0, 0, 1, 1)`).

## 왜 duration을 토큰으로 두는가

"loading처럼 지속 시간이 작업 완료에 달린 상태를 고정 animation duration으로 가장하지 않는다"는
기존 문장(motion.md)과 충돌하지 않는다. 그 문장이 금지하는 것은 **진행률을 시간으로 위장하는
것**이다. loop의 duration은 진행률이 아니라 **한 바퀴의 주기**이며, 얼마나 남았는지에 대해 아무것도
말하지 않는다. 규범에 그 구분을 명시한다.

## Consequences

- Button과 Menu의 spinner가 `1s` → **700ms**로 바뀐다. 화면이 조금 빨라진다. 제품과 일치한다.
- 두 spinner의 `linear` 리터럴이 토큰 참조가 된다.
- `motionProperties`에 loop 항목이 생겨 `rotate`가 **선언된** property가 된다. 지금은 선언 없이
  애니메이션되고 있다.
- `reducedMotionPairs` 검사가 loop를 건너뛴다. 그 대신 loop를 쓰는 컴포넌트는 reduced-motion에서
  회전을 멈추고 의미를 `aria-busy`나 텍스트로 남긴다 — 기존 두 spinner가 이미 그렇게 하고 있으며
  규범이 그것을 요구 사항으로 승격한다.
- schema 확장은 **additive**다. `lifecycle`이 없는 기존 항목이 그대로 통과한다.

## Rollback

`motion-loop`와 `linear` primitive를 지우고, `motionProperties`의 loop 항목과 `lifecycle` 필드
처리를 빼고, 두 spinner의 `1s linear`를 되돌린다. motion.md의 loop 절을 지운다.

## Acceptance tests

1. `motion-loop`가 `700ms cubic-bezier(0, 0, 1, 1)`로 생성된다.
2. `reducedMotionPairs`에 `motion-loop`가 없어도 게이트가 통과한다.
3. `lifecycle: "loop"` 항목이 `rotate`를 허용하고, `enter`/`exit` 항목은 여전히 거부한다.
4. Button spinner의 계산된 `animation-duration`이 700ms이고 `animation-timing-function`이
   `linear`다(브라우저 테스트).
5. reduced-motion context에서 두 spinner의 `animation-iteration-count`가 `1`이다.
