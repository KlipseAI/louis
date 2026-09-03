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
거부한** 가이드 모델 사양 표 1벌(`ModelSpecPanel.tsx:42`), 그리고 아직 검토되지 않은 관리자 캡션
템플릿 표와 요금제 모달 표 2벌. **여섯 중 거부 기록이 있는 것은 그 하나뿐이다** — 관리자 사용자
목록(`JobMonitor.tsx:62`)도 같은 거부를 적었지만 그것은 `<table>` 이 아니라 div 스택이라 여섯에
들어 있지 않다.

**이 레시피는 골격만 소유한다.** 여백과 타이포는 두 소비처가 전부 유틸리티로 되돌린다 — 아래
Known deviations 첫 항목이 그 실측이다.

## Availability

| Surface       | 상태           | 근거                                                                                                          |
| ------------- | -------------- | ------------------------------------------------------------------------------------------------------------- |
| Web           | `partial`      | CSS 레시피 하나(`packages/css/src/component/table.css`, `@layer louis.component`)와 제품 소비처 2곳. **React 컴포넌트가 없다** — `packages/react/src/table` 디렉터리가 없고 `packages/react/src/index.ts` 에 export 0이다. acceptance test 0건 |
| Figma         | `partial`      | TableHeaderCell(Align 3) · TableCell(Align × State = 6) · Table(조립 COMPONENT, 머리 행 + 몸 3행)              |
| Documentation | `done`         | 이 문서                                                                                                       |
| Maturity      | `experimental` | 규범이 구현보다 늦게 선다 — CSS 가 먼저 있었고 이 문서가 그것을 사후에 규범화한다                             |

## When to use

- 항목이 **여럿**이고 각 항목이 **같은 축의 값 여러 개**를 가질 때 — 콘텐츠별 조회수·좋아요·댓글,
  기간별 지표.
- 열끼리 **세로로 비교**하는 것이 목적일 때. 숫자 열은 `data-align="end"` 로 우측 정렬 +
  tabular-nums 가 된다.

쓰지 않는 자리.

- **목록이 표가 아닐 때.** 항목 하나가 값 하나이고 세로 스택으로 나열되는 것은 목록이다. 관리자
  사용자 목록(`app/admin/JobMonitor.tsx:56-63`)이 그 자리이며, 그 파일이 "표가 아니라 div
  스택이라 정본이 요구하는 thead/tbody/tr/td 골격이 없다"고 스스로 적어 두었다.
- **열 폭을 데이터가 정해야 할 때.** 이 레시피는 `table-layout: fixed` 다. 폭을 주지 않은 열이
  균등 분할되므로 `nowrap` 셀이 넘친다. 가이드의 모델 사양 표
  (`components/scenes/create/guide/ModelSpecPanel.tsx:42-51`)가 정확히 그 이유로 채택을 거부했다 —
  8열에 폭을 주지 않고 내용 폭 + `min-w-[860px]` 으로 가로 스크롤하는 표다.
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
5. **Body cell** — `<td>`. 여백·잉크·아래 구분선·세로 정렬을 소유한다.
6. **Scroll wrapper** — **DS 밖이다.** 소비처가 소유한다. 아래 Implementation.

## Properties

prop 이 아니라 훅(hook) 계약이다.

| 이름                | 값                     | 붙는 자리            | 뜻                                                       |
| ------------------- | ---------------------- | -------------------- | -------------------------------------------------------- |
| `.louis-table`      | —                      | `<table>`            | 루트. 이 클래스가 없으면 아무 규칙도 걸리지 않는다        |
| `data-align`        | `end` \| `center`      | `<th>` · `<td>`      | 정렬. `end` 는 `tabular-nums` 를 함께 켠다                |
| `data-interactive`  | `"true"`               | `<tbody> > <tr>`     | 행을 눌러 들어가는 표. 커서와 행 호버 면을 켠다            |

**`start` 값이 없다.** 기본이 start 다 — `th` 는 UA 기본 `center` 를 레시피가 `start` 로
덮고([table.css:46](../../packages/css/src/component/table.css)), `td` 는 UA 기본이 이미 start 다.
없는 값을 위한 셀렉터를 만들지 않았다. **Figma 쪽 Align 축에는 `start` 옵션이 있다** — 아래 Known
deviations.

**`data-interactive` 가 boolean 이 아니라 `"true"` 문자열인 이유.** 셀렉터가
`tr[data-interactive="true"]` 로 값을 대조한다. 속성만 붙이고 값을 비우면(`data-interactive`)
걸리지 않는다.

## Hierarchy와 variants

**variant 축이 없다.** 표는 강조 단계를 갖지 않는다.

**크기(density) 축도 없다.** 한 벌뿐이다. 제품의 여섯 표가 갖는 셀 여백은
5/8·6/8·8/12·10/12·10/14로 갈리는데, 그것은 밀도 단계가 아니라 서로 다른 무리의 값이다.

| 표 | `th` | `td` |
| --- | --- | --- |
| 정본 `ContentTable.tsx:72,93` | 8/12 | 10/12 |
| `InstagramAnalyticsScene.tsx:586,605` | 8/12 | 10/12 |
| 랜딩 스냅샷 `StaticAnalyticsDemo.tsx@a3ed8e03:508-509,531-532` — **없어졌다**(↓) | 8/12 | 10/12 |
| 가이드 모델 사양 `ModelSpecPanel.tsx:52-53` | 8/12 | 8/12 |
| 관리자 캡션 템플릿 `CaptionTemplateManagement.tsx@ae8fd627:45,54` — **`louis-table` 로 넘어갔다**(↓) | 10/14 | 10/14 |
| 요금제 모달 `PricingModal.tsx:90,95` | 5/8 | 6/8 |

**같은 값을 쓰는 것은 둘이 아니라 셋이다** — 랜딩 스냅샷이 대시보드 둘과 같은 8/12·10/12 다.
그리고 **레시피 자신의 4/8·8/8 은 이 표에 없다.** 그 여백을 쓰는 제품 표가 하나도 없다.
축으로 접으려면 어느 값이 어느 단계인지 먼저 합의해야 하고, 그 합의가 없다.

## States

CSS 에 있는 상태는 **하나뿐이다.**

| state              | 표현                                              | 조건                                  |
| ------------------ | ------------------------------------------------- | ------------------------------------- |
| Default            | 행 배경 없음, 잉크 `color-fg-primary`             | —                                     |
| Row hover          | 셀 배경 `color-table-row-hover`, `cursor: pointer` | `<tr data-interactive="true">` 일 때만 |

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
  셋씩 갖고 그 셋마다 `th` 와 `td` 양쪽에 준다(`ContentTable.tsx:425,431,437` · `528,537,546`,
  `InstagramAnalyticsScene.tsx:1680-1682` · `1733,1736,1739`). 그래서 `th` 6 · `td` 6 이다 —
  `grep -c data-align` 이 세는 20 에는 두 파일의 주석 8줄이 함께 들어간다.
- 헤더와 셀의 정렬을 어긋나게 두지 않는다. `data-align` 을 `th` 와 `td` 양쪽에 같은 값으로 준다 —
  셀렉터가 둘을 구분하지 않는 이유가 그것이다.
- 빈 셀은 빈 문자열이 아니라 `—` 로 채운다. 이 규칙은 **레시피가 강제하지 않는다.**

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
  피드백이어야 한다 — 선택·활성 같은 의미를 호버 면에 싣지 않는다. 다크에서 그 면이 아예 보이지
  않는다는 실측은 아래 Known deviations에 있다.
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
| 마지막 행 구분선      | 0                              | 리터럴                                                |
| 행 호버 면            | —                              | `color-table-row-hover`                               |
| 숫자 열 정렬          | `end` + `tabular-nums`         | 리터럴                                                |

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
  `InstagramAnalyticsScene.tsx:585-596`, `InstagramAnalyticsScene.tsx:605`).
  **타이포는 둘이 서로 다른 값으로 되돌린다** — 정본 헤더는 `text-body-14 font-medium`
  (`ContentTable.tsx:73`)인데 Instagram 헤더는 `text-body-16 font-normal`
  (`InstagramAnalyticsScene.tsx:587`)이다. 두 화면의 헤더 크기가 원래 다르고, 그 파일이 스스로
  그렇게 적어 두었다(`InstagramAnalyticsScene.tsx:583`). 되돌린 값 자체가 갈리므로 헤더 타이포는
  "제품 값"이 하나로 정해져 있지도 않다 — 여백과 달리 이쪽은 어느 값에 맞출지부터 미결이다.
  **채택된 것은 골격뿐이다**: `separate`/0 · `fixed` ·
  헤어라인 · 반경 4 · `nowrap` · 박스 모델 · `data-align`. 여백 값을 제품에 맞출지, 제품을 계단에
  맞출지가 이 컴포넌트의 미결 판정이다.
- **마지막 행 구분선도 두 소비처가 되돌린다.** 레시피는 카드 경계와 겹친다며 지우는데, 두 표는
  마지막 행에도 선을 남긴다. 정본이 그렇다면 레시피의 `:last-child` 규칙이 틀렸을 수 있다.
- **다크에서 행 호버가 보이지 않는다.** `color-table-row-hover`(dark)와
  `color-bg-surface`(dark)가 **같은 값**이다(둘 다 `palette-gray-800`,
  `color(srgb 0.192157 0.211765 0.25098)`). 표면 위 표에서 대비 1.00 — 호버 면이 배경과 구별되지
  않는다. `Selectable List Row` 가 같은 계열의 함정을 만나 선행 표식을 함께 그린 것과 같은 문제다.
- **다크에서 헤더 면도 표면과 같은 값이다.** 대비 1.00. 헤더를 세우는 것은 면이 아니라 헤어라인
  하나다. 라이트에서도 헤더 면 대 `color-bg-surface` 는 1.08이고, `color-bg-canvas` 위에 놓이면
  **1.00**이다(둘 다 `palette-gray-100`).
- **행 구분선 대비가 3:1 아래다.** `color-bg-surface` 기준 라이트 1.14 · 다크 1.83.
  [color-theme.md](../foundations/color-theme.md)가 의미 있는 비텍스트 그래픽에 3:1을 목표로 두는데
  구분선은 그 아래다. 잉크 대비는 넉넉하다 — 본문 16.54(light) / 11.61(dark), 헤더
  5.87(light) / 8.42(dark). 위 수치는 전부 토큰 값에서 계산한 것이고 **게이트가 계산하지 않는다.**
- **`@media (hover: hover)` 가드가 없다.** 포인터가 없는 기기에서 탭이 호버 면을 남긴다.
  [interaction-states.md](../foundations/interaction-states.md) 「셀렉터 함정 — 터치에서도 hover가
  발동한다」가 제품에서 같은 함정을 이미 기록해 두었다.
- **`data-align="center"` 에 소비처가 0이다.** 제품의 `data-align` 12곳이 전부 `end` 다. center 는
  선언돼 있으나 실화면에서 확인되지 않았다. `center` 에는 `tabular-nums` 가 붙지 않는다 — 가운데
  정렬된 숫자 열은 자릿수가 흔들린다.
- **`data-interactive` 도 소비처가 0이다 — 그런데 이것은 레시피의 유일한 상태다.**
  `grep -rn 'data-interactive' apps` 가 무는 것은 주석 두 줄뿐이고 속성 사용은 0건이다. 게다가 두
  소비처가 **명시적으로 거부했다** — Instagram 은 "그 상태는 커서와 행 호버 면을 함께 주는데 이
  표에는 호버 면이 없다. 커서만 호출부에 남긴다"(`InstagramAnalyticsScene.tsx:597-598`), 정본은
  "이 표는 행을 눌러 들어가지 않으므로 붙이지 않는다"(`ContentTable.tsx:89-90`). 그래서 States 표의
  Row hover 와 Acceptance test 10 은 **실화면에서 한 번도 확인된 적이 없는 축**이다(반대쪽인 11 은
  두 소비처가 늘 밟고 있는 경로다). 위의 다크
  호버 대비 1.00 이 제품에서 아직 드러나지 않은 이유도 이것이다 — 결함이 없어서가 아니라 그 코드
  경로를 아무도 밟지 않아서다.
- **키보드로 갈 수 없는 클릭 행이 이미 배포돼 있다.** Instagram 표가 `<tr onClick>` 으로 새 창을
  여는데 행에 `tabIndex` 도 `role` 도 `onKeyDown` 도 없고, 셀 안에 링크·버튼도 없다
  (`InstagramAnalyticsScene.tsx:1687-1692`, 커서는 `TABLE_ROW = "cursor-pointer"` `:599`). 위
  Accessibility 가 경고한 바로 그 모양이며 가정법이 아니라 실측이다. `data-interactive` 를 쓰지
  않았으니 레시피가 만든 결함은 아니지만, **레시피가 활성화 경로를 만들어 주지 않는다는 사실이
  소비처에서 이렇게 나타난다** — 거부 사유가 "호버 면이 없어서"였으므로 키보드 경로는 애초에 검토
  대상이 아니었다. 정본(`ContentTable.tsx:447-450`)은 행에 `onClick` 이 없어 이 문제가 없다.
- **React 표면이 없다.** `packages/react/src/table` 이 없고 public export 0이라, 소비처가 클래스
  문자열과 data 속성 이름을 직접 적는다. 오타를 잡는 것이 타입이 아니라 사람이다.
- **parity 게이트가 축·선·그림자는 대조하는데 기하만 빠져 있다.** `figma/readback.json` 과
  `figma/snapshot.json` 에 `TableHeaderCell`·`TableCell`·`Table` 셋이 들어 있고
  `design/manifest.json` 도 셋을 등재했다. `scripts/verify-figma-parity.mjs` 에도 셋이 다 있다
  (`:405` · `:420` · `:438`) — 두 칸의 Align 3 값, TableCell 의 State 2 값,
  `TableCell` 의 `strokes: { self: { weight: 1, align: "INSIDE" } }`, `Table` 의
  `effects: { HeaderRow: "INNER_SHADOW:0:0:0.5" }` 와 `strokes.TableCell.weight: [1, 0]`
  (마지막 행만 0)이 전부 계약으로 적혀 있다. **빠진 것은 `geometry` 하나다** — 세 항목 어디에도
  `geometry.measuredId` 가 없고 `figma/components.measured.json` 의 23개 키에도 `table` 이 없다.
  그래서 여백 4/8·8/8, 헤더 높이 26, 셀 높이 37/38, 반경 4 는 **아무도 대조하지 않는다.** 위
  Specification 이 적은 1px 어긋남이 게이트를 통과하는 이유가 그것이다.
  [DS-D-0025](../governance/decisions/DS-D-0025-figma-as-projection.md)가 table 을 "선행
  라이브러리에도 없고 실측 스펙조차 없다"는 다섯(`alert`·`node-chip`·`switch`·`table`·`tabs`) 중
  하나로 적었는데, 컴포넌트가 서고 축·선·그림자 계약이 붙은 지금 **남아 있는 것은 실측 스펙뿐이다.**
  그때까지 기하의 일치는 사람이 확인한다.
- **Figma 의 Align 축에는 `start` 가 있는데 CSS 에는 없다.** `TableHeaderCell`(Align 3) 과
  `TableCell`(Align 3 × State 2) 모두 `start`·`center`·`end` 를 variant 로 갖는다. CSS 에서
  `start` 는 셀렉터가 아니라 기본값이라 `data-align` 을 붙이지 않는 것이 그 상태다. Figma 에서
  `Align=start` 를 고른 사람이 코드에서 `data-align="start"` 를 적으면 **아무 규칙도 걸리지
  않는데 화면은 맞아** 잘못이 드러나지 않는다.
- **Figma 가 셋으로 나뉜 것은 코드의 구조와 다르다.** 머리 칸과 몸 칸이 패딩·타이포·잉크·테두리가
  전부 달라 한 set 으로 묶으면 절반이 거짓 조합이 되기 때문이며(`design/manifest.json` 의 table
  note), CSS 는 그것을 `thead > tr > th` 와 `tbody > tr > td` 라는 **위치**로 가른다. 축 이름이
  양쪽에서 대응하지 않는다.
- **acceptance test 가 0건이다.** 아래 항목들은 아직 사람이 확인하는 목록이다.
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
  버리고 `louis-table` 을 문다(`app/admin/CaptionTemplateManagement.tsx:52`·`:54`) — 흡수가 아니라
  **제품이 스스로 정본으로 넘어온** 경우다. 셋이 둘이 됐고, 위 벌 표의 그 행도 함께 옮겼다.

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
7. 본문 셀의 `border-block-end` 가 1px solid `color-table-row-line` 이고, **마지막 `<tr>` 의
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
17. **light·dark 두 테마에서 행 호버 면이 표 배경과 다른 색이다.** 현재 dark 에서 실패한다(Known
    deviations) — 그 실패가 이 항목의 존재 이유다.
18. 한 줄짜리 본문 행의 `getBoundingClientRect().height` 가 **38px** 이고 마지막 행만 37px 이며,
    머리 행이 26px 이다. Figma 조립본 `Table` 의 137 과 어긋나는 139 가 현재의 실측이다 —
    위 Specification.
