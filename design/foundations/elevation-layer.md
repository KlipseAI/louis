---
id: foundation-elevation-layer
status: experimental
authority: normative
---

# Elevation & Layer

Elevation은 surface의 시각적 깊이이고 Layer는 interaction과 stacking 순서다. 그림자가 크다는 이유로 더
높은 z-index를 갖지 않으며 두 체계를 별도 token family로 유지한다. P2 source와 projection은 로컬
release-candidate이며 public package와 제품 adoption은 아직 `not-ready`다.

## Source and artifacts

| 구분           | 계약 경로                                     | 현재 상태               |
| -------------- | --------------------------------------------- | ----------------------- |
| DTCG source    | `packages/tokens/src/klipse.tokens.json`      | local release-candidate |
| Validator      | `scripts/lib/token-model.mjs`                 | local release-candidate |
| CSS            | `packages/tokens/generated/tokens.css`        | done projection         |
| JavaScript     | `packages/tokens/generated/index.js`          | done projection         |
| TypeScript     | `packages/tokens/generated/index.d.ts`        | done projection         |
| Resolved JSON  | `packages/tokens/generated/tokens.json`       | done projection         |
| Figma proposal | `packages/tokens/generated/figma.tokens.json` | done, not published     |
| Manifest       | `packages/tokens/generated/manifest.json`     | done projection         |
| Diff baseline  | `packages/tokens/baseline/manifest.json`      | local release-candidate |

Elevation primitive, semantic elevation과 semantic layer는 단일 DTCG source 안의 논리적 계층이다.

## Elevation model

- primitive는 shadow layer, offset, blur, spread와 color 재료를 소유한다.
- semantic role은 surface-raised, popover, modal처럼 사용 목적을 소유한다.
- `elevation-popover`와 `elevation-modal`은 light/dark surface에서 경계가 읽혀야 한다.
- 고대비 환경에서는 shadow만으로 surface 경계를 전달하지 않고 border/system color 대체를 제공한다.
- Figma는 shadow를 native variable로 표현하지 못한다. semantic `elevation-*`는 effect style로,
  primitive `shadow-*`는 미표현으로 분류하고 loss metadata를 남긴다
  ([DS-D-0007](../governance/decisions/DS-D-0007-figma-library-structure.md)).

## 프레임 — 글래스는 폐지됐다

제품은 드롭다운·카드·팝오버의 외곽을 **하나의 토큰**으로 소유한다. 정의는 `:root` 한 곳뿐이고
**0.5px 헤어라인 한 겹**이다.

| 토큰 | 값 | 좌표 |
| --- | --- | --- |
| `--dropdown-frame` | `0px 0px 0px 0.5px rgb(var(--palette-gray-900-rgb) / 12%)` | `globals.css:57` |
| `--dropdown-frame-on-dark` | `0px 0px 0px 0.5px rgb(var(--palette-gray-000-rgb) / 16%)` | `globals.css:59` |
| `--dropdown-ambient-shadow` | `0px 8px 15px 0px rgba(0, 0, 0, 0.04)` | `globals.css:63` |

**라이트에서도 값이 같다.** 라이트 스코프가 `--dropdown-frame`을 재선언하지만 `:root`와 **바이트 동일**하다
(`globals.css:577`). 테마로 뒤집히는 축이 아니다.

`--dropdown-frame-on-dark`는 앱 테마와 무관하게 **늘 어두운 표면** 위에 얹는 칩 전용이다 — 잉크가 흰색이라
라이트 카드 위에 쓰면 흰 테두리가 뜬다. 소비처는 셋뿐이다(`VideoPlayer` · `CanvasOnboardingHints` ·
`CreativeMediaClient`).

앰비언트 그림자는 **프레임 토큰에 넣지 않는다.** 프레임은 카드·패널·버튼까지 83곳이 공유하므로 그림자를
섞으면 전부에 번진다. 필요한 표면에서만 앞에 조합한다 — `box-shadow: var(--dropdown-ambient-shadow), var(--dropdown-frame)`.

### 글래스 5겹과 베벨은 제품에서 제거됐다

이전 판은 `--glass-dropdown-frame`(검정 외곽 링 + 좌우 검정 엣지 ±1.25px + 상하 흰 림 inset = **5겹**)과
`--glass-bevel-highlight`/`-shade`/`--glass-inner-shadow-rgb` 계열을 문서화했다. **그 토큰들은 지금 제품에
하나도 없다** — `git grep glass` 가 0건이다. `globals.css` 주석이 직접 적는다:

> 글래스(검정 링 + 좌우 엣지 + 흰 림 5겹)를 걷어냈다 — **디자인 시스템이 글래스 섀도우 개념을 두지 않는다.**

함께 사라진 것:

- 공용 `Button`의 `primary`·`danger`가 갖던 베벨 2겹, `::before` 오버레이 이너섀도우, 그 층을 얹으려고
  있던 `translateZ(0)` 스태킹 컨텍스트 (`components/ui/Button.tsx@a3ed8e03:83-96` — **제품도 그 뒤
  같은 층을 걷어냈다.** 배포본 `df414c24` 의 `Button.tsx` 는 69줄이고 `.louis-button` 을 소비하기만
  한다. 좌표를 커밋에 묶어 두는 것은 그 선언이 실재했던 자리를 잃지 않기 위해서다)
- 앱 메인 카드의 `::after` 베벨 링. 카드는 이제 `border-radius: 16px` + `--dropdown-frame`뿐이다
  (`globals.css:1345-1351`)
- 비디오 에디터의 헤더 버튼·타임라인 표면이 쓰던 베벨 (`videoEditParts/vemClass.ts`)

**이 자리를 5겹으로 되돌리지 마라.** 옛 문서나 `origin/main`을 근거로 다시 그리면 폐지된 개념이 살아난다 —
[제품을 읽을 때 틀리는 자리](product-reading-traps.md)의 「정본은 `design` 브랜치다」 항목을 먼저 읽는다.

### 이너섀도우가 남은 자리는 둘뿐이다

전면 제거가 아니다. 두 곳은 의도적으로 남았고, 둘 다 `inset 0 0 8px 0 rgb(250 250 250 / 100%)` +
`mix-blend-mode: overlay` 조합이다.

| 소비처 | 좌표 |
| --- | --- |
| 노드 사이드 버튼 | `node-canvas-v2/nodes/NodeSideButtons.tsx:146-148` |
| 비디오 에디터 `confirmBtn`(내보내기) | `videoEditParts/vemClass.ts` |

Button 주석이 「이너섀도우는 **노드 사이드 버튼에만** 남는다」고 적지만 `confirmBtn`이 같은 층을 자기
클래스에 직접 들고 있다 — **주석보다 값이 정본이다.**

## Layer model

공용 상대 순서는 다음과 같다.

`layer-content < layer-sticky < layer-popover < layer-modal < layer-critical`

- source는 semantic 순서와 플랫폼별 numeric projection을 함께 검증한다.
- feature가 공용 순서 사이에 임의 숫자를 끼워 넣지 않는다.
- local floating UI는 자기 surface의 stacking context 안에 머문다.
- global popover와 modal은 App Shell의 승인된 overlay root를 사용한다.
- 투명하거나 closing 중인 layer가 보이는 control의 pointer/focus를 가로채면 실패다.
- `layer-critical`은 session/payment interruption처럼 승인된 system case에만 사용한다.

### 제품은 이 사다리를 쓰지 않는다 — 실측 (2026-08-30)

위 규범은 「feature가 공용 순서 사이에 임의 숫자를 끼워 넣지 않는다」고 적는다. 제품 전수를 세어
보면 **z-index 가 0 부터 99990 까지 64 가지 값**으로 흩어져 있다.

| 구간 | 값 | 비고 |
| --- | --- | ---: |
| 0–10 | 0 · 1 · 2 · 3 · 4 · 5 · 6 · 7 · 8 · 9 · 10 | 로컬 stacking. 191곳으로 가장 많다 |
| 12–102 | 12 · 20 · 24 · 25 · 26 · 29 · 30 · 31 · 40 · 41 · 52 · 56 · 60 · 70 · 80 · 82 · 90 · 100 · 101 · 102 | 사다리 칸이 아니다 |
| 120–1500 | 120 · 150 · 200 · 999 · 1000 · 1001 · 1002 · 1003 · 1010 · 1050 · 1100 · 1200 · 1300 · 1350 · 1399 · 1400 · 1500 | 오버레이 무리 |
| 2000 이상 | 2000 · 3000 · 5000 · 9999 · 10000 · 10001 · 10002 · 10100 · 10300 · 10400 · 12000 · 12050 · 13000 · 99990 | |

**칸에 걸리는 것은 0 · 100 · 200 셋뿐이고, 그마저 역할이 어긋난다.** 100 을 쓰는 13 곳은 전부
노드 드롭다운·더보기 메뉴·모달 배경인데 이 사다리는 100 을 `sticky` 라고 부른다. 이름을 그대로
붙이면 [DS-D-0029](../governance/decisions/DS-D-0029-token-names-must-be-true.md) 가 금지한
**역할이 틀린 이름**이 박힌다.

그래서 제품 쪽 리터럴 게이트는 이 축에서 27 곳만 보고 나머지 280 곳을 통과시킨다. 그 게이트의
초록은 이 축에 대해 **「늘지 않았다」는 뜻이지 「정리됐다」가 아니다** — 게이트 머리말에 같은
내용을 적어 두었다.

**남은 일은 자리별 치환이 아니라 겹 감사다.** 오버레이마다 역할을 정하고 그 역할을 사다리에
매핑한다. 겹 순서 회귀는 정적 검사에도 렌더 검사에도 잡히지 않으므로 한 번에 옮기지 않고 화면별
실측으로 옮긴다.

## Platform mapping

- CSS는 elevation custom property와 layer custom property를 분리해 생성한다.
- CSS와 JavaScript는 resolved layer number를 노출하고 JS metadata와 JSON/manifest는 명시적인 relative
  order도 제공한다. TypeScript declaration은 token별 number/shadow value shape와 metadata의 semantic
  layer ID 순서를 선언한다.
- Figma proposal은 elevation을 전달하되 runtime stacking layer를 시각 style로 가장하지 않는다.
- layer 순서 변경은 이름이 유지돼도 behavior breaking change로 분류한다.

## Acceptance tests

P2 local RC는 아래의 구조·생성 검사를 자동화한다.

- schema가 elevation/layer type 혼용과 승인되지 않은 layer 순서를 거부한다.
- CSS의 semantic layer number와 JS·JSON·Figma proposal·manifest의 primitive/semantic graph가 normalized
  model과 일치하고 명시적 relative order가 검증된다. TypeScript가 해당 ID/type/value shape를 선언하며
  Figma proposal은 비지원 항목을 loss metadata로 기록한다.
- 같은 process에서 동일 source를 반복 render한 결과가 byte-for-byte 동일하다.

다음은 P3/P5 소비 구현 게이트이며 아직 `not-ready`다.

- light/dark/high-contrast fixture에서 raised, popover와 modal 경계가 식별된다.
- profile popover, editor local floating UI와 modal을 함께 열어 상대 순서와 hit-test를 검증한다.
- closing layer가 action을 재실행하거나 뒤 control로 pointer event를 통과시키지 않는다.
