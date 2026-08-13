---
id: foundation-spacing-radius
status: experimental
authority: normative
---

# Spacing & Radius

Spacing & Radius는 모든 픽셀 값을 토큰으로 만드는 체계가 아니다. 반복되는 관계와 surface 계층을 이름
있는 계약으로 만들고, 제품별 scene geometry는 제품에 남긴다. P2 source와 projection은 로컬
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

Dimension primitive, semantic spacing/radius와 responsive profile은 단일 DTCG source 안의 논리적 계층이다.

## Spacing model

- primitive scale은 반복 가능한 dimension 재료를 제공한다.
- semantic spacing은 control inset, stack gap, section gap, surface inset, shell outer gap처럼 관계를
  설명한다.
- App Shell outer gap, content inset, navigation leading line과 Project Grid gap/card minimum은 source에서
  서로 다른 의미로 유지한다.
- hit target 최소 크기와 시각 padding을 같은 token으로 간주하지 않는다.
- 음수 값으로 Shell ownership 오류를 보정하지 않는다.
- 제품별 scene 좌표나 일회성 media crop 값은 공용 token으로 승격하지 않는다.

## Radius model

- radius는 control, surface, overlay, overlay-item처럼 계층과 사용 목적을 표현한다.
- `radius-overlay`와 `radius-overlay-item`은 별도 semantic role이며 하나의 숫자를 우연히 공유해도 같은
  token으로 합치지 않는다.
- pill/circle은 고정 숫자보다 shape semantics로 표현한다.
- component가 임의 radius literal을 추가하려면 두 개 이상의 사용처와 시각·접근성 근거가 필요하다.

## Responsive profile

`packages/tokens/src/klipse.tokens.json`의 Klipse responsive profile metadata는 일반 component breakpoint
묶음이 아니라 [Responsive Layout](responsive-layout.md)의 Shell migration compatibility profile을
기계적으로 표현한다.

- component와 grid는 실제 container 크기로 적응한다.
- viewport profile을 component 내부 media query의 기본값으로 사용하지 않는다.
- Project Grid의 `minimumCard`와 `gap`은 각각 안정 semantic ID `layout-project-card-minimum`과
  `layout-project-grid-gap`을 참조한다.
- container 최소 폭 0/720/1200/1800px에서 preferred column은 2/3/4/5다. Preferred 값이 card minimum과
  gap을 만족하지 못하면 capacity 계산으로 1열까지 안전하게 줄인다.
- profile step이나 capacity 결과를 바꾸려면 Responsive Layout, App Shell, Project Grid와 migration evidence를
  함께 갱신한다.
- safe-area inset은 환경 입력이며 고정 spacing primitive가 아니다.

## Units and platform mapping

- source dimension은 number와 unit을 명시한다.
- CSS는 source unit을 그대로 직렬화하고 JavaScript/resolved JSON은 DTCG `{value, unit}` 구조를 보존한다.
- TypeScript declaration은 안정 token ID, token별 type·mode·alias target과 `{ value, unit }` dimension shape를
  선언한다. Token별 실제 숫자는 runtime data이며 literal value union으로 고정하지 않는다.
- Figma proposal은 원래 dimension value와 unit-loss metadata를 함께 제공한다. P2는 rem/px 변환이나
  platform별 rounding을 수행하지 않는다.

## Acceptance tests

P2 local RC는 아래의 구조·생성 검사를 자동화한다.

- validator가 malformed `{value, unit}`, 알 수 없는 unit, alias type mismatch와 중복 ID를 거부한다.
  spacing/radius primitive, duration, shadow blur와 responsive minimum width처럼 명시된 field는 음수를 거부한다.
- semantic spacing/radius가 primitive 또는 승인된 semantic alias로 완전히 resolve된다.
- CSS의 semantic resolved value와 JS·JSON·Figma proposal·manifest의 primitive/semantic dimension
  value·unit이 normalized model과 일치하고 TypeScript가 해당 ID/type/value shape를 선언한다.
- Project Grid profile의 container measurement, ordered 0/720/1200/1800px step, 2/3/4/5 preferred column과
  stable minimum-card/gap reference shape를 검증한다.
- 같은 process에서 동일 source를 반복 render한 결과가 byte-for-byte 동일하다.

다음은 P3/P5 소비 구현 게이트이며 아직 `not-ready`다.

- Shell outer gap/content inset/navigation 정렬 관계가 sidebar 상태 전환 중 유지된다.
- Project Grid 구현이 profile과 실제 container capacity를 정확히 따르고 공간이 부족하면 1열까지 안전하게
  fallback한다.
- 320px, 200% zoom과 44px 권장 hit target에서 spacing이 핵심 action을 자르지 않는다.
