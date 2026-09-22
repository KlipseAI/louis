---
id: decision-list-row-selection-is-the-surface
status: experimental
authority: normative
---

# DS-D-0070 선택 행의 선택은 면이 갖는다 — 3px 선행 표식을 걷는다

- Status: accepted (LOUIS 2026-09-22, 제품은 핀 상향으로 받는다)
- Date: 2026-09-22
- Owners: design system maintainer
- Affects: `component-selectable-list-row`, `table`, `decision-three-in-one-change`

## Context

[Selectable List Row](../../components/selectable-list-row.md) 는 선택된 행에 면(`color-bg-inset`)과 함께 왼쪽
3px 막대(`::before`, `color-accent-primary`)를 그렸다. 2026-08-18 실측에서 다크의 `background-inset` 이 표면과 같은
색(`#313644`)이라, 표면 위 목록에서는 선택 면이 바닥에 녹았기 때문이다.

소유자 판정(2026-09-22, 하이라이트 스튜디오 시안): 「좌측에 저 파란선은 뭐야 대체. 완전 ai스러운 디자인이잖아」 —
그리고 레시피에서 걷는 것을 골랐다.

**제품은 이 표식을 한 번도 보이지 않았다.** 제품 앵커(`migration/product-evidence.lock.json` 의 `productCommit`
`6fbdac16`)에서 이 레시피를 입은 자리는 셋이고, 셋 다 표식을 끈다.

| 자리 | 원문(제품 `6fbdac16`) | 파일:줄 |
| --- | --- | --- |
| 하이라이트 클립 목록 | `    "before:hidden text-inherit",` | `highlightSceneStyles.ts:162` |
| 캔버스 레이어 패널 | ``   정본의 선택 표시(`aria-current` 면 + 선행 `::before` 3px 막대)는 쓰지 않는다: 이 목록의 선택은`` | `NodeLayersPanel.tsx:255` |

명령은 `git grep -n "<원문의 한 조각>" 6fbdac16` 이고, 하이라이트 줄은 `migration/product.measured.json` 의
「선택을 무엇으로 보이는가」 축이 전체 경로로 인용한다. 세 번째 자리인 프로젝트 영상 팝오버는 `aria-current` 를
켜지 않아 표식이 설 일이 없다고 스스로 적는다. 그 파일은 제품 근거 잠금(`migration/product-evidence.lock.json`)
밖이라 여기서 좌표로 인용하지 않는다 — 잠금은 앵커 재고정 때 다시 뽑는다. 레시피를 입은 자리는 이 셋이 전부다 —
`git grep -n '"louis-selectable-list-row"' 6fbdac16` 이 `NodeLayersPanel.tsx:258`, `highlightSceneStyles.ts:161`,
그리고 그 팝오버 한 곳을 낸다. 제품 `origin/dev` `a499aa89` 에서도 같은 셋이다.

**옛 근거도 성립하지 않는다.** 다크 사다리가 바뀌어(`palette-gray-850` 폐지) 지금 `bg-inset` 은 `bg-canvas` 와 같은
값이고, 목록이 놓이는 올라온 면들과는 갈린다(`packages/css/generated/tokens.css`, LOUIS `b31c981`).

| 테마 | `bg-inset` | `bg-surface` | `bg-raised` | `bg-menu` | `bg-overlay` | `bg-canvas` |
| --- | --- | --- | --- | --- | --- | --- |
| light | `#ebecee` | `#fafafa` | `#ffffff` | `#f2f3f5` | `#fafafa` | `#f2f3f5` |
| dark | `#0d1118` | `#171b22` | `#171b22` | `#171b22` | `#171b22` | `#0d1118` |

## Decision

선행 표식을 걷는다. 선택은 `aria-current` 가 소유하고, 화면에는 면(`color-bg-inset`)과 전경(`color-fg-primary`)으로
선다 — Sidebar Nav Item 과 같은 방식이다. forced-colors 의 테두리는 남긴다.

남는 제약 하나를 규범에 올린다 — **목록은 올라온 면(surface, raised, menu, overlay) 위에 둔다.** 다크에서 선택 면이
캔버스와 같은 값이라 캔버스 바로 위에서는 선택이 보이지 않는다. 브라우저 테스트가 네 면 위에서 두 테마 모두 선택 면이
바닥과 다른지를 단언한다 — 사다리가 다시 움직여 면이 같아지면 거기서 걸린다.

`position: relative` 는 남긴다. 제품 레이어 패널이 행의 `::before` 로 트리 커넥터를 그리며 그 기준을 이 선언에 기댄다.

## Alternatives

| 대안 | 버린 이유 |
| --- | --- |
| 표식을 남기고 제품에서만 끈다 | 지금이 그 상태다. 소비처 셋이 모두 같은 줄을 반복해 끄고, 정본이 제품에 없는 그림을 계약으로 들고 있다. 정본과 제품 모양이 갈리면 정본을 제품 쪽으로 맞춘다는 로드맵 규칙의 반대다 |
| 표식을 다른 모양(점, 테두리)으로 바꾼다 | 소유자가 거부한 것은 「면 말고 따로 붙은 표식」이다. 모양만 바꾸면 같은 판정을 다시 받는다 |
| 선택 면을 한 칸 더 강한 토큰으로 옮긴다 | 올라온 면 위에서는 지금 값으로 이미 갈린다. 캔버스 위 배치 하나를 위해 토큰을 새로 세우면 Figma 변수와 제품 소비처가 따라온다 |

## Consequences

- **제품 화면은 달라지지 않는다.** 세 소비처가 모두 표식을 이미 끄고 있다. 핀을 올린 뒤 하이라이트 목록의
  `before:hidden` 은 끌 것이 없어져 지워도 된다(제품 PR 의 몫). 레이어 패널의 `::before` 트리 커넥터는 그대로다.
- **캔버스 바로 위에 둔 목록은 다크에서 선택이 보이지 않는다.** 규범이 그 배치를 막는다(When to use). 레시피는
  막지 않으므로 호출부의 책임이다.
- **Figma 대조 계약에서 `Marker` 가 빠진다.** 되읽기 명세(`figma-readback-emit.mjs`)와 parity 계약
  (`verify-figma-parity.mjs`)의 `parts` 에서 지웠고, 측정 기록의 `markerInline` 과 그 미검증 사유(
  `migration/unverified-value-map.json`)도 함께 지웠다. 제품 대조 기록(`migration/product.measured.json`)의
  「선택을 무엇으로 보이는가」는 편차 수용에서 `same` · `adopted` 로 바뀐다.

## 세 곳 ([DS-D-0028](DS-D-0028-three-in-one-change.md))

| 자리 | 바꾼 것 |
| --- | --- |
| 코드 | `packages/css/src/component/selectable-list-row.css` 의 `[aria-current="true"]::before` 규칙을 지웠다. React 주석, 스토리 주석, 브라우저 테스트 두 건(표식이 있다 → 올라온 면 네 곳 위에서 선택 면이 바닥과 갈린다, 선택한 행에도 표식이 없다)을 바꿨다 |
| Figma | `SelectableListRow` 세트 Selected 변형의 `Marker` 레이어를 지우고 `--components --only SelectableListRow` 로 다시 떠 `readback.json` 에 병합한 뒤 `snapshot.json` 을 다시 만들었다 |
| 제품 | 핀 상향으로 받는다. 화면 차이는 없다(위 Consequences) |

## Rollback

규칙 한 블록과 테스트 두 건을 되돌리고, 측정 기록의 `markerInline`(3)과 계약의 `Marker` 파트를 되살린다. Figma 는
Selected 변형에 3px 막대(`color/accent-primary`, 반경 999, 위아래 8 안쪽)를 다시 그리고 되읽기를 다시 뜬다.
