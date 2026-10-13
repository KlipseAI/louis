---
id: canvas-section
status: experimental
authority: normative
summary: 노드 캔버스에서 노드들을 한 영역으로 묶는 배경 프레임입니다.
---

# Canvas Section

노드 캔버스에서 노드들을 감싸는 배경 프레임이다(`.louis-canvas-section`, [DS-D-0093](../governance/decisions/DS-D-0093-canvas-section.md)).
Figma 의 섹션과 같은 물건이다 — 카드가 아니라 **영역**이고, 이름은 프레임 바깥 위에 얹혀 안의 노드와 겹치지 않는다. 섹션을 옮기면 안의 노드가 함께
움직인다(캔버스의 몫). 노드 카드의 겉은 [Node Shell](node-shell.md) 이고, 값 하나를 고르는 칩은 [Color Swatch](color-swatch.md) 다.

제품 정본은 `components/scenes/create/node-canvas-v2/nodes/SectionNode.tsx`(통합 판 `54b62a8aa`)다 — 프레임 `:51-68`, 크기 조절 `:70-98` · `:261-271`,
제목 바 `:100-146` · `:273-358`, 팔레트 `:148-182` · `:321-347`.

**있는 부품 셋을 그대로 받는다.** 크기 조절의 선 · 모서리 손잡이는 [Transform Frame](transform-frame.md) `Handles=corners`, 도움말 · 삭제는
[Node Chrome Button](node-chrome-button.md), 팔레트의 면은 Popover(`data-louis-scope="canvas"`, [Menu Popover](menu-popover.md)). 이 부품이 소유하는 것은
프레임 · 제목 머리 · 색 버튼 · 팔레트 격자와 칸 · 변 끌기 띠다.

```html
<!-- 캔버스 노드 래퍼 안. 폭 · 높이는 데이터 -->
<div class="louis-canvas-section" role="group" aria-label="섹션 1" data-tint="blue" data-selected="true"
     style="inline-size: 880px; block-size: 560px">
  <!-- 선택일 때만: 변 끌기 띠 넷 → Transform Frame(모서리 넷) -->
  <span class="louis-canvas-section__edge" data-edge="top" aria-hidden="true"></span>
  <span class="louis-canvas-section__edge" data-edge="right" aria-hidden="true"></span>
  <span class="louis-canvas-section__edge" data-edge="bottom" aria-hidden="true"></span>
  <span class="louis-canvas-section__edge" data-edge="left" aria-hidden="true"></span>
  <div class="louis-transform-frame" aria-hidden="true">
    <span class="louis-transform-frame__handle" data-position="nw"></span>
    <span class="louis-transform-frame__handle" data-position="ne"></span>
    <span class="louis-transform-frame__handle" data-position="se"></span>
    <span class="louis-transform-frame__handle" data-position="sw"></span>
  </div>

  <!-- 제목 머리 — 마지막 자식이라 띠 위에 칠해진다 -->
  <div class="louis-canvas-section__header">
    <div class="louis-canvas-section__title-bar">
      <button type="button" class="louis-canvas-section__title" title="섹션 이름 바꾸기"
              aria-description="Enter 로 이름 바꾸기">섹션 1</button>
      <!-- 편집 중에는 위 버튼 대신:
      <input type="text" class="louis-canvas-section__title-input" value="섹션 1" aria-label="섹션 이름 바꾸기"> -->
      <button type="button" class="louis-canvas-section__color-button" aria-label="섹션 색" title="섹션 색"
              aria-expanded="false" aria-controls="section-1-palette">
        <span class="louis-canvas-section__color-swatch" aria-hidden="true"></span>
      </button>
    </div>
    <div class="louis-canvas-section__actions">
      <button type="button" class="louis-node-chrome-button" aria-label="섹션 도움말">…</button>
      <button type="button" class="louis-node-chrome-button" data-tone="danger" aria-label="섹션 삭제">…</button>
    </div>
  </div>
</div>

<!-- 팔레트 — 오버레이 층(포털)에 띄우고 색 버튼 아래 6 에 붙인다 -->
<div class="louis-popover" data-louis-scope="canvas" id="section-1-palette">
  <div class="louis-canvas-section__palette" role="radiogroup" aria-label="섹션 색">
    <button type="button" role="radio" class="louis-canvas-section__tint-option" data-tint="red" aria-checked="false" aria-label="빨강" tabindex="-1"></button>
    <button type="button" role="radio" class="louis-canvas-section__tint-option" data-tint="yellow" aria-checked="false" aria-label="노랑" tabindex="-1"></button>
    <button type="button" role="radio" class="louis-canvas-section__tint-option" data-tint="green" aria-checked="false" aria-label="초록" tabindex="-1"></button>
    <button type="button" role="radio" class="louis-canvas-section__tint-option" data-tint="blue" aria-checked="true" aria-label="파랑" tabindex="0"></button>
    <button type="button" role="radio" class="louis-canvas-section__tint-option" data-tint="violet" aria-checked="false" aria-label="보라" tabindex="-1"></button>
    <button type="button" role="radio" class="louis-canvas-section__tint-option" data-tint="pink" aria-checked="false" aria-label="분홍" tabindex="-1"></button>
    <button type="button" role="radio" class="louis-canvas-section__tint-option" data-tint="none" aria-checked="false" aria-label="색 없음" tabindex="-1"></button>
  </div>
</div>
```

계산값: 제목 머리 높이 32(액션 32 · 바 25, 아래 맞춤) · 프레임 위 6. 팔레트 격자 176 × 20(7 × 20 + 6 × 6, 한 줄), Popover 안쪽 6 을 더하면 188 × 32.

## Availability

| Surface       | 상태           | 근거 |
| ------------- | -------------- | ---- |
| Web           | `partial`      | CSS recipe `packages/css/src/component/canvas-section.css` · 실브라우저 시험 `canvas-section.browser.test.tsx`. React 표면은 없다 — 끌기 · 크기 조절 · 소속 계산은 캔버스 몫이고 소비처가 클래스와 마크업 계약을 문다(DS-D-0093) |
| Figma         | `partial`      | 2026-10-14 — `CanvasSection` 세트(Selected `false` · `true` — 코드 `data-selected`, 880 × 560 은 제품 기본 크기 표본, 머리는 루트 세로 쌓기의 사이 6 으로 그렸다, Selected=true 는 `TransformFrame` Handles=corners 인스턴스), 제목 바 `CanvasSectionTitleBar`(State `Default` · `Hover`, TEXT `Name`), 색 버튼 `CanvasSectionColorButton`(State × Placeholder — 색조 없음), 팔레트 칸 `CanvasSectionTintOption`(Selected — 코드 `aria-checked`, BOOLEAN `Clear` — 색 없음 빗금), 팔레트 `CanvasSectionPalette`(캔버스 메뉴 면 · 칸 일곱 시드). 액션은 `NodeChromeButton` 인스턴스 둘. 색조는 축이 아니다 — 인스턴스에서 칠을 변수 `color/canvas-section-tint-*` 16% 로 바꾼다. 보이지 않는 변 띠 · 칸 호버 1.08 배는 그리지 않는다. 기록 `canvas-section` · `-title-bar` · `-color-button` · `-tint-option` · `-palette` 와 parity 기하 계약, 실브라우저 되재기(`canvas-section-geometry.browser.test.tsx`). 제품 렌더 대조는 없다 |
| Documentation | `done`         | 이 문서 |
| Maturity      | `experimental` | 제품이 아직 이 클래스를 물지 않는다 |

## When to use

- 캔버스 위 노드 여럿을 한 영역으로 묶어 이름을 붙이고 함께 옮길 때.
- 노드 하나의 겉(입력 · 결과 카드)은 [Node Shell](node-shell.md) 이다. 캔버스 바닥의 정렬 안내선은 [Canvas Guide](canvas-guide.md) 다.

## Anatomy

1. 프레임(루트) — 전경 4% 면 또는 색조 16%, 안쪽 경계 1px 40%(선택 2px 88%), 반경 16.
2. 변 끌기 띠(`__edge`) 넷 + Transform Frame `Handles=corners` — 선택일 때만. 띠는 보이지 않는 16 폭이고 변 가운데에 걸친다.
3. 제목 머리(`__header`) — 프레임 바깥 위 6, 한 줄.
4. 제목 바(`__title-bar`) — 이름(`__title`, `<button>`) 또는 이름 입력(`__title-input`), 색 버튼(`__color-button` · `__color-swatch`).
5. 액션(`__actions`) — Node Chrome Button 도움말 · 삭제. 머리 오른쪽 끝.
6. 팔레트(`__palette` · `__tint-option`) — Popover(캔버스 면) 안, 오버레이 층.

## Properties

| 속성 | 값 | 뜻 |
| --- | --- | --- |
| 루트 `data-tint` | `red` · `yellow` · `green` · `blue` · `violet` · `pink` · (없음) | 면 · 견본의 색조 — 시맨틱 `color-canvas-section-tint-*` 의 16% |
| 루트 `data-selected` | `true` | 선택 — 안쪽 경계 2px 88%. 크기 조절 크롬(띠 · Transform Frame)을 소비처가 그린다 |
| 루트 인라인 `inline-size` · `block-size` | 길이 | 데이터. 기본 880 × 560, 최소 240 × 160 은 캔버스가 지킨다 |
| 칸 `data-tint` | 여섯 + `none` | 칸의 색조. `none` 은 빗금(위험색 80% 2px) |
| 칸 `aria-checked` | `true` | 지금 색조 — 면색 1px 틈 + `accent-primary` 2px 고리 |

색조 여섯은 LOUIS 원시에 있는 색상만이다(DS-D-0093 판정 1). 제품 열셋은 읽을 때 가장 가까운 색상으로 옮긴다 — red → red · orange · amber · yellow → yellow ·
lime · green · teal → green · cyan · blue → blue · indigo · violet · purple → violet · pink → pink.

## States

| 상태 | 그림 |
| --- | --- |
| 쉼 | 면 + 경계 1px 40% |
| 선택 | 경계 2px 88%, 변 띠 · 모서리 손잡이 |
| 끄는 중 | 커서 `grabbing` |
| 제목 바 호버 | 면 12%, 글 `fg-primary` |
| 이름 바꾸는 중 | 제목 자리에 입력(80 ~ 240) |
| 색 버튼 호버 | 면 16% |
| 팔레트 열림 | 색 버튼 `aria-expanded="true"` — 버튼 모양은 그대로 |
| 칸 호버 · 고름 | 1.08 배 · 강조 2px 고리 + 면색 1px 틈 |

## Content

- 이름은 한 줄 — 넘치면 말줄임, 전체 이름은 `title` 로. 빈 이름은 「섹션」 기본 문구.
- 색조 이름은 색 이름으로 읽힌다(빨강 · 노랑 · 초록 · 파랑 · 보라 · 분홍 · 색 없음). 값 문자열을 접근 이름으로 쓰지 않는다.

## Accessibility

- 루트는 `role="group"` + 이름. 프레임 본문 끌기는 포인터 조작이다 — 키보드 이동은 캔버스 전체의 계약을 따른다.
- 이름 바꾸기: 제목은 `<button>` — 더블클릭 또는 포커스 뒤 Enter · F2 로 입력이 선다. 입력은 Enter 확정 · Escape 취소 · 포커스가 떠나면 확정.
  확정 · 취소 뒤 포커스는 제목 버튼으로 돌아온다.
- 색 버튼: `aria-expanded` + `aria-controls`. `aria-haspopup` 을 두지 않는다 — 열리는 것은 메뉴가 아니라 라디오 묶음이다.
- 팔레트: `role="radiogroup"`, 칸은 `role="radio"` + `aria-checked`, 탭 정지 하나(고른 칸). ←/→ 한 칸(끝에서 돈다), Home/End 처음 · 끝, Enter · Space 로 고르고 닫는다.
  Escape · 바깥 누름은 닫고 포커스를 색 버튼으로 돌린다.
- 포커스 링은 그리지 않는다(DS-D-0074).
- 강제 색 모드 — 안쪽 그림자가 지워지므로 프레임 · 견본 · 칸의 경계를 outline 으로 되살린다. 칸은 색 자체가 선택지라 강제 치환을 막는다.

## Acceptance tests

`packages/react/test/canvas-section.browser.test.tsx` 가 클래스 마크업을 실브라우저로 렌더해 잰다. `packages/react/test/canvas-section-geometry.browser.test.tsx` 는 기록 `figma/components.measured.json` 의 `canvas-section` 다섯 기록을 코드가 만드는지 되잰다.

1. 프레임 — 반경 16 · 쉼 경계 inset 1px `gray-000-alpha-40` · 선택 2px `gray-000-alpha-88` · 면 `gray-000-alpha-04`, 색조면 그 색의 16%.
2. 제목 머리 — 아래 끝이 프레임 윗변 위 6, 바 높이 25 · 여백 2/6/2/8 · 반경 8 · 사이 6, 긴 이름이 액션과 겹치지 않고 말줄임된다.
3. 색 버튼 20 · 반경 6 · 견본 12 · 반경 4, 견본 테두리 `stroke-strong`.
4. 팔레트 — 7 열 × 20 · 사이 6, 칸 20 · 반경 6 · 테두리 `stroke-strong`, 고른 칸 2px `accent-primary` 고리, `none` 칸 빗금.
5. 변 띠 16 이 변 가운데에 걸치고, Transform Frame 이 프레임을 꽉 채우며 몸통은 누름을 통과시킨다.
6. 호버 규칙은 모두 `@media (hover: hover)` 안이다.
7. 대비는 실제로 잰다 — 제목 72% on 바 8% · 호버 `fg-primary` 4.5 이상, 쉼 경계(색조 없음 · 여섯) · 견본 테두리 · 칸 테두리 3 이상, 두 테마.

## Known deviations

1. 섹션 크기 조절은 끌기뿐이다(WCAG 2.5.7) — 한 번 누름 대안이 없다. 캔버스 노드 전체의 빚이라 여기서 열지 않는다.
2. 모서리 손잡이는 Transform Frame 의 12 원이다 — 제품 8 정사각 · 반경 2 · 그림자는 옮기지 않았다(DS-D-0093 판정 4).
3. 제목 바 전환 160ms(`motion-control-hover`) — 제품 140ms.
4. 호버는 `@media (hover: hover)` 안이다 — 제품은 가드 없는 `[&:hover]` 로 원본을 옮겼다(`components/scenes/create/node-canvas-v2/nodes/SectionNode.tsx:37-38`).
5. 색조 면(16%)은 캔버스 대비 1.09~1.35 인 장식이다 — 섹션의 범위는 경계(40%)가 말한다.
6. **고쳐 올린 값**(DS-D-0084 3항) — 쉼 경계 12% → 40%(라이트 1.38 → 3.03 · 다크 1.47 → 4.02), 견본 테두리 40% → `stroke-strong`(라이트 2.74 → 3.48),
   칸 테두리 12% → `stroke-strong`(1.32 → 4.62), 칸 접근 이름 rgba 문자열 → 색 이름, 액션 잉크 72% 덮기 → Node Chrome Button 기본.

## 제품에서 발견한 것

- 팔레트가 섹션의 쌓임 맥락(`zIndex: -1001`, `components/scenes/create/node-canvas-v2/index.tsx:955-961`) 안에 떠서 섹션 안 노드 밑에 깔린다(코드로 추론).
  오버레이 층으로 띄워야 한다.
- 팔레트 칸의 접근 이름이 rgba 문자열이다(`components/scenes/create/node-canvas-v2/nodes/SectionNode.tsx:333`).
- 이름 바꾸기가 더블클릭으로만 열린다(`components/scenes/create/node-canvas-v2/nodes/SectionNode.tsx:287-296`).
- 긴 이름이 도움말 · 삭제 버튼을 덮는다 — 제목 바(`max-w-full`)와 액션이 각자 `absolute` 다(`components/scenes/create/node-canvas-v2/nodes/SectionNode.tsx:102-103` · `:128`).
- 색 버튼이 `aria-haspopup="true"`(메뉴)인데 열리는 것은 메뉴가 아니다(`components/scenes/create/node-canvas-v2/nodes/SectionNode.tsx:309`).
- 썸네일 재현(`components/scenes/create/node-canvas-v2/lib/archiveThumbnail/drawNodes.ts:1714-1788`)이 라이브와 세 군데 다르다 — 다크 경계 색(241 대 220),
  바 높이(24 대 25), 견본 테두리(빈 때만 대 늘).
