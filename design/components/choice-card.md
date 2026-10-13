---
id: choice-card
status: experimental
authority: normative
summary: 한 질문의 선택지를 카드나 행으로 늘어놓고 하나 또는 여럿을 고릅니다.
---

# Choice Card

한 질문의 선택지를 **카드나 행 하나씩**으로 늘어놓고 하나(`radio`) 또는 여럿(`checkbox`)을 고른다.
이름 · 설명과 선택 표식을 담는다.

| 항목 | 값 |
| --- | --- |
| Figma | `partial` — component set `ChoiceCard`(2026-10-08, 42 변형). 되읽기 · parity 계약은 있고 기하를 되재는 브라우저 시험이 없다 |
| 코드 | CSS recipe `.louis-choice-group` · `.louis-choice-card` ([`choice-card.css`](../../packages/css/src/component/choice-card.css), 2026-10-07). React 표면은 없다 |

## 왜 있는가

2026-10-07 제품 감사에서 **같은 것을 제품의 두 작업 브랜치가 서로 모르고 두 번 짠 것**이 확인됐다. LOUIS 에는
둘 다 덮는 레시피가 없었다 — [Checkbox](checkbox.md) 는 한 칸짜리 표식이고, [Selectable List Row](selectable-list-row.md)
는 master-detail 의 한 선택(`aria-current`)이며, [Segmented Control](segmented-control.md) 은 짧은 이름의 탭형 전환이다.
제품 주석이 스스로 「LOUIS 에 이런 행 라디오 그룹 레시피가 없어 기존 토큰으로 조립한다」고 적었다.

| 출처 | 쓰는 자리 | 반복 |
| --- | --- | --- |
| 2026-10-07, 제품 `feat/ambassador-links` `ApplyFlow.tsx@2ceec4ed3:94-157` (@ecc10e468, 상태 분리 @071ad2b40) | 앰배서더 지원서 — 한 화면에 질문 하나를 크게 묻는다 | 하나만 고르는 질문 네 곳, 여럿 고르는 질문 두 곳 |
| 2026-10-07, 제품 `codex/actionable-product-metrics` `ResearchOnboarding.tsx@e80c86ee7:77` (@39c0ef1c2) | 지표 온보딩 설문 — 한 단계의 선택지를 한 열로 쌓는다 | 같은 설문의 선택지 일곱, 칩형(4a9739b77)에 이어 행형으로 두 번째 재작성 |

두 호출부가 **실제로 낸 결함**이 하나 있다. 기본 헤어라인 · 선택 링 · 오류 링이 전부 `box-shadow` 를 노리는데 셋을 같은
요소에 함께 적자, 이기는 쪽을 클래스 순서가 아니라 **생성된 스타일시트 순서**가 정해 오류 링이 헤어라인에 졌다 — 다른 여덟
칸은 빨간 링을 띠는데 카드 하나만 평소 모습이었다(제품 `071ad2b40`, 캡처로 확인). 레시피가 이 규칙을 소유한다(아래 Implementation).

## 한 컴포넌트, 변형 둘

두 호출부의 공통 재료와 갈리는 값을 가르면 이렇다.

| 항목 | 같다 / 갈린다 | 카드형 (`card`, 기본) | 행형 (`row`) |
| --- | --- | --- | --- |
| 역할 · 선택 소유 | 같다 | `role="radio"` · `"checkbox"`, `aria-checked` | 같다 |
| 로빙 tabindex · 방향키 | 같다 | 마크업의 몫(접근성 절) | 같다 |
| 오류 링 · box-shadow 한 줄 규칙 | 같다 | 아래 | 같다 |
| 쉬는 면 | 거의 같다 | 제품 `--panel`(landing-panel 4%) | `accent-secondary`(잉크 8%) — **LOUIS 는 둘 다 이것** |
| 호버 | 거의 같다 | 제품 `--panel-strong` | `accent-secondary-hover`(12%) — **LOUIS 는 둘 다 이것** |
| **고른 것** | **갈린다** | 면 `accent-secondary-selected` + 2px `accent-primary` 링 | 면 `accent-inverse` + 글자 `fg-on-accent-inverse` |
| 선택 표식 | 갈린다 | 있다(원 · 사각 24 / compact 20) | 없다 — 면 뒤집힘이 표식이다. 둘 수는 있다 |
| 반경 | 갈린다 | 16 / compact 12 | 12 |
| 높이 | 갈린다 | 내용이 정한다(안쪽 여백 28 · 32) | 최소 44 |
| 이름 타이포 | 갈린다 | body-lg-semibold(20/600) / compact body-md-medium(16/500) | body-md-medium(16/500) |

**갈리는 것은 「고른 면을 어떻게 말하느냐」 하나다.** 나머지는 골격이 같으므로 컴포넌트를 둘로 나누지 않고
`data-variant="card"`(기본) · `"row"` 로 묶었다. 선택 표현이 갈린 이유는 쓰임이 갈렸기 때문이다 — 카드는 한 화면에 선택지
둘 셋을 크게 늘어놓아 **링으로 테두리를 짚는** 쪽이 자연스럽고, 행은 일곱 줄을 촘촘히 쌓아 **어느 줄이 켜졌는지 면의 명암으로
읽히는** 쪽이 자연스럽다.

**두 표현을 둘 다 둔다 — 소유자 결정(2026-10-07).** 카드형은 링, 행형은 뒤집기로 변형마다 다르게 두고 하나로 합치지
않는다.

**셋째 변형 `list`(2026-10-13).** 통합 판의 앰배서더 지원서가 카드형을 버리고 면 없는 줄 목록으로 바뀌었다 — 고르면 면은 그대로
두고 앞에 선 표식만 채운다. 아래 「줄 목록」.

## Availability

| Surface | 상태 | 근거 |
| --- | --- | --- |
| Web | `not-ready` | CSS recipe 만 있다. React 표면 · 실브라우저 acceptance test · 제품 소비 증거 없음 |
| Figma | `partial` | component set `ChoiceCard`(DS · Components 「2 · 입력」, 2026-10-08). 되읽기 등재 + parity 계약(축 · 효과 · 기하 다섯 칸)이 있다. 기하 기록은 레시피 선언이고(verify-recipe-record 가 맞댄다) 2026-10-13 부터 `packages/react/test/choice-card.browser.test.tsx` 가 다섯 칸을 계산값으로 되잰다 — DS-D-0035 (c) 조건은 서고 `done` 승격 판정이 남았다 |
| Documentation | `partial` | 이 문서. 제품이 이 클래스를 물고 acceptance test 가 서면 `done` |
| Maturity | `experimental` | 레시피와 문서가 처음 선다. 승격 조건은 되재기(Acceptance tests)가 서고 제품이 이 클래스를 무는 것이다 |

## When to use

- **한 질문의 선택지가 둘에서 일고여덟**이고, 각 선택지에 이름(과 한두 줄 설명)이 있어 **글자 한 줄 칩으로는 모자랄 때.**
  - 카드형: 설명이 붙는 선택지, 한 화면에 질문 하나를 크게 묻는 폼.
  - 행형: 이름만 있는 선택지를 한 열로 쌓는 목록, 설문 단계.
- 하나만 고르면 `role="radiogroup"` + `role="radio"`, 여럿을 고르면 `role="group"` + `role="checkbox"`.

쓰지 않는 자리.

- **선택지가 짧은 이름 둘 셋이고 한 줄에 놓일 때.** 그것은 [Segmented Control](segmented-control.md)이다.
- **목록에서 하나를 골라 옆의 내용이 바뀔 때(master-detail).** 그것은 [Selectable List Row](selectable-list-row.md)이고
  선택을 `aria-current` 가 갖는다.
- **한 줄짜리 동의 · 설정 하나를 켜고 끌 때.** 그것은 [Checkbox](checkbox.md) 또는 [Switch](switch.md)다.
- **값이 많아 접어야 할 때.** 그것은 [Select](select.md)다.
- 메뉴 항목. 그것은 [Menu / Popover](menu-popover.md)다.

## Anatomy

1. **Group** — `<div class="louis-choice-group" role="radiogroup" | "group" aria-label>`. 항목을 세로로 쌓고, `data-columns="auto"` 면
   칸 폭 148 이상으로 여러 열을 채운다.
2. **Item** — `<button type="button" class="louis-choice-card" role="radio" | "checkbox" aria-checked>`. **항목 전체가 컨트롤이다.**
3. **Text** — `.louis-choice-card__text`. 이름과 설명을 세로로 담는다.
   - **Label** — `.louis-choice-card__label`. 선택지 이름.
   - **Description** — `.louis-choice-card__description`. 선택지 설명(선택).
4. **Marker** — `.louis-choice-card__marker`(`aria-hidden`). 선택 표식. 모양은 항목의 `role` 이 정한다 — `radio` 는 원,
   `checkbox` 는 반경 6 의 사각. 행형은 보통 두지 않는다. 줄 목록은 줄 **앞**에 20 으로 선다.
5. **Message** — 오류 문구. 이 레시피가 아니라 [FormMessage](form-message.md)가 소유한다.

```html
<div class="louis-choice-group" role="radiogroup" aria-label="협업 유형" aria-invalid="true" data-invalid>
  <button type="button" class="louis-choice-card" role="radio" aria-checked="false" tabindex="0">
    <span class="louis-choice-card__text">
      <span class="louis-choice-card__label">영상 제작</span>
      <span class="louis-choice-card__description">짧은 영상을 직접 만들어 올려요</span>
    </span>
    <span class="louis-choice-card__marker" aria-hidden="true"></span>
  </button>
  <!-- … -->
</div>
```

## Properties

React 표면이 없어 속성은 마크업 속성이다.

| 속성 | 자리 | 값 | 기본 | 뜻 |
| --- | --- | --- | --- | --- |
| `data-variant` | Item · Group | `card` · `row` · `list` | `card` | 고른 면을 말하는 방식. **Group 에도 같은 값을 단다** — 간격이 갈린다(카드 12 · 행 8 · 줄 목록 0 + 위 헤어라인) |
| `data-size` | Item · Group(`list` 만) | `md` · `sm` | `md` | `sm` 은 compact — 한 줄 이름만 있는 작은 칸. 카드는 반경 12 · 안쪽 여백 20 · 24 · 표식 20. 줄 목록은 반경 8 · 12 · 8 · 선 없음이고 **묶음에도 단다** — 2열(560 이상 3열) |
| `data-columns` | Group | `auto` | 한 열 | 칸 폭 148 이상으로 여러 열을 채운다. compact 카드를 쓸 때 |
| `aria-checked` | Item | `true` · `false` | 필수 | **선택의 유일한 소유자.** 시각 전용 속성을 따로 두지 않는다 |
| `data-invalid` | Item · Group | 있으면 오류 | 없음 | `"false"` 만 예외다([DS-D-0075](../governance/decisions/DS-D-0075-text-field-invalid-ring.md) 2항과 같은 규칙) |
| `disabled` | Item | boolean | `false` | 비활성. 투명도 0.4 |

## States

| state | 카드형 | 행형 | 줄 목록 |
| --- | --- | --- | --- |
| Rest | 면 `accent-secondary`, 헤어라인 `stroke-hairline`(0.5px), 글자 `fg-primary` | 면 `accent-secondary`, 헤어라인, 글자 `fg-secondary` | 면 없음, 아래 헤어라인(compact 는 없음), 글자 `fg-primary` |
| Hover | 면 `accent-secondary-hover`. **고른 항목에는 걸지 않는다** | 같다 | 면 `gray-000-alpha-04`. **고른 줄에도 건다** — 면이 고름을 말하지 않는다 |
| Selected | 면 `accent-secondary-selected` + `border-width-ring`(2px) `accent-primary` 링. 표식이 주색으로 찬다 | 면 `accent-inverse`, 글자 `fg-on-accent-inverse`. 헤어라인은 쉴 때 것을 그대로 둔다 | **표식만** 주색으로 찬다. 면 · 선은 그대로다 |
| Invalid | **고르지 않은** 항목에 `border-width-ring` 의 `fg-danger-on-surface` 링 한 줄 | 같다 | 같다 — 고르지 않은 줄의 아래 선이 링으로 바뀐다 |
| Disabled | 투명도 0.4, `cursor: not-allowed`, hover 없음 | 같다 | 같다 |
| Focus | **그리지 않는다**(DS-D-0074). 강제 색에서만 `Highlight` 링 | 같다 | 같다 |

**오류 링은 [DS-D-0075](../governance/decisions/DS-D-0075-text-field-invalid-ring.md)(TextField 오류 = ring 두께의
`fg-danger-on-surface`)와 같은 값이다.** 입력칸과 선택 카드가 한 폼에 섞여도 틀린 곳이 같은 말로 보인다.

## 줄 목록 — `data-variant="list"`

면 없이 **선으로 가른 줄**에 선택지를 늘어놓는다(앰배서더 지원서, 2026-10-13 [DS-D-0084](../governance/decisions/DS-D-0084-product-parts-become-louis.md)).
표식(원 · 사각 20)이 줄 **앞**에 서고, 고르면 표식만 주색으로 채운다 — 줄의 면은 바뀌지 않는다. 묶음 위 · 줄마다 아래에 헤어라인.

정본은 제품 통합 판 `components/landing/sections/ambassador/ApplyFlow.tsx:102-171`(`<Choice` 1파일 6자리)이다. 통합 판의
`Choice` 는 카드형을 버리고 이 줄 목록만 쓴다 — 위 「왜 있는가」 표의 카드형 출처는 `feat/ambassador-links` 시절 값이다.

```html
<div class="louis-choice-group" data-variant="list" role="radiogroup" aria-label="활동 채널">
  <button type="button" class="louis-choice-card" data-variant="list" role="radio" aria-checked="true" tabindex="0">
    <span class="louis-choice-card__text">
      <span class="louis-choice-card__label">유튜브</span>
      <span class="louis-choice-card__description">긴 영상과 쇼츠를 올려요</span>
    </span>
    <span class="louis-choice-card__marker" aria-hidden="true"></span>
  </button>
  <!-- … -->
</div>
```

| 부분 | card | row | list |
| --- | --- | --- | --- |
| 쉬는 면 | `accent-secondary` + 헤어라인 | `accent-secondary` | 없음 · 아래 헤어라인 |
| 호버 | `accent-secondary-hover` | 같음 | `gray-000-alpha-04`(고른 줄에도) |
| 고름 | 올린 면 + 2px 링 | inverse 면 | 표식만 채움 |
| 표식 | 뒤 · 24(sm 20) | 없음 | **앞** · 20 |
| 여백(세로 · 가로) | 28 · 32 | 8 · 16 | 20 · 8(sm 12 · 8, 반경 8, 선 없음) |

`data-size="sm"` 은 한 줄 이름만 있는 칸을 2열(560 이상 3열, 열 사이 16 · 줄 사이 0)로 깐다 — 묶음에도
`data-variant="list" data-size="sm"` 를 준다. 마크업 순서는 card 와 같고(이름 묶음 → 표식) CSS `order` 가 표식을 앞으로 옮긴다 —
표식은 `aria-hidden` 이라 읽는 순서와 무관하다.

**쓰는 자리:** 한 화면에 질문 하나를 크게 묻는 폼에서, 면이 겹겹이 쌓이면 무거운 자리(모달 안 지원서).

**Figma 는 2026-10-13 에 섰다.** 세트 `ChoiceCard` 의 `Variant` 에 `list` 를 더했다 — `list` × `Size`(md · sm) × `Role` × 쉼 · 호버 · 비활성 ·
오류 쉼 · 호버 · 고름 쉼 · 호버 · 비활성 32 칸(레시피가 고른 줄에도 호버를 걸고 오류 링을 가져 card · row 보다 넓다). 표식이 앞에 서는 프레임이다
(자식 순서가 바뀐다, §2 시험 2). 기록 `choice-card` 의 `list/md` · `list/sm` 칸(2026-10-13)을 parity 가 대조하고, 다섯 칸 모두를
실브라우저 시험(`packages/react/test/choice-card.browser.test.tsx`)이 클래스 마크업의 계산값으로 되잰다.

## Interaction and responsive behavior

- 항목 어디를 눌러도 선택된다. 항목이 버튼이기 때문이다. 항목 안에 다른 버튼을 넣지 않는다.
- **하나만 고르는 묶음(`radiogroup`)은 로빙 tabindex 다.** Tab 은 묶음에 한 번만 멈춘다.
  - 고른 항목이 있으면 그 항목만 `tabindex="0"`, 나머지는 `-1`.
  - 고른 항목이 없으면 **첫 항목만** `tabindex="0"`.
  - 방향키(↓ → 다음, ↑ ← 이전, 끝에서 처음으로 돌아 감)가 포커스를 옮긴다. APG 의 radio 계약은 방향키가 **포커스와
    선택을 함께** 옮기는 것이다. 제품 지원서는 고르면 곧바로 다음 질문으로 넘어가는 칸이라 방향키가 **포커스만** 옮기고 선택은
    Space 나 Enter 로 하게 했다 — 선택이 화면 전환을 일으키면 그 편이 맞지만 그것은 호출부의 사정이므로 편차에 적었다.
- **여럿 고르는 묶음(`group` + `checkbox`)은 항목마다 Tab 정지**다(`tabindex="0"`). 로빙이 아니다 — 각각이 독립된 체크다.
- 항목이 눌려 선택이 바뀌는 순간 `aria-checked` 가 바뀐다. 면 · 링 · 표식은 CSS 가 따라간다.
- 전환은 160ms(`motion-control-hover`)이고 reduced-motion 에서는 `motion-reduced-duration`(0ms)이다.
- 반응형: 카드형은 한 열이 기본이고, compact 는 `data-columns="auto"` 로 칸 폭 148 이상을 채워 열 수가 폭을 따른다.
  행형은 폭과 무관하게 **한 열**이다 — 한 줄에 몇 개가 서는지가 폭마다 달라지면 목록으로 읽히지 않는다(제품 주석).
  줄 목록은 한 열이고, compact(`sm`)만 2열 → 560 이상 3열이다(제품 `grid-cols-2 min-[560px]:grid-cols-3`). 560 은 레이아웃 경계
  (719 · 1023) 밖의 값이다 — 한 줄 이름 셋이 들어가는 최소 폭.
- 설명이 길면 줄바꿈으로 항목이 늘어난다. 말줄임을 쓰지 않는다 — 선택지의 뜻이 잘리면 고를 수 없다.

## Content

- 이름은 그 선택지를 **구별하는 것**이다. 한 줄을 넘기지 않는다. 설명은 할 일이나 대상만 한두 줄로 적는다(제품 사전:
  「질문은 「~신가요?」, 설명은 할 일만」).
- 질문 문구는 묶음의 `aria-label`(또는 묶음을 가리키는 보이는 제목)이 갖는다. 항목 이름에 질문을 반복하지 않는다.
- 오류 문구는 FormMessage 가 갖고 **무엇을 고르라는지** 말한다(「하나를 골라 주세요」).
- 복수 선택이면 질문 근처에 「여러 개 고를 수 있어요」 같은 안내를 한 줄 둔다(제품 온보딩 `MULTI_HINT`).

## Accessibility

- **이름 · 역할 · 상태.** 묶음은 `role="radiogroup"`(하나) 또는 `role="group"`(여럿)이고 `aria-label` 또는 `aria-labelledby` 를
  갖는다. 항목은 `role="radio"` 또는 `"checkbox"` 이고 **`aria-checked` 가 선택을 소유한다.** 항목 이름은 라벨(과 설명)이다.
- **오류는 색 하나로만 알리지 않는다.** 링 위에 ① 오류 문구, ② `aria-invalid="true"`(`radiogroup` 에 단다 — ARIA 가 그 역할에
  지원한다), ③ 문구를 `role="alert"` 로 알리고 묶음의 `aria-describedby` 가 가리킨다. **`role="group"` 은 `aria-invalid` 를
  지원하지 않으므로** 여럿 고르는 묶음은 ①과 ③ 으로 알린다.
- **선택도 색 하나로만 알리지 않는다.** 카드형은 링 + 표식(체크)이, 행형은 면의 명암 뒤집힘(밝은 면 ↔ 검은 면)이 함께 말한다.
  줄 목록은 표식의 채움 + 체크가 말한다.
- 표식은 `aria-hidden` 장식이다. 상태는 `aria-checked` 가 전한다.
- **누름 영역 44px 이상.** 행형은 `layout-control-hit-target-minimum`(44)이 최소 높이이고, 카드형은 안쪽 여백이 이미 넘는다.
- 키보드: 위 Interaction 의 로빙 규칙. Space 가 선택(복수는 토글)한다. 버튼이므로 Enter 도 같다.
- forced-colors: 면 · 링이 시스템 색으로 치환되므로 항목 경계를 `currentColor` 실선으로 되살리고, 고른 항목은 `Highlight` 의
  안쪽 윤곽을 더 그린다. 포커스 링은 바깥쪽 `Highlight` 로 따로 서서 선택 윤곽과 겹치지 않는다(selectable-list-row 와 같다).
- 비활성은 `disabled` 를 쓴다. 비활성 항목은 로빙 순서에서 건너뛴다.

## Specification

| 축 | 카드 | compact 카드 | 행 | 토큰 |
| --- | ---: | ---: | ---: | --- |
| 안쪽 여백(가로 · 세로) | 32 · 28 | 24 · 20 | 16 · 8 | 카드는 — (계단 밖), 행은 `space-control-lg` · `space-control-sm` |
| 이름과 표식 사이 | 24 | 16 | 16 | 카드 — (계단 밖), 나머지 `space-control-lg` |
| 반경 | 16 | 12 | 12 | 카드 16 은 리터럴, 나머지 `radius-card` |
| 최소 높이 | 내용 | 내용 | 44 | `layout-control-hit-target-minimum` |
| 항목 사이 | 12 | 12 | 8 | `space-control-md` · `space-control-sm` |
| 이름 타이포 | 20/600 | 16/500 | 16/500 | `typography-body-lg-semibold` · `typography-body-md-medium` |
| 설명 타이포 | 16/400 | 16/400 | 16/400 | `typography-body-md-regular` |
| 이름과 설명 사이 | 4 | 4 | 4 | `space-stack-xs` |
| 표식 | 24 | 20 | (없음) | — |
| 표식 반경 | 원 · 6 | 원 · 6 | — | `radius-pill` · 6 은 리터럴 |
| 쉬는 면 | `accent-secondary` | 같다 | 같다 | |
| 호버 면 | `accent-secondary-hover` | 같다 | 같다 | |
| 고른 면 | `accent-secondary-selected` | 같다 | `accent-inverse` | |
| 고른 링 | 2px `accent-primary` | 같다 | 없다 | `border-width-ring` |
| 오류 링 | 2px `fg-danger-on-surface` | 같다 | 같다 | `border-width-ring` |
| 전환 | 160ms | 같다 | 같다 | `motion-control-hover-*` |

줄 목록(`list`)의 값은 따로 적는다.

| 축 | 줄 | compact 줄 | 토큰 |
| --- | ---: | ---: | --- |
| 안쪽 여백(가로 · 세로) | 8 · 20 | 8 · 12 | `space-control-sm` · 20 리터럴(제품 `py-10`) · `space-control-md` |
| 표식과 이름 사이 | 16 | 16 | `space-control-lg` |
| 반경 | 0 | 8 | `radius-control-sm` |
| 선 | 아래 헤어라인 · 묶음 위 헤어라인 | 없음 | `hairline-inset-block-end` · `hairline-inset-block-start` |
| 항목 사이 | 없음(줄이 맞닿는다) | 열 16 · 줄 0 | compact 열 `space-control-lg` |
| 열 | 1 | 2 → 560 이상 3 | 560 리터럴(제품 `min-[560px]`) |
| 이름 타이포 | 20/600 | 16/500 | `typography-body-lg-semibold` · `typography-body-md-medium` |
| 표식 | 20 · 앞 | 20 · 앞 | — |
| 호버 면 | `gray-000-alpha-04` | 같다 | |
| 고름 | 표식만 | 같다 | `accent-primary` |

제품 간격 격자는 `--spacing: 2px` 라 `px-16` = 32px · `py-14` = 28px · `size-12` = 24px · `min-h-22` = 44px 다(곡률은 px
그대로다). **카드의 안쪽 여백(32 · 28 / 24 · 20), 이름과 표식 사이 24, 반경 16, 열 최소 폭 148, 표식 반경 6 은 토큰
계단에 없다.** 16 은 `radius-overlay` 와 값이 같지만 그것은 오버레이의 뜻이라 카드가 빌려 쓰면 오버레이 곡률을 바꿀 때 카드가
따라 움직인다 — 리터럴로 둔 사유다([Keycap](keycap.md)과 같다).

## Effects

없다. 그림자도 흐림도 쓰지 않는다. 링은 `box-shadow: inset` 이고 바깥 크기를 바꾸지 않는다.

## Implementation

**상태마다 `box-shadow` 를 한 줄만 붙인다.** 헤어라인 · 선택 링 · 오류 링이 같은 프로퍼티를 노리므로 같은 요소에서 두 선언이
맞붙으면 어느 쪽이 이기는지가 순서에 달린다. 레시피는 선언을 **서로 겹치지 않는 선택자와 특이도 사다리**로 가른다.

```
쉼 (0,1,0)  <  고름 카드 (0,3,0)  <  오류 — 항목에 단 것 (0,4,0) · 묶음에 단 것 (0,5,0)
```

- **오류는 고르지 않은 항목에만** 건다(`:not([aria-checked="true"])`). 고른 항목은 자기 링을 지킨다. 그래서 한 요소에서
  어떤 순서로도 두 줄이 맞붙지 않는다. 호출부가 같은 항목에 `box-shadow` 유틸리티를 더 얹지 않는다.
- 행형의 고른 항목은 `box-shadow` 를 다시 적지 않는다 — 쉬는 항목의 헤어라인이 그대로 남는다.
- 오류 선택자는 `data-invalid` 를 항목에 단 것과 묶음에 단 것 둘 다 받는다. `data-invalid` 는 **있으면** 오류다(DS-D-0075).

**선택은 `aria-checked` 가 갖고 표식의 모양은 `role` 이 갖는다.** 표식의 체크는 [Checkbox](checkbox.md)와 같은 구조(왼쪽 아래 두
변을 45도 돌림)로 CSS 가 직접 그린다 — 아이콘 자산을 CSS package 가 소비하지 않는다(DS-D-0008).

**두 호출부가 아직 이 클래스를 물지 않는다.** 제품은 자기 Tailwind 리터럴로 그린다.

## Figma

DS · Components 「2 · 입력」 구획의 component set `ChoiceCard`(2026-10-08). 항목 하나가 변형 하나이고 묶음(`.louis-choice-group`)은
component 가 아니다 — 묶음의 간격(카드 12 · 행 8)과 열 격자는 화면에서 오토레이아웃으로 놓는다.

| 축 | 값 | 코드 |
| --- | --- | --- |
| `Variant` | `card` · `row` | `data-variant` — 고른 면을 말하는 방식과 패딩 · 반경 · 이름 타이포가 갈린다 |
| `Size` | `md` · `sm` | `data-size`. 행형에는 `sm` 칸이 없다 — 레시피가 행의 패딩 · 반경 · 간격을 행 값으로 덮어 다른 기하가 나오지 않는다 |
| `Role` | `radio` · `checkbox` | 항목의 `role`. 표식의 모양(원 · 반경 6 사각)만 바꾼다. 행형은 표식이 없어 두 값의 그림이 같다 |
| `Checked` | `false` · `true` | `aria-checked` |
| `Invalid` | `false` · `true` | `data-invalid`(항목 또는 묶음). 고르지 않은 항목에만 선다 |
| `State` | `Default` · `Hover` · `Disabled` | 상호작용 상태. Focus 는 그리지 않는다(DS-D-0074) |
| `Label` · `Description` | 텍스트 | 이름 · 설명 |
| `HasDescription` | BOOLEAN | 설명 줄의 유무. 표본은 card/md 에만 설명 줄을 둔다 |

한 묶음(`Variant` · `Size` · `Role`)마다 일곱 칸이다 — 쉼 · 호버 · 비활성, 오류의 쉼 · 호버, 고름의 쉼 · 비활성. **고른 칸에는
`Hover` 가 없다** — 레시피가 고른 항목에 호버를 걸지 않아 면이 바뀌지 않는다(접기 시험: 고름이 호버를 흡수한다. 비활성에서는
0.4 로 달라지므로 `State` 로 접지 않았다). **오류와 고름을 곱하지 않는다** — 고른 항목은 오류 링 대신 자기 링을 지킨다.

링 · 헤어라인은 CSS 와 같이 inner shadow 한 겹이다(상태마다 `box-shadow` 한 줄, DS-D-0023). 체크는 checkbox 와 같은 구조의 벡터
(4 × 7 상자의 두 변, 획 2, 45°)다. 기하 계약은 `figma/components.measured.json` 의 `choice-card` 세 칸(`card/md` · `card/sm` ·
`row/md`)이 고정하고, 그 기록은 레시피 선언에서 왔다 — `verify-recipe-record` 가 레시피 ↔ 기록을 맞댄다.

## 제품이 이관할 때 달라지는 것

- **앰배서더 지원서 `Choice`(카드형).**
  - 쉬는 면 `--panel`(landing-panel, 잉크 4%) → `accent-secondary`(잉크 8%)로 **한 단계 진해진다.** 호버는 `--panel-strong`
    (불투명 inset 면)에서 `accent-secondary-hover` 로 바뀌어 **다크에서 호버가 어두워지던 것이 밝아진다.**
  - 전환 300ms → 160ms.
  - 표식 쉼 상태 테두리 1.5px → 헤어라인 0.5px([Checkbox](checkbox.md)와 같다). 눈에 덜 띄지만 선택은 링이 이미 말한다.
  - **오류 링이 지금 카드에 그려지지 않는다.** `ecc10e468` 의 `Choice` 는 `invalid` 를 묶음의 `aria-invalid` 에만 달고 카드에
    링을 건 클래스가 없다(같은 결함을 고친 `071ad2b40` 의 `TYPE_CARD_INVALID` 는 이전 `ApplyForm.tsx` 의 라디오 카드에 있었고 `ApplyFlow.tsx` 의 `Choice` 에는 같은 분기가 없다). 레시피를
    물면 묶음의 `data-invalid` 하나로 돌아온다.
  - 고른 링 `--primary-500` → `accent-primary`. 같은 값(blue-500)이다.
- **지표 온보딩 `OPTION`(행형).** 값이 그대로다 — 쉬는 면 · 호버 · 고른 면 · 글자색 · 반경 12 · 최소 44 가 레시피와 같다. 클래스
  문자열이 `.louis-choice-card[data-variant="row"]` 로 바뀌고, 고른 행에 붙이던 느낌표(`!`) 유틸리티 두 줄이 필요 없어진다(레시피가
  특이도로 이긴다). 전환은 제품이 이미 같은 `motion-control-hover` 토큰을 읽는다.
- 제품 문서 `docs/flows/admin-product-metrics.md:327`(`codex/actionable-product-metrics`)의 「LOUIS 레시피가 없어 조립했다」 메모는
  이 레시피를 물면 LOUIS 클래스 설명으로 바꾼다.

## 판정 필요

1. ~~고른 면의 표현을 하나로 합칠 것인가.~~ **닫았다 — 소유자 결정(2026-10-07): 카드형은 링, 행형은 뒤집기로 변형마다
   다르게 둔다.** 카드형(밝은 올린 면 + 2px 주색 링)과 행형(검은 면 뒤집기)은 쓰임(크게 · 촘촘하게)이 달라 각자의 시각 언어를
   갖는다. 통일하지 않으므로 어느 쪽 블록도 지우지 않는다.
2. **카드 안쪽 여백 32 · 28 이 의도인가.** 제품 간격 격자 2px 로 계산한 값이다. 토큰 계단(`space-control-lg` 16 이 최대)보다
   크다. 의도라면 토큰을 새로 낼지, 리터럴로 둘지(지금) 정한다.
3. 쉬는 면을 `accent-secondary` 로 닫은 것(앰배서더 쪽이 한 단계 진해짐)이 맞는가. 제품 `--panel` 은 `landing-panel` 이라는
   **랜딩 전용 토큰**이라 일반 컴포넌트가 읽지 않기로 했다.

## Known deviations

- **React 표면이 없다.** 묶음의 로빙 tabindex · 방향키 · `aria-checked` 토글은 마크업과 호출부가 직접 짠다(제품 `moveFocus` 가
  그 사례다). 표면이 서면 그 계약이 컴포넌트로 들어온다.
- **방향키가 포커스만 옮기는 호출부가 있다.** APG 는 방향키가 포커스와 선택을 함께 옮긴다. 제품 지원서는 선택이 곧 다음 질문
  전환이라 포커스만 옮긴다. 레시피는 어느 쪽도 강제하지 않는다.
- **표식의 쉼 테두리가 헤어라인(0.5px)이다.** 선택하지 않은 표식의 비텍스트 대비가 SC 1.4.11(3:1)에 미달한다 — Checkbox 의
  접근성 편차와 같은 원인이고([DS-D-0023](../governance/decisions/DS-D-0023-hairline-inset.md)) 같은 판정을 따른다. 카드형은
  링과 표식 체크가 선택을 따로 말하고, 오류 · 고름이 아닌 쉬는 항목의 경계는 면(`accent-secondary`)이 갖는다.
- **표식 사각의 반경이 6 이다.** [Checkbox](checkbox.md)는 `radius-control-sm`(8)이다. 제품 값(`rounded-6`)을 따랐다.
- **오류 링과 면의 대비를 이 문서에서 재지 않았다.** `fg-danger-on-surface` 가 `accent-secondary` 면 위에서 비텍스트 3:1 을
  넘는지는 실브라우저 acceptance test 가 서면서 잰다.
- **Figma 의 비활성 불투명도 0.4 는 게이트가 대조하지 않는다.** 되읽기 키가 `Variant/Size` 라 같은 키에 1 과 0.4 가 섞이고, 키에
  `State` 를 넣으면 같은 기하가 세 번 담긴다. 그 값은 이 레시피와 문서가 소유한다. 오류 링과 고른 링도 되읽기 문자열에 색이 없어
  두께(2)만 대조되고 색은 변수 바인딩(원시값 0)이 나른다.
- **Figma 의 `Role` 축은 행형에서 그림이 같다.** 행형은 표식이 없으므로 `radio` · `checkbox` 두 칸이 시각적으로 같다 — 묶음의 역할이
  마크업 계약이라 축은 남겼다.
- **줄 목록의 선이 제품보다 얇고 다크에서 옅다.** 제품은 1px `landing-line`(라이트 #171b22 12% · 다크 #fafafa 12%,
  `ApplyFlow.tsx:147` · `:162`)이고 레시피는 헤어라인(0.5 · 다크 8%)이다(DS-D-0023, 2026-10-13 판정).
- **줄 목록의 표식이 제품과 셋이 다르다.** 사각 반경 4(레시피 6), 쉼 테두리 1.5px(레시피 헤어라인), 원 고름의 흰 점 8(레시피는
  체크) — 원 · 사각 모두 같은 체크를 쓰는 기존 편차와 같은 칸이다(`ApplyFlow.tsx:106-116`). 호버에서 표식 테두리가 짙어지는 것
  (`--text-muted`)도 받지 않았다(2026-10-13 판정).
- **줄 목록의 호버 면이 라이트에서 순검정 4% 다.** 제품 `landing-panel` 은 #171b22 4% 이고 다크는 같다. 랜딩 전용 토큰을 일반
  컴포넌트가 읽지 않는다는 위 판정 3 과 같은 이유다.
- **`aria-invalid` 는 `role="group"` 에 쓸 수 없다.** 여럿 고르는 묶음의 오류는 문구와 `role="alert"` 가 맡는다(접근성 절).

## Acceptance tests

기하 되재기만 섰다(2026-10-13, `packages/react/test/choice-card.browser.test.tsx` — 기록 다섯 칸의 계산값과 줄 목록의 표식 자리).
아래 동작 · 상태 시험은 아직 없다. 서면 다음을 되잰다.

1. 쉬는 · 고른 · 오류 상태의 면 · 링이 States 표와 같다. **한 요소에서 `box-shadow` 가 상태마다 정확히 하나만 맞는다**(쉼 / 고름 /
   오류가 서로를 가리지 않는다).
2. 고른 항목에 `data-invalid` 가 걸려도 고른 링이 남는다. 고르지 않은 항목만 오류 링이다.
3. 호버가 고른 항목의 면을 바꾸지 않고, 비활성 항목에서는 면을 바꾸지 않는다.
4. `role` 이 `radio` 면 표식이 원, `checkbox` 면 반경 6 이다.
5. 라디오 묶음에서 Tab 이 한 번만 멈추고(로빙) 방향키가 포커스를 옮긴다. 체크박스 묶음은 항목마다 멈춘다.
6. 행형의 최소 높이가 44px 이다.
7. 두 테마(light · dark)에서 고른 면이 쉬는 면과 갈린다.
8. forced-colors 에서 항목 경계와 고른 항목의 윤곽이 서고, 고른 항목에 포커스가 들어도 포커스 링이 선다.
9. reduced-motion 에서 전환이 0ms 다.
10. 자동 접근성 검사에 위반이 없다.
11. 줄 목록에서 고른 줄의 면 · `box-shadow` 가 쉬는 줄과 같고 표식만 찬다. 표식이 이름 묶음보다 앞(왼쪽)에 선다. 호버가 고른 줄에도 선다.
12. 줄 목록 compact 묶음이 560 미만 2열 · 이상 3열이다.

## 다음

- [x] LOUIS CSS recipe 작성 (2026-10-07)
- [ ] 소유자 판정 — 「판정 필요」 2 ~ 3 (1 은 2026-10-07 에 닫았다)
- [ ] React 표면(`ChoiceGroup` · `ChoiceCard`) — 로빙 tabindex 와 `aria-checked` 를 컴포넌트가 소유할지 판정한다
- [ ] 실브라우저 acceptance test
- [ ] 제품을 그 recipe 로 이관(앰배서더 `Choice` · 온보딩 `OPTION`)
- [x] Figma component set `ChoiceCard` (2026-10-08) — 브라우저 되재기가 서면 `done` 판정
- [x] 줄 목록 변형 `data-variant="list"` CSS (2026-10-13) — Figma `Variant=list` 는 아직

## 출처

- 2026-10-07 — CSS recipe 신설. 두 소비처(`ApplyFlow.tsx@2ceec4ed3:94-157` · `ResearchOnboarding.tsx@b57cd1f95:77`)의 공통 재료를 한 컴포넌트로 묶고
  갈리는 값(고른 면의 표현)은 변형으로 두었다. 오류 링은 DS-D-0075 와 같은 값이다.
- 2026-10-13 — 줄 목록 변형 `data-variant="list"`(+ compact `sm`). 통합 판 `ApplyFlow.tsx:102-171` 의 `Choice` 가 카드형을 버리고
  쓰는 모양이다. 카드 고름 규칙의 제외 목록에 `list` 를 넣었다([DS-D-0084](../governance/decisions/DS-D-0084-product-parts-become-louis.md)).
- 2026-10-08 — Figma component set `ChoiceCard`(42 변형)와 parity 계약 · 되읽기 · 기록 `choice-card` 세 칸. 레시피의 패딩 선언을
  세로 · 가로 둘로 갈랐다(값은 같다 — `verify-recipe-record` 가 선언 하나를 수 하나로 읽는다).
