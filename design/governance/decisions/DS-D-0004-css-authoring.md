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
고정할 수 없다. (**2026-08-15 에 바뀌었다** — 소비 제품은 Tailwind 4 를 쓴다.
[DS-D-0013](DS-D-0013-tailwind-interop.md)이 이 결정을 뒤집지 않고 영향 범위만 바꿨다. 아래 구현 대조
참조.) 컴포넌트 규범이 요구하는 상태 계약(Menu의 Closed/Opening/Open/Closing, Dialog의 6단계
lifecycle)은 스타일이 아니라 **상호작용 가능성**을 좌우하므로, 어떤 계층이 그 계약을 소유하는지 먼저
정해야 한다.

[플레이북](../execution-playbook.md)의 게이트 확장 억제 원칙과 인계서의 "새 도구는 소비자·유지
책임·rollback이 확인될 때만" 규칙이 함께 적용된다.

## Decision

컴포넌트별 **authored plain CSS**로 저작하고, 빌드 시 `@layer`로 감싼 정적 `.css` 두 벌을 배포한다.
런타임 스타일 라이브러리를 도입하지 않고 recipe 생성기도 만들지 않는다.

1. **상태는 `data-*` 속성, 값은 `--louis-*` 변수.** React state를 className 문자열로 조합하지 않는다.
   런타임 variant 라이브러리가 불필요해지고 SSR/hydration 불일치 표면이 줄어든다.
2. **패키지 구성**

   | 파일 | 내용 |
   | --- | --- |
   | `layers.css` | layer 순서 선언만 (`louis.reset, louis.tokens, louis.base, louis.component, louis.override`) |
   | `tokens.css` | `@klipse-design/tokens/css` 재export |
   | `styles.css` | 전체 컴포넌트, 언레이어드 |
   | `styles.layer.css` | 전체 컴포넌트, `@layer louis.component` 래핑 |
   | `reset.css` | opt-in, `:where()` 기반, `@layer louis.reset` |
   | `component/<name>.css` | 컴포넌트 단위 저작 원본 |
   | `theme.css` | Tailwind 4 `@theme inline` 토큰 레이어. [DS-D-0013](DS-D-0013-tailwind-interop.md)이 추가했고 불러오는 순서는 [DS-D-0020](DS-D-0020-tailwind-load-order.md)이 소유한다 |

3. **저작 규칙 7개**
   - `!important` 전면 금지. 레이어 우선순위가 역전돼 소비자가 이길 수 없게 된다.
   - 요소·ID 선택자 금지. 상태는 `data-*`, 값은 `--louis-*`로만 표현한다.
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
6. **동적 위치값**은 인라인 custom property(`--louis-popover-available-height`,
   `--louis-popover-anchor-width`)로 전달하고 정적 CSS가 소비한다.

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
  번역된다(구현 이름은 `data-louis-state` · `data-louis-overlay-mode` 등이다 — 아래 구현 대조의
  대응표). 특히 "Opening: 위치 계산 전 `visibility:hidden`, 클릭 불가"는 CSS 한 줄이 소유해야 하고
  React 렌더 분기로 흩어지면 안 된다.
- **"`opacity: 0`과 `aria-hidden`만으로 닫힌 panel을 유지하지 않는다"**와
  [Elevation & Layer](../../foundations/elevation-layer.md)의 "투명하거나 closing 중인 layer가 pointer를
  가로채면 실패"는 `[data-state="closed"] { display:none }`과 `[data-state="closing"] { pointer-events:none }`을
  CSS 계약으로 못박아 충족한다.
- **"raw z-index 대신 layer 의미 토큰"**은 숫자 리터럴 z-index를 정적 검사로 금지하고
  `var(--louis-layer-*)`만 허용해 충족한다.
- **[Motion](../../foundations/motion.md)의 "reduced-motion에서도 focus 이동, scroll lock, inert와
  unmount 순서는 동일하다"**는 `prefers-reduced-motion` 미디어 쿼리가 시각 transform만 제거하고
  lifecycle은 건드리지 않는 구조로 충족한다.
- **Dialog의 "전역 `body { overflow:hidden }`을 라이브러리가 박지 않는다"**는 scroll lock을 전역 CSS가
  아니라 속성 훅과 컴포넌트 스코프로 처리해 충족한다.

## Rollback

정적 CSS에서 생성기로 전환하는 것은 나중에도 가능하다. 입력이 이미 DTCG로 정규화돼 있기 때문이다.
반대 방향이 비싸므로 이 순서가 맞다.

되돌림 비용을 0으로 유지하는 장치: 컴포넌트 CSS를 `component/<name>.css` 단위로 물리 분리하고
클래스·속성 이름을 기계적으로 유지한다(`.louis-button`, `[data-variant]`, `[data-size]`). CSS를 나중에
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

## 구현 대조 (2026-09-13)

Status 는 `proposed` 그대로다. owner 확인을 요청하기 전에 이 결정과 구현을 대조한 기록이다
([Updates (129)](../../updates/README.md)).

### 저작 규칙 「요소 선택자 금지」 위반 — 글리프 슬롯 세 곳은 고쳤다

`.louis-menu-trigger__icon svg` · `.louis-select-trigger__icon svg` · `.louis-select-trigger__caret svg`
세 규칙이 요소 선택자를 `:where()` 밖에 두어 특이도가 (0,1,1)이었다. 실제로 문제를 만드는지 브라우저에서
쟀다 — 언레이어드 `styles.css` 뒤에 소비자가 `.consumer-glyph { inline-size: 7px }` 를 두면 글리프가
**20 · 20 · 12px 로 남았다**(소비자 클래스 하나가 순서와 무관하게 졌다). 레이어드 배포에서는 레이어가
특이도보다 먼저 갈라 문제가 드러나지 않지만, 두 벌 배포의 한 벌에서 저작 규칙이 약속한 override 계약이
깨져 있었다.

세 곳을 `:where(svg)` 로 감쌌다. 같은 요소에 붙는 `.louis-icon`(icon.css, (0,1,0))은 파일 순서상
앞이라 슬롯의 `100%` 가 그대로 이기고, `.louis-icon[data-size]`(0,2,0)는 전에도 후에도 이긴다 —
DS 안의 계산값은 바뀌지 않는다. `packages/css/test/slot-glyph-specificity.browser.test.ts` 가 두
방향(소비자 클래스가 이긴다 · 기본값은 슬롯을 채운다)을 고정한다.

**고치지 않은 것.** `table.css` 는 `.louis-table > thead > tr > th` 형태의 요소 선택자 사슬을 쓴다.
표 구조 자체가 요소라 클래스로 옮기면 소비자 마크업 계약이 바뀌고, `:where()` 로 감싸면 사슬 규칙끼리의
우열(`tr:last-child > td` · `tr[data-interactive="true"]:hover > td`)이 특이도가 아니라 순서로 갈리게
되어 규칙마다 대조가 필요하다 — 별건으로 판정한다. `verify-css-gates` 의 저작 규칙 게이트는 요소
선택자를 검사하지 않는다. 그래서 이 위반들이 초록으로 들어왔다.

### 전제가 바뀌었다 — DS-D-0013 · DS-D-0020

- Context 의 「Tailwind 사용 여부는 고정할 수 없다」는 [DS-D-0013](DS-D-0013-tailwind-interop.md)이
  뒤집었다 — 소비 제품은 Tailwind 4 를 쓴다. DS-D-0013 은 이 결정의 선택(authored plain CSS · 두 벌
  배포 · 런타임 스타일 라이브러리 0)을 유지하고, 토큰을 `@theme inline` 으로도 발행하는 범위만 더했다.
  「Tailwind 를 쓰든 안 쓰든 동작한다」는 제약은 그대로다 — `theme.css` 는 선택 import 다.
- 패키지 구성 표에 없던 `theme.css` 를 표에 더했다(`packages/css/package.json` exports `./theme.css`).
  그 파일을 **제품 Tailwind 진입 CSS 의 `@theme` 뒤에** 불러야 한다는 계약은
  [DS-D-0020](DS-D-0020-tailwind-load-order.md)이 소유한다.
- 표의 `styles.layer.css` 행은 「`@layer louis.component` 래핑」이지만 실제로는 base 를
  `louis.base`, 컴포넌트를 `louis.component` 로 감싼다(`scripts/build-css.mjs` 의 `wrapInLayer` 두 호출).

### 상태 속성의 실제 이름

결정 1 과 「규범 충족 근거」가 적은 이름은 구현 이름이 아니다. 라이브러리가 쓰는 lifecycle 속성에는
`louis-` 접두사가 붙고, 소비자가 고르는 축(`data-variant` · `data-size` · `data-tone` …)에는 붙지 않는다.

| 적힌 이름 | 구현 |
| --- | --- |
| `data-state` | `data-louis-state` — `packages/css/src/base.css` 가 `opening` · `closing` · `closed` 를 소유한다 |
| `data-mode` | `data-louis-overlay-mode` — `packages/react/src/overlay/use-overlay.tsx` 가 달고 `overlay.css` 가 소비한다 |
| `data-open` | 없다 — 열림은 `data-louis-state` 와 `aria-expanded` 가 표현한다 |
| `data-busy` | 없다 — Dialog surface·Menu item 은 `aria-busy`, Button 은 `data-loading` 이다 |

### 레이어 import 계약 — `louis.tokens` 에 넣는 것은 소비자다

- `layers.css` 는 다섯 층의 순서만 선언한다(`packages/css/generated/layers.css`).
- **`tokens.css` 는 레이어 없는 `:root` 다**(`packages/css/generated/tokens.css`). `louis.tokens` 층은
  선언만 있고 배포물이 그 층에 들어가지 않는다. 층에 넣는 것은 소비자의 import 문
  `@import "@klipse-design/css/tokens.css" layer(louis.tokens);` 이다. 소비 제품이 그렇게 부른다는 실측은
  비규범 기록 [`migration/klipse-web-adoption.md`](../../../migration/klipse-web-adoption.md) 의 「진입
  CSS가 부르는 것」 행이 갖는다(`tokens.css`(`layer(louis.tokens)`) · `styles.layer.css` ·
  `theme.css`(`layer(theme)`)).
- 감싸지 않으면 토큰 선언이 레이어 밖에 남는다. 레이어 밖 선언은 어느 레이어의 같은 선언보다 우선하므로
  `louis.override` 층에서 `--louis-*` 를 다시 선언하는 경로가 막힌다(2026-09-13 Chromium 확인: 레이어 밖
  `tokens.css` 가 있으면 `@layer louis.override` 의 `--louis-color-bg-upgrade` 재선언이 계산값을 바꾸지
  못하고, 둘 다 층 안이면 `louis.override` 가 이긴다). **그래서 CSS `@import` 로 부르는
  레이어드 경로(`styles.layer.css` · Tailwind 소비자)는 `tokens.css` 를 `layer(louis.tokens)` 로 감싸는
  것을 import 계약으로 둔다.** JS `import` 는 `layer()` 를 쓸 수 없어 토큰이 레이어 밖에 남는다 — 그
  경로에서 토큰을 덮으려면 레이어 밖 CSS 로 덮는다. `packages/css/README.md` 「최소 import」에 두 경로를
  함께 적었다.
- `theme.css` 는 제품 `@theme inline` 블록 뒤에서 부른다(DS-D-0020).

### 저작 규칙 「`layers.css` 를 최초로」와 소비 제품의 순서가 어긋난다 — 고치지 않았다

저작 규칙 다섯째 줄은 소비자가 `layers.css` 를 root layout 최상단에서 **최초로** import 한다고 적는다.
`packages/css/README.md` 「배포 파일」 표의 `./layers.css` 행도 「가장 먼저」라고 적는다.

| 축 | 사실 |
| --- | --- |
| 소비 제품의 순서 | 진입 CSS 는 자기 층 `theme, base, components` 를 **먼저 선언**하고, Tailwind theme 를 `theme` 층으로 부르고 레이어 밖 `@keyframes` 파일을 부른 **뒤에** `layers.css` · `tokens.css`(`layer(louis.tokens)`) · `styles.layer.css` 를 부른다. `utilities` 층은 그 뒤에 선언한다. 층의 우열은 처음 등장한 순서로 정해지므로 결과는 `theme < base < components < louis.reset < louis.tokens < louis.base < louis.component < louis.override < utilities` 다. 실측 위치는 비규범 기록 [`migration/klipse-web-adoption.md`](../../../migration/klipse-web-adoption.md) 의 「층 순서」 행이다. 이 저장소의 제품 실측 스크립트(`scripts/measure-product-components.mjs` 의 `layerOrder`)도 같은 순서를 재현해 잰다 |
| 제품이 그렇게 두는 이유 | 제품의 최소 reset(`* { box-sizing: border-box; padding: 0; margin: 0 }`)이 제품 `base` 층에 있다(같은 기록 같은 행). 문장대로 `layers.css` 를 맨 앞에 두면 `base` 가 `louis.component` 보다 **뒤 층**이 되어, 특이도와 무관하게 리셋이 컴포넌트 선언을 이긴다. 2026-09-13 Chromium 확인 — 생성된 `layers.css` · `tokens.css`(`louis.tokens` 층) · `styles.layer.css` 와 제품 층 선언 · 그 리셋 선언으로 두 순서를 만들어 `.louis-button[data-size="md"]` 의 `padding-inline-start` 를 재면, 제품 순서에서 **12px**, `layers.css` 를 맨 앞에 두면 **0px** 이다. 결정 4 의 「컴포넌트 클래스 스코프 안에서 선언해 자족성을 확보한다」는 뒤 층의 전역 리셋 앞에서는 성립하지 않는다 |
| 어긋나지 않는 것 | LOUIS 층끼리의 순서(`reset < tokens < base < component < override`)는 두 순서에서 같다. 어긋나는 것은 LOUIS 층과 **소비자 층 사이**의 상대 순서뿐이다 |
| 지키는 장치 | 없다. `verify-tailwind-interop` 은 `theme.css` 를 부르는 순서만 보고, 층 순서를 재는 게이트는 없다 |

**고치지 않았다.** 제품이 규칙을 어긴 것(제품이 고칠 것)으로 볼지, 규칙 문장을 「LOUIS 층 가운데 최초로 —
소비자 층과의 상대 순서는 소비자가 정한다」로 고칠지는 owner 판정으로 남긴다
([Updates (129)](../../updates/README.md) 「owner 확인 요청」). 판정 전까지 규칙 문장과 README 문구는
그대로 둔다.

### 발동한 재검토 조건의 판정 (2026-09-13 실측)

| 조건 | 실측 | 판정 (owner 확인 대기) |
| --- | --- | --- |
| 컴포넌트 25종 초과 → recipe 생성기 재검토 | `design/manifest.json` `components` 51개(`web` partial 38 · not-ready 12 · not-planned 1). 저작 CSS `packages/css/src/component/*.css` 39개 + pattern 1개 | **발동.** 생성기는 도입하지 않는다 — Alternatives 의 근거(생성기의 이득은 플랫폼 팬아웃)가 그대로이고, 그 팬아웃을 뜻하는 둘째 조건(멀티 브랜드 · iOS/Android)은 발동하지 않았다. 컴포넌트 사이 값 중복의 규모는 재지 않았다 |
| 단일 컴포넌트 variant 조합 24 초과 | 전수로 재지 않았다. Button 은 6 variant × 3 size = 18(`button.tsx` 의 두 union) | 미판정 |
| gzip 40KB 초과 **그리고** 미사용 규칙 절반 초과 → 컴포넌트별 import 강제 | `styles.css` 422,563B · gzip -9 **119,269B**. 주석만 걷으면(공백 유지) 160,270B · gzip **16,972B**. `styles.layer.css` 는 120,371B / 주석 제외 17,368B. 미사용 규칙 비율은 재지 않았다 | 앞 조건은 **무엇을 재느냐에 따라 갈린다** — 배포물 그대로면 초과, 규칙만이면 미달이고 차이 약 102KB 는 전부 주석이다. 뒤 조건이 미실측이라 AND 조건의 성립은 확인되지 않았다 → 컴포넌트별 import 를 강제하지 않는다. 기준을 「주석 제외」로 못박을지, 배포 CSS 에서 주석을 걷을지는 owner 판정으로 남긴다 |

측정 방법: `pnpm build` 산출물을 Node `zlib.gzipSync(…, { level: 9 })` 로 쟀고, 주석은
`/\/\*[\s\S]*?\*\//g` 로 걷었다(공백·개행은 남김). 같은 파일을 macOS `gzip -9 -c | wc -c` 로 재면
118,556B 로 도구에 따라 1KB 안쪽이 흔들린다. 소비자 번들러의 CSS minify 가 이 주석을 걷는지는 이
저장소에서 재지 않았다.
