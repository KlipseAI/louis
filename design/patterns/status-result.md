---
id: status-result
status: experimental
authority: normative
---

# Status Result

결제·구독의 **결과 화면**이 공유하는 콘텐츠 컬럼이다 — 성공 · 실패 · 처리 중 · 결제수단 변경
결과 등 일곱 화면이 같은 뼈대를 쓴다.

**셸이 아니다.** 이 화면들은 [App Shell](app-shell.md)의 메인 카드 안에 들어간다. 이 문서가
소유하는 것은 **그 카드 안의 컬럼**이다.

값은 배포본 인용이며 아직 DS 토큰이 아니다. 간격 환산 기준은 제품의 `--spacing: 2px`다 —
`h-20`은 80px이 아니라 **40px**이다.

## Anatomy

| 부품 | 역할 |
| --- | --- |
| Column | `min(520px, 100%)` 가운데 컬럼. **세로 리듬이 하나뿐이다** |
| Title | `heading-36` medium |
| Description | `body-16` · 전경 56% |
| Alert | 실패 화면 전용 붉은 배너 |
| Meta list | `dt`/`dd` 행 목록. 900px에서 세로로 접힌다 |
| Actions | **전폭 버튼**이 세로로 쌓인다 |

## Layout contract

| 축 | 값 |
| --- | --- |
| 폭 | `min(520px, 100%)` |
| 정렬 | `align-self: center` |
| 배치 | `flex column` |
| 세로 간격 | **`24px` 하나뿐** — 부품마다 다른 간격을 두지 않는다 |
| 면 · 테두리 · 곡률 · 패딩 | **없다.** 컬럼은 투명하다 |

**컬럼 자체는 아무것도 그리지 않는다.** 면과 곡률은 바깥 메인 카드가 갖는다. 컬럼에 카드를 또
그리면 배포본에 없는 이중 면이 된다.

### 상단 오프셋이 상태에 따라 갈린다

| 상태 | 오프셋 |
| --- | --- |
| 기본 | `margin-top: clamp(56px, 10vh, 120px)` |
| 기본 (≤900px) | `56px` 고정 |
| **처리 중** | `margin-top: 0` · `flex: 1 1 auto` · `justify-content: center` |

**처리 중에는 위에서 밀지 않고 카드 안에서 세로 중앙에 온다.** 두 상태는 상호배타이며 같은
화면이 로딩에서 결과로 넘어갈 때 컬럼이 위로 올라붙는다.

## Specification

### Title · Description

| | 값 |
| --- | --- |
| 제목 | `heading-36` size · line-height · `--type-weight-medium` · 전경 `--gray-000` |
| 제목 줄바꿈 | `break-keep` + `overflow-wrap: break-word` |
| 설명 | `body-16` · 전경 `rgb(var(--gray-000-rgb) / 56%)` |
| 설명 줄바꿈 | `white-space: pre-line` — **문구의 줄바꿈이 그대로 살아난다** |

설명이 `pre-line`이므로 **문구에 든 개행이 렌더에 나타난다.** 문구를 한 줄로 합치면 화면이 달라진다.

### Alert (실패 전용)

| 축 | 값 |
| --- | --- |
| 패딩 | `12px 16px` |
| 곡률 | `12px` |
| 면 | `rgb(var(--accent-red-500-rgb) / 8%)` |
| 테두리 | `1px solid rgb(var(--accent-red-500-rgb) / 16%)` |
| 글자 | `--accent-red-500` · `body-14` |

**노드 인라인 오류 배너와 비율이 다르다.** 그쪽은 면 10% / 테두리 20% / 두께 0.5px이고 여기는
**면 8% / 테두리 16% / 두께 1px**이다. 두 자리를 한 값으로 통일하지 않는다.

### Meta list

| 축 | ~900px | ≥901px |
| --- | --- | --- |
| 행 배치 | `flex column` | `flex` · `justify-content: space-between` · `align-items: center` |
| 행 간격 | — | `16px` |
| 행 패딩 | `12px 0` | 같음 |
| 행 구분선 | `1px solid rgb(var(--gray-000-rgb) / 8%)` — **마지막 행은 없다** | 같음 |
| `dd` 정렬 | `text-align: left` | `text-align: right` |

| | `dt` (키) | `dd` (값) |
| --- | --- | --- |
| 크기 | `body-14` = 14px | `body-14` = 14px |
| 전경 | `rgb(var(--gray-000-rgb) / 48%)` | `--gray-000` |
| line-height 토큰 | `--type-body-16-line-height` | `--type-body-14-line-height` |
| **렌더 행간** | **21px** | **21px** |

**행간 토큰의 이름은 다르지만 렌더 결과는 같다.** 두 토큰 모두 값이 무단위 `1.5`이고 글자 크기가
둘 다 14px이므로 `14 × 1.5 = 21px`로 동일하다. **「키가 값보다 높은 행 박스를 갖는다」고 읽으면
틀린다** — 이름 차이는 실효가 없는 저작 흔적이다.

무단위 line-height는 **자기 요소의 글자 크기에 곱해진다.** 토큰 이름의 숫자(16)가 아니라 그
요소의 크기(14)가 기준이다.

### Actions

| 축 | 값 |
| --- | --- |
| 배치 | `flex` · `flex-wrap` · `gap: 10px` · `margin-top: 8px` |
| 버튼 폭 | **`width: 100%`** |
| 버튼 높이 | `40px` |
| 버튼 패딩 | `0 20px` |
| 버튼 곡률 | `12px` |
| 버튼 글자 | `body-14` · `--type-weight-regular` |
| 버튼 전환 | `background-color 140ms ease, transform 120ms ease, opacity 140ms ease` |

**버튼이 전폭이라 `flex-wrap`과 함께 세로로 쌓인다.** 가로로 나란히 놓이지 않는다 — 결과 화면의
액션은 나란한 한 쌍이 아니라 **위아래 목록**이다.

| | primary | secondary |
| --- | --- | --- |
| 면 | `--gray-000` | `rgb(var(--palette-gray-000-rgb) / 8%)` |
| 글자 | `--gray-900` | `--gray-000` |
| hover 면 | `rgb(var(--gray-000-rgb) / 90%)` | `rgb(var(--palette-gray-000-rgb) / 14%)` |
| active 면 | `rgb(var(--gray-000-rgb) / 82%)` | `rgb(var(--palette-gray-000-rgb) / 18%)` |
| active 변형 | `scale(0.98)` | 같음 |

**secondary만 팔레트 잉크를 쓴다.** primary는 시맨틱 `--gray-000`이라 테마에서 뒤집히고
secondary는 `--palette-gray-000`이라 **양쪽 테마에서 흰 잉크로 고정**된다. 한쪽으로 통일하면
한 테마에서 면이 사라진다.

## 아직 토큰이 없는 축

| 축 | 값 |
| --- | --- |
| 컬럼 폭 | `min(520px, 100%)` |
| 상단 오프셋 | `clamp(56px, 10vh, 120px)` (≤900px `56px`) |
| 컬럼 세로 간격 | `24px` |
| 액션 간격 | `10px` |
| 900px 분기 | 이 화면 전용 — 셸의 719px과 **다른 경계다** |

**900px은 셸의 경계가 아니다.** [Responsive & Layout](../foundations/responsive-layout.md)의 승인된
경계에 없는 값이며 이 화면 계열이 자기 용도로 둔 것이다. 셸 경계로 착각하면 다른 화면까지 접힌다.

## Accessibility

- **메타 목록은 `<dl>`/`<dt>`/`<dd>`다.** 키–값 쌍이므로 표가 아니라 정의 목록이며, 900px에서
  세로로 접혀도 쌍의 연결이 유지된다.
- **처리 중 상태가 진행률을 주지 않는다.** 남은 시간을 모르므로 determinate progress를 쓰지 않고,
  상태 문구가 진행 사실을 전한다 — [Loading](loading.md)의 「완료 시간을 모름」 갈래다.
- 설명이 `white-space: pre-line`이라 **문구의 개행이 그대로 읽힌다.** 문장을 개행으로 끊으면
  스크린 리더의 호흡도 함께 끊긴다.
- 액션이 전폭 세로 목록이므로 **탭 순서가 시각 순서와 같다.** 가로 배치에서 생기는 어긋남이 없다.
- 실패 화면의 붉은 배너는 **색만으로 전달하지 않는다** — 문구가 실패 사유를 담는다.

## Acceptance tests

1. 컬럼이 `520px`을 넘지 않고 가운데 정렬된다. 컬럼 자체에 면·테두리가 없다.
2. 부품 사이 간격이 전부 `24px` 하나다.
3. 처리 중에는 컬럼이 위에서 밀리지 않고 카드 안 세로 중앙에 온다.
4. 메타 행의 마지막 구분선이 없다.
5. `dt`와 `dd`의 렌더 행간이 **같다**(각 21px).
6. 액션 버튼이 전폭이라 세로로 쌓인다.
7. 900px에서 메타 행이 세로로 접히고 `dd`가 좌측 정렬된다.

## Pre-implementation blockers

- **900px 경계를 승인할 것인가.** 셸 경계와 다른 값이라 responsive matrix에 별도 축으로 올릴지
  이 화면 전용 예외로 둘지 정해야 한다.
- **secondary 액션이 팔레트 잉크를 쓰는 것을 계약으로 둘 것인가.** 시맨틱으로 바꾸면 한 테마에서
  면이 사라지므로 값 그대로 옮기되 이유를 남겨야 한다.

## 승격 조건

- 위 두 blocker가 닫힌다.
- 컬럼 폭 · 세로 간격 · 상단 오프셋이 semantic token으로 선다.
- 그 전까지 이 문서의 값은 **제품 인용**이며 DS 계약이 아니다.
