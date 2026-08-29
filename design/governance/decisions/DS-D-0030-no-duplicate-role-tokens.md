---
id: decision-no-duplicate-role-tokens
status: experimental
authority: normative
---

# DS-D-0030 같은 역할을 두 이름으로 말하지 않는다

- Status: accepted
- Date: 2026-08-29
- Owners: repository owner
- Affects: `semantic.global.app.{gnb-main-inline-padding, gnb-sidebar-padding-x,
  tooltip-font-size, tooltip-padding-block, tooltip-padding-inline, tooltip-radius}` ·
  `semantic.global.dropdown.*` 전체, Figma 변수 9개

## Context

[DS-D-0024](DS-D-0024-color-architecture.md) 뒤 커밋 `8de65bb`(「제품 티어 토큰 160개를 LOUIS 가
소유한다」)가 제품 전용 값을 통째로 들여왔다. 목적은 옳았다 — 「제품에만 있고 시스템엔 정의 안 된
디자인이 없게」. 그러나 들여오면서 **이미 시스템에 있던 역할 토큰과 겹치는 것을 걸러내지 못했다.**

겹침은 값이 같다는 것이 아니라 **같은 역할을 두 이름이 말한다**는 것이다. 값이 같아도 역할이
다르면 중복이 아니라는 것은 이 저장소가 이미 세운 규칙이고
([Spacing & Radius](../../foundations/spacing-radius.md) 「Radius model」), 이 결정은 그 규칙을
뒤집지 않는다. 아래 아홉은 역할까지 같다.

무엇이 겹쳤는지는 **제품이 실제로 어느 쪽을 집는지**가 드러내 주었다. 2026-08-29 제품
저장소가 자기 레거시 토큰 문서를 폐지하는 작업에서 토큰을 LOUIS 로 넘기면서, 여섯 축에서 **미러가 아니라 역할 토큰을 골랐다.** 고른 이유는 취향이 아니라
`styles.layer.css` 의 실물이 읽는 쪽이 그것이기 때문이다.

| 제품이 넘긴 토큰 | 집은 정본 | 남은 미러 |
| --- | --- | --- |
| `--app-gnb-main-inline-padding` | `layout-app-shell-content-inset` | `app/gnb-main-inline-padding` |
| `--app-gnb-sidebar-padding-x` | `layout-app-shell-sidebar-padding` | `app/gnb-sidebar-padding-x` |
| `--app-tooltip-padding-block` | `space-control-xs` | `app/tooltip-padding-block` |
| `--app-tooltip-padding-inline` | `space-control-sm` | `app/tooltip-padding-inline` |
| `--app-tooltip-radius` | `radius-control-sm` | `app/tooltip-radius` |

앞의 둘은 [`migration/token-mapping.md`](../../../migration/token-mapping.md) 의 **확정 표**가
이미 그 매핑을 판정해 두었고, [DS-D-0018](DS-D-0018-app-shell-geometry.md) 이 같은 축의 정본을
`layout-app-shell-*` 로 못 박았다. 뒤의 셋은 `.louis-tooltip` 레시피가
`packages/css/src/component/tooltip.css` 에서 읽는 손잡이 그대로다.

## Decision

### 아홉을 지운다

**`app/*` 여섯**

| 토큰 | 정본 | 사유 |
| --- | --- | --- |
| `gnb-main-inline-padding` | `layout-app-shell-content-inset` | 확정 표 + DS-D-0018 |
| `gnb-sidebar-padding-x` | `layout-app-shell-sidebar-padding` | 〃 |
| `tooltip-padding-block` | `space-control-xs` | `.louis-tooltip` 이 읽는 손잡이 |
| `tooltip-padding-inline` | `space-control-sm` | 〃 |
| `tooltip-radius` | `radius-control-sm` | 〃 |
| `tooltip-font-size` | `typography-caption-regular-font-size` | 툴팁 타이포는 composite 가 소유한다 |

**`dropdown/*` 셋 — 그룹 전체**

| 토큰 | 정본 |
| --- | --- |
| `radius` | `radius-overlay` |
| `item-radius` | `radius-overlay-item` |
| `padding` | `space-overlay-inset` |

`.louis-menu` 는 셋 다 정본을 읽는다. 그룹이 통째로 비므로 `dropdown` 노드 자체를 지운다 —
빈 그룹을 남기면 다음 사람이 「여기에 넣어야 하나」를 묻게 된다.

### 나머지 서른셋은 이번에 손대지 않는다

같은 감사가 「LOUIS 컴포넌트도 제품도 읽지 않는」 토큰을 마흔둘 찾았다. 아홉만 지우는 것은
게으름이 아니라 판정이다.

- **`type-line-height-percent/*` 아홉** — [DS-D-0029](DS-D-0029-token-names-must-be-true.md) §1 이
  **의도적으로 만든 축**이다. Figma 가 행간을 PERCENT 로 보관하므로 CSS 소비가 0 인 것이
  설계된 상태다. 지우면 그 결정을 되돌리는 것이 된다.
- **`button/*` 다섯** — DS-D-0029 §2 가 DS-D-0027 사다리에 맞춰 **막 개명한 블록**이다.
  일부만 지우면 접미사 규칙이 다시 갈린다. 블록 전체의 존폐는 자기 결정으로 다룬다.
- **`node/*` 아홉** — LOUIS 에 캔버스 노드 컴포넌트가 없어 소비처가 생길 자리가 아직 없다.
  제품은 JS 상수 미러(`NODE_SIDE_CONTROL_PX` 등) 때문에 리터럴을 유지하기로 확정했다.
  「지금 아무도 안 읽는다」와 「앞으로도 아닐 것이다」는 다른 주장이고, 후자를 세울 근거가 없다.
- **`app/gnb-*` 나머지 여섯** — 720 미만에서 값이 갈리는 축(`rail-padding-bottom` 12→0,
  `main-inline-padding-end` 12→16)이거나, 제품 JS 상수와 짝인 것(`sidebar-logo-h` ↔
  `SIDEBAR_LOGO_H`)이거나, [app-shell-parts.md](../../components/app-shell-parts.md) 가 아직
  결손으로 적어 둔 축이다. 단일값 토큰이 반응형 축을 담지 못하는 것은 **형식 문제**이고,
  형식 문제의 처방은 삭제가 아니라 형식 수정이다.
- **`footer-reveal-height` · `layer-content` · `type-weight-tooltip`** — DS-D-0029 §3 이
  `footer-reveal-height` 를 남기며 쓴 문장이 셋 다에 적용된다: 「판정이 서지 않은 것을 파괴적
  변경에 묶지 않는다.」 `layer-content` 는 z 스케일의 바닥이라 명시적으로 쓰지 않는 것이 정상이고,
  스케일에서 한 단계만 빼면 나머지 넷의 의미가 흔들린다.

## Alternatives

- **마흔둘을 한 번에 지운다.** 근거의 질이 고르지 않다. 아홉은 제품이 다른 쪽을 집은 것이
  실증됐고, 나머지는 「아직 소비처가 없다」뿐이다. DS-D-0029 가 남긴 선례가 후자를 파괴적
  변경에 묶지 말라고 한다.
- **`app/gnb-*` 여덟을 한 블록으로 지운다.** 여섯은 반응형·JS 미러 때문에 살아야 한다.
  블록 단위로 묶으면 살아야 할 것이 함께 죽는다.
- **미러를 지우지 않고 정본의 alias 로 바꾼다.** 이름이 둘인 상태는 그대로다. 다음 사람이
  Figma 에서 12px 짜리 변수 둘을 보고 아무거나 집는 문제는 alias 로 해결되지 않는다.
- **제품이 미러를 집게 한다.** `styles.layer.css` 의 실물이 역할 토큰을 읽으므로 제품만 다른
  손잡이를 잡게 된다. 값이 갈리는 날 화면이 갈린다.

## Consequences

`check-token-diff` 가 breaking 을 낸다 — removal 9 · 그 외 0 이다. **resolved value 변경은 0**
이므로 렌더가 달라지는 화면이 없다. 의도된 변경이므로 baseline 을 승인해 잠근다
(선례 `3b24ad8`).

Figma 변수 9개를 같은 작업에서 지운다(`app/gnb-main-inline-padding` ·
`app/gnb-sidebar-padding-x` · `app/tooltip-font-size` · `app/tooltip-padding-block` ·
`app/tooltip-padding-inline` · `app/tooltip-radius` · `dropdown/radius` ·
`dropdown/item-radius` · `dropdown/padding`). 라이브가 506 → 497 이 된다. 그다음
`figma/readback.json` 을 재캡처하고 `build-figma-snapshot` 을 돌린다 —
[DS-D-0028](DS-D-0028-three-in-one-change.md) 규칙 1 이다. 셋 중 하나라도 미루면 게이트가
과거를 검사한다. `color/dropdown/*` 넷은 **색이고 이 결정과 무관하다.** 이름이 비슷해
일괄 처리에 휩쓸리기 쉬우니 여기 적어 둔다.

**제품 저장소는 바뀌지 않는다.** 지운 아홉은 제품이 이미 정본으로 옮긴 뒤이고
(`klipse-web` 커밋 `fd10d980` · `55839451` · `b5d6535c`), 제품이 `--louis-` 이름으로 이 아홉을
참조하는 곳은 0 이다. 규칙 1 의 세 곳 중 제품 쪽은 「바꿀 것이 없음」이 결론이며, 그 사실
자체를 여기 적어 다음 사람이 다시 확인하지 않게 한다.

산문도 바뀌지 않는다. `design/`·`migration/` 이 이 아홉을 인용한 곳은 전부 **제품 토큰 이름**
(`--app-gnb-sidebar-padding-x` 등)이고 그 변수는 제품 `globals.css` 에 그대로 있다.
`--louis-` 접두사로 이 아홉을 인용한 문장은 저장소 전체에 0 건이다.
