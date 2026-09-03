---
id: decision-dead-token-unit-and-denominator
status: experimental
authority: normative
---

# DS-D-0047 죽은 토큰의 단위는 발행된 이름이 아니라 원천 토큰이다 — 그리고 사다리의 빈 칸은 재고가 아니다

- Status: accepted
- Date: 2026-09-03
- Owners: repository owner (분모 판정), design system maintainer
- Affects: `decision-coverage-targets-and-denominators`, `decision-token-names-must-be-true`,
  `decision-no-duplicate-role-tokens`, `decision-alpha-scale`, `decision-color-architecture`

## Context

[DS-D-0044](DS-D-0044-coverage-targets-and-denominators.md) 가 죽은 토큰의 목표를 **0**, 방법을
**지워서**로 못 박았다. 그 수를 세는 `check-coverage-targets` 는
`packages/css/generated/tokens.css` 의 **선언 이름**을 단위로 썼고, 이 결정 직전 값은 **322** 였다.

322 를 층으로 갈라 보니 그 단위가 목표를 **정의상 도달 불가**로 만들고 있었다. 322 개 이름을
원천(`packages/tokens/src/klipse.tokens.json`)의 `id` 로 되짚으면 토큰 **256** 개이고, 그중
**73** 개는 **살아 있는 토큰**이다 — 발행된 이름 여럿 중 하나만 안 풀린 것이다.

| 되짚은 결과 | 토큰 | 선언 이름 | 무엇인가 |
| --- | ---: | ---: | --- |
| 발행 형태만 안 풀림 | 73 | 77 | 색 계단 52(`--louis-color-red-500` 는 안 풀리는데 `-rgb` 채널은 산다) · motion 합성 21(`-duration`·`-timing-function` 은 사는데 `-delay` 만 안 쓴다) |
| 프리미티브 팔레트 | 36 | 72 | `static-black/white-alpha` · `red-alpha` · `green-500-alpha` 계단 |
| semantic 사다리 | 32 | 52 | 적응형 회색 램프 `color-gray-*` 27 · 타이포 스케일 `typography-*` 5 |
| Figma 전용 축 | 9 | 9 | `type-line-height-percent/*` |
| **역할 토큰** | **106** | **112** | 역할 이름을 가졌는데 아무도 그 역할을 쓰지 않는 것 |

`--louis-color-red-500` 만 지우는 것은 **불가능하다.** 같은 원천 토큰이 `-rgb` 를 함께 발행하고
제품은 [채널 경유](../../foundations/color-theme.md) 로 그쪽을 문다. 이름을 단위로 세는 한 그 77 개는
영원히 남고, 「지워서 0」은 도달할 수 없는 목표가 된다. **단위가 틀린 것이지 재고가 많은 것이
아니다.**

## Decision

### 1. 단위는 원천 토큰이다

`check-coverage-targets` 는 죽은 선언 이름을 `id` 로 되짚어 **토큰**을 센다. 발행된 이름이
하나라도 살아 있으면 그 토큰은 살아 있다. 원천에 `id` 가 없는 죽은 이름은 **빼지 않고 센다** —
되짚을 근거가 없는 것을 조용히 빼면 생성기가 새기 시작해도 수가 그대로다.

### 2. 사다리의 빈 칸은 분모 밖이다

소유자 판정: **팔레트는 완결된 사다리인 것이 값이다.** 쓰는 계단만 남기면 다음에 그 계단이
필요할 때 이름·값이 예전과 같다는 보장이 없다. semantic 이 alias 하지 않는 계단이 있는 것은
정상이다.

**그 규칙은 프리미티브에서 끝나지 않는다.** 층으로 갈라 보니 같은 모양의 사다리가 semantic 에도
있었다 —

- **적응형 회색 램프 `color-gray-000…1000` + `color-gray-000-alpha-04…96` 27** 은
  [DS-D-0031](DS-D-0031-no-theme-branch-on-adaptive-ramp.md) 이 「테마로 분기하지 말고 램프를
  쓰라」고 세운 바로 그 사다리다. 소유자가 2026-09-02 까지 20여 커밋에 걸쳐 이것을 다시 잡았고,
  제품은 열한 계단을 전부 `--gray-*` 로 미러한다(앵커에서 `--gray-000` 만 1176 회). 「semantic 이니
  역할이다」로 깎으면 그 작업을 되돌린다.
- **타이포 스케일 `typography-*` 5** 는 15 단 스케일에서 아직 안 쓰는 다섯 단이다. 한 단을 빼면
  나머지 열의 의미가 흔들린다 — DS-D-0030 이 `layer-content` 를 남기며 쓴 문장 그대로다.

**가르는 선은 「프리미티브냐 semantic 이냐」가 아니라 「사다리냐 역할이냐」다.** 사다리는 계단
번호가 이름이고, 역할은 쓰임이 이름이다. 역할 이름을 가졌는데 그 역할을 아무도 쓰지 않는 것 —
DS-D-0030 이 말한 「쓰지 않는 계단은 스케일이 아니라 재고」의 실제 대상은 그쪽이다.

### 3. Figma 전용 축은 분모 밖이다

`type-line-height-percent/*` 아홉은 [DS-D-0029](DS-D-0029-token-names-must-be-true.md) §1 이
**일부러** 만들었다. Figma 가 행간을 PERCENT 로 보관하므로 CSS 소비 0 이 설계된 상태이고,
DS-D-0030 이 이미 삭제를 거부했다. `var()` 만 보는 정의가 **구조적으로** 잘못 세는 자리이지
재고가 아니다.

### 4. 좁히기가 화장이 아님을 게이트가 매번 증명한다

`theme.css` 대조군을 찍는 방식 그대로, 게이트는 **두 수를 나란히 인쇄한다** — 「죽은 토큰(지울 수
있는 것)」과 「죽은 선언 이름(대조군)」. 그리고 뺀 셋을 매번 수와 함께 적는다. 뺀 것은 **규칙이지
목록이 아니다**(`tier === "primitive"` · `^color-gray-\d` · `^typography-` · 
`^type-line-height-percent-`). 목록이면 다음에 늘어난 것이 조용히 빠진다.

좁히기가 정당한 이유는 수가 작아져서가 아니다. **뺀 셋은 전부 «지워서 0» 이 불가능한 것들이고,
남긴 106 은 전부 삭제가 답인 것들이다.** 목표와 방법이 DS-D-0044 에 고정돼 있으므로 분모는 그
방법이 닿는 범위와 같아야 한다.

### 5. 확실한 여덟을 지운다 — 세 그룹 통째로

DS-D-0030 의 판정 기준(같은 역할을 두 이름이 말하고, **제품이 실제로 어느 쪽을 집는지**가
드러났을 때)을 만족하는 것만 지운다.

**`color/dropdown/*` 넷** — `surface-bg` · `frame-ink` · `frame-ink-on-dark` · `ambient-ink`.
DS-D-0030 이 같은 `dropdown` 그룹의 기하 셋(`radius`·`item-radius`·`padding`)을 이미 지웠고,
[Menu / Popover](../../components/menu-popover.md) 가 **일곱 이름 전체**에 대해 「그 일곱 이름은
P#1 이후 제품에 없고 지금은 제품이 LOUIS 정본을 직접 소비한다」를 적고 있다. 앵커
`ae8fd627` 에서 `--dropdown-*` 넷의 참조는 0 이고, `.louis-menu`·`.louis-popover` 는
`color-bg-menu`·`color-stroke-*` 를 읽는다. `dropdown-surface-bg` 는 `palette-gray.100/800` 로
멈춰 있어 소유자가 `bg-menu` 를 `palette-gray.050` 으로 올린 재보정을 **받지 못한 미러**라는 것도
드러난다. 그룹이 통째로 비므로 노드 자체를 지운다.

**`color/surface/*` 셋** — `background` · `foreground` · `primary-on`. `8de65bb` 가 들여온 제품
티어 잔재다. `surface-background` 는 `color-bg-canvas` 와 **별칭 대상까지 같고**(양 모드
`palette-gray.100/900`), 앵커에서 제품이 이 셋을 어떤 이름으로도 참조하지 않으며, LOUIS 저작
CSS 도 읽지 않는다. `foreground`/`primary-on` 의 역할은 `fg-primary`·`fg-inverse` 가 가진다 —
그쪽과 라이트 값이 갈려 있다는 것(검정 vs `palette-gray.900`)이 오히려 이 셋이 방치된 미러라는
증거다. 그룹 전체.

**`color/vem/*` 하나** — `properties-label`. `color-fg-tertiary` 와 별칭 대상까지 같고
(`palette-gray.600/400`) 제품·LOUIS 어느 쪽도 참조하지 않는다. 그룹 전체.

### 6. 나머지 98 은 얼린다 — 다음 사람의 목록

`DEAD_TOKEN_BASELINE = 98`, 양방향 래칫, 목표 0.

| 계열 | 수 | 앵커에 제품 미러가 있는 것 |
| --- | ---: | ---: |
| `color/node/*` | 45 | 25 |
| `color/app/*` · `app/gnb-*` | 16 | 12 |
| `node/*` (기하) | 9 | 9 |
| `button/*` | 6 | 1 |
| `color/stroke/*` | 4 | 0 |
| `elevation/*` · `motion/*` | 6 | 0 |
| 그 밖(`color/{media,scrollbar,accent,bg,brand,fg,icon}` · `footer` · `layout` · `type-weight`) | 12 | 3 |
| **합** | **98** | **50** |

**제품 미러가 있는 50 은 「죽은 것」이 아니라 「아직 안 물린 것」이다.** 앵커에서 제품이 자기
이름(`--node-side-handle-size` · `--app-page-bg` …)으로 그 값을 쓰고 있고, LOUIS 가 그 값을
소유한다는 것이 [DS-D-0024](DS-D-0024-color-architecture.md) 의 목적이었다. 그래서 **분모에
남긴다** — 0 으로 가는 길이 삭제가 아니라 채택인 자리이고, 그 사실을 분모 밖으로 치우면 채택이
영영 일어나지 않는다. DS-D-0030 이 `node/*`·`app/gnb-*`·`button/*` 을 남기며 쓴 근거가 그대로
유효하다.

## Alternatives

- **선언 이름 단위를 그대로 둔다.** 목표 0 이 도달 불가인 채로 남는다. 도달 불가인 목표는
  다음 사람이 열어 보지 않는다 — 이 저장소가 hosted CI 46 회 빨강으로 이미 겪은 실패다.
- **프리미티브만 빼고 semantic 은 전부 센다(처음 판정).** 회색 램프 27 과 타이포 스케일 5 가
  분모에 남아, 다음 사람이 「지워서 0」을 향해 **소유자가 방금 다시 잡은 사다리**를 깎게 된다.
  가르는 선은 층이 아니라 사다리/역할이다.
- **98 을 한 번에 지운다.** 근거의 질이 고르지 않다. 여덟은 제품이 다른 쪽을 집은 것이 실증됐고,
  50 은 제품이 자기 이름으로 그 값을 쓰는 중이며, 나머지는 「아직 소비처가 없다」뿐이다.
  DS-D-0029·DS-D-0030 의 선례가 후자를 파괴적 변경에 묶지 말라고 한다.
- **제품 미러가 있는 50 을 분모 밖으로 옮긴다.** 수는 48 로 내려가지만 채택이 안 일어나도
  게이트가 조용해진다. 「범위 밖은 것들이 사라지는 자리」라는 이 표의 경고가 그대로 적용된다.

## Consequences

`check-token-diff` 가 breaking 을 낸다 — **removal 16**(토큰 8 × 모드 2) · **그 외 전부 0**.
`value`·`rawValue`·`aliasTarget` 이 0 이므로 **렌더가 달라지는 화면이 없다.** 새 위반을 받아들이는
재생성이 아니라 **의도된 제거**이므로 baseline 을 승인해 잠근다(선례 `3b24ad8`, DS-D-0030).

`design/components/switch.md` 의 합성 바닥 인용을 `color-surface-background` → `color-bg-canvas`
로 옮긴다. 두 이름의 해석값이 같으므로 그 절의 대비 표(라이트 `#f1f1f3` · 다크 `#171b22`)는
바뀌지 않는다.

`scripts/verify-gates.mjs` 카나리아 ⑥ 의 표본을 `--louis-color-blue-350` 에서
`--louis-color-stroke-strong` 으로 옮긴다. 색 계단은 이 결정 이후 `-rgb` 채널 때문에 분모 밖이라,
살려도 수가 움직이지 않아 **카나리아가 조용해진다** — 카나리아가 조용해지는 것이 이 저장소에서
가장 위험한 실패다.

**Figma 는 이 커밋에서 따라가지 않는다.** 지운 여덟은 라이브에 변수로 서 있다
(`color/dropdown/*` 4 · `color/surface/*` 3 · `color/vem/properties-label` 1). Figma 변수 삭제는
되돌리기 어렵고, `verify-figma-parity` 는 이 커밋 시점에 이미 회색 램프 파도 19 줄로 0 이 아니다
— 그 19 줄은 라이브에 `palette-gray/050`·`/150` 이 없어 프리미티브를 먼저 세워야 닫힌다.
[DS-D-0028](DS-D-0028-three-in-one-change.md) 규칙 1 의 **미완이며, 그 사실을 여기 적는 것이
미루는 것과 잊는 것을 가르는 유일한 차이다.** 다음 사람이 회색 램프를 Figma 에 옮길 때 같은
작업에서 이 여덟을 지우고 `figma/readback.json` 을 재캡처한다(라이브 변수 수가 8 만큼 줄어든다).

## Rollout and verification

- `pnpm build` · `pnpm check` · `pnpm test` · `pnpm verify:ci` 전부 0.
- `check-coverage-targets` 가 「죽은 토큰(지울 수 있는 것) 98/458」과 「죽은 선언 이름(대조군)
  314/679」을 나란히 인쇄한다. 좁히기 전 이름 수 322 → 314 는 이 커밋이 여덟을 지운 결과다.
- `verify-gates:ci` 의 카나리아 68 개가 통과한다 — ⑤(죽은 토큰 1 증가)와 ⑥(1 감소)이 새 단위에서
  여전히 진단을 낸다는 뜻이다.
