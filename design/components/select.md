---
id: select
status: experimental
authority: normative
summary: 목록에서 값 하나를 골라 지금 값을 스스로 보여 줍니다.
---

# Select

값 하나를 고르는 컨트롤이다. 트리거가 지금 골라져 있는 값을 스스로 말하고, 누르면 값 목록을
연다. 이 문서는 과거 구현의 평균이 아니라 이 저장소가 유지할 **목표 계약**이다.

이 컴포넌트는 2026-08-18 에 `not-planned` 로 닫혀 있었고
[DS-D-0053](../governance/decisions/DS-D-0053-select-is-not-a-menu.md)이 그 판정을 뒤집었다.
무엇이 맞았고 무엇이 틀렸는지는 그 결정이 갖는다.

## Availability

| Surface       | 상태           | 근거                                                                 |
| ------------- | -------------- | -------------------------------------------------------------------- |
| Web           | `partial`      | CSS 레시피만 있고 React 표면은 없다. 정본은 select.css 의 `.louis-select-trigger` |
| Figma         | `done`         | `SelectTrigger` component set 16 variant(Size × State × Placeholder). 계약이 모든 property 를 pin 하고 기하가 붙었다. 기하는 양방향이다 — 브라우저 테스트가 코드 쪽에서 같은 실측을 되잰다. 게시 없이 판정한다([DS-D-0035](../governance/decisions/DS-D-0035-figma-done-without-publish.md)) |
| Documentation | `done`         | 이 문서                                                              |
| Maturity      | `experimental` | 시각 회귀와 수동 screen-reader 검토가 아직 없음                      |

## 이 컴포넌트가 소유하지 않는 것

**표면은 [Menu / Popover](menu-popover.md)가 소유한다.** 값 목록의 패널은 명령 메뉴의 패널과
같은 표면이고, 항목도 같은 행이며, 「지금 값」 표시(`aria-selected`)는 2026-09-06 에 그 파일이
이미 세웠다. 검색이 붙는 목록의 검색 필드는 [TextField](text-field.md)다 — 그 컴포넌트의
`HasLabel` 축이 존재하는 이유가 「라벨 없는 필드가 실재한다 — 검색창이 그것이다」다.

그래서 **여기서 새로 서는 것은 트리거 하나**이고, Figma 에도 component set 이 하나뿐이다.
같은 표면을 두 번 그리지 않는다.

## When to use

- 값 하나를 고르는 자리. 패널이 `role="listbox"` 이고 항목이 `role="option"` 이다.
- 옵션 수가 많아 검색이 필요한 자리(설치 글꼴 등). 검색줄은 스크롤 밖 고정 헤더다.

다음에는 사용하지 않는다.

- 서로 독립적인 **명령**을 여는 자리는 [Menu / Popover](menu-popover.md)의 `MenuTrigger` 다.
  `menu` 역할로 값 선택을 흉내 내지 않고, 반대로 값 목록을 `listbox` 아닌 것으로 만들지 않는다.
- 값이 둘뿐이면 [Switch](switch.md) 또는 [SegmentedControl](segmented-control.md)이다. 두 값을
  고르려고 목록을 여는 것은 손이 한 번 더 간다.
- 값이 서넛이고 늘 보여야 하면 SegmentedControl 이다.

## Anatomy

1. **Trigger** — 이름, `aria-expanded`, `aria-haspopup="listbox"`, 패널과의 관계를 소유한다.
   1. **Glyph** — 선행 글리프 슬롯. 고정 치수이고 행이 좁아져도 줄지 않는다.
   2. **Value** — 지금 골라져 있는 값. 남는 폭을 먹고 넘치면 말줄임한다.
   3. **Caret** — 열림에서 180° 돈다. 아이콘 슬롯이 아니라 컨트롤 안의 장식이다.
2. **Panel** — `MenuPanel` 이다. 표면·충돌 보정·스크롤 경계를 그쪽이 소유한다.
3. **Search** — 옵션이 많은 목록에만 있는 고정 헤더. 안에 `TextField` 가 앉는다.
4. **List** — 구르는 옵션 목록. 검색줄이 있을 때만 별도 스크롤포트가 된다.
5. **Option** — `.louis-menu__item` 이다. 지금 값은 `aria-selected="true"` 가 면으로 표현한다.
6. **Empty** — 검색 결과가 없을 때의 한 줄. 항목이 아니므로 `role` 을 주지 않는다.

## Properties

**React 표면이 없다.** 공개 계약은 prop 표가 아니라 **클래스와 속성**이고, 소비처가 그것을
직접 문다 — Alert · Switch 와 같은 형태다. 아래가 그 전부이며, 여기 없는 것은 이 컴포넌트의
계약이 아니다.

| 계약 | 어디에 | 값 | 뜻 |
| --- | --- | --- | --- |
| `.louis-select-trigger` | 트리거 요소 | — | 면·경계·기하를 갖는다. `<button>` 이다 |
| `data-size` | 트리거 | `sm` · (없음) · `lg` | **없을 때가 `md`(32)** 이고 `sm` 은 24, `lg` 는 40 이다(2026-10-13). Alert 의 `Layout=block` 과 같은 규칙 |
| `aria-expanded` | 트리거 | `true` · `false` | 열림. 면을 hover 값으로 유지하고 캐럿을 180° 돌린다 |
| `aria-haspopup` | 트리거 | `listbox` | 여는 것이 명령 메뉴가 아니라 값 목록임을 말한다 |
| `disabled` · `aria-disabled` | 트리거 | — | 잉크만 내리고 면은 그대로 둔다. 커서가 `not-allowed` 가 된다 |
| `.louis-select-trigger__icon` | 트리거 자식 | — | 선행 글리프 슬롯. 고정 치수라 행이 좁아져도 줄지 않는다 |
| `.louis-select-trigger__value` | 트리거 자식 | — | 지금 값. 남는 폭을 먹고 넘치면 말줄임한다 |
| `data-placeholder` | 값 요소 | (있음) | 값이 아직 없다. 안내 문구를 넣고 잉크를 `fg-tertiary` 로 내린다. 꺼진 트리거에서는 `fg-disabled` 가 이긴다. Figma 에서는 `Placeholder=true` |
| `.louis-select-trigger__caret` | 트리거 자식 | — | 캐럿. `aria-hidden` 이고 크기 축을 따르지 않는다(세 칸 다 12) |
| `.louis-select-search` | 패널 자식 | — | 스크롤 밖 고정 헤더. 안에 `TextField` 가 앉는다 |
| `.louis-select-list` | 패널 자식 | — | 구르는 항목 목록. 패널 안쪽 여백을 되먹어 스크롤바가 곡률 안쪽까지 닿는다 |
| `data-searchable` | `.louis-popover` | `true` | 검색줄이 있을 때 **패널 자신의 스크롤을 끈다** — 구르는 것은 목록이다. `:has()` 로 추론하지 않는 이유는 그러면 마크업의 우연이 이 규칙을 뒤집기 때문이다 |
| `.louis-select-empty` | 목록 자리 | — | 결과 없음 한 줄. 항목이 아니므로 `role` 을 주지 않는다 |

패널 · 항목 · 「지금 값」(`aria-selected="true"`)의 계약은 여기 없다. [Menu / Popover](menu-popover.md)가
소유하고, 이 문서는 그것을 다시 적지 않는다.

## Variants, sizes, and states

`Size` 는 `md`(32) · `sm`(24) · `lg`(40) 셋이다. **속성이 없을 때가 `md`** 이고, 그 사실 자체가 계약이다 —
Alert 의 `Layout=block` 과 같은 규칙이다. `lg` 는 2026-10-13 에 열었다(아래 「크기 lg — 폼 안의 선택 필드」).

| 축 | 값 | 무엇이 갈리나 |
| --- | --- | --- |
| `Size` | `md` · `sm` · `lg` | 높이 32 ↔ 24 ↔ 40 · 곡률 12 ↔ 8 ↔ 12 · 좌우 여백 12·12 ↔ 8·6 ↔ 16·16 · 간격 6 ↔ 4 ↔ 8 · 글리프 20 ↔ 16 ↔ 20 · 값 글자 caption ↔ caption ↔ body-sm. 캐럿은 12 로 **갈리지 않는다** |
| `State` | `Default` · `Hover` · `Open` · `Disabled` | 면과 잉크, 그리고 캐럿의 회전 |
| `Placeholder` | `false` · `true` | 값 요소의 잉크만. `true` 면 `fg-tertiary`(Disabled 에서는 `fg-disabled`), 면 · 기하는 그대로다 |

`Hover` 와 `Open` 의 **면은 같고 뜻이 다르다.** 포인터가 패널로 넘어가면 트리거가 hover 를
잃는데, 그때 면이 돌아가면 「무엇이 열려 있는지」가 화면에서 사라진다. 둘을 가르는 것은 캐럿의
회전이다.

`Disabled` 에서 **면은 그대로 두고 잉크만 내린다.** 값 목록은 꺼져 있어도 「지금 값」을 계속
읽혀야 하므로 상자가 사라지면 안 된다.

### 크기 lg — 폼 안의 선택 필드

TextField lg 와 한 줄에 나란히 서는 트리거다(`data-size="lg"`, 2026-10-13, [DS-D-0084](../governance/decisions/DS-D-0084-product-parts-become-louis.md)).
높이 · 좌우 여백 · 값 글자가 TextField lg 와 같아서 조회 줄 · 폼 줄에서 입력칸과 선택칸의 바닥선 · 글자가 맞는다. 정본은 제품
어드민의 선택 필드(`app/admin/AdminSection.tsx:100-103`, 12파일 35자리)다 — 트리거가 `.louis-text-field__box` 를 그대로
입고 있었다.

| 크기 | 높이 | 좌우 | 간격 | 값 | 반경 |
| --- | --- | --- | --- | --- | --- |
| sm | 24 | 8 · 6 | 4 | caption | `radius-control-sm` |
| md(기본) | 32 | 12 | 6 | caption | `radius-control` |
| lg | 40(`control-height-lg`) | 16(`space-control-lg`) | 8(`space-control-sm`) | body-sm | `radius-control` |

**값 글자가 caption 에서 body-sm 으로 오르는 것은 크기 축이 아니라 이웃 계약이다.** 옆 입력칸의 값이 body-sm 이라 한 줄에 선
두 칸의 글자가 달라지면 안 된다. 면 · 반경 · 헤어라인 · 호버 · 캐럿 회전 · 글리프 20 · 캐럿 12 는 md 를 물려받는다.

**쓰는 자리:** 폼과 어드민 조회 줄 — 옆에 TextField lg 가 있을 때. 툴바 · 인스펙터는 md · sm 이다.

**48 칸은 열지 않는다.** 문의 화면의 48 은 입력칸까지 48 로 덮은 화면이라 lg 가 아니다 — 아래 Known deviations 8.

**Figma `SelectTrigger Size=lg` 는 2026-10-13 에 섰다.** `lg` × `State` 4 × `Placeholder` 2 = 8 칸이고, 기록 `select.lg`(40 · 16 · 8)를
parity 가 대조하고 실브라우저 시험(`packages/react/test/select.browser.test.tsx`)이 lg 까지 세 칸을 잰다. 되읽기에서 옮길 때 md 칸의
값 글자(caption 12/18)가 따라왔던 것을 그 시험이 잡아 기록을 레시피 값 14/21 로 고쳤다(2026-10-13).

`Disabled` 와 `Hover`·`Open` 은 곱하지 않는다 — 꺼진 트리거 위에서 그 둘이 서지 않으므로
한 축으로 접었다(figma-component-authoring.md 의 접기 시험).

**`Placeholder` 는 `State` 와 곱한다(2026-10-08).** 같은 접기 시험이 반대로 나온다 — 값이 없는
채로 `Hover` · `Open` 은 면이 바뀌고 `Disabled` 는 잉크가 `fg-disabled` 로 가서 넷이 각각 다르게
보인다. 그래서 `State` 의 다섯째 값이 아니라 조건 축이고 16 변형이다. TextField 가 같은 뜻을
`State=Placeholder` 로 접은 것과 갈리는 이유는 그 필드가 hover 에서 아무것도 바꾸지 않아 곱할
칸이 없기 때문이다. BOOLEAN 이 아닌 이유는 계속 보이는 `Value` 레이어의 색이 바뀌어서다(figma-component-authoring.md §2 시험 1).

## States

네 칸이고 **면과 잉크 두 겹만 움직인다.** 기하는 네 칸에서 같다 — 상태가 크기를 바꾸면 트리거가
격자에서 흔들린다.

| 상태 | 면 | 잉크 | 그 밖에 |
| --- | --- | --- | --- |
| `Default` | `color-bg-inset` | `color-fg-primary` | 트리거가 **쉼 상태에서도 면을 갖는다.** `MenuTrigger` 와 갈리는 자리이고, 값 목록은 「지금 무엇이 골라져 있는가」를 늘 보여야 하기 때문이다 |
| `Hover` | `color-accent-secondary-hover` | 그대로 | 면 위 한 칸. ghost 8% 가 아닌 이유는 이미 면이 있어 8% 가 거의 움직이지 않아서다 |
| `Open` | **`Hover` 와 같다** | 그대로 | 캐럿이 180° 돈다. 포인터가 패널로 넘어가면 트리거는 hover 를 잃는데, 그때 면이 돌아가면 「무엇이 열려 있는지」가 화면에서 사라진다 |
| `Disabled` | **`Default` 와 같다** | `color-fg-disabled` | 커서 `not-allowed`. 꺼져 있어도 「지금 값」은 읽혀야 하므로 상자가 사라지면 안 된다 |

**두 쌍이 면을 공유한다.** `Hover`·`Open` 은 같은 면이고 캐럿의 회전이 가르며, `Default`·
`Disabled` 는 같은 면이고 잉크가 가른다. 그래서 이 네 칸은 「면 두 값 × 잉크 두 값」이 아니라
서로 다른 두 축이 한 줄로 접힌 것이다 — `Disabled` 와 `Hover`·`Open` 을 곱하지 않는 이유가
이것이다(꺼진 트리거 위에서 그 둘은 서지 않는다).

`forced-colors: active` 에서 헤어라인(box-shadow)이 사라지므로 `currentColor` 실선 하나를
되살리고, 꺼진 트리거의 잉크를 `GrayText` 로 옮긴다. 저작 색은 강제로 치환되므로 **사라지는
것만** 되살린다.

면에는 전이가 걸려 있다. 상태를 재는 시험이 hover 직후의 계산값을 그대로 읽으면 목표색이
아니라 보간 중인 색을 잡는다 — 아래 Acceptance tests 4 가 그 함정을 안고 쓰였다.

## Interaction and responsive behavior

- 트리거는 `aria-haspopup="listbox"` · `aria-expanded` 를 갖는다. 패널은 `role="listbox"`,
  항목은 `role="option"` + `aria-selected` 다.
- 열림·닫힘·충돌 보정·바깥 클릭·Escape 는 [Menu / Popover](menu-popover.md)의 overlay 계약을
  그대로 따른다. Select 가 자기 규칙을 따로 갖지 않는다.
- 검색이 켜지면 열릴 때 포커스가 검색 필드로 간다. 닫히면 검색어를 버린다.
- 폭은 호출부가 정한다. 값이 남는 폭을 먹으므로 좁아지면 값이 먼저 말줄임되고 캐럿은 줄지 않는다.

## Content

- 값 라벨은 **명사**다. 「선택하세요」 같은 안내문을 값 자리에 넣지 않는다 — 값이 없는 상태는
  placeholder 로 그린다: 값 요소에 `data-placeholder` 를 달고 안내 문구를 넣으면 잉크가 `fg-tertiary` 로 내려간다
  (2026-10-07, 제품 하이라이트 화면의 주제 · 종목 Select). 사용자가 **명시적으로 골라야 하는 자리**에만 쓴다 —
  기본값이 있는 자리는 그 값을 보인다.
- 검색 결과 없음 문구는 **무엇을 찾지 못했는지**를 말한다. KO 「검색 결과가 없습니다」 /
  EN “No results”.

## Accessibility

- 트리거의 accessible name 은 호출부가 준다. 값만으로는 「무엇의 값인지」가 서지 않는다.
- 캐럿은 `aria-hidden` 이다. 열림·닫힘은 `aria-expanded` 가 말한다.
- **포커스 링은 그리지 않는다**([DS-D-0074](../governance/decisions/DS-D-0074-focus-ring-removed.md)).
  `base.css` 의 한 규칙이 링을 지우고 강제 색에서만 `Highlight` 링을 세운다.
- `sm`(24)은 WCAG 2.2 AA 의 24×24 를 만족하고 AAA(44)에는 미달한다 — `TextField` 의 sm 과 같은
  알려진 편차이며, 편집 표면의 도구 줄에서만 쓴다.
- 캐럿 회전은 `prefers-reduced-motion` 에서 지속시간을 줄인다. 회전 자체는 남는다 — 그것이
  상태를 말하는 유일한 시각 신호이기 때문이다.

## Specification

값의 정본은 `figma/components.measured.json` 의 `select` 칸이고, 각 값의 사유를 `$` 주석이 갖는다.

| Part/state | Token or recipe | 구현 근거 |
| ---------- | --------------- | --------- |
| 트리거 높이 md | `layout-control-height-md` | 32. Gnb 프로필 언어 · ComposerBar 모델 |
| 트리거 높이 sm | `layout-control-height-sm` | 24. VideoEditModal 프리뷰 줌 칩 |
| 트리거 높이 lg | `layout-control-height-lg` | 40. 어드민 선택 필드(`AdminSection.tsx:100-103`) — TextField lg 와 같은 칸 |
| 곡률 md · sm · lg | `radius-control` · `radius-control-sm` · `radius-control` | 12 · 8 · 12 |
| 좌우 여백 md | `space-control-md` | 12 · 12 (대칭) |
| 좌우 여백 sm | `space-control-sm` · `space-overlay-inset` | 8 · 6 (비대칭) |
| 좌우 여백 lg | `space-control-lg` | 16 · 16 (대칭) |
| 간격 md · sm · lg | `space-overlay-item-content-gap` · `space-control-xs` · `space-control-sm` | 6 · 4 · 8 |
| 값 글자 md · sm · lg | `typography-caption-regular` · 같음 · `typography-body-sm-regular` | lg 만 body-sm — 옆 TextField lg 의 값 글자와 맞춘다 |
| 글리프 md · sm · lg | `icon-size-md` · `icon-size-sm` · `icon-size-md` | 20 · 16 · 20 |
| 캐럿 | `--louis-select-caret-size` | 12. 아이콘 사다리 밖이라 지역 변수가 이름을 갖는다 |
| 경계 | `hairline-inset` | 0.5 inset. border 가 아니다 ([DS-D-0023](../governance/decisions/DS-D-0023-hairline-inset.md)) |
| Default 면 · 잉크 | `color-bg-inset` · `color-fg-primary` | 면 사다리의 inset 칸 |
| Hover · Open 면 | `color-accent-secondary-hover` | 12%. Button secondary 와 같은 토큰 |
| Disabled 잉크 | `color-fg-disabled` | 면은 움직이지 않는다 |
| Placeholder 값 잉크 | `color-fg-tertiary` · 꺼지면 `color-fg-disabled` | 입력칸의 placeholder 와 같은 잉크. 상태 가드가 꺼진 트리거를 빼서 `fg-disabled` 상속이 이긴다 |
| 검색줄 아래 여백 | `space-control-xs` | 4. 패널의 항목 간격(2)보다 넓어야 헤더로 읽힌다 |
| 결과 없음 행 | 항목 행과 같은 여백·곡률 + `color-fg-secondary` | 새 값이 없다 |

## Acceptance tests

값의 정본은 `figma/components.measured.json` 의 `select` 이고 두 방향이 그것을 되잰다 —
Figma 쪽은 `verify-figma-parity`, 코드 쪽은 `packages/react/test/select.browser.test.tsx`
가 실브라우저 계산값으로 잰다. 시험은 값을 자기 파일에 적지 않고 그 기록에서 읽어 대조한다.
`surface-states.browser.test.tsx` 의 「states 표를 코드가 빠짐없이 읽는다」 래칫이 이 파일을
`select` 의 담당으로 셈하므로, 네 상태를 하나도 빠뜨릴 수 없다.

두 칸(`md` · `sm`) 각각에서. `lg`(2026-10-13)는 measured 기록에 칸이 아직 없어 되재지 않는다 — 기록에 칸이 서면
같은 세 항목을 세 칸에서 잰다.

1. 높이 · 위아래 여백 · 간격 · 테두리 두께 · 반경 · 글자 크기 · 행간이 계약과 같다.
2. **시작 여백과 끝 여백을 따로 잰다.** `sm` 이 시작 8 · 끝 6 으로 갈리므로 한 칸으로 접으면
   그 비대칭이 어느 쪽으로 무너져도 초록이다.
3. 글리프가 계약의 치수(`md` 20 · `sm` 16)이고, **캐럿은 두 칸 모두 12** 다 — 크기 축을 따라
   줄지 않는 것이 계약이라 두 번 잰다.

전체에서.

4. 네 상태가 각각 계약이 **지목한 토큰의 값**을 문다. `Hover` 는 면에 전이가 걸려 있어
   계산값을 폴링해 목표색에 도달하는지 본다 — 즉시 읽으면 보간 중인 `oklab(...)` 이 잡힌다.
   `Open` 은 **hover 없이** 열어 잰다. 포인터가 패널로 넘어간 상황이 그것이기 때문이다.
5. `Disabled` 가 면을 `Default` 와 같게 두고 잉크만 내리며 커서가 `not-allowed` 다.
6. **값이 남는 폭을 먹고 캐럿은 끝에 남는다.** 캐럿 오른끝이 트리거 오른끝에서 끝 쪽 여백만큼
   안쪽에 서는지 잰다 — 값이 오므라들면 캐럿이 값 옆에 붙어 상자 가운데에 떠 버리고, 그것이
   폭 고정된 자리에서 실제로 일어나는 사고다.
7. 열린 트리거의 캐럿 `transform` 이 `matrix(-1, 0, 0, -1, 0, 0)` 이다 — 문자열이 아니라
   행렬로 보는 이유는 브라우저가 `rotate()` 를 그렇게 계산해 돌려주기 때문이다.
8. **placeholder 네 칸**(measured `states.placeholder`)이 값 요소의 계산색으로 계약 토큰을 문다 —
   트리거가 아니라 값 요소에서 재는 이유는 규칙이 값 요소에 직접 색을 주기 때문이다. 꺼진 칸이
   `fg-disabled` 인지가 요점이다. 상태 가드를 걷으면 이 단언이 빨개지는 것을 확인했다(2026-10-08).

Figma 쪽에서는 `rawFills` · `rawStrokes` 가 0 이고 `textUnstyled` 가 0 이다 — 열여섯 변형의 면 ·
잉크 · 헤어라인 · 글자가 전부 변수와 텍스트 스타일에 물려 있다.

## Known deviations

1. **제품 아홉 자리가 서로 갈려 있다.** 높이 다섯 종(24 · 28 · 32 · 36 · 내용) · 곡률 넷
   (8 · 10 · 12 · 알약)이 한 컴포넌트에서 나온다. 계약은 사다리 위의 두 칸만 열었고, 나머지는
   채택 회차가 그 두 칸으로 모은다. 표는 DS-D-0053 이 갖는다.
2. **`sm` 의 글리프 16 은 실측이 아니라 사다리 유도값이다.** 앵커의 sm 자리에는 선행 글리프가
   없어 잴 것이 없었다. 실측이 생기면 고친다.
3. **`app/aws/signup` 의 36×36 은 Select 트리거가 아니다.** 캐럿이 없고 값 라벨을 `hidden` 으로
   숨긴 정사각이라, 그 자리는 IconButton 이 여는 목록이다. 채택 절차서가 그렇게 적는다.
4. **결과 없음 행은 Figma 에 없다.** 새로 고정할 치수가 하나도 없기 때문이다 — 항목 행과 같은
   여백·같은 곡률을 쓰고 잉크만 보조색으로 내린다. 그 값들은 `menu-popover` 의 `panel` 칸이
   이미 pin 하고 있고, 여기에 set 을 하나 더 세우면 같은 수를 두 곳이 갖게 된다.
5. **placeholder 상태는 늦게 섰다.** 처음에는 제품 아홉 자리 전부 값이 항상 있어 세우지 않았다. 제품
   하이라이트 새 화면이 주제 · 종목 Select 에 값 없는 상태를 만들어 2026-10-07 에
   `.louis-select-trigger__value[data-placeholder]` 를 열었고, 2026-10-08 에 Figma `Placeholder` 축을 세웠다.
   그때 CSS 가 꺼진 빈 트리거의 값을 `fg-tertiary` 로 그리던 것을 함께 고쳤다 — 규칙이 값 요소에 직접 색을 주어
   트리거의 `fg-disabled` 상속을 덮었고, 다크에서는 `fg-tertiary` 가 더 밝아 꺼진 것이 켜진 것처럼 읽혔다.
   **Figma 의 `Placeholder=true` 칸은 표본 문구가 `Value` 프로퍼티 기본값(「한국어」)과 같다** — TEXT 프로퍼티는 set 에
   기본값이 하나라 칸마다 안내 문구를 따로 둘 수 없다. 인스턴스에서 안내 문구로 바꿔 쓴다.
6. **트리거에 `justify-content: space-between` 을 두지 않는다.** 값이 남는 폭을 먹는 이상 그
   선언은 한 번도 적용되지 않는 죽은 값이고, Figma 에는 그릴 자리가 없어 두 곳이 어긋나 보인다.
7. **lg 의 캐럿과 빈 값 잉크가 제품과 다르다.** 제품 어드민은 캐럿 10 · 잉크 56%, 빈 값 48% 알파
   (`app/admin/AdminSection.tsx:108-109`)이고 문의 화면은 캐럿 16(`app/inquiry/InquiryClient.tsx:546`)이다.
   레시피는 크기마다 캐럿 12 · 트리거 잉크, 빈 값 `fg-tertiary` 로 접었다(2026-10-13 판정).
8. **문의 화면은 lg 가 아니라 48 이다.** 같은 줄의 입력칸까지 `min-h-24`(48)로 덮은 화면이라
   (`app/inquiry/InquiryClient.tsx:175`) 트리거만 lg 로 내리면 줄이 어긋난다. **48 칸은 열지 않는다(2026-10-13 판정)** —
   화면 전체(트리거와 입력칸의 `min-h-24`)를 lg 40 으로 내리는 것은 제품 쪽 일이다. 제품 주석(`InquiryClient.tsx:162-170`)의
   「md 40 · lg 48」은 틀렸다 — LOUIS md 는 32, lg 는 40 이다.

## Implementation

- Web source: `packages/css/src/component/select.css`
- Public import: 없음 — React 표면이 아직 없다. 마크업은 `.louis-select-trigger` 를 직접 문다.
- Figma component: `SelectTrigger` (`DS · Components`)
- Tests/visual evidence: `packages/react/test/select.browser.test.tsx`
- Record: `figma/components.measured.json` 의 `select`
