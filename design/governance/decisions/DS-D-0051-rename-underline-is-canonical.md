---
id: decision-rename-underline-is-canonical
status: experimental
authority: normative
---

# DS-D-0051 이름변경 상자는 밑줄형이다 — 소유자가 2 대 2 를 갈랐다

- Status: accepted (2026-09-03)
- Date: 2026-09-03
- Owners: design system maintainer (판정은 제품 소유자)
- Affects: `component-project-card`, `decision-renaming-is-a-card-state`,
  `decision-no-duplicate-role-tokens`

## Context

[DS-D-0050](DS-D-0050-renaming-is-a-card-state.md)이 두 가지를 **열어 둔 채** 닫혔다.

- **밑줄 크롬 축.** 제품 네 벌이 2 대 2 로 갈려 있는데, 어느 쪽이 정본인지는
  「제품 픽셀을 움직일 수 있는 사람」만 고를 수 있다.
- **반경 8 의 소비처가 없다.** 정본이 `radius-control-sm`(8)을 쓰는데 네 벌이 2 · 2 · 0 · 0 이다.

두 벌을 나란히 놓고 물었고 **소유자가 「밑줄형으로 통일」이라고 답했다.** 이 문서는 그 판정을
LOUIS·Figma·계약에 옮긴 기록이다.

### 실측 — 앵커 `5a67d692` 에서 네 벌을 다시 읽었다

DS-D-0050 의 실측은 앵커 `ae8fd627` 기준이고, 그 사이 제품이 회색 램프를 000·900 양 끝 고정으로
재보정하며 앵커를 옮겼다(`5a67d692` = 「LOUIS 핀을 3ec5966 로 올린다」). **선 색이 함께 움직였을
수 있으므로 다시 쟀다.**

| 벌 | 정본 채택 | 반경 | 밑줄 | 아래 여백 | 초점 표시 |
| --- | --- | ---: | --- | ---: | --- |
| 앱 홈 `appHomeSceneStyles.ts:341` | `"louis-project-card-rename",` | **2** (`:344`) | 없음 | 0 | 1px 아웃라인 + 2px 띄움 (`:345`·`:346`) |
| 캔버스 홈 `NodeCanvasHomeScene.tsx:409` | `"louis-project-card-rename",` | **2** (`:405`) | 없음 | 0 | 같음 (`:406`·`:407`) |
| 하이라이트 허브 `highlightSceneStyles.ts:1040` | **얹지 않는다** (`:1037`) | 0 | `:1046` | 2 (`:1049`) | 없음 |
| 비디오 에디터 허브 `VideoEditScene.tsx:402` | 얹지 않는다 | 0 | `:404` | 2 (`:406`) | 없음 |

낱말 그대로의 선언 — `git show 5a67d692:<경로>` 로 재확인한다.

```
highlightSceneStyles.ts:1046     "[border-bottom:1px_solid_var(--palette-gray-400)]",
highlightSceneStyles.ts:1049     "[padding:0_0_2px]",
highlightSceneStyles.ts:1052     "[html[data-theme=dark]_&]:[border-bottom-color:var(--gray-500)]",
VideoEditScene.tsx:405           "[border-bottom:1px_solid_var(--palette-gray-400)]",
VideoEditScene.tsx:407           "pt-0 pr-0 pb-1 pl-0",
VideoEditScene.tsx:410           "[html[data-theme=dark]_&]:[border-bottom-color:var(--gray-500)]",
appHomeSceneStyles.ts:344        "[border-radius:2px]",
NodeCanvasHomeScene.tsx:410      "[outline:none] rounded-2",
```

`VideoEditScene.tsx:407` 의 `pb-1` 은 제품의 `--spacing: 2px` 격자에서 **2px** 다 —
`highlightSceneStyles.ts:1049` 의 `padding: 0 0 2px` 와 같은 값이고, 그래서 두 벌이 갈리지 않는다.
`VideoEditScene.tsx` 는 단축을 롱핸드로 푼 것만 다르며, 그 사유가 그 파일 주석에 적혀 있다 —
「`border: none` 뒤의 `border-bottom` 단축을 롱핸드로 풀어 정렬 의존을 없앤다」.

**값은 움직이지 않았다.** 밑줄 색은 여전히 라이트 `palette-gray-400` · 다크 `gray-500` 이고,
그 둘은 LOUIS 원시값으로 각각 `palette-gray/400`(139 142 147) · `palette-gray/500`(114 117 123)
이다. 제품이 그 이름을 LOUIS 에서 그대로 물고 있기 때문이다 — `globals.css:33` 이
`--palette-gray-400: var(--louis-color-palette-gray-400);` 이고, 다크 스코프의 `globals.css:682`
가 `--gray-500: var(--palette-gray-500);` 다. **채널 단위로 같다.**

## Decision

1. **축을 열지 않는다. 기본값을 바꾼다.** `.louis-project-card-rename` 의 계약이 `border: 0` 에서
   `border-block-end: 1px` 로 간다.
2. **정본 반경은 0 이다.** 8 을 없앤다.
3. **선 색에 semantic 토큰 `color-stroke-underline` 을 새로 연다.** 라이트
   `palette-gray/400` · 다크 `palette-gray/500`.
4. **글자와 선 사이 2px 에 `space-underline-gap` 을 연다.**
5. **초점 표시는 남긴다.** 두께를 `border-width-hairline`(0.5)에서 `border-width-ring`(2)로 올린다.
6. **Figma 의 밑줄은 stroke 가 아니라 높이 1 의 `Underline` 부품으로 그린다.**

### 왜 축이 아니라 기본값인가

[DS-D-0049](DS-D-0049-label-placement-is-an-axis.md)가 축을 연 이유는 **두 형태가 모두 살아남기
때문**이었다 — 제품에 플로팅 라벨과 위쪽 라벨이 둘 다 있고, 둘 중 하나를 지우는 판정이 없었다.

여기는 반대다. 소유자의 낱말이 「**통일**」이다. 네 화면이 전부 밑줄로 가면 `bare` 를 고르는
소비처가 하나도 남지 않고, **옵션이 하나뿐인 축은 축이 아니라 재고다**
([DS-D-0030](DS-D-0030-no-duplicate-role-tokens.md)의 「쓰지 않는 계단은 재고」가 축에도 그대로
걸린다). 축으로 열면 variant 가 3 → 6 으로 늘고 그 절반이 아무도 안 그리는 그림이 된다.

### 왜 반경 8 을 없애는가

DS-D-0050 이 8 을 남긴 근거는 [DS-D-0025](DS-D-0025-figma-as-projection.md)였다 — 「Figma 는
코드를 비추고, 코드와 제품의 어긋남은 제품 픽셀을 움직일 수 있는 사람의 판정이다」. **그 판정이
이번에 왔고, 답이 밑줄이다.** 그러면 8 은 옮길 자리가 없어지는 것이 아니라 **틀린 값이 된다** —
반경을 주면 밑줄 끝이 말려 올라간다. 그 문장은 우리가 지어낸 것이 아니라 하이라이트 허브가
정본을 얹지 않은 사유로 제품 주석에 낱말 그대로 적혀 있다.

그리고 8 은 이미 **어느 벌도 쓰지 않는 값**이었다(2 · 2 · 0 · 0). 이 컴포넌트의 머리말이
「값은 DS 가 정한 것이 아니라 제품 정본을 옮긴 것」이라고 적으므로, 소비처 없는 8 은 그 원칙과
어긋난 채 서 있던 자리다.

### 왜 기존 stroke 토큰을 쓰지 않는가

| 토큰 | 라이트 | 다크 | 이 자리와 |
| --- | --- | --- | --- |
| `stroke-default` | 165 168 173 | 89 92 99 | 라이트·다크 둘 다 다르다 |
| `stroke-strong` | 114 117 123 | 114 117 123 | 다크만 같다 |
| `stroke-subtle` | `palette-gray/200` | `palette-gray/700` | 둘 다 다르다 |
| `stroke-hairline` | 검정 8% | 흰색 8% | 알파라 종류가 다르다 |

**값이 같다는 이유로 이름을 빌리지 않는다**(DS-D-0030). `stroke-strong` 은 다크에서만 우연히
같고, 그 우연에 기대면 `stroke-strong` 의 라이트를 누가 옮기는 순간 밑줄이 함께 움직인다.

이름은 역할을 말해야 한다. 이 선의 역할은 **경계가 아니라 표식**이다 — 담는 것이 없으므로
물러설 이유가 없고, 「여기에 글을 쓸 수 있다」를 말하는 **유일한** 표시라서 보여야 한다. 그래서
라이트에서 `stroke-default` 보다 두 칸 진하다. `underline` 은 그 역할의 이름이다 — 글 아래에
긋는 줄이고, `stroke-control`·`stroke-tooltip` 이 이미 역할로 이름을 받은 자리와 같은 종류다.

### 왜 초점 표시를 남기는가

**소유자가 고른 것은 시각이지 키보드가 아니다.** 제품의 밑줄 두 벌에 초점 표시가 없는 것은
「필요 없다」의 결과가 아니라 **호출부의 사정**이다 — 네 화면 모두 이름변경을 켜자마자
`focus()` 를 넘기고 `onBlur` 에서 확정하므로, 그 화면에서는 상자가 있는 순간과 초점이 있는 순간이
항상 같이 온다. 그 우연이 없는 소비처에서는 두 상태가 구별되지 않는다.

두께를 2 로 올리는 것은 **이번 변경이 만든 문제**다. 0.5px 링은 상자 2px 바깥에 놓인 또 하나의
가는 선이 되어, 밑줄과 나란히 서면 초점 여부가 「선이 하나인가 둘인가」로 읽힌다. 2 는 같은
파일의 `.louis-project-card-more:focus-visible` 과 `base.css` 의 `.louis-focus-ring` 이 이미
쓰는 값이므로, 이 줄은 새 표현이 아니라 **공용 표현으로 돌아간 것**이다.

**대비를 근거로 든 것이 아니다.** 이 문단이 묻는 것은 키보드로 지금 어디에 있는지가 보이느냐다.

### 왜 Figma 의 선이 stroke 가 아닌가

Figma 에서 한 변에만 stroke 를 두면 `node.strokeWeight` 가 `figma.mixed` 가 된다. 되읽기
emitter 는 `typeof node.strokeWeight === "number"` 인 노드만 담으므로
(`scripts/figma-readback-emit.mjs:447`) **그 선은 스냅숏에 아무 값도 남기지 않는다** — 그려져
있어도 어느 게이트도 보지 못한다.

높이 1 의 면(`Underline` 부품)으로 그리면 `parts` 로 그대로 잡히고, root 의 헤어라인 계약
(`strokes.self = ["0.5|INSIDE"]`, `strokeWeight: [0.5]`)도 건드리지 않는다. DS-D-0050 이 초점
링을 stroke 로 그리지 않기로 한 것과 **같은 자리에서 같은 이유**다.

## Alternatives

- **`Chrome: bare | underline` 축을 연다.** DS-D-0050 이 열어 두었던 형태다. 버리는 이유는 위
  §「축이 아니라 기본값」 그대로다 — 소유자가 통일이라고 답한 순간 `bare` 의 소비처가 0 이 된다.
- **반경 8 을 남기고 밑줄만 켠다.** 밑줄 끝이 말려 올라간다. 제품 두 벌이 정본을 얹지 않은 사유가
  바로 이것이라 남기면 같은 비채택이 다시 생긴다.
- **`stroke-strong` 을 빌린다.** 다크만 맞고 라이트가 25/255 밝다. 값이 같다는 이유로 이름을
  빌리는 것을 DS-D-0030 이 금지한다.
- **초점 링을 없애 제품 밑줄 두 벌과 완전히 같게 만든다.** 소유자 판정의 범위를 넘는다. 시각을
  고르는 것과 키보드 표시를 지우는 것은 다른 판정이고, 후자는 요청되지 않았다.
- **Figma 에 `strokeBottomWeight` 로 그린다.** 값이 되읽기에서 사라져 게이트가 눈을 감는다.

## Consequences

- 계약값이 `renameRadius` 하나에서 셋으로 는다 — `renameRadius: 0` ·
  `renameUnderlineWidth: 1` · `renameUnderlineGap: 2`.
- 토큰이 셋 늘어난다(`color-stroke-underline` 라이트·다크, `space-underline-gap`).
  `pnpm check-token-diff` 판정은 **additive 3 · breaking 0** 이다.
- 이름변경 상자의 높이가 3px 는다(여백 2 + 선 1). **카드의 다른 값은 움직이지 않는다** —
  제목 띠는 `min-block-size: 30%` 의 하한이 이기는 구간에 있어(측정 폭 360 에서 내용 93 < 띠
  107.7) 3px 가 하한 안에서 흡수된다. DS-D-0050 이 「기하가 움직이지 않았다」로 확인한 자리가
  이번에도 같은 이유로 유지된다.
- **제품 두 벌이 밑줄을 직접 그리던 사유가 사라진다.** 앱 홈·캔버스 홈 둘은 반대로 정본을
  따라오면 밑줄이 생긴다. 그 이동은 제품 저장소의 작업이라 여기서 하지 않고 절차서로 넘긴다.

## Rollout and verification

세 곳이 함께 들어갔다([DS-D-0028](DS-D-0028-three-in-one-change.md)).

1. **LOUIS** — `packages/tokens/src/klipse.tokens.json` 에 토큰 셋,
   `packages/css/src/component/project-card.css` 의 `.louis-project-card-rename` 이 밑줄·반경 0·
   여백 2 로, `:focus-visible` 링이 2 로. React 표면은 바뀌지 않는다 — 이 변경은 전부 CSS 계약이다.
2. **Figma** — `ProjectCard` 의 `State=Renaming` 안 `Rename` 프레임을 반경 0 · 세로 auto-layout ·
   itemSpacing 2 로 바꾸고 그 아래 높이 1 의 `Underline` 을 세운다. 면은
   `color/stroke-underline` 변수를 문다.
3. **계약** — `figma/components.measured.json` 의 세 값과 근거,
   `scripts/figma-readback-emit.mjs` 채취 명세의 `Rename`·`Underline`,
   `scripts/verify-figma-parity.mjs` 의 `parts` 세 줄, 브라우저 테스트 한 건.

### 이 결정이 닫지 않은 것

- **제품 네 벌의 이동.** 절차서를 남겼다. 앱 홈·캔버스 홈은 정본을 이미 얹고 있어
  덮어쓰기 세 줄을 걷어내면 끝이고, 하이라이트·비디오 에디터 허브는 직접 그린 선언을 정본 채택으로
  바꾸는 일이라 크기가 다르다.
- **`forced-colors` 에서의 링.** `base.css` 의 `.louis-focus-ring` 만 시스템 색으로 비운다.
  이 파일의 두 링(`-more`·`-rename`)은 둘 다 그 분기가 없고, 그것은 이 결정이 부른 것이 아니라
  이 컴포넌트가 공용 클래스를 안 쓰는 데서 오는 자리다. 함께 고치지 않았다.
