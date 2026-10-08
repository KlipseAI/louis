---
id: node-chrome-button
status: experimental
authority: normative
summary: 노드 카드 헤더의 아이콘 버튼 — 면이 없고 호버에서만 틴트가 뜹니다.
---

# Node Chrome Button

노드 카드 **헤더**에 붙는 32px 정사각 아이콘 버튼이다. 도움말 · 다운로드 · 삭제 셋이 한 묶음으로
서고, 아홉 노드가 전부 같은 묶음을 쓴다. 도움말은 2026-10-07 에 생긴 조건부 칸이다(아래 「도움말
단추」).

**[Icon Button](icon-button.md)과 다른 계열이다.** 치수를 컨트롤 사다리가 아니라 노드 전용
토큰(`--node-chrome-btn-h` 32 · `--node-chrome-btn-radius`)에서 받고, **면이 없다** — 기본은
투명이고 호버에서만 틴트가 뜬다. Icon Button 의 `ghost` 변형이 가장 가깝지만 그쪽은 컨트롤
높이 사다리를 타고 이쪽은 노드 크롬 축을 탄다. 두 축이 같은 수를 갖는 것은 지금의 우연이고,
어느 한쪽이 움직이면 갈린다.

**같은 토큰을 쓰지만 이 컴포넌트가 아닌 자리가 둘 있다.** 메타 툴바의 알약
([Node Chip](node-chip.md))은 좌우 패딩과 면을 갖고, `InstagramNode` 의 툴바 버튼도 면을 갖는다.
이 버튼만 치수(`-h` · `-radius`)만 빌려 쓰고 면을 쓰지 않는다 — 제품의 토큰 주석이 그 사실을
직접 적어 두었다.

## 도움말 단추

2026-10-07, 제품 `NodeHeaderActions.tsx:104`(`chore/landing-dead-walkthrough` @d040dce15)의
`NodeHelpAction` 이 모든 노드 머리에 붙는다. **새 톤이 아니라 중립 톤의 소비처가 하나 늘었다** —
다운로드와 같은 `BUTTON_NEUTRAL` 클래스에 글리프만 다르고, 그래서 이 문서의 축(`Tone` · `State`)도
CSS 선언도 늘지 않았다.

- **글리프는 `help`**(lucide `circle-help`, 원 안의 물음표, 24 격자 · 16 렌더 · 표시 두께 1). 아카이브
  썸네일의 제목 줄도 같은 경로를 굽는다. 아이콘 세트에는 `icon/question-circle` 로 등재돼 있다 — Known deviations 6.
- **묶음의 맨 앞**이다(도움말 → 다운로드 → 삭제). 삭제가 맨 끝이라는 배치는 그대로다.
- **조건부 칸이다.** 캔버스가 도움말을 열 수 있고(랜딩 · 임베드는 못 연다) 그 노드에 도움말 쪽이
  있을 때만 그려진다. 둘 중 하나라도 아니면 칸이 사라지고 묶음은 둘로 돌아간다 — 폭을 고정하지 않는
  이유다.
- **툴팁은 짧게 「도움말」, `aria-label` 은 어느 노드의 도움말인지까지**
  말한다(제품 `nodeHelpAria(노드 이름)`). 캔버스에는 노드가 여럿이라 라벨이 모두 같으면 화면 읽기 도구 사용자가 노드를 구별하지 못한다.
- **누르면 측면 패널이 그 노드의 쪽으로 열린다**([Editor Workspace](../patterns/editor-workspace.md)의
  「캔버스 측면 패널」). 비활성이 없다 — 도움말은 막을 이유가 없다.
- **Figma 는 새 변형이 아니라 셸의 칸이다(2026-10-08).** 이 버튼의 축(`Tone` · `State`)은 그대로이고,
  [Node Shell](node-shell.md) 헤더 `Actions` 맨 앞에 `NodeChromeButton`(`Tone=neutral`)의 `Glyph` 를
  `icon/question-circle` 로 갈아 끼운 인스턴스 `Help` 가 섰다. 조건부라 셸의 BOOLEAN `HelpButton`(기본 꺼짐)이 가시성을 갖는다.

## Availability

| Surface       | 상태           | 근거 |
| ------------- | -------------- | ---- |
| Web           | `partial`      | CSS recipe `packages/css/src/component/node-chrome-button.css`. React 표면은 없다 — 소비처가 클래스를 물면 되는 자리다 |
| Figma         | `partial`      | NodeChromeButton — Tone(neutral·danger) × State(Default·Hover·Disabled) = 6 variant. 슬롯: Glyph(INSTANCE_SWAP) |
| Documentation | `done`         | 이 문서 |
| Maturity      | `experimental` | Figma 가 코드보다 앞서 있고 호버 틴트 알파가 다크에서 갈린다 |

## Anatomy

- 정사각 32×32. 아이콘 전용이라 좌우 패딩이 없다 — `--node-chrome-btn-padding-x` 를 **쓰지 않는
  것**이 계약이다.
- 반경은 `--node-chrome-btn-radius`, 곧 `radius-control` 이다.
- 글리프 16. 32 버튼 안의 16 글리프가 한 쌍이라고 제품 상수(`HEADER_GLYPH_PX`)가 적는다.
- 테두리가 없다. 경계는 호버 틴트가 만든다.
- 버튼 사이 간격은 **0**이다. 제품이 `--node-chrome-btn-gap` 을 쓰지 않고 `gap-0` 을 쓴다 —
  「의도적으로 붙인다」는 주석이 소스에 있다.

## Behavior

| 상태 | 중립 | 삭제 |
| --- | --- | --- |
| Default | 면 없음 · 잉크 보조색 | 면 없음 · 잉크 보조색 |
| Hover | 잉크 그대로 · 틴트 얹음 | **잉크가 붉게 간다** · 붉은 틴트 |
| Disabled | 불투명도 0.35 · 커서 not-allowed | 같음 |

두 톤이 갈리는 것은 잉크다. 중립은 면만 얹지만 삭제는 글리프 색까지 붉게 간다 — 그래서
`Tone` 이 축이고 `Glyph` 는 슬롯이다.

## Properties

| 이름 | 종류 | 뜻 |
| --- | --- | --- |
| `Glyph` | 슬롯 (INSTANCE_SWAP) | 16px 글리프. 호출부가 넘긴다 |
| `Tone` | 축 (2) | `neutral` · `danger`. 호버에서 잉크가 붉게 가는지를 가른다 |
| `State` | 축 (3) | `Default` · `Hover` · `Disabled` |

## States

| 상태 | 면 | 잉크 | 그 밖 |
| --- | --- | --- | --- |
| Default | 없음 | 보조색 | — |
| Hover (neutral) | 옅은 중립 틴트 | 그대로 | — |
| Hover (danger) | 옅은 붉은 틴트 | **붉게 간다** | — |
| Active | Hover 와 같음 | 같음 | `scale(0.94)` — 축이 아니라 동작이다 |
| Disabled | 없음 | 보조색 | 불투명도 0.35 · `not-allowed` |

## Content

글자가 없다. 뜻은 글리프와 `aria-label`, 그리고 툴팁이 나른다. **비활성일 때는 라벨이
바뀐다** — 제품이 `disabledLabel` 을 따로 받아 「왜 못 하는가」를 말한다(생성 중에는 삭제할 수
없다). 같은 버튼에 같은 라벨을 두고 비활성만 시키면 사용자는 이유를 알 방법이 없다.

## Accessibility

- 32×32 는 포인터 타깃 최소치 24를 넘는다. 다만 **버튼 사이 간격이 0**이라 이웃의 경계가
  시각적으로만 갈린다 — 잘못 누르는 쪽이 삭제라는 점에서 이 값은 다시 볼 만하다. 지금은 제품
  실측 그대로 옮기고 판정은 소유자에게 남긴다.
- 삭제가 붉은 것은 호버에서**만**이다. 기본 상태에서 버튼 셋은 같은 색이므로 색이 유일한
  신호가 되지 않는다 — 글리프가 뜻을 나른다.
- 노드 드래그 영역에서 빠져 있어야 한다. 빠지지 않으면 누르는 순간 노드가 끌려간다.

## Acceptance tests

`packages/react/test/node-chrome.browser.test.tsx` 가 실브라우저에서 잰다 — 32 정사각과 반경,
글리프 16, **기본 면이 투명하다**는 사실, 그리고 비활성이 면이 아니라 불투명도 0.35 로만
갈린다는 것. 셸과 한 파일인 이유는 이 버튼이 셸의 헤더 높이를 정하기 때문이다.

레시피 선언과 기록의 대조는 `node ./scripts/verify-recipe-record.mjs` 가 따로 갖는다. 거기서
`background: transparent` 를 **이름으로** 고정한다 — 기본에 면이 하나 생기면 이 버튼이
IconButton 의 `ghost` 와 구분되지 않고, 노드 크롬 축을 따로 두는 이유도 사라진다.

호버 두 톤은 아직 재지 않는다. `:hover` 는 진짜 포인터를 옮겨야 하고, 이 저장소에서 남은
포인터가 다음 시험의 색을 바꾼 사고가 있어 `test/setup-styles.ts` 가 그 뒤처리를 갖는다 —
톤 두 벌을 재려면 그 왕복을 두 번 더 얹게 되므로, 값이 갈리는 자리(잉크가 붉게 간다)를
Figma 변형과 이 문서 States 표가 지키는 상태로 둔다.

제품 클래스가 세 상수로 이미 뽑혀 있어 측정 하네스에 등록하기는 쉬운 편이다 — `$noProductRender`
를 지우는 것이 이 칸의 다음 단계이고, recipe 가 섰다고 그 면제가 풀리지는 않는다.

## Known deviations

1. **호버 틴트 알파가 다크에서 얕다.** 제품은 중립 호버를 라이트 검정 8% · 다크 흰 12% 로,
   삭제 호버를 라이트 8% · 다크 12% 로 칠한다. Figma 는 `color/accent-ghost-hover`(양쪽 8%)와
   `color/red-alpha/08`(양쪽 8%)에 물렸다 — 라이트는 정확히 같고 다크만 4%p 얕다. 12/8 쌍을
   담을 변수가 없고 새 변수는 토큰 생성물을 다시 내야 한다.
2. **Active 를 열지 않았다.** 제품의 `:active` 는 `transform: scale(0.94)` 다. 변형으로 그리려면
   프레임을 0.94배로 줄여야 하는데 그러면 기하 계약이 「눌린 크기」를 정본처럼 말하게 된다.
   프레스는 크기가 아니라 동작이므로 축이 아니라 이 문단이 값을 갖는다.
3. **Success 를 열지 않았다.** 프롬프트 입력의 복사 버튼은 복사→체크가 같은 칸에서 교차
   페이드하는 성공 상태를 갖는데, 그 버튼은 28 정사각이라 크기 축이 하나 더 필요하고
   `Success` 는 축 어휘의 닫힌 `State` 목록에 없다. 규범을 먼저 고쳐야 하는 자리라 열지 않았다.
4. **툴팁을 담지 않는다.** 제품은 버튼들을 `ChromeTooltip` 으로 감싸고 캔버스 배율을 역보정한다.
   툴팁은 [Tooltip](tooltip.md)이 소유하고, 배율 역보정은 캔버스의 몫이다.
5. **삭제 호버의 붉은 틴트를 `color-mix` 로 만든다.** 같은 값의 원시 토큰
   (`color-red-alpha-08`)이 있지만 component CSS 는 primitive 를 직접 소비하지 않는 것이 이
   저장소의 규칙이고 저작 게이트가 그것을 강제한다. `accent-danger` 를 8% 로 섞은 색은 그
   원시 칸과 바이트 단위로 같으므로 값이 아니라 **적는 방법**만 다르다.

6. **도움말 글리프 `icon/question-circle` 을 등재했다(2026-10-07).** 2026-10-08 [Node Shell](node-shell.md) 헤더의
   `HelpButton` 칸에 꽂혀 Figma 에도 섰다(Node Shell Known deviations 12). 남은 결손은 없다 — 기록으로 남긴다.
7. **제품 잉크가 한 단 올랐다.** 제품은 헤더 액션 셋 모두를 다크 `palette-gray-400` 으로 칠한다
   (`NodeHeaderActions.tsx:50`, 제목과 같은 클래스 · 2026-09-11). 위 CSS 주석의 `palette-gray-500` 은
   그 전의 값이다. `fg-secondary` 는 라이트가 정확히 같고 다크 `palette-gray-300` 이라 어긋남의 크기만
   두 단에서 한 단으로 줄었다 — [Node Shell](node-shell.md) Known deviations 3.

## Related

- [Icon Button](icon-button.md) — 컨트롤 사다리를 타는 일반 아이콘 버튼
- [Node Chip](node-chip.md) — 같은 토큰을 쓰지만 면과 좌우 패딩을 갖는 알약
- [Node Shell](node-shell.md) — 이 버튼 묶음을 헤더에 담는 셸
