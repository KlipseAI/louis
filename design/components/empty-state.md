---
id: empty-state
status: experimental
authority: normative
summary: 보여 줄 것이 없을 때 그 사실과 다음 행동을 안내합니다.
---

# Empty State

목록이나 영역에 보여 줄 것이 없을 때, 그 사실과 다음 행동을 알린다.

제품에 정의가 **9벌** 있다 — 앱 홈 2, 하이라이트 2, 비디오 에디터 5. 그중 하나(하이라이트의 둘째)는
조건상 도달할 수 없는 죽은 분기라 살아 있는 것은 8벌이다. 아홉 벌은 거의 합의하지 않는다.

| 축 | 갈림 |
| --- | --- |
| 세로 여백 | 80px 2벌 · 64px 1벌 · 선언 없음 나머지 |
| 블록 간격 | 12px 2벌 · 16px 1벌 |
| 제목 계층 | 있음 2벌 · 없음 나머지 |
| 행동 유도 | 있음 3벌 · 없음 6벌 |
| **배경·테두리·반경** | **9벌 전부 없음** |

마지막 줄이 유일한 합의이고, 그것을 그대로 옮겼다. 나머지는 두 홈이 동의한 값을 정본으로 골랐다 —
근거가 가장 두껍다.

## Availability

| Surface       | 상태           | 근거                                                          |
| ------------- | -------------- | -------------------------------------------------------------- |
| Web           | `partial`      | public export와 실브라우저 acceptance test 7건; visual regression과 제품 소비 증거 없음 |
| Figma         | `partial`      | component 하나. parity 게이트가 Graphic·Title·Description·Action을 자손으로 대조한다. publish는 DS-F-008 |
| Documentation | `done`         | 이 문서                                                        |
| Maturity      | `experimental` | 규범과 구현이 같은 변경 단위에서 처음 선다                     |

## When to use

- 목록·격자·패널에 항목이 **하나도 없을 때**.
- 사용자가 아직 아무것도 만들지 않아 다음 행동을 안내해야 할 때.

쓰지 않는 자리.

- **불러오지 못했을 때.** 그것은 오류이며 사용자가 취할 행동이 다르다 — 없으면 만들면 되고
  실패했으면 다시 시도해야 한다. 제품의 프로젝트 피커는 둘을 같은 빨간 표현으로 합쳐 두었는데,
  그 구조는 옮기지 않았다.
- **불러오는 중일 때.** 그것은 로딩이다. 빈 상태를 먼저 보여 주면 곧 사라질 "없습니다"를 읽힌다.
- 검색·필터 결과가 없을 때는 **같은 컴포넌트를 쓰되 문구가 다르다.** 아래 Content를 본다.

## API

```tsx
<EmptyState
  graphic={<IconFolder />}
  title="아직 프로젝트가 없습니다"
  description="첫 번째 영상을 만들어보세요."
  action={<Button variant="primary" size="sm" leftIcon={<IconPlus />}>만들기</Button>}
/>
```

## Anatomy

1. **Container** — 세로 가운데 정렬 stack. **면을 갖지 않는다.**
2. **Graphic** — 64px 슬롯. 선택이다.
3. **Title** — heading. 무엇이 없는지 말한다.
4. **Description** — 선택. 다음에 무엇을 하면 되는지 말한다.
5. **Action** — 선택. 보통 Button 하나다.

## Properties

| prop | 값 | 기본 | 뜻 |
| --- | --- | --- | --- |
| `title` | ReactNode | 필수 | 제목 |
| `description` | ReactNode | 없음 | 설명 |
| `graphic` | ReactNode | 없음 | 64px 그래픽 |
| `action` | ReactNode | 없음 | 행동 유도 |
| `headingLevel` | `2`–`6` | `2` | 제목의 heading 단계 |

`headingLevel`을 컴포넌트가 고정하지 않는 이유는 빈 상태가 놓이는 자리에 따라 문서 구조가 달라지기
때문이다. 섹션 안이면 `3`, 페이지 본문이면 `2`다.

## Hierarchy와 variants

variant 축이 없다. 빈 상태의 강조는 시각이 아니라 **행동 유도의 유무**가 만든다 — 사용자가 지금
할 수 있는 것이 있으면 버튼을 주고, 없으면 사실만 말한다.

## States

상태 축이 **없다.** 제품 9벌 중 hover·focus·disabled를 스스로 갖는 것이 0벌이고, 빈 상태는 대화형
요소가 아니다. 그 안의 행동 유도 버튼이 자기 상태를 갖는다.

## Interaction and responsive behavior

- 폭은 부모가 정한다. 설명은 `44ch`로 제한된다 — 넓은 화면에서 한 줄로 늘어나면 눈이 되돌아오지
  못한다. `ch`라서 확대해도 줄당 글자 수가 유지된다.
- 세로 여백 80px은 부모가 짧으면 그대로 넘친다. 빈 상태를 넣는 영역은 최소 높이를 스스로 가져야
  한다 — 그것은 이 컴포넌트가 아니라 레이아웃의 계약이다.

## Content

제품의 문구를 읽어 보면 어조가 하나로 모인다.

- **Title**은 "아직 …가 없습니다" 꼴이다. 마침표를 찍지 않는다.
- **Description**은 해요체 권유이며 마침표를 찍는다 — "첫 번째 영상을 만들어보세요."
- 검색·필터 결과가 없을 때는 **다른 문구다.** "해당하는 프로젝트가 없습니다 / 다른 검색어를
  시도해 보세요." 처음 만드는 것과 못 찾은 것은 다음 행동이 다르다.
- 제품에는 이 두 문구가 사전에 정의돼 있으나 **어떤 화면도 렌더하지 않는 죽은 문구**가 둘 있다
  (`archive.empty.cta`, `archive.emptyFilter`). 문구가 있는데 화면에 없는 것은 제품 부채이며 DS가
  고칠 문제가 아니다.
- 컴포넌트가 문구를 갖지 않는다. 제품의 노드캔버스 허브는 영상용 문구를 그대로 재사용해 캔버스
  화면에서 "첫 번째 영상을 만들어보세요"라고 말한다 — 문구를 컴포넌트에 고정하면 그런 일이 생긴다.

## Accessibility

- 제목이 **heading**이다. `div`로 두면 스크린 리더가 지나쳐 "왜 아무것도 없는지"를 알 수 없다.
- **`aria-live`를 붙이지 않는다.** 빈 상태는 목록이 로드된 결과이고 로딩을 알리는 것은 이미 다른
  요소의 일이다. 여기에 live region을 두면 화면을 옮길 때마다 다시 읽힌다. 제품도 빈 상태에는
  live region을 두지 않는다(로딩 상태에만 있다).
- **그래픽은 `aria-hidden`이다.** 제목이 말하는 것을 반복할 뿐이다.

## Specification

| 축 | 값 | 토큰 |
| --- | ---: | --- |
| 세로 여백 | 80px | — |
| 좌우 여백 | 16px | `space-layout-gutter` |
| 블록 간격 | 12px | `space-stack-md` |
| 액션 추가 간격 | 4px | `space-control-xs` |
| 그래픽 | 64px | `icon-size-xl` |
| 제목 | 20/600 | `typography-body-lg-semibold` |
| 설명 | 16/400 | `typography-body-md-regular` |
| 설명 최대 폭 | 44ch | — |
| 배경·테두리·반경 | 없음 | — |

세로 여백 80px에 토큰을 만들지 않은 이유는 **소비처가 여기 하나뿐**이기 때문이다.
[spacing-radius.md](../foundations/spacing-radius.md)가 "두 개 이상의 사용처"를 토큰 승격 조건으로
두고 있어 리터럴을 한 줄에 격리했다.

## Effects

없다.

## Implementation

- 그래픽 슬롯이 크기를 소유한다(`inline-size`/`block-size` 64px). 안에 들어오는 아이콘이 자기
  크기를 갖고 와도 슬롯을 채운다 — Icon 컴포넌트의 기본은 20px이라 그냥 넣으면 작게 나온다.
- 액션은 `margin-block-start`로 한 단계 더 떨어진다. 읽는 것과 누르는 것 사이의 경계다.

## Known deviations

- **아홉 벌 중 어느 것과도 정확히 같지 않다.** 정본이 없으므로 "다르다"가 결함이 아니다. 두 홈이
  동의한 값을 골랐고, 각 축의 판정은
  [`product.measured.json`](../../migration/product.measured.json)에 있다.
- **오류 상태를 다루지 않는다.** 제품은 프로젝트 피커에서 "없음"과 "실패"를 같은 표현으로 합치고
  색을 하드코딩했다(`rgb(251 146 150 / 0.95)`). 그 둘을 가르는 것이 이 컴포넌트의 판단이며, 오류
  표현은 별도 컴포넌트가 소유해야 한다.

- **집계 9벌 밖에 열 번째 정의가 있고, 그것만 면을 갖는다.** 대시보드(분석) 섹션은 빈 상태와 fetch
  실패를 `AnalyticsStatePanel` 한 컴포넌트로 그린다(`components/scenes/analytics/shared.tsx:549-570`).
  이 패널은 **배경·1px 테두리·12px 반경을 갖는다** — 위 「9벌 전부 없음」 합의의 유일한 반례다.
  집계에서 빠져 있으므로, **대시보드 섹션을 이 컴포넌트의 면 없는 규범대로 그리면 틀린다.** 실측.

  | 축 | 값 | 근거 |
  | --- | --- | --- |
  | 배경 | `var(--dashboard-chip-bg-strong)` | `shared.tsx:125` |
  | 테두리 | `1px solid var(--dashboard-input-border)` | `shared.tsx:126-127` |
  | 반경 | 12px (`--radius-12`, `tailwind.css:175`) | `shared.tsx:124` |
  | 패딩 | 20px (`p-10`, 격자 2px는 `tailwind.css:164`) | `shared.tsx:124` |
  | 블록 간격 | 6px (`gap-3`) | `shared.tsx:124` |
  | 제목 | `type-body-16-semibold` · `text-gray-000` | `shared.tsx:562` · `shared.tsx:137` |
  | 본문 | `type-body-14-regular` · `var(--dashboard-muted-color)`, 줄높이만 16 계열로 덮어쓴다 | `shared.tsx:565` · `shared.tsx:138-141` |
  | 그래픽 · 액션 | **없다** | `shared.tsx:554-568` |

  자식은 제목 span과 본문 span 둘뿐이다. **Anatomy의 Graphic·Action 슬롯을 대시보드에서 찾으면
  없다** — 여기서는 Title·Description만 사는 2슬롯 패널이다.

- **대시보드에서는 `error`와 `neutral`의 픽셀이 완전히 같다.** 오류 분기가 더하는 클래스 문자열이
  **빈 문자열**이다(`shared.tsx:132`). 원본 CSS의 오류 배경·테두리색은 특이도 싸움에서 져
  **원본에서도 그려지지 않던 죽은 선언**이었고, 제품은 분기만 남겼다(`shared.tsx:130-132`, 556-560행).
  아이콘도, 재시도 버튼도, 액센트 색도 없다. **두 톤을 색으로 구분해 그리면 배포본과 어긋난다** —
  구분은 문구가 혼자 진다. 이 컴포넌트가 「없음」과 「실패」를 가르기로 한 판단은 채택 목표이고,
  대시보드는 그 목표에 아직 도달하지 않은 반례다.
- **세로 여백이 리터럴이다.** 80px 소비처가 하나뿐이라 토큰으로 승격하지 않았다.
- **Figma는 액션의 추가 간격을 padding으로 만든다.** CSS는 액션에 `margin-block-start: 4px`를
  더해 앞 요소와 16px 떨어지는데, Figma auto-layout에는 자식별 간격이 없어 같은 4px을 Action
  프레임의 위쪽 padding으로 표현한다. 결과는 같고 표현이 다르다.
- **설명 폭이 Figma에서 근사다.** CSS는 `44ch`이고 Figma에 `ch` 단위가 없어 16px 기준 400px을 쓴다.

## Acceptance tests

1. 여백·간격·그래픽 크기·타이포가 `components.measured.json`과 같다.
2. **배경·배경 이미지·테두리·반경·그림자가 모두 없다.**
3. 제목이 heading이고 `headingLevel`이 태그를 바꾼다.
4. 그래픽·설명·액션이 모두 선택이며 없으면 DOM에도 없다.
5. 그래픽이 `aria-hidden="true"`다.
6. root에 `aria-live`도 `role`도 없다.
7. 제목이 `foreground-primary`, 설명이 `foreground-secondary`다.
