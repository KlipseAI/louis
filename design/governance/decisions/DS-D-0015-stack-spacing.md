---
id: decision-stack-spacing
status: experimental
authority: normative
---

# DS-D-0015 표면 안의 세로 간격에 이름을 준다

- Status: proposed
- Date: 2026-08-16
- Owners: repository owner, token maintainer
- Affects: `space-card-text-gap`(breaking rename), Project Card, Empty State, `icon-size-xl`(additive)

## Context

**세로로 쌓이는 블록 사이의 간격을 부를 이름이 없다.** 지금 space 축은 셋이다.

| 계열 | 뜻 | 값 |
| --- | --- | --- |
| `space-control-*` | 컨트롤 **안쪽** 여백 | 4 · 8 · 12 · 16 |
| `space-layout-*` | 레이아웃 여백 | 16 · 24 |
| `space-overlay-*` | overlay 내부 | 2 · 6 |

Project Card를 세울 때 오버레이의 줄 간격(4px)을 부를 이름이 없어 `space-card-text-gap`을 만들었다.
컴포넌트 이름이 토큰에 들어간 유일한 자리이며, [DS-D-0010](DS-D-0010-token-coverage.md)이 막아 둔
component tier를 이름으로 흉내 낸 것이다.

Empty State가 같은 문제를 다시 만든다 — 제품의 두 홈이 합의한 블록 간격은 **12px**인데 그 자리에
쓸 이름이 없다. `space-control-md`가 12px이지만 [dialog.md](../../components/dialog.md)가 "`space-control-*`는
컨트롤 **내부** 스케일이라 표면 여백에 쓰지 않는다"를 이미 규범으로 적어 두었다.

여기서 `space-empty-state-gap`을 또 만들면 컴포넌트마다 자기 간격 토큰을 갖는 길이 열린다.

## Decision

**`space-stack-*` 계열을 세우고 `space-card-text-gap`을 거기로 옮긴다.**

1. `space-stack-xs` = 4px. `space-card-text-gap`을 대체한다.
2. `space-stack-md` = 12px. Empty State의 블록 간격이다.
3. 뜻은 **표면 안에서 세로로 쌓이는 블록 사이**다. 컨트롤 안쪽(`space-control-*`)도 아니고
   레이아웃 여백(`space-layout-*`)도 아니다.
4. 값이 `space-control-*`와 겹치는 것은 문제가 아니다. semantic tier의 목적이 **같은 값에 다른
   뜻을 주는 것**이며, 한쪽이 움직여도 다른 쪽이 따라가지 않게 하는 것이 이 분리의 전부다.

`sm`(8)과 `lg`(16)는 **필요할 때 추가한다.** 지금 소비처가 없는 단계를 미리 만들면 DS-D-0010이
금지한 "소비처 0인 변수"가 된다.

## `icon-size-xl` 64px

같은 변경 단위에서 추가한다. [iconography.md](../../foundations/iconography.md)의 미채택 표가
"64는 **빈 상태 컴포넌트가 생길 때** 사유와 함께 추가한다"고 자리를 예약해 두었고, 그 컴포넌트가
지금 선다. 제품의 캔버스 빈 상태가 64px 글리프를 쓴다.

additive이므로 breaking이 아니다.

## Consequences

- `space-card-text-gap`이 사라지므로 **breaking**이다. DS-GOV-001 절차를 적용한다.
- 소비처는 `project-card.css` 한 줄과 Figma 변수 하나뿐이다. 공개 package는 미발행이고 Figma
  library는 미공개라 바깥 소비자가 없다.
- 컴포넌트 이름이 들어간 토큰이 0이 된다.
- 다음 컴포넌트가 세로 간격을 필요로 할 때 새 토큰을 만들지 않고 이 계열에서 집는다.

## Rollback

`space-stack-xs`를 `space-card-text-gap`으로 되돌리고 `space-stack-md`와 `icon-size-xl`을 지운다.
Project Card의 참조 한 줄과 Figma 변수 이름을 함께 되돌린다.

## Acceptance tests

1. `space-stack-xs` 4px, `space-stack-md` 12px, `icon-size-xl` 64px가 생성된다.
2. `space-card-text-gap`이 더 이상 생성되지 않는다.
3. Project Card 오버레이의 줄 간격이 변경 전후 4px로 같다(브라우저 테스트).
4. `diff-tokens.mjs`가 removal 1건과 additive 3건으로 분류하고, baseline 갱신 후
   `--fail-on-breaking`이 통과한다.
