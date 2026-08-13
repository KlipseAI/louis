---
id: project-grid
status: experimental
authority: normative
---

# Project Grid

Project Grid는 archive home, NodeCanvas hub, Video Editor history, Highlight history처럼 프로젝트를
탐색하는 공용 패턴이다. 핵심 계약은 **main content에 실제로 생긴 공간만큼 열 수가 늘고 줄어든다**는
것이다. 데스크톱 홈을 임의의 3열로 고정하지 않는다.

## Use when

- 동일한 중요도의 프로젝트를 썸네일 중심으로 탐색할 때
- 프로젝트 종류가 달라도 open, rename, delete 같은 공통 동작을 제공할 때
- 최근 항목 한 행 또는 전체 archive 여러 행을 보여줄 때

순서 비교가 핵심인 표, 작은 텍스트 레코드, 타임라인 결과에는 Data Table 또는 List 패턴을 사용한다.

## Anatomy

```text
Project section
├─ Section header
│  ├─ Label
│  ├─ Optional count
│  └─ Primary or overflow action
├─ State region
│  ├─ Loading / error / empty
│  └─ Grid
│     └─ Project card
│        ├─ Primary open action
│        │  ├─ Preview
│        │  ├─ Type / status
│        │  ├─ Title
│        │  └─ Updated time
│        └─ Overflow menu trigger
└─ Pagination or load-more sentinel when needed
```

카드 전체를 클릭 가능하게 보이게 하면서 focus 불가능한 `<article onClick>`로 구현하지 않는다. open은
명시적인 link 또는 button이 소유하고, overflow menu는 그 안에 중첩하지 않은 형제 컨트롤이어야 한다.

## Layout contract

### Column behavior

- Grid는 shell content box 안의 가용 폭을 모두 사용한다.
- 열 수는 component container에서 계산하며 sidebar의 expanded/collapsed 변화에도 다시 계산한다.
- 같은 상태에서 카드는 동일한 column track을 사용하고, 마지막 행이 덜 차더라도 앞선 카드 폭을 임의로
  늘리지 않는다.
- 카드가 승인된 최소 사용 폭보다 작아지기 전에 열 수를 줄인다. 최소 폭은 card primitive와 함께
  token으로 승인하며 이 문서에서 새 literal을 만들지 않는다.
- extra-wide에서 열 수를 늘려 정보 밀도를 유지한다. max-width로 전체 grid를 3열 폭에 가두지 않는다.
- gap은 공용 grid gap token을 사용하고 열 수가 달라져도 동일한 rhythm을 유지한다.

### Migration compatibility

아래 결과는 승인된 migration compatibility profile이다. 구현은 container 기반으로 바꾸되,
기준 viewport와 기본 App Shell 상태에서 아래 결과를 유지한다.

| Current viewport | Compatibility result |
| ---------------- | -------------------- |
| `≤719px`         | 2열                  |
| `720–1199px`     | 3열                  |
| `1200–1799px`    | 4열                  |
| `≥1800px`        | 5열                  |

profile의 추출 provenance는 [`KP-GRID-001`](../../migration/product-baseline.md)에 있다.
wide/extra-wide에서 3열만 보이면 실패다.

Container 기반 구현에서는 viewport가 경계 안에 있어도 expanded sidebar, inspector, split pane 등으로
실제 container가 좁으면 열 수를 줄일 수 있다. 반대로 sidebar가 접혀 유효 폭이 늘면 같은 viewport에서
열 수가 늘 수 있다. 어떤 경우에도 카드가 겹치거나 horizontal scroll을 만들면 안 된다.

### Home one-row variant

- archive home의 “최근 작업한 프로젝트”는 한 행만 보여준다.
- 로드할 항목 수는 **현재 실제 열 수**와 같아야 한다.
- resize로 열 수가 늘면 기존 카드 순서와 화면을 유지한 채 부족한 항목만 채운다. 전체 grid를 빈 상태로
  되돌리거나 순서를 흔들지 않는다.
- 열 수가 줄면 숨겨진 항목을 삭제한 것으로 취급하지 않는다. “전체 보기” 또는 archive route에서 계속
  접근 가능해야 한다.
- SSR 결과와 hydration 후 열 수가 달라도 layout shift를 최소화하고 중복 요청이 프로젝트 순서를 바꾸지
  않아야 한다.

한 행 소비처는 실제 열 수를 request limit과 동기화한다. resize에서는 기존 카드와 순서를 유지하며
부족분만 채우고 blank/flicker를 만들지 않는다.

### Archive variant

- 전체 archive는 여러 행을 허용하고 pagination 또는 incremental loading을 사용한다.
- 새 데이터를 붙일 때 기존 DOM 순서와 focus를 유지한다.
- 정렬 기준은 API와 UI가 같은 필드를 사용해야 한다. rename/update 후 화면 순서와 상대 시간이 서버
  정렬과 달라지지 않게 한다.
- loading sentinel은 마지막 카드와 같은 grid cell인 척하지 않고 상태 region으로 노출한다.

## Card behavior

### Primary action

- preview, title, metadata를 포함하는 하나의 명확한 open target을 제공한다.
- Enter로 열 수 있어야 하며 새 탭 열기 같은 브라우저 link 동작이 필요한 경우 실제 link를 사용한다.
- hover, focus-visible, pressed 상태는 같은 geometry를 사용하고 색만으로 상태를 구분하지 않는다.
- preview 비율은 현재 square card를 migration compatibility로 유지한다. 다른 비율은 card variant 결정과
  썸네일 생성 계약을 함께 바꿀 때만 추가한다.

### Overflow menu

- menu trigger는 pointer, touch, keyboard에서 항상 도달 가능해야 한다. hover에서만 나타나더라도
  `focus-within`, coarse pointer에서는 보인다.
- trigger는 카드 open action을 실행하지 않도록 event와 DOM ownership을 분리한다.
- menu는 grid/card overflow에 잘리지 않아야 하며 floating layer 또는 승인된 overlay root를 사용한다.
- `aria-haspopup`, `aria-expanded`, menu name을 제공하고 Arrow keys, Home/End, Escape, focus return을
  지원한다.
- rename/delete 뒤 focus를 다음 논리 카드 또는 section heading으로 이동한다.

### Preview and metadata

- 콘텐츠 이미지에는 프로젝트를 구분할 수 있는 대체 텍스트를 제공하거나, 같은 link 안의 제목이 이름을
  제공하면 preview 이미지는 장식으로 숨긴다.
- title과 status를 영상 위에 올릴 때 썸네일 톤에만 의존하지 않고 모든 테마/이미지에서 읽을 수 있는
  overlay recipe를 사용한다.
- type, failure, processing 상태는 색뿐 아니라 label로 전달한다.
- 상대 시각은 locale에 맞추고 보조 기술이 이해할 수 있는 완전한 날짜를 함께 제공한다.

## States

| State               | Contract                                                                              |
| ------------------- | ------------------------------------------------------------------------------------- |
| Initial loading     | 예상 grid 구조를 보존하는 skeleton 또는 구체적인 loading status를 제공한다            |
| Incremental loading | 기존 카드를 제거하지 않고 section에 `aria-busy`를 설정한다                            |
| Empty               | 무엇이 비었는지와 가능한 다음 행동을 제공한다                                         |
| Error               | empty와 구분하고 재시도 또는 복구 행동을 제공한다                                     |
| Rename              | title 위치에서 편집하되 입력 label, Enter/Escape, validation, focus return을 제공한다 |
| Delete pending      | 대상 이름과 영향을 확인하고 성공 전 카드를 제거하지 않는다                            |
| Processing project  | progress/status label을 유지하고 open 가능 여부를 명시한다                            |

로딩 표현은 [Loading](loading.md), 버튼과 focus 기준은
[Inclusive Design](../foundations/inclusive-design.md)을 따른다.

## Responsive behavior

| Mode        | Section header                                          | Grid                                      | Card actions                               |
| ----------- | ------------------------------------------------------- | ----------------------------------------- | ------------------------------------------ |
| Regular     | label/count와 primary action을 한 행에 둔다             | container 폭에 따라 3–5열 호환 결과       | hover와 focus에서 overflow 표시            |
| Constrained | 긴 label과 action이 충돌하면 action을 menu화하거나 wrap | usable card width를 먼저 보장하고 열 감소 | 필수 액션은 focus/touch에서 항상 표시      |
| Compact     | label과 action이 필요하면 wrap 가능                     | 현재 호환 결과 2열                        | touch target을 카드 모서리와 안전하게 분리 |

열 수와 데이터 요청 수는 같은 column calculation 결과를 공유한다. CSS는 4열인데 JS가 3개만 요청하는
식으로 서로 다른 breakpoint 표를 복제하지 않는다.

## Accessibility

- section heading과 grid를 `aria-labelledby`로 연결한다.
- 단순 CSS grid는 별도 `role="grid"`를 붙이지 않는다. 복합 grid keyboard model을 구현하지 않는 한
  native link/button 목록으로 둔다.
- DOM과 시각적 프로젝트 순서를 일치시킨다.
- 모든 card open action과 menu trigger에 명확한 focus-visible indicator를 제공한다.
- drag/reorder를 도입하면 keyboard 대체 동작과 현재 위치 안내를 함께 제공한다.
- reduced-motion에서 staggered card entrance와 scale transition을 제거해도 콘텐츠가 즉시 보여야 한다.

## Extraction baseline

Home, Video Editor history, Highlight history/clip에서 2/3/4/5열과 한 행 요청 개수를 사용한 결과는
migration compatibility로 보존한다. 비규범 provenance는
[`KP-GRID-001`](../../migration/product-baseline.md)에 있다.

Scene별 markup, viewport-only query, keyboard로 열리지 않는 card, local overflow menu와 불안정한
refetch 순서는 공용 recipe로 가져오지 않는다.

## Pre-implementation blockers

- P2 local RC에 `layout-project-card-minimum`과 `layout-project-grid-gap` 토큰은 있다. 이를 소비하는 container
  기반 공용 grid recipe와 실제 카드 content 실측은 아직 없다.
- link/button primary action과 overflow overlay test가 없다.
- loading/error/empty state와 resize/refetch 안정성 contract가 구현되지 않았다.
- Highlight history/clip variant의 visual regression이 없다.

## Acceptance tests

- Home recent, Video Editor history, Highlight history/clip 소비처가 네 기준 viewport 구간에서 2/3/4/5열
  호환 결과를 내며 wide 화면이 3열에 고정되지 않는다.
- 각 기준에서 sidebar expanded/collapsed를 전환해 grid가 실제 content box에 맞게 재계산되고 겹침·가로
  scroll이 없다.
- archive home은 정확히 한 행을 채우고 resize 중 기존 카드가 사라지거나 순서가 바뀌지 않는다.
- keyboard만으로 모든 카드를 열고 overflow menu의 모든 항목을 실행한 뒤 focus가 복원된다.
- touch/coarse pointer에서 overflow trigger를 hover 없이 찾고 누를 수 있다.
- empty, initial loading, incremental loading, request failure를 시각·접근성 트리에서 구분한다.
- 200% 확대와 KO/EN/JA 긴 제목에서 open target과 menu가 겹치지 않는다.
- light/dark, 밝고 어두운 썸네일, reduced-motion에서 title/status/focus가 읽힌다.
