---
id: section-header
status: experimental
authority: normative
summary: 화면·묶음·패널의 머리. 제목 사다리 세 단과 설명·메타·액션 슬롯을 한 겹으로 싼다.
---

# Section Header

화면·묶음·패널의 맨 위에서 **여기가 무엇인지**를 말하고, 그 자리에서 할 수 있는 일을 오른쪽 끝에
모은다.

정본은 제품 `app/admin/AdminSection.tsx` 의 `AdminSectionHeader` 다(앵커 `5a67d692`). 어드민
콘솔은 사이드바 + **하나의 메인 카드**이고 탭마다 다른 컴포넌트가 그 카드 안에 그려지는데,
헤더·툴바·타일·빈 상태·배너·배지를 **열한 개 파일이 각자 private `const` 로 다시 만들어** 왔다.
그 파일이 여섯 가지를 한 번만 정의했고, 이 문서는 그중 머리 하나를 LOUIS 로 올린 것이다.

**호출 지점은 11 파일 17 자리다.**

| 파일 | 자리 | level |
| --- | ---: | --- |
| `app/admin/AdminClient.tsx` | 5 | page 2 · section 2 · label 1 |
| `app/admin/AdminSection.tsx` (`AdminPanel` 안) | 1 | section |
| `app/admin/BlogManagement.tsx` | 1 | page |
| `app/admin/CaptionTemplateManagement.tsx` | 2 | page 1 · section 1 |
| `app/admin/CouponManagement.tsx` | 2 | page 1 · section 1 |
| `app/admin/InquiryManagement.tsx` | 1 | page |
| `app/admin/JobMonitor.tsx` | 1 | page |
| `app/admin/ProductMetricsDashboard.tsx` | 1 | page |
| `app/admin/RefundManagement.tsx` | 1 | page |
| `app/admin/TemplateManagement.tsx` | 1 | page |
| `app/admin/UsageByModelDashboard.tsx` | 1 | page |
| **합** | **17** | page 11 · section 5 · label 1 |

**되풀이는 `/admin` 안에 갇혀 있지 않다.** 같은 조형이 `components/ui/PageHeader` 에도 있고
앱 허브 넷이 쓴다 — `HighlightScene` · `NodeCanvasHomeScene` · `VideoEditScene` ·
`admin/TemplateManagement`. 그 파일의 주석은 자기 값이 `page` 와 같다고 주장하는데, 그 주장을
실측으로 대조했고 **갈리는 자리는 하나였다**(아래 [Known deviations](#known-deviations) 1).

## Availability

| Surface       | 상태           | 근거                                                          |
| ------------- | -------------- | -------------------------------------------------------------- |
| Web           | `partial`      | `packages/css/src/component/section-header.css` 레시피와 실브라우저 acceptance test 16건. React 표면과 제품 소비 증거는 아직 없다 |
| Figma         | `done`      | `Level` 축 3변형의 component set(`SectionHeader`). 계약이 모든 property 를 pin 하고 세 칸(`page`·`section`·`label`)을 전부 대조하며 Text·Title·Description·Meta·Actions 를 자손으로 본다. 기하는 양방향이다 — `section-header.browser.test.tsx` 가 코드 쪽에서 같은 실측을 되잰다. 게시 없이 판정한다([DS-D-0035](../governance/decisions/DS-D-0035-figma-done-without-publish.md)) |
| Documentation | `done`         | 이 문서                                                        |
| Maturity      | `experimental` | 규범과 구현이 같은 변경 단위에서 처음 선다                     |

## When to use

- 화면 하나의 이름을 말할 때 (`page`).
- 카드나 패널 **안**에서 묶음의 이름을 말할 때 (`section`).
- 표·목록 바로 위에 「무엇의 목록인가」 한 줄이 필요할 때 (`label`).

쓰지 않는 자리.

- **모달의 제목.** `Dialog` 가 자기 머리를 갖는다 — 닫기 버튼과 포커스 관리가 거기 달려 있다.
- **앱 상단 바.** `AppTopBar` 의 자리다. 저쪽은 화면 이름이 아니라 **현재 위치**를 말한다.
- **빈 목록의 제목.** `EmptyState` 의 `title` 이다. 없는 것을 말하는 문장과 있는 것의 이름은
  다르다.

## API

React 표면이 없다. 소비처는 클래스를 직접 쓴다 — `alert` · `switch` · `tabs` 와 같다.

```html
<!-- 화면 제목 -->
<div class="louis-section-header" data-level="page">
  <div class="louis-section-header__text">
    <h1 class="louis-section-header__title">성과 지표</h1>
    <p class="louis-section-header__description">지난 기간과 견줘 무엇이 늘고 줄었는지 봅니다.</p>
    <p class="louis-section-header__meta">2026-08-08 ~ 2026-09-06 · 직전 동일 기간 대비</p>
  </div>
  <div class="louis-section-header__actions">
    <button class="louis-button" data-variant="secondary">새로고침</button>
    <button class="louis-button" data-variant="secondary">CSV</button>
  </div>
</div>

<!-- 카드 안 묶음 제목 -->
<div class="louis-section-header" data-level="section">
  <div class="louis-section-header__text">
    <h2 class="louis-section-header__title">생성 현황</h2>
  </div>
</div>

<!-- 패널 아이브로우 -->
<div class="louis-section-header" data-level="label">
  <div class="louis-section-header__text">
    <h3 class="louis-section-header__title">지급 결과</h3>
  </div>
</div>
```

**`__text` 를 생략하지 않는다.** 제목·설명·메타가 루트의 직계 자식이 되면 flex 자식이 넷이 되고,
액션 묶음이 「마지막 하나」가 아니게 된다 — 아래 [Anatomy](#anatomy) 의 이유가 그것이다.

## Anatomy

1. **Container** — 가로 flex 행. 교차축은 `flex-end` 다.
2. **Text** — 세로 stack. 제목·설명·메타를 싼다. 남는 폭을 전부 먹는다(`flex: 1 1 auto`).
3. **Title** — heading. 필수다.
4. **Description** — 선택. 한 줄 설명.
5. **Meta** — 선택. 개수·기간처럼 짧은 보조 정보.
6. **Actions** — 선택. 버튼 묶음. 줄지 않는다.

**flex 자식이 정확히 둘임을 구조가 보장한다.** `justify-between` 을 「양 끝에 붙인다」는 뜻으로
쓰다가 자식이 셋이 되면 가운데 하나가 화면 한복판에 고립되는데, 제품 성과 지표의 「새로고침」이
정확히 그 사고였다. 액션을 몇 개 넘기든 `__actions` 한 겹이 싸므로 다시 생기지 않는다.

자리마다 쓰는 슬롯이 다르다. **레시피가 슬롯을 막지는 않는다** — 막으면 같은 클래스가 level 마다
다르게 동작한다 — 대신 계약이 그 자리의 값을 갖지 않으며, Figma 의 그 변형에는 자손 자체가 없다.

| level | Title | Description | Meta | Actions |
| --- | :---: | :---: | :---: | :---: |
| `page` | 필수 | 선택 | 선택 | 선택 |
| `section` | 필수 | — | 선택 | 선택 |
| `label` | 필수 | — | — | — |

이 표는 취향이 아니라 제품 17 자리의 전수다. `section` 에 설명을 넘기는 자리가 0 이고,
`label` 은 제목만 넘기는 자리 하나뿐이다(`AdminClient.tsx:1176`).

## Properties

| 속성 | 값 | 기본 | 뜻 |
| --- | --- | --- | --- |
| `data-level` | `page` · `section` · `label` | `section` | 문서 위계 |

## Hierarchy와 variants

**축은 하나이고 그것은 강조가 아니라 «문서 위계»다.** 세 값은 "같은 것을 더/덜 크게"가 아니라
**무엇의 머리인가**가 다르다.

| `data-level` | 자리 | 제목 | 제품 정본 |
| --- | --- | --- | --- |
| `page` | 화면 맨 위 | 36 SemiBold | `AdminSection.tsx` `TITLE_PAGE` · `components/ui/PageHeader` |
| `section` | 카드 안 묶음 | 20 SemiBold | `AdminSection.tsx` `TITLE_SECTION` |
| `label` | 패널 아이브로우 | 12 Medium | `AdminSection.tsx` `TITLE_LABEL` |

**축 이름이 `Size` 가 아닌 이유.** 값이 밀도가 아니다 — 아래 여백을 `page` 만 진다는 것이 그
증거다. 사다리 어휘(`sm`·`md`·`lg`)를 빌리면 순서를 주장하게 되는데, 이 셋의 관계는 순서가
아니라 **포함**이다(화면이 묶음을 품고 묶음이 패널을 품는다). `Level` 은
[figma-component-authoring.md](../governance/figma-component-authoring.md) §2 의 축 표에
2026-09-07 에 열렸다.

**값이 `page`·`section`·`label` 인 이유.** 제품 prop 의 값 그대로다
(`AdminSectionLevel = "page" | "section" | "label"`). 제품이 물게 하는 일이 클래스 교체
하나로 끝나고, 어휘가 둘로 갈리지 않는다.

## States

상태 축이 **없다.** 제품 17 자리 중 hover·focus·disabled·selected 를 머리 자신이 갖는 것이
0 이고, 머리는 대화형 요소가 아니다. 그 안의 액션 버튼이 자기 상태를 갖는다.

## Interaction and responsive behavior

- 폭은 부모가 정한다. 머리는 `inline-size: 100%` 다.
- **719px 이하에서 접힌다** — 가로가 세로가 되고 교차축 정렬이 `flex-end` → `stretch` 로 바뀌어
  액션이 폭을 채운다. 719/720 은 이 저장소가 이미 «행동 경계»로 인정한 폭이다
  ([responsive-layout.md](../foundations/responsive-layout.md) §4).
- 제목이 아주 길면 액션이 다음 줄로 내려간다(`flex-wrap`). 액션은 줄지 않는다 — 제목이
  길어졌다고 버튼이 찌그러지면 누를 것이 사라진다.

## Content

- **Title** 은 화면·묶음의 **이름**이다. 문장이 아니고 마침표를 찍지 않는다 — "성과 지표".
- **Description** 은 그 화면이 무엇을 하는 곳인지 한 줄이다. 해요체이고 마침표를 찍는다.
- **Meta** 는 수와 기간이다. `tabular-nums` 라 값이 갱신돼도 자릿수가 흔들리지 않는다.
- 레시피가 문구를 갖지 않는다.

## Accessibility

- 제목이 **heading** 이다. 단계는 소비처가 고른다 — 화면 제목이면 `h1`, 카드 안 묶음이면 `h2`,
  패널 아이브로우면 `h3` 다. 제품도 level 마다 다른 태그를 고른다.
- **`aria-label` 을 루트에 붙이지 않는다.** 제목이 이미 그 이름이다.
- 액션 묶음에 `role` 을 주지 않는다. 버튼 둘이 나란히 선 것뿐이고, 그것을 툴바라고 부르면
  키보드 사용자가 화살표 이동을 기대하게 된다.

## Specification

| 축 | `page` | `section` | `label` | 토큰 |
| --- | ---: | ---: | ---: | --- |
| 제목 | 36/600 | 20/600 | 12/500 | `typography-heading-md-semibold` · `-body-lg-semibold` · `-caption-medium` |
| 설명 | 16/500 | — | — | `typography-body-md-medium` |
| 메타 | 12/400 | 12/400 | — | `typography-caption-regular` |
| 제목 블록 간격 | 4 | 4 | 4 | `space-stack-xs` |
| 행 간격 | 12 | 12 | 12 | `space-stack-md` |
| 액션 간격 | 8 | 8 | — | `space-control-sm` |
| 아래 여백 | 12 | 0 | 0 | `space-stack-md` |
| 교차축 정렬 | flex-end | flex-end | flex-end | — |
| 배경·테두리·반경 | 없음 | 없음 | 없음 | — |

**행 간격이 `space-control-md`(12) 가 아니라 `space-stack-md`(12) 인 이유.** 값은 같지만
이름이 다르고, 719px 아래에서 이 gap 이 그대로 **세로** 간격이 된다 — 한 값이 두 방향을 다
지므로 stack 이 참이다. 액션 사이의 8 은 반대다: 그 자리는 버튼과 버튼 사이라 control 이
참이다([DS-D-0029](../governance/decisions/DS-D-0029-token-names-must-be-true.md)).

## Effects

없다.

## Implementation

- 제목·설명·메타 모두 `margin: 0` 이다. 브라우저 기본 heading margin 이 남으면 사다리 간격이
  글꼴에 따라 달라진다.
- `min-inline-size: 0` 이 루트와 `__text` 둘 다에 있다. flex 자식의 기본 `min-width` 는 `auto`
  라서, 긴 제목 하나가 부모를 밀어내 카드가 가로로 넘친다.

## Known deviations

1. **`PageHeader` 와 「같은 값」이라는 주장은 대부분 참이고, 한 자리가 갈린다.**
   제목(36/600 · `fg-primary`), 설명(16/500 · 중간 회색), 둘 사이 4px 은 두 벌이 같다.
   갈리는 것은 **아래 여백**이다 — `PageHeader` 는 `mb-16`(32)을 통째로 지고 `page` 는
   `mb-6`(12)만 진다. **어긋난 것이 아니라 분담이 다르다**: 어드민의 소비처는 감싸는 스택의
   `gap-10`(20)이 나머지를 이미 내고 있어 20 + 12 = 32 이고, 그 셈을 제품이
   `BlogManagement.tsx:50-52` 와 `TemplateManagement.tsx:1009-1012` 에 각각 자기 말로 적어
   두었다. 합은 두 곳 다 32 다. 이 레시피는 어드민 쪽(12)을 골랐다 — 감싸는 스택이 간격을
   소유하는 편이 형제가 끼어들 때 무너지지 않는다.
2. **다크의 알파 잉크를 옮기지 않았다.** 제품은 아이브로우를 `rgb(var(--gray-000-rgb)/56%)`,
   메타를 `/40%` 로 그린다. LOUIS 는 `fg-tertiary` 를 그대로 쓴다. 알파는 바닥이 무엇이냐에
   따라 다른 색이 되고 LOUIS 의 잉크 역할은 바닥과 무관하게 정해진다 — `empty-state` 의
   `canvas` 제목이 같은 판단을 했다. **대비를 이유로 값을 바꾼 것이 아니다**: 옮기지 않은
   것은 색이 아니라 «알파로 색을 만드는 방식»이다.
3. **설명과 메타가 라이트에서 제품보다 한 칸씩 갈린다.** 제품은 둘 다 고정
   `--palette-gray-500` 이다. LOUIS 의 잉크 사다리에는 그 값을 가진 **역할**이 없다 —
   같은 색을 가진 이름은 `fg-disabled` 뿐이고 그 이름을 빌리면 이름이 거짓이 된다
   ([DS-D-0029](../governance/decisions/DS-D-0029-token-names-must-be-true.md)). 그래서 설명은
   `fg-secondary`, 메타는 `fg-tertiary` 로 나눴다 — 두 슬롯의 역할이 다르므로 rung 도 다르다.
   제목만 두 테마에서 제품과 **바이트 단위로 같다**(`fg-primary` = 라이트 `palette-gray-900` ·
   다크 `palette-gray-000`).
4. **`typography-heading-md-semibold` 는 이 컴포넌트가 세우면서 함께 열린 토큰이다.**
   LOUIS 의 heading 계열에는 `medium` 세 칸(28·36·48)만 있었고 semibold 가 하나도 없었다.
   제품의 타입 스케일은 세 굵기 × 일곱 크기를 전부 갖고 `type-heading-36-semibold` 는 그중
   실재하는 한 칸이므로, 이것은 새 역할을 지어낸 것이 아니라 **빠져 있던 칸을 채운 것**이다.
   컴포넌트가 `font-size` 와 `font-weight` 를 따로 조합하지 않은 이유는
   [typography.md](../foundations/typography.md) 가 「컴포넌트가 임의 size/weight 조합을 새
   role 처럼 만들지 않는다」고 못박기 때문이다.
5. **719px 접힘을 Figma 에 그리지 않았다.** Figma 에는 media query 가 없어 접힌 모습은 변형이
   되어야 하는데, 셋을 여섯으로 늘리면 그중 셋은 방향 말고 같은 값을 반복한다. 축 어휘도
   닫혀 있어 `Breakpoint` 를 여는 별도 판정이 필요하다. 접힘은 **값이 아니라 규칙**으로
   계약의 `$foldRule` 이 소유하고, `section-header.browser.test.tsx` 가 719px iframe 에서
   매 실행 되잰다 — **한쪽만 있는 근거라서 그 시험이 유일한 눈이다.**
6. **`/admin` 은 제품 게이트의 사각지대다.** 제품의 대비·타이포·표면 게이트가 그 경로를
   하나도 재지 않는다(제품 `CLAUDE.md` 의 「What the Gates Do Not Catch」). 그래서 이 레시피를
   제품이 물게 한 뒤에도 **회귀는 사람이 눈으로 봐야 한다** — 초록이 근거가 되지 않는
   유일한 영역이다. 이 문서와 계약과 브라우저 시험이 그 자리에 처음 생기는 기계 눈이다.
7. **제품이 아직 물지 않았다.** 이 회차는 LOUIS·계약·Figma 셋을 세웠고 제품은 건드리지 않았다
   (소유자가 그 트리에서 작업 중이다). 물게 하는 diff 는 회차 산출물
   `adopt9-section-header.md` 에 있다.

## Acceptance tests

1. 세 level 의 제목 크기·줄높이가 `components.measured.json` 과 같다.
2. 행 간격·제목 블록 간격·액션 간격이 계약과 같다.
3. **아래 여백을 `page` 만 진다** — `section`·`label` 은 0 이다.
4. 배경·테두리·반경·padding 네 방향이 모두 0 이다.
5. `page` 만 설명·메타·액션 세 슬롯을 모두 갖는다.
6. `section` 은 설명을 갖지 않고 메타·액션을 갖는다.
7. `label` 은 제목 한 줄뿐이다.
8. 제목이 `fg-primary`, 설명이 `fg-secondary`, 메타와 아이브로우가 `fg-tertiary` 다.
9. 액션 묶음이 `flex-shrink: 0` 이다.
10. **719px 에서 세로로 접히고 액션이 폭을 채운다.**
