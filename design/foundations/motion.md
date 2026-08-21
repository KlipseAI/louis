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

## Easing 원본

primitive의 `timingFunction`은 제품이 선언한 커브 둘에서 왔다. Figma로 옮기는 사람이 커브를 새로
고르지 않도록 원본을 여기 적는다(`globals.css:15-18`).

| 제품 변수 | 값 | 이 커브를 받는 primitive |
| --- | --- | --- |
| `--ease-out-strong` | `cubic-bezier(0.32, 0.72, 0, 1)` | `overlay-enter` · `menu-enter` · `modal-enter` |
| `--ease-in-out-strong` | `cubic-bezier(0.77, 0, 0.175, 1)` | 없다. 제품은 화면 안 이동(슬라이드·모프)에만 쓴다 |

- **enter 커브를 뒤집어 exit를 만들지 않는다.** exit primitive는 감속이 아니라 가속이다 —
  `overlay-exit`와 `modal-exit`는 `cubic-bezier(0.4, 0, 1, 1)`, `menu-exit`는
  `cubic-bezier(0.42, 0, 1, 1)`이다. Figma에서 exit를 enter의 역재생으로 그리면 KDS와 갈린다.
- **enter와 exit는 duration도 대칭이 아니다.** `menu-enter` 260ms ↔ `menu-exit` 130ms,
  `overlay-enter` 200ms ↔ `overlay-exit` 120ms, `modal-enter` 320ms ↔ `modal-exit` 200ms이다.
  한 lifecycle을 하나의 duration으로 접으면 닫힘이 느려져 화면이 굼떠 보인다.

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

## Known deviations

배포본 a9ead58b의 제품 구현이 위 규범과 갈리는 자리다. 채택했다는 뜻이 아니다 — 채택 여부는
`migration/product.measured.json`이 소유한다.

- **제품은 팝오버 닫힘 커브가 표면마다 다르다.** 노드 메타 드롭다운과 애널리틱스 더보기 메뉴는
  닫힘도 열림과 같은 `--ease-out-strong`으로 통일하고 주석에 「ease-in 금지」를 명시한다
  (`MetaDropdownPanel.tsx:41-57`, `AnalyticsAccountMoreMenu.tsx:35-51`). 아카이브 드롭다운만
  닫힘을 `130ms ease-in`으로 둔다(`appHomeSceneStyles.ts:78`). **한 표면을 보고 「제품은 이렇다」로
  일반화하면 다른 표면에서 틀린다.**
- **아카이브 드롭다운은 열림에서 opacity 전이가 사라진다.** 열림 규칙이 transition shorthand를
  `transform 260ms`로 통째 교체해 opacity가 즉시 불투명해진다(`appHomeSceneStyles.ts:119`). 다른 두
  표면은 `opacity 200ms` + `transform 260ms`로 채널을 나눈다. 셋을 한 recipe로 그리면 하나는 틀린다.
- **제품 모달은 한 recipe가 아니라 채널 셋이다.** `GlassConfirmModal`은 카드에
  `transform 320ms cubic-bezier(0.22, 1, 0.36, 1)` · `opacity 220ms ease` · `filter 320ms ease`를 따로
  걸고(`GlassConfirmModal.tsx:61-65`), 스크림은 `background 260ms cubic-bezier(0.22, 1, 0.36, 1)`으로
  palette gray-900 알파 `0%` → `50%`를 덮는다(`:42-49`). 카드 시작값은
  `translate3d(0, 16px, 0) scale(0.96, 0.96)` · `saturate(88%) blur(1px)`, 끝값은
  `translate3d(0, 0, 0) scale(1)` · `saturate(100%) blur(0)`이다(`:67-77`). **`modal-enter` 하나로
  접으면 카드가 균질하게 떠올라 제품과 갈린다** — 세 채널이 서로 다른 시각에 끝나는 것이 이 모션의
  성격이다.
- **오프셋과 scale은 클래스가 아니라 인라인 변수가 정한다.** 실제 값은 `translate-y 16px` ·
  `scale 0.96 / 0.96`이며(`GlassConfirmModal.tsx:122-127`) 클래스에 적힌 fallback `0.24` · `0.16`
  (`:69`)은 항상 덮여 닿지 않는다. **클래스만 읽고 0.24로 그리면 틀린다.**
- **`filter`는 어떤 recipe의 허용 property에도 없고, 스크림의 `background`도 modal recipe에는 없다.**
  `modal-enter`·`modal-exit`가 허용하는 property는 `opacity`·`translate`·`scale` 셋뿐이다
  (`background-color`는 `layout-change`와 `control-hover`만 갖는다). 위 Token model이 선언되지 않은
  property를 component가 임의로 animation하지 않는다고 못박으므로, 제품 모달의 saturate·blur 전이와
  스크림 배경 전이는 현재 token model이 재현 대상으로 삼지 않는 채널이다. Figma proposal로도
  넘어가지 않는다.
- **제품 모달의 unmount timer가 시각 transition보다 짧다.** `CLOSE_MS = 280`인데 카드의 최장 전환은
  320ms다(`GlassConfirmModal.tsx:32`, `:63`, `:188-191`) — 퇴장의 마지막 40ms가 잘린다. 위 Token
  model의 「unmount timer와 interaction lock은 시각 transition과 같은 resolved recipe를 읽는다」가
  금지하는 형태 그대로다.
- reduced motion은 양쪽 다 제품이 선언한다. 팝오버는 `transform:none` + `transition: opacity 120ms ease`
  (`MetaDropdownPanel.tsx:36-39`), 모달은 스크림·카드 모두 `transition:none`
  (`GlassConfirmModal.tsx:45`, `:64`)이다.

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
