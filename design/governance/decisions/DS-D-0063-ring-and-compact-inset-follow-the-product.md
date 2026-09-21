---
id: decision-ring-and-compact-inset-follow-the-product
status: experimental
authority: normative
---

# DS-D-0063 링 여백과 compact 인셋은 제품을 따른다 — 기록 다섯 칸을 옮기고 토큰은 하나만 옮긴다

- Status: accepted (기록 · 토큰 · 문서 2026-09-16)
- Date: 2026-09-16
- Owners: design system maintainer
- Affects: `pattern-app-shell`, `decision-app-shell-geometry`, `figma/templates.measured.json`

## Context

`figma/templates.measured.json` 은 「제품 실측값」을 소유한다. 그런데 앱 셸 다섯 칸이 실측이
아니라 **옛 실측**이었다.

| 칸 | 기록 | 제품 | 제품이 내린 커밋 |
| --- | --- | --- | --- |
| `app-shell.railPaddingTop` | 12 | 8 | `094c336b` (2026-09-09) |
| `app-shell.mainOuterGapTop` | 12 | 8 | `094c336b` |
| `app-shell.mainOuterGapRight` | 12 | 8 | `094c336b` |
| `app-shell.mainOuterGapBottom` | 12 | 8 | `094c336b` |
| `app-shell.compactContentInset` | 16 | 6 | `b23ac6ef` (2026-09-04) |

다섯 칸은 앵커 `6f6282c1` 이전부터 낡아 있었다. 2026-09-15 앵커 검토가 그것을 찾아 칸마다
`$pending` 에 인용을 적었고 parity 는 매 실행 「대기 app-shell.mainOuterGapRight: 기록 12 ·
제품 8」 꼴로 다섯 줄을 인쇄했다(Updates (138)). **값을 옮기지 않은 이유는 측정이 모자라서가
아니라 판정이 없어서였다** — 다섯 칸을 옮기면 당시 전부 12 · 16 이던 DS 토큰 셋
(`layout-app-shell-outer-gap` · `layout-app-shell-content-inset` · 레일 패딩 `space-control-md`)과
갈리고, 그중 무엇이 제품을 따라가야 하는지는 코드가 정할 수 없다.

소유자가 2026-09-16 에 「여백을 제품 값으로」라고 정했다.

## Decision

**기록 다섯 칸은 전부 제품 값으로 옮긴다. DS 토큰은 그중 한 축만 따라간다.**

1. `figma/templates.measured.json` 의 `railPaddingTop` · `mainOuterGapTop` ·
   `mainOuterGapRight` · `mainOuterGapBottom` 을 **8**, `compactContentInset` 을 **6** 으로
   옮기고 `$pending` 다섯 개를 지운다. 각 칸의 근거는 앵커 `2c6bdacf` 의 원문과 브라우저
   실측 원장(`migration/product.sidebar-states.json`) 둘을 함께 적는다.
2. **`layout-app-shell-outer-gap` 을 `{primitive.spacing.12}` 에서 `{primitive.spacing.8}` 로
   옮긴다.** 이 토큰이 지배하는 자리는 「카드 바깥 여백」이고, 제품의 데스크톱 세 변이
   전부 8 이므로 토큰이 12 로 남으면 이름이 가리키는 자리에서 토큰이 틀린 값을 말한다.
3. **제품 잔류 거울 토큰 둘을 함께 옮긴다** — `app-gnb-main-inline-padding-end` ·
   `app-gnb-rail-padding-bottom` 을 12 에서 **8** 로. 이 둘은 소비처가 아니라 **기록**이다.
   제품은 이 토큰을 받지 않고(제품이 같은 이름의 자기 변수를 따로 선언한다) DS CSS 도 물지
   않는다 — LOUIS 에 「제품의 이 축은 이 값이다」를 적어 두려고 둔 거울이다. 거울이 12 로
   남으면 같은 축을 이 저장소가 세 값(기록 8 · outer-gap 8 · 거울 12)으로 말한다.
   **≤719 의 6 · 0 은 여전히 담기지 않는다** — 단일값이라는 한계는 그대로다.
4. **`layout-app-shell-content-inset` 16 은 옮기지 않는다.**
5. **레일 패딩 `space-control-md` 12 는 옮기지 않는다.**

### 왜 content-inset 은 옮기지 않는가

6 은 **데스크톱 값이 아니다.** 제품은 데스크톱에서 여전히 LOUIS 토큰을 그대로 읽고
(`globals.css:155` — `--app-gnb-main-inline-padding: var(--louis-layout-app-shell-content-inset);`),
6 은 `@media (max-width: 719px)` 블록이 그 위에 덮는 값이다(`globals.css:428`). LOUIS 토큰은
단일값이라 두 값을 담을 자리가 없다 — 토큰을 6 으로 내리면 **제품이 실제로 토큰에서 받고
있는 데스크톱 자리**가 16 에서 6 으로 틀어진다. 반응형으로 갈라지는 축을 단일 토큰이 덮지
못한다는 것은 [DS-D-0018](DS-D-0018-app-shell-geometry.md) 이 「부분만 대응한다」로 이미
적어 둔 사실이고, 이 칸이 그 사실의 다섯 번째 사례다.

`compactContentInset` 6 은 그래서 **기록에만** 산다. 기록은 Figma 재조립이 모바일 시안을
그릴 때 보는 값이고, 그 자리에서 16 을 그리면 제품과 다른 화면을 정본이라고 우기게 된다.

### 왜 레일 패딩은 옮기지 않는가

제품 레일은 네 변이 **서로 다르다** — 좌우 12(`--app-gnb-sidebar-padding-x`, 이것은 LOUIS
`layout-app-shell-sidebar-padding` 을 그대로 읽는다) · 위 8(`--app-gnb-safe-top`) · 아래
0. DS 레일 `.louis-app-shell__rail` 은 `padding: var(--louis-space-control-md)` 로 네 변을
한 값에 묶는다. `railPaddingTop` 8 이 옮겨 가는 곳은 제품의 **위 변 전용 변수**이지
좌우까지 묶은 DS 의 패딩이 아니다. 좌우는 지금도 12 로 일치하므로 토큰을 8 로 내리면
맞던 두 변이 틀어진다. 이 편차는 값을 옮겨서가 아니라 [App Shell](../../patterns/app-shell.md)
이 사유와 함께 소유해야 할 종류다.

### 왜 outer-gap 은 옮기는가

같은 기준의 반대편이다. `layout-app-shell-outer-gap` 이 지배하는 자리(카드 바깥 여백)에서
제품의 세 변수는 데스크톱에서 **전부 8 한 값**이다. 셋이 서로 다른 변수를 무는 것은 사실이고
그래서 이 토큰은 여전히 「부분만 대응」하지만, **대응하는 그 부분에서 값이 8 이다.** 토큰이
12 로 남을 근거가 이제 하나도 없다.

## Alternatives

- **다섯 칸을 그대로 두고 제품을 되돌린다.** 기각. 12 → 8 과 16 → 6 은 둘 다 소유자 지정
  변경이고 제품 주석이 그 지정을 기록하고 있다(`globals.css:178-180` · `:426-427`).
- **토큰 셋을 전부 8 · 6 으로 내린다.** 기각. 위 두 절. 맞던 자리를 틀리게 만든다.
- **토큰을 하나도 옮기지 않고 기록만 옮긴다.** 기각. `outer-gap` 이 지배하는 자리에서
  DS 와 제품이 갈린 채 남고, 그 갈림을 말해 주는 게이트가 없다.
- **반응형 토큰(`-compact` 접미)을 새로 판다.** 보류. 축을 새로 여는 것은 별건이고, 지금
  갈라지는 축이 넷(`content-inset` · `main-inline-padding-end` · `rail-padding-bottom` ·
  safe-top)이라 하나를 열면 넷을 다 열어야 한다. [DS-D-0018](DS-D-0018-app-shell-geometry.md)
  이 미뤄 둔 자리에 그대로 둔다.

## Consequences

- `mainWidth` 규칙(`sceneWidth - railWidth - mainOuterGapRight`)의 해가 1440 씬에서
  **1192**(= 1440 − 240 − 8), `mainWidthCollapsed` 가 **1376**(= 1440 − 56 − 8)이 된다.
  같은 규칙을 원장의 1920 뷰포트에 넣으면 1920 − 240 − 8 = **1672** 이고
  `migration/product.sidebar-states.json` `states.expanded.mainRect.width` 가 그 1672 다 —
  규칙이 실측과 맞는다는 증거는 이 한 줄이다. 세로도 같다: `mainRect.y` 8 · `height`
  1064 = 1080 − 8 − 8.
- parity 의 「대기」 다섯 줄이 사라진다. 대신 Figma `Pattern · AppShell`(`982:175`) 이 아직
  12 · 16 이라 그 칸들이 **빨개진다** — 라이브 적용 전까지는 그것이 정상이다.
- `packages/css/generated/tokens.css` 의 `--louis-layout-app-shell-outer-gap` 이 8px 이 된다.
  이 토큰을 무는 DS CSS 선언은 현재 **없다** — 값이 움직여도 웹 소비처의 렌더는 바뀌지 않는다.
  거울 토큰 둘(`--louis-app-gnb-main-inline-padding-end` · `--louis-app-gnb-rail-padding-bottom`)도
  같다. 셋 다 렌더가 바뀌지 않으므로 **브라우저 테스트와 스크린숏은 이 변경에 반응하지 않는다** —
  이 변경을 지키는 것은 토큰 게이트와 생성 표뿐이다.
  **2026-09-21 정정 — 이제 한 곳이 문다.** main 에서 따로 선 Document 패턴
  ([DS-D-0067](DS-D-0067-document-is-not-an-app-screen.md))이 바닥과 시트 사이를
  `--louis-document-floor-inset: var(--louis-layout-app-shell-outer-gap)` 으로 빌린다. 이 브랜치가 그
  패턴을 병합으로 받으면서(Updates (148)) 720 이상의 문서 바닥 여백이 12 → 8 로 움직였다. 문서의
  브라우저 테스트는 값이 아니라 「토큰과 같다」를 재므로 여전히 반응하지 않는다.
- Figma 변수 `layout/app-shell-outer-gap` 은 `Klipse Primitive::spacing/12` 를 가리키고 있어
  세트 단계에서 `spacing/8` 로 함께 옮긴다. ~~거울 토큰 둘은 **Figma 변수가 아니다**(되읽기에
  행이 없다) — 옮길 것이 없다.~~
  **2026-09-21 정정 — 거울 토큰 둘도 Figma 변수다.** `app/gnb-main-inline-padding-end` ·
  `app/gnb-rail-padding-bottom` 은 `figma/readback.json` 에 행이 있고, 2026-09-21 읽기 전용 탐침에서도
  `Klipse Semantic` 컬렉션의 변수로 `Klipse Primitive::spacing/12` 를 가리켰다. 세트 단계에서
  `layout/app-shell-outer-gap` 과 함께 `spacing/8` 로 옮긴다(Updates (149)).

## Rollout and verification

1. 기록 · 토큰 정본을 같은 변경 단위로 옮기고 생성물은 `pnpm build` 로만 만든다.
2. [App Shell](../../patterns/app-shell.md) 의 「제품 변수」 표와 Updates (138) 을 같은
   단위에서 맞춘다.
3. `pnpm run verify-token-gates` · `pnpm run check-design-docs` · `pnpm run check-tokens` ·
   `pnpm run check-css` 가 초록이어야 한다. 기록 파일의 형식은 `verify-figma-parity` 가
   읽으면서 검사한다.
4. `verify-figma-parity` 는 라이브 적용 전이라 빨갛다. 빨간 줄의 수와 이유를 Updates 에 적는다.

## Rollback

토큰 한 줄(`{primitive.spacing.8}` → `{primitive.spacing.12}`)과 기록 다섯 칸을 되돌리고
`pnpm build` 를 다시 돌리면 끝난다. 생성물 밖에 손으로 적은 수가 없으므로 되돌림에 잔여가
남지 않는다.
