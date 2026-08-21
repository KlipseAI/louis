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

## 글래스 베벨

제품은 글래스 표면의 안쪽 테두리를 elevation shadow와 **별도의 토큰 계열**로 소유한다. 정의는
`:root` 한 곳뿐이다.

이 계열은 아직 DTCG source에 없는 제품 전역 CSS다. **계약이 아니라 실측값**이며, Figma로 옮길 때
지어내지 않도록 적어 둔다.

| 토큰                       | 값                                                              | 좌표               |
| -------------------------- | --------------------------------------------------------------- | ------------------ |
| `--glass-bevel-offset`     | `1px`                                                             | `globals.css:55`   |
| `--glass-bevel-blur`       | `1px`                                                             | `globals.css:56`   |
| `--glass-bevel-highlight`  | `inset 0 var(--glass-bevel-offset) var(--glass-bevel-blur)`       | `globals.css:57`   |
| `--glass-bevel-shade`      | `inset 0 calc(-1 * var(--glass-bevel-offset)) var(--glass-bevel-blur)` | `globals.css:58` |
| `--glass-inner-shadow-rgb` | `var(--palette-gray-000-rgb)`                                     | `globals.css:53`   |
| `--palette-gray-000-rgb`   | `250 250 250`                                                     | `globals.css:40`   |

해상 결과는 하이라이트 `inset 0 1px 1px`, 쉐이드 `inset 0 -1px 1px`이고 색은 언제나
`rgb(250 250 250 / <알파>)`다.

### 토큰은 기하만 담고 색을 담지 않는다

**`--glass-bevel-highlight`와 `--glass-bevel-shade`는 `inset <x> <y> <blur>`까지만 담는다.**
box-shadow 문법에서 색이 생략되면 `currentColor`로 떨어지므로, 소비처가 반드시 색을 뒤에 이어 붙인다.

```
box-shadow:
  var(--glass-bevel-highlight) rgb(var(--glass-inner-shadow-rgb) / 25%),
  var(--glass-bevel-shade)     rgb(var(--glass-inner-shadow-rgb) / 25%);
```

근거는 `globals.css:1383-1384`와 `mypage/upgrade/checkout/page.tsx:81`이다.

**토큰 값만 보고 Figma effect를 만들면 색 없는 그림자가 나온다** — 알파는 토큰이 아니라 소비처가
정한다. 앱 메인 카드는 상하 25% · 좌우 18%를 쓴다([App Shell](../patterns/app-shell.md)
§메인 카드 표면 표의 「베벨 링」 행 참조).

### 라이트에서도 베벨은 흰색이다

배포본 a9ead58b 전수 확인 결과 위 여섯 토큰은 모두 정의가 **한 곳뿐**이며
`html[data-theme="light"]`을 포함해 어떤 선택자도 재정의하지 않는다. 라이트에서도 색은
`250 250 250` 그대로다. **라이트 화면을 옮기면서 흰 베벨을 「다크 잔재」로 보고 지우면 안쪽
테두리 두 겹이 통째로 빠진다.**

베벨은 `--glass-dropdown-frame`(`globals.css:63-68`)의 4·5번째 겹과 **별개의 추가 층**이다.
프레임은 요소 본체에 걸리고 베벨은 대개 `::after`에 걸린다. 둘을 같은 것으로 보고 하나만 그리면
안쪽 테두리가 절반만 남는다.

### 주석이 아니라 값이 정본이다

`globals.css:54` 주석은 「하이라이트(↓ Y+2) + 쉐이딩(↑ Y-2)」라고 적혀 있으나 실제 offset은
`1px`이다. **주석을 읽고 2px로 옮기면 틀린다.**

## Layer model

공용 상대 순서는 다음과 같다.

`layer-content < layer-sticky < layer-popover < layer-modal < layer-critical`

- source는 semantic 순서와 플랫폼별 numeric projection을 함께 검증한다.
- feature가 공용 순서 사이에 임의 숫자를 끼워 넣지 않는다.
- local floating UI는 자기 surface의 stacking context 안에 머문다.
- global popover와 modal은 App Shell의 승인된 overlay root를 사용한다.
- 투명하거나 closing 중인 layer가 보이는 control의 pointer/focus를 가로채면 실패다.
- `layer-critical`은 session/payment interruption처럼 승인된 system case에만 사용한다.

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
