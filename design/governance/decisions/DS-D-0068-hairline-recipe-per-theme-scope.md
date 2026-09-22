---
id: decision-hairline-recipe-per-theme-scope
status: experimental
authority: normative
---

# DS-D-0068 헤어라인 recipe 는 테마 스코프마다 다시 푼다 — `:root` 한 곳이 아니라 `:root, [data-theme]`

- Status: accepted (LOUIS 2026-09-22, 제품 핀 상향은 남았다)
- Date: 2026-09-22
- Owners: design system maintainer
- Affects: `decision-hairline-inset`, `foundation-color-theme`, `foundation-elevation-layer`,
  `decision-css-authoring`, `decision-three-in-one-change`

## Context

[DS-D-0023](DS-D-0023-hairline-inset.md) 결정 2 는 헤어라인 recipe 셋(`--louis-hairline-inset` ·
`-block-start` · `-block-end`)을 `packages/css/src/base.css` 의 `:root` 한 곳에 선언했다. 값은
`inset 0 0 0 var(--louis-border-width-hairline) var(--louis-color-stroke-hairline)` 처럼 **토큰을 묶은
조합값**이다.

custom property 값의 `var()` 는 **그 속성을 선언한 요소에서** 풀리고, 자손은 풀린 값을 상속한다.
`:root` 에서 한 번 풀린 헤어라인은 그 아래 어디서나 `html` 테마의 색이다. 색 토큰 자체는 멀쩡하다 —
`tokens.css` 가 `:root, [data-theme="light"]` 와 `[data-theme="dark"]` 에 각각 다시 선언하므로
중첩된 스코프에서도 제 테마로 풀린다. **조합값만 따라오지 못했다.**

**제품에서 드러났다.** 제품 홈이 `html[data-theme="dark"]` 아래 `main` 을 라이트로 고정한다.

```
HomePageClient.tsx@7981c1a4:126              <main data-page-root data-landing-walkthrough-light data-theme="light">
StaticCreateDemo.tsx@18027b37:548            data-theme={lightWalkthrough ? "light" : darkWalkthrough ? "dark" : undefined}
```

낱말 그대로의 선언이다. 경로는 제품 웹 앱 아래 `app/HomePageClient.tsx` 와
`components/landing/demo-snapshots/StaticCreateDemo.tsx` 이고 `git show <커밋>:<경로>` 로 재확인한다.
`7981c1a4` 는 제품 작업 브랜치 `feat/landing-hero-scroll` 이고 `origin/dev`(`18027b37`)에는 홈의 이 줄이
없다. `origin/dev` 에도 중첩 스코프가 하나 있다 — 랜딩 워크스루 데모(두 번째 줄)다.

제품은 헤어라인 recipe 도, 그 색 토큰도 다시 선언하지 않는다 — 두 커밋에서 웹 앱 전체를
`git grep -n -E -- "--louis-hairline-inset(-block-start|-block-end)?[[:space:]]*:" <커밋>` 과
`git grep -n -E -- "--louis-color-stroke-hairline[[:space:]]*:" <커밋>` 으로 찾으면 둘 다 0 줄이다.
그러니 결함은 LOUIS 의 선언 자리 하나에서 온다.

### 실측 — 제품 홈

제품 dev 서버(작업 트리 `7981c1a4` 위 다른 작업의 미커밋 변경 포함, LOUIS 핀 `c493f439`)를 헤드리스
Chromium 1440×900 으로 열었다. 테마는 쿠키 `klipse-theme` 로 정했고 `html` · `body` 가 `dark`, `main` 이
`light` 였다. `main` 아래에서 계산값 `box-shadow` 가 `0.5px inset` 인 요소를 전부 모아, 그 요소가 놓인
가장 가까운 `[data-theme]` 스코프에서 `var(--louis-color-stroke-hairline)` 이 푸는 색과 비교했다.

| 요소 | 전 | 후 (이 변경의 블록을 `@layer louis.base` 에 주입) |
| --- | --- | --- |
| 버튼 「Get started」 | `lab(98.272 0 0.0000119209 / 0.08)` | `lab(9.58784 -0.369489 -5.51047 / 0.12)` |
| 버튼 「Learn more」 | 같음 | 같음 |
| `img` (`rounded-full` 원형 사진) | 같음 | 같음 |
| 버튼 32×32 `rounded-12` 두 개 (캐러셀 넘김) | 같음 | 같음 |
| 버튼 「Learn more」 (다른 절) | 같음 | 같음 |

전은 여섯 모두 **다크의 흰색 8%** 였고 스코프 색(라이트 잉크 12%)과 하나도 맞지 않았다. 후는 여섯 모두
스코프 색과 같다. 쿠키를 `light` 로 두면 전 · 후 모두 여섯이 스코프 색과 같다 — 바깥과 안이 같은
테마에서는 아무것도 바뀌지 않는다. 라이트 면 위의 흰색 8% 는 보이지 않으므로 여섯의 윤곽이 사라져
있었다.

### 실측 — LOUIS 만

새 브라우저 테스트(아래 Rollout 5)를 이 변경 전 생성물로 돌리면 이렇게 실패한다.

```
AssertionError: dark 안의 light: --louis-hairline-inset 이 안쪽 테마의 색이다:
  expected 'color(srgb 0.980392 0.980392 0.980392…' to contain 'color(srgb 0.090196 0.105882 0.133333…'
Received: "color(srgb 0.980392 0.980392 0.980392 / 0.08) 0px 0px 0px 0.5px inset"
```

## Decision

1. **헤어라인 recipe 셋을 `:root, [data-theme]` 에 선언한다.** 한 블록, 한 곳이다 — DS-D-0023 의
   「한 곳에서 선언하고 컴포넌트마다 복사하지 않는다」는 그대로다. 달라진 것은 그 한 블록이 **테마
   스코프마다 다시 풀린다**는 것뿐이다.
2. **값을 가리지 않는 `[data-theme]` 이다.** 색 토큰이 다시 선언되는 자리는 생성기가 모드마다 내는
   `[data-theme="<mode>"]` 다(`scripts/lib/token-model.mjs` 의 `appendCssBlock`). 값을 적어 두면 모드가
   늘 때 이 목록을 손으로 따라가야 한다. 색이 다시 선언되지 않는 값(`data-theme="…"` 의 다른 값)에서
   다시 푸는 것은 상속값과 같은 결과라 해가 없다.
3. **일반 규칙으로 적는다.** theme-dependent 토큰을 `var()` 로 묶어 발행하는 recipe 는 색 토큰과 같은
   `[data-theme]` 스코프마다 다시 선언한다 — [Color & Theme](../../foundations/color-theme.md)
   「Theme modes」.
4. **점진 블러 recipe 는 옮기지 않는다.** base.css 의 다른 `:root` 블록(`--louis-progressive-blur*`)은
   `blur(var(--louis-blur-surface))` · `blur(var(--louis-blur-header))` 와 `black` · `transparent` ·
   `color-mix(in srgb, black …, transparent)` 만 쓴다. `blur-*` 는 `:root, [data-theme="light"]` 블록에만
   있고 `[data-theme="dark"]` 에 다시 선언되지 않는다(`packages/css/generated/tokens.css`) — 테마로 값이
   갈리지 않으므로 `:root` 에서 한 번 풀려도 어디서나 같다.

## Alternatives

- **`:root, [data-theme="light"], [data-theme="dark"]` — tokens.css 의 선택자를 그대로 옮긴다.** 지금은
  결과가 같다. 모드가 늘면 이 목록이 생성기와 따로 낡는다.
- **recipe 를 토큰 생성기가 테마 블록마다 낸다.** DS-D-0023 이 inset 을 DTCG shadow 토큰으로 만들지
  않은 이유(inset shadow schema gap)가 그대로 남고, `styles.css` 가 소유하던 recipe 가 `tokens.css` 로
  옮겨 가 패키지 경계가 바뀐다. 결함 하나에 비해 크다.
- **컴포넌트가 조합값 대신 두 토큰을 직접 적는다.** DS-D-0023 이 금지한 「컴포넌트마다 shadow 문자열
  복사」로 돌아간다. 제품 소비처도 수백 자리를 고쳐야 한다.
- **소비처가 중첩 스코프에서 recipe 를 다시 선언한다.** 스코프를 여는 모든 소비처가 이 함정을 알아야
  한다. 제품에만 두 자리(홈 `main`, 워크스루 데모)가 이미 있다.
- **`*` 에 선언한다.** 저작 게이트가 전역 선택자로 막고(DS-D-0004), 모든 요소에서 다시 푼다.

## Consequences

- 중첩된 `[data-theme]` 안의 헤어라인이 그 스코프의 테마 색을 칠한다. 제품 홈은 다크 테마에서 여섯
  요소의 윤곽이 되살아난다(위 표). 바깥과 안이 같은 테마인 화면은 바뀌지 않는다.
- **recipe 를 덮어쓰는 소비처의 계약이 바뀐다.** `:root` 에서만 `--louis-hairline-inset*` 을 덮으면
  이제 중첩된 `[data-theme]` 요소에서 LOUIS 선언이 다시 이긴다 — 색 토큰을 덮을 때와 같은 규칙이다.
  덮으려면 `:root, [data-theme]` 을 함께 겨눈다. 제품에는 그런 선언이 없다(Context 의 git grep 0 줄).
- `[data-theme]` 요소마다 custom property 셋을 더 계산한다. 제품 홈에서 그런 요소는 `html` · `body` ·
  `main` 셋이다.
- **스코프가 아닌 요소에서 색 토큰을 덮는 경우는 여전히 따라오지 않는다.** 어떤 요소가
  `--louis-color-stroke-hairline` 만 지역으로 바꾸면 헤어라인은 가장 가까운 `[data-theme]` 의 값을
  유지한다. 테마는 `[data-theme]` 로만 연다는 [DS-D-0004](DS-D-0004-css-authoring.md) 결정 5 의 계약
  밖이다.
- `scripts/verify-consumer.mjs` 가 `styles.css` 의 `:root` 블록만 찾던 정규식을 `:root, [data-theme]`
  블록까지 넓혔다. 그대로 두면 헤어라인 블록을 건너뛰고 **조용히 통과한다** — 그 블록에 토큰이 새어도
  잡지 못한다. 블록에 `--louis-color-canary` 를 넣은 문자열로 옛 정규식은 0 건, 새 정규식은 1 건을
  잡는 것을 확인했다.
- 문서의 `base.css` 줄 인용이 밀렸다 — 헤어라인 `21-22` → `29-30`, 포커스 링 `50-54` → `58-62`.
  규범 넷(`elevation-layer.md` · `product-reading-traps.md` · `app-shell.md` ·
  `figma-component-authoring.md`)과 `verify-figma-parity.mjs` 주석을 고쳤다. `migration/*` 의 판정
  기록과 Updates 의 과거 항목은 그 시점의 기록이라 두었다.

## 세 곳 ([DS-D-0028](DS-D-0028-three-in-one-change.md))

| 곳 | 무엇 |
| --- | --- |
| LOUIS | 이 결정 · `base.css` · 생성물 · 브라우저 테스트 · 게이트 정규식 · 규범 |
| 제품 | **남았다.** 핀을 이 커밋으로 올린다. 제품 CSS 는 바꿀 것이 없다 — recipe 를 소비만 한다 |
| Figma | **바꿀 것이 없다.** Figma 에는 조합값에 대응하는 변수가 없다. 헤어라인은 노드마다 그리는 `INNER_SHADOW` 이고 그 색이 `color/stroke-hairline` 변수에 물린다. 변수는 노드가 놓인 자리의 모드로 풀리므로 모드를 중첩해도 제 모드의 값이 나온다 — 한 번 풀린 값이 내려오는 CSS 의 함정이 구조상 없다 |

## Rollout and verification

1. **레시피** — `packages/css/src/base.css` 의 선택자와 주석.
2. **생성물** — `pnpm build`(`styles.css` · `styles.layer.css`, 문서 생성물).
3. **게이트** — `scripts/verify-consumer.mjs` 정규식.
4. **규범** — DS-D-0023 결정 2 의 정정 주, [Color & Theme](../../foundations/color-theme.md) 「Theme
   modes」, [Elevation & Layer](../../foundations/elevation-layer.md) 「프레임」, Updates (151), manifest.
5. **테스트** — `packages/css/test/base.browser.test.ts` 「헤어라인 recipe 가 중첩된 테마 스코프의 색을
   칠한다」. `html` 다크 안의 라이트 `main`, `html` 라이트 안의 다크 `main` 두 경우에서 recipe 셋이 모두
   안쪽 스코프의 색이고 바깥 스코프의 색이 아닌지 잰다. 두 테마의 색이 같으면 단언이 아무것도 가르지
   못하므로 먼저 둘이 다름을 고정한다.

**음성 시험.** 테스트를 먼저 쓰고 이 변경 전 생성물로 돌리면 위 Context 의 실패가 난다(`browser`
project 10 중 1 실패). 선택자를 바꾸고 `build:css` 뒤에는 두 project 20 건이 모두 통과한다.

## Rollback

`base.css` 의 선택자를 `:root` 로 되돌리고 `build:css` 를 돌린다. 브라우저 테스트는 그때 실패하므로
함께 지운다. `verify-consumer.mjs` 의 넓힌 정규식은 되돌리지 않아도 된다 — `:root {` 블록도 여전히
잡는다. 규범 셋의 문장과 DS-D-0023 정정 주를 함께 되돌린다.
