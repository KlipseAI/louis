---
id: decision-table-row-hover-is-a-state-layer
status: experimental
authority: normative
---

# DS-D-0065 표 행 hover 는 면이 아니라 상태 레이어다 — 다크에는 카드 위 한 칸이 없다

- Status: accepted (LOUIS · Figma 2026-09-17, 제품 핀 상향은 남았다)
- Date: 2026-09-17
- Owners: repository owner (결정), design system maintainer
- Affects: `table`, `decision-alpha-scale`, `decision-three-in-one-change`,
  `decision-token-names-must-be-true`, `decision-no-duplicate-role-tokens`

## Context

`.louis-table > tbody > tr[data-interactive="true"]:hover > td` 는 `color-table-row-hover` 를
칠한다. 이 토큰은 **면 사다리 칸**을 물고 있었다 — light `palette-gray-050`, dark
`palette-gray-900`. `021c2b6`(2026-09-11)이 pg-850 칸을 비우며 dark 값을 `palette-gray-900`
으로 내리자 **`color-bg-surface` · `color-bg-raised`(dark)와 바이트 단위로 같아졌다** —
셋 다 `color(srgb 0.090196 0.105882 0.133333 / 1)` 이다. light 값도 `color-bg-inset`(light)과
같다(`color(srgb 0.921569 0.92549 0.933333 / 1)`). 그 커밋의 Updates (127)이 이미 적어 두었다 —
「표가 `bg-surface` 위에 얹히면 머리 띠와 행 호버가 호스트와 같은 값이 된다. 면이 아니라 흰색
알파로 옮기는 것이 맞고, 그것은 별건이다.」 **이 결정이 그 별건 중 행 호버다.** 머리 띠는
건드리지 않는다.

**제품에서 드러났다.** 레시피의 hover 를 켜는 표 두 벌이 둘 다 카드 `bg-surface` 위에 놓인다.

| 표 | 행에 붙은 속성 | 표가 놓인 바닥 |
| --- | --- | --- |
| 구독 화면 크레딧 사용 이력 | `SubscriptionScene.tsx:1403` | 메인 카드(`myPageSceneStyles.ts:73`) — `globals.css:1611`·`1584` 두 테마 `bg-surface` |
| 분석 콘텐츠 표 | `ContentTable.tsx@3e3765a9:474` — 원격에 없는 작업 브랜치 | 안쪽 패널(`ContentTable.tsx:43`) — `YoutubeAnalyticsScene.tsx:659` `bg-surface` |

낱말 그대로의 선언이다. 앵커 `6fbdac16` 의 줄은 `git show 6fbdac16:<경로>`, 분석 표의 행
속성은 `git show 3e3765a9:<경로>` 로 재확인한다.

```
SubscriptionScene.tsx:1330        <table className={styles.creditHistoryTable}>
SubscriptionScene.tsx:1403        data-interactive={href ? "true" : undefined}
myPageSceneStyles.ts:73           "appMainCardChromeSurface",
myPageSceneStyles.ts:313          "louis-table",
globals.css:1611                  background-color: var(--louis-color-bg-surface);
globals.css:1619                  background-color: var(--louis-color-bg-surface);
ContentTable.tsx:43               "p-3 rounded-10 bg-[var(--dashboard-inner-panel-bg)]",
ContentTable.tsx:61               const TABLE = "louis-table";
YoutubeAnalyticsScene.tsx:659     "[--dashboard-inner-panel-bg:var(--louis-color-bg-surface)]",
ContentTable.tsx@3e3765a9:474     data-interactive={onRowClick ? "true" : undefined}
```

`globals.css:1611` 은 `html[data-theme="light"] .appMainCardChromeSurface` 블록(`:1573`),
`:1584` 는 `html[data-theme="dark"]` 블록(`:1583`) 안이다.

## Decision

1. **`color-table-row-hover` 를 상태 레이어로 옮긴다** — light `static-black-alpha.08` · dark
   `static-white-alpha.08`. `color-accent-ghost-hover` 와 같은 칸이다. 새 프리미티브는 없다.
2. **이름은 그대로 둔다.** 레시피가 `color-accent-ghost-hover` 를 직접 물지 않는다.
   [DS-D-0029](DS-D-0029-token-names-must-be-true.md)가 이름이 참이어야 한다고 정했고,
   [DS-D-0045](DS-D-0045-danger-secondary-variant.md)가 alert 토큰을 버튼 면에 물리지 않은 이유가
   그대로 적용된다 — ghost 버튼의 hover 를 조정하는 날 표가 함께 움직인다. 값이 같다고
   [DS-D-0030](DS-D-0030-no-duplicate-role-tokens.md) 위반이 아니다 — 역할이 다르다.
3. **레시피 규칙은 그대로다.** `table.css` 는 주석만 바뀐다 — 사다리 칸으로 되돌리지 말라는 경고.
4. **light 칸은 실측으로 골랐고, dark 칸은 계열에서 왔다.** 두 값의 근거가 다르다는 것을 토큰의
   `$description` 과 아래 표에 함께 적었다.

## 왜 상태 레이어인가

- **쉬는 행에 면이 없다** — `td` 배경이 투명이다. 면 없는 요소의 hover 는 이 저장소에서 이미 잉크
  알파다. ghost Button, `Selectable List Row` 의 Hover(`selectable-list-row.md` States 표 — 「면
  `color-accent-ghost-hover`」), Menu 의 Item hover(`menu-popover.md` — 「반투명 오버레이 — 배경이
  달라도 같은 정도」). 표 행만 사다리 칸을 물고 있었다.
- **면과 상태는 반대 방향으로 간다.** Updates (126)은 랜딩 `landing-panel-strong` 을 알파에서 불투명
  칸으로 옮겼다 — 그것은 **쉬는 면**이라 바닥이 움직일 때 따라 움직이면 안 됐다. hover 는 반대로
  **바닥이 무엇이든 그 위에서 한 겹**이어야 한다.
- **다크에는 카드 위 한 칸이 없다.** `bg-raised`(dark) = `bg-surface`(dark) 가 `021c2b6` 의 결론이다.
  면으로 풀려면 850 칸을 되살려야 하는데 그것은 `021c2b6` 을 되돌리는 별개의 결정이다.

## 값 — 실측

### 방법

- 제품 고정 커밋의 진입 CSS(`tailwind.css` + `globals.css`)를 제품의 tailwindcss 4.3.3 으로
  컴파일하고 `@klipse-design/css/*` 자리에 LOUIS 생성물을 둔다 —
  `scripts/measure-product-variants.mjs` 와 같은 조립법이다. 생성물은 둘을 쟀다: 제품 핀
  `021c2b6` 과 이 변경의 워킹트리.
- 호스트 사슬은 **제품 상수에서 읽은 클래스 문자열로만** 세운다(값은 한 줄도 적지 않는다).
  분석 `PAGE_APP_SIDEBAR_RAIL › MAIN_WITH_APP_SIDEBAR › DASHBOARD_BODY_CARD › CONTENT_SECTION ›
  CONTENT_INNER_PANEL › TABLE_WRAP › TABLE`, 구독 `page › contentWithAppSidebarPanel ›
  content + contentWithAppSidebar › container + settingsSection + … › panel + tabPanel + planPanel ›
  planSplitGrid › creditHistoryBlock › creditHistoryTableWrap › creditHistoryTable`.
- 헤드리스 Chromium(1440×900 · DPR 1 · `--force-color-profile=srgb`)에서 `html` 과 `body` 둘 다
  `data-theme` 을 단다. 행에 실제 포인터를 올리고 `:hover` 가 걸린 것을 확인한 뒤 **(1) 뷰포트
  스크린숏의 픽셀**과 **(2) 조상 배경을 캔버스에 차례로 칠한 8비트 합성색**을 함께 읽는다 —
  계산값 문자열을 정규식으로 긁지 않는다. 네 번의 측정(제품 커밋 둘 × 생성물 둘)에서 쉬는 행과
  hover 행 96 읽기 중 94 가 두 방법에서 같았고, 둘은 같은 자리(구독 표 dark hover, 후)에서 초록
  채널만 1 달랐다(픽셀 41,45,51 · 캔버스 41,44,51). 아래 표는 스크린숏 픽셀이다.
- 제품 커밋 둘에서 쟀다 — 분석 표의 hover 가 켜진 작업 브랜치 `3e3765a9` 와 LOUIS 앵커
  `6fbdac16`. 두 커밋의 값이 같았다.

### 허용 기준

light 모양 유지는 [Figma Sync](../figma-sync.md) 「알파 패밀리는 14 에서 4 로」가 알파를 16단 칸에
흡수할 때 쓴 기준을 그대로 쓴다 — 「흡수 기준은 **합성 결과**다 — 쓰이는 배경 위에 올렸을 때 색이
같아 보이는 `static-black/white-alpha` 단계를 골랐다. 최대 오차 11.7/441(2.7%)로 눈에 띄지
않는다.」 **표가 놓인 바닥 위 합성색의 8비트 RGB 유클리드 거리 11.7 이하**다. CIEDE2000 을 함께
적는다.

### light 칸 고르기 — 제품 표 바닥 `bg-surface`(250,250,250) 위

| 칸 | 합성 | 옛 hover 235,236,238 과 유클리드 | ΔE00 |
| --- | --- | ---: | ---: |
| `static-black-alpha.04` | 241,241,241 | 8.37 | 1.50 |
| **`static-black-alpha.08`** | **232,232,233** | **7.07** | **1.04** |
| `static-black-alpha.12` | 222,222,223 | 24.29 | 3.09 |

04 와 08 이 둘 다 기준 안이고 08 이 더 가깝다. 08 은 ghost hover 의 light 칸이기도 하다.

### 제품 두 표 — 전(핀 `021c2b6`) · 후

| 테마 | 표 | 바닥 | 전 hover | 대비 | 후 hover | 대비 |
| --- | --- | --- | --- | ---: | --- | ---: |
| light | 분석 콘텐츠 | 250,250,250 | 235,236,238 | 1.13 | 232,232,233 | 1.17 |
| light | 구독 크레딧 | 250,250,250 | 235,236,238 | 1.13 | 232,232,233 | 1.17 |
| dark | 분석 콘텐츠 | 23,27,34 | **23,27,34** | **1.00** | 41,44,51 | 1.24 |
| dark | 구독 크레딧 | 23,27,34 | **23,27,34** | **1.00** | 41,45,51 | 1.25 |

light 의 전→후 이동은 유클리드 7.07 · ΔE00 1.04 로 기준 안이다. 대비는 두 색의 상대 휘도 비다 —
접근성 판정이 아니라 hover 가 바닥과 갈리는지를 재는 수로 쓴다.

### 사다리 바닥 넷 — LOUIS 레시피만(제품 CSS 없이)

| 테마 | 바닥 | 전 hover | 대비 | 후 hover | 대비 |
| --- | --- | --- | ---: | --- | ---: |
| light | `bg-canvas` 242,243,245 | 235,236,238 | 1.06 | 225,226,228 | 1.17 |
| light | `bg-inset` 235,236,238 | 235,236,238 | **1.00** | 218,219,222 | 1.17 |
| light | `bg-surface` 250,250,250 | 235,236,238 | 1.13 | 232,232,233 | 1.17 |
| light | `bg-raised` 255,255,255 | 235,236,238 | 1.18 | 237,237,238 | 1.17 |
| dark | `bg-canvas` 13,17,24 | 23,27,34 | 1.10 | 31,35,42 | 1.20 |
| dark | `bg-inset` 13,17,24 | 23,27,34 | 1.10 | 31,35,42 | 1.20 |
| dark | `bg-surface` 23,27,34 | 23,27,34 | **1.00** | 41,44,51 | 1.24 |
| dark | `bg-raised` 23,27,34 | 23,27,34 | **1.00** | 41,44,51 | 1.24 |

**light 에서도 결함이 하나 있었다** — `bg-inset` 바닥 위 hover 가 바닥과 같았다. 상태 레이어는
바닥 넷 모두에서 같은 대비(light 1.17 · dark 1.20~1.24)를 낸다.

**dark 칸은 실측으로 고른 값이 아니다.** 제품에 되살릴 dark hover 가 없었기 때문이다(1.00).
ghost hover 계열의 칸(흰색 8%)을 따랐고, 위 표는 그 칸이 두 dark 바닥(`bg-inset` · `bg-surface`)
위에서 드러나는지를 잰 것이다.

## Alternatives

- **dark 에 면 칸을 되살린다(pg-850).** `021c2b6` 이 반 칸을 없앤 이유 — 사다리가 움직일 때마다
  칸의 뜻이 바뀐다 — 가 그대로 돌아온다. light `bg-inset` 바닥 위 1.00 도 남는다.
- **light 는 불투명 칸(pg-050)을 두고 dark 만 알파.** 한 역할이 테마마다 다른 종류가 되면 바닥이
  움직일 때 한쪽만 따라간다. light `bg-inset` 위 1.00 이 그대로다.
- **레시피가 `color-accent-ghost-hover` 를 직접 문다(토큰 삭제).** removal breaking 이고, 위 2 의
  이유로 두 역할이 묶인다.
- **light 4%(`color-accent-menu-item-hover` 의 칸).** 기준 안이지만 옛 모양에서 더 멀다(유클리드
  8.37 · ΔE00 1.50 대 7.07 · 1.04).

## Consequences

- `check-token-diff` 가 breaking 을 낸다 — rawValue 2 · value 2 · aliasTarget 2 · description 2,
  전부 `color-table-row-hover` 의 두 모드다. 의도된 변경이므로 baseline 을 승인해 잠갔다.
- **light 제품 표의 hover 가 한 단 짙어진다**(235,236,238 → 232,232,233, ΔE00 1.04). light
  `bg-inset` 바닥 위 표에서는 처음으로 hover 가 보인다.
- **dark 제품 표의 hover 가 처음으로 보인다**(1.00 → 1.24).
- **구독 크레딧 표에서 hover 행이 머리 띠와 같은 색이 된다.** 그 표는 머리 띠를 레시피 면 대신
  `accent-secondary`(검정 8% · 흰색 8%)로 칠한다(`myPageSceneStyles.ts:325`). 잰 값 — 머리 띠
  light 232,232,233 · dark 41,45,51, 후 hover 도 같은 값이다. light 는 전에도 ΔE00 1.04 차이뿐이었다.
  머리 띠와 hover 행을 가르는 것은 위치와 머리 행 헤어라인이다.
- **Figma 는 변수 하나의 두 모드 별칭만 바뀐다.** `TableCell` 의 Hover 변형 셋(`777:822` · `777:826` ·
  `777:830`)이 그 변수에 묶여 있고, 저장색이 Figma 에 의해 함께 옮겨졌다 — (0.090196, 0.105882,
  0.133333) · 페인트 불투명도 0.08. ghost Button 의 Hover 칸과 같은 저장 형태다.
- **제품은 이 변경에서 움직이지 않는다.** 핀 상향이 [DS-D-0028](DS-D-0028-three-in-one-change.md)의
  세 번째 곳으로 남는다.

## Rollout and verification

1. **토큰** — `packages/tokens/src/klipse.tokens.json` 두 모드의 `$value` 와 `$description`
   (「2026-09-17 소유자 결정: 표 hover 를 상태 레이어로」).
2. **레시피** — `packages/css/src/component/table.css` 주석.
3. **생성물** — `pnpm build` 와 `build-figma-variables`(`figma/apply-variables.9.js`).
4. **baseline** — `packages/tokens/baseline/manifest.json` 을 생성 manifest 로 복사.
5. **테스트** — `packages/css/test/table.browser.test.ts`. table.md Acceptance 10 · 11 · 17 을 사다리
   바닥 넷 × 테마 둘에서 잰다.
6. **Figma** — 아래.
7. **문서** — [Table](../../components/table.md) States · Specification · Known deviations ·
   Acceptance, Updates (142), manifest.

**Figma 적용은 `apply-variables.9.js` 를 한 항목으로 거른 채 돌렸다.** 적용 전에 라이브 510 변수를
세 컬렉션 전부 떠(값 · 숨김 · scopes) apply 명세 1~9 와 맞춰 보았고, 적용 뒤에는 명세를 담은 읽기
전용 대조 코드로 같은 대조를 기계로 다시 돌렸다. 값이 갈린 것은 `figma/readback.json` 머리말이 이미
float 예외로 적어 둔 둘(`scale/tooltip-rest` · `color/green-500-alpha/08`)뿐이다 — 적용 전에는 여기에
`color/table-row-hover` 두 모드가 더 있었다. 그러나 **scopes 와 hiddenFromPublishing 은 라이브가 명세와
다른 자리가 많다** — scopes 73(Klipse Semantic Color 72 · Primitive 1), hidden 3
(`color/green-500-alpha/08` · `color/red-alpha/24` · `color/static/white`). `apply-variables.9.js` 55 항목
중에도 23 항목(`color/node/handle-*` 21 · `color/scrollbar/thumb*` 2)의 scopes 가
`ALL_FILLS,EFFECT_COLOR,STROKE_COLOR` 다. 파일을 통째로 돌리면 그 자리를 명세 값으로 덮는다.
[Figma Sync](../figma-sync.md) 쓰기 정책 5 — 「Figma 쪽 수동 편집과 충돌하면 덮어쓰지 않고 diff를
보고한다」 — 가 우선이므로 **생성물 그대로에 `COL.vars` 를 거르는 한 줄만 더해** 돌렸다. 결과는
`updated 1 · created 0 · missingAlias 0` 이다. 1~8 번은 돌리지 않았다.
위 scopes 73 · hidden 3 은 같은 날 뒤이어 [Updates (143)](../../updates/README.md) 이 소유자 결정으로 정리했다 —
이 문단은 그 전 라이브의 기록이다.

되읽기는 `node scripts/figma-readback-emit.mjs --variables --only color/table-row-hover` 가 낸 코드를
읽기 전용으로 돌려 `--merge-variables` 로 넣었고(행 1 갱신), `build-figma-snapshot` 을 같은 작업에서
돌렸다. 손으로 쓴 행은 없다.

**음성 시험.** 토큰 두 모드를 옛 사다리 칸(`palette-gray.050` · `palette-gray.900`)으로 되돌리고
`build:tokens` · `build-css` 뒤 `vitest run packages/css/test/table.browser.test.ts` 를 돌리면 두
project 에서 **다섯씩 열 개가 실패한다** — 두 테마의 「알파 상태 레이어」 단언과 light `bg-inset` ·
dark `bg-surface` · dark `bg-raised` 의 「hover 합성색이 바닥과 같다」.

```
AssertionError: dark bg-surface: hover 합성색이 바닥과 같다 — 표 위에서 hover 가 사라진다:
  expected [ 23, 27, 34 ] to not deeply equal [ 23, 27, 34 ]
AssertionError: light bg-inset: hover 합성색이 바닥과 같다 — 표 위에서 hover 가 사라진다:
  expected [ 235, 236, 238 ] to not deeply equal [ 235, 236, 238 ]
```

되돌리면 20 건 전부 초록이다. 생성물은 되돌린 뒤 체크섬으로 변경 전과 같음을 확인했다.
