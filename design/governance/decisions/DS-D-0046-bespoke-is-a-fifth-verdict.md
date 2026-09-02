---
id: decision-bespoke-is-a-fifth-verdict
status: experimental
authority: normative
---

# DS-D-0046 「제품이 정본을 물지 않는다」는 다섯째 판정이다 — 대체 가능이 아니다

- Status: accepted
- Date: 2026-09-02
- Owners: repository owner, design system maintainer
- Affects: `decision-canonical-site-is-what-the-product-bites`,
  `decision-board-composition-denominator`, `decision-coverage-targets-and-denominators`,
  `decision-product-surface-denominator`

## Context

DS-D-0043 이 생성기를 고쳐 정본 프리미티브 35자리를 인스턴스로 놓은 뒤, 보드 원장에는 대체
가능 62 가 남았다. 게이트는 그 62 를 이렇게 인쇄했다:

> 대체가능 62개가 지금 바꿀 수 있는 것이다: IconButton/md 27 · Button/md 21 ·
> SegmentedControlItem/xs 12 · ProgressBar/base 2.

**그 문장이 거짓이었다.** DS-D-0043 이 같은 날 실측해 자기 Consequences 절에 이미 적어 둔
대로, 그 62 의 대부분은 «지금 바꾸면 안 되는» 자리다. 제품 원장의 probe 출처를 하나씩 열어
확인했다:

| 무엇 | 몇 | probe | 출처 |
| --- | ---: | --- | --- |
| `IconButton/md` | 27 | `icon-button` · `icon-button-card` | `Gnb.tsx iconButton` · `appHomeSceneStyles.ts archiveMoreButton` — 둘 다 제품 지역 스타일 |
| `SegmentedControlItem/xs` | 12 | `segmented-segment` | `myPageSceneStyles.ts settingsToggleBtn` |
| `Button/md` (`<a>`) | 20 | 정본 자리 `button-md` 의 요소는 `<button>` | `<a>` 로 그린 결제 CTA — column-gap 0 (`.louis-button` 은 4) |
| `Button/md` (`<button>`) | 1 | 상자가 다르다 | `/settings` 「Delete account」 — padding-inline 14 (`.louis-button[data-size=md]` 는 12) |
| `ProgressBar/base` | 2 | `progress-bar-track` | 제품은 `.louis-progress-bar` 를 **문다** — 다만 측정에 State 축을 고를 정보가 없다 |

DS-D-0043 의 원칙은 **「정본 자리는 제품이 무는 것이 정한다」**다. 위 60자리를 Figma 에서만
인스턴스로 바꾸면 Figma 가 제품보다 더 「정본」이 되어 두 축이 어긋난다 — 그 원칙이 막으려던
바로 그 사고를, 원장이 다음 사람에게 **시키고 있었다.**

원장에 칸이 하나 비어 있었다. 「제품이 bespoke 로 그리는 것이 맞고, 그것이 정본이 되어야
하는가는 표면 원장 `needed` 의 질문이다」를 적을 자리다. DS-D-0042 가 `svg` 때문에 `blocked`
를 연 것과 **같은 모양의 결손**이고, DS-D-0043 이 「다음 걸음의 결정」이라고 예고한 것이다.

## Decision

**판정을 다섯으로 연다. 다섯째 이름은 `bespoke` 다.**

| 판정 | 뜻 | 열리는 조건 |
| --- | --- | --- |
| `replaceable` | 대응이 있고 **지금** 인스턴스로 놓을 수 있다 | — (목표 0) |
| `bespoke` | 대응은 있는데 **제품이 그 자리에서 정본을 물지 않는다** | 제품이 정본 클래스를 물기 시작한다 |
| `blocked` | 대응은 있는데 **측정이 그것을 고를 정보를 잃었다** | 생성기가 그 정보를 싣는다 |
| `missing` | 컴포넌트여야 하는데 LOUIS 에 그 축이 없다 | LOUIS 에 세운다 |
| `structural` | 컴포넌트가 아닌 것이 맞다 | — (분모 밖) |

넷 중 어디에 접어도 거짓이 된다는 것이 다섯째를 여는 근거다. `replaceable` 은 「지금 바꾸면
된다」가 거짓이고, `missing` 은 「LOUIS 에 없다」가 거짓이며(있다), `structural` 은 사람이
누르는 것을 도형이라 부르는 것이고, `blocked` 는 고칠 곳을 생성기로 잘못 가리킨다.

**bespoke 는 후보다 — 구조가 아니다.** 상태 축을 갖는 상호작용 요소이므로 분모 안에 남는다.
그래서 `candidates`(= instance + replaceable + bespoke + blocked + missing)는 이 걸음에서 214
그대로다.

### 판정은 기계가 내리고, 사유는 손으로 적힌 것을 인용한다

**조인 키는 (컴포넌트, size, 태그)다.** 조인 대상은 DS-D-0043 이 이미 세운
`LOUIS_PRIMITIVE_SITES` · `LOUIS_PRIMITIVE_EXCLUSIONS` 이고, 생성물
`figma/app-screens.plan.json` 에 실려 있어 열거기가 목록을 다시 적을 필요가 없다. 갈래는 넷:

1. 자리가 있고 태그도 맞는다 → **제품 레시피 상자**(`migration/product.rendered-components.json`
   의 `rendered[probe]`)를 댄다. 어긋나면 `bespoke`(어느 축이 얼마나 어긋났는지 적는다),
   보이는 축이 모두 같으면 `replaceable`.
2. 자리는 있는데 **태그가 다르다** → `bespoke`. 결제 CTA 20개가 여기다.
3. 자리가 없다 → 제외 목록에 **적힌 판정과 사유**를 쓴다. 다섯 중 넷은 `bespoke`, 
   `progress-bar-track` 하나는 `blocked` 다.
4. 자리도 제외도 없다 → **던진다.** 판정 없이 넘어가는 길은 없다.

**자동 문자열 시험(「probe 의 html 이 `.louis-` 를 가리키는가」)은 쓸 수 없다.** 실측으로
확인했다 — `icon-button-card` 의 클래스는 `.louis-project-card-more` 로 `louis-` 로 시작하지만
그것은 **ProjectCard 의 부품**이지 IconButton 프리미티브가 아니다. 어느 `louis-` 이름이
프리미티브인지는 사람이 읽어야 알고, 그 읽기의 결과가 저 두 목록이다. 그래서 **판정은 자동,
사유는 인용**이다. (원장의 `$bespokeRule` 이 이 문단을 소유한다.)

**상자 시험은 생성기의 부분집합이다.** 생성기는 실브라우저 계산 스타일 전체를 문자열까지
대조하지만(DS-D-0043), 열거기가 읽는 축약 트리에 남아 있는 상자 축은 일곱뿐이다
(`SLIM_RECIPE_AXES`: height · 반경 · padding 넷 · gap). 보이지 않는 축은 **시험하지 않고**,
어느 축을 실제로 댔는지 사유에 함께 적는다. 「보이지 않으니 같다」로 접으면 상자 시험이 조용히
통과 도장이 된다. 한 축도 대보지 못하면 던진다.

### 래칫 방향 — `scoped` 같은 천장은 달지 않는다

`bespoke` 는 **상승 자유 · 하락 잠금**이다(`check-figma-surface-coverage` 의 `needed` 와 같은
모양). 상승은 발견이고, 발견을 벌하면 다음 사람은 열어 보지 않는 쪽을 고른다.

부정 경로는 하나다 — `replaceable` 을 `bespoke` 로 옮겨 목표의 분모를 좁히는 것. **그 문은
이미 두 겹으로 잠겨 있어 `check-coverage-targets` 의 `scoped` 천장 같은 그물을 새로 달지
않는다:** ① `REPLACEABLE_BASELINE` 은 양방향이라 어떤 하락도 실패하며 손으로 내리면서 어디로
갔는지 적게 만든다. ② 그 baseline 이 이 걸음에서 0 이 되었으므로 옮길 것이 애초에 없다 —
옮기려면 먼저 replaceable 을 올려야 하고 그 순간 ①에 걸린다.

잠기지 않는 이동은 `missing ↔ bespoke` 하나다. 둘 다 목표 분모 밖이고 성격이 같아(어느 쪽도
「지금 Figma 에서 할 일」이 아니다) 열어 두되, 게이트 머리말에 적어 다음 사람이 알고 하게 한다.

### 100% 는 「끝났다」가 아니다

인스턴스 비율의 분모는 «지금 바꿀 수 있는 것»이므로, `replaceable` 이 0 이 되면 그 비율은
**정의상** 100% 가 된다. 그 한 줄만 읽으면 보드 축이 닫힌 것처럼 보인다 — 그래서 두 게이트가
모두 대조군을 나란히 찍는다: 보드 게이트는 「후보 전체 대비 36.4%」와 ※ 주석을,
`check-coverage-targets` 는 표에 두 줄(지금 바꿀 수 있는 것 대비 / 후보 전체 대비)과
「보드 bespoke」 행을 인쇄한다. **DS-D-0044 의 「모든 지표 100%」에서 보드 bespoke 의 0 은
Figma 축의 일이 아니다** — 열리는 조건이 제품 쪽이고, 그 질문은 표면 원장의 `needed` 가 센다.

## Alternatives

- **62 를 그대로 `replaceable` 로 둔다.** 원장이 계속 「지금 바꿀 수 있다」고 인쇄하고, 그 말을
  믿은 사람이 DS-D-0043 이 막으려던 사고를 낸다. 이 결정의 출발점이다.
- **62 를 `structural` 로 옮긴다.** 사람이 누르는 것을 도형이라 부르게 되고, 후보 214 가 152 로
  떨어져 `CANDIDATE_FLOOR` 가 잡는다 — 잡히는 것이 맞다. 분모를 지워 비율을 올리는 길이다.
- **62 를 `missing` 으로 옮긴다.** 「LOUIS 에 없다」가 거짓이 된다(IconButton·
  SegmentedControlItem·ProgressBar 모두 서 있다). 읽는 사람이 이미 있는 컴포넌트를 또 세우러 간다.
- **`ProgressBar` 2 도 `bespoke` 로 접는다.** 제외 목록이 스스로 「제품은 `.louis-progress-bar`
  를 그대로 문다」고 적고 있다 — 접으면 그 문장과 판정이 어긋난다. 고칠 곳이 제품이 아니라
  측정이므로 `blocked` 가 정확하다. 제외 항목에 `verdict` 를 실은 이유가 이것이다.
- **probe 의 html 에서 `.louis-` 를 찾아 자동 분류한다.** `icon-button-card` 가 이 길을 닫았다
  (위 Decision 절).
- **`bespoke` 에 `scoped` 같은 천장을 단다.** 같은 문에 자물쇠를 하나 더 다는 일이 되고,
  천장은 진짜 발견(새 대응 규칙이 여는 자리)까지 실패로 만든다.

## Consequences

앵커 `ae8fd627` 의 보드 36장, 같은 열거기로 다시 잰 값:

| | 전 | 후 |
| --- | ---: | ---: |
| 인스턴스 | 78 | 78 |
| 대체 가능 | 62 | **0** |
| bespoke | — | **60** |
| 막힘 | 6 | **8** |
| 미보유 | 68 | 68 |
| 구조 | 667 | 667 |
| 후보 | 214 | 214 |
| 분류 총수 | 881 | 881 |

**후보 214 · 구조 667 · 총수 881 이 그대로인 것이 이 변화가 정직하다는 증거다** — 판정 규칙을
풀어 분모를 옮긴 것이 아니라 같은 후보가 다른 칸으로 갔다(DS-D-0043 이 35자리를 옮길 때 쓴
것과 같은 검산이다). `bespoke` 도 `replaceable` 과 같이 자손을 세지 않는다: 컴포넌트가 될
자리이고 다만 «아직» 정본이 아닐 뿐이라, 자손을 세면 판정을 옮긴 것만으로 total 과 structural 이
함께 튄다.

옮겨 간 62 의 내역: 제외 목록이 이미 사유를 적어 둔 자리 41(→ bespoke 39 · blocked 2) ·
정본 자리는 있으나 요소가 다른 자리 20(→ bespoke) · 제품 레시피 상자가 어긋난 자리 1(→ bespoke).
**남긴 replaceable 은 0 이다** — 62 중 지금 바꿀 수 있는 것은 하나도 없었다.

## Rollout and verification

- `scripts/lib/figma-component-substitution.mjs`: `LOUIS_PRIMITIVE_EXCLUSIONS` 에
  `component` · `sizes` · `verdict` 를 실었고(조인 키와 판정), `SLIM_RECIPE_AXES` ·
  `slimRecipeBoxDiff` 를 세워 축약 트리가 볼 수 있는 상자 축을 한 곳에 적었다.
- `scripts/build-figma-app-screens.mjs` 는 그 목록을 그대로 계획 파일에 싣는다(코드 변경 없음).
  런너 36조각은 한 바이트도 바뀌지 않았다 — 치환 판정 자체는 그대로이기 때문이다.
- `scripts/measure-figma-board-composition.mjs`: `canonicalVerdict` 가 계획 파일·제품 레시피
  원장과 조인해 판정을 낸다. 원장에 `counts.bespoke` · `bespokeByComponent` · `$bespokeRule` ·
  `$primitiveSiteSource` 가 생겼다.
- `scripts/check-figma-board-composition.mjs`: `REPLACEABLE_BASELINE` 62 → **0**,
  `BESPOKE_BASELINE` **60**(하락만 잠금), `INSTANCE_FLOOR` 78 · `CANDIDATE_FLOOR` 214 그대로.
  bespoke 노드는 조인 근거(`site` 또는 `probe`)를 요구하고, 어휘 검사·집계 재계산이
  bespoke 까지 넓어졌다. 인쇄가 두 줄로 갈렸다 — 「지금 바꿀 수 있는 것」과 「지금 바꾸면 안
  되는 것」.
- `scripts/check-coverage-targets.mjs`: 보드 인스턴스 행이 두 줄이 되고 「보드 bespoke」 행이
  생겼다. 래칫은 더하지 않았다 — 임자는 보드 게이트다.
- `scripts/verify-gates.mjs`: 보드 카나리아 여섯 → **열**. ⑥은 `replaceable` 이 0 이 되어
  `bespoke` 노드를 고르도록 옮겼고, ⑦(bespoke → replaceable 되돌리기) · ⑧(bespoke 하락 미잠금) ·
  ⑨(근거 없는 bespoke) · ⑩(조인표에서 판정이 사라졌다 → 열거기가 던지는가)을 더했다.
  카나리아 65개 통과.
- `pnpm build` · `check` · `test`(834) · `verify:ci` 전부 초록.
