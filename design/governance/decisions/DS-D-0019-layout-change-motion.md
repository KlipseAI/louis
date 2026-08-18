---
id: decision-layout-change-motion
status: experimental
authority: normative
---

# DS-D-0019 크기가 상태인 컨트롤을 위해 layout-change lifecycle을 연다

- Status: proposed
- Date: 2026-08-18
- Owners: repository owner, token maintainer
- Affects: `MOTION_LIFECYCLES`, `allowedMotionPropertiesByLifecycle`, `motion-layout-change`,
  `motion-control-hover`, motion.md, BannerCarousel, SegmentedControl

## Context

[DS-D-0016](DS-D-0016-loop-motion.md)이 lifecycle마다 허용 property를 정했다. `enter`/`exit`은
`opacity`·`transform`·`translate`·`scale`·`rotate`, `loop`은 `opacity`·`rotate`·`background-position`이다.
**레이아웃을 다시 계산시키는 property는 어디에도 없다.**

그래서 다음 둘이 막혔다.

1. **SegmentedControl** — 선택 표식이 세그먼트 폭을 따라간다. 미결로 남겼다.
2. **BannerCarousel** — 배포본(`KlipseAI/klipse-web` `origin/main` 7e9c3b69)의 점이 비활성 **7px**에서
   활성 **20px**로 늘어난다(`TabBannerCarousel.tsx`의 `DOT_REST`/`DOT_ACTIVE`, `w-10` × `--spacing: 2px`).
   전환은 `width 220ms cubic-bezier(0.4, 0, 0.2, 1)`이고 배경은 `160ms ease`다.

**그 폭이 곧 "여기가 지금 몇 번째인가"다.** 점은 라벨이 없으므로 폭 말고 현재 위치를 말하는 것이
없다.

## Decision

`layout-change` lifecycle을 연다. 허용 property는 **`inline-size` · `block-size` ·
`background-color`** 셋이다.

1. `enter`/`exit`과 섞지 않는다. 저 둘은 요소가 **나타나고 사라질 때**를 뜻하고, 이것은 요소가
   그대로 있으면서 **자기 크기로 상태를 말할 때**다.
2. `transform`을 쓰지 않는 이유를 명시한다. `scale`로 알약을 늘리면 **두께와 반경까지 함께
   늘어나** 7px 알약이 20px 자리에서 찌그러진다. 제품도 `width`를 쓴다.
3. `background-color`를 함께 넣는 이유 — 점과 화살표는 폭이 변할 때 **동시에** 색이 변한다.
   둘을 다른 lifecycle로 가르면 한 동작이 두 규범으로 쪼개진다.
4. `reducedMotionPairs`에 반드시 짝을 둔다. 레이아웃 재계산은 가장 비싼 애니메이션이므로
   reduced-motion에서 제일 먼저 꺼져야 한다.

## Consequences

- **레이아웃 재계산이 규범 안으로 들어온다.** 이 lifecycle을 쓰는 컴포넌트는 acceptance test에서
  reduced-motion 경로를 반드시 증명해야 한다.
- 남용 위험이 있다. `inline-size`는 "가로 크기가 상태"일 때만이고, 단순히 열리고 닫히는 패널은
  `enter`/`exit`이다. 규범 문서에 그 경계를 적는다.
- `height`(`block-size`)를 함께 연 것은 세로로 자라는 표식을 위한 것이며 **현재 소비처가 없다.**
  이 저장소의 규칙대로 소비처 없는 값은 승격하지 않으므로, 다음 재검토에서 소비처가 생기지
  않았으면 `block-size`를 뺀다.

## Rollback

`MOTION_LIFECYCLES`에서 `layout-change`를 지우고 `allowedMotionPropertiesByLifecycle`의 항목을
지운다. `motion-layout-change`·`motion-control-hover` 두 토큰과 그 소비처(BannerCarousel의 점과
컨트롤)를 함께 되돌린다. 되돌리면 점은 폭 대신 **색만으로** 현재 위치를 말하게 되며, 그것이
접근성 기준에 미달하는지는 별도 판정이 필요하다.
