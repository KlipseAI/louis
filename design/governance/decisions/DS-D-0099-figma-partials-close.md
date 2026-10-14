---
id: decision-figma-partials-close
status: experimental
authority: normative
---

# DS-D-0099 Figma `partial` 넷을 닫는다 — 노드 크롬 호버 쌍 · 사이드 핸들 비활성 · Media Card · Step Tile 의 「어느 쪽이 정본인가」

- Status: accepted (소유자 지시로 판정마다 기본값을 받는다, 2026-10-14)
- Date: 2026-10-14
- Owners: repository owner, design system maintainer
- Affects: `node-chrome-button`, `node-side-handle`, `media-card`, `step-tile`, `figma-component-authoring`, `decision-product-parts-become-louis`

## Context

2026-10-14 밤 manifest 의 `figma: partial` 은 다섯이었다 — `node-chrome-button` · `node-side-handle` · `media-card` · `step-tile` ·
`canvas-edge`. 마지막 하나는 레시피를 세우지 않는다는 판정(DS-D-0061)을 다시 여는 일이라 [DS-D-0100](DS-D-0100-canvas-edge-recipe.md) 이
따로 갖는다. 나머지 넷이 `partial` 에 남은 이유는 각자 달랐다.

- **node-chrome-button** — `verify-figma-done` 의 기계 조건은 이미 섰는데 호버 틴트가 다크에서 4%p 갈렸다. 제품은 중립을
  라이트 순검정 8% · 다크 흰 12%, 삭제를 red 8% · 12%, sm 복사 버튼을 라이트 palette-gray-900 8% · 다크 흰 16% 로 칠하는데,
  Figma 와 레시피는 두 모드 8% 인 `accent-ghost-hover` · `red-alpha/08` 에 물려 있었다. 모드 쌍을 담을 변수가 없었다.
- **node-side-handle** — 상태 축을 열지 않았다. 사유 셋 중 첫째(「비활성 면이 라이트/다크에서 다른 토큰이고 라이트는 필터라 값이
  없다」)는 [DS-D-0083](DS-D-0083-deck-feedback-triage.md) 이 라이트 비활성 토큰을 필터를 구운 색으로 세우며 이미 풀렸고, 채널도 셋이
  아니라 여섯이 됐는데 Figma 는 셋에 남아 있었다.
- **media-card · step-tile** — 기하는 한 방향(Figma ↔ 제품 실측)으로만 대조됐다. LOUIS 레시피가 없어 「코드가 그 실측을 여전히
  만드는가」를 되잴 코드가 없었고(DS-D-0035 (c)), 문서의 Known deviations 에 「어느 쪽을 정본으로 삼을지는 소유자 판정」이 남아 있었다.

[DS-D-0084](DS-D-0084-product-parts-become-louis.md) 가 그 질문의 답을 이미 정했다 — **제품이 정본이고, 대비 미달 같은 과거 UI
부채는 올리면서 고친다.** 이 결정은 그 원칙을 각 질문에 적용한 기본값을 적는다.

## Decision

### 1. node-chrome-button — 호버 틴트의 모드 쌍을 시맨틱 셋으로

| 판단 | 기본값 | 대안 |
| --- | --- | --- |
| 다크 4%p 를 어떻게 닫나 | **새 시맨틱 셋**(DS-D-0028 셋을 한 변경으로 — 토큰 · Figma 변수 · CSS). `color-node-chrome-hover`(라이트 `static-pure-black-alpha/08` · 다크 `static-white-alpha/12`), `color-node-chrome-danger-hover`(`red-alpha/08` · `/12`), `color-node-chrome-hover-sm`(`static-black-alpha/08` — palette-gray-900 과 같은 값 · `static-white-alpha/16`) | `accent-ghost-hover` 의 다크를 12% 로 올린다 — 그 이름을 쓰는 다른 부품 전부의 다크가 함께 움직여 거절 |
| sm 도 같이 닫나 | **닫는다.** 같은 칸(Known deviations 8)이고 Figma `Size=sm, State=Hover` 가 이미 서 있다 | md 만 닫고 sm 을 어긋남으로 남긴다 |
| 원시를 새로 만드나 | **아니다.** 여섯 값이 모두 있는 알파 램프 칸이다 | — |

### 2. node-side-handle — Figma 가 표현할 수 있는 상태를 연다

| 판단 | 기본값 | 대안 |
| --- | --- | --- |
| 무엇을 여나 | **`State` = `Default` · `Disabled`.** Disabled 는 면 `color/node/handle-bg-disabled-{채널}` · 글리프 `handle-icon-disabled-{채널}` 이고 안쪽 광(INNER_SHADOW)이 없다 — 레시피가 비활성에서 `::before` 를 끄는 것과 같다 | 열지 않고 문서로만 남긴다 |
| Hover · Active | **열지 않는다 — Figma 가 표현할 수 없는 칸이다.** `filter: brightness()` 와 디스크 `scale()` 이라 옮길 색 변수가 없다. 사유는 기록의 `$whyNoHoverVariant` | 프레임 크기를 1.08 배로 그린다 — 기하 계약이 「눌린 크기」를 정본처럼 말하게 돼 거절 |
| 메뉴 열림(`Open`) | **열지 않는다.** `filter: none` 만 더해 기본과 시각이 같다 | — |
| 채널 | **여섯으로 넓힌다**(image · text · edit · audio · youtube · instagram — 레시피와 같다). 12 variant | 셋에 둔다 — 레시피와 Figma 의 축이 갈라 거절 |

### 3. media-card — 레시피를 세우고 정본 질문 셋을 제품 쪽으로

| 판단 | 기본값 | 대안 |
| --- | --- | --- |
| 정본 | **제품 `MediaCard.tsx`.** 레시피 `.louis-media-card` 가 그 클래스를 옮긴다(박스 `data-layout` · 배지 · 정보 바 · 이름 줄 · 설명) | — |
| 정보 바 tint 1% 대 4% | **레시피는 제품 1% 를 그대로 갖는다** — `color-mix(media-foreground-dark 1%)`. [색과 테마](../../foundations/color-theme.md) 「블러 표면의 tint 알파는 램프 단계가 아니다」가 이미 이 값을 예외로 세웠다. **Figma 는 `static-white-alpha/04` 에 남는다** — Figma 는 변수 알파가 칠 불투명도를 덮어 1% 를 담을 칸이 없다 | 램프에 `01` 을 만든다(「02 · 03 도」가 열려 거절) · 제품을 4% 로 올린다(디자이너가 고르지 않은 값) |
| 배지 층(`TopBar`) | **제품의 절대 배치가 정본이다** — 레시피는 배지를 카드 모서리에서 16(`badgeInset`)에 `absolute` 로 놓는다. Figma `TopBar`(높이 54 · 안쪽 16)는 같은 자리를 만드는 투영으로 남는다 — 기록의 `badgeInset` 16 이 두 쪽을 맞댄다 | Figma 에서 `TopBar` 를 걷어 낸다 — 오토레이아웃이 배치를 지키는 장치를 잃는다 |
| `Badge` 축 | **§2 판정대로 `Badge` BOOLEAN + `BadgeLabel` TEXT, 변형 3 → 1.** 문구 `New` · `Top` 은 문서 Content 가 갖는다 | VARIANT 3값을 남긴다 — 시험 4 에 걸린다 |
| 숫자 z-index | **쓰지 않는다.** 제품 `z-1` 은 DOM 순서(흐림 `::before` 가 먼저)와 이름 줄 · 설명의 `position: relative` + `translateZ(0)`(iOS 합성 레이어)로 옮긴다 | — |
| 대비 | **사진마다 달라 고정할 수 없다** — 기존 판정 그대로. 레시피 시험은 잉크가 `media-foreground-dark` 계열이라는 것을 잰다 | — |

### 4. step-tile — 레시피를 세우고 정본 질문 셋을 제품 쪽으로

| 판단 | 기본값 | 대안 |
| --- | --- | --- |
| 캡션의 층 | **제품의 인라인 흐름이 정본이다** — 레시피 캡션은 `<p>` 하나이고 라벨 · 설명이 `inline-block` 두 덩어리, 사이는 진짜 공백 문자다(복사 · 접근성 트리에서 붙지 않는다). Figma `Caption` 의 가로 오토레이아웃 `itemSpacing` 4 는 그 공백 폭(실측 4.69)의 투영으로 남는다 | Figma 를 TEXT 하나의 두 스타일 구간으로 바꾼다 — 설명의 BOOLEAN 이 레이어 가시성으로 그릴 수 없게 돼 거절 |
| 목록의 롤 | **레시피 목록 `.louis-step-tile-list` 의 마크업이 `role="list"` 를 갖는다**(DS-D-0084 3항 — 과거 부채를 고친다). `list-style: none` 이 WebKit 에서 목록 롤을 벗기는 것을 막는다 | 제품 그대로 둔다 |
| 설명 대비 | **`landing-text-muted` 를 그대로 쓴다** — 지금 값은 라이트 5.11:1 · 다크 8.03:1 로 AA 를 넘는다(문서의 3.63 은 옛 토큰 값). 레시피 시험이 실제로 잰다 | — |
| 라벨 잉크 | **새 시맨틱 `color-landing-text-strong`**(라이트 palette-gray-800 · 다크 palette-gray-200 — 적응형 램프 `gray-200` 과 같은 값). 제품은 `text-gray-200` 이지만 저작 CSS 게이트가 램프 이름을 막는다. Figma `StepTile` 의 Label 도 같은 이름의 변수로 다시 묶는다 | 레시피를 `fg-secondary` 로 둔다 — 라이트 #41454c 로 제품보다 흐려져 거절 |
| 타일 면 폴백 | **두지 않는다.** 제품의 `gray-000` 8% 폴백은 `--panel-strong` 이 랜딩 루트에서만 정의되기 때문이었다. LOUIS 의 `color-landing-panel-strong` 은 루트에 늘 있다 | — |
| BOOLEAN 이름 | **`{Name}` BOOLEAN + `{Name}Label` TEXT 짝을 §3 명부에 올린다**(MediaCard `Badge` · StepTile `Description`) | 이름을 `ShowDescription` 등으로 바꾼다 — 인스턴스 재바인딩이 따라와 거절 |

## Consequences

- 새 시맨틱 넷(`color-node-chrome-hover` · `-danger-hover` · `-hover-sm` · `color-landing-text-strong`)과 같은 이름의 Figma 변수가 선다. 원시는 늘지 않는다.
- 새 레시피 둘(`media-card.css` · `step-tile.css`)과 실브라우저 되재기가 서고, 네 부품의 `figma` 가 `done` 이 된다(`verify-figma-done` 이
  조건을 계산한다). `web` 은 React 표면이 없어 `partial` 이다.
- `figma-component-authoring.md` §3 명부에 문구 유무 짝(`{Name}` + `{Name}Label`)이 오른다.
- 남는 것: 노드 크롬 · 사이드 핸들의 제품 렌더 대조(`$noProductRender`), media-card 의 사진 위 대비(측정 불가), step-tile 의 문구 결손(JA ·
  카드 1 설명 중복).

## Rollback

토큰 셋은 `packages/tokens/src/klipse.tokens.json` 에서 지우고 레시피의 세 곳을 `accent-ghost-hover` · `color-mix(accent-danger 8%)` 로
되돌리면 된다(Figma Hover 칸도 옛 변수로 다시 묶는다). 레시피 둘은 파일을 지우고 manifest 의 `figma` 를 `partial` 로 내리면 되는데,
그때 `MANIFEST_DONE_FLOOR` 를 함께 내려야 한다 — 바닥은 강등을 막는 장치다.
