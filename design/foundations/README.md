---
id: foundations-overview
status: beta
authority: normative
---

# Foundations

모든 Klipse UI가 공유하는 토큰과 원칙이다. 값 목록만 제공하지 않고 의미, 사용 조건, 접근성,
상태와 테마 계약을 함께 정의한다.

## 카탈로그

| Foundation                                | 규범 상태      | 토큰 pipeline | 남은 소비 구현 검증                                                 |
| ----------------------------------------- | -------------- | ------------- | ------------------------------------------------------------------- |
| [Color & Theme](color-theme.md)           | `experimental` | local RC      | forced-colors, component 상태 신호와 화면 대비                      |
| [Typography](typography.md)               | `experimental` | local RC      | KO/EN/JA glyph·font asset, zoom과 loading layout                    |
| [Spacing & Radius](spacing-radius.md)     | `experimental` | local RC      | Shell/Grid 실측, 200% zoom과 hit target                             |
| [Elevation & Layer](elevation-layer.md)   | `experimental` | local RC      | high-contrast 경계, overlay hit-test와 closing lifecycle            |
| [Motion](motion.md)                       | `experimental` | local RC      | component unmount와 실제 `prefers-reduced-motion`                   |
| [Responsive Layout](responsive-layout.md) | `beta`         | 규범 준비     | container 기반 수용 조건을 제품 통합 테스트에 연결                  |
| [Inclusive Design](inclusive-design.md)   | `beta`         | 규범 준비     | WCAG 2.2 AA, keyboard, focus, contrast gate 연결                    |
| Iconography                               | `experimental` | `not-ready`   | P2 범위 밖. source, naming, optical size, accessible-name 규칙 정의 |

## 토큰 정본

P2 token source/projection pipeline은 local `release-candidate`다.
`packages/tokens/src/klipse.tokens.json`의 DTCG 2025.10-compatible 구조화 원본이 값과 alias를 소유하고
`scripts/lib/token-model.mjs`가 이 저장소가 지원하는 DTCG subset과 Klipse extension을 검증한다. 범용 DTCG
validator 전체를 구현했다는 뜻은 아니다. 위 표의 소비 구현 검증은 이 상태에 포함되지 않는다.

| 역할                        | 경로                                          |
| --------------------------- | --------------------------------------------- |
| DTCG source                 | `packages/tokens/src/klipse.tokens.json`      |
| Repository subset validator | `scripts/lib/token-model.mjs`                 |
| CSS                         | `packages/tokens/generated/tokens.css`        |
| JavaScript                  | `packages/tokens/generated/index.js`          |
| TypeScript                  | `packages/tokens/generated/index.d.ts`        |
| Resolved JSON               | `packages/tokens/generated/tokens.json`       |
| Reviewable Figma proposal   | `packages/tokens/generated/figma.tokens.json` |
| Generated manifest          | `packages/tokens/generated/manifest.json`     |
| Approved diff baseline      | `packages/tokens/baseline/manifest.json`      |

Source와 여섯 artifact는 local RC로 구현됐으며 생성 artifact는 손으로 수정하지 않는다. CSS는 제품
소비용 semantic custom property만 생성한다. JS·resolved JSON·Figma proposal·manifest는 검증과 추적을
위해 primitive/semantic graph를 함께 보존하고, TypeScript는 안정 ID, token별 type·mode·alias와 값 구조를
선언한다. 제품의 primitive 직접 소비는 여전히 지원하지 않는다. Package는 private이고 public release와
제품 adoption은 `not-ready`다. Figma proposal도 published collection이 아니므로 P2 RC만으로 Figma library
상태를 올리지 않는다.

기존 Klipse 제품 CSS에서 추출한 값은 migration evidence일 뿐 새 토큰 정본이 아니다. 의미를
검토하지 않은 값을 그대로 복사하지 않는다.

P2의 구체적인 package 경계와 완료 조건은
[`@klipse-design/tokens`](../../packages/tokens/README.md)에서 관리한다.

## 공통 품질 기준

- WCAG 2.2 AA를 기본 목표로 한다.
- keyboard와 pointer로 동일한 핵심 기능을 사용할 수 있어야 한다.
- focus-visible은 가려지지 않고 명확해야 한다.
- 200% zoom과 좁은 container에서도 핵심 동작을 잃지 않아야 한다.
- 색만으로 상태를 전달하지 않는다.
- `prefers-reduced-motion`에서 비필수 motion을 줄인다.

AI용 projection은 [Foundations text](../llms/foundations.txt)로 생성된다.
