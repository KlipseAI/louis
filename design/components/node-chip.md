---
id: node-chip
status: experimental
authority: normative
summary: 노드 카드의 메타 값을 알약 하나로 보여 주고 눌러서 바꿉니다.
---

# Node Chip

노드 카드의 메타 값 — 모델·화면비·길이·해상도·볼륨·사운드 — 을 알약 하나로 보여 주고, 눌러서
드롭다운을 연다.

**제품 정본은 `--node-chrome-btn-*` 계열이다** — 높이 32 · 좌우 패딩 10 · 반경 12 · 사이 간격 4,
다크 면 `palette-gray-600`, 라이트 면 `palette-gray-100`(`globals.css:536-542` · 라이트 덮어쓰기 `:568`).
그 값을 그대로 채택했다. **바꾼 것은 경계 하나였고, 제품이 따라왔다** — 제품은 한때
`--node-chrome-btn-border`로 진짜 `border`(다크 gray-700 · 라이트 gray-150 0.5px)를 그렸고 LOUIS는
generic inset 헤어라인을 택했다([DS-D-0023](../governance/decisions/DS-D-0023-hairline-inset.md)).
배포본 `74a7303b`에는 **그 토큰이 없다** — 소비처가 `[box-shadow:var(--louis-hairline-inset)]`을
직접 쓰고(`ImageNode.tsx:645`), 이름은 제품 게이트의 legacy 목록에 올라 되살리면 실패한다. 두 쪽이
같은 해를 쓰므로 이 축은 더 이상 편차가 아니다. LOUIS 토큰에 `-border` 대응 항목이 없는 것은 그대로다.

**한 벌이 아니라 네 벌이었다.** 메타 알약을 그리는 파일은 `nodes/VideoNode.tsx` ·
`nodes/ImageNode.tsx` · `nodes/BgmNode.tsx` · `nodes/TtsNode.tsx` 넷이고, 채택 이전 커밋에서
`--node-chrome-btn-*`을 참조하는 횟수는 각각 20 · 20 · 15 · 9다. 토큰만 공유하고 레시피는
파일마다 복붙돼 있었다. 정본 CSS 머리 주석이 세는 "네 벌"이 이 넷이며, 이 문서도 같은 수를 센다.

**같은 토큰을 쓰지만 알약이 아닌 자리가 둘 더 있다.** `nodes/InstagramNode.tsx`(8회)는 노드
툴바 버튼이고 `components/NodeHeaderActions.tsx`(4회)는 헤더의 아이콘 정사각이다. 둘 다 이
컴포넌트의 소비처가 아니지만, `--node-chrome-btn-*`을 지울 수 없게 붙잡는 쪽에는 들어간다
(아래 Known deviations).

**badge와 다른 컴포넌트다.** [Badge](badge.md)는 읽기만 하는 정적 라벨이라 상태 축이 아예 없다.
node chip은 눌러서 드롭다운을 여는 대화형 트리거이고 호버 면·비활성·아이콘 전용 정사각 변형을
갖는다. 그래서 배지 계열 토큰이 아니라 자체 면 토큰(`color-node-chip-surface`)을 쓴다.

## Availability

| Surface       | 상태           | 근거                                                                                                                                                                                            |
| ------------- | -------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Web           | `partial`      | CSS 레시피 `packages/css/src/component/node-chip.css`가 `packages/css/generated/styles.layer.css`로 나가고 제품이 4개 파일 **루트 16자리**에서 소비한다(`__label` 슬롯 2자리는 별도). **React 표면이 없다** — `packages/react/src` 아래 node-chip 디렉터리가 없고 `packages/react/src/index.ts`에 export가 없다. 실브라우저 acceptance test 0건, visual regression 없음 |
| Figma         | `partial`      | NodeChip — variant 축 Shape(default·square) × State(Default·Hover·Disabled) = 6개. 속성: Label TEXT, HasGlyph BOOLEAN, Glyph INSTANCE_SWAP                                                        |
| Documentation | `done`         | 이 문서                                                                                                                                                                                          |
| Maturity      | `experimental` | 규범이 구현보다 늦게 선다 — CSS·토큰·제품 소비가 먼저 있었고 이 문서가 그것을 처음 규범으로 적는다                                                                                              |

## When to use

- 노드 카드의 **메타 툴바**에서 값 하나를 보여 주고, 눌러 그 값을 고르는 드롭다운을 열 때 —
  모델, 화면비, 해상도, 길이, 볼륨, 속도.
- 같은 툴바에서 **아이콘 하나로 켜고 끄는 토글**일 때 — 사운드 on/off. 이때 `data-shape="square"`.
- 값을 보여 주기만 하고 누를 수 없을 때도 같은 알약을 쓴다. 툴바 한 줄에서 눌리는 것과 안 눌리는
  것이 서로 다르게 생기면 어느 것이 눌리는지가 아니라 **어느 것이 고장 났는지**로 읽힌다.

쓰지 않는 자리.

- **상태나 분류를 읽기만 하는 라벨.** 그것은 [Badge](badge.md)다.
- **노드 카드 밖의 일반 버튼.** 그것은 [Button](button.md)·[Icon Button](icon-button.md)이며
  높이 계단과 포커스·hit target 계약이 다르다.
- **반경 999px 필(pill) 토글.** 제품의 사진 태그 칩(`PhotoGrid.tsx`)이 그쪽이고, 파일 주석이
  "반경 12px의 32px 고정 높이 알약"과 모양부터 다르다고 적으며 채택을 거부해 두었다.
- **정적 다이어그램의 노드.** 제품의 시작 안내 파이프라인(`GettingStartedPanel.tsx`)이 그쪽이고,
  역시 "정적 그림"이라며 거부해 두었다. 두 거부는 실수가 아니라 경계선의 정의다.

## API

CSS 레시피만 있다. React 컴포넌트가 없으므로 소비처가 마크업을 직접 쓴다.

```html
<!-- 값 알약 — 눌러서 드롭다운을 연다 -->
<button type="button" class="louis-node-chip">
  <span class="louis-node-chip__label">Kling 2.1</span>
</button>

<!-- 아이콘 전용 정사각 -->
<button type="button" class="louis-node-chip" data-shape="square" aria-label="사운드 끄기">
  <svg class="louis-node-chip__glyph" aria-hidden="true">…</svg>
</button>

<!-- 값만 보여 주는 정적 알약 -->
<span class="louis-node-chip">1:1</span>

<!-- 비활성 -->
<button type="button" class="louis-node-chip" disabled>16:9</button>
```

## Anatomy

1. **Root** — `.louis-node-chip`. 높이·좌우 여백·반경·면·헤어라인·타이포·말줄임을 소유한다.
   `box-sizing: border-box` · `inline-flex` · `flex: none` · `align-items: center` ·
   `justify-content: center`.
2. **Glyph** — `.louis-node-chip__glyph`. 선택. 16px 정사각이고 색이 글자를 따라간다(`inherit`).
3. **Label** — `.louis-node-chip__label`. 선택. `min-inline-size: 0` · `overflow: hidden` ·
   `text-overflow: ellipsis` 세 선언만 갖는다. 루트가 이미 같은 세 선언을 갖고 있으므로, 이
   슬롯은 **알약 안에 두 개 이상의 자식이 설 때** 텍스트 쪽만 줄어들게 하려고 있다.

두 슬롯 다 필수가 아니다. 자식이 하나면 루트의 말줄임이 그대로 동작한다.

## Properties

React prop이 아니라 **DOM 계약**이다. 소비처가 요소와 속성으로 표현한다.

| 것 | 값 | 기본 | 뜻 |
| --- | --- | --- | --- |
| 요소 | `<button>` \| `[role="button"]` \| 그 밖 | — | 호버 면은 **`button`과 `[role="button"]`에만** 붙는다. 값을 보여주기만 하는 알약은 `<span>`으로 두면 정적이 된다 |
| `data-shape` | `square` | 없음(알약) | 폭 = 높이(32px). `inline-size`와 `min-inline-size`를 함께 32px로 고정하고(뒤쪽이 루트의 `min-inline-size: 0`을 덮는다) 좌우 패딩을 0으로 만든다 |
| `disabled` | boolean | — | native. 전경만 죽고 면·헤어라인은 유지된다. 포인터 이벤트와 포커스는 **브라우저가** 막는다 |
| `aria-disabled` | `"true"` | — | `disabled`와 **같은 그림**을 그린다 — 레시피가 바꾸는 것은 전경색과 커서뿐이다. 포커스를 남겨야 할 때 쓰지만, 클릭도 함께 남는다(아래) |

**`disabled`와 `aria-disabled`를 둘 다 받는 이유.** 제품이 자리마다 다르게 쓴다 — `VideoNode`와
`ImageNode`의 알약은 둘을 **함께** 걸고, `BgmNode`의 알약은 native `disabled`만 걸며,
`TtsNode`의 두 알약은 잠금 상태가 없어 아무것도 걸지 않는다. 어느 한쪽만 그리면 나머지 자리가
면은 살아 있는데 글자만 멀쩡한 채로 남는다. 둘을 함께 거는 것이 제품의 다수 관용구이고,
`aria-disabled` 단독인 알약은 **현재 제품에 없다**.

**`aria-disabled` 단독은 클릭을 막지 않는다.** 이관 전 제품 레시피는 비활성 알약에
`pointer-events: none`을 함께 걸었는데(`META_MODEL_DISABLED` · `META_ITEM_CLICKABLE_DISABLED` ·
`META_ICON_BUTTON_DISABLED`), 정본이 그것을 옮기지 않았다. 지금 죽는 것은 전경색·커서와 CSS
호버 면뿐이다. native `disabled`가 함께 걸린 자리는 브라우저가 막아 주므로 차이가 드러나지
않지만, `aria-disabled`만 거는 소비처가 생기면 **눌리는 비활성 알약**이 된다. 옮기지 않은 것은
판단이 아니라 결손이다 — 아래 Known deviations.

**클래스로 비활성을 표현하지 않는다.** 제품은 이관 전 `.metaItemDisabled` 계열 클래스를 썼고,
그 클래스가 `:hover` 선언과 특이도를 다투느라 `!important`를 달고 있었다. 상태를 속성으로 옮기면
그 싸움이 사라진다.

## Hierarchy와 variants

**축이 `data-shape` 하나다.** 알약(기본)과 정사각 둘뿐이다.

일부러 열지 않은 축.

- **크기 축이 없다.** 제품의 이 계열은 전부 32px 한 값이다(`--node-chrome-btn-h`). 두 번째 단이
  실재하지 않는데 이름을 먼저 만들면, 나중에 아무 값이나 그 이름으로 들어온다.
- **톤 축이 없다.** 알약이 의미 색을 갖지 않는다.
- **선택/활성 표현이 없다.** 제품의 반복·보컬 토글이 켜졌을 때도 면과 글자색을 바꾸지 않는다 —
  `BgmNode`의 `TOGGLE_PILL_ON` 상수가 **빈 문자열**이고, 주석이 그 이유를 적어 두었다(상태는
  라벨 텍스트와 `aria-pressed`가 나르며, accent로 칠하면 이 알약만 툴바에서 톤이 튄다).
- **셰브런 슬롯이 없다.** 드롭다운을 여는 알약인데도 그렇다. 제품이 셰브런을 `hidden`으로
  꺼 두었고(`META_CHEVRON`), 안 그리는 것을 DS가 그릴 이유가 없다.

## States

| state | 표현 |
| --- | --- |
| Default | 면 `color-node-chip-surface`, 전경 `color-fg-primary`, inset 헤어라인 |
| Hover | 면 `color-node-chip-surface-hover`, `cursor: pointer`. **전경은 바뀌지 않는다.** `button`/`[role="button"]`이면서 `:disabled`도 `[aria-disabled="true"]`도 아닐 때만 |
| Disabled | 전경 `color-node-chip-fg-disabled`, `cursor: not-allowed`. **면과 헤어라인은 그대로 남는다.** 레시피는 포인터 이벤트를 막지 않는다 — native `disabled`가 함께 걸린 자리만 브라우저가 막는다 |
| Focus | **없다.** 아래 Accessibility와 Known deviations |
| Pressed / Selected | 축이 없다 |

**비활성에서 면을 지우지 않는다.** 알약이 사라지면 툴바 행의 리듬이 깨진다 — 옆 알약들이 밀려
붙고, 잠금 상태가 "비활성"이 아니라 "없어짐"으로 읽힌다.

**비활성 전경이 공용 `color-fg-disabled`가 아니다.** 다크에서 그 값이 알약 면과 **정확히 같은
색**이라(둘 다 `palette-gray-600`) 대비가 1.00:1이 된다 — 생성이 끝난 노드의 메타 툴바가 통째로
보이지 않는다. 제품이 이 버그를 피하려고 고른 `palette-gray-400`(다크 2.27:1)을 칩 전용 토큰으로
승격했다. 이관 전 제품 주석이 그 판단 과정을 남겨 두었다 — 면보다 **밝은 쪽**으로 가서 활성과
같은 방향을 유지하고, 한 톤 아래 `gray-500`은 여전히 흐려서 한 단계 더 올렸다는
것(`nodes/VideoNode.tsx:626-645`).

## Interaction and responsive behavior

- **폭은 내용이 정한다.** `flex: none` · `max-inline-size: 100%`. 좁아지면 라벨이 줄바꿈이 아니라
  **말줄임**으로 줄고 **높이 32px은 유지된다** — 알약이 두 줄이 되면 노드 헤더 행의 높이가 흔들린다.
- **`flex: none`은 소비처가 되돌린다.** 툴바 안에서 어느 알약이 줄어들지는 그 툴바의 계약이지
  알약의 계약이 아니다. 제품은 두 관용구를 쓴다 — 모델 알약의 `[flex:0_1_auto]`(트레일링이 폭을
  지키고 좌측 모델명이 대신 말줄임한다), `BgmNode` 토글의 `shrink`(트레이가 좁아지면 줄어들며
  라벨을 말줄임한다. 줄어들지 못하면 생성 FAB를 밀어낸다).
- **캔버스 줌 보정·위치·드롭다운 앵커는 소비처가 소유한다.** 줌과 무관하게 화면 픽셀을 유지하는
  스케일 보정이 이 레시피에 없다. 드롭다운 자체는 [Menu / Popover](menu-popover.md)이고,
  툴팁은 [Tooltip](tooltip.md)이다.
- `user-select: none`. 캔버스에서 알약을 끌면 노드가 움직여야 하지 텍스트가 선택되면 안 된다.

## Content

- 라벨은 **값 그 자체**다. "1:1"이지 "화면비 1:1"이 아니다. 무엇의 값인지는 알약이 아니라 툴팁과
  드롭다운이 말한다.
- 숫자 값은 소비처가 `tabular-nums`를 얹는다. 슬라이더를 끌 때 자릿수가 바뀌면서 알약 폭이
  흔들리는 것을 막는다 — 제품의 `META_ITEM_VALUE`가 그 자리다.
- 토글의 라벨은 **현재 상태**를 말한다. "반복 켬"/"반복 끔"처럼 켜짐과 꺼짐이 글자로 갈려야 한다.
  이 컴포넌트는 켜짐을 색으로 그리지 않으므로, 라벨이 유일한 시각 신호다.
- 아이콘 전용 정사각에는 라벨이 없다. 그러면 `aria-label`이 **필수**다.

## Accessibility

- **누를 수 있으면 `<button type="button">`으로 쓴다.** `[role="button"]`도 호버 면을 받지만,
  네이티브 버튼이 활성화·포커스·폼 동작·forced-colors를 이미 갖고 있다.
- **아이콘 전용에는 접근 가능한 이름이 필요하다.** `__glyph`는 장식이므로 `aria-hidden`이고,
  이름은 `aria-label`이 준다. 제품의 사운드 토글이 그렇게 한다.
- **토글은 `aria-pressed`를 함께 준다.** 이 컴포넌트가 눌림을 색으로 그리지 않으므로, 보조기술에
  상태를 전하는 것은 `aria-pressed`와 라벨 텍스트뿐이다.
- **포커스 링을 레시피가 그리지 않는다.** LOUIS의 포커스 링은 `.louis-focus-ring` opt-in
  유틸리티이고(`packages/css/src/base.css`), 이 레시피도 제품 소비처 루트 16자리도 그것을 붙이지
  않는다. 지금 보이는 것은 브라우저 기본 outline이다. 아래 Known deviations.
- **hit target이 32×32다.** [Icon Button](icon-button.md)은 `.louis-hit-target`을 스스로 붙여
  시각 32px에서도 히트 영역 44×44를 만드는데, 이 알약은 붙이지 않는다. WCAG 2.2 AA 최소(24px)는
  넘고 [Button](button.md)의 내부 목표 44px에는 미달한다.
- forced-colors에서는 면과 헤어라인이 강제 치환돼 알약 경계가 사라지므로 `currentColor` 1px 실선
  테두리로 되살리고, 비활성 전경을 `GrayText`로 넘긴다.
- reduced-motion에서 전환 시간을 0으로 만든다.

## Specification

| 축 | 값 | 토큰 |
| --- | ---: | --- |
| 높이 | 32px | `layout-node-chip-height` |
| 좌우 여백 | 10px | `layout-node-chip-inset` |
| 세로 여백 | 0 | **리터럴** — 높이를 토큰이 고정하므로 세로 여백은 남는 값이다 |
| 박스 모델 | `border-box` | **리터럴** — reset이 opt-in이라 스스로 선언한다. 세로 여백도 테두리도 0이라 기본 상태에서는 차이가 없지만, forced-colors에서 1px 테두리가 붙을 때 알약이 34px로 커지는 것을 이것이 막는다 |
| 슬롯 간격 | 4px | `space-control-xs` |
| 반경 | 12px | `radius-node-chip` |
| 헤어라인 (inset) | 0.5px | `hairline-inset` (= `border-width-hairline` + `color-stroke-hairline`) |
| 테두리 | 0 | **리터럴** — 경계를 border가 아니라 inset 헤어라인으로 그린다. reset은 opt-in이라 `<button>`의 UA 기본 테두리를 스스로 지운다 |
| 면 | light `palette-gray-100` / dark `palette-gray-600` | `color-node-chip-surface` |
| 호버 면 | light `palette-gray-150` / dark `palette-gray-500` | `color-node-chip-surface-hover` |
| 전경 | light `#171b22` / dark `#fafafa` | `color-fg-primary` |
| 비활성 전경 | light `palette-gray-500` / dark `palette-gray-400` | `color-node-chip-fg-disabled` |
| 타이포 | 12 / 1.5 / -0.12px / 400 | `typography-caption-regular` |
| 글리프 | 16px | `icon-size-sm` |
| 정사각 폭 | 32px | `layout-node-chip-height` (높이와 같은 토큰). `inline-size`와 `min-inline-size`에 함께 건다 — 뒤쪽이 루트의 `min-inline-size: 0`을 덮는다 |
| 전환 대상 | `background`, `color` | — |
| 전환 | 160ms · `cubic-bezier(0.25, 0.1, 0.25, 1)` | `motion-control-hover-duration` · `motion-control-hover-timing-function` |
| reduced-motion 전환 | 0ms | `motion-reduced-duration` |
| forced-colors 테두리 | 1px | `border-width-default` |

**이 기하를 고른 이유.** 제품 정본의 32/10/12/4를 그대로 채택했다 — 캔버스에서 이 알약은 이미
네 노드 툴바의 리듬을 정하고 있고, 값을 바꾸면 채택이 아니라 리디자인이 된다.

**좌우 10px이 전용 토큰인 이유.** `space-control-*` 계단은 4 / 8 / 12 / 16이고 **10은 그 위에
없다.** 8로 내리거나 12로 올리면 알약 폭이 자리마다 4px씩 움직인다. 제품 값을 지키기로 한 이상
새 토큰이 필요했다.

**신설 치수 토큰은 셋이다.** 계단 밖의 값은 `layout-node-chip-inset`(10) 하나뿐이지만,
`layout-node-chip-height`(32)와 `radius-node-chip`(12)도 기존 `layout-control-height-md` ·
`radius-control`과 **값이 같은데** 따로 섰다. 그 분리의 이유가 어디에도 적혀 있지 않다 — 아래
Known deviations.

**나머지는 신설이 아니다.** 간격 4px과 글리프 16px은 기존 `space-control-xs`·`icon-size-sm`을
그대로 쓴다.

## Effects

- **경계는 그림자다.** `box-shadow: var(--louis-hairline-inset)` — 0.5px inset. `border`를 쓰면
  `border-box` 안쪽이 0.5px 줄고 브라우저가 DPR 1에서 사용값을 1px로 올리므로 알약의 내부 폭이
  화면마다 달라진다. inset 그림자는 레이아웃 박스를 건드리지 않는다
  ([DS-D-0023](../governance/decisions/DS-D-0023-hairline-inset.md)). Figma는 INNER_SHADOW로 대응한다.
- **elevation이 없다.** 알약은 노드 카드 표면 위에 얹힌 것이 아니라 그 표면의 일부다. 그림자를
  주면 카드 안에서 떠 보인다.
- **호버는 면만 바꾼다.** 전환 대상에 `color`가 함께 있는 것은 비활성으로 넘어갈 때의 글자색
  변화를 위한 것이지, 호버에서 글자색이 바뀌기 때문이 아니다.

## Implementation

- 정본 CSS는 `packages/css/src/component/node-chip.css`이고 `packages/css/generated/styles.layer.css`의
  `louis.component` 레이어로 나간다. 소비처는 `styles.layer.css`를 쓴다.
- 토큰 소스는 `packages/tokens/src/klipse.tokens.json`, 투영은 `packages/css/generated/tokens.css`다.
  이 컴포넌트가 세운 토큰은 여섯이다 — `layout-node-chip-height` · `layout-node-chip-inset` ·
  `radius-node-chip` · `color-node-chip-surface` · `color-node-chip-surface-hover` ·
  `color-node-chip-fg-disabled`.
- **호버 선택자에 `:where()`를 쓴다.** `:where(button, [role="button"])`과
  `:where(:not(:disabled):not([aria-disabled="true"]))`는 스스로 특이도를 올리지 않는다. 다만
  선택자 끝의 `:hover`가 클래스 자리를 하나 더 올리므로 규칙 전체는 **0-2-0**이다
  (`:disabled` / `[aria-disabled="true"]` 규칙도 같은 이유로 0-2-0). 소비처의 Tailwind
  유틸리티가 이기는 것은 특이도가 아니라 **레이어 순서** 때문이다 — `utilities`가
  `louis.component`보다 뒤에 온다. `:where()`가 하는 일은 조건 넷(요소 둘 · 비활성 둘)을 더
  얹고도 특이도를 0-2-0에 묶어 두는 것이고, 그래서 같은 레이어 안의 다른 규칙과 특이도로
  다투지 않는다.
- **소비처가 `white-space: nowrap`에 `!`를 붙여야 하는 자리가 있다.** 랜딩 워크스루의
  `[data-page-root] :where(… button …) { text-wrap: balance }`가 레이어 밖이라 레이어 안의
  정본을 이긴다. `BgmNode`의 토글 알약이 그 자리다.
- 정적 알약과 트리거를 **요소 종류로** 가른다. 클래스를 나누지 않는 이유는 툴바 한 줄이 같은
  기하를 유지해야 하기 때문이고, 실제로 갈리는 것은 호버 면 하나뿐이다.

## Known deviations

- **React 표면이 없다.** CSS 레시피만 있고 `packages/react/src/index.ts`에 export가 없다. 그래서
  마크업 계약(요소 선택, `aria-label`, `aria-pressed`, 슬롯 클래스)을 강제하는 것이 없고 이 문서
  뿐이다. 실브라우저 acceptance test도 0건이다.
- **`figma/components.measured.json`에 실측 스펙이 없다.**
  [DS-D-0025](../governance/decisions/DS-D-0025-figma-as-projection.md)가 `alert`·`node-chip`·
  `switch`·`table`·`tabs` 다섯을 그렇게 적어 두었다. 그래서 아래 Acceptance tests의 1번이 다른
  컴포넌트처럼 measured 대조가 아니라 **토큰 대조**다.
- **포커스 링이 없다.** `.louis-focus-ring`은 opt-in이고 레시피도 제품 루트 16자리도 붙이지
  않았다.
  드롭다운을 여는 트리거가 키보드에서 어디 있는지 DS가 그리지 않는다는 뜻이다. 붙이는 것은
  한 줄이지만, 32px 알약에 `outline-offset: 2px` 링이 붙으면 툴바 행 높이 안에서 잘리는지
  확인해야 한다 — **확인되지 않았다.**
- **hit target이 44px에 미달한다.** 32×32다. `.louis-hit-target`을 붙이면 44×44 의사 요소가
  중앙에 깔리는데, 알약들이 4px 간격으로 늘어선 툴바에서 그 영역이 서로 겹친다. 겹칠 때 어느
  알약이 눌리는지는 **확인되지 않았다.** 그래서 붙이지 않았다.
- **다크 호버 면에서만 본문 대비가 AA에 조금 못 미친다.** `color-fg-primary`(#fafafa) 대 알약
  면(`palette-gray-600` `#585c63`)이 **6.44:1**, 호버 면(`palette-gray-500` `#72757b`)이
  **4.43:1**이다. 라이트는 면 14.61 · 호버 12.81이다. 이 자리에 적혀 있던 「면 3.96 · 호버 2.52로
  미달」은 `palette-gray-600`이 `#777d89`이던 시절의 수다(이관 전 제품 주석이 3.96을 적어 두었다).
  2026-09-02 회색 램프 재구성에서 그 칸이 어두워지면서 기본 면은 AA를 넘었다 — **대비를 올리려고
  값을 바꾼 것이 아니라 램프 이동의 결과로 따라온 것이다.** 남은 호버 4.43을 올리려면
  `color-node-chip-surface-hover`를 한 칸 옮겨야 하는데 그것은 메타 툴바 전역의 룩앤드필 변경이라
  owner 판정 대상이다.
- **기본 면은 게이트가 잰다(2026-09-13).** `color-fg-primary` / `color-node-chip-surface`가
  `contrastPairs`에 `minimum 4.5`로 있다. **호버 면은 게이트 밖이다** — 글자색과 호버 면이
  서로 다른 규칙에 선언돼 있고, 올리더라도 다크 4.43이라 4.5를 넘지 못한다. 호버 수치는 이
  문서가 계산한 것이고 CI가 다시 계산하지 않는다.
- **호버 면이 제품과 다르다.** 제품은 면 위에 오버레이를 섞었고(다크 `palette-gray-000` 8% ·
  라이트 `palette-gray-1000` 5%의 `color-mix`), 여기서는 팔레트를 한 단계 옮겼다. 다크에서 차이가
  크다 — 제품의 혼합 결과는 대략 `srgb(0.508 0.529 0.573)`인데 토큰 `palette-gray-500`은
  `srgb(0.604 0.627 0.671)`이다. **호버가 제품보다 눈에 띄게 밝다.** `color-mix`는 토큰 모델의
  스칼라 shape에 담기지 않으므로 값을 옮기려면 새 primitive 단이 필요하다.
- **라이트 비활성 전경이 제품과 다르다.** 제품은 라이트에서도 `palette-gray-400`(1.62:1)인데
  여기서는 `palette-gray-500`(2.33:1)이다. 승격은 다크에서만 일어났고 라이트는 공용
  `color-fg-disabled`와 같은 값으로 남았다. 대비는 올라갔지만 **의도한 것인지 아닌지가 레시피에
  적혀 있지 않다 — 확인되지 않았다.**
- **`__glyph` 슬롯의 소비처가 0이다.** 제품 루트 16자리 중 이 클래스를 쓰는 곳이 없고, 아이콘을
  그리는 관용구가 둘로 갈린다 — `VideoNode`는 래퍼 유틸리티(`META_TOOLBAR_GLYPH = "w-7 h-7 …"`),
  `BgmNode`의 토글은 아이콘 컴포넌트의 `size={14}` prop(래퍼 `TOGGLE_PILL_GLYPH`에는 크기
  유틸리티가 없다). 어느 쪽이든 화면은 14px이라 레시피의 16px과 다르다.
  `__label`은 두 자리(`BgmNode`의 토글 둘)에서 쓴다.
- **타이포를 소비처가 다시 얹는다.** 루트 16자리 중 **15**가 `type-caption-12-regular`를 함께
  붙인다 — 안 붙이는 하나는 라벨이 없는 `VideoNode`의 정사각 사운드 토글이고, `__label` 스팬
  둘도 붙이지 않는다. 레시피가 이미 같은 스케일을 선언하므로 중복이며, 제품 전역 `type-*`
  클래스가 레이어 밖이라 지우면 무엇이 이기는지 다시 봐야 한다 — **확인되지 않았다.**
- **수렴이 절반이다 — 같은 네 노드 안에도 이관 전 알약이 남아 있다.** `ImageNode`의 모델
  알약(`META_MODEL`)과 `TtsNode`의 음성 알약(`META_CHROME_BOX` · `META_MODEL`)은 여전히
  `--node-chrome-btn-*`으로 손조립돼 있고 전환도 `0.12s`(정본 160ms)로 다르다. 미이관이 아니라
  **일부러 채택하지 않은 것**이며 제품 주석이 이유를 적어 두었다 — 정본의
  `justify-content: center` · `flex: none`이 좌측 정렬 가변폭 라벨을 가운데로 몰고 좁아질 때
  줄지 못하게 만들어 **이름 말줄임이 깨진다**. 그래서 위 Availability의 "4개 파일"은 네 노드가
  전부 수렴했다는 뜻이 아니라 **짧은 값 알약만** 수렴했다는 뜻이다. 긴 라벨 알약까지 가져오려면
  정렬·수축 축을 열어야 하는데, 그것은 "툴바 한 줄이 같은 기하를 유지한다"는 전제와 다투므로
  owner 판정 대상이다 — **정해지지 않았다.**
- **`--node-chrome-btn-*` 계열을 아직 지울 수 없다.** 위 두 알약 외에
  `nodes/InstagramNode.tsx`(노드 툴바 버튼, 전환 `0.13s`)와
  `components/NodeHeaderActions.tsx`(`-h` · `-radius`)가 남아 있고, 네 노드의 툴바 컨테이너도
  `--node-chrome-btn-gap`을 쓴다.
- **비활성이 포인터 이벤트를 막지 않는다.** 이관 전 제품 레시피의 비활성 알약은
  `pointer-events: none`을 갖고 있었는데 정본이 그것을 옮기지 않았고, `:disabled` /
  `[aria-disabled="true"]` 규칙이 선언하는 것은 `cursor`와 `color`뿐이다. 지금 제품은 비활성
  알약에 native `disabled`를 함께 걸고 있어 아무 일도 일어나지 않지만, `aria-disabled`만 거는
  소비처에서는 클릭 핸들러가 그대로 돈다. 옮길지 말지가 정해져 있지 않다 — **확인되지 않았다.**
- **높이 32와 반경 12가 `layout-control-height-md`·`radius-control`과 값이 같은데 전용 토큰으로
  섰다.** 값이 같은 토큰이 둘이면 한쪽만 움직였을 때 아무도 모른다. 레시피가 분리 이유를 적어
  두지 않았다 — **확인되지 않았다.**
- ~~**인용 좌표를 고정할 수 없다.**~~ **해소됐다.** 이 항목은 `product-evidence.lock.json`이 채택
  **이전** 커밋에 걸려 있어 본문 좌표가 이관 전 원본을 가리킨다고 적었다. 락의 `productCommit`이
  `74a7303b`로 올라가면서 그 전제가 사라졌다 — 락이 가리키는 판본이 곧 채택 후 상태이고, 위 본문
  좌표는 그 판본을 직접 가리킨다.

## Acceptance tests

1. `.louis-node-chip`의 높이·좌우 여백·간격·반경·타이포가 `layout-node-chip-height`(32) ·
   `layout-node-chip-inset`(10) · `space-control-xs`(4) · `radius-node-chip`(12) ·
   `typography-caption-regular`(12/1.5/-0.12px/400)의 값과 같다.
2. `border-width`가 0이고 `box-shadow`가 `hairline-inset`과 같다 — 즉 경계가 레이아웃 박스를
   줄이지 않는다.
3. `data-shape="square"`에서 `inline-size` = `min-inline-size` = `block-size` = 32px이고 좌우
   패딩이 0이다 — 루트의 `min-inline-size: 0`이 덮여야 한다.
4. `<button>`에 호버하면 면이 `color-node-chip-surface-hover`가 되고 `cursor: pointer`이며,
   **전경색은 바뀌지 않는다.**
5. `<span class="louis-node-chip">`에 호버해도 면이 바뀌지 않고 커서가 포인터가 아니다.
6. `disabled`와 `aria-disabled="true"`가 **같은 전경색과 같은 커서**를 만든다.
7. 비활성 상태에서 면과 inset 헤어라인이 기본과 같다 — 알약이 사라지지 않는다.
8. 다크에서 `color-node-chip-fg-disabled`가 `color-node-chip-surface`와 **다른 색**이다
   (대비 ≥ 2.0:1). 공용 `color-fg-disabled`를 그대로 쓰면 이 항목이 실패한다.
9. 라벨이 아무리 길어도 한 줄로 잘리고 높이가 32px로 유지된다.
10. 자식이 둘일 때(`__glyph` + `__label`) 좁아지면 **라벨만** 줄어들고 글리프는 16px을 유지한다.
11. `prefers-reduced-motion: reduce`에서 `transition-duration`이 0ms다.
12. `forced-colors: active`에서 `box-shadow`가 없고 `currentColor` 1px 실선 테두리가 있으며,
    비활성 전경이 `GrayText`다.
13. 소비처가 Tailwind 유틸리티로 호버 면을 덮을 수 있다. 근거는 특이도가 아니라 레이어
    순서다 — `utilities`가 `louis.component`보다 뒤에 온다. 호버 규칙의 특이도는 **0-2-0**이며
    (`.louis-node-chip` + `:hover`, `:where()` 안은 0), 그 값이 더 올라가지 않는 것까지 함께 본다.
14. 아이콘 전용 정사각에 접근 가능한 이름이 있다(`aria-label` 또는 시각적으로 숨긴 라벨).
15. reset을 켜지 않은 문서에서도 `box-sizing`이 `border-box`이고, `forced-colors: active`의
    1px 테두리가 붙어도 렌더 높이가 32px에 머문다.

## Migration and changelog

- 2026-08-25 — CSS 레시피 신설(`95a15ac`). 네 노드에 복제돼 있던 `--node-chrome-btn-*` 알약
  레시피를 한 벌로 모았다. 치수·면은 제품 값을 그대로 채택했고 경계만 inset 헤어라인으로 바꿨다.
- 2026-08-25 — 비활성 전경을 공용 `color-fg-disabled`에서 전용 `color-node-chip-fg-disabled`로
  분리(`ef83f26`). 다크에서 전경과 면이 같은 색이 되던 대비 1.00:1을 해소한다.
- 2026-08-26 — 이 문서 첫 공개. 규범이 구현보다 늦게 섰다.
- **제거 일정 없음.** `--node-chrome-btn-*`은 Known deviations에 적은 자리들이 남아 있는 동안
  제품에 그대로 있고, 이 컴포넌트는 그것을 대체하는 중이지 대체한 것이 아니다.
  [Updates](../updates/README.md).
