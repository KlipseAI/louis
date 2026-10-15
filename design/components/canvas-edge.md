---
id: canvas-edge
status: experimental
authority: normative
summary: 캔버스에서 두 핸들을 잇는 연결선과, 호버하면 선 한가운데 뜨는 삭제 버튼입니다. 채널 톤 일곱이 이 컴포넌트의 내용입니다.
---

# Canvas Edge

캔버스의 **연결선**. 실선 한 겹 위에 흐르는 쉬머 한 겹이 얹히고, 쉬머에는 톤마다 반경이
다른 번짐이 걸린다. 선을 호버하면 한가운데 붉은 **삭제 버튼**이 뜬다.

**정본은 제품이고, LOUIS 레시피가 그 정적인 넷을 옮긴다(2026-10-14, [DS-D-0100](../governance/decisions/DS-D-0100-canvas-edge-recipe.md) — DS-D-0061 재판정).**
`packages/css/src/component/canvas-edge.css` 가 실선(두께 2 · 둥근 끝 · 톤마다 채널 토큰) · hover 의 흰 잉크 · 투명 히트 영역 ·
삭제 버튼을 갖는다. **쉬머 한 겹(그라디언트 좌표 · SMIL 주기 · 하이라이트 · 번짐)은 여전히 제품 `V2EdgeLayers.tsx` 의 톤 표가 갖는다**
— 아래 「레시피가 갖는 것과 갖지 않는 것」. 톤 어휘의 **실행 가능한 SSOT** 는 같은 폴더의 `lib/edgeTone.ts` 다. 그 파일이
「핸들 id → 채널」을 정하고, 핸들 원반의 색과 거기 꽂힌 전선의 색이 같다는 불변식을 유지한다.

```html
<g class="louis-canvas-edge" data-tone="image" data-hovered="false">
  <path class="louis-canvas-edge__base" d="…"/>
  <path class="louis-canvas-edge__shimmer" d="…" stroke="url(#…)"/>  <!-- 쉬머 페인트는 제품 JS -->
</g>
<path class="louis-canvas-edge__hit" d="…"/>
<div class="louis-canvas-edge__label" data-visible="false" style="transform: translate(-50%, -50%) translate(Xpx, Ypx)">
  <button type="button" class="louis-canvas-edge__delete" aria-label="연결 삭제">
    <svg class="louis-canvas-edge__delete-glyph" viewBox="0 0 8 8" aria-hidden="true"><path d="M1 1l6 6M7 1L1 7"/></svg>
  </button>
</div>
```

**video 채널은 없다.** 비디오는 매체이지 채널이 아니다 — 편집 입력에 도착한 비디오는 edit
채널이고, 퍼블리시 노드로 나가는 비디오는 youtube·instagram 채널이다. 새 톤을 만들고 싶어지면
먼저 `edgeTone.ts` 의 그 주석을 읽어라. 원반만 새 색이 되고 전선은 그대로 남아 불변식이 깨진다.

## Availability

| Surface | 상태 | 근거 |
| --- | --- | --- |
| Web | `partial` | CSS recipe `packages/css/src/component/canvas-edge.css`(실선 · hover 잉크 · 히트 영역 · 라벨 · 삭제 버튼, DS-D-0100). React 표면은 없다 — 경로와 좌표는 React Flow 의 데이터다. 쉬머 한 겹은 제품 JS 에 남는다. 실브라우저 시험 `canvas-edge-recipe.browser.test.tsx` |
| Figma | `done` | `CanvasEdge` 14 variant(`Tone` × `State`)와 `CanvasEdgeDelete` 2 variant(`State`). `CanvasEdge` 의 `State=Hover` 칸이 선 한가운데 `CanvasEdgeDelete` 인스턴스 `Delete` 를 품는다 — 제품 `DeletableEdge` 의 투영이다. 그린 것은 **실선과 삭제 버튼**이고 쉬머와 번짐은 아래 「Figma 가 담지 못하는 것」. 세트 · parity 계약 · 기하 실측(`canvas-edge` · `canvas-edge-delete`) · 레시피 되재기가 DS-D-0035 를 채운다(2026-10-14) |
| Documentation | `done` | 이 문서 |
| Maturity | `experimental` | 쉬머 · 번짐이 Figma 에 없고 제품 렌더 대조(`$noProductRender`)가 없다. 아래 Accessibility 의 결손 하나(색만으로 채널)가 남았다 |

## When to use

- 캔버스에서 두 핸들을 잇는 선을 그릴 때. 캔버스의 **모든** 연결선이 이것이다 —
  `DeletableEdge` 가 React Flow 의 엣지 타입으로 등록돼 있고, 드래그 중 미리보기 선
  (`PreviewConnectionLine`)과 워크스루 연결 시연도 같은 조형을 쓴다.
- 쓰지 않는 자리:
  - **일반 구분선** — [Pane Divider](./pane-divider.md) 이거나 메뉴 구분자다. 저쪽은 미는 것이고
    이쪽은 잇는 것이다.
  - **정렬 스냅 가이드** — [Canvas Guide](./canvas-guide.md).

## Anatomy

1. **Base** — 실선. 두께 2, 끝은 둥글다. 색이 채널을 말한다.
2. **Shimmer** — 같은 경로 위에 겹치는 두 번째 획. 채널 램프의 밝은 칸을 심으로 하는
   좁은 그라디언트가 선을 따라 무한히 흐른다.
3. **Glow** — 쉬머에 걸리는 번짐. 반경이 톤마다 다르다.
4. **히트 영역** — 그 위에 겹치는 투명 획. 보이는 선이 2 라 그것만으로는 잡히지 않는다.
   트랙은 얇고 히트 영역은 넓다 — [Pane Divider](./pane-divider.md) 와 같은 문법이다.
5. **삭제 버튼** — 호버할 때 선 한가운데에 뜬다. 20 원 · 테두리 1 · 붉은 면 · 흰 X 8 · 그림자. 아래 「삭제 버튼」.

## Tone — 이 컴포넌트의 내용

| Tone | 실선 | 쉬머 하이라이트 | hover |
| --- | --- | --- | --- |
| `default` | `color-canvas-edge-default`(라이트 palette-gray-500 · 다크 palette-gray-000) | 베이스와 같은 색 | 바뀌지 않는다 |
| `image` | `color-node-handle-icon-image` | `color-green-200` | 바뀌지 않는다 |
| `text` | `color-node-handle-icon-text` | `color-yellow-200` | 바뀌지 않는다 |
| `youtube` | `color-node-handle-icon-youtube` | `color-red-200` | 흰 잉크 한 겹 |
| `instagram` | `color-node-handle-icon-instagram` | `color-red-200` | 흰 잉크 한 겹 |
| `edit` | `color-node-handle-icon-edit` | `color-violet-200` | 흰 잉크 한 겹 |
| `audio` | `color-node-handle-icon-audio` | `color-pink-200` | 흰 잉크 한 겹 |

**실선을 채널 토큰으로 정한 것이 이 회차의 판정이다.** 제품 `V2EdgeLayers` 는 accent 램프를
직접 읽고, 같은 채널의 핸들 원반은 채널 토큰을 읽는다. 두 곳이 지금은 같은 값으로 끝나지만
참조가 갈려 있어 한쪽만 움직이면 조용히 어긋난다. 정본을 채널 토큰 쪽으로 두면
`edgeTone.ts` 가 지키려는 불변식(원반 색 = 전선 색)을 토큰이 대신 지킨다.

**쉬머 하이라이트를 채널 램프의 200 칸으로 정한 것도 판정이다.** 여섯 톤 중 edit·audio 두 톤은
제품 리터럴이 이미 그 칸과 바이트로 같다. image·text·youtube 세 톤만 램프 밖 리터럴이다. 규칙이
이미 두 번 맞은 자리라, 새 색을 셋 만드는 대신 램프를 정본으로 삼고 세 리터럴을 어긋남으로
적었다.

**hover 는 색을 갈아 끼우지 않는다.** 레시피는 `color-mix(채널 88%, color-canvas-edge-hover-ink)` 이고 Figma 는 획 위에
`color-static-white-alpha-12` 를 한 겹 얹는다 — 합성 결과가 제품의 `color-mix` 와 같다. **일곱 톤 중 넷만 그렇게 한다.** default·image·text 는
제품이 hover 에서 색을 바꾸지 않고, 왜 그 셋만 예외인지는 코드에 적혀 있지 않다. 접지 않고
기록에 `null` 로 적어 그 사실을 고정했다.

## Figma 가 담지 못하는 것

**흐르는 쉬머.** 그라디언트를 무한 반복으로 이동시키는 애니메이션이다. Skeleton 이 스윕을 담지
못하는 것과 같은 한계이며, 정지 상태로 접어 그리면 「멈춘 그라디언트」라는 없는 상태를 정본으로
만든다. 그래서 Figma 변형에는 실선만 있다.

**번짐(glow).** 반경이 톤마다 다른데(밝은 채널이 덜 번지고 짙은 채널이 더 번진다) 되읽기의
effect 역할은 자손 이름 하나에 값 하나다. 한 값으로 적으면 일곱 톤 중 여섯을 거짓으로 고정하므로
Figma 에 두지 않았고 계약도 비웠다. 값은 `figma/components.measured.json` 의
`canvas-edge.$glowNote` 가 갖는다.

**삭제 버튼의 호버 확대 · 누름.** `scale(1.12)` · `scale(0.94)` 는 크기가 아니라 동작이라 `CanvasEdgeDelete` 의 칸을 열지 않았다
(Node Chrome Button 의 Active 와 같은 판정). 면 · 테두리 · 잉크가 진해지는 것은 `State=Hover` 가 담는다.

## 삭제 버튼

선을 호버하면(히트 영역이나 버튼 위) 선 한가운데 뜨는 20 원형 버튼이다. **Canvas Edge 의 부품이다** — 소비처가 이 선 하나뿐이고
[Icon Button](./icon-button.md) 의 사다리 밖(20 · 붉은 면 · 그림자)이라 흡수하지 않았다(DS-D-0100).

| 칸 | 쉼 | 호버 | 토큰 |
| --- | --- | --- | --- |
| 면 | red-600 88% | red-600 | `color-canvas-edge-delete-surface` · `-surface-hover` |
| 테두리 1 | red-600 56% | red-600 80% | `color-canvas-edge-delete-stroke` · `-stroke-hover` |
| 글리프 X 8(획 1.6) | 흰 88% | 흰 | `color-canvas-edge-delete-ink` · `color-fg-on-danger` |
| 그림자 | 0 2 8 순검정 40% | 같음 | `color-canvas-edge-delete-shadow` |
| 크기 | 1 | 1.12(`@media (hover: hover)` 안) · 누름 0.94 | 동작 — Figma 칸 없음 |

**기본이 이미 붉다** — 연결선의 파괴적 동작임을 항상 말한다(제품 주석). 라벨 감싸개(`__label`)는 숨김에서 포인터를 통과시켜 선
전체에서 호버가 잡히게 하고, 캔버스가 `data-visible="true"` 를 걸면 보인다. **키보드로 포커스가 들어와도 보인다**(`:focus-within`) —
제품은 호버로만 띄워 포인터 없이는 연결을 지울 길이 없었다. 포커스 링은 `elevation-focus-ring` 이다. 제품이 연결을 지울 수 없게
막은 선(`undeletable`)과 드래그 중 미리보기 선은 버튼이 없다 — 소비처가 감싸개를 그리지 않는다.

## 레시피가 갖는 것과 갖지 않는 것 — 판정 (DS-D-0100)

**2026-09-09 의 판정(DS-D-0061)은 「레시피를 세우지 않는다」였다.** 근거는 둘이었다 — 쉬머의 페인트가 인스턴스 기하이고
(`gradientUnits="userSpaceOnUse"` 인 `<linearGradient>` 의 좌표 넷이 두 핸들의 런타임 좌표에서 나온다), 주기 1.45초가 SMIL
`<animateTransform>` 의 `dur` 이라 그것을 정하는 CSS property 가 없다. 그래서 레시피는 한 표를 CSS 와 JS 두 집에 살게 한다.

**2026-10-14 [DS-D-0100](../governance/decisions/DS-D-0100-canvas-edge-recipe.md) 이 다시 판정했다.** 그 두 근거는 **쉬머 한 겹에 대해서만 참이다.** 실선 · hover 잉크 · 히트 영역 ·
삭제 버튼은 CSS 가 온전히 담고 제품도 이미 클래스 상수와 SVG 속성으로 갖는다 — 「여덟 번째 사본」 우려는 쉬머 표에 대한
것이었고 이 넷에는 해당하지 않는다. DS-D-0084(제품의 모든 UI 는 LOUIS 부품)가 그 넷을 부품으로 올린다.

| 레시피(LOUIS)가 갖는다 | 제품 JS 톤 표가 갖는다 |
| --- | --- |
| 실선의 색(채널 토큰) · 두께 2 · 둥근 끝 | 쉬머 그라디언트의 좌표 · 이동(SMIL 1.45초) |
| hover 의 흰 잉크(넷만) | 쉬머 하이라이트 stop 색 · 불투명도(0.78 → 0.95) |
| 투명 히트 영역 44 | 번짐(톤마다 반경이 다른 drop-shadow) |
| 라벨 감싸개 · 삭제 버튼 | 쉬머를 끄는 엣지 수(20) |

### 게이트가 이 사실을 안다

`figma/components.measured.json` 의 `$noRecipe` 명부에서 canvas-edge 가 빠졌고(명부는 비었지만 장치는 남는다 — 다음 판정이
여기 들어온다), `scripts/verify-recipe-record.mjs` 의 레시피 표에 `canvas-edge-delete` 가 올라 삭제 버튼의 폭 · 높이 · 글리프 ·
면 선언이 기록과 대조된다. `verify-gates` 의 명부 카나리아 둘은 판정을 지어 넣어 장치가 살아 있음을 증명한다.

### 닫지 않은 것

**LOUIS 가 쉬머 톤 표를 TS export 로 소유하는 길**은 남아 있다. 그러면 제품의 사본 일곱이 하나로 접히고 아래 「사본 넷의 어긋남」이
구조적으로 사라진다. 오늘 하지 않는 이유는 하나다 — **소비처가 없다.** 수요가 서면 Decision 으로 연다.

## 손으로 복제된 사본 일곱 벌

제품 앵커에서 이 조형은 일곱 자리에 있다 — `V2EdgeLayers` 를 부르는 셋(엣지 타입 등록 ·
`DeletableEdge` · `PreviewConnectionLine`)과, 「V2EdgeLayers 와 동일」이라 주석을 달고 값을
베낀 워크스루 연결 오버레이 네 파일이다.

**네 사본은 원본과 세 자리에서 이미 어긋나 있다.**

| 축 | 정본 | 사본 넷 |
| --- | --- | --- |
| 쉬머 주기 | 1.45초 | 1.85초 |
| 번짐 색 | 톤마다 다르다 | 톤과 무관하게 노랑 계열 하나 |
| image 하이라이트 | 램프 밖 리터럴 하나 | **또 다른** 리터럴 |

주석으로 「동일」이라 적은 것이 동일함을 지켜 주지 않는다는 증거다. 정본을 세우는 일의 값은
여기에 있다.

## 이 문서가 다루지 않는 것

**바닥의 점 격자.** 간격 24 · 점 2 이고 색은 `color-canvas-dot` 이 이미 갖는다.
컴포넌트가 아니라 **패턴 채움**이라 component set 으로 세우지 않는다. 그 변수의 라이트 값은
2026-10-08 에 제품과 맞췄다 — `palette-gray-600` 28%(원시 `palette-gray-600-alpha/28` 신설), 다크는 그대로
`static-white-alpha/16` 이다. 근거는 제품 통합 판 `54b62a8aa` `node-canvas-v2/index.tsx:536`
([DS-D-0082](../governance/decisions/DS-D-0082-canvas-semantics-and-product-ink-alpha.md)).

**정렬 스냅 가이드.** [Canvas Guide](./canvas-guide.md)가 갖는다(2026-10-13, DS-D-0084). 제품의 이름 없는 리터럴
`#ff2d55` 를 새 원시로 세우지 않고 시맨틱 `color-canvas-guide`(라이트 `pink-600` · 다크 `pink-500`)로 접었다. 전선은 캔버스 두께를
따르는 그림이고 스냅 선은 줌과 무관하게 화면 1px 인 계기라 부품을 나눴다.

## Properties

정본은 제품 `V2EdgeLayers` 의 prop 이다. 좌표 넷은 두 핸들이 정하는 **데이터**이므로 Figma 축이
되지 않는다.

| prop | 값 | 기본 | 뜻 |
| --- | --- | --- | --- |
| `edgeTone` | 채널 일곱 중 하나 | `default` | 실선·쉬머·번짐의 색을 함께 정한다 |
| `edgePath` | SVG path | 없음 | React Flow 가 두 핸들에서 만든 베지에 |
| `sourceX`/`sourceY`/`targetX`/`targetY` | 수 | 없음 | 쉬머 그라디언트의 이동 축을 정한다 |
| `hovered` | boolean | `false` | 실선 색과 쉬머 한가운데 stop 의 불투명도를 올린다 |
| `strokeWidth` | 수 | 2 | 흐름 좌표계 두께. 변환 밖에서 그릴 때만 줌을 곱해 넘긴다 |
| `shimmerEnabled` | boolean | `true` | 끄면 실선만 남는다. 성능 스위치다 |

| Figma | 타입 | 코드 대응 |
| --- | --- | --- |
| `Tone` | variant 7 | `edgeTone` |
| `State` | variant 2 | `hovered` |

`edgePath` 와 좌표 넷은 Figma 에 대응이 없다. 변형이 그리는 곡선은 시편이며 프레임 좌우에 8 씩
여백을 남겨 획이 프레임 밖으로 새지 않게 잡아 둔 것이다.

## States

| 상태 | 무엇이 바뀌나 |
| --- | --- |
| Default | 채널 색 실선. 쉬머 한가운데 stop 이 낮은 값 |
| Hover | 네 톤은 획 위에 흰 잉크 한 겹이 얹히고, **일곱 톤 모두** 쉬머 한가운데 stop 이 올라간다 |
| Preview(연결 드래그 중) | 같은 레이어를 그대로 쓴다. 톤은 도착 핸들이, 없으면 출발 핸들이 정한다 |
| Invalid(꽂을 수 없는 자리) | 선 자체는 그대로고 감싸는 그룹이 흐려지며 채도가 낮아진다 |
| Shimmer off | 캔버스의 엣지가 많아지면 쉬머가 통째로 꺼지고 실선만 남는다 |

**Figma 에 있는 것은 앞의 둘뿐이다.** 뒤의 셋은 엣지가 아니라 엣지를 감싸는 층이 바꾸는 것이라
이 component set 의 축이 아니다.

## Content

- **보이는 글자가 없다.** 선 하나이며 라벨도 툴팁도 붙지 않는다.
- 호버할 때 뜨는 삭제 버튼만 문구를 갖는다 — 보이지 않는 `aria-label`(「연결 삭제」). 제품에서 i18n 메시지
  (`edgeDeleteAria`)로 실린다. 툴팁은 없다.

## Accessibility

- **연결선은 보조기술에 노출되지 않는다.** 그림이고, 뜻은 두 노드가 갖는다.
- **색만으로 채널을 말한다.** 일곱 톤을 가르는 것이 색뿐이라 색각 이상에서 image 와 audio 를
  구분할 단서가 없다 — SC 1.4.1 결손이다. 채널을 형태(파선 · 굵기)나 라벨로도 말하는 방법은
  아직 정해지지 않았다. **레시피가 채울 칸이 아니다**(위 판정) — 채널을 색 말고 무엇으로도
  말하려면 조형 자체가 바뀌어야 하고, 그것은 제품 `V2EdgeLayers` 와 Figma 변형을 함께
  움직이는 일이다.
- **키보드.** 레시피의 라벨 감싸개는 포커스가 들어오면 보이고(`:focus-within`) 버튼은 `elevation-focus-ring` 을 두른다
  (DS-D-0100) — 제품은 호버로만 띄워 포인터 없이는 연결을 지울 길이 없었다(SC 2.1.1 · 2.4.7). 버튼이 탭 순서에 들어오는지는
  소비처(React Flow 의 라벨 렌더러)가 정한다 — 숨김은 `opacity` 라 탭 순서를 막지 않는다.
- **대비.** 채널 없는 실선은 라이트 캔버스 위 4.16:1(제품 1.03:1 을 고쳐 올렸다) · 다크 그대로이고, 삭제 글리프는 붉은 면 위에서
  두 테마 다 3:1 을 넘는다 — `canvas-edge-recipe.browser.test.tsx` 가 잰다.
- 쉬머는 무한 반복 애니메이션이다. `prefers-reduced-motion` 분기가 **없다** — 제품은 엣지 수로만
  끈다. SC 2.3.3 결손이다. 쉬머는 레시피 밖이라 이 결손은 제품 JS 의 몫이다. 레시피의 전이(실선 · 라벨 · 버튼)는 그 분기를 갖는다.

## Acceptance tests

`packages/react/test/canvas-edge-recipe.browser.test.tsx` 가 레시피에서 잰다 — 실선의 두께 · 둥근 끝 · 톤마다 채널 토큰,
hover 의 흰 잉크가 넷에서만 `hoverLiftAlpha` 만큼 섞이는 것, 히트 영역 44, 채널 없는 실선의 두 테마 대비, 삭제 버튼의 기하(기록
`canvas-edge-delete` 의 State 키마다) · 면 · 테두리 · 잉크 · 그림자 · 호버 규칙의 토큰과 가드, 글리프 대비, 라벨의 포커스 노출.
`packages/react/test/canvas-edge.browser.test.tsx` 는 states 표가 부르는 이름(쉬머 하이라이트의 200 칸 포함)을 계속 잰다.

1. 실선 두께가 2 이고 정렬이 `CENTER` 이며 끝이 둥글다.
2. `Tone` 일곱 칸의 실선이 각각 그 채널 토큰을 문다 — accent 램프를 직접 읽지 않는다.
3. `State=Hover` 가 네 톤에서 흰 잉크 한 겹을 더하고, 나머지 세 톤에서는 아무 색도 바꾸지 않는다.
4. 쉬머 하이라이트가 채널 램프의 200 칸이다.
5. 쉬머 주기가 한 값이다 — 사본마다 다르지 않다. **(제품 JS — 레시피 밖)**
6. 번짐 반경이 톤 표 그대로다. **(제품 JS — 레시피 밖)**
7. 히트 영역이 보이는 선보다 넓다.
8. Figma 되읽기에서 raw fill · raw stroke 가 각각 0 이다.
9. 삭제 버튼이 20 원 · 테두리 1 · 글리프 8 이고 기본이 붉다. 호버는 `@media (hover: hover)` 안이다.
10. 라벨이 숨김에서 포인터를 통과시키고 포커스가 들어오면 보인다.

1 · 2 · 3 · 7 · 9 · 10 은 레시피 시험이, 2 · 3 · 4 는 표 시험이, 1 · 8 · 9 의 Figma 쪽은 `verify-figma-parity` 가 잰다. 5 · 6 은
제품 쪽 탐침이 서야 열린다(`$noProductRender`).

## Known deviations

1. 제품이 실선 색을 accent 램프에서 직접 읽는다. 정본은 채널 토큰이다(위 Tone 절). 레시피는 채널 토큰을 읽는다.
2. image·text·youtube 세 톤의 쉬머 하이라이트가 램프 밖 리터럴이다.
3. 워크스루 오버레이 네 벌이 주기·번짐·하이라이트에서 정본과 갈린다.
4. hover 가 일곱 톤 중 넷에서만 색을 바꾼다. 의도인지 흘러온 것인지 코드에 근거가 없다.
5. `instagram` 은 별 채널인데 지금 `youtube` 와 같은 값으로 끝난다. 축은 접지 않았다.
6. **채널 없는 실선이 라이트에서 제품과 다르다(DS-D-0100).** 제품은 두 테마 다 palette-gray-000 이라 라이트 캔버스 위에서
   1.03:1 로 사라진다. 레시피와 Figma 는 `color-canvas-edge-default`(라이트 palette-gray-500)를 읽는다 — 과거 부채를 고쳐 올렸다.
7. **삭제 버튼의 호버 가드 · 포커스가 제품과 다르다(DS-D-0100).** 제품은 가드 없는 `:hover` 이고 포커스 표시도 키보드 노출도
   없다. 레시피는 `@media (hover: hover)` · `:focus-within` · 포커스 링을 갖는다.
