---
id: button
status: experimental
authority: normative
---

# Button

사용자가 즉시 실행할 수 있는 명확한 액션을 표현한다. 제품별 버튼 스타일을 만들기 전에 공용
Button 계약으로 해결할 수 있는지 먼저 확인한다.

## Availability

| Surface       | 상태           | 근거                                          |
| ------------- | -------------- | --------------------------------------------- |
| Web           | `not-ready`    | `@klipse-design/react`에 public export가 없음 |
| Figma         | `not-ready`    | published component가 없음                    |
| Documentation | `done`         | 이 문서                                       |
| Maturity      | `experimental` | 구현·테스트·소비 증거가 아직 없음             |

## 목표 API

아래 코드는 P3에서 제공할 제안 API이며 현재 import할 수 없다.

```tsx
import { Button } from "@klipse-design/react";

<Button variant="primary">새 프로젝트 만들기</Button>
<Button variant="secondary">취소</Button>
<Button variant="danger">삭제</Button>
```

링크 이동이 목적이면 클릭으로 navigation을 흉내 내지 말고 Link primitive를 사용한다.

## Anatomy

1. Root — 네이티브 `<button>`과 hit area
2. Left icon — 선택 사항, 장식이면 보조 기술에서 숨김
3. Label — 결과를 설명하는 텍스트
4. Right icon — 선택 사항, 장식이면 보조 기술에서 숨김
5. Progress indicator — loading일 때 label 의미와 함께 제공

## Properties

| Prop         | 값                                        | 기본값    | 설명                                            |
| ------------ | ----------------------------------------- | --------- | ----------------------------------------------- |
| `variant`    | `primary`, `secondary`, `ghost`, `danger` | `primary` | 강조와 의미                                     |
| `size`       | `md`, `sm`                                | `md`      | 시각 크기; hit area 계약은 별도 유지            |
| `loading`    | boolean                                   | `false`   | 중복 실행 차단, `aria-busy`, progress indicator |
| `leftIcon`   | ReactNode                                 | —         | 라벨 앞 보조 아이콘                             |
| `rightIcon`  | ReactNode                                 | —         | 라벨 뒤 보조 아이콘                             |
| native props | ButtonHTMLAttributes                      | —         | `disabled`, `aria-*`, event                     |

`type` 기본값은 `button`이다. 폼 제출은 호출부가 `type="submit"`을 명시한다.

## Hierarchy와 variants

| Variant     | 용도                | 원칙                                               |
| ----------- | ------------------- | -------------------------------------------------- |
| `primary`   | 핵심 진행·생성 액션 | 한 영역의 최우선 액션에 사용                       |
| `secondary` | 취소·대안           | primary를 보조                                     |
| `ghost`     | 툴바·저강조 액션    | 면이 없어도 발견 가능한 위치에서 사용              |
| `danger`    | 삭제·초기화         | 결과를 구체적으로 설명하고 필요하면 확인 단계 제공 |

강조 수준을 색만으로 결정하지 않고, 같은 영역에 경쟁하는 primary를 여러 개 두지 않는다.

## States

| 상태          | 계약                                                   |
| ------------- | ------------------------------------------------------ |
| Enabled       | 라벨만으로 결과를 예측할 수 있음                       |
| Hover         | hover에서만 기능을 드러내지 않음                       |
| Pressed       | feedback은 제공하되 reduced-motion에서 scale 이동 제거 |
| Disabled      | 실행되지 않으며 이유가 필요하면 인접 설명 제공         |
| Focus-visible | 배경과 테마에 관계없이 2px 이상 명확한 indicator       |
| Loading       | label 의미 유지, 중복 실행 차단, `aria-busy=true`      |

## Content

- 결과를 예측할 수 있는 짧은 동사형 라벨을 쓴다: `저장`, `업로드`, `삭제`.
- `확인`, `다음`처럼 맥락 없이는 결과를 알 수 없는 라벨은 구체화한다.
- 진행 문구 끝에 ellipsis를 붙이지 않는다.
- 번역과 200% 확대에서 잘리면 버튼 폭 또는 action layout을 바꾼다.

## Accessibility

- 아이콘 전용 버튼은 accessible name을 제공한다.
- disabled처럼 보이지만 동작하는 요소를 만들지 않는다.
- loading 중 현재 focus를 제거하지 않는다.
- 주요 액션 hit area는 44×44 CSS px 이상을 목표로 한다.
- `aria-disabled`를 사용하면 click과 keyboard activation을 모두 명시적으로 차단한다.

## Acceptance tests

- pointer click, Enter, Space가 각각 정확히 한 번 실행된다.
- disabled와 loading에서 모든 activation 경로가 차단된다.
- loading 시작·완료 시 accessible name과 focus가 예측 가능하다.
- light/dark/high contrast에서 focus-visible이 보인다.
- KO/EN/JA 긴 라벨, 200% zoom, 320px container에서 핵심 텍스트가 사라지지 않는다.
- reduced-motion에서 pressed/loading 의미가 유지된다.

## 승격 조건

`packages/react` public export, component tests, accessibility/visual regression, published Figma component,
두 개 이상의 제품 사용처가 준비된 뒤 `partial` 또는 `done`을 검토한다.
