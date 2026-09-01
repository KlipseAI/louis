---
id: decision-state-is-a-variant-axis
status: experimental
authority: normative
---

# DS-D-0040 상태는 표면 하나의 축이다 — 골격이 바뀔 때만 표면이 갈린다

- Status: accepted
- Date: 2026-09-01
- Owners: repository owner (판단 위임), design system maintainer
- Affects: `decision-product-surface-denominator`, `governance-figma-component-authoring`

## Context

[DS-D-0037](DS-D-0037-product-surface-denominator.md)은 「한 컴포넌트의 여러 시각 상태는 표면
1개로 센다」를 한 줄로 적었다. **판정 규칙 없이 적었다.** 그래서 원장에 그 줄을 어떻게 적용하는지가
남았고, `scoped` 27건이 그 미결에 매달렸다.

그리고 그 한 줄은 실제로는 두 가지를 말하고 있었다. 열거기는 로딩 상태를 **별 표면으로
열거한다** — 모듈 최상위의 PascalCase 컴포넌트이므로 분모에 든다. 접히는 것은 열거가 아니라
**판정**이다. 원장이 스켈레톤 일곱을 「부모 표면의 loading 상태」라는 사유로 `scoped` 에 둔 것이
그 접기이고, 그 접기의 기준이 어디에도 없었다.

```sh
node -e "const j=require('./migration/product.surfaces.json');
for (const [k,v] of Object.entries(j.surfaces))
  if (v.verdict==='scoped' && /Skeleton/.test(k)) console.log(k.split('#')[1])"
# → StaticCreateDemoSkeleton ChartSkeleton ContentTableSkeleton MetricCardsSkeleton
#   ReportKpiRowSkeleton ReportPrimaryBlockSkeleton PickerSkeleton
```

**소유자가 판단을 위임했고** 이렇게 정했다 — 「상태는 원칙적으로 표면 1개의 variant 축이되,
골격 자체가 다르면 별 표면이다.」 근거는 둘이다. Figma variant 가 정확히 그 일을 하려고 있는
기능이고, 상태를 별 컴포넌트로 세우면 같은 카드가 셋으로 갈려 하나를 고칠 때 셋을 고쳐야 한다.

이 문서가 하는 일은 그 판정에 **다음 사람이 기계적으로 적용할 수 있는 시험**을 붙이는 것이다.
「골격이 다르다」는 그대로는 판정이 아니라 느낌이다.

## Decision

**상태는 표면 하나의 축이다.** 별 표면이 되는 길은 둘뿐이고, 아래 시험을 통과해야 한다.

본 상태를 그리는 자리와 그 상태를 그리는 자리를 나란히 놓고 셋을 묻는다.

| # | 무엇을 묻나 | 걸리면 |
| --- | --- | --- |
| 1 | **자식 구성** — 자식의 *집합*이 다른가. 본 상태에 없던 **종류**의 자식이 들어오거나, 같은 자식이 **다른 개수로** 반복되는가 | **별 표면** |
| 2 | **배치** — 자식 구성은 같은데 놓이는 방식만 다른가(축 전치 · 열 수 · 정렬) | **축이다** (단독으로는 표면을 가르지 않는다) |
| 3 | **자리의 주인** — 본 상태를 소유한 표면이 원장에 **있는가**. 없다면(화면이 인라인으로 그린다) 그 상태는 붙을 축이 없다 | **별 표면** |

정리하면 이렇다.

> **자식 구성이 다르거나(1), 붙일 표면이 없으면(3) 별 표면이다. 배치만 다르거나(2) 색·불투명도·
> 문구·글리프만 다르면 표면 하나의 축이다.**

자식이 **감춰지는 것**은 1에 해당하지 않는다. 그것은 오토레이아웃의 정상 결과이고,
`figma-component-authoring` §2 가 이미 그 구분을 갖고 있다.

### 두 층을 섞지 마라

이 시험은 **표면을 몇 개로 셀 것인가**를 정한다. 표면이 하나로 정해진 다음에
[figma-component-authoring](../figma-component-authoring.md) §2 의 네 시험이
**그 축이 VARIANT 인가 BOOLEAN 인가**를 정한다. 순서가 있다.

섞으면 「BOOLEAN 으로 못 그리니까 별 컴포넌트」라는 잘못된 추론이 나온다. 네 시험은 축의
*형태*를 정하는 것이지 축의 *존재*를 부정하지 않는다 — §2 가 연 조건 축 일곱(`Checked` ·
`Selected` · `Invalid` · `Expanded` · `Featured` · `Collapsed` · `Loading`)이 전부 「BOOLEAN 으로
못 그리지만 한 컴포넌트의 축」인 자리다.

### 시험을 실제로 돌린 셋

**`ContentTableSkeleton` → 축.** 섹션 카드·안쪽 패널·표 행 격자를 그대로 두고 셀의 내용만
시머로 바꾼다. 자식의 종류도 개수도 같고(1 통과), 배치도 같으며(2), 본 상태의 주인이
`ContentTable.tsx#AnalyticsContentTable` 하나로 지목된다(3 통과). 원장의 현재 판정과 같다.

**`ReportKpiRowSkeleton` → 별 표면.** 이것은 KPI 카드 **넷의 행**을 자기 프레임 안에 갖는다.
그런데 본 상태의 그 행은 어느 표면도 소유하지 않는다 — 화면이 인라인으로 그린다. 시험 3에
걸린다. **축은 표면에 붙는 것이고, 붙일 표면이 없으면 붙일 데가 없다.** 원장은 이것을
`AnalyticsOverviewTab` 의 로딩으로 접어 두었는데, 그러면 그 탭 표면의 `Loading` 축이 카드 넷의
행 골격을 통째로 갖게 된다. 소유자가 「합성 스켈레톤」이라고 부른 것이 정확히 이 모양이다.

**`SelectionChrome` → 별 표면.** 원장의 `unclear` 하나다. 노드 선택 테두리인데 단일 선택은 부모
곡률을 상속하고 그룹 선택은 고정 곡률의 사각형이며, **그룹 선택은 어느 노드에도 속하지 않는다.**
시험 3에 걸린다 — 각 노드의 `Selected` 상태 축으로만 두면 그룹 선택을 그릴 자리가 아예 없다.

### 경계 사례 — 규칙이 답을 주지만 그 답이 다른 문을 두드린다

`PhotoGrid.tsx#ImageStrip` 과 `PhotoSection` 이다. 원장의 `unclear` 이고, 사유가 이미
「소유자가 한 번 정해 주면 이 도메인 밖에서도 반복해 쓸 수 있다」고 적어 둔 자리다.

내용이 같다 — 메인 이미지 블록 + 참조 슬롯 행 + 태그 칩. 다른 것은 배치다(2열 그리드 ↔ 가로
스트립, 고정 flex-basis, 참조 행의 모서리가 더 작다). **시험 2만 걸린다 → 표면 하나 +
`Layout` 축이다.**

이것이 경계인 이유는 두 가지다.

- **모서리가 함께 바뀐다.** 그것은 배치가 아니라 스타일이라 「2만 걸린다」는 판정이 흔들려
  보인다. 흔들리지 않는다 — 스타일 차이는 §2 의 시험 1에 걸려 그 축을 BOOLEAN 으로 못 쓰게
  만들 뿐, 표면을 가르지 않는다. **두 층을 섞지 마라**가 여기서 실제로 값을 한다.
- **`Layout` 은 축 어휘 표에 없는 이름이다.** 그러면 §2 의 「표에 없는 축을 새로 만들려면 이
  문서를 먼저 고친다」가 발동한다. 즉 이 규칙이 낸 답은 **다음 사람에게 다른 문서의 일을
  만든다.** 그것이 결함이 아니라 설계다 — 축 어휘가 닫혀 있는 이유가 그것이고,
  PaneDivider 의 `Orientation` 이 같은 경로로 열렸다.

**선례가 그 방향을 지지한다.** PaneDivider 는 기하가 90° 전치되는데도(4×60 ↔ 60×4) 컴포넌트
하나의 `Orientation` 축이다. 배치가 그만큼 바뀌어도 표면은 갈리지 않았다.

### 왜 전수를 채우지 않는가

축을 연다는 것이 그 축의 모든 조합을 그린다는 뜻은 아니다. 참고 파일
`IWohxdWtibbqKNKayhhkLN`("Linear Design System (Community)")의 Button 이 그 예다 — 축 다섯
(Hierarchy 4 · State 4 · Size 4 · Icon 2 · Destructive 2)의 전수는 256인데 **실제 variant 는 28**
이고, 격자에 빈 칸이 눈에 띄게 많다. `Destructive=True` 는 Primary/Medium 에만, `State` 는 셋만,
Banner 는 Small 만 있다. 쓰는 조합만 그렸다.

이 저장소의 같은 규범이 「쓰지 않는 계단은 사다리가 아니다」다
([DS-D-0027](DS-D-0027-control-size-ladder.md) · [DS-D-0030](DS-D-0030-no-duplicate-role-tokens.md)).
Linear 수는 2026-09-01 에 그 파일을 `get_metadata` 로 읽어 얻었고, **이 저장소의 게이트가 재지
않는 참고**다.

## Alternatives

- **상태마다 컴포넌트를 세운다.** 각 상태를 독립적으로 그릴 수 있는 것이 이득이다. 대가는
  소유자가 지목한 그대로 — 같은 카드가 셋으로 갈려 하나를 고칠 때 셋을 고쳐야 하고, 셋이 갈리는
  날 어느 것이 정본인지 판정할 자가 없다. 그리고 Figma variant 가 정확히 이 문제를 위해 있다.
- **골격 판정 없이 「상태는 언제나 축」으로 못박는다.** 규칙이 가장 짧다. 그런데 `SelectionChrome`
  의 그룹 선택과 합성 스켈레톤은 **붙을 표면이 없어서** 그리지 못하게 된다. 규칙이 짧아진 대신
  표현할 수 없는 것이 생기는 교환이고, 이 저장소는 같은 교환을 Button 의 `Icon` 축에서 이미
  반대로 판정했다(200 변형이 되더라도 표현 못 하는 것보다 낫다).
- **원장에서 상태 컴포넌트를 열거하지 않는다.** 열거기가 AST 에서 내는 것을 사람이 걸러 내는
  일이라, DS-D-0037 이 없애려던 「손으로 타이핑한 목록」이 열거기 안으로 되돌아온다.

## Consequences

- 원장의 상태 계열 판정에 적용할 기준이 생겼다. 시험을 돌리면 지금 `scoped` 인 것 일부가
  `needed` 로 뒤집힌다 — 합성 스켈레톤 계열과 `SelectionChrome` 이 그 후보다.
- `needed` 가 느는 것은 후퇴가 아니다. DS-D-0037 이 그 래칫을 일부러 열어 둔 이유가 이것이고,
  이 결정은 그 판단의 첫 소비자다.
- `unclear` 12 중 둘(`SelectionChrome` · `ImageStrip`)에 답할 규칙이 생겼다. **이 문서가 그 둘을
  원장에서 옮기지는 않는다** — 아래 참조.

## Rollout and verification

**이 변경에서 한 것은 규칙을 문서로 세운 것뿐이다.** 요구되지만 아직 하지 않은 일을 적는다.

1. 원장 `migration/product.surfaces.json` 의 상태 계열 판정을 이 시험으로 다시 돌린다.
   뒤집히는 것은 `needed` 로 옮기고 `weight` 를 붙인다.
2. `SelectionChrome`(별 표면) · `ImageStrip`(표면 하나 + `Layout` 축)을 `unclear` 에서 내린다.
3. `ImageStrip` 이 요구하는 `Layout` 축 어휘를
   [figma-component-authoring](../figma-component-authoring.md) §2 표에 올린다 — 축 어휘가 닫혀
   있으므로 그 문서를 먼저 고쳐야 그릴 수 있다.

검증: `pnpm check` · `node ./scripts/verify-doc-paths.mjs` ·
`node ./scripts/verify-record-citations.mjs` · `pnpm verify:ci`.

### 2026-09-01 후속 — 1 이 들어갔고 규칙이 원장 안으로 들어갔다. 2·3 은 남는다

**규칙이 파일 안으로 들어갔다.** 원장에 `$stateRule` 이 생겼고 `$verdictRule` 옆에 놓였다.
`check-figma-surface-coverage` 가 그 존재와 길이를 검사하며, 지우면 실패한다 —
`verify-gates` 의 카나리아 `figma surface coverage missing state rule` 이 그 빨강을 증명한다.
규칙이 문장으로만 있으면 다음 사람이 다르게 적용한다는 것이 이 결정의 전제였다.

**시험을 원장의 상태 계열 판정 스물하나에 다시 돌렸다.** 「상태 축」이라고 부를 수 있는
`scoped` 를 사유로 걸러 전부 제품 코드(앵커 `ae8fd627`)와 대조했다. 뒤집힌 것은 **둘**이다.

- `analytics/shared.tsx#ReportKpiRowSkeleton` → **`needed`(medium).** 이 문서가 예고한
  그대로 시험 ③에 걸린다. 확인한 것이 하나 더 있다 — 스켈레톤 카드는 `REPORT_KPI_CARD` 인데
  실물 카드는 `KPI_CARD_V2`(바깥 헤더 + 안쪽 흰 박스 `KPI_CARD_INNER` + 스파크라인 슬롯)라
  **같은 카드의 로딩 상태가 아예 아니다.**
- `node-canvas-v2/nodes/TextNode.tsx#LlmResponseArea` → **`needed`(high).** 시험 ①에 걸린다.
  네 갈래가 자식의 집합을 서로 바꾸고, 그중 변형 선택 갈래는 `LLM_VARIANT_CARD` 를
  `variants.map` 으로 **N개** 반복한다 — 본 상태에 없던 종류의 자식이고 개수가 데이터로
  정해진다. 그 카드를 소유한 표면도 따로 없다.

**나머지 열아홉은 축으로 남았다.** 노드의 생성/처리/빈 미디어 상태 다섯
(`ImageNode#GeneratingState` · `ImageNode#ImagePlaceholder` · `VideoNode#VideoGeneratingState` ·
`VideoNode#VideoPlaceholder` · `EditNode#ProcessingState`)은 노드 프레임을 그대로 두고 결과
미디어 슬롯의 내용만 바꾼다 — 시험 ①②③ 모두 통과한다. `EditNode#ProcessingState` 의 진행
막대는 새 자식처럼 보이지만 Figma `ProgressBar` 정본이 이미 있어 그 State 변형이 인스턴스로
담는다. `ChartSkeleton` · `ContentTableSkeleton` · `ReportPrimaryBlockSkeleton` ·
`PickerSkeleton` 은 부모 표면이 원장에 있고 컨테이너 사슬이 같다.

판정은 그대로 두고 **사유만 실측으로 고친 것이 둘** 있다.

- `MetricCardsSkeleton` — 시험 ③으로 보면 별 표면이 될 자리인데 **앵커에서 한 번도 렌더되지
  않는다.** 유일한 호출부가 `ReportPrimaryBlockSkeleton` 의 `metricCardsCount > 0 &&` 이고,
  그 컴포넌트의 호출 네 곳(`OverviewTab:242,243` · `InstagramAnalyticsScene:1214,1215`)이 전부
  `metricCardsCount={0}` 을 넘긴다. 그리지 않는 것을 Figma 에 세울 수는 없다. 호출부가 0 이
  아닌 값을 넘기는 날 뒤집힌다 — 그 조건을 사유에 적어 두었다.
- `ReportPrimaryBlockSkeleton` — 축으로 남지만 실물과 갈린 두 축을 사유에 남겼다. 스켈레톤은
  블록 맨 위에 `SKELETON_BLOCK_EYEBROW` 를 하나 더 그리고, 실물이 갖는 안쪽 흰 박스
  (`PRIMARY_INNER_PANEL`)를 그리지 않는다. Loading 축을 그릴 때 어느 쪽이 정본인지 먼저
  정해야 한다.

**위 Context 의 `node -e` 출력은 이 재판정 이전 상태다.** 지금 다시 돌리면 일곱이 아니라
여섯이 나온다.

**2·3 은 하지 않았다.** `SelectionChrome` 과 `ImageStrip` 은 `unclear` 에 그대로 있다. 둘을
함께 내리려면 `ImageStrip` 이 요구하는 `Layout` 축을
[figma-component-authoring](../figma-component-authoring.md) §2 의 축 어휘 표에 먼저 올려야
하고(어휘가 닫혀 있다), 그 문서 변경 없이 `SelectionChrome` 만 옮기면 이 결정이 한 쌍으로
판정한 것을 반쪽만 실행하는 셈이 된다.
