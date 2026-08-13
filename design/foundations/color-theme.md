---
id: foundation-color-theme
status: experimental
authority: normative
---

# Color & Theme

Color & Theme은 색 값을 나열하는 문서가 아니라, 같은 의미가 light/dark 환경에서 예측 가능한 역할로
해석되게 하는 계약이다. P2 source와 platform projection은 로컬 release-candidate다. Package public
release, 제품 adoption과 published Figma library는 아직 `not-ready`다.

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

Raw color와 semantic color는 단일 DTCG source 안의 논리적 계층이다. 모든 artifact는 projection이며 직접
수정하지 않는다.

## Token model

1. **Primitive**는 팔레트 값과 투명도처럼 의미 없는 재료를 소유한다.
2. **Semantic**은 background, foreground, border, accent, feedback, focus 같은 사용 목적을 소유한다.
3. P3의 component token은 semantic token만 참조하며 primitive를 직접 참조하지 않는다.

제품 코드는 semantic color만 소비한다. primitive 이름을 화면 의미로 사용하거나 기존 CSS 변수 이름을
새 정본으로 승격하지 않는다.

## Theme modes

- `light`와 `dark`를 필수 mode로 둔다.
- theme-dependent semantic token은 두 mode 모두에서 명시적으로 resolve되어야 한다.
- 누락된 dark 값을 light 값으로 암묵 fallback하지 않는다.
- CSS는 기본 theme와 `[data-theme="dark"]` override의 semantic custom property를 결정론적으로 생성한다.
- 생성 CSS는 light/dark selector에 대응하는 `color-scheme`을 선언한다. 소비 제품이 해당 selector를
  document에 적용하고 browser chrome·SSR 초기 mode와 동기화하는 동작은 P3/P5에서 검증한다.
- SSR과 첫 paint에서 사용할 theme 결정은 소비 제품이 소유하지만, 생성 CSS는 theme 전환 중 이름이나
  cascade 순서를 바꾸지 않는다.
- forced-colors/high-contrast 환경은 별도 색 mode로 가장하지 않고 system color와 focus visibility
  대체 규칙을 문서화한다.

## Alias and naming rules

- alias는 같은 type만 가리키며 cycle과 dangling reference를 허용하지 않는다.
- semantic token이 primitive로 resolve되는 방향만 허용하고 primitive가 semantic token을 참조하지 않는다.
- source ID는 CSS, JavaScript, TypeScript와 Figma 이름이 바뀌어도 추적 가능한 안정 식별자다.
- 플랫폼 이름 변환 충돌은 build error다.
- alpha가 있는 색은 실제 배경과 함께 contrast pair를 선언한다.

## Accessibility

- 일반 텍스트 foreground/background pair는 4.5:1 이상을 목표로 한다.
- 큰 텍스트와 의미 있는 비텍스트 그래픽·control boundary는 3:1 이상을 목표로 한다.
- success, warning, danger, selected 상태는 색 외의 텍스트·아이콘·형태 신호를 함께 제공한다.
- contrast 검사는 임의의 모든 색 조합이 아니라 source에 선언한 허용 pair를 대상으로 한다.

## Acceptance tests

이 절은 P2 local RC에서 자동화한 source·생성물 검사다. 실제 component의 forced-colors, 상태별 비색상
신호와 화면 대비는 P3/P5 소비 구현 게이트이며 아직 `not-ready`다.

- schema가 알 수 없는 field, 잘못된 color type과 중복 ID를 거부한다.
- alias graph가 cycle, dangling reference와 type mismatch를 거부한다.
- 모든 semantic color가 light/dark에서 하나의 값으로 resolve된다.
- 선언된 contrast pair가 각 mode에서 기준을 통과한다.
- CSS의 semantic mode/output과 JS·JSON·Figma proposal·manifest의 primitive/semantic color graph가 같은
  normalized model과 일치한다. 생성 CSS의 light/dark `color-scheme` selector도 검사한다.
- alias target, description/deprecation과 source provenance는 JS·JSON·Figma proposal·manifest에서 source와
  일치한다.
- 같은 process에서 동일 source를 두 번 render한 결과가 byte-for-byte 동일하다.
- Figma proposal 생성만으로 manifest의 Figma 상태를 `partial` 또는 `done`으로 올리지 않는다.
