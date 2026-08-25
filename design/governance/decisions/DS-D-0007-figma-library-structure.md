---
id: decision-figma-library-structure
status: experimental
authority: normative
---

# DS-D-0007 Figma library structure

- Status: proposed
- Date: 2026-08-14
- Owners: repository owner, design maintainer
- Affects: `@klipse-design/tokens`, `governance-figma-sync`, `governance-execution-handoff`,
  Figma library file `bxGEp0km5zluMJGulaTvFW`

## Context

P2는 단일 DTCG source에서 Figma proposal을 생성한다. 현재 proposal은 하나의 collection
(`Klipse Design`) 안에 `base`, `global`, `light`, `dark` 네 mode를 담는다. Figma에서 mode는
collection에 속한 **모든** 변수에 적용되므로 이 구조는 그대로 만들 수 없다. primitive 110개가
light/dark 값을 강제로 갖게 되고, theme 비의존 semantic도 마찬가지가 된다.

2026-08-14 실측으로 다음이 확정됐다.

- 라이브러리 파일 `bxGEp0km5zluMJGulaTvFW`는 collection당 mode 상한 10개를 지원한다. 필요한 mode는
  2개다.
- Figma 변수 타입은 `COLOR`, `FLOAT`, `STRING`, `BOOLEAN` 네 가지뿐이다. DTCG의 `typography`,
  `shadow`, `transition`, `cubicBezier`는 단일 변수로 표현할 수 없다.
- publish 전에는 다른 파일의 변수·style·component를 소비할 수 없다.
- 제품을 미러링한 별도 Figma 파일([KP-FIGMA-001](../../../migration/product-baseline.md))이 존재하며
  `Primitives` / `Dimensions` / `Semantic(Light·Dark)` 구조를 쓴다. 이 파일은 참고 자료이고 이
  저장소의 정본이 아니다.

토큰 정본은 [DS-D-0001](DS-D-0001-token-source.md)대로 `packages/tokens/src/klipse.tokens.json`이며
이 결정은 그 정본을 Figma로 투영하는 방법만 정한다.

## Decision

### 1. Collection 분리

토큰의 mode 축에 따라 세 collection으로 나눈다.

| Collection | Modes | 담는 것 |
| --- | --- | --- |
| `Klipse Primitive` | `Base` 1개 | tier `primitive` 토큰 |
| `Klipse Semantic` | `Global` 1개 | tier `semantic`이면서 theme 비의존 토큰 |
| `Klipse Semantic Color` | `Light`, `Dark` 2개 | tier `semantic`이면서 theme 의존 토큰 |

collection 이름은 proposal이 선언하고 generator가 소유한다. 사람이 Figma에서 바꾸지 않는다.

### 2. 표현 형태 분류

토큰 200 레코드(고유 ID 174)는 Figma에서 셋 중 하나로만 표현된다. 미분류는 build error다.

| 표현 | 대상 | 고유 ID 수 |
| --- | --- | --- |
| 네이티브 변수 | primitive의 color 38 · dimension 37 · number 8 · fontWeight 3 · duration 4 (FLOAT 52) · fontFamily 2 (STRING) = 92, semantic global의 dimension 18 · number 5 (FLOAT 23) + transition 5 (STRING 격하), semantic color 26 | 146 |
| Style | semantic `typography-*` 6 → text style, semantic `elevation-*` 4 → effect style | 10 |
| 미표현 (loss) | primitive `type-style-*` 6 · `shadow-*` 4 · `transition-*` 5 · easing(cubicBezier) 3 | 18 |

`146 + 10 + 18 = 174`로 고유 ID 전체를 덮는다.

### 3. Composite 정책

- **text style과 effect style은 semantic tier 이름으로만 만든다.** 소비자가 쓰는 이름이 semantic이기
  때문이다. style 내부의 색·숫자 속성은 대응하는 변수에 바인딩한다.
- primitive tier의 `type-style-*`와 `shadow-*`는 Figma에 만들지 않는다. Figma에는 style→style alias가
  없어 semantic→primitive 관계를 보존할 수 없고, 두 tier를 모두 style로 만들면 소비자가 잘못된 tier를
  고를 수 있다. **이 tier 관계 소실 자체를 loss로 등록한다.**
- `fontFamily` fallback 배열은 Figma가 단일 값만 받으므로 첫 값을 쓰고 전체 배열을 style description에
  loss로 기록한다.
- semantic `transition-*` 5종은 STRING 변수로 격하해 motion 계약을 디자이너가 읽을 수 있게 한다.
  값이 아니라 문서용이며 Figma가 이를 애니메이션으로 해석하지 않는다는 사실을 description에 적는다.
- primitive `transition-*`와 easing은 semantic이 이미 문서화하므로 미표현으로 둔다.

### 4. 이름 변환

Figma 변수 이름은 `sourcePath`에서 tier/mode 접두사를 제거하고 나머지를 `/`로 이은 값이다.

| sourcePath | Figma 이름 | Collection |
| --- | --- | --- |
| `primitive.color.amber.100` | `color/amber/100` | Klipse Primitive |
| `semantic.global.elevation.focus-ring` | `elevation/focus-ring` | Klipse Semantic |
| `semantic.light.color.action-primary` | `color/action-primary` | Klipse Semantic Color |

`semantic.light.*`와 `semantic.dark.*`는 같은 이름으로 수렴하며 이는 의도된 동작이다 — 같은 변수의
두 mode 값이다. 그 외의 이름 충돌은 build error로 처리한다. 안정 token ID는 변수 description에
그대로 기록해 코드 ↔ Figma 대조가 이름이 아니라 ID로 이뤄지게 한다.

### 5. Scope

변수마다 scope를 명시한다. 기본값 `ALL_SCOPES`는 쓰지 않는다.

| 토큰 계열 | Scope |
| --- | --- |
| color 배경 | `FRAME_FILL`, `SHAPE_FILL` |
| color 전경 | `TEXT_FILL` |
| color 테두리 | `STROKE_COLOR` |
| space | `GAP`, `WIDTH_HEIGHT` |
| radius | `CORNER_RADIUS` |
| layer, duration, number | `ALL_SCOPES` 대신 해당 없음을 명시 |

semantic color의 역할별 scope는 token ID 접두사(`color-bg-*`, `color-fg-*`,
`color-stroke-*`)에서 결정론적으로 도출한다.

### 6. 파일 구조

publish 전에는 **단일 파일 3-페이지**를 유지한다.

- `Foundations` — variables와 styles
- `Components` — component set
- `Templates` — 화면 재조립 검증

파일 분리는 publish 이후에만 검토하며 별도 작업(DS-F-009)으로 다룬다. publish 전 파일 분리는 파일
간 소비가 불가능해 성립하지 않는다.

## Alternatives

### 단일 collection 유지

proposal 구조를 그대로 두면 generator 변경이 없다. 그러나 Figma가 mode를 collection 단위로 적용하므로
primitive에 의미 없는 light/dark 값이 생기고, 디자이너가 잘못된 mode를 고를 수 있다. 실현 불가능해
선택하지 않았다.

### 제품 미러 파일의 구조를 그대로 채택

`Primitives` / `Dimensions` / `Semantic` 3분할은 이미 검증된 실사용 구조다. 그러나 그 구조는 제품 CSS를
정본으로 삼아 만들어졌고 이 저장소의 tier 모델(primitive/semantic)과 축이 다르다. dimension을 별도
collection으로 빼면 tier가 아니라 타입으로 나뉘어 alias graph 검증과 어긋난다. 이름과 값도 이
저장소의 안정 ID와 일치하지 않는다. 참고 자료로만 쓴다.

### 모든 composite를 primitive tier에도 style로 생성

Figma에서 전체 토큰을 볼 수 있다는 장점이 있다. 그러나 style→style alias가 없어 두 tier가 독립
복제본이 되고, 값이 갈렸을 때 어느 쪽이 맞는지 판정할 수 없다. 소비자가 primitive style을 직접 쓰는
것도 이 저장소가 지원하지 않는 사용법이다.

### Tokens Studio 같은 외부 plugin 사용

토큰 import를 대신 해준다. 그러나 composite 토큰을 동일하게 스킵하고, 도구 업데이트가 출력에 영향을
주며, 이 저장소의 loss 계약을 표현하지 못한다. MCP Plugin API 경로로 충분하다.

## Consequences

- `figmaCollection`이 단일 문자열에서 collection 배정 규칙으로 바뀐다. 이는 diff 분류상 breaking이며
  공개 d.ts 타입도 함께 바뀐다. published 소비자가 없는 지금 [Releases](../releases.md)의 baseline
  갱신 절차로 처리한다.
- validator, diff 모델, 생성되는 d.ts, token 게이트가 함께 바뀌어야 한다. generator 한 곳만 고치면
  게이트가 막는다.
- Figma에서 볼 수 있는 것과 토큰 정본이 1:1이 아니다. 18개 고유 ID는 의도적으로 표현되지 않으며
  loss registry가 그 사실과 사유를 소유한다. parity checker는 개수 일치가 아니라 **분류 완전성**으로
  판정한다.
- 디자이너는 primitive typography/shadow style을 Figma에서 볼 수 없다. semantic만 쓰는 것이 의도된
  사용법이므로 이는 제약이 아니라 계약이다.
- 제품이 실제로 쓰는 색 계열과 타이포 스케일이 현재 token source보다 넓다. 이 결정은 그 격차를
  해소하지 않는다 — `DS-P3-014`가 소유한다.

## Rollback

- proposal 재생성만으로 되돌릴 수 있는 단계: generator/validator 변경과 `figma.tokens.json` 출력.
  이전 commit으로 되돌리고 baseline을 함께 되돌린다.
- Figma 파일 재작성이 필요한 단계: collection 분리 적용 이후. collection 이름이나 분리 축을 바꾸면
  변수 ID가 바뀌어 바인딩이 끊기므로, 되돌릴 때는 전체 삭제 후 재생성이 아니라 직전 snapshot을
  기준으로 mismatch 항목만 재적용한다.
- 파일 분리(DS-F-009)를 적용한 뒤 되돌리는 것은 published library 버전 복원을 수반하므로 DS-F-008의
  runbook을 따른다.

## Rollout and verification

1. generator가 세 collection과 표현 형태 분류를 출력하도록 바꾼다 (DS-F-002).
2. validator와 token 게이트가 새 구조를 검증하고, 미분류 토큰이 있으면 실패하는지 확인한다.
3. 이름 변환이 collection 안에서 충돌을 일으키지 않는지, light/dark만 같은 이름으로 수렴하는지
   검사한다.
4. breaking diff를 선언하고 baseline을 갱신한다.
5. 라이브러리 파일에 변수를 idempotent하게 적용하고(DS-F-003), 적용 후 다시 읽어 분류 완전성과
   값·alias 일치를 대조한다.
6. text/effect style을 semantic tier 이름으로 생성하고 loss를 description에 기록한다(DS-F-005).
7. snapshot과 parity checker가 credential 없이 위 계약을 재검증하게 한다(DS-F-004).
