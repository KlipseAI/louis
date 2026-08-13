---
id: foundations-overview
status: beta
authority: normative
---

# Foundations

모든 Klipse UI가 공유하는 토큰과 원칙이다. 값 목록만 제공하지 않고 의미, 사용 조건, 접근성,
상태와 테마 계약을 함께 정의한다.

## 카탈로그

| Foundation        | 규범 상태      | 구현 상태   | 다음 완료 조건                                                      |
| ----------------- | -------------- | ----------- | ------------------------------------------------------------------- |
| Color & Theme     | `experimental` | `not-ready` | semantic role과 light/dark alias graph를 구조화 token source로 정의 |
| Typography        | `experimental` | `not-ready` | 역할 기반 scale, locale fallback, zoom 수용 조건 정의               |
| Spacing & Radius  | `experimental` | `not-ready` | primitive와 layout semantic token 분리                              |
| Responsive Layout | `beta`         | 규범 준비   | container 기반 수용 조건을 제품 통합 테스트에 연결                  |
| Inclusive Design  | `beta`         | 규범 준비   | WCAG 2.2 AA, keyboard, focus, contrast gate 연결                    |
| Motion            | `experimental` | `not-ready` | duration/easing/reduced-motion token 정의                           |
| Iconography       | `experimental` | `not-ready` | source, naming, optical size, accessible-name 규칙 정의             |

## 토큰 정본

P2가 시작되면 `packages/tokens/src/`의 구조화 원본이 값을 소유한다. CSS와 TypeScript,
Figma collection은 같은 원본에서 생성하며 생성물을 손으로 수정하지 않는다.

기존 Klipse 제품 CSS에서 추출한 값은 migration evidence일 뿐 새 토큰 정본이 아니다. 의미를
검토하지 않은 값을 그대로 복사하지 않는다.

## 공통 품질 기준

- WCAG 2.2 AA를 기본 목표로 한다.
- keyboard와 pointer로 동일한 핵심 기능을 사용할 수 있어야 한다.
- focus-visible은 가려지지 않고 명확해야 한다.
- 200% zoom과 좁은 container에서도 핵심 동작을 잃지 않아야 한다.
- 색만으로 상태를 전달하지 않는다.
- `prefers-reduced-motion`에서 비필수 motion을 줄인다.

AI용 projection은 [Foundations text](../llms/foundations.txt)로 생성된다.
