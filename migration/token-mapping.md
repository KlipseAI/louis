# Klipse product token mapping

- Captured: 2026-08-13
- Authority: reference, non-normative
- Product repository: `klipse`
- Design-system repository: `klipse-design-system`
- Token source: [`packages/tokens/src/klipse.tokens.json`](../packages/tokens/src/klipse.tokens.json)

이 문서는 Klipse 제품의 legacy CSS custom property와 TypeScript 색상 상수를 독립 디자인 시스템으로
이관하기 위한 작업 근거다. package API, 토큰 값 또는 새 UI의 정본이 아니며, 규범 계약은 `design/`과
구조화 token source가 소유한다. 표의 `확정`도 현재 private P2 package를 production에서 바로 사용할 수
있다는 뜻이 아니다. 지원 release와 생성 artifact가 준비된 뒤 제품 integration에서 적용한다.

## 판정 기준

| 상태      | 의미                                                                                      |
| --------- | ----------------------------------------------------------------------------------------- |
| 확정      | legacy 역할과 새 semantic ID가 일치한다. 지정된 용도에서 단계적으로 교체할 수 있다.       |
| 검토 필요 | 이름은 비슷하지만 mode별 값, 역할 또는 lifecycle이 다르다. blanket alias를 만들지 않는다. |
| 제외      | 제품 scene, 외부 brand, 임시 호환 또는 콘텐츠 값이다. core token source에 넣지 않는다.    |

값이 같은 것과 의미가 같은 것은 별개다. `12px`라는 이유만으로 sidebar padding과 control padding을 같은
semantic token으로 묶지 않으며, 기존 이름 하나가 여러 역할을 맡으면 사용처별로 나눠 이관한다.

## 채택한 DTCG source

P2의 선택된 원본은 DTCG 2025.10 형식의 단일 파일
[`packages/tokens/src/klipse.tokens.json`](../packages/tokens/src/klipse.tokens.json)이다. 다음 이유로 제품의
`design/tokens.yaml` 대신 이 원본을 채택했다.

- primitive와 semantic tier, light/dark mode, 안정 ID와 type이 한 alias graph에 명시된다.
- CSS, JavaScript, TypeScript, resolved JSON과 Figma proposal을 같은 방향으로 생성할 수 있다.
- mode completeness, dangling/cyclic alias, type mismatch, contrast pair와 cross-artifact parity를 검증할 수
  있다.
- 제품 CSS의 selector/cascade와 제품 scene geometry를 token authority에서 분리한다.
- RGB channel, CSS variable, 캔버스 상수처럼 플랫폼별 표현이 하나의 색 원본에서 생성될 수 있다.

제품 구현에서 채택한 값과 P2에서 의도적으로 정규화한 값은 다음처럼 구분한다.

| DTCG 영역                 | 선정 근거                                                                                              |
| ------------------------- | ------------------------------------------------------------------------------------------------------ |
| `primitive.color.neutral` | 제품 `--palette-gray-000..1000`의 고정 ramp를 보존한다. primitive는 theme에 따라 뒤집지 않는다.        |
| `primitive.color.blue`    | 제품 표준 `--primary-50..900`, anchor `#0088ff`를 보존한다. legacy 중간 단계는 제외한다.               |
| red/green/amber primitive | danger/success/warning 역할에 필요한 최소 ramp다. 외부 brand와 editor channel은 분리한다.              |
| spacing/radius primitive  | 제품의 2px rhythm과 반복되는 control/overlay/card 형상을 명시적 값으로 만든다.                         |
| typography primitive      | 고정된 12/14/16/28/36 조합과 KO/EN/JA fallback을 구조화한다. 반응형 마케팅 치환은 제외한다.            |
| semantic light/dark color | 반전 숫자 ramp 대신 background/foreground/border/action/status 역할을 mode별로 resolve한다.            |
| elevation/layer/motion    | 산재한 shadow, z-index, duration을 byte copy하지 않고 lifecycle과 접근성 계약으로 정규화한다.          |
| layout compatibility role | App Shell과 Project Grid 추출에 필요한 관계만 남긴다. route별 좌표를 일반 spacing으로 승격하지 않는다. |

제품의 `design/tokens.yaml`은 `globals.css`와 `tailwind.css`를 역파싱한 생성 스냅샷이다. non-palette root
custom property를 모두 `component_tokens`로 묶어 GNB와 node-canvas 값까지 포함하고, TS/TSX 안에서 선언한
로컬 property와 캔버스 literal은 놓친다. 따라서 provenance와 사용량 조사에는 쓸 수 있지만 P2 source,
schema 또는 자동 import 입력으로 사용하지 않는다.

## 제품 legacy → semantic mapping

아래 ID는 DTCG source의 `com.klipse-design.id`다. 제품은 release된 package의 public export를 소비하고
`src/` 경로나 생성 파일을 deep import하지 않는다.

### 확정

| 제품 legacy/사용 맥락                                       | 새 semantic ID                                | 적용 조건과 근거                                                                         |
| ----------------------------------------------------------- | --------------------------------------------- | ---------------------------------------------------------------------------------------- |
| `--background`, `--app-page-bg`의 page/canvas 사용          | `color-background-canvas`                     | 현재 light `neutral.100`, dark `neutral.900` 관계와 일치한다.                            |
| `--surface-page`                                            | `color-background-canvas`                     | mode 관계는 일치하지만 현재 소비 0건이므로 새 사용을 만들지 말고 legacy 선언만 제거한다. |
| `--foreground`의 body/default content 사용                  | `color-foreground-primary`                    | page 기본 글자 역할에 한정한다.                                                          |
| `.type-caption-12-{regular,medium,semibold}`                | `typography-caption-{regular,medium,semibold}` | 12px, 1.5, letter spacing −0.12px가 일치한다.                                            |
| `.type-body-14-{regular,medium,semibold}`                   | `typography-body-sm-{regular,medium,semibold}` | fixed 14px body에 한정한다.                                                              |
| `.type-body-16-{regular,medium,semibold}`                   | `typography-body-md-{regular,medium,semibold}` | fixed 16px body에 한정하며 450px 전역 축소 규칙은 포함하지 않는다.                       |
| `.type-body-20-{regular,medium,semibold}`                   | `typography-body-lg-{regular,medium,semibold}` | fixed 20px body에 한정한다.                                                              |
| `.type-heading-28-medium`                                   | `typography-heading-sm-medium`                | 배포 화면의 28px heading은 medium 단독이다. semibold 변형은 정의만 되고 사용 0건이다.    |
| `.type-heading-36-medium`                                   | `typography-heading-md-medium`                | 배포 화면의 36px heading은 medium 단독이다.                                              |
| `.type-heading-48-medium`                                   | `typography-heading-lg-medium`                | 배포 화면의 48px heading은 medium 단독이다.                                              |
| `--button-radius: 12px`                                     | `radius-control`                              | Button과 32×32 action control의 공통 형상이다.                                           |
| `--dropdown-radius: 16px`                                   | `radius-overlay`                              | menu/popover panel 형상이다.                                                             |
| `--dropdown-item-radius: 10px`                              | `radius-overlay-item`                         | overlay 내부 interactive item에 한정한다.                                                |
| Home/Highlight/Video Editor history grid의 `12px` gap       | `layout-project-grid-gap`                     | 세 화면의 2/3/4/5열 grid가 같은 rhythm을 사용한다.                                       |
| `--app-gnb-main-inline-padding: 16px`                       | `layout-app-shell-content-inset`              | main content leading inset 관계를 보존한다.                                              |
| `--app-gnb-sidebar-padding-x: 12px`                         | `layout-app-shell-sidebar-padding`            | sidebar 내부 정렬선에 한정한다.                                                          |
| danger/success/warning/info 의미가 확인된 상태 메시지·badge | `color-status-*-{background,foreground}`      | YouTube red나 editor channel처럼 상태가 아닌 accent에는 적용하지 않는다.                 |
| modal scrim 역할이 확인된 overlay                           | `color-scrim-modal`                           | 기존 RGB 재료가 아니라 완성된 semantic scrim을 소비한다.                                 |
| 제거된 전역 focus outline의 대체 ring                       | `color-border-focus` + `elevation-focus-ring` | DS control은 `:focus-visible`에서 둘을 제공해야 한다.                                    |
| `prefers-reduced-motion` 대체                               | `motion-reduced`                              | 0.01ms, 1ms와 `none` 혼용 대신 lifecycle을 보존하는 공용 reduced path를 사용한다.        |

### 검토 필요

이 표의 항목은 codemod나 root alias로 일괄 치환하지 않는다. 화면과 component part를 먼저 분류하고
light/dark, contrast, focus와 visual regression을 통과한 뒤 확정 표로 옮긴다.

| 제품 legacy/상수                                          | 후보 semantic ID 또는 처리                                         | 검토 이유                                                                                       |
| --------------------------------------------------------- | ------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------- |
| `--gray-000..1000`, `--gray-*-rgb`                        | foreground/background/border 역할별 분해                           | theme에 따라 숫자 ramp가 뒤집히고 `--gray-000-rgb` 하나가 글자·면·테두리 alpha를 모두 맡는다.   |
| component가 직접 소비하는 `--palette-gray-*`              | 사용 맥락의 semantic color                                         | primitive 값은 보존됐지만 제품 component의 primitive 직접 소비는 새 계약이 아니다.              |
| `--primary`, `--primary-500`, primary gradient            | `color-action-primary` 계열 또는 component recipe                  | 새 action은 blue.700 기반이고 기존 blue.500/450 gradient와 시각값이 다르다.                     |
| `--primary-on`                                            | `color-foreground-inverse`                                         | legacy는 소비 0건이고 light에서 반전 gray를 참조한다. alias하지 말고 실제 대비 pair를 사용한다. |
| `--surface-raised`, `--surface-input`, `--surface-answer` | background semantic 또는 새 component role                         | 현재 DTCG mode 값과 일치하지 않거나 input/answer 전용 role이 없다. 기존 선언도 소비가 없다.     |
| `--surface-inset*`                                        | `color-background-inset` + state recipe                            | hover/pressed 상태가 별도 color ID로 아직 정의되지 않았다.                                      |
| `--border-input`, `--border-control`                      | `color-border-*`                                                   | legacy mode 값과 새 subtle/default/strong 값이 다르고 소비 0건이다.                             |
| `--dropdown-surface-bg`                                   | `color-background-overlay`                                         | dark는 일치하지만 light legacy `neutral.100`과 새 overlay `neutral.0`이 다르다.                 |
| `--app-tooltip-*` color/radius/shadow/motion              | overlay color + P3 Tooltip component token                         | tooltip은 현재 theme와 반대되는 면을 쓰고 8px/140ms/120ms 전용 계약을 가진다.                   |
| `--glass-dropdown-frame`, bevel shadow                    | `elevation-popover` + overlay border recipe                        | 0.5px frame과 inset bevel은 새 단일 shadow와 동치가 아니다. 조합을 visual review한다.           |
| `--dropdown-ambient-shadow`, tooltip shadow               | `elevation-popover`                                                | legacy 8/15/4%·12/24/12%와 새 8/24/-4/14%가 달라 screenshot 비교가 필요하다.                    |
| modal별 raw shadow와 z-index                              | `elevation-modal`, `layer-modal`                                   | portal host, nested overlay와 critical layer까지 interaction test가 필요하다.                   |
| `--ease-out-strong`                                       | enter lifecycle의 `motion-overlay-enter` 또는 `motion-modal-enter` | curve는 채택됐지만 duration과 lifecycle을 함께 골라야 한다.                                     |
| `--ease-in-out-strong`, 140/150/160/180/220ms 전환        | 새 layout/component motion decision                                | 현재 semantic motion에 동치가 없다. 임의로 `motion-overlay-enter`에 합치지 않는다.              |
| marketing scoped type override와 450px body 축소          | responsive typography recipe                                       | 동일 token 이름의 값을 viewport에서 바꾸면 component 의미가 흔들린다. fixed style과 분리한다.   |
| heading 48, heading/body의 다른 weight 조합               | 새 typography role 또는 제품 marketing recipe                      | 현재 semantic composite에 동치가 없다.                                                          |
| radius 8/14와 standalone의 9999px                         | P3 component role 또는 `radius-pill`                               | primitive 값 일치만으로 semantic 역할을 결정하지 않는다. 999px/full과의 rendering도 확인한다.   |
| `--app-gnb-rail-below-chrome-gap` 등 12px layout 값       | App Shell pattern role                                             | 같은 숫자의 sidebar padding/grid gap으로 치환하면 정렬 관계를 잃는다.                           |
| `--app-shell-min-width`, dynamic sidebar width            | responsive compatibility profile                                   | viewport 최소폭과 collapse/overlay 동작을 함께 검증해야 한다.                                   |
| project card min width와 column thresholds                | `layout-project-card-minimum` + Project Grid recipe                | 현재 제품은 2/3/4/5열 breakpoint를 직접 사용한다. container recipe 전환 후 확정한다.            |
| `--dashboard-*`, `--skeleton-*`                           | Analytics/Skeleton pattern or component token                      | live와 landing demo에 중복되고 일부 값이 다르다. 먼저 reconciliation한다.                       |

### 제외

| 제품 legacy/상수                                          | 처리                                                                                            |
| --------------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| `--primary-350/420/450/550/580/620`                       | 제품 compatibility adapter에 남기고 gradient/analytics 소비가 0이 된 뒤 제거한다.               |
| `--app-gnb-safe-top`, dynamic sidebar width와 route 좌표  | App Shell 제품 integration 또는 향후 pattern recipe가 소유한다. core primitive가 아니다.        |
| `--project-card-overlay-*`                                | Project Card component recipe가 생길 때 검토한다. foundation token으로 올리지 않는다.           |
| `--node-*`, editor handle/channel/chrome geometry         | Editor product extension이 소유한다. core token source에 복사하지 않는다.                       |
| Highlight standalone의 neutral 재정의와 `#ffdd00`         | `highlight.brand.*` extension 또는 삭제 예정 legacy로 유지한다. core blue action을 덮지 않는다. |
| YouTube/Instagram/AWS brand, color-picker spectrum        | 외부 brand/content namespace 또는 제품 코드에 둔다. status color로 치환하지 않는다.             |
| `html { font-size: var(--type-caption-12-size) }` (=12px) | 두 개의 4.5rem 호환용 환산 기준이다(`1rem = 12px`). typography token이 아니며 사용 제거 후 삭제한다. |
| `keyframes.css`의 117개 product animation                 | component/pattern 소유권이 생긴 일부만 semantic motion을 소비하고 나머지는 제품에 남긴다.       |
| 제품 `design/tokens.yaml`과 broad `component_tokens` 분류 | reference snapshot으로만 보존하며 DTCG source로 merge하지 않는다.                               |

## 위험과 통제

### Primitive scope override

현재 light App Shell은 `Gnb.tsx`의 `body:has(&)` scope에서 `--palette-gray-*` 자체를 다른 값으로
재선언한다. 동일 primitive ID가 subtree 존재 여부에 따라 달라지므로 DTCG source, Figma와 캔버스가 같은
색을 보장할 수 없다.

- `color-neutral-*`, `color-blue-*` 같은 DS primitive는 어떤 theme, route 또는 component scope에서도
  override하지 않는다.
- theme는 semantic color만 light/dark alias로 resolve한다.
- App Shell의 다른 면색은 `color-background-*` 또는 제품 adapter의 명시적 app role로 표현한다.
- GNB가 mount됐다는 이유로 `body` palette를 바꾸는 selector는 semantic 이관이 끝나면 제거한다.

### Canvas literal drift

`archiveThumbnail/theme.ts`와 `editorProjectThumbnail.ts`는 DOM CSS를 읽을 수 없다는 이유로 palette를 TS
literal로 복제한다. 이미 제품 CSS의 mint/yellow 값과 캔버스 상수가 다르고, edit disabled handle은 CSS의
violet과 캔버스의 sky가 달라졌다.

- 캔버스는 `@klipse-design/tokens`의 generated JavaScript/TypeScript export를 소비한다.
- DOM용 CSS channel과 canvas RGB tuple은 같은 DTCG color에서 생성한다.
- editor channel처럼 core에서 제외된 값은 제품 extension의 단일 typed source에서 생성한다.
- screenshot만 보지 말고 DOM node, archive thumbnail과 editor thumbnail의 resolved RGB를 자동 비교한다.

### Tailwind layer와 import order

제품은 Tailwind v4 theme/utilities만 layer에 import하고 preflight를 제외한다. layer 밖 `globals.css`와 남은
CSS Module은 utility보다 항상 우선하며, 현재 root layout은 `tailwind.css` 다음에 `globals.css`를 import한다.

- token CSS, Tailwind `@theme inline` bridge, 제품 adapter, component recipe의 layer/import 순서를 integration
  PR에 고정한다.
- Tailwind color utility는 generated semantic custom property를 가리키고 별도 token 값을 소유하지 않는다.
- preflight 도입은 token cutover와 분리한다.
- 같은 요소에서 legacy Module과 새 utility를 반쯤 섞지 않고 component 단위로 전환한다.

### Font와 theme adapter

제품 `--type-font-family`는 Next `localFont`가 주입하는 해시 variable에 의존하고, 별도 `@font-face`의 상대
URL은 canvas/ASS preview parity를 위해 존재한다. theme 또한 SSR cookie, localStorage, system preference와
paint 전 script를 제품이 관리한다.

- DS는 font stack과 typography 값을 제공하고, font asset/preload/Next variable 연결은 제품 adapter가
  소유한다. font package를 별도로 배포하기 전에는 상대 URL을 DS CSS로 복사하지 않는다.
- 제품 adapter가 `data-theme`, `color-scheme`, SSR initial mode와 pre-paint 동기화를 유지한다.
- walkthrough처럼 subtree에 강제 theme가 필요하면 semantic token scope만 적용한다. primitive는 건드리지
  않는다.
- cookie/storage 이름은 DS token API가 아니라 제품 runtime 계약이다.

## Compatibility adapter 원칙

호환 alias는 제품 repository가 소유한다. DS source에는 제품의 `--gray-*`, `--app-*`, `--node-*` 이름을
deprecated alias로 추가하지 않는다.

1. alias 방향은 `legacy name → released semantic custom property` 한 방향이다.
2. 의미가 하나로 확정된 이름만 alias한다. `--gray-000-rgb`처럼 여러 역할을 맡는 이름은 call site를 직접
   바꾼다.
3. primitive 호환이 꼭 필요하면 root에서만 고정 alias하고 scope override를 금지한다.
4. adapter에는 DS package version, owner, 추가일, 남은 reference 수와 제거 조건을 기록한다.
5. 새 코드는 legacy alias를 사용할 수 없도록 lint/static check를 추가한다.
6. DS package를 내리는 rollback과 legacy alias를 제거하는 cleanup은 별도 변경으로 분리한다.

## 단계적 migration과 rollback

### 0. Baseline 고정

- DS release/commit과 영향 token ID를 고정한다.
- Home, Highlight Home/detail/standalone, route Editor와 modal/docked Editor의 light/dark screenshot을 캡처한다.
- keyboard, focus, pointer, reduced-motion, theme first-paint와 canvas RGB 기준을 기록한다.
- legacy variable/reference 수와 GNB scoped primitive override를 목록화한다.

### 1. Shadow adoption

- 제품이 지원 package export만 설치하고 token CSS와 제품-owned adapter를 build-time 또는 product-owned gate
  뒤에 연결한다.
- 화면 component는 바꾸지 않고 semantic resolved value, Tailwind utility와 generated TS 값이 source와
  일치하는지 먼저 검사한다.
- 이 단계에서는 기존 legacy 선언을 삭제하지 않는다.

### 2. Leaf component

- Button, Tooltip, Dropdown/Menu 순으로 component 단위 전환한다.
- focus-visible, disabled, hover/pressed, portal, close motion와 reduced-motion을 같이 검증한다.
- 성공한 component의 legacy alias만 사용량 0을 확인한 뒤 제거 후보로 표시한다.

### 3. Home과 Project Grid

- App Shell inset/sidebar alignment를 semantic layout role로 바꾸고 GNB primitive override를 제거한다.
- Home project grid를 이관한 뒤 동일 recipe를 Highlight와 Video Editor history에 적용한다.
- 열 수, 카드 순서와 데이터 요청 limit을 분리해 resize가 불필요한 refetch를 만들지 않게 한다.

### 4. Highlight

- 공용 Highlight Home/detail은 semantic color/layout을 사용한다.
- standalone fixed-dark와 yellow brand는 별도 product extension scope로 격리한다.
- 업로드 composer, modal, toast와 assistant overlay가 project card interaction을 가리지 않는지 확인한다.

### 5. Editor와 canvas

- route, docked와 modal editor를 각각 검증하고 App Shell sidebar와 workspace가 겹치지 않게 한다.
- generated TS token으로 archive/editor thumbnail literal을 교체한다.
- editor-only channel/geometry는 제품 extension에 남기고 core token으로 역유입하지 않는다.

### 6. Cleanup

- 제품 전체에서 제거 대상 legacy reference가 0인지 static check한다.
- 최소 한 deprecation window와 지원 rollback 기간이 지난 alias만 삭제한다.
- 제품 route evidence를 integration PR에 링크하고 그 전에는 DS adoption을 완료로 표시하지 않는다.

### Rollback

- 각 단계는 독립 PR 또는 독립 product-owned gate로 배포한다.
- regression이 발생하면 gate를 legacy로 되돌리고 직전 DS package version을 pin한다. 데이터 migration은
  포함하지 않으므로 화면 코드와 CSS import만 되돌릴 수 있어야 한다.
- rollback 기간에는 legacy declarations와 alias를 유지한다. alias cleanup PR을 cutover PR과 합치지 않는다.
- 즉시 rollback 조건은 keyboard/focus 회귀, overlay 클릭 불가, sidebar/editor 겹침, 잘못된 grid 열 수,
  theme flash, contrast gate 실패와 DOM/canvas 색 불일치다.

## 제품 검증 matrix

| 영역                 | 필수 검증                                                                                                     |
| -------------------- | ------------------------------------------------------------------------------------------------------------- |
| Token/package        | schema/alias/mode/contrast/parity, deterministic build, generated drift, package version pin                  |
| Theme/font           | light/dark/system, SSR hydration, first paint, cookie/storage sync, KO/EN/JA, canvas font parity              |
| Home                 | sidebar/main 정렬, profile menu 클릭·키보드, ≤719/720/1200/1800 경계의 2/3/4/5열, 카드 순서와 scroll          |
| Highlight Home       | 동일 2/3/4/5열, archive card 상태·텍스트 대비, upload composer와 floating overlay 충돌                        |
| Highlight detail     | loading/error/empty/complete, modal/toast layer, focus return                                                 |
| Highlight standalone | fixed-dark/yellow brand 격리, login/signup/detail, core primitive가 scope에서 변하지 않음                     |
| Editor               | route/docked/modal/compact, sidebar 비겹침, assets/canvas/properties/timeline grid, resize와 portal layer     |
| Canvas/thumbnail     | light/dark DOM node와 archive/editor thumbnail의 RGB parity, edit channel violet, image/yellow channel parity |
| Accessibility        | focus-visible, tab order, Escape/return focus, contrast, reduced-motion, 200% zoom                            |
| CSS regression       | Tailwind layer/import order, 남은 CSS Module 우선순위, preflight 미도입, production build                     |

최종 cutover는 이 matrix, 규범
[`Product Adoption`](../design/governance/migration.md)의 gate와 제품 repository의 route E2E/visual evidence를
모두 통과해야 한다.
