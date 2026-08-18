---
id: decision-css-authoring
status: experimental
authority: normative
---

# DS-D-0004 CSS 저작 방식과 cascade layer

- Status: proposed
- Date: 2026-08-14
- Owners: repository owner, package maintainer
- Affects: `@klipse-design/css`, `@klipse-design/react`, `component-button`, `component-dialog`,
  `component-menu-popover`

## Context

P3는 `@klipse-design/css`를 처음 만든다. 소비 제품은 Next.js App Router이고 Tailwind 사용 여부는
고정할 수 없다. 컴포넌트 규범이 요구하는 상태 계약(Menu의 Closed/Opening/Open/Closing, Dialog의
6단계 lifecycle)은 스타일이 아니라 **상호작용 가능성**을 좌우하므로, 어떤 계층이 그 계약을 소유하는지
먼저 정해야 한다.

[플레이북](../execution-playbook.md)의 게이트 확장 억제 원칙과 인계서의 "새 도구는 소비자·유지
책임·rollback이 확인될 때만" 규칙이 함께 적용된다.

## Decision

컴포넌트별 **authored plain CSS**로 저작하고, 빌드 시 `@layer`로 감싼 정적 `.css` 두 벌을 배포한다.
런타임 스타일 라이브러리를 도입하지 않고 recipe 생성기도 만들지 않는다.

1. **상태는 `data-*` 속성, 값은 `--kds-*` 변수.** React state를 className 문자열로 조합하지 않는다.
   런타임 variant 라이브러리가 불필요해지고 SSR/hydration 불일치 표면이 줄어든다.
2. **패키지 구성**

   | 파일 | 내용 |
   | --- | --- |
   | `layers.css` | layer 순서 선언만 (`kds.reset, kds.tokens, kds.base, kds.component, kds.override`) |
   | `tokens.css` | `@klipse-design/tokens/css` 재export |
   | `styles.css` | 전체 컴포넌트, 언레이어드 |
   | `styles.layer.css` | 전체 컴포넌트, `@layer kds.component` 래핑 |
   | `reset.css` | opt-in, `:where()` 기반, `@layer kds.reset` |
   | `component/<name>.css` | 컴포넌트 단위 저작 원본 |

3. **저작 규칙 7개**
   - `!important` 전면 금지. 레이어 우선순위가 역전돼 소비자가 이길 수 없게 된다.
   - 요소·ID 선택자 금지. 상태는 `data-*`, 값은 `--kds-*`로만 표현한다.
   - 컴포넌트 루트 클래스 1개 + `:where()`로 내부 특이도 0.
   - 전역 선택자(`html`/`body`/`*`)는 `reset.css` 안에서만 쓴다.
   - 소비자는 `layers.css`를 root layout 최상단에서 **최초로** import한다.
   - Tailwind 소비자의 기본 경로는 `styles.layer.css`다. 언레이어드 CSS는 Tailwind 유틸리티를 이긴다.
   - `styles.css`와 `styles.layer.css`를 동시에 import하지 않는다.
4. **reset 정책:** 전역 reset을 기본 배포에 포함하지 않는다. `box-sizing`, `appearance`, `font`,
   `margin`, tap highlight는 컴포넌트 클래스 스코프 안에서 선언해 자족성을 확보한다. `reset.css`는
   opt-in이며 `:where()`로 특이도 0, 최하위 레이어에 둔다.
5. **theme scope:** [Color & Theme](../../foundations/color-theme.md)의 `[data-theme]` 계약을 그대로
   소비한다. CSS package가 별도 selector 정책을 만들지 않는다.
6. **동적 위치값**은 인라인 custom property(`--kds-popover-available-height`,
   `--kds-popover-anchor-width`)로 전달하고 정적 CSS가 소비한다.

## Alternatives

### 자체 recipe 생성기 (SEED qvism형)

SEED가 생성기를 만든 이유는 컴포넌트 수가 아니라 React/iOS/Android/Lynx 팬아웃이다. 컴포넌트 8종
규모는 손익분기점 이전이고, 생성기는 스키마 검증·drift 게이트·생성 CSS 스냅샷 테스트를 요구해 게이트
확장 억제 원칙과 충돌한다. Menu의 "열리지만 선택 안 됨"은 CSS가 아니라 이벤트 순서 문제인데 생성
CSS가 끼면 원인 격리가 느려진다.

### Panda CSS / vanilla-extract / StyleX

소비자 번들러와 결합한다. Next.js 공식 문서는 이들을 **Client Component에서 지원**되는 목록으로
서술하며, Server Component에서 무조건 안전한 것은 정적 `.css` import뿐이다. static 추출로 쓰면
결과물이 정적 CSS 배포와 같아지는데 codegen 툴체인만 늘어난다.

### raw CSS Modules 배포

소비자 번들러 종속이고 Next.js의 `node_modules` 내 CSS Modules 제약이 있다. 내부 저작 후 번들 배포는
결과적으로 채택안과 같으므로 저작 편의 문제로만 남는다.

### Tailwind preset

"소비자가 Tailwind를 쓰든 안 쓰든 동작한다"는 제약을 위반한다.

## Consequences

- **새 런타임 의존성 0, 새 도구 0.** CSS concat과 `@layer` 래핑은 수십 줄 스크립트로 기존
  `scripts/*.mjs` 패턴에 합류하고 `--check` 모드를 붙여 `pnpm check`에 무료로 편입된다.
- 게이트 2개가 추가된다: 배포 CSS의 `!important`·전역 선택자·z-index 리터럴 부재 검사, layered와
  unlayered의 규칙 수 일치 검사. 인계서 DS-P3-003 완료 근거가 명시적으로 요구하는 검사이므로 억제
  원칙에 부합한다.
- 소비자 부담은 import **세 줄**이다(`layers.css` → `tokens.css` → `styles.css`). 처음에는 "한 줄"이라고 적었는데 **틀렸다** — `styles.css`는 토큰을 정의하지 않고 `@import`하지도 않아, `tokens.css`를 빼면 오류 없이 전부 무효값이 된다.
- `@layer`는 Baseline widely available이라 하한 판정에 걸리지 않는다.

### 규범 충족 근거

- **Menu/Dialog의 States 표**가 `data-state`/`data-open`/`data-busy`/`data-mode` 속성 계약으로 그대로
  번역된다. 특히 "Opening: 위치 계산 전 `visibility:hidden`, 클릭 불가"는 CSS 한 줄이 소유해야 하고
  React 렌더 분기로 흩어지면 안 된다.
- **"`opacity: 0`과 `aria-hidden`만으로 닫힌 panel을 유지하지 않는다"**와
  [Elevation & Layer](../../foundations/elevation-layer.md)의 "투명하거나 closing 중인 layer가 pointer를
  가로채면 실패"는 `[data-state="closed"] { display:none }`과 `[data-state="closing"] { pointer-events:none }`을
  CSS 계약으로 못박아 충족한다.
- **"raw z-index 대신 layer 의미 토큰"**은 숫자 리터럴 z-index를 정적 검사로 금지하고
  `var(--kds-layer-*)`만 허용해 충족한다.
- **[Motion](../../foundations/motion.md)의 "reduced-motion에서도 focus 이동, scroll lock, inert와
  unmount 순서는 동일하다"**는 `prefers-reduced-motion` 미디어 쿼리가 시각 transform만 제거하고
  lifecycle은 건드리지 않는 구조로 충족한다.
- **Dialog의 "전역 `body { overflow:hidden }`을 라이브러리가 박지 않는다"**는 scroll lock을 전역 CSS가
  아니라 속성 훅과 컴포넌트 스코프로 처리해 충족한다.

## Rollback

정적 CSS에서 생성기로 전환하는 것은 나중에도 가능하다. 입력이 이미 DTCG로 정규화돼 있기 때문이다.
반대 방향이 비싸므로 이 순서가 맞다.

되돌림 비용을 0으로 유지하는 장치: 컴포넌트 CSS를 `component/<name>.css` 단위로 물리 분리하고
클래스·속성 이름을 기계적으로 유지한다(`.kds-button`, `[data-variant]`, `[data-size]`). CSS를 나중에
생성물로 바꿔도 소비자 계약이 깨지지 않는다. 두 벌 배포에서 한 벌로 줄이는 것은 minor다.

## Rollout and verification

1. `component/<name>.css` 저작 → concat·layer 래핑 스크립트 → `styles.css`, `styles.layer.css` 생성.
2. 저작 규칙 위반(`!important`, 전역 선택자, z-index 리터럴)을 게이트로 차단한다.
3. layered와 unlayered의 규칙 수가 일치하는지 검사한다.
4. light/dark, forced-colors, reduced-motion, 200% zoom fixture로 확인한다.
5. Tailwind를 쓰는 소비자와 쓰지 않는 소비자 양쪽에서 import 순서를 검증한다.

## 재검토 조건

- 컴포넌트가 25종을 넘거나 단일 컴포넌트 variant 조합이 24를 넘으면 recipe 생성기를 재검토한다.
- 멀티 브랜드나 iOS/Android 요구가 생기면 recipe 소스 분리를 재검토한다.
- 정적 CSS 총량이 gzip 40KB를 넘고 미사용 규칙이 절반을 넘으면 컴포넌트별 import를 강제한다.
- Next.js가 CSS 순서 비결정성을 공식 해결하면 두 벌 배포 축소를 검토한다.
