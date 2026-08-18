---
id: loading
status: beta
authority: normative
---

# Loading

로딩 UI는 사용자가 **무엇을 기다리는지, 얼마나 진행됐는지, 실패하면 무엇을 할 수 있는지** 이해하게
해야 한다. 모든 진행 상태를 spinner 하나로 처리하지 않는다.

## 선택 기준

| 상황                                 | 기본 표현                            | 이유                                           |
| ------------------------------------ | ------------------------------------ | ---------------------------------------------- |
| 버튼·짧은 인라인 액션                | `InlineLoadingLabel`                 | 액션이 시작됐고 중복 입력이 막혔음을 바로 전달 |
| 작은 독립 영역, 완료 시간을 모름     | `LoadingSpinner` + 짧은 문구         | 레이아웃을 예측할 필요가 없음                  |
| 구조가 정해진 카드·목록의 첫 로드    | Skeleton                             | 나타날 콘텐츠 구조를 미리 전달                 |
| 업로드·다운로드·렌더처럼 진행률을 앎 | Determinate progress                 | 남은 정도를 설명할 수 있음                     |
| 장시간 백그라운드 작업               | 지속 상태 + 진행/취소/다른 작업 허용 | 사용자를 화면에 묶어 두지 않음                 |

시머 텍스트는 기존 목록 화면의 관측 패턴이다. 신규 패턴으로 확장하기 전에 Skeleton 또는 Spinner로
같은 목적을 더 명확히 해결할 수 있는지 먼저 검토한다.

## 시간과 피드백

- 매우 짧은 응답은 불필요한 깜빡임을 만들지 않도록 표시를 지연할 수 있다. 공통 threshold는 P2 motion
  결정 전까지 package에 하드코딩하지 않는다.
- 4초를 넘길 가능성이 있으면 `처리 중` 같은 구체적 상태 문구를 함께 제공한다.
- 10초 이상이면 현재 단계, 실패 가능성, 재시도 또는 취소 방법을 제공한다.
- 1분 이상이면 백그라운드 처리와 화면 이탈 후 재확인 경로를 우선 검토한다.

## 생명주기

1. **Start** — 입력을 수락하고 중복 실행을 차단한다. 해당 컨트롤에 `aria-busy`를 제공한다.
2. **Progress** — 작업 대상과 상태를 유지한다. 진행률을 알면 determinate UI를 쓴다.
3. **Success** — 결과가 화면 자체로 분명하면 별도 성공 Toast를 중복해서 띄우지 않는다.
4. **Failure** — 원인, 영향, 다음 행동을 해당 영역 가까이에 제공한다. 재시도 가능 여부를 명시한다.
5. **Cancel** — 취소가 가능한 긴 작업은 진행 상태 안에서 직접 취소할 수 있게 한다.

## 문구

- `생성 중`, `업로드 중`, `Analyzing`처럼 상태를 구체적으로 쓴다.
- 진행 문구 끝의 `...`/`…`는 사용하지 않는다.
- `Loading` 같은 범용 접근성 라벨 대신 화면의 i18n 문구를 제공한다.
- 실패 문구는 `오류가 발생했습니다`로 끝내지 않고 사용자가 할 수 있는 다음 행동을 포함한다.

## Accessibility

- 독립 Spinner는 `role="status"`, `aria-live="polite"`, `aria-busy="true"`와 문맥별 이름을 가진다.
- 인접 텍스트가 상태를 설명하면 Spinner는 `decorative`로 두고 부모가 접근 가능한 이름을 소유한다.
- Skeleton은 장식으로 숨기고, 실제 로딩 영역이 `aria-busy`를 소유한다.
- `prefers-reduced-motion: reduce`에서는 회전·shimmer를 정적 상태로 바꾸되 로딩 의미는 텍스트로
  유지한다.
- 로딩 중 기존 콘텐츠를 제거해 포커스가 예기치 않게 사라지지 않게 한다.

## Implementation status

Web과 Figma 구현은 아직 `not-ready`다. 기존 제품의 spinner, inline loading, skeleton/shimmer 근거는
[`KP-LOADING-001`](../../migration/product-baseline.md)에 비규범 기준선으로 보존한다.

## Pre-implementation blockers

- 공용 Spinner, Skeleton과 Button loading API가 없다.
- live region과 `aria-busy` 조합 test가 없다.
- reduced-motion recipe와 progress semantics가 package로 배포되지 않는다.
- published Figma loading state가 없다.

## Acceptance tests

- 승인된 delay threshold 안의 짧은 작업에서 불필요한 flash가 없고, 지연 후에는 무엇을 기다리는지
  이름이 보인다.
- loading 중 중복 activation이 차단되며 기존 focus가 제거되지 않는다.
- indeterminate와 determinate 상태가 screen reader에 중복 없이 전달된다.
- 실패 시 loading UI가 사라지고 오류, retry 또는 cancel 경로가 제공된다.
- Skeleton은 접근성 트리에서 숨고 실제 영역이 `aria-busy`를 소유한다.
- reduced-motion에서 회전·shimmer를 제거해도 텍스트로 상태를 이해할 수 있다.
- 200% zoom과 KO/EN/JA 긴 문구에서 상태와 핵심 action이 잘리지 않는다.

## 구현 (2026-08-18)

**새 CSS가 없다.** 이 패턴은 컴포넌트가 아니라 **경계**다 — 무엇을 언제 쓰는가와 누가 로딩을
알리는가를 정한다. 부품은 [Spinner](../components/spinner.md)와
[Skeleton](../components/skeleton.md)이 이미 소유한다.

### 무엇을 쓰는가

| 자리 | 쓰는 것 | 왜 |
| --- | --- | --- |
| 올 내용의 **모양을 아는** 곳 | Skeleton | 목록 행·카드 격자·프로필 머리. 도착했을 때 화면이 튀지 않는다 |
| 모양을 **모르는** 곳 | Spinner | 버튼 안, 짧은 동작. 틀린 자리표시는 없는 것보다 나쁘다 |
| 진행률을 **아는** 곳 | 아직 없다 | determinate progress는 카탈로그에 없다. 접근성 계약이 선행이다 |

### 누가 로딩을 알리는가

**영역이 알린다. 자리표시는 장식이다.**

```tsx
<section aria-busy={loading} aria-label="프로젝트 목록">
  {loading ? <Skeleton … /> : <ProjectList … />}
</section>
```

Spinner와 Skeleton은 스스로 읽히지 않는다. 스켈레톤이 여덟 개 놓인 자리에서 각각이 읽히면
같은 말이 여덟 번 들린다. **한 영역이 한 번 말한다.**

끝나면 `aria-busy`가 내려가고 자리표시가 사라진다. 자리표시를 남긴 채 내용을 덧그리지 않는다.

### reduced-motion

Spinner와 Skeleton 모두 반복이 **1회로 끝난다**(DS-D-0016 — loop는 짧아지는 것이 아니라
사라진다). 로딩 중이라는 뜻은 `aria-busy`와 면이 유지하며 움직임이 그 뜻을 만드는 것이 아니다.

### Acceptance tests

1. 자리표시는 전부 `aria-hidden`이고 영역이 `aria-busy`를 갖는다.
2. 끝나면 `aria-busy`가 내려가고 자리표시가 사라진다.
3. 모양을 아는 자리와 모르는 자리가 서로 다른 것을 쓴다.
4. reduced-motion에서 Spinner·Skeleton 모두 반복이 1회다.
5. 합성에 접근성 위반이 없다.

### 남은 것

determinate progress. 인계서 (1c)가 "접근성 계약부터 정해야 한다"로 남겨 두었고 제품 전체에
`role="progressbar"`가 1곳뿐이다. 그것이 서기 전까지 이 패턴은 두 갈래만 소유한다.
