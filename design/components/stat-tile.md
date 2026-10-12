---
id: stat-tile
status: experimental
authority: normative
summary: 지표 하나를 라벨·수치·보조 설명·증감 알약 네 줄로 싣는 타일입니다.
---

# Stat Tile

지표 하나를 「라벨 · 수치 · 보조 설명 · 증감 알약」 네 줄로 싣는다. 격자에 여럿 깔려
대시보드의 첫 행이 된다.

**이 컴포넌트가 서기 전까지 이 조형은 어떤 기계도 본 적이 없다.** 정본인
`app/admin/AdminSection.tsx` 의 `AdminStatTile`(앵커 `5a67d692`)은 소비처 14 자리가 전부
`/admin` 이고, 제품의 대비·타이포·표면 게이트는 그 경로를 하나도 재지 않는다. 여기 값이 서면서
`figma/components.measured.json` 의 실측과 브라우저 시험이 그 값을 처음으로 잰다.

## 같은 조형을 세지 마라 — 형제가 하나 있다

제품에 지표 타일이 **두 벌** 있다.

| | 이 컴포넌트 (`AdminStatTile`) | 형제 (`chart-card`) |
| --- | --- | --- |
| 조형 | 면 하나 위에 네 줄 | 바깥 프레임 + 안쪽 면 |
| 값 | 28 SemiBold(lg) · 20 SemiBold(md) | 36 Medium |
| 라벨 | caption 12 Medium | body 14 Medium |
| 차트 | 없다 | 스파크라인 또는 넓은 곡선 |
| 소비처 | `/admin` 5 파일 14 자리 | `/analytics/youtube` · `/analytics/instagram` |

둘은 **한 컴포넌트의 두 크기가 아니다.** 액자가 있고 없고가 조형을 가르므로 따로 세운다.
실제로 다투는 값은 증감 알약의 좌우 여백 하나뿐이며 그 판정은 아래에 있다.

## Availability

| Surface       | 상태           | 근거 |
| ------------- | -------------- | ---- |
| Web           | `partial`      | CSS 레시피만 있고 React 표면은 없다. Alert 와 같은 상태이고 소비처는 클래스 마크업을 쓴다 |
| Figma         | `done`         | component set `StatTile`(Size × Delta 8 변형). 계약이 모든 property 를 pin 하고 기하는 양방향이다 — `stat-tile.browser.test.tsx` 가 코드 쪽에서 같은 실측을 되잰다. 게시 없이 판정한다([DS-D-0035](../governance/decisions/DS-D-0035-figma-done-without-publish.md)) |
| Documentation | `done`         | 이 문서 |
| Maturity      | `experimental` | 규범·구현·Figma 가 같은 변경 단위에서 처음 선다 |

## When to use

- 지표 하나를 **격자에 여럿 깔** 때. 다섯 열(주요 지표)이나 세 열(보조 타일)이 정본이다.
- 값 옆에 **직전 기간 대비 증감**을 붙여야 할 때.

쓰지 않는 자리.

- **차트가 붙어야 할 때.** `chart-card` 다.
- **상태나 분류 한 조각.** `badge` 다. Badge 문서가 이미 그 경계를 적어 두었다 —
  「증감률과 개수. 제품은 그것을 알약(999px)으로 그리고 상태 어휘를 갖지 않는다」.
- **누를 수 있어야 할 때.** 이 타일은 대화형이 아니다. 눌러서 이동하는 지표는
  `selectable-list-row` 나 링크를 얹은 카드다.

## Anatomy

1. **Frame** — `.louis-stat-tile`. 면·반경·헤어라인·여백을 갖는다.
2. **Label** — `.louis-stat-tile__label`. 지표 이름. 값보다 먼저 읽혀야 해서 위에 선다.
3. **Value** — `.louis-stat-tile__value`. 타일에서 가장 큰 글자.
4. **Hint** — `.louis-stat-tile__hint`. 분모·기간처럼 값을 읽는 데 필요한 한 줄. 선택.
5. **Delta** — `.louis-delta-pill`. 증감 알약. 선택이고 **타일 바닥에 붙는다.**

## Properties

| Property | 값 | 기본값 | 설명 |
| -------- | --- | ------ | ---- |
| `data-size` | `lg` · `md` | `md` | 값의 글자 크기. `lg` 는 주요 지표 행, `md` 는 보조 타일 |
| `data-tone`(알약) | `up` · `down` · `flat` | `flat` | 증감 방향. 면과 잉크 두 겹이 함께 바뀐다 |

## Variants, sizes, and states

크기 축은 **값의 크기만** 바꾼다. 여백·간격·반경은 두 칸이 같다 — 타일은 같은 격자에 서므로
액자가 달라지면 두 종류가 한 행에 섞였을 때 줄이 어긋난다.

상태 축은 없다. 정본 어드민 화면은 로딩을 타일이 아니라 **블록 하나**로 그리고
(`AdminStateBlock` + 스피너) 타일 자리에 스켈레톤을 깔지 않는다. 애널리틱스 쪽 KPI 스켈레톤은
형제 컴포넌트의 것이라 `chart-card` 의 `State=loading` 이 갖는다. 없는 상태를 여기에
만들지 않는다.

## States

**상태 축이 없다.** Figma 의 축은 `Size` 와 `Delta` 둘이고, 레시피에 `:hover` · `:focus` ·
`[disabled]` 선언이 하나도 없다. 타일이 대화형이 아니기 때문이다 — 누르는 지표는 이 타일이
아니라 `selectable-list-row` 나 링크를 얹은 카드다.

| 상태 | 무엇이 바뀌나 | 어디가 소유하나 |
| --- | --- | --- |
| 기본 | 라벨 · 값 · 힌트 · 알약 네 줄 | 이 레시피 |
| 알약 없음 | 값(과 힌트)까지만 그린다. 액자·여백은 그대로 | 소비처가 노드를 두지 않는다 |
| 힌트 없음 | 알약이 **여전히 타일 바닥에 붙는다** — `margin-block-start: auto` 가 그 자리를 잡는다 | 이 레시피 |
| 증감 세 톤 | `up` · `down` · `flat` 이 면과 잉크를 **함께** 갈아 끼운다. 색만으로 방향을 말하지 않으므로 문구의 부호가 주 신호다 | `.louis-delta-pill[data-tone]` |
| 로딩 | **이 타일에는 없다.** 정본 어드민 화면이 로딩을 타일이 아니라 블록 하나(`AdminStateBlock` + 스피너)로 그리고 타일 자리에 스켈레톤을 깔지 않는다 | 화면이 소유한다 |
| `forced-colors` | 프레임과 알약이 시스템 색 실선을 되살린다 — 헤어라인이 사라지는 자리다 | 이 레시피 |

**로딩 칸을 비워 둔 것이 이 표의 요지다.** 애널리틱스 쪽 KPI 스켈레톤은 형제 컴포넌트의
것이고 `chart-card` 의 `State=loading` 이 갖는다. 없는 상태를 여기에 그리면 그 칸이 규범이
된다 — 다음 사람이 그것을 보고 어드민에 스켈레톤을 깐다.

## Interaction and responsive behavior

대화형이 아니다. 포커스도 호버도 받지 않는다.

폭은 격자 트랙이 정한다(`inline-size: 100%`). 값에 `white-space: nowrap` 을 거는 이유는
줄바꿈이 그 타일 하나만 키를 키워 행 전체를 어긋나게 하기 때문이다. 좁은 화면에서 값이
잘리는 것은 **의도된 선택**이고, 소비처가 열 수를 줄여 해결한다.

## Content

- 라벨은 지표 이름 한 덩어리. 「지난 7일 신규 가입자 수」가 아니라 「신규 가입」이다.
- 값은 이미 서식이 끝난 문자열을 받는다. 축약(`1.2만`)·통화·단위는 소비처가 정한다.
- 알약 문구는 부호를 포함한다(`+12.4%`). 부호 없이 색으로만 방향을 말하면 WCAG 1.4.1 을 깬다.

## Accessibility

- 타일은 의미상 목록의 항목이다. 소비처가 `<ul>`/`<li>` 또는 `role="list"` 로 싼다.
- 라벨과 값은 눈으로 위아래 관계가 보이지만 보조기술에는 그 관계가 없다. 소비처가
  라벨 요소에 `id` 를 주고 값에 `aria-labelledby` 로 잇는다.
- 알약의 색은 보조 신호다. 문구의 부호가 주 신호다(위 Content).
- `forced-colors` 에서 헤어라인이 사라지므로 프레임과 알약이 시스템 색 실선을 되살린다.

## Specification

| Part/state | Token or recipe | 구현 근거 |
| ---------- | --------------- | --------- |
| Frame 여백 | `space-control-lg` 16 | 정본 `p-8`(제품 격자는 `--spacing: 2px`) |
| Frame 반경 | `radius-card` 12 | 정본 `rounded-card` |
| Frame 면 | `color-bg-raised` | 정본과 같다(제품 `--app-card-raised-bg` 가 이 토큰을 흘려 쓴다). 다크에서 `bg-surface` 는 어드민 카드 바닥 **그 자체**라 쓸 수 없다. `bg-inset` 도 한동안 같은 값이라 못 썼는데, 2026-09-09 의 다크 사다리 이동이 그것을 `palette-gray-900` 으로 내려 이제는 바닥과 다른 값이다 — 그래도 바닥보다 **어두워서** 카드 위로 올라온 면이 될 수 없으므로 결론은 그대로다 |
| Frame 경계 | `hairline-inset` | DS-D-0023 |
| Frame 간격 | 6px 리터럴 | 간격 계단에 없다. `space-overlay-item-content-gap` 도 6 이지만 그 이름은 오버레이 항목의 것이다 |
| Label | `typography-caption-medium` · `color-fg-tertiary` | |
| Value `md` | `typography-body-lg-semibold` | |
| Value `lg` | `typography-heading-sm-medium` 의 크기·행간 + `typography-body-lg-semibold` 의 중량 | 합성 ramp 에 semibold heading 칸이 없다(아래 Known deviations 1) |
| Hint | `typography-caption-regular` · `color-fg-tertiary` | |
| Delta 반경 | `radius-pill` 999 | Badge 의 `radius-control-sm` 8 과 **기하가 다르다** |
| Delta 여백 | `space-overlay-item-gap` 2 / 6px 리터럴 | 좌우 6 의 판정은 아래 Known deviations 2 |

## Acceptance tests

값의 정본은 `figma/components.measured.json` 의 `stat-tile` 이고 두 방향이 그것을 되잰다 —
Figma 쪽은 `verify-figma-parity`, 코드 쪽은 `packages/react/test/stat-tile.browser.test.tsx`
가 실브라우저 계산값으로 잰다. 시험은 값을 자기 파일에 적지 않고 그 기록에서 읽어 대조한다.
React 표면이 없으므로 렌더하는 것은 컴포넌트가 아니라 `.louis-stat-tile` 클래스 마크업이다 —
소비처가 실제로 쓰는 것과 같은 마크업이어야 이 시험이 제품에 있는 값을 지킨다.

두 칸(`lg` · `md`) 각각에서.

1. 액자의 여백 16 · 간격 6 · 반경 12 가 계약과 같고, **테두리 두께가 0** 이면서 `box-shadow`
   가 `none` 이 아니다 — 경계는 border 가 아니라 안쪽 헤어라인 한 겹이 만든다
   ([DS-D-0023](../governance/decisions/DS-D-0023-hairline-inset.md)).
2. 라벨 12 · 힌트 12 의 크기와 행간 150% 가 계약과 같다.
3. 값의 크기가 계약과 같고(`lg` 28 · `md` 20) **행간이 칸마다 다르다**(135% · 150%) — 이
   컴포넌트에서 크기 축이 실제로 가르는 것이 값 한 줄뿐이라는 사실이 여기서 걸린다.
4. 값에 `tabular-nums` 와 `white-space: nowrap` 이 걸려 있다. 자릿수가 바뀌어도 숫자가 흔들리지
   않고, 줄바꿈이 타일 하나만 키워 행을 어긋나게 하지 않는다.
5. 증감 알약의 여백 2/6 · 반경 999 · 글자 12 가 계약과 같다. 반경이 `Badge` 의 8 과 다른 것이
   두 표식을 가르는 기하다.

전체에서.

6. **세 톤이 면과 잉크를 함께 갈아 끼운다.** `up` · `down` · `flat` 세 벌의 계산값을 모아
   서로 다른지 확인한다 — 한 톤이 조용히 다른 톤과 같아지면 방향이 색으로 읽히지 않는다.
7. **알약은 힌트가 없어도 타일 바닥에 붙는다.** 계산 스타일로는 잡히지 않는 명제다
   (`margin-block-start: auto` 의 사용값은 늘어날 자리가 없으면 0px 이다). 그래서 늘어날 자리를
   만들고 **위치를 재서** 알약 아래 여백이 액자의 여백과 같은지 본다. 격자에 여럿 깔릴 때
   알약 줄이 들쭉날쭉해지는 것을 막는 유일한 시험이다.

Figma 쪽에서는 `rawFills` · `rawStrokes` 가 0 이다 — 면·잉크가 전부 변수에 물려 있다.

## Known deviations

1. **`lg` 값의 중량을 다른 계열에서 가져온다.** 합성 ramp 에 semibold heading 칸이 없어
   (`typography-heading-sm-*` 은 medium 한 칸뿐) 크기·행간은 heading 에서, 중량은
   `typography-body-lg-semibold-font-weight` 에서 받는다. 정본이 28 SemiBold 이므로
   medium 으로 내리지 않았다. 해소는 ramp 에 semibold heading 칸을 여는 것이다.
2. **증감 알약의 좌우 여백이 두 구현에서 갈려 있었다.** 어드민 8(`px-4`) ·
   애널리틱스 6(`px-3`). 6 을 정본으로 삼았다 — 알약이 실제로 그려지는 자리가 애널리틱스
   9 곳 · 4 파일 · 2 라우트이고 어드민은 한 파일이다(DS-D-0043). 제품 어드민이 이 값을
   물면 8 → 6 으로 2px 좁아진다.
3. ~~**`down` 톤의 면이 8% 가 아니라 12% 다.**~~ **2026-10-12 해소(DS-D-0083).** 붉은 8% semantic
   `color-accent-red-500-alpha-08` 을 세워 오름과 같은 알파가 됐다. 제품이 면을 덮어 칠하던 네 자리
   (`AdminSection.tsx` `DELTA_DOWN_8` · `KpiCard.tsx` · `OverviewTab.tsx` · `InstagramAnalyticsScene.tsx`)는 핀을 올릴 때
   덮기를 지운다.
4. **`up` 톤의 잉크가 `alert-success-stroke` 다.** 이름은 선이지만 값이 success 강조색
   정본이고 두 테마에서 같아 정본 픽셀과 일치한다. `fg-success` 는 라이트에서 짙은 초록이라
   정본이 아니다. 잉크로 쓸 semantic 이름이 없다는 것이 이 자리의 결함이며,
   `color-accent-danger` 가 붉은쪽에 이미 있는 것처럼 초록쪽에도 `accent-success` 가 서면
   해소된다.
5. **라벨·힌트의 색이 알파 두 칸에서 semantic 한 칸으로 접혔다.** 정본은 라벨 56% ·
   힌트 40% 로 잉크 알파가 갈리고 라이트에서는 불투명 팔레트로 한 번 더 덮는다.
   LOUIS component CSS 는 primitive(`color-gray-*`) 소비가 게이트로 막혀 있어 두 자리 모두
   `color-fg-tertiary` 로 적었다. 위계가 한 단 얕아진다 — 해소는 두 단짜리 보조 잉크
   semantic 을 세우는 소유자 판정이다.
6. **React 표면이 없다.** Alert 와 같다. 소비처는 클래스 마크업을 쓰고, 그 마크업이
   문서의 계약이라 브라우저 시험도 컴포넌트가 아니라 마크업을 렌더한다.

## Implementation

- Web source: packages/css/src/component/stat-tile.css
- Public import: `@klipse-design/css/styles.layer.css` (레시피 클래스)
- Figma component: `StatTile` — `DS · Components`
- Tests/visual evidence: packages/react/test/stat-tile.browser.test.tsx
- 제품 정본(앵커 `5a67d692`): `app/admin/AdminSection.tsx` 의 `AdminStatTile`.
  **저장소 접두사를 떼고 적는다** — 규범 문서는 제품 저장소 전용 경로를 직접 가리킬 수 없고
  (`build-design-docs` 의 저장소 경계 규칙), 좌표의 정본은 이 문서가 아니라 원장과
  evidence lock 이다

> 새 파일 넷은 아직 git 이 추적하지 않아 백틱 인용이 `verify-doc-paths` 를 깬다.
> 이 회차가 커밋을 하지 않으므로 경로를 백틱 없이 적는다 — 커밋이 서면 백틱으로 감싼다.

## Migration and changelog

처음 선다. [Updates](../updates/README.md) 참고.
