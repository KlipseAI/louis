---
id: decision-canvas-semantics-and-product-ink-alpha
status: experimental
authority: normative
---

# DS-D-0082 캔버스 시맨틱 토큰과 제품 바탕의 투명 잉크

- Status: accepted (소유자 결정, 2026-10-08 밤 — 제품 디테일 변화 감사 뒤 두 가지)
- Date: 2026-10-08
- Owners: repository owner, design system maintainer
- Affects: `node-shell`, `node-chip`, `floating-shell`, `menu-popover`, `canvas-edge`,
  `foundation-color-theme`, `governance-figma-sync`, `decision-alpha-scale`,
  `decision-no-theme-branch-on-adaptive-ramp`, `decision-menu-surface-light-one-step-lighter`

## Context

2026-10-08 감사(제품 통합 판 `54b62a8aa` 와 LOUIS 를 맞댄 읽기 전용 조사, 작업 메모라 커밋하지 않았다)가
캔버스 쪽에서 같은 모양의 어긋남을 여럿 찾았다. **LOUIS 문서와 측정 보드는 제품 값을 알고 있는데, 토큰 · CSS
레시피 · Figma DS 컴포넌트는 앱 전체의 기본값에 묶여 있다.** 그래서 DS 컴포넌트로 캔버스를 조립하면 옛 톤이 나온다.

| 감사 ID | 자리 | 제품 | LOUIS(이 결정 전) |
| --- | --- | --- | --- |
| X3 | 라이트 투명 잉크 `rgb(var(--gray-000-rgb) / N%)` | 순검정 `#000000` 바탕 | `color/gray/000-alpha/*` → `static-black-alpha/*` = `#171b22` 바탕 |
| K3 | 노드 카드 테두리 2px | 라이트 흰색 · 다크 `palette-gray-700` | `stroke-default`(라이트 `palette-gray-300` · 다크 `palette-gray-600`) |
| K8 | 캔버스 안 메뉴 · 떠 있는 툴바 · 줌 알약 · 미니맵 면 | 라이트 흰색 | `bg-menu`(라이트 `palette-gray-025`) |
| K6 · K7 | 메타 알약 · 노드 크롬 버튼 면 | 라이트 `palette-gray-000` · 다크 `palette-gray-700` | 알약은 `node-chip-surface`(라이트 050 · 다크 600). `canvas-chip-surface` 가 있지만 CSS 가 읽지 않는다. `node/chrome-btn-bg` 는 라이트 050 · 다크 600 |
| X1 | 캔버스 점 격자 라이트 | `palette-gray-600` 28% | `static-black-alpha/12`(`#171b22` 12%) |
| X4 | `color/app/page-bg` 라이트 | `bg-canvas`(`palette-gray-025`) | `palette-gray-100` |

X3 은 보드에서 묶이지 않는 칠의 대부분을 만든다 — 제품의 `rgb(var(--gray-000-rgb) / N%)` 는 라이트에서 `000000` 에
알파 15단계(`0a 14 1f 33 3d 47 52 66 7a 8f a3 b8 cc e0 f5`)로 그려지는데, LOUIS 의 알파 사다리는 `#171b22` 바탕이라 어느
변수와도 값이 같지 않다.

### 제품 인용 — 통합 판 `54b62a8aa`

명령은 전부 `git -C <통합 저장소> show 54b62a8aa:<웹 앱 경로>` 이고 줄은 그 출력의 줄 번호다.

`globals.css`(웹 앱의 `app/globals.css`)

```
57:  --palette-gray-000-rgb: var(--louis-color-palette-gray-000-rgb);
71:  --palette-gray-1000-rgb: var(--louis-color-static-black-rgb);
726:  --gray-000-rgb: var(--palette-gray-000-rgb);
768:  --scrollbar-thumb: rgb(0 0 0 / 20%);
769:  --scrollbar-thumb-hover: rgb(0 0 0 / 32%);
782:  --gray-000-rgb: var(--palette-gray-1000-rgb);
804:  --app-page-bg: var(--louis-color-bg-canvas);
```

726 은 `html[data-theme="dark"]` 블록, 768 · 769 · 782 · 804 는 `html[data-theme="light"]` 블록 안이다. 라이트 잉크는
`palette-gray-1000` → `static-black`(순검정)이고 **다크 잉크는 `palette-gray-000`(`#fafafa`, 250)이다 — 순백(255)이 아니다.**

`node-canvas-v2/index.tsx`(웹 앱의 `components/scenes/create/` 아래)

```
441:  String.raw`[&_.react-flow\_\_node_[data-node-chrome=wrap]]:[border:2px_solid_rgb(var(--palette-gray-700-rgb)/100%)]`,
442:  String.raw`light:[&_.react-flow\_\_node_[data-node-chrome=wrap]]:[border:2px_solid_rgb(var(--palette-white-rgb)/100%)]`,
488:  "light:[--louis-color-node-chip-surface:var(--palette-gray-000)]",
489:  "light:[--louis-color-node-chip-surface-hover:var(--palette-gray-025)]",
490:  "[--node-chrome-btn-bg:var(--louis-color-node-chip-surface)]",
492:  CANVAS_LIGHT_MENU_SURFACE,
517:  "dark:[--louis-color-node-chip-surface:var(--palette-gray-700)]",
518:  "dark:[--louis-color-node-chip-surface-hover:var(--palette-gray-600)]",
530:  "light:[--canvas-dot:rgb(var(--palette-gray-600-rgb)/28%)]",
```

`node-canvas-v2/canvasMenuSurface.ts`

```
14:export const CANVAS_LIGHT_MENU_SURFACE =
15:  "light:[--louis-color-bg-menu:var(--palette-white)]";
```

## Decision

### 1. 라이트 투명 잉크는 LOUIS 를 제품에 맞춘다

- **원시 사다리를 하나 더한다 — `primitive.color.static-pure-black-alpha.{04…96}`.** 바탕이 `static/black`
  (`#000000`)이고 계단은 [DS-D-0026](DS-D-0026-alpha-scale.md) 의 16단 그대로다. 기존 `static-black-alpha` 는
  2026-09-04 부터 `#171b22` 바탕이라(커밋 `dd644b8c`) 그 바탕을 다시 순검정으로 되돌리면 이 결정이 옮기지 않는
  시맨틱 스물넷(`stroke-hairline` · `dim-modal` · `accent-secondary` 등)이 함께 움직인다. 그래서 바꾸지 않고 옆에 세운다.
- **제품의 `--gray-000-rgb` 를 비추는 시맨틱만 옮긴다.**
  - `color/gray/000-alpha/{04…96}` 라이트 → `static-pure-black-alpha/*`. 이름 그대로 「`gray-000` 의 N%」이고
    `color/gray/000` 라이트가 이미 `static/black` 이다 — 이제 이름과 값이 맞는다.
  - `color/scrollbar/thumb` · `thumb-hover` 라이트 → `static-pure-black-alpha/20` · `/32`(globals.css 768 · 769).
- **다크는 바꾸지 않는다.** 제품 다크 잉크가 `palette-gray-000`(250)이고 `static-white-alpha` 가 이미 `#fafafa`
  바탕이다. 그래서 「다크에서 순백」 사다리는 만들지 않는다 — [DS-D-0031](DS-D-0031-no-theme-branch-on-adaptive-ramp.md)
  §3 이 적었던 「다크 끝이 이름과 다르다」는 `dd644b8c` 에서 이미 풀렸고, 이 결정으로 라이트 끝도 풀린다.
  제품의 `--palette-white-rgb`(255) 알파는 다른 축이라 이 결정 밖이다.
- **LOUIS 가 소유하고 제품이 그대로 읽는 시맨틱은 옮기지 않는다.** `stroke-hairline`(제품 74곳) ·
  `accent-secondary`(14) · `dim-modal`(12) · `accent-ghost-hover` · `landing-*` 처럼 제품이
  `var(--louis-color-*)` 로 읽는 토큰은 제품 화면도 `#171b22` 바탕으로 그린다. 이것을 옮기면 제품과 갈라진다.

### 2. 캔버스 전용 톤은 캔버스 시맨틱 토큰으로 세운다

| 토큰 | 라이트 | 다크 | 제품 근거 |
| --- | --- | --- | --- |
| `color-canvas-menu-surface`(신설) | `static/white` | `palette-gray/900` | `canvasMenuSurface.ts:14-15` · `index.tsx:492`. 다크는 덮지 않으므로 `bg-menu` 다크와 같은 칸 |
| `color-node-card-stroke`(신설) | `static/white` | `palette-gray/700` | `index.tsx:441-442` |
| `color-canvas-chip-surface` · `-hover`(있음) | `palette-gray/000` · `025` | `palette-gray/700` · `600` | `index.tsx:488-489` · `517-518` |
| `color/node/chrome-btn-bg`(값 갱신) | `palette-gray/050` → `palette-gray/000` | `palette-gray/600` → `palette-gray/700` | `index.tsx:490` 이 알약 토큰을 읽고, 그 토큰을 캔버스 셸이 488 · 517 로 덮는다 |
| `color-canvas-dot`(값 갱신) | `static-black-alpha/12` → `palette-gray-600-alpha/28`(원시 신설) | 그대로 | `index.tsx:530` |
| `color/app/page-bg`(값 갱신) | `palette-gray/100` → `palette-gray/025` | 그대로 | `globals.css:804` |

**`bg-raised` 로 읽지 않는다.** 캔버스 메뉴 면은 지금 `bg-raised` 와 값이 두 테마 모두 같지만, 근거가 다르다 — 캔버스
면은 「카드보다 한 칸 밝다」이고 `bg-raised` 는 앱의 떠 있는 면이다. 둘 중 하나가 움직이면 다른 하나는 따라가면
안 된다. [DS-D-0029](DS-D-0029-token-names-must-be-true.md) 의 「이름은 참이어야 한다」를 따른다.

**레시피는 범위 규칙으로 읽는다.** 제품은 캔버스 셸이 `--louis-color-bg-menu` · `--louis-color-node-chip-surface` 를
덮는다. LOUIS 는 토큰을 다시 선언하지 않고 **컴포넌트마다** 캔버스 범위에서 새 토큰을 읽는다.

| 레시피 | 캔버스 범위 | 바뀌는 선언 |
| --- | --- | --- |
| `node-shell.css` 카드 | 범위 없음 — 노드 셸은 캔버스 밖에 서지 않는다 | `border-color` → `node-card-stroke` |
| `node-chip.css` | `.louis-node-shell` 안 · `[data-louis-scope="canvas"]` 안 | 면 → `canvas-chip-surface`, 호버 → `-hover` |
| `floating-shell.css` 셸 · 알약 트리거 | `[data-louis-scope="canvas"]` 안 또는 그 요소 자신 | 면 색 → `canvas-menu-surface`(알파 72% · 호버 88% 는 그대로) |
| `menu-popover.css` `.louis-popover` | 같은 둘 | 면 → `canvas-menu-surface` |

범위 속성을 「요소 자신」에도 받는 이유는 `body` 로 포털되는 캔버스 팝오버 때문이다 — 제품도 그 둘
(`YoutubeSchedulePickers` · `ProjectVideosPopover`)에 같은 줄을 따로 붙인다. 선택자는 `:where()` 로 특이도를 올리지
않고 기본 규칙 뒤에 놓여 순서로 이기며, forced-colors 블록보다 앞에 둔다.

## Alternatives

- **제품을 `#171b22` 바탕으로 옮긴다**(감사의 안 나). 제품 `rgb(var(--gray-000-rgb) / N%)` 약 1,000곳의 라이트 잉크가
  함께 움직이고 제품 소유의 반전 램프(`--gray-*`)를 건드린다. 소유자가 LOUIS 쪽을 골랐다.
- **`static-black-alpha` 의 바탕을 순검정으로 되돌린다.** 이 결정이 옮기지 않는 시맨틱 스물넷(`stroke-hairline` · `dim-modal` 등)이
  함께 움직이고, 그중 대부분은 제품이 LOUIS 값으로 그리는 자리라 제품과 갈라진다.
- **캔버스 범위에서 토큰을 다시 선언한다**(`[data-louis-scope="canvas"] { --louis-color-bg-menu: … }`). 제품과 같은
  모양이고 한 줄로 끝나지만, 캔버스 안에서 테마를 다시 거는 스코프가 생기면 바깥 테마의 값을 물려받는다
  ([DS-D-0068](DS-D-0068-hairline-recipe-per-theme-scope.md) 과 같은 함정). 컴포넌트마다 새 토큰을 읽게 했다.
- **`bg-raised` 를 캔버스 메뉴 면으로 쓴다.** 위 Decision 2 의 이유로 택하지 않았다.

## Consequences

- `check-token-diff` 가 breaking 을 낸다 — additive 21(원시 17 · 시맨틱 두 토큰의 두 모드) · value 22(`gray/000-alpha` 라이트
  16 · `scrollbar` 2 · `canvas-dot` · `app/page-bg` · `node/chrome-btn-bg` 두 모드). 의도된 변경이며 baseline 을 옮겨 잠갔다.
- LOUIS CSS 가 `color/gray/000-alpha/*` 를 읽는 곳은 없다 — 이 축의 변화는 Figma 결합과 제품 대조에만 닿는다.
  Segmented Code Input 의 Figma 칸 다섯(`color/gray/000-alpha/04 · 08 · 12 · 28 · 88`)은 라이트에서 순검정 바탕이 된다.
- **Loading Word 의 잉크는 이번에 옮기지 못했다.** 제품은 `rgb(var(--gray-000-rgb)/NN%)`
  (`components/ui/LoadingWord.tsx:8`)이고 레시피는 `fg-primary`(라이트 `#171b22`)다. 맞는 토큰은 `color-gray-000` 인데
  `build-css` 의 원시 소비 검사 정규식이 `color-gray-` 를 원시 계열로 막는다(그 계열은 이미 `palette-gray` 로 옮겨
  갔으므로 정규식이 낡았다). 검사를 고치는 것은 이 결정의 범위 밖이라 후속으로 남긴다.
- 보드의 묶이지 않은 칠 가운데 `000000` + 알파 15단계와 `ffffffb8`(캔버스 툴바 · 줌 트리거)는 Figma 변수를 밀고
  보드를 다시 지으면 결합 대상이 생긴다. 결합 자체는 이 저장소의 변경이 아니라 Figma 회차의 일이다.

## Rollout and verification

1. 토큰 소스(`packages/tokens/src/klipse.tokens.json`)를 고치고 생성물을 다시 냈다. Figma 변수 적용 코드
   `figma/apply-variables.*.js` 전량과 바뀐 변수 40개만 담은 `figma/apply-variables.only.{1,2}.js` 를 다시 만들었다.
2. Figma 반영(변수 러너 · 부품 러너)은 별도 회차다. 바뀔 것: 변수 — `Klipse Primitive` 에
   `color/static-pure-black-alpha/*` 16 · `color/palette-gray-600-alpha/28`, `Klipse Semantic Color` 에
   `color/canvas-menu-surface` · `color/node-card-stroke` 신설과 `color/gray/000-alpha/*` · `color/scrollbar/*` ·
   `color/canvas-dot` · `color/app/page-bg` · `color/node/chrome-btn-bg` 갱신. 부품 — `NodeShell` Card 테두리,
   `NodeChip` · `NodeComposer` 칩 면, `NodeChromeButton` 면, `FloatingShell` · `PillTrigger` · `Menu` 의 캔버스 판.
3. 검증: `pnpm build` · `pnpm check` · `pnpm verify:ci` · 토큰 · CSS 시험.

## Rollback

토큰 소스에서 `static-pure-black-alpha` · `palette-gray-600-alpha` 원시와 `canvas-menu-surface` · `node-card-stroke`
시맨틱을 지우고, 갱신한 다섯 시맨틱(`gray/000-alpha/*` · `scrollbar/*` · `canvas-dot` · `app/page-bg` ·
`node/chrome-btn-bg`)의 별칭을 위 표의 「이 결정 전」 값으로 되돌린 뒤 재생성한다. CSS 의 캔버스 범위 규칙 넷과
`node-shell.css` 의 테두리 한 줄을 되돌리고, baseline 을 이 결정 전 스냅샷으로 되돌린다. Figma 변수를 이미 밀었다면
같은 `--only` 목록으로 옛 값을 다시 민다.
