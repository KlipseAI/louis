---
id: responsive-layout
status: beta
authority: normative
---

# Responsive Layout

Klipse의 반응형 레이아웃은 화면 폭별 시안을 모아 놓은 규칙이 아니라, **사용 가능한 공간이 바뀌어도
기능의 소유권과 정보 우선순위가 유지되는 계약**이다. 아래 rule과 compatibility profile은 이 저장소가
소유하는 규범이다.

## 용어

| 용어                | 의미                                                                | 판단에 사용한다                          |
| ------------------- | ------------------------------------------------------------------- | ---------------------------------------- |
| Viewport            | 브라우저가 현재 제공하는 가시 영역                                  | 앱 셸 모드, safe area, 모바일 내비게이션 |
| Shell content box   | 내비게이션과 바깥 인셋을 제외한 실제 제품 영역                      | 페이지 그리드, 에디터 호스트             |
| Component container | 재사용 컴포넌트가 실제로 받은 영역                                  | 카드 열 수, 패널 재배치, 내부 밀도       |
| Compact mode        | 지속 사이드바를 둘 수 없어 overlay navigation으로 전환한 상태       | 셸·내비게이션 동작                       |
| Constrained mode    | 데스크톱 입력은 유지하지만 모든 보조 패널을 동시에 놓기 어려운 상태 | 에디터 패널 축소·접기                    |

Viewport 폭과 content box 폭은 같지 않다. 사이드바가 펼쳐지거나 접히면 같은 viewport에서도 content
box가 달라진다. 따라서 페이지와 컴포넌트의 열 수를 viewport만 보고 결정하지 않는다.

## Target rules

### 1. 소유자가 맞는 공간을 측정한다

- App Shell만 viewport와 persistent/overlay navigation 전환을 소유한다.
- 페이지 패턴은 shell content box를 기준으로 배치한다.
- 재사용 컴포넌트와 프로젝트 그리드는 component container를 기준으로 적응한다.
- 기능 컴포넌트가 전역 사이드바 폭이나 `window.innerWidth`를 직접 조합해 자기 폭을 만들지 않는다.
- 하나의 상태에서 sidebar width, main offset, main width는 같은 레이아웃 원천을 읽어야 한다.

Container query를 쓰는지 ResizeObserver를 쓰는지는 구현 선택이다. 계약은 **실제 받은 공간으로 결과를
결정한다**는 데 있다.

### 2. 폭이 줄면 정보 우선순위대로 변한다

1. 장식과 낮은 우선순위 메타를 축소한다.
2. 보조 액션을 menu 또는 sheet로 옮긴다.
3. 보조 패널을 접거나 순차 탐색 구조로 바꾼다.
4. persistent navigation을 overlay drawer로 바꾼다.
5. 핵심 작업 영역은 마지막까지 유지한다.

콘텐츠를 겹치게 두거나 잘라서 맞추는 것은 반응형 단계가 아니다. 지원 가능한 최소 공간보다 작으면
compact 구조 또는 명시적인 지원 범위 안내로 전환한다. 문서 전체에 `min-width`를 걸어 우연히 충돌을
피하는 방식은 목표 계약이 아니다.

#### 축약 시 래퍼 처리 — 소거와 용해를 구분한다

2열이 1열로 축약될 때 **남는 열의 래퍼를 어떻게 처리하는지가 결과를 가른다.** 제품은 두 가지를
구분해 쓴다 — 사라지는 쪽은 `display: none`, 남는 쪽의 래퍼는 `display: contents`다.

- 배경·테두리·패딩을 가진 실제 표면이면 `display: none`으로 소거한다.
- 남는 열의 래퍼가 배경도 테두리도 없는 순수 레이아웃 상자면 `display: contents`로 **그리드에서
  녹인다**. 자식이 페이지 그리드의 직접 자식이 되어 부모의 `place-items: center`를 그대로 받는다.
- 래퍼가 `role`·`aria-*`·랜드마크를 가지면 `display: contents`를 쓰지 않는다. 브라우저·보조기술
  조합에 따라 그 의미가 접근성 트리에서 누락된 이력이 있어, 의미를 지고 있는 래퍼는 용해가
  안전하지 않다. 아래 절 3의 「숨긴 영역은 … 접근성 트리에서도 제거한다」와 같은 축이지만,
  여기서는 **의도하지 않은 제거**가 문제다.
- `display: contents` 호스트는 `getBoundingClientRect()`가 0을 반환한다. 계측할 때는 호스트가
  아니라 첫 자식을 잰다.

래퍼를 `display: none`으로 지우고 카드를 다른 컨테이너에 옮겨 붙이면 DOM 순서가 바뀌어 「DOM
순서와 compact에서 보이는 순서가 일치해야 한다」를 깬다. 반대로 래퍼를 살린 채 1열로 만들면
중첩 그리드가 하나 더 생겨 `place-items`가 두 번 적용되고 카드가 이중으로 중앙 정렬된다.
**둘 다 틀린다.**

인증 표면이 720px 경계에서 이 규칙을 그대로 쓴다. 통합 판 `76b6cf15` 에서 페이지 그리드와 브랜드
패널은 라우트 그룹 `(auth-brand)` 의 레이아웃 한 벌로 모였고(일곱 화면), 폼 패널(래퍼)은 로그인 ·
회원가입 · 상태 카드 세 벌이 각자 갖는다.

| 요소          | `≤719px`                                                                         | `≥720px`                                                                                               |
| ------------- | -------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| 페이지 그리드 | 1열 `grid` · `place-items: center` · 패딩 16px | `grid-template-columns: minmax(0,1fr) minmax(0,1fr)` · `place-items: stretch` · `gap: 20px` · 패딩 20px |
| 브랜드 패널   | `display: none`                                                                    | `display: flex`                                                                                            |
| 폼 패널(래퍼) | **`display: contents`**                                                            | `display: grid` · `place-items: center` · `min-width: 0` · `overflow-y: auto`                            |

근거: 페이지 그리드는 `(auth-brand)/layout.tsx:21-28` 의 `PAGE` 한 벌, 브랜드 패널 `AuthBrandPanel.tsx:18`·`:20`,
폼 패널 `AuthStatusCard.tsx:18-20` · `login/page.tsx:22-26` · `(auth-brand)/signup/page.tsx:22-27`. 폼 패널 래퍼가 `role`도 `aria-*`도 없는 평범한 `<div>`라 용해해도 안전하다 —
`AuthStatusCard.tsx:72`.

작성 형태는 두 가지가 병존한다. 기본값을 `contents`로 두고 `min-width: 720px` 한 분기만 얹는
형태와, `max-width: 719px` / `min-width: 720px` 상호배타 두 분기로 가르는 형태다. 계산 결과가
같으므로 이 규범은 **결과만 고정하고 표기는 열어 둔다.**

### 3. 레이아웃 안전 규칙

- 가변 grid/flex 자식은 `min-width: 0`과 필요한 경우 `min-height: 0`을 가져야 한다.
- `100vw`와 persistent sidebar offset을 같은 축에 더하지 않는다.
- viewport 고정 요소는 safe-area inset을 포함하고, 동적 브라우저 UI가 있는 환경에서는 검증된 가시
  높이 원천을 사용한다.
- 페이지에는 한 개의 primary scroll root만 둔다. 내부 편집기는 패널별 scroll을 가질 수 있지만 문서
  스크롤과 경쟁하지 않아야 한다.
- 숨긴 영역은 시각적으로만 감추지 않고 focus 순서와 접근성 트리에서도 제거한다.
- 긴 KO/EN/JA 문구와 200% 확대에서 액션이 잘리면 다음 레이아웃 단계로 전환한다.

### 4. breakpoint는 행동 경계다

새 breakpoint는 “이 폭에서 보기 좋다”가 아니라 다음 중 하나가 바뀔 때만 추가한다.

- navigation이 persistent에서 overlay로 바뀐다.
- 프로젝트 카드의 유효 열 수가 바뀐다.
- 핵심 패널을 동시에 표시할 수 없어 접기 또는 순차 구조로 바뀐다.
- 컨트롤의 hit area나 번역 문구가 더 이상 보장되지 않는다.

경계값 변경은 App Shell, Project Grid, Editor Workspace의 기준 화면을 함께 검증하고 결정 기록을 남긴다.

## Compatibility matrix

아래 구간은 monolith 결과를 검토해 **공식 migration compatibility profile**로 채택했다. 구현은
container 기반이어야 하지만 기준 viewport와 기본 shell 상태에서는 같은 기능 밀도를 제공한다.

| 기준 viewport 구간 | Required shell/grid outcome                                          |
| ------------------ | -------------------------------------------------------------------- |
| `≤719px`           | compact shell, reserve 0, overlay drawer, 프로젝트 grid profile 2열  |
| `720–959px`        | constrained shell/workspace, 전역 가로 scroll 금지, grid profile 3열 |
| `960–1199px`       | regular persistent navigation, grid profile 3열                      |
| `1200–1799px`      | wide content, grid profile 4열                                       |
| `≥1800px`          | extra-wide content, grid profile 5열                                 |

이 호환 기준의 비규범 provenance는
[`KP-LAYOUT-001`](../../migration/product-baseline.md)과
[`KP-GRID-001`](../../migration/product-baseline.md)에 있다.

### Auth 표면(로그인 전) 경계 행동

위 표는 App Shell 안쪽, 즉 **로그인 후** 제품 화면의 결과다. 인증 표면은 셸 밖에 있어 같은
경계값에서 다른 일을 한다 — 719/720은 셸의 compact 경계가 아니라 **자기 자신의 2열↔1열
경계**이고, 그 밖의 폭 변화는 슬로건 글자 크기 계단뿐인데 그 계단은 auth 표면이 아니라 슬로건의
타입 클래스(`type-heading-48-semibold`)가 갖는다. 경계값이 같으니 행동도 같다고 읽으면 틀린다.

| 기준 viewport 구간 | Auth surface outcome                                                                                                                                       |
| ------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `≤719px`           | 브랜드 패널 `display: none` · 폼 패널 `display: contents` · 페이지 1열 `place-items: center` · 페이지 패딩 16px · 카드 안 로고 링크 노출 |
| `720–959px`        | 브랜드/폼 2열 `minmax(0,1fr) minmax(0,1fr)` · `gap: 20px` · `place-items: stretch` · 페이지 패딩 20px · 카드 안 로고 링크 숨김 · 슬로건 32px(~767) → 36px(768~) |
| `960–1199px`       | 2열 유지. 슬로건이 1024px에서 36px → 48px로 커진다 — 타입 클래스의 계단이고, 셸이 persistent navigation으로 바뀌는 것과 무관하다 |
| `1200–1799px`      | `1024px` 이후와 같다. 예전의 1200 슬로건 승급은 통합 판에서 걷혔다                                                                                          |
| `≥1800px`          | `1200–1799px`와 같다. grid profile 5열에 대응하는 auth 변화는 없다                                                                                         |

카드 안 로고 링크는 `≥720px`에서 브랜드 패널이 로고를 대신 들기 때문에 숨긴다. 이 대체 관계를
모르고 로고를 항상 노출하면 데스크톱에서 브랜드 마크가 두 번 나온다.

**슬로건 크기는 auth 표면의 분기가 아니다.** 슬로건은 `type-heading-48-semibold` 하나를 쓰고, 크기
계단은 그 타입 클래스가 갖는다 — 기본 48px, `≤1023px` 36px, `≤767px` 32px, `≤479px` 28px
(`globals.css:369-371` · `:844` · `:859` · `:874`). 패널이 `≤719px`에서 숨으므로 28px 단은 보이지 않는다.
예전의 1200 승급(`heading-36-medium` → `heading-48`)은 통합 판에서 걷혔다 — 자기 계단을 가진
클래스 위에 계단을 하나 더 얹으면 서로를 덮기 때문이다. 계단마다 바뀌는 선언은 size뿐이다 —
letter-spacing은 네 단 모두 `-0.02em`, line-height는 `1.35`라 계산된 px만 size를 따라간다.

근거(통합 판 76b6cf15): 2열 분할 · 페이지 패딩은 `(auth-brand)/layout.tsx:21-28` 한 벌(일곱 화면).
브랜드 패널 소거 `AuthBrandPanel.tsx:18`. 1열 축약 `AuthStatusCard.tsx:18` · `login/page.tsx:22` ·
`(auth-brand)/signup/page.tsx:23`. 슬로건 `AuthBrandPanel.tsx:96`. 로고 링크 숨김 `AuthStatusCard.tsx:31` ·
`login/page.tsx:38` · `(auth-brand)/signup/page.tsx:35`.

## Viewport height and safe area

- App Shell이 가시 높이와 safe area를 한 번 계산해 페이지와 workspace에 제공한다.
- 각 Scene이 `100dvh`, `100svh`, JS 주입 높이를 제각각 선택하지 않는다.
- 화면 회전, 모바일 주소창 변화, 소프트 키보드 표시 시 현재 입력과 주요 완료 액션이 가려지지 않아야
  한다.
- 높이가 제한되면 세로 패널의 최소 높이를 서로 경쟁시키지 말고 보조 영역을 접거나 자체 scroll로
  전환한다.

## Accessibility

- DOM 순서와 compact에서 보이는 순서가 일치해야 한다. CSS `order`만으로 읽기 순서를 바꾸지 않는다.
- reflow 후 현재 focus가 제거되는 경우 논리적으로 가장 가까운 컨트롤로 이동한다.
- drawer와 modal은 뒤 콘텐츠를 inert 처리하고, 닫을 때 호출 컨트롤로 focus를 돌려준다.
- hover에서만 나타나는 필수 액션은 touch·keyboard에서 항상 도달 가능한 대안을 제공한다.
- reduced-motion에서는 sidebar, grid, panel 재배치가 즉시 또는 비공간적 전환으로 바뀌어야 한다.

## Extraction decisions

- `720–959px` 전역 horizontal scroll은 목표 동작이 아니라 제거할 호환 편차다.
- sidebar geometry는 App Shell이 제공하는 단일 상태에서 계산한다.
- 프로젝트 열 수와 요청 개수의 동기화는 보존하되 viewport가 아니라 실제 content container를 측정한다.
- compact editor가 viewport를 점유하려면 sidebar reserve 0, drawer closed, safe-area 처리를 함께 검증한다.

제품 관측은 [migration baseline](../../migration/product-baseline.md)에만 남으며 이 규범보다 우선하지
않는다.

## Acceptance tests

- compact 경계의 바로 아래·위에서 sidebar와 main surface 사이에 겹침이나 빈 reserve가 없다.
- expanded/collapsed sidebar 전환 중 main width, 프로젝트 열 수, header 위치가 같은 프레임에서 맞는다.
- 프로젝트 grid 경계의 바로 아래·위에서 기대 열 수가 나오고 카드가 최소 사용성을 잃지 않는다.
- 320px 폭, 200% 확대, KO/EN/JA 긴 문구에서 핵심 탐색·생성·저장·완료 액션을 사용할 수 있다.
- 세로가 짧은 viewport, 화면 회전, 모바일 주소창 변화에서 이중 문서 스크롤이나 잘린 완료 액션이 없다.
- keyboard만으로 drawer, grid card, overflow menu, editor panel을 순서대로 탐색할 수 있다.
- `prefers-reduced-motion: reduce`에서 레이아웃 변화가 의미 손실 없이 동작한다.
- 주요 기준 화면을 light/dark와 sidebar expanded/collapsed 조합으로 시각 회귀 비교한다.

관련 패턴: [App Shell](../patterns/app-shell.md),
[Project Grid](../patterns/project-grid.md),
[Editor Workspace](../patterns/editor-workspace.md).
