---
id: decision-canvas-edge-canon-is-a-token-table
status: experimental
authority: normative
---

# DS-D-0061 연결선의 정본은 CSS 가 아니라 톤 표다 — canvas-edge 레시피를 세우지 않는다

- Status: partially superseded — 2026-10-14 [DS-D-0100](DS-D-0100-canvas-edge-recipe.md) 이 실선 · hover 잉크 · 히트 영역 · 삭제 버튼에 레시피를 세웠다. 이 결정의 두 근거(쉬머가 인스턴스 기하 · SMIL 주기)는 쉬머 한 겹에 대해 그대로 유효하다
- 원래 상태: accepted (LOUIS · 계약 · 문서 2026-09-09. Figma 는 움직이지 않는다)
- Date: 2026-09-09
- Owners: design system maintainer
- Affects: `component-canvas-edge`, `decision-figma-done-without-publish`

## Context

생성 CSS 에 클래스가 0 건인 컴포넌트를 세어 보면 다섯이다 — `faq-row` · `node-shell` ·
`floating-shell` · `pill-trigger` · `canvas-edge`. 넷은 「아직 안 세운 것」이고 manifest 가
`not-ready` 로 정직하게 적고 있었다. **다섯째가 그 넷과 같은 종류인지가 이 결정의 질문이다.**

같은 질문을 다시 하게 되는 이유가 있다. 제품은 이 컴포넌트를 **이미 채택했는데** 그 방식이
CSS 클래스가 아니라 **JS 상수 표**였다 —
`node-canvas-v2/edges/V2EdgeLayers.tsx` 의 `V2_EDGE_TONE`(일곱 톤 × stroke · shimmer ·
wingOpacity · glow)과 `V2_EDGE_SHIMMER_DUR`. 그래서 「레시피가 없다」는 사실이 **채택이 안 됐다는
뜻이 아니다.** 기록에 그 구분이 없으면 열어 보는 사람마다 같은 조사를 다시 한다.

## Decision

**CSS 레시피를 세우지 않는다. 이 컴포넌트의 정본은 톤 표이고, LOUIS 는 그 표가 부르는 이름을
소유한다.** manifest 의 `web` 을 `not-ready` 에서 **`not-planned`** 로 옮긴다.

근거는 「지금 필요가 없다」가 아니라 **CSS 가 이 조형을 담지 못한다**는 것이다.

1. **쉬머의 페인트가 인스턴스 기하다.** 쉬머는 `gradientUnits="userSpaceOnUse"` 인
   `<linearGradient>` 이고 좌표 넷이 **두 핸들의 런타임 좌표**에서 나온다. 획은 엣지마다 다른
   `url(#…)` 를 물어야 한다. CSS 클래스는 paint server 를 만들지도, 그 좌표를 정하지도,
   인스턴스마다 다른 id 를 붙이지도 못한다.
2. **주기는 SMIL 이지 CSS 가 아니다.** 1.45초는 `<animateTransform>` 의 `dur` 이고 그것을
   정하는 CSS property 는 없다. 계약의 `shimmerPeriodMs` 는 **어떤 레시피로도** 옮겨가지 못한다.
3. **그래서 레시피는 한 표를 두 집에 살게 한다.** CSS 가 담을 수 있는 것은 실선 색 · stop 색 ·
   stop 불투명도 · 번짐 필터 넷뿐이고 나머지는 JS 에 남는다.

세 번째가 결정적이다. **이 컴포넌트를 기록할 값어치가 정확히 그 반대편에 있기 때문이다.**
이 조형은 앵커에서 손으로 일곱 벌 복제돼 있었고 그중 워크스루 오버레이 넷이 주기(1.85초 대
1.45초) · 번짐 색 · image 하이라이트에서 이미 갈렸다. 제품 `V2_EDGE_TONE` 의 주석이 그 교훈을
적는다 — 주석은 동일함을 지켜 주지 않으며, 값을 한 곳에 두어야 갈릴 자리가 사라진다.
**LOUIS 레시피는 여덟 번째 사본이 되고, 위 1·2 때문에 통째로 소비될 수 없는 첫 사본이 된다.**

## Alternatives

**(a) 넷만 담는 부분 레시피를 세운다.** 실선 색 · stop 색 · stop 불투명도 · 번짐 필터를 톤
수정자 클래스로 연다. 기각한다 — 표가 CSS 와 JS 로 갈리고, 그것이 이 컴포넌트가 고치려던
결함 그 자체다. 제품이 물어도 사본이 하나 줄지 않고 하나 는다.

**(b) 쉬머를 CSS 로 애니메이트할 수 있게 다시 설계한다.** 기각한다 — 출시된 제품 시각을 바꾸는
일이고, 그 순간 「정본은 제품」이라는 전제가 뒤집힌다. 값을 옮기려고 조형을 바꾸는 것은 순서가
거꾸로다.

**(c) LOUIS 가 톤 표를 TS export 로 소유한다.** **기각하지 않는다 — 오늘 하지 않을 뿐이다.**
그러면 제품 사본 일곱이 하나로 접히고 위 「넷의 어긋남」이 구조적으로 사라진다. 오늘 하지 않는
이유는 하나다: **소비처가 없다.** 제품이 그것을 물어야 이득이 생기고, 무는 것은 제품 회차의
일이다. 소비처 없이 세우면 아무도 안 읽는 여덟 번째 사본이 되는 것은 (a) 와 같다.
**이 결정은 (c) 를 닫지 않는다.** 수요가 서면 Decision 으로 다시 연다 — `select` 가 DS-D-0053
에서 그렇게 열렸다.

**(d) `not-ready` 로 둔다.** 기각한다. 어휘가 둘을 이미 갈라 두었다 — `not-ready` 는 「아직
제공하지 않는다」이고 `not-planned` 는 「제공할 필요가 없다」다. 「아직」으로 적어 두면 이 조사가
영구히 반복된다. `not-planned` 는 「안 만든다」가 아니라 **「계획에 없다는 것이 결정됐다」**는
뜻이라고 2026-08-18 항목이 이미 적어 두었다.

## Consequences

- `canvas-edge` 의 `web` 이 `not-planned` 가 된다. 이 저장소에서 `select` 이후 두 번째다.
- **레시피가 없다는 사실이 근거를 갖는다.** 계약 최상위에 `$noRecipe` 명부가 서고 canvas-edge
  가 그 첫 항목이다. 형태는 같은 파일의 `$noProductRender` 를 따랐다 — 면제는 검사를 빼는 것이
  아니라 다른 근거로 옮기는 것이다.
- **검사가 줄지 않는다.** 표가 부르는 이름이 두 테마에서 실재하는지와 톤마다 옳은 칸(실선 500 ·
  쉬머 200)을 무는지는 `packages/react/test/canvas-edge.browser.test.tsx` 가 실브라우저에서
  이미 잰다. 근거가 CSS 가 아닌 자리에 서 있을 뿐이다.
- Figma 는 움직이지 않는다. `CanvasEdge` 14 variant 와 계약 값이 그대로이므로
  `verify-figma-parity` 의 대조도 그대로다.
- 문서 Acceptance tests 의 5·6·7(주기 · 번짐 반경 · 히트 영역)은 여전히 아무도 재지 않는다.
  **그 자리는 레시피를 기다리는 자리가 아니다** — 제품 쪽 탐침이 서야 열리고, 그 사유는 계약의
  `$noProductRender` 가 이미 갖고 있다.

## Rollout and verification

같은 회차에서 셋을 함께 옮겼다 — 계약(`$noRecipe`) · 문서(Availability 와 「왜 CSS 레시피가
없는가」 절) · manifest(`web`).

`scripts/verify-recipe-record.mjs` 가 이 판정을 **세 방향으로** 문다. 그 게이트는 원래 「레시피가
있는 것을 기록과 맞추는」 검사였고, 여기에 반대쪽 절을 붙였다.

1. `$noRecipe` 의 이름은 manifest 의 `web` 이 `not-planned` 여야 한다.
2. 그 이름으로 `packages/css/src/component/<id>.css` 가 **생기면 실패한다.** 판정을 뒤집는
   일이므로 조용히 일어날 수 없다.
3. 거꾸로 `web` 이 `not-planned` 인데 명부에 사유가 없으면 실패한다 — 사유 없는 `not-planned`
   는 상태가 아니라 검사를 끄는 값이다.

넷을 사본에서 변조해 확인했다(전부 exit=1, 메시지가 canvas-edge 의 그 규칙): `web` 을
`not-ready` 로 되돌리기 · `canvas-edge.css` 를 만들기 · `$noRecipe` 사유를 지우기 · 사유를 한
마디로 줄이기.
