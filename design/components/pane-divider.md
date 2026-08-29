---
id: pane-divider
status: experimental
authority: normative
summary: 창과 창 사이를 잡아 미는 구분자입니다.
---

# PaneDivider

창과 창 사이에 놓여 **경계를 보여 주고, 잡아서 밀 수 있게** 한다. 두 가지를 동시에 해야 해서
어려운 컴포넌트다 — 보이는 선은 레이아웃을 밀지 않을 만큼 얇아야 하고, 잡는 영역은 손가락과
포인터가 놓치지 않을 만큼 넓어야 한다. 이 둘은 같은 사각형일 수 없다.

## Availability

| Surface       | 상태           | 근거                                                        |
| ------------- | -------------- | ----------------------------------------------------------- |
| Web           | `partial`      | CSS recipe `packages/css/src/component/pane-divider.css`. React 컴포넌트 없음 |
| Figma         | `partial`      | component set 2 variant (Orientation). publish 는 사람이 한다        |
| Documentation | `done`         | 이 문서                                                     |
| Maturity      | `experimental` | 제품이 소비한다. React 표면과 키보드 조절이 아직 없다        |

## 왜 있는가

제품 정본은 비디오 에디터 워크스페이스의 구분자 셋이다 — `assets` · `properties` 를 좌우로
미는 세로 둘과 `timeline` 을 위아래로 미는 가로 하나. 실측
([editor-skeleton-measured](../../migration/editor-skeleton-measured.md))에서 이 셋이 한 계약으로
수렴하는 것이 확인된 뒤 그것을 채택했다.

수렴 전 상태가 이 컴포넌트의 필요를 말해 준다. 세로 둘은 선언 **25개를 바이트 단위로 복제**하고
있었고, 가로 하나만 혼자 다른 기하를 썼다 — 그립이 84×5 라 2px 격자를 벗어났고, hover 에서
크기가 자라지 않았으며, active 는 라이트 색을 같은 값으로 다시 적는 no-op 뿐이라 **드래그 중인지
알 수 없었다.** 복제는 셋 중 하나만 고쳐지는 상태를 만든다.

## When to use

- 사용자가 **크기를 조절할 수 있는** 두 패널 사이.
- 축은 둘뿐이다 — 세로(좌우로 민다) · 가로(위아래로 민다).

쓰지 않는 경우.

- **밀 수 없는 경계**에는 쓰지 않는다. 그건 [MenuSeparator](menu-separator.md)나 단순 hairline 이다.
  잡을 수 있게 생긴 것이 잡히지 않으면 그 자체가 결함이다.
- **세 개 이상의 패널을 한 점에서 만나게** 하지 않는다. 이 recipe 는 한 축만 소유한다.

## Properties

이 recipe 는 클래스와 데이터 속성으로만 말한다. React 컴포넌트가 없으므로 prop 이 아니라
**마크업 계약**이다.

| Property | 값 | 기본값 | 설명 |
| --- | --- | --- | --- |
| Orientation | `--vertical` · `--horizontal` | 없음(필수) | 미는 방향. 커서와 그립 축이 함께 정해진다 |
| `data-louis-state` | `"active"` · 없음 | 없음 | 드래그 중임을 소비처가 알린다. hover 와 같은 모양이 된다 |
| `grid-area` 배치 | 소비처 | — | 이 recipe 는 자리를 정하지 않는다 |

## Anatomy

1. **트랙** — 요소 자신. 보이는 두께 4px. 격자 트랙과 같은 값이라 레이아웃을 밀지 않는다.
2. **히트영역** (`::after`) — 트랙 양쪽으로 4px 씩 넓혀 **12px**. 절대 배치라 레이아웃에
   영향을 주지 않는다. 8px 거터를 2px 씩 넘어 이웃 패널 위로 올라탄다.
3. **그립** (`::before`) — 가운데 알약. 쉴 때는 보이지 않고, 얹거나 잡으면 나타나며 **길어진다**.

## Variants

| Variant | 클래스 | 축 | 커서 |
| --- | --- | --- | --- |
| Vertical | `.louis-pane-divider--vertical` | 좌우로 민다 | `ew-resize` |
| Horizontal | `.louis-pane-divider--horizontal` | 위아래로 민다 | `ns-resize` |

## States

| State | 그립 길이 | 불투명도 |
| --- | --- | --- |
| idle | 60px | 0 |
| hover | 80px | 1 |
| active (`[data-louis-state="active"]`) | 80px | 1 |

**그립은 상태를 길이로 말한다.** 불투명도만 바꾸면 드래그 중인지 얹기만 한 것인지 구분되지
않는다 — 가로 구분자가 실제로 그 상태였다. 색은 라이트·다크가 같은 고정 팔레트(`palette-gray/500`)라
테마 분기를 두지 않는다([DS-D-0031](../governance/decisions/DS-D-0031-no-theme-branch-on-adaptive-ramp.md)
가 금지하는 형태가 애초에 생기지 않는다).

## Interaction and responsive behavior

- **드래그는 소비처가 소유한다.** 이 recipe 는 모양만 소유한다 — 포인터 이벤트, 클램프 범위,
  더블클릭 리셋, 그리고 드래그 중임을 `data-louis-state="active"` 로 알리는 일이 소비처 몫이다.
- `touch-action: none` 으로 드래그 중 브라우저가 스크롤·줌으로 가로채지 못하게 한다.
- **좁은 화면(719px 이하)** — 가로 구분자는 트랙을 두 배(8px)로 키워 손가락으로 잡게 하고
  그립은 48px 로 줄인다. 세로 구분자를 숨기는 판정은 **셸이 소유한다**. 이 recipe 는 숨기지 않는다.
- `prefers-reduced-motion: reduce` 에서는 길이 변화를 없애고 나타남만 남긴다.
- `forced-colors: active` 에서는 배경이 사라지므로 그립을 `CanvasText` 로 되살린다.

## Content

**글자가 없다.** 라벨도 툴팁도 갖지 않는다 — 위치와 커서가 의미를 전부 말한다. 이름이 필요한
것은 스크린 리더 쪽이고, 그것은 `role="separator"` 와 `aria-label` 로 **소비처가** 준다
(아래 Accessibility 의 미해결 항목).

## Accessibility

**이 recipe 가 아직 담지 못하는 것이 있고, 숨기지 않고 적는다.**

- **키보드로 조절할 수 없다.** `role="separator"` 에 `aria-valuenow` 와 방향키를 붙이는 일은
  소비처의 몫이고 제품은 아직 제공하지 않는다. 값을 여기서 정할 수 없어 표식만 남긴다.
- **히트영역 12px 은 포인터 타깃 최소치(24px)에 못 미친다.** 트랙을 두껍게 하면 레이아웃이
  밀리므로 `::after` 확장 폭을 늘리는 것이 유일한 길인데, 그러면 이웃 패널의 클릭을 더 많이
  가로챈다. 어느 쪽을 고를지가 아직 결정되지 않았다.

## Specification

| Part/state | Token | 값 |
| --- | --- | --- |
| 트랙 두께 | `layout/pane-divider-track` | 4px |
| 히트영역 확장 | `space/pane-divider-hit-slop` | 4px (양쪽 → 12px) |
| 그립 길이 idle | `layout/pane-divider-grip-length` | 60px |
| 그립 길이 hover·active | `layout/pane-divider-grip-length-active` | 80px |
| 그립 길이 compact | `layout/pane-divider-grip-length-compact` | 48px |
| 그립 색 | `color/palette-gray/500` | 테마 불변 |
| 그립 곡률 | `radius/pill` | 999px |
| 전환 | `motion/control-hover-*` | 120ms ease |
| 그립 레이어 | `layer/content` | — |

## Implementation

- Web source: `packages/css/src/component/pane-divider.css`
- Public import: `@klipse-design/css` (`styles.layer.css`)
- Figma component: `PaneDivider` (Orientation: vertical · horizontal). 축 어휘 개정 근거는 [figma-component-authoring](../governance/figma-component-authoring.md) 「2026-08-29 개정의 근거」
- 제품 소비: `klipse-web` 의 비디오 에디터 구분자 셋(`vemClass.ts` 의 `assetsDivider` ·
  `propertiesDivider` · `timelineDivider`). 핀 `b7667d8a`.

## Known deviations

- **그립 색이 라이트에서 조금 어두워졌다.** 이관 전 제품의 그립은 `--palette-gray-500` 을 읽었는데,
  그 토큰이 라이트에서 `body` 스코프로 `#bcc0c9`(188 192 201) 로 덮여 있다(`Gnb.tsx` 의 적응형
  회색). 레시피는 원시 토큰(`palette-gray/500` = 154 160 171)을 읽으므로 그 덮개를 타지 않는다.
  결과적으로 **라이트에서만** 그립이 한 단계 어두워지고 다크는 그대로다 — 이 문서가 「라이트·
  다크가 같은 값」이라고 적은 상태에 오히려 가까워졌다. 잡을 때만 보이는 알약이고 밝은 면 위에서
  더 잘 보이므로 되돌리지 않았다.
- **compact 에서 세로 구분자가 암묵 트랙을 만든다.** 제품 compact 격자가 `assets` ·
  `assets-divider` 영역 이름을 빼는데 그 요소들에는 719px 분기가 없다. 이것은 셸의 결함이며
  이 recipe 로는 고칠 수 없다.
- **React 컴포넌트가 없다.** 드래그 상태 기계를 누가 소유하는지가 정해지기 전에는 만들지 않는다.

## Acceptance tests

**자동 검증은 아직 없다.** 있는 것과 없는 것을 갈라 적는다.

있는 것 — 제품 실물의 헤드리스 Chromium 계산값 실측
([editor-skeleton-measured](../../migration/editor-skeleton-measured.md)). idle 에서 세로 둘이
4×60 · 가로 하나가 60×4 이고 불투명도 0, active 에서 세로 4×80 · 가로 80×4 이고 불투명도 1 인
것을 확인했다. 이 recipe 의 값은 그 실측에서 나왔다.

있는 것 — parity 계약(`scripts/verify-figma-parity.mjs`). 이 컴포넌트의 계약은 **불투명도**라
`opacity` 를 자손 경로(`{ part: "Grip", value }`)로 적었고, 뒤집으면 게이트가 잡는다.
`tamperComponentPartOpacity` canary 가 그 검출력을 고정한다.

있는 것 — 이관 뒤 제품 실측(2026-08-29). 셋 다 idle 4×60 · 60×4 불투명도 0, active 4×80 ·
80×4 불투명도 1, 놓으면 복귀. compact(375px)에서 세로는 셸이 숨기고 가로는 트랙 8px · 그립 48×4.

없는 것 — 실브라우저 acceptance test 와 `figma/components.measured.json` 항목. 기하 대조는
그 항목이 생겨야 걸 수 있고, 지금은 불투명도만 계약이 잡는다.

## Migration and changelog

[Updates](../updates/README.md)에 연결한다.
