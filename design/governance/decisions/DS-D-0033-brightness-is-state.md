---
id: decision-brightness-is-state
status: experimental
authority: normative
---

# DS-D-0033 가운데 놓인 인디케이터는 폭이 아니라 밝기로 상태를 말한다

- Status: accepted
- Date: 2026-08-31
- Owners: repository owner
- Affects: `.louis-banner-carousel__dot`, `color-media-indicator-rest`,
  [DS-D-0019](DS-D-0019-layout-change-motion.md)의 배너 적용분

## Context

배너 캐러셀의 인디케이터는 폭으로 상태를 말했다. 7px 점이 활성일 때 20px로 늘어나고, 그 전환에
`motion-layout-change`(220ms)를 쓰라고 [DS-D-0019](DS-D-0019-layout-change-motion.md)가 넷째
lifecycle을 열었다. 근거는 「점에는 라벨이 없어 폭 말고 현재 위치를 말하는 것이 없다」였다.

그 근거는 **컨트롤이 우하단 알약 안에 있을 때** 성립했다. 알약은 오른쪽 끝에 고정돼 있고, 안에서
칸 하나가 13px 늘어나면 그만큼 왼쪽으로 자란다 — 알약의 오른쪽 변은 움직이지 않으므로 화면에서는
아무것도 흔들리지 않는다.

2026-08-31 배너가 가운데 정렬로 바뀌며 컨트롤도 **하단 가운데**로 옮겼다. 가운데 정렬은 폭이
바뀌면 **양쪽이 동시에 움직인다.** 세 칸 중 어느 칸이 활성이냐에 따라 묶음 전체 폭이 13px
달라지고, 그 절반인 6.5px씩 좌우로 번갈아 밀린다. 자동 넘김이 5.5초마다 도는 화면에서 그것은
가만히 있어야 할 것이 계속 움직이는 것으로 보인다.

되튜닝하며 실측한 시안(Figma page 14, 아카이브 배너)이 이미 답을 갖고 있었다. 세 칸의 폭이
30px로 같고, 활성 칸만 흰색 100%이며 나머지는 비친다.

## Decision

### 1. 가운데 정렬된 인디케이터는 밝기가 상태다

폭을 고정하고 `background-color`로 상태를 말한다. 활성은 `color-media-indicator-active`(불투명),
쉬는 칸은 `color-media-indicator-rest`(알파 28%)다. 전환은 색만 바뀌므로 layout-change가 아니라
`motion-control-hover`(160ms)를 쓴다.

### 2. DS-D-0019는 폐기되지 않는다 — 적용 범위가 좁아진다

`layout-change` lifecycle 자체는 유효하다. 크기가 실제로 상태인 컨트롤(사이드바 접힘, tabs의
지시선)이 계속 쓴다. **배너 인디케이터가 그 목록에서 빠지는 것**이 이 Decision의 전부다.

### 3. 보조기술 계약은 그대로다

폭도 밝기도 보조기술은 읽지 않는다. `aria-selected`와 `aria-current`가 상태를 갖는 계약은
바뀌지 않는다 — 시각과 의미가 각자 자기 축으로 말한다.

### 4. 2px 막대는 탭 타깃을 따로 갖는다

막대의 두께가 2px이면 **보이는 것이 곧 누를 수 있는 것이 아니다.** `::before`로 위아래 8px씩
넓혀 18px 타깃을 만든다. 레이아웃 기하는 건드리지 않는다. 이 조항이 없으면 폭 고정이 접근성
후퇴가 된다 — 옛 7px 점도 좁았지만 2px는 그보다 더 좁다.

## Consequences

- `color-media-indicator-rest`가 `static-white-alpha.48`에서 `.28`로 내려간다. 이 토큰의
  소비처는 배너 인디케이터 하나뿐이라 다른 화면에 영향이 없다.
- 시안의 30%와 2pp 어긋난다. 알파 사다리에 30이 없고 가장 가까운 칸이 28이다
  ([DS-D-0026](DS-D-0026-alpha-scale.md)). 2px 막대에서 그 차이는 보이지 않으며, 사다리를 벗어나
  새 원시값을 내는 것이 더 큰 비용이다.
- 인디케이터의 `transition`에서 `inline-size`가 빠진다. reduced-motion 블록은 그대로 유효하다.
- `banner-carousel.md`의 「폭이 상태다」 절이 「밝기가 상태다」로 바뀌고, acceptance test 1과 8이
  같이 바뀐다.

## Alternatives considered

**폭을 유지하고 컨트롤만 가운데로.** 흔들림이 그대로 남는다. 가운데 정렬이 밀림을 드러내는
것이지 만드는 것이 아니므로, 배치를 되돌리지 않는 한 해결되지 않는다.

**활성 칸만 늘리되 묶음 폭을 고정(빈 자리 예약).** 흔들림은 없어지지만 칸 사이 간격이 상태에
따라 달라진다 — 흔들림을 다른 흔들림으로 바꾸는 것이고, 시안과도 다르다.

**시안의 30%를 그대로 쓰려고 원시값 `static-white-alpha.30`을 연다.** 사다리는 4 간격으로
28·32를 이미 갖고 있다. 한 소비처의 2pp를 위해 칸을 늘리면 사다리가 「필요할 때마다 늘어나는
것」이 되어 [DS-D-0026](DS-D-0026-alpha-scale.md)이 무의미해진다.
