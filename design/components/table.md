---
id: table
status: experimental
authority: normative
summary: 여러 항목을 행과 열로 늘어놓고 값끼리 비교하게 합니다.
---

# Table

여러 항목을 행과 열로 늘어놓고 값끼리 비교하게 한다.

제품에 `<table>` 이 **6벌** 있고 그중 **2벌**이 이 레시피를 쓴다. 정본은 analytics 대시보드의
콘텐츠 표 `ContentTable.tsx` 이며 CSS 파일 상단이 그렇게 적어 두었다
([table.css:3-5](../../packages/css/src/component/table.css)). 나머지 넷은 각자 다른 표다 —
헤어라인·반경·`z-[1]` 까지 손으로 재현한 랜딩 스냅샷 1벌, 치수가 맞지 않아 **명시적으로 채택을
거부한** 가이드 모델 사양 표 1벌(`ModelSpecPanel.tsx@a4125565:42` — 통합 판 `76b6cf15` 에서는 가이드 패널째
걷혔다, `dbf12277`), 그리고 아직 검토되지 않은 관리자 캡션
템플릿 표와 요금제 모달 표 2벌. **여섯 중 거부 기록이 있는 것은 그 하나뿐이다** — 관리자 사용자
목록(`JobMonitor.tsx:58`)도 같은 거부를 적었지만 그것은 `<table>` 이 아니라 div 스택이라 여섯에
들어 있지 않다.

**이 레시피는 골격만 소유한다.** 여백과 타이포는 두 소비처가 전부 유틸리티로 되돌린다 — 아래
Known deviations 첫 항목이 그 실측이다.

**2026-10-07 에 어드민 표의 반복 넷이 올라왔다** — 펼치는 그룹 `tbody` 와 자식 줄 들여쓰기, 칸 보조 줄, 표 안
소제목 줄, `aria-busy` 로 흐리는 상태. 제품 작업 브랜치(`feat/ambassador-links` · `codex/actionable-product-metrics`)의
어드민 표가 각자 지역 상수로 적던 값이다. 소비처 수와 근거는 아래 「그룹 · 보조 줄 · 소제목 · 불러오는 중」 절이 갖는다.

## Availability

| Surface       | 상태           | 근거                                                                                                          |
| ------------- | -------------- | ------------------------------------------------------------------------------------------------------------- |
| Web           | `partial`      | CSS 레시피 하나(`packages/css/src/component/table.css`, `@layer louis.component`)와 제품 소비처 2곳. **React 컴포넌트가 없다** — `packages/react/src/table` 디렉터리가 없고 `packages/react/src/index.ts` 에 export 0이다. acceptance test 는 행 hover 축 셋(10 · 11 · 17)만 `packages/css/test/table.browser.test.ts` 가 잰다. 셀 강조(`data-emphasis`)와 행 머리(`th scope="row"`)는 [Document](../patterns/document.md) 패턴이 문서 안의 표로 `packages/css/test/document.browser.test.ts` 에서 잰다(19 · 20). 셀 강조는 Figma 에 아직 없다. 문서용 규선 변형(`data-variant="ruled"`, 2026-09-21)은 2026-09-29 소유자 결정으로 걷어냈다 — 문서의 표도 이 표다 |
| Figma         | `done`      | TableHeaderCell(Align 3) · TableCell(Align × State = 6) · Table(조립 COMPONENT, 머리 행 + 몸 3행) — 2026-10-14 기하 계약 · 실측 · 되재기로 done(DS-D-0035) |
| Documentation | `done`         | 이 문서                                                                                                       |
| Maturity      | `experimental` | 규범이 구현보다 늦게 선다 — CSS 가 먼저 있었고 이 문서가 그것을 사후에 규범화한다                             |

## When to use

- 항목이 **여럿**이고 각 항목이 **같은 축의 값 여러 개**를 가질 때 — 콘텐츠별 조회수·좋아요·댓글,
  기간별 지표.
- 열끼리 **세로로 비교**하는 것이 목적일 때. 숫자 열은 `data-align="end"` 로 우측 정렬 +
  tabular-nums 가 된다.

**문서에서 읽는 표도 이 표다(2026-09-29 소유자 결정).** 보고서 · 운영안의 표가 앱 · Figma 의 표와 같은
모양이다 — 머리 면 · 헤어라인 · 머리 12 · 셀 8. 문서는 소비처로서 스크롤 래퍼와 열 폭 정책만 정한다
(`.louis-document-table` 이 `table-layout: auto` 를 준다, [Document](../patterns/document.md)). 2026-09-21 에
문서용 규선 변형(`data-variant="ruled"` — 머리 면 없이 가로 규선만 · 머리 14 · 셀 12)을 세웠다가 걷어냈다. 문서
속 표만 다른 모양이었고 Figma 에는 그 변형이 없었다.

쓰지 않는 자리.

- **목록이 표가 아닐 때.** 항목 하나가 값 하나이고 세로 스택으로 나열되는 것은 목록이다. 관리자
  사용자 목록(`app/admin/JobMonitor.tsx:52-59`)이 그 자리이며, 그 파일이 "표가 아니라 div
  스택이라 정본이 요구하는 thead/tbody/tr/td 골격이 없다"고 스스로 적어 두었다.
- **열 폭을 데이터가 정해야 할 때.** 이 레시피(기본 조판)는 `table-layout: fixed` 다. 폭을 주지 않은
  열이 균등 분할되므로 `nowrap` 셀이 넘친다. 가이드의 모델 사양 표
  (`components/scenes/create/guide/ModelSpecPanel.tsx@a4125565:42-51`)가 정확히 그 이유로 채택을 거부했다(그 표는 통합 판에서
  가이드 패널째 걷혔다) —
  8열에 폭을 주지 않고 내용 폭 + `min-w-[860px]` 으로 가로 스크롤하는 표다. 열 폭 정책은 소비처의
  것이므로 그 표도 래퍼에서 `table-layout: auto` 를 주면 이 레시피를 물 수 있다 — 문서가 그렇게 한다(위 문단).
- **고정 헤더가 필요할 때.** sticky 헤더 축이 없다. 아래 Known deviations.
- **정렬(sort)·선택(체크박스)·페이지네이션이 필요할 때.** 셋 다 이 레시피에 없다.

## API

React 표면이 없다. **클래스와 data 속성으로 소비한다.**

```tsx
<div className="overflow-x-auto">        {/* 스크롤 래퍼는 소비처 소유 */}
  <table className="louis-table">
    <colgroup>…</colgroup>               {/* 열 폭도 소비처 소유 */}
    <thead>
      <tr>
        <th scope="col">콘텐츠</th>
        <th scope="col" data-align="end">조회수</th>
      </tr>
    </thead>
    <tbody>
      <tr data-interactive="true">
        <td>…</td>
        <td data-align="end">12,480</td>
      </tr>
    </tbody>
  </table>
</div>
```

## Anatomy

1. **Root** — `<table class="louis-table">`. 폭·레이아웃 알고리즘·경계 모델·본문 타이포를
   소유한다.
2. **Header row** — `<thead> > <tr>`. 반경·헤어라인·stacking 문맥을 **행 단위로** 소유한다.
   셀마다 두르면 열 경계마다 선이 겹친다([table.css:28](../../packages/css/src/component/table.css)).
3. **Header cell** — `<th>`. 헤더 면·잉크·캡션 타이포·`nowrap` 을 소유한다. 첫/마지막 셀이 행의
   모서리 곡률을 만든다 — 행의 `border-radius` 는 셀 배경을 자르지 못한다.
4. **Body row** — `<tbody> > <tr>`. `data-interactive="true"` 일 때만 커서와 호버 면을 갖는다.
5. **Body cell** — `<td>`, 그리고 행 머리 `<th scope="row">`. 여백·잉크·아래 구분선·세로 정렬을 소유한다.
   행 머리도 몸 칸과 같은 칸이다 — 레시피가 `th` 의 UA 기본값(굵게 · 가운데)을 덮는다. Figma 의 TableCell 이
   이 칸이다.
6. **Scroll wrapper** — **DS 밖이다.** 소비처가 소유한다. 아래 Implementation.

## Properties

prop 이 아니라 훅(hook) 계약이다.

| 이름                | 값                     | 붙는 자리            | 뜻                                                       |
| ------------------- | ---------------------- | -------------------- | -------------------------------------------------------- |
| `.louis-table`      | —                      | `<table>`            | 루트. 이 클래스가 없으면 아무 규칙도 걸리지 않는다        |
| `data-align`        | `end` \| `center`      | `<th>` · `<td>`      | 정렬. `end` 는 `tabular-nums` 를 함께 켠다                |
| `data-interactive`  | `"true"`               | `<tbody> > <tr>`     | 행을 눌러 들어가는 표. 커서와 행 호버 면을 켠다            |
| `data-emphasis`     | `total` \| `lead`      | `<th>` · `<td>`      | 한 칸만 도드라지게. `total` 은 `fg-primary` + semibold, `lead`(비교에서 앞선 값)는 `alert-success-stroke` + semibold |
| `data-indent`       | `child`                | `<tbody> > <tr> > <td>` | 그룹의 자식 줄 칸. 앞 여백을 24 로 늘린다(8 + 16). 칸 하나(보통 첫 칸)에만 건다 |
| `aria-busy`         | `"true"`               | `<table>`            | 새 조회를 받는 동안 표를 흐리게(opacity 0.55). 상태의 출처는 이 속성 하나다 |
| `.louis-table__hint`| —                      | 칸 안의 `<span>`     | 칸 값 아래 한 줄 설명. caption · `fg-tertiary` · `display: block` |
| `scope`             | `colgroup` \| `rowgroup` | `<tbody> > <tr> > <th colspan>` | 표 안 소제목 줄의 머리 칸. body-sm-medium 으로 굵힌다 |

**`start` 값이 없다.** 기본이 start 다 — 머리 칸 `th` 와 행 머리 `th` 는 UA 기본 `center` 를 레시피가
`start` 로 덮고, `td` 는 UA 기본이 이미 start 다.
없는 값을 위한 셀렉터를 만들지 않았다. **Figma 쪽 Align 축에는 `start` 옵션이 있다** — 아래 Known
deviations.

**`data-interactive` 가 boolean 이 아니라 `"true"` 문자열인 이유.** 셀렉터가
`tr[data-interactive="true"]` 로 값을 대조한다. 속성만 붙이고 값을 비우면(`data-interactive`)
걸리지 않는다.

## Hierarchy와 variants

**variant 축이 없다.** 대시보드의 데이터 표와 문서에서 읽는 표가 같은 한 벌이다. 2026-09-21 에 문서용
규선 변형(`ruled`)을 세웠다가 2026-09-29 소유자 결정으로 걷어냈다 — 소유자가 「문서 속 표 스타일이 루이에
정의된 스타일 맞아?」라고 물었고, 그 변형은 코드에만 있고 Figma 와 제품에는 없었다. 읽는 자리의 차이는
모양이 아니라 소비처의 열 폭 정책(`table-layout`)으로 받는다
([DS-D-0067](../governance/decisions/DS-D-0067-document-is-not-an-app-screen.md) 추기).

**크기(density) 축도 없다.** 한 벌뿐이다. 제품의 여섯 표가 갖는 셀 여백은
5/8·6/8·8/12·10/12·10/14로 갈리는데, 그것은 밀도 단계가 아니라 서로 다른 무리의 값이다.

| 표 | `th` | `td` |
| --- | --- | --- |
| 정본 `ContentTable.tsx:72,93` | 8/12 | 10/12 |
| `InstagramAnalyticsScene.tsx:577,605` | 8/12 | 10/12 |
| 랜딩 스냅샷 `StaticAnalyticsDemo.tsx@a3ed8e03:508-509,531-532` — **없어졌다**(↓) | 8/12 | 10/12 |
| 가이드 모델 사양 `ModelSpecPanel.tsx@a4125565:52-53` — **없어졌다**(가이드 패널 철거 `dbf12277`) | 8/12 | 8/12 |
| 관리자 캡션 템플릿 `CaptionTemplateManagement.tsx@ae8fd627:45,54` — **`louis-table` 로 넘어갔다**(↓) | 10/14 | 10/14 |
| 요금제 모달 `PricingModal.tsx:90,95` | 5/8 | 6/8 |

**같은 값을 쓰는 것은 둘이 아니라 셋이다** — 랜딩 스냅샷이 대시보드 둘과 같은 8/12·10/12 다.
그리고 **레시피 자신의 4/8·8/8 은 이 표에 없다.** 그 여백을 쓰는 제품 표가 하나도 없다.
축으로 접으려면 어느 값이 어느 단계인지 먼저 합의해야 하고, 그 합의가 없다.

## 그룹 · 보조 줄 · 소제목 · 불러오는 중

2026-10-07, 제품 작업 브랜치의 어드민 표 넷에서 올렸다. **Figma 변형은 아직 없다** — 네 조각 모두 TableCell 세트에
축이 없고 Table 조립본에 그룹 행도 없다. 코드 쪽 레시피만 선 상태다.

```html
<table class="louis-table" aria-busy="true">      <!-- 불러오는 동안만 -->
  <tbody>                                         <!-- 그룹 하나 = tbody 하나 -->
    <tr data-interactive="true">
      <td>
        앰버서더 이름
        <span class="louis-table__hint">이메일, 링크 3개</span>
      </td>
      …
    </tr>
    <tr>                                          <!-- 펼쳤을 때만 -->
      <td data-indent="child">링크 이름</td>
      …
    </tr>
  </tbody>
  <tbody>
    <tr><th scope="rowgroup" colspan="6">미분류</th></tr>   <!-- 표 안 소제목 줄 -->
    …
  </tbody>
</table>
```

| 조각 | 소비처 | 근거 |
| --- | ---: | --- |
| 그룹 `tbody` + 펼침 머리 줄 | **2** | `AmbassadorManagement.tsx@2ceec4ed3:50,485-575`(앰버서더 한 명이 `tbody` 하나, 머리 줄 + 링크 줄 + 만들기 줄) · `AdAttributionPanel.tsx@b57cd1f95:376-398,438`(광고 묶음 머리 줄이 `data-interactive`, 두 번째 `tbody` 가 미분류 묶음) @7273a964e |
| 자식 줄 들여쓰기 `data-indent="child"` | **1** | `AmbassadorManagement.tsx@2ceec4ed3:91,532,557` `LINK_CELL = "pl-12"`(24px). 광고 표는 들여쓰기 대신 서랍 줄을 펼친다 — **소비처가 하나뿐이라 판정 필요로 남겼다**(아래) |
| 칸 보조 줄 `.louis-table__hint` | **3** | `ProductMetricsDashboard.tsx@b57cd1f95:64` `CELL_HINT` @e88df97bb · `AmbassadorManagement.tsx@2ceec4ed3:501,537` · `AdAttributionPanel.tsx@b57cd1f95:442` @7273a964e 가 같은 `block type-caption-12-regular text-fg-tertiary` 를 각자 적는다 |
| 표 안 소제목 줄 | **2** | `ProductMetricsDashboard.tsx@b57cd1f95:110,529` `GROUP_HEAD`(`th scope="colgroup"`, 14 medium) @e88df97bb · `AdAttributionPanel.tsx@b57cd1f95:387-392`(`td colSpan`, 14 medium `fg-secondary` + 위 여백 28) @7273a964e. 두 번째는 잉크와 여백이 달라 **레시피는 첫째의 모양이다** |
| `aria-busy` 흐림 | **7** | `AdAttributionPanel.tsx@b57cd1f95:100,291` · `AmbassadorManagement.tsx@2ceec4ed3:95,304` · `PaymentManagement.tsx@b57cd1f95:102,500` · `UsageByModelDashboard.tsx@b57cd1f95:53` · `JobMonitor.tsx:78,705` · `AdminClient.tsx:397` · `ProductMetricsDashboard.tsx@b57cd1f95:69` @7273a964e. 앞의 다섯은 호버와 같은 전환 토큰을 적고 뒤의 둘만 `120ms ease` 리터럴이다. **표는 둘뿐이고 나머지 다섯은 패널 · 격자 · 목록이다** — 판정 필요(아래) |

**값.**

- 그룹 경계의 선은 **새 규칙이 아니라 기존 규칙의 수정이다.** 마지막 행 구분선 0 이 `tbody > tr:last-child` 라 그룹마다
  마지막 행의 선이 지워졌다 — 그룹 표에서 그룹을 가르는 선이 사라진다. 선택자를 `tbody:last-of-type > tr:last-child` 로
  좁혀 **표의 마지막 `tbody` 의 마지막 행**만 선을 잃게 했다. `tbody` 가 하나인 표는 같은 행을 잡는다. 광고 표는 이
  변경으로 첫 `tbody` 의 마지막 행 아래 선이 **새로 생긴다**(두 묶음 사이의 선).
- 들여쓰기 24 = `space-control-sm`(8) + `space-control-lg`(16). 제품 `pl-12`(격자 2px)는 앞 여백 8 을 **대체**한다.
- 보조 줄은 `typography-caption-regular` · `color-fg-tertiary`. 값 아래에 붙고 열 폭을 더 쓰지 않는다.
- 소제목 줄은 `typography-body-sm-medium`. 몸 칸 규칙이 `th` 의 굵기를 regular 로 되돌리므로 선택자를 한 단 올려 이긴다.
- 흐림은 `opacity: 0.55`, 전환은 `motion-control-hover`(160ms). `prefers-reduced-motion` 에서 전환을 끈다.
  흐림은 **표 자신**에 건다 — 제품은 가로 스크롤 래퍼에 걸었는데 래퍼는 소비처의 것이라 `aria-busy` 를 표에 둔다.

## States

CSS 에 있는 상태는 **하나뿐이다.**

| state              | 표현                                              | 조건                                  |
| ------------------ | ------------------------------------------------- | ------------------------------------- |
| Default            | 행 배경 없음, 잉크 `color-fg-primary`             | —                                     |
| Row hover          | 셀 배경 `color-table-row-hover`(상태 레이어), `cursor: pointer` | `<tr data-interactive="true">` 일 때만 |

**행 hover 는 면이 아니라 상태 레이어다**
([DS-D-0065](../governance/decisions/DS-D-0065-table-row-hover-is-a-state-layer.md)). 쉬는 행에는
면이 없다 — `td` 배경이 투명이다. 그래서 면 없는 다른 행과 같은 방식으로 잉크 알파 한 겹을 얹는다:
light 검정 8% · dark 흰색 8%, `color-accent-ghost-hover` 와 같은 칸이다(`Selectable List Row` 의
Hover 가 같은 칸을 쓴다). 알파라서 표가 어느 사다리 바닥에 놓여도 그 바닥 위에서 같은 정도로
드러난다. **면 사다리 칸으로 되돌리지 않는다** — 다크에는 `bg-surface` 보다 한 칸 위 면이 없어
(`bg-raised` 와 같은 값) 카드 위 표에서 hover 가 바닥과 같은 색이 됐다(아래 Known deviations).

**focus 상태가 없다.** 이 레시피는 포커스 링을 세우지 않는다 — 행 자체가 포커스 가능한 요소가
아니기 때문이다. 아래 Accessibility.

**정적 표는 hover 반응이 없다.** 커서도 세우지 않는다. 그 결과 `data-interactive` 를 붙이지 않은
표에서는 셀 텍스트 위에 I-beam 커서가 뜨며, 정본이 그것을 `cursor-default` 로 되돌린다
(`components/scenes/analytics/ContentTable.tsx:91-96`).

## Interaction and responsive behavior

- **가로 스크롤을 이 레시피가 만들지 않는다.** 표를 감싸는 래퍼에 `overflow-x: auto` 를 주는 쪽이
  소비처다([table.css:7-9](../../packages/css/src/component/table.css)). 여기서 스크롤을 만들면
  sticky 헤더나 카드 안쪽 여백과 충돌한다.
- **열 너비도 정하지 않는다.** 어떤 열이 넓어야 하는지는 데이터의 문제다. 소비처가 `<col>` 이나
  caller 유틸리티로 준다([table.css:11-12](../../packages/css/src/component/table.css)). 두
  소비처 모두 `w-[40%] min-w-[240px]` 같은 유틸리티로 열마다 폭을 준다.
- **헤더 라벨은 접히지 않는다**(`white-space: nowrap`). 접히면 열 폭 계산이 흔들린다. 셀 내용은
  접힌다 — 그 정책은 소비처가 정한다.
- **좁은 화면에서 열을 숨기는 것도 소비처의 일이다.** 두 소비처가 480px 아래에서 공개범위·날짜
  열을 `hidden` 으로 접는다.

## Content

- 헤더 라벨은 **한 단어 또는 짧은 명사구**다. `nowrap` 이라 길면 열을 넓힌다.
- **숫자 열에는 반드시 `data-align="end"` 를 준다.** 자릿수가 흔들리지 않게 tabular 로 바뀌고
  비교하기 쉽게 우측 정렬된다. 제품에서 이 속성이 붙은 자리는 **12곳**이다 — 두 소비처가 숫자 열을
  셋씩 갖고 그 셋마다 `th` 와 `td` 양쪽에 준다(`ContentTable.tsx:374,431,437` · `528,537,546`,
  `InstagramAnalyticsScene.tsx:1674-1676` · `1733,1736,1739`). 그래서 `th` 6 · `td` 6 이다 —
  `grep -c data-align` 이 세는 20 에는 두 파일의 주석 8줄이 함께 들어간다.
- 헤더와 셀의 정렬을 어긋나게 두지 않는다. `data-align` 을 `th` 와 `td` 양쪽에 같은 값으로 준다 —
  셀렉터가 둘을 구분하지 않는 이유가 그것이다.
- 빈 셀은 빈 문자열이 아니라 `—` 로 채운다. 이 규칙은 **레시피가 강제하지 않는다.**
- **상태 열은 예외만 배지다(2026-10-07, 소유자).** 평소 값은 `caption` 크기 `fg-secondary` 글자, 손이 가야 하는 예외만
  [Badge](./badge.md) 다 — 모든 행이 알약이면 찾아야 할 줄이 흐려진다. 규칙은 Badge 문서 When to use 가 갖는다.

## Accessibility

- **네이티브 `<table>` 골격이다.** 행·열 관계, 화면 낭독기의 셀 좌표 안내, 확대에서의 재배치가
  전부 브라우저의 것이다. div 스택에 이 클래스를 걸면 아무것도 성립하지 않는다.
- **`scope` 를 레시피가 주지 않는다.** 소비처가 `<th scope="col">` 를 붙인다. CSS 에는 그 계약을
  강제할 수단이 없고, 문서 밖에서 이것을 검사하는 게이트도 없다.
- **행 전체를 누르게 만들 때 키보드 경로가 생기지 않는다.** `data-interactive="true"` 는 커서와
  호버 면만 준다 — `tabindex` 도 `role` 도 만들지 않는다. 활성화 경로는 소비처가 셀 안의
  링크·버튼으로 준다. 행에 `onClick` 만 걸고 커서로 "누를 수 있어 보이게" 만드는 것은 **키보드
  사용자에게 도달 불가능한 행**을 만드는 것이다. **이것은 가정이 아니다** — 두 소비처 중 하나가
  이미 그 모양을 배포 중이다. 아래 Known deviations.
- **행 호버가 색 하나로만 전달된다.** 그래서 호버는 상태를 나르는 신호가 아니라 포인터 위치의
  피드백이어야 한다 — 선택·활성 같은 의미를 호버 면에 싣지 않는다. 호버 레이어가 바닥 위에서 만드는
  대비는 사다리 바닥 넷에서 light 1.17 · dark 1.20~1.24 로 얕다(DS-D-0065 실측). 다크에서 그 면이
  아예 보이지 않던 결함과 해소 기록은 아래 Known deviations에 있다.
- **forced-colors 에서 헤더 헤어라인을 되살린다.** `box-shadow` 가 사라지므로 `currentColor` 1px
  border 로 다시 세운다([table.css:100-105](../../packages/css/src/component/table.css)). 본문
  구분선은 `border` 라 시스템이 유지하므로 분기가 필요 없다.

## Specification

| 축                    | 값                             | 토큰                                                  |
| --------------------- | -----------------------------: | ----------------------------------------------------- |
| 표 폭                 | 100%                           | 리터럴                                                |
| 레이아웃 알고리즘     | `fixed`                        | 리터럴                                                |
| 경계 모델             | `separate` / spacing 0         | 리터럴                                                |
| 본문 타이포           | 14/1.5, -0.14px, 400           | `typography-body-sm-regular`                          |
| 헤더 타이포           | 12/1.5, -0.12px, 500           | `typography-caption-medium`                           |
| 헤더 셀 세로 여백     | 4px                            | `space-control-xs`                                    |
| 헤더 셀 좌우 여백     | 8px                            | `space-control-sm`                                    |
| 헤더 셀 높이(파생)    | 26px                           | (여백 4+4 + 행간 18)                                  |
| 헤더 행 반경          | 4px                            | `radius-table-header` (→ `radius-4`)                  |
| 헤더 행 헤어라인      | 0.5px inset                    | `hairline-inset` = `border-width-hairline` + `color-stroke-hairline` |
| 헤더 면               | —                              | `color-table-header-surface`                          |
| 헤더 잉크             | —                              | `color-fg-secondary`                                  |
| 헤더 정렬             | `start`                        | 리터럴                                                |
| 헤더 줄바꿈           | `nowrap`                       | 리터럴                                                |
| 헤더 행 층            | `position: relative` + `isolation: isolate` | 리터럴                                   |
| 본문 셀 세로 여백     | 8px                            | `space-control-sm`                                    |
| 본문 셀 좌우 여백     | 8px                            | `space-control-sm`                                    |
| 본문 셀 높이(파생)    | 38px (마지막 행 37px)          | (여백 8+8 + 행간 21 + 구분선 1, 한 줄일 때)           |
| 본문 잉크             | —                              | `color-fg-primary`                                    |
| 본문 셀 세로 정렬     | `middle`                       | 리터럴                                                |
| 행 구분선             | 1px                            | `border-width-default` + `color-table-row-line`       |
| 마지막 행 구분선      | 0 (표의 마지막 `tbody` 만)     | 리터럴                                                |
| 행 호버 레이어        | light 검정 8% · dark 흰색 8%   | `color-table-row-hover` (→ `static-black-alpha-08` · `static-white-alpha-08`) |
| 숫자 열 정렬          | `end` + `tabular-nums`         | 리터럴                                                |
| 자식 줄 앞 여백       | 24px                           | `space-control-sm` + `space-control-lg`               |
| 보조 줄 타이포 · 잉크 | 12/1.5, 400 · `fg-tertiary`    | `typography-caption-regular` · `color-fg-tertiary`    |
| 소제목 줄 타이포      | 14/1.5, 500                    | `typography-body-sm-medium`                           |
| 불러오는 중           | opacity 0.55                   | 리터럴(불투명도 토큰 없음), 전환은 `motion-control-hover` |

**리터럴인 자리와 그 이유.**

- **100% · `fixed` · `separate`/0 · `middle` · `start` · `nowrap` · `end`** 는 값이 아니라
  **키워드**다. 토큰 체계에 대응하는 자리가 없고, 만들면 이름만 한 겹 늘어난다.
- **`separate` 인 이유는 기능적이다.** `collapse` 면 헤더 행의 inset 헤어라인과 셀 반경이 살아남지
  못한다([table.css:17](../../packages/css/src/component/table.css)).
- **마지막 행 구분선 0** 은 표를 감싼 카드의 경계와 겹치기 때문이다
  ([table.css:76](../../packages/css/src/component/table.css)). 두께가 아니라 "지운다"는 판단이라
  토큰이 아니다.
- **`isolation: isolate`** 는 숫자 z-index 를 쓰지 않으려는 선택이다. 헤더 행의 헤어라인이 본문 첫
  행의 구분선 위에 와야 하는데, 층을 숫자로 만들면 `elevation-layer.md` 의 layer 토큰 체계 밖에
  값이 하나 생긴다([table.css:29-31](../../packages/css/src/component/table.css)).
  `position: relative` 가 이미 있어 비위치 지정 tbody 행 배경 위에 그려지므로, 옛 `z-[1]` 과 결과가
  같다. **랜딩 스냅샷이 그 `z-[1]` 을 쓰던 자리는 없어졌다** — `StaticAnalyticsDemo.tsx` 가 랜딩
  개편(`8802565e`)에서 통째로 지워져 배포본 `df414c24` 에 없다
  (`components/landing/demo-snapshots/StaticAnalyticsDemo.tsx@a3ed8e03:518`).

**헤더 높이는 Figma 와 같고, 본문 셀은 1px 어긋난다.** `figma/readback.json` 의 TableHeaderCell 이
높이 26 · padding 4/8 · 라벨 12/18 이고, CSS 헤더 셀은 `border-block-end: 0`
([table.css:43](../../packages/css/src/component/table.css))이라 4+18+4 = 26 으로 일치한다.

본문 셀은 다르다. Figma 의 TableCell 은 높이 37 · padding 8 · 라벨 14/21 에 `strokeWeight 1` ·
`align: INSIDE` 라 **선이 37 안쪽에 그려진다.** CSS 의 `border-block-end: 1px`
([table.css:71](../../packages/css/src/component/table.css))은 padding box **바깥**에 붙는다 —
`border-collapse: separate` 이고 높이가 auto 라 `box-sizing: border-box` 가 개입하지 않는다.
그래서 렌더 높이는 8+21+8+1 = **38** 이고, 구분선을 0 으로 지운 마지막 행에서만 37 이다.
조립 COMPONENT `Table` 이 26 + 37×3 = 137 인 데 반해 CSS 는 26 + 38 + 38 + 37 = **139** 다.

**이 1px×2 를 대조하는 게이트가 없다.** 아래 Known deviations 의 parity 항목이 그 이유다 —
게이트에 붙어 있는 것은 축·선·그림자이고 기하는 빠져 있다. 맞추려면 **Figma 쪽을 38 로 다시 그리는
것이 유일한 경로다** — CSS 를 37 로 내리려면 `padding-block` 이 7.5 가 되어야 하고 그 값은 control
간격 계단에 없다. 어느 쪽으로 갈지는 아직 판정되지 않았다.

**반경 4px 인 이유.** 제품 정본의 값이며 `radius-table-header` 로 이름이 붙어 있다. 이 컴포넌트가
그 토큰의 유일한 소비처다 — `packages/css/src` 전체에서 `table.css` 만 참조한다.

**여백이 4/8·8/8 인 이유는 "제품 값이라서"가 아니다** — 기존 control 간격 계단(`-xs` 4 · `-sm` 8)에
맞춘 값이고, 제품 정본의 실제 여백은 그보다 크다. 아래 Known deviations 첫 항목.

## Effects

**헤더 행의 헤어라인은 테두리가 아니라 inset box-shadow 다**
([DS-D-0023](../governance/decisions/DS-D-0023-hairline-inset.md)). `border` 를 쓰면 border-box
안쪽이 줄어 셀 높이가 바뀌는데, 브라우저가 DPR 1에서 0.5px 을 1px 로 올리므로 그 값이 화면마다
달라진다. inset shadow 는 레이아웃 박스를 건드리지 않는다. 색은 `color-stroke-hairline`
(light black 8% · dark paper 8%)이고 두께는 `border-width-hairline`(0.5px)이다.

문자열을 복사하지 않고 `var(--louis-hairline-inset)` 하나를 참조한다.

그림자도 blur 도 없다. 표는 표면이 아니라 표면 **위의 내용**이며, 카드가 이미 그 층을 갖는다.

## Implementation

- **소스** — `packages/css/src/component/table.css`. 빌드 산출물은
  `packages/css/generated/styles.layer.css` 의 `@layer louis.component` 안이다. 제품은
  `styles.layer.css` 만 소비한다.
- **셀렉터가 `>` 자식 결합자로 잠겨 있다.** `.louis-table > thead > tr > th` 처럼 직계로만
  내려가므로 셀 안에 중첩된 표가 부모 규칙을 상속하지 않는다.
- **예외는 `data-align` 둘이다.** `.louis-table [data-align="end"]` 는 자손 셀렉터라 셀 **안쪽**
  요소에도 걸린다. 셀이 아닌 곳에 이 속성을 쓰지 않는다.
- **호출부 유틸리티가 이 레시피를 이긴다.** LOUIS 컴포넌트 레이어가 Tailwind `utilities` 보다
  앞이므로, 소비처가 되돌리려는 선언은 유틸리티 하나로 이긴다. 두 소비처가 그 경로로 여백·타이포·
  색·마지막 행 구분선을 되돌린다.
- **되돌릴 때 `text-left` 를 넘기지 않는다.** 호출부에 남으면 유틸리티 레이어라 숫자 열의
  `data-align="end"` 를 이겨 버린다 — 두 소비처가 같은 주석을 갖고 있다
  (`components/scenes/analytics/ContentTable.tsx:70`).

## Known deviations

- **CSS 상단 주석이 "그 사양을 그대로 채택했다"고 적었지만 여백과 타이포는 채택되지 않았다.**
  주석이 인용한 제품 정본 값은 헤더 셀 8/12 · 본문 셀 10/12 · body-14
  ([table.css:3-5](../../packages/css/src/component/table.css))인데, 실제 선언은 헤더 4/8 · 본문
  8/8 · caption-12 다. 그래서 두 소비처 **모두** 여백을 유틸리티로 되돌린다 — `py-4 px-6`(8/12) ·
  `py-5 px-6`(10/12) (`ContentTable.tsx:71-75`, `ContentTable.tsx:91-96`,
  `InstagramAnalyticsScene.tsx:576-587`, `InstagramAnalyticsScene.tsx:596`).
  **타이포는 둘이 서로 다른 값으로 되돌린다** — 정본 헤더는 `text-body-14 font-medium`
  (`ContentTable.tsx:73`)인데 Instagram 헤더는 `text-body-16 font-normal`
  (`InstagramAnalyticsScene.tsx:578`)이다. 두 화면의 헤더 크기가 원래 다르고, 그 파일이 스스로
  그렇게 적어 두었다(`InstagramAnalyticsScene.tsx:574`). 되돌린 값 자체가 갈리므로 헤더 타이포는
  "제품 값"이 하나로 정해져 있지도 않다 — 여백과 달리 이쪽은 어느 값에 맞출지부터 미결이다.
  **채택된 것은 골격뿐이다**: `separate`/0 · `fixed` ·
  헤어라인 · 반경 4 · `nowrap` · 박스 모델 · `data-align`. 여백 값을 제품에 맞출지, 제품을 계단에
  맞출지가 이 컴포넌트의 미결 판정이다.
- **마지막 행 구분선도 두 소비처가 되돌린다.** 레시피는 카드 경계와 겹친다며 지우는데, 두 표는
  마지막 행에도 선을 남긴다. 정본이 그렇다면 레시피의 `:last-child` 규칙이 틀렸을 수 있다.
- **다크에서 행 호버가 표면과 같은 색이었다 — 해소됐다(DS-D-0065, 2026-09-17).** 이 항목은
  사다리가 움직일 때마다 뒤집혔다. 호버가 면 사다리 칸을 물었기 때문이다. 2026-09-09 이동은
  `bg-surface`(dark)만 내려 호버와 갈라놓았고, `021c2b6`(2026-09-11) 직전에는 호버 `palette-gray-850`
  대 `bg-surface` `palette-gray-900` 으로 대비 1.12 였다. `021c2b6` 이 850 칸을 지우며 호버를
  `palette-gray-900` 으로 내리자 **`bg-surface` · `bg-raised`(dark)와 다시 바이트 단위로 같아졌다**
  (대비 1.00). 라이트에서도 `bg-inset` 바닥 위 호버는 같은 값(1.00)이었다. 다크에는 `bg-surface`
  보다 한 칸 위 면이 없으므로 면으로는 풀리지 않는다 — 호버를 상태 레이어로 옮겼다. 제품 고정
  커밋에서 잰 합성색(카드 `bg-surface` 위 두 표)은 dark 23,27,34 → 41,44,51 (대비 1.00 → 1.24),
  light 235,236,238 → 232,232,233 (옛 호버와 ΔE2000 1.04)이다 — 측정 명령과 허용 기준은
  DS-D-0065 가 소유한다. 대비가 여전히 얕다. `Selectable List Row` 는 같은 계열의 함정에서 선행
  표식을 함께 그렸다가 2026-09-22 에 걷었다(DS-D-0070) — 그 행의 선택 면(`bg-inset`)은 지금 올라온
  면들과 갈리고, 캔버스 위에 두지 않는 것이 규범이다. 이 표의 호버는 그 판단과 상관없이 상태 레이어다.
- **다크에서 헤더 면은 표면과 같은 값이다.** `021c2b6` 이 헤더 면도 `palette-gray-900` 으로 내려
  `bg-surface`(dark)와 바이트 단위로 같아졌다(대비 1.00, 직전 1.12). DS-D-0065 는 상태(호버)만
  옮겼고 헤더 면은 건드리지 않았다 — 헤더를 세우는 것은 면이 아니라 헤어라인 하나다.
  라이트에서 헤더 면 대 `color-bg-surface` 는 **1.29**, `color-bg-canvas`
  위에 놓이면 **1.21** 이다. **라이트에서 헤더 면과 `color-bg-canvas` 가 둘 다
  `palette-gray-100` 이라 1.00 이던 것은 이 회차가 아니라 라이트 면 사다리를 세운
  `0279520`·`fe31e52` 가 `bg-canvas`(light)를 `palette-gray-025` 로 올리며 해소했다.**
- **행 구분선 대비가 3:1 아래다.** `color-bg-surface` 기준 라이트 1.48 · 다크 1.59.
  [color-theme.md](../foundations/color-theme.md)가 의미 있는 비텍스트 그래픽에 3:1을 목표로 두는데
  구분선은 그 아래다. 잉크 대비는 넉넉하다 — 본문 16.54(light) / 14.72(dark), 헤더
  7.15(light) / 5.63(dark). 위 수치는 전부 토큰 값에서 계산한 것이고 **게이트가 계산하지 않는다** —
  그래서 회색 램프를 다시 세운 회차와 위 두 사다리 이동이 이 숫자들을 조용히 낡게 만들었고,
  2026-09-09 에 현재 토큰 값으로 다시 계산했다.
- **`@media (hover: hover)` 가드가 없다.** 포인터가 없는 기기에서 탭이 호버 면을 남긴다.
  [interaction-states.md](../foundations/interaction-states.md) 「셀렉터 함정 — 터치에서도 hover가
  발동한다」가 제품에서 같은 함정을 이미 기록해 두었다.
- **`data-align="center"` 에 소비처가 0이다.** 제품의 `data-align` 12곳이 전부 `end` 다. center 는
  선언돼 있으나 실화면에서 확인되지 않았다. `center` 에는 `tabular-nums` 가 붙지 않는다 — 가운데
  정렬된 숫자 열은 자릿수가 흔들린다.
- **`data-interactive` 에 소비처가 생겼다 — 그래서 다크 호버 결함이 제품에서 드러났다.** 오래
  소비처가 0이었다. 앵커 `6fbdac16` 에서는 구독 화면의 크레딧 사용 이력 표가 레시피를 물고
  (`myPageSceneStyles.ts:313`) 이동할 곳이 있는 행에 속성을 붙인다 —
  `data-interactive={href ? "true" : undefined}`(`SubscriptionScene.tsx:1403`). 그 행은
  `role={href ? "button" : undefined}` · `tabIndex={href ? 0 : undefined}`
  (`SubscriptionScene.tsx:1418-1419`)와 Enter · Space 처리를 함께 가져 아래 「키보드로 갈 수 없는
  클릭 행」의 모양이 아니다. 콘텐츠 표 두 벌은 앵커에서 여전히 붙이지 않는다 — Instagram 은 "그
  상태는 커서와 행 호버 면을 함께 주는데 이 표에는 호버 면이 없다. 커서만 호출부에 남긴다"
  (`InstagramAnalyticsScene.tsx:614-615`), 정본은 "이 표는 행을 눌러 들어가지 않으므로 붙이지
  않는다"(`ContentTable.tsx:89-90`). 다크 호버 대비 1.00 이 오래 드러나지 않은 것은 결함이 없어서가
  아니라 그 코드 경로를 아무도 밟지 않아서였다. Acceptance test 10 · 11 · 17 은 이제
  `packages/css/test/table.browser.test.ts` 가 잰다.
- **키보드로 갈 수 없는 클릭 행이 이미 배포돼 있다.** Instagram 표가 `<tr onClick>` 으로 새 창을
  여는데 행에 `tabIndex` 도 `role` 도 `onKeyDown` 도 없고, 셀 안에 링크·버튼도 없다
  (`InstagramAnalyticsScene.tsx:1681-1686`, 커서는 `TABLE_ROW = "cursor-pointer"` `:599`). 위
  Accessibility 가 경고한 바로 그 모양이며 가정법이 아니라 실측이다. `data-interactive` 를 쓰지
  않았으니 레시피가 만든 결함은 아니지만, **레시피가 활성화 경로를 만들어 주지 않는다는 사실이
  소비처에서 이렇게 나타난다** — 거부 사유가 "호버 면이 없어서"였으므로 키보드 경로는 애초에 검토
  대상이 아니었다. 정본(`ContentTable.tsx:396-399`)은 행에 `onClick` 이 없어 이 문제가 없다.
- **React 표면이 없다.** `packages/react/src/table` 이 없고 public export 0이라, 소비처가 클래스
  문자열과 data 속성 이름을 직접 적는다. 오타를 잡는 것이 타입이 아니라 사람이다.
- **기하 계약은 2026-10-14 에 섰다 — 본문 칸 높이만 대조 밖이다.** 기록 `table-header-cell` · `table-cell` · `table`
  (`figma/components.measured.json`, 레시피 선언과 그 파생)을 `scripts/verify-figma-parity.mjs` 의 세 계약이 가리키고
  `packages/react/test/table-geometry.browser.test.tsx` 가 코드에서 되잰다(DS-D-0035 (c)). 머리 칸 높이 26 · 여백 4/8,
  본문 칸 여백 8/8, 라벨 크기 · 행 높이, 머리 행 26 · 행 사이 0 을 건다. **본문 칸 · 행 높이는 걸지 않는다** — 코드는 행
  구분선이 `border-block-end` 1px 라 칸이 8 + 21 + 8 + 1 = 38(마지막 행 37)이고 Figma `TableCell` 은 획을 INSIDE 로 그려 37 이다.
  위 Specification 이 적은 1px 어긋남이 그것이며, 어느 쪽을 옮길지는 소유자 판정이다(계약 주석).
- **Figma 의 Align 축에는 `start` 가 있는데 CSS 에는 없다.** `TableHeaderCell`(Align 3) 과
  `TableCell`(Align 3 × State 2) 모두 `start`·`center`·`end` 를 variant 로 갖는다. CSS 에서
  `start` 는 셀렉터가 아니라 기본값이라 `data-align` 을 붙이지 않는 것이 그 상태다. Figma 에서
  `Align=start` 를 고른 사람이 코드에서 `data-align="start"` 를 적으면 **아무 규칙도 걸리지
  않는데 화면은 맞아** 잘못이 드러나지 않는다.
- **Figma 가 셋으로 나뉜 것은 코드의 구조와 다르다.** 머리 칸과 몸 칸이 패딩·타이포·잉크·테두리가
  전부 달라 한 set 으로 묶으면 절반이 거짓 조합이 되기 때문이며(`design/manifest.json` 의 table
  note), CSS 는 그것을 `thead > tr > th` 와 `tbody > tr > td` 라는 **위치**로 가른다. 축 이름이
  양쪽에서 대응하지 않는다.
- **acceptance test 는 행 hover 축 셋과 행 머리 · 셀 강조 둘만 자동이다.** 10 · 11 · 17 을
  `packages/css/test/table.browser.test.ts` 가 사다리 바닥 넷 × 테마 둘에서 잰다(DS-D-0065). 19 · 20 은
  `packages/css/test/document.browser.test.ts` 가 문서 안의 표로 잰다(1 · 5 의 셀 여백과 머리 글자 크기도
  그 표에서 함께 잰다).
  나머지 항목은 아직 사람이 확인하는 목록이다.
- **`data-emphasis="lead"` 의 초록이 라이트에서 본문 대비 기준에 못 미친다.** 잉크가
  `alert-success-stroke` 라 `bg-surface` 위 2.12:1(다크 4.21:1)이다. `louis-delta-pill[data-tone="up"]`
  과 같은 선택이고 같은 뿌리의 결함이다 — 글자로 쓸 success 잉크 역할이 LOUIS 에 없다. 굵기
  (semibold)가 함께 가서 색이 유일한 전달 수단은 아니지만 대비는 모자라다. 해소는 역할 토큰 판정이다
  ([Document](../patterns/document.md) Known deviations 2).
- **셀 강조가 Figma 에 없다.** TableCell 세트에 `Emphasis` 축이 없다. Figma 가 `partial` 인 이유에 하나가
  더해졌다. 규선 변형이 없던 것은 그 변형을 걷어내며 해소됐다(2026-09-29).
- **sticky 헤더가 없다.** 소비처가 만들려면 스크롤 래퍼와 함께 스스로 세워야 하고, 그때
  `isolation: isolate` 가 만드는 stacking 문맥과 어떻게 겹치는지 확인되지 않았다.
- **정렬(sort)·선택 열·페이지네이션·zebra striping·빈 상태가 없다.** 정렬 헤더는 `aria-sort` 와
  방향 표식이 필요하고, 빈 상태는 `Empty State` 가 소유한다.
- **제품의 나머지 표 3벌을 덮지 않는다.** 랜딩 스냅샷
  (`StaticAnalyticsDemo.tsx@a3ed8e03:503-521`)이 같은 기하를 손으로 재현해 흡수 후보였는데 **그 파일
  자체가 없어졌다**(랜딩 개편 `8802565e`) — 후보 하나가 흡수가 아니라 삭제로 사라졌으므로 넷이
  셋이 됐다. 남은 것은 가이드
  모델 사양 표와 관리자 캡션 템플릿 표(`app/admin/CaptionTemplateManagement.tsx@ae8fd627:40-46`, 표 전체에
  1px 테두리 + `rounded-12` + `overflow-hidden`), 요금제 모달 표
  (`components/scenes/create/PricingModal.tsx:82-92`, `border-collapse: collapse` · caption-12 ·
  uppercase 헤더)는 계약이 다르다.

  **앵커를 `5a67d692` 로 옮기며 후보가 하나 더 줄었다(↓).** 관리자 캡션 템플릿 표는 손수 기하를
  버리고 `louis-table` 을 문다(`app/admin/CaptionTemplateManagement.tsx:51`·`:54`) — 흡수가 아니라
  **제품이 스스로 정본으로 넘어온** 경우다. 셋이 둘이 됐고, 위 벌 표의 그 행도 함께 옮겼다.
- **어드민 그룹 · 보조 줄 · 흐림은 소비처가 하나뿐이거나 표 밖으로 번진 것이 있다(2026-10-07, 판정 필요).**
  (1) `data-indent="child"` 는 소비처가 앰버서더 표 하나다 — 세워 두었으나 광고 표는 서랍 줄을 펼친다. 두 번째 소비처가
  생기기 전에는 한 단 고정이다. (2) `aria-busy` 0.55 는 일곱 곳이 쓰지만 **표는 둘**이다 — 패널(`PaymentManagement`
  · `UsageByModelDashboard`) · 통계 격자(`AdminClient` · `ProductMetricsDashboard`) · 작업 목록(`JobMonitor`)이 같은 값을
  각자 적는다. 표에만 두면 다섯이 남고, 모든 `[aria-busy]` 에 걸면 전역 선택자(DS-D-0004)다 — 별도 `louis-busy` 유틸리티로
  올릴지가 소유자 판정이다. (3) 흐림 값 0.55 가 불투명도 토큰이 아니라 리터럴이다. `AdminClient` · `ProductMetricsDashboard`
  의 `120ms ease` 는 토큰 전환(160ms)과 40ms 갈린다. (4) 소제목 줄의 `scope` — 제품은 `colgroup` 을 썼으나 이 줄은
  뒤따르는 행 묶음의 이름이라 HTML 의미는 `rowgroup` 이다. 레시피는 둘 다 받고 제품 수정은 제품 몫이다. (5) 광고 표의 두 번째
  묶음 소제목은 `td` 에 `pt-14`(28) · `fg-secondary` 라 이 레시피와 잉크 · 여백이 다르다 — 맞출지 소비처에 둘지 미결이다.

## Acceptance tests

1. 헤더 셀의 `padding-block`·`padding-inline` 계산값이 4px·8px 이고, 본문 셀이 8px·8px 이다.
2. 헤더 행의 `border-radius` 가 4px 이고, `thead > tr > th:first-child` 의 좌측 두 모서리와
   `:last-child` 의 우측 두 모서리가 같은 4px 을 갖는다.
3. 헤더 행의 `box-shadow` 가 `--louis-hairline-inset` 이 푸는 값과 같다 — inset, 확산 0.5px,
   색 `color-stroke-hairline`. 컴포넌트가 shadow 문자열을 스스로 적지 않는다.
4. 표의 `border-collapse` 가 `separate` 이고 `border-spacing` 이 `0px`, `table-layout` 이 `fixed`,
   `inline-size` 가 컨테이너의 100% 다.
5. 헤더 셀의 font-size/line-height/weight 가 `typography-caption-medium`(12/1.5/500)과 같고, 본문
   셀이 `typography-body-sm-regular`(14/1.5/400)와 같다.
6. 헤더 셀의 `border-block-end` 두께가 0 이고 `white-space` 가 `nowrap`, `text-align` 이 `start`
   다.
7. 본문 셀의 `border-block-end` 가 1px solid `color-table-row-line` 이고, **표의 마지막 `<tr>` 의
   셀에서만** 0 이다.
8. `data-align="end"` 인 셀이 `text-align: end` 이고 `font-variant-numeric` 에 `tabular-nums` 가
   있다. `data-align="center"` 인 셀은 `text-align: center` 이고 **tabular-nums 가 없다.**
9. `data-align` 없는 `th`·`td` 의 `text-align` 이 `start` 다.
10. `<tr data-interactive="true">` 가 `cursor: pointer` 이고, 그 위에 포인터를 올리면 자식 `td` 의
    배경이 `color-table-row-hover` 로 바뀐다.
11. `data-interactive` 가 없는 `<tr>` 은 hover 에서 배경이 바뀌지 않고 `cursor` 가 `pointer` 가
    아니다.
12. `data-interactive="true"` 인 행에 `tabindex` 나 `role` 이 생기지 않는다 — 레시피는 키보드
    경로를 만들지 않는다.
13. 헤더 행이 `position: relative` 이고 `isolation: isolate` 이며, 본문 첫 행의 구분선이 헤더
    헤어라인을 가리지 않는다.
14. 표 자신에게 `overflow` 선언이 없다 — 가로 스크롤이 소비처 래퍼에서만 생긴다.
15. `forced-colors: active` 에서 헤더 행의 `box-shadow` 가 `none` 이고 `currentColor` 1px border
    가 대신 선다.
16. 규칙이 전부 `.louis-table` 후손에만 걸린다 — 클래스 없는 `<table>` 의 계산값이 UA 기본과 같다.
17. **light·dark 두 테마에서 행 호버가 표 바닥과 다른 색이다** — 사다리 바닥 넷(`bg-canvas` ·
    `bg-inset` · `bg-surface` · `bg-raised`) 모두에서, 바닥과 호버를 캔버스로 합성한 8비트 색으로
    잰다. 호버 토큰은 알파(0 < a < 1)이고 light 에서는 바닥보다 어둡게, dark 에서는 밝게 얹힌다.
    면 사다리 칸을 물던 동안 dark `bg-surface` · `bg-raised` 와 light `bg-inset` 에서 실패했다(Known
    deviations) — 그 실패가 이 항목의 존재 이유다.
18. 한 줄짜리 본문 행의 `getBoundingClientRect().height` 가 **38px** 이고 마지막 행만 37px 이며,
    머리 행이 26px 이다. Figma 조립본 `Table` 의 137 과 어긋나는 139 가 현재의 실측이다 —
    위 Specification.
19. 행 머리 `th scope="row"` 가 몸 칸과 같다 — 굵기 400 · `text-align: start` · 여백 · 아래 구분선 · 잉크가
    옆 `td` 와 같고, 브라우저 기본값(굵게 · 가운데)이 새지 않는다. `data-align="center"` · `"end"` 가 머리
    칸과 몸 칸(행 머리 포함)에서 같은 정렬이다 — 몸 칸의 `text-align: start` 가 정렬 규칙을 이기지 않는다.
    `data-variant` 는 아무 규칙도 걸지 않는다(`packages/css/test/document.browser.test.ts`).
20. `data-emphasis="total"` 칸이 `fg-primary` · 600, `data-emphasis="lead"` 칸이 `alert-success-stroke`
    · 600 이다.
21. 그룹 표(`tbody` 가 둘 이상)에서 **앞 `tbody` 의 마지막 행** 셀은 아래 구분선(1px)이 남고, **마지막 `tbody` 의 마지막 행**
    셀만 0 이다. `tbody` 하나인 표는 7번과 같다.
22. `td[data-indent="child"]` 의 `padding-inline-start` 가 24px 이고 같은 줄의 다른 칸은 8px 이다.
23. `.louis-table__hint` 가 `display: block` · 12/1.5/400 · `color-fg-tertiary` 이다.
24. `th[scope="colgroup"]` 와 `th[scope="rowgroup"]` 가 body-sm-medium(14/1.5/500)이고, 같은 `tbody` 의 `td` 는 400 이다.
25. `table[aria-busy="true"]` 의 `opacity` 가 0.55 이고 `aria-busy` 가 없으면 1 이다. `prefers-reduced-motion` 에서 전환 시간이 0 이다.
